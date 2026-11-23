// Couche pédagogique V4 · a2-wohnen-atelier (lot A7, contenu A2).
// Visiter une colocation : la prise de notes devient un exercice à trous sur la visite, Wo?/Wohin? est vérifié à l’écrit,
// la mission est remise dans l’application.

const dialogue = { media: 'a2-wohnen-atelier-dialogue', usage: 'audio', transcriptVisibility: 'after_answer', decorative: false };

export default {
  module: 'a2-wohnen-atelier',
  grammarFocus: ['wo-datif-wohin-accusatif', 'stellen-stehen-legen-liegen'],

  vocabulary: [
    { id: 'anzeige', word: 'Anzeige', article: 'die', plural: 'Anzeigen', partOfSpeech: 'noun', translation: 'l’annonce',
      example: 'In der Anzeige steht eine Kaltmiete von 420 Euro.', note: null },
    { id: 'insgesamt', word: 'insgesamt', article: null, plural: null, partOfSpeech: 'adverb', translation: 'au total',
      example: 'Sie zahlen also insgesamt 500 Euro.', note: null },
    { id: 'was-kommt-dazu', word: 'Was kommt noch dazu?', article: null, plural: null, partOfSpeech: 'expression',
      translation: 'Qu’est-ce qui s’ajoute encore ?', example: 'Die Kaltmiete ist 420 Euro. Was kommt noch dazu?', note: null },
    { id: 'enthalten', word: 'enthalten', article: null, plural: null, partOfSpeech: 'adjective', translation: 'compris, inclus',
      example: 'Sind die Nebenkosten in der Miete enthalten?', note: null },
    { id: 'mieten', word: 'mieten', article: null, plural: null, partOfSpeech: 'verb', translation: 'louer (comme locataire)',
      example: 'Ich würde das Zimmer gern mieten.', note: 'vermieten : louer (comme propriétaire)' },
    { id: 'hof', word: 'Hof', article: 'der', plural: 'Höfe', partOfSpeech: 'noun', translation: 'la cour',
      example: 'Fahrräder können im Hof stehen.', note: null },
    { id: 'abstellen', word: 'abstellen', article: null, plural: null, partOfSpeech: 'verb', translation: 'ranger, garer (un vélo)',
      example: 'Darf ich mein Fahrrad im Flur abstellen?', note: 'séparable : ab|stellen' },
    { id: 'sessel', word: 'Sessel', article: 'der', plural: 'Sessel', partOfSpeech: 'noun', translation: 'le fauteuil',
      example: 'Im Moment steht dort nur ein kleiner Sessel.', note: null },
    { id: 'schreibtisch', word: 'Schreibtisch', article: 'der', plural: 'Schreibtische', partOfSpeech: 'noun', translation: 'le bureau (meuble)',
      example: 'Kann ich meinen Schreibtisch neben das Fenster stellen?', note: null },
    { id: 'stuhl', word: 'Stuhl', article: 'der', plural: 'Stühle', partOfSpeech: 'noun', translation: 'la chaise',
      example: 'Der Stuhl steht vor dem Fenster.', note: null },
    { id: 'fenster', word: 'Fenster', article: 'das', plural: 'Fenster', partOfSpeech: 'noun', translation: 'la fenêtre',
      example: 'Das Zimmer hat ein großes Fenster.', note: null },
    { id: 'wand', word: 'Wand', article: 'die', plural: 'Wände', partOfSpeech: 'noun', translation: 'le mur',
      example: 'Das Bett steht an der Wand.', note: null },
    { id: 'tuer', word: 'Tür', article: 'die', plural: 'Türen', partOfSpeech: 'noun', translation: 'la porte',
      example: 'Der Schrank bleibt an der Tür.', note: null },
    { id: 'decke', word: 'Decke', article: 'die', plural: 'Decken', partOfSpeech: 'noun', translation: 'la couverture ; le plafond',
      example: 'Die Decke liegt auf dem Bett.', note: null },
    { id: 'zwischen', word: 'zwischen', article: null, plural: null, partOfSpeech: 'preposition', translation: 'entre',
      example: 'Der Sessel steht zwischen dem Bett und dem Schrank.', note: 'Wo? + datif · Wohin? + accusatif' },
    { id: 'neben', word: 'neben', article: null, plural: null, partOfSpeech: 'preposition', translation: 'à côté de',
      example: 'Der Sessel steht neben dem Fenster.', note: 'Wo? + datif · Wohin? + accusatif' },
    { id: 'vor', word: 'vor', article: null, plural: null, partOfSpeech: 'preposition', translation: 'devant',
      example: 'Ich lege den Teppich vor die Tür.', note: 'Wo? + datif · Wohin? + accusatif' },
    { id: 'hinter', word: 'hinter', article: null, plural: null, partOfSpeech: 'preposition', translation: 'derrière',
      example: 'Hinter dem Haus gibt es einen Platz für Fahrräder.', note: 'Wo? + datif · Wohin? + accusatif' },
  ],

  activities: {
    'a2-wohnen-atelier-guide': {
      title: 'Découvrir : une chambre en colocation, Wo? et Wohin?',
      estimatedMinutes: 15,
      lesson: {
        title: 'Découvrir : une chambre en colocation, Wo? et Wohin?',
        description: `Lisez cette annonce.
« Helles WG-Zimmer, 14 m², frei ab 1. Oktober. Kaltmiete: 395 Euro, Nebenkosten: 75 Euro. Das Bett und der Schrank bleiben im Zimmer. Fahrräder können im Hof stehen. »
Repérez la date (1er octobre), le total mensuel (395 + 75 = 470 euros), ce qui est déjà fourni (le lit et l’armoire) et ce qui manque : on pourra demander pendant la visite Gibt es auch einen Schreibtisch?

WO? : DÉCRIRE UNE POSITION (DATIF)
Observez le plan de la chambre : Das Bett steht an der Wand. Der Stuhl steht vor dem Fenster. Der Schrank steht neben der Tür. La question Wo? cherche l’endroit où se trouve un objet ; après an, vor et neben, on emploie alors le datif : an der Wand, vor dem Fenster, neben der Tür.

WOHIN? : DÉPLACER UN MEUBLE (ACCUSATIF)
Quand on déplace un meuble, la question devient Wohin? : l’article passe à l’accusatif et le verbe change aussi.
• Der Tisch steht neben dem Fenster. → Ich stelle den Tisch neben das Fenster.
• Die Decke liegt auf dem Bett. → Ich lege sie auf den Stuhl.
Stehen et liegen décrivent une position ; stellen (mettre debout) et legen (poser à plat) décrivent un mouvement.

COMPARER DEUX CHAMBRES
La chambre A coûte 470 euros en tout, et les vélos vont dans la cour. La chambre B coûte 440 euros plus 60 euros de charges, soit 500 euros, et les vélos vont à la cave. Deux questions utiles pour la visite : Sind die Nebenkosten in der Miete enthalten? Darf ich mein Fahrrad in den Keller stellen?

À RETENIR
• Wo? + datif : Das Bett steht an der Wand. • Wohin? + accusatif : Ich stelle das Bett an die Wand.
• Lisez ces phrases à voix haute en changeant de meuble : der Sessel, die Lampe, der Teppich.`,
      },
    },

    'a2-wohnen-atelier-pratique': {
      kind: 'exercise',
      title: 'S’entraîner : noter les informations d’une visite',
      estimatedMinutes: 12,
      competences: ['ecoute', 'expression-ecrite'],
      lesson: {
        title: 'S’entraîner : noter les informations d’une visite',
        description: `Un visiteur découvre une chambre libre dans une colocation. Une colocataire répond à ses questions.

1. Écoutez la visite une première fois sans lire les phrases : la chambre plaît-elle au visiteur ?
2. Réécoutez pour compléter : le loyer et les charges, la place des meubles, l’endroit pour les vélos et la date souhaitée. Vous pouvez écrire les nombres en chiffres.
3. Les deux dernières questions sont des dictées : de nouvelles phrases utiles pour une visite.
Après validation, la transcription de la visite et l’explication de chaque réponse s’affichent.`,
      },
      placements: { remove: ['a2-wohnen-atelier-dialogue'], add: [dialogue] },
      questions: [
        { id: 'q1', type: 'fill', prompt: 'Le loyer et les charges : complétez les montants.',
          text: 'Kaltmiete: [[1]] Euro. Nebenkosten: [[2]] Euro im Monat.',
          blanks: [{ id: '1', accept: ['420', 'vierhundertzwanzig'], size: 8, hint: null }, { id: '2', accept: ['80', 'achtzig'], size: 8, hint: null }],
          explanation: 'Le visiteur cite l’annonce, « eine Kaltmiete von 420 Euro », et la colocataire ajoute « Die Nebenkosten sind 80 Euro im Monat ». Total : 500 euros.' },
        { id: 'q2', type: 'fill', prompt: 'La question du visiteur sur son bureau : complétez avec l’article.',
          text: 'Kann ich meinen Schreibtisch neben [[1]] Fenster stellen?',
          blanks: [{ id: '1', accept: ['das'], size: 5, hint: 'das Fenster' }],
          explanation: 'Stellen indique un déplacement (Wohin?) : neben + accusatif. Das Fenster est neutre, l’accusatif reste das. « neben dem Fenster » répondrait à Wo?.' },
        { id: 'q3', type: 'fill', prompt: 'Ce qui se trouve aujourd’hui près de la fenêtre : complétez avec le verbe.',
          text: 'Im Moment [[1]] dort nur ein kleiner Sessel.',
          blanks: [{ id: '1', accept: ['steht'], size: 7, hint: null }],
          explanation: 'La colocataire décrit une position : le verbe stehen, er steht. Stellt exprimerait l’action de placer le fauteuil, ce qui n’est pas le sens ici.' },
        { id: 'q4', type: 'fill', prompt: 'Où reste l’armoire ? Complétez avec l’article.',
          text: 'Der Schrank bleibt an [[1]] Tür.',
          blanks: [{ id: '1', accept: ['der'], size: 5, hint: 'die Tür' }],
          explanation: 'Bleiben exprime une position (Wo?) : an + datif. Die Tür est féminin, le datif est der : an der Tür.' },
        { id: 'q5', type: 'fill', prompt: 'Où peut-on laisser les vélos ? Complétez avec la préposition.',
          text: '[[1]] dem Haus gibt es aber einen Platz für Fahrräder.',
          blanks: [{ id: '1', accept: ['Hinter'], size: 8, hint: null }],
          explanation: 'Le couloir est refusé (« Im Flur nicht »), mais « Hinter dem Haus gibt es aber einen Platz für Fahrräder » : derrière la maison, hinter + datif.' },
        { id: 'q6', type: 'fill', prompt: 'À partir de quand le visiteur veut-il louer ? Écrivez le jour.',
          text: 'Ich würde das Zimmer gern ab dem [[1]] September mieten.',
          blanks: [{ id: '1', accept: ['ersten', '1.'], size: 8, hint: null }],
          explanation: 'Le visiteur conclut « ab dem ersten September » : à partir du 1er septembre. Après ab dem, l’ordinal prend la terminaison -en : ersten.' },
        { id: 'q7', type: 'dictation', prompt: 'Écoutez et écrivez la question à poser sur le loyer.',
          accept: ['Sind die Nebenkosten in der Miete enthalten?'], voice: 'sprecher',
          explanation: 'Question fermée : le verbe sind ouvre la phrase et le participe enthalten la termine. Nebenkosten et Miete sont des noms : majuscule.' },
        { id: 'q8', type: 'dictation', prompt: 'Écoutez et écrivez où le visiteur veut finalement mettre son bureau.',
          accept: ['Ich stelle den Schreibtisch neben den Schrank.'], voice: 'sprecherin',
          explanation: 'Stellen indique un déplacement (Wohin?) : neben + accusatif. Der Schrank est masculin, d’où neben den Schrank ; le complément den Schreibtisch est aussi à l’accusatif.' },
      ],
    },

    'a2-wohnen-atelier-controle': {
      title: 'Vérifier : la chambre, le prix et les règles',
      estimatedMinutes: 10,
      lesson: {
        title: 'Vérifier : la chambre, le prix et les règles',
        description: 'Écoutez une première fois la visite pour la situation générale. Lisez les questions, puis réécoutez pour les détails. Les deux dernières questions portent sur la langue : choisissez la phrase correcte sans réécouter. Après validation, la transcription et l’explication de chaque réponse s’affichent.',
      },
      explanations: {
        q1: 'La colocataire dit « Die Nebenkosten sind 80 Euro im Monat. Sie zahlen also insgesamt 500 Euro » : 420 € de loyer hors charges + 80 € de charges. 420 € n’est que la Kaltmiete.',
        q2: '« Im Moment steht dort nur ein kleiner Sessel » : dort renvoie à la place près de la fenêtre. L’armoire reste près de la porte, et le bureau du visiteur n’est pas encore là.',
        q3: '« Im Flur nicht. Hinter dem Haus gibt es aber einen Platz für Fahrräder. » Hinter dem Haus signifie derrière la maison ; le couloir est justement refusé.',
        q4: 'Le visiteur conclut « ab dem ersten September » : à partir du 1er septembre. Le 1er octobre est la date d’une autre annonce, lue dans la leçon.',
        q5: 'Pour une position (Wo?), on emploie le verbe stehen et le datif : neben dem Fenster. « stellt » décrit l’action de placer, et « neben das Fenster » indiquerait une direction.',
        q6: 'On déplace le tapis : verbe d’action legen et accusatif, vor die Tür (Wohin?). « vor der Tür » répond à Wo?, et « liegt vor die Tür » mélange une position et une direction.',
      },
    },

    'a2-wohnen-atelier-mission': {
      kind: 'mission',
      title: 'Mission : visiter une chambre et décider',
      estimatedMinutes: 20,
      competences: ['expression-orale', 'expression-ecrite'],
      lesson: {
        title: 'Mission : visiter une chambre et décider',
        description: `Situation : une annonce propose une chambre en colocation à 460 euros hors charges. Dans la chambre, le lit est contre le mur ; vous voudriez mettre votre bureau devant la fenêtre. Pendant la visite, on vous annonce 70 euros de charges et on vous demande de ranger les vélos à la cave. Ensuite, vous constatez que le bureau ne rentre pas devant la fenêtre.

Modèles pour la visite : Wie hoch sind die Nebenkosten? Wo kann ich mein Fahrrad abstellen? Die Miete kostet also 530 Euro im Monat. Das Bett steht an der Wand. Ich stelle meinen Schreibtisch vor das Fenster.
Modèle pour le message : Ich möchte den Tisch neben den Schrank stellen, weil dort mehr Platz ist.

Préparez quelques mots-clés, puis réalisez les deux parties. Avant d’envoyer, vérifiez le calcul du prix et l’article qui change quand un meuble passe de la position (Wo?) au déplacement (Wohin?).`,
      },
      mission: {
        oral: {
          prompt: 'Enregistrez ce que vous dites pendant la visite (une minute environ) : demandez les charges et où ranger votre vélo, reformulez les deux réponses, puis décrivez où se trouve le lit et où vous voulez mettre votre bureau.',
          maxSeconds: 90,
        },
        written: {
          prompt: 'Le bureau ne rentre pas devant la fenêtre. Écrivez à une amie un message de 45 à 60 mots : le prix total, la règle pour le vélo, une autre place pour le bureau, et si vous voulez louer la chambre, avec une raison.',
          maxChars: 900,
          minWords: 45,
        },
        checklist: [
          'J’ai donné le prix total : 460 + 70 = 530 euros par mois.',
          'J’ai indiqué la règle du vélo : il doit aller à la cave (in den Keller).',
          'J’ai décrit la position du lit avec stehen et le datif : Das Bett steht an der Wand.',
          'J’ai proposé une autre place pour le bureau avec stellen et l’accusatif.',
          'J’ai dit si je loue la chambre et pourquoi, avec weil et le verbe conjugué à la fin.',
        ],
      },
    },
  },

  add: [
    {
      after: 'a2-wohnen-atelier-controle',
      activity: {
        id: 'a2-wohnen-atelier-repeter',
        kind: 'exercise',
        title: 'Répéter à voix haute : questions pour une visite',
        estimatedMinutes: 8,
        competences: ['expression-orale'],
        lesson: {
          title: 'Répéter à voix haute : questions pour une visite',
          description: 'Écoutez chaque modèle, puis dites la phrase à voix haute, comme pendant la visite d’une colocation. Faites entendre l’article : il indique la position ou le déplacement. Si la reconnaissance vocale ne comprend pas votre phrase, réécoutez le modèle et réessayez.',
          transcript: null,
        },
        placements: [],
        questions: [
          { id: 'q1', type: 'speak', prompt: 'Écoutez, puis demandez ce qui s’ajoute au loyer.',
            text: 'Was kommt noch dazu?', accept: ['Was kommt noch dazu?'], threshold: 75,
            explanation: 'Formule courte pour demander les frais en plus du loyer. Dans dazu, le z se prononce [ts] et l’accent porte sur la dernière syllabe : da-ZU.' },
          { id: 'q2', type: 'speak', prompt: 'Écoutez, puis reformulez le prix total.',
            text: 'Ich zahle also insgesamt fünfhundert Euro.', accept: ['Ich zahle also insgesamt fünfhundert Euro.', 'Ich zahle also insgesamt 500 Euro.'], threshold: 75,
            explanation: 'Also sert à reformuler pour vérifier. Fünfhundert se prononce avec ü ; dans Euro, eu se dit « oï ».' },
          { id: 'q3', type: 'speak', prompt: 'Écoutez, puis demandez où mettre votre bureau.',
            text: 'Kann ich meinen Schreibtisch neben das Fenster stellen?', accept: ['Kann ich meinen Schreibtisch neben das Fenster stellen?'], threshold: 75,
            explanation: 'Stellen et neben das Fenster, à l’accusatif, expriment le déplacement. Le sch de Schreibtisch se dit comme le « ch » de « chat ».' },
          { id: 'q4', type: 'speak', prompt: 'Écoutez, puis demandez si vous pouvez laisser votre vélo dans le couloir.',
            text: 'Darf ich mein Fahrrad im Flur abstellen?', accept: ['Darf ich mein Fahrrad im Flur abstellen?'], threshold: 75,
            explanation: 'Darf demande une permission ; l’infinitif abstellen termine la question. Accentuez AB-stellen et prononcez le d final de Fahrrad comme un [t].' },
          { id: 'q5', type: 'speak', prompt: 'Écoutez, puis dites où reste l’armoire.',
            text: 'Der Schrank bleibt an der Tür.', accept: ['Der Schrank bleibt an der Tür.'], threshold: 75,
            explanation: 'Bleiben décrit une position : an der Tür, au datif. Le ü de Tür est long, comme le « u » de « sûr ».' },
        ],
      },
    },
  ],
};
