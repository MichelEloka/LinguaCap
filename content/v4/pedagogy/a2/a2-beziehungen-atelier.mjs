// Couche pédagogique V4 · a2-beziehungen-atelier (lot A7, contenu A2).
// Déplacer une invitation et raconter un souvenir : la prise de notes devient un exercice à trous sur la scène,
// la mission est remise dans l’application. Le contrôle illustré (images-v4) garde ses questions telles quelles.

const dialogue = { media: 'a2-beziehungen-atelier-dialogue', usage: 'audio', transcriptVisibility: 'after_answer', decorative: false };

export default {
  module: 'a2-beziehungen-atelier',
  grammarFocus: ['als-praeteritum-modalverben', 'verbes-pronominaux'],

  vocabulary: [
    { id: 'geburtstag', word: 'Geburtstag', article: 'der', plural: 'Geburtstage', partOfSpeech: 'noun', translation: 'l’anniversaire',
      example: 'Am Samstag feiere ich meinen Geburtstag.', note: null },
    { id: 'feiern', word: 'feiern', article: null, plural: null, partOfSpeech: 'verb', translation: 'fêter, faire la fête',
      example: 'Wir wollen am Samstag zusammen feiern.', note: null },
    { id: 'vorbeikommen', word: 'vorbeikommen', article: null, plural: null, partOfSpeech: 'verb', translation: 'passer (chez quelqu’un)',
      example: 'Kannst du am Sonntag vorbeikommen?', note: 'séparable : vorbei|kommen · Perfekt : ist vorbeigekommen' },
    { id: 'mitbringen', word: 'mitbringen', article: null, plural: null, partOfSpeech: 'verb', translation: 'apporter',
      example: 'Soll ich am Sonntag etwas mitbringen?', note: 'séparable : mit|bringen · Bring bitte Saft mit!' },
    { id: 'spaziergang', word: 'Spaziergang', article: 'der', plural: 'Spaziergänge', partOfSpeech: 'noun', translation: 'la promenade',
      example: 'Hast du am Freitag Lust auf einen Spaziergang?', note: null },
    { id: 'bruecke', word: 'Brücke', article: 'die', plural: 'Brücken', partOfSpeech: 'noun', translation: 'le pont',
      example: 'Wir können uns an der Brücke treffen.', note: null },
    { id: 'fluss', word: 'Fluss', article: 'der', plural: 'Flüsse', partOfSpeech: 'noun', translation: 'la rivière, le fleuve',
      example: 'Ich bin ab sechs am Fluss.', note: null },
    { id: 'apfelsaft', word: 'Apfelsaft', article: 'der', plural: 'Apfelsäfte', partOfSpeech: 'noun', translation: 'le jus de pomme',
      example: 'Bring bitte Apfelsaft mit.', note: null },
    { id: 'kuchen', word: 'Kuchen', article: 'der', plural: 'Kuchen', partOfSpeech: 'noun', translation: 'le gâteau',
      example: 'Kuchen habe ich schon.', note: null },
    { id: 'zelten', word: 'zelten', article: null, plural: null, partOfSpeech: 'verb', translation: 'camper (sous une tente)',
      example: 'Als Kind durfte ich im Garten zelten.', note: null },
    { id: 'sich-erinnern', word: 'sich erinnern', article: null, plural: null, partOfSpeech: 'verb', translation: 'se souvenir',
      example: 'Sie erinnert sich gern an ihre Kindheit.', note: 'an + accusatif · Daran erinnere ich mich gern.' },
    { id: 'kindheit', word: 'Kindheit', article: 'die', plural: null, partOfSpeech: 'noun', translation: 'l’enfance',
      example: 'In meiner Kindheit habe ich oft draußen gespielt.', note: null },
    { id: 'duerfen', word: 'dürfen', article: null, plural: null, partOfSpeech: 'verb', translation: 'avoir le droit de, pouvoir',
      example: 'Die Kinder dürfen nach der Schule draußen spielen.', note: 'prétérit : ich durfte, wir durften' },
    { id: 'muessen', word: 'müssen', article: null, plural: null, partOfSpeech: 'verb', translation: 'devoir',
      example: 'Wir müssen vor sieben zu Hause sein.', note: 'prétérit : ich musste, wir mussten' },
    { id: 'leider', word: 'leider', article: null, plural: null, partOfSpeech: 'adverb', translation: 'malheureusement',
      example: 'Am Samstag kann ich leider nicht.', note: null },
    { id: 'nebenan', word: 'nebenan', article: null, plural: null, partOfSpeech: 'adverb', translation: 'à côté, d’à côté',
      example: 'Meine beste Freundin wohnte nebenan.', note: null },
  ],

  activities: {
    'a2-beziehungen-atelier-guide': {
      title: 'Découvrir : déplacer une invitation, raconter un souvenir',
      estimatedMinutes: 15,
      lesson: {
        title: 'Découvrir : déplacer une invitation, raconter un souvenir',
        description: `Lisez ces deux messages.
« Hast du am Freitag Lust auf einen Spaziergang? Ich bin ab sechs am Fluss. »
« Danke für die Einladung! Am Freitag helfe ich meinem Bruder. Hast du am Samstag um elf Zeit? Wir können uns an der Brücke treffen. »
Repérez le jour proposé (vendredi, à partir de six heures), la raison du refus (Ich helfe meinem Bruder) et le nouveau rendez-vous (samedi à onze heures, au pont).

DÉPLACER UNE INVITATION
On remercie, on donne une raison courte, puis on propose une autre possibilité :
• Danke, da kann ich leider nicht. Treffen wir uns am Sonntag?
• Am Mittwoch muss ich arbeiten. Hast du am Donnerstag Zeit?
• Ins Kino gehe ich gern, aber nicht am Donnerstag. Geht es auch am Freitag?
Ich treffe mich mit Lara parle de vous ; wir treffen uns propose un rendez-vous commun. Pour confirmer : Gut, dann bis Samstag um elf an der Brücke!

RACONTER UN SOUVENIR
« Als ich neun war, wohnte meine beste Freundin nebenan. Wir durften jeden Nachmittag zusammen spielen. Ich musste nur vor sieben zu Hause sein. »
Repérez l’âge (neun), ce qui était permis (wir durften … spielen) et ce qui était obligatoire (ich musste … zu Hause sein).
• Als + moment unique du passé : le verbe conjugué va à la fin (Als ich neun war, …), puis la principale commence par le verbe : …, durfte ich im Garten spielen.
• Au prétérit, dürfen et müssen perdent leur tréma : ich durfte, ich musste, wir durften, wir mussten.
• Pour relancer la conversation : Und du? Was durftest du als Kind?

À VOUS
Lisez les deux messages à voix haute, puis complétez à l’oral : Als ich zehn war, durfte ich … Ich musste … Und du?`,
      },
    },

    'a2-beziehungen-atelier-pratique': {
      kind: 'exercise',
      title: 'S’entraîner : noter un rendez-vous déplacé',
      estimatedMinutes: 12,
      competences: ['ecoute', 'expression-ecrite'],
      lesson: {
        title: 'S’entraîner : noter un rendez-vous déplacé',
        description: `Une jeune femme invite un ami à son anniversaire. Il ne peut pas venir le jour prévu et propose un autre moment.

1. Écoutez la scène une première fois sans lire les phrases : quelle est l’occasion, et qui propose un changement ?
2. Réécoutez pour compléter les répliques : le nouveau rendez-vous, l’amie Lara, le souvenir d’enfance et ce qu’il faut apporter.
3. Les deux dernières questions sont des dictées : de nouvelles phrases pour refuser poliment et raconter un souvenir.
Après validation, la transcription de la scène et l’explication de chaque réponse s’affichent.`,
      },
      placements: { remove: ['a2-beziehungen-atelier-dialogue'], add: [dialogue] },
      questions: [
        { id: 'q1', type: 'fill', prompt: 'Pourquoi l’ami ne vient-il pas samedi ? Complétez sa réponse.',
          text: 'Am Samstag muss ich leider [[1]]. Treffen wir [[2]] vielleicht am Sonntag?',
          blanks: [{ id: '1', accept: ['arbeiten'], size: 9, hint: null }, { id: '2', accept: ['uns'], size: 5, hint: null }],
          explanation: 'L’ami dit « Am Samstag muss ich leider arbeiten » : avec muss, l’infinitif arbeiten va à la fin. Pour proposer un rendez-vous commun, on dit « Treffen wir uns … ? », avec le pronom réfléchi uns.' },
        { id: 'q2', type: 'fill', prompt: 'À quelle heure est le nouveau rendez-vous ? Écrivez l’heure en chiffres ou en lettres.',
          text: 'Gern. Komm um [[1]] zu mir.',
          blanks: [{ id: '1', accept: ['drei', '3', 'fünfzehn', '15', 'drei Uhr', '3 Uhr', '15 Uhr', 'fünfzehn Uhr'], size: 9, hint: null }],
          explanation: 'L’hôtesse répond « Komm um drei zu mir » : dimanche à trois heures de l’après-midi, soit 15 h. L’ami le confirme à la fin : « dann bis Sonntag um drei! ».' },
        { id: 'q3', type: 'fill', prompt: 'Qui est Lara ? Complétez les adjectifs.',
          text: 'Ist das die [[1]] Freundin aus deiner [[2]] Straße?',
          blanks: [{ id: '1', accept: ['nette'], size: 7, hint: 'nett' }, { id: '2', accept: ['alten'], size: 7, hint: 'alt' }],
          explanation: 'Après die au nominatif, l’adjectif prend -e : die nette Freundin. Après aus (+ datif), deiner Straße appelle -en : aus deiner alten Straße.' },
        { id: 'q4', type: 'fill', prompt: 'Le souvenir d’enfance : complétez avec sein et dürfen au prétérit.',
          text: 'Als ich klein [[1]], [[2]] ich bei ihr samstags im Garten zelten.',
          blanks: [{ id: '1', accept: ['war'], size: 5, hint: 'sein' }, { id: '2', accept: ['durfte'], size: 7, hint: 'dürfen' }],
          explanation: 'Après als, le verbe conjugué war va à la fin de la subordonnée. La principale commence ensuite par le verbe : durfte ich. Au prétérit, dürfen perd son tréma : ich durfte.' },
        { id: 'q5', type: 'fill', prompt: 'Que faut-il apporter dimanche ?',
          text: 'Ja, bring bitte [[1]] mit. [[2]] habe ich schon.',
          blanks: [{ id: '1', accept: ['Apfelsaft'], size: 10, hint: null }, { id: '2', accept: ['Kuchen'], size: 8, hint: null }],
          explanation: 'L’hôtesse demande du jus de pomme (der Apfelsaft) et précise que le gâteau (der Kuchen) est déjà prévu. Bring … mit : impératif du verbe séparable mitbringen.' },
        { id: 'q6', type: 'fill', prompt: 'La dernière réplique : complétez avec le pronom réfléchi.',
          text: 'Gut, dann bis Sonntag um drei! Ich freue [[1]] darauf.',
          blanks: [{ id: '1', accept: ['mich'], size: 5, hint: null }],
          explanation: 'Sich freuen auf : le pronom réfléchi s’accorde avec le sujet ich, donc mich. Darauf renvoie au rendez-vous de dimanche, qui est encore à venir.' },
        { id: 'q7', type: 'dictation', prompt: 'Écoutez et écrivez ce refus poli.',
          accept: ['Danke für die Einladung, aber am Freitag kann ich leider nicht.'], voice: 'sprecherin',
          explanation: 'On remercie d’abord (Danke für die Einladung), puis on refuse avec leider. Après am Freitag en tête de proposition, le verbe kann vient avant le sujet ich.' },
        { id: 'q8', type: 'dictation', prompt: 'Écoutez et écrivez ce souvenir d’enfance.',
          accept: ['Als ich klein war, musste ich früh ins Bett gehen.'], voice: 'sprecher',
          explanation: 'Après als, war termine la subordonnée ; la principale commence par musste, prétérit de müssen sans tréma. Ins Bett = in das Bett (accusatif de direction).' },
      ],
    },

    'a2-beziehungen-atelier-controle': {
      title: 'Vérifier : une invitation déplacée',
      estimatedMinutes: 10,
      lesson: {
        title: 'Vérifier : une invitation déplacée',
        description: 'Écoutez une première fois la scène pour la situation générale. Lisez les questions, puis réécoutez pour les détails. Les deux dernières questions portent sur la langue : choisissez la phrase correcte sans réécouter. Après validation, la transcription et l’explication de chaque réponse s’affichent.',
      },
      explanations: {
        q1: 'L’hôtesse dit « Am Samstag feiere ich meinen Geburtstag » : der Geburtstag, c’est l’anniversaire. Rien n’évoque une sortie scolaire ni un déménagement.',
        q2: '« Am Samstag muss ich leider arbeiten » : l’invité doit travailler. Il accepte volontiers de venir le dimanche, et il n’est jamais question d’être déjà chez Lara.',
        q3: '« Als ich klein war, durfte ich bei ihr samstags im Garten zelten » : zelten, c’est camper sous une tente ; bei ihr = chez Lara. Il n’est question ni de magasin ni de cours.',
        q4: '« Ja, bring bitte Apfelsaft mit. Kuchen habe ich schon. » Der Apfelsaft est le jus de pomme ; le gâteau est déjà prévu, et la tente appartient au souvenir d’enfance.',
        q5: 'Cette réponse remercie, refuse avec leider (malheureusement) et propose un autre jour : Treffen wir uns am Samstag? L’une des autres propose vendredi tout en le refusant, l’autre est sèche et ne propose rien.',
        q6: 'Avec als, le verbe conjugué war va à la fin de la subordonnée. Celle-ci occupe la première position : la principale commence donc par le verbe durfte, suivi du sujet ich.',
      },
    },

    'a2-beziehungen-atelier-mission': {
      kind: 'mission',
      title: 'Mission : déplacer un pique-nique et raconter un souvenir',
      estimatedMinutes: 20,
      competences: ['expression-orale', 'expression-ecrite'],
      lesson: {
        title: 'Mission : déplacer un pique-nique et raconter un souvenir',
        description: `Situation : un ami vous propose un pique-nique samedi. Vous n’êtes libre que dimanche à 15 h. Choisissez un lieu qui vous rappelle un souvenir d’enfance. Plus tard, la météo annonce de la pluie pour dimanche : il faut changer de lieu, mais garder l’heure.

Modèles :
• Danke für die Einladung! Am Samstag kann ich leider nicht. Treffen wir uns am Sonntag um drei am See?
• Als ich acht war, durfte ich hier auf Bäume klettern. Und du?
• Im Park wird es wohl regnen. Wollen wir uns um drei im Café am Markt treffen?

Préparez quelques mots-clés, puis réalisez les deux parties. Vérifiez que l’heure (15 h) reste la même à l’oral et à l’écrit.`,
      },
      mission: {
        oral: {
          prompt: 'Enregistrez votre réponse à votre ami (une minute environ) : remerciez, expliquez pourquoi samedi ne va pas, proposez dimanche à 15 h et un lieu, racontez un souvenir lié à ce lieu avec als et durfte ou musste, puis posez-lui une question.',
          maxSeconds: 90,
        },
        written: {
          prompt: 'Il va pleuvoir dimanche. Écrivez à votre ami un message de 40 à 60 mots : proposez un autre lieu à la même heure, expliquez pourquoi et demandez-lui de confirmer.',
          maxChars: 800,
          minWords: 40,
        },
        checklist: [
          'J’ai remercié, donné une raison courte pour samedi et proposé dimanche à 15 h.',
          'Mon souvenir commence par als, avec le verbe conjugué à la fin : Als ich … war, …',
          'J’ai employé durfte ou musste au prétérit, sans tréma.',
          'Mon message écrit garde l’heure de 15 h et donne le nouveau lieu.',
          'J’ai demandé une confirmation et écrit « wir treffen uns » avec le bon pronom réfléchi.',
        ],
      },
    },
  },

  add: [
    {
      after: 'a2-beziehungen-atelier-controle',
      activity: {
        id: 'a2-beziehungen-atelier-repeter',
        kind: 'exercise',
        title: 'Répéter à voix haute : inviter et se souvenir',
        estimatedMinutes: 8,
        competences: ['expression-orale'],
        lesson: {
          title: 'Répéter à voix haute : inviter et se souvenir',
          description: 'Écoutez chaque modèle, puis dites la phrase à voix haute. Montez la voix à la fin des questions fermées et marquez une courte pause après la proposition avec als. Si la reconnaissance vocale ne comprend pas votre phrase, réécoutez le modèle et réessayez.',
          transcript: null,
        },
        placements: [],
        questions: [
          { id: 'q1', type: 'speak', prompt: 'Écoutez, puis invitez votre ami à passer chez vous.',
            text: 'Hast du Lust, vorbeizukommen?', accept: ['Hast du Lust, vorbeizukommen?'], threshold: 75,
            explanation: 'Avec Lust haben, l’infinitif prend zu ; pour un verbe séparable, zu s’intercale : vorbei-zu-kommen. L’accent tombe sur vorBEI.' },
          { id: 'q2', type: 'speak', prompt: 'Écoutez, puis refusez en donnant la raison.',
            text: 'Am Samstag muss ich leider arbeiten.', accept: ['Am Samstag muss ich leider arbeiten.'], threshold: 75,
            explanation: 'Am Samstag occupe la première position : le verbe muss suit, puis le sujet ich, et l’infinitif arbeiten termine la phrase.' },
          { id: 'q3', type: 'speak', prompt: 'Écoutez, puis proposez un autre jour.',
            text: 'Treffen wir uns vielleicht am Sonntag?', accept: ['Treffen wir uns vielleicht am Sonntag?'], threshold: 75,
            explanation: 'Une proposition commune commence par le verbe : Treffen wir uns … ? La voix monte à la fin, sur Sonntag.' },
          { id: 'q4', type: 'speak', prompt: 'Écoutez, puis racontez ce souvenir.',
            text: 'Als ich klein war, durfte ich im Garten zelten.', accept: ['Als ich klein war, durfte ich im Garten zelten.'], threshold: 75,
            explanation: 'Petite pause après « Als ich klein war » ; la principale repart sur le verbe durfte. Dans zelten, le z se prononce [ts].' },
          { id: 'q5', type: 'speak', prompt: 'Écoutez, puis demandez ce que vous pouvez apporter.',
            text: 'Soll ich am Sonntag etwas mitbringen?', accept: ['Soll ich am Sonntag etwas mitbringen?'], threshold: 75,
            explanation: 'Soll ich … ? propose un service. La particule mit reste collée à l’infinitif en fin de phrase et porte l’accent : MIT-bringen.' },
        ],
      },
    },
  ],
};
