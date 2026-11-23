// Couche pédagogique V4 · A1 · L’alphabet et l’épellation.
const REPEAT = 'Écoutez le modèle, puis dites la phrase à voix haute.';
const speak = (id, text, explanation, accept = [text]) => ({ id, type: 'speak', prompt: REPEAT, text, accept, explanation });

export default {
  module: 'a1-abc',
  // Jana était lue par une voix d’homme : l’accueil passe à la voix « mann », Jana à la voix « frau ».
  media: [
    {
      key: 'a1-abc-dialogue', kind: 'audio', title: 'Das Alphabet · Écouter et épeler son nom · scène',
      script: [
        { voice: 'mann', text: 'Guten Tag. Wie heißen Sie?' },
        { voice: 'frau', text: 'Ich heiße Jana. J, A, N, A.' },
        { voice: 'mann', text: 'Noch einmal, bitte. Langsam, bitte.' },
        { voice: 'frau', text: 'J. A. N. A. Jana.' },
        { voice: 'mann', text: 'Danke, Jana!' },
      ],
    },
  ],
  vocabulary: [
    { id: 'alphabet', word: 'Alphabet', article: 'das', plural: 'Alphabete', partOfSpeech: 'noun', translation: 'l’alphabet', example: 'Das Alphabet hat sechsundzwanzig Buchstaben.', note: null },
    { id: 'buchstabe', word: 'Buchstabe', article: 'der', plural: 'Buchstaben', partOfSpeech: 'noun', translation: 'la lettre (de l’alphabet)', example: 'Der erste Buchstabe ist J.', note: null },
    { id: 'name', word: 'Name', article: 'der', plural: 'Namen', partOfSpeech: 'noun', translation: 'le nom', example: 'Mein Name ist Vera Weber.', note: null },
    { id: 'vorname', word: 'Vorname', article: 'der', plural: 'Vornamen', partOfSpeech: 'noun', translation: 'le prénom', example: 'Mein Vorname ist Jana.', note: null },
    { id: 'nachname', word: 'Nachname', article: 'der', plural: 'Nachnamen', partOfSpeech: 'noun', translation: 'le nom de famille', example: 'Wie ist Ihr Nachname?', note: null },
    { id: 'heissen', word: 'heißen', article: null, plural: null, partOfSpeech: 'verb', translation: 's’appeler', example: 'Wie heißen Sie?', note: 'ich heiße, du heißt, Sie heißen' },
    { id: 'schreiben', word: 'schreiben', article: null, plural: null, partOfSpeech: 'verb', translation: 'écrire', example: 'Bitte schreiben Sie Ihren Namen.', note: 'Wie schreibt man das ? : comment ça s’écrit ?' },
    { id: 'buchstabieren', word: 'buchstabieren', article: null, plural: null, partOfSpeech: 'verb', translation: 'épeler', example: 'Können Sie das bitte buchstabieren?', note: null },
    { id: 'wie-bitte', word: 'Wie bitte?', article: null, plural: null, partOfSpeech: 'expression', translation: 'Pardon ? Comment ? (pour faire répéter)', example: 'Wie bitte? Wie heißen Sie?', note: null },
    { id: 'noch-einmal', word: 'noch einmal', article: null, plural: null, partOfSpeech: 'expression', translation: 'encore une fois', example: 'Noch einmal, bitte.', note: null },
    { id: 'langsam', word: 'langsam', article: null, plural: null, partOfSpeech: 'adjective', translation: 'lent ; lentement', example: 'Langsam, bitte!', note: null },
    { id: 'bitte', word: 'bitte', article: null, plural: null, partOfSpeech: 'expression', translation: 's’il vous plaît ; je vous en prie', example: 'Noch einmal, bitte.', note: null },
    { id: 'danke', word: 'danke', article: null, plural: null, partOfSpeech: 'expression', translation: 'merci', example: 'Danke, Jana!', note: null },
    { id: 'guten-tag', word: 'Guten Tag!', article: null, plural: null, partOfSpeech: 'expression', translation: 'Bonjour !', example: 'Guten Tag! Wie heißen Sie?', note: null },
  ],
  activities: {
    'a1-abc-guide': {
      title: 'Découvrir : l’alphabet allemand',
      estimatedMinutes: 15,
      lesson: {
        title: 'Découvrir : l’alphabet allemand',
        description: `L’ALPHABET ALLEMAND · 15 MIN

Écoutez l’alphabet une première fois en suivant le tableau. Vous entendez le nom de chaque lettre : c’est ce nom qu’on utilise pour épeler. Dans un mot, la même lettre peut avoir un autre son.

A B C D E F G | H I J K L M N
O P Q R S T U | V W X Y Z

1. Écouter par groupes (4 min). Écoutez un groupe à la fois et mettez sur pause après G, après N, puis après U. Reprenez quand vous suivez sans perdre votre place.
2. Répéter (5 min). Dites les lettres par groupes de trois, en respirant entre deux groupes, et comparez votre voix au modèle. E se dit « é », I se dit « i » et U se dit « ou » : jamais « eu » ni « u ».
3. Les quatre lettres pièges (4 min). J s’appelle Jot (« yot »), V s’appelle Vau (« faou »), W se dit « vé » et Z se dit « tsètt ». Réécoutez ces quatre lettres. Retenez surtout ceci : quand on vous épelle « vé », on écrit W, pas V.
4. Épeler un prénom (2 min). Épelez à voix haute LINA, TOM et JANA, puis votre prénom, deux fois de suite, sans regarder le tableau la deuxième fois.`,
      },
    },
    'a1-abc-pratique': {
      title: 'Comprendre : épeler et faire répéter',
      estimatedMinutes: 12,
      lesson: {
        title: 'Comprendre : épeler et faire répéter',
        description: `ÉPELER À L’ACCUEIL · 12 MIN

L’allemand ajoute quatre signes à l’alphabet : Ä, Ö, Ü et ß. Gardez toujours les deux points (le tréma) de Ä, Ö et Ü : sans eux, c’est un autre mot. ß s’appelle Eszett et se prononce comme un s dur. Vous travaillerez leurs sons au module suivant.

TROIS PHRASES POUR SE PRÉSENTER
• Wie heißen Sie? — Comment vous appelez-vous ?
• Ich heiße Jana. — Je m’appelle Jana.
• Wie schreibt man das? — Comment ça s’écrit ?

DEUX PHRASES POUR FAIRE RÉPÉTER
• Noch einmal, bitte. — Encore une fois, s’il vous plaît.
• Langsam, bitte. — Lentement, s’il vous plaît.
Pour préciser une lettre, on ajoute un mot connu avec « wie » (comme) : « J wie Jana ».

À VOUS
1. Écoutez la petite scène sans lire la transcription : quel prénom est épelé ?
2. Réécoutez en lisant la transcription. Repérez la demande de répétition et la deuxième épellation, plus lente.
3. Répétez chaque réplique pendant une pause, puis redites la scène avec votre propre prénom.`,
      },
    },
    'a1-abc-controle': {
      title: 'Vérifier : comprendre un prénom épelé',
      estimatedMinutes: 10,
      lesson: {
        title: 'Vérifier : comprendre un prénom épelé',
        description: 'Écoutez la scène une première fois pour comprendre la situation. Lisez les questions, puis réécoutez pour les détails. Les deux dernières questions portent sur le nom des lettres. La transcription s’affiche après votre réponse.',
      },
      explanations: {
        q1: 'Après « Wie heißen Sie? », on entend « Ich heiße Jana », puis les lettres J, A, N, A. Lana et Anna ne commencent pas par le son « yot ».',
        q2: 'La personne épelle d’abord « Jot » : c’est le nom allemand de J. Un francophone pense souvent à Y ou à G, qui s’appellent « upsilon » et « gué ».',
        q3: 'La suite épelée est J–A–N–A : le prénom se termine par A, prononcé comme en français.',
        q4: '« Noch einmal, bitte. Langsam, bitte. » : noch einmal veut dire « encore une fois » et langsam « lentement ». La personne veut réentendre l’épellation, plus lentement.',
        q5: 'En allemand, W s’appelle « vé » et V s’appelle Vau (« faou ») : deux noms différents. Jot est le nom de J.',
        q6: 'Eszett est le nom de ß, qui se prononce comme un s dur (die Straße). Les deux points de Ü sont un tréma, et Z s’appelle « tsètt ».',
      },
    },
    'a1-abc-mission': {
      kind: 'mission',
      title: 'Mission : épeler son nom à l’accueil',
      estimatedMinutes: 15,
      competences: ['expression-orale', 'expression-ecrite'],
      lesson: {
        title: 'Mission : épeler son nom à l’accueil',
        description: `Vous vous inscrivez à un cours de langue. À l’accueil, on vous demande votre nom et comment il s’écrit. On ne vous comprend pas du premier coup : vous épelez une deuxième fois, plus lentement.

MODÈLE
– Guten Tag! Wie heißen Sie?
– Ich heiße Vera Weber.
– Wie schreibt man das?
– V, E, R, A. W, E, B, E, R.
– Noch einmal, bitte. Langsam, bitte.
– V … E … R … A. W … E … B … E … R.
– Danke!`,
      },
      mission: {
        oral: {
          prompt: 'Enregistrez votre réponse à l’accueil : saluez, dites votre prénom et votre nom (réels ou inventés), puis épelez-les avec les noms allemands des lettres. Imaginez qu’on vous répond « Noch einmal, bitte » : épelez une deuxième fois, plus lentement.',
          maxSeconds: 60,
        },
        written: {
          prompt: 'Écrivez la scène en allemand, comme le modèle : la question de l’accueil, votre réponse, la question « Wie schreibt man das? », votre épellation, la demande de répétition et votre deuxième épellation.',
          maxChars: 600,
          minWords: 15,
        },
        checklist: [
          'J’ai dit « Ich heiße … » avec mon prénom et mon nom.',
          'J’ai épelé avec les noms allemands des lettres : E se dit « é », U se dit « ou », J se dit « yot ».',
          'J’ai bien distingué V (« faou ») et W (« vé ») ; si mon nom n’en contient pas, j’ai aussi épelé Vera Weber.',
          'J’ai épelé une deuxième fois, plus lentement, après « Noch einmal, bitte ».',
          'Mon texte reprend Wie heißen Sie?, Wie schreibt man das? et Noch einmal, bitte.',
        ],
      },
    },
  },
  add: [
    {
      after: 'a1-abc-pratique',
      activity: {
        id: 'a1-abc-entrainer',
        kind: 'exercise',
        title: 'S’entraîner : les lettres et l’épellation',
        estimatedMinutes: 10,
        competences: ['lecture', 'expression-ecrite'],
        lesson: {
          title: 'S’entraîner : les lettres et l’épellation',
          description: 'Associez les lettres à leur nom, écrivez les noms qu’on vous épelle, puis complétez les phrases de la scène. Les épellations sont notées comme on les entend : « faou » pour V, « vé » pour W, « yot » pour J, « tsètt » pour Z.',
          transcript: null,
        },
        placements: [],
        questions: [
          {
            id: 'q1', type: 'match', prompt: 'Associez chaque lettre à son nom allemand.',
            pairs: [
              { left: 'J', right: '« yot »' },
              { left: 'V', right: '« faou »' },
              { left: 'W', right: '« vé »' },
              { left: 'Z', right: '« tsètt »' },
              { left: 'E', right: '« é »' },
              { left: 'U', right: '« ou »' },
            ],
            explanation: 'Les noms allemands de J, V, W et Z surprennent un francophone : V se dit « faou » et W « vé ». E se dit « é » et U « ou », jamais « eu » ni « u » comme en français.',
          },
          {
            id: 'q2', type: 'fill', prompt: 'On vous épelle un prénom : « faou – é – èr – a ». Écrivez-le.',
            text: 'Vorname: [[1]]', blanks: [{ id: '1', accept: ['Vera'], size: 8, hint: null }],
            explanation: '« Faou » est le nom de V, « é » celui de E et « èr » celui de R : on écrit Vera. Le piège serait d’écrire W, dont le nom est « vé ».',
          },
          {
            id: 'q3', type: 'fill', prompt: 'On vous épelle un nom de famille : « vé – é – bé – é – èr ». Écrivez-le.',
            text: 'Nachname: [[1]]', blanks: [{ id: '1', accept: ['Weber'], size: 8, hint: null }],
            explanation: '« Vé » désigne W en allemand : on écrit Weber. Si vous avez écrit Veber, vous avez lu « vé » à la française.',
          },
          {
            id: 'q4', type: 'fill', prompt: 'On vous épelle un prénom : « yot – o – ha – a – èn – èn – a ». Écrivez-le.',
            text: 'Vorname: [[1]]', blanks: [{ id: '1', accept: ['Johanna'], size: 10, hint: null }],
            explanation: '« Yot » est le nom de J et « ha » celui de H : on écrit Johanna, avec deux n. Un francophone écrit souvent Y en entendant « yot ».',
          },
          {
            id: 'q5', type: 'fill', prompt: 'On vous épelle un prénom : « tsètt – o – é ». Écrivez-le.',
            text: 'Vorname: [[1]]', blanks: [{ id: '1', accept: ['Zoe'], size: 8, hint: null }],
            explanation: 'Z s’appelle « tsètt » : on écrit Zoe. On retrouve ce son [ts] au début de mots comme Zug (le train) ou Zeit (le temps).',
          },
          {
            id: 'q6', type: 'fill', prompt: 'Complétez la scène à l’accueil avec le verbe heißen.',
            text: 'Wie [[1]] Sie? – Ich [[2]] Vera.',
            blanks: [{ id: '1', accept: ['heißen'], size: 8, hint: 'heißen' }, { id: '2', accept: ['heiße'], size: 8, hint: 'heißen' }],
            explanation: 'Avec Sie (vous), le verbe se termine par -en : Sie heißen. Avec ich, il se termine par -e : ich heiße. Le ß se prononce comme un s dur.',
          },
          {
            id: 'q7', type: 'fill', prompt: 'Vous n’avez pas compris. Complétez les deux demandes.',
            text: '[[1]] einmal, bitte. [[2]], bitte.',
            blanks: [{ id: '1', accept: ['Noch'], size: 6, hint: 'encore' }, { id: '2', accept: ['Langsam'], size: 8, hint: 'lentement' }],
            explanation: 'Noch einmal signifie « encore une fois » et langsam « lentement ». Avec bitte, ces deux formules suffisent pour faire répéter poliment.',
          },
          {
            id: 'q8', type: 'order', prompt: 'Remettez les mots dans l’ordre pour demander comment le nom s’écrit.',
            answers: [['Wie', 'schreibt', 'man', 'das?']],
            explanation: 'Dans une question qui commence par un mot interrogatif comme wie, le verbe conjugué vient juste après : Wie schreibt man das? Man veut dire « on ».',
          },
          {
            id: 'q9', type: 'choice', prompt: 'Vous voulez préciser que la première lettre est J. Que dites-vous ?',
            options: [
              { id: 'a', label: 'J wie Jana.', correct: true },
              { id: 'b', label: 'J mit Jana.', correct: false },
              { id: 'c', label: 'J aus Jana.', correct: false },
            ],
            explanation: 'Pour préciser une lettre, on donne un mot connu avec wie (comme) : « J wie Jana ». Mit signifie « avec » et aus « de » : ils ne servent pas à épeler.',
          },
        ],
      },
    },
    {
      after: 'a1-abc-entrainer',
      activity: {
        id: 'a1-abc-repeter',
        kind: 'exercise',
        title: 'Répéter à voix haute : se présenter et faire répéter',
        estimatedMinutes: 8,
        competences: ['expression-orale'],
        lesson: {
          title: 'Répéter à voix haute : se présenter et faire répéter',
          description: 'Écoutez chaque modèle autant de fois que nécessaire, puis dites la phrase sans vous presser. Articulez chaque mot : la reconnaissance vocale compare votre phrase au modèle.',
          transcript: null,
        },
        placements: [],
        questions: [
          speak('q1', 'Guten Tag! Wie heißen Sie?', 'Wie heißen Sie? est la question polie pour demander le nom. Le h de heißen se prononce comme un souffle, et ei se dit « aï ».'),
          speak('q2', 'Ich heiße Jana.', 'Le ch de ich est un souffle doux, la langue près du palais. Heiße compte deux syllabes : HEI-ße.'),
          speak('q3', 'Wie schreibt man das?', 'Le w de wie se prononce comme un v français. Dans schreibt, sch se dit « ch » et ei se dit « aï ».'),
          speak('q4', 'Noch einmal, bitte.', 'Après o, le ch de noch se forme au fond de la gorge. L’accent tombe sur la première syllabe : EIN-mal.'),
          speak('q5', 'Langsam, bitte.', 'Accentuez la première syllabe : LANG-sam. Le s placé devant une voyelle se prononce comme un z français.'),
          speak('q6', 'Mein Name ist Vera Weber.', 'Vera et Weber commencent par le même son [v], mais pas par la même lettre : V (« faou ») pour Vera, W (« vé ») pour Weber.'),
        ],
      },
    },
  ],
  order: ['a1-abc-guide', 'a1-abc-pratique', 'a1-abc-entrainer', 'a1-abc-repeter', 'a1-abc-controle', 'a1-abc-mission'],
};
