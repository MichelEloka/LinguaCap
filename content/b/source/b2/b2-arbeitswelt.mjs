// Module B2 n° 3 · thème « Arbeitswelt » (lot R5). Télétravail, intelligence artificielle et équilibre entre travail et vie
// privée : un article de magazine sur les logiciels d'IA au bureau (points de vue d'une employée, d'un élu du personnel,
// d'une dirigeante, d'un chercheur et de l'autrice), un reportage radio sur le droit à la déconnexion dans une entreprise,
// une dépêche sur l'essai de la semaine de quatre jours (-lesen2, thème pair). Grammaire : passif avec verbe de modalité,
// y compris au parfait et au Konjunktiv II passé (hat … abgeschlossen werden können, hätten … geschult werden müssen), et
// équivalents du passif (sein + zu, sich lassen, adjectifs en -bar / -lich, man). Consignes et explications en allemand,
// aide française repliée ([fr?]).
import { C2, aide, choice, fill, order, match } from '../../lib.mjs';

/** « Richtig / falsch / steht nicht im Text » : r, f ou n pour la bonne réponse. */
const rf = (id, statement, answer, explanation) => choice(id, `„${statement}“ ${C2.richtigFalsch}`,
  [['richtig', answer === 'r'], ['falsch', answer === 'f'], ['steht nicht im Text', answer === 'n']], explanation);
/** Indices affichés sous les trous d'un fill (forme de base à transformer). */
const hints = (question, ...values) => ({ ...question,
  blanks: question.blanks.map((blank, index) => (values[index] ? { ...blank, hint: values[index] } : blank)) });

const VORSPANN = 'Sie fasst Besprechungen zusammen, beantwortet Kundenanfragen und schreibt Berichte vor. In vielen Büros gehört künstliche Intelligenz längst zum Alltag. Doch wer kontrolliert eigentlich, was sie tut?';
const ARTIKEL_A = 'Natalia Wróbel erinnert sich noch gut an ihren ersten Arbeitstag mit dem neuen Programm. Seit fünfzehn Jahren bearbeitet sie bei einer Versicherung in Hannover Schadensmeldungen. Früher musste jeder Brief einzeln gelesen, sortiert und beantwortet werden. Heute schlägt eine Software für jede Meldung eine Antwort vor.';

export default {
  id: 'b2-arbeitswelt',
  title: 'Arbeitswelt: Homeoffice, künstliche Intelligenz und Erreichbarkeit',
  objective: 'Comprendre un article argumenté sur l’intelligence artificielle au bureau et distinguer les points de vue, suivre un reportage radio sur le droit à la déconnexion en prenant des notes, dire ce qui doit (ou aurait dû) être fait avec le passif et ses équivalents (muss geprüft werden, lässt sich lösen, ist einzuhalten).',
  grammarFocus: ['passiv-modalverb-perfekt', 'passiversatz'],
  sources: ['Textes, reportage radio, dépêche et exercices originaux LinguaCap.'],

  vocabulary: [
    { word: 'Arbeitswelt', article: 'die', plural: 'Arbeitswelten', partOfSpeech: 'noun', translation: 'le monde du travail',
      example: 'Die Arbeitswelt verändert sich durch künstliche Intelligenz schnell.', note: null },
    { word: 'künstliche Intelligenz', partOfSpeech: 'expression', translation: 'l’intelligence artificielle (IA)',
      example: 'In vielen Büros gehört künstliche Intelligenz längst zum Alltag.', note: 'die künstliche Intelligenz · abréviation : die KI' },
    { word: 'Homeoffice', article: 'das', plural: 'Homeoffices', partOfSpeech: 'noun', translation: 'le télétravail',
      example: 'Sie arbeitet zwei Tage pro Woche im Homeoffice.', note: 'im Homeoffice arbeiten · prononciation anglaise' },
    { word: 'Erreichbarkeit', article: 'die', plural: null, partOfSpeech: 'noun', translation: 'le fait d’être joignable',
      example: 'Ständige Erreichbarkeit macht viele Beschäftigte müde.', note: 'sans pluriel · erreichbar : joignable' },
    { word: 'Feierabend', article: 'der', plural: 'Feierabende', partOfSpeech: 'noun', translation: 'la fin de la journée de travail, la soirée libre',
      example: 'Nach Feierabend liest er keine dienstlichen E-Mails mehr.', note: 'Feierabend machen : finir sa journée' },
    { word: 'abschalten', partOfSpeech: 'verb', translation: 'décrocher, se détendre (aussi : éteindre)',
      example: 'Am Wochenende kann ich endlich abschalten.', note: 'séparable : ab|schalten' },
    { word: 'Betriebsrat', article: 'der', plural: 'Betriebsräte', partOfSpeech: 'noun', translation: 'le comité d’entreprise, l’élu du personnel',
      example: 'Der Betriebsrat hat eine neue Vereinbarung durchgesetzt.', note: 'désigne l’instance ou l’un de ses membres' },
    { word: 'Vereinbarung', article: 'die', plural: 'Vereinbarungen', partOfSpeech: 'noun', translation: 'l’accord',
      example: 'Die Vereinbarung gilt seit Januar für alle Beschäftigten.', note: 'eine Vereinbarung schließen : conclure un accord' },
    { word: 'Geschäftsleitung', article: 'die', plural: 'Geschäftsleitungen', partOfSpeech: 'noun', translation: 'la direction (de l’entreprise)',
      example: 'Die Geschäftsleitung hat die neuen Regeln vorgestellt.', note: null },
    { word: 'Beschäftigte', article: 'die', plural: 'Beschäftigten', partOfSpeech: 'noun', translation: 'la salariée, l’employée',
      example: 'Alle Beschäftigten wurden zu den neuen Regeln befragt.', note: 'adjectif substantivé : ein Beschäftigter, eine Beschäftigte' },
    { word: 'automatisieren', partOfSpeech: 'verb', translation: 'automatiser',
      example: 'Viele Routinetätigkeiten lassen sich automatisieren.', note: null },
    { word: 'Routinetätigkeit', article: 'die', plural: 'Routinetätigkeiten', partOfSpeech: 'noun', translation: 'la tâche routinière',
      example: 'Die Software übernimmt vor allem Routinetätigkeiten.', note: null },
    { word: 'ersetzen', partOfSpeech: 'verb', translation: 'remplacer',
      example: 'Urteilsvermögen lässt sich kaum ersetzen.', note: 'ersetzbar : remplaçable' },
    { word: 'Fachkräftemangel', article: 'der', plural: null, partOfSpeech: 'noun', translation: 'la pénurie de main-d’œuvre qualifiée',
      example: 'Wegen des Fachkräftemangels bleiben viele Stellen frei.', note: 'sans pluriel · die Fachkraft : le professionnel qualifié' },
    { word: 'schulen', partOfSpeech: 'verb', translation: 'former (le personnel)',
      example: 'Die Beschäftigten hätten früher geschult werden müssen.', note: 'die Schulung : la formation' },
    { word: 'Weiterbildung', article: 'die', plural: 'Weiterbildungen', partOfSpeech: 'noun', translation: 'la formation continue',
      example: 'Weiterbildung sollte während der Arbeitszeit stattfinden.', note: 'sich weiterbilden : se former' },
    { word: 'einführen', partOfSpeech: 'verb', translation: 'introduire, mettre en place',
      example: 'Die Software wurde vor einem Jahr eingeführt.', note: 'séparable : ein|führen · die Einführung' },
    { word: 'nachvollziehbar', partOfSpeech: 'adjective', translation: 'compréhensible, transparent',
      example: 'Die Entscheidung ist für alle nachvollziehbar.', note: '= kann nachvollzogen werden' },
    { word: 'Kernarbeitszeit', article: 'die', plural: 'Kernarbeitszeiten', partOfSpeech: 'noun', translation: 'les plages horaires fixes (présence obligatoire)',
      example: 'Besprechungen finden nur in der Kernarbeitszeit statt.', note: null },
    { word: 'Bereitschaft', article: 'die', plural: 'Bereitschaften', partOfSpeech: 'noun', translation: 'l’astreinte',
      example: 'Wer Bereitschaft hat, bekommt einen Zuschlag.', note: 'Bereitschaft haben : être d’astreinte' },
    { word: 'Überstunden', article: null, plural: null, partOfSpeech: 'noun', translation: 'les heures supplémentaires',
      example: 'Im Dezember hat sie viele Überstunden gemacht.', note: 'toujours au pluriel dans ce sens · Überstunden machen' },
    { word: 'Erschöpfung', article: 'die', plural: null, partOfSpeech: 'noun', translation: 'l’épuisement',
      example: 'Die Zahl der Krankmeldungen wegen Erschöpfung ist gestiegen.', note: 'sans pluriel · erschöpft : épuisé' },
    { word: 'bevormunden', partOfSpeech: 'verb', translation: 'infantiliser, mettre sous tutelle',
      example: 'Viele fühlen sich durch strenge Regeln bevormundet.', note: 'bevormundend : paternaliste' },
    { word: 'Viertagewoche', article: 'die', plural: 'Viertagewochen', partOfSpeech: 'noun', translation: 'la semaine de quatre jours',
      example: 'Die Firma hat die Viertagewoche ein halbes Jahr lang getestet.', note: null },
    { word: 'eine Regelung treffen', partOfSpeech: 'expression', translation: 'adopter une disposition, une règle',
      example: 'Für die Chats muss noch eine Regelung getroffen werden.', note: 'die Regelung : la règle, le dispositif' },
  ],

  media: [
    { key: 'b2-arbeitswelt-lesen-artikel', kind: 'image', title: 'Article : quand le logiciel prend la plume',
      alt: 'Début d’un article de magazine intitulé « Wenn die Software mitschreibt » : une employée d’assurance raconte comment un logiciel propose désormais une réponse à chaque déclaration de sinistre.',
      image: { layout: 'article', kicker: 'Arbeitswelt', icon: 'laptop', title: 'Wenn die Software mitschreibt',
        byline: 'Wie künstliche Intelligenz den Büroalltag verändert · Von Dörte Reimers', lead: VORSPANN, paragraphs: [ARTIKEL_A] } },
    { key: 'b2-arbeitswelt-hoeren-audio', kind: 'audio', title: 'Reportage radio : le droit à la déconnexion dans une entreprise',
      script: [
        { voice: 'sprecher', name: 'Moderator', text: 'Abends noch schnell die Mails lesen, am Wochenende kurz ans Diensthandy gehen: Für viele Beschäftigte ist das längst normal. Ein Maschinenbauunternehmen in der Nähe von Ulm will damit Schluss machen. Seit Januar gelten dort neue Regeln. Unsere Reporterin Larissa Ahrens hat sich umgehört.' },
        { voice: 'sprecherin', name: 'Larissa Ahrens', text: 'Es ist kurz nach sieben Uhr abends in der Konstruktionsabteilung. Ömer Çelik fährt seinen Rechner herunter. Früher hätte er zu Hause noch einmal ins Postfach geschaut. Heute geht das nicht mehr: Zwischen neunzehn und sieben Uhr werden keine E-Mails zugestellt. Sie bleiben auf dem Server und kommen erst am nächsten Morgen an.' },
        { voice: 'mann2', name: 'Ömer Çelik', text: 'Am Anfang fand ich das ehrlich gesagt bevormundend. Ich bin erwachsen, ich kann selbst entscheiden, wann ich arbeite. Aber nach ein paar Wochen habe ich gemerkt, wie oft ich abends nur deshalb gearbeitet habe, weil gerade eine Nachricht kam. Inzwischen schlafe ich besser. Und meine Frau sagt, beim Abendessen bin ich endlich wieder ansprechbar.' },
        { voice: 'sprecherin', name: 'Larissa Ahrens', text: 'Die Regel ist Teil einer Vereinbarung, die Geschäftsleitung und Betriebsrat im letzten Herbst geschlossen haben. Annette Raabe leitet die Personalabteilung.' },
        { voice: 'frau3', name: 'Annette Raabe', text: 'Wir hatten bei einer internen Befragung festgestellt, dass fast jeder Dritte regelmäßig nach Feierabend erreichbar war, obwohl das niemand ausdrücklich verlangt hatte. Gleichzeitig ist die Zahl der Krankmeldungen wegen Erschöpfung gestiegen. So konnte es nicht weitergehen.' },
        { voice: 'sprecherin', name: 'Larissa Ahrens', text: 'Neben der E-Mail-Pause gibt es zwei weitere Neuerungen. Erstens eine Kernarbeitszeit von zehn bis fünfzehn Uhr: Nur in diesem Zeitraum dürfen Besprechungen angesetzt werden. Zweitens dürfen alle, deren Tätigkeit es erlaubt, an zwei Tagen pro Woche im Homeoffice arbeiten.' },
        { voice: 'frau3', name: 'Annette Raabe', text: 'Natürlich lässt sich nicht jede Tätigkeit von zu Hause erledigen. In der Produktion geht das nicht. Deshalb haben wir dort andere Lösungen gesucht, zum Beispiel flexiblere Schichtpläne, die von den Teams selbst gestaltet werden können.' },
        { voice: 'sprecherin', name: 'Larissa Ahrens', text: 'Und was passiert, wenn es doch einmal brennt, wenn zum Beispiel ein Kunde nachts eine dringende Frage hat?' },
        { voice: 'frau3', name: 'Annette Raabe', text: 'Für echte Notfälle gibt es ein Bereitschaftstelefon. Wer Bereitschaft hat, bekommt dafür einen Zuschlag. Alle anderen müssen nicht reagieren, und das darf ihnen auch nicht negativ angerechnet werden.' },
        { voice: 'sprecherin', name: 'Larissa Ahrens', text: 'Für die Personalleiterin hängt der Erfolg vor allem von den Führungskräften ab.' },
        { voice: 'frau3', name: 'Annette Raabe', text: 'Wenn die Chefin um zehn Uhr abends noch Nachrichten schreibt, nützt die beste Regel nichts. Deshalb haben alle Führungskräfte eine Schulung bekommen. Dort wurde auch geübt, wie Aufgaben so geplant werden können, dass abends nichts mehr erledigt werden muss.' },
        { voice: 'sprecherin', name: 'Larissa Ahrens', text: 'Ganz zufrieden ist trotzdem nicht jeder. Fabian Kerner sitzt im Betriebsrat und hat die Vereinbarung mit ausgehandelt.' },
        { voice: 'mann3', name: 'Fabian Kerner', text: 'Die Regeln sind ein großer Fortschritt, keine Frage. Aber sie gelten bisher nur für E-Mails. Über die Chatgruppen auf dem Diensthandy kommen abends immer noch Nachrichten, manchmal sogar mehr als früher. Das hätte von Anfang an mitgeregelt werden müssen.' },
        { voice: 'mann3', name: 'Fabian Kerner', text: 'Wir verhandeln gerade darüber. Mein Ziel ist, dass bis zum Sommer auch die Chats in der Ruhezeit stumm bleiben.' },
        { voice: 'sprecherin', name: 'Larissa Ahrens', text: 'Und Ömer Çelik? Er hat für sich noch eine eigene Regel eingeführt.' },
        { voice: 'mann2', name: 'Ömer Çelik', text: 'Das Diensthandy bleibt nach Feierabend in der Schublade. Wenn etwas wirklich wichtig ist, gibt es ja das Bereitschaftstelefon.' },
        { voice: 'sprecherin', name: 'Larissa Ahrens', text: 'Nach einem halben Jahr will das Unternehmen Bilanz ziehen, mit einer zweiten Befragung im Juli. Dann wird sich zeigen, ob aus der Ausnahme eine neue Normalität geworden ist.' },
      ] },
    { key: 'b2-arbeitswelt-kontrolle-audio', kind: 'audio', title: 'Message vocal du service du personnel',
      script: [
        { voice: 'frau3', name: 'Annette Raabe', text: 'Guten Tag, hier spricht Annette Raabe aus der Personalabteilung. Ich melde mich wegen der zweiten Befragung zu unseren neuen Arbeitszeitregeln. Der Fragebogen ist ab heute im Intranet freigeschaltet und muss bis Freitag nächster Woche ausgefüllt werden. Er dauert ungefähr zehn Minuten.' },
        { voice: 'frau3', name: 'Annette Raabe', text: 'Die Befragung ist anonym: Die Antworten können nicht einzelnen Personen zugeordnet werden. Besonders interessiert uns diesmal, wie die Regeln in der Produktion funktionieren. Die Ergebnisse sollen im September auf einer Betriebsversammlung vorgestellt werden. Vielen Dank für Ihre Unterstützung!' },
      ] },
  ],

  activities: [
    // 1 · Einstieg
    { id: 'b2-arbeitswelt-einstieg', kind: 'lesson', title: 'Einstieg: Arbeit im Wandel', estimatedMinutes: 10,
      competences: ['lecture', 'expression-orale'],
      lesson: { description: `ARBEITSWELT
[fr?] Le monde du travail
${aide('Homeoffice, künstliche Intelligenz, ständige Erreichbarkeit: Die Arbeitswelt verändert sich schnell. In diesem Modul geht es darum, was sich verändert, wer davon profitiert und welche Regeln es dafür braucht.', 'Télétravail, intelligence artificielle, joignabilité permanente : le monde du travail change vite. Ce module se demande ce qui change, à qui cela profite et quelles règles il faut fixer.')}

FRAGEN ZUM EINSTIEG
• ${aide('Wie hat sich Ihre Arbeit oder Ihre Ausbildung in den letzten Jahren verändert?', 'Comment votre travail ou votre formation a-t-il changé ces dernières années ?')}
• ${aide('Lesen Sie nach Feierabend berufliche Nachrichten? Warum oder warum nicht?', 'Lisez-vous des messages professionnels après le travail ? Pourquoi ?')}
• ${aide('Welche Aufgaben könnte Ihnen eine Software abnehmen, welche auf keinen Fall?', 'Quelles tâches un logiciel pourrait-il faire à votre place, et lesquelles en aucun cas ?')}
${aide('Antworten Sie in Gedanken auf Deutsch, jeweils in drei oder vier Sätzen.', 'Répondez mentalement en allemand, en trois ou quatre phrases à chaque fois.')}

ZIELE
• ${aide('Ich kann einen Artikel über künstliche Intelligenz im Büro verstehen und die Positionen der Beteiligten unterscheiden.', 'Je peux comprendre un article sur l’IA au bureau et distinguer les positions des personnes concernées.')}
• ${aide('Ich kann einer Radioreportage über Erreichbarkeit folgen und dabei Notizen machen.', 'Je peux suivre un reportage radio sur la joignabilité en prenant des notes.')}
• ${aide('Ich kann sagen, was getan werden muss oder hätte getan werden müssen.', 'Je peux dire ce qui doit être fait ou ce qui aurait dû être fait (passif avec verbe de modalité).')}
• ${aide('Ich kann Alternativen zum Passiv verwenden: „Das lässt sich lösen.“ „Die Regeln sind einzuhalten.“', 'Je peux employer des équivalents du passif : « cela peut se résoudre », « les règles sont à respecter ».')}

WICHTIGE WÖRTER
• die Erreichbarkeit — man kann jemanden jederzeit kontaktieren
• der Feierabend — die Zeit nach dem Ende der Arbeit
• die künstliche Intelligenz — Software, die Aufgaben selbstständig löst
• der Betriebsrat — die gewählte Vertretung der Beschäftigten
• die Vereinbarung — eine Regel, auf die sich zwei Seiten geeinigt haben
• automatisieren — eine Arbeit von Maschinen erledigen lassen
• die Weiterbildung — Lernen im Beruf, nach der Ausbildung
• abschalten — nach der Arbeit zur Ruhe kommen` } },

    // 2 · Lecture longue : article argumenté et points de vue
    { id: 'b2-arbeitswelt-lesen', kind: 'exercise', title: 'Verstehen: künstliche Intelligenz im Büro', estimatedMinutes: 22,
      competences: ['lecture'],
      lesson: { description: `${C2.lesen}

STRATEGIE
1. ${aide('Global: Lesen Sie Titel, Vorspann und den letzten Absatz. Welche Frage stellt der Artikel, und wie beantwortet ihn die Autorin?', 'Lecture globale : lisez le titre, le chapeau et le dernier paragraphe. Quelle question l’article pose-t-il, et quelle réponse l’autrice donne-t-elle ?')}
2. ${aide('Selektiv: Vier Personen kommen zu Wort. Markieren Sie in Gedanken, wer welche Position vertritt: Angestellte, Betriebsrat, Geschäftsführerin, Forscher.', 'Lecture sélective : quatre personnes s’expriment. Repérez qui défend quelle position : employée, élu du personnel, dirigeante, chercheur.')}
3. ${aide('Detailliert: Achten Sie auf Wörter, die eine Haltung zeigen: „allerdings“, „im Gegenteil“, „zwar … aber“, „mit einer Einschränkung“.', 'Lecture détaillée : repérez les mots qui marquent une position : allerdings, im Gegenteil, zwar … aber, mit einer Einschränkung.')}

WENN DIE SOFTWARE MITSCHREIBT
[fr?] Article de magazine : quand le logiciel prend la plume
Wie künstliche Intelligenz den Büroalltag verändert · Von Dörte Reimers
${VORSPANN}
(A) ${ARTIKEL_A} „Am Anfang hatte ich Angst, dass ich bald überflüssig bin“, sagt sie. „Inzwischen sehe ich das anders. Die Standardfälle erledigt das Programm, und ich habe mehr Zeit für die schwierigen Fälle, in denen Menschen wirklich Hilfe brauchen.“ Ganz ohne Kontrolle geht es allerdings nicht: Jeder Vorschlag ist von einem Menschen zu prüfen, bevor er verschickt wird.
(B) Genau hier sieht Konrad Hofstetter das Problem. Er vertritt als Betriebsrat die Beschäftigten eines großen Logistikunternehmens und beobachtet, dass die Arbeit zwar anders, aber nicht unbedingt leichter wird. „Wer zwanzig Vorschläge pro Stunde prüfen soll, prüft irgendwann nicht mehr richtig“, warnt er. Hinzu kommt ein neuer Leistungsdruck: „Was gestern als gute Leistung galt, gilt heute als Mindestmaß.“ In seinem Betrieb wurde eine ähnliche Software vor einem Jahr eingeführt, ohne dass die Belegschaft vorher ausreichend informiert worden war. „Die Kolleginnen und Kollegen hätten viel früher geschult werden müssen“, sagt Hofstetter. Inzwischen hat der Betriebsrat eine Vereinbarung durchgesetzt: Was die Software tut, muss für alle nachvollziehbar sein, und keine Leistung darf heimlich gemessen werden.
(C) Ulrike Eichhorn leitet eine Steuerberatungskanzlei mit sechzig Angestellten. Sie hält die Sorgen für verständlich, aber übertrieben. „Wir haben niemanden entlassen. Im Gegenteil: Ohne die neuen Werkzeuge hätten wir die vielen Steuererklärungen gar nicht mehr bearbeiten können, weil wir seit Jahren keine Fachkräfte finden.“ Für sie ist künstliche Intelligenz vor allem ein Mittel gegen den Fachkräftemangel. Seit die Software die Belege vorsortiert, haben ihre Angestellten wieder mehr Zeit für persönliche Gespräche mit der Kundschaft. „Genau dafür haben die meisten diesen Beruf gewählt“, sagt sie. Dass nicht alles reibungslos lief, gibt sie offen zu: Ein Projekt zur automatischen Prüfung von Belegen hat nicht rechtzeitig abgeschlossen werden können, weil die Daten zu ungenau waren.
(D) Der Arbeitsforscher Arne Lütjens hält beide Perspektiven für berechtigt. Seine Untersuchungen zeigen, dass sich vor allem Routinetätigkeiten automatisieren lassen: Daten übertragen, Texte zusammenfassen, Termine koordinieren. Was sich dagegen kaum ersetzen lässt, sind Urteilsvermögen, Einfühlungsvermögen und Verantwortung. Lütjens warnt außerdem davor, die Technik zu überschätzen: Viele Programme liefern Ergebnisse, die überzeugend klingen, aber nicht immer stimmen. Jede Antwort ist deshalb kritisch zu prüfen, so überzeugend sie auch formuliert sein mag. „Die entscheidende Frage ist nicht, ob Arbeitsplätze verschwinden, sondern wie sie sich verändern“, sagt Lütjens. Nach seinen Beobachtungen gibt es in Unternehmen, die ihre Beschäftigten früh einbeziehen, deutlich weniger Konflikte.
(E) Ich halte diese Sicht für die vernünftigste, allerdings mit einer Einschränkung. Dass Technik die Arbeit verändert, ist nichts Neues; neu ist das Tempo. Wenn Programme alle paar Monate neue Funktionen bekommen, reicht eine einmalige Schulung nicht aus. Weiterbildung muss Teil der Arbeitszeit werden und darf nicht in den Feierabend verschoben werden. Sonst profitieren am Ende nur diejenigen, die ohnehin Zeit und Energie haben, sich selbst weiterzubilden. Die Software schreibt mit. Was sie schreibt, sollten aber weiterhin Menschen verantworten.` },
      placements: [{ media: 'b2-arbeitswelt-lesen-artikel', caption: 'Artikel aus einem Wirtschaftsmagazin' }],
      questions: [
        choice('q1', aide('Worum geht es in dem Artikel vor allem?', 'De quoi l’article parle-t-il surtout ?'),
          [['um eine neue Software, die eine Hannoveraner Versicherung entwickelt hat'],
            ['um die Zahl der Büroarbeitsplätze, die bis 2030 verschwinden werden'],
            ['um die Frage, wie KI die Büroarbeit verändert und wer sie kontrolliert', true],
            ['um Tipps, wie man KI-Programme im Büroalltag richtig bedient']],
          aide('Der Vorspann fragt: „Doch wer kontrolliert eigentlich, was sie tut?“ Alle Absätze behandeln die Veränderung der Büroarbeit durch KI. Die Versicherung hat die Software nicht entwickelt, sondern benutzt sie; Zahlen über Arbeitsplätze und Bedienungstipps kommen nicht vor.',
            'Le chapeau pose la question du contrôle de l’IA, et chaque paragraphe traite de ses effets sur le travail de bureau. L’assurance utilise le logiciel sans l’avoir créé ; il n’y a ni chiffres sur les emplois ni conseils d’utilisation.')),
        choice('q2', aide('Welche Position vertritt die Autorin im letzten Absatz?', 'Quelle position l’autrice défend-elle dans le dernier paragraphe ?'),
          [['Sie stimmt Lütjens zu, verlangt aber Weiterbildung während der Arbeitszeit.', true],
            ['Sie hält die Sorgen der Beschäftigten wie Frau Eichhorn für übertrieben.'],
            ['Sie fordert, den Einsatz von KI in Büros gesetzlich zu verbieten.'],
            ['Sie meint, dass eine einmalige Schulung für alle Beschäftigten ausreicht.']],
          aide('„Ich halte diese Sicht für die vernünftigste, allerdings mit einer Einschränkung“: Sie teilt die Sicht von Lütjens. Ihre Einschränkung: „Weiterbildung muss Teil der Arbeitszeit werden.“ Eine einmalige Schulung reicht für sie gerade nicht aus, und ein Verbot fordert sie nicht.',
            'Elle partage l’avis de Lütjens, avec une réserve : la formation continue doit faire partie du temps de travail. Une formation unique ne suffit justement pas, et elle ne demande aucune interdiction.')),
        rf('q3', 'Natalia Wróbel hat heute noch Angst, dass die Software sie überflüssig macht.', 'f',
          aide('Falsch: „Am Anfang hatte ich Angst … Inzwischen sehe ich das anders.“ „Am Anfang“ und „inzwischen“ zeigen, dass sich ihre Meinung geändert hat.',
            'Faux : elle avait peur au début, mais « inzwischen » (entre-temps) elle voit les choses autrement.')),
        rf('q4', 'Laut der Vereinbarung in Hofstetters Betrieb darf die Leistung der Beschäftigten nicht heimlich gemessen werden.', 'r',
          aide('Richtig: „… und keine Leistung darf heimlich gemessen werden.“ Das ist ein Passiv mit Modalverb: Niemand darf die Leistung heimlich messen.',
            'Vrai : l’accord interdit de mesurer en secret la performance des salariés (passif avec verbe de modalité).')),
        choice('q5', aide('Was lässt sich aus Ulrike Eichhorns Aussagen schließen?', 'Que peut-on déduire des propos d’Ulrike Eichhorn ?'),
          [['Ihre Kanzlei hat wegen der KI mehrere Stellen abgebaut.'], ['Das Projekt zur Prüfung der Belege war ein voller Erfolg.'],
            ['Sie hält die Ängste der Beschäftigten für völlig unbegründet.'], ['Ohne KI würde ihrer Kanzlei noch mehr Personal fehlen.', true]],
          aide('„Ohne die neuen Werkzeuge hätten wir die vielen Steuererklärungen gar nicht mehr bearbeiten können, weil wir seit Jahren keine Fachkräfte finden.“ Daraus folgt: Die KI gleicht fehlendes Personal aus. Entlassen hat sie niemanden, das Projekt wurde nicht rechtzeitig fertig, und sie findet die Sorgen „verständlich“.',
            'Sans ces outils, son cabinet n’aurait pas pu traiter les dossiers faute de personnel qualifié. Elle n’a licencié personne, le projet a pris du retard, et elle juge les inquiétudes compréhensibles, donc pas totalement infondées.')),
        rf('q6', 'Arne Lütjens hat selbst eine Software für Büros entwickelt.', 'n',
          aide('Steht nicht im Text: Lütjens ist Arbeitsforscher, und es ist von seinen Untersuchungen die Rede. Ob er selbst Software entwickelt hat, sagt der Artikel nicht.',
            'Non mentionné : on sait seulement qu’il étudie le travail ; rien n’est dit sur un logiciel qu’il aurait développé.')),
        match('q7', aide('Welche Überschrift passt zu welchem Absatz? Ordnen Sie zu.', 'Quel intertitre convient à quel paragraphe ? Associez.'),
          [['Absatz A', 'Mehr Zeit für die schwierigen Fälle'], ['Absatz B', 'Prüfen im Akkord'], ['Absatz C', 'Ein Mittel gegen den Fachkräftemangel'],
            ['Absatz D', 'Was sich nicht ersetzen lässt'], ['Absatz E', 'Lernen darf nicht die Freizeit kosten']],
          aide('A: Wróbel hat dank der Software mehr Zeit für schwierige Fälle. B: Wer zwanzig Vorschläge pro Stunde prüfen soll, arbeitet „im Akkord“, also unter Zeitdruck. C: Eichhorn sieht KI als Mittel gegen den Fachkräftemangel. D: Urteilsvermögen und Verantwortung lassen sich kaum ersetzen. E: Weiterbildung gehört in die Arbeitszeit.',
            'A : plus de temps pour les cas difficiles ; B : contrôler à la chaîne (im Akkord) ; C : un remède à la pénurie de personnel ; D : ce qui ne se remplace pas ; E : se former ne doit pas empiéter sur le temps libre.')),
        fill('q8', aide('Welches Wort aus dem Text passt? Ergänzen Sie.', 'Quel mot du texte convient ? Complétez.'),
          'Absatz A: Jeder Vorschlag der Software ist von einem [[1]] zu prüfen. · Absatz B: Hofstetter vertritt als [[2]] die Beschäftigten eines Logistikunternehmens. · Absatz D: Kaum ersetzen lassen sich Urteilsvermögen, Einfühlungsvermögen und [[3]].',
          [['Menschen'], ['Betriebsrat', 'Betriebsratsmitglied'], ['Verantwortung']],
          aide('„von einem Menschen“: Dativ mit n-Deklination (der Mensch, dem Menschen). „Betriebsrat“ bezeichnet das Gremium und auch seine Mitglieder. Absatz D nennt drei Fähigkeiten, die sich kaum ersetzen lassen; die dritte ist die Verantwortung.',
            'Mensch suit la n-Deklination : von einem Menschen. Betriebsrat désigne l’instance comme ses membres. La troisième capacité citée est la responsabilité.')),
      ] },

    // 3 · Écoute longue avec prise de notes
    { id: 'b2-arbeitswelt-hoeren', kind: 'exercise', title: 'Verstehen: eine Reportage über das Recht auf Feierabend', estimatedMinutes: 22,
      competences: ['ecoute'],
      lesson: { description: `${C2.hoeren}

SITUATION
${aide('In einer Radioreportage besucht Larissa Ahrens ein Maschinenbauunternehmen, das neue Regeln für die Erreichbarkeit eingeführt hat. Sie spricht mit einem Ingenieur, mit der Personalleiterin und mit einem Mitglied des Betriebsrats.', 'Dans un reportage radio, Larissa Ahrens visite une entreprise de construction mécanique qui a instauré de nouvelles règles sur la joignabilité. Elle interroge un ingénieur, la DRH et un élu du personnel.')}

STRATEGIE
1. ${aide('Erstes Hören: Welche Regeln gibt es, und wer bewertet sie wie?', 'Première écoute : quelles sont les règles, et qui les juge comment ?')}
2. ${aide('Lesen Sie dann die Notizen. Zahlen und Uhrzeiten hören Sie in Wörtern: „neunzehn Uhr“ können Sie als „19“ schreiben.', 'Lisez ensuite les notes. Les nombres et les heures sont dits en toutes lettres : vous pouvez écrire « 19 » pour « neunzehn Uhr ».')}
3. ${aide('Zweites Hören: Achten Sie auf Signalwörter wie „erstens“, „zweitens“, „aber“ und „trotzdem“.', 'Deuxième écoute : repérez les mots-signaux comme « erstens », « zweitens », « aber » et « trotzdem ».')}` },
      placements: [{ media: 'b2-arbeitswelt-hoeren-audio', caption: 'Radioreportage: Recht auf Feierabend' }],
      questions: [
        fill('q1', C2.notizen,
          'Neue Regeln seit: [[1]] · keine E-Mails zwischen [[2]] und sieben Uhr · Kernarbeitszeit: [[3]] bis fünfzehn Uhr, nur dann Besprechungen · Homeoffice: [[4]] Tage pro Woche · echte Notfälle: das [[5]]',
          [['Januar'], ['neunzehn', '19', '19 Uhr', 'neunzehn Uhr'], ['zehn', '10', '10 Uhr', 'zehn Uhr'], ['zwei', '2'], ['Bereitschaftstelefon', 'Bereitschaftshandy']],
          aide('„Seit Januar gelten dort neue Regeln.“ „Zwischen neunzehn und sieben Uhr werden keine E-Mails zugestellt.“ Kernarbeitszeit „von zehn bis fünfzehn Uhr“; Homeoffice „an zwei Tagen pro Woche“; „Für echte Notfälle gibt es ein Bereitschaftstelefon.“',
            'Depuis janvier ; pas de courriels entre 19 h et 7 h ; plages fixes de 10 h à 15 h ; deux jours de télétravail ; un téléphone d’astreinte pour les urgences.')),
        fill('q2', C2.notizen,
          'Befragung: fast jeder [[1]] war nach Feierabend erreichbar · mehr Krankmeldungen wegen [[2]] · Produktion: flexiblere [[3]] statt Homeoffice · Kritik des Betriebsrats: Die Regeln gelten nur für [[4]], nicht für Chats · zweite Befragung im [[5]]',
          [['Dritte'], ['Erschöpfung'], ['Schichtpläne'], ['E-Mails', 'Mails', 'E-Mail'], ['Juli']],
          aide('Frau Raabe: „fast jeder Dritte“ war erreichbar, und es gab mehr Krankmeldungen „wegen Erschöpfung“. Für die Produktion gibt es „flexiblere Schichtpläne“. Herr Kerner: Die Regeln „gelten bisher nur für E-Mails“. Die zweite Befragung findet „im Juli“ statt.',
            'Presque un salarié sur trois était joignable le soir ; plus d’arrêts maladie pour épuisement ; des plannings d’équipe plus souples en production ; les règles ne visent que les courriels ; nouvelle enquête en juillet.')),
        choice('q3', aide('Wie fand Ömer Çelik die E-Mail-Pause am Anfang?', 'Qu’a pensé Ömer Çelik de la pause des courriels au début ?'),
          [['Er war sofort begeistert, weil er abends nie arbeiten wollte.'], ['Er fand sie bevormundend, weil er selbst entscheiden wollte.', true],
            ['Er hielt sie für unnötig, weil er abends nie Mails las.'], ['Er hatte Angst, wichtige Kundenanfragen zu verpassen.']],
          aide('„Am Anfang fand ich das ehrlich gesagt bevormundend. Ich bin erwachsen, ich kann selbst entscheiden, wann ich arbeite.“ Erst später merkte er, wie oft er abends gearbeitet hatte. Er las also durchaus abends Mails.',
            'Il trouvait la règle paternaliste : adulte, il voulait décider seul. Ce n’est qu’ensuite qu’il a vu combien il travaillait le soir.')),
        choice('q4', aide('Warum hat das Unternehmen die neuen Regeln eingeführt?', 'Pourquoi l’entreprise a-t-elle instauré ces règles ?'),
          [['Weil der Betriebsrat mit einem Streik gedroht hatte.'], ['Weil sich mehrere Kunden über zu späte Antworten beschwert hatten.'],
            ['Weil viele ungefragt erreichbar waren und Erschöpfung zunahm.', true], ['Weil die Produktion neue Schichtpläne brauchte.']],
          aide('Frau Raabe nennt zwei Gründe: Fast jeder Dritte war erreichbar, „obwohl das niemand ausdrücklich verlangt hatte“, und die Krankmeldungen „wegen Erschöpfung“ sind gestiegen. Die Schichtpläne sind eine Folge der Regeln, kein Grund dafür.',
            'Deux raisons : beaucoup restaient joignables sans qu’on le leur demande, et les arrêts pour épuisement augmentaient. Les nouveaux plannings sont une conséquence, pas une cause.')),
        choice('q5', aide('Was gilt laut Annette Raabe für Beschäftigte ohne Bereitschaft?', 'Selon Annette Raabe, qu’en est-il des salariés qui ne sont pas d’astreinte ?'),
          [['Sie müssen nicht reagieren, und das darf ihnen nicht schaden.', true], ['Sie müssen Notfälle am nächsten Morgen sofort bearbeiten.'],
            ['Sie bekommen einen Zuschlag, wenn sie trotzdem antworten.'], ['Sie dürfen ihr Diensthandy nicht mit nach Hause nehmen.']],
          aide('„Alle anderen müssen nicht reagieren, und das darf ihnen auch nicht negativ angerechnet werden.“ Den Zuschlag bekommen nur die Beschäftigten mit Bereitschaft. Das Handy in der Schublade ist die persönliche Regel von Herrn Çelik.',
            'Ils n’ont pas à répondre, et on ne peut pas le leur reprocher. La prime est réservée à l’astreinte ; le téléphone dans le tiroir est la règle personnelle de M. Çelik.')),
        choice('q6', aide('Was kritisiert Fabian Kerner an der Vereinbarung?', 'Que reproche Fabian Kerner à l’accord ?'),
          [['Sie kommt für die Beschäftigten der Produktion viel zu spät.'], ['Sie schränkt die Freiheit der Beschäftigten zu stark ein.'],
            ['Sie wurde ohne den Betriebsrat ausgehandelt.'], ['Sie lässt mit den Chats eine wichtige Lücke offen.', true]],
          aide('„Aber sie gelten bisher nur für E-Mails. Über die Chatgruppen … kommen abends immer noch Nachrichten. Das hätte von Anfang an mitgeregelt werden müssen.“ Er hat die Vereinbarung selbst „mit ausgehandelt“ und nennt sie „einen großen Fortschritt“.',
            'Les règles ne couvrent que les courriels, pas les messageries : c’est une lacune. Il a lui-même négocié l’accord et le juge comme un grand progrès.')),
      ] },

    // 4 · Grammaire inductive
    { id: 'b2-arbeitswelt-entdecken', kind: 'exercise', title: 'Entdecken: Was muss getan werden?', estimatedMinutes: 10,
      competences: ['lecture'],
      lesson: { description: `${aide('Lesen Sie die Sätze aus dem Artikel und aus der Reportage. Achten Sie auf die Verben und auf „zu“, „lassen“ und „-bar“.', 'Lisez ces phrases de l’article et du reportage. Observez les verbes, ainsi que « zu », « lassen » et « -bar ».')}

SÄTZE
(1) Früher musste jeder Brief einzeln gelesen, sortiert und beantwortet werden.
(2) Jeder Vorschlag ist von einem Menschen zu prüfen.
(3) Die Kolleginnen und Kollegen hätten viel früher geschult werden müssen.
(4) Ein Projekt hat nicht rechtzeitig abgeschlossen werden können.
(5) … dass sich vor allem Routinetätigkeiten automatisieren lassen.
(6) Was die Software tut, muss für alle nachvollziehbar sein.
(7) Natürlich lässt sich nicht jede Tätigkeit von zu Hause erledigen.
(8) Das hätte von Anfang an mitgeregelt werden müssen.

${aide('Beantworten Sie dann die Fragen. Die Erklärungen formulieren die Regel.', 'Répondez ensuite aux questions : les explications formulent la règle.')}` },
      questions: [
        choice('q1', aide('Sätze 1, 3, 4 und 8: Was haben sie gemeinsam?', 'Phrases 1, 3, 4 et 8 : qu’ont-elles en commun ?'),
          [['Aktiv mit Modalverb: Das Subjekt handelt selbst.'], ['Zustandspassiv: sein + Partizip II, ein Ergebnis wird beschrieben'],
            ['Konjunktiv I: Jemand gibt die Aussage einer anderen Person wieder.'], ['Passiv mit Modalverb: Partizip II + werden + Modalverb', true]],
          aide('In allen vier Sätzen wird gesagt, was getan werden muss, kann oder musste, ohne dass der Handelnde wichtig ist: gelesen werden musste, geschult werden müssen, abgeschlossen werden können, mitgeregelt werden müssen. Partizip II + „werden“ ist das Passiv, dazu kommt ein Modalverb.',
            'Dans les quatre phrases, on dit ce qui doit ou peut être fait, sans insister sur qui agit : participe II + werden (passif) + verbe de modalité.')),
        match('q2', aide('In welcher Zeitform steht das Passiv mit Modalverb? Ordnen Sie zu.', 'À quel temps est ce passif avec verbe de modalité ? Associez.'),
          [['Die Ergebnisse müssen geprüft werden.', 'Präsens'], ['… musste beantwortet werden (Satz 1)', 'Präteritum'],
            ['… hat nicht abgeschlossen werden können (Satz 4)', 'Perfekt'], ['… hätten geschult werden müssen (Satz 3)', 'Konjunktiv II der Vergangenheit']],
          aide('Nur das Modalverb ändert sich: müssen (Präsens), musste (Präteritum), hat … können (Perfekt), hätten … müssen (Konjunktiv II der Vergangenheit). Im Perfekt und im Konjunktiv II stehen am Ende drei Verben: Partizip II + werden + Modalverb im Infinitiv.',
            'Seul le verbe de modalité change de temps. Au parfait et au Konjunktiv II passé, trois verbes finissent la phrase : participe + werden + modal à l’infinitif.')),
        choice('q3', aide('Satz 2: Wie kann man „ist … zu prüfen“ mit einem Passiv ausdrücken?', 'Phrase 2 : comment exprimer « ist … zu prüfen » avec un passif ?'),
          [['Jeder Vorschlag ist schon geprüft worden.'], ['Jeder Vorschlag muss geprüft werden.', true],
            ['Jeder Vorschlag wird geprüft haben.'], ['Jeder Vorschlag hat geprüft werden.']],
          aide('„sein + zu + Infinitiv“ ersetzt ein Passiv mit „müssen“ (oder „können“). Hier geht es um eine Pflicht: Jeder Vorschlag muss geprüft werden. „Ist schon geprüft worden“ bedeutet etwas anderes: Die Prüfung ist schon passiert.',
            'sein + zu + infinitif équivaut à un passif avec müssen (ou können) : ici une obligation. « ist geprüft worden » signifierait que le contrôle a déjà eu lieu.')),
        choice('q4', aide('Sätze 5 und 7: Was bedeutet „sich … lassen“ hier?', 'Phrases 5 et 7 : que signifie « sich … lassen » ici ?'),
          [['Man kann etwas tun: Es kann (nicht) gemacht werden.', true], ['Man erlaubt einer Person, etwas zu tun.'],
            ['Man beauftragt eine andere Person mit einer Arbeit.'], ['Etwas passiert ganz von selbst, ohne Menschen.']],
          aide('„Routinetätigkeiten lassen sich automatisieren“ = Sie können automatisiert werden. „Nicht jede Tätigkeit lässt sich von zu Hause erledigen“ = Nicht jede Tätigkeit kann von zu Hause erledigt werden. Ohne „sich“ hat „lassen“ andere Bedeutungen: erlauben oder machen lassen.',
            'sich lassen + infinitif = passif avec können. Sans pronom réfléchi, lassen signifie « permettre » ou « faire faire ».')),
      ] },

    // 5 · Règle
    { id: 'b2-arbeitswelt-regel', kind: 'lesson', title: 'Regel: Passiv mit Modalverb und Alternativen zum Passiv', estimatedMinutes: 10,
      competences: ['lecture'],
      lesson: { description: `REGEL: PASSIV MIT MODALVERB
[fr?] Règle : le passif avec un verbe de modalité
${aide('Mit dem Passiv mit Modalverb sagen Sie, was getan werden muss, kann, soll oder darf. Wer es tut, ist nicht wichtig. Das Modalverb ist konjugiert, am Ende stehen das Partizip II und „werden“.', 'Le passif avec verbe de modalité dit ce qui doit, peut ou devrait être fait, sans préciser qui agit. Le modal est conjugué ; le participe et werden ferment la phrase.')}

FORMEN
• ${aide('Präsens: Die Daten müssen geschützt werden.', 'Présent : « les données doivent être protégées ».')}
• ${aide('Präteritum: Die Daten mussten geschützt werden.', 'Prétérit : « les données devaient être protégées ».')}
• ${aide('Perfekt: Das Projekt hat nicht abgeschlossen werden können.', 'Parfait : hat + participe + werden + modal à l’infinitif (« n’a pas pu être achevé »).')}
• ${aide('Konjunktiv II der Vergangenheit: Die Beschäftigten hätten früher geschult werden müssen.', 'Konjunktiv II passé : « auraient dû être formés plus tôt ».')}
• ${aide('Nebensatz: Das konjugierte Verb steht vor den drei Verben. …, weil das Projekt nicht hat abgeschlossen werden können. …, dass sie früher hätten geschult werden müssen.', 'Subordonnée : hat ou hätten se place devant les trois verbes, pas à la fin.')}
${aide('Tipp: Im Alltag hört man statt des Perfekts meist das Präteritum: Das Projekt konnte nicht abgeschlossen werden.', 'Conseil : à l’oral, on préfère souvent le prétérit, plus léger que le parfait.')}

REGEL: ALTERNATIVEN ZUM PASSIV
[fr?] Règle : les équivalents du passif
• ${aide('sein + zu + Infinitiv = Passiv mit „müssen“ oder „können“: Die Regeln sind einzuhalten. Das Problem ist leicht zu lösen.', 'sein + zu + infinitif : obligation (« les règles sont à respecter ») ou possibilité (« le problème est facile à résoudre »).')}
• ${aide('sich lassen + Infinitiv = Passiv mit „können“: Das lässt sich ändern. Nicht jede Arbeit lässt sich automatisieren.', 'sich lassen + infinitif = « peut être fait » : « cela peut se changer ».')}
• ${aide('Adjektive auf -bar oder -lich = Passiv mit „können“: machbar, ersetzbar, nachvollziehbar; verständlich, unvermeidlich.', 'Adjectifs en -bar / -lich = « qui peut être … » : faisable, remplaçable, compréhensible, inévitable.')}
• ${aide('man + Aktiv: Man muss die Ergebnisse prüfen.', 'man + actif, comme « on » en français.')}

ACHTUNG
[fr?] Attention : les pièges des francophones
• ${aide('Mit einem zweiten Verb steht das Modalverb im Infinitiv: hat … werden können, nicht „hat … werden gekonnt“.', 'Avec un autre verbe, le modal reste à l’infinitif : jamais gekonnt ni gemusst ici.')}
• ${aide('„sein + zu“ kann „müssen“ oder „können“ bedeuten: Der Kontext entscheidet. Der Antrag ist bis Freitag abzugeben (müssen). Die Aufgabe ist leicht zu lösen (können).', 'sein + zu peut exprimer l’obligation ou la possibilité : c’est le contexte qui tranche.')}
• ${aide('Ein Dativ bleibt Dativ: Den Kunden muss geholfen werden. Es gibt dann kein Subjekt.', 'Avec un verbe au datif (helfen), le datif reste : « den Kunden muss geholfen werden », sans sujet.')}
• ${aide('„Das lässt sich machen“ (Das kann gemacht werden) ist nicht dasselbe wie „Ich lasse das machen“ (Ich beauftrage jemanden).', '« sich machen lassen » = pouvoir être fait ; « etwas machen lassen » = faire faire quelque chose.')}` } },

    // 6 · Grammaire : s'entraîner
    { id: 'b2-arbeitswelt-grammatik', kind: 'exercise', title: 'Üben: Passiv mit Modalverb und Passiversatz', estimatedMinutes: 14,
      competences: ['lecture', 'expression-ecrite'],
      lesson: { description: `${aide('Üben Sie die Formen. Lesen Sie jede Erklärung, auch wenn Ihre Antwort richtig ist.', 'Entraînez-vous aux formes. Lisez chaque explication, même si votre réponse est juste.')}

MERKE
• Modalverb + Partizip II + werden · Perfekt: hat + Partizip II + werden + Modalverb
• sein + zu + Infinitiv · sich lassen + Infinitiv · Adjektiv auf -bar / -lich` },
      questions: [
        hints(fill('q1', aide('Ergänzen Sie das Partizip II.', 'Complétez avec le participe passé.'),
          'Die Ergebnisse müssen sorgfältig [[1]] werden. · Viele Routineaufgaben können heute [[2]] werden. · Persönliche Daten dürfen nicht ohne Erlaubnis [[3]] werden.',
          [['geprüft'], ['automatisiert'], ['weitergegeben']],
          aide('Passiv mit Modalverb: Modalverb + Partizip II + „werden“. Verben auf „-ieren“ bilden das Partizip ohne „ge-“ (automatisiert); bei trennbaren Verben steht „ge-“ zwischen Präfix und Stamm (weiter-ge-geben).',
            'Modal + participe + werden. Les verbes en -ieren n’ont pas de ge- ; pour les verbes séparables, ge- se glisse entre la particule et le radical.')),
        'prüfen', 'automatisieren', 'weitergeben'),
        hints(fill('q2', aide('Ergänzen Sie die Formen von „können“.', 'Complétez avec les formes de « können ».'),
          'Präteritum: Der Bericht [[1]] nicht rechtzeitig abgeschlossen werden. · Perfekt: Der Bericht [[2]] nicht rechtzeitig abgeschlossen werden [[3]].',
          [['konnte'], ['hat'], ['können']],
          aide('Im Präteritum wird nur das Modalverb konjugiert: konnte. Im Perfekt steht „hat“, und am Ende folgen drei Verben: abgeschlossen werden können. Das Modalverb steht dabei im Infinitiv, nicht als Partizip („gekonnt“).',
            'Au prétérit : konnte. Au parfait : hat … abgeschlossen werden können, avec le modal à l’infinitif.')),
        'können', 'haben', 'können'),
        order('q3', C2.ordnen,
          [['Die Beschäftigten', 'hätten', 'viel', 'früher', 'über die Software', 'informiert', 'werden', 'müssen.'],
            ['Die Beschäftigten', 'hätten', 'über die Software', 'viel', 'früher', 'informiert', 'werden', 'müssen.']],
          aide('Konjunktiv II der Vergangenheit im Passiv: „hätten“ auf Position 2, am Ende Partizip II + „werden“ + Modalverb im Infinitiv: informiert werden müssen. Die Angaben „viel früher“ und „über die Software“ stehen im Mittelfeld.',
            'Konjunktiv II passé au passif : hätten en deuxième position, puis informiert werden müssen à la fin ; les compléments restent au milieu.')),
        order('q4', C2.ordnen,
          [['Die Chefin', 'erklärt,', 'dass', 'das Projekt', 'nicht', 'rechtzeitig', 'hat', 'abgeschlossen', 'werden', 'können.']],
          aide('Im Nebensatz steht „hat“ nicht am Ende, sondern vor den drei Verben: …, dass das Projekt nicht rechtzeitig hat abgeschlossen werden können. Gleiche Regel wie beim Konjunktiv II mit zwei Infinitiven.',
            'Dans la subordonnée, hat précède les trois verbes au lieu d’aller à la fin, comme avec le double infinitif.')),
        choice('q5', aide('Welcher Satz ist richtig?', 'Quelle phrase est correcte ?'),
          [['Die Daten haben nicht rechtzeitig übertragen werden gekonnt.'], ['Die Daten sind nicht rechtzeitig übertragen worden können.'],
            ['Die Daten haben nicht rechtzeitig übertragen werden können.', true], ['Die Daten haben nicht rechtzeitig übertragen können werden.']],
          aide('Perfekt Passiv mit Modalverb: haben + Partizip II + „werden“ + Modalverb im Infinitiv. „Gekonnt“ ist mit einem zweiten Verb falsch, „worden“ gehört zum Passiv ohne Modalverb, und „können werden“ hat die falsche Reihenfolge.',
            'haben + participe + werden + modal à l’infinitif. Pas de gekonnt, pas de worden ici, et l’ordre est fixe : übertragen werden können.')),
        match('q6', aide('Welcher Satz bedeutet dasselbe? Ordnen Sie zu.', 'Quelle phrase a le même sens ? Associez.'),
          [['Die Regeln sind einzuhalten.', 'Die Regeln müssen eingehalten werden.'], ['Das Problem ist leicht zu lösen.', 'Das Problem kann leicht gelöst werden.'],
            ['Der Ablauf lässt sich vereinfachen.', 'Der Ablauf kann vereinfacht werden.'], ['Die Entscheidung ist nachvollziehbar.', 'Die Entscheidung kann nachvollzogen werden.']],
          aide('„sind einzuhalten“ drückt eine Pflicht aus (müssen); „ist leicht zu lösen“ eine Möglichkeit (können), erkennbar an „leicht“. „Lässt sich vereinfachen“ und „nachvollziehbar“ entsprechen immer einem Passiv mit „können“.',
            'sein + zu : obligation ou possibilité selon le contexte (« leicht » indique la possibilité). sich lassen et -bar correspondent toujours à können.')),
        fill('q7', aide('Bilden Sie ein Adjektiv auf -bar oder -lich.', 'Formez un adjectif en -bar ou -lich.'),
          'Was man machen kann, ist [[1]]. · Was man nicht vermeiden kann, ist [[2]]. · Was man gut verstehen kann, ist gut [[3]].',
          [['machbar'], ['unvermeidbar', 'unvermeidlich'], ['verständlich']],
          aide('Verbstamm + „-bar“: machbar, unvermeidbar. Daneben gibt es Adjektive auf „-lich“: unvermeidlich, verständlich. Beide Endungen bedeuten hier: Es kann gemacht, vermieden oder verstanden werden. „Unvermeidbar“ und „unvermeidlich“ sind beide richtig.',
            'Radical + -bar ou -lich : « faisable », « inévitable » (deux formes correctes), « compréhensible ».')),
        choice('q8', aide('Welcher Satz bedeutet: „Dieser Fehler kann nicht korrigiert werden.“?', 'Quelle phrase signifie : « cette erreur ne peut pas être corrigée » ?'),
          [['Dieser Fehler lässt sich nicht korrigieren.', true], ['Dieser Fehler lässt nicht korrigieren.'],
            ['Dieser Fehler ist bis heute nicht korrigiert worden.'], ['Dieser Fehler lässt sich nicht korrigiert.']],
          aide('„sich lassen“ + Infinitiv = Passiv mit „können“. Ohne „sich“ ist der Satz unvollständig, „ist bis heute nicht korrigiert worden“ beschreibt eine Tatsache, und nach „lassen“ steht der Infinitiv, nicht das Partizip.',
            'sich lassen + infinitif. Sans sich, la phrase est incomplète ; « ist bis heute nicht korrigiert worden » constate un fait ; après lassen, infinitif et non participe.')),
        fill('q9', aide('Formulieren Sie mit „sein + zu“.', 'Reformulez avec « sein + zu ».'),
          'Man muss die Anträge bis Freitag einreichen. → Die Anträge sind bis Freitag [[1]]. · Man kann das Formular online herunterladen. → Das Formular ist online [[2]].',
          [['einzureichen'], ['herunterzuladen']],
          aide('Das Akkusativobjekt wird Subjekt („die Anträge“, „das Formular“), dann folgt „sein + zu + Infinitiv“. Bei trennbaren Verben steht „zu“ zwischen Präfix und Stamm: ein-zu-reichen, herunter-zu-laden.',
            'Le complément devient sujet, puis sein + zu + infinitif. Avec un verbe séparable, zu se place entre la particule et le radical.')),
        choice('q10', aide('Welcher Satz ist richtig?', 'Quelle phrase est correcte ?'),
          [['Die neuen Kolleginnen müssen bei der Einarbeitung geholfen werden.'], ['Den neuen Kolleginnen muss bei der Einarbeitung geholfen werden.', true],
            ['Den neuen Kolleginnen müssen bei der Einarbeitung geholfen werden.'], ['Die neuen Kolleginnen muss bei der Einarbeitung geholfen werden.']],
          aide('„helfen“ verlangt den Dativ (den Kolleginnen helfen). Im Passiv bleibt der Dativ erhalten, und es gibt kein Subjekt: Das Verb steht deshalb im Singular, „muss … geholfen werden“.',
            'helfen régit le datif, qui reste au passif ; sans sujet, le verbe est au singulier : muss … geholfen werden.')),
      ] },

    // 7 · Lexique
    { id: 'b2-arbeitswelt-wortschatz', kind: 'exercise', title: 'Wortschatz: über Arbeit und Regeln sprechen', estimatedMinutes: 12,
      competences: ['lecture', 'expression-ecrite'],
      lesson: { description: `${aide('Lernen Sie die Wörter in festen Verbindungen, in Wortfamilien und mit ihren Präpositionen.', 'Apprenez les mots dans des expressions figées, des familles de mots et avec leurs prépositions.')}

TIPP
${aide('In der Arbeitswelt gibt es viele feste Verbindungen aus Nomen und Verb: eine Vereinbarung schließen, Überstunden abbauen, Rücksicht nehmen. Lernen Sie sie immer zusammen.', 'Le vocabulaire du travail compte beaucoup d’expressions nom + verbe : apprenez-les toujours ensemble.')}` },
      questions: [
        match('q1', aide('Welches Verb passt? Ordnen Sie zu.', 'Quel verbe convient ? Associez.'),
          [['eine Vereinbarung', 'schließen'], ['Überstunden', 'abbauen'], ['Rücksicht', 'nehmen'], ['klare Grenzen', 'ziehen'], ['eine Schulung', 'besuchen']],
          aide('Eine Vereinbarung schließen (sich einigen), Überstunden abbauen (weniger Überstunden haben), Rücksicht nehmen (auf andere achten), klare Grenzen ziehen (deutlich sagen, was nicht geht), eine Schulung besuchen.',
            'Conclure un accord, réduire les heures supplémentaires, avoir des égards, poser des limites claires, suivre une formation.')),
        fill('q2', aide('Bilden Sie das Nomen.', 'Formez le nom.'),
          'erreichbar → die [[1]] · belasten → die [[2]] · erschöpft → die [[3]] · vereinbaren → die [[4]]',
          [['Erreichbarkeit'], ['Belastung'], ['Erschöpfung'], ['Vereinbarung']],
          aide('Adjektive auf „-bar“ bilden Nomen auf „-keit“: die Erreichbarkeit. Verben bilden Nomen auf „-ung“: die Belastung, die Vereinbarung. „Erschöpft“ ist ein Partizip von „erschöpfen“, daher: die Erschöpfung. Alle diese Nomen sind feminin.',
            'Adjectif en -bar → nom en -keit ; verbe → nom en -ung. Tous ces noms sont féminins.')),
        choice('q3', aide('„Nach Feierabend kann ich endlich abschalten.“ Was bedeutet „abschalten“ hier?', 'Que signifie « abschalten » dans cette phrase ?'),
          [['den Computer und das Licht im Büro ausmachen'], ['sich entspannen und nicht mehr an die Arbeit denken', true],
            ['die Arbeitsstelle kündigen und etwas Neues suchen'], ['das Telefon auf lautlos stellen und weiterarbeiten']],
          aide('„Abschalten“ hat zwei Bedeutungen: ein Gerät ausschalten und, im übertragenen Sinn, zur Ruhe kommen. „Endlich“ und „nach Feierabend“ zeigen, dass hier die übertragene Bedeutung gemeint ist.',
            'Au sens propre, abschalten veut dire « éteindre » ; au sens figuré, « décrocher ». « endlich » et « nach Feierabend » imposent le sens figuré.')),
        choice('q4', aide('Sie möchten in einer E-Mail an die Geschäftsleitung höflich einen Vorschlag machen. Welche Formulierung passt?', 'Vous voulez faire poliment une proposition à la direction par courriel. Quelle formulation convient ?'),
          [['Wir schlagen Ihnen jetzt einfach mal was vor:'], ['Hiermit ordnen wir für unser Team folgende neue Regelung an:'],
            ['Wir hätten gern, dass Sie das sofort ändern:'], ['Wir möchten Ihnen daher folgenden Vorschlag unterbreiten:', true]],
          aide('„einen Vorschlag unterbreiten“ ist eine formelle, höfliche Wendung. „Einfach mal was“ ist umgangssprachlich, „anordnen“ steht nur einer vorgesetzten Person zu, und „sofort ändern“ klingt wie eine Forderung.',
            '« einen Vorschlag unterbreiten » (soumettre une proposition) est la formule polie du registre formel. Les autres sont familières, autoritaires ou trop exigeantes.')),
        match('q5', aide('Was bedeuten die Wörter? Ordnen Sie zu.', 'Que signifient ces mots ? Associez.'),
          [['die Kernarbeitszeit', 'Zeit, in der alle anwesend sein müssen'], ['die Bereitschaft', 'Zeit, in der man für Notfälle erreichbar ist'],
            ['der Betriebsrat', 'die gewählte Vertretung der Beschäftigten'], ['der Fachkräftemangel', 'Es fehlen qualifizierte Arbeitskräfte.']],
          aide('Die Kernarbeitszeit und das Bereitschaftstelefon kommen in der Reportage vor, Betriebsrat und Fachkräftemangel im Artikel. „Bereitschaft“ hat außerhalb der Arbeitswelt auch die Bedeutung „Wille, etwas zu tun“.',
            'Plages fixes, astreinte, comité d’entreprise, pénurie de personnel qualifié. Hors du travail, Bereitschaft veut aussi dire « disposition à faire quelque chose ».')),
        fill('q6', aide('Ergänzen Sie die Präpositionen.', 'Complétez avec les prépositions.'),
          'Der Betriebsrat hat sich [[1]] klare Regeln eingesetzt. · Viele leiden [[2]] der ständigen Erreichbarkeit. · Die Firma reagiert [[3]] den Fachkräftemangel.',
          [['für'], ['unter'], ['auf']],
          aide('sich einsetzen für + Akkusativ, leiden unter + Dativ, reagieren auf + Akkusativ. Diese Präpositionen lassen sich nicht aus der Muttersprache ableiten: Lernen Sie Verb und Präposition zusammen.',
            'S’engager pour (sich einsetzen für), souffrir de (leiden unter + datif), réagir à (reagieren auf).')),
        choice('q7', aide('„Am Anfang fand ich die Regel bevormundend.“ Was bedeutet „bevormundend“?', 'Que signifie « bevormundend » ?'),
          [['so, als dürfte man nicht selbst entscheiden', true], ['sehr praktisch und modern für alle Beschäftigten'],
            ['anstrengend für Körper und Kopf'], ['ungerecht gegenüber den Kolleginnen und Kollegen']],
          aide('Ein Vormund entscheidet für eine Person, die das nicht selbst darf, zum Beispiel für ein Kind. Wer sich „bevormundet“ fühlt, hat den Eindruck, wie ein Kind behandelt zu werden. Herr Çelik sagt dazu: „Ich bin erwachsen.“',
            'Un Vormund est un tuteur : se sentir « bevormundet », c’est avoir l’impression d’être traité comme un enfant. D’où la remarque « ich bin erwachsen ».')),
      ] },

    // 8 · Second document (thème pair : lecture)
    { id: 'b2-arbeitswelt-lesen2', kind: 'exercise', title: 'Verstehen: eine Meldung über die Viertagewoche', estimatedMinutes: 15,
      competences: ['lecture'],
      lesson: { description: `${C2.lesen}

TIPP
${aide('Eine Nachrichtenmeldung beantwortet im ersten Absatz die wichtigsten W-Fragen: Wer? Was? Wann? Wo? Die Details und die Stimmen der Beteiligten folgen danach.', 'Une dépêche répond dès le premier paragraphe aux questions essentielles : qui, quoi, quand, où ? Les détails et les témoignages viennent ensuite.')}

VIER TAGE ARBEIT, VOLLER LOHN: GROSSHÄNDLER ZIEHT BILANZ
[fr?] Dépêche : la semaine de quatre jours à l’essai
Kassel, 14. März – Ein Kasseler Großhändler für Sanitärbedarf hat ein halbes Jahr lang die Viertagewoche getestet und am Montag erste Ergebnisse vorgestellt. Während des Versuchs arbeiteten die rund 120 Beschäftigten bei vollem Lohn 34 statt 38 Stunden pro Woche, verteilt auf vier Tage.
Nach Angaben des Unternehmens ist die Zahl der Krankheitstage im Vergleich zum Vorjahreszeitraum um etwa ein Viertel gesunken. Der Umsatz konnte trotz der kürzeren Arbeitszeit gehalten werden. Auch bei der Suche nach neuem Personal hat sich der Versuch ausgezahlt: Die Zahl der Bewerbungen hat sich verdoppelt.
„Wir waren skeptisch, ob sich die Arbeit in vier Tagen überhaupt erledigen lässt“, sagte Geschäftsführer Wolfram Ehlers. „Viele Abläufe mussten neu organisiert werden. Besprechungen wurden zum Beispiel auf dreißig Minuten begrenzt.“ Damit die Kundschaft auch freitags jemanden erreicht, wechseln sich die Teams im Innendienst ab.
Bei der Kundschaft stieß das Modell zunächst auf Skepsis. Einige Handwerksbetriebe befürchteten, freitags niemanden mehr zu erreichen. Nach Angaben des Unternehmens gingen die Beschwerden jedoch nach wenigen Wochen zurück, als sich die neue Freitagsbesetzung eingespielt hatte.
Nicht alle Bereiche profitierten gleichermaßen. Im Lager, wo die Arbeit körperlich anstrengend ist, wurden die längeren Arbeitstage von vielen als belastend empfunden. „Der freie Freitag ist großartig, aber nach mehr als acht Stunden mit schweren Kartons bin ich am Donnerstag völlig fertig“, sagte die Lagerarbeiterin Jule Martens. Für das Lager soll deshalb ein anderes Modell geprüft werden, etwa fünf kürzere Arbeitstage mit einem freien Nachmittag.
Im Innendienst wird die Viertagewoche zunächst für ein weiteres Jahr fortgesetzt. Eine endgültige Entscheidung will die Geschäftsführung im kommenden Frühjahr treffen, nachdem die Beschäftigten erneut befragt worden sind. Ähnliche Versuche laufen derzeit auch in anderen Betrieben der Region. Ob sich das Modell auf größere Unternehmen übertragen lässt, ist unter Fachleuten allerdings umstritten.` },
      questions: [
        choice('q1', aide('Was wurde bei dem Versuch getestet?', 'Qu’a-t-on testé pendant cet essai ?'),
          [['vier Arbeitstage pro Woche bei vollem Lohn', true], ['eine Viertagewoche mit weniger Lohn für alle'],
            ['mehr Homeoffice für die Teams im Innendienst'], ['längere Öffnungszeiten für die Kundschaft']],
          aide('Der erste Absatz beantwortet die W-Fragen: Die Beschäftigten arbeiteten „bei vollem Lohn 34 statt 38 Stunden pro Woche, verteilt auf vier Tage“. Homeoffice und Öffnungszeiten sind nicht das Thema.',
            'Le premier paragraphe le dit : 34 heures au lieu de 38, sur quatre jours, sans perte de salaire.')),
        rf('q2', 'Während des Versuchs verdienten die Beschäftigten weniger als vorher.', 'f',
          aide('Falsch: Sie arbeiteten „bei vollem Lohn“. „Voller Lohn“ heißt: der ganze, unveränderte Lohn, obwohl weniger Stunden gearbeitet wurden.',
            'Faux : le salaire était maintenu en totalité (« bei vollem Lohn »).')),
        choice('q3', aide('Welches Ergebnis nennt das Unternehmen?', 'Quel résultat l’entreprise annonce-t-elle ?'),
          [['Der Umsatz ist um ein Viertel gestiegen.'], ['Freitags war niemand mehr erreichbar.'],
            ['Es gab etwa ein Viertel weniger Krankheitstage.', true], ['Zwei Teams haben das Unternehmen verlassen.']],
          aide('„Die Zahl der Krankheitstage ist … um etwa ein Viertel gesunken.“ Der Umsatz ist nicht gestiegen, sondern wurde „gehalten“. Freitags wechseln sich die Teams ab, damit die Kundschaft jemanden erreicht.',
            'Les jours de maladie ont baissé d’environ un quart. Le chiffre d’affaires a été maintenu, pas augmenté ; le vendredi, des équipes assurent une permanence.')),
        choice('q4', aide('Warum soll für das Lager ein anderes Modell geprüft werden?', 'Pourquoi faut-il étudier un autre modèle pour l’entrepôt ?'),
          [['Weil das Lager freitags immer geöffnet sein muss.'], ['Weil die Lagerarbeiter lieber mehr Lohn wollen.'],
            ['Weil im Lager mehr Krankheitstage gezählt wurden.'], ['Weil dort die langen Tage als zu belastend galten.', true]],
          aide('„Im Lager … wurden die längeren Arbeitstage von vielen als belastend empfunden.“ Frau Martens bestätigt: Nach mehr als acht Stunden mit schweren Kartons ist sie „völlig fertig“. Deshalb sollen dort kürzere Tage geprüft werden.',
            'Le travail physique rend les longues journées pénibles ; d’où l’idée de journées plus courtes sur cinq jours.')),
        fill('q5', aide('Ergänzen Sie die Informationen aus der Meldung.', 'Complétez avec les informations de la dépêche.'),
          'Dauer des Versuchs: ein [[1]] Jahr · Wochenarbeitszeit: [[2]] statt 38 Stunden · Bewerbungen: haben sich [[3]] · Besprechungen: höchstens [[4]] Minuten',
          [['halbes'], ['34', 'vierunddreißig'], ['verdoppelt'], ['30', 'dreißig']],
          aide('„ein halbes Jahr lang“; „34 statt 38 Stunden“; „Die Zahl der Bewerbungen hat sich verdoppelt“; „Besprechungen wurden … auf dreißig Minuten begrenzt.“',
            'Six mois (« ein halbes Jahr ») ; 34 heures ; les candidatures ont doublé ; réunions limitées à 30 minutes.')),
      ] },

    // 9 · Vérifier
    { id: 'b2-arbeitswelt-kontrolle', kind: 'exercise', title: 'Prüfen: die zweite Befragung', estimatedMinutes: 14,
      competences: ['lecture', 'ecoute'],
      lesson: { description: `${aide('Prüfen Sie, was Sie in diesem Modul gelernt haben: Hören, Grammatik und Wortschatz.', 'Vérifiez ce que vous avez appris dans ce module : écoute, grammaire et vocabulaire.')}

${aide('Annette Raabe aus der Personalabteilung hat allen Beschäftigten eine Sprachnachricht geschickt. Hören Sie sie für die Fragen 1 bis 3.', 'Annette Raabe, du service du personnel, a envoyé un message vocal à tous les salariés. Écoutez-le pour les questions 1 à 3.')}` },
      placements: [{ media: 'b2-arbeitswelt-kontrolle-audio', caption: 'Nachricht aus der Personalabteilung' }],
      questions: [
        choice('q1', aide('Worum bittet Frau Raabe?', 'Que demande Mme Raabe ?'),
          [['einen Fragebogen zu den neuen Regeln auszufüllen', true], ['an einer Betriebsversammlung im Juli teilzunehmen'],
            ['die neuen Regeln im Intranet zu kommentieren'], ['sie bis Freitag nächster Woche zurückzurufen']],
          aide('„Der Fragebogen … muss bis Freitag nächster Woche ausgefüllt werden.“ Die Betriebsversammlung findet erst im September statt, und Freitag ist die Frist für den Fragebogen, nicht für einen Rückruf.',
            'Il s’agit de remplir un questionnaire avant vendredi prochain. L’assemblée du personnel a lieu en septembre.')),
        choice('q2', aide('Was erfahren Sie über die Befragung?', 'Qu’apprenez-vous sur l’enquête ?'),
          [['Diesmal wird nur die Produktion befragt.'], ['Die Ergebnisse werden schon im Juli vorgestellt.'],
            ['Sie ist anonym und dauert etwa zehn Minuten.', true], ['Man muss seinen Namen für Rückfragen angeben.']],
          aide('„Er dauert ungefähr zehn Minuten.“ „Die Befragung ist anonym.“ Die Produktion „interessiert uns besonders“, befragt werden aber alle. Die Ergebnisse kommen im September.',
            'L’enquête est anonyme et dure dix minutes environ. La production intéresse particulièrement, mais tout le monde est interrogé.')),
        hints(fill('q3', aide('Ergänzen Sie das Passiv mit Modalverb aus der Nachricht.', 'Complétez avec le passif du message.'),
          'Der Fragebogen muss bis Freitag [[1]] werden. · Die Antworten können nicht einzelnen Personen [[2]] werden. · Die Ergebnisse sollen im September [[3]] werden.',
          [['ausgefüllt'], ['zugeordnet'], ['vorgestellt']],
          aide('Modalverb + Partizip II + „werden“. Bei trennbaren Verben steht „ge-“ zwischen Präfix und Stamm: aus-ge-füllt, zu-ge-ordnet, vor-ge-stellt.',
            'Modal + participe + werden ; ge- s’intercale dans les verbes séparables.')),
        'ausfüllen', 'zuordnen', 'vorstellen'),
        order('q4', C2.ordnen,
          [['Herr Kerner', 'findet,', 'dass', 'auch', 'die Chats', 'von Anfang an', 'hätten', 'geregelt', 'werden', 'müssen.'],
            ['Herr Kerner', 'findet,', 'dass', 'die Chats', 'auch', 'von Anfang an', 'hätten', 'geregelt', 'werden', 'müssen.'],
            ['Herr Kerner', 'findet,', 'dass', 'von Anfang an', 'auch', 'die Chats', 'hätten', 'geregelt', 'werden', 'müssen.']],
          aide('Konjunktiv II der Vergangenheit im Passiv, im Nebensatz: „hätten“ steht vor den drei Verben „geregelt werden müssen“. Im Mittelfeld können „auch die Chats“ und „von Anfang an“ ihre Plätze tauschen.',
            'Dans la subordonnée, hätten précède geregelt werden müssen ; les compléments du milieu peuvent permuter.')),
        choice('q5', aide('Welcher Satz bedeutet: „Die Formulare müssen bis Freitag abgegeben werden.“?', 'Quelle phrase a le même sens ?'),
          [['Die Formulare lassen sich bis Freitag abgeben.'], ['Die Formulare sind bis Freitag abgegeben.'],
            ['Die Formulare haben bis Freitag abzugeben.'], ['Die Formulare sind bis Freitag abzugeben.', true]],
          aide('„sein + zu + Infinitiv“ drückt hier eine Pflicht aus. „Lassen sich abgeben“ bedeutet „können abgegeben werden“, „sind abgegeben“ beschreibt einen Zustand, und „haben … zu“ verlangt eine Person als Subjekt.',
            'sein + zu exprime ici l’obligation. sich lassen = possibilité ; « sind abgegeben » décrit un état ; « haben … zu » suppose une personne comme sujet.')),
        fill('q6', aide('Ergänzen Sie die Wörter aus dem Modul.', 'Complétez avec des mots du module.'),
          'Wer nach Feierabend nicht mehr an die Arbeit denkt, kann [[1]]. · Wer nachts für Notfälle erreichbar sein muss, hat [[2]]. · Die Zeit, in der alle anwesend sein müssen, heißt [[3]].',
          [['abschalten'], ['Bereitschaft', 'Bereitschaftsdienst'], ['Kernarbeitszeit', 'die Kernarbeitszeit']],
          aide('„abschalten“ im übertragenen Sinn: zur Ruhe kommen. „Bereitschaft haben“: für Notfälle erreichbar sein. „Die Kernarbeitszeit“: In dieser Zeit finden die Besprechungen statt.',
            'abschalten : décrocher ; Bereitschaft haben : être d’astreinte ; Kernarbeitszeit : plages de présence obligatoire.')),
        choice('q7', aide('Welches Adjektiv passt? „Die Entscheidung ist für alle ___: Sie wurde gut begründet.“', 'Quel adjectif convient ?'),
          [['unverständlich'], ['nachvollziehbar', true], ['wiederverwertbar'], ['unvorhersehbar']],
          aide('„nachvollziehbar“: Man kann die Gründe verstehen und nachvollziehen. Der Doppelpunkt kündigt die Begründung an. Eine gut begründete Entscheidung ist weder „unverständlich“ noch „unvorhersehbar“, und „wiederverwertbar“ sagt man von Material, nicht von Entscheidungen.',
            '« compréhensible » : on peut en suivre le raisonnement. Une décision bien justifiée n’est ni incompréhensible ni imprévisible, et « recyclable » ne convient pas.')),
      ] },
  ],
};
