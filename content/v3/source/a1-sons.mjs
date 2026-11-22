// Les trois premières étapes supposent que l’élève découvre l’allemand.
export default [
  {
    id: 'a1-abc',
    title: 'Das Alphabet · Écouter et épeler son nom',
    goal: 'Identifier les noms des lettres allemandes et épeler correctement un prénom, avec une demande de répétition si nécessaire.',
    native: 'a1-hallo-abc-native',
    guide: `L’ALPHABET ALLEMAND · 20 MIN

Écoutez l’alphabet une première fois en suivant ce tableau. Vous entendrez le nom de chaque lettre. On utilise ces noms pour épeler. Dans un mot, la même lettre peut avoir un autre son.

A B C D E F G | H I J K L M N
O P Q R S T U | V W X Y Z

1. Écouter et pointer (4 min). Suivez du doigt un groupe à la fois. Mettez sur pause après G, puis N, puis U. Reprenez dès que vous pouvez pointer la lettre entendue sans perdre votre place.
2. Répéter par groupes (6 min). Dites les lettres par groupes de trois, avec une respiration. Comparez votre voix au modèle. En particulier, E a un son proche de « é », I de « i » et U de « ou ». Le nom de J est Jot, celui de V est Vau, celui de W ressemble à « vé » et celui de Z à « tsett ».
3. Distinguer lettre et son (5 min). Réécoutez J, V, W et Z. Écrivez quatre petits cartons. Montrez la lettre entendue, puis dites son nom. Quand quelqu’un prononce « vé » en épelant, écrivez W.
4. Passer au prénom (5 min). Épelez LINA, TOM et JANA en suivant l’ordre des lettres. Épelez votre prénom deux fois. Si une lettre résiste, écoutez son groupe et recommencez le prénom entier.`,
    drill: `ENTRAÎNEMENT · 20 MIN

Les quatre signes supplémentaires sont Ä, Ö, Ü et ß. Pour les trois premiers, gardez les deux points lors de la copie. Pour ß, retenez le nom Eszett. Vous pourrez réécouter leurs sons au module suivant. Pendant une dictée vous pouvez écrire en majuscules, puis réécrire le prénom avec une seule initiale majuscule.

1. Rappel (5 min). Masquez le tableau. Dites les quatre groupes aussi loin que possible. Réécoutez seulement le groupe qui pose problème, puis mélangez vos cartons J, V, W et Z.
2. Petites suites (5 min). Préparez quatre suites de trois lettres, par exemple W–E–G, Z–O–E, J–A–N et L–E–A. Lisez chaque suite à voix haute, cachez-la puis écrivez-la de mémoire.
3. Apprendre trois énoncés (5 min). « Wie heißen Sie? » demande le nom poliment. « Ich heiße Jana. » donne le nom. « Wie schreibt man das? » demande comment cela s’écrit. Écoutez le petit dialogue et répétez seulement ces énoncés.
4. Réparer un malentendu (5 min). Apprenez « Noch einmal, bitte. » (encore une fois, s’il vous plaît) et « Langsam, bitte. » (lentement, s’il vous plaît). Dites le nom, arrêtez-vous, puis redonnez-le plus lentement après une de ces demandes.`,
    dialogue: [
      'Guten Tag. Wie heißen Sie?',
      { text: 'Ich heiße Jana. J, A, N, A.', say: 'Ich heiße Jana. Jot. Ah. Enn. Ah.' },
      'Noch einmal, bitte. Langsam, bitte.',
      { text: 'J, A, N, A. Jana.', say: 'Jot. Ah. Enn. Ah. Jana.' },
      'Danke, Jana!',
    ],
    quiz: [
      ['Quel prénom entendez-vous ?', ['Jana', 'Lana', 'Anna'], 'On entend Jana, puis quatre lettres.'],
      ['Quelle lettre la personne épelle-t-elle en premier ?', ['J', 'G', 'Y'], 'Jot est le nom allemand de J.'],
      ['Quelle lettre termine ce prénom ?', ['A', 'E', 'N'], 'La suite entendue est J–A–N–A.'],
      ['Que demande la première personne après la première dictée ?', ['De répéter plus lentement', 'De donner le numéro de téléphone', 'D’écrire un autre prénom'], 'Noch einmal et langsam indiquent une nouvelle écoute à débit plus lent.'],
      ['Quel nom de lettre correspond à W ?', ['Une syllabe proche de « vé »', 'Jot', 'Vau'], 'W et V portent deux noms différents en allemand.'],
      ['Quel signe s’appelle Eszett ?', ['ß', 'Ü', 'Z'], 'Les deux points indiquent un tréma. Eszett désigne ß.'],
    ],
    task: `MISSION · INSCRIPTION À UN COURS · 20 MIN

5 min • Écrivez une petite fiche avec un prénom et un nom fictifs. Notez les deux suites de lettres. Choisissez au moins une lettre parmi J, V, W et Z.
5 min • Jouez l’accueil et la personne qui s’inscrit. Dites votre prénom, puis épelez-le. Demandez à répéter si besoin. Avec un partenaire, il note les lettres sans voir la fiche. Seul, enregistrez-vous, faites une pause, puis transcrivez votre propre audio.
5 min • Comparez. Reprenez seulement le groupe mal entendu, puis enchaînez le nom entier.
5 min • Changez de prénom, fermez la leçon et refaites la scène.

Modèle
– Wie heißen Sie?
– Ich heiße Vera. V, E, R, A.
– Noch einmal, bitte.
– V, E, R, A.

Réussi si les lettres sont dans le bon ordre, si le V et le W restent distincts et si vous savez faire répéter sans lire la formule.`,
  },
  {
    id: 'a1-voyelles',
    title: 'Voyelles · Lire les premiers mots',
    goal: 'Distinguer ä, ö, ü, les suites ei, ie, eu et au, et reproduire des contrastes de voyelles dans des mots courts.',
    soundModel: ['Schon. Schön. Schon, schön.', 'Spät. Käse. Spät, Käse.', 'Buch. Bücher. Buch, Bücher.',
      'Mein. Zwei. Sieben. Hier.', 'Neu. Häuser. Haus. Blau.', 'Bieten. Bitten. Bieten, bitten.',
      'Zwei Bücher. Mein Haus. Hier. Sehr schön.'],
    guide: `DE LA LETTRE AU SON · 20 MIN

Pour prononcer un mot allemand, lisez les groupes de lettres. Un groupe peut correspondre à un seul mouvement de la bouche. Écoutez et reproduisez d’abord des mots entiers.

1. Trémas (6 min). Comparez schon (déjà) et schön (beau). Pour ö, dites « é » en arrondissant les lèvres. Pour ü, partez du « u » de « lune » et gardez les lèvres arrondies. Ä se rapproche souvent d’un è dans les mots appris ici : spät, Käse. Comparez Buch et Bücher en gardant visibles les points.
2. Deux lettres, deux lectures (6 min). Dans mein et zwei, ei se rapproche de « aï ». Dans sieben et hier, ie est un i long. Soulignez chaque paire. Lisez à voix haute « mein Buch », puis « hier ». Évitez de prononcer deux syllabes dans mein.
3. Autres groupes (4 min). Eu et äu se prononcent de façon proche dans neu et Häuser. Au garde le premier son ouvert dans Haus et blau. Alternez chaque série et écoutez votre voyelle.
4. Premiers blocs (4 min). Répétez « zwei Bücher », « mein Haus », « hier », « sehr schön ». Copiez les mots avec leurs points. Relisez un bloc d’une seule respiration.`,
    drill: `ENTENDRE PUIS ÉCRIRE · 20 MIN

1. Classement (5 min). Dessinez six cases (ei, ie, eu/äu, au, ö, ü). Rangez les mots mein, hier, neu, Haus, schön, Bücher, zwei, sieben, Häuser, blau et kühl. Dites chaque mot.
2. I long et i bref (5 min). Comparez bieten et bitten. Dans bieten, le i est tenu. Dans bitten, le i est plus bref. Ne faites pas durer le mot entier. Testez trois répétitions, puis réutilisez sieben dans « sieben Bücher ».
3. Copie avec rappel (5 min). Observez « Mein Buch ist neu. Die Bücher sind hier. ». Masquez, écrivez, comparez. Recopiez seulement le groupe qui a changé ou perdu un tréma.
4. Écoute préparée (5 min). Écoutez la petite scène. Au premier passage, décidez s’il s’agit de livres ou de vêtements. Au deuxième, notez un nombre et une couleur. Au troisième, répétez un début de réplique avec ses deux ou trois mots.`,
    dialogue: [
      'Hier sind meine Bücher. Eins, zwei, drei.',
      'Drei Bücher? Das hier ist mein Buch.',
      'Oh, dein Buch ist blau. Mein Buch ist grün.',
      'Ja. Und das hier? Ist das Buch neu?',
      'Ja. Das neue Buch ist schön.',
    ],
    quiz: [
      ['Combien de livres la première voix compte-t-elle ?', ['Trois', 'Deux', 'Un'], 'Eins, zwei, drei est une suite de trois nombres.'],
      ['Quelle est la couleur du livre désigné par dein Buch ?', ['Bleu', 'Vert', 'Gris'], 'Blau suit dein Buch. Grün décrit l’autre livre.'],
      ['Quel mot veut dire « neuf » dans la question ?', ['neu', 'blau', 'grün'], 'La question « Ist das Buch neu? » porte sur l’état du livre.'],
      ['Quel adjectif clôt la scène ?', ['schön', 'schon', 'spät'], 'Dans « Das neue Buch ist schön », on entend la voyelle arrondie ö.'],
      ['Quel groupe se lit comme un i long ?', ['ie', 'ei', 'eu'], 'Sieben et hier illustrent le i long écrit ie.'],
      ['Quel couple garde les signes attendus ?', ['Buch – Bücher', 'Buch – Bucher', 'Büch – Bucher'], 'Le pluriel Bücher porte ü. Le singulier Buch garde u.'],
    ],
    task: `MISSION · PRÉSENTER DEUX OBJETS · 20 MIN

5 min • Préparez une étiquette « ein blaues Buch » et une étiquette « zwei grüne Bücher ». Recopiez bien les lettres.
5 min • Dites « Mein Buch ist blau. Meine Bücher sind grün. ». Faites entendre blau, grün et Bücher. Répétez avec un autre modèle : « Hier sind zwei Bücher. Mein Buch ist neu. ».
5 min • Mélangez vos étiquettes. Dites un énoncé, puis vérifiez qu’un partenaire peut indiquer la bonne étiquette. Seul, écoutez votre enregistrement et associez-le à la bonne étiquette sans lire vos notes.
5 min • Écrivez puis dites un nouvel exemple qui contient à la fois ei et ie, comme « Hier sind zwei Bücher. ».

Réussi si les nombres et couleurs sont clairs, si Bücher garde ses deux points et si hier et zwei gardent leur contraste.`,
  },
  {
    id: 'a1-rythme',
    title: 'Consonnes et rythme · Se faire comprendre',
    goal: 'Prononcer les consonnes fréquentes dans des mots familiers, marquer les groupes de sens et faire répéter une question simple.',
    soundModel: ['Ja. Das Jahr. Wir. Das Wasser.', 'Vier. Der Vater. Die Vase. Die Zeit. Der Zug.',
      'Die Schule. Schreiben. Der Sport. Die Straße.', 'Ich. Das Buch. Die Nacht.',
      'Wo ist der Bahnhof? Der Bahnhof ist hier. Ist der Bahnhof hier?'],
    guide: `CONSONNES FRÉQUENTES · 20 MIN

1. Écoutez les débuts de mots (6 min). J ressemble au début de « yaourt » dans ja et Jahr. W se rapproche du v français dans wir et Wasser. Dans vier et Vater, V a un son f, mais on entend v dans Vase. Lisez d’abord ces exemples. Z correspond à « ts » dans Zeit et Zug.
2. Comparez deux familles (5 min). Sch se rapproche du ch français dans Schule et schreiben. Les débuts sp et st se lisent souvent « chp » et « cht » au début d’un mot simple, comme Sport et Straße. Dites « die Schule », « der Sport » puis « die Straße ».
3. Comparez ich et Buch (5 min). Dans ich, l’air passe près du palais avec la langue proche du i. Dans Buch et Nacht, le bruit est plus en arrière. Écoutez et essayez doucement. Deux productions compréhensibles suffisent pour commencer.
4. Test court (4 min). Associez ja, was, vier, Zeit, Schule et ich à leur consonne. Dites chaque mot, puis gardez deux mots qui demandent un nouvel essai.`,
    drill: `PRONONCER DES GROUPES · 20 MIN

1. Accent du mot (5 min). Marquez une frappe sur la première syllabe de Wasser et Schule, puis dites le reste plus légèrement. Dites « Wasser, bitte. » d’un seul mouvement.
2. Rythme (5 min). Découpez « Wo ist / der Bahnhof? » et « Der Bahnhof / ist hier. ». Faites une très légère pause à la barre. Mettez le mot important en relief, puis comparez avec une version où chaque mot reçoit le même poids.
3. Questions (5 min). Lisez « Ist der Bahnhof hier? » avec une légère montée finale, puis « Wo ist der Bahnhof? » avec une fin qui redescend. Ce sont deux modèles courants. L’intention et l’accent du mot important comptent aussi.
4. Interaction (5 min). Écoutez la scène une fois pour le lieu. Au deuxième passage, dites le nom du lieu avec la voix. Au troisième, reprenez « Wie bitte? » et la réponse « Ja, gleich hier. ».`,
    dialogue: [
      'Entschuldigung. Ist die Schule hier?',
      'Wie bitte? Die Schule?',
      'Ja. Wo ist die Schule?',
      'Die Schule ist gleich hier, in der Weberstraße.',
      'In der Weberstraße? Vielen Dank!',
    ],
    quiz: [
      ['Quel lieu cherche la première voix ?', ['Une école', 'Une gare', 'Un magasin'], 'Schule est le mot pour école.'],
      ['Quelle expression entend-on pour faire répéter ?', ['Wie bitte?', 'Vielen Dank!', 'Auf Wiedersehen!'], 'Wie bitte? sert à demander une répétition.'],
      ['Dans quelle rue se trouve le lieu ?', ['Weberstraße', 'Wiesenstraße', 'Waldstraße'], 'La réponse et la reprise disent Weberstraße.'],
      ['Le lieu est-il proche ?', ['Oui, tout près', 'Non, dans une autre ville', 'La personne ne sait pas'], 'Gleich hier indique que c’est juste ici.'],
      ['Quel début ressemble à « ts » ?', ['Z dans Zug', 'W dans Wasser', 'J dans Jahr'], 'La consonne z représente ici le groupe de sons ts.'],
      ['Quel mot commence par le son de sch ?', ['Schule', 'Zeit', 'Vater'], 'Dans Schule, le groupe sch rappelle le ch français.'],
    ],
    task: `MISSION · TROUVER UN LIEU · 20 MIN

5 min • Dessinez trois lieux et écrivez leur nom : die Schule, der Bahnhof, der Park. Donnez une rue fictive à chaque lieu.
5 min • Avec un partenaire, demandez un lieu. Votre partenaire demande de répéter une fois. Seul, enregistrez les deux rôles avec quelques secondes de pause.
5 min • Indiquez le lieu en utilisant « gleich hier » et le nom de sa rue. Rejouez avec le lieu suivant. Dites le groupe nominal ensemble, puis ralentissez seulement au passage qui gêne la compréhension.
5 min • Écrivez votre meilleur échange en quatre répliques, puis dites-le de mémoire.

Modèle
– Entschuldigung. Wo ist der Park?
– Wie bitte?
– Der Park. Ist der Park hier?
– Ja, gleich hier.

Réussi si le lieu est identifiable, si le nouvel essai clarifie le mot et si les quatre répliques restent compréhensibles à débit régulier.`,
  },
];
