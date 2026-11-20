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
- **Incrément 5 · Médiathèque et catalogue éditable** : terminé. Niveaux ordonnés avec prérequis, éditeur de versions (modules, activités, questions et corrigés, diagnostic, bilan et examen blanc avec grilles), contrôle de complétude, aperçu élève, publication et retrait sans redéploiement, médiathèque avec dépôt direct contrôlé, versions de fichiers immuables et adresses de lecture temporaires renouvelées à chaque séance.
- **Incrément 6 · Évaluations et corrections** : terminé. Bilan intermédiaire et examen blanc sur la version attribuée, progression enregistrée, écrit, oral enregistré au navigateur ou déposé dans l’espace privé des productions, remise idempotente, file des corrections du référent et du correcteur désigné, grille par compétence, décision validé ou à consolider, remise à temps corrigée après l’échéance et nouvelle tentative avec historique.
- **Incrément 7 · Suivi et interventions du professeur** : terminé. Événements métier écrits dans la transaction de chaque service et lus par lots avec point de reprise, déduplication et reconstruction, temps de pratique estimé, liste filtrée avec alertes et corrections en attente, fiche élève complétée, règle de risque selon la cadence et le prochain jalon, bilan échu détecté, traitement périodique lancé par Cloud Scheduler, encouragement lié à l’alerte et reprise enregistrée.
- **Incrément 8 · Indicateurs administrateur** : terminé. Tableau de bord réservé à l’administration, fondé sur les projections de Suivi : activation à sept jours, élèves actifs par semaine, séances terminées à temps, objectifs validés à l’échéance (indicateur principal), progression entre les bilans et reprise après encouragement, avec filtres, effectifs, groupes vides et fraîcheur des données.

- **Incrément 9 · Parcours A1 et A2 complets** : terminé. Deux parcours de 8 modules et 96 activités chacun (environ 18 h 30 par niveau, 565 questions corrigées), diagnostics, bilans et examens blancs sur les quatre compétences, prérequis A1 avant A2 ; 89 enregistrements natifs et 72 photos de *Deutsch im Blick*, situations adaptées de *Der und mehr* (CC BY 4.0), 100 sons de synthèse et 179 illustrations composées, avec transcriptions et textes alternatifs ([contenus](content/README.md)). Chaîne de production outillée (contrôle, synthèse vocale, contrôle par reconnaissance vocale, rendu, import par l’API) et recette d’un A1 intensif accompagné et d’un A2 autonome jusqu’à la correction. La publication en production relève de DEV-107.

- **Incrément 10 · Mise en ligne du MVP** : en cours. Livraison automatisée vérifiée (fédération d’identité GitHub, images par empreinte, révisions sans trafic avant promotion, migrations et rôles SQL, TLS vérifié vers la base, secrets par service, Cloud Scheduler dédié, services privés refusant tout appel sans identité), HTTPS imposé et en-têtes de sécurité, journaux corrélés par identifiant de requête, indisponibilités éprouvées en recette, sauvegarde et restauration vérifiées en recette, nouvelle interface des espaces. Restent les contrôles en ligne avec des comptes réels (invitation externe, récupération, isolation, dépôt de médias), la publication des parcours A1/A2 en production, une sauvegarde de production et l’ouverture du pilote (voir [exploitation](infra/pilot/README.md#exploitation-du-pilote)).

Les incréments suivants sont décrits dans le [backlog](PLAN_FONCTIONNALITES.md).
