// Évaluations du niveau B1 (lot M1, plan B §2.5) : test de positionnement (diagnostic), bilan intermédiaire (après le
// module 12) et examen blanc (après le module 24), avec leurs sons. Mêmes formes que level.json au format 4 ; consignes
// et énoncés en allemand simple avec la traduction française à côté (« allemand [fr] français »).
// Matière reprise et réécrite du brouillon B1 V1 (content/b1-v1/source/evaluations.mjs) : textes allongés au niveau,
// questions en allemand, écoutes en voix variées. Les formats d'examen sont imités (types de documents et de tâches),
// jamais copiés d'un modèle officiel.
//
// Poids des compétences : comme en A1 et A2, chaque compétence pèse autant dans la note. Une question fermée vaut un
// point ; les grilles d'écrit et d'oral reprennent les critères de GRIDS.b1 (mêmes identifiants et libellés) avec des
// points ramenés au nombre de questions d'une partie fermée : 8 points au bilan, 10 à l'examen blanc.
// Les titres et descriptions du bilan et de l'examen viennent de _level.mjs (repris ici pour que le fichier se suffise).
import { GRIDS, bi } from '../../lib.mjs';
import level from './_level.mjs';

/** Question à choix : options dans l'ordre donné, la bonne marquée par true (sa place varie d'une question à l'autre). */
const q = (id, prompt, options, moduleRef) => ({
  id, ...(moduleRef ? { moduleRef } : {}), prompt,
  options: options.map(([label, correct = false], index) => ({ id: 'abcd'[index], label, correct })),
});
/** Grille d'une production : critères de GRIDS.b1, points répartis pour l'égalité des compétences, libellé adaptable. */
const grid = (criteria, points, labels = {}) => criteria.map((criterion, index) => ({
  id: criterion.id, label: labels[criterion.id] ?? criterion.label, maxPoints: points[index],
}));
const RF = ['Richtig', 'Falsch', 'Steht nicht im Text'];
/** « Richtig / falsch / steht nicht im Text » : answer = 0, 1 ou 2. */
const rf = (id, statement, answer) => q(id, `${statement} ${bi('Richtig, falsch oder steht nicht im Text?', 'Vrai, faux ou non mentionné dans le texte ?')}`,
  RF.map((label, index) => [label, index === answer]));

// ── Test de positionnement ───────────────────────────────────────────────────────────────────────────────────────────
// 14 questions : 6 sur les acquis du niveau A2 (moduleRef « prerequis »), puis une par thème des modules 1, 3, 4, 7, 8,
// 9, 10 et 12 (structure du thème : la bonne forme ou le bon sens).
export const diagnostic = {
  title: 'Test de positionnement B1',
  description: [
    bi('Dieser Test dauert etwa 15 Minuten und zählt nicht für Ihre Note.', 'Ce test dure environ 15 minutes et ne compte pas dans votre note.'),
    bi('Zuerst prüft er, ob Ihre A2-Kenntnisse sicher sind: Perfekt, Nebensätze mit weil, Präpositionen, Uhrzeit.', 'Il vérifie d’abord que vos acquis du niveau A2 sont solides : passé composé, subordonnées avec weil, prépositions, heure.'),
    bi('Dann zeigt er, was Sie in den Themen des B1-Kurses schon können: Neuanfang, Wohnen, Arbeit, Reisen, Einkaufen, Medien, Umwelt und Kultur.', 'Il situe ensuite votre niveau dans les thèmes du parcours B1 : nouveau départ, logement, travail, voyages, achats, médias, environnement et culture.'),
    bi('Antworten Sie ohne Hilfe und ohne Wörterbuch. Ihr Kurs wird an Ihre Ergebnisse angepasst.', 'Répondez sans aide ni dictionnaire : votre parcours sera adapté à vos résultats.'),
  ].join('\n'),
  questions: [
    q('q1', `Gestern … ich mit dem Zug nach Mainz gefahren. ${bi('Welche Form passt?', 'Quelle forme convient ?')}`,
      [['habe'], ['bin', true], ['hat'], ['ist']], 'prerequis'),
    q('q2', `„Die Praxis ist heute geschlossen. Termine können Sie bis morgen, 12 Uhr, online ändern.“ ${bi('Bis wann kann man einen Termin online ändern?', 'Jusqu’à quand peut-on modifier un rendez-vous en ligne ?')}`,
      [['Nur heute.'], ['Bis heute Abend.'], ['Bis morgen um 12 Uhr.', true], ['Erst ab morgen um 12 Uhr.']], 'prerequis'),
    q('q3', `„Seit wann wohnst du in Köln?“ ${bi('Welche Antwort passt?', 'Quelle réponse convient ?')}`,
      [['Seit drei Monaten.', true], ['Für drei Monate.'], ['In drei Monaten.'], ['Nach drei Monaten.']], 'prerequis'),
    q('q4', `Ich warte schon seit zehn Minuten auf … Bus. ${bi('Welche Form passt?', 'Quelle forme convient ?')}`,
      [['dem'], ['der'], ['des'], ['den', true]], 'prerequis'),
    q('q5', `Ich kann heute leider nicht kommen, weil … ${bi('Wie geht der Satz richtig weiter?', 'Quelle suite est correcte ?')}`,
      [['ich muss arbeiten.'], ['muss ich arbeiten.'], ['ich arbeiten muss.', true], ['ich arbeiten müssen.']], 'prerequis'),
    q('q6', `„Der Bus fährt um Viertel vor acht.“ ${bi('Wann fährt der Bus?', 'À quelle heure part le bus ?')}`,
      [['Um 7.15 Uhr.'], ['Um 7.45 Uhr.', true], ['Um 8.15 Uhr.'], ['Um 8.45 Uhr.']], 'prerequis'),
    q('q7', `… ich vor einem Jahr nach Leipzig kam, kannte ich dort niemanden. ${bi('Welches Wort passt?', 'Quel mot convient ?')}`,
      [['Wenn'], ['Als', true], ['Wann'], ['Ob']], 'b1-neuanfang'),
    q('q8', `Die Wohnung, … wir gestern besichtigt haben, ist leider schon vergeben. ${bi('Welches Wort passt?', 'Quel mot convient ?')}`,
      [['den'], ['dem'], ['der'], ['die', true]], 'b1-wohnen'),
    q('q9', `${bi('Sie möchten Ihren Termin verschieben. Was sagen Sie höflich?', 'Vous voulez déplacer votre rendez-vous. Que dites-vous poliment ?')}`,
      [['Ich will einen anderen Termin.'], ['Könnten wir den Termin vielleicht verschieben?', true], ['Sie müssen den Termin verschieben.'], ['Wann hatten wir den Termin?']], 'b1-arbeit'),
    q('q10', `„Obwohl es seit dem Morgen regnet, findet der Ausflug statt.“ ${bi('Was ist richtig?', 'Qu’est-ce qui est juste ?')}`,
      [['Der Ausflug findet trotz des Regens statt.', true], ['Der Ausflug fällt wegen des Regens aus.'], ['Der Ausflug wird auf morgen verschoben.'], ['Am Morgen hat es nicht geregnet.']], 'b1-unterwegs'),
    q('q11', `„Ihr Laptop wird gerade in unserer Werkstatt repariert.“ ${bi('Was bedeutet das?', 'Qu’est-ce que cela signifie ?')}`,
      [['Der Laptop ist schon fertig.'], ['Sie müssen den Laptop selbst reparieren.'], ['Jemand repariert den Laptop im Moment.', true], ['Der Laptop wird morgen bestellt.']], 'b1-konsum'),
    q('q12', `Weißt du, … ${bi('Welcher Satz ist richtig?', 'Quelle phrase est correcte ?')}`,
      [['ob hat der Kurs noch freie Plätze?'], ['ob der Kurs noch freie Plätze hat?', true], ['ob der Kurs hat noch freie Plätze?'], ['der Kurs ob noch freie Plätze hat?']], 'b1-medien'),
    q('q13', `Wenn ich mehr Zeit …, würde ich öfter mit dem Rad zur Arbeit fahren. ${bi('Welche Form passt?', 'Quelle forme convient ?')}`,
      [['habe'], ['hatte'], ['gehabt'], ['hätte', true]], 'b1-umwelt'),
    q('q14', `Wir haben gestern einen … Abend im Theater verbracht. ${bi('Welche Form passt?', 'Quelle forme convient ?')}`,
      [['schöner'], ['schönes'], ['schönen', true], ['schöne']], 'b1-kultur'),
  ],
};

// ── Sons des évaluations ─────────────────────────────────────────────────────────────────────────────────────────────
// Voix variées (infra/content/tts/voices.json) : frau2, frau3, mann2 et mann3 (locuteurs MLS), sprecher et sprecherin.
// Répliques longues de préférence : les phrases très courtes sont les moins sûres en synthèse.
export const media = [
  { key: 'b1-bilan-hoeren-nachricht', kind: 'audio', title: 'Bilan B1 — message avant la prise de poste',
    script: [
      { voice: 'frau2', name: 'Aylin', text: 'Hallo Leon, hier ist Aylin vom Stadtteilbüro. Ich rufe an, weil sich an deinem ersten Arbeitstag am Montag etwas ändert. Eigentlich wollten wir uns um elf Uhr treffen, aber um halb zehn hat das ganze Team eine Besprechung, und da möchte ich dich gleich allen vorstellen. Kannst du deshalb schon um neun Uhr kommen? Ich warte dann unten am Eingang auf dich.' },
      { pause: 0.6 },
      { voice: 'frau2', name: 'Aylin', text: 'Bring bitte deinen Personalausweis mit. Den brauchst du für deine Zugangskarte, denn ohne Karte kommst du nicht ins Gebäude. Das Formular mit deinen Kontodaten hast du uns ja schon geschickt, das ist also erledigt. Nach der Besprechung zeige ich dir die Räume und deinen Arbeitsplatz. Und wenn du noch Fragen zu deinen Arbeitszeiten hast, können wir sie am Nachmittag in Ruhe klären.' },
      { pause: 0.6 },
      { voice: 'frau2', name: 'Aylin', text: 'Falls neun Uhr für dich nicht geht, schreib mir bitte heute noch eine kurze Nachricht. Ich freue mich auf Montag. Bis dann!' },
    ] },
  { key: 'b1-bilan-hoeren-gespraech', kind: 'audio', title: 'Bilan B1 — une correspondance manquée',
    script: [
      { voice: 'frau3', name: 'Rana', text: 'Paul, unsere Regionalbahn hat schon fünfzehn Minuten Verspätung. Den Anschluss in Halle schaffen wir auf keinen Fall mehr.' },
      { voice: 'mann3', name: 'Paul', text: 'Warte, ich schaue gerade in der App nach. In Halle fährt in vierzig Minuten ein Zug, der direkt nach Erfurt fährt. Dann müssen wir nicht mehr umsteigen, aber wir kommen ungefähr eine halbe Stunde später an als geplant.' },
      { voice: 'frau3', name: 'Rana', text: 'Eine halbe Stunde, das geht noch. Die Stadtführung um zwölf verpassen wir dann wahrscheinlich, aber Jana und Malte wollten ja erst um zwei Uhr essen gehen.' },
      { voice: 'mann3', name: 'Paul', text: 'Genau. Ich schreibe ihnen gleich, dass wir direkt ins Restaurant kommen. Die Stadtführung gibt es übrigens jeden Tag, die können wir auch morgen Vormittag machen.' },
      { voice: 'frau3', name: 'Rana', text: 'Gute Idee, dann machen wir das morgen. Und was ist mit unseren Fahrkarten? Müssen wir für den anderen Zug neue kaufen?' },
      { voice: 'mann3', name: 'Paul', text: 'Nein, wegen der Verspätung gelten unsere Fahrkarten auch im nächsten Zug. Wir müssen also nichts extra bezahlen.' },
      { voice: 'frau3', name: 'Rana', text: 'Wunderbar. Dann trinken wir in Halle in Ruhe noch einen Kaffee am Bahnhof.' },
    ] },
  { key: 'b1-bilan-sprechen-nachricht', kind: 'audio', title: 'Bilan B1 — message d’un camarade de cours',
    script: [
      { voice: 'mann2', name: 'Jonas', text: 'Hallo, hier ist Jonas aus dem Deutschkurs. Wir müssen ja nächste Woche zusammen unsere Präsentation halten. Ich würde sie gern vorher einmal mit dir üben. Wie wäre es mit Mittwoch um siebzehn Uhr in der Bibliothek? Dort gibt es kleine Räume für Gruppen.' },
      { pause: 0.6 },
      { voice: 'mann2', name: 'Jonas', text: 'Ach, und noch eine Frage, weil wir in der Präsentation über das Lernen sprechen: Was würdest du einer Person raten, die gerade erst mit Deutsch anfängt? Ruf mich doch zurück, dann können wir alles besprechen.' },
    ] },
  { key: 'b1-examen-hoeren-werkstatt', kind: 'audio', title: 'Examen blanc B1 — message d’un atelier de vélos',
    script: [
      { voice: 'frau2', name: 'Werkstatt', text: 'Guten Tag, hier ist Lena Hoff von der Fahrradwerkstatt am Ufer. Sie haben uns gestern wegen der Reparatur Ihres Fahrrads geschrieben. Das neue Teil für die Bremse ist heute angekommen, und wir können es am Donnerstag einbauen. Die Arbeit dauert ungefähr eine Stunde.' },
      { pause: 0.6 },
      { voice: 'frau2', name: 'Werkstatt', text: 'Sie können das Rad am Donnerstag ab acht Uhr bringen. Normalerweise ist es dann gegen zwölf Uhr fertig, weil wir an diesem Vormittag mehrere Räder prüfen. Wenn Sie es schon vor zehn Uhr zurückbrauchen, rufen Sie bitte am Mittwoch noch kurz an, dann reparieren wir Ihr Rad zuerst.' },
      { pause: 0.6 },
      { voice: 'frau2', name: 'Werkstatt', text: 'Falls der Donnerstag gar nicht passt, hätten wir am nächsten Montag noch einen Termin frei. Bitte antworten Sie uns per E-Mail und schreiben Sie, welchen Tag Sie nehmen. Vielen Dank und auf Wiederhören!' },
    ] },
  { key: 'b1-examen-hoeren-durchsage', kind: 'audio', title: 'Examen blanc B1 — annonce à une fête',
    script: [
      { voice: 'sprecher', name: 'Durchsage', text: 'Liebe Gäste, guten Tag und herzlich willkommen zum Sommerfest im Stadtpark! Wegen des starken Windes findet die erste Veranstaltung leider nicht draußen statt: Die Lesung um sechzehn Uhr wird in den großen Saal am Haupteingang verlegt. Ihre Eintrittskarte bleibt gültig.' },
      { pause: 0.5 },
      { voice: 'sprecher', name: 'Durchsage', text: 'Im Saal gibt es allerdings weniger Plätze als auf der Wiese, deshalb öffnen wir die Türen schon um halb vier. Das Konzert am Abend beginnt wie geplant um neunzehn Uhr auf der kleinen Bühne. Sollte sich daran etwas ändern, informieren wir Sie um achtzehn Uhr noch einmal.' },
      { pause: 0.5 },
      { voice: 'sprecher', name: 'Durchsage', text: 'Die Bastelwerkstatt für Kinder beginnt gleich neben dem Informationsstand. Dafür braucht man keine Karte, aber eine erwachsene Person muss die ganze Zeit dabeibleiben. Wir wünschen Ihnen einen schönen Nachmittag!' },
    ] },
  { key: 'b1-examen-hoeren-interview', kind: 'audio', title: 'Examen blanc B1 — entretien à la radio du quartier',
    script: [
      { voice: 'mann2', name: 'Tim', text: 'Willkommen zurück bei Radio Lindenviertel. Bei mir im Studio ist Eva Nieber. Frau Nieber, Sie haben in Ihrem Haus einen Tauschschrank aufgestellt. Wie funktioniert das?' },
      { voice: 'frau3', name: 'Eva', text: 'Ganz einfach: Wer etwas nicht mehr braucht, stellt es in den Schrank, und wer dort etwas Schönes findet, nimmt es mit. Bezahlen muss niemand. Am Anfang waren es vor allem Bücher, inzwischen kommen auch Spiele und Küchensachen dazu.' },
      { voice: 'mann2', name: 'Tim', text: 'Und wer darf den Schrank im Moment benutzen?' },
      { voice: 'frau3', name: 'Eva', text: 'Bisher nur die Leute aus unserem Haus. Der Schrank steht im Treppenhaus, und fast jeden Tag bringt jemand etwas Neues.' },
      { voice: 'mann2', name: 'Tim', text: 'Viele Hörerinnen und Hörer möchten gern mitmachen. Wollen Sie den Schrank für das ganze Viertel öffnen?' },
      { voice: 'frau3', name: 'Eva', text: 'Darüber haben wir im Haus lange gesprochen. Ich finde die Idee gut, aber dann müsste der Schrank nach draußen, und vor dem Haus ist es im Winter zu feucht. Eine Nachbarin hat deshalb vorgeschlagen, zuerst einen Tauschabend im Gemeinschaftsraum zu organisieren.' },
      { voice: 'mann2', name: 'Tim', text: 'Steht der Termin für diesen Tauschabend schon fest?' },
      { voice: 'frau3', name: 'Eva', text: 'Ja, am ersten Freitag im Dezember, ab achtzehn Uhr. Alle aus dem Viertel sind herzlich eingeladen. Wenn genug Leute kommen, suchen wir danach gemeinsam einen Platz für einen größeren Schrank, vielleicht in der Bibliothek.' },
    ] },
  { key: 'b1-examen-sprechen-planen', kind: 'audio', title: 'Examen blanc B1 — proposition d’un voisin',
    script: [
      { voice: 'mann3', name: 'Daniel', text: 'Hallo, hier ist Daniel aus dem zweiten Stock. In unserem Haus wohnen seit diesem Monat drei neue Familien, und ich würde sie gern zusammen mit dir willkommen heißen. Mein Vorschlag: ein kleines Treffen am Samstag um fünfzehn Uhr im Gemeinschaftsraum, mit Kaffee und Kuchen.' },
      { pause: 1.2 },
      { voice: 'mann3', name: 'Daniel', text: 'Ach, ich sehe gerade im Kalender der Hausverwaltung, dass der Gemeinschaftsraum am Samstag schon reserviert ist. Hast du eine andere Idee, wo oder wann wir das machen könnten? Und wer bringt was mit? Ruf mich bitte zurück.' },
    ] },
  { key: 'b1-examen-sprechen-frage', kind: 'audio', title: 'Examen blanc B1 — question après la présentation',
    script: [
      { voice: 'sprecherin', name: 'Prüferin', text: 'Vielen Dank für Ihre Präsentation. Ich habe noch eine Frage dazu: Was würden Sie ändern, damit mehr Menschen bei so etwas mitmachen?' },
    ] },
];

const audio = (key, caption) => ({ media: key, usage: 'audio', caption, transcriptVisibility: 'hidden' });

// ── Bilan intermédiaire : 60 min, modules 1 à 12 ─────────────────────────────────────────────────────────────────────
const midterm = {
  kind: 'midterm', title: level.midtermTitle, description: level.midtermDescription,
  parts: [
    { id: 'bilan-lesen', competence: 'lecture', mode: 'closed', title: 'Lecture : un courriel et un témoignage',
      instructions: `${bi('Lesen Sie die zwei Texte und lösen Sie die Aufgaben 1 bis 8.', 'Lisez les deux textes et répondez aux questions 1 à 8.')}
${bi('Zu jeder Aufgabe gibt es nur eine richtige Lösung. Zeit: etwa 15 Minuten.', 'Pour chaque question, une seule réponse est juste. Durée : environ 15 minutes.')}

TEXT 1 · E-MAIL
[fr] Texte 1 : un courriel

Betreff: Abendkurs Deutsch B1 – neuer Kursraum ab Montag

Liebe Teilnehmende,

ab nächster Woche findet unser Abendkurs an einem anderen Ort statt. Im Bildungszentrum wird der Aufzug repariert, und die Arbeiten dauern voraussichtlich drei Wochen. Damit alle den Kursraum erreichen können, ziehen wir so lange in die Stadtbibliothek in der Lindenstraße um. Der Kurs beginnt dort wie immer um 18.30 Uhr.

Bitte beachten Sie: Der Haupteingang der Bibliothek schließt um 19 Uhr. Unsere Kursleiterin, Frau Brandt, wartet bis 19.15 Uhr an der Seitentür im Hof. Wer später kommt, ruft bitte die Nummer an, die in der ersten Kursmail steht.

Das Kursbuch brauchen Sie weiterhin. Wer noch kein eigenes Buch hat, kann in der Bibliothek ein Exemplar für eine Woche ausleihen. Schreiben Sie uns bitte bis Freitag, ob Sie ein Buch brauchen, damit wir genug Exemplare reservieren können.

Für den neuen Raum müssen Sie sich nicht noch einmal anmelden. Sobald der Aufzug wieder funktioniert, informieren wir Sie per E-Mail.

Viele Grüße
Ihr Team vom Bildungszentrum Nord

TEXT 2 · ERFAHRUNGSBERICHT
[fr] Texte 2 : un témoignage

Mein neuer Weg zur Arbeit – von Nina, 34

Seit drei Wochen fahre ich mit dem Bus zur Arbeit. Vorher bin ich jeden Morgen mit dem Fahrrad gefahren, denn bis zu unserem alten Büro waren es nur zwanzig Minuten. Als meine Firma im Herbst in einen anderen Stadtteil umgezogen ist, wollte ich eigentlich beim Rad bleiben. Aber die neue Strecke führt über eine große Kreuzung, an der gerade gebaut wird. Dort gibt es im Moment keinen Radweg, und das war mir zu gefährlich.

Im Bus brauche ich zehn Minuten länger. Dafür kann ich unterwegs meine Nachrichten lesen oder einfach aus dem Fenster schauen. Nur wenn der Bus sehr voll ist, finde ich die Fahrt anstrengend.

Letzte Woche hat mir eine Kollegin erzählt, dass es am Fluss einen ruhigen Radweg gibt. Er ist zwar etwas länger, aber man muss keine einzige Hauptstraße überqueren. Am Samstag will sie ihn mir zeigen. Wenn mir der Weg gefällt, fahre ich bei schönem Wetter wieder mit dem Rad. An Tagen, an denen ich schwere Unterlagen mitnehmen muss, nehme ich aber weiter den Bus. So kann ich jeden Morgen neu entscheiden.`,
      questions: [
        q('q1', bi('Text 1: Warum findet der Kurs an einem anderen Ort statt?', 'Texte 1 : pourquoi le cours a-t-il lieu ailleurs ?'),
          [['Weil die Gruppe zu groß geworden ist.'], ['Weil im Bildungszentrum der Aufzug repariert wird.', true], ['Weil die Bibliothek bessere Kursräume hat.']]),
        q('q2', bi('Text 1: Was ändert sich für die Teilnehmenden?', 'Texte 1 : qu’est-ce qui change pour les participants ?'),
          [['Der Ort des Kurses.', true], ['Die Uhrzeit des Kurses.'], ['Die Kursleiterin.']]),
        q('q3', bi('Text 1: Eine Teilnehmerin kommt um 19.20 Uhr. Was soll sie tun?', 'Texte 1 : une participante arrive à 19 h 20. Que doit-elle faire ?'),
          [['Zur Seitentür im Hof gehen.'], ['Am Haupteingang auf Frau Brandt warten.'], ['Die Nummer aus der ersten Kursmail anrufen.', true]]),
        q('q4', bi('Text 1: Wer soll bis Freitag antworten?', 'Texte 1 : qui doit répondre avant vendredi ?'),
          [['Alle, die ein Buch brauchen.', true], ['Alle, die später kommen.'], ['Alle, die sich neu anmelden möchten.']]),
        rf('q5', 'Text 2: Ninas Firma ist im Herbst in einen anderen Stadtteil gezogen.', 0),
        rf('q6', 'Text 2: Nina fährt nicht mehr Rad, weil die neue Strecke zu lang ist.', 1),
        rf('q7', 'Text 2: Ninas Kollegin fährt jeden Tag am Fluss entlang zur Arbeit.', 2),
        rf('q8', 'Text 2: Der Radweg am Fluss ist kürzer als die neue Strecke.', 1),
      ],
      criteria: [], placements: [] },
    { id: 'bilan-hoeren', competence: 'ecoute', mode: 'closed', title: 'Écoute : un message et une conversation',
      instructions: [
        bi('Sie hören zwei Texte: eine Nachricht auf der Mailbox und ein Gespräch.', 'Vous allez entendre deux documents : un message sur une boîte vocale et une conversation.'),
        bi('Lesen Sie zuerst die Aufgaben. Hören Sie dann jeden Text zweimal.', 'Lisez d’abord les questions, puis écoutez chaque document deux fois.'),
        bi('Die Aufgaben 1 bis 4 gehören zu Text 1, die Aufgaben 5 bis 8 zu Text 2.', 'Les questions 1 à 4 portent sur le document 1, les questions 5 à 8 sur le document 2.'),
        bi('Zu jeder Aufgabe gibt es nur eine richtige Lösung. Zeit: etwa 15 Minuten.', 'Pour chaque question, une seule réponse est juste. Durée : environ 15 minutes.'),
      ].join('\n'),
      questions: [
        q('q1', bi('Text 1: Warum soll Leon früher kommen?', 'Document 1 : pourquoi Leon doit-il venir plus tôt ?'),
          [['Weil Aylin am Vormittag keine Zeit hat.'], ['Weil er zuerst ein Formular ausfüllen muss.'], ['Weil Aylin ihn dem ganzen Team vorstellen möchte.', true]]),
        q('q2', bi('Text 1: Wann soll Leon am Montag da sein?', 'Document 1 : à quelle heure Leon doit-il être là lundi ?'),
          [['Um 9 Uhr.', true], ['Um halb zehn.'], ['Um 11 Uhr.']]),
        q('q3', bi('Text 1: Was muss Leon mitbringen?', 'Document 1 : que doit apporter Leon ?'),
          [['Das Formular mit seinen Kontodaten.'], ['Seinen Personalausweis.', true], ['Seine Zugangskarte.']]),
        q('q4', bi('Text 1: Was soll Leon tun, wenn er um neun Uhr nicht kommen kann?', 'Document 1 : que doit faire Leon s’il ne peut pas venir à 9 h ?'),
          [['Am Montagmorgen im Büro anrufen.'], ['Am Nachmittag kommen.'], ['Aylin noch heute eine Nachricht schreiben.', true]]),
        q('q5', bi('Text 2: Warum können Rana und Paul nicht wie geplant weiterfahren?', 'Document 2 : pourquoi Rana et Paul ne peuvent-ils pas continuer comme prévu ?'),
          [['Ihr Zug hat Verspätung, deshalb verpassen sie den Anschluss.', true], ['Der Zug nach Erfurt fällt heute aus.'], ['Sie haben ihre Fahrkarten vergessen.']]),
        q('q6', bi('Text 2: Wo treffen sie ihre Freunde?', 'Document 2 : où retrouvent-ils leurs amis ?'),
          [['Am Bahnhof in Erfurt.'], ['Im Restaurant.', true], ['Bei der Stadtführung.']]),
        q('q7', bi('Text 2: Was machen sie mit der Stadtführung?', 'Document 2 : que décident-ils pour la visite guidée ?'),
          [['Sie machen sie nach dem Essen.'], ['Sie sagen sie ganz ab.'], ['Sie machen sie am nächsten Vormittag.', true]]),
        q('q8', bi('Text 2: Was sagt Paul über die Fahrkarten?', 'Document 2 : que dit Paul des billets ?'),
          [['Sie gelten auch im nächsten Zug.', true], ['Sie müssen neue Fahrkarten kaufen.'], ['Sie bekommen ihr Geld zurück.']]),
      ],
      criteria: [],
      placements: [audio('b1-bilan-hoeren-nachricht', 'Text 1: eine Nachricht auf der Mailbox'), audio('b1-bilan-hoeren-gespraech', 'Text 2: ein Gespräch im Zug')] },
    { id: 'bilan-schreiben', competence: 'expression-ecrite', mode: 'written', title: 'Écrit : déplacer un rendez-vous par courriel',
      instructions: `SITUATION
[fr] Situation
${bi('Sie haben am Dienstag um 11 Uhr einen Termin in der Stadtbibliothek: Sie möchten dort Ihren Bibliotheksausweis abholen.', 'Vous avez rendez-vous mardi à 11 h à la bibliothèque municipale pour y retirer votre carte de lecteur.')}
${bi('Ihr Arbeitgeber hat Sie gebeten, an diesem Vormittag zu arbeiten.', 'Votre employeur vous a demandé de travailler ce matin-là.')}

AUFGABE
[fr] Tâche
${bi('Schreiben Sie eine E-Mail an die Bibliothek (80 bis 100 Wörter).', 'Écrivez un courriel à la bibliothèque (80 à 100 mots).')}
• ${bi('Nennen Sie Ihren Termin.', 'Rappelez votre rendez-vous.')}
• ${bi('Erklären Sie kurz, warum Sie nicht kommen können.', 'Expliquez brièvement pourquoi vous ne pouvez pas venir.')}
• ${bi('Schlagen Sie zwei andere Termine vor.', 'Proposez deux autres créneaux.')}
• ${bi('Fragen Sie, welche Unterlagen Sie mitbringen müssen.', 'Demandez quels documents vous devez apporter.')}

${bi('Denken Sie an die Anrede, den Gruß und die Sie-Form. Zeit: etwa 20 Minuten.', 'Pensez à la formule d’appel, à la salutation et au vouvoiement. Durée : environ 20 minutes.')}`,
      questions: [],
      criteria: grid(GRIDS.b1.schreiben, [2, 2, 2, 2], {
        aufgabe: 'Tâche : les quatre points sont traités en 80 à 100 mots, registre formel (Sie) et formules du courriel respectés',
      }),
      placements: [] },
    { id: 'bilan-sprechen', competence: 'expression-orale', mode: 'oral', title: 'Oral : convenir d’un rendez-vous et donner un conseil',
      instructions: `${bi('Hören Sie die Nachricht von Jonas aus Ihrem Deutschkurs. Antworten Sie ihm dann mit einer Sprachnachricht.', 'Écoutez le message de Jonas, de votre cours d’allemand, puis répondez-lui par un message vocal.')}
${bi('Sie können sich ein paar Notizen machen, aber lesen Sie keinen fertigen Text vor.', 'Vous pouvez prendre quelques notes, mais ne lisez pas un texte entièrement rédigé.')}
${bi('Nehmen Sie alles in einem Stück auf: 2 bis 3 Minuten. Zeit mit Vorbereitung: etwa 10 Minuten.', 'Enregistrez-vous en une seule fois : 2 à 3 minutes. Durée, préparation comprise : environ 10 minutes.')}

TEIL 1 · EINEN TERMIN FINDEN
[fr] Partie 1 : trouver un rendez-vous (environ 1 minute)
• ${bi('Reagieren Sie auf den Vorschlag von Jonas: Am Mittwoch um 17 Uhr können Sie nicht. Sagen Sie, warum.', 'Réagissez à la proposition de Jonas : mercredi à 17 h, vous ne pouvez pas. Dites pourquoi.')}
• ${bi('Schlagen Sie einen anderen Tag, eine Uhrzeit und einen Ort vor.', 'Proposez un autre jour, une heure et un lieu.')}
• ${bi('Sagen Sie, was Sie zum Üben mitbringen.', 'Dites ce que vous apportez pour vous entraîner.')}

TEIL 2 · EINEN RAT GEBEN
[fr] Partie 2 : donner un conseil (environ 1 à 2 minutes)
• ${bi('Antworten Sie auf die Frage von Jonas: Was raten Sie einer Person, die gerade mit Deutsch anfängt?', 'Répondez à la question de Jonas : que conseillez-vous à une personne qui commence l’allemand ?')}
• ${bi('Erzählen Sie dazu von Ihrer eigenen Erfahrung und geben Sie zwei Tipps mit Begründung.', 'Appuyez-vous sur votre propre expérience et donnez deux conseils justifiés.')}
• ${bi('Beenden Sie die Nachricht freundlich.', 'Terminez le message aimablement.')}`,
      questions: [],
      criteria: grid(GRIDS.b1.sprechen, [2, 2, 1, 2, 1]),
      placements: [audio('b1-bilan-sprechen-nachricht', 'Die Nachricht von Jonas')] },
  ],
};

// ── Examen blanc : 120 min, tout le niveau ───────────────────────────────────────────────────────────────────────────
const final = {
  kind: 'final', title: level.finalTitle, description: level.finalDescription,
  parts: [
    { id: 'examen-lesen', competence: 'lecture', mode: 'closed', title: 'Lecture : un article, deux offres de cours et un forum',
      instructions: `${bi('Lesen Sie die drei Texte und lösen Sie die Aufgaben 1 bis 10.', 'Lisez les trois textes et répondez aux questions 1 à 10.')}
${bi('Zu jeder Aufgabe gibt es nur eine richtige Lösung. Zeit: etwa 35 Minuten.', 'Pour chaque question, une seule réponse est juste. Durée : environ 35 minutes.')}

TEXT 1 · AUS DER STADTTEILZEITUNG
[fr] Texte 1 : un article du journal de quartier

Dinge gemeinsam nutzen

Seit dem Frühjahr kann man in der Stadtbibliothek Nord nicht nur Bücher und Spiele ausleihen, sondern auch Werkzeuge. Die Idee kam von einer Gruppe aus dem Reparaturcafé. Den Ehrenamtlichen war aufgefallen, dass viele Besucher eine Bohrmaschine besitzen, die sie nur ein paar Minuten im Jahr benutzen. „Warum soll jeder Haushalt teure Geräte kaufen, die fast das ganze Jahr im Keller liegen?“, fragt Ole Hansen vom Reparaturcafé. „Teilen spart Geld und Platz, und es ist besser für die Umwelt.“

Wer ein Werkzeug braucht, prüft mit seiner Bibliothekskarte online, ob es frei ist, und reserviert es. Abholen muss man es aber an der Theke, denn dort erklären die Mitarbeitenden, wie man das Gerät sicher benutzt und zurückgibt. Die Ausleihe ist kostenlos und dauert höchstens eine Woche. Wer ein Gerät zu spät zurückbringt, darf einen Monat lang keine Werkzeuge mehr ausleihen.

Das Angebot ist noch klein. Besonders gefragt sind Werkzeugkoffer und Messgeräte; davon will die Bibliothek zuerst mehr kaufen. Gartengeräte kommen erst später dazu, weil im Lager im Moment der Platz fehlt. Im nächsten Monat können die Nutzer in einer Umfrage weitere Wünsche nennen.

TEXT 2 · ZWEI KURSE NACH DER ARBEIT
[fr] Texte 2 : deux offres de cours

Angebot A: An zwei Samstagen (10 bis 15 Uhr) lernen Sie, kurze Videos für Ihren Verein zu drehen. Ein eigenes Gerät brauchen Sie nicht, die Kursleitung bringt Tablets mit. Die Gruppe hat höchstens acht Personen. Am zweiten Samstag zeigen alle ihr Video. Melden Sie sich bitte nur an, wenn Sie an beiden Tagen Zeit haben.

Angebot B: Der Onlinekurs findet an vier Mittwochabenden statt (19 bis 20.30 Uhr). Sie lernen, Fotos für eine Webseite auszuwählen und vorzubereiten. Sie brauchen einen eigenen Computer. Wenn Sie einen Abend verpassen, können Sie die Aufzeichnung eine Woche lang ansehen. In der letzten Stunde bespricht die Kursleiterin mit jeder Person ein eigenes Foto.

Beide Kurse kosten 60 Euro.

TEXT 3 · FORUM: MUSIK AM SAMSTAGABEND?
[fr] Texte 3 : un forum

Mara: Die Konzerte auf dem Marktplatz machen unser Viertel lebendiger. Ich verstehe aber, dass Leute, die früh arbeiten, Ruhe brauchen. Deshalb würde ich die Konzerte eine Stunde früher beginnen lassen. Dann könnten auch Familien mit Kindern länger bleiben.

Emre: Ich wohne direkt am Platz und höre die Musik sogar bei geschlossenen Fenstern. Trotzdem möchte ich die Konzerte nicht ganz streichen. Ein Teil könnte im Bürgerhaus stattfinden. Dann wäre es draußen ruhiger, und bei Regen hätte man trotzdem einen Ort.

Jonas: Ich spiele selbst in einer Band und finde es schade, dass immer nur über die Lautstärke gesprochen wird. Für junge Leute gibt es am Wochenende sonst kaum Angebote im Viertel. Vielleicht könnte der Verein vor der neuen Saison ein Treffen mit den Nachbarn organisieren, damit alle ihre Wünsche sagen können.

Die Redaktion sammelt Ihre Vorschläge bis Donnerstag und gibt sie am Freitag an den Kulturverein weiter. Der Verein entscheidet im nächsten Monat über die Orte.`,
      questions: [
        q('q1', bi('Text 1: Von wem kam die Idee?', 'Texte 1 : de qui est venue l’idée ?'),
          [['Von den Mitarbeitenden der Bibliothek.'], ['Von einer Gruppe aus dem Reparaturcafé.', true], ['Von den Teilnehmenden einer Umfrage.']]),
        q('q2', bi('Text 1: Warum muss man die Werkzeuge an der Theke abholen?', 'Texte 1 : pourquoi faut-il retirer les outils au comptoir ?'),
          [['Weil man dort erklärt bekommt, wie man das Gerät benutzt.', true], ['Weil man sie dort bezahlen muss.'], ['Weil man sie online nicht reservieren kann.']]),
        q('q3', bi('Text 1: Was gilt für die Ausleihe?', 'Texte 1 : quelle règle s’applique au prêt ?'),
          [['Man kann die Geräte einen Monat behalten.'], ['Sie ist nur für Mitglieder des Reparaturcafés.'], ['Sie kostet nichts und dauert höchstens eine Woche.', true]]),
        q('q4', bi('Text 1: Warum gibt es noch keine Gartengeräte?', 'Texte 1 : pourquoi n’y a-t-il pas encore d’outils de jardin ?'),
          [['Weil im Lager der Platz fehlt.', true], ['Weil niemand sie ausleihen möchte.'], ['Weil die Umfrage noch nicht fertig ist.']]),
        q('q5', bi('Text 2: Lukas möchte Videos drehen, aber er hat kein Tablet und keine Kamera. Welches Angebot passt?', 'Texte 2 : Lukas veut tourner des vidéos, mais il n’a ni tablette ni caméra. Quelle offre lui convient ?'),
          [['Angebot B.'], ['Angebot A.', true], ['Keines von beiden.']]),
        q('q6', bi('Text 2: Sara muss manchmal mittwochs bis 21 Uhr arbeiten. Was ist für sie bei Angebot B wichtig?', 'Texte 2 : Sara doit parfois travailler le mercredi jusqu’à 21 h. Qu’est-ce qui compte pour elle dans l’offre B ?'),
          [['Sie kann am Samstag nachkommen.'], ['Sie bekommt einen Computer von der Kursleitung.'], ['Sie kann die Aufzeichnung später ansehen.', true]]),
        q('q7', bi('Text 2: Was ist bei beiden Angeboten gleich?', 'Texte 2 : qu’est-ce qui est identique dans les deux offres ?'),
          [['Die Zahl der Termine.'], ['Der Preis.', true], ['Das Gerät, das man braucht.']]),
        q('q8', bi('Text 3: Was schlägt Mara vor?', 'Texte 3 : que propose Mara ?'),
          [['Die Konzerte früher beginnen zu lassen.', true], ['Nur noch Konzerte für Familien zu machen.'], ['Den Platz am Samstagabend zu schließen.']]),
        q('q9', bi('Text 3: Was möchte Emre?', 'Texte 3 : que souhaite Emre ?'),
          [['Alle Konzerte absagen.'], ['Ein Dach über den Platz bauen.'], ['Einen Teil der Konzerte ins Bürgerhaus verlegen.', true]]),
        q('q10', bi('Text 3: Wann wird über die Orte entschieden?', 'Texte 3 : quand décidera-t-on des lieux ?'),
          [['Am Donnerstag.'], ['Im nächsten Monat.', true], ['Am Freitag.']]),
      ],
      criteria: [], placements: [] },
    { id: 'examen-hoeren', competence: 'ecoute', mode: 'closed', title: 'Écoute : un message, une annonce et un entretien à la radio',
      instructions: [
        bi('Sie hören drei Texte: eine Nachricht auf dem Anrufbeantworter, eine Durchsage auf einem Fest und ein Interview im Radio.', 'Vous allez entendre trois documents : un message sur un répondeur, une annonce lors d’une fête et un entretien à la radio.'),
        bi('Lesen Sie vor jedem Text die Aufgaben. Hören Sie jeden Text zweimal.', 'Lisez les questions avant chaque document. Écoutez chaque document deux fois.'),
        bi('Die Aufgaben 1 bis 3 gehören zu Text 1, die Aufgaben 4 bis 6 zu Text 2 und die Aufgaben 7 bis 10 zu Text 3.', 'Les questions 1 à 3 portent sur le document 1, les questions 4 à 6 sur le document 2, les questions 7 à 10 sur le document 3.'),
        bi('Zu jeder Aufgabe gibt es nur eine richtige Lösung. Zeit: etwa 25 Minuten.', 'Pour chaque question, une seule réponse est juste. Durée : environ 25 minutes.'),
      ].join('\n'),
      questions: [
        q('q1', bi('Text 1: Warum ruft die Werkstatt an?', 'Document 1 : pourquoi l’atelier appelle-t-il ?'),
          [['Um ein neues Fahrrad anzubieten.'], ['Um einen Termin für die Reparatur vorzuschlagen.', true], ['Um nach einem fehlenden Teil zu fragen.']]),
        q('q2', bi('Text 1: Was muss man tun, wenn man das Rad schon vor 10 Uhr braucht?', 'Document 1 : que faut-il faire si l’on a besoin du vélo avant 10 h ?'),
          [['Am Mittwoch anrufen.', true], ['Am Montag kommen.'], ['Das Rad schon am Mittwoch bringen.']]),
        q('q3', bi('Text 1: Was soll man der Werkstatt per E-Mail mitteilen?', 'Document 1 : que faut-il indiquer à l’atelier par courriel ?'),
          [['Wie viel die Reparatur kosten darf.'], ['Wann man das Rad abholen möchte.'], ['Welchen Tag man für die Reparatur wählt.', true]]),
        q('q4', bi('Text 2: Welche Veranstaltung findet an einem anderen Ort statt?', 'Document 2 : quel événement change de lieu ?'),
          [['Das Konzert am Abend.'], ['Die Lesung um 16 Uhr.', true], ['Die Bastelwerkstatt für Kinder.']]),
        q('q5', bi('Text 2: Warum öffnet der Saal schon um halb vier?', 'Document 2 : pourquoi la salle ouvre-t-elle dès 15 h 30 ?'),
          [['Weil es dort weniger Plätze gibt.', true], ['Weil die Lesung früher beginnt.'], ['Weil man dort neue Karten kaufen muss.']]),
        q('q6', bi('Text 2: Was gilt für die Bastelwerkstatt?', 'Document 2 : quelle règle s’applique à l’atelier pour enfants ?'),
          [['Man braucht eine Eintrittskarte.'], ['Sie beginnt erst um 18 Uhr.'], ['Ein Erwachsener muss die ganze Zeit dabei sein.', true]]),
        q('q7', bi('Text 3: Wer kann den Tauschschrank im Moment benutzen?', 'Document 3 : qui peut utiliser l’armoire d’échange en ce moment ?'),
          [['Alle Leute aus dem Viertel.'], ['Die Bewohner des Hauses.', true], ['Nur die Mitglieder eines Vereins.']]),
        q('q8', bi('Text 3: Was findet man inzwischen im Schrank?', 'Document 3 : que trouve-t-on désormais dans l’armoire ?'),
          [['Bücher, Spiele und Küchensachen.', true], ['Nur Bücher.'], ['Vor allem Kleidung.']]),
        q('q9', bi('Text 3: Warum stellt man den Schrank nicht einfach vor das Haus?', 'Document 3 : pourquoi ne pas simplement installer l’armoire devant l’immeuble ?'),
          [['Weil die Nachbarn dagegen sind.'], ['Weil der Schrank zu groß ist.'], ['Weil es dort im Winter zu feucht ist.', true]]),
        q('q10', bi('Text 3: Was ist der nächste Schritt?', 'Document 3 : quelle est la prochaine étape ?'),
          [['Ein Tauschabend im Gemeinschaftsraum.', true], ['Ein größerer Schrank in der Bibliothek.'], ['Ein Treffen im Radiostudio.']]),
      ],
      criteria: [],
      placements: [
        audio('b1-examen-hoeren-werkstatt', 'Text 1: eine Nachricht auf dem Anrufbeantworter'),
        audio('b1-examen-hoeren-durchsage', 'Text 2: eine Durchsage auf dem Sommerfest'),
        audio('b1-examen-hoeren-interview', 'Text 3: ein Interview im Radio'),
      ] },
    { id: 'examen-schreiben', competence: 'expression-ecrite', mode: 'written', title: 'Écrit : un courriel et une contribution à un forum',
      instructions: `${bi('Schreiben Sie zwei Texte. Schreiben Sie beide Texte in das Feld unten, zuerst Aufgabe 1, dann Aufgabe 2.', 'Écrivez deux textes, tous deux dans le champ ci-dessous : d’abord la tâche 1, puis la tâche 2.')}
${bi('Zeit: etwa 40 Minuten. Planen Sie am Ende 5 Minuten zum Korrigieren ein.', 'Durée : environ 40 minutes. Gardez 5 minutes à la fin pour vous relire.')}

AUFGABE 1 · E-MAIL (ETWA 20 MINUTEN)
[fr] Tâche 1 : un courriel (environ 20 minutes)
${bi('Sie haben sich für einen Fotokurs am Samstag angemeldet. Jetzt hat der Kursleiter, Herr Brück, den Termin auf Freitag verschoben, aber freitags arbeiten Sie.', 'Vous êtes inscrit à un cours de photo le samedi. Le formateur, M. Brück, a déplacé la séance au vendredi, mais vous travaillez le vendredi.')}
${bi('Schreiben Sie Herrn Brück eine E-Mail (100 bis 120 Wörter).', 'Écrivez un courriel à M. Brück (100 à 120 mots).')}
• ${bi('Nennen Sie Ihre Anmeldung.', 'Rappelez votre inscription.')}
• ${bi('Erklären Sie Ihr Problem.', 'Expliquez votre problème.')}
• ${bi('Schlagen Sie eine Lösung vor.', 'Proposez une solution.')}
• ${bi('Bitten Sie um eine Bestätigung.', 'Demandez une confirmation.')}

AUFGABE 2 · FORUMSBEITRAG (ETWA 15 MINUTEN)
[fr] Tâche 2 : une contribution à un forum (environ 15 minutes)
${bi('Im Forum Ihrer Stadt lesen Sie die Frage: „Sollte die Stadtbibliothek auch am Sonntag öffnen?“', 'Sur le forum de votre ville, vous lisez la question : « La bibliothèque municipale devrait-elle ouvrir aussi le dimanche ? »')}
${bi('Schreiben Sie Ihre Meinung (80 bis 100 Wörter).', 'Donnez votre avis (80 à 100 mots).')}
• ${bi('Sagen Sie klar, was Sie denken, und begründen Sie Ihre Meinung.', 'Dites clairement ce que vous pensez et justifiez votre avis.')}
• ${bi('Geben Sie ein Beispiel aus Ihrem Alltag.', 'Donnez un exemple tiré de votre quotidien.')}
• ${bi('Antworten Sie kurz auf ein Gegenargument.', 'Répondez brièvement à un argument contraire.')}`,
      questions: [],
      criteria: grid(GRIDS.b1.schreiben, [3, 2, 2, 3], {
        aufgabe: 'Tâche : les deux textes traitent tous les points, destinataire et registre (Sie au formateur, ton du forum) respectés',
      }),
      placements: [] },
    { id: 'examen-sprechen', competence: 'expression-orale', mode: 'oral', title: 'Oral : planifier, présenter, réagir',
      instructions: `${bi('Die mündliche Prüfung hat drei Teile. Nehmen Sie alles in einem Stück auf: 5 bis 6 Minuten.', 'L’épreuve orale compte trois parties. Enregistrez-vous en une seule fois : 5 à 6 minutes.')}
${bi('Bereiten Sie sich etwa 10 Minuten vor und machen Sie Notizen, aber lesen Sie keinen fertigen Text vor.', 'Préparez-vous environ 10 minutes en prenant des notes, mais ne lisez pas un texte entièrement rédigé.')}
${bi('Mit einem Partner aus dem Kurs können Sie Teil 1 auch zu zweit spielen und gemeinsam aufnehmen.', 'Avec un partenaire du cours, vous pouvez aussi jouer la partie 1 à deux et l’enregistrer ensemble.')}

TEIL 1 · GEMEINSAM ETWAS PLANEN
[fr] Partie 1 : organiser quelque chose ensemble (environ 2 minutes)
${bi('Hören Sie die Nachricht von Daniel, Ihrem Nachbarn. Sie wollen zusammen die neuen Familien im Haus willkommen heißen.', 'Écoutez le message de Daniel, votre voisin. Vous voulez accueillir ensemble les nouvelles familles de l’immeuble.')}
• ${bi('Reagieren Sie auf das Problem mit dem Raum und machen Sie einen neuen Vorschlag: Ort und Uhrzeit.', 'Réagissez au problème de salle et faites une nouvelle proposition : lieu et heure.')}
• ${bi('Sagen Sie, was Sie mitbringen, und fragen Sie, was Daniel übernimmt.', 'Dites ce que vous apportez et demandez ce dont Daniel se charge.')}
• ${bi('Fassen Sie am Ende zusammen, was Sie vereinbart haben.', 'Résumez pour finir ce que vous avez convenu.')}

TEIL 2 · EIN THEMA PRÄSENTIEREN
[fr] Partie 2 : présenter un thème (environ 3 minutes)
${bi('Wählen Sie ein Thema: A „In einem Verein mitmachen – lohnt sich das?“ oder B „Online lernen oder im Kurs?“', 'Choisissez un thème : A « S’engager dans une association, est-ce que cela vaut la peine ? » ou B « Apprendre en ligne ou en cours ? »')}
• ${bi('Stellen Sie Ihr Thema vor und erzählen Sie von Ihrer Erfahrung.', 'Présentez votre thème et racontez votre expérience.')}
• ${bi('Beschreiben Sie die Situation in Ihrem Heimatland.', 'Décrivez la situation dans votre pays d’origine.')}
• ${bi('Nennen Sie Vor- und Nachteile und sagen Sie Ihre Meinung.', 'Citez des avantages et des inconvénients, puis donnez votre avis.')}
• ${bi('Beenden Sie die Präsentation mit einem kurzen Schluss.', 'Terminez la présentation par une courte conclusion.')}

TEIL 3 · AUF EINE FRAGE REAGIEREN
[fr] Partie 3 : réagir à une question (environ 1 minute)
${bi('Hören Sie die Frage der Prüferin nach Ihrer Präsentation und antworten Sie mit zwei oder drei Sätzen.', 'Écoutez la question de l’examinatrice après votre présentation et répondez en deux ou trois phrases.')}`,
      questions: [],
      criteria: grid(GRIDS.b1.sprechen, [2, 2, 2, 2, 2]),
      placements: [audio('b1-examen-sprechen-planen', 'Teil 1: die Nachricht von Daniel'), audio('b1-examen-sprechen-frage', 'Teil 3: die Frage der Prüferin')] },
  ],
};

export const assessments = [midterm, final];
