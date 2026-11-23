// Couche pédagogique V4 · A1 · Wohnung und Stadt : logement et ville.
const REPEAT = 'Écoutez le modèle, puis dites la phrase à voix haute.';
const speak = (id, text, explanation, accept = [text]) => ({ id, type: 'speak', prompt: REPEAT, text, accept, explanation });
const DICTATION = 'Écoutez et écrivez la phrase.';

export default {
  module: 'a1-stadt',
  // Scripts alignés sur les dialogues affichés.
  media: [
    {
      key: "a1-stadt-dialog-audio-v3", kind: "audio", title: "Dialogue : la visite de l’appartement", credit: "LinguaCap, synthèse Piper avec Thorsten Müller (CC0) et Kerstin, préentraînée sur la voix de Cori Samuel (Hi-Fi TTS, CC BY 4.0)", license: "Jeux de données des voix : CC0 et CC BY 4.0",
      script: [
        { voice: "frau", name: "Frau Krüger", text: "Guten Tag, Herr Benali! Kommen Sie bitte herein." },
        { pause: 0.6 },
        { voice: "mann", name: "Samir", text: "Guten Tag, Frau Krüger! Oh, der Flur ist sehr hell." },
        { pause: 0.6 },
        { voice: "frau", name: "Frau Krüger", text: "Ja, die Wohnung hat viele Fenster. Hier links ist das Wohnzimmer." },
        { pause: 0.6 },
        { voice: "mann", name: "Samir", text: "Das Wohnzimmer ist wirklich groß! Gibt es auch einen Balkon?" },
        { pause: 0.6 },
        { voice: "frau", name: "Frau Krüger", text: "Ja, es gibt einen Balkon. Er ist klein, aber sehr ruhig." },
        { pause: 0.6 },
        { voice: "mann", name: "Samir", text: "Sehr schön. Und wo ist die Küche?" },
        { pause: 0.6 },
        { voice: "frau", name: "Frau Krüger", text: "Hier rechts. Die Küche ist neu. Es gibt einen Herd, einen Kühlschrank, einen Tisch und zwei Stühle." },
        { pause: 0.6 },
        { voice: "mann", name: "Samir", text: "Gibt es auch eine Waschmaschine?" },
        { pause: 0.6 },
        { voice: "frau", name: "Frau Krüger", text: "Nein, leider gibt es keine Waschmaschine." },
        { pause: 0.6 },
        { voice: "mann", name: "Samir", text: "Schade. Und wo ist das Schlafzimmer?" },
        { pause: 0.6 },
        { voice: "frau", name: "Frau Krüger", text: "Hier, neben dem Bad. Es ist nicht sehr groß, aber es gibt einen Kleiderschrank." },
        { pause: 0.6 },
        { voice: "mann", name: "Samir", text: "Und was kostet die Wohnung?" },
        { pause: 0.6 },
        { voice: "frau", name: "Frau Krüger", text: "Siebenhundertzwanzig Euro warm." },
        { pause: 0.6 },
        { voice: "mann", name: "Samir", text: "Das ist nicht billig, aber die Wohnung ist wirklich schön. Wie komme ich von hier ins Zentrum?" },
        { pause: 0.6 },
        { voice: "frau", name: "Frau Krüger", text: "Die Bushaltestelle ist direkt gegenüber. Mit dem Bus sind Sie in zehn Minuten im Zentrum." },
        { pause: 0.6 },
        { voice: "mann", name: "Samir", text: "Super! Die Wohnung ist perfekt für mich." },
      ],
    },
    {
      key: "a1-stadt-weg-dialog-audio-v3", kind: "audio", title: "Dialogue : demander le chemin du musée", credit: "LinguaCap, synthèse Piper avec Thorsten Müller (CC0) et Kerstin, préentraînée sur la voix de Cori Samuel (Hi-Fi TTS, CC BY 4.0)", license: "Jeux de données des voix : CC0 et CC BY 4.0",
      script: [
        { voice: "frau", name: "Emma", text: "Entschuldigung! Wie komme ich zum Museum?" },
        { pause: 0.6 },
        { voice: "mann", name: "Herr Wolf", text: "Zum Museum? Das ist nicht weit. Gehen Sie hier geradeaus bis zur Ampel." },
        { pause: 0.6 },
        { voice: "frau", name: "Emma", text: "Bis zur Ampel. Und dann?" },
        { pause: 0.6 },
        { voice: "mann", name: "Herr Wolf", text: "Dann nehmen Sie die erste Straße rechts. Das Museum ist gegenüber der Post." },
        { pause: 0.6 },
        { voice: "frau", name: "Emma", text: "Gibt es da auch eine Apotheke?" },
        { pause: 0.6 },
        { voice: "mann", name: "Herr Wolf", text: "Ja, die Apotheke ist neben der Post." },
        { pause: 0.6 },
        { voice: "frau", name: "Emma", text: "Super! Und wie komme ich dann zum Bahnhof?" },
        { pause: 0.6 },
        { voice: "mann", name: "Herr Wolf", text: "Fahren Sie mit der U-Bahn, Linie zwei. Die U-Bahn-Station ist neben dem Museum." },
        { pause: 0.6 },
        { voice: "frau", name: "Emma", text: "Vielen Dank!" },
        { pause: 0.6 },
        { voice: "mann", name: "Herr Wolf", text: "Bitte schön! Einen schönen Tag noch!" },
      ],
    },
  ],
  grammarFocus: ['es-gibt-kein-accusatif', 'imperatif-sie'],
  vocabulary: [
    { id: 'wohnung', word: 'Wohnung', article: 'die', plural: 'Wohnungen', partOfSpeech: 'noun', translation: 'l’appartement, le logement', example: 'Die Wohnung ist hell und ruhig.', note: null },
    { id: 'zimmer', word: 'Zimmer', article: 'das', plural: 'Zimmer', partOfSpeech: 'noun', translation: 'la pièce ; la chambre', example: 'Die Wohnung hat zwei Zimmer.', note: null },
    { id: 'kueche', word: 'Küche', article: 'die', plural: 'Küchen', partOfSpeech: 'noun', translation: 'la cuisine', example: 'Die Küche ist klein, aber neu.', note: null },
    { id: 'bad', word: 'Bad', article: 'das', plural: 'Bäder', partOfSpeech: 'noun', translation: 'la salle de bains', example: 'Das Bad ist neben dem Schlafzimmer.', note: 'aussi : das Badezimmer' },
    { id: 'balkon', word: 'Balkon', article: 'der', plural: 'Balkone', partOfSpeech: 'noun', translation: 'le balcon', example: 'Gibt es einen Balkon?', note: null },
    { id: 'bett', word: 'Bett', article: 'das', plural: 'Betten', partOfSpeech: 'noun', translation: 'le lit', example: 'Ich brauche ein Bett und einen Tisch.', note: null },
    { id: 'miete', word: 'Miete', article: 'die', plural: 'Mieten', partOfSpeech: 'noun', translation: 'le loyer', example: 'Die Miete ist 560 Euro warm.', note: 'warm : charges comprises' },
    { id: 'es-gibt', word: 'es gibt', article: null, plural: null, partOfSpeech: 'expression', translation: 'il y a', example: 'Es gibt keinen Balkon.', note: '+ accusatif : es gibt einen Balkon, eine Küche, ein Bad' },
    { id: 'hell', word: 'hell', article: null, plural: null, partOfSpeech: 'adjective', translation: 'clair, lumineux', example: 'Das Wohnzimmer ist groß und hell.', note: 'contraire : dunkel' },
    { id: 'dunkel', word: 'dunkel', article: null, plural: null, partOfSpeech: 'adjective', translation: 'sombre', example: 'Das Schlafzimmer ist ein bisschen dunkel.', note: null },
    { id: 'ruhig', word: 'ruhig', article: null, plural: null, partOfSpeech: 'adjective', translation: 'calme', example: 'Der Balkon ist klein, aber sehr ruhig.', note: 'contraire : laut (bruyant)' },
    { id: 'teuer', word: 'teuer', article: null, plural: null, partOfSpeech: 'adjective', translation: 'cher', example: 'Ein Hotel ist zu teuer für uns.', note: null },
    { id: 'billig', word: 'billig', article: null, plural: null, partOfSpeech: 'adjective', translation: 'bon marché', example: 'Neunzehn Euro, das ist billig.', note: 'dans les annonces : günstig' },
    { id: 'bahnhof', word: 'Bahnhof', article: 'der', plural: 'Bahnhöfe', partOfSpeech: 'noun', translation: 'la gare', example: 'Wie komme ich zum Bahnhof?', note: null },
    { id: 'apotheke', word: 'Apotheke', article: 'die', plural: 'Apotheken', partOfSpeech: 'noun', translation: 'la pharmacie', example: 'Die Apotheke ist neben der Post.', note: null },
    { id: 'supermarkt', word: 'Supermarkt', article: 'der', plural: 'Supermärkte', partOfSpeech: 'noun', translation: 'le supermarché', example: 'Neben dem Haus gibt es einen Supermarkt.', note: null },
    { id: 'haltestelle', word: 'Haltestelle', article: 'die', plural: 'Haltestellen', partOfSpeech: 'noun', translation: 'l’arrêt (de bus, de tram)', example: 'Die Haltestelle ist direkt gegenüber.', note: null },
    { id: 'ampel', word: 'Ampel', article: 'die', plural: 'Ampeln', partOfSpeech: 'noun', translation: 'le feu (de circulation)', example: 'Gehen Sie bis zur Ampel.', note: null },
    { id: 'strasse', word: 'Straße', article: 'die', plural: 'Straßen', partOfSpeech: 'noun', translation: 'la rue', example: 'Nehmen Sie die erste Straße rechts.', note: null },
    { id: 'geradeaus', word: 'geradeaus', article: null, plural: null, partOfSpeech: 'adverb', translation: 'tout droit', example: 'Gehen Sie hier geradeaus.', note: null },
    { id: 'links', word: 'links', article: null, plural: null, partOfSpeech: 'adverb', translation: 'à gauche', example: 'Nehmen Sie die zweite Straße links.', note: null },
    { id: 'rechts', word: 'rechts', article: null, plural: null, partOfSpeech: 'adverb', translation: 'à droite', example: 'Die Küche ist hier rechts.', note: null },
    { id: 'gegenueber', word: 'gegenüber', article: null, plural: null, partOfSpeech: 'preposition', translation: 'en face (de)', example: 'Das Museum ist gegenüber der Post.', note: 'formule à retenir : gegenüber dem Bahnhof, gegenüber der Bank' },
    { id: 'fahren', word: 'fahren', article: null, plural: null, partOfSpeech: 'verb', translation: 'aller (en véhicule), rouler', example: 'Fahren Sie mit der U-Bahn!', note: 'ich fahre, du fährst ; fahren mit + moyen de transport' },
    { id: 'zu-fuss', word: 'zu Fuß', article: null, plural: null, partOfSpeech: 'expression', translation: 'à pied', example: 'Ich gehe zu Fuß zur Arbeit.', note: null },
  ],
  activities: {
    'a1-stadt-wortschatz': {
      title: 'Découvrir : les pièces, les meubles et les adjectifs',
      estimatedMinutes: 12,
      lesson: { title: 'Découvrir : les pièces, les meubles et les adjectifs' },
    },
    'a1-stadt-dialog': {
      title: 'Comprendre : la visite d’un appartement',
      estimatedMinutes: 12,
      lesson: { title: 'Comprendre : la visite d’un appartement' },
    },
    'a1-stadt-lesen': {
      explanations: {
        q1: 'Lena paie 400 € au plus et ne veut pas vivre seule : la WG de l’annonce B (« Zimmer in netter WG », 390 Euro warm) lui convient. A coûte 560 €, D 650 € et C 1.450 €, pour vivre seul ou en famille.',
        q2: 'Annonce A : « Zum Bahnhof sind es nur fünf Minuten zu Fuß. » Zu Fuß veut dire « à pied ». Les 20 minutes de l’annonce C concernent la S-Bahn jusqu’au centre.',
        q3: 'L’annonce D écrit « Leider gibt es keinen Balkon, und das Schlafzimmer ist ein bisschen dunkel ». Leider (malheureusement) annonce les défauts ; le bus et le métro sont au contraire « direkt gegenüber ».',
        q4: 'Les colocataires écrivent « Wir haben keinen Fernseher » : keinen veut dire « pas de » devant un nom masculin. Le balcon, la cuisine et la salle de bains sont bien mentionnés.',
        q5: 'Annonce C : « Mit der S-Bahn sind Sie in 20 Minuten im Zentrum. » Les cinq minutes à pied sont celles de l’annonce A, le bus et la U-Bahn ceux de l’annonce D.',
      },
    },
    'a1-stadt-weg': {
      title: 'Découvrir : les lieux, les transports et le chemin',
      estimatedMinutes: 15,
      lesson: { title: 'Découvrir : les lieux, les transports et le chemin' },
    },
    'a1-stadt-natif-weg': { estimatedMinutes: 10 },
    // La leçon de prononciation est fusionnée dans la répétition validée (a1-stadt-repeter), qui reprend ses règles et
    // deux de ses enregistrements natifs ; kn, ps et pn (Pneumonie, Psychologe…) ne relèvent pas du lexique A1.
    'a1-stadt-aussprache': null,
    'a1-stadt-hoeren': {
      estimatedMinutes: 12,
      lesson: {
        description: 'Écoutez les trois petites scènes (vous pouvez réécouter autant de fois que nécessaire), puis répondez aux questions. Scène 1 : un touriste cherche une pharmacie. Scène 2 : deux collègues parlent de leur trajet jusqu’au travail. Scène 3 : Mia téléphone à son ami Ben. Les deux dernières questions sont des dictées : écoutez chaque phrase et écrivez-la. La transcription s’affichera après votre réponse.',
      },
      explanations: {
        q1: 'La passante dit « Gehen Sie hier geradeaus und nehmen Sie dann die zweite Straße links », et le touriste répète « Die zweite Straße links ». Links veut dire à gauche, rechts à droite.',
        q2: '« Sie ist neben dem Supermarkt, gegenüber der Bank » : neben veut dire « à côté de » et gegenüber « en face de ». La pharmacie est donc à côté du supermarché, en face de la banque.',
        q3: 'Jana dit « Im Winter fahre ich mit der U-Bahn. Aber im Sommer fahre ich mit dem Fahrrad. » Le métro, c’est l’hiver ; elle n’a pas de voiture (kein Auto) et c’est Lukas qui va à pied.',
        q4: 'Mia dit « Aber es gibt leider keinen Balkon ». Elle cite au contraire deux pièces, une cuisine, une salle de bains et un salon grand et clair.',
        q5: 'Mia répond « In der Gartenstraße, gegenüber dem Museum ». Gegenüber veut dire « en face de » ; neben (à côté de) ne correspond pas à ce qu’elle dit.',
      },
      addQuestions: [
        {
          id: 'q6', type: 'dictation', prompt: DICTATION, voice: 'frau',
          accept: ['Gehen Sie geradeaus und nehmen Sie die zweite Straße links.'],
          explanation: 'Deux consignes à l’impératif poli : chaque verbe vient en tête, suivi de Sie. Straße s’écrit avec ß et une majuscule, comme tous les noms.',
        },
        {
          id: 'q7', type: 'dictation', prompt: DICTATION, voice: 'mann',
          accept: ['Leider gibt es keinen Balkon.'],
          explanation: 'Der Balkon est masculin : après es gibt, kein devient keinen. Leider (malheureusement) est en tête, donc le verbe gibt vient avant es.',
        },
      ],
    },
    'a1-stadt-fotos': {
      estimatedMinutes: 8,
      explanations: {
        q1: 'La photo montre un feu pour piétons, avec le petit bonhomme vert et le rouge : c’est die Ampel. Die Haltestelle est l’arrêt de bus et der Stadtplan le plan de la ville.',
        q2: 'Le véhicule roule sur des rails au milieu de la zone piétonne : c’est un tramway, die Straßenbahn. Une U-Bahn (métro) circule surtout sous terre et un bus n’a pas de rails.',
        q3: 'Des trains arrêtés le long d’un quai, sous les caténaires : on est à la gare, am Bahnhof. Sur la place du marché, il n’y a ni rails ni quais.',
        q4: 'On reconnaît l’hôtel de ville (das Rathaus), une pharmacie (die Marien-Apotheke) et un étal (der Marktstand). La photo ne montre ni gare, ni tramway, ni port.',
        q5: 'Anna habite près du parc et le dessin la montre en train de marcher : elle y va zu Fuß, à pied. Avec un véhicule, on dirait mit dem Bus ou mit dem Fahrrad.',
      },
    },
    'a1-stadt-paderborn-lesen': {
      estimatedMinutes: 12,
      explanations: {
        q1: 'Yanis écrit « Ich studiere ein Jahr in Paderborn » : il y étudie pendant un an. Il ne parle ni de vacances, ni de travail, ni de sa famille.',
        q2: 'Yanis explique : « In Deutschland sind Wohnungen oft leer! Es gibt keine Möbel, keine Lampen und manchmal sogar keine Küche. » Lors d’un déménagement, les gens emportent tout.',
        q3: '« Meine Nachbarin, Frau Schulte, hat zwei Stühle für mich. » Le lit, la table et l’armoire sont ce dont Yanis a encore besoin (« Ich brauche also … »).',
        q4: 'Yanis précise : « Sie sind aus der Zeit nach dem Krieg, nach 1945. » Les maisons ont l’air anciennes, mais elles ont été reconstruites après la guerre.',
        q5: '« Die Pader ist nur etwa vier Kilometer lang. Sie ist der kürzeste Fluss in Deutschland! » Der Fluss veut dire « la rivière ».',
        q6: '« Damit fahre ich in der Region mit dem Bus und mit dem Regionalzug […]. Ich kaufe also keine Fahrkarte. » Le ticket vaut dans la région, pas partout en Allemagne.',
      },
    },
    'a1-stadt-hamburg-hoeren': {
      explanations: {
        q1: 'Le train est rapide mais coûte 59 € ; le Fernbus coûte 19 € et dure cinq heures. Lea conclut : « Aber neunzehn Euro, das ist billig. Okay, wir fahren mit dem Bus! »',
        q2: 'L’hôtel coûte 90 € la nuit : trop cher. Yanis trouve une auberge de jeunesse « direkt am Hafen. Ein Bett kostet fünfunddreißig Euro, mit Frühstück ».',
        q3: 'Yanis énumère : « mit der U-Bahn, mit der S-Bahn, mit dem Bus und sogar mit der Fähre! » Die Fähre est le bateau qui traverse le port.',
        q4: 'Lea dit « Ich möchte die Elbphilharmonie sehen. Und am Sonntag gehen wir auf den Fischmarkt. » C’est Yanis qui veut voir le Miniatur Wunderland.',
        q5: 'Lea réagit : « Eine Modelleisenbahn? Das ist doch für Kinder! » C’est le marché aux poissons qui commence très tôt, pas le Miniatur Wunderland.',
        q6: 'À la fin, Lea décide : « Dann gehen wir am Samstag ins Miniatur Wunderland und am Sonntag auf den Fischmarkt. » La première réponse inverse les deux jours.',
      },
    },
    'a1-stadt-grammatik': {
      title: 'S’entraîner : es gibt, kein et l’impératif poli',
      estimatedMinutes: 12,
      lesson: {
        title: 'S’entraîner : es gibt, kein et l’impératif poli',
        description: `Choisissez ou écrivez la forme qui complète chaque phrase, puis remettez une indication dans l’ordre.

RAPPELS
• Après « es gibt » et « haben », seul le masculin change : einen, keinen (Es gibt keinen Balkon). Pour les noms en die et das : eine / keine, ein / kein.
• Impératif poli : le verbe à la forme de l’infinitif en tête, puis Sie (Gehen Sie geradeaus!).
• Formules : zum et mit dem pour les noms en der et das ; zur et mit der pour les noms en die.`,
      },
      explanations: {
        q1: 'Das Sofa est neutre : après es gibt, ein ne change pas (es gibt ein Sofa). Seul le masculin prend -en : es gibt einen Tisch.',
        q2: 'Der Balkon est masculin : après es gibt, il est à l’accusatif, donc keinen Balkon. Pour dire « pas de » devant un nom, on emploie kein, jamais nicht.',
        q3: 'Die Apotheke est féminin : on dit zur Apotheke (zu + der). Zum va avec les noms en der et das (zum Bahnhof) ; nach sert pour les villes et les pays.',
        q4: 'À l’impératif poli, le verbe garde la forme de l’infinitif et se place en tête, suivi de Sie : Gehen Sie geradeaus. Gehst va avec du, geht avec er ou ihr, gehe avec ich.',
        q5: 'Die U-Bahn est féminin : mit der U-Bahn. Mit dem s’emploie avec les noms en der et das (mit dem Bus) ; zu indique où l’on va, pas le moyen de transport.',
        q6: 'On envoie une lettre à la poste : die Post, donc zur Post. À la pharmacie, on achète des médicaments ; au supermarché, de quoi manger.',
      },
      addQuestions: [
        {
          id: 'q7', type: 'fill', prompt: 'Décrivez la cuisine : complétez avec einen, eine ou ein.',
          text: 'In der Küche gibt es [[1]] Herd, [[2]] Waschmaschine und [[3]] Regal.',
          blanks: [
            { id: '1', accept: ['einen'], size: 6, hint: 'der Herd' },
            { id: '2', accept: ['eine'], size: 6, hint: 'die Waschmaschine' },
            { id: '3', accept: ['ein'], size: 6, hint: 'das Regal' },
          ],
          explanation: 'Après es gibt, le nom est à l’accusatif : seul le masculin change (der Herd → einen Herd). Die Waschmaschine garde eine et das Regal garde ein.',
        },
        {
          id: 'q8', type: 'fill', prompt: 'Dites ce qui manque : complétez avec keinen, keine ou kein.',
          text: 'Leider gibt es [[1]] Balkon, [[2]] Dusche und [[3]] Arbeitszimmer.',
          blanks: [
            { id: '1', accept: ['keinen'], size: 7, hint: 'der Balkon' },
            { id: '2', accept: ['keine'], size: 7, hint: 'die Dusche' },
            { id: '3', accept: ['kein'], size: 7, hint: 'das Arbeitszimmer' },
          ],
          explanation: 'Kein prend les terminaisons de ein : keinen pour un masculin à l’accusatif (der Balkon), keine pour un féminin (die Dusche), kein pour un neutre (das Arbeitszimmer).',
        },
        {
          id: 'q9', type: 'order', prompt: 'Remettez l’indication dans l’ordre : deux consignes à l’impératif poli, reliées par und.',
          answers: [
            ['Gehen', 'Sie', 'geradeaus', 'bis zur Ampel', 'und', 'nehmen', 'Sie', 'die erste Straße rechts.'],
            ['Gehen', 'Sie', 'bis zur Ampel', 'geradeaus', 'und', 'nehmen', 'Sie', 'die erste Straße rechts.'],
          ],
          explanation: 'À l’impératif poli, chaque consigne commence par le verbe suivi de Sie : Gehen Sie …, nehmen Sie … Après und, on garde le même ordre. « Sie nehmen » serait une simple constatation.',
        },
        {
          id: 'q10', type: 'match', prompt: 'Associez chaque indication à sa traduction.',
          pairs: [
            { left: 'Gehen Sie geradeaus.', right: 'Allez tout droit.' },
            { left: 'Biegen Sie links ab.', right: 'Tournez à gauche.' },
            { left: 'Nehmen Sie die zweite Straße rechts.', right: 'Prenez la deuxième rue à droite.' },
            { left: 'Fahren Sie mit der U-Bahn.', right: 'Prenez le métro.' },
            { left: 'Gehen Sie bis zur Ampel.', right: 'Allez jusqu’au feu.' },
          ],
          explanation: 'Gehen (à pied) et fahren (en véhicule) ne se confondent pas : « Prenez le métro » se dit Fahren Sie mit der U-Bahn. Bis zur Ampel veut dire « jusqu’au feu ».',
        },
      ],
    },
    'a1-stadt-sprechen': {
      kind: 'mission',
      title: 'Mission : présenter son logement et indiquer le chemin',
      estimatedMinutes: 20,
      competences: ['expression-orale', 'expression-ecrite'],
      lesson: {
        title: 'Mission : présenter son logement et indiquer le chemin',
        description: `Un nouveau voisin veut savoir où vous habitez et comment aller à la gare. Ensuite, vous déménagez et vous cherchez quelqu’un pour reprendre votre logement. Écoutez d’abord Tomás, qui présente son logement et son quartier.

MODÈLE
Ich heiße Tomás und wohne in Hamburg, in der Rosenstraße. Meine Wohnung ist nicht sehr groß: Sie hat zwei Zimmer, eine Küche und ein Bad. Das Wohnzimmer ist hell und gemütlich. Es gibt ein Sofa, einen Tisch und ein Regal. Leider gibt es keinen Balkon. Die Wohnung kostet 780 Euro warm. Das ist nicht billig, aber okay. Neben dem Haus gibt es einen Supermarkt, und gegenüber ist eine Apotheke. Ich fahre mit der U-Bahn zur Arbeit. Das sind nur fünfzehn Minuten.

POUR VOUS AIDER
• Ich wohne in …, in der …straße. — Meine Wohnung hat … Zimmer.
• Es gibt einen … / eine … / ein … — Leider gibt es keinen … / keine … / kein …
• Neben dem Haus gibt es … — Ich fahre mit dem Bus / mit der U-Bahn. — Ich gehe zu Fuß.
• Gehen Sie geradeaus bis … — Nehmen Sie die erste Straße links. — Fahren Sie mit der U-Bahn.
• Petite annonce : 2 Zimmer, 50 m², hell und ruhig. Miete: … Euro warm. Zum Bahnhof sind es … Minuten zu Fuß.`,
      },
      mission: {
        oral: {
          prompt: 'Présentez votre logement et votre quartier comme Tomás : la ville et la rue, les pièces, ce qu’il y a et ce qui manque, un ou deux adjectifs, un lieu du quartier et votre moyen de transport. Terminez en indiquant à votre voisin le chemin jusqu’à la gare, avec deux consignes à l’impératif poli.',
          maxSeconds: 120,
        },
        written: {
          prompt: 'Écrivez une petite annonce de cinq ou six phrases pour votre logement : nombre de pièces et surface, ce qu’il y a (Es gibt …) et ce qui manque (Es gibt keinen …), deux adjectifs, le loyer et les transports (Zum Bahnhof sind es … Minuten zu Fuß.).',
          maxChars: 800,
          minWords: 30,
        },
        checklist: [
          'J’ai employé es gibt avec einen devant un nom masculin (Es gibt einen Balkon.).',
          'J’ai dit ce qui manque avec keinen, keine ou kein.',
          'J’ai décrit une pièce avec un adjectif après ist (Die Küche ist hell.).',
          'J’ai donné le chemin avec deux consignes qui commencent par le verbe suivi de Sie.',
          'Mon annonce indique le loyer et un moyen de transport.',
          'Tous les noms de mon annonce commencent par une majuscule.',
        ],
      },
    },
  },
  add: [
    {
      after: 'a1-stadt-natif-weg',
      activity: {
        id: 'a1-stadt-repeter',
        kind: 'exercise',
        title: 'Répéter à voix haute : en ville (st, z, ß)',
        estimatedMinutes: 10,
        competences: ['expression-orale'],
        lesson: {
          title: 'Répéter à voix haute : en ville (st, z, ß)',
          description: `Écoutez chaque modèle, puis dites la phrase sans vous presser. Trois sons de la ville demandent de l’attention :
• st et sp au début d’un mot se disent « cht » et « chp » : die Straße, die Straßenbahn, der Sport. Ailleurs, st se dit comme en français : erste, ist.
• z se prononce toujours [ts] : zu Fuß, zum Zoo, zehn. Ne dites jamais « zoo » à la française.
• ß se prononce comme ss dans « tasse » : die Straße, zu Fuß.
Pour vous échauffer, écoutez les deux enregistrements natifs : des mots avec ß, puis le virelangue « Zehn Ziegen zogen zehn Zentner Zucker zum Zoo », où chaque z se dit [ts].`,
          transcript: null,
        },
        placements: [
          { media: 'a1-stadt-aussprache-ss-audio', usage: 'audio', transcriptVisibility: 'on_demand', decorative: false },
          { media: 'a1-stadt-aussprache-zoo-audio', usage: 'audio', transcriptVisibility: 'on_demand', decorative: false },
        ],
        questions: [
          speak('q1', 'Ich fahre mit der Straßenbahn zum Zoo.', 'Au début de Straße, st se dit « cht » et ß se prononce comme ss. Dans Zoo, z se dit [ts] : « tsoo ».'),
          speak('q2', 'Ich gehe zu Fuß zum Bahnhof.', 'Zu et zum commencent par [ts] ; Fuß finit par un s dur. Dans Bahnhof, le premier h allonge le a, le second se prononce.'),
          speak('q3', 'Entschuldigung, wie komme ich zum Bahnhof?', 'On aborde poliment avec Entschuldigung (accent sur -schul-). Dans la question en W, la voix descend à la fin.'),
          speak('q4', 'Gehen Sie geradeaus bis zur Ampel.', 'Le verbe en tête suivi de Sie donne une indication polie ; la voix descend. Geradeaus est accentué sur -aus.'),
          speak('q5', 'Nehmen Sie die erste Straße links.', 'Comparez les deux st : « cht » au début de Straße, mais [st] comme en français au milieu de erste.'),
          speak('q6', 'Gibt es hier eine Apotheke?', 'Question fermée : le verbe gibt vient en tête et la voix monte à la fin. Dans Apotheke, th se prononce t.'),
        ],
      },
    },
  ],
};
