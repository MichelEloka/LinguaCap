# Contrats LinguaCap

Ce dossier est la source de vérité des échanges entre l'interface, la passerelle et les services.

| Fichier | Contenu | Vérifié par |
| --- | --- | --- |
| [openapi.json](openapi.json) | API publique `/api/v1` : routes, paramètres, corps de requête, réponses et format d'erreur `{ code, message }`. | `ContractRoutesTest` (passerelle Quarkus) et `tests/contract.spec.ts` (React). |
| [events/event-envelope.schema.json](events/event-envelope.schema.json) | Enveloppe commune des événements métier lus par Suivi. | Recette : import, déduplication, reprise et reconstruction des projections. |

Chaque producteur écrit ses événements dans sa table de sortie (`identity.outbox_events`, `learning.outbox_events`, `assessment.outbox_events`), dans la même transaction que l’action. Suivi les lit par lots ordonnés avec `GET /v1/internal/{service}/events?after={séquence}&limit=100` (réponse `{ items: [{ sequence, event }], last }`), garde son point de reprise par producteur et déduplique par `eventId`.

| Producteur | Événements | Données utiles |
| --- | --- | --- |
| Identités | `identity.invitation_sent`, `identity.invitation_cancelled`, `identity.account_activated`, `identity.account_disabled`, `identity.account_enabled`, `identity.role_changed`, `identity.permissions_changed`, `identity.teacher_assigned`, `identity.reviewer_assigned` | Identifiants, rôle, référent, invitation d’origine. |
| Apprentissage | `learning.goal_set` | Parcours, niveau, rythme, dates de départ, cible et cible initiale. |
| | `learning.plan_validated` | Révision, date cible, séances actives avec échéance et jalon (`midterm`, `final`). |
| | `learning.activity_progressed`, `learning.session_completed` | Séance, activité, fin, échéance et remise à temps. |
| | `learning.goal_paused`, `learning.goal_status_changed` | État de l’objectif, date de reprise. |
| Évaluations | `assessment.attempt_submitted`, `assessment.attempt_graded` | Tentative, type, numéro, remise, échéance, à temps, décision, pourcentage et résultats par compétence. Jamais les réponses, les productions ni les corrigés. |

## Règles

- Toute nouvelle route publique est d'abord ajoutée à `openapi.json`, puis routée dans `Gateway.java`. La CI échoue si une route du contrat n'est pas routée par la passerelle, ou si l'interface appelle une route absente du contrat.
- Une réponse d'erreur contient toujours `code` (majuscules, par exemple `INVALID_INPUT`, `UNAUTHENTICATED`, `FORBIDDEN`, `NOT_FOUND`, `CONFLICT`, `UNAVAILABLE`) et `message`. Elle n'inclut jamais de corrigé, de donnée de connexion ni de lien signé.
- La passerelle génère un `X-Request-Id` pour chaque appel relayé, le transmet aux services appelés et le renvoie au client.
- Une évolution incompatible crée une nouvelle version de route ou de schéma. L'ancienne reste servie pendant le déploiement.
