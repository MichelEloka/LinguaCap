// Couche pédagogique V4 · a2-einkaufen-atelier (lot A7, contenu A2).
// Échanger une veste : la prise de notes devient un exercice à trous sur la scène, la mission est remise dans l’application.
// Les questions du contrôle gardent leurs identifiants (q4 porte les images de moyens de paiement d’images-v4).

const dialogue = { media: 'a2-einkaufen-atelier-dialogue', usage: 'audio', transcriptVisibility: 'after_answer', decorative: false };

export default {
  module: 'a2-einkaufen-atelier',
  grammarFocus: ['dieser-adjectif-accusatif', 'question-indirecte'],

  vocabulary: [
    { id: 'umtausch', word: 'Umtausch', article: 'der', plural: null, partOfSpeech: 'noun', translation: 'l’échange (d’un article)',
      example: 'Ein Umtausch ist bis zum 28. Mai möglich.', note: 'verbe : umtauschen' },
    { id: 'aermel', word: 'Ärmel', article: 'der', plural: 'Ärmel', partOfSpeech: 'noun', translation: 'la manche',
      example: 'Die Ärmel sind mir zu kurz.', note: null },
    { id: 'modell', word: 'Modell', article: 'das', plural: 'Modelle', partOfSpeech: 'noun', translation: 'le modèle',
      example: 'Haben Sie das Modell in Größe M?', note: null },
    { id: 'ware', word: 'Ware', article: 'die', plural: 'Waren', partOfSpeech: 'noun', translation: 'la marchandise, l’article',
      example: 'Die Ware darf nicht getragen sein.', note: null },
    { id: 'unterschied', word: 'Unterschied', article: 'der', plural: 'Unterschiede', partOfSpeech: 'noun', translation: 'la différence',
      example: 'Ist das neue Modell teurer, zahlen Sie den Unterschied.', note: null },
    { id: 'dazuzahlen', word: 'dazuzahlen', article: null, plural: null, partOfSpeech: 'verb', translation: 'payer en plus',
      example: 'Wie viel muss ich dazuzahlen?', note: 'séparable : dazu|zahlen — Ich zahle zehn Euro dazu.' },
    { id: 'genauso-viel-wie', word: 'genauso viel wie', article: null, plural: null, partOfSpeech: 'expression', translation: 'autant que',
      example: 'Kostet die graue Jacke genauso viel wie die blaue?', note: null },
    { id: 'kurz', word: 'kurz', article: null, plural: null, partOfSpeech: 'adjective', translation: 'court',
      example: 'Die Ärmel sind ein bisschen zu kurz.', note: 'contraire : lang' },
    { id: 'lang', word: 'lang', article: null, plural: null, partOfSpeech: 'adjective', translation: 'long',
      example: 'Die Hose ist mir zu lang.', note: null },
    { id: 'dunkelblau', word: 'dunkelblau', article: null, plural: null, partOfSpeech: 'adjective', translation: 'bleu foncé',
      example: 'Ich möchte diese dunkelblaue Jacke umtauschen.', note: 'hell- : clair · dunkel- : foncé' },
    { id: 'zuruecklegen', word: 'zurücklegen', article: null, plural: null, partOfSpeech: 'verb', translation: 'mettre de côté (un article)',
      example: 'Könnten Sie mir den Pullover bis morgen zurücklegen?', note: 'séparable : zurück|legen' },
    { id: 'nachschauen', word: 'nachschauen', article: null, plural: null, partOfSpeech: 'verb', translation: 'vérifier, aller voir',
      example: 'Ich kann gern im Lager nachschauen.', note: 'séparable : nach|schauen' },
    { id: 'lager', word: 'Lager', article: 'das', plural: 'Lager', partOfSpeech: 'noun', translation: 'la réserve, l’entrepôt',
      example: 'Vielleicht haben wir die Jacke noch im Lager.', note: null },
    { id: 'bar', word: 'bar', article: null, plural: null, partOfSpeech: 'adverb', translation: 'en espèces',
      example: 'Zahlen Sie bar oder mit Karte?', note: null },
    { id: 'karte', word: 'Karte', article: 'die', plural: 'Karten', partOfSpeech: 'noun', translation: 'la carte (bancaire)',
      example: 'Kann ich mit Karte zahlen?', note: 'mit Karte zahlen : payer par carte' },
    { id: 'gleich', word: 'gleich', article: null, plural: null, partOfSpeech: 'adverb', translation: 'tout de suite',
      example: 'Den neuen Kassenbon bekommen Sie gleich.', note: null },
  ],

  activities: {
    'a2-einkaufen-atelier-guide': {
      title: 'Découvrir : échanger un article et payer la différence',
      estimatedMinutes: 15,
      lesson: {
        title: 'Découvrir : échanger un article et payer la différence',
        description: `Lisez ces conditions affichées dans un magasin fictif.
« Ein Umtausch ist bis zum 28. Mai möglich. Bitte bringen Sie den Kassenbon mit. Die Ware darf nicht getragen sein. Ist ein anderes Modell teurer, zahlen Sie den Unterschied. »
Repérez la date limite (le 28 mai), le justificatif demandé (der Kassenbon) et la condition sur l’état de l’article : il ne doit pas avoir été porté. La dernière phrase dit quand payer la différence : si le nouveau modèle coûte plus cher.

DIESER, WELCHER ET L’ADJECTIF
Dans une demande, dieser et l’adjectif s’accordent avec le nom (ici à l’accusatif) :
• die Jacke / blau → Ich möchte diese blaue Jacke umtauschen.
• der Mantel / grau → Haben Sie diesen grauen Mantel in L?
• das Hemd / weiß → Kann ich dieses weiße Hemd anprobieren?
Welcher se décline de la même façon : Welche blaue Jacke meinen Sie? Welchen Mantel möchten Sie? Welches Hemd passt Ihnen?

UN PROBLÈME, UNE SOLUTION
• Die Ärmel sind mir zu lang. → Könnten Sie mir ein kürzeres Modell zeigen?
• Das Hemd ist mir zu eng. → Hätten Sie es in Größe L?
• Die Farbe gefällt mir nicht. → Gibt es die Jacke auch in Grün?
Avec zu lang, zu eng et gefallen, la personne est au datif : mir.

LA DIFFÉRENCE DE PRIX
Vous rendez un manteau payé 48 euros et prenez une veste à 55 euros : vous payez 7 euros de plus (dazuzahlen). Pour le vérifier poliment : Könnten Sie mir sagen, wie viel ich dazuzahlen muss? Dans cette question indirecte, le verbe conjugué muss passe à la fin.
Lisez les modèles à voix haute ; l’exercice « Répéter à voix haute » de ce module vérifie ensuite votre prononciation.`,
      },
    },

    'a2-einkaufen-atelier-pratique': {
      kind: 'exercise',
      title: 'S’entraîner : comprendre un échange au magasin',
      estimatedMinutes: 12,
      competences: ['ecoute', 'expression-ecrite'],
      lesson: {
        title: 'S’entraîner : comprendre un échange au magasin',
        description: `Une cliente rapporte une veste au magasin et le vendeur lui propose un autre modèle.

1. Écoutez la scène une première fois sans lire les phrases : quel est le problème de la veste ?
2. Réécoutez pour compléter les répliques : couleur, taille, prix et différence à payer. Vous pouvez écrire les prix en chiffres.
3. Les deux dernières questions sont des dictées : de nouvelles phrases utiles pour un échange.
Après validation, la transcription de la scène et l’explication de chaque réponse s’affichent.`,
      },
      placements: { remove: ['a2-einkaufen-atelier-dialogue'], add: [dialogue] },
      questions: [
        { id: 'q1', type: 'fill', prompt: 'Le problème : complétez la première réplique.',
          text: 'Ich möchte diese [[1]] Jacke umtauschen. Die Ärmel sind mir zu [[2]].',
          blanks: [{ id: '1', accept: ['dunkelblaue'], size: 12, hint: null }, { id: '2', accept: ['kurz'], size: 6, hint: null }],
          explanation: 'La cliente dit « diese dunkelblaue Jacke » : après diese, l’adjectif prend -e à l’accusatif féminin. Les manches sont trop courtes (zu kurz), pas trop longues.' },
        { id: 'q2', type: 'fill', prompt: 'Ce que demande le vendeur avant de chercher une autre taille.',
          text: 'Haben Sie den [[1]] dabei?',
          blanks: [{ id: '1', accept: ['Kassenbon'], size: 11, hint: null }],
          explanation: 'Le vendeur demande d’abord le ticket de caisse : « Haben Sie den Kassenbon dabei? ». Sans lui, pas d’échange ; la cliente répond « hier ist der Bon ».' },
        { id: 'q3', type: 'fill', prompt: 'L’article proposé : complétez la réponse du vendeur.',
          text: 'In Dunkelblau leider nicht. Wir haben diese [[1]] Jacke in [[2]].',
          blanks: [{ id: '1', accept: ['graue'], size: 7, hint: null }, { id: '2', accept: ['M'], size: 4, hint: null }],
          explanation: 'Le modèle bleu foncé n’existe plus en M ; le vendeur propose « diese graue Jacke in M ». Grau devient graue après diese, comme dunkelblaue.' },
        { id: 'q4', type: 'fill', prompt: 'Les deux prix : écrivez-les en chiffres ou en lettres.',
          text: 'Die graue Jacke kostet [[1]] Euro. Für die blaue haben Sie [[2]] Euro bezahlt.',
          blanks: [{ id: '1', accept: ['59', 'neunundfünfzig'], size: 14, hint: null }, { id: '2', accept: ['49', 'neunundvierzig'], size: 14, hint: null }],
          explanation: 'Le vendeur annonce 59 euros pour la veste grise et rappelle que la bleue a coûté 49 euros. En allemand, l’unité se dit avant la dizaine : neun-und-fünfzig.' },
        { id: 'q5', type: 'fill', prompt: 'La cliente calcule la différence : complétez le verbe séparable.',
          text: 'Dann zahle ich zehn Euro [[1]].',
          blanks: [{ id: '1', accept: ['dazu'], size: 6, hint: 'dazuzahlen' }],
          explanation: 'Dazuzahlen (payer en plus) est séparable : zahle en 2e position, la particule dazu à la fin. 59 − 49 = 10 euros.' },
        { id: 'q6', type: 'fill', prompt: 'La fin de l’échange : complétez la dernière réplique.',
          text: 'Den neuen Kassenbon [[1]] Sie gleich.',
          blanks: [{ id: '1', accept: ['bekommen'], size: 10, hint: null }],
          explanation: 'Bekommen signifie recevoir (et non « devenir ») : la cliente recevra tout de suite (gleich) un nouveau ticket de caisse. Den neuen Kassenbon, placé en tête, est le complément.' },
        { id: 'q7', type: 'dictation', prompt: 'Écoutez et écrivez la question posée au vendeur.',
          accept: ['Haben Sie diesen Pullover auch in Größe L?'], voice: 'frau',
          explanation: 'Pullover est masculin et complément de haben : diesen, à l’accusatif. Größe s’écrit avec ö et ß, et la taille L reste une majuscule.' },
        { id: 'q8', type: 'dictation', prompt: 'Écoutez et écrivez la consigne affichée à la caisse.',
          accept: ['Bitte bringen Sie den Kassenbon mit.'], voice: 'sprecher',
          explanation: 'Impératif de politesse avec Sie : le verbe bringen ouvre la phrase et la particule mit du verbe séparable mitbringen la termine.' },
      ],
    },

    'a2-einkaufen-atelier-controle': {
      title: 'Vérifier : un échange au magasin',
      estimatedMinutes: 10,
      lesson: {
        title: 'Vérifier : un échange au magasin',
        description: 'Écoutez une première fois la scène au magasin pour la situation générale. Lisez les questions, puis réécoutez pour les détails. Les deux dernières questions portent sur la langue : choisissez la phrase correcte sans réécouter. Après validation, la transcription et l’explication de chaque réponse s’affichent.',
      },
      // Liste complète : consignes au féminin (la voix est celle d’une cliente) ; identifiants, choix et images inchangés.
      questions: [
        {
          "id": "q1",
          "type": "choice",
          "prompt": "Quel défaut pousse la cliente à demander l’échange ?",
          "options": [
            {
              "id": "a",
              "label": "Les manches sont trop courtes.",
              "correct": true
            },
            {
              "id": "b",
              "label": "La fermeture ne marche pas.",
              "correct": false
            },
            {
              "id": "c",
              "label": "La veste est trop longue.",
              "correct": false
            }
          ],
          "explanation": "On entend « Die Ärmel sind mir zu kurz » : les manches sont trop courtes. Personne ne parle de fermeture, et c’est la longueur des manches, pas celle de la veste, qui pose problème."
        },
        {
          "id": "q2",
          "type": "choice",
          "prompt": "Quelle veste peut-elle essayer ?",
          "options": [
            {
              "id": "a",
              "label": "Une veste grise en S",
              "correct": false
            },
            {
              "id": "b",
              "label": "Une veste grise en M",
              "correct": true
            },
            {
              "id": "c",
              "label": "Une veste bleu foncé en M",
              "correct": false
            }
          ],
          "explanation": "Le vendeur n’a plus le bleu foncé en M ; il propose « diese graue Jacke in M ». La taille S n’est jamais mentionnée."
        },
        {
          "id": "q3",
          "type": "choice",
          "prompt": "Quelle différence de prix la cliente doit-elle payer ?",
          "options": [
            {
              "id": "a",
              "label": "49 euros",
              "correct": false
            },
            {
              "id": "b",
              "label": "59 euros",
              "correct": false
            },
            {
              "id": "c",
              "label": "10 euros",
              "correct": true
            }
          ],
          "explanation": "La veste grise coûte 59 euros et la bleue en a coûté 49 : la différence est de 10 euros, confirmée par « Dann zahle ich zehn Euro dazu ». 49 et 59 sont les prix, pas l’écart."
        },
        {
          "id": "q4",
          "type": "choice",
          "prompt": "Comment la cliente souhaite-t-elle payer ?",
          "options": [
            {
              "id": "a",
              "label": "Par carte",
              "correct": true
            },
            {
              "id": "b",
              "label": "En espèces",
              "correct": false
            },
            {
              "id": "c",
              "label": "Par virement",
              "correct": false
            }
          ],
          "explanation": "« Kann ich mit Karte zahlen? » — « Natürlich. » Mit Karte zahlen, c’est payer par carte ; ni espèces (bar) ni virement (Überweisung) ne sont évoqués."
        },
        {
          "id": "q5",
          "type": "choice",
          "prompt": "Quelle demande d’échange a le bon accord ?",
          "options": [
            {
              "id": "a",
              "label": "Ich möchte dieser schwarze Jacke umtauschen.",
              "correct": false
            },
            {
              "id": "b",
              "label": "Ich möchte diese schwarze Jacke umtauschen.",
              "correct": true
            },
            {
              "id": "c",
              "label": "Ich möchte diese schwarzen Jacke umtauschen.",
              "correct": false
            }
          ],
          "explanation": "Jacke est féminin et complément d’umtauschen (accusatif) : diese schwarze Jacke, avec -e. Dieser serait un nominatif masculin, et schwarzen une terminaison du datif ou du pluriel."
        },
        {
          "id": "q6",
          "type": "choice",
          "prompt": "Quelle demande permet de vérifier le prix avant de payer ?",
          "options": [
            {
              "id": "a",
              "label": "Könnten Sie mir bitte sagen, wie viel muss ich dazuzahlen?",
              "correct": false
            },
            {
              "id": "b",
              "label": "Könnten Sie mir bitte sagen, wo ich die Größe finde?",
              "correct": false
            },
            {
              "id": "c",
              "label": "Könnten Sie mir bitte sagen, wie viel ich dazuzahlen muss?",
              "correct": true
            }
          ],
          "explanation": "Dans une question indirecte, le verbe conjugué muss va à la fin : …, wie viel ich dazuzahlen muss. L’autre phrase correcte demande où trouver la taille, pas le prix."
        }
      ],
    },

    'a2-einkaufen-atelier-mission': {
      kind: 'mission',
      title: 'Mission : échanger un pull trop serré',
      estimatedMinutes: 20,
      competences: ['expression-orale', 'expression-ecrite'],
      lesson: {
        title: 'Mission : échanger un pull trop serré',
        description: `Situation : vous avez acheté lundi un pull à 35 euros. Il est trop serré. Le magasin a un modèle à 42 euros en taille L, mais dans une autre couleur. Le vendeur retrouve ensuite votre couleur d’origine en L, mais elle ne sera en magasin que demain.

Modèles : Ich möchte diesen Pullover umtauschen, er ist mir zu eng. Haben Sie diesen Pullover in Größe L? Könnten Sie mir sagen, wie viel ich dazuzahlen muss? Könnten Sie mir das Modell bis morgen zurücklegen?
Modèle pour le message : Den Kassenbon vom Montag habe ich noch. Kann ich den Pullover morgen abholen?

Préparez quelques mots-clés, puis réalisez les deux parties. Vérifiez que le prix, la couleur et la taille sont les mêmes à l’oral et à l’écrit.`,
      },
      mission: {
        oral: {
          prompt: 'Enregistrez ce que vous dites au comptoir (une minute environ) : expliquez le problème, demandez à essayer le modèle en L, faites confirmer la différence de prix et dites si vous attendez votre couleur jusqu’à demain.',
          maxSeconds: 90,
        },
        written: {
          prompt: 'Écrivez au magasin un message de 45 à 65 mots pour confirmer l’échange retenu : date d’achat, numéro du ticket (inventez-le), motif de l’échange, couleur, taille et une question sur le retrait ou le paiement.',
          maxChars: 900,
          minWords: 45,
        },
        checklist: [
          'J’ai expliqué le problème : le pull est trop serré (zu eng).',
          'J’ai demandé la taille L avec une formule polie (Hätten Sie …? Könnten Sie …?).',
          'J’ai annoncé la bonne différence de prix : 42 − 35 = 7 euros.',
          'Mon message donne la date d’achat, le numéro du ticket, la couleur et la taille.',
          'J’ai accordé dieser et l’adjectif : diesen grauen Pullover, diese neue Farbe.',
        ],
      },
    },
  },

  add: [
    {
      after: 'a2-einkaufen-atelier-controle',
      activity: {
        id: 'a2-einkaufen-atelier-repeter',
        kind: 'exercise',
        title: 'Répéter à voix haute : demander un échange',
        estimatedMinutes: 8,
        competences: ['expression-orale'],
        lesson: {
          title: 'Répéter à voix haute : demander un échange',
          description: 'Écoutez chaque modèle, puis dites la phrase à voix haute, sur un ton poli. Montez la voix à la fin des questions fermées (Haben Sie …? Kann ich …?). Si la reconnaissance vocale ne comprend pas votre phrase, réécoutez le modèle et réessayez.',
          transcript: null,
        },
        placements: [],
        questions: [
          { id: 'q1', type: 'speak', prompt: 'Écoutez, puis annoncez ce que vous voulez faire.',
            text: 'Ich möchte diese Jacke umtauschen.', accept: ['Ich möchte diese Jacke umtauschen.'], threshold: 75,
            explanation: 'Möchte + infinitif à la fin. Umtauschen s’accentue sur la particule : UM-tauschen.' },
          { id: 'q2', type: 'speak', prompt: 'Écoutez, puis expliquez le problème.',
            text: 'Die Ärmel sind mir zu kurz.', accept: ['Die Ärmel sind mir zu kurz.'], threshold: 75,
            explanation: 'Le Ä d’Ärmel se prononce comme « è ». Mir, au datif, indique la personne gênée : les manches sont trop courtes pour moi.' },
          { id: 'q3', type: 'speak', prompt: 'Écoutez, puis demandez une autre taille.',
            text: 'Haben Sie das Modell in Größe M?', accept: ['Haben Sie das Modell in Größe M?'], threshold: 75,
            explanation: 'Question fermée : le verbe haben ouvre la phrase. Dans Modell, l’accent tombe sur la deuxième syllabe : mo-DELL.' },
          { id: 'q4', type: 'speak', prompt: 'Écoutez, puis comparez les prix.',
            text: 'Kostet sie genauso viel wie die blaue?', accept: ['Kostet sie genauso viel wie die blaue?'], threshold: 75,
            explanation: 'Genauso viel wie : autant que. Le v de viel se prononce [f] ; die blaue remplace die blaue Jacke.' },
          { id: 'q5', type: 'speak', prompt: 'Écoutez, puis demandez à payer par carte.',
            text: 'Kann ich mit Karte zahlen?', accept: ['Kann ich mit Karte zahlen?'], threshold: 75,
            explanation: 'Le z de zahlen se prononce [ts]. Mit Karte, sans article, est la formule usuelle pour payer par carte.' },
        ],
      },
    },
  ],
};
