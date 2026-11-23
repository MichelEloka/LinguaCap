// Couche pédagogique V4 · a2-gesundheit-atelier (lot A7, contenu A2).
// Obtenir un rendez-vous au téléphone : la prise de notes devient un exercice à trous sur l’appel, la mission est remise
// dans l’application.

const dialogue = { media: 'a2-gesundheit-atelier-dialogue', usage: 'audio', transcriptVisibility: 'after_answer', decorative: false };

export default {
  module: 'a2-gesundheit-atelier',
  grammarFocus: ['seit-wehtun', 'sollen-consigne-rapportee'],

  vocabulary: [
    { id: 'frei', word: 'frei', article: null, plural: null, partOfSpeech: 'adjective', translation: 'libre, disponible',
      example: 'Haben Sie diese Woche einen Termin frei?', note: null },
    { id: 'passt-das', word: 'Passt das?', article: null, plural: null, partOfSpeech: 'expression', translation: 'Est-ce que cela vous convient ?',
      example: 'Am Mittwoch um acht Uhr wäre etwas frei. Passt das?', note: 'verbe passen : das passt mir (+ datif)' },
    { id: 'viertelstunde', word: 'Viertelstunde', article: 'die', plural: 'Viertelstunden', partOfSpeech: 'noun', translation: 'le quart d’heure',
      example: 'Bitte kommen Sie eine Viertelstunde früher.', note: null },
    { id: 'viertel', word: 'Viertel', article: 'das', plural: 'Viertel', partOfSpeech: 'noun', translation: 'le quart',
      example: 'Es ist Viertel nach zehn.', note: 'Viertel nach zehn = 10 h 15 · Viertel vor elf = 10 h 45' },
    { id: 'halb', word: 'halb', article: null, plural: null, partOfSpeech: 'adjective', translation: 'demi, et demie (pour l’heure)',
      example: 'Kommen Sie bitte um halb elf.', note: 'halb elf = 10 h 30 : la demi-heure avant onze heures' },
    { id: 'frueher', word: 'früher', article: null, plural: null, partOfSpeech: 'adverb', translation: 'plus tôt',
      example: 'Kommen Sie bitte zehn Minuten früher.', note: null },
    { id: 'spaeter', word: 'später', article: null, plural: null, partOfSpeech: 'adverb', translation: 'plus tard',
      example: 'Geht es am selben Tag etwas später?', note: null },
    { id: 'empfang', word: 'Empfang', article: 'der', plural: 'Empfänge', partOfSpeech: 'noun', translation: 'l’accueil (d’un cabinet, d’un hôtel)',
      example: 'Am Empfang bekommen Sie ein Formular.', note: null },
    { id: 'formular', word: 'Formular', article: 'das', plural: 'Formulare', partOfSpeech: 'noun', translation: 'le formulaire',
      example: 'Sie bekommen ein kurzes Formular.', note: null },
    { id: 'ausfuellen', word: 'ausfüllen', article: null, plural: null, partOfSpeech: 'verb', translation: 'remplir (un formulaire)',
      example: 'Muss ich vorher etwas ausfüllen?', note: 'séparable : aus|füllen' },
    { id: 'mitbringen', word: 'mitbringen', article: null, plural: null, partOfSpeech: 'verb', translation: 'apporter',
      example: 'Ich soll meine Versichertenkarte mitbringen.', note: 'séparable : mit|bringen · Perfekt : hat mitgebracht' },
    { id: 'liste', word: 'Liste', article: 'die', plural: 'Listen', partOfSpeech: 'noun', translation: 'la liste',
      example: 'Bringen Sie die Liste Ihrer Medikamente mit.', note: null },
    { id: 'ausweis', word: 'Ausweis', article: 'der', plural: 'Ausweise', partOfSpeech: 'noun', translation: 'la pièce d’identité',
      example: 'Bringen Sie bitte Ihren Ausweis mit.', note: null },
    { id: 'schulter', word: 'Schulter', article: 'die', plural: 'Schultern', partOfSpeech: 'noun', translation: 'l’épaule',
      example: 'Seit zwei Tagen tun mir die Schultern weh.', note: null },
    { id: 'richtig-verstanden', word: 'Habe ich das richtig verstanden?', article: null, plural: null, partOfSpeech: 'expression',
      translation: 'Est-ce que j’ai bien compris ?', example: 'Habe ich das richtig verstanden: am Dienstag um acht Uhr dreißig?', note: null },
    { id: 'auf-wiederhoeren', word: 'Auf Wiederhören', article: null, plural: null, partOfSpeech: 'expression', translation: 'au revoir (au téléphone)',
      example: 'Vielen Dank für Ihre Hilfe. Auf Wiederhören!', note: 'en face à face : Auf Wiedersehen' },
  ],

  activities: {
    'a2-gesundheit-atelier-guide': {
      title: 'Découvrir : appeler un cabinet médical',
      estimatedMinutes: 15,
      lesson: {
        title: 'Découvrir : appeler un cabinet médical',
        description: `Lisez la confirmation envoyée par ce cabinet fictif.
« Ihr Termin ist am Dienstag um 8.30 Uhr. Bitte kommen Sie eine Viertelstunde früher. Bringen Sie Ihre Versichertenkarte mit. Am Empfang bekommen Sie ein Formular. »
Repérez le rendez-vous (mardi, 8 h 30), l’heure d’arrivée (un quart d’heure avant, donc 8 h 15), l’objet à apporter (la carte d’assurance maladie) et l’étape sur place (un formulaire à l’accueil).

DIRE DEPUIS QUAND ON A MAL
Seit + datif s’emploie avec le présent pour une gêne qui dure encore : Seit gestern tut mir das rechte Ohr weh. Avec wehtun, c’est la partie du corps qui commande le verbe : Seit zwei Tagen tun mir die Schultern weh (pluriel, donc tun). Autres modèles : Seit gestern tut mir der Hals weh. Seit zwei Tagen tun mir die Füße weh. Seit Montag habe ich Husten.

LIRE ET CONFIRMER UNE HEURE
• halb neun = 8 h 30 : la demi-heure avant neuf heures
• Viertel nach zehn = 10 h 15
• Viertel vor elf = 10 h 45
Pour confirmer, on reprend l’heure au format numérique : Habe ich das richtig verstanden: am Dienstag um acht Uhr dreißig?

RAPPORTER UNE CONSIGNE
Bringen Sie Ihren Ausweis mit. → Ich soll meinen Ausweis mitbringen. Sollen rapporte ce qu’une autre personne demande ; l’infinitif mitbringen va à la fin.

À RETENIR POUR APPELER
• Ouvrir : Guten Morgen, hier ist … Seit Montag tut mir das Ohr weh.
• Demander un autre créneau : Geht es am Donnerstagvormittag?
• Confirmer : Also am Donnerstag um neun Uhr. Ich soll meine Versichertenkarte mitbringen.
Lisez ces répliques à voix haute : l’exercice « Répéter à voix haute » de ce module vérifie ensuite votre prononciation.`,
      },
    },

    'a2-gesundheit-atelier-pratique': {
      kind: 'exercise',
      title: 'S’entraîner : noter un rendez-vous au téléphone',
      estimatedMinutes: 12,
      competences: ['ecoute', 'expression-ecrite'],
      lesson: {
        title: 'S’entraîner : noter un rendez-vous au téléphone',
        description: `Un patient appelle le cabinet « Praxis am Park » pour obtenir un rendez-vous dans la semaine.

1. Écoutez l’appel une première fois sans lire les phrases : quelle est la gêne, et depuis quand ?
2. Réécoutez pour compléter : le créneau refusé, le créneau accepté, les objets à apporter et l’heure d’arrivée. Vous pouvez écrire les nombres en chiffres.
3. Les deux dernières questions sont des dictées : de nouvelles phrases utiles pour appeler un cabinet.
Après validation, la transcription de l’appel et l’explication de chaque réponse s’affichent.`,
      },
      placements: { remove: ['a2-gesundheit-atelier-dialogue'], add: [dialogue] },
      questions: [
        { id: 'q1', type: 'fill', prompt: 'La gêne et sa durée : complétez la phrase du patient.',
          text: 'Seit [[1]] tut mir der [[2]] weh.',
          blanks: [{ id: '1', accept: ['gestern'], size: 9, hint: null }, { id: '2', accept: ['Hals'], size: 6, hint: null }],
          explanation: 'Le patient dit « Seit gestern tut mir der Hals weh » : il a mal à la gorge depuis hier. Der Hals désigne à la fois le cou et la gorge.' },
        { id: 'q2', type: 'fill', prompt: 'Le premier créneau proposé, que le patient refuse : complétez.',
          text: 'Am Mittwoch um [[1]] Uhr wäre etwas frei.',
          blanks: [{ id: '1', accept: ['acht', '8'], size: 6, hint: null }],
          explanation: 'La secrétaire propose « am Mittwoch um acht Uhr », mais le patient répond « Um acht muss ich arbeiten ». Wäre etwas frei signifie « il y aurait une place ».' },
        { id: 'q3', type: 'fill', prompt: 'Le créneau accepté : complétez l’heure.',
          text: 'Dann kommen Sie bitte am Mittwoch um [[1]] elf.',
          blanks: [{ id: '1', accept: ['halb'], size: 6, hint: null }],
          explanation: 'Halb elf, c’est la demi-heure avant onze heures : 10 h 30. Le patient le confirme en reprenant « zehn Uhr dreißig ».' },
        { id: 'q4', type: 'fill', prompt: 'Les deux choses à apporter : complétez.',
          text: 'Bringen Sie Ihre [[1]] und die Liste Ihrer [[2]] mit.',
          blanks: [{ id: '1', accept: ['Versichertenkarte'], size: 18, hint: null }, { id: '2', accept: ['Medikamente'], size: 12, hint: null }],
          explanation: 'Il faut apporter la carte d’assurance maladie (die Versichertenkarte) et la liste des médicaments (die Medikamente, au pluriel). La particule mit de mitbringen termine la phrase.' },
        { id: 'q5', type: 'fill', prompt: 'Où le patient reçoit-il le formulaire ? Complétez.',
          text: 'Sie bekommen am [[1]] ein kurzes Formular.',
          blanks: [{ id: '1', accept: ['Empfang'], size: 9, hint: null }],
          explanation: 'Der Empfang, c’est l’accueil du cabinet : le formulaire se remplit sur place. Am est la contraction de an dem (datif, réponse à wo?).' },
        { id: 'q6', type: 'fill', prompt: 'Calculez l’heure d’arrivée : le patient doit venir dix minutes plus tôt. Écrivez les minutes.',
          text: 'Ich soll um zehn Uhr [[1]] in der Praxis sein.',
          blanks: [{ id: '1', accept: ['zwanzig', '20'], size: 8, hint: null }],
          explanation: 'Le rendez-vous est à 10 h 30 et la secrétaire dit « Kommen Sie bitte zehn Minuten früher » : il faut arriver à 10 h 20. Früher signifie plus tôt.' },
        { id: 'q7', type: 'dictation', prompt: 'Écoutez et écrivez la phrase : une gêne qui dure depuis lundi.',
          accept: ['Seit Montag tun mir die Ohren weh.'], voice: 'sprecherin',
          explanation: 'Die Ohren est un pluriel : le verbe se conjugue tun. Mir, au datif, désigne la personne qui a mal, et la particule weh termine la phrase.' },
        { id: 'q8', type: 'dictation', prompt: 'Écoutez et écrivez la consigne rapportée par le patient.',
          accept: ['Ich soll meine Versichertenkarte mitbringen.'], voice: 'sprecher',
          explanation: 'Sollen rapporte la consigne du cabinet : ich soll, sans terminaison. L’infinitif mitbringen s’écrit en un mot et se place à la fin.' },
      ],
    },

    'a2-gesundheit-atelier-controle': {
      title: 'Vérifier : le rendez-vous et les consignes',
      estimatedMinutes: 10,
      lesson: {
        title: 'Vérifier : le rendez-vous et les consignes',
        description: 'Écoutez une première fois l’appel au cabinet pour la situation générale. Lisez les questions, puis réécoutez pour les détails. Les deux dernières questions portent sur la langue : choisissez la phrase correcte sans réécouter. Après validation, la transcription et l’explication de chaque réponse s’affichent.',
      },
      explanations: {
        q1: 'Le patient dit « Seit gestern tut mir der Hals weh » : seit gestern signifie depuis hier. Mercredi est le jour du rendez-vous, et aucune durée de dix jours n’est mentionnée.',
        q2: '« Um acht muss ich arbeiten » : à 8 h, la personne travaille. Elle ne parle ni de train ni de carte ; elle demande seulement un créneau plus tard le même jour.',
        q3: 'La secrétaire propose « am Mittwoch um halb elf » et le patient confirme « zehn Uhr dreißig ». Halb elf est la demi-heure avant onze heures : 10 h 30, et non 11 h 30.',
        q4: '« Bringen Sie Ihre Versichertenkarte und die Liste Ihrer Medikamente mit » : deux choses à apporter. Le formulaire, lui, est remis sur place, à l’accueil (am Empfang).',
        q5: 'Die Ohren est un pluriel, donc le verbe est tun, et la personne qui a mal est au datif : mir. Seit demande aussi le datif : seit zwei Tagen, avec -n. « tut mir die Ohren » oublie l’accord.',
        q6: '« Kommen Sie bitte zehn Minuten früher » : früher signifie plus tôt. Ich soll rapporte la consigne de la secrétaire ; später dirait le contraire, et elle ne parle pas d’attendre à l’accueil.',
      },
    },

    'a2-gesundheit-atelier-mission': {
      kind: 'mission',
      title: 'Mission : obtenir puis déplacer un rendez-vous',
      estimatedMinutes: 20,
      competences: ['expression-orale', 'expression-ecrite'],
      lesson: {
        title: 'Mission : obtenir puis déplacer un rendez-vous',
        description: `Situation : vous avez mal à la tête depuis deux jours. Vendredi, vous êtes libre, sauf entre 9 h et midi. Au téléphone, le cabinet vous propose d’abord 9 h, puis 13 h 30, en vous demandant de passer à l’accueil dix minutes avant. Plus tard, un nouvel empêchement vous oblige à déplacer ce rendez-vous.

Modèles pour l’appel : Seit zwei Tagen habe ich Kopfschmerzen. Um neun muss ich arbeiten. Geht es am Freitag etwas später? Also am Freitag um halb zwei. Ich soll zehn Minuten früher kommen.
Modèle pour le message : Leider kann ich am Freitag um halb zwei nicht kommen. Haben Sie am Montagvormittag noch einen Termin frei?

Préparez quelques mots-clés, puis réalisez les deux parties. Avant d’envoyer, vérifiez que vous ne confondez pas l’heure du rendez-vous (13 h 30) et l’heure d’arrivée (13 h 20).`,
      },
      mission: {
        oral: {
          prompt: 'Enregistrez votre appel au cabinet (une minute environ) : décrivez votre gêne et sa durée, refusez le créneau de 9 h en donnant la raison, demandez un créneau l’après-midi, puis confirmez le rendez-vous de 13 h 30 et votre heure d’arrivée.',
          maxSeconds: 90,
        },
        written: {
          prompt: 'Un nouvel empêchement survient. Écrivez au cabinet un message de 35 à 50 mots pour déplacer le rendez-vous du vendredi à 13 h 30 vers lundi matin. Commencez par une formule d’ouverture et terminez par une formule de fin.',
          maxChars: 800,
          minWords: 35,
        },
        checklist: [
          'J’ai dit depuis quand j’ai mal : Seit zwei Tagen habe ich Kopfschmerzen.',
          'J’ai refusé le créneau de 9 h en donnant la raison.',
          'J’ai confirmé le rendez-vous de 13 h 30 et l’heure d’arrivée, dix minutes avant.',
          'Mon message nomme le rendez-vous à déplacer (vendredi, 13 h 30) et propose lundi matin.',
          'Mon message commence par « Sehr geehrte Damen und Herren » et se termine par « Mit freundlichen Grüßen ».',
        ],
      },
    },
  },

  add: [
    {
      after: 'a2-gesundheit-atelier-controle',
      activity: {
        id: 'a2-gesundheit-atelier-repeter',
        kind: 'exercise',
        title: 'Répéter à voix haute : au téléphone avec le cabinet',
        estimatedMinutes: 8,
        competences: ['expression-orale'],
        lesson: {
          title: 'Répéter à voix haute : au téléphone avec le cabinet',
          description: 'Écoutez chaque modèle, puis dites la phrase à voix haute, comme au téléphone. Articulez bien les heures : c’est l’information que votre interlocuteur doit noter. Si la reconnaissance vocale ne comprend pas votre phrase, réécoutez le modèle et réessayez.',
          transcript: null,
        },
        placements: [],
        questions: [
          { id: 'q1', type: 'speak', prompt: 'Écoutez, puis dites depuis quand vous avez mal.',
            text: 'Seit gestern tut mir der Hals weh.', accept: ['Seit gestern tut mir der Hals weh.'], threshold: 75,
            explanation: 'Seit gestern ouvre la phrase : le verbe tut suit directement. Le h de Hals s’aspire et weh se prononce avec un e long.' },
          { id: 'q2', type: 'speak', prompt: 'Écoutez, puis demandez un rendez-vous dans la semaine.',
            text: 'Haben Sie diese Woche einen Termin frei?', accept: ['Haben Sie diese Woche einen Termin frei?'], threshold: 75,
            explanation: 'Question fermée : le verbe haben ouvre la phrase et la voix monte sur frei. Dans Woche, le ch après o se prononce au fond de la gorge.' },
          { id: 'q3', type: 'speak', prompt: 'Écoutez, puis demandez un créneau plus tard le même jour.',
            text: 'Geht es am selben Tag etwas später?', accept: ['Geht es am selben Tag etwas später?'], threshold: 75,
            explanation: 'Geht es …? est une façon polie de demander si c’est possible. Le g final de Tag se prononce [k] et le ä de später comme le « è » de « mère ».' },
          { id: 'q4', type: 'speak', prompt: 'Écoutez, puis confirmez le rendez-vous.',
            text: 'Also am Mittwoch um halb elf.', accept: ['Also am Mittwoch um halb elf.', 'Also am Mittwoch um halb 11.'], threshold: 75,
            explanation: 'Halb elf signifie 10 h 30. Dans Mittwoch, l’accent porte sur MITT, et le ch final se prononce au fond de la gorge.' },
          { id: 'q5', type: 'speak', prompt: 'Écoutez, puis demandez s’il y a un formulaire à remplir.',
            text: 'Muss ich vorher etwas ausfüllen?', accept: ['Muss ich vorher etwas ausfüllen?'], threshold: 75,
            explanation: 'Le verbe de modalité muss ouvre la question et l’infinitif ausfüllen la termine. Accentuez la particule : AUS-füllen ; le ü se dit comme le « u » français.' },
        ],
      },
    },
  ],
};
