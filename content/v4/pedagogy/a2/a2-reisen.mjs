// Couche pédagogique V4 · a2-reisen (lot A7, contenu A2).
// Voyager et raconter ses vacances : explications de toutes les questions, Perfekt et destinations en exercices typés,
// répétition validée, dictées et mission remise au professeur.

export default {
  module: 'a2-reisen',
  grammarFocus: ['perfekt-haben-sein', 'participe-passe', 'destinations-nach-in-an'],

  // Sons du kit corrigés : pas de nom de produit ferroviaire (ICE). À régénérer.
  media: [
    {
      "key": "a2-reisen-unterwegs-audio-v3",
      "kind": "audio",
      "title": "Au guichet de la gare et à la réception de l’hôtel",
      "script": [
        {
          "voice": "mann",
          "name": "Herr Vogt",
          "text": "Guten Tag! Was kann ich für Sie tun?"
        },
        {
          "pause": 0.6
        },
        {
          "voice": "frau",
          "name": "Amira",
          "text": "Guten Tag. Ich möchte am Freitag nach Hamburg fahren. Wann fährt morgens ein Zug?"
        },
        {
          "pause": 0.6
        },
        {
          "voice": "mann",
          "name": "Herr Vogt",
          "text": "Um acht Uhr zwölf fährt ein Zug. Er kommt um zwölf Uhr fünf in Hamburg an."
        },
        {
          "pause": 0.6
        },
        {
          "voice": "frau",
          "name": "Amira",
          "text": "Und muss ich irgendwo umsteigen?"
        },
        {
          "pause": 0.5
        },
        {
          "voice": "mann",
          "name": "Herr Vogt",
          "text": "Nein, der Zug fährt direkt."
        },
        {
          "pause": 0.6
        },
        {
          "voice": "frau",
          "name": "Amira",
          "text": "Sehr gut. Dann eine Fahrkarte, bitte, hin und zurück, zweite Klasse. Ich komme am Sonntagabend zurück."
        },
        {
          "pause": 0.6
        },
        {
          "voice": "mann",
          "name": "Herr Vogt",
          "text": "Mit dem Sparpreis kostet das neunundsiebzig Euro. Möchten Sie auch einen Sitzplatz reservieren?"
        },
        {
          "pause": 0.6
        },
        {
          "voice": "frau",
          "name": "Amira",
          "text": "Ja, gern. Einen Platz am Fenster, bitte."
        },
        {
          "pause": 0.6
        },
        {
          "voice": "mann",
          "name": "Herr Vogt",
          "text": "Gern. Mit Reservierung sind es zweiundachtzig Euro fünfzig."
        },
        {
          "pause": 0.6
        },
        {
          "voice": "frau",
          "name": "Amira",
          "text": "Kann ich mit Karte bezahlen?"
        },
        {
          "pause": 0.5
        },
        {
          "voice": "mann",
          "name": "Herr Vogt",
          "text": "Natürlich. Ihr Zug fährt von Gleis sechs ab. Gute Reise!"
        },
        {
          "pause": 1.5
        },
        {
          "voice": "sprecherin",
          "name": "Frau Lindner",
          "text": "Guten Abend und herzlich willkommen im Hotel Elbblick!"
        },
        {
          "pause": 0.6
        },
        {
          "voice": "sprecher",
          "name": "Herr Duval",
          "text": "Guten Abend. Ich habe ein Einzelzimmer für zwei Nächte reserviert. Mein Name ist Duval."
        },
        {
          "pause": 0.6
        },
        {
          "voice": "sprecherin",
          "name": "Frau Lindner",
          "text": "Einen Moment, bitte. Ja, Herr Duval, ein Einzelzimmer mit Dusche, von Freitag bis Sonntag."
        },
        {
          "pause": 0.6
        },
        {
          "voice": "sprecher",
          "name": "Herr Duval",
          "text": "Danke. Ist das Frühstück inklusive?"
        },
        {
          "pause": 0.6
        },
        {
          "voice": "sprecherin",
          "name": "Frau Lindner",
          "text": "Ja, das Frühstück ist im Preis inbegriffen. Es gibt Frühstück von sieben bis zehn Uhr im Erdgeschoss."
        },
        {
          "pause": 0.6
        },
        {
          "voice": "sprecher",
          "name": "Herr Duval",
          "text": "Und gibt es WLAN im Zimmer?"
        },
        {
          "pause": 0.6
        },
        {
          "voice": "sprecherin",
          "name": "Frau Lindner",
          "text": "Ja, das Passwort steht auf Ihrer Zimmerkarte. Sie haben Zimmer zweihundertvierzehn im zweiten Stock. Der Aufzug ist dort links."
        },
        {
          "pause": 0.6
        },
        {
          "voice": "sprecher",
          "name": "Herr Duval",
          "text": "Vielen Dank. Wann muss ich am Sonntag auschecken?"
        },
        {
          "pause": 0.6
        },
        {
          "voice": "sprecherin",
          "name": "Frau Lindner",
          "text": "Bis elf Uhr. Einen schönen Aufenthalt!"
        }
      ],
      "credit": "LinguaCap, synthèse Piper avec Thorsten Müller (CC0) et Kerstin, préentraînée sur la voix de Cori Samuel (Hi-Fi TTS, CC BY 4.0)",
      "license": "Jeux de données des voix : CC0 et CC BY 4.0"
    },
    {
      "key": "a2-reisen-hoeren-audio-v3",
      "kind": "audio",
      "title": "Quatre scènes de voyage",
      "script": [
        {
          "voice": "sprecher",
          "text": "Szene eins."
        },
        {
          "pause": 0.6
        },
        {
          "voice": "sprecher",
          "name": "Durchsage",
          "text": "Achtung an Gleis drei! Der Zug nach München, Abfahrt zehn Uhr vierzehn, fährt heute von Gleis sieben ab. Der Zug hat circa fünfzehn Minuten Verspätung."
        },
        {
          "pause": 1.2
        },
        {
          "voice": "sprecher",
          "text": "Szene zwei."
        },
        {
          "pause": 0.6
        },
        {
          "voice": "frau",
          "name": "Frau Brunner",
          "text": "Pension Seeblick, guten Tag! Was kann ich für Sie tun?"
        },
        {
          "pause": 0.5
        },
        {
          "voice": "mann",
          "name": "Herr Kaya",
          "text": "Guten Tag, hier ist Kaya. Haben Sie vom zwölften bis zum fünfzehnten August noch ein Doppelzimmer frei?"
        },
        {
          "pause": 0.6
        },
        {
          "voice": "frau",
          "name": "Frau Brunner",
          "text": "Moment, das sind drei Nächte. Ja, ein Doppelzimmer ist noch frei. Es kostet fünfundneunzig Euro pro Nacht."
        },
        {
          "pause": 0.5
        },
        {
          "voice": "mann",
          "name": "Herr Kaya",
          "text": "Ist das Frühstück inklusive?"
        },
        {
          "pause": 0.5
        },
        {
          "voice": "frau",
          "name": "Frau Brunner",
          "text": "Ja, das Frühstück ist dabei."
        },
        {
          "pause": 0.5
        },
        {
          "voice": "mann",
          "name": "Herr Kaya",
          "text": "Prima, dann reserviere ich das Zimmer."
        },
        {
          "pause": 0.5
        },
        {
          "voice": "frau",
          "name": "Frau Brunner",
          "text": "Gern, Herr Kaya. Bis bald!"
        },
        {
          "pause": 1.2
        },
        {
          "voice": "sprecher",
          "text": "Szene drei."
        },
        {
          "pause": 0.6
        },
        {
          "voice": "sprecher",
          "name": "Radio",
          "text": "Und nun das Wetter für das Wochenende. Am Samstag regnet es überall, im Süden gibt es am Nachmittag auch Gewitter. Am Sonntag ist es im Norden noch bewölkt, aber im Süden scheint die Sonne, bei bis zu zweiundzwanzig Grad."
        },
        {
          "pause": 1.2
        },
        {
          "voice": "sprecher",
          "text": "Szene vier."
        },
        {
          "pause": 0.6
        },
        {
          "voice": "frau",
          "name": "Lina",
          "text": "Hallo Max! Du warst doch in Schweden. Wie war's?"
        },
        {
          "pause": 0.5
        },
        {
          "voice": "mann",
          "name": "Max",
          "text": "Toll! Wir sind mit dem Zug nach Stockholm gefahren und haben dort die Stadt besichtigt. Danach haben wir eine Hütte am See gemietet."
        },
        {
          "pause": 0.5
        },
        {
          "voice": "frau",
          "name": "Lina",
          "text": "Und wie war das Wetter?"
        },
        {
          "pause": 0.5
        },
        {
          "voice": "mann",
          "name": "Max",
          "text": "Nicht so warm, nur achtzehn Grad. Aber ich bin trotzdem jeden Tag im See geschwommen!"
        },
        {
          "pause": 0.5
        },
        {
          "voice": "frau",
          "name": "Lina",
          "text": "Bei achtzehn Grad? Du bist ja verrückt!"
        },
        {
          "pause": 0.5
        },
        {
          "voice": "mann",
          "name": "Max",
          "text": "Vielleicht. Aber am letzten Tag habe ich meine Kamera im Zug vergessen. So ärgerlich!"
        }
      ],
      "credit": "LinguaCap, synthèse Piper avec Thorsten Müller (CC0) et Kerstin, préentraînée sur la voix de Cori Samuel (Hi-Fi TTS, CC BY 4.0)",
      "license": "Jeux de données des voix : CC0 et CC BY 4.0"
    }
  ],

  vocabulary: [
    { id: 'zug', word: 'Zug', article: 'der', plural: 'Züge', partOfSpeech: 'noun', translation: 'le train',
      example: 'Der Zug fährt um acht Uhr zwölf ab.', note: null },
    { id: 'flugzeug', word: 'Flugzeug', article: 'das', plural: 'Flugzeuge', partOfSpeech: 'noun', translation: 'l’avion',
      example: 'Wir sind mit dem Flugzeug nach Lissabon geflogen.', note: 'mit dem Flugzeug fliegen' },
    { id: 'bahnhof', word: 'Bahnhof', article: 'der', plural: 'Bahnhöfe', partOfSpeech: 'noun', translation: 'la gare',
      example: 'Wir treffen uns am Bahnhof.', note: null },
    { id: 'fahrkarte', word: 'Fahrkarte', article: 'die', plural: 'Fahrkarten', partOfSpeech: 'noun', translation: 'le billet (de train, de bus)',
      example: 'Ich kaufe die Fahrkarte am Automaten.', note: 'einfach : aller simple · hin und zurück : aller-retour' },
    { id: 'gleis', word: 'Gleis', article: 'das', plural: 'Gleise', partOfSpeech: 'noun', translation: 'la voie, le quai',
      example: 'Der Zug fährt von Gleis sechs ab.', note: null },
    { id: 'abfahrt', word: 'Abfahrt', article: 'die', plural: 'Abfahrten', partOfSpeech: 'noun', translation: 'le départ',
      example: 'Die Abfahrt ist um zehn Uhr vierzehn.', note: null },
    { id: 'ankunft', word: 'Ankunft', article: 'die', plural: 'Ankünfte', partOfSpeech: 'noun', translation: 'l’arrivée',
      example: 'Die Ankunft in Hamburg ist um zwölf Uhr fünf.', note: null },
    { id: 'umsteigen', word: 'umsteigen', article: null, plural: null, partOfSpeech: 'verb', translation: 'changer (de train, de bus)',
      example: 'Muss ich in Köln umsteigen?', note: 'séparable : um|steigen · Perfekt : ist umgestiegen' },
    { id: 'ankommen', word: 'ankommen', article: null, plural: null, partOfSpeech: 'verb', translation: 'arriver',
      example: 'Wir wollen am Abend ankommen.', note: 'séparable : an|kommen · Perfekt : ist angekommen' },
    { id: 'verpassen', word: 'verpassen', article: null, plural: null, partOfSpeech: 'verb', translation: 'rater, manquer',
      example: 'Wir haben den Zug verpasst.', note: 'Perfekt sans ge- : hat verpasst' },
    { id: 'reservieren', word: 'reservieren', article: null, plural: null, partOfSpeech: 'verb', translation: 'réserver',
      example: 'Möchten Sie einen Sitzplatz reservieren?', note: 'Perfekt sans ge- : hat reserviert' },
    { id: 'uebernachten', word: 'übernachten', article: null, plural: null, partOfSpeech: 'verb', translation: 'passer la nuit, loger',
      example: 'Wir haben in einer Pension übernachtet.', note: 'Perfekt sans ge- : hat übernachtet' },
    { id: 'einzelzimmer', word: 'Einzelzimmer', article: 'das', plural: 'Einzelzimmer', partOfSpeech: 'noun', translation: 'la chambre simple',
      example: 'Ich habe ein Einzelzimmer reserviert.', note: null },
    { id: 'doppelzimmer', word: 'Doppelzimmer', article: 'das', plural: 'Doppelzimmer', partOfSpeech: 'noun', translation: 'la chambre double',
      example: 'Haben Sie noch ein Doppelzimmer frei?', note: null },
    { id: 'jugendherberge', word: 'Jugendherberge', article: 'die', plural: 'Jugendherbergen', partOfSpeech: 'noun', translation: 'l’auberge de jeunesse',
      example: 'Wir übernachten in einer Jugendherberge.', note: null },
    { id: 'ferienwohnung', word: 'Ferienwohnung', article: 'die', plural: 'Ferienwohnungen', partOfSpeech: 'noun', translation: 'la location de vacances',
      example: 'Wir haben eine Ferienwohnung am Strand gemietet.', note: null },
    { id: 'koffer', word: 'Koffer', article: 'der', plural: 'Koffer', partOfSpeech: 'noun', translation: 'la valise',
      example: 'Mein Koffer ist zu schwer.', note: null },
    { id: 'rucksack', word: 'Rucksack', article: 'der', plural: 'Rucksäcke', partOfSpeech: 'noun', translation: 'le sac à dos',
      example: 'Ich reise nur mit einem Rucksack.', note: null },
    { id: 'gepaeck', word: 'Gepäck', article: 'das', plural: null, partOfSpeech: 'noun', translation: 'les bagages',
      example: 'Mein Gepäck ist nicht angekommen.', note: 'toujours au singulier en allemand' },
    { id: 'reisepass', word: 'Reisepass', article: 'der', plural: 'Reisepässe', partOfSpeech: 'noun', translation: 'le passeport',
      example: 'Ihren Reisepass, bitte!', note: null },
    { id: 'urlaub', word: 'Urlaub', article: 'der', plural: 'Urlaube', partOfSpeech: 'noun', translation: 'les vacances, le congé',
      example: 'Wie war dein Urlaub?', note: 'Urlaub machen : partir en vacances' },
    { id: 'meer', word: 'Meer', article: 'das', plural: 'Meere', partOfSpeech: 'noun', translation: 'la mer',
      example: 'Im August fahren wir ans Meer.', note: 'wohin? ans Meer · wo? am Meer' },
    { id: 'berg', word: 'Berg', article: 'der', plural: 'Berge', partOfSpeech: 'noun', translation: 'la montagne',
      example: 'Am vorletzten Tag sind wir auf einen Berg gestiegen.', note: 'wohin? in die Berge · wo? in den Bergen' },
    { id: 'wetter', word: 'Wetter', article: 'das', plural: null, partOfSpeech: 'noun', translation: 'le temps (météo)',
      example: 'Wie ist das Wetter heute?', note: null },
    { id: 'regnen', word: 'regnen', article: null, plural: null, partOfSpeech: 'verb', translation: 'pleuvoir',
      example: 'Am Sonntag hat es den ganzen Tag geregnet.', note: 'es regnet : il pleut' },
    { id: 'sonnig', word: 'sonnig', article: null, plural: null, partOfSpeech: 'adjective', translation: 'ensoleillé',
      example: 'Heute ist es sonnig und warm.', note: null },
    { id: 'bewoelkt', word: 'bewölkt', article: null, plural: null, partOfSpeech: 'adjective', translation: 'nuageux, couvert',
      example: 'Im Norden ist es noch bewölkt.', note: null },
    { id: 'gewitter', word: 'Gewitter', article: 'das', plural: 'Gewitter', partOfSpeech: 'noun', translation: 'l’orage',
      example: 'Am Nachmittag gibt es ein Gewitter.', note: null },
  ],

  activities: {
    'a2-reisen-wortschatz': {
      title: 'Découvrir : le vocabulaire du voyage et de la météo',
    },

    'a2-reisen-unterwegs': {
      title: 'Comprendre : à la gare et à l’hôtel',
      lesson: {
        description: `Amira veut passer le week-end à Hambourg. Elle achète son billet au guichet de la gare de Cologne (das Reisezentrum). À Hambourg, Paul Duval, un client français, arrive à son hôtel. Écoutez les deux scènes une première fois sans lire, puis une deuxième fois en suivant le texte.

1. IM REISEZENTRUM — AU GUICHET DE LA GARE
Herr Vogt : Guten Tag! Was kann ich für Sie tun?
Amira : Guten Tag. Ich möchte am Freitag nach Hamburg fahren. Wann fährt morgens ein Zug?
Herr Vogt : Um acht Uhr zwölf fährt ein Zug. Er kommt um zwölf Uhr fünf in Hamburg an.
Amira : Und muss ich irgendwo umsteigen?
Herr Vogt : Nein, der Zug fährt direkt.
Amira : Sehr gut. Dann eine Fahrkarte, bitte, hin und zurück, zweite Klasse. Ich komme am Sonntagabend zurück.
Herr Vogt : Mit dem Sparpreis kostet das neunundsiebzig Euro. Möchten Sie auch einen Sitzplatz reservieren?
Amira : Ja, gern. Einen Platz am Fenster, bitte.
Herr Vogt : Gern. Mit Reservierung sind es zweiundachtzig Euro fünfzig.
Amira : Kann ich mit Karte bezahlen?
Herr Vogt : Natürlich. Ihr Zug fährt von Gleis sechs ab. Gute Reise!

2. AN DER REZEPTION — À LA RÉCEPTION DE L’HÔTEL
Frau Lindner : Guten Abend und herzlich willkommen im Hotel Elbblick!
Herr Duval : Guten Abend. Ich habe ein Einzelzimmer für zwei Nächte reserviert. Mein Name ist Duval.
Frau Lindner : Einen Moment, bitte. Ja, Herr Duval, ein Einzelzimmer mit Dusche, von Freitag bis Sonntag.
Herr Duval : Danke. Ist das Frühstück inklusive?
Frau Lindner : Ja, das Frühstück ist im Preis inbegriffen. Es gibt Frühstück von sieben bis zehn Uhr im Erdgeschoss.
Herr Duval : Und gibt es WLAN im Zimmer?
Frau Lindner : Ja, das Passwort steht auf Ihrer Zimmerkarte. Sie haben Zimmer zweihundertvierzehn im zweiten Stock. Der Aufzug ist dort links.
Herr Duval : Vielen Dank. Wann muss ich am Sonntag auschecken?
Frau Lindner : Bis elf Uhr. Einen schönen Aufenthalt!

PHRASES UTILES À LA GARE
• Wann fährt der nächste Zug nach …? — Quand part le prochain train pour … ?
• Einmal nach Hamburg, hin und zurück, bitte. — Un aller-retour pour Hambourg, s’il vous plaît.
• Muss ich umsteigen? — Est-ce que je dois changer de train ?
• Von welchem Gleis fährt der Zug ab? — De quelle voie part le train ?
• Ich möchte einen Sitzplatz reservieren. — Je voudrais réserver une place assise.

PHRASES UTILES À L’HÔTEL
• Ich habe ein Zimmer reserviert. Mein Name ist … — J’ai réservé une chambre. Je m’appelle …
• Haben Sie noch ein Doppelzimmer frei? — Avez-vous encore une chambre double de libre ?
• Was kostet eine Nacht? — Combien coûte une nuit ?
• Ist das Frühstück inklusive? — Le petit-déjeuner est-il compris ?
• Wann muss ich auschecken? — À quelle heure dois-je libérer la chambre ?

BON À SAVOIR
En Allemagne, on achète son billet au guichet, au distributeur (der Fahrkartenautomat) ou dans l’application de la compagnie ferroviaire. Le Sparpreis, moins cher, n’est valable que dans le train choisi. Les trains rapides relient directement les grandes villes. Pour demander poliment, on dit « Ich möchte … » ou « Ich hätte gern … » plutôt que « Ich will … ».

À VOUS
Relisez à voix haute les répliques d’Amira, puis celles de Herr Duval, en changeant la destination, le jour, la classe et le type de chambre. Repérez dans chaque scène la question qui fait avancer l’échange. L’exercice « Répéter à voix haute » de ce module vérifie ensuite la prononciation des phrases utiles.`,
      },
    },

    'a2-reisen-dialog': {
      title: 'Comprendre : « Wie war dein Urlaub ? »',
      lesson: {
        description: `Lundi matin, Julia et Tarek se retrouvent devant la machine à café du bureau. Ils rentrent tous les deux de vacances. Écoutez le dialogue une première fois sans lire, puis une deuxième fois en suivant le texte. Repérez les verbes au passé.

DIALOGUE
Julia : Hallo Tarek! Du bist ja ganz braun. Wie war dein Urlaub?
Tarek : Hallo Julia! Super, danke. Ich war mit meiner Familie zwei Wochen in Kroatien, am Meer.
Julia : Toll! Seid ihr nach Kroatien geflogen?
Tarek : Nein, wir sind mit dem Auto gefahren. Die Fahrt hat elf Stunden gedauert, das war ziemlich anstrengend.
Julia : Elf Stunden! Und wo habt ihr übernachtet?
Tarek : Wir haben eine Ferienwohnung in Split gemietet, direkt am Strand. Ich bin jeden Morgen im Meer geschwommen.
Julia : Und wie war das Wetter?
Tarek : Fantastisch. Die Sonne hat jeden Tag geschienen, und es waren über dreißig Grad. Und du? Du bist doch nach Wien gefahren, oder?
Julia : Ja, mit dem Nachtzug. Ich bin am Samstagmorgen angekommen und habe gleich die Altstadt besichtigt. Am Nachmittag habe ich Schloss Schönbrunn gesehen, und im Café habe ich natürlich eine Sachertorte gegessen.
Tarek : Lecker! Hat dir Wien gefallen?
Julia : Sehr! Nur am Sonntag hat es den ganzen Tag geregnet. Da bin ich ins Museum gegangen.
Tarek : Und hast du mir etwas mitgebracht?
Julia : Na klar, Mozartkugeln! Hier, nimm eine!

GRAMMAIRE : LE PASSÉ COMPOSÉ (PERFEKT)
Pour raconter au passé à l’oral et dans les messages, l’allemand emploie surtout le Perfekt : l’auxiliaire haben ou sein, conjugué, en 2e position, et le participe passé à la fin de la phrase.
• Ich habe die Altstadt besichtigt.   • Wir sind mit dem Auto gefahren.   • Am Sonntag hat es geregnet.
Dans une question sans mot interrogatif, l’auxiliaire vient en 1re position : Seid ihr geflogen? Hat dir Wien gefallen?

HABEN OU SEIN ?
• La plupart des verbes se conjuguent avec haben : Ich habe ein Hotel gebucht. Sie hat eine Sachertorte gegessen.
• On emploie sein avec les verbes de déplacement (fahren, fliegen, gehen, kommen, reisen, wandern, schwimmen), avec les verbes de changement d’état (aufstehen, einschlafen) et avec bleiben : Ich bin nach Wien gefahren. Wir sind zu Hause geblieben.

LE PARTICIPE PASSÉ
• Verbes réguliers : ge- + radical + -t : machen → gemacht, buchen → gebucht, mieten → gemietet, dauern → gedauert, regnen → geregnet
• Verbes irréguliers : ge- + radical (souvent modifié) + -en : fahren → gefahren, sehen → gesehen, essen → gegessen, fliegen → geflogen, schwimmen → geschwommen, scheinen → geschienen, gehen → gegangen
• Verbes à particule séparable : ge- se place entre la particule et le radical : ankommen → angekommen, einkaufen → eingekauft, mitbringen → mitgebracht
• Pas de ge- pour les verbes en -ieren ni pour les verbes à préfixe inséparable (be-, ver-, er-, ge-, et über- dans übernachten) : reservieren → reserviert, besichtigen → besichtigt, besuchen → besucht, verpassen → verpasst, übernachten → übernachtet, gefallen → gefallen

SEIN ET HABEN AU PASSÉ
Pour ces deux verbes, on emploie plutôt le prétérit : ich war, du warst, er/sie war, wir waren, ihr wart, sie/Sie waren ; ich hatte, du hattest, er/sie hatte, wir hatten.
• Wie war dein Urlaub? — Comment se sont passées tes vacances ?   • Ich war zwei Wochen am Meer.   • Wir hatten Glück mit dem Wetter.`,
      },
    },

    'a2-reisen-lesen': {
      title: 'Vérifier : lire un courriel de retour de vacances',
      explanations: {
        q1: 'Le courriel commence par « seit Sonntag bin ich wieder in Frankfurt » : Sophie est rentrée dimanche et elle est chez elle depuis. Seit indique le point de départ d’une situation qui dure.',
        q2: '« Am ersten Tag hatte unsere S-Bahn Verspätung, und wir haben den Zug nach Oberstdorf verpasst » : le retard de la S-Bahn leur a fait rater le train. Celui-ci a bien circulé, ils ont pris le suivant.',
        q3: 'Sophie écrit « Das Zimmer war einfach, aber sehr sauber, und das Frühstück war super ». Einfach veut dire simple, ni grand ni moderne, et sauber veut dire propre.',
        q4: '« Leider hat es die ersten drei Tage fast nur geregnet. Wir haben ein Museum besucht und viel gelesen. » Les randonnées commencent seulement au quatrième jour, avec le soleil.',
        q5: '« Das war anstrengend, aber der Blick war fantastisch » : la montée à près de 2 000 mètres était fatigante (anstrengend), mais la vue magnifique. Aucun orage n’est mentionné.',
        q6: 'À la fin, Sophie écrit « Dann schick mir bitte ein Foto vom Strand! », car Maren part à la mer en août. La carte postale et le fromage ne sont pas demandés.',
      },
    },

    'a2-reisen-hoeren': {
      title: 'Vérifier : écouter à la gare, au téléphone, à la radio',
      // Liste complète : la question 1 ne cite plus de nom de produit ; identifiants et images inchangés.
      questions: [
        {
          "id": "q1",
          "type": "choice",
          "prompt": "Szene 1 : Von welchem Gleis fährt der Zug nach München heute ab?",
          "options": [
            {
              "id": "a",
              "label": "Von Gleis 3.",
              "correct": false
            },
            {
              "id": "b",
              "label": "Von Gleis 4.",
              "correct": false
            },
            {
              "id": "c",
              "label": "Von Gleis 7.",
              "correct": true
            },
            {
              "id": "d",
              "label": "Von Gleis 14.",
              "correct": false
            }
          ],
          "explanation": "L’annonce dit « Der Zug nach München … fährt heute von Gleis sieben ab ». Gleis drei est le quai où l’annonce est faite (« Achtung an Gleis drei! ») et 14 vient de l’heure de départ, 10 h 14."
        },
        {
          "id": "q2",
          "type": "choice",
          "prompt": "Szene 2 : Wie viele Nächte bleibt Herr Kaya in der Pension?",
          "options": [
            {
              "id": "a",
              "label": "Zwei Nächte.",
              "correct": false
            },
            {
              "id": "b",
              "label": "Drei Nächte.",
              "correct": true
            },
            {
              "id": "c",
              "label": "Vier Nächte.",
              "correct": false
            },
            {
              "id": "d",
              "label": "Fünf Nächte.",
              "correct": false
            }
          ],
          "explanation": "Herr Kaya réserve « vom zwölften bis zum fünfzehnten August » et la réceptionniste confirme « das sind drei Nächte » : les nuits du 12, du 13 et du 14."
        },
        {
          "id": "q3",
          "type": "choice",
          "prompt": "Szene 2 : Was kostet das Zimmer?",
          "options": [
            {
              "id": "a",
              "label": "59 Euro pro Nacht, mit Frühstück.",
              "correct": false
            },
            {
              "id": "b",
              "label": "95 Euro pro Nacht, ohne Frühstück.",
              "correct": false
            },
            {
              "id": "c",
              "label": "95 Euro für drei Nächte, mit Frühstück.",
              "correct": false
            },
            {
              "id": "d",
              "label": "95 Euro pro Nacht, mit Frühstück.",
              "correct": true
            }
          ],
          "explanation": "« Es kostet fünfundneunzig Euro pro Nacht » et « das Frühstück ist dabei » : 95 € par nuit, petit-déjeuner compris. En allemand, on dit l’unité avant la dizaine : fünf-und-neunzig = 95, pas 59."
        },
        {
          "id": "q4",
          "type": "choice",
          "prompt": "Szene 3 : Wie ist das Wetter am Sonntag im Süden?",
          "options": [
            {
              "id": "a",
              "label": "Die Sonne scheint.",
              "correct": true
            },
            {
              "id": "b",
              "label": "Es regnet.",
              "correct": false
            },
            {
              "id": "c",
              "label": "Es gibt Gewitter.",
              "correct": false
            },
            {
              "id": "d",
              "label": "Es ist bewölkt.",
              "correct": false
            }
          ],
          "explanation": "Pour dimanche, le bulletin annonce « im Norden noch bewölkt, aber im Süden scheint die Sonne ». La pluie et les orages concernent samedi ; les nuages, dimanche dans le nord."
        },
        {
          "id": "q5",
          "type": "choice",
          "prompt": "Szene 4 : Wie ist Max nach Stockholm gereist?",
          "options": [
            {
              "id": "a",
              "label": "Mit dem Flugzeug.",
              "correct": false
            },
            {
              "id": "b",
              "label": "Mit dem Auto.",
              "correct": false
            },
            {
              "id": "c",
              "label": "Mit dem Schiff.",
              "correct": false
            },
            {
              "id": "d",
              "label": "Mit dem Zug.",
              "correct": true
            }
          ],
          "explanation": "Max raconte « Wir sind mit dem Zug nach Stockholm gefahren ». Mit + datif indique le moyen de transport ; aucun avion, aucune voiture, aucun bateau n’est mentionné."
        },
        {
          "id": "q6",
          "type": "choice",
          "prompt": "Szene 4 : Was ist am letzten Tag passiert?",
          "options": [
            {
              "id": "a",
              "label": "Es hat den ganzen Tag geregnet.",
              "correct": false
            },
            {
              "id": "b",
              "label": "Max hat den Zug verpasst.",
              "correct": false
            },
            {
              "id": "c",
              "label": "Max hat seine Kamera im Zug vergessen.",
              "correct": true
            },
            {
              "id": "d",
              "label": "Max ist im kalten See krank geworden.",
              "correct": false
            }
          ],
          "explanation": "« Am letzten Tag habe ich meine Kamera im Zug vergessen. » Max ne parle ni de pluie ni de train raté, et il s’est baigné malgré l’eau fraîche (18 degrés) sans tomber malade."
        },
        {
          "id": "q7",
          "type": "dictation",
          "prompt": "Scène 1 : écoutez la phrase de l’annonce sur le retard et écrivez-la.",
          "accept": [
            "Der Zug hat circa fünfzehn Minuten Verspätung.",
            "Der Zug hat circa 15 Minuten Verspätung.",
            "Der Zug hat zirka fünfzehn Minuten Verspätung."
          ],
          "voice": "sprecher",
          "explanation": "Circa (environ) précède le nombre de minutes. Die Verspätung prend une majuscule comme tout nom ; dans fünfzehn, écrivez le ü et le z."
        }
      ],
    },

    'a2-reisen-dib-wetter': {
      title: 'Vérifier : la météo avec des voix natives',
      explanations: {
        q1: 'Le dessin montre un soleil : es ist sonnig (de die Sonne). L’enregistrement dit aussi « Die Sonne scheint den ganzen Tag ». Bewölkt décrirait un ciel couvert de nuages.',
        q2: 'Le nuage d’où tombe la pluie correspond à der Regen, d’où le verbe regnen : es regnet. Comme le « il » de « il pleut », es est ici un sujet impersonnel.',
        q3: 'Le flocon représente der Schnee, d’où le verbe schneien : es schneit. Es regnet parlerait de pluie, pas de neige.',
        q4: 'L’éolienne et les traits de vent illustrent der Wind ; l’adjectif windig donne « Es ist windig ». Le dessin ne montre ni pluie ni neige.',
        q5: 'Un ciel gris et couvert, sans pluie : es ist bewölkt (de die Wolke, le nuage). Es regnet supposerait de la pluie, ce que l’énoncé exclut.',
        q6: '« Es gießt wie aus Eimern » se traduit mot à mot par « il verse comme des seaux » : il pleut à verse. C’est la seule phrase du premier enregistrement qui parle d’une très forte pluie.',
      },
    },

    'a2-reisen-balkonien': {
      title: 'Vérifier : lire « Urlaub auf Balkonien »',
      explanations: {
        q1: 'L’article commence par « am liebsten in den warmen Süden: nach Spanien, nach Italien oder in die Türkei ». Am liebsten signifie « de préférence ». Le nord, l’Amérique et les montagnes ne sont pas cités.',
        q2: '« Immer mehr Menschen bleiben im Urlaub zu Hause oder fahren nicht weit weg. Man nennt das „Urlaub auf Balkonien“. » Balkonien est un pays imaginaire formé sur der Balkon : on reste chez soi.',
        q3: 'Deuxième raison : « Zweitens spart man viel Geld, weil man kein Flugticket und kein Hotel bezahlen muss. » Le texte ne dit rien du prix des musées ni des achats.',
        q4: 'Troisième raison : beaucoup d’habitants « haben das Museum oder den See in der Nähe noch nie besucht ». Noch nie signifie « jamais encore ».',
        q5: '« Viertens schläft man im eigenen Bett. Das ist besonders wichtig, wenn man kleine Kinder hat. » Wenn introduit la condition : quand on a de jeunes enfants.',
        q6: '« Seit der Corona-Zeit machen viel mehr Deutsche Campingurlaub » : sous la tente ou en camping-car, mais dans leur propre pays (an die Nordsee, in die Alpen), pas au bout du monde.',
      },
    },

    'a2-reisen-planen': {
      title: 'Vérifier : écouter des amis organiser un voyage',
      lesson: {
        description: `Felix et Selin, deux amis qui habitent à Berlin, préparent leurs vacances d’été. Felix rêve de partir très loin ; Selin préfère une destination plus proche. Lisez d’abord les mots utiles, puis écoutez la conversation autant de fois que nécessaire et répondez aux questions. La transcription s’affichera après votre réponse.

MOTS UTILES
• das Fernweh — l’envie de partir loin (le contraire de das Heimweh, le mal du pays)
• Hast du Lust, im Sommer zu verreisen? — As-tu envie de partir en voyage cet été ?
• Ich würde gern … — J’aimerais bien …   • Wie wäre es mit …? — Que dirais-tu de … ?   • Wir könnten … — Nous pourrions …
• die Ostsee — la mer Baltique   • Rügen — la plus grande île d’Allemagne, sur la mer Baltique
• baden — se baigner   • das Fischbrötchen — le sandwich au poisson, spécialité du nord de l’Allemagne
• Einverstanden! — D’accord !   • Versprochen! — Promis !

ET APRÈS ?
Après avoir répondu, relisez la transcription et repérez comment Selin fait ses propositions : Wie wäre es mit der Ostsee? Wir könnten zelten! Ces formules servent à proposer une sortie ou un voyage sans imposer son idée.

Situation adaptée de Der und mehr (Kennesaw State University), CC BY 4.0.`,
      },
      explanations: {
        q1: 'Felix dit d’abord « Ich würde gern nach Thailand fliegen ». La mer Baltique (die Ostsee) est la proposition de Selin, qu’il accepte ensuite.',
        q2: 'Selin répond « Das ist mir zu teuer » (le vol coûte près de 1 000 euros) et ajoute qu’un si long vol « ist auch schlecht für die Umwelt ». Elle ne parle ni de peur de l’avion ni de congés.',
        q3: '« Wir haben jeden Tag im Meer gebadet und sind mit dem Fahrrad über die ganze Insel gefahren. » Le camping et les sandwichs au poisson concernent le projet de cette année, pas le séjour passé.',
        q4: 'Selin préfère « lieber mit dem Zug » : trois heures depuis Berlin et 30 euros avec le Sparpreis. La voiture est la première idée de Felix, que Selin écarte.',
        q5: 'Selin propose « Wir könnten zelten! » et Felix accepte : « Aber okay, wir zelten! ». Ils dormiront sous la tente sur un camping au bord de la plage ; l’hôtel est jugé trop cher.',
        q6: 'Selin a congé « vom zwölften bis zum neunzehnten Juli » et propose « Eine Woche? » : une semaine en juillet. Felix répond « Perfekt, ich auch! ».',
      },
    },

    'a2-reisen-grammatik': {
      title: 'S’entraîner : le Perfekt et les destinations',
      estimatedMinutes: 12,
      competences: ['lecture', 'ecoute', 'expression-ecrite'],
      lesson: {
        description: `Complétez, remettez dans l’ordre ou choisissez la forme correcte, puis écrivez la phrase dictée.

RAPPELS
• Perfekt : haben ou sein conjugué en 2e position, participe passé à la fin. On emploie sein avec les verbes de déplacement (fahren, fliegen, gehen, ankommen…) et avec bleiben.
• Participes : gemacht, gesehen, eingekauft ; pas de ge- pour les verbes en -ieren et à préfixe inséparable (reserviert, besichtigt, besucht).
• Wohin? (accusatif) : nach + ville ou pays sans article ; in + pays avec article ou région (in die Türkei, in die Berge) ; an + mer, lac, plage (ans Meer, an den See). Wo? (datif) : am See, in der Türkei, in den Bergen.`,
      },
      removeQuestions: ['q1', 'q2', 'q3', 'q4', 'q8'],
      explanations: {
        q5: 'Die Schweiz est un pays avec article : pour la destination (wohin?), on emploie in + accusatif, in die Schweiz. Nach s’emploie seulement devant une ville ou un pays sans article (nach Zürich).',
        q6: 'Pour aller à la mer, on emploie an + accusatif : an das Meer, contracté en ans Meer. Am Meer répond à wo? (on y est déjà) et ins Meer voudrait dire « dans l’eau ».',
        q7: 'La question wo? demande où l’on était : in + datif pluriel, in den Bergen, avec le -n du datif pluriel. In die Berge répond à wohin?, quand on y va.',
      },
      addQuestions: [
        { id: 'q9', type: 'fill', prompt: 'Complétez au Perfekt : auxiliaire, puis participe passé.',
          text: 'Letzten Sommer [[1]] wir nach Portugal [[2]].',
          blanks: [{ id: '1', accept: ['sind'], size: 6, hint: 'haben ou sein ?' }, { id: '2', accept: ['geflogen'], size: 10, hint: 'fliegen' }],
          explanation: 'Fliegen est un verbe de déplacement : Perfekt avec sein (wir sind). Son participe est irrégulier : geflogen. L’auxiliaire est en 2e position, le participe à la fin.' },
        { id: 'q10', type: 'fill', prompt: 'Complétez au Perfekt : auxiliaire, puis participe passé.',
          text: 'Ich [[1]] das Hotel schon im Januar [[2]].',
          blanks: [{ id: '1', accept: ['habe'], size: 6, hint: 'haben ou sein ?' }, { id: '2', accept: ['gebucht'], size: 10, hint: 'buchen' }],
          explanation: 'Buchen n’exprime pas de déplacement : Perfekt avec haben. C’est un verbe régulier : ge- + buch + -t, gebucht.' },
        { id: 'q11', type: 'fill', prompt: 'Complétez au Perfekt : auxiliaire, puis participe passé.',
          text: 'Wann [[1]] ihr in Hamburg [[2]]?',
          blanks: [{ id: '1', accept: ['seid'], size: 6, hint: 'haben ou sein ?' }, { id: '2', accept: ['angekommen'], size: 12, hint: 'ankommen' }],
          explanation: 'Ankommen exprime un déplacement : Perfekt avec sein (ihr seid). Pour un verbe séparable, ge- se place entre la particule et le radical : an-ge-kommen.' },
        { id: 'q12', type: 'fill', prompt: 'Complétez au Perfekt : auxiliaire, puis participe passé.',
          text: 'Am Samstag [[1]] wir das Schloss [[2]].',
          blanks: [{ id: '1', accept: ['haben'], size: 6, hint: 'haben ou sein ?' }, { id: '2', accept: ['besichtigt'], size: 12, hint: 'besichtigen' }],
          explanation: 'Besichtigen se conjugue avec haben. Les verbes à préfixe inséparable (be-, ver-, er-…) n’ont pas de ge- au participe : besichtigt, et non gebesichtigt.' },
        { id: 'q13', type: 'fill', prompt: 'Complétez au Perfekt : auxiliaire, puis participe passé.',
          text: 'Am Wochenende [[1]] wir zu Hause [[2]].',
          blanks: [{ id: '1', accept: ['sind'], size: 6, hint: 'haben ou sein ?' }, { id: '2', accept: ['geblieben'], size: 11, hint: 'bleiben' }],
          explanation: 'Bleiben se conjugue avec sein, même s’il n’exprime aucun mouvement. Son participe est irrégulier : geblieben.' },
        { id: 'q14', type: 'order', prompt: 'Remettez les mots dans l’ordre. Commencez par « Am Sonntag ».',
          answers: [['Am Sonntag', 'bin', 'ich', 'ins Museum', 'gegangen.']],
          explanation: 'Am Sonntag occupe la première position : l’auxiliaire bin suit immédiatement, puis le sujet ich ; le participe gegangen ferme la phrase. Gehen exprime un déplacement, d’où sein.' },
        { id: 'q15', type: 'dictation', prompt: 'Écoutez et écrivez la phrase : un trajet raconté au Perfekt.',
          accept: ['Wir sind mit dem Nachtzug nach Wien gefahren.'], voice: 'sprecherin',
          explanation: 'Fahren se conjugue avec sein : wir sind … gefahren. Mit dem Nachtzug (mit + datif) indique le moyen de transport ; der Nachtzug s’écrit en un seul mot, avec une majuscule.' },
      ],
    },

    'a2-reisen-aussprache': {
      lesson: {
        description: `Écoutez bien der Urlaub, der Strand, der Flug : le b se prononce [p], le d [t] et le g [k]. C’est l’Auslautverhärtung, le « durcissement final », une règle très régulière de l’allemand. Les six courts enregistrements viennent du manuel Deutsch im Blick et sont lus par un locuteur natif.

CONSONNES SONORES ET SOURDES
Les consonnes vont par paires : b/p, d/t, g/k, s [z]/s [s], v/f. Les deux consonnes d’une paire se forment au même endroit de la bouche ; seule la voix change. Posez la main sur la gorge et dites « bbbb » puis « pppp » : avec b, d et g, la gorge vibre (consonnes sonores) ; avec p, t et k, elle ne vibre pas (consonnes sourdes).
• p et b : les deux lèvres se ferment.
• t et d : la pointe de la langue touche la gencive, juste derrière les dents du haut.
• k et g : l’arrière de la langue touche le fond du palais.
En allemand, p, t et k sont suivis d’un petit souffle : placez la main devant la bouche et dites Post, Tag, Koffer. Vous devez sentir l’air.

LA RÈGLE
À la fin d’un mot ou d’une syllabe, b, d, g, s et v perdent leur voix : b → [p], d → [t], g → [k], s → [s], v → [f]. Au début d’un mot ou entre deux voyelles, ils gardent leur prononciation normale. Comparez dans les enregistrements :
• die Urlaube — der Urlaub [p]   • geben — gab [p]   • die Liebe — lieb [p]
• die Strände — der Strand [t]   • sandig — der Sand [t]   • einladen — einlud [t]
• fliegen — der Flug [k]   • die Berge — der Berg [k]
• lesen [z] — las [s]   • die Preise — der Preis   • die Häuser — das Haus
• brave [v] — brav [f]
La règle vaut aussi à la fin d’une syllabe, à l’intérieur d’un mot : das Flugzeug [k], abfahren [p], der Abflug [p] et [k], Hamburg [k].

LE PIÈGE POUR UN FRANCOPHONE
En français, une consonne finale garde sa voix : « la robe », « la mode », « la bague ». En allemand, non : der Tag se prononce [taːk], der Hund [hʊnt], der Zug [tsuːk]. À l’écrit, en revanche, on garde b, d et g : pour savoir comment écrire un mot, pensez au pluriel ou à un mot de la même famille (der Strand → die Strände, donc d ; der Berg → die Berge, donc g).
Cas particulier : la terminaison -ig. En allemand standard, on la prononce comme ich : billig, ruhig, wichtig. Dans le sud (Bavière, Autriche, Suisse), on entend aussi [ik]. Écoutez comment le locuteur prononce billig.

À VOUS
Écoutez chaque enregistrement, mettez en pause après chaque paire et répétez en exagérant la différence. Puis lisez à voix haute : Wir machen Urlaub am Strand. — Der Zug nach Hamburg fährt ab. — Das Flugzeug fliegt über den Berg. — Das Kind sitzt mit dem Hund im Zug. L’exercice « Répéter à voix haute » qui suit vérifie votre prononciation sur ces phrases.

Enregistrements et images : Deutsch im Blick (COERLL, Université du Texas à Austin), CC BY 4.0.`,
      },
    },

    'a2-reisen-sprechen': {
      kind: 'mission',
      title: 'Mission : raconter ses dernières vacances',
      estimatedMinutes: 20,
      competences: ['expression-orale', 'expression-ecrite'],
      lesson: {
        description: `Écoutez Nadia raconter ses dernières vacances, puis préparez votre propre récit.

MODÈLE
Letzten Sommer war ich mit meiner Schwester eine Woche in Lissabon. Wir sind mit dem Flugzeug geflogen und haben in einem kleinen Hotel in der Altstadt übernachtet. Das Wetter war super, jeden Tag fast dreißig Grad. Wir haben viele Sehenswürdigkeiten besichtigt, wir sind mit der alten Straßenbahn gefahren, und abends haben wir oft Fisch gegessen. Am letzten Tag sind wir an den Strand gefahren. Die Reise war nicht billig, aber wunderschön. Nächstes Jahr möchte ich nach Porto reisen.

POUR PRÉPARER
1. Où et quand ? Letzten Sommer / Im Mai / Letztes Jahr war ich in … / am Meer / in den Bergen.
2. Avec qui ? mit meiner Familie, mit Freunden, allein.
3. Comment ? Ich bin mit dem Zug / mit dem Auto gefahren. Ich bin geflogen.
4. Le logement : Wir haben in einem Hotel / in einer Ferienwohnung / in einer Jugendherberge übernachtet.
5. Les activités : Ich habe … besichtigt / gesehen / gegessen. Ich bin gewandert / geschwommen.
6. La météo : Das Wetter war schön. Die Sonne hat geschienen. Es hat oft geregnet.
7. Votre avis : Es war toll / anstrengend / langweilig / günstig / teuer.

Préparez seulement des mots-clés : à l’oral, parlez sans lire un texte rédigé.`,
      },
      mission: {
        oral: {
          prompt: 'Racontez vos dernières vacances en une minute environ, sans lire : où et quand, avec qui, comment vous avez voyagé, où vous avez dormi, deux activités, la météo et votre avis.',
          maxSeconds: 90,
        },
        written: {
          prompt: 'Écrivez à un ami allemand un courriel de 60 à 80 mots pour raconter ces vacances. Commencez par « Liebe … » (à une femme) ou « Lieber … » (à un homme) suivi d’une virgule, puis continuez par une minuscule ; terminez par « Liebe Grüße » et votre prénom.',
          maxChars: 1000,
          minWords: 60,
        },
        checklist: [
          'Dans mes phrases au Perfekt, l’auxiliaire est en 2e position et le participe passé à la fin.',
          'J’ai employé sein avec fahren, fliegen, gehen, kommen ou wandern, et haben avec les autres verbes.',
          'J’ai indiqué la destination avec nach, in ou an : nach Wien, in die Berge, ans Meer.',
          'J’ai parlé de la météo et donné mon avis sur le voyage.',
          'Mon courriel commence par « Liebe … » ou « Lieber … » et se termine par « Liebe Grüße ».',
        ],
      },
    },
  },

  add: [
    {
      after: 'a2-reisen-aussprache',
      activity: {
        id: 'a2-reisen-repeter',
        kind: 'exercise',
        title: 'Répéter à voix haute : à la gare et en voyage',
        estimatedMinutes: 8,
        competences: ['expression-orale'],
        lesson: {
          title: 'Répéter à voix haute : à la gare et en voyage',
          description: 'Écoutez chaque modèle, puis dites la phrase à voix haute. Faites entendre le durcissement final : Zug [k], Urlaub [p], Strand [t]. Si la reconnaissance vocale ne comprend pas votre phrase, réécoutez le modèle et réessayez.',
          transcript: null,
        },
        placements: [],
        questions: [
          { id: 'q1', type: 'speak', prompt: 'Écoutez, puis demandez un aller-retour au guichet.',
            text: 'Einmal nach Hamburg, hin und zurück, bitte.', accept: ['Einmal nach Hamburg, hin und zurück, bitte.'], threshold: 75,
            explanation: 'Formule du guichet pour un aller-retour. Dans Hamburg, le g final se prononce [k] : on entend « Hambourk ».' },
          { id: 'q2', type: 'speak', prompt: 'Écoutez, puis demandez de quelle voie part le train.',
            text: 'Von welchem Gleis fährt der Zug ab?', accept: ['Von welchem Gleis fährt der Zug ab?'], threshold: 75,
            explanation: 'Après le mot interrogatif, le verbe fährt vient en 2e position et la particule ab se place à la fin. Le g final de Zug se prononce [k].' },
          { id: 'q3', type: 'speak', prompt: 'Écoutez, puis annoncez votre réservation à la réception.',
            text: 'Ich habe das Zimmer schon reserviert.', accept: ['Ich habe das Zimmer schon reserviert.'], threshold: 75,
            explanation: 'Reserviert, sans ge- (verbe en -ieren), porte l’accent sur la dernière syllabe. Dans Zimmer, le z se prononce [ts].' },
          { id: 'q4', type: 'speak', prompt: 'Écoutez, puis signalez que vos bagages ne sont pas arrivés.',
            text: 'Mein Gepäck ist nicht angekommen.', accept: ['Mein Gepäck ist nicht angekommen.'], threshold: 75,
            explanation: 'Das Gepäck est un singulier : on dit ist, pas sind. Accentuez la particule du participe : AN-gekommen.' },
          { id: 'q5', type: 'speak', prompt: 'Écoutez, puis répétez en faisant entendre les consonnes finales.',
            text: 'Wir machen Urlaub am Strand.', accept: ['Wir machen Urlaub am Strand.'], threshold: 75,
            explanation: 'Durcissement final : Urlaub se termine par le son [p] et Strand par le son [t], même si l’on écrit b et d.' },
          { id: 'q6', type: 'speak', prompt: 'Écoutez, puis répétez en faisant entendre les g finaux.',
            text: 'Das Flugzeug fliegt über den Berg.', accept: ['Das Flugzeug fliegt über den Berg.'], threshold: 75,
            explanation: 'Flug- et Berg finissent par le son [k]. Dans fliegt, le g placé devant t se prononce aussi [k].' },
        ],
      },
    },
  ],
};
