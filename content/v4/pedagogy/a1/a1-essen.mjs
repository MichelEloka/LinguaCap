// Couche pédagogique V4 · A1 · Guten Appetit ! Manger, boire et faire les courses.
const REPEAT = 'Écoutez le modèle, puis dites la phrase à voix haute.';
const speak = (id, text, explanation, accept = [text]) => ({ id, type: 'speak', prompt: REPEAT, text, accept, explanation });
const DICTATION = 'Écoutez et écrivez la phrase. Écrivez les nombres en toutes lettres.';

export default {
  module: 'a1-essen',
  // Script aligné sur le dialogue affiché (« Getrennt, bitte. »).
  media: [
    {
      key: "a1-essen-dialog-audio-v3", kind: "audio", title: "Dialogue : au café", credit: "LinguaCap, synthèse Piper avec Thorsten Müller (CC0) et Kerstin, préentraînée sur la voix de Cori Samuel (Hi-Fi TTS, CC BY 4.0)", license: "Jeux de données des voix : CC0 et CC BY 4.0",
      script: [
        { voice: "sprecher", name: "Kellner", text: "Guten Tag! Was möchten Sie trinken?" },
        { pause: 0.6 },
        { voice: "frau", name: "Paula", text: "Ich möchte einen Cappuccino, bitte." },
        { pause: 0.6 },
        { voice: "mann", name: "Emre", text: "Und ich nehme eine Apfelschorle." },
        { pause: 0.6 },
        { voice: "sprecher", name: "Kellner", text: "Gern. Möchten Sie auch etwas essen? Wir haben heute Apfelkuchen und Käsekuchen." },
        { pause: 0.6 },
        { voice: "frau", name: "Paula", text: "Oh, ich esse sehr gern Käsekuchen! Ein Stück Käsekuchen, bitte." },
        { pause: 0.6 },
        { voice: "mann", name: "Emre", text: "Für mich keinen Kuchen, danke. Haben Sie auch eine Suppe?" },
        { pause: 0.6 },
        { voice: "sprecher", name: "Kellner", text: "Ja, eine Tomatensuppe mit Brot." },
        { pause: 0.6 },
        { voice: "mann", name: "Emre", text: "Prima, dann nehme ich eine Tomatensuppe." },
        { pause: 2.5 },
        { voice: "frau", name: "Paula", text: "Entschuldigung, wir möchten bitte zahlen!" },
        { pause: 0.6 },
        { voice: "sprecher", name: "Kellner", text: "Zusammen oder getrennt?" },
        { pause: 0.6 },
        { voice: "frau", name: "Paula", text: "Getrennt, bitte." },
        { pause: 0.6 },
        { voice: "sprecher", name: "Kellner", text: "Der Cappuccino und der Käsekuchen: Das macht acht Euro vierzig." },
        { pause: 0.6 },
        { voice: "frau", name: "Paula", text: "Hier sind neun Euro. Stimmt so!" },
        { pause: 0.6 },
        { voice: "sprecher", name: "Kellner", text: "Vielen Dank! Und für Sie die Apfelschorle und die Suppe: neun Euro fünfzig." },
        { pause: 0.6 },
        { voice: "mann", name: "Emre", text: "Kann ich mit Karte zahlen?" },
        { pause: 0.6 },
        { voice: "sprecher", name: "Kellner", text: "Ja, natürlich." },
      ],
    },
  ],
  vocabulary: [
    { id: 'kaffee', word: 'Kaffee', article: 'der', plural: null, partOfSpeech: 'noun', translation: 'le café', example: 'Ich möchte einen Kaffee, bitte.', note: null },
    { id: 'tee', word: 'Tee', article: 'der', plural: null, partOfSpeech: 'noun', translation: 'le thé', example: 'Ich trinke sehr gern Tee.', note: null },
    { id: 'wasser', word: 'Wasser', article: 'das', plural: null, partOfSpeech: 'noun', translation: 'l’eau', example: 'Ein Wasser, bitte.', note: 'das Mineralwasser : l’eau minérale' },
    { id: 'milch', word: 'Milch', article: 'die', plural: null, partOfSpeech: 'noun', translation: 'le lait', example: 'Wir haben keine Milch mehr.', note: null },
    { id: 'brot', word: 'Brot', article: 'das', plural: 'Brote', partOfSpeech: 'noun', translation: 'le pain', example: 'Das Brot ist dunkel und sehr lecker.', note: null },
    { id: 'broetchen', word: 'Brötchen', article: 'das', plural: 'Brötchen', partOfSpeech: 'noun', translation: 'le petit pain', example: 'Sechs Brötchen, bitte.', note: 'en Bavière et en Autriche : die Semmel' },
    { id: 'kaese', word: 'Käse', article: 'der', plural: null, partOfSpeech: 'noun', translation: 'le fromage', example: 'Was kostet der Käse?', note: null },
    { id: 'ei', word: 'Ei', article: 'das', plural: 'Eier', partOfSpeech: 'noun', translation: 'l’œuf', example: 'Zum Frühstück esse ich zwei Eier.', note: null },
    { id: 'apfel', word: 'Apfel', article: 'der', plural: 'Äpfel', partOfSpeech: 'noun', translation: 'la pomme', example: 'Ich esse jeden Tag einen Apfel.', note: null },
    { id: 'kartoffel', word: 'Kartoffel', article: 'die', plural: 'Kartoffeln', partOfSpeech: 'noun', translation: 'la pomme de terre', example: 'Ich möchte ein Kilo Kartoffeln.', note: null },
    { id: 'tomate', word: 'Tomate', article: 'die', plural: 'Tomaten', partOfSpeech: 'noun', translation: 'la tomate', example: 'Was kosten die Tomaten?', note: null },
    { id: 'obst', word: 'Obst', article: 'das', plural: null, partOfSpeech: 'noun', translation: 'les fruits', example: 'Am Samstag kaufe ich Obst auf dem Markt.', note: 'sans pluriel : das Obst = les fruits en général' },
    { id: 'gemuese', word: 'Gemüse', article: 'das', plural: null, partOfSpeech: 'noun', translation: 'les légumes', example: 'Isst du gern Gemüse?', note: 'sans pluriel : das Gemüse = les légumes en général' },
    { id: 'fleisch', word: 'Fleisch', article: 'das', plural: null, partOfSpeech: 'noun', translation: 'la viande', example: 'Ich esse kein Fleisch.', note: null },
    { id: 'fisch', word: 'Fisch', article: 'der', plural: 'Fische', partOfSpeech: 'noun', translation: 'le poisson', example: 'Ich esse sehr gern Fisch.', note: null },
    { id: 'nudel', word: 'Nudel', article: 'die', plural: 'Nudeln', partOfSpeech: 'noun', translation: 'la pâte (les pâtes)', example: 'Ich esse gern Nudeln mit Tomatensoße.', note: 'surtout au pluriel : die Nudeln' },
    { id: 'kuchen', word: 'Kuchen', article: 'der', plural: 'Kuchen', partOfSpeech: 'noun', translation: 'le gâteau', example: 'Ein Stück Kuchen, bitte.', note: null },
    { id: 'kilo', word: 'Kilo', article: 'das', plural: 'Kilos', partOfSpeech: 'noun', translation: 'le kilo', example: 'Ein Kilo Äpfel, bitte.', note: 'sans « de » : ein Kilo Äpfel' },
    { id: 'flasche', word: 'Flasche', article: 'die', plural: 'Flaschen', partOfSpeech: 'noun', translation: 'la bouteille', example: 'Eine Flasche Wasser, bitte.', note: null },
    { id: 'rechnung', word: 'Rechnung', article: 'die', plural: 'Rechnungen', partOfSpeech: 'noun', translation: 'l’addition, la facture', example: 'Die Rechnung, bitte!', note: null },
    { id: 'essen', word: 'essen', article: null, plural: null, partOfSpeech: 'verb', translation: 'manger', example: 'Was essen Sie gern?', note: 'du isst, er isst' },
    { id: 'trinken', word: 'trinken', article: null, plural: null, partOfSpeech: 'verb', translation: 'boire', example: 'Was möchten Sie trinken?', note: null },
    { id: 'moechten', word: 'möchten', article: null, plural: null, partOfSpeech: 'verb', translation: 'vouloir (poli), aimer (je voudrais)', example: 'Was möchten Sie?', note: 'ich möchte, du möchtest, er möchte (sans -t)' },
    { id: 'kosten', word: 'kosten', article: null, plural: null, partOfSpeech: 'verb', translation: 'coûter', example: 'Die Tomaten kosten drei Euro.', note: 'Was kostet der Käse? Was kosten die Äpfel?' },
    { id: 'gern', word: 'gern', article: null, plural: null, partOfSpeech: 'adverb', translation: 'volontiers ; aimer (faire)', example: 'Ich esse gern Fisch.', note: 'après le verbe conjugué ; nicht gern : ne pas aimer' },
  ],
  activities: {
    'a1-essen-wortschatz': { title: 'Découvrir : les aliments et les boissons', estimatedMinutes: 12, lesson: { title: 'Découvrir : les aliments et les boissons' } },
    'a1-essen-nachsprechen': { estimatedMinutes: 10 },
    'a1-essen-dialog': { title: 'Comprendre : au café', estimatedMinutes: 12, lesson: { title: 'Comprendre : au café' } },
    'a1-essen-einkaufen': {
      title: 'Comprendre : faire les courses, quantités et prix',
      lesson: {
        title: 'Comprendre : faire les courses, quantités et prix',
        description: `Au marché (auf dem Markt), à la boulangerie (in der Bäckerei) ou au supermarché (im Supermarkt), il faut savoir demander une quantité et comprendre un prix.

LES PRIX
• 1,00 € — ein Euro
• 2,50 € — zwei Euro fünfzig
• 0,80 € — achtzig Cent
• 3,99 € — drei Euro neunundneunzig
• 12,40 € — zwölf Euro vierzig
On écrit une virgule (2,50 €). On dit le nombre d’euros, puis les centimes, sans répéter « Cent ». « Euro » ne prend pas de -s : zehn Euro. Attention à ne pas confondre neunzehn (19) et neunzig (90) !

DEMANDER LE PRIX
• Was kostet der Käse? — Combien coûte le fromage ? → Er kostet vier Euro.
• Was kosten die Äpfel? — Combien coûtent les pommes ? → Zwei Euro zwanzig das Kilo.
• Wie viel kostet das? — Combien ça coûte ?
• Das macht zusammen … — Ça fait … en tout.
Avec un nom au pluriel, le verbe devient « kosten ».

LES QUANTITÉS
• ein Kilo Äpfel — un kilo de pommes   • ein Pfund Tomaten — une livre (500 g) de tomates
• hundert Gramm Käse — cent grammes de fromage   • ein Liter Milch — un litre de lait
• eine Flasche Wasser — une bouteille d’eau   • ein Glas Marmelade — un pot de confiture
• eine Schale Erdbeeren — une barquette de fraises   • ein Stück Kuchen — une part de gâteau
• sechs Brötchen — six petits pains
Attention : pas de « de » en allemand. On dit « ein Kilo Äpfel », et non « ein Kilo von Äpfeln ».

FAIRE SES COURSES : PHRASES UTILES
• Was darf es sein? / Was bekommen Sie? — Vous désirez ?
• Ich möchte ein Kilo Kartoffeln, bitte. / Ich hätte gern … — Je voudrais …
• Sonst noch etwas? — Et avec ceci ?
• Nein, danke, das ist alles. — Non merci, ce sera tout.
• Haben Sie …? — Avez-vous … ?

À VOUS
1. Écoutez la scène au marché sans lire la transcription : qu’achète Frau Berger ?
2. Réécoutez et repérez chaque quantité avec son prix, puis vérifiez le total annoncé : 2,20 € + 1,50 € + 2,50 €.
3. Lisez le rôle de la cliente à voix haute, en marquant bien les prix.`,
      },
    },
    'a1-essen-obst-hoeren': {
      explanations: {
        q1: 'Au premier plan de l’étal, on voit des régimes de bananes : die Bananen. Les pommes, les poires et les oranges ne sont pas sur la photo.',
        q2: 'On entend « der Apfel, die Äpfel » : le pluriel prend un tréma, sans terminaison. Sans tréma (die Apfel), le mot reste un singulier ; Apfeln n’existe pas.',
        q3: 'L’enregistrement cite Apfel, Apfelsine, Orange, Aprikose, Aubergine, Banane et Birne. Die Erdbeere (la fraise) n’y figure pas : elle vient du lexique du module.',
        q4: 'On entend « die Aubergine, die Auberginen » : le mot est féminin, comme en français. Les noms terminés par -e sont très souvent féminins (die Banane, die Birne).',
        q5: 'Ces deux noms féminins en -e prennent -n au pluriel : die Apfelsinen, die Orangen. Le -s du pluriel français ne s’emploie pas ici.',
        q6: 'Die Aprikose → die Aprikosen, die Banane → die Bananen, die Birne → die Birnen : les noms féminins en -e ajoutent -n. « Bananes » est une habitude du français.',
      },
    },
    'a1-essen-lesen': {
      explanations: {
        q1: 'La carte indique « FRÜHSTÜCK (bis 11.30 Uhr) » : bis veut dire « jusqu’à ». 18 h est l’heure de fermeture du café et 12 h le début du Mittagstisch.',
        q2: 'Le Großes Frühstück ajoute Käse, Wurst, 1 Ei et Orangensaft. Les petits pains, le beurre et le café ou le thé figurent dans les deux formules.',
        q3: 'Jakob écrit « Ich esse kein Fleisch, aber dort gibt es auch Nudeln mit Tomatensoße » : il cherche un plat sans viande. Le café est fermé le dimanche et Jakob n’a qu’une heure de pause.',
        q4: 'Hähnchen mit Kartoffeln und Salat coûte 11,90 € et le Mineralwasser 2,50 € : 11,90 € + 2,50 € = 14,40 €.',
        q5: 'Kaffee (2,40 €) + Schokoladenkuchen (3,60 €) = 6,00 €. Avec l’Apfelkuchen (3,20 €), il paierait 5,60 €.',
      },
    },
    'a1-essen-esskultur': {
      estimatedMinutes: 10,
      explanations: {
        q1: 'Manon écrit « Zum Frühstück essen meine Mitbewohner Brot oder Brötchen mit Butter, Käse oder Marmelade ». Il n’est question ni de croissants ni de céréales.',
        q2: '« Traditionell ist das Mittagessen in Deutschland groß und warm: Fleisch, Kartoffeln und Gemüse. » La salade ou la soupe, c’est ce que beaucoup mangent aujourd’hui, pas la tradition.',
        q3: '« Am Abend essen wir oft kalt: Das ist das Abendbrot mit Brot, Käse, Wurst und Tomaten. » L’Abendbrot est le repas froid du soir, pas une sorte de pain.',
        q4: '« Und mittags sagen viele Leute bei der Arbeit: Mahlzeit! » On le dit à midi, entre collègues. Avant de manger, on souhaite plutôt « Guten Appetit! ».',
        q5: '« Am Sonntag sind die Supermärkte geschlossen. Darum kaufe ich immer am Samstag ein. » Darum (c’est pourquoi) introduit la conséquence. Les sacs, eux, sont toujours payants.',
        q6: 'Manon écrit « Er sagt nicht Brötchen, er sagt Semmel ». Der Erdapfel est le mot autrichien pour la pomme de terre (die Kartoffel), pas pour le petit pain.',
      },
    },
    'a1-essen-hoeren': {
      estimatedMinutes: 12,
      competences: ['ecoute', 'expression-ecrite'],
      lesson: {
        description: `Écoutez les trois petites scènes (vous pouvez réécouter autant de fois que nécessaire), puis répondez aux questions. Pour les prix, attention à la différence entre « neunzehn » (19) et « neunzig » (90). Les deux dernières questions sont des dictées : écoutez la phrase et écrivez-la. La transcription s’affichera après votre réponse.

MOTS UTILES
• das Vollkornbrot — le pain complet   • das Schnitzel — l’escalope panée
• die Pommes — les frites   • kein … mehr — plus de …`,
      },
      explanations: {
        q1: 'La boulangère additionne « zwei Euro vierzig » pour les six petits pains et « drei Euro fünfzig » pour le pain : « Zusammen fünf Euro neunzig ». 2,40 € et 3,50 € ne sont que des parties du total.',
        q2: 'Lisa dit « Äpfel haben wir noch. Aber kaufst du bitte Bananen? » : il reste des pommes, Tim doit acheter des bananes.',
        q3: '« Wir haben keine Milch mehr und keinen Käse » : kein … mehr veut dire « plus de ». Il reste des pommes et de la bière, et Lisa ne veut pas de vin.',
        q4: 'La serveuse répond « Wir haben heute kein Schnitzel mehr » : il n’y en a plus aujourd’hui. L’homme voulait justement un Schnitzel, il mange donc de la viande.',
        q5: '« Dann nehme ich Fisch mit Kartoffeln. Und ein Glas Weißwein » : Weißwein est le vin blanc. Il refuse l’eau (« Nein, danke ») et le poisson n’est pas servi avec du riz.',
      },
      addQuestions: [
        {
          id: 'q6', type: 'dictation', prompt: DICTATION, voice: 'frau',
          accept: ['Wir haben keine Milch mehr.'],
          explanation: 'Milch est féminin (die Milch) : la négation devient keine. Kein … mehr signifie « plus de ». Milch prend une majuscule, comme tous les noms allemands.',
        },
        {
          id: 'q7', type: 'dictation', prompt: DICTATION, voice: 'mann',
          accept: ['Die Tomaten kosten drei Euro das Kilo.'],
          explanation: 'Die Tomaten est un pluriel : le verbe est kosten, avec -en. On dit « drei Euro », sans -s, et « das Kilo » pour le prix au kilo.',
        },
      ],
    },
    'a1-essen-imbiss': {
      explanations: {
        q1: 'Manon dit « Ich esse nicht so gern Wurst » : elle n’aime pas beaucoup la saucisse. Elle commande un döner, elle mange donc de la viande.',
        q2: '« Aber ohne Zwiebeln, bitte », puis « Bitte nicht so scharf » : sans oignons et pas trop épicé. Le ketchup, c’est la commande de Jonas.',
        q3: 'Au vendeur qui demande « Für hier oder zum Mitnehmen? », Jonas répond « Für hier » : ils mangent sur place.',
        q4: 'Le vendeur dit « Die Currywurst mit Pommes kostet fünf Euro achtzig » : 5,80 €. Achtzig (80) n’est pas achtzehn (18) ; 6,50 € est le prix du döner.',
        q5: 'Jonas dit « Zusammen. Manon, ich lade dich ein! » : il invite et paie les deux repas, « sechzehn Euro dreißig », soit 16,30 €. 13,60 € inverse les chiffres.',
        q6: 'Manon réagit : « Das ist aber nicht sehr gesund, Jonas! » Gesund veut dire « bon pour la santé » ; elle ne parle pas du prix.',
      },
    },
    'a1-essen-grammatik': {
      title: 'S’entraîner : einen, eine, ein, kein, gern et les prix',
      estimatedMinutes: 12,
      lesson: {
        title: 'S’entraîner : einen, eine, ein, kein, gern et les prix',
        description: 'Choisissez ou écrivez la forme qui convient. Rappels : à l’accusatif, seul le masculin change (der Kaffee → einen Kaffee, keinen Kaffee) ; « kein » s’emploie devant un nom, « nicht » devant « gern » ; avec un nom au pluriel, on demande « Was kosten …? » ; pas de « de » après une quantité (ein Kilo Äpfel). Pour l’ordre des mots, touchez les étiquettes dans l’ordre de la phrase.',
      },
      explanations: {
        q1: 'Kaffee est masculin (der Kaffee) : après möchte, il est complément d’objet, donc à l’accusatif, et ein devient einen. À l’accusatif, seul le masculin change.',
        q2: 'Milch est féminin (die Milch) : pour nier un nom, on emploie kein, ici keine. Nicht ne se place pas devant un nom sans article.',
        q3: 'Pour dire qu’on n’aime pas, on nie gern : Ich esse nicht gern Fisch. Kein nierait le nom : Ich esse keinen Fisch veut dire « je ne mange pas de poisson ».',
        q4: 'Die Tomaten est un pluriel : le verbe prend -en, Was kosten die Tomaten? Kostet va avec un nom au singulier (Was kostet der Käse?).',
        q5: 'On dit d’abord les euros, puis les centimes : 2,70 € se dit zwei Euro siebzig. Siebzehn vaut 17, pas 70.',
        q6: 'Après une quantité, l’allemand n’a pas de « de » : ein Kilo Kartoffeln. Das Kilo est neutre, d’où ein, ni eine ni einen.',
      },
      addQuestions: [
        {
          id: 'q7', type: 'fill', prompt: 'Complétez la commande avec einen, eine ou ein.',
          text: 'Ich möchte [[1]] Tee, [[2]] Apfelschorle und [[3]] Stück Kuchen, bitte.',
          blanks: [{ id: '1', accept: ['einen'], size: 6, hint: null }, { id: '2', accept: ['eine'], size: 6, hint: null }, { id: '3', accept: ['ein'], size: 6, hint: null }],
          explanation: 'Après möchte, le nom est à l’accusatif : der Tee → einen Tee, die Apfelschorle → eine Apfelschorle, das Stück → ein Stück. Seul le masculin prend -en.',
        },
        {
          id: 'q8', type: 'fill', prompt: 'Le réfrigérateur est vide. Complétez avec keinen, keine ou kein.',
          text: 'Wir haben [[1]] Käse, [[2]] Milch und [[3]] Brot mehr.',
          blanks: [{ id: '1', accept: ['keinen'], size: 7, hint: null }, { id: '2', accept: ['keine'], size: 7, hint: null }, { id: '3', accept: ['kein'], size: 7, hint: null }],
          explanation: 'Kein prend les terminaisons de ein : der Käse → keinen Käse, die Milch → keine Milch, das Brot → kein Brot. Ici, haben est suivi de l’accusatif.',
        },
        {
          id: 'q9', type: 'order', prompt: 'Remettez les mots dans l’ordre : je n’aime pas le café.',
          answers: [
            ['Ich', 'trinke', 'nicht', 'gern', 'Kaffee'],
            ['Ich', 'trinke', 'Kaffee', 'nicht', 'gern'],
          ],
          explanation: 'Le verbe trinke est en 2e position et nicht se place juste devant gern : Ich trinke nicht gern Kaffee (ou Ich trinke Kaffee nicht gern). Kein Kaffee voudrait dire « pas de café ».',
        },
        {
          id: 'q10', type: 'match', prompt: 'Associez chaque prix à sa lecture.',
          pairs: [
            { left: '2,70 €', right: 'zwei Euro siebzig' },
            { left: '7,20 €', right: 'sieben Euro zwanzig' },
            { left: '0,90 €', right: 'neunzig Cent' },
            { left: '19,00 €', right: 'neunzehn Euro' },
            { left: '9,50 €', right: 'neun Euro fünfzig' },
          ],
          explanation: 'On lit les euros, puis les centimes, sans répéter « Cent » : 9,50 € = neun Euro fünfzig. Sous un euro, on dit les centimes : neunzig Cent. -zehn (19) n’est pas -zig (90).',
        },
      ],
    },
    // La leçon sur le ch devient l’exercice de répétition : mêmes explications et voix natives, avec des phrases à valider.
    'a1-essen-aussprache-ch': null,
    'a1-essen-sprechen': {
      kind: 'mission',
      title: 'Mission : mes habitudes alimentaires',
      estimatedMinutes: 20,
      competences: ['expression-orale', 'expression-ecrite'],
      lesson: {
        title: 'Mission : mes habitudes alimentaires',
        description: `Un nouveau groupe de conversation se présente : chacun dit ce qu’il mange et boit volontiers. Samedi, vous invitez aussi des amis à dîner et vous écrivez la liste des courses à votre colocataire. Écoutez d’abord Nadia.

MODÈLE
Hallo, ich bin Nadia. Zum Frühstück esse ich gern Müsli mit Joghurt und Obst. Dazu trinke ich einen Tee. Kaffee trinke ich nicht so gern. Mittags esse ich oft einen Salat oder eine Suppe. Ich esse kein Fleisch, aber ich esse sehr gern Fisch. Mein Lieblingsessen ist Fisch mit Reis und Gemüse.

POUR VOUS AIDER
• Zum Frühstück esse ich … Dazu trinke ich …
• Ich esse gern … / Ich trinke nicht gern … / Ich esse kein Fleisch.
• Mein Lieblingsessen ist …
• Wir brauchen ein Kilo …, zwei Flaschen …, sechs …`,
      },
      mission: {
        oral: {
          prompt: 'Présentez vos habitudes en une minute environ : votre petit-déjeuner, deux choses que vous aimez, une chose que vous n’aimez pas et votre plat préféré. Terminez en commandant au café une boisson et une part de gâteau, puis demandez l’addition.',
          maxSeconds: 90,
        },
        written: {
          prompt: 'Écrivez à votre colocataire un message de cinq ou six phrases pour le dîner de samedi : ce que vous cuisinez, ce qu’il faut acheter avec les quantités (ein Kilo …, zwei Flaschen …) et ce que vos amis aiment ou n’aiment pas. Exemple de début : « Hallo Ben! Am Samstag kochen wir Nudeln mit Tomatensoße. Wir brauchen … »',
          maxChars: 800,
          minWords: 30,
        },
        checklist: [
          'J’ai dit ce que je mange au petit-déjeuner et ce que j’aime ou n’aime pas (gern, nicht gern).',
          'J’ai commandé une boisson et un gâteau avec « Ich möchte einen / eine / ein … », puis demandé l’addition.',
          'Devant un nom masculin, j’ai écrit einen ou keinen (einen Tee, keinen Käse).',
          'Mon message donne au moins trois achats avec une quantité, sans « von » (ein Kilo Tomaten).',
          'Dans chaque phrase, le verbe conjugué est en deuxième position.',
        ],
      },
    },
  },
  add: [
    {
      after: 'a1-essen-grammatik',
      activity: {
        id: 'a1-essen-repeter',
        kind: 'exercise',
        title: 'Répéter à voix haute : le ch et les commandes',
        estimatedMinutes: 10,
        competences: ['expression-orale'],
        lesson: {
          title: 'Répéter à voix haute : le ch et les commandes',
          description: `LE CH ALLEMAND · 10 MIN

En allemand, ch ne se prononce jamais comme dans le français « chat ». Il note deux sons qui n’existent pas en français, et vous les entendez partout dans ce module : ich möchte, die Milch, das Brötchen, der Kuchen, kochen.

1. LE ICH-LAUT, comme dans « ich »
Après e, i, ä, ö, ü, ei, eu, ie et après une consonne (l, n, r) : ich, möchte, München, die Milch, manchmal. Toujours aussi dans la terminaison -chen : das Brötchen, das Hähnchen. Placez la langue comme pour le « y » de « yaourt », la pointe contre les dents du bas, et soufflez fort sans faire vibrer la voix. Ne dites ni « isch » ni « ik ».

2. LE ACH-LAUT, comme dans « ach »
Après a, o, u et au : machen, die Nacht, kochen, suchen, der Kuchen, auch. Le son se forme au fond de la bouche, à l’endroit du r français : soufflez fort en frottant. Ne le remplacez pas par un k : kochen ne se dit pas « koken ».

C’EST LA VOYELLE QUI DÉCIDE
a, o, u, au → ach-Laut ; les autres voyelles et les consonnes → ich-Laut. Avec un tréma, le son change : das Buch (ach) → die Bücher (ich), die Nacht (ach) → die Nächte (ich). Attention : chs se prononce [ks] dans sechs.

À VOUS
1. Écoutez les deux enregistrements natifs : six mots avec le ich-Laut, six avec le ach-Laut, puis un virelangue : « Machen Drachen manchmal nachts echt freche Sachen, oder lachen Drachen manchmal acht freche Lacher? » Répétez chaque mot pendant la pause.
2. Écoutez ensuite chaque modèle et dites la phrase. La reconnaissance vocale compare votre phrase au modèle : articulez sans vous presser.

Enregistrements : Deutsch im Blick (COERLL, Université du Texas à Austin), CC BY 4.0.`,
          transcript: null,
        },
        placements: [
          { media: 'a1-essen-ch-native', usage: 'audio', transcriptVisibility: 'on_demand', decorative: false },
          { media: 'a1-essen-ch-zungenbrecher-native', usage: 'audio', transcriptVisibility: 'on_demand', decorative: false },
        ],
        questions: [
          speak('q1', 'Ich möchte einen Kaffee, bitte.', 'Ich et möchte ont le ich-Laut : un souffle doux, la langue en avant. Einen, avec -en, signale le masculin der Kaffee.'),
          speak('q2', 'Den Apfelkuchen, bitte!', 'Dans Apfelkuchen, ch suit un u : c’est le ach-Laut, frotté au fond de la bouche (ne dites pas « kouken »). Pf se prononce p et f d’un seul coup, et l’accent tombe sur AP-.'),
          speak('q3', 'Ich trinke gern Milch.', 'Après l, ch est un ich-Laut : Milch. Gern se place juste après le verbe conjugué.'),
          speak('q4', 'Wir kochen heute Nudeln.', 'Après o, kochen a le ach-Laut. Dans heute, eu se prononce « oï ».'),
          speak('q5', 'Was kostet das Brötchen?', 'La terminaison -chen a toujours le ich-Laut : Brötchen. Pour ö, dites « é » en arrondissant les lèvres.'),
          speak('q6', 'Die Rechnung, bitte!', 'Après e, ch est un ich-Laut : Rechnung. C’est la formule pour demander l’addition, comme « Zahlen, bitte! ».'),
        ],
      },
    },
  ],
};
