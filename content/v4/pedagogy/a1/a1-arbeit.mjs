// Couche pédagogique V4 · A1 · Parler de son métier, de ses études et de ses horaires (placé après a1-alltag-atelier).
const REPEAT = 'Écoutez le modèle, puis dites la phrase à voix haute.';
const speak = (id, text, explanation, accept = [text]) => ({ id, type: 'speak', prompt: REPEAT, text, accept, explanation });
const DIALOGUE = { media: 'a1-arbeit-dialogue', usage: 'audio', transcriptVisibility: 'after_answer', decorative: false };

export default {
  module: 'a1-arbeit',
  vocabulary: [
    { id: 'arbeiten', word: 'arbeiten', article: null, plural: null, partOfSpeech: 'verb', translation: 'travailler', example: 'Wo arbeiten Sie?', note: 'du arbeitest, er arbeitet' },
    { id: 'studieren', word: 'studieren', article: null, plural: null, partOfSpeech: 'verb', translation: 'faire des études', example: 'Was studieren Sie?', note: 'studieren an der Uni' },
    { id: 'beruf', word: 'Beruf', article: 'der', plural: 'Berufe', partOfSpeech: 'noun', translation: 'le métier, la profession', example: 'Was sind Sie von Beruf?', note: null },
    { id: 'arbeit', word: 'Arbeit', article: 'die', plural: 'Arbeiten', partOfSpeech: 'noun', translation: 'le travail', example: 'Die Arbeit fängt um acht Uhr an.', note: null },
    { id: 'job', word: 'Job', article: 'der', plural: 'Jobs', partOfSpeech: 'noun', translation: 'le petit boulot, l’emploi', example: 'Mein Job ist im Kino.', note: null },
    { id: 'verkaeufer', word: 'Verkäufer', article: 'der', plural: 'Verkäufer', partOfSpeech: 'noun', translation: 'le vendeur', example: 'Jona ist Verkäufer.', note: 'féminin : die Verkäuferin, die Verkäuferinnen' },
    { id: 'fahrer', word: 'Fahrer', article: 'der', plural: 'Fahrer', partOfSpeech: 'noun', translation: 'le chauffeur, le conducteur', example: 'Ben arbeitet als Fahrer.', note: 'féminin : die Fahrerin, die Fahrerinnen' },
    { id: 'firma', word: 'Firma', article: 'die', plural: 'Firmen', partOfSpeech: 'noun', translation: 'l’entreprise', example: 'Die Firma ist in Köln.', note: null },
    { id: 'laden', word: 'Laden', article: 'der', plural: 'Läden', partOfSpeech: 'noun', translation: 'le magasin, la boutique', example: 'Ich arbeite in einem Laden.', note: null },
    { id: 'buchladen', word: 'Buchladen', article: 'der', plural: 'Buchläden', partOfSpeech: 'noun', translation: 'la librairie', example: 'Der Buchladen ist am Markt.', note: null },
    { id: 'kino', word: 'Kino', article: 'das', plural: 'Kinos', partOfSpeech: 'noun', translation: 'le cinéma', example: 'Am Freitag arbeite ich im Kino.', note: null },
    { id: 'uni', word: 'Uni', article: 'die', plural: 'Unis', partOfSpeech: 'noun', translation: 'l’université (familier)', example: 'Ich studiere an der Uni.', note: 'forme courte de die Universität' },
    { id: 'als', word: 'als', article: null, plural: null, partOfSpeech: 'conjunction', translation: 'comme, en tant que', example: 'Ich arbeite als Verkäuferin.', note: 'als + métier, sans article' },
    { id: 'bei', word: 'bei', article: null, plural: null, partOfSpeech: 'preposition', translation: 'chez (un employeur)', example: 'Ich arbeite bei Nordlicht.', note: 'bei + nom de l’entreprise' },
    { id: 'von-bis', word: 'von … bis …', article: null, plural: null, partOfSpeech: 'expression', translation: 'de … à … (une plage horaire)', example: 'Ich arbeite von neun bis elf Uhr.', note: null },
    { id: 'zeit-haben', word: 'Zeit haben', article: null, plural: null, partOfSpeech: 'expression', translation: 'avoir le temps, être libre', example: 'Hast du am Freitag Zeit?', note: null },
    { id: 'sich-treffen', word: 'sich treffen', article: null, plural: null, partOfSpeech: 'verb', translation: 'se retrouver, se rencontrer', example: 'Treffen wir uns vor dem Buchladen?', note: 'wir treffen uns' },
    { id: 'genau', word: 'genau', article: null, plural: null, partOfSpeech: 'adverb', translation: 'exactement, précisément', example: 'Wo arbeitest du genau?', note: null },
  ],
  activities: {
    'a1-arbeit-guide': {
      title: 'Découvrir : présenter son activité et son lieu',
      estimatedMinutes: 15,
      lesson: {
        title: 'Découvrir : présenter son activité et son lieu',
        description: `ÉTUDES, MÉTIER, LIEU ET HORAIRES · 15 MIN

1. Lire deux profils (4 min). « Ich heiße Liv. Ich studiere Kunst an der Uni. Am Montag habe ich von neun bis elf Uhr Kurs. » / « Ich heiße Ben. Ich arbeite als Fahrer. Am Samstag arbeite ich von acht bis zwölf Uhr. » Repérez pour chaque personne l’activité, le jour et les deux heures. Qui étudie ? Qui travaille ?

2. Le métier, l’employeur, le lieu (4 min). Chaque petit mot a son rôle :
• als + métier, sans article : Ich arbeite als Verkäuferin. — Je travaille comme vendeuse.
• bei + employeur : Ich arbeite bei Nordlicht. — Je travaille chez Nordlicht.
• in + lieu : Ich arbeite in einem Laden. — Je travaille dans un magasin.
• an der Uni : la formule habituelle pour l’université : Ich studiere Kunst an der Uni.

3. Une heure ou une plage horaire (3 min). « Um neun Uhr » donne une heure précise ; « von neun bis elf Uhr » donne le début et la fin. Comparez « Ich fange um neun Uhr an » (le début seulement) et « Ich arbeite von neun bis elf Uhr » (toute la plage). Le jour se dit avec am : am Dienstag, am Freitag.

4. Le jour en premier (2 min). Comme dans le module sur la journée, le verbe reste en 2e position quand la phrase commence par le jour : Ich arbeite am Freitag. → Am Freitag arbeite ich.

5. Écouter et dire (2 min). Écoutez les cinq modèles et dites à quoi sert chacun : métier, employeur, lieu, études ou horaire. Puis dites trois phrases sur vous à voix haute, en changeant le métier, le lieu ou l’horaire.`,
      },
    },
    'a1-arbeit-pratique': {
      title: 'Comprendre : les horaires de quelqu’un',
      estimatedMinutes: 12,
      lesson: {
        title: 'Comprendre : les horaires de quelqu’un',
        description: `JONA ET ELIF FONT CONNAISSANCE · 12 MIN

TROIS QUESTIONS UTILES
• Was machst du? — Qu’est-ce que tu fais (dans la vie) ?
• Wo arbeitest du? — Où travailles-tu ?
• Wann arbeitest du? — Quand travailles-tu ?
Et pour proposer un moment : Hast du danach Zeit? — Treffen wir uns vor dem Buchladen?

À VOUS
1. Écoutez le dialogue sans lire la transcription : qui étudie et qui travaille ?
2. Réécoutez et repérez la matière d’Elif, le métier et le lieu de travail de Jona, puis les heures du vendredi. Attention à vierzehn (14) et achtzehn (18).
3. Repérez la question de vérification « Bis achtzehn Uhr? » : on répète l’information pour être sûr d’avoir bien compris.
4. Lisez la transcription et répétez chaque réplique pendant une pause. Redites ensuite le dialogue en remplaçant la matière, le métier ou le jour par les vôtres.`,
      },
    },
    'a1-arbeit-approfondir': {
      title: 'Comprendre : une fiche et un message',
      estimatedMinutes: 12,
      competences: ['lecture', 'expression-orale'],
      lesson: {
        title: 'Comprendre : une fiche et un message',
        description: `LA FICHE DE NIKA · 12 MIN

1. Lire une fiche (4 min). « Name: Nika. Studium: Musik. Ort: Uni. Kurs: Dienstag, 10–12 Uhr. Job: Kino, Freitag, 15–20 Uhr. » La fiche contient deux lignes : les études et le travail. Pour chacune, repérez le jour, le lieu et la plage horaire. Was studiert Nika? Musik. Wo arbeitet Nika? Im Kino.

2. Choisir le bon petit mot (3 min). Lisez ces phrases et dites pourquoi chaque mot convient :
• Ich studiere Musik an der Uni. (l’université)
• Ich arbeite als Verkäuferin. (le métier)
• Ich arbeite bei der Firma Lichtweg. (l’employeur)
• Ich arbeite in einem Kino. (le lieu)

3. Lire un message (3 min). Un ami écrit à Nika : « Treffen wir uns am Freitag um vier Uhr? ». Nika répond : « Am Freitag arbeite ich von fünfzehn bis zwanzig Uhr. Geht es am Dienstag um dreizehn Uhr? ». Repérez le créneau refusé et le créneau proposé. Vérifiez sur la fiche : le mardi, le cours de Nika finit à 12 h, elle est donc libre à 13 h.

4. Le jour ou le lieu en tête (2 min). Dites à voix haute : « Am Freitag arbeite ich im Kino. » puis « Im Kino arbeite ich am Freitag. ». Dans les deux cas, le verbe arbeite reste en 2e position et le sujet ich passe derrière lui.`,
      },
    },
    'a1-arbeit-controle': {
      title: 'Vérifier : métier, lieu et horaires',
      estimatedMinutes: 10,
      lesson: {
        title: 'Vérifier : métier, lieu et horaires',
        description: 'Écoutez le dialogue une première fois pour la situation générale. Lisez les questions, puis réécoutez pour les détails. Les trois dernières questions portent sur les phrases à employer pour parler de soi. La transcription s’affiche après votre réponse.',
      },
      explanations: {
        q1: 'Elif se présente : « Ich studiere Design an der Uni ». La musique est la matière de Nika, dans la fiche ; l’allemand n’est pas cité.',
        q2: '« Von neun bis elf Uhr » : von donne le début (9 h) et bis la fin (11 h). Midi n’est pas mentionné.',
        q3: 'Jona dit « Ich arbeite als Verkäufer bei Nordlicht » : als introduit le métier, et Verkäufer veut dire « vendeur ». Nordlicht est le nom de l’employeur.',
        q4: '« In einem Buchladen am Markt » : der Buchladen est une librairie (das Buch, le livre). Le cinéma est le lieu de travail de Nika, pas de Jona.',
        q5: 'Jona travaille jusqu’à 18 h, puis il propose « um neunzehn Uhr » devant la librairie. 14 h et 18 h sont le début et la fin de son travail.',
        q6: 'Als + nom de métier, sans article : « Ich arbeite als Verkäuferin ». Bei donne l’employeur (bei Nordlicht) et in le lieu (in einem Buchladen).',
        q7: '« Ich studiere Musik an der Uni » : studieren et an der Uni situent les études. Les deux autres phrases parlent de travail (arbeiten).',
        q8: 'Une plage horaire se dit von … bis … : von vierzehn bis achtzehn Uhr. « Um vier Uhr » donne une heure précise, et anfangen seulement le début.',
      },
    },
    'a1-arbeit-mission': {
      kind: 'mission',
      title: 'Mission : se présenter et fixer un rendez-vous',
      estimatedMinutes: 20,
      competences: ['expression-orale', 'expression-ecrite'],
      lesson: {
        title: 'Mission : se présenter et fixer un rendez-vous',
        description: `Vous rencontrez une personne de votre cours d’allemand. Elle vous demande ce que vous faites, puis elle propose de vous voir vendredi à 16 heures. Ce créneau ne vous convient pas : vous expliquez pourquoi et vous proposez un autre moment.

MODÈLE
Ich heiße Jona. Ich arbeite als Verkäufer bei Nordlicht, in einem Buchladen am Markt. Am Freitag arbeite ich von vierzehn bis achtzehn Uhr. Um sechzehn Uhr? Da arbeite ich. Aber um neunzehn Uhr habe ich Zeit. Treffen wir uns vor dem Buchladen?

POUR VOUS AIDER
• Ich studiere … an der Uni. / Ich arbeite als … bei … in …
• Am … arbeite ich von … bis … Uhr. / Am … habe ich von … bis … Uhr Kurs.
• Da arbeite ich. / Da habe ich Kurs. — Geht es am … um … Uhr? / Um … Uhr habe ich Zeit.`,
      },
      mission: {
        oral: {
          prompt: 'Enregistrez votre réponse : présentez votre activité (études ou travail), votre lieu et deux horaires de la semaine. Répondez ensuite à la proposition « Treffen wir uns am Freitag um sechzehn Uhr? » : refusez en expliquant pourquoi, puis proposez un autre jour et une autre heure.',
          maxSeconds: 90,
        },
        written: {
          prompt: 'Écrivez votre profil en quatre phrases (activité, lieu, jours et horaires), puis un court message qui confirme le nouveau rendez-vous avec le jour, l’heure et le lieu.',
          maxChars: 700,
          minWords: 30,
        },
        checklist: [
          'J’ai employé als pour le métier, bei pour l’employeur, in pour le lieu ou an der Uni pour les études.',
          'J’ai donné au moins une plage horaire avec von … bis … et un jour avec am.',
          'J’ai refusé 16 heures avec une raison (Da arbeite ich. / Da habe ich Kurs.) et proposé un autre créneau.',
          'Quand ma phrase commence par le jour ou l’heure, le verbe vient juste après, avant le sujet.',
          'Le rendez-vous confirmé dans mon message est le nouveau, pas celui que j’ai refusé.',
        ],
      },
    },
  },
  add: [
    {
      after: 'a1-arbeit-approfondir',
      activity: {
        id: 'a1-arbeit-entrainer',
        kind: 'exercise',
        title: 'S’entraîner : noter un emploi du temps',
        estimatedMinutes: 12,
        competences: ['ecoute', 'expression-ecrite'],
        lesson: {
          title: 'S’entraîner : noter un emploi du temps',
          description: 'Écoutez de nouveau le dialogue entre Jona et Elif et complétez les fiches : les heures peuvent s’écrire en chiffres. Complétez ensuite les phrases, remettez les mots dans l’ordre, puis écrivez les deux phrases dictées. La transcription s’affiche après votre réponse.',
          transcript: null,
        },
        placements: [DIALOGUE],
        questions: [
          {
            id: 'q1', type: 'fill', prompt: 'Écoutez le dialogue et complétez la fiche d’Elif.',
            text: 'Studium: [[1]] · Kurs am Freitag: von [[2]] bis [[3]] Uhr',
            blanks: [
              { id: '1', accept: ['Design'], size: 8, hint: null },
              { id: '2', accept: ['9', 'neun'], size: 5, hint: null },
              { id: '3', accept: ['11', 'elf'], size: 5, hint: null },
            ],
            explanation: 'Elif dit « Ich studiere Design an der Uni » et, pour le vendredi, « von neun bis elf Uhr » : von donne le début, bis la fin.',
          },
          {
            id: 'q2', type: 'fill', prompt: 'Complétez maintenant la fiche de Jona.',
            text: 'Beruf: [[1]] · Ort: ein [[2]] am Markt · Freitag: von [[3]] bis [[4]] Uhr',
            blanks: [
              { id: '1', accept: ['Verkäufer'], size: 10, hint: null },
              { id: '2', accept: ['Buchladen'], size: 10, hint: null },
              { id: '3', accept: ['14', 'vierzehn'], size: 8, hint: null },
              { id: '4', accept: ['18', 'achtzehn'], size: 8, hint: null },
            ],
            explanation: 'Jona dit « Ich arbeite als Verkäufer » et « In einem Buchladen am Markt ». Le vendredi, il travaille « von vierzehn bis achtzehn Uhr » : 14 h, puis 18 h, pas 4 h ni 8 h.',
          },
          {
            id: 'q3', type: 'fill', prompt: 'Où et quand Jona et Elif se retrouvent-ils ? Complétez.',
            text: 'Treffpunkt: um [[1]] Uhr vor dem [[2]]',
            blanks: [{ id: '1', accept: ['19', 'neunzehn'], size: 8, hint: null }, { id: '2', accept: ['Buchladen'], size: 10, hint: null }],
            explanation: 'Jona propose « um neunzehn Uhr » puis « Treffen wir uns vor dem Buchladen? », et Elif accepte. Neunzehn (19) n’est pas neun (9) : écoutez la fin du mot.',
          },
          {
            id: 'q4', type: 'fill', prompt: 'Complétez avec als, bei, in ou an.',
            text: 'Ich arbeite [[1]] Verkäuferin [[2]] Nordlicht, [[3]] einem Laden. Ich studiere Musik [[4]] der Uni.',
            blanks: [
              { id: '1', accept: ['als'], size: 4, hint: null },
              { id: '2', accept: ['bei'], size: 4, hint: null },
              { id: '3', accept: ['in'], size: 4, hint: null },
              { id: '4', accept: ['an'], size: 4, hint: null },
            ],
            explanation: 'Als introduit le métier (sans article), bei l’employeur, in le lieu (in einem Laden) ; pour l’université, on dit an der Uni.',
          },
          {
            id: 'q5', type: 'order', prompt: 'Remettez les mots dans l’ordre. La phrase commence par « Am Freitag ».',
            answers: [['Am Freitag', 'arbeite', 'ich', 'von vierzehn bis achtzehn Uhr.']],
            explanation: 'Le jour est en tête : le verbe arbeite reste en 2e position et le sujet ich passe derrière. « Am Freitag ich arbeite » calque le français.',
          },
          {
            id: 'q6', type: 'order', prompt: 'Remettez les mots dans l’ordre. La phrase commence par « Am Dienstag ».',
            answers: [['Am Dienstag', 'habe', 'ich', 'von zehn bis zwölf Uhr', 'Kurs.']],
            explanation: 'Après « Am Dienstag », le verbe habe vient en 2e position, puis ich. La plage horaire précède le nom Kurs, qui ferme la phrase : « … von zehn bis zwölf Uhr Kurs ».',
          },
          {
            id: 'q7', type: 'match', prompt: 'Associez chaque question à la réponse de Jona ou d’Elif.',
            pairs: [
              { left: 'Was machst du?', right: 'Ich studiere Design an der Uni.' },
              { left: 'Wo arbeitest du genau?', right: 'In einem Buchladen am Markt.' },
              { left: 'Wann arbeitest du am Freitag?', right: 'Von vierzehn bis achtzehn Uhr.' },
              { left: 'Hast du danach Zeit?', right: 'Ja, um neunzehn Uhr.' },
            ],
            explanation: 'Was demande l’activité, wo le lieu (in …), wann le moment (von … bis …). « Hast du Zeit? » demande si l’on est libre : on répond par oui ou non et une heure.',
          },
          {
            id: 'q8', type: 'dictation', prompt: 'Dictée : écoutez la phrase sur un horaire de travail et écrivez-la.',
            accept: ['Am Montag arbeite ich von acht bis zwölf Uhr.'], voice: 'frau',
            explanation: 'Am Montag en tête : arbeite en 2e position, puis ich. Von acht bis zwölf Uhr donne la plage ; les nombres peuvent s’écrire en chiffres (8, 12).',
          },
          {
            id: 'q9', type: 'dictation', prompt: 'Dictée : écoutez la phrase sur un métier et écrivez-la.',
            accept: ['Ich arbeite als Verkäufer in einem Buchladen.'], voice: 'mann',
            explanation: 'Als + métier, sans article : als Verkäufer. Dans Verkäufer, äu se prononce « oï ». Buchladen est un nom composé, en un seul mot, avec une majuscule.',
          },
        ],
      },
    },
    {
      after: 'a1-arbeit-entrainer',
      activity: {
        id: 'a1-arbeit-repeter',
        kind: 'exercise',
        title: 'Répéter à voix haute : parler de son travail',
        estimatedMinutes: 8,
        competences: ['expression-orale'],
        lesson: {
          title: 'Répéter à voix haute : parler de son travail',
          description: 'Écoutez chaque modèle autant de fois que nécessaire, puis dites la phrase sans vous presser. Quand la phrase commence par le jour, faites entendre le verbe juste après : Am Freitag ARBEITE ich …',
          transcript: null,
        },
        placements: [],
        questions: [
          speak('q1', 'Ich arbeite als Verkäuferin.', 'Dans Verkäuferin, v se prononce [f] et äu se dit « oï » : « fer-KOÏ-fe-rin ». Als s’emploie sans article devant le métier.'),
          speak('q2', 'Ich studiere Design an der Uni.', 'Studiere commence par « cht ». Design se prononce à l’anglaise, et Uni avec un u comme dans « ou ».'),
          speak('q3', 'Am Freitag arbeite ich von zwei bis sechs Uhr.', 'Le verbe arbeite vient juste après Am Freitag. Zwei commence par « ts » et sechs se termine par « ks ».', ['Am Freitag arbeite ich von zwei bis sechs Uhr.', 'Am Freitag arbeite ich von 2 bis 6 Uhr.']),
          speak('q4', 'Wo arbeitest du genau?', 'Wo se prononce « vo ». Genau commence par un g dur, comme dans « gâteau », et au se dit « ao ». La voix descend à la fin.'),
          speak('q5', 'Hast du am Freitag Zeit?', 'Question sans mot interrogatif : le verbe hast ouvre la phrase et la voix monte à la fin. Zeit se dit « tsaït ».'),
          speak('q6', 'Um neunzehn Uhr habe ich Zeit.', 'Neunzehn (19), avec la fin -zehn, ne se confond pas avec neun (9). Après Um neunzehn Uhr, le verbe habe vient avant ich.', ['Um neunzehn Uhr habe ich Zeit.', 'Um 19 Uhr habe ich Zeit.']),
        ],
      },
    },
  ],
  order: ['a1-arbeit-guide', 'a1-arbeit-pratique', 'a1-arbeit-approfondir', 'a1-arbeit-entrainer', 'a1-arbeit-repeter', 'a1-arbeit-controle', 'a1-arbeit-mission'],
};
