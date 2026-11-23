// Couche pédagogique V4 · A1 · Herzlichen Glückwunsch ! Famille et fêtes.
const REPEAT = 'Écoutez le modèle, puis dites la phrase à voix haute.';
const speak = (id, text, explanation, accept = [text]) => ({ id, type: 'speak', prompt: REPEAT, text, accept, explanation });

export default {
  module: 'a1-familie',
  grammarFocus: ['possessivartikel'],
  vocabulary: [
    { id: 'familie', word: 'Familie', article: 'die', plural: 'Familien', partOfSpeech: 'noun', translation: 'la famille', example: 'Meine Familie ist groß.', note: null },
    { id: 'vater', word: 'Vater', article: 'der', plural: 'Väter', partOfSpeech: 'noun', translation: 'le père', example: 'Mein Vater heißt Klaus.', note: 'familier : Papa' },
    { id: 'mutter', word: 'Mutter', article: 'die', plural: 'Mütter', partOfSpeech: 'noun', translation: 'la mère', example: 'Meine Mutter heißt Petra.', note: 'familier : Mama' },
    { id: 'eltern', word: 'Eltern', article: 'die', plural: null, partOfSpeech: 'noun', translation: 'les parents', example: 'Meine Eltern wohnen in Köln.', note: 'toujours au pluriel' },
    { id: 'bruder', word: 'Bruder', article: 'der', plural: 'Brüder', partOfSpeech: 'noun', translation: 'le frère', example: 'Ich habe einen Bruder.', note: null },
    { id: 'schwester', word: 'Schwester', article: 'die', plural: 'Schwestern', partOfSpeech: 'noun', translation: 'la sœur', example: 'Meine Schwester ist ledig.', note: null },
    { id: 'geschwister', word: 'Geschwister', article: 'die', plural: null, partOfSpeech: 'noun', translation: 'les frères et sœurs', example: 'Hast du Geschwister?', note: 'toujours au pluriel' },
    { id: 'sohn', word: 'Sohn', article: 'der', plural: 'Söhne', partOfSpeech: 'noun', translation: 'le fils', example: 'Wir haben einen Sohn.', note: null },
    { id: 'tochter', word: 'Tochter', article: 'die', plural: 'Töchter', partOfSpeech: 'noun', translation: 'la fille (enfant)', example: 'Das ist ihre Tochter Lina.', note: null },
    { id: 'kind', word: 'Kind', article: 'das', plural: 'Kinder', partOfSpeech: 'noun', translation: 'l’enfant', example: 'Ich habe ein Kind.', note: null },
    { id: 'grosseltern', word: 'Großeltern', article: 'die', plural: null, partOfSpeech: 'noun', translation: 'les grands-parents', example: 'Wir essen bei meinen Großeltern.', note: 'toujours au pluriel ; familier : Oma und Opa' },
    { id: 'onkel', word: 'Onkel', article: 'der', plural: 'Onkel', partOfSpeech: 'noun', translation: 'l’oncle', example: 'Mein Onkel spielt Gitarre.', note: null },
    { id: 'tante', word: 'Tante', article: 'die', plural: 'Tanten', partOfSpeech: 'noun', translation: 'la tante', example: 'Meine Tante wohnt in Wien.', note: null },
    { id: 'verheiratet', word: 'verheiratet', article: null, plural: null, partOfSpeech: 'adjective', translation: 'marié(e)', example: 'Felix ist verheiratet.', note: null },
    { id: 'ledig', word: 'ledig', article: null, plural: null, partOfSpeech: 'adjective', translation: 'célibataire', example: 'Meine Schwester ist ledig.', note: null },
    { id: 'geburtstag', word: 'Geburtstag', article: 'der', plural: 'Geburtstage', partOfSpeech: 'noun', translation: 'l’anniversaire', example: 'Wann hast du Geburtstag?', note: 'Geburtstag haben : avoir son anniversaire' },
    { id: 'feiern', word: 'feiern', article: null, plural: null, partOfSpeech: 'verb', translation: 'fêter, faire la fête', example: 'Am Sonntag feiern wir zusammen.', note: null },
    { id: 'geschenk', word: 'Geschenk', article: 'das', plural: 'Geschenke', partOfSpeech: 'noun', translation: 'le cadeau', example: 'Ich habe ein Geschenk für dich.', note: null },
    { id: 'einladung', word: 'Einladung', article: 'die', plural: 'Einladungen', partOfSpeech: 'noun', translation: 'l’invitation', example: 'Danke für die Einladung!', note: null },
    { id: 'einladen', word: 'einladen', article: null, plural: null, partOfSpeech: 'verb', translation: 'inviter', example: 'Ich möchte dich zu meiner Party einladen.', note: 'séparable : ein|laden ; ich lade dich ein' },
    { id: 'monat', word: 'Monat', article: 'der', plural: 'Monate', partOfSpeech: 'noun', translation: 'le mois', example: 'Welcher Monat ist das?', note: 'tous les mois sont masculins : der Mai' },
    { id: 'jahr', word: 'Jahr', article: 'das', plural: 'Jahre', partOfSpeech: 'noun', translation: 'l’année, l’an', example: 'Frohes neues Jahr!', note: null },
    { id: 'datum', word: 'Datum', article: 'das', plural: 'Daten', partOfSpeech: 'noun', translation: 'la date', example: 'Welches Datum ist heute?', note: null },
    { id: 'herzlichen-glueckwunsch', word: 'Herzlichen Glückwunsch!', article: null, plural: null, partOfSpeech: 'expression', translation: 'Félicitations ! Joyeux anniversaire !', example: 'Herzlichen Glückwunsch zum Geburtstag!', note: null },
    { id: 'frohe-weihnachten', word: 'Frohe Weihnachten!', article: null, plural: null, partOfSpeech: 'expression', translation: 'Joyeux Noël !', example: 'Frohe Weihnachten und bis bald!', note: null },
  ],
  activities: {
    'a1-familie-wortschatz': { title: 'Découvrir : la famille', estimatedMinutes: 12, lesson: { title: 'Découvrir : la famille' } },
    'a1-familie-aussprache': {
      lesson: {
        description: `Dans « Einzelkind », « Neujahr » ou « Haus », deux voyelles se fondent en un seul son glissé : c’est une diphtongue. Le piège, pour un francophone, est de lire ces lettres comme en français. Lisez les règles, puis écoutez les trois enregistrements de locuteurs natifs et répétez chaque mot.

AU = [aou]
Ouvrez grand la bouche sur « a », puis arrondissez les lèvres vers « ou », dans la même syllabe : das Haus, die Maus, laufen (courir). Ne dites jamais « o » comme dans le français « au » : Haus ne se prononce pas comme « os ».

EI ET AI = [aï]
Partez de « a » et glissez vers « i » : das Einzelkind, der Freitag, im Mai. Ne dites jamais « è » comme dans « neige » : mein, zwei, heiraten (se marier).

EU ET ÄU = [oï]
Partez d’un « o » ouvert et glissez vers « i » : das Neujahr, deutsch, du läufst (tu cours). « eu » ne se prononce jamais comme dans « deux ». « äu » sonne exactement comme « eu » : das Haus → die Häuser, laufen → du läufst.

IE OU EI ? LE PIÈGE
• ie = un « i » long, comme dans « lit » : lieben (aimer), die Geliebte (la bien-aimée), die Schwiegermutter (la belle-mère), das Genie (le génie), das Bier (la bière).
• ei = [aï] : bleiben (rester), der Freitag (le vendredi), schweigen (se taire), langweilig (ennuyeux), heiraten (se marier).
Dans l’enregistrement 2, les mots vont par paires : d’abord un mot en ie, puis un mot en ei.

LES TRIPHTONGUES (POUR LE PLAISIR)
Trois voyelles dans une seule syllabe, surtout dans des onomatopées et quelques verbes : Miau (le miaou du chat), jauchzen (pousser des cris de joie), jaulen (hurler, pour un chien), klauen (piquer, voler : familier), trauen (faire confiance), schauen (regarder), Aua! (Aïe !).

À VOUS
1. Enregistrement 1 : répétez chaque mot en exagérant le glissement : a → ou, a → i, o → i.
2. Enregistrement 2 : répétez les paires. Puis réécoutez sans la transcription et dites pour chaque mot si vous entendez [i] ou [aï].
3. Enregistrement 3 : répétez les triphtongues, puis dites « Aua! » comme si vous vous étiez cogné.
4. Lisez à voix haute, lentement, en vérifiant chaque diphtongue : Mein Bruder heiratet im Mai, an einem Freitag. Die Feier ist im Haus von meiner Tante. Wir singen viele deutsche Lieder.

Enregistrements et images : Deutsch im Blick (COERLL, Université du Texas à Austin), CC BY 4.0.`,
      },
    },
    'a1-familie-dialog': { title: 'Comprendre : les photos de famille', estimatedMinutes: 12, lesson: { title: 'Comprendre : les photos de famille' } },
    'a1-familie-heimat-hoeren': {
      explanations: {
        q1: 'Mehmet conclut « Für mich ist Heimat meine Familie » : sa femme et ses enfants vivent avec lui à Vienne. Izmir compte aussi pour lui, mais pas « seulement » Izmir.',
        q2: '« Meine Mutter und mein Bruder wohnen dort », c’est-à-dire à Izmir. Sa femme et ses enfants sont à Vienne ; il ne parle ni de son père ni d’une sœur.',
        q3: 'Frau Huber dit « ich komme aus einem kleinen Dorf in Tirol » : ein Dorf est un village, klein veut dire petit. Elle habite aujourd’hui à Vienne, mais elle n’en vient pas.',
        q4: '« Meine Schwester wohnt noch im Dorf, und wir feiern zusammen ihren Geburtstag » : elle y va pour l’anniversaire de sa sœur. Ihren renvoie à la sœur : son anniversaire à elle.',
        q5: 'Jonas dit « Meine Eltern sind geschieden. Mein Vater wohnt in Graz und meine Mutter wohnt in Salzburg ». Geschieden = divorcés ; l’autre réponse inverse les deux villes.',
        q6: 'Pour Jonas, « Heimat ist kein Ort » : ce sont « meine Freunde und meine Sprache. Heimat ist ein Gefühl ». Les montagnes et le village, c’est la Heimat de Frau Huber.',
      },
    },
    // La production « ma Heimat » rejoint la mission du module (a1-familie-sprechen), qui garde l’image des idées de Heimat.
    'a1-familie-heimat-sprechen': null,
    'a1-familie-kalender': { title: 'Découvrir : mois, saisons, dates et fêtes', lesson: { title: 'Découvrir : mois, saisons, dates et fêtes' } },
    'a1-familie-natif-wortschatz': { estimatedMinutes: 10 },
    'a1-familie-fotos': {
      estimatedMinutes: 8,
      explanations: {
        q1: 'Le bébé est dans la poussette verte (der Kinderwagen) ; les parents sont assis sur le banc et la fillette se tient debout à côté de son père.',
        q2: 'La mariée en robe blanche avec un bouquet (die Braut) et le marié en costume (der Bräutigam) : c’est un mariage, eine Hochzeit. Rien n’évoque un gâteau, un sapin ou un feu d’artifice.',
        q3: 'La carte montre un gâteau aux fraises avec des bougies (eine Torte), des fleurs et des cadeaux. Le sapin et l’étoile évoquent Noël, les œufs Pâques et le masque le carnaval.',
        q4: 'On lit « Viel Glück zum Geburtstag » à côté du trèfle et de la coccinelle, deux porte-bonheur. Les autres formules servent pour Noël, Pâques ou un mariage.',
      },
    },
    'a1-familie-lesen': {
      explanations: {
        q1: 'Hanna écrit « Ich bin ledig, aber ich habe einen Freund. Er heißt Malik » : ledig = célibataire, et ein Freund désigne ici un petit ami. Elle n’est pas mariée avec Malik.',
        q2: '« Mein Vater ist jedes Jahr ein Pirat » : au carnaval, il se déguise chaque année en pirate. Ce sont les enfants qui cherchent les œufs, à Pâques.',
        q3: 'Hanna écrit « Meine Nichte Ella ist vier » : die Nichte est la nièce. Hanna n’a pas d’enfant ; sa fille se dirait die Tochter.',
        q4: '« Ich habe am 3. Juni Geburtstag » : le point après 3 marque un ordinal, am dritten Juni. Ni mars, ni le 13, ni le 30 juin ne figurent dans le texte.',
        q5: '« Bei uns gibt es Würstchen mit Kartoffelsalat. Das ist unsere Tradition! » : des petites saucisses avec une salade de pommes de terre, le plat du 24 décembre chez Hanna.',
      },
    },
    'a1-familie-hoeren': {
      estimatedMinutes: 12,
      competences: ['ecoute', 'expression-ecrite'],
      lesson: {
        description: 'Écoutez les quatre petites scènes : deux conversations, une fête et un message vocal. Vous pouvez réécouter autant de fois que nécessaire, puis répondez aux questions. Pour finir, écrivez les deux phrases dictées. La transcription s’affichera après votre réponse.',
      },
      explanations: {
        q1: 'Elif répond « Am dreizehnten Mai » : dreizehn = 13, avec l’ordinal en -ten. Ne confondez pas avec dritten (3), ni Mai (mai) avec März (mars).',
        q2: 'Nele dit « Das ist meine Schwester Katja. Und das ist ihr Mann, Sven » : ihr Mann, c’est le mari de Katja (ihr renvoie à une femme). L’oncle, c’est Jürgen, l’homme à la guitare.',
        q3: 'Le compte à rebours à minuit, « Frohes neues Jahr! » et le feu d’artifice (das Feuerwerk) : c’est Silvester, la Saint-Sylvestre.',
        q4: 'Tante Ruth dit « Am Sonntag hat mein Sohn Leo Geburtstag » : le fils de la tante de Finn est son cousin. Ce n’est donc ni son frère ni son fils.',
        q5: '« Bring bitte deinen Ball mit! » : Leo veut jouer au football avec Finn, qui doit apporter son ballon. Mitbringen veut dire apporter ; deinen = ton (accusatif masculin).',
      },
      addQuestions: [
        {
          id: 'q6', type: 'dictation', prompt: 'Écoutez et écrivez la phrase.', voice: 'frau',
          accept: ['Ich habe am dritten Juni Geburtstag.', 'Ich habe am 3. Juni Geburtstag.'],
          explanation: 'Pour une date, am + ordinal en -ten : am dritten Juni. Dritte est irrégulier, comme erste et siebte. Geburtstag est un nom : majuscule.',
        },
        {
          id: 'q7', type: 'dictation', prompt: 'Écoutez et écrivez la phrase.', voice: 'mann',
          accept: ['Seine Frau heißt Julia und ihre Tochter heißt Lina.'],
          explanation: 'Seine Frau : la femme d’un homme (Felix) → sein. Ihre Tochter : la fille du couple → ihr (leur). Frau et Tochter sont féminins, d’où la terminaison -e.',
        },
      ],
    },
    'a1-familie-grammatik': {
      title: 'S’entraîner : possessifs et dates',
      estimatedMinutes: 12,
      lesson: {
        title: 'S’entraîner : possessifs et dates',
        description: 'Choisissez ou écrivez la forme qui complète chaque phrase. Rappel : Das ist mein Bruder. → Ich besuche meinen Bruder. (seul le masculin change à l’accusatif) ; meine devant un nom féminin ou pluriel ; sein = à lui, ihr = à elle ou à eux. Après « am », la date se termine par -ten : am ersten, am dritten, am zwanzigsten.',
      },
      explanations: {
        q1: 'La sœur de votre père est votre tante, die Tante. La cousine serait sa fille, la nièce la fille de votre frère ou de votre sœur.',
        q2: 'Besuchen est suivi de l’accusatif et der Großvater est masculin : mein → meinen. Seul le masculin change à l’accusatif ; meine irait avec un nom féminin.',
        q3: 'On parle du père de Lina, une fille : on emploie ihr (à elle). Vater est masculin et sujet : ihr, sans terminaison. Sein irait si l’enfant était un garçon.',
        q4: 'On s’adresse à plusieurs enfants qu’on tutoie : euer (votre). Devant die Mutter, il prend -e et perd son deuxième e : eure Mutter. Euren serait l’accusatif masculin.',
        q5: 'Après am, l’ordinal se termine par -ten : am dritten Oktober. Dritte est irrégulier, comme erste et siebte : « dreiten » n’existe pas.',
        q6: 'Pour un anniversaire : « Herzlichen Glückwunsch zum Geburtstag! ». Guten Rutsch et Frohes neues Jahr s’emploient au Nouvel An, Frohe Ostern à Pâques.',
      },
      addQuestions: [
        {
          id: 'q7', type: 'fill', prompt: 'Sophie présente sa famille. Complétez avec mein ou meine.',
          text: 'Das sind [[1]] Eltern. [[2]] Vater heißt Klaus und [[3]] Mutter heißt Petra.',
          blanks: [
            { id: '1', accept: ['meine'], size: 7, hint: null },
            { id: '2', accept: ['Mein'], size: 7, hint: null },
            { id: '3', accept: ['meine'], size: 7, hint: null },
          ],
          explanation: 'Mein reste sans terminaison devant un nom masculin sujet (mein Vater) ; il prend -e devant un nom féminin (meine Mutter) et au pluriel (meine Eltern).',
        },
        {
          id: 'q8', type: 'fill', prompt: 'Complétez avec sein, seine, ihr ou ihre.',
          text: 'Felix ist verheiratet. [[1]] Frau heißt Julia. Yasmin studiert in Berlin. [[2]] Bruder heißt Amir.',
          blanks: [{ id: '1', accept: ['Seine'], size: 7, hint: null }, { id: '2', accept: ['Ihr'], size: 7, hint: null }],
          explanation: 'La femme de Felix (un homme) → seine Frau ; le frère de Yasmin (une femme) → ihr Bruder. Le possesseur choisit sein ou ihr, le nom qui suit donne la terminaison.',
        },
        {
          id: 'q9', type: 'fill', prompt: 'Complétez avec la bonne forme du possessif. Attention : für est suivi de l’accusatif.',
          text: 'Hast du ein Geschenk für [[1]] Vater? – Ja, und auch für [[2]] Schwester.',
          blanks: [{ id: '1', accept: ['deinen'], size: 8, hint: 'dein' }, { id: '2', accept: ['meine'], size: 8, hint: 'mein' }],
          explanation: 'Après für, l’accusatif : dein → deinen devant un nom masculin (der Vater). Devant die Schwester, meine ne change pas, car seul le masculin prend -en.',
        },
        {
          id: 'q10', type: 'match', prompt: 'Associez chaque date écrite à sa lecture.',
          pairs: [
            { left: 'am 1. Mai', right: 'am ersten Mai' },
            { left: 'am 3. Oktober', right: 'am dritten Oktober' },
            { left: 'am 7. Juli', right: 'am siebten Juli' },
            { left: 'am 20. Juni', right: 'am zwanzigsten Juni' },
            { left: 'am 24. Dezember', right: 'am vierundzwanzigsten Dezember' },
          ],
          explanation: 'Après am, l’ordinal se termine par -ten jusqu’à 19 (am zweiten) et par -sten à partir de 20 (am zwanzigsten). Erste, dritte et siebte sont irréguliers.',
        },
      ],
    },
    'a1-familie-sprechen': {
      kind: 'mission',
      title: 'Mission : présenter sa famille et inviter à une fête',
      estimatedMinutes: 20,
      competences: ['expression-orale', 'expression-ecrite'],
      lesson: {
        title: 'Mission : présenter sa famille et inviter à une fête',
        description: `Votre groupe d’allemand se retrouve pour la fin de l’année. Chacun présente sa famille en une minute et dit ce qu’est la Heimat pour lui. Ensuite, vous envoyez une invitation pour une fête. Écoutez d’abord Marta.

MODÈLE
Hallo! Ich heiße Marta, ich bin 34 und verheiratet. Mein Mann heißt Jakub, er kommt aus Polen. Wir haben einen Sohn, Oskar. Er ist sechs Jahre alt. Ich habe zwei Geschwister: Mein Bruder Daniel wohnt in München, und meine Schwester Eva ist ledig und wohnt in Wien. Meine Eltern wohnen in Graz. Ich habe am 14. Juni Geburtstag. Im Dezember feiern wir alle zusammen Weihnachten. Das ist unser Lieblingsfest!

L’INVITATION DE MARTA
Liebe Freunde,
am 14. Juni habe ich Geburtstag und ich mache eine Party. Ich lade euch herzlich ein!
Wann? Am 14. Juni um 19 Uhr
Wo? Bei mir, Gartenstraße 8
Bitte antwortet bis zum 7. Juni.
Liebe Grüße
Marta

POUR VOUS AIDER
• Ich bin verheiratet / ledig. Ich habe … Kinder / keine Kinder.
• Ich habe einen Bruder / eine Schwester / … Geschwister. / Ich bin Einzelkind.
• Mein Bruder heißt … Er wohnt in … / Meine Mutter ist …
• Ich habe am … Geburtstag. — Im Dezember feiern wir … Das ist mein Lieblingsfest.
• Heimat ist für mich meine Familie / mein Dorf / meine Sprache / ein Gefühl.`,
      },
      placements: {
        add: [{ media: 'a1-familie-heimat-bild', usage: 'illustration', transcriptVisibility: 'hidden', decorative: false }],
      },
      mission: {
        oral: {
          prompt: 'Présentez votre famille en une minute environ, comme Marta : votre situation, vos frères et sœurs, deux personnes de votre famille (prénom, ville), votre date d’anniversaire et votre fête préférée. Terminez par une phrase sur votre Heimat : « Heimat ist für mich … ».',
          maxSeconds: 90,
        },
        written: {
          prompt: 'Écrivez une invitation à une fête (anniversaire, Noël, Saint-Sylvestre…) sur le modèle de celle de Marta : une formule d’appel, la fête, la date avec am …, l’heure, le lieu, la date limite pour répondre et une formule pour finir.',
          maxChars: 600,
          minWords: 25,
        },
        checklist: [
          'J’ai présenté au moins trois personnes de ma famille avec mein, meine ou meine Eltern.',
          'J’ai employé sein ou ihr au moins une fois (Seine Frau heißt … / Ihr Sohn ist …).',
          'J’ai dit une date avec am + ordinal en -ten (am vierzehnten Juni).',
          'Mon invitation donne la fête, la date, l’heure, le lieu et la date limite de réponse.',
          'Mon invitation commence par Liebe … ou Lieber … et se termine par Liebe Grüße.',
        ],
      },
    },
  },
  add: [
    {
      after: 'a1-familie-grammatik',
      activity: {
        id: 'a1-familie-repeter',
        kind: 'exercise',
        title: 'Répéter à voix haute : la famille et les dates',
        estimatedMinutes: 8,
        competences: ['expression-orale'],
        lesson: {
          title: 'Répéter à voix haute : la famille et les dates',
          description: 'Écoutez chaque modèle autant de fois que nécessaire, puis dites la phrase sans vous presser. Soignez les diphtongues (ei = « aï », eu = « oï ») et la finale -er, qui se dit comme un petit « a » (Bruder, Schwester).',
          transcript: null,
        },
        placements: [],
        questions: [
          speak('q1', 'Hast du Geschwister?', 'Question oui/non : le verbe hast ouvre la phrase et la voix monte à la fin. Dans Geschwister, le w se prononce [v] et la finale -er se dit « a ».'),
          speak('q2', 'Ich habe einen Bruder und eine Schwester.', 'Après haben, l’accusatif : einen Bruder (masculin), eine Schwester (féminin). Dans einen et eine, ei se dit « aï ».'),
          speak('q3', 'Meine Eltern wohnen in Köln.', 'Eltern est toujours au pluriel : meine Eltern, sie wohnen. Dans Köln, le ö est bref, lèvres arrondies, comme dans « œuf ».'),
          speak('q4', 'Wann hast du Geburtstag?', 'Wann (quand) ouvre la question et le verbe hast suit. Accentuez Ge-BURTS-tag ; la voix descend à la fin d’une question en W.'),
          speak('q5', 'Am vierzehnten Juni habe ich Geburtstag.', 'Am + ordinal en -ten pour une date. La date ouvre la phrase : le verbe habe passe avant le sujet ich.', ['Am vierzehnten Juni habe ich Geburtstag.', 'Am 14. Juni habe ich Geburtstag.']),
          speak('q6', 'Herzlichen Glückwunsch zum Geburtstag!', 'La formule complète pour souhaiter un bon anniversaire. Dans Glückwunsch, arrondissez les lèvres sur ü ; l’accent tombe sur GLÜCK-.'),
        ],
      },
    },
  ],
};
