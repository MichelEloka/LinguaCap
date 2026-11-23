// Couche pédagogique V4 · a2-arbeit-atelier (lot A7, contenu A2).
// Se renseigner sur une place d’apprentissage : la prise de notes devient un exercice à trous sur l’appel,
// la mission est remise dans l’application. Les questions du contrôle (q1 illustrée par images-v4) restent intactes.

const dialogue = { media: 'a2-arbeit-atelier-dialogue', usage: 'audio', transcriptVisibility: 'after_answer', decorative: false };

export default {
  module: 'a2-arbeit-atelier',
  grammarFocus: ['weil-verbe-final', 'praeteritum-sein-haben', 'zurueckrufen-separable'],

  vocabulary: [
    { id: 'auszubildende', word: 'Auszubildende', article: 'der', plural: 'Auszubildenden', partOfSpeech: 'noun', translation: 'l’apprenti, l’apprentie',
      example: 'Die Bäckerei sucht ab September eine Auszubildende.', note: 'se décline comme un adjectif : ein Auszubildender ; familier : der Azubi' },
    { id: 'ausbilder', word: 'Ausbilder', article: 'der', plural: 'Ausbilder', partOfSpeech: 'noun', translation: 'le formateur, le maître d’apprentissage',
      example: 'Kann ich heute mit dem Ausbilder sprechen?', note: 'au féminin : die Ausbilderin' },
    { id: 'fahrrad', word: 'Fahrrad', article: 'das', plural: 'Fahrräder', partOfSpeech: 'noun', translation: 'le vélo',
      example: 'Zu Hause repariere ich mein Fahrrad selbst.', note: 'die Fahrradwerkstatt : l’atelier de réparation de vélos' },
    { id: 'kunde', word: 'Kunde', article: 'der', plural: 'Kunden', partOfSpeech: 'noun', translation: 'le client',
      example: 'Der Kunde wartet an der Kasse.', note: 'au féminin : die Kundin' },
    { id: 'kontakt', word: 'Kontakt', article: 'der', plural: 'Kontakte', partOfSpeech: 'noun', translation: 'le contact',
      example: 'Ich hatte dort viel Kontakt mit Kunden.', note: null },
    { id: 'team', word: 'Team', article: 'das', plural: 'Teams', partOfSpeech: 'noun', translation: 'l’équipe',
      example: 'Ich arbeite gern im Team.', note: null },
    { id: 'praktisch', word: 'praktisch', article: null, plural: null, partOfSpeech: 'adjective', translation: 'pratique, concret',
      example: 'Ich bewerbe mich, weil ich gern praktisch arbeite.', note: null },
    { id: 'beginnen', word: 'beginnen', article: null, plural: null, partOfSpeech: 'verb', translation: 'commencer',
      example: 'Die Ausbildung soll am ersten August beginnen.', note: 'Perfekt : hat begonnen' },
    { id: 'wegen', word: 'wegen', article: null, plural: null, partOfSpeech: 'preposition', translation: 'à cause de, au sujet de',
      example: 'Ich rufe wegen der Ausbildung an.', note: '+ génitif (der Ausbildung)' },
    { id: 'anrufen', word: 'anrufen', article: null, plural: null, partOfSpeech: 'verb', translation: 'appeler (au téléphone)',
      example: 'Ich möchte morgen noch einmal anrufen.', note: 'séparable : an|rufen · Ich rufe an.' },
    { id: 'telefonnummer', word: 'Telefonnummer', article: 'die', plural: 'Telefonnummern', partOfSpeech: 'noun', translation: 'le numéro de téléphone',
      example: 'Kann ich Ihnen meine Telefonnummer geben?', note: null },
    { id: 'hinterlassen', word: 'hinterlassen', article: null, plural: null, partOfSpeech: 'verb', translation: 'laisser (un message, un numéro)',
      example: 'Kann ich meine Telefonnummer hinterlassen?', note: 'inséparable · Perfekt : hat hinterlassen' },
    { id: 'erreichbar', word: 'erreichbar', article: null, plural: null, partOfSpeech: 'adjective', translation: 'joignable',
      example: 'Ich bin ab fünfzehn Uhr erreichbar.', note: null },
    { id: 'wieder-da-sein', word: 'wieder da sein', article: null, plural: null, partOfSpeech: 'expression', translation: 'être de retour',
      example: 'Sie wird morgen wieder da sein.', note: 'Sie ist erst morgen wieder da.' },
    { id: 'anhang', word: 'Anhang', article: 'der', plural: 'Anhänge', partOfSpeech: 'noun', translation: 'la pièce jointe',
      example: 'Meinen Lebenslauf finden Sie im Anhang.', note: 'im Anhang : en pièce jointe' },
    { id: 'anbei', word: 'anbei', article: null, plural: null, partOfSpeech: 'adverb', translation: 'ci-joint',
      example: 'Anbei sende ich Ihnen meinen Lebenslauf.', note: null },
  ],

  activities: {
    'a2-arbeit-atelier-guide': {
      title: 'Découvrir : une offre d’apprentissage',
      estimatedMinutes: 15,
      lesson: {
        title: 'Découvrir : une offre d’apprentissage',
        description: `Lisez cette annonce.
« Bäckerei Kornhaus sucht ab 1. September einen Auszubildenden oder eine Auszubildende. Sie arbeiten gern im Team und fangen früh an. Senden Sie Ihren Lebenslauf und Ihr letztes Zeugnis bis zum 12. Juni an Frau Weber. »
Repérez le poste (une place d’apprentissage), le début (le 1er septembre), la date limite (le 12 juin) et la personne à contacter (Frau Weber). Le profil demande d’aimer le travail en équipe et de commencer tôt.

AU TÉLÉPHONE : QUATRE DEMANDES UTILES
• Ich rufe wegen der Ausbildung an. — J’appelle au sujet de la formation.
• Ist die Stelle noch frei? — La place est-elle encore libre ?
• Könnte ich Frau Weber sprechen? — Pourrais-je parler à Mme Weber ?
• Bis wann kann ich mich bewerben? — Jusqu’à quand puis-je postuler ?
Pour parler d’un rappel, le verbe zurückrufen se sépare : Sie ruft mich morgen um elf zurück. Après un verbe de modalité, il reste soudé : Sie kann mich morgen zurückrufen.

PRÉSENTER SON EXPÉRIENCE ET SA RAISON
Lisez la note d’une candidate : « In meiner Stadt war ich zwei Wochen in einer Bäckerei. Ich hatte dort viel Kontakt mit Kunden. Ich bewerbe mich, weil ich gern mit anderen Menschen arbeite. »
Pour une expérience passée, on emploie le prétérit de sein et de haben : ich war, ich hatte. Pour la raison, weil renvoie le verbe conjugué à la fin : …, weil ich gern mit anderen Menschen arbeite.

AU TÉLÉPHONE OU PAR COURRIEL ?
Au téléphone, une phrase courte suffit : Ich rufe wegen der Ausbildung als Bäcker an. Dans un courriel, on nomme le poste et on annonce les pièces jointes : Ich bewerbe mich um die Ausbildung ab September. Anbei sende ich Ihnen meinen Lebenslauf.
Lisez ces phrases à voix haute : l’exercice « Répéter à voix haute » de ce module les reprend.`,
      },
    },

    'a2-arbeit-atelier-pratique': {
      kind: 'exercise',
      title: 'S’entraîner : noter les informations d’un appel',
      estimatedMinutes: 12,
      competences: ['ecoute', 'expression-ecrite'],
      lesson: {
        title: 'S’entraîner : noter les informations d’un appel',
        description: `Un jeune homme appelle un atelier de réparation de vélos au sujet d’une place d’apprentissage.

1. Écoutez l’appel une première fois sans lire les phrases : pourquoi appelle-t-il, et quand la formation commence-t-elle ?
2. Réécoutez pour compléter les notes : son expérience, les documents à envoyer et le rappel prévu. Vous pouvez écrire les nombres en chiffres.
3. Les deux dernières questions sont des dictées : deux phrases utiles pour une candidature.
Après validation, la transcription de l’appel et l’explication de chaque réponse s’affichent.`,
      },
      placements: { remove: ['a2-arbeit-atelier-dialogue'], add: [dialogue] },
      questions: [
        { id: 'q1', type: 'fill', prompt: 'Le motif de l’appel : complétez.',
          text: 'Ich rufe wegen der [[1]] in Ihrer Fahrradwerkstatt an. Ist die Stelle noch [[2]]?',
          blanks: [{ id: '1', accept: ['Ausbildung'], size: 11, hint: null }, { id: '2', accept: ['frei'], size: 6, hint: null }],
          explanation: 'Le candidat appelle « wegen der Ausbildung » (au sujet de la formation) et demande si la place est encore libre : « Ist die Stelle noch frei? ».' },
        { id: 'q2', type: 'fill', prompt: 'Le début de la formation : complétez.',
          text: 'Die Ausbildung beginnt am ersten [[1]].',
          blanks: [{ id: '1', accept: ['August'], size: 8, hint: null }],
          explanation: 'L’employée répond « Die Ausbildung beginnt am ersten August » : le 1er août. Lundi, entendu plus loin, est la date limite pour les documents.' },
        { id: 'q3', type: 'fill', prompt: 'L’expérience du candidat : complétez avec le verbe entendu.',
          text: 'Letztes Jahr [[1]] ich zwei Wochen in einer Werkstatt.',
          blanks: [{ id: '1', accept: ['war'], size: 6, hint: 'sein' }],
          explanation: 'Pour une expérience passée, on emploie le prétérit de sein : ich war. Letztes Jahr est en tête, donc le verbe war suit directement, avant ich.' },
        { id: 'q4', type: 'fill', prompt: 'Les documents à envoyer : complétez.',
          text: 'Schicken Sie uns bitte Ihren [[1]] und Ihr letztes [[2]] bis Montag.',
          blanks: [{ id: '1', accept: ['Lebenslauf'], size: 11, hint: null }, { id: '2', accept: ['Zeugnis'], size: 9, hint: null }],
          explanation: 'Il faut envoyer le CV (der Lebenslauf, d’où Ihren) et le dernier bulletin ou certificat (das Zeugnis, d’où Ihr), au plus tard lundi.' },
        { id: 'q5', type: 'fill', prompt: 'Le rappel : complétez.',
          text: 'Sie ruft Sie morgen nach [[1]] Uhr [[2]].',
          blanks: [{ id: '1', accept: ['15', 'fünfzehn'], size: 9, hint: null }, { id: '2', accept: ['zurück'], size: 7, hint: 'zurückrufen' }],
          explanation: 'La formatrice rappellera « morgen nach fünfzehn Uhr ». Zurückrufen est séparable : ruft en 2e position, zurück à la fin de la phrase.' },
        { id: 'q6', type: 'fill', prompt: 'La disponibilité du candidat : complétez.',
          text: 'Ich bin ab fünfzehn Uhr [[1]].',
          blanks: [{ id: '1', accept: ['erreichbar'], size: 11, hint: null }],
          explanation: 'Erreichbar signifie joignable. Ab fünfzehn Uhr : à partir de 15 h, ce qui correspond au rappel prévu après 15 h.' },
        { id: 'q7', type: 'dictation', prompt: 'Écoutez et écrivez la question posée au téléphone.',
          accept: ['Könnte ich bitte mit der Ausbilderin sprechen?'], voice: 'mann',
          explanation: 'Könnte rend la question polie ; l’infinitif sprechen va à la fin. Sprechen mit + datif : mit der Ausbilderin, la formatrice.' },
        { id: 'q8', type: 'dictation', prompt: 'Écoutez et écrivez la phrase d’un courriel de candidature.',
          accept: ['Meinen Lebenslauf finden Sie im Anhang.'], voice: 'sprecherin',
          explanation: 'Meinen Lebenslauf (accusatif) est en tête, puis le verbe finden et le sujet Sie. Im Anhang signifie « en pièce jointe ».' },
      ],
    },

    'a2-arbeit-atelier-controle': {
      title: 'Vérifier : un appel pour une place d’apprentissage',
      estimatedMinutes: 10,
      lesson: {
        title: 'Vérifier : un appel pour une place d’apprentissage',
        description: 'Écoutez une première fois l’appel à l’atelier pour la situation générale. Lisez les questions, puis réécoutez pour les détails. Les deux dernières questions portent sur des phrases utiles : répondez sans réécouter. Après validation, la transcription et l’explication de chaque réponse s’affichent.',
      },
      explanations: {
        q1: 'Le candidat appelle « wegen der Ausbildung in Ihrer Fahrradwerkstatt » : das Fahrrad (le vélo) + die Werkstatt (l’atelier). Il répare aussi des vélos chez lui ; ni billets ni cuisine ne sont évoqués.',
        q2: '« Die Ausbildung beginnt am ersten August » : le 1er août. Lundi est la date limite pour envoyer les documents, pas le début de la formation.',
        q3: '« Schicken Sie uns bitte Ihren Lebenslauf und Ihr letztes Zeugnis » : le CV et le dernier bulletin ou certificat. Aucune photo, lettre manuscrite ou permis n’est demandé.',
        q4: 'La formatrice n’est là que demain : « ruft sie Sie morgen nach fünfzehn Uhr zurück ». Nach signifie « après » ; aujourd’hui, elle est absente (« Sie ist erst morgen wieder da »).',
        q5: 'Dans la proposition introduite par weil, le verbe conjugué arbeite va à la fin : weil ich gern im Team arbeite. Les deux autres phrases laissent arbeite en 1re ou en 2e position, comme dans une principale.',
        q6: 'Eine Nummer hinterlassen : laisser son numéro. Zurückrufen (rappeler) et anrufen (appeler) s’emploient avec une personne, pas avec un numéro que l’on laisse.',
      },
    },

    'a2-arbeit-atelier-mission': {
      kind: 'mission',
      title: 'Mission : se renseigner et postuler',
      estimatedMinutes: 20,
      competences: ['expression-orale', 'expression-ecrite'],
      lesson: {
        title: 'Mission : se renseigner et postuler',
        description: `Situation : un atelier propose une place d’apprentissage qui commence en septembre. Vous avez une expérience à présenter (par exemple deux semaines dans une entreprise l’été dernier) et vous êtes joignable à certains moments. Au téléphone, on vous annonce que la formatrice ne pourra pas vous rappeler à 15 h, mais à 16 h 30.

Modèles : Ich rufe wegen der Ausbildung an. Ist die Stelle noch frei? Letzten Sommer war ich zwei Wochen in einer Werkstatt. Ab halb fünf bin ich erreichbar. Ich bewerbe mich um die Ausbildung, weil ich gern praktisch arbeite. Meinen Lebenslauf finden Sie im Anhang.

Choisissez le poste, votre expérience et vos créneaux, préparez quelques mots-clés, puis réalisez les deux parties. Vérifiez que l’appel et le courriel concernent la même offre.`,
      },
      mission: {
        oral: {
          prompt: 'Enregistrez votre appel à l’atelier (une minute environ) : demandez si la place est encore libre, présentez une expérience datée au prétérit, puis convenez du rappel à 16 h 30 en confirmant l’heure.',
          maxSeconds: 90,
        },
        written: {
          prompt: 'Écrivez à la formatrice un courriel de 45 à 65 mots : nommez la formation et sa date de début, donnez votre motivation avec weil et annoncez votre CV en pièce jointe.',
          maxChars: 1000,
          minWords: 45,
        },
        checklist: [
          'J’ai demandé si la place était encore libre.',
          'J’ai présenté une expérience au prétérit, avec une date : Letzten Sommer war ich …',
          'J’ai confirmé le rappel à 16 h 30.',
          'Mon courriel nomme la formation, la date de début et le CV en pièce jointe.',
          'Après weil, le verbe conjugué est à la fin de la proposition.',
        ],
      },
    },
  },

  add: [
    {
      after: 'a2-arbeit-atelier-controle',
      activity: {
        id: 'a2-arbeit-atelier-repeter',
        kind: 'exercise',
        title: 'Répéter à voix haute : appeler pour une formation',
        estimatedMinutes: 8,
        competences: ['expression-orale'],
        lesson: {
          title: 'Répéter à voix haute : appeler pour une formation',
          description: 'Écoutez chaque modèle, puis dites la phrase à voix haute, comme au téléphone. Parlez lentement et articulez les dates et les heures. Si la reconnaissance vocale ne comprend pas votre phrase, réécoutez le modèle et réessayez.',
          transcript: null,
        },
        placements: [],
        questions: [
          { id: 'q1', type: 'speak', prompt: 'Écoutez, puis annoncez le motif de votre appel.',
            text: 'Ich rufe wegen der Ausbildung an.', accept: ['Ich rufe wegen der Ausbildung an.'], threshold: 75,
            explanation: 'La particule an de anrufen termine la phrase. Dans Ausbildung, l’accent porte sur Aus.' },
          { id: 'q2', type: 'speak', prompt: 'Écoutez, puis demandez si la place est libre.',
            text: 'Ist die Stelle noch frei?', accept: ['Ist die Stelle noch frei?'], threshold: 75,
            explanation: 'Question fermée : le verbe ist ouvre la phrase et la voix monte sur frei. Le st de Stelle se prononce « cht ».' },
          { id: 'q3', type: 'speak', prompt: 'Écoutez, puis présentez votre expérience.',
            text: 'Letztes Jahr war ich zwei Wochen in einer Werkstatt.', accept: ['Letztes Jahr war ich zwei Wochen in einer Werkstatt.', 'Letztes Jahr war ich 2 Wochen in einer Werkstatt.'], threshold: 75,
            explanation: 'Prétérit de sein : war, juste après Letztes Jahr. Le w de Werkstatt se prononce [v] et zwei commence par [ts].' },
          { id: 'q4', type: 'speak', prompt: 'Écoutez, puis demandez la date limite de candidature.',
            text: 'Bis wann kann ich mich bewerben?', accept: ['Bis wann kann ich mich bewerben?'], threshold: 75,
            explanation: 'Bis wann? demande une date limite. Le verbe pronominal sich bewerben devient mich bewerben avec ich.' },
          { id: 'q5', type: 'speak', prompt: 'Écoutez, puis dites à partir de quand vous êtes joignable.',
            text: 'Ich bin ab fünfzehn Uhr erreichbar.', accept: ['Ich bin ab fünfzehn Uhr erreichbar.', 'Ich bin ab 15 Uhr erreichbar.'], threshold: 75,
            explanation: 'Ab fünfzehn Uhr : à partir de 15 h. Erreichbar s’accentue sur reich ; le r final sonne presque comme un « a ».' },
        ],
      },
    },
  ],
};
