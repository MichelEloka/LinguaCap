# LinguaCap · Première intégration

Le pilote relie le frontend React, sept applications Quarkus, Supabase et le Worker Cloudflare. Les six services métier possèdent leurs schémas PostgreSQL et leurs propres droits d’exécution. Le Worker transmet les appels `/api/v1` à la passerelle. Les services privés utilisent les identités Cloud Run pour communiquer. Supabase Auth émet les sessions. Supabase Storage fournit des liens temporaires pour les médias pédagogiques.

## Recette locale

Utiliser JDK 21 (`.java-version`), Node.js 24 (`.nvmrc`) et Docker. Maven est fourni par le wrapper `services/mvnw` (`services\mvnw.cmd` sous Windows), qui télécharge et vérifie la version épinglée. Depuis la racine du dépôt, lancer les commandes suivantes avec les services locaux Supabase.

```sh
npm ci --prefix linguacap-react
npx supabase start
npx supabase migration up
services/mvnw -B -ntp -f services/pom.xml package
node infra/pilot/run-local.mjs
```

`supabase start` charge aussi `supabase/seed.sql` : des profils, objectifs, résultats et encouragements fictifs, sans compte de connexion. `supabase db reset` les recrée à l’identique.

Le serveur de recette ouvre `http://127.0.0.1:5186` et la passerelle écoute sur le port 8080. Le lanceur utilise les URL et les identifiants de Supabase local. Il crée les six rôles SQL locaux et importe l’image et le son du cours A1. Éviter d’exécuter deux instances du lanceur sur la même base locale, car il régénère les mots de passe SQL de la recette.

Dans un autre terminal, `node infra/pilot/smoke.mjs` crée des comptes de test confirmés dans Supabase local. La recette vérifie l’invitation par Mailpit, l’activation, la lecture des deux médias privés, l’objectif intensif, la correction idempotente, la visibilité du résultat pour le professeur référent et la lecture d’un encouragement. Elle vérifie également que l’accès d’un autre professeur est refusé et que chaque rôle SQL `lingua_*` reste limité à son schéma ([db-isolation.sql](db-isolation.sql)). Ajouter `--browser` pour valider aussi l’écran élève sur mobile avec Playwright après avoir installé Chromium.

Depuis les cours B1 et B2 (phase 1), la recette importe les trois niveaux construits (`content/de/a1`, `a2`, `b1` ; elle s’arrête si le B1 n’est pas généré) et chronomètre l’import. Elle vérifie les niveaux dynamiques : route publique `GET /public/languages` sans session (A1, A2 et B1 publiés, mise en cache cinq minutes), `GET /languages` (position, prérequis, paliers du test publié, B2 en brouillon), durées des modèles de rythme par niveau publié. Pour le B1 : bloc `catalogue` appliqué par l’importeur, consignes bilingues ` [fr] ` transmises telles quelles et sans corrigé, prérequis A2 confirmé par le diagnostic, séances B1 travaillées juste (répétitions, dictées, missions), prérequis d’étape lu dans le catalogue (parcours A1 → B1), missions notées sur grille (refus des points incomplets, hors bornes ou inconnus ; mission A2 sans grille inchangée), test de niveau à trois paliers (B2 annoncé « bientôt »). Le niveau de démonstration de la recette (publication, retrait, examens) est le **C1**, créé s’il manque puis retiré : il ne gêne pas le vrai B1.

## Recette éphémère sur GitHub Actions

Le développement se fait en local sur `develop`. Un push sur cette branche lance le workflow [Recette éphémère](../../.github/workflows/recette.yml). Le runner démarre un Supabase Docker isolé, applique les migrations, compile les services et vérifie le parcours de bout en bout via l’API et Chromium. Les comptes, e-mails Mailpit et fichiers de test sont propres à cette exécution. Les conteneurs et volumes de recette sont supprimés à la fin.

La recette utilise uniquement le Supabase du runner et son accès GitHub en lecture. `develop` est la branche par défaut du dépôt : la recette peut aussi être relancée à la main depuis l’onglet Actions.

## Livraison automatisée en production

Avancer `production` sur un commit de `develop` dont la CI est verte, par exemple `git push origin develop:production`. La protection de `production` refuse un commit sans les trois contrôles CI réussis. Le workflow [Déploiement production](../../.github/workflows/deploy-production.yml) enchaîne alors :

1. **Plan.** [plan-deploy.mjs](../ci/plan-deploy.mjs) compare le commit au dernier déploiement réussi et retient la base, les services modifiés et le site. Sans déploiement réussi antérieur, tout est publié.
2. **Qualification.** La CI complète est rejouée sur le commit livré.
3. **Base.** `supabase db push` applique les migrations, sans les données fictives. Puis `db-grants.sql` et le contrôle `db-isolation.sql` s’exécutent sur la base de production.
4. **Services.** [deploy-service.sh](../ci/deploy-service.sh) construit chaque image, la publie dans Artifact Registry et crée une révision Cloud Run sans trafic. La révision reçoit le trafic seulement si sa sonde de santé répond. En cas d’échec, le trafic précédent est rétabli. Les six services métier passent avant la passerelle.
5. **Site.** Le build Vite et le Worker sont publiés avec Wrangler, puis la page de connexion et `/api/v1/health` sont vérifiées sur `linguacap.emichfer.org`.

Le workflow s’authentifie auprès de Google Cloud par fédération d’identité, sans clé stockée, avec le compte `github-deployer`. Il lit dans l’environnement GitHub `production` les secrets `SUPABASE_DATABASE_URL` et `CLOUDFLARE_API_TOKEN` et les variables `SUPABASE_PUBLISHABLE_KEY` et `CLOUDFLARE_ACCOUNT_ID`.

Droits de `github-deployer`, à recréer si le projet Google Cloud est reconstruit :

| Rôle | Portée | Usage |
| --- | --- | --- |
| `roles/iam.workloadIdentityUser` | le compte lui-même, pour le pool `linguacap-github` | Connexion depuis le workflow `deploy-production.yml` de la branche `production` |
| `roles/run.developer` | projet | Lire et mettre à jour les services, créer les révisions et déplacer le trafic |
| `roles/artifactregistry.writer` | dépôt `linguacap` | Publier les images |
| `roles/iam.serviceAccountUser` | les 7 comptes d’exécution `linguacap-*` | Déployer une révision avec son compte d’exécution |
| `roles/run.invoker` | les 6 services privés | Appeler la sonde de santé avant la promotion |
| `roles/iam.serviceAccountTokenCreator` | le compte lui-même | Obtenir le jeton OIDC de la sonde (`gcloud auth print-identity-token --impersonate-service-account`) |

Appels entre services privés : chaque appelant reçoit l’adresse du service appelé dans une variable `*_URL` et le rôle `roles/run.invoker` sur ce service. Le workflow de livraison conserve ces réglages d’une révision à l’autre.

| Appelant | Services appelés |
| --- | --- |
| Passerelle | les six services |
| Catalogue | Identités, Médias (publication des fichiers d’un parcours) |
| Médias | Identités |
| Évaluations | Identités (droits de correction), Catalogue (définition figée des évaluations), Apprentissage (contexte du parcours, remises et résultats), Médias (sons d’écoute et productions orales privées) |
| Apprentissage | Identités, Catalogue, Évaluations, Médias (adresses temporaires des supports d’une séance) |
| Suivi | Identités, Apprentissage, Évaluations (événements lus par lots) |
| Cloud Scheduler (`linguacap-scheduler`) | Suivi : `POST /v1/internal/tracking/jobs/sync`, toutes les 15 minutes |

Un nouvel appel se configure avant de publier le code qui l’utilise, par exemple pour Médias :

```powershell
$media = gcloud run services describe linguacap-media --region=europe-west1 --format='value(status.url)'
gcloud run services update linguacap-learning --region=europe-west1 --update-env-vars="MEDIA_URL=$media"
gcloud run services add-iam-policy-binding linguacap-media --region=europe-west1 `
  --member=serviceAccount:linguacap-learning@linguacap-prod-dvfjor.iam.gserviceaccount.com --role=roles/run.invoker
```

Traitement périodique du suivi : le compte `linguacap-scheduler` n’a que le rôle `roles/run.invoker` sur `linguacap-tracking`. Cloud Run vérifie son jeton OIDC et Suivi contrôle en plus que le jeton porte ce compte (variable `LINGUACAP_SCHEDULER_ACCOUNT`). Le traitement importe les événements à partir du dernier point de reprise, met à jour les synthèses puis ouvre, met à jour, suspend ou clôt les alertes ; le relancer ne crée aucun doublon.

```powershell
gcloud services enable cloudscheduler.googleapis.com
gcloud iam service-accounts create linguacap-scheduler --display-name="LinguaCap Cloud Scheduler"
$scheduler = "linguacap-scheduler@linguacap-prod-dvfjor.iam.gserviceaccount.com"
gcloud run services add-iam-policy-binding linguacap-tracking --region=europe-west1 --member="serviceAccount:$scheduler" --role=roles/run.invoker
gcloud run services update linguacap-tracking --region=europe-west1 --update-env-vars="LINGUACAP_SCHEDULER_ACCOUNT=$scheduler"
$tracking = gcloud run services describe linguacap-tracking --region=europe-west1 --format='value(status.url)'
gcloud scheduler jobs create http linguacap-tracking-sync --location=europe-west1 --schedule="*/15 * * * *" `
  --uri="$tracking/v1/internal/tracking/jobs/sync" --http-method=POST --oidc-service-account-email=$scheduler --oidc-token-audience=$tracking
```

## Exploitation du pilote

### Journaux corrélés et erreurs

La passerelle attribue à chaque appel un identifiant, renvoyé à l’interface dans l’en-tête `X-Request-Id` et transmis aux services appelés. Chaque ligne de journal le porte entre parenthèses, et chaque requête laisse une ligne de synthèse (`org.linguacap.requests` : méthode, route, statut, durée, sans paramètres ni contenu). Retrouver un appel dans tous les services :

```powershell
gcloud logging read '"<identifiant>"' --project=linguacap-prod-dvfjor --freshness=1d --format="table(resource.labels.service_name,timestamp,textPayload)"
```

Les traces d’exception Java des journaux Cloud Run sont regroupées par Cloud Error Reporting (console Google Cloud › Error Reporting) ; les réponses 5xx sont journalisées en avertissement.

### Limites du pilote

| Ressource | Limite | Où |
| --- | --- | --- |
| Instances Cloud Run | 1 instance au plus par service, 20 requêtes simultanées | révision Cloud Run (`deploy-service.sh`) |
| Connexions PostgreSQL | 3 par service (18 au total), attente de 4 s au plus | `quarkus.datasource.jdbc.*` |
| Corps de requête | 64 Ko par service, 1 Mo pour la passerelle et le Catalogue (versions complètes de niveau) | `quarkus.http.limits.max-body-size` |
| Appels entre services | 3 s de connexion, 7 s de réponse ; 10 s entre le Worker et la passerelle | `ServiceClient`, Worker |
| Fichiers | images 5 Mo, sons 15 Mo, productions orales 25 Mo ; 20 dépôts en attente par auteur | Médias |
| Supports d’une séance | 150 adresses temporaires par lecture ; 1 000 médias par publication | Médias |
| Site | HTTPS imposé (redirection 301), HSTS, `nosniff`, pas d’intégration dans un cadre tiers | Worker |

### Indisponibilité temporaire d’un service

La recette arrête puis relance des services (canal de pilotage de `run-local.mjs`) : sans Médias, une séance reste lisible et ses supports proposent de réessayer, la sonde de la passerelle passe à `degraded` ; sans Apprentissage, le traitement de Suivi signale l’erreur sans avancer son point de reprise, puis rattrape les événements au passage suivant. Les services se publient avant la passerelle et chaque contrat reste compatible avec la version précédente (ajouts seulement), car Cloud Run ne publie que les services modifiés.

### Revenir à une version précédente

- **Service Cloud Run** : lister les révisions, puis rendre le trafic à la précédente (immédiat, sans reconstruction).

  ```powershell
  gcloud run revisions list --service=linguacap-catalogue --region=europe-west1 --project=linguacap-prod-dvfjor
  gcloud run services update-traffic linguacap-catalogue --region=europe-west1 --project=linguacap-prod-dvfjor --to-revisions=<révision>=100
  ```

  Une révision se repère par le commit qu’elle porte (`linguacap-<service>-ci-<commit>-…`). Revenir en arrière sur un service et pas sur ceux qui en dépendent reste possible tant que la migration de base correspondante est additive.
- **Site et Worker** : `npx wrangler deployments list --config workers/web-proxy/wrangler.jsonc`, puis `npx wrangler rollback <version> --config workers/web-proxy/wrangler.jsonc`.
- **Base** : les migrations ne se défont pas automatiquement ; une correction passe par une nouvelle migration, ou par la restauration d’une sauvegarde.

### Sauvegarde et restauration

[backup.mjs](backup.mjs) exporte les schémas des six services (`pg_dump`, PostgreSQL 17 en conteneur) et copie les fichiers des deux espaces Storage ; [restore-check.mjs](restore-check.mjs) restaure l’export dans une base jetable et compare chaque table et chaque fichier au relevé de l’export. La recette exécute les deux à chaque passage.

En production (l’URL PostgreSQL et la clé serveur sont demandées sans écho ; le dossier contient des données personnelles, à garder hors du dépôt sur un support chiffré) :

```powershell
node infra/pilot/backup.mjs --out D:\sauvegardes\linguacap-2026-11-20 --storage https://dvfjorbapyxsitbvnoww.supabase.co
node infra/pilot/restore-check.mjs D:\sauvegardes\linguacap-2026-11-20
```

Restaurer réellement : appliquer les migrations sur la base cible (`supabase db push`), puis `pg_restore --data-only --no-owner` de l’export, puis `db-grants.sql` ; redéposer les fichiers dans les espaces Storage de même nom. Les comptes d’authentification (schéma `auth`, géré par Supabase) ne font pas partie de l’export : ils se conservent dans le projet Supabase ou se recréent par invitation.

## Première mise en ligne (manuelle)

Ces étapes ont servi au premier déploiement et restent utiles pour recréer l’infrastructure.

1. Rattacher le dépôt à Supabase et vérifier le projet cible avec `npx supabase db push --remote --dry-run`. Puis appliquer les migrations et importer le média du cours avec `node scripts/seed-course-media.mjs --allow-remote`, en configurant l’URL et la clé serveur requises dans le processus.
2. Configurer les redirections Supabase Auth vers `/activer-compte` et `/reinitialiser` sur `https://linguacap.emichfer.org`. Configurer le SMTP Resend pour l’expéditeur `no-reply@notifications.emichfer.org`.
3. Compiler avec `services/mvnw` et utiliser `deploy-cloud-run.ps1` avec `-Project` et `-Region` depuis la version validée. Le script attend les variables `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`, `SUPABASE_DB_PASSWORD`, `SUPABASE_DB_HOST`, `SUPABASE_DB_USER` et `SUPABASE_PROJECT_REF` dans le processus. Renseigner `SUPABASE_DB_CA_PATH` avec le chemin du certificat racine officiel téléchargé depuis les paramètres de la base Supabase. Le script authentifie la connexion TLS au pooler, stocke les secrets d’exécution dans Google Secret Manager et associe les identités de service aux droits nécessaires.
4. Configurer les deux variables Vite publiques correspondant au projet hébergé. Depuis la version publiée sur `production`, utiliser `deploy-web.ps1` avec le projet et la région. Il produit le build d’intégration, récupère l’URL de la passerelle et configure le secret de liaison du Worker. Vérifier le domaine, la sonde et la connexion.

## Premier administrateur

Le premier administrateur est créé par une opération serveur, refusée dès qu’un administrateur actif existe :

```sh
# Pile locale démarrée
node infra/pilot/bootstrap-admin.mjs --local --email admin@exemple.fr --name "Prénom Nom"
# Projet hébergé : SUPABASE_URL, SUPABASE_SECRET_KEY et SUPABASE_DATABASE_URL dans le processus
node infra/pilot/bootstrap-admin.mjs --email admin@exemple.fr --name "Prénom Nom"
```

Le script enregistre une invitation `admin` avec la fonction SQL `identity.bootstrap_admin_invitation`, puis Supabase Auth envoie le lien d’activation. Les comptes suivants sont invités depuis l’espace d’administration : professeurs, élèves accompagnés ou autonomes, et membres de l’équipe (rôle `staff`), qui reçoivent les permissions Catalogue ou Correction. Une adresse n’a qu’une invitation, valable sept jours, que l’on peut renvoyer ou annuler.

Le pilote contient une séance A1, les réglages de l’objectif et le suivi du résultat. Le catalogue présente les niveaux A1, A2 et B1 (contenus importés) et le brouillon B2 ; ils apparaissent partout d’après le catalogue (niveaux dynamiques). L’enrichissement des leçons, les examens complets, les groupes de classe, les alertes automatiques et les indicateurs d’usage détaillés suivent le [backlog du MVP](../../PLAN_FONCTIONNALITES.md).
