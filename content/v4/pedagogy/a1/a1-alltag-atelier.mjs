// Couche pédagogique V4 · A1 · Atelier : raconter sa journée en quatre heures clés.
const REPEAT = 'Écoutez le modèle, puis dites la phrase à voix haute.';
const speak = (id, text, explanation, accept = [text]) => ({ id, type: 'speak', prompt: REPEAT, text, accept, explanation });
const dialogue = { media: 'a1-alltag-atelier-dialogue', usage: 'audio', transcriptVisibility: 'after_answer', decorative: false };

export default {
  module: 'a1-alltag-atelier',
  vocabulary: [
    { id: 'halb', word: 'halb', article: null, plural: null, partOfSpeech: 'adjective', translation: 'demi ; (heure) et demie, avant l’heure suivante', example: 'Es ist halb acht.', note: 'halb acht = 7 h 30 : la demi-heure avant huit heures' },
    { id: 'viertel', word: 'Viertel', article: 'das', plural: 'Viertel', partOfSpeech: 'noun', translation: 'le quart', example: 'Es ist Viertel nach acht.', note: 'Viertel nach acht = 8 h 15 ; Viertel vor acht = 7 h 45' },
    { id: 'nach', word: 'nach', article: null, plural: null, partOfSpeech: 'preposition', translation: 'après ; (heure) et …', example: 'Der Kurs fängt um Viertel nach neun an.', note: null },
    { id: 'vor', word: 'vor', article: null, plural: null, partOfSpeech: 'preposition', translation: 'avant ; (heure) moins …', example: 'Wir essen um Viertel vor zwölf.', note: null },
    { id: 'aufstehen', word: 'aufstehen', article: null, plural: null, partOfSpeech: 'verb', translation: 'se lever', example: 'Ich stehe um halb sieben auf.', note: 'séparable : auf|stehen' },
    { id: 'fruehstuecken', word: 'frühstücken', article: null, plural: null, partOfSpeech: 'verb', translation: 'prendre le petit-déjeuner', example: 'Wir frühstücken um sieben Uhr.', note: null },
    { id: 'anfangen', word: 'anfangen', article: null, plural: null, partOfSpeech: 'verb', translation: 'commencer', example: 'Wir fangen um neun Uhr an.', note: 'séparable : an|fangen ; er fängt an' },
    { id: 'zu-mittag-essen', word: 'zu Mittag essen', article: null, plural: null, partOfSpeech: 'expression', translation: 'déjeuner', example: 'Wann isst du zu Mittag?', note: 'du isst, er isst' },
    { id: 'einkaufen', word: 'einkaufen', article: null, plural: null, partOfSpeech: 'verb', translation: 'faire les courses', example: 'Danach kaufe ich ein.', note: 'séparable : ein|kaufen' },
    { id: 'anrufen', word: 'anrufen', article: null, plural: null, partOfSpeech: 'verb', translation: 'téléphoner à, appeler', example: 'Am Abend rufen wir Papa an.', note: 'séparable : an|rufen ; + accusatif : Ich rufe dich an.' },
    { id: 'vorher', word: 'vorher', article: null, plural: null, partOfSpeech: 'adverb', translation: 'avant, auparavant', example: 'Vorher fahre ich mit dem Bus.', note: null },
    { id: 'danach', word: 'danach', article: null, plural: null, partOfSpeech: 'adverb', translation: 'ensuite, après', example: 'Danach kaufe ich ein.', note: null },
    { id: 'morgens', word: 'morgens', article: null, plural: null, partOfSpeech: 'adverb', translation: 'le matin', example: 'Morgens frühstücke ich um sieben.', note: null },
    { id: 'abends', word: 'abends', article: null, plural: null, partOfSpeech: 'adverb', translation: 'le soir', example: 'Abends rufe ich Papa an.', note: null },
  ],
  activities: {
    'a1-alltag-atelier-guide': {
      title: 'Découvrir : l’heure courante et les verbes séparables',
      estimatedMinutes: 15,
      lesson: {
        title: 'Découvrir : l’heure courante et les verbes séparables',
        description: `LA JOURNÉE DE MINA · 15 MIN

1. Lire le carnet (5 min). Lisez le carnet de Mina : « Um halb acht stehe ich auf. Um Viertel nach acht frühstücke ich. Mein Kurs fängt um neun Uhr an. Um Viertel vor sechs kaufe ich ein. Am Abend rufe ich Papa an. » Pour chaque heure, repérez l’action : se lever, prendre le petit-déjeuner, commencer le cours, faire les courses, téléphoner.

2. Les quarts et la demie (5 min). « Halb acht » donne 7 h 30 : la demi-heure avant huit heures. « Viertel nach acht » donne 8 h 15 et « Viertel vor sechs » 5 h 45 ou 17 h 45, selon le moment. Lisez les heures du carnet à voix haute, puis ajoutez « morgens » (le matin) ou « abends » (le soir) quand il faut préciser.

3. L’ordre de la phrase (5 min). Comparez « Ich stehe um sieben Uhr auf » et « Um sieben Uhr stehe ich auf ». Dans les deux phrases, le verbe conjugué (stehe) est en 2e position et la particule (auf) va tout à la fin. Quand l’heure ouvre la phrase, le sujet passe après le verbe. Dites de la même façon « Um vier Uhr kaufe ich ein » et « Um zehn Uhr fängt der Kurs an ».`,
      },
    },
    'a1-alltag-atelier-pratique': {
      title: 'Comprendre : la journée de lundi',
      estimatedMinutes: 12,
      lesson: {
        title: 'Comprendre : la journée de lundi',
        description: `QUATRE HEURES CLÉS · 12 MIN

HEURES COURANTES
• 06:30 halb sieben — 09:15 Viertel nach neun — 11:45 Viertel vor zwölf — 17:30 halb sechs
Dans la conversation, on dit « um halb sieben » ; l’heure officielle « sechs Uhr dreißig » sert surtout pour les horaires.

1. Première écoute (3 min). Écoutez la scène sans lire la transcription : quel jour décrit-on ?
2. Deuxième écoute (4 min). Repérez quatre heures et l’action de chacune : se lever, le cours, le déjeuner, l’appel du soir. Quelles actions sont annoncées par vorher (avant) et danach (ensuite) ?
3. Les verbes séparables (2 min). Repérez stehst … auf, fängt … an, kaufe … ein et rufe … an : la particule est à la fin de la phrase.
4. Relire et répéter (3 min). Ouvrez la transcription, lisez les deux rôles à voix haute, puis racontez la journée de lundi avec ich, en changeant une heure.`,
      },
    },
    'a1-alltag-atelier-controle': {
      title: 'Vérifier : l’heure et les actions de la journée',
      estimatedMinutes: 10,
      lesson: {
        title: 'Vérifier : l’heure et les actions de la journée',
        description: 'Écoutez la scène une première fois pour la situation, puis lisez les questions et réécoutez pour les heures. Les deux dernières questions portent sur l’ordre des mots et sur l’heure courante. La transcription s’affiche après votre réponse.',
      },
      explanations: {
        q1: '« Um halb sieben » : halb sieben est la demi-heure avant sept heures, soit 6 h 30. Le piège est de comprendre 7 h 30 en traduisant mot à mot.',
        q2: '« Um Viertel nach neun » : un quart d’heure après neuf heures, soit 9 h 15. 8 h 45 se dirait Viertel vor neun.',
        q3: '« Um Viertel vor zwölf » : un quart d’heure avant midi, soit 11 h 45, comme « midi moins le quart ». 12 h 15 se dirait Viertel nach zwölf.',
        q4: 'À « Rufst du mich am Abend an? », la réponse est « Ja, um acht Uhr rufe ich dich an » : anrufen = téléphoner. Les courses (einkaufen) viennent après le déjeuner.',
        q5: 'Quand l’heure ouvre la phrase, le verbe conjugué vient en 2e position, avant le sujet : Um sechs Uhr stehe ich auf. La particule auf reste à la fin ; « aufstehe ich » et « ich stehe » sont fautifs.',
        q6: '8 h 30 = halb neun : la demi-heure avant neuf heures. Halb acht vaut 7 h 30 et Viertel nach acht 8 h 15.',
      },
    },
    'a1-alltag-atelier-mission': {
      kind: 'mission',
      title: 'Mission : raconter sa journée et annoncer un changement',
      estimatedMinutes: 20,
      competences: ['expression-orale', 'expression-ecrite'],
      lesson: {
        title: 'Mission : raconter sa journée et annoncer un changement',
        description: `Une amie veut savoir comment se passe votre journée de cours. Vous la racontez en quatre heures clés, puis vous annoncez qu’une action est décalée d’une demi-heure.

MODÈLE
Morgens stehe ich um halb sieben auf. Um sieben Uhr frühstücke ich. Mein Kurs fängt um Viertel nach neun an. Um Viertel vor zwölf esse ich zu Mittag. Danach kaufe ich ein. Am Abend rufe ich Lea an.
Achtung: Morgen fängt der Kurs um Viertel vor zehn an, nicht um Viertel nach neun!`,
      },
      mission: {
        oral: {
          prompt: 'Racontez votre journée de cours en vous enregistrant : quatre heures au moins, avec une action pour chacune. Puis annoncez qu’une de ces actions est décalée de trente minutes, en donnant l’ancienne et la nouvelle heure.',
          maxSeconds: 90,
        },
        written: {
          prompt: 'Écrivez votre agenda de la journée en cinq phrases au moins, avec la nouvelle heure. Commencez au moins deux phrases par l’heure, comme « Um halb sieben stehe ich auf. ».',
          maxChars: 600,
          minWords: 25,
        },
        checklist: [
          'J’ai donné au moins quatre heures, dont une avec halb et une avec Viertel.',
          'J’ai employé au moins deux verbes séparables, avec la particule à la fin (stehe … auf, rufe … an).',
          'Quand une phrase commence par l’heure, le verbe vient juste après, puis le sujet.',
          'J’ai annoncé une action décalée de trente minutes, avec l’ancienne et la nouvelle heure.',
          'Mon agenda écrit correspond à ce que j’ai raconté à l’oral.',
        ],
      },
    },
  },
  add: [
    {
      after: 'a1-alltag-atelier-pratique',
      activity: {
        id: 'a1-alltag-atelier-entrainer',
        kind: 'exercise',
        title: 'S’entraîner : l’heure et les verbes séparables',
        estimatedMinutes: 10,
        competences: ['ecoute', 'expression-ecrite'],
        lesson: {
          title: 'S’entraîner : l’heure et les verbes séparables',
          description: 'Réécoutez la scène pour compléter l’agenda de lundi, puis travaillez l’heure courante, la place du verbe et la particule des verbes séparables. Les deux dernières questions sont des dictées. La transcription de la scène s’affiche après votre réponse.',
          transcript: null,
        },
        placements: [dialogue],
        questions: [
          {
            id: 'q1', type: 'fill', prompt: 'Écoutez la scène et complétez l’agenda de lundi avec les mots entendus.',
            text: 'Um [[1]] sieben steht er auf. Der Kurs fängt um Viertel [[2]] neun an. Um Viertel [[3]] zwölf isst er zu Mittag. Um [[4]] Uhr ruft er an.',
            blanks: [
              { id: '1', accept: ['halb'], size: 6, hint: null },
              { id: '2', accept: ['nach'], size: 6, hint: null },
              { id: '3', accept: ['vor'], size: 6, hint: null },
              { id: '4', accept: ['acht', '8'], size: 6, hint: null },
            ],
            explanation: 'On entend « Um halb sieben » (6 h 30), « Um Viertel nach neun » (9 h 15), « Um Viertel vor zwölf » (11 h 45) et « um acht Uhr rufe ich dich an » (20 h).',
          },
          {
            id: 'q2', type: 'match', prompt: 'Associez chaque heure courante à l’heure en chiffres.',
            pairs: [
              { left: 'halb acht', right: '7 h 30' },
              { left: 'Viertel nach acht', right: '8 h 15' },
              { left: 'Viertel vor acht', right: '7 h 45' },
              { left: 'halb neun', right: '8 h 30' },
              { left: 'Viertel vor sechs', right: '5 h 45' },
            ],
            explanation: 'Halb se réfère à l’heure suivante : halb acht = 7 h 30, halb neun = 8 h 30. Viertel nach ajoute un quart d’heure, Viertel vor en retire un.',
          },
          {
            id: 'q3', type: 'order', prompt: 'Remettez les mots dans l’ordre. Commencez par l’heure.',
            answers: [['Um halb sieben', 'stehe', 'ich', 'auf.']],
            explanation: 'L’heure occupe la 1re place, le verbe conjugué stehe la 2e, puis vient le sujet ich ; la particule auf ferme la phrase.',
          },
          {
            id: 'q4', type: 'order', prompt: 'Remettez les mots dans l’ordre. Commencez par « Mein Kurs ».',
            answers: [['Mein Kurs', 'fängt', 'um neun Uhr', 'an.']],
            explanation: 'Anfangen est séparable : fängt prend la 2e place et an part à la fin, après l’heure. Le ä de fängt vient de anfangen (er fängt an).',
          },
          {
            id: 'q5', type: 'fill', prompt: 'Complétez avec le verbe séparable entre parenthèses : le verbe, puis la particule.',
            text: 'Am Abend [[1]] ich Papa [[2]]. Um sechs Uhr [[3]] ich [[4]].',
            blanks: [
              { id: '1', accept: ['rufe'], size: 6, hint: 'anrufen' },
              { id: '2', accept: ['an'], size: 4, hint: null },
              { id: '3', accept: ['kaufe'], size: 6, hint: 'einkaufen' },
              { id: '4', accept: ['ein'], size: 4, hint: null },
            ],
            explanation: 'Au présent, le verbe séparable se coupe en deux : rufe … an, kaufe … ein. Le verbe conjugué reste en 2e position et la particule va à la fin.',
          },
          {
            id: 'q6', type: 'dictation', prompt: 'Dictée : écoutez la phrase et écrivez-la.',
            accept: ['Um Viertel nach acht frühstücke ich.'],
            voice: 'frau',
            explanation: 'Viertel nach acht = 8 h 15. Viertel est un nom (majuscule) ; frühstücke s’écrit avec deux ü et vient juste après l’heure, avant ich.',
          },
          {
            id: 'q7', type: 'dictation', prompt: 'Dictée : écoutez la phrase et écrivez-la.',
            accept: ['Danach kaufe ich im Supermarkt ein.'],
            voice: 'mann',
            explanation: 'Danach ouvre la phrase : le verbe kaufe vient ensuite, puis ich, et la particule ein termine la phrase. Im Supermarkt = au supermarché.',
          },
        ],
      },
    },
    {
      after: 'a1-alltag-atelier-entrainer',
      activity: {
        id: 'a1-alltag-atelier-repeter',
        kind: 'exercise',
        title: 'Répéter à voix haute : raconter sa journée',
        estimatedMinutes: 8,
        competences: ['expression-orale'],
        lesson: {
          title: 'Répéter à voix haute : raconter sa journée',
          description: 'Écoutez chaque modèle autant de fois que nécessaire, puis dites la phrase sans vous presser. Accentuez la particule des verbes séparables : AUF, AN, EIN.',
          transcript: null,
        },
        placements: [],
        questions: [
          speak('q1', 'Wann stehst du am Montag auf?', 'Stehst commence par « cht ». La particule auf, à la fin, porte l’accent du verbe : la voix y monte légèrement.'),
          speak('q2', 'Um halb sieben stehe ich auf.', 'Halb : le h se prononce et le b final sonne comme un p. Sieben : ie est un i long.', ['Um halb sieben stehe ich auf.', 'Um halb 7 stehe ich auf.']),
          speak('q3', 'Mein Kurs fängt um neun Uhr an.', 'Fängt : ä se dit « è ». Gardez an pour la fin, avec un léger accent.', ['Mein Kurs fängt um neun Uhr an.', 'Mein Kurs fängt um 9 Uhr an.']),
          speak('q4', 'Um Viertel vor zwölf esse ich zu Mittag.', 'Viertel se prononce « firtel » : le v se dit [f]. Zwölf commence par [ts] et contient un ö arrondi.', ['Um Viertel vor zwölf esse ich zu Mittag.', 'Um Viertel vor 12 esse ich zu Mittag.']),
          speak('q5', 'Vorher fahre ich mit dem Bus.', 'Vorher ouvre la phrase : fahre vient juste après, puis ich. Le v de vorher se dit [f] et Bus se prononce « bouss ».'),
          speak('q6', 'Am Abend rufe ich dich an.', 'Rufe a un u long (« ou »). Dich se termine par le ch doux de ich ; an ferme la phrase.'),
        ],
      },
    },
  ],
  order: [
    'a1-alltag-atelier-guide', 'a1-alltag-atelier-pratique', 'a1-alltag-atelier-entrainer', 'a1-alltag-atelier-repeter',
    'a1-alltag-atelier-controle', 'a1-alltag-atelier-mission',
  ],
};
