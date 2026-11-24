// Module 19 · b1-umwelt (lot R4, thème 10) : agir pour son quartier et l’environnement.
// Grammaire : Konjunktiv II de l’irréel, comparatif et superlatif épithètes, je … desto.
// Reprise réécrite du brouillon B1 V1 (partie3.mjs › b1-umwelt) : propositions pour le quartier, soutien,
// objection et compromis, hypothèses au Konjunktiv II, comparaison de deux options.
import { C, bi, choice, fill, order, match, dictation, speak } from '../../lib.mjs';

// « Richtig, falsch oder steht nicht im Text? » : l’affirmation reste en allemand, seule la consigne est traduite.
const rf = (id, statement, answer, explanation) => choice(id, `„${statement}“ ${C.richtigFalsch}`,
  [['richtig', answer === 'r'], ['falsch', answer === 'f'], ['steht nicht im Text', answer === 'n']], explanation);
// Répétition de plus de dix mots : seuil 70 (plan, §1.5).
const speakLong = (id, text, explanation, accept) => ({ ...speak(id, text, explanation, accept), threshold: 70 });

export default {
  id: 'b1-umwelt',
  title: 'Umwelt : agir pour son quartier et l’environnement',
  objective: 'Comprendre et comparer des propositions écologiques pour le quartier, faire des hypothèses et dire ce que l’on ferait (Wenn wir mehr Zeit hätten, würden wir …).',
  grammarFocus: ['konjunktiv2-irreal', 'komparativ-attributiv', 'je-desto'],
  sources: [
    'Textes, dialogues et exercices originaux LinguaCap.',
    'Situations reprises et réécrites du brouillon B1 V1 (LinguaCap) : deux idées pour le quartier, objection et compromis.',
  ],
  vocabulary: [
    { word: 'Müll vermeiden', partOfSpeech: 'expression', translation: 'éviter les déchets',
      example: 'Mit Mehrwegflaschen können wir viel Müll vermeiden.', note: 'der Müll : les déchets (sans pluriel)' },
    { word: 'Energie sparen', partOfSpeech: 'expression', translation: 'économiser l’énergie',
      example: 'Wir sparen Energie, wenn wir das Licht ausmachen.', note: null },
    { word: 'nachhaltig', partOfSpeech: 'adjective', translation: 'durable (écologiquement)',
      example: 'Ein Leihladen ist eine nachhaltige Idee.', note: 'die Nachhaltigkeit : la durabilité' },
    { word: 'umweltfreundlich', partOfSpeech: 'adjective', translation: 'écologique, respectueux de l’environnement',
      example: 'Das Fahrrad ist umweltfreundlicher als das Auto.', note: 'contraire : umweltschädlich' },
    { word: 'Mehrwegflasche', article: 'die', plural: 'Mehrwegflaschen', partOfSpeech: 'noun', translation: 'la bouteille réutilisable (consignée)',
      example: 'Ich kaufe Milch nur noch in Mehrwegflaschen.', note: 'contraire : die Einwegflasche' },
    { word: 'Radweg', article: 'der', plural: 'Radwege', partOfSpeech: 'noun', translation: 'la piste cyclable',
      example: 'Der neue Radweg führt direkt zur Schule.', note: null },
    { word: 'Bürgerinitiative', article: 'die', plural: 'Bürgerinitiativen', partOfSpeech: 'noun', translation: 'le collectif de citoyens',
      example: 'Die Bürgerinitiative sammelt Unterschriften für mehr Bäume.', note: null },
    { word: 'Verbrauch', article: 'der', plural: null, partOfSpeech: 'noun', translation: 'la consommation',
      example: 'Der Verbrauch von Plastik ist viel zu hoch.', note: 'verbrauchen : consommer' },
    { word: 'Vorschlag', article: 'der', plural: 'Vorschläge', partOfSpeech: 'noun', translation: 'la proposition',
      example: 'Die Eltern haben einen guten Vorschlag gemacht.', note: 'einen Vorschlag machen, einreichen' },
    { word: 'vorschlagen', partOfSpeech: 'verb', translation: 'proposer',
      example: 'Ich schlage vor, dass wir zuerst einen Versuch machen.', note: 'séparable : vor|schlagen · Perfekt : hat vorgeschlagen' },
    { word: 'ausleihen', partOfSpeech: 'verb', translation: 'emprunter, prêter',
      example: 'Im Leihladen kann man eine Leiter ausleihen.', note: 'séparable : aus|leihen' },
    { word: 'teilen', partOfSpeech: 'verb', translation: 'partager',
      example: 'Wir teilen uns ein Auto mit den Nachbarn.', note: null },
    { word: 'wegwerfen', partOfSpeech: 'verb', translation: 'jeter',
      example: 'Wirf die Lampe nicht weg, man kann sie reparieren!', note: 'séparable : weg|werfen · Perfekt : hat weggeworfen' },
    { word: 'abstimmen über', partOfSpeech: 'verb', translation: 'voter sur',
      example: 'Die Bewohner stimmen über zwei Projekte ab.', note: '+ accusatif · séparable : ab|stimmen' },
    { word: 'sich einsetzen für', partOfSpeech: 'verb', translation: 's’engager pour',
      example: 'Die Eltern setzen sich für einen sicheren Schulweg ein.', note: '+ accusatif · séparable : ein|setzen' },
    { word: 'Stadtteil', article: 'der', plural: 'Stadtteile', partOfSpeech: 'noun', translation: 'le quartier (d’une ville)',
      example: 'In unserem Stadtteil gibt es wenig Grün.', note: 'synonyme : das Viertel' },
    { word: 'Vorteil', article: 'der', plural: 'Vorteile', partOfSpeech: 'noun', translation: 'l’avantage',
      example: 'Der größte Vorteil ist der niedrige Preis.', note: null },
    { word: 'Nachteil', article: 'der', plural: 'Nachteile', partOfSpeech: 'noun', translation: 'l’inconvénient',
      example: 'Ein Nachteil wäre, dass Parkplätze wegfallen.', note: null },
    { word: 'Lösung', article: 'die', plural: 'Lösungen', partOfSpeech: 'noun', translation: 'la solution',
      example: 'Das ist die günstigere Lösung.', note: null },
    { word: 'Verpackung', article: 'die', plural: 'Verpackungen', partOfSpeech: 'noun', translation: 'l’emballage',
      example: 'Obst ohne Verpackung macht weniger Müll.', note: null },
    { word: 'Lastenrad', article: 'das', plural: 'Lastenräder', partOfSpeech: 'noun', translation: 'le vélo cargo',
      example: 'Mit dem Lastenrad kann man auch große Einkäufe transportieren.', note: null },
    { word: 'Pfand', article: 'das', plural: null, partOfSpeech: 'noun', translation: 'la consigne, la caution',
      example: 'Auf die Flasche gibt es Pfand.', note: 'ein Pfand hinterlegen : laisser une caution' },
    { word: 'je … desto', partOfSpeech: 'conjunction', translation: 'plus … plus',
      example: 'Je mehr Leute mitmachen, desto besser.', note: 'aussi : je … umso' },
    { word: 'an deiner Stelle', partOfSpeech: 'expression', translation: 'à ta place',
      example: 'An deiner Stelle würde ich mit dem Rad fahren.', note: 'an Ihrer Stelle : à votre place' },
  ],
  media: [
    { key: 'b1-umwelt-lesen-ideen', kind: 'image', title: 'Deux idées pour le quartier',
      alt: 'Deux fiches côte à côte : « Idee 1 · Leihladen » (emprunter au lieu d’acheter, ouvert deux fois par semaine) et « Idee 2 · Sicherer Schulweg » (piste cyclable, vingt arceaux à vélos devant l’école).',
      image: { layout: 'cards', cards: [
        { icon: 'wrench', title: 'Idee 1: Leihladen', intro: [{ icon: 'house', text: 'im Nachbarschaftshaus' }],
          lines: [{ icon: 'recycle', text: 'Leihen statt kaufen' }, { icon: 'calendar-days', text: 'zweimal pro Woche geöffnet' }] },
        { icon: 'bike', title: 'Idee 2: Sicherer Schulweg', intro: [{ icon: 'map-pin', text: 'Kanalstraße' }],
          lines: [{ icon: 'bike', text: 'markierter Radweg' }, { icon: 'school', text: '20 Fahrradbügel an der Schule' }] },
      ] } },
    { key: 'b1-umwelt-hoeren-sitzung', kind: 'audio', title: 'Réunion du collectif « Grüner Nordring »',
      script: [
        { voice: 'frau', name: 'Hanna', text: 'Also, am Donnerstag stellen wir den Leihladen vor. Wir haben zehn Minuten. Ich würde vorschlagen, dass ich zuerst die Idee erkläre und dass ihr dann über die Details sprecht. Seid ihr einverstanden?' },
        { pause: 0.5 },
        { voice: 'mann2', name: 'Jonas', text: 'Ja, klar. Ich habe die Kosten noch einmal durchgerechnet. Die Regale kosten ungefähr fünfzehnhundert Euro, das Programm für die Ausleihe vierhundert. Für die ersten Geräte bleiben also etwa sechstausend Euro. Damit könnten wir mit ungefähr vierzig Geräten anfangen.' },
        { pause: 0.5 },
        { voice: 'frau2', name: 'Irina', text: 'Und wann wäre der Laden geöffnet? Das werden die Leute als Erstes fragen.' },
        { pause: 0.4 },
        { voice: 'frau', name: 'Hanna', text: 'Dienstags von siebzehn bis neunzehn Uhr und samstags von zehn bis dreizehn Uhr. Wenn wir mehr Freiwillige hätten, könnten wir auch mittwochs öffnen. Im Moment sind wir nur fünf. Wir bräuchten mindestens acht Leute.' },
        { pause: 0.5 },
        { voice: 'frau2', name: 'Irina', text: 'Ich könnte samstags helfen. Und ich kenne zwei Nachbarinnen, die auch Zeit hätten. Ich frage sie morgen. Noch eine Frage: Ist der Raum im Keller nicht zu klein?' },
        { pause: 0.4 },
        { voice: 'frau', name: 'Hanna', text: 'Er ist kleiner als der Saal oben, aber für vierzig Geräte reicht er. Außerdem hat er einen eigenen Eingang zum Hof. Das ist die praktischere Lösung für alle, die schwere Sachen tragen.' },
        { pause: 0.4 },
        { voice: 'mann2', name: 'Jonas', text: 'Super. Und wenn die beiden Nachbarinnen mitmachen würden, wären wir schon sieben. Eine Person finden wir bestimmt noch. Aber eine Sache macht mir Sorgen: die Eltern mit ihrem Radweg. Ihre Idee ist stark. Viele Leute sagen: Je sicherer die Straßen sind, desto besser ist es für alle.' },
        { pause: 0.5 },
        { voice: 'frau', name: 'Hanna', text: 'Das stimmt. Aber wir sind doch keine Konkurrenten. Ich hätte eine Idee: Wenn wir gewinnen würden, könnten wir auch ein Lastenrad kaufen. Die Familien könnten es kostenlos ausleihen, zum Beispiel für den Wocheneinkauf. Dann hätten auch die Eltern einen Vorteil.' },
        { pause: 0.5 },
        { voice: 'frau2', name: 'Irina', text: 'Das finde ich gut. Und was passiert, wenn jemand ein Gerät kaputt zurückbringt?' },
        { pause: 0.4 },
        { voice: 'mann2', name: 'Jonas', text: 'Wer etwas ausleiht, hinterlegt ein Pfand von zehn Euro. Kleine Schäden reparieren wir selbst. Ich würde dafür einmal im Monat einen Reparaturtreff anbieten.' },
        { pause: 0.5 },
        { voice: 'frau', name: 'Hanna', text: 'Perfekt. Dann machen wir es so: Ich erkläre die Idee, Jonas spricht über die Kosten, und Irina übernimmt die Öffnungszeiten und die Freiwilligen. Zum Schluss stellen wir die Idee mit dem Lastenrad vor.' },
        { pause: 0.4 },
        { voice: 'frau2', name: 'Irina', text: 'Gut. Und ich bringe einen Kuchen mit. Mit Kuchen hören die Leute lieber zu!' },
      ] },
    { key: 'b1-umwelt-hoeren2-umfrage', kind: 'audio', title: 'Micro-trottoir de la radio du quartier',
      script: [
        { voice: 'sprecherin', name: 'Reporterin', text: 'Guten Tag, hier ist Radio Nordring. Heute fragen wir auf dem Marktplatz: Was würden Sie in Ihrem Viertel für die Umwelt ändern, wenn Sie Bürgermeisterin oder Bürgermeister wären?' },
        { pause: 0.6 },
        { voice: 'mann2', name: 'Lukas', text: 'Ich würde mehr Radwege bauen. Ich fahre jeden Tag mit dem Rad zur Uni, und auf der Kanalstraße habe ich wirklich Angst. Je mehr Radwege es gibt, desto weniger Leute nehmen das Auto.' },
        { pause: 0.6 },
        { voice: 'frau3', name: 'Frau Schneider', text: 'Ich hätte gern einen besseren Busverkehr. Der Bus fährt bei uns nur alle dreißig Minuten, abends sogar nur einmal pro Stunde. Wenn die Busse öfter fahren würden, würde ich mein Auto stehen lassen.' },
        { pause: 0.6 },
        { voice: 'mann3', name: 'Herr Demir', text: 'Ich habe ein kleines Café am Markt. Bei mir werden jeden Tag ungefähr hundert Pappbecher weggeworfen. Ich würde Mehrwegbecher für das ganze Viertel einführen. Wenn alle Cafés mitmachen würden, wäre das ganz einfach.' },
        { pause: 0.6 },
        { voice: 'frau', name: 'Mia', text: 'Ich würde mehr Bäume pflanzen, vor allem an unserer Schule. Im Sommer ist es auf dem Schulhof viel zu heiß. Ein grünerer Schulhof wäre für alle schöner.' },
        { pause: 0.6 },
        { voice: 'sprecherin', name: 'Reporterin', text: 'Vier Menschen, vier Ideen. Und was würden Sie ändern? Schreiben Sie uns auf der Internetseite von Radio Nordring.' },
      ] },
    { key: 'b1-umwelt-kontrolle-nachricht', kind: 'audio', title: 'Message vocal de Hanna après le vote',
      script: [
        { voice: 'frau', name: 'Hanna', text: 'Hallo Jonas, hier ist Hanna. Die Abstimmung ist vorbei: Der Radweg hat gewonnen, aber nur mit zwölf Stimmen Vorsprung. Der Stadtteilrat hat trotzdem eine gute Nachricht für uns: Wenn wir einen kleineren Leihladen planen, bekommen wir nächstes Jahr dreitausend Euro. Ich wäre dafür, sofort mit der Planung anzufangen. Ruf mich doch heute Abend an!' },
      ] },
  ],
  activities: [
    { id: 'b1-umwelt-einstieg', kind: 'lesson', title: 'Mise en route : l’environnement dans mon quartier', estimatedMinutes: 10,
      competences: ['lecture', 'expression-orale'],
      lesson: { description: `UMWELT BEGINNT VOR DER HAUSTÜR
[fr] L’environnement commence devant sa porte

Denken Sie an Ihre Straße und an Ihr Viertel. [fr] Pensez à votre rue et à votre quartier.

FRAGEN ZUM EINSTIEG
[fr] Questions pour commencer
• Was tun Sie im Alltag schon für die Umwelt? [fr] Que faites-vous déjà au quotidien pour l’environnement ?
• Was würden Sie in Ihrem Viertel sofort ändern, wenn Sie könnten? [fr] Que changeriez-vous tout de suite dans votre quartier, si vous le pouviez ?
• Fahren Sie lieber mit dem Rad, mit dem Bus oder mit dem Auto? Warum? [fr] Préférez-vous le vélo, le bus ou la voiture ? Pourquoi ?

Antworten Sie laut und in ganzen Sätzen. Es gibt keine falschen Antworten. [fr] Répondez à voix haute, par des phrases complètes. Il n’y a pas de mauvaise réponse.

DAS LERNEN SIE
[fr] Objectifs
• Ich kann Vorschläge für mein Viertel verstehen. [fr] Je peux comprendre des propositions pour mon quartier.
• Ich kann zwei Möglichkeiten vergleichen. [fr] Je peux comparer deux options.
• Ich kann eine Hypothese formulieren: Wenn wir …, würden wir … [fr] Je peux formuler une hypothèse : « Si nous …, nous … ».
• Ich kann Ratschläge geben: An deiner Stelle würde ich … [fr] Je peux donner des conseils : « À ta place, je … ».

WICHTIGE WÖRTER
[fr] Mots-clés
• Müll vermeiden — éviter les déchets
• Energie sparen — économiser l’énergie
• nachhaltig — durable
• die Mehrwegflasche — la bouteille réutilisable
• der Radweg — la piste cyclable
• die Bürgerinitiative — le collectif de citoyens
• umweltfreundlich — écologique
• der Verbrauch — la consommation` } },

    { id: 'b1-umwelt-lesen', kind: 'exercise', title: 'Comprendre : deux idées pour le quartier', estimatedMinutes: 20,
      competences: ['lecture'],
      lesson: { description: `${C.lesen}

STRATEGIE
[fr] Stratégie
Lesen Sie zuerst den Titel und Absatz 1: Worum geht es? [fr] Lisez d’abord le titre et le paragraphe 1 : de quoi s’agit-il ?
Lesen Sie dann eine Frage und suchen Sie nur die passende Stelle im Text. [fr] Lisez ensuite une question et cherchez seulement le passage utile.
„Steht nicht im Text“ heißt: Der Text sagt dazu gar nichts. [fr] « Steht nicht im Text » signifie : le texte n’en dit rien du tout.

Zwei Ideen für den Nordring: Sie entscheiden!

(1) Der Stadtteilrat Nordring hat in diesem Jahr 8000 Euro für ein Umweltprojekt im Viertel. Zwei Gruppen haben Vorschläge eingereicht. Bis zum 15. Mai können alle Bewohnerinnen und Bewohner ab 14 Jahren online oder im Nachbarschaftshaus abstimmen. Das Projekt mit den meisten Stimmen bekommt das ganze Geld.

(2) Die Bürgerinitiative „Grüner Nordring“ möchte im Nachbarschaftshaus einen Leihladen eröffnen. Dort könnte man Bohrmaschinen, Leitern, Zelte oder eine Nähmaschine ausleihen, statt sie neu zu kaufen. „In fast jedem Keller liegt ein Gerät, das nur ein paar Minuten im Jahr benutzt wird“, sagt Hanna Berger, die Sprecherin der Initiative. „Wenn wir diese Dinge teilen würden, gäbe es weniger Müll, und alle würden Geld sparen. Ein Leihladen ist die billigere und umweltfreundlichere Lösung.“ Mit dem Budget würde die Initiative Regale, ein Programm für die Ausleihe und die ersten Geräte kaufen. Wer etwas ausleiht, soll ein Pfand von zehn Euro hinterlegen. Der Laden wäre zweimal pro Woche geöffnet, und Freiwillige würden dort den Dienst übernehmen.

(3) Eltern der Grundschule am Park schlagen einen sichereren Schulweg vor. Heute bringen viele Eltern ihre Kinder mit dem Auto zur Schule, weil die Kanalstraße eng und gefährlich ist. Ein markierter Radweg und zwanzig neue Fahrradbügel vor der Schule könnten das ändern. „Je sicherer der Weg ist, desto mehr Kinder fahren mit dem Rad“, meint Murat Yilmaz, Vater von zwei Kindern. Ein Radweg wäre außerdem gut für alle, die mit dem Rad zur Arbeit fahren. Die Stadt würde den Radweg selbst bezahlen, wenn der Stadtteilrat die Fahrradbügel und eine Aktionswoche „Mit dem Rad zur Schule“ finanzieren würde. Allerdings würden in der Kanalstraße sechs Parkplätze wegfallen.

(4) Beide Gruppen stellen ihre Ideen am Donnerstag, dem 2. Mai, um 19 Uhr im Nachbarschaftshaus vor. Dort können Sie Fragen stellen und Ihre Meinung sagen. Wer nicht kommen kann, findet alle Unterlagen auf der Internetseite des Stadtteilrats. Und vielleicht gibt es im nächsten Jahr auch Geld für die andere Idee.` },
      placements: [{ media: 'b1-umwelt-lesen-ideen', caption: 'Zwei Vorschläge für den Nordring' }],
      questions: [
        choice('q1', bi('Worum geht es in dem Text?', 'De quoi parle le texte ?'), [
          ['Die Stadt hat einen Leihladen und einen Radweg gebaut.'],
          ['Zwei Gruppen haben je eine Idee für das Viertel, und die Bewohner stimmen darüber ab.', true],
          ['Die Eltern der Grundschule möchten mehr Parkplätze, weil sie mit dem Auto kommen.'],
        ], 'Le paragraphe 1 pose le cadre : 8 000 euros pour un seul projet, deux propositions et un vote des habitants jusqu’au 15 mai. Rien n’est encore construit : « könnte », « würde » et « wäre » montrent qu’il s’agit de projets. Les parents veulent au contraire moins de voitures.'),
        choice('q2', bi('Was ist das Ziel des Textes?', 'Quel est le but du texte ?'), [
          ['Er sucht Freiwillige, die im neuen Leihladen mitarbeiten.'],
          ['Er kritisiert den Stadtteilrat, weil das Budget zu klein ist.'],
          ['Er stellt zwei Ideen vor und lädt zur Abstimmung ein.', true],
        ], 'Le texte présente les deux idées de façon neutre, puis invite à voter (« Sie entscheiden! ») et à venir jeudi (paragraphe 4). Les bénévoles du magasin de prêt ne sont qu’un détail du paragraphe 2, et le texte ne critique jamais le budget.'),
        rf('q3', 'Der Leihladen wäre jeden Tag geöffnet.', 'f',
          'Faux : « Der Laden wäre zweimal pro Woche geöffnet » (paragraphe 2), donc deux fois par semaine, pas tous les jours.'),
        rf('q4', 'Die Stadt wäre bereit, den Radweg zu bezahlen.', 'r',
          'Vrai : « Die Stadt würde den Radweg selbst bezahlen, wenn … » (paragraphe 3). La ville paierait la piste à une condition : le conseil de quartier finance les arceaux et la semaine d’action.'),
        rf('q5', 'Viele Eltern der Grundschule sind gegen den Leihladen.', 'n',
          'Non mentionné : le texte ne donne jamais l’avis des parents sur le magasin de prêt. Ils présentent leur propre idée, ce qui ne veut pas dire qu’ils sont contre l’autre.'),
        choice('q6', bi('Was wäre ein Nachteil des Radwegs?', 'Quel serait un inconvénient de la piste cyclable ?'), [
          ['In der Kanalstraße gäbe es weniger Parkplätze.', true],
          ['Die Stadt müsste 8000 Euro mehr bezahlen.'],
          ['Die Kinder hätten einen längeren Schulweg.'],
        ], '« Allerdings würden in der Kanalstraße sechs Parkplätze wegfallen » : « allerdings » annonce la limite du projet. La ville ne paierait rien de plus que la piste, et le texte ne parle pas d’un trajet plus long.'),
        match('q7', bi('Welche Überschrift passt zu welchem Absatz?', 'Quel intertitre va avec quel paragraphe ?'), [
          ['Absatz 1', 'Ein Budget für das Viertel'],
          ['Absatz 2', 'Leihen statt kaufen'],
          ['Absatz 3', 'Sicher mit dem Rad zur Schule'],
          ['Absatz 4', 'Ihre Meinung ist gefragt'],
        ], 'Repérez le mot-clé de chaque paragraphe : 8 000 euros et le vote (1), « ausleihen, statt sie neu zu kaufen » (2), la piste cyclable et l’école (3), la réunion de jeudi où l’on peut « Fragen stellen und Ihre Meinung sagen » (4).'),
        fill('q8', bi('Ergänzen Sie mit Wörtern aus dem Text.', 'Complétez avec des mots du texte.'),
          'Im Leihladen kann man Geräte ausleihen, statt sie neu zu [[1]]. Wer etwas ausleiht, soll ein [[2]] von zehn Euro hinterlegen. Wegen der gefährlichen Kanalstraße bringen viele Eltern ihre Kinder mit dem [[3]] zur Schule.',
          [['kaufen'], ['Pfand'], ['Auto']],
          '« statt … zu kaufen » (au lieu d’acheter) ; « das Pfand » est la caution rendue au retour de l’objet, à ne pas confondre avec un prix de location ; « mit dem Auto » : c’est la voiture que les parents veulent remplacer par le vélo.'),
      ] },

    { id: 'b1-umwelt-hoeren', kind: 'exercise', title: 'Comprendre : la réunion du collectif', estimatedMinutes: 18,
      competences: ['ecoute'],
      lesson: { description: `${C.hoeren}

STRATEGIE
[fr] Stratégie
Beim ersten Hören: Wer spricht? Worum geht es? [fr] Première écoute : qui parle ? de quoi s’agit-il ?
Beim zweiten Hören: Achten Sie vor allem auf Zahlen, Tage und Uhrzeiten. [fr] Deuxième écoute : soyez surtout attentif aux nombres, aux jours et aux heures.

DIE SITUATION
[fr] La situation
Die Bürgerinitiative „Grüner Nordring“ bereitet die Präsentation vom Donnerstag vor. Es sprechen Hanna, Jonas und Irina. [fr] Le collectif « Grüner Nordring » prépare sa présentation de jeudi. Parlent : Hanna, Jonas et Irina.` },
      placements: [{ media: 'b1-umwelt-hoeren-sitzung', transcriptVisibility: 'after_answer' }],
      questions: [
        fill('q1', C.notizen,
          'Präsentation am Donnerstag: [[1]] Minuten · Programm für die Ausleihe: [[2]] Euro · Öffnungszeiten: dienstags 17–19 Uhr, samstags 10–[[3]] Uhr · Freiwillige: jetzt fünf, gebraucht: mindestens [[4]] · Pfand pro Gerät: [[5]] Euro',
          [['10', 'zehn'], ['400', 'vierhundert'], ['13', 'dreizehn'], ['8', 'acht'], ['10', 'zehn']],
          'Hanna annonce « zehn Minuten », Jonas chiffre le logiciel à « vierhundert » euros, le samedi va « von zehn bis dreizehn Uhr », il faudrait « mindestens acht Leute » et la caution est de « zehn Euro ». Chiffres ou lettres sont acceptés.'),
        choice('q2', bi('Was bietet Irina an?', 'Que propose Irina ?'), [
          ['Sie möchte den Laden auch mittwochs öffnen.'],
          ['Sie hilft samstags und fragt zwei Nachbarinnen.', true],
          ['Sie rechnet die Kosten noch einmal.'],
        ], '« Ich könnte samstags helfen. Und ich kenne zwei Nachbarinnen, die auch Zeit hätten. » L’ouverture du mercredi n’est qu’une hypothèse de Hanna (« Wenn wir mehr Freiwillige hätten … »), et c’est Jonas qui a fait les calculs.'),
        choice('q3', bi('Warum macht sich Jonas Sorgen?', 'Pourquoi Jonas s’inquiète-t-il ?'), [
          ['Das Geld reicht nicht für die Regale.'],
          ['Es gibt im Viertel zu wenige Geräte.'],
          ['Die Idee der Eltern hat gute Chancen.', true],
        ], '« Eine Sache macht mir Sorgen: die Eltern mit ihrem Radweg. Ihre Idee ist stark. » Il craint le projet concurrent. Le budget, lui, suffit : il reste environ 6 000 euros pour les appareils.'),
        choice('q4', bi('Welche Idee hat Hanna für die Familien?', 'Quelle idée Hanna a-t-elle pour les familles ?'), [
          ['Ein Lastenrad, das man kostenlos ausleihen kann.', true],
          ['Einen eigenen Radweg zum Nachbarschaftshaus.'],
          ['Eine Aktionswoche zusammen mit der Schule.'],
        ], '« Wenn wir gewinnen würden, könnten wir auch ein Lastenrad kaufen. Die Familien könnten es kostenlos ausleihen. » La semaine d’action fait partie du projet des parents, pas de celui de Hanna.'),
        choice('q5', bi('Was passiert, wenn ein Gerät kaputt zurückkommt?', 'Que se passe-t-il si un appareil revient cassé ?'), [
          ['Man muss ein neues Gerät kaufen.'],
          ['Ein Geschäft im Viertel repariert das Gerät kostenlos.'],
          ['Kleine Schäden repariert die Gruppe selbst.', true],
        ], 'Jonas : « Kleine Schäden reparieren wir selbst », avec un atelier de réparation (Reparaturtreff) une fois par mois. Il ne parle ni d’un magasin qui réparerait, ni d’un appareil à racheter : c’est le groupe lui-même qui répare.'),
        choice('q6', bi('Warum passt der Raum im Keller trotzdem gut?', 'Pourquoi la salle du sous-sol convient-elle quand même ?'), [
          ['Er ist größer als der Saal oben.'],
          ['Er hat einen eigenen Eingang zum Hof.', true],
          ['Er kostet keine Miete.'],
        ], 'Hanna reconnaît que la salle est « kleiner als der Saal oben », mais elle suffit pour quarante appareils et « hat einen eigenen Eingang zum Hof » : c’est plus pratique pour porter des objets lourds. Le loyer n’est pas mentionné.'),
      ] },

    { id: 'b1-umwelt-entdecken', kind: 'exercise', title: 'Découvrir : imaginer, comparer, enchaîner', estimatedMinutes: 10,
      competences: ['lecture'],
      lesson: { description: `${bi('Lesen Sie die Sätze aus dem Text und aus dem Gespräch. Beantworten Sie dann die Fragen.', 'Lisez les phrases tirées du texte et de la réunion, puis répondez aux questions.')}

Satz 1: Wenn wir diese Dinge teilen würden, gäbe es weniger Müll.
Satz 2: Wenn wir mehr Freiwillige hätten, könnten wir auch mittwochs öffnen.
Satz 3: Wenn wir gewinnen würden, könnten wir auch ein Lastenrad kaufen.
Satz 4: Eltern der Grundschule schlagen einen sichereren Schulweg vor.
Satz 5: Ein Leihladen ist die billigere und umweltfreundlichere Lösung.
Satz 6: Je sicherer der Weg ist, desto mehr Kinder fahren mit dem Rad.

Achten Sie auf die Verben, auf die Adjektive vor dem Nomen und auf die Wortstellung. [fr] Observez les verbes, les adjectifs placés devant le nom et l’ordre des mots.` },
      questions: [
        choice('q1', bi('Sätze 1 bis 3: Beschreiben sie die Realität oder eine Vorstellung?', 'Phrases 1 à 3 : décrivent-elles la réalité ou une situation imaginée ?'), [
          ['Die Realität: Es ist schon so.'],
          ['Die Vergangenheit: Es war früher einmal so, heute nicht mehr.'],
          ['Eine Vorstellung: Im Moment ist es nicht so.', true],
        ], 'C’est le Konjunktiv II de l’irréel : on imagine une situation qui n’existe pas maintenant. En réalité, on ne partage pas encore les objets, il n’y a pas assez de bénévoles et le vote n’est pas gagné. Le passé, lui, s’exprimerait au Perfekt ou au Präteritum.'),
        match('q2', bi('Welche Form gehört zu welchem Infinitiv?', 'Quelle forme correspond à quel infinitif ?'), [
          ['hätten', 'haben'],
          ['gäbe', 'geben'],
          ['könnten', 'können'],
          ['würden', 'werden'],
        ], 'Le Konjunktiv II se forme sur le prétérit, souvent avec un Umlaut : hatten → hätten, gab → gäbe, konnten → könnten, wurden → würden. « würden » + infinitif sert pour la plupart des autres verbes : wenn wir teilen würden.'),
        choice('q3', bi('Sätze 4 und 5: Was passiert mit dem Adjektiv vor dem Nomen?', 'Phrases 4 et 5 : que devient l’adjectif placé devant le nom ?'), [
          ['Es bekommt -er und danach die normale Endung.', true],
          ['Es bleibt ohne Endung, wie in „Der Weg ist sicherer als …“.'],
          ['Man setzt „mehr“ vor das Adjektiv.'],
        ], 'Devant un nom, le comparatif ajoute -er à l’adjectif, puis la terminaison habituelle : sicher → sicherer → einen sichereren Schulweg ; billig → billiger → die billigere Lösung. On ne forme jamais le comparatif avec « mehr » comme le français « plus ».'),
        choice('q4', bi('Satz 6: Wo steht das konjugierte Verb?', 'Phrase 6 : où se place le verbe conjugué ?'), [
          ['In beiden Teilen steht das Verb an Position 2, wie im Hauptsatz.'],
          ['Nach „je …“ am Ende, nach „desto …“ direkt nach dem Komparativ.', true],
          ['In beiden Teilen steht das Verb am Ende, wie im Nebensatz.'],
        ], '« Je » ouvre une subordonnée : le verbe va à la fin (« je sicherer der Weg ist »). La partie avec « desto » est la principale : son premier élément est « desto mehr Kinder », puis vient le verbe (« fahren »).'),
      ] },

    { id: 'b1-umwelt-regel', kind: 'lesson', title: 'Retenir : l’irréel, le comparatif devant le nom et je … desto', estimatedMinutes: 10,
      competences: ['lecture'],
      lesson: { description: `À RETENIR — 1. LE KONJUNKTIV II : IMAGINER UNE AUTRE RÉALITÉ
Le Konjunktiv II exprime une hypothèse, un souhait ou une situation imaginée qui ne correspond pas à la réalité présente. Le français met l’imparfait après « si » et le conditionnel dans la principale ; l’allemand met le Konjunktiv II dans les deux propositions.
• haben → ich hätte, du hättest, er/sie hätte, wir hätten, ihr hättet, sie/Sie hätten
• sein → ich wäre, du wärst, er/sie wäre, wir wären, ihr wärt, sie/Sie wären
• verbes de modalité → ich könnte, müsste, dürfte (avec Umlaut) ; ich sollte, wollte (sans Umlaut)
• quelques verbes fréquents → es gäbe (geben), ich käme (kommen), ich wüsste (wissen), ich bräuchte (brauchen)
• tous les autres verbes → würde + infinitif en fin de proposition : wir würden teilen, ich würde fahren

Wenn wir mehr Freiwillige hätten, könnten wir auch mittwochs öffnen.
Wenn die Straße sicherer wäre, würden mehr Kinder mit dem Rad fahren.
An deiner Stelle würde ich das Auto stehen lassen.

La subordonnée en wenn se termine par le verbe conjugué. La principale qui suit commence par son verbe (würden, könnten…), car la subordonnée occupe déjà la première place.

À RETENIR — 2. LE COMPARATIF ET LE SUPERLATIF DEVANT UN NOM
Devant un nom, le comparatif ajoute -er, puis la terminaison normale de l’adjectif ; le superlatif ajoute -(e)st-, puis la terminaison.
• ein billiger Laden → ein billigerer Laden
• die günstige Lösung → die günstigere Lösung
• mit einem kleinen Budget → mit einem kleineren Budget
• der kurze Weg → der kürzeste Weg ; die gute Idee → die beste Idee
• formes irrégulières : gut → besser → best- ; viel → mehr → meist- ; groß → größer → größt- ; hoch → höher → höchst-
• mehr et weniger restent invariables : mehr Radwege, weniger Müll

À RETENIR — 3. JE … DESTO : PLUS … PLUS
« Je » + comparatif ouvre une subordonnée (verbe à la fin) ; « desto » (ou « umso ») + comparatif ouvre la principale, et le verbe conjugué suit immédiatement le groupe comparatif.
Je mehr Leute mitmachen, desto weniger Müll gibt es.
Je früher wir anfangen, desto mehr Geld sparen wir.

ATTENTION
• « Si j’avais » ne se dit pas « wenn ich würde haben » mais « wenn ich hätte » : avec haben, sein et les verbes de modalité, on emploie la forme simple.
• Pas de virgule oubliée : la subordonnée en wenn ou en je est toujours séparée par une virgule.
• Après un comparatif, « que » se dit als (größer als) ; pour l’égalité, on dit so … wie (so groß wie).
• N’oubliez pas la terminaison de l’adjectif : eine bessere Idee, jamais « eine besser Idee ».` } },

    { id: 'b1-umwelt-grammatik', kind: 'exercise', title: 'S’entraîner : Konjunktiv II, comparatif et je … desto', estimatedMinutes: 14,
      competences: ['lecture', 'expression-ecrite'],
      lesson: { description: bi('Üben Sie die Formen aus der Regel. Lesen Sie jeden Satz bis zum Ende, bevor Sie antworten.', 'Entraînez-vous aux formes de la règle. Lisez chaque phrase jusqu’au bout avant de répondre.') },
      questions: [
        fill('q1', bi('Ergänzen Sie: hätte, wäre oder würde.', 'Complétez avec hätte, wäre ou würde.'),
          'Wenn ich mehr Zeit [[1]], [[2]] ich im Gemeinschaftsgarten helfen. Das [[3]] bestimmt schön!',
          [['hätte'], ['würde'], ['wäre']],
          '« Zeit haben » → wenn ich Zeit hätte ; « helfen » n’a pas de forme simple usuelle → ich würde helfen ; « schön sein » → das wäre schön. Le piège : « wenn ich Zeit würde » n’a pas de sens, il manque le verbe haben.'),
        fill('q2', bi('Ergänzen Sie den Konjunktiv II. Das Verb steht in Klammern.', 'Complétez au Konjunktiv II. Le verbe est entre parenthèses.'),
          'Wenn es hier einen Radweg [[1]] (geben), [[2]] meine Kinder allein zur Schule fahren (können).',
          [['gäbe', 'geben würde'], ['könnten']],
          '« es gibt » devient « es gäbe » (forme courante ; « geben würde » est aussi accepté à l’oral). « können » donne « könnten » au pluriel, avec Umlaut. Sans Umlaut, « konnten » serait le prétérit : « ils pouvaient ».'),
        order('q3', C.ordnen, [
          ['Wenn', 'ich', 'Bürgermeisterin', 'wäre,', 'würde', 'ich', 'mehr', 'Bäume', 'pflanzen.'],
        ], 'La subordonnée en wenn se termine par « wäre » ; la principale commence directement par le verbe « würde », puis le sujet « ich », et l’infinitif « pflanzen » va à la fin.'),
        choice('q4', bi('Sie haben kein Fahrrad. Was sagen Sie?', 'Vous n’avez pas de vélo. Que dites-vous ?'), [
          ['Wenn ich ein Fahrrad habe, fahre ich zur Arbeit.'],
          ['Wenn ich ein Fahrrad hätte, würde ich zur Arbeit fahren.', true],
          ['Wenn ich ein Fahrrad würde haben, würde ich zur Arbeit fahren.'],
        ], 'Vous n’avez pas de vélo : la situation est imaginée, donc Konjunktiv II (« hätte … würde … fahren »). La première phrase décrit une condition réelle (« quand j’ai un vélo »). La troisième fait l’erreur typique « würde haben » au lieu de « hätte ».'),
        fill('q5', bi('Ergänzen Sie den Komparativ mit der richtigen Endung.', 'Complétez avec le comparatif et la bonne terminaison.'),
          'Wir brauchen eine [[1]] Lösung (gut). Der Leihladen ist ein [[2]] Projekt als der Radweg (klein). Mit einem [[3]] Budget könnten wir mehr machen (groß).',
          [['bessere'], ['kleineres'], ['größeren']],
          'gut → besser (irrégulier) + -e après « eine » ; klein → kleiner + -es pour un neutre après « ein » ; groß → größer (Umlaut) + -en au datif après « mit einem ».'),
        choice('q6', bi('Welche Form ist richtig? Wir suchen einen … Weg zur Schule.', 'Quelle forme est juste ? Nous cherchons un chemin plus court pour l’école.'), [
          ['kurzeren'],
          ['kürzerer'],
          ['kürzeren', true],
        ], 'kurz → kürzer (avec Umlaut), puis -en : masculin à l’accusatif après « einen ». « kürzerer » serait la terminaison du nominatif (ein kürzerer Weg ist …), et « kurzeren » oublie l’Umlaut.'),
        match('q7', bi('Welche Satzteile passen zusammen?', 'Quelles parties de phrase vont ensemble ?'), [
          ['Je mehr Menschen Rad fahren,', 'desto weniger Autos sind auf der Straße.'],
          ['Je länger ein Gerät hält,', 'desto seltener muss man ein neues kaufen.'],
          ['Je früher wir mit der Planung anfangen,', 'desto mehr Zeit bleibt für die Aktionswoche.'],
          ['Je weniger Verpackung wir kaufen,', 'desto weniger Plastik landet im Müll.'],
        ], 'Chaque paire relie une cause et sa conséquence logique : plus de cyclistes → moins de voitures ; un appareil solide → moins d’achats ; commencer tôt → plus de temps ; moins d’emballages → moins de plastique dans les déchets.'),
        order('q8', C.ordnen, [
          ['Je', 'öfter', 'wir', 'Geräte', 'teilen,', 'desto', 'weniger', 'Geld', 'geben', 'wir', 'aus.'],
        ], 'Après « je öfter », la subordonnée se termine par le verbe « teilen ». Après « desto weniger Geld », le verbe conjugué « geben » vient tout de suite, puis le sujet « wir » et la particule séparable « aus ».'),
        fill('q9', bi('Ergänzen Sie den Superlativ.', 'Complétez avec le superlatif.'),
          'Das ist die [[1]] Idee (gut) und der [[2]] Weg zur Schule (kurz).',
          [['beste'], ['kürzeste']],
          'Superlatif devant un nom : article défini + -st- + terminaison. gut → best- (irrégulier) : die beste Idee ; kurz → kürzest- : der kürzeste Weg. « am besten » s’emploie seul, sans nom.'),
        choice('q10', bi('Welcher Satz ist richtig?', 'Quelle phrase est correcte ?'), [
          ['Je billiger der Laden ist, desto mehr Leute kommen.', true],
          ['Je billiger ist der Laden, desto mehr Leute kommen.'],
          ['Je billiger der Laden ist, desto kommen mehr Leute.'],
        ], 'Le verbe de la partie en « je » va à la fin (« … der Laden ist »). Dans la partie en « desto », le groupe « desto mehr Leute » occupe la première place, puis vient le verbe « kommen ». Ne séparez pas « desto » de son comparatif.'),
      ] },

    { id: 'b1-umwelt-wortschatz', kind: 'exercise', title: 'Mots et formules : environnement et propositions', estimatedMinutes: 12,
      competences: ['lecture', 'expression-ecrite'],
      lesson: { description: `${bi('Lernen Sie Wörter immer zusammen: Nomen mit Verb, Wortfamilien, feste Wendungen.', 'Apprenez les mots ensemble : nom avec verbe, familles de mots, expressions toutes faites.')}

REDEMITTEL FÜR EINE DISKUSSION
[fr] Formules pour une discussion
• proposer : Wie wäre es, wenn wir …? / Ich schlage vor, dass …
• approuver : Da haben Sie recht. / Das sehe ich genauso.
• nuancer : Das stimmt, aber man müsste auch an … denken.
• citer un inconvénient : Ein Nachteil wäre, dass …
• argumenter : Dafür spricht, dass … / Dagegen spricht, dass …` },
      questions: [
        match('q1', bi('Welches Verb passt zu welchem Nomen?', 'Quel verbe va avec quel nom ?'), [
          ['Müll', 'vermeiden'],
          ['Energie', 'sparen'],
          ['einen Vorschlag', 'einreichen'],
          ['eine Entscheidung', 'treffen'],
          ['Bäume', 'pflanzen'],
        ], 'Ces associations sont figées : Müll vermeiden (éviter les déchets), Energie sparen, einen Vorschlag einreichen (déposer une proposition), eine Entscheidung treffen (prendre une décision, et non « machen »), Bäume pflanzen.'),
        fill('q2', bi('Bilden Sie Nomen aus derselben Wortfamilie.', 'Formez des noms de la même famille.'),
          'verbrauchen → der [[1]] · nachhaltig → die [[2]] · vermeiden → die [[3]]',
          [['Verbrauch'], ['Nachhaltigkeit'], ['Vermeidung']],
          'verbrauchen → der Verbrauch (radical seul, masculin) ; adjectif en -ig + -keit → die Nachhaltigkeit ; verbe + -ung → die Vermeidung. Les noms en -keit et -ung sont toujours féminins.'),
        fill('q3', bi('Ergänzen Sie das Gegenteil.', 'Complétez avec le contraire.'),
          'die Einwegflasche ↔ die [[1]] · umweltschädlich ↔ [[2]] · Energie verschwenden ↔ Energie [[3]]',
          [['Mehrwegflasche'], ['umweltfreundlich'], ['sparen']],
          'Einweg (à usage unique) ↔ Mehrweg (réutilisable) ; -schädlich (nuisible) ↔ -freundlich (respectueux de) ; verschwenden (gaspiller) ↔ sparen (économiser).'),
        choice('q4', bi('Sie möchten höflich einen Vorschlag machen. Was sagen Sie?', 'Vous voulez faire poliment une proposition. Que dites-vous ?'), [
          ['Wir haben im Nachbarschaftshaus einen Leihladen eröffnet.'],
          ['Warum gibt es in unserem Viertel noch keinen Leihladen?'],
          ['Wie wäre es, wenn wir einen Leihladen eröffnen würden?', true],
        ], '« Wie wäre es, wenn … ? » (Et si … ?) est la formule type de la proposition polie, au Konjunktiv II. La première phrase annonce un fait accompli ; la deuxième ressemble à un reproche.'),
        choice('q5', bi('Sie sind nur zum Teil einverstanden. Was passt?', 'Vous n’êtes qu’en partie d’accord. Quelle formule convient ?'), [
          ['Da haben Sie recht, aber man müsste auch an die Kosten denken.', true],
          ['Genau, das sehe ich ganz genauso, die Kosten sind kein Problem.'],
          ['Das ist völlig falsch, über die Kosten müssen wir nicht reden.'],
        ], '« Da haben Sie recht, aber … » reconnaît un point puis le nuance : c’est l’accord partiel. « Das sehe ich genauso » est un accord total, « Das ist völlig falsch » un désaccord brutal.'),
        choice('q6', bi('Sie nennen einen Nachteil. Welcher Satz passt?', 'Vous citez un inconvénient. Quelle phrase convient ?'), [
          ['Dafür spricht, dass Parkplätze wegfallen.'],
          ['Ein Nachteil wäre, dass Parkplätze wegfallen.', true],
          ['Ich bin dafür, dass Parkplätze wegfallen.'],
        ], '« Ein Nachteil wäre, dass … » présente une limite, au Konjunktiv II car le projet n’existe pas encore. « Dafür spricht » introduit au contraire un argument favorable, et « Ich bin dafür » exprime un soutien.'),
        fill('q7', bi('Ergänzen Sie die Redemittel.', 'Complétez les formules.'),
          'Ich bin [[1]] den Radweg, weil er die Kinder schützt. [[2]] spricht auch, dass er nicht viel kostet.',
          [['für'], ['Dafür']],
          '« für etwas sein » : être pour quelque chose (accusatif : für den Radweg). « Dafür spricht, dass … » : un argument en faveur de cela est que … « Dagegen spricht » introduirait un argument contre.'),
      ] },

    { id: 'b1-umwelt-redemittel', kind: 'exercise', title: 'Répéter à voix haute : proposer, imaginer, comparer', estimatedMinutes: 9,
      competences: ['expression-orale'],
      lesson: { description: `${C.sprechen}

${bi('Hören Sie zuerst das Modell. Sprechen Sie dann den ganzen Satz flüssig nach.', 'Écoutez d’abord le modèle, puis répétez toute la phrase d’un trait.')}
${bi('Betonen Sie die wichtigen Wörter: hätten, mehr, desto.', 'Accentuez les mots importants : hätten, mehr, desto.')}` },
      questions: [
        speak('q1', 'Wenn wir mehr Zeit hätten, würden wir öfter Rad fahren.',
          'Hypothèse irréelle : « hätten » à la fin de la subordonnée, puis « würden » en tête de la principale. Marquez une petite pause à la virgule.'),
        speak('q2', 'Wie wäre es mit einem Leihladen im Nachbarschaftshaus?',
          'Proposition polie : « Wie wäre es mit … ? » + datif. La voix monte légèrement à la fin de la question.'),
        speak('q3', 'Je mehr Leute mitmachen, desto besser wird das Projekt.',
          'Accentuez « mehr » et « besser » : ce sont les deux comparatifs qui portent le sens. Le verbe « wird » suit directement « desto besser ».'),
        speak('q4', 'Ein Nachteil wäre, dass einige Parkplätze wegfallen.',
          'Pour nuancer : « Ein Nachteil wäre, dass … ». Dans « wegfallen », l’accent porte sur la particule « weg ».'),
        speak('q5', 'An deiner Stelle würde ich lieber mit dem Bus fahren.',
          'Conseil amical au Konjunktiv II : « an deiner Stelle » (à ta place). « lieber » est le comparatif de « gern ».'),
        speakLong('q6', 'Ich wäre dafür, zuerst einen Versuch von drei Monaten zu machen.',
          'Formule de compromis : « Ich wäre dafür, … zu machen ». L’infinitif avec « zu » termine la phrase. Les chiffres (3 Monaten) sont acceptés.',
          ['Ich wäre dafür, zuerst einen Versuch von drei Monaten zu machen.', 'Ich wäre dafür, zuerst einen Versuch von 3 Monaten zu machen.']),
      ] },

    { id: 'b1-umwelt-hoeren2', kind: 'exercise', title: 'Comprendre : un micro-trottoir sur l’environnement', estimatedMinutes: 15,
      competences: ['ecoute', 'expression-ecrite'],
      lesson: { description: `${C.hoeren}

DIE SITUATION
[fr] La situation
Radio Nordring fragt auf dem Markt: Was würden Sie ändern, wenn Sie Bürgermeisterin oder Bürgermeister wären? Vier Personen antworten. [fr] Radio Nordring demande au marché : que changeriez-vous si vous étiez maire ? Quatre personnes répondent.

STRATEGIE
[fr] Stratégie
Achten Sie bei jeder Person nur auf eine Frage: Was wünscht sie sich? [fr] Pour chaque personne, ne retenez qu’une chose : que souhaite-t-elle ?` },
      placements: [{ media: 'b1-umwelt-hoeren2-umfrage', transcriptVisibility: 'after_answer' }],
      questions: [
        match('q1', bi('Wer wünscht sich was?', 'Qui souhaite quoi ?'), [
          ['Lukas', 'mehr Radwege'],
          ['Frau Schneider', 'mehr Busse'],
          ['Herr Demir', 'Mehrwegbecher'],
          ['Mia', 'mehr Bäume an der Schule'],
        ], 'Lukas : « Ich würde mehr Radwege bauen. » Frau Schneider : « Wenn die Busse öfter fahren würden … ». Herr Demir : « Ich würde Mehrwegbecher … einführen. » Mia : « Ich würde mehr Bäume pflanzen, vor allem an unserer Schule. »'),
        choice('q2', bi('Was würde Frau Schneider tun, wenn die Busse öfter fahren würden?', 'Que ferait Mme Schneider si les bus passaient plus souvent ?'), [
          ['Sie würde schneller zur Arbeit kommen.'],
          ['Sie würde ihr Auto stehen lassen.', true],
          ['Sie würde eine billigere Fahrkarte kaufen.'],
        ], '« … würde ich mein Auto stehen lassen » : elle laisserait sa voiture au garage. Elle ne parle ni de son travail ni du prix des billets, seulement de la fréquence des bus (toutes les trente minutes, le soir toutes les heures).'),
        choice('q3', bi('Was sagt Herr Demir über sein Café?', 'Que dit M. Demir de son café ?'), [
          ['Dort gibt es schon seit einem Jahr nur Mehrwegbecher.'],
          ['Dort ist es im Sommer für die Gäste viel zu heiß.'],
          ['Dort werden jeden Tag viele Pappbecher weggeworfen.', true],
        ], '« Bei mir werden jeden Tag ungefähr hundert Pappbecher weggeworfen » (passif). Les gobelets réutilisables sont justement ce qu’il voudrait introduire ; la chaleur, c’est Mia qui en parle pour la cour de l’école.'),
        dictation('q4', 'Je mehr Radwege es gibt, desto weniger Leute nehmen das Auto.',
          'Après « je mehr Radwege », le verbe « gibt » est en fin de subordonnée ; après « desto weniger Leute », le verbe « nehmen » suit immédiatement. Majuscules : Radwege, Leute, Auto.', 'mann2'),
        dictation('q5', 'Wenn die Busse öfter fahren würden, würde ich mein Auto stehen lassen.',
          'Deux fois « würde » : à la fin de la subordonnée (würden, pluriel) puis en tête de la principale (würde, 1re personne). « stehen lassen » s’écrit en deux mots.', 'frau3'),
      ] },

    { id: 'b1-umwelt-kontrolle', kind: 'exercise', title: 'Vérifier : environnement, hypothèses et comparaisons', estimatedMinutes: 12,
      competences: ['lecture', 'ecoute'],
      lesson: { description: `${bi('Hören Sie die Nachricht von Hanna für die Fragen 1 und 2. Lösen Sie dann die anderen Aufgaben.', 'Écoutez le message de Hanna pour les questions 1 et 2, puis faites les autres exercices.')}` },
      placements: [{ media: 'b1-umwelt-kontrolle-nachricht', transcriptVisibility: 'after_answer' }],
      questions: [
        choice('q1', bi('Was ist das Ergebnis der Abstimmung?', 'Quel est le résultat du vote ?'), [
          ['Der Leihladen hat gewonnen.'],
          ['Es gibt noch kein Ergebnis.'],
          ['Der Radweg hat knapp gewonnen.', true],
        ], '« Der Radweg hat gewonnen, aber nur mit zwölf Stimmen Vorsprung » : la piste cyclable gagne de peu (knapp). Le vote est terminé (« Die Abstimmung ist vorbei »).'),
        choice('q2', bi('Was möchte Hanna jetzt tun?', 'Que veut faire Hanna maintenant ?'), [
          ['Sofort mit der Planung eines kleineren Leihladens anfangen.', true],
          ['Die Abstimmung wiederholen lassen, weil sie so knapp war.'],
          ['Ein Jahr warten und dann einen großen Leihladen planen.'],
        ], '« Ich wäre dafür, sofort mit der Planung anzufangen » : le conseil promet 3 000 euros l’an prochain pour un magasin de prêt plus petit. Hanna ne conteste pas le résultat.'),
        fill('q3', bi('Ergänzen Sie den Konjunktiv II.', 'Complétez au Konjunktiv II.'),
          'Wenn es im Viertel mehr Bäume [[1]], [[2]] die Luft im Sommer besser.',
          [['gäbe', 'geben würde'], ['wäre']],
          'Situation imaginée : « es gibt » → « es gäbe », « die Luft ist besser » → « die Luft wäre besser ». La principale commence par le verbe « wäre » parce que la subordonnée occupe la première place.'),
        fill('q4', bi('Ergänzen Sie den Komparativ mit Endung.', 'Complétez avec le comparatif et sa terminaison.'),
          'Wir wünschen uns einen [[1]] Radweg (breit) und [[2]] Busse (modern).',
          [['breiteren'], ['modernere']],
          'breit → breiter + -en (masculin accusatif après « einen ») ; modern → moderner + -e (pluriel sans article, à l’accusatif).'),
        order('q5', C.ordnen, [
          ['Ich', 'würde', 'öfter', 'Rad', 'fahren,', 'wenn', 'es', 'einen', 'Radweg', 'gäbe.'],
        ], 'Principale d’abord : « Ich würde öfter Rad fahren », avec l’infinitif à la fin. Puis la subordonnée en « wenn », qui se termine par le verbe conjugué « gäbe ».'),
        choice('q6', bi('Welcher Satz ist richtig?', 'Quelle phrase est correcte ?'), [
          ['Je weniger wir wegwerfen, desto das Viertel wird sauberer.'],
          ['Je weniger wir wegwerfen, desto sauberer wird das Viertel.', true],
          ['Je weniger werfen wir weg, desto sauberer wird das Viertel.'],
        ], 'Partie en « je » : verbe à la fin (« wegwerfen », non séparé en subordonnée). Partie en « desto » : « desto sauberer », puis le verbe « wird », puis le sujet « das Viertel ».'),
        choice('q7', bi('Sie möchten höflich widersprechen. Was sagen Sie?', 'Vous voulez exprimer poliment votre désaccord. Que dites-vous ?'), [
          ['Das ist doch Unsinn, das bezahlt ja niemand.'],
          ['Genau, da haben Sie völlig recht, das machen wir.'],
          ['Das sehe ich etwas anders, weil die Kosten hoch sind.', true],
        ], '« Das sehe ich etwas anders, weil … » exprime un désaccord nuancé et justifié. « Das ist doch Unsinn » est blessant, et la deuxième formule exprime un accord.'),
        fill('q8', bi('Ergänzen Sie.', 'Complétez.'),
          'Statt Einwegflaschen kaufen wir [[1]]. So können wir viel Müll [[2]].',
          [['Mehrwegflaschen'], ['vermeiden', 'reduzieren', 'verringern']],
          'Le contraire de « Einwegflaschen » (bouteilles à usage unique) : die Mehrwegflaschen (réutilisables, pluriel). On dit « Müll vermeiden » (éviter) ; « reduzieren » et « verringern » (réduire) sont aussi justes. « Müll sparen » ne se dit pas.'),
      ] },
  ],
};
