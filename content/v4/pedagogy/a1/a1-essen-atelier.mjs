// Couche pédagogique V4 · A1 · Atelier : commander au café et vérifier le prix.
const REPEAT = 'Écoutez le modèle, puis dites la phrase à voix haute.';
const speak = (id, text, explanation, accept = [text]) => ({ id, type: 'speak', prompt: REPEAT, text, accept, explanation });
const dialogue = { media: 'a1-essen-atelier-dialogue', usage: 'audio', transcriptVisibility: 'after_answer', decorative: false };

export default {
  module: 'a1-essen-atelier',
  vocabulary: [
    { id: 'karte', word: 'Karte', article: 'die', plural: 'Karten', partOfSpeech: 'noun', translation: 'la carte (du café ; bancaire)', example: 'Mit Karte, bitte.', note: 'die Speisekarte : la carte du restaurant' },
    { id: 'saft', word: 'Saft', article: 'der', plural: 'Säfte', partOfSpeech: 'noun', translation: 'le jus', example: 'Ich möchte einen Apfelsaft.', note: 'der Apfelsaft, der Orangensaft' },
    { id: 'suppe', word: 'Suppe', article: 'die', plural: 'Suppen', partOfSpeech: 'noun', translation: 'la soupe', example: 'Ich nehme eine Suppe.', note: null },
    { id: 'butter', word: 'Butter', article: 'die', plural: null, partOfSpeech: 'noun', translation: 'le beurre', example: 'Ein Brötchen mit Butter, bitte.', note: null },
    { id: 'kaesebrot', word: 'Käsebrot', article: 'das', plural: 'Käsebrote', partOfSpeech: 'noun', translation: 'la tartine au fromage', example: 'Ein Käsebrot, bitte.', note: 'das Brot : le pain' },
    { id: 'stueck', word: 'Stück', article: 'das', plural: 'Stücke', partOfSpeech: 'noun', translation: 'le morceau, la part', example: 'Ein Stück Kuchen, bitte.', note: 'sans « de » : ein Stück Kuchen' },
    { id: 'bestellen', word: 'bestellen', article: null, plural: null, partOfSpeech: 'verb', translation: 'commander', example: 'Möchten Sie bestellen?', note: null },
    { id: 'nehmen', word: 'nehmen', article: null, plural: null, partOfSpeech: 'verb', translation: 'prendre', example: 'Was nehmen Sie?', note: 'ich nehme, du nimmst, er nimmt' },
    { id: 'zahlen', word: 'zahlen', article: null, plural: null, partOfSpeech: 'verb', translation: 'payer', example: 'Kann ich mit Karte zahlen?', note: 'Zahlen, bitte ! : l’addition, s’il vous plaît !' },
    { id: 'zusammen', word: 'zusammen', article: null, plural: null, partOfSpeech: 'adverb', translation: 'ensemble ; en tout', example: 'Was kostet das zusammen?', note: 'Zusammen oder getrennt ? : ensemble ou séparément ?' },
    { id: 'mit', word: 'mit', article: null, plural: null, partOfSpeech: 'preposition', translation: 'avec', example: 'Ein Brötchen mit Butter, bitte.', note: '+ datif' },
    { id: 'ohne', word: 'ohne', article: null, plural: null, partOfSpeech: 'preposition', translation: 'sans', example: 'Das andere ohne Butter.', note: '+ accusatif' },
    { id: 'bar', word: 'bar', article: null, plural: null, partOfSpeech: 'adverb', translation: 'en espèces', example: 'Ich zahle bar.', note: 'contraire : mit Karte' },
    { id: 'was-kostet', word: 'Was kostet …?', article: null, plural: null, partOfSpeech: 'expression', translation: 'Combien coûte … ?', example: 'Was kostet der Tee?', note: 'au pluriel : Was kosten die Brötchen?' },
  ],
  activities: {
    'a1-essen-atelier-guide': {
      title: 'Découvrir : commander et vérifier le prix',
      estimatedMinutes: 15,
      lesson: {
        title: 'Découvrir : commander et vérifier le prix',
        description: `LA CARTE DU CAFÉ · 15 MIN

1. Lire la carte (5 min). La carte du café indique « Tee 2,20 € · Apfelsaft 2,80 € · Suppe 4,50 € · Käsebrot 3,20 € ». Choisissez une boisson et un plat, calculez le total, puis dites le prix à voix haute. On dit d’abord les euros, puis les centimes : 2,20 € se dit « zwei Euro zwanzig ».

2. Commander (5 min). Dans « Ich möchte einen Tee, eine Suppe und ein Käsebrot », observez les trois formes de l’article après ich möchte : le masculin prend einen (der Tee), le féminin eine (die Suppe) et le neutre ein (das Käsebrot). Redites la commande en remplaçant le thé par « einen Apfelsaft », une fois lentement, puis à vitesse normale.

3. Rectifier et payer (5 min). Lisez les deux voix : « Eine Suppe und einen Tee? » / « Keinen Tee, bitte. Einen Apfelsaft. Was kostet das zusammen? » / « Sieben Euro dreißig. » / « Mit Karte, bitte. ». Pour refuser, kein prend la même terminaison que ein : keinen Tee, keine Suppe, kein Käsebrot. Vérifiez le total sur le ticket : 4,50 € + 2,80 € = 7,30 €. Relisez ensuite l’échange en changeant le plat.`,
      },
    },
    'a1-essen-atelier-pratique': {
      title: 'Comprendre : une commande au comptoir',
      estimatedMinutes: 12,
      lesson: {
        title: 'Comprendre : une commande au comptoir',
        description: `COMMANDER ET PAYER · 12 MIN

PHRASES UTILES
• Was möchten Sie? — Que désirez-vous ?
• Einen Tee und zwei Brötchen, bitte. — Un thé et deux petits pains, s’il vous plaît.
• mit Butter / ohne Butter — avec / sans beurre
• Nein, keinen Kaffee, danke. — Non, pas de café, merci.
• Was kostet das zusammen? — Combien ça coûte en tout ?
• Bar oder mit Karte? — En espèces ou par carte ?

À VOUS
1. Écoutez la scène sans lire la transcription : qu’est-ce que le client commande, et qu’est-ce qu’il refuse ?
2. Réécoutez et repérez les détails : le nombre de petits pains, combien avec du beurre, le total et le moyen de paiement.
3. Affichez la transcription et lisez le rôle du client à voix haute.
4. Redites la commande en changeant un élément : einen Apfelsaft au lieu du thé, puis keine Suppe au lieu de keinen Kaffee.`,
      },
    },
    'a1-essen-atelier-controle': {
      title: 'Vérifier : une commande au café',
      estimatedMinutes: 10,
      lesson: {
        title: 'Vérifier : une commande au café',
        description: 'Écoutez la scène une première fois pour la situation générale. Lisez les questions, puis réécoutez pour les détails : la commande, le beurre et le prix. Les deux dernières questions vérifient les phrases à réemployer. La transcription s’affiche après votre réponse.',
      },
      explanations: {
        q1: 'Le client commande « Einen Tee und zwei Brötchen », puis refuse le café : « Nein, keinen Kaffee, danke ». Aucun jus n’est commandé.',
        q2: '« Zwei Brötchen, bitte » : deux petits pains. Le client parle ensuite d’« ein Brötchen » et de « das andere » (l’autre), ce qui fait bien deux.',
        q3: '« Ein Brötchen mit Butter, bitte. Das andere ohne Butter » : un seul petit pain avec du beurre ; ohne veut dire « sans ».',
        q4: 'La serveuse annonce « Sechs Euro fünfzig » : 6,50 €. Fünfzig (50) se distingue de fünfzehn (15).',
        q5: 'Der Saft est masculin : après möchte, ein devient einen (Ich möchte einen Saft). Eine va avec un nom féminin, ein avec un nom neutre.',
        q6: 'Zusammen veut dire « ensemble, en tout » : « Was kostet das zusammen? » demande le total. Les deux autres questions demandent un numéro de téléphone et l’heure.',
      },
    },
    'a1-essen-atelier-mission': {
      kind: 'mission',
      title: 'Mission : commander pour deux et rectifier',
      estimatedMinutes: 20,
      competences: ['expression-orale', 'expression-ecrite'],
      lesson: {
        title: 'Mission : commander pour deux et rectifier',
        description: `Vous êtes au café avec un ami. Vous commandez pour vous deux. Le serveur se trompe dans une boisson : vous rectifiez, puis vous demandez le total et vous payez.

LA CARTE
Tee 2,20 € · Kaffee 2,40 € · Apfelsaft 2,80 € · Suppe 4,50 € · Käsebrot 3,20 € · Brötchen 1,20 €

MODÈLE
– Guten Tag! Was möchten Sie?
– Einen Apfelsaft, einen Tee und zwei Käsebrote, bitte.
– Zwei Käsebrote, einen Apfelsaft und einen Kaffee?
– Nein, keinen Kaffee. Einen Tee, bitte. Was kostet das zusammen?
– Elf Euro vierzig.
– Mit Karte, bitte.`,
      },
      mission: {
        oral: {
          prompt: 'Enregistrez votre rôle de client : commandez pour deux personnes (une boisson et un plat chacune), rectifiez la boisson que le serveur a mal comprise avec « Nein, keinen … », demandez le total, puis dites comment vous payez.',
          maxSeconds: 90,
        },
        written: {
          prompt: 'Écrivez la commande définitive comme un ticket : chaque article avec sa quantité et son prix d’après la carte, puis la question « Was kostet das zusammen? » et le total écrit en toutes lettres.',
          maxChars: 500,
          minWords: 15,
        },
        checklist: [
          'J’ai employé einen, eine ou ein selon le genre du nom (einen Tee, eine Suppe, ein Käsebrot).',
          'J’ai rectifié une boisson avec keinen, keine ou kein.',
          'Mon total correspond aux prix de la carte et je l’ai dit avec les euros, puis les centimes.',
          'J’ai demandé « Was kostet das zusammen? » et dit comment je paie (bar ou mit Karte).',
        ],
      },
    },
  },
  add: [
    {
      after: 'a1-essen-atelier-pratique',
      activity: {
        id: 'a1-essen-atelier-entrainer',
        kind: 'exercise',
        title: 'S’entraîner : einen, eine, ein et les prix',
        estimatedMinutes: 10,
        competences: ['ecoute', 'expression-ecrite'],
        lesson: {
          title: 'S’entraîner : einen, eine, ein et les prix',
          description: 'Réécoutez la commande au comptoir et complétez les répliques. Entraînez-vous ensuite à choisir einen, eine ou ein, à rectifier avec kein et à lire des prix. Les deux dernières questions sont des dictées : écrivez les nombres en toutes lettres. La transcription de la scène s’affiche après votre réponse.',
          transcript: null,
        },
        placements: [dialogue],
        questions: [
          {
            id: 'q1', type: 'fill', prompt: 'Écoutez la scène et complétez la commande du client.',
            text: '[[1]] Tee und [[2]] Brötchen, bitte. [[3]] Brötchen mit Butter, das andere ohne Butter.',
            blanks: [{ id: '1', accept: ['Einen'], size: 6, hint: null }, { id: '2', accept: ['zwei', '2'], size: 5, hint: null }, { id: '3', accept: ['Ein'], size: 5, hint: null }],
            explanation: 'Der Tee est masculin : einen Tee. Le client prend zwei Brötchen, dont un seul avec du beurre : das Brötchen est neutre, d’où ein Brötchen.',
          },
          {
            id: 'q2', type: 'fill', prompt: 'Complétez la fin de la scène.',
            text: 'Nein, [[1]] Kaffee, danke. Was kostet das [[2]]? – Sechs Euro [[3]].',
            blanks: [{ id: '1', accept: ['keinen'], size: 7, hint: null }, { id: '2', accept: ['zusammen'], size: 9, hint: null }, { id: '3', accept: ['fünfzig', '50'], size: 8, hint: null }],
            explanation: 'Der Kaffee est masculin : la négation est keinen Kaffee. Zusammen demande le total, et la serveuse répond « Sechs Euro fünfzig » (6,50 €).',
          },
          {
            id: 'q3', type: 'fill', prompt: 'Complétez la commande avec einen, eine ou ein.',
            text: 'Ich möchte [[1]] Apfelsaft, [[2]] Suppe und [[3]] Käsebrot.',
            blanks: [{ id: '1', accept: ['einen'], size: 6, hint: 'der' }, { id: '2', accept: ['eine'], size: 6, hint: 'die' }, { id: '3', accept: ['ein'], size: 6, hint: 'das' }],
            explanation: 'Après ich möchte, le nom est à l’accusatif : der Apfelsaft → einen, die Suppe → eine, das Käsebrot → ein. Seul le masculin change.',
          },
          {
            id: 'q4', type: 'fill', prompt: 'Le serveur s’est trompé. Rectifiez avec keine ou kein.',
            text: '[[1]] Suppe, bitte, und [[2]] Käsebrot. Nur einen Tee.',
            blanks: [{ id: '1', accept: ['Keine'], size: 6, hint: 'die Suppe' }, { id: '2', accept: ['kein'], size: 6, hint: 'das Käsebrot' }],
            explanation: 'Kein prend les terminaisons de ein : die Suppe → keine Suppe, das Käsebrot → kein Käsebrot. Nicht ne s’emploie pas devant un nom avec ein.',
          },
          {
            id: 'q5', type: 'order', prompt: 'Remettez les mots dans l’ordre pour demander le total.',
            answers: [['Was', 'kostet', 'das', 'zusammen?']],
            explanation: 'Après le mot interrogatif was, le verbe kostet vient en 2e position, puis le sujet das. Zusammen se place à la fin.',
          },
          {
            id: 'q6', type: 'match', prompt: 'Associez chaque prix de la carte à sa lecture.',
            pairs: [
              { left: '2,20 €', right: 'zwei Euro zwanzig' },
              { left: '2,80 €', right: 'zwei Euro achtzig' },
              { left: '3,20 €', right: 'drei Euro zwanzig' },
              { left: '4,50 €', right: 'vier Euro fünfzig' },
              { left: '7,30 €', right: 'sieben Euro dreißig' },
            ],
            explanation: 'On lit les euros, puis les centimes, sans répéter « Cent » : 4,50 € = vier Euro fünfzig. Dreißig (30) s’écrit avec ß.',
          },
          {
            id: 'q7', type: 'dictation', prompt: 'Écoutez et écrivez la phrase. Écrivez les nombres en toutes lettres.', voice: 'mann',
            accept: ['Ich möchte einen Tee und zwei Brötchen.'],
            explanation: 'Der Tee est masculin : einen Tee après möchte. Brötchen garde le ö et ne change pas au pluriel : ein Brötchen, zwei Brötchen.',
          },
          {
            id: 'q8', type: 'dictation', prompt: 'Écoutez et écrivez la phrase. Écrivez les nombres en toutes lettres.', voice: 'frau',
            accept: ['Die Suppe kostet vier Euro fünfzig.'],
            explanation: 'On dit les euros, puis les centimes : vier Euro fünfzig (4,50 €). Suppe est un nom : majuscule. Kostet va avec un seul objet.',
          },
        ],
      },
    },
    {
      after: 'a1-essen-atelier-entrainer',
      activity: {
        id: 'a1-essen-atelier-repeter',
        kind: 'exercise',
        title: 'Répéter à voix haute : commander au café',
        estimatedMinutes: 8,
        competences: ['expression-orale'],
        lesson: {
          title: 'Répéter à voix haute : commander au café',
          description: 'Écoutez chaque modèle autant de fois que nécessaire, puis dites la phrase sans vous presser. Marquez bien la fin de einen et de keinen : c’est elle qui montre le masculin.',
          transcript: null,
        },
        placements: [],
        questions: [
          speak('q1', 'Ich möchte einen Tee, bitte.', 'Einen se prononce en deux syllabes, EI-nen : le -en final signale le masculin der Tee. Ich et möchte gardent un souffle doux.'),
          speak('q2', 'Eine Suppe und ein Käsebrot, bitte.', 'Eine pour le féminin, ein pour le neutre. Dans Käsebrot, ä se dit « è » et l’accent tombe sur la 1re syllabe.', ['Eine Suppe und ein Käsebrot, bitte.', '1 Suppe und 1 Käsebrot, bitte.']),
          speak('q3', 'Nein, keinen Kaffee, danke.', 'Keinen, comme einen, garde la terminaison -en du masculin : c’est der Kaffee qu’on refuse. Nein et keinen ont le même « aï ».'),
          speak('q4', 'Was kostet das zusammen?', 'Le w de was se prononce comme un v. Zusammen commence par « ts » et porte l’accent sur -sam-.'),
          speak('q5', 'Das macht sieben Euro dreißig.', 'Euro se dit « oïro ». Dreißig : ei se dit « aï » et ß se prononce comme un s dur.', ['Das macht sieben Euro dreißig.', 'Das macht 7,30 Euro.', 'Das macht 7 Euro 30.']),
          speak('q6', 'Mit Karte, bitte.', 'Le r de Karte s’entend à peine après le a. C’est la réponse à « Bar oder mit Karte? ».'),
        ],
      },
    },
  ],
  order: ['a1-essen-atelier-guide', 'a1-essen-atelier-pratique', 'a1-essen-atelier-entrainer', 'a1-essen-atelier-repeter', 'a1-essen-atelier-controle', 'a1-essen-atelier-mission'],
};
