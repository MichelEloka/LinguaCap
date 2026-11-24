// Module B1 n° 4 · atelier « Beziehungen » (lot R1, thème nouveau). Conseiller une amie et régler un malentendu :
// modèle annoté (réponse écrite à une amie, message vocal d'excuse), réagir avec les particules doch, mal et ja,
// médiation du français vers l'allemand (message vocal d'une amie française), erreurs typiques, entraînement Hören
// (messages et annonces, a/b/c), missions « Antwort an eine Freundin, die Rat sucht » et « Sich entschuldigen und
// eine Lösung vorschlagen ». Les formules de conseil (Du solltest …, An deiner Stelle würde ich …, Wie wäre es,
// wenn …) sont apprises comme formules ; la règle du Konjunktiv II vient au thème Arbeit.
import { C, bi, choice, fill, order, speak, GRIDS } from '../../lib.mjs';

/** Son d'une question à choix (réplique ou message entendu, transcription après la réponse). */
const sound = (activity, question) => ({ media: `b1-beziehungen-atelier-${activity}-${question}`, questionId: question, transcriptVisibility: 'after_answer' });

export default {
  id: 'b1-beziehungen-atelier',
  title: 'Beziehungen, atelier : conseiller une amie, régler un malentendu',
  objective: 'Donner des conseils par écrit à une amie, s’excuser et proposer une solution à l’oral, réagir avec naturel (doch, mal, ja) et transmettre en allemand un message reçu en français.',
  grammarFocus: ['verben-mit-praepositionen', 'da-wo-pronominaladverb'],
  sources: [
    'Textes, dialogues et exercices originaux LinguaCap.',
    'Thème nouveau du parcours B1 (sans reprise du brouillon B1 V1).',
  ],

  vocabulary: [
    { word: 'Du solltest …', partOfSpeech: 'expression', translation: 'Tu devrais …',
      example: 'Du solltest offen mit ihr reden.', note: 'conseil ; infinitif à la fin' },
    { word: 'An deiner Stelle würde ich …', partOfSpeech: 'expression', translation: 'À ta place, je …',
      example: 'An deiner Stelle würde ich sie anrufen.', note: 'infinitif à la fin' },
    { word: 'Wie wäre es, wenn …?', partOfSpeech: 'expression', translation: 'Et si … ?',
      example: 'Wie wäre es, wenn ihr zusammen etwas unternehmt?', note: 'proposition ; verbe à la fin après wenn' },
    { word: 'Das kann ich gut nachvollziehen.', partOfSpeech: 'expression', translation: 'Je comprends tout à fait.',
      example: 'Du bist enttäuscht? Das kann ich gut nachvollziehen.', note: 'nachvollziehen : séparable, nach|vollziehen' },
    { word: 'einen Rat geben', partOfSpeech: 'expression', translation: 'donner un conseil',
      example: 'Kannst du mir einen Rat geben?', note: 'jemandem (datif) einen Rat geben' },
    { word: 'sich Zeit nehmen', partOfSpeech: 'expression', translation: 'prendre le temps',
      example: 'Nimm dir Zeit für ein ruhiges Gespräch.', note: 'pronom au datif (mir, dir) ; für + accusatif' },
    { word: 'Vorwürfe machen', partOfSpeech: 'expression', translation: 'faire des reproches',
      example: 'Mach ihr keine Vorwürfe, sprich lieber über deine Gefühle.', note: 'jemandem (datif) Vorwürfe machen' },
    { word: 'Es tut mir leid, dass …', partOfSpeech: 'expression', translation: 'Je suis désolé(e) que …',
      example: 'Es tut mir leid, dass ich nicht gekommen bin.', note: 'verbe à la fin après dass' },
    { word: 'Das war nicht so gemeint.', partOfSpeech: 'expression', translation: 'Ce n’était pas mon intention.',
      example: 'Entschuldige, das war nicht so gemeint.', note: null },
    { word: 'vorschlagen', partOfSpeech: 'verb', translation: 'proposer',
      example: 'Ich schlage vor, dass wir uns am Samstag treffen.', note: 'séparable : vor|schlagen · schlug vor, hat vorgeschlagen' },
    { word: 'Vorschlag', article: 'der', plural: 'Vorschläge', partOfSpeech: 'noun', translation: 'la proposition',
      example: 'Darf ich einen Vorschlag machen?', note: 'einen Vorschlag machen' },
    { word: 'wiedergutmachen', partOfSpeech: 'verb', translation: 'réparer (une faute)',
      example: 'Wie kann ich das wiedergutmachen?', note: 'séparable : wieder|gut|machen' },
    { word: 'verzeihen', partOfSpeech: 'verb', translation: 'pardonner',
      example: 'Kannst du mir noch einmal verzeihen?', note: '+ datif · verzieh, hat verziehen' },
    { word: 'doch', partOfSpeech: 'other', translation: 'donc, voyons (particule : invitation, rappel)',
      example: 'Komm doch mit ins Kino!', note: 'particule modale : rend une invitation plus engageante' },
    { word: 'mal', partOfSpeech: 'other', translation: 'un peu, donc (particule : demande adoucie)',
      example: 'Ruf mich mal an, wenn du Zeit hast.', note: 'particule modale : rend une demande plus légère' },
    { word: 'Das ist ja toll!', partOfSpeech: 'expression', translation: 'C’est vraiment génial !',
      example: 'Du hast die Prüfung bestanden? Das ist ja toll!', note: 'ja, particule modale : étonnement ou évidence partagée' },
    { word: 'Kopf hoch!', partOfSpeech: 'expression', translation: 'Courage ! Ne te laisse pas abattre !',
      example: 'Kopf hoch, das wird schon wieder!', note: null },
  ],

  media: [
    { key: 'b1-beziehungen-atelier-modell-aufbau', kind: 'image', title: 'Plan d’une réponse avec des conseils',
      alt: 'Schéma en cinq étapes de la réponse de Hanna : Anrede, Verständnis zeigen, Ratschläge mit Grund, Mut machen, Gruß.',
      image: { layout: 'route', title: 'Aufbau: eine Antwort mit Ratschlägen', stepWidth: 160,
        steps: [
          { icon: 'mail', label: 'Anrede', sub: 'Liebe Leonie,' },
          { icon: 'heart-handshake', label: 'Verständnis\nzeigen', sub: 'Das kann ich\ngut verstehen.' },
          { icon: 'lightbulb', label: 'Ratschläge\nmit Grund', sub: 'An deiner Stelle\nwürde ich …' },
          { icon: 'thumbs-up', label: 'Mut machen', sub: 'Kopf hoch!' },
          { icon: 'smile', label: 'Gruß', sub: 'Liebe Grüße' },
        ] } },
    { key: 'b1-beziehungen-atelier-modell-audio', kind: 'audio', title: 'Modèle oral : Felix s’excuse auprès de Lisa',
      script: [
        { voice: 'sprecher', name: 'Felix', text: 'Hallo Lisa, hier ist Felix. Ich rufe an, weil ich mich bei dir entschuldigen möchte. Es tut mir wirklich leid, dass ich gestern nicht zu deinem Umzug gekommen bin. Ich hatte es dir fest versprochen, und du hast dich auf mich verlassen.' },
        { pause: 0.5 },
        { voice: 'sprecher', name: 'Felix', text: 'Ehrlich gesagt habe ich den Termin einfach vergessen, weil ich die ganze Woche so viel Stress bei der Arbeit hatte. Das ist keine Entschuldigung, ich weiß. Ich kann gut verstehen, dass du sauer bist.' },
        { pause: 0.5 },
        { voice: 'sprecher', name: 'Felix', text: 'Ich möchte das gern wiedergutmachen. Wie wäre es, wenn ich am Samstag vorbeikomme und dir beim Aufbauen der Möbel helfe? Ich bringe auch Pizza mit. Oder sag mir einfach, was du sonst noch brauchst. Ruf mich bitte zurück, ja? Bis bald!' },
      ] },
    { key: 'b1-beziehungen-atelier-interaktion-q1', kind: 'audio', title: 'Réplique : Sophie se sent seule',
      script: [{ voice: 'frau2', name: 'Sophie', text: 'Ich habe heute Abend keine Lust, allein zu Hause zu sitzen. Ich fühle mich ein bisschen einsam.' }] },
    { key: 'b1-beziehungen-atelier-interaktion-q2', kind: 'audio', title: 'Réplique : Erik a couru un semi-marathon',
      script: [{ voice: 'mann', name: 'Erik', text: 'Stell dir vor, ich habe gestern zum ersten Mal einen Halbmarathon geschafft!' }] },
    { key: 'b1-beziehungen-atelier-interaktion-q3', kind: 'audio', title: 'Réplique : Ines s’inquiète pour son frère',
      script: [{ voice: 'frau3', name: 'Ines', text: 'Mein Bruder antwortet seit zwei Wochen nicht auf meine Nachrichten. Ich mache mir langsam Sorgen.' }] },
    { key: 'b1-beziehungen-atelier-interaktion-q4', kind: 'audio', title: 'Réplique : Max annule',
      script: [{ voice: 'mann3', name: 'Max', text: 'Du, sei mir bitte nicht böse, aber ich kann morgen doch nicht zum Kochen kommen.' }] },
    { key: 'b1-beziehungen-atelier-pruefung-q1', kind: 'audio', title: 'Examen, texte 1 : message de Gisela',
      script: [{ voice: 'frau', name: 'Gisela', text: 'Hallo Ben, hier ist Gisela. Danke noch mal für die schönen Blumen zu meinem Geburtstag, ich habe mich riesig darüber gefreut! Du, am Sonntag ist doch unser Familienessen. Wir treffen uns nicht wie geplant um zwölf bei mir, sondern um eins im Restaurant am Marktplatz, weil meine Küche gerade renoviert wird. Bis Sonntag!' }] },
    { key: 'b1-beziehungen-atelier-pruefung-q2', kind: 'audio', title: 'Examen, texte 2 : annonce d’un cours',
      script: [{ voice: 'sprecherin', name: 'Ansage', text: 'Eine Information für die Teilnehmerinnen und Teilnehmer des Kurses „Gut kommunizieren in Familie und Beruf“: Der Kurs am Mittwoch fällt leider aus, weil die Kursleiterin krank ist. Der Termin wird eine Woche später nachgeholt, zur gleichen Zeit und im gleichen Raum. Die Kursgebühr bleibt gleich.' }] },
    { key: 'b1-beziehungen-atelier-pruefung-q3', kind: 'audio', title: 'Examen, texte 3 : message d’Elias',
      script: [{ voice: 'mann2', name: 'Elias', text: 'Hey Mira, ich bin es, Elias. Sag mal, bist du noch sauer wegen gestern? Ich wollte dich wirklich nicht vor allen kritisieren. Ich glaube, ich war einfach müde. Es tut mir leid. Können wir heute Abend kurz telefonieren? Ich bin ab acht zu Hause. Melde dich, ja?' }] },
    { key: 'b1-beziehungen-atelier-pruefung-q4', kind: 'audio', title: 'Examen, texte 4 : conseil à la radio',
      script: [{ voice: 'sprecher', name: 'Moderator', text: 'Und hier ist wieder unser Ratgeber am Nachmittag. Heute geht es um Streit unter Geschwistern. Unsere Expertin meint: Eltern müssen sich nicht bei jedem Streit einmischen. Beim Streiten lernen Kinder, wie man Kompromisse findet. Nur wenn ein Kind immer verliert oder wenn jemand verletzt wird, sollten die Eltern helfen.' }] },
    { key: 'b1-beziehungen-atelier-pruefung-q5', kind: 'audio', title: 'Examen, texte 5 : message d’une voisine',
      script: [{ voice: 'frau2', name: 'Frau Okafor', text: 'Guten Tag, Herr Lindner, hier spricht Okafor aus dem zweiten Stock. Ich wollte mich noch einmal herzlich bei Ihnen bedanken, dass Sie sich letzte Woche um meine Katze gekümmert haben. Als kleines Dankeschön habe ich Ihnen einen Kuchen vor die Tür gestellt. Ich hoffe, Sie mögen Apfelkuchen!' }] },
    { key: 'b1-beziehungen-atelier-pruefung-q6', kind: 'audio', title: 'Examen, texte 6 : changement de programme',
      script: [{ voice: 'mann3', name: 'Karl', text: 'Hallo Leute, hier ist Karl. Kleine Änderung für unser Picknick am Samstag: Laut Wetterbericht soll es regnen. Deshalb treffen wir uns nicht im Park, sondern bei Anna in der Wohnung. Die Uhrzeit bleibt gleich, also um drei. Bringt bitte trotzdem etwas zu essen mit!' }] },
    { key: 'b1-beziehungen-atelier-schreiben-nachricht', kind: 'image', title: 'Le message de Mara',
      alt: 'Message de Mara sur une messagerie : elle se dispute depuis des semaines avec sa colocataire au sujet du ménage, celle-ci ne lui parle plus, et Mara demande un conseil.',
      image: { layout: 'messages', title: 'Mara', icon: 'message-circle',
        messages: [
          { from: 'Mara', time: '21:14', text: 'Hallo du! Ich muss dir was erzählen. Meine Mitbewohnerin und ich streiten uns seit Wochen über das Putzen. Ich mache fast alles allein, und sie sagt immer nur: „Später!“' },
          { from: 'Mara', time: '21:15', text: 'Gestern bin ich richtig laut geworden, und jetzt redet sie nicht mehr mit mir. Ausziehen will ich aber nicht, die Wohnung ist super.' },
          { from: 'Mara', time: '21:16', text: 'Was soll ich tun? Hast du einen Rat für mich?' },
        ] } },
    { key: 'b1-beziehungen-atelier-sprechen-audio', kind: 'audio', title: 'Message vocal de Lukas',
      script: [{ voice: 'mann2', name: 'Lukas', text: 'Hey, hier ist Lukas. Sag mal, wo warst du denn heute? Wir waren um zwei am Bahnhof verabredet, um zusammen zum Konzert nach Hamburg zu fahren. Ich habe fast eine Stunde gewartet und dann den Zug ohne dich genommen. Ich habe dich fünfmal angerufen! Ich bin echt enttäuscht. Melde dich bitte.' }] },
  ],

  activities: [
    // 1 · Modèle de production annoté
    { id: 'b1-beziehungen-atelier-modell', kind: 'lesson', title: 'Découvrir : une réponse pleine de conseils', estimatedMinutes: 12,
      competences: ['lecture', 'ecoute'],
      lesson: { description: `${bi('Leonie hat ihrer Freundin Hanna von ihrem Problem mit Jana erzählt. Lesen Sie Hannas Antwort. Hören Sie danach Felix: Er entschuldigt sich bei Lisa. Beide Texte sind Modelle für Ihre Missionen.', 'Leonie a parlé à son amie Hanna de son problème avec Jana. Lisez la réponse de Hanna. Écoutez ensuite Felix, qui s’excuse auprès de Lisa. Ces deux textes sont des modèles pour vos missions.')}

HANNAS ANTWORT
Liebe Leonie,
danke für deine Nachricht. Es tut mir so leid, dass es dir gerade nicht gut geht. Das kann ich gut verstehen: Wenn die beste Freundin plötzlich keine Zeit mehr hat, ist man natürlich enttäuscht.
An deiner Stelle würde ich nicht mehr lange warten. Du solltest mit Jana sprechen, am besten persönlich und nicht per Nachricht. Erzähl ihr ehrlich, wie du dich fühlst, aber mach ihr keine Vorwürfe. Wie wäre es, wenn ihr euch einmal im Monat einen festen Abend nur für euch nehmt? So hat sie Zeit für ihren Freund und für dich.
Ich bin sicher, dass eure Freundschaft das schafft. Kopf hoch, und melde dich, wenn du reden willst!
Liebe Grüße
Hanna

AUFBAU
[fr] Structure de la réponse
• Anrede : « Liebe Leonie, » ; après la virgule, la ligne suivante commence par une minuscule (danke …).
• Verständnis zeigen : remercier pour le message et montrer qu’on comprend (Das kann ich gut verstehen).
• Ratschläge mit Grund : deux ou trois conseils, chacun avec une raison ou un exemple (So hat sie Zeit für …).
• Mut machen : encourager (Ich bin sicher, dass …, Kopf hoch!).
• Gruß : « Liebe Grüße » et le prénom.

REDEMITTEL
[fr] Formules par fonction
EINLEITEN
[fr] Commencer
• Danke für deine Nachricht. / Schön, dass du mir geschrieben hast.
VERSTÄNDNIS ZEIGEN
[fr] Montrer de la compréhension
• Das kann ich gut verstehen. / Das kann ich gut nachvollziehen. / Das tut mir leid für dich.
RAT GEBEN
[fr] Conseiller
• Du solltest … / An deiner Stelle würde ich … / Wie wäre es, wenn …? / Hast du schon mal versucht, … zu …?
BEGRÜNDEN
[fr] Justifier
• So kann sie … / Dann weiß sie, … / Das hat mir auch geholfen, als …
SCHLUSS
[fr] Conclure
• Ich bin sicher, dass … / Kopf hoch! / Melde dich, wenn … / Liebe Grüße

FELIX ENTSCHULDIGT SICH
[fr] Felix s’excuse
${bi('Hören Sie Felix. Seine Nachricht hat vier Teile: Entschuldigung, Erklärung, Verständnis, Lösung.', 'Écoutez Felix. Son message a quatre parties : excuse, explication, compréhension, solution.')}
• Entschuldigung : Es tut mir wirklich leid, dass ich gestern nicht … gekommen bin.
• Erklärung : Ehrlich gesagt habe ich den Termin vergessen, weil …
• Verständnis : Ich kann gut verstehen, dass du sauer bist.
• Lösung : Wie wäre es, wenn ich am Samstag vorbeikomme und dir … helfe?` },
      placements: [
        { media: 'b1-beziehungen-atelier-modell-aufbau', caption: 'Aufbau der Antwort' },
        { media: 'b1-beziehungen-atelier-modell-audio', transcriptVisibility: 'on_demand' },
      ] },

    // 2 · Réagir en situation : particules doch, mal, ja
    { id: 'b1-beziehungen-atelier-interaktion', kind: 'exercise', title: 'S’entraîner : réagir avec doch, mal et ja', estimatedMinutes: 10,
      competences: ['ecoute', 'expression-orale'],
      lesson: { description: `${bi('Hören Sie, was Ihre Freunde sagen, und wählen Sie die passende Reaktion. Danach sprechen Sie drei Reaktionen nach.', 'Écoutez ce que disent vos amis et choisissez la réplique qui convient. Ensuite, répétez trois réactions à voix haute.')}

TIPP
[fr] Astuce
${bi('Kleine Wörter wie doch, mal und ja machen Ihre Sätze freundlicher und natürlicher.', 'De petits mots comme doch, mal et ja rendent vos phrases plus aimables et plus naturelles.')}
• doch : rend une proposition plus engageante. Komm doch mit!
• mal : adoucit une demande. Ruf mich mal an!
• ja : exprime l’étonnement ou une évidence partagée. Das ist ja toll!` },
      placements: [sound('interaktion', 'q1'), sound('interaktion', 'q2'), sound('interaktion', 'q3'), sound('interaktion', 'q4')],
      questions: [
        choice('q1', bi('Hören Sie. Sie möchten Sophie freundlich einladen. Was passt?', 'Écoutez. Vous voulez inviter Sophie aimablement. Quelle réplique convient ?'),
          [['Dann komm doch mit ins Kino! Das wird bestimmt lustig.', true], ['Dann bleib halt zu Hause und schau einen Film.'], ['Ich gehe heute Abend allein ins Kino, das ist entspannter.']],
          '« Komm doch mit! » : doch rend l’invitation chaleureuse et insistante. « Bleib halt zu Hause » sonne indifférent, et la troisième réplique ne l’invite pas.'),
        choice('q2', bi('Hören Sie. Sie sind überrascht und freuen sich mit Erik. Was passt?', 'Écoutez. Vous êtes surpris et heureux pour Erik. Quelle réplique convient ?'),
          [['Na und? Das schaffe ich auch.'], ['Das ist ja super! Herzlichen Glückwunsch!', true], ['Schade, vielleicht klappt es nächstes Mal.']],
          'ja exprime ici l’étonnement admiratif : « Das ist ja super! ». « Na und? » minimise l’exploit, et « Schade » montre qu’on a compris le contraire : Erik a réussi.'),
        choice('q3', bi('Hören Sie. Sie möchten Ines einen Rat geben. Was passt?', 'Écoutez. Vous voulez donner un conseil à Ines. Quelle réplique convient ?'),
          [['Das ist ja schön, dann hast du endlich Ruhe.'], ['Mach dir keine Sorgen, er hat dich bestimmt vergessen.'], ['Ruf ihn doch mal an! Vielleicht ist sein Handy kaputt.', true]],
          '« Ruf ihn doch mal an! » : doch et mal rendent le conseil amical, et l’explication possible rassure. La première réplique se réjouit d’un souci, la deuxième inquiète encore plus Ines.'),
        choice('q4', bi('Hören Sie. Sie reagieren verständnisvoll und schlagen einen neuen Termin vor. Was passt?', 'Écoutez. Vous réagissez avec compréhension et proposez une autre date. Quelle réplique convient ?'),
          [['Kein Problem. Wie wäre es mit nächster Woche?', true], ['Das ist ja typisch für dich!'], ['Gut, dann koche ich eben nie wieder für dich.']],
          '« Kein Problem » rassure Max, et « Wie wäre es mit …? » propose une autre date. Les deux autres répliques sont des reproches : ja souligne ici l’agacement (« typisch für dich »).'),
        speak('q5', 'Komm doch mit, das wird bestimmt lustig!',
          'Invitation chaleureuse avec doch. Accent sur « MIT » et sur « LUS-tig » ; doch reste léger, sans accent.'),
        speak('q6', 'Ruf ihn doch mal an, vielleicht ist sein Handy kaputt.',
          'Conseil amical avec doch mal. Accent sur « AN » (verbe séparable anrufen) et sur « ka-PUTT ». Le h de « Handy » s’entend.'),
        speak('q7', 'Kein Problem. Wie wäre es mit nächster Woche?',
          'Rassurer, puis proposer. « wäre » : ä long, comme dans « mère ». Intonation montante sur « Problem », descendante à la fin de la question.'),
      ] },

    // 3 · Médiation (français → allemand)
    { id: 'b1-beziehungen-atelier-mediation', kind: 'exercise', title: 'Médiation : transmettre des excuses en allemand', estimatedMinutes: 15,
      competences: ['lecture', 'expression-ecrite'],
      lesson: { description: `${bi('Situation: Ihre französische Freundin Camille hat Ihnen eine Sprachnachricht auf Französisch geschickt. Ihr gemeinsamer Freund Lukas spricht kein Französisch. Geben Sie ihm die wichtigen Informationen auf Deutsch weiter.', 'Situation : votre amie française Camille vous a envoyé un message vocal en français. Votre ami commun Lukas ne parle pas français. Transmettez-lui en allemand les informations importantes.')}

STRATEGIE
[fr] Stratégie
${bi('Übersetzen Sie nicht Wort für Wort. Was muss Lukas wissen? Was ist passiert, was möchte Camille, wann und wo?', 'Ne traduisez pas mot à mot. Que doit savoir Lukas ? Que s’est-il passé, que veut Camille, quand et où ?')}

LE MESSAGE DE CAMILLE (TRANSCRIPTION)
« Coucou, c’est Camille ! Dis, j’ai un petit souci avec Lukas et j’ai besoin de toi. Samedi, à la fête d’anniversaire de Paula, j’ai fait une blague sur son nouveau travail devant tout le monde. Je voulais juste être drôle, mais je crois qu’il l’a mal pris : il est parti sans me dire au revoir, et depuis, il ne répond plus à mes messages. Je suis vraiment désolée, je ne voulais pas le blesser. Est-ce que tu peux lui dire que je m’excuse ? J’aimerais l’inviter au restaurant jeudi soir, vers 19 h 30, pour en parler tranquillement. S’il préfère, on peut aussi simplement aller se promener au bord du lac. Merci, tu es un ange ! »` },
      questions: [
        fill('q1', bi('Ergänzen Sie Ihre Nachricht an Lukas.', 'Complétez votre message à Lukas.'),
          'Hallo Lukas, Camille hat mir eine Nachricht geschickt. Sie möchte sich bei dir [[1]]. Am Samstag auf Paulas Party hat sie einen Witz über deine neue [[2]] gemacht. Sie wollte nur lustig sein und dich nicht [[3]]. Sie möchte dich am [[4]] um halb acht zum Essen einladen. Wenn dir das lieber ist, könnt ihr auch am See [[5]] gehen.',
          [['entschuldigen'], ['Arbeit', 'Stelle', 'Arbeitsstelle'], ['verletzen', 'kränken', 'beleidigen'], ['Donnerstag', 'Donnerstagabend'], ['spazieren']],
          '« je m’excuse » : sich entschuldigen (bei dir). « son nouveau travail » : deine neue Arbeit ou Stelle (féminin ; Job, masculin, ne va pas avec « neue »). « blesser » au sens moral : verletzen ou kränken. Jeudi : Donnerstag. « se promener » : spazieren gehen.'),
        choice('q2', bi('Was ist für Lukas am wichtigsten?', 'Qu’est-ce qui est le plus important pour Lukas ?'),
          [['Camille hat sich über ihn geärgert.'], ['Camille tut der Witz leid, und sie möchte mit ihm reden.', true], ['Camille möchte Paulas Geburtstag noch einmal feiern.']],
          'Le cœur du message : Camille regrette sa plaisanterie et veut en parler avec Lukas. Ce n’est pas elle qui est fâchée, et la fête de Paula n’est que le cadre de l’incident.'),
        choice('q3', bi('Wie geben Sie Camilles Bitte am besten weiter?', 'Comment transmettez-vous le mieux la demande de Camille ?'),
          [['Camille sagt, dass du zu empfindlich bist und den Witz falsch verstanden hast.'], ['Camille sagt, dass sie dir nicht mehr schreiben will.'], ['Camille sagt, dass es ihr leidtut und dass sie dich nicht verletzen wollte.', true]],
          'La troisième phrase restitue fidèlement l’excuse (« je suis vraiment désolée ») et l’intention (« je ne voulais pas le blesser »). Les deux autres ajoutent un reproche ou une décision que Camille n’a pas exprimés.'),
        order('q4', bi('Erklären Sie Lukas, warum Sie schreiben. Bilden Sie einen Satz. Beginnen Sie mit „Camille“.', 'Expliquez à Lukas pourquoi vous écrivez. Remettez les mots dans l’ordre en commençant par « Camille ».'),
          [['Camille', 'hat', 'mich', 'gebeten,', 'dir', 'zu', 'sagen,', 'dass', 'es', 'ihr', 'leidtut.']],
          'jemanden bitten, etwas zu tun : l’infinitif avec zu (dir zu sagen) suit la principale. Puis la subordonnée en dass : les pronoms es (sujet) et ihr (datif) viennent juste après dass, et le verbe leidtut, écrit en un mot, ferme la phrase.'),
        fill('q5', bi('Ergänzen Sie die Präpositionen.', 'Complétez avec les prépositions.'),
          'Camille lädt dich [[1]] Donnerstag [[2]] Essen ein.', [['am'], ['zum']],
          'Pour un jour de la semaine : am (an dem) Donnerstag. einladen zu + datif : zum (zu dem) Essen. Le verbe séparable einladen place sa particule ein à la fin.'),
      ] },

    // 4 · Erreurs typiques
    { id: 'b1-beziehungen-atelier-korrektur', kind: 'exercise', title: 'Corriger : prépositions et pronoms qui piègent', estimatedMinutes: 10,
      competences: ['lecture', 'expression-ecrite'],
      lesson: { description: `${bi('Diese Fehler machen viele Französischsprachige. Ergänzen Sie oder wählen Sie die richtige Form.', 'Ces erreurs sont fréquentes chez les francophones. Complétez ou choisissez la bonne forme.')}
${bi('Lesen Sie danach jede Erklärung genau: Sie hilft Ihnen bei den Missionen.', 'Lisez ensuite attentivement chaque explication : elle vous aidera pour les missions.')}` },
      questions: [
        fill('q1', bi('Ergänzen Sie die Präposition: „J’attends mon ami.“', 'Complétez avec la préposition : « J’attends mon ami. »'),
          'Ich warte [[1]] meinen Freund.', [['auf']],
          'En français, « attendre » se construit sans préposition ; en allemand, warten demande auf + accusatif : Ich warte auf meinen Freund. « Ich warte meinen Freund » est une erreur fréquente.'),
        fill('q2', bi('Ergänzen Sie die Präposition: „Je pense souvent à toi.“', 'Complétez avec la préposition : « Je pense souvent à toi. »'),
          'Ich denke oft [[1]] dich.', [['an']],
          'denken an + accusatif : penser à. La préposition « zu », calquée sur le français « à », ne convient pas ici.'),
        fill('q3', bi('Ergänzen Sie die Präposition: „Nous nous sommes disputés à propos des vacances.“', 'Complétez avec la préposition : « Nous nous sommes disputés à propos des vacances. »'),
          'Wir haben uns [[1]] den Urlaub gestritten.', [['über']],
          'sich streiten über + accusatif : le sujet de la dispute. La personne avec qui l’on se dispute est introduite par mit + datif : Ich habe mich mit ihm über den Urlaub gestritten.'),
        fill('q4', bi('Ergänzen Sie das Reflexivpronomen: „Je m’achète un nouveau portable.“', 'Complétez avec le pronom réfléchi : « Je m’achète un nouveau portable. »'),
          'Ich kaufe [[1]] ein neues Handy.', [['mir']],
          'Le verbe a déjà un complément à l’accusatif (ein neues Handy) : le pronom réfléchi passe au datif, mir. « mich » serait l’accusatif, impossible ici.'),
        choice('q5', bi('Sie sprechen über Ihre Kollegin Anna: „Ich ärgere mich oft …“', 'Vous parlez de votre collègue Anna : « Je suis souvent énervé contre elle. »'),
          [['darüber.'], ['über sie.', true], ['über es.']],
          'Anna est une personne : préposition + pronom personnel, über sie. darüber ne reprend qu’une chose ou une idée, et « über es » n’est pas employé.'),
        choice('q6', bi('Welcher Satz ist richtig? „Je me souviens de lui.“', 'Quelle phrase est correcte ? « Je me souviens de lui. »'),
          [['Ich erinnere mich von ihm.'], ['Ich erinnere mir an ihn.'], ['Ich erinnere mich an ihn.', true]],
          'sich erinnern an + accusatif, avec le pronom réfléchi à l’accusatif (mich). « von » calque le français « de » ; « mir » serait un datif, sans raison ici.'),
        choice('q7', bi('Welche Präposition passt? „Ich möchte mich … meiner Nachbarin entschuldigen.“', 'Quelle préposition convient ? « Je voudrais m’excuser auprès de ma voisine. »'),
          [['für'], ['bei', true], ['mit']],
          'sich entschuldigen bei + datif (meiner Nachbarin) pour la personne, für + accusatif pour la raison. « auprès de » se traduit ici par bei ; für n’introduit que la raison, et mit ne convient pas.'),
      ] },

    // 5 · Entraînement au format : Hören
    { id: 'b1-beziehungen-atelier-pruefung', kind: 'exercise', title: 'Entraînement à l’examen : messages et annonces', estimatedMinutes: 20,
      competences: ['ecoute'],
      lesson: { description: `PRÜFUNGSTRAINING: HÖREN
[fr] Entraînement à l’examen : écoute
${bi('Zeit: etwa 10 Minuten. Sie hören sechs kurze Texte: Nachrichten auf dem Anrufbeantworter, Ansagen und eine Radiosendung. Zu jedem Text gibt es eine Aufgabe. Wählen Sie a, b oder c.', 'Durée : environ 10 minutes. Vous entendez six textes courts : messages sur répondeur, annonces et une émission de radio. Chaque texte a une question. Choisissez a, b ou c.')}

STRATEGIE
[fr] Stratégie
${bi('Lesen Sie zuerst die Aufgabe und die drei Antworten. Was müssen Sie hören: einen Ort, eine Zeit, einen Grund?', 'Lisez d’abord la question et les trois réponses. Que devez-vous entendre : un lieu, une heure, une raison ?')}
${bi('Vorsicht: Oft kommen alle drei Antworten im Text vor. Achten Sie auf Wörter wie „nicht“, „sondern“ oder „doch“.', 'Attention : souvent, les trois réponses apparaissent dans le texte. Repérez les mots comme « nicht », « sondern » ou « doch ».')}
${bi('Hören Sie jeden Text zweimal: beim ersten Mal global, beim zweiten Mal genau.', 'Écoutez chaque texte deux fois : la première fois globalement, la seconde en détail.')}` },
      placements: [1, 2, 3, 4, 5, 6].map((index) => sound('pruefung', `q${index}`)),
      questions: [
        choice('q1', bi('Text 1: Wo trifft sich die Familie am Sonntag?', 'Texte 1 : où la famille se retrouve-t-elle dimanche ?'),
          [['bei Gisela zu Hause in der Küche'], ['im Restaurant am Marktplatz', true], ['bei Ben im Garten']],
          '« nicht wie geplant um zwölf bei mir, sondern um eins im Restaurant am Marktplatz » : nicht … sondern annule le premier lieu. La cuisine de Gisela est en travaux.'),
        choice('q2', bi('Text 2: Was passiert mit dem Kurs am Mittwoch?', 'Texte 2 : que devient le cours de mercredi ?'),
          [['Er findet eine Woche später statt.', true], ['Er findet in einem anderen Raum statt.'], ['Er fällt ganz aus, und man bekommt das Geld zurück.']],
          'Le cours est annulé mais « wird eine Woche später nachgeholt, zur gleichen Zeit und im gleichen Raum » : il est rattrapé une semaine plus tard. Le prix ne change pas, il n’y a donc pas de remboursement.'),
        choice('q3', bi('Text 3: Warum ruft Elias an?', 'Texte 3 : pourquoi Elias appelle-t-il ?'),
          [['Er möchte Mira zu einer Party einladen.'], ['Er ist sauer auf Mira.'], ['Er möchte sich für gestern entschuldigen.', true]],
          'Elias demande si Mira est encore fâchée, explique qu’il ne voulait pas la critiquer devant tout le monde et dit « Es tut mir leid ». C’est Mira qui est fâchée, pas lui.'),
        choice('q4', bi('Text 4: Was rät die Expertin den Eltern?', 'Texte 4 : que conseille l’experte aux parents ?'),
          [['Sie sollen jeden Streit sofort beenden.'], ['Sie sollen sich meistens nicht einmischen.', true], ['Sie sollen mit den Kindern zu einer Beratung gehen.']],
          '« Eltern müssen sich nicht bei jedem Streit einmischen » : les enfants apprennent à trouver des compromis. Les parents n’interviennent que si un enfant perd toujours ou si quelqu’un est blessé.'),
        choice('q5', bi('Text 5: Warum ruft Frau Okafor an?', 'Texte 5 : pourquoi Mme Okafor appelle-t-elle ?'),
          [['Sie bedankt sich für die Hilfe mit ihrer Katze.', true], ['Sie bittet Herrn Lindner, ihre Katze zu füttern.'], ['Sie lädt Herrn Lindner zum Kaffee ein.']],
          '« Ich wollte mich … bedanken, dass Sie sich letzte Woche um meine Katze gekümmert haben » : le service a déjà eu lieu. Le gâteau est un remerciement, pas une invitation.'),
        choice('q6', bi('Text 6: Was ändert sich beim Picknick?', 'Texte 6 : qu’est-ce qui change pour le pique-nique ?'),
          [['der Tag'], ['die Uhrzeit'], ['der Ort', true]],
          'À cause de la pluie annoncée, on se retrouve « nicht im Park, sondern bei Anna in der Wohnung ». Le jour reste samedi et « die Uhrzeit bleibt gleich ».'),
      ] },

    // 6 · Mission écrite
    { id: 'b1-beziehungen-atelier-schreiben', kind: 'mission', title: 'Mission : conseiller une amie par écrit', estimatedMinutes: 25,
      competences: ['expression-ecrite'],
      lesson: { description: `SITUATION
[fr] Situation
${bi('Ihre Freundin Mara hat Ihnen eine Nachricht geschrieben. Sie hat ein Problem mit ihrer Mitbewohnerin und bittet Sie um Rat.', 'Votre amie Mara vous a écrit. Elle a un problème avec sa colocataire et vous demande conseil.')}

MARAS NACHRICHT
Hallo du! Ich muss dir was erzählen. Meine Mitbewohnerin und ich streiten uns seit Wochen über das Putzen. Ich mache fast alles allein, und sie sagt immer nur: „Später!“ Gestern bin ich richtig laut geworden, und jetzt redet sie nicht mehr mit mir. Ausziehen will ich aber nicht, die Wohnung ist super. Was soll ich tun? Hast du einen Rat für mich?

AUFGABE
[fr] Consigne
${bi('Schreiben Sie Mara eine Antwort (100 bis 130 Wörter).', 'Écrivez une réponse à Mara (100 à 130 mots).')}
• ${bi('Zeigen Sie Verständnis für Maras Situation.', 'Montrez que vous comprenez la situation de Mara.')}
• ${bi('Geben Sie zwei Ratschläge und begründen Sie sie.', 'Donnez deux conseils et justifiez-les.')}
• ${bi('Erzählen Sie kurz von einer eigenen Erfahrung oder geben Sie ein Beispiel.', 'Racontez brièvement une expérience personnelle ou donnez un exemple.')}
• ${bi('Machen Sie Mara Mut und verabschieden Sie sich.', 'Encouragez Mara et terminez votre message.')}

TIPP
[fr] Astuce
${bi('Nehmen Sie Hannas Antwort als Modell: Anrede, Verständnis, Ratschläge mit Grund, Mut machen, Gruß.', 'Prenez la réponse de Hanna comme modèle : salutation, compréhension, conseils justifiés, encouragement, formule finale.')}
${bi('Verwenden Sie Verben mit Präposition: sich ärgern über, sprechen mit … über, sich kümmern um.', 'Employez des verbes à préposition : sich ärgern über, sprechen mit … über, sich kümmern um.')}
${bi('Mara ist Ihre Freundin: Schreiben Sie mit „du“.', 'Mara est votre amie : écrivez en la tutoyant (du).')}` },
      placements: [{ media: 'b1-beziehungen-atelier-schreiben-nachricht', caption: 'Maras Nachricht' }],
      mission: {
        oral: null,
        written: { prompt: bi('Antworten Sie Mara (100 bis 130 Wörter): Verständnis zeigen, zwei Ratschläge mit Begründung, eine eigene Erfahrung oder ein Beispiel, Mut machen.', 'Répondez à Mara (100 à 130 mots) : montrer de la compréhension, deux conseils justifiés, une expérience personnelle ou un exemple, des encouragements.'),
          maxChars: 1300, minWords: 100 },
        checklist: [
          bi('Ich beginne mit „Liebe Mara,“ und danke ihr für die Nachricht.', 'Je commence par « Liebe Mara, » et je la remercie de son message.'),
          bi('Ich zeige Verständnis: Das kann ich gut verstehen.', 'Je montre que je comprends sa situation.'),
          bi('Ich gebe zwei Ratschläge mit Grund: Du solltest …, An deiner Stelle würde ich …', 'Je donne deux conseils, chacun avec une raison.'),
          bi('Ich erzähle eine eigene Erfahrung oder gebe ein Beispiel.', 'Je raconte une expérience ou je donne un exemple.'),
          bi('Ich benutze mindestens zwei Verben mit Präposition: sich ärgern über, sprechen über …', 'J’emploie au moins deux verbes à préposition.'),
          bi('Ich mache Mara Mut und ende mit einem Gruß: Kopf hoch! Liebe Grüße', 'Je l’encourage et je termine par une formule.'),
        ],
        criteria: [
          { ...GRIDS.b1.schreiben[0], label: 'Tâche : compréhension, deux conseils justifiés, expérience ou exemple et encouragement ; tutoiement respecté' },
          ...GRIDS.b1.schreiben.slice(1),
        ] } },

    // 7 · Mission orale
    { id: 'b1-beziehungen-atelier-sprechen', kind: 'mission', title: 'Mission : s’excuser et proposer une solution', estimatedMinutes: 20,
      competences: ['expression-orale'],
      lesson: { description: `SITUATION
[fr] Situation
${bi('Sie waren heute mit Ihrem Freund Lukas am Bahnhof verabredet, aber Sie sind nicht gekommen. Hören Sie seine Sprachnachricht.', 'Vous aviez rendez-vous aujourd’hui à la gare avec votre ami Lukas, mais vous n’êtes pas venu. Écoutez son message vocal.')}

AUFGABE
[fr] Consigne
${bi('Antworten Sie Lukas mit einer Sprachnachricht (etwa eineinhalb Minuten).', 'Répondez à Lukas par un message vocal (environ une minute et demie).')}
• ${bi('Entschuldigen Sie sich.', 'Excusez-vous.')}
• ${bi('Erklären Sie, warum Sie nicht gekommen sind. Den Grund wählen Sie selbst.', 'Expliquez pourquoi vous n’êtes pas venu. Vous choisissez la raison.')}
• ${bi('Zeigen Sie, dass Sie seine Enttäuschung verstehen.', 'Montrez que vous comprenez sa déception.')}
• ${bi('Schlagen Sie eine Lösung vor, um es wiedergutzumachen.', 'Proposez une solution pour vous faire pardonner.')}

VORBEREITUNG
[fr] Préparation
${bi('Hören Sie noch einmal die Nachricht von Felix im Modell. Überlegen Sie sich vier Stichwörter: Entschuldigung, Grund, Verständnis, Lösung.', 'Réécoutez le message de Felix dans le modèle. Préparez mentalement quatre mots-clés : excuse, raison, compréhension, solution.')}
${bi('Sprechen Sie frei und freundlich. Verwenden Sie: Es tut mir leid, dass … / Ich kann verstehen, dass … / Wie wäre es, wenn …?', 'Parlez librement et aimablement. Utilisez : Es tut mir leid, dass … / Ich kann verstehen, dass … / Wie wäre es, wenn …?')}` },
      placements: [
        { media: 'b1-beziehungen-atelier-sprechen-audio', transcriptVisibility: 'on_demand' },
        { media: 'b1-beziehungen-atelier-modell-audio', transcriptVisibility: 'on_demand' },
      ],
      mission: {
        oral: { prompt: bi('Antworten Sie Lukas: Entschuldigen Sie sich, erklären Sie den Grund, zeigen Sie Verständnis und schlagen Sie eine Lösung vor (etwa eineinhalb Minuten).', 'Répondez à Lukas : excusez-vous, donnez la raison, montrez de la compréhension et proposez une solution (environ une minute et demie).'),
          maxSeconds: 90 },
        written: null,
        checklist: [
          bi('Ich entschuldige mich klar: Es tut mir wirklich leid, dass …', 'Je m’excuse clairement.'),
          bi('Ich erkläre den Grund mit weil; das Verb steht am Ende.', 'J’explique la raison avec weil, verbe à la fin.'),
          bi('Ich zeige Verständnis für seine Enttäuschung: Ich kann gut verstehen, dass …', 'Je montre que je comprends sa déception.'),
          bi('Ich schlage eine konkrete Lösung vor: wann, wo, was? Wie wäre es, wenn …?', 'Je propose une solution concrète : quand, où, quoi.'),
          bi('Zum Schluss bitte ich ihn, mich zurückzurufen oder mir zu antworten.', 'Pour finir, je lui demande de me rappeler ou de me répondre.'),
        ],
        criteria: [
          { ...GRIDS.b1.sprechen[0], label: 'Tâche : excuse, raison, compréhension et solution concrète en une minute et demie environ' },
          ...GRIDS.b1.sprechen.slice(1),
        ] } },

    // 8 · Faire le point
    { id: 'b1-beziehungen-atelier-bilan', kind: 'lesson', title: 'Faire le point : Beziehungen', estimatedMinutes: 6,
      competences: ['lecture'],
      lesson: { description: `FAIRE LE POINT
${bi('Was können Sie jetzt? Lesen Sie die Sätze und prüfen Sie sich selbst.', 'Que savez-vous faire maintenant ? Lisez les phrases et évaluez-vous.')}
• ${bi('Ich kann eine Freundschaft oder eine Beziehung in der Familie beschreiben.', 'Je peux décrire une amitié ou une relation familiale.')}
• ${bi('Ich kann sagen, was ich fühle: Freude, Ärger, Enttäuschung.', 'Je peux dire ce que je ressens : la joie, la colère, la déception.')}
• ${bi('Ich kann Verständnis zeigen und einer Freundin Ratschläge geben.', 'Je peux montrer de la compréhension et donner des conseils à une amie.')}
• ${bi('Ich kann mich entschuldigen und eine Lösung vorschlagen.', 'Je peux m’excuser et proposer une solution.')}
• ${bi('Ich kann eine Nachricht auf Französisch für eine andere Person auf Deutsch zusammenfassen.', 'Je peux résumer en allemand, pour une autre personne, un message reçu en français.')}

STRATÉGIES À GARDER
• Lecture : repérer ce que reprennent darüber, damit, darauf ; cela évite les contresens.
• Écoute : lire la question avant d’écouter et se méfier de « nicht …, sondern … » qui annule la première information.
• Production : une réponse en cinq temps (salutation, compréhension, conseils justifiés, encouragement, formule finale).
• Médiation : ne pas traduire mot à mot, transmettre ce que la personne doit savoir et faire.

À REVOIR SI BESOIN
• Verbes à préposition, da- et wo- : leçon « Retenir » et exercice « S’entraîner » du module Beziehungen.
• Pronoms réfléchis au datif (mir, dir) : exercice « Corriger » de cet atelier.
• Formules de conseil et d’excuse : modèle de cet atelier et lexique sonore (Du solltest …, An deiner Stelle würde ich …, Es tut mir leid, dass …).` } },
  ],
};
