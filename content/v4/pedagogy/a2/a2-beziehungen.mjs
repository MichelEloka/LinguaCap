// Couche pédagogique V4 · a2-beziehungen (lot A7, contenu A2).
// Décrire une personne et parler de ses relations : explications de toutes les questions, terminaisons des adjectifs,
// verbes au datif, verbes pronominaux et souvenirs avec als en exercices typés, répétition validée et mission remise.

export default {
  module: 'a2-beziehungen',
  grammarFocus: ['adjektivendungen', 'verbes-datif', 'verbes-pronominaux', 'als-praeteritum-modalverben'],

  // Sons du kit corrigés : pas de station de radio réelle ni de marque de jouets ; la reporter a une voix féminine.
  media: [
    {
      "key": "a2-beziehungen-hoeren-audio-v3",
      "kind": "audio",
      "title": "Micro-trottoir : comment avez-vous rencontré votre meilleur ami ?",
      "script": [
        {
          "voice": "sprecherin",
          "name": "Reporterin",
          "text": "Guten Tag! Hier ist Ihr Stadtradio. Unser Thema heute: Freundschaft. Wie haben Sie Ihren besten Freund oder Ihre beste Freundin kennengelernt?"
        },
        {
          "pause": 1
        },
        {
          "voice": "frau",
          "name": "Helga",
          "text": "Ich heiße Helga und bin achtundsechzig. Meine beste Freundin Inge kenne ich seit über sechzig Jahren! Wir haben uns in der ersten Klasse kennengelernt. Heute wohnt sie in Hamburg und ich in Leipzig, aber wir telefonieren jeden Sonntag."
        },
        {
          "pause": 0.4
        },
        {
          "voice": "frau",
          "name": "Helga",
          "text": "Für mich ist Ehrlichkeit das Wichtigste. Eine gute Freundin sagt mir die Wahrheit, auch wenn sie nicht schön ist."
        },
        {
          "pause": 1
        },
        {
          "voice": "sprecherin",
          "name": "Reporterin",
          "text": "Vielen Dank! Und Sie?"
        },
        {
          "pause": 0.8
        },
        {
          "voice": "mann",
          "name": "Daniel",
          "text": "Ich bin Daniel. Meinen besten Freund Tarek habe ich vor zehn Jahren im Fußballverein kennengelernt. Er ist ein sehr lustiger Typ, und er ist immer da, wenn man ihn braucht."
        },
        {
          "pause": 0.4
        },
        {
          "voice": "mann",
          "name": "Daniel",
          "text": "Letzten Monat bin ich umgezogen, und Tarek hat mir den ganzen Samstag geholfen. Am Abend haben wir zusammen Pizza gegessen, in der leeren Wohnung, ohne Möbel. Das war toll!"
        },
        {
          "pause": 1
        },
        {
          "voice": "sprecherin",
          "name": "Reporterin",
          "text": "Und Sie? Wer ist Ihr bester Freund?"
        },
        {
          "pause": 0.8
        },
        {
          "voice": "sprecher",
          "name": "Paul",
          "text": "Ich heiße Paul, und die Antwort ist einfach: meine Frau! Wir haben uns vor zwölf Jahren auf einer Party kennengelernt. Ich fand sie sofort sympathisch, aber sie hatte damals einen Freund."
        },
        {
          "pause": 0.4
        },
        {
          "voice": "sprecher",
          "name": "Paul",
          "text": "Ein Jahr später haben wir uns zufällig im Zug wiedergesehen, und dann haben wir uns verliebt. Was mir wichtig ist? Vertrauen. Ohne Vertrauen geht es nicht."
        }
      ],
      "credit": "LinguaCap, synthèse Piper avec Thorsten Müller (CC0) et Kerstin, préentraînée sur la voix de Cori Samuel (Hi-Fi TTS, CC BY 4.0)",
      "license": "Jeux de données des voix : CC0 et CC BY 4.0"
    },
    {
      "key": "a2-beziehungen-kindheit-erzaehlen-audio-v3",
      "kind": "audio",
      "title": "Sophie et Malik parlent de leur enfance",
      "script": [
        {
          "voice": "frau",
          "name": "Sophie",
          "text": "Schau mal, Malik, ich habe ein altes Foto gefunden. Das bin ich mit acht Jahren!"
        },
        {
          "pause": 0.6
        },
        {
          "voice": "mann",
          "name": "Malik",
          "text": "Wie süß! Und wer ist der Junge neben dir?"
        },
        {
          "pause": 0.6
        },
        {
          "voice": "frau",
          "name": "Sophie",
          "text": "Das ist Ben, mein bester Freund aus der Grundschule. Wir haben jeden Nachmittag zusammen gespielt."
        },
        {
          "pause": 0.6
        },
        {
          "voice": "mann",
          "name": "Malik",
          "text": "Was habt ihr denn gespielt?"
        },
        {
          "pause": 0.6
        },
        {
          "voice": "frau",
          "name": "Sophie",
          "text": "Meistens Fußball im Park. Und wenn es geregnet hat, haben wir mit Bauklötzen gebaut."
        },
        {
          "pause": 0.6
        },
        {
          "voice": "mann",
          "name": "Malik",
          "text": "Durftest du allein in den Park gehen?"
        },
        {
          "pause": 0.6
        },
        {
          "voice": "frau",
          "name": "Sophie",
          "text": "Ja, aber ich musste um sieben Uhr zu Hause sein. Und du? Wie war deine Kindheit?"
        },
        {
          "pause": 0.6
        },
        {
          "voice": "mann",
          "name": "Malik",
          "text": "Ich bin in Marseille aufgewachsen. Wir hatten keinen Garten, aber ich hatte zwei große Brüder. Ich musste immer ihre alten Pullover tragen!"
        },
        {
          "pause": 0.6
        },
        {
          "voice": "frau",
          "name": "Sophie",
          "text": "Ach, du Armer! Und was wolltest du werden?"
        },
        {
          "pause": 0.6
        },
        {
          "voice": "mann",
          "name": "Malik",
          "text": "Pilot! Als ich zehn war, bin ich zum ersten Mal geflogen, zu meinen Großeltern nach Tunis. Das war ein ganz besonderer Tag."
        },
        {
          "pause": 0.6
        },
        {
          "voice": "frau",
          "name": "Sophie",
          "text": "Und heute arbeitest du im Büro!"
        },
        {
          "pause": 0.6
        },
        {
          "voice": "mann",
          "name": "Malik",
          "text": "Tja. Aber ich fliege immer noch sehr gern!"
        }
      ],
      "credit": "LinguaCap, synthèse Piper avec Thorsten Müller (CC0) et Kerstin, préentraînée sur la voix de Cori Samuel (Hi-Fi TTS, CC BY 4.0)",
      "license": "Jeux de données des voix : CC0 et CC BY 4.0"
    }
  ],

  vocabulary: [
    { id: 'aussehen', word: 'aussehen', article: null, plural: null, partOfSpeech: 'verb', translation: 'avoir l’air, ressembler à',
      example: 'Wie soll er denn aussehen?', note: 'séparable : aus|sehen — Wie sieht er aus?' },
    { id: 'aussehen-nom', word: 'Aussehen', article: 'das', plural: null, partOfSpeech: 'noun', translation: 'l’apparence, l’aspect',
      example: 'Für mich ist das Aussehen nicht so wichtig.', note: null },
    { id: 'haar', word: 'Haar', article: 'das', plural: 'Haare', partOfSpeech: 'noun', translation: 'le cheveu ; les cheveux (pluriel)',
      example: 'Sie hat lange blonde Haare.', note: 'on dit surtout die Haare, au pluriel' },
    { id: 'brille', word: 'Brille', article: 'die', plural: 'Brillen', partOfSpeech: 'noun', translation: 'les lunettes',
      example: 'Jonas trägt eine Brille.', note: 'un singulier en allemand : eine Brille' },
    { id: 'bart', word: 'Bart', article: 'der', plural: 'Bärte', partOfSpeech: 'noun', translation: 'la barbe',
      example: 'Mein Onkel hat einen langen Bart.', note: null },
    { id: 'schlank', word: 'schlank', article: null, plural: null, partOfSpeech: 'adjective', translation: 'mince',
      example: 'Er ist groß und schlank.', note: 'plus poli que dünn' },
    { id: 'freundlich', word: 'freundlich', article: null, plural: null, partOfSpeech: 'adjective', translation: 'aimable',
      example: 'Die Nachbarin von oben ist immer freundlich.', note: null },
    { id: 'lustig', word: 'lustig', article: null, plural: null, partOfSpeech: 'adjective', translation: 'drôle, amusant',
      example: 'Jonas ist lustig, aber am Anfang ein bisschen schüchtern.', note: null },
    { id: 'hilfsbereit', word: 'hilfsbereit', article: null, plural: null, partOfSpeech: 'adjective', translation: 'serviable',
      example: 'Mein Kollege ist sehr hilfsbereit.', note: null },
    { id: 'ehrlich', word: 'ehrlich', article: null, plural: null, partOfSpeech: 'adjective', translation: 'honnête, franc',
      example: 'Eine gute Freundin ist ehrlich.', note: null },
    { id: 'geduldig', word: 'geduldig', article: null, plural: null, partOfSpeech: 'adjective', translation: 'patient',
      example: 'Ein Lehrer muss geduldig sein.', note: 'contraire : ungeduldig' },
    { id: 'schuechtern', word: 'schüchtern', article: null, plural: null, partOfSpeech: 'adjective', translation: 'timide',
      example: 'Am Anfang war sie ein bisschen schüchtern.', note: 'contraire : offen' },
    { id: 'gesellig', word: 'gesellig', article: null, plural: null, partOfSpeech: 'adjective', translation: 'sociable',
      example: 'Mein Bruder ist gesellig und geht gern auf Partys.', note: null },
    { id: 'bekannte', word: 'Bekannte', article: 'der', plural: 'Bekannten', partOfSpeech: 'noun', translation: 'la connaissance (personne)',
      example: 'Er ist ein guter Bekannter von mir.', note: 'se décline comme un adjectif : ein Bekannter, eine Bekannte' },
    { id: 'kollege', word: 'Kollege', article: 'der', plural: 'Kollegen', partOfSpeech: 'noun', translation: 'le collègue',
      example: 'Ich habe einen sehr netten Kollegen.', note: 'accusatif et datif : den / dem Kollegen ; féminin : die Kollegin' },
    { id: 'nachbar', word: 'Nachbar', article: 'der', plural: 'Nachbarn', partOfSpeech: 'noun', translation: 'le voisin',
      example: 'Unser Nachbar ist heute schlecht gelaunt.', note: 'accusatif et datif : den / dem Nachbarn ; féminin : die Nachbarin' },
    { id: 'kumpel', word: 'Kumpel', article: 'der', plural: 'Kumpels', partOfSpeech: 'noun', translation: 'le pote, le copain',
      example: 'Am Samstag treffe ich meinen Kumpel.', note: 'familier, sans forme féminine' },
    { id: 'freundschaft', word: 'Freundschaft', article: 'die', plural: 'Freundschaften', partOfSpeech: 'noun', translation: 'l’amitié',
      example: 'In einer Freundschaft ist Vertrauen wichtig.', note: null },
    { id: 'einladung', word: 'Einladung', article: 'die', plural: 'Einladungen', partOfSpeech: 'noun', translation: 'l’invitation',
      example: 'Ich danke dir für die Einladung.', note: null },
    { id: 'einladen', word: 'einladen', article: null, plural: null, partOfSpeech: 'verb', translation: 'inviter',
      example: 'Ich möchte dich zu meiner Party einladen.', note: 'séparable : ein|laden · du lädst ein' },
    { id: 'kennenlernen', word: 'kennenlernen', article: null, plural: null, partOfSpeech: 'verb', translation: 'faire la connaissance de',
      example: 'Ich möchte deine Freunde gern kennenlernen.', note: 'Perfekt : Wir haben uns im Tanzkurs kennengelernt.' },
    { id: 'sich-treffen', word: 'sich treffen', article: null, plural: null, partOfSpeech: 'verb', translation: 'se retrouver, se voir',
      example: 'Die Kollegen treffen sich oft in der Mittagspause.', note: 'wir treffen uns · Perfekt : haben sich getroffen' },
    { id: 'sich-freuen', word: 'sich freuen', article: null, plural: null, partOfSpeech: 'verb', translation: 'se réjouir',
      example: 'Alle freuen sich auf das Wochenende.', note: 'auf + accusatif : à venir · über + accusatif : déjà là' },
    { id: 'sich-verabreden', word: 'sich verabreden', article: null, plural: null, partOfSpeech: 'verb', translation: 'se donner rendez-vous',
      example: 'Sie wollen sich zum Mittagessen verabreden.', note: 'Perfekt : haben sich verabredet' },
    { id: 'sich-verlieben', word: 'sich verlieben', article: null, plural: null, partOfSpeech: 'verb', translation: 'tomber amoureux',
      example: 'Vielleicht verlieben sie sich auf der Party.', note: 'in + accusatif : Sie hat sich in Jonas verliebt.' },
    { id: 'gefallen', word: 'gefallen', article: null, plural: null, partOfSpeech: 'verb', translation: 'plaire',
      example: 'Wie hat dir die Party gefallen?', note: '+ datif : Die Arbeit gefällt mir.' },
    { id: 'helfen', word: 'helfen', article: null, plural: null, partOfSpeech: 'verb', translation: 'aider',
      example: 'Kannst du mir bitte helfen?', note: '+ datif · du hilfst' },
    { id: 'gehoeren', word: 'gehören', article: null, plural: null, partOfSpeech: 'verb', translation: 'appartenir',
      example: 'Die Jacke soll meiner Schwester gehören.', note: '+ datif : Wem gehört die Jacke?' },
    { id: 'danken', word: 'danken', article: null, plural: null, partOfSpeech: 'verb', translation: 'remercier',
      example: 'Wir möchten dir für die Hilfe danken.', note: '+ datif, et für + accusatif pour la raison' },
  ],

  activities: {
    'a2-beziehungen-wortschatz': {
      title: 'Découvrir : décrire l’apparence et le caractère',
    },

    'a2-beziehungen-native-wortschatz': {
      title: 'Écouter et répéter : les gens qu’on connaît (voix natives)',
    },

    'a2-beziehungen-aussprache': {
      lesson: {
        description: `En allemand, la syllabe -er en fin de mot ne se prononce pas « èr » comme dans « la mer ». Le r y devient presque une voyelle : un « a » sombre et bref, la bouche à peine ouverte, la langue au repos, que l’on note [ɐ]. Ainsi, der Lehrer se dit à peu près « léra », aber « aba », Peter « péta ». Après une voyelle longue, le r final se vocalise de la même façon : das Bier, vier, der.

APRÈS UNE DIPHTONGUE
Quand -er suit une diphtongue, celle-ci glisse directement vers ce « a » sombre, sans r roulé ni r raclé :
• ei + er : die Eier (les œufs), die Feier (la fête) — « aï-a »
• eu + er : euer (votre, à vous), das Feuer (le feu) — « oï-a »
• au + er : der Bauer (le paysan), sauer (acide ; fâché), dauern (durer) — « aou-a » ; dans dauern, -ern se réduit à « an ».

LES PIÈGES POUR UN FRANCOPHONE
• Ne prononcez pas le r à la française au bout du mot : Feuer ne rime pas avec « peur ».
• Ne remplacez pas -er par « é » : die Eier ne se dit pas « aïé ».
• Gardez bien les diphtongues : ei = « aï », eu = « oï », au = « aou ». Elles seules distinguent die Feier (la fête) de das Feuer (le feu).
• L’accent tombe sur la diphtongue, jamais sur -er : FEUer, BAUer, DAUern.
• Dans le troisième enregistrement, z se prononce « ts » (Schweizer, schwitzt) et ß se prononce « s » (Schweißer, schweißt) : ne les confondez pas !

ENREGISTREMENT 1 : LA LISTE
die Eier, die Feier — euer, das Feuer — Bauer, sauer, dauern

ENREGISTREMENT 2 : UN VIRELANGUE, DIT DEUX FOIS
Bierbrauer Bauer braut braunes Bier. (Le brasseur Bauer brasse de la bière brune.) Écoutez le r final vocalisé dans Bier, Brauer et Bauer.

ENREGISTREMENT 3 : UN VIRELANGUE EN TROIS PHRASES
Der Schweizer Schweißer schwitzt und schweißt. Der Schweizer Schwitzer schweißt und schwitzt. Schwitzend schweißt der Schweizer Schweißer. (Le soudeur suisse transpire et soude…) Écoutez le -er de Schweizer, Schweißer et Schwitzer.

À VOUS
1. Écoutez la liste, puis répétez chaque mot en ouvrant à peine la bouche pour le -er.
2. Opposez les paires à voix haute : die Feier – das Feuer ; die Eier – euer. Exagérez la différence entre « aï » et « oï ».
3. Dites les virelangues lentement, puis de plus en plus vite, en imitant la mélodie du locuteur.
4. Lisez à voix haute ces phrases du module : Ich freue mich auf die Feier! Wie lange dauert eure Party? Unser Nachbar ist heute sauer. Mein Partner ist ein guter Bekannter von Peter.
L’exercice « Répéter à voix haute » qui suit vérifie votre prononciation sur plusieurs de ces phrases.

Enregistrements et images : Deutsch im Blick (COERLL, Université du Texas à Austin), CC BY 4.0.`,
      },
    },

    'a2-beziehungen-dialog': {
      title: 'Comprendre : le nouveau collègue de Malik',
    },

    'a2-beziehungen-einladen': {
      title: 'Comprendre : inviter, accepter, refuser poliment',
    },

    'a2-beziehungen-lesen': {
      title: 'Vérifier : lire un forum pour se faire des amis',
      explanations: {
        q1: 'Camille écrit « wohne seit drei Monaten in Leipzig ». Seit + datif indique depuis quand dure la situation : trois mois, ni trois semaines ni un an.',
        q2: '« Am Wochenende bin ich oft allein » : c’est son problème. Elle dit au contraire que la ville lui plaît (« Die Stadt gefällt mir sehr ») et que ses collègues sont gentils.',
        q3: 'Tobi s’est inscrit dans un club de course (Laufverein) : « So habe ich meinen besten Freund Ali kennengelernt. » Le café des langues est la proposition de Mira, pas le lieu de la rencontre de Tobi.',
        q4: 'Tobi l’explique avec denn : « Beim Sport ist es leicht, denn man redet ganz natürlich miteinander. » Il ne parle ni de santé, ni de prix, ni de l’âge des membres.',
        q5: 'Mira écrit : « Jeden Donnerstag treffen sich dort Leute aus vielen Ländern und sprechen Deutsch, Französisch oder Spanisch. » Il ne s’agit pas d’un cours donné par un professeur.',
        q6: 'Selon Mira, certains Allemands « brauchen ein bisschen Zeit, bis sie „Freund“ sagen » ; au début, on est une « Bekannte ». Puis : « Wenn jemand „Freund“ sagt, dann meint er es ernst! »',
      },
    },

    'a2-beziehungen-hoeren': {
      title: 'Vérifier : écouter un micro-trottoir sur l’amitié',
      explanations: {
        q1: 'Helga dit « Wir haben uns in der ersten Klasse kennengelernt » : elle connaît Inge depuis plus de soixante ans. Les dix et douze ans concernent les deux autres passants.',
        q2: '« Für mich ist Ehrlichkeit das Wichtigste » : une bonne amie dit la vérité. La confiance (Vertrauen) est la valeur citée par Paul, pas par Helga.',
        q3: 'Daniel : « Meinen besten Freund Tarek habe ich vor zehn Jahren im Fußballverein kennengelernt. » La fête (Party) est le lieu où Paul a rencontré sa femme.',
        q4: '« Letzten Monat bin ich umgezogen, und Tarek hat mir den ganzen Samstag geholfen » : umziehen veut dire déménager. La pizza a été mangée après, dans l’appartement vide.',
        q5: 'Paul explique : « Ich fand sie sofort sympathisch, aber sie hatte damals einen Freund. » Elle avait un petit ami ; lui la trouvait sympathique tout de suite.',
        q6: '« Ein Jahr später haben wir uns zufällig im Zug wiedergesehen » : ils se sont revus par hasard dans le train. La fête est le lieu de leur première rencontre.',
      },
      addQuestions: [
        { id: 'q7', type: 'dictation', prompt: 'Daniel parle de son ami Tarek : écoutez et écrivez sa phrase.',
          accept: ['Er ist immer da, wenn man ihn braucht.'], voice: 'mann',
          explanation: 'Wenn introduit une subordonnée : le verbe braucht va à la fin. Ihn est l’accusatif de er : on a besoin de lui (jemanden brauchen).' },
      ],
    },

    'a2-beziehungen-native-hoeren': {
      title: 'Vérifier : écouter « Es wird ernst » (voix native)',
      explanations: {
        q1: 'Fern signifie « loin » : die Fernbeziehung est une relation à distance. Die Beziehungen n’est que le pluriel de « relation », et die Heirat, die Hochzeiten parlent du mariage.',
        q2: 'On entend « Darf ich dich küssen? » puis « Kann ich dich in den Arm nehmen? » (puis-je te prendre dans mes bras ?). La réponse d) commence pareil, mais sa seconde question n’est pas dans l’enregistrement.',
        q3: '« Du siehst toll aus » (tu es superbe) est le compliment entendu dans l’enregistrement. « Du siehst müde aus » veut dire « tu as l’air fatigué » : ce n’est pas un compliment.',
        q4: '« Liebe auf den ersten Blick » : l’amour au premier regard (der Blick), c’est le coup de foudre. Kuss (baiser) et Tag (jour) ne forment pas cette expression.',
        q5: 'Une alliance se met au doigt le jour du mariage : bei der Hochzeit. Die Scheidung (le divorce) et die Trennung (la séparation) marquent au contraire la fin d’un couple.',
        q6: 'Les couples accrochent ces cadenas (Liebesschlösser) gravés de leurs prénoms : ils symbolisent l’amour, die Liebe. Der Streit (la dispute) et die Scheidung en sont le contraire.',
      },
    },

    'a2-beziehungen-kindheit-lesen': {
      title: 'Vérifier : lire le souvenir d’une amitié d’enfance',
      lesson: {
        description: `Le magazine en ligne « Freunde fürs Leben » (Des amis pour la vie) publie des souvenirs de ses lecteurs. Lisez le témoignage de Lea, puis répondez aux questions.

POUR BIEN LIRE
• Als ich fünf Jahre alt war, … — Quand j’avais cinq ans, … (« als » : un moment précis du passé, verbe à la fin)
• wir durften — nous avions le droit de ; wir mussten — nous devions ; sie wollte … werden — elle voulait devenir …
• es gab — il y avait ; damals — à l’époque
• der Sandkasten — le bac à sable ; nebenan — d’à côté ; der Brief — la lettre ; weinen — pleurer

FREUNDINNEN SEIT DEM SANDKASTEN

Ich heiße Lea, bin vierunddreißig und wohne in Kassel. Als ich fünf Jahre alt war, sind meine Eltern mit mir in ein Haus mit Garten gezogen. Am ersten Tag habe ich im Garten nebenan ein Mädchen gesehen. Sie hat im Sandkasten gesessen und mit kleinen Figuren gespielt. Das war Mira. Ich war sehr schüchtern, aber Mira hat einfach gefragt: „Willst du mitspielen?“ Von diesem Tag an waren wir beste Freundinnen.

Wir waren immer zusammen. Nach der Schule durften wir draußen spielen, aber um sechs Uhr mussten wir zu Hause sein. Am Abend haben wir dann beide das Sandmännchen im Fernsehen gesehen. Am Wochenende durfte ich manchmal bei Mira schlafen. Wir hatten große Pläne: Mira wollte Tierärztin werden, und ich wollte Astronautin werden.

Als wir zwölf waren, hat Miras Vater eine Stelle in Graz gefunden, und die Familie ist nach Österreich gezogen. Wir haben beide geweint. Damals gab es noch keine Smartphones. Also haben wir uns Briefe geschrieben, jede Woche einen!

Heute ist Mira wirklich Tierärztin. Ich bin nicht Astronautin geworden, sondern Lehrerin. Wir sehen uns nur zweimal im Jahr, aber wir telefonieren jeden Sonntag. Eine Freundin aus der Kindheit kennt dich besser als alle anderen Menschen. Mira weiß alles über mich, und ich weiß alles über sie!

LE SAVIEZ-VOUS ?
Le petit marchand de sable, das Sandmännchen, est un personnage des histoires du soir : depuis 1959, une courte émission de la télévision allemande le montre chaque soir en train de souhaiter bonne nuit aux enfants. Pendant la division du pays, il y en avait une version à l’Ouest et une à l’Est.

Situation adaptée de Der und mehr (Kennesaw State University), CC BY 4.0.`,
      },
      explanations: {
        q1: '« Am ersten Tag habe ich im Garten nebenan ein Mädchen gesehen … Mira hat einfach gefragt: „Willst du mitspielen?“ » Elles se rencontrent chez elles, pas à l’école ni en vacances.',
        q2: '« Nach der Schule durften wir draußen spielen, aber um sechs Uhr mussten wir zu Hause sein. » Mussten (prétérit de müssen) exprime l’obligation ; ni devoirs ni coucher ne sont cités.',
        q3: '« Mira wollte Tierärztin werden, und ich wollte Astronautin werden. » Lea est devenue enseignante (Lehrerin), mais enfant, elle rêvait d’être astronaute ; vétérinaire était le rêve de Mira.',
        q4: '« Als wir zwölf waren, hat Miras Vater eine Stelle in Graz gefunden » : die Stelle, c’est un emploi. La famille a déménagé pour le travail du père, pas pour l’école de Mira.',
        q5: '« Damals gab es noch keine Smartphones. Also haben wir uns Briefe geschrieben, jede Woche einen! » Ni messages ni e-mails : une lettre (der Brief) par semaine.',
        q6: '« Wir sehen uns nur zweimal im Jahr, aber wir telefonieren jeden Sonntag » et « Mira weiß alles über mich ». Elles vivent dans deux villes, et Mira est vétérinaire, pas enseignante.',
      },
    },

    'a2-beziehungen-kindheit-erzaehlen': {
      title: 'Comprendre : raconter un souvenir d’enfance',
      estimatedMinutes: 12,
      competences: ['ecoute', 'lecture', 'expression-orale'],
      lesson: {
        description: `Sophie et Malik regardent une vieille photo et parlent de leur enfance. Écoutez la scène une première fois sans lire, puis une deuxième fois en suivant le texte.

MODÈLE
Sophie : Schau mal, Malik, ich habe ein altes Foto gefunden. Das bin ich mit acht Jahren!
Malik : Wie süß! Und wer ist der Junge neben dir?
Sophie : Das ist Ben, mein bester Freund aus der Grundschule. Wir haben jeden Nachmittag zusammen gespielt.
Malik : Was habt ihr denn gespielt?
Sophie : Meistens Fußball im Park. Und wenn es geregnet hat, haben wir mit Bauklötzen gebaut.
Malik : Durftest du allein in den Park gehen?
Sophie : Ja, aber ich musste um sieben Uhr zu Hause sein. Und du? Wie war deine Kindheit?
Malik : Ich bin in Marseille aufgewachsen. Wir hatten keinen Garten, aber ich hatte zwei große Brüder. Ich musste immer ihre alten Pullover tragen!
Sophie : Ach, du Armer! Und was wolltest du werden?
Malik : Pilot! Als ich zehn war, bin ich zum ersten Mal geflogen, zu meinen Großeltern nach Tunis. Das war ein ganz besonderer Tag.
Sophie : Und heute arbeitest du im Büro!
Malik : Tja … Aber ich fliege immer noch sehr gern!

POUR RACONTER
• als = quand, pour un moment unique du passé ; le verbe va à la fin : Als ich zehn war, bin ich zum ersten Mal geflogen.
• wenn = quand, chaque fois que (une habitude) : Wenn es geregnet hat, haben wir drinnen gespielt.
• Avec sein, haben et les verbes de modalité, on emploie surtout le prétérit : ich war, ich hatte, ich musste (je devais), ich durfte (j’avais le droit), ich wollte (je voulais), ich konnte (je pouvais, je savais). Pas de terminaison à la 1re et à la 3e personne du singulier : ich musste, er musste ; mais du musstest, wir mussten, ihr musstet. Vous les reverrez en détail dans le module sur Berlin.
• Pour les autres verbes, le parfait : Wir haben Fußball gespielt. Ich bin in Marseille aufgewachsen.

REPÉREZ
Dans le dialogue, relevez la phrase qui commence par als, deux verbes de modalité au prétérit et la question qui relance la conversation (Und du? Wie war deine Kindheit?).

À VOUS
Répondez à voix haute à ces questions, par des phrases complètes, en reliant vos idées avec weil, als, wenn ou aber :
• Was war dein Lieblingsspielzeug?
• Wer war dein bester Freund oder deine beste Freundin?
• Was musstest du zu Hause machen? Was durftest du nicht?
• Was wolltest du werden?
Modèle : Ich durfte nicht lange fernsehen, weil meine Eltern das nicht gut fanden. Vous raconterez un souvenir dans la mission de l’atelier qui suit ce module.

Situation adaptée de Der und mehr (Kennesaw State University), CC BY 4.0.`,
      },
    },

    'a2-beziehungen-grammatik': {
      title: 'S’entraîner : adjectifs, datif et verbes pronominaux',
      estimatedMinutes: 12,
      competences: ['lecture', 'ecoute', 'expression-ecrite'],
      lesson: {
        description: `Complétez, associez, remettez dans l’ordre ou choisissez la forme correcte, puis écrivez la phrase dictée.

RAPPELS
• Après der/die/das : -e au nominatif singulier (der nette Kollege), -en à l’accusatif masculin (den netten Kollegen) et au pluriel.
• Après ein/eine/kein/mein : ein netter Freund (masculin), eine nette Freundin (féminin), ein nettes Kind (neutre), einen netten Freund (accusatif masculin).
• Gefallen, helfen, gehören et danken + datif : mir, dir, ihm, ihr, uns, euch, ihnen ; meinem Bruder, meiner Schwester.
• Verbes pronominaux : ich freue mich, du freust dich, er/sie freut sich, wir treffen uns, ihr trefft euch.
• Souvenirs : Als ich klein war, durfte ich … / musste ich … (verbe conjugué à la fin après als).`,
      },
      removeQuestions: ['q1', 'q2', 'q3', 'q4', 'q6', 'q8'],
      explanations: {
        q5: 'Quelqu’un qui dit toujours la vérité est ehrlich (honnête). Après eine, au nominatif féminin, l’adjectif prend -e : eine ehrliche Freundin. Ehrlicher est la forme du masculin (ein ehrlicher Freund).',
        q7: 'Helfen se construit avec le datif : jemandem helfen. Le datif de ich est mir. Mich est l’accusatif, qui ne convient pas après helfen.',
      },
      addQuestions: [
        { id: 'q9', type: 'fill', prompt: 'Complétez les adjectifs à l’accusatif.',
          text: 'Ich habe einen [[1]] Kollegen und eine [[2]] Kollegin.',
          blanks: [{ id: '1', accept: ['netten'], size: 8, hint: 'nett' }, { id: '2', accept: ['lustige'], size: 8, hint: 'lustig' }],
          explanation: 'Haben demande l’accusatif. Au masculin, einen appelle -en : einen netten Kollegen. Au féminin, l’accusatif est identique au nominatif : eine lustige Kollegin.' },
        { id: 'q10', type: 'fill', prompt: 'Complétez l’adjectif, puis le pronom au datif.',
          text: 'Der [[1]] Nachbar von oben hilft [[2]] oft.',
          blanks: [{ id: '1', accept: ['freundliche'], size: 12, hint: 'freundlich' }, { id: '2', accept: ['uns'], size: 5, hint: 'wir' }],
          explanation: 'Après der au nominatif, l’adjectif prend -e : der freundliche Nachbar. Helfen exige le datif : le datif de wir est uns.' },
        { id: 'q11', type: 'fill', prompt: 'Complétez avec le possessif au datif.',
          text: 'Wem gehört die rote Jacke? — Sie gehört [[1]] Schwester.',
          blanks: [{ id: '1', accept: ['meiner'], size: 7, hint: 'meine' }],
          explanation: 'Gehören se construit avec le datif de la personne. Die Schwester est féminin : au datif, meiner Schwester. Meine serait un nominatif ou un accusatif.' },
        { id: 'q12', type: 'fill', prompt: 'Complétez avec les pronoms réfléchis.',
          text: 'Wir treffen [[1]] am Samstag, und ich freue [[2]] schon darauf.',
          blanks: [{ id: '1', accept: ['uns'], size: 5, hint: null }, { id: '2', accept: ['mich'], size: 5, hint: null }],
          explanation: 'Le pronom réfléchi s’accorde avec le sujet : wir treffen uns, ich freue mich. Sich ne s’emploie qu’à la 3e personne (er, sie, es, sie, Sie).' },
        { id: 'q13', type: 'fill', prompt: 'Racontez un souvenir : complétez avec als ou wenn, puis avec müssen au prétérit.',
          text: '[[1]] ich zehn Jahre alt war, [[2]] ich um sieben Uhr zu Hause sein.',
          blanks: [{ id: '1', accept: ['als'], size: 5, hint: 'als ou wenn ?' }, { id: '2', accept: ['musste'], size: 7, hint: 'müssen' }],
          explanation: 'Als s’emploie pour une période unique du passé (à dix ans) ; wenn, pour une habitude répétée. Au prétérit, müssen perd son tréma : ich musste, sans terminaison, juste après la subordonnée.' },
        { id: 'q14', type: 'match', prompt: 'Associez chaque groupe à la forme de nett qui le complète.',
          pairs: [
            { left: 'ein … Kind', right: 'nettes' },
            { left: 'ein … Freund', right: 'netter' },
            { left: 'einen … Freund', right: 'netten' },
            { left: 'eine … Freundin', right: 'nette' },
          ],
          explanation: 'Après ein, l’adjectif montre le genre que l’article cache : -er pour le masculin (ein netter Freund), -es pour le neutre (ein nettes Kind). Eine appelle -e ; einen, à l’accusatif masculin, appelle -en.' },
        { id: 'q15', type: 'order', prompt: 'Remettez les mots dans l’ordre. Commencez par « Wir ».',
          answers: [['Wir', 'haben', 'uns', 'im Sprachkurs', 'kennengelernt.']],
          explanation: 'Au Perfekt, l’auxiliaire haben est en 2e position et le participe kennengelernt à la fin. Le pronom réfléchi uns se place juste après le verbe conjugué, avant le complément de lieu.' },
        { id: 'q16', type: 'dictation', prompt: 'Écoutez et écrivez la phrase : un remerciement après une fête.',
          accept: ['Ich danke dir für die schöne Einladung.'], voice: 'sprecherin',
          explanation: 'Danken se construit avec le datif (dir) et für + accusatif pour la raison. Après die, l’adjectif prend -e : die schöne Einladung.' },
      ],
    },

    'a2-beziehungen-sprechen': {
      kind: 'mission',
      title: 'Mission : présenter un ami et répondre à une invitation',
      estimatedMinutes: 20,
      competences: ['expression-orale', 'expression-ecrite'],
      lesson: {
        description: `Écoutez Julia, qui présente sa meilleure amie, puis préparez votre propre présentation et votre réponse à une invitation.

MODÈLE
Ich möchte euch meine beste Freundin vorstellen. Sie heißt Aylin und ist zweiunddreißig Jahre alt. Aylin ist ziemlich klein und hat lange schwarze Haare. Sie trägt eine runde Brille und lacht sehr viel. Wir haben uns vor acht Jahren in einem Tanzkurs kennengelernt. Aylin ist lustig, ehrlich und sehr hilfsbereit. Manchmal ist sie ein bisschen ungeduldig, aber das finde ich nicht schlimm. Wir treffen uns fast jedes Wochenende. Wir gehen zusammen joggen, wir kochen oder wir sehen einen lustigen Film. Ich freue mich immer auf unsere Treffen. Aylin ist für mich eine ganz besondere Freundin.

POUR PRÉPARER LA PRÉSENTATION
1. Qui est-ce ? Mein bester Freund / Meine beste Freundin heißt … Er/Sie ist … Jahre alt.
2. L’apparence : Er/Sie ist groß / klein / schlank … Er/Sie hat kurze / lange … Haare. Er/Sie trägt …
3. Le caractère, avec des nuances : Er/Sie ist sehr …, ziemlich … Manchmal ist er/sie ein bisschen …
4. La rencontre : Wir haben uns … kennengelernt (in der Schule, bei der Arbeit, auf einer Party, im Sportverein).
5. Ce que vous faites ensemble : Wir treffen uns oft … Wir gehen zusammen …

LE MESSAGE DE MORITZ
„Hallo! Am Samstag feiere ich meinen Geburtstag im Garten. Ab 19 Uhr gibt es Gegrilltes, Salate und Musik. Kommst du? Du kannst gern einen Freund oder eine Freundin mitbringen! Liebe Grüße, Moritz“

Préparez quelques mots-clés : à l’oral, parlez sans lire un texte rédigé. Pour l’écrit, relisez les terminaisons des adjectifs, le datif après danken et gefallen, et le pronom réfléchi (ich freue mich).`,
      },
      mission: {
        oral: {
          prompt: 'Présentez un ami ou une amie pendant une à deux minutes, sans lire : qui c’est, son apparence, son caractère avec des nuances, votre rencontre et ce que vous faites ensemble.',
          maxSeconds: 120,
        },
        written: {
          prompt: 'Répondez à Moritz en 60 à 80 mots : remerciez-le, acceptez ou refusez poliment avec une raison, demandez ce que vous pouvez apporter (ou proposez une autre date), présentez en deux phrases l’ami ou l’amie que vous aimeriez amener, puis terminez par une formule (Liebe Grüße, Bis Samstag!).',
          maxChars: 1000,
          minWords: 60,
        },
        checklist: [
          'Ma présentation décrit l’apparence et le caractère, avec sehr, ziemlich ou ein bisschen.',
          'J’ai dit comment nous nous sommes rencontrés : Wir haben uns … kennengelernt.',
          'Mon message remercie Moritz (Ich danke dir für …) et accepte ou refuse avec une raison.',
          'J’ai vérifié les terminaisons : ein lustiger Freund, eine nette Freundin, einen tollen Abend.',
          'J’ai employé le bon pronom réfléchi : ich freue mich, wir treffen uns.',
        ],
      },
    },
  },

  add: [
    {
      after: 'a2-beziehungen-aussprache',
      activity: {
        id: 'a2-beziehungen-repeter',
        kind: 'exercise',
        title: 'Répéter à voix haute : décrire les gens qu’on connaît',
        estimatedMinutes: 8,
        competences: ['expression-orale'],
        lesson: {
          title: 'Répéter à voix haute : décrire les gens qu’on connaît',
          description: 'Écoutez chaque modèle, puis dites la phrase à voix haute. Soignez le -er final, qui sonne comme un « a » sombre (Feier, Nachbar, sauer), et la terminaison -ig, prononcée comme le « ch » de ich. Si la reconnaissance vocale ne comprend pas votre phrase, réécoutez le modèle et réessayez.',
          transcript: null,
        },
        placements: [],
        questions: [
          { id: 'q1', type: 'speak', prompt: 'Écoutez, puis décrivez cet homme.',
            text: 'Er ist groß und hat kurze schwarze Haare.', accept: ['Er ist groß und hat kurze schwarze Haare.'], threshold: 75,
            explanation: 'Sans article, l’adjectif devant un pluriel prend -e : kurze schwarze Haare. Le h de hat et de Haare se prononce, comme un léger souffle.' },
          { id: 'q2', type: 'speak', prompt: 'Écoutez, puis décrivez votre voisine.',
            text: 'Meine Nachbarin ist sehr nett und gesellig.', accept: ['Meine Nachbarin ist sehr nett und gesellig.'], threshold: 75,
            explanation: 'L’accent tombe sur la première syllabe : NACH-barin. La terminaison -ig de gesellig se prononce comme le « ch » de ich.' },
          { id: 'q3', type: 'speak', prompt: 'Écoutez, puis parlez d’un copain avec une nuance.',
            text: 'Mein Kumpel ist lustig, aber manchmal schlecht gelaunt.', accept: ['Mein Kumpel ist lustig, aber manchmal schlecht gelaunt.'], threshold: 75,
            explanation: 'Der Kumpel est un mot familier pour un copain. Lustig se termine par le son de ich ; dans schlecht gelaunt (de mauvaise humeur), sch se dit « ch » et au se prononce « ao ».' },
          { id: 'q4', type: 'speak', prompt: 'Écoutez, puis dites que vous vous réjouissez de la fête.',
            text: 'Ich freue mich auf die Feier!', accept: ['Ich freue mich auf die Feier!'], threshold: 75,
            explanation: 'Feier se dit « faï-a » : le -er final devient un « a » sombre. Ne le confondez pas avec das Feuer, « foï-a ».' },
          { id: 'q5', type: 'speak', prompt: 'Écoutez, puis répétez en soignant les -er finaux.',
            text: 'Unser Nachbar ist heute sauer.', accept: ['Unser Nachbar ist heute sauer.'], threshold: 75,
            explanation: 'Unser, Nachbar et sauer finissent par le même « a » sombre ; dans sauer, la diphtongue au glisse vers ce son : « zaou-a ».' },
          { id: 'q6', type: 'speak', prompt: 'Écoutez, puis demandez combien de temps dure la fête.',
            text: 'Wie lange dauert eure Party?', accept: ['Wie lange dauert eure Party?'], threshold: 75,
            explanation: 'Dans dauert et eure, la diphtongue (au, eu) porte l’accent et le r se vocalise. Le verbe dauert suit directement « Wie lange ».' },
        ],
      },
    },
  ],
};
