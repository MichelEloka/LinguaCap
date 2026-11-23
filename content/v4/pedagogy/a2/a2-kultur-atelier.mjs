// Couche pédagogique V4 · a2-kultur-atelier (lot A7, contenu A2).
// Préparer une fête de quartier : la prise de notes devient un exercice à trous sur la scène, la mission est remise dans l’application.

const dialogue = { media: 'a2-kultur-atelier-dialogue', usage: 'audio', transcriptVisibility: 'after_answer', decorative: false };

export default {
  module: 'a2-kultur-atelier',
  grammarFocus: ['comparatif-als-wie', 'avis-dass', 'registre-du-sie'],

  vocabulary: [
    { id: 'nachbarschaftsfest', word: 'Nachbarschaftsfest', article: 'das', plural: 'Nachbarschaftsfeste', partOfSpeech: 'noun', translation: 'la fête de quartier, la fête des voisins',
      example: 'Organisieren Sie das Nachbarschaftsfest?', note: null },
    { id: 'hof', word: 'Hof', article: 'der', plural: 'Höfe', partOfSpeech: 'noun', translation: 'la cour',
      example: 'Im Hof können die Kinder draußen spielen.', note: null },
    { id: 'saal', word: 'Saal', article: 'der', plural: 'Säle', partOfSpeech: 'noun', translation: 'la (grande) salle',
      example: 'Der Saal ist größer als der Hof.', note: null },
    { id: 'viertel', word: 'Viertel', article: 'das', plural: 'Viertel', partOfSpeech: 'noun', translation: 'le quartier',
      example: 'Ich bin neu im Viertel.', note: null },
    { id: 'nachbar', word: 'Nachbar', article: 'der', plural: 'Nachbarn', partOfSpeech: 'noun', translation: 'le voisin',
      example: 'Unser Nachbar hilft beim Fest.', note: 'au féminin : die Nachbarin, die Nachbarinnen' },
    { id: 'mitmachen', word: 'mitmachen', article: null, plural: null, partOfSpeech: 'verb', translation: 'participer',
      example: 'Möchten Sie auch mitmachen?', note: 'séparable : mit|machen' },
    { id: 'mitbringen', word: 'mitbringen', article: null, plural: null, partOfSpeech: 'verb', translation: 'apporter',
      example: 'Soll ich Teller mitbringen?', note: 'séparable : mit|bringen · Perfekt : hat mitgebracht' },
    { id: 'becher', word: 'Becher', article: 'der', plural: 'Becher', partOfSpeech: 'noun', translation: 'le gobelet',
      example: 'Bitte bringen Sie Ihren eigenen Becher mit.', note: null },
    { id: 'teller', word: 'Teller', article: 'der', plural: 'Teller', partOfSpeech: 'noun', translation: 'l’assiette',
      example: 'Bitte bringen Sie einen Teller mit.', note: 'der Mehrwegteller : l’assiette réutilisable' },
    { id: 'wenig', word: 'wenig', article: null, plural: null, partOfSpeech: 'adjective', translation: 'peu (de)',
      example: 'Dann haben wir weniger Müll.', note: 'comparatif : weniger (moins de)' },
    { id: 'regen', word: 'Regen', article: 'der', plural: null, partOfSpeech: 'noun', translation: 'la pluie',
      example: 'Bei Regen treffen wir uns im Saal.', note: 'bei Regen : en cas de pluie' },
    { id: 'draussen', word: 'draußen', article: null, plural: null, partOfSpeech: 'adverb', translation: 'dehors',
      example: 'Die Kinder spielen draußen.', note: null },
    { id: 'drinnen', word: 'drinnen', article: null, plural: null, partOfSpeech: 'adverb', translation: 'dedans, à l’intérieur',
      example: 'Bei Regen feiern wir drinnen.', note: null },
    { id: 'das-du-anbieten', word: 'das Du anbieten', article: null, plural: null, partOfSpeech: 'expression', translation: 'proposer le tutoiement',
      example: 'Die Nachbarin möchte mir das Du anbieten.', note: 'c’est la personne la plus âgée qui le propose' },
    { id: 'aufstellen', word: 'aufstellen', article: null, plural: null, partOfSpeech: 'verb', translation: 'installer, dresser',
      example: 'Um vier müssen wir die Tische aufstellen.', note: 'séparable : auf|stellen' },
    { id: 'passen', word: 'passen', article: null, plural: null, partOfSpeech: 'verb', translation: 'convenir, aller bien',
      example: 'Das Datum muss für alle passen.', note: null },
    { id: 'vor-ort', word: 'vor Ort', article: null, plural: null, partOfSpeech: 'expression', translation: 'sur place',
      example: 'Getränke gibt es vor Ort.', note: null },
  ],

  activities: {
    'a2-kultur-atelier-guide': {
      title: 'Découvrir : préparer une fête de quartier',
      estimatedMinutes: 15,
      lesson: {
        title: 'Découvrir : préparer une fête de quartier',
        description: `Lisez cette affiche.
« Am Samstag findet unser Hoffest statt. Wir beginnen um drei. Bei Regen treffen wir uns im Gemeindehaus. Bitte bringen Sie Ihren eigenen Becher mit. Getränke gibt es vor Ort. »
Repérez l’heure (15 h), les deux lieux (la cour, puis la salle communale en cas de pluie) et ce que chacun doit apporter (son propre gobelet). Les boissons sont servies sur place (vor Ort).

COMPARER DEUX LIEUX
Le jardin offre 30 places au soleil, la salle 50 places à l’abri. La dernière fois, il y avait autant de bruit dehors que dedans.
• Der Saal ist größer als der Garten. — comparatif + als
• Bei Regen ist der Saal besser als der Garten. — gut → besser
• Draußen war es genauso laut wie drinnen. — égalité : (genau)so … wie
• Der Garten ist nicht so groß wie der Saal. — négation : nicht so … wie

DU OU SIE ?
Au premier contact avec un voisin inconnu, on vouvoie : Können Sie mir helfen? Könnten Sie mir sagen, wann das Fest beginnt? Quand l’autre propose le tutoiement (Wir können uns gern duzen.), on passe à du : Kannst du mir helfen? Kannst du mir sagen, wann ich kommen soll? Dans ces questions indirectes, le verbe conjugué va à la fin.

DONNER SON AVIS
Ich finde, dass der Hof besser passt. — Après dass, le verbe passt termine la phrase. Sans dass, l’ordre reste normal : Ich finde, der Hof passt besser.

À VOUS
Un groupe apporte des instruments et la pluie est possible : où faut-il organiser la fête ? Dites votre avis à voix haute avec une comparaison, par exemple : Ich finde, dass der Saal besser passt, denn er ist größer als der Garten. Pour l’affiche, deux phrases suffisent : Bei Regen treffen wir uns im Saal. Bitte bringen Sie Ihren eigenen Becher mit.`,
      },
    },

    'a2-kultur-atelier-pratique': {
      kind: 'exercise',
      title: 'S’entraîner : noter les décisions pour la fête',
      estimatedMinutes: 12,
      competences: ['ecoute', 'expression-ecrite'],
      lesson: {
        title: 'S’entraîner : noter les décisions pour la fête',
        description: `Une nouvelle habitante du quartier rencontre un voisin qui organise la fête de l’immeuble.

1. Écoutez la scène une première fois sans lire les phrases : quelle décision faut-il prendre, et entre quels lieux ?
2. Réécoutez pour compléter les notes : l’avantage de chaque lieu, la solution en cas de pluie, la vaisselle, le changement de registre et l’heure du rendez-vous.
3. Les deux dernières questions sont des dictées : de nouvelles phrases pour comparer et organiser.
Après validation, la transcription de la scène et l’explication de chaque réponse s’affichent.`,
      },
      placements: { remove: ['a2-kultur-atelier-dialogue'], add: [dialogue] },
      questions: [
        { id: 'q1', type: 'fill', prompt: 'Les deux lieux : complétez la comparaison de l’organisateur.',
          text: 'Der Saal ist [[1]], aber im Hof können die Kinder [[2]] spielen.',
          blanks: [{ id: '1', accept: ['größer'], size: 8, hint: 'groß' }, { id: '2', accept: ['draußen'], size: 9, hint: null }],
          explanation: 'L’organisateur dit « Der Saal ist größer, aber im Hof können die Kinder draußen spielen » : la salle est plus grande, la cour permet de jouer dehors. Groß prend un Umlaut : größer.' },
        { id: 'q2', type: 'fill', prompt: 'L’avis de l’organisateur : complétez.',
          text: 'Ich finde, dass der Hof besser [[1]].',
          blanks: [{ id: '1', accept: ['passt'], size: 7, hint: 'passen' }],
          explanation: 'Après dass, le verbe conjugué passt se place à la fin de la proposition. L’organisateur préfère la cour.' },
        { id: 'q3', type: 'fill', prompt: 'La solution de repli : complétez.',
          text: 'Bei [[1]] können wir in den Saal gehen.',
          blanks: [{ id: '1', accept: ['Regen'], size: 7, hint: null }],
          explanation: 'Bei Regen signifie « en cas de pluie » : la salle sert de solution de repli. In den Saal (in + accusatif) indique où l’on va.' },
        { id: 'q4', type: 'fill', prompt: 'Pourquoi des assiettes réutilisables ? Complétez.',
          text: 'Ja, bitte Mehrwegteller. Dann haben wir [[1]] Müll.',
          blanks: [{ id: '1', accept: ['weniger'], size: 9, hint: null }],
          explanation: 'Weniger, comparatif de wenig, signifie « moins de » : des assiettes réutilisables (Mehrweg) produisent moins de déchets.' },
        { id: 'q5', type: 'fill', prompt: 'Le changement de registre : complétez la proposition de l’organisateur.',
          text: 'Und wir können uns gern [[1]].',
          blanks: [{ id: '1', accept: ['duzen'], size: 7, hint: null }],
          explanation: 'Sich duzen, c’est se tutoyer. Juste après, la voisine passe à du : « Kannst du mir sagen, … ? »' },
        { id: 'q6', type: 'fill', prompt: 'L’heure du rendez-vous : complétez. Vous pouvez écrire le nombre en chiffres.',
          text: 'Kannst du mir sagen, wann ich kommen [[1]]? – Um [[2]].',
          blanks: [{ id: '1', accept: ['soll'], size: 6, hint: 'sollen' }, { id: '2', accept: ['vier', '4'], size: 6, hint: null }],
          explanation: 'Dans la question indirecte introduite par wann, le verbe conjugué soll va à la fin. L’organisateur répond « Um vier » : 16 h, pour installer les tables ensemble.' },
        { id: 'q7', type: 'dictation', prompt: 'Écoutez et écrivez la comparaison.',
          accept: ['Der Garten ist nicht so groß wie der Saal.'], voice: 'sprecherin',
          explanation: 'La négation de l’égalité se construit avec nicht so … wie. Groß s’écrit avec ß après la voyelle longue o.' },
        { id: 'q8', type: 'dictation', prompt: 'Écoutez et écrivez la phrase de l’affiche.',
          accept: ['Bei Regen feiern wir im Gemeindehaus.'], voice: 'sprecher',
          explanation: 'Bei Regen, en tête, est suivi du verbe feiern puis du sujet wir. Das Gemeindehaus (la salle communale) s’écrit en un seul mot.' },
      ],
    },

    'a2-kultur-atelier-controle': {
      title: 'Vérifier : la cour ou la salle ?',
      estimatedMinutes: 10,
      lesson: {
        title: 'Vérifier : la cour ou la salle ?',
        description: 'Écoutez une première fois la scène pour la situation générale. Lisez les questions, puis réécoutez pour les détails. Les deux dernières questions portent sur la langue : choisissez la phrase correcte sans réécouter. Après validation, la transcription et l’explication de chaque réponse s’affichent.',
      },
      explanations: {
        q1: 'L’organisateur dit « Der Saal ist größer » : la salle est plus grande. Le jeu des enfants dehors est l’avantage de la cour, et la gare n’est pas mentionnée.',
        q2: '« Bei Regen können wir in den Saal gehen » : la salle sert de solution de repli. La cour est le lieu prévu par beau temps ; aucun parc n’est cité.',
        q3: '« Bitte Mehrwegteller. Dann haben wir weniger Müll. » Des assiettes réutilisables produisent moins de déchets (weniger Müll) ; ni loyer ni lumière ne sont évoqués.',
        q4: '« Und wir können uns gern duzen » : l’organisateur propose de se tutoyer, et la voisine répond aussitôt avec « Kannst du … ». La fête n’est ni annulée ni reportée.',
        q5: 'Après un comparatif comme ruhiger, le second terme est introduit par als : ruhiger als der Saal. Wie sert à l’égalité (so ruhig wie), et « so ruhiger als » mélange les deux constructions.',
        q6: 'Avec une inconnue, on vouvoie : Könnten Sie. Dans la question indirecte, le verbe beginnt va à la fin : …, wann das Fest beginnt. « Kannst du » serait trop familier au premier contact.',
      },
    },

    'a2-kultur-atelier-mission': {
      kind: 'mission',
      title: 'Mission : organiser une fête de quartier',
      estimatedMinutes: 20,
      competences: ['expression-orale', 'expression-ecrite'],
      lesson: {
        title: 'Mission : organiser une fête de quartier',
        description: `Situation : vous préparez une rencontre de quartier samedi à 16 h. L’espace du parc est plus grand que la salle, mais la météo annonce de la pluie. Vous rencontrez pour la première fois une voisine qui veut aider ; après quelques phrases, elle propose de vous tutoyer. Ensuite, vous apprenez que la salle est occupée : la fête aura lieu au parc, et en cas de pluie, on s’abritera sous le préau de l’entrée (das Vordach).

Modèles : Der Park ist größer als der Saal. Ich finde, dass der Park besser passt. Kannst du wiederverwendbare Becher mitbringen? Bei Regen treffen wir uns unter dem Vordach am Eingang.

Préparez quelques mots-clés, puis réalisez les deux parties. Relisez l’annonce comme si vous étiez un voisin qui arrive seul : saurait-il où aller, même sous la pluie ?`,
      },
      mission: {
        oral: {
          prompt: 'Enregistrez ce que vous dites à la voisine (une minute environ) : vouvoyez-la d’abord, comparez le parc et la salle, proposez une décision avec Ich finde, dass …, puis, après sa proposition de tutoiement, demandez-lui avec du si elle peut apporter des gobelets réutilisables.',
          maxSeconds: 90,
        },
        written: {
          prompt: 'Écrivez pour tous les voisins une annonce de 45 à 65 mots : rendez-vous au parc samedi à 16 h, solution sous le préau en cas de pluie et consigne pour réduire les déchets. Vouvoyez les lecteurs.',
          maxChars: 900,
          minWords: 45,
        },
        checklist: [
          'À l’oral, j’ai comparé le parc et la salle avec un comparatif suivi de als.',
          'J’ai donné mon avis avec Ich finde, dass … et le verbe conjugué à la fin.',
          'J’ai vouvoyé la voisine, puis je suis passé(e) à du après sa proposition.',
          'Mon annonce indique le lieu, le jour, l’heure et l’endroit où s’abriter en cas de pluie.',
          'Mon annonce vouvoie les voisins et donne une consigne contre les déchets.',
        ],
      },
    },
  },

  add: [
    {
      after: 'a2-kultur-atelier-controle',
      activity: {
        id: 'a2-kultur-atelier-repeter',
        kind: 'exercise',
        title: 'Répéter à voix haute : proposer et donner son avis',
        estimatedMinutes: 8,
        competences: ['expression-orale'],
        lesson: {
          title: 'Répéter à voix haute : proposer et donner son avis',
          description: 'Écoutez chaque modèle, puis dites la phrase à voix haute, comme si vous parliez à un voisin. Faites entendre le verbe à la fin après dass. Si la reconnaissance vocale ne comprend pas votre phrase, réécoutez le modèle et réessayez.',
          transcript: null,
        },
        placements: [],
        questions: [
          { id: 'q1', type: 'speak', prompt: 'Écoutez, puis présentez-vous à un voisin.',
            text: 'Ich bin neu im Viertel.', accept: ['Ich bin neu im Viertel.'], threshold: 75,
            explanation: 'Dans Viertel, le v se prononce [f] et ie est un i long : « fiertel ». Neu se prononce « noï ».' },
          { id: 'q2', type: 'speak', prompt: 'Écoutez, puis proposez à quelqu’un de participer.',
            text: 'Möchten Sie auch mitmachen?', accept: ['Möchten Sie auch mitmachen?'], threshold: 75,
            explanation: 'Question fermée : la voix monte à la fin. La particule mit de mitmachen porte l’accent : MIT-machen.' },
          { id: 'q3', type: 'speak', prompt: 'Écoutez, puis donnez votre avis sur le lieu.',
            text: 'Ich finde, dass der Hof besser passt.', accept: ['Ich finde, dass der Hof besser passt.'], threshold: 75,
            explanation: 'Après dass, le verbe passt termine la phrase. Faites une petite pause à la virgule avant dass.' },
          { id: 'q4', type: 'speak', prompt: 'Écoutez, puis annoncez la solution en cas de pluie.',
            text: 'Bei Regen können wir in den Saal gehen.', accept: ['Bei Regen können wir in den Saal gehen.'], threshold: 75,
            explanation: 'Le verbe de modalité können vient en 2e position, l’infinitif gehen à la fin. Saal se prononce avec un a long.' },
          { id: 'q5', type: 'speak', prompt: 'Écoutez, puis proposez de vous tutoyer.',
            text: 'Wir können uns gern duzen.', accept: ['Wir können uns gern duzen.'], threshold: 75,
            explanation: 'Duzen se prononce avec un u long et un z [ts] : « doutsen ». Gern adoucit la proposition.' },
        ],
      },
    },
  ],
};
