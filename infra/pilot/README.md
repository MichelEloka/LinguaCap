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

Le pilote contient une séance A1, les réglages de l’objectif et le suivi du résultat. Le catalogue présente A2 et le brouillon B1. L’enrichissement des leçons, les examens complets, les groupes de classe, les alertes automatiques et les indicateurs d’usage détaillés suivent le [backlog du MVP](../../PLAN_FONCTIONNALITES.md).
