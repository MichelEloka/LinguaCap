// Couche pédagogique V4 · A1 · Hallo ! Se saluer et se présenter.
const REPEAT = 'Écoutez le modèle, puis dites la phrase à voix haute.';
const speak = (id, text, explanation, accept = [text]) => ({ id, type: 'speak', prompt: REPEAT, text, accept, explanation });

export default {
  module: 'a1-hallo',
  // Script aligné sur le dialogue affiché (« Auch gut, danke. »).
  media: [
    {
      key: "a1-hallo-dialog-audio-v3", kind: "audio", title: "Dialogue : le premier jour du cours", credit: "LinguaCap, synthèse Piper avec Thorsten Müller (CC0) et Kerstin, préentraînée sur la voix de Cori Samuel (Hi-Fi TTS, CC BY 4.0)", license: "Jeux de données des voix : CC0 et CC BY 4.0",
      script: [
        { voice: "sprecherin", name: "Frau Weber", text: "Guten Morgen! Ich bin Frau Weber, Ihre Lehrerin. Wie heißen Sie?" },
        { pause: 0.6 },
        { voice: "frau", name: "Anna", text: "Guten Morgen! Ich heiße Anna Rossi." },
        { pause: 0.6 },
        { voice: "sprecherin", name: "Frau Weber", text: "Woher kommen Sie, Frau Rossi?" },
        { pause: 0.6 },
        { voice: "frau", name: "Anna", text: "Ich komme aus Italien, aus Mailand. Aber ich wohne jetzt hier in Würzburg." },
        { pause: 0.8 },
        { voice: "mann", name: "Jonas", text: "Hallo Anna! Ich bin Jonas. Ich komme aus Frankreich." },
        { pause: 0.6 },
        { voice: "frau", name: "Anna", text: "Hallo Jonas! Freut mich. Wie geht's?" },
        { pause: 0.6 },
        { voice: "mann", name: "Jonas", text: "Gut, danke! Und dir?" },
        { pause: 0.6 },
        { voice: "frau", name: "Anna", text: "Auch gut, danke." },
      ],
    },
  ],
  grammarFocus: ['heissen-kommen-sein'],
  vocabulary: [
    { id: 'guten-morgen', word: 'Guten Morgen!', article: null, plural: null, partOfSpeech: 'expression', translation: 'Bonjour ! (le matin)', example: 'Guten Morgen, Frau Weber!', note: null },
    { id: 'guten-tag', word: 'Guten Tag!', article: null, plural: null, partOfSpeech: 'expression', translation: 'Bonjour ! (dans la journée)', example: 'Guten Tag! Wie heißen Sie?', note: null },
    { id: 'guten-abend', word: 'Guten Abend!', article: null, plural: null, partOfSpeech: 'expression', translation: 'Bonsoir !', example: 'Guten Abend, Herr Braun!', note: null },
    { id: 'gute-nacht', word: 'Gute Nacht!', article: null, plural: null, partOfSpeech: 'expression', translation: 'Bonne nuit ! (avant d’aller dormir)', example: 'Gute Nacht, bis morgen!', note: null },
    { id: 'hallo', word: 'Hallo!', article: null, plural: null, partOfSpeech: 'expression', translation: 'Salut ! Bonjour ! (familier)', example: 'Hallo! Ich bin Jonas.', note: null },
    { id: 'tschues', word: 'Tschüs!', article: null, plural: null, partOfSpeech: 'expression', translation: 'Salut ! Au revoir ! (familier)', example: 'Tschüs! Bis morgen!', note: 'on écrit aussi Tschüss' },
    { id: 'auf-wiedersehen', word: 'Auf Wiedersehen!', article: null, plural: null, partOfSpeech: 'expression', translation: 'Au revoir ! (poli)', example: 'Auf Wiedersehen, Frau Lang!', note: null },
    { id: 'bis-bald', word: 'Bis bald!', article: null, plural: null, partOfSpeech: 'expression', translation: 'À bientôt !', example: 'Danke für heute. Bis bald!', note: null },
    { id: 'freut-mich', word: 'Freut mich!', article: null, plural: null, partOfSpeech: 'expression', translation: 'Enchanté(e) !', example: 'Ich heiße Anna. – Freut mich!', note: null },
    { id: 'wie-gehts', word: 'Wie geht’s?', article: null, plural: null, partOfSpeech: 'expression', translation: 'Comment ça va ? (familier)', example: 'Hallo Anna! Wie geht’s?', note: 'poli : Wie geht es Ihnen?' },
    { id: 'das-tut-mir-leid', word: 'Das tut mir leid!', article: null, plural: null, partOfSpeech: 'expression', translation: 'Je suis désolé(e) !', example: 'Ich bin krank. – Oh, das tut mir leid!', note: null },
    { id: 'heissen', word: 'heißen', article: null, plural: null, partOfSpeech: 'verb', translation: 's’appeler', example: 'Wie heißen Sie?', note: 'ich heiße, du heißt, er heißt, Sie heißen' },
    { id: 'kommen', word: 'kommen', article: null, plural: null, partOfSpeech: 'verb', translation: 'venir', example: 'Woher kommen Sie?', note: 'kommen aus + pays ou ville : Ich komme aus Belgien.' },
    { id: 'wohnen', word: 'wohnen', article: null, plural: null, partOfSpeech: 'verb', translation: 'habiter', example: 'Wo wohnen Sie?', note: 'wohnen in + ville : Ich wohne in Köln.' },
    { id: 'sein', word: 'sein', article: null, plural: null, partOfSpeech: 'verb', translation: 'être', example: 'Bitte pünktlich sein!', note: 'irrégulier : ich bin, du bist, er ist, Sie sind' },
    { id: 'sprechen', word: 'sprechen', article: null, plural: null, partOfSpeech: 'verb', translation: 'parler', example: 'Sprechen Sie Deutsch?', note: 'ich spreche, du sprichst' },
    { id: 'woher', word: 'woher', article: null, plural: null, partOfSpeech: 'adverb', translation: 'd’où', example: 'Woher kommst du?', note: null },
    { id: 'wo-wohnst-du', word: 'Wo wohnst du?', article: null, plural: null, partOfSpeech: 'expression', translation: 'Où habites-tu ?', example: 'Wo wohnst du? – In Würzburg.', note: 'poli : Wo wohnen Sie?' },
    { id: 'name', word: 'Name', article: 'der', plural: 'Namen', partOfSpeech: 'noun', translation: 'le nom', example: 'Mein Name ist Walter Brückner.', note: null },
    { id: 'land', word: 'Land', article: 'das', plural: 'Länder', partOfSpeech: 'noun', translation: 'le pays', example: 'Welches Land ist das?', note: null },
    { id: 'stadt', word: 'Stadt', article: 'die', plural: 'Städte', partOfSpeech: 'noun', translation: 'la ville', example: 'Freiburg ist eine Stadt.', note: null },
    { id: 'dorf', word: 'Dorf', article: 'das', plural: 'Dörfer', partOfSpeech: 'noun', translation: 'le village', example: 'Horben ist ein Dorf bei Freiburg.', note: null },
    { id: 'sprache', word: 'Sprache', article: 'die', plural: 'Sprachen', partOfSpeech: 'noun', translation: 'la langue', example: 'Welche Sprachen sprichst du?', note: null },
    { id: 'student', word: 'Student', article: 'der', plural: 'Studenten', partOfSpeech: 'noun', translation: 'l’étudiant', example: 'Walter ist Student.', note: 'féminin : die Studentin, die Studentinnen' },
    { id: 'muede', word: 'müde', article: null, plural: null, partOfSpeech: 'adjective', translation: 'fatigué(e)', example: 'Ich bin sehr müde.', note: null },
  ],
  activities: {
    'a1-hallo-wortschatz': { title: 'Découvrir : les salutations', estimatedMinutes: 12, lesson: { title: 'Découvrir : les salutations' } },
    'a1-hallo-dialog': { title: 'Comprendre : le premier jour du cours', estimatedMinutes: 12, lesson: { title: 'Comprendre : le premier jour du cours' } },
    // L’alphabet a désormais son propre module (a1-abc) : la leçon V2 fait doublon avec la suivante.
    'a1-hallo-alphabet': null,
    'a1-hallo-herkunft': {
      explanations: {
        q1: 'Woher demande l’origine et Sie est la forme polie pour un adulte inconnu : Woher kommen Sie? « Woher kommst du? » tutoie ; « Wo wohnen Sie? » demande où l’on habite.',
        q2: 'Die USA est un pluriel : après aus, l’article devient den (aus den USA). Sans article ou avec die, la phrase est fausse, et von ne sert pas à dire son pays d’origine.',
        q3: 'Le drapeau noir, rouge et or est celui de l’Allemagne, Deutschland, cité dans l’enregistrement. Le drapeau autrichien est rouge et blanc ; le suisse porte une croix blanche.',
        q4: 'La plupart des pays s’emploient sans article : Spanien, Polen, Österreich, Frankreich. Die Schweiz et die Türkei font partie des rares pays avec l’article die.',
        q5: 'L’enregistrement dit « die Niederlande », puis « Holland » : deux noms pour les Pays-Bas. Belgien et Luxemburg apparaissent ailleurs dans la liste.',
        q6: 'Milan se dit Mailand en allemand ; Anna le dit dans le dialogue : « Ich komme aus Italien, aus Mailand ». Rom est Rome et Nizza est Nice.',
      },
    },
    'a1-hallo-lesen': {
      explanations: {
        q1: 'Lea écrit « Ich komme aus Österreich, aus Wien ». Elle habite à Würzburg, en Allemagne : ne confondez pas l’origine (aus) et le lieu de vie (in).',
        q2: 'Karim écrit « wohne seit zwei Monaten in Frankfurt ». Il vient du Maroc (aus Marokko) mais habite à Francfort ; Würzburg et Berlin sont les villes de Lea et de Sofia.',
        q3: '« Ich bin Ingenieur » : Karim est ingénieur. C’est Lea qui étudie la biologie (« Ich studiere Biologie »).',
        q4: 'Lea écrit « Ich spreche Deutsch, Englisch und ein bisschen Spanisch » ; ein bisschen veut dire « un peu ». Sofia vient du Portugal, mais elle ne parle pas d’espagnol dans son message.',
        q5: 'Sofia écrit « Ich bin Studentin und lerne Deutsch ». Studentin est le féminin de Student. Lea étudie aussi, mais elle dit « Ich studiere Biologie ».',
      },
    },
    'a1-hallo-hoeren': {
      explanations: {
        q1: 'Frau Lang dit « Guten Morgen, Herr Braun! » : Guten Morgen s’emploie le matin. Le soir, on dirait Guten Abend ; Gute Nacht sert seulement à prendre congé avant de dormir.',
        q2: 'Herr Braun répond « Ach, nicht so gut. Ich bin sehr müde » : il ne va pas très bien, il est très fatigué (müde).',
        q3: 'À la question « Woher kommst du? », Tim répond « Aus Bremen ». C’est Mia qui vient de Hambourg.',
        q4: 'Mia et Tim sont jeunes et se rencontrent à une fête (« Tolle Party, oder? ») : ils se tutoient tout de suite (Wie heißt du?). Entre collègues ou avec une professeure, on commence par Sie.',
        q5: 'La cliente épelle N, O, W, A, K. Le W allemand s’appelle « vé » : on peut croire entendre un V. Kowalski et Novak ne correspondent pas aux lettres épelées.',
      },
    },
    'a1-hallo-hoersaal': {
      explanations: {
        q1: 'Walter épelle « B, R, Ü, C, K, N, E, R » : le nom a un ü (avec tréma) et ck. Brückler contient un L, Bruckner n’a pas de tréma et Brükner n’a pas de c.',
        q2: 'Walter dit « Ich komme aus Hamburg. Aber ich wohne jetzt hier in Freiburg ». Kommen aus donne l’origine, wohnen in le lieu de vie. Horben est le village de Sara.',
        q3: 'Sara explique « Das ist ein Dorf bei Freiburg. Es ist klein, aber sehr schön ». Ein Dorf est un village et bei signifie « près de ».',
        q4: 'Sara dit « Ich studiere Biologie. Und ich arbeite auch in einem Café » : les deux sont vrais. C’est Walter qui étudie l’histoire (Geschichte).',
        q5: 'Walter, le plus âgé, propose « Sagen wir du? » et rappelle qu’à l’université tous les étudiants se disent du. C’est à la personne la plus âgée de proposer le tutoiement.',
        q6: 'Walter répond « Ach, so lala. Ich habe viel Arbeit » : so lala veut dire « comme ci, comme ça » et viel Arbeit « beaucoup de travail ». Sara réagit par « Das tut mir leid! ».',
      },
    },
    'a1-hallo-grammatik': {
      title: 'S’entraîner : heißen, kommen, sein',
      estimatedMinutes: 12,
      lesson: {
        title: 'S’entraîner : heißen, kommen, sein',
        description: 'Choisissez ou écrivez la forme qui complète chaque phrase. Rappel : ich -e, du -st, er/sie -t, Sie -en ; le verbe sein est irrégulier (ich bin, du bist, er ist, Sie sind). Dans les phrases à remettre en ordre, touchez les étiquettes dans l’ordre de la phrase.',
      },
      explanations: {
        q1: 'Avec ich, le verbe se termine par -e : ich heiße. Heißt va avec du ou er/sie, heißen avec wir ou Sie.',
        q2: 'Avec du, le verbe se termine par -st : du kommst. Le piège est de garder la forme de ich (komme).',
        q3: 'Le Sie de politesse se conjugue comme un pluriel, avec -en : Wie heißen Sie? La majuscule de Sie signale le vouvoiement.',
        q4: 'Das (c’est, voici) se construit comme er ou sie, à la 3e personne : das ist. Bin va avec ich, bist avec du, sind avec wir ou Sie.',
        q5: 'La réponse « In Würzburg » indique le lieu où l’on habite : on pose la question avec wo (où). Woher demande l’origine (aus …) et wie la manière ou le nom.',
        q6: 'Avec un adulte inconnu, on emploie Sie et Ihnen : Wie geht es Ihnen? « Wie geht’s dir? » tutoie, et « Tschüs! » sert à partir, pas à saluer en arrivant.',
      },
      addQuestions: [
        {
          id: 'q7', type: 'fill', prompt: 'Complétez avec le verbe kommen à la bonne forme.',
          text: 'Woher [[1]] du? – Ich [[2]] aus Belgien.',
          blanks: [{ id: '1', accept: ['kommst'], size: 8, hint: 'kommen' }, { id: '2', accept: ['komme'], size: 8, hint: 'kommen' }],
          explanation: 'Du kommst, ich komme : seule la terminaison change selon la personne (-st avec du, -e avec ich). Le radical komm- ne bouge pas.',
        },
        {
          id: 'q8', type: 'fill', prompt: 'Complétez la présentation de Karim avec sein ou kommen.',
          text: 'Das [[1]] Karim. Er [[2]] aus Marokko und [[3]] Ingenieur.',
          blanks: [
            { id: '1', accept: ['ist'], size: 5, hint: 'sein' },
            { id: '2', accept: ['kommt'], size: 7, hint: 'kommen' },
            { id: '3', accept: ['ist'], size: 5, hint: 'sein' },
          ],
          explanation: 'Pour parler d’une autre personne (er, sie, das), sein donne ist et kommen se termine par -t : er kommt. Bin et bist sont réservés à ich et à du.',
        },
        {
          id: 'q9', type: 'order', prompt: 'Remettez la fin de la phrase dans l’ordre : Anna vient d’Italie, mais elle habite maintenant à Würzburg.',
          answers: [
            ['Ich komme aus Italien,', 'aber', 'ich', 'wohne', 'jetzt', 'in Würzburg.'],
            ['Ich komme aus Italien,', 'aber', 'jetzt', 'wohne', 'ich', 'in Würzburg.'],
          ],
          explanation: 'Aber (mais) relie deux phrases sans changer leur ordre : le verbe wohne reste en 2e position (aber ich wohne jetzt …). Si jetzt vient en premier, le sujet passe après le verbe : aber jetzt wohne ich …',
        },
        {
          id: 'q10', type: 'match', prompt: 'Associez chaque question à la réponse qui convient.',
          pairs: [
            { left: 'Wie heißen Sie?', right: 'Ich heiße Anna Rossi.' },
            { left: 'Woher kommst du?', right: 'Aus Frankreich.' },
            { left: 'Wo wohnst du?', right: 'In Würzburg.' },
            { left: 'Wie geht’s?', right: 'Gut, danke!' },
          ],
          explanation: 'Woher appelle aus + pays (l’origine) et wo appelle in + ville (le lieu de vie). Wie heißen Sie? demande le nom, Wie geht’s? demande comment on va.',
        },
      ],
    },
    'a1-hallo-rollenspiel': {
      title: 'Découvrir : réagir et faire répéter',
      estimatedMinutes: 12,
      lesson: {
        title: 'Découvrir : réagir et faire répéter',
        description: `Se présenter, c’est bien ; faire connaissance, c’est mieux ! Dans une vraie conversation, on pose des questions, on réagit et on fait répéter quand on ne comprend pas.

RÉAGIR ET MONTRER SON INTÉRÊT
• Interessant! — Intéressant !
• Wirklich? — Vraiment ?
• Ach ja? Ich auch! — Ah oui ? Moi aussi !
• Super! / Toll! — Super !
• Das tut mir leid! — Je suis désolé(e) ! (quand ça ne va pas)

DIRE COMMENT ÇA VA
• Mir geht’s sehr gut / gut / so lala / nicht so gut. — Je vais très bien / bien / comme ci, comme ça / pas très bien.
• Wie geht’s dir? (avec du) — Wie geht es Ihnen? (avec Sie)

QUAND ON NE COMPREND PAS
• Wie bitte? — Pardon ? (pour faire répéter)
• Wie schreibt man das? — Comment ça s’écrit ?
• Wo ist das? Ist das eine Stadt oder ein Dorf? — Où est-ce ? C’est une ville ou un village ?
Un mot vous manque ? Faites un geste et continuez en allemand.

LES QUESTIONS FERMÉES (OUI / NON)
Le verbe conjugué se place en premier : Studierst du? Arbeitest du? Wohnst du hier?
Réponses : Ja, ich studiere Musik. — Nein, ich arbeite.

PRENDRE CONGÉ
• Auf Wiedersehen! — poli, plutôt formel.
• Tschüs! — familier.
• Bis bald! — on pense se revoir bientôt. Bis morgen! — on se revoit demain.
• Bis später! — seulement si l’on se revoit plus tard dans la journée.

MODÈLE : APRÈS LE COURS D’ALLEMAND
Lina : Hallo! Ich bin Lina. Und wie heißt du?
Malik : Ich heiße Malik.
Lina : Wie bitte?
Malik : Malik. M – A – L – I – K.
Lina : Freut mich, Malik! Wie geht’s dir?
Malik : Nicht so gut. Ich bin müde. Und dir?
Lina : Oh, das tut mir leid! Mir geht’s gut, danke. Woher kommst du?
Malik : Ich komme aus Tunesien. Und du?
Lina : Ich komme aus Österreich, aus Graz.
Malik : Graz? Ist das groß oder klein?
Lina : Groß! Und sehr schön.
Malik : Interessant! Studierst du?
Lina : Ja, ich studiere Musik. Ich spiele Gitarre. Spielst du auch Gitarre?
Malik : Nein, aber ich spiele Fußball.
Lina : Super! Tschüs, Malik! Bis morgen!
Malik : Tschüs, Lina! Bis morgen!

À VOUS
1. Lisez le modèle à voix haute en jouant les deux rôles. Changez de voix pour chaque personnage.
2. Repérez les trois réactions de Lina et de Malik (Wie bitte?, Das tut mir leid!, Interessant!) et dites quand on les emploie.
3. Relisez la scène en remplaçant les informations de Malik par les vôtres : prénom, pays, ville, études ou travail.
4. Rejouez la scène avec Sie, face à une personne plus âgée : Guten Tag! Wie heißen Sie? Woher kommen Sie? Arbeiten Sie hier? C’est la personne la plus âgée qui peut proposer « Sagen wir du? ».

Situation adaptée de Der und mehr (Kennesaw State University), CC BY 4.0.`,
      },
    },
    'a1-hallo-sprechen': {
      kind: 'mission',
      title: 'Mission : se présenter au groupe',
      estimatedMinutes: 20,
      competences: ['expression-orale', 'expression-ecrite'],
      lesson: {
        title: 'Mission : se présenter au groupe',
        description: `Le cours commence : chaque participant se présente à l’oral, puis sur le forum du groupe. Écoutez d’abord la présentation de Clara.

MODÈLE
Hallo! Ich heiße Clara Martin. Ich komme aus Frankreich, aus Lyon. Ich wohne jetzt in Köln. Ich bin Studentin. Ich spreche Französisch, Englisch und ein bisschen Deutsch.

POUR VOUS AIDER
• Ich heiße … / Mein Name ist …
• Ich komme aus … (pays, ville)
• Ich wohne in …
• Ich bin Student / Studentin. — Ich arbeite in …
• Ich spreche … und ein bisschen Deutsch.`,
      },
      mission: {
        oral: {
          prompt: 'Présentez-vous en 30 à 45 secondes : saluez, donnez votre nom, votre pays d’origine, votre ville et les langues que vous parlez. Terminez par une question à la personne en face de vous, par exemple « Und du? Woher kommst du? ».',
          maxSeconds: 60,
        },
        written: {
          prompt: 'Écrivez votre message pour le forum du cours, comme Lea, Karim et Sofia : au moins cinq phrases, avec une salutation au début et une formule pour prendre congé à la fin.',
          maxChars: 600,
          minWords: 25,
        },
        checklist: [
          'J’ai donné mon nom, mon origine (Ich komme aus …) et ma ville (Ich wohne in …).',
          'J’ai nommé au moins deux langues avec « Ich spreche … ».',
          'Dans chaque phrase, le verbe conjugué est en deuxième position.',
          'Avec ich, mes verbes se terminent par -e : ich heiße, ich komme, ich wohne.',
          'J’ai salué au début et pris congé à la fin (Bis bald! / Tschüs!).',
        ],
      },
    },
  },
  add: [
    {
      after: 'a1-hallo-rollenspiel',
      activity: {
        id: 'a1-hallo-repeter',
        kind: 'exercise',
        title: 'Répéter à voix haute : saluer et faire connaissance',
        estimatedMinutes: 8,
        competences: ['expression-orale'],
        lesson: {
          title: 'Répéter à voix haute : saluer et faire connaissance',
          description: 'Écoutez chaque modèle autant de fois que nécessaire, puis dites la phrase sans vous presser. Imitez aussi la mélodie : la voix descend à la fin d’une question en W (Woher kommst du?).',
          transcript: null,
        },
        placements: [],
        questions: [
          speak('q1', 'Guten Morgen! Wie geht es Ihnen?', 'Dans Ihnen, ih se prononce comme un i long. Guten Morgen se dit le matin ; la voix descend à la fin de la question.'),
          speak('q2', 'Ich komme aus Frankreich.', 'Le ch de ich est un souffle doux près du palais ; on le retrouve à la fin de Frankreich, où ei se dit « aï ».'),
          speak('q3', 'Ich wohne jetzt in Berlin.', 'W se prononce comme un v français : wohne se dit « vône ». Jetzt commence par le son « y ».'),
          speak('q4', 'Wie bitte? Wie schreibt man das?', 'Wie bitte? fait répéter poliment. Dans schreibt, sch se dit « ch » et ei se dit « aï ».'),
          speak('q5', 'Freut mich! Woher kommst du?', 'Dans freut, eu se dit « oï ». Dans woher, l’accent tombe sur -her et le h se prononce.'),
          speak('q6', 'Tschüs, bis morgen!', 'Tschüs commence par « tch » et contient un ü : arrondissez les lèvres comme pour « u ». Bis morgen : on se revoit demain.', ['Tschüs, bis morgen!', 'Tschüss, bis morgen!']),
        ],
      },
    },
  ],
};
