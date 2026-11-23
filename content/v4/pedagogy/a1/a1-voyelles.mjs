// Couche pédagogique V4 · A1 · Voyelles : trémas et groupes de lettres.
const REPEAT = 'Écoutez le modèle, puis dites la phrase à voix haute.';
const speak = (id, text, explanation, accept = [text]) => ({ id, type: 'speak', prompt: REPEAT, text, accept, explanation });

export default {
  module: 'a1-voyelles',
  vocabulary: [
    { id: 'buch', word: 'Buch', article: 'das', plural: 'Bücher', partOfSpeech: 'noun', translation: 'le livre', example: 'Mein Buch ist blau.', note: null },
    { id: 'haus', word: 'Haus', article: 'das', plural: 'Häuser', partOfSpeech: 'noun', translation: 'la maison', example: 'Das Haus ist neu.', note: null },
    { id: 'kaese', word: 'Käse', article: 'der', plural: null, partOfSpeech: 'noun', translation: 'le fromage', example: 'Der Käse ist gut.', note: null },
    { id: 'schoen', word: 'schön', article: null, plural: null, partOfSpeech: 'adjective', translation: 'beau, joli', example: 'Das Buch ist sehr schön.', note: 'avec tréma ; sans tréma, schon veut dire « déjà »' },
    { id: 'schon', word: 'schon', article: null, plural: null, partOfSpeech: 'adverb', translation: 'déjà', example: 'Ich bin schon hier.', note: null },
    { id: 'neu', word: 'neu', article: null, plural: null, partOfSpeech: 'adjective', translation: 'neuf, nouveau', example: 'Das Buch ist neu.', note: null },
    { id: 'blau', word: 'blau', article: null, plural: null, partOfSpeech: 'adjective', translation: 'bleu', example: 'Dein Buch ist blau.', note: null },
    { id: 'gruen', word: 'grün', article: null, plural: null, partOfSpeech: 'adjective', translation: 'vert', example: 'Mein Buch ist grün.', note: null },
    { id: 'spaet', word: 'spät', article: null, plural: null, partOfSpeech: 'adjective', translation: 'tard', example: 'Es ist schon spät.', note: null },
    { id: 'hier', word: 'hier', article: null, plural: null, partOfSpeech: 'adverb', translation: 'ici', example: 'Die Bücher sind hier.', note: null },
    { id: 'mein', word: 'mein', article: null, plural: null, partOfSpeech: 'pronoun', translation: 'mon', example: 'Das hier ist mein Buch.', note: 'au pluriel : meine Bücher' },
    { id: 'dein', word: 'dein', article: null, plural: null, partOfSpeech: 'pronoun', translation: 'ton', example: 'Dein Buch ist blau.', note: 'au pluriel : deine Bücher' },
    { id: 'zwei', word: 'zwei', article: null, plural: null, partOfSpeech: 'number', translation: 'deux', example: 'Hier sind zwei Bücher.', note: null },
    { id: 'drei', word: 'drei', article: null, plural: null, partOfSpeech: 'number', translation: 'trois', example: 'Eins, zwei, drei.', note: null },
    { id: 'sieben', word: 'sieben', article: null, plural: null, partOfSpeech: 'number', translation: 'sept', example: 'Ich habe sieben Bücher.', note: null },
  ],
  activities: {
    'a1-voyelles-guide': {
      title: 'Découvrir : de la lettre au son',
      estimatedMinutes: 15,
      lesson: {
        title: 'Découvrir : de la lettre au son',
        description: `DE LA LETTRE AU SON · 15 MIN

Pour prononcer un mot allemand, lisez les groupes de lettres : un groupe peut correspondre à un seul son. Écoutez et reproduisez d’abord des mots entiers.

1. Les trémas (5 min). Comparez schon (déjà) et schön (beau). Pour ö, dites « é » en arrondissant les lèvres : on obtient le « eu » de « peu ». Pour ü, gardez les lèvres arrondies comme pour le « u » de « lune ». Ä se rapproche d’un « è » : spät, Käse. Comparez Buch et Bücher : les deux points changent le son et le mot.
2. ei et ie (4 min). Dans mein et zwei, ei se dit « aï ». Dans sieben et hier, ie est un i long. Retenez : on prononce la deuxième lettre du groupe. Évitez de faire deux syllabes dans mein.
3. eu, äu et au (3 min). Eu et äu se prononcent de la même façon, à peu près « oï » : neu, Häuser. Au se dit « aou » : Haus, blau. Alternez neu et Haus et écoutez la différence.
4. Premiers blocs (3 min). Répétez « zwei Bücher », « mein Haus », « hier », « sehr schön ». Dites chaque bloc d’une seule respiration, en regardant les points sur les voyelles.`,
      },
    },
    'a1-voyelles-pratique': {
      title: 'Comprendre : voyelles longues, brèves et arrondies',
      estimatedMinutes: 12,
      lesson: {
        title: 'Comprendre : voyelles longues, brèves et arrondies',
        description: `ENTENDRE LES VOYELLES · 12 MIN

1. I long, i bref (4 min). Réécoutez bieten et bitten dans le modèle. Dans bieten, le i est tenu ; dans bitten, suivi de deux consonnes, il est bref. Seule la voyelle change de durée, pas le reste du mot. Répétez trois fois, puis dites « sieben Bücher ».
2. Une phrase d’un trait (3 min). Lisez à voix haute « Mein Buch ist neu. Die Bücher sind hier. ». Repérez les deux points de Bücher, puis les groupes ei (mein), eu (neu) et ie (hier).
3. La petite scène (5 min). Premier passage : parle-t-on de livres ou de vêtements ? Deuxième passage : repérez un nombre et une couleur. Troisième passage : lisez la transcription et répétez chaque réplique pendant une pause.`,
      },
      placements: { add: [{ media: 'a1-voyelles-modele', usage: 'audio', transcriptVisibility: 'on_demand', decorative: false }] },
    },
    'a1-voyelles-controle': {
      title: 'Vérifier : voyelles et trémas',
      estimatedMinutes: 10,
      lesson: {
        title: 'Vérifier : voyelles et trémas',
        description: 'Écoutez la scène une première fois pour la situation, puis lisez les questions et réécoutez pour les détails. Les deux dernières questions portent sur l’écriture des voyelles. La transcription s’affiche après votre réponse.',
      },
      explanations: {
        q1: 'La première voix compte « Eins, zwei, drei » et l’autre reprend « Drei Bücher? » : il y a trois livres. Zwei (deux) n’est qu’une étape du comptage.',
        q2: '« Oh, dein Buch ist blau » : le livre de l’autre personne (dein Buch) est bleu. Grün (vert) décrit « mein Buch », le livre de la première voix.',
        q3: 'Dans « Ist das Buch neu? », neu veut dire « neuf, nouveau » ; eu s’y prononce « oï ». Blau et grün sont des couleurs.',
        q4: 'La scène finit par « Das neue Buch ist schön » : on entend le ö arrondi. Schon, sans tréma, signifie « déjà », et spät « tard ».',
        q5: 'Ie se lit comme un i long : sieben, hier. Ei se lit « aï » (mein, zwei) et eu se lit « oï » (neu).',
        q6: 'Le singulier Buch s’écrit avec u, le pluriel Bücher avec ü. Supprimer les points (Bucher) ou en ajouter au singulier (Büch) donne un mot qui n’existe pas.',
      },
    },
    'a1-voyelles-mission': {
      kind: 'mission',
      title: 'Mission : présenter ses livres',
      estimatedMinutes: 15,
      competences: ['expression-orale', 'expression-ecrite'],
      lesson: {
        title: 'Mission : présenter ses livres',
        description: `Vous montrez vos livres à une personne du cours. Vous dites combien il y en a, de quelle couleur ils sont et s’ils sont neufs, en faisant bien entendre les voyelles.

MODÈLE
Hier sind zwei Bücher. Mein Buch ist blau. Meine Bücher sind grün. Das Buch ist neu und sehr schön.`,
      },
      mission: {
        oral: {
          prompt: 'Enregistrez une courte présentation de vos livres, réels ou imaginaires : combien il y en a, leur couleur (blau, grün…) et s’ils sont neufs. Employez au moins une fois Bücher, hier, zwei et schön.',
          maxSeconds: 45,
        },
        written: {
          prompt: 'Écrivez les phrases que vous avez dites (au moins trois phrases), avec tous les trémas.',
          maxChars: 400,
          minWords: 12,
        },
        checklist: [
          'J’ai fait entendre la différence entre ei (zwei, mein) et ie (hier, sieben).',
          'J’ai arrondi les lèvres pour ü dans Bücher et pour ö dans schön.',
          'J’ai donné un nombre et une couleur pour mes livres.',
          'Mon texte garde tous les trémas : Bücher, schön, grün.',
        ],
      },
    },
  },
  add: [
    {
      after: 'a1-voyelles-pratique',
      activity: {
        id: 'a1-voyelles-entrainer',
        kind: 'exercise',
        title: 'S’entraîner : écrire les voyelles',
        estimatedMinutes: 10,
        competences: ['lecture', 'expression-ecrite'],
        lesson: {
          title: 'S’entraîner : écrire les voyelles',
          description: 'Associez les groupes de lettres à leur son, puis complétez les mots avec la bonne voyelle. Pour les trémas, utilisez la barre de caractères (ä, ö, ü).',
          transcript: null,
        },
        placements: [],
        questions: [
          {
            id: 'q1', type: 'match', prompt: 'Associez chaque groupe de lettres au son qu’il note (approximation française).',
            pairs: [
              { left: 'ei (mein)', right: '« aï »' },
              { left: 'ie (hier)', right: '« i » long' },
              { left: 'eu (neu)', right: '« oï »' },
              { left: 'au (Haus)', right: '« aou »' },
              { left: 'ö (schön)', right: '« eu » de « peu »' },
              { left: 'ü (grün)', right: '« u » de « lune »' },
            ],
            explanation: 'Ei se lit « aï » et ie se lit « i » : on prononce la deuxième lettre du groupe. Eu se dit « oï », au « aou ». Ö et ü sont des voyelles arrondies, proches du « eu » et du « u » français.',
          },
          {
            id: 'q2', type: 'fill', prompt: 'Complétez avec u ou ü.',
            text: 'ein B[[1]]ch – zwei B[[2]]cher – Das Buch ist gr[[3]]n.',
            blanks: [{ id: '1', accept: ['u'], size: 2, hint: null }, { id: '2', accept: ['ü'], size: 2, hint: null }, { id: '3', accept: ['ü'], size: 2, hint: null }],
            explanation: 'Le pluriel Bücher prend un tréma : u devient ü. Grün s’écrit aussi avec ü. Sans les points, le son change et le mot n’existe pas (Bucher, grun).',
          },
          {
            id: 'q3', type: 'fill', prompt: 'Complétez avec ei, ie ou eu.',
            text: 'M[[1]]n Buch ist h[[2]]r. Zw[[3]] Bücher sind n[[4]].',
            blanks: [
              { id: '1', accept: ['ei'], size: 3, hint: null },
              { id: '2', accept: ['ie'], size: 3, hint: null },
              { id: '3', accept: ['ei'], size: 3, hint: null },
              { id: '4', accept: ['eu'], size: 3, hint: null },
            ],
            explanation: 'Mein et zwei s’écrivent ei (son « aï »), hier s’écrit ie (i long) et neu s’écrit eu (son « oï »). Le piège : écrire ie pour le son « aï ».',
          },
          {
            id: 'q4', type: 'fill', prompt: 'Écrivez le pluriel de Haus.',
            text: 'ein Haus – zwei [[1]]',
            blanks: [{ id: '1', accept: ['Häuser'], size: 8, hint: null }],
            explanation: 'Au pluriel, Haus prend un tréma et la terminaison -er : Häuser. Le groupe äu se prononce comme eu, « oï ».',
          },
          {
            id: 'q5', type: 'choice', prompt: 'Dans quel mot le i est-il long ?',
            options: [
              { id: 'a', label: 'bitten', correct: false },
              { id: 'b', label: 'bieten', correct: true },
              { id: 'c', label: 'Tisch', correct: false },
            ],
            explanation: 'Le groupe ie note un i long : bieten. Dans bitten et Tisch, le i est suivi de plusieurs consonnes (tt, sch) : il reste bref.',
          },
          {
            id: 'q6', type: 'match', prompt: 'Associez chaque mot à sa traduction.',
            pairs: [
              { left: 'schon', right: 'déjà' },
              { left: 'schön', right: 'beau' },
              { left: 'spät', right: 'tard' },
              { left: 'neu', right: 'neuf' },
            ],
            explanation: 'Schon et schön ne diffèrent que par le tréma, mais n’ont pas le même sens : déjà et beau. Spät (tard) se prononce avec un ä proche de « è ».',
          },
          {
            id: 'q7', type: 'order', prompt: 'Remettez les mots dans l’ordre pour reprendre la fin de la scène.',
            answers: [['Das', 'neue', 'Buch', 'ist', 'schön.']],
            explanation: 'Le verbe conjugué ist vient en 2e position, après le groupe sujet « Das neue Buch ». On y entend eu (« oï ») dans neue et le ö arrondi de schön.',
          },
        ],
      },
    },
    {
      after: 'a1-voyelles-entrainer',
      activity: {
        id: 'a1-voyelles-repeter',
        kind: 'exercise',
        title: 'Répéter à voix haute : voyelles et trémas',
        estimatedMinutes: 8,
        competences: ['expression-orale'],
        lesson: {
          title: 'Répéter à voix haute : voyelles et trémas',
          description: 'Écoutez chaque modèle autant de fois que nécessaire, puis dites la phrase. Exagérez un peu les voyelles : lèvres bien arrondies pour ö et ü, i bien long dans ie.',
          transcript: null,
        },
        placements: [],
        questions: [
          speak('q1', 'Mein Buch ist neu.', 'Ei se dit « aï » dans mein, eu se dit « oï » dans neu. Le ch de Buch, après u, se forme au fond de la gorge.'),
          speak('q2', 'Die Bücher sind hier.', 'Arrondissez les lèvres sur le ü de Bücher, comme pour « u ». Dans hier, ie est un i long.'),
          speak('q3', 'Zwei Bücher, bitte.', 'Zwei commence par « ts » et ei se dit « aï ». Gardez le ü arrondi de Bücher.', ['Zwei Bücher, bitte.', '2 Bücher, bitte.']),
          speak('q4', 'Das Haus ist blau.', 'Au se dit « aou » dans Haus et dans blau. Soufflez le h de Haus : sans lui, on entendrait aus.'),
          speak('q5', 'Das ist sehr schön.', 'Schön : dites « é » en arrondissant les lèvres. Sans tréma, schon voudrait dire « déjà ».'),
          speak('q6', 'Sieben Häuser sind neu.', 'Le i de sieben est long. Äu dans Häuser et eu dans neu se prononcent de la même façon, « oï ».', ['Sieben Häuser sind neu.', '7 Häuser sind neu.']),
        ],
      },
    },
  ],
  order: ['a1-voyelles-guide', 'a1-voyelles-pratique', 'a1-voyelles-entrainer', 'a1-voyelles-repeter', 'a1-voyelles-controle', 'a1-voyelles-mission'],
};
