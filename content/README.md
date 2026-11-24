# Contenus pédagogiques LinguaCap

Ce dossier contient les parcours d’allemand **A1**, **A2** et **B1** (B2 en préparation) et le **test de niveau** au format source. L’importeur les publie dans le catalogue par l’API de la plateforme : niveau du catalogue aligné, médias déposés dans la médiathèque, puis brouillon enregistré, contrôlé et publié.

La **V4** est le contenu officiel A1/A2 (`content/de/{a1,a2}`, format 4) : questions typées avec explications, missions remises au professeur, lexique structuré par module, voix A1 ralenties. Les **niveaux B** (`content/de/b1`, format 5) ajoutent les consignes bilingues (`[fr]`, `[fr?]`), la grille de critères des missions et le bloc `catalogue` du niveau ; ils sont écrits en format natif dans `content/b` (guide : [`b/README.md`](b/README.md)). Tout `content/de/<niveau>` est **généré** : on ne le modifie pas à la main, mais ses sources. Un niveau est disponible dès que `content/de/<niveau>/level.json` existe (a1 … c2) : construction, sons, images, contrôles et import le prennent sans modification du code ; ses règles viennent de `infra/content/level-profiles.mjs`.

```
content/
  README.md                  ce document
  base/de/                   V2 de référence, source de la construction (ne pas modifier)
    a1/, a2/                 modules et niveaux V2
    media/audio/*.mp3        MP3 d’origine : source des enregistrements natifs ralentis
    media/credits.json       crédits de la V2
  v3/source/                 ateliers de réemploi et modules de sons (V3)
  v4/source/                 modules ajoutés en V4, illustrations V4 (images-v4.json)
  v4/pedagogy/a1, a2/        couches pédagogiques par module et _level.mjs (voir v4/pedagogy/README.md)
  cine/                      Ciné-club : lib.mjs (aides), videos.json (vidéos autorisées), de/<filmId>.mjs (sources)
  b/                         niveaux B : lib.mjs (aides), README.md (guide de rédaction)
    source/b1/               un module complet par fichier, _level.mjs, _evaluations.mjs, _media.mjs
    libre/registre.json      registre des fichiers téléchargés sous licence libre (empreinte, auteur, licence, URL)
  de/                        sortie : contenus importés dans le catalogue
    a1/level.json            format 4, réglages, budget de durée, diagnostic, bilan, examen blanc
    a1/NN-<module>.json      un fichier par module : vocabulaire, activités, médias
    a2/…                     même organisation pour A2
    b1/…                     format 5 (build-b.mjs), même organisation, plus le bloc catalogue de level.json
    placement/placement.json test de niveau (non généré)
    cine/<filmId>.json       films du Ciné-club (build-cine.mjs) : corps de PUT /catalogue/films/{id}
    media/audio/*.mp3        sons générés (synthèse, natifs, lexique, répétitions, dictées) et test de niveau
    media/audio/manifest-v3.json  profils, durées, empreintes et segments du lexique
    media/images/*.png|jpg   seul dépôt d’images (V2, V3, V4, B)
    media/credits.json       crédits de tous les niveaux (composés par build-v4 et build-b)
```

## Produire la V4

Prérequis : Node.js 22, Docker (images `linguacap-tts-v3` et `linguacap-asr`), modèles Piper dans `target/linguacap-piper-voices-v3` (téléchargement ci-dessous), Edge ou Chrome pour le rendu des images. Les commandes partent de la racine du dépôt (Git Bash). Les étapes 2 à 7 valent pour tous les niveaux disponibles, B compris.

```bash
node infra/content/build-v4.mjs                       # 1. V4 dans content/de (modules périmés supprimés) ; --level a1, --out <dossier> pour un aperçu
MSYS_NO_PATHCONV=1 docker run --rm -v "$(pwd -W):/repo" -v "$(pwd -W)/target/linguacap-piper-voices-v3:/voices:ro" -w /repo   linguacap-tts-v3 python -B infra/content/tts/synthesize-v3.py --content /repo/content/de      # 2. sons (seuls les sons modifiés sont refaits)
PLAYWRIGHT_CHANNEL=msedge node infra/content/render-images.mjs                                  # 3. images absentes ou modifiées
node infra/content/check-content.mjs --strict                                                   # 4. contrôles (format 4 : voir plus bas)
node infra/content/expected-transcripts.mjs target/expected.json a1 a2 --segments               # 5. textes attendus, segments du lexique compris
MSYS_NO_PATHCONV=1 docker run --rm -v linguacap-whisper-models:/models -v "$(pwd -W)/infra/content/asr:/work:ro"   -v "$(pwd -W)/content/de/media/audio:/audio:ro" -v "$(pwd -W)/target:/out" linguacap-asr   python /work/check_audio.py --expected /out/expected.json --audio /audio --report /out/asr-report.json   # 6. reconnaissance vocale
node infra/content/import-content.mjs --dry-run                                                 # 7. fichiers présents, document < 2 Mo
node infra/content/build-v4.mjs --kit target/linguacap-cours-v4-kit                             # facultatif : kit hors ligne (A1.html, A2.html)
```

- **Construction** (`build-v4.mjs`) : composition du kit V4 (V2 de référence, ateliers V3, ajouts V4), illustrations V4, couches pédagogiques, puis automatiquement : retrait des activités `-correction`, explications reprises des quiz des ateliers, mission provisoire tirée de la tâche des ateliers (à remplacer dans la couche), sons et supports des questions `dictation` et `speak` (`<activité>-<question>`), son du lexique `<module>-lexique` (une ligne par entrée, segments), prérequis en chaîne dans l’ordre du niveau, profils audio, `level.json` au format 4.
- **Sons** (`synthesize-v3.py`) : voix Piper Thorsten et Kerstin ; enregistrements natifs tirés de `content/base/de/media/audio`, ralentis sans changer la hauteur. Profils : A1 tout entier ralenti (débit de synthèse 1,30 au moins, natifs à 0,88 au plus), A2 progressif. Lexique, modèles à répéter et dictées A1 au profil le plus lent. MP3 mono (48 kb/s pour la synthèse, 64 kb/s pour les natifs). Les sons du lexique reçoivent dans le manifeste un segment `{ start, end }` par ligne, que l’importeur transmet au catalogue.
- **Reconnaissance vocale** : `check_audio.py` retranscrit chaque son (et chaque segment du lexique avec `--segments`) et signale un écart de mots supérieur à 25 % ; `--keys <expression>` limite le contrôle (par exemple aux nouveaux sons) et `--model medium` donne un second avis sur les cas signalés. Les nombres écrits en chiffres (« 14.00 Uhr », « 4,50 € », « am 12. Mai ») et les composés coupés en deux sont comparés comme le texte attendu. La synthèse Piper varie d’une prise à l’autre : un son mal reconnu se régénère avec `--only <clé> --force`. Sur un mot isolé d’un segment du lexique, la reconnaissance est peu fiable (« bei » entendu « bye ») : on juge le son sur le lexique entier, contrôlé avec ses segments. Kerstin (`frau`, `sprecherin`) prononce mal certains mots courts (« Hals ») ; Thorsten (`mann`, `sprecher`) est plus intelligible sur les mots isolés et lit les lexiques.
- **Test de niveau** : ses sons restent produits par `synthesize.py` (V2) ; lancez-le avec `--only placement-…`, car `content/de/{a1,a2}` est désormais au format 4.
- **Non-régression** : `synthesize-v3.py … --dry-run` liste les sons à refaire sans rien écrire. L’empreinte d’un son qui n’emploie que les voix de base est celle de la V4 : l’ajout de `voices.json` ou des niveaux B ne refait aucun son A1/A2 (à condition de laisser `frau`, `mann`, `sprecherin`, `sprecher` sur leurs modèles d’origine, sans `speaker`).

## Produire un niveau B

```bash
node infra/content/build-b.mjs --level b1 --out target/b-preview && node infra/content/check-content.mjs --strict target/b-preview/b1   # 0. aperçu complet et contrôle
node infra/content/build-b.mjs --level b1                                                       # 1. B1 dans content/de/b1 et crédits (jamais avec --only)
MSYS_NO_PATHCONV=1 docker run --rm -v "$(pwd -W):/repo" -v "$(pwd -W)/target/linguacap-piper-voices-v3:/voices:ro" -w /repo   linguacap-tts-v3 python -B infra/content/tts/synthesize-v3.py --content /repo/content/de --level b1   # 2. sons B1
PLAYWRIGHT_CHANNEL=msedge node infra/content/render-images.mjs                                  # 3. images (gabarits et photos libres)
node infra/content/check-content.mjs --strict                                                   # 4. contrôles, tous niveaux
node infra/content/expected-transcripts.mjs target/expected-b1.json b1 --segments               # 5. textes attendus du B1
MSYS_NO_PATHCONV=1 docker run --rm -v linguacap-whisper-models:/models -v "$(pwd -W)/infra/content/asr:/work:ro"   -v "$(pwd -W)/content/de/media/audio:/audio:ro" -v "$(pwd -W)/target:/out" linguacap-asr   python /work/check_audio.py --expected /out/expected-b1.json --audio /audio --report /out/asr-b1.json --keys '^b1-'   # 6. reconnaissance vocale
node infra/content/import-content.mjs --dry-run --level b1                                      # 7. fichiers présents, document < 2 Mo (signalé au-delà de 1,7 Mo)
node infra/content/build-b.mjs --level b1 --out target/b-kit --workbook target/b-kit            # facultatif : cahier hors ligne B1.html
```

- **Construction** (`build-b.mjs`) : sources natives de `content/b/source/<niveau>` (un module par fichier, `_level.mjs`, `_evaluations.mjs`, `_media.mjs`), ajouts de médias libres, normalisation par les fonctions partagées avec la V4 (`build-common.mjs`), sons des dictées et répétitions, son du lexique (voix de Thorsten, profil `<niveau>-lexique`), crédit des voix, prérequis en chaîne, profils audio (`b1-debut` pour les `debutModules` premiers modules, `b1-suite` ensuite), `level.json` au format 5. `--only <ids> --out <dossier>` construit un aperçu partiel (`partial: true`), que l’importeur refuse.
- **Voix** : `infra/content/tts/voices.json` (lot médias) associe `frau2`, `frau3`, `mann2`, `mann3` à un modèle Piper et, pour le modèle multilocuteur `mls` (CC BY 4.0), à un numéro de locuteur (`{ "model": "de_DE-mls-medium", "speaker": 12 }`). Sans ce fichier, ces voix sont lues par Kerstin et Thorsten (avertissement). Les répétitions sont lues par Kerstin et Thorsten, les dictées par la voix de la question. Les sons MLS signalés par la reconnaissance vocale reçoivent un second avis avec `--model medium`.
- **Débit** : profils `b1-debut` (1,03), `b1-suite` (1,00), `b1-lexique` (1,10) ; B2 `b2-debut` (1,00), `b2-suite` (0,97), `b2-lexique` (1,05). Le contrôle vérifie la fourchette du niveau d’après le manifeste (B1 : 0,95 à 1,10).
- **Enregistrements libres** : `native.file` commençant par `libre/` est lu sous `resource-langue/libre/` (hors dépôt), découpé (`clip`), normalisé (loudnorm) et converti en MP3 mono 64 kb/s par ffmpeg dans le conteneur, sans réseau ; le manifeste note `sourceFile` et `sourceSha`. Sur un poste sans la source, le MP3 préparé et versionné fait foi.

Modèles Piper et image de synthèse (Thorsten et Kerstin pour la V4 ; `mls` et `thorsten_emotional` pour les niveaux B, même révision épinglée) :

```powershell
$voiceDir = New-Item -ItemType Directory -Path target/linguacap-piper-voices-v3 -Force
$voiceBase = "https://huggingface.co/rhasspy/piper-voices/resolve/cf910fb59f1d79ab3b625a63993a108751c6c25d/de/de_DE"
foreach ($speaker in @("thorsten", "kerstin", "mls", "thorsten_emotional")) {
    foreach ($extension in @("onnx", "onnx.json")) {
        $voiceFile = "de_DE-${speaker}-medium.${extension}"
        curl.exe -fLsS --retry 2 "$voiceBase/$speaker/medium/$voiceFile" -o (Join-Path $voiceDir.FullName $voiceFile)
        if ($LASTEXITCODE -ne 0) { throw "Téléchargement de $voiceFile interrompu." }
    }
}
docker build -t linguacap-tts-v3 -f infra/content/tts/Dockerfile.v3 infra/content/tts
docker build -t linguacap-asr infra/content/asr
```

Les kits historiques restent reproductibles à partir de la V2 de référence : `node infra/content/build-v3.mjs` (V3, `target/linguacap-cours-v3-kit`) et `node infra/content/build-v3.mjs --v4` (kit V4 d’avant les couches, `target/linguacap-cours-v4-complete-kit`), puis `synthesize-v3.py --content /repo/target/<kit>/content/de`.

## Sources et licences

- Thèmes, progression et vocabulaire de base s’appuient sur **Deutsch im Blick**, 2e édition (COERLL, Université du Texas à Austin), [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Ses enregistrements natifs (vocabulaire, prononciation) et une sélection de ses photos et dessins sont repris, découpés ou recadrés, avec attribution dans chaque activité et dans la médiathèque. Les images du manuel créditées à des tiers (Wikimedia CC BY-SA, marques, photos d’archives) sont exclues.
- **Der und mehr** (German 1001–2002, Kennesaw State University, Affordable Learning Georgia, CC BY 4.0) fournit des situations, des notes culturelles et des tâches, adaptées et réécrites pour le niveau, avec attribution en fin d’activité.
- Les autres textes, dialogues, exercices et évaluations de LinguaCap sont originaux.
- Les ressources sous licence non commerciale (Willkommen, AOT) ou à droits réservés (Goethe-Institut, Deutsche Welle) ne sont **pas** intégrées.
- Les illustrations composées utilisent les pictogrammes **Lucide** (licence ISC). Les voix de synthèse viennent des modèles **Piper Thorsten** et **Kerstin** (jeux de données CC0 ; Kerstin préentraînée sur une voix Hi-Fi TTS CC BY 4.0) et, pour les niveaux B, **Thorsten émotionnel** (CC0) et **MLS** (Multilingual LibriSpeech, CC BY 4.0), détail dans `de/media/credits.json`.
- **Niveaux B, fichiers téléchargés** : Wikimedia Commons (photos sans personne identifiable, sans marque), Wikinews (CC BY 2.5), Wikipédia (CC BY-SA 4.0), Gesprochene Wikipedia (licence lue fichier par fichier), Tatoeba (phrases CC BY 2.0 FR, sans ses sons). Chaque fichier est rangé sous `resource-langue/libre/<source>/` (hors dépôt, rien n’y est exécuté) et inscrit au registre `b/libre/registre.json` (empreinte, auteur, licence, URL, modifications). Un média qui l’emploie porte `credit`, `license` et `sourceUrl` ; licences admises : CC0, Domaine public, CC BY 2.0 FR, CC BY 2.5, CC BY 3.0, CC BY 4.0, CC BY-SA 3.0, CC BY-SA 4.0 (partage à l’identique pour les médias seulement). Les crédits de `de/media/credits.json` listent chaque fichier réellement employé.

## Fichier de module

Le format est commun à toutes les versions ; le **format 4** (V4, `"format": 4` dans `level.json`) ajoute les champs signalés. Pour la V4, ces fichiers sont produits par `build-v4.mjs` : on écrit une couche dans `v4/pedagogy` (voir son [guide](v4/pedagogy/README.md)). Le **format 5** (niveaux B, `build-b.mjs`, [guide](b/README.md)) ajoute :

- les **consignes bilingues** dans le texte : `Lesen Sie den Text. [fr] Lisez le texte.` (traduction affichée, B1) ou `… [fr?] …` (aide repliée, B2) ; une ligne qui commence par `[fr] ` traduit le bloc qui la précède. Permis dans les énoncés, descriptions, consignes et listes de vérification des missions, libellés de critères, consignes du diagnostic et des évaluations ; interdits dans les titres, choix, réponses, scripts, lexique et textes alternatifs. Avant le format 5, un marqueur est une erreur ;
- la **grille des missions** `mission.criteria: [{ id, label, maxPoints }]` (6 critères au plus, 1 à 20 points ; aux niveaux B, 4 ou 5 critères pour 20 points), envoyée au catalogue seulement si elle n’est pas vide ;
- des **bornes par niveau** (profils de `infra/content/level-profiles.mjs`) : durées, longueurs, nombres de questions, répétitions, dictées, missions (B1 : oral 90 à 180 s, écrit 1 000 à 1 500 caractères), lexique, débit des sons ;
- les gabarits d’image `article`, `chart` et `forum`, et les médias téléchargés (`libre/…`, voir plus haut).

```jsonc
{
  "id": "a1-hallo",                       // identifiant du module : minuscules, chiffres, tirets
  "title": "Hallo ! Se saluer et se présenter",   // 120 caractères au plus
  "objective": "…",                       // ce que l’élève sait faire à la fin (500 caractères au plus)
  "prerequisites": [],                    // identifiants d’autres modules du même niveau
  "audioProfile": "a1-suite",             // profil de débit des sons (V3 et V4)
  "sources": ["Deutsch im Blick, Kapitel 1 (COERLL, CC BY 4.0) : thèmes et vocabulaire de base"],
  "layer": "content/v4/pedagogy/a1/a1-hallo.mjs",   // format 4 : couche fusionnée, ou null
  "grammarFocus": ["heissen-kommen-sein"],          // format 4, facultatif : module de grammaire
  "vocabulary": [ /* format 4 : lexique du module, voir ci-dessous */ ],
  "activities": [ /* 5 à 12 activités (4 à 16 au format 4), 55 à 180 minutes au total, voir ci-dessous */ ],
  "media": [ /* médias utilisés par les activités du module */ ]
}
```

### Activités

| Champ | Règle |
| --- | --- |
| `id` | unique dans le niveau, préfixé par l’identifiant du module, 40 caractères au plus, jamais `revision-…` |
| `kind` | `lesson` (lecture et écoute guidées), `exercise` (questions corrigées automatiquement) ou, au format 4, `mission` (production remise au professeur) |
| `estimatedMinutes` | 5 à 20 minutes ; un module totalise 55 à 180 minutes |
| `competences` | parmi `lecture`, `ecoute`, `expression-ecrite`, `expression-orale` |
| `lesson.title` | titre affiché |
| `lesson.description` | texte affiché à l’élève, en texte brut : explications en français, exemples et textes en allemand. Sauts de ligne conservés, puces `• `, intertitres en MAJUSCULES. Pour un exercice : consigne et, pour la lecture, le texte à lire. |
| `lesson.transcript` | laisser `null` : l’importeur y place la transcription du ou des sons de l’activité |
| `questions` | exercices seulement : 4 à 8 questions à choix (format 4 : 3 à 10 questions typées, chacune avec son `explanation`) |
| `mission` | format 4, activités `mission` seulement : `{ oral: { prompt, maxSeconds } ou null, written: { prompt, maxChars, minWords } ou null, checklist: [2 à 6 points] }` ; la situation est dans `lesson.description` |
| `placements` | supports : un son et/ou une ou plusieurs images, rattachés à l’activité, à une question (`questionId`) ou à un choix (`questionId` + `optionId`) |

Questions : `id` en minuscules (`q1`, `q2`…), `prompt` ≤ 500 caractères, choix `a`, `b`, `c`, `d` avec `label` ≤ 300 caractères. Les distracteurs sont plausibles ; la bonne réponse n’est pas toujours la première.

Au format 4, `type` vaut `choice` (défaut), `fill`, `order`, `match`, `dictation` ou `speak`, et chaque question porte une `explanation` (10 à 600 caractères) affichée après la remise, avec la réponse attendue :

```jsonc
{ "id": "q1", "type": "choice", "prompt": "…", "explanation": "…", "options": [ { "id": "a", "label": "…", "correct": true, "feedback": null }, … ] }
{ "id": "q2", "type": "fill", "prompt": "Complétez avec le connecteur.", "text": "Ich bleibe zu Hause, [[1]] ich krank bin.",
  "blanks": [ { "id": "1", "accept": ["weil"], "size": 6, "hint": null } ], "explanation": "…" }
{ "id": "q3", "type": "order", "prompt": "Remettez les mots dans l’ordre.", "answers": [ ["Ich bleibe zu Hause,", "weil", "ich", "krank", "bin."] ], "explanation": "…" }
{ "id": "q4", "type": "match", "prompt": "Associez…", "pairs": [ { "left": "warten", "right": "auf + accusatif" }, … ], "explanation": "…" }
{ "id": "q5", "type": "dictation", "prompt": "Écoutez et écrivez.", "accept": ["Der Zug fährt um zehn Uhr ab."], "voice": "mann", "showWordCount": true, "explanation": "…" }
{ "id": "q6", "type": "speak", "prompt": "Écoutez puis répétez.", "text": "Ich habe Kopfschmerzen.", "accept": ["Ich habe Kopfschmerzen."], "threshold": 75, "explanation": "…" }
```

Une dictée et une répétition ont leur son `<activité>-<question>`, rattaché à la question (transcription `after_answer` pour la dictée, `on_demand` pour le modèle à répéter) ; ces sons ne figurent pas dans la transcription de l’activité.

### Vocabulaire (format 4)

```jsonc
{ "id": "kopf", "word": "Kopf", "article": "der", "plural": "Köpfe", "partOfSpeech": "noun", "translation": "la tête",
  "example": "Mein Kopf tut weh.", "note": null, "audio": { "media": "a1-sante-lexique", "line": 0 } }
```

`partOfSpeech` : noun, verb, adjective, adverb, preposition, conjunction, pronoun, number, expression, other. Un nom a son article (sauf note « toujours au pluriel ») et une majuscule. `audio` désigne une ligne du son du lexique (`segments: true`) ; l’importeur la remplace par l’élément de médiathèque et le segment `{ start, end }` lu dans `media/audio/manifest-v3.json`.

Placements : `{ "media": "clé", "usage": "audio" | "illustration", "alt": "…", "caption": "…", "transcriptVisibility": "on_demand" | "after_answer" | "hidden", "decorative": false, "questionId": null, "optionId": null }`. Une image non décorative a un texte alternatif en français qui décrit ce qu’on voit. Un son d’exercice d’écoute utilise `after_answer`.

### Médias

Son de synthèse :

```jsonc
{ "key": "a1-hallo-dialog-audio", "kind": "audio", "title": "Hallo ! — dialogue au café",
  "script": [
    { "voice": "frau", "name": "Anna", "text": "Hallo! Ich bin Anna. Und wer bist du?" },
    { "pause": 0.6 },
    { "voice": "mann", "name": "Jonas", "text": "Hallo Anna, ich heiße Jonas." }
  ] }
```

Voix : `sprecherin` (narratrice), `sprecher` (narrateur), `frau` (femme), `mann` (homme). `pause` en secondes (0,3 à 3). La transcription est construite à partir du script (`Anna : …` quand un nom est donné). Un son dure de 10 secondes à 2 minutes ; il ne contient que de l’allemand. Une réplique peut indiquer `say`, la prononciation imposée à la voix (noms de lettres « Be, Ce, De », mots étrangers « Ihst-Said-Gälleri », composés mal découpés « Museums Insel ») ; la transcription garde `text`.

Illustration :

```jsonc
{ "key": "a1-hallo-wortschatz-bild", "kind": "image", "title": "Salutations",
  "alt": "Quatre vignettes : un soleil levant, un soleil, une lune et une main qui salue.",
  "image": { "layout": "grid", "items": [ { "icon": "sunrise", "label": "Guten Morgen!" }, … ] } }
```

Mises en page :

- `grid` : 2 à 6 pictogrammes étiquetés (vocabulaire illustré) ;
- `single` : un seul pictogramme sans texte (choix de réponse illustré ou question) ;
- `scene` : un lieu (`setting`), jusqu’à 3 personnes (`people`: `{ "name", "say" }`, bulle de 32 caractères au plus) et jusqu’à 4 objets (`items`: noms de pictogrammes).

Lieux (`setting`) : `cafe`, `street`, `home`, `classroom`, `office`, `station`, `park`, `shop`, `doctor`, `party`, `kitchen`, `hotel`, `city`, `beach`. Les noms de pictogrammes sont ceux de Lucide (liste : `infra/content/icons.txt`). Gabarits ajoutés en V4 (`document`, `cards`, `form`, `table`, `messages`, `receipt`, `ticket`, `clocks`, `route`, `plan`, `words`, `letters`, `dates`) et pour les niveaux B :

- `article` : `{ "title", "kicker"?, "byline"?, "lead"?, "paragraphs": [1 à 3 paragraphes de 600 caractères], "icon"? }` ;
- `chart` : `{ "title", "unit", "bars": [2 à 8 { "label", "value" }], "highlight"?: rang, "source"? }` (barres horizontales, valeurs affichées) ;
- `forum` : `{ "title", "posts": [1 à 4 { "author", "date"?, "text" }] }`.

`render-images.mjs --content <dossier>` rend les images d’un aperçu (par exemple `target/b-preview`) dans `<dossier>/media/images`, sans toucher `de/media`.

Enregistrement natif repris de *Deutsch im Blick* (CC BY 4.0), éventuellement découpé (`clip` : début et fin en secondes, 4 minutes au plus). La transcription est obligatoire (4 000 caractères au plus) et suit exactement ce qui est dit :

```jsonc
{ "key": "a1-zahlen-farben-native", "kind": "audio", "title": "Les couleurs — enregistrement natif",
  "native": { "file": "dib-audio/voc/voc_01_07_farben.mp3", "clip": [2.2, 38.0] },
  "transcript": "beige, blau, braun
gelb, grau
…" }
```

Photo ou dessin repris de *Deutsch im Blick* (recadrage facultatif en fractions `[x, y, largeur, hauteur]`), avec texte alternatif :

```jsonc
{ "key": "a1-essen-markt-foto", "kind": "image", "title": "Au marché",
  "alt": "Un étal de fruits avec une balance et des prix écrits à la main.",
  "photo": { "file": "dib-images/k03/img-001-001.png", "crop": [0, 0.05, 1, 0.9] } }
```

Les chemins `native.file` et `photo.file` sont relatifs à `resource-langue/extraits` (sources non versionnées), ou à `resource-langue` s’ils commencent par `libre/` (téléchargements des niveaux B, PNG ou JPEG, jamais de SVG) ; le son ou l’image préparés sont versionnés dans `media/`. Le crédit enregistré dans la médiathèque est déduit de l’origine (DiB : « Deutsch im Blick, COERLL — CC BY 4.0 » ; synthèse : voix Piper CC0 ; pictogrammes : Lucide, ISC) ; `credit` et `license` le remplacent si besoin.

## Fichier de niveau

`level.json` contient `levelId` (`a1` … `c2`, nom de son dossier), au format 4 `format: 4`, `layer` (couche `_level.mjs` ou null) et `activityMinutes` (`{ min, max }`, budget de durée des activités), `modules` (ordre des modules : `{ "id": "a1-hallo", "file": "01-hallo.json" }`), `settings` (compétences attendues, critères de réussite, seuil, durées), `diagnostic`, `assessments` (bilan `midterm` et examen blanc `final`, chacun avec quatre parties : lecture et écoute fermées, écrit et oral notés avec une grille) et `media` (médias des évaluations). Les questions du diagnostic portent `moduleRef` : un module du niveau ou `prerequis` ; des questions `prerequis` sont exigées si le niveau a un prérequis (bloc `catalogue`, sinon A2 → A1).

Au format 5 s’ajoutent `source` (dossier des sources natives) et le bloc `catalogue` : `{ "title", "description", "position", "prerequisiteLevelId" }`. L’importeur aligne le niveau du catalogue sur ce bloc (`PUT /catalogue/levels/{id}`, droit d’éditeur) et le crée s’il manque (`POST /levels`, compte administrateur ; sinon il s’arrête avec un message clair). Un aperçu partiel porte `partial: true` : les règles de niveau sont ignorées et l’import refusé.

## Test de niveau

`placement/placement.json` décrit la banque du test de niveau d’allemand, importée dans `catalogue.placement_tests` (un brouillon par langue, une banque publiée ; la précédente est retirée à la publication). Le test ne mesure que la compréhension : lecture et écoute.

```jsonc
{
  "languageId": "de", "title": "Test de niveau d’allemand", "description": "…", "sources": ["…"],
  "tiers": [
    { "code": "A1", "title": "A1 · Découverte", "passPercent": 67, "minCompetencePercent": 34, "drawCount": 12,
      "questions": [
        { "id": "a1-l01", "competence": "lecture", "moduleRef": "a1-hallo",
          "prompt": "Choisissez la forme qui convient.\n\n– Woher ___ du?\n– Ich komme aus Spanien.",
          "options": [ { "id": "a", "label": "komme", "correct": false }, … ], "placements": [] },
        { "id": "a1-h01", "competence": "ecoute", "moduleRef": "a1-essen", "prompt": "…",
          "options": [ … ], "placements": [ { "media": "placement-a1-h01", "usage": "audio", "transcriptVisibility": "hidden" } ] }
      ] }
  ],
  "media": [ /* sons de synthèse, même format que dans un module ; clés « placement-… » */ ]
}
```

- **Paliers** `A1`, `A2`, `B1`, dans l’ordre, à partir de A1. Un palier est réussi à `passPercent` (67 %) sans compétence sous `minCompetencePercent` (34 %) ; le test s’arrête au premier palier échoué et le niveau retenu est le dernier palier réussi (sinon « débutant »).
- **Banque de 18 questions par palier** : 12 de lecture (6 de vocabulaire et grammaire, 6 textes courts de la vie courante suivis d’une question de compréhension) et 6 d’écoute. Évaluations en tire `drawCount` = 12 au hasard, au prorata des compétences (8 lecture, 4 écoute), et mélange l’ordre des choix ; le choix « Je ne sais pas » (`dontknow`, identifiant réservé) est ajouté à chaque question.
- **Questions** : consigne en français, textes et sons en allemand ; l’énoncé d’une question de lecture contient le texte à lire puis la question (1 500 caractères au plus, sauts de ligne conservés). Trois choix, une seule bonne réponse indiscutable, distracteurs plausibles repris du texte ou du son, sans indice de forme (la bonne réponse n’est ni toujours au même rang, ni trop souvent la plus longue : le contrôle le signale). `moduleRef` (facultatif) rattache la question à un module du parcours du même niveau pour les statistiques.
- **Calibrage** : descripteurs du CECRL et formats des épreuves de lecture et d’écoute du Goethe-Zertifikat A1, A2 et B1 (annonces, courriels, petites annonces à apparier, articles, règlements, messages téléphoniques, dialogues, interviews, émissions de radio), avec une difficulté croissante d’un palier à l’autre : textes plus longs, syntaxe plus complexe, réponses à inférer.
- **Écoute** : un son par question, transcription masquée (`hidden`), 10 secondes à 1 minute. Les sons du palier A1 sont lus plus lentement, comme ceux du niveau A1.

## Ciné-club (films)

Le Ciné-club (EVO-055) propose, hors parcours et sans durée imposée, de **s'entraîner avec un film** : chaque film est découpé en séquences de 6 à 10 minutes, chacune en trois temps (avant de regarder : contexte et mots-clés ; regarder : lecteur YouTube et carnet de mots ; après : questions corrigées). Les trois films *Nicos Weg* de la Deutsche Welle (A1, A2, B1) sont rédigés.

**Droits (non négociables).** La vidéo n'est lue que dans le lecteur YouTube officiel (`www.youtube-nocookie.com`), jamais téléchargée ; seules les vidéos de `cine/videos.json` (chaîne officielle vérifiée par le responsable produit) sont admises. Rien n'est recopié de l'éditeur du film : ni sous-titres, ni manuscrits, ni exercices, ni images. Titres, contextes, mots-clés, questions et explications sont **originaux** ; une réplique citée compte 12 mots au plus, rarement. Le crédit visible et le lien du cours gratuit de l'éditeur sont repris de `videos.json`. Aucun accès automatisé à YouTube pour préparer un film : l'intrigue et l'ordre des épisodes se lisent sur le site public de l'éditeur, comme un enseignant prépare sa fiche.

**Source** `cine/<langue>/<filmId>.mjs` (aides de `cine/lib.mjs`, constructeurs de questions de `b/lib.mjs`) :

```js
import { DW, bi, choice, contexte, fill, match, mot, nom, order } from '../lib.mjs';
export default {
  film: { id: 'nicos-weg-a1', levelId: 'a1', title: 'Nicos Weg · A1', position: 1, videoId: '4-eDoThe6qo',
    durationSeconds: '1:43:00', courseUrl: 'https://learngerman.dw.com/de/nicos-weg/c-36519687',
    channel: DW.channel, credit: DW.credit, licenseNote: DW.licenseNote, description: '…' },
  sequences: [{
    title: 'Ankunft in Deutschland · L’arrivée en Allemagne', episodes: [1, 5], start: '0:00', end: '6:15', approx: true,
    context: contexte({ episodes: [1, 5], situation: [[de, fr], …], questions: [[de, fr], …], focus: [[de, fr]] }),
    keywords: [nom('der', 'Flughafen', 'Flughäfen', 'l’aéroport'), mot('weg', 'parti, disparu', 'remarque'), …],
    questions: [choice('q1', bi('Frage?', 'Question ?'), [['…'], ['…', true], ['…']], 'Explication…'), …],
  }],
};
```

- **Séquences** : identifiant `<filmId>-NN` et position déduits de l'ordre ; bornes en secondes ou « m:ss », « h:mm:ss » ; contiguës, dans l'ordre, sans chevauchement, de 3 à 15 minutes (6 à 10 conseillées) ; `episodes` (folgen couvertes) ne sert qu'à la source et au contexte. **`approx: true`** marque des bornes estimées (Nicos Weg : durée de chaque folge publiée par la DW, moins le générique que le film complet ne répète pas) : l'administration les vérifie en regardant, dans l'éditeur du catalogue (« Prendre le temps actuel »), puis **reporte les bornes justes dans la source** et retire `approx`.
- **Titre** : allemand, avec glose française « · » en A1 et A2 ; allemand seul à partir du B1. **Contexte** (`contexte()`) : situation sans dévoiler la suite, 2 ou 3 questions d'anticipation non notées, consignes de visionnage ; balisage du niveau comme les cours : « allemand [fr] français » jusqu'au B1 (A1 et A2 compris : la séquence montre un film en allemand), « [fr?] » à partir du B2.
- **Mots-clés** : 4 à 10 (`nom(article, mot, pluriel, traduction, remarque?)`, `mot(mot, traduction, remarque?)`), remarque de 120 caractères au plus.
- **Questions** : 5 à 8, types `choice`, `fill`, `order`, `match` seulement (corrigées par la clé d'exercice) ; énoncé « allemand [fr] français » (« [fr?] » au B2) ; une seule bonne réponse incontestable d'après la séquence ; explication en français (en allemand avec aide repliée au B2) ; place et longueur des bonnes réponses équilibrées sur le film (43 % au plus au même rang, jamais plus de 1,35 fois le plus long distracteur).

**Construction** : `node infra/content/build-cine.mjs` (options `--film <id>`, `--out <dossier>`) écrit `de/cine/<filmId>.json`, document de film au format 1, exactement le corps de `PUT /catalogue/films/{id}` : fiche du film complétée (fournisseur, adresse de la vidéo), séquences, mots-clés et questions au format du document de version (`type`, `moduleRef: null`, `options`, clé `spec`). Chaque séquence devient au catalogue la leçon `cine-<sequenceId>` (sans version, niveau du film).

**Contrôle** : `node infra/content/check-content.mjs --films` (ou `content/de/cine`, ou un fichier) : clés connues du catalogue seulement ; vidéo de la liste autorisée, chaîne, cours et crédit conformes ; adresse de la vidéo ; bornes, durées, ordre, recouvrement ; contexte bilingue et questions d'anticipation ; mots-clés ; questions (types, une bonne réponse, trous, ordres, paires, explications) ; consignes hors application ; citations de plus de 12 mots ; équilibre des choix ; taille du document. Sans `--films`, le contrôle des niveaux est inchangé.

**Import** : `node infra/content/import-content.mjs --dry-run --films [--film <id>]` (documents, tailles, bornes approchées), puis `… --api … --films [--publish]` : `PUT /catalogue/films/{id}` (création ou remplacement, statut conservé), publication si demandée et si le film est complet. Idempotent : un film déjà à jour n'est pas réécrit. Un film **modifié dans l'éditeur** depuis le dernier import (bornes ajustées) n'est pas écrasé : l'import s'arrête, sauf `--force`.

## Vérifier et importer

```bash
node infra/content/check-content.mjs [--strict] [content/de/a1 | <module>.json | placement.json]   # structure, corrigés, médias, compétences, format 4
node infra/content/import-content.mjs --dry-run [--level a1] [--placement]     # fichiers présents, taille des documents (2 Mo au plus), segments du lexique
node infra/content/import-content.mjs --api https://<site>/api/v1 --supabase https://<projet>.supabase.co   --publishable-key <clé publique> --email <éditeur> --publish    # dépôt des médias, brouillons, contrôle, publication
node infra/content/import-content.mjs --api https://<site>/api/v1 --supabase https://<projet>.supabase.co   --publishable-key <clé publique> --email <éditeur> --placement --publish    # test de niveau
node infra/content/build-cine.mjs && node infra/content/check-content.mjs --films && node infra/content/import-content.mjs --dry-run --films   # Ciné-club
node infra/content/import-content.mjs --api https://<site>/api/v1 --supabase https://<projet>.supabase.co   --publishable-key <clé publique> --email <éditeur> --films --publish    # films du Ciné-club
```

Un document au format 4 (questions typées, missions, vocabulaire) n’est accepté que par un catalogue à jour : ordre de mise en production imposé, migrations, services, passerelle, front, puis import. L’importeur refuse un niveau dont des mots du lexique n’ont pas de segment audio (sons à régénérer).

Le contrôle au format 4 vérifie en plus : types et tailles des questions, repères `[[id]]` des trous, solutions `order` de mêmes jetons, paires uniques, son et transcription des dictées et répétitions, explications, missions et compétences, vocabulaire et son du lexique, gabarits d’illustration V4, absence d’activité `-correction` et de texte qui annonce un corrigé, consignes hors application, budget de durée et place du bilan, débit des sons A1 (EVO-040) d’après le manifeste audio, taille du document d’import. Sans `--strict`, les règles de complétude ne sont des erreurs que pour les modules dotés d’une couche pédagogique (V4) ou construits d’une source native (niveaux B).

Au format 5, il vérifie aussi : balisage bilingue (forme, champ, mode du niveau, traduction de chaque énoncé et de chaque consigne allemande au B1), gabarit thème ou atelier (identifiants et types d’activité), deux missions par atelier avec leur grille de 20 points, bornes du profil du niveau, place des bonnes réponses, bloc `catalogue` et réglages, médias téléchargés (crédit, licence admise, `sourceUrl`, entrée du registre de même empreinte), voix déclarées dans `voices.json`. Un niveau sans profil (C1, C2) prend celui du B2, avec un avertissement.
