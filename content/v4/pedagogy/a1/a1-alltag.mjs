// Couche pédagogique V4 · A1 · Mein Tag : raconter sa journée.
const REPEAT = 'Écoutez le modèle, puis dites la phrase à voix haute.';
const speak = (id, text, explanation, accept = [text]) => ({ id, type: 'speak', prompt: REPEAT, text, accept, explanation });

export default {
  module: 'a1-alltag',
  // Aucune marque réelle (le Krimi du dimanche) ; scripts alignés sur les dialogues affichés.
  media: [
    {
      key: "a1-alltag-dialog-audio-v3", kind: "audio", title: "Dialogue : le matin dans la colocation", credit: "LinguaCap, synthèse Piper avec Thorsten Müller (CC0) et Kerstin, préentraînée sur la voix de Cori Samuel (Hi-Fi TTS, CC BY 4.0)", license: "Jeux de données des voix : CC0 et CC BY 4.0",
      script: [
        { voice: "mann", name: "Malik", text: "Guten Morgen, Sophie! Du bist schon wach?" },
        { pause: 0.6 },
        { voice: "frau", name: "Sophie", text: "Morgen, Malik! Ja, ich stehe jeden Tag um Viertel nach sechs auf." },
        { pause: 0.6 },
        { voice: "mann", name: "Malik", text: "So früh? Warum?" },
        { pause: 0.6 },
        { voice: "frau", name: "Sophie", text: "Ich arbeite im Krankenhaus. Meine Arbeit fängt um halb acht an." },
        { pause: 0.6 },
        { voice: "mann", name: "Malik", text: "Ich stehe erst um halb neun auf. Mein Deutschkurs fängt um zehn Uhr an." },
        { pause: 0.6 },
        { voice: "frau", name: "Sophie", text: "Und wann duschst du?" },
        { pause: 0.6 },
        { voice: "mann", name: "Malik", text: "Am Morgen, so um Viertel vor neun." },
        { pause: 0.6 },
        { voice: "frau", name: "Sophie", text: "Prima! Ich dusche immer am Abend. Dann ist das Bad am Morgen frei." },
        { pause: 0.6 },
        { voice: "mann", name: "Malik", text: "Super! Hast du heute Abend Zeit? Wir kochen zusammen, okay?" },
        { pause: 0.6 },
        { voice: "frau", name: "Sophie", text: "Gern! Am Nachmittag kaufe ich ein. Was brauchen wir?" },
        { pause: 0.6 },
        { voice: "mann", name: "Malik", text: "Nudeln, Tomaten und Käse. Um sieben essen wir, und dann sehen wir zusammen fern." },
        { pause: 0.6 },
        { voice: "frau", name: "Sophie", text: "Gute Idee! Ich rufe dich um vier Uhr an. Tschüs, bis heute Abend!" },
      ],
    },
    {
      key: "a1-alltag-sonntag-audio-v3", kind: "audio", title: "Clara et Yanis organisent leur dimanche", credit: "LinguaCap, synthèse Piper avec Thorsten Müller (CC0) et Kerstin, préentraînée sur la voix de Cori Samuel (Hi-Fi TTS, CC BY 4.0)", license: "Jeux de données des voix : CC0 et CC BY 4.0",
      script: [
        { voice: "frau", name: "Clara", text: "Hallo Yanis! Hast du am Sonntag Zeit?" },
        { pause: 0.6 },
        { voice: "mann", name: "Yanis", text: "Ja, klar! Was machen wir? Am Vormittag kaufe ich ein, und dann …" },
        { pause: 0.6 },
        { voice: "frau", name: "Clara", text: "Einkaufen? Das geht nicht. Am Sonntag sind die Geschäfte zu!" },
        { pause: 0.6 },
        { voice: "mann", name: "Yanis", text: "Ach so, stimmt! Dann kaufe ich am Samstag ein. Und was machen wir am Morgen?" },
        { pause: 0.6 },
        { voice: "frau", name: "Clara", text: "Wir stehen spät auf. Um halb elf frühstücken wir zusammen bei mir: Brunch!" },
        { pause: 0.6 },
        { voice: "mann", name: "Yanis", text: "Super! Ich bringe Brötchen mit. Die Bäckerei ist am Morgen offen." },
        { pause: 0.6 },
        { voice: "frau", name: "Clara", text: "Prima! Am Nachmittag gehen wir im Park spazieren. Um vier Uhr gibt es Kaffee und Kuchen bei meinen Eltern." },
        { pause: 0.6 },
        { voice: "mann", name: "Yanis", text: "Gern! Und am Abend? Gehen wir ins Kino?" },
        { pause: 0.6 },
        { voice: "frau", name: "Clara", text: "Hm, am Sonntagabend sehe ich immer den Krimi im Fernsehen. Der Krimi fängt um Viertel nach acht an. Siehst du mit uns fern?" },
        { pause: 0.6 },
        { voice: "mann", name: "Yanis", text: "Ein Krimi? Das finde ich nicht so toll. Ich spiele lieber Karten." },
        { pause: 0.6 },
        { voice: "frau", name: "Clara", text: "Okay, dann so: Zuerst spielen wir Karten, und um Viertel nach acht sehen wir zusammen den Krimi." },
        { pause: 0.6 },
        { voice: "mann", name: "Yanis", text: "Einverstanden! Bis Sonntag, Clara!" },
        { pause: 0.5 },
        { voice: "frau", name: "Clara", text: "Bis Sonntag! Tschüs!" },
      ],
    },
    { key: "a1-alltag-sonntag-bild", kind: "image", title: "Le dimanche en Allemagne", alt: "Six vignettes : une boutique pour « Die Geschäfte sind zu. », un croissant pour la boulangerie, une gélule pour la pharmacie, un haut-parleur barré pour le calme, une part de gâteau pour Kaffee und Kuchen et un téléviseur pour le Krimi du dimanche soir.", image: {"layout":"grid","items":[{"icon":"store","label":"Die Geschäfte sind zu."},{"icon":"croissant","label":"die Bäckerei"},{"icon":"pill","label":"die Apotheke"},{"icon":"volume-x","label":"Ruhe, bitte!"},{"icon":"cake-slice","label":"Kaffee und Kuchen"},{"icon":"tv","label":"der Sonntagskrimi"}]} },
  ],
  grammarFocus: ['verbes-separables', 'place-du-verbe'],
  vocabulary: [
    { id: 'aufwachen', word: 'aufwachen', article: null, plural: null, partOfSpeech: 'verb', translation: 'se réveiller', example: 'Ich wache um sechs Uhr auf.', note: 'séparable : auf|wachen' },
    { id: 'aufstehen', word: 'aufstehen', article: null, plural: null, partOfSpeech: 'verb', translation: 'se lever', example: 'Ich stehe um halb sieben auf.', note: 'séparable : auf|stehen' },
    { id: 'duschen', word: 'duschen', article: null, plural: null, partOfSpeech: 'verb', translation: 'se doucher', example: 'Wann duschen Sie?', note: null },
    { id: 'fruehstuecken', word: 'frühstücken', article: null, plural: null, partOfSpeech: 'verb', translation: 'prendre le petit-déjeuner', example: 'Wir frühstücken zusammen.', note: null },
    { id: 'anfangen', word: 'anfangen', article: null, plural: null, partOfSpeech: 'verb', translation: 'commencer', example: 'Wann fangen wir an?', note: 'séparable : an|fangen ; der Kurs fängt um neun Uhr an' },
    { id: 'einkaufen', word: 'einkaufen', article: null, plural: null, partOfSpeech: 'verb', translation: 'faire les courses', example: 'Am Samstag kaufe ich ein.', note: 'séparable : ein|kaufen' },
    { id: 'anrufen', word: 'anrufen', article: null, plural: null, partOfSpeech: 'verb', translation: 'téléphoner à quelqu’un', example: 'Wir rufen dich um vier Uhr an.', note: 'séparable : an|rufen ; ich rufe meine Mutter an' },
    { id: 'fernsehen', word: 'fernsehen', article: null, plural: null, partOfSpeech: 'verb', translation: 'regarder la télévision', example: 'Am Abend sehen wir fern.', note: 'séparable : fern|sehen ; er sieht fern' },
    { id: 'kochen', word: 'kochen', article: null, plural: null, partOfSpeech: 'verb', translation: 'faire la cuisine', example: 'Heute kochen wir zusammen.', note: null },
    { id: 'schlafen', word: 'schlafen', article: null, plural: null, partOfSpeech: 'verb', translation: 'dormir', example: 'Am Sonntag schlafen wir lange.', note: 'du schläfst, er schläft' },
    { id: 'ins-bett-gehen', word: 'ins Bett gehen', article: null, plural: null, partOfSpeech: 'expression', translation: 'aller se coucher', example: 'Ich gehe um elf Uhr ins Bett.', note: null },
    { id: 'nach-hause-kommen', word: 'nach Hause kommen', article: null, plural: null, partOfSpeech: 'expression', translation: 'rentrer à la maison', example: 'Ich komme um sechs Uhr nach Hause.', note: null },
    { id: 'fruehstueck', word: 'Frühstück', article: 'das', plural: 'Frühstücke', partOfSpeech: 'noun', translation: 'le petit-déjeuner', example: 'Was isst du zum Frühstück?', note: null },
    { id: 'mittagessen', word: 'Mittagessen', article: 'das', plural: 'Mittagessen', partOfSpeech: 'noun', translation: 'le déjeuner', example: 'Das Mittagessen ist um zwölf Uhr.', note: null },
    { id: 'abendessen', word: 'Abendessen', article: 'das', plural: 'Abendessen', partOfSpeech: 'noun', translation: 'le dîner', example: 'Das Abendessen ist fertig!', note: null },
    { id: 'morgen', word: 'Morgen', article: 'der', plural: 'Morgen', partOfSpeech: 'noun', translation: 'le matin', example: 'Am Morgen dusche ich.', note: 'morgen, avec une minuscule, veut dire « demain »' },
    { id: 'nachmittag', word: 'Nachmittag', article: 'der', plural: 'Nachmittage', partOfSpeech: 'noun', translation: 'l’après-midi', example: 'Am Nachmittag kaufe ich ein.', note: null },
    { id: 'abend', word: 'Abend', article: 'der', plural: 'Abende', partOfSpeech: 'noun', translation: 'le soir', example: 'Am Abend koche ich.', note: null },
    { id: 'nacht', word: 'Nacht', article: 'die', plural: 'Nächte', partOfSpeech: 'noun', translation: 'la nuit', example: 'In der Nacht schlafe ich.', note: 'in der Nacht, mais am Morgen, am Abend' },
    { id: 'halb', word: 'halb', article: null, plural: null, partOfSpeech: 'adjective', translation: 'demi ; et demie (pour l’heure)', example: 'Es ist halb acht.', note: 'halb acht = 7 h 30 : on regarde l’heure suivante' },
    { id: 'viertel', word: 'Viertel', article: 'das', plural: 'Viertel', partOfSpeech: 'noun', translation: 'le quart', example: 'Es ist Viertel nach neun.', note: 'Viertel nach neun = 9 h 15 ; Viertel vor zehn = 9 h 45' },
    { id: 'zuerst', word: 'zuerst', article: null, plural: null, partOfSpeech: 'adverb', translation: 'd’abord', example: 'Zuerst dusche ich.', note: null },
    { id: 'dann', word: 'dann', article: null, plural: null, partOfSpeech: 'adverb', translation: 'ensuite, puis', example: 'Dann frühstücke ich.', note: null },
    { id: 'bus', word: 'Bus', article: 'der', plural: 'Busse', partOfSpeech: 'noun', translation: 'le bus', example: 'Heute fahre ich mit dem Bus.', note: null },
    { id: 'fahrrad', word: 'Fahrrad', article: 'das', plural: 'Fahrräder', partOfSpeech: 'noun', translation: 'le vélo', example: 'Ich fahre mit dem Fahrrad zur Uni.', note: null },
  ],
  activities: {
    'a1-alltag-wortschatz': { title: 'Découvrir : les actions de la journée', estimatedMinutes: 12, lesson: { title: 'Découvrir : les actions de la journée' } },
    'a1-alltag-dib-tagesablauf': {
      title: 'Écouter et répéter : la journée et le trajet (voix natives)',
      estimatedMinutes: 12,
      lesson: { title: 'Écouter et répéter : la journée et le trajet (voix natives)' },
    },
    'a1-alltag-uhrzeit': { title: 'Découvrir : dire l’heure et situer dans la semaine', lesson: { title: 'Découvrir : dire l’heure et situer dans la semaine' } },
    'a1-alltag-dib-zeit': {
      explanations: {
        q1: 'On entend « die Nacht, die Nächte » : pluriel en -e avec tréma, comme der Stuhl → die Stühle. Die Nachten et die Nachts n’existent pas.',
        q2: 'On entend « der Morgen, die Morgen » : les noms masculins en -en ne prennent pas de terminaison au pluriel (certains prennent un tréma : der Garten, die Gärten) ; ici, seul l’article devient die.',
        q3: 'On dit am Morgen, am Nachmittag, am Abend, mais in der Nacht : la nuit fait exception, avec in et l’article der (die Nacht → in der Nacht).',
        q4: 'Morgens, avec -s et une minuscule, exprime une habitude : le matin, tous les matins. Morgen sans -s veut dire « demain ».',
        q5: 'Die Mitternacht est minuit : um Mitternacht, à minuit. Midi se dit der Mittag, et gegen Mittag veut dire « vers midi ».',
        q6: 'Viertel vor zehn, c’est un quart d’heure avant dix heures : 9 h 45. Viertel nach zehn serait 10 h 15.',
        q7: '« Um wie viel Uhr? » demande à quelle heure a lieu quelque chose. « Wie spät ist es? » demande l’heure qu’il est maintenant.',
        q8: 'On entend « die Uhr, die Uhren » : beaucoup de noms féminins font leur pluriel en -en ou -n, sans tréma.',
      },
    },
    'a1-alltag-dialog': { title: 'Comprendre : le matin dans la colocation', estimatedMinutes: 12, lesson: { title: 'Comprendre : le matin dans la colocation' } },
    // V et w sont déjà travaillés dans a1-abc, a1-rythme et a1-hallo (Aussprache) : leçon retirée pour faire place à la répétition.
    'a1-alltag-aussprache': null,
    'a1-alltag-lesen': {
      explanations: {
        q1: 'Daniel écrit « Ich stehe um halb acht auf ». Halb acht regarde vers huit heures : c’est 7 h 30, pas 8 h 30.',
        q2: '« Um Viertel nach acht fahre ich mit dem Fahrrad zur Uni » : das Fahrrad est le vélo. Viertel nach acht (8 h 15) est l’heure de son départ.',
        q3: '« Mittags esse ich in der Mensa, das ist billig. » Le restaurant est le lieu de son travail du soir, et la bibliothèque celui où il étudie l’après-midi.',
        q4: 'Le mercredi, le cours a lieu de 9.00 à 11.45 Uhr : 11 h 45, c’est Viertel vor zwölf, midi moins le quart. Le lundi, le cours finit à midi pile.',
        q5: '« Am Sonntag? Da schlafe ich lange und rufe meine Eltern in Hamburg an. » Le football est le samedi et les courses le vendredi soir.',
      },
    },
    'a1-alltag-hoeren': {
      estimatedMinutes: 12,
      competences: ['ecoute', 'expression-ecrite'],
      lesson: {
        description: 'Écoutez les trois petites scènes (vous pouvez réécouter autant de fois que nécessaire), puis répondez aux questions. Faites bien attention aux heures : « halb » annonce l’heure suivante. Les deux dernières questions sont des dictées : écoutez la phrase et écrivez-la. La transcription s’affichera après votre réponse.\n\nMOTS UTILES\n• die Besprechung — la réunion   • kaputt — en panne\n• die Bäckerin — la boulangère   • die Bäckerei — la boulangerie',
      },
      explanations: {
        q1: 'Herr Schulz explique « Mein Auto ist kaputt. Heute fahre ich mit dem Bus » : sa voiture est en panne, alors il prend le bus aujourd’hui.',
        q2: 'Frau Kaya dit « Die Besprechung fängt um Viertel nach neun an » : 9 h 15. Zehn nach neun (9 h 10), c’est l’heure qu’il est au moment de la scène.',
        q3: 'Frau Wolf dit « Um halb drei fange ich in der Bäckerei an » : halb drei = 2 h 30. Elle se lève à 2 h et déjeune à 11 h.',
        q4: '« Am Nachmittag schlafe ich dann zwei Stunden » : l’après-midi, Frau Wolf dort deux heures. La télévision, c’est le soir.',
        q5: 'Aylin dit « Es ist schon halb elf! » (10 h 30) et Ben répond « Aber heute ist doch Samstag! ». Halb elf n’est pas 11 h 30 : halb regarde vers l’heure suivante.',
      },
      addQuestions: [
        {
          id: 'q6', type: 'dictation', prompt: 'Dictée : écoutez la phrase sur le lever et écrivez-la.',
          accept: ['Ich stehe jeden Tag um halb sieben auf.'], voice: 'frau',
          explanation: 'Aufstehen est séparable : stehe se place en 2e position et auf ferme la phrase. Halb sieben = 6 h 30 ; le nombre peut s’écrire en chiffres (halb 7).',
        },
        {
          id: 'q7', type: 'dictation', prompt: 'Dictée : écoutez la phrase sur la soirée et écrivez-la.',
          accept: ['Am Abend sehen wir zusammen fern.'], voice: 'mann',
          explanation: 'Am Abend est en tête : le verbe sehen vient juste après, puis le sujet wir. Fern, le préfixe de fernsehen, ferme la phrase. Abend prend une majuscule.',
        },
      ],
    },
    'a1-alltag-sonntag-lesen': {
      // Aucune marque ni institution réelle : le « Tatort » devient le Krimi du dimanche, la lettre n’est plus signée d’une université réelle.
      lesson: { description: "Le service des relations internationales (das International Office) d’une université allemande envoie une lettre d’information aux nouveaux étudiants étrangers. Le thème : le dimanche en Allemagne. Lisez le texte, puis répondez aux questions. Repérez les verbes séparables (einkaufen, aufstehen, anfangen, fernsehen) et les heures.\n\nDER SONNTAG IN DEUTSCHLAND – TIPPS FÜR NEUE STUDIERENDE\nAm Sonntag ist in Deutschland Ruhetag. Die Supermärkte und die Geschäfte sind zu. Also kauft man am Samstag für das Wochenende ein!\nSie haben am Sonntag keine Milch und kein Brot? Kein Problem: Am Bahnhof und an der Tankstelle sind die Geschäfte offen. Viele Bäckereien sind am Morgen auch offen, von acht bis elf Uhr. Und eine Apotheke in der Stadt hat immer Notdienst.\nAm Sonntag ist es ruhig. Man bohrt nicht, man arbeitet nicht im Garten und man hört keine laute Musik. Das finden die Nachbarn nicht gut!\nUnd was macht man am Sonntag? Man steht spät auf und frühstückt lange, oft mit Freunden: Das ist der Brunch. Am Nachmittag geht man spazieren. Um drei Uhr gibt es oft Kaffee und Kuchen mit der Familie. Am Abend, um Viertel nach acht, fängt im Fernsehen der Sonntagskrimi an. Das ist eine Krimiserie. Viele Leute sehen jeden Sonntag zusammen fern. Für viele Familien ist das eine Tradition!\nSchönen Sonntag!\nIhr International Office\n\nMOTS UTILES\n• der Ruhetag — le jour de repos\n• zu ≠ offen — fermé ≠ ouvert\n• die Tankstelle — la station-service\n• die Apotheke — la pharmacie ; der Notdienst — le service de garde\n• bohren — percer (avec une perceuse)\n• laut — fort, bruyant ; die Nachbarn — les voisins\n• spazieren gehen — se promener\n• der Krimi — le film ou la série policière\n• man — on ; le verbe se conjugue comme avec er, sie, es : Man steht spät auf. — On se lève tard.\n\nTexte adapté de Der und mehr (Kennesaw State University), CC BY 4.0." },
      // Questions reprises du kit à l’identique (identifiants, choix), sauf la mention de la série (q5, choix c ; q6).
      questions: [
        { id: 'q1', type: 'choice', prompt: "Qu’est-ce qui est fermé le dimanche en Allemagne ?", options: [{ id: 'a', label: "Toutes les pharmacies.", correct: false }, { id: 'b', label: "Les magasins de la gare.", correct: false }, { id: 'c', label: "Les supermarchés et les magasins.", correct: true }, { id: 'd', label: "Les boulangeries, toute la journée.", correct: false }] },
        { id: 'q2', type: 'choice', prompt: "Le dimanche, vous n’avez plus de lait. Où pouvez-vous en acheter ?", options: [{ id: 'a', label: "Au supermarché, le matin.", correct: false }, { id: 'b', label: "Dans un magasin de la gare ou de la station-service.", correct: true }, { id: 'c', label: "À la pharmacie de garde.", correct: false }, { id: 'd', label: "Nulle part : tout est fermé.", correct: false }] },
        { id: 'q3', type: 'choice', prompt: "Wann sind viele Bäckereien am Sonntag offen?", options: [{ id: 'a', label: "Von acht bis zwölf Uhr.", correct: false }, { id: 'b', label: "Am Nachmittag.", correct: false }, { id: 'c', label: "Den ganzen Tag.", correct: false }, { id: 'd', label: "Von acht bis elf Uhr.", correct: true }] },
        { id: 'q4', type: 'choice', prompt: "Qu’est-ce qu’on ne fait pas le dimanche ?", options: [{ id: 'a', label: "Se promener l’après-midi.", correct: false }, { id: 'b', label: "Faire du bruit : percer ou écouter de la musique forte.", correct: true }, { id: 'c', label: "Prendre un long petit-déjeuner avec des amis.", correct: false }, { id: 'd', label: "Regarder la télévision le soir.", correct: false }] },
        { id: 'q5', type: 'choice', prompt: "Que fait-on souvent l’après-midi, en famille ?", options: [{ id: 'a', label: "On prend le café avec du gâteau.", correct: true }, { id: 'b', label: "On fait un brunch.", correct: false }, { id: 'c', label: "On regarde le Krimi.", correct: false }, { id: 'd', label: "On fait les courses pour le week-end.", correct: false }] },
        { id: 'q6', type: 'choice', prompt: "À quelle heure commence le Krimi du dimanche soir ?", options: [{ id: 'a', label: "À 20 h 45.", correct: false }, { id: 'b', label: "À 8 h 15.", correct: false }, { id: 'c', label: "À 20 h 15.", correct: true }, { id: 'd', label: "À 19 h 45.", correct: false }] },
      ],
      explanations: {
        q1: '« Die Supermärkte und die Geschäfte sind zu » : zu veut dire « fermé ». Les magasins de la gare et une pharmacie de garde restent ouverts.',
        q2: '« Am Bahnhof und an der Tankstelle sind die Geschäfte offen. » Le supermarché est fermé, et la pharmacie de garde vend des médicaments, pas du lait.',
        q3: '« Viele Bäckereien sind am Morgen auch offen, von acht bis elf Uhr. » Seulement le matin, et jusqu’à onze heures, pas midi.',
        q4: '« Man bohrt nicht, man arbeitet nicht im Garten und man hört keine laute Musik. » Le dimanche est un jour calme ; se promener ou regarder la télévision est tout à fait normal.',
        q5: '« Um drei Uhr gibt es oft Kaffee und Kuchen mit der Familie. » Le brunch se prend le matin avec des amis, et la série policière se regarde le soir.',
        q6: '« Am Abend, um Viertel nach acht » : Viertel nach acht = 8 h 15, et am Abend indique le soir, donc 20 h 15. 20 h 45 se dirait Viertel vor neun.',
      },
    },
    'a1-alltag-sonntag-sprechen': {
      title: 'Comprendre : organiser un dimanche ensemble',
      estimatedMinutes: 12,
      lesson: {
        title: 'Comprendre : organiser un dimanche ensemble',
        description: `Une amie allemande vous propose de passer un dimanche « à l’allemande ». Écoutez Clara et Yanis organiser leur dimanche : ils proposent, acceptent, refusent et trouvent un compromis.

MODÈLE
Clara : Hallo Yanis! Hast du am Sonntag Zeit?
Yanis : Ja, klar! Was machen wir? Am Vormittag kaufe ich ein, und dann …
Clara : Einkaufen? Das geht nicht. Am Sonntag sind die Geschäfte zu!
Yanis : Ach so, stimmt! Dann kaufe ich am Samstag ein. Und was machen wir am Morgen?
Clara : Wir stehen spät auf. Um halb elf frühstücken wir zusammen bei mir: Brunch!
Yanis : Super! Ich bringe Brötchen mit. Die Bäckerei ist am Morgen offen.
Clara : Prima! Am Nachmittag gehen wir im Park spazieren. Um vier Uhr gibt es Kaffee und Kuchen bei meinen Eltern.
Yanis : Gern! Und am Abend? Gehen wir ins Kino?
Clara : Hm, am Sonntagabend sehe ich immer den Krimi im Fernsehen. Der Krimi fängt um Viertel nach acht an. Siehst du mit uns fern?
Yanis : Ein Krimi? Das finde ich nicht so toll. Ich spiele lieber Karten.
Clara : Okay, dann so: Zuerst spielen wir Karten, und um Viertel nach acht sehen wir zusammen den Krimi.
Yanis : Einverstanden! Bis Sonntag, Clara!
Clara : Bis Sonntag! Tschüs!

MOTS UTILES
• Das geht nicht. — Ce n’est pas possible.
• stimmt — c’est vrai
• mit|bringen — apporter : Ich bringe Brötchen mit.
• lieber — plutôt, de préférence : Ich spiele lieber Karten.
• einverstanden — d’accord

POUR ORGANISER UNE SORTIE
• proposer : Hast du am Sonntag Zeit? Um halb elf frühstücken wir zusammen, okay? Gehen wir ins Kino?
• accepter : Gern! Super! Gute Idee! Einverstanden!
• refuser : Das geht nicht. Das finde ich nicht so toll. Ich spiele lieber Karten.
• trouver un compromis : Zuerst …, dann …
• prendre congé : Bis Sonntag! Bis bald! On ne dit « Bis später! » que si l’on se revoit le jour même.

À VOUS
1. Écoutez la scène sans lire, puis repérez la proposition refusée par Clara et celle refusée par Yanis.
2. Réécoutez en lisant et repérez la place du verbe après « Am Nachmittag », « Um vier Uhr » et « Zuerst » : il vient juste après, avant le sujet.
3. Repérez les préfixes séparés à la fin des phrases : ein (einkaufen), auf (aufstehen), mit (mitbringen), an (anfangen), fern (fernsehen).
4. Lisez le modèle à voix haute en jouant les deux rôles, puis dites votre propre programme du dimanche en quatre phrases : am Morgen, um … Uhr, am Nachmittag, am Abend.

Situation adaptée de Der und mehr (Kennesaw State University), CC BY 4.0.`,
      },
    },
    'a1-alltag-grammatik': {
      title: 'S’entraîner : verbes séparables et place du verbe',
      estimatedMinutes: 12,
      lesson: {
        title: 'S’entraîner : verbes séparables et place du verbe',
        description: 'Choisissez, écrivez ou remettez dans l’ordre. Rappels : le verbe conjugué est toujours en 2e position (Um acht Uhr frühstücke ich.) ; le préfixe des verbes séparables va à la fin (Ich kaufe heute ein.) ; « halb » annonce l’heure suivante (halb acht = 7 h 30) ; « um » + heure, « am » + jour ou moment de la journée.',
      },
      explanations: {
        q1: 'Le verbe conjugué est toujours en 2e position : après « Um sieben Uhr » vient stehe, puis le sujet ich, et le préfixe auf va à la fin. « Um sieben Uhr ich stehe auf » calque le français.',
        q2: 'Avec der Deutschkurs (= er), anfangen se conjugue avec un ä : er fängt … an. Fängst va avec du et fangen avec wir ou Sie.',
        q3: 'Halb regarde vers l’heure suivante : 7 h 30 = halb acht. Halb sieben serait 6 h 30, le piège typique d’un francophone.',
        q4: 'Téléphoner à quelqu’un se dit anrufen : Sophie ruft ihre Mutter an. Einkaufen (faire les courses) et fernsehen (regarder la télévision) ont d’autres préfixes.',
        q5: '11 h 45, c’est un quart d’heure avant midi : Viertel vor zwölf. Halb zwölf serait 11 h 30, et Viertel vor elf 10 h 45.',
        q6: 'On dit am + jour et um + heure : am Montag um halb zehn. Les autres réponses inversent ou confondent ces deux petits mots.',
      },
      addQuestions: [
        {
          id: 'q7', type: 'order', prompt: 'Remettez les mots dans l’ordre. La phrase commence par « Um halb sieben ».',
          answers: [['Um halb sieben', 'stehe', 'ich', 'jeden Tag', 'auf.']],
          explanation: 'Après un complément de temps en tête, le verbe reste en 2e position et le sujet passe derrière : Um halb sieben stehe ich jeden Tag auf. Le préfixe auf ferme la phrase.',
        },
        {
          id: 'q8', type: 'order', prompt: 'Remettez les mots dans l’ordre. La phrase commence par « Am Nachmittag ».',
          answers: [['Am Nachmittag', 'kaufe', 'ich', 'im Supermarkt', 'ein.']],
          explanation: 'Einkaufen est séparable : kaufe se place en 2e position et ein tout à la fin. « Am Nachmittag ich kaufe … » est la faute typique : le sujet doit suivre le verbe.',
        },
        {
          id: 'q9', type: 'fill', prompt: 'Complétez avec anrufen, puis avec fernsehen : verbe conjugué et préfixe séparé.',
          text: 'Ich [[1]] meine Mutter [[2]]. Am Abend [[3]] wir zusammen [[4]].',
          blanks: [
            { id: '1', accept: ['rufe'], size: 6, hint: 'anrufen' },
            { id: '2', accept: ['an'], size: 4, hint: null },
            { id: '3', accept: ['sehen'], size: 6, hint: 'fernsehen' },
            { id: '4', accept: ['fern'], size: 5, hint: null },
          ],
          explanation: 'Le verbe conjugué se place en 2e position (rufe, sehen) et le préfixe à la fin (an, fern). Après « Am Abend », le sujet wir suit le verbe.',
        },
        {
          id: 'q10', type: 'order', prompt: 'D’abord, je me douche ; ensuite, je prends le petit-déjeuner. Remettez les mots dans l’ordre.',
          answers: [['Zuerst', 'dusche', 'ich,', 'dann', 'frühstücke', 'ich.']],
          explanation: 'Zuerst et dann occupent la 1re place de leur phrase : le verbe vient juste après, puis le sujet. « Dann ich frühstücke » calque le français et place mal le verbe.',
        },
      ],
    },
    'a1-alltag-sprechen': {
      kind: 'mission',
      title: 'Mission : raconter ma journée',
      estimatedMinutes: 20,
      competences: ['expression-orale', 'expression-ecrite'],
      lesson: {
        title: 'Mission : raconter ma journée',
        description: `Un ami germanophone vous demande comment se passe une journée ordinaire chez vous. Écoutez d’abord Hugo raconter la sienne.

MODÈLE
Hallo! Ich heiße Hugo und ich wohne in Freiburg. Von Montag bis Freitag stehe ich um halb sieben auf. Zuerst dusche ich, dann frühstücke ich: Brot mit Butter und Marmelade. Dazu trinke ich Tee. Um Viertel nach sieben fahre ich mit dem Bus zur Arbeit. Ich arbeite in einem Büro. Die Arbeit fängt um acht Uhr an. Um zwölf esse ich in der Kantine zu Mittag. Um halb fünf ist die Arbeit zu Ende. Dann kaufe ich ein oder ich gehe in den Park. Am Abend koche ich, und oft rufe ich meine Freundin in Frankreich an. Um elf Uhr gehe ich ins Bett.

POUR VOUS AIDER
• Le matin : Ich stehe um … auf. Zuerst …, dann …
• Le trajet : Um … fahre ich mit dem Bus / mit dem Fahrrad zur Arbeit. Ich gehe zu Fuß.
• La journée : Meine Arbeit / Mein Kurs fängt um … an. Mittags esse ich …
• Le soir : Am Abend koche ich / sehe ich fern / rufe ich … an.
• La nuit : Um … gehe ich ins Bett.`,
      },
      mission: {
        oral: {
          prompt: 'Racontez votre journée de semaine en 45 à 90 secondes, du lever au coucher, comme Hugo : au moins quatre heures et trois verbes séparables (aufstehen, anfangen, einkaufen, anrufen, fernsehen). Commencez plusieurs phrases par une heure ou par Zuerst, Dann, Am Abend.',
          maxSeconds: 90,
        },
        written: {
          prompt: 'Écrivez à un ami germanophone un message de six à huit phrases : votre lundi (heures et activités), puis votre dimanche.',
          maxChars: 900,
          minWords: 40,
        },
        checklist: [
          'J’ai donné au moins quatre heures (um halb sieben, um Viertel nach acht…).',
          'J’ai employé au moins trois verbes séparables, avec le préfixe à la fin de la phrase.',
          'Quand une phrase commence par une heure, Zuerst ou Dann, le verbe vient juste après, avant le sujet.',
          'J’ai employé halb correctement : halb acht = 7 h 30.',
          'Mon message parle du lundi et du dimanche.',
        ],
      },
    },
  },
  add: [
    {
      after: 'a1-alltag-sonntag-sprechen',
      activity: {
        id: 'a1-alltag-repeter',
        kind: 'exercise',
        title: 'Répéter à voix haute : raconter sa journée',
        estimatedMinutes: 8,
        competences: ['expression-orale'],
        lesson: {
          title: 'Répéter à voix haute : raconter sa journée',
          description: 'Écoutez chaque modèle autant de fois que nécessaire, puis dites la phrase sans vous presser. Dans les verbes séparables, le préfixe qui termine la phrase est accentué : Ich stehe um halb sieben AUF.',
          transcript: null,
        },
        placements: [],
        questions: [
          speak('q1', 'Ich stehe um halb sieben auf.', 'Accentuez le préfixe qui ferme la phrase : … AUF. Dans sieben, le s placé devant une voyelle se dit comme un z français.', ['Ich stehe um halb sieben auf.', 'Ich stehe um halb 7 auf.']),
          speak('q2', 'Der Kurs fängt um Viertel nach neun an.', 'Viertel commence par le son [f] : « firtel ». Dans fängt, ä se dit presque comme « è ». Le préfixe an ferme la phrase.', ['Der Kurs fängt um Viertel nach neun an.', 'Der Kurs fängt um Viertel nach 9 an.']),
          speak('q3', 'Am Nachmittag rufe ich dich an.', 'Le ch de Nachmittag, après a, se forme au fond de la gorge. Le verbe rufe suit Am Nachmittag, et le préfixe an termine la phrase.'),
          speak('q4', 'Zuerst dusche ich, dann frühstücke ich.', 'Zuerst commence par « ts ». Dans frühstücke, ü se dit comme le u de « lune » et st se dit « cht ».'),
          speak('q5', 'Wie spät ist es? Es ist halb acht.', 'Halb acht = 7 h 30. Le ch d’acht, après a, se forme au fond de la gorge ; spät commence par « chp ».', ['Wie spät ist es? Es ist halb acht.', 'Wie spät ist es? Es ist halb 8.']),
          speak('q6', 'Am Abend sehen wir zusammen fern.', 'Zusammen commence par « ts » et son s intérieur se dit comme un z français. Fern, le préfixe de fernsehen, ferme la phrase.'),
        ],
      },
    },
  ],
  order: [
    'a1-alltag-wortschatz', 'a1-alltag-dib-tagesablauf', 'a1-alltag-uhrzeit', 'a1-alltag-dib-zeit', 'a1-alltag-dialog', 'a1-alltag-grammatik',
    'a1-alltag-lesen', 'a1-alltag-hoeren', 'a1-alltag-sonntag-lesen', 'a1-alltag-sonntag-sprechen', 'a1-alltag-repeter', 'a1-alltag-sprechen',
  ],
};
