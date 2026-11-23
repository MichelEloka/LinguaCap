// Couche pédagogique V4 · A1 · Consonnes, accent et mélodie de la phrase.
const REPEAT = 'Écoutez le modèle, puis dites la phrase à voix haute.';
const speak = (id, text, explanation, accept = [text]) => ({ id, type: 'speak', prompt: REPEAT, text, accept, explanation });

export default {
  module: 'a1-rythme',
  vocabulary: [
    { id: 'schule', word: 'Schule', article: 'die', plural: 'Schulen', partOfSpeech: 'noun', translation: 'l’école', example: 'Die Schule ist gleich hier.', note: null },
    { id: 'bahnhof', word: 'Bahnhof', article: 'der', plural: 'Bahnhöfe', partOfSpeech: 'noun', translation: 'la gare', example: 'Wo ist der Bahnhof?', note: null },
    { id: 'strasse', word: 'Straße', article: 'die', plural: 'Straßen', partOfSpeech: 'noun', translation: 'la rue', example: 'Die Schule ist in der Weberstraße.', note: null },
    { id: 'park', word: 'Park', article: 'der', plural: 'Parks', partOfSpeech: 'noun', translation: 'le parc', example: 'Der Park ist gleich hier.', note: null },
    { id: 'zug', word: 'Zug', article: 'der', plural: 'Züge', partOfSpeech: 'noun', translation: 'le train', example: 'Der Zug kommt um vier.', note: null },
    { id: 'zeit', word: 'Zeit', article: 'die', plural: null, partOfSpeech: 'noun', translation: 'le temps (disponible)', example: 'Hast du Zeit?', note: null },
    { id: 'jahr', word: 'Jahr', article: 'das', plural: 'Jahre', partOfSpeech: 'noun', translation: 'l’année, l’an', example: 'Ein Jahr hat zwölf Monate.', note: null },
    { id: 'vater', word: 'Vater', article: 'der', plural: 'Väter', partOfSpeech: 'noun', translation: 'le père', example: 'Mein Vater ist hier.', note: null },
    { id: 'wasser', word: 'Wasser', article: 'das', plural: null, partOfSpeech: 'noun', translation: 'l’eau', example: 'Wasser, bitte.', note: null },
    { id: 'sport', word: 'Sport', article: 'der', plural: null, partOfSpeech: 'noun', translation: 'le sport', example: 'Ich mache gern Sport.', note: null },
    { id: 'entschuldigung', word: 'Entschuldigung!', article: null, plural: null, partOfSpeech: 'expression', translation: 'Excusez-moi ! Pardon !', example: 'Entschuldigung! Wo ist die Schule?', note: null },
    { id: 'wo-ist', word: 'Wo ist …?', article: null, plural: null, partOfSpeech: 'expression', translation: 'Où est … ?', example: 'Wo ist der Bahnhof?', note: null },
    { id: 'gleich-hier', word: 'gleich hier', article: null, plural: null, partOfSpeech: 'expression', translation: 'juste ici, tout près', example: 'Der Park ist gleich hier.', note: null },
    { id: 'vielen-dank', word: 'Vielen Dank!', article: null, plural: null, partOfSpeech: 'expression', translation: 'Merci beaucoup !', example: 'Vielen Dank! Tschüs!', note: null },
  ],
  activities: {
    'a1-rythme-guide': {
      title: 'Découvrir : les consonnes fréquentes',
      estimatedMinutes: 15,
      lesson: {
        title: 'Découvrir : les consonnes fréquentes',
        description: `CONSONNES FRÉQUENTES · 15 MIN

1. Les débuts de mots (5 min). J se prononce comme le « y » de « yaourt » : ja, das Jahr. W se dit comme un v français : wir, das Wasser. V se dit le plus souvent comme un f : vier, der Vater ; dans quelques mots venus d’autres langues, on entend un v : die Vase. Z se dit « ts » : die Zeit, der Zug. Écoutez le modèle et répétez chaque série.
2. sch, sp et st (4 min). Sch se prononce comme le ch français : die Schule, schreiben. Au début d’un mot, sp et st se lisent « chp » et « cht » : der Sport, die Straße. Dites « die Schule », « der Sport », puis « die Straße ».
3. ich et Buch (4 min). Dans ich, l’air passe près du palais, la langue proche de la position du i : c’est un souffle doux. Après a, o ou u, comme dans Buch et Nacht, le bruit se forme plus en arrière, au fond de la gorge. Deux productions compréhensibles suffisent pour commencer.
4. Récapituler (2 min). Dites ja, was, vier, Zeit, Schule et ich. Réécoutez seulement les deux mots qui vous demandent un nouvel essai.`,
      },
    },
    'a1-rythme-pratique': {
      title: 'Comprendre : accent, rythme et mélodie',
      estimatedMinutes: 12,
      lesson: {
        title: 'Comprendre : accent, rythme et mélodie',
        description: `PRONONCER DES GROUPES · 12 MIN

1. L’accent du mot (3 min). En allemand, l’accent tombe le plus souvent sur la première syllabe : WAS-ser, SCHU-le, BAHN-hof. Les préfixes comme ent- ne sont pas accentués : ent-SCHUL-di-gung. Dites « Wasser, bitte. » d’un seul mouvement, en appuyant sur WAS.
2. Le rythme (3 min). Découpez « Wo ist / der Bahnhof? » et « Der Bahnhof / ist hier. » avec une très légère pause à la barre. Mettez en relief le mot important, Bahnhof.
3. La mélodie (3 min). Dans « Ist der Bahnhof hier? », question fermée (réponse oui ou non), la voix monte légèrement à la fin. Dans « Wo ist der Bahnhof? », question en W, elle redescend.
4. La scène (3 min). Écoutez une première fois : quel lieu cherche-t-on ? Réécoutez en lisant la transcription, puis répétez « Wie bitte? Die Schule? » et la réponse « Die Schule ist gleich hier. ».`,
      },
    },
    'a1-rythme-controle': {
      title: 'Vérifier : demander un lieu et faire répéter',
      estimatedMinutes: 10,
      lesson: {
        title: 'Vérifier : demander un lieu et faire répéter',
        description: 'Écoutez la scène une première fois pour la situation, puis lisez les questions et réécoutez pour les détails. Les deux dernières questions portent sur les consonnes. La transcription s’affiche après votre réponse.',
      },
      explanations: {
        q1: 'La première voix demande « Ist die Schule hier? » : die Schule est l’école. Une gare se dit der Bahnhof et un magasin der Laden.',
        q2: '« Wie bitte? Die Schule? » : wie bitte sert à faire répéter (« Pardon ? »). Vielen Dank remercie et Auf Wiedersehen sert à prendre congé.',
        q3: 'La réponse « in der Weberstraße » est reprise par la première voix : « In der Weberstraße? ». Le W initial se prononce comme un v ; Wiesenstraße et Waldstraße ne sont jamais dites.',
        q4: '« Die Schule ist gleich hier » : gleich hier veut dire « juste ici, tout près ». Rien n’évoque une autre ville.',
        q5: 'Z se prononce « ts » : Zug, Zeit. J se dit comme le « y » de « yaourt » (Jahr) et W comme un v français (Wasser).',
        q6: 'Sch se prononce comme le ch français : Schule. Zeit commence par « ts » et Vater par un son f.',
      },
    },
    'a1-rythme-mission': {
      kind: 'mission',
      title: 'Mission : demander son chemin',
      estimatedMinutes: 15,
      competences: ['expression-orale', 'expression-ecrite'],
      lesson: {
        title: 'Mission : demander son chemin',
        description: `Vous êtes dans une ville allemande et vous cherchez un lieu. Vous demandez poliment, vous faites répéter la réponse, puis vous remerciez.

MODÈLE
– Entschuldigung. Wo ist der Park?
– Der Park ist gleich hier, in der Lindenstraße.
– Wie bitte? In der Lindenstraße?
– Ja, gleich hier.
– Vielen Dank!`,
      },
      mission: {
        oral: {
          prompt: 'Enregistrez la scène pour trois lieux : die Schule, der Bahnhof et der Park. Jouez les deux rôles. Pour chaque lieu, demandez où il est, faites répéter une fois avec « Wie bitte? », puis remerciez. Donnez à chaque lieu une rue de votre choix.',
          maxSeconds: 90,
        },
        written: {
          prompt: 'Écrivez votre meilleur échange en quatre ou cinq répliques, comme le modèle.',
          maxChars: 500,
          minWords: 15,
        },
        checklist: [
          'J’ai commencé par « Entschuldigung » et posé la question avec wo en tête.',
          'J’ai fait répéter avec « Wie bitte? » en reprenant le mot important.',
          'J’ai prononcé sch (Schule) comme un ch français et z comme « ts ».',
          'Ma voix descend à la fin d’une question en W et monte à la fin d’une question fermée.',
        ],
      },
    },
  },
  add: [
    {
      after: 'a1-rythme-pratique',
      activity: {
        id: 'a1-rythme-entrainer',
        kind: 'exercise',
        title: 'S’entraîner : consonnes, accent et questions',
        estimatedMinutes: 10,
        competences: ['lecture', 'expression-ecrite'],
        lesson: {
          title: 'S’entraîner : consonnes, accent et questions',
          description: 'Associez les mots à leur premier son, trouvez la syllabe accentuée, puis remettez les questions dans l’ordre et complétez les répliques de la scène.',
          transcript: null,
        },
        placements: [],
        questions: [
          {
            id: 'q1', type: 'match', prompt: 'Associez chaque mot au son qui l’ouvre (approximation française).',
            pairs: [
              { left: 'ja', right: '« y » comme dans « yaourt »' },
              { left: 'wir', right: '« v » comme dans « vous »' },
              { left: 'vier', right: '« f » comme dans « fou »' },
              { left: 'Zeit', right: '« ts » comme dans « tsé-tsé »' },
              { left: 'Schule', right: '« ch » comme dans « chat »' },
              { left: 'Sport', right: '« chp »' },
            ],
            explanation: 'J se dit « y », W « v » et V « f » dans les mots allemands courants. Z se dit « ts », sch « ch », et sp en début de mot se dit « chp ».',
          },
          {
            id: 'q2', type: 'choice', prompt: 'Dans quel mot le v se prononce-t-il comme un v français ?',
            options: [
              { id: 'a', label: 'vier', correct: false },
              { id: 'b', label: 'Vater', correct: false },
              { id: 'c', label: 'Vase', correct: true },
            ],
            explanation: 'Dans les mots allemands courants, v se dit comme un f : vier, Vater. Vase vient d’une autre langue et garde le son v.',
          },
          {
            id: 'q3', type: 'choice', prompt: 'Où tombe l’accent dans Entschuldigung ?',
            options: [
              { id: 'a', label: 'Sur la 1re syllabe : ent-', correct: false },
              { id: 'b', label: 'Sur la 2e syllabe : -schul-', correct: true },
              { id: 'c', label: 'Sur la dernière syllabe : -gung', correct: false },
            ],
            explanation: 'Le préfixe ent- n’est jamais accentué : l’accent tombe sur la syllabe du radical, SCHUL. Accentuer la dernière syllabe, comme en français, gêne la compréhension.',
          },
          {
            id: 'q4', type: 'order', prompt: 'Remettez les mots dans l’ordre pour demander où est l’école.',
            answers: [['Entschuldigung,', 'wo', 'ist', 'die', 'Schule?']],
            explanation: 'Après Entschuldigung, la question commence par le mot interrogatif wo, suivi du verbe ist, puis du groupe die Schule. En fin de question en W, la voix descend.',
          },
          {
            id: 'q5', type: 'order', prompt: 'Remettez les mots dans l’ordre pour poser une question fermée (réponse oui ou non).',
            answers: [['Ist', 'der', 'Bahnhof', 'hier?']],
            explanation: 'Dans une question fermée, le verbe conjugué vient en premier : Ist der Bahnhof hier? La voix monte à la fin, alors qu’elle descend dans « Wo ist der Bahnhof? ».',
          },
          {
            id: 'q6', type: 'fill', prompt: 'Complétez les répliques de la scène.',
            text: '[[1]] bitte? Die Schule? – Die Schule ist [[2]] hier.',
            blanks: [{ id: '1', accept: ['Wie'], size: 5, hint: null }, { id: '2', accept: ['gleich'], size: 7, hint: 'tout près' }],
            explanation: 'Wie bitte? fait répéter poliment ; bitte seul ne suffit pas. Gleich hier signifie « juste ici, tout près ».',
          },
          {
            id: 'q7', type: 'fill', prompt: 'Complétez les mots avec sch, z ou w.',
            text: 'die [[1]]ule – der [[2]]ug – das [[3]]asser',
            blanks: [{ id: '1', accept: ['Sch'], size: 4, hint: null }, { id: '2', accept: ['Z'], size: 3, hint: null }, { id: '3', accept: ['W'], size: 3, hint: null }],
            explanation: 'Le son « ch » s’écrit sch (Schule), le son « ts » s’écrit z (Zug) et le son « v » de Wasser s’écrit w. Un francophone écrit souvent v pour ce son.',
          },
        ],
      },
    },
    {
      after: 'a1-rythme-entrainer',
      activity: {
        id: 'a1-rythme-repeter',
        kind: 'exercise',
        title: 'Répéter à voix haute : demander un lieu',
        estimatedMinutes: 8,
        competences: ['expression-orale'],
        lesson: {
          title: 'Répéter à voix haute : demander un lieu',
          description: 'Écoutez chaque modèle, puis dites la phrase avec le même accent et la même mélodie : la voix descend à la fin d’une question en W et monte à la fin d’une question fermée.',
          transcript: null,
        },
        placements: [],
        questions: [
          speak('q1', 'Entschuldigung, wo ist die Schule?', 'Accentuez SCHUL dans Entschuldigung et dans Schule ; sch se dit « ch ». La voix descend à la fin de la question en W.'),
          speak('q2', 'Ist der Bahnhof hier?', 'Question fermée : la voix monte légèrement sur hier. Appuyez sur BAHN et soufflez le h de -hof.'),
          speak('q3', 'Wie bitte? Die Schule?', 'Wie se dit avec un son v. La voix monte sur Die Schule? pour vérifier le mot entendu.'),
          speak('q4', 'Die Schule ist gleich hier.', 'Gleich : ei se dit « aï » et le ch final est le souffle doux de ich. Mettez le relief sur Schule.'),
          speak('q5', 'Der Zug kommt um vier.', 'Z se dit « ts » et v se dit f : « tsouk », « fir ». Le g final de Zug se prononce presque comme un k.', ['Der Zug kommt um vier.', 'Der Zug kommt um 4.']),
          speak('q6', 'Vielen Dank!', 'V se dit f : « filen ». Le k final de Dank doit s’entendre nettement.'),
        ],
      },
    },
  ],
  order: ['a1-rythme-guide', 'a1-rythme-pratique', 'a1-rythme-entrainer', 'a1-rythme-repeter', 'a1-rythme-controle', 'a1-rythme-mission'],
};
