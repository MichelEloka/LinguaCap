// Module B2 n° 1 · thème « Lebenswege » (lot R5). Biographies, migration et plurilinguisme : un reportage sur un
// « Erzählcafé » où des immigrés racontent leur parcours (et les chemins qu'ils n'ont pas pris), une émission de radio sur
// les enfants qui grandissent avec plusieurs langues (l'écoute authentique -hoeren2 vient du lot M2). Grammaire : Konjunktiv II
// passé, y compris avec les verbes de modalité (hätte … lernen sollen), et infinitif passé (muss … gewirkt haben,
// froh, … zu haben). Consignes et explications en allemand, aide française repliée ([fr?]).
import { C2, aide, choice, fill, order, match } from '../../lib.mjs';

/** « Richtig / falsch / steht nicht im Text » : r, f ou n pour la bonne réponse. */
const rf = (id, statement, answer, explanation) => choice(id, `„${statement}“ ${C2.richtigFalsch}`,
  [['richtig', answer === 'r'], ['falsch', answer === 'f'], ['steht nicht im Text', answer === 'n']], explanation);
/** Indices affichés sous les trous d'un fill (forme de base à transformer). */
const hints = (question, ...values) => ({ ...question,
  blanks: question.blanks.map((blank, index) => (values[index] ? { ...blank, hint: values[index] } : blank)) });

const ARTIKEL_A = 'Der Raum ist klein, der Kaffee stark, und an diesem Dienstagabend ist jeder Stuhl besetzt. Seit vier Jahren organisiert die Historikerin Theda Brandstätter das Erzählcafé „Wege nach Bremen“. Die Regeln sind einfach: Jeder darf erzählen, niemand muss. Wer spricht, wird nicht unterbrochen, Fragen sind erst am Ende erlaubt.';

export default {
  id: 'b2-lebenswege',
  title: 'Lebenswege: Biografien, Migration und Mehrsprachigkeit',
  objective: 'Comprendre des récits de vie et le point de vue d’une journaliste, suivre une émission de radio sur le plurilinguisme en prenant des notes, parler de choix passés, de regrets et de suppositions (Konjunktiv II passé, infinitif passé).',
  grammarFocus: ['konjunktiv2-vergangenheit', 'infinitiv-perfekt'],
  sources: ['Textes, dialogues et émission de radio originaux LinguaCap.'],

  vocabulary: [
    { word: 'Lebensweg', article: 'der', plural: 'Lebenswege', partOfSpeech: 'noun', translation: 'le parcours de vie',
      example: 'Im Erzählcafé hört man sehr unterschiedliche Lebenswege.', note: null },
    { word: 'auswandern', partOfSpeech: 'verb', translation: 'émigrer',
      example: 'Ihre Großeltern sind in den Sechzigerjahren nach Kanada ausgewandert.', note: 'séparable : aus|wandern · parfait avec sein' },
    { word: 'Auswanderung', article: 'die', plural: 'Auswanderungen', partOfSpeech: 'noun', translation: 'l’émigration',
      example: 'Die Auswanderung war für sie leichter als die Rückkehr.', note: 'contraire : die Einwanderung (l’immigration)' },
    { word: 'Rückkehr', article: 'die', plural: null, partOfSpeech: 'noun', translation: 'le retour',
      example: 'Nach ihrer Rückkehr fühlte sie sich zuerst fremd.', note: 'sans pluriel · zurückkehren : revenir' },
    { word: 'Herkunft', article: 'die', plural: null, partOfSpeech: 'noun', translation: 'l’origine',
      example: 'Seine Herkunft hört man an seinem Akzent.', note: 'sans pluriel dans ce sens' },
    { word: 'Herkunftssprache', article: 'die', plural: 'Herkunftssprachen', partOfSpeech: 'noun', translation: 'la langue d’origine (de la famille)',
      example: 'Viele Schulen bieten Unterricht in der Herkunftssprache an.', note: 'Fugen-s : Herkunft + s + Sprache' },
    { word: 'Muttersprache', article: 'die', plural: 'Muttersprachen', partOfSpeech: 'noun', translation: 'la langue maternelle',
      example: 'Ihre Muttersprache ist Türkisch, ihre Arbeitssprache Deutsch.', note: null },
    { word: 'mehrsprachig', partOfSpeech: 'adjective', translation: 'plurilingue',
      example: 'Fast jedes zweite Kind wächst hier mehrsprachig auf.', note: 'mehrsprachig aufwachsen : grandir avec plusieurs langues' },
    { word: 'Mehrsprachigkeit', article: 'die', plural: null, partOfSpeech: 'noun', translation: 'le plurilinguisme',
      example: 'Die Schule sollte Mehrsprachigkeit als Kompetenz sehen.', note: 'sans pluriel' },
    { word: 'Fuß fassen', partOfSpeech: 'expression', translation: 's’établir, prendre pied',
      example: 'Es hat zwei Jahre gedauert, bis sie in Bremen Fuß gefasst hatte.', note: 'in + datif : in einer Stadt Fuß fassen' },
    { word: 'sich einleben', partOfSpeech: 'verb', translation: 's’acclimater, s’habituer',
      example: 'Wir haben uns schnell in der neuen Stadt eingelebt.', note: 'séparable : ein|leben · in + datif' },
    { word: 'ins kalte Wasser springen', partOfSpeech: 'expression', translation: 'se jeter à l’eau, sauter dans le grand bain',
      example: 'Ohne ein Wort Deutsch nach Bremen zu ziehen hieß, ins kalte Wasser zu springen.', note: 'au sens figuré' },
    { word: 'Heimweh haben', partOfSpeech: 'expression', translation: 'avoir le mal du pays',
      example: 'Im ersten Winter hatte er schreckliches Heimweh.', note: 'das Heimweh, sans pluriel' },
    { word: 'bereuen', partOfSpeech: 'verb', translation: 'regretter (une action)',
      example: 'Ich bereue meine Entscheidung nicht.', note: 'etwas bereuen · es bereuen, … zu haben' },
    { word: 'bedauern', partOfSpeech: 'verb', translation: 'regretter, déplorer',
      example: 'Er bedauert, dass er nicht früher Deutsch gelernt hat.', note: null },
    { word: 'Wendepunkt', article: 'der', plural: 'Wendepunkte', partOfSpeech: 'noun', translation: 'le tournant',
      example: 'Die Geburt ihres Sohnes war ein Wendepunkt in ihrem Leben.', note: null },
    { word: 'den Schritt wagen', partOfSpeech: 'expression', translation: 'oser franchir le pas',
      example: 'Ich bin froh, den Schritt gewagt zu haben.', note: null },
    { word: 'Umschulung', article: 'die', plural: 'Umschulungen', partOfSpeech: 'noun', translation: 'la reconversion (formation à un nouveau métier)',
      example: 'Nach der Schließung der Werft hätte er eine Umschulung machen können.', note: 'umschulen : se reconvertir' },
    { word: 'Anerkennung', article: 'die', plural: 'Anerkennungen', partOfSpeech: 'noun', translation: 'la reconnaissance (d’un diplôme)',
      example: 'Die Anerkennung ihres Abschlusses hat acht Monate gedauert.', note: 'einen Abschluss anerkennen lassen' },
    { word: 'sich zugehörig fühlen', partOfSpeech: 'expression', translation: 'se sentir chez soi, se sentir appartenir à',
      example: 'Nach zehn Jahren fühlt er sich der Stadt zugehörig.', note: '+ datif · die Zugehörigkeit' },
    { word: 'prägen', partOfSpeech: 'verb', translation: 'marquer, façonner',
      example: 'Die Jahre im Ausland haben sie stark geprägt.', note: null },
    { word: 'rückblickend', partOfSpeech: 'adverb', translation: 'rétrospectivement, avec le recul',
      example: 'Rückblickend hätte ich mich besser vorbereiten sollen.', note: 'verbe juste après : Rückblickend hätte ich …' },
    { word: 'im Nachhinein', partOfSpeech: 'expression', translation: 'après coup',
      example: 'Im Nachhinein war es die richtige Entscheidung.', note: 'Nachhinein avec majuscule' },
    { word: 'jemandem etwas übel nehmen', partOfSpeech: 'expression', translation: 'en vouloir à quelqu’un de quelque chose',
      example: 'Sie hat ihren Eltern lange übel genommen, dass sie so früh übersetzen musste.', note: 'aussi en un mot : übelnehmen' },
    { word: 'dolmetschen', partOfSpeech: 'verb', translation: 'interpréter (à l’oral)',
      example: 'Als Kind musste sie beim Arzt für ihre Mutter dolmetschen.', note: 'die Dolmetscherin : l’interprète' },
    { word: 'unverkennbar', partOfSpeech: 'adjective', translation: 'reconnaissable entre tous, indéniable',
      example: 'Er spricht fließend, mit unverkennbarem Akzent.', note: null },
  ],

  media: [
    { key: 'b2-lebenswege-lesen-artikel', kind: 'image', title: 'Article : « Et si… ? », un café-récit à Brême',
      alt: 'Début d’un article de magazine intitulé « Was wäre gewesen, wenn …? » : dans une bibliothèque de quartier à Brême, des immigrés racontent leur parcours lors d’un café-récit.',
      image: { layout: 'article', kicker: 'Lebenswege', icon: 'book-open', title: '„Was wäre gewesen, wenn …?“',
        byline: 'Lebensgeschichten im Erzählcafé · Von Johanna Tiedemann',
        lead: 'Einmal im Monat erzählen Menschen in einer Bremer Stadtteilbibliothek, wie sie nach Deutschland gekommen sind. Dabei geht es erstaunlich oft um die Wege, die sie nicht gegangen sind.',
        paragraphs: [ARTIKEL_A] } },
    { key: 'b2-lebenswege-hoeren-audio', kind: 'audio', title: 'Émission de radio : grandir avec plusieurs langues',
      script: [
        { voice: 'mann', name: 'Jens Petersen', text: 'Guten Abend und willkommen bei „Alltag und Wissen“. In vielen Familien wird am Küchentisch mehr als eine Sprache gesprochen. In manchen Großstädten wächst inzwischen fast jedes zweite Kind mehrsprachig auf. Trotzdem hören Eltern noch immer widersprüchliche Ratschläge.' },
        { voice: 'mann', name: 'Jens Petersen', text: 'Darüber spreche ich heute mit der Sprachwissenschaftlerin Doktor Annika Brodersen, die seit fünfzehn Jahren mehrsprachige Familien begleitet und erforscht. Guten Abend, Frau Brodersen.' },
        { voice: 'frau2', name: 'Annika Brodersen', text: 'Guten Abend, Herr Petersen.' },
        { voice: 'mann', name: 'Jens Petersen', text: 'Fangen wir mit dem Klassiker an: Viele Eltern haben Angst, dass ihr Kind durcheinanderkommt, wenn es zwei oder drei Sprachen gleichzeitig lernt. Ist an dieser Sorge etwas dran?' },
        { voice: 'frau2', name: 'Annika Brodersen', text: 'Die Sorge ist sehr verbreitet, aber sie ist unbegründet. Kinder können von Geburt an mehrere Sprachen lernen, weltweit ist das eher die Regel als die Ausnahme. Was Eltern oft beunruhigt, ist das Mischen: Ein Kind beginnt einen Satz auf Deutsch und beendet ihn auf Polnisch.' },
        { voice: 'frau2', name: 'Annika Brodersen', text: 'Das ist aber kein Zeichen von Verwirrung, im Gegenteil. Das Kind nutzt einfach alle Mittel, die ihm zur Verfügung stehen. Mehrsprachige Erwachsene machen das übrigens ganz genauso, oft ohne es zu merken.' },
        { voice: 'mann', name: 'Jens Petersen', text: 'Ein zweiter Rat, den man immer wieder hört: Eltern sollten zu Hause Deutsch sprechen, damit das Kind in der Schule keine Nachteile hat.' },
        { voice: 'frau2', name: 'Annika Brodersen', text: 'Das ist gut gemeint, aber meistens kontraproduktiv. Wir haben in einer Studie hundertzwanzig Familien begleitet. Wenn Eltern eine Sprache sprechen, die sie selbst nicht gut beherrschen, wird die Kommunikation ärmer. Sie erzählen weniger, sie singen weniger, und sie streiten sogar weniger.' },
        { voice: 'frau2', name: 'Annika Brodersen', text: 'Und gerade beim Streiten lernt man sehr viel Sprache! Mein Rat lautet deshalb: Sprechen Sie mit Ihrem Kind die Sprache, in der Sie sich zu Hause fühlen. Deutsch kommt über die Kita, die Schule und die Freunde fast von selbst.' },
        { voice: 'mann', name: 'Jens Petersen', text: 'Wir haben eine Hörerin in der Leitung. Frau Ramírez aus Köln, Ihre Frage bitte.' },
        { voice: 'frau3', name: 'Lucía Ramírez', text: 'Guten Abend. Ich komme aus Spanien, mein Mann ist Deutscher, und wir haben mit unserem Sohn von Anfang an beide Sprachen gesprochen. Aber seit er in die Schule geht, antwortet er mir nur noch auf Deutsch. Er versteht alles, aber er spricht kein Spanisch mehr. Hätten wir etwas anders machen sollen?' },
        { voice: 'frau2', name: 'Annika Brodersen', text: 'Frau Ramírez, zuerst einmal: Sie haben nichts falsch gemacht. Was Sie beschreiben, erleben sehr viele Familien. Mit der Einschulung wird Deutsch zur stärkeren Sprache, weil das Kind dort den größten Teil des Tages verbringt. Man spricht dann von passiver Zweisprachigkeit: Das Kind versteht, aber es spricht nicht.' },
        { voice: 'frau3', name: 'Lucía Ramírez', text: 'Und kommt das Spanische irgendwann zurück?' },
        { voice: 'frau2', name: 'Annika Brodersen', text: 'Oft schon, nämlich dann, wenn das Kind einen echten Grund hat, die Sprache zu benutzen. Dass ein Elternteil konsequent auf Spanisch antwortet, reicht dafür meistens nicht. Viel wirksamer sind Situationen, in denen Deutsch nicht funktioniert.' },
        { voice: 'frau2', name: 'Annika Brodersen', text: 'Zum Beispiel Ferien bei den Großeltern, die kein Deutsch sprechen, Videotelefonate mit Cousins oder eine spanischsprachige Spielgruppe. Kinder lernen eine Sprache nicht, weil sie wichtig ist, sondern weil sie sie brauchen.' },
        { voice: 'mann', name: 'Jens Petersen', text: 'Welche Rolle spielt dabei die Schule?' },
        { voice: 'frau2', name: 'Annika Brodersen', text: 'Eine große. In vielen Bundesländern gibt es herkunftssprachlichen Unterricht, also zusätzliche Stunden zum Beispiel in Türkisch, Arabisch, Polnisch oder Spanisch. Leider wissen viele Eltern nicht, dass es dieses Angebot gibt. Außerdem liegt der Unterricht oft am Nachmittag, wenn die Kinder schon müde sind.' },
        { voice: 'frau2', name: 'Annika Brodersen', text: 'Ich wünsche mir, dass Schulen Mehrsprachigkeit nicht als Problem sehen, sondern als Kompetenz, die man auch im Zeugnis zeigen kann.' },
        { voice: 'mann', name: 'Jens Petersen', text: 'Zum Schluss: Was ist Ihr wichtigster Rat für Eltern?' },
        { voice: 'frau2', name: 'Annika Brodersen', text: 'Haben Sie Geduld, und machen Sie die Sprache nicht zur Pflicht. Wenn ein Kind ständig korrigiert wird, verliert es die Lust. Lesen Sie lieber vor, schauen Sie zusammen Filme, erzählen Sie von Ihrer eigenen Kindheit. Eine Sprache, die mit schönen Erinnerungen verbunden ist, gibt man nicht so leicht auf.' },
        { voice: 'mann', name: 'Jens Petersen', text: 'Frau Doktor Brodersen, vielen Dank für das Gespräch. Und Ihnen, Frau Ramírez, alles Gute!' },
      ] },
    { key: 'b2-lebenswege-kontrolle-audio', kind: 'audio', title: 'Message vocal de l’organisatrice du café-récit',
      script: [
        { voice: 'sprecherin', name: 'Theda Brandstätter', text: 'Hallo, hier ist Theda Brandstätter vom Erzählcafé „Wege nach Bremen“. Ich wollte mich noch einmal bedanken, dass Sie letzten Dienstag Ihre Geschichte erzählt haben. Viele Gäste haben mich danach darauf angesprochen.' },
        { voice: 'sprecherin', name: 'Theda Brandstätter', text: 'Beim nächsten Treffen am zwölften März geht es um das Thema „Sprachen in der Familie“. Wir hätten Sie gern wieder dabei. Vielleicht könnten Sie sogar erzählen, wie Ihre Kinder mit zwei Sprachen aufgewachsen sind.' },
        { voice: 'sprecherin', name: 'Theda Brandstätter', text: 'Wir treffen uns diesmal nicht in der Bibliothek, sondern im Gemeindesaal nebenan, weil beim letzten Mal einige Gäste stehen mussten. Geben Sie mir doch bis Ende nächster Woche kurz Bescheid, ob Sie Zeit haben. Danke und bis bald!' },
      ] },
  ],

  activities: [
    // 1 · Einstieg
    { id: 'b2-lebenswege-einstieg', kind: 'lesson', title: 'Einstieg: Wege, die ein Leben prägen', estimatedMinutes: 10,
      competences: ['lecture', 'expression-orale'],
      lesson: { description: `LEBENSWEGE
[fr?] Parcours de vie
${aide('Auswandern, zurückkehren, zwischen zwei Sprachen leben: In diesem Modul geht es um Entscheidungen, die ein ganzes Leben prägen, und um den Blick zurück auf diese Entscheidungen.', 'Émigrer, revenir, vivre entre deux langues : ce module parle des décisions qui marquent toute une vie, et du regard que l’on porte sur elles après coup.')}

FRAGEN ZUM EINSTIEG
• ${aide('Welche Entscheidung hat Ihren Lebensweg besonders geprägt?', 'Quelle décision a particulièrement marqué votre parcours ?')}
• ${aide('Gibt es etwas, das Sie heute anders machen würden? Was hätten Sie damals gebraucht?', 'Y a-t-il quelque chose que vous feriez autrement aujourd’hui ? De quoi auriez-vous eu besoin à l’époque ?')}
• ${aide('Welche Sprachen gehören zu Ihrem Leben, und in welchen Situationen benutzen Sie sie?', 'Quelles langues font partie de votre vie, et dans quelles situations les utilisez-vous ?')}
${aide('Antworten Sie in Gedanken auf Deutsch, jeweils in drei oder vier Sätzen.', 'Répondez mentalement en allemand, en trois ou quatre phrases à chaque fois.')}

ZIELE
• ${aide('Ich kann einen längeren Artikel über Lebenswege verstehen und die Haltung der Autorin erkennen.', 'Je peux comprendre un long article sur des parcours de vie et reconnaître la position de l’autrice.')}
• ${aide('Ich kann einem Radiogespräch über Mehrsprachigkeit folgen und dabei Notizen machen.', 'Je peux suivre une émission de radio sur le plurilinguisme en prenant des notes.')}
• ${aide('Ich kann über verpasste Chancen und Bedauern sprechen: „Ich hätte früher … sollen.“', 'Je peux parler d’occasions manquées et de regrets : « j’aurais dû … plus tôt ».')}
• ${aide('Ich kann Vermutungen über die Vergangenheit äußern: „Sie muss sehr mutig gewesen sein.“', 'Je peux faire des suppositions sur le passé : « elle a dû être très courageuse ».')}

WICHTIGE WÖRTER
• der Lebensweg — der Weg, den ein Mensch im Laufe seines Lebens geht
• auswandern — das eigene Land verlassen, um woanders zu leben
• die Herkunft — das Land oder die Familie, aus der man kommt
• mehrsprachig aufwachsen — als Kind mit mehreren Sprachen groß werden
• etwas bereuen — sich wünschen, man hätte etwas nicht getan
• Fuß fassen — sich an einem neuen Ort ein Leben aufbauen
• der Wendepunkt — ein Moment, nach dem sich vieles ändert
• im Nachhinein — später, wenn man zurückblickt` } },

    // 2 · Lecture longue : reportage et point de vue de l'autrice
    { id: 'b2-lebenswege-lesen', kind: 'exercise', title: 'Verstehen: Lebensgeschichten im Erzählcafé', estimatedMinutes: 22,
      competences: ['lecture'],
      lesson: { description: `${C2.lesen}

STRATEGIE
1. ${aide('Global: Lesen Sie Titel, Vorspann und letzten Absatz. Worum geht es, und wie sieht die Autorin das Thema?', 'Lecture globale : lisez le titre, le chapeau et le dernier paragraphe. De quoi s’agit-il, et quel regard l’autrice porte-t-elle sur le sujet ?')}
2. ${aide('Selektiv: Jede Person hat einen eigenen Absatz. Suchen Sie zu jeder Aufgabe zuerst den passenden Absatz.', 'Lecture sélective : chaque personne a son paragraphe. Pour chaque question, cherchez d’abord le bon paragraphe.')}
3. ${aide('Detailliert: Achten Sie auf Wörter wie „eigentlich“, „erst“ und „dabei“ und auf den Konjunktiv. Er zeigt, was nicht passiert ist.', 'Lecture détaillée : soyez attentif à « eigentlich », « erst », « dabei » et au Konjunktiv, qui signale ce qui n’a pas eu lieu.')}

„WAS WÄRE GEWESEN, WENN …?“
[fr?] Article de magazine : « Et si… ? »
Lebensgeschichten im Erzählcafé · Von Johanna Tiedemann
Einmal im Monat erzählen Menschen in einer Bremer Stadtteilbibliothek, wie sie nach Deutschland gekommen sind. Dabei geht es erstaunlich oft um die Wege, die sie nicht gegangen sind.
(A) ${ARTIKEL_A} „Ich hatte erwartet, dass die Leute vor allem von ihrer Ankunft erzählen würden“, sagt Brandstätter. „Aber mindestens genauso oft sprechen sie über die andere Möglichkeit: über das Leben, das sie gehabt hätten, wenn sie geblieben wären.“
(B) Giuseppe Russo ist 81 Jahre alt. Er kam 1964 aus Apulien nach Bremen, um auf einer Werft zu arbeiten. Eigentlich wollte er nur zwei Jahre bleiben, Geld sparen und dann in seinem Dorf ein kleines Geschäft eröffnen. „Hätte mir damals jemand gesagt, dass ich hier alt werde, hätte ich ihn ausgelacht“, sagt er. Dann lernte er seine Frau kennen, eine Bremerin, die Kinder kamen, und aus zwei Jahren wurden sechzig. Ob er etwas bereut? Russo überlegt lange. „Ich hätte früher richtig Deutsch lernen sollen. Auf der Werft brauchte man nicht viele Wörter. Als sie 1983 schloss, hätte ich eine Umschulung machen können, aber mein Deutsch reichte nicht für die Prüfung.“ Heute spricht er fließend, mit unverkennbarem Akzent, wie er lachend betont.
(C) Für Nesrin Yalçın, 54, begann die Geschichte nicht mit einer eigenen Entscheidung. Sie war sechs, als ihre Eltern mit ihr aus Izmir nach Bremen zogen. Schon mit zehn begleitete sie ihre Mutter zum Arzt und zu Behörden, um zu übersetzen. „Ich muss damals sehr erwachsen gewirkt haben“, sagt sie. „Dabei hatte ich oft Angst, etwas Falsches zu sagen.“ Lange hat sie ihren Eltern übel genommen, dass sie so früh so viel Verantwortung tragen musste. Heute sieht sie das differenzierter: „Ohne diese Erfahrung wäre ich wahrscheinlich nicht Dolmetscherin geworden.“ Und sie fügt hinzu: „Ich bin froh, beide Sprachen nie aufgegeben zu haben, auch wenn ich Türkisch mit fünfzehn furchtbar uncool fand.“
(D) Tomasz Wierzbicki, 38, ist der Jüngste in der Runde. Der Softwareentwickler kam 2012 aus Wrocław, angeworben von einer Firma, in der ohnehin Englisch gesprochen wurde. „Ich dachte, Deutsch bräuchte ich nicht“, erzählt er. Acht Jahre lang lebte er so: beruflich erfolgreich, privat ziemlich allein. „Ich hätte mich viel früher um die Sprache kümmern müssen. Die Kollegen waren nett, aber nach Feierabend gingen sie in ihre Welt und ich in meine.“ Erst als er Vater wurde und in der Kita kaum etwas verstand, meldete er sich zu einem Kurs an. Seine Bilanz klingt nüchtern: „Karriere gemacht habe ich hier schnell. Angekommen bin ich erst viel später.“
(E) Ist das nicht ein bisschen traurig, dieses ständige „hätte, wäre, könnte“? Brandstätter schüttelt den Kopf. Für sie ist der Blick auf verpasste Möglichkeiten kein Zeichen von Reue, sondern ein Werkzeug: „Wer erzählt, was hätte sein können, erklärt eigentlich, warum er geworden ist, wer er ist.“ Ich teile diese Sicht nur zum Teil. An manchen Abenden ist die Trauer über verlorene Jahre deutlich zu spüren, und man sollte sie nicht vorschnell schönreden. Aber eines habe ich in diesem Raum gelernt: Wer seine Entscheidungen erklären kann, muss sie nicht mehr verteidigen. Vielleicht beginnt genau dort das Ankommen.` },
      placements: [{ media: 'b2-lebenswege-lesen-artikel', caption: 'Artikel aus dem Stadtmagazin' }],
      questions: [
        choice('q1', aide('Worum geht es in dem Artikel vor allem?', 'De quoi l’article parle-t-il surtout ?'),
          [['um eine Studie, nach der die meisten Zugewanderten ihre Entscheidung bereuen'],
            ['um die Geschichte einer Bremer Werft und ihrer ausländischen Arbeiter'],
            ['um Tipps, wie man sich nach einem Umzug schneller in einer Stadt einlebt'],
            ['um Menschen, die ihren Lebensweg erzählen und dabei an andere Möglichkeiten denken', true]],
          aide('Vorspann und Absatz A nennen das Thema: Im Erzählcafé erzählen Zugewanderte ihren Weg, und „mindestens genauso oft“ sprechen sie über das Leben, das sie „gehabt hätten“. Eine Studie wird nicht erwähnt, die Werft ist nur ein Detail aus Absatz B, und Tipps gibt der Text nicht.',
            'Le chapeau et le paragraphe A posent le thème : des immigrés racontent leur parcours et aussi la vie qu’ils « auraient eue ». Aucune étude n’est citée ; le chantier naval n’est qu’un détail du paragraphe B ; le texte ne donne pas de conseils.')),
        choice('q2', aide('Wie steht die Autorin zu Theda Brandstätters Sicht (Absatz E)?', 'Quelle position l’autrice prend-elle face au point de vue d’Theda Brandstätter (paragraphe E) ?'),
          [['Sie lehnt sie ab, weil die Erzählungen vor allem Reue zeigen.'],
            ['Sie teilt sie nur teilweise, denn oft ist auch Trauer zu spüren.', true],
            ['Sie übernimmt sie ganz und stützt sie mit eigenen Zahlen.'],
            ['Sie äußert keine eigene Meinung, sondern berichtet nur.']],
          aide('„Ich teile diese Sicht nur zum Teil“: Die Autorin stimmt Brandstätter teilweise zu, erinnert aber an die „Trauer über verlorene Jahre“. Sie lehnt die Sicht also nicht ab, und sie spricht in der ersten Person („Ich teile“, „habe ich gelernt“): Sie äußert durchaus eine Meinung.',
            '« Ich teile diese Sicht nur zum Teil » : l’autrice est d’accord en partie, mais rappelle la tristesse des années perdues. Elle ne rejette donc pas ce point de vue, et elle parle à la première personne : elle donne bien son avis.')),
        rf('q3', 'Im Erzählcafé dürfen die Zuhörer jederzeit Fragen stellen.', 'f',
          aide('Falsch: „Wer spricht, wird nicht unterbrochen, Fragen sind erst am Ende erlaubt.“ „Erst am Ende“ heißt: nicht früher, nur zum Schluss.',
            'Faux : les questions ne sont permises qu’à la fin (« erst am Ende ») ; on n’interrompt pas la personne qui parle.')),
        rf('q4', 'Giuseppe Russo wollte ursprünglich nach einiger Zeit wieder nach Italien zurückgehen.', 'r',
          aide('Richtig: „Eigentlich wollte er nur zwei Jahre bleiben, Geld sparen und dann in seinem Dorf ein kleines Geschäft eröffnen.“ „Eigentlich“ zeigt hier den ursprünglichen Plan, der dann nicht verwirklicht wurde.',
            'Vrai : il voulait rester deux ans puis ouvrir un commerce dans son village. « Eigentlich » signale ici le projet initial, qui ne s’est pas réalisé.')),
        choice('q5', aide('Was lässt sich über Nesrin Yalçıns heutige Sicht auf ihre Kindheit sagen?', 'Que peut-on dire de la façon dont Nesrin Yalçın voit aujourd’hui son enfance ?'),
          [['Sie wirft ihren Eltern bis heute vor, dass sie für sie übersetzen musste.'],
            ['Sie hat vergessen, wie unsicher sie sich als Kind beim Übersetzen fühlte.'],
            ['Sie sieht die schwierige Zeit heute auch als Grundlage für ihren Beruf.', true],
            ['Sie bedauert, dass sie als Jugendliche kein Türkisch mehr gesprochen hat.']],
          aide('„Lange hat sie ihren Eltern übel genommen …“ – lange, also nicht mehr heute. „Heute sieht sie das differenzierter: Ohne diese Erfahrung wäre ich wahrscheinlich nicht Dolmetscherin geworden.“ Ihre Unsicherheit erwähnt sie selbst („Dabei hatte ich oft Angst“), und Türkisch hat sie „nie aufgegeben“.',
            'Elle en a longtemps voulu à ses parents, mais aujourd’hui elle nuance : sans cette expérience, elle ne serait pas devenue interprète. Elle se souvient de sa peur et n’a jamais abandonné le turc.')),
        rf('q6', 'Theda Brandstätter hat selbst eine Migrationsgeschichte.', 'n',
          aide('Steht nicht im Text: Wir erfahren nur, dass sie Historikerin ist und das Erzählcafé seit vier Jahren organisiert. Über ihre eigene Herkunft sagt der Artikel nichts. Schließen Sie nichts aus dem Kontext: Nur was im Text steht, zählt.',
            'Non mentionné : on sait seulement qu’elle est historienne et qu’elle organise le café-récit. Le texte ne dit rien de ses origines ; ne déduisez rien du contexte.')),
        match('q7', aide('Welche Überschrift passt zu welchem Absatz? Ordnen Sie zu.', 'Quel intertitre convient à quel paragraphe ? Associez.'),
          [['Absatz A', 'Ein Abend mit klaren Regeln'], ['Absatz B', 'Aus zwei Jahren wurde ein Leben'], ['Absatz C', 'Zu früh erwachsen'],
            ['Absatz D', 'Erfolgreich, aber nicht angekommen'], ['Absatz E', 'Erzählen als Werkzeug']],
          aide('A beschreibt den Ort und die Regeln des Erzählcafés. B: Russo wollte zwei Jahre bleiben, es wurden sechzig. C: Yalçın übersetzte schon als Kind für ihre Mutter. D: Wierzbicki machte schnell Karriere, kam aber erst spät an. E: Brandstätter sieht den Blick zurück als „Werkzeug“.',
            'A : le lieu et ses règles ; B : deux ans devenus une vie ; C : une enfant qui traduisait pour sa mère ; D : la carrière sans l’intégration ; E : raconter comme outil, selon Brandstätter.')),
        fill('q8', aide('Welches Wort aus dem Text passt? Ergänzen Sie.', 'Quel mot du texte convient ? Complétez.'),
          'Absatz C: Als Kind übersetzte Nesrin Yalçın für ihre Mutter beim Arzt und bei [[1]]. · Absatz D: „… und ich in meine“ heißt: Tomasz ging nach Feierabend in [[2]] eigene Welt. · Absatz E: Für Brandstätter ist der Blick zurück kein Zeichen von Reue, sondern ein [[3]].',
          [['Behörden', 'den Behörden'], ['seine'], ['Werkzeug']],
          aide('„zum Arzt und zu Behörden“: bei Behörden (Ämtern). „in meine“ steht für „in meine Welt“; aus der Sicht des Erzählers wird daraus „seine“. Absatz E: „kein Zeichen von Reue, sondern ein Werkzeug“ – „kein …, sondern …“ stellt zwei Begriffe gegenüber.',
            'Behörden : les administrations. « in meine » reprend « in meine Welt » : à la troisième personne, « seine ». « kein …, sondern … » oppose deux termes : pas un signe de regret, mais un outil.')),
      ] },

    // 3 · Écoute longue avec prise de notes
    { id: 'b2-lebenswege-hoeren', kind: 'exercise', title: 'Verstehen: ein Radiogespräch über Mehrsprachigkeit', estimatedMinutes: 22,
      competences: ['ecoute'],
      lesson: { description: `${C2.hoeren}

SITUATION
${aide('In der Radiosendung „Alltag und Wissen“ spricht Jens Petersen mit der Sprachwissenschaftlerin Annika Brodersen über Kinder, die mit mehreren Sprachen aufwachsen. Eine Hörerin ruft an.', 'Dans l’émission « Alltag und Wissen », Jens Petersen s’entretient avec la linguiste Annika Brodersen sur les enfants qui grandissent avec plusieurs langues. Une auditrice appelle.')}

STRATEGIE
1. ${aide('Erstes Hören: Achten Sie nur auf die Struktur. Welche Fragen stellt der Moderator, wer ruft an?', 'Première écoute : repérez seulement la structure. Quelles questions pose l’animateur, qui appelle ?')}
2. ${aide('Lesen Sie dann die Notizen. Überlegen Sie, was fehlt: eine Zahl, ein Ort, ein Nomen?', 'Lisez ensuite les notes et demandez-vous ce qui manque : un nombre, un lieu, un nom ?')}
3. ${aide('Zweites Hören: Ergänzen Sie nur Stichwörter. Meinungen erkennen Sie an Formulierungen wie „Mein Rat lautet …“ oder „Ich wünsche mir …“.', 'Deuxième écoute : notez seulement des mots-clés. Les opinions s’annoncent par « Mein Rat lautet … » ou « Ich wünsche mir … ».')}` },
      placements: [{ media: 'b2-lebenswege-hoeren-audio', caption: 'Radiosendung „Alltag und Wissen“' }],
      questions: [
        fill('q1', C2.notizen,
          'Thema: mehrsprachig aufwachsen · in manchen Großstädten: fast jedes [[1]] Kind · Sprachen mischen: kein Zeichen von [[2]] · Studie mit [[3]] Familien · Rat: zu Hause die Sprache sprechen, in der man sich [[4]] fühlt · Deutsch kommt über die Kita, die [[5]] und die Freunde',
          [['zweite', '2.'], ['Verwirrung'], ['120', 'hundertzwanzig'], ['zu Hause', 'zuhause', 'daheim', 'wohl'], ['Schule']],
          aide('Der Moderator sagt: „fast jedes zweite Kind“. Frau Brodersen: Das Mischen ist „kein Zeichen von Verwirrung“. Ihre Studie umfasst „hundertzwanzig Familien“. Ihr Rat: die Sprache, „in der Sie sich zu Hause fühlen“. Deutsch lernt das Kind über „die Kita, die Schule und die Freunde“.',
            'Un enfant sur deux dans certaines grandes villes ; mélanger n’est pas un signe de confusion ; 120 familles ; parler la langue dans laquelle on se sent chez soi ; l’allemand vient par la crèche, l’école et les amis.')),
        fill('q2', C2.notizen,
          'Anruferin: Frau Ramírez aus [[1]] · Problem: Der Sohn antwortet seit der Einschulung nur noch auf [[2]] · Fachbegriff: [[3]] Zweisprachigkeit · Was hilft: Situationen, in denen Deutsch nicht [[4]], z. B. Ferien bei den [[5]] · herkunftssprachlicher Unterricht: oft am [[6]]',
          [['Köln'], ['Deutsch'], ['passive', 'passiv'], ['funktioniert'], ['Großeltern'], ['Nachmittag', 'Nachmittag, wenn die Kinder müde sind']],
          aide('Frau Ramírez ruft „aus Köln“ an; ihr Sohn antwortet „nur noch auf Deutsch“. Der Fachbegriff heißt „passive Zweisprachigkeit“: verstehen, aber nicht sprechen. Hilfreich sind „Situationen, in denen Deutsch nicht funktioniert“, etwa „Ferien bei den Großeltern“. Der Unterricht liegt „oft am Nachmittag“.',
            'L’auditrice appelle de Cologne ; son fils ne répond plus qu’en allemand. On parle de bilinguisme passif (comprendre sans parler). Ce qui aide : des situations où l’allemand ne fonctionne pas, comme des vacances chez les grands-parents. Les cours ont souvent lieu l’après-midi.')),
        choice('q3', aide('Wie bewertet Frau Brodersen es, wenn ein Kind Sprachen mischt?', 'Comment Mme Brodersen juge-t-elle le fait qu’un enfant mélange les langues ?'),
          [['als normale Strategie: Das Kind nutzt alle Mittel, die es hat', true], ['als Warnsignal: Das Kind ist mit den Sprachen überfordert'],
            ['als Phase, die die Eltern sofort korrigieren sollten'], ['als Verhalten, das man nur bei kleinen Kindern beobachtet']],
          aide('„Das ist aber kein Zeichen von Verwirrung, im Gegenteil. Das Kind nutzt einfach alle Mittel, die ihm zur Verfügung stehen.“ Die letzte Antwort ist falsch, weil sie ausdrücklich sagt: „Mehrsprachige Erwachsene machen das übrigens ganz genauso.“',
            'Pour elle, ce n’est pas de la confusion : l’enfant utilise tous les moyens dont il dispose. La dernière réponse est fausse : elle précise que les adultes plurilingues font exactement pareil.')),
        choice('q4', aide('Warum hält Frau Brodersen den Rat „Sprechen Sie zu Hause Deutsch“ meistens für falsch?', 'Pourquoi Mme Brodersen juge-t-elle le plus souvent mauvais le conseil « Parlez allemand à la maison » ?'),
          [['Weil die Kinder dann Fehler der Eltern übernehmen und schlechtere Noten bekommen.'],
            ['Weil die Kinder dann die Sprache der Großeltern sofort vergessen.'],
            ['Weil die Schulen von den Eltern die Familiensprache verlangen.'],
            ['Weil in der Familie dann weniger erzählt, gesungen und gestritten wird.', true]],
          aide('„Wenn Eltern eine Sprache sprechen, die sie selbst nicht gut beherrschen, wird die Kommunikation ärmer. Sie erzählen weniger, sie singen weniger, und sie streiten sogar weniger.“ Von Fehlern oder Noten spricht sie nicht; diese naheliegende Begründung ist eine Falle.',
            'Quand les parents parlent une langue qu’ils maîtrisent mal, la communication s’appauvrit : on raconte, chante et se dispute moins. Elle ne parle ni de fautes ni de notes : c’est le piège.')),
        choice('q5', aide('Was rät Frau Brodersen Frau Ramírez, ohne es direkt zu sagen?', 'Que conseille Mme Brodersen à Mme Ramírez, sans le dire directement ?'),
          [['Sie soll ihrem Sohn ab sofort nur noch auf Spanisch antworten.'], ['Sie soll Gelegenheiten schaffen, in denen ihr Sohn Spanisch braucht.', true],
            ['Sie soll ihren Sohn an einer spanischen Schule anmelden.'], ['Sie soll akzeptieren, dass das Spanische verloren ist.']],
          aide('Die Expertin nennt Beispiele, in denen „Deutsch nicht funktioniert“, und schließt: „Kinder lernen eine Sprache nicht, weil sie wichtig ist, sondern weil sie sie brauchen.“ Konsequent auf Spanisch zu antworten, „reicht dafür meistens nicht“. Und das Spanische kommt „oft schon“ zurück.',
            'Elle donne des exemples où l’allemand ne marche pas et conclut que les enfants apprennent une langue parce qu’ils en ont besoin. Répondre en espagnol ne suffit pas ; et la langue revient souvent.')),
        choice('q6', aide('Was kritisiert Frau Brodersen am herkunftssprachlichen Unterricht?', 'Que critique Mme Brodersen à propos des cours de langue d’origine ?'),
          [['Er wird nur für sehr wenige Sprachen angeboten.'], ['Er kostet die Familien zu viel Geld und ist schlecht organisiert.'],
            ['Er ist wenig bekannt und liegt oft zu ungünstigen Zeiten.', true], ['Er findet meistens am Wochenende statt.']],
          aide('Zwei Kritikpunkte: „Leider wissen viele Eltern nicht, dass es dieses Angebot gibt“ und „der Unterricht liegt oft am Nachmittag, wenn die Kinder schon müde sind“. Über Kosten sagt sie nichts, und sie nennt mehrere Sprachen als Beispiele.',
            'Deux critiques : beaucoup de parents ignorent l’offre, et les cours ont lieu l’après-midi, quand les enfants sont fatigués. Rien sur le coût ; plusieurs langues sont citées en exemple.')),
      ] },

    // 4 · Grammaire inductive
    { id: 'b2-lebenswege-entdecken', kind: 'exercise', title: 'Entdecken: Was wäre gewesen, wenn …?', estimatedMinutes: 10,
      competences: ['lecture'],
      lesson: { description: `${aide('Lesen Sie die Sätze aus dem Artikel und aus dem Radiogespräch. Achten Sie auf die Verbformen.', 'Lisez ces phrases de l’article et de l’émission de radio. Observez les formes verbales.')}

SÄTZE
(1) Hätte mir damals jemand gesagt, dass ich hier alt werde, hätte ich ihn ausgelacht.
(2) Ich hätte früher richtig Deutsch lernen sollen.
(3) Ohne diese Erfahrung wäre ich wahrscheinlich nicht Dolmetscherin geworden.
(4) Ich hätte mich viel früher um die Sprache kümmern müssen.
(5) … das Leben, das sie gehabt hätten, wenn sie geblieben wären.
(6) Ich muss damals sehr erwachsen gewirkt haben.
(7) Ich bin froh, beide Sprachen nie aufgegeben zu haben.
(8) Hätten wir etwas anders machen sollen?

${aide('Beantworten Sie dann die Fragen. Die Erklärungen formulieren die Regel.', 'Répondez ensuite aux questions : les explications formulent la règle.')}` },
      questions: [
        choice('q1', aide('Sätze 1, 3 und 5: Wovon sprechen die Personen?', 'Phrases 1, 3 et 5 : de quoi les personnes parlent-elles ?'),
          [['von Plänen, die sie in Zukunft verwirklichen wollen'], ['von Gewohnheiten, die sie früher regelmäßig hatten'],
            ['von Vergangenem, das so nicht passiert ist', true], ['von Ereignissen, die sie wirklich erlebt haben']],
          aide('Niemand hat Russo damals etwas gesagt, Yalçın hat die Erfahrung tatsächlich gemacht, und die Menschen sind nicht geblieben. „Hätte … ausgelacht“, „wäre … geworden“, „gehabt hätten“: Das ist der Konjunktiv II der Vergangenheit. Er beschreibt eine nur gedachte, irreale Vergangenheit.',
            'Ces phrases décrivent un passé imaginé, qui n’a pas eu lieu : c’est le Konjunktiv II passé, l’équivalent du conditionnel passé et du plus-que-parfait dans « si j’avais su ».')),
        match('q2', aide('Wie ist die Form gebildet? Ordnen Sie zu.', 'Comment la forme est-elle construite ? Associez.'),
          [['hätte … ausgelacht (Satz 1)', 'hätte + Partizip II'], ['wäre … geworden (Satz 3)', 'wäre + Partizip II'],
            ['hätte … lernen sollen (Satz 2)', 'hätte + Infinitiv + Modalverb im Infinitiv'], ['gewirkt haben (Satz 6)', 'Partizip II + haben (Infinitiv Perfekt)']],
          aide('„Hätte“ oder „wäre“ richtet sich nach dem Perfekt: Ich habe ihn ausgelacht → hätte ausgelacht; ich bin geworden → wäre geworden. Mit Modalverb stehen zwei Infinitive am Ende („lernen sollen“). „Gewirkt haben“ ist ein Infinitiv Perfekt: Partizip II + „haben“.',
            'hätte ou wäre : le même auxiliaire qu’au parfait. Avec un modal, deux infinitifs en fin de phrase. « gewirkt haben » est un infinitif passé : participe + haben.')),
        choice('q3', aide('Sätze 2 und 4: In welcher Form steht das Modalverb am Satzende?', 'Phrases 2 et 4 : sous quelle forme le verbe de modalité figure-t-il en fin de phrase ?'),
          [['im Infinitiv: sollen, müssen', true], ['als Partizip II: gesollt, gemusst'], ['im Konjunktiv II: sollte, müsste'], ['im Präteritum: sollte, musste']],
          aide('Mit einem zweiten Verb steht das Modalverb im Perfekt und im Konjunktiv II der Vergangenheit im Infinitiv: hätte lernen sollen, hätte kümmern müssen („Ersatzinfinitiv“). „Gesollt“ und „gemusst“ gibt es nur ohne zweites Verb: Ich hätte es gemusst.',
            'Avec un autre verbe, le modal reste à l’infinitif (« double infinitif ») : hätte lernen sollen. Le participe gesollt ou gemusst n’apparaît que si le modal est seul.')),
        choice('q4', aide('Sätze 6 und 7: Was haben „gewirkt haben“ und „aufgegeben zu haben“ gemeinsam?', 'Phrases 6 et 7 : qu’ont en commun « gewirkt haben » et « aufgegeben zu haben » ?'),
          [['Beide beschreiben eine Handlung, die erst in der Zukunft stattfindet.'], ['Beide stehen im Passiv.'],
            ['Beide drücken eine irreale Bedingung aus.'], ['Beide bezeichnen etwas, das vor dem Sprechen liegt.', true]],
          aide('Beide sind Infinitive Perfekt. In Satz 6 drückt „muss … gewirkt haben“ eine Vermutung über die Vergangenheit aus; in Satz 7 steht der Infinitiv Perfekt mit „zu“ nach „froh sein“: Das Aufgeben (oder Nicht-Aufgeben) liegt vor dem Moment, in dem sie spricht.',
            'Ce sont deux infinitifs passés : une supposition sur le passé (« elle a dû paraître ») et un infinitif passé avec zu après « froh sein » (« contente de n’avoir jamais abandonné »). L’action est antérieure au moment où l’on parle.')),
      ] },

    // 5 · Règle
    { id: 'b2-lebenswege-regel', kind: 'lesson', title: 'Regel: Konjunktiv II der Vergangenheit und Infinitiv Perfekt', estimatedMinutes: 10,
      competences: ['lecture'],
      lesson: { description: `REGEL: KONJUNKTIV II DER VERGANGENHEIT
[fr?] Règle : le Konjunktiv II passé
${aide('Mit dem Konjunktiv II der Vergangenheit sprechen Sie über Vergangenes, das nicht wirklich passiert ist: über verpasste Chancen, über Bedauern und über irreale Bedingungen.', 'Le Konjunktiv II passé exprime un passé qui n’a pas eu lieu : occasion manquée, regret, condition irréelle. Il correspond au conditionnel passé (« j’aurais su ») et, après « si », au plus-que-parfait (« si j’avais su »).')}

FORMEN
• ${aide('hätte + Partizip II: Ich hätte ihn ausgelacht.', 'hätte + participe passé : « je me serais moqué de lui ».')}
• ${aide('wäre + Partizip II bei Verben mit Perfekt auf „sein“: Wir wären geblieben.', 'wäre + participe avec les verbes qui forment leur parfait avec sein (bleiben, kommen, werden…).')}
• ${aide('Bedingung mit „wenn“: Wenn ich das gewusst hätte, wäre ich früher gekommen.', 'Condition avec wenn : les deux propositions sont au Konjunktiv II passé.')}
• ${aide('Bedingung ohne „wenn“: Das Verb steht vorn. Hätte ich das gewusst, wäre ich früher gekommen.', 'Sans wenn, le verbe conjugué ouvre la proposition.')}
• ${aide('Irrealer Wunsch: Hätte ich nur früher Deutsch gelernt! Wenn ich doch geblieben wäre!', 'Souhait irréel : « si seulement j’avais appris l’allemand plus tôt ! »')}
• ${aide('„Ohne“ + Nomen statt einer Bedingung: Ohne diese Erfahrung wäre ich nicht Dolmetscherin geworden.', 'Ohne + nom remplace une condition : « sans cette expérience, je ne serais pas devenue interprète ».')}

MIT MODALVERB
[fr?] Avec un verbe de modalité
• ${aide('Hauptsatz: hätte + Infinitiv + Modalverb im Infinitiv. Ich hätte früher Deutsch lernen sollen.', 'Principale : hätte + infinitif + modal à l’infinitif (« double infinitif ») : « j’aurais dû apprendre ».')}
• ${aide('Nebensatz: „hätte“ steht vor den beiden Infinitiven. …, dass ich mich früher hätte kümmern müssen.', 'Subordonnée : hätte se place devant les deux infinitifs, et non à la toute fin.')}
• ${aide('hätte … sollen: Bedauern oder Kritik · hätte … müssen: Notwendigkeit · hätte … können: verpasste Möglichkeit.', 'hätte … sollen : regret ou reproche ; hätte … müssen : nécessité ; hätte … können : possibilité manquée.')}

REGEL: INFINITIV PERFEKT
[fr?] Règle : l’infinitif passé
${aide('Der Infinitiv Perfekt besteht aus dem Partizip II und „haben“ oder „sein“: gewirkt haben, gekommen sein. Er bezeichnet etwas, das vor einem anderen Zeitpunkt liegt.', 'L’infinitif passé (participe + haben ou sein) exprime une action antérieure : « avoir paru », « être venu ».')}
• ${aide('Vermutung über die Vergangenheit: Sie muss sehr mutig gewesen sein. Er kann den Termin vergessen haben.', 'Supposition sur le passé : muss = quasi certain (« elle a dû être »), kann = possible (« il a pu oublier »).')}
• ${aide('Mit „zu“ nach froh sein, bereuen, sich erinnern, behaupten: Ich bin froh, das gewagt zu haben.', 'Avec zu après ces verbes et adjectifs, quand le sujet est le même : « je suis contente d’avoir osé ».')}

ACHTUNG
[fr?] Attention : les pièges des francophones
• ${aide('„Ich würde das gemacht haben“ ist schwerfällig und selten. Natürlich ist: Ich hätte das gemacht.', '« J’aurais fait » se dit hätte … gemacht ; würde … gemacht haben est lourd et rare.')}
• ${aide('Nicht „Ich hätte gemusst“, sondern mit Vollverb: Ich hätte gehen müssen.', 'Avec un autre verbe, jamais gemusst ni gesollt : le modal reste à l’infinitif.')}
• ${aide('„hätte“ oder „wäre“? Wie im Perfekt: Ich bin geblieben → Ich wäre geblieben.', 'Même auxiliaire qu’au parfait : bin geblieben → wäre geblieben.')}
• ${aide('Vermutung oder Kritik? Er muss es vergessen haben (Vermutung) ≠ Er hätte es nicht vergessen dürfen (Kritik).', '« Il a dû l’oublier » (supposition) ≠ « il n’aurait pas dû l’oublier » (reproche) : le français dit « dû » dans les deux cas, pas l’allemand.')}` } },

    // 6 · Grammaire : s'entraîner
    { id: 'b2-lebenswege-grammatik', kind: 'exercise', title: 'Üben: Konjunktiv II der Vergangenheit und Infinitiv Perfekt', estimatedMinutes: 14,
      competences: ['lecture', 'expression-ecrite'],
      lesson: { description: `${aide('Üben Sie die Formen. Lesen Sie jede Erklärung, auch wenn Ihre Antwort richtig ist.', 'Entraînez-vous aux formes. Lisez chaque explication, même si votre réponse est juste.')}

MERKE
• hätte / wäre + Partizip II · hätte + Infinitiv + Modalverb im Infinitiv
• Partizip II + haben / sein (Infinitiv Perfekt): muss … gewesen sein · froh, … zu haben` },
      questions: [
        fill('q1', aide('Ergänzen Sie „hätte“ oder „wäre“ in der richtigen Form.', 'Complétez avec « hätte » ou « wäre » à la bonne forme.'),
          'Wenn wir mehr Zeit gehabt [[1]], [[2]] wir länger geblieben. · Wenn du mich gefragt [[3]], [[4]] ich dir geholfen.',
          [['hätten'], ['wären'], ['hättest'], ['hätte']],
          aide('„Bleiben“ bildet das Perfekt mit „sein“ (wir sind geblieben) → „wären geblieben“. „Haben“, „fragen“ und „helfen“ bilden es mit „haben“ → hätten, hättest, hätte. Die Endungen sind die des Präteritums: wir hätten/wären, du hättest, ich hätte.',
            'bleiben fait son parfait avec sein, d’où wären ; haben, fragen et helfen avec haben, d’où hätten, hättest, hätte. Terminaisons du prétérit.')),
        fill('q2', aide('„Ohne“ statt „wenn“: Ergänzen Sie „hätte“ oder „wäre“.', '« Ohne » à la place de « wenn » : complétez avec « hätte » ou « wäre ».'),
          'Ohne meine Tante [[1]] ich nie nach Bremen gekommen. · Ohne den Kurs [[2]] er die Prüfung nicht bestanden. · Ohne die Nachbarn [[3]] wir uns nicht so schnell eingelebt.',
          [['wäre'], ['hätte'], ['hätten']],
          aide('„Ohne“ + Nomen ersetzt eine Bedingung („Wenn meine Tante nicht gewesen wäre, …“). Danach folgt direkt das Verb: wäre gekommen (Perfekt mit „sein“), hätte bestanden, hätten uns eingelebt (reflexive Verben bilden das Perfekt mit „haben“).',
            'Ohne + nom remplace une condition ; le verbe suit directement. kommen → wäre ; bestehen → hätte ; les verbes pronominaux se construisent avec haben : hätten uns eingelebt.')),
        order('q3', C2.ordnen,
          [['Hätte', 'ich', 'den Antrag', 'früher', 'gestellt,', 'hätte', 'ich', 'nicht so lange', 'warten müssen.'],
            ['Hätte', 'ich', 'früher', 'den Antrag', 'gestellt,', 'hätte', 'ich', 'nicht so lange', 'warten müssen.']],
          aide('Bedingung ohne „wenn“: Das konjugierte Verb „Hätte“ steht am Anfang, das Partizip „gestellt“ am Ende des Nebensatzes. Der Hauptsatz beginnt dann direkt mit „hätte“; am Ende stehen die zwei Infinitive „warten müssen“.',
            'Condition sans wenn : le verbe conjugué ouvre la subordonnée. La principale commence ensuite par hätte et se termine par le double infinitif warten müssen.')),
        order('q4', C2.ordnen,
          [['Er sagt,', 'dass', 'er', 'sich', 'früher', 'um die Sprache', 'hätte', 'kümmern', 'müssen.'],
            ['Er sagt,', 'dass', 'er', 'sich', 'um die Sprache', 'früher', 'hätte', 'kümmern', 'müssen.']],
          aide('Im Nebensatz mit zwei Infinitiven steht „hätte“ nicht am Ende, sondern direkt vor den Infinitiven: …, dass er sich früher um die Sprache hätte kümmern müssen. Das ist eine wichtige Ausnahme von der Regel „Verb am Ende“.',
            'Dans une subordonnée avec double infinitif, hätte se place juste avant les deux infinitifs, et non en dernière position : exception importante à la règle du verbe final.')),
        choice('q5', aide('Welcher Satz ist richtig?', 'Quelle phrase est correcte ?'),
          [['Ich hätte früher Deutsch gelernt sollen.'], ['Ich hätte früher Deutsch lernen sollen.', true],
            ['Ich hätte früher Deutsch lernen gesollt.'], ['Ich würde früher Deutsch lernen sollen haben.']],
          aide('Mit Modalverb: hätte + Infinitiv des Vollverbs + Infinitiv des Modalverbs („lernen sollen“). „Gelernt sollen“ mischt Partizip und Infinitiv, „gesollt“ ist mit einem zweiten Verb falsch, und die Form mit „würde“ gibt es nicht.',
            'hätte + infinitif + infinitif du modal. « gelernt sollen » et « lernen gesollt » sont fautifs ; la construction avec würde n’existe pas.')),
        hints(fill('q6', aide('Ergänzen Sie den Infinitiv Perfekt mit „zu“.', 'Complétez avec l’infinitif passé précédé de « zu ».'),
          'Ich bin froh, diesen Schritt gewagt [[1]]. · Sie bereut, nicht früher zurückgekommen [[2]]. · Er erinnert sich, als Kind oft für seine Eltern übersetzt [[3]].',
          [['zu haben'], ['zu sein'], ['zu haben']],
          aide('Nach „froh sein“, „bereuen“ und „sich erinnern“ folgt bei gleichem Subjekt ein Infinitiv mit „zu“. Liegt die Handlung davor, steht der Infinitiv Perfekt: gewagt zu haben, zurückgekommen zu sein (Perfekt mit „sein“), übersetzt zu haben.',
            'Même sujet : infinitif avec zu. L’action étant antérieure, on emploie l’infinitif passé : zu haben, ou zu sein pour les verbes de mouvement comme zurückkommen.')),
        'haben', 'sein', 'haben'),
        choice('q7', aide('Ein Kollege ist nicht zur Besprechung gekommen. Sie vermuten, dass er den Termin vergessen hat. Was sagen Sie?', 'Un collègue n’est pas venu à la réunion. Vous supposez qu’il a oublié le rendez-vous. Que dites-vous ?'),
          [['Er muss den Termin vergessen haben.', true], ['Er muss den Termin vergessen sein.'], ['Er hätte den Termin vergessen müssen.'], ['Er muss den Termin vergessen hat.']],
          aide('Vermutung über die Vergangenheit: „muss“ + Infinitiv Perfekt („vergessen haben“, Perfekt mit „haben“). „Er hätte den Termin vergessen müssen“ hieße: Es wäre notwendig gewesen, ihn zu vergessen – ein ganz anderer Sinn.',
            'Supposition : muss + infinitif passé (vergessen haben). « Er hätte … vergessen müssen » voudrait dire qu’il aurait été obligé d’oublier : rien à voir.')),
        match('q8', aide('Welche Reaktion passt zu welcher Situation? Ordnen Sie zu.', 'Quelle réaction convient à quelle situation ? Associez.'),
          [['Du hast nicht gelernt und die Prüfung nicht bestanden.', 'Ich hätte mehr lernen sollen.'],
            ['Du hast den letzten Zug knapp verpasst.', 'Wäre ich nur früher losgegangen!'],
            ['Deine Freundin kommt völlig erschöpft von einer Reise zurück.', 'Die Reise muss anstrengend gewesen sein.'],
            ['Du hast eine neue Stelle angenommen und bist sehr zufrieden.', 'Ich bin froh, die Stelle angenommen zu haben.']],
          aide('Bedauern über eigenes Verhalten: hätte … sollen. Irrealer Wunsch: Wäre ich nur …! Vermutung über die Erfahrung einer anderen Person: muss … gewesen sein. Zufriedenheit mit einer vergangenen Entscheidung: froh, … zu haben.',
            'Regret : hätte … sollen ; souhait irréel : Wäre ich nur … ! ; supposition : muss … gewesen sein ; satisfaction : froh, … zu haben.')),
        fill('q9', aide('Formulieren Sie die Sätze als irreale Bedingung.', 'Reformulez ces phrases sous forme de condition irréelle.'),
          'Ich habe nicht gewusst, dass der Kurs bald voll ist. Deshalb habe ich mich zu spät angemeldet. → Wenn ich das [[1]] hätte, [[2]] ich mich früher [[3]].',
          [['gewusst'], ['hätte'], ['angemeldet']],
          aide('Die Wirklichkeit (nicht gewusst, zu spät angemeldet) wird umgekehrt: Wenn ich das gewusst hätte, hätte ich mich früher angemeldet. Beide Teile stehen im Konjunktiv II der Vergangenheit; „sich anmelden“ bildet das Perfekt mit „haben“.',
            'On inverse la réalité : « si je l’avais su, je me serais inscrit plus tôt ». En allemand, s’inscrire (sich anmelden) se construit avec haben : hätte … angemeldet.')),
        choice('q10', aide('Welcher Nebensatz ist richtig? „Mir ist klar, …“', 'Quelle subordonnée est correcte ? « Je me rends compte… »'),
          [['…, dass ich früher anrufen sollen hätte.'], ['…, dass ich früher hätte angerufen sollen.'],
            ['…, dass ich früher hätte anrufen sollen.', true], ['…, dass ich früher anrufen gesollt hätte.']],
          aide('Im Nebensatz steht „hätte“ vor den beiden Infinitiven: früher hätte anrufen sollen. In der ersten Antwort steht „hätte“ am Ende, in der zweiten steht ein Partizip statt eines Infinitivs, und „gesollt“ ist mit einem zweiten Verb falsch.',
            'Dans la subordonnée, hätte précède le double infinitif. Les autres réponses placent hätte à la fin, mettent un participe ou emploient gesollt avec un autre verbe.')),
      ] },

    // 7 · Lexique
    { id: 'b2-lebenswege-wortschatz', kind: 'exercise', title: 'Wortschatz: über Lebenswege sprechen', estimatedMinutes: 12,
      competences: ['lecture', 'expression-ecrite'],
      lesson: { description: `${aide('Lernen Sie die Wörter in festen Verbindungen und in Wortfamilien.', 'Apprenez les mots dans des expressions figées et des familles de mots.')}

TIPP
${aide('Viele Ausdrücke lassen sich nicht wörtlich übersetzen: Auf Französisch „prend“ man Fuß, auf Deutsch „fasst“ man ihn. Lernen Sie deshalb immer Nomen und Verb zusammen.', 'Beaucoup d’expressions ne se traduisent pas mot à mot : on « prend » pied en français, on le « saisit » (fassen) en allemand. Apprenez toujours le nom avec son verbe.')}` },
      questions: [
        match('q1', aide('Welches Verb passt? Ordnen Sie zu.', 'Quel verbe convient ? Associez.'),
          [['Fuß', 'fassen'], ['den Schritt', 'wagen'], ['einen Antrag', 'stellen'], ['Erfahrungen', 'sammeln'], ['Abschied', 'nehmen']],
          aide('Fuß fassen (sich etablieren), den Schritt wagen (sich etwas trauen), einen Antrag stellen (offiziell um etwas bitten), Erfahrungen sammeln, Abschied nehmen. Diese Verbindungen lernt man am besten als Einheit.',
            'Fuß fassen : prendre pied ; den Schritt wagen : oser franchir le pas ; einen Antrag stellen : déposer une demande ; Erfahrungen sammeln : acquérir de l’expérience ; Abschied nehmen : faire ses adieux.')),
        fill('q2', aide('Bilden Sie das Nomen.', 'Formez le nom.'),
          'auswandern → die [[1]] · mehrsprachig → die [[2]] · zugehörig → die [[3]] · herkommen → die [[4]]',
          [['Auswanderung'], ['Mehrsprachigkeit'], ['Zugehörigkeit'], ['Herkunft']],
          aide('Verb + „-ung“: die Auswanderung. Adjektive auf „-ig“ + „-keit“: die Mehrsprachigkeit, die Zugehörigkeit. „Herkommen“ hat ein unregelmäßiges Nomen: die Herkunft (wie ankommen → die Ankunft). Alle diese Nomen sind feminin.',
            'Verbe + -ung ; adjectif en -ig + -keit ; herkommen donne die Herkunft, comme ankommen → die Ankunft. Tous ces noms sont féminins.')),
        choice('q3', aide('Sie blicken in einem Vortrag auf eine Entscheidung zurück. Welche Formulierung passt?', 'Dans un exposé, vous revenez sur une décision passée. Quelle formulation convient ?'),
          [['Voraussichtlich war das die richtige Entscheidung.'], ['Vorübergehend war das die richtige Entscheidung.'],
            ['Andererseits war das die richtige Entscheidung.'], ['Rückblickend war das die richtige Entscheidung.', true]],
          aide('„Rückblickend“ (oder „im Nachhinein“) leitet eine Bewertung aus heutiger Sicht ein. „Voraussichtlich“ blickt in die Zukunft, „vorübergehend“ bedeutet „nur für kurze Zeit“, und „andererseits“ leitet einen Gegensatz ein.',
            'Rückblickend : avec le recul. Voraussichtlich (vraisemblablement) regarde vers l’avenir, vorübergehend signifie « provisoirement », andererseits introduit une opposition.')),
        choice('q4', aide('Welches Verb passt? „Ich ___ es nicht, ausgewandert zu sein. Es war die beste Entscheidung meines Lebens.“', 'Quel verbe convient ?'),
          [['bereue', true], ['beschwere'], ['verzichte'], ['erinnere']],
          aide('„etwas bereuen“: sich wünschen, man hätte es nicht getan. Hier verneint: Die Person ist zufrieden. „Sich beschweren“ und „sich erinnern“ sind reflexiv und brauchen eine Präposition (über, an); „verzichten“ braucht „auf“.',
            'bereuen : regretter. Les autres verbes exigent un pronom réfléchi ou une préposition : sich beschweren über, sich erinnern an, verzichten auf.')),
        match('q5', aide('Was bedeuten die Ausdrücke? Ordnen Sie zu.', 'Que signifient ces expressions ? Associez.'),
          [['ins kalte Wasser springen', 'etwas Neues ohne lange Vorbereitung beginnen'], ['Heimweh haben', 'sich nach dem Ort sehnen, aus dem man kommt'],
            ['sich einleben', 'sich an eine neue Umgebung gewöhnen'], ['jemandem etwas übel nehmen', 'jemandem wegen etwas böse sein']],
          aide('Wer „ins kalte Wasser springt“, beginnt etwas, ohne sich lange vorzubereiten. „Übel nehmen“ steht im Artikel (Absatz C). Heimweh ist die Sehnsucht nach der Heimat; „sich einleben“ beschreibt das langsame Ankommen in einer neuen Umgebung.',
            'Sauter dans le grand bain ; avoir le mal du pays ; s’acclimater ; en vouloir à quelqu’un.')),
        fill('q6', aide('Ergänzen Sie die Präpositionen.', 'Complétez avec les prépositions.'),
          'Sie hat sich schnell [[1]] das Leben in Bremen gewöhnt. · Er hat sich zu spät [[2]] die Sprache gekümmert. · Viele Gäste erinnern sich gern [[3]] ihre Ankunft.',
          [['an'], ['um'], ['an']],
          aide('Sich gewöhnen an + Akkusativ, sich kümmern um + Akkusativ, sich erinnern an + Akkusativ. Die Präpositionen der Muttersprache helfen hier nicht weiter: Lernen Sie Verb und Präposition immer zusammen.',
            'S’habituer à (sich gewöhnen an), s’occuper de (sich kümmern um), se souvenir de (sich erinnern an), tous suivis de l’accusatif. Le français ne donne pas la bonne préposition : apprenez le verbe avec elle.')),
        choice('q7', aide('„Er spricht fließend, mit unverkennbarem Akzent.“ Was bedeutet „unverkennbar“?', '« unverkennbar » : que signifie ce mot ?'),
          [['kaum hörbar'], ['deutlich zu erkennen', true], ['schwer zu verstehen'], ['absichtlich übertrieben']],
          aide('„Verkennen“ heißt „falsch einschätzen, nicht erkennen“; „unverkennbar“ ist also etwas, das man nicht verkennen kann: Es ist eindeutig zu erkennen. Russo spricht fließend, aber man hört sofort, woher er kommt.',
            'verkennen : méconnaître ; unverkennbar : qu’on ne peut pas ne pas reconnaître. Russo parle couramment, mais on entend tout de suite son origine.')),
      ] },

    // 8 · Vérifier (l'écoute authentique b2-lebenswege-hoeren2 est insérée avant, par le lot M2)
    { id: 'b2-lebenswege-kontrolle', kind: 'exercise', title: 'Prüfen: eine Einladung ins Erzählcafé', estimatedMinutes: 14,
      competences: ['lecture', 'ecoute'],
      lesson: { description: `${aide('Prüfen Sie, was Sie in diesem Modul gelernt haben: Hören, Grammatik und Wortschatz.', 'Vérifiez ce que vous avez appris dans ce module : écoute, grammaire et vocabulaire.')}

${aide('Theda Brandstätter hat Ihnen nach dem Erzählcafé eine Sprachnachricht geschickt. Hören Sie sie für die Fragen 1 und 2.', 'Theda Brandstätter vous a laissé un message vocal après le café-récit. Écoutez-le pour les questions 1 et 2.')}` },
      placements: [{ media: 'b2-lebenswege-kontrolle-audio', caption: 'Nachricht von Theda Brandstätter' }],
      questions: [
        choice('q1', aide('Warum ruft Frau Brandstätter an?', 'Pourquoi Mme Brandstätter appelle-t-elle ?'),
          [['Sie sagt ein Treffen ab, weil die Bibliothek geschlossen ist.'], ['Sie bedankt sich und lädt zum nächsten Treffen ein.', true],
            ['Sie bittet darum, die eigene Geschichte aufzuschreiben.'], ['Sie fragt, ob man das Treffen im März leiten könnte.']],
          aide('Sie dankt für die erzählte Geschichte und sagt: „Wir hätten Sie gern wieder dabei.“ Das Treffen findet statt, nur an einem anderen Ort. Sie bittet nur darum, vielleicht von den Kindern zu erzählen, nicht zu schreiben oder zu leiten.',
            'Elle remercie et invite à la prochaine séance ; la rencontre n’est pas annulée, elle change seulement de salle.')),
        choice('q2', aide('Warum findet das nächste Treffen im Gemeindesaal statt?', 'Pourquoi la prochaine rencontre a-t-elle lieu dans la salle communale ?'),
          [['Weil beim letzten Mal nicht alle einen Sitzplatz hatten.', true], ['Weil die Bibliothek im März renoviert wird.'],
            ['Weil im Gemeindesaal auch Kinder dabei sein dürfen.'], ['Weil der Saal näher an der Haltestelle liegt.']],
          aide('„… weil beim letzten Mal einige Gäste stehen mussten.“ Wer stehen muss, hat keinen Sitzplatz. Eine Renovierung, Kinder oder eine Haltestelle werden nicht erwähnt.',
            'Certains invités ont dû rester debout la dernière fois : il manquait des places assises.')),
        fill('q3', aide('Ergänzen Sie den Konjunktiv II der Vergangenheit.', 'Complétez au Konjunktiv II passé.'),
          'Ich [[1]] gern zum Treffen gekommen, aber ich war krank. · Wenn du mich angerufen [[2]], [[3]] ich dich abgeholt.',
          [['wäre'], ['hättest'], ['hätte']],
          aide('„Kommen“ bildet das Perfekt mit „sein“ → wäre gekommen. „Anrufen“ und „abholen“ bilden es mit „haben“ → hättest angerufen, hätte abgeholt. Achten Sie auf die Endung „-st“ bei „du“.',
            'kommen → wäre ; anrufen et abholen → hättest, hätte. N’oubliez pas la terminaison -st avec du.')),
        order('q4', C2.ordnen,
          [['Im Nachhinein', 'weiß', 'ich,', 'dass', 'ich', 'früher', 'hätte', 'nachfragen', 'sollen.']],
          aide('„Im Nachhinein“ steht auf Position 1, also folgt direkt das Verb „weiß“. Im Nebensatz mit „dass“ steht „hätte“ vor den beiden Infinitiven „nachfragen sollen“.',
            'Im Nachhinein occupe la première place : le verbe weiß suit immédiatement. Dans la subordonnée, hätte précède le double infinitif.')),
        choice('q5', aide('Herr Russo spricht heute fließend Deutsch. Was vermuten Sie über die letzten Jahre?', 'M. Russo parle aujourd’hui couramment allemand. Que supposez-vous sur les dernières années ?'),
          [['Er hätte in den letzten Jahren viel üben müssen.'], ['Er muss in den letzten Jahren viel geübt hat.'],
            ['Er muss in den letzten Jahren viel geübt haben.', true], ['Er muss in den letzten Jahren viel üben gehabt.']],
          aide('Vermutung über die Vergangenheit: „muss“ + Infinitiv Perfekt („geübt haben“). „Er hätte … üben müssen“ wäre eine Aussage über eine Notwendigkeit, die nicht erfüllt wurde – das Gegenteil der Situation.',
            'Supposition : muss + infinitif passé. « hätte … üben müssen » signifierait qu’il aurait dû s’entraîner sans le faire, le contraire de la situation.')),
        fill('q6', aide('Ergänzen Sie die Wörter aus dem Modul.', 'Complétez avec des mots du module.'),
          'Wer sich in einem neuen Land ein Leben aufbaut, fasst dort [[1]]. · Wer sich nach seiner Heimat sehnt, hat [[2]]. · Wer mit zwei Sprachen groß wird, wächst [[3]] auf.',
          [['Fuß'], ['Heimweh'], ['zweisprachig', 'mehrsprachig']],
          aide('„Fuß fassen“ (sich etablieren), „Heimweh haben“ (Sehnsucht nach der Heimat), „zweisprachig“ oder allgemeiner „mehrsprachig aufwachsen“.',
            'Fuß fassen : s’établir ; Heimweh haben : avoir le mal du pays ; zweisprachig ou mehrsprachig aufwachsen : grandir avec deux (ou plusieurs) langues.')),
        choice('q7', aide('Welches Wort passt? „Ohne die Hilfe meiner Kollegen ___ ich die Prüfung nie bestanden.“', 'Quel mot convient ?'),
          [['wäre'], ['würde'], ['habe'], ['hätte', true]],
          aide('„Ohne“ + Nomen ersetzt eine irreale Bedingung in der Vergangenheit; „bestehen“ bildet das Perfekt mit „haben“ → „hätte … bestanden“. „Würde … bestanden“ und „habe … bestanden“ passen nicht zur irrealen Bedeutung.',
            'Ohne + nom = condition irréelle passée ; bestehen se conjugue avec haben : hätte … bestanden.')),
      ] },
  ],
};
