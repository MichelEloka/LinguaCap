// Module B2 n° 17 · thème « Wissenschaft » (lot R7, thème 9). Recherche, technique et innovation : un article de
// vulgarisation sur la fiabilité des études (corrélation et causalité, échantillon, évaluation par les pairs, reproduction ;
// position de l'auteur, inférence), une émission de radio sur la science participative (prise de notes longue). Grammaire :
// passif d'action et passif d'état (wird geprüft / ist geprüft) ; style nominal et style verbal (nach der Auswertung der
// Daten = nachdem die Daten ausgewertet worden sind), cohésion du texte (somit, dabei, daraus).
// Le second document (-hoeren2, extrait authentique de 15 min, thème impair, par exemple un exposé scientifique) est écrit
// par le lot M2 dans _media.mjs et inséré après -wortschatz (voir _level.mjs) : il n'est pas dans ce fichier, ses
// 15 minutes comptent dans la durée du module.
// Consignes, règles et explications en allemand avec aide française repliée ([fr?]) ; lexique traduit en français.
import { C2, aide, choice, fill, order, match } from '../../lib.mjs';

/** « Richtig / falsch / steht nicht im Text » : r, f ou n pour la bonne réponse. */
const rf = (id, statement, answer, explanation) => choice(id, `„${statement}“ ${C2.richtigFalsch}`,
  [['richtig', answer === 'r'], ['falsch', answer === 'f'], ['steht nicht im Text', answer === 'n']], explanation);
/** Indices affichés sous les trous d'un fill (forme de base à transformer). */
const hints = (question, ...values) => ({ ...question,
  blanks: question.blanks.map((blank, index) => (values[index] ? { ...blank, hint: values[index] } : blank)) });

export default {
  id: 'b2-wissenschaft',
  title: 'Wissenschaft: Forschung, Technik und Innovation',
  objective: 'Comprendre un article de vulgarisation sur la fiabilité des études scientifiques et une émission sur la science participative, distinguer le passif d’action du passif d’état (wird geprüft / ist geprüft), passer du style verbal au style nominal et inversement, et relier les idées d’un texte scientifique.',
  grammarFocus: ['zustandspassiv', 'nominalstil'],
  sources: [
    'Textes, dialogues et exercices originaux LinguaCap. Personnes, émission, projet de comptage et études citées sont fictifs ; les principes de méthode (corrélation et causalité, échantillon, évaluation par les pairs, prépublications, reproduction) sont des connaissances générales.',
  ],

  vocabulary: [
    { word: 'Forschung', article: 'die', plural: null, partOfSpeech: 'noun', translation: 'la recherche (scientifique)',
      example: 'Forschung findet nicht nur im Labor statt.', note: 'sans pluriel au sens général · forschen : faire de la recherche' },
    { word: 'Studie', article: 'die', plural: 'Studien', partOfSpeech: 'noun', translation: 'l’étude',
      example: 'Die Studie ist in einer Fachzeitschrift veröffentlicht.', note: null },
    { word: 'Untersuchung', article: 'die', plural: 'Untersuchungen', partOfSpeech: 'noun', translation: 'l’examen, l’enquête, l’étude',
      example: 'Eine Untersuchung mit zwanzig Personen ist meist zu klein.', note: 'untersuchen : examiner, étudier' },
    { word: 'Ergebnis', article: 'das', plural: 'Ergebnisse', partOfSpeech: 'noun', translation: 'le résultat',
      example: 'Die Ergebnisse sind noch nicht überprüft.', note: null },
    { word: 'Erkenntnis', article: 'die', plural: 'Erkenntnisse', partOfSpeech: 'noun', translation: 'la connaissance, le constat',
      example: 'Eine neue Erkenntnis muss von anderen Teams bestätigt werden.', note: 'Erkenntnisse gewinnen : acquérir des connaissances' },
    { word: 'Stichprobe', article: 'die', plural: 'Stichproben', partOfSpeech: 'noun', translation: 'l’échantillon',
      example: 'Die Stichprobe ist für allgemeine Aussagen zu klein.', note: null },
    { word: 'Zusammenhang', article: 'der', plural: 'Zusammenhänge', partOfSpeech: 'noun', translation: 'le lien, la corrélation',
      example: 'Ein Zusammenhang ist noch keine Ursache.', note: 'einen Zusammenhang nachweisen : démontrer un lien' },
    { word: 'Ursache', article: 'die', plural: 'Ursachen', partOfSpeech: 'noun', translation: 'la cause',
      example: 'Ist der Kaffee wirklich die Ursache?', note: 'verursachen : causer' },
    { word: 'Kontrollgruppe', article: 'die', plural: 'Kontrollgruppen', partOfSpeech: 'noun', translation: 'le groupe témoin',
      example: 'Man vergleicht die Versuchsgruppe mit einer Kontrollgruppe.', note: null },
    { word: 'Fachzeitschrift', article: 'die', plural: 'Fachzeitschriften', partOfSpeech: 'noun', translation: 'la revue scientifique',
      example: 'Der Artikel erscheint in einer angesehenen Fachzeitschrift.', note: null },
    { word: 'veröffentlichen', partOfSpeech: 'verb', translation: 'publier',
      example: 'Das Team will seine Daten bald veröffentlichen.', note: 'die Veröffentlichung : la publication' },
    { word: 'begutachten', partOfSpeech: 'verb', translation: 'évaluer, expertiser (par des pairs)',
      example: 'Unabhängige Fachleute begutachten die Studie.', note: 'das Gutachten : l’expertise' },
    { word: 'auswerten', partOfSpeech: 'verb', translation: 'analyser, exploiter (des données)',
      example: 'Im Herbst werten wir alle Daten aus.', note: 'séparable : aus|werten · die Auswertung' },
    { word: 'Daten erheben', partOfSpeech: 'expression', translation: 'collecter des données',
      example: 'Allein hätte das Team nie so viele Daten erheben können.', note: 'die Datenerhebung' },
    { word: 'nachweisen', partOfSpeech: 'verb', translation: 'prouver, démontrer',
      example: 'Eine Ursache lässt sich nur mit einem Experiment nachweisen.', note: 'séparable : nach|weisen · der Nachweis' },
    { word: 'überprüfen', partOfSpeech: 'verb', translation: 'vérifier, contrôler',
      example: 'Alle Fotos werden von Fachleuten überprüft.', note: 'non séparable · die Überprüfung' },
    { word: 'sich durchsetzen', partOfSpeech: 'verb', translation: 's’imposer',
      example: 'Manche Erfindungen setzen sich erst nach Jahrzehnten durch.', note: 'séparable : durch|setzen' },
    { word: 'Laie', article: 'der', plural: 'Laien', partOfSpeech: 'noun', translation: 'le profane, le non-spécialiste',
      example: 'Auch Laien können zur Forschung beitragen.', note: 'n-Deklination : den, dem, des Laien' },
    { word: 'Bürgerwissenschaft', article: 'die', plural: null, partOfSpeech: 'noun', translation: 'la science participative',
      example: 'Bürgerwissenschaft ergänzt die klassische Forschung.', note: 'sans pluriel · aussi : Citizen Science' },
    { word: 'anonymisiert', partOfSpeech: 'adjective', translation: 'anonymisé',
      example: 'Die Daten sind anonymisiert.', note: 'anonymisieren : anonymiser' },
    { word: 'Erfindung', article: 'die', plural: 'Erfindungen', partOfSpeech: 'noun', translation: 'l’invention',
      example: 'Nicht jede Erfindung wird zu einer Innovation.', note: 'erfinden : inventer · entdecken : découvrir' },
    { word: 'beitragen zu', partOfSpeech: 'verb', translation: 'contribuer à',
      example: 'Jeder kann etwas zur Forschung beitragen.', note: '+ datif · séparable : bei|tragen' },
    { word: 'zu dem Schluss kommen', partOfSpeech: 'expression', translation: 'arriver à la conclusion',
      example: 'Die Forschenden kommen zu dem Schluss, dass weitere Studien nötig sind.', note: null },
    { word: 'erfolgen', partOfSpeech: 'verb', translation: 'avoir lieu, s’effectuer (style administratif)',
      example: 'Die Auswertung erfolgt im Herbst.', note: 'verbe du style nominal : = wird durchgeführt' },
  ],

  media: [
    { key: 'b2-wissenschaft-lesen-artikel', kind: 'image', title: 'Article de vulgarisation : ce que prouve une étude',
      alt: 'Début de l’article « Was eine Studie beweist – und was nicht » : surtitre, titre, signature, chapeau et premier paragraphe sur une étude consacrée au café.',
      image: { layout: 'article', kicker: 'Wissenschaft verstehen', title: 'Was eine Studie beweist – und was nicht', icon: 'microscope',
        byline: 'Von Leonie Brandauer',
        lead: 'Kaffee verlängert das Leben, Schokolade macht klug, Smartphones machen einsam: Fast jede Woche meldet eine Schlagzeile eine neue Erkenntnis. Wie viel davon stimmt? Eine Anleitung zum kritischen Lesen.',
        paragraphs: ['Die Meldung klang verlockend: Wer täglich drei Tassen Kaffee trinkt, lebt länger. So stand es im vergangenen Frühjahr in zahlreichen Zeitungen. Die Studie dahinter war seriös, in einer angesehenen Fachzeitschrift veröffentlicht und von unabhängigen Fachleuten begutachtet.'] } },
    { key: 'b2-wissenschaft-hoeren-audio', kind: 'audio', title: 'Émission de radio : la science participative',
      script: [
        { voice: 'sprecherin', name: 'Moderatorin', text: 'Willkommen bei „Wissen um sechs“. Forschung findet nicht nur im Labor statt, sondern manchmal auch im eigenen Garten. Beim Projekt „Summ mit“ zählen Bürgerinnen und Bürger jeden Sommer Wildbienen und andere Insekten.' },
        { voice: 'sprecherin', name: 'Moderatorin', text: 'Bei mir sind die Biologin Johanna Riedl, die das Projekt leitet, und Werner Danielsen, der seit drei Jahren mitzählt. Frau Riedl, wie funktioniert das genau?' },
        { voice: 'frau2', name: 'Frau Riedl', text: 'Ganz einfach: Man sucht sich eine blühende Fläche, etwa ein Beet oder einen Balkonkasten, und beobachtet sie fünfzehn Minuten lang. Jedes Insekt, das auf einer Blüte landet, wird gezählt, am besten mit einem Foto. Die Ergebnisse gibt man dann in unsere App ein. Die App ist kostenlos und ab dem ersten Juni freigeschaltet.' },
        { voice: 'sprecherin', name: 'Moderatorin', text: 'Und wie viele Menschen machen mit?' },
        { voice: 'frau2', name: 'Frau Riedl', text: 'Im letzten Sommer waren es rund zwölftausend, von Schulklassen bis zu Rentnern. Allein hätten wir niemals so viele Daten erheben können. Ein Forschungsteam schafft vielleicht zweihundert Standorte, die Bürgerinnen und Bürger schaffen Tausende.' },
        { voice: 'sprecherin', name: 'Moderatorin', text: 'Herr Danielsen, warum zählen Sie mit?' },
        { voice: 'mann3', name: 'Herr Danielsen', text: 'Ehrlich gesagt bin ich durch meine Enkelin dazu gekommen. Sie hat das Projekt in der Schule kennengelernt. Inzwischen hat es mich richtig gepackt. Ich erkenne heute zwanzig Bienenarten, die ich früher gar nicht wahrgenommen habe. Und man hat das Gefühl, dass man etwas Sinnvolles beiträgt.' },
        { voice: 'sprecherin', name: 'Moderatorin', text: 'Und wie viel Zeit kostet Sie das?' },
        { voice: 'mann3', name: 'Herr Danielsen', text: 'Im Sommer vielleicht eine Stunde pro Woche. Ich zähle meistens am Vormittag, wenn es warm wird, denn bei Regen und Wind fliegen kaum Insekten. Beim Bestimmen hilft mir oft meine Enkelin. Mit der App ist sie viel schneller als ich.' },
        { voice: 'sprecherin', name: 'Moderatorin', text: 'Frau Riedl, sind die Daten von Laien überhaupt zuverlässig?' },
        { voice: 'frau2', name: 'Frau Riedl', text: 'Das ist die wichtigste Frage, und wir nehmen sie sehr ernst. Anfänger verwechseln manche Arten, das ist ganz normal. Deshalb werden alle Fotos von Fachleuten geprüft, bevor sie in die Auswertung eingehen. Ungefähr jede zehnte Meldung korrigieren wir.' },
        { voice: 'frau2', name: 'Frau Riedl', text: 'Außerdem sind die Daten anonymisiert: Wir wissen, in welchem Ort gezählt wurde, aber nicht, in welchem Garten.' },
        { voice: 'sprecherin', name: 'Moderatorin', text: 'Gibt es denn schon Ergebnisse?' },
        { voice: 'frau2', name: 'Frau Riedl', text: 'Ja, und eines hat uns überrascht. In Gärten mit heimischen Pflanzen haben wir fast doppelt so viele Wildbienen gezählt wie in Gärten mit exotischen Zierpflanzen. Selbst kleine Balkone können einen Unterschied machen, wenn dort die richtigen Pflanzen stehen.' },
        { voice: 'mann3', name: 'Herr Danielsen', text: 'Das kann ich bestätigen. Ich habe vor zwei Jahren einen Teil des Rasens in meinem Vorgarten durch eine Wildblumenwiese ersetzt. Seitdem ist dort im Sommer richtig was los.' },
        { voice: 'sprecherin', name: 'Moderatorin', text: 'Wo liegen die Grenzen eines solchen Projekts?' },
        { voice: 'frau2', name: 'Frau Riedl', text: 'Die Daten sind nicht gleichmäßig verteilt. In den Städten zählen viel mehr Menschen als auf dem Land, und große Agrarflächen sind kaum erfasst. Für manche Fragen brauchen wir deshalb weiterhin klassische Untersuchungen mit festen Standorten. Bürgerwissenschaft ersetzt die Forschung nicht, aber sie ergänzt sie.' },
        { voice: 'sprecherin', name: 'Moderatorin', text: 'Und wann wird gezählt?' },
        { voice: 'frau2', name: 'Frau Riedl', text: 'Die Zählwochen laufen vom ersten Juni bis Ende August. Die Auswertung erfolgt dann im Herbst, und alle Teilnehmenden bekommen im Dezember einen Bericht mit den Ergebnissen.' },
        { voice: 'sprecherin', name: 'Moderatorin', text: 'Frau Riedl, Herr Danielsen, vielen Dank. Und Sie, liebe Hörerinnen und Hörer: Vielleicht zählen Sie im nächsten Sommer ja selbst mit.' },
      ] },
    { key: 'b2-wissenschaft-kontrolle-audio', kind: 'audio', title: 'Brève scientifique : la sieste et la mémoire',
      script: [
        { voice: 'sprecher', name: 'Nachrichten', text: 'Wissenschaft in Kürze. Macht ein Mittagsschlaf klüger? Ein Forschungsteam hat untersucht, ob ein kurzer Schlaf am Mittag das Gedächtnis verbessert. Vierzig Studierende lernten am Vormittag Vokabeln; die Hälfte schlief danach zwanzig Minuten, die andere Hälfte las eine Zeitschrift.' },
        { voice: 'sprecher', name: 'Nachrichten', text: 'Am Abend erinnerte sich die Gruppe mit Mittagsschlaf an etwas mehr Wörter. Die Studie ist als Preprint im Internet veröffentlicht und noch nicht von anderen Fachleuten begutachtet. Die Forschenden betonen selbst, dass ihre Ergebnisse durch größere Studien bestätigt werden müssen.' },
      ] },
  ],

  activities: [
    // 1 · Mise en route
    { id: 'b2-wissenschaft-einstieg', kind: 'lesson', title: 'Einstieg: Wissenschaft im Alltag', estimatedMinutes: 10,
      competences: ['lecture', 'expression-orale'],
      lesson: { description: `FORSCHUNG, TECHNIK, INNOVATION
[fr?] Recherche, technique, innovation
${aide('„Forscher haben herausgefunden …“: Solche Meldungen lesen wir fast jeden Tag. Doch was beweist eine Studie wirklich? Und kann man auch ohne Studium zur Forschung beitragen? Darum geht es in diesem Modul.', '« Des chercheurs ont découvert … » : nous lisons ce genre de nouvelle presque tous les jours. Que prouve vraiment une étude ? Et peut-on contribuer à la recherche sans être scientifique ? C’est le sujet de ce module.')}

FRAGEN ZUM EINSTIEG
[fr?] Questions pour commencer
• ${aide('Welche wissenschaftliche Meldung haben Sie zuletzt gelesen oder gehört? Haben Sie ihr geglaubt?', 'Quelle nouvelle scientifique avez-vous lue ou entendue récemment ? L’avez-vous crue ?')}
• ${aide('Welche Erfindung der letzten hundert Jahre hat Ihren Alltag am stärksten verändert?', 'Quelle invention du siècle dernier a le plus changé votre quotidien ?')}
• ${aide('Würden Sie bei einem Forschungsprojekt mitmachen, zum Beispiel Vögel zählen oder Daten sammeln? Warum (nicht)?', 'Participeriez-vous à un projet de recherche, par exemple pour compter des oiseaux ou collecter des données ? Pourquoi ?')}
${aide('Überlegen Sie sich zu jeder Frage zwei oder drei Sätze auf Deutsch und begründen Sie Ihre Meinung.', 'Pour chaque question, préparez mentalement deux ou trois phrases en allemand et justifiez votre avis.')}

ZIELE
[fr?] Objectifs
• ${aide('Ich kann einen populärwissenschaftlichen Artikel verstehen und seine Argumentation nachvollziehen.', 'Je peux comprendre un article de vulgarisation et suivre son argumentation.')}
• ${aide('Ich kann einem Radiogespräch über ein Forschungsprojekt folgen und die wichtigsten Fakten festhalten.', 'Je peux suivre une émission sur un projet de recherche et retenir les faits essentiels.')}
• ${aide('Ich kann zwischen einem Vorgang und einem Zustand unterscheiden: „Die Daten werden geprüft“ – „Die Daten sind geprüft“.', 'Je peux distinguer un processus d’un état.')}
• ${aide('Ich kann Sätze vom Verbalstil in den Nominalstil umformen und umgekehrt.', 'Je peux passer du style verbal au style nominal, et inversement.')}
• ${aide('Ich kann eine wissenschaftliche Meldung kritisch prüfen: Wer wurde untersucht, und was ist wirklich belegt?', 'Je peux examiner une nouvelle scientifique d’un œil critique.')}

WICHTIGE WÖRTER
[fr?] Mots-clés
• die Studie, die Untersuchung — l’étude
• das Ergebnis, die Erkenntnis — le résultat, la connaissance
• die Stichprobe — l’échantillon
• der Zusammenhang, die Ursache — le lien, la cause
• veröffentlichen, begutachten — publier, évaluer
• Daten erheben, auswerten — collecter, analyser des données
• der Laie — le profane
• die Erfindung — l’invention` } },

    // 2 · Lecture longue : article de vulgarisation
    { id: 'b2-wissenschaft-lesen', kind: 'exercise', title: 'Verstehen: ein Artikel über wissenschaftliche Studien', estimatedMinutes: 23,
      competences: ['lecture'],
      lesson: { description: `${C2.lesen}

STRATEGIE
[fr?] Stratégie
1. ${aide('Lesen Sie Überschrift und Vorspann: Welche Frage stellt der Text, und welche Art Text ist es?', 'Lisez le titre et le chapeau : quelle question le texte pose-t-il, et de quel genre de texte s’agit-il ?')}
2. ${aide('Der Text ist klar gegliedert („ein zweiter Punkt“, „drittens“). Suchen Sie diese Signale und fassen Sie jeden Absatz in Gedanken in einem Satz zusammen.', 'Repérez les marqueurs d’organisation (« ein zweiter Punkt », « drittens ») et résumez chaque paragraphe en une phrase.')}
3. ${aide('Achten Sie auf vorsichtige Formulierungen: „könnte“, „im Durchschnitt“, „gilt als“. Sie zeigen, wie sicher eine Aussage ist.', 'Repérez les formulations prudentes : elles indiquent le degré de certitude.')}

WAS EINE STUDIE BEWEIST – UND WAS NICHT
Kaffee verlängert das Leben, Schokolade macht klug, Smartphones machen einsam: Fast jede Woche meldet eine Schlagzeile eine neue Erkenntnis. Wie viel davon stimmt? Eine Anleitung zum kritischen Lesen.
Von Leonie Brandauer

(A) Die Meldung klang verlockend: Wer täglich drei Tassen Kaffee trinkt, lebt länger. So stand es im vergangenen Frühjahr in zahlreichen Zeitungen. Die Studie dahinter war seriös, in einer angesehenen Fachzeitschrift veröffentlicht und von unabhängigen Fachleuten begutachtet. Und trotzdem bewies sie nicht, was die Schlagzeilen behaupteten. Denn die Forschenden hatten nur festgestellt, dass Kaffeetrinker im Durchschnitt etwas länger lebten, nicht aber, dass der Kaffee der Grund dafür ist.

(B) Der Unterschied zwischen einem Zusammenhang und einer Ursache gehört zu den wichtigsten Prinzipien der Wissenschaft und wird zugleich am häufigsten übersehen. Ein einfaches Beispiel: An Tagen, an denen viel Eis verkauft wird, gibt es auch mehr Sonnenbrände. Trotzdem verursacht Eis keinen Sonnenbrand; beides hängt vom Wetter ab. Forschende sprechen dann von einer Korrelation, nicht von einer Kausalität. Beim Kaffee könnte es ähnlich sein. Vielleicht trinken gesunde Menschen einfach mehr Kaffee, weil sie ihn besser vertragen. „Um eine Ursache nachzuweisen, braucht man in der Regel ein Experiment, bei dem man eine Versuchsgruppe mit einer Kontrollgruppe vergleicht“, erklärt die Statistikerin Miriam Sauerbrey. „Beim Kaffee ist das über Jahrzehnte praktisch unmöglich.“

(C) Ein zweiter Punkt ist die Größe der Stichprobe. Eine Untersuchung mit zwanzig Teilnehmenden kann interessante Hinweise liefern, ist aber für allgemeine Aussagen meist zu klein: Schon wenige Zufälle können das Ergebnis verfälschen. Auch die Auswahl der Teilnehmenden spielt eine Rolle: Wer nur Studierende befragt, weiß wenig über ältere Menschen. Wer eine Meldung liest, sollte deshalb nachsehen, wie viele Personen untersucht wurden und ob es sich überhaupt um Menschen handelte oder um Versuche mit Zellen oder Mäusen. Was im Labor bei Mäusen wirkt, ist beim Menschen noch lange nicht bewiesen.

(D) Drittens lohnt ein Blick darauf, ob eine Studie überhaupt schon geprüft ist. Seit einigen Jahren werden viele Arbeiten als sogenannte Preprints ins Internet gestellt, bevor andere Fachleute sie begutachtet haben. Das beschleunigt den Austausch, birgt aber Risiken: Die Ergebnisse sind zwar öffentlich, aber noch nicht abgesichert. Ein Preprint ist also mit einem Entwurf vergleichbar, der zwar veröffentlicht, aber noch nicht korrigiert ist. Und selbst eine begutachtete Studie ist kein Endpunkt. Erst wenn andere Teams die Untersuchung wiederholt und ähnliche Ergebnisse erzielt haben, gilt eine Erkenntnis als einigermaßen gesichert.

(E) Heißt das, man sollte keiner Schlagzeile mehr trauen? Nein. Wissenschaft liefert keine endgültigen Wahrheiten, sondern das beste Wissen, das zu einem bestimmten Zeitpunkt verfügbar ist. Gerade darin liegt ihre Stärke: Sie korrigiert sich selbst. Problematisch wird es erst, wenn vorsichtige Formulierungen auf dem Weg in die Medien verloren gehen. Manche Redaktionen arbeiten deshalb inzwischen mit Fachleuten zusammen, die solche Meldungen vor der Veröffentlichung prüfen. Aus „Bei Kaffeetrinkern wurde eine etwas höhere Lebenserwartung beobachtet“ wird dann „Kaffee verlängert das Leben“. Leserinnen und Leser können sich schützen, indem sie drei Fragen stellen: Wer wurde untersucht? Ist das Ergebnis geprüft? Und ist wirklich eine Ursache belegt oder nur ein Zusammenhang?` },
      placements: [{ media: 'b2-wissenschaft-lesen-artikel', caption: 'Der Artikel (Anfang)' }],
      questions: [
        choice('q1', aide('Was ist das Hauptziel des Artikels?', 'Quel est le but principal de l’article ?'),
          [['Er beweist, dass Kaffee gesund ist und das Leben tatsächlich verlängert.'],
            ['Er zeigt, wie man Meldungen über Studien kritisch prüfen kann.', true],
            ['Er kritisiert, dass Forschende ihre Ergebnisse absichtlich falsch darstellen.'],
            ['Er erklärt, warum man wissenschaftlichen Studien grundsätzlich nicht trauen kann.']],
          'Der Vorspann kündigt „eine Anleitung zum kritischen Lesen“ an, und der Text endet mit drei Fragen für Leserinnen und Leser. Die Kaffeestudie ist nur ein Beispiel; den Forschenden wirft der Text nichts vor, und er sagt ausdrücklich, man solle Schlagzeilen nicht grundsätzlich misstrauen. [fr?] Un guide pour lire les nouvelles scientifiques avec esprit critique.'),
        choice('q2', aide('Wie bewertet die Autorin die Wissenschaft im letzten Absatz?', 'Comment l’autrice juge-t-elle la science dans le dernier paragraphe ?'),
          [['Sie liefert endgültige Wahrheiten, wenn die Studien nur groß genug sind.'],
            ['Sie ist unzuverlässig, weil sich ihre Ergebnisse ständig wieder ändern.'],
            ['Sie liefert vorläufiges Wissen, und gerade ihre Selbstkorrektur ist eine Stärke.', true],
            ['Sie wäre viel zuverlässiger, wenn es keine Preprints mehr im Internet gäbe.']],
          '„Wissenschaft liefert keine endgültigen Wahrheiten, sondern das beste Wissen, das zu einem bestimmten Zeitpunkt verfügbar ist. Gerade darin liegt ihre Stärke: Sie korrigiert sich selbst.“ Das Problem sieht die Autorin nicht in der Wissenschaft, sondern in vereinfachten Schlagzeilen. [fr?] Un savoir provisoire, dont l’autocorrection fait la force.'),
        choice('q3', aide('Warum nennt der Text das Beispiel mit Eis und Sonnenbrand?', 'Pourquoi le texte cite-t-il l’exemple de la glace et des coups de soleil ?'),
          [['Um zu zeigen, dass man an heißen Sommertagen besser ganz auf Eis verzichten sollte.'],
            ['Um zu zeigen, dass genaue Wetterdaten für die medizinische Forschung besonders wichtig sind.'],
            ['Um zu zeigen, dass Kaffee an heißen Tagen der Gesundheit schaden kann.'],
            ['Um zu zeigen, dass zwei Dinge gemeinsam auftreten können, ohne dass eins das andere bewirkt.', true]],
          'Eisverkauf und Sonnenbrände steigen gleichzeitig, aber beides hat eine gemeinsame dritte Ursache: das Wetter. Genauso könnte es beim Kaffee eine andere Erklärung geben, etwa die Gesundheit der Kaffeetrinker. Ein Zusammenhang (Korrelation) beweist keine Ursache (Kausalität). [fr?] Corrélation n’est pas causalité.'),
        rf('q4', 'Die Kaffeestudie war von unabhängigen Fachleuten begutachtet worden.', 'r',
          'Richtig: Die Studie war „in einer angesehenen Fachzeitschrift veröffentlicht und von unabhängigen Fachleuten begutachtet“. Der Fehler lag also nicht in der Studie, sondern in den Schlagzeilen. [fr?] L’étude était sérieuse ; ce sont les titres qui exagéraient.'),
        rf('q5', 'Laut Miriam Sauerbrey lässt sich die Wirkung von Kaffee leicht mit einem Experiment prüfen.', 'f',
          'Falsch: „Beim Kaffee ist das über Jahrzehnte praktisch unmöglich.“ Man müsste zwei Gruppen jahrzehntelang vergleichen, eine mit und eine ohne Kaffee. [fr?] Une telle expérience serait pratiquement impossible.'),
        rf('q6', 'Die meisten Preprints enthalten falsche Ergebnisse.', 'n',
          'Steht nicht im Text: Der Artikel sagt nur, dass Preprints noch nicht begutachtet sind und deshalb Risiken bergen. Wie viele davon falsch sind, wird nicht gesagt. [fr?] Le texte parle de risques, pas d’une proportion d’erreurs.'),
        match('q7', aide('Welche Überschrift passt zu welchem Absatz? Ordnen Sie zu.', 'Quel intertitre convient à quel paragraphe ? Associez.'),
          [['Absatz A', 'Eine verlockende Schlagzeile'], ['Absatz B', 'Zusammenhang ist nicht Ursache'], ['Absatz C', 'Auf die Stichprobe kommt es an'],
            ['Absatz D', 'Geprüft oder nur veröffentlicht?'], ['Absatz E', 'Drei Fragen für kritische Leser']],
          'Die Signalwörter helfen: A erzählt die Kaffeemeldung, B erklärt den Unterschied zwischen Zusammenhang und Ursache, C beginnt mit „Ein zweiter Punkt ist die Größe der Stichprobe“, D mit „Drittens“ (Preprints, Begutachtung), E schließt mit drei Fragen. [fr?] Les mots d’organisation structurent le texte.'),
        fill('q8', aide('Welches Wort aus dem Text passt? Ergänzen Sie.', 'Quel mot du texte convient ? Complétez.'),
          'Absatz C: Die Gruppe der Personen, die in einer Studie untersucht werden, heißt [[1]]. · Absatz D: Eine Erkenntnis gilt erst als gesichert, wenn andere Teams die Untersuchung [[2]] und ähnliche Ergebnisse erzielt haben.',
          [['Stichprobe', 'die Stichprobe'], ['wiederholt']],
          '„Die Stichprobe“ ist die Auswahl von Personen oder Fällen, die untersucht wird. „Eine Untersuchung wiederholen“: Ein anderes Team führt sie noch einmal durch; erst dann gilt ein Ergebnis als „einigermaßen gesichert“. [fr?] l’échantillon ; reproduire une étude.'),
      ] },

    // 3 · Écoute longue : émission de radio
    { id: 'b2-wissenschaft-hoeren', kind: 'exercise', title: 'Verstehen: ein Radiogespräch über Bürgerwissenschaft', estimatedMinutes: 23,
      competences: ['ecoute'],
      lesson: { description: `${C2.hoeren}

SITUATION
[fr?] La situation
${aide('In der Sendung „Wissen um sechs“ sprechen die Biologin Johanna Riedl und der Rentner Werner Danielsen über das Projekt „Summ mit“, bei dem Bürgerinnen und Bürger Insekten zählen.', 'Dans l’émission « Wissen um sechs », une biologiste et un retraité parlent d’un projet où des citoyens comptent les insectes.')}

STRATEGIE
[fr?] Stratégie
1. ${aide('Erstes Hören: Wie funktioniert das Projekt, und welche Rolle haben die beiden Gäste?', 'Première écoute : comment fonctionne le projet, et quel rôle ont les deux invités ?')}
2. ${aide('Lesen Sie die Notizen und überlegen Sie: Fehlt eine Zahl, ein Monat, ein Fachwort?', 'Lisez les notes : manque-t-il un nombre, un mois, un terme technique ?')}
3. ${aide('Zweites Hören: Ergänzen Sie die Notizen mit Stichwörtern. Achten Sie besonders auf die Antwort zur Zuverlässigkeit der Daten.', 'Deuxième écoute : complétez avec des mots-clés ; soyez attentif à la réponse sur la fiabilité des données.')}` },
      placements: [{ media: 'b2-wissenschaft-hoeren-audio', caption: 'Wissen um sechs: Forschen im eigenen Garten' }],
      questions: [
        fill('q1', aide('Notizen zum ersten Teil: Ergänzen Sie die Lücken mit Stichwörtern.', 'Notes sur la première partie : complétez avec des mots-clés.'),
          'Projekt „Summ mit“: Bürger zählen [[1]] und andere Insekten · Beobachtung: [[2]] Minuten an einer blühenden Fläche · am besten mit einem [[3]] · App: kostenlos, freigeschaltet ab dem 1. [[4]] · Teilnehmende im letzten Sommer: rund [[5]] · Herr Danielsen kam durch seine [[6]] zum Projekt',
          [['Wildbienen', 'Bienen'], ['15', 'fünfzehn'], ['Foto'], ['Juni'], ['12.000', '12000', '12 000', 'zwölftausend'], ['Enkelin']],
          'Gezählt werden „Wildbienen und andere Insekten“, fünfzehn Minuten lang, „am besten mit einem Foto“. Die App ist „ab dem ersten Juni freigeschaltet“; im letzten Sommer zählten „rund zwölftausend“ Menschen mit. Herr Danielsen ist „durch meine Enkelin“ dazugekommen. [fr?] Notez les chiffres en chiffres ou en lettres.'),
        fill('q2', aide('Notizen zum zweiten Teil: Ergänzen Sie die Lücken mit Stichwörtern.', 'Notes sur la seconde partie : complétez avec des mots-clés.'),
          'Qualität: alle Fotos werden von [[1]] geprüft · korrigiert wird etwa jede [[2]] Meldung · Datenschutz: die Daten sind [[3]] · Ergebnis: in Gärten mit [[4]] Pflanzen fast doppelt so viele Wildbienen · Grenze: auf dem [[5]] zählen viel weniger Menschen · Bericht für alle Teilnehmenden im [[6]]',
          [['Fachleuten', 'Fachleute', 'Experten', 'Expertinnen und Experten'], ['zehnte', '10.'], ['anonymisiert'], ['heimischen'], ['Land'], ['Dezember']],
          'Alle Fotos „werden von Fachleuten geprüft“, „ungefähr jede zehnte Meldung“ wird korrigiert, die Daten „sind anonymisiert“ (ein Zustand). Heimische Pflanzen locken fast doppelt so viele Wildbienen an. Grenze: In den Städten zählen viel mehr Menschen „als auf dem Land“. Der Bericht kommt „im Dezember“. [fr?] werden geprüft : processus ; sind anonymisiert : état.'),
        choice('q3', aide('Warum macht Herr Danielsen mit?', 'Pourquoi M. Danielsen participe-t-il ?'),
          [['Er ist Biologe und arbeitet seit Jahren für das Projekt.'],
            ['Seine Enkelin hat ihn darauf gebracht, und heute macht ihm das Zählen Freude.', true],
            ['Er möchte mit seinen schönsten Fotos von Wildbienen einen Wettbewerb gewinnen.'],
            ['Die Gemeinde hat alle Gartenbesitzer zur Teilnahme verpflichtet.']],
          'Er ist „durch meine Enkelin dazu gekommen“, und „inzwischen hat es mich richtig gepackt“: Er erkennt heute zwanzig Bienenarten und hat „das Gefühl, dass man etwas Sinnvolles beiträgt“. Biologin ist Frau Riedl. [fr?] « Es hat mich gepackt » : je me suis pris au jeu.'),
        choice('q4', aide('Was ist laut Frau Riedl der größte Vorteil der Bürgerwissenschaft?', 'Selon Mme Riedl, quel est le principal avantage de la science participative ?'),
          [['Man kann viel mehr Daten an viel mehr Orten sammeln.', true],
            ['Die Daten von Laien sind genauer als die der Fachleute.'],
            ['Die Forschung wird dadurch fast vollständig kostenlos.'],
            ['Man braucht danach keine klassischen Untersuchungen mehr.']],
          '„Ein Forschungsteam schafft vielleicht zweihundert Standorte, die Bürgerinnen und Bürger schaffen Tausende.“ Dass Laiendaten genauer sind, sagt sie nicht, im Gegenteil: Jede zehnte Meldung wird korrigiert. Klassische Untersuchungen bleiben nötig. [fr?] Bien plus de données, à bien plus d’endroits.'),
        choice('q5', aide('Was hat das Team überrascht?', 'Qu’est-ce qui a surpris l’équipe ?'),
          [['dass auf Balkonen überhaupt keine Wildbienen zu finden sind'],
            ['dass Anfänger nur sehr selten Bienenarten verwechseln'],
            ['dass in Städten weniger Menschen mitzählen als auf dem Land'],
            ['dass heimische Pflanzen fast doppelt so viele Wildbienen anlocken', true]],
          '„In Gärten mit heimischen Pflanzen haben wir fast doppelt so viele Wildbienen gezählt wie in Gärten mit exotischen Zierpflanzen.“ Auch Balkone können „einen Unterschied machen“. In den Städten zählen mehr Menschen als auf dem Land, nicht weniger. [fr?] Les plantes indigènes attirent près de deux fois plus d’abeilles sauvages.'),
        choice('q6', aide('Welche Haltung hat Frau Riedl zur Bürgerwissenschaft?', 'Quelle position Mme Riedl a-t-elle sur la science participative ?'),
          [['Sie hält sie für eine wichtige Ergänzung, aber nicht für einen Ersatz der Forschung.', true],
            ['Sie hält die Daten von Laien für viel zu ungenau, um sie wissenschaftlich wirklich zu nutzen.'],
            ['Sie glaubt, dass Bürger die Forschung bald ganz übernehmen werden.'],
            ['Sie findet das Projekt nett, aber für die Wissenschaft unwichtig.']],
          '„Bürgerwissenschaft ersetzt die Forschung nicht, aber sie ergänzt sie.“ Sie nimmt die Frage nach der Zuverlässigkeit ernst, löst sie aber durch Kontrolle der Fotos. Für manche Fragen braucht man weiterhin klassische Untersuchungen. [fr?] Un complément précieux, pas un remplacement.'),
      ] },

    // 4 · Grammaire inductive
    { id: 'b2-wissenschaft-entdecken', kind: 'exercise', title: 'Entdecken: Vorgang, Zustand und Nominalstil', estimatedMinutes: 10,
      competences: ['lecture'],
      lesson: { description: `${aide('Lesen Sie die Sätze aus dem Artikel und aus dem Radiogespräch. Achten Sie auf die Hilfsverben „werden“ und „sein“ und auf die Nomen auf -ung.', 'Lisez ces phrases de l’article et de l’émission. Observez les auxiliaires « werden » et « sein » et les noms en -ung.')}

SÄTZE
[fr?] Le corpus
(1) Die Studie war in einer angesehenen Fachzeitschrift veröffentlicht.
(2) Seit einigen Jahren werden viele Arbeiten als Preprints ins Internet gestellt.
(3) Die Ergebnisse sind zwar öffentlich, aber noch nicht abgesichert.
(4) Die App ist kostenlos und ab dem ersten Juni freigeschaltet.
(5) Deshalb werden alle Fotos von Fachleuten geprüft, bevor sie in die Auswertung eingehen.
(6) Die Auswertung erfolgt dann im Herbst.

${aide('Beantworten Sie dann die Fragen. Die Erklärungen formulieren die Regel.', 'Répondez ensuite aux questions. Les explications formulent la règle.')}` },
      questions: [
        choice('q1', aide('Sätze 2 und 5: Was beschreibt „werden … gestellt“ und „werden … geprüft“?', 'Phrases 2 et 5 : que décrivent ces formes avec « werden » ?'),
          [['einen Vorgang: Jemand tut etwas, die Handlung läuft ab', true],
            ['einen Zustand: Die Handlung ist schon lange abgeschlossen'],
            ['eine Vermutung über etwas, das wahrscheinlich passiert ist'],
            ['einen Plan für die Zukunft, wie im Futur I']],
          '„Werden“ + Partizip II ist das Vorgangspassiv: Es beschreibt den Prozess, die Handlung selbst (Fachleute prüfen die Fotos). Wer handelt, kann mit „von“ genannt werden: „von Fachleuten geprüft“. Mit Futur I hat „werden“ hier nichts zu tun, denn danach folgt ein Partizip, kein Infinitiv. [fr?] werden + participe : le passif d’action, le processus.'),
        choice('q2', aide('Sätze 1, 3 und 4: Was beschreibt „sein“ + Partizip II?', 'Phrases 1, 3 et 4 : que décrit « sein » + participe II ?'),
          [['eine Handlung, die gerade in diesem Moment noch abläuft und andauert'],
            ['eine Handlung, die in der Zukunft passieren wird'],
            ['einen Zustand: das Ergebnis einer abgeschlossenen Handlung', true],
            ['eine höfliche Bitte an die Hörerinnen und Hörer']],
          '„Sein“ + Partizip II ist das Zustandspassiv: Die Handlung ist abgeschlossen, man beschreibt ihr Ergebnis. Erst wird die App freigeschaltet (Vorgang), dann ist sie freigeschaltet (Zustand). Das Partizip funktioniert hier fast wie ein Adjektiv: „Die App ist kostenlos und freigeschaltet.“ [fr?] sein + participe : le passif d’état, le résultat.'),
        match('q3', aide('Was bedeutet der Satz? Ordnen Sie zu.', 'Que signifie chaque phrase ? Associez.'),
          [['Das Labor wird gerade geschlossen.', 'Jemand schließt es in diesem Moment.'],
            ['Das Labor ist geschlossen.', 'Man kann im Moment nicht hinein.'],
            ['Die Proben werden beschriftet.', 'Jemand schreibt gerade Namen darauf.'],
            ['Die Proben sind beschriftet.', 'Auf allen steht schon ein Name.']],
          'Vorgangspassiv (wird/werden + Partizip II): Die Handlung läuft. Zustandspassiv (ist/sind + Partizip II): Die Handlung ist fertig, ihr Ergebnis ist sichtbar. Im Französischen sagt « est fermé » beides; im Deutschen muss man wählen. [fr?] « est fermé » : wird geschlossen (on ferme) ou ist geschlossen (c’est fermé).'),
        choice('q4', aide('Satz 6: „Die Auswertung erfolgt im Herbst.“ Welcher Satz sagt dasselbe im Verbalstil?', 'Phrase 6 : quelle phrase dit la même chose au style verbal ?'),
          [['Die Auswerter erfolgen im Herbst.'],
            ['Die Daten sind im Herbst bereits erfolgt worden.'],
            ['Im Herbst erfolgt man die Daten.'],
            ['Die Daten werden im Herbst ausgewertet.', true]],
          'Im Nominalstil steckt die Handlung im Nomen („die Auswertung“), und ein fast inhaltsleeres Verb („erfolgen“) trägt den Satz. Im Verbalstil wird das Nomen wieder zum Verb: „auswerten“ → „Die Daten werden ausgewertet.“ Nominalstil ist typisch für Berichte und Behörden, Verbalstil ist leichter zu verstehen. [fr?] Le style nominal met l’action dans un nom ; le style verbal la remet dans un verbe.'),
      ] },

    // 5 · Règle
    { id: 'b2-wissenschaft-regel', kind: 'lesson', title: 'Regel: Zustandspassiv und Nominalstil', estimatedMinutes: 10,
      competences: ['lecture'],
      lesson: { description: `REGEL — VORGANGSPASSIV UND ZUSTANDSPASSIV
[fr?] Règle : passif d’action et passif d’état
Das Vorgangspassiv (werden + Partizip II) beschreibt einen Prozess, das Zustandspassiv (sein + Partizip II) sein Ergebnis.
[fr?] werden + participe = l’action en cours ; sein + participe = l’état qui en résulte.
• ${aide('Vorgang: Die Fotos werden von Fachleuten geprüft. (Jemand prüft sie.)', 'Les photos sont vérifiées par des spécialistes (on les vérifie).')}
• ${aide('Zustand: Die Fotos sind geprüft. (Die Prüfung ist abgeschlossen.)', 'Les photos sont vérifiées (c’est fait).')}
• ${aide('Zeiten des Zustandspassivs: Präsens „ist geprüft“, Präteritum „war geprüft“; andere Zeiten sind selten.', 'Surtout au présent et au prétérit.')}
• ${aide('Nur Verben, deren Handlung ein sichtbares Ergebnis hat, bilden ein Zustandspassiv: öffnen, schließen, veröffentlichen, prüfen, anonymisieren. Nicht: helfen, lachen, warten.', 'Seuls les verbes dont l’action produit un résultat ont un passif d’état.')}

REGEL — NOMINALSTIL UND VERBALSTIL
[fr?] Règle : style nominal et style verbal
Wissenschaftliche, juristische und behördliche Texte verpacken Handlungen oft in Nomen. Das macht sie kurz und sachlich, aber schwerer verständlich.
[fr?] Le style nominal est concis et objectif, mais plus difficile à comprendre.
• ${aide('nachdem die Daten ausgewertet worden sind → nach der Auswertung der Daten', 'après l’analyse des données')}
• ${aide('um Fehler zu vermeiden → zur Vermeidung von Fehlern', 'pour éviter les erreurs')}
• ${aide('während der Versuch durchgeführt wird → während der Durchführung des Versuchs', 'pendant la réalisation de l’expérience')}
• ${aide('weil sich die Lieferung verzögert → wegen der Verzögerung der Lieferung', 'en raison du retard de livraison')}
• ${aide('obwohl die Studie kritisiert wurde → trotz der Kritik an der Studie', 'malgré les critiques')}
${aide('So bildet man den Nominalstil: Das Verb wird zum Nomen (auswerten → die Auswertung, vergleichen → der Vergleich, messen → die Messung). Das Objekt kommt in den Genitiv (die Daten auswerten → die Auswertung der Daten), der Handelnde steht nach „durch“ (Fachleute prüfen → die Prüfung durch Fachleute). Verben wie „erfolgen“ oder „durchführen“ tragen den Satz: Die Auswertung erfolgt im Herbst.', 'Le verbe devient un nom, son complément passe au génitif, l’agent est introduit par « durch ».')}

REGEL — TEXTE VERBINDEN
[fr?] Règle : relier les phrases d’un texte
${aide('Wörter wie „dabei“, „daraus“, „somit“, „dies“ oder „diese Ergebnisse“ greifen einen vorherigen Satz auf und machen einen Text zusammenhängend: Die Forschenden haben nur vierzig Personen untersucht. Somit ist die Stichprobe zu klein.', 'Ces mots reprennent l’idée précédente et assurent la cohésion du texte.')}

ACHTUNG
[fr?] Attention : pièges des francophones
• ${aide('Das französische « est publié » kann Vorgang oder Zustand sein. Im Deutschen entscheiden Sie: „Die Studie wird gerade veröffentlicht“ oder „Die Studie ist (seit Montag) veröffentlicht“.', 'Le français ne distingue pas toujours ; l’allemand oblige à choisir.')}
• ${aide('„Die Studie ist veröffentlicht“ (Zustand) und „Die Studie ist veröffentlicht worden“ (Perfekt des Vorgangspassivs) sind nicht dasselbe: Das zweite erzählt, dass es passiert ist.', 'Sans « worden » : état ; avec « worden » : passé composé du passif d’action.')}
• ${aide('Übertreiben Sie den Nominalstil nicht: „Die Durchführung der Überprüfung der Daten erfolgte“ ist schwer lesbar. Besser: „Die Daten wurden überprüft.“', 'Évitez les chaînes de noms : préférez le verbe quand vous expliquez.')}` } },

    // 6 · Grammaire : s'entraîner
    { id: 'b2-wissenschaft-grammatik', kind: 'exercise', title: 'Üben: Zustandspassiv und Nominalstil', estimatedMinutes: 14,
      competences: ['lecture', 'expression-ecrite'],
      lesson: { description: `${aide('Üben Sie den Unterschied zwischen Vorgang und Zustand und die Umformung zwischen Verbalstil und Nominalstil.', 'Entraînez-vous à distinguer processus et état, et à passer du style verbal au style nominal.')}

MERKE
[fr?] À retenir
• ${aide('werden + Partizip II = Vorgang · sein + Partizip II = Zustand', 'werden = processus ; sein = état')}
• ${aide('Nominalstil: nach / vor / bei / wegen / trotz / zur + Nomen; Objekt im Genitiv; Handelnder mit „durch“', 'Style nominal : préposition + nom ; complément au génitif ; agent avec durch')}` },
      questions: [
        fill('q1', aide('„werden“ oder „sein“? Ergänzen Sie die richtige Form.', '« werden » ou « sein » ? Complétez avec la bonne forme.'),
          'Im Moment [[1]] die Daten noch ausgewertet. · Endlich! Die Auswertung [[2]] abgeschlossen. · Die Studie [[3]] seit gestern online veröffentlicht.',
          [['werden'], ['ist'], ['ist']],
          '„Im Moment … noch“ zeigt einen laufenden Prozess: Vorgangspassiv mit „werden“. „Endlich … abgeschlossen“ und „seit gestern“ beschreiben einen erreichten Zustand: „ist“. [fr?] Processus en cours : werden ; résultat acquis : sein.'),
        hints(fill('q2', aide('Bilden Sie das Zustandspassiv.', 'Formez le passif d’état.'),
          'Das Labor [[1]] am Wochenende [[2]]. · Alle Proben [[3]] schon [[4]].',
          [['ist'], ['geschlossen'], ['sind'], ['beschriftet']],
          'Zustandspassiv: konjugiertes „sein“ + Partizip II am Satzende. „Schließen“ → geschlossen, „beschriften“ → beschriftet (Verben auf be- haben kein „ge-“ im Partizip). Singular „ist“ für „das Labor“, Plural „sind“ für „alle Proben“. [fr?] Les verbes en be- n’ont pas de ge- au participe.'),
        'sein', 'schließen', 'sein', 'beschriften'),
        choice('q3', aide('Welcher Satz beschreibt einen Zustand?', 'Quelle phrase décrit un état ?'),
          [['Der Versuch wird gerade vorbereitet.'], ['Der Versuch wurde gestern vorbereitet.'],
            ['Der Versuch ist gut vorbereitet.', true], ['Der Versuch wird morgen vorbereitet.']],
          'Nur „ist … vorbereitet“ (sein + Partizip II) beschreibt das Ergebnis: Alles ist bereit. Die anderen Sätze stehen im Vorgangspassiv (wird, wurde) und beschreiben die Vorbereitung als Handlung, jetzt, gestern oder morgen. [fr?] « est bien préparée » au sens de « prête » : Zustandspassiv.'),
        order('q4', C2.ordnen, [['Wir', 'beginnen', 'erst,', 'wenn', 'alle Geräte', 'richtig', 'eingestellt', 'sind.']],
          'Im Nebensatz mit „wenn“ stehen Partizip II und das konjugierte „sind“ am Ende. „Eingestellt sind“ beschreibt den Zustand, den man vor Beginn braucht. „Erst“ betont: nicht vorher. [fr?] « Nous ne commençons que lorsque tous les appareils sont bien réglés. »'),
        fill('q5', aide('Bilden Sie den Nominalstil.', 'Passez au style nominal.'),
          'nachdem die Daten ausgewertet worden sind → nach der [[1]] der Daten · um Fehler zu vermeiden → zur [[2]] von Fehlern · während der Versuch durchgeführt wird → während der [[3]] des Versuchs · weil sich die Lieferung verzögert → wegen der [[4]] der Lieferung',
          [['Auswertung'], ['Vermeidung'], ['Durchführung'], ['Verzögerung']],
          'Aus dem Verb wird ein Nomen auf -ung (immer feminin): auswerten → die Auswertung, vermeiden → die Vermeidung, durchführen → die Durchführung, verzögern → die Verzögerung. Das Objekt steht im Genitiv („der Daten“) oder mit „von“ ohne Artikel („von Fehlern“). [fr?] Les noms en -ung sont tous féminins.'),
        hints(fill('q6', aide('Formen Sie in den Verbalstil um.', 'Passez au style verbal.'),
          'Nach der Veröffentlichung der Studie gab es viel Kritik. → Nachdem die Studie [[1]] worden war, gab es viel Kritik. · Trotz intensiver Suche fanden sie den Fehler nicht. → Obwohl sie intensiv [[2]], fanden sie den Fehler nicht.',
          [['veröffentlicht'], ['suchten', 'gesucht hatten']],
          'Die Präposition wird zur Konjunktion: nach → nachdem, trotz → obwohl. Das Nomen wird wieder zum Verb: die Veröffentlichung → veröffentlichen (hier im Passiv: veröffentlicht worden war), die Suche → suchen (suchten oder, vorzeitig, gesucht hatten). [fr?] La préposition devient conjonction, le nom redevient verbe.'),
        'veröffentlichen', 'suchen'),
        order('q7', C2.ordnen, [['Die Auswertung', 'der', 'gesammelten', 'Daten', 'wird', 'im Herbst', 'durch ein unabhängiges Team', 'vorgenommen.'],
          ['Die Auswertung', 'der', 'gesammelten', 'Daten', 'wird', 'durch ein unabhängiges Team', 'im Herbst', 'vorgenommen.']],
          'Typischer Nominalstil: Das Subjekt ist eine Nominalgruppe mit Genitiv („die Auswertung der gesammelten Daten“), „wird“ steht an zweiter Stelle, das Funktionsverb „vorgenommen“ am Ende, der Handelnde folgt nach „durch“. Zeitangabe und „durch“-Gruppe können die Plätze tauschen. [fr?] « L’analyse des données recueillies est effectuée à l’automne par une équipe indépendante. »'),
        choice('q8', aide('Welcher Satz im Nominalstil passt zu „Weil das Gerät defekt war, wurde der Versuch abgebrochen“?', 'Quelle phrase au style nominal correspond à cette phrase ?'),
          [['Trotz eines Defekts des Geräts wurde der Versuch abgebrochen.'],
            ['Wegen eines Defekts des Geräts wurde der Versuch abgebrochen.', true],
            ['Nach dem Abbruch des Versuchs war das Gerät plötzlich defekt.'],
            ['Zur Vermeidung eines Defekts wurde der Versuch abgebrochen.']],
          '„Weil“ (Grund) wird im Nominalstil zu „wegen“ + Genitiv. „Trotz“ entspricht „obwohl“, „nach“ entspricht „nachdem“ und dreht hier die Reihenfolge um, „zur Vermeidung“ entspricht „um … zu vermeiden“ (Ziel). [fr?] weil → wegen ; obwohl → trotz ; nachdem → nach ; um … zu → zur.'),
        match('q9', aide('Welche Präposition im Nominalstil entspricht welcher Konjunktion? Ordnen Sie zu.', 'Quelle préposition du style nominal correspond à quelle conjonction ? Associez.'),
          [['nach dem Versuch', 'nachdem …'], ['vor dem Versuch', 'bevor …'], ['bei dem Versuch', 'als … / wenn …'], ['wegen des Versuchs', 'weil …'],
            ['trotz des Versuchs', 'obwohl …'], ['zur Durchführung des Versuchs', 'um … zu …']],
          'Diese Paare braucht man ständig, um Fachtexte zu verstehen und sie in einfaches Deutsch zu übertragen: nach ↔ nachdem, vor ↔ bevor, bei ↔ als/wenn, wegen ↔ weil, trotz ↔ obwohl, zur ↔ um … zu. [fr?] Correspondances entre prépositions et conjonctions.'),
        choice('q10', aide('Welcher Satz ist richtig?', 'Quelle phrase est correcte ? (« L’article est publié depuis hier. »)'),
          [['Der Artikel wird seit gestern veröffentlicht.'], ['Der Artikel ist seit gestern veröffentlicht worden.'],
            ['Der Artikel hat seit gestern veröffentlicht.'], ['Der Artikel ist seit gestern veröffentlicht.', true]],
          '„Seit gestern“ beschreibt einen Zustand, der bis heute andauert: Zustandspassiv „ist veröffentlicht“. „Wird veröffentlicht“ wäre ein laufender Prozess, „ist veröffentlicht worden“ erzählt das Ereignis und passt nicht zu „seit“, „hat veröffentlicht“ ist Aktiv ohne Objekt. [fr?] seit + état : ist veröffentlicht.'),
      ] },

    // 7 · Lexique
    { id: 'b2-wissenschaft-wortschatz', kind: 'exercise', title: 'Wortschatz: Forschung und Methode', estimatedMinutes: 12,
      competences: ['lecture', 'expression-ecrite'],
      lesson: { description: `${aide('Lernen Sie die Wörter in Verbindungen: Nomen mit Verb, Wortfamilien und vorsichtige Formulierungen.', 'Apprenez les mots en contexte : nom et verbe, familles de mots et formulations prudentes.')}

TIPP
[fr?] Conseil
${aide('In der Wissenschaft formuliert man vorsichtig: „Die Daten deuten darauf hin, dass …“, „Es spricht vieles dafür, dass …“. Ein Wort wie „bewiesen“ ist für wirklich gesicherte Ergebnisse reserviert.', 'En science, on formule avec prudence ; « bewiesen » est réservé aux résultats vraiment établis.')}` },
      questions: [
        match('q1', aide('Welches Verb passt? Ordnen Sie zu.', 'Quel verbe convient ? Associez.'),
          [['eine Hypothese', 'aufstellen'], ['Daten', 'erheben'], ['ein Experiment', 'durchführen'], ['zu einem Ergebnis', 'kommen'],
            ['einen Zusammenhang', 'nachweisen']],
          'eine Hypothese aufstellen, Daten erheben, ein Experiment durchführen, zu einem Ergebnis kommen, einen Zusammenhang nachweisen. Diese Verbindungen sind typisch für wissenschaftliche Texte und Berichte. [fr?] formuler une hypothèse, collecter des données, mener une expérience, aboutir à un résultat, démontrer un lien.'),
        fill('q2', aide('Bilden Sie das passende Nomen.', 'Formez le nom correspondant.'),
          'forschen → die [[1]] · untersuchen → die [[2]] · erkennen → die [[3]] · entdecken → die [[4]] · erfinden → die [[5]]',
          [['Forschung'], ['Untersuchung'], ['Erkenntnis'], ['Entdeckung'], ['Erfindung']],
          'Die meisten Nomen haben die Endung -ung und sind feminin. Eine Ausnahme ist „die Erkenntnis“ mit -nis (Plural: die Erkenntnisse). Achtung: Man entdeckt, was schon da ist (eine neue Bienenart), man erfindet, was es noch nicht gibt (ein Gerät). [fr?] la recherche, l’étude, la connaissance, la découverte, l’invention.'),
        fill('q3', aide('Wie heißen die Personen? Ergänzen Sie.', 'Comment s’appellent ces personnes ? Complétez.'),
          'Wer forscht, ist ein [[1]] oder eine Forscherin. · Wer kein Fachmann ist, ist ein [[2]]. · Wer an einer Studie teilnimmt, ist ein [[3]] oder eine Teilnehmerin.',
          [['Forscher'], ['Laie'], ['Teilnehmer', 'Proband']],
          'der Forscher, der Laie (n-Deklination: den Laien, dem Laien), der Teilnehmer; in der Medizin sagt man auch „der Proband“. Für gemischte Gruppen verwendet man oft das Partizip: die Forschenden, die Teilnehmenden. [fr?] le chercheur, le profane, le participant.'),
        choice('q4', aide('Welches Verb passt? „Die Forscherin hat im Regenwald eine bisher unbekannte Bienenart …“', 'Quel verbe convient ?'),
          [['erfunden.'], ['entdeckt.', true], ['hergestellt.'], ['erstellt.']],
          'Etwas, das schon existiert, aber noch unbekannt war, entdeckt man. Erfinden kann man nur etwas Neues, das der Mensch schafft (ein Gerät, ein Verfahren); „herstellen“ heißt produzieren, „erstellen“ anfertigen (eine Liste, einen Bericht). [fr?] entdecken = découvrir ; erfinden = inventer.'),
        choice('q5', aide('Wie formuliert man ein Ergebnis wissenschaftlich vorsichtig?', 'Comment formuler un résultat avec une prudence scientifique ?'),
          [['Es ist endgültig bewiesen, dass heimische Pflanzen mehr Bienen anlocken.'],
            ['Jeder weiß doch, dass heimische Pflanzen mehr Bienen anlocken.'],
            ['Die Daten deuten darauf hin, dass heimische Pflanzen mehr Bienen anlocken.', true],
            ['Heimische Pflanzen locken immer und überall mehr Bienen an, Punkt.']],
          '„Die Daten deuten darauf hin, dass …“ gibt ein Ergebnis wieder, ohne mehr zu behaupten, als belegt ist. „Endgültig bewiesen“, „jeder weiß“ und „immer und überall“ übertreiben, genau wie die Schlagzeilen, die der Artikel kritisiert. [fr?] « Les données suggèrent que … » : formulation prudente.'),
        choice('q6', aide('Was ist ein „Zusammenhang“ im Sinne des Artikels?', 'Qu’est-ce qu’un « Zusammenhang » au sens de l’article ?'),
          [['Zwei Dinge treten oft gemeinsam auf, ohne dass klar ist, ob eins das andere bewirkt.', true],
            ['Ein Experiment beweist eindeutig und endgültig, welche Ursache eine bestimmte Wirkung hat.'],
            ['Eine Studie wird von anderen Fachleuten gelesen und ausführlich bewertet.'],
            ['Mehrere Forschungsteams arbeiten gemeinsam an demselben großen Projekt.']],
          'Ein Zusammenhang (Korrelation) bedeutet nur, dass zwei Dinge gemeinsam auftreten, wie Eisverkauf und Sonnenbrand. Ob das eine das andere verursacht (Kausalität), muss erst ein Experiment zeigen. Die anderen Antworten beschreiben ein Experiment, die Begutachtung und eine Zusammenarbeit. [fr?] Zusammenhang = corrélation ; Ursache = cause.'),
        match('q7', aide('Was bedeuten die Ausdrücke? Ordnen Sie zu.', 'Que signifient ces expressions ? Associez.'),
          [['auf etwas stoßen', 'etwas zufällig finden'], ['zu dem Schluss kommen', 'als Ergebnis feststellen'],
            ['etwas in Frage stellen', 'an etwas zweifeln'], ['etwas belegen', 'etwas mit Daten beweisen']],
          'Diese Ausdrücke beschreiben, wie Forschung funktioniert: Man stößt auf ein Phänomen, stellt eine Annahme in Frage, belegt sie mit Daten und kommt schließlich zu einem Schluss. [fr?] tomber sur, arriver à la conclusion, remettre en question, prouver.'),
      ] },

    // 8 · -hoeren2 : écoute authentique écrite par le lot M2 (_media.mjs, insérée après -wortschatz, 15 min).

    // 9 · Vérifier
    { id: 'b2-wissenschaft-kontrolle', kind: 'exercise', title: 'Prüfen: Studien, Zustände und Nominalstil', estimatedMinutes: 14,
      competences: ['lecture', 'ecoute'],
      lesson: { description: `${aide('Prüfen Sie, was Sie in diesem Modul gelernt haben: Hören, Grammatik und Wortschatz.', 'Vérifiez ce que vous avez appris dans ce module : écoute, grammaire et vocabulaire.')}

${aide('Hören Sie eine kurze Wissenschaftsmeldung. Sie hilft Ihnen bei den Fragen 1 bis 4.', 'Écoutez une brève nouvelle scientifique. Elle vous aide pour les questions 1 à 4.')}` },
      placements: [{ media: 'b2-wissenschaft-kontrolle-audio', caption: 'Wissenschaft in Kürze' }],
      questions: [
        choice('q1', aide('Was weiß man über den Stand der Studie?', 'Que sait-on de l’état de l’étude ?'),
          [['Sie ist in einer Fachzeitschrift erschienen und schon von mehreren Teams bestätigt.'],
            ['Sie ist online veröffentlicht, aber noch nicht von anderen Fachleuten geprüft.', true],
            ['Sie wird gerade durchgeführt, Ergebnisse gibt es noch keine.'],
            ['Sie wurde abgebrochen, weil zu wenige Studierende teilnahmen.']],
          '„Die Studie ist als Preprint im Internet veröffentlicht und noch nicht von anderen Fachleuten begutachtet.“ Das Zustandspassiv „ist veröffentlicht“ zeigt: Die Veröffentlichung ist erfolgt; die Begutachtung steht noch aus. [fr?] Publiée en prépublication, pas encore évaluée.'),
        choice('q2', aide('Welche Schlussfolgerung passt zu der Meldung?', 'Quelle conclusion correspond à la nouvelle ?'),
          [['Ein Mittagsschlaf verbessert das Gedächtnis bei allen Menschen deutlich.'],
            ['Studierende sollten jeden Tag zwanzig Minuten Mittagsschlaf machen.'],
            ['Mit nur vierzig Personen ist das Ergebnis ein erster Hinweis, mehr nicht.', true],
            ['Das Lesen einer Zeitschrift schadet dem Gedächtnis beim Vokabellernen.']],
          'Vierzig Studierende sind eine kleine Stichprobe, und die Studie ist noch nicht begutachtet. Die Forschenden sagen selbst, dass „größere Studien“ das Ergebnis bestätigen müssen. Genau das empfiehlt auch der Artikel: auf Stichprobe und Prüfung achten. [fr?] Petit échantillon, étude non évaluée : simple indice.'),
        fill('q3', aide('„werden“ oder „sein“? Ergänzen Sie.', '« werden » ou « sein » ? Complétez.'),
          'Die Studie [[1]] schon als Preprint veröffentlicht. · Im Moment [[2]] sie von zwei Fachleuten begutachtet.',
          [['ist'], ['wird']],
          'Die Veröffentlichung ist abgeschlossen: Zustandspassiv „ist veröffentlicht“. Die Begutachtung läuft „im Moment“: Vorgangspassiv „wird begutachtet“. [fr?] Publication faite : ist ; évaluation en cours : wird.'),
        order('q4', C2.ordnen, [['Die', 'Ergebnisse', 'müssen', 'noch', 'durch', 'größere Studien', 'bestätigt', 'werden.'],
          ['Die', 'Ergebnisse', 'müssen', 'durch', 'größere Studien', 'noch', 'bestätigt', 'werden.']],
          'Passiv mit Modalverb: „müssen“ an zweiter Stelle, am Ende Partizip II + „werden“ (bestätigt werden). Wer etwas bestätigt, steht nach „durch“. „Noch“ kann vor oder nach „durch größere Studien“ stehen. [fr?] Modal + participe + werden à la fin.'),
        choice('q5', aide('Welcher Satz bedeutet „Nach Abschluss der Messungen wurden die Daten veröffentlicht“?', 'Quelle phrase a le même sens ?'),
          [['Bevor die Messungen ganz abgeschlossen waren, wurden die Daten schon veröffentlicht.'],
            ['Obwohl die Messungen abgeschlossen waren, wurden die Daten veröffentlicht.'],
            ['Weil die Daten veröffentlicht waren, wurden die Messungen abgeschlossen.'],
            ['Nachdem die Messungen abgeschlossen waren, wurden die Daten veröffentlicht.', true]],
          '„Nach Abschluss der Messungen“ wird im Verbalstil zu „Nachdem die Messungen abgeschlossen waren“. „Bevor“ kehrt die Reihenfolge um, „obwohl“ drückt einen Gegensatz aus, und der dritte Satz vertauscht Ursache und Folge. [fr?] nach + nom = nachdem + verbe.'),
        rf('q6', 'Laut Artikel lassen sich Ergebnisse aus Versuchen mit Mäusen direkt auf Menschen übertragen.', 'f',
          'Falsch: „Was im Labor bei Mäusen wirkt, ist beim Menschen noch lange nicht bewiesen.“ Deshalb soll man bei Meldungen prüfen, ob überhaupt Menschen untersucht wurden. [fr?] Ce qui marche chez la souris n’est pas prouvé chez l’humain.'),
        fill('q7', aide('Ergänzen Sie die Fachwörter aus dem Modul.', 'Complétez avec les termes du module.'),
          'Eine Studie, die schon online steht, aber noch nicht von anderen Fachleuten geprüft wurde, ist ein [[1]]. · Die Gruppe, mit der man die Versuchsgruppe vergleicht, heißt [[2]].',
          [['Preprint'], ['Kontrollgruppe']],
          'Ein Preprint ist eine Vorabveröffentlichung ohne Begutachtung. Die Kontrollgruppe bekommt die untersuchte Behandlung nicht; in der Meldung war das die Gruppe, die eine Zeitschrift las, statt zu schlafen. [fr?] la prépublication ; le groupe témoin.'),
        choice('q8', aide('Welches Wort verbindet die Sätze am besten? „Die Forschenden haben nur vierzig Personen untersucht. … ist die Stichprobe für allgemeine Aussagen zu klein.“', 'Quel mot relie le mieux les deux phrases ?'),
          [['Trotzdem'], ['Somit', true], ['Stattdessen'], ['Dennoch']],
          '„Somit“ (= daraus folgt) zieht eine Schlussfolgerung aus dem vorherigen Satz. „Trotzdem“ und „dennoch“ drücken einen Gegensatz aus, „stattdessen“ eine Alternative; beides passt nicht zur Logik. Solche Verbindungswörter machen einen Text zusammenhängend. [fr?] somit = par conséquent.'),
      ] },
  ],
};
