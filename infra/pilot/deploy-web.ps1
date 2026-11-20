[CmdletBinding()]
param(
    [Parameter(Mandatory)][ValidatePattern('^[a-z][a-z0-9-]+$')][string]$Project,
    [Parameter(Mandatory)][ValidatePattern('^[a-z]+-[a-z]+[0-9]+$')][string]$Region
)

$ErrorActionPreference = 'Stop'
$root = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '../..')).Path
$version = (git -C $root rev-parse HEAD).Trim()
$published = git -C $root ls-remote --heads origin production
if (($published -split '\s+')[0] -ne $version -or (git -C $root status --porcelain)) {
    throw 'Publiez la version courante sur production et utilisez un dossier de travail propre.'
}
$upstream = (& gcloud.cmd run services describe linguacap-api-gateway "--project=$Project" "--region=$Region" '--format=value(status.url)').Trim()
if ($LASTEXITCODE -ne 0 -or $upstream -notmatch '^https://[a-z0-9.-]+\.run\.app$') {
    throw 'URL de passerelle Cloud Run introuvable.'
}
$secret = (& gcloud.cmd secrets versions access latest '--secret=linguacap-edge-secret' "--project=$Project").Trim()
if ($LASTEXITCODE -ne 0 -or $secret -notmatch '^[a-f0-9]{64}$') { throw 'Secret de liaison indisponible.' }
$secretsFile = Join-Path ([IO.Path]::GetTempPath()) ('linguacap-worker-' + [Guid]::NewGuid().ToString('N') + '.json')
try {
    [IO.File]::WriteAllText($secretsFile, (@{ API_ORIGIN_SECRET = $secret } | ConvertTo-Json -Compress), [Text.UTF8Encoding]::new($false))
    Push-Location -LiteralPath (Join-Path $root 'linguacap-react')
    try {
        npm.cmd run build:integration
        if ($LASTEXITCODE -ne 0) { throw 'La compilation du frontend a echoue.' }
        npx.cmd --yes wrangler deploy --config ../workers/web-proxy/wrangler.jsonc --var "API_UPSTREAM:$upstream" --secrets-file $secretsFile
        if ($LASTEXITCODE -ne 0) { throw 'Le deploiement Cloudflare a echoue.' }
    } finally {
        Pop-Location
    }
} finally {
    if (Test-Path -LiteralPath $secretsFile -PathType Leaf) { Remove-Item -LiteralPath $secretsFile -Force }
}
