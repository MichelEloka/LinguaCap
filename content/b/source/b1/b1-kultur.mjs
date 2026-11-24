// Module 23 · b1-kultur (lot R4, thème 12) : sorties culturelles et fêtes.
// Grammaire : déclinaison complète de l’adjectif (après der, après ein, sans article), participes I et II employés
// comme adjectifs, Futur I (projet, prévision, supposition).
// Reprise réécrite du brouillon B1 V1 (partie3-suite.mjs › b1-kultur) : exposition de photos du quartier, visite guidée
// ou textes, nuancer une préférence (zwar … aber), argument précis, recommandation.
import { C, bi, choice, fill, order, match, dictation, speak } from '../../lib.mjs';

const rf = (id, statement, answer, explanation) => choice(id, `„${statement}“ ${C.richtigFalsch}`,
  [['richtig', answer === 'r'], ['falsch', answer === 'f'], ['steht nicht im Text', answer === 'n']], explanation);

export default {
  id: 'b1-kultur',
  title: 'Kultur : sorties culturelles et fêtes',
  objective: 'Comprendre un programme culturel et une critique, nuancer un avis, recommander une sortie et parler de traditions, en décrivant avec précision (adjectifs déclinés, participes) et en parlant de l’avenir (Futur I).',
  grammarFocus: ['adjektivdeklination', 'partizip-als-adjektiv', 'futur-1'],
  sources: [
    'Textes, dialogues et exercices originaux LinguaCap.',
    'Situations reprises et réécrites du brouillon B1 V1 (LinguaCap) : exposition de photos du quartier, visite guidée ou textes, nuancer une préférence.',
  ],
  vocabulary: [
    { word: 'Ausstellung', article: 'die', plural: 'Ausstellungen', partOfSpeech: 'noun', translation: 'l’exposition',
      example: 'Die Ausstellung zeigt Fotos vom alten Viertel.', note: null },
    { word: 'Aufführung', article: 'die', plural: 'Aufführungen', partOfSpeech: 'noun', translation: 'la représentation (théâtre, concert)',
      example: 'Nach der Aufführung haben alle lange geklatscht.', note: 'aufführen : jouer, représenter' },
    { word: 'Vorstellung', article: 'die', plural: 'Vorstellungen', partOfSpeech: 'noun', translation: 'la séance, la représentation',
      example: 'Die Vorstellung beginnt um halb acht.', note: 'aussi : la présentation, l’idée' },
    { word: 'Veranstaltung', article: 'die', plural: 'Veranstaltungen', partOfSpeech: 'noun', translation: 'l’événement, la manifestation',
      example: 'Alle Veranstaltungen stehen im Programm.', note: null },
    { word: 'Führung', article: 'die', plural: 'Führungen', partOfSpeech: 'noun', translation: 'la visite guidée',
      example: 'Die Führung beginnt samstags um elf Uhr.', note: null },
    { word: 'Theaterstück', article: 'das', plural: 'Theaterstücke', partOfSpeech: 'noun', translation: 'la pièce de théâtre',
      example: 'Das Theaterstück ist eine Komödie.', note: null },
    { word: 'Bühne', article: 'die', plural: 'Bühnen', partOfSpeech: 'noun', translation: 'la scène',
      example: 'Auf der Bühne stehen nur ein paar Koffer.', note: null },
    { word: 'Publikum', article: 'das', plural: null, partOfSpeech: 'noun', translation: 'le public',
      example: 'Das Publikum hat viel gelacht.', note: 'singulier en allemand : das Publikum lacht' },
    { word: 'Eintritt', article: 'der', plural: null, partOfSpeech: 'noun', translation: 'l’entrée (prix)',
      example: 'Der Eintritt ist für Kinder frei.', note: 'Eintritt frei : entrée libre' },
    { word: 'ermäßigt', partOfSpeech: 'adjective', translation: 'à tarif réduit',
      example: 'Für Studierende ist der Eintritt ermäßigt.', note: 'die Ermäßigung : la réduction' },
    { word: 'ausverkauft', partOfSpeech: 'adjective', translation: 'complet (plus de billets)',
      example: 'Die Vorstellung am Samstag ist leider ausverkauft.', note: null },
    { word: 'empfehlenswert', partOfSpeech: 'adjective', translation: 'recommandable, à voir',
      example: 'Das Konzert ist sehr empfehlenswert.', note: 'empfehlen : recommander' },
    { word: 'unterhaltsam', partOfSpeech: 'adjective', translation: 'divertissant',
      example: 'Wir haben einen unterhaltsamen Abend verbracht.', note: null },
    { word: 'sich lohnen', partOfSpeech: 'verb', translation: 'valoir la peine',
      example: 'Die Ausstellung lohnt sich wirklich.', note: 'Es lohnt sich, früh zu kommen.' },
    { word: 'stattfinden', partOfSpeech: 'verb', translation: 'avoir lieu',
      example: 'Das Fest findet auf dem Dorfplatz statt.', note: 'séparable : statt|finden · Perfekt : hat stattgefunden' },
    { word: 'klatschen', partOfSpeech: 'verb', translation: 'applaudir',
      example: 'Am Ende klatschten die Zuschauer minutenlang.', note: null },
    { word: 'Veranstaltungskalender', article: 'der', plural: 'Veranstaltungskalender', partOfSpeech: 'noun', translation: 'l’agenda culturel',
      example: 'Im Veranstaltungskalender steht, wann das Konzert ist.', note: null },
    { word: 'Fest', article: 'das', plural: 'Feste', partOfSpeech: 'noun', translation: 'la fête',
      example: 'Das Fest beginnt am 1. Mai um elf Uhr.', note: 'ein Fest feiern' },
    { word: 'feiern', partOfSpeech: 'verb', translation: 'fêter, faire la fête',
      example: 'Nach dem Aufstellen wird bis spät gefeiert.', note: null },
    { word: 'Brauch', article: 'der', plural: 'Bräuche', partOfSpeech: 'noun', translation: 'la coutume',
      example: 'Den Maibaum zu stehlen ist ein alter Brauch.', note: 'synonyme : die Tradition' },
    { word: 'Feiertag', article: 'der', plural: 'Feiertage', partOfSpeech: 'noun', translation: 'le jour férié',
      example: 'Der 1. Mai ist in Deutschland ein Feiertag.', note: null },
    { word: 'Tradition', article: 'die', plural: 'Traditionen', partOfSpeech: 'noun', translation: 'la tradition',
      example: 'Das Maifest hat im Dorf eine lange Tradition.', note: null },
    { word: 'Umzug', article: 'der', plural: 'Umzüge', partOfSpeech: 'noun', translation: 'le défilé (dans une fête)',
      example: 'Beim Umzug fahren geschmückte Wagen durch die Stadt.', note: 'aussi : le déménagement' },
    { word: 'sich verkleiden', partOfSpeech: 'verb', translation: 'se déguiser',
      example: 'Im Karneval verkleiden sich viele Menschen.', note: 'das Kostüm : le costume, le déguisement' },
    { word: 'Kritik', article: 'die', plural: 'Kritiken', partOfSpeech: 'noun', translation: 'la critique (article)',
      example: 'Die Kritik in der Zeitung war sehr positiv.', note: null },
  ],
  media: [
    { key: 'b1-kultur-lesen-programm', kind: 'image', title: 'Programme de la semaine culturelle',
      alt: 'Tableau « Kulturwoche im Westviertel » : lundi théâtre (14 €, réduit 8 €), mercredi exposition de photos avec visite (gratuit), vendredi concert de chorale (10 €), samedi lecture pour enfants (gratuit), dimanche visite du quartier (5 €).',
      image: { layout: 'table', icon: 'theater', title: 'Kulturwoche im Westviertel', subtitle: '12. bis 18. Mai',
        columns: ['Wann?', 'Was?', 'Wo?', 'Eintritt'],
        rows: [
          ['Mo 19:30', 'Theater: „Der vertauschte Koffer“', 'Kleine Bühne', '14 €, ermäßigt 8 €'],
          ['Mi 18:00', 'Fotoausstellung „Alte Bilder, neue Wege“ mit Führung', 'Stadtbibliothek', 'frei'],
          ['Fr 20:00', 'Konzert: Chor „Westwind“', 'Alte Markthalle', '10 €'],
          ['Sa 15:00', 'Lesung für Kinder ab 6 Jahren', 'Stadtbibliothek', 'frei'],
          ['So 11:00', 'Stadtführung „Das Viertel früher“', 'Marktbrunnen', '5 €'],
        ],
        rowIcons: ['drama', 'camera', 'music', 'book-open', 'map'] } },
    { key: 'b1-kultur-hoeren-ausstellung', kind: 'audio', title: 'À l’accueil de l’exposition',
      script: [
        { voice: 'frau3', name: 'Frau Weber', text: 'Guten Tag! Kann ich Ihnen helfen?' },
        { pause: 0.4 },
        { voice: 'frau2', name: 'Jasmin', text: 'Ja, gern. Wir möchten die Fotoausstellung sehen. Was kann man da genau sehen?' },
        { pause: 0.4 },
        { voice: 'frau3', name: 'Frau Weber', text: 'Die Ausstellung zeigt über hundert Fotos von Geschäften, Kinos und Werkstätten, die es früher hier im Viertel gab. Die ältesten Bilder sind fast hundert Jahre alt. Neben jedem Foto steht nur die Jahreszahl, deshalb bieten wir zwei Möglichkeiten an, mehr zu erfahren.' },
        { pause: 0.4 },
        { voice: 'frau2', name: 'Jasmin', text: 'Gibt es denn eine Führung?' },
        { pause: 0.4 },
        { voice: 'frau3', name: 'Frau Weber', text: 'Ja, jeden Samstag um elf Uhr. Die Führung macht eine ehemalige Buchhändlerin, die seit fünfzig Jahren im Viertel lebt. Sie kennt zu fast jedem Foto eine Geschichte. Es gibt aber nur zwölf Plätze, deshalb sollten Sie sich vorher anmelden.' },
        { pause: 0.4 },
        { voice: 'mann', name: 'Leon', text: 'Und wenn wir lieber allein durch die Ausstellung gehen möchten?' },
        { pause: 0.4 },
        { voice: 'frau3', name: 'Frau Weber', text: 'Dann können Sie unseren Audioguide benutzen. Sie bekommen ihn hier an der Information, er kostet zwei Euro, für Kinder ist er kostenlos. Zu jedem Foto gibt es eine kurze Erklärung von etwa einer Minute. Den Audioguide gibt es während der ganzen Öffnungszeit, donnerstags sogar bis zwanzig Uhr.' },
        { pause: 0.5 },
        { voice: 'frau2', name: 'Jasmin', text: 'Vielen Dank! Was meinst du, Leon?' },
        { pause: 0.4 },
        { voice: 'mann', name: 'Leon', text: 'Ich würde lieber zur Führung gehen. Meine Großmutter hat früher im alten Kino an der Ecke gearbeitet. Vielleicht weiß die Buchhändlerin etwas darüber. Solche Geschichten stehen auf keinem Schild.' },
        { pause: 0.4 },
        { voice: 'frau2', name: 'Jasmin', text: 'Das verstehe ich. Aber samstags muss ich arbeiten, und zwölf Plätze sind schnell weg. Ich nehme lieber den Audioguide. Dann kann ich am Donnerstag nach der Arbeit kommen und mir so viel Zeit nehmen, wie ich will.' },
        { pause: 0.4 },
        { voice: 'mann', name: 'Leon', text: 'Gut, dann machen wir es so: Ich melde mich für die Führung am Samstag an, und du kommst am Donnerstagabend. Danach erzählen wir uns, was wir gesehen haben.' },
        { pause: 0.4 },
        { voice: 'frau2', name: 'Jasmin', text: 'Gute Idee! Am Samstag wird es bestimmt voll sein. Ich werde dich am Sonntag anrufen, dann kannst du mir alles erzählen.' },
        { pause: 0.4 },
        { voice: 'mann', name: 'Leon', text: 'Und wenn die Führung gut ist, werde ich nächsten Monat mit meiner Großmutter noch einmal hingehen. Das wird ihr bestimmt gefallen.' },
        { pause: 0.4 },
        { voice: 'frau3', name: 'Frau Weber', text: 'Dann trage ich Sie gleich ein. Wie ist Ihr Name, bitte?' },
        { pause: 0.3 },
        { voice: 'mann', name: 'Leon', text: 'Leon Hartmann. Vielen Dank!' },
      ] },
    { key: 'b1-kultur-kontrolle-nachricht', kind: 'audio', title: 'Message vocal d’Ines sur la fête de la ville',
      script: [
        { voice: 'frau', name: 'Ines', text: 'Hallo Paula, hier ist Ines. Am Samstag ist doch das Stadtfest! Ich habe gerade das Programm gelesen. Um drei Uhr gibt es einen Umzug mit bunt geschmückten Wagen, und abends spielt eine junge Band aus der Region auf der großen Bühne am Markt.' },
        { pause: 0.4 },
        { voice: 'frau', name: 'Ines', text: 'Der Eintritt ist frei! Ich werde auf jeden Fall hingehen. Kommst du mit? Wir könnten uns um halb drei am Brunnen treffen. Ruf mich zurück!' },
      ] },
  ],
  activities: [
    { id: 'b1-kultur-einstieg', kind: 'lesson', title: 'Mise en route : sorties, fêtes et traditions', estimatedMinutes: 10,
      competences: ['lecture', 'expression-orale'],
      lesson: { description: `KULTUR FÜR ALLE
[fr] La culture pour tous

Theater, Konzerte, Ausstellungen, Volksfeste: In Deutschland gibt es fast jedes Wochenende eine Veranstaltung in der Nähe. [fr] Théâtre, concerts, expositions, fêtes populaires : en Allemagne, il y a presque chaque week-end un événement près de chez soi.

FRAGEN ZUM EINSTIEG
[fr] Questions pour commencer
• Wann waren Sie zum letzten Mal im Theater, im Kino oder in einer Ausstellung? [fr] Quand êtes-vous allé pour la dernière fois au théâtre, au cinéma ou dans une exposition ?
• Welches Fest feiern Sie am liebsten? Warum? [fr] Quelle fête préférez-vous célébrer ? Pourquoi ?
• Welche Veranstaltung würden Sie einem Freund empfehlen? [fr] Quel événement recommanderiez-vous à un ami ?

Antworten Sie laut und in ganzen Sätzen. [fr] Répondez à voix haute, par des phrases complètes.

DAS LERNEN SIE
[fr] Objectifs
• Ich kann ein Kulturprogramm verstehen. [fr] Je peux comprendre un programme culturel.
• Ich kann meine Meinung nuancieren: zwar …, aber … [fr] Je peux nuancer mon avis : certes …, mais …
• Ich kann eine Veranstaltung empfehlen und genau beschreiben. [fr] Je peux recommander un événement et le décrire avec précision.
• Ich kann über Feste und Traditionen sprechen. [fr] Je peux parler de fêtes et de traditions.

WICHTIGE WÖRTER
[fr] Mots-clés
• die Ausstellung — l’exposition
• die Aufführung — la représentation
• der Eintritt — l’entrée (le prix)
• ermäßigt — à tarif réduit
• die Veranstaltung — l’événement
• der Brauch — la coutume
• der Feiertag — le jour férié
• empfehlenswert — à recommander` } },

    { id: 'b1-kultur-lesen', kind: 'exercise', title: 'Comprendre : un programme et une critique de théâtre', estimatedMinutes: 20,
      competences: ['lecture'],
      lesson: { description: `${C.lesen}

STRATEGIE
[fr] Stratégie
Im Programm suchen Sie gezielt: Tag, Uhrzeit, Ort, Preis. Sie müssen nicht alles lesen. [fr] Dans un programme, cherchez de façon ciblée : jour, heure, lieu, prix. Inutile de tout lire.
In der Kritik achten Sie auf Wörter, die eine Meinung zeigen: leider, besonders, zwar … aber, trotzdem. [fr] Dans la critique, repérez les mots qui montrent une opinion : leider, besonders, zwar … aber, trotzdem.

PROGRAMM DER KULTURWOCHE (12. BIS 18. MAI)
[fr] Programme de la semaine culturelle
• Montag, 19:30 Uhr: Theater „Der vertauschte Koffer“, Kleine Bühne, 14 Euro, ermäßigt (Schüler und Studierende) 8 Euro
• Mittwoch, 18:00 Uhr: Fotoausstellung „Alte Bilder, neue Wege“ mit Führung, Stadtbibliothek, Eintritt frei
• Freitag, 20:00 Uhr: Konzert des Chors „Westwind“, Alte Markthalle, 10 Euro
• Samstag, 15:00 Uhr: Lesung für Kinder ab 6 Jahren, Stadtbibliothek, Eintritt frei
• Sonntag, 11:00 Uhr: Stadtführung „Das Viertel früher“, Treffpunkt am Marktbrunnen, 5 Euro

Theaterkritik: Ein Koffer voller Überraschungen

(1) Was passiert, wenn man am Bahnhof aus Versehen den falschen Koffer mitnimmt? Diese einfache Frage steht im Mittelpunkt der neuen Komödie „Der vertauschte Koffer“, die am Samstag auf der Kleinen Bühne Premiere hatte. Paul, ein schüchterner Lehrer aus der Provinz, findet in dem fremden Koffer nicht seine Hemden, sondern ein rotes Kleid, eine alte Landkarte und einen Brief ohne Absender. Neugierig macht er sich auf die Suche nach der Besitzerin und erlebt die verrücktesten drei Tage seines Lebens.

(2) Die junge Regisseurin Mira Lindner erzählt die Geschichte mit viel Tempo und mit großem Gespür für Humor. Das einfache Bühnenbild besteht nur aus ein paar Koffern, die immer wieder neue Orte zeigen: einen Bahnhof, ein Hotelzimmer, ein kleines Café am Meer. Das ist überraschend und sehr gelungen.

(3) Besonders überzeugend ist Jonas Kehl in der Rolle des Paul. Mit seinem leisen Humor bringt er das Publikum immer wieder zum Lachen. Seine Partnerin Ella Marten spielt die geheimnisvolle Besitzerin des Koffers zwar etwas zu laut, aber mit viel Energie.

(4) Leider hat das Stück auch Schwächen: Nach der Pause wird die Handlung langsamer, und manche Witze wiederholen sich. Auch das Ende ist ziemlich vorhersehbar. Trotzdem verbringt man zwei unterhaltsame Stunden. Die lachenden Zuschauer klatschten am Ende minutenlang.

(5) Unser Fazit: kein großes Kunstwerk, aber ein gelungener, empfehlenswerter Abend für alle, die gern lachen. Viele Zuschauer werden diesen Abend sicher nicht so schnell vergessen. Das Stück läuft noch bis Ende Juni. Für die Vorstellungen am Wochenende sollte man rechtzeitig Karten reservieren.` },
      placements: [{ media: 'b1-kultur-lesen-programm', caption: 'Kulturwoche im Westviertel' }],
      questions: [
        choice('q1', bi('Was für ein Text ist „Ein Koffer voller Überraschungen“?', 'Quel type de texte est « Ein Koffer voller Überraschungen » ?'), [
          ['Ein Interview mit einer Regisseurin.'],
          ['Eine Anzeige für einen Theaterkurs.'],
          ['Eine Kritik über ein Theaterstück.', true],
        ], 'Le texte résume l’histoire, juge la mise en scène et les acteurs, puis donne un « Fazit » (bilan) : c’est une critique. On ne voit ni questions ni réponses, comme dans une interview.'),
        choice('q2', bi('Wie findet der Autor das Stück insgesamt?', 'Que pense l’auteur de la pièce dans l’ensemble ?'), [
          ['Unterhaltsam, aber nicht perfekt.', true],
          ['Langweilig und viel zu lang.'],
          ['Ein großes Kunstwerk ohne Schwächen.'],
        ], 'Le bilan est nuancé : « kein großes Kunstwerk, aber ein gelungener, empfehlenswerter Abend ». Le paragraphe 4 cite des faiblesses (« Leider hat das Stück auch Schwächen »), mais l’ensemble reste divertissant.'),
        rf('q3', 'Paul findet in dem fremden Koffer seine eigenen Hemden.', 'f',
          'Faux : il trouve « nicht seine Hemden, sondern ein rotes Kleid, eine alte Landkarte und einen Brief ». « nicht …, sondern … » corrige une attente.'),
        rf('q4', 'Ella Marten spielt etwas zu laut.', 'r',
          'Vrai : elle joue « zwar etwas zu laut, aber mit viel Energie ». « zwar … aber » concède un défaut avant de souligner une qualité.'),
        rf('q5', 'Die Regisseurin hat früher selbst als Schauspielerin gearbeitet.', 'n',
          'Non mentionné : le texte dit seulement qu’elle est jeune et qu’elle a le sens de l’humour, rien sur son passé.'),
        choice('q6', bi('Programm: Wie viel bezahlen Studierende für das Theater am Montag?', 'Programme : combien paient les étudiants pour le théâtre de lundi ?'), [
          ['Vierzehn Euro.'],
          ['Acht Euro.', true],
          ['Nichts, der Eintritt ist frei.'],
        ], 'Le programme indique « 14 Euro, ermäßigt (Schüler und Studierende) 8 Euro » : le tarif réduit s’applique aux étudiants. L’entrée libre concerne l’exposition et la lecture pour enfants.'),
        match('q7', bi('Welche Veranstaltung passt zu welcher Person?', 'Quel événement convient à quelle personne ?'), [
          ['Lina ist sieben und möchte eine Geschichte hören.', 'Lesung am Samstag'],
          ['Herr Graf interessiert sich für Fotografie, hat aber wenig Geld.', 'Ausstellung am Mittwoch'],
          ['Frau Okoye singt selbst gern im Chor.', 'Konzert am Freitag'],
          ['Tom möchte am Sonntagvormittag zu Fuß durch das Viertel gehen.', 'Stadtführung am Sonntag'],
        ], 'Lecture pour enfants dès 6 ans → Lina ; exposition de photos gratuite → M. Graf ; concert de chorale → Mme Okoye ; visite à pied le dimanche à 11 h → Tom.'),
        fill('q8', bi('Ergänzen Sie mit Wörtern aus der Kritik.', 'Complétez avec des mots de la critique.'),
          'Das Stück ist eine [[1]]: Man lacht viel. Am Ende klatschten die [[2]] Zuschauer minutenlang. Für die Vorstellungen am Wochenende sollte man rechtzeitig [[3]] reservieren.',
          [['Komödie'], ['lachenden'], ['Karten', 'Tickets']],
          '« die Komödie » (paragraphe 1) ; « die lachenden Zuschauer » : participe I employé comme adjectif, avec la terminaison -en après « die » au pluriel ; « Karten reservieren » : réserver des billets.'),
      ] },

    { id: 'b1-kultur-hoeren', kind: 'exercise', title: 'Comprendre : visite guidée ou audioguide ?', estimatedMinutes: 18,
      competences: ['ecoute'],
      lesson: { description: `${C.hoeren}

STRATEGIE
[fr] Stratégie
Beim ersten Hören: Welche zwei Möglichkeiten gibt es? Wer wählt was? [fr] Première écoute : quelles sont les deux possibilités ? Qui choisit quoi ?
Beim zweiten Hören: Achten Sie auf Uhrzeiten, Zahlen und Preise. [fr] Deuxième écoute : soyez attentif aux heures, aux nombres et aux prix.

DIE SITUATION
[fr] La situation
Jasmin und Leon möchten die Fotoausstellung „Alte Bilder, neue Wege“ in der Stadtbibliothek besuchen. Sie fragen Frau Weber an der Information. [fr] Jasmin et Leon veulent visiter l’exposition de photos de la bibliothèque. Ils se renseignent auprès de Mme Weber, à l’accueil.` },
      placements: [{ media: 'b1-kultur-hoeren-ausstellung', transcriptVisibility: 'after_answer' }],
      questions: [
        fill('q1', C.notizen,
          'Führung: samstags um [[1]] Uhr · Plätze pro Führung: [[2]] · Audioguide: [[3]] Euro · donnerstags geöffnet bis [[4]] Uhr',
          [['11', 'elf'], ['12', 'zwölf'], ['2', 'zwei'], ['20', 'zwanzig']],
          'Frau Weber : la visite a lieu « jeden Samstag um elf Uhr », il y a « nur zwölf Plätze », l’audioguide « kostet zwei Euro » et la bibliothèque ouvre « donnerstags sogar bis zwanzig Uhr ».'),
        choice('q2', bi('Wer macht die Führung?', 'Qui fait la visite guidée ?'), [
          ['Leons Großmutter, die früher im Kino gearbeitet hat.'],
          ['Eine frühere Buchhändlerin aus dem Viertel.', true],
          ['Frau Weber, die an der Information arbeitet.'],
        ], '« Die Führung macht eine ehemalige Buchhändlerin, die seit fünfzig Jahren im Viertel lebt. » « ehemalig » = « früher » (ancien). La grand-mère de Leon a travaillé au cinéma, elle ne fait pas la visite.'),
        choice('q3', bi('Warum möchte Leon zur Führung gehen?', 'Pourquoi Leon veut-il suivre la visite guidée ?'), [
          ['Er hofft, etwas über das Kino seiner Großmutter zu erfahren.', true],
          ['Er findet den Audioguide mit zwei Euro zu teuer.'],
          ['Er kann am Donnerstagabend nicht in die Bibliothek kommen.'],
        ], 'Sa grand-mère a travaillé « im alten Kino an der Ecke » et il espère que la libraire en saura quelque chose : « Solche Geschichten stehen auf keinem Schild. » Il ne parle ni du prix ni de jeudi.'),
        choice('q4', bi('Warum nimmt Jasmin den Audioguide?', 'Pourquoi Jasmin prend-elle l’audioguide ?'), [
          ['Die Führung am Samstag ist schon ausverkauft.'],
          ['Sie findet Führungen mit vielen Leuten anstrengend.'],
          ['Sie arbeitet samstags und kann donnerstags länger kommen.', true],
        ], '« Samstags muss ich arbeiten » ; avec l’audioguide, elle peut venir jeudi après le travail, car la bibliothèque est ouverte jusqu’à 20 heures. La visite n’est pas complète, puisque Leon s’y inscrit encore, et Jasmin ne dit rien contre les visites en groupe.'),
        choice('q5', bi('Was plant Leon für nächsten Monat?', 'Que prévoit Leon pour le mois prochain ?'), [
          ['Einen Audioguide für seine Großmutter kaufen.'],
          ['Mit seiner Großmutter noch einmal hingehen.', true],
          ['Selbst eine Führung durch das Viertel machen.'],
        ], '« Wenn die Führung gut ist, werde ich nächsten Monat mit meiner Großmutter noch einmal hingehen. » Le Futur I (« werde … hingehen ») exprime ici un projet.'),
        choice('q6', bi('Was zeigt die Ausstellung?', 'Que montre l’exposition ?'), [
          ['Fotos von Geschäften, Kinos und Werkstätten von früher.', true],
          ['Bilder von jungen Künstlern, die im Viertel wohnen.'],
          ['Alte Kinoplakate aus der Sammlung von Leons Großmutter.'],
        ], 'Frau Weber : « über hundert Fotos von Geschäften, Kinos und Werkstätten, die es früher hier im Viertel gab ». Le cinéma n’est qu’un des lieux photographiés ; les affiches et les jeunes artistes ne sont pas mentionnés.'),
      ] },

    { id: 'b1-kultur-entdecken', kind: 'exercise', title: 'Découvrir : décrire avec précision et parler de l’avenir', estimatedMinutes: 10,
      competences: ['lecture'],
      lesson: { description: `${bi('Lesen Sie die Sätze aus der Kritik und aus dem Gespräch. Beantworten Sie dann die Fragen.', 'Lisez les phrases tirées de la critique et de la conversation, puis répondez aux questions.')}

Satz 1: Paul ist ein schüchterner Lehrer aus der Provinz.
Satz 2: Er findet ein rotes Kleid und einen Brief ohne Absender.
Satz 3: Die junge Regisseurin erzählt die Geschichte mit großem Gespür für Humor.
Satz 4: Die lachenden Zuschauer klatschten am Ende minutenlang.
Satz 5: Die neue Komödie heißt „Der vertauschte Koffer“.
Satz 6: Unser Fazit: ein gelungener, empfehlenswerter Abend.
Satz 7: Am Samstag wird es bestimmt voll sein.
Satz 8: Ich werde nächsten Monat mit meiner Großmutter noch einmal hingehen.

${bi('Achten Sie auf die Endungen der Adjektive und auf das Verb „werden“.', 'Observez les terminaisons des adjectifs et le verbe « werden ».')}` },
      questions: [
        choice('q1', bi('Sätze 1 und 2: „ein schüchterner Lehrer“, „ein rotes Kleid“: Warum -er und -es?', 'Phrases 1 et 2 : pourquoi -er et -es ?'), [
          ['Nach „ein“ endet ein Adjektiv immer auf -en, wie nach „den“.'],
          ['Das Adjektiv übernimmt immer die Endung des Nomens.'],
          ['„ein“ zeigt das Genus nicht, also zeigt es das Adjektiv.', true],
        ], '« ein » est identique au masculin et au neutre : c’est donc l’adjectif qui porte la marque du genre (der → -er, das → -es). Avec « der » ou « das », l’article montre déjà le genre et l’adjectif prend -e : der schüchterne Lehrer, das rote Kleid.'),
        choice('q2', bi('Satz 3: „mit großem Gespür“: Warum -em?', 'Phrase 3 : pourquoi -em ?'), [
          ['Ohne Artikel übernimmt das Adjektiv die Endung von „dem“.', true],
          ['Nach „mit“ und „bei“ endet jedes Adjektiv auf -en.'],
          ['„Gespür“ ist feminin, darum endet das Adjektiv auf -em.'],
        ], 'Sans article, l’adjectif prend la terminaison qu’aurait eue l’article : mit dem Gespür → mit großem Gespür (datif neutre). Avec un article, on aurait « mit dem großen Gespür ». « das Gespür » est neutre.'),
        match('q3', bi('Was bedeuten die Partizipien?', 'Que signifient ces participes ?'), [
          ['die lachenden Zuschauer', 'les spectateurs qui rient'],
          ['der vertauschte Koffer', 'la valise échangée par erreur'],
          ['ein gelungener Abend', 'une soirée réussie'],
        ], 'Le participe I (lachend) décrit une action en cours, au sens actif : les spectateurs rient. Le participe II (vertauscht, gelungen) décrit un résultat ou un sens passif : la valise a été échangée, la soirée a réussi. Tous deux se déclinent comme des adjectifs.'),
        choice('q4', bi('Sätze 7 und 8: Was drückt „werden“ + Infinitiv hier aus?', 'Phrases 7 et 8 : qu’exprime « werden » + infinitif ici ?'), [
          ['Etwas, was am Wochenende schon passiert ist.'],
          ['Eine Vermutung oder einen Plan für die Zukunft.', true],
          ['Einen höflichen Wunsch, wie „ich hätte gern“.'],
        ], 'C’est le Futur I : « werden » conjugué en 2e position, l’infinitif à la fin. Phrase 7 : une supposition (« bestimmt » = sûrement). Phrase 8 : un projet. Le souhait poli s’exprime au Konjunktiv II (ich würde gern …).'),
      ] },

    { id: 'b1-kultur-regel', kind: 'lesson', title: 'Retenir : déclinaison de l’adjectif, participes et Futur I', estimatedMinutes: 10,
      competences: ['lecture'],
      lesson: { description: `À RETENIR — 1. LA DÉCLINAISON DE L’ADJECTIF ÉPITHÈTE
Devant un nom, l’adjectif prend toujours une terminaison. Principe : la marque du genre et du cas (-r, -s, -m, -e…) apparaît une fois, sur l’article ou, si l’article ne la montre pas, sur l’adjectif.

APRÈS DER, DIE, DAS (ET DIESER, JEDER, WELCHER)
• nominatif : der neue Film, die neue Bühne, das neue Stück, die neuen Filme
• accusatif : den neuen Film, die neue Bühne, das neue Stück, die neuen Filme
• datif : dem neuen Film, der neuen Bühne, dem neuen Stück, den neuen Filmen
Seulement deux terminaisons : -e (nominatif singulier, accusatif féminin et neutre) et -en partout ailleurs.

APRÈS EIN, KEIN, MEIN (ET LES AUTRES POSSESSIFS)
• nominatif : ein neuer Film, eine neue Bühne, ein neues Stück, keine neuen Filme
• accusatif : einen neuen Film, eine neue Bühne, ein neues Stück, keine neuen Filme
• datif : einem neuen Film, einer neuen Bühne, einem neuen Stück, keinen neuen Filmen
Là où « ein » ne montre pas le genre (nominatif masculin, nominatif et accusatif neutres), l’adjectif prend -er ou -es.

SANS ARTICLE (L’ADJECTIF PREND LA TERMINAISON DE L’ARTICLE)
• nominatif : guter Kaffee, frische Luft, kaltes Wasser, warme Getränke
• accusatif : guten Kaffee, frische Luft, kaltes Wasser, warme Getränke
• datif : mit gutem Kaffee, mit frischer Luft, mit kaltem Wasser, mit warmen Getränken

À RETENIR — 2. LES PARTICIPES EMPLOYÉS COMME ADJECTIFS
• Participe I = infinitif + d : lachen → lachend. Sens actif, action en cours : die lachenden Zuschauer (qui rient).
• Participe II : vertauschen → vertauscht. Sens passif ou action terminée : der vertauschte Koffer (échangé par erreur), ein gelungener Abend (réussi).
• Ils se déclinent comme tous les adjectifs : die wartenden Gäste, mit frisch gebackenen Brezeln.

À RETENIR — 3. LE FUTUR I : WERDEN + INFINITIF
• ich werde, du wirst, er/sie wird, wir werden, ihr werdet, sie/Sie werden + infinitif à la fin
• projet ou promesse : Ich werde dich am Sonntag anrufen.
• prévision : Morgen wird es regnen.
• supposition sur le présent, souvent avec wohl, sicher, bestimmt : Sie wird wohl im Stau stehen.
• dans une subordonnée, werden va à la fin : Ich glaube, dass es voll sein wird.
• avec une indication de temps, le présent suffit souvent : Morgen gehe ich ins Theater.

ATTENTION
• Après le verbe (attribut), pas de terminaison : Der Film ist neu, mais der neue Film.
• « Ich werde kommen » = je viendrai ; « Ich will kommen » = je veux venir. Ne confondez pas werden et wollen.
• werden employé seul signifie « devenir » : Sie wird Schauspielerin.
• Le participe I garde -end- avant la terminaison : das lächelnde Gesicht.` } },

    { id: 'b1-kultur-grammatik', kind: 'exercise', title: 'S’entraîner : adjectifs, participes et Futur I', estimatedMinutes: 14,
      competences: ['lecture', 'expression-ecrite'],
      lesson: { description: bi('Bestimmen Sie zuerst: Gibt es einen Artikel? Welcher Fall? Ergänzen Sie dann die Endung.', 'Déterminez d’abord : y a-t-il un article ? Quel cas ? Puis complétez la terminaison.') },
      questions: [
        fill('q1', bi('Ergänzen Sie die Endung nach „der, die, das“.', 'Complétez la terminaison après « der, die, das ».'),
          'Hast du die [[1]] Ausstellung schon gesehen (neu)? Im [[2]] Saal hängen Fotos von früher (groß).',
          [['neue'], ['großen']],
          'Accusatif féminin après « die » : -e (die neue Ausstellung). Datif après « im » (= in dem) : toujours -en (im großen Saal).'),
        fill('q2', bi('Ergänzen Sie die Endung nach „ein“.', 'Complétez la terminaison après « ein ».'),
          'Gestern habe ich einen [[1]] Film gesehen (spannend), und meine Schwester war in einem [[2]] Konzert (klassisch).',
          [['spannenden'], ['klassischen']],
          'Accusatif masculin après « einen » : -en. Datif après « einem » : -en. Avec ein, seuls le nominatif masculin (-er) et le nominatif et l’accusatif neutres (-es) sont différents.'),
        fill('q3', bi('Ergänzen Sie die Endung ohne Artikel.', 'Complétez la terminaison sans article.'),
          'Bei [[1]] Wetter (schön) feiern wir draußen. Es gibt [[2]] Getränke (kalt) und [[3]] Kuchen (frisch).',
          [['schönem'], ['kalte'], ['frischen']],
          'Sans article, l’adjectif prend la marque de l’article : bei dem Wetter → bei schönem Wetter ; die Getränke → kalte Getränke ; den Kuchen (accusatif après « es gibt ») → frischen Kuchen.'),
        choice('q4', bi('Welche Form ist richtig? „Wir suchen ein … Restaurant in der Nähe.“ (gemütlich)', 'Quelle forme est juste ? (Nous cherchons un restaurant agréable à proximité.)'), [
          ['gemütliche'],
          ['gemütliches', true],
          ['gemütlichen'],
        ], '« das Restaurant » est neutre ; à l’accusatif, « ein » ne montre pas le genre : l’adjectif prend -es. Avec l’article défini, on dirait « das gemütliche Restaurant ».'),
        match('q5', bi('Was bedeutet dasselbe?', 'Qu’est-ce qui a le même sens ?'), [
          ['die lachenden Kinder', 'die Kinder, die lachen'],
          ['der geschmückte Baum', 'der Baum, den man geschmückt hat'],
          ['die empfohlene Ausstellung', 'die Ausstellung, die man empfohlen hat'],
          ['das spielende Orchester', 'das Orchester, das gerade spielt'],
        ], 'Le participe I (lachend, spielend) remplace une relative active au présent. Le participe II (geschmückt, empfohlen) remplace une relative passive ou au passé. Les participes rendent la phrase plus courte.'),
        fill('q6', bi('Bilden Sie das Partizip mit Endung.', 'Formez le participe avec sa terminaison.'),
          'Die Kinder singen. → die [[1]] Kinder · Man hat die Karten reserviert. → die [[2]] Karten',
          [['singenden'], ['reservierten']],
          'Participe I : singen + d → singend, puis -en (pluriel après « die »). Participe II : reserviert, puis -en : die reservierten Karten.'),
        order('q7', C.ordnen, [
          ['Ich', 'glaube,', 'dass', 'das Fest', 'sehr', 'voll', 'sein', 'wird.'],
        ], 'Dans une subordonnée en « dass », l’auxiliaire du futur « wird » va tout à la fin, après l’infinitif « sein ».'),
        choice('q8', bi('„Sie wird wohl im Stau stehen.“ Was bedeutet das?', 'Que signifie cette phrase ?'), [
          ['Sie will heute unbedingt im Stau stehen.'],
          ['Sie stand gestern auf dem Heimweg im Stau.'],
          ['Wahrscheinlich steht sie gerade im Stau.', true],
        ], 'Futur I avec « wohl » : une supposition sur le présent (elle doit être dans les bouchons). Ce n’est ni une volonté (wollen) ni un fait passé.'),
        fill('q9', bi('Ergänzen Sie „werden“ in der richtigen Form.', 'Complétez avec la bonne forme de « werden ».'),
          'Morgen [[1]] es regnen. Wir [[2]] das Fest deshalb in die Halle verlegen.',
          [['wird'], ['werden']],
          'Futur I : « werden » conjugué en 2e position (es wird, wir werden), infinitif à la fin (regnen, verlegen).'),
        choice('q10', bi('Welche Form ist richtig? „Mit den … Gästen haben wir bis Mitternacht gefeiert.“ (neu)', 'Quelle forme est juste ? (Nous avons fait la fête jusqu’à minuit avec les nouveaux invités.)'), [
          ['neue'],
          ['neuer'],
          ['neuen', true],
        ], 'Datif pluriel après « den » : -en (et -n aussi au nom : den Gästen). Au datif, l’adjectif précédé d’un article prend toujours -en.'),
      ] },

    { id: 'b1-kultur-wortschatz', kind: 'exercise', title: 'Mots et formules : sortir, recommander, nuancer', estimatedMinutes: 12,
      competences: ['lecture', 'expression-ecrite'],
      lesson: { description: `${bi('Lernen Sie die Wörter in festen Verbindungen.', 'Apprenez les mots dans leurs associations fixes.')}

REDEMITTEL
[fr] Formules utiles
• recommander : Das lohnt sich wirklich! / Geh unbedingt hin! / Das ist sehr empfehlenswert.
• nuancer : Das Stück war zwar etwas lang, aber … / Trotzdem hat es mir gefallen.
• se renseigner : Wissen Sie, wann die Führung anfängt? / Gibt es eine Ermäßigung?
• déconseiller poliment : Ich würde eher … empfehlen.` },
      questions: [
        match('q1', bi('Welches Verb passt zu welchem Nomen?', 'Quel verbe va avec quel nom ?'), [
          ['eine Ausstellung', 'besuchen'],
          ['Karten', 'reservieren'],
          ['ein Fest', 'feiern'],
          ['einen Brauch', 'pflegen'],
          ['sich ein Theaterstück', 'ansehen'],
        ], 'Associations courantes : eine Ausstellung besuchen, Karten reservieren, ein Fest feiern, einen Brauch pflegen (entretenir une coutume), sich ein Theaterstück ansehen (aller voir une pièce).'),
        fill('q2', bi('Ergänzen Sie das passende Adjektiv.', 'Complétez avec l’adjectif qui convient.'),
          'Studierende zahlen weniger: Für sie ist der Eintritt [[1]]. Alle Karten sind verkauft: Die Vorstellung ist [[2]]. Man muss nichts bezahlen: Der Eintritt ist [[3]].',
          [['ermäßigt'], ['ausverkauft'], ['frei', 'kostenlos']],
          '« ermäßigt » : à tarif réduit ; « ausverkauft » : complet ; « Eintritt frei » : entrée libre (« kostenlos » est aussi juste).'),
        fill('q3', bi('Bilden Sie Nomen mit -ung.', 'Formez des noms en -ung.'),
          'aufführen → die [[1]] · veranstalten → die [[2]] · empfehlen → die [[3]]',
          [['Aufführung'], ['Veranstaltung'], ['Empfehlung']],
          'Radical du verbe + -ung : un nom féminin. die Aufführung (la représentation), die Veranstaltung (l’événement), die Empfehlung (la recommandation).'),
        choice('q4', bi('Sie empfehlen einer Freundin eine Ausstellung. Was sagen Sie?', 'Vous recommandez une exposition à une amie. Que dites-vous ?'), [
          ['Die Ausstellung lohnt sich wirklich, geh unbedingt hin!', true],
          ['Die Ausstellung habe ich leider noch nicht gesehen.'],
          ['Ich gehe eigentlich nie in Ausstellungen, sie sind teuer.'],
        ], '« sich lohnen » (valoir la peine) et « geh unbedingt hin! » (vas-y absolument) forment une vraie recommandation. Les deux autres phrases ne recommandent rien.'),
        choice('q5', bi('Sie möchten Ihre Meinung nuancieren. Was passt?', 'Vous voulez nuancer votre avis. Quelle phrase convient ?'), [
          ['Das Stück war super, die Schauspieler waren einfach perfekt.'],
          ['Das Stück war zwar lang, aber die Schauspieler waren toll.', true],
          ['Das Stück war total schlecht und viel zu lang.'],
        ], '« zwar …, aber … » concède un défaut puis souligne une qualité : c’est un avis nuancé. Les deux autres phrases sont des jugements sans nuance.'),
        choice('q6', bi('Sie fragen höflich nach dem Programm. Was passt?', 'Vous vous renseignez poliment sur le programme. Quelle phrase convient ?'), [
          ['Wissen Sie, wann die Führung anfängt?', true],
          ['Die Führung hat schon angefangen.'],
          ['Wann haben Sie angefangen?'],
        ], 'Question indirecte polie : « Wissen Sie, wann … ? », avec le verbe « anfängt » à la fin. Les deux autres phrases ne demandent pas l’heure de la visite.'),
        fill('q7', bi('Ergänzen Sie.', 'Complétez.'),
          'Der 3. Oktober ist in Deutschland ein [[1]]: Viele Menschen haben frei. Einen Maibaum aufzustellen ist ein alter [[2]].',
          [['Feiertag'], ['Brauch']],
          '« der Feiertag » : jour férié (le 3 octobre, fête de l’Unité allemande). « der Brauch », pluriel « die Bräuche » : la coutume, synonyme de « die Tradition ».'),
      ] },

    { id: 'b1-kultur-redemittel', kind: 'exercise', title: 'Répéter à voix haute : recommander, nuancer, prévoir', estimatedMinutes: 9,
      competences: ['expression-orale'],
      lesson: { description: `${C.sprechen}

${bi('Achten Sie auf die Endungen der Adjektive: Sprechen Sie sie deutlich aus.', 'Soyez attentif aux terminaisons des adjectifs : prononcez-les distinctement.')}` },
      questions: [
        speak('q1', 'Die Ausstellung lohnt sich wirklich, geh unbedingt hin!',
          'Recommandation enthousiaste. Accentuez « wirklich » et « unbedingt ». « geh … hin » : impératif du verbe séparable hingehen.'),
        speak('q2', 'Das Stück war zwar etwas lang, aber sehr lustig.',
          'Avis nuancé avec « zwar … aber ». La voix monte sur « lang » et redescend sur « lustig ».'),
        speak('q3', 'Für Studierende ist der Eintritt ermäßigt.',
          '« ermäßigt » : accent sur la deuxième syllabe (erMÄßigt), le « ß » se prononce comme un « s » dur.'),
        speak('q4', 'Ich werde nächstes Jahr bestimmt wieder dabei sein.',
          'Futur I : « werde » en 2e position, « sein » à la fin. « dabei sein » : être de la partie.'),
        speak('q5', 'Bei schönem Wetter findet das Fest im Park statt.',
          'Adjectif sans article au datif : « bei schönem Wetter ». Faites bien entendre le -m final. « findet … statt » : verbe séparable.'),
        speak('q6', 'Kannst du mir einen guten Film empfehlen?',
          '« einen guten Film » : accusatif masculin après « einen », terminaison -en. La voix monte à la fin de la question.'),
      ] },

    { id: 'b1-kultur-lesen2', kind: 'exercise', title: 'Comprendre : un article sur une fête de village', estimatedMinutes: 15,
      competences: ['lecture', 'ecoute', 'expression-ecrite'],
      lesson: { description: `${C.lesen}

${bi('Die Fragen 5 und 6 sind Diktate: Hören Sie die Sätze und schreiben Sie sie.', 'Les questions 5 et 6 sont des dictées : écoutez les phrases et écrivez-les.')}

DORFLEBEN: EIN BAUM FÜR DAS GANZE DORF
[fr] La vie au village : un arbre pour tout le village

In vielen Orten in Bayern und Österreich, aber auch in anderen Regionen, gehört der Maibaum zum Frühling. Auch im kleinen Dorf Lindach wird jedes Jahr am 1. Mai ein neuer Maibaum aufgestellt.

Schon Wochen vorher suchen die Mitglieder des Heimatvereins im Wald einen langen, geraden Baum aus. Sie entfernen die Rinde und bemalen den Stamm in den Farben der Region, meistens weiß und blau. In der Nacht vor dem Fest bewachen junge Leute den geschmückten Baum. Warum? Nach einem alten Brauch versuchen junge Männer aus dem Nachbardorf, den Baum zu stehlen. Wenn sie es schaffen, muss das bestohlene Dorf ihn zurückkaufen, meistens mit Bier und einer deftigen Brotzeit.

Am 1. Mai um elf Uhr beginnt das eigentliche Fest. Mit Seilen, langen Holzstangen und viel Muskelkraft stellen etwa zwanzig Helfer den Baum auf, ganz ohne Kran. Das dauert oft zwei Stunden. Die wartenden Zuschauer feuern sie an, und die Blaskapelle spielt. Am Ende steht der über 25 Meter hohe Baum in der Mitte des Dorfplatzes. Danach wird gefeiert: Es gibt Musik und Tanz, frisch gebackene Brezeln und für die Kinder ein Puppentheater.

„Für uns ist der Maibaum nicht nur eine Tradition, sondern auch ein Zeichen, dass das Dorf zusammenhält“, sagt Klara Huber vom Heimatverein. Der Baum wird bis zum Herbst auf dem Platz stehen. Und auch nächstes Jahr wird Lindach wieder feiern, bei Sonne oder bei Regen.

KLEINES WÖRTERBUCH
[fr] Petit lexique
• der Maibaum — l’arbre de mai
• die Rinde — l’écorce
• bewachen — surveiller, garder
• die Brotzeit — le casse-croûte (sud de l’Allemagne)
• die Blaskapelle — la fanfare` },
      questions: [
        choice('q1', bi('Worum geht es in dem Artikel?', 'De quoi parle l’article ?'), [
          ['Um einen Streit zwischen zwei Dörfern über einen Wald.'],
          ['Um einen alten Brauch und ein Fest am 1. Mai in einem Dorf.', true],
          ['Um ein neues Fest, das es erst seit diesem Jahr gibt.'],
        ], 'L’article décrit la tradition de l’arbre de mai à Lindach : préparation, nuit de garde, fête du 1er mai. Le « vol » de l’arbre est un jeu traditionnel, pas une vraie dispute, et la fête a lieu « jedes Jahr ».'),
        rf('q2', 'Den Baum stellt man mit einem Kran auf.', 'f',
          'Faux : une vingtaine d’aides dressent l’arbre « mit Seilen, langen Holzstangen und viel Muskelkraft …, ganz ohne Kran ».'),
        rf('q3', 'Im Nachbardorf gibt es auch einen Maibaum.', 'n',
          'Non mentionné : on sait seulement que des jeunes du village voisin essaient de voler l’arbre de Lindach. Le texte ne dit pas si ce village a son propre arbre.'),
        choice('q4', bi('Warum bewachen junge Leute den Baum in der Nacht?', 'Pourquoi des jeunes gardent-ils l’arbre la nuit ?'), [
          ['Weil der Baum in der Nacht noch bemalt werden muss.'],
          ['Weil in der Nacht schon das große Fest beginnt.'],
          ['Weil junge Männer aus dem Nachbardorf ihn stehlen wollen.', true],
        ], '« Nach einem alten Brauch versuchen junge Männer aus dem Nachbardorf, den Baum zu stehlen. » Si le vol réussit, le village volé doit racheter son arbre avec de la bière et un casse-croûte.'),
        dictation('q5', 'Der geschmückte Baum bleibt bis zum Herbst auf dem Dorfplatz stehen.',
          '« der geschmückte Baum » : participe II employé comme adjectif, -e après « der ». « stehen bleiben » se sépare ici : bleibt … stehen.', 'mann2'),
        dictation('q6', 'Bei schönem Wetter tanzen die Leute bis spät in die Nacht.',
          '« bei schönem Wetter » : adjectif sans article au datif, terminaison -em. « in die Nacht » : accusatif de direction après « bis … in ».', 'frau3'),
      ] },

    { id: 'b1-kultur-kontrolle', kind: 'exercise', title: 'Vérifier : sorties, adjectifs, participes et futur', estimatedMinutes: 12,
      competences: ['lecture', 'ecoute'],
      lesson: { description: bi('Hören Sie die Nachricht von Ines für die Fragen 1 und 2. Lösen Sie dann die anderen Aufgaben.', 'Écoutez le message d’Ines pour les questions 1 et 2, puis faites les autres exercices.') },
      placements: [{ media: 'b1-kultur-kontrolle-nachricht', transcriptVisibility: 'after_answer' }],
      questions: [
        choice('q1', bi('Was gibt es am Samstag um drei Uhr?', 'Qu’y a-t-il samedi à trois heures ?'), [
          ['Einen Umzug mit geschmückten Wagen.', true],
          ['Ein Konzert auf der großen Bühne.'],
          ['Eine Führung durch die Altstadt.'],
        ], '« Um drei Uhr gibt es einen Umzug mit bunt geschmückten Wagen. » Le concert a lieu le soir (« abends »). Ici, « der Umzug » est un défilé, pas un déménagement.'),
        choice('q2', bi('Wo möchte Ines Paula treffen?', 'Où Ines veut-elle retrouver Paula ?'), [
          ['Vor der großen Bühne.'],
          ['Am Brunnen.', true],
          ['Bei Paula zu Hause.'],
        ], '« Wir könnten uns um halb drei am Brunnen treffen. » La scène est l’endroit du concert du soir.'),
        fill('q3', bi('Ergänzen Sie die Adjektivendung.', 'Complétez la terminaison de l’adjectif.'),
          'Wir haben einen [[1]] Abend erlebt (wunderbar), und die [[2]] Band hat toll gespielt (jung).',
          [['wunderbaren'], ['junge']],
          'Accusatif masculin après « einen » : -en (einen wunderbaren Abend). Nominatif féminin après « die » : -e (die junge Band).'),
        fill('q4', bi('Bilden Sie das Partizip I mit Endung.', 'Formez le participe I avec sa terminaison.'),
          'Die [[1]] Zuschauer (warten) wurden langsam ungeduldig.',
          [['wartenden']],
          'warten + d → wartend (participe I, action en cours), puis -en au pluriel après « die » : die wartenden Zuschauer (les spectateurs qui attendent).'),
        order('q5', C.ordnen, [
          ['Ich', 'glaube,', 'dass', 'es', 'am Samstag', 'regnen', 'wird.'],
        ], 'Subordonnée en « dass » : le pronom sujet « es » vient tout de suite après la conjonction, et l’auxiliaire du futur « wird » va à la fin, après l’infinitif « regnen ».'),
        choice('q6', bi('„Ich werde dich morgen anrufen.“ Was bedeutet das?', 'Que signifie cette phrase ?'), [
          ['Ich habe dich gestern angerufen.'],
          ['Ich will, dass du mich morgen am Vormittag anrufst.'],
          ['Ich verspreche, dass ich dich morgen anrufe.', true],
        ], 'Futur I à la 1re personne : une promesse ou un projet. Ce n’est ni un fait passé ni une demande adressée à l’autre.'),
        choice('q7', bi('Welche Form ist richtig? „Hier gibt es … Brezeln.“ (frisch)', 'Quelle forme est juste ? (Ici, il y a des bretzels frais.)'), [
          ['frische', true],
          ['frischen'],
          ['frischer'],
        ], 'Pluriel sans article, à l’accusatif (après « es gibt ») : -e, comme l’article « die ». On dirait « die frischen Brezeln » avec l’article.'),
        choice('q8', bi('Sie empfehlen ein Konzert. Was passt?', 'Vous recommandez un concert. Quelle phrase convient ?'), [
          ['Das Konzert war leider schon lange ausverkauft.'],
          ['Das Konzert ist sehr empfehlenswert und nicht teuer.', true],
          ['Ich weiß nicht genau, ob es am Samstag ein Konzert gibt.'],
        ], '« empfehlenswert » (qui mérite d’être recommandé) suivi d’un argument concret (le prix) : une bonne recommandation. Les autres phrases n’en sont pas.'),
      ] },
  ],
};
