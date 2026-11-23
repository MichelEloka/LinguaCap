// Couche pédagogique V4 · A1 · Atelier : proposer une sortie et confirmer le rendez-vous.
const REPEAT = 'Écoutez le modèle, puis dites la phrase à voix haute.';
const speak = (id, text, explanation, accept = [text]) => ({ id, type: 'speak', prompt: REPEAT, text, accept, explanation });
const DICTATION = 'Écoutez et écrivez la phrase. Écrivez les nombres en toutes lettres.';
const dialogue = { media: 'a1-freizeit-atelier-dialogue', usage: 'audio', transcriptVisibility: 'after_answer', decorative: false };

export default {
  module: 'a1-freizeit-atelier',
  vocabulary: [
    { id: 'zeit', word: 'Zeit', article: 'die', plural: 'Zeiten', partOfSpeech: 'noun', translation: 'le temps (disponible)', example: 'Hast du am Samstag Zeit?', note: 'Zeit haben : être libre, avoir le temps' },
    { id: 'koennen', word: 'können', article: null, plural: null, partOfSpeech: 'verb', translation: 'pouvoir', example: 'Wir können ins Kino gehen.', note: 'ich kann, du kannst, wir können ; infinitif à la fin' },
    { id: 'lieber', word: 'lieber', article: null, plural: null, partOfSpeech: 'adverb', translation: 'plutôt, de préférence', example: 'Ich gehe lieber schwimmen.', note: 'gern → lieber : aimer → préférer' },
    { id: 'kino', word: 'Kino', article: 'das', plural: 'Kinos', partOfSpeech: 'noun', translation: 'le cinéma', example: 'Gehst du gern ins Kino?', note: 'ins Kino gehen : aller au cinéma' },
    { id: 'schwimmbad', word: 'Schwimmbad', article: 'das', plural: 'Schwimmbäder', partOfSpeech: 'noun', translation: 'la piscine', example: 'Wir treffen uns vor dem Schwimmbad.', note: null },
    { id: 'park', word: 'Park', article: 'der', plural: 'Parks', partOfSpeech: 'noun', translation: 'le parc', example: 'Wir können im Park Fußball spielen.', note: null },
    { id: 'rad-fahren', word: 'Rad fahren', article: null, plural: null, partOfSpeech: 'verb', translation: 'faire du vélo', example: 'Am Sonntag können wir Rad fahren.', note: 'ich fahre Rad' },
    { id: 'treffen', word: 'treffen', article: null, plural: null, partOfSpeech: 'verb', translation: 'rencontrer ; sich treffen : se retrouver', example: 'Wir treffen uns vor dem Kino.', note: 'du triffst, er trifft' },
    { id: 'regnen', word: 'regnen', article: null, plural: null, partOfSpeech: 'verb', translation: 'pleuvoir', example: 'Morgen kann es regnen.', note: 'Es regnet : il pleut.' },
    { id: 'leider', word: 'leider', article: null, plural: null, partOfSpeech: 'adverb', translation: 'malheureusement', example: 'Um vier kann ich leider nicht.', note: null },
    { id: 'vor', word: 'vor', article: null, plural: null, partOfSpeech: 'preposition', translation: 'devant', example: 'Wir treffen uns vor dem Kino.', note: 'lieu : vor + datif (vor dem Kino)' },
    { id: 'samstag', word: 'Samstag', article: 'der', plural: 'Samstage', partOfSpeech: 'noun', translation: 'le samedi', example: 'Hast du am Samstag Zeit?', note: 'am Samstag : samedi (ce samedi-là)' },
    { id: 'geht-es', word: 'Geht es …?', article: null, plural: null, partOfSpeech: 'expression', translation: 'Est-ce possible … ?', example: 'Geht es um fünf?', note: null },
    { id: 'das-passt', word: 'Das passt.', article: null, plural: null, partOfSpeech: 'expression', translation: 'Ça me convient.', example: 'Um vier? Ja, das passt.', note: null },
  ],
  activities: {
    'a1-freizeit-atelier-guide': {
      title: 'Découvrir : proposer, préférer, déplacer',
      estimatedMinutes: 15,
      lesson: {
        title: 'Découvrir : proposer, préférer, déplacer',
        description: `PROPOSER UNE SORTIE · 15 MIN

1. Lire un échange (5 min). Lukas écrit à Aylin : « Am Sonntag können wir Rad fahren. Hast du um zwei Uhr Zeit? » Aylin répond : « Um zwei kann ich nicht. Ich gehe auch lieber ins Schwimmbad. Hast du um vier Zeit? » Lukas confirme : « Ja, das passt. Wir treffen uns vor dem Schwimmbad. ». Repérez la première proposition (Rad fahren, um zwei), ce qui change (ins Schwimmbad, um vier) et le lieu du rendez-vous (vor dem Schwimmbad).

2. Aimer, préférer, proposer (5 min). « Ich spiele gern Fußball » dit que vous aimez l’activité. « Ich gehe lieber schwimmen » exprime une préférence : lieber veut dire « plutôt, de préférence ». Pour proposer, on dit « Wir können Rad fahren » : le verbe können est conjugué en deuxième position et l’infinitif (Rad fahren) termine la phrase. Formez à voix haute deux propositions : Wir können tanzen. Wir können Musik hören.

3. Accepter ou déplacer (5 min). Lisez ces quatre répliques et dites leur rôle : « Hast du am Mittwoch Zeit? » (demander), « Ja, gern! » (accepter), « Um vier kann ich leider nicht. » (refuser un horaire), « Geht es um fünf? » (proposer un autre horaire). Dans « Um vier kann ich leider nicht », l’heure ouvre la phrase : kann reste en deuxième position et le sujet ich vient juste après.`,
      },
    },
    'a1-freizeit-atelier-pratique': {
      title: 'Comprendre : un projet pour samedi',
      estimatedMinutes: 12,
      lesson: {
        title: 'Comprendre : un projet pour samedi',
        description: `UN PROJET QUI CHANGE · 12 MIN

PHRASES UTILES
• Hast du am Samstag Zeit? — Tu es libre samedi ?
• Wir können im Park Fußball spielen. — On peut jouer au foot au parc.
• Es regnet am Samstag. — Il pleut samedi.
• Dann können wir ins Kino gehen. — Alors on peut aller au cinéma.
• Kannst du um vier Uhr? — Tu peux à quatre heures ?
• Geht es um fünf? — C’est possible à cinq heures ?
• Treffen wir uns vor dem Kino? — On se retrouve devant le cinéma ?

À VOUS
1. Écoutez la scène sans lire la transcription : quelle activité est proposée d’abord, et pourquoi le projet change-t-il ?
2. Réécoutez et repérez le jour, l’heure refusée, l’heure acceptée et le lieu du rendez-vous.
3. Affichez la transcription. Repérez chaque forme de können (können, kannst, kann) et l’infinitif placé à la fin de la phrase.
4. Lisez les deux rôles à voix haute, puis redites la scène avec une autre activité (schwimmen gehen) et d’autres heures.`,
      },
    },
    'a1-freizeit-atelier-controle': {
      title: 'Vérifier : un rendez-vous pour samedi',
      estimatedMinutes: 10,
      lesson: {
        title: 'Vérifier : un rendez-vous pour samedi',
        description: 'Écoutez la scène une première fois pour la situation générale. Lisez les questions, puis réécoutez pour les détails : l’activité, la météo, l’heure et le lieu. Les deux dernières questions vérifient les phrases à réemployer. La transcription s’affiche après votre réponse.',
      },
      explanations: {
        q1: 'La première proposition est « Wir können im Park Fußball spielen ». Le cinéma n’arrive qu’ensuite, à cause de la pluie ; le vélo n’est pas proposé.',
        q2: '« Aber es regnet am Samstag » : regnen veut dire « pleuvoir ». C’est pour cela que le projet devient « Dann können wir ins Kino gehen ».',
        q3: 'Quatre heures est refusé (« Um vier kann ich nicht »). L’autre propose « Geht es um fünf? », et la réponse confirme : « Ja, fünf Uhr passt ».',
        q4: '« Treffen wir uns vor dem Kino? » – « Ja, vor dem Kino » : vor signifie « devant ». Le parc était le lieu du premier projet, abandonné.',
        q5: 'Avec können, le verbe conjugué est en 2e position et l’infinitif spielen va à la fin : Wir können Fußball spielen. L’ordre français (« pouvons jouer au football ») est faux en allemand.',
        q6: 'Lieber exprime la préférence : Ich lese lieber (je préfère lire). « Ich kann lesen » dit seulement qu’on sait lire, et « nicht gern » qu’on n’aime pas.',
      },
    },
    'a1-freizeit-atelier-mission': {
      kind: 'mission',
      title: 'Mission : proposer une sortie et confirmer',
      estimatedMinutes: 20,
      competences: ['expression-orale', 'expression-ecrite'],
      lesson: {
        title: 'Mission : proposer une sortie et confirmer',
        description: `Vous voulez sortir ce week-end avec une amie. Vous l’appelez pour proposer une activité. Elle préfère autre chose ou n’est pas libre à l’heure prévue : vous trouvez un accord, puis vous confirmez par message.

MODÈLE : L’APPEL
– Hallo Aylin! Hast du am Sonntag Zeit? Wir können Rad fahren.
– Ich gehe lieber ins Schwimmbad. Und um zwei kann ich nicht. Geht es um vier?
– Ja, um vier passt. Treffen wir uns vor dem Schwimmbad?
– Ja, gern. Bis Sonntag!

MODÈLE : LE MESSAGE
Hallo Aylin! Am Sonntag gehen wir ins Schwimmbad. Wir treffen uns um vier Uhr vor dem Schwimmbad. Bis Sonntag!`,
      },
      mission: {
        oral: {
          prompt: 'Enregistrez l’appel en jouant les deux voix : proposez une activité avec « Wir können … », faites refuser l’heure ou l’activité par votre amie, proposez autre chose, puis confirmez le jour, l’heure et le lieu.',
          maxSeconds: 90,
        },
        written: {
          prompt: 'Écrivez le message de confirmation envoyé après l’appel : le jour, l’activité retenue, l’heure et le lieu du rendez-vous, avec une salutation et une formule pour finir.',
          maxChars: 500,
          minWords: 20,
        },
        checklist: [
          'J’ai proposé une activité avec « Wir können … » et l’infinitif à la fin de la phrase.',
          'J’ai exprimé une préférence avec lieber ou refusé un horaire avec « … kann ich leider nicht ».',
          'Le jour (am …), l’heure (um …) et le lieu (vor dem …) du nouveau rendez-vous sont clairs.',
          'Mon message ne reprend pas l’ancien horaire : on sait sans hésiter quel rendez-vous compte.',
        ],
      },
    },
  },
  add: [
    {
      after: 'a1-freizeit-atelier-pratique',
      activity: {
        id: 'a1-freizeit-atelier-entrainer',
        kind: 'exercise',
        title: 'S’entraîner : können, gern et lieber',
        estimatedMinutes: 10,
        competences: ['ecoute', 'expression-ecrite'],
        lesson: {
          title: 'S’entraîner : können, gern et lieber',
          description: 'Réécoutez la scène et complétez le rendez-vous. Entraînez-vous ensuite à conjuguer können, à placer l’infinitif à la fin et à choisir entre gern et lieber. Les deux dernières questions sont des dictées. La transcription de la scène s’affiche après votre réponse.',
          transcript: null,
        },
        placements: [dialogue],
        questions: [
          {
            id: 'q1', type: 'fill', prompt: 'Écoutez la scène et complétez le rendez-vous.',
            text: 'Am [[1]] gehen sie ins [[2]]. Sie treffen sich um [[3]] Uhr vor dem Kino.',
            blanks: [{ id: '1', accept: ['Samstag'], size: 9, hint: null }, { id: '2', accept: ['Kino'], size: 6, hint: null }, { id: '3', accept: ['fünf', '5'], size: 5, hint: null }],
            explanation: 'Il pleut samedi : le football au parc devient « Dann können wir ins Kino gehen ». Quatre heures est refusé, cinq heures accepté (« Ja, fünf Uhr passt »).',
          },
          {
            id: 'q2', type: 'fill', prompt: 'Complétez avec la bonne forme de können.',
            text: 'Wir [[1]] Fußball spielen. – [[2]] du um vier Uhr? – Um vier [[3]] ich nicht.',
            blanks: [{ id: '1', accept: ['können'], size: 7, hint: 'können' }, { id: '2', accept: ['Kannst'], size: 7, hint: 'können' }, { id: '3', accept: ['kann'], size: 7, hint: 'können' }],
            explanation: 'Können change de voyelle au singulier : ich kann, du kannst, mais wir können. Avec ich, il n’y a pas de terminaison : ich kann (pas « ich kanne »).',
          },
          {
            id: 'q3', type: 'order', prompt: 'Remettez les mots dans l’ordre en commençant par « Am Samstag ».',
            answers: [['Am Samstag', 'können', 'wir', 'Fußball', 'spielen']],
            explanation: 'Am Samstag occupe la 1re place : können reste en 2e position, le sujet wir suit, et l’infinitif spielen ferme la phrase.',
          },
          {
            id: 'q4', type: 'order', prompt: 'Remettez les mots dans l’ordre en commençant par « Um vier » pour refuser l’horaire.',
            answers: [['Um vier', 'kann', 'ich', 'leider', 'nicht']],
            explanation: 'L’heure en tête, le verbe kann en 2e position, puis ich. Leider (malheureusement) se place avant nicht, qui termine la phrase.',
          },
          {
            id: 'q5', type: 'match', prompt: 'Associez chaque phrase française à son équivalent allemand.',
            pairs: [
              { left: 'J’aime jouer au foot.', right: 'Ich spiele gern Fußball.' },
              { left: 'Je préfère aller nager.', right: 'Ich gehe lieber schwimmen.' },
              { left: 'Je n’aime pas danser.', right: 'Ich tanze nicht gern.' },
              { left: 'On peut faire du vélo.', right: 'Wir können Rad fahren.' },
            ],
            explanation: 'Gern = aimer faire, lieber = préférer, nicht gern = ne pas aimer : ils suivent le verbe conjugué. Avec können, l’autre verbe reste à l’infinitif, à la fin.',
          },
          {
            id: 'q6', type: 'fill', prompt: 'Complétez avec gern ou lieber : « Je vais volontiers au cinéma, mais je préfère encore aller nager. »',
            text: 'Ich gehe [[1]] ins Kino, aber ich gehe noch [[2]] schwimmen.',
            blanks: [{ id: '1', accept: ['gern', 'gerne'], size: 6, hint: null }, { id: '2', accept: ['lieber'], size: 7, hint: null }],
            explanation: 'Gern dit qu’on aime une activité ; lieber, son comparatif, dit qu’on en préfère une autre. Noch lieber renforce la préférence : « encore plus volontiers ».',
          },
          {
            id: 'q7', type: 'dictation', prompt: DICTATION, voice: 'mann',
            accept: ['Wir treffen uns um fünf vor dem Kino.', 'Wir treffen uns um fünf Uhr vor dem Kino.'],
            explanation: 'Wir treffen uns : on se retrouve. L’heure (um fünf) vient avant le lieu (vor dem Kino). Kino est un nom : majuscule.',
          },
          {
            id: 'q8', type: 'dictation', prompt: DICTATION, voice: 'frau',
            accept: ['Am Sonntag gehe ich lieber schwimmen.'],
            explanation: 'Am Sonntag ouvre la phrase : le verbe gehe reste 2e, ich suit, puis lieber. Sonntag, nom de jour, prend une majuscule.',
          },
        ],
      },
    },
    {
      after: 'a1-freizeit-atelier-entrainer',
      activity: {
        id: 'a1-freizeit-atelier-repeter',
        kind: 'exercise',
        title: 'Répéter à voix haute : proposer et répondre',
        estimatedMinutes: 8,
        competences: ['expression-orale'],
        lesson: {
          title: 'Répéter à voix haute : proposer et répondre',
          description: 'Écoutez chaque modèle autant de fois que nécessaire, puis dites la phrase sans vous presser. Faites monter la voix à la fin des questions qui commencent par le verbe (Hast du …?).',
          transcript: null,
        },
        placements: [],
        questions: [
          speak('q1', 'Hast du am Samstag Zeit?', 'Question sans mot interrogatif : le verbe hast ouvre la phrase et la voix monte à la fin. Le h de hast se souffle.'),
          speak('q2', 'Wir können ins Kino gehen.', 'Le w de wir se prononce comme un v. Dans können, ö se dit « eu » bref, lèvres arrondies.'),
          speak('q3', 'Ich gehe lieber schwimmen.', 'Dans lieber, ie se dit comme un i long. Schwimmen commence par « chv » : sch + w.'),
          speak('q4', 'Um vier kann ich leider nicht.', 'Vier commence par le son f ; leider se dit « laïder ». La phrase refuse poliment un horaire.', ['Um vier kann ich leider nicht.', 'Um 4 kann ich leider nicht.']),
          speak('q5', 'Geht es um fünf Uhr?', 'Fünf : ü se dit comme le « u » français. Uhr se prononce « our », le r presque muet.', ['Geht es um fünf Uhr?', 'Geht es um 5 Uhr?']),
          speak('q6', 'Wir treffen uns vor dem Kino.', 'Vor se prononce « for ». Treffen a un e bref ; l’accent tombe sur la 1re syllabe : TREF-fen.'),
        ],
      },
    },
  ],
  order: ['a1-freizeit-atelier-guide', 'a1-freizeit-atelier-pratique', 'a1-freizeit-atelier-entrainer', 'a1-freizeit-atelier-repeter', 'a1-freizeit-atelier-controle', 'a1-freizeit-atelier-mission'],
};
