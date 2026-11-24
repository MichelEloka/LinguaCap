# Niveaux B : guide de rédaction (format 5)

Les niveaux B1 et B2 s’écrivent dans un format natif : **un module complet par fichier** `.mjs`. `infra/content/build-b.mjs` les construit vers `content/de/b1` (puis `b2`) au format des modules existants (`NN-<id>.json`), lu tel quel par les contrôles, l’import, la synthèse des sons et le rendu des images. On ne modifie jamais `content/de/b1` à la main.

```
content/b/README.md                    ce guide
content/b/lib.mjs                      aides : bi(), aide(), C (consignes), choice(), fill(), order(), match(), dictation(), speak(), GRIDS
content/b/source/b1/<moduleId>.mjs     un module complet par fichier (lots de rédaction)
content/b/source/b1/_level.mjs         ordre, budget, bloc catalogue, réglages, titres du bilan et de l’examen
content/b/source/b1/_evaluations.mjs   diagnostic, bilan, examen blanc et leurs médias
content/b/source/b1/_media.mjs         photos et sons libres ajoutés aux modules
content/b/libre/registre.json          registre des fichiers téléchargés sous licence libre
```

## Construire et contrôler

```bash
node infra/content/build-b.mjs --level b1 --only b1-arbeit,b1-arbeit-atelier --out target/b-preview-r2   # aperçu de ses modules
node infra/content/check-content.mjs target/b-preview-r2/b1/07-b1-arbeit.json                          # contrôle d’un module
node infra/content/check-content.mjs target/b-preview-r2/b1                                             # les modules de l’aperçu
node infra/content/build-b.mjs --level b1 --out target/b-preview                                        # niveau complet (24 modules, _level, _evaluations)
node infra/content/check-content.mjs --strict target/b-preview/b1                                       # contrôle complet
node infra/content/check-content.mjs --level-only target/b-preview/b1                                   # diagnostic et évaluations seuls
```

- `--only` (liste séparée par des virgules, ou option répétée) ne lit que ces modules : un fichier en cours d’écriture chez un autre lot ne gêne pas. Il exige `--out` (rien de partiel dans `content/de`) et écrit un `level.json` marqué `partial: true` : les règles de niveau (budget, couverture, évaluations) sont alors ignorées. Le numéro `NN` du fichier est le rang du module dans `_level.mjs`.
- Une erreur de forme (clé inconnue, export manquant, fichier mal nommé) arrête la construction sans rien écrire.
- Sans `--out`, la construction écrit `content/de/b1` (modules périmés supprimés) et `content/de/media/credits.json`. `--workbook <dossier>` écrit en plus le cahier hors ligne `B1.html`.
- Les sons et images sont produits ensuite (lot S3, voir `content/README.md`). Un lot de rédaction ne lance ni synthèse ni rendu.

## Module

```js
// content/b/source/b1/b1-arbeit.mjs
import { C, bi, choice, fill, order, match, dictation, speak, GRIDS } from '../../lib.mjs';

export default {
  id: 'b1-arbeit',                       // = nom du fichier ; minuscules, chiffres, tirets ; 40 caractères au plus
  title: 'Arbeit : comprendre une offre et préparer un entretien',   // 120 caractères, sans marqueur
  objective: 'Comprendre une offre d’emploi, présenter ses compétences et poser des questions polies.',   // 500 caractères
  grammarFocus: ['konjunktiv2-hoeflichkeit', 'indirekte-fragen'],    // module thème : repères de 40 caractères au plus
  sources: ['Textes, dialogues et exercices originaux LinguaCap.'],
  audioProfile: undefined,               // facultatif : b1-debut pour les modules 1 à 8, b1-suite ensuite
  vocabulary: [ /* 15 à 30 entrées (atelier : 10 à 20) */ ],
  media: [ /* sons de synthèse et images composées, clés préfixées par l’id d’activité */ ],
  activities: [ /* les activités du gabarit, ci-dessous */ ],
};
```

Clés admises : `id, title, objective, grammarFocus, sources, audioProfile, vocabulary, media, activities`. La construction calcule `prerequisites` (chaîne dans l’ordre de `_level.mjs`), `layer`, le son du lexique (`audio`), les sons des dictées et répétitions et les transcriptions : ne pas les écrire.

Activité : `{ id, kind, title, estimatedMinutes, competences, lesson: { description }, questions, placements, mission }` (`lesson.title` reprend `title`). `kind` : `lesson`, `exercise` ou `mission`. Compétences : `lecture`, `ecoute`, `expression-ecrite`, `expression-orale` ; une activité d’écoute a un son.

Supports (`placements`) : `{ media, caption?, alt?, usage?, transcriptVisibility?, decorative?, questionId?, optionId? }`. Par défaut, un son est `on_demand`, `after_answer` dans un exercice d’écoute ; une image est `hidden` et non décorative (son texte alternatif vient du média).

## Aides de `content/b/lib.mjs`

| Aide | Produit |
| --- | --- |
| `bi(de, fr)` | `"de [fr] fr"` : consigne allemande, traduction affichée dessous (B1) |
| `aide(de, fr)` | `"de [fr?] fr"` : aide française repliée (B2) |
| `C.lesen`, `C.hoeren`, `C.notizen`, `C.richtigFalsch`, `C.waehlen`, `C.ergaenzen`, `C.ordnen`, `C.zuordnen`, `C.diktat`, `C.sprechen`, `C.reagieren` | consignes standard déjà traduites : à employer chaque fois que possible |
| `choice(id, prompt, [[label, true], [label], …], explanation)` | choix `a`, `b`, `c`, `d` **dans l’ordre donné** : variez vous-même la place de la bonne réponse (avertissement si plus de la moitié des bonnes réponses d’un module sont au même rang) |
| `fill(id, prompt, 'texte [[1]] …', [['réponse', 'variante'], …], explanation)` | trous numérotés `1`, `2`… ; **toutes** les variantes justes dans chaque liste |
| `order(id, prompt, [[jeton, …], [autre solution…]], explanation)` | chaque solution reprend exactement les mêmes jetons |
| `match(id, prompt, [[gauche, droite], …], explanation)` | 2 à 6 paires, uniques des deux côtés |
| `dictation(id, phrase, explanation, voix = 'sprecherin')` | consigne `C.diktat` ; passez une voix (`'mann2'`, `'frau2'`…) pour varier |
| `speak(id, texte, explanation, accept = [texte])` | consigne `C.sprechen` ; ajoutez la variante en chiffres si le texte contient un nombre |
| `GRIDS.b1.schreiben`, `GRIDS.b1.sprechen` | grilles standard des missions (4 critères × 5 points, 5 critères × 4 points) |
| `C2.lesen`, `C2.hoeren`, `C2.notizen`, `C2.richtigFalsch`, `C2.waehlen`, `C2.ergaenzen`, `C2.ordnen`, `C2.zuordnen`, `C2.diktat`, `C2.sprechen`, `C2.reagieren`, `C2.argument`, `C2.wer` | consignes standard du **B2** (allemand, aide repliée `[fr?]`) |
| `speakB2(…)`, `dictationB2(…)` | mêmes arguments que `speak` et `dictation`, consigne `C2` : **au B2, jamais `speak()` ni `dictation()`**, dont la consigne porte `[fr]` (refusé) |
| `GRIDS.b2.schreiben`, `GRIDS.b2.sprechen` | grilles B2, libellés allemands avec aide `[fr?]` |

Une grille s’adapte en gardant ses identifiants et son total de 20 points : `criteria: GRIDS.b1.schreiben.map((c) => c.id === 'aufgabe' ? { ...c, label: 'Tâche : candidature complète (motif, deux compétences, disponibilité)' } : c)`. Les objets de `GRIDS` sont figés : on ne les modifie pas en place.

## Consignes bilingues

- **Même ligne** : `Lesen Sie den Text. [fr] Lisez le texte.` (allemand, espace, marqueur, espace, français).
- **Ligne seule** : une ligne qui commence par `[fr] ` traduit le bloc qui la précède immédiatement (intertitre, paragraphe, puce), sans ligne vide entre les deux :

```text
STRATEGIE
[fr] Stratégie
Lesen Sie zuerst nur die Überschrift und den ersten Absatz.
[fr] Lisez d’abord seulement le titre et le premier paragraphe.
```

- Un seul marqueur par ligne ; ni partie allemande ni partie française vide ; graphie exacte `[fr]` ou `[fr?]` (pas `[FR]`, `[fr ]`).
- **B1** : `[fr]` obligatoire dans chaque énoncé de question (`prompt`) ; `[fr?]` interdit ; une ligne de consigne qui commence par `Lesen Sie`, `Hören Sie`, `Ergänzen Sie`, `Ordnen Sie`… (description, consigne de partie, consigne de mission) porte sa traduction. Explications, règles (`À RETENIR`) et titres d’activité en français (« Comprendre : … », « S’entraîner : … », « Vérifier : … », « Mission : … »).
- **B2** : `[fr]` interdit, `[fr?]` conseillé sur les énoncés, les explications de `-entdecken` et `-grammatik`, la règle `-regel`, les consignes, listes et grilles des missions ; consignes, règles, explications et titres en allemand (voir « Niveau B2 » ci-dessous).
- **Champs où un marqueur est permis** : `prompt` des questions, `lesson.description`, `mission.oral.prompt`, `mission.written.prompt`, `mission.checklist[]`, `mission.criteria[].label`, consignes et descriptions du diagnostic et des évaluations (et `explanation` au B2 seulement). **Interdit** partout ailleurs : titres, objectif, choix et retours, réponses (`accept`, `answers`, `pairs`, `blanks`, `text` des trous et des répétitions), scripts des sons, lexique, `alt`, `caption`.
- Dans une description, le texte allemand à lire (document) reste sans marqueur ; seule la consigne est traduite.

## Gabarit B1 (identifiants imposés)

Module thème `b1-<t>` (125 à 140 min, 10 activités) et atelier `b1-<t>-atelier` (110 à 125 min, 8 activités). Le contrôle exige la présence et le type de chaque activité.

| Thème | Type | Min | Atelier | Type | Min |
| --- | --- | --- | --- | --- | --- |
| `-einstieg` | lesson | 10 | `-modell` | lesson | 12 |
| `-lesen` | exercise | 18–20 | `-interaktion` | exercise | 10 |
| `-hoeren` | exercise | 15–18 | `-mediation` | exercise | 15 |
| `-entdecken` | exercise | 10 | `-korrektur` | exercise | 10 |
| `-regel` | lesson | 8 | `-pruefung` | exercise | 18–20 |
| `-grammatik` (6 questions au moins) | exercise | 12 | `-schreiben` (partie écrite) | mission | 25 |
| `-wortschatz` | exercise | 12 | `-sprechen` (partie orale) | mission | 20 |
| `-redemittel` (4 à 6 `speak` seuls) | exercise | 9 | `-bilan` | lesson | 6 |
| `-hoeren2` ou `-lesen2` (1 ou 2 dictées) | exercise | 15 | | | |
| `-kontrolle` | exercise | 12 | | | |

Contenu attendu de chaque activité : plan §1.3 et annexe des modules. Chaque module, atelier compris, a aussi au moins un exercice de 4 questions typées (`fill`, `order`, `match`, `dictation`) — dans l’atelier, en général `-mediation` ou `-korrektur` — et au moins une illustration non décorative.

## Règles du profil B1 (`infra/content/level-profiles.mjs`)

| Règle | B1 |
| --- | --- |
| Activités par module | 6 à 14 ; module de 100 à 150 min |
| Durée d’une activité | 5 à 30 min ; conseillé : leçon 6–15, exercice 8–20, répétition 8–10, mission 20–30 |
| Questions par exercice | 3 à 10 ; énoncé de 500 caractères au plus |
| Explication | obligatoire, en français, 10 à 700 caractères (500 conseillés) : pourquoi c’est juste, pourquoi le distracteur principal est faux |
| `speak` | 4 à 16 mots ; seuil 75 (70 au-delà de 10 mots) ; 4 à 6 dans `-redemittel` |
| `dictation` | 8 à 20 mots ; 1 ou 2 par module thème, aucune exigée en atelier |
| Description de leçon | 20 à 8 000 caractères |
| Son de synthèse | 5 000 caractères prononcés au plus, répliques de 400 caractères |
| Lexique | 15 à 30 entrées (atelier : 10 à 20) |
| Missions | 2 par atelier ; oral 90 à 180 s ; écrit `maxChars` 1 000 à 1 500, `minWords` 40 à 120 ; grille de 4 critères (écrit) ou 5 (oral), 20 points |
| Débit (manifeste) | `lengthScale` 0,95 à 1,10 (profils `b1-debut` 1,03, `b1-suite` 1,00, `b1-lexique` 1,10) |

## Niveau B2 (phase 2)

**Langue.** Consignes, règles (`MERKE`, `REGEL`), explications, listes de vérification et grilles **en allemand** ; l’aide française suit ` [fr?] ` (repliée sous « Aide en français »), jamais ` [fr] `. La partie allemande ne contient pas de français (une phrase française citée entre guillemets à traduire reste permise). Les traductions du lexique restent en français. Titres d’activité en allemand, sans espace avant les deux-points : « Einstieg: … », « Verstehen: … », « Entdecken: … », « Regel: … », « Üben: … », « Wortschatz: … », « Prüfen: … », « Modell: … », « Diskutieren: … », « Vermitteln: … », « Korrigieren: … », « Prüfungstraining: … », « Mission: … », « Bilanz: … ». Un titre français (« Comprendre : … », « S’entraîner : … ») est une erreur.

```js
import { C2, aide, choice, fill, order, match, speakB2, GRIDS } from '../../lib.mjs';
choice('q1', aide('Welche Haltung vertritt die Autorin?', 'Quelle position l’autrice défend-elle ?'),
  [['Sie hält Homeoffice für sinnvoll, wenn Regeln vereinbart werden.', true], ['…'], ['…'], ['…']],
  'Im dritten Absatz schreibt sie: „Ohne klare Absprachen …“. [fr?] Au troisième paragraphe, elle pose une condition.');
speakB2('q1', 'Da muss ich Ihnen widersprechen, denn die Zahlen zeigen eher das Gegenteil.', 'Widerspruch höflich einleiten. [fr?] …');
```

**Gabarit B2** (identifiants imposés ; même découpage que le B1, sauf ce qui suit) :

| Thème `b2-<t>` (9 activités, 125 à 140 min) | Type | Min | Atelier `b2-<t>-atelier` (8 activités, 115 à 130 min) | Type | Min |
| --- | --- | --- | --- | --- | --- |
| `-einstieg` | lesson | 10 | `-modell` | lesson | 12 |
| `-lesen` : texte de **450 à 700 mots**, inférence et points de vue (au moins 2 `choice` à 4 options), `match` de 4 à 6 paires | exercise | 20–25 | `-diskussion` : réagir à des arguments enregistrés, `choice` et **4 `speak`** (`speakB2`, 8 à 20 mots) | exercise | 10–12 |
| `-hoeren` : écoute de **3 à 5 min**, prise de notes longue (2 `fill` de 4 à 8 trous) | exercise | 20–25 | `-mediation` : synthèse de deux sources ou explication de données (gabarit `chart`) | exercise | 15 |
| `-entdecken` (explications avec `[fr?]`) | exercise | 10 | `-korrektur` | exercise | 10 |
| `-regel` (règle en allemand, aide `[fr?]`) | lesson | 8–10 | `-pruefung` | exercise | 18–25 |
| `-grammatik` (6 questions au moins, explications avec `[fr?]`) | exercise | 12–14 | `-schreiben` : 150 à 250 mots | mission | 25–30 |
| `-wortschatz` | exercise | 12 | `-sprechen` : exposé de 3 à 4 min ou discussion simulée de 2 à 3 min | mission | 20 |
| `-hoeren2` (extrait authentique de 2 à 5 min) ou `-lesen2` | exercise | 15 | `-bilan` | lesson | 6 |
| `-kontrolle` | exercise | 12–14 | | | |

Pas de `-redemittel` dans le thème : les répétitions sont dans `-diskussion`. Les dictées sont facultatives (0 à 2 par thème, prise de notes en `fill` à la place). L’activité `-hoeren2` des thèmes impairs est écrite par le lot des médias dans `_media.mjs` (voir `source/b2/_level.mjs`) : tant qu’elle manque, l’aperçu signale son absence.

**Profil B2** (`infra/content/level-profiles.mjs`, règles de `check-content.mjs`) :

| Règle | B2 | Contrôle |
| --- | --- | --- |
| Marqueurs | `[fr]` interdit ; `[fr?]` conseillé (énoncés, explications de `-entdecken` et `-grammatik`, `-regel`, missions) | erreur ; avertissement |
| Titres | allemands | erreur (titre d’activité français), avertissement (titre de module) |
| Explication | en allemand, 10 à 1 000 caractères aide comprise (800 conseillés) | erreur hors bornes ; avertissement si français |
| Texte `-lesen` | 450 à 700 mots hors consignes, intertitres et gloses | avertissement hors fourchette, erreur sous 360 ou au-delà de 840 |
| Écoute `-hoeren` · `-hoeren2` | 180 à 300 s · 120 à 300 s (manifeste audio, sinon environ 17 caractères prononcés par seconde : 3 min ≈ 3 000 caractères) | avertissement hors fourchette, erreur sous 80 % ou au-delà de 120 % |
| Durée d’une activité | 5 à 30 min ; conseillé : leçon 6–15, exercice 8–25, mission 20–30 ; module de 100 à 150 min | erreur ; avertissement |
| `speak` | 8 à 20 mots, seuil 70 (posé par la construction : ne pas fixer `threshold`) ; 4 à 6 dans `-diskussion` | erreur |
| `dictation` | facultative : 0 à 2 par thème, 8 à 20 mots | erreur |
| `order` · `match` | 8 à 14 jetons · 4 à 6 paires | avertissement |
| Choix | bonne réponse au même rang dans 43 % des questions au plus ; jamais plus de 1,35 fois plus longue que le plus long distracteur ; la plus longue dans 45 % des questions au plus (hors vrai/faux) | avertissement |
| Son de synthèse | 5 000 caractères prononcés au plus ; extrait natif de 300 s au plus | erreur |
| Missions | 2 par atelier ; oral 120 à 300 s ; écrit `maxChars` 1 500 à 3 000, `minWords` 100 à 220 ; grille `GRIDS.b2` (4 critères à l’écrit, 5 à l’oral, 20 points), libellés allemands | erreur |
| Débit (manifeste) | `lengthScale` 0,92 à 1,05 (`b2-debut` 1,00, `b2-suite` 0,97, `b2-lexique` 1,05) | erreur |

## Missions

```js
{ id: 'b1-arbeit-atelier-schreiben', kind: 'mission', title: 'Mission : postuler par courriel', estimatedMinutes: 25,
  competences: ['expression-ecrite'],
  lesson: { description: bi('Sie haben eine Stellenanzeige gelesen …', 'Vous avez lu une offre d’emploi …') },
  mission: { oral: null,
    written: { prompt: bi('Schreiben Sie eine E-Mail (120–150 Wörter).', 'Écrivez un courriel de 120 à 150 mots.'), maxChars: 1500, minWords: 100 },
    checklist: ['Je salue et je dis pourquoi j’écris.', 'Je présente deux compétences avec un exemple.'],   // 2 à 6 points de 160 caractères
    criteria: GRIDS.b1.schreiben } }
```

La situation va dans `lesson.description`, la tâche dans `prompt` (1 000 caractères au plus). Aucune consigne hors application (« votre partenaire », « sur une feuille ») : une interaction à deux se simule par des répliques enregistrées.

## Lexique

`{ word, article, plural, partOfSpeech, translation, example, note }`. `partOfSpeech` : noun, verb, adjective, adverb, preposition, conjunction, pronoun, number, expression, other. Un nom a une majuscule et son article (sauf note « toujours au pluriel ») ; `plural` sans article. Régimes et particularités dans `note` (120 caractères) : « + um (accusatif) », « séparable : ein|arbeiten », « n-Deklination : den Kollegen ». L’exemple contient le mot. Traductions en français.

## Médias

**Son de synthèse** : `{ key, kind: 'audio', title, script: [ { voice, name?, text, say? }, { pause: 0.6 }, … ] }`. Voix : `sprecherin`, `sprecher`, `frau`, `mann` (Kerstin et Thorsten) et `frau2`, `frau3`, `mann2`, `mann3` (voix ajoutées, `infra/content/tts/voices.json`) ; au moins trois voix différentes par thème. Le son ne contient que de l’allemand. Les répétitions sont lues par Kerstin et Thorsten en alternance, les dictées par la voix de la question.

**Images composées** (`image: { layout, … }`), pictogrammes Lucide de `infra/content/icons.txt` : gabarits V4 (`document`, `cards`, `form`, `table`, `messages`, `ticket`, `plan`, `route`, `clocks`…, voir `content/README.md`) et gabarits B :

- `article` : `{ title ≤ 120, kicker? ≤ 60, byline? ≤ 80, lead? ≤ 300, paragraphs: 1 à 3 × ≤ 600, icon? }` ;
- `chart` : `{ title ≤ 120, unit ≤ 20, bars: 2 à 8 × { label ≤ 30, value ≥ 0 }, highlight?: rang, source? ≤ 120 }`, barres horizontales, valeurs affichées ; au B2, deux variantes plus riches pour « expliquer des données » :
  - barres groupées : `{ title, unit, series: ['2019', '2025'] (2 ou 3 noms ≤ 20), bars: 2 à 6 × { label ≤ 30, values: [une valeur ≥ 0 par série] }, highlight?, source? }`, légende en couleur ;
  - courbes d’évolution : `{ kind: 'line', title, unit, points: 2 à 10 dates ≤ 12, lines: 1 à 3 × { name ≤ 24, values: [une valeur par date] }, highlight?: rang de la date, source? }`, axe gradué, valeurs écrites aux points (aux extrémités au-delà de 8 dates) ;
  - comme pour tout document, les chiffres que la question exploite figurent aussi dans la description de l’activité (lisibilité à 390 px, accessibilité) ;
- `forum` : `{ title ≤ 120, posts: 1 à 4 × { author ≤ 30, date? ≤ 20, text ≤ 400 } }`.

Un passage entre crochets dans un texte d’image (`[weil]`) est mis en couleur. Aucune marque, aucune personne réelle.

**Fichiers téléchargés** (lot médias, `_media.mjs`) : photo `{ photo: { file: 'libre/commons/<fichier>.jpg', crop? }, credit, license, sourceUrl }` ou son `{ native: { file: 'libre/…', clip: [début, fin] }, transcript, credit, license, sourceUrl }`. Licences admises : CC0, Domaine public, CC BY 2.0 FR, CC BY 2.5, CC BY 3.0, CC BY 4.0, CC BY-SA 3.0, CC BY-SA 4.0. Le fichier figure dans `content/b/libre/registre.json` avec la même empreinte et la même licence, sans personne identifiable ; JPEG ou PNG seulement.

## Fichiers de niveau

```js
// _level.mjs
export default {
  order: ['b1-neuanfang', 'b1-neuanfang-atelier', /* … 24 modules */ 'b1-kultur-atelier'],
  minutes: { min: 2950, max: 3100 },
  audio: { debutModules: 8 },
  catalogue: { title: 'Allemand B1', description: '…', position: 3, prerequisiteLevelId: 'a2' },
  settings: { expectedCompetences: ['lecture', 'ecoute', 'expression-ecrite', 'expression-orale'], successCriteria: '…',
    passPercent: 60, reviewMinutes: 15, midtermMinutes: 60, finalMinutes: 120 },
  midtermTitle: '…', midtermDescription: '…', finalTitle: '…', finalDescription: '…',
};
// _evaluations.mjs : export const diagnostic = { title, description, questions: [ { ...choice(…), moduleRef } ] };
//                    export const assessments = [ { kind: 'midterm', title, description, parts: [ … ] }, { kind: 'final', … } ];
//                    export const media = [ /* sons des parties d’écoute : b1-bilan-…, b1-examen-… */ ];
// _media.mjs : export default [ { module, media, placement: { activity, usage, caption } } | { module, after, activity } ];
```

En construction complète, `order` est la liste exacte des fichiers de modules. Le bilan intermédiaire tombe après le module 12 (⌈24/2⌉) ; le diagnostic compte 8 à 16 questions à choix, dont des questions `prerequis` puisque le niveau a un prérequis ; chaque évaluation a une partie par compétence (lecture et écoute fermées, 4 à 10 questions ; écrit et oral notés sur une grille de 2 à 5 critères).

## Qualité attendue

Allemand standard irréprochable (ß, trémas, majuscules des noms dans toutes les réponses canoniques), français soigné (guillemets « », apostrophe ’), niveau CECRL respecté, une seule bonne réponse incontestable par choix (les distracteurs sont faux dans le contexte), toutes les variantes justes dans `accept`, nombres des répétitions acceptés aussi en chiffres. Aucune consigne hors application, aucune marque ni personne réelle, aucune reprise de manuel, de sujet Goethe ou telc, ni de Deutsche Welle.
