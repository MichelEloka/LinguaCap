// Ciné-club · Nicos Weg A1 (Deutsche Welle, chaîne YouTube officielle « Deutsch lernen mit der DW », vidéo 4-eDoThe6qo).
// Séquences de 6 à 9 minutes qui suivent les 76 folgen du film. Bornes estimées (approx: true) d'après l'ordre et la durée
// des épisodes publiés par la DW sur learngerman.dw.com (durée de chaque folge moins environ 7 s de générique, que le film
// complet ne répète pas) : à vérifier en regardant, dans l'éditeur du catalogue. Contextes, mots-clés, questions et
// explications originaux : rien n'est recopié des sous-titres, des manuscrits ni des exercices de la DW.
import { DW, bi, choice, contexte, fill, match, mot, nom, order } from '../lib.mjs';

export default {
  film: {
    id: 'nicos-weg-a1', levelId: 'a1', title: 'Nicos Weg · A1', position: 1,
    videoId: '4-eDoThe6qo', durationSeconds: '1:43:00',
    courseUrl: 'https://learngerman.dw.com/de/nicos-weg/c-36519687',
    channel: DW.channel, credit: DW.credit, licenseNote: DW.licenseNote,
    description: 'Nico, un jeune Espagnol, atterrit en Allemagne pour retrouver sa tante Yara. Dès l’aéroport, son sac '
      + 'disparaît : avec Lisa, la petite Emma et leurs amis, il cherche une adresse, un endroit où dormir, et découvre la vie '
      + 'quotidienne en Allemagne. Le film complet du niveau A1 (76 épisodes courts) est découpé ici en 15 séquences de 6 à '
      + '9 minutes. Pour chacune : un contexte et des mots-clés avant de regarder, le film dans le lecteur YouTube avec les '
      + 'sous-titres allemands, votre carnet de mots pendant le visionnage, puis des questions corrigées.',
  },
  sequences: [
    {
      title: 'Ankunft in Deutschland · L’arrivée en Allemagne',
      episodes: [1, 5], start: '0:00', end: '6:15', approx: true,
      context: contexte({
        episodes: [1, 5],
        situation: [
          ['Nico kommt aus Spanien. Er ist zum ersten Mal in Deutschland.', 'Nico vient d’Espagne. Il est en Allemagne pour la première fois.'],
          ['Am Flughafen ist alles neu für ihn: die Leute, die Wörter, die Schilder.', 'À l’aéroport, tout est nouveau pour lui : les gens, les mots, les panneaux.'],
          ['Dann hat Nico ein Problem.', 'Puis Nico a un problème.'],
        ],
        questions: [
          ['Wie begrüßt man sich auf Deutsch? Welche Wörter kennen Sie schon?', 'Comment se salue-t-on en allemand ? Quels mots connaissez-vous déjà ?'],
          ['Was kann am Flughafen passieren?', 'Que peut-il se passer à l’aéroport ?'],
        ],
        focus: [
          ['Achten Sie auf die Begrüßungen und auf Nicos Tasche.', 'Soyez attentif aux salutations et au sac de Nico.'],
        ],
      }),
      keywords: [
        nom('der', 'Flughafen', 'Flughäfen', 'l’aéroport'),
        nom('die', 'Tasche', 'Taschen', 'le sac'),
        nom('das', 'Taxi', 'Taxis', 'le taxi'),
        mot('weg', 'parti, disparu', 'Die Tasche ist weg. : le sac a disparu.'),
        nom('die', 'Hilfe', null, 'l’aide'),
        nom('die', 'Tante', 'Tanten', 'la tante'),
        nom('die', 'Adresse', 'Adressen', 'l’adresse'),
        mot('heißen', 's’appeler', 'ich heiße, du heißt'),
        mot('Entschuldigung!', 'Pardon ! Excusez-moi !'),
        nom('die', 'Tankstelle', 'Tankstellen', 'la station-service'),
      ],
      questions: [
        choice('q1', bi('Was hört Nico am Flughafen mit seinen Kopfhörern?', 'Qu’écoute Nico à l’aéroport avec ses écouteurs ?'), [
          ['Musik aus Spanien'],
          ['einen Deutschkurs', true],
          ['die Nachrichten'],
        ], 'Dans ses écouteurs, Nico suit une leçon d’allemand : des voix répètent des salutations comme « Guten Morgen » et « Wie geht es Ihnen? ». Il ne s’agit ni de musique ni d’un journal.'),
        choice('q2', bi('Was findet Emma schön?', 'Qu’est-ce qu’Emma trouve joli ?'), [
          ['Nicos Tasche', true],
          ['Nicos Jacke'],
          ['den Flughafen'],
        ], 'Emma admire le sac de Nico : « Die Tasche ist schön! ». Nico ne comprend pas tout de suite le mot schön (joli, beau). C’est ce même sac qui disparaît ensuite.'),
        choice('q3', bi('Wo ist Nicos Tasche plötzlich?', 'Où se trouve soudain le sac de Nico ?'), [
          ['bei Emma'],
          ['im Flughafen'],
          ['in einem Taxi', true],
        ], 'Un voyageur part en taxi pour l’hôtel Königshof, et le sac de Nico part avec la voiture. Nico l’explique ensuite à Lisa : le sac est « weg », dans le taxi.'),
        match('q4', bi('Wer ist wer? Verbinden Sie.', 'Qui est qui ? Associez.'), [
          ['Lisa', 'Emmas Tante'],
          ['Yara', 'Nicos Tante'],
          ['Emma', 'ein Mädchen'],
          ['Emmas Mutter', 'arbeitet in Amerika'],
        ], 'Lisa n’est pas la mère d’Emma mais sa tante ; la mère d’Emma travaille en Amérique. Yara est la tante que Nico est venu voir en Allemagne.'),
        choice('q5', bi('Zu wem will Nico in Deutschland?', 'Chez qui Nico veut-il aller en Allemagne ?'), [
          ['zu seiner Mutter'],
          ['zu seiner Tante', true],
          ['zu einem Freund'],
        ], 'Nico prononce le nom de Yara et cherche le mot : Emma le lui donne, « Deine Tante? ». Il veut aller chez sa tante, mais il ne connaît pas bien le nom de sa rue : Lisa ne le reconnaît pas.'),
        fill('q6', bi('Ergänzen Sie die Vorstellung.', 'Complétez la présentation.'), 'Hallo, ich [[1]] Emma. Und wie [[2]] du?', [
          ['heiße'],
          ['heißt'],
        ], 'Dans la voiture, Emma et Lisa font répéter à Nico comment se présenter. Le verbe heißen se conjugue ich heiße, du heißt : la terminaison change avec la personne.'),
        order('q7', bi('Was passiert zuerst? Ordnen Sie die Szenen.', 'Que se passe-t-il d’abord ? Remettez les scènes dans l’ordre.'), [
          ['Emma spricht mit Nico.', 'Die Tasche fährt im Taxi weg.', 'Lisa und Emma helfen Nico.', 'Lisa hält an einer Tankstelle.'],
        ], 'Emma parle d’abord à Nico dans l’aérogare ; ensuite le sac part en taxi ; Lisa et Emma reviennent l’aider et l’emmènent en ville ; enfin Lisa s’arrête pour prendre de l’essence, et Nico voit le taxi.'),
      ],
    },
    {
      title: 'Wo ist die Tasche? · Où est le sac ?',
      episodes: [6, 10], start: '6:15', end: '12:35', approx: true,
      context: contexte({
        episodes: [6, 10],
        situation: [
          ['An der Tankstelle sieht Nico das Taxi wieder.', 'À la station-service, Nico revoit le taxi.'],
          ['Lisa und Emma helfen ihm. Sie treffen auch einen Freund von Lisa.', 'Lisa et Emma l’aident. Ils rencontrent aussi un ami de Lisa.'],
          ['Wer kann Nico jetzt helfen?', 'Qui peut aider Nico maintenant ?'],
        ],
        questions: [
          ['Ist die Tasche noch im Taxi? Was glauben Sie?', 'Le sac est-il encore dans le taxi ? Qu’en pensez-vous ?'],
          ['Wen kann man fragen, wenn man eine Adresse sucht?', 'À qui peut-on demander de l’aide quand on cherche une adresse ?'],
        ],
        focus: [
          ['Achten Sie auf die Fragen: Wer bist du? Woher kommst du? Wo wohnst du?', 'Soyez attentif aux questions : qui es-tu ? d’où viens-tu ? où habites-tu ?'],
          ['Achten Sie auch auf die Zahlen.', 'Soyez aussi attentif aux nombres.'],
        ],
      }),
      keywords: [
        mot('suchen', 'chercher', 'Nico sucht seine Tasche.'),
        mot('woher?', 'd’où ?', 'Woher kommst du? – Aus Spanien.'),
        mot('wohnen', 'habiter'),
        mot('anrufen', 'appeler (au téléphone)', 'séparable : Ich rufe meine Tante an.'),
        nom('die', 'Polizei', null, 'la police'),
        nom('der', 'Pass', 'Pässe', 'le passeport'),
        nom('das', 'Fahrradgeschäft', 'Fahrradgeschäfte', 'le magasin de vélos'),
        nom('der', 'Geburtstag', 'Geburtstage', 'l’anniversaire'),
        nom('die', 'Zahl', 'Zahlen', 'le nombre'),
        nom('die', 'Telefonnummer', 'Telefonnummern', 'le numéro de téléphone'),
      ],
      questions: [
        choice('q1', bi('Ist Nicos Tasche im Taxi?', 'Le sac de Nico est-il dans le taxi ?'), [
          ['Ja, sie ist im Kofferraum.'],
          ['Das sagt der Taxifahrer nicht.'],
          ['Nein, sie ist nicht da.', true],
        ], 'Le chauffeur, d’abord fâché, montre que le sac n’est pas dans sa voiture : « Hier ist die Tasche nicht. ». Il dit aussi qu’il ne sait pas où il est.'),
        choice('q2', bi('Woher kommt Nico genau?', 'D’où vient Nico exactement ?'), [
          ['aus Madrid'],
          ['aus Sevilla', true],
          ['aus Barcelona'],
        ], 'Max propose Barcelone ou Madrid, mais Nico répond Sevilla : il habite à Séville. Woher kommst du ? demande l’origine, Wo wohnst du ? le lieu où l’on habite.'),
        choice('q3', bi('Warum kann Nico seine Tante nicht anrufen?', 'Pourquoi Nico ne peut-il pas appeler sa tante ?'), [
          ['Sein Telefon ist weg.', true],
          ['Die Tante hat kein Telefon.'],
          ['Lisa hat kein Handy.'],
        ], 'Le téléphone de Nico était dans le sac : sans sac, plus de téléphone ni de numéro. Lisa, elle, a un portable : elle s’en sert pour appeler son père.'),
        choice('q4', bi('Was ist Lisas Vater von Beruf?', 'Quel est le métier du père de Lisa ?'), [
          ['Taxifahrer'],
          ['Lehrer'],
          ['Polizist', true],
        ], 'C’est Max qui a l’idée : le père de Lisa travaille à la police (Polizist). Il répond au téléphone d’un commissariat et propose à Lisa de venir avec Nico.'),
        choice('q5', bi('Was hat Nicos Tante?', 'Qu’a la tante de Nico ?'), [
          ['ein Fahrradgeschäft', true],
          ['ein Restaurant'],
          ['ein kleines Hotel'],
        ], 'Nico explique en anglais que sa tante a un magasin de vélos, et Lisa le traduit : ein Fahrradgeschäft. C’est une piste pour retrouver son adresse.'),
        fill('q6', bi('Hören Sie gut zu und ergänzen Sie die Zahlen.', 'Écoutez bien et complétez les nombres.'), 'Emma ist [[1]] Jahre alt. Lottes Haus hat die Nummer [[2]].', [
          ['acht', '8'],
          ['elf', '11'],
        ], 'Lotte fête ses huit ans, et Lisa précise qu’Emma a le même âge. Pour la maison, Lisa hésite entre 38 et 83, mais Emma lit le bon numéro : 11 (elf).'),
        choice('q7', bi('Der Taxifahrer sagt „Keine Ahnung“. Was bedeutet das?', 'Le chauffeur dit « Keine Ahnung ». Qu’est-ce que cela veut dire ?'), [
          ['Pas de problème.'],
          ['Aucune idée.', true],
          ['Pas de sac ici.'],
        ], '« Keine Ahnung » signifie « aucune idée » : le chauffeur ne sait pas où est le sac. Ne confondez pas avec « Kein Problem », entendu plus tôt dans le taxi (« pas de problème »).'),
        order('q8', bi('Ordnen Sie die Szenen.', 'Remettez les scènes dans l’ordre.'), [
          ['Nico stoppt das Taxi.', 'Max sagt Hallo.', 'Lisa ruft ihren Vater an.', 'Emma geht zum Geburtstag.'],
        ], 'Nico arrête d’abord le taxi à la station-service ; Max, un ami de Lisa, arrive ensuite ; Lisa téléphone alors à son père ; avant d’aller à la police, ils déposent Emma chez Lotte pour son anniversaire.'),
      ],
    },
    {
      title: 'Radio, Polizei und eine WG · Radio, police et colocation',
      episodes: [11, 14], start: '12:35', end: '19:32', approx: true,
      context: contexte({
        episodes: [11, 14],
        situation: [
          ['Nico wartet allein in Lisas Auto. Das Radio ist an.', 'Nico attend seul dans la voiture de Lisa. La radio est allumée.'],
          ['Dann fahren Lisa und Nico zur Polizei, zu Lisas Vater.', 'Puis Lisa et Nico vont à la police, chez le père de Lisa.'],
          ['Aber wo kann Nico heute schlafen?', 'Mais où Nico peut-il dormir ce soir ?'],
        ],
        questions: [
          ['Sie haben Ihre Tasche verloren. Was machen Sie?', 'Vous avez perdu votre sac. Que faites-vous ?'],
          ['Was ist eine WG? Möchten Sie in einer WG wohnen?', 'Qu’est-ce qu’une colocation ? Aimeriez-vous vivre en colocation ?'],
        ],
        focus: [
          ['Achten Sie auf die Adressen und auf das Alter der Personen.', 'Soyez attentif aux adresses et à l’âge des personnes.'],
          ['Am Ende: Wer trinkt was?', 'À la fin : qui boit quoi ?'],
        ],
      }),
      keywords: [
        mot('verlieren', 'perdre', 'Perfekt : Ich habe meine Tasche verloren.'),
        mot('schwarz', 'noir'),
        nom('die', 'Hausnummer', 'Hausnummern', 'le numéro (de la maison)'),
        nom('das', 'Geburtsdatum', 'Geburtsdaten', 'la date de naissance'),
        nom('die', 'WG', 'WGs', 'la colocation', 'abréviation de die Wohngemeinschaft'),
        nom('der', 'Mitbewohner', 'Mitbewohner', 'le colocataire', 'féminin : die Mitbewohnerin'),
        mot('kaputt', 'cassé, en panne'),
        nom('das', 'Getränk', 'Getränke', 'la boisson'),
        nom('der', 'Durst', null, 'la soif', 'Durst haben : avoir soif'),
        nom('die', 'Milch', null, 'le lait'),
      ],
      questions: [
        choice('q1', bi('Warum ruft Nico beim Radio an?', 'Pourquoi Nico appelle-t-il la radio ?'), [
          ['Er möchte Musik hören.'],
          ['Er sucht eine Wohnung.'],
          ['Er sucht seine Tasche.', true],
        ], 'À la radio, un auditeur raconte l’histoire d’un sac perdu. Nico compose aussitôt le numéro de l’émission pour parler du sien : il ne parle ni de musique ni de logement.'),
        choice('q2', bi('Wie sieht Nicos Tasche aus?', 'À quoi ressemble le sac de Nico ?'), [
          ['schwarz, mit einem Fahrrad', true],
          ['rot, mit einem Auto'],
          ['schwarz, mit einer Blume'],
        ], 'Lisa reprend le téléphone et décrit le sac : il est noir (schwarz) et porte un écusson en forme de vélo. Le vélo rappelle aussi le magasin de la tante Yara.'),
        fill('q3', bi('Wo kann man die Tasche abgeben? Ergänzen Sie die Adresse.', 'Où peut-on rapporter le sac ? Complétez l’adresse.'), 'Polizeistelle Ost: [[1]] [[2]]', [
          ['Schreinerstraße', 'Schreinerstrasse', 'Schreiner-Straße'],
          ['144', 'hundertvierundvierzig'],
        ], 'La présentatrice comprend mal le nom de la rue ; Lisa l’épelle lettre par lettre : S-C-H-R-E-I-N-E-R, « mit R ». Le numéro est 144 (hundertvierundvierzig).'),
        choice('q4', bi('Welche Adresse gibt Nico bei der Polizei an?', 'Quelle adresse Nico donne-t-il à la police ?'), [
          ['die Adresse von Yara'],
          ['die Adresse von Lisa', true],
          ['die Adresse von Max'],
        ], 'Nico n’a pas d’adresse en Allemagne et ne connaît pas celle de Yara. Lisa propose donc la sienne : elle habite Wagnergasse 136.'),
        choice('q5', bi('Was kann Nico der Polizei nicht geben?', 'Que Nico ne peut-il pas donner au policier ?'), [
          ['seine Passnummer', true],
          ['seinen Namen'],
          ['ein Foto von Yara'],
        ], 'Nico donne son nom complet, Nicolás González, et montre une photo de Yara. Mais son passeport était dans le sac : il ne peut pas donner son numéro de passeport (die Passnummer).'),
        fill('q6', bi('Wie alt sind sie? Ergänzen Sie.', 'Quel âge ont-ils ? Complétez.'), 'Nico ist [[1]] Jahre alt. Nina ist [[2]] und Sebastian ist [[3]].', [
          ['22', 'zweiundzwanzig'],
          ['23', 'dreiundzwanzig'],
          ['25', 'fünfundzwanzig'],
        ], 'Dans la cour, chacun se présente : Nico a 22 ans, Nina 23 et Sebastian 25. En allemand, on dit l’unité avant la dizaine : zwei-und-zwanzig, « deux-et-vingt ».'),
        match('q7', bi('Wer trinkt was? Verbinden Sie.', 'Qui boit quoi ? Associez.'), [
          ['Sebastian', 'ein Bier'],
          ['Lisa', 'einen Kaffee mit Milch'],
          ['Nico', 'eine Cola'],
          ['Nina', 'eine Limonade'],
        ], 'Dans la cuisine, Nina propose les boissons : Sebastian veut une bière, Lisa un café avec beaucoup de lait et peu de sucre, Nico un coca ; Nina prend alors une limonade.'),
        choice('q8', bi('Was ist Sebastians Idee?', 'Quelle est l’idée de Sebastian ?'), [
          ['Er ruft noch einmal beim Radio an.'],
          ['Er fährt mit Nico zur Polizei.'],
          ['Er postet Yaras Foto im Internet.', true],
        ], 'Sebastian propose de publier la photo de Yara sur un réseau social et de demander qui connaît son magasin de vélos. Ainsi, quelqu’un pourra peut-être donner l’adresse.'),
      ],
    },
    {
      title: 'Pizza und Party · Pizza et fête',
      episodes: [15, 18], start: '19:32', end: '26:09', approx: true,
      context: contexte({
        episodes: [15, 18],
        situation: [
          ['In der WG haben alle Hunger. Heute Abend gibt es auch eine Party.', 'Dans la colocation, tout le monde a faim. Ce soir, il y a aussi une fête.'],
          ['Nico lernt neue Leute kennen.', 'Nico fait la connaissance de nouvelles personnes.'],
        ],
        questions: [
          ['Was essen Sie gern mit Freunden?', 'Qu’aimez-vous manger avec des amis ?'],
          ['Welche Städte in Deutschland kennen Sie?', 'Quelles villes d’Allemagne connaissez-vous ?'],
        ],
        focus: [
          ['Achten Sie auf die Preise und auf Norden, Süden, Osten, Westen.', 'Soyez attentif aux prix et aux points cardinaux.'],
        ],
      }),
      keywords: [
        nom('die', 'Speisekarte', 'Speisekarten', 'la carte, le menu'),
        mot('bestellen', 'commander'),
        mot('bezahlen', 'payer', 'aussi : zahlen ; bar oder mit Karte : en espèces ou par carte'),
        nom('die', 'Rechnung', 'Rechnungen', 'la facture, l’addition'),
        nom('das', 'Trinkgeld', 'Trinkgelder', 'le pourboire'),
        nom('der', 'Schinken', 'Schinken', 'le jambon'),
        nom('die', 'Abschiedsparty', 'Abschiedspartys', 'la fête d’adieu'),
        nom('die', 'Sehenswürdigkeit', 'Sehenswürdigkeiten', 'le monument, le lieu à voir'),
        nom('der', 'Süden', null, 'le sud', 'aussi : der Norden, der Osten, der Westen'),
        mot('gewinnen', 'gagner'),
      ],
      questions: [
        match('q1', bi('Wer isst welche Pizza? Verbinden Sie.', 'Qui mange quelle pizza ? Associez.'), [
          ['Nawin', 'Pizza mit Thunfisch'],
          ['Nico', 'Pizza mit Salami'],
          ['Nina', 'Pizza Hawaii ohne Schinken'],
        ], 'Nawin choisit le thon, Nico hésite puis prend une pizza au salami, comme Lisa. Nina commande, comme toujours, une pizza Hawaii (ananas) sans jambon.'),
        choice('q2', bi('Warum isst Nina die Pizza ohne Schinken?', 'Pourquoi Nina prend-elle sa pizza sans jambon ?'), [
          ['Sie isst kein Fleisch.', true],
          ['Sie mag keine Ananas.'],
          ['Der Schinken ist teuer.'],
        ], 'Lisa l’explique à Nico : Nina adore l’ananas, mais elle est végétarienne (Vegetarierin). Elle commande donc la pizza Hawaii sans le jambon.'),
        fill('q3', bi('Was kostet das Essen? Ergänzen Sie.', 'Combien coûte le repas ? Complétez.'), 'Das macht zusammen [[1]] Euro. Lisa gibt [[2]] Euro.', [
          ['40,50', '40.50', '40,5', 'vierzig fünfzig'],
          ['45', 'fünfundvierzig'],
        ], 'La livreuse additionne 22,50 € et 18 € : 40,50 € en tout. Lisa paie en espèces et donne 45 € ; la différence est le pourboire.'),
        choice('q4', bi('Lisa gibt das Geld und sagt: „Das stimmt so.“ Was bedeutet das?', 'Lisa donne l’argent et dit « Das stimmt so ». Qu’est-ce que cela veut dire ?'), [
          ['Le compte n’est pas bon.'],
          ['C’est beaucoup trop cher.'],
          ['Gardez la monnaie.', true],
        ], '« Das stimmt so » se dit en payant quand on laisse la monnaie en pourboire : Lisa donne 45 € pour 40,50 €. Le verbe stimmen veut dire « être juste » : il n’y a pas d’erreur de calcul.'),
        choice('q5', bi('Warum gibt es heute eine Party?', 'Pourquoi y a-t-il une fête aujourd’hui ?'), [
          ['Nina hat Geburtstag.'],
          ['Nawin zieht bald weg.', true],
          ['Nico ist neu in der WG.'],
        ], 'Nawin dit que c’est peut-être sa dernière pizza ici : il quitte la colocation. Nico parle de « Bye-bye-Party », et Sebastian lui donne le mot juste : eine Abschiedsparty.'),
        choice('q6', bi('In welcher Stadt war Nawin noch nie?', 'Dans quelle ville Nawin n’est-il jamais allé ?'), [
          ['in Hamburg'],
          ['in Heidelberg', true],
          ['in Köln'],
        ], 'Nawin a reçu des cadeaux de plusieurs villes. Il est déjà allé à Hambourg et à Cologne, mais jamais à Heidelberg (« noch nie »). La semaine suivante, il va à Munich.'),
        choice('q7', bi('Woher kommt Selma?', 'D’où vient Selma ?'), [
          ['aus Damaskus', true],
          ['aus Sevilla'],
          ['aus München'],
        ], 'Pendant le jeu, Selma se présente : elle vient de Damas, dans le sud de la Syrie. C’est Nico qui vient de Séville, dans le sud de l’Espagne.'),
        order('q8', bi('Ordnen Sie die Szenen.', 'Remettez les scènes dans l’ordre.'), [
          ['Die Pizzabotin kommt.', 'Die Gäste kommen zur Party.', 'Alle spielen ein Spiel.', 'Selma bekommt einen Anruf.'],
        ], 'La livreuse apporte d’abord les pizzas ; le soir, les invités arrivent pour la fête de Nawin ; Nina organise un jeu par équipes (nord, sud, est, ouest) ; enfin, la mère de Selma l’appelle et elle s’en va.'),
      ],
    },
    {
      title: 'Neuigkeiten von Yara · Des nouvelles de Yara',
      episodes: [19, 23], start: '26:09', end: '33:07', approx: true,
      context: contexte({
        episodes: [19, 23],
        situation: [
          ['Nach der Party sitzen die Freunde zusammen am Feuer.', 'Après la fête, les amis sont réunis autour d’un feu.'],
          ['Am nächsten Morgen lernt Nico Lisas Arbeit kennen.', 'Le lendemain matin, Nico découvre le travail de Lisa.'],
        ],
        questions: [
          ['Welche Spezialitäten aus anderen Ländern kennen Sie?', 'Quelles spécialités d’autres pays connaissez-vous ?'],
          ['Welche Sprachen sprechen Sie? Wie gut?', 'Quelles langues parlez-vous ? Et à quel niveau ?'],
        ],
        focus: [
          ['Achten Sie auf Länder und Sprachen.', 'Soyez attentif aux pays et aux langues.'],
          ['Im Deutschkurs: Achten Sie auf die Artikel der, die, das.', 'En cours d’allemand : soyez attentif aux articles der, die, das.'],
        ],
      }),
      keywords: [
        nom('das', 'Land', 'Länder', 'le pays'),
        nom('die', 'Sprache', 'Sprachen', 'la langue'),
        mot('ein bisschen', 'un peu', 'Ich spreche ein bisschen Deutsch.'),
        nom('der', 'Flüchtling', 'Flüchtlinge', 'le réfugié, la réfugiée', 'toujours masculin : Selma ist ein Flüchtling.'),
        nom('die', 'Brille', 'Brillen', 'les lunettes', 'singulier en allemand : eine Brille'),
        nom('der', 'Schlüssel', 'Schlüssel', 'la clé'),
        mot('unterrichten', 'enseigner'),
        nom('der', 'Stift', 'Stifte', 'le stylo, le crayon'),
        nom('die', 'Tafel', 'Tafeln', 'le tableau'),
        nom('der', 'Aufzug', 'Aufzüge', 'l’ascenseur'),
      ],
      questions: [
        match('q1', bi('Was isst man wo? Verbinden Sie.', 'Que mange-t-on où ? Associez.'), [
          ['in Schweden', 'Köttbullar'],
          ['in Japan', 'Sushi'],
          ['in Spanien', 'Gazpacho'],
          ['in Frankreich', 'Käse'],
        ], 'Lisa a préparé des spécialités avec de petits drapeaux à placer. Nina reconnaît les boulettes suédoises, Sebastian les sushis, Nawin pense au fromage pour la France, et Nico propose le gaspacho pour l’Espagne.'),
        choice('q2', bi('Warum geht Nawin nach Frankreich?', 'Pourquoi Nawin part-il en France ?'), [
          ['Seine Familie wohnt dort.'],
          ['Er hat dort einen Job.', true],
          ['Er studiert dort.'],
        ], 'Nawin explique qu’il a un travail en France. Il ajoute pourtant qu’il aime l’Allemagne : c’est pour cela qu’il est un peu triste.'),
        choice('q3', bi('Welche Sprachen spricht Nico?', 'Quelles langues parle Nico ?'), [
          ['Spanisch, Englisch und Italienisch'],
          ['Spanisch, Französisch und Deutsch'],
          ['Spanisch, ein bisschen Englisch und Deutsch', true],
        ], 'Nico parle espagnol, un peu anglais et un peu allemand (« ein bisschen »). C’est Lisa qui parle aussi italien, « mais très mal », et Nawin qui parle français.'),
        choice('q4', bi('„Selma hat schon eine Aufenthaltserlaubnis.“ Richtig, falsch oder nicht gesagt?', '« Selma a déjà un titre de séjour. » Vrai, faux ou non dit ?'), [
          ['richtig'],
          ['falsch', true],
          ['nicht gesagt'],
        ], 'Lisa dit que Selma n’a pas encore de titre de séjour (« noch keine Aufenthaltserlaubnis ») et qu’elle ne sait pas si elle pourra rester. L’affirmation est donc fausse.'),
        choice('q5', bi('Was ist Lisa von Beruf?', 'Quel est le métier de Lisa ?'), [
          ['Deutschlehrerin', true],
          ['Polizistin'],
          ['Studentin'],
        ], 'Nina l’explique à Nico : Lisa enseigne l’allemand dans une école de langues. C’est son père, Jürgen, qui travaille à la police.'),
        fill('q6', bi('Der, die oder das? Ergänzen Sie den Artikel.', 'Der, die ou das ? Complétez avec l’article.'), '[[1]] Tafel · [[2]] Buch · [[3]] Stuhl', [
          ['die'],
          ['das'],
          ['der'],
        ], 'En cours, une élève hésite entre « der Tafel » et « das Tafel » ; Lisa la corrige : die Tafel. Son conseil : apprendre toujours le nom avec son article, der Stuhl, die Tafel, das Buch.'),
        choice('q7', bi('Welche Neuigkeit bringt Sebastian am Feuer?', 'Quelle nouvelle Sebastian apporte-t-il près du feu ?'), [
          ['eine Nachricht von der Polizei'],
          ['ein Foto von Nicos Tasche'],
          ['eine Antwort mit Yaras Adresse', true],
        ], 'Sebastian arrive avec sa tablette : la photo de Yara publiée sur le réseau a reçu une réponse, avec une adresse. Le lendemain, Lisa et Nico veulent y aller après le cours.'),
        choice('q8', bi('Lisa telefoniert über Nawins Zimmer. Was hat die Wohnung nicht?', 'Lisa parle de la chambre de Nawin au téléphone. Qu’est-ce que l’appartement n’a pas ?'), [
          ['eine Terrasse'],
          ['einen Aufzug', true],
          ['eine Küche'],
        ], 'Au téléphone, un candidat pour la chambre de Nawin pose des questions : l’appartement a une terrasse, mais l’immeuble n’a pas d’ascenseur (« kein Aufzug »), ni garage. La cuisine, on l’a vue la veille.'),
      ],
    },
    {
      title: 'Falsche Adresse, neue Mitbewohner? · Mauvaise adresse, nouveaux colocataires ?',
      episodes: [24, 28], start: '33:07', end: '40:02', approx: true,
      context: contexte({
        episodes: [24, 28],
        situation: [
          ['Lisa und Nico gehen zu der Adresse aus dem Internet.', 'Lisa et Nico vont à l’adresse trouvée sur Internet.'],
          ['In der WG wird Nawins Zimmer frei. Wer wohnt bald dort?', 'Dans la colocation, la chambre de Nawin va se libérer. Qui va bientôt y habiter ?'],
        ],
        questions: [
          ['Was ist für Sie in einer WG wichtig: Ruhe, Sauberkeit, nette Leute?', 'Qu’est-ce qui compte pour vous en colocation : le calme, la propreté, des gens sympathiques ?'],
          ['Wo schlafen Sie auf Reisen: im Hotel oder in einer Jugendherberge?', 'Où dormez-vous en voyage : à l’hôtel ou dans une auberge de jeunesse ?'],
        ],
        focus: [
          ['Achten Sie auf die Farben und auf die Zimmer der Wohnung.', 'Soyez attentif aux couleurs et aux pièces de l’appartement.'],
        ],
      }),
      keywords: [
        mot('falsch', 'faux'),
        mot('umziehen', 'déménager', 'séparable : Ich ziehe um.'),
        nom('die', 'Heizung', 'Heizungen', 'le chauffage'),
        nom('die', 'Jugendherberge', 'Jugendherbergen', 'l’auberge de jeunesse'),
        mot('teuer', 'cher'),
        nom('das', 'Wohnzimmer', 'Wohnzimmer', 'le salon'),
        nom('die', 'Miete', 'Mieten', 'le loyer'),
        nom('das', 'Bad', 'Bäder', 'la salle de bain'),
        mot('sauber', 'propre', 'contraire : dreckig, sale'),
        mot('laut', 'bruyant, fort'),
      ],
      questions: [
        choice('q1', bi('Was finden Lisa und Nico in der August-Straußberg-Gasse 23?', 'Que trouvent Lisa et Nico au 23, August-Straußberg-Gasse ?'), [
          ['den Laden von Yara'],
          ['keinen Fahrradladen', true],
          ['eine Polizeistation'],
        ], 'L’adresse existe bien, mais il n’y a aucun magasin de vélos : Lisa conclut que l’adresse publiée sur Internet est fausse. Nico ne retrouve donc pas sa tante.'),
        choice('q2', bi('Warum kann Nico nur noch zwei Tage in der WG bleiben?', 'Pourquoi Nico ne peut-il rester que deux jours dans la colocation ?'), [
          ['Marvin nimmt sein Zimmer.'],
          ['Nico fliegt nach Spanien.'],
          ['Die WG fährt in Urlaub.', true],
        ], 'Le chauffage de l’appartement est en panne, et Lisa, Sebastian, Nina et Nawin partent en vacances. Nico doit donc trouver un autre endroit où dormir.'),
        choice('q3', bi('Wo soll Nico schlafen? Was ist besser als ein Hotel, sagt Lisa?', 'Où Nico devrait-il dormir ? Selon Lisa, qu’est-ce qui vaut mieux qu’un hôtel ?'), [
          ['eine Jugendherberge', true],
          ['eine eigene Wohnung'],
          ['das Auto von Lisa'],
        ], 'Nico veut chercher un hôtel, mais Lisa trouve cela trop cher. Une auberge de jeunesse ou un hostel coûte moins cher, et beaucoup de jeunes y dorment.'),
        fill('q4', bi('Ergänzen Sie die Informationen zum Zimmer.', 'Complétez les informations sur la chambre.'), 'Das Zimmer hat [[1]] Quadratmeter. Die Miete kostet [[2]] Euro im Monat.', [
          ['11', 'elf'],
          ['400', 'vierhundert'],
        ], 'Nawin pense que sa chambre fait dix mètres carrés, mais Lisa corrige : onze. Le loyer est de 400 € par mois, charges comprises (mit Nebenkosten).'),
        match('q5', bi('Wer ist wer? Verbinden Sie.', 'Qui est qui ? Associez.'), [
          ['Marvin', 'möchte das Zimmer sofort nehmen'],
          ['Wolfgang', 'möchte die Möbel ändern'],
          ['Ulla', 'fragt nach dem Bad und den Nachbarn'],
        ], 'Marvin visite vite et dit tout de suite oui. Wolfgang trouve la table laide et veut installer sa batterie et des tapis. Ulla s’inquiète de la salle de bain, de la propreté et des voisins.'),
        choice('q6', bi('Wie viele Bäder hat die Wohnung?', 'Combien de salles de bain l’appartement a-t-il ?'), [
          ['zwei Bäder'],
          ['fünf Bäder'],
          ['ein Bad', true],
        ], 'Nawin le dit à Marvin : cinq pièces, une cuisine et une salle de bain. Ulla espère avoir sa propre salle de bain, mais tout le monde se douche dans la même.'),
        choice('q7', bi('Lisa sagt: „Ich sehe was, was du nicht siehst.“ Was ist das?', 'Lisa dit « Ich sehe was, was du nicht siehst ». De quoi s’agit-il ?'), [
          ['une chanson pour enfants'],
          ['un jeu : deviner un objet', true],
          ['une façon de demander son chemin'],
        ], 'C’est un jeu de devinettes très connu (« je vois quelque chose que tu ne vois pas ») : on donne un indice, une couleur ou une taille, et l’autre devine. Lisa et Nico y jouent en marchant.'),
        order('q8', bi('Ordnen Sie die Szenen.', 'Remettez les scènes dans l’ordre.'), [
          ['Lisa und Nico finden keinen Laden.', 'Marvin sieht das Zimmer an.', 'Wolfgang hat viele Ideen.', 'Ulla stellt viele Fragen.'],
        ], 'D’abord la fausse adresse ; ensuite les visites de la chambre de Nawin : Marvin, puis Wolfgang et ses idées de décoration, enfin Ulla et ses nombreuses questions.'),
      ],
    },
    {
      title: 'Ein Tag mit Emma · Une journée avec Emma',
      episodes: [29, 33], start: '40:02', end: '46:48', approx: true,
      context: contexte({
        episodes: [29, 33],
        situation: [
          ['Eine Kollegin von Lisa ist krank. Lisa muss morgen arbeiten.', 'Une collègue de Lisa est malade. Lisa doit travailler demain.'],
          ['Aber wer bleibt bei Emma?', 'Mais qui reste avec Emma ?'],
          ['Später wartet Nico in einem Restaurant auf Lisa.', 'Plus tard, Nico attend Lisa dans un restaurant.'],
        ],
        questions: [
          ['Wie sieht Ihr Tag aus? Wann stehen Sie auf?', 'Comment se passe votre journée ? À quelle heure vous levez-vous ?'],
          ['Einen ganzen Tag mit einem Kind: Was ist leicht, was ist schwer?', 'Une journée entière avec un enfant : qu’est-ce qui est facile, qu’est-ce qui est difficile ?'],
        ],
        focus: [
          ['Achten Sie auf die Uhrzeiten und die Wochentage.', 'Soyez attentif aux heures et aux jours de la semaine.'],
        ],
      }),
      keywords: [
        mot('krank', 'malade'),
        mot('aufpassen auf', 'surveiller, garder', 'séparable : Nico passt auf Emma auf.'),
        mot('aufstehen', 'se lever', 'séparable : Emma steht um halb sieben auf.'),
        mot('halb', 'et demie', 'halb sieben = 6 h 30 (la demie avant sept heures)'),
        nom('die', 'Hausaufgabe', 'Hausaufgaben', 'le devoir (scolaire)', 'surtout au pluriel : die Hausaufgaben machen'),
        mot('aufräumen', 'ranger', 'séparable : Ich räume mein Zimmer auf.'),
        mot('fernsehen', 'regarder la télévision', 'séparable : Emma sieht fern.'),
        nom('das', 'Eis', null, 'la glace (dessert)'),
        mot('pünktlich', 'à l’heure, ponctuel'),
        mot('geschlossen', 'fermé', 'contraire : geöffnet, ouvert'),
      ],
      questions: [
        choice('q1', bi('Warum braucht Lisa morgen einen Babysitter?', 'Pourquoi Lisa a-t-elle besoin de quelqu’un pour garder Emma demain ?'), [
          ['Sie hat morgen einen Termin beim Arzt.'],
          ['Sie unterrichtet für eine kranke Kollegin.', true],
          ['Sie fährt morgen früh in Urlaub.'],
        ], 'Manja, une collègue de Lisa, est malade : Lisa fait son cours demain à 9 heures. C’est Nina qui a rendez-vous chez le médecin, à 8 heures.'),
        match('q2', bi('Wer macht morgen was? Verbinden Sie.', 'Qui fait quoi demain ? Associez.'), [
          ['Sebastian', 'arbeitet und hat dann Volleyball'],
          ['Nawin', 'ist den ganzen Tag in der Uni'],
          ['Nina', 'geht zum Arzt und dann in die Schule'],
          ['Nico', 'passt auf Emma auf'],
        ], 'Personne n’est libre : Sebastian travaille de 8 à 12 h puis a son entraînement de volley, Nawin est à l’université de 9 à 17 h, Nina va chez le médecin puis à l’école. Sebastian pense alors à Nico, qui accepte.'),
        fill('q3', bi('Emmas Tag: Ergänzen Sie.', 'La journée d’Emma : complétez.'), 'Emma steht um [[1]] sieben auf. Von vier bis halb fünf übt sie [[2]].', [
          ['halb'],
          ['Flöte', 'die Flöte'],
        ], 'Emma se lève à « halb sieben », c’est-à-dire 6 h 30 : en allemand, la demie se dit avec l’heure suivante. De 16 h à 16 h 30, elle s’exerce à la flûte, et Lisa veut vérifier.'),
        choice('q4', bi('Was isst Emma normalerweise zum Frühstück?', 'Que mange Emma d’habitude au petit-déjeuner ?'), [
          ['Brot mit Käse'],
          ['Gemüse mit Reis'],
          ['Müsli mit Milch', true],
        ], 'Lisa explique le programme : au petit-déjeuner, Emma mange en général du muesli avec du lait, parfois une pomme. Les légumes, c’est pour le déjeuner de midi.'),
        choice('q5', bi('„Emma und Nico haben alles nach Lisas Plan gemacht.“ Richtig, falsch oder nicht gesagt?', '« Emma et Nico ont tout fait selon le programme de Lisa. » Vrai, faux ou non dit ?'), [
          ['richtig'],
          ['nicht gesagt'],
          ['falsch', true],
        ], 'Au dîner, Emma et Nico racontent une journée parfaite. Mais Lisa trouve deux grandes boîtes de glace vides, et on voit la vraie journée : pas envie de devoirs, la télévision, la glace… et Emma qui a mal au ventre.'),
        order('q6', bi('Ordnen Sie die Szenen.', 'Remettez les scènes dans l’ordre.'), [
          ['Sebastian hat eine Idee: Nico.', 'Lisa erklärt Emmas Tag.', 'Emma erzählt von ihrer Woche.', 'Lisa findet leere Eisschachteln.'],
        ], 'Sebastian propose d’abord Nico comme baby-sitter ; le soir, Lisa explique la journée type d’Emma ; le lendemain soir, Emma raconte sa semaine de vacances ; puis Lisa découvre les boîtes de glace dans la poubelle.'),
        choice('q7', bi('Wann kommt Lisa ins Restaurant?', 'À quelle heure Lisa arrive-t-elle au restaurant ?'), [
          ['um Viertel vor eins', true],
          ['um halb zwölf'],
          ['um Viertel nach zwölf'],
        ], 'Nico attendait Lisa à 11 h 30 (halb zwölf). Lisa téléphone au restaurant : son entretien d’embauche dure plus longtemps, elle arrive à 12 h 45, « Viertel vor eins ».'),
        choice('q8', bi('Wann ist das Restaurant Marek geschlossen?', 'Quand le restaurant Marek est-il fermé ?'), [
          ['am Sonntag'],
          ['am Montag', true],
          ['am Dienstag'],
        ], 'Au téléphone, Tarek donne les horaires : ouvert du mardi au dimanche, de 9 h à 23 h ; fermé le lundi (« am Montag … geschlossen »).'),
      ],
    },
    {
      title: 'Im Restaurant Marek · Au restaurant Marek',
      episodes: [34, 38], start: '46:48', end: '53:35', approx: true,
      context: contexte({
        episodes: [34, 38],
        situation: [
          ['Nico wartet im Marek, dem Restaurant von Max und Tarek. Er hilft ein bisschen mit.', 'Nico attend au Marek, le restaurant de Max et Tarek. Il donne un coup de main.'],
          ['Im Restaurant hört er viele Termine, Uhrzeiten und Berufe.', 'Au restaurant, il entend beaucoup de rendez-vous, d’heures et de métiers.'],
          ['Und Nico braucht immer noch ein Zimmer.', 'Et Nico a toujours besoin d’une chambre.'],
        ],
        questions: [
          ['Was ist Ihr Beruf? Was ist Ihr Traumberuf?', 'Quel est votre métier ? Quel est le métier de vos rêves ?'],
          ['Wann treffen Sie Ihre Freunde? Wie verabreden Sie sich?', 'Quand voyez-vous vos amis ? Comment fixez-vous un rendez-vous ?'],
        ],
        focus: [
          ['Achten Sie auf die Daten und Uhrzeiten: Wann? Um wie viel Uhr?', 'Soyez attentif aux dates et aux heures : quand ? à quelle heure ?'],
        ],
      }),
      keywords: [
        nom('der', 'Termin', 'Termine', 'le rendez-vous'),
        mot('übermorgen', 'après-demain'),
        mot('reservieren', 'réserver', 'einen Tisch reservieren'),
        mot('Lust haben', 'avoir envie', 'Hast du Lust? : Tu as envie ?'),
        nom('der', 'Stau', 'Staus', 'l’embouteillage'),
        mot('frei', 'libre', 'Es sind keine Zimmer mehr frei.'),
        nom('der', 'Beruf', 'Berufe', 'le métier'),
        nom('das', 'Bewerbungsgespräch', 'Bewerbungsgespräche', 'l’entretien d’embauche'),
        nom('der', 'Kunde', 'Kunden', 'le client', 'féminin : die Kundin'),
        nom('die', 'Mappe', 'Mappen', 'la pochette, le dossier'),
      ],
      questions: [
        choice('q1', bi('Wann hat Tarek morgen einen Termin?', 'À quelle heure Tarek a-t-il un rendez-vous demain ?'), [
          ['um halb zwölf'],
          ['um Viertel vor acht'],
          ['um halb eins', true],
        ], 'Tarek demande à Max de venir plus tôt : il a un rendez-vous à 12 h 30, « um halb eins ». Viertel vor acht (19 h 45), c’est l’heure de la table réservée par un client au téléphone.'),
        fill('q2', bi('Ergänzen Sie das Datum.', 'Complétez la date.'), 'Morgen ist der [[1]]. Übermorgen ist der [[2]].', [
          ['Zweiundzwanzigste', 'zweiundzwanzigste', '22.'],
          ['Dreiundzwanzigste', 'dreiundzwanzigste', '23.'],
        ], 'Max se moque gentiment de Tarek : si demain est le 22, après-demain (übermorgen) est le 23. Pour la date, on dit der Zweiundzwanzigste : nombre + -ste à partir de vingt.'),
        choice('q3', bi('Wann spielen die Freunde Fußball?', 'Quand les amis jouent-ils au football ?'), [
          ['nächste Woche am Freitag um zwei', true],
          ['nächste Woche am Samstag um eins'],
          ['diese Woche am Freitag um eins'],
        ], 'Max ne peut pas cette semaine, Yanis pas le samedi : ce sera vendredi prochain. Yanis propose 13 h, mais Max ne peut qu’à 14 h ; à la fin, il corrige encore Yanis : « um zwei ».'),
        choice('q4', bi('Warum fragt Max: „Spielst du mit uns Fußball?“', 'Pourquoi Max demande-t-il à Nico de jouer au football avec eux ?'), [
          ['Max kann selbst nicht spielen.'],
          ['Sie brauchen noch einen Spieler.', true],
          ['Nico ist ein Profi.'],
        ], 'Robert ne peut pas venir le vendredi : ils ne sont plus que sept, et il leur faut une huitième personne. Max propose donc à Nico de jouer, et Nico accepte avec plaisir.'),
        choice('q5', bi('Warum kommt Lisa so spät?', 'Pourquoi Lisa arrive-t-elle si tard ?'), [
          ['Sie hat den Bus verpasst.'],
          ['Sie war beim Arzt.'],
          ['Sie stand lange im Stau.', true],
        ], 'Lisa s’excuse : la circulation était catastrophique, elle est restée une demi-heure dans les embouteillages (im Stau). Elle explique le mot à Nico : trop de voitures, tout avance lentement.'),
        choice('q6', bi('Wo kann Nico jetzt wohnen?', 'Où Nico peut-il habiter maintenant ?'), [
          ['bei Inge', true],
          ['in einem Hostel'],
          ['bei Max und Tarek'],
        ], 'Toutes les chambres des auberges sont réservées. Inge, une habituée du restaurant, entend la conversation et propose d’héberger Nico quelques jours chez elle ; elle lui donne son adresse.'),
        match('q7', bi('Welcher Beruf? Verbinden Sie.', 'Quel métier ? Associez.'), [
          ['Max', 'war Bankkaufmann'],
          ['Tarek', 'ist Elektriker von Beruf'],
          ['Lisa', 'ist Lehrerin für Deutsch und Englisch'],
          ['Nicos Eltern', 'finden Ingenieur gut'],
        ], 'Max a longtemps travaillé dans une banque et Tarek est électricien de formation : ensemble, ils ont ouvert le restaurant où ils sont leurs propres chefs. Lisa enseigne l’allemand et l’anglais ; les parents de Nico voudraient qu’il devienne ingénieur.'),
        order('q8', bi('Ordnen Sie die Szenen.', 'Remettez les scènes dans l’ordre.'), [
          ['Nico hilft im Restaurant.', 'Lisa kommt zu spät.', 'Inge gibt Nico ihre Adresse.', 'Max findet Lisas Mappe.'],
        ], 'Nico aide d’abord Max et Tarek pendant le service ; Lisa arrive ensuite en retard ; Inge propose une chambre et donne son adresse ; après le départ de Lisa, Max trouve la pochette de candidature qu’elle a oubliée.'),
      ],
    },
    {
      title: 'Schnell, die Mappe! · Vite, le dossier !',
      episodes: [39, 43], start: '53:35', end: '1:00:36', approx: true,
      context: contexte({
        episodes: [39, 43],
        situation: [
          ['Lisa hat gleich ein Bewerbungsgespräch, aber ihre Mappe ist im Restaurant.', 'Lisa a bientôt un entretien d’embauche, mais son dossier est resté au restaurant.'],
          ['Max und Nico laufen los. Danach muss Nico seine Sachen packen.', 'Max et Nico partent en courant. Ensuite, Nico doit faire ses bagages.'],
        ],
        questions: [
          ['Sie suchen einen Raum in einem großen Gebäude. Wen fragen Sie? Was sagen Sie?', 'Vous cherchez une salle dans un grand bâtiment. À qui demandez-vous ? Que dites-vous ?'],
          ['Warum ist Nico wohl nach Deutschland gekommen? Was glauben Sie?', 'À votre avis, pourquoi Nico est-il venu en Allemagne ?'],
        ],
        focus: [
          ['Achten Sie auf die Wege: links, rechts, an der Ampel, mit dem Bus.', 'Soyez attentif aux itinéraires : à gauche, à droite, au feu, en bus.'],
        ],
      }),
      keywords: [
        nom('der', 'Aufzug', 'Aufzüge', 'l’ascenseur'),
        nom('die', 'Etage', 'Etagen', 'l’étage'),
        mot('links', 'à gauche', 'contraire : rechts, à droite'),
        mot('studieren', 'faire des études'),
        nom('das', 'Notizbuch', 'Notizbücher', 'le carnet'),
        nom('die', 'Ampel', 'Ampeln', 'le feu (de circulation)'),
        nom('die', 'Kreuzung', 'Kreuzungen', 'le carrefour'),
        nom('die', 'Haltestelle', 'Haltestellen', 'l’arrêt (de bus, de tram)'),
        nom('die', 'Straßenbahn', 'Straßenbahnen', 'le tramway'),
        mot('zu Fuß', 'à pied'),
      ],
      questions: [
        choice('q1', bi('Wo ist das Bewerbungsgespräch heute?', 'Où a lieu l’entretien aujourd’hui ?'), [
          ['in der dritten Etage'],
          ['in der vierten Etage', true],
          ['neben den Toiletten'],
        ], 'L’employé de l’accueil dit d’abord « troisième étage », puis se corrige : aujourd’hui, les entretiens ont lieu au quatrième, près de la cantine, salle 431. Les toilettes, c’est l’endroit où Max et Nico regardent le plan.'),
        choice('q2', bi('Lisa sagt: „Ihr seid meine Retter!“ Was meint sie?', 'Lisa dit « Ihr seid meine Retter! ». Que veut-elle dire ?'), [
          ['Vous êtes en retard !'],
          ['Vous m’avez sauvée !', true],
          ['Vous vous êtes perdus !'],
        ], 'Der Retter, c’est le sauveur (retten : sauver). Sans son dossier, Lisa n’aurait pas pu passer son entretien : Max et Nico arrivent juste à temps, et elle les remercie quatre fois.'),
        choice('q3', bi('Warum ist Nico in Deutschland?', 'Pourquoi Nico est-il en Allemagne ?'), [
          ['Er will hier studieren.'],
          ['Er will nicht mehr studieren.', true],
          ['Er sucht Arbeit in einer Bank.'],
        ], 'Nico se confie à Max : il déteste ses études, mais son père veut qu’il continue. Il est parti pour s’éloigner de chez lui. La banque, c’est l’ancien métier de Max.'),
        choice('q4', bi('Was schenkt Emma Nico?', 'Qu’est-ce qu’Emma offre à Nico ?'), [
          ['ein Notizbuch für neue Wörter', true],
          ['ein Bild von ihrem Opa'],
          ['eine Tasche für die Reise'],
        ], 'Nico offre à Emma le dessin qu’il a fait ; Emma lui donne en retour un carnet pour noter tous ses nouveaux mots d’allemand, et des bulles de savon. Une bonne idée pour votre carnet aussi !'),
        fill('q5', bi('Wo wohnt Nico jetzt? Ergänzen Sie.', 'Où Nico habite-t-il maintenant ? Complétez.'), 'Nico wohnt jetzt bei Frau [[1]] in der [[2]].', [
          ['Kohlhaas'],
          ['Kälberstraße', 'Kälberstrasse', 'Kälber-Straße'],
        ], 'Inge s’appelle Frau Kohlhaas ; elle habite Kälberstraße, près du restaurant et de l’école de langues. Avec Emma, Nico la cherche sur le plan de la ville.'),
        choice('q6', bi('Was hat Jürgen Brunner gefunden?', 'Qu’a trouvé Jürgen Brunner ?'), [
          ['Nicos Tasche'],
          ['Nicos Pass'],
          ['Yaras Fahrradladen', true],
        ], 'Le sac reste introuvable (« leider nicht »), mais le père de Lisa a trouvé une Yara González qui a un magasin de vélos : c’est bien celui de la photo. Il est dans la rue dont Nico se souvenait mal.'),
        choice('q7', bi('Wie kommen Lisa und Nico zum Laden?', 'Comment Lisa et Nico vont-ils au magasin ?'), [
          ['mit der U-Bahn bis zur Uni'],
          ['zuerst mit dem Bus, dann zu Fuß', true],
          ['mit dem Taxi bis vor die Tür'],
        ], 'Jürgen explique : en bus jusqu’à la Grafenplatz, puis à pied par la Krugstraße et le carrefour. Le métro jusqu’à l’université, c’est le trajet de Jürgen et Emma pour rentrer.'),
        match('q8', bi('Wer arbeitet oder wohnt wo? Verbinden Sie.', 'Qui travaille ou habite où ? Associez.'), [
          ['Max und Tarek', 'am Friedensplatz'],
          ['Lisa', 'neben dem Theater'],
          ['Emmas Opa', 'in der Polizeistation'],
          ['Nico', 'in der Kälberstraße'],
        ], 'Sur le plan, Lisa montre la Friedensplatz, où se trouve le restaurant de Max et Tarek, et son lieu de travail près du théâtre. Emma montre le commissariat de son grand-père ; Nico habite désormais Kälberstraße.'),
      ],
    },
    {
      title: 'Bei Inge · Chez Inge',
      episodes: [44, 48], start: '1:00:36', end: '1:07:43', approx: true,
      context: contexte({
        episodes: [44, 48],
        situation: [
          ['Endlich stehen Lisa und Nico vor Yaras Laden.', 'Lisa et Nico sont enfin devant le magasin de Yara.'],
          ['Dann zieht Nico zu Inge. Sie ist sehr nett, aber in ihrer Küche ist nicht alles einfach.', 'Ensuite, Nico s’installe chez Inge. Elle est très gentille, mais dans sa cuisine, tout n’est pas simple.'],
        ],
        questions: [
          ['Was essen und trinken Sie gern? Was mögen Sie nicht?', 'Qu’aimez-vous manger et boire ? Qu’est-ce que vous n’aimez pas ?'],
          ['Welche Hausarbeit machen Sie gern, welche nicht?', 'Quelles tâches ménagères aimez-vous faire, lesquelles pas du tout ?'],
          ['Was machen Sie am liebsten in Ihrer Freizeit?', 'Que préférez-vous faire pendant votre temps libre ?'],
        ],
        focus: [
          ['Achten Sie auf gern, lieber und am liebsten.', 'Soyez attentif à gern, lieber et am liebsten (aimer, préférer, préférer par-dessus tout).'],
        ],
      }),
      keywords: [
        mot('geschlossen', 'fermé', 'vorübergehend geschlossen : fermé temporairement'),
        nom('der', 'Kühlschrank', 'Kühlschränke', 'le réfrigérateur'),
        nom('das', 'Obst', null, 'les fruits'),
        nom('die', 'Schorle', 'Schorlen', 'le jus coupé d’eau gazeuse'),
        mot('lieber', 'plutôt, de préférence', 'gern → lieber → am liebsten'),
        mot('abwaschen', 'faire la vaisselle', 'séparable : Ich wasche ab.'),
        nom('der', 'Staubsauger', 'Staubsauger', 'l’aspirateur'),
        nom('die', 'Hausarbeit', null, 'le ménage, les tâches ménagères'),
        nom('die', 'Freizeit', null, 'le temps libre, les loisirs'),
        mot('angeln', 'pêcher (à la ligne)'),
      ],
      questions: [
        choice('q1', bi('Was sehen Lisa und Nico am Fahrradladen?', 'Que voient Lisa et Nico au magasin de vélos ?'), [
          ['Yara ist im Laden.'],
          ['Der Laden ist geschlossen.', true],
          ['Der Laden ist jetzt ein Café.'],
        ], 'Un panneau indique « vorübergehend geschlossen » : fermé pour le moment. Lisa explique le mot à Nico : geschlossen, zu. Yara n’est pas là, et Nico ne comprend pas pourquoi.'),
        match('q2', bi('Was passt zusammen? Verbinden Sie.', 'Qu’est-ce qui va ensemble ? Associez.'), [
          ['das Obst', 'Äpfel, Orangen und Birnen'],
          ['das Frühstück', 'Marmelade, Butter und Quark'],
          ['das Gemüse', 'Karotten und Tomaten'],
          ['die Hausarbeit', 'abwaschen und staubsaugen'],
        ], 'Inge range ses courses : les fruits sur une assiette, puis tout pour le petit-déjeuner. Avec Nico, elle parle ensuite de légumes, et le ménage arrive vite : vaisselle, aspirateur, balai.'),
        fill('q3', bi('Was ist eine Schorle? Ergänzen Sie.', 'Qu’est-ce qu’une Schorle ? Complétez.'), 'Eine Apfelsaftschorle ist Apfelsaft mit [[1]].', [
          ['Mineralwasser', 'Wasser', 'Sprudel', 'Sprudelwasser'],
        ], 'Nico ne connaît pas le mot ; Inge explique : du jus avec de l’eau minérale (gazeuse). La Schorle est une boisson très courante en Allemagne.'),
        choice('q4', bi('Was isst Nico lieber als Karotten?', 'Que Nico préfère-t-il aux carottes ?'), [
          ['Tomaten', true],
          ['Kohlrabi'],
          ['Gurken'],
        ], 'Nico mange volontiers des carottes (gern), mais il préfère les tomates (lieber). Le chou-rave, en revanche, il ne le trouve pas très bon.'),
        choice('q5', bi('„Inge macht gern Hausarbeit.“ Richtig, falsch oder nicht gesagt?', '« Inge aime faire le ménage. » Vrai, faux ou non dit ?'), [
          ['richtig'],
          ['falsch', true],
          ['nicht gesagt'],
        ], 'Inge le dit clairement : elle déteste le ménage (« Ich hasse Hausarbeit ») et trouve horrible de tout recommencer. Nico non plus n’aime pas cela.'),
        choice('q6', bi('Warum essen Inge und Nico mittags im Marek?', 'Pourquoi Inge et Nico déjeunent-ils au Marek ?'), [
          ['Max hat heute Geburtstag.'],
          ['Inge hat nichts eingekauft.'],
          ['Das Fleisch ist verbrannt.', true],
        ], 'Pendant le ménage, Inge oublie la viande sur le feu : elle brûle. Ils vont donc manger des escalopes au Marek. Les courses, elle les avait faites : son réfrigérateur était même trop petit.'),
        choice('q7', bi('Was macht Nico am liebsten?', 'Que préfère faire Nico par-dessus tout ?'), [
          ['joggen'],
          ['schwimmen'],
          ['angeln', true],
        ], 'Nico n’aime pas courir et nage seulement de temps en temps ; ce qu’il préfère, c’est la pêche (angeln). Max et Tarek aussi : c’est leur loisir préféré.'),
        choice('q8', bi('Was entdeckt Nico auf den Fotos von Max?', 'Que découvre Nico sur les photos de Max ?'), [
          ['Yara, seine Tante', true],
          ['seine Tasche'],
          ['Inges Schwester'],
        ], 'Max cherche une photo de pêche avec un énorme brochet. Sur une photo, Nico reconnaît Yara : Max la connaît ! Pour Nico, c’est enfin une vraie piste.'),
      ],
    },
    {
      title: 'Einkaufen und kochen · Faire les courses et cuisiner',
      episodes: [49, 53], start: '1:07:43', end: '1:14:26', approx: true,
      context: contexte({
        episodes: [49, 53],
        situation: [
          ['Max kennt Yara. Er zeigt Nico ihren Laden.', 'Max connaît Yara. Il montre son magasin à Nico.'],
          ['Dann gehen Inge und Nico einkaufen: beim Bäcker und auf dem Markt.', 'Puis Inge et Nico vont faire les courses : chez le boulanger et au marché.'],
          ['Am Ende sehen wir einen Mann in einem Taxi.', 'À la fin, on voit un homme dans un taxi.'],
        ],
        questions: [
          ['Wo kaufen Sie gern ein: im Supermarkt oder auf dem Markt?', 'Où aimez-vous faire vos courses : au supermarché ou au marché ?'],
          ['Wie fragt man nach dem Preis? Welche Sätze kennen Sie?', 'Comment demande-t-on le prix ? Quelles phrases connaissez-vous ?'],
        ],
        focus: [
          ['Achten Sie auf die Mengen und die Preise.', 'Soyez attentif aux quantités et aux prix.'],
        ],
      }),
      keywords: [
        nom('der', 'Einkaufszettel', 'Einkaufszettel', 'la liste de courses'),
        nom('das', 'Hähnchen', 'Hähnchen', 'le poulet'),
        nom('die', 'Gurke', 'Gurken', 'le concombre'),
        nom('das', 'Pfund', 'Pfunde', 'la livre (500 grammes)', 'ein Pfund Tomaten : sans « de »'),
        nom('der', 'Bäcker', 'Bäcker', 'le boulanger', 'beim Bäcker : à la boulangerie'),
        nom('der', 'Markt', 'Märkte', 'le marché'),
        mot('Ich hätte gern …', 'Je voudrais…', 'formule polie pour commander ou acheter'),
        mot('kosten', 'coûter', 'Was kostet das? / Wie viel kostet das?'),
        mot('zurück', 'en retour, rendu', '7,60 Euro zurück : 7,60 € de monnaie'),
        nom('der', 'Ofen', 'Öfen', 'le four'),
      ],
      questions: [
        choice('q1', bi('Warum hat Max einen Schlüssel für Yaras Laden?', 'Pourquoi Max a-t-il une clé du magasin de Yara ?'), [
          ['Er arbeitet in dem Laden.'],
          ['Er hat den Laden gekauft.'],
          ['Yara, Tarek und Max sind Freunde.', true],
        ], 'Max explique que Yara, Tarek et lui sont amis et s’entraident : ils ont la clé de son magasin, et elle a celle du restaurant. Mais ils ne savent pas où elle est ni quand elle reviendra.'),
        fill('q2', bi('Nicos Einkaufszettel: Ergänzen Sie.', 'La liste de courses de Nico : complétez.'), 'ein [[1]], drei Gurken und ein [[2]] Tomaten', [
          ['Hähnchen'],
          ['Pfund'],
        ], 'Max demande un poulet, trois concombres et une livre de tomates ; Inge l’aide à épeler. Ein Pfund, ce sont 500 grammes, un demi-kilo.'),
        choice('q3', bi('Was kauft Inge beim Bäcker?', 'Qu’achète Inge chez le boulanger ?'), [
          ['ein ganzes Roggenbrot'],
          ['zwei halbe Brote und Kuchen', true],
          ['nur zwei Stück Kuchen'],
        ], 'Inge hésite longtemps : elle demande le prix du pain de seigle, puis prend un demi-pain blanc et un demi-pain complet, plus deux parts de gâteau aux pommes.'),
        choice('q4', bi('Wie viele Gurken kauft Nico auf dem Markt?', 'Combien de concombres Nico achète-t-il au marché ?'), [
          ['drei Gurken'],
          ['zwei Gurken'],
          ['fünf Gurken', true],
        ], 'Max en voulait trois. Mais le marchand propose 90 centimes la pièce ou cinq pour 4 € : Nico prend l’offre et achète cinq concombres.'),
        fill('q5', bi('Ergänzen Sie die Preise.', 'Complétez les prix.'), 'Alles zusammen kostet [[1]] Euro. Nico gibt 20 Euro und bekommt [[2]] Euro zurück.', [
          ['12,40', '12.40', '12,4'],
          ['7,60', '7.60', '7,6'],
        ], 'Dattes, cinq concombres et une livre de tomates : 12,40 € en tout. Nico paie avec un billet de 20 € ; 20 − 12,40 = 7,60 € de monnaie (zurück).'),
        choice('q6', bi('Was schenkt der Verkäufer Inge und Nico?', 'Que leur offre le marchand ?'), [
          ['ein Kilo Bananen'],
          ['zwei Orangen', true],
          ['300 Gramm Datteln'],
        ], 'À la fin, le marchand leur offre deux oranges. Les bananes étaient en promotion, mais Nico n’en a pas pris ; les dattes, il les a payées.'),
        order('q7', bi('Wie macht man die Pizza? Ordnen Sie.', 'Comment fait-on la pizza ? Remettez dans l’ordre.'), [
          ['den Käse klein schneiden', 'Tomaten und Schinken schneiden', 'alles auf den Teig legen', 'die Pizza in den Ofen schieben'],
        ], 'Inge lit la recette : d’abord le fromage en petits morceaux, puis les tomates et le jambon en dés, tout sur la pâte, et enfin 20 minutes au four à 180 degrés.'),
        choice('q8', bi('Der Mann im Taxi telefoniert. Wie lange war er im Urlaub?', 'L’homme dans le taxi téléphone. Combien de temps a-t-il été en vacances ?'), [
          ['zwei Wochen', true],
          ['ein Wochenende'],
          ['zwei Monate'],
        ], 'Au téléphone, l’homme dit qu’il n’est parti que deux semaines : vacances magnifiques, mer, plage, photos de montagnes. Il dort à l’hôtel ce soir et rentre en train demain.'),
      ],
    },
    {
      title: 'Die Tasche ist wieder da! · Le sac est de retour !',
      episodes: [54, 59], start: '1:14:26', end: '1:23:12', approx: true,
      context: contexte({
        episodes: [54, 59],
        situation: [
          ['Nicos Tasche liegt irgendwo auf der Straße. Wer findet sie?', 'Le sac de Nico est quelque part dans la rue. Qui va le trouver ?'],
          ['Es ist Herbst, das Wetter ist kalt und grau.', 'C’est l’automne, il fait froid et gris.'],
          ['Und Nico braucht dringend neue Kleidung.', 'Et Nico a vraiment besoin de nouveaux vêtements.'],
        ],
        questions: [
          ['Sie finden eine Tasche auf der Straße. Was machen Sie?', 'Vous trouvez un sac dans la rue. Que faites-vous ?'],
          ['Welche Farbe tragen Sie am liebsten?', 'Quelle couleur préférez-vous porter ?'],
        ],
        focus: [
          ['Achten Sie auf das Wetter, die Farben und die Kleidung.', 'Soyez attentif au temps qu’il fait, aux couleurs et aux vêtements.'],
        ],
      }),
      keywords: [
        mot('kalt', 'froid', 'Im Dezember ist es am kältesten.'),
        nom('der', 'Frühling', 'Frühlinge', 'le printemps'),
        nom('der', 'Ausflug', 'Ausflüge', 'l’excursion, la sortie'),
        nom('die', 'Hochzeit', 'Hochzeiten', 'le mariage (la fête)'),
        mot('bewölkt', 'nuageux'),
        nom('der', 'Pullover', 'Pullover', 'le pull'),
        nom('das', 'Hemd', 'Hemden', 'la chemise'),
        nom('die', 'Mütze', 'Mützen', 'le bonnet'),
        nom('die', 'Lieblingsfarbe', 'Lieblingsfarben', 'la couleur préférée'),
        mot('anprobieren', 'essayer (un vêtement)', 'séparable : Probier mal das Hemd an!'),
      ],
      questions: [
        choice('q1', bi('Was nehmen die zwei Männer aus der Tasche?', 'Que prennent les deux hommes dans le sac ?'), [
          ['den Pass und das Handy'],
          ['alle grünen T-Shirts'],
          ['warme Sachen und ein Hemd', true],
        ], 'Les deux hommes hésitent, puis décident de ne prendre que « ce dont ils ont besoin » : des vêtements chauds pour l’hiver et une chemise pour le printemps. Le passeport, le téléphone et des t-shirts verts restent dans le sac.'),
        match('q2', bi('Was passt zusammen? Verbinden Sie.', 'Qu’est-ce qui va ensemble ? Associez.'), [
          ['im Dezember und Januar', 'ist es am kältesten'],
          ['im Mai', 'war Selmas Ausflug'],
          ['bei Selma heute', '7 Grad und bewölkt'],
          ['bei Lisa im Urlaub', 'Sonne und 20 Grad'],
        ], 'Pour les deux hommes, décembre et janvier sont les mois les plus froids. Selma a fait une excursion en mai. Au téléphone, elle compare : chez elle 7 degrés et des nuages, chez Lisa en vacances du soleil et 20 degrés.'),
        choice('q3', bi('Warum war Selma im Mai in der Nähe von Hamburg?', 'Pourquoi Selma était-elle près de Hambourg en mai ?'), [
          ['Sie hat dort Urlaub gemacht.'],
          ['Ihr Onkel hat geheiratet.', true],
          ['Sie hat dort einen Kurs gemacht.'],
        ], 'Selma précise que ce n’étaient pas de vraies vacances, seulement une excursion : la famille fêtait le mariage de son oncle, avec repas, danse, baignade dans un lac et barbecue.'),
        choice('q4', bi('Wie findet Inge Nicos Pullover?', 'Comment Inge trouve-t-elle le pull de Nico ?'), [
          ['zu groß und nicht so schön', true],
          ['modern und schön warm'],
          ['zu klein, aber elegant'],
        ], 'Le pull vient de Sebastian : il est beaucoup trop grand, et Inge n’aime pas sa couleur. Elle trouve que Nico a besoin d’une chemise chic, d’un pull chaud et d’un beau pantalon.'),
        choice('q5', bi('Was ist noch in der Tasche?', 'Qu’y a-t-il encore dans le sac ?'), [
          ['der warme Pullover'],
          ['der Pass und das Handy', true],
          ['das bunte Hemd'],
        ], 'Nico retrouve tout de suite son passeport et son téléphone. En revanche, son pull chaud et sa chemise colorée, sa chemise préférée, ont disparu : ce sont les vêtements pris par les deux hommes.'),
        fill('q6', bi('Ergänzen Sie.', 'Complétez.'), 'Nicos Lieblingsfarbe ist [[1]]. Das bunte Hemd war sein [[2]].', [
          ['Grün', 'grün'],
          ['Lieblingshemd'],
        ], 'Selma remarque que Nico a beaucoup de vêtements verts : c’est sa couleur préférée (Lieblingsfarbe). Avec Lieblings-, on forme « préféré » : das Lieblingshemd, la chemise préférée.'),
        choice('q7', bi('Selma sagt im Laden: „Das steht dir gut!“ Was bedeutet das?', 'Au magasin, Selma dit « Das steht dir gut! ». Qu’est-ce que cela veut dire ?'), [
          ['C’est en bon état.'],
          ['Reste debout !'],
          ['Ça te va bien !', true],
        ], 'Jemandem gut stehen : aller bien à quelqu’un (un vêtement, une couleur). Le verbe stehen veut aussi dire « être debout », mais ici Selma fait un compliment sur la tenue de Nico.'),
        order('q8', bi('Ordnen Sie die Szenen.', 'Remettez les scènes dans l’ordre.'), [
          ['Zwei Männer finden die Tasche.', 'Selma telefoniert mit Lisa.', 'Selma bringt Nico die Tasche.', 'Nico und Selma kaufen Kleidung.'],
        ], 'Deux hommes trouvent d’abord le sac dans la rue ; Selma, au téléphone avec Lisa, le reconnaît grâce à la description entendue à la radio ; elle le rapporte à Nico ; ensemble, ils vont acheter de nouveaux vêtements.'),
      ],
    },
    {
      title: 'Wo ist Yara? · Où est Yara ?',
      episodes: [60, 65], start: '1:23:12', end: '1:30:11', approx: true,
      context: contexte({
        episodes: [60, 65],
        situation: [
          ['Inge hat eine Überraschung für Nico. Dann klingelt es an der Tür.', 'Inge a une surprise pour Nico. Puis on sonne à la porte.'],
          ['Später suchen Jürgen, Max, Tarek und Nico in Yaras Laden nach Informationen.', 'Plus tard, Jürgen, Max, Tarek et Nico cherchent des informations dans le magasin de Yara.'],
        ],
        questions: [
          ['Wer gehört zu Ihrer Familie? Wo leben diese Personen?', 'Qui fait partie de votre famille ? Où vivent ces personnes ?'],
          ['Warum fährt man plötzlich weg, ohne viel zu sagen?', 'Pourquoi part-on soudain, sans dire grand-chose ?'],
        ],
        focus: [
          ['Achten Sie auf die Familie: Eltern, Brüder, Großeltern.', 'Soyez attentif à la famille : parents, frères, grands-parents.'],
          ['Achten Sie auch auf die Städte und Länder.', 'Soyez aussi attentif aux villes et aux pays.'],
        ],
      }),
      keywords: [
        nom('die', 'Überraschung', 'Überraschungen', 'la surprise'),
        nom('das', 'Portemonnaie', 'Portemonnaies', 'le porte-monnaie'),
        nom('die', 'Eltern', null, 'les parents', 'toujours au pluriel'),
        nom('die', 'Geschwister', null, 'les frères et sœurs', 'surtout au pluriel'),
        nom('der', 'Bruder', 'Brüder', 'le frère'),
        nom('die', 'Großeltern', null, 'les grands-parents', 'toujours au pluriel'),
        nom('der', 'Anwalt', 'Anwälte', 'l’avocat', 'féminin : die Anwältin'),
        nom('die', 'Schweiz', null, 'la Suisse', 'toujours avec l’article : in der Schweiz'),
        nom('der', 'Flug', 'Flüge', 'le vol (en avion)'),
        nom('der', 'Fußballschuh', 'Fußballschuhe', 'la chaussure de football'),
      ],
      questions: [
        choice('q1', bi('Wem gehört die Kleidung, die Inge Nico zeigt?', 'À qui appartenaient les vêtements qu’Inge montre à Nico ?'), [
          ['Sebastian'],
          ['ihrem Mann Günther', true],
          ['Inges Sohn'],
        ], 'Ce sont les vêtements de Günther, le mari d’Inge, qui est mort : il s’habillait toujours de façon élégante. Inge fait tout essayer à Nico. Le pull trop grand, lui, venait de Sebastian.'),
        choice('q2', bi('Warum kommt Selma zu Inge?', 'Pourquoi Selma vient-elle chez Inge ?'), [
          ['Sie bringt Nico eine Jacke.'],
          ['Sie möchte Inge kennenlernen.'],
          ['Sie sucht ihr Portemonnaie.', true],
        ], 'Pendant les achats, Selma a mis son porte-monnaie dans le sac noir de Nico. Elle vient le chercher ; Nico le lui rend : c’est le porte-monnaie marron.'),
        match('q3', bi('Wer lebt wo? Verbinden Sie.', 'Qui vit où ? Associez.'), [
          ['Selmas Eltern', 'mit Selma in Deutschland'],
          ['Selmas Brüder', 'in Hamburg'],
          ['Selmas Großeltern', 'in Syrien'],
          ['Nicos Bruder', 'in München'],
        ], 'Inge pose beaucoup de questions à Selma : elle vit en Allemagne avec ses parents depuis presque un an, ses deux frères aînés vivent à Hambourg et ses grands-parents en Syrie. Plus tard, Nico dit que son frère vit à Munich.'),
        fill('q4', bi('Nicos Eltern: Ergänzen Sie die Berufe.', 'Les parents de Nico : complétez les métiers.'), 'Nicos Vater ist [[1]] und seine Mutter ist [[2]].', [
          ['Anwalt'],
          ['Ingenieurin'],
        ], 'Nico montre une photo de ses parents : son père est avocat (Anwalt), sa mère ingénieure (Ingenieurin, féminin en -in). Ils vivent à Séville.'),
        choice('q5', bi('Wo ist Yara?', 'Où est Yara ?'), [
          ['in Spanien bei Nicos Eltern'],
          ['in der Schweiz, in Zürich', true],
          ['in München bei Nicos Bruder'],
        ], 'Jürgen trouve un indice dans le magasin, et Max s’étonne : Yara est en Suisse. Nico pense qu’elle n’est sûrement pas chez ses parents, car le contact entre eux n’est pas bon.'),
        choice('q6', bi('Warum ist Yara so schnell weggefahren?', 'Pourquoi Yara est-elle partie si vite ?'), [
          ['Sie hat einen neuen Job in Paris.'],
          ['Sie macht Urlaub in den Bergen.'],
          ['Eine Sarah ruft an und braucht Hilfe.', true],
        ], 'Le retour en arrière montre Yara au téléphone avec une certaine Sarah : elle promet de venir tout de suite et réserve un vol pour Zurich. Paris, c’est là que travaille le frère de Sarah.'),
        choice('q7', bi('„Nico möchte seinen Bruder anrufen.“ Richtig, falsch oder nicht gesagt?', '« Nico veut appeler son frère. » Vrai, faux ou non dit ?'), [
          ['richtig'],
          ['falsch', true],
          ['nicht gesagt'],
        ], 'Jürgen et Tarek proposent d’appeler le frère de Nico, mais Nico refuse : il dit qu’il n’a pas besoin de l’aide de son frère.'),
        choice('q8', bi('Was hat Nico für das Fußballtraining nicht dabei?', 'Qu’est-ce que Nico n’a pas pour l’entraînement de football ?'), [
          ['Fußballschuhe', true],
          ['einen Ball'],
          ['etwas zu trinken'],
        ], 'Tarek a acheté des ballons, des boissons et des saucisses pour le barbecue. Nico, lui, n’a pas de chaussures de football ; Tarek lui en prête une paire, et elles lui vont.'),
      ],
    },
    {
      title: 'Fußball und ein Unfall · Football et accident',
      episodes: [66, 71], start: '1:30:11', end: '1:36:29', approx: true,
      context: contexte({
        episodes: [66, 71],
        situation: [
          ['Nico spielt zum ersten Mal mit Max, Tarek und ihren Freunden Fußball.', 'Nico joue pour la première fois au football avec Max, Tarek et leurs amis.'],
          ['Alle wollen fit sein. Aber nicht alle essen gesund.', 'Tout le monde veut être en forme. Mais tout le monde ne mange pas sainement.'],
        ],
        questions: [
          ['Machen Sie Sport? Wie oft pro Woche?', 'Faites-vous du sport ? Combien de fois par semaine ?'],
          ['Sie haben einen Unfall beim Sport. Wohin gehen Sie? Was brauchen Sie?', 'Vous avez un accident en faisant du sport. Où allez-vous ? De quoi avez-vous besoin ?'],
        ],
        focus: [
          ['Achten Sie auf die Körperteile: Fuß, Bein, Knie, Arm.', 'Soyez attentif aux parties du corps : pied, jambe, genou, bras.'],
        ],
      }),
      keywords: [
        mot('trainieren', 's’entraîner'),
        mot('am schnellsten', 'le plus vite', 'schnell → schneller → am schnellsten'),
        nom('die', 'Ernährung', null, 'l’alimentation'),
        mot('gesund', 'sain, en bonne santé'),
        nom('der', 'Schmerz', 'Schmerzen', 'la douleur', 'Ich habe Schmerzen. : J’ai mal.'),
        mot('wehtun', 'faire mal', 'Wo tut es weh? : Où as-tu mal ?'),
        nom('der', 'Fuß', 'Füße', 'le pied'),
        nom('die', 'Arztpraxis', 'Arztpraxen', 'le cabinet médical'),
        nom('die', 'Versichertenkarte', 'Versichertenkarten', 'la carte d’assurance maladie'),
        mot('gebrochen', 'cassé (os)'),
      ],
      questions: [
        choice('q1', bi('Wie oft trainieren die Freunde?', 'Combien de fois les amis s’entraînent-ils ?'), [
          ['dreimal pro Woche'],
          ['zweimal im Monat', true],
          ['jeden Tag'],
        ], 'Tarek l’avoue : environ deux fois par mois, surtout le week-end, car tout le monde travaille en semaine. Trois fois par semaine, c’est ce que font les « bons sportifs », selon Max.'),
        match('q2', bi('Wer ist der Beste worin? Verbinden Sie.', 'Qui est le meilleur dans quoi ? Associez.'), [
          ['Max', 'läuft am schnellsten'],
          ['Yanis', 'schießt am weitesten'],
          ['Tarek', 'spielt am schlechtesten, sagt er'],
        ], 'Tarek dit en riant que Max est le plus rapide ; Yanis répond qu’il tire le plus loin ; Tarek admet qu’il joue le moins bien. Le superlatif se forme avec am … -sten : am schnellsten, am weitesten.'),
        choice('q3', bi('Was ist für Tarek das Wichtigste?', 'Selon Tarek, qu’est-ce qui compte le plus ?'), [
          ['das Krafttraining'],
          ['viel Schlaf'],
          ['die Ernährung', true],
        ], 'Pour Tarek, le plus important, c’est l’alimentation : beaucoup de fruits, pas d’alcool, pas de tabac ; Nico ajoute « beaucoup d’eau ». La musculation, c’est l’idée de Yanis.'),
        choice('q4', bi('Warum gibt es beim Grillen kein Obst?', 'Pourquoi n’y a-t-il pas de fruits au barbecue ?'), [
          ['Yanis hat es vergessen.', true],
          ['Tarek mag kein Obst.'],
          ['Das Obst war zu teuer.'],
        ], 'Yanis devait acheter des pommes, des bananes et des poires, mais il a oublié. Il se console avec la viande, les légumes grillés et la salade de pommes de terre.'),
        choice('q5', bi('Wo hat Nico Schmerzen?', 'Où Nico a-t-il mal ?'), [
          ['am Knie'],
          ['am Fuß', true],
          ['am Arm'],
        ], 'Tarek demande si c’est le genou ou la jambe ; Nico répond : le pied (der Fuß). Yanis, lui, avait eu mal au bras il y a quelques semaines.'),
        choice('q6', bi('Was möchte die Sprechstundenhilfe von Nico?', 'Que demande l’assistante médicale à Nico ?'), [
          ['seinen Pass und seine Adresse'],
          ['seine Versichertenkarte', true],
          ['ein Rezept vom Hausarzt'],
        ], 'Comme Nico vient pour la première fois au cabinet, l’assistante demande sa carte d’assurance maladie. Elle annonce aussi que le médecin fera sans doute une radio du pied.'),
        choice('q7', bi('Lisa sagt im falschen Zimmer „Gute Besserung!“. Was bedeutet das?', 'Dans la mauvaise salle, Lisa dit « Gute Besserung! ». Qu’est-ce que cela veut dire ?'), [
          ['Bonne chance !'],
          ['Bon appétit !'],
          ['Bon rétablissement !', true],
        ], 'Gute Besserung se dit à une personne malade ou blessée : « bon rétablissement ». Lisa ouvre la mauvaise porte, voit un autre patient, s’excuse et lui souhaite un bon rétablissement.'),
        order('q8', bi('Ordnen Sie die Szenen.', 'Remettez les scènes dans l’ordre.'), [
          ['Die Freunde trainieren.', 'Yanis und Tarek grillen.', 'Nico verletzt sich.', 'Lisa öffnet das falsche Zimmer.'],
        ], 'L’entraînement commence ; pendant que Yanis et Tarek allument le barbecue, les autres continuent ; Nico se blesse au pied ; au cabinet médical, Lisa arrive et se trompe de salle.'),
      ],
    },
    {
      title: 'Eine neue Heimat? · Une nouvelle patrie ?',
      episodes: [72, 76], start: '1:36:29', end: '1:43:00', approx: true,
      context: contexte({
        episodes: [72, 76],
        situation: [
          ['Nico ist zurück bei Inge. Er muss sich jetzt ausruhen.', 'Nico est de retour chez Inge. Il doit maintenant se reposer.'],
          ['Selma erzählt Lisa von Syrien. Dann bekommt sie einen Anruf.', 'Selma parle de la Syrie à Lisa. Puis elle reçoit un appel.'],
          ['Und was macht Nico mit seiner Zukunft?', 'Et que va faire Nico de son avenir ?'],
        ],
        questions: [
          ['Was vermissen Sie, wenn Sie lange nicht zu Hause sind?', 'Qu’est-ce qui vous manque quand vous êtes longtemps loin de chez vous ?'],
          ['Was ist in Ihrem Land anders als in Deutschland?', 'Qu’est-ce qui est différent dans votre pays par rapport à l’Allemagne ?'],
          ['Wovon träumen Sie für Ihre Zukunft?', 'De quoi rêvez-vous pour votre avenir ?'],
        ],
        focus: [
          ['Achten Sie darauf, wie Selma Syrien und Deutschland vergleicht.', 'Soyez attentif à la manière dont Selma compare la Syrie et l’Allemagne.'],
        ],
      }),
      keywords: [
        mot('sich ausruhen', 'se reposer', 'séparable : Du musst dich ausruhen.'),
        nom('die', 'Tablette', 'Tabletten', 'le comprimé'),
        nom('die', 'Salbe', 'Salben', 'la pommade'),
        mot('dreimal täglich', 'trois fois par jour'),
        nom('die', 'Heimat', null, 'la patrie, le pays natal'),
        nom('die', 'Aufenthaltserlaubnis', 'Aufenthaltserlaubnisse', 'le titre de séjour'),
        nom('das', 'Heimweh', null, 'le mal du pays'),
        mot('vermissen', 'regretter (l’absence de), manquer', 'Ich vermisse meine Freunde. : Mes amis me manquent.'),
        mot('träumen von', 'rêver de', 'Ich träume von einem eigenen Laden.'),
        nom('die', 'Bremse', 'Bremsen', 'le frein'),
      ],
      questions: [
        choice('q1', bi('Ist Nicos Fuß gebrochen?', 'Le pied de Nico est-il cassé ?'), [
          ['Ja, er ist gebrochen.'],
          ['Das weiß der Arzt noch nicht.'],
          ['Nein, aber er muss sich ausruhen.', true],
        ], 'Nico rassure Inge : selon le médecin, le pied n’est pas cassé. Mais Lisa rappelle l’autre consigne du médecin : se reposer et ne pas bouger la jambe.'),
        fill('q2', bi('Was sagt der Arzt? Ergänzen Sie.', 'Que dit le médecin ? Complétez.'), 'Nico nimmt die Tabletten [[1]] täglich, nach dem [[2]]. Die Salbe benutzt er [[3]].', [
          ['dreimal', '3-mal', '3 mal', 'drei Mal'],
          ['Essen'],
          ['abends', 'am Abend'],
        ], 'Lisa répète la prescription : les comprimés trois fois par jour (dreimal täglich), après le repas, comme le demande Inge ; la pommade le soir, avant de dormir.'),
        choice('q3', bi('Welches Tier hat Selmas Familie in Damaskus?', 'Quel animal la famille de Selma a-t-elle à Damas ?'), [
          ['einen Hund'],
          ['einen Papagei', true],
          ['eine Katze'],
        ], 'Selma raconte : un petit oiseau, un perroquet appelé Leli. Il est resté en Syrie avec ses grands-parents ; d’après sa grand-mère, il attend chaque jour à la fenêtre.'),
        choice('q4', bi('Welche Nachricht bekommt Selma von ihrer Mutter?', 'Quelle nouvelle Selma reçoit-elle de sa mère ?'), [
          ['Die Großeltern kommen bald.'],
          ['Sie dürfen in Deutschland bleiben.', true],
          ['Sie müssen nach Syrien zurück.'],
        ], 'La mère de Selma annonce la grande nouvelle : la famille a obtenu son titre de séjour (die Aufenthaltserlaubnis). Ils peuvent rester en Allemagne.'),
        choice('q5', bi('Tarek fragt: „Hast du Heimweh?“ Was ist Heimweh?', 'Tarek demande « Hast du Heimweh? ». Qu’est-ce que le Heimweh ?'), [
          ['le chemin du retour'],
          ['le mal du pays', true],
          ['la maison de rêve'],
        ], 'Tarek l’explique : on est triste et on voudrait rentrer chez soi. Nico répond qu’il n’a pas le mal du pays : il se plaît ici, même si ses amis et le temps d’Espagne lui manquent un peu.'),
        match('q6', bi('Was sagt Selma über Syrien und Deutschland? Verbinden Sie.', 'Que dit Selma de la Syrie et de l’Allemagne ? Associez.'), [
          ['Im Winter in Syrien', 'ist es nicht so kalt.'],
          ['In Syrien isst man', 'viel Fleisch.'],
          ['Am Abend in Syrien', 'sind viele Menschen draußen.'],
          ['In Deutschland gibt es', 'viele Regeln.'],
        ], 'Selma compare : en Syrie aussi il y a quatre saisons, mais l’hiver est moins froid ; on y mange beaucoup de viande ; le soir, la rue est très vivante. En Allemagne, il y a plus de règles. Les gens, eux, sont aussi gentils.'),
        choice('q7', bi('Wovon träumt Nico?', 'De quoi rêve Nico ?'), [
          ['von einem eigenen Restaurant'],
          ['von einem Studium hier'],
          ['von einem eigenen Laden', true],
        ], 'Dans le magasin de Yara, Nico dit qu’il voudrait avoir son propre magasin. Le restaurant, c’était le rêve de Tarek, qui l’a réalisé en travaillant dur.'),
        order('q8', bi('Ordnen Sie die Szenen.', 'Remettez les scènes dans l’ordre.'), [
          ['Max und Tarek kochen Paella.', 'Nico geht mit Tarek in Yaras Laden.', 'Nico repariert Tareks Fahrrad.', 'Yara ist plötzlich da.'],
        ], 'Max et Tarek offrent d’abord une paella à Nico ; puis Tarek l’emmène arroser les fleurs chez Yara ; Nico répare le frein arrière du vélo de Tarek ; enfin, une voix en colère dans la rue : c’est Yara !'),
      ],
    },
  ],
};
