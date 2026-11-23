// Couche pédagogique V4 · A1 · Atelier : faire connaissance au premier cours.
const REPEAT = 'Écoutez le modèle, puis dites la phrase à voix haute.';
const speak = (id, text, explanation, accept = [text]) => ({ id, type: 'speak', prompt: REPEAT, text, accept, explanation });
const DIALOGUE = { media: 'a1-hallo-atelier-dialogue', usage: 'audio', transcriptVisibility: 'after_answer', decorative: false };

export default {
  module: 'a1-hallo-atelier',
  vocabulary: [
    { id: 'herkunft', word: 'Herkunft', article: 'die', plural: null, partOfSpeech: 'noun', translation: 'l’origine', example: 'Herkunft: Marokko.', note: 'sur une fiche' },
    { id: 'wohnort', word: 'Wohnort', article: 'der', plural: 'Wohnorte', partOfSpeech: 'noun', translation: 'le lieu de résidence', example: 'Wohnort: Bonn.', note: 'sur une fiche' },
    { id: 'vorname', word: 'Vorname', article: 'der', plural: 'Vornamen', partOfSpeech: 'noun', translation: 'le prénom', example: 'Vorname: Mira.', note: null },
    { id: 'kurs', word: 'Kurs', article: 'der', plural: 'Kurse', partOfSpeech: 'noun', translation: 'le cours', example: 'Der Kurs beginnt heute.', note: null },
    { id: 'jetzt', word: 'jetzt', article: null, plural: null, partOfSpeech: 'adverb', translation: 'maintenant', example: 'Jetzt wohne ich in Aachen.', note: 'en tête de phrase, le sujet passe après le verbe' },
    { id: 'ein-bisschen', word: 'ein bisschen', article: null, plural: null, partOfSpeech: 'expression', translation: 'un peu', example: 'Ich spreche ein bisschen Deutsch.', note: null },
    { id: 'deutsch', word: 'Deutsch', article: 'das', plural: null, partOfSpeech: 'noun', translation: 'l’allemand (la langue)', example: 'Ich lerne Deutsch.', note: 'sans article dans : Ich spreche Deutsch.' },
    { id: 'franzoesisch', word: 'Französisch', article: 'das', plural: null, partOfSpeech: 'noun', translation: 'le français (la langue)', example: 'Karim spricht Französisch.', note: 'sans article dans : Ich spreche Französisch.' },
    { id: 'freut-mich-auch', word: 'Freut mich auch!', article: null, plural: null, partOfSpeech: 'expression', translation: 'Enchanté(e) aussi !', example: 'Freut mich! – Freut mich auch!', note: null },
    { id: 'und-du', word: 'Und du?', article: null, plural: null, partOfSpeech: 'expression', translation: 'Et toi ?', example: 'Ich komme aus Marokko. Und du?', note: 'poli : Und Sie?' },
    { id: 'bis-morgen', word: 'Bis morgen!', article: null, plural: null, partOfSpeech: 'expression', translation: 'À demain !', example: 'Tschüs, Nora! Bis morgen!', note: null },
    { id: 'welche-sprachen', word: 'Welche Sprachen sprichst du?', article: null, plural: null, partOfSpeech: 'expression', translation: 'Quelles langues parles-tu ?', example: 'Welche Sprachen sprichst du? – Deutsch und Französisch.', note: 'poli : Welche Sprachen sprechen Sie?' },
  ],
  activities: {
    'a1-hallo-atelier-guide': {
      title: 'Découvrir : se présenter et poser trois questions',
      estimatedMinutes: 15,
      lesson: {
        title: 'Découvrir : se présenter et poser trois questions',
        description: `FAIRE CONNAISSANCE · 15 MIN

1. Lire une présentation (5 min). Voici la présentation d’une nouvelle élève : « Guten Morgen! Ich heiße Lina. Ich komme aus Frankreich. Jetzt wohne ich in Aachen. Ich spreche Französisch und ein bisschen Deutsch. » Repérez son prénom, son pays d’origine, sa ville actuelle et ses langues, sans traduire chaque mot. Relisez à voix haute en marquant une pause à chaque point.

2. Les trois questions (5 min). « Wie heißt du? » demande le nom, « Woher kommst du? » l’origine et « Wo wohnst du? » le lieu de vie. « Aus Frankreich » répond à woher, « in Aachen » répond à wo. Avec un adulte que l’on vouvoie, on dit : « Wie heißen Sie? », « Woher kommen Sie? », « Wo wohnen Sie? ». Remarquez aussi « Jetzt wohne ich in Aachen » : quand jetzt ouvre la phrase, le sujet passe après le verbe.

3. Faire répéter (5 min). Lisez les deux rôles à voix haute : « Hallo, ich heiße Bo. » / « Wie bitte? » / « Bo. B–O. » / « Danke! Ich heiße Lina. Freut mich! ». Distinguez la salutation, l’information et la réaction. Redites la scène avec votre prénom, en l’épelant après « Wie bitte? ».`,
      },
    },
    'a1-hallo-atelier-pratique': {
      title: 'Comprendre : Nora et Karim font connaissance',
      estimatedMinutes: 12,
      lesson: {
        title: 'Comprendre : Nora et Karim font connaissance',
        description: `LA SCÈNE · 12 MIN

Nora et Karim font connaissance avant le cours.

1. Première écoute (3 min). Sans lire la transcription : qui vient d’où ? Qui habite où ?
2. Deuxième écoute (4 min). Lisez la transcription en même temps. Repérez les trois questions (Wie heißt du? Woher kommst du? Wo wohnst du?) et la demande de répétition : « Wie bitte? Welche Sprachen sprichst du? ».
3. Du ou Sie (3 min). Observez le tableau : avec Sie, le verbe se termine par -en et Sie prend une majuscule.
4. Répéter (2 min). Répétez les répliques de Karim pendant les pauses, puis redites-les avec vos propres informations.

DU → SIE
• Wie heißt du? → Wie heißen Sie?
• Woher kommst du? → Woher kommen Sie?
• Wo wohnst du? → Wo wohnen Sie?
• Welche Sprachen sprichst du? → Welche Sprachen sprechen Sie?`,
      },
    },
    'a1-hallo-atelier-controle': {
      title: 'Vérifier : faire connaissance',
      estimatedMinutes: 10,
      lesson: {
        title: 'Vérifier : faire connaissance',
        description: 'Écoutez la scène une première fois pour la situation, puis lisez les questions et réécoutez pour les détails. Les deux dernières questions vous demandent de réutiliser les formules. La transcription s’affiche après votre réponse.',
      },
      explanations: {
        q1: 'La première voix dit « Hallo! Ich heiße Nora ». Karim est le prénom de l’autre personne, et Laura n’est jamais prononcé.',
        q2: 'À la question « Woher kommst du? », Karim répond « Ich komme aus Marokko ». Le Portugal est le pays de Nora.',
        q3: 'Nora dit « Ich wohne jetzt in Bonn » : jetzt (maintenant) annonce sa ville actuelle. Köln est la ville de Karim.',
        q4: 'Karim dit deux fois « Deutsch und Französisch », la seconde fois après « Wie bitte? ». Personne ne parle portugais ni anglais dans la scène.',
        q5: 'Pour vouvoyer, on emploie Sie et le verbe en -en : Wie heißen Sie? « Wie heißt du? » tutoie, et « Wo wohnen Sie? » demande le lieu de vie, pas le nom.',
        q6: 'Wohnen in indique la ville où l’on habite : Ich wohne in Bremen. « Ich komme aus Bremen » dirait qu’on vient de Brême, et heißen sert à donner son nom.',
      },
    },
    'a1-hallo-atelier-mission': {
      kind: 'mission',
      title: 'Mission : faire connaissance au premier cours',
      estimatedMinutes: 20,
      competences: ['expression-orale', 'expression-ecrite'],
      lesson: {
        title: 'Mission : faire connaissance au premier cours',
        description: `Premier jour du cours : Mira, une nouvelle participante, s’assoit à côté de vous. Vous vous présentez, vous lui posez des questions et vous faites répéter ce que vous n’avez pas compris. Ensuite, vous présentez Mira au groupe par écrit, d’après sa fiche.

MODÈLE
– Hallo! Ich heiße Karim. Wie heißt du?
– Ich heiße Mira.
– Wie bitte?
– Mira. M, I, R, A.
– Freut mich, Mira! Woher kommst du?`,
      },
      mission: {
        oral: {
          prompt: 'Enregistrez votre partie de la conversation avec Mira : saluez, dites votre nom, votre origine et votre ville, puis posez-lui trois questions (nom, origine, ville ou langues). Faites-lui répéter une réponse avec « Wie bitte? ».',
          maxSeconds: 60,
        },
        written: {
          prompt: 'Écrivez la présentation de Mira à la première personne, d’après sa fiche, comme si elle parlait (Ich heiße …). Ajoutez une phrase sur vous : Ich heiße …, ich komme aus …',
          maxChars: 500,
          minWords: 20,
        },
        checklist: [
          'J’ai posé les trois questions avec du : Wie heißt du? Woher kommst du? Wo wohnst du?',
          'J’ai fait répéter une réponse avec « Wie bitte? ».',
          'J’ai employé aus pour l’origine et in pour la ville (Ich komme aus Italien, ich wohne in Bonn).',
          'Dans chaque phrase écrite, le verbe conjugué est en deuxième position.',
        ],
      },
    },
  },
  add: [
    {
      after: 'a1-hallo-atelier-pratique',
      activity: {
        id: 'a1-hallo-atelier-entrainer',
        kind: 'exercise',
        title: 'S’entraîner : fiches et questions',
        estimatedMinutes: 10,
        competences: ['ecoute', 'expression-ecrite'],
        lesson: {
          title: 'S’entraîner : fiches et questions',
          description: 'Réécoutez la scène entre Nora et Karim, sans la transcription, et complétez leurs fiches. Ensuite, réutilisez les questions avec Sie, aus et in. La transcription s’affiche après votre réponse.',
          transcript: null,
        },
        placements: [DIALOGUE],
        questions: [
          {
            id: 'q1', type: 'fill', prompt: 'Écoutez la scène et complétez la fiche de Karim.',
            text: 'Herkunft: [[1]] · Wohnort: [[2]] · Sprachen: Deutsch und [[3]]',
            blanks: [{ id: '1', accept: ['Marokko'], size: 9, hint: null }, { id: '2', accept: ['Köln'], size: 6, hint: null }, { id: '3', accept: ['Französisch'], size: 12, hint: null }],
            explanation: 'Karim dit « Ich komme aus Marokko », « In Köln » et « Deutsch und Französisch ». Herkunft est l’origine et Wohnort le lieu de vie : ne les intervertissez pas.',
          },
          {
            id: 'q2', type: 'fill', prompt: 'Complétez la fiche de Nora.',
            text: 'Herkunft: [[1]] · Wohnort: [[2]]',
            blanks: [{ id: '1', accept: ['Portugal'], size: 9, hint: null }, { id: '2', accept: ['Bonn'], size: 6, hint: null }],
            explanation: 'Nora répond « Aus Portugal. Ich wohne jetzt in Bonn. » : aus donne l’origine, wohnen in le lieu de vie. Köln est la ville de Karim.',
          },
          {
            id: 'q3', type: 'fill', prompt: 'Vous parlez à une personne que vous vouvoyez. Complétez les questions.',
            text: 'Wie [[1]] Sie? Woher [[2]] Sie? Wo [[3]] Sie?',
            blanks: [{ id: '1', accept: ['heißen'], size: 8, hint: 'heißen' }, { id: '2', accept: ['kommen'], size: 8, hint: 'kommen' }, { id: '3', accept: ['wohnen'], size: 8, hint: 'wohnen' }],
            explanation: 'Avec Sie, le verbe prend la terminaison -en, comme à l’infinitif : heißen, kommen, wohnen. Avec du, on aurait heißt, kommst, wohnst.',
          },
          {
            id: 'q4', type: 'fill', prompt: 'Complétez avec aus ou in.',
            text: 'Ich komme [[1]] Portugal. Ich wohne jetzt [[2]] Bonn.',
            blanks: [{ id: '1', accept: ['aus'], size: 4, hint: null }, { id: '2', accept: ['in'], size: 4, hint: null }],
            explanation: 'Kommen aus indique l’origine, wohnen in le lieu où l’on habite. « Ich wohne aus Bonn » est une faute fréquente : aus ne sert qu’à dire d’où l’on vient.',
          },
          {
            id: 'q5', type: 'order', prompt: 'Remettez les mots dans l’ordre, en commençant par « Jetzt ».',
            answers: [['Jetzt', 'wohne', 'ich', 'in', 'Aachen.']],
            explanation: 'Quand jetzt ouvre la phrase, le verbe reste en 2e position et le sujet ich passe derrière : Jetzt wohne ich in Aachen. « Jetzt ich wohne » est la faute typique.',
          },
          {
            id: 'q6', type: 'match', prompt: 'Associez chaque réplique à la réaction qui convient.',
            pairs: [
              { left: 'Ich heiße Karim.', right: 'Freut mich!' },
              { left: 'Wie bitte?', right: 'Karim. K, A, R, I, M.' },
              { left: 'Woher kommst du?', right: 'Aus Marokko. Und du?' },
              { left: 'Bis morgen, Nora!', right: 'Tschüs, bis morgen!' },
            ],
            explanation: 'On répond à une présentation par Freut mich!, à Wie bitte? en répétant ou en épelant, à Woher par aus + pays, et à Bis morgen par une formule de départ.',
          },
          {
            id: 'q7', type: 'choice', prompt: 'Karim dit « Bis morgen, Nora! ». Que veut-il dire ?',
            options: [
              { id: 'a', label: 'À demain, Nora !', correct: true },
              { id: 'b', label: 'À tout à l’heure, Nora !', correct: false },
              { id: 'c', label: 'Bonjour, Nora !', correct: false },
            ],
            explanation: 'Morgen veut dire « demain » : bis morgen, c’est « à demain ». « À tout à l’heure » se dirait bis später, et pour saluer en arrivant on dit Hallo.',
          },
        ],
      },
    },
    {
      after: 'a1-hallo-atelier-entrainer',
      activity: {
        id: 'a1-hallo-atelier-repeter',
        kind: 'exercise',
        title: 'Répéter à voix haute : faire connaissance',
        estimatedMinutes: 8,
        competences: ['expression-orale'],
        lesson: {
          title: 'Répéter à voix haute : faire connaissance',
          description: 'Écoutez chaque modèle, puis dites la phrase sans vous presser. Vous pourrez ensuite redire ces phrases avec vos propres informations.',
          transcript: null,
        },
        placements: [],
        questions: [
          speak('q1', 'Hallo! Ich heiße Nora. Wie heißt du?', 'Dans heiße et heißt, ei se dit « aï » et ß se prononce comme un s dur. La voix descend à la fin de la question.'),
          speak('q2', 'Freut mich auch! Woher kommst du?', 'Eu se dit « oï » dans freut. Le ch de mich et de auch n’est pas le même : doux après i, au fond de la gorge après au.'),
          speak('q3', 'Ich komme aus Marokko. Und du?', 'Accentuez la deuxième syllabe de Marokko (ma-ROK-ko). « Und du? » renvoie la question avec une voix qui monte.'),
          speak('q4', 'Ich wohne jetzt in Bonn.', 'W se dit comme un v : « vône ». Jetzt commence par le son « y » et se termine par « tst ».'),
          speak('q5', 'Wie bitte? Welche Sprachen sprichst du?', 'Sp se dit « chp » au début de Sprachen et de sprichst. Le ch de Sprachen, après a, se forme au fond de la gorge.'),
          speak('q6', 'Wie heißen Sie? Woher kommen Sie?', 'Avec Sie, les verbes se terminent par -en. Sie se prononce « zi » : le s devant une voyelle est sonore.'),
        ],
      },
    },
  ],
  order: [
    'a1-hallo-atelier-guide', 'a1-hallo-atelier-pratique', 'a1-hallo-atelier-entrainer', 'a1-hallo-atelier-repeter',
    'a1-hallo-atelier-controle', 'a1-hallo-atelier-mission',
  ],
};
