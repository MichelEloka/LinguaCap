// Couche pédagogique V4 · A1 · Hast du Zeit ? Loisirs et rendez-vous.
const REPEAT = 'Écoutez le modèle, puis dites la phrase à voix haute.';
const speak = (id, text, explanation, accept = [text]) => ({ id, type: 'speak', prompt: REPEAT, text, accept, explanation });

export default {
  module: 'a1-freizeit',
  // Script aligné sur le texte affiché (« Und hier in Deutschland? »).
  media: [
    {
      key: "a1-freizeit-sport-audio-v3", kind: "audio", title: "Katrin pose des questions à Hugo sur le sport", credit: "LinguaCap, synthèse Piper avec Thorsten Müller (CC0) et Kerstin, préentraînée sur la voix de Cori Samuel (Hi-Fi TTS, CC BY 4.0)", license: "Jeux de données des voix : CC0 et CC BY 4.0",
      script: [
        { voice: "frau", name: "Katrin", text: "Hugo, machst du gern Sport?" },
        { pause: 0.6 },
        { voice: "mann", name: "Hugo", text: "Ja, sehr gern! In Frankreich spiele ich Volleyball im Verein." },
        { pause: 0.6 },
        { voice: "frau", name: "Katrin", text: "Und hier in Deutschland?" },
        { pause: 0.6 },
        { voice: "mann", name: "Hugo", text: "Hier will ich im Hochschulsport Volleyball spielen. Der Kurs ist am Montag von achtzehn bis zwanzig Uhr in der Turnhalle, und er ist kostenlos!" },
        { pause: 0.6 },
        { voice: "frau", name: "Katrin", text: "Wie oft machst du Sport?" },
        { pause: 0.6 },
        { voice: "mann", name: "Hugo", text: "Dreimal pro Woche. Am Montag spiele ich Volleyball, und am Mittwoch und am Freitag gehe ich joggen." },
        { pause: 0.6 },
        { voice: "frau", name: "Katrin", text: "Warum machst du so viel Sport?" },
        { pause: 0.6 },
        { voice: "mann", name: "Hugo", text: "Sport macht Spaß und ist gesund. Ich will fit bleiben. Und im Team finde ich schnell Freunde!" },
        { pause: 0.6 },
        { voice: "frau", name: "Katrin", text: "Siehst du auch gern Fußball?" },
        { pause: 0.6 },
        { voice: "mann", name: "Hugo", text: "Ja, aber in Frankreich nur im Fernsehen. Am Samstag gehe ich mit dir ins Stadion!" },
      ],
    },
  ],
  grammarFocus: ['koennen-wollen'],
  vocabulary: [
    { id: 'freizeit', word: 'Freizeit', article: 'die', plural: null, partOfSpeech: 'noun', translation: 'le temps libre', example: 'Was machst du gern in deiner Freizeit?', note: null },
    { id: 'hobby', word: 'Hobby', article: 'das', plural: 'Hobbys', partOfSpeech: 'noun', translation: 'le loisir, le passe-temps', example: 'Mein Hobby ist Musik.', note: null },
    { id: 'zeit', word: 'Zeit', article: 'die', plural: 'Zeiten', partOfSpeech: 'noun', translation: 'le temps (disponible)', example: 'Hast du am Samstag Zeit?', note: null },
    { id: 'spielen', word: 'spielen', article: null, plural: null, partOfSpeech: 'verb', translation: 'jouer', example: 'Wollen wir Volleyball spielen?', note: 'Fußball / Gitarre spielen' },
    { id: 'lesen', word: 'lesen', article: null, plural: null, partOfSpeech: 'verb', translation: 'lire', example: 'Am Abend will ich ein Buch lesen.', note: 'ich lese, du liest, er liest' },
    { id: 'schwimmen', word: 'schwimmen', article: null, plural: null, partOfSpeech: 'verb', translation: 'nager', example: 'Wollen wir schwimmen gehen?', note: null },
    { id: 'tanzen', word: 'tanzen', article: null, plural: null, partOfSpeech: 'verb', translation: 'danser', example: 'Wir wollen heute Abend tanzen.', note: null },
    { id: 'rad-fahren', word: 'Rad fahren', article: null, plural: null, partOfSpeech: 'verb', translation: 'faire du vélo', example: 'Wollen wir zusammen Rad fahren?', note: 'ich fahre Rad, du fährst Rad' },
    { id: 'treffen', word: 'treffen', article: null, plural: null, partOfSpeech: 'verb', translation: 'retrouver, rencontrer', example: 'Am Wochenende will ich Freunde treffen.', note: 'ich treffe, du triffst' },
    { id: 'spazieren-gehen', word: 'spazieren gehen', article: null, plural: null, partOfSpeech: 'verb', translation: 'se promener', example: 'Am Sonntag wollen wir spazieren gehen.', note: null },
    { id: 'koennen', word: 'können', article: null, plural: null, partOfSpeech: 'verb', translation: 'pouvoir ; savoir (faire)', example: 'Wir können im Park spielen.', note: 'ich kann, du kannst, er kann ; infinitif à la fin' },
    { id: 'wollen', word: 'wollen', article: null, plural: null, partOfSpeech: 'verb', translation: 'vouloir', example: 'Wollen wir ins Kino gehen?', note: 'ich will, du willst, er will ; infinitif à la fin' },
    { id: 'muessen', word: 'müssen', article: null, plural: null, partOfSpeech: 'verb', translation: 'devoir', example: 'Wir müssen heute lernen.', note: 'ich muss, du musst, er muss' },
    { id: 'gern', word: 'gern', article: null, plural: null, partOfSpeech: 'adverb', translation: 'volontiers ; aimer (faire)', example: 'Ich lese gern.', note: 'gern, lieber, am liebsten' },
    { id: 'lieber', word: 'lieber', article: null, plural: null, partOfSpeech: 'adverb', translation: 'plutôt ; préférer (faire)', example: 'Ich spiele lieber Volleyball als Tennis.', note: 'pour comparer : lieber … als …' },
    { id: 'leider', word: 'leider', article: null, plural: null, partOfSpeech: 'adverb', translation: 'malheureusement', example: 'Leider habe ich keine Zeit.', note: null },
    { id: 'zusammen', word: 'zusammen', article: null, plural: null, partOfSpeech: 'adverb', translation: 'ensemble', example: 'Wir trinken zusammen Kaffee.', note: null },
    { id: 'kino', word: 'Kino', article: 'das', plural: 'Kinos', partOfSpeech: 'noun', translation: 'le cinéma', example: 'Am Abend gehen wir ins Kino.', note: 'ins Kino = in das Kino' },
    { id: 'schwimmbad', word: 'Schwimmbad', article: 'das', plural: 'Schwimmbäder', partOfSpeech: 'noun', translation: 'la piscine', example: 'Ich gehe ins Schwimmbad.', note: null },
    { id: 'park', word: 'Park', article: 'der', plural: 'Parks', partOfSpeech: 'noun', translation: 'le parc', example: 'Wir spielen im Park Volleyball.', note: null },
    { id: 'spass', word: 'Spaß', article: 'der', plural: null, partOfSpeech: 'noun', translation: 'le plaisir, l’amusement', example: 'Das macht Spaß!', note: 'Das macht Spaß : c’est amusant' },
    { id: 'wetter', word: 'Wetter', article: 'das', plural: null, partOfSpeech: 'noun', translation: 'le temps (météo)', example: 'Wie ist das Wetter heute?', note: null },
    { id: 'sonne', word: 'Sonne', article: 'die', plural: null, partOfSpeech: 'noun', translation: 'le soleil', example: 'Die Sonne scheint.', note: null },
    { id: 'regnen', word: 'regnen', article: null, plural: null, partOfSpeech: 'verb', translation: 'pleuvoir', example: 'Am Samstag kann es regnen.', note: 'es regnet : il pleut' },
    { id: 'kalt', word: 'kalt', article: null, plural: null, partOfSpeech: 'adjective', translation: 'froid', example: 'Im Winter ist es kalt.', note: null },
  ],
  activities: {
    'a1-freizeit-wortschatz': {
      title: 'Découvrir : loisirs, sorties et météo',
      estimatedMinutes: 15,
      lesson: {
        title: 'Découvrir : loisirs, sorties et météo',
        description: `Pour parler du temps libre, on demande : « Was machst du gern in deiner Freizeit? » (Qu’est-ce que tu aimes faire pendant ton temps libre ?). Ici, l’allemand n’emploie pas de verbe « aimer » : on ajoute le petit mot « gern » après le verbe de l’activité. Ich lese gern. — J’aime lire. Ich tanze nicht gern. — Je n’aime pas danser.

LES LOISIRS
• Musik hören — écouter de la musique
• lesen — lire
• fernsehen — regarder la télévision (ich sehe fern)
• Computerspiele spielen — jouer aux jeux vidéo
• kochen — faire la cuisine
• malen — peindre
• tanzen — danser   • singen — chanter
• Gitarre spielen / Klavier spielen — jouer de la guitare / du piano
• Freunde treffen — retrouver des amis
• spazieren gehen — se promener
• reisen — voyager

LES SPORTS
• Sport machen — faire du sport
• Fußball / Tennis / Volleyball spielen — jouer au football / au tennis / au volley
• schwimmen — nager
• Rad fahren — faire du vélo (ich fahre Rad)
• joggen — courir, faire du jogging
• wandern — faire de la randonnée

SORTIR : WOHIN GEHST DU?
• ins Kino — au cinéma (das Kino)
• ins Theater — au théâtre (das Theater)
• ins Konzert — au concert (das Konzert)
• ins Museum — au musée (das Museum)
• ins Schwimmbad — à la piscine (das Schwimmbad)
• in die Disco — en boîte de nuit (die Disco)
• in die Kneipe — au bar, au bistrot (die Kneipe)
• in den Park — au parc (der Park)
• essen gehen — aller au restaurant
Pour dire où l’on va, on emploie « in » + l’article à l’accusatif : ins (= in das) devant un nom neutre, in die devant un nom féminin, in den devant un nom masculin.

DONNER SON AVIS
• Das macht Spaß! — C’est amusant ! Ça me plaît !
• Das ist interessant / langweilig / gesund / teuer. — C’est intéressant / ennuyeux / bon pour la santé / cher.

LE TEMPS QU’IL FAIT
Le temps décide souvent de nos sorties : quand il pleut, on va au cinéma ; quand il fait beau, on va à la piscine ou au parc. Pour demander quel temps il fait : « Wie ist das Wetter heute? »
• Die Sonne scheint. / Es ist sonnig. — Il y a du soleil.
• Es ist bewölkt. — Le ciel est nuageux.
• Es regnet. — Il pleut.   • Es schneit. — Il neige.
• Es ist windig. — Il y a du vent.
• Es ist heiß / warm / kühl / kalt. — Il fait très chaud / chaud / frais / froid.
• Es sind 18 Grad. / Es sind minus 3 Grad. — Il fait 18 degrés / moins 3 degrés.
• Das Wetter ist schön / schlecht. — Il fait beau / mauvais.
Comme « il » dans « il pleut », « es » est un sujet impersonnel : Es regnet. Es schneit. Avec « Grad », le verbe est au pluriel : Es sind 20 Grad.

À VOUS
1. Écoutez le premier enregistrement et répétez chaque expression à voix haute.
2. Dites trois choses que vous aimez faire et une chose que vous n’aimez pas faire : Ich koche gern. Ich schwimme gern. Ich höre gern Musik. Ich tanze nicht gern.
3. Écoutez le second enregistrement, sur la météo, et répétez chaque phrase. Dites ensuite quel temps il fait aujourd’hui et ce que vous faites : Es regnet. Ich gehe ins Kino.`,
      },
      placements: {
        add: [
          { media: 'a1-freizeit-wetter-bild', usage: 'illustration', transcriptVisibility: 'hidden', decorative: false },
          { media: 'a1-freizeit-wetter-audio-v3', usage: 'audio', transcriptVisibility: 'on_demand', decorative: false },
        ],
      },
    },
    // La météo rejoint la leçon de vocabulaire (même image et même son) : le module garde 12 activités avec la répétition.
    'a1-freizeit-wetter': null,
    'a1-freizeit-nachsprechen': { estimatedMinutes: 10 },
    'a1-freizeit-dialog': { title: 'Comprendre : des projets pour samedi', estimatedMinutes: 12, lesson: { title: 'Comprendre : des projets pour samedi' } },
    'a1-freizeit-lesen': {
      explanations: {
        q1: 'Jana écrit « Ich spiele sehr gern Tennis, aber ich habe keinen Partner ». Les échecs (Schach) et les cartes (Karten) apparaissent dans l’annonce de Tobias.',
        q2: '« Ich habe mittwochs und freitags ab 18 Uhr Zeit » : mittwochs veut dire « le mercredi, chaque semaine » et ab 18 Uhr « à partir de 18 h ». Le jeudi à 19 h, c’est la soirée jeux de Tobias.',
        q3: 'Tobias écrit « Wir spielen jeden Donnerstag um 19 Uhr im Café Linde ». Le centre culturel est seulement l’endroit où les annonces sont affichées.',
        q4: 'Ayla écrit « Ich bin neu in Leipzig » et « allein macht das keinen Spaß » : sortir seule ne l’amuse pas. Elle travaille le samedi jusqu’à 16 h, mais elle ne cherche pas de travail.',
        q5: 'La soirée jeux de Tobias a lieu le jeudi à 19 h et « Am liebsten spielen wir Schach » : Schach, ce sont les échecs. Jana joue au tennis et Ayla veut sortir le week-end.',
      },
    },
    'a1-freizeit-hoeren': {
      title: 'Écouter et écrire : rendez-vous et météo',
      estimatedMinutes: 12,
      competences: ['ecoute', 'expression-ecrite'],
      lesson: {
        title: 'Écouter et écrire : rendez-vous et météo',
        description: 'Écoutez les quatre petites scènes : un appel, un bulletin météo à la radio, une conversation entre amis et un message vocal. Vous pouvez réécouter autant de fois que nécessaire, puis répondez aux questions. Ensuite, associez les phrases de Lena à leur sens et écrivez les deux phrases dictées. La transcription s’affichera après votre réponse.',
      },
      explanations: {
        q1: 'Sara répond « Ich habe morgen eine Prüfung und muss lernen » : eine Prüfung est un examen et lernen veut dire ici réviser. Elle ne parle ni de travail ni de maladie.',
        q2: 'Sara est libre « am Freitag ». Le film commence à 20 h et Paul propose « um Viertel vor acht vor dem Kino » : Viertel vor acht = 19 h 45, vor dem Kino = devant le cinéma.',
        q3: 'Pour dimanche, la radio annonce « Die Sonne scheint, und es sind vierzehn Grad ». La pluie et le vent sont prévus pour samedi, et personne ne parle de neige.',
        q4: 'Lena dit « Ich gehe lieber joggen. Aber am liebsten schwimme ich » : am liebsten désigne l’activité préférée entre toutes. Le jogging n’est qu’une préférence face au football.',
        q5: 'Emma annule le tennis de dimanche, car ses parents viennent, et propose « Wollen wir am Dienstag um achtzehn Uhr spielen? ». Il s’agit toujours de tennis, pas de cinéma.',
      },
      addQuestions: [
        {
          id: 'q6', type: 'match', prompt: 'Lena parle de ses sports. Associez chaque phrase à son sens.',
          pairs: [
            { left: 'Ich spiele nicht so gern Fußball.', right: 'Je n’aime pas trop jouer au football.' },
            { left: 'Ich schwimme gern.', right: 'J’aime nager.' },
            { left: 'Ich gehe lieber joggen.', right: 'Je préfère aller courir.' },
            { left: 'Am liebsten schwimme ich.', right: 'Ce que je préfère par-dessus tout, c’est nager.' },
          ],
          explanation: 'Gern = aimer faire ; nicht so gern = ne pas trop aimer ; lieber = préférer ; am liebsten = préférer entre toutes. Ces mots suivent le verbe, sauf am liebsten, qui peut ouvrir la phrase.',
        },
        {
          id: 'q7', type: 'dictation', prompt: 'Écoutez et écrivez la phrase.', voice: 'sprecherin',
          accept: ['Am Sonntag scheint die Sonne.'],
          explanation: 'La phrase commence par Am Sonntag : le verbe scheint reste en 2e position et le sujet die Sonne passe après lui. Sonntag et Sonne sont des noms : majuscule.',
        },
        {
          id: 'q8', type: 'dictation', prompt: 'Écoutez et écrivez la question.', voice: 'mann',
          accept: ['Wollen wir am Freitag ins Kino gehen?'],
          explanation: 'Pour proposer, « Wollen wir … ? » : le modal ouvre la question et l’infinitif gehen la termine. Ins = in das, devant das Kino.',
        },
      ],
    },
    'a1-freizeit-stadion': {
      estimatedMinutes: 10,
      explanations: {
        q1: 'Katrin dit « Das Spiel beginnt um halb vier ». Halb regarde vers l’heure suivante : halb vier = 3 h 30, soit 15 h 30. Un francophone comprend souvent 16 h 30 (« quatre et demie »).',
        q2: 'Katrin annonce « ein Stehplatz nur zwölf Euro » et Hugo répond « Dann nehme ich einen Stehplatz », car il est étudiant. La place assise (Sitzplatz) coûte 25 €.',
        q3: 'Hugo propose le vélo (« Mit dem Rad? »), mais Katrin répond « Nein, mit dem Bus » : un bus part de la gare directement pour le stade.',
        q4: 'Katrin explique que « das Ticket für das Spiel ist auch eine Fahrkarte für den Bus » : le billet du match sert de titre de transport. Le bus n’est pas gratuit en soi.',
        q5: '« Flaschen sind im Stadion verboten » : les bouteilles sont interdites. En revanche, « dort kann man etwas trinken und eine Bratwurst essen » : on peut y acheter à boire et à manger.',
        q6: '« Um Viertel vor drei am Bahnhof, an der Bushaltestelle » : Viertel vor drei = 14 h 45, à l’arrêt de bus de la gare. 15 h 30 est l’heure du début du match.',
      },
    },
    'a1-freizeit-sportarten': {
      explanations: {
        q1: 'La canne à pêche (die Angel) et le poisson montrent angeln, pêcher à la ligne. Reiten se fait à cheval et kegeln avec des quilles.',
        q2: 'Une boule qui roule vers des quilles : c’est kegeln, le jeu de quilles allemand, proche du bowling. Le billard se joue sur une table, avec une queue.',
        q3: 'Une table, une queue et des boules en triangle : on joue au billard, Billard spielen. Comme pour les autres jeux de balle, on emploie spielen.',
        q4: 'Un voilier sur l’eau : on peut y faire de la voile, segeln gehen. Le cheval (reiten) et le golf (Golf spielen) se pratiquent sur la terre ferme.',
        q5: 'Un terrain en herbe, deux buts et un ballon : sie spielen Fußball. Le basket se joue avec des paniers, et le golf ne se joue pas en équipe autour d’un ballon.',
        q6: 'On entend « der Fußball, die Fußbälle » : pluriel en -e avec tréma (a → ä), comme der Ball, die Bälle. Fußballs n’existe pas et Fußbällen est la forme du datif pluriel.',
        q7: 'L’enregistrement dit « das Pferd, die Pferde » : pluriel en -e. Le pluriel en -s concerne surtout des mots venus de l’anglais, comme das Hobby, die Hobbys.',
      },
    },
    'a1-freizeit-sport': {
      title: 'Découvrir : le sport à l’université et en club',
      estimatedMinutes: 10,
      competences: ['lecture', 'ecoute', 'expression-orale'],
      lesson: {
        title: 'Découvrir : le sport à l’université et en club',
        description: `Hugo veut faire du sport pendant son semestre en Allemagne. Lisez le programme du sport universitaire, écoutez Hugo répondre aux questions de Katrin, puis préparez votre propre présentation.

BON À SAVOIR
Contrairement aux universités américaines, les universités allemandes n’ont pas de grandes équipes sportives ni de bourses pour les sportifs. Mais le « Hochschulsport » (le sport universitaire) propose beaucoup de cours, gratuits ou bon marché, à tous les étudiants. Beaucoup d’Allemands font aussi du sport dans un club, « der Verein » (der Sportverein, der Fußballverein) : on devient membre (das Mitglied) et on paie une cotisation.

HOCHSCHULSPORT — UNSER PROGRAMM
• Volleyball: Montag, 18–20 Uhr, in der Turnhalle — kostenlos
• Yoga: Dienstag, 17–18 Uhr, im Sportzentrum — 15 € pro Semester
• Schwimmen: Mittwoch, 7–8 Uhr, im Schwimmbad — 10 € pro Semester
• Fußball: Donnerstag, 19–21 Uhr, auf dem Sportplatz — kostenlos
• Fitnessstudio: Montag bis Freitag, 8–22 Uhr — 30 € pro Semester
(die Turnhalle — le gymnase ; der Sportplatz — le terrain de sport ; kostenlos — gratuit)

MODÈLE
Katrin : Hugo, machst du gern Sport?
Hugo : Ja, sehr gern! In Frankreich spiele ich Volleyball im Verein.
Katrin : Und hier in Deutschland?
Hugo : Hier will ich im Hochschulsport Volleyball spielen. Der Kurs ist am Montag von 18 bis 20 Uhr in der Turnhalle, und er ist kostenlos!
Katrin : Wie oft machst du Sport?
Hugo : Dreimal pro Woche. Am Montag spiele ich Volleyball, und am Mittwoch und am Freitag gehe ich joggen.
Katrin : Warum machst du so viel Sport?
Hugo : Sport macht Spaß und ist gesund. Ich will fit bleiben. Und im Team finde ich schnell Freunde!
Katrin : Siehst du auch gern Fußball?
Hugo : Ja, aber in Frankreich nur im Fernsehen. Am Samstag gehe ich mit dir ins Stadion!

WIE OFT? — À QUELLE FRÉQUENCE ?
• jeden Tag — tous les jours   • einmal pro Woche — une fois par semaine
• zweimal, dreimal pro Woche — deux, trois fois par semaine
• oft — souvent   • manchmal — parfois   • selten — rarement   • nie — jamais
• montags — le lundi (tous les lundis)   • am Wochenende — le week-end

WO? — OÙ ?
• im Fitnessstudio, im Sportzentrum, im Schwimmbad, im Park, im Verein
• in der Turnhalle — au gymnase   • auf dem Sportplatz — sur le terrain de sport
Pour dire où l’on va, on dit « ins Schwimmbad » (voir « Wohin gehst du? ») ; pour dire où l’on fait du sport, on dit « im Schwimmbad ».

WARUM? — POURQUOI ?
• Sport macht Spaß.   • Sport ist gesund.   • Ich will fit bleiben.
• Im Team finde ich Freunde.   • Ich habe leider keine Zeit.

À VOUS
1. Lisez le modèle à voix haute en jouant Katrin, puis Hugo.
2. Choisissez un cours dans le programme du Hochschulsport et présentez-le à voix haute en trois ou quatre phrases : quoi, quand, où, combien, pourquoi. Exemple : Ich will Yoga machen. Der Kurs ist am Dienstag von 17 bis 18 Uhr im Sportzentrum. Er kostet 15 Euro pro Semester. Yoga ist gesund!
3. Répondez à voix haute aux questions de Katrin, pour vous : Machst du gern Sport? Was machst du? Wie oft? Wo? Warum? Siehst du gern Sport im Fernsehen oder im Stadion?
Vérifiez : le verbe conjugué est-il en 2e position (Am Montag spiele ich Volleyball.) ? Avec « will » ou « kann », l’infinitif est-il bien à la fin (Ich will fit bleiben.) ?

Situation adaptée de Der und mehr (Kennesaw State University), CC BY 4.0.`,
      },
    },
    'a1-freizeit-grammatik': {
      title: 'S’entraîner : können, wollen, gern et lieber',
      estimatedMinutes: 12,
      lesson: {
        title: 'S’entraîner : können, wollen, gern et lieber',
        description: 'Choisissez ou écrivez la forme qui complète chaque phrase. Rappel : können → ich kann, du kannst, er/sie kann, wir können, ihr könnt ; wollen → ich will, du willst, er/sie will, wir wollen, ihr wollt ; müssen → ich muss, du musst, er/sie muss. Le deuxième verbe se met à l’infinitif, à la fin de la phrase. Pour remettre une phrase dans l’ordre, touchez les étiquettes dans l’ordre de la phrase.',
      },
      explanations: {
        q1: 'Le sujet est du : können fait du kannst. Kann va avec ich ou er/sie, können avec wir ou Sie, könnt avec ihr.',
        q2: 'Le sujet est wir, placé après le verbe parce que la phrase commence par Am Samstag : wir wollen. Will va avec ich ou er/sie, willst avec du, wollt avec ihr.',
        q3: 'Le modal conjugué kann est en 2e position et l’infinitif spielen à la fin : les deux verbes encadrent le reste. Placer spielen juste après kann, comme en français, est l’erreur typique.',
        q4: 'Pour comparer deux activités avec als, on emploie lieber (préférer) : Ich spiele lieber Fußball als Tennis. Gern dit seulement qu’on aime ; am liebsten désigne le favori absolu.',
        q5: 'Vous refusez et donnez la raison : « Leider nicht, am Samstag muss ich arbeiten ». Muss se construit comme kann, avec l’infinitif arbeiten à la fin. Les autres réponses acceptent l’invitation.',
        q6: 'Pour danser, on va en boîte : in die Disco (die Disco est féminin, d’où in die). Au musée, à la piscine ou au parc, on ne va pas pour danser.',
      },
      addQuestions: [
        {
          id: 'q7', type: 'fill', prompt: 'Complétez avec können ou wollen à la bonne forme.',
          text: 'Lukas [[1]] gut Volleyball spielen, aber Mira [[2]] es lernen.',
          blanks: [{ id: '1', accept: ['kann'], size: 7, hint: 'können' }, { id: '2', accept: ['will'], size: 7, hint: 'wollen' }],
          explanation: 'Lukas sait jouer (können), Mira a envie d’apprendre (wollen). Avec er ou sie, ces verbes n’ont pas de terminaison : er kann, sie will, comme avec ich. Kannt ou willt, sur le modèle de er spielt, n’existent pas.',
        },
        {
          id: 'q8', type: 'fill', prompt: 'Complétez la question et la réponse avec wollen et müssen.',
          text: '[[1]] du heute Abend ins Kino gehen? – Nein, ich [[2]] für meine Prüfung lernen.',
          blanks: [{ id: '1', accept: ['Willst'], size: 8, hint: 'wollen' }, { id: '2', accept: ['muss'], size: 7, hint: 'müssen' }],
          explanation: 'Avec du, wollen fait willst ; avec ich, müssen fait muss, sans terminaison. Dans une question oui/non, le modal ouvre la phrase et l’infinitif (gehen, lernen) la termine.',
        },
        {
          id: 'q9', type: 'order', prompt: 'Remettez les mots dans l’ordre pour proposer une activité.',
          answers: [
            ['Am Samstag', 'können', 'wir', 'im Park', 'Volleyball', 'spielen.'],
            ['Am Samstag', 'können', 'wir', 'Volleyball', 'im Park', 'spielen.'],
          ],
          explanation: 'Après Am Samstag, le modal können prend la 2e place et le sujet wir le suit. L’infinitif spielen ferme la phrase. Placer spielen juste après können, comme en français, est fautif.',
        },
        {
          id: 'q10', type: 'order', prompt: 'Remettez la question dans l’ordre.',
          answers: [['Willst', 'du', 'heute Abend', 'ins Kino', 'gehen?']],
          explanation: 'Question oui/non : le modal willst est en 1re position, le sujet du le suit et l’infinitif gehen va tout à la fin. Le moment (heute Abend) se place avant le lieu (ins Kino).',
        },
      ],
    },
    'a1-freizeit-aussprache-r': {
      lesson: {
        description: `Bonne nouvelle pour les francophones : le « r » allemand ressemble beaucoup au « r » français ! Mais selon sa place dans le mot, il se prononce de trois façons. Ce module en est plein : die Freizeit, Rad fahren, der Sport, das Theater, lieber.

1. LE R DE GORGE — en début de mot, après une consonne ou entre deux voyelles
die Reise, das Restaurant, der Rock, die Freizeit, die Freunde, hören, spazieren
Il se prononce au fond de la gorge, comme le « r » de « Paris », avec un frottement un peu plus léger. Inutile de le rouler avec la pointe de la langue : ce r roulé s’entend dans certaines régions (en Bavière, en Autriche, en Suisse), mais ce n’est pas la prononciation standard.

2. LE R ADOUCI — après une voyelle, devant une consonne
die Karten, der Garten, ihr fahrt, das Konzert, der Park, die Shorts, die Sportjacke
Le r perd son frottement et se fond dans la voyelle qui précède : on l’entend à peine. Piège : ne prononcez pas un r français bien appuyé ; Karten ressemble plutôt à « Kaaten ».

3. LE R VOYELLE — dans la terminaison -er
der Computer, klettern, das Theater, die Oper, die Kleider, der Pullover, der Sportler
La finale -er devient un petit « a » bref et ouvert : Computer sonne presque comme « Compiouta », Theater comme « té-A-ta ». Piège : -er ne se prononce jamais « eur », ni « é » comme dans les verbes français en -er.

APRÈS U, Ü, O, Ö, I
Quand le r suit une de ces voyelles longues, en fin de mot ou devant une consonne, il s’entend presque comme une petite syllabe « a » : nur, die Uhr, für, die Tür, vor, das Tor, die Körbe, die Hörner. C’est aussi le cas dans des mots très fréquents : wir, ihr, mir, hier.

LES ENREGISTREMENTS
1. Trois mots qui montrent les trois r : die Reise (r de gorge), die Karten (r adouci), der Computer (r voyelle).
2. Dix-huit mots en trois séries de six, dans l’ordre des parties 1, 2 et 3 ci-dessus.
3. Huit mots où le r final se fait « a » : nur, die Uhr, für, die Tür, vor, das Tor, die Körbe, die Hörner.

À VOUS
1. Écoutez chaque série et répétez les mots pendant la pause.
2. Comparez à voix haute : die Reise — die Karten — der Computer ; der Rock — der Park — der Pullover.
3. Lisez ces phrases à voix haute, lentement, puis plus vite : Am Freitag fahren wir Rad. Hörst du gern Musik? Ich gehe lieber ins Theater. Wir spielen im Park Karten. Um vier Uhr klettern wir.
4. Relisez-les en vérifiant la finale -er : un petit « a », jamais « eur ». Vous retrouverez plusieurs de ces phrases dans l’exercice de répétition.

Enregistrements et images : Deutsch im Blick (COERLL, Université du Texas à Austin), CC BY 4.0.`,
      },
    },
    'a1-freizeit-sprechen': {
      kind: 'mission',
      title: 'Mission : proposer une sortie',
      estimatedMinutes: 20,
      competences: ['expression-orale', 'expression-ecrite'],
      lesson: {
        title: 'Mission : proposer une sortie',
        description: `Le week-end arrive : vous proposez une sortie à un ami par message vocal. Un autre ami vous a déjà proposé de faire du vélo dimanche, mais vous n’êtes pas libre : vous lui répondez par écrit. Écoutez d’abord les messages de Selin et de Max.

MODÈLE
Selin : Hallo Max, hier ist Selin! Hast du am Sonntag Zeit? Das Wetter ist super, die Sonne scheint. Wollen wir zusammen Rad fahren? Wir können zum See fahren und dann ein Eis essen. Um drei Uhr vor dem Café Mondo? Ruf mich an! Tschüs!
Max : Hallo Selin! Danke, das ist eine tolle Idee. Aber am Sonntag kann ich leider nicht, ich muss für meine Prüfung lernen. Hast du am Montagabend Zeit? Dann können wir ins Kino gehen. Bis bald!

PHRASES UTILES
• Proposer : Hast du am Samstag Zeit? / Wollen wir ins Kino gehen? / Wir können … / Hast du Lust? / Kommst du mit?
• Accepter : Ja, gern! / Gute Idee! / Super, das machen wir!
• Refuser : Leider nicht, ich muss arbeiten. / Tut mir leid, ich habe keine Zeit. / Am Samstag kann ich leider nicht.
• Fixer le rendez-vous : Um wie viel Uhr? — Um acht Uhr. / Wo? — Vor dem Kino. / Bis Samstag!`,
      },
      mission: {
        oral: {
          prompt: 'Enregistrez un message vocal pour un ami, comme Selin : saluez et dites qui parle, demandez s’il est libre, dites quel temps il fait, proposez une activité avec « Wollen wir … ? », donnez l’heure et le lieu, puis terminez (Ruf mich an! / Bis bald!).',
          maxSeconds: 90,
        },
        written: {
          prompt: 'Votre ami vous propose de faire du vélo dimanche, mais vous n’êtes pas libre. Écrivez-lui une réponse de cinq ou six phrases : remerciez, refusez en donnant une raison (ich muss …), dites ce que vous aimez faire (gern, lieber) et proposez un autre jour, une heure et un lieu.',
          maxChars: 700,
          minWords: 30,
        },
        checklist: [
          'Mon message dit qui parle, propose une activité avec « Wollen wir … ? » et donne le jour, l’heure et le lieu.',
          'Dans ma réponse écrite, je refuse poliment (Leider …) et je donne une raison avec « ich muss … ».',
          'J’ai employé gern ou lieber pour dire ce que j’aime faire.',
          'Avec kann, will ou muss, l’infinitif est à la fin de la phrase.',
          'J’ai écrit ich kann, ich will et ich muss sans terminaison.',
        ],
      },
    },
  },
  add: [
    {
      after: 'a1-freizeit-aussprache-r',
      activity: {
        id: 'a1-freizeit-repeter',
        kind: 'exercise',
        title: 'Répéter à voix haute : proposer, accepter, refuser',
        estimatedMinutes: 8,
        competences: ['expression-orale'],
        lesson: {
          title: 'Répéter à voix haute : proposer, accepter, refuser',
          description: 'Écoutez chaque modèle autant de fois que nécessaire, puis dites la phrase sans vous presser. Soignez le r : de gorge au début d’un mot (Rad), à peine audible après une voyelle (warm), un petit « a » dans la finale -er (lieber).',
          transcript: null,
        },
        placements: [],
        questions: [
          speak('q1', 'Hast du am Samstag Zeit?', 'Question oui/non : le verbe hast ouvre la phrase et la voix monte à la fin. Le h de hast se prononce, et Zeit commence par le son « ts ».'),
          speak('q2', 'Wollen wir ins Kino gehen?', 'Wollen commence par le son [v]. « Wollen wir … ? » sert à proposer ; l’infinitif gehen termine la question.'),
          speak('q3', 'Ich spiele lieber Volleyball.', 'Dans lieber, la finale -er se dit comme un petit « a » : « liiba ». Le V de Volleyball se prononce [v], car le mot vient de l’anglais.'),
          speak('q4', 'Am Samstag muss ich arbeiten.', 'Après Am Samstag, le verbe muss passe avant le sujet ich. Accentuez la première syllabe : SAMS-tag, AR-beiten.'),
          speak('q5', 'Die Sonne scheint und es ist warm.', 'S devant une voyelle se dit [z] (Sonne) ; sch se dit « ch » (scheint). Dans warm, le r adouci s’entend à peine : « vaam ».'),
          speak('q6', 'Ich kann nicht so gut schwimmen.', 'Kann et schwimmen ont des voyelles brèves. Nicht se termine par le ch doux de ich, suivi d’un t.'),
        ],
      },
    },
  ],
};
