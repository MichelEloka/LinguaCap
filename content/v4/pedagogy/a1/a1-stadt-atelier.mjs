// Couche pédagogique V4 · A1 · Atelier : guider quelqu’un de la gare à un logement.
const REPEAT = 'Écoutez le modèle, puis dites la phrase à voix haute.';
const speak = (id, text, explanation, accept = [text]) => ({ id, type: 'speak', prompt: REPEAT, text, accept, explanation });
const DICTATION = 'Écoutez et écrivez la phrase.';
const DIALOGUE = { media: 'a1-stadt-atelier-dialogue', usage: 'audio', transcriptVisibility: 'after_answer', decorative: false };

export default {
  module: 'a1-stadt-atelier',
  vocabulary: [
    { id: 'baeckerei', word: 'Bäckerei', article: 'die', plural: 'Bäckereien', partOfSpeech: 'noun', translation: 'la boulangerie', example: 'Gehen Sie bis zur Bäckerei.', note: null },
    { id: 'ecke', word: 'Ecke', article: 'die', plural: 'Ecken', partOfSpeech: 'noun', translation: 'le coin', example: 'Die Bäckerei ist an der Ecke.', note: null },
    { id: 'weg', word: 'Weg', article: 'der', plural: 'Wege', partOfSpeech: 'noun', translation: 'le chemin', example: 'Ich kenne den Weg nicht.', note: null },
    { id: 'adresse', word: 'Adresse', article: 'die', plural: 'Adressen', partOfSpeech: 'noun', translation: 'l’adresse', example: 'Wie ist Ihre Adresse?', note: null },
    { id: 'nummer', word: 'Nummer', article: 'die', plural: 'Nummern', partOfSpeech: 'noun', translation: 'le numéro', example: 'Ich suche die Nummer zwölf.', note: null },
    { id: 'abbiegen', word: 'abbiegen', article: null, plural: null, partOfSpeech: 'verb', translation: 'tourner (dans une rue)', example: 'Hier müssen Sie links abbiegen.', note: 'séparable : ab|biegen — Biegen Sie rechts ab.' },
    { id: 'suchen', word: 'suchen', article: null, plural: null, partOfSpeech: 'verb', translation: 'chercher', example: 'Suchen Sie eine Wohnung?', note: null },
    { id: 'bis', word: 'bis', article: null, plural: null, partOfSpeech: 'preposition', translation: 'jusqu’à', example: 'Gehen Sie bis zur Ampel.', note: 'bis zum Bahnhof (der, das), bis zur Apotheke (die)' },
    { id: 'zuerst', word: 'zuerst', article: null, plural: null, partOfSpeech: 'adverb', translation: 'd’abord', example: 'Gehen Sie zuerst geradeaus.', note: null },
    { id: 'dann', word: 'dann', article: null, plural: null, partOfSpeech: 'adverb', translation: 'ensuite, puis', example: 'Dann biegen Sie rechts ab.', note: 'en tête de phrase, le verbe suit : Dann biegen Sie …' },
    { id: 'dort', word: 'dort', article: null, plural: null, partOfSpeech: 'adverb', translation: 'là, là-bas', example: 'Dort ist die Apotheke.', note: null },
    { id: 'weit', word: 'weit', article: null, plural: null, partOfSpeech: 'adjective', translation: 'loin', example: 'Ist das weit?', note: 'contraire : nah' },
    { id: 'nah', word: 'nah', article: null, plural: null, partOfSpeech: 'adjective', translation: 'proche, près', example: 'Die Apotheke ist ganz nah.', note: null },
  ],
  activities: {
    'a1-stadt-atelier-guide': {
      title: 'Découvrir : l’annonce et le trajet',
      estimatedMinutes: 15,
      lesson: {
        title: 'Découvrir : l’annonce et le trajet',
        description: `GUIDER QUELQU’UN DE LA GARE À UN LOGEMENT · 15 MIN

1. Lire l’annonce (5 min). « Kleine Wohnung in der Lindenstraße 8. Zwei Zimmer, eine Küche, kein Balkon. Fünf Minuten zu Fuß vom Bahnhof. » Repérez l’adresse, le nombre de pièces, ce qu’il y a et ce qu’il n’y a pas. Dites l’annonce en une phrase : « Die Wohnung hat zwei Zimmer und eine Küche, aber es gibt keinen Balkon. »

2. Les directions (5 min). Geradeaus signifie tout droit, links à gauche et rechts à droite. Regardez le plan et lisez le trajet : « Gehen Sie geradeaus bis zur Apotheke. Biegen Sie dort rechts ab. » Abbiegen (tourner) est un verbe séparable : avec Sie, biegen vient en tête et ab se place à la fin de la consigne.

3. Demander et confirmer (5 min). Lisez les deux rôles à voix haute : « Entschuldigung, wo ist die Lindenstraße? » / « Gehen Sie bis zur Apotheke. » / « Und dort links? » / « Nein, dort rechts. ». Relisez la scène en inversant la direction, puis remplacez la pharmacie par un autre repère : bis zum Bahnhof (der Bahnhof → zum), bis zur Bäckerei (die Bäckerei → zur).`,
      },
    },
    'a1-stadt-atelier-pratique': {
      title: 'Comprendre : demander le chemin à la sortie de la gare',
      estimatedMinutes: 12,
      lesson: {
        title: 'Comprendre : demander le chemin à la sortie de la gare',
        description: `ÉCOUTER ET RÉPÉTER · 12 MIN

Une voyageuse sort de la gare et cherche la Rosenstraße. Un passant lui explique le chemin.

MOTS ET FORMULES
• Wie komme ich vom Bahnhof zur Rosenstraße? — Comment aller de la gare à la Rosenstraße ?
• zuerst …, dann … — d’abord …, ensuite …
• die Bäckerei — la boulangerie ; die Apotheke — la pharmacie
• Biege ich hier rechts ab? — Je tourne à droite ici ? (question fermée : le verbe en tête, ab à la fin)
• Dort biegen Sie rechts ab. — Là, tournez à droite.
• gleich neben der Apotheke — juste à côté de la pharmacie

À VOUS
1. Écoutez la scène sans lire la transcription : quelle rue la voyageuse cherche-t-elle, et pourquoi ?
2. Réécoutez et repérez les deux endroits où l’on tourne et la direction prise à chaque fois. Attention : la voyageuse propose une direction, et le passant la corrige.
3. Réécoutez en lisant la transcription, puis répétez chaque réplique du passant pendant une pause.
4. Dites le trajet complet à voix haute, d’une traite, sans lire.`,
      },
    },
    'a1-stadt-atelier-controle': {
      title: 'Vérifier : le chemin et le logement',
      estimatedMinutes: 10,
      lesson: {
        title: 'Vérifier : le chemin et le logement',
        description: 'Écoutez la scène une première fois pour la situation générale. Lisez les questions, puis réécoutez pour les détails. Les deux dernières questions demandent de réemployer les formules du module. La transcription s’affiche après votre réponse.',
      },
      explanations: {
        q1: 'Le passant dit « Gehen Sie zuerst geradeaus bis zur Bäckerei ». La pharmacie ne vient qu’ensuite (« Gehen Sie dann bis zur Apotheke ») et la poste n’est pas citée.',
        q2: 'La voyageuse demande « Biege ich bei der Bäckerei rechts ab? » et le passant corrige : « Nein, links. » C’est plus loin, à la pharmacie, qu’il faut tourner à droite.',
        q3: '« Nein, es sind nur fünf Minuten zu Fuß. » Zu Fuß veut dire « à pied » ; fünf (5) ne doit pas être confondu avec fünfzehn (15).',
        q4: 'La voyageuse dit « Die Wohnung hat zwei Zimmer und einen Balkon ». Ni jardin ni garage ne sont mentionnés.',
        q5: 'Rechts veut dire à droite, et la consigne polie se forme avec biegen … ab : Biegen Sie rechts ab. Links veut dire à gauche ; « Gehen Sie geradeaus » signifie « allez tout droit ».',
        q6: 'Après es gibt, le masculin der Balkon est à l’accusatif : einen Balkon. « Es gibt ein Balkon » oublie la terminaison et « keinen Balkon » dit le contraire.',
      },
    },
    'a1-stadt-atelier-mission': {
      kind: 'mission',
      title: 'Mission : guider une visiteuse jusqu’au logement',
      estimatedMinutes: 20,
      competences: ['expression-orale', 'expression-ecrite'],
      lesson: {
        title: 'Mission : guider une visiteuse jusqu’au logement',
        description: `SITUATION
Vous louez une chambre dans la Gartenstraße 5. Frau Keller arrive en train pour la visiter. Vous ne pouvez pas aller la chercher à la gare : vous lui expliquez le chemin dans un message vocal, puis par écrit.

LE TRAJET
Bahnhof → tout droit jusqu’à la poste (die Post) → à gauche → la deuxième rue à droite : la Gartenstraße → numéro 5, en face du supermarché. À pied : 8 minutes.

LA CHAMBRE
Ein Zimmer (16 m²), eine kleine Küche, ein Bad, kein Balkon. Sehr hell. 390 Euro warm.

MODÈLE (un autre trajet)
Guten Tag, Frau Berg! Gehen Sie vom Bahnhof geradeaus bis zur Bank. Biegen Sie dort rechts ab. Nehmen Sie dann die erste Straße links. Das ist die Lindenstraße. Die Wohnung ist Nummer acht, neben der Apotheke. Das sind nur fünf Minuten zu Fuß. Die Wohnung hat zwei Zimmer. Es gibt eine Küche, aber es gibt keinen Balkon. Bis gleich!`,
      },
      mission: {
        oral: {
          prompt: 'Enregistrez un message vocal pour Frau Keller : saluez-la, expliquez le trajet de la gare à la Gartenstraße 5 en trois consignes au moins (Gehen Sie …, Biegen Sie … ab, Nehmen Sie …), dites combien de minutes il faut à pied, puis décrivez la chambre en deux phrases.',
          maxSeconds: 90,
        },
        written: {
          prompt: 'Écrivez à Frau Keller un message court avec le même trajet, l’adresse exacte, puis une phrase sur ce qu’il y a et une phrase sur ce qu’il n’y a pas dans le logement.',
          maxChars: 600,
          minWords: 25,
        },
        checklist: [
          'Mes consignes suivent l’ordre du trajet : la poste, puis à gauche, puis la deuxième rue à droite.',
          'Chaque consigne commence par le verbe suivi de Sie, et ab termine la consigne avec abbiegen.',
          'J’ai employé zur devant die Post et zum devant un nom en der ou das.',
          'J’ai décrit la chambre avec es gibt et avec keinen, keine ou kein.',
          'J’ai donné le numéro de la maison et le temps de marche (acht Minuten zu Fuß).',
        ],
      },
    },
  },
  add: [
    {
      after: 'a1-stadt-atelier-pratique',
      activity: {
        id: 'a1-stadt-atelier-entrainer',
        kind: 'exercise',
        title: 'S’entraîner : indiquer un trajet et décrire un logement',
        estimatedMinutes: 10,
        competences: ['ecoute', 'expression-ecrite'],
        lesson: {
          title: 'S’entraîner : indiquer un trajet et décrire un logement',
          description: 'Réécoutez la scène de la gare et complétez les notes de la voyageuse, puis réemployez les formules du trajet et du logement. Les deux dernières questions sont des dictées. La transcription de la scène s’affiche après votre réponse.',
          transcript: null,
        },
        placements: [DIALOGUE],
        questions: [
          {
            id: 'q1', type: 'fill', prompt: 'Écoutez la scène et complétez les notes de la voyageuse.',
            text: 'Zuerst geradeaus bis zur [[1]]. Dort [[2]] abbiegen. Dann bis zur [[3]], dort [[4]] abbiegen.',
            blanks: [
              { id: '1', accept: ['Bäckerei'], size: 10, hint: null },
              { id: '2', accept: ['links'], size: 7, hint: null },
              { id: '3', accept: ['Apotheke'], size: 10, hint: null },
              { id: '4', accept: ['rechts'], size: 7, hint: null },
            ],
            explanation: 'Le passant dit « geradeaus bis zur Bäckerei », corrige « Nein, links », puis « Gehen Sie dann bis zur Apotheke. Dort biegen Sie rechts ab. » La voyageuse proposait rechts à la boulangerie : c’est le piège.',
          },
          {
            id: 'q2', type: 'fill', prompt: 'Complétez la fiche du logement d’après la scène. Vous pouvez écrire les nombres en chiffres.',
            text: 'Rosenstraße Nummer [[1]] · [[2]] Zimmer und ein Balkon · [[3]] Minuten zu Fuß',
            blanks: [
              { id: '1', accept: ['12', 'zwölf'], size: 6, hint: null },
              { id: '2', accept: ['2', 'zwei'], size: 6, hint: null },
              { id: '3', accept: ['5', 'fünf'], size: 6, hint: null },
            ],
            explanation: 'On entend « die Nummer zwölf. Die Wohnung hat zwei Zimmer und einen Balkon » et « nur fünf Minuten zu Fuß ». Ne confondez pas zwölf (12) avec zwanzig (20).',
          },
          {
            id: 'q3', type: 'order', prompt: 'Remettez la consigne du passant dans l’ordre.',
            answers: [['Dort', 'biegen', 'Sie', 'rechts', 'ab.']],
            explanation: 'Avec dort en tête, le verbe biegen vient juste après, puis le sujet Sie ; la particule ab de abbiegen se place à la fin. Sans dort, on dirait : Biegen Sie rechts ab.',
          },
          {
            id: 'q4', type: 'fill', prompt: 'Décrivez le logement de l’annonce : complétez avec la bonne forme de ein ou de kein.',
            text: 'Die Wohnung hat zwei Zimmer und [[1]] Küche, aber es gibt [[2]] Balkon.',
            blanks: [
              { id: '1', accept: ['eine'], size: 7, hint: 'die Küche' },
              { id: '2', accept: ['keinen'], size: 7, hint: 'der Balkon' },
            ],
            explanation: 'Die Küche est féminin : eine Küche. Der Balkon est masculin : après es gibt, kein devient keinen. « Es gibt kein Balkon » est une faute fréquente.',
          },
          {
            id: 'q5', type: 'match', prompt: 'Associez chaque question à la réponse qui convient.',
            pairs: [
              { left: 'Wie komme ich zur Rosenstraße?', right: 'Gehen Sie zuerst geradeaus.' },
              { left: 'Biege ich hier rechts ab?', right: 'Nein, links.' },
              { left: 'Ist die Rosenstraße weit?', right: 'Nein, nur fünf Minuten zu Fuß.' },
              { left: 'Wo ist die Nummer zwölf?', right: 'Gleich neben der Apotheke.' },
            ],
            explanation: 'Une question avec wie appelle une indication, une question avec wo un lieu (neben der Apotheke). Les questions fermées (Biege ich …? Ist …?) appellent ja ou nein.',
          },
          {
            id: 'q6', type: 'dictation', prompt: DICTATION, voice: 'mann',
            accept: ['Biegen Sie an der Apotheke links ab.'],
            explanation: 'Abbiegen est séparable : biegen vient en tête avec Sie, ab termine la phrase. Apotheke s’écrit avec th et prend une majuscule.',
          },
          {
            id: 'q7', type: 'dictation', prompt: DICTATION, voice: 'frau',
            accept: ['Es gibt keinen Balkon, aber die Küche ist hell.'],
            explanation: 'Der Balkon est masculin : es gibt keinen Balkon. Après aber, l’ordre des mots ne change pas (die Küche ist), et l’adjectif après ist ne prend pas de terminaison.',
          },
        ],
      },
    },
    {
      after: 'a1-stadt-atelier-entrainer',
      activity: {
        id: 'a1-stadt-atelier-repeter',
        kind: 'exercise',
        title: 'Répéter à voix haute : demander et indiquer le chemin',
        estimatedMinutes: 8,
        competences: ['expression-orale'],
        lesson: {
          title: 'Répéter à voix haute : demander et indiquer le chemin',
          description: 'Écoutez chaque modèle autant de fois que nécessaire, puis dites la phrase sans vous presser. Faites bien entendre la particule ab à la fin des consignes avec abbiegen.',
          transcript: null,
        },
        placements: [],
        questions: [
          speak('q1', 'Entschuldigung, wo ist die Lindenstraße?', 'Entschuldigung est accentué sur -schul-. Dans Lindenstraße, st se dit « cht » et ß se prononce comme ss.'),
          speak('q2', 'Gehen Sie geradeaus bis zur Apotheke.', 'Le verbe en tête suivi de Sie donne une consigne polie, sur une voix qui descend. Dans Apotheke, th se prononce t.'),
          speak('q3', 'Biegen Sie dort rechts ab.', 'Biegen ouvre la consigne et ab la ferme : la particule doit s’entendre. Le ie de biegen est un i long.'),
          speak('q4', 'Ist die Wohnung weit vom Bahnhof?', 'Question fermée : le verbe ist en tête, la voix monte à la fin. Le w de Wohnung et de weit se prononce [v].'),
          speak('q5', 'Nein, nur fünf Minuten zu Fuß.', 'Arrondissez les lèvres pour le ü de fünf. Zu commence par [ts] et Fuß se termine par un s dur.', ['Nein, nur fünf Minuten zu Fuß.', 'Nein, nur 5 Minuten zu Fuß.']),
          speak('q6', 'Die Wohnung hat zwei Zimmer und einen Balkon.', 'Zwei et Zimmer commencent par [ts]. Faites entendre le -en de einen : c’est la marque du masculin après hat.', ['Die Wohnung hat zwei Zimmer und einen Balkon.', 'Die Wohnung hat 2 Zimmer und einen Balkon.']),
        ],
      },
    },
  ],
  order: [
    'a1-stadt-atelier-guide', 'a1-stadt-atelier-pratique', 'a1-stadt-atelier-entrainer', 'a1-stadt-atelier-repeter',
    'a1-stadt-atelier-controle', 'a1-stadt-atelier-mission',
  ],
};
