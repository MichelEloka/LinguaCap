// Couche pédagogique V4 · a2-einkaufen (lot A7, contenu A2).
// Achats, vêtements et services : explications de toutes les questions, dieser / welcher + adjectif et demandes polies en
// exercices typés, répétition validée, dictées et mission « réclamation » remise au professeur.

export default {
  module: 'a2-einkaufen',
  grammarFocus: ['dieser-welcher-adjectif', 'demandes-polies-konjunktiv'],

  vocabulary: [
    { id: 'kleidung', word: 'Kleidung', article: 'die', plural: null, partOfSpeech: 'noun', translation: 'les vêtements',
      example: 'Ich kaufe meine Kleidung oft im Second-Hand-Laden.', note: 'singulier collectif : die Kleidung ist …' },
    { id: 'hose', word: 'Hose', article: 'die', plural: 'Hosen', partOfSpeech: 'noun', translation: 'le pantalon',
      example: 'Diese Hose ist mir zu lang.', note: null },
    { id: 'rock', word: 'Rock', article: 'der', plural: 'Röcke', partOfSpeech: 'noun', translation: 'la jupe',
      example: 'Sie trägt einen roten Rock.', note: null },
    { id: 'kleid', word: 'Kleid', article: 'das', plural: 'Kleider', partOfSpeech: 'noun', translation: 'la robe',
      example: 'Welches Kleid nimmst du?', note: null },
    { id: 'hemd', word: 'Hemd', article: 'das', plural: 'Hemden', partOfSpeech: 'noun', translation: 'la chemise',
      example: 'An diesem Hemd fehlt ein Knopf.', note: null },
    { id: 'jacke', word: 'Jacke', article: 'die', plural: 'Jacken', partOfSpeech: 'noun', translation: 'la veste',
      example: 'Ich suche eine Jacke für den Herbst.', note: null },
    { id: 'mantel', word: 'Mantel', article: 'der', plural: 'Mäntel', partOfSpeech: 'noun', translation: 'le manteau',
      example: 'Der graue Mantel ist aus Wolle.', note: null },
    { id: 'pullover', word: 'Pullover', article: 'der', plural: 'Pullover', partOfSpeech: 'noun', translation: 'le pull',
      example: 'Der Pullover ist mir zu eng.', note: 'familier : der Pulli, die Pullis' },
    { id: 'schuh', word: 'Schuh', article: 'der', plural: 'Schuhe', partOfSpeech: 'noun', translation: 'la chaussure',
      example: 'Dieser Schuh ist sehr bequem.', note: null },
    { id: 'groesse', word: 'Größe', article: 'die', plural: 'Größen', partOfSpeech: 'noun', translation: 'la taille, la pointure',
      example: 'Welche Größe haben Sie?', note: 'eine Nummer größer : une taille au-dessus' },
    { id: 'anprobieren', word: 'anprobieren', article: null, plural: null, partOfSpeech: 'verb', translation: 'essayer (un vêtement)',
      example: 'Kann ich die Jacke anprobieren?', note: 'séparable : an|probieren · Perfekt : hat anprobiert' },
    { id: 'passen', word: 'passen', article: null, plural: null, partOfSpeech: 'verb', translation: 'aller (pour la taille)',
      example: 'Die Schuhe passen mir nicht.', note: '+ datif : Die Hose passt mir.' },
    { id: 'stehen', word: 'stehen', article: null, plural: null, partOfSpeech: 'verb', translation: 'aller (pour le style, la couleur)',
      example: 'Diese Farben stehen dir gut.', note: '+ datif : Die Farbe steht Ihnen gut.' },
    { id: 'gefallen', word: 'gefallen', article: null, plural: null, partOfSpeech: 'verb', translation: 'plaire',
      example: 'Die Farben gefallen mir sehr.', note: '+ datif : Der Mantel gefällt mir.' },
    { id: 'umtauschen', word: 'umtauschen', article: null, plural: null, partOfSpeech: 'verb', translation: 'échanger',
      example: 'Ich möchte diese Hose umtauschen.', note: 'séparable : um|tauschen' },
    { id: 'zurueckgeben', word: 'zurückgeben', article: null, plural: null, partOfSpeech: 'verb', translation: 'rendre (un article)',
      example: 'Kann ich die Jacke zurückgeben?', note: 'séparable : zurück|geben' },
    { id: 'reklamieren', word: 'reklamieren', article: null, plural: null, partOfSpeech: 'verb', translation: 'faire une réclamation',
      example: 'Ich möchte etwas reklamieren.', note: 'Perfekt sans ge- : hat reklamiert' },
    { id: 'kassenbon', word: 'Kassenbon', article: 'der', plural: 'Kassenbons', partOfSpeech: 'noun', translation: 'le ticket de caisse',
      example: 'Bitte bringen Sie den Kassenbon mit.', note: null },
    { id: 'kasse', word: 'Kasse', article: 'die', plural: 'Kassen', partOfSpeech: 'noun', translation: 'la caisse',
      example: 'Bitte zahlen Sie an der Kasse.', note: null },
    { id: 'gutschein', word: 'Gutschein', article: 'der', plural: 'Gutscheine', partOfSpeech: 'noun', translation: 'le bon d’achat',
      example: 'Ab dem 15. Tag bekommen Sie einen Gutschein.', note: null },
    { id: 'im-angebot', word: 'im Angebot', article: null, plural: null, partOfSpeech: 'expression', translation: 'en promotion',
      example: 'Diese Jacke ist gerade im Angebot.', note: null },
    { id: 'eng', word: 'eng', article: null, plural: null, partOfSpeech: 'adjective', translation: 'serré, étroit',
      example: 'Die Jacke ist mir ein bisschen zu eng.', note: 'contraire : weit' },
    { id: 'bequem', word: 'bequem', article: null, plural: null, partOfSpeech: 'adjective', translation: 'confortable',
      example: 'Die Laufschuhe sind sehr bequem.', note: null },
    { id: 'paket', word: 'Paket', article: 'das', plural: 'Pakete', partOfSpeech: 'noun', translation: 'le colis',
      example: 'Ich möchte ein Paket nach Frankreich schicken.', note: null },
    { id: 'briefmarke', word: 'Briefmarke', article: 'die', plural: 'Briefmarken', partOfSpeech: 'noun', translation: 'le timbre',
      example: 'Ich hätte gern eine Briefmarke für diese Postkarte.', note: null },
    { id: 'konto', word: 'Konto', article: 'das', plural: 'Konten', partOfSpeech: 'noun', translation: 'le compte (bancaire)',
      example: 'Ich würde gern ein Konto eröffnen.', note: null },
    { id: 'bargeld', word: 'Bargeld', article: 'das', plural: null, partOfSpeech: 'noun', translation: 'l’argent liquide',
      example: 'Nehmen Sie immer etwas Bargeld mit.', note: 'bar bezahlen : payer en liquide' },
    { id: 'abheben', word: 'abheben', article: null, plural: null, partOfSpeech: 'verb', translation: 'retirer (de l’argent)',
      example: 'Ich möchte zweihundert Euro abheben.', note: 'séparable : ab|heben · Geld abheben' },
    { id: 'ueberweisen', word: 'überweisen', article: null, plural: null, partOfSpeech: 'verb', translation: 'virer (de l’argent)',
      example: 'Wir überweisen den Betrag auf Ihr Konto.', note: 'Perfekt : hat überwiesen' },
  ],

  activities: {
    'a2-einkaufen-wortschatz': {
      title: 'Découvrir : vêtements, magasin, poste et banque',
    },

    'a2-einkaufen-dialog': {
      title: 'Comprendre : essayer et acheter une veste',
      lesson: {
        description: `Nora cherche une veste pour l’automne. Herr Brandt, vendeur dans un magasin de vêtements, la conseille. Écoutez le dialogue une première fois sans lire, puis une deuxième fois en suivant le texte.

DIALOGUE
Herr Brandt : Guten Tag! Kann ich Ihnen helfen?
Nora : Ja, gern. Ich suche eine Jacke für den Herbst. Sie sollte leicht und wasserdicht sein.
Herr Brandt : Welche Größe haben Sie?
Nora : Normalerweise trage ich Größe 38.
Herr Brandt : Dann schauen Sie mal hier. Diese Jacke ist neu, und sie ist gerade im Angebot: 79 Euro statt 99.
Nora : Schön! Welche Farben gibt es denn?
Herr Brandt : Schwarz, Dunkelblau und Grün.
Nora : Die dunkelblaue Jacke gefällt mir. Kann ich sie anprobieren?
Herr Brandt : Natürlich. Die Umkleidekabinen sind dort hinten rechts.
…
Herr Brandt : Und? Passt sie?
Nora : Leider nicht ganz, sie ist ein bisschen zu eng. Hätten Sie diese Jacke eine Nummer größer?
Herr Brandt : Moment, ich schaue mal … Ja, hier ist sie in 40.
Nora : Die passt perfekt. Steht mir die Farbe?
Herr Brandt : Ja, Dunkelblau steht Ihnen sehr gut.
Nora : Und dieser graue Mantel dort, was kostet der?
Herr Brandt : Der kostet 189 Euro. Er ist aus reiner Wolle.
Nora : Oh, das ist mir zu teuer. Ich nehme nur die Jacke. Könnten Sie mir noch sagen, ob ich sie umtauschen kann?
Herr Brandt : Ja, innerhalb von 30 Tagen, mit dem Kassenbon. Zahlen Sie bar oder mit Karte?
Nora : Mit Karte, bitte. Und würden Sie mir bitte noch eine Tüte geben?
Herr Brandt : Gern. Bitte schön, und viel Freude mit der Jacke!

GRAMMAIRE : DIESER ET WELCHER + ADJECTIF
dieser (ce …-ci, ce …-là) et welcher (quel ?) se déclinent comme l’article défini : der → dieser, die → diese, das → dieses, die (pluriel) → diese. Après eux, l’adjectif prend seulement -e ou -en.
• Nominatif : dieser graue Mantel — diese blaue Jacke — dieses rote Kleid — diese neuen Schuhe
• Accusatif : Ich nehme diesen grauen Mantel / diese blaue Jacke / dieses rote Kleid / diese neuen Schuhe.
• Datif : mit diesem grauen Mantel — mit dieser blauen Jacke — mit diesem roten Kleid — mit diesen neuen Schuhen
Règle simple : -e au nominatif singulier et à l’accusatif féminin et neutre ; -en partout ailleurs (accusatif masculin, datif, pluriel).
Questions : Welcher Mantel gefällt Ihnen? — Welche Größe haben Sie? — Welches Kleid nehmen Sie? — Welche Schuhe möchten Sie anprobieren?

DEMANDES POLIES
Pour demander poliment, on emploie le subjonctif II (Konjunktiv II) :
• Ich hätte gern + nom — Je voudrais … : Ich hätte gern diese Jacke in Größe 40.
• Hätten Sie …? — Auriez-vous … ? : Hätten Sie diese Jacke eine Nummer größer?
• Könnten Sie … + infinitif ? — Pourriez-vous … ? : Könnten Sie mir bitte helfen?
• Würden Sie … + infinitif ? — Voudriez-vous bien … ? : Würden Sie mir bitte eine Tüte geben?
Formes : ich hätte / Sie hätten — ich könnte / Sie könnten — ich würde / Sie würden. L’infinitif va à la fin de la phrase.
Avec passen, stehen et gefallen, la personne est au datif : Die Jacke passt mir. Die Farbe steht Ihnen gut.`,
      },
    },

    'a2-einkaufen-kleidung-bilder': {
      title: 'Vérifier : nommer des vêtements et les demander',
      explanations: {
        q1: 'Deux jambes, un bouton à la taille et des revers en bas : c’est die Hose, le pantalon. Der Rock (la jupe) et das Kleid (la robe) n’ont pas de jambes ; die Shorts s’arrêtent au-dessus du genou.',
        q2: 'Un haut féminin avec un col à revers et des boutons sur le devant : die Bluse, le chemisier. Un T-Shirt n’a ni col ni boutons, et un Pullover est un tricot à manches longues.',
        q3: 'Des chaussures montantes qui couvrent la jambe jusqu’au mollet : die Stiefel, les bottes (der Stiefel, pluriel sans changement). Les Turnschuhe et les Sandalen s’arrêtent au pied.',
        q4: 'Un haut chaud à manches longues, sans boutons ni fermeture : der Pullover. Das Hemd a des boutons, et der Mantel se porte par-dessus les autres vêtements.',
        q5: 'Stiefel est ici au pluriel (une paire de bottes) et complément d’anprobieren, donc à l’accusatif : diese, comme die au pluriel. Diesen Stiefeln serait un datif, dieser Stiefel un nominatif masculin.',
        q6: 'Die Bluse est féminin : à l’accusatif, dieser devient diese, comme die. Diesen est la forme du masculin (diesen Pullover) et dieses celle du neutre (dieses Kleid).',
      },
    },

    'a2-einkaufen-lesen': {
      title: 'Vérifier : lire les conditions d’échange d’un magasin',
      explanations: {
        q1: 'Le pull, jamais porté, a été acheté il y a trois semaines : l’échange reste possible « innerhalb von 30 Tagen ». Le remboursement ne vaut que 14 jours ; ensuite, « statt Geld einen Gutschein ».',
        q2: 'Tom rend le pantalon au bout de cinq jours, dans le délai de 14 jours : il est remboursé. Comme il a payé par carte, « überweisen wir den Betrag auf Ihr Konto ». Le bon d’achat ne vient qu’à partir du 15e jour.',
        q3: '« Unterwäsche, Badeanzüge und Socken nehmen wir aus hygienischen Gründen nicht zurück. » Les vêtements non portés avec étiquette et les commandes en ligne sont repris.',
        q4: '« Artikel mit rotem Preisschild können Sie nur umtauschen, nicht zurückgeben » : un article soldé s’échange, mais n’est ni remboursé ni transformé en bon d’achat.',
        q5: '« Bitte bringen Sie immer den Kassenbon mit. » Le Rücksendeschein sert seulement aux commandes en ligne renvoyées par la poste ; aucune pièce d’identité n’est demandée.',
        q6: 'Une fermeture éclair cassée est un défaut : le magasin répare ou remplace l’article « auch nach 30 Tagen », car la garantie légale (Gewährleistung) dure deux ans.',
      },
    },

    'a2-einkaufen-hoeren': {
      title: 'Vérifier : écouter à la poste, à la banque et au magasin',
      lesson: {
        description: 'Vous allez entendre trois scènes : Frau Costa à la poste, Herr Mensah à la banque et Herr Berger dans un magasin de sport. Lisez d’abord les questions, puis écoutez (autant de fois que nécessaire) et répondez. La dernière question est une dictée : une demande polie entendue dans la deuxième scène. La transcription s’affichera après votre réponse.',
      },
      competences: ['ecoute', 'expression-ecrite'],
      explanations: {
        q1: 'L’employé annonce « ungefähr vier bis sechs Werktage » : de quatre à six jours ouvrables (Werktage). Les trois kilos sont le poids du colis, pas un délai.',
        q2: 'Frau Costa demande « noch zehn Briefmarken für Postkarten nach Frankreich ». Elle refuse le carton (« Nein, danke, das ist alles ») et n’achète pas de cartes postales.',
        q3: '« Der Geldautomat draußen hat meine Karte nicht zurückgegeben » : le distributeur a gardé sa carte. Il ne l’a pas perdue, et il montre bien sa pièce d’identité.',
        q4: 'Il a besoin de liquide le jour même ; l’employé accepte, et il demande « Zweihundert Euro, bitte ». La semaine d’attente concerne la nouvelle carte, pas l’argent.',
        q5: 'Le client dit « bei den Schuhen ist die Sohle schon kaputt » : la semelle des chaussures est abîmée. Le sac de sport, lui, est « super ».',
        q6: 'Il veut « ein neues Paar, wieder in Größe dreiundvierzig » ; il n’y a plus de 43 en noir, seulement en blanc, et il accepte : « Ja, Weiß ist auch gut. » Il ne demande ni argent ni bon.',
      },
      addQuestions: [
        { id: 'q7', type: 'dictation', prompt: 'Scène 2 : écoutez la demande de l’employé de banque et écrivez-la.',
          accept: ['Würden Sie mir bitte Ihren Ausweis zeigen?'], voice: 'sprecher',
          explanation: 'Demande polie avec würden : l’infinitif zeigen termine la question. Ihren, avec une majuscule, est le possessif de politesse ; Ausweis est à l’accusatif masculin.' },
      ],
    },

    'a2-einkaufen-geschaefte': {
      title: 'Vérifier : écouter les magasins de la ville',
      lesson: {
        description: `Dans cet enregistrement natif du manuel Deutsch im Blick, un locuteur présente les magasins d’une ville allemande : chaque nom est dit au singulier avec son article, puis au pluriel. Lisez d’abord la liste et les questions, puis écoutez (autant de fois que nécessaire) en repérant l’article et le pluriel de chaque mot. La transcription s’affichera après votre réponse.

LES MOTS (sans article : à vous de l’entendre !)
• Apotheke — la pharmacie ; Bäckerei — la boulangerie ; Bank — la banque
• Buchhandlung — la librairie ; Drogerie — la droguerie (hygiène, beauté, entretien)
• etwas einkaufen — faire des courses, acheter quelque chose
• Gemüseladen — le marchand de légumes ; Geschäft — le magasin ; Friseur — le coiffeur
• Lebensmittelgeschäft — l’épicerie ; Schreibwarenladen — la papeterie
• Post — la poste ; Schuhgeschäft — le magasin de chaussures

ASTUCE
Un nom composé prend le genre et le pluriel de son dernier élément : Lebensmittel + Geschäft → Lebensmittelgeschäft ; Schreibwaren + Laden → Schreibwarenladen. Écoutez l’article de Geschäft et de Laden : il vaut aussi pour les mots composés.

LE SAVIEZ-VOUS ?
En Allemagne, la Drogerie n’est pas une pharmacie : on y achète du shampoing, du dentifrice, du maquillage ou des produits d’entretien. Les médicaments s’achètent à l’Apotheke, qu’on reconnaît à son grand A rouge.

Enregistrements et images : Deutsch im Blick (COERLL, Université du Texas à Austin), CC BY 4.0.`,
      },
      explanations: {
        q1: 'Le locuteur dit « die Bank, die Banken ». Die Bänke est le pluriel de die Bank au sens de « banc » : un même mot, deux pluriels selon le sens.',
        q2: 'On entend « das Geschäft, die Geschäfte ». Ce genre neutre vaut aussi pour les composés en -geschäft : das Schuhgeschäft, das Lebensmittelgeschäft.',
        q3: 'Le locuteur dit « der Friseur, die Friseure » : pluriel en -e. Die Friseurinnen est le pluriel du féminin die Friseurin, absent de l’enregistrement.',
        q4: 'Au sens de « la poste », die Post n’a guère de pluriel : le locuteur donne celui de das Postamt (le bureau de poste), die Postämter, avec -er et Umlaut.',
        q5: 'On entend « der Schreibwarenladen » : un nom composé prend le genre de son dernier élément, der Laden. Pluriel : die Schreibwarenläden.',
        q6: 'Les noms en -ei sont féminins et prennent -en au pluriel : die Bäckerei, die Bäckereien. Le pluriel en -s est réservé à des mots courts ou empruntés (die Pullis).',
      },
    },

    'a2-einkaufen-grammatik': {
      title: 'S’entraîner : dieser, welcher et les demandes polies',
      estimatedMinutes: 12,
      competences: ['lecture', 'ecoute', 'expression-ecrite'],
      lesson: {
        description: `Complétez, remettez dans l’ordre, associez ou choisissez, puis écrivez la phrase dictée.

RAPPEL
• dieser et welcher se déclinent comme der, die, das : dieser Mantel, diese Jacke, dieses Kleid, diese Schuhe ; accusatif masculin : diesen ; datif : diesem, dieser, diesem, diesen.
• Après dieser et welcher, l’adjectif prend -e (nominatif singulier, accusatif féminin et neutre) ou -en (tous les autres cas et le pluriel).
• passen, stehen, gefallen + datif : Die Jacke passt mir.
• Pour être poli : Ich hätte gern + nom ; Könnten Sie / Würden Sie … + infinitif à la fin ?`,
      },
      removeQuestions: ['q1', 'q2', 'q4', 'q5', 'q7'],
      explanations: {
        q3: 'Das Kleid est neutre et complément de nehmen : welches, comme das. Welcher est le nominatif masculin et welchen l’accusatif masculin.',
        q6: 'Passen se construit avec le datif de la personne : sie passt mir. Mich est un accusatif, ich un nominatif et mein un possessif.',
        q8: 'Würden Sie … bitte + infinitif à la fin est une demande polie (Konjunktiv II). L’impératif sans bitte, müssen et « Ich will » sonnent comme des ordres.',
      },
      addQuestions: [
        { id: 'q9', type: 'fill', prompt: 'Complétez avec dieser et l’adjectif à la bonne forme.',
          text: 'Wie findest du [[1]] [[2]] Pullover?',
          blanks: [{ id: '1', accept: ['diesen'], size: 8, hint: 'dieser' }, { id: '2', accept: ['blauen'], size: 8, hint: 'blau' }],
          explanation: 'Pullover est masculin et complément de finden, donc à l’accusatif : diesen. Après diesen, l’adjectif prend -en : diesen blauen Pullover.' },
        { id: 'q10', type: 'fill', prompt: 'Complétez l’adjectif.',
          text: 'Diese [[1]] Jacke gefällt mir nicht.',
          blanks: [{ id: '1', accept: ['schwarze'], size: 10, hint: 'schwarz' }],
          explanation: 'Diese Jacke est sujet (nominatif féminin) : après diese, l’adjectif prend seulement -e. La terminaison -en apparaît au datif, au pluriel et à l’accusatif masculin.' },
        { id: 'q11', type: 'fill', prompt: 'Complétez l’adjectif après mit.',
          text: 'Mit dieser [[1]] Tasche gehe ich heute Abend aus.',
          blanks: [{ id: '1', accept: ['kleinen'], size: 9, hint: 'klein' }],
          explanation: 'Mit est toujours suivi du datif : mit dieser (féminin). Après un déterminant au datif, l’adjectif prend -en : mit dieser kleinen Tasche.' },
        { id: 'q12', type: 'match', prompt: 'Associez chaque phrase à la forme de dieser qui la complète.',
          pairs: [
            { left: 'Ich nehme … Mantel.', right: 'diesen' },
            { left: '… Kleid ist sehr schön.', right: 'dieses' },
            { left: 'Mit … Jacke gehe ich aus.', right: 'dieser' },
            { left: 'In … Mantel ist mir warm.', right: 'diesem' },
            { left: '… Schuhe sind bequem.', right: 'diese' },
          ],
          explanation: 'Dieser se décline comme l’article défini : den → diesen (accusatif masculin), das → dieses, der (datif féminin) → dieser, dem → diesem, die (pluriel) → diese.' },
        { id: 'q13', type: 'order', prompt: 'Formulez une demande polie : remettez les mots dans l’ordre.',
          answers: [['Würden Sie', 'mir', 'eine Tüte', 'geben?']],
          explanation: 'Würden ouvre la question, suivi du sujet Sie ; le pronom datif mir précède l’objet eine Tüte, et l’infinitif geben va à la fin.' },
        { id: 'q14', type: 'order', prompt: 'Demandez poliment si l’échange est possible : remettez les mots dans l’ordre.',
          answers: [['Könnten Sie mir sagen,', 'ob', 'ich', 'die Jacke', 'umtauschen', 'kann?']],
          explanation: 'Ob introduit une question indirecte fermée : le verbe conjugué kann va à la fin, après l’infinitif umtauschen. « ob ich kann die Jacke umtauschen » garde à tort l’ordre d’une principale.' },
        { id: 'q15', type: 'dictation', prompt: 'Écoutez et écrivez la demande polie faite au vendeur.',
          accept: ['Hätten Sie diese Jacke eine Nummer größer?'], voice: 'frau',
          explanation: 'Hätten Sie …? est une demande polie au Konjunktiv II de haben. Eine Nummer größer : une taille au-dessus ; größer s’écrit avec ö et ß.' },
      ],
    },

    'a2-einkaufen-stil': {
      title: 'Comprendre : mon style et ma façon d’acheter',
      competences: ['ecoute', 'lecture', 'expression-orale'],
      lesson: {
        description: `« Kleider machen Leute » (mot à mot : les vêtements font les gens, autrement dit l’apparence compte) : ce proverbe allemand est aussi le titre d’une nouvelle suisse du XIXe siècle. Et pour vous, quelle place ont les vêtements ? Écoutez Selin, qui parle de son style et de sa façon d’acheter.

MODÈLE
Machen Kleider Leute? Ich glaube schon, dass Kleidung wichtig ist. Bei der Arbeit trage ich meistens eine dunkle Hose und eine weiße Bluse, weil ich seriös aussehen möchte. Am Wochenende ist mir Bequemlichkeit wichtiger: Dann trage ich Jeans, Turnschuhe und einen weiten Pullover. Früher habe ich jeden Monat neue Sachen gekauft, oft billige T-Shirts, die schnell kaputt waren. Heute kaufe ich weniger, aber bessere Kleidung. Am liebsten gehe ich in Second-Hand-Läden, weil die Sachen dort günstiger und besser für die Umwelt sind. Letzten Monat habe ich auf einer Kleidertauschparty sogar einen tollen Mantel gefunden, ganz ohne Geld! Teure Marken finde ich nicht so wichtig. Mein Motto ist: Weniger ist mehr.

MOTS UTILES
• der Stil — le style ; die Mode — la mode ; modisch — à la mode ; die Marke — la marque
• bequem — confortable ; die Bequemlichkeit — le confort ; schick — élégant ; seriös — sérieux
• günstig — bon marché, avantageux ; die Qualität — la qualité ; nachhaltig — durable ; die Umwelt — l’environnement
• der Second-Hand-Laden — la friperie ; die Kleidertauschparty — la soirée de troc de vêtements

REPÉREZ DANS LE MODÈLE
• des comparatifs : wichtiger, günstiger, besser (de gut) ; un superlatif : am liebsten ;
• deux subordonnées, verbe conjugué à la fin : …, dass Kleidung wichtig ist ; …, weil ich seriös aussehen möchte ;
• des adjectifs accordés : eine dunkle Hose, eine weiße Bluse, einen weiten Pullover, einen tollen Mantel ;
• deux verbes au Perfekt : habe … gekauft, habe … gefunden.

LE SAVIEZ-VOUS ?
Autrefois, dans beaucoup de régions germanophones, on portait un costume régional : die Tracht. Il montrait d’où l’on venait. Aujourd’hui, on voit surtout le Dirndl (robe à tablier) et la Lederhose (culotte de cuir), par exemple à l’Oktoberfest de Munich. Selon une règle souvent citée, le nœud du tablier du Dirndl donne une information : noué à gauche, la femme est célibataire ; noué à droite, elle est en couple ou mariée.

À VOUS
Répondez à voix haute, en une phrase chacune, à ces trois questions : Was trägst du am Wochenende? Wo kaufst du deine Kleidung? Was ist dir wichtiger: der Preis oder die Qualität? Modèles : Am Wochenende trage ich lieber Jeans. Ich kaufe meine Kleidung meistens online. Die Qualität ist mir wichtiger als die Marke.

Situation adaptée de Der und mehr (Kennesaw State University), CC BY 4.0.`,
      },
    },

    'a2-einkaufen-service': {
      title: 'Vérifier : que dire à la poste et à la banque ?',
      explanations: {
        q1: 'Envoyer se dit schicken et la destination nach Spanien. Abholen veut dire aller chercher un colis qui vous attend, et aus Spanien indiquerait la provenance.',
        q2: 'Avec un avis de passage (die Benachrichtigung), on vient retirer le colis : Ich möchte ein Paket abholen, en montrant l’avis et la pièce d’identité. Schicken signifierait l’envoyer.',
        q3: 'Retirer de l’argent se dit Geld abheben. Einzahlen signifie déposer, überweisen virer sur un autre compte et umtauschen échanger.',
        q4: 'Avec würde gern, l’infinitif eröffnen va à la fin : Ich würde gern ein Konto eröffnen. Hätte gern s’emploie avec un nom seul (Ich hätte gern ein Konto), sans infinitif.',
        q5: 'Bloquer une carte se dit sperren : Könnten Sie meine Karte bitte sperren? Überweisen (virer) et umtauschen (échanger) ne conviennent pas à une carte perdue.',
        q6: 'Könnten Sie … bitte … wiederholen? est une demande polie : Konjunktiv II et infinitif à la fin. « Sprechen Sie langsam! » est un ordre sec ; les deux autres réponses sont impolies.',
      },
    },

    'a2-einkaufen-bargeld': {
      title: 'Vérifier : lire « Bar oder mit Karte? »',
      explanations: {
        q1: '« Viele Deutsche bezahlen lieber bar als mit Karte, weil sie so besser sehen, wie viel Geld sie ausgeben. » Le texte précise qu’on peut payer par carte dans presque tous les supermarchés.',
        q2: '« Nehmen Sie also immer etwas Bargeld mit! » : petits cafés, boulangeries et marchés affichent parfois « Nur Barzahlung ».',
        q3: 'Le texte traduit lui-même : « also: viel arbeiten und ein Haus bauen ». Schaffe est la forme souabe de schaffen (travailler) et Häusle celle de Häuschen (petite maison).',
        q4: '« Trotzdem wohnt mehr als die Hälfte der Deutschen zur Miete » : malgré le goût de l’épargne, plus de la moitié des Allemands sont locataires. Trotzdem souligne ce contraste.',
        q5: '« In Österreich bezahlen Sie wie in Deutschland mit Euro. In der Schweiz ist die Währung aber der Schweizer Franken. » Les deux pays n’ont donc pas la même monnaie.',
        q6: 'Léa raconte « Ich habe einen Kaffee mit Euro bezahlt und Franken zurückbekommen » et ajoute « Am Ende war das ziemlich teuer! ». Le café a bien accepté les euros, mais à un mauvais taux.',
      },
    },

    'a2-einkaufen-sprechen': {
      kind: 'mission',
      title: 'Mission : faire une réclamation',
      estimatedMinutes: 20,
      competences: ['expression-orale', 'expression-ecrite'],
      lesson: {
        description: `Écoutez Amira, qui rapporte un pull au magasin, puis préparez votre propre réclamation.

MODÈLE
Guten Tag! Ich habe ein Problem mit diesem Pullover. Ich habe ihn letzte Woche hier gekauft, und nach dem ersten Waschen ist er viel zu klein. Dabei habe ich ihn nur mit 30 Grad gewaschen. Hier ist der Kassenbon. Könnten Sie den Pullover bitte umtauschen? Ich hätte gern das gleiche Modell eine Nummer größer, also in Größe M. Und wenn Sie diesen Pullover nicht mehr in M haben, würde ich gern mein Geld zurückbekommen. Vielen Dank!

SITUATIONS AU MAGASIN (choisissez-en une pour l’oral)
• une chemise blanche achetée il y a trois jours : il manque un bouton ;
• des chaussures en cuir trop petites, jamais portées ;
• une montre qui ne fonctionne plus après deux semaines.

POUR PRÉPARER
1. Saluez et dites ce que vous voulez : Ich möchte etwas reklamieren / umtauschen.
2. Dites ce que vous avez acheté et quand : Ich habe diese Uhr vor zwei Wochen hier gekauft.
3. Décrivez le problème : Die Schuhe sind zu klein. An diesem Hemd fehlt ein Knopf. Die Uhr funktioniert nicht mehr.
4. Montrez le ticket : Hier ist der Kassenbon.
5. Demandez poliment une solution : Könnten Sie …? / Ich hätte gern … / Würden Sie …?

Préparez quelques mots-clés : à l’oral, parlez sans lire un texte rédigé.`,
      },
      mission: {
        oral: {
          prompt: 'Choisissez une des trois situations et enregistrez votre réclamation au magasin (une minute environ) : saluez, dites ce que vous avez acheté et quand, décrivez le problème, parlez du ticket et demandez poliment une solution.',
          maxSeconds: 90,
        },
        written: {
          prompt: 'Vous avez commandé un vêtement en ligne et il y a un problème (mauvaise taille, mauvaise couleur ou article abîmé). Écrivez au service client un courriel de 60 à 80 mots : objet « Reklamation – Bestellung Nr. 48213 », formule « Sehr geehrte Damen und Herren, », l’article avec dieser et un adjectif, la date de commande, le problème, votre demande polie et « Mit freundlichen Grüßen ».',
          maxChars: 1000,
          minWords: 60,
        },
        checklist: [
          'J’ai dit ce que j’ai acheté et quand, puis décrit le problème précisément.',
          'J’ai demandé une solution avec Könnten Sie …?, Würden Sie …? ou Ich hätte gern …',
          'Mon courriel commence par « Sehr geehrte Damen und Herren, » et finit par « Mit freundlichen Grüßen ».',
          'J’ai accordé dieser et l’adjectif : diesen blauen Pullover, diese neue Jacke.',
          'J’ai écrit Sie, Ihnen et Ihr avec une majuscule.',
        ],
      },
    },
  },

  add: [
    {
      after: 'a2-einkaufen-dialog',
      activity: {
        id: 'a2-einkaufen-repeter',
        kind: 'exercise',
        title: 'Répéter à voix haute : au magasin et au guichet',
        estimatedMinutes: 8,
        competences: ['expression-orale'],
        lesson: {
          title: 'Répéter à voix haute : au magasin et au guichet',
          description: 'Écoutez chaque modèle, puis dites la phrase à voix haute, sur un ton poli. Faites entendre les voyelles à Umlaut (Größe, hätten, möchte) et placez l’accent sur la particule des verbes séparables (AN-probieren, UM-tauschen). Si la reconnaissance vocale ne comprend pas votre phrase, réécoutez le modèle et réessayez.',
          transcript: null,
        },
        placements: [],
        questions: [
          { id: 'q1', type: 'speak', prompt: 'Écoutez, puis demandez à essayer la veste.',
            text: 'Kann ich diese Jacke anprobieren?', accept: ['Kann ich diese Jacke anprobieren?'], threshold: 75,
            explanation: 'Question fermée : le verbe kann ouvre la phrase et l’infinitif anprobieren la termine. L’accent tombe sur la particule : AN-probieren.' },
          { id: 'q2', type: 'speak', prompt: 'Écoutez, puis demandez la taille au-dessus.',
            text: 'Hätten Sie die Hose eine Nummer größer?', accept: ['Hätten Sie die Hose eine Nummer größer?'], threshold: 75,
            explanation: 'Hätten, au Konjunktiv II, rend la demande polie. Dans größer, le ö se prononce lèvres arrondies, comme « eu » dans « feu ».' },
          { id: 'q3', type: 'speak', prompt: 'Écoutez, puis dites quelle veste vous plaît.',
            text: 'Die dunkelblaue Jacke gefällt mir.', accept: ['Die dunkelblaue Jacke gefällt mir.'], threshold: 75,
            explanation: 'Avec gefallen, la chose est sujet et la personne au datif : … gefällt mir. Le ä de gefällt se dit comme « è ».' },
          { id: 'q4', type: 'speak', prompt: 'Écoutez, puis demandez à échanger le pull.',
            text: 'Ich möchte diesen Pullover umtauschen.', accept: ['Ich möchte diesen Pullover umtauschen.'], threshold: 75,
            explanation: 'Diesen : accusatif masculin. Pullover s’accentue sur la deuxième syllabe, pul-LO-ver, et umtauschen sur la particule, UM-tauschen.' },
          { id: 'q5', type: 'speak', prompt: 'Écoutez, puis demandez un sac poliment.',
            text: 'Könnten Sie mir bitte eine Tüte geben?', accept: ['Könnten Sie mir bitte eine Tüte geben?'], threshold: 75,
            explanation: 'Könnten Sie … + infinitif à la fin : demande polie. Le ü de Tüte se prononce comme le « u » français de « tu ».' },
          { id: 'q6', type: 'speak', prompt: 'Écoutez, puis dites ce que vous voulez faire à la poste.',
            text: 'Ich möchte dieses Paket nach Frankreich schicken.', accept: ['Ich möchte dieses Paket nach Frankreich schicken.'], threshold: 75,
            explanation: 'Dieses Paket : accusatif neutre. Nach + pays sans article pour la destination ; l’infinitif schicken va à la fin, après möchte.' },
        ],
      },
    },
  ],
};
