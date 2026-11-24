// Module B2 n° 19 · thème « Gesellschaft » (lot R8, thème 10) : démocratie, engagement, participation. Comprendre une
// tribune sur les assemblées citoyennes tirées au sort (Bürgerräte), suivre une réunion publique sur un budget participatif
// avec prise de notes, lire une dépêche sur une pétition. Grammaire : relatives avec wer, was et wo(r) + préposition,
// complément du nom au génitif, relatif au génitif (dessen, deren).
// Textes, dialogues et exercices originaux LinguaCap (ville fictive de Wendelstedt, personnages fictifs).
import { aide, C2, choice, fill, order, match } from '../../lib.mjs';

/** « Richtig / falsch / steht nicht im Text » : r, f ou n pour la bonne réponse. */
const rf = (id, statement, answer, explanation) => choice(id, `„${statement}“ ${C2.richtigFalsch}`,
  [['richtig', answer === 'r'], ['falsch', answer === 'f'], ['steht nicht im Text', answer === 'n']], explanation);
/** Indices affichés sous les trous d'un fill (forme de base à transformer). */
const hints = (question, ...values) => ({ ...question,
  blanks: question.blanks.map((blank, index) => (values[index] ? { ...blank, hint: values[index] } : blank)) });

export default {
  id: 'b2-gesellschaft',
  title: 'Gesellschaft: Demokratie gestalten, mitreden, mitentscheiden',
  objective: 'Comprendre une tribune argumentée sur les assemblées citoyennes et repérer la position de l’autrice, suivre une réunion publique en prenant des notes détaillées, lire une dépêche sur une pétition ; employer les relatives avec wer, was et wo(r) + préposition et le complément du nom au génitif (dessen, deren).',
  grammarFocus: ['relativsaetze-wer-was', 'genitivattribut'],
  sources: ['Textes, dialogues et exercices originaux LinguaCap (ville et personnages fictifs).'],

  vocabulary: [
    { word: 'Bürgerbeteiligung', article: 'die', plural: 'Bürgerbeteiligungen', partOfSpeech: 'noun', translation: 'la participation citoyenne',
      example: 'Die Stadt setzt bei der Planung des Hafengeländes auf mehr Bürgerbeteiligung.', note: null },
    { word: 'Bürgerrat', article: 'der', plural: 'Bürgerräte', partOfSpeech: 'noun', translation: 'l’assemblée citoyenne (tirée au sort)',
      example: 'Der Bürgerrat hat zwölf Empfehlungen formuliert.', note: null },
    { word: 'Losverfahren', article: 'das', plural: 'Losverfahren', partOfSpeech: 'noun', translation: 'le tirage au sort (procédure)',
      example: 'Die Mitglieder des Bürgerrats werden im Losverfahren bestimmt.', note: 'per Los auswählen : tirer au sort' },
    { word: 'Wahlbeteiligung', article: 'die', plural: null, partOfSpeech: 'noun', translation: 'le taux de participation (à une élection)',
      example: 'Die Wahlbeteiligung lag bei der letzten Kommunalwahl unter fünfzig Prozent.', note: 'sans pluriel dans ce sens' },
    { word: 'Stimme', article: 'die', plural: 'Stimmen', partOfSpeech: 'noun', translation: 'la voix ; le suffrage',
      example: 'Beim Bürgerhaushalt hat jede Person fünf Stimmen.', note: 'seine Stimme abgeben : voter' },
    { word: 'abstimmen über', partOfSpeech: 'verb', translation: 'voter sur, se prononcer par un vote',
      example: 'Im Mai stimmen die Einwohnerinnen und Einwohner über die Vorschläge ab.', note: '+ accusatif · séparable : ab|stimmen' },
    { word: 'sich beteiligen an', partOfSpeech: 'verb', translation: 'participer à',
      example: 'Mehr als zweitausend Menschen wollen sich an der Abstimmung beteiligen.', note: '+ datif' },
    { word: 'sich einsetzen für', partOfSpeech: 'verb', translation: 's’engager pour, défendre',
      example: 'Sie setzt sich seit Jahren für bezahlbare Wohnungen ein.', note: '+ accusatif · séparable : ein|setzen' },
    { word: 'Einfluss nehmen auf', partOfSpeech: 'expression', translation: 'influer sur, peser sur',
      example: 'Mit einer Petition kann man Einfluss auf die Politik nehmen.', note: '+ accusatif' },
    { word: 'Petition', article: 'die', plural: 'Petitionen', partOfSpeech: 'noun', translation: 'la pétition',
      example: 'Die Petition hat in sechs Wochen fast fünftausend Unterschriften gesammelt.', note: 'eine Petition starten, unterschreiben, einreichen' },
    { word: 'Unterschrift', article: 'die', plural: 'Unterschriften', partOfSpeech: 'noun', translation: 'la signature',
      example: 'Wir sammeln Unterschriften für längere Öffnungszeiten.', note: null },
    { word: 'Stadtrat', article: 'der', plural: 'Stadträte', partOfSpeech: 'noun', translation: 'le conseil municipal ; le conseiller municipal',
      example: 'Der Stadtrat berät im April über den Antrag.', note: null },
    { word: 'Antrag', article: 'der', plural: 'Anträge', partOfSpeech: 'noun', translation: 'la demande ; la motion',
      example: 'Der Jugendbeirat hat einen Antrag auf eine neue Sportfläche gestellt.', note: 'einen Antrag stellen' },
    { word: 'Empfehlung', article: 'die', plural: 'Empfehlungen', partOfSpeech: 'noun', translation: 'la recommandation',
      example: 'Die Empfehlungen des Bürgerrats sind nicht bindend.', note: null },
    { word: 'bindend', partOfSpeech: 'adjective', translation: 'contraignant',
      example: 'Das Ergebnis der Befragung ist für den Stadtrat nicht bindend.', note: null },
    { word: 'Mehrheit', article: 'die', plural: 'Mehrheiten', partOfSpeech: 'noun', translation: 'la majorité',
      example: 'Eine knappe Mehrheit hat für den neuen Park gestimmt.', note: 'contraire : die Minderheit' },
    { word: 'Kompromiss', article: 'der', plural: 'Kompromisse', partOfSpeech: 'noun', translation: 'le compromis',
      example: 'Am Ende haben beide Seiten einen Kompromiss gefunden.', note: 'einen Kompromiss finden, schließen, eingehen' },
    { word: 'Politikverdrossenheit', article: 'die', plural: null, partOfSpeech: 'noun', translation: 'le désenchantement envers la politique',
      example: 'Echte Beteiligung kann helfen, die Politikverdrossenheit zu verringern.', note: 'sans pluriel · politikverdrossen' },
    { word: 'Verantwortung übernehmen', partOfSpeech: 'expression', translation: 'prendre des responsabilités',
      example: 'Wer im Verein Verantwortung übernimmt, lernt viel über Demokratie.', note: 'für + accusatif' },
    { word: 'zu Wort kommen', partOfSpeech: 'expression', translation: 'avoir la parole, pouvoir s’exprimer',
      example: 'Im Bürgerrat kommen auch Menschen zu Wort, die sonst schweigen.', note: null },
    { word: 'Stellung nehmen zu', partOfSpeech: 'expression', translation: 'prendre position sur',
      example: 'Der Stadtrat nimmt zu jeder Empfehlung schriftlich Stellung.', note: '+ datif · die Stellungnahme : la prise de position' },
    { word: 'Einwand', article: 'der', plural: 'Einwände', partOfSpeech: 'noun', translation: 'l’objection',
      example: 'Diesen Einwand halte ich für berechtigt.', note: 'einwenden, dass … : objecter que …' },
    { word: 'berechtigt', partOfSpeech: 'adjective', translation: 'fondé, légitime',
      example: 'Die Kritik an der Auswahl der Fachleute ist zum Teil berechtigt.', note: null },
    { word: 'zur Verfügung stellen', partOfSpeech: 'expression', translation: 'mettre à disposition',
      example: 'Die Stadt stellt dem Stadtteil zweihunderttausend Euro zur Verfügung.', note: 'jemandem (datif) etwas (accusatif)' },
    { word: 'ehrenamtlich', partOfSpeech: 'adjective', translation: 'bénévole',
      example: 'Dragana Petrović arbeitet ehrenamtlich im Mieterverein.', note: 'das Ehrenamt : le bénévolat' },
  ],

  media: [
    { key: 'b2-gesellschaft-lesen-artikel', kind: 'image', title: 'Tribune « Gelost statt gewählt »',
      alt: 'Tribune d’une politologue : « Gelost statt gewählt ». Une ville a tiré au sort quarante habitants pour réfléchir à l’avenir de son ancien port ; le texte pèse les avantages et les limites des assemblées citoyennes.',
      image: { layout: 'article', kicker: 'Gastbeitrag', icon: 'landmark',
        title: 'Gelost statt gewählt: Was Bürgerräte leisten können – und was nicht',
        byline: 'Dr. Henrike Lassen, Politikwissenschaftlerin',
        lead: 'Als die Stadt Wendelstedt vierzig Einwohnerinnen und Einwohner per Los auswählte, damit sie über die Zukunft des alten Hafengeländes berieten, war die Skepsis groß.',
        paragraphs: ['„Wer nicht gewählt ist, hat auch keine Legitimation“, hieß es damals im Stadtrat. Ein halbes Jahr später liegt ein Gutachten des Bürgerrats auf dem Tisch, über das selbst frühere Kritiker anerkennend sprechen. Was ist da passiert?'] } },
    { key: 'b2-gesellschaft-hoeren-audio', kind: 'audio', title: 'Réunion publique sur le budget participatif',
      script: [
        { voice: 'frau', name: 'Imke Hansen', text: 'Guten Abend und herzlich willkommen im Gemeindesaal von Wendelstedt-Süd. Heute geht es um eine Frage, die viele von Ihnen beschäftigt: Wie soll der neue Bürgerhaushalt funktionieren? Die Stadt stellt unserem Stadtteil im nächsten Jahr zweihunderttausend Euro zur Verfügung, und über die Verwendung sollen Sie selbst mitentscheiden.' },
        { voice: 'frau', name: 'Imke Hansen', text: 'Herr Gerlach, Sie sind in der Stadtverwaltung für das Verfahren zuständig. Wie soll das Ganze ablaufen?' },
        { voice: 'mann2', name: 'Rainer Gerlach', text: 'Das Verfahren hat drei Phasen. Bis Ende März kann jeder, der im Stadtteil wohnt und mindestens vierzehn Jahre alt ist, Vorschläge einreichen, entweder online oder auf Papier im Bürgerbüro. Im April prüfen wir in der Verwaltung, ob die Vorschläge rechtlich und technisch umsetzbar sind.' },
        { voice: 'mann2', name: 'Rainer Gerlach', text: 'Und im Mai wird abgestimmt. Jede Person hat fünf Stimmen, die sie frei verteilen kann, also auch alle fünf auf ein einziges Projekt.' },
        { voice: 'frau', name: 'Imke Hansen', text: 'Und abgestimmt wird nur im Internet?' },
        { voice: 'mann2', name: 'Rainer Gerlach', text: 'Nein, nicht nur. Man kann online abstimmen, aber auch an zwei Samstagen im Bürgerbüro, mit Unterstützung durch unsere Mitarbeiterinnen und Mitarbeiter. Uns ist wichtig, dass niemand ausgeschlossen wird, nur weil er keinen Computer hat.' },
        { voice: 'frau', name: 'Imke Hansen', text: 'Frau Petrović, Sie engagieren sich seit vielen Jahren ehrenamtlich im Mieterverein. Was halten Sie davon?' },
        { voice: 'frau3', name: 'Dragana Petrović', text: 'Grundsätzlich finde ich die Idee gut, das muss ich ganz ehrlich sagen. Aber ich habe eine Sorge: Wer gut organisiert ist und viele Leute mobilisieren kann, gewinnt. Die Kleingärtner zum Beispiel haben einen starken Verein, die Familien in den Hochhäusern am Ring dagegen nicht.' },
        { voice: 'frau3', name: 'Dragana Petrović', text: 'Viele von ihnen sprechen noch nicht so gut Deutsch und erfahren von solchen Abstimmungen oft erst, wenn alles vorbei ist. Am Ende entscheiden dann wieder dieselben Leute wie immer.' },
        { voice: 'frau', name: 'Imke Hansen', text: 'Herr Gerlach, ist das ein Problem, das Sie kennen?' },
        { voice: 'mann2', name: 'Rainer Gerlach', text: 'Durchaus. Deshalb gibt es alle Unterlagen in sechs Sprachen, und im Februar fahren wir mit einem Infomobil direkt in die Wohngebiete, natürlich auch an den Ring. Aber ich gebe Frau Petrović recht: Wir werden nie alle erreichen. Was wir tun können, ist, die Hürden so niedrig wie möglich zu machen.' },
        { voice: 'frau', name: 'Imke Hansen', text: 'Mats, du bist siebzehn und sitzt im Jugendbeirat. Was erwartest du vom Bürgerhaushalt?' },
        { voice: 'mann3', name: 'Mats Behrendt', text: 'Ehrlich gesagt bin ich froh, dass man hier schon ab vierzehn mitmachen darf. Bei der Bundestagswahl dürfen wir ja noch nicht wählen. Wir im Jugendbeirat haben schon eine Idee, über die wir lange diskutiert haben: eine überdachte Sportfläche hinter der Gesamtschule, wo man auch im Winter spielen kann.' },
        { voice: 'mann3', name: 'Mats Behrendt', text: 'Mein Problem ist nur: Zweihunderttausend Euro klingen nach viel Geld, aber so eine Fläche kostet allein schon ungefähr hunderttausend.' },
        { voice: 'frau', name: 'Imke Hansen', text: 'Herr Gerlach, gibt es eine Obergrenze für einzelne Projekte?' },
        { voice: 'mann2', name: 'Rainer Gerlach', text: 'Ja, kein einzelnes Projekt darf mehr als achtzigtausend Euro kosten. Sonst könnten zwei große Vorschläge das gesamte Budget aufbrauchen, und alle anderen gingen leer aus. Eine Sportfläche für hunderttausend Euro könnten wir also nicht fördern, es sei denn, sie wird kleiner geplant.' },
        { voice: 'mann3', name: 'Mats Behrendt', text: 'Das ist schade, aber nachvollziehbar. Dann müssen wir unseren Vorschlag eben überarbeiten. Vielleicht reicht ja auch ein Dach über dem Basketballfeld, das es schon gibt.' },
        { voice: 'frau3', name: 'Dragana Petrović', text: 'Darf ich noch etwas ergänzen? Mir ist wichtig, dass die Verwaltung am Ende öffentlich erklärt, was aus den Vorschlägen geworden ist, auch aus denen, die nicht gewonnen haben. Sonst machen die Leute einmal mit und dann nie wieder.' },
        { voice: 'mann2', name: 'Rainer Gerlach', text: 'Das ist so geplant. Im Herbst veröffentlichen wir einen Bericht, in dem jeder einzelne Vorschlag mit seinem Ergebnis und einer kurzen Begründung aufgeführt ist.' },
        { voice: 'frau', name: 'Imke Hansen', text: 'Vielen Dank Ihnen dreien. Ich fasse kurz zusammen: Der Bürgerhaushalt ist grundsätzlich willkommen, es gibt aber die Sorge, dass nicht alle erreicht werden, und den Wunsch nach Transparenz. Dann öffnen wir jetzt die Runde für Ihre Fragen. Wer möchte beginnen?' },
      ] },
    { key: 'b2-gesellschaft-kontrolle-audio', kind: 'audio', title: 'Une auditrice parle du budget participatif',
      script: [
        { voice: 'sprecher', name: 'Moderator', text: 'Und jetzt eine Stimme aus unserem Hörertelefon zum Bürgerhaushalt. Frau Ruhland, Sie haben im letzten Jahr selbst mitgemacht?' },
        { voice: 'frau2', name: 'Frau Ruhland', text: 'Ja, ich habe damals einen Vorschlag eingereicht: mehr Bänke im Stadtpark, damit ältere Menschen unterwegs eine Pause machen können. Gewonnen hat mein Vorschlag nicht, und das hat mich zuerst ziemlich geärgert.' },
        { voice: 'frau2', name: 'Frau Ruhland', text: 'Aber im Herbst kam der Bericht der Stadt, in dem genau erklärt wurde, warum. Zwei andere Projekte hatten einfach mehr Stimmen. Und was mich am Ende überzeugt hat: Ein Teil der Bänke wird trotzdem aufgestellt, und zwar aus einem anderen Topf. Dieses Jahr mache ich also wieder mit.' },
      ] },
  ],

  activities: [
    // 1 · Einstieg
    { id: 'b2-gesellschaft-einstieg', kind: 'lesson', title: 'Einstieg: Demokratie im Alltag', estimatedMinutes: 10,
      competences: ['lecture', 'expression-orale'],
      lesson: { description: `DEMOKRATIE IM ALLTAG
Wählen gehen, eine Petition unterschreiben, im Elternbeirat mitreden, im Verein Verantwortung übernehmen: Demokratie findet nicht nur im Parlament statt. In diesem Modul geht es um die Frage, wie Bürgerinnen und Bürger zwischen zwei Wahlen mitentscheiden können. [fr?] La démocratie ne se joue pas seulement au Parlement : ce module porte sur les façons de participer entre deux élections.

FRAGEN ZUM EINSTIEG
• Wo haben Sie selbst schon einmal mitentschieden: in der Schule, im Betrieb, in einem Verein oder in Ihrer Gemeinde? [fr?] Où avez-vous déjà participé à une décision ?
• Was hält Menschen davon ab, sich politisch zu engagieren? [fr?] Qu’est-ce qui empêche les gens de s’engager politiquement ?
• Sollten Bürgerinnen und Bürger öfter direkt über wichtige Fragen abstimmen? Warum, warum nicht? [fr?] Les citoyens devraient-ils voter plus souvent directement sur les grandes questions ?
Überlegen Sie sich zu jeder Frage zwei oder drei Stichwörter auf Deutsch und formulieren Sie in Gedanken eine begründete Antwort. [fr?] Trouvez deux ou trois mots-clés par question et formulez mentalement une réponse argumentée.

ZIELE
• Ich kann einen argumentativen Text über Bürgerbeteiligung verstehen und die Position der Autorin erkennen. [fr?] Je peux comprendre un texte argumentatif et repérer la position de l’autrice.
• Ich kann einer öffentlichen Diskussion folgen und dabei ausführliche Notizen machen. [fr?] Je peux suivre un débat public en prenant des notes détaillées.
• Ich kann eine Meldung über eine Petition verstehen und die Positionen der Beteiligten unterscheiden. [fr?] Je peux comprendre une dépêche et distinguer les positions des acteurs.
• Ich kann Relativsätze mit „wer“, „was“ und „wo(r)“ + Präposition sowie Genitivattribute verwenden. [fr?] Je peux employer les relatives avec wer, was, wo(r) + préposition et le génitif.

WICHTIGE WÖRTER
• die Bürgerbeteiligung — la participation citoyenne
• der Bürgerrat, die Bürgerräte — l’assemblée citoyenne tirée au sort
• das Losverfahren — le tirage au sort
• die Wahlbeteiligung — le taux de participation
• sich einsetzen für (+ Akk.) — s’engager pour
• Einfluss nehmen auf (+ Akk.) — influer sur
• die Politikverdrossenheit — le désenchantement envers la politique
• Stellung nehmen zu (+ Dat.) — prendre position sur` } },

    // 2 · Lecture longue : une tribune
    { id: 'b2-gesellschaft-lesen', kind: 'exercise', title: 'Verstehen: ein Gastbeitrag über Bürgerräte', estimatedMinutes: 22,
      competences: ['lecture'],
      lesson: { description: `${C2.lesen}

STRATEGIE
1. Global: Lesen Sie die Überschrift, den ersten und den letzten Absatz. Welche Frage stellt die Autorin, und wie beantwortet sie sie? [fr?] Lecture globale : titre, premier et dernier paragraphe. Quelle question l’autrice pose-t-elle, quelle réponse donne-t-elle ?
2. Argumente: Achten Sie auf die Wörter, die ein Argument einleiten oder einschränken: „zunächst einmal“, „hinzu kommt“, „allerdings“, „jedoch“. [fr?] Repérez les mots qui introduisent ou nuancent un argument.
3. Detail: Lesen Sie dann die Aufgaben und nur die passenden Stellen ganz genau. [fr?] Lisez ensuite les questions, puis seulement les passages utiles, en détail.

GELOST STATT GEWÄHLT: WAS BÜRGERRÄTE LEISTEN KÖNNEN – UND WAS NICHT
Ein Gastbeitrag von Dr. Henrike Lassen, Politikwissenschaftlerin

(A) Als die Stadt Wendelstedt im vergangenen Herbst vierzig Einwohnerinnen und Einwohner per Los auswählte, damit sie über die Zukunft des alten Hafengeländes berieten, war die Skepsis groß. „Wer nicht gewählt ist, hat auch keine Legitimation“, hieß es damals im Stadtrat. Ein halbes Jahr später liegt ein Gutachten des Bürgerrats auf dem Tisch, über das selbst frühere Kritiker anerkennend sprechen. Die vierzig Mitglieder – die jüngste war sechzehn, der älteste einundachtzig – empfehlen unter anderem, auf dem Gelände bezahlbare Wohnungen, einen öffentlichen Park und Werkstätten für junge Handwerksbetriebe zu verbinden. Was ist da passiert?

(B) Die Idee ist alles andere als neu. Schon im antiken Athen wurden viele öffentliche Ämter durch das Los vergeben, weil man so allen Bürgern die gleiche Chance geben wollte. Heute läuft ein Bürgerrat meist folgendermaßen ab: Aus dem Melderegister wird eine Zufallsstichprobe gezogen, wobei auf eine ausgewogene Mischung nach Alter, Geschlecht, Bildungsabschluss und Wohnort geachtet wird. Die Ausgewählten treffen sich an mehreren Wochenenden, hören Fachleute an, diskutieren in kleinen Gruppen und formulieren am Ende Empfehlungen. Bindend sind diese nicht: Die Entscheidung bleibt Sache des gewählten Parlaments.

(C) Was spricht für dieses Verfahren? Zunächst einmal kommen Menschen zu Wort, die sonst kaum gehört werden. Wer abends Schicht arbeitet, kleine Kinder betreut oder sich in langen Sitzungen unsicher fühlt, ist in Parteien und Ausschüssen selten vertreten. Im Bürgerrat dagegen sitzt die Pflegekraft neben dem Bankangestellten und die Schülerin neben dem Rentner. Hinzu kommt ein zweiter Vorteil: Da die Mitglieder nicht wiedergewählt werden wollen, können sie ihre Meinung ändern, ohne das Gesicht zu verlieren. Genau das ist etwas, womit viele Teilnehmende nicht gerechnet hatten. Eine Teilnehmerin, deren Familie seit drei Generationen am Hafen lebt, sagte zum Abschluss: „Ich bin mit einer festen Meinung gekommen und gehe mit einer besseren.“

(D) Allerdings sollte man die Erwartungen nicht zu hoch schrauben. Ein Bürgerrat ersetzt keine Wahlen, und er kann auch nicht verhindern, dass seine Empfehlungen in einer Schublade verschwinden. Genau darin liegt die größte Gefahr: Wenn Politikerinnen und Politiker zuerst Beteiligung versprechen und die Ergebnisse dann übergehen, wächst die Enttäuschung. Was als Mittel gegen Politikverdrossenheit gedacht war, kann sie in diesem Fall sogar verstärken. Auch die Kosten sind nicht zu unterschätzen: Moderation, Fachleute und Aufwandsentschädigungen für die Teilnehmenden summieren sich schnell auf einen sechsstelligen Betrag.

(E) Kritiker wenden außerdem ein, die Auswahl der Fachleute beeinflusse die Ergebnisse. Wer bestimmt, welche Expertinnen und Experten eingeladen werden? Und wer formuliert die Leitfrage, auf die der Bürgerrat antworten soll? Diese Einwände sind berechtigt. Sie sprechen jedoch nicht gegen das Verfahren an sich, sondern für klare Regeln: Die Leitfrage sollte öffentlich diskutiert, die Liste der Fachleute veröffentlicht und die Moderation einer unabhängigen Stelle übertragen werden.

(F) In Wendelstedt hat der Stadtrat zugesagt, zu jeder einzelnen Empfehlung schriftlich Stellung zu nehmen – auch zu denen, die er ablehnt. Außerdem soll alles, was der Bürgerrat erarbeitet hat, im Internet veröffentlicht werden. Das klingt weniger spektakulär, als es ist. Denn ob ein Bürgerrat die Demokratie belebt, hängt nicht vom Los ab, sondern davon, was danach mit seinen Ergebnissen geschieht. Wer Menschen um ihren Rat bittet, muss auch bereit sein, ihnen zuzuhören.` },
      placements: [{ media: 'b2-gesellschaft-lesen-artikel', caption: 'Gastbeitrag: Gelost statt gewählt' }],
      questions: [
        choice('q1', aide('Welche Position vertritt die Autorin insgesamt?', 'Quelle position l’autrice défend-elle dans l’ensemble ?'),
          [['Bürgerräte sollten die gewählten Parlamente langfristig ersetzen.'],
            ['Bürgerräte bringen wenig, weil am Ende doch die Fachleute die Ergebnisse steuern.'],
            ['Bürgerräte sind sinnvoll, wenn die Politik ihre Ergebnisse ernst nimmt.', true],
            ['Bürgerräte eignen sich nur für kleine Städte wie Wendelstedt.']],
          aide('Die Autorin wägt Vorteile (C) und Risiken (D, E) ab und zieht im letzten Absatz ihr Fazit: Ob ein Bürgerrat die Demokratie belebt, hängt davon ab, „was danach mit seinen Ergebnissen geschieht“. Die erste Antwort widerspricht Absatz D („Ein Bürgerrat ersetzt keine Wahlen“). Die zweite Antwort nennt einen Einwand, den die Autorin zwar für berechtigt hält, aber nicht als Argument gegen das Verfahren gelten lässt.',
            'Bilan nuancé : ces assemblées sont utiles si la politique tient compte de leurs résultats. La première réponse contredit le paragraphe D ; la deuxième reprend une objection qu’elle ne retient pas contre le principe.')),
        choice('q2', aide('Warum erwähnt die Autorin das antike Athen?', 'Pourquoi l’autrice mentionne-t-elle l’Athènes antique ?'),
          [['Um zu beweisen, dass Bürgerräte heute besser funktionieren.'],
            ['Um zu kritisieren, dass damals nur Männer Bürger sein durften.'],
            ['Um zu erklären, warum Empfehlungen heute nicht bindend sind.'],
            ['Um zu zeigen, dass die Idee des Losverfahrens alt ist.', true]],
          aide('Der Absatz beginnt mit der These „Die Idee ist alles andere als neu“; Athen ist das historische Beispiel dafür. Einen Vergleich, eine Kritik an der antiken Demokratie oder eine Erklärung zum Status der Empfehlungen enthält dieser Satz nicht. „Alles andere als neu“ bedeutet übrigens „ganz und gar nicht neu“.',
            'Athènes illustre la thèse « l’idée n’a rien de nouveau ». « alles andere als » = tout sauf.')),
        rf('q3', 'Das Parlament muss die Empfehlungen eines Bürgerrats umsetzen.', 'f',
          aide('Falsch: „Bindend sind diese nicht: Die Entscheidung bleibt Sache des gewählten Parlaments.“ Ein Bürgerrat berät und empfiehlt; entscheiden darf er nicht. Genau deshalb warnt die Autorin in Absatz D davor, dass Empfehlungen „in einer Schublade verschwinden“ können.',
            'Faux : les recommandations ne sont pas contraignantes (nicht bindend), le Parlement garde la décision.')),
        choice('q4', aide('Was meint die Teilnehmerin mit dem Satz „Ich bin mit einer festen Meinung gekommen und gehe mit einer besseren“?', 'Que veut dire la participante par cette phrase ?'),
          [['Ihre Meinung hat sich durch die Diskussionen weiterentwickelt.', true],
            ['Sie hat ihre erste Meinung bis zum Schluss verteidigt.'],
            ['Sie hat am Ende einfach die Meinung der Fachleute übernommen.'],
            ['Sie findet das Thema inzwischen zu kompliziert für eine Meinung.']],
          aide('Der Satz steht direkt nach dem Vorteil, dass Mitglieder „ihre Meinung ändern können, ohne das Gesicht zu verlieren“. „Eine bessere Meinung“ heißt: eine durchdachtere, nicht die Meinung anderer. Dass sie die Position der Fachleute übernommen hätte, sagt sie nicht; und sie hat ihre Meinung gerade nicht unverändert behalten.',
            'Elle a fait évoluer son opinion grâce aux discussions : c’est l’illustration du deuxième avantage du paragraphe C.')),
        choice('q5', aide('Worin sieht die Autorin die größte Gefahr?', 'Où l’autrice voit-elle le plus grand danger ?'),
          [['Die Mitglieder bringen zu wenig Fachwissen mit.'],
            ['Bürgerräte kosten mehr als eine normale Wahl.'],
            ['Die Politik verspricht Beteiligung und übergeht dann die Ergebnisse.', true],
            ['Zu wenige Menschen sind bereit, an einem Bürgerrat teilzunehmen.']],
          aide('„Genau darin liegt die größte Gefahr: Wenn Politikerinnen und Politiker zuerst Beteiligung versprechen und die Ergebnisse dann übergehen, wächst die Enttäuschung.“ Die Kosten nennt die Autorin zwar auch, aber nur als zusätzlichen Punkt („Auch die Kosten sind nicht zu unterschätzen“), und einen Vergleich mit einer Wahl zieht sie nicht.',
            'Le danger principal : promettre la participation puis ignorer les résultats. Les coûts ne sont qu’un point secondaire.')),
        rf('q6', 'Die meisten Mitglieder des Bürgerrats in Wendelstedt waren jünger als dreißig Jahre.', 'n',
          aide('Steht nicht im Text: Wir erfahren nur das Alter des jüngsten (sechzehn) und des ältesten Mitglieds (einundachtzig) sowie das Prinzip einer „ausgewogenen Mischung nach Alter“. Wie viele Mitglieder unter dreißig waren, sagt der Text nicht. Schließen Sie nichts aus Ihrem eigenen Wissen.',
            'Non mentionné : seuls l’âge du plus jeune et celui du plus âgé sont donnés.')),
        match('q7', aide('Welche Überschrift passt zu welchem Absatz?', 'Quel intertitre convient à quel paragraphe ?'),
          [['Absatz B', 'Ein altes Verfahren in neuer Form'], ['Absatz C', 'Neue Stimmen am Tisch'], ['Absatz D', 'Grenzen und Risiken'],
            ['Absatz E', 'Berechtigte Einwände, klare Regeln'], ['Absatz F', 'Entscheidend ist, was danach passiert']],
          aide('B: vom antiken Athen zum heutigen Ablauf. C: Menschen, die sonst nicht gehört werden, und die Freiheit, die Meinung zu ändern. D: Was ein Bürgerrat nicht kann, Enttäuschung und Kosten. E: die Kritik an Fachleuten und Leitfrage, die Antwort darauf sind Regeln. F: das Versprechen des Stadtrats und das Fazit.',
            'Chaque intertitre résume l’idée directrice d’un paragraphe ; relisez la première et la dernière phrase de chacun.')),
        fill('q8', aide('Worauf verweisen die Wörter? Ergänzen Sie mit Wörtern aus dem Text.', 'À quoi renvoient ces mots ? Complétez avec des mots du texte.'),
          'Absatz B: „diese“ in „Bindend sind diese nicht“ meint die [[1]]. · Absatz E: „Diese Einwände“ betreffen die Auswahl der [[2]] und die Formulierung der [[3]].',
          [['Empfehlungen'], ['Fachleute', 'Expertinnen und Experten', 'Experten', 'Expertinnen'], ['Leitfrage']],
          aide('Ein Text bleibt zusammenhängend, weil Wörter wie „diese“ oder „diese Einwände“ auf etwas Vorheriges zurückverweisen. „Diese“ greift das letzte passende Nomen im Plural auf: „formulieren am Ende Empfehlungen“. „Diese Einwände“ fasst die beiden Fragen davor zusammen: Wer wählt die Fachleute aus, und wer formuliert die Leitfrage?',
            'Les reprises (diese, diese Einwände) renvoient à ce qui précède : les recommandations ; le choix des experts et la formulation de la question.')),
      ] },

    // 3 · Écoute longue : réunion publique
    { id: 'b2-gesellschaft-hoeren', kind: 'exercise', title: 'Verstehen: eine Bürgerversammlung zum Bürgerhaushalt', estimatedMinutes: 20,
      competences: ['ecoute'],
      lesson: { description: `${C2.hoeren}

SITUATION
Im Gemeindesaal von Wendelstedt-Süd findet eine Bürgerversammlung zum neuen Bürgerhaushalt statt. Es sprechen Imke Hansen (Moderation), Rainer Gerlach (Stadtverwaltung), Dragana Petrović (Mieterverein) und Mats Behrendt (Jugendbeirat, 17 Jahre). [fr?] Réunion publique sur le nouveau budget participatif du quartier, avec quatre intervenants.

STRATEGIE
1. Erstes Hören: Wer vertritt welche Position? Achten Sie auf Zustimmung, Sorgen und Einwände. [fr?] Première écoute : qui défend quelle position ? Repérez accords, inquiétudes et objections.
2. Lesen Sie dann die Notizen. Überlegen Sie bei jeder Lücke: Fehlt eine Zahl, ein Monat oder ein Nomen? [fr?] Lisez ensuite les notes : manque-t-il un nombre, un mois, un nom ?
3. Zweites Hören: Ergänzen Sie nur Stichwörter. Zahlen dürfen Sie als Ziffern schreiben. [fr?] Deuxième écoute : complétez avec des mots-clés ; les nombres peuvent être écrits en chiffres.` },
      placements: [{ media: 'b2-gesellschaft-hoeren-audio', caption: 'Bürgerversammlung in Wendelstedt-Süd' }],
      questions: [
        fill('q1', C2.notizen,
          'Bürgerhaushalt Wendelstedt-Süd · Budget: [[1]] Euro · Vorschläge: bis Ende [[2]], online oder im Bürgerbüro · mitmachen darf, wer im Stadtteil wohnt und mindestens [[3]] Jahre alt ist · April: Prüfung durch die [[4]] · Mai: Abstimmung mit [[5]] Stimmen pro Person',
          [['200 000', '200.000', '200000', 'zweihunderttausend'], ['März'], ['14', 'vierzehn'], ['Verwaltung', 'Stadtverwaltung'], ['5', 'fünf']],
          aide('Rainer Gerlach beschreibt drei Phasen: Vorschläge „bis Ende März“, Prüfung „im April“ durch die Verwaltung („prüfen wir in der Verwaltung“), Abstimmung „im Mai“ mit „fünf Stimmen, die sie frei verteilen kann“. Mitmachen darf, „wer im Stadtteil wohnt und mindestens vierzehn Jahre alt ist“. Das Budget nennt die Moderatorin gleich am Anfang.',
            'Les trois phases : propositions jusqu’à fin mars, examen par l’administration en avril, vote en mai (cinq voix par personne).')),
        fill('q2', C2.notizen,
          'Sorge des Mietervereins: Es gewinnt, wer gut [[1]] ist. · Maßnahmen der Stadt: Unterlagen in [[2]] Sprachen, im Februar ein [[3]] in den Wohngebieten · Obergrenze pro Projekt: [[4]] Euro · Idee des Jugendbeirats: eine überdachte [[5]] hinter der Gesamtschule · im Herbst: ein [[6]] über alle Vorschläge',
          [['organisiert'], ['6', 'sechs'], ['Infomobil'], ['80 000', '80.000', '80000', 'achtzigtausend'], ['Sportfläche'], ['Bericht']],
          aide('Frau Petrović: „Wer gut organisiert ist und viele Leute mobilisieren kann, gewinnt.“ Herr Gerlach antwortet mit Unterlagen „in sechs Sprachen“ und einem „Infomobil“. Die Obergrenze liegt bei „achtzigtausend Euro“, also unter den hunderttausend, die die Sportfläche des Jugendbeirats kosten würde. Am Ende kündigt er einen Bericht „im Herbst“ an.',
            'Inquiétude : les groupes bien organisés gagnent ; réponses : six langues, un véhicule d’information, plafond de 80 000 €, rapport à l’automne.')),
        choice('q3', aide('Welche Haltung hat Dragana Petrović zum Bürgerhaushalt?', 'Quelle est la position de Dragana Petrović sur le budget participatif ?'),
          [['Sie lehnt ihn ab, weil nur die Vereine davon profitieren.'],
            ['Sie findet ihn gut, fürchtet aber, dass manche Gruppen übersehen werden.', true],
            ['Sie unterstützt ihn ohne Vorbehalte, weil alle mitmachen dürfen.'],
            ['Sie hat noch keine feste Meinung, weil ihr wichtige Informationen zum Verfahren fehlen.']],
          aide('„Grundsätzlich finde ich die Idee gut … Aber ich habe eine Sorge“: Sie stimmt im Prinzip zu und schränkt dann ein. Ihre Sorge betrifft Familien, die von Abstimmungen „oft erst erfahren, wenn alles vorbei ist“. „Grundsätzlich … aber“ ist ein typisches Signal für eine Zustimmung mit Vorbehalt.',
            'Accord de principe avec réserve (« grundsätzlich …, aber ») : elle craint que certains groupes soient oubliés.')),
        choice('q4', aide('Warum darf kein Projekt mehr als 80 000 Euro kosten?', 'Pourquoi aucun projet ne peut-il dépasser 80 000 euros ?'),
          [['Weil die Verwaltung einen Teil des Geldes selbst braucht.'],
            ['Weil teurere Projekte vom Stadtrat entschieden werden müssen.'],
            ['Damit der Jugendbeirat seine Sportfläche bauen kann.'],
            ['Damit nicht zwei große Projekte das ganze Geld bekommen.', true]],
          aide('„Sonst könnten zwei große Vorschläge das gesamte Budget aufbrauchen, und alle anderen gingen leer aus.“ Die Grenze soll also viele kleinere Projekte möglich machen. Für die Sportfläche bedeutet sie gerade das Gegenteil: Mit hunderttausend Euro wäre sie zu teuer.',
            'Le plafond évite que deux gros projets absorbent tout le budget ; il empêche justement la grande aire de sport.')),
        choice('q5', aide('Wie reagiert Mats auf die Obergrenze?', 'Comment Mats réagit-il au plafond ?'),
          [['Er will sich beim Stadtrat über die Regel beschweren.'],
            ['Er schlägt vor, die Grenze für Jugendprojekte aufzuheben.'],
            ['Er bedauert sie, will den Vorschlag aber anpassen.', true],
            ['Er zieht den Vorschlag des Jugendbeirats zurück.']],
          aide('„Das ist schade, aber nachvollziehbar. Dann müssen wir unseren Vorschlag eben überarbeiten.“ Er bedauert die Regel („schade“), versteht sie aber („nachvollziehbar“) und denkt schon an eine kleinere Lösung: ein Dach über dem vorhandenen Basketballfeld. Die Modalpartikel „eben“ zeigt hier, dass er die Lage akzeptiert.',
            'Il regrette (schade) mais comprend (nachvollziehbar) et veut retravailler la proposition.')),
        choice('q6', aide('Was ist Dragana Petrović am Ende besonders wichtig?', 'Qu’est-ce qui compte surtout pour Dragana Petrović à la fin ?'),
          [['dass das Ergebnis jedes Vorschlags öffentlich erklärt wird', true],
            ['dass die Unterlagen auch in einfacher Sprache erscheinen'],
            ['dass die Abstimmung über mehrere Monate verteilt wird'],
            ['dass auch Kinder unter vierzehn Jahren abstimmen dürfen']],
          aide('„Mir ist wichtig, dass die Verwaltung am Ende öffentlich erklärt, was aus den Vorschlägen geworden ist, auch aus denen, die nicht gewonnen haben.“ Ihre Begründung: Sonst machen die Leute nur einmal mit. Herr Gerlach bestätigt, dass ein Bericht geplant ist.',
            'Elle veut une explication publique du sort de chaque proposition, même perdante, pour que les gens continuent à participer.')),
      ] },

    // 4 · Grammaire inductive
    { id: 'b2-gesellschaft-entdecken', kind: 'exercise', title: 'Entdecken: wer, was, wo(r) und der Genitiv', estimatedMinutes: 12,
      competences: ['lecture'],
      lesson: { description: `${aide('Lesen Sie die Sätze aus dem Gastbeitrag und aus der Bürgerversammlung. Achten Sie auf die markierten Wörter am Anfang der Relativsätze und auf die Nomen im Genitiv.', 'Lisez les phrases de la tribune et de la réunion ; observez les mots qui ouvrent les relatives et les noms au génitif.')}

SÄTZE
(1) Wer nicht gewählt ist, hat auch keine Legitimation.
(2) Wer gut organisiert ist und viele Leute mobilisieren kann, gewinnt.
(3) Außerdem soll alles, was der Bürgerrat erarbeitet hat, im Internet veröffentlicht werden.
(4) Ein halbes Jahr später liegt ein Gutachten vor, über das selbst frühere Kritiker anerkennend sprechen.
(5) Genau das ist etwas, womit viele Teilnehmende nicht gerechnet hatten.
(6) Eine Teilnehmerin, deren Familie seit drei Generationen am Hafen lebt, sagte zum Abschluss: …
(7) Die Zukunft des alten Hafengeländes · ein Gutachten des Bürgerrats · die Auswahl der Fachleute

${aide('Beantworten Sie dann die Fragen. Die Erklärungen formulieren die Regel.', 'Répondez ensuite aux questions ; les explications formulent la règle.')}` },
      questions: [
        choice('q1', aide('Sätze 1 und 2: Was bedeutet „wer“ am Anfang des Satzes?', 'Phrases 1 et 2 : que signifie « wer » en début de phrase ?'),
          [['eine bestimmte Person, die schon genannt wurde'],
            ['jede Person, auf die die Beschreibung zutrifft', true],
            ['eine Frage nach einer unbekannten Person'],
            ['eine Gruppe, die erst im Hauptsatz genannt wird']],
          aide('„Wer“ leitet hier einen Relativsatz ohne Bezugswort ein: „Wer nicht gewählt ist“ = jeder, der nicht gewählt ist. Gemeint ist keine bestimmte Person, sondern alle, für die die Beschreibung gilt. Es ist auch keine Frage: Nach dem Relativsatz folgt ein Komma und dann der Hauptsatz mit dem Verb an erster Stelle (hat, gewinnt).',
            '« wer » = celui qui, quiconque : relative sans antécédent, suivie de la principale qui commence par le verbe.')),
        choice('q2', aide('Sätze 3 und 4: Warum steht in Satz 3 „was“, in Satz 4 aber „das“?', 'Phrases 3 et 4 : pourquoi « was » dans la phrase 3, mais « das » dans la phrase 4 ?'),
          [['„Was“ bezieht sich auf ein Wort wie „alles“, „das“ auf ein Nomen.', true],
            ['„Was“ steht im Akkusativ, „das“ steht immer im Nominativ.'],
            ['„Was“ ist gesprochene Sprache, „das“ gehört zur Schriftsprache.'],
            ['„Was“ folgt immer einem Komma, „das“ folgt immer einer Präposition.']],
          aide('Nach unbestimmten Wörtern wie „alles“, „etwas“, „nichts“, „vieles“ steht das Relativpronomen „was“. Nach einem Nomen (das Gutachten, neutral) steht das Relativpronomen „das“, hier nach der Präposition „über“. Beide Pronomen können übrigens im Nominativ oder im Akkusativ stehen: In Satz 3 ist „was“ Akkusativobjekt von „erarbeitet“.',
            '« was » après alles, etwas, nichts… ; « das » (der, die) après un nom : das Gutachten, über das …')),
        choice('q3', aide('Satz 5: Woraus besteht „womit“?', 'Phrase 5 : de quoi se compose « womit » ?'),
          [['aus „wo“ und „mit“, weil es um einen Ort geht'],
            ['aus dem Fragewort „womit“: Der Satz ist eine Frage.'],
            ['aus „wo“ und „mit“, weil „etwas“ im Dativ steht'],
            ['aus „wo(r)“ und der Präposition, die „rechnen“ verlangt', true]],
          aide('Das Verb heißt „rechnen mit“. Bezieht sich der Relativsatz auf „etwas“, „alles“, „nichts“ oder auf einen ganzen Satz, verbindet man „wo“ mit der Präposition: womit, wofür, worüber (vor einem Vokal mit -r-). Ein Ort ist hier nicht gemeint, und „etwas“ ist Nominativ.',
            'Verbe à préposition (rechnen mit) + antécédent du type etwas : wo(r) + préposition, ici womit.')),
        choice('q4', aide('Satz 6: Worauf bezieht sich „deren“?', 'Phrase 6 : à quoi renvoie « deren » ?'),
          [['auf „Familie“: Die Familie lebt am Hafen.'],
            ['auf „Generationen“: Es sind mehrere Personen.'],
            ['auf „Teilnehmerin“: Ihre Familie lebt am Hafen.', true],
            ['auf „Hafen“: Der Hafen gehört der Familie.']],
          aide('„Deren“ ist ein Relativpronomen im Genitiv und zeigt, wem etwas gehört: die Familie der Teilnehmerin. Es richtet sich nach dem Bezugswort vor dem Komma (die Teilnehmerin, feminin), nicht nach dem folgenden Nomen. Bei einem maskulinen oder neutralen Bezugswort hieße es „dessen“: ein Teilnehmer, dessen Familie …',
            '« deren » = dont (possession) ; il s’accorde avec l’antécédent (die Teilnehmerin), pas avec le nom qui suit.')),
        match('q5', aide('Welche Genitivform gehört zu welcher Grundform?', 'Associez chaque nom à sa forme au génitif.'),
          [['der Bürgerrat', 'des Bürgerrats'], ['das alte Hafengelände', 'des alten Hafengeländes'], ['die Fachleute', 'der Fachleute'],
            ['die Moderation', 'der Moderation'], ['das gewählte Parlament', 'des gewählten Parlaments']],
          aide('Maskuline und neutrale Nomen bekommen im Genitiv „des“ und die Endung -s oder -es (des Bürgerrats, des Hafengeländes). Feminine Nomen und der Plural haben „der“ und keine Endung am Nomen (der Moderation, der Fachleute). Das Adjektiv nach dem Artikel endet im Genitiv immer auf -en (des alten, des gewählten).',
            'Génitif : des + -(e)s au masculin et au neutre ; der sans terminaison au féminin et au pluriel ; adjectif en -en.')),
      ] },

    // 5 · Règle
    { id: 'b2-gesellschaft-regel', kind: 'lesson', title: 'Regel: Relativsätze mit wer, was, wo(r) und das Genitivattribut', estimatedMinutes: 10,
      competences: ['lecture'],
      lesson: { description: `REGEL 1 · RELATIVSÄTZE MIT „WER“
„Wer“ leitet einen Relativsatz ohne Bezugswort ein und meint jede Person, für die die Aussage gilt (= jeder, der …). Der Relativsatz steht meistens vorn. [fr?] « wer » = celui qui, quiconque ; la relative se place en général en tête.
• Wer sich engagiert, lernt seine Stadt besser kennen.
• Wen das Thema interessiert, der kann am Montag kommen.
• Wem die Abstimmung zu kompliziert ist, dem hilft das Bürgerbüro.
Brauchen der Relativsatz und der Hauptsatz verschiedene Kasus, nimmt ein Demonstrativpronomen (der, den, dem) die Person im Hauptsatz wieder auf. Bei gleichem Kasus kann es wegfallen: Wer nicht wählt, (der) überlässt anderen die Entscheidung. [fr?] Si les cas diffèrent, la principale reprend par der / den / dem ; sinon, la reprise est facultative.

REGEL 2 · RELATIVSÄTZE MIT „WAS“
„Was“ bezieht sich nicht auf ein Nomen, sondern auf etwas Unbestimmtes oder auf einen ganzen Satz. [fr?] « was » renvoie à quelque chose d’indéterminé ou à toute une proposition.
• nach alles, etwas, nichts, vieles, manches, weniges: Alles, was der Bürgerrat erarbeitet hat, wird veröffentlicht.
• nach einem neutralen Superlativ: Das Beste, was wir tun können, ist zuhören.
• nach dem Demonstrativ „das“: Das, was du sagst, stimmt nur zum Teil.
• für einen ganzen Satz: Die Wahlbeteiligung stieg auf siebzig Prozent, was niemand erwartet hatte.
• ohne Bezugswort am Satzanfang: Was als Mittel gegen Politikverdrossenheit gedacht war, kann sie verstärken.

REGEL 3 · „WO(R)“ + PRÄPOSITION
Verlangt das Verb eine Präposition (rechnen mit, sich ärgern über, sich einsetzen für), verbindet man nach „was“-Bezugswörtern und nach einem ganzen Satz „wo“ mit der Präposition. Vor einem Vokal steht „wor-“. [fr?] Avec un verbe prépositionnel, après etwas / alles / une proposition : wo(r) + préposition.
• Das ist etwas, womit niemand gerechnet hatte.
• Die Stadt veröffentlicht alle Ergebnisse, worüber sich viele freuen.
• Bezahlbare Mieten sind das, wofür wir uns einsetzen.
Ist das Bezugswort ein Nomen, steht in geschriebenen Texten die Präposition mit dem Relativpronomen: das Gutachten, über das alle sprechen; die Idee, für die wir kämpfen. „Wo“ allein bezieht sich auf einen Ort: die Schule, wo die Versammlung stattfindet. [fr?] Après un nom : préposition + der / die / das ; « wo » seul = lieu.

REGEL 4 · DAS GENITIVATTRIBUT
Ein Nomen im Genitiv steht nach einem anderen Nomen und bestimmt es genauer. [fr?] Le complément du nom au génitif suit le nom qu’il précise.
• maskulin und neutral: des / eines + -s oder -es: die Zukunft des Hafengeländes, das Ende eines langen Abends
• feminin und Plural: der / einer, Nomen ohne Endung: die Rolle der Moderation, die Meinung der Bürger
• n-Deklination: die Idee des Kollegen, der Vorschlag des Nachbarn
• Eigennamen vorn, ohne Apostroph: Annas Vorschlag, Herrn Gerlachs Antwort
Im Gespräch hört man oft „von“ + Dativ (der Vorschlag vom Jugendbeirat). In formellen Texten wirkt der Genitiv präziser. Ohne Artikel ist „von“ die normale Form: die Meinung von Jugendlichen. [fr?] À l’oral, « von + datif » est courant ; à l’écrit soutenu, on préfère le génitif ; sans article, « von » est la norme.

REGEL 5 · DESSEN UND DEREN
Das Relativpronomen im Genitiv zeigt Besitz oder Zugehörigkeit. Es richtet sich nach dem Bezugswort; das folgende Nomen hat keinen Artikel. [fr?] dessen / deren = dont (possession) ; accord avec l’antécédent, nom suivant sans article.
• der Verein, dessen Mitglieder … · das Projekt, dessen Kosten …
• die Teilnehmerin, deren Familie … · die Bürger, deren Stimmen …

ACHTUNG
• Ein Relativsatz ohne Bezugswort für Personen beginnt mit „wer“, nie mit „der, wer“: Wer zu spät kommt, verpasst den Anfang. [fr?] « celui qui » = wer.
• Nach „alles“, „etwas“ und „nichts“ steht „was“, nicht „das“: alles, was ich weiß. [fr?] « ce que » = was.
• Für ein französisches Relativpronomen mit Präposition gibt es keine feste Übersetzung: deren / dessen für den Besitz, sonst die Präposition des Verbs (das Thema, über das wir sprechen). [fr?] « dont » se traduit selon le sens : dessen / deren (possession), über das, von dem… selon le verbe.
• Der Genitiv von Namen hat keinen Apostroph: Annas Idee. [fr?] Pas d’apostrophe : Annas Idee.` } },

    // 6 · Grammaire : s'entraîner
    { id: 'b2-gesellschaft-grammatik', kind: 'exercise', title: 'Üben: Relativsätze und Genitivattribute', estimatedMinutes: 15,
      competences: ['lecture', 'expression-ecrite'],
      lesson: { description: `${aide('Üben Sie die Relativsätze mit „wer“, „was“ und „wo(r)“ + Präposition, das Genitivattribut und „dessen“ / „deren“. Lesen Sie zuerst immer den ganzen Satz.', 'Entraînez-vous aux relatives avec wer, was, wo(r) + préposition, au génitif et à dessen / deren ; lisez d’abord toute la phrase.')}

MERKE
• wer / wen / wem: Der Kasus hängt vom Verb im Relativsatz ab. [fr?] Le cas dépend du verbe de la relative.
• alles, etwas, nichts, ganzer Satz → was; mit Präposition → wo(r) + Präposition. [fr?] Après etwas, alles… : was, ou wo(r) + préposition.
• des Bürgerrats, der Bürger; dessen / deren + Nomen ohne Artikel. [fr?] Génitif et relatif au génitif.` },
      questions: [
        fill('q1', aide('Ergänzen Sie „wer“, „wen“ oder „wem“.', 'Complétez avec wer, wen ou wem.'),
          '[[1]] sich für den Bürgerhaushalt interessiert, kommt am Montag in den Gemeindesaal. · [[2]] das Thema nicht interessiert, den laden wir trotzdem ein. · [[3]] die Abstimmung zu kompliziert ist, dem hilft das Bürgerbüro.',
          [['Wer'], ['Wen'], ['Wem']],
          aide('Der Kasus richtet sich nach dem Verb im Relativsatz: „sich interessieren“ braucht ein Subjekt (wer), „jemanden interessieren“ einen Akkusativ (wen), „jemandem zu kompliziert sein“ einen Dativ (wem). Im Hauptsatz nehmen „den“ (einladen + Akkusativ) und „dem“ (helfen + Dativ) die Person wieder auf, weil der Kasus dort ein anderer ist.',
            'Le cas de wer / wen / wem dépend du verbe de la relative ; den / dem reprennent la personne dans la principale.')),
        fill('q2', aide('Ergänzen Sie „was“ oder „das“.', 'Complétez avec was ou das.'),
          'Das ist alles, [[1]] wir bisher wissen. · Das Beste, [[2]] wir tun können, ist zuhören. · Die Wahlbeteiligung stieg auf siebzig Prozent, [[3]] niemand erwartet hatte. · Das Projekt, [[4]] die meisten Stimmen bekommt, wird im Sommer gebaut.',
          [['was'], ['was'], ['was'], ['das']],
          aide('„Was“ steht nach „alles“, nach einem neutralen Superlativ (das Beste) und wenn sich der Relativsatz auf den ganzen vorherigen Satz bezieht: Dass die Beteiligung stieg, hatte niemand erwartet. Im letzten Satz ist das Bezugswort ein Nomen (das Projekt): Dann steht das Relativpronomen „das“.',
            '« was » après alles, un superlatif neutre ou toute une proposition ; « das » après un nom neutre (das Projekt).')),
        hints(fill('q3', aide('Ergänzen Sie „wo(r)“ + Präposition.', 'Complétez avec wo(r) + préposition.'),
          'Es gibt etwas, [[1]] ich mich wirklich ärgere: Viele Vorschläge werden nie umgesetzt. · Bezahlbare Mieten sind das, [[2]] wir uns seit Jahren einsetzen. · Nichts, [[3]] wir gehofft hatten, ist passiert.',
          [['worüber'], ['wofür'], ['worauf']],
          aide('Die Präposition kommt vom Verb: sich ärgern über, sich einsetzen für, hoffen auf. Nach „etwas“, „das“ und „nichts“ verbindet man sie mit „wo“: wofür. Beginnt die Präposition mit einem Vokal, steht ein -r- dazwischen: worüber, worauf.',
            'La préposition vient du verbe (über, für, auf) ; devant une voyelle, on intercale -r- : worüber, worauf.')),
        'sich ärgern über', 'sich einsetzen für', 'hoffen auf'),
        choice('q4', aide('Welcher Satz ist in einem geschriebenen Text korrekt?', 'Quelle phrase est correcte dans un texte écrit ?'),
          [['Das ist der Vorschlag, über was wir im Mai abstimmen.'],
            ['Das ist der Vorschlag, über dem wir im Mai abstimmen.'],
            ['Das ist der Vorschlag, über den wir im Mai abstimmen.', true],
            ['Das ist der Vorschlag, den wir im Mai über abstimmen.']],
          aide('Das Bezugswort ist ein Nomen (der Vorschlag, maskulin): Präposition + Relativpronomen. „Abstimmen über“ verlangt den Akkusativ, also „über den“. „Über was“ ist umgangssprachlich und in Texten falsch; „über dem“ hat den falschen Kasus; im letzten Satz steht die Präposition an der falschen Stelle.',
            'Antécédent nominal : préposition + relatif ; abstimmen über + accusatif → über den.')),
        order('q5', C2.ordnen, [['Alles,', 'was', 'der Bürgerrat', 'erarbeitet', 'hat,', 'wird', 'im Internet', 'veröffentlicht.']],
          aide('„Alles“ ist das Bezugswort, „was“ leitet den Relativsatz ein, das konjugierte Verb „hat“ steht an dessen Ende. Der ganze Relativsatz steht zwischen zwei Kommas. Danach folgt im Hauptsatz sofort das konjugierte Verb „wird“, das Partizip „veröffentlicht“ schließt den Satz (Passiv).',
            'alles, was … hat, wird … veröffentlicht : verbe conjugué en fin de relative, puis verbe de la principale.')),
        hints(fill('q6', aide('Ergänzen Sie die Genitivformen.', 'Complétez avec les formes du génitif.'),
          'Die Meinung [[1]] Bürgerinnen und Bürger zählt. · Der Vorschlag des Jugendbeirat[[2]] hat gewonnen. · Die Rede [[3]] Bürgermeisterin war kurz. · Die Idee unseres [[4]] hat alle überzeugt.',
          [['der'], ['s', 'es'], ['der'], ['Nachbarn']],
          aide('Plural und Feminin: „der“ ohne Endung am Nomen (der Bürgerinnen und Bürger, der Bürgermeisterin). Maskulin: „des Jugendbeirats“ oder „des Jugendbeirates“, beide Formen sind richtig. „Nachbar“ gehört zur n-Deklination: Im Genitiv heißt es „des Nachbarn“, nicht „des Nachbars“.',
            'Pluriel et féminin : der ; masculin : -s ou -es ; n-Deklination : des Nachbarn.')),
        'die Bürger (Plural)', 'der Jugendbeirat', 'die Bürgermeisterin', 'der Nachbar'),
        choice('q7', aide('„Der Verein, … Mitglieder sich jeden Montag treffen, sucht neue Helfer.“ Welches Wort passt?', 'Quel mot convient ?'),
          [['deren'], ['dessen', true], ['welcher'], ['denen']],
          aide('Die Mitglieder gehören zum Verein: Das verlangt ein Relativpronomen im Genitiv. Es richtet sich nach dem Bezugswort „der Verein“ (maskulin, Singular), also „dessen“. „Deren“ stünde nach einem femininen Wort oder nach einem Plural; „denen“ ist ein Dativ, und „welcher“ wäre ein Nominativ ohne Sinn im Satz.',
            'Possession (les membres du club) et antécédent masculin singulier : dessen.')),
        choice('q8', aide('Welcher Satz passt am besten in einen formellen Bericht?', 'Quelle phrase convient le mieux à un rapport formel ?'),
          [['Der Vorschlag vom Jugendbeirat hat die meisten Stimmen bekommen.'],
            ['Der Vorschlag dem Jugendbeirat hat die meisten Stimmen bekommen.'],
            ['Der Jugendbeirats Vorschlag hat die meisten Stimmen bekommen.'],
            ['Der Vorschlag des Jugendbeirats hat die meisten Stimmen bekommen.', true]],
          aide('In einem formellen Text steht das Genitivattribut nach dem Nomen: der Vorschlag des Jugendbeirats. „Vom Jugendbeirat“ ist im Gespräch üblich, wirkt im Bericht aber umgangssprachlich. Ein Dativ ohne Präposition ist falsch, und vor dem Nomen stehen nur Eigennamen (Annas Vorschlag).',
            'Écrit formel : génitif après le nom ; « vom » est oral ; seuls les noms propres se placent devant.')),
        order('q9', C2.ordnen, [
          ['Die Teilnehmerin,', 'deren', 'Vorschlag', 'gewonnen', 'hat,', 'stellt', 'ihn', 'heute Abend', 'vor.'],
          ['Die Teilnehmerin,', 'deren', 'Vorschlag', 'heute Abend', 'gewonnen', 'hat,', 'stellt', 'ihn', 'vor.']],
          aide('Der Relativsatz beginnt mit „deren“ + Nomen ohne Artikel; das konjugierte Verb „hat“ steht am Ende. Im Hauptsatz folgt das Verb „stellt“, das Pronomen „ihn“ steht direkt danach, vor der Zeitangabe, und die Partikel „vor“ schließt den Satz. Beide Stellen der Zeitangabe sind möglich, der Sinn ändert sich leicht.',
            'deren + nom sans article ; le pronom ihn se place tôt dans la phrase ; la particule vor ferme la principale.')),
        choice('q10', aide('Welcher Satz ist richtig?', 'Quelle phrase est correcte ?'),
          [['Das ist die Schule, wo die Versammlung heute stattfindet.', true],
            ['Das ist leider alles, wo wir über das Projekt wissen.'],
            ['Wo zu spät zur Versammlung kommt, verpasst den Anfang.'],
            ['Das ist etwas, wo wir uns alle sehr darüber freuen.']],
          aide('„Wo“ allein bezieht sich auf einen Ort: die Schule, wo (= in der) die Versammlung stattfindet. Nach „alles“ steht „was“, ein Relativsatz ohne Bezugswort für Personen beginnt mit „wer“, und mit „sich freuen über“ heißt es „worüber wir uns freuen“, ohne zusätzliches „darüber“.',
            '« wo » seul = lieu ; alles, was ; wer pour « celui qui » ; worüber sans darüber.')),
      ] },

    // 7 · Lexique
    { id: 'b2-gesellschaft-wortschatz', kind: 'exercise', title: 'Wortschatz: Beteiligung und Diskussion', estimatedMinutes: 14,
      competences: ['lecture', 'expression-ecrite'],
      lesson: { description: `${aide('Lernen Sie die Wörter in Verbindungen: Nomen mit Verb, Verben mit Präposition, Wortfamilien und Redemittel für die Diskussion.', 'Apprenez les mots en combinaisons : nom et verbe, verbe et préposition, familles de mots, formules de discussion.')}

TIPP
Viele Verbindungen lassen sich nicht wörtlich übersetzen: Man „nimmt“ Stellung und Einfluss, man „gibt“ seine Stimme ab und „schließt“ einen Kompromiss. Lernen Sie diese Verbindungen immer als Block. [fr?] Beaucoup de combinaisons ne se traduisent pas mot à mot : apprenez-les en bloc.` },
      questions: [
        match('q1', aide('Welches Verb passt zu welchem Nomen?', 'Quel verbe va avec quel nom ?'),
          [['eine Petition', 'einreichen'], ['Unterschriften', 'sammeln'], ['seine Stimme', 'abgeben'], ['einen Kompromiss', 'schließen'],
            ['Verantwortung', 'übernehmen'], ['zu einer Empfehlung Stellung', 'nehmen']],
          aide('Diese Verbindungen sind fest: eine Petition einreichen, Unterschriften sammeln, seine Stimme abgeben (wählen), einen Kompromiss schließen (auch: finden, eingehen), Verantwortung übernehmen, Stellung nehmen zu + Dativ. Sie gehören zum Wortschatz jeder politischen Diskussion.',
            'Combinaisons figées : déposer une pétition, recueillir des signatures, voter, conclure un compromis, prendre ses responsabilités, prendre position.')),
        fill('q2', aide('Bilden Sie das Nomen.', 'Formez le nom.'),
          'beteiligen → die [[1]] · wählen → die [[2]] · vertreten → die [[3]] · verdrossen → die [[4]] · öffentlich → die [[5]]',
          [['Beteiligung'], ['Wahl'], ['Vertretung'], ['Verdrossenheit'], ['Öffentlichkeit']],
          aide('Aus Verben entstehen oft Nomen auf -ung (die Beteiligung, die Vertretung); „wählen“ bildet „die Wahl“ ohne Endung. Aus Adjektiven entstehen Nomen auf -heit oder -keit: verdrossen → die Verdrossenheit, öffentlich → die Öffentlichkeit (-keit nach -lich). Alle diese Nomen sind feminin.',
            'Verbes → -ung (ou forme courte : die Wahl) ; adjectifs → -heit / -keit ; tous féminins.')),
        fill('q3', aide('Ergänzen Sie die Präpositionen.', 'Complétez avec les prépositions.'),
          'Sie setzt sich seit Jahren [[1]] bezahlbare Wohnungen ein. · Mit einer Petition kann man Einfluss [[2]] die Politik nehmen. · Über zweitausend Menschen haben sich [[3]] der Abstimmung beteiligt. · Im Mai stimmen alle [[4]] die Vorschläge ab. · Der Stadtrat nimmt [[5]] jeder Empfehlung Stellung.',
          [['für'], ['auf'], ['an'], ['über'], ['zu']],
          aide('Die Präposition gehört zum Verb und muss mitgelernt werden: sich einsetzen für + Akkusativ, Einfluss nehmen auf + Akkusativ, sich beteiligen an + Dativ, abstimmen über + Akkusativ, Stellung nehmen zu + Dativ. Mit diesen Präpositionen bildet man auch wofür, worauf, woran, worüber und wozu.',
            'Prépositions régies : für, auf, an, über, zu ; elles donnent aussi wofür, worauf, woran…')),
        choice('q4', aide('Sie möchten einem Argument nur teilweise zustimmen. Was sagen Sie?', 'Vous voulez approuver un argument en partie seulement. Que dites-vous ?'),
          [['Da muss ich Ihnen leider vollkommen widersprechen.'],
            ['Da ist etwas dran, aber man muss auch bedenken, dass …', true],
            ['Das sehe ich genauso, da gibt es nichts hinzuzufügen.'],
            ['Das gehört nicht zum Thema, darüber reden wir später.']],
          aide('„Da ist etwas dran“ erkennt einen Teil des Arguments an, „aber man muss auch bedenken, dass …“ bringt die Einschränkung. Das ist die typische Struktur einer teilweisen Zustimmung. Die erste Antwort widerspricht ganz, die dritte stimmt ganz zu, die vierte weicht dem Argument aus.',
            '« Da ist etwas dran, aber … » : accord partiel suivi d’une réserve.')),
        choice('q5', aide('Was bedeutet „Politikverdrossenheit“?', 'Que signifie « Politikverdrossenheit » ?'),
          [['großes Interesse an Politik und an öffentlichen Diskussionen'],
            ['die Pflicht, an jeder Wahl teilzunehmen'],
            ['Enttäuschung über Politik und wenig Lust, mitzumachen', true],
            ['ein Streit zwischen zwei politischen Parteien']],
          aide('„Verdrossen“ heißt lustlos und verärgert. Die Politikverdrossenheit ist also eine Haltung: Menschen sind von der Politik enttäuscht und beteiligen sich deshalb weniger, zum Beispiel an Wahlen. Im Gastbeitrag ist Beteiligung als „Mittel gegen Politikverdrossenheit“ gedacht.',
            'Désenchantement envers la politique, qui pousse à moins participer.')),
        choice('q6', aide('„Die Empfehlungen des Bürgerrats sind nicht bindend.“ Was heißt das?', 'Que signifie cette phrase ?'),
          [['Der Stadtrat muss sie nicht umsetzen.', true],
            ['Die Empfehlungen sind noch nicht fertig.'],
            ['Nur die Mitglieder dürfen sie lesen.'],
            ['Sie widersprechen geltenden Gesetzen.']],
          aide('„Bindend“ bedeutet verpflichtend: Eine bindende Entscheidung muss man befolgen. „Nicht bindend“ heißt also, dass der Stadtrat frei entscheidet, ob er die Empfehlungen übernimmt. Deshalb ist es so wichtig, dass er zu jeder Empfehlung Stellung nimmt.',
            '« nicht bindend » = non contraignant : le conseil n’est pas obligé de les appliquer.')),
        match('q7', aide('Welche Funktion hat welcher Ausdruck in einem Argument?', 'Quelle fonction a chaque expression dans une argumentation ?'),
          [['zunächst einmal', 'ein erstes Argument einleiten'], ['hinzu kommt', 'ein weiteres Argument ergänzen'],
            ['allerdings', 'eine Einschränkung machen'], ['folglich', 'eine Folge nennen'], ['alles in allem', 'ein Fazit ziehen']],
          aide('Konnektoren machen die Struktur eines Textes sichtbar. Im Gastbeitrag beginnt Absatz C mit „zunächst einmal“, ergänzt mit „hinzu kommt“, und Absatz D schränkt mit „allerdings“ ein. „Folglich“ leitet eine Konsequenz ein, „alles in allem“ eine Zusammenfassung am Ende.',
            'Connecteurs : premier argument, ajout, restriction, conséquence, conclusion.')),
      ] },

    // 8 · Second document (thème pair : lecture)
    { id: 'b2-gesellschaft-lesen2', kind: 'exercise', title: 'Verstehen: eine Meldung über eine Petition', estimatedMinutes: 18,
      competences: ['lecture'],
      lesson: { description: `${C2.lesen}

TIPP
Eine Meldung beantwortet zuerst die W-Fragen (Wer? Was? Wann? Wo?), danach kommen die Stimmen der Beteiligten, oft in indirekter Rede. Achten Sie darauf, wer welche Position vertritt. [fr?] Une dépêche répond d’abord aux questions essentielles, puis donne la parole aux acteurs, souvent au discours indirect.

PETITION FÜR SONNTAGSÖFFNUNG DER STADTBIBLIOTHEK ERREICHT NÖTIGE UNTERSCHRIFTEN
Wendelstedt, 14. März. Eine Online-Petition, die eine Öffnung der Stadtbibliothek am Sonntag fordert, hat innerhalb von sechs Wochen 4 812 Unterschriften gesammelt. Damit ist die Schwelle von 4 000 Unterschriften überschritten, ab der sich der Stadtrat laut Satzung mit einem Anliegen der Einwohnerschaft befassen muss. Die Beratung ist für die Sitzung am 22. April geplant.

Gestartet hat die Petition die Lehramtsstudentin Marit Jansen. „Unter der Woche ist die Bibliothek genau dann geschlossen, wenn Berufstätige und Studierende endlich Zeit hätten“, sagte die 23-Jährige. Gerade für Kinder aus Familien, die in kleinen Wohnungen leben, sei die Bibliothek oft der einzige Ort, an dem sie in Ruhe lernen könnten. Unterstützt wird die Petition unter anderem vom Elternbeirat der Gesamtschule und vom Seniorenbeirat der Stadt.

Die Leiterin der Stadtbibliothek, Dorothea Kemmerling, begrüßt das Interesse, warnt aber vor überzogenen Erwartungen. Für eine Öffnung am Sonntag brauche ihr Haus mindestens drei zusätzliche Stellen, deren Finanzierung bisher nicht gesichert sei. Außerdem müsse geprüft werden, unter welchen Bedingungen Sonntagsarbeit in einer öffentlichen Bibliothek zulässig sei.

Im Stadtrat gehen die Meinungen auseinander. Die größte Fraktion hat ihre Unterstützung angekündigt, sofern die Kosten im nächsten Haushalt gedeckt werden können. Mehrere Ratsmitglieder halten dagegen, die Stadt solle zuerst die Öffnungszeiten unter der Woche verlängern, was deutlich günstiger wäre.

Inzwischen liegt ein Kompromissvorschlag auf dem Tisch: Die Bibliothek könnte sonntags vier Stunden lang als „offene Bibliothek“ betrieben werden. Wer einen gültigen Bibliotheksausweis besitzt, käme dann mit seiner Karte ins Gebäude, könnte Medien selbst ausleihen und zurückgeben und die Arbeitsplätze nutzen. Beratung durch Fachpersonal gäbe es in dieser Zeit allerdings nicht. Vergleichbare Modelle werden bereits in mehreren deutschen Städten erprobt.

Marit Jansen zeigte sich offen für diese Lösung. „Mir geht es nicht darum, wer am Ende recht hat, sondern darum, dass die Bibliothek für alle da ist, die sie brauchen“, sagte sie. Ob der Stadtrat dem Vorschlag folgt, wird sich im April zeigen.` },
      questions: [
        choice('q1', aide('Worum geht es in der Meldung vor allem?', 'De quoi parle surtout la dépêche ?'),
          [['um einen Streit zwischen der Bibliothek und den Eltern'],
            ['um eine Petition und die Reaktionen darauf', true],
            ['um neue Regeln für die Sonntagsarbeit in Deutschland'],
            ['um die Wahl einer neuen Leiterin der Bibliothek']],
          aide('Die Überschrift und der erste Absatz nennen das Thema: Eine Petition hat genug Unterschriften. Danach kommen die Reaktionen: die Initiatorin, die Leiterin der Bibliothek, der Stadtrat und ein Kompromissvorschlag. Die Sonntagsarbeit ist nur ein Detail, und die Eltern unterstützen die Petition, statt zu streiten.',
            'Une pétition a atteint le seuil requis ; la dépêche présente ensuite les réactions des acteurs.')),
        fill('q2', aide('Ergänzen Sie die Zahlen und Daten aus der Meldung.', 'Complétez avec les chiffres et les dates de la dépêche.'),
          'Unterschriften: [[1]] · nötige Schwelle: [[2]] Unterschriften · Beratung im Stadtrat: am [[3]] · Bedarf der Bibliothek: mindestens [[4]] zusätzliche Stellen · offene Bibliothek: sonntags [[5]] Stunden',
          [['4 812', '4812', '4.812'], ['4 000', '4000', '4.000', 'viertausend'], ['22. April', '22.4.', '22.04.', '22. 4.'], ['3', 'drei'], ['4', 'vier']],
          aide('In einer Meldung stehen die wichtigsten Zahlen meist am Anfang: 4 812 Unterschriften, Schwelle 4 000, Beratung am 22. April. Die drei Stellen nennt die Leiterin der Bibliothek, die vier Stunden stehen im Kompromissvorschlag. In deutschen Texten trennt ein schmales Leerzeichen oder ein Punkt die Tausender.',
            'Les chiffres clés : 4 812 signatures, seuil de 4 000, débat le 22 avril, trois postes, quatre heures.')),
        match('q3', aide('Wer vertritt welche Position?', 'Qui défend quelle position ?'),
          [['Marit Jansen', 'fordert Öffnungszeiten für Berufstätige und Familien'], ['Dorothea Kemmerling', 'sieht offene Fragen bei Personal und Recht'],
            ['die größte Fraktion', 'stimmt zu, wenn das Geld vorhanden ist'], ['mehrere Ratsmitglieder', 'wollen zuerst die Zeiten unter der Woche verlängern']],
          aide('Die Initiatorin denkt an Berufstätige, Studierende und Kinder aus kleinen Wohnungen. Die Leiterin der Bibliothek nennt drei Stellen ohne gesicherte Finanzierung und die Frage der Sonntagsarbeit. Die größte Fraktion stellt eine Bedingung („sofern“), andere Ratsmitglieder schlagen eine günstigere Alternative vor.',
            'Chaque acteur : la demande, les objections pratiques, le soutien sous condition, l’alternative moins chère.')),
        choice('q4', aide('Was bedeutet „sofern die Kosten im nächsten Haushalt gedeckt werden können“?', 'Que signifie cette condition ?'),
          [['Die Fraktion stimmt nur zu, wenn das nötige Geld eingeplant werden kann.', true],
            ['Die Fraktion will die Kosten mit Spenden der Bürgerinnen decken.'],
            ['Die Fraktion lehnt den Antrag ab, weil er für die Stadt zu teuer ist.'],
            ['Die Fraktion verschiebt die Entscheidung auf das nächste Jahr.']],
          aide('„Sofern“ bedeutet „unter der Bedingung, dass“ und entspricht hier „wenn“. Die Fraktion unterstützt den Antrag also grundsätzlich, aber nur, wenn im nächsten Haushalt Geld dafür vorhanden ist. Von Spenden, einer Ablehnung oder einer Verschiebung ist nicht die Rede.',
            '« sofern » = à condition que : soutien sous réserve de financement.')),
        rf('q5', 'In der offenen Bibliothek könnte man sonntags keine Fachleute um Rat fragen.', 'r',
          aide('Richtig: „Beratung durch Fachpersonal gäbe es in dieser Zeit allerdings nicht.“ Man könnte mit dem Ausweis ins Gebäude kommen, Medien selbst ausleihen und die Arbeitsplätze nutzen, aber niemand vom Personal wäre da. Der Konjunktiv (käme, könnte, gäbe) zeigt, dass es nur ein Vorschlag ist.',
            'Vrai : pas de conseil par du personnel qualifié ; le Konjunktiv II signale une simple proposition.')),
        choice('q6', aide('Welche Haltung zeigt Marit Jansen am Ende?', 'Quelle attitude Marit Jansen montre-t-elle à la fin ?'),
          [['Sie besteht auf einer Öffnung mit dem ganzen Personal.'],
            ['Sie will eine zweite Petition gegen den Stadtrat starten.'],
            ['Sie zieht die Petition zurück, weil sie zu teuer wäre.'],
            ['Sie ist bereit, den Kompromiss zu akzeptieren.', true]],
          aide('„Marit Jansen zeigte sich offen für diese Lösung.“ Ihr Zitat bestätigt das: Es geht ihr nicht ums Rechthaben, sondern darum, dass die Bibliothek für alle da ist. Eine neue Petition, einen Rückzug oder eine harte Forderung erwähnt die Meldung nicht.',
            'Elle se montre ouverte au compromis.')),
        choice('q7', aide('„… mindestens drei zusätzliche Stellen, deren Finanzierung bisher nicht gesichert sei.“ Worauf bezieht sich „deren“?', 'À quoi renvoie « deren » ?'),
          [['auf „ihr Haus“'], ['auf „die Leiterin“'], ['auf „die Stellen“', true], ['auf „die Bibliothek“']],
          aide('Das Relativpronomen im Genitiv bezieht sich auf das Nomen direkt vor dem Komma: die Stellen (Plural), also „deren“. Gemeint ist: Die Finanzierung der Stellen ist nicht gesichert. Nach „das Haus“ (neutral) müsste es „dessen“ heißen; „die Leiterin“ und „die Bibliothek“ stehen zu weit entfernt.',
            '« deren » reprend le nom juste avant la virgule : die Stellen (pluriel).')),
      ] },

    // 9 · Vérifier
    { id: 'b2-gesellschaft-kontrolle', kind: 'exercise', title: 'Prüfen: Beteiligung, Relativsätze und Genitiv', estimatedMinutes: 12,
      competences: ['lecture', 'ecoute'],
      lesson: { description: `${aide('Prüfen Sie, was Sie in diesem Modul gelernt haben: Hören, Grammatik und Wortschatz.', 'Vérifiez ce que vous avez appris dans ce module : écoute, grammaire et vocabulaire.')}

${aide('Im Lokalradio erzählt eine Hörerin von ihren Erfahrungen mit dem Bürgerhaushalt. Hören Sie den Beitrag für die Fragen 1 und 2.', 'À la radio locale, une auditrice raconte son expérience du budget participatif ; écoutez pour les questions 1 et 2.')}` },
      placements: [{ media: 'b2-gesellschaft-kontrolle-audio', caption: 'Hörertelefon im Lokalradio' }],
      questions: [
        choice('q1', aide('Wie hat sich die Haltung der Hörerin entwickelt?', 'Comment l’attitude de l’auditrice a-t-elle évolué ?'),
          [['Sie war zuerst begeistert und ist jetzt enttäuscht.'],
            ['Sie war zuerst verärgert, macht aber wieder mit.', true],
            ['Sie war von Anfang an dagegen und bleibt dabei.'],
            ['Sie hat nie mitgemacht, will es jetzt aber versuchen.']],
          aide('Ihr Vorschlag hat nicht gewonnen, „und das hat mich zuerst ziemlich geärgert“. Am Ende sagt sie aber: „Dieses Jahr mache ich also wieder mit.“ Dazwischen erklärt sie, was ihre Meinung geändert hat. Sie hat schon im letzten Jahr mitgemacht, die vierte Antwort ist also falsch.',
            'D’abord agacée, elle participe de nouveau cette année.')),
        choice('q2', aide('Was hat die Hörerin am Ende überzeugt?', 'Qu’est-ce qui a finalement convaincu l’auditrice ?'),
          [['Ihr Vorschlag hat im zweiten Jahr gewonnen.'],
            ['Die Stadt hat ihr persönlich geschrieben.'],
            ['Ein Teil der Bänke wird trotzdem aufgestellt.', true],
            ['Die Obergrenze für Projekte wurde abgeschafft.']],
          aide('„Und was mich am Ende überzeugt hat: Ein Teil der Bänke wird trotzdem aufgestellt, und zwar aus einem anderen Topf.“ Der Bericht der Stadt hat ihr die Gründe erklärt; einen persönlichen Brief erwähnt sie nicht. „Aus einem anderen Topf“ bedeutet: mit Geld aus einem anderen Budget.',
            'Une partie des bancs sera installée quand même, avec un autre budget (aus einem anderen Topf).')),
        fill('q3', aide('Ergänzen Sie die Relativpronomen.', 'Complétez avec les pronoms relatifs.'),
          '[[1]] mitreden will, muss sich informieren. · Alles, [[2]] die Verwaltung plant, sollte öffentlich sein. · Es gibt vieles, [[3]] man sich im Stadtteil einsetzen kann. · Der Bürgerrat, [[4]] Empfehlungen nicht bindend sind, braucht eine Antwort der Politik.',
          [['Wer'], ['was'], ['wofür'], ['dessen']],
          aide('„Wer“ ohne Bezugswort = jeder, der. Nach „alles“ steht „was“. „Sich einsetzen für“ ergibt nach „vieles“ die Form „wofür“. „Dessen“ zeigt die Zugehörigkeit (die Empfehlungen des Bürgerrats) und richtet sich nach dem maskulinen Bezugswort „der Bürgerrat“.',
            'wer (celui qui), was après alles, wofür (sich einsetzen für), dessen (masculin, possession).')),
        order('q4', C2.ordnen, [['Viele', 'fragen sich,', 'ob', 'der Stadtrat', 'die Empfehlungen', 'des Bürgerrats', 'ernst', 'nehmen', 'wird.']],
          aide('„Ob“ leitet eine indirekte Frage ein: Das konjugierte Verb „wird“ steht am Ende, davor der Infinitiv „nehmen“. Das Genitivattribut „des Bürgerrats“ folgt direkt auf das Nomen, zu dem es gehört (die Empfehlungen). „Ernst nehmen“ ist eine feste Verbindung.',
            'ob + verbe conjugué en fin ; le génitif suit immédiatement le nom qu’il complète.')),
        choice('q5', aide('Was ist ein „Bürgerrat“?', 'Qu’est-ce qu’un « Bürgerrat » ?'),
          [['eine Gruppe zufällig ausgewählter Einwohnerinnen und Einwohner', true],
            ['eine Partei, die sich für direkte Demokratie einsetzt'],
            ['ein gewähltes Mitglied des Stadtrats mit besonderen Aufgaben'],
            ['eine Beratungsstelle der Stadtverwaltung für Fragen zu Anträgen']],
          aide('Ein Bürgerrat besteht aus Menschen, die per Los ausgewählt werden, möglichst gemischt nach Alter, Geschlecht, Bildung und Wohnort. Er berät über eine Leitfrage und formuliert Empfehlungen. Er ist weder eine Partei noch ein gewähltes Gremium.',
            'Un groupe d’habitants tirés au sort qui formule des recommandations.')),
        fill('q6', aide('Ergänzen Sie das passende Wort.', 'Complétez avec le mot qui convient.'),
          'Der Stadtrat nimmt zu jeder Empfehlung [[1]]. · Die Initiatorin der Petition hat fast fünftausend Unterschriften [[2]]. · Am Ende haben beide Seiten einen [[3]] gefunden.',
          [['Stellung'], ['gesammelt'], ['Kompromiss']],
          aide('Feste Verbindungen: Stellung nehmen zu + Dativ (prendre position), Unterschriften sammeln, einen Kompromiss finden (oder schließen). Diese Verbindungen sind typisch für Texte über Politik und Beteiligung.',
            'Stellung nehmen, Unterschriften sammeln, einen Kompromiss finden.')),
        choice('q7', aide('Sie möchten in einer Diskussion höflich einen Einwand formulieren. Was sagen Sie?', 'Vous voulez formuler poliment une objection dans une discussion. Que dites-vous ?'),
          [['Das ist doch völliger Unsinn, was Sie da erzählen.'],
            ['Genau, das wollte ich auch gerade sagen.'],
            ['Darüber möchte ich lieber gar nicht sprechen.'],
            ['Ich verstehe Ihren Punkt, gebe aber zu bedenken, dass …', true]],
          aide('„Ich verstehe Ihren Punkt“ zeigt Respekt für die andere Meinung, „gebe aber zu bedenken, dass …“ leitet den Einwand sachlich ein. Die erste Antwort ist unhöflich, die zweite stimmt zu, und die dritte verweigert die Diskussion.',
            'Reconnaître le point de vue de l’autre, puis introduire l’objection : « gebe aber zu bedenken, dass … ».')),
      ] },
  ],
};
