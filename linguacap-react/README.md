# LinguaCap — Frontend

Application React et TypeScript issue de la maquette de LinguaCap. Les visuels de référence sont dans [maquettes](../maquettes/). Les espaces élève, professeur et administration partagent un même scénario de démonstration.

## Démarrer en local

Depuis `linguacap-react/`, avec Node.js 24 (voir `.nvmrc` à la racine) et npm.

```sh
npm ci
npm run dev
```

Ouvrir l’adresse affichée par Vite. La démonstration démarre par défaut et conserve les changements dans le navigateur. Utiliser des comptes et des fichiers fictifs pendant les essais.

| Espace | Pages | Actions disponibles en démonstration |
| --- | --- | --- |
| Élève | `/eleve`, `/eleve/planning`, `/eleve/evaluations`, `/eleve/resultats`, `/eleve/messages` | Ajuster le rythme et les créneaux, ouvrir une leçon, écouter et répondre au quiz, remettre un texte ou un audio. |
| Professeur | `/professeur`, `/professeur/eleves`, `/professeur/alertes`, `/professeur/corrections` | Filtrer les élèves, préparer une invitation locale, ajuster un objectif, encourager et corriger. |
| Administration | `/administration`, `/administration/utilisateurs`, `/administration/catalogue`, `/administration/mediatheque` | Consulter les indicateurs de la démo, gérer les rattachements, déposer des médias et publier une version locale d’un niveau. |

Les invitations et publications de la démo restent locales. Le cours A1 fourni illustre le lecteur et le chemin de recette. Les programmes complets et leurs barèmes seront chargés lors de l’intégration pédagogique.

## Vérifier le frontend et préparer l’intégration

```sh
npm run typecheck
npx playwright install chromium
npm run test:e2e
npm run build
```

Les tests Playwright couvrent les médias et le quiz, le passage d’une remise vers le professeur, la publication avec un média local, la sonde API, le proxy et la navigation mobile. Le build est produit dans `dist/`. Sous Windows, `PLAYWRIGHT_CHANNEL=msedge` permet d’utiliser Edge déjà installé. La [CI frontend](../.github/workflows/ci.yml) reproduit ces contrôles au push ou à l’ouverture d’une pull request sur `develop` ou `production`.

Pour le test d’architecture, renseigner dans `.env.local` à la racine du dépôt les variables publiques `VITE_SUPABASE_URL` et `VITE_SUPABASE_PUBLISHABLE_KEY`. Définir aussi `LINGUACAP_API_PROXY` avec l’URL de la passerelle Quarkus pour le développement local. La [configuration modèle](../.env.example) indique les noms attendus.

```sh
npm run dev:integration
npm run build:integration
```

En mode intégration, `/integration` vérifie la disponibilité des six services et `/connexion` utilise Supabase Auth. Les liens d’invitation et de récupération reviennent respectivement sur `/activer-compte` et `/reinitialiser`. Après connexion, `/espace` ouvre le parcours pilote correspondant au profil stocké dans PostgreSQL. Le catalogue, les médias, l’objectif, le quiz, les résultats et les messages utilisent les services Java. La [recette du pilote](../infra/pilot/README.md) décrit le démarrage de l’ensemble.

Les routes disponibles et leurs formats sont décrits dans [contracts/openapi.json](../contracts/openapi.json). Le test `tests/contract.spec.ts` vérifie que l’interface n’appelle que des routes déclarées. Les appels authentifiés envoient `Authorization: Bearer <jeton Supabase>`.

Le [Worker de bordure](../workers/web-proxy/wrangler.jsonc) est configuré pour servir `dist/` et relayer `/api/v1/*` sur `https://linguacap.emichfer.org`. En hébergement, configurer `API_UPSTREAM` et le secret `API_ORIGIN_SECRET` côté Worker. La passerelle accepte le secret dans `X-Linguacap-Origin` et valide séparément la session utilisateur. Le [plan de déploiement](../PLAN_DEPLOIEMENT.md) décrit la publication.

## Organisation

- `src/app/` contient la configuration et le routage.
- `src/components/` contient la navigation et les éléments d’interface partagés.
- `src/features/` regroupe les pages par espace.
- `src/domain/`, `src/demo/` et `src/integration/` séparent les types, la démonstration locale et les contrats API.
- `tests/` contient les parcours de recette dans le navigateur.

## Médias de la leçon de démonstration

- [Coffee and white saucer](https://commons.wikimedia.org/wiki/File:Coffee_and_white_saucer.jpg), Douglas Perkins, [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/), miniature 500 px.
- `kaffee.wav` est une voix de synthèse pour la démo, générée hors ligne en allemand avec [eSpeak NG](https://github.com/espeak-ng/espeak-ng) via [le port Emscripten](https://github.com/echogarden-project/espeak-ng-emscripten).
