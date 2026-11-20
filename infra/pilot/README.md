# LinguaCap · Première intégration

Le pilote relie le frontend React, sept applications Quarkus, Supabase et le Worker Cloudflare. Les six services métier possèdent leurs schémas PostgreSQL et leurs propres droits d’exécution. Le Worker transmet les appels `/api/v1` à la passerelle. Les services privés utilisent les identités Cloud Run pour communiquer. Supabase Auth émet les sessions. Supabase Storage fournit des liens temporaires pour les médias pédagogiques.

## Recette locale

Utiliser JDK 21, Maven, Node.js 24 et Docker. Depuis la racine du dépôt, lancer les commandes suivantes avec les services locaux Supabase.

```sh
npm ci --prefix linguacap-react
npx supabase start
npx supabase migration up
mvn -B -ntp -f services/pom.xml package
node infra/pilot/run-local.mjs
```

Le serveur de recette ouvre `http://127.0.0.1:5186` et la passerelle écoute sur le port 8080. Le lanceur utilise les URL et les identifiants de Supabase local. Il crée les six rôles SQL locaux et importe l’image et le son du cours A1. Éviter d’exécuter deux instances du lanceur sur la même base locale, car il régénère les mots de passe SQL de la recette.

Dans un autre terminal, `node infra/pilot/smoke.mjs` crée des comptes de test confirmés dans Supabase local. La recette vérifie l’invitation par Mailpit, l’activation, la lecture des deux médias privés, l’objectif intensif, la correction idempotente, la visibilité du résultat pour le professeur référent et la lecture d’un encouragement. Elle vérifie également que l’accès d’un autre professeur est refusé.

## Première mise en ligne

1. Rattacher le dépôt à Supabase et vérifier le projet cible avec `npx supabase db push --remote --dry-run`. Puis appliquer les migrations et importer le média du cours avec `node scripts/seed-course-media.mjs --allow-remote`, en configurant l’URL et la clé serveur requises dans le processus.
2. Configurer les redirections Supabase Auth vers `/activer-compte` et `/reinitialiser` sur `https://linguacap.emichfer.org`. Configurer le SMTP Resend pour l’expéditeur `no-reply@notifications.emichfer.org`.
3. Compiler avec Maven et utiliser `deploy-cloud-run.ps1` avec `-Project` et `-Region` depuis la version validée. Le script attend les variables `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`, `SUPABASE_DB_PASSWORD`, `SUPABASE_DB_HOST`, `SUPABASE_DB_USER` et `SUPABASE_PROJECT_REF` dans le processus. Renseigner `SUPABASE_DB_CA_PATH` avec le chemin du certificat racine officiel téléchargé depuis les paramètres de la base Supabase. Le script authentifie la connexion TLS au pooler, stocke les secrets d’exécution dans Google Secret Manager et associe les identités de service aux droits nécessaires.
4. Compiler le frontend avec `npm run build:integration` dans `linguacap-react`, avec les deux variables Vite publiques correspondant au projet hébergé. Déployer le Worker défini dans `workers/web-proxy/wrangler.jsonc` en renseignant `API_UPSTREAM` et le secret `API_ORIGIN_SECRET`. Utiliser le même secret dans la passerelle et dans le Worker. Vérifier le domaine, la sonde et la connexion.

Le compte administrateur initial est créé dans Supabase Auth puis rattaché par un insert SQL explicite dans `identity.profiles` avec son UUID et le rôle `admin`. Les autres comptes sont ajoutés sur invitation, avec le rôle déterminé par Identités.

Le pilote contient une séance A1, les réglages de l’objectif et le suivi du résultat. Le catalogue présente A2 et le brouillon B1. L’enrichissement des leçons, les examens complets, les groupes de classe, les alertes automatiques et les indicateurs d’usage détaillés suivent le [backlog du MVP](../../PLAN_FONCTIONNALITES.md).
