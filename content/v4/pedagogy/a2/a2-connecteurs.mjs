// Couche pédagogique V4 · a2-connecteurs (lot A7, contenu A2).
// Employer weil, denn, deshalb et trotzdem avec le verbe à la bonne place : exercices typés, répétition validée, mission remise.

const dialogue = { media: 'a2-connecteurs-dialogue', usage: 'audio', transcriptVisibility: 'after_answer', decorative: false };

export default {
  module: 'a2-connecteurs',
  grammarFocus: ['connecteurs-weil-denn-deshalb-trotzdem', 'place-du-verbe'],

  vocabulary: [
    { id: 'weil', word: 'weil', article: null, plural: null, partOfSpeech: 'conjunction', translation: 'parce que',
      example: 'Ich komme später, weil mein Bus Verspätung hat.', note: 'verbe conjugué à la fin de la proposition' },
    { id: 'denn', word: 'denn', article: null, plural: null, partOfSpeech: 'conjunction', translation: 'car',
      example: 'Wir nehmen den Bus, denn das Wetter ist schlecht.', note: 'ordre d’une principale : verbe en 2e position' },
    { id: 'deshalb', word: 'deshalb', article: null, plural: null, partOfSpeech: 'adverb', translation: 'c’est pourquoi, donc',
      example: 'Der Aufzug ist kaputt. Deshalb nehmen wir die Treppe.', note: 'en tête de phrase, le verbe suit directement' },
    { id: 'trotzdem', word: 'trotzdem', article: null, plural: null, partOfSpeech: 'adverb', translation: 'quand même, malgré cela',
      example: 'Es regnet stark. Trotzdem findet das Fest statt.', note: 'en tête de phrase, le verbe suit directement' },
    { id: 'raum', word: 'Raum', article: 'der', plural: 'Räume', partOfSpeech: 'noun', translation: 'la salle, la pièce',
      example: 'Der Raum neben der Bibliothek ist frei.', note: null },
    { id: 'heizung', word: 'Heizung', article: 'die', plural: 'Heizungen', partOfSpeech: 'noun', translation: 'le chauffage',
      example: 'Im alten Raum ist die Heizung kaputt.', note: null },
    { id: 'schluessel', word: 'Schlüssel', article: 'der', plural: 'Schlüssel', partOfSpeech: 'noun', translation: 'la clé',
      example: 'Den Schlüssel habe ich schon.', note: null },
    { id: 'eingang', word: 'Eingang', article: 'der', plural: 'Eingänge', partOfSpeech: 'noun', translation: 'l’entrée',
      example: 'Wir treffen uns am Eingang.', note: 'der Haupteingang : l’entrée principale' },
    { id: 'seiteneingang', word: 'Seiteneingang', article: 'der', plural: 'Seiteneingänge', partOfSpeech: 'noun', translation: 'l’entrée latérale',
      example: 'Deshalb treffen wir uns am Seiteneingang.', note: null },
    { id: 'teilnehmer', word: 'Teilnehmer', article: 'der', plural: 'Teilnehmer', partOfSpeech: 'noun', translation: 'le participant',
      example: 'Wir schreiben jedem Teilnehmer eine Nachricht.', note: 'au féminin : die Teilnehmerin, die Teilnehmerinnen' },
    { id: 'verspaetung', word: 'Verspätung', article: 'die', plural: 'Verspätungen', partOfSpeech: 'noun', translation: 'le retard',
      example: 'Mein Bus hat zehn Minuten Verspätung.', note: null },
    { id: 'lieferung', word: 'Lieferung', article: 'die', plural: 'Lieferungen', partOfSpeech: 'noun', translation: 'la livraison',
      example: 'Die Lieferung kommt erst um zwölf.', note: null },
    { id: 'zettel', word: 'Zettel', article: 'der', plural: 'Zettel', partOfSpeech: 'noun', translation: 'le petit mot, la feuille volante',
      example: 'Kannst du einen Zettel an die Tür hängen?', note: null },
    { id: 'aufzug', word: 'Aufzug', article: 'der', plural: 'Aufzüge', partOfSpeech: 'noun', translation: 'l’ascenseur',
      example: 'Der Aufzug ist kaputt.', note: null },
    { id: 'treppe', word: 'Treppe', article: 'die', plural: 'Treppen', partOfSpeech: 'noun', translation: 'l’escalier',
      example: 'Wir nehmen die Treppe.', note: null },
    { id: 'kaputt', word: 'kaputt', article: null, plural: null, partOfSpeech: 'adjective', translation: 'cassé, en panne',
      example: 'Die Heizung ist kaputt.', note: null },
    { id: 'geschlossen', word: 'geschlossen', article: null, plural: null, partOfSpeech: 'adjective', translation: 'fermé',
      example: 'Raum 7 ist heute geschlossen.', note: null },
    { id: 'fehlen', word: 'fehlen', article: null, plural: null, partOfSpeech: 'verb', translation: 'manquer',
      example: 'Heute fehlen zwei Personen.', note: null },
    { id: 'verschieben', word: 'verschieben', article: null, plural: null, partOfSpeech: 'verb', translation: 'reporter, décaler',
      example: 'Wir müssen den Kochkurs verschieben.', note: 'Perfekt : hat verschoben' },
    { id: 'verlegen', word: 'verlegen', article: null, plural: null, partOfSpeech: 'verb', translation: 'déplacer (un événement)',
      example: 'Können wir das Treffen in Raum 12 verlegen?', note: null },
    { id: 'stattfinden', word: 'stattfinden', article: null, plural: null, partOfSpeech: 'verb', translation: 'avoir lieu',
      example: 'Das Fest kann trotzdem stattfinden.', note: 'séparable : statt|finden — Das Fest findet statt.' },
    { id: 'wie-geplant', word: 'wie geplant', article: null, plural: null, partOfSpeech: 'expression', translation: 'comme prévu',
      example: 'Wir beginnen wie geplant um fünfzehn Uhr.', note: null },
  ],

  activities: {
    'a2-connecteurs-guide': {
      title: 'Découvrir : weil, denn, deshalb et trotzdem',
      estimatedMinutes: 15,
      lesson: {
        title: 'Découvrir : weil, denn, deshalb et trotzdem',
        description: `Lisez ces trois messages d’un cours du soir fictif.
« Wir treffen uns heute in Raum 12, weil Raum 7 geschlossen ist. »
« Der Drucker funktioniert nicht. Deshalb schickt die Lehrerin das Blatt per E-Mail. »
« Am Abend regnet es. Trotzdem findet der Fahrradkurs statt. »
Repérez dans chaque message ce qui explique une décision (la cause), ce qui en résulte (la conséquence) et ce qui arrive malgré un obstacle (l’opposition).

WEIL OU DENN : DONNER UNE RAISON
Ich komme später, weil mein Bus Verspätung hat. — Ich komme später, denn mein Bus hat Verspätung.
Les deux phrases disent la même chose, mais l’ordre des mots change. Avec weil, le verbe conjugué va à la fin de la proposition. Denn ne compte pas comme un élément : après denn, on garde l’ordre d’une phrase principale, avec le sujet mein Bus en première position et le verbe hat en deuxième.

DESHALB ET TROTZDEM : ANNONCER LA SUITE
Der Aufzug ist kaputt. Deshalb nehmen wir die Treppe. — Der Aufzug ist kaputt. Trotzdem komme ich pünktlich.
Deshalb annonce la conséquence attendue ; trotzdem annonce ce qui arrive malgré l’obstacle. En tête de phrase, le connecteur occupe la première position : le verbe conjugué vient juste après, puis le sujet. On peut aussi commencer par le sujet et placer le connecteur après le verbe : Wir nehmen deshalb die Treppe. Ich komme trotzdem pünktlich.

À RETENIR
• weil → verbe conjugué à la fin : …, weil ich krank bin. Avec un verbe de modalité : …, weil ich noch einkaufen muss.
• denn → ordre d’une principale : …, denn ich bin krank.
• deshalb / trotzdem en tête → verbe juste après : Deshalb bleibe ich zu Hause. Trotzdem gehe ich zur Arbeit.
• « Deuxième position » veut dire deuxième élément, même si le premier compte plusieurs mots : Am Abend regnet es.

ÉCOUTEZ LES MODÈLES
Écoutez les quatre phrases modèles et répétez chacune en marquant une petite pause à la virgule ou au point. L’exercice « Répéter à voix haute » de ce module vérifie ensuite votre prononciation.`,
      },
    },

    'a2-connecteurs-pratique': {
      kind: 'exercise',
      title: 'S’entraîner : comprendre pourquoi le programme change',
      estimatedMinutes: 12,
      competences: ['ecoute', 'lecture'],
      lesson: {
        title: 'S’entraîner : comprendre pourquoi le programme change',
        description: `Deux bénévoles d’un Repair-Café ne peuvent pas utiliser leur salle habituelle et réorganisent l’après-midi.

1. Écoutez la scène une première fois sans regarder les questions : quel est le problème, et où le groupe va-t-il travailler ?
2. Lisez les phrases à compléter, puis réécoutez : chaque trou correspond à un mot entendu, souvent le connecteur ou le verbe qui le suit.
3. Validez vos réponses : la transcription s’affiche alors, avec l’explication de chaque réponse.`,
      },
      placements: { remove: ['a2-connecteurs-dialogue'], add: [dialogue] },
      questions: [
        { id: 'q1', type: 'fill', prompt: 'Complétez la première réplique : pourquoi le groupe change-t-il de salle ?',
          text: 'Wir können heute nicht im alten Raum arbeiten, [[1]] dort die [[2]] kaputt ist.',
          blanks: [{ id: '1', accept: ['weil'], size: 7, hint: null }, { id: '2', accept: ['Heizung'], size: 10, hint: null }],
          explanation: 'On entend « weil dort die Heizung kaputt ist » : weil introduit la cause, et le verbe conjugué ist ferme la proposition. Die Heizung, c’est le chauffage.' },
        { id: 'q2', type: 'fill', prompt: 'Où se trouve la salle libre ?',
          text: 'Der Raum neben der [[1]] ist frei.',
          blanks: [{ id: '1', accept: ['Bibliothek'], size: 12, hint: null }],
          explanation: 'L’homme propose « der Raum neben der Bibliothek » : la salle voisine de la bibliothèque. Neben + datif répond à la question wo? ; d’où der Bibliothek.' },
        { id: 'q3', type: 'fill', prompt: 'Pourquoi faut-il écrire aux participants ?',
          text: 'Dann schreiben wir den Teilnehmern, [[1]] einige [[2]] den neuen Raum noch nicht.',
          blanks: [{ id: '1', accept: ['denn'], size: 7, hint: null }, { id: '2', accept: ['kennen'], size: 8, hint: null }],
          explanation: 'Après denn, la proposition garde l’ordre d’une principale : sujet einige, puis verbe kennen en deuxième position. Avec weil, on aurait dit « weil einige den neuen Raum noch nicht kennen ».' },
        { id: 'q4', type: 'fill', prompt: 'Quelle décision prend-on pour le lieu de rendez-vous ?',
          text: 'Vor dem Haupteingang ist kein Platz für Fahrräder. [[1]] treffen wir uns am [[2]].',
          blanks: [{ id: '1', accept: ['deshalb', 'deswegen', 'darum', 'daher'], size: 9, hint: null }, { id: '2', accept: ['Seiteneingang'], size: 14, hint: null }],
          explanation: 'Deshalb annonce la conséquence du manque de place : on se retrouve à l’entrée latérale (der Seiteneingang). Le connecteur occupe la première position, donc le verbe treffen suit immédiatement.' },
        { id: 'q5', type: 'fill', prompt: 'Que fait le bénévole qui a peu de temps ?',
          text: 'Ich habe heute wenig Zeit. [[1]] kann ich eine [[2]] Stunde helfen.',
          blanks: [{ id: '1', accept: ['trotzdem', 'dennoch'], size: 9, hint: null }, { id: '2', accept: ['halbe'], size: 6, hint: null }],
          explanation: 'Trotzdem signale une action maintenue malgré l’obstacle : il aide quand même une demi-heure (eine halbe Stunde). Après trotzdem en tête vient le verbe kann, puis le sujet ich.' },
        { id: 'q6', type: 'fill', prompt: 'À quelle heure l’atelier commence-t-il ? Écrivez le nombre en chiffres ou en lettres.',
          text: 'Wir beginnen wie geplant um [[1]] Uhr.',
          blanks: [{ id: '1', accept: ['fünfzehn', '15'], size: 9, hint: null }],
          explanation: 'La femme confirme « wie geplant um fünfzehn Uhr » : l’horaire ne change pas, seul le lieu change. Wie geplant signifie « comme prévu ».' },
      ],
    },

    'a2-connecteurs-approfondir': {
      kind: 'exercise',
      title: 'S’entraîner : placer le verbe après chaque connecteur',
      estimatedMinutes: 12,
      competences: ['lecture', 'ecoute', 'expression-ecrite'],
      lesson: {
        title: 'S’entraîner : placer le verbe après chaque connecteur',
        description: `Lisez d’abord ces deux notes laissées à l’équipe d’une cuisine collective.
« Die Lieferung kommt erst um zwölf. Deshalb können wir um elf noch nicht kochen. Wir öffnen trotzdem um halb eins, denn die Suppe ist schon fertig. »
« Wir verschieben den Kochkurs, weil zwei Personen fehlen. Die Gäste können trotzdem zum Mittagessen kommen. »
Dans la première note, trotzdem suit le verbe, car le sujet wir occupe déjà la première position.

ERREURS FRÉQUENTES
• « …, weil ich kann heute helfen. » → …, weil ich heute helfen kann.
• « Deshalb wir treffen uns draußen. » → Deshalb treffen wir uns draußen.
• « Trotzdem meine Kollegin kommt um neun. » → Trotzdem kommt meine Kollegin um neun. Ou : Meine Kollegin kommt trotzdem um neun.

Remettez ensuite les mots dans l’ordre, complétez les phrases et écrivez les deux phrases dictées. Pour les dictées, écoutez autant de fois que nécessaire.`,
      },
      questions: [
        { id: 'q1', type: 'order', prompt: 'Donnez la raison avec weil : remettez les mots dans l’ordre.',
          answers: [['Ich nehme ein Taxi,', 'weil', 'mein Bus', 'Verspätung', 'hat.']],
          explanation: 'Weil introduit une subordonnée : le sujet mein Bus suit le connecteur et le verbe conjugué hat va tout à la fin. « weil mein Bus hat Verspätung » est l’ordre de denn, pas celui de weil.' },
        { id: 'q2', type: 'order', prompt: 'Même idée avec denn : remettez les mots dans l’ordre.',
          answers: [['Ich nehme ein Taxi,', 'denn', 'mein Bus', 'hat', 'Verspätung.']],
          explanation: 'Denn ne compte pas comme un élément : la proposition qui suit garde l’ordre d’une principale, avec le verbe hat en deuxième position. Placer hat à la fin est la règle de weil.' },
        { id: 'q3', type: 'order', prompt: 'Avec un verbe de modalité après weil : remettez les mots dans l’ordre.',
          answers: [['Ich bleibe länger,', 'weil', 'ich', 'heute', 'helfen', 'kann.']],
          explanation: 'Dans la subordonnée, le verbe conjugué kann se place après l’infinitif helfen, tout à la fin. Le pronom sujet ich suit directement weil. « weil ich kann heute helfen » est une erreur fréquente.' },
        { id: 'q4', type: 'order', prompt: 'Annoncez la conséquence. Commencez la seconde phrase par « Deshalb ».',
          answers: [['Vor dem Eingang ist kein Platz.', 'Deshalb', 'treffen', 'wir', 'uns', 'draußen.']],
          explanation: 'Deshalb occupe la première position : le verbe conjugué treffen vient juste après, puis le sujet wir et le pronom réfléchi uns. « Deshalb wir treffen » mettrait le verbe en troisième position.' },
        { id: 'q5', type: 'order', prompt: 'Annoncez ce qui a lieu malgré l’obstacle. Commencez la seconde phrase par « Trotzdem ».',
          answers: [['Es regnet stark.', 'Trotzdem', 'findet', 'das Fest', 'statt.']],
          explanation: 'Après trotzdem en tête, le verbe conjugué findet suit immédiatement et le sujet das Fest vient ensuite. La particule statt du verbe séparable stattfinden se place à la fin.' },
        { id: 'q6', type: 'fill', prompt: 'Complétez avec weil, denn, deshalb ou trotzdem.',
          text: 'Der Drucker funktioniert nicht. [[1]] schickt die Lehrerin das Blatt per E-Mail.',
          blanks: [{ id: '1', accept: ['deshalb', 'deswegen', 'darum', 'daher'], size: 9, hint: null }],
          explanation: 'L’envoi par e-mail est la conséquence de la panne : deshalb. Trotzdem annoncerait une action faite malgré la panne. Weil et denn sont exclus, car le verbe schickt suit directement le mot à compléter.' },
        { id: 'q7', type: 'fill', prompt: 'Le message doit dire clairement que le cours continue malgré la porte fermée. Complétez.',
          text: 'Die Tür ist geschlossen. [[1]] [[2]] der Kurs in Raum 12 weiter.',
          blanks: [{ id: '1', accept: ['trotzdem', 'dennoch'], size: 9, hint: null }, { id: '2', accept: ['geht'], size: 6, hint: 'weitergehen' }],
          explanation: 'Le cours continue malgré l’obstacle : trotzdem. En tête de phrase, il est suivi du verbe conjugué geht ; la particule weiter de weitergehen reste à la fin. « Deshalb » laisserait croire que la porte fermée est la raison de la suite du cours.' },
        { id: 'q8', type: 'match', prompt: 'Associez chaque connecteur à son sens et à la place du verbe.',
          pairs: [
            { left: 'weil', right: 'cause · verbe conjugué à la fin' },
            { left: 'denn', right: 'cause · ordre d’une principale' },
            { left: 'deshalb', right: 'conséquence · verbe juste après' },
            { left: 'trotzdem', right: 'opposition · verbe juste après' },
          ],
          explanation: 'Weil et denn donnent tous deux une cause, mais seul weil renvoie le verbe à la fin. Deshalb (conséquence) et trotzdem (opposition) comptent comme un élément : en tête de phrase, le verbe les suit directement.' },
        { id: 'q9', type: 'dictation', prompt: 'Écoutez et écrivez la phrase : une raison avec weil.',
          accept: ['Wir bleiben heute zu Hause, weil es stark regnet.'], voice: 'sprecherin',
          explanation: 'Après weil, le verbe conjugué regnet termine la phrase : « weil es stark regnet ». Attention à l’orthographe de Hause (zu Hause, en deux mots) et à la virgule devant weil.' },
        { id: 'q10', type: 'dictation', prompt: 'Écoutez et écrivez les deux phrases : un problème, puis sa conséquence.',
          accept: ['Der Bus kommt nicht. Deshalb gehen wir zu Fuß.'], voice: 'sprecher',
          explanation: 'Deshalb ouvre la seconde phrase et le verbe gehen suit directement, avant le sujet wir. Fuß s’écrit avec ß, car la voyelle u est longue.' },
      ],
    },

    'a2-connecteurs-controle': {
      title: 'Vérifier : cause, conséquence ou opposition ?',
      estimatedMinutes: 10,
      lesson: {
        title: 'Vérifier : cause, conséquence ou opposition ?',
        description: 'Écoutez une première fois la scène du Repair-Café pour la situation générale. Lisez les questions, puis réécoutez pour les détails. Les trois dernières questions portent sur l’ordre des mots : répondez sans réécouter. Après validation, la transcription et l’explication de chaque réponse s’affichent.',
      },
      explanations: {
        q1: 'La bénévole dit « weil dort die Heizung kaputt ist » : le chauffage de l’ancienne salle est en panne. La bibliothèque sert seulement à situer la nouvelle salle, et la clé, elle l’a déjà (« den Schlüssel habe ich schon »).',
        q2: '« Denn einige kennen den neuen Raum noch nicht » : certains participants ne connaissent pas encore la nouvelle salle. La date ne change pas, et les vélos ne concernent que le lieu de rendez-vous.',
        q3: '« Vor dem Haupteingang ist kein Platz für Fahrräder. Deshalb treffen wir uns am Seiteneingang. » Der Seiteneingang est l’entrée latérale ; l’entrée principale (der Haupteingang) est justement écartée.',
        q4: '« Trotzdem kann ich eine halbe Stunde helfen » : malgré le manque de temps, le bénévole aide quand même trente minutes. Trotzdem annonce une action maintenue, ni un report ni une annulation.',
        q5: '« Wir beginnen wie geplant um fünfzehn Uhr » : l’atelier commence à 15 h, comme prévu (wie geplant). Seul le lieu change, pas l’heure.',
        q6: 'Weil introduit une subordonnée : le verbe conjugué ist se place à la fin (… noch geschlossen ist). « weil der Raum ist noch geschlossen » garde l’ordre d’une principale, qui est la construction de denn.',
        q7: 'Après denn, la proposition garde l’ordre d’une principale : le sujet der Raum, puis le verbe ist en deuxième position. Mettre ist à la fin est la règle de weil, pas celle de denn.',
        q8: 'Trotzdem annonce une action maintenue malgré l’obstacle : il pleut, on va quand même au parc. Deshalb annonce au contraire la suite attendue (on reste à la maison) et denn introduit une cause.',
      },
    },

    'a2-connecteurs-mission': {
      kind: 'mission',
      // Récapitulatif de la scène (images-v4, placé sur l’ancienne correction) : déplacé vers la répétition.
      placements: { remove: ['v4-a2-connecteurs-zettel'] },
      title: 'Mission : annoncer un changement de programme',
      estimatedMinutes: 20,
      competences: ['expression-orale', 'expression-ecrite'],
      lesson: {
        title: 'Mission : annoncer un changement de programme',
        description: `Situation : vous animez un atelier de cuisine prévu à 17 h. Le four du local est en panne. La cuisine du centre voisin est disponible, mais les participants ne la connaissent pas. Un collègue pressé peut tout de même aider quinze minutes. Ensuite, le responsable vous apprend que la nouvelle cuisine ne sera libre qu’à 17 h 30.

Préparez quelques mots-clés, puis réalisez les deux parties. Modèles : Wir wechseln den Raum, weil der Ofen kaputt ist. Deshalb schicken wir allen die neue Adresse. Wir beginnen um halb sechs, denn der Raum ist erst dann frei. Das gemeinsame Essen findet trotzdem statt.

Avant d’envoyer, relisez chaque verbe conjugué : à la fin après weil, en deuxième position après denn, juste après deshalb ou trotzdem placés en tête.`,
      },
      mission: {
        oral: {
          prompt: 'Enregistrez un message vocal pour votre équipe (une minute environ). Expliquez le changement de lieu avec weil, demandez avec deshalb d’envoyer la nouvelle adresse et dites avec trotzdem quelle aide reste possible.',
          maxSeconds: 90,
        },
        written: {
          prompt: 'Écrivez aux participants un message de 50 à 70 mots. Indiquez le nouveau lieu et la nouvelle heure (17 h 30), donnez la raison avec denn et précisez avec trotzdem ce qui reste prévu.',
          maxChars: 1000,
          minWords: 50,
        },
        checklist: [
          'Mon message vocal explique le changement de lieu avec weil, et le verbe conjugué est à la fin.',
          'J’ai employé deshalb et trotzdem en tête de phrase, suivis directement du verbe.',
          'Mon message écrit donne le nouveau lieu et l’heure de 17 h 30.',
          'Après denn, j’ai gardé l’ordre d’une principale : sujet, puis verbe.',
          'J’ai relu mon message pour vérifier les majuscules des noms et la ponctuation.',
        ],
      },
    },
  },

  add: [
    {
      after: 'a2-connecteurs-controle',
      activity: {
        id: 'a2-connecteurs-repeter',
        kind: 'exercise',
        title: 'Répéter à voix haute : relier deux idées',
        estimatedMinutes: 8,
        competences: ['expression-orale'],
        lesson: {
          title: 'Répéter à voix haute : relier deux idées',
          description: 'Écoutez chaque modèle, puis dites la phrase à voix haute. Marquez une courte pause à la virgule ou au point, et faites entendre le verbe qui suit le connecteur. Si la reconnaissance vocale ne comprend pas votre phrase, réécoutez le modèle et réessayez.',
          transcript: null,
        },
        placements: [{ media: 'v4-a2-connecteurs-zettel', usage: 'illustration', transcriptVisibility: 'hidden', decorative: false }],
        questions: [
          { id: 'q1', type: 'speak', prompt: 'Écoutez, puis répétez : une raison avec weil.',
            text: 'Ich komme später, weil mein Bus Verspätung hat.', accept: ['Ich komme später, weil mein Bus Verspätung hat.'], threshold: 75,
            explanation: 'La voix descend sur « Verspätung hat » : le verbe conjugué hat clôt la subordonnée. L’accent de Verspätung porte sur la syllabe « spä ».' },
          { id: 'q2', type: 'speak', prompt: 'Écoutez, puis répétez : une raison avec denn.',
            text: 'Wir nehmen den Bus, denn das Wetter ist schlecht.', accept: ['Wir nehmen den Bus, denn das Wetter ist schlecht.'], threshold: 75,
            explanation: 'Après denn, l’ordre reste celui d’une principale : das Wetter ist schlecht. Prononcez le « sch » de schlecht comme « ch » en français.' },
          { id: 'q3', type: 'speak', prompt: 'Écoutez, puis répétez : un problème et sa conséquence.',
            text: 'Der Aufzug ist kaputt. Deshalb nehmen wir die Treppe.', accept: ['Der Aufzug ist kaputt. Deshalb nehmen wir die Treppe.'], threshold: 75,
            explanation: 'Deshalb est suivi directement du verbe nehmen. Accentuez la première syllabe : DES-halb, et faites une pause au point.' },
          { id: 'q4', type: 'speak', prompt: 'Écoutez, puis répétez : une action maintenue malgré la pluie.',
            text: 'Es regnet stark. Trotzdem findet das Fest statt.', accept: ['Es regnet stark. Trotzdem findet das Fest statt.'], threshold: 75,
            explanation: 'Trotzdem, accentué sur la première syllabe, ouvre la phrase et le verbe findet suit. La particule statt, bien audible, termine la phrase.' },
          { id: 'q5', type: 'speak', prompt: 'Écoutez, puis répétez : confirmer l’heure prévue.',
            text: 'Wir beginnen wie geplant um fünfzehn Uhr.', accept: ['Wir beginnen wie geplant um fünfzehn Uhr.', 'Wir beginnen wie geplant um 15 Uhr.'], threshold: 75,
            explanation: 'Wie geplant signifie « comme prévu ». Dans fünfzehn, le ü se prononce lèvres arrondies, comme le « u » français.' },
        ],
      },
    },
  ],
};
