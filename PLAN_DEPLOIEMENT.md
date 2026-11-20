# LinguaCap — CI et plan de déploiement

Le backend sera développé en **Java 21 avec Quarkus et Maven**. Les six services métier et la passerelle API Java seront livrés sous forme d’images conteneur sur **Google Cloud Run**. Quarkus est retenu pour les API REST et l’exécution en conteneur, avec une même base technique pour tous les services. [Guide Quarkus](https://quarkus.io/guides/getting-started/)

Le frontend React sera servi sur **`https://linguacap.emichfer.org`** par Cloudflare. Un Worker TypeScript relaie les requêtes `/api/*` à la passerelle Cloud Run. Le choix de Cloud Run permet d’héberger les conteneurs Java avec une franchise de calcul. Les conteneurs Cloudflare relèvent de l’offre Workers Paid. [Tarifs des conteneurs Cloudflare](https://developers.cloudflare.com/workers/platform/pricing/#containers) · [Tarifs Cloud Run](https://cloud.google.com/run/pricing)

Supabase fournit PostgreSQL, Auth et le stockage privé. Resend transporte les e-mails Auth via SMTP. L’[architecture](ARCHITECTURE.md) décrit les responsabilités et les échanges entre services. Le [backlog](PLAN_FONCTIONNALITES.md) donne l’ordre de développement.

## Langages et cibles

| Composant à développer | Langage et outils | Cible |
| --- | --- | --- |
| Application web | **TypeScript**, React, Vite, HTML et CSS | Fichiers statiques servis par Cloudflare Workers Static Assets. |
| Proxy de bordure | **TypeScript**, Cloudflare Workers, Wrangler | Worker public de `linguacap.emichfer.org`. Sert l’interface et relaie `/api/*`. |
| Passerelle API | **Java 21**, Quarkus REST, Maven | Service Cloud Run qui valide la session Supabase et transmet les opérations aux services métier. |
| Identités | **Java 21**, Quarkus, **SQL** | Service Cloud Run privé. Comptes, rôles, rattachements et invitations. |
| Catalogue | **Java 21**, Quarkus, **SQL** | Service Cloud Run privé. Niveaux, contenus et versions publiées. |
| Médias | **Java 21**, Quarkus, **SQL** | Service Cloud Run privé. Autorisations de fichiers, images, audio et métadonnées. |
| Apprentissage | **Java 21**, Quarkus, **SQL** | Service Cloud Run privé. Objectifs, planning et progression. |
| Évaluations | **Java 21**, Quarkus, **SQL** | Service Cloud Run privé. Tentatives, remises et corrections. |
| Suivi | **Java 21**, Quarkus, **SQL** | Service Cloud Run privé. Alertes, encouragements et KPI. Traitement périodique déclenché par Cloud Scheduler. |
| Migrations et politiques Storage | **SQL** | Supabase PostgreSQL. Un rôle d’exécution et un schéma métier par service. |
| Automatisation | **YAML** GitHub Actions, commandes Maven, npm et Wrangler | Tests, construction des images, publication et vérifications après déploiement. |

## Incrément 1 · Mettre en place la CI

La CI fait partie du premier incrément et s’exécute avant le développement des parcours complets. Prévoir `.github/workflows/ci.yml` dans le dépôt. Le frontend React et Vite présent dans `linguacap-react/` sert de base. Ajouter la configuration TypeScript et migrer les points d’entrée JSX lors de cet incrément.

1. Déclencher la CI sur les push vers `develop` et `production` ainsi que sur les pull requests ciblant ces branches.
2. Exécuter `npm ci` dans les projets npm concernés. Vérifier les types et les tests, puis construire le frontend depuis `linguacap-react/` et valider le proxy TypeScript. Versionner les fichiers de verrouillage npm.
3. Vérifier Java 21 avec `./mvnw --batch-mode verify`. Versionner le Maven Wrapper et utiliser les mêmes versions de Java et de Node en CI et en local.
4. Vérifier le démarrage d’une première image Quarkus JVM et son endpoint de santé. Ajouter les services suivants au workflow à mesure qu’ils entrent dans le premier parcours. Exécuter en CI les tests de migrations, de contrats et de droits dès que les fonctions correspondantes sont présentes, avec des données de test.
5. Définir les résultats CI requis pour fusionner vers `production`. Vérifier que le workflow est vert avec le socle et qu’une erreur de compilation bloque la fusion. La CI des contributions utilise des permissions de dépôt en lecture et des données de test. [GitHub Actions](https://docs.github.com/en/actions/get-started/understand-github-actions)

La publication des images et le déploiement forment un workflow distinct qui nécessite un contexte de livraison autorisé.

## Environnements et identités

| Environnement | Exécution et données |
| --- | --- |
| Local, branche `develop` | Vite et Quarkus en mode développement, Supabase local avec des données fictives, une boîte e-mail de test et des identifiants d’exécution distincts par service. Le proxy local conserve le chemin `/api`. |
| CI et recette | Tests éphémères et données synthétiques. Une recette distante éventuelle utilise un projet, des secrets et des accès distincts de ceux du pilote. |
| Production, branche `production` | Cloudflare sur `linguacap.emichfer.org`, services Cloud Run en région européenne et projet Supabase hébergé. Retenir la région Cloud Run en tenant compte de la région réelle de PostgreSQL et de la latence mesurée. |

- **Cloudflare vers la passerelle Java.** Le Worker relaie uniquement les routes prévues vers l’URL Cloud Run de la passerelle. Il préserve le jeton utilisateur, ignore les en-têtes internes fournis par le client et ajoute un secret de liaison propre à cette origine. La passerelle contrôle ce secret puis la session et les droits applicatifs. L’API renvoie des erreurs HTTP, y compris pour les chemins inconnus. Les réponses privées restent hors du cache partagé.
- **Passerelle et services internes.** La passerelle est le point d’entrée Cloud Run joignable depuis Cloudflare. Les six services métier exigent l’autorisation IAM `roles/run.invoker`, accordée aux seuls comptes de service appelants nécessaires. Pour un appel utilisateur, le jeton Google destiné au service cible voyage dans `X-Serverless-Authorization`. `Authorization` conserve le jeton Supabase utilisé pour vérifier l’utilisateur et son droit sur la ressource. [Authentification entre services](https://docs.cloud.google.com/run/docs/authenticating/service-to-service)
- **Traitements planifiés.** Cloud Scheduler appelle une route interne de Suivi avec le jeton OIDC d’un compte dédié. La route vérifie l’identité autorisée du planificateur et traite des lots rejouables. Les requêtes utilisateur vers Suivi suivent le contrôle Supabase habituel. [Authentification Cloud Scheduler](https://docs.cloud.google.com/scheduler/docs/http-target-auth)
- **Données et secrets.** Chaque service Java utilise JDBC et son compte PostgreSQL dédié. Démarrer avec le pooler Supabase en mode session sur TLS, selon les paramètres de connexion du projet. Tester les droits SQL, les pools et la connectivité depuis Cloud Run dès le premier déploiement de recette. Garder les secrets d’exécution dans Secret Manager côté Google Cloud et dans les secrets Wrangler pour le proxy. La clé SMTP reste dans Supabase Auth. [Connexions PostgreSQL Supabase](https://supabase.com/docs/guides/database/connecting-to-postgres)

## Préparer les comptes et les services

1. Créer le projet Google Cloud du pilote, activer la facturation après validation du propriétaire et choisir la région. Activer Cloud Run, Artifact Registry, Secret Manager, Cloud Scheduler et les API nécessaires à l’identité de déploiement.
2. Créer le dépôt d’images dans Artifact Registry dans la région des conteneurs. Prévoir les comptes d’exécution et leurs rôles IAM. Accorder à chaque compte l’accès à ses secrets et aux services qu’il doit appeler.
3. Configurer la fédération d’identité Google Cloud pour le workflow de livraison GitHub. Restreindre la confiance au dépôt LinguaCap et à la branche de production autorisée. Utiliser des jetons temporaires OIDC pour publier et déployer. Configurer séparément l’autorisation de déploiement Cloudflare. [Fédération d’identité pour les pipelines](https://docs.cloud.google.com/iam/docs/workload-identity-federation-with-deployment-pipelines)
4. Préparer dans Supabase les schémas privés, les rôles, les compartiments de stockage et leurs règles. Vérifier le domaine d’envoi dans Resend et configurer le SMTP dans Supabase Auth. Définir `https://linguacap.emichfer.org` comme URL du site et autoriser `https://linguacap.emichfer.org/activer-compte` et `https://linguacap.emichfer.org/reinitialiser` comme URL de redirection.

## Déployer une version du MVP

1. **Qualifier le code.** Obtenir une CI verte puis choisir le commit à publier. Construire le frontend et les images JVM. Identifier chaque image avec le SHA Git et conserver le digest utilisé. Le même artefact qualifié passe en production.
2. **Préparer les données.** Exporter la base et confirmer la sauvegarde distincte des médias. Appliquer les migrations compatibles avec les services en cours. Vérifier les permissions SQL avant d’envoyer du trafic.
3. **Livrer le backend.** Publier les images dans Artifact Registry. Déployer les services métier et la passerelle sur Cloud Run. Chaque service peut recevoir sa propre révision. Lors d’une évolution de contrat, livrer les producteurs compatibles avant les consommateurs. Vérifier les endpoints de santé et l’IAM des services privés avant d’activer Cloud Scheduler.
4. **Livrer le frontend.** Publier depuis `production` le build Vite et le proxy Worker. Configurer l’URL de la passerelle, les variables publiques Auth et le secret de liaison. Le domaine personnalisé déclaré dans [Wrangler](workers/web-proxy/wrangler.jsonc) permet à Cloudflare de créer l’enregistrement DNS et le certificat lors du déploiement. Vérifier ensuite HTTPS et les liens profonds de React. [Domaines personnalisés Cloudflare](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/)
5. **Vérifier avant le pilote.** Charger et publier les versions validées d’A1 et A2 et leurs médias. Vérifier sur le domaine final une invitation externe, la récupération, une séance avec image et audio, une remise orale privée et une correction. Vérifier les refus d’accès croisés, un cycle de suivi et les KPI. Rejouer en recette la publication B1 sans déploiement.

## Retour arrière et exploitation

- Conserver la référence du commit, les digests d’images, les révisions Cloud Run, la version du Worker et les migrations appliquées.
- En cas de régression, renvoyer le trafic vers une révision Cloud Run compatible ou republier la version précédente du Worker. Faire évoluer le schéma en étapes compatibles afin que l’ancienne révision puisse fonctionner avec la base après la migration.
- Tester la restauration de PostgreSQL **et** des objets Storage dans un environnement isolé. Consulter les journaux de livraison, les erreurs par service, les invitations en difficulté, les retards de projection et les échecs du planificateur. Éviter les réponses d’examen, les liens privés et les secrets dans les journaux.

## Coût du pilote

La cible est un **pilote dans les quotas gratuits**. Cloud Run exige un compte de facturation Google Cloud, y compris pour utiliser le Free Tier. En mode facturation par requête, Google publie une franchise mensuelle de **2 millions de requêtes**, **180 000 secondes-vCPU** et **360 000 secondes-Gio**, calculée sur ses tarifs de référence. Ces quotas se partagent entre les services. [Google Cloud Free Tier](https://docs.cloud.google.com/free/docs/free-cloud-features) · [Tarifs Cloud Run](https://cloud.google.com/run/pricing)

Démarrer avec **zéro instance minimale**, des plafonds d’instances adaptés à la capacité PostgreSQL et une fréquence de traitement mesurée. Vérifier séparément le coût du stockage des images de conteneur, des secrets, des journaux et du trafic réseau. Mettre une politique de rétention sur les images de CI et conserver les images utiles au retour arrière. Les budgets Google Cloud envoient des alertes. Le dimensionnement et le suivi des quotas réduisent le risque de dépassement. [Tarifs Artifact Registry](https://cloud.google.com/artifact-registry/pricing) · [Tarifs Cloud Scheduler](https://cloud.google.com/scheduler/pricing) · [Budgets Google Cloud](https://docs.cloud.google.com/billing/docs/how-to/budgets)

Cloudflare héberge le site et son proxy. Supabase et Resend conservent leurs propres quotas pour la base, les médias et les e-mails. Les transferts audio et image passent directement par Supabase Storage avec les autorisations délivrées par Médias. [Tarifs Cloudflare Workers](https://developers.cloudflare.com/workers/platform/pricing/) · [Tarifs Supabase](https://supabase.com/pricing) · [Tarifs Resend](https://resend.com/pricing)
