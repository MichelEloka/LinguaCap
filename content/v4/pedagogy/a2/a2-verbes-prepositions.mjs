// Couche pédagogique V4 · a2-verbes-prepositions (lot A7, contenu A2).
// Employer warten auf (+ accusatif), sprechen mit (+ datif) et sich interessieren für (+ accusatif), et choisir la bonne
// question (Worauf? Auf wen? Mit wem? Wofür? Womit?) : exercices typés, répétition validée, mission remise.

const dialogue = { media: 'a2-verbes-prepositions-dialogue', usage: 'audio', transcriptVisibility: 'after_answer', decorative: false };

export default {
  module: 'a2-verbes-prepositions',
  grammarFocus: ['verbes-prepositions-cas', 'questions-wo-praeposition'],

  vocabulary: [
    { id: 'warten', word: 'warten', article: null, plural: null, partOfSpeech: 'verb', translation: 'attendre',
      example: 'Wir müssen auf die Bestätigung warten.', note: 'auf + accusatif : auf den Bus warten' },
    { id: 'sprechen', word: 'sprechen', article: null, plural: null, partOfSpeech: 'verb', translation: 'parler',
      example: 'Ich möchte mit dem Kursleiter sprechen.', note: 'mit + datif (avec qqn), über + accusatif (de qqch) · er spricht' },
    { id: 'sich-interessieren', word: 'sich interessieren', article: null, plural: null, partOfSpeech: 'verb', translation: 's’intéresser',
      example: 'Viele Leute interessieren sich für den Fotokurs.', note: 'für + accusatif · ich interessiere mich' },
    { id: 'sich-anmelden', word: 'sich anmelden', article: null, plural: null, partOfSpeech: 'verb', translation: 's’inscrire',
      example: 'Man kann sich bis Mittwoch anmelden.', note: 'séparable : an|melden · für + accusatif : sich für den Kurs anmelden' },
    { id: 'anmeldung', word: 'Anmeldung', article: 'die', plural: 'Anmeldungen', partOfSpeech: 'noun', translation: 'l’inscription',
      example: 'Die Anmeldung ist bis Mittwoch möglich.', note: null },
    { id: 'bestaetigung', word: 'Bestätigung', article: 'die', plural: 'Bestätigungen', partOfSpeech: 'noun', translation: 'la confirmation',
      example: 'Ich warte noch auf die Bestätigung.', note: null },
    { id: 'antwort', word: 'Antwort', article: 'die', plural: 'Antworten', partOfSpeech: 'noun', translation: 'la réponse',
      example: 'Wir warten auf die Antwort vom Verein.', note: null },
    { id: 'kursleiter', word: 'Kursleiter', article: 'der', plural: 'Kursleiter', partOfSpeech: 'noun', translation: 'le responsable du cours',
      example: 'Herr Brand ist der Kursleiter.', note: 'au féminin : die Kursleiterin' },
    { id: 'kurs', word: 'Kurs', article: 'der', plural: 'Kurse', partOfSpeech: 'noun', translation: 'le cours, l’atelier',
      example: 'Der Kurs findet am Samstag statt.', note: null },
    { id: 'verein', word: 'Verein', article: 'der', plural: 'Vereine', partOfSpeech: 'noun', translation: 'l’association, le club',
      example: 'Der Verein bietet einen Tanzkurs an.', note: null },
    { id: 'ausstellung', word: 'Ausstellung', article: 'die', plural: 'Ausstellungen', partOfSpeech: 'noun', translation: 'l’exposition',
      example: 'Interessierst du dich für die Ausstellung?', note: null },
    { id: 'buergerhaus', word: 'Bürgerhaus', article: 'das', plural: 'Bürgerhäuser', partOfSpeech: 'noun', translation: 'la maison de quartier',
      example: 'Wir treffen uns vor dem Bürgerhaus.', note: null },
    { id: 'raumnummer', word: 'Raumnummer', article: 'die', plural: 'Raumnummern', partOfSpeech: 'noun', translation: 'le numéro de salle',
      example: 'Ohne die Raumnummer finde ich den Kurs nicht.', note: null },
    { id: 'mitmachen', word: 'mitmachen', article: null, plural: null, partOfSpeech: 'verb', translation: 'participer',
      example: 'Ich möchte am Samstag mitmachen.', note: 'séparable : mit|machen' },
    { id: 'anbieten', word: 'anbieten', article: null, plural: null, partOfSpeech: 'verb', translation: 'proposer, offrir',
      example: 'Das Bürgerhaus will einen Fotokurs anbieten.', note: 'séparable : an|bieten · Perfekt : hat angeboten' },
    { id: 'worauf', word: 'worauf', article: null, plural: null, partOfSpeech: 'adverb', translation: 'à quoi, quoi (après warten)',
      example: 'Worauf wartest du?', note: 'pour une chose ; pour une personne : auf wen?' },
    { id: 'auf-wen', word: 'auf wen', article: null, plural: null, partOfSpeech: 'expression', translation: 'qui (attendre quelqu’un)',
      example: 'Auf wen wartest du? – Auf meine Schwester.', note: 'accusatif : pour une personne' },
    { id: 'mit-wem', word: 'mit wem', article: null, plural: null, partOfSpeech: 'expression', translation: 'avec qui',
      example: 'Mit wem sprichst du?', note: 'datif : pour une personne' },
    { id: 'wofuer', word: 'wofür', article: null, plural: null, partOfSpeech: 'adverb', translation: 'pour quoi, à quoi',
      example: 'Wofür interessierst du dich?', note: 'pour une chose ; pour une personne : für wen?' },
    { id: 'womit', word: 'womit', article: null, plural: null, partOfSpeech: 'adverb', translation: 'avec quoi, par quel moyen',
      example: 'Womit fährst du zum Kurs?', note: 'pour un objet ou un moyen de transport' },
  ],

  activities: {
    'a2-verbes-prepositions-guide': {
      title: 'Découvrir : le verbe, sa préposition et son cas',
      estimatedMinutes: 15,
      lesson: {
        title: 'Découvrir : le verbe, sa préposition et son cas',
        description: `Lisez cette annonce d’une maison de quartier fictive.
« Wir bieten am Samstag einen Fotokurs an. Interessieren Sie sich für den Kurs? Schreiben Sie uns bis Mittwoch. Warten Sie dann auf unsere Bestätigung. Fragen zum Programm? Sprechen Sie mit dem Kursleiter, Herrn Stein. »
Repérez l’activité (un cours de photo le samedi), ce qu’il faut attendre avant de venir (die Bestätigung, la confirmation) et la personne qui renseigne (der Kursleiter, Herr Stein).

TROIS VERBES À APPRENDRE AVEC LEUR PRÉPOSITION
• warten auf + accusatif : auf den Bus warten, auf die Bestätigung warten
• sprechen mit + datif : mit dem Kursleiter sprechen, mit der Kursleiterin sprechen ; le sujet de la conversation se donne avec über + accusatif : über die Anmeldung
• sich interessieren für + accusatif : sich für den Fotokurs interessieren, sich für die Ausstellung interessieren
La préposition ne se traduit pas mot à mot : en français, on attend « quelque chose » ; en allemand, on attend « auf etwas ». Apprenez donc chaque verbe avec sa préposition et son cas.

LE CAS CHANGE L’ARTICLE
• Accusatif : seul le masculin change, der Bus → auf den Bus. Au féminin et au neutre, l’article ne bouge pas : auf die Bestätigung, für das Konzert.
• Datif : der Kursleiter → mit dem Kursleiter ; die Kursleiterin → mit der Kursleiterin ; au pluriel, mit den Kindern.
• Pronoms : Ich warte auf ihn (accusatif). Ich spreche mit ihm (datif).

LE PRONOM RÉFLÉCHI
Ich interessiere mich für den Fotokurs. Du interessierst dich … Wir interessieren uns … Dans une question, le pronom suit le sujet : Interessierst du dich für den Fotokurs?

DEMANDER : UNE CHOSE OU UNE PERSONNE ?
• Pour une chose, wo + préposition (avec -r- devant une voyelle) : Worauf wartest du? — Auf die Bestätigung. Wofür interessierst du dich? — Für den Fotokurs.
• Pour une personne, la préposition + wen (accusatif) ou wem (datif) : Auf wen wartest du? — Auf meine Schwester. Mit wem sprichst du? — Mit der Kursleiterin.
• Womit demande un moyen ou un objet : Womit fährst du zum Kurs? — Mit dem Bus.

ÉCOUTEZ LES MODÈLES
Écoutez les cinq phrases modèles et répétez chacune en faisant bien entendre l’article après la préposition. L’exercice « Répéter à voix haute » de ce module vérifie ensuite votre prononciation.`,
      },
    },

    'a2-verbes-prepositions-pratique': {
      kind: 'exercise',
      title: 'S’entraîner : comprendre une inscription à plusieurs',
      estimatedMinutes: 12,
      competences: ['ecoute', 'lecture'],
      lesson: {
        title: 'S’entraîner : comprendre une inscription à plusieurs',
        description: `Devant la maison de quartier, deux amis parlent des ateliers qui les intéressent et de ce qu’ils attendent encore avant de commencer.

1. Écoutez la scène une première fois sans regarder les questions : quel atelier intéresse chaque personne ?
2. Lisez les phrases à compléter, puis réécoutez : la plupart des trous portent sur une préposition, un pronom ou un mot interrogatif.
3. Validez vos réponses : la transcription s’affiche alors, avec l’explication de chaque réponse.`,
      },
      placements: { remove: ['a2-verbes-prepositions-dialogue'], add: [dialogue] },
      questions: [
        { id: 'q1', type: 'fill', prompt: 'La première question : complétez avec le pronom réfléchi.',
          text: 'Interessierst du [[1]] für den Fotokurs am Samstag?',
          blanks: [{ id: '1', accept: ['dich'], size: 6, hint: null }],
          explanation: 'Sich interessieren est pronominal : avec du, le pronom réfléchi est dich (du interessierst dich). Für den Fotokurs est à l’accusatif.' },
        { id: 'q2', type: 'fill', prompt: 'Qu’attend le jeune homme qui s’est déjà inscrit ?',
          text: 'Ich habe mich gestern angemeldet, aber ich warte noch [[1]] die [[2]].',
          blanks: [{ id: '1', accept: ['auf'], size: 5, hint: null }, { id: '2', accept: ['Bestätigung'], size: 12, hint: null }],
          explanation: 'Warten se construit avec auf + accusatif : auf die Bestätigung, la confirmation de son inscription. Il attend une chose, pas une personne.' },
        { id: 'q3', type: 'fill', prompt: 'À qui la jeune femme peut-elle poser sa question ? Complétez la question et la réponse.',
          text: 'Mit [[1]] kannst du darüber sprechen? — Mit [[2]] Kursleiter, Herrn Brand.',
          blanks: [{ id: '1', accept: ['wem'], size: 5, hint: null }, { id: '2', accept: ['dem'], size: 5, hint: null }],
          explanation: 'Pour une personne, on garde la préposition et on emploie wem, le datif de wer : Mit wem? Mit appelle le datif : der Kursleiter devient mit dem Kursleiter.' },
        { id: 'q4', type: 'fill', prompt: 'Que demande la jeune femme, et que répond son ami ?',
          text: '[[1]] wartest du genau? — Auf die E-Mail mit der [[2]].',
          blanks: [{ id: '1', accept: ['worauf'], size: 8, hint: null }, { id: '2', accept: ['Raumnummer'], size: 11, hint: null }],
          explanation: 'Pour une chose, on forme la question avec wo(r) + préposition : worauf, car warten auf. Il attend l’e-mail avec le numéro de salle (die Raumnummer).' },
        { id: 'q5', type: 'fill', prompt: 'Que proposent-ils de faire ensemble ?',
          text: 'Wir können nachher beide [[1]] Herrn Brand sprechen.',
          blanks: [{ id: '1', accept: ['mit'], size: 5, hint: null }],
          explanation: 'Sprechen mit + datif désigne la personne à qui l’on parle. Herrn est la forme de Herr à l’accusatif et au datif : mit Herrn Brand.' },
        { id: 'q6', type: 'fill', prompt: 'Que dit le jeune homme à la fin ? Complétez avec le verbe séparable.',
          text: 'Ich möchte am Samstag [[1]], aber am Sonntag habe ich keine Zeit.',
          blanks: [{ id: '1', accept: ['mitmachen'], size: 10, hint: null }],
          explanation: 'Mitmachen signifie participer. Avec le verbe de modalité möchte, l’infinitif mitmachen va à la fin, en un seul mot.' },
      ],
    },

    'a2-verbes-prepositions-approfondir': {
      kind: 'exercise',
      title: 'S’entraîner : la bonne préposition, le bon cas',
      estimatedMinutes: 12,
      competences: ['lecture', 'ecoute', 'expression-ecrite'],
      lesson: {
        title: 'S’entraîner : la bonne préposition, le bon cas',
        description: `Lisez d’abord ce fil de messages.
« Ich warte auf die Antwort vom Verein. Ich spreche nachher mit der Trainerin. Ich interessiere mich für den Tanzkurs am Montag. »
Votre ami pose trois questions : Worauf wartest du? Mit wem sprichst du? Wofür interessierst du dich? Chaque question reprend la préposition du verbe.

ERREURS FRÉQUENTES
• « Ich warte auf dem Bus. » → Ich warte auf den Bus. (warten auf + accusatif)
• « Sprichst du mit den Kursleiter? » → Sprichst du mit dem Kursleiter? (mit + datif)
• « Ich interessiere für den Fotokurs. » → Ich interessiere mich für den Fotokurs. (verbe pronominal)

À RETENIR
Pour une chose : Worauf? Wofür? Womit? Pour une personne : Auf wen? Für wen? Mit wem?

Complétez, associez, remettez dans l’ordre, puis écrivez les deux phrases dictées. Pour les dictées, écoutez autant de fois que nécessaire.`,
      },
      questions: [
        { id: 'q1', type: 'fill', prompt: 'Complétez avec l’article à l’accusatif.',
          text: 'Ich warte auf [[1]] Bus und auf [[2]] Bestätigung vom Verein.',
          blanks: [{ id: '1', accept: ['den'], size: 5, hint: 'der Bus' }, { id: '2', accept: ['die'], size: 5, hint: 'die Bestätigung' }],
          explanation: 'Warten auf demande l’accusatif. Seul le masculin change : der Bus → auf den Bus. Au féminin, l’article reste die : auf die Bestätigung.' },
        { id: 'q2', type: 'fill', prompt: 'Complétez avec l’article au datif.',
          text: 'Sprichst du mit [[1]] Kursleiter oder mit [[2]] Kursleiterin?',
          blanks: [{ id: '1', accept: ['dem'], size: 5, hint: 'der Kursleiter' }, { id: '2', accept: ['der'], size: 5, hint: 'die Kursleiterin' }],
          explanation: 'Mit est toujours suivi du datif : le masculin der devient dem, le féminin die devient der. « mit den Kursleiter » est une erreur fréquente : den est un accusatif.' },
        { id: 'q3', type: 'fill', prompt: 'Complétez avec le pronom réfléchi, puis l’article.',
          text: 'Ich interessiere [[1]] für [[2]] Fotokurs am Samstag.',
          blanks: [{ id: '1', accept: ['mich'], size: 5, hint: null }, { id: '2', accept: ['den'], size: 5, hint: 'der Fotokurs' }],
          explanation: 'Sich interessieren exige le pronom réfléchi : ich interessiere mich. Für est suivi de l’accusatif : der Fotokurs devient für den Fotokurs.' },
        { id: 'q4', type: 'fill', prompt: 'Remplacez Jonas par un pronom personnel au bon cas.',
          text: 'Wo ist Jonas? Ich warte schon seit zehn Minuten auf [[1]], und ich muss dringend mit [[2]] sprechen.',
          blanks: [{ id: '1', accept: ['ihn'], size: 5, hint: null }, { id: '2', accept: ['ihm'], size: 5, hint: null }],
          explanation: 'Après auf (warten auf), le pronom est à l’accusatif : ihn. Après mit, il est au datif : ihm. Ihn et ihm ne diffèrent que d’une lettre, mais ne s’échangent pas.' },
        { id: 'q5', type: 'match', prompt: 'Associez chaque verbe à sa préposition et à son cas.',
          pairs: [
            { left: 'warten', right: 'auf + accusatif' },
            { left: 'sprechen (avec quelqu’un)', right: 'mit + datif' },
            { left: 'sprechen (d’un sujet)', right: 'über + accusatif' },
            { left: 'sich interessieren', right: 'für + accusatif' },
          ],
          explanation: 'On attend auf + accusatif, on s’intéresse für + accusatif. Sprechen prend mit + datif pour l’interlocuteur et über + accusatif pour le sujet : Ich spreche mit dem Kursleiter über die Anmeldung.' },
        { id: 'q6', type: 'match', prompt: 'Associez chaque question à sa réponse.',
          pairs: [
            { left: 'Worauf wartest du?', right: 'Auf die Bestätigung.' },
            { left: 'Auf wen wartest du?', right: 'Auf meine Schwester.' },
            { left: 'Mit wem sprichst du?', right: 'Mit der Kursleiterin.' },
            { left: 'Womit fährst du zum Kurs?', right: 'Mit dem Bus.' },
            { left: 'Wofür interessierst du dich?', right: 'Für den Zeichenkurs.' },
          ],
          explanation: 'Worauf, womit et wofür portent sur une chose ; auf wen et mit wem portent sur une personne. La préposition de la question se retrouve toujours dans la réponse.' },
        { id: 'q7', type: 'order', prompt: 'Posez la question : remettez les mots dans l’ordre.',
          answers: [['Mit wem', 'möchtest', 'du', 'über die Anmeldung', 'sprechen?']],
          explanation: 'Le groupe interrogatif Mit wem occupe la première position, le verbe conjugué möchtest la deuxième, et l’infinitif sprechen va à la fin. Über die Anmeldung donne le sujet de la conversation.' },
        { id: 'q8', type: 'order', prompt: 'Remettez les mots dans l’ordre. Commencez par « Wir ».',
          answers: [['Wir', 'warten', 'vor dem Eingang', 'auf', 'Herrn Brand'], ['Wir', 'warten', 'auf', 'Herrn Brand', 'vor dem Eingang']],
          explanation: 'Le verbe warten suit le sujet Wir. Les deux compléments peuvent s’échanger : vor dem Eingang (où ?) et auf Herrn Brand (qui ?). Herr devient Herrn à l’accusatif.' },
        { id: 'q9', type: 'dictation', prompt: 'Écoutez et écrivez la phrase : quelqu’un attend depuis longtemps.',
          accept: ['Ich warte seit zwanzig Minuten auf den Bus.', 'Ich warte seit 20 Minuten auf den Bus.'], voice: 'sprecher',
          explanation: 'Warten auf + accusatif : auf den Bus. Seit + datif indique depuis quand : seit zwanzig Minuten (datif pluriel, déjà en -n).' },
        { id: 'q10', type: 'dictation', prompt: 'Écoutez et écrivez la question posée à une amie.',
          accept: ['Interessierst du dich auch für den Zeichenkurs?'], voice: 'sprecherin',
          explanation: 'Dans la question, le verbe ouvre la phrase et le pronom réfléchi dich suit le sujet du. Für den Zeichenkurs est à l’accusatif masculin.' },
      ],
    },

    'a2-verbes-prepositions-controle': {
      title: 'Vérifier : qui attend quoi, qui parle à qui ?',
      estimatedMinutes: 10,
      lesson: {
        title: 'Vérifier : qui attend quoi, qui parle à qui ?',
        description: 'Écoutez une première fois la scène devant la maison de quartier pour la situation générale. Lisez les questions, puis réécoutez pour les détails. Les trois dernières questions portent sur la langue : répondez sans réécouter. Après validation, la transcription et l’explication de chaque réponse s’affichent.',
      },
      explanations: {
        q1: 'À la question « Interessierst du dich für den Fotokurs am Samstag? », le jeune homme répond « Ja. Ich habe mich gestern angemeldet ». L’atelier cuisine du mercredi intéresse l’autre personne, et le dimanche, il n’a pas le temps.',
        q2: '« Mit wem kannst du darüber sprechen? — Mit dem Kursleiter, Herrn Brand. » Le responsable renseigne sur l’atelier cuisine ; le message de la sœur n’a rien à voir avec l’atelier.',
        q3: '« Er kommt aber erst um achtzehn Uhr ins Bürgerhaus » : il n’arrive pas avant 18 h (erst = pas avant). Ni 17 h ni 20 h ne sont mentionnés.',
        q4: '« Dann warten wir hier vor dem Eingang » : ils attendent devant l’entrée. Vor + datif répond à la question wo? ; la salle de cours, ils ne la connaissent pas encore.',
        q5: 'Il attend « die E-Mail mit der Raumnummer » : sans le numéro de salle, il ne sait pas où a lieu le cours. Le matériel de cuisine concerne la question de l’autre personne.',
        q6: 'Warten se construit avec auf + accusatif : der Bus devient den Bus. « Auf dem Bus » est un datif de lieu (sur le bus), et « warten für » n’existe pas en allemand.',
        q7: 'Pour une personne, on garde la préposition et on emploie wem (datif) : Mit wem sprichst du? Womit demande une chose ou un moyen (Womit fährst du? — Mit dem Bus).',
        q8: 'Avec wir, le pronom réfléchi est uns, et für est suivi de l’accusatif : für den Fotokurs. « Für dem » est un datif impossible après für, et la troisième phrase oublie le pronom réfléchi.',
      },
    },

    'a2-verbes-prepositions-mission': {
      kind: 'mission',
      title: 'Mission : s’inscrire à un atelier avec un ami',
      estimatedMinutes: 20,
      competences: ['expression-orale', 'expression-ecrite'],
      lesson: {
        title: 'Mission : s’inscrire à un atelier avec un ami',
        description: `Situation : le centre culturel propose un cours de dessin. Vous vous y intéressez, vous attendez la confirmation de votre inscription et vous pouvez demander de l’aide à la responsable du cours. Un ami s’intéresse au même cours. Ensuite, vous apprenez que l’atelier est complet le lundi, mais qu’il reste des places le jeudi.

Modèles : Ich interessiere mich für den Zeichenkurs. Ich warte noch auf die Bestätigung. Morgen spreche ich mit der Kursleiterin. Sollen wir zusammen auf die Bestätigung warten?

Préparez trois groupes de mots avec la préposition et l’article (für den Zeichenkurs, auf die Bestätigung, mit der Kursleiterin), puis réalisez les deux parties. Avant d’envoyer, relisez l’article après chaque préposition.`,
      },
      mission: {
        oral: {
          prompt: 'Enregistrez un message vocal pour votre ami (une minute environ) : dites quel cours vous intéresse, ce que vous attendez et avec qui vous voulez parler, puis proposez-lui d’attendre la confirmation ensemble.',
          maxSeconds: 90,
        },
        written: {
          prompt: 'L’atelier est complet le lundi, mais il reste des places le jeudi. Écrivez à votre ami un message de 50 à 65 mots : le nouveau jour, ce que vous attendez maintenant, la personne à qui vous voulez parler, et une question pour savoir si jeudi lui convient.',
          maxChars: 900,
          minWords: 50,
        },
        checklist: [
          'J’ai employé sich interessieren für avec le bon pronom réfléchi et l’accusatif (für den Zeichenkurs).',
          'J’ai dit ce que j’attends avec warten auf + accusatif (auf die Bestätigung).',
          'J’ai nommé la personne à contacter avec sprechen mit + datif (mit der Kursleiterin).',
          'Mon message écrit annonce le nouveau jour, jeudi, et pose une question à mon ami.',
          'J’ai relu chaque article après auf, für et mit.',
        ],
      },
    },
  },

  add: [
    {
      after: 'a2-verbes-prepositions-controle',
      activity: {
        id: 'a2-verbes-prepositions-repeter',
        kind: 'exercise',
        title: 'Répéter à voix haute : attendre, parler, s’intéresser',
        estimatedMinutes: 8,
        competences: ['expression-orale'],
        lesson: {
          title: 'Répéter à voix haute : attendre, parler, s’intéresser',
          description: 'Écoutez chaque modèle, puis dites la phrase à voix haute. Faites bien entendre l’article après la préposition : auf den, mit dem, für den. Si la reconnaissance vocale ne comprend pas votre phrase, réécoutez le modèle et réessayez.',
          transcript: null,
        },
        placements: [],
        questions: [
          { id: 'q1', type: 'speak', prompt: 'Écoutez, puis dites ce que vous attendez.',
            text: 'Ich warte auf den Bus vor dem Bürgerhaus.', accept: ['Ich warte auf den Bus vor dem Bürgerhaus.'], threshold: 75,
            explanation: 'Auf den Bus (accusatif, ce qu’on attend) et vor dem Bürgerhaus (datif, le lieu) : faites entendre le -n de den et le -m de dem.' },
          { id: 'q2', type: 'speak', prompt: 'Écoutez, puis dites avec qui vous parlez et de quoi.',
            text: 'Ich spreche mit dem Kursleiter über die Anmeldung.', accept: ['Ich spreche mit dem Kursleiter über die Anmeldung.'], threshold: 75,
            explanation: 'Mit dem Kursleiter désigne la personne, über die Anmeldung le sujet. Le « sp » de spreche se prononce « chp ».' },
          { id: 'q3', type: 'speak', prompt: 'Écoutez, puis dites quel cours vous intéresse.',
            text: 'Ich interessiere mich für den Fotokurs am Samstag.', accept: ['Ich interessiere mich für den Fotokurs am Samstag.'], threshold: 75,
            explanation: 'L’accent de interessiere tombe sur « ssie ». Le pronom mich suit directement le verbe, avant für den Fotokurs.' },
          { id: 'q4', type: 'speak', prompt: 'Écoutez, puis demandez avec qui votre amie parle.',
            text: 'Mit wem sprichst du?', accept: ['Mit wem sprichst du?'], threshold: 75,
            explanation: 'Question sur une personne : mit + wem, au datif. La voix descend à la fin, comme dans toute question avec un mot interrogatif.' },
          { id: 'q5', type: 'speak', prompt: 'Écoutez, puis demandez ce que votre ami attend.',
            text: 'Worauf wartest du genau?', accept: ['Worauf wartest du genau?'], threshold: 75,
            explanation: 'Question sur une chose : wo + r + auf. L’accent tombe sur la seconde syllabe : wo-RAUF.' },
        ],
      },
    },
  ],
};
