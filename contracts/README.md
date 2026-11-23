# Contrats LinguaCap

Ce dossier est la source de vérité des échanges entre l'interface, la passerelle et les services.

| Fichier | Contenu | Vérifié par |
| --- | --- | --- |
| [openapi.json](openapi.json) | API publique `/api/v1` : routes, paramètres, corps de requête, réponses et format d'erreur `{ code, message }`. | `ContractRoutesTest` (passerelle Quarkus) et `tests/contract.spec.ts` (React). |
| [events/event-envelope.schema.json](events/event-envelope.schema.json) | Enveloppe commune des événements métier lus par Suivi. | Recette : import, déduplication, reprise et reconstruction des projections. |
| [../linguacap-react/src/integration/v2.ts](../linguacap-react/src/integration/v2.ts) | Formes JSON exactes de l’incrément « Parcours » (langues, test de niveau, entraînement, parcours, contrats, ajouts, bibliothèque) : les records Java sérialisent à l’identique, `null` explicite. | `tsc` (interface) et tests des services. |
| [../linguacap-react/src/integration/v4.ts](../linguacap-react/src/integration/v4.ts) | Formes JSON de la V4 « Contenus et pédagogie » : questions typées (`choice`, `fill`, `order`, `match`, `dictation`, `speak`) vues par l’élève, réponses et corrigé par question, répétition orale, missions, file de corrections, lexique du module, document du catalogue enrichi. | `tsc`, simulateur et recette (`infra/pilot/smoke.mjs`, `smoke-answers.mjs`). |

Chaque producteur écrit ses événements dans sa table de sortie (`identity.outbox_events`, `learning.outbox_events`, `assessment.outbox_events`), dans la même transaction que l’action. Suivi les lit par lots ordonnés avec `GET /v1/internal/{service}/events?after={séquence}&limit=100` (réponse `{ items: [{ sequence, event }], last }`), garde son point de reprise par producteur et déduplique par `eventId`.

| Producteur | Événements | Données utiles |
| --- | --- | --- |
| Identités | `identity.invitation_sent`, `identity.invitation_cancelled`, `identity.account_activated`, `identity.account_disabled`, `identity.account_enabled`, `identity.role_changed`, `identity.permissions_changed`, `identity.teacher_assigned`, `identity.reviewer_assigned` | Identifiants, rôle, référent, invitation d’origine. |
| | `identity.language_chosen` | Sujet `account` : langue choisie par l’élève autonome (`languageId`) et langue précédente (`previousLanguageId`). |
| | `identity.teacher_profile_updated` | Sujet `account` : langues, niveaux, nombre d’élèves envisagé et délai de correction. `acceptingNewStudents` et `courseCreationMode` sont présents seulement si ces deux réponses ont été soumises, `onboarding` est vrai lors de la première validation. La présentation reste dans Identités. |
| Apprentissage | `learning.goal_set` | Parcours, niveau, rythme, dates de départ, cible et cible initiale. |
| | `learning.plan_validated` | Révision, date cible, séances actives avec échéance et jalon (`midterm`, `final`). |
| | `learning.activity_progressed`, `learning.session_completed` | Séance, activité, fin, échéance et remise à temps. |
| | `learning.goal_paused`, `learning.goal_status_changed` | État de l’objectif, date de reprise. |
| | `learning.path_created`, `learning.path_started`, `learning.path_completed` | Sujet `path` (identifiant du parcours) : langue, état, origine, niveaux de départ et visé, dates de départ, cible et cible initiale, engagement hebdomadaire, charge requise, difficulté, révision validée. |
| | `learning.path_step_activated` | Sujet `path` : niveau ouvert (étape, rang, niveau, version de parcours). L’inscription du niveau émet de son côté `goal_set` puis `plan_validated`. |
| | `learning.contract_proposed`, `learning.contract_accepted`, `learning.contract_rejected`, `learning.contract_withdrawn` | Sujet `contract` (`<pathId>:<numéro>`) : numéro, état, auteur de la proposition, conditions (niveaux, dates, engagement hebdomadaire, charge, difficulté), décideur. |
| | `learning.path_addition_created`, `learning.path_addition_removed` | Sujet `path` : ajout, niveau d’accueil, version et niveau d’origine, module, activité, placement, durée. |
| Évaluations | `assessment.attempt_submitted`, `assessment.attempt_graded` | Tentative, type, numéro, remise, échéance, à temps, décision, pourcentage et résultats par compétence. Jamais les réponses, les productions ni les corrigés. |
| | `assessment.exercise_flagged` | Sujet `exercise` (identifiant de la remise) : leçon, séance et activité (ou null en bibliothèque), manche, `correct`, `pending`, `total`, questions nouvellement « à revoir » (`questionIds`) et toutes les questions à revoir de la remise (`flagged`). |
| | `assessment.mission_submitted`, `assessment.mission_reviewed` | Sujet `mission` : version, niveau, module, activité, numéro de remise, état (`submitted`, `sent`, `reviewed`), destinataire (`reviewerKind` : `teacher`, `reviewer` ou null), séance et activité de séance (ou null), date d’envoi ; `decision` (`validated`, `to_redo`) et date du retour pour `mission_reviewed`. Jamais le texte ni l’enregistrement. |

Depuis l’incrément « Parcours », `identity.invitation_sent`, `identity.account_activated` et `identity.teacher_assigned` portent aussi `languageId` (langue de l’élève, ou null).

Les événements de parcours, de contrat, d’exercice typé et de mission ne portent **jamais** de clé `enrollmentId` dans `data` : Suivi crée une ligne d’objectif pour tout événement qui en porte une. Suivi ignore aujourd’hui les trois événements de la V4 (`exercise_flagged`, `mission_submitted`, `mission_reviewed`) ; ils sont publiés pour les futurs tableaux de bord. Un parcours de plusieurs niveaux compte un objectif par niveau ouvert (`goal_set` de chaque inscription, avec `template = 'custom'`). Le test de niveau et les examens blancs d’entraînement (Évaluations) n’émettent aucun événement.

## V4 « Contenus et pédagogie »

- **Corrigé** : seul `POST /assessments/exercises` corrige une leçon qui contient des questions typées (`/assessments/quiz` répond alors 409). La correction de chaque question est figée à la remise et relue par `GET /assessments/exercises/{attemptId}` (élève, professeur référent, administration) ; une ancienne remise est corrigée à la volée, sans explication.
- **Aucune fuite** : la vue élève d’une question (séance, bibliothèque) ne contient jamais `correct`, `accept`, `answers`, `pairs`, `feedback`, `explanation` ni `spec`. La clé de correction n’est servie qu’à Évaluations, par la route interne `GET /v1/internal/lessons/{lessonId}/exercise-key` du catalogue ; `/v1/internal/lessons/{id}/answer-key` indique `typed`.
- **Répétition orale** : le navigateur envoie seulement le texte reconnu (`POST /assessments/speech`) ; Évaluations recalcule le score. Trois échecs rendent la question « à revoir » (`Grade.flagged`), un enregistrement de repli attend la validation du correcteur (`Grade.pending`).
- **Missions** : remises au professeur référent, sinon au correcteur désigné, sinon `sent` (auto-vérification). Apprentissage termine l’activité avec `attemptId = missionId` après vérification de la remise.
- **Taille des corps** : 2 Mo à la passerelle, au catalogue et à l’importeur (documents de version enrichis).
- **Ordre de mise en production** : migrations, services (catalogue avant toute importation au nouveau format), passerelle, interface, puis import des contenus V4.

## Règles

- Toute nouvelle route publique est d'abord ajoutée à `openapi.json`, puis routée dans `Gateway.java`. La CI échoue si une route du contrat n'est pas routée par la passerelle, ou si l'interface appelle une route absente du contrat.
- Une réponse d'erreur contient toujours `code` (majuscules, par exemple `INVALID_INPUT`, `UNAUTHENTICATED`, `FORBIDDEN`, `NOT_FOUND`, `CONFLICT`, `UNAVAILABLE`) et `message`. Elle n'inclut jamais de corrigé, de donnée de connexion ni de lien signé.
- La passerelle génère un `X-Request-Id` pour chaque appel relayé, le transmet aux services appelés et le renvoie au client.
- Une évolution incompatible crée une nouvelle version de route ou de schéma. L'ancienne reste servie pendant le déploiement.
