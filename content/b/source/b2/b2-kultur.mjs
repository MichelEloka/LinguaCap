// Module B2 n° 21 · thème « Kultur » (lot R8, thème 11) : littérature, cinéma, musique. Comprendre un essai en faveur de
// la salle de cinéma et suivre son argumentation, écouter une émission littéraire sur un roman et son adaptation (prise de
// notes, points de vue). Grammaire : particules modales (ja, doch, denn, eben, halt, mal, wohl, schon, eigentlich),
// cohérence du texte (reprises, ersteres / letzteres, da-Wörter), ordre des éléments dans le Mittelfeld et place de nicht.
// Le second document (-hoeren2, écoute authentique) est fourni par le lot M2 dans _media.mjs, après -wortschatz (15 min) :
// ce module en compte 8 activités (114 min) et atteint 129 min avec lui.
// Textes, dialogues et exercices originaux LinguaCap (œuvres, auteurs et personnages fictifs).
import { aide, C2, choice, fill, order, match } from '../../lib.mjs';

/** « Richtig / falsch / steht nicht im Text » : r, f ou n pour la bonne réponse. */
const rf = (id, statement, answer, explanation) => choice(id, `„${statement}“ ${C2.richtigFalsch}`,
  [['richtig', answer === 'r'], ['falsch', answer === 'f'], ['steht nicht im Text', answer === 'n']], explanation);

export default {
  id: 'b2-kultur',
  title: 'Kultur: Bücher, Filme und was sie mit uns machen',
  objective: 'Comprendre un essai argumenté sur le cinéma et en suivre les renvois, suivre une émission littéraire sur un roman et son adaptation en distinguant les points de vue, employer les particules modales à l’oral, relier les phrases d’un texte et ordonner correctement le milieu de la phrase (Mittelfeld, place de nicht).',
  grammarFocus: ['modalpartikeln', 'textkohaerenz', 'mittelfeld'],
  sources: ['Textes, dialogues et exercices originaux LinguaCap (œuvres, auteurs et personnages fictifs).'],

  vocabulary: [
    { word: 'Verfilmung', article: 'die', plural: 'Verfilmungen', partOfSpeech: 'noun', translation: 'l’adaptation cinématographique',
      example: 'Die Verfilmung des Romans läuft seit Oktober im Kino.', note: 'verfilmen : adapter au cinéma' },
    { word: 'Vorlage', article: 'die', plural: 'Vorlagen', partOfSpeech: 'noun', translation: 'l’œuvre originale, le modèle',
      example: 'Der Film hält sich nicht eng an die literarische Vorlage.', note: null },
    { word: 'Handlung', article: 'die', plural: 'Handlungen', partOfSpeech: 'noun', translation: 'l’intrigue, l’action',
      example: 'Die Handlung spielt in einem einzigen Sommer.', note: null },
    { word: 'Hauptfigur', article: 'die', plural: 'Hauptfiguren', partOfSpeech: 'noun', translation: 'le personnage principal',
      example: 'Die Hauptfigur des Romans arbeitet nachts auf einer Fähre.', note: null },
    { word: 'Perspektive', article: 'die', plural: 'Perspektiven', partOfSpeech: 'noun', translation: 'le point de vue (narratif)',
      example: 'Der Roman erzählt die Geschichte aus drei Perspektiven.', note: 'aus der Sicht von … : du point de vue de …' },
    { word: 'Rezension', article: 'die', plural: 'Rezensionen', partOfSpeech: 'noun', translation: 'la critique, le compte rendu',
      example: 'Vor dem Kinobesuch lese ich gern eine Rezension.', note: 'synonyme : die Kritik' },
    { word: 'Publikum', article: 'das', plural: null, partOfSpeech: 'noun', translation: 'le public',
      example: 'Das Publikum hat am Ende lange applaudiert.', note: 'sans pluriel · verbe au singulier' },
    { word: 'Leinwand', article: 'die', plural: 'Leinwände', partOfSpeech: 'noun', translation: 'l’écran (de cinéma)',
      example: 'Diese Bilder muss man auf der großen Leinwand sehen.', note: null },
    { word: 'Hauptrolle', article: 'die', plural: 'Hauptrollen', partOfSpeech: 'noun', translation: 'le rôle principal',
      example: 'Die Hauptrolle spielt eine bisher unbekannte Schauspielerin.', note: 'eine Rolle besetzen : attribuer un rôle' },
    { word: 'Debüt', article: 'das', plural: 'Debüts', partOfSpeech: 'noun', translation: 'le premier roman, le premier film',
      example: '„Nachtfähre“ ist das Debüt einer jungen Autorin.', note: 'der Debütroman' },
    { word: 'fesselnd', partOfSpeech: 'adjective', translation: 'captivant',
      example: 'Den fesselnden Roman habe ich in zwei Nächten gelesen.', note: 'fesseln : captiver' },
    { word: 'langatmig', partOfSpeech: 'adjective', translation: 'qui traîne en longueur',
      example: 'Der Mittelteil des Films ist etwas langatmig.', note: null },
    { word: 'vielschichtig', partOfSpeech: 'adjective', translation: 'complexe, à plusieurs niveaux',
      example: 'Die Figuren sind vielschichtig und widersprüchlich.', note: null },
    { word: 'vorhersehbar', partOfSpeech: 'adjective', translation: 'prévisible',
      example: 'Das Ende war leider ziemlich vorhersehbar.', note: null },
    { word: 'kitschig', partOfSpeech: 'adjective', translation: 'kitsch, mièvre',
      example: 'Mit Musik und Sonnenaufgang wirkt die Schlussszene kitschig.', note: 'der Kitsch' },
    { word: 'handeln von', partOfSpeech: 'verb', translation: 'parler de, avoir pour sujet',
      example: 'Der Roman handelt von zwei Geschwistern, die sich fremd geworden sind.', note: '+ datif · es handelt sich um : il s’agit de' },
    { word: 'sich auseinandersetzen mit', partOfSpeech: 'verb', translation: 'se confronter à, examiner en profondeur',
      example: 'Der Film setzt sich mit Schuld und Vergebung auseinander.', note: '+ datif · séparable : auseinander|setzen' },
    { word: 'Kritik üben an', partOfSpeech: 'expression', translation: 'critiquer',
      example: 'Der Kritiker übt vor allem am Ende des Films Kritik.', note: '+ datif' },
    { word: 'zum Nachdenken anregen', partOfSpeech: 'expression', translation: 'faire réfléchir',
      example: 'Ein guter Film regt zum Nachdenken an.', note: 'séparable : an|regen' },
    { word: 'eine Lanze brechen für', partOfSpeech: 'expression', translation: 'prendre la défense de, plaider pour',
      example: 'Die Autorin bricht eine Lanze für das Kino.', note: '+ accusatif' },
    { word: 'den Nerv der Zeit treffen', partOfSpeech: 'expression', translation: 'être dans l’air du temps',
      example: 'Mit seinem Thema trifft der Roman den Nerv der Zeit.', note: null },
    { word: 'sich einlassen auf', partOfSpeech: 'verb', translation: 'se laisser prendre par, accepter de s’engager dans',
      example: 'Im Kino lässt man sich ganz auf eine Geschichte ein.', note: '+ accusatif · séparable : ein|lassen' },
    { word: 'abweichen von', partOfSpeech: 'verb', translation: 's’écarter de',
      example: 'Eine Verfilmung darf von ihrer Vorlage abweichen.', note: '+ datif · séparable : ab|weichen' },
  ],

  media: [
    { key: 'b2-kultur-lesen-essay', kind: 'image', title: 'Essai « Im Dunkeln sind wir nicht allein »',
      alt: 'Essai d’une critique de cinéma : « Im Dunkeln sind wir nicht allein – ein Plädoyer für das Kino ». L’autrice défend la salle de cinéma face au streaming.',
      image: { layout: 'article', kicker: 'Essay', icon: 'clapperboard',
        title: 'Im Dunkeln sind wir nicht allein – ein Plädoyer für das Kino', byline: 'Vera Kronberg, Filmkritikerin',
        lead: 'Noch nie war es so einfach, Filme zu sehen. Ein Abo, ein Bildschirm, ein Sofa – mehr braucht es nicht, um aus Tausenden von Titeln zu wählen.',
        paragraphs: ['Warum sollte man da noch Geld für eine Kinokarte ausgeben, einen Parkplatz suchen und sich neben Fremde setzen, die mit Popcorn rascheln? Die Frage ist berechtigt, und viele haben sie für sich längst beantwortet: Sie bleiben zu Hause.'] } },
    { key: 'b2-kultur-hoeren-audio', kind: 'audio', title: 'Émission littéraire : un roman et son adaptation',
      script: [
        { voice: 'frau', name: 'Anja Wiegand', text: 'Willkommen bei „Zwischen den Zeilen“, dem Buchmagazin im Kulturradio. Heute sprechen wir über einen Roman, der seit Monaten auf der Bestsellerliste steht, und über seine Verfilmung, die gerade in die Kinos gekommen ist: „Nachtfähre“ von Teresa Wendland. Bei mir im Studio sind der Literaturkritiker Matthias Grewe und die Buchhändlerin Hülya Demirci.' },
        { voice: 'frau', name: 'Anja Wiegand', text: 'Herr Grewe, für alle, die das Buch noch nicht kennen: Worum geht es denn?' },
        { voice: 'mann', name: 'Matthias Grewe', text: 'Im Mittelpunkt steht Ruth, eine Frau Anfang fünfzig, die nachts eine Fähre steuert. Sie bringt Menschen über einen Fluss, zwischen zwei Dörfern, die sich eigentlich nicht viel zu sagen haben. In einem Sommer taucht plötzlich ihr Bruder wieder auf, den sie zwanzig Jahre lang nicht gesehen hat.' },
        { voice: 'mann', name: 'Matthias Grewe', text: 'Das Besondere ist die Form: Wendland erzählt die Geschichte aus drei Perspektiven, aus der Sicht von Ruth, von ihrem Bruder und von einem Jungen, der jede Nacht mit der Fähre fährt. Man setzt das Bild erst nach und nach zusammen. Das ist anspruchsvoll, aber genau das macht den Reiz aus.' },
        { voice: 'frau', name: 'Anja Wiegand', text: 'Und die Sprache?' },
        { voice: 'mann', name: 'Matthias Grewe', text: 'Sehr knapp, fast karg. Wendland verzichtet auf große Erklärungen, vieles steht zwischen den Zeilen. Wer schnelle Spannung sucht, wird vielleicht ungeduldig. Mich hat gerade diese Zurückhaltung gefesselt.' },
        { voice: 'frau', name: 'Anja Wiegand', text: 'Frau Demirci, der Roman hat sich über zweihunderttausend Mal verkauft. Merken Sie das in Ihrer Buchhandlung?' },
        { voice: 'frau3', name: 'Hülya Demirci', text: 'Ja, total. Und seit dem Kinostart im Oktober noch mal ganz anders. Vorher waren es eher Leute, die sowieso viel lesen. Jetzt kommen plötzlich viele junge Leute, die den Film gesehen haben und wissen wollen, wie die Geschichte im Buch erzählt wird. Das finde ich natürlich wunderbar.' },
        { voice: 'frau3', name: 'Hülya Demirci', text: 'Viele Lesekreise haben das Buch übrigens auch schon diskutiert. Bei uns im Laden gab es im Herbst drei Leseabende dazu, alle ausverkauft.' },
        { voice: 'frau', name: 'Anja Wiegand', text: 'Das klingt ja nach einem echten Erfolg. Haben Sie den Film selbst schon gesehen?' },
        { voice: 'frau3', name: 'Hülya Demirci', text: 'Ja, gleich in der ersten Woche, zusammen mit meiner Tochter.' },
        { voice: 'frau', name: 'Anja Wiegand', text: 'Kommen wir zum Film. Regie hat Milan Hofer geführt, die Hauptrolle spielt eine bisher unbekannte Schauspielerin. Herr Grewe, wie hat Ihnen die Verfilmung gefallen?' },
        { voice: 'mann', name: 'Matthias Grewe', text: 'Ehrlich gesagt, mit gemischten Gefühlen. Die Bilder vom Fluss bei Nacht sind großartig, das muss man dem Film lassen. Und die Hauptdarstellerin ist eine echte Entdeckung. Aber der Film erzählt nur noch aus Ruths Perspektive, und dadurch geht viel verloren. Er ist mir einfach zu glatt.' },
        { voice: 'frau', name: 'Anja Wiegand', text: 'Und das Ende? Da weicht der Film ja deutlich vom Buch ab.' },
        { voice: 'mann', name: 'Matthias Grewe', text: 'Genau. Im Roman bleibt offen, ob die Geschwister sich versöhnen. Im Film fallen sie sich am Ende in die Arme, mit Musik und Sonnenaufgang. Das wirkt auf mich kitschig. Da hat der Film es sich wohl etwas leicht gemacht.' },
        { voice: 'frau3', name: 'Hülya Demirci', text: 'Da muss ich widersprechen. Ein Film ist eben kein Buch. Im Kino hat man zwei Stunden, nicht vierhundert Seiten. Dass Hofer sich auf eine Figur konzentriert, finde ich nur konsequent. Und das Ende, na ja, das Publikum will halt auch mal ein bisschen Hoffnung.' },
        { voice: 'frau3', name: 'Hülya Demirci', text: 'In einem Punkt hat Herr Grewe aber völlig recht: Die Hauptdarstellerin ist großartig. Ihretwegen haben manche Kundinnen den Film schon zweimal gesehen.' },
        { voice: 'mann', name: 'Matthias Grewe', text: 'Das mag sein. Aber Hoffnung und Kitsch sind zwei verschiedene Dinge.' },
        { voice: 'frau', name: 'Anja Wiegand', text: 'Zum Schluss die Frage, die sich viele stellen: Erst das Buch oder erst der Film?' },
        { voice: 'mann', name: 'Matthias Grewe', text: 'Für mich ganz klar: erst das Buch. Lesen Sie es doch zuerst, dann sehen Sie den Film mit anderen Augen.' },
        { voice: 'frau3', name: 'Hülya Demirci', text: 'Ich sage: Hauptsache, man wird neugierig. Wer über den Film zum Buch kommt, ist mir genauso willkommen.' },
        { voice: 'frau', name: 'Anja Wiegand', text: 'Vielen Dank Ihnen beiden. „Nachtfähre“ von Teresa Wendland ist inzwischen als Taschenbuch erschienen, und der Film läuft in vielen Programmkinos.' },
      ] },
    { key: 'b2-kultur-kontrolle-audio', kind: 'audio', title: 'Message vocal de Ronja après le film',
      script: [
        { voice: 'frau2', name: 'Ronja', text: 'Hallo, hier ist Ronja. Sag mal, hast du „Nachtfähre“ denn jetzt schon gesehen? Ich war gestern drin und bin, ehrlich gesagt, ein bisschen enttäuscht. Das Ende ist halt viel zu harmonisch, das passt doch gar nicht zum Buch.' },
        { voice: 'frau2', name: 'Ronja', text: 'Aber die Bilder vom Fluss sind wirklich toll, die musst du dir unbedingt auf der großen Leinwand anschauen. Komm doch am Samstag mit, dann gehe ich gern ein zweites Mal. Meld dich mal!' },
      ] },
  ],

  activities: [
    // 1 · Einstieg
    { id: 'b2-kultur-einstieg', kind: 'lesson', title: 'Einstieg: Kultur, die bewegt', estimatedMinutes: 10,
      competences: ['lecture', 'expression-orale'],
      lesson: { description: `KULTUR, DIE BEWEGT
Ein Roman, über den alle sprechen, ein Film, der lange nachwirkt, ein Lied, das man nicht mehr aus dem Kopf bekommt: Kultur verbindet Menschen und regt zum Nachdenken an. Gleichzeitig verändert das Streaming, wie wir lesen, hören und Filme sehen. [fr?] La culture relie et fait réfléchir ; le streaming change nos façons de lire, d’écouter et de voir des films.

FRAGEN ZUM EINSTIEG
• Welches Buch, welcher Film oder welches Lied hat Sie zuletzt wirklich berührt? Warum? [fr?] Quelle œuvre vous a récemment touché(e), et pourquoi ?
• Lesen Sie Kritiken, bevor Sie ins Kino gehen oder ein Buch kaufen? [fr?] Lisez-vous des critiques avant de choisir ?
• Erst das Buch oder erst der Film: Was ist Ihnen lieber? [fr?] D’abord le livre ou d’abord le film ?
Überlegen Sie sich zu jeder Frage zwei oder drei Stichwörter und eine kurze Begründung. [fr?] Trouvez deux ou trois mots-clés et une brève justification par question.

ZIELE
• Ich kann einen Essay über das Kino verstehen und der Argumentation der Autorin folgen. [fr?] Je peux comprendre un essai et suivre l’argumentation de l’autrice.
• Ich kann einem Radiogespräch über einen Roman und seine Verfilmung folgen und die Meinungen unterscheiden. [fr?] Je peux suivre une émission et distinguer les avis.
• Ich kann Modalpartikeln wie „ja“, „doch“, „eben“ und „wohl“ verstehen und im Gespräch passend verwenden. [fr?] Je peux comprendre et employer les particules modales.
• Ich kann Sätze mit Verweiswörtern verbinden und die Satzglieder im Mittelfeld richtig ordnen. [fr?] Je peux relier les phrases et ordonner le milieu de la phrase.

WICHTIGE WÖRTER
• die Verfilmung — l’adaptation au cinéma
• die Vorlage — l’œuvre originale
• die Handlung — l’intrigue
• die Hauptfigur — le personnage principal
• die Rezension — la critique
• fesselnd / langatmig — captivant / qui traîne en longueur
• von etwas abweichen — s’écarter de quelque chose
• zum Nachdenken anregen — faire réfléchir` } },

    // 2 · Lecture longue : un essai
    { id: 'b2-kultur-lesen', kind: 'exercise', title: 'Verstehen: ein Plädoyer für das Kino', estimatedMinutes: 22,
      competences: ['lecture'],
      lesson: { description: `${C2.lesen}

STRATEGIE
1. Global: Lesen Sie den ersten und den letzten Absatz. Welche These vertritt die Autorin? [fr?] Lecture globale : premier et dernier paragraphe ; quelle thèse l’autrice défend-elle ?
2. Aufbau: Die Autorin nennt „drei handfeste Gründe“. Achten Sie darauf, wo jeder Grund beginnt und wo sie ein Gegenargument aufnimmt. [fr?] Repérez le début de chacune des trois raisons et l’endroit où elle concède un contre-argument.
3. Verweise: Wörter wie „dies“, „Ersteres“ oder „dadurch“ verweisen auf etwas, das vorher steht. Suchen Sie das Bezugswort. [fr?] Les mots de reprise renvoient à ce qui précède : cherchez à quoi.

IM DUNKELN SIND WIR NICHT ALLEIN – EIN PLÄDOYER FÜR DAS KINO
Von Vera Kronberg, Filmkritikerin

(A) Noch nie war es so einfach, Filme zu sehen. Ein Abo, ein Bildschirm, ein Sofa – mehr braucht es nicht, um aus Tausenden von Titeln zu wählen. Warum sollte man da noch Geld für eine Kinokarte ausgeben, einen Parkplatz suchen und sich neben Fremde setzen, die mit Popcorn rascheln? Die Frage ist berechtigt, und viele haben sie für sich längst beantwortet: Sie bleiben zu Hause, und die Zahl der Kinobesuche ist vielerorts deutlich gesunken. Ich möchte trotzdem eine Lanze für das Kino brechen, und zwar nicht aus Nostalgie, sondern aus drei handfesten Gründen.

(B) Der erste Grund ist die Aufmerksamkeit. Zu Hause sehen wir selten einen Film, ohne nebenbei aufs Handy zu schauen, die Wäsche aufzuhängen oder kurz auf Pause zu drücken. Im Kinosaal dagegen gibt es keine Pausentaste. Das klingt nach einem Nachteil, ist aber in Wahrheit ein Geschenk: Wer zwei Stunden lang nicht eingreifen kann, lässt sich auf eine Geschichte so ein, wie sie erzählt wird. Ein Film, der sich Zeit nimmt, bekommt sie im Kino auch. Gerade langsame, stille Filme entfalten erst dadurch ihre Wirkung. Auf dem Sofa hätten wir sie nach zwanzig Minuten wohl abgebrochen.

(C) Der zweite Grund ist das gemeinsame Erleben. Wer schon einmal in einem vollen Saal gelacht hat, weiß, dass ein Witz dort anders wirkt als allein vor dem Laptop. Man spürt, wie das Publikum den Atem anhält, wie es unruhig wird oder plötzlich ganz still. Das Kino ist einer der letzten Orte, an denen sich Menschen, die sich nicht kennen, freiwillig für zwei Stunden auf dieselbe Sache konzentrieren. In einer Gesellschaft, die in immer kleinere Gruppen zerfällt, ist das mehr als ein Vergnügen.

(D) Der dritte Grund ist der Zufall. Streamingdienste schlagen uns vor allem vor, was unserem bisherigen Geschmack entspricht. Das ist bequem, aber es macht unsere Welt kleiner. Ein gutes Programmkino zeigt dagegen auch Filme, die wir nie selbst ausgewählt hätten: einen Dokumentarfilm über Imker in den Bergen Georgiens, ein Debüt aus Westafrika, eine Komödie in Schwarz-Weiß. Dass solche Entdeckungen möglich sind, verdanken wir Menschen, die ein Programm mit Leidenschaft zusammenstellen, und nicht einem Algorithmus. Man geht wegen eines Films hin und kommt mit einem anderen im Kopf nach Hause.

(E) Natürlich hat auch das Streaming seine Verdienste. Für Menschen, die auf dem Land wohnen, wo das nächste Kino eine Stunde entfernt ist, und für jene, die aus gesundheitlichen Gründen nicht ausgehen können, ist es ein echter Gewinn. Zudem hat es vielen kleinen Produktionen ein Publikum verschafft, das sie früher nie erreicht hätten. Ersteres betrifft inzwischen übrigens auch viele Kleinstädte, deren Kinos in den letzten Jahren schließen mussten. Diese Entwicklung zeigt allerdings, dass das Kino keine Selbstverständlichkeit ist: Ohne Publikum verschwindet es.

(F) Ich plädiere deshalb nicht für ein Entweder-oder. Streaming und Kino können nebeneinander bestehen, so wie es Bibliotheken und Buchhandlungen seit Langem tun. Doch wer das Kino als öffentlichen Ort erhalten will, muss es eben auch besuchen: nicht jeden Abend, aber vielleicht einmal im Monat. Die Dunkelheit des Saals, in der wir nicht allein sind, ist es wert.` },
      placements: [{ media: 'b2-kultur-lesen-essay', caption: 'Essay: Im Dunkeln sind wir nicht allein' }],
      questions: [
        choice('q1', aide('Welche These vertritt die Autorin?', 'Quelle thèse l’autrice défend-elle ?'),
          [['Das Streaming wird das Kino in wenigen Jahren vollständig ersetzen.'],
            ['Das Kino bietet Erfahrungen, die das Streaming nicht ersetzen kann.', true],
            ['Filme sollte man nur noch im Kino und nie mehr zu Hause sehen.'],
            ['Kinokarten sind zu teuer, deshalb bleiben die Menschen zu Hause.']],
          aide('In Absatz A kündigt die Autorin an, sie wolle „eine Lanze für das Kino brechen“, und nennt dann drei Gründe: Aufmerksamkeit, gemeinsames Erleben, Zufall. In Absatz F stellt sie klar, dass sie kein „Entweder-oder“ will. Die dritte Antwort ist also zu radikal, und über Preise argumentiert sie nicht.',
            'Thèse : la salle offre des expériences que le streaming ne remplace pas ; mais l’autrice refuse le « ou bien… ou bien ».')),
        choice('q2', aide('Warum erwähnt die Autorin den Dokumentarfilm über Imker in Georgien?', 'Pourquoi l’autrice cite-t-elle le documentaire sur des apiculteurs ?'),
          [['als Beispiel für einen Film, den man ohne Kinoprogramm kaum entdecken würde', true],
            ['als Beweis dafür, dass Dokumentarfilme mehr Publikum anziehen als Spielfilme'],
            ['als Kritik an Kinos, die zu viele ausländische Filme im Programm haben'],
            ['als Beispiel für einen Film, den ein Streamingdienst ihr empfohlen hat']],
          aide('Der Film steht in einer Aufzählung nach dem Satz „Ein gutes Programmkino zeigt dagegen auch Filme, die wir nie selbst ausgewählt hätten“. Er illustriert also den dritten Grund, den Zufall. Ein Streamingdienst hätte ihr gerade solche Filme nicht vorgeschlagen, weil er sich am „bisherigen Geschmack“ orientiert.',
            'Exemple du troisième argument (le hasard) : un film qu’on n’aurait jamais choisi soi-même.')),
        rf('q3', 'Die Autorin geht mindestens einmal pro Woche ins Kino.', 'n',
          aide('Steht nicht im Text: Die Autorin empfiehlt ihren Leserinnen und Lesern, das Kino „vielleicht einmal im Monat“ zu besuchen. Wie oft sie selbst ins Kino geht, sagt sie nicht. Verwechseln Sie die Empfehlung nicht mit einer Information über die Autorin.',
            'Non mentionné : elle recommande « une fois par mois », sans parler de ses propres habitudes.')),
        choice('q4', aide('Was meint die Autorin mit dem Satz „Das klingt nach einem Nachteil, ist aber in Wahrheit ein Geschenk“?', 'Que veut dire l’autrice par cette phrase ?'),
          [['Kinobesuche sind teuer, aber man bekommt viel für sein Geld.'],
            ['Wer nicht unterbrechen kann, lässt sich ganz auf den Film ein.', true],
            ['Die Kinos schenken ihren Gästen manchmal eine Pause.'],
            ['Langsame Filme sind im Kino schwerer zu ertragen als zu Hause.']],
          aide('„Das“ verweist auf den vorherigen Satz: Im Kino gibt es keine Pausentaste. Die fehlende Kontrolle wirkt wie ein Nachteil, ist für die Autorin aber ein Vorteil, denn „wer zwei Stunden lang nicht eingreifen kann, lässt sich auf eine Geschichte … ein“. Langsame Filme wirken gerade im Kino besser, nicht schlechter.',
            '« Das » renvoie à l’absence de touche pause : ne pas pouvoir interrompre aide à s’immerger dans le film.')),
        choice('q5', aide('Wie beurteilt die Autorin das Streaming?', 'Comment l’autrice juge-t-elle le streaming ?'),
          [['Sie lehnt es grundsätzlich ab, weil es die Kinos zerstört.'],
            ['Sie hält es für die bessere Lösung für alle, die wenig Zeit haben.'],
            ['Sie erkennt seine Vorteile an, möchte aber das Kino erhalten.', true],
            ['Sie findet es bequem und sieht keinen Grund zur Sorge.']],
          aide('Absatz E beginnt mit einer Einräumung: „Natürlich hat auch das Streaming seine Verdienste“, etwa für Menschen auf dem Land. In Absatz F schreibt sie, beide könnten „nebeneinander bestehen“, aber das Kino müsse besucht werden, um zu überleben. Ihre Haltung ist also differenziert.',
            'Position nuancée : elle reconnaît les mérites du streaming mais veut préserver le cinéma.')),
        match('q6', aide('Welche Überschrift passt zu welchem Absatz?', 'Quel intertitre convient à quel paragraphe ?'),
          [['Absatz B', 'Ohne Pausentaste'], ['Absatz C', 'Lachen mit Fremden'], ['Absatz D', 'Entdeckungen statt Empfehlungen'],
            ['Absatz E', 'Was für das Streaming spricht'], ['Absatz F', 'Kein Entweder-oder']],
          aide('B: Aufmerksamkeit, weil man nicht pausieren kann. C: das gemeinsame Erleben mit Unbekannten. D: Programmkino gegen Algorithmus. E: die Einräumung, also die Verdienste des Streamings. F: das Fazit, dass beides nebeneinander bestehen soll.',
            'Chaque intertitre reprend l’idée principale du paragraphe.')),
        fill('q7', aide('Worauf verweisen die Wörter? Ergänzen Sie mit Wörtern aus dem Text.', 'À quoi renvoient ces mots ? Complétez avec des mots du texte.'),
          'Absatz E: „Ersteres“ meint die Menschen, die auf dem [[1]] wohnen. · „Diese Entwicklung“ meint, dass viele Kinos [[2]] mussten. · Absatz F: In „so wie es Bibliotheken und Buchhandlungen tun“ steht „es“ für „[[3]] bestehen“.',
          [['Land'], ['schließen'], ['nebeneinander']],
          aide('„Ersteres“ greift von zwei genannten Dingen das erste auf: die Menschen auf dem Land, nicht die Kranken (das wäre „Letzteres“). „Diese Entwicklung“ fasst den vorherigen Satz zusammen: Die Kinos in Kleinstädten mussten schließen. „Es tun“ ersetzt eine ganze Verbgruppe: nebeneinander bestehen.',
            '« Ersteres » = le premier des deux éléments cités ; « diese Entwicklung » résume la phrase précédente ; « es tun » remplace un groupe verbal.')),
        rf('q8', 'Laut Autorin wirkt ein Witz im vollen Kinosaal anders als allein zu Hause.', 'r',
          aide('Richtig: „Wer schon einmal in einem vollen Saal gelacht hat, weiß, dass ein Witz dort anders wirkt als allein vor dem Laptop.“ Mit diesem Beispiel begründet die Autorin den zweiten Grund, das gemeinsame Erleben.',
            'Vrai : c’est l’exemple du deuxième argument, l’expérience partagée.')),
      ] },

    // 3 · Écoute longue : émission littéraire
    { id: 'b2-kultur-hoeren', kind: 'exercise', title: 'Verstehen: ein Roman und seine Verfilmung im Radio', estimatedMinutes: 20,
      competences: ['ecoute'],
      lesson: { description: `${C2.hoeren}

SITUATION
Im Buchmagazin „Zwischen den Zeilen“ spricht die Moderatorin Anja Wiegand mit dem Literaturkritiker Matthias Grewe und der Buchhändlerin Hülya Demirci über den Roman „Nachtfähre“ von Teresa Wendland und seine Verfilmung. [fr?] Une émission littéraire : un critique et une libraire parlent d’un roman et de son adaptation.

STRATEGIE
1. Erstes Hören: Worum geht es im Roman? Was halten die beiden Gäste vom Film? [fr?] Première écoute : le sujet du roman, l’avis des deux invités sur le film.
2. Achten Sie auf Signale für Bewertungen: „großartig“, „mit gemischten Gefühlen“, „da muss ich widersprechen“, „in einem Punkt hat … recht“. [fr?] Repérez les signaux d’évaluation et d’accord ou de désaccord.
3. Zweites Hören: Ergänzen Sie die Notizen mit Stichwörtern. [fr?] Deuxième écoute : complétez les notes avec des mots-clés.` },
      placements: [{ media: 'b2-kultur-hoeren-audio', caption: 'Zwischen den Zeilen: das Buchmagazin' }],
      questions: [
        fill('q1', C2.notizen,
          'Roman „Nachtfähre“ von Teresa Wendland · Hauptfigur Ruth steuert nachts eine [[1]] · ihr [[2]] taucht nach zwanzig Jahren wieder auf · erzählt aus [[3]] Perspektiven · verkauft: über [[4]] Exemplare · Kinostart im [[5]]',
          [['Fähre'], ['Bruder'], ['3', 'drei'], ['200 000', '200.000', '200000', 'zweihunderttausend'], ['Oktober']],
          aide('Matthias Grewe fasst die Handlung zusammen: Ruth „steuert nachts eine Fähre“, ihr Bruder „taucht plötzlich wieder auf“. Die Form: „aus drei Perspektiven“ (Ruth, der Bruder, ein Junge). Die Verkaufszahl nennt die Moderatorin, den Kinostart „im Oktober“ Hülya Demirci.',
            'Le roman : une passeuse de nuit, le retour du frère, trois points de vue ; 200 000 exemplaires ; sortie en octobre.')),
        fill('q2', C2.notizen,
          'Matthias Grewe: stark sind die Bilder vom [[1]] bei Nacht und die [[2]]; aber der Film erzählt nur aus Ruths Sicht und ist ihm zu [[3]]; das neue Ende findet er [[4]] · Hülya Demirci: seit dem Film kommen viele [[5]] Leute in die Buchhandlung; ihr Fazit: Hauptsache, man wird [[6]]',
          [['Fluss'], ['Hauptdarstellerin', 'Schauspielerin'], ['glatt'], ['kitschig'], ['junge'], ['neugierig']],
          aide('Grewe lobt „die Bilder vom Fluss bei Nacht“ und die Hauptdarstellerin („eine echte Entdeckung“), kritisiert aber, dass der Film „zu glatt“ sei und das Ende „kitschig“ wirke. Demirci beobachtet „viele junge Leute“ und schließt mit „Hauptsache, man wird neugierig“.',
            'Le critique : belles images, actrice remarquable, mais film trop lisse et fin mièvre ; la libraire : de jeunes lecteurs, l’essentiel est la curiosité.')),
        choice('q3', aide('Was kritisiert Matthias Grewe am Ende des Films?', 'Que reproche Matthias Grewe à la fin du film ?'),
          [['Die Versöhnung wird zu gefühlvoll inszeniert.', true],
            ['Das Ende ist genauso offen wie im Buch.'],
            ['Die Geschwister sehen sich am Ende nicht wieder.'],
            ['Die Schlussszene ist zu kurz und zu dunkel.']],
          aide('Im Film „fallen sie sich am Ende in die Arme, mit Musik und Sonnenaufgang. Das wirkt auf mich kitschig.“ Kitschig heißt: übertrieben gefühlvoll. Offen ist das Ende nur im Roman; der Film hat es verändert.',
            'Il trouve la réconciliation finale mièvre (kitschig) ; c’est le roman qui laisse la fin ouverte.')),
        choice('q4', aide('Wie begründet Hülya Demirci die Änderungen im Film?', 'Comment Hülya Demirci justifie-t-elle les changements ?'),
          [['Die Autorin hat sich ein anderes Ende gewünscht.'],
            ['Das Buch hätte für einen Film zu viele Figuren.'],
            ['Der Regisseur kannte den Roman nicht gut genug.'],
            ['Ein Film hat andere Mittel und weniger Zeit als ein Roman.', true]],
          aide('„Ein Film ist eben kein Buch. Im Kino hat man zwei Stunden, nicht vierhundert Seiten.“ Deshalb findet sie die Konzentration auf eine Figur „nur konsequent“. Über die Wünsche der Autorin oder das Wissen des Regisseurs sagt sie nichts.',
            'Un film n’est pas un livre : deux heures au lieu de quatre cents pages.')),
        choice('q5', aide('„Da hat der Film es sich wohl etwas leicht gemacht.“ Was drückt „wohl“ hier aus?', 'Que signifie « wohl » ici ?'),
          [['Grewe ist sich ganz sicher und will keinen Widerspruch.'],
            ['Grewe äußert eine Vermutung, keine Gewissheit.', true],
            ['Grewe lobt den Film, weil er sich wohlfühlt.'],
            ['Grewe zitiert eine Aussage des Regisseurs.']],
          aide('Die Modalpartikel „wohl“ macht eine Aussage zur Vermutung: „vermutlich“, „wahrscheinlich“. Grewe nimmt an, dass der Film den bequemen Weg gewählt hat, weiß es aber nicht sicher. Mit „sich wohlfühlen“ hat diese Partikel nichts zu tun.',
            '« wohl » = probablement : une supposition, pas une certitude.')),
        choice('q6', aide('In welchem Punkt sind sich beide Gäste einig?', 'Sur quel point les deux invités sont-ils d’accord ?'),
          [['Man sollte immer zuerst das Buch lesen.'],
            ['Das neue Ende ist eine gute Idee.'],
            ['Die Hauptdarstellerin ist sehr gut.', true],
            ['Der Film ist zu lang geraten.']],
          aide('Grewe nennt die Hauptdarstellerin „eine echte Entdeckung“, und Demirci sagt: „In einem Punkt hat Herr Grewe aber völlig recht: Die Hauptdarstellerin ist großartig.“ Beim Ende und bei der Frage „erst Buch oder Film?“ sind sie verschiedener Meinung.',
            'Seul point d’accord : l’actrice principale ; ils divergent sur la fin et sur l’ordre livre / film.')),
      ] },

    // 4 · Grammaire inductive
    { id: 'b2-kultur-entdecken', kind: 'exercise', title: 'Entdecken: Modalpartikeln und das Mittelfeld', estimatedMinutes: 12,
      competences: ['lecture'],
      lesson: { description: `${aide('Lesen Sie die Sätze aus dem Radiogespräch, der Sprachnachricht und dem Essay. Achten Sie auf die kleinen, unbetonten Wörter und auf die Reihenfolge der Satzglieder.', 'Lisez les phrases de l’émission, du message et de l’essai ; observez les petits mots inaccentués et l’ordre des éléments.')}

SÄTZE
(1) Ein Film ist eben kein Buch.
(2) Da weicht der Film ja deutlich vom Buch ab.
(3) Lesen Sie es doch zuerst!
(4) Worum geht es denn?
(5) Da hat der Film es sich wohl etwas leicht gemacht.
(6) Meld dich mal!
(7) Ich habe den Roman letzten Sommer wegen einer Empfehlung im Zug gelesen.
(8) Ich habe ihn ihr empfohlen. · Ich habe meiner Schwester den Roman empfohlen.
(9) Der Film hat mir am Ende nicht gefallen.

${aide('Beantworten Sie dann die Fragen. Die Erklärungen formulieren die Regel.', 'Répondez ensuite aux questions ; les explications formulent la règle.')}` },
      questions: [
        match('q1', aide('Welche Funktion hat die Modalpartikel in welchem Satz?', 'Quelle fonction a la particule dans chaque phrase ?'),
          [['eben (Satz 1)', 'Es ist so und lässt sich nicht ändern.'], ['ja (Satz 2)', 'Das ist bekannt, wir wissen es beide.'],
            ['doch (Satz 3)', 'eine freundliche Aufforderung, ein Rat'], ['denn (Satz 4)', 'echtes Interesse, die Frage klingt freundlicher'],
            ['wohl (Satz 5)', 'eine Vermutung'], ['mal (Satz 6)', 'macht die Bitte beiläufig und leicht']],
          aide('Modalpartikeln zeigen die Haltung des Sprechers: „eben“ (oder „halt“) stellt etwas Unveränderliches fest, „ja“ verweist auf gemeinsames Wissen, „doch“ im Imperativ ermuntert, „denn“ macht Fragen interessiert und freundlich, „wohl“ drückt eine Vermutung aus, „mal“ macht Bitten weniger direkt.',
            'Les particules expriment l’attitude du locuteur : constat, savoir partagé, encouragement, intérêt, supposition, atténuation.')),
        choice('q2', aide('Satz 1 ohne Partikel: „Ein Film ist kein Buch.“ Was ändert sich?', 'Sans la particule, qu’est-ce qui change ?'),
          [['Der Satz wird grammatisch falsch und unverständlich.'],
            ['Die Information ist dieselbe, aber die Haltung fehlt.', true],
            ['Der Satz bedeutet jetzt genau das Gegenteil.'],
            ['Der Satz wird zu einer Frage an die Zuhörer.']],
          aide('Modalpartikeln ändern weder die Grammatik noch die Information. Sie färben den Satz: Mit „eben“ klingt er wie eine Feststellung, gegen die man nichts tun kann, und beendet fast die Diskussion. Ohne Partikel ist der Satz neutral, aber er klingt in einem Gespräch oft hart.',
            'Même information, sans la nuance d’attitude ; à l’oral, la phrase paraît plus sèche.')),
        choice('q3', aide('Satz 7: In welcher Reihenfolge stehen die Angaben im Mittelfeld?', 'Phrase 7 : dans quel ordre viennent les compléments circonstanciels ?'),
          [['Ort – Grund – Zeit'],
            ['Grund – Zeit – Ort'],
            ['Zeit – Ort – Grund'],
            ['Zeit – Grund – Ort', true]],
          aide('„letzten Sommer“ (Zeit, temporal), „wegen einer Empfehlung“ (Grund, kausal), „im Zug“ (Ort, lokal). Diese Reihenfolge ist im Deutschen typisch und wird oft mit „te-ka-mo-lo“ gelernt: temporal, kausal, modal, lokal. Es ist eine starke Tendenz, keine absolute Regel.',
            'Tendance « te-ka-mo-lo » : temps, cause, manière, lieu.')),
        choice('q4', aide('Satz 8: Was zeigt der Vergleich der beiden Sätze?', 'Phrase 8 : que montre la comparaison des deux phrases ?'),
          [['Pronomen: Akkusativ vor Dativ; Nomen: meist Dativ vor Akkusativ.', true],
            ['Pronomen und Nomen stehen immer im Dativ vor dem Akkusativ.'],
            ['Pronomen: Dativ vor Akkusativ; Nomen: meist Akkusativ vor Dativ.'],
            ['Die Reihenfolge der Objekte ist im Deutschen ganz frei.']],
          aide('Bei zwei Pronomen steht der Akkusativ vor dem Dativ: „ihn ihr“ (es ihm, sie ihnen). Bei zwei Nomen steht meist der Dativ zuerst: „meiner Schwester den Roman“. Pronomen stehen außerdem immer vor Nomen: „Ich habe ihr den Roman empfohlen.“',
            'Deux pronoms : accusatif puis datif ; deux noms : en général datif puis accusatif ; pronom avant nom.')),
        choice('q5', aide('Satz 9: Warum steht „nicht“ direkt vor „gefallen“?', 'Phrase 9 : pourquoi « nicht » est-il juste avant « gefallen » ?'),
          [['Weil „nicht“ immer direkt nach dem Subjekt steht.'],
            ['Weil nur die Zeitangabe „am Ende“ verneint wird.'],
            ['Weil „nicht“ den ganzen Satz verneint und spät steht.', true],
            ['Weil „nicht“ im Perfekt immer am Satzende steht.']],
          aide('Verneint „nicht“ den ganzen Satz, steht es möglichst weit hinten: nach den Pronomen, den Objekten und den meisten Zeitangaben, aber vor dem Verbteil am Ende (gefallen). Würde nur ein Satzteil verneint, stünde „nicht“ direkt davor: „nicht am Ende, sondern am Anfang“.',
            'Négation de toute la phrase : nicht le plus tard possible, juste avant la partie verbale finale.')),
      ] },

    // 5 · Règle
    { id: 'b2-kultur-regel', kind: 'lesson', title: 'Regel: Modalpartikeln, Textzusammenhang und Mittelfeld', estimatedMinutes: 10,
      competences: ['lecture'],
      lesson: { description: `REGEL 1 · MODALPARTIKELN
Modalpartikeln sind kleine, unbetonte Wörter. Sie ändern nicht die Information, sondern zeigen die Haltung des Sprechers. Man hört sie vor allem im Gespräch; in formellen Texten verwendet man sie sparsam. [fr?] Petits mots inaccentués qui expriment l’attitude du locuteur ; fréquents à l’oral, rares à l’écrit formel.
• ja: Bekanntes, gemeinsames Wissen: Sie kennen den Roman ja. – Erstaunen: Das ist ja toll!
• doch: Erinnerung, oft mit leichtem Vorwurf: Das habe ich dir doch gesagt. – im Imperativ Ermunterung: Lesen Sie es doch zuerst!
• denn: in Fragen Interesse und Freundlichkeit: Worum geht es denn?
• eben / halt: Es ist so, man kann es nicht ändern: Ein Film ist eben kein Buch. („halt“ ist umgangssprachlicher.)
• mal: macht eine Bitte beiläufig: Schau mal ins Programm!
• wohl: Vermutung: Der Film dauert wohl drei Stunden.
• schon: Zuversicht: Das klappt schon. – Einräumen: Das stimmt schon, aber …
• eigentlich: in Fragen ein neues Thema: Wie heißt eigentlich die Regisseurin?
Stellung: im Mittelfeld, nie auf Position 1, meist nach den Pronomen und vor der neuen Information: Lesen Sie es doch zuerst. Kombinationen sind möglich: doch mal, ja schon. [fr?] Place : au milieu de la phrase, jamais en première position, en général après les pronoms et avant l’information nouvelle.

REGEL 2 · TEXTZUSAMMENHANG
Ein Text wirkt zusammenhängend, wenn die Sätze aufeinander verweisen. [fr?] Un texte est cohérent quand les phrases renvoient les unes aux autres.
• Pronomen und Demonstrativa: der Roman → er; dieser Gedanke; dies (fasst einen ganzen Satz zusammen)
• Wiederaufnahme mit anderen Wörtern: der Roman → das Buch → Wendlands Debüt
• Ersteres / Letzteres: von zwei Dingen das erste / das zweite; die Endung richtet sich nach dem Bezugswort (Letzterer, Letztere, Letzteres)
• da- und wo-Wörter: dadurch, damit, dabei, deshalb, worauf …: Der Film erzählt nur aus einer Sicht. Dadurch geht viel verloren.
• Konnektoren: zwar … aber, dagegen, allerdings, übrigens, schließlich
[fr?] Pronoms, reprises par synonymes, ersteres / letzteres, adverbes en da- et connecteurs assurent la cohésion.

REGEL 3 · DAS MITTELFELD
Das Mittelfeld liegt zwischen dem konjugierten Verb und dem Verbteil am Ende. Seine Ordnung folgt festen Tendenzen. [fr?] Le Mittelfeld est l’espace entre le verbe conjugué et la fin de la phrase verbale.
• Pronomen zuerst, in der Reihenfolge Nominativ – Akkusativ – Dativ: Hat er es ihr gegeben?
• zwei Nomen: meist Dativ vor Akkusativ: Sie hat ihrer Schwester den Roman empfohlen.
• Pronomen vor Nomen: Sie hat ihn ihrer Schwester empfohlen. / Sie hat ihr den Roman empfohlen.
• Angaben: Zeit – Grund – Art und Weise – Ort (te-ka-mo-lo): Ich bin gestern wegen des Regens mit dem Bus ins Kino gefahren.
• Ergänzungen, die eng zum Verb gehören, stehen ganz hinten: ins Kino gehen, Klavier spielen, Kritik üben.
[fr?] Pronoms d’abord (nominatif, accusatif, datif), datif avant accusatif pour deux noms, puis temps, cause, manière, lieu ; les compléments liés au verbe restent à la fin.

REGEL 4 · DIE STELLUNG VON „NICHT“
• Satznegation: „nicht“ steht möglichst spät, nach den Objekten und den meisten Zeitangaben, aber vor dem Verbteil am Ende und vor engen Ergänzungen: Ich habe den Film gestern nicht gesehen. Ich gehe heute nicht ins Kino. Das Ende ist nicht überzeugend.
• Teilnegation: „nicht“ steht direkt vor dem verneinten Teil, oft mit „sondern“: Ich gehe nicht heute, sondern morgen ins Kino.
[fr?] Négation de phrase : nicht le plus tard possible ; négation partielle : juste avant l’élément nié, souvent avec sondern.

ACHTUNG
• Modalpartikeln lassen sich selten wörtlich übersetzen. Lernen Sie sie in typischen Sätzen und achten Sie auf die Situation. [fr?] Les particules se traduisent rarement : apprenez-les en contexte.
• Die Verneinung steht im Deutschen nicht immer direkt beim Verb: Ich habe den Film nicht gesehen. [fr?] La négation ne se colle pas au verbe conjugué comme « ne … pas ».
• Zwei Pronomen: Akkusativ vor Dativ. „Ich gebe ihr es“ ist falsch, richtig ist „Ich gebe es ihr“. [fr?] Deux pronoms : es ihr, pas ihr es.` } },

    // 6 · Grammaire : s'entraîner
    { id: 'b2-kultur-grammatik', kind: 'exercise', title: 'Üben: Modalpartikeln, Verweise und Mittelfeld', estimatedMinutes: 15,
      competences: ['lecture', 'expression-ecrite'],
      lesson: { description: `${aide('Üben Sie die Modalpartikeln, die Verweiswörter und die Reihenfolge im Mittelfeld. Lesen Sie zuerst immer den ganzen Satz und überlegen Sie, was die Person ausdrücken will.', 'Entraînez-vous aux particules, aux mots de reprise et à l’ordre du Mittelfeld ; lisez toute la phrase et pensez à l’intention.')}

MERKE
• doch (Imperativ) = Ermunterung · denn (Frage) = Interesse · wohl = Vermutung · eben / halt = unveränderlich · ja = bekannt · mal = beiläufig [fr?] Fonctions des particules.
• Pronomen: Akkusativ vor Dativ · Nomen: Dativ vor Akkusativ · Zeit – Grund – Art – Ort · „nicht“ möglichst spät [fr?] Ordre du Mittelfeld et place de nicht.` },
      questions: [
        choice('q1', aide('Sie möchten eine Freundin freundlich ermuntern, mitzukommen. Was sagen Sie?', 'Vous voulez encourager gentiment une amie à venir. Que dites-vous ?'),
          [['Komm ja mit ins Kino!'], ['Komm denn mit ins Kino!'], ['Komm doch mit ins Kino!', true], ['Komm wohl mit ins Kino!']],
          aide('Im Imperativ macht unbetontes „doch“ aus einem Befehl eine freundliche Ermunterung oder einen Vorschlag. Betontes „ja“ im Imperativ klingt dagegen wie eine Warnung („Komm JA pünktlich!“). „Denn“ steht nur in Fragen, und „wohl“ drückt eine Vermutung aus.',
            'Impératif + doch = invitation amicale ; ja accentué = mise en garde ; denn seulement dans les questions.')),
        choice('q2', aide('Sie sind nicht sicher, wie lang der Film ist. Was sagen Sie?', 'Vous n’êtes pas sûr(e) de la durée du film. Que dites-vous ?'),
          [['Der Film dauert wohl fast drei Stunden.', true], ['Der Film dauert denn fast drei Stunden.'],
            ['Der Film dauert mal fast drei Stunden.'], ['Der Film dauert doch nie drei Stunden.']],
          aide('„Wohl“ macht aus einer Aussage eine Vermutung, ähnlich wie „wahrscheinlich“. „Denn“ ist in Aussagesätzen in dieser Funktion nicht möglich, „mal“ gehört zu Aufforderungen, und „doch“ mit „nie“ widerspricht jemandem, statt eine Vermutung auszudrücken.',
            '« wohl » = probablement ; les autres particules ne conviennent pas à une supposition.')),
        fill('q3', aide('Ergänzen Sie die Modalpartikeln: denn, mal, ja, eben.', 'Complétez avec les particules : denn, mal, ja, eben.'),
          'Was läuft [[1]] heute im Kino? · Schau [[2]] ins Programm, es liegt auf dem Tisch. · Das Kino ist [[3]] gleich um die Ecke, das weißt du. · Wenn der Film ausverkauft ist, dann ist das [[4]] so.',
          [['denn'], ['mal', 'doch mal'], ['ja', 'doch'], ['eben', 'halt']],
          aide('„Denn“ macht die Frage interessiert. „Mal“ macht die Aufforderung beiläufig. „Ja“ verweist auf Bekanntes („das weißt du“). „Eben“ oder „halt“ zeigt, dass man an der Situation nichts ändern kann. Möglich sind auch „doch mal“ im zweiten und „doch“ im dritten Satz.',
            'denn (question), mal (demande légère), ja (connu), eben / halt (on n’y peut rien).')),
        choice('q4', aide('Welcher Satz mit der Partikel „doch“ ist richtig?', 'Quelle phrase avec la particule « doch » est correcte ?'),
          [['Das doch habe ich dir gestern gesagt.'], ['Das ich habe dir doch gestern gesagt.'],
            ['Das habe ich dir gestern gesagt doch.'], ['Das habe ich dir doch gestern gesagt.', true]],
          aide('Die Modalpartikel steht im Mittelfeld: nach dem konjugierten Verb und den Pronomen (ich, dir), vor der übrigen Information (gestern). Vor dem konjugierten Verb und am Satzende ist sie nicht möglich. Im zweiten Satz steht außerdem das Verb „habe“ nicht an Position 2.',
            'La particule se place dans le Mittelfeld, après le verbe conjugué et les pronoms, avant le reste de l’information ; jamais avant le verbe ni en fin de phrase.')),
        order('q5', C2.ordnen, [['Kannst', 'du', 'es', 'mir', 'morgen', 'vor dem Kurs', 'in die Bibliothek', 'mitbringen?']],
          aide('Ja-Nein-Frage: das konjugierte Verb „kannst“ steht vorn, der Infinitiv „mitbringen“ am Ende. Im Mittelfeld kommen zuerst die Pronomen (es vor mir: Akkusativ vor Dativ), dann die Zeit (morgen vor dem Kurs) und zuletzt die Richtung (in die Bibliothek), die eng zum Verb gehört.',
            'Pronoms (es mir), puis le temps, puis la direction, juste avant l’infinitif.')),
        choice('q6', aide('Welcher Satz ist richtig?', 'Quelle phrase est correcte ?'),
          [['Sie hat ihr ihn empfohlen.'], ['Sie hat ihn ihr empfohlen.', true],
            ['Sie hat ihn empfohlen ihr.'], ['Sie hat empfohlen ihn ihr.']],
          aide('Zwei Pronomen im Mittelfeld: Akkusativ (ihn) vor Dativ (ihr). Beide stehen direkt nach dem konjugierten Verb und vor dem Partizip am Ende. Im Französischen ist die Reihenfolge der Pronomen anders, deshalb ist „ihr ihn“ ein typischer Fehler.',
            'Deux pronoms : accusatif puis datif (ihn ihr) ; le participe reste à la fin.')),
        choice('q7', aide('Sie haben den Film gestern gar nicht gesehen. Welcher Satz sagt das?', 'Vous n’avez pas du tout vu le film hier. Quelle phrase le dit ?'),
          [['Ich habe den Film gestern nicht gesehen.', true], ['Ich habe nicht den Film gestern gesehen.'],
            ['Ich habe den Film nicht gestern gesehen.'], ['Ich nicht habe den Film gestern gesehen.']],
          aide('Satznegation: „nicht“ steht nach dem Objekt und der Zeitangabe, direkt vor dem Partizip. „Nicht gestern“ wäre eine Teilnegation (nicht gestern, sondern an einem anderen Tag), „nicht den Film“ hieße: einen anderen Film. Vor dem konjugierten Verb steht „nicht“ nie.',
            'Négation de phrase : après l’objet et le temps ; « nicht gestern » nierait seulement le moment.')),
        order('q8', C2.ordnen, [['Leider', 'hat', 'mir', 'die Verfilmung', 'des Romans', 'überhaupt', 'nicht', 'gefallen.']],
          aide('Nach „Leider“ auf Position 1 folgt das konjugierte Verb. Das Pronomen „mir“ steht vor dem Subjekt „die Verfilmung“, weil Pronomen im Mittelfeld vor Nomen stehen. Das Genitivattribut „des Romans“ folgt seinem Nomen, und „überhaupt nicht“ steht direkt vor dem Partizip.',
            'Le pronom mir précède le sujet nominal ; überhaupt nicht juste avant le participe.')),
        fill('q9', aide('Ergänzen Sie die Verweiswörter: dadurch, dies, Letztere.', 'Complétez avec les mots de reprise : dadurch, dies, Letztere.'),
          'Teresa Wendland hat zehn Jahre an ihrem Roman gearbeitet. [[1]] erklärt, warum er so dicht wirkt. · Es gibt zwei Fassungen, eine lange und eine kurze. [[2]] ist nur als Hörbuch erschienen. · Der Film verzichtet auf zwei Erzählstimmen. [[3]] verliert er an Tiefe.',
          [['Dies', 'Das'], ['Letztere'], ['Dadurch', 'Damit']],
          aide('„Dies“ fasst den ganzen vorherigen Satz zusammen (die zehn Jahre Arbeit). „Letztere“ meint von zwei Fassungen die zweite (die kurze; feminin wegen „die Fassung“). „Dadurch“ nennt die Folge des Verzichts: Auf diese Weise verliert der Film an Tiefe.',
            'dies résume une phrase ; Letztere = la seconde (féminin, die Fassung) ; dadurch = de ce fait.')),
        choice('q10', aide('„Der Roman erzählt aus drei Perspektiven.“ Welcher Satz setzt den Text am besten fort?', 'Quelle phrase poursuit le mieux le texte ?'),
          [['Letzterer ist deshalb sehr anspruchsvoll geschrieben.'],
            ['Deshalb ist auch der Film ein großer Erfolg geworden.'],
            ['Trotzdem erzählt er die Handlung aus drei Perspektiven.'],
            ['Diese Erzählweise macht das Buch anspruchsvoll, aber reich.', true]],
          aide('„Diese Erzählweise“ greift den vorherigen Satz mit anderen Worten auf und führt den Gedanken weiter. „Letzterer“ braucht zwei vorher genannte Dinge, „deshalb“ stellt eine unlogische Folge her, und „trotzdem“ wiederholt nur den ersten Satz mit einem falschen Gegensatz.',
            'Reprise par un groupe nominal (diese Erzählweise) ; les autres liens sont illogiques.')),
      ] },

    // 7 · Lexique
    { id: 'b2-kultur-wortschatz', kind: 'exercise', title: 'Wortschatz: über Bücher und Filme sprechen', estimatedMinutes: 13,
      competences: ['lecture', 'expression-ecrite'],
      lesson: { description: `${aide('Lernen Sie den Wortschatz der Kritik: feste Verbindungen, bewertende Adjektive, Wortbildung und Verben mit Präposition.', 'Apprenez le vocabulaire de la critique : combinaisons, adjectifs d’évaluation, formation des mots et verbes prépositionnels.')}

TIPP
Eine gute Kritik bewertet genau: Statt „gut“ oder „schlecht“ sagen Sie, was gelungen ist und was nicht, zum Beispiel „fesselnd“, „vielschichtig“, „vorhersehbar“ oder „langatmig“. [fr?] Une bonne critique évalue avec précision : préférez des adjectifs exacts à « bien » ou « mauvais ».` },
      questions: [
        match('q1', aide('Welches Verb passt zu welchem Ausdruck?', 'Quel verbe va avec quelle expression ?'),
          [['einen Roman', 'verfilmen'], ['eine Rolle', 'besetzen'], ['Kritik', 'üben'], ['zum Nachdenken', 'anregen'],
            ['den Nerv der Zeit', 'treffen'], ['eine Lanze für das Kino', 'brechen']],
          aide('Feste Verbindungen: einen Roman verfilmen, eine Rolle besetzen (eine Schauspielerin für sie auswählen), Kritik üben an + Dativ, zum Nachdenken anregen, den Nerv der Zeit treffen (genau das Thema finden, das die Menschen beschäftigt), eine Lanze für etwas brechen (etwas verteidigen).',
            'Combinaisons figées : adapter, distribuer un rôle, critiquer, faire réfléchir, être dans l’air du temps, prendre la défense.')),
        match('q2', aide('Was bedeuten die Adjektive?', 'Que signifient ces adjectifs ?'),
          [['fesselnd', 'so spannend, dass man nicht aufhören kann'], ['vielschichtig', 'mit mehreren Ebenen und Bedeutungen'],
            ['kitschig', 'übertrieben gefühlvoll'], ['vorhersehbar', 'man weiß schon vorher, wie es endet'],
            ['langatmig', 'mit zu vielen Längen, zu langsam']],
          aide('Positiv: fesselnd, vielschichtig. Negativ: kitschig, vorhersehbar, langatmig. Mit solchen Adjektiven wird eine Kritik präzise. Kombinieren Sie sie mit einem Beispiel: „Der Mittelteil ist langatmig, weil …“.',
            'Adjectifs positifs et négatifs pour une critique précise.')),
        fill('q3', aide('Bilden Sie das Nomen.', 'Formez le nom.'),
          'verfilmen → die [[1]] · inszenieren → die [[2]] · darstellen → der [[3]] · erzählen → der [[4]] · veröffentlichen → die [[5]]',
          [['Verfilmung'], ['Inszenierung'], ['Darsteller'], ['Erzähler'], ['Veröffentlichung']],
          aide('Nomen auf -ung bezeichnen den Vorgang oder das Ergebnis und sind feminin: die Verfilmung, die Inszenierung, die Veröffentlichung. Nomen auf -er bezeichnen die Person und sind maskulin: der Darsteller, der Erzähler (feminin: die Darstellerin, die Erzählerin).',
            '-ung : action ou résultat (féminin) ; -er : la personne (masculin).')),
        fill('q4', aide('Ergänzen Sie die Präpositionen.', 'Complétez avec les prépositions.'),
          'Der Roman handelt [[1]] zwei Geschwistern. · Der Film setzt sich [[2]] Schuld und Vergebung auseinander. · Der Kritiker übt vor allem [[3]] der Schlussszene Kritik. · Das Ende weicht deutlich [[4]] Buch ab.',
          [['von'], ['mit'], ['an'], ['vom']],
          aide('Die Präposition gehört zum Verb: handeln von + Dativ, sich auseinandersetzen mit + Dativ, Kritik üben an + Dativ, abweichen von + Dativ (von dem → vom). Alle vier verlangen den Dativ.',
            'handeln von, sich auseinandersetzen mit, Kritik üben an, abweichen von : tous suivis du datif.')),
        choice('q5', aide('Sie möchten Kritik vorsichtig formulieren. Was sagen Sie?', 'Vous voulez formuler une critique avec prudence. Que dites-vous ?'),
          [['Der Film ist totaler Mist, das sieht doch wirklich jeder sofort.'],
            ['Mir hat nicht alles gefallen; vor allem das Ende hat mich nicht überzeugt.', true],
            ['Ich finde den Film perfekt, es gibt keine Schwächen.'],
            ['Über Filme kann man nicht streiten, jeder sieht es anders.']],
          aide('„Mir hat nicht alles gefallen“ schränkt ein, ohne alles abzulehnen, und „vor allem das Ende“ macht die Kritik konkret. Die erste Antwort ist grob und verallgemeinert, die dritte ist keine Kritik, und die vierte vermeidet eine Bewertung.',
            'Critique nuancée et précise : « nicht alles », « vor allem das Ende ».')),
        choice('q6', aide('„Die Verfilmung hält sich eng an die Vorlage.“ Was heißt das?', 'Que signifie cette phrase ?'),
          [['Der Film wurde in sehr engen Räumen gedreht.'],
            ['Der Film ist kürzer als das Buch.'],
            ['Der Film folgt dem Buch sehr genau.', true],
            ['Der Film hat das Buch bekannter gemacht.']],
          aide('Die Vorlage ist das Werk, auf dem der Film beruht, hier der Roman. „Sich eng an etwas halten“ bedeutet: ihm genau folgen, wenig ändern. Das Gegenteil wäre „frei mit der Vorlage umgehen“ oder „von der Vorlage abweichen“.',
            '« sich eng an die Vorlage halten » = suivre fidèlement l’œuvre originale.')),
      ] },

    // 8 · Vérifier (le second document, -hoeren2, est inséré avant par _media.mjs, lot M2)
    { id: 'b2-kultur-kontrolle', kind: 'exercise', title: 'Prüfen: Partikeln, Verweise und Kulturwortschatz', estimatedMinutes: 12,
      competences: ['lecture', 'ecoute'],
      lesson: { description: `${aide('Prüfen Sie, was Sie in diesem Modul gelernt haben: Hören, Grammatik und Wortschatz.', 'Vérifiez ce que vous avez appris : écoute, grammaire et vocabulaire.')}

${aide('Ronja hat Ihnen nach dem Kino eine Sprachnachricht geschickt. Hören Sie sie für die Fragen 1 bis 3.', 'Ronja vous a laissé un message vocal après le film ; écoutez-le pour les questions 1 à 3.')}` },
      placements: [{ media: 'b2-kultur-kontrolle-audio', caption: 'Sprachnachricht von Ronja' }],
      questions: [
        choice('q1', aide('Wie hat Ronja der Film gefallen?', 'Comment Ronja a-t-elle trouvé le film ?'),
          [['Sie war begeistert und will ihn sofort wiedersehen.'],
            ['Sie fand ihn langweilig und ist früher gegangen.'],
            ['Sie fand ihn viel besser als das Buch.'],
            ['Das Ende enttäuschte sie, die Bilder fand sie toll.', true]],
          aide('„Ich … bin, ehrlich gesagt, ein bisschen enttäuscht. Das Ende ist halt viel zu harmonisch.“ Danach aber: „Die Bilder vom Fluss sind wirklich toll.“ Ihr Urteil ist also gemischt. Sie will den Film zwar noch einmal sehen, aber vor allem, um Sie zu begleiten.',
            'Avis mitigé : déçue par la fin, enthousiaste pour les images.')),
        choice('q2', aide('Was schlägt Ronja vor?', 'Que propose Ronja ?'),
          [['am Samstag zusammen ins Kino zu gehen', true], ['zuerst gemeinsam das Buch zu lesen'],
            ['den Film zu Hause zu streamen'], ['eine Kritik für einen Blog zu schreiben']],
          aide('„Komm doch am Samstag mit, dann gehe ich gern ein zweites Mal.“ Die Partikel „doch“ macht aus dem Imperativ eine freundliche Einladung. Außerdem betont sie, dass man die Bilder „auf der großen Leinwand“ sehen sollte, nicht zu Hause.',
            'Invitation au cinéma samedi (« Komm doch mit »).')),
        choice('q3', aide('„Das Ende ist halt viel zu harmonisch.“ Was drückt „halt“ aus?', 'Que signifie « halt » ici ?'),
          [['eine Bitte, mit dem Film aufzuhören'], ['eine Frage nach dem Ende des Films'],
            ['eine Feststellung, an der sich nichts ändern lässt', true], ['eine Vermutung darüber, wie das Buch wohl endet']],
          aide('„Halt“ hat dieselbe Funktion wie „eben“: Es stellt etwas fest, das man so hinnehmen muss. „Halt“ ist umgangssprachlicher und im Süden häufiger. Eine Vermutung würde man mit „wohl“ ausdrücken.',
            '« halt » = « eben » : constat qu’on ne peut pas changer.')),
        order('q4', C2.ordnen, [
          ['Ich', 'habe', 'ihn', 'ihr', 'schon', 'letztes Jahr', 'zum Geburtstag', 'geschenkt.'],
          ['Ich', 'habe', 'ihn', 'ihr', 'letztes Jahr', 'schon', 'zum Geburtstag', 'geschenkt.']],
          aide('Die Pronomen stehen direkt nach dem konjugierten Verb, Akkusativ vor Dativ: ihn ihr. Danach folgt die Zeitangabe (schon letztes Jahr), dann der Anlass, und das Partizip „geschenkt“ schließt den Satz. „Schon“ kann vor oder nach „letztes Jahr“ stehen.',
            'Pronoms d’abord (ihn ihr), puis le temps, puis l’occasion, participe en fin de phrase.')),
        fill('q5', aide('Ergänzen Sie.', 'Complétez.'),
          'Zwei Kinos zeigen den Film: das Lux und das Apollo. [[1]] zeigt ihn auch in der Originalfassung. · Viele Kritiken waren positiv. [[2]] hat auch die Buchhändlerin überrascht. · Der Roman [[3]] von zwei Geschwistern, die sich fremd geworden sind.',
          [['Letzteres'], ['Das', 'Dies'], ['handelt']],
          aide('„Letzteres“ greift das zweite von zwei Dingen auf, das Apollo; die Endung -es richtet sich nach „das Kino“. „Das“ oder „dies“ fasst den ganzen vorherigen Satz zusammen. „Handeln von“ beschreibt das Thema eines Buches oder Films.',
            'Letzteres (neutre, le second cinéma) ; das / dies résume une phrase ; handeln von = parler de.')),
        choice('q6', aide('Sie haben heute keine Lust auf Kino. Was sagen Sie?', 'Vous n’avez pas envie d’aller au cinéma aujourd’hui. Que dites-vous ?'),
          [['Ich gehe nicht heute ins Kino.'], ['Ich gehe heute ins Kino nicht.'],
            ['Ich gehe heute nicht ins Kino.', true], ['Ich nicht gehe heute ins Kino.']],
          aide('Satznegation: „nicht“ steht nach der Zeitangabe „heute“, aber vor der engen Ergänzung „ins Kino“. „Nicht heute“ wäre eine Teilnegation (nicht heute, sondern an einem anderen Tag). Am Satzende oder vor dem konjugierten Verb ist „nicht“ hier falsch.',
            'Négation de phrase : après heute, avant ins Kino.')),
        choice('q7', aide('Was ist eine „Rezension“?', 'Qu’est-ce qu’une « Rezension » ?'),
          [['eine kurze Werbung für einen neuen Film'], ['eine Liste aller Filme im Programm'],
            ['ein Interview mit der Autorin eines Buches'], ['eine Kritik, die ein Werk beschreibt und bewertet', true]],
          aide('Eine Rezension beschreibt ein Buch, einen Film oder ein Konzert und bewertet es mit Argumenten. Sie hat meist einen festen Aufbau: Angaben zum Werk, kurze Inhaltsangabe, Bewertung, Empfehlung. Werbung bewertet nicht kritisch.',
            'Une critique qui décrit et évalue une œuvre avec des arguments.')),
      ] },
  ],
};
