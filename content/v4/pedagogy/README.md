# Couches pédagogiques V4

Une couche complète un module du kit V4 sans recopier ses sources (V2 de référence dans `content/base/de`, ateliers V3, ajouts V4). `infra/content/build-v4.mjs` compose le kit, ajoute les illustrations de `content/v4/source/images-v4.json`, puis fusionne les couches pour écrire la V4 officielle dans `content/de/{a1,a2}`.

- `a1/<moduleId>.mjs`, `a2/<moduleId>.mjs` : une couche par module (export par défaut), modifiable à volonté par tranches ;
- `a1/_level.mjs`, `a2/_level.mjs` : ordre des modules, budget de durée, réglages ;
- [`exemple.mjs`](exemple.mjs) : couche commentée du module `a1-sante` et exemple de `_level.mjs` (non construit).

```bash
node infra/content/build-v4.mjs --level a1 --out target/v4-preview     # aperçu, sans toucher content/de
node infra/content/check-content.mjs target/v4-preview/a1              # contrôles (ajouter --strict pour tout exiger)
```

Les identifiants des activités et des questions du kit se lisent dans `target/v4-preview/<niveau>/NN-<module>.json`. Les activités `-correction` n'existent plus : la correction de chaque question s'affiche après la remise de l'exercice.

## Module

```js
export default {
  module: 'a1-sante',                 // nom du fichier
  title, objective,                   // facultatifs
  grammarFocus: ['weil-dass'],        // module de grammaire : exercice « S’entraîner : … » d’au moins 6 questions
  vocabulary: [ { word, article, plural, partOfSpeech, translation, example, note } ],   // id facultatif, audio calculé
  media: [ /* images composées ou sons de synthèse, ajoutés ou remplacés par clé */ ],
  activities: {
    '<activityId>': null,             // retire l'activité
    '<activityId>': { kind, title, estimatedMinutes, competences, lesson: { title, description },
      explanations: { q1: '…' }, feedback: { q1: { b: '…' } },
      questions: [ /* liste complète */ ], addQuestions: [ … ], removeQuestions: ['q7'],
      placements: [ /* liste complète */ ] | { add: [ … ], remove: ['<clé de média>'] },
      mission: { oral, written, checklist } },
  },
  add: [ { after: '<activityId>', activity: { id, kind, title, estimatedMinutes, competences, lesson, questions, placements, mission } } ],
  order: ['<activityId>', …],         // facultatif : ordre complet des activités
};
```

Ordre d'application : médias, retouches et retraits, ajouts (`after` ou `before`, sinon en fin de module), `order`, vocabulaire. Une erreur de couche (clé inconnue, activité ou question absente, ordre incomplet) arrête la construction sans rien écrire.

## Questions

| Type | Champs | Remarques |
| --- | --- | --- |
| `choice` (défaut) | `options: [{ id, label, correct, feedback? }]` | 3 ou 4 choix, un seul juste |
| `fill` | `text` avec `[[1]]`, `blanks: [{ id, accept: [...], size?, hint? }]` | toutes les variantes justes dans `accept` (« zum », « zu dem ») |
| `order` | `answers: [[jeton, …], …]` | chaque solution reprend exactement les mêmes jetons, majuscules comprises ; sinon fixer le début dans la consigne |
| `match` | `pairs: [{ left, right }]` | 2 à 6 paires, uniques des deux côtés |
| `dictation` | `accept: ['phrase'], voice?` | son `<activité>-<question>` créé (voix `sprecherin` par défaut), transcription après la réponse ; pas d'autre transcription à la demande dans l'activité |
| `speak` | `text, accept?, threshold?` | 2 à 12 mots ; seuil 80 jusqu'à 3 mots, 75 au-delà ; nombres : ajouter la variante en chiffres dans `accept` |

Chaque question a une `explanation` en français (10 à 600 caractères, 400 conseillés) : pourquoi la réponse est juste, pourquoi le distracteur principal est faux. Un exercice compte 3 à 10 questions. Les explications des contrôles des ateliers sont reprises de leurs quiz : `explanations` les remplace.

## Mission

`kind: 'mission'`, `lesson.description` pour la situation et la consigne, `mission: { oral: { prompt, maxSeconds 30–120 } | null, written: { prompt, maxChars 200–1500, minWords 0–200 } | null, checklist: [2 à 6 points de 160 caractères] }`. Les compétences suivent les parties (`expression-orale`, `expression-ecrite`). Les missions des ateliers sont provisoires (tirées de la tâche) tant que la couche ne fournit pas `mission`.

## Vocabulaire

`partOfSpeech` : noun, verb, adjective, adverb, preposition, conjunction, pronoun, number, expression, other. Un nom prend une majuscule et son article (`der`, `die`, `das`), sauf note « toujours au pluriel » ; `plural` sans article. `note` (120 caractères) : « séparable : an|fangen », « + accusatif ». L'exemple contient le mot. 10 à 30 entrées par module (6 pour les modules de sons). Le son `<module>-lexique` est créé : une ligne par entrée (« der Kopf, die Köpfe »), voix de Thorsten (plus intelligible que Kerstin sur des mots isolés), débit lent, segments pour le lexique de l’application.

## Niveau (`_level.mjs`)

```js
export default {
  order: ['a1-abc', …],                 // ordre complet des modules ; prérequis recalculés en chaîne
  minutes: { min: 2200, max: 2300 },    // budget des activités (A1 2 200–2 300, A2 2 050–2 200)
  settings: { … },                      // facultatif, fusionné dans les réglages du niveau
  midtermTitle: '…', midtermDescription: '…',      // bilan intermédiaire : titre et description
  finalTitle: '…', finalDescription: '…',          // examen blanc
};
```

Le bilan intermédiaire tombe après le module ⌈n/2⌉, qui doit clore un thème ; son titre et sa description doivent le refléter (le contrôle signale « modules 1 à N » si N ne correspond pas au point de coupure). Durées conseillées : leçon 10–15 min, exercice 8–12, répétition 8–10, mission 15–20. Titres : « Comprendre / Découvrir … », « S’entraîner : … », « Vérifier : … », « Mission : … ».

## Contrôles

Sans `--strict`, les règles de complétude (explications, vocabulaire, exercice typé, répétition, dictées, mission relue, illustration, exercice de grammaire, budget) sont des erreurs pour les modules dotés d'une couche et des avertissements pour les autres. Les consignes hors application (« tracez », « sur une feuille », « partenaire »…) sont signalées dans les leçons et missions.
