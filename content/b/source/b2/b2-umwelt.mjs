// Module B2 n° 13 · thème « Umwelt » (lot R7, thème 7). Climat et transition énergétique : un article de fond sur le
// remplacement du chauffage dans une copropriété (point de vue de l'autrice, inférence), un débat radio sur un parc éolien
// citoyen (prise de notes longue, positions des participants). Grammaire : Futur II (action achevée dans le futur et
// supposition sur le passé, Futur I de supposition) ; concession avec auch wenn, selbst wenn, wenngleich, obwohl, et en
// principale trotzdem, dennoch, zwar … aber.
// Le second document (-hoeren2, écoute authentique de 15 min, thème impair) est écrit par le lot M2 dans _media.mjs et
// inséré après -wortschatz (voir _level.mjs) : il n'est pas dans ce fichier, ses 15 minutes comptent dans la durée du module.
// Consignes, règles et explications en allemand avec aide française repliée ([fr?]) ; lexique traduit en français.
import { C2, aide, choice, fill, order, match } from '../../lib.mjs';

/** « Richtig / falsch / steht nicht im Text » : r, f ou n pour la bonne réponse. */
const rf = (id, statement, answer, explanation) => choice(id, `„${statement}“ ${C2.richtigFalsch}`,
  [['richtig', answer === 'r'], ['falsch', answer === 'f'], ['steht nicht im Text', answer === 'n']], explanation);
/** Indices affichés sous les trous d'un fill (forme de base à transformer). */
const hints = (question, ...values) => ({ ...question,
  blanks: question.blanks.map((blank, index) => (values[index] ? { ...blank, hint: values[index] } : blank)) });

export default {
  id: 'b2-umwelt',
  title: 'Umwelt: Klimaschutz und Energiewende',
  objective: 'Comprendre un article de fond et un débat radio sur la transition énergétique, reconnaître le point de vue d’une autrice et les positions d’un débat, formuler prévisions et suppositions au Futur II et concéder une objection sans renoncer à son avis (auch wenn, selbst wenn, wenngleich, zwar … aber).',
  grammarFocus: ['futur2-vermutung', 'konzessiv-auch-wenn'],
  sources: [
    'Textes, dialogues et exercices originaux LinguaCap. Personnes, lieux de l’émission et copropriété sont fictifs.',
    'Repères publics arrondis : objectif de neutralité climatique de l’Allemagne en 2045, prix national du CO₂ croissant depuis 2021, part du chauffage dans la consommation d’énergie (environ un tiers).',
  ],

  vocabulary: [
    { word: 'Klimawandel', article: 'der', plural: null, partOfSpeech: 'noun', translation: 'le changement climatique',
      example: 'Die Folgen des Klimawandels sind auch in Deutschland spürbar.', note: 'sans pluriel' },
    { word: 'Energiewende', article: 'die', plural: null, partOfSpeech: 'noun', translation: 'la transition énergétique',
      example: 'Die Energiewende entscheidet sich auch in den Heizungskellern.', note: 'sans pluriel' },
    { word: 'erneuerbare Energien', partOfSpeech: 'expression', translation: 'les énergies renouvelables',
      example: 'Der Anteil erneuerbarer Energien am Strom wächst jedes Jahr.', note: 'die Erneuerbaren (familier, au pluriel)' },
    { word: 'Wärmepumpe', article: 'die', plural: 'Wärmepumpen', partOfSpeech: 'noun', translation: 'la pompe à chaleur',
      example: 'Im Herbst soll die alte Gasheizung einer Wärmepumpe weichen.', note: null },
    { word: 'Windrad', article: 'das', plural: 'Windräder', partOfSpeech: 'noun', translation: 'l’éolienne',
      example: 'Die Windräder sollen über zweihundert Meter hoch sein.', note: 'die Windkraftanlage (terme technique)' },
    { word: 'Ausstoß', article: 'der', plural: null, partOfSpeech: 'noun', translation: 'les émissions, le rejet',
      example: 'Der Ausstoß von CO₂ soll bis 2045 auf null sinken.', note: 'sans pluriel · aus|stoßen : émettre, rejeter' },
    { word: 'Verbrauch', article: 'der', plural: null, partOfSpeech: 'noun', translation: 'la consommation',
      example: 'Nach der Dämmung sank der Verbrauch um ein Viertel.', note: 'verbrauchen : consommer' },
    { word: 'Genossenschaft', article: 'die', plural: 'Genossenschaften', partOfSpeech: 'noun', translation: 'la coopérative',
      example: 'Jede Einwohnerin kann Mitglied der Genossenschaft werden.', note: null },
    { word: 'Gutachten', article: 'das', plural: 'Gutachten', partOfSpeech: 'noun', translation: 'l’expertise, le rapport d’expert',
      example: 'Die Verwalterin hat ein unabhängiges Gutachten in Auftrag gegeben.', note: 'ein Gutachten in Auftrag geben : commander une expertise' },
    { word: 'Eigentümer', article: 'der', plural: 'Eigentümer', partOfSpeech: 'noun', translation: 'le propriétaire',
      example: 'Die Eigentümer stimmen im März über die neue Heizung ab.', note: 'féminin : die Eigentümerin' },
    { word: 'sanieren', partOfSpeech: 'verb', translation: 'rénover (un bâtiment)',
      example: 'Mit den Einnahmen will die Gemeinde den Kindergarten sanieren.', note: 'die Sanierung : la rénovation' },
    { word: 'dämmen', partOfSpeech: 'verb', translation: 'isoler (thermiquement)',
      example: 'Wenn man das Dach dämmt, sinkt der Energiebedarf.', note: 'die Dämmung : l’isolation' },
    { word: 'einsparen', partOfSpeech: 'verb', translation: 'économiser',
      example: 'Mit der neuen Heizung sparen wir viel Energie ein.', note: 'séparable : ein|sparen' },
    { word: 'fördern', partOfSpeech: 'verb', translation: 'subventionner, encourager',
      example: 'Der Staat fördert den Einbau von Wärmepumpen.', note: 'die Förderung · das Fördergeld : la subvention' },
    { word: 'sich auszahlen', partOfSpeech: 'verb', translation: 'être rentable, porter ses fruits',
      example: 'Die Investition zahlt sich erst in fünfzehn Jahren aus.', note: 'séparable : aus|zahlen · synonymes : sich lohnen, sich rechnen' },
    { word: 'verzichten auf', partOfSpeech: 'verb', translation: 'renoncer à',
      example: 'Viele wollen nicht auf ihr Auto verzichten.', note: '+ accusatif' },
    { word: 'sich auswirken auf', partOfSpeech: 'verb', translation: 'avoir des répercussions sur',
      example: 'Der CO₂-Preis wirkt sich auf die Heizkosten aus.', note: '+ accusatif · séparable : aus|wirken' },
    { word: 'Bedenken äußern', partOfSpeech: 'expression', translation: 'exprimer des réserves',
      example: 'Viele Nachbarn haben in der Versammlung Bedenken geäußert.', note: 'die Bedenken (pluriel) : les réserves, les craintes' },
    { word: 'etwas in Kauf nehmen', partOfSpeech: 'expression', translation: 'accepter (un inconvénient)',
      example: 'Für sauberen Strom nehmen wir den Anblick der Windräder in Kauf.', note: null },
    { word: 'auf lange Sicht', partOfSpeech: 'expression', translation: 'à long terme',
      example: 'Auf lange Sicht ist die Wärmepumpe günstiger.', note: 'synonyme : langfristig' },
    { word: 'klimaneutral', partOfSpeech: 'adjective', translation: 'neutre en carbone',
      example: 'Spätestens 2045 soll Deutschland klimaneutral sein.', note: null },
    { word: 'ohnehin', partOfSpeech: 'adverb', translation: 'de toute façon',
      example: 'Die alte Heizung muss ohnehin bald ersetzt werden.', note: 'synonyme familier : sowieso' },
    { word: 'Bürgerbeteiligung', article: 'die', plural: 'Bürgerbeteiligungen', partOfSpeech: 'noun', translation: 'la participation citoyenne',
      example: 'Ohne echte Bürgerbeteiligung fühlen sich viele übergangen.', note: null },
    { word: 'Einwand', article: 'der', plural: 'Einwände', partOfSpeech: 'noun', translation: 'l’objection',
      example: 'Die Einwände der Skeptiker sind schnell aufgezählt.', note: 'einwenden : objecter' },
  ],

  media: [
    { key: 'b2-umwelt-lesen-artikel', kind: 'image', title: 'Article de fond : le chauffage d’une copropriété',
      alt: 'Début de l’article « Die Wende beginnt im Heizungskeller » : surtitre, titre, signature, chapeau et premier paragraphe sur une chaudière à gaz que l’on veut remplacer par une pompe à chaleur à Kassel.',
      image: { layout: 'article', kicker: 'Klimaschutz im Altbau', title: 'Die Wende beginnt im Heizungskeller', icon: 'heater',
        byline: 'Von Katharina Steinbrecher',
        lead: 'In einem Kasseler Mehrfamilienhaus soll die alte Gasheizung einer Wärmepumpe weichen. Die Eigentümer streiten seit Monaten – ein Lehrstück darüber, warum die Energiewende so mühsam ist.',
        paragraphs: ['Wer verstehen will, warum der Klimaschutz in Deutschland nur langsam vorankommt, sollte nicht nur auf Windparks und Solarfelder schauen, sondern auch in die Keller der Mehrfamilienhäuser. Auf Heizung und Warmwasser entfällt rund ein Drittel des gesamten Energieverbrauchs, und noch immer wird ein Großteil dieser Wärme mit Öl und Gas erzeugt.'] } },
    { key: 'b2-umwelt-hoeren-audio', kind: 'audio', title: 'Débat radio : un parc éolien citoyen',
      script: [
        { voice: 'sprecherin', name: 'Moderatorin', text: 'Guten Abend und herzlich willkommen zur „Streitfrage“. Viele von Ihnen werden die Diskussion schon in der Zeitung verfolgt haben: In der Gemeinde Krähenbrück sollen fünf Windräder gebaut werden, und zwar nicht von einem großen Energiekonzern, sondern von einer Genossenschaft der Bürgerinnen und Bürger.' },
        { voice: 'sprecherin', name: 'Moderatorin', text: 'Bei mir im Studio sind Bürgermeisterin Heike Rautenberg und Bernd Hagemeister von der Bürgerinitiative „Gegenwind Krähenbrück“. Frau Rautenberg, warum braucht Krähenbrück Windräder?' },
        { voice: 'frau2', name: 'Frau Rautenberg', text: 'Weil wir nicht nur über Klimaschutz reden, sondern auch etwas dafür tun wollen. Die fünf Anlagen werden rechnerisch rund zwanzigtausend Haushalte mit Strom versorgen. Und das Besondere ist: Das Geld bleibt im Ort. Jede Einwohnerin und jeder Einwohner kann ab fünfhundert Euro Mitglied der Genossenschaft werden und bekommt jedes Jahr einen Teil des Gewinns.' },
        { voice: 'frau2', name: 'Frau Rautenberg', text: 'Außerdem erhält die Gemeinde Einnahmen, mit denen wir zum Beispiel den Kindergarten sanieren können.' },
        { voice: 'sprecherin', name: 'Moderatorin', text: 'Herr Hagemeister, das klingt eigentlich gut. Was stört Sie?' },
        { voice: 'mann', name: 'Herr Hagemeister', text: 'Ich bin nicht gegen erneuerbare Energien, das möchte ich gleich am Anfang sagen. Ich habe selbst eine Solaranlage auf dem Dach. Aber die Anlagen sollen nur achthundert Meter von den ersten Häusern entfernt stehen, und sie werden über zweihundert Meter hoch sein. Viele Nachbarn haben Angst vor dem Lärm und vor dem Schattenwurf.' },
        { voice: 'mann', name: 'Herr Hagemeister', text: 'Und wer hier wohnt, ist oft gerade wegen der Landschaft hierhergezogen.' },
        { voice: 'sprecherin', name: 'Moderatorin', text: 'Frau Rautenberg, sind achthundert Meter nicht wirklich zu nah?' },
        { voice: 'frau2', name: 'Frau Rautenberg', text: 'Der Abstand entspricht den gesetzlichen Vorgaben. Nachts laufen die Anlagen langsamer, damit sie leiser sind. Und beim Schattenwurf gibt es eine klare Regel: Wenn der Schatten ein Haus zu lange trifft, schaltet sich das Windrad automatisch ab. Auch wenn ich die Sorgen ernst nehme: Viele Befürchtungen haben sich in anderen Gemeinden nicht bestätigt.' },
        { voice: 'mann', name: 'Herr Hagemeister', text: 'Das mag sein. Aber eine Frage hat uns bisher niemand richtig beantwortet: Was passiert mit den Vögeln? Hier in der Nähe brüten Rotmilane, und die gelten als besonders gefährdet.' },
        { voice: 'frau2', name: 'Frau Rautenberg', text: 'Dazu gibt es ein Gutachten, für das zwei Jahre lang beobachtet wurde. Das Ergebnis: Ein Standort wurde gestrichen, deshalb planen wir jetzt fünf statt sechs Anlagen. Und wenn die Felder gemäht werden, stehen die Windräder tagsüber still, weil die Greifvögel dann besonders oft dort jagen.' },
        { voice: 'sprecherin', name: 'Moderatorin', text: 'Herr Hagemeister, wäre das für Sie ein Kompromiss?' },
        { voice: 'mann', name: 'Herr Hagemeister', text: 'Ehrlich gesagt hat mich das Gutachten zum Teil beruhigt. Trotzdem finde ich, dass man die Bürger zu spät gefragt hat. Als wir von dem Projekt erfahren haben, waren die Pachtverträge mit den Landwirten schon unterschrieben. Selbst wenn das Projekt am Ende gut ist: Viele fühlen sich übergangen.' },
        { voice: 'sprecherin', name: 'Moderatorin', text: 'Ein Vorwurf, den man oft hört. Frau Rautenberg?' },
        { voice: 'frau2', name: 'Frau Rautenberg', text: 'Da hat Herr Hagemeister zum Teil recht. Wir hätten früher informieren müssen. Deshalb gibt es jetzt jeden ersten Montag im Monat eine offene Sprechstunde im Gemeindehaus, und im Frühjahr können alle Einwohner über die Beteiligung der Gemeinde abstimmen.' },
        { voice: 'sprecherin', name: 'Moderatorin', text: 'Wie geht es jetzt weiter? Wann könnten sich die Räder drehen?' },
        { voice: 'frau2', name: 'Frau Rautenberg', text: 'Wenn alles gut läuft, beginnen die Bauarbeiten im übernächsten Jahr. Bis die Anlagen den ersten Strom liefern, werden wir dann sieben Jahre lang geplant, geprüft und diskutiert haben. Das zeigt übrigens auch, wie langsam solche Genehmigungsverfahren in Deutschland immer noch sind.' },
        { voice: 'mann', name: 'Herr Hagemeister', text: 'Sieben Jahre – bis dahin werden sich viele hier an den Gedanken gewöhnt haben. Ich werde jedenfalls zur Sprechstunde gehen. Wenn wir schon Windräder bekommen, dann sollen die Leute im Ort auch mitreden und mitverdienen.' },
        { voice: 'sprecherin', name: 'Moderatorin', text: 'Ein versöhnliches Schlusswort. Frau Rautenberg, Herr Hagemeister, vielen Dank für das Gespräch. Und Sie, liebe Hörerinnen und Hörer: Was meinen Sie? Schreiben Sie uns auf unserer Internetseite.' },
      ] },
    { key: 'b2-umwelt-kontrolle-audio', kind: 'audio', title: 'Brève d’information : le vote de Krähenbrück',
      script: [
        { voice: 'frau3', name: 'Nachrichten', text: 'Krähenbrück. Bei der Bürgerbefragung zum geplanten Windpark haben sich am Sonntag fast zwei Drittel der Teilnehmenden für eine Beteiligung der Gemeinde ausgesprochen. Rund einundsiebzig Prozent der Wahlberechtigten haben abgestimmt.' },
        { voice: 'frau3', name: 'Nachrichten', text: 'Die Bürgerinitiative „Gegenwind Krähenbrück“ kündigte an, das Ergebnis zu akzeptieren, auch wenn sie weiterhin einen größeren Abstand zu den Häusern fordert. Bürgermeisterin Rautenberg rechnet damit, dass die ersten Anteile der Genossenschaft im Herbst verkauft werden. Bis zum Baubeginn will die Gemeinde jeden Monat über den Stand der Planung informieren.' },
      ] },
  ],

  activities: [
    // 1 · Mise en route
    { id: 'b2-umwelt-einstieg', kind: 'lesson', title: 'Einstieg: Klima und Energie im Alltag', estimatedMinutes: 10,
      competences: ['lecture', 'expression-orale'],
      lesson: { description: `KLIMA UND ENERGIE
[fr?] Climat et énergie
${aide('Hitzesommer, steigende Energiepreise, neue Heizungen und Windräder vor dem Dorf: Der Klimawandel verändert unseren Alltag, und über die richtigen Antworten wird überall heftig gestritten.', 'Étés caniculaires, prix de l’énergie en hausse, nouveaux chauffages, éoliennes près des villages : le changement climatique transforme le quotidien, et les réponses à y apporter font débat partout.')}

FRAGEN ZUM EINSTIEG
[fr?] Questions pour commencer
• ${aide('Welche Folgen des Klimawandels bemerken Sie selbst, dort wo Sie leben?', 'Quelles conséquences du changement climatique remarquez-vous là où vous vivez ?')}
• ${aide('Wie wird Ihre Wohnung geheizt, und was würden Sie ändern, wenn Sie selbst entscheiden könnten?', 'Comment votre logement est-il chauffé, et que changeriez-vous si vous pouviez décider ?')}
• ${aide('In der Nähe Ihres Wohnorts soll ein Windpark entstehen. Welche Fragen und welche Bedenken hätten Sie?', 'Un parc éolien doit être construit près de chez vous. Quelles questions et quelles réserves auriez-vous ?')}
${aide('Überlegen Sie sich zu jeder Frage zwei oder drei Sätze auf Deutsch: ein Argument und ein Beispiel.', 'Pour chaque question, préparez mentalement deux ou trois phrases en allemand : un argument et un exemple.')}

ZIELE
[fr?] Objectifs
• ${aide('Ich kann einen Hintergrundartikel über die Energiewende verstehen und die Haltung der Autorin erkennen.', 'Je peux comprendre un article de fond sur la transition énergétique et reconnaître la position de l’autrice.')}
• ${aide('Ich kann einer Radiodiskussion folgen, die Positionen unterscheiden und die wichtigsten Fakten festhalten.', 'Je peux suivre un débat radio, distinguer les positions et retenir les faits essentiels.')}
• ${aide('Ich kann Prognosen und Vermutungen mit dem Futur II formulieren: „Bis 2045 werden die meisten … ausgetauscht haben.“', 'Je peux formuler prévisions et suppositions au Futur II.')}
• ${aide('Ich kann einen Einwand anerkennen und trotzdem meinen Standpunkt vertreten: „Auch wenn …, …“', 'Je peux concéder une objection tout en défendant mon point de vue.')}

WICHTIGE WÖRTER
[fr?] Mots-clés
• der Klimawandel — le changement climatique
• die Energiewende — la transition énergétique
• erneuerbare Energien — les énergies renouvelables
• die Wärmepumpe, die Wärmepumpen — la pompe à chaleur
• das Windrad, die Windräder — l’éolienne
• der CO₂-Ausstoß — les émissions de CO₂
• sanieren, dämmen — rénover, isoler
• Bedenken äußern — exprimer des réserves` } },

    // 2 · Lecture longue : article de fond
    { id: 'b2-umwelt-lesen', kind: 'exercise', title: 'Verstehen: ein Hintergrundartikel zur Wärmewende', estimatedMinutes: 23,
      competences: ['lecture'],
      lesson: { description: `${C2.lesen}

STRATEGIE
[fr?] Stratégie
1. ${aide('Lesen Sie zuerst Überschrift, Vorspann und letzten Absatz: Worum geht es, und wohin will der Text?', 'Lisez d’abord le titre, le chapeau et le dernier paragraphe : de quoi s’agit-il, et où le texte veut-il en venir ?')}
2. ${aide('Unterscheiden Sie beim zweiten Lesen: Wer spricht? Was sind Fakten, was sind Einwände, wo bewertet die Autorin selbst?', 'À la deuxième lecture, distinguez : qui parle ? Qu’est-ce qui relève des faits, des objections, du jugement de l’autrice ?')}
3. ${aide('Achten Sie auf Signalwörter wie „doch“, „dabei“, „hinzu kommt“ und „auch wenn“: Sie zeigen, wie die Argumente zusammenhängen.', 'Repérez les mots signaux (« doch », « dabei », « hinzu kommt », « auch wenn ») : ils montrent comment s’enchaînent les arguments.')}

DIE WENDE BEGINNT IM HEIZUNGSKELLER
In einem Kasseler Mehrfamilienhaus soll die alte Gasheizung einer Wärmepumpe weichen. Die Eigentümer streiten seit Monaten – ein Lehrstück darüber, warum die Energiewende so mühsam ist.
Von Katharina Steinbrecher

(A) Wer verstehen will, warum der Klimaschutz in Deutschland nur langsam vorankommt, sollte nicht nur auf Windparks und Solarfelder schauen, sondern auch in die Keller der Mehrfamilienhäuser. Auf Heizung und Warmwasser entfällt rund ein Drittel des gesamten Energieverbrauchs, und noch immer wird ein Großteil dieser Wärme mit Öl und Gas erzeugt. In der Lessingstraße 14 brummt seit 1994 ein Gaskessel. Ginge es nach der Hausverwalterin Petra Holmgren, würde er im kommenden Herbst durch eine Wärmepumpe ersetzt. Doch dafür braucht sie die Zustimmung der zwölf Eigentümerinnen und Eigentümer – und die ist alles andere als sicher.

(B) Die Einwände der Skeptiker sind schnell aufgezählt. Die neue Anlage koste mit allen Umbauten im Keller rund 150 000 Euro, rechnet Gerd Brauer vor, der seit vierzig Jahren im Erdgeschoss wohnt. „Auch wenn es Fördergeld gibt, bleibt für jede Wohnung ein Betrag von mehreren tausend Euro übrig. Ich bin 74. Bis sich das rechnet, werde ich längst ausgezogen sein.“ Andere bezweifeln, dass eine Wärmepumpe in einem Altbau mit kaum gedämmten Wänden überhaupt funktioniert. Sie fürchten, im Winter zu frieren oder am Ende hohe Stromrechnungen zu bezahlen.

(C) Petra Holmgren kennt diese Bedenken. Sie hat ein unabhängiges Gutachten in Auftrag gegeben, und dessen Ergebnis hat selbst sie überrascht: Weil die Heizkörper groß genug sind, könnte eine Wärmepumpe das Haus schon heute zuverlässig warm halten, wenngleich der Stromverbrauch in sehr kalten Wochen deutlich steigen würde. Würde man zusätzlich das Dach dämmen, sänke der Energiebedarf um ein weiteres Viertel. „Die Technik ist nicht das Problem“, sagt die Verwalterin. „Das Problem ist, dass niemand gern heute für etwas bezahlt, das sich erst in fünfzehn Jahren auszahlt.“

(D) Dabei dürfte gerade das Abwarten am Ende teuer werden. Seit 2021 steigt in Deutschland der Preis für den Ausstoß von CO₂ schrittweise, und Fachleute rechnen damit, dass das Heizen mit Gas in den kommenden Jahren deutlich mehr kosten wird. Hinzu kommt: Spätestens 2045 soll Deutschland klimaneutral sein. Bis dahin werden die meisten Eigentümer ihre alten Heizungen ohnehin ausgetauscht haben. Die Frage ist nur, ob freiwillig und gut geplant oder unter Zeitdruck, wenn der alte Kessel an einem Januarmorgen plötzlich ausfällt. Wer heute noch eine neue Gasheizung einbaut, legt sich für zwanzig Jahre auf einen Brennstoff fest, dessen Preis niemand vorhersagen kann.

(E) Bei der Eigentümerversammlung im März soll abgestimmt werden. Holmgren hat einen Kompromiss vorbereitet: Die Wärmepumpe wird im Herbst eingebaut, die Dämmung des Daches folgt in fünf Jahren, und wer seinen Anteil nicht auf einmal bezahlen kann, darf ihn in Raten begleichen. Ob das reicht, weiß niemand. Gerd Brauer jedenfalls will „nicht derjenige sein, der alles blockiert“. Wer ihm zuhört, merkt: Er wird lange über die Zahlen nachgedacht haben. Selbst wenn er am Ende dagegen stimmen sollte, will er das Ergebnis akzeptieren. Vielleicht ist das die eigentliche Lehre aus der Lessingstraße: Die Energiewende entscheidet sich nicht nur in Berlin, sondern auch in unzähligen kleinen Versammlungen, in denen Nachbarn lernen müssen, gemeinsam zu rechnen – und einander zuzuhören.` },
      placements: [{ media: 'b2-umwelt-lesen-artikel', caption: 'Der Artikel (Anfang)' }],
      questions: [
        choice('q1', aide('Worum geht es in dem Artikel vor allem?', 'De quoi l’article traite-t-il avant tout ?'),
          [['um die Frage, warum Wärmepumpen in Altbauten technisch nicht funktionieren'],
            ['um die Pläne der Bundesregierung, sämtliche Gasheizungen schon bis 2030 zu verbieten'],
            ['um einen Streit, der zeigt, warum der Umbau der Heizungen so langsam vorankommt', true],
            ['um ein Haus in Kassel, in dem seit 1994 überhaupt nichts mehr renoviert worden ist']],
          'Der Vorspann nennt den Konflikt in der Lessingstraße „ein Lehrstück darüber, warum die Energiewende so mühsam ist“: Das Haus ist ein Beispiel für ein allgemeines Problem. Laut Gutachten funktioniert die Technik; ein Verbot bis 2030 wird nicht erwähnt, und aus dem Jahr 1994 stammt nur der Kessel. [fr?] Le cas de l’immeuble illustre un problème général : la lenteur de la transition, pas un défaut technique.'),
        choice('q2', aide('Welche Haltung nimmt die Autorin ein?', 'Quelle position l’autrice adopte-t-elle ?'),
          [['Sie hält den Umbau für sinnvoll und nimmt zugleich die Sorgen der Eigentümer ernst.', true],
            ['Sie lehnt den Umbau ab, weil er für ältere Eigentümer finanziell nicht tragbar ist.'],
            ['Sie gibt nur Zahlen und Zitate wieder und vermeidet in ihrem Text jede eigene Bewertung.'],
            ['Sie wirft der Hausverwalterin vor, die Eigentümer mit dem Gutachten unter Druck zu setzen.']],
          'In Absatz D bewertet die Autorin selbst: „Dabei dürfte gerade das Abwarten am Ende teuer werden.“ Gleichzeitig gibt sie die Einwände von Herrn Brauer verständnisvoll wieder und schließt mit dem Appell, „einander zuzuhören“. Eine eigene Meinung hat sie also; Kritik an der Verwalterin äußert sie nicht. [fr?] « dürfte … teuer werden » révèle son avis ; la fin plaide pour l’écoute mutuelle.'),
        choice('q3', aide('Was meint Petra Holmgren mit dem Satz „Das Problem ist, dass niemand gern heute für etwas bezahlt, das sich erst in fünfzehn Jahren auszahlt“?', 'Que veut dire Petra Holmgren par cette phrase ?'),
          [['Die Wärmepumpe ist nach fünfzehn Jahren kaputt und muss dann ersetzt werden.'],
            ['Die Eigentümer haben in den letzten fünfzehn Jahren insgesamt viel zu wenig Geld gespart.'],
            ['Die Fördergelder werden erst in fünfzehn Jahren an die Eigentümer ausgezahlt.'],
            ['Die Kosten entstehen sofort, der finanzielle Vorteil zeigt sich erst langfristig.', true]],
          '„Sich auszahlen“ bedeutet: sich finanziell lohnen. Holmgren erklärt das Zögern der Eigentümer: Man bezahlt jetzt, profitiert aber erst nach vielen Jahren von niedrigeren Heizkosten. Über die Lebensdauer der Anlage oder den Zeitpunkt der Förderung sagt sie nichts. [fr?] « sich auszahlen » = être rentable : on paie maintenant, le gain vient plus tard.'),
        rf('q4', 'Laut Gutachten könnte eine Wärmepumpe das Haus auch ohne neue Dämmung zuverlässig heizen.', 'r',
          'Richtig: „Weil die Heizkörper groß genug sind, könnte eine Wärmepumpe das Haus schon heute zuverlässig warm halten.“ Die Dämmung des Daches würde den Bedarf nur zusätzlich senken („sänke … um ein weiteres Viertel“). [fr?] La pompe fonctionnerait déjà ; l’isolation réduirait seulement la consommation.'),
        rf('q5', 'Die meisten Wohnungen in der Lessingstraße 14 sind vermietet.', 'n',
          'Steht nicht im Text: Der Artikel spricht von zwölf Eigentümerinnen und Eigentümern, sagt aber nicht, ob sie selbst dort wohnen oder vermieten. Nur von Herrn Brauer wissen wir, dass er im Erdgeschoss wohnt. [fr?] Rien n’est dit sur la location : ne déduisez pas.'),
        rf('q6', 'Nach dem Kompromiss sollen Wärmepumpe und Dachdämmung gleichzeitig eingebaut werden.', 'f',
          'Falsch: Die Wärmepumpe kommt im Herbst, „die Dämmung des Daches folgt in fünf Jahren“. Der Kompromiss verteilt die Kosten also auf zwei Zeitpunkte, und Ratenzahlung ist möglich. [fr?] La pompe d’abord, l’isolation du toit cinq ans plus tard.'),
        match('q7', aide('Welche Überschrift passt zu welchem Absatz? Ordnen Sie zu.', 'Quel intertitre convient à quel paragraphe ? Associez.'),
          [['Absatz A', 'Ein Kessel als Beispiel für ein ganzes Land'], ['Absatz B', 'Die Einwände der Skeptiker'],
            ['Absatz C', 'Was eine Untersuchung ergeben hat'], ['Absatz D', 'Warum Abwarten teuer werden könnte'],
            ['Absatz E', 'Ein Kompromiss vor der Abstimmung']],
          'A stellt das Haus als Beispiel für den langsamen Klimaschutz vor. B sammelt die Gegenargumente (Kosten, Alter, Zweifel an der Technik). C nennt das Ergebnis des Gutachtens. D erklärt, warum Nichtstun teurer werden dürfte (CO₂-Preis, Ziel 2045). E beschreibt den Kompromiss und die Abstimmung im März. [fr?] Cherchez dans chaque paragraphe le mot-clé : Beispiel, Einwände, Gutachten, CO₂-Preis, Kompromiss.'),
        fill('q8', aide('Welches Wort aus dem Text passt? Ergänzen Sie.', 'Quel mot du texte convient ? Complétez.'),
          'Absatz C: Eine unabhängige Fachperson hat das Haus untersucht und ein [[1]] geschrieben. · Absatz E: Wer seinen Anteil nicht auf einmal bezahlen kann, darf ihn in [[2]] begleichen.',
          [['Gutachten'], ['Raten']],
          '„Das Gutachten“ ist die schriftliche Bewertung durch eine Expertin oder einen Experten; man gibt es „in Auftrag“. „In Raten“ zahlt man in mehreren Teilbeträgen statt auf einmal. [fr?] das Gutachten = l’expertise ; in Raten = en plusieurs versements.'),
      ] },

    // 3 · Écoute longue : débat radio
    { id: 'b2-umwelt-hoeren', kind: 'exercise', title: 'Verstehen: eine Radiodiskussion über einen Windpark', estimatedMinutes: 23,
      competences: ['ecoute'],
      lesson: { description: `${C2.hoeren}

SITUATION
[fr?] La situation
${aide('In der Radiosendung „Streitfrage“ diskutieren die Bürgermeisterin von Krähenbrück und ein Sprecher der Bürgerinitiative über fünf geplante Windräder.', 'Dans l’émission « Streitfrage », la maire de Krähenbrück et un porte-parole d’une initiative citoyenne débattent de cinq éoliennes en projet.')}

STRATEGIE
[fr?] Stratégie
1. ${aide('Erstes Hören: Wer vertritt welche Position? Hören Sie nur auf die großen Linien.', 'Première écoute : qui défend quelle position ? N’écoutez que les grandes lignes.')}
2. ${aide('Lesen Sie dann die Notizen. Was fehlt: eine Zahl, eine Maßnahme, ein Wochentag?', 'Lisez ensuite les notes. Que manque-t-il : un nombre, une mesure, un jour de la semaine ?')}
3. ${aide('Zweites Hören: Ergänzen Sie die Notizen mit Stichwörtern. Achten Sie auch darauf, wo jemand einen Punkt zugibt („Da hat … zum Teil recht“).', 'Deuxième écoute : complétez avec des mots-clés. Repérez aussi les moments où quelqu’un concède un point.')}` },
      placements: [{ media: 'b2-umwelt-hoeren-audio', caption: 'Streitfrage: Windräder für Krähenbrück?' }],
      questions: [
        fill('q1', aide('Notizen zum ersten Teil: Ergänzen Sie die Lücken mit Stichwörtern.', 'Notes sur la première partie : complétez avec des mots-clés.'),
          'Projekt: [[1]] Windräder (vorher sechs geplant) · Bauherr: eine [[2]] der Bürger · Mitglied ab [[3]] Euro · Abstand zu den ersten Häusern: [[4]] Meter · Höhe der Anlagen: über [[5]] Meter',
          [['5', 'fünf'], ['Genossenschaft', 'Bürgergenossenschaft', 'Energiegenossenschaft'], ['500', 'fünfhundert'], ['800', 'achthundert'], ['200', 'zweihundert']],
          'Fünf Anlagen statt sechs (ein Standort wurde wegen der Vögel gestrichen). Bauherr ist „eine Genossenschaft der Bürgerinnen und Bürger“, Mitglied wird man „ab fünfhundert Euro“. Herr Hagemeister nennt „achthundert Meter“ Abstand und „über zweihundert Meter“ Höhe. [fr?] Notez les chiffres en chiffres ou en lettres : les deux sont acceptés.'),
        fill('q2', aide('Notizen zum zweiten Teil: Ergänzen Sie die Lücken mit Stichwörtern.', 'Notes sur la seconde partie : complétez avec des mots-clés.'),
          'Lärm: nachts laufen die Anlagen [[1]] · Schattenwurf: das Windrad schaltet sich automatisch [[2]] · Rotmilane: Gutachten, [[3]] Jahre beobachtet · bei der Mahd: Windräder stehen tagsüber [[4]] · Information: Sprechstunde jeden ersten [[5]] im Monat · Baubeginn: im [[6]] Jahr',
          [['langsamer', 'leiser'], ['ab'], ['2', 'zwei'], ['still'], ['Montag'], ['übernächsten']],
          '„Nachts laufen die Anlagen langsamer, damit sie leiser sind.“ Beim Schattenwurf „schaltet sich das Windrad automatisch ab“. Das Vogelgutachten dauerte zwei Jahre; bei der Mahd „stehen die Windräder tagsüber still“. Die Sprechstunde ist „jeden ersten Montag im Monat“, der Bau beginnt „im übernächsten Jahr“. [fr?] übernächst- = dans deux ans (l’année d’après la prochaine).'),
        choice('q3', aide('Wie steht Herr Hagemeister grundsätzlich zur Windenergie?', 'Quelle est, au fond, la position de M. Hagemeister sur l’éolien ?'),
          [['Er lehnt jede Form von Windkraft ab, weil sie die Landschaft zerstört.'],
            ['Er unterstützt erneuerbare Energien, kritisiert aber Standort und Verfahren.', true],
            ['Er ist nur dafür, wenn die Anlagen weit draußen auf dem Meer gebaut werden.'],
            ['Er hat noch keine Meinung und will sich erst in der Sprechstunde informieren.']],
          'Gleich am Anfang sagt er: „Ich bin nicht gegen erneuerbare Energien“ – er hat sogar eine Solaranlage. Er kritisiert den Abstand, die Höhe, den Schutz der Vögel und dass man die Bürger „zu spät gefragt“ hat. Eine Meinung hat er also; zur Sprechstunde geht er, um mitzureden. [fr?] Il est favorable aux renouvelables mais critique l’emplacement et la procédure.'),
        choice('q4', aide('Was räumt die Bürgermeisterin ein?', 'Que concède la maire ?'),
          [['Die Abstände zu den Häusern sind kleiner, als es das Gesetz eigentlich erlaubt.'],
            ['Das Vogelgutachten hat einige wichtige Fragen leider offengelassen.'],
            ['Die Gemeinde hätte die Einwohner früher informieren müssen.', true],
            ['Die Genossenschaft wird dem Ort weniger Geld bringen als geplant.']],
          '„Da hat Herr Hagemeister zum Teil recht. Wir hätten früher informieren müssen.“ Mit „hätte … müssen“ gibt sie einen Fehler in der Vergangenheit zu. Den Abstand verteidigt sie dagegen als gesetzeskonform, und das Gutachten stellt sie als gründlich dar. [fr?] Elle concède un manque d’information : « wir hätten … müssen » = nous aurions dû.'),
        choice('q5', aide('Was will die Bürgermeisterin mit den „sieben Jahren“ zeigen?', 'Que veut montrer la maire avec les « sept ans » ?'),
          [['dass die Gemeinde besonders gründlich und vorsichtig gearbeitet hat'],
            ['dass Genehmigungsverfahren in Deutschland noch immer zu lange dauern', true],
            ['dass die Bürgerinitiative das Projekt jahrelang blockiert hat'],
            ['dass die Windräder schon nach sieben Jahren wieder vollständig abgebaut werden']],
          '„Das zeigt übrigens auch, wie langsam solche Genehmigungsverfahren in Deutschland immer noch sind.“ Die sieben Jahre sind für sie ein Beispiel für zu langsame Verfahren, keine Kritik an der Bürgerinitiative. Achten Sie auf das Futur II: „werden wir sieben Jahre lang geplant … haben“. [fr?] Elle critique la lenteur des procédures d’autorisation.'),
        choice('q6', aide('Wie lässt sich das Ende des Gesprächs zusammenfassen?', 'Comment résumer la fin de l’entretien ?'),
          [['Herr Hagemeister will sich beteiligen, obwohl er nicht alle Bedenken aufgegeben hat.', true],
            ['Herr Hagemeister kündigt an, gegen das Projekt vor Gericht zu klagen.'],
            ['Beide Gäste sind sich am Ende in allen wichtigen Punkten völlig einig.'],
            ['Die Bürgermeisterin verschiebt die Abstimmung auf unbestimmte Zeit.']],
          'Hagemeister will zur Sprechstunde gehen, damit die Leute „mitreden und mitverdienen“ – aber „wenn wir schon Windräder bekommen“ zeigt, dass er nicht begeistert ist. Die Moderatorin spricht von einem „versöhnlichen Schlusswort“, nicht von völliger Einigkeit. [fr?] Il veut participer, sans avoir levé toutes ses réserves.'),
      ] },

    // 4 · Grammaire inductive
    { id: 'b2-umwelt-entdecken', kind: 'exercise', title: 'Entdecken: Futur II und Einwände', estimatedMinutes: 10,
      competences: ['lecture'],
      lesson: { description: `${aide('Lesen Sie die Sätze aus dem Artikel und aus der Radiodiskussion. Achten Sie auf die Verbformen und auf die Wörter am Anfang der Nebensätze.', 'Lisez ces phrases de l’article et du débat radio. Observez les formes verbales et les mots qui ouvrent les subordonnées.')}

SÄTZE
[fr?] Le corpus
(1) Bis sich das rechnet, werde ich längst ausgezogen sein.
(2) Bis dahin werden die meisten Eigentümer ihre alten Heizungen ohnehin ausgetauscht haben.
(3) Viele von Ihnen werden die Diskussion schon in der Zeitung verfolgt haben.
(4) Wer ihm zuhört, merkt: Er wird lange über die Zahlen nachgedacht haben.
(5) Auch wenn es Fördergeld gibt, bleibt für jede Wohnung ein Betrag von mehreren tausend Euro übrig.
(6) Selbst wenn er am Ende dagegen stimmen sollte, will er das Ergebnis akzeptieren.
(7) Eine Wärmepumpe könnte das Haus warm halten, wenngleich der Stromverbrauch in sehr kalten Wochen deutlich steigen würde.

${aide('Beantworten Sie dann die Fragen. Die Erklärungen formulieren die Regel.', 'Répondez ensuite aux questions. Les explications formulent la règle.')}` },
      questions: [
        choice('q1', aide('Sätze 1 und 2: Was drücken „werde … ausgezogen sein“ und „werden … ausgetauscht haben“ aus?', 'Phrases 1 et 2 : qu’expriment ces formes verbales ?'),
          [['eine Handlung, die zu einem Zeitpunkt in der Zukunft schon abgeschlossen sein wird', true],
            ['eine Handlung, die in der Vergangenheit begonnen hat und bis heute andauert'],
            ['einen Wunsch, der sich nach Meinung des Sprechers kaum erfüllen wird'],
            ['eine Handlung, die gerade jetzt, im Moment des Sprechens, stattfindet']],
          'Beide Sätze blicken auf einen Zeitpunkt in der Zukunft („bis sich das rechnet“, „bis dahin“ = 2045) und sagen: Dann ist die Handlung schon vorbei. Das ist das Futur II: werden + Partizip II + haben oder sein. Das Hilfsverb ist dasselbe wie im Perfekt: ausziehen → ist ausgezogen, austauschen → hat ausgetauscht. [fr?] C’est le futur antérieur : « j’aurai déménagé », « ils auront remplacé ».'),
        choice('q2', aide('Sätze 3 und 4: Welche Bedeutung hat das Futur II hier?', 'Phrases 3 et 4 : quel sens a ici le Futur II ?'),
          [['Die Sprecher kündigen an, was die Leute später tun werden.'],
            ['Die Sprecher fordern die Leute höflich zu etwas auf.'],
            ['Die Sprecher vermuten, dass etwas schon passiert ist.', true],
            ['Die Sprecher geben wieder, was andere gesagt haben.']],
          '„Viele von Ihnen werden die Diskussion verfolgt haben“ heißt: Wahrscheinlich haben viele sie verfolgt. Es geht nicht um die Zukunft, sondern um eine Vermutung über Vergangenes; „wohl“, „sicher“ oder „bestimmt“ verstärken sie oft. Für eine Vermutung über die Gegenwart genügt das Futur I: „Sie wird (wohl) noch im Rathaus sein.“ [fr?] Comme « il aura oublié » = il a sans doute oublié : supposition sur le passé.'),
        match('q3', aide('Was drückt der Satz aus? Ordnen Sie zu.', 'Qu’exprime chaque phrase ? Associez.'),
          [['Bis 2030 wird die Stadt ihre Emissionen halbiert haben.', 'Abschluss in der Zukunft'],
            ['Herr Hagemeister wird den Artikel gelesen haben.', 'Vermutung über die Vergangenheit'],
            ['Frau Rautenberg wird jetzt wohl im Rathaus sein.', 'Vermutung über die Gegenwart'],
            ['Im Frühjahr werden alle Einwohner abstimmen.', 'Plan für die Zukunft']],
          'Futur II mit einem Zeitpunkt in der Zukunft („bis 2030“): Abschluss. Futur II ohne Zukunftsbezug: Vermutung über Vergangenes. Futur I mit „jetzt“ und „wohl“: Vermutung über die Gegenwart. Futur I mit einer Zeitangabe in der Zukunft: Plan oder Vorhersage. [fr?] Le contexte (bis 2030, jetzt, wohl, im Frühjahr) décide du sens.'),
        choice('q4', aide('Sätze 5 bis 7: Was haben „auch wenn“, „selbst wenn“ und „wenngleich“ gemeinsam?', 'Phrases 5 à 7 : qu’ont en commun ces trois conjonctions ?'),
          [['Sie nennen eine Bedingung: Nur wenn sie erfüllt ist, gilt der Hauptsatz.'],
            ['Sie nennen einen Grund, der den Hauptsatz erklärt, wie „weil“.'],
            ['Sie leiten eine Folge ein, die sich aus dem Hauptsatz ergibt.'],
            ['Sie nennen einen Gegengrund, der die Aussage des Hauptsatzes nicht verhindert.', true]],
          'Alle drei sind konzessiv wie „obwohl“: Der Nebensatz nennt etwas, das eigentlich dagegen spricht, und trotzdem gilt der Hauptsatz (es gibt Fördergeld – trotzdem bleibt ein Betrag übrig). Steht der Nebensatz vorn, beginnt der Hauptsatz mit dem Verb („bleibt“, „will“). „Selbst wenn“ verstärkt und ist oft hypothetisch („sollte“), „wenngleich“ klingt schriftlich. [fr?] Ce sont des concessives : « même si », « bien que ».'),
      ] },

    // 5 · Règle
    { id: 'b2-umwelt-regel', kind: 'lesson', title: 'Regel: Futur II und konzessive Sätze', estimatedMinutes: 10,
      competences: ['lecture'],
      lesson: { description: `REGEL — DAS FUTUR II
[fr?] Règle : le Futur II (futur antérieur)
Form: werden (konjugiert) + Partizip II + haben oder sein (Infinitiv). Das Hilfsverb ist dasselbe wie im Perfekt.
[fr?] werden conjugué + participe II + haben ou sein : même auxiliaire qu’au Perfekt.
• ${aide('Bis 2045 werden die meisten Eigentümer ihre Heizungen ausgetauscht haben.', 'D’ici 2045, la plupart des propriétaires auront remplacé leur chauffage.')}
• ${aide('Bis sich das rechnet, werde ich längst ausgezogen sein.', 'Avant que ce soit rentable, j’aurai déménagé depuis longtemps.')}
• ${aide('Im Nebensatz steht „werden“ ganz am Ende: …, weil die Stadt bis dahin alle Busse umgestellt haben wird.', 'En subordonnée, werden se place tout à la fin.')}

REGEL — WOZU BRAUCHT MAN DAS FUTUR II?
[fr?] Règle : les emplois du Futur II
1. ${aide('Abschluss in der Zukunft, meist mit „bis“ oder einem Zeitpunkt: Bis Freitag werde ich den Bericht geschrieben haben.', 'Action achevée à un moment futur, souvent avec « bis ».')}
2. ${aide('Vermutung über Vergangenes, oft mit „wohl“, „sicher“, „bestimmt“: Er wird den Zug verpasst haben. = Er hat ihn wahrscheinlich verpasst.', 'Supposition sur le passé : « il aura raté son train ».')}
${aide('Eine Vermutung über die Gegenwart drückt das Futur I aus: Sie wird (wohl) noch im Büro sein.', 'Supposition sur le présent : Futur I.')}
${aide('Sie kennen schon: Er muss den Zug verpasst haben (fast sicher), er dürfte ihn verpasst haben (wahrscheinlich). Das Futur II klingt ähnlich wie „dürfte“.', 'Rappel du module Gesundheit : le Futur II exprime une probabilité proche de « dürfte ».')}
${aide('In der gesprochenen Sprache ersetzt man das Futur II mit der Bedeutung 1 oft durch das Perfekt und eine Zeitangabe: Bis Freitag habe ich den Bericht geschrieben.', 'À l’oral, le Perfekt + une indication de temps remplace souvent le Futur II.')}

REGEL — EINWÄNDE EINRÄUMEN: KONZESSIVE SÄTZE
[fr?] Règle : concéder une objection
• ${aide('auch wenn – Gegengrund, real oder gedacht: Auch wenn es Fördergeld gibt, bleibt ein Betrag übrig.', 'même si : objection réelle ou imaginée.')}
• ${aide('selbst wenn – verstärkt („sogar in diesem Fall“), oft hypothetisch mit Konjunktiv II oder „sollte“: Selbst wenn wir heute alle Heizungen austauschen würden, wäre das Klimaziel noch nicht erreicht.', 'même si (renforcé), souvent hypothétique.')}
• ${aide('obwohl, obgleich, wenngleich – Tatsache, die eigentlich dagegen spricht; „obgleich“ und „wenngleich“ klingen schriftlich.', 'bien que, quoique ; obgleich et wenngleich sont soutenus.')}
• ${aide('Wortstellung: Im Nebensatz steht das Verb am Ende. Steht der Nebensatz vorn, beginnt der Hauptsatz mit dem Verb: Auch wenn es regnet, findet das Fest statt.', 'Verbe à la fin de la subordonnée, puis verbe en tête de la principale.')}
• ${aide('Im Hauptsatz: trotzdem oder dennoch (das Verb folgt direkt) und zwar … aber: Die Anlage ist zwar teuer, aber sie lohnt sich.', 'trotzdem, dennoch = pourtant, malgré tout ; zwar … aber = certes … mais.')}

ACHTUNG
[fr?] Attention : pièges des francophones
• ${aide('Nach dem vorangestellten Nebensatz steht kein Subjekt vor dem Verb. Falsch: „Auch wenn es regnet, das Fest findet statt.“', 'Après la subordonnée, pas de sujet avant le verbe.')}
• ${aide('Nach „wenn“ und „sobald“ steht für eine abgeschlossene Handlung in der Zukunft das Perfekt, nicht das Futur II: Wenn ich den Bericht geschrieben habe, rufe ich dich an.', '« Quand j’aurai fini » se traduit par le Perfekt : wenn ich fertig bin / … geschrieben habe.')}
• ${aide('„Sogar wenn“ hört man selten. Sagen Sie „auch wenn“ oder „selbst wenn“.', '« même si » = auch wenn ou selbst wenn.')}
• ${aide('Ausziehen, einschlafen, ankommen bilden das Perfekt mit „sein“, also auch das Futur II: Ich werde ausgezogen sein.', 'Les verbes avec sein au Perfekt gardent sein au Futur II.')}` } },

    // 6 · Grammaire : s'entraîner
    { id: 'b2-umwelt-grammatik', kind: 'exercise', title: 'Üben: Futur II und konzessive Sätze', estimatedMinutes: 14,
      competences: ['lecture', 'expression-ecrite'],
      lesson: { description: `${aide('Üben Sie das Futur II und die konzessiven Sätze. Lesen Sie jeden Satz bis zum Ende, bevor Sie antworten.', 'Entraînez-vous au Futur II et aux concessives. Lisez chaque phrase jusqu’au bout avant de répondre.')}

MERKE
[fr?] À retenir
• ${aide('Futur II: werden + Partizip II + haben/sein – Abschluss in der Zukunft oder Vermutung über Vergangenes', 'action achevée dans le futur ou supposition sur le passé')}
• ${aide('auch wenn, selbst wenn, obwohl, wenngleich + Verb am Ende; danach Hauptsatz mit dem Verb zuerst', 'concessives : verbe à la fin, puis verbe en tête de la principale')}` },
      questions: [
        hints(fill('q1', aide('Ergänzen Sie das Futur II (Abschluss in der Zukunft).', 'Complétez au Futur II (action achevée dans le futur).'),
          'Bis 2030 [[1]] die Stadtwerke alle Busse auf Elektroantrieb [[2]] [[3]].',
          [['werden'], ['umgestellt'], ['haben']],
          'Futur II = werden (konjugiert, an Position 2) + Partizip II + haben/sein am Satzende. „Umstellen“ bildet das Perfekt mit „haben“ (sie haben umgestellt), also: werden … umgestellt haben. Beim trennbaren Verb steht „-ge-“ zwischen Präfix und Stamm. [fr?] « auront converti » : werden + participe + haben.'),
        'werden', 'umstellen', 'haben oder sein?'),
        hints(fill('q2', aide('Formulieren Sie eine Vermutung über die Vergangenheit.', 'Formulez une supposition sur le passé.'),
          'Tarek ist noch nicht da. Er [[1]] den Zug [[2]] [[3]]. · Die Straße ist nass. Es [[4]] in der Nacht [[5]] [[6]].',
          [['wird'], ['verpasst'], ['haben'], ['wird'], ['geregnet'], ['haben']],
          'Mit dem Futur II vermutet man, was wahrscheinlich schon passiert ist: Er wird den Zug verpasst haben = Er hat ihn wahrscheinlich verpasst. „Verpassen“ und „regnen“ bilden das Perfekt mit „haben“. Oft steht noch „wohl“ oder „sicher“ dabei. [fr?] Comme « il aura raté son train », « il aura plu ».'),
        'werden', 'verpassen', null, 'werden', 'regnen'),
        hints(fill('q3', aide('„haben“ oder „sein“? Ergänzen Sie.', '« haben » ou « sein » ? Complétez.'),
          'Wenn wir ankommen, wird der Vortrag schon [[1]] [[2]]. · Bis du zurückkommst, werde ich längst [[3]] [[4]].',
          [['angefangen'], ['haben'], ['eingeschlafen'], ['sein']],
          'Das Hilfsverb im Futur II ist dasselbe wie im Perfekt: Der Vortrag hat angefangen → wird angefangen haben; ich bin eingeschlafen → werde eingeschlafen sein. Verben der Zustandsveränderung wie einschlafen, ausziehen, ankommen bilden das Perfekt mit „sein“. [fr?] Même auxiliaire qu’au Perfekt : hat angefangen, ist eingeschlafen.'),
        'anfangen', null, 'einschlafen'),
        order('q4', C2.ordnen, [['Bis', 'die Anlage', 'Strom', 'liefert,', 'werden', 'wir', 'sieben Jahre lang', 'geplant', 'haben.']],
          'Der Nebensatz mit „bis“ steht vorn, sein Verb „liefert“ am Ende. Danach beginnt der Hauptsatz mit dem konjugierten „werden“, es folgt das Subjekt „wir“; Partizip II und „haben“ schließen die Satzklammer am Ende. [fr?] Subordonnée, puis verbe conjugué, sujet, et participe + haben à la fin.'),
        order('q5', C2.ordnen, [['Auch wenn', 'die Anlage', 'zunächst', 'teuer', 'ist,', 'lohnt', 'sie', 'sich', 'auf lange Sicht.'],
          ['Auch wenn', 'zunächst', 'die Anlage', 'teuer', 'ist,', 'lohnt', 'sie', 'sich', 'auf lange Sicht.']],
          'Konzessiver Nebensatz: „Auch wenn“ + Subjekt … Verb am Ende („ist“). Der Hauptsatz beginnt direkt nach dem Komma mit dem Verb („lohnt“), dann folgen das Subjektpronomen „sie“ und das Reflexivpronomen „sich“. [fr?] Après la subordonnée, le verbe principal vient en premier.'),
        choice('q6', aide('Welcher Satz ist richtig?', 'Quelle phrase est correcte ?'),
          [['Selbst wenn es morgen regnet, die Demonstration findet statt.'],
            ['Selbst wenn es morgen regnet, findet die Demonstration statt.', true],
            ['Selbst wenn regnet es morgen, findet die Demonstration statt.'],
            ['Selbst wenn es morgen regnet, so die Demonstration stattfindet.']],
          'Im Nebensatz steht das Verb am Ende („regnet“), im folgenden Hauptsatz an erster Stelle („findet … statt“). Der erste Satz übernimmt die französische Wortstellung mit dem Subjekt vor dem Verb, der dritte stellt das Verb im Nebensatz nach vorn, der vierte setzt das Verb nach „so“ ans Ende. [fr?] Le calque du français (sujet avant le verbe) est l’erreur la plus fréquente.'),
        choice('q7', aide('Welche Fortsetzung ist richtig? „Selbst wenn wir heute alle Ölheizungen austauschen würden, …“', 'Quelle suite est correcte ?'),
          [['… hätten wir die Klimaziele damit noch nicht erreicht.', true],
            ['… haben wir die Klimaziele damit schon erreicht.'],
            ['… weil wir die Klimaziele damit nicht erreichen.'],
            ['… wir hätten die Klimaziele damit noch nicht erreicht.']],
          '„Selbst wenn“ mit Konjunktiv II („austauschen würden“) beschreibt einen gedachten Fall. Der Hauptsatz steht deshalb auch im Konjunktiv II und beginnt mit dem Verb: „hätten wir … erreicht“. In der letzten Fortsetzung fehlt die Inversion, die zweite passt nicht zur Konzession, die dritte ist kein Hauptsatz. [fr?] Hypothèse : Konjunktiv II des deux côtés, verbe en tête de la principale.'),
        match('q8', aide('Welche Sätze bedeuten dasselbe? Ordnen Sie zu.', 'Quelles phrases ont le même sens ? Associez.'),
          [['Auch wenn es teuer ist, machen wir mit.', 'Es ist zwar teuer, aber wir machen mit.'],
            ['Er wird den Termin vergessen haben.', 'Wahrscheinlich hat er den Termin vergessen.'],
            ['Bis Freitag werde ich den Bericht geschrieben haben.', 'Spätestens am Freitag ist mein Bericht fertig.'],
            ['Wir stimmen zu, wenngleich wir Bedenken haben.', 'Wir haben Bedenken. Dennoch stimmen wir zu.']],
          '„Zwar … aber“, „dennoch“ und „trotzdem“ drücken den Gegensatz im Hauptsatz aus, „auch wenn“ und „wenngleich“ im Nebensatz. Das Futur II bedeutet je nach Kontext Vermutung (er wird vergessen haben = wahrscheinlich hat er vergessen) oder Abschluss bis zu einem Zeitpunkt (bis Freitag … geschrieben haben). [fr?] Même sens, autres moyens : connecteurs de principale ou subordonnants.'),
        fill('q9', aide('Ergänzen Sie das passende Wort.', 'Complétez avec le mot qui convient.'),
          '[[1]] die Wärmepumpe teuer ist, lohnt sie sich. · Die Wärmepumpe ist teuer. [[2]] lohnt sie sich. · Die Wärmepumpe ist [[3]] teuer, aber sie lohnt sich.',
          [['Obwohl', 'Auch wenn', 'Wenngleich', 'Obgleich', 'Selbst wenn'], ['Trotzdem', 'Dennoch'], ['zwar']],
          'Nebensatz mit dem Verb am Ende: obwohl, auch wenn, wenngleich, obgleich. Adverb im Hauptsatz mit dem Verb direkt danach: trotzdem, dennoch. Zweiteiliger Konnektor: zwar …, aber … [fr?] bien que / même si → subordonnée ; pourtant → trotzdem ; certes … mais → zwar … aber.'),
        choice('q10', aide('Welcher Satz ist richtig und klingt natürlich?', 'Quelle phrase est correcte et naturelle ? (« Quand j’aurai fini le rapport, je t’appellerai. »)'),
          [['Wenn ich den Bericht fertig geschrieben haben werde, ich werde dich anrufen.'],
            ['Als ich den Bericht fertig geschrieben hatte, rufe ich dich an.'],
            ['Wenn ich den Bericht fertig geschrieben habe, rufe ich dich an.', true],
            ['Wenn ich den Bericht fertig schreibe, ich rufe dich dann an.']],
          'Nach dem zeitlichen „wenn“ steht für eine abgeschlossene Handlung in der Zukunft das Perfekt, im Hauptsatz das Präsens: „Wenn ich … geschrieben habe, rufe ich dich an.“ Das französische Futur antérieur übersetzt man hier nicht mit dem Futur II. In der ersten und vierten Antwort fehlt die Inversion, die zweite mischt Vergangenheit und Gegenwart. [fr?] « quand j’aurai fini » = wenn ich fertig bin / … geschrieben habe.'),
      ] },

    // 7 · Lexique
    { id: 'b2-umwelt-wortschatz', kind: 'exercise', title: 'Wortschatz: Klima, Energie und Argumente', estimatedMinutes: 12,
      competences: ['lecture', 'expression-ecrite'],
      lesson: { description: `${aide('Lernen Sie Wörter in Verbindungen: Nomen mit Verb, Wortfamilien und Formulierungen für die Diskussion.', 'Apprenez les mots en contexte : nom et verbe, familles de mots et formules pour débattre.')}

TIPP
[fr?] Conseil
${aide('Viele Verbindungen lassen sich nicht wörtlich übersetzen: Man „äußert“ Bedenken, man „schließt“ einen Kompromiss, man „gibt“ ein Gutachten „in Auftrag“. Lernen Sie sie immer als Block.', 'Ces collocations ne se traduisent pas mot à mot : apprenez-les en bloc.')}` },
      questions: [
        match('q1', aide('Welches Verb passt? Ordnen Sie zu.', 'Quel verbe convient ? Associez.'),
          [['Bedenken', 'äußern'], ['Energie', 'einsparen'], ['einen Kompromiss', 'schließen'], ['auf das Auto', 'verzichten'],
            ['ein Gutachten', 'in Auftrag geben'], ['Nachteile', 'in Kauf nehmen']],
          'Bedenken äußern, Energie einsparen, einen Kompromiss schließen (oder finden), auf etwas verzichten (+ Akkusativ), ein Gutachten in Auftrag geben, Nachteile in Kauf nehmen. Diese Verbindungen sind typisch für Artikel und Diskussionen über Klimaschutz. [fr?] exprimer des réserves, économiser l’énergie, conclure un compromis, renoncer à, commander une expertise, accepter des inconvénients.'),
        fill('q2', aide('Bilden Sie das passende Nomen.', 'Formez le nom correspondant.'),
          'verbrauchen → der [[1]] · sanieren → die [[2]] · fördern → die [[3]] · dämmen → die [[4]] · ausstoßen → der [[5]]',
          [['Verbrauch'], ['Sanierung'], ['Förderung'], ['Dämmung'], ['Ausstoß']],
          'Nomen auf -ung sind feminin: die Sanierung, die Förderung, die Dämmung. Andere entstehen aus dem Verbstamm ohne Endung und sind maskulin: verbrauchen → der Verbrauch, ausstoßen → der Ausstoß (mit ß nach langem o). Solche Nomen sind typisch für Berichte und Statistiken. [fr?] la consommation, la rénovation, la subvention, l’isolation, les émissions.'),
        hints(fill('q3', aide('Ergänzen Sie die Adjektive.', 'Complétez les adjectifs.'),
          'Ein Haus, das unter dem Strich kein CO₂ mehr verursacht, ist [[1]]. · Ein Produkt, das der Umwelt kaum schadet, ist [[2]]. · Einwegplastik ist [[3]]. · Energie aus Sonne und Wind ist [[4]].',
          [['klimaneutral'], ['umweltfreundlich', 'umweltschonend'], ['umweltschädlich'], ['erneuerbar']],
          '-neutral: unter dem Strich weder Plus noch Minus (klimaneutral); -freundlich oder -schonend: positiv für die Umwelt; -schädlich: negativ. „Erneuerbar“ kommt von „erneuern“: Die Quelle geht nicht zu Ende. [fr?] neutre en carbone, écologique, nocif pour l’environnement, renouvelable.'),
        'klima…', 'umwelt…', 'umwelt…', 'erneuern'),
        choice('q4', aide('Sie wollen einem Argument teilweise zustimmen und dann widersprechen. Was passt?', 'Vous voulez approuver en partie un argument, puis le contredire. Que dites-vous ?'),
          [['Da haben Sie völlig recht, dazu gibt es nichts mehr zu sagen.'],
            ['Da ist durchaus etwas dran, allerdings übersehen Sie einen Punkt.', true],
            ['Das stimmt überhaupt nicht, Sie haben das Problem nicht verstanden.'],
            ['Das kann sein, und deshalb bin ich ganz Ihrer Meinung.']],
          '„Da ist (durchaus) etwas dran“ heißt: Das ist teilweise richtig; „allerdings“ leitet die Einschränkung ein. Die erste Antwort stimmt ganz zu, die dritte widerspricht unhöflich und vollständig, die vierte stimmt am Ende doch zu. Das Muster „Zustimmung + Einschränkung“ wirkt sachlich und überzeugend. [fr?] « Il y a du vrai, toutefois… » : concéder puis nuancer.'),
        choice('q5', aide('Welcher Satz drückt eine vorsichtige Prognose aus?', 'Quelle phrase exprime une prévision prudente ?'),
          [['Die Strompreise sind im letzten Jahr deutlich gestiegen.'],
            ['Die Strompreise müssen sofort und deutlich gesenkt werden.'],
            ['Es ist damit zu rechnen, dass die Strompreise weiter steigen.', true],
            ['Die Strompreise steigen, weil die Nachfrage nach Strom ständig wächst.']],
          '„Es ist damit zu rechnen, dass …“ (= Man muss erwarten, dass …) formuliert eine begründete Prognose, ohne sie als sichere Tatsache hinzustellen. Ähnlich: „Fachleute gehen davon aus, dass …“. Die anderen Sätze berichten über die Vergangenheit, stellen eine Forderung auf oder erklären eine Ursache. [fr?] « Il faut s’attendre à ce que… » : prévision prudente.'),
        choice('q6', aide('Was bedeutet „etwas in Kauf nehmen“?', 'Que signifie « etwas in Kauf nehmen » ?'),
          [['etwas im Geschäft kaufen, obwohl es eigentlich zu teuer ist'],
            ['einen Nachteil akzeptieren, um ein wichtigeres Ziel zu erreichen', true],
            ['sich öffentlich und laut über einen Nachteil beschweren'],
            ['für eine größere Anschaffung einen Kredit aufnehmen']],
          '„Höhere Kosten in Kauf nehmen“ heißt: Man akzeptiert sie bewusst, weil das Ziel wichtiger ist. Mit „kaufen“ im wörtlichen Sinn hat der Ausdruck nichts zu tun. Beispiel: „Für sauberen Strom nehmen wir den Anblick der Windräder in Kauf.“ [fr?] accepter un inconvénient en connaissance de cause.'),
        match('q7', aide('Was bedeuten die Wörter? Ordnen Sie zu.', 'Que signifient ces mots ? Associez.'),
          [['auf lange Sicht', 'langfristig'], ['ohnehin', 'sowieso'], ['schrittweise', 'nach und nach'], ['längst', 'schon lange'],
            ['spätestens', 'nicht später als']],
          'Diese Ausdrücke strukturieren Argumente und Prognosen: „Auf lange Sicht lohnt es sich“, „Die Heizung muss ohnehin ersetzt werden“, „Der Preis steigt schrittweise“, „Ich werde längst ausgezogen sein“, „spätestens 2045“. [fr?] à long terme, de toute façon, progressivement, depuis longtemps, au plus tard.'),
      ] },

    // 8 · -hoeren2 : écoute authentique écrite par le lot M2 (_media.mjs, insérée après -wortschatz, 15 min).

    // 9 · Vérifier
    { id: 'b2-umwelt-kontrolle', kind: 'exercise', title: 'Prüfen: Prognosen, Vermutungen und Einwände', estimatedMinutes: 14,
      competences: ['lecture', 'ecoute'],
      lesson: { description: `${aide('Prüfen Sie, was Sie in diesem Modul gelernt haben: Hören, Grammatik und Wortschatz.', 'Vérifiez ce que vous avez appris dans ce module : écoute, grammaire et vocabulaire.')}

${aide('Einige Wochen nach der Sendung hat Krähenbrück abgestimmt. Hören Sie die Kurzmeldung für die Fragen 1 und 2.', 'Quelques semaines après l’émission, Krähenbrück a voté. Écoutez la brève pour les questions 1 et 2.')}` },
      placements: [{ media: 'b2-umwelt-kontrolle-audio', caption: 'Kurzmeldung aus Krähenbrück' }],
      questions: [
        choice('q1', aide('Wie ist die Befragung ausgegangen?', 'Quel est le résultat de la consultation ?'),
          [['Eine knappe Mehrheit hat sich gegen den Windpark ausgesprochen.'],
            ['Fast zwei Drittel waren für eine Beteiligung der Gemeinde.', true],
            ['Einundsiebzig Prozent waren für eine Beteiligung der Gemeinde.'],
            ['Die Befragung wurde wegen zu geringer Beteiligung verschoben.']],
          '„Fast zwei Drittel der Teilnehmenden“ waren dafür. Die 71 Prozent beziehen sich auf die Zahl der Wahlberechtigten, die überhaupt abgestimmt haben – eine typische Falle beim Hören von Zahlen. [fr?] 71 % = taux de participation ; près de deux tiers = les voix pour.'),
        choice('q2', aide('Wie reagiert die Bürgerinitiative?', 'Comment réagit l’initiative citoyenne ?'),
          [['Sie will gegen das Ergebnis der Befragung vor Gericht ziehen.'],
            ['Sie löst sich auf, weil sie ihr eigentliches Ziel inzwischen erreicht hat.'],
            ['Sie fordert eine zweite Abstimmung im kommenden Frühjahr.'],
            ['Sie akzeptiert das Ergebnis, hält aber an einer Forderung fest.', true]],
          '„… das Ergebnis zu akzeptieren, auch wenn sie weiterhin einen größeren Abstand zu den Häusern fordert“: Sie nimmt das Ergebnis an, gibt ihre Forderung aber nicht auf. „Auch wenn“ leitet den Gegengrund ein. [fr?] Elle accepte le résultat tout en maintenant sa revendication.'),
        hints(fill('q3', aide('Ergänzen Sie die Vermutung im Futur II.', 'Complétez la supposition au Futur II.'),
          'Herr Hagemeister war am Sonntag nicht im Wahllokal. Er [[1]] wohl schon per Brief [[2]] [[3]].',
          [['wird'], ['abgestimmt'], ['haben']],
          'Vermutung über Vergangenes: werden + Partizip II + haben. „Abstimmen“ bildet das Perfekt mit „haben“ (er hat abgestimmt); beim trennbaren Verb steht „-ge-“ in der Mitte: abgestimmt. „Wohl“ verstärkt die Vermutung. [fr?] « Il aura sans doute déjà voté par correspondance. »'),
        'werden', 'abstimmen'),
        order('q4', C2.ordnen, [['Die Initiative', 'akzeptiert', 'das Ergebnis,', 'auch wenn', 'sie', 'weiterhin', 'einen größeren Abstand', 'fordert.'],
          ['Die Initiative', 'akzeptiert', 'das Ergebnis,', 'auch wenn', 'sie', 'einen größeren Abstand', 'weiterhin', 'fordert.']],
          'Zuerst der Hauptsatz (Verb an Position 2), dann der Nebensatz mit „auch wenn“: das Subjekt „sie“ direkt nach der Konjunktion, das Verb „fordert“ am Ende. „Weiterhin“ steht meist vor der Ergänzung, kann aber auch danach stehen. [fr?] Principale, puis subordonnée concessive avec le verbe à la fin.'),
        choice('q5', aide('Welcher Satz drückt eine Vermutung über die Vergangenheit aus?', 'Quelle phrase exprime une supposition sur le passé ?'),
          [['Die Gemeinde wird jeden Monat über die Planung informieren.'],
            ['Viele Einwohner werden das Ergebnis in der Zeitung gelesen haben.', true],
            ['Im Herbst wird die Genossenschaft die ersten Anteile verkaufen.'],
            ['Die Bürgermeisterin würde gern schon früher mit dem Bau beginnen.']],
          'Nur dieser Satz verbindet das Futur II (werden … gelesen haben) mit einer Vermutung: Wahrscheinlich haben viele es gelesen. Zwei Sätze stehen im Futur I (Plan, Vorhersage), einer im Konjunktiv II (Wunsch). [fr?] « auront lu » = ont probablement lu.'),
        fill('q6', aide('Ergänzen Sie das passende Wort aus dem Modul.', 'Complétez avec le mot du module qui convient.'),
          'Wenn Einwohner bei einem Projekt mitreden und mitentscheiden dürfen, spricht man von [[1]]. · Wer Geld investiert, möchte, dass sich die Investition auf lange Sicht [[2]].',
          [['Bürgerbeteiligung', 'Beteiligung'], ['lohnt', 'auszahlt', 'rechnet']],
          '„Die Bürgerbeteiligung“: Einwohner reden mit und entscheiden mit. „Sich lohnen“, „sich auszahlen“ und „sich rechnen“ bedeuten alle: finanziell vorteilhaft sein; alle drei Verben sind reflexiv. [fr?] la participation citoyenne ; être rentable.'),
        choice('q7', aide('Ein Nachbar sagt: „Windräder zerstören unsere Landschaft.“ Welche Reaktion passt in einer sachlichen Diskussion am besten?', 'Quelle réaction convient le mieux dans un débat posé ?'),
          [['Auch wenn sich das Landschaftsbild verändert, profitiert der ganze Ort von den Einnahmen.', true],
            ['Das stimmt einfach nicht, und darüber möchte ich mit Ihnen auch gar nicht diskutieren.'],
            ['Selbst wenn die Landschaft schön ist, haben Sie mit Ihrem Einwand völlig recht.'],
            ['Die Landschaft ist mir ehrlich gesagt völlig egal, Hauptsache billiger Strom für alle hier.']],
          'Die erste Antwort erkennt den Einwand an („auch wenn sich das Landschaftsbild verändert“) und setzt ein Gegenargument dagegen – typisch für eine sachliche Diskussion. Die zweite verweigert das Gespräch, die dritte ist unlogisch (der Gegengrund passt nicht), die vierte wertet ab. [fr?] Concéder, puis contre-argumenter.'),
      ] },
  ],
};
