# Contrats LinguaCap

Ce dossier est la source de vérité des échanges entre l'interface, la passerelle et les services.

| Fichier | Contenu | Vérifié par |
| --- | --- | --- |
| [openapi.json](openapi.json) | API publique `/api/v1` : routes, paramètres, corps de requête, réponses et format d'erreur `{ code, message }`. | `ContractRoutesTest` (passerelle Quarkus) et `tests/contract.spec.ts` (React). |
| [events/event-envelope.schema.json](events/event-envelope.schema.json) | Enveloppe commune des événements métier lus par Suivi (incrément 7). | Identités écrit déjà ses événements dans `identity.outbox_events`. |

Événements émis par Identités, dans la même transaction que l’action : `identity.invitation_sent`, `identity.invitation_cancelled`, `identity.account_activated`, `identity.account_disabled`, `identity.account_enabled`, `identity.role_changed`, `identity.permissions_changed`, `identity.teacher_assigned` et `identity.reviewer_assigned`.

## Règles

- Toute nouvelle route publique est d'abord ajoutée à `openapi.json`, puis routée dans `Gateway.java`. La CI échoue si une route du contrat n'est pas routée par la passerelle, ou si l'interface appelle une route absente du contrat.
- Une réponse d'erreur contient toujours `code` (majuscules, par exemple `INVALID_INPUT`, `UNAUTHENTICATED`, `FORBIDDEN`, `NOT_FOUND`, `CONFLICT`, `UNAVAILABLE`) et `message`. Elle n'inclut jamais de corrigé, de donnée de connexion ni de lien signé.
- La passerelle génère un `X-Request-Id` pour chaque appel relayé, le transmet aux services appelés et le renvoie au client.
- Une évolution incompatible crée une nouvelle version de route ou de schéma. L'ancienne reste servie pendant le déploiement.
