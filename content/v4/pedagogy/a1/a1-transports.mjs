// Couche pédagogique V4 · A1 · Prendre le bon bus ou le bon train.
const REPEAT = 'Écoutez le modèle, puis dites la phrase à voix haute.';
const speak = (id, text, explanation, accept = [text]) => ({ id, type: 'speak', prompt: REPEAT, text, accept, explanation });
const DICTATION = 'Écoutez et écrivez la phrase.';

export default {
  module: 'a1-transports',
  grammarFocus: ['verbes-separables-trajet'],
  vocabulary: [
    { id: 'bus', word: 'Bus', article: 'der', plural: 'Busse', partOfSpeech: 'noun', translation: 'le bus', example: 'Fährt dieser Bus zum Rathaus?', note: null },
    { id: 'zug', word: 'Zug', article: 'der', plural: 'Züge', partOfSpeech: 'noun', translation: 'le train', example: 'Wann fährt der nächste Zug?', note: null },
    { id: 'strassenbahn', word: 'Straßenbahn', article: 'die', plural: 'Straßenbahnen', partOfSpeech: 'noun', translation: 'le tramway', example: 'Ich fahre mit der Straßenbahn zum Bahnhof.', note: null },
    { id: 'fahrkarte', word: 'Fahrkarte', article: 'die', plural: 'Fahrkarten', partOfSpeech: 'noun', translation: 'le billet (de transport)', example: 'Eine Fahrkarte nach Bonn, bitte.', note: null },
    { id: 'gleis', word: 'Gleis', article: 'das', plural: 'Gleise', partOfSpeech: 'noun', translation: 'la voie (à la gare)', example: 'Der Zug fährt von Gleis vier ab.', note: null },
    { id: 'abfahrt', word: 'Abfahrt', article: 'die', plural: 'Abfahrten', partOfSpeech: 'noun', translation: 'le départ', example: 'Abfahrt: zehn Uhr fünf.', note: null },
    { id: 'ankunft', word: 'Ankunft', article: 'die', plural: 'Ankünfte', partOfSpeech: 'noun', translation: 'l’arrivée', example: 'Die Ankunft in Bonn ist um zehn Uhr vierzig.', note: null },
    { id: 'linie', word: 'Linie', article: 'die', plural: 'Linien', partOfSpeech: 'noun', translation: 'la ligne (de bus, de tram)', example: 'Nehmen Sie die Linie zwei.', note: null },
    { id: 'richtung', word: 'Richtung', article: 'die', plural: 'Richtungen', partOfSpeech: 'noun', translation: 'la direction', example: 'Nehmen Sie den Bus Richtung Bahnhof.', note: null },
    { id: 'einsteigen', word: 'einsteigen', article: null, plural: null, partOfSpeech: 'verb', translation: 'monter (dans un véhicule)', example: 'Bitte hier einsteigen.', note: 'séparable : ein|steigen — Ich steige an der Post ein.' },
    { id: 'umsteigen', word: 'umsteigen', article: null, plural: null, partOfSpeech: 'verb', translation: 'changer (de bus, de train)', example: 'Am Rathaus umsteigen.', note: 'séparable : um|steigen — Ich steige am Rathaus um.' },
    { id: 'aussteigen', word: 'aussteigen', article: null, plural: null, partOfSpeech: 'verb', translation: 'descendre (d’un véhicule)', example: 'Wo muss ich aussteigen?', note: 'séparable : aus|steigen — Ich steige am Museum aus.' },
    { id: 'abfahren', word: 'abfahren', article: null, plural: null, partOfSpeech: 'verb', translation: 'partir (véhicule, voyageur)', example: 'Ich möchte um neun Uhr abfahren.', note: 'séparable : ab|fahren — Der Zug fährt um zehn Uhr ab.' },
    { id: 'ankommen', word: 'ankommen', article: null, plural: null, partOfSpeech: 'verb', translation: 'arriver', example: 'Wann möchten Sie in Bonn ankommen?', note: 'séparable : an|kommen — Ich komme um elf Uhr an.' },
    { id: 'nach', word: 'nach', article: null, plural: null, partOfSpeech: 'preposition', translation: 'à, vers (une ville, un pays)', example: 'Ich fahre nach Bonn.', note: 'nach Bonn, mais zum Bahnhof (lieu en ville)' },
    { id: 'naechste', word: 'nächste', article: null, plural: null, partOfSpeech: 'adjective', translation: 'prochain(e)', example: 'Wann fährt der nächste Zug?', note: null },
    { id: 'wann', word: 'wann', article: null, plural: null, partOfSpeech: 'adverb', translation: 'quand', example: 'Wann fährt der Bus?', note: null },
    { id: 'nur-hin', word: 'nur hin', article: null, plural: null, partOfSpeech: 'expression', translation: 'aller simple', example: 'Eine Fahrkarte, nur hin.', note: null },
    { id: 'hin-und-zurueck', word: 'hin und zurück', article: null, plural: null, partOfSpeech: 'expression', translation: 'aller-retour', example: 'Einmal Bonn, hin und zurück, bitte.', note: null },
    { id: 'gute-fahrt', word: 'Gute Fahrt!', article: null, plural: null, partOfSpeech: 'expression', translation: 'Bon voyage !', example: 'Hier ist Ihre Fahrkarte. Gute Fahrt!', note: null },
  ],
  activities: {
    'a1-transports-guide': {
      title: 'Découvrir : lire un horaire et trouver la bonne ligne',
      estimatedMinutes: 15,
      lesson: {
        title: 'Découvrir : lire un horaire et trouver la bonne ligne',
        description: `LIRE UN HORAIRE · 15 MIN

1. Lire un panneau (4 min). Le panneau des départs affiche « 08:04 · Bus 3 · Rathaus / 08:14 · Bus 6 · Stadtpark / 08:24 · Bus 3 · Rathaus ». Il est 08:10 et vous allez à la mairie (das Rathaus). Le bus de 08:04 est déjà parti et celui de 08:14 va au Stadtpark : vous prenez le bus 3 de 08:24. Lisez les trois heures à voix haute : acht Uhr vier, acht Uhr vierzehn, acht Uhr vierundzwanzig.

2. Demander la bonne ligne (4 min). « Fährt dieser Bus zum Rathaus? » demande si le bus va à la mairie. « Ich fahre mit dem Bus » donne le moyen de transport. Comparez mit dem Bus, mit dem Zug (noms en der) et mit der Straßenbahn (nom en die). Un lieu de la ville prend zum ou zur (zum Rathaus, zum Bahnhof, zur Post) ; une ville prend nach (nach Bonn).

3. Lire l’heure et la voie (4 min). Sur un horaire, Abfahrt indique le départ, Ankunft l’arrivée et Gleis la voie. Lisez « Zug nach Bonn: Abfahrt 10:05, Ankunft 10:40, Gleis 2 ». On demande « Wann fährt der Zug ab? » et « Von welchem Gleis fährt der Zug ab? ». On répond en distinguant um zehn Uhr fünf (l’heure) et von Gleis zwei (la voie).

4. Dire son trajet (3 min). Écoutez les modèles, puis dites à voix haute : « Ich nehme den Bus drei um acht Uhr vierundzwanzig. Ich steige am Rathaus aus. » Dans abfahren et aussteigen, la particule (ab, aus) se place à la fin de la phrase.`,
      },
    },
    'a1-transports-pratique': {
      title: 'Comprendre : acheter un billet au guichet',
      estimatedMinutes: 12,
      lesson: {
        title: 'Comprendre : acheter un billet au guichet',
        description: `AU GUICHET DE LA GARE · 12 MIN

Un voyageur veut aller à Bonn. Écoutez la conversation au guichet : l’heure, la voie, le prix et le type de billet.

FORMULES UTILES
• Wohin möchten Sie fahren? — Où voulez-vous aller ?
• Nach Bonn, bitte. — À Bonn, s’il vous plaît.
• Wann fährt der nächste Zug? — Quand part le prochain train ?
• Fährt der Zug von Gleis zwei? — Le train part-il de la voie 2 ?
• Was kostet die Fahrkarte? — Combien coûte le billet ?
• Nur hin? — Un aller simple ? (aller-retour : hin und zurück)
• Gute Fahrt! — Bon voyage !

À VOUS
1. Écoutez sans lire la transcription : quel moyen de transport, quelle destination ?
2. Réécoutez pour repérer l’heure, la voie, le prix et le type de billet. Attention : le voyageur propose une voie, mais la réponse « Heute nicht » en annonce une autre.
3. Réécoutez en lisant la transcription, puis répétez les répliques du voyageur pendant une pause.
4. Dites à voix haute la demande d’un voyageur qui va à Köln : « Eine Fahrkarte nach Köln, bitte. Nur hin. Wann fährt der nächste Zug? », puis faites répéter le prix avec « Wie bitte? ».`,
      },
    },
    'a1-transports-approfondir': {
      title: 'Comprendre : un trajet avec une correspondance',
      estimatedMinutes: 12,
      lesson: {
        title: 'Comprendre : un trajet avec une correspondance',
        description: `EINSTEIGEN, UMSTEIGEN, AUSSTEIGEN · 12 MIN

TROIS VERBES SÉPARABLES
• einsteigen — monter (dans le bus, le train)
• umsteigen — changer (de bus, de train)
• aussteigen — descendre
Au présent, la particule (ein, um, aus) se détache et se place à la fin de la phrase : Ich steige am Rathaus aus. Le verbe conjugué (steige) reste en deuxième position.
Si le lieu vient en tête, le sujet passe juste après le verbe : Am Rathaus steige ich aus. La particule reste à la fin.
Sur une affiche ou dans une consigne à l’infinitif, les deux parties restent collées : Am Rathaus aussteigen.

1. Suivre une consigne (4 min). Au point de départ, une affiche dit « Bus 4 Richtung Bahnhof. Am Rathaus aussteigen. Dort in die Straßenbahn 2 Richtung Museum einsteigen. ». Repérez la ligne de départ, l’arrêt de correspondance et la direction finale. Le trajet se fait dans cet ordre : Bus 4 nehmen, am Rathaus aussteigen, Straßenbahn 2 nehmen.

2. Voir où va le verbe (4 min). Lisez à voix haute les deux versions de chaque phrase : « Ich steige am Bahnhof ein. / Am Bahnhof steige ich ein. » — « Ich steige am Rathaus um. / Am Rathaus steige ich um. »

3. Choisir un trajet (4 min). Vous partez de la poste pour le musée et vous voulez arriver avant 09:30. Le tableau propose « Bus 4, 09:05, am Rathaus umsteigen, Museum 09:27 » et « Bus 7, 09:12, direkt, Museum 09:35 ». Seul le bus 4 arrive à temps, avec une correspondance. Dites les trois étapes à voix haute : « An der Post nehme ich den Bus 4. Am Rathaus steige ich um. Am Museum steige ich aus. » Si l’on préfère un trajet direct et qu’on peut arriver plus tard, on prend le bus 7.`,
      },
    },
    'a1-transports-controle': {
      title: 'Vérifier : au guichet de la gare',
      estimatedMinutes: 10,
      lesson: {
        title: 'Vérifier : au guichet de la gare',
        description: 'Écoutez la scène une première fois pour la situation générale. Lisez les questions, puis réécoutez pour les détails. Les deux dernières questions demandent de réemployer les formules du module. La transcription s’affiche après votre réponse.',
      },
      explanations: {
        q1: 'À la question « Wohin möchten Sie fahren? », le voyageur répond « Nach Bonn, bitte ». Nach introduit la ville de destination ; Berlin et Bremen ne sont pas cités.',
        q2: 'La guichetière dit « Um zehn Uhr fünfzehn ». 10 h 05 est l’heure de l’horaire lu dans la leçon. Fünfzehn (15) et fünfzig (50) se ressemblent : écoutez la fin -zehn.',
        q3: 'Le voyageur propose « Gleis zwei », mais on lui répond « Heute nicht. Er fährt heute von Gleis vier ab. » Il confirme : « Gut, Gleis vier. »',
        q4: '« Acht Euro fünfzig » : on dit les euros, puis les centimes, sans « und ». 8,15 € se dirait acht Euro fünfzehn.',
        q5: '« Nur hin? – Ja, nur hin. Eine Fahrkarte, bitte. » Nur hin désigne un aller simple, pour une seule personne ; un aller-retour se dit hin und zurück.',
        q6: 'Umsteigen veut dire changer de véhicule : Ich steige am Rathaus um. Einsteigen signifie monter, et « Ich fahre zum Rathaus » donne seulement la destination.',
        q7: 'On part d’une voie : von Gleis vier. Um introduit l’heure (um zehn Uhr) et nach une ville de destination (nach Bonn).',
      },
    },
    'a1-transports-mission': {
      kind: 'mission',
      title: 'Mission : organiser un trajet en train et en ville',
      estimatedMinutes: 20,
      competences: ['expression-orale', 'expression-ecrite'],
      lesson: {
        title: 'Mission : organiser un trajet en train et en ville',
        description: `SITUATION
Vous allez à Bonn chez une amie, Lara. À la gare, vous achetez votre billet au guichet. Le tableau indique :
Zug nach Bonn · Abfahrt 14:20 · Gleis 3 · Ankunft 15:05 · Fahrkarte 9,80 €
Mais une annonce précise : le train part aujourd’hui de la voie 6.
À Bonn, Lara habite près du musée : il faut prendre le bus 4, changer à l’hôtel de ville (Rathaus) pour la Straßenbahn 2, puis descendre au Museum.

MODÈLE (un autre trajet)
Au guichet : Guten Tag! Eine Fahrkarte nach Köln, bitte. Nur hin. Wann fährt der nächste Zug? Fährt er von Gleis eins? – Wie bitte? Was kostet die Fahrkarte?
Le message : Hallo Tom! Mein Zug fährt um neun Uhr ab, heute von Gleis fünf. Ich komme um zehn Uhr an. Am Bahnhof nehme ich den Bus 3. Am Markt steige ich um, und an der Uni steige ich aus. Bis gleich!`,
      },
      mission: {
        oral: {
          prompt: 'Enregistrez votre passage au guichet, en jouant seulement le voyageur : saluez, demandez un aller simple pour Bonn, demandez l’heure du prochain train et vérifiez la voie (Fährt der Zug von Gleis drei?), puis faites répéter le prix avec « Wie bitte? ».',
          maxSeconds: 60,
        },
        written: {
          prompt: 'Écrivez un message à Lara : l’heure de départ, la voie d’aujourd’hui, l’heure d’arrivée, puis votre trajet en ville avec umsteigen et aussteigen (Am Rathaus steige ich um …).',
          maxChars: 600,
          minWords: 30,
        },
        checklist: [
          'J’ai demandé un aller simple avec « Eine Fahrkarte nach Bonn, bitte. Nur hin. ».',
          'J’ai demandé l’heure avec wann et vérifié la voie avec von Gleis ….',
          'Mon message donne la voie d’aujourd’hui (6), pas celle du tableau (3).',
          'La particule est à la fin : Der Zug fährt … ab, ich komme … an, ich steige … um, ich steige … aus.',
          'Quand je commence par le lieu ou l’heure, le verbe vient avant ich (Am Rathaus steige ich um.).',
        ],
      },
    },
  },
  add: [
    {
      after: 'a1-transports-approfondir',
      activity: {
        id: 'a1-transports-entrainer',
        kind: 'exercise',
        title: 'S’entraîner : einsteigen, umsteigen, aussteigen',
        estimatedMinutes: 12,
        competences: ['lecture', 'expression-ecrite', 'ecoute'],
        lesson: {
          title: 'S’entraîner : einsteigen, umsteigen, aussteigen',
          description: `Remettez les phrases dans l’ordre, complétez-les, puis écrivez deux phrases dictées.
Rappel : au présent, le verbe conjugué est en deuxième position et la particule (ein, um, aus, ab, an) se place à la fin : Ich steige am Rathaus um. Si la phrase commence par un lieu ou une heure, le sujet vient juste après le verbe : Am Rathaus steige ich um.`,
          transcript: null,
        },
        placements: [],
        questions: [
          {
            id: 'q1', type: 'order', prompt: 'Remettez les mots dans l’ordre, en commençant par le lieu.',
            answers: [['Am Rathaus', 'steige', 'ich', 'um.']],
            explanation: 'Le lieu am Rathaus occupe la 1re place, le verbe steige la 2e : le sujet ich passe donc après le verbe. La particule um de umsteigen termine la phrase.',
          },
          {
            id: 'q2', type: 'order', prompt: 'Remettez les mots dans l’ordre, en commençant par l’heure.',
            answers: [['Um acht Uhr', 'steige', 'ich', 'an der Post', 'ein.']],
            explanation: 'Um acht Uhr en tête, puis le verbe steige et le sujet ich (inversion). Le lieu vient ensuite et la particule ein de einsteigen ferme la phrase.',
          },
          {
            id: 'q3', type: 'fill', prompt: 'Le trajet de la poste au musée : complétez avec ein, um ou aus.',
            text: 'An der Post steige ich in den Bus Nummer 4 [[1]]. Am Rathaus steige ich [[2]]. Am Museum steige ich [[3]].',
            blanks: [
              { id: '1', accept: ['ein'], size: 4, hint: null },
              { id: '2', accept: ['um'], size: 4, hint: null },
              { id: '3', accept: ['aus'], size: 4, hint: null },
            ],
            explanation: 'Au départ, on monte (einsteigen) ; à la correspondance, on change (umsteigen) ; à l’arrivée, on descend (aussteigen). Au présent, la particule se place toujours à la fin.',
          },
          {
            id: 'q4', type: 'fill', prompt: 'Demandez où descendre : complétez avec le verbe aussteigen.',
            text: 'Wo [[1]] ich [[2]]? – Am Museum.',
            blanks: [
              { id: '1', accept: ['steige'], size: 8, hint: 'aussteigen' },
              { id: '2', accept: ['aus'], size: 4, hint: null },
            ],
            explanation: 'Dans une question avec wo, le verbe conjugué vient en 2e position (steige) et la particule aus termine la question : Wo steige ich aus? On ne garde pas aussteige d’un bloc.',
          },
          {
            id: 'q5', type: 'fill', prompt: 'Votre ami a inversé les deux arrêts. Corrigez son message pour le trajet bus 4, puis tram 2 jusqu’au musée.',
            text: 'Ich steige am [[1]] um und steige am [[2]] aus.',
            blanks: [
              { id: '1', accept: ['Rathaus'], size: 8, hint: null },
              { id: '2', accept: ['Museum'], size: 8, hint: null },
            ],
            explanation: 'On change de véhicule (umsteigen) à la correspondance, au Rathaus ; on descend (aussteigen) au bout du trajet, au Museum. L’ami avait écrit les deux arrêts à l’envers.',
          },
          {
            id: 'q6', type: 'fill', prompt: 'Complétez avec nach, von ou zum.',
            text: 'Ich fahre [[1]] Bonn. Der Zug fährt [[2]] Gleis vier ab. In Bonn nehme ich den Bus [[3]] Rathaus.',
            blanks: [
              { id: '1', accept: ['nach'], size: 5, hint: null },
              { id: '2', accept: ['von'], size: 5, hint: null },
              { id: '3', accept: ['zum', 'zu dem'], size: 6, hint: null },
            ],
            explanation: 'Nach introduit une ville (nach Bonn), von la voie de départ (von Gleis vier) et zum un lieu de la ville en der ou das (zum Rathaus). Um ne sert que pour l’heure.',
          },
          {
            id: 'q7', type: 'match', prompt: 'Associez chaque verbe à son sens.',
            pairs: [
              { left: 'einsteigen', right: 'monter' },
              { left: 'umsteigen', right: 'changer de véhicule' },
              { left: 'aussteigen', right: 'descendre' },
              { left: 'abfahren', right: 'partir' },
              { left: 'ankommen', right: 'arriver' },
            ],
            explanation: 'Les cinq verbes sont séparables : ein-, um-, aus-, ab- et an- se placent à la fin au présent (Der Zug fährt um zehn Uhr ab. Ich komme um elf Uhr an.).',
          },
          {
            id: 'q8', type: 'dictation', prompt: DICTATION, voice: 'mann',
            accept: ['Am Rathaus steigen Sie in die Straßenbahn um.'],
            explanation: 'Am Rathaus en tête, puis le verbe et le sujet (steigen Sie) ; la particule um termine la phrase. Straßenbahn s’écrit en un seul mot, avec ß.',
          },
          {
            id: 'q9', type: 'dictation', prompt: DICTATION, voice: 'frau',
            accept: ['Der Zug fährt um zehn Uhr von Gleis vier ab.'],
            explanation: 'Um annonce l’heure et von Gleis la voie ; la particule ab de abfahren termine la phrase. Er fährt prend un tréma. Les nombres peuvent s’écrire en chiffres.',
          },
        ],
      },
    },
    {
      after: 'a1-transports-entrainer',
      activity: {
        id: 'a1-transports-repeter',
        kind: 'exercise',
        title: 'Répéter à voix haute : au guichet et dans le bus',
        estimatedMinutes: 8,
        competences: ['expression-orale'],
        lesson: {
          title: 'Répéter à voix haute : au guichet et dans le bus',
          description: 'Écoutez chaque modèle autant de fois que nécessaire, puis dites la phrase sans vous presser. Faites bien entendre la particule à la fin des phrases (ab, um, aus).',
          transcript: null,
        },
        placements: [],
        questions: [
          speak('q1', 'Fährt dieser Bus zum Rathaus?', 'Question fermée : le verbe fährt ouvre la phrase et la voix monte à la fin. Le ä de fährt se prononce comme un è long.'),
          speak('q2', 'Eine Fahrkarte nach Bonn, bitte.', 'Le ch de nach se forme au fond de la gorge, comme après a dans Nacht. Fahrkarte est accentué sur la première syllabe : FAHR-karte.'),
          speak('q3', 'Wann fährt der nächste Zug?', 'Dans nächste, ch est le souffle doux de ich. Zug commence par [ts]. La voix descend à la fin de la question en W.'),
          speak('q4', 'Am Rathaus steige ich um.', 'Le lieu en tête entraîne l’inversion steige ich. Dans steige, st se dit « cht » ; la particule um termine la phrase.'),
          speak('q5', 'Ich steige am Museum aus.', 'Museum se dit en trois syllabes, mu-SE-um. La particule aus, à la fin, porte le sens : descendre.'),
          speak('q6', 'Der Zug fährt von Gleis vier ab.', 'Von Gleis vier donne la voie. Le v de von et de vier se prononce f ; ab, à la fin, complète le verbe abfahren.', ['Der Zug fährt von Gleis vier ab.', 'Der Zug fährt von Gleis 4 ab.']),
        ],
      },
    },
  ],
  order: [
    'a1-transports-guide', 'a1-transports-pratique', 'a1-transports-approfondir', 'a1-transports-entrainer',
    'a1-transports-repeter', 'a1-transports-controle', 'a1-transports-mission',
  ],
};
