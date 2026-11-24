// Évaluations du niveau B2 (lot M2, plan B §2.5 et annexe modules « Évaluations B2 ») : Eingangstest (diagnostic),
// Zwischenbilanz (bilan intermédiaire, après le module 12) et Probeprüfung (examen blanc, après le module 24), avec leurs
// sons. Mêmes formes que level.json ; consignes et énoncés en allemand avec l'aide française repliée (« allemand [fr?]
// français »). Textes, dialogues et tâches originaux LinguaCap : les formats d'examen B2 sont imités (types de documents
// et de tâches : article, forum, interview, exposé, contribution d'opinion, courriel formel, exposé et discussion), jamais
// copiés d'un modèle officiel.
//
// Poids des compétences : comme en A1, A2 et B1, chaque compétence pèse autant dans la note (Évaluations additionne les
// points par compétence, ExamRules). Une question fermée vaut un point ; les grilles d'écrit et d'oral reprennent les
// critères de GRIDS.b2 (mêmes identifiants et libellés) avec des points ramenés au nombre de questions d'une compétence
// fermée : 8 points par compétence à la Zwischenbilanz, 10 à la Probeprüfung (lecture en deux parties de 5 questions).
// Voix : Kerstin (frau, sprecherin) et Thorsten (mann, sprecher), et leurs variantes de hauteur frau2, frau3, mann2, mann3.
// Les titres et descriptions de la Zwischenbilanz et de la Probeprüfung viennent de _level.mjs.
import { GRIDS, aide } from '../../lib.mjs';
import level from './_level.mjs';

/** Question à choix : options dans l'ordre donné, la bonne marquée par true (sa place varie d'une question à l'autre). */
const q = (id, prompt, options, moduleRef) => ({
  id, ...(moduleRef ? { moduleRef } : {}), prompt,
  options: options.map(([label, correct = false], index) => ({ id: 'abcd'[index], label, correct })),
});
/** Grille d'une production : critères de GRIDS.b2, points répartis pour l'égalité des compétences, libellé adaptable. */
const grid = (criteria, points, labels = {}) => criteria.map((criterion, index) => ({
  id: criterion.id, label: labels[criterion.id] ?? criterion.label, maxPoints: points[index],
}));
const RF = ['Richtig', 'Falsch', 'Steht nicht im Text'];
/** « Richtig / falsch / steht nicht im Text » : answer = 0, 1 ou 2. */
const rf = (id, statement, answer) => q(id, `${statement} ${aide('Richtig, falsch oder steht nicht im Text?', 'Vrai, faux ou non mentionné dans le texte ?')}`,
  RF.map((label, index) => [label, index === answer]));
/** « Wer sagt das? » : les quatre auteurs du forum, dans un ordre fixe ; answer = rang de la bonne réponse. */
const FORUM = ['Sabine', 'Malte', 'Paula', 'Rafael'];
const wer = (id, de, fr, answer) => q(id, aide(de, fr), FORUM.map((name, index) => [name, index === answer]));

// ── Eingangstest (diagnostic) ────────────────────────────────────────────────────────────────────────────────────────
// 14 questions : 6 sur les acquis du niveau B1 (moduleRef « prerequis ») puis 8 rattachées aux thèmes 1, 2, 3, 6, 7, 8, 10
// et 12 (structure du thème : la bonne forme ou le bon sens).
export const diagnostic = {
  title: 'Eingangstest B2',
  description: [
    aide('Dieser Test dauert etwa 15 Minuten und zählt nicht für Ihre Note.', 'Ce test dure environ 15 minutes et ne compte pas dans votre note.'),
    aide('Zuerst prüft er, ob Ihre B1-Kenntnisse sicher sind: Konjunktiv II, Passiv, Relativsätze, Konnektoren und Genitiv.',
      'Il vérifie d’abord que vos acquis du niveau B1 sont solides : subjonctif II, passif, relatives, connecteurs et génitif.'),
    aide('Dann zeigt er, was Sie in den Themen des B2-Kurses schon können.', 'Il situe ensuite votre niveau dans les thèmes du parcours B2.'),
    aide('Antworten Sie ohne Hilfe und ohne Wörterbuch. Das Ergebnis schlägt einen Startpunkt im Kurs vor; wenn Sie eine Lehrkraft haben, bestätigt sie ihn.',
      'Répondez sans aide ni dictionnaire. Le résultat propose un point de départ dans le parcours ; si un professeur vous suit, c’est lui qui le confirme.'),
  ].join('\n'),
  questions: [
    q('q1', `Wenn der Zug pünktlich …, wären wir jetzt schon in Hamburg. ${aide('Welche Form passt?', 'Quelle forme convient ?')}`,
      [['ist'], ['wäre', true], ['war'], ['sei']], 'prerequis'),
    q('q2', `Der Antrag muss bis Ende des Monats … werden. ${aide('Welche Form passt?', 'Quelle forme convient ?')}`,
      [['einreichen'], ['einzureichen'], ['eingereichte'], ['eingereicht', true]], 'prerequis'),
    q('q3', `Das ist die Kollegin, … ich jeden Morgen zur Arbeit fahre. ${aide('Was passt?', 'Qu’est-ce qui convient ?')}`,
      [['mit der', true], ['mit die'], ['der mit'], ['mit dem']], 'prerequis'),
    q('q4', `Er spricht … Französisch … Spanisch, aber kein Italienisch. ${aide('Welche Konnektoren passen?', 'Quels connecteurs conviennent ?')}`,
      [['weder … noch'], ['entweder … oder'], ['sowohl … als auch', true], ['zwar … aber']], 'prerequis'),
    q('q5', `Die Wohnung ist hell und ruhig. … haben wir sie nicht genommen: Die Miete war uns zu hoch. ${aide('Welches Wort passt?', 'Quel mot convient ?')}`,
      [['Deshalb'], ['Obwohl'], ['Weil'], ['Trotzdem', true]], 'prerequis'),
    q('q6', `Wegen … Streiks fielen gestern viele Züge aus. ${aide('Welche Form passt?', 'Quelle forme convient ?')}`,
      [['des', true], ['dem'], ['den'], ['der']], 'prerequis'),
    q('q7', `Wenn ich mich früher beworben …, hätte ich die Stelle bekommen. ${aide('Welche Form passt?', 'Quelle forme convient ?')}`,
      [['habe'], ['hatte'], ['hätte', true], ['wäre']], 'b2-lebenswege'),
    q('q8', `„Dieses Problem lässt sich leicht lösen.“ ${aide('Was bedeutet der Satz?', 'Que signifie la phrase ?')}`,
      [['Man lässt das Problem von jemandem lösen.'], ['Man kann das Problem leicht lösen.', true], ['Man muss das Problem schnell lösen.'], ['Man hat das Problem leicht gelöst.']], 'b2-arbeitswelt'),
    q('q9', `„die im letzten Jahr eröffnete Bibliothek“ ${aide('Was bedeutet das?', 'Qu’est-ce que cela signifie ?')}`,
      [['die Bibliothek, die im nächsten Jahr eröffnet werden soll'], ['die Bibliothek, die im letzten Jahr eröffnen wollte'],
        ['die Bibliothek, die man jedes Jahr neu eröffnet'], ['die Bibliothek, die im letzten Jahr eröffnet worden ist', true]], 'b2-bildung'),
    q('q10', `In der Zeitung steht: „Der Bürgermeister erklärte, die Stadt habe kein Geld für ein neues Schwimmbad.“ ${aide('Was zeigt die Form „habe“?', 'Que montre la forme « habe » ?')}`,
      [['Die Zeitung gibt wieder, was der Bürgermeister gesagt hat.', true], ['Die Zeitung ist sicher, dass die Stadt kein Geld hat.'],
        ['Die Stadt hatte früher einmal kein Geld.'], ['Der Bürgermeister wünscht sich mehr Geld.']], 'b2-medien'),
    q('q11', `„Wo bleibt Jana?“ – „Sie … den Zug verpasst haben.“ ${aide('Welche Form drückt eine Vermutung aus?', 'Quelle forme exprime une supposition ?')}`,
      [['hat'], ['wird', true], ['ist'], ['wurde']], 'b2-umwelt'),
    q('q12', `Der Verkäufer tut so, als … er uns nicht hören. ${aide('Welches Wort passt?', 'Quel mot convient ?')}`,
      [['ob'], ['wenn'], ['hätte'], ['würde', true]], 'b2-wirtschaft'),
    q('q13', `… sich im Verein engagieren möchte, ist bei uns herzlich willkommen. ${aide('Welches Wort passt?', 'Quel mot convient ?')}`,
      [['Wer', true], ['Der'], ['Was'], ['Wen']], 'b2-gesellschaft'),
    q('q14', `In der Sitzung hat die Kollegin das Problem endlich zur Sprache … ${aide('Welches Verb passt?', 'Quel verbe convient ?')}`,
      [['gestellt'], ['gebracht', true], ['genommen'], ['gegeben']], 'b2-zusammenleben'),
  ],
};

// ── Sons des évaluations ─────────────────────────────────────────────────────────────────────────────────────────────
// Répliques longues de préférence (les phrases très courtes sont les moins sûres en synthèse) ; nombres en toutes lettres.
export const media = [
  { key: 'b2-bilan-hoeren-interview', kind: 'audio', title: 'Zwischenbilanz B2 — interview sur le sommeil',
    script: [
      { voice: 'mann2', name: 'Moderator', text: 'Guten Abend und willkommen bei „Wissen am Abend“. Fast jeder zweite Erwachsene schläft schlecht, liest man immer wieder. Bei mir im Studio ist die Schlafforscherin Katrin Lohse. Frau Lohse, stimmt diese Zahl?' },
      { voice: 'frau', name: 'Frau Lohse', text: 'Falsch ist sie nicht, aber sie klingt dramatischer, als die Lage ist. Viele Menschen schlafen ab und zu schlecht, etwa vor einer Prüfung oder nach einem Streit. Das ist völlig normal. Ein echtes Problem ist es erst, wenn jemand über Wochen mindestens dreimal pro Woche schlecht schläft und sich tagsüber erschöpft fühlt.' },
      { voice: 'mann2', name: 'Moderator', text: 'Viele machen das Handy dafür verantwortlich. Zu Recht?' },
      { voice: 'frau', name: 'Frau Lohse', text: 'Zum Teil. Das blaue Licht der Bildschirme spielt eine geringere Rolle, als man lange dachte. Viel wichtiger ist, was wir am Bildschirm tun. Wer im Bett noch berufliche E-Mails liest oder in sozialen Netzwerken diskutiert, bleibt innerlich in Alarmbereitschaft. Der Körper ist müde, aber der Kopf arbeitet weiter.' },
      { voice: 'mann2', name: 'Moderator', text: 'Gilt das auch für Jugendliche? Viele Eltern klagen ja, dass ihre Kinder abends nicht ins Bett finden.' },
      { voice: 'frau', name: 'Frau Lohse', text: 'Bei Jugendlichen kommt etwas hinzu: Ihre innere Uhr ist in der Pubertät nach hinten verschoben. Sie werden abends später müde, müssen aber morgens genauso früh in die Schule. Das Handy verstärkt dieses Problem, aber es verursacht es nicht.' },
      { voice: 'mann2', name: 'Moderator', text: 'Was raten Sie also? Das Handy ganz aus dem Schlafzimmer verbannen?' },
      { voice: 'frau', name: 'Frau Lohse', text: 'Das wäre ideal, ist aber für viele unrealistisch. Ich empfehle eine Art Pufferzone: Die letzte halbe Stunde vor dem Schlafengehen gehört Dingen, die beruhigen, zum Beispiel einem Buch oder ruhiger Musik.' },
      { voice: 'frau', name: 'Frau Lohse', text: 'Und wer nachts aufwacht, sollte auf keinen Fall auf die Uhr schauen. Sonst fängt man an zu rechnen, wie wenig Schlaf noch bleibt, und das macht erst recht wach.' },
      { voice: 'mann2', name: 'Moderator', text: 'Und wenn das alles nicht hilft?' },
      { voice: 'frau', name: 'Frau Lohse', text: 'Dann sollte man nicht monatelang warten, sondern zur Hausärztin oder zum Hausarzt gehen. Schlafstörungen lassen sich heute gut behandeln, meistens sogar ohne Medikamente.' },
      { voice: 'mann2', name: 'Moderator', text: 'Frau Lohse, vielen Dank für das Gespräch.' },
    ] },
  { key: 'b2-bilan-hoeren-nachricht', kind: 'audio', title: 'Zwischenbilanz B2 — message d’un centre de formation',
    script: [
      { voice: 'mann3', name: 'Herr Falk', text: 'Guten Tag, Frau Okafor, hier spricht Ruben Falk vom Weiterbildungszentrum am Stadtpark. Es geht um Ihren Kurs „Projekte leiten im Team“, der am kommenden Dienstag beginnen sollte. Leider ist die Kursleiterin noch bis Ende der Woche krank.' },
      { voice: 'mann3', name: 'Herr Falk', text: 'Wir haben uns deshalb entschieden, den Kurs nicht zu verschieben, sondern die ersten beiden Abende online stattfinden zu lassen. Den Link bekommen Sie am Montag per E-Mail. Ab dem dritten Termin treffen wir uns dann wie geplant im Raum zweihundertvier.' },
      { pause: 0.5 },
      { voice: 'mann3', name: 'Herr Falk', text: 'Die Unterlagen für den ersten Abend finden Sie schon jetzt auf unserer Lernplattform. Bitte lesen Sie vor allem das erste Kapitel, denn darauf baut die Kursleiterin direkt auf.' },
      { voice: 'mann3', name: 'Herr Falk', text: 'Falls Sie an einem Onlinekurs nicht teilnehmen können, melden Sie sich bitte bis Freitag bei mir. Dann buchen wir Sie kostenlos in den nächsten Kurs im Frühjahr um. Vielen Dank für Ihr Verständnis und auf Wiederhören.' },
    ] },
  { key: 'b2-bilan-sprechen-frage', kind: 'audio', title: 'Zwischenbilanz B2 — question de l’animatrice',
    script: [
      { voice: 'frau3', name: 'Moderatorin', text: 'Vielen Dank für Ihren Vortrag. Eine Frage hätte ich noch: Wer sollte Ihrer Meinung nach die Weiterbildung bezahlen, die Beschäftigten selbst oder die Arbeitgeber? Und warum?' },
    ] },
  { key: 'b2-examen-hoeren-meldung', kind: 'audio', title: 'Probeprüfung B2 — nouvelle régionale à la radio',
    script: [
      { voice: 'sprecherin', name: 'Nachrichten', text: 'Und nun zu den Meldungen aus der Region. Wer ein kaputtes Elektrogerät reparieren lässt, statt ein neues zu kaufen, bekommt ab dem ersten März Geld von der Stadt. Der Stadtrat hat gestern Abend einen sogenannten Reparaturbonus beschlossen.' },
      { voice: 'sprecherin', name: 'Nachrichten', text: 'Die Stadt übernimmt die Hälfte der Reparaturkosten, höchstens aber hundert Euro pro Gerät und Jahr. Gefördert werden Reparaturen in Fachbetrieben, aber auch in ehrenamtlichen Reparaturtreffs. Die Rechnung muss innerhalb von drei Monaten online eingereicht werden.' },
      { voice: 'sprecherin', name: 'Nachrichten', text: 'Smartphones und Laptops sind ausgeschlossen, weil es dafür bereits ein Förderprogramm des Landes gibt. Für das erste Jahr stellt die Stadt zweihunderttausend Euro bereit; ist das Geld aufgebraucht, endet die Förderung vorzeitig.' },
      { voice: 'sprecherin', name: 'Nachrichten', text: 'Kritik kam vom Handelsverband. Er befürchtet, dass der Bonus vor allem Menschen nützt, die ihre Geräte ohnehin reparieren lassen.' },
    ] },
  { key: 'b2-examen-hoeren-interview', kind: 'audio', title: 'Probeprüfung B2 — entretien avec une traductrice',
    script: [
      { voice: 'mann', name: 'Moderator', text: 'Frau Ortmann, Sie übersetzen seit zwanzig Jahren Romane aus dem Französischen und dem Spanischen. Viele Leute denken: Das erledigt heute doch eine Maschine. Haben Sie Angst um Ihren Beruf?' },
      { voice: 'frau2', name: 'Frau Ortmann', text: 'Angst wäre übertrieben, aber ich mache mir Gedanken. Für Gebrauchstexte, also Bedienungsanleitungen oder Geschäftsbriefe, sind die Programme inzwischen erstaunlich gut. Bei Literatur sieht das anders aus. Ein Roman lebt von seinem Klang, von Anspielungen, von Humor. Eine Maschine übersetzt Wörter, ich übersetze eine Stimme.' },
      { voice: 'mann', name: 'Moderator', text: 'Was heißt das konkret? Können Sie ein Beispiel aus Ihrer Arbeit nennen?' },
      { voice: 'frau2', name: 'Frau Ortmann', text: 'Nehmen Sie ein Wortspiel. Wenn eine Figur mit zwei Bedeutungen eines französischen Wortes spielt, gibt es im Deutschen fast nie ein Wort mit denselben zwei Bedeutungen. Dann muss ich ein neues Wortspiel erfinden, das an derselben Stelle dieselbe Wirkung hat. Das kann Tage dauern, für einen einzigen Satz.' },
      { voice: 'mann', name: 'Moderator', text: 'Wie lange brauchen Sie denn für einen ganzen Roman?' },
      { voice: 'frau2', name: 'Frau Ortmann', text: 'Für ein Buch von dreihundert Seiten etwa vier Monate, wenn alles gut geht. Am Anfang war es fast ein Jahr. Ich lese jeden Roman zweimal, bevor ich den ersten Satz übersetze, denn ich muss wissen, wohin die Geschichte führt.' },
      { voice: 'mann', name: 'Moderator', text: 'Arbeiten Sie trotzdem mit solchen Programmen?' },
      { voice: 'frau2', name: 'Frau Ortmann', text: 'Für die Recherche schon, etwa wenn ich wissen will, wie ein Fachbegriff aus dem Segeln heißt. Für den Text selbst nicht. Einige Verlage verlangen inzwischen, dass wir maschinelle Rohübersetzungen nur noch überarbeiten.' },
      { voice: 'frau2', name: 'Frau Ortmann', text: 'Das wird schlechter bezahlt, dauert aber oft fast genauso lange, weil man ständig gegen die Formulierungen der Maschine anschreiben muss.' },
      { voice: 'mann', name: 'Moderator', text: 'Was würden Sie jungen Menschen raten, die diesen Beruf ergreifen wollen?' },
      { voice: 'frau2', name: 'Frau Ortmann', text: 'Lesen, lesen, lesen, und zwar vor allem in der eigenen Sprache. Viele glauben, das Wichtigste sei die Fremdsprache. Dabei scheitern die meisten Übersetzungen am Deutschen, nicht am Original.' },
    ] },
  { key: 'b2-examen-hoeren-vortrag', kind: 'audio', title: 'Probeprüfung B2 — exposé sur l’oubli',
    script: [
      { voice: 'sprecher', name: 'Referent', text: 'Meine Damen und Herren, die meisten von uns ärgern sich über das Vergessen. Wir vergessen Namen, Passwörter und den Grund, warum wir gerade in die Küche gegangen sind. Heute möchte ich Ihnen zeigen, dass Vergessen kein Fehler unseres Gehirns ist, sondern eine wichtige Leistung.' },
      { voice: 'sprecher', name: 'Referent', text: 'Schon im neunzehnten Jahrhundert hat man in Experimenten festgestellt, dass wir neu Gelerntes besonders schnell wieder vergessen, vor allem in den ersten Stunden danach. Lange hat man daraus geschlossen, dass das Gedächtnis eben unzuverlässig ist.' },
      { voice: 'sprecher', name: 'Referent', text: 'Die heutige Forschung sieht das anders: Das Gehirn sortiert aktiv aus. Was wir nicht wiederholen und nicht brauchen, wird nach und nach abgebaut.' },
      { pause: 0.6 },
      { voice: 'sprecher', name: 'Referent', text: 'Warum ist das sinnvoll? Stellen Sie sich vor, Sie würden sich an jeden Parkplatz erinnern, den Sie in Ihrem Leben benutzt haben. Wenn Sie heute Ihr Auto suchen, fielen Ihnen hunderte alte Parkplätze ein, und der richtige ginge darin unter. Vergessen schafft also Ordnung: Es hilft uns, Wichtiges von Unwichtigem zu trennen.' },
      { voice: 'sprecher', name: 'Referent', text: 'Es gibt übrigens tatsächlich Menschen, die fast nichts vergessen können. Sie erleben ihr Gedächtnis aber nicht als Geschenk, sondern als Belastung: Jede alte Kränkung ist für sie so frisch wie am ersten Tag.' },
      { pause: 0.6 },
      { voice: 'sprecher', name: 'Referent', text: 'Was folgt daraus für das Lernen? Erstens: Wer etwas behalten will, sollte es nicht einmal lange, sondern mehrmals mit Pausen wiederholen. Zweitens: Es lohnt sich, sich selbst abzufragen, statt einen Text nur noch einmal zu lesen.' },
      { voice: 'sprecher', name: 'Referent', text: 'Und drittens: Schlafen Sie genug. Im Schlaf entscheidet das Gehirn, welche Erinnerungen es festigt und welche es aufgibt.' },
    ] },
  { key: 'b2-examen-sprechen-diskussion-a', kind: 'audio', title: 'Probeprüfung B2 — avis d’un collègue (centres-villes sans voitures)',
    script: [
      { voice: 'mann3', name: 'Kollege', text: 'Also, ich halte autofreie Innenstädte für eine schöne Idee, aber für unrealistisch. Viele Menschen vom Land haben gar keine andere Möglichkeit, als mit dem Auto in die Stadt zu fahren, zum Beispiel zum Arzt oder zum Einkaufen.' },
      { voice: 'mann3', name: 'Kollege', text: 'Außerdem würden die Geschäfte in der Innenstadt noch mehr Kunden an die großen Einkaufszentren am Stadtrand verlieren. Bevor man Autos verbietet, sollte man erst einmal Busse und Bahnen verbessern. Wie sehen Sie das?' },
    ] },
  { key: 'b2-examen-sprechen-diskussion-b', kind: 'audio', title: 'Probeprüfung B2 — avis d’une collègue (argent liquide)',
    script: [
      { voice: 'frau2', name: 'Kollegin', text: 'Ehrlich gesagt finde ich Bargeld längst überholt. Ich bezahle fast alles mit dem Handy, das geht schneller und ist bequemer. Für die Geschäfte ist es außerdem günstiger, weil sie kein Geld mehr zählen und zur Bank bringen müssen.' },
      { voice: 'frau2', name: 'Kollegin', text: 'Wer heute noch auf Bargeld besteht, bremst meiner Meinung nach den Fortschritt. Wie sehen Sie das?' },
    ] },
  { key: 'b2-examen-sprechen-frage', kind: 'audio', title: 'Probeprüfung B2 — question de l’examinatrice',
    script: [
      { voice: 'sprecherin', name: 'Prüferin', text: 'Vielen Dank. Eine letzte Frage noch: Was müsste sich ändern, damit Ihr Vorschlag auch von Menschen akzeptiert wird, die ganz anderer Meinung sind als Sie?' },
    ] },
];

const audio = (key, caption) => ({ media: key, usage: 'audio', caption, transcriptVisibility: 'hidden' });

// ── Zwischenbilanz : 75 min, modules 1 à 12 ──────────────────────────────────────────────────────────────────────────
const midterm = {
  kind: 'midterm', title: level.midtermTitle, description: level.midtermDescription,
  parts: [
    { id: 'bilan-lesen', competence: 'lecture', mode: 'closed', title: 'Leseverstehen: ein Zeitungsartikel',
      instructions: `${aide('Lesen Sie den Artikel und lösen Sie die Aufgaben 1 bis 8. Zu jeder Aufgabe gibt es nur eine richtige Lösung.', 'Lisez l’article et répondez aux questions 1 à 8. Pour chaque question, une seule réponse est juste.')}
${aide('Lesen Sie zuerst den Titel und den ersten Absatz: Worum geht es? Zeit: etwa 20 Minuten.', 'Lisez d’abord le titre et le premier paragraphe : de quoi s’agit-il ? Durée : environ 20 minutes.')}

Zurück aufs Land – dank Homeoffice?

Als Mareike Henning vor drei Jahren mit ihrer Familie nach Lindtal zog, eine gute Zugstunde von der Großstadt entfernt, hielten viele Freunde sie für verrückt. „Alle dachten, wir kämen nach einem Winter zurück“, erzählt die 41-Jährige. Ihre Stelle bei einer Versicherung hat sie behalten: An drei Tagen pro Woche arbeitet sie im ehemaligen Kinderzimmer, an zwei Tagen pendelt sie mit dem Zug ins Büro. Die Miete für das Haus mit Garten ist niedriger als früher für die Dreizimmerwohnung in der Stadt.

Familien wie die Hennings gibt es inzwischen in vielen Regionen. Seit immer mehr Beschäftigte zumindest teilweise von zu Hause aus arbeiten dürfen, ziehen manche dorthin, wo Wohnraum noch bezahlbar ist. Für kleine Gemeinden, die jahrzehntelang Einwohner verloren haben, ist das eine Chance. In Lindtal ist die Grundschule, die vor fünf Jahren geschlossen werden sollte, heute wieder voll, und im alten Bahnhofsgebäude hat ein Gemeinschaftsbüro eröffnet, in dem man Schreibtische tageweise mieten kann.

Bürgermeisterin Bettina Thormann freut sich über die neuen Nachbarn, sieht die Entwicklung aber nicht nur positiv. „Wer zuzieht, bringt Kaufkraft und Ideen mit. Aber viele sitzen tagsüber am Bildschirm und kaufen abends im Internet ein. Ob der Bäcker im Ort davon etwas hat, ist noch offen.“ Außerdem seien die Grundstückspreise in zwei Jahren um fast ein Drittel gestiegen. Junge Leute aus dem Ort könnten sich ein eigenes Haus kaum noch leisten.

Manche Zugezogene bringen sich auch im Ort ein. Tobias Henning, Mareikes Mann, trainiert inzwischen die Kinder im Fußballverein, und eine Grafikerin aus der Stadt hat die Internetseite der Gemeinde neu gestaltet, ehrenamtlich. Doch nicht überall gelingt das Zusammenleben so gut. In Nachbardörfern klagen Alteingesessene, die Neuen suchten zwar die Ruhe auf dem Land, beschwerten sich dann aber über krähende Hähne und den Lärm der Traktoren.

Die Stadtsoziologin Selma Arslan warnt davor, von einer großen Bewegung aufs Land zu sprechen. „Die meisten, die umziehen, bleiben im Umland der Städte, weil sie trotz Homeoffice regelmäßig ins Büro müssen.“ Wirklich abgelegene Dörfer profitierten nur, wenn zwei Voraussetzungen erfüllt seien: schnelles Internet und eine verlässliche Verbindung mit Bus oder Bahn. „Fehlt eines davon, ziehen die Neuen nach ein paar Jahren wieder weg.“

Auch die Hennings haben nicht alles vorhergesehen. Ohne Auto geht im Dorf wenig, am Wochenende fährt der Bus nur dreimal am Tag. Und als im letzten Winter das Internet eine Woche lang ausfiel, musste Mareike Henning jeden Tag in die Stadt fahren. Bereut hat sie den Umzug trotzdem nicht: „Wir haben weniger Auswahl, aber mehr Zeit. Wenn ich morgens nicht im Stau stehe, sondern mit den Kindern frühstücke, weiß ich, warum wir hier sind.“`,
      questions: [
        q('q1', aide('Worum geht es in dem Artikel vor allem?', 'De quoi l’article parle-t-il surtout ?'),
          [['um die Gründe, warum Firmen das Homeoffice wieder abschaffen'], ['um die Geschichte des Dorfes Lindtal und seines Bahnhofs'],
            ['um die Frage, ob das Homeoffice kleinen Gemeinden wirklich hilft', true], ['um Familien, die in der Großstadt eine Wohnung suchen']]),
        q('q2', aide('Was hat sich in Lindtal durch die neuen Einwohner verändert?', 'Qu’est-ce qui a changé à Lindtal grâce aux nouveaux habitants ?'),
          [['Die Grundschule hat wieder genug Kinder.', true], ['Am Bahnhof halten wieder mehr Züge.'], ['Der Bäcker verkauft deutlich mehr als früher.'], ['Im Ort wurde eine neue Schule gebaut.']]),
        q('q3', aide('Wie sieht die Bürgermeisterin die Entwicklung?', 'Comment la maire voit-elle cette évolution ?'),
          [['Sie lehnt sie ab, weil sich die Neuen nicht für das Dorf interessieren.'], ['Sie ist begeistert, weil die Geschäfte im Ort mehr verdienen.'],
            ['Sie ist enttäuscht, weil nur wenige Familien gekommen sind.'], ['Sie begrüßt sie, sieht aber auch Nachteile für die Einheimischen.', true]]),
        q('q4', aide('Unter welcher Bedingung profitieren abgelegene Dörfer laut Selma Arslan?', 'À quelle condition, selon Selma Arslan, les villages isolés en profitent-ils ?'),
          [['wenn die Grundstücke dort noch lange billig bleiben'], ['wenn sie gutes Internet und gute Verbindungen haben', true], ['wenn Firmen ihre Büros ganz aufs Land verlegen'], ['wenn die Neuen auch im Ort einkaufen']]),
        rf('q5', 'Mareike Henning arbeitet heute ausschließlich von zu Hause aus.', 1),
        rf('q6', 'Laut Selma Arslan ziehen die meisten in Dörfer weit weg von der Stadt.', 1),
        rf('q7', 'Im Gemeinschaftsbüro arbeiten vor allem Menschen aus der Großstadt.', 2),
        rf('q8', 'Trotz einiger Schwierigkeiten ist Mareike Henning mit ihrer Entscheidung zufrieden.', 0),
      ],
      criteria: [], placements: [] },
    { id: 'bilan-hoeren', competence: 'ecoute', mode: 'closed', title: 'Hörverstehen: ein Interview und eine Nachricht',
      instructions: [
        aide('Sie hören zwei Texte: ein Interview im Radio und eine Nachricht auf der Mailbox.', 'Vous allez entendre deux documents : une interview à la radio et un message sur une boîte vocale.'),
        aide('Lesen Sie zuerst die Aufgaben. Sie können jeden Text zweimal hören.', 'Lisez d’abord les questions. Vous pouvez écouter chaque document deux fois.'),
        aide('Die Aufgaben 1 bis 5 gehören zu Text 1, die Aufgaben 6 bis 8 zu Text 2. Zeit: etwa 15 Minuten.', 'Les questions 1 à 5 portent sur le document 1, les questions 6 à 8 sur le document 2. Durée : environ 15 minutes.'),
      ].join('\n'),
      questions: [
        q('q1', aide('Text 1: Was sagt Frau Lohse über die Zahl, die der Moderator nennt?', 'Document 1 : que dit Mme Lohse du chiffre cité par l’animateur ?'),
          [['Sie ist nach ihrer Erfahrung viel zu niedrig.'], ['Sie stammt aus einer sehr alten Studie.'], ['Sie stimmt, klingt aber zu dramatisch.', true], ['Sie gilt nur für Menschen mit viel Stress.']]),
        q('q2', aide('Text 1: Wann spricht Frau Lohse von einem echten Schlafproblem?', 'Document 1 : quand Mme Lohse parle-t-elle d’un vrai problème de sommeil ?'),
          [['wenn man über Wochen schlecht schläft und tagsüber müde ist', true], ['wenn man vor einer wichtigen Prüfung nicht einschlafen kann'],
            ['wenn man jede Nacht mindestens einmal aufwacht'], ['wenn man weniger als sieben Stunden pro Nacht schläft']]),
        q('q3', aide('Text 1: Was ist laut Frau Lohse am Handy vor dem Schlafen vor allem problematisch?', 'Document 1 : qu’est-ce qui pose surtout problème avec le portable avant de dormir, selon Mme Lohse ?'),
          [['das blaue Licht, das den Körper noch lange wach hält'], ['der kleine Bildschirm, der die Augen schnell müde macht'],
            ['die Nachrichten, die man mitten in der Nacht bekommt'], ['was man am Bildschirm tut, zum Beispiel arbeiten', true]]),
        q('q4', aide('Text 1: Was empfiehlt Frau Lohse?', 'Document 1 : que recommande Mme Lohse ?'),
          [['beim Aufwachen auszurechnen, wie viel Schlaf noch bleibt'], ['vor dem Schlafen eine halbe Stunde zur Ruhe zu kommen', true],
            ['nachts sofort aufzustehen und etwas zu lesen'], ['im Schlafzimmer jedes Licht auszuschalten']]),
        q('q5', aide('Text 1: Was sollte man tun, wenn diese Tipps nicht helfen?', 'Document 1 : que faut-il faire si ces conseils n’aident pas ?'),
          [['zuerst ein paar Monate abwarten'], ['ein Medikament gegen Schlafstörungen nehmen'], ['an einer Studie zum Schlaf teilnehmen'], ['bald eine Ärztin oder einen Arzt fragen', true]]),
        q('q6', aide('Text 2: Warum findet der Kurs anders statt als geplant?', 'Document 2 : pourquoi le cours ne se déroule-t-il pas comme prévu ?'),
          [['Weil der Raum 204 renoviert wird.'], ['Weil die Kursleiterin krank ist.', true], ['Weil sich zu wenige Personen angemeldet haben.'], ['Weil die Lernplattform nicht funktioniert.']]),
        q('q7', aide('Text 2: Was soll Frau Okafor vor dem ersten Abend tun?', 'Document 2 : que doit faire Mme Okafor avant la première séance ?'),
          [['das erste Kapitel der Unterlagen lesen', true], ['sich rechtzeitig auf der Lernplattform anmelden'], ['den Link zum Kurs anfordern'], ['die Kursgebühr überweisen']]),
        q('q8', aide('Text 2: Was bietet Herr Falk an, falls Frau Okafor nicht online teilnehmen kann?', 'Document 2 : que propose M. Falk si Mme Okafor ne peut pas suivre le cours en ligne ?'),
          [['Sie bekommt eine Aufnahme der beiden Abende.'], ['Sie bekommt ihr Geld sofort zurück.'], ['Sie wechselt ohne Kosten in einen späteren Kurs.', true], ['Sie kommt erst ab dem dritten Abend.']]),
      ],
      criteria: [],
      placements: [audio('b2-bilan-hoeren-interview', 'Text 1: ein Interview im Radio'), audio('b2-bilan-hoeren-nachricht', 'Text 2: eine Nachricht auf der Mailbox')] },
    { id: 'bilan-schreiben', competence: 'expression-ecrite', mode: 'written', title: 'Schriftlicher Ausdruck: ein Forumsbeitrag',
      instructions: `SITUATION
${aide('Im Onlineforum einer Stadtzeitschrift wird diskutiert: „Homeoffice für alle – sollten Arbeitgeber es allen Beschäftigten erlauben, deren Arbeit es zulässt?“', 'Sur le forum en ligne d’un magazine municipal, on débat : « Le télétravail pour tous : les employeurs devraient-ils l’autoriser à tous les salariés dont le travail le permet ? »')}

AUFGABE
${aide('Schreiben Sie einen Beitrag für das Forum (etwa 150 Wörter).', 'Écrivez une contribution pour le forum (environ 150 mots).')}
• ${aide('Nehmen Sie klar Stellung.', 'Prenez clairement position.')}
• ${aide('Begründen Sie Ihre Meinung mit zwei Argumenten und einem Beispiel.', 'Justifiez votre avis par deux arguments et un exemple.')}
• ${aide('Gehen Sie auf ein mögliches Gegenargument ein.', 'Répondez à un argument contraire possible.')}
• ${aide('Schließen Sie mit einem Fazit oder einem Vorschlag.', 'Terminez par une conclusion ou une proposition.')}

${aide('Achten Sie auf Absätze, passende Konnektoren und einen sachlichen Ton. Zeit: etwa 25 Minuten.', 'Soignez les paragraphes, les connecteurs et le ton objectif. Durée : environ 25 minutes.')}`,
      questions: [],
      criteria: grid(GRIDS.b2.schreiben, [2, 2, 2, 2], {
        aufgabe: aide('Aufgabenerfüllung: klare Stellungnahme, Argumente mit Beispiel, Gegenargument, Fazit',
          'Tâche : position claire, arguments et exemple, argument contraire, conclusion'),
      }),
      placements: [] },
    { id: 'bilan-sprechen', competence: 'expression-orale', mode: 'oral', title: 'Mündlicher Ausdruck: Kurzvortrag und Rückfrage',
      instructions: `SITUATION
${aide('Ihre Sprachschule produziert einen Podcast. Sie halten darin einen kurzen Vortrag zum Thema „Lebenslanges Lernen: Muss man im Beruf ständig Neues lernen?“.', 'Votre école de langues produit un podcast. Vous y faites un court exposé sur le thème « Apprendre tout au long de la vie : faut-il sans cesse apprendre du nouveau dans son métier ? ».')}
${aide('Bereiten Sie sich etwa 8 Minuten vor. Überlegen Sie sich Stichwörter, aber lesen Sie keinen fertigen Text vor.', 'Préparez-vous environ 8 minutes. Réfléchissez à des mots-clés, mais ne lisez pas un texte entièrement rédigé.')}
${aide('Nehmen Sie alles in einem Stück auf: 3 bis 4 Minuten.', 'Enregistrez-vous en une seule fois : 3 à 4 minutes.')}

TEIL 1 · KURZVORTRAG (ETWA 3 MINUTEN)
• ${aide('Führen Sie in das Thema ein und erzählen Sie von einer eigenen Erfahrung.', 'Introduisez le thème et racontez une expérience personnelle.')}
• ${aide('Nennen Sie Vor- und Nachteile ständiger Weiterbildung.', 'Citez des avantages et des inconvénients de la formation continue permanente.')}
• ${aide('Vergleichen Sie mit der Situation in Ihrem Heimatland.', 'Comparez avec la situation dans votre pays d’origine.')}
• ${aide('Sagen Sie Ihre Meinung, begründen Sie sie und kommen Sie zu einem Schluss.', 'Donnez votre avis, justifiez-le et concluez.')}

TEIL 2 · AUF EINE RÜCKFRAGE REAGIEREN (ETWA 1 MINUTE)
${aide('Hören Sie die Frage der Moderatorin und antworten Sie mit einigen begründeten Sätzen.', 'Écoutez la question de l’animatrice et répondez en quelques phrases argumentées.')}`,
      questions: [],
      criteria: grid(GRIDS.b2.sprechen, [2, 2, 1, 2, 1]),
      placements: [audio('b2-bilan-sprechen-frage', 'Teil 2: die Frage der Moderatorin')] },
  ],
};

// ── Probeprüfung : 150 min, tout le niveau ───────────────────────────────────────────────────────────────────────────
const final = {
  kind: 'final', title: level.finalTitle, description: level.finalDescription,
  parts: [
    { id: 'examen-lesen-1', competence: 'lecture', mode: 'closed', title: 'Leseverstehen, Teil 1: ein Sachtext',
      instructions: `${aide('Lesen Sie den Artikel und lösen Sie die Aufgaben 1 bis 5. Zu jeder Aufgabe gibt es nur eine richtige Lösung. Zeit: etwa 20 Minuten.', 'Lisez l’article et répondez aux questions 1 à 5. Pour chaque question, une seule réponse est juste. Durée : environ 20 minutes.')}

Wenn die Stadt zum Schwamm wird

Lange galt in der Stadtplanung eine einfache Regel: Regenwasser muss so schnell wie möglich weg. Straßen, Plätze und Dächer wurden so gebaut, dass das Wasser in die Kanalisation fließt und von dort in den nächsten Fluss. Doch diese Regel stößt an ihre Grenzen. Starkregen, der früher alle paar Jahrzehnte vorkam, trifft manche Städte heute fast jeden Sommer. Die Kanäle können die Wassermassen dann nicht mehr aufnehmen, Keller laufen voll. In langen Hitzeperioden dagegen fehlt das Wasser: Bäume vertrocknen, und versiegelte Flächen heizen sich so stark auf, dass es auch nachts kaum abkühlt.

Fachleute setzen deshalb auf ein anderes Prinzip, das unter dem Begriff „Schwammstadt“ bekannt geworden ist. Die Stadt soll Regenwasser wie ein Schwamm aufsaugen, speichern und bei Bedarf wieder abgeben. Dafür werden Flächen entsiegelt, Dächer begrünt und Mulden angelegt, in denen das Wasser langsam versickern kann. Unter manchen neuen Straßen liegen sogar Speicher aus Kies und Erde, aus denen sich die Wurzeln der Straßenbäume versorgen.

„Das Schöne an der Schwammstadt ist, dass sie zwei Probleme auf einmal angeht“, sagt die Landschaftsarchitektin Mirjam Vogt, die seit Jahren Kommunen berät. „Bei Starkregen wird die Kanalisation entlastet, und im Sommer kühlen Pflanzen und feuchter Boden die Umgebung.“ Messungen zeigen, dass es über einem begrünten Dach an heißen Tagen deutlich kühler ist als über einem Dach aus Kies oder Blech.

In einem Neubauviertel am Rand einer süddeutschen Stadt wurde das Prinzip bereits vollständig umgesetzt. Dort fließt kein Regenwasser mehr in die Kanalisation: Es versickert in Grünstreifen oder wird in Zisternen gesammelt und zum Gießen verwendet. Als im vergangenen Sommer ein heftiges Gewitter über der Region niederging, blieben die Straßen des Viertels trocken, während die Feuerwehr in der Innenstadt Dutzende Keller auspumpen musste.

Ganz so einfach, wie es klingt, ist die Umsetzung allerdings nicht. In dicht bebauten Altstädten fehlt schlicht der Platz für Mulden und Grünflächen, und unter vielen Straßen liegen Leitungen, die sich nicht ohne Weiteres verlegen lassen. Hinzu kommen die Kosten: Ein Gründach ist teurer als ein herkömmliches Dach, auch wenn es länger hält. Viele Hausbesitzer scheuen deshalb die Investition, solange sie nicht vorgeschrieben ist.

Vogt hält es dennoch für einen Fehler, auf große Lösungen zu warten. „Jede entsiegelte Einfahrt, jeder Baum mit genug Wurzelraum hilft. Eine Schwammstadt entsteht nicht auf einen Schlag, sondern Straße für Straße.“ Einige Städte fördern private Projekte inzwischen mit Zuschüssen oder senken die Abwassergebühren für Grundstücke, auf denen das Regenwasser versickert. Ob das reicht, um die Städte rechtzeitig auf das veränderte Klima vorzubereiten, ist unter Fachleuten allerdings umstritten.`,
      questions: [
        q('q1', aide('Was ist das Hauptthema des Artikels?', 'Quel est le thème principal de l’article ?'),
          [['die Gefahren von Starkregen für alte Gebäude'], ['ein neues Prinzip für den Umgang mit Regenwasser', true], ['die Kosten der Kanalisation für die Bürger'], ['ein Wettbewerb für Landschaftsarchitekten']]),
        q('q2', aide('Warum funktioniert die alte Regel heute immer schlechter?', 'Pourquoi l’ancienne règle fonctionne-t-elle de moins en moins bien ?'),
          [['Weil die Kanäle seit Jahren schlecht gewartet werden.'], ['Weil immer mehr Menschen in Städten leben.'], ['Weil extreme Wetterlagen häufiger geworden sind.', true], ['Weil die Flüsse kein Wasser mehr aufnehmen.']]),
        q('q3', aide('Welchen Vorteil der Schwammstadt hebt Mirjam Vogt hervor?', 'Quel avantage de la ville-éponge Mirjam Vogt met-elle en avant ?'),
          [['Sie ist billiger als eine neue Kanalisation.'], ['Sie lässt sich schnell in Altstädten umsetzen.'], ['Sie macht Gründächer überflüssig.'], ['Sie hilft bei Starkregen und bei Hitze.', true]]),
        q('q4', aide('Warum zögern viele Hausbesitzer?', 'Pourquoi beaucoup de propriétaires hésitent-ils ?'),
          [['Weil die Kosten hoch sind und nichts sie verpflichtet.', true], ['Weil Gründächer schneller kaputtgehen als andere Dächer.'], ['Weil ihnen der Platz für Bäume fehlt.'], ['Weil dadurch die Abwassergebühren steigen.']]),
        q('q5', aide('Was meint Mirjam Vogt mit „nicht auf einen Schlag, sondern Straße für Straße“?', 'Que veut dire Mirjam Vogt par « pas d’un seul coup, mais rue après rue » ?'),
          [['Ohne ein großes Gesetz ändert sich nichts.'], ['Viele kleine Maßnahmen führen nach und nach zum Ziel.', true],
            ['Man muss zuerst alle Straßen neu bauen.'], ['Die Umsetzung dauert so lange, dass sie sich kaum lohnt.']]),
      ],
      criteria: [], placements: [] },
    { id: 'examen-lesen-2', competence: 'lecture', mode: 'closed', title: 'Leseverstehen, Teil 2: Meinungen in einem Forum',
      instructions: `${aide('Lesen Sie die vier Beiträge. Zu welcher Person passen die Aussagen 6 bis 10? Eine Person kann mehrmals gemeint sein. Zeit: etwa 20 Minuten.', 'Lisez les quatre contributions. À quelle personne correspondent les affirmations 6 à 10 ? Une même personne peut être la bonne réponse plusieurs fois. Durée : environ 20 minutes.')}

Forum: Ein soziales Pflichtjahr nach der Schule – gute Idee?

Paula: Ich habe nach dem Abitur freiwillig ein Jahr in einem Pflegeheim gearbeitet und dort mehr gelernt als in manchem Schuljahr: Geduld, Verantwortung und den Umgang mit Menschen, die ganz anders leben als ich. Trotzdem bin ich gegen eine Pflicht. Wer gezwungen wird, macht die Arbeit oft nur halbherzig, und darunter leiden am Ende genau die Menschen, die Hilfe brauchen. Besser wäre es, die Freiwilligendienste anständig zu bezahlen und an den Schulen bekannter zu machen. Viele aus meiner Klasse wussten gar nicht, dass es so etwas gibt.

Rafael: Ich finde, unsere Gesellschaft driftet immer mehr auseinander. Viele junge Leute kennen fast nur Menschen, die so leben wie sie selbst: dieselbe Schule, dasselbe Viertel, dieselben Meinungen im Netz. In einem Pflichtjahr würden Jugendliche aus ganz verschiedenen Familien zusammenarbeiten, und davon hätten alle etwas. Ein Jahr ist überschaubar, und Pflegeheime, Kitas oder Sportvereine bräuchten dringend Unterstützung. Wer sich einmal um andere gekümmert hat, sieht vieles mit anderen Augen.

Sabine: Als Mutter von zwei Teenagern sehe ich das differenziert. Grundsätzlich halte ich ein solches Jahr für sinnvoll, gerade für junge Leute, die nach der Schule noch nicht wissen, was sie wollen. Aber nicht alle Familien können es sich leisten, dass ihr Kind ein Jahr lang nur ein kleines Taschengeld verdient. Wenn schon Pflicht, dann nur mit einem Lohn, von dem man leben kann, und mit einer echten Wahl, auch für Umwelt- oder Kulturprojekte. Sonst trifft die Pflicht vor allem diejenigen, die es ohnehin schwerer haben.

Malte: Ich bilde in einem Handwerksbetrieb Lehrlinge aus, und schon jetzt finden wir kaum Nachwuchs. Ein Pflichtjahr würde den Einstieg ins Berufsleben um ein weiteres Jahr verschieben, und den Betrieben würden noch mehr junge Fachkräfte fehlen. Dabei lernen Jugendliche bei uns ebenfalls, Verantwortung zu übernehmen, nur eben in einem anderen Bereich. Statt neue Pflichten einzuführen, sollte man Schülerinnen und Schülern lieber schon während der Schulzeit Praktika in sozialen Einrichtungen ermöglichen. Dann könnten sie selbst herausfinden, ob ihnen diese Arbeit liegt.`,
      questions: [
        wer('q6', 'Wer hat selbst schon einen Freiwilligendienst gemacht?', 'Qui a déjà fait lui-même un service volontaire ?', 2),
        wer('q7', 'Wer hofft, dass sich durch das Pflichtjahr Menschen aus verschiedenen Milieus begegnen?', 'Qui espère que l’année obligatoire fera se rencontrer des personnes de milieux différents ?', 3),
        wer('q8', 'Wer wäre unter bestimmten Bedingungen für eine Pflicht?', 'Qui serait favorable à une obligation sous certaines conditions ?', 0),
        wer('q9', 'Wer befürchtet Nachteile für die Wirtschaft?', 'Qui craint des inconvénients pour l’économie ?', 1),
        wer('q10', 'Wer meint, dass Zwang die Qualität der Hilfe verschlechtert?', 'Qui pense que la contrainte nuit à la qualité de l’aide apportée ?', 2),
      ],
      criteria: [], placements: [] },
    { id: 'examen-hoeren', competence: 'ecoute', mode: 'closed', title: 'Hörverstehen: Meldung, Interview und Vortrag',
      instructions: [
        aide('Sie hören drei Texte: eine Meldung im Radio, ein Interview und einen Vortrag.', 'Vous allez entendre trois documents : une nouvelle à la radio, une interview et un exposé.'),
        aide('Lesen Sie vor jedem Text die Aufgaben. Sie können jeden Text zweimal hören.', 'Lisez les questions avant chaque document. Vous pouvez écouter chaque document deux fois.'),
        aide('Die Aufgaben 1 bis 3 gehören zu Text 1, die Aufgaben 4 bis 7 zu Text 2 und die Aufgaben 8 bis 10 zu Text 3.', 'Les questions 1 à 3 portent sur le document 1, les questions 4 à 7 sur le document 2, les questions 8 à 10 sur le document 3.'),
        aide('Zu jeder Aufgabe gibt es nur eine richtige Lösung. Zeit: etwa 30 Minuten.', 'Pour chaque question, une seule réponse est juste. Durée : environ 30 minutes.'),
      ].join('\n'),
      questions: [
        q('q1', aide('Text 1: Was hat der Stadtrat beschlossen?', 'Document 1 : qu’a décidé le conseil municipal ?'),
          [['Er übernimmt einen Teil der Kosten für Reparaturen.', true], ['Er eröffnet eine städtische Reparaturwerkstatt.'], ['Er verbietet den Verkauf billiger Elektrogeräte.'], ['Er fördert den Kauf neuer, sparsamer Geräte.']]),
        q('q2', aide('Text 1: Warum gilt der Bonus nicht für Smartphones und Laptops?', 'Document 1 : pourquoi le bonus ne s’applique-t-il pas aux smartphones et aux ordinateurs portables ?'),
          [['Weil ihre Reparatur zu teuer ist.'], ['Weil Fachbetriebe diese Geräte nicht reparieren dürfen.'], ['Weil es dafür schon eine andere Förderung gibt.', true], ['Weil der Handelsverband dagegen war.']]),
        q('q3', aide('Text 1: Was kritisiert der Handelsverband?', 'Document 1 : que critique la fédération du commerce ?'),
          [['Das Geld der Stadt reicht wahrscheinlich nur für wenige Wochen.'], ['Der Bonus nützt wohl vor allem Leuten, die sowieso reparieren.', true],
            ['Die Händler verlieren dadurch zu viele Kunden an Werkstätten.'], ['Die Reparaturtreffs bekommen zu viel Geld.']]),
        q('q4', aide('Text 2: Wie steht Frau Ortmann zu Übersetzungsprogrammen?', 'Document 2 : quelle est la position de Mme Ortmann sur les logiciels de traduction ?'),
          [['Sie hat große Angst, ihre Arbeit bald zu verlieren.'], ['Sie lehnt sie für jede Art von Text grundsätzlich ab.'],
            ['Sie findet sie für Romane besser geeignet als für Geschäftsbriefe.'], ['Sie findet sie gut für Gebrauchstexte, nicht für Romane.', true]]),
        q('q5', aide('Text 2: Was macht Frau Ortmann mit einem Wortspiel?', 'Document 2 : que fait Mme Ortmann d’un jeu de mots ?'),
          [['Sie erfindet ein neues deutsches Wortspiel.', true], ['Sie erklärt es den Lesern in einer Anmerkung.'], ['Sie übersetzt es so genau wie möglich Wort für Wort.'], ['Sie lässt es einfach weg, wenn es zu schwierig ist.']]),
        q('q6', aide('Text 2: Was kritisiert sie an der Überarbeitung maschineller Übersetzungen?', 'Document 2 : que critique-t-elle dans la révision de traductions automatiques ?'),
          [['Die Verlage verbieten sie ihren Übersetzern.'], ['Sie dauert viel länger als eine eigene Übersetzung.'], ['Sie ist schlechter bezahlt, aber kaum weniger Arbeit.', true], ['Sie macht die Texte meistens länger als das Original.']]),
        q('q7', aide('Text 2: Was rät sie jungen Menschen, die übersetzen wollen?', 'Document 2 : que conseille-t-elle aux jeunes qui veulent devenir traducteurs ?'),
          [['zuerst mehrere Fremdsprachen zu lernen'], ['früh mit Übersetzungsprogrammen zu arbeiten'], ['im Ausland Literatur zu studieren'], ['viel in der eigenen Sprache zu lesen', true]]),
        q('q8', aide('Text 3: Welche These vertritt der Redner?', 'Document 3 : quelle thèse défend l’orateur ?'),
          [['Unser Gedächtnis wird im Alter unzuverlässig.'], ['Vergessen ist eine nützliche Leistung des Gehirns.', true], ['Mit Training kann man das Vergessen verhindern.'], ['Heute vergessen die Menschen mehr als früher.']]),
        q('q9', aide('Text 3: Wozu dient das Beispiel mit den Parkplätzen?', 'Document 3 : à quoi sert l’exemple des places de parking ?'),
          [['Es zeigt, dass wir Orte besonders schnell vergessen.'], ['Es zeigt, wie man sich Orte mit einfachen Tricks besser merkt.'],
            ['Es zeigt, dass zu viele Erinnerungen bei der Suche stören.', true], ['Es zeigt, dass Autofahrer oft unkonzentriert sind.']]),
        q('q10', aide('Text 3: Welchen Tipp gibt der Redner für das Lernen?', 'Document 3 : quel conseil l’orateur donne-t-il pour apprendre ?'),
          [['einen Text so oft wie möglich lesen'], ['vor dem Schlafen nichts Neues lernen'], ['alles an einem einzigen langen Tag wiederholen'], ['den Stoff mehrmals mit Pausen wiederholen', true]]),
      ],
      criteria: [],
      placements: [
        audio('b2-examen-hoeren-meldung', 'Text 1: eine Meldung im Radio'),
        audio('b2-examen-hoeren-interview', 'Text 2: ein Interview mit einer Übersetzerin'),
        audio('b2-examen-hoeren-vortrag', 'Text 3: ein Vortrag über das Vergessen'),
      ] },
    { id: 'examen-schreiben', competence: 'expression-ecrite', mode: 'written', title: 'Schriftlicher Ausdruck: Forumsbeitrag und formelle E-Mail',
      instructions: `${aide('Schreiben Sie zwei Texte in das Feld unten, zuerst Aufgabe 1, dann Aufgabe 2.', 'Écrivez deux textes dans le champ ci-dessous : d’abord la tâche 1, puis la tâche 2.')}
${aide('Zeit: etwa 55 Minuten. Planen Sie am Ende 5 Minuten zum Korrigieren ein.', 'Durée : environ 55 minutes. Gardez 5 minutes à la fin pour vous relire.')}

AUFGABE 1 · FORUMSBEITRAG (ETWA 30 MINUTEN)
${aide('Im Forum eines Elternmagazins lesen Sie die Frage: „Sollte Werbung, die sich an Kinder richtet, in sozialen Netzwerken verboten werden?“', 'Sur le forum d’un magazine pour parents, vous lisez la question : « La publicité destinée aux enfants devrait-elle être interdite sur les réseaux sociaux ? »')}
${aide('Schreiben Sie Ihre Meinung (etwa 150 Wörter).', 'Donnez votre avis (environ 150 mots).')}
• ${aide('Nehmen Sie Stellung und begründen Sie Ihre Meinung mit Argumenten und Beispielen.', 'Prenez position et justifiez votre avis par des arguments et des exemples.')}
• ${aide('Gehen Sie auf eine Gegenposition ein und entkräften Sie sie.', 'Présentez une position contraire et réfutez-la.')}
• ${aide('Formulieren Sie am Ende ein Fazit.', 'Formulez une conclusion pour finir.')}

AUFGABE 2 · FORMELLE E-MAIL (ETWA 20 MINUTEN)
${aide('Sie haben im Auftrag Ihres Arbeitgebers an einer zweitägigen Fortbildung teilgenommen. Der Raum war zu klein, die Unterlagen kamen erst am zweiten Tag, und der praktische Teil fiel aus.', 'Votre employeur vous a envoyé à une formation de deux jours. La salle était trop petite, les documents ne sont arrivés que le deuxième jour et la partie pratique a été annulée.')}
${aide('Schreiben Sie an Frau Reinhardt aus der Personalabteilung (etwa 100 Wörter).', 'Écrivez à Mme Reinhardt, du service du personnel (environ 100 mots).')}
• ${aide('Nennen Sie die Fortbildung und den Grund Ihrer E-Mail.', 'Indiquez la formation et la raison de votre courriel.')}
• ${aide('Beschreiben Sie die Probleme sachlich und höflich.', 'Décrivez les problèmes de façon objective et polie.')}
• ${aide('Erklären Sie, welche Folgen das für Ihre Arbeit hat.', 'Expliquez quelles conséquences cela a pour votre travail.')}
• ${aide('Machen Sie einen Vorschlag für die nächste Fortbildung.', 'Faites une proposition pour la prochaine formation.')}`,
      questions: [],
      criteria: grid(GRIDS.b2.schreiben, [3, 2, 2, 3], {
        aufgabe: aide('Aufgabenerfüllung: beide Texte vollständig, Forumsbeitrag argumentativ, E-Mail formell und höflich',
          'Tâche : les deux textes complets, contribution argumentée, courriel formel et poli'),
      }),
      placements: [] },
    { id: 'examen-sprechen', competence: 'expression-orale', mode: 'oral', title: 'Mündlicher Ausdruck: Vortrag, Diskussion und Rückfrage',
      instructions: `${aide('Die mündliche Prüfung hat drei Teile. Nehmen Sie alles in einem Stück auf: 6 bis 7 Minuten.', 'L’épreuve orale compte trois parties. Enregistrez-vous en une seule fois : 6 à 7 minutes.')}
${aide('Bereiten Sie sich etwa 10 Minuten vor. Überlegen Sie sich Stichwörter, aber lesen Sie keinen fertigen Text vor.', 'Préparez-vous environ 10 minutes. Réfléchissez à des mots-clés, mais ne lisez pas un texte entièrement rédigé.')}

TEIL 1 · VORTRAG (3 BIS 4 MINUTEN)
${aide('Wählen Sie ein Thema: A „Sollten Innenstädte autofrei werden?“ oder B „Brauchen wir in Zukunft noch Bargeld?“', 'Choisissez un thème : A « Les centres-villes devraient-ils devenir sans voitures ? » ou B « Aurons-nous encore besoin d’argent liquide à l’avenir ? »')}
• ${aide('Führen Sie in das Thema ein und nennen Sie den Aufbau Ihres Vortrags.', 'Introduisez le thème et annoncez le plan de votre exposé.')}
• ${aide('Beschreiben Sie die Situation in Ihrem Heimatland.', 'Décrivez la situation dans votre pays d’origine.')}
• ${aide('Wägen Sie Vor- und Nachteile mit Beispielen ab.', 'Pesez les avantages et les inconvénients en donnant des exemples.')}
• ${aide('Sagen Sie Ihre Meinung, begründen Sie sie und fassen Sie am Ende zusammen.', 'Donnez votre avis, justifiez-le et résumez pour finir.')}

TEIL 2 · DISKUSSION (ETWA 2 MINUTEN)
${aide('Hören Sie, was eine Person aus Ihrem Team zu Ihrem Thema sagt: Text A oder Text B.', 'Écoutez ce qu’une personne de votre équipe dit de votre thème : document A ou document B.')}
• ${aide('Geben Sie ihr in einem Punkt recht und widersprechen Sie in einem anderen mit Argumenten.', 'Donnez-lui raison sur un point et contredisez-la sur un autre, arguments à l’appui.')}
• ${aide('Schlagen Sie einen Kompromiss vor.', 'Proposez un compromis.')}

TEIL 3 · RÜCKFRAGE (ETWA 1 MINUTE)
${aide('Hören Sie die Frage der Prüferin und antworten Sie mit einigen begründeten Sätzen.', 'Écoutez la question de l’examinatrice et répondez en quelques phrases argumentées.')}`,
      questions: [],
      criteria: grid(GRIDS.b2.sprechen, [2, 2, 2, 2, 2]),
      placements: [
        audio('b2-examen-sprechen-diskussion-a', 'Teil 2, Thema A: ein Kollege zu autofreien Innenstädten'),
        audio('b2-examen-sprechen-diskussion-b', 'Teil 2, Thema B: eine Kollegin zum Bargeld'),
        audio('b2-examen-sprechen-frage', 'Teil 3: die Frage der Prüferin'),
      ] },
  ],
};

export const assessments = [midterm, final];
