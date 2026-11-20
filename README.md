# LinguaCap

LinguaCap aide un élève à atteindre un objectif de langue à une date donnée. L’élève indique le temps qu’il peut consacrer à l’apprentissage, la plateforme en tire un calendrier de leçons, d’exercices et d’évaluations, et le professeur suit la progression pour intervenir quand l’objectif est menacé. La première version couvre l’allemand **A1 et A2**, avec un catalogue administrable pour publier d’autres niveaux.

**En ligne :** [linguacap.emichfer.org](https://linguacap.emichfer.org) (pilote).

| Document | Contenu |
| --- | --- |
| [Cahier des charges](CAHIER_DES_CHARGES.md) | Usages, règles métier et critères de recette du MVP |
| [Architecture](ARCHITECTURE.md) | Services, données, médias et échanges |
| [Backlog](PLAN_FONCTIONNALITES.md) | Incréments DEV-001 à DEV-109 et avancement |
| [Plan de déploiement](PLAN_DEPLOIEMENT.md) | Environnements, CI et mise en ligne |
| [Contrats](contracts/README.md) | API publique `/api/v1` et événements |
| [Recette et livraison](infra/pilot/README.md) | Pile locale, recette, déploiement automatisé |
| [Frontend](linguacap-react/README.md) | Espaces, mode démonstration et mode intégration |

## Architecture

```text
Navigateur ──► Cloudflare Worker (linguacap.emichfer.org)
                 ├─ site React (fichiers statiques)
                 └─ /api/v1/* ──► passerelle Quarkus (Cloud Run)
                                    └─► Identités · Catalogue · Médias · Apprentissage · Évaluations · Suivi
                                          (Cloud Run privés, un schéma PostgreSQL et un rôle SQL chacun)
Supabase : PostgreSQL, Auth (sessions, invitations), Storage privé · Resend : e-mails Auth
```

- **Interface** : React 19, TypeScript, Vite, Playwright.
- **Services** : Java 21, Quarkus 3, Maven, une image JVM par service.
- **Données** : Supabase PostgreSQL via le pooler en TLS, migrations SQL dans `supabase/migrations`.
- **Livraison** : GitHub Actions, Artifact Registry, Cloud Run, Wrangler.

## Organisation du dépôt

```text
linguacap-react/        Interface React (démonstration locale et intégration API)
workers/web-proxy/      Worker Cloudflare : site et relais /api/v1
services/               Projet Maven : api-gateway, identity, catalogue, media,
                        learning, assessment, tracking et module shared
contracts/              Contrat OpenAPI et enveloppe des événements
supabase/               Configuration locale, migrations et données fictives (seed.sql)
infra/ci/               Planification et déploiement des services
infra/pilot/            Recette locale, droits et isolation SQL, scripts de première mise en ligne
.github/workflows/      CI, recette éphémère et déploiement production
```

## Démarrer

Prérequis : **Node.js 24** (`.nvmrc`), **JDK 21** (`.java-version`) et **Docker**. Maven est fourni par `services/mvnw` et la Supabase CLI s’utilise avec `npx`.

**Interface seule, en démonstration** (données fictives conservées dans le navigateur) :

```sh
cd linguacap-react
npm ci
npm run dev
```

**Pile complète en local** (Supabase local, sept services Quarkus, interface en mode intégration) :

```sh
npm ci --prefix linguacap-react
npx supabase start
services/mvnw -B -ntp -f services/pom.xml package
node infra/pilot/run-local.mjs        # interface sur http://127.0.0.1:5186, passerelle sur :8080
node infra/pilot/smoke.mjs --browser  # dans un autre terminal : recette de bout en bout
```

Sous Windows, utiliser `services\mvnw.cmd`. Les variables attendues sont listées dans [.env.example](.env.example). Les fichiers `.env*` et `.dev.vars*` restent hors de Git.

## Tester

| Périmètre | Commande |
| --- | --- |
| Interface : types, parcours, proxy, contrat | `cd linguacap-react && npm run typecheck && npm run test:e2e` |
| Services Java : compilation, tests, contrat de la passerelle | `cd services && ./mvnw verify` |
| Planification des déploiements | `node --test infra/ci/plan-deploy.test.mjs` |
| Recette complète et isolation SQL | `node infra/pilot/smoke.mjs --browser` (pile locale démarrée) |

## Livrer

1. Développer sur `develop`. Chaque push lance la [CI](.github/workflows/ci.yml) (interface, services, outils de livraison) et la [recette éphémère](.github/workflows/recette.yml).
2. Quand la CI est verte, avancer la production : `git push origin develop:production`. La branche `production` est protégée et refuse un commit sans CI réussie.
3. Le workflow [Déploiement production](.github/workflows/deploy-production.yml) publie uniquement ce qui a changé depuis la dernière livraison réussie : migrations et contrôle d’isolation SQL, services Cloud Run avec bascule progressive et retour arrière automatique, puis le Worker et le site.

Le détail des étapes, des secrets GitHub et des droits Google Cloud se trouve dans [infra/pilot/README.md](infra/pilot/README.md).

## Avancement

- **Incrément 1 · Socle** : terminé. Interface TypeScript, sept services Quarkus, migrations et rôles SQL par service, contrats d’API, CI et livraison automatisée.
- **Incrément 2 · Comptes et protection des données** : terminé. Invitations avec expiration, renvoi et annulation, premier administrateur, rôle Équipe et permissions Catalogue et Correction, correcteur désigné, réaffectation avec historique, désactivation et traces pour Suivi.
- **Incrément 3 · Première séance A1 de bout en bout** : terminé. Catalogue versionné (langue, niveau, version, modules, activités, compétences, durées), médias versionnés, attribution d’un parcours avec échéance, accueil élève et séance avec visuel, audio et transcription, progression reprise et fin idempotente, exercice corrigé rattaché à sa séance, fiche de suivi du professeur.
- **Incrément 4 · Planning personnalisé** : terminé. Objectif avec niveau de départ, dates et critères de réussite, modèles Standard et Intensif, diagnostic initial et point de départ confirmé, prérequis A1 avant A2, disponibilités par jour, proposition de planning avec charge et débordements, validation, pause, reprise et replanification sans perdre l’historique des échéances.

Les incréments suivants sont décrits dans le [backlog](PLAN_FONCTIONNALITES.md).
