// Couche pédagogique V4 · a2-berlin (lot A7, contenu A2).
// Berlin, son histoire et ses trajets : explications de toutes les questions, prétérit, vor / seit / von … bis et
// itinéraires en exercices typés, répétition validée, dictées et mission remise au professeur.

export default {
  module: 'a2-berlin',
  grammarFocus: ['praeteritum-modalverben-sein-haben', 'vor-seit-von-bis', 'itineraire-datif'],

  vocabulary: [
    { id: 'sehenswuerdigkeit', word: 'Sehenswürdigkeit', article: 'die', plural: 'Sehenswürdigkeiten', partOfSpeech: 'noun', translation: 'le monument, le lieu à voir',
      example: 'Berlin hat viele Sehenswürdigkeiten.', note: null },
    { id: 'tor', word: 'Tor', article: 'das', plural: 'Tore', partOfSpeech: 'noun', translation: 'la porte (monumentale)',
      example: 'Wir treffen uns vor dem Brandenburger Tor.', note: null },
    { id: 'turm', word: 'Turm', article: 'der', plural: 'Türme', partOfSpeech: 'noun', translation: 'la tour',
      example: 'Der Fernsehturm ist 368 Meter hoch.', note: 'der Fernsehturm : la tour de télévision' },
    { id: 'mauer', word: 'Mauer', article: 'die', plural: 'Mauern', partOfSpeech: 'noun', translation: 'le mur',
      example: 'Die Mauer stand von 1961 bis 1989 mitten in Berlin.', note: null },
    { id: 'grenze', word: 'Grenze', article: 'die', plural: 'Grenzen', partOfSpeech: 'noun', translation: 'la frontière',
      example: 'An der Grenze mussten wir lange warten.', note: null },
    { id: 'geschichte', word: 'Geschichte', article: 'die', plural: 'Geschichten', partOfSpeech: 'noun', translation: 'l’histoire',
      example: 'Die Geschichte von Berlin ist spannend.', note: 'aussi : une histoire, un récit' },
    { id: 'wiedervereinigung', word: 'Wiedervereinigung', article: 'die', plural: null, partOfSpeech: 'noun', translation: 'la réunification',
      example: 'Die Wiedervereinigung war 1990.', note: null },
    { id: 'krieg', word: 'Krieg', article: 'der', plural: 'Kriege', partOfSpeech: 'noun', translation: 'la guerre',
      example: 'Nach dem Krieg war Berlin geteilt.', note: 'der Frieden : la paix' },
    { id: 'geteilt', word: 'geteilt', article: null, plural: null, partOfSpeech: 'adjective', translation: 'divisé, partagé',
      example: 'Berlin war über vierzig Jahre geteilt.', note: null },
    { id: 'damals', word: 'damals', article: null, plural: null, partOfSpeech: 'adverb', translation: 'à l’époque',
      example: 'Damals war ich neunzehn.', note: null },
    { id: 'frueher', word: 'früher', article: null, plural: null, partOfSpeech: 'adverb', translation: 'autrefois, avant',
      example: 'Früher gab es hier eine Mauer.', note: null },
    { id: 'u-bahn', word: 'U-Bahn', article: 'die', plural: 'U-Bahnen', partOfSpeech: 'noun', translation: 'le métro',
      example: 'Nehmen Sie lieber die U-Bahn.', note: null },
    { id: 's-bahn', word: 'S-Bahn', article: 'die', plural: 'S-Bahnen', partOfSpeech: 'noun', translation: 'le train urbain (comme le RER)',
      example: 'Die S-Bahn fährt bis zum Ostbahnhof.', note: null },
    { id: 'strassenbahn', word: 'Straßenbahn', article: 'die', plural: 'Straßenbahnen', partOfSpeech: 'noun', translation: 'le tramway',
      example: 'Die Straßenbahn hält vor dem Bahnhof.', note: null },
    { id: 'linie', word: 'Linie', article: 'die', plural: 'Linien', partOfSpeech: 'noun', translation: 'la ligne',
      example: 'Nehmen Sie die Linie U5.', note: null },
    { id: 'haltestelle', word: 'Haltestelle', article: 'die', plural: 'Haltestellen', partOfSpeech: 'noun', translation: 'l’arrêt',
      example: 'Wo ist die nächste Haltestelle?', note: null },
    { id: 'einsteigen', word: 'einsteigen', article: null, plural: null, partOfSpeech: 'verb', translation: 'monter (dans un véhicule)',
      example: 'Hier können Sie in die U6 einsteigen.', note: 'séparable : ein|steigen · Perfekt : ist eingestiegen' },
    { id: 'aussteigen', word: 'aussteigen', article: null, plural: null, partOfSpeech: 'verb', translation: 'descendre (d’un véhicule)',
      example: 'Am Ostbahnhof müssen Sie aussteigen.', note: 'séparable : aus|steigen · Perfekt : ist ausgestiegen' },
    { id: 'umsteigen', word: 'umsteigen', article: null, plural: null, partOfSpeech: 'verb', translation: 'changer (de ligne)',
      example: 'Am Alexanderplatz müssen Sie umsteigen.', note: 'séparable : um|steigen · Perfekt : ist umgestiegen' },
    { id: 'abbiegen', word: 'abbiegen', article: null, plural: null, partOfSpeech: 'verb', translation: 'tourner (dans une rue)',
      example: 'An der Kreuzung müssen Sie links abbiegen.', note: 'séparable : Biegen Sie links ab.' },
    { id: 'geradeaus', word: 'geradeaus', article: null, plural: null, partOfSpeech: 'adverb', translation: 'tout droit',
      example: 'Gehen Sie geradeaus bis zur Ampel.', note: null },
    { id: 'kreuzung', word: 'Kreuzung', article: 'die', plural: 'Kreuzungen', partOfSpeech: 'noun', translation: 'le carrefour',
      example: 'Nehmen Sie die nächste Kreuzung rechts.', note: null },
    { id: 'ampel', word: 'Ampel', article: 'die', plural: 'Ampeln', partOfSpeech: 'noun', translation: 'le feu (de circulation)',
      example: 'An der Ampel biegen Sie rechts ab.', note: null },
    { id: 'richtung', word: 'Richtung', article: 'die', plural: 'Richtungen', partOfSpeech: 'noun', translation: 'la direction',
      example: 'Fahren Sie Richtung Ostbahnhof.', note: null },
    { id: 'sich-auskennen', word: 'sich auskennen', article: null, plural: null, partOfSpeech: 'verb', translation: 'connaître les lieux, s’y retrouver',
      example: 'In Berlin muss man sich gut auskennen.', note: 'séparable : Ich kenne mich hier nicht aus.' },
    { id: 'in-der-naehe', word: 'in der Nähe', article: null, plural: null, partOfSpeech: 'expression', translation: 'à proximité, près de',
      example: 'Die Station ist ganz in der Nähe.', note: 'in der Nähe von + datif' },
    { id: 'seit', word: 'seit', article: null, plural: null, partOfSpeech: 'preposition', translation: 'depuis',
      example: 'Seit 1990 ist Deutschland wieder vereint.', note: '+ datif ; avec le présent' },
    { id: 'vor', word: 'vor', article: null, plural: null, partOfSpeech: 'preposition', translation: 'il y a (temps)',
      example: 'Vor dreißig Jahren war die Stadt geteilt.', note: '+ datif : vor zwei Jahren' },
  ],

  activities: {
    'a2-berlin-wortschatz': {
      title: 'Découvrir : monuments, histoire et transports',
    },

    'a2-berlin-dialog': {
      title: 'Comprendre : demander son chemin à Berlin',
    },

    'a2-berlin-lesen': {
      title: 'Vérifier : lire l’histoire du Mur de Berlin',
      explanations: {
        q1: 'Le texte dit qu’en 1949 deux États sont nés et qu’« Ost-Berlin wurde die Hauptstadt der DDR ». Les secteurs, dont celui des États-Unis, datent de l’après-guerre et concernaient toute la ville.',
        q2: '« Viele Menschen wollten nicht in der DDR leben: Bis 1961 gingen Millionen in den Westen. » Les soldats ont fermé la frontière « deshalb », pour arrêter ces départs. Les manifestations datent de 1989.',
        q3: '« In der Nacht zum 13. August 1961 sperrten Soldaten deshalb die Grenze. » La fête sur le Mur a eu lieu en 1989 et les artistes ont peint la East Side Gallery en 1990.',
        q4: '« … rund um West-Berlin, insgesamt etwa 155 Kilometer. » 1,3 km est la longueur de la East Side Gallery, et 140 le nombre minimal de personnes mortes au Mur.',
        q5: '« Seit dem 3. Oktober 1990 ist Deutschland wieder vereint » : c’est la réunification. La frontière, elle, s’est ouverte le 9 novembre 1989.',
        q6: '« Heute zeigt eine doppelte Reihe aus Pflastersteinen, wo die Mauer früher stand. » Les peintures d’artistes se trouvent seulement sur la East Side Gallery.',
      },
    },

    'a2-berlin-geschichte-woerter': {
      title: 'Vérifier : écouter les mots de l’histoire allemande',
      lesson: {
        description: `Un locuteur natif, enregistré pour le manuel Deutsch im Blick, lit des mots pour parler de l’histoire allemande, toujours avec leur article. Extrait 1 : les deux États allemands et les mots pour parler d’une époque. Extrait 2 : les grandes étapes du XXe siècle et le temps qui passe. Lisez d’abord la liste et les questions, puis écoutez (autant de fois que nécessaire) : repérez l’article de chaque nom et répondez. La transcription s’affichera après votre réponse.

LES MOTS (sans article : à vous de l’entendre !)
Extrait 1
• Berliner Mauer — le Mur de Berlin
• Bundesrepublik Deutschland (BRD) — la République fédérale d’Allemagne (RFA)
• Deutsche Demokratische Republik (DDR) — la République démocratique allemande (RDA)
• Sowjetunion — l’Union soviétique ; DDR — la RDA (écoutez bien l’adjectif qui précède ces deux noms)
• Epoche — l’époque ; Ereignis — l’événement ; Gegenwart — le présent
Extrait 2
• Vergangenheit — le passé ; Zukunft — l’avenir
• Weimarer Republik — la république de Weimar (1919-1933)
• Wiederaufbau — la reconstruction, après 1945
• Wiedervereinigung — la réunification, en 1990
• Wirtschaft — l’économie ; Wirtschaftswunder — le « miracle économique » de la RFA dans les années 1950 ; Wirtschaftskrise — la crise économique

ASTUCE : LE GENRE DES NOMS
• Un nom composé prend le genre de son dernier élément : die Wirtschaft + die Krise → die Wirtschaftskrise.
• Les noms en -ung, -heit, -keit et -schaft sont toujours féminins : die Wiedervereinigung, die Vergangenheit, die Wirtschaft.

Enregistrements et images : Deutsch im Blick (COERLL, Université du Texas à Austin), CC BY 4.0.`,
      },
      explanations: {
        q1: 'Le locuteur dit « die ehemalige DDR » : ehemalig signifie « ancien, ex- ». Früher et damals ont un sens proche, mais ce ne sont pas les mots entendus.',
        q2: 'On entend « das Ereignis, die Ereignisse ». Les noms en -nis sont souvent neutres (das Ergebnis, das Zeugnis), mais l’article s’apprend toujours avec le mot.',
        q3: 'Les noms en -nis doublent le s au pluriel et ajoutent -e : die Ereignisse. « Ereignissen » est la forme du datif pluriel, pas celle qu’on entend après die.',
        q4: 'On entend « die Gegenwart » : le présent est féminin, comme die Vergangenheit (le passé) et die Zukunft (l’avenir).',
        q5: 'On entend « der Wiederaufbau » : un nom composé prend le genre de son dernier élément, der Aufbau. Ne le confondez pas avec die Wiedervereinigung, féminin en -ung.',
        q6: 'On entend « das Wirtschaftswunder » : le dernier élément, das Wunder (le miracle), donne le genre. Die Wirtschaft, au début du mot, ne compte pas.',
      },
    },

    'a2-berlin-hoeren': {
      title: 'Vérifier : écouter une annonce, une visite et un rendez-vous',
      explanations: {
        q1: 'L’annonce précise que la U6 ne circule pas entre Friedrichstraße et Hallesches Tor, et les voyageurs « nehmen bitte den Ersatzbus vor dem Bahnhof » : le bus de remplacement devant la gare.',
        q2: 'Le guide dit « von siebzehnhundertachtundachtzig bis siebzehnhunderteinundneunzig » : de 1788 à 1791. La période 1961–1989 est celle du Mur.',
        q3: '« Niemand durfte hier durchgehen, weder von Osten noch von Westen. » Durfte, prétérit de dürfen : personne n’avait le droit de passer sous la porte.',
        q4: '« Wir treffen uns um halb drei wieder hier » : halb drei, c’est la demi-heure avant trois heures, donc 14 h 30, et non 15 h 30.',
        q5: 'Malik conseille « Nimm lieber die S-Bahn », directe du Zoo à la Warschauer Straße en vingt minutes. Le bus prend presque une heure et la U-Bahn impose un changement.',
        q6: 'Jana ne peut pas à quatre heures et propose « Lieber um Viertel nach vier » ; Malik confirme « Viertel nach vier am Ausgang » : 16 h 15 à la sortie de la station.',
      },
    },

    'a2-berlin-kieze': {
      title: 'Vérifier : lire « Berlin, une ville de quartiers »',
      // Le texte du kit nommait une personne réelle : la phrase et la question 6 sont reformulées sans nom.
      lesson: {
        description: `Lisez cet article d’un magazine de voyage sur le Berlin d’aujourd’hui, puis répondez aux questions.

BERLIN – EINE STADT, VIELE KIEZE

Berlin ist die größte Stadt Deutschlands, und hier leben Menschen aus rund 190 Ländern. Die Stadt hat zwölf Bezirke, aber die Berliner sprechen lieber von ihrem „Kiez“. So nennen sie ihr Viertel mit seinen Cafés, Läden und Nachbarn.

Weil Berlin über vierzig Jahre lang in Ost und West geteilt war, gibt es viele Dinge zweimal. Die Stadt hat zum Beispiel zwei Zoos: den Zoologischen Garten im Westen und den Tierpark im Osten. Auch bei den Universitäten ist das so: Die Humboldt-Universität liegt im früheren Osten, die Freie Universität im Westen.

Kreuzberg lag früher im Westen, direkt an der Mauer. Seit den Sechziger- und Siebzigerjahren sind hier viele Familien aus der Türkei zu Hause. Kreuzberg ist bunter und lauter als viele andere Viertel, und manche sagen, dass es hier den besten Döner der Stadt gibt. Prenzlauer Berg im früheren Osten ist ruhiger. Dort gibt es schöne alte Häuser. Nach dem Mauerfall sind viele junge Leute dorthin gezogen, und heute sieht man dort gemütliche Cafés und sehr viele Familien mit Kindern.

Wenn man Kunst liebt, besucht man die Museumsinsel. Ihre fünf Museen gehören seit 1999 zum Weltkulturerbe der UNESCO. Insgesamt hat Berlin über 170 Museen!

Und wenn man Hunger hat? Dann probiert man eine Currywurst. Man erzählt, dass eine Frau 1949 an ihrem Imbiss in Berlin die erste Currywurst verkauft hat. Heute bekommt man sie an jeder Ecke, sogar vegan.

MOTS UTILES
• der Kiez — le quartier (mot berlinois) ; der Bezirk — l’arrondissement
• geteilt — divisé(e) ; früher — autrefois ; im früheren Osten — dans l’ancien Berlin-Est
• der Tierpark — le parc zoologique ; bunt — coloré, varié ; gemütlich — chaleureux, où l’on se sent bien
• das Weltkulturerbe — le patrimoine mondial

Texte adapté de Der und mehr (Kennesaw State University), CC BY 4.0.`,
      },
      removeQuestions: ['q6'],
      addQuestions: [
        { id: 'q7', type: 'choice', prompt: "Was erzählt man über die Currywurst?",
          options: [{"id":"a","label":"Eine Frau hat 1949 in Berlin die erste Currywurst verkauft.","correct":true},{"id":"b","label":"Man bekommt sie nur in Kreuzberg.","correct":false},{"id":"c","label":"Sie kommt aus der Türkei.","correct":false},{"id":"d","label":"Es gibt sie erst seit dem Mauerfall.","correct":false}],
          explanation: "Le texte rapporte ce qu’on raconte (« Man erzählt, dass … ») : une femme aurait vendu la première currywurst à son stand (Imbiss), à Berlin, en 1949. Aujourd’hui, on la trouve « an jeder Ecke », pas seulement à Kreuzberg." },
      ],
      explanations: {
        q1: '« Die Berliner sprechen lieber von ihrem „Kiez“. So nennen sie ihr Viertel » : der Kiez est le mot berlinois pour le quartier. Ce n’est pas un plat : la spécialité citée est la currywurst.',
        q2: '« Weil Berlin über vierzig Jahre lang in Ost und West geteilt war, gibt es viele Dinge zweimal » : deux zoos, deux grandes universités. Les douze arrondissements ne l’expliquent pas.',
        q3: '« Die Humboldt-Universität liegt im früheren Osten, die Freie Universität im Westen. » Le Tierpark est à l’Est et le Zoologischer Garten à l’Ouest : les autres phrases inversent les côtés.',
        q4: '« Prenzlauer Berg im früheren Osten ist ruhiger » ; Kreuzberg est « bunter und lauter ». Kreuzberg était à l’Ouest, et c’est là qu’on situe le meilleur döner.',
        q5: '« Ihre fünf Museen gehören seit 1999 zum Weltkulturerbe der UNESCO. » Les plus de 170 musées sont ceux de toute la ville, pas de l’île.',
      },
    },

    'a2-berlin-sehenswuerdigkeiten': {
      title: 'Vérifier : reconnaître cinq symboles de Berlin',
      explanations: {
        q1: 'Une porte à colonnes surmontée d’un char tiré par quatre chevaux : c’est la Quadriga de la porte de Brandebourg, décrite dans la première fiche.',
        q2: 'L’inscription « Dem deutschen Volke » se trouve au-dessus de l’entrée du Reichstagsgebäude, siège du Bundestag. La Nationalgalerie porte l’inscription « Der deutschen Kunst ».',
        q3: 'Un bâtiment en forme de temple antique avec un cavalier en bronze devant l’escalier : c’est l’Alte Nationalgalerie, sur la Museumsinsel.',
        q4: 'La tour en ruine avec sa grande horloge et la tour moderne à côté : c’est la Kaiser-Wilhelm-Gedächtniskirche, que les Berlinois appellent « den hohlen Zahn ».',
        q5: '« Auf dem weißen Streifen in der Mitte sieht man einen schwarzen Bären. » Der Bär devient einen Bären à l’accusatif : c’est un nom masculin faible.',
        q6: '« Man kann sie kostenlos besichtigen, aber man muss sich vorher anmelden. » La visite de la coupole est gratuite (kostenlos) : aucun billet cher n’est à acheter.',
        q7: '« 1943, im Zweiten Weltkrieg, zerstörten Bomben die Kirche. » La fiche ne dit pas que la tour moderne date de 1943 ; la grande horloge appartient à l’ancienne tour.',
      },
    },

    'a2-berlin-grammatik': {
      title: 'S’entraîner : le prétérit et les indications de temps',
      estimatedMinutes: 12,
      competences: ['lecture', 'ecoute', 'expression-ecrite'],
      lesson: {
        description: `Complétez, remettez dans l’ordre ou associez, puis écrivez la phrase dictée.

RAPPELS
• Prétérit des verbes de modalité : radical sans Umlaut + -te + terminaison. ich konnte, du konntest, er konnte, wir konnten, ihr konntet, sie konnten (de même : musste, wollte, durfte). Ich et er/sie ont la même forme, sans -t final.
• sein → ich war, wir waren ; haben → ich hatte, wir hatten ; es gibt → es gab.
• Avec un verbe de modalité, l’infinitif va à la fin : Als Kind konnte ich nicht in den Westen fahren.
• vor + datif = il y a (vor zwei Jahren) ; seit = depuis, avec le présent (seit 1990) ; von … bis = de … à (von 1961 bis 1989).`,
      },
      removeQuestions: ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7'],
      explanations: {
        q8: 'Vor + datif situe un moment passé : vor über dreißig Jahren, « il y a plus de trente ans » (datif pluriel Jahren). Seit s’emploie pour une situation qui dure encore, avec le présent.',
      },
      addQuestions: [
        { id: 'q9', type: 'fill', prompt: 'Complétez au prétérit.',
          text: 'Als Kind [[1]] ich nicht in den Westen fahren. Die Grenze war zu.',
          blanks: [{ id: '1', accept: ['konnte'], size: 8, hint: 'können' }],
          explanation: 'Prétérit de können : radical sans Umlaut + -te, ich konnte. Könnte (avec ö) est un conditionnel, et kann un présent qui ne convient pas à « als Kind ».' },
        { id: 'q10', type: 'fill', prompt: 'Complétez au prétérit.',
          text: 'Früher [[1]] wir jeden Tag eine Stunde mit dem Bus zur Schule fahren.',
          blanks: [{ id: '1', accept: ['mussten'], size: 9, hint: 'müssen' }],
          explanation: 'Avec wir, la terminaison est -en : wir mussten (müssen perd son Umlaut au prétérit). Musste convient à ich ou er, pas à wir.' },
        { id: 'q11', type: 'fill', prompt: 'Complétez au prétérit.',
          text: 'Damals [[1]] du nicht allein mit der U-Bahn fahren, oder?',
          blanks: [{ id: '1', accept: ['durftest'], size: 10, hint: 'dürfen' }],
          explanation: 'Avec du, le prétérit prend -st : du durftest. Durfte est la forme de ich et er/sie ; darfst est le présent.' },
        { id: 'q12', type: 'fill', prompt: 'Complétez au prétérit.',
          text: 'Meine Eltern [[1]] damals kein Auto, und es [[2]] nur wenige Busse.',
          blanks: [{ id: '1', accept: ['hatten'], size: 8, hint: 'haben' }, { id: '2', accept: ['gab'], size: 5, hint: 'es gibt' }],
          explanation: 'Meine Eltern est un pluriel : sie hatten, prétérit de haben. Es gibt devient es gab au prétérit ; « es war » ne s’emploie pas pour dire « il y avait » des bus.' },
        { id: 'q13', type: 'fill', prompt: 'Complétez avec les mots qui délimitent la période.',
          text: '[[1]] 1961 [[2]] 1989 stand die Mauer mitten in Berlin.',
          blanks: [{ id: '1', accept: ['von'], size: 5, hint: null }, { id: '2', accept: ['bis'], size: 5, hint: null }],
          explanation: 'Une période fermée, avec un début et une fin, s’exprime avec von … bis : de 1961 à 1989. Seit s’emploie pour une situation qui dure encore aujourd’hui.' },
        { id: 'q14', type: 'fill', prompt: 'Complétez avec vor, seit ou von.',
          text: 'Deutschland ist [[1]] 1990 wieder vereint.',
          blanks: [{ id: '1', accept: ['seit'], size: 6, hint: null }],
          explanation: 'La réunification commence en 1990 et dure encore : seit, avec le présent ist. « Vor 1990 » signifierait « avant 1990 ».' },
        { id: 'q15', type: 'order', prompt: 'Remettez les mots dans l’ordre. Commencez par « An der Grenze ».',
          answers: [['An der Grenze', 'mussten', 'wir', 'stundenlang', 'warten.']],
          explanation: 'An der Grenze occupe la première position : le verbe de modalité mussten suit directement, puis le sujet wir ; l’infinitif warten va à la fin.' },
        { id: 'q16', type: 'match', prompt: 'Associez chaque verbe à sa forme au prétérit (ich ou es).',
          pairs: [
            { left: 'können', right: 'konnte' },
            { left: 'müssen', right: 'musste' },
            { left: 'dürfen', right: 'durfte' },
            { left: 'wollen', right: 'wollte' },
            { left: 'sein', right: 'war' },
            { left: 'es gibt', right: 'es gab' },
          ],
          explanation: 'Les verbes de modalité perdent leur Umlaut au prétérit et prennent -te : konnte, musste, durfte, wollte. Sein et es gibt ont des formes irrégulières : war, es gab.' },
        { id: 'q17', type: 'dictation', prompt: 'Écoutez et écrivez la phrase sur le passé de la ville.',
          accept: ['Früher gab es hier eine Mauer.'], voice: 'sprecher',
          explanation: 'Es gab est le prétérit de es gibt. Früher occupe la première position : le verbe gab vient juste après, puis le sujet es.' },
      ],
    },

    'a2-berlin-wegbeschreibung': {
      lesson: {
        description: `Deux enregistrements de locuteurs natifs, tirés du manuel Deutsch im Blick : d’abord les phrases pour demander son chemin, puis celles pour l’indiquer. Le lieu cherché est toujours le zoo (der Zoo). Écoutez une première fois en suivant la liste, puis réécoutez : après chaque phrase, mettez en pause et répétez à voix haute en imitant la prononciation et la mélodie.

1. NACH DEM WEG FRAGEN — DEMANDER SON CHEMIN
• Entschuldigen Sie. / Entschuldigung. — Excusez-moi.
• Ich kenne mich hier nicht aus. — Je ne connais pas le coin.
• Können Sie mir vielleicht helfen? — Vous pourriez m’aider ?
• Wie komme ich zum Zoo? — Comment est-ce que je vais au zoo ?
• Wo ist der Zoo? — Où est le zoo ?
• Vielen Dank. — Merci beaucoup.

2. WEGBESCHREIBUNGEN — INDIQUER LE CHEMIN
• Auf der rechten Seite. / Auf der linken Seite. — Sur la droite. / Sur la gauche.
• Biegen Sie rechts ab. / Biegen Sie links ab. — Tournez à droite. / Tournez à gauche.
• Der Zoo ist in der Nähe von … — Le zoo est près de … (la phrase reste ouverte : à vous de la compléter)
• Der Zoo ist ungefähr zehn Minuten zu Fuß / mit dem Bus. — Le zoo est à dix minutes environ à pied / en bus.
• Fahren Sie mit dem Bus. / Fahren Sie mit der U-Bahn. — Prenez le bus. / Prenez le métro.
• Gehen Sie geradeaus. — Allez tout droit.
• Gleich da drüben. — Juste là-bas.
• Nehmen Sie die nächste Kreuzung rechts. / … links. — Au prochain carrefour, prenez à droite. / … à gauche.

À REMARQUER EN ÉCOUTANT
• L’impératif de politesse commence par le verbe, suivi de Sie : Biegen Sie …, Fahren Sie …, Gehen Sie …, Nehmen Sie … Avec un verbe séparable, la particule va à la fin : Biegen Sie rechts ab.
• Après zu, mit et von, on emploie le datif : zum Zoo (zu + dem), mit dem Bus, mit der U-Bahn, in der Nähe vom Bahnhof (von + dem).
• L’accent de « Entschuldigung » tombe sur -schul- : ent-SCHUL-di-gung. Dans « drüben », le ü se prononce comme le « u » français de « tu ».

À VOUS
Remplacez « der Zoo » par un lieu de Berlin et dites à voix haute trois questions et trois réponses, par exemple : Entschuldigung, wie komme ich zum Brandenburger Tor? — Fahren Sie mit der U5 bis zur Station Brandenburger Tor. Das Tor ist in der Nähe vom Reichstag. L’exercice « Répéter à voix haute » qui suit vérifie ensuite votre prononciation sur des phrases de ce type.

Enregistrements et images : Deutsch im Blick (COERLL, Université du Texas à Austin), CC BY 4.0.`,
      },
    },

    'a2-berlin-wege': {
      title: 'S’entraîner : comprendre et donner un itinéraire',
      competences: ['lecture', 'ecoute', 'expression-ecrite'],
      explanations: {
        q1: 'Sur la ligne U5, Brandenburger Tor vient deux stations après Hauptbahnhof (Hauptbahnhof – Bundestag – Brandenburger Tor). La S-Bahn n’y passe pas, et l’Alexanderplatz est dans l’autre direction.',
        q2: 'Le Bundestag se trouve sur la U5, pas sur la S-Bahn. Les deux lignes se croisent au Hauptbahnhof : on y change. Friedrichstraße n’est pas desservie par la U5 de l’extrait.',
        q3: 'Museumsinsel est sur la U5 et Ostbahnhof sur la S-Bahn ; les deux lignes se rejoignent à l’Alexanderplatz. La U5 ne va ni au Ostbahnhof ni à la Warschauer Straße.',
        q4: 'On s’excuse (Entschuldigung), on explique qu’on ne connaît pas le quartier (ich kenne mich hier nicht aus) et on pose une question polie. « Sie müssen mir … zeigen » est un ordre impoli.',
        q5: 'Abbiegen signifie tourner ; links, à gauche ; an der nächsten Kreuzung, au prochain carrefour. Geradeaus voudrait dire « tout droit » et rechts « à droite ».',
        q6: 'Der Fernsehturm est masculin : zu + dem = zum. Zur s’emploie devant un nom féminin (zur Museumsinsel) et nach devant une ville ou un pays sans article.',
      },
      addQuestions: [
        { id: 'q7', type: 'fill', prompt: 'Complétez la question et la réponse.',
          text: 'Wie komme ich [[1]] Museumsinsel? – Fahren Sie mit [[2]] U5 bis zum Alexanderplatz.',
          blanks: [{ id: '1', accept: ['zur', 'zu der'], size: 7, hint: null }, { id: '2', accept: ['der'], size: 5, hint: null }],
          explanation: 'Die Museumsinsel est féminin : zu + der = zur. Après mit, on emploie aussi le datif : die U5 devient mit der U5.' },
        { id: 'q8', type: 'fill', prompt: 'Complétez avec la particule de chaque verbe.',
          text: 'Am Alexanderplatz steigen Sie in die S-Bahn [[1]], und am Ostbahnhof steigen Sie [[2]].',
          blanks: [{ id: '1', accept: ['um'], size: 4, hint: 'umsteigen' }, { id: '2', accept: ['aus'], size: 4, hint: 'aussteigen' }],
          explanation: 'Umsteigen (changer) et aussteigen (descendre) sont séparables : la particule va à la fin de la phrase. Einsteigen voudrait dire monter.' },
        { id: 'q9', type: 'dictation', prompt: 'Écoutez et écrivez l’indication donnée par la passante.',
          accept: ['Die nächste Haltestelle ist auf der linken Seite.'], voice: 'frau',
          explanation: 'Auf der linken Seite : auf + datif, d’où der linken pour un nom féminin. Die Haltestelle (l’arrêt) s’écrit en un seul mot.' },
      ],
    },

    'a2-berlin-tagesplan': {
      title: 'Vérifier : écouter le programme d’une journée',
      explanations: {
        q1: 'Lukas dit « Zuerst gehen wir auf die Museumsinsel » et cite le Neues Museum. Zuerst (d’abord) ouvre le programme ; Kreuzberg vient le soir.',
        q2: '« … weil dein Hotel ganz in der Nähe ist » : l’hôtel d’Inès est tout près de l’île aux musées. La sœur de Lukas n’intervient que le soir.',
        q3: 'Lukas prévient qu’« am Samstag muss man dort oft über eine Stunde warten » et Inès avoue « ich habe ein bisschen Angst, wenn ich so hoch oben bin ». Ni le prix ni une fermeture ne sont évoqués.',
        q4: '« Sie kostet nur vier Euro fünfzig » : 4,50 €. On dit d’abord les euros, puis les centimes ; 5,40 € inverserait les deux nombres.',
        q5: '« Am Nachmittag fahren wir mit der S-Bahn bis zum Ostbahnhof. » Ensuite seulement, ils longent la East Side Gallery à pied jusqu’à l’Oberbaumbrücke.',
        q6: 'Le soir, ils vont à Kreuzberg retrouver Merve, la sœur de Lukas, qui connaît « ein türkisches Restaurant ». La currywurst, c’était à midi à l’Alexanderplatz.',
      },
    },

    'a2-berlin-sprechen': {
      kind: 'mission',
      title: 'Mission : une carte postale de Berlin',
      estimatedMinutes: 20,
      competences: ['expression-orale', 'expression-ecrite'],
      lesson: {
        description: `Écoutez Lina, qui raconte son séjour à Berlin à sa grand-mère, puis préparez votre propre récit.

MODÈLE
Liebe Oma,
seit drei Tagen bin ich jetzt in Berlin, und die Stadt ist toll! Gestern wollte ich die Kuppel vom Reichstag besichtigen. Man muss sich vorher online anmelden, aber zum Glück hatte ich einen Termin. Danach bin ich mit der U5 zur Museumsinsel gefahren. Heute war ich an der East Side Gallery. Vor über dreißig Jahren war die Stadt hier noch geteilt – unglaublich! Leider konnte ich nicht lange bleiben, es gab nämlich ein Gewitter.
Viele Grüße
deine Lina

POUR PRÉPARER
Imaginez que vous êtes à Berlin depuis quelques jours.
1. Depuis quand vous êtes là : Ich bin seit … in Berlin.
2. Ce que vous vouliez faire et ce que vous avez pu (ou pas pu) faire : Ich wollte … / Ich konnte … / Ich musste …
3. Un monument et un fait d’histoire : Das Brandenburger Tor … / Von 1961 bis 1989 … / Vor über dreißig Jahren …
4. Vos trajets : Ich bin mit der U-Bahn gefahren. Am Alexanderplatz musste ich umsteigen.
5. Votre impression et votre programme pour demain : Berlin ist … Morgen …

Avant d’envoyer, vérifiez : le verbe conjugué est-il en deuxième position ? L’infinitif est-il à la fin après konnte, wollte ou musste ? Les noms ont-ils une majuscule ?`,
      },
      mission: {
        oral: {
          prompt: 'Racontez à un ami votre séjour à Berlin (une minute environ, sans lire) : depuis quand vous êtes là, ce que vous vouliez faire et ce que vous avez pu faire, un monument avec un fait d’histoire, vos trajets et votre programme pour demain.',
          maxSeconds: 90,
        },
        written: {
          prompt: 'Écrivez une carte postale de Berlin de 60 à 80 mots à un ami ou à quelqu’un de votre famille. Employez au moins deux verbes au prétérit (war, hatte, konnte, wollte, musste, es gab), une indication de temps (seit, vor, von … bis) et un moyen de transport.',
          maxChars: 1000,
          minWords: 60,
        },
        checklist: [
          'J’ai employé au moins deux verbes au prétérit : war, hatte, konnte, wollte, musste ou es gab.',
          'Après konnte, wollte ou musste, l’infinitif est à la fin de la phrase.',
          'J’ai situé un fait dans le temps avec seit, vor ou von … bis.',
          'J’ai cité un monument de Berlin et un moyen de transport (mit der U-Bahn, mit der S-Bahn …).',
          'Ma carte commence par une formule d’appel et se termine par une salutation (Viele Grüße …).',
        ],
      },
    },
  },

  add: [
    {
      after: 'a2-berlin-wegbeschreibung',
      activity: {
        id: 'a2-berlin-repeter',
        kind: 'exercise',
        title: 'Répéter à voix haute : demander son chemin, raconter le passé',
        estimatedMinutes: 8,
        competences: ['expression-orale'],
        lesson: {
          title: 'Répéter à voix haute : demander son chemin, raconter le passé',
          description: 'Écoutez chaque modèle, puis dites la phrase à voix haute. Faites entendre la particule séparable à la fin (ab, um, aus) et l’infinitif après konnte. Si la reconnaissance vocale ne comprend pas votre phrase, réécoutez le modèle et réessayez.',
          transcript: null,
        },
        placements: [],
        questions: [
          { id: 'q1', type: 'speak', prompt: 'Écoutez, puis abordez un passant.',
            text: 'Entschuldigung, ich kenne mich hier nicht aus.', accept: ['Entschuldigung, ich kenne mich hier nicht aus.'], threshold: 75,
            explanation: 'Entschuldigung est accentué sur « schul ». Dans sich auskennen, la particule aus termine la phrase et porte l’accent.' },
          { id: 'q2', type: 'speak', prompt: 'Écoutez, puis demandez le chemin.',
            text: 'Wie komme ich zum Brandenburger Tor?', accept: ['Wie komme ich zum Brandenburger Tor?'], threshold: 75,
            explanation: 'Zum = zu dem, car das Tor est neutre. La voix descend à la fin : c’est une question avec un mot interrogatif.' },
          { id: 'q3', type: 'speak', prompt: 'Écoutez, puis indiquez où tourner.',
            text: 'Biegen Sie an der Kreuzung links ab.', accept: ['Biegen Sie an der Kreuzung links ab.'], threshold: 75,
            explanation: 'Impératif de politesse : le verbe biegen ouvre la phrase, Sie suit, et la particule ab termine la consigne.' },
          { id: 'q4', type: 'speak', prompt: 'Écoutez, puis indiquez la correspondance.',
            text: 'Am Alexanderplatz steigen Sie in die S-Bahn um.', accept: ['Am Alexanderplatz steigen Sie in die S-Bahn um.'], threshold: 75,
            explanation: 'Umsteigen est séparable : steigen vient en 2e position, um à la fin. Dans S-Bahn, on prononce la lettre s : « èss ».' },
          { id: 'q5', type: 'speak', prompt: 'Écoutez, puis répétez : un fait d’histoire.',
            text: 'Von neunzehnhunderteinundsechzig bis neunzehnhundertneunundachtzig stand hier die Mauer.',
            accept: ['Von neunzehnhunderteinundsechzig bis neunzehnhundertneunundachtzig stand hier die Mauer.', 'Von 1961 bis 1989 stand hier die Mauer.'],
            threshold: 75,
            explanation: 'Les années se lisent par centaines : neunzehnhundert-einundsechzig. Stand est le prétérit de stehen.' },
          { id: 'q6', type: 'speak', prompt: 'Écoutez, puis répétez : un souvenir d’enfance.',
            text: 'Als Kind konnte ich nicht in den Westen fahren.', accept: ['Als Kind konnte ich nicht in den Westen fahren.'], threshold: 75,
            explanation: 'Konnte, prétérit de können, n’a pas d’Umlaut ; l’infinitif fahren va à la fin. Le w de Westen se prononce [v].' },
        ],
      },
    },
  ],
};
