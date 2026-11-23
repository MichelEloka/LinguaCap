// Couche pédagogique V4 · A1 · Atelier : parler de sa famille et inviter à un anniversaire.
const REPEAT = 'Écoutez le modèle, puis dites la phrase à voix haute.';
const speak = (id, text, explanation, accept = [text]) => ({ id, type: 'speak', prompt: REPEAT, text, accept, explanation });
const DIALOGUE = { media: 'a1-familie-atelier-dialogue', usage: 'audio', transcriptVisibility: 'after_answer', decorative: false };

export default {
  module: 'a1-familie-atelier',
  vocabulary: [
    { id: 'party', word: 'Party', article: 'die', plural: 'Partys', partOfSpeech: 'noun', translation: 'la fête (entre amis)', example: 'Die Party beginnt um sieben Uhr.', note: null },
    { id: 'fest', word: 'Fest', article: 'das', plural: 'Feste', partOfSpeech: 'noun', translation: 'la fête', example: 'Das Fest ist am Samstag.', note: null },
    { id: 'kuchen', word: 'Kuchen', article: 'der', plural: 'Kuchen', partOfSpeech: 'noun', translation: 'le gâteau', example: 'Ich bringe einen Kuchen mit.', note: null },
    { id: 'mitbringen', word: 'mitbringen', article: null, plural: null, partOfSpeech: 'verb', translation: 'apporter', example: 'Kannst du einen Kuchen mitbringen?', note: 'séparable : mit|bringen ; ich bringe … mit' },
    { id: 'beginnen', word: 'beginnen', article: null, plural: null, partOfSpeech: 'verb', translation: 'commencer', example: 'Wir beginnen um sechs Uhr.', note: 'die Party beginnt um …' },
    { id: 'werden', word: 'werden', article: null, plural: null, partOfSpeech: 'verb', translation: 'devenir ; (âge) avoir bientôt', example: 'Ich will Lehrerin werden.', note: 'ich werde, du wirst, er/sie wird ; sie wird achtzehn : elle va avoir 18 ans' },
    { id: 'abends', word: 'abends', article: null, plural: null, partOfSpeech: 'adverb', translation: 'le soir', example: 'Die Party beginnt um sechs Uhr abends.', note: null },
    { id: 'bei', word: 'bei', article: null, plural: null, partOfSpeech: 'preposition', translation: 'chez', example: 'Wir feiern bei meinen Eltern.', note: '+ datif : bei mir, bei uns, bei meinen Eltern' },
    { id: 'auch', word: 'auch', article: null, plural: null, partOfSpeech: 'adverb', translation: 'aussi', example: 'Kommst du auch?', note: null },
    { id: 'mein', word: 'mein', article: null, plural: null, partOfSpeech: 'pronoun', translation: 'mon, ma, mes', example: 'Mein Bruder kommt um sieben.', note: 'meine devant un nom féminin ou pluriel : meine Schwester, meine Eltern' },
    { id: 'dein', word: 'dein', article: null, plural: null, partOfSpeech: 'pronoun', translation: 'ton, ta, tes', example: 'Kommt dein Bruder auch?', note: 'deine devant un nom féminin ou pluriel : deine Schwester' },
    { id: 'samstag', word: 'Samstag', article: 'der', plural: 'Samstage', partOfSpeech: 'noun', translation: 'le samedi', example: 'Wir feiern am Samstag.', note: 'am Samstag : samedi' },
    { id: 'mai', word: 'Mai', article: 'der', plural: null, partOfSpeech: 'noun', translation: 'mai', example: 'Jule hat am zwölften Mai Geburtstag.', note: 'les mois sont masculins ; am zwölften Mai' },
    { id: 'ja-gern', word: 'Ja, gern!', article: null, plural: null, partOfSpeech: 'expression', translation: 'Oui, avec plaisir !', example: 'Kommst du auch? – Ja, gern!', note: null },
    { id: 'viele-gruesse', word: 'Viele Grüße', article: null, plural: null, partOfSpeech: 'expression', translation: 'Amitiés (pour finir un message)', example: 'Viele Grüße, Sara', note: null },
  ],
  activities: {
    'a1-familie-atelier-guide': {
      title: 'Découvrir : l’invitation de Sara',
      estimatedMinutes: 15,
      lesson: {
        title: 'Découvrir : l’invitation de Sara',
        description: `L’INVITATION DE SARA · 15 MIN

1. Lire (5 min). Lisez l’invitation : « Hallo Ali! Mein Bruder Emil hat am dritten Juni Geburtstag. Meine Eltern feiern mit ihm am fünften Juni. Die Party beginnt um sieben Uhr abends bei uns. Kommst du auch? Viele Grüße, Sara ». Repérez qui fête son anniversaire, la date de l’anniversaire, la date de la fête, l’heure et le lieu. Attention : l’anniversaire (le 3 juin) et la fête (le 5 juin) ne tombent pas le même jour.

2. Désigner la bonne personne (5 min). Comparez « mein Bruder », « meine Schwester » et « meine Eltern » : mein devant un nom masculin ou neutre, meine devant un nom féminin ou pluriel. Pour parler de la famille de votre interlocuteur, remplacez mein par dein et meine par deine. Lisez à voix haute : « Kommt dein Bruder auch? – Ja, mein Bruder kommt. », puis « Kommt deine Schwester auch? – Nein, meine Schwester kommt nicht. »

3. Dire une date (5 min). Lisez « am dritten Juni », « am fünften Juni » et « am zwölften Mai » en regardant les dates 3. Juni, 5. Juni et 12. Mai. Après am, l’ordinal se termine par -ten. Dites ensuite votre date d’anniversaire : « Ich habe am … Geburtstag. »`,
      },
    },
    'a1-familie-atelier-pratique': {
      title: 'Comprendre : une fête chez les parents',
      estimatedMinutes: 12,
      lesson: {
        title: 'Comprendre : une fête chez les parents',
        description: `UNE FÊTE CHEZ LES PARENTS · 12 MIN

Une jeune femme annonce une fête à un ami. Deux dates reviennent : celle de l’anniversaire et celle de la fête.

1. Première écoute (3 min), sans la transcription : de qui fête-t-on l’anniversaire, et l’ami vient-il ?
2. Deuxième écoute (4 min) : repérez les deux dates, l’âge, le lieu et les deux heures, celle du début de la fête et celle où arrive le frère. Vérifiez ensuite avec la transcription.
3. Phrases utiles (5 min). Répétez chaque phrase pendant une pause :
• Meine Schwester hat am zwölften Mai Geburtstag. — Ma sœur a son anniversaire le 12 mai.
• Sie wird achtzehn. — Elle va avoir 18 ans.
• Wir feiern am Samstag bei meinen Eltern. — Nous faisons la fête samedi chez mes parents.
• Kommt dein Bruder auch? — Ton frère vient aussi ?
• Ich bringe einen Kuchen mit. — J’apporte un gâteau. (mitbringen est séparable : bringe … mit)`,
      },
    },
    'a1-familie-atelier-controle': {
      title: 'Vérifier : comprendre une invitation',
      estimatedMinutes: 10,
      lesson: {
        title: 'Vérifier : comprendre une invitation',
        description: 'Écoutez la scène une première fois pour la situation générale. Lisez les questions, puis réécoutez pour les détails. Les deux dernières questions portent sur les possessifs et les dates. Après la validation, chaque question affiche la réponse attendue et une explication.',
      },
      explanations: {
        q1: 'La première voix dit « Meine Schwester Jule hat am zwölften Mai Geburtstag » : Schwester, c’est la sœur. Le frère n’est cité qu’à la fin : il arrive à sept heures.',
        q2: 'À la question « Wird sie zwanzig? », la réponse est « Nein, sie wird achtzehn » : elle va avoir 18 ans. Zwanzig (20) est la supposition erronée de l’ami.',
        q3: 'L’anniversaire tombe le 12 mai, mais la fête a lieu « am Samstag, am sechzehnten Mai ». Sechzehn = 16 : ne le confondez pas avec sechs (6).',
        q4: '« Die Party beginnt um sechs Uhr abends » : six heures du soir, soit 18 h. 19 h (um sieben) est l’heure à laquelle arrive le frère.',
        q5: 'Schwester est féminin : meine Schwester. « Mein Schwester » oublie la terminaison -e, et deine signifie « ta ».',
        q6: 'Pour une date précise : am + ordinal en -ten, am zwölften Mai. Im s’emploie avec un mois seul (im Mai) et um avec une heure (um zwölf Uhr).',
      },
    },
    'a1-familie-atelier-mission': {
      kind: 'mission',
      title: 'Mission : inviter à un anniversaire',
      estimatedMinutes: 20,
      competences: ['expression-orale', 'expression-ecrite'],
      lesson: {
        title: 'Mission : inviter à un anniversaire',
        description: `Une personne de votre famille fête son anniversaire, mais la fête a lieu un autre jour. Vous invitez un ami : d’abord par un message vocal, puis par écrit.

MODÈLE
Hallo Ali! Meine Schwester hat am zwölften Mai Geburtstag. Sie wird achtzehn. Wir feiern am Samstag, am sechzehnten Mai, um sechs Uhr abends bei meinen Eltern. Kommst du auch? Viele Grüße, Sara`,
      },
      mission: {
        oral: {
          prompt: 'Laissez un message vocal à un ami : dites qui fête son anniversaire (mein Bruder, meine Schwester…) et à quelle date, puis donnez séparément la date de la fête, l’heure et le lieu. Terminez en demandant s’il vient.',
          maxSeconds: 60,
        },
        written: {
          prompt: 'Écrivez l’invitation en cinq phrases au moins : une salutation, qui fête son anniversaire et quel âge il ou elle aura, la date de la fête avec am …, l’heure avec um …, le lieu, une question (Kommst du auch?) et une formule pour finir.',
          maxChars: 600,
          minWords: 25,
        },
        checklist: [
          'J’ai employé mein ou meine correctement : mein Bruder, meine Schwester, meine Eltern.',
          'J’ai bien séparé la date de l’anniversaire et celle de la fête.',
          'J’ai dit les dates avec am + ordinal en -ten (am zwölften Mai) et l’heure avec um.',
          'Mon invitation donne le lieu et se termine par une question (Kommst du auch?) et une formule (Viele Grüße).',
        ],
      },
    },
  },
  add: [
    {
      after: 'a1-familie-atelier-pratique',
      activity: {
        id: 'a1-familie-atelier-entrainer',
        kind: 'exercise',
        title: 'S’entraîner : dates, mein et dein',
        estimatedMinutes: 10,
        competences: ['ecoute', 'expression-ecrite'],
        lesson: {
          title: 'S’entraîner : dates, mein et dein',
          description: 'Réécoutez la scène et complétez les notes de l’ami, puis travaillez les possessifs, la place du verbe et les dates. Pour finir, écrivez deux phrases dictées. La transcription de la scène s’affichera après votre réponse.',
          transcript: null,
        },
        placements: [DIALOGUE],
        questions: [
          {
            id: 'q1', type: 'fill', prompt: 'Écoutez la scène et complétez les notes de l’ami (les nombres en chiffres).',
            text: 'Geburtstag von Jule: [[1]]. Mai · Party: Samstag, [[2]]. Mai · Beginn: [[3]] Uhr abends · Ort: bei ihren [[4]]',
            blanks: [
              { id: '1', accept: ['12'], size: 4, hint: null },
              { id: '2', accept: ['16'], size: 4, hint: null },
              { id: '3', accept: ['6', '18'], size: 4, hint: null },
              { id: '4', accept: ['Eltern'], size: 8, hint: null },
            ],
            explanation: 'On entend « am zwölften Mai » (12) pour l’anniversaire, « am sechzehnten Mai » (16) pour la fête, « um sechs Uhr abends » (18 h) et « bei meinen Eltern ». Ne confondez pas sechzehn (16) et sechzig (60).',
          },
          {
            id: 'q2', type: 'fill', prompt: 'Complétez la suite des notes.',
            text: 'Um sieben Uhr kommt ihr [[1]]. Der Gast bringt einen [[2]] mit.',
            blanks: [{ id: '1', accept: ['Bruder'], size: 8, hint: null }, { id: '2', accept: ['Kuchen'], size: 8, hint: null }],
            explanation: 'La sœur dit « mein Bruder kommt um sieben » : c’est le frère qui arrive à 19 h, une heure après le début. L’ami promet « Ich bringe einen Kuchen mit » : mitbringen veut dire apporter.',
          },
          {
            id: 'q3', type: 'fill', prompt: 'Complétez avec mein, meine, dein ou deine.',
            text: 'Kommt [[1]] Bruder auch? – Ja, [[2]] Bruder kommt. Und [[3]] Eltern?',
            blanks: [
              { id: '1', accept: ['dein'], size: 6, hint: null },
              { id: '2', accept: ['mein'], size: 6, hint: null },
              { id: '3', accept: ['deine'], size: 6, hint: null },
            ],
            explanation: 'On interroge l’autre sur son frère : dein Bruder ; il répond pour lui-même : mein Bruder. Devant Eltern, toujours au pluriel, on ajoute -e : deine Eltern.',
          },
          {
            id: 'q4', type: 'order', prompt: 'Remettez les mots dans l’ordre.',
            answers: [['Am Samstag', 'feiern', 'wir', 'bei meinen Eltern.']],
            explanation: 'Quand la phrase commence par un complément de temps (Am Samstag), le verbe feiern reste en 2e position et le sujet wir vient juste après. « Am Samstag wir feiern » calque le français.',
          },
          {
            id: 'q5', type: 'order', prompt: 'Remettez les mots dans l’ordre.',
            answers: [['Meine Schwester', 'hat', 'am zwölften Mai', 'Geburtstag.']],
            explanation: 'Dans Geburtstag haben (avoir son anniversaire), hat prend la 2e place et Geburtstag ferme la phrase ; la date se glisse entre les deux.',
          },
          {
            id: 'q6', type: 'match', prompt: 'Associez chaque question à sa réponse.',
            pairs: [
              { left: 'Wann hat Jule Geburtstag?', right: 'Am zwölften Mai.' },
              { left: 'Wie alt wird sie?', right: 'Achtzehn.' },
              { left: 'Wo feiert ihr?', right: 'Bei meinen Eltern.' },
              { left: 'Wann beginnt die Party?', right: 'Um sechs Uhr abends.' },
              { left: 'Kommt dein Bruder auch?', right: 'Ja, um sieben.' },
            ],
            explanation: 'Wann appelle une date (am …) ou une heure (um …), wie alt un âge et wo un lieu (bei …). Une question qui commence par le verbe (Kommt …?) appelle ja ou nein.',
          },
          {
            id: 'q7', type: 'dictation', prompt: 'Écoutez et écrivez la phrase.', voice: 'frau',
            accept: ['Die Party beginnt um sieben Uhr abends.'],
            explanation: 'L’heure s’introduit par um : um sieben Uhr abends (19 h). Party est un nom (majuscule) et le verbe beginnt occupe la 2e position.',
          },
          {
            id: 'q8', type: 'dictation', prompt: 'Écoutez et écrivez la question.', voice: 'mann',
            accept: ['Kommt deine Schwester auch zur Party?'],
            explanation: 'Question oui/non : le verbe kommt ouvre la phrase. Deine prend -e devant Schwester, nom féminin ; zur = zu der, devant die Party.',
          },
        ],
      },
    },
    {
      after: 'a1-familie-atelier-entrainer',
      activity: {
        id: 'a1-familie-atelier-repeter',
        kind: 'exercise',
        title: 'Répéter à voix haute : annoncer une fête',
        estimatedMinutes: 8,
        competences: ['expression-orale'],
        lesson: {
          title: 'Répéter à voix haute : annoncer une fête',
          description: 'Écoutez chaque modèle autant de fois que nécessaire, puis dites la phrase sans vous presser. Articulez bien les dates : la terminaison -ten de l’ordinal doit s’entendre.',
          transcript: null,
        },
        placements: [],
        questions: [
          speak('q1', 'Meine Schwester hat am zwölften Mai Geburtstag.', 'Am zwölften : -ten après am. Dans zwölften, arrondissez les lèvres sur ö. Accentuez Ge-BURTS-tag.', ['Meine Schwester hat am zwölften Mai Geburtstag.', 'Meine Schwester hat am 12. Mai Geburtstag.']),
          speak('q2', 'Wir feiern am Samstag bei meinen Eltern.', 'Dans feiern et meinen, ei se dit « aï ». Eltern commence par un e ouvert, comme « è ».'),
          speak('q3', 'Die Party beginnt um sechs Uhr.', 'L’accent de beginnt tombe sur -GINNT. Dans sechs, chs se prononce « ks ».', ['Die Party beginnt um sechs Uhr.', 'Die Party beginnt um 6 Uhr.']),
          speak('q4', 'Kommt dein Bruder auch?', 'Question oui/non : la voix monte sur auch. Dans dein, ei se dit « aï » ; la finale -er de Bruder sonne comme un petit « a ».'),
          speak('q5', 'Ja, gern! Ich bringe einen Kuchen mit.', 'Mitbringen est séparable : bringe en 2e position, mit à la fin. Dans Kuchen, le ch après u se forme au fond de la gorge.'),
          speak('q6', 'Viele Grüße und bis Samstag!', 'Viele Grüße termine un message amical. Arrondissez les lèvres sur ü ; ß se prononce comme un s dur.'),
        ],
      },
    },
  ],
  order: [
    'a1-familie-atelier-guide', 'a1-familie-atelier-pratique', 'a1-familie-atelier-entrainer', 'a1-familie-atelier-repeter',
    'a1-familie-atelier-controle', 'a1-familie-atelier-mission',
  ],
};
