// Module B2 n° 22 · atelier « Kultur » (lot R8, thème 11) : critiquer et présenter une œuvre. Modèle annoté (critique de
// film écrite et présentation orale d'un album), réagir aux avis d'un cercle de lecture, médiation du français vers
// l'allemand (présenter un film à un ami d'après une critique française), erreurs typiques, entraînement au format Lesen
// et Hören (critique d'exposition, puis interview de la photographe), deux missions sur grille B2 : critique pour un blog
// culturel et exposé « une œuvre qui m'a marqué(e) ».
// Textes, dialogues et exercices originaux LinguaCap (œuvres, artistes et personnages fictifs).
import { aide, C2, choice, fill, order, match, speakB2, GRIDS } from '../../lib.mjs';

/** « Richtig / falsch / steht nicht im Text » : r, f ou n pour la bonne réponse. */
const rf = (id, statement, answer, explanation) => choice(id, `„${statement}“ ${C2.richtigFalsch}`,
  [['richtig', answer === 'r'], ['falsch', answer === 'f'], ['steht nicht im Text', answer === 'n']], explanation);

export default {
  id: 'b2-kultur-atelier',
  title: 'Kultur – Werkstatt: Werke vorstellen und bewerten',
  objective: 'Écrire une critique structurée et nuancée, présenter oralement une œuvre, réagir aux avis d’un cercle de lecture, présenter en allemand un film d’après une critique française et s’entraîner à comprendre une critique et une interview d’artiste.',
  grammarFocus: [],
  sources: ['Textes, dialogues et exercices originaux LinguaCap (œuvres, artistes et personnages fictifs).'],

  vocabulary: [
    { word: 'Im Mittelpunkt steht …', partOfSpeech: 'expression', translation: 'Au centre (de l’histoire), il y a…',
      example: 'Im Mittelpunkt steht ein zwölfjähriges Mädchen.', note: null },
    { word: 'Die Handlung spielt in …', partOfSpeech: 'expression', translation: 'L’action se déroule à / dans…',
      example: 'Die Handlung spielt in einem Dorf an der Küste.', note: null },
    { word: 'Besonders gelungen ist …', partOfSpeech: 'expression', translation: 'Ce qui est particulièrement réussi, c’est…',
      example: 'Besonders gelungen ist die Kameraarbeit.', note: 'gelungen : réussi' },
    { word: 'überzeugen durch', partOfSpeech: 'verb', translation: 'convaincre par',
      example: 'Die Hauptdarstellerin überzeugt durch ihr natürliches Spiel.', note: '+ accusatif' },
    { word: 'Weniger überzeugend ist dagegen …', partOfSpeech: 'expression', translation: 'Moins convaincant, en revanche, est…',
      example: 'Weniger überzeugend ist dagegen das Drehbuch.', note: 'pour nuancer après un éloge' },
    { word: 'Trotz dieser Schwächen …', partOfSpeech: 'expression', translation: 'Malgré ces faiblesses…',
      example: 'Trotz dieser Schwächen ist der Film sehenswert.', note: 'trotz + génitif' },
    { word: 'sehenswert', partOfSpeech: 'adjective', translation: 'qui vaut la peine d’être vu',
      example: 'Die Ausstellung ist absolut sehenswert.', note: 'aussi : lesenswert, hörenswert' },
    { word: 'sich etwas nicht entgehen lassen', partOfSpeech: 'expression', translation: 'ne pas manquer quelque chose',
      example: 'Wer ruhige Filme mag, sollte sich diesen Film nicht entgehen lassen.', note: 'sich (datif)' },
    { word: 'Drehbuch', article: 'das', plural: 'Drehbücher', partOfSpeech: 'noun', translation: 'le scénario',
      example: 'Das Drehbuch hat in der zweiten Hälfte Schwächen.', note: null },
    { word: 'Kameraarbeit', article: 'die', plural: null, partOfSpeech: 'noun', translation: 'le travail de la caméra, la photographie (d’un film)',
      example: 'Die Kameraarbeit ist das Beste an diesem Film.', note: 'sans pluriel' },
    { word: 'Untertitel', article: 'der', plural: 'Untertitel', partOfSpeech: 'noun', translation: 'le sous-titre',
      example: 'Der Film läuft im Original mit Untertiteln.', note: 'im Original mit Untertiteln (OmU) : en VOST' },
    { word: 'Ausstellung', article: 'die', plural: 'Ausstellungen', partOfSpeech: 'noun', translation: 'l’exposition',
      example: 'Die Ausstellung läuft noch bis zum 15. März.', note: null },
    { word: 'eindringlich', partOfSpeech: 'adjective', translation: 'saisissant, pénétrant',
      example: 'Gerade ihre Zurückhaltung macht die Bilder so eindringlich.', note: null },
    { word: 'sich lohnen', partOfSpeech: 'verb', translation: 'valoir la peine',
      example: 'Der Film lohnt sich, auch wenn das Ende schwach ist.', note: 'es lohnt sich, … zu …' },
    { word: 'jemanden prägen', partOfSpeech: 'verb', translation: 'marquer quelqu’un (durablement)',
      example: 'Manche Bücher können einen Menschen ein Leben lang prägen.', note: 'die Prägung' },
  ],

  media: [
    { key: 'b2-kultur-atelier-modell-audio', kind: 'audio', title: 'Modèle : présenter oralement un album',
      script: [
        { voice: 'mann3', name: 'Malik', text: 'Ich möchte Ihnen heute ein Album vorstellen, das mich seit fast zehn Jahren begleitet: „Zwischenräume“ von der Liedermacherin Ilka Brandner. Ich habe es zum ersten Mal gehört, als ich gerade nach Deutschland gekommen war und kaum jemanden kannte.' },
        { voice: 'mann3', name: 'Malik', text: 'Das Album besteht aus zwölf ruhigen Liedern, fast nur mit Gitarre und Stimme. Es geht um Abschiede, um Neuanfänge und um die Frage, wo man eigentlich zu Hause ist. Besonders gelungen finde ich die Texte: Sie sind einfach, aber nie banal.' },
        { voice: 'mann3', name: 'Malik', text: 'Für mich persönlich war das Album auch ein Deutschkurs. Ich habe die Texte so lange gehört, bis ich jedes Wort verstanden habe. Ein kleiner Kritikpunkt: In der zweiten Hälfte klingen manche Lieder recht ähnlich.' },
        { voice: 'mann3', name: 'Malik', text: 'Trotzdem kann ich „Zwischenräume“ allen empfehlen, die gern genau zuhören. Am besten abends, mit Kopfhörern. Vielen Dank fürs Zuhören.' },
      ] },
    { key: 'b2-kultur-atelier-diskussion-a1', kind: 'audio', title: 'Avis 1',
      script: [{ voice: 'frau2', name: 'Wiebke', text: 'Ich fand das Buch ehrlich gesagt total langweilig. Da passiert ja zweihundert Seiten lang fast gar nichts.' }] },
    { key: 'b2-kultur-atelier-diskussion-a2', kind: 'audio', title: 'Avis 2',
      script: [{ voice: 'mann2', name: 'Herr Sander', text: 'Verfilmungen sind doch grundsätzlich schlechter als die Bücher. Das ist einfach so.' }] },
    { key: 'b2-kultur-atelier-diskussion-a3', kind: 'audio', title: 'Avis 3',
      script: [{ voice: 'frau3', name: 'Frau Orlova', text: 'Kultur ist doch Luxus. Wenn die Stadt sparen muss, sollte sie zuerst beim Theater sparen.' }] },
    { key: 'b2-kultur-atelier-diskussion-a4', kind: 'audio', title: 'Avis 4',
      script: [{ voice: 'mann3', name: 'Benno', text: 'Ich habe das Ende, glaube ich, nicht ganz verstanden. Versöhnen sich die Geschwister nun oder nicht?' }] },
    { key: 'b2-kultur-atelier-mediation-nachricht', kind: 'image', title: 'Message de Clemens',
      alt: 'Message de Clemens : il demande si le film « Les Jours de sel » vaut la peine ; il n’aime pas les films violents, ne supporte plus les films longs le soir et a besoin de sous-titres.',
      image: { layout: 'messages', icon: 'message-square', title: 'Clemens', subtitle: 'Französische Filmwoche',
        messages: [
          { from: 'Clemens', time: '19:42', text: 'Hey! Nächste Woche läuft bei der Französischen Filmwoche „Les Jours de sel“. Lohnt sich das? Du kannst doch Französisch, vielleicht findest du eine Kritik.' },
          { from: 'Clemens', time: '19:43', text: 'Drei Dinge, du kennst mich ja: Ich mag keine brutalen Filme, lange Filme schaffe ich abends nicht mehr, und mein Französisch reicht ohne Untertitel nicht.' },
        ] } },
    { key: 'b2-kultur-atelier-pruefung-rezension', kind: 'image', title: 'Critique de l’exposition « Spuren im Sand »',
      alt: 'Critique d’une exposition de photographies en noir et blanc sur une côte qui recule : éloge des images, réserves sur l’accrochage et la présentation des textes des habitants.',
      image: { layout: 'article', kicker: 'Ausstellung', icon: 'camera', title: '„Spuren im Sand“: Edda Holm fotografiert das Verschwinden',
        lead: 'Was bleibt von einer Küste, die jedes Jahr ein paar Meter verliert? Die Fotografin Edda Holm ist dieser Frage drei Jahre lang nachgegangen.',
        paragraphs: ['Das Ergebnis ist jetzt im Kunstverein Wendelstedt zu sehen: 46 großformatige Schwarz-Weiß-Aufnahmen von der Nordseeküste, dazu kurze Texte von Menschen, die dort leben.'] } },
    { key: 'b2-kultur-atelier-pruefung-interview', kind: 'audio', title: 'Interview de la photographe Edda Holm',
      script: [
        { voice: 'sprecher', name: 'Moderator', text: 'Frau Holm, Ihre Ausstellung „Spuren im Sand“ zeigt die Nordseeküste ausschließlich in Schwarz-Weiß. Warum eigentlich keine Farbe?' },
        { voice: 'frau3', name: 'Edda Holm', text: 'Farbe ist an der Küste unglaublich verführerisch: der Sonnenuntergang, das blaue Wasser. Aber genau das lenkt ab. Ich wollte, dass man auf die Formen schaut, auf das, was fehlt. In Schwarz-Weiß wirken die Bilder außerdem zeitlos. Man weiß nicht genau, ob sie gestern oder vor fünfzig Jahren entstanden sind.' },
        { voice: 'sprecher', name: 'Moderator', text: 'Drei Jahre haben Sie an dem Projekt gearbeitet. Wie muss man sich das vorstellen?' },
        { voice: 'frau3', name: 'Edda Holm', text: 'Ich habe mir zwölf Orte ausgesucht und jeden davon viermal im Jahr besucht, in jeder Jahreszeit einmal, und zwar immer frühmorgens, wenn noch niemand unterwegs ist. So konnte ich zeigen, wie sich derselbe Ort verändert. Manchmal war ein Weg, den ich im Frühling fotografiert hatte, im Herbst einfach nicht mehr da.' },
        { voice: 'sprecher', name: 'Moderator', text: 'Neben den Fotos gibt es Texte von Menschen, die an der Küste leben.' },
        { voice: 'frau3', name: 'Edda Holm', text: 'Ja, und ehrlich gesagt waren mir diese Gespräche am Ende genauso wichtig wie die Bilder. Ein Fischer hat mir erzählt, dass sein Großvater noch Kühe auf einer Wiese gehütet hat, wo heute Wasser ist. So etwas kann ein Foto allein nicht erzählen.' },
        { voice: 'sprecher', name: 'Moderator', text: 'Ein Kritiker hat bemängelt, dass diese Texte in der Ausstellung etwas untergehen.' },
        { voice: 'frau3', name: 'Edda Holm', text: 'Da hat er leider recht. Der Platz war knapp, und wir haben uns für die Fotos entschieden. Für die nächste Station der Ausstellung drucken wir die Texte größer und hängen sie direkt neben die Bilder.' },
        { voice: 'sprecher', name: 'Moderator', text: 'Was sollen die Besucherinnen und Besucher mitnehmen?' },
        { voice: 'frau3', name: 'Edda Holm', text: 'Ich möchte niemanden belehren. Es gibt genug Zahlen und Warnungen. Ich wünsche mir, dass die Leute einfach länger hinschauen als sonst und sich selbst fragen, was sie verlieren würden. Wenn das passiert, habe ich mein Ziel erreicht.' },
      ] },
  ],

  activities: [
    // 1 · Modèle annoté
    { id: 'b2-kultur-atelier-modell', kind: 'lesson', title: 'Modell: eine Filmkritik und eine mündliche Werkvorstellung', estimatedMinutes: 12,
      competences: ['lecture', 'ecoute'],
      lesson: { description: `MODELL 1: EINE FILMKRITIK
${aide('Lesen Sie die Kritik aus einem Kulturblog. Achten Sie darauf, wie die Autorin informiert, bewertet und einschränkt.', 'Lisez la critique d’un blog culturel ; observez comment l’autrice informe, évalue et nuance.')}

WENN DAS LICHT AUSGEHT – „SOMMER OHNE STROM“ VON SANNA RITTER
Was passiert, wenn in einem Dorf eine Woche lang der Strom ausfällt? Diese Frage stellt die Regisseurin Sanna Ritter in ihrem zweiten Spielfilm „Sommer ohne Strom“, der seit Kurzem in den Kinos läuft.
Im Mittelpunkt steht die zwölfjährige Lotta, die mit ihrer Mutter gerade erst aufs Land gezogen ist. Als nach einem Unwetter alle Leitungen unterbrochen sind, muss das ganze Dorf improvisieren: Man kocht gemeinsam auf dem Dorfplatz, teilt das Wasser und erzählt sich abends Geschichten. Lotta, die bisher nur über ihr Handy mit der Welt verbunden war, entdeckt dabei ihre Nachbarn.
Besonders gelungen ist die Kameraarbeit: Die Nachtszenen, nur von Kerzen und Taschenlampen beleuchtet, gehören zu den schönsten Bildern dieses Kinojahres. Auch die junge Hauptdarstellerin überzeugt durch ihr natürliches Spiel. Weniger überzeugend ist dagegen das Drehbuch in der zweiten Hälfte: Die Konflikte zwischen den Dorfbewohnern lösen sich zu schnell auf, und manche Figuren bleiben blass.
Trotz dieser Schwächen ist „Sommer ohne Strom“ ein warmherziger Film, der zum Nachdenken darüber anregt, was wir wirklich brauchen. Wer ruhige Filme mag, sollte ihn sich nicht entgehen lassen, am besten auf der großen Leinwand.

AUFBAU
1. Einleitung: Titel, Gattung, Regie oder Autor und ein Aufhänger, zum Beispiel eine Frage. [fr?] Introduction : titre, genre, auteur et une accroche.
2. Inhalt: kurz, im Präsens, ohne das Ende zu verraten. [fr?] Résumé bref, au présent, sans dévoiler la fin.
3. Bewertung: Stärken mit konkreten Beispielen. [fr?] Points forts avec des exemples.
4. Einschränkung: Schwächen sachlich nennen. [fr?] Points faibles, formulés avec mesure.
5. Fazit und Empfehlung: Für wen lohnt sich das Werk? [fr?] Conclusion et recommandation : pour qui ?

VORSTELLEN
• … erzählt von … · Im Mittelpunkt steht … · Die Handlung spielt in …
BEWERTEN
• Besonders gelungen ist … · … überzeugt durch … · … gehört zu den schönsten …
EINSCHRÄNKEN
• Weniger überzeugend ist dagegen … · Ein kleiner Schwachpunkt ist … · Trotz dieser Schwächen …
EMPFEHLEN
• Wer … mag, sollte sich … nicht entgehen lassen. · … ist sehenswert / lesenswert / hörenswert.

MODELL 2: EIN WERK MÜNDLICH VORSTELLEN
${aide('Hören Sie, wie Malik ein Album vorstellt, das ihn geprägt hat. Sein Vortrag folgt fünf Schritten: Werk und persönlicher Anlass, Inhalt und Besonderheit, persönliche Bedeutung, ein Kritikpunkt, Empfehlung.', 'Écoutez Malik présenter un album qui l’a marqué : œuvre et occasion, contenu, sens personnel, réserve, recommandation.')}` },
      placements: [{ media: 'b2-kultur-atelier-modell-audio', caption: 'Malik stellt ein Album vor' }] },

    // 2 · Discussion : réagir aux avis d'un cercle de lecture
    { id: 'b2-kultur-atelier-diskussion', kind: 'exercise', title: 'Diskutieren: im Lesekreis Meinungen begegnen', estimatedMinutes: 12,
      competences: ['ecoute', 'expression-orale'],
      lesson: { description: `${C2.argument}

SITUATION
Im Lesekreis der Stadtbibliothek sprechen die Mitglieder über den Roman „Nachtfähre“ und seine Verfilmung. Vier Personen äußern sich. [fr?] Au cercle de lecture de la bibliothèque, quatre personnes donnent leur avis sur un roman et son adaptation.
${aide('Hören Sie jede Äußerung und wählen Sie die Reaktion, die zur genannten Absicht passt. Sprechen Sie danach die vier Reaktionen laut nach.', 'Écoutez chaque avis, choisissez la réaction qui correspond à l’intention indiquée, puis répétez les quatre réactions.')}` },
      placements: [
        { media: 'b2-kultur-atelier-diskussion-a1', questionId: 'q1', transcriptVisibility: 'after_answer' },
        { media: 'b2-kultur-atelier-diskussion-a2', questionId: 'q2', transcriptVisibility: 'after_answer' },
        { media: 'b2-kultur-atelier-diskussion-a3', questionId: 'q3', transcriptVisibility: 'after_answer' },
        { media: 'b2-kultur-atelier-diskussion-a4', questionId: 'q4', transcriptVisibility: 'after_answer' },
      ],
      questions: [
        choice('q1', aide('Äußerung 1: Sie sehen das anders. Wie widersprechen Sie mit einer Begründung?', 'Vous n’êtes pas d’accord : comment contredire en justifiant ?'),
          [['Langweilig? Dann hast du das Buch wohl gar nicht richtig bis zum Ende gelesen.'],
            ['Stimmt, nach zwanzig Seiten habe ich es auch weggelegt.'],
            ['Das sehe ich anders: Gerade die ruhigen Kapitel bereiten das Ende vor.', true],
            ['Über Geschmack lässt sich nicht streiten, also lassen wir das.']],
          aide('„Das sehe ich anders“ widerspricht höflich, und der Doppelpunkt kündigt die Begründung an: Die ruhigen Kapitel haben eine Funktion. Die erste Antwort greift die Person an, statt zu argumentieren; die zweite stimmt zu; die vierte beendet die Diskussion.',
            'Contredire poliment et justifier ; ne pas attaquer la personne.')),
        choice('q2', aide('Äußerung 2: Sie möchten die Verallgemeinerung relativieren. Was sagen Sie?', 'Vous voulez nuancer cette généralisation. Que dites-vous ?'),
          [['Nicht immer: Manche Filme machen aus einer schwachen Vorlage etwas Besonderes.', true],
            ['Genau, deshalb gehe ich grundsätzlich nie mehr ins Kino, wenn ich das Buch kenne.'],
            ['Das ist eine Frechheit, so etwas darf man über Filme wirklich nicht sagen.'],
            ['Bücher sind doch immer und ohne Ausnahme schlechter als ihre Verfilmungen.']],
          aide('Gegen „grundsätzlich“ und „einfach so“ hilft ein Gegenbeispiel: „Nicht immer: Manche Filme …“. So zeigt man, dass die Regel nicht für alle Fälle gilt. Die letzte Antwort ersetzt eine Verallgemeinerung nur durch eine andere.',
            'Relativiser une généralisation par un contre-exemple (« Nicht immer: … »).')),
        choice('q3', aide('Äußerung 3: Sie verstehen den Gedanken, haben aber einen Einwand. Was sagen Sie?', 'Vous comprenez l’idée mais avez une objection. Que dites-vous ?'),
          [['Ja, ein Theater braucht heute wirklich niemand mehr, da gebe ich Ihnen völlig recht.'],
            ['Ich verstehe den Gedanken, aber gerade in Krisen braucht man Orte der Begegnung.', true],
            ['Sie haben ja keine Ahnung von Kultur, das merkt man sofort an Ihren Worten.'],
            ['Ob die Stadt spart oder nicht, ist mir eigentlich egal.']],
          aide('„Ich verstehe den Gedanken“ erkennt die Sorge um das Geld an, „aber …“ bringt den Einwand mit einem Argument: Theater ist ein Ort der Begegnung, gerade in schweren Zeiten. Die dritte Antwort ist ein persönlicher Angriff, die erste und die vierte bringen keinen Einwand.',
            'Reconnaître l’idée, puis objecter avec un argument.')),
        choice('q4', aide('Äußerung 4: Benno hat das Ende nicht verstanden. Wie erklären Sie es vorsichtig?', 'Benno n’a pas compris la fin. Comment l’expliquer avec prudence ?'),
          [['Das ist doch ganz klar, das hätte wirklich jeder beim ersten Lesen sofort verstanden.'],
            ['Keine Ahnung, das Ende habe ich auch nicht mehr gelesen.'],
            ['Im Film schon, im Buch bleibt es offen. Die Autorin will wohl, dass wir selbst entscheiden.', true],
            ['Nein, sie sterben am Ende beide auf der Fähre, das steht ganz deutlich auf der letzten Seite.']],
          aide('Die Antwort unterscheidet Film und Buch und formuliert eine Deutung vorsichtig mit „wohl“: Es ist eine Vermutung über die Absicht der Autorin. Die erste Antwort ist herablassend, die zweite hilft nicht, und die vierte erfindet ein Ende, das es nicht gibt.',
            'Expliquer avec prudence : distinguer film et livre, supposer avec « wohl ».')),
        speakB2('q5', 'Das sehe ich anders: Gerade die ruhigen Kapitel bereiten das Ende vor.',
          aide('Betonen Sie „anders“ und „ruhigen“. Nach dem Doppelpunkt eine kurze Pause. „Kapitel“ wird auf der zweiten Silbe betont: ka-PI-tel.',
            'Accentuez anders et ruhigen ; accent sur -PI- dans Kapitel.')),
        speakB2('q6', 'Nicht immer: Manche Filme machen aus einer schwachen Vorlage etwas Besonderes.',
          aide('„Nicht immer“ trägt den Kontrast: Betonen Sie „immer“. In „Besonderes“ liegt der Akzent auf der zweiten Silbe: be-SON-de-res.',
            'Accentuez immer ; accent sur -SON- dans Besonderes.')),
        speakB2('q7', 'Ich verstehe den Gedanken, aber gerade in Krisen braucht man Orte der Begegnung.',
          aide('Nach „Gedanken“ steigt die Stimme leicht, nach dem Komma kommt der Einwand. „Begegnung“ wird auf der zweiten Silbe betont: be-GEG-nung.',
            'Légère montée avant la virgule ; accent sur -GEG- dans Begegnung.')),
        speakB2('q8', 'Im Film schon, im Buch bleibt es offen. Die Autorin will wohl, dass wir selbst entscheiden.',
          aide('Die Modalpartikel „wohl“ bleibt unbetont. Betont sind „Film“, „Buch“ und „selbst“. „Autorin“ trägt den Akzent auf der zweiten Silbe: au-TO-rin.',
            'wohl reste inaccentué ; accent sur Film, Buch, selbst et -TO- dans Autorin.')),
      ] },

    // 3 · Médiation : présenter un film d'après une critique française
    { id: 'b2-kultur-atelier-mediation', kind: 'exercise', title: 'Vermitteln: einen Film nach einer französischen Kritik vorstellen', estimatedMinutes: 16,
      competences: ['lecture', 'expression-ecrite'],
      lesson: { description: `SITUATION
Ihr Freund Clemens spricht kein gutes Französisch. Er möchte wissen, ob sich der Film „Les Jours de sel“ für ihn lohnt. Sie haben eine französische Kritik gefunden und antworten ihm auf Deutsch. [fr?] Votre ami Clemens veut savoir si le film vaut la peine pour lui ; vous lui répondez en allemand d’après une critique française.

DIE KRITIK (AUF FRANZÖSISCH)
« Les Jours de sel » : la douceur d’un été dans les marais
Pour son premier long métrage, Camille Roussel suit pendant un été une famille de paludiers de la côte atlantique, qui récolte le sel comme leurs ancêtres. Le père, fatigué, veut vendre l’exploitation ; sa fille Jeanne, vingt ans, rêve de la reprendre. Peu de dialogues, beaucoup de lumière : la caméra prend le temps de filmer les gestes, le vent, la mer. Les deux acteurs principaux sont remarquables, en particulier la jeune Salomé Kerbrat. On regrettera une fin un peu précipitée et une musique parfois envahissante. Mais ce film lumineux et sans violence, qui parle de transmission entre générations, mérite largement le déplacement. Durée : 1 h 42. En version originale sous-titrée.

${aide('Lesen Sie die Kritik und die Nachricht von Clemens. Machen Sie zuerst Notizen auf Deutsch, wählen Sie dann aus, was für Clemens wichtig ist, und formulieren Sie Ihre Antwort.', 'Lisez la critique et le message de Clemens ; prenez des notes en allemand, choisissez ce qui compte pour lui, puis rédigez votre réponse.')}

TIPP
Bei einer Sprachmittlung übersetzt man nicht Wort für Wort. Man gibt das Wichtigste sinngemäß wieder, und zwar das, was die Person wirklich wissen will. [fr?] En médiation, on ne traduit pas mot à mot : on transmet le sens de ce qui intéresse la personne.` },
      placements: [{ media: 'b2-kultur-atelier-mediation-nachricht', caption: 'Die Nachricht von Clemens' }],
      questions: [
        fill('q1', aide('Machen Sie Notizen auf Deutsch.', 'Prenez des notes en allemand.'),
          'Film „Les Jours de sel“, erster Spielfilm von Camille Roussel · Familie an der Atlantikküste, die [[1]] gewinnt · der Vater will verkaufen, die Tochter will den Betrieb [[2]] · Stärken: wenig Dialoge, schöne Bilder, sehr gute [[3]] · Schwächen: das Ende kommt zu [[4]], die Musik ist manchmal aufdringlich · Länge: 1 Stunde [[5]] Minuten · Fassung: im Original mit [[6]]',
          [['Salz'], ['übernehmen', 'weiterführen', 'fortführen'], ['Schauspieler', 'Darsteller', 'Hauptdarsteller', 'Schauspielerinnen und Schauspieler'],
            ['schnell', 'plötzlich', 'abrupt', 'überstürzt'], ['42', 'zweiundvierzig'], ['Untertiteln']],
          aide('« des paludiers … qui récolte le sel »: Die Familie gewinnt Salz. « reprendre l’exploitation » heißt hier „den Betrieb übernehmen“. « Les deux acteurs principaux sont remarquables » betrifft die Schauspieler. « une fin un peu précipitée »: ein Ende, das zu schnell kommt. « version originale sous-titrée »: im Original mit Untertiteln.',
            'Repérez l’essentiel en français et notez-le en allemand, sans traduire mot à mot.')),
        choice('q2', aide('Welche Informationen beantworten die drei Fragen von Clemens?', 'Quelles informations répondent aux trois questions de Clemens ?'),
          [['der erste Film der Regisseurin, schöne Bilder, wenig Dialoge'],
            ['ohne Gewalt, nicht zu lang, im Original mit Untertiteln', true],
            ['die Familie, die Atlantikküste, das Thema der Generationen'],
            ['die junge Schauspielerin, die Musik, das zu schnelle Ende']],
          aide('Clemens nennt drei Kriterien: keine brutalen Filme, keine zu langen Filme, Untertitel. Die Kritik beantwortet alle drei: « sans violence », 1 Stunde 42 Minuten, « version originale sous-titrée ». Die anderen Informationen sind interessant, aber für seine Entscheidung zweitrangig.',
            'Les trois critères de Clemens : violence, durée, sous-titres ; la critique répond aux trois.')),
        match('q3', aide('Welche deutsche Formulierung passt?', 'Quelle formulation allemande convient ?'),
          [['« premier long métrage »', 'erster Spielfilm'], ['« une fin un peu précipitée »', 'ein etwas überstürztes Ende'],
            ['« mérite largement le déplacement »', 'lohnt sich auf jeden Fall'], ['« en version originale sous-titrée »', 'im Original mit Untertiteln']],
          aide('Eine Sprachmittlung sucht die übliche deutsche Wendung, nicht die wörtliche Übersetzung: Ein « long métrage » ist ein Spielfilm, « mériter le déplacement » heißt im Deutschen „sich lohnen“, und die Originalfassung mit Untertiteln kürzt man oft „OmU“ ab.',
            'Chercher l’expression allemande usuelle plutôt que le calque.')),
        order('q4', aide('Formulieren Sie Ihre Empfehlung für Clemens.', 'Formulez votre recommandation pour Clemens.'),
          [['Ich', 'würde', 'dir', 'den Film', 'auf jeden Fall', 'empfehlen,', 'weil', 'er', 'ganz ohne Gewalt', 'auskommt.'],
            ['Ich', 'würde', 'dir', 'auf jeden Fall', 'den Film', 'empfehlen,', 'weil', 'er', 'ganz ohne Gewalt', 'auskommt.']],
          aide('Im Hauptsatz stehen im Mittelfeld zuerst das Pronomen „dir“, dann das Objekt und die Angabe, der Infinitiv „empfehlen“ am Ende. Nach „weil“ steht das konjugierte Verb „auskommt“ am Ende des Nebensatzes. „Ohne etwas auskommen“ heißt: etwas nicht brauchen.',
            'Pronom en tête du Mittelfeld, infinitif à la fin ; verbe conjugué en fin de subordonnée après weil.')),
        fill('q5', aide('Ergänzen Sie Ihre Antwort an Clemens.', 'Complétez votre réponse à Clemens.'),
          'Hallo Clemens, „Les Jours de sel“ ist der erste Film von Camille Roussel. Er [[1]] von einer Familie an der Atlantikküste, die Salz gewinnt. Die Kritik lobt vor allem die Bilder und die Schauspieler, nur das Ende sei etwas [[2]]. Brutal ist er überhaupt nicht, und er dauert nur 1 Stunde 42. Und keine Sorge wegen der Sprache: Er läuft mit [[3]]. Ich finde, der Film [[4]] sich!',
          [['handelt', 'erzählt'], ['überstürzt', 'schnell', 'abrupt', 'plötzlich'], ['Untertiteln'], ['lohnt']],
          aide('„Handeln von“ oder „erzählen von“ nennt das Thema. „Das Ende sei etwas überstürzt“: Mit dem Konjunktiv I zeigt man, dass man die Meinung der Kritik wiedergibt. „Sich lohnen“ ist reflexiv: Der Film lohnt sich.',
            'handeln / erzählen von ; Konjunktiv I pour rapporter l’avis de la critique ; sich lohnen.')),
      ] },

    // 4 · Erreurs typiques
    { id: 'b2-kultur-atelier-korrektur', kind: 'exercise', title: 'Korrigieren: typische Fehler in Kritiken', estimatedMinutes: 10,
      competences: ['lecture', 'expression-ecrite'],
      lesson: { description: `${aide('Diese Sätze stammen aus Kritiken von Kursteilnehmenden. Finden Sie die richtige Form.', 'Ces phrases viennent de critiques d’apprenants ; trouvez la forme correcte.')}

KORREKTURZEICHEN
G Grammatik · W Wortschatz · St Satzstellung · R Rechtschreibung · A Ausdruck und Register. [fr?] Codes de correction : grammaire, vocabulaire, place des mots, orthographe, registre.` },
      questions: [
        choice('q1', aide('G: Welcher Satz ist richtig?', 'G : quelle phrase est correcte ?'),
          [['Ich habe den Film sehr gut gefallen.'], ['Der Film hat mich sehr gut gefallen.'],
            ['Der Film hat mir sehr gut gefallen.', true], ['Ich habe dem Film sehr gut gefallen.']],
          aide('Bei „gefallen“ ist das Werk das Subjekt und die Person steht im Dativ: Der Film gefällt mir. Das ist umgekehrt wie im Französischen, wo die Person das Subjekt ist. Mit der Person als Subjekt kann man sagen: Ich mochte den Film. / Ich fand den Film sehr gut.',
            'gefallen : l’œuvre est sujet, la personne au datif (Der Film hat mir gefallen).')),
        choice('q2', aide('W: Welches Wort passt? „Die … des Films ist spannend und gut durchdacht.“', 'W : quel mot convient ?'),
          [['Intrige'], ['Aktion'], ['Aufführung'], ['Handlung', true]],
          aide('Der Ablauf der Ereignisse in einem Film oder Buch heißt „die Handlung“. „Die Intrige“ ist ein falscher Freund: Im Deutschen bedeutet es ein heimliches Komplott gegen jemanden. „Die Aktion“ ist eine Unternehmung, und „die Aufführung“ sagt man beim Theater oder Konzert, nicht für den Inhalt.',
            'Faux ami : l’intrigue d’un film = die Handlung ; die Intrige = une machination.')),
        fill('q3', aide('St: Ergänzen Sie die Pronomen in der richtigen Reihenfolge.', 'St : complétez avec les pronoms dans le bon ordre.'),
          'Hast du den Roman schon gelesen? – Ja, meine Schwester hat [[1]] [[2]] letzte Woche geliehen.',
          [['ihn'], ['mir']],
          aide('Zwei Pronomen im Mittelfeld: Akkusativ vor Dativ, also „ihn mir“ (den Roman mir). Im Französischen steht das Pronomen der Person zuerst; deshalb ist „mir ihn“ ein typischer Fehler.',
            'Deux pronoms : accusatif puis datif (ihn mir), à l’inverse du français « elle me l’a prêté ».')),
        choice('q4', aide('A: Welcher Satz passt am besten in eine geschriebene Kritik?', 'A : quelle phrase convient le mieux à une critique écrite ?'),
          [['Das Ende ist halt irgendwie total doof gemacht.'], ['Das Ende wirkt leider etwas konstruiert.', true],
            ['Das Ende hat echt voll genervt, ehrlich.'], ['Das Ende ist doch Mist, oder nicht?']],
          aide('In einer geschriebenen Kritik bewertet man präzise und sachlich: „wirkt etwas konstruiert“ nennt die Schwäche genau, „leider“ und „etwas“ machen sie milder. Modalpartikeln wie „halt“ und Umgangssprache wie „voll“, „doof“ oder „Mist“ gehören ins Gespräch, nicht in den Text.',
            'Écrit : évaluation précise et mesurée ; pas de particules ni de familiarités.')),
        choice('q5', aide('St: Welcher Satz ist richtig?', 'St : quelle phrase est correcte ?'),
          [['Die Musik hat nicht mich überzeugt.'], ['Die Musik nicht hat mich überzeugt.'],
            ['Die Musik hat mich überzeugt nicht.'], ['Die Musik hat mich nicht überzeugt.', true]],
          aide('Satznegation: „nicht“ steht nach dem Pronomen „mich“ und direkt vor dem Partizip „überzeugt“. „Nicht mich“ würde nur die Person verneinen (nicht mich, sondern andere). Die französische Stellung « ne … pas » direkt beim konjugierten Verb gibt es im Deutschen nicht.',
            'Négation de phrase : après le pronom, juste avant le participe.')),
        fill('q6', aide('G: Ergänzen Sie „Ersterer“ oder „Letztere“.', 'G : complétez avec Ersterer ou Letztere.'),
          'Im Film spielen ein Vater und eine Tochter die Hauptrollen. [[1]] will den Betrieb verkaufen, [[2]] will ihn übernehmen.',
          [['Ersterer'], ['Letztere']],
          aide('„Ersterer“ meint den zuerst Genannten, den Vater (maskulin: -er). „Letztere“ meint die zuletzt Genannte, die Tochter (feminin: -e). Die Endung richtet sich nach dem Bezugswort, wie bei einem Adjektiv ohne Artikel.',
            'Ersterer (le père, masculin), Letztere (la fille, féminin).')),
      ] },

    // 5 · Entraînement au format : Lesen et Hören
    { id: 'b2-kultur-atelier-pruefung', kind: 'exercise', title: 'Prüfungstraining: eine Kritik lesen, ein Interview hören', estimatedMinutes: 20,
      competences: ['lecture', 'ecoute'],
      lesson: { description: `PRÜFUNGSTRAINING LESEN UND HÖREN
${aide('Teil 1: Lesen Sie die Ausstellungskritik und beantworten Sie die Fragen 1 bis 4. Teil 2: Hören Sie das Interview mit der Fotografin zweimal und beantworten Sie die Fragen 5 bis 8.', 'Partie 1 : lisez la critique et répondez aux questions 1 à 4. Partie 2 : écoutez deux fois l’interview et répondez aux questions 5 à 8.')}

ZEIT
Teil 1: etwa 8 Minuten. Teil 2: etwa 10 Minuten. Arbeiten Sie ohne Wörterbuch. [fr?] Partie 1 : environ 8 minutes ; partie 2 : environ 10 minutes ; sans dictionnaire.

STRATEGIE
Lesen Sie vor dem Hören alle Fragen zu Teil 2 und markieren Sie im Kopf die Schlüsselwörter. In Interviews wiederholt die Person die Frage selten wörtlich: Achten Sie auf Synonyme. [fr?] Lisez les questions avant d’écouter ; dans une interview, cherchez les synonymes plutôt que les mots identiques.

TEIL 1 · „SPUREN IM SAND“: EDDA HOLM FOTOGRAFIERT DAS VERSCHWINDEN
Was bleibt von einer Küste, die jedes Jahr ein paar Meter verliert? Die Fotografin Edda Holm ist dieser Frage drei Jahre lang nachgegangen. Das Ergebnis ist jetzt im Kunstverein Wendelstedt zu sehen: 46 großformatige Schwarz-Weiß-Aufnahmen von der Nordseeküste, dazu kurze Texte von Menschen, die dort leben.
Holm zeigt keine Postkartenmotive. Ihre Bilder sind leer, fast streng: eine Treppe, die im Nichts endet, ein Zaun, den die Flut halb weggerissen hat, Fußspuren, die das Wasser gleich auslöschen wird. Gerade diese Zurückhaltung macht die Ausstellung so eindringlich. Man braucht keine Statistik, um zu verstehen, was hier passiert.
Nicht ganz überzeugen kann dagegen die Hängung. Im zweiten Raum hängen die Bilder so dicht, dass sie sich gegenseitig die Wirkung nehmen. Und die Texte der Bewohnerinnen und Bewohner, die eigentlich zu den stärksten Teilen der Ausstellung gehören, stehen klein und schlecht beleuchtet neben den Türen. Wer sie lesen will, muss sich bücken.
Trotzdem: „Spuren im Sand“ ist eine der wichtigsten Ausstellungen dieses Jahres. Sie läuft noch bis zum 15. März, dienstags bis sonntags von 11 bis 18 Uhr. Der Eintritt ist frei; jeden Sonntag um 15 Uhr gibt es eine Führung.

TEIL 2 · INTERVIEW MIT EDDA HOLM
${aide('Ein Moderator des Kulturradios spricht mit der Fotografin über ihre Arbeit.', 'Un animateur de radio culturelle interroge la photographe sur son travail.')}` },
      placements: [
        { media: 'b2-kultur-atelier-pruefung-rezension', caption: 'Ausstellungskritik: Spuren im Sand' },
        { media: 'b2-kultur-atelier-pruefung-interview', caption: 'Interview mit Edda Holm', transcriptVisibility: 'after_answer' },
      ],
      questions: [
        choice('q1', aide('Teil 1: Wie beurteilt der Text die Ausstellung insgesamt?', 'Partie 1 : comment le texte juge-t-il l’exposition dans l’ensemble ?'),
          [['sehr positiv, mit Kritik an der Präsentation', true], ['überwiegend negativ, nur die Texte der Bewohner sind gut'],
            ['neutral, ohne eigene Bewertung'], ['begeistert, ohne jede Einschränkung']],
          aide('Die Kritik lobt die Bilder („so eindringlich“) und nennt die Ausstellung „eine der wichtigsten dieses Jahres“. Sie schränkt aber ein: Die Hängung und die Präsentation der Texte überzeugen nicht. Typisch für eine Rezension: positive Gesamtbewertung mit Einschränkung.',
            'Jugement très positif, avec des réserves sur l’accrochage et la présentation des textes.')),
        choice('q2', aide('Teil 1: Was ist laut Text das Besondere an Holms Bildern?', 'Partie 1 : qu’ont de particulier les photos de Holm ?'),
          [['Sie zeigen die Küste in leuchtenden Farben.'], ['Sie sind zurückhaltend und zeigen keine schönen Ansichten.', true],
            ['Sie werden von genauen Statistiken zum Meeresspiegel begleitet.'], ['Sie zeigen vor allem Menschen bei der Arbeit.']],
          aide('„Holm zeigt keine Postkartenmotive. Ihre Bilder sind leer, fast streng“, und „gerade diese Zurückhaltung macht die Ausstellung so eindringlich“. Die Bilder sind schwarz-weiß, und Statistiken braucht man laut Text gerade nicht.',
            'Images sobres, sans « cartes postales » : c’est cette retenue qui frappe.')),
        rf('q3', 'Der Text hält die Texte der Bewohnerinnen und Bewohner für schwach.', 'f',
          aide('Falsch: Die Texte „gehören eigentlich zu den stärksten Teilen der Ausstellung“. Kritisiert wird nur, wie sie präsentiert werden: klein, schlecht beleuchtet, neben den Türen. Unterscheiden Sie zwischen dem Inhalt und der Präsentation.',
            'Faux : les textes sont jugés forts ; seule leur présentation est critiquée.')),
        choice('q4', aide('Teil 1: Was kritisiert der Text an der Hängung?', 'Partie 1 : que reproche le texte à l’accrochage ?'),
          [['Die Bilder hängen im ersten Raum zu hoch.'], ['Es gibt zu wenige Bilder für zwei so große Räume.'],
            ['Die Bilder sind nicht nach Orten geordnet.'], ['Im zweiten Raum hängen die Bilder zu dicht.', true]],
          aide('„Im zweiten Raum hängen die Bilder so dicht, dass sie sich gegenseitig die Wirkung nehmen.“ „So …, dass“ nennt die Folge: Zu viele Bilder auf engem Raum schwächen einander. Die anderen Kritikpunkte kommen nicht vor.',
            'Dans la deuxième salle, les photos sont trop serrées.')),
        choice('q5', aide('Teil 2: Warum fotografiert Edda Holm in Schwarz-Weiß?', 'Partie 2 : pourquoi Edda Holm photographie-t-elle en noir et blanc ?'),
          [['Weil Farbe vom Wesentlichen ablenken würde.', true], ['Weil Farbfotos im Kunstverein zu teuer sind.'],
            ['Weil sie mit einer sehr alten Kamera arbeitet.'], ['Weil die Küste im Winter keine Farben hat.']],
          aide('„Farbe ist an der Küste unglaublich verführerisch … Aber genau das lenkt ab.“ Sie will, dass man auf die Formen und auf das, was fehlt, schaut. Außerdem wirken die Bilder in Schwarz-Weiß zeitlos. Kosten oder eine alte Kamera erwähnt sie nicht.',
            'La couleur distrairait ; le noir et blanc rend les images intemporelles.')),
        choice('q6', aide('Teil 2: Wie ist Edda Holm bei ihrer Arbeit vorgegangen?', 'Partie 2 : comment Edda Holm a-t-elle travaillé ?'),
          [['Sie hat an jedem Tag einen anderen Ort fotografiert.'], ['Sie hat nur im Winter fotografiert, wenn es stürmt.'],
            ['Sie hat dieselben Orte in allen Jahreszeiten fotografiert.', true], ['Sie hat alte Fotos aus Archiven mit neuen Aufnahmen verglichen.']],
          aide('Sie hat zwölf Orte „viermal im Jahr besucht, in jeder Jahreszeit einmal“, immer frühmorgens. So konnte sie zeigen, „wie sich derselbe Ort verändert“. Der Vergleich mit früher kommt nur im Gespräch mit dem Fischer vor, nicht als Methode.',
            'Les mêmes douze lieux, à chaque saison, toujours tôt le matin.')),
        choice('q7', aide('Teil 2: Wie reagiert Edda Holm auf die Kritik an den Texten?', 'Partie 2 : comment réagit-elle à la critique sur les textes ?'),
          [['Sie weist die Kritik zurück, weil die Fotos wichtiger sind.'], ['Sie gibt dem Kritiker recht und will etwas ändern.', true],
            ['Sie hält die Texte inzwischen für überflüssig.'], ['Sie sagt, dass sie die Kritik nicht gelesen hat.']],
          aide('„Da hat er leider recht.“ Sie erklärt den Grund (wenig Platz) und kündigt eine Lösung an: Für die nächste Station werden die Texte größer gedruckt und direkt neben die Bilder gehängt. Sie hält die Texte für genauso wichtig wie die Fotos.',
            'Elle reconnaît la critique et annonce une amélioration.')),
        choice('q8', aide('Teil 2: Was wünscht sich Edda Holm von den Besuchern?', 'Partie 2 : que souhaite-t-elle de la part des visiteurs ?'),
          [['Sie sollen sich über den Klimawandel informieren.'], ['Sie sollen eine Spende für die Küste geben.'],
            ['Sie sollen die Bilder kaufen, um das nächste Projekt zu fördern.'], ['Sie sollen länger hinschauen und sich selbst Fragen stellen.', true]],
          aide('„Ich möchte niemanden belehren … Ich wünsche mir, dass die Leute einfach länger hinschauen als sonst und sich selbst fragen, was sie verlieren würden.“ Informationen und Warnungen gibt es ihrer Meinung nach schon genug.',
            'Elle ne veut pas faire la leçon : seulement que l’on regarde plus longtemps et qu’on s’interroge.')),
      ] },

    // 6 · Mission écrite
    { id: 'b2-kultur-atelier-schreiben', kind: 'mission', title: 'Mission: eine Kritik für einen Kulturblog', estimatedMinutes: 27,
      competences: ['expression-ecrite'],
      lesson: { description: `SITUATION
Der Kulturblog Ihrer Stadtbibliothek sucht Kritiken von Leserinnen und Lesern. Sie dürfen über ein Werk schreiben, das Sie in letzter Zeit gesehen, gelesen oder gehört haben: einen Film, eine Serie, ein Buch, ein Konzert oder eine Ausstellung. [fr?] Le blog culturel de la bibliothèque publie des critiques de lecteurs ; choisissez une œuvre récente.

SO GEHEN SIE VOR
1. Planen (6 Minuten): Überlegen Sie sich Stichwörter zu den fünf Teilen des Modells: Einleitung, Inhalt, Stärken, Schwächen, Empfehlung. [fr?] Planifier selon les cinq parties du modèle.
2. Schreiben (16 Minuten): Schreiben Sie den Inhalt im Präsens und verraten Sie das Ende nicht. [fr?] Écrire ; résumé au présent, sans dévoiler la fin.
3. Prüfen (5 Minuten): Lesen Sie Ihren Text mit der Checkliste noch einmal. [fr?] Relire avec la liste de vérification.` },
      mission: {
        oral: null,
        written: { prompt: aide('Schreiben Sie eine Kritik für den Blog (180 bis 220 Wörter). Stellen Sie das Werk vor, fassen Sie den Inhalt kurz zusammen, nennen Sie mindestens zwei Stärken und eine Schwäche mit Beispielen und sagen Sie, wem Sie das Werk empfehlen.',
          'Écrivez une critique pour le blog (180 à 220 mots) : présentation, bref résumé, au moins deux points forts et une faiblesse illustrés, recommandation.'),
          maxChars: 2200, minWords: 150 },
        checklist: [
          aide('Titel, Gattung und Autor oder Regie stehen in der Einleitung.', 'Titre, genre et auteur dans l’introduction.'),
          aide('Der Inhalt ist kurz, im Präsens und ohne das Ende.', 'Résumé bref, au présent, sans la fin.'),
          aide('Zwei Stärken und eine Schwäche, jeweils mit Beispiel', 'Deux points forts et une faiblesse, avec exemples'),
          aide('Ich bewerte genau (fesselnd, vorhersehbar …) und ohne Umgangssprache.', 'Évaluation précise, sans familiarités.'),
          aide('Die Empfehlung sagt, für wen sich das Werk lohnt.', 'La recommandation précise à qui l’œuvre s’adresse.'),
        ],
        criteria: [
          { ...GRIDS.b2.schreiben[0], label: aide('Aufgabenerfüllung: Werk, knapper Inhalt, zwei Stärken und eine Schwäche mit Beispielen, Empfehlung', 'Tâche : œuvre, résumé, points forts et faible, recommandation') },
          ...GRIDS.b2.schreiben.slice(1),
        ],
      } },

    // 7 · Mission orale : exposé
    { id: 'b2-kultur-atelier-sprechen', kind: 'mission', title: 'Mission: ein Werk vorstellen, das Sie geprägt hat', estimatedMinutes: 20,
      competences: ['expression-orale'],
      lesson: { description: `SITUATION
${aide('In Ihrem Kurs stellt jede Person ein Buch, einen Film, ein Lied oder ein Kunstwerk vor, das sie geprägt hat. Jetzt sind Sie an der Reihe.', 'Dans votre cours, chacun présente une œuvre qui l’a marqué ; c’est votre tour.')}

AUFBAU DES VORTRAGS
1. Einleitung: Welches Werk? Wann und wie haben Sie es kennengelernt? [fr?] Quelle œuvre, et dans quelles circonstances ?
2. Kontext: Wer hat es geschaffen, wann ist es entstanden? [fr?] Auteur et contexte.
3. Inhalt und Besonderheit: Worum geht es, was ist besonders daran? [fr?] Contenu et particularité.
4. Persönliche Bedeutung: Warum hat es Sie geprägt? [fr?] Pourquoi vous a-t-elle marqué(e) ?
5. Kritischer Blick und Empfehlung: Was überzeugt Sie weniger? Wem empfehlen Sie es? [fr?] Une réserve et une recommandation.

VORBEREITUNG
${aide('Nehmen Sie sich fünf Minuten Zeit und überlegen Sie sich nur Stichwörter, keine ganzen Sätze. Hören Sie sich, wenn Sie möchten, noch einmal das Modell von Malik an.', 'Préparez en cinq minutes des mots-clés seulement ; réécoutez le modèle de Malik si vous le souhaitez.')}` },
      mission: {
        oral: { prompt: aide('Halten Sie einen Vortrag von drei bis vier Minuten über ein Werk, das Sie geprägt hat. Folgen Sie den fünf Schritten, sprechen Sie frei und verbinden Sie die Teile mit passenden Überleitungen.',
          'Faites un exposé de trois à quatre minutes sur une œuvre qui vous a marqué(e), en suivant les cinq étapes, sans lire, avec des transitions.'),
          maxSeconds: 240 },
        written: null,
        checklist: [
          aide('Ich nenne das Werk und den persönlichen Anlass.', 'Je nomme l’œuvre et l’occasion personnelle.'),
          aide('Ich beschreibe Inhalt und Besonderheit mit Beispielen.', 'Je décris contenu et particularité avec des exemples.'),
          aide('Ich erkläre, warum mich das Werk geprägt hat.', 'J’explique pourquoi l’œuvre m’a marqué(e).'),
          aide('Ich nenne einen Kritikpunkt und gebe eine Empfehlung.', 'J’exprime une réserve et une recommandation.'),
          aide('Überleitungen: „Zunächst …“, „Was mich besonders beeindruckt hat, …“, „Zum Schluss …“', 'Transitions entre les parties'),
        ],
        criteria: [
          { ...GRIDS.b2.sprechen[0], label: aide('Aufgabenerfüllung: fünf Teile, persönliche Bedeutung begründet, Kritikpunkt, Empfehlung, 3–4 Minuten', 'Tâche : cinq parties, sens personnel, réserve, recommandation') },
          ...GRIDS.b2.sprechen.slice(1),
        ],
      } },

    // 8 · Bilan
    { id: 'b2-kultur-atelier-bilan', kind: 'lesson', title: 'Bilanz: über Kultur sprechen und schreiben', estimatedMinutes: 6,
      competences: ['lecture'],
      lesson: { description: `${aide('Lesen Sie die Ziele der beiden Module „Kultur“. Was können Sie schon sicher? Was möchten Sie noch üben?', 'Relisez les objectifs des deux modules « Kultur » : qu’est-ce qui est acquis, que voulez-vous encore travailler ?')}

ICH KANN …
• Ich kann eine Kritik schreiben, die informiert, begründet bewertet und eine Empfehlung gibt. [fr?] Je peux écrire une critique structurée et argumentée.
• Ich kann ein Werk in einem Vortrag vorstellen und erklären, was es für mich bedeutet. [fr?] Je peux présenter une œuvre à l’oral et dire ce qu’elle représente pour moi.
• Ich kann im Gespräch auf Meinungen reagieren, Verallgemeinerungen relativieren und vorsichtig deuten. [fr?] Je peux réagir aux avis, nuancer et interpréter avec prudence.
• Ich kann einer deutschsprachigen Person das Wichtigste aus einer französischen Kritik vermitteln. [fr?] Je peux transmettre en allemand l’essentiel d’une critique française.

STRATEGIEN
• Kritik: Inhalt im Präsens, kein Ende verraten, jede Bewertung mit einem Beispiel belegen. [fr?] Résumé au présent, pas de fin dévoilée, chaque jugement illustré.
• Sprachmittlung: nicht übersetzen, sondern auswählen, was die Person wissen will. [fr?] Sélectionner, pas traduire.
• Interviews: vorher die Fragen lesen und auf Synonyme achten. [fr?] Lire les questions avant et repérer les synonymes.

NOCH NICHT SICHER?
${aide('Modalpartikeln und Mittelfeld: Lesen Sie noch einmal die Regel im Modul „Kultur“ und wiederholen Sie die Übungen. Redemittel der Kritik: Lesen Sie die Kritik zu „Sommer ohne Strom“ laut. „Gefallen“ und die Stellung von „nicht“: Machen Sie die Übung „Korrigieren“ noch einmal.', 'Relisez la règle du module Kultur, lisez le modèle à voix haute et refaites l’exercice de correction.')}` } },
  ],
};
