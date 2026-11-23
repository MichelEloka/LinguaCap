// Couche pédagogique V4 · A1 · Au cours et à l’université : objets, matières, jours de la semaine.
const REPEAT = 'Écoutez le modèle, puis dites la phrase à voix haute.';
const speak = (id, text, explanation, accept = [text]) => ({ id, type: 'speak', prompt: REPEAT, text, accept, explanation });

export default {
  module: 'a1-kurs',
  // Aucune marque réelle : la messagerie devient le chat du groupe.
  media: [
    {
      key: "a1-kurs-netz-audio-v3", kind: "audio", title: "Campus-Radio Hamburg : comment utilisez-vous Internet ?", credit: "LinguaCap, synthèse Piper avec Thorsten Müller (CC0) et Kerstin, préentraînée sur la voix de Cori Samuel (Hi-Fi TTS, CC BY 4.0)", license: "Jeux de données des voix : CC0 et CC BY 4.0",
      script: [
        { voice: "sprecherin", name: "Reporterin", text: "Hallo und herzlich willkommen bei Campus-Radio Hamburg! Unser Thema heute: das Netz. Wie benutzt ihr das Internet und das Handy? Wir fragen Leute an der Uni." },
        { pause: 0.8 },
        { voice: "sprecherin", name: "Reporterin", text: "Hallo! Wie heißt du, und was studierst du?" },
        { pause: 0.5 },
        { voice: "mann", name: "Jonas", text: "Hallo! Ich heiße Jonas und ich studiere Medizin." },
        { pause: 0.5 },
        { voice: "sprecherin", name: "Reporterin", text: "Wie oft benutzt du das Handy, Jonas?" },
        { pause: 0.5 },
        { voice: "mann", name: "Jonas", text: "Oh, sehr oft! Ich schicke jeden Tag viele Nachrichten, vor allem im Gruppenchat. In Deutschland benutzt man Gruppenchats sehr viel. Aber im Kurs ist mein Handy aus. Das ist wichtig!" },
        { pause: 0.8 },
        { voice: "sprecherin", name: "Reporterin", text: "Danke, Jonas! Und du? Wer bist du?" },
        { pause: 0.5 },
        { voice: "frau", name: "Amira", text: "Ich bin Amira. Ich komme aus Marokko und studiere Germanistik." },
        { pause: 0.5 },
        { voice: "sprecherin", name: "Reporterin", text: "Und wie benutzt du das Netz, Amira?" },
        { pause: 0.5 },
        { voice: "frau", name: "Amira", text: "Vor allem für das Studium. Am Abend, von zwanzig bis zweiundzwanzig Uhr, sehe ich Videos auf Deutsch. Und im Bus höre ich Podcasts. Im Seminar haben wir auch eine Gruppe im Netz. Dort teilen wir Fotos von der Tafel." },
        { pause: 0.8 },
        { voice: "sprecherin", name: "Reporterin", text: "Super Idee! Und jetzt noch eine Person. Entschuldigung, sind Sie auch Student?" },
        { pause: 0.5 },
        { voice: "sprecher", name: "Herr Becker", text: "Nein, ich bin Dozent für Informatik." },
        { pause: 0.5 },
        { voice: "sprecherin", name: "Reporterin", text: "Dann sind Sie sicher oft im Netz!" },
        { pause: 0.5 },
        { voice: "sprecher", name: "Herr Becker", text: "Ja, natürlich. Von Montag bis Freitag arbeite ich jeden Tag am Computer. Aber am Samstag und am Sonntag ist mein Handy aus. Kein Internet, keine E-Mails! Am Wochenende lese ich lieber ein Buch." },
        { pause: 0.8 },
        { voice: "sprecherin", name: "Reporterin", text: "Vielen Dank! Und Sie, liebe Hörerinnen und Hörer? Wie benutzen Sie das Netz? Schicken Sie uns eine Nachricht!" },
      ],
    },
  ],
  grammarFocus: ['articles-ein-kein-pluriel'],
  vocabulary: [
    { id: 'tisch', word: 'Tisch', article: 'der', plural: 'Tische', partOfSpeech: 'noun', translation: 'la table', example: 'Der Tisch ist groß.', note: null },
    { id: 'stuhl', word: 'Stuhl', article: 'der', plural: 'Stühle', partOfSpeech: 'noun', translation: 'la chaise', example: 'Da ist kein Stuhl.', note: null },
    { id: 'kuli', word: 'Kuli', article: 'der', plural: 'Kulis', partOfSpeech: 'noun', translation: 'le stylo à bille', example: 'Hier ist ein Kuli.', note: 'forme courte de der Kugelschreiber' },
    { id: 'bleistift', word: 'Bleistift', article: 'der', plural: 'Bleistifte', partOfSpeech: 'noun', translation: 'le crayon', example: 'Hier ist ein Bleistift.', note: null },
    { id: 'tafel', word: 'Tafel', article: 'die', plural: 'Tafeln', partOfSpeech: 'noun', translation: 'le tableau', example: 'Die Tafel ist digital.', note: null },
    { id: 'lampe', word: 'Lampe', article: 'die', plural: 'Lampen', partOfSpeech: 'noun', translation: 'la lampe', example: 'Das ist eine Lampe.', note: null },
    { id: 'tuer', word: 'Tür', article: 'die', plural: 'Türen', partOfSpeech: 'noun', translation: 'la porte', example: 'Die Tür ist offen.', note: null },
    { id: 'uhr', word: 'Uhr', article: 'die', plural: 'Uhren', partOfSpeech: 'noun', translation: 'l’horloge, la montre ; l’heure (dans « acht Uhr »)', example: 'Die Uhr ist neu. Es ist acht Uhr.', note: null },
    { id: 'tasche', word: 'Tasche', article: 'die', plural: 'Taschen', partOfSpeech: 'noun', translation: 'le sac', example: 'In meiner Tasche ist ein Handy.', note: null },
    { id: 'buch', word: 'Buch', article: 'das', plural: 'Bücher', partOfSpeech: 'noun', translation: 'le livre', example: 'Das Buch ist für alle.', note: null },
    { id: 'heft', word: 'Heft', article: 'das', plural: 'Hefte', partOfSpeech: 'noun', translation: 'le cahier', example: 'Das ist kein Heft.', note: null },
    { id: 'woerterbuch', word: 'Wörterbuch', article: 'das', plural: 'Wörterbücher', partOfSpeech: 'noun', translation: 'le dictionnaire', example: 'Das ist ein Wörterbuch.', note: null },
    { id: 'handy', word: 'Handy', article: 'das', plural: 'Handys', partOfSpeech: 'noun', translation: 'le téléphone portable', example: 'Im Kurs ist mein Handy aus.', note: null },
    { id: 'fenster', word: 'Fenster', article: 'das', plural: 'Fenster', partOfSpeech: 'noun', translation: 'la fenêtre', example: 'Das Fenster ist offen.', note: null },
    { id: 'kurs', word: 'Kurs', article: 'der', plural: 'Kurse', partOfSpeech: 'noun', translation: 'le cours', example: 'Der Kurs beginnt um neun Uhr.', note: null },
    { id: 'hausaufgabe', word: 'Hausaufgabe', article: 'die', plural: 'Hausaufgaben', partOfSpeech: 'noun', translation: 'le devoir (à la maison)', example: 'Ich habe heute keine Hausaufgaben.', note: null },
    { id: 'bibliothek', word: 'Bibliothek', article: 'die', plural: 'Bibliotheken', partOfSpeech: 'noun', translation: 'la bibliothèque', example: 'Am Freitag lerne ich in der Bibliothek.', note: null },
    { id: 'woche', word: 'Woche', article: 'die', plural: 'Wochen', partOfSpeech: 'noun', translation: 'la semaine', example: 'Hier ist meine Woche.', note: null },
    { id: 'montag', word: 'Montag', article: 'der', plural: 'Montage', partOfSpeech: 'noun', translation: 'le lundi', example: 'Der Kurs ist am Montag.', note: 'tous les jours sont masculins : am Montag, am Dienstag…' },
    { id: 'wochenende', word: 'Wochenende', article: 'das', plural: 'Wochenenden', partOfSpeech: 'noun', translation: 'le week-end', example: 'Am Wochenende habe ich keine Kurse.', note: null },
    { id: 'beginnen', word: 'beginnen', article: null, plural: null, partOfSpeech: 'verb', translation: 'commencer', example: 'Wir beginnen um neun Uhr.', note: 'der Kurs beginnt' },
    { id: 'studieren', word: 'studieren', article: null, plural: null, partOfSpeech: 'verb', translation: 'faire des études', example: 'Was studieren Sie?', note: 'à l’université ; ich studiere Medizin (sans article)' },
    { id: 'lernen', word: 'lernen', article: null, plural: null, partOfSpeech: 'verb', translation: 'apprendre, réviser', example: 'Wir lernen Deutsch.', note: null },
    { id: 'kein', word: 'kein', article: null, plural: null, partOfSpeech: 'other', translation: 'pas de, pas un', example: 'Das ist kein Heft. Das ist keine Lampe.', note: 'nie un nom : kein (masc., neutre), keine (fém., pluriel)' },
    { id: 'wie-spaet', word: 'Wie spät ist es?', article: null, plural: null, partOfSpeech: 'expression', translation: 'Quelle heure est-il ?', example: 'Wie spät ist es? – Es ist zehn Uhr.', note: null },
  ],
  activities: {
    'a1-kurs-wortschatz': { title: 'Découvrir : les objets de la salle de cours', estimatedMinutes: 12, lesson: { title: 'Découvrir : les objets de la salle de cours' } },
    'a1-kurs-dib-unterricht': {
      title: 'Écouter et répéter : sur le bureau et en cours (voix natives)',
      estimatedMinutes: 10,
      lesson: { title: 'Écouter et répéter : sur le bureau et en cours (voix natives)' },
    },
    'a1-kurs-dialog': { title: 'Comprendre : avant le premier cours', estimatedMinutes: 12, lesson: { title: 'Comprendre : avant le premier cours' } },
    'a1-kurs-woche': { title: 'Découvrir : la semaine, l’heure et les matières', estimatedMinutes: 12, lesson: { title: 'Découvrir : la semaine, l’heure et les matières' } },
    // J, z, sch, sp et st sont travaillés dans a1-rythme ; les mots de cette leçon (aliments) sortent du thème : retirée pour faire place à la répétition.
    'a1-kurs-aussprache': null,
    'a1-kurs-lesen': {
      explanations: {
        q1: 'Chloé écrit « Ich bin jetzt in Wien und studiere hier Biologie ». La chimie et l’allemand sont des cours de sa semaine, pas sa matière d’études.',
        q2: '« Am Dienstag und am Donnerstag habe ich Deutsch, von neun bis zwölf Uhr. » Le lundi, Chloé a chimie ; le mercredi, biologie ; le vendredi, aucun cours.',
        q3: '« Am Montag habe ich um acht Uhr Chemie. Das ist sehr früh! » Neun et zwölf Uhr sont les horaires du cours d’allemand, dreizehn Uhr le début de la biologie.',
        q4: '« Am Freitag habe ich keine Kurse. Dann lerne ich in der Bibliothek. » Keine Kurse veut dire « pas de cours » ; lernen, c’est étudier, réviser.',
        q5: '« Da sind ein Bett, ein Tisch und eine Lampe, aber kein Stuhl. » Kein Stuhl : il n’y a pas de chaise. Les trois autres meubles sont dans la chambre.',
      },
    },
    'a1-kurs-hoeren': {
      estimatedMinutes: 12,
      competences: ['ecoute', 'expression-ecrite'],
      lesson: {
        description: 'Écoutez les cinq petites scènes (vous pouvez réécouter autant de fois que nécessaire), puis répondez aux questions. Soyez attentif aux jours, aux heures et aux nombres. Les deux dernières questions sont des dictées : écoutez la phrase et écrivez-la, avec les majuscules des noms. La transcription s’affichera après votre réponse.',
      },
      explanations: {
        q1: 'Paul dit « Ich brauche ein Lineal für die Übung » : das Lineal est la règle. Sara lui propose un crayon (ein Bleistift), mais Paul en a déjà un.',
        q2: 'Tobias répond « Es ist zehn Uhr fünfzehn » : on dit l’heure, puis Uhr, puis les minutes. 11 h est l’heure du cours de Lina.',
        q3: 'Le secrétariat annonce « nicht am Mittwoch, sondern am Donnerstag, um vierzehn Uhr » : nicht … sondern veut dire « pas … mais ». Zwölf est le numéro de la nouvelle salle, pas l’heure.',
        q4: 'David dit « Ich studiere Mathematik ». C’est Nina qui étudie la musique (« Ich studiere Musik »).',
        q5: 'Frau Brandt constate « wir sind heute sechzehn Personen. Aber hier sind nur zwölf Stühle! » : 16 personnes pour 12 chaises. Vierzehn est le numéro de l’autre salle.',
      },
      addQuestions: [
        {
          id: 'q6', type: 'dictation', prompt: 'Dictée : écoutez la phrase sur l’horaire du cours et écrivez-la.',
          accept: ['Der Kurs beginnt am Montag um neun Uhr.'], voice: 'frau',
          explanation: 'On dit am + jour, puis um + heure : am Montag um neun Uhr. Kurs, Montag et Uhr sont des noms : ils prennent une majuscule. Le nombre peut s’écrire en chiffres (9).',
        },
        {
          id: 'q7', type: 'dictation', prompt: 'Dictée : écoutez la phrase sur le matériel et écrivez-la.',
          accept: ['Ich habe kein Wörterbuch, aber zwei Hefte.'], voice: 'mann',
          explanation: 'Das Wörterbuch est neutre : on le nie avec kein. Hefte est le pluriel de das Heft (-e). N’oubliez pas le ö de Wörterbuch ni la majuscule des noms.',
        },
      ],
    },
    'a1-kurs-was-ist-das': {
      explanations: {
        q1: 'Le dessin montre un écran, un clavier et une souris : c’est un ordinateur, der Computer. Le nom est masculin, d’où ein Computer.',
        q2: 'Les noms masculins en -er ne prennent pas de terminaison au pluriel : der Computer → die Computer. Seul l’article change ; ni -s ni -n ne s’ajoutent.',
        q3: 'On entend « der Bildschirm, die Bildschirme » : pluriel en -e, comme der Tisch → die Tische.',
        q4: 'On entend « die Digitalkamera, die Digitalkameras » : les mots en -a et beaucoup de mots étrangers font leur pluriel en -s (die Kameras, die Handys).',
        q5: 'Lampe est féminin (die Lampe) : l’article indéfini est donc eine. « Ein Lampe » est faux, car ein ne s’emploie qu’avec un nom masculin ou neutre.',
        q6: 'Pour nier un nom précédé de ein, on emploie kein : der Stuhl est masculin, donc kein Stuhl. Keine va avec un nom féminin, et nicht ne nie pas un nom de cette façon.',
        q7: 'Les étiquettes disent « Wörterbücher » : das Wörterbuch fait son pluriel comme das Buch, en -er avec tréma. Après « Das sind », le pluriel s’emploie sans article.',
      },
    },
    'a1-kurs-studium-lesen': {
      explanations: {
        q1: 'Inès écrit « An vielen Unis in Deutschland bezahlt man keine Studiengebühren ». La cotisation semestrielle (der Semesterbeitrag), elle, se paie : 250 euros.',
        q2: '« Das Semesterticket ist auch dabei » : l’abonnement de bus et de tramway est compris dans la cotisation. Les livres, Inès les lit à la bibliothèque.',
        q3: '« Es kostet 310 Euro im Monat » : im Monat veut dire « par mois ». 250 euros par semestre, c’est la cotisation ; 3 euros, le prix d’un repas.',
        q4: '« Sie ist von Montag bis Samstag offen, von 8 bis 22 Uhr. » La bibliothèque est donc fermée le dimanche, et elle ferme à 22 h, pas à midi.',
        q5: '« Am Freitag und am Samstag arbeite ich in einem Café. » Inès ne parle pas du dimanche.',
        q6: 'Inès explique « Das ist Geld vom Staat für Studenten » : der Staat est l’État. L’abonnement de transport, c’est le Semesterticket.',
      },
    },
    'a1-kurs-netz-hoeren': {
      explanations: {
        q1: 'Jonas dit « Ich schicke jeden Tag viele Nachrichten » : schicken veut dire « envoyer » et die Nachricht « le message ». Les vidéos et les podcasts, c’est Amira.',
        q2: '« Aber im Kurs ist mein Handy aus » : aus veut dire « éteint ». C’est Herr Becker qui éteint son téléphone le week-end.',
        q3: 'Amira dit « von zwanzig bis zweiundzwanzig Uhr », de 20 h à 22 h. Dans zweiundzwanzig, l’unité vient d’abord : zwei + zwanzig = 22.',
        q4: '« Und im Bus höre ich Podcasts » : hören veut dire « écouter ». Les vidéos en allemand, Amira les regarde le soir.',
        q5: '« Dort teilen wir Fotos von der Tafel » : teilen veut dire « partager » et die Tafel « le tableau ».',
        q6: 'Herr Becker dit « am Samstag und am Sonntag ist mein Handy aus. Kein Internet, keine E-Mails! » Il travaille sur l’ordinateur seulement du lundi au vendredi.',
      },
    },
    'a1-kurs-grammatik': {
      title: 'S’entraîner : articles, ein, kein et pluriel',
      estimatedMinutes: 12,
      lesson: {
        title: 'S’entraîner : articles, ein, kein et pluriel',
        description: 'Choisissez ou écrivez la forme qui complète chaque phrase. Rappel : der (masculin), die (féminin), das (neutre), die (pluriel) ; ein et kein (masculin et neutre), eine et keine (féminin), keine (pluriel) ; am + jour, um + heure ; le pronom suit le genre allemand : der → er, die → sie, das → es.',
      },
      explanations: {
        q1: 'Das Fenster est neutre, même si « la fenêtre » est féminin en français : il faut apprendre chaque nom avec son article. Die serait le féminin ou le pluriel.',
        q2: 'Lampe est féminin (die Lampe) : « une » se dit eine. Ein va avec un nom masculin ou neutre, et kein nierait la phrase.',
        q3: 'Kein nie un nom masculin ou neutre qui aurait ein : ein Heft → kein Heft. Keine va avec un féminin ou un pluriel, et nicht ne se place pas devant un nom de cette façon.',
        q4: 'Au pluriel, l’article est toujours die, et Buch prend -er avec tréma : die Bücher. « Das Bücher » garde à tort l’article du singulier.',
        q5: 'On dit am + jour et um + heure : am Montag um neun Uhr. Le jour vient d’abord, puis l’heure.',
        q6: 'Le pronom suit le genre allemand, pas le français : der Tisch est masculin, donc er. Sie remplacerait un nom féminin (die Tafel) et es un nom neutre (das Buch).',
      },
      addQuestions: [
        {
          id: 'q7', type: 'fill', prompt: 'Complétez avec l’article défini : der, die ou das.',
          text: '[[1]] Tafel ist neu, [[2]] Fenster ist offen und [[3]] Stuhl ist kaputt.',
          blanks: [{ id: '1', accept: ['Die'], size: 4, hint: null }, { id: '2', accept: ['das'], size: 4, hint: null }, { id: '3', accept: ['der'], size: 4, hint: null }],
          explanation: 'Le genre allemand ne suit pas le français : die Tafel (le tableau) est féminin, das Fenster (la fenêtre) neutre et der Stuhl (la chaise) masculin. Apprenez chaque nom avec son article.',
        },
        {
          id: 'q8', type: 'fill', prompt: 'Dans la chambre de Chloé, il y a une lampe, mais pas de chaise, et elle n’a pas de dictionnaire. Complétez avec eine, kein ou keine.',
          text: 'Im Zimmer ist [[1]] Lampe, aber [[2]] Stuhl. Und ich habe [[3]] Wörterbuch.',
          blanks: [{ id: '1', accept: ['eine'], size: 6, hint: null }, { id: '2', accept: ['kein'], size: 6, hint: null }, { id: '3', accept: ['kein'], size: 6, hint: null }],
          explanation: 'Die Lampe est féminin : eine Lampe. Der Stuhl et das Wörterbuch se nient avec kein, sans -e. Keine irait avec un féminin ou un pluriel (keine Bücher).',
        },
        {
          id: 'q9', type: 'match', prompt: 'Associez chaque nom à son pluriel.',
          pairs: [
            { left: 'der Tisch', right: 'die Tische' },
            { left: 'der Stuhl', right: 'die Stühle' },
            { left: 'die Lampe', right: 'die Lampen' },
            { left: 'das Buch', right: 'die Bücher' },
            { left: 'das Handy', right: 'die Handys' },
            { left: 'das Fenster', right: 'die Fenster' },
          ],
          explanation: 'Au pluriel, l’article est toujours die. Les terminaisons varient : -e (Tische), -e avec tréma (Stühle), -n (Lampen), -er avec tréma (Bücher), -s (Handys) ou aucune pour les mots en -er (Fenster).',
        },
        {
          id: 'q10', type: 'fill', prompt: 'Marta décrit sa salle de cours. Mettez les noms entre parenthèses au pluriel.',
          text: 'Im Kursraum sind zwölf [[1]], sechs [[2]] und zwei [[3]].',
          blanks: [
            { id: '1', accept: ['Stühle'], size: 8, hint: 'Stuhl' },
            { id: '2', accept: ['Tische'], size: 8, hint: 'Tisch' },
            { id: '3', accept: ['Fenster'], size: 8, hint: 'Fenster' },
          ],
          explanation: 'Der Stuhl prend -e et un tréma (Stühle), der Tisch prend -e (Tische), et das Fenster ne change pas, comme beaucoup de noms masculins et neutres en -er. Après un nombre, le nom est au pluriel, sans article.',
        },
      ],
    },
    'a1-kurs-sprechen': {
      kind: 'mission',
      title: 'Mission : présenter mon cours et ma semaine',
      estimatedMinutes: 20,
      competences: ['expression-orale', 'expression-ecrite'],
      lesson: {
        title: 'Mission : présenter mon cours et ma semaine',
        description: `Un nouvel ami germanophone veut savoir comment se passe votre semaine. Écoutez d’abord Marta, qui parle de son cours d’allemand.

MODÈLE
Hallo! Ich heiße Marta. Ich komme aus Spanien und studiere Architektur in Berlin. Mein Deutschkurs ist am Montag und am Mittwoch, von achtzehn bis zwanzig Uhr. Der Kursraum ist klein, aber schön. Da sind zwölf Stühle, sechs Tische und eine Tafel. In meiner Tasche sind ein Kursbuch, zwei Hefte, drei Kulis und ein Handy. Ich habe kein Wörterbuch aus Papier: Mein Wörterbuch ist eine App!

POUR VOUS AIDER
• Ich studiere … / Ich lerne Deutsch. / Ich arbeite in …
• Mein Deutschkurs ist am … von … bis … Uhr.
• Der Kursraum ist … Da sind … Stühle, … Tische und …
• In meiner Tasche sind …
• Da ist kein … / Da ist keine … / Ich habe kein …`,
      },
      mission: {
        oral: {
          prompt: 'Présentez votre cours en 45 à 60 secondes, comme Marta : vos études ou votre travail, les jours et les heures du cours, la salle (ce qu’il y a, ce qui manque) et ce qu’il y a dans votre sac. Dites chaque nom avec son article ou au pluriel.',
          maxSeconds: 90,
        },
        written: {
          prompt: 'Écrivez à un ami un message de six à huit phrases, comme Chloé : votre semaine (au moins trois jours avec des heures), vos cours ou votre travail, et votre salle de cours ou votre chambre.',
          maxChars: 900,
          minWords: 40,
        },
        checklist: [
          'J’ai donné au moins trois jours avec am et des heures avec um ou von … bis.',
          'J’ai décrit la salle ou ma chambre avec au moins deux noms au pluriel (Stühle, Tische…).',
          'J’ai employé kein ou keine pour dire ce qui manque.',
          'Chaque nom commence par une majuscule et a le bon article (der, die, das, ein, eine).',
          'Dans chaque phrase, le verbe conjugué est en deuxième position.',
        ],
      },
    },
  },
  add: [
    {
      after: 'a1-kurs-netz-hoeren',
      activity: {
        id: 'a1-kurs-repeter',
        kind: 'exercise',
        title: 'Répéter à voix haute : la salle, l’heure et les études',
        estimatedMinutes: 8,
        competences: ['expression-orale'],
        lesson: {
          title: 'Répéter à voix haute : la salle, l’heure et les études',
          description: 'Écoutez chaque modèle autant de fois que nécessaire, puis dites la phrase sans vous presser. Attention à trois sons : s devant une voyelle se dit comme un z français (Samstag), z se dit « ts » (zehn), et st en début de mot se dit « cht » (studiere).',
          transcript: null,
        },
        placements: [],
        questions: [
          speak('q1', 'Nein, das ist kein Heft. Das ist das Kursbuch.', 'Das Heft et das Kursbuch sont neutres : kein Heft, das Kursbuch. Le h de Heft se prononce comme un souffle, et le ch de Kursbuch, après u, se forme au fond de la gorge.'),
          speak('q2', 'Der Kurs beginnt am Montag um neun Uhr.', 'Accentuez les informations : MONtag, NEUN Uhr. Dans neun, eu se dit « oï » ; dans Uhr, le u est long.', ['Der Kurs beginnt am Montag um neun Uhr.', 'Der Kurs beginnt am Montag um 9 Uhr.']),
          speak('q3', 'Wie spät ist es? Es ist zehn Uhr.', 'Spät commence par « chp » et contient un ä long, proche de « è ». Zehn commence par « ts », jamais par un z français.', ['Wie spät ist es? Es ist zehn Uhr.', 'Wie spät ist es? Es ist 10 Uhr.']),
          speak('q4', 'Ich studiere Informatik und lerne Deutsch.', 'Studiere commence par « cht » : CHTOU-dié-re. Dans Deutsch, eu se dit « oï » et tsch se dit « tch ».'),
          speak('q5', 'Am Samstag habe ich keine Kurse.', 'Le s de Samstag, devant une voyelle, se prononce comme un z français : « zams-tak ». Keine Kurse : pluriel, donc keine.'),
          speak('q6', 'Die Bücher sind für alle.', 'Bücher et für contiennent un ü, qui se prononce comme le u français de « lune ». Sans tréma, on entendrait « ou » : Buch, au singulier.'),
        ],
      },
    },
  ],
  order: [
    'a1-kurs-wortschatz', 'a1-kurs-dib-unterricht', 'a1-kurs-dialog', 'a1-kurs-woche', 'a1-kurs-grammatik', 'a1-kurs-lesen',
    'a1-kurs-hoeren', 'a1-kurs-was-ist-das', 'a1-kurs-studium-lesen', 'a1-kurs-netz-hoeren', 'a1-kurs-repeter', 'a1-kurs-sprechen',
  ],
};
