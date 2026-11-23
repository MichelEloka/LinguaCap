// Couche pédagogique V4 · A1 · Lire et confirmer les montants au-delà de 100.
const REPEAT = 'Écoutez le modèle, puis dites la phrase à voix haute.';
const speak = (id, text, explanation, accept = [text]) => ({ id, type: 'speak', prompt: REPEAT, text, accept, explanation });
const dialogue = { media: 'a1-montants-dialogue', usage: 'audio', transcriptVisibility: 'after_answer', decorative: false };

export default {
  module: 'a1-montants',
  vocabulary: [
    { id: 'hundert', word: 'hundert', article: null, plural: null, partOfSpeech: 'number', translation: 'cent', example: 'Das kostet hundert Euro.', note: 'on dit aussi einhundert : einhundertfünfzehn = 115' },
    { id: 'tausend', word: 'tausend', article: null, plural: null, partOfSpeech: 'number', translation: 'mille', example: 'Das Klavier kostet eintausend Euro.', note: 'on écrit 1.000 : le point sépare les milliers' },
    { id: 'tisch', word: 'Tisch', article: 'der', plural: 'Tische', partOfSpeech: 'noun', translation: 'la table', example: 'Der Tisch kostet einhundertfünfzehn Euro.', note: null },
    { id: 'schreibtisch', word: 'Schreibtisch', article: 'der', plural: 'Schreibtische', partOfSpeech: 'noun', translation: 'le bureau (meuble)', example: 'Was kostet der kleine Schreibtisch?', note: null },
    { id: 'stuhl', word: 'Stuhl', article: 'der', plural: 'Stühle', partOfSpeech: 'noun', translation: 'la chaise', example: 'Der Stuhl kostet einhundertfünfzig Euro.', note: null },
    { id: 'lampe', word: 'Lampe', article: 'die', plural: 'Lampen', partOfSpeech: 'noun', translation: 'la lampe', example: 'Was kostet die Lampe?', note: null },
    { id: 'fahrrad', word: 'Fahrrad', article: 'das', plural: 'Fahrräder', partOfSpeech: 'noun', translation: 'le vélo', example: 'Ist das Fahrrad noch da?', note: null },
    { id: 'sofa', word: 'Sofa', article: 'das', plural: 'Sofas', partOfSpeech: 'noun', translation: 'le canapé', example: 'Das Sofa kostet sechshundert Euro.', note: null },
    { id: 'zusammen', word: 'zusammen', article: null, plural: null, partOfSpeech: 'adverb', translation: 'ensemble ; en tout', example: 'Was kostet das zusammen?', note: null },
    { id: 'nehmen', word: 'nehmen', article: null, plural: null, partOfSpeech: 'verb', translation: 'prendre', example: 'Wir nehmen das Sofa.', note: 'ich nehme, du nimmst, er nimmt' },
    { id: 'billig', word: 'billig', article: null, plural: null, partOfSpeech: 'adjective', translation: 'bon marché, pas cher', example: 'Das Fahrrad ist billig.', note: 'contraire : teuer' },
    { id: 'oder', word: 'oder', article: null, plural: null, partOfSpeech: 'conjunction', translation: 'ou', example: 'Hundertfünfzehn oder hundertfünfzig Euro?', note: null },
    { id: 'wiederholen', word: 'wiederholen', article: null, plural: null, partOfSpeech: 'verb', translation: 'répéter', example: 'Können Sie den Preis bitte wiederholen?', note: null },
    { id: 'das-stimmt', word: 'Das stimmt.', article: null, plural: null, partOfSpeech: 'expression', translation: 'C’est exact.', example: 'Zusammen hundertfünfzig Euro? – Ja, das stimmt.', note: null },
    { id: 'anzeige', word: 'Anzeige', article: 'die', plural: 'Anzeigen', partOfSpeech: 'noun', translation: 'l’annonce', example: 'Die Anzeige ist von Samstag.', note: null },
    { id: 'angebot', word: 'Angebot', article: 'das', plural: 'Angebote', partOfSpeech: 'noun', translation: 'l’offre, la promotion', example: 'Das Angebot ist bis Freitag.', note: null },
    { id: 'abholen', word: 'abholen', article: null, plural: null, partOfSpeech: 'verb', translation: 'aller chercher, retirer', example: 'Kann ich das Fahrrad am Samstag abholen?', note: 'séparable : ab|holen ; die Abholung : le retrait' },
  ],
  activities: {
    'a1-montants-guide': {
      title: 'Découvrir : les centaines et les milliers',
      estimatedMinutes: 15,
      lesson: {
        title: 'Découvrir : les centaines et les milliers',
        description: `LES CENTAINES · 15 MIN

1. Repérer les blocs (4 min). Lisez 100 « einhundert », 200 « zweihundert » et 300 « dreihundert ». Lisez ensuite 120 « einhundertzwanzig », 240 « zweihundertvierzig » et 305 « dreihundertfünf ». Dans chaque nombre, repérez la centaine, puis le reste. Formez à voix haute 130, 250 et 307. Écrit en toutes lettres, chaque nombre tient en un seul mot. On peut aussi dire hundertzwanzig, sans ein.

2. Distinguer 115 et 150 (4 min). Lisez « einhundertfünfzehn » et « einhundertfünfzig ». Le début est identique : « fünfzehn » donne 15, « fünfzig » donne 50. Alternez les deux prix à voix haute, puis lisez 215, 250, 315 et 350. Comparez de la même façon 116 et 160 : « sechzehn » et « sechzig ».

3. Lire les étiquettes (4 min). Un magasin affiche « Tisch: 115 € | Stuhl: 150 € | Fahrrad: 240 € | Sofa: 600 € | Klavier: 1.000 € ». Le point de « 1.000 » sépare les milliers et « eintausend » veut dire mille. Trouvez l’article le moins cher, celui à 600 € et celui à mille euros. Écoutez les modèles et retrouvez chaque étiquette.

4. Redire les prix (3 min). Sans regarder les mots allemands, dites chaque prix avec « kostet … Euro » : « Der Tisch kostet einhundertfünfzehn Euro. » Si vous hésitez, dites d’abord la centaine, puis la fin du nombre, puis le prix d’un trait.`,
      },
    },
    'a1-montants-pratique': {
      title: 'Comprendre : faire confirmer un prix',
      estimatedMinutes: 12,
      lesson: {
        title: 'Comprendre : faire confirmer un prix',
        description: `AU MAGASIN · 12 MIN

DEUX QUESTIONS UTILES
• Was kostet der Schreibtisch? — Combien coûte le bureau ? (un seul article)
• Was kostet das zusammen? — Combien ça fait en tout ? (l’ensemble)

FAIRE RÉPÉTER ET CONFIRMER
• Können Sie den Preis bitte wiederholen? — Pouvez-vous répéter le prix, s’il vous plaît ?
• Hundertfünfzehn oder hundertfünfzig Euro? — 115 ou 150 euros ?
• Das stimmt. — C’est exact.

1. Écouter pour la situation (3 min). Écoutez la scène une fois sans lire : qui achète quoi ?
2. Écouter pour les prix (4 min). Réécoutez et repérez quatre prix : le premier bureau, le second, la lampe et le total. Arrêtez-vous sur le passage où la cliente oppose deux nombres.
3. Faire confirmer (3 min). Répétez à voix haute « Hundertfünfzehn oder hundertfünfzig Euro? », puis « Zweihundertfünfzehn oder zweihundertfünfzig Euro? » et « Dreihundertzehn oder dreihundertdreißig Euro? ». Marquez bien la fin du nombre.
4. Relire la scène (2 min). Ouvrez la transcription et lisez les deux rôles à voix haute, en changeant de voix.`,
      },
    },
    'a1-montants-approfondir': {
      title: 'Comprendre : comparer des prix sur des annonces',
      estimatedMinutes: 12,
      competences: ['lecture', 'expression-orale'],
      lesson: {
        title: 'Comprendre : comparer des prix sur des annonces',
        description: `ANNONCES ET OFFRES · 12 MIN

1. Lire des annonces (3 min). Trois vendeurs affichent « Fahrrad A: 125 €. Abholung am Samstag. », « Fahrrad B: 152 €. Abholung am Sonntag. » et « Fahrrad C: 280 €. Abholung am Samstag oder Sonntag. ». « Abholung » indique quand on peut retirer l’article. Repérez le prix et le jour de chaque vélo, puis lisez les prix à voix haute.

2. Choisir avec une limite (3 min). Vous avez 150 € et vous êtes libre samedi : quel vélo choisissez-vous ? Et si vous êtes libre seulement dimanche avec 160 € ? (Réponses : le vélo A, puis le vélo B.) Distinguez à l’oral « einhundertfünfundzwanzig » (125) et « einhundertzweiundfünfzig » (152) : dans la fin de chaque nombre, l’unité vient d’abord.

3. Le repère des mille (3 min). Un panneau indique « Angebot bis Freitag: 950 €. Ab Samstag: 1.000 €. ». Jusqu’à vendredi, l’article coûte neunhundertfünfzig Euro ; à partir de samedi, eintausend Euro. Dites les deux prix à voix haute, puis 900 € (neunhundert) et 990 € (neunhundertneunzig).

4. Écrire au vendeur (3 min). Lisez ce message : « Guten Tag, ist das Fahrrad noch da? Kostet es einhundertfünfundzwanzig Euro? Kann ich es am Samstag abholen? ». Repérez la question sur le prix et celle sur le jour, puis redites le message à voix haute pour le vélo B, avec son prix et son jour.`,
      },
    },
    'a1-montants-controle': {
      title: 'Vérifier : comprendre et confirmer des prix',
      estimatedMinutes: 10,
      // Liste reprise du kit à l’identique (identifiants, choix), sauf q1 : c’est une cliente (voix et image) qui achète.
      questions: [
        { id: 'q1', type: 'choice', prompt: "Écoute : quel article la cliente demande-t-elle d’abord ?", options: [ { id: 'a', label: "Un petit bureau", correct: true }, { id: 'b', label: "Un vélo", correct: false }, { id: 'c', label: "Une lampe", correct: false } ] },
        { id: 'q2', type: 'choice', prompt: "Écoute : combien coûte le premier bureau ?", options: [ { id: 'a', label: "135 €", correct: false }, { id: 'b', label: "150 €", correct: true }, { id: 'c', label: "115 €", correct: false } ] },
        { id: 'q3', type: 'choice', prompt: "Écoute : quel est le prix confirmé du deuxième bureau ?", options: [ { id: 'a', label: "150 €", correct: false }, { id: 'b', label: "155 €", correct: false }, { id: 'c', label: "115 €", correct: true } ] },
        { id: 'q4', type: 'choice', prompt: "Écoute : combien coûte la lampe ?", options: [ { id: 'a', label: "35 €", correct: true }, { id: 'b', label: "53 €", correct: false }, { id: 'c', label: "30 €", correct: false } ] },
        { id: 'q5', type: 'choice', prompt: "Écoute : quel total le vendeur annonce-t-il pour les articles choisis ?", options: [ { id: 'a', label: "185 €", correct: false }, { id: 'b', label: "150 €", correct: true }, { id: 'c', label: "115 €", correct: false } ] },
        { id: 'q6', type: 'choice', prompt: "Quel montant correspond à « dreihundertfünfzehn Euro » ?", options: [ { id: 'a', label: "350 €", correct: false }, { id: 'b', label: "305 €", correct: false }, { id: 'c', label: "315 €", correct: true } ] },
        { id: 'q7', type: 'choice', prompt: "Quel montant lisez-vous avec « eintausend Euro » ?", options: [ { id: 'a', label: "1.000 €", correct: true }, { id: 'b', label: "100 €", correct: false }, { id: 'c', label: "110 €", correct: false } ] },
        { id: 'q8', type: 'choice', prompt: "Quelle question permet de vérifier le prix de tous les articles achetés ?", options: [ { id: 'a', label: "Wie viele Fahrräder sind das?", correct: false }, { id: 'b', label: "Was kostet das zusammen?", correct: true }, { id: 'c', label: "Wann kann ich es abholen?", correct: false } ] },
      ],
      lesson: {
        title: 'Vérifier : comprendre et confirmer des prix',
        description: 'Écoutez la scène au magasin une première fois pour la situation, puis lisez les questions et réécoutez pour les prix. Les trois dernières questions portent sur la lecture des montants et sur la question du total. La transcription s’affiche après votre réponse.',
      },
      explanations: {
        q1: 'La cliente commence par « Was kostet der kleine Schreibtisch? » : der Schreibtisch est le bureau. La lampe n’arrive qu’à la fin, et il n’est jamais question de vélo.',
        q2: 'Le vendeur répond « Er kostet einhundertfünfzig Euro » : fünfzig = 50, donc 150 €. Le prix de 115 € (fünfzehn) est celui du deuxième bureau.',
        q3: 'La cliente demande « Einhundertfünfzehn oder einhundertfünfzig? » et le vendeur confirme « Einhundertfünfzehn Euro » : 115 €, avec -zehn. 150 € est le prix du petit bureau.',
        q4: '« Fünfunddreißig Euro » : l’unité (fünf) vient avant la dizaine (dreißig), donc 35 €. Le piège est d’écrire 53 en suivant l’ordre des mots.',
        q5: '« Zusammen sind das einhundertfünfzig Euro » : 115 € pour le bureau + 35 € pour la lampe = 150 €. Ce n’est pas le prix du petit bureau, mais le total.',
        q6: 'Dreihundert = 300 et fünfzehn = 15 : 315 €. 350 € se dirait dreihundertfünfzig et 305 € dreihundertfünf.',
        q7: 'Eintausend signifie mille : 1.000 €, où le point sépare les milliers. Cent se dit (ein)hundert.',
        q8: 'Zusammen veut dire « ensemble, en tout » : Was kostet das zusammen? demande le total. Les deux autres questions portent sur le nombre de vélos et sur le jour du retrait.',
      },
    },
    'a1-montants-mission': {
      kind: 'mission',
      title: 'Mission : vérifier un prix et confirmer un achat',
      estimatedMinutes: 20,
      competences: ['expression-orale', 'expression-ecrite'],
      lesson: {
        title: 'Mission : vérifier un prix et confirmer un achat',
        description: `Vous meublez votre chambre. Dans un magasin, vous choisissez deux meubles entre 100 € et 400 €, dont les prix se confondent facilement à l’oreille (115 et 150, 216 et 260…), et un petit article à moins de 100 €.

MODÈLE
– Was kostet der Schreibtisch?
– Zweihundertsechzehn Euro.
– Zweihundertsechzehn oder zweihundertsechzig Euro?
– Zweihundertsechzehn.
– Gut, ich nehme den Schreibtisch. Und was kostet die Lampe?
– Fünfunddreißig Euro.
– Was kostet das zusammen?
– Zusammen sind das zweihunderteinundfünfzig Euro.

MESSAGE DE CONFIRMATION
Ich nehme den Tisch für 115 Euro und die Lampe für 35 Euro. Zusammen sind das 150 Euro.`,
      },
      mission: {
        oral: {
          prompt: 'Enregistrez la scène au magasin en jouant les deux rôles (changez de voix) : le client demande deux prix, fait répéter celui qui se confond facilement, choisit un article et demande le total avec le petit article.',
          maxSeconds: 90,
        },
        written: {
          prompt: 'Écrivez le message de confirmation d’achat : les articles choisis, le prix de chacun et le total, en chiffres. Ajoutez une phrase avec un prix écrit en toutes lettres.',
          maxChars: 600,
          minWords: 20,
        },
        checklist: [
          'J’ai annoncé au moins deux prix entre 100 et 400 euros, la centaine puis la fin du nombre, en un seul mot.',
          'J’ai fait répéter un prix facile à confondre avec « … oder … Euro? » ou « Können Sie den Preis bitte wiederholen? ».',
          'J’ai demandé le total avec « Was kostet das zusammen? ».',
          'Dans mon message, le total est bien la somme des prix écrits.',
          'Mon prix en toutes lettres correspond au prix en chiffres.',
        ],
      },
    },
  },
  add: [
    {
      after: 'a1-montants-approfondir',
      activity: {
        id: 'a1-montants-entrainer',
        kind: 'exercise',
        title: 'S’entraîner : lire, écrire et confirmer des montants',
        estimatedMinutes: 10,
        competences: ['ecoute', 'expression-ecrite'],
        lesson: {
          title: 'S’entraîner : lire, écrire et confirmer des montants',
          description: 'Réécoutez la scène au magasin pour noter les prix, puis travaillez l’écriture des montants et l’ordre des mots. Les deux dernières questions sont des dictées : écrivez les nombres en chiffres ou en lettres. La transcription de la scène s’affiche après votre réponse.',
          transcript: null,
        },
        placements: [dialogue],
        questions: [
          {
            id: 'q1', type: 'fill', prompt: 'Écoutez la scène au magasin et notez les quatre prix en chiffres.',
            text: 'Premier bureau : [[1]] € · Deuxième bureau : [[2]] € · Lampe : [[3]] € · Total : [[4]] €',
            blanks: [
              { id: '1', accept: ['150', 'einhundertfünfzig', 'hundertfünfzig'], size: 5, hint: null },
              { id: '2', accept: ['115', 'einhundertfünfzehn', 'hundertfünfzehn'], size: 5, hint: null },
              { id: '3', accept: ['35', 'fünfunddreißig'], size: 5, hint: null },
              { id: '4', accept: ['150', 'einhundertfünfzig', 'hundertfünfzig'], size: 5, hint: null },
            ],
            explanation: 'Le petit bureau coûte « einhundertfünfzig » (150 €), l’autre « einhundertfünfzehn » (115 €), la lampe « fünfunddreißig » (35 €). Le total, 115 + 35, fait de nouveau 150 €.',
          },
          {
            id: 'q2', type: 'match', prompt: 'Associez chaque montant en lettres à sa valeur en chiffres.',
            pairs: [
              { left: 'einhundertfünfzehn', right: '115' },
              { left: 'einhundertfünfzig', right: '150' },
              { left: 'zweihundertfünfzig', right: '250' },
              { left: 'dreihundertfünf', right: '305' },
              { left: 'einhundertsechzehn', right: '116' },
              { left: 'eintausend', right: '1.000' },
            ],
            explanation: 'La centaine vient d’abord, puis le reste : -zehn pour 13 à 19 (fünfzehn, sechzehn), -zig pour les dizaines (fünfzig). Dreihundertfünf n’a pas de dizaine : 305.',
          },
          {
            id: 'q3', type: 'fill', prompt: 'Écrivez le prix en toutes lettres, en un seul mot.',
            text: '152 € = [[1]] Euro',
            blanks: [{ id: '1', accept: ['einhundertzweiundfünfzig', 'hundertzweiundfünfzig'], size: 26, hint: null }],
            explanation: 'Centaine d’abord (einhundert), puis la fin du nombre comme d’habitude : unité, und, dizaine (zweiundfünfzig). Tout s’écrit en un mot : einhundertzweiundfünfzig.',
          },
          {
            id: 'q4', type: 'order', prompt: 'Remettez les mots dans l’ordre pour confirmer votre achat.',
            answers: [['Ich', 'nehme', 'den Tisch', 'für', 'einhundertfünfzehn', 'Euro.']],
            explanation: 'Le verbe nehme est en 2e position, après le sujet ich ; le prix s’introduit avec für : den Tisch für einhundertfünfzehn Euro. Euro reste au singulier après un nombre.',
          },
          {
            id: 'q5', type: 'order', prompt: 'Remettez les mots dans l’ordre. Commencez par « Zusammen ».',
            answers: [['Zusammen', 'sind', 'das', 'einhundertfünfzig', 'Euro.']],
            explanation: 'Quand zusammen ouvre la phrase, le verbe sind reste en 2e position et le sujet das passe juste après : Zusammen sind das … Euro. « Zusammen das sind » est fautif.',
          },
          {
            id: 'q6', type: 'dictation', prompt: 'Dictée : écoutez la phrase et écrivez-la.',
            accept: ['Der Stuhl kostet zweihundertfünfzehn Euro.', 'Der Stuhl kostet 215 Euro.'],
            voice: 'frau',
            explanation: 'Zweihundert + fünfzehn = 215 : fünfzehn se termine par -zehn. Avec 250, on entendrait zweihundertfünfzig. Der Stuhl, la chaise, prend une majuscule.',
          },
          {
            id: 'q7', type: 'dictation', prompt: 'Dictée : écoutez la phrase et écrivez-la.',
            accept: ['Ab Samstag kostet das Fahrrad eintausend Euro.', 'Ab Samstag kostet das Fahrrad tausend Euro.', 'Ab Samstag kostet das Fahrrad 1.000 Euro.'],
            voice: 'mann',
            explanation: 'Ab Samstag ouvre la phrase : le verbe kostet vient tout de suite après, puis le sujet das Fahrrad. Eintausend = 1.000, avec le point des milliers.',
          },
        ],
      },
    },
    {
      after: 'a1-montants-entrainer',
      activity: {
        id: 'a1-montants-repeter',
        kind: 'exercise',
        title: 'Répéter à voix haute : demander et confirmer un prix',
        estimatedMinutes: 8,
        competences: ['expression-orale'],
        lesson: {
          title: 'Répéter à voix haute : demander et confirmer un prix',
          description: 'Écoutez chaque modèle autant de fois que nécessaire, puis dites la phrase sans vous presser. Dans les grands nombres, marquez une petite pause après la centaine si besoin, puis dites la fin d’un trait.',
          transcript: null,
        },
        placements: [],
        questions: [
          speak('q1', 'Was kostet der Schreibtisch?', 'Schreibtisch commence par sch (« ch » français) et ei se dit « aï ». La voix descend à la fin de la question en W.'),
          speak('q2', 'Hundertfünfzehn oder hundertfünfzig Euro?', 'Insistez sur la fin du nombre : -zehn, puis -zig. Le g final de fünfzig se prononce comme le ch de ich.', ['Hundertfünfzehn oder hundertfünfzig Euro?', 'Einhundertfünfzehn oder einhundertfünfzig Euro?', '115 oder 150 Euro?', '115 oder 150 €?']),
          speak('q3', 'Können Sie den Preis bitte wiederholen?', 'Le ö de können se prononce lèvres arrondies, comme « eu ». Dans Preis, ei se dit « aï » et le s final est sourd.'),
          speak('q4', 'Ich nehme den Tisch für einhundertfünfzehn Euro.', 'Nehme a un e long. Dans für, le ü se dit lèvres arrondies ; einhundertfünfzehn se dit d’un seul souffle.', ['Ich nehme den Tisch für einhundertfünfzehn Euro.', 'Ich nehme den Tisch für hundertfünfzehn Euro.', 'Ich nehme den Tisch für 115 Euro.', 'Ich nehme den Tisch für 115 €.']),
          speak('q5', 'Was kostet das zusammen?', 'Zusammen commence par le son [ts] et l’accent tombe sur -sam-. Le s devant une voyelle se prononce comme un z français.'),
          speak('q6', 'Zusammen sind das einhundertfünfzig Euro.', 'Le verbe sind vient juste après zusammen. Euro se prononce « oïro ».', ['Zusammen sind das einhundertfünfzig Euro.', 'Zusammen sind das hundertfünfzig Euro.', 'Zusammen sind das 150 Euro.', 'Zusammen sind das 150 €.']),
        ],
      },
    },
  ],
  order: [
    'a1-montants-guide', 'a1-montants-pratique', 'a1-montants-approfondir', 'a1-montants-entrainer', 'a1-montants-repeter',
    'a1-montants-controle', 'a1-montants-mission',
  ],
};
