[CmdletBinding()]
param(
    [Parameter(Mandatory)][ValidatePattern('^[a-z][a-z0-9-]+$')][string]$Project,
    [Parameter(Mandatory)][ValidatePattern('^[a-z]+-[a-z]+[0-9]+$')][string]$Region
)

$ErrorActionPreference = 'Stop'
$repositoryRoot = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '../..')).Path
$required = @('SUPABASE_URL', 'SUPABASE_PUBLISHABLE_KEY', 'SUPABASE_SECRET_KEY', 'SUPABASE_DB_PASSWORD',
    'SUPABASE_DB_HOST', 'SUPABASE_DB_USER', 'SUPABASE_PROJECT_REF', 'SUPABASE_DB_CA_PATH')
foreach ($name in $required) {
    if ([string]::IsNullOrWhiteSpace([Environment]::GetEnvironmentVariable($name))) {
        throw "Configuration requise : $name"
    }
}
if ($env:SUPABASE_DB_HOST -notmatch '^[a-z0-9-]+\.pooler\.supabase\.com$' -or
    $env:SUPABASE_PROJECT_REF -notmatch '^[a-z]{20}$' -or
    $env:SUPABASE_DB_USER -cne "postgres.$($env:SUPABASE_PROJECT_REF)" -or
    $env:SUPABASE_URL -cne "https://$($env:SUPABASE_PROJECT_REF).supabase.co") {
    throw 'La connexion Supabase doit cibler le pooler de session du projet attendu.'
}

$modules = @('identity', 'media', 'catalogue', 'assessment', 'learning', 'tracking', 'api-gateway')
$databaseModules = $modules | Where-Object { $_ -ne 'api-gateway' }
$origins = @{}
$roles = @{}
$registry = "$Region-docker.pkg.dev"
$appHost = 'https://linguacap.emichfer.org'
$caPath = (Resolve-Path -LiteralPath $env:SUPABASE_DB_CA_PATH).Path
if (!([IO.File]::ReadAllText($caPath).StartsWith('-----BEGIN CERTIFICATE-----'))) {
    throw 'Utilisez le certificat racine fourni par Supabase.'
}

function Cloud {
    $result = & gcloud.cmd @args "--project=$Project" --quiet
    if ($LASTEXITCODE -ne 0) { throw "Commande Google Cloud en echec : $($args[0]) $($args[1])" }
    $result
}

function Get-Secret([string]$Name) {
    if ($Name -in $script:secretNames) {
        return (Cloud secrets versions access latest "--secret=$Name").Trim()
    }
    $bytes = New-Object byte[] 32
    $random = [Security.Cryptography.RandomNumberGenerator]::Create()
    try { $random.GetBytes($bytes) } finally { $random.Dispose() }
    $value = [BitConverter]::ToString($bytes).Replace('-', '').ToLowerInvariant()
    Write-Secret $Name $value
    return $value
}

function Write-Secret([string]$Name, [string]$Value) {
    if ($Name -notin $script:secretNames) {
        Cloud secrets create $Name '--replication-policy=automatic' '--format=none' | Out-Null
        $script:secretNames += $Name
    }
    $secretPath = [IO.Path]::GetTempFileName()
    try {
        [IO.File]::WriteAllText($secretPath, $Value, [Text.UTF8Encoding]::new($false))
        Cloud secrets versions add $Name "--data-file=$secretPath" '--format=none' | Out-Null
    } finally {
        Remove-Item -LiteralPath $secretPath -Force
    }
}

function Grant-Secret([string]$Name, [string]$Account) {
    $parameters = @('secrets','add-iam-policy-binding',$Name,"--member=serviceAccount:$Account",
        '--role=roles/secretmanager.secretAccessor','--format=none')
    Cloud @parameters | Out-Null
}

function Allow-Call([string]$Target, [string]$Caller) {
    $parameters = @('run','services','add-iam-policy-binding',"linguacap-$Target","--region=$Region",
        "--member=serviceAccount:$($roles[$Caller])",'--role=roles/run.invoker','--format=none')
    Cloud @parameters | Out-Null
}

foreach ($module in $modules) {
    $release = Join-Path $repositoryRoot "services/$module/target/quarkus-app"
    if (!(Test-Path -LiteralPath (Join-Path $release 'quarkus-run.jar'))) {
        throw "Image Quarkus a compiler : $module"
    }
    $saName = "linguacap-$module"
    $account = "$saName@$Project.iam.gserviceaccount.com"
    $roles[$module] = $account
}
$existing = @(Cloud iam service-accounts list '--format=value(email)')
foreach ($module in $modules) {
    if ($roles[$module] -notin $existing) {
        for ($attempt = 0; $attempt -lt 3; $attempt++) {
            $creation = & {
                $ErrorActionPreference = 'Continue'
                $output = & gcloud.cmd iam service-accounts create "linguacap-$module" "--display-name=LinguaCap $module" "--project=$Project" --quiet 2>&1
                @{ ExitCode = $LASTEXITCODE; Text = $output -join ' ' }
            }
            if ($creation.ExitCode -eq 0) { break }
            if ($attempt -eq 2 -or $creation.Text -notmatch 'RESOURCE_EXHAUSTED|quota has been reached') {
                throw "Compte Cloud Run indisponible : $module. $($creation.Text)"
            }
            Write-Host 'Quota IAM par minute atteint. Nouvelle tentative dans 60 secondes.'
            Start-Sleep -Seconds 60
        }
    }
}

$script:secretNames = @(Cloud secrets list '--format=value(name)')
Write-Secret 'linguacap-supabase-key' $env:SUPABASE_SECRET_KEY
Get-Secret 'linguacap-edge-secret' | Out-Null
Get-Secret 'linguacap-internal-secret' | Out-Null
foreach ($module in $modules) { Grant-Secret 'linguacap-internal-secret' $roles[$module] }
Grant-Secret 'linguacap-edge-secret' $roles['api-gateway']
Grant-Secret 'linguacap-supabase-key' $roles['identity']

$sql = foreach ($module in $databaseModules) {
    $password = Get-Secret "linguacap-db-$module"
    if ($password -notmatch '^[a-f0-9]{64}$') { throw "Secret SQL inattendu pour $module" }
    Grant-Secret "linguacap-db-$module" $roles[$module]
    $role = "lingua_$module"
    'DO $$ BEGIN CREATE ROLE ' + $role + ' LOGIN; EXCEPTION WHEN duplicate_object THEN NULL; END $$;'
    "ALTER ROLE $role PASSWORD '$password';"
}
$sql = ($sql -join [Environment]::NewLine) + [Environment]::NewLine + [IO.File]::ReadAllText((Join-Path $PSScriptRoot 'db-grants.sql'))
$priorPgPassword = $env:PGPASSWORD
try {
    $env:PGPASSWORD = $env:SUPABASE_DB_PASSWORD
    $pgArgs = @('run','--rm','-i','-e','PGPASSWORD','-e','PGSSLMODE=verify-full','-e','PGSSLROOTCERT=/cert/supabase.crt',
        '--mount',"type=bind,source=$caPath,target=/cert/supabase.crt,readonly",'postgres:16',
        'psql','-X','-q','-v','ON_ERROR_STOP=1','--host',$env:SUPABASE_DB_HOST,'--port','5432',
        '--username',$env:SUPABASE_DB_USER,'--dbname','postgres')
    $sql | docker @pgArgs
    if ($LASTEXITCODE -ne 0) { throw 'La configuration des roles PostgreSQL a echoue.' }
} finally {
    $env:PGPASSWORD = $priorPgPassword
}

Cloud auth print-access-token | docker login "https://$registry" --username oauth2accesstoken --password-stdin
if ($LASTEXITCODE -ne 0) { throw 'Connexion au registre Docker refusee.' }
$tag = (git -C $repositoryRoot rev-parse --short HEAD).Trim() + '-' + (Get-Date -Format 'yyyyMMddHHmmss')
$dependsOn = @{
    # Catalogue publie les fichiers d'un parcours ; Apprentissage obtient les adresses temporaires des supports.
    identity = @(); media = @('identity'); catalogue = @('identity', 'media');
    learning = @('identity', 'catalogue', 'assessment', 'media');
    # Évaluations lit le parcours chez Apprentissage, lui signale remises et résultats et dépose l'oral par Médias.
    assessment = @('identity', 'catalogue', 'learning', 'media');
    tracking = @('identity', 'learning'); 'api-gateway' = $databaseModules
}

# Apprentissage et Évaluations s'appellent l'un l'autre : l'adresse d'un service pas encore déployé est
# ajoutée après coup, une fois tous les services en ligne.
$deferred = @()
foreach ($module in $modules) {
    $service = "linguacap-$module"
    $release = Join-Path $repositoryRoot "services/$module/target/quarkus-app"
    if ($module -in $databaseModules) { Copy-Item -LiteralPath $caPath -Destination (Join-Path $release 'supabase-ca.crt') }
    $image = "$registry/$Project/linguacap/$($module):$tag"
    docker build --platform linux/amd64 --tag $image --file (Join-Path $repositoryRoot 'services/Dockerfile') $release
    if ($LASTEXITCODE -ne 0) { throw "Construction de l'image en echec : $module" }
    docker push $image
    if ($LASTEXITCODE -ne 0) { throw "Publication de l'image en echec : $module" }

    $variables = @('LINGUACAP_CLOUD_RUN=true')
    $secrets = @('LINGUACAP_INTERNAL_SECRET=linguacap-internal-secret:latest')
    foreach ($dependency in $dependsOn[$module]) {
        if ($origins[$dependency]) {
            $variables += "$($dependency.ToUpperInvariant())_URL=$($origins[$dependency])"
        } else {
            $deferred += ,@($module, $dependency)
        }
    }
    if ($module -in @('identity', 'media', 'api-gateway')) { $variables += "SUPABASE_URL=$env:SUPABASE_URL" }
    if ($module -in @('media', 'api-gateway')) { $variables += "SUPABASE_PUBLISHABLE_KEY=$env:SUPABASE_PUBLISHABLE_KEY" }
    if ($module -eq 'identity') {
        $variables += "SITE_URL=$appHost/activer-compte"
        $secrets += 'SUPABASE_SECRET_KEY=linguacap-supabase-key:latest'
    }
    $invocation = '--no-allow-unauthenticated'
    if ($module -eq 'api-gateway') {
        $secrets += 'API_ORIGIN_SECRET=linguacap-edge-secret:latest'
        $invocation = '--allow-unauthenticated'
    } else {
        $variables += "DB_USER=lingua_$module.$env:SUPABASE_PROJECT_REF"
        $variables += "DB_JDBC_URL=jdbc:postgresql://$($env:SUPABASE_DB_HOST):5432/postgres?sslmode=verify-full&sslrootcert=/opt/linguacap/supabase-ca.crt"
        $secrets += "DB_PASSWORD=linguacap-db-$($module):latest"
    }
    $envFile = [IO.Path]::GetTempFileName()
    try {
        $variableMap = @{}
        foreach ($variable in $variables) {
            $key, $value = $variable -split '=', 2
            $variableMap[$key] = $value
        }
        [IO.File]::WriteAllText($envFile, ($variableMap | ConvertTo-Json -Compress), [Text.UTF8Encoding]::new($false))
        $deploy = @('run','deploy',$service,"--region=$Region","--image=$image","--service-account=$($roles[$module])",
            '--min-instances=0','--max-instances=1','--cpu=1','--memory=512Mi','--concurrency=20','--timeout=20s',
            "--env-vars-file=$envFile","--set-secrets=$($secrets -join ',')",$invocation,'--format=none')
        Cloud @deploy | Out-Null
    } finally {
        Remove-Item -LiteralPath $envFile -Force
    }
    $origins[$module] = (Cloud run services describe $service "--region=$Region" '--format=value(status.url)').Trim()
    foreach ($dependency in $dependsOn[$module]) { if ($origins[$dependency]) { Allow-Call $dependency $module } }
    Write-Host "Service deploye : $module"
}

foreach ($link in $deferred) {
    $module, $dependency = $link
    Cloud run services update "linguacap-$module" "--region=$Region" `
        "--update-env-vars=$($dependency.ToUpperInvariant())_URL=$($origins[$dependency])" '--format=none' | Out-Null
    Allow-Call $dependency $module
    Write-Host "Appel ajoute : $module vers $dependency"
}

Write-Host "Passerelle : $($origins['api-gateway'])"
