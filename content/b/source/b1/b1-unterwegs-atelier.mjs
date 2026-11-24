// Module B1 n° 14 · atelier « Unterwegs » (lot R3). Prévenir un groupe et réorganiser un trajet : modèle de message de
// changement de programme, réactions en situation, médiation d'une information de la gare pour un groupe, erreurs typiques,
// entraînement au Hören (annonces et radio de circulation), puis deux missions notées sur grille.
// Reprise réécrite du brouillon B1 V1 : tâches « Prévenir un groupe et proposer le trajet de remplacement » et « Choisir un
// trajet à deux sous contrainte », leçon « coordination » (content/b1-v1/source/partie2.mjs › b1-unterwegs).
import { C, bi, choice, fill, order, match, speak, GRIDS } from '../../lib.mjs';

/** Grille B1 standard, libellé « tâche » précisé pour la mission. */
const grid = (base, task) => base.map((criterion) => (criterion.id === 'aufgabe' ? { ...criterion, label: task } : { ...criterion }));

export default {
  id: 'b1-unterwegs-atelier',
  title: 'Unterwegs, atelier : prévenir un groupe et réorganiser un trajet',
  objective: 'Relayer une information de la gare à un groupe, réagir à un imprévu, s’entraîner à comprendre des annonces et la radio, puis écrire un message de changement de programme et planifier un trajet à deux.',
  sources: [
    'Textes, annonces, messages et exercices originaux LinguaCap.',
    'Tâches reprises et réécrites du brouillon B1 V1 (LinguaCap) : prévenir un groupe, choisir un trajet à deux.',
  ],

  vocabulary: [
    { word: 'Planänderung', article: 'die', plural: 'Planänderungen', partOfSpeech: 'noun', translation: 'le changement de programme',
      example: 'Leider gibt es eine kleine Planänderung.', note: null },
    { word: 'Treffpunkt', article: 'der', plural: 'Treffpunkte', partOfSpeech: 'noun', translation: 'le point de rendez-vous',
      example: 'Unser Treffpunkt ist der Haupteingang.', note: null },
    { word: 'vorschlagen', partOfSpeech: 'verb', translation: 'proposer',
      example: 'Ich schlage vor, dass wir den früheren Zug nehmen.', note: 'séparable : vor|schlagen · schlägt vor, schlug vor, hat vorgeschlagen' },
    { word: 'Vorschlag', article: 'der', plural: 'Vorschläge', partOfSpeech: 'noun', translation: 'la proposition',
      example: 'Was haltet ihr von meinem Vorschlag?', note: null },
    { word: 'Was haltet ihr davon?', partOfSpeech: 'expression', translation: 'Qu’en pensez-vous ?',
      example: 'Ich schlage den Zug um acht vor. Was haltet ihr davon?', note: 'à une personne : Was hältst du davon? · poli : Was halten Sie davon?' },
    { word: 'Wie wäre es mit dem Bus?', partOfSpeech: 'expression', translation: 'Et si on prenait le bus ?',
      example: 'Wie wäre es mit dem Bus? Dann müssen wir nicht umsteigen.', note: 'Wie wäre es mit + datif ? / Wie wäre es, wenn …?' },
    { word: 'Bescheid geben', partOfSpeech: 'expression', translation: 'prévenir, donner une réponse',
      example: 'Gebt mir bitte bis Freitag Bescheid.', note: null },
    { word: 'sich melden', partOfSpeech: 'verb', translation: 'donner des nouvelles, se manifester',
      example: 'Ich melde mich, sobald ich im Zug sitze.', note: null },
    { word: 'einverstanden', partOfSpeech: 'adjective', translation: 'd’accord',
      example: 'Ich bin mit dem neuen Plan einverstanden.', note: 'mit + datif einverstanden sein' },
    { word: 'knapp', partOfSpeech: 'adjective', translation: 'juste, serré (temps)',
      example: 'Der Anschluss in Neudorf ist ziemlich knapp.', note: null },
    { word: 'Vorteil', article: 'der', plural: 'Vorteile', partOfSpeech: 'noun', translation: 'l’avantage',
      example: 'Der Vorteil ist, dass der Bus direkt vor der Halle hält.', note: null },
    { word: 'Nachteil', article: 'der', plural: 'Nachteile', partOfSpeech: 'noun', translation: 'l’inconvénient',
      example: 'Ein Nachteil ist, dass wir sehr früh aufstehen müssen.', note: null },
    { word: 'Fahrgemeinschaft', article: 'die', plural: 'Fahrgemeinschaften', partOfSpeech: 'noun', translation: 'le covoiturage',
      example: 'Wir könnten eine Fahrgemeinschaft bilden.', note: null },
    { word: 'auf jeden Fall', partOfSpeech: 'expression', translation: 'en tout cas, de toute façon',
      example: 'Auf jeden Fall nehmen wir eine Regenjacke mit.', note: null },
    { word: 'Plan B', article: 'der', plural: null, partOfSpeech: 'noun', translation: 'le plan B, la solution de repli',
      example: 'Falls der Zug ausfällt, haben wir einen Plan B.', note: null },
    { word: 'klappen', partOfSpeech: 'verb', translation: 'marcher, réussir (familier)',
      example: 'Hoffentlich klappt alles mit dem Anschluss.', note: 'Das klappt! : ça marche !' },
    { word: 'Kommt gut an!', partOfSpeech: 'expression', translation: 'Bon trajet ! (arrivez bien)',
      example: 'Bis Samstag, kommt gut an!', note: 'à une personne : Komm gut an!' },
  ],

  media: [
    { key: 'b1-unterwegs-atelier-modell-audio', kind: 'audio', title: 'Le message de Sara lu à voix haute',
      script: [
        { voice: 'frau2', name: 'Sara', text: 'Hallo zusammen, leider gibt es eine kleine Planänderung für unseren Ausflug am Samstag. Wegen Bauarbeiten fällt unser Zug um neun Uhr zwölf aus. Statt des Zuges fährt ein Ersatzbus, aber der braucht fast eine Stunde länger.' },
        { pause: 0.6 },
        { voice: 'frau2', name: 'Sara', text: 'Ich schlage deshalb vor, dass wir schon den Zug um acht Uhr fünf nehmen. Obwohl das ziemlich früh ist, sind wir dann um neun Uhr vierzig in Talheim und verpassen die Führung nicht. Unsere Gruppenkarte gilt auch für diesen Zug.' },
        { pause: 0.6 },
        { voice: 'frau2', name: 'Sara', text: 'Treffpunkt ist um sieben Uhr fünfzig am Haupteingang. Was haltet ihr davon? Gebt mir bitte bis Freitagabend Bescheid. Liebe Grüße, Sara.' },
      ] },

    { key: 'b1-unterwegs-atelier-interaktion-s1', kind: 'audio', title: 'Situation 1 : un ami appelle',
      script: [{ voice: 'mann2', name: 'Paul', text: 'Du, ich habe gerade gelesen, dass unser Zug morgen ausfällt. Was machen wir jetzt?' }] },
    { key: 'b1-unterwegs-atelier-interaktion-s2', kind: 'audio', title: 'Situation 2 : au contrôle',
      script: [{ voice: 'frau3', name: 'Zugbegleiterin', text: 'Ihre Fahrkarte gilt leider nicht für diesen Zug. Sie brauchen einen Zuschlag.' }] },
    { key: 'b1-unterwegs-atelier-interaktion-s3', kind: 'audio', title: 'Situation 3 : une amie préfère la voiture',
      script: [{ voice: 'frau2', name: 'Nora', text: 'Ich würde lieber mit dem Auto fahren. Dann sind wir flexibler.' }] },
    { key: 'b1-unterwegs-atelier-interaktion-s4', kind: 'audio', title: 'Situation 4 : un participant aura du retard',
      script: [{ voice: 'mann', name: 'Ben', text: 'Tut mir leid, ich schaffe es morgen nicht bis acht Uhr zum Bahnhof.' }] },

    { key: 'b1-unterwegs-atelier-mediation-chat', kind: 'image', title: 'Les questions du groupe',
      alt: 'Discussion de groupe « Deutschkurs B1 – Ausflug » : Jana demande si le rendez-vous reste à 9 h 45 devant la gare, Tom veut emporter son vélo, Ali demande s’il doit acheter un nouveau billet ; vous répondez que vous lisez l’information à la gare.',
      image: { layout: 'messages', icon: 'users', title: 'Deutschkurs B1 – Ausflug', subtitle: '4 Teilnehmende',
        messages: [
          { from: 'Jana', time: '8:52', text: 'Treffen wir uns am Samstag wie geplant um 9.45 Uhr vor dem Bahnhof?' },
          { from: 'Tom', time: '8:55', text: 'Ich bringe mein Fahrrad mit. Dann bin ich in Talheim schneller am See.' },
          { from: 'Ali', time: '8:57', text: 'Muss ich eine neue Fahrkarte kaufen?' },
          { from: 'Ich', time: '9:01', side: 'right', text: 'Moment, ich lese gerade die Information am Bahnhof …' },
        ] } },

    { key: 'b1-unterwegs-atelier-pruefung-t1', kind: 'audio', title: 'Texte 1 : annonce dans le train',
      script: [{ voice: 'sprecherin', text: 'Sehr geehrte Fahrgäste, in wenigen Minuten erreichen wir Neudorf. Wegen einer Störung an der Strecke kann dieser Zug heute leider nicht bis Talheim weiterfahren. Fahrgäste nach Talheim steigen bitte in Neudorf aus. Ein Bus nach Talheim wartet vor dem Bahnhof. Wir bitten um Ihr Verständnis.' }] },
    { key: 'b1-unterwegs-atelier-pruefung-t2', kind: 'audio', title: 'Texte 2 : radio, info circulation',
      script: [{ voice: 'sprecher', text: 'Und jetzt der Verkehr. Auf der Autobahn zwischen Lindenberg und Talheim gibt es nach einem Unfall fünf Kilometer Stau. Die rechte Spur ist gesperrt. Wer nach Talheim fahren möchte, verlässt die Autobahn am besten schon an der Ausfahrt Lindenberg-Süd und fährt über die Bundesstraße weiter.' }] },
    { key: 'b1-unterwegs-atelier-pruefung-t3', kind: 'audio', title: 'Texte 3 : message vocal d’une amie',
      script: [{ voice: 'frau2', name: 'Bea', text: 'Hallo Kim, hier ist Bea. Mein Flug aus Lissabon hat zwei Stunden Verspätung. Ich lande also erst um halb elf. Du musst mich nicht abholen, ich nehme dann einfach die S-Bahn. Aber kannst du bitte den Schlüssel bei deiner Nachbarin lassen? Danke dir, bis später!' }] },
    { key: 'b1-unterwegs-atelier-pruefung-t4', kind: 'audio', title: 'Texte 4 : annonce en gare',
      script: [{ voice: 'sprecherin', text: 'Eine Information für Reisende nach Bremen. Der Zug um elf Uhr vierzig fährt heute nicht von Gleis drei, sondern von Gleis acht ab. Bitte beachten Sie außerdem: Der Zug hat heute nur fünf Wagen. Er hält im vorderen Bereich des Bahnsteigs.' }] },
    { key: 'b1-unterwegs-atelier-pruefung-t5', kind: 'audio', title: 'Texte 5 : radio, fin de la grève',
      script: [{ voice: 'mann3', text: 'Gute Nachrichten für alle, die morgen früh zur Arbeit müssen: Der Streik bei den Verkehrsbetrieben der Stadt ist vorbei. Ab morgen fahren Busse und Straßenbahnen wieder nach dem normalen Fahrplan. Nur die Linie vier fährt wegen einer Baustelle noch bis Freitag eine Umleitung.' }] },
    { key: 'b1-unterwegs-atelier-pruefung-t6', kind: 'audio', title: 'Texte 6 : répondeur d’un loueur de vélos',
      script: [{ voice: 'mann2', text: 'Guten Tag, hier ist der Fahrradverleih am Hauptbahnhof. Sie haben für Samstag zwei Räder reserviert. Leider ist eines der Räder kaputt. Wir können Ihnen stattdessen ein E-Bike geben, ohne Aufpreis. Bitte rufen Sie uns kurz zurück und sagen Sie, ob das für Sie in Ordnung ist.' }] },

    { key: 'b1-unterwegs-atelier-sprechen-tarek', kind: 'audio', title: 'Le message vocal de Tarek : trois propositions',
      script: [
        { voice: 'mann2', name: 'Tarek', text: 'Hi, hier ist Tarek! Also, für unseren Ausflug zum Seefest am Sonntag habe ich mir drei Möglichkeiten überlegt.' },
        { pause: 0.5 },
        { voice: 'mann2', name: 'Tarek', text: 'Erstens: Wir fahren mit dem Auto von meinem Bruder. Das kostet uns nur das Benzin, aber am Sonntag gibt es auf der Autobahn bestimmt viel Stau.' },
        { pause: 0.5 },
        { voice: 'mann2', name: 'Tarek', text: 'Zweitens: Wir nehmen den Zug um neun Uhr. Der braucht nur eine Stunde, aber wir müssen einmal umsteigen, und der Anschluss ist ziemlich knapp, nur vier Minuten.' },
        { pause: 0.5 },
        { voice: 'mann2', name: 'Tarek', text: 'Drittens: Wir fahren mit dem Fahrrad. Das sind ungefähr vierzig Kilometer, und am Nachmittag soll es regnen.' },
        { pause: 0.5 },
        { voice: 'mann2', name: 'Tarek', text: 'Was meinst du? Was ist dir wichtig? Und wann und wo treffen wir uns? Sag mir bitte Bescheid!' },
      ] },
  ],

  activities: [
    // 1 · Modèle de production
    { id: 'b1-unterwegs-atelier-modell', kind: 'lesson', title: 'Modèle : un message de changement de programme', estimatedMinutes: 12,
      competences: ['lecture', 'ecoute'],
      lesson: { description: `${bi('Lesen und hören Sie die Nachricht. Achten Sie auf den Aufbau und auf die markierten Wendungen.', 'Lisez et écoutez le message. Observez sa structure et les tournures relevées.')}

SITUATION
[fr] Situation
${bi('Sara organisiert einen Ausflug für ihren Deutschkurs. Am Morgen liest sie, dass der Zug ausfällt, und schreibt der Gruppe.', 'Sara organise une sortie pour son cours d’allemand. Le matin, elle apprend que le train est supprimé et écrit au groupe.')}

Hallo zusammen,
leider gibt es eine kleine Planänderung für unseren Ausflug am Samstag. Wegen Bauarbeiten fällt unser Zug um 9.12 Uhr aus. Statt des Zuges fährt ein Ersatzbus, aber der braucht fast eine Stunde länger.
Ich schlage deshalb vor, dass wir schon den Zug um 8.05 Uhr nehmen. Obwohl das ziemlich früh ist, sind wir dann um 9.40 Uhr in Talheim und verpassen die Führung nicht. Unsere Gruppenkarte gilt auch für diesen Zug.
Treffpunkt ist um 7.50 Uhr am Haupteingang. Was haltet ihr davon? Gebt mir bitte bis Freitagabend Bescheid.
Liebe Grüße
Sara

AUFBAU
[fr] Structure
1. ${bi('Anrede und Anlass: „Hallo zusammen, leider gibt es eine kleine Planänderung …“', 'Salutation et raison du message.')}
2. ${bi('Problem und Grund: „Wegen Bauarbeiten fällt unser Zug … aus.“', 'Le problème et sa cause (wegen + génitif).')}
3. ${bi('Vorschlag mit Begründung: „Ich schlage deshalb vor, dass … Obwohl das ziemlich früh ist, …“', 'La proposition et sa justification, avec la concession.')}
4. ${bi('Praktische Informationen: Treffpunkt, Uhrzeit, Fahrkarte.', 'Les informations pratiques : lieu, heure, billet.')}
5. ${bi('Bitte um Antwort und Gruß: „Was haltet ihr davon? Gebt mir bitte … Bescheid.“', 'Demande de réponse et formule finale.')}

EINLEITEN
[fr] Introduire
• Leider gibt es eine Planänderung. — Malheureusement, le programme change.
• Ich muss euch leider mitteilen, dass … — Je dois malheureusement vous informer que…

BEGRÜNDEN
[fr] Expliquer, justifier
• Wegen Bauarbeiten fällt der Zug aus. — Le train est supprimé à cause de travaux.
• Obwohl das früh ist, … — Même si c’est tôt, …
• Der Vorteil ist, dass … — L’avantage, c’est que…

VORSCHLAGEN
[fr] Proposer
• Ich schlage vor, dass wir … — Je propose que nous…
• Wie wäre es, wenn wir …? — Et si nous…?
• Statt des Zuges könnten wir … — Au lieu du train, nous pourrions…

SCHLUSS
[fr] Conclure
• Was haltet ihr davon? — Qu’en pensez-vous ?
• Gebt mir bitte bis … Bescheid. — Donnez-moi une réponse d’ici…
• Liebe Grüße / Viele Grüße — Amitiés / Bien à vous (informel)

ATTENTION
• À un groupe que l’on tutoie : ihr, euch, euer (et non du ou Sie). Gebt mir Bescheid, ich schreibe euch.
• Un message de changement doit pouvoir être compris par quelqu’un qui n’a rien lu avant : heure, lieu et action à faire, sans ambiguïté.` },
      placements: [{ media: 'b1-unterwegs-atelier-modell-audio', transcriptVisibility: 'on_demand' }] },

    // 2 · Réagir en situation
    { id: 'b1-unterwegs-atelier-interaktion', kind: 'exercise', title: 'Réagir : imprévus en route', estimatedMinutes: 10,
      competences: ['ecoute', 'expression-orale'],
      lesson: { description: `${bi('Hören Sie vier kurze Situationen. Wählen Sie jeweils die passende Reaktion.', 'Écoutez quatre courtes situations. Choisissez chaque fois la réplique qui convient.')}
${bi('Danach sprechen Sie drei nützliche Sätze nach.', 'Ensuite, répétez trois phrases utiles.')}

STRATEGIE
[fr] Stratégie
${bi('Eine gute Reaktion antwortet auf die Situation und bringt das Gespräch weiter: eine Lösung, eine Frage, ein Vorschlag.', 'Une bonne réplique répond à la situation et fait avancer l’échange : une solution, une question, une proposition.')}` },
      placements: [
        { media: 'b1-unterwegs-atelier-interaktion-s1', questionId: 'q1', transcriptVisibility: 'after_answer' },
        { media: 'b1-unterwegs-atelier-interaktion-s2', questionId: 'q2', transcriptVisibility: 'after_answer' },
        { media: 'b1-unterwegs-atelier-interaktion-s3', questionId: 'q3', transcriptVisibility: 'after_answer' },
        { media: 'b1-unterwegs-atelier-interaktion-s4', questionId: 'q4', transcriptVisibility: 'after_answer' },
      ],
      questions: [
        choice('q1', bi('Situation 1: Ein Freund ruft an. Was antworten Sie?', 'Situation 1 : un ami vous appelle. Que répondez-vous ?'),
          [['Ja, ich habe den Zug gestern auch genommen. Er war sehr voll.'], ['Kein Problem, dann nehmen wir den Ersatzbus um halb zehn.', true],
            ['Super, dann treffen wir uns wie geplant um neun am Gleis.']],
          'Paul annonce un problème et demande « Was machen wir jetzt? » : il attend une solution. La bonne réplique en propose une, avec une heure. La première parle d’autre chose ; la troisième ignore que le train est supprimé.'),
        choice('q2', bi('Situation 2: Die Zugbegleiterin kontrolliert Ihre Fahrkarte. Was antworten Sie?', 'Situation 2 : la contrôleuse vérifie votre billet. Que répondez-vous ?'),
          [['Ach so. Könnten Sie mir sagen, wie viel der Zuschlag kostet?', true], ['Gern geschehen! Und wann kommen wir in Talheim an?'],
            ['Das macht nichts, dann fahre ich eben ohne Fahrkarte weiter.']],
          'Le billet ne suffit pas : il faut un supplément (der Zuschlag). On demande poliment le prix, avec une question indirecte. « Gern geschehen » répond à un merci, et continuer sans billet n’est pas une solution.'),
        choice('q3', bi('Situation 3: Eine Freundin möchte lieber mit dem Auto fahren. Was antworten Sie?', 'Situation 3 : une amie préfère prendre la voiture. Que répondez-vous ?'),
          [['Ja, weil es am Samstag viel Stau gibt. Nehmen wir also das Auto!'], ['Stimmt, und am Samstag fahren keine Züge. Nehmen wir trotzdem den Zug?'],
            ['Stimmt, aber am Samstag gibt es viel Stau. Wie wäre es mit dem Zug?', true]],
          'On reconnaît d’abord l’argument de l’autre (« Stimmt »), puis on nuance (« aber … ») et on propose autre chose. Les deux autres répliques sont illogiques : les bouchons ne sont pas une raison de prendre la voiture, et on ne propose pas un train qui ne circule pas.'),
        choice('q4', bi('Situation 4: Ein Kursteilnehmer hat ein Problem. Was antworten Sie?', 'Situation 4 : un participant a un problème. Que répondez-vous ?'),
          [['Schade! Wollen wir uns dann direkt in Talheim treffen?', true], ['Super, dann treffen wir uns wie geplant um acht am Bahnhof!'],
            ['Gut, dass du so früh kommst! Dann warten wir nicht so lange.']],
          'Ben ne peut pas être à la gare à 8 h. La bonne réplique exprime un regret et propose une solution (se retrouver directement à Talheim). Les deux autres montrent qu’on n’a pas compris : il ne viendra justement pas à 8 h.'),
        speak('q5', 'Wie wäre es, wenn wir den früheren Zug nehmen?',
          'Proposition polie au Konjunktiv II. « wäre » avec un « ä » long ; « früheren » : « ü » long, lèvres arrondies. Le verbe « nehmen » va à la fin après wenn.'),
        speak('q6', 'Leider gibt es eine kleine Planänderung für Samstag.',
          'Formule d’ouverture d’un message de changement. Planänderung : accent sur « PLAN », « ä » ouvert dans « än ». Samstag : accent sur « SAM ».'),
        speak('q7', 'Obwohl es früh ist, finde ich den Vorschlag gut.',
          'Petite pause à la virgule, puis inversion « finde ich ». Vorschlag : accent sur « VOR », « sch » comme dans « chat ».'),
      ] },

    // 3 · Médiation : relayer une information de la gare au groupe
    { id: 'b1-unterwegs-atelier-mediation', kind: 'exercise', title: 'Médiation : relayer une information de la gare', estimatedMinutes: 15,
      competences: ['lecture', 'expression-ecrite'],
      lesson: { description: `SITUATION
[fr] Situation
${bi('Sie machen am Samstag mit Ihrem Deutschkurs einen Ausflug von Neudorf nach Talheim. Geplant war der Zug um 10.00 Uhr. Am Bahnhof lesen Sie diese Information.', 'Samedi, vous faites une sortie avec votre cours d’allemand, de Neudorf à Talheim. Le train de 10 h était prévu. À la gare, vous lisez cette information.')}
${bi('In der Gruppe stellen die anderen Fragen. Geben Sie nur die Informationen weiter, die für die Gruppe wichtig sind, und zwar mit einfachen Worten.', 'Dans le groupe, les autres posent des questions. Ne transmettez que les informations utiles au groupe, avec des mots simples.')}

FAHRGASTINFORMATION
Bauarbeiten zwischen Neudorf und Talheim
Von Freitag, 22 Uhr, bis Montag, 5 Uhr, werden zwischen Neudorf und Talheim Gleise erneuert. Während der Bauarbeiten fallen alle Regionalzüge auf diesem Abschnitt aus. Statt der Züge fahren Busse. Die Busse fahren in Neudorf am Busbahnhof (Ausgang Süd) ab, nicht auf dem Bahnhofsvorplatz. Sie fahren zehn Minuten früher als die Züge, also zum Beispiel um 9.50 Uhr statt um 10.00 Uhr. Die Fahrzeit verlängert sich um etwa 30 Minuten. Die Mitnahme von Fahrrädern ist in den Bussen leider nicht möglich. Alle Fahrkarten gelten auch in den Ersatzbussen. Fahrgäste mit Rollstuhl melden sich bitte mindestens einen Tag vorher beim Mobilitätsservice am Bahnhof.

NACHRICHTEN IN DER GRUPPE
Jana (8:52): Treffen wir uns am Samstag wie geplant um 9.45 Uhr vor dem Bahnhof?
Tom (8:55): Ich bringe mein Fahrrad mit. Dann bin ich in Talheim schneller am See.
Ali (8:57): Muss ich eine neue Fahrkarte kaufen?
Ich (9:01): Moment, ich lese gerade die Information am Bahnhof …

STRATEGIE
[fr] Stratégie
${bi('Fragen Sie sich: Was ändert sich für die Gruppe? Was muss jede Person jetzt tun? Was ist für uns nicht wichtig?', 'Demandez-vous : qu’est-ce qui change pour le groupe ? que doit faire chacun ? qu’est-ce qui ne nous concerne pas ?')}` },
      placements: [{ media: 'b1-unterwegs-atelier-mediation-chat', caption: 'Gruppe „Deutschkurs B1 – Ausflug“' }],
      questions: [
        fill('q1', bi('Notieren Sie die wichtigsten Informationen für die Gruppe.', 'Notez les informations essentielles pour le groupe.'),
          'Am Samstag fährt kein Zug, sondern ein [[1]]. Abfahrt in Neudorf: am Busbahnhof, Ausgang [[2]]. Abfahrtszeit: [[3]]. Wir sind etwa [[4]] Minuten später in Talheim.',
          [['Bus', 'Ersatzbus'], ['Süd'], ['9.50 Uhr', '9:50 Uhr', '9.50', '9:50', 'neun Uhr fünfzig', 'zehn vor zehn'], ['30', 'dreißig']],
          'Le texte officiel dit « Statt der Züge fahren Busse », départ « am Busbahnhof (Ausgang Süd) », dix minutes plus tôt que le train de 10 h, donc à 9 h 50, et « Die Fahrzeit verlängert sich um etwa 30 Minuten ».'),
        choice('q2', bi('Was ist für Tom wichtig?', 'Qu’est-ce qui est important pour Tom ?'),
          [['Er braucht eine neue Fahrkarte.'], ['Er kann sein Fahrrad im Bus nicht mitnehmen.', true], ['Er muss sich beim Mobilitätsservice melden.']],
          'Tom veut emporter son vélo : « Die Mitnahme von Fahrrädern ist in den Bussen leider nicht möglich ». Le service de mobilité concerne les voyageurs en fauteuil roulant, pas lui.'),
        choice('q3', bi('Ali fragt nach der Fahrkarte. Was antworten Sie ihm?', 'Ali pose une question sur le billet. Que lui répondez-vous ?'),
          [['Ja, du musst im Bus eine neue Fahrkarte kaufen.'], ['Das steht nicht in der Information.'],
            ['Nein, deine Fahrkarte gilt auch im Ersatzbus.', true]],
          '« Alle Fahrkarten gelten auch in den Ersatzbussen » : l’information y est bien, et la réponse est non. On tutoie Ali, comme dans le groupe (deine Fahrkarte).'),
        choice('q4', bi('Jana fragt nach dem Treffpunkt. Was schlagen Sie vor?', 'Jana demande où se retrouver. Que proposez-vous ?'),
          [['um 9.40 Uhr am Busbahnhof, Ausgang Süd', true], ['wie geplant um 9.45 Uhr vor dem Bahnhof'], ['um 10.00 Uhr am Gleis']],
          'Le bus part à 9 h 50 de la gare routière, sortie sud, « nicht auf dem Bahnhofsvorplatz ». Le rendez-vous prévu (9 h 45 devant la gare) n’est plus possible ; à 10 h, le bus est parti et aucun train ne circule.'),
        order('q5', bi('Sagen Sie es einfacher: „Die Mitnahme von Fahrrädern ist in den Bussen leider nicht möglich.“ Bilden Sie den Satz.', 'Dites-le plus simplement : remettez la phrase dans l’ordre.'),
          [['Wir', 'können', 'im Bus', 'leider', 'keine Fahrräder', 'mitnehmen.'], ['Wir', 'können', 'leider', 'im Bus', 'keine Fahrräder', 'mitnehmen.']],
          'Simplifier, c’est remplacer un nom abstrait (die Mitnahme) par un verbe (mitnehmen) et parler à « wir ». Le verbe de modalité « können » est en 2e position, l’infinitif « mitnehmen » à la fin ; « leider » peut se placer avant ou après « im Bus ».'),
        fill('q6', bi('Ergänzen Sie die Nachricht an die Gruppe.', 'Complétez le message au groupe.'),
          '[[1]] der Bauarbeiten fährt am Samstag kein Zug nach Talheim. [[2]] des Zuges nehmen wir den Bus.',
          [['Wegen', 'Während', 'Aufgrund'], ['Statt', 'Anstatt']],
          'Wegen (à cause de) donne la cause ; während (pendant) convient aussi, car les travaux durent tout le week-end. Statt ou anstatt (au lieu de) annonce le remplacement. Les trois prépositions sont suivies du génitif : der Bauarbeiten, des Zuges.'),
      ] },

    // 4 · Erreurs typiques
    { id: 'b1-unterwegs-atelier-korrektur', kind: 'exercise', title: 'Corriger : erreurs typiques des francophones', estimatedMinutes: 10,
      competences: ['lecture', 'expression-ecrite'],
      lesson: { description: `${bi('Diese Fehler machen viele Französischsprachige. Finden Sie die richtige Form.', 'Beaucoup de francophones font ces erreurs. Trouvez la forme correcte.')}
${bi('Achten Sie auf die Position des Verbs, auf die Präpositionen und auf „falsche Freunde“.', 'Faites attention à la place du verbe, aux prépositions et aux « faux amis ».')}` },
      questions: [
        order('q1', bi('Viele schreiben: „Ich komme mit, obwohl ich bin müde.“ Bilden Sie den Satz richtig.', 'Beaucoup écrivent cette phrase fautive. Remettez-la dans le bon ordre.'),
          [['Ich', 'komme', 'mit,', 'obwohl', 'ich', 'müde', 'bin.']],
          'Après obwohl, le verbe conjugué va à la fin : « obwohl ich müde bin ». Le français garde l’ordre « je suis fatigué » ; l’allemand, non. Pas d’inversion non plus juste après obwohl (*obwohl bin ich*).'),
        order('q2', bi('Es regnet. Viele schreiben dann: „Trotzdem wir gehen zu Fuß.“ Bilden Sie den Satz richtig.', 'Il pleut. Beaucoup écrivent ensuite cette phrase fautive. Remettez-la dans le bon ordre.'),
          [['Trotzdem', 'gehen', 'wir', 'zu Fuß', 'zum Bahnhof.']],
          'Trotzdem compte comme premier élément de la phrase : le verbe suit immédiatement, puis le sujet (« Trotzdem gehen wir »). « Trotzdem dass » n’existe pas ; pour une subordonnée, on emploie obwohl.'),
        fill('q3', bi('Ergänzen Sie trotz, trotzdem oder obwohl.', 'Complétez avec trotz, trotzdem ou obwohl.'),
          '[[1]] des Streiks fahren einige Busse.',
          [['Trotz']],
          '« Malgré » + nom : la préposition trotz (+ génitif : des Streiks). Obwohl introduit une subordonnée avec un verbe, trotzdem un nouvel énoncé : ni l’un ni l’autre ne se place devant un nom.'),
        choice('q4', bi('Sie haben Ihren Zug nicht mehr erreicht. Was sagen Sie?', 'Vous n’avez pas eu votre train à temps. Que dites-vous ?'),
          [['Ich habe meinen Zug vermisst.'], ['Ich habe meinen Zug verloren.'], ['Ich habe meinen Zug verpasst.', true]],
          '« Rater » un train, un rendez-vous : verpassen. Vermissen veut dire « regretter l’absence de quelqu’un » (Ich vermisse dich : tu me manques), et verlieren « perdre un objet ».'),
        choice('q5', bi('Sie fahren mit dem Zug nach Talheim. Welcher Satz ist richtig?', 'Vous allez à Talheim en train. Quelle phrase est correcte ?'),
          [['Ich fahre mit dem Zug nach Talheim.', true], ['Ich gehe mit dem Zug nach Talheim.'], ['Ich fahre im Zug zu Talheim.']],
          'Gehen, c’est aller à pied ; avec un véhicule, on emploie fahren. « En train » se dit « mit dem Zug », et devant un nom de ville on emploie nach (zu sert pour une personne ou un lieu précis : zum Bahnhof).'),
        fill('q6', bi('Ergänzen Sie die richtige Form.', 'Complétez avec la forme correcte.'),
          'Wir [[1]] schon seit zwanzig Minuten auf den Bus (warten). Wegen [[2]] Verspätung verpassen wir bestimmt den Anschluss.',
          [['warten'], ['der']],
          'Avec seit, une action qui dure encore se met au présent, comme « depuis » en français : « Wir warten seit zwanzig Minuten » (et non « haben gewartet »). Wegen + génitif : die Verspätung devient der Verspätung.'),
      ] },

    // 5 · Entraînement au format : Hören (annonces et radio)
    { id: 'b1-unterwegs-atelier-pruefung', kind: 'exercise', title: 'Entraînement à l’examen : Hören, annonces et radio', estimatedMinutes: 20,
      competences: ['ecoute'],
      lesson: { description: `PRÜFUNGSTRAINING: HÖREN
[fr] Entraînement à l’examen : compréhension orale
${bi('Sie hören sechs kurze Texte: Durchsagen, Radio und Nachrichten auf dem Anrufbeantworter. Zu jedem Text gibt es eine Aufgabe. Wählen Sie a, b oder c.', 'Vous entendez six textes courts : annonces, radio et messages sur répondeur. Chaque texte a une question. Choisissez a, b ou c.')}
${bi('Zeit: etwa 15 Minuten. In der Prüfung hören Sie jeden Text zweimal. Hören Sie hier auch jeden Text höchstens zweimal.', 'Durée : environ 15 minutes. À l’examen, chaque texte passe deux fois. Ici aussi, écoutez chaque texte deux fois au plus.')}

STRATEGIE
[fr] Stratégie
1. ${bi('Lesen Sie vor dem Hören die Aufgabe und die drei Antworten. Unterstreichen Sie im Kopf die Schlüsselwörter.', 'Avant l’écoute, lisez la question et les trois réponses. Repérez mentalement les mots-clés.')}
2. ${bi('Oft hören Sie alle drei Antworten im Text. Nur eine passt genau zur Frage.', 'Souvent, les trois réponses sont citées dans le texte. Une seule correspond exactement à la question.')}
3. ${bi('Achten Sie auf Wörter wie nicht, sondern, nur, stattdessen: Sie ändern die Information.', 'Attention aux mots comme nicht, sondern, nur, stattdessen : ils changent l’information.')}` },
      placements: [
        { media: 'b1-unterwegs-atelier-pruefung-t1', questionId: 'q1', transcriptVisibility: 'after_answer' },
        { media: 'b1-unterwegs-atelier-pruefung-t2', questionId: 'q2', transcriptVisibility: 'after_answer' },
        { media: 'b1-unterwegs-atelier-pruefung-t3', questionId: 'q3', transcriptVisibility: 'after_answer' },
        { media: 'b1-unterwegs-atelier-pruefung-t4', questionId: 'q4', transcriptVisibility: 'after_answer' },
        { media: 'b1-unterwegs-atelier-pruefung-t5', questionId: 'q5', transcriptVisibility: 'after_answer' },
        { media: 'b1-unterwegs-atelier-pruefung-t6', questionId: 'q6', transcriptVisibility: 'after_answer' },
      ],
      questions: [
        choice('q1', bi('Text 1: Was sollen die Fahrgäste nach Talheim tun?', 'Texte 1 : que doivent faire les voyageurs pour Talheim ?'),
          [['im Zug bleiben und warten'], ['in Neudorf aussteigen und den Bus nehmen', true], ['in Neudorf auf den nächsten Zug warten']],
          '« Fahrgäste nach Talheim steigen bitte in Neudorf aus. Ein Bus nach Talheim wartet vor dem Bahnhof. » Le train ne va pas plus loin (« kann … nicht bis Talheim weiterfahren ») : rester à bord n’a pas de sens. Aucun autre train n’est annoncé.'),
        choice('q2', bi('Text 2: Was empfiehlt der Verkehrsfunk?', 'Texte 2 : que conseille l’info circulation ?'),
          [['auf der rechten Spur bis Lindenberg-Süd zu fahren'], ['auf der Autobahn bis zur Ausfahrt Talheim zu bleiben'], ['die Autobahn an der Ausfahrt Lindenberg-Süd zu verlassen', true]],
          '« Wer nach Talheim fahren möchte, verlässt die Autobahn am besten schon an der Ausfahrt Lindenberg-Süd ». La voie de droite est justement fermée (gesperrt), et rester sur l’autoroute, c’est rester dans les 5 km de bouchon.'),
        choice('q3', bi('Text 3: Was soll Kim tun?', 'Texte 3 : que doit faire Kim ?'),
          [['Bea um halb elf am Flughafen abholen'], ['den Schlüssel bei der Nachbarin lassen', true], ['eine Fahrkarte für die S-Bahn kaufen']],
          'Bea dit « Du musst mich nicht abholen » puis demande « kannst du bitte den Schlüssel bei deiner Nachbarin lassen? ». Piège typique : « halb elf » et « S-Bahn » sont bien dans le message, mais ne sont pas ce que Kim doit faire.'),
        choice('q4', bi('Text 4: Wo sollen die Reisenden nach Bremen warten?', 'Texte 4 : où les voyageurs pour Brême doivent-ils attendre ?'),
          [['an Gleis 8, im vorderen Bereich', true], ['an Gleis 3, im vorderen Bereich'], ['an Gleis 8, im hinteren Bereich']],
          '« nicht von Gleis drei, sondern von Gleis acht » : après sondern vient l’information valable. Le train court « hält im vorderen Bereich des Bahnsteigs », à l’avant du quai.'),
        choice('q5', bi('Text 5: Was gilt ab morgen?', 'Texte 5 : qu’est-ce qui est valable à partir de demain ?'),
          [['Busse und Straßenbahnen streiken noch bis Freitag weiter.'], ['Alle Linien fahren wieder ganz normal nach Fahrplan.'],
            ['Fast alle Linien fahren normal, die Linie 4 fährt eine Umleitung.', true]],
          'La grève est finie (« ist vorbei ») et le service redevient normal, avec une exception introduite par « nur » : « Nur die Linie vier fährt … eine Umleitung ». « Alle Linien » oublie cette exception.'),
        choice('q6', bi('Text 6: Was bietet der Fahrradverleih an?', 'Texte 6 : que propose le loueur de vélos ?'),
          [['ein E-Bike zum gleichen Preis', true], ['zwei neue Räder für Sonntag'], ['das Geld für ein Rad zurück']],
          '« Wir können Ihnen stattdessen ein E-Bike geben, ohne Aufpreis » : sans supplément, donc au même prix. Il n’est question ni de dimanche ni de remboursement.'),
      ] },

    // 6 · Mission écrite
    { id: 'b1-unterwegs-atelier-schreiben', kind: 'mission', title: 'Mission : prévenir le groupe d’un changement', estimatedMinutes: 25,
      competences: ['expression-ecrite'],
      lesson: { description: `SITUATION
[fr] Situation
${bi('Sie singen in einem Chor und organisieren den Ausflug zum Chorfestival in Seestadt am Samstag.', 'Vous chantez dans une chorale et organisez la sortie au festival de chorales de Seestadt, samedi.')}
${bi('Geplant war der Zug um 8.30 Uhr. Heute Morgen lesen Sie: Wegen Bauarbeiten fällt dieser Zug aus. Es gibt zwei andere Möglichkeiten.', 'Le train de 8 h 30 était prévu. Ce matin, vous lisez qu’il est supprimé à cause de travaux. Il y a deux autres possibilités.')}
• ${bi('Ersatzbus um 8.10 Uhr ab Busbahnhof, Ankunft um 10.05 Uhr direkt vor der Festhalle; die Fahrkarten gelten.', 'Bus de remplacement à 8 h 10 depuis la gare routière, arrivée à 10 h 05 devant la salle ; les billets sont valables.')}
• ${bi('Zug um 7.15 Uhr mit Umsteigen in Neudorf (nur 6 Minuten), Ankunft um 9.10 Uhr am Bahnhof Seestadt, von dort 20 Minuten zu Fuß.', 'Train à 7 h 15 avec changement à Neudorf (6 minutes seulement), arrivée à 9 h 10 en gare, puis 20 minutes à pied.')}
${bi('Das Festival beginnt um 10.30 Uhr. Herr Wolf, ein älteres Mitglied, kann nicht gut zu Fuß gehen.', 'Le festival commence à 10 h 30. M. Wolf, un membre âgé, marche difficilement.')}

AUFGABE
[fr] Consigne
${bi('Schreiben Sie eine Nachricht an die Chorgruppe (80 bis 110 Wörter).', 'Écrivez un message au groupe de la chorale (80 à 110 mots).')}
• ${bi('Erklären Sie das Problem und den Grund.', 'Expliquez le problème et sa cause.')}
• ${bi('Vergleichen Sie die zwei Möglichkeiten.', 'Comparez les deux possibilités.')}
• ${bi('Schlagen Sie eine Lösung vor und begründen Sie sie (obwohl, trotzdem, wegen).', 'Proposez une solution et justifiez-la (obwohl, trotzdem, wegen).')}
• ${bi('Nennen Sie Treffpunkt und Uhrzeit und bitten Sie um eine Antwort.', 'Indiquez le lieu et l’heure du rendez-vous et demandez une réponse.')}

${bi('Nehmen Sie das Modell dieses Ateliers als Hilfe, aber schreiben Sie Ihre eigene Nachricht.', 'Aidez-vous du modèle de cet atelier, mais écrivez votre propre message.')}` },
      mission: {
        oral: null,
        written: {
          prompt: bi('Schreiben Sie der Chorgruppe eine Nachricht (80–110 Wörter): Problem und Grund, Vergleich der zwei Möglichkeiten, Ihr Vorschlag mit Begründung, Treffpunkt und Uhrzeit, Bitte um Antwort.',
            'Écrivez au groupe un message de 80 à 110 mots : problème et cause, comparaison des deux possibilités, votre proposition justifiée, lieu et heure du rendez-vous, demande de réponse.'),
          maxChars: 1000, minWords: 80,
        },
        checklist: [
          bi('Ich nenne das Problem und den Grund (wegen …).', 'Je dis le problème et sa cause.'),
          bi('Ich vergleiche die zwei Möglichkeiten.', 'Je compare les deux possibilités.'),
          bi('Ich begründe meinen Vorschlag, auch mit obwohl oder trotzdem.', 'Je justifie ma proposition, aussi avec obwohl ou trotzdem.'),
          bi('Treffpunkt, Uhrzeit und Bitte um Antwort sind klar.', 'Le lieu, l’heure et la demande de réponse sont clairs.'),
          bi('Ich spreche die Gruppe mit „ihr“ an und grüße am Ende.', 'Je m’adresse au groupe avec « ihr » et je salue à la fin.'),
        ],
        criteria: grid(GRIDS.b1.schreiben, 'Tâche : problème et cause, deux options comparées, proposition justifiée, lieu et heure, demande de réponse ; registre « ihr »'),
      } },

    // 7 · Mission orale
    { id: 'b1-unterwegs-atelier-sprechen', kind: 'mission', title: 'Mission : planifier un trajet à deux', estimatedMinutes: 20,
      competences: ['expression-orale'],
      lesson: { description: `SITUATION
[fr] Situation
${bi('Sie wollen am Sonntag mit Ihrem Freund Tarek zum Seefest fahren. Tarek hat Ihnen eine Sprachnachricht mit drei Vorschlägen geschickt.', 'Dimanche, vous voulez aller à la fête du lac avec votre ami Tarek. Il vous a envoyé un message vocal avec trois propositions.')}
${bi('Hören Sie die Nachricht. Sie können sie mehrmals hören und die Transkription lesen.', 'Écoutez le message. Vous pouvez l’écouter plusieurs fois et lire la transcription.')}

AUFGABE
[fr] Consigne
${bi('Antworten Sie Tarek mit einer Sprachnachricht (etwa 2 Minuten).', 'Répondez à Tarek par un message vocal (environ 2 minutes).')}
• ${bi('Sagen Sie zu jedem Vorschlag kurz Ihre Meinung: Vorteil oder Nachteil.', 'Donnez brièvement votre avis sur chaque proposition : avantage ou inconvénient.')}
• ${bi('Wählen Sie eine Möglichkeit und begründen Sie Ihre Wahl (obwohl, trotzdem, wegen).', 'Choisissez une possibilité et justifiez votre choix (obwohl, trotzdem, wegen).')}
• ${bi('Schlagen Sie Treffpunkt und Uhrzeit vor.', 'Proposez un lieu et une heure de rendez-vous.')}
• ${bi('Nennen Sie einen Plan B, falls etwas nicht klappt.', 'Indiquez un plan B si quelque chose ne marche pas.')}

REDEMITTEL
[fr] Formules utiles
• Den ersten Vorschlag finde ich gut, weil … — Je trouve la première proposition bonne parce que…
• Der Nachteil ist, dass … — L’inconvénient, c’est que…
• Obwohl der Zug schneller ist, würde ich lieber … — Même si le train est plus rapide, je préférerais…
• Lass uns … nehmen. Treffen wir uns um … am … — Prenons… Retrouvons-nous à … à…
• Falls …, nehmen wir einfach … — Si…, nous prendrons simplement…

${bi('Überlegen Sie sich vorher Stichwörter, aber lesen Sie nicht ab: Sprechen Sie frei.', 'Pensez d’abord à quelques mots-clés, mais ne lisez pas : parlez librement.')}` },
      placements: [{ media: 'b1-unterwegs-atelier-sprechen-tarek', transcriptVisibility: 'on_demand' }],
      mission: {
        oral: {
          prompt: bi('Antworten Sie Tarek mit einer Sprachnachricht (etwa 2 Minuten): Sagen Sie zu jedem Vorschlag Ihre Meinung, wählen Sie eine Möglichkeit und begründen Sie sie. Nennen Sie Treffpunkt, Uhrzeit und einen Plan B.',
            'Répondez à Tarek par un message vocal d’environ 2 minutes : donnez votre avis sur chaque proposition, choisissez-en une et justifiez-la. Indiquez le lieu, l’heure et un plan B.'),
          maxSeconds: 150,
        },
        written: null,
        checklist: [
          bi('Ich reagiere auf alle drei Vorschläge.', 'Je réagis aux trois propositions.'),
          bi('Ich wähle eine Möglichkeit und begründe sie (obwohl, trotzdem, wegen).', 'Je choisis une possibilité et je la justifie.'),
          bi('Ich nenne Treffpunkt und Uhrzeit.', 'J’indique le lieu et l’heure du rendez-vous.'),
          bi('Ich schlage einen Plan B vor.', 'Je propose un plan B.'),
          bi('Ich spreche frei und deutlich, ohne abzulesen.', 'Je parle librement et distinctement, sans lire.'),
        ],
        criteria: grid(GRIDS.b1.sprechen, 'Tâche : avis sur les trois propositions, choix justifié, lieu et heure, plan B, en 2 minutes 30 au plus'),
      } },

    // 8 · Faire le point
    { id: 'b1-unterwegs-atelier-bilan', kind: 'lesson', title: 'Faire le point : Unterwegs', estimatedMinutes: 6,
      competences: ['lecture'],
      lesson: { description: `ICH KANN JETZT …
[fr] Maintenant, je peux…
• ${bi('eine Durchsage über eine Störung verstehen und das Wichtigste notieren.', 'comprendre une annonce de perturbation et noter l’essentiel.')}
• ${bi('zwei Verbindungen vergleichen und mich begründet entscheiden.', 'comparer deux trajets et choisir en justifiant.')}
• ${bi('eine Gruppe über eine Planänderung informieren.', 'informer un groupe d’un changement de programme.')}
• ${bi('mit obwohl und trotzdem eine Einschränkung ausdrücken.', 'exprimer une concession avec obwohl et trotzdem.')}
• ${bi('wegen, trotz, statt und während mit dem Genitiv benutzen.', 'employer wegen, trotz, statt et während avec le génitif.')}

STRATÉGIES À GARDER
• Annonces : concentrez-vous sur les nombres (voie, heure, minutes) et sur les mots qui changent l’information (nicht, sondern, nur, statt).
• Médiation : ne transmettez que ce qui compte pour la personne, avec des phrases simples (un verbe plutôt qu’un nom abstrait).
• Écrit : un message de changement suit toujours le même plan : problème, solution, informations pratiques, demande de réponse.
• Oral : réagissez à chaque proposition de l’autre avant de donner votre choix.

À REVOIR SI BESOIN
• La place du verbe après obwohl et trotzdem : « À retenir » et « S’entraîner » du module Unterwegs.
• Les mots du trajet (Verspätung, Ausfall, Anschluss, umsteigen…) : lexique du module, avec le son.
• Les annonces : réécoutez « Annonces en gare » et l’entraînement Hören de cet atelier, sans lire la transcription.
• Les missions : relisez le commentaire de votre correcteur et reprenez le point « À retravailler ».` } },
  ],
};
