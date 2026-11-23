// Couche pédagogique V4 · a2-reisen-atelier (lot A7, contenu A2).
// Un train annulé : la prise de notes devient un exercice à trous sur la scène, la mission est remise dans l’application.

const dialogue = { media: 'a2-reisen-atelier-dialogue', usage: 'audio', transcriptVisibility: 'after_answer', decorative: false };

export default {
  module: 'a2-reisen-atelier',
  grammarFocus: ['question-indirecte', 'perfekt-haben-sein'],

  vocabulary: [
    { id: 'ausfallen', word: 'ausfallen', article: null, plural: null, partOfSpeech: 'verb', translation: 'être annulé (train, cours)',
      example: 'Bei Schnee können Züge ausfallen.', note: 'séparable : aus|fallen · Perfekt : ist ausgefallen' },
    { id: 'anschluss', word: 'Anschluss', article: 'der', plural: 'Anschlüsse', partOfSpeech: 'noun', translation: 'la correspondance',
      example: 'Der Anschluss fährt von Gleis drei.', note: null },
    { id: 'verbindung', word: 'Verbindung', article: 'die', plural: 'Verbindungen', partOfSpeech: 'noun', translation: 'la liaison, l’itinéraire',
      example: 'Ich drucke Ihnen die Verbindung aus.', note: null },
    { id: 'gelten', word: 'gelten', article: null, plural: null, partOfSpeech: 'verb', translation: 'être valable',
      example: 'Das Ticket soll auch für den nächsten Zug gelten.', note: 'es gilt · Perfekt : hat gegolten' },
    { id: 'fahrplan', word: 'Fahrplan', article: 'der', plural: 'Fahrpläne', partOfSpeech: 'noun', translation: 'l’horaire (des trains, des bus)',
      example: 'Auf dem Fahrplan steht 9.13 Uhr.', note: null },
    { id: 'hinweis', word: 'Hinweis', article: 'der', plural: 'Hinweise', partOfSpeech: 'noun', translation: 'l’avis, l’indication',
      example: 'Lesen Sie den Hinweis am Gleis.', note: null },
    { id: 'schalter', word: 'Schalter', article: 'der', plural: 'Schalter', partOfSpeech: 'noun', translation: 'le guichet',
      example: 'Am Schalter bekomme ich eine neue Verbindung.', note: null },
    { id: 'bahnsteig', word: 'Bahnsteig', article: 'der', plural: 'Bahnsteige', partOfSpeech: 'noun', translation: 'le quai',
      example: 'Der Zug wartet schon am Bahnsteig.', note: null },
    { id: 'bescheid-sagen', word: 'Bescheid sagen', article: null, plural: null, partOfSpeech: 'expression', translation: 'prévenir, informer',
      example: 'Ich möchte meinem Hotel Bescheid sagen.', note: 'jemandem Bescheid sagen : + datif' },
    { id: 'ausdrucken', word: 'ausdrucken', article: null, plural: null, partOfSpeech: 'verb', translation: 'imprimer',
      example: 'Können Sie mir die Verbindung ausdrucken?', note: 'séparable : aus|drucken' },
    { id: 'einchecken', word: 'einchecken', article: null, plural: null, partOfSpeech: 'verb', translation: 'faire son enregistrement (à l’hôtel)',
      example: 'Kann ich nach 14 Uhr noch einchecken?', note: 'séparable : ein|checken' },
    { id: 'ungefaehr', word: 'ungefähr', article: null, plural: null, partOfSpeech: 'adverb', translation: 'environ',
      example: 'Wann bin ich ungefähr in Leipzig?', note: null },
    { id: 'genug', word: 'genug', article: null, plural: null, partOfSpeech: 'adverb', translation: 'assez',
      example: 'Habe ich in Kassel genug Zeit?', note: null },
    { id: 'erst', word: 'erst', article: null, plural: null, partOfSpeech: 'adverb', translation: 'seulement, pas avant',
      example: 'Ich komme erst um 14.35 Uhr an.', note: 'erst um … : pas avant … heures' },
  ],

  activities: {
    'a2-reisen-atelier-guide': {
      title: 'Découvrir : un train annulé, une correspondance',
      estimatedMinutes: 15,
      lesson: {
        title: 'Découvrir : un train annulé, une correspondance',
        description: `Lisez cet avis affiché en gare.
« Der Zug nach Erfurt um 8.42 Uhr fällt aus. Bitte nehmen Sie den Zug um 9.13 Uhr von Gleis 4. Steigen Sie in Gotha um. Ihre Fahrkarte gilt auch für den nächsten Zug. »
Repérez où le voyageur veut aller (Erfurt), où il doit changer (Gotha) et quel train il doit prendre (9 h 13, voie 4). La dernière phrase lui évite un achat : son billet reste valable (gilt, du verbe gelten).

WOHIN ? WO ? WANN ? — DEMANDER POLIMENT
Wohin? demande la destination, wo? le lieu du changement, wann? l’heure. Au guichet, une question indirecte est plus polie, et le verbe conjugué passe à la fin :
• Wann fährt der Zug? → Könnten Sie mir sagen, wann der Zug fährt?
• Von welchem Gleis fährt er? → Könnten Sie mir sagen, von welchem Gleis er fährt?
• Wo muss ich umsteigen? → Könnten Sie mir sagen, wo ich umsteigen muss?

RACONTER LE TRAJET APRÈS COUP
« Ich bin über Gotha gefahren und um elf angekommen. Mein Zimmer habe ich schon am Dienstag reserviert. »
Fahren et ankommen expriment un déplacement : Perfekt avec sein. Reservieren se construit avec haben, sans ge- au participe. Avec d’autres notes (bus jusqu’à Arnstadt, arrivée à midi, chambre réservée lundi), on écrirait : Ich bin mit dem Bus nach Arnstadt gefahren und um zwölf angekommen. Das Zimmer habe ich am Montag reserviert.

À RETENIR
• fällt aus (ausfallen) : est annulé · der Anschluss : la correspondance · die Fahrkarte gilt : le billet est valable
• Lisez l’avis à voix haute, puis résumez le trajet en deux phrases : Ich fahre um 9.13 Uhr von Gleis 4 ab. In Gotha steige ich um.`,
      },
    },

    'a2-reisen-atelier-pratique': {
      kind: 'exercise',
      title: 'S’entraîner : noter un nouvel itinéraire',
      estimatedMinutes: 12,
      competences: ['ecoute', 'expression-ecrite'],
      lesson: {
        title: 'S’entraîner : noter un nouvel itinéraire',
        description: `Au guichet, une voyageuse apprend que son train pour Leipzig est annulé. L’employé lui propose un autre itinéraire.

1. Écoutez la scène une première fois sans lire les phrases : pourquoi la voyageuse vient-elle au guichet ?
2. Réécoutez pour compléter ses notes : voies, gare de correspondance, heure d’arrivée. Vous pouvez écrire les nombres en chiffres.
3. Les deux dernières questions sont des dictées : de nouvelles phrases utiles au guichet.
Après validation, la transcription de la scène et l’explication de chaque réponse s’affichent.`,
      },
      placements: { remove: ['a2-reisen-atelier-dialogue'], add: [dialogue] },
      questions: [
        { id: 'q1', type: 'fill', prompt: 'Le problème : complétez la première réplique.',
          text: 'Ich habe eine Fahrkarte nach [[1]]. Mein Zug [[2]] aus.',
          blanks: [{ id: '1', accept: ['Leipzig'], size: 9, hint: null }, { id: '2', accept: ['fällt'], size: 7, hint: 'ausfallen' }],
          explanation: 'La voyageuse va à Leipzig et dit « Mein Zug fällt aus » : le verbe séparable ausfallen (être annulé) se conjugue fällt, et la particule aus va à la fin.' },
        { id: 'q2', type: 'fill', prompt: 'Le départ et le changement : complétez la note.',
          text: 'Zug um 10.19 Uhr von Gleis [[1]], umsteigen in [[2]].',
          blanks: [{ id: '1', accept: ['7', 'sieben'], size: 7, hint: null }, { id: '2', accept: ['Kassel'], size: 9, hint: null }],
          explanation: 'L’employé dit « Nehmen Sie den Zug um zehn Uhr neunzehn von Gleis sieben. Sie müssen in Kassel umsteigen. » Gleis, c’est la voie.' },
        { id: 'q3', type: 'fill', prompt: 'La correspondance à Kassel : complétez.',
          text: 'Zeit zum Umsteigen: [[1]] Minuten. Der Anschluss fährt von Gleis [[2]].',
          blanks: [{ id: '1', accept: ['20', 'zwanzig'], size: 7, hint: null }, { id: '2', accept: ['3', 'drei'], size: 6, hint: null }],
          explanation: '« Ja, Sie haben zwanzig Minuten. Der Anschluss fährt von Gleis drei. » Der Anschluss désigne le train de correspondance.' },
        { id: 'q4', type: 'fill', prompt: 'Le billet : complétez la réponse de l’employé.',
          text: 'Nein, Ihre Fahrkarte [[1]] auch für diese Verbindung.',
          blanks: [{ id: '1', accept: ['gilt'], size: 6, hint: 'gelten' }],
          explanation: 'Gelten (être valable) change de voyelle : es gilt. Le billet reste valable pour le nouvel itinéraire, il n’y a rien à racheter.' },
        { id: 'q5', type: 'fill', prompt: 'L’arrivée à Leipzig : écrivez l’heure.',
          text: 'Ankunft in Leipzig: [[1]] Uhr [[2]].',
          blanks: [{ id: '1', accept: ['14', 'vierzehn'], size: 9, hint: null }, { id: '2', accept: ['12', 'zwölf'], size: 6, hint: null }],
          explanation: 'À la question « Wann bin ich ungefähr in Leipzig? », l’employé répond « Um vierzehn Uhr zwölf » : 14 h 12. L’heure 10 h 19 est celle du départ.' },
        { id: 'q6', type: 'fill', prompt: 'Pourquoi la voyageuse veut-elle connaître l’heure d’arrivée ? Complétez.',
          text: 'Ich möchte meinem Hotel [[1]] sagen.',
          blanks: [{ id: '1', accept: ['Bescheid'], size: 10, hint: null }],
          explanation: 'Jemandem Bescheid sagen signifie prévenir quelqu’un. La voyageuse veut informer son hôtel de son arrivée tardive ; meinem Hotel est au datif.' },
        { id: 'q7', type: 'dictation', prompt: 'Écoutez et écrivez la question polie posée au guichet.',
          accept: ['Könnten Sie mir sagen, wo ich umsteigen muss?'], voice: 'sprecherin',
          explanation: 'Dans la question indirecte introduite par wo, le verbe conjugué muss va à la fin, après l’infinitif umsteigen. Könnten s’écrit avec ö.' },
        { id: 'q8', type: 'dictation', prompt: 'Écoutez et écrivez le début du message envoyé à l’hôtel.',
          accept: ['Mein Zug ist ausgefallen. Ich komme später an.'], voice: 'sprecher',
          explanation: 'Ausfallen se conjugue avec sein au Perfekt : ist ausgefallen. Dans « Ich komme später an », la particule an du verbe ankommen termine la phrase.' },
      ],
    },

    'a2-reisen-atelier-controle': {
      title: 'Vérifier : le nouvel itinéraire',
      estimatedMinutes: 10,
      lesson: {
        title: 'Vérifier : le nouvel itinéraire',
        description: 'Écoutez une première fois la scène au guichet pour la situation générale. Lisez les questions, puis réécoutez pour les détails. Les deux dernières questions portent sur la langue : choisissez la phrase correcte sans réécouter. Après validation, la transcription et l’explication de chaque réponse s’affichent.',
      },
      explanations: {
        q1: 'La voyageuse dit « Mein Zug fällt aus » : ausfallen signifie être annulé. Elle a toujours son billet (« Ich habe eine Fahrkarte nach Leipzig ») et l’hôtel n’a rien annulé : elle veut seulement le prévenir.',
        q2: 'L’employé propose « den Zug um zehn Uhr neunzehn » : départ à 10 h 19. 14 h 12 est l’heure d’arrivée à Leipzig, et 10 h 09 n’est jamais prononcé.',
        q3: '« Sie haben zwanzig Minuten » répond à la question « Habe ich in Kassel genug Zeit? ». Zwanzig (20) ne se confond ni avec zehn (10) ni avec dreißig (30).',
        q4: '« Ihre Fahrkarte gilt auch für diese Verbindung » : gelten signifie être valable. Aucun nouvel achat n’est nécessaire, ni pour le trajet ni pour la correspondance.',
        q5: 'Dans une question indirecte, le verbe conjugué muss passe à la fin : …, wo ich umsteigen muss. Wo demande le lieu du changement ; wohin demanderait une destination.',
        q6: 'Fahren exprime un déplacement : ich bin … gefahren. Reservieren se construit avec haben : ich habe … reserviert. Les autres phrases inversent ou répètent les auxiliaires.',
      },
    },

    'a2-reisen-atelier-mission': {
      kind: 'mission',
      // Récapitulatif de la scène (images-v4, placé sur l’ancienne correction) : déplacé vers la répétition.
      placements: { remove: ['v4-a2-reisen-atelier-verbindung'] },
      title: 'Mission : prévenir l’hôtel d’un retard',
      estimatedMinutes: 20,
      competences: ['expression-orale', 'expression-ecrite'],
      lesson: {
        title: 'Mission : prévenir l’hôtel d’un retard',
        description: `Situation : votre train de 9 h est annulé. Le tableau affiche un départ à 10 h 40 avec changement à Fulda et arrivée à 14 h 05, mais le site ne dit pas clairement si votre billet reste valable. Au guichet, on vous annonce finalement une arrivée à 14 h 35.

Modèles au guichet : Mein Zug ist ausgefallen. Muss ich ein neues Ticket kaufen? Können Sie mir sagen, wo ich umsteigen muss?
Modèle pour l’hôtel : Guten Tag, mein Zug ist ausgefallen. Ich komme erst um 14.35 Uhr an. Kann ich dann noch einchecken?

Préparez quelques mots-clés, puis réalisez les deux parties. Vérifiez que la même heure d’arrivée figure à l’oral et à l’écrit.`,
      },
      mission: {
        oral: {
          prompt: 'Enregistrez ce que vous dites au guichet (une minute environ) : expliquez le problème, confirmez le départ de 10 h 40 et le changement à Fulda, puis posez une question polie sur votre billet.',
          maxSeconds: 90,
        },
        written: {
          prompt: 'Écrivez à l’hôtel un message de 35 à 50 mots : expliquez le retard, donnez la nouvelle heure d’arrivée (14 h 35) et demandez si vous pourrez encore faire l’enregistrement.',
          maxChars: 800,
          minWords: 35,
        },
        checklist: [
          'J’ai expliqué que mon train de 9 h est annulé.',
          'J’ai confirmé le départ de 10 h 40 et la correspondance à Fulda.',
          'J’ai posé au guichet une question polie sur la validité de mon billet.',
          'Mon message à l’hôtel donne la nouvelle heure d’arrivée : 14 h 35.',
          'J’ai relu les verbes : ist ausgefallen avec sein, et la particule an à la fin dans « Ich komme … an ».',
        ],
      },
    },
  },

  add: [
    {
      after: 'a2-reisen-atelier-controle',
      activity: {
        id: 'a2-reisen-atelier-repeter',
        kind: 'exercise',
        title: 'Répéter à voix haute : au guichet de la gare',
        estimatedMinutes: 8,
        competences: ['expression-orale'],
        lesson: {
          title: 'Répéter à voix haute : au guichet de la gare',
          description: 'Écoutez chaque modèle, puis dites la phrase à voix haute, comme au guichet. Montez la voix à la fin des questions fermées (Muss ich …? Habe ich …?). Si la reconnaissance vocale ne comprend pas votre phrase, réécoutez le modèle et réessayez.',
          transcript: null,
        },
        placements: [{ media: 'v4-a2-reisen-atelier-verbindung', usage: 'illustration', transcriptVisibility: 'hidden', decorative: false }],
        questions: [
          { id: 'q1', type: 'speak', prompt: 'Écoutez, puis expliquez votre problème.',
            text: 'Mein Zug fällt aus.', accept: ['Mein Zug fällt aus.'], threshold: 75,
            explanation: 'Le verbe séparable ausfallen se coupe : fällt en 2e position, aus à la fin. Le g final de Zug se prononce [k].' },
          { id: 'q2', type: 'speak', prompt: 'Écoutez, puis demandez s’il faut racheter un billet.',
            text: 'Muss ich eine neue Fahrkarte kaufen?', accept: ['Muss ich eine neue Fahrkarte kaufen?'], threshold: 75,
            explanation: 'Question fermée : le verbe de modalité muss ouvre la phrase et l’infinitif kaufen la termine. La voix monte sur kaufen.' },
          { id: 'q3', type: 'speak', prompt: 'Écoutez, puis demandez si vous aurez le temps de changer.',
            text: 'Habe ich in Kassel genug Zeit?', accept: ['Habe ich in Kassel genug Zeit?'], threshold: 75,
            explanation: 'Le h de habe s’aspire. Genug se termine par le son [k] et Zeit commence par [ts].' },
          { id: 'q4', type: 'speak', prompt: 'Écoutez, puis demandez poliment où changer de train.',
            text: 'Könnten Sie mir sagen, wo ich umsteigen muss?', accept: ['Könnten Sie mir sagen, wo ich umsteigen muss?'], threshold: 75,
            explanation: 'Question indirecte : le verbe muss passe à la fin. Accentuez UM-steigen, la particule séparable porte l’accent.' },
          { id: 'q5', type: 'speak', prompt: 'Écoutez, puis dites que vous voulez prévenir votre hôtel.',
            text: 'Ich möchte meinem Hotel Bescheid sagen.', accept: ['Ich möchte meinem Hotel Bescheid sagen.'], threshold: 75,
            explanation: 'Bescheid sagen signifie prévenir. Dans Hotel, l’accent tombe sur la deuxième syllabe : ho-TEL, et le h se prononce.' },
        ],
      },
    },
  ],
};
