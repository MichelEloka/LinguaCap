# Contenus pédagogiques LinguaCap

Ce dossier contient les parcours d’allemand **A1** et **A2** et le **test de niveau** au format source. L’importeur les publie dans le catalogue par l’API de la plateforme : médias déposés dans la médiathèque, puis brouillon enregistré, contrôlé et publié.

## Préparer le kit V3

La V3 ajoute l’entrée en allemand par l’alphabet et les sons, des ateliers de réemploi après chaque thème et des débits audio progressifs. Les sources se trouvent dans [v3/source](v3/source) et le [guide](v3/README.md) décrit le parcours et les consignes d’import. Le kit est généré dans `target/linguacap-cours-v3-kit`, avec ses pages hors ligne, ses JSON et ses MP3.

```powershell
$voiceDir = New-Item -ItemType Directory -Path target/linguacap-piper-voices-v3 -Force
$voiceBase = "https://huggingface.co/rhasspy/piper-voices/resolve/cf910fb59f1d79ab3b625a63993a108751c6c25d/de/de_DE"
foreach ($speaker in @("thorsten", "kerstin")) {
    foreach ($extension in @("onnx", "onnx.json")) {
        $voiceFile = "de_DE-${speaker}-medium.${extension}"
        curl.exe -fLsS --retry 2 "$voiceBase/$speaker/medium/$voiceFile" -o (Join-Path $voiceDir.FullName $voiceFile)
        if ($LASTEXITCODE -ne 0) { throw "Téléchargement de $voiceFile interrompu." }
    }
}
docker build -t linguacap-tts-v3 -f infra/content/tts/Dockerfile.v3 infra/content/tts
node infra/content/build-v3.mjs
docker run --rm -v "$($PWD.Path):/repo" -v "$($voiceDir.FullName):/voices:ro" -w /repo linguacap-tts-v3 python -B infra/content/tts/synthesize-v3.py --content /repo/target/linguacap-cours-v3-kit/content/de
Push-Location target/linguacap-cours-v3-kit
node infra/content/check-content.mjs
node infra/content/import-content.mjs --dry-run
Pop-Location
Compress-Archive -Path target/linguacap-cours-v3-kit/* -DestinationPath target/LinguaCap-Cours-Allemand-V3.zip -Force
```

Le manifeste audio du kit contient les profils, durées, voix et empreintes des fichiers générés.

## Préparer le kit V4

La V4 ajoute quatre blocs sur la santé et les transports en A1, puis les démarches courantes et les connecteurs en A2. Les [sources](v4/source) définissent les nouveaux modules et leur place dans le [parcours V4](v4/README.md). Le kit est produit dans `target/linguacap-cours-v4-kit`.

Une fois l’image Docker et les modèles installés comme ci-dessus, lancez les commandes suivantes. Si le kit V3 a déjà été généré, le moteur vérifie ses empreintes et réutilise ses MP3 dans la V4.

```powershell
node infra/content/build-v3.mjs --v4
$voiceDir = Get-Item target/linguacap-piper-voices-v3
$oldAudio = "target/linguacap-cours-v3-kit/content/de/media/audio"
$newAudio = "target/linguacap-cours-v4-kit/content/de/media/audio"
if ((Test-Path "$oldAudio/manifest-v3.json") -and !(Test-Path "$newAudio/manifest-v3.json")) {
    New-Item -ItemType Directory -Path $newAudio -Force | Out-Null
    Get-ChildItem -Path $oldAudio -File | Where-Object { $_.Extension -eq ".mp3" -or $_.Name -eq "manifest-v3.json" } | Copy-Item -Destination $newAudio
}
docker run --rm -v "$($PWD.Path):/repo" -v "$($voiceDir.FullName):/voices:ro" -w /repo linguacap-tts-v3 python -B infra/content/tts/synthesize-v3.py --content /repo/target/linguacap-cours-v4-kit/content/de
Push-Location target/linguacap-cours-v4-kit
node infra/content/check-content.mjs
node infra/content/import-content.mjs --dry-run
Pop-Location
Compress-Archive -Path target/linguacap-cours-v4-kit/* -DestinationPath target/LinguaCap-Cours-Allemand-V4.zip -Force
```

```
content/
  README.md                 ce document
  de/
    a1/level.json           réglages, ordre des modules, diagnostic, bilan intermédiaire, examen blanc
    a1/01-hallo.json …      un fichier par module : activités et médias du module
    a2/…                    même organisation pour A2
    placement/placement.json  test de niveau : paliers A1, A2, B1, questions et scripts des sons d’écoute
    media/audio/*.mp3       sons générés (voix de synthèse) ou extraits de Deutsch im Blick
    media/images/*.png      illustrations générées
```

## Sources et licences

- Thèmes, progression et vocabulaire de base s’appuient sur **Deutsch im Blick**, 2e édition (COERLL, Université du Texas à Austin), [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Ses enregistrements natifs (vocabulaire, prononciation) et une sélection de ses photos et dessins sont repris, découpés ou recadrés, avec attribution dans chaque activité et dans la médiathèque. Les images du manuel créditées à des tiers (Wikimedia CC BY-SA, marques, photos d’archives) sont exclues.
- **Der und mehr** (German 1001–2002, Kennesaw State University, Affordable Learning Georgia, CC BY 4.0) fournit des situations, des notes culturelles et des tâches, adaptées et réécrites pour le niveau, avec attribution en fin d’activité.
- Les autres textes, dialogues, exercices et évaluations de LinguaCap sont originaux.
- Les ressources sous licence non commerciale (Willkommen, AOT) ou à droits réservés (Goethe-Institut, Deutsche Welle) ne sont **pas** intégrées.
- Les illustrations composées utilisent les pictogrammes **Lucide** (licence ISC). Les voix de synthèse viennent du modèle **Piper Thorsten** (jeu de données CC0), les voix féminines par transformation de hauteur (détail dans `media/credits.json`).

## Fichier de module

```jsonc
{
  "id": "a1-hallo",                       // identifiant du module : minuscules, chiffres, tirets
  "title": "Hallo ! Se saluer et se présenter",   // 120 caractères au plus
  "objective": "…",                       // ce que l’élève sait faire à la fin (500 caractères au plus)
  "prerequisites": [],                    // identifiants d’autres modules du même niveau
  "sources": ["Deutsch im Blick, Kapitel 1 (COERLL, CC BY 4.0) : thèmes et vocabulaire de base"],
  "activities": [ /* 5 à 12 activités, 55 à 180 minutes au total, voir ci-dessous */ ],
  "media": [ /* médias utilisés par les activités du module */ ]
}
```

### Activités

| Champ | Règle |
| --- | --- |
| `id` | unique dans le niveau, préfixé par l’identifiant du module, 40 caractères au plus, jamais `revision-…` |
| `kind` | `lesson` (lecture et écoute guidées) ou `exercise` (questions corrigées automatiquement) |
| `estimatedMinutes` | 5 à 20 minutes ; un module totalise 55 à 180 minutes |
| `competences` | parmi `lecture`, `ecoute`, `expression-ecrite`, `expression-orale` |
| `lesson.title` | titre affiché |
| `lesson.description` | texte affiché à l’élève, en texte brut : explications en français, exemples et textes en allemand. Sauts de ligne conservés, puces `• `, intertitres en MAJUSCULES. Pour un exercice : consigne et, pour la lecture, le texte à lire. |
| `lesson.transcript` | laisser `null` : l’importeur y place la transcription du ou des sons de l’activité |
| `questions` | exercices seulement : 4 à 8 questions, chacune 3 ou 4 choix et **une seule** bonne réponse |
| `placements` | supports : un son et/ou une ou plusieurs images, rattachés à l’activité, à une question (`questionId`) ou à un choix (`questionId` + `optionId`) |

Questions : `id` en minuscules (`q1`, `q2`…), `prompt` ≤ 500 caractères, choix `a`, `b`, `c`, `d` avec `label` ≤ 300 caractères. Les distracteurs sont plausibles ; la bonne réponse n’est pas toujours la première.

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

Lieux (`setting`) : `cafe`, `street`, `home`, `classroom`, `office`, `station`, `park`, `shop`, `doctor`, `party`, `kitchen`, `hotel`, `city`, `beach`. Les noms de pictogrammes sont ceux de Lucide (liste : `infra/content/icons.txt`).

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

Les chemins `native.file` et `photo.file` sont relatifs à `resource-langue/extraits` (sources non versionnées) ; le son ou l’image préparés sont versionnés dans `media/`. Le crédit enregistré dans la médiathèque est déduit de l’origine (DiB : « Deutsch im Blick, COERLL — CC BY 4.0 » ; synthèse : voix Piper CC0 ; pictogrammes : Lucide, ISC) ; `credit` et `license` le remplacent si besoin.

## Fichier de niveau

`level.json` contient `levelId` (`a1` ou `a2`), `modules` (ordre des modules : `{ "id": "a1-hallo", "file": "01-hallo.json" }`), `settings` (compétences attendues, critères de réussite, seuil, durées), `diagnostic`, `assessments` (bilan `midterm` et examen blanc `final`, chacun avec quatre parties : lecture et écoute fermées, écrit et oral notés avec une grille) et `media` (médias des évaluations). Les questions du diagnostic portent `moduleRef` : un module du niveau ou `prerequis`.

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

## Vérifier, générer, importer

```bash
node infra/content/check-content.mjs                 # structure, corrigés, médias, compétences, test de niveau
PLAYWRIGHT_CHANNEL=msedge node infra/content/render-images.mjs     # illustrations et photos → media/images
docker build -t linguacap-tts infra/content/tts
MSYS_NO_PATHCONV=1 docker run --rm -v linguacap-piper-voices:/voices:ro -v "$(pwd -W):/repo" -w /repo   linguacap-tts python infra/content/tts/synthesize.py            # synthèse et enregistrements natifs → media/audio (niveaux et test de niveau ; --only clé … pour quelques sons)
node infra/content/expected-transcripts.mjs expected.json [a1 a2 placement]   # texte attendu de chaque son
docker build -t linguacap-asr infra/content/asr
MSYS_NO_PATHCONV=1 docker run --rm -v linguacap-whisper-models:/models -v "$(pwd -W)/infra/content/asr:/work:ro"   -v "$(pwd -W)/content/de/media/audio:/audio:ro" -v "$(pwd -W):/out" linguacap-asr   python /work/check_audio.py --expected /out/expected.json --audio /audio --report /out/report.json   # contrôle des sons par reconnaissance vocale
node infra/content/import-content.mjs --dry-run [--placement]     # fichiers présents, taille des documents
node infra/content/import-content.mjs --api https://<site>/api/v1 --supabase https://<projet>.supabase.co   --publishable-key <clé publique> --email <éditeur> --publish    # dépôt des médias, brouillons, contrôle, publication
node infra/content/import-content.mjs --api https://<site>/api/v1 --supabase https://<projet>.supabase.co   --publishable-key <clé publique> --email <éditeur> --placement --publish    # test de niveau
```
