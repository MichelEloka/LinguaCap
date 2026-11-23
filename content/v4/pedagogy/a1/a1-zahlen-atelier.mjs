// Couche pédagogique V4 · A1 · Atelier : vérifier des coordonnées au guichet.
const REPEAT = 'Écoutez le modèle, puis dites la phrase à voix haute.';
const speak = (id, text, explanation, accept = [text]) => ({ id, type: 'speak', prompt: REPEAT, text, accept, explanation });
const DIALOGUE = { media: 'a1-zahlen-atelier-dialogue', usage: 'audio', transcriptVisibility: 'after_answer', decorative: false };

export default {
  module: 'a1-zahlen-atelier',
  // Lea Berg était lue par une voix d’homme : la réception passe à la voix « mann », Lea à la voix « frau ».
  media: [
    {
      key: 'a1-zahlen-atelier-dialogue', kind: 'audio', title: 'Vérifier des coordonnées par téléphone · scène',
      script: [
        { voice: 'mann', text: 'Guten Tag! Wie heißen Sie?' },
        { voice: 'frau', text: 'Ich heiße Lea Berg. Ich bin zweiundzwanzig Jahre alt.' },
        { voice: 'mann', text: 'Wie ist Ihre Telefonnummer?' },
        { voice: 'frau', text: 'Null, eins, sieben, sechs. Dann: vier, drei, acht, zwei.' },
        { voice: 'mann', text: 'Vier, drei, acht, zwei. Danke! Wie ist Ihre Postleitzahl?' },
        { voice: 'frau', text: 'Zwei, null, vier, fünf, sieben.' },
        { voice: 'mann', text: 'Wohnen Sie in Hamburg?' },
        { voice: 'frau', text: 'Ja, genau. In Hamburg.' },
      ],
    },
  ],
  vocabulary: [
    { id: 'telefonnummer', word: 'Telefonnummer', article: 'die', plural: 'Telefonnummern', partOfSpeech: 'noun', translation: 'le numéro de téléphone', example: 'Wie ist Ihre Telefonnummer?', note: null },
    { id: 'nummer', word: 'Nummer', article: 'die', plural: 'Nummern', partOfSpeech: 'noun', translation: 'le numéro', example: 'Können Sie die Nummer bitte wiederholen?', note: null },
    { id: 'alter', word: 'Alter', article: 'das', plural: null, partOfSpeech: 'noun', translation: 'l’âge', example: 'Alter: 42.', note: 'sur une fiche' },
    { id: 'anmeldung', word: 'Anmeldung', article: 'die', plural: 'Anmeldungen', partOfSpeech: 'noun', translation: 'l’inscription ; l’accueil', example: 'Die Anmeldung ist hier.', note: null },
    { id: 'gruppe', word: 'Gruppe', article: 'die', plural: 'Gruppen', partOfSpeech: 'noun', translation: 'le groupe', example: 'Ich bin in der Gruppe blau.', note: null },
    { id: 'platz', word: 'Platz', article: 'der', plural: 'Plätze', partOfSpeech: 'noun', translation: 'la place', example: 'Ihr Platz ist Nummer vierzehn.', note: null },
    { id: 'wiederholen', word: 'wiederholen', article: null, plural: null, partOfSpeech: 'verb', translation: 'répéter', example: 'Können Sie das bitte wiederholen?', note: null },
    { id: 'genau', word: 'genau', article: null, plural: null, partOfSpeech: 'adverb', translation: 'exactement ; oui, c’est ça', example: 'Wohnen Sie in Hamburg? – Ja, genau.', note: null },
    { id: 'dann', word: 'dann', article: null, plural: null, partOfSpeech: 'adverb', translation: 'ensuite, puis', example: 'Null, eins, sieben, sechs. Dann: vier, drei.', note: null },
    { id: 'ihr-poli', word: 'Ihr', article: null, plural: null, partOfSpeech: 'pronoun', translation: 'votre (poli)', example: 'Wie ist Ihre Postleitzahl?', note: 'majuscule comme Sie ; Ihre devant un nom féminin' },
    { id: 'wie-alt', word: 'Wie alt sind Sie?', article: null, plural: null, partOfSpeech: 'expression', translation: 'Quel âge avez-vous ?', example: 'Wie alt sind Sie? – Ich bin zweiundzwanzig.', note: 'familier : Wie alt bist du?' },
    { id: 'null', word: 'null', article: null, plural: null, partOfSpeech: 'number', translation: 'zéro', example: 'Null, eins, sieben, sechs.', note: null },
    { id: 'vierzehn', word: 'vierzehn', article: null, plural: null, partOfSpeech: 'number', translation: 'quatorze', example: 'Vierzehn oder vierzig?', note: '-zehn : de 13 à 19' },
    { id: 'vierzig', word: 'vierzig', article: null, plural: null, partOfSpeech: 'number', translation: 'quarante', example: 'Ich bin vierzig Jahre alt.', note: '-zig : les dizaines à partir de 20' },
    { id: 'dreissig', word: 'dreißig', article: null, plural: null, partOfSpeech: 'number', translation: 'trente', example: 'Er ist dreißig Jahre alt.', note: 'avec ß, sans -zig' },
  ],
  activities: {
    'a1-zahlen-atelier-guide': {
      title: 'Découvrir : lire une fiche et dire les nombres',
      estimatedMinutes: 15,
      lesson: {
        title: 'Découvrir : lire une fiche et dire les nombres',
        description: `LIRE UNE FICHE · 15 MIN

1. Lire une fiche (5 min). Sur une fiche d’inscription, on lit « Name: Jan Wolf. Alter: 42. Wohnort: Bremen. Postleitzahl: 28195. Platz: 14. Gruppe: blau. » Repérez les renseignements sans traduire chaque mot : quel nombre indique l’âge ? Quel groupe de chiffres donne le code postal ? Lisez le code postal chiffre par chiffre : zwei, acht, eins, neun, fünf.

2. Les nombres (5 min). Dans « zweiundvierzig », l’unité vient avant la dizaine : « zwei und vierzig » donne 42. Comparez vierzehn (14) et vierzig (40), sechzehn (16) et sechzig (60) : -zehn pour les nombres de 13 à 19, -zig pour les dizaines. Cachez les chiffres, dites chaque nombre à voix haute, puis vérifiez.

3. Faire vérifier (5 min). Lisez les deux rôles : « Wie ist Ihre Postleitzahl? » / « Zwei, acht, eins, neun, fünf. » / « Wie bitte? Eins, neun, fünf am Ende? » / « Ja, genau. ». Marquez une pause entre les groupes de chiffres. Redites la fin avec le code 30159 : drei, null, eins, fünf, neun.`,
      },
    },
    'a1-zahlen-atelier-pratique': {
      title: 'Comprendre : Lea Berg s’inscrit',
      estimatedMinutes: 12,
      lesson: {
        title: 'Comprendre : Lea Berg s’inscrit',
        description: `AU GUICHET · 12 MIN

Lea Berg s’inscrit à un cours. À l’accueil, on note ses coordonnées.

1. Les nombres pièges (3 min). Lisez 13, 30, 17, 70, 35 et 53 : dreizehn / dreißig, siebzehn / siebzig, fünfunddreißig / dreiundfünfzig. Attention : dreißig s’écrit avec ß, et siebzig perd le -en de sieben.
2. Première écoute (3 min). Sans la transcription : quelles informations Lea donne-t-elle ? Nom, âge, téléphone, code postal, ville ?
3. Deuxième écoute (3 min). Écoutez comment l’accueil répète « vier, drei, acht, zwei » pour vérifier, et comment Lea confirme : « Ja, genau ».
4. Répéter (3 min). Lisez la transcription et répétez les répliques de Lea pendant les pauses, avec une petite pause entre les groupes de chiffres.`,
      },
    },
    'a1-zahlen-atelier-controle': {
      title: 'Vérifier : âge, numéro et code postal',
      estimatedMinutes: 10,
      lesson: {
        title: 'Vérifier : âge, numéro et code postal',
        description: 'Écoutez la scène une première fois pour la situation, puis lisez les questions et réécoutez pour les chiffres. Les deux dernières questions vous demandent de réutiliser les nombres et les formules. La transcription s’affiche après votre réponse.',
      },
      explanations: {
        q1: 'Lea dit « Ich bin zweiundzwanzig Jahre alt » : zwei-und-zwanzig, l’unité avant la dizaine, donne 22. Vingt-quatre se dirait vierundzwanzig.',
        q2: 'Elle dicte « Null, eins, sieben, sechs » : 0-1-7-6. Attention à l’ordre de sieben (7) et sechs (6), faciles à intervertir.',
        q3: 'Après « Dann », on entend « vier, drei, acht, zwei », et l’accueil le répète pour vérifier : 4-3-8-2.',
        q4: 'Le code postal est dicté chiffre par chiffre : « zwei, null, vier, fünf, sieben ». Les autres choix intervertissent deux chiffres.',
        q5: 'Pour 34, on dit l’unité, puis und, puis la dizaine : vier-und-dreißig. Dreiundvierzig ferait 43 et vierzehn 14.',
        q6: 'Wiederholen veut dire « répéter » : c’est la demande polie quand on n’a pas compris. « Wie alt sind Sie? » demande l’âge et « Woher kommen Sie? » l’origine.',
      },
    },
    'a1-zahlen-atelier-mission': {
      kind: 'mission',
      title: 'Mission : donner ses coordonnées au guichet',
      estimatedMinutes: 20,
      competences: ['expression-orale', 'expression-ecrite'],
      lesson: {
        title: 'Mission : donner ses coordonnées au guichet',
        description: `Vous vous inscrivez à un cours. Au guichet, l’employée vous demande vos coordonnées. Vous les dictez lentement, chiffre par chiffre, et vous confirmez quand elle répète. Ensuite, vous remplissez la fiche d’inscription.

MODÈLE
– Wie ist Ihre Telefonnummer?
– Null, eins, fünf, sechs. Dann: drei, neun, acht, zwei.
– Drei, neun, acht, zwei?
– Ja, genau.
– Und Ihre Postleitzahl?
– Zwei, acht, eins, neun, fünf.`,
      },
      mission: {
        oral: {
          prompt: 'Enregistrez vos réponses au guichet, avec des coordonnées inventées : votre nom, votre âge, votre numéro de téléphone et votre code postal. Dictez les numéros chiffre par chiffre, par groupes, avec une pause entre les groupes. Terminez par « Ja, genau », comme si l’employée avait répété.',
          maxSeconds: 60,
        },
        written: {
          prompt: 'Remplissez la fiche : une ligne par information (Name, Alter, Wohnort, Telefonnummer, Postleitzahl). Ajoutez une phrase avec votre âge en toutes lettres : Ich bin … Jahre alt.',
          maxChars: 400,
          minWords: 12,
        },
        checklist: [
          'J’ai dicté mon numéro chiffre par chiffre, en groupes, avec une pause entre les groupes.',
          'J’ai bien distingué les nombres en -zehn et en -zig (vierzehn, vierzig).',
          'J’ai dit mon âge avec l’unité avant la dizaine (zweiundzwanzig).',
          'Ma fiche contient les cinq informations, et ses chiffres sont ceux de mon enregistrement.',
        ],
      },
    },
  },
  add: [
    {
      after: 'a1-zahlen-atelier-pratique',
      activity: {
        id: 'a1-zahlen-atelier-entrainer',
        kind: 'exercise',
        title: 'S’entraîner : noter et dicter des coordonnées',
        estimatedMinutes: 10,
        competences: ['ecoute', 'expression-ecrite'],
        lesson: {
          title: 'S’entraîner : noter et dicter des coordonnées',
          description: 'Réécoutez l’inscription de Lea sans la transcription et complétez sa fiche, puis travaillez les nombres et les formules du guichet. Pour les dictées, vous pouvez écrire les nombres en chiffres ou en lettres. La transcription s’affiche après votre réponse.',
          transcript: null,
        },
        placements: [DIALOGUE],
        questions: [
          {
            id: 'q1', type: 'fill', prompt: 'Écoutez la scène et complétez la fiche d’inscription.',
            text: 'Name: Lea [[1]] · Wohnort: [[2]]',
            blanks: [{ id: '1', accept: ['Berg'], size: 8, hint: null }, { id: '2', accept: ['Hamburg'], size: 9, hint: null }],
            explanation: 'Lea dit « Ich heiße Lea Berg », puis confirme « Ja, genau. In Hamburg. » à la question « Wohnen Sie in Hamburg? ».',
          },
          {
            id: 'q2', type: 'match', prompt: 'Associez chaque nombre à son nom allemand.',
            pairs: [
              { left: '13', right: 'dreizehn' },
              { left: '30', right: 'dreißig' },
              { left: '17', right: 'siebzehn' },
              { left: '70', right: 'siebzig' },
              { left: '35', right: 'fünfunddreißig' },
              { left: '53', right: 'dreiundfünfzig' },
            ],
            explanation: '-zehn forme les nombres de 13 à 19, -zig (ou -ßig pour 30) les dizaines. Pour 35 et 53, l’unité vient en premier : fünf-und-dreißig, drei-und-fünfzig.',
          },
          {
            id: 'q3', type: 'fill', prompt: 'Complétez la question de l’accueil.',
            text: 'Wie ist [[1]] Telefonnummer?',
            blanks: [{ id: '1', accept: ['Ihre'], size: 6, hint: 'votre (poli)' }],
            explanation: 'Ihre (votre) correspond au Sie de politesse et prend aussi une majuscule. Avec du, on dirait deine Telefonnummer.',
          },
          {
            id: 'q4', type: 'order', prompt: 'Remettez les mots dans l’ordre pour faire répéter le numéro poliment.',
            answers: [
              ['Können', 'Sie', 'die Nummer', 'bitte', 'wiederholen?'],
              ['Können', 'Sie', 'bitte', 'die Nummer', 'wiederholen?'],
            ],
            explanation: 'Dans cette question polie, können vient en tête et l’infinitif wiederholen va à la fin de la phrase. Bitte peut se placer avant ou après die Nummer.',
          },
          {
            id: 'q5', type: 'fill', prompt: 'Complétez la confirmation.',
            text: 'Wohnen Sie in Hamburg? – Ja, [[1]].',
            blanks: [{ id: '1', accept: ['genau'], size: 7, hint: 'exactement' }],
            explanation: 'Ja, genau veut dire « oui, exactement » : on confirme une information répétée. Pour corriger, on dirait « Nein, in Bremen ».',
          },
          {
            id: 'q6', type: 'dictation', prompt: 'Écoutez et écrivez la question.', voice: 'mann',
            accept: ['Wie ist Ihre Telefonnummer?'],
            explanation: 'Telefonnummer s’écrit en un seul mot, avec deux m. Ihre prend une majuscule parce qu’il correspond au Sie de politesse.',
          },
          {
            id: 'q7', type: 'dictation', prompt: 'Écoutez et écrivez la phrase.', voice: 'frau',
            accept: ['Ich bin dreiundvierzig Jahre alt.'],
            explanation: 'Dreiundvierzig : on entend l’unité avant la dizaine, drei-und-vierzig, soit 43. En lettres, le nombre forme un seul mot ; 43 en chiffres est aussi accepté.',
          },
        ],
      },
    },
    {
      after: 'a1-zahlen-atelier-entrainer',
      activity: {
        id: 'a1-zahlen-atelier-repeter',
        kind: 'exercise',
        title: 'Répéter à voix haute : au guichet',
        estimatedMinutes: 8,
        competences: ['expression-orale'],
        lesson: {
          title: 'Répéter à voix haute : au guichet',
          description: 'Écoutez chaque modèle, puis dites la phrase. Articulez nettement la fin des nombres : -zehn ou -zig.',
          transcript: null,
        },
        placements: [],
        questions: [
          speak('q1', 'Wie ist Ihre Telefonnummer?', 'Accentuez TE dans Telefonnummer. La voix descend à la fin de cette question en W.'),
          speak('q2', 'Ich bin zweiundzwanzig Jahre alt.', 'L’unité vient d’abord : zwei-und-zwanzig. Zw se dit « tsv ».', ['Ich bin zweiundzwanzig Jahre alt.', 'Ich bin 22 Jahre alt.']),
          speak('q3', 'Vierzehn oder vierzig?', 'Vierzehn se termine par « tséne », vierzig par « tsik » : c’est cette fin qui distingue 14 et 40.', ['Vierzehn oder vierzig?', '14 oder 40?']),
          speak('q4', 'Meine Hausnummer ist vierzehn.', 'Hausnummer : soufflez le h et accentuez HAUS. Vierzehn commence par un son f.', ['Meine Hausnummer ist vierzehn.', 'Meine Hausnummer ist 14.']),
          speak('q5', 'Können Sie die Nummer bitte wiederholen?', 'Ö de können : lèvres arrondies. Accentuez -HO- dans wiederholen.'),
          speak('q6', 'Ja, genau. In Hamburg.', 'Genau : accent sur la deuxième syllabe, ge-NAU. Le h de Hamburg se souffle.'),
        ],
      },
    },
  ],
  order: [
    'a1-zahlen-atelier-guide', 'a1-zahlen-atelier-pratique', 'a1-zahlen-atelier-entrainer', 'a1-zahlen-atelier-repeter',
    'a1-zahlen-atelier-controle', 'a1-zahlen-atelier-mission',
  ],
};
