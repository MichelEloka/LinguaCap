#!/usr/bin/env bash
set +x
set -euo pipefail

fail() {
  printf '%s\n' "$1" >&2
  exit 1
}

: "${SERVICE:?SERVICE requis}"
: "${GOOGLE_CLOUD_PROJECT:?GOOGLE_CLOUD_PROJECT requis}"
: "${REGION:?REGION requise}"
: "${GIT_SHA:?GIT_SHA requis}"

case "$SERVICE" in
  api-gateway|identity|catalogue|media|learning|assessment|tracking) ;;
  *) fail "Service LinguaCap inconnu : $SERVICE" ;;
esac

repository="${ARTIFACT_REPOSITORY:-linguacap}"
[[ "$GOOGLE_CLOUD_PROJECT" =~ ^[a-z][a-z0-9-]{4,28}[a-z0-9]$ ]] \
  || fail 'Identifiant de projet Google Cloud invalide.'
[[ "$REGION" =~ ^[a-z]+-[a-z]+[0-9]+$ ]] || fail 'Région Cloud Run invalide.'
[[ "$repository" =~ ^[a-z][a-z0-9_-]*$ ]] || fail 'Dépôt Artifact Registry invalide.'
[[ "$GIT_SHA" =~ ^[0-9a-f]{40}$ ]] || fail 'GIT_SHA doit être un SHA Git complet.'
if [[ -n "${DEPLOYER_SERVICE_ACCOUNT:-}" ]]; then
  [[ "$DEPLOYER_SERVICE_ACCOUNT" =~ ^[a-z][a-z0-9-]+@[a-z][a-z0-9-]+\.iam\.gserviceaccount\.com$ ]] \
    || fail 'Compte de déploiement Google Cloud invalide.'
fi

for tool in git java unzip docker gcloud jq curl openssl; do
  command -v "$tool" >/dev/null || fail "Outil requis : $tool"
done

repo_root="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../.." && pwd)"
cd -- "$repo_root"
[[ "$(git rev-parse HEAD)" == "$GIT_SHA" ]] || fail 'Le dépôt ne correspond pas au commit à livrer.'
git diff --quiet HEAD -- || fail 'Le dépôt contient des modifications suivies non incluses dans le commit.'

service="linguacap-$SERVICE"
registry="$REGION-docker.pkg.dev"
image="$registry/$GOOGLE_CLOUD_PROJECT/$repository/$SERVICE"
tag="ci-${GIT_SHA:0:7}-$RANDOM"
revision_suffix="$tag-$(date -u +%s)"
revision="$service-$revision_suffix"

cloud() {
  gcloud "$@" --project="$GOOGLE_CLOUD_PROJECT" --quiet
}

describe_service() {
  cloud run services describe "$service" --region="$REGION" --format='json(status.url,status.traffic)'
}

traffic_map() {
  jq -er '
    [.status.traffic[]? | select((.percent // 0) > 0)]
    | group_by(.revisionName)
    | map({name: .[0].revisionName, percent: (map(.percent) | add)})
    | if (length > 0 and (map(.percent) | add) == 100
          and all(.[]; (.name // "") | test("^[a-z0-9-]+$")))
      then map("\(.name)=\(.percent)") | join(",")
      else error("Répartition de trafic introuvable ou incomplète")
      end
  '
}

is_run_url() {
  [[ "$1" =~ ^https://[a-z0-9-]+(\.[a-z0-9-]+)*\.run\.app$ ]]
}

existing="$(describe_service)"
service_url="$(jq -er '.status.url' <<< "$existing")"
is_run_url "$service_url" || fail 'Adresse Cloud Run canonique invalide.'

work_dir="$(mktemp -d "${TMPDIR:-/tmp}/linguacap-deploy.XXXXXXXX")"
tag_attempted=0
rollback_required=0
rollback_traffic=''

cleanup() {
  local result=$?
  trap - EXIT INT TERM

  if (( rollback_required )); then
    if cloud run services update-traffic "$service" --region="$REGION" \
        --to-revisions="$rollback_traffic" --format=none; then
      printf '%s\n' "Trafic restauré pour $service sur $rollback_traffic." >&2
    else
      printf '%s\n' "Retour arrière en échec pour $service. Trafic à restaurer : $rollback_traffic." >&2
      result=1
    fi
  fi

  if (( tag_attempted )); then
    if ! cloud run services update-traffic "$service" --region="$REGION" \
        --remove-tags="$tag" --format=none; then
      printf '%s\n' "Étiquette de recette à retirer manuellement sur $service : $tag" >&2
      result=1
    fi
  fi

  case "$work_dir" in
    "${TMPDIR:-/tmp}"/linguacap-deploy.*) rm -r -- "$work_dir" ;;
  esac
  exit "$result"
}
trap cleanup EXIT
trap 'exit 130' INT
trap 'exit 143' TERM

printf '%s\n' "Construction de $service depuis $GIT_SHA."
services/mvnw -B -ntp -f services/pom.xml -pl "$SERVICE" -am clean package -DskipTests
release="$repo_root/services/$SERVICE/target/quarkus-app"
[[ -f "$release/quarkus-run.jar" ]] || fail "Image JVM Quarkus absente pour $SERVICE."
mkdir -- "$work_dir/context"
cp -a -- "$release/." "$work_dir/context/"
if [[ "$SERVICE" != api-gateway ]]; then
  bundle="$repo_root/infra/ci/supabase-prod-ca.pem"
  [[ -f "$bundle" ]] || fail 'Le certificat racine Supabase versionné est manquant.'
  openssl crl2pkcs7 -nocrl -certfile "$bundle" | openssl pkcs7 -print_certs -noout >/dev/null
  cp -- "$bundle" "$work_dir/context/supabase-ca.crt"
fi

# Garder la configuration Docker du runner : le builder Buildx préparé par le workflow y est enregistré.
cloud auth configure-docker "$registry"
docker buildx build --platform linux/amd64 --push \
  --label "org.opencontainers.image.revision=$GIT_SHA" \
  --tag "$image:$revision_suffix" --metadata-file "$work_dir/image.json" \
  --file services/Dockerfile "$work_dir/context"
digest="$(jq -er '."containerimage.digest" | select(test("^sha256:[0-9a-f]{64}$"))' "$work_dir/image.json")"

prior="$(describe_service)"
rollback_traffic="$(traffic_map <<< "$prior")"
jq -e --arg tag "$tag" 'all(.status.traffic[]?; .tag != $tag)' <<< "$prior" >/dev/null \
  || fail "L’étiquette de recette existe déjà sur $service."

smoke_token="${CLOUD_RUN_SMOKE_TOKEN:-}"
if [[ -z "$smoke_token" ]]; then
  token_args=("--audiences=$service_url")
  if [[ -n "${DEPLOYER_SERVICE_ACCOUNT:-}" ]]; then
    token_args+=("--impersonate-service-account=$DEPLOYER_SERVICE_ACCOUNT" --include-email)
  fi
  smoke_token="$(cloud auth print-identity-token "${token_args[@]}")"
fi
[[ "$smoke_token" =~ ^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$ ]] \
  || fail 'Jeton OIDC de recette Cloud Run invalide.'

smoke() {
  local url="$1" stage="$2" status
  for attempt in {1..6}; do
    if status="$(printf 'Authorization: Bearer %s\n' "$smoke_token" \
        | curl --silent --show-error --proto '=https' --connect-timeout 5 --max-time 25 \
          --header @- --header 'Accept: application/json' --output "$work_dir/readiness.json" \
          --write-out '%{http_code}' "$url/q/health/ready")" \
        && [[ "$status" = 200 ]] \
        && jq -e '.status == "UP"' "$work_dir/readiness.json" >/dev/null; then
      return 0
    fi
    if (( attempt < 6 )); then
      sleep 3
    fi
  done
  fail "Sonde de disponibilité en échec pour $service ($stage)."
}

tag_attempted=1
cloud run services update "$service" --region="$REGION" --image="$image@$digest" \
  --revision-suffix="$revision_suffix" --no-traffic --tag="$tag" --format=none

candidate="$(describe_service)"
candidate_url="$(jq -er --arg tag "$tag" --arg revision "$revision" '
  [.status.traffic[]? | select(.tag == $tag and .revisionName == $revision and (.percent // 0) == 0)]
  | if length == 1 then .[0].url else error("Révision de recette introuvable") end
' <<< "$candidate")"
is_run_url "$candidate_url" || fail 'Adresse Cloud Run de recette invalide.'
[[ "${candidate_url#https://}" == "$tag---"* ]] || fail 'Étiquette de recette Cloud Run inattendue.'
smoke "$candidate_url" 'révision à 0 %'

current_traffic="$(describe_service | traffic_map)"
[[ "$current_traffic" == "$rollback_traffic" ]] \
  || fail "Le trafic de $service a changé pendant la recette. Reprenez le déploiement après vérification."

# Rétablir le trafic précédent si la promotion ou la vérification finale échoue.
rollback_required=1
cloud run services update-traffic "$service" --region="$REGION" \
  --to-revisions="$revision=100" --format=none
[[ "$(describe_service | traffic_map)" == "$revision=100" ]] \
  || fail "La révision $revision ne reçoit pas tout le trafic prévu."
smoke "$service_url" 'URL de service après promotion'
rollback_required=0

printf '%s\n' "Déployé : $service · $revision · $image@$digest"
