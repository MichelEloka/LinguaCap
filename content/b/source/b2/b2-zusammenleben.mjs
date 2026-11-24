// Module B2 n° 23 · thème « Zusammenleben » (lot R8, thème 12) : conflits, interculturalité, communication. Comprendre
// un article critique sur les modèles culturels, suivre une médiation entre voisins (prise de notes, positions et
// intérêts), lire une chronique humoristique sur des malentendus. Grammaire : locutions verbo-nominales (consolidation
// de b2-wohnen : paires actif / passif, négation, place) ; diplomatie et atténuation au Konjunktiv II.
// Textes, dialogues et exercices originaux LinguaCap (personnages fictifs).
import { aide, C2, choice, fill, order, match } from '../../lib.mjs';

/** « Richtig / falsch / steht nicht im Text » : r, f ou n pour la bonne réponse. */
const rf = (id, statement, answer, explanation) => choice(id, `„${statement}“ ${C2.richtigFalsch}`,
  [['richtig', answer === 'r'], ['falsch', answer === 'f'], ['steht nicht im Text', answer === 'n']], explanation);
/** Indices affichés sous les trous d'un fill (forme de base à transformer). */
const hints = (question, ...values) => ({ ...question,
  blanks: question.blanks.map((blank, index) => (values[index] ? { ...blank, hint: values[index] } : blank)) });

export default {
  id: 'b2-zusammenleben',
  title: 'Zusammenleben: Konflikte, Missverständnisse und Verständigung',
  objective: 'Comprendre un article critique sur les modèles de communication interculturelle, suivre une médiation entre voisins en distinguant positions et intérêts, saisir l’ironie d’une chronique ; employer les locutions verbo-nominales et formuler demandes, critiques et propositions avec diplomatie au Konjunktiv II.',
  grammarFocus: ['funktionsverbgefuege', 'diplomatie-konjunktiv2'],
  sources: ['Textes, dialogues et exercices originaux LinguaCap (personnages fictifs).'],

  vocabulary: [
    { word: 'Konflikt', article: 'der', plural: 'Konflikte', partOfSpeech: 'noun', translation: 'le conflit',
      example: 'Der Konflikt im Haus dauert schon seit dem Frühjahr.', note: 'einen Konflikt lösen, austragen' },
    { word: 'Missverständnis', article: 'das', plural: 'Missverständnisse', partOfSpeech: 'noun', translation: 'le malentendu',
      example: 'Beim Mittagessen haben sie das Missverständnis ausgeräumt.', note: 'ein Missverständnis ausräumen : dissiper un malentendu' },
    { word: 'Mediation', article: 'die', plural: 'Mediationen', partOfSpeech: 'noun', translation: 'la médiation',
      example: 'Die Stadt bietet eine kostenlose Mediation für Nachbarn an.', note: 'der Mediator, die Mediatorin' },
    { word: 'vermitteln zwischen', partOfSpeech: 'verb', translation: 'servir d’intermédiaire entre',
      example: 'Frau Wolters vermittelt zwischen den beiden Nachbarn.', note: '+ datif' },
    { word: 'Vereinbarung', article: 'die', plural: 'Vereinbarungen', partOfSpeech: 'noun', translation: 'l’accord, la convention',
      example: 'Die Nachbarn haben eine Vereinbarung für vier Wochen getroffen.', note: 'eine Vereinbarung treffen' },
    { word: 'sich einigen auf', partOfSpeech: 'verb', translation: 'se mettre d’accord sur',
      example: 'Wir konnten uns auf eine Probezeit einigen.', note: '+ accusatif · die Einigung' },
    { word: 'Rücksicht nehmen auf', partOfSpeech: 'expression', translation: 'tenir compte de, ménager',
      example: 'Bitte nehmen Sie Rücksicht auf die Nachbarn, die nachts arbeiten.', note: '+ accusatif · rücksichtsvoll' },
    { word: 'Vorurteil', article: 'das', plural: 'Vorurteile', partOfSpeech: 'noun', translation: 'le préjugé',
      example: 'Gemeinsame Projekte helfen, Vorurteile abzubauen.', note: 'Vorurteile abbauen : faire reculer les préjugés' },
    { word: 'jemanden in eine Schublade stecken', partOfSpeech: 'expression', translation: 'mettre quelqu’un dans une case',
      example: 'Man sollte niemanden wegen seiner Herkunft in eine Schublade stecken.', note: null },
    { word: 'sich beschweren über', partOfSpeech: 'verb', translation: 'se plaindre de',
      example: 'Herr Wieczorek hat sich bei der Hausverwaltung über den Lärm beschwert.', note: '+ accusatif · bei jemandem' },
    { word: 'zur Sprache bringen', partOfSpeech: 'expression', translation: 'aborder, évoquer (un sujet)',
      example: 'Ich möchte heute ein schwieriges Thema zur Sprache bringen.', note: 'passif : zur Sprache kommen' },
    { word: 'in Frage stellen', partOfSpeech: 'expression', translation: 'remettre en question',
      example: 'Niemand will Ihre Erfahrung in Frage stellen.', note: 'aussi : infrage stellen · in Frage kommen : entrer en ligne de compte' },
    { word: 'eine Rolle spielen', partOfSpeech: 'expression', translation: 'jouer un rôle',
      example: 'Der Kontext spielt bei der Kommunikation eine große Rolle.', note: null },
    { word: 'in Kauf nehmen', partOfSpeech: 'expression', translation: 's’accommoder de (un inconvénient)',
      example: 'Für eine ruhige Wohnung nehme ich einen längeren Weg in Kauf.', note: null },
    { word: 'zum Ausdruck bringen', partOfSpeech: 'expression', translation: 'exprimer',
      example: 'Mit seiner Entschuldigung hat er seinen guten Willen zum Ausdruck gebracht.', note: 'passif : zum Ausdruck kommen' },
    { word: 'in Konflikt geraten mit', partOfSpeech: 'expression', translation: 'entrer en conflit avec',
      example: 'Ohne es zu wollen, ist er mit seinen Nachbarn in Konflikt geraten.', note: '+ datif · geraten : arriver dans (sans le vouloir)' },
    { word: 'unterstellen', partOfSpeech: 'verb', translation: 'prêter (une intention) à quelqu’un',
      example: 'Ich will Ihnen keine böse Absicht unterstellen.', note: 'jemandem etwas unterstellen · inséparable dans ce sens' },
    { word: 'nachfragen', partOfSpeech: 'verb', translation: 'demander des précisions',
      example: 'Wenn mich etwas irritiert, frage ich lieber nach.', note: 'séparable : nach|fragen' },
    { word: 'empfindlich', partOfSpeech: 'adjective', translation: 'sensible, susceptible',
      example: 'Bei Kritik an seiner Arbeit ist er sehr empfindlich.', note: null },
    { word: 'Ich-Botschaft', article: 'die', plural: 'Ich-Botschaften', partOfSpeech: 'noun', translation: 'le message en « je »',
      example: 'Eine Ich-Botschaft beschreibt, wie es mir geht, statt den anderen anzuklagen.', note: null },
    { word: 'Hausordnung', article: 'die', plural: 'Hausordnungen', partOfSpeech: 'noun', translation: 'le règlement intérieur (d’un immeuble)',
      example: 'Laut Hausordnung gehören Fahrräder nicht in den Flur.', note: null },
    { word: 'Gegenüber', article: 'das', plural: null, partOfSpeech: 'noun', translation: 'l’interlocuteur, la personne en face',
      example: 'Unterstellen Sie Ihrem Gegenüber zunächst eine gute Absicht.', note: 'sans pluriel dans ce sens' },
    { word: 'sich entschuldigen bei … für', partOfSpeech: 'verb', translation: 's’excuser auprès de … pour',
      example: 'Ich möchte mich bei Ihnen für die Zettel entschuldigen.', note: 'bei + datif (personne), für + accusatif (chose)' },
  ],

  media: [
    { key: 'b2-zusammenleben-lesen-artikel', kind: 'image', title: 'Article « Direkt, indirekt, missverstanden »',
      alt: 'Article d’une spécialiste de la communication : « Direkt, indirekt, missverstanden ». À partir d’un malentendu entre un ingénieur lyonnais et un collègue allemand, elle discute l’intérêt et les limites des modèles culturels.',
      image: { layout: 'article', kicker: 'Interkulturelle Kommunikation', icon: 'messages-square',
        title: 'Direkt, indirekt, missverstanden – warum Kultur selten so einfach ist, wie Ratgeber behaupten',
        byline: 'Dr. Miriam Achterberg, Kommunikationswissenschaftlerin',
        lead: 'Julien, ein junger Ingenieur aus Lyon, stellt in seiner ersten Woche bei einem Stuttgarter Zulieferer ein Konzept vor. Kaum ist er fertig, sagt ein Kollege: „Das funktioniert so nicht.“',
        paragraphs: ['Julien fühlt sich bloßgestellt und spricht den Rest des Tages kaum ein Wort. Der Kollege dagegen hat nichts Böses im Sinn: Er hält das Konzept für verbesserungswürdig, Julien selbst schätzt er sehr.'] } },
    { key: 'b2-zusammenleben-hoeren-audio', kind: 'audio', title: 'Une médiation entre voisins',
      script: [
        { voice: 'frau', name: 'Frau Wolters', text: 'Guten Tag, Frau Asante, guten Tag, Herr Wieczorek. Schön, dass Sie beide gekommen sind. Bevor wir anfangen, kurz zu meiner Rolle: Ich bin neutral, und ich entscheide nichts. Die Lösung finden Sie selbst. Ich achte nur darauf, dass jeder ausreden kann. Und alles, was hier gesagt wird, bleibt in diesem Raum. Sind Sie damit einverstanden?' },
        { voice: 'frau3', name: 'Frau Asante', text: 'Ja, einverstanden.' },
        { voice: 'mann2', name: 'Herr Wieczorek', text: 'Ja, sicher.' },
        { voice: 'frau', name: 'Frau Wolters', text: 'Herr Wieczorek, Sie haben sich an die Nachbarschaftsmediation gewandt. Möchten Sie anfangen?' },
        { voice: 'mann2', name: 'Herr Wieczorek', text: 'Gern. Also, ich wohne seit über dreißig Jahren im Erdgeschoss. Seit dem Frühjahr spielen die Kinder von Frau Asante fast jeden Abend Fußball im Hof, oft bis neun Uhr. Der Ball knallt gegen mein Fenster, und ich erschrecke jedes Mal. Ich bin vierundsiebzig, ich schlafe sowieso schlecht.' },
        { voice: 'mann2', name: 'Herr Wieczorek', text: 'Und dann der Flur: Da stehen Fahrräder und ein Kinderwagen, und mit meinem Rollator komme ich kaum vorbei. Ich finde, Ballspielen sollte im Hof einfach verboten werden.' },
        { voice: 'frau', name: 'Frau Wolters', text: 'Danke, Herr Wieczorek. Frau Asante, wie sehen Sie die Situation?' },
        { voice: 'frau3', name: 'Frau Asante', text: 'Ich verstehe, dass der Ball stört, wirklich. Aber unsere Wohnung hat zweieinhalb Zimmer für vier Personen. Der Hof ist der einzige Ort, wo sich die Kinder bewegen können, ohne dass ich sie an einer großen Straße beaufsichtigen muss.' },
        { voice: 'frau3', name: 'Frau Asante', text: 'Mein Mann arbeitet nachts im Krankenhaus und schläft bis mittags. Die Kinder müssen also schon vormittags leise sein. Und was mich ehrlich gesagt verletzt hat: Wir haben im Briefkasten Zettel gefunden, ohne Namen. Darauf stand, wir sollten endlich Rücksicht nehmen. So kann man doch nicht miteinander reden.' },
        { voice: 'mann2', name: 'Herr Wieczorek', text: 'Früher war das hier ein ruhiges Haus, das muss man auch mal sagen dürfen.' },
        { voice: 'frau', name: 'Frau Wolters', text: 'Herr Wieczorek, Sie kommen gleich noch einmal zu Wort. Lassen Sie Frau Asante bitte erst ausreden.' },
        { voice: 'frau3', name: 'Frau Asante', text: 'Ich bin eigentlich fertig. Ich wünsche mir nur, dass wir miteinander reden statt übereinander.' },
        { voice: 'frau', name: 'Frau Wolters', text: 'Wenn ich Sie richtig verstehe, Herr Wieczorek, geht es Ihnen vor allem um Ruhe am Abend und darum, dass Sie sicher durch den Flur kommen. Und Ihnen, Frau Asante, ist wichtig, dass die Kinder draußen spielen können; auch Sie brauchen zu bestimmten Zeiten Ruhe. Habe ich das richtig zusammengefasst?' },
        { voice: 'mann2', name: 'Herr Wieczorek', text: 'Ja, das stimmt. Und, Frau Asante, die Zettel waren von mir. Das war nicht in Ordnung, das tut mir leid. Ich wusste einfach nicht, wie ich das Thema zur Sprache bringen sollte.' },
        { voice: 'frau3', name: 'Frau Asante', text: 'Danke, dass Sie das sagen. Das bedeutet mir viel.' },
        { voice: 'frau', name: 'Frau Wolters', text: 'Dann lassen Sie uns Ideen sammeln. Was wäre für Sie beide denkbar?' },
        { voice: 'frau3', name: 'Frau Asante', text: 'Die Kinder könnten auf der anderen Seite spielen, am Fahrradständer. Da ist kein Fenster. Und wir könnten einen weichen Ball kaufen.' },
        { voice: 'mann2', name: 'Herr Wieczorek', text: 'Das wäre schon eine große Hilfe. Und vielleicht nur bis sieben Uhr? Danach brauche ich wirklich Ruhe.' },
        { voice: 'frau3', name: 'Frau Asante', text: 'Bis sieben ist in Ordnung. Am Wochenende vielleicht bis halb acht?' },
        { voice: 'mann2', name: 'Herr Wieczorek', text: 'Gut, damit kann ich leben.' },
        { voice: 'frau', name: 'Frau Wolters', text: 'Und der Kinderwagen im Flur?' },
        { voice: 'frau3', name: 'Frau Asante', text: 'Wenn es im Keller einen Platz ohne Stufen gäbe, würde ich ihn sofort dort abstellen. Aber die Kellertreppe ist zu steil.' },
        { voice: 'mann2', name: 'Herr Wieczorek', text: 'Und die Fahrräder? Die gehören laut Hausordnung ohnehin nicht in den Flur.' },
        { voice: 'frau3', name: 'Frau Asante', text: 'Das sind die Räder meiner Kinder. Wenn am Fahrradständer im Hof Platz ist, stellen wir sie gern dorthin.' },
        { voice: 'mann2', name: 'Herr Wieczorek', text: 'Da ist genug Platz, ich habe gestern nachgesehen.' },
        { voice: 'frau', name: 'Frau Wolters', text: 'Ich würde vorschlagen, dass ich bei der Hausverwaltung nachfrage, ob man den Raum unter der Treppe nutzen kann. Darf ich Ihre Vereinbarung festhalten? Ballspielen nur auf der Seite am Fahrradständer, mit einem weichen Ball, werktags bis neunzehn Uhr, am Wochenende bis halb acht.' },
        { voice: 'frau', name: 'Frau Wolters', text: 'Wir probieren das vier Wochen lang aus und treffen uns am zwölften Juli wieder.' },
        { voice: 'mann2', name: 'Herr Wieczorek', text: 'Einverstanden.' },
        { voice: 'frau3', name: 'Frau Asante', text: 'Ja, so machen wir es.' },
      ] },
    { key: 'b2-zusammenleben-lesen2-kolumne', kind: 'image', title: 'Chronique « Kommen Sie doch mal vorbei! »',
      alt: 'Chronique d’un Marseillais installé à Brême : deux malentendus, avec une voisine et un collègue, et ce qu’il en a appris.',
      image: { layout: 'article', kicker: 'Kolumne', icon: 'coffee', title: 'Kommen Sie doch mal vorbei!', byline: 'Yannick Morel',
        lead: 'Als ich vor sechs Jahren von Marseille nach Bremen zog, hatte ich mich gut vorbereitet.',
        paragraphs: ['Ich hatte gelesen, dass die Deutschen pünktlich sind, ihre Meinung direkt sagen und ungern über Gefühle sprechen. Mit diesem Wissen, dachte ich, könne mir nichts passieren. Ich lag gründlich falsch.'] } },
    { key: 'b2-zusammenleben-kontrolle-audio', kind: 'audio', title: 'Message vocal de Mme Asante quatre semaines plus tard',
      script: [
        { voice: 'frau3', name: 'Frau Asante', text: 'Guten Tag, Herr Wieczorek, hier ist Efua Asante aus dem ersten Stock. Ich wollte mich kurz melden, weil die vier Wochen ja bald um sind. Ich habe den Eindruck, dass es gut klappt: Die Kinder spielen mit dem weichen Ball am Fahrradständer, und um sieben kommen sie rein.' },
        { voice: 'frau3', name: 'Frau Asante', text: 'Nur eine Sache wollte ich noch zur Sprache bringen. Wäre es möglich, dass Ihr Radio morgens etwas leiser läuft? Mein Mann schläft nach der Nachtschicht bis mittags. Vielleicht können wir das beim Treffen am Zwölften kurz besprechen. Einen schönen Tag noch!' },
      ] },
  ],

  activities: [
    // 1 · Einstieg
    { id: 'b2-zusammenleben-einstieg', kind: 'lesson', title: 'Einstieg: Wo Menschen zusammenleben', estimatedMinutes: 10,
      competences: ['lecture', 'expression-orale'],
      lesson: { description: `ZUSAMMENLEBEN
Im Haus, im Büro, in der Wohngemeinschaft oder im Verein: Wo Menschen zusammenleben, gibt es Konflikte. Wenn Menschen mit verschiedenen Gewohnheiten zusammenkommen, entstehen außerdem leicht Missverständnisse. Entscheidend ist, wie man darüber spricht. [fr?] Là où l’on vit ensemble naissent conflits et malentendus ; tout dépend de la manière d’en parler.

FRAGEN ZUM EINSTIEG
• Wann haben Sie zuletzt einen Konflikt erlebt, und wie wurde er gelöst? [fr?] Quel conflit avez-vous vécu récemment, et comment s’est-il réglé ?
• Gibt es Situationen, in denen Sie die Art, wie Menschen hier kommunizieren, überrascht hat? [fr?] Une façon de communiquer vous a-t-elle déjà surpris(e) ici ?
• Was hilft Ihrer Meinung nach am meisten, wenn sich zwei Seiten nicht einigen können? [fr?] Qu’est-ce qui aide le plus quand deux parties ne s’entendent pas ?
Überlegen Sie sich zu jeder Frage zwei oder drei Stichwörter und ein Beispiel. [fr?] Trouvez deux ou trois mots-clés et un exemple par question.

ZIELE
• Ich kann einen Artikel über interkulturelle Kommunikation verstehen und die Kritik an einfachen Modellen nachvollziehen. [fr?] Je peux comprendre un article critique sur les modèles culturels.
• Ich kann einem Mediationsgespräch folgen und Positionen von Interessen unterscheiden. [fr?] Je peux suivre une médiation et distinguer positions et intérêts.
• Ich kann Bitten, Kritik und Vorschläge diplomatisch im Konjunktiv II formulieren. [fr?] Je peux formuler demandes, critiques et propositions avec diplomatie.
• Ich kann Funktionsverbgefüge wie „zur Sprache bringen“ verstehen und verwenden. [fr?] Je peux comprendre et employer les locutions verbo-nominales.

WICHTIGE WÖRTER
• der Konflikt — le conflit
• das Missverständnis — le malentendu
• die Mediation — la médiation
• sich einigen auf (+ Akk.) — se mettre d’accord sur
• Rücksicht nehmen auf (+ Akk.) — tenir compte de, ménager
• das Vorurteil — le préjugé
• zur Sprache bringen — aborder un sujet
• in Frage stellen — remettre en question` } },

    // 2 · Lecture longue : un article critique
    { id: 'b2-zusammenleben-lesen', kind: 'exercise', title: 'Verstehen: Kultur, Modelle und Missverständnisse', estimatedMinutes: 22,
      competences: ['lecture'],
      lesson: { description: `${C2.lesen}

STRATEGIE
1. Global: Lesen Sie Absatz A und Absatz F. Wie hängen der Anfang und das Ende zusammen? [fr?] Lisez le début et la fin : quel lien entre eux ?
2. Argumente: Die Autorin nennt Vorteile und „Grenzen“ von Modellen. Achten Sie auf „erstens“, „zweitens“, „drittens“ und „allerdings“. [fr?] Repérez avantages et limites grâce aux connecteurs.
3. Detail: Lesen Sie die Aufgaben und dann die passenden Stellen genau. [fr?] Lisez les questions, puis les passages utiles en détail.

DIREKT, INDIREKT, MISSVERSTANDEN – WARUM KULTUR SELTEN SO EINFACH IST, WIE RATGEBER BEHAUPTEN
Von Dr. Miriam Achterberg, Kommunikationswissenschaftlerin

(A) Julien, ein junger Ingenieur aus Lyon, stellt in seiner ersten Woche bei einem Stuttgarter Zulieferer ein Konzept vor. Kaum ist er fertig, sagt ein Kollege: „Das funktioniert so nicht.“ Julien fühlt sich bloßgestellt und spricht den Rest des Tages kaum ein Wort. Er ist überzeugt, dass man ihn vor allen anderen lächerlich machen wollte. Der Kollege dagegen hat nichts Böses im Sinn: Er hält das Konzept für verbesserungswürdig, Julien selbst schätzt er sehr. Am nächsten Tag lädt er ihn zum Mittagessen ein, um gemeinsam eine Lösung zu suchen. Julien sagt ab.

(B) Szenen wie diese kennt jeder, der in internationalen Teams arbeitet. Und für fast jede gibt es heute ein passendes Modell. Viele Unternehmen schicken ihre Beschäftigten deshalb vor einem Einsatz im Ausland in ein interkulturelles Training. Ratgeber und Trainings unterscheiden etwa zwischen direkter und indirekter Kommunikation oder zwischen Kulturen, in denen die Sache, und solchen, in denen die Beziehung im Vordergrund steht. Solche Modelle haben durchaus ihren Wert: Sie geben uns Wörter für Irritationen, die wir sonst nur als diffuses Unbehagen erleben, und sie zeigen, dass das Verhalten des anderen nicht unbedingt persönlich gemeint ist.

(C) Allerdings haben sie auch Grenzen, die gern übersehen werden. Erstens unterscheiden sich Menschen innerhalb eines Landes oft stärker voneinander als die Durchschnittswerte zweier Länder. Eine Pflegerin aus Hamburg und ein Bankdirektor aus München kommunizieren nicht unbedingt ähnlicher als zwei Studierende aus Lyon und Leipzig. Zweitens spielt der Kontext eine große Rolle: Wer in einer Teambesprechung direkt Kritik übt, kann im Gespräch mit der Chefin äußerst vorsichtig sein.

(D) Drittens, und das wiegt am schwersten, können Modelle zu Erwartungen werden, die sich selbst erfüllen. Wer gelernt hat, dass „die Deutschen“ direkt sind, hört in jedem knappen Satz eine Bestätigung und überhört die freundlichen Signale. In einem Seminar an meiner Hochschule haben wir zwei Gruppen von Studierenden auf ein internationales Projekt vorbereitet. Die erste Gruppe lernte Länderprofile auswendig, die zweite übte vor allem, nachzufragen. Am Ende berichtete die zweite Gruppe deutlich seltener von Konflikten. Vorwissen, so scheint es, hilft weniger als Neugier.

(E) Was also tun? Hilfreich ist zunächst, über die Art der Kommunikation selbst zu sprechen: „Wie hast du das gemeint?“ oder „Bei uns äußert man Kritik eher unter vier Augen. Wie ist das hier?“ Wer solche Fragen stellt, bringt Unterschiede zur Sprache, ohne den anderen in eine Schublade zu stecken. Wer fragt, zeigt außerdem Interesse, und das wird fast überall geschätzt. Ebenso wichtig ist es, dem Gegenüber zunächst eine gute Absicht zu unterstellen. Und schließlich kann man in Teams Regeln vereinbaren, etwa dazu, wie Feedback gegeben wird. Solche Regeln stellen niemandes Kultur in Frage, sondern schaffen einen gemeinsamen Rahmen.

(F) Julien und sein Kollege haben übrigens doch noch zusammen zu Mittag gegessen, eine Woche später. Dort haben sie das Missverständnis ausgeräumt; heute leiten sie gemeinsam ein Projekt. Kultur ist eben kein Programm, das in unseren Köpfen abläuft. Sie ist ein Vorrat an Gewohnheiten, mit denen jeder Mensch auf seine eigene Weise umgeht. Die Frage „Woher kommst du?“ verrät deshalb oft weniger als die Frage „Wie meinst du das?“.` },
      placements: [{ media: 'b2-zusammenleben-lesen-artikel', caption: 'Direkt, indirekt, missverstanden' }],
      questions: [
        choice('q1', aide('Welche These vertritt die Autorin?', 'Quelle thèse l’autrice défend-elle ?'),
          [['Kulturmodelle sind nutzlos und sollten nicht mehr gelehrt werden.'],
            ['Kulturmodelle helfen, aber Nachfragen ist wichtiger als feste Bilder.', true],
            ['Missverständnisse entstehen vor allem durch schlechte Sprachkenntnisse.'],
            ['Deutsche sprechen direkter als Franzosen, wie Juliens Fall beweist.']],
          aide('Die Autorin erkennt den Wert der Modelle an (B: „Solche Modelle haben durchaus ihren Wert“), nennt dann drei Grenzen und zieht in D das Fazit: „Vorwissen … hilft weniger als Neugier.“ Die erste Antwort übertreibt ihre Kritik, und die vierte ist genau die Verallgemeinerung, vor der sie warnt.',
            'Les modèles ont une valeur, mais la curiosité et les questions comptent davantage ; la quatrième réponse est le cliché qu’elle critique.')),
        choice('q2', aide('Wozu dient die Geschichte von Julien in Absatz A?', 'À quoi sert l’histoire de Julien ?'),
          [['Sie zeigt an einem konkreten Fall, wie ein Missverständnis entsteht.', true],
            ['Sie beweist, dass Ingenieure aus Frankreich empfindlicher reagieren.'],
            ['Sie kritisiert, dass der Kollege sehr unhöflich gewesen ist.'],
            ['Sie erklärt, wie man ein technisches Konzept richtig präsentiert.']],
          aide('Der Text beginnt mit einer Szene, die das Thema anschaulich macht: Beide Seiten meinen es nicht böse, und trotzdem entsteht ein Konflikt. Die Autorin nimmt die Geschichte in Absatz F wieder auf und schließt damit den Rahmen. Sie verallgemeinert gerade nicht über „die Franzosen“ oder „die Deutschen“.',
            'Une scène concrète illustre le thème ; elle encadre l’article (A et F) sans généraliser.')),
        rf('q3', 'Der Kollege hielt Juliens Konzept für völlig unbrauchbar.', 'f',
          aide('Falsch: „Er hält das Konzept für verbesserungswürdig, Julien selbst schätzt er sehr.“ „Verbesserungswürdig“ heißt: Man kann und sollte es verbessern, nicht: Es ist wertlos. Deshalb lädt er Julien ein, „um gemeinsam eine Lösung zu suchen“.',
            'Faux : le concept est « à améliorer », pas inutilisable.')),
        choice('q4', aide('Warum hält die Autorin die dritte Grenze für die wichtigste?', 'Pourquoi la troisième limite est-elle la plus grave selon l’autrice ?'),
          [['Weil man beim Lernen der Modelle zu viel Zeit verliert.'],
            ['Weil Länderprofile oft veraltete und falsche Zahlen enthalten.'],
            ['Weil Modelle den Blick lenken, bis man nur noch Bestätigungen sieht.', true],
            ['Weil Studierende solche Modelle meistens nicht auswendig lernen wollen.']],
          aide('„Wer gelernt hat, dass ‚die Deutschen‘ direkt sind, hört in jedem knappen Satz eine Bestätigung und überhört die freundlichen Signale.“ Ein Modell kann also die Erwartung erzeugen, die es angeblich nur beschreibt: eine Erwartung, die sich selbst erfüllt.',
            'Le modèle oriente la perception : on ne voit plus que ce qui le confirme (prophétie autoréalisatrice).')),
        choice('q5', aide('Was zeigt das Beispiel aus dem Seminar?', 'Que montre l’exemple du séminaire ?'),
          [['Wer Länderprofile lernt, versteht internationale Projekte besser.'],
            ['Beide Gruppen hatten am Ende ungefähr gleich viele Konflikte.'],
            ['Internationale Projekte scheitern meistens an der Sprache.'],
            ['Wer das Nachfragen übt, erlebt weniger Konflikte als mit Länderprofilen.', true]],
          aide('„Die erste Gruppe lernte Länderprofile auswendig, die zweite übte vor allem, nachzufragen. Am Ende berichtete die zweite Gruppe deutlich seltener von Konflikten.“ Daraus folgert die Autorin: „Vorwissen … hilft weniger als Neugier.“',
            'Le groupe entraîné à poser des questions a connu moins de conflits.')),
        match('q6', aide('Welche Überschrift passt zu welchem Absatz?', 'Quel intertitre convient à quel paragraphe ?'),
          [['Absatz B', 'Wozu Modelle nützen'], ['Absatz C', 'Unterschiede innerhalb eines Landes'], ['Absatz D', 'Wenn Erwartungen sich erfüllen'],
            ['Absatz E', 'Nachfragen und Regeln vereinbaren'], ['Absatz F', 'Ein gutes Ende und eine bessere Frage']],
          aide('B: der Wert der Modelle. C: die ersten beiden Grenzen, Unterschiede im Land und Kontext. D: die dritte Grenze und das Seminar. E: praktische Ratschläge. F: Juliens Geschichte geht gut aus, und die Schlussfrage „Wie meinst du das?“.',
            'Chaque intertitre reprend l’idée directrice du paragraphe.')),
        fill('q7', aide('Ergänzen Sie die Funktionsverbgefüge aus dem Text.', 'Complétez avec les locutions verbo-nominales du texte.'),
          'Wer nachfragt, bringt Unterschiede zur [[1]] (Absatz E). · Gemeinsame Regeln stellen niemandes Kultur in [[2]] (Absatz E). · Beim Mittagessen haben die beiden das Missverständnis [[3]] (Absatz F).',
          [['Sprache'], ['Frage'], ['ausgeräumt']],
          aide('„Zur Sprache bringen“ heißt ansprechen, „in Frage stellen“ heißt bezweifeln oder angreifen. „Ein Missverständnis ausräumen“ ist eine feste Verbindung: es klären und beseitigen. Diese Wendungen sind typisch für sachliche Texte über Kommunikation.',
            'zur Sprache bringen (aborder), in Frage stellen (remettre en cause), ein Missverständnis ausräumen (dissiper).')),
        rf('q8', 'Heute arbeiten Julien und sein Kollege an einem gemeinsamen Projekt.', 'r',
          aide('Richtig: „Heute leiten sie gemeinsam ein Projekt.“ Nach dem Mittagessen, eine Woche später, haben sie das Missverständnis ausgeräumt. Das gute Ende unterstützt die These der Autorin: Ein Gespräch über das Gemeinte hilft mehr als ein Etikett.',
            'Vrai : ils dirigent aujourd’hui un projet ensemble.')),
      ] },

    // 3 · Écoute longue : une médiation entre voisins
    { id: 'b2-zusammenleben-hoeren', kind: 'exercise', title: 'Verstehen: eine Mediation unter Nachbarn', estimatedMinutes: 20,
      competences: ['ecoute'],
      lesson: { description: `${C2.hoeren}

SITUATION
Herr Wieczorek (74 Jahre, Erdgeschoss) und Frau Asante (Familie mit zwei Kindern, erster Stock) haben einen Konflikt. Die Mediatorin Frau Wolters von der Nachbarschaftsmediation der Stadt hilft ihnen, eine Lösung zu finden. [fr?] Deux voisins en conflit, accompagnés par une médiatrice municipale.

STRATEGIE
1. Erstes Hören: Was will jede Seite (Position), und warum (Interesse)? [fr?] Première écoute : ce que chacun demande (position) et pourquoi (intérêt).
2. Achten Sie auf die Phasen der Mediation: Regeln, Sichtweisen, Zusammenfassung, Ideen, Vereinbarung. [fr?] Repérez les étapes de la médiation.
3. Zweites Hören: Ergänzen Sie die Notizen. Uhrzeiten dürfen Sie als Ziffern schreiben. [fr?] Deuxième écoute : complétez les notes ; les heures peuvent s’écrire en chiffres.` },
      placements: [{ media: 'b2-zusammenleben-hoeren-audio', caption: 'Nachbarschaftsmediation' }],
      questions: [
        fill('q1', C2.notizen,
          'Herr Wieczorek: wohnt seit über [[1]] Jahren im Erdgeschoss · Problem: der [[2]] knallt abends gegen sein Fenster · im Flur stehen Fahrräder und ein [[3]] · Frau Asante: der Hof ist der einzige Ort, wo sich die Kinder [[4]] können · ihr Mann arbeitet nachts im [[5]]',
          [['30', 'dreißig'], ['Ball', 'Fußball'], ['Kinderwagen'], ['bewegen'], ['Krankenhaus']],
          aide('Herr Wieczorek: „seit über dreißig Jahren im Erdgeschoss“, „Der Ball knallt gegen mein Fenster“, im Flur „Fahrräder und ein Kinderwagen“. Frau Asante: Der Hof ist „der einzige Ort, wo sich die Kinder bewegen können“, ihr Mann „arbeitet nachts im Krankenhaus“.',
            'Les deux points de vue : bruit du ballon et couloir encombré ; manque de place et travail de nuit.')),
        fill('q2', C2.notizen,
          'Vereinbarung: Ballspielen nur auf der Seite am [[1]] · mit einem [[2]] Ball · werktags bis [[3]] Uhr, am Wochenende bis [[4]] · Kinderwagen: Frau Wolters fragt bei der [[5]] nach · Probezeit: [[6]] Wochen, neues Treffen am 12. Juli',
          [['Fahrradständer'], ['weichen'], ['19', 'neunzehn', '7', 'sieben'], ['halb acht', '19.30', '19:30', '19.30 Uhr', '19:30 Uhr', 'halb 8'], ['Hausverwaltung'], ['4', 'vier']],
          aide('Am Ende fasst Frau Wolters die Vereinbarung zusammen: „auf der Seite am Fahrradständer, mit einem weichen Ball, werktags bis neunzehn Uhr, am Wochenende bis halb acht“. Wegen des Kinderwagens fragt sie bei der Hausverwaltung nach. Die Probezeit dauert vier Wochen.',
            'L’accord : côté porte-vélos, ballon souple, 19 h en semaine, 19 h 30 le week-end, essai de quatre semaines.')),
        choice('q3', aide('Welche Rolle hat Frau Wolters?', 'Quel est le rôle de Mme Wolters ?'),
          [['Sie sorgt für faire Regeln, entscheidet aber nicht selbst.', true],
            ['Sie entscheidet als Vertreterin der Stadt, wer recht hat.'],
            ['Sie vertritt die Interessen der Hausverwaltung im Konflikt.'],
            ['Sie berät nur Herrn Wieczorek, weil er sich gemeldet hat.']],
          aide('„Ich bin neutral, und ich entscheide nichts. Die Lösung finden Sie selbst. Ich achte nur darauf, dass jeder ausreden kann.“ Eine Mediatorin leitet das Gespräch und hilft beiden Seiten, urteilt aber nicht. Dass Herr Wieczorek sich gemeldet hat, macht sie nicht zu seiner Beraterin.',
            'La médiatrice est neutre : elle encadre l’échange, les parties décident.')),
        choice('q4', aide('Wofür entschuldigt sich Herr Wieczorek?', 'De quoi M. Wieczorek s’excuse-t-il ?'),
          [['dass er sich bei der Stadt beschwert hat'],
            ['dass er die Kinder im Hof angeschrien hat'],
            ['dass er Zettel ohne Namen geschrieben hat', true],
            ['dass er das Radio morgens laut gestellt hat']],
          aide('„Die Zettel waren von mir. Das war nicht in Ordnung, das tut mir leid.“ Frau Asante hatte erzählt, dass sie die anonymen Zettel verletzt haben. Seine Entschuldigung ist ein Wendepunkt: Danach sammeln beide gemeinsam Ideen.',
            'Il s’excuse pour les mots anonymes, ce qui débloque la discussion.')),
        choice('q5', aide('Wozu sagt Frau Wolters: „Wenn ich Sie richtig verstehe, …“?', 'Pourquoi Mme Wolters dit-elle « Wenn ich Sie richtig verstehe, … » ?'),
          [['Sie kritisiert, dass beide unklar gesprochen haben.'],
            ['Sie fasst die Interessen beider zusammen und prüft ihr Verständnis.', true],
            ['Sie gibt Herrn Wieczorek recht und beendet die Diskussion.'],
            ['Sie bittet beide, ihre Forderungen noch einmal genau zu wiederholen.']],
          aide('Die Mediatorin gibt mit eigenen Worten wieder, worum es jeder Seite eigentlich geht (Ruhe, Sicherheit im Flur, Platz zum Spielen), und fragt dann: „Habe ich das richtig zusammengefasst?“ So fühlen sich beide gehört, und aus Forderungen werden Interessen.',
            'Reformuler les intérêts de chacun, puis vérifier : technique centrale de la médiation.')),
        choice('q6', aide('Was drückt Herr Wieczorek mit „Gut, damit kann ich leben“ aus?', 'Que signifie « Gut, damit kann ich leben » ?'),
          [['Er ist begeistert, weil er alles bekommen hat.'],
            ['Er droht damit, wieder anonyme Zettel in den Briefkasten zu werfen.'],
            ['Er will lieber in eine andere Wohnung ziehen.'],
            ['Er akzeptiert den Kompromiss, auch wenn er nicht ideal ist.', true]],
          aide('„Damit kann ich leben“ bedeutet: Das ist nicht meine Wunschlösung, aber ich akzeptiere sie. Er wollte ursprünglich ein Verbot des Ballspielens; jetzt ist er mit festen Zeiten am Wochenende einverstanden. Genau so sieht ein Kompromiss aus.',
            '« Damit kann ich leben » = je peux m’en accommoder : il accepte le compromis.')),
      ] },

    // 4 · Grammaire inductive
    { id: 'b2-zusammenleben-entdecken', kind: 'exercise', title: 'Entdecken: Funktionsverbgefüge und diplomatische Formen', estimatedMinutes: 12,
      competences: ['lecture'],
      lesson: { description: `${aide('Lesen Sie die Sätze aus dem Artikel und aus der Mediation. Achten Sie in den Sätzen 1 bis 5 auf die Verbindungen aus Nomen und Verb, in den Sätzen 6 bis 9 auf die Verbformen.', 'Lisez les phrases ; observez les combinaisons nom + verbe (1 à 5) et les formes verbales (6 à 9).')}

SÄTZE
(1) Ich wusste nicht, wie ich das Thema zur Sprache bringen sollte.
(2) Solche Regeln stellen niemandes Kultur in Frage.
(3) Wer direkt Kritik übt, kann im Gespräch mit der Chefin äußerst vorsichtig sein.
(4) Zweitens spielt der Kontext eine große Rolle.
(5) Beim nächsten Treffen kommt auch das Radio zur Sprache.
(6) Ich würde vorschlagen, dass ich bei der Hausverwaltung nachfrage.
(7) Die Kinder könnten auf der anderen Seite spielen.
(8) Was wäre für Sie beide denkbar?
(9) Wäre es möglich, dass Ihr Radio morgens etwas leiser läuft?

${aide('Beantworten Sie dann die Fragen. Die Erklärungen formulieren die Regel.', 'Répondez ensuite aux questions ; les explications formulent la règle.')}` },
      questions: [
        match('q1', aide('Welches einfache Verb hat ungefähr dieselbe Bedeutung?', 'Quel verbe simple a à peu près le même sens ?'),
          [['zur Sprache bringen', 'ansprechen'], ['in Frage stellen', 'bezweifeln'], ['Kritik üben', 'kritisieren'],
            ['eine Rolle spielen', 'wichtig sein'], ['eine Vereinbarung treffen', 'vereinbaren']],
          aide('Bei einem Funktionsverbgefüge trägt das Nomen die Bedeutung: Sprache → ansprechen, Frage → bezweifeln, Kritik → kritisieren. Das Verb (bringen, stellen, üben, spielen, treffen) hat kaum eigene Bedeutung. Deshalb kann man es nicht wörtlich übersetzen.',
            'Le nom porte le sens ; le verbe (bringen, stellen…) est presque vide.')),
        choice('q2', aide('Sätze 1 und 5: Was ist der Unterschied zwischen „zur Sprache bringen“ und „zur Sprache kommen“?', 'Phrases 1 et 5 : quelle différence entre bringen et kommen ici ?'),
          [['„Bringen“ steht in der Vergangenheit, „kommen“ steht in der Zukunft.'],
            ['„Bringen“ hat eine handelnde Person, „kommen“ wirkt wie ein Passiv.', true],
            ['„Bringen“ ist umgangssprachlich, „kommen“ ist formell.'],
            ['Es gibt keinen Unterschied, beide Sätze bedeuten genau dasselbe.']],
          aide('In Satz 1 bringt jemand (ich) das Thema zur Sprache: aktiv. In Satz 5 „kommt“ das Thema zur Sprache, ohne dass gesagt wird, wer es anspricht: Die Bedeutung ist passiv (= wird angesprochen). Ähnliche Paare: zur Verfügung stellen / stehen, in Gang setzen / kommen.',
            'bringen : sens actif, avec un agent ; kommen : sens passif (= wird angesprochen).')),
        choice('q3', aide('Sätze 6 bis 9: Warum stehen die Verben im Konjunktiv II?', 'Phrases 6 à 9 : pourquoi le Konjunktiv II ?'),
          [['weil die Sätze von der Vergangenheit erzählen'],
            ['weil die Sprecher etwas Unmögliches beschreiben'],
            ['weil sie Vorschläge und Bitten vorsichtig machen', true],
            ['weil nach „dass“ immer der Konjunktiv II steht']],
          aide('Hier beschreibt der Konjunktiv II keine irreale Welt, sondern macht Vorschläge und Bitten höflich und offen: Die andere Person kann leichter ablehnen. „Könnten“, „wäre“ und „würde vorschlagen“ sind typische Formen der Diplomatie, besonders in Konflikten.',
            'Ici, le Konjunktiv II n’est pas irréel : il adoucit propositions et demandes.')),
        choice('q4', aide('Satz 9: Welche Wörter machen die Bitte zusätzlich weicher?', 'Phrase 9 : quels mots adoucissent encore la demande ?'),
          [['„morgens“ und „läuft“'],
            ['„Ihr“ und „Radio“'],
            ['„dass“ und „morgens“'],
            ['„möglich“ und „etwas“', true]],
          aide('„Wäre es möglich, dass …?“ fragt nach einer Möglichkeit statt eine Forderung zu stellen, und „etwas“ (wie „ein bisschen“, „vielleicht“) schwächt die Bitte ab: Es geht nicht um Stille, nur um weniger Lautstärke. Solche Abtönungen sind Teil der Diplomatie.',
            '« möglich » (demande sous forme de possibilité) et « etwas » (un peu) atténuent la demande.')),
        choice('q5', aide('Satz 2: Wo steht der Nomenteil „in Frage“?', 'Phrase 2 : où se place « in Frage » ?'),
          [['direkt nach dem konjugierten Verb'],
            ['am Satzende, wie ein Verbteil', true],
            ['am Satzanfang vor dem Subjekt'],
            ['vor dem Akkusativobjekt']],
          aide('Der Nomenteil eines Funktionsverbgefüges steht am Ende des Mittelfelds, wie die Partikel eines trennbaren Verbs: Solche Regeln stellen niemandes Kultur in Frage. Im Nebensatz steht das Verb danach: …, wie ich das Thema zur Sprache bringen sollte.',
            'La partie nominale se place à la fin, comme une particule séparable.')),
      ] },

    // 5 · Règle
    { id: 'b2-zusammenleben-regel', kind: 'lesson', title: 'Regel: Funktionsverbgefüge und Diplomatie im Konjunktiv II', estimatedMinutes: 10,
      competences: ['lecture'],
      lesson: { description: `REGEL 1 · FUNKTIONSVERBGEFÜGE
Im Modul „Wohnen“ haben Sie Nomen-Verb-Verbindungen kennengelernt. Bei diesen Funktionsverbgefügen trägt das Nomen die Bedeutung; das Verb (bringen, kommen, stellen, stehen, nehmen, treffen, üben, ziehen, geraten, treten) ist fast leer. Sie klingen sachlich und formell. [fr?] Rappel : le nom porte le sens, le verbe est presque vide ; registre soutenu.
• zur Sprache bringen (ansprechen) · in Frage stellen (bezweifeln) · Kritik üben an (kritisieren)
• eine Rolle spielen (wichtig sein) · eine Vereinbarung treffen (vereinbaren) · in Betracht ziehen (erwägen)
• zum Ausdruck bringen (ausdrücken) · in Kauf nehmen (einen Nachteil akzeptieren) · Rücksicht nehmen auf (berücksichtigen)

REGEL 2 · AKTIV UND PASSIV, ABSICHT UND ZUFALL
Viele Funktionsverbgefüge bilden Paare. Mit dem einen Verb handelt jemand, mit dem anderen geschieht etwas. [fr?] Beaucoup forment des paires : l’un est actif, l’autre a un sens passif.
• zur Sprache bringen → zur Sprache kommen: Das Thema kommt beim Treffen zur Sprache.
• zur Verfügung stellen → zur Verfügung stehen: Der Raum steht allen zur Verfügung.
• zum Ausdruck bringen → zum Ausdruck kommen: Darin kommt sein guter Wille zum Ausdruck.
• in Gang setzen → in Gang kommen · unter Druck setzen → unter Druck geraten
„Geraten“ zeigt, dass man ungewollt in eine Situation kommt: in Konflikt geraten, in Streit geraten, in Schwierigkeiten geraten. [fr?] « geraten » : se retrouver dans une situation sans le vouloir.

REGEL 3 · STELLUNG UND VERNEINUNG
• Der Nomenteil steht am Ende des Mittelfelds, wie eine Verbpartikel: Er stellt die Regeln nicht in Frage.
• Nomen ohne Artikel werden meist mit „kein“ verneint: keine Rücksicht nehmen, keine Kritik üben.
• Nomen mit Präposition werden mit „nicht“ verneint: nicht in Frage kommen, nicht zur Sprache bringen.
[fr?] La partie nominale à la fin ; négation par kein sans article, par nicht avec préposition.

REGEL 4 · DIPLOMATIE IM KONJUNKTIV II
In Konflikten und formellen Situationen machen Konjunktiv-II-Formen eine Aussage vorsichtiger und lassen dem anderen Raum. [fr?] Le Konjunktiv II rend demandes, critiques et propositions plus prudentes.
• Bitten: Könnten Sie …? · Würden Sie bitte …? · Wäre es möglich, dass …? · Ich hätte da eine Bitte.
• Vorschläge: Ich würde vorschlagen, … · Wie wäre es, wenn …? · Man könnte auch …
• Kritik und Widerspruch: Ich würde das etwas anders sehen. · Wäre es nicht besser, …? · Ich hätte gedacht, dass …
• Formen: hätte, wäre, könnte, würde, dürfte, müsste, sollte. Höfliche Frage um Erlaubnis: Dürfte ich kurz etwas sagen?

REGEL 5 · WEITERE MITTEL DER DIPLOMATIE
• Abschwächen: vielleicht, etwas, ein bisschen, eher, eigentlich, möglicherweise
• Ich-Botschaften statt Vorwürfe: „Ich habe den Eindruck, dass es abends oft laut ist“ statt „Sie sind immer laut“.
• Verallgemeinerungen vermeiden: „immer“, „nie“, „ständig“ machen einen Konflikt größer.
[fr?] Atténuer, parler en « je », éviter « toujours » et « jamais ».

ACHTUNG
• Funktionsverbgefüge nicht wörtlich übersetzen: Eine Entscheidung trifft man, eine Frage stellt man, Kritik übt man. [fr?] On ne « fait » ni une décision ni une critique.
• „Ich würde haben“ ist falsch: Bei „haben“ und „sein“ nimmt man „hätte“ und „wäre“. [fr?] Avec haben et sein : hätte, wäre.
• Zu viel Konjunktiv wirkt unsicher. In einer klaren Bitte reicht oft eine Form: „Könnten Sie das Radio leiser stellen?“ [fr?] Trop de conditionnels nuisent à la clarté.` } },

    // 6 · Grammaire : s'entraîner
    { id: 'b2-zusammenleben-grammatik', kind: 'exercise', title: 'Üben: Funktionsverbgefüge und Diplomatie', estimatedMinutes: 15,
      competences: ['lecture', 'expression-ecrite'],
      lesson: { description: `${aide('Üben Sie die Funktionsverbgefüge und die diplomatischen Formen. Achten Sie bei jeder Aufgabe auf die Situation: Wer spricht mit wem?', 'Entraînez-vous aux locutions verbo-nominales et aux formes diplomatiques ; pensez à la situation.')}

MERKE
• Das Nomen trägt die Bedeutung, das Verb steht an Position 2, der Nomenteil am Ende. [fr?] Le nom porte le sens ; la partie nominale va à la fin.
• bringen / setzen / stellen (aktiv) ↔ kommen / geraten / stehen (passive Bedeutung) [fr?] Paires actif / passif.
• Könnten Sie …? · Wäre es möglich, …? · Ich würde vorschlagen, … [fr?] Formules diplomatiques.` },
      questions: [
        hints(fill('q1', aide('Ergänzen Sie das passende Verb.', 'Complétez avec le verbe qui convient.'),
          'Ich möchte heute ein Problem zur Sprache [[1]]. · Niemand hat die Hausordnung in Frage [[2]]. · [[3]] Sie bitte Rücksicht auf die Nachbarn! · Wir müssen bis Freitag eine Entscheidung [[4]].',
          [['bringen'], ['gestellt'], ['Nehmen'], ['treffen']],
          aide('Die Verben gehören fest zum Nomen: zur Sprache bringen, in Frage stellen (Perfekt: gestellt), Rücksicht nehmen (Imperativ: Nehmen Sie …), eine Entscheidung treffen. Mit „machen“ oder „haben“ wären alle vier Sätze falsch.',
            'Verbes figés : bringen, stellen, nehmen, treffen ; jamais « machen ».')),
        'Sprache', 'Frage', 'Rücksicht', 'Entscheidung'),
        match('q2', aide('Was bedeuten die Funktionsverbgefüge?', 'Que signifient ces locutions ?'),
          [['in Kauf nehmen', 'einen Nachteil akzeptieren'], ['in Betracht ziehen', 'als Möglichkeit prüfen'],
            ['zum Ausdruck bringen', 'deutlich zeigen oder sagen'], ['in Konflikt geraten', 'ohne Absicht in einen Streit kommen'],
            ['zur Verfügung stehen', 'für jemanden da sein, nutzbar sein']],
          aide('„In Kauf nehmen“ betrifft immer etwas Negatives, das man wegen eines Vorteils akzeptiert. „In Betracht ziehen“ heißt ernsthaft überlegen. „Geraten“ zeigt, dass etwas ungewollt geschieht. „Zur Verfügung stehen“ hat passive Bedeutung (der Raum steht allen zur Verfügung).',
            'accepter un inconvénient, envisager, exprimer, entrer en conflit sans le vouloir, être disponible.')),
        choice('q3', aide('„Das Thema Lärm … bei der Versammlung zur Sprache.“ Welches Verb passt?', 'Quel verbe convient ?'),
          [['brachte'], ['stellte'], ['kam', true], ['nahm']],
          aide('Der Satz hat kein handelndes Subjekt: Das Thema selbst „kommt zur Sprache“ (= wird angesprochen). „Brachte“ bräuchte jemanden, der das Thema anspricht, und ein Akkusativobjekt: Herr Wieczorek brachte das Thema zur Sprache. „Stellen“ und „nehmen“ passen nicht zu „zur Sprache“.',
            'Sans agent, sens passif : das Thema kam zur Sprache.')),
        hints(fill('q4', aide('Ergänzen Sie die Formen im Konjunktiv II.', 'Complétez avec le Konjunktiv II.'),
          'Ich [[1]] da eine kleine Bitte. · [[2]] es möglich, die Fahrräder in den Hof zu stellen? · [[3]] Sie das Radio vielleicht etwas leiser stellen? · Wir [[4]] die Regel zunächst ausprobieren.',
          [['hätte'], ['Wäre'], ['Könnten', 'Würden'], ['sollten', 'könnten']],
          aide('haben → hätte, sein → wäre, können → könnten, sollen → sollten (ein vorsichtiger Vorschlag). Bei „haben“ und „sein“ benutzt man die eigene Form, nicht „würde haben“. In der dritten Bitte ist auch „Würden Sie … stellen?“ höflich und richtig.',
            'hätte, wäre, könnten (ou würden), sollten ; pas de « würde haben ».')),
        'haben', 'sein', 'können', 'sollen'),
        choice('q5', aide('Das Fahrrad Ihres Nachbarn steht wieder im Flur. Was sagen Sie am diplomatischsten?', 'Le vélo de votre voisin est encore dans le couloir. Que dites-vous avec le plus de diplomatie ?'),
          [['Wäre es vielleicht möglich, das Fahrrad in den Hof zu stellen?', true],
            ['Ihr Fahrrad steht schon wieder im Flur, so geht das nicht.'],
            ['Stellen Sie Ihr Fahrrad bitte sofort und für immer in den Hof!'],
            ['Sie sollten endlich lernen, auf andere Rücksicht zu nehmen.']],
          aide('Konjunktiv II (wäre), die Frage nach einer Möglichkeit und „vielleicht“ machen die Bitte freundlich, ohne das Problem zu verschweigen. Die zweite Antwort ist ein Vorwurf („schon wieder“), die dritte ein Befehl, die vierte eine persönliche Belehrung.',
            'Konjunktiv II + possibilité + atténuation : demande ferme mais aimable.')),
        order('q6', C2.ordnen, [
          ['Ich', 'würde', 'vorschlagen,', 'dass', 'wir', 'die neue Regel', 'zunächst', 'vier Wochen lang', 'ausprobieren.'],
          ['Ich', 'würde', 'vorschlagen,', 'dass', 'wir', 'zunächst', 'die neue Regel', 'vier Wochen lang', 'ausprobieren.']],
          aide('„Ich würde vorschlagen“ leitet den Vorschlag vorsichtig ein. Im Nebensatz mit „dass“ steht das Verb „ausprobieren“ am Ende. Das Objekt „die neue Regel“ kann vor oder nach „zunächst“ stehen; die Zeitdauer „vier Wochen lang“ steht direkt vor dem Verb.',
            'Ich würde vorschlagen, dass … + verbe à la fin de la subordonnée.')),
        choice('q7', aide('Welcher Satz ist eine Ich-Botschaft?', 'Quelle phrase est un message en « je » ?'),
          [['Sie nehmen nie Rücksicht auf die anderen Leute hier im Haus.'],
            ['Alle im Haus sind schon lange genervt von Ihrem lauten Radio.'],
            ['Ihre Kinder sind abends wirklich viel zu laut, das wissen Sie doch.'],
            ['Ich schlafe schlecht, wenn der Ball abends gegen mein Fenster knallt.', true]],
          aide('Eine Ich-Botschaft beschreibt die eigene Situation und das eigene Gefühl („Ich schlafe schlecht, wenn …“), statt die andere Person zu bewerten. Die anderen Sätze sind Du- oder Sie-Botschaften mit Vorwurf; „nie“ und „alle“ verallgemeinern zusätzlich.',
            'Le message en « je » décrit son vécu au lieu d’accuser ; éviter « nie », « alle ».')),
        fill('q8', aide('Ersetzen Sie das Verb durch ein Funktionsverbgefüge.', 'Remplacez le verbe par une locution.'),
          'kritisieren → Kritik [[1]] · ausdrücken → zum Ausdruck [[2]] · erwägen → in Betracht [[3]] · vereinbaren → eine Vereinbarung [[4]]',
          [['üben'], ['bringen'], ['ziehen'], ['treffen']],
          aide('Die Funktionsverben sind fest: Kritik üben (an + Dativ), zum Ausdruck bringen, in Betracht ziehen, eine Vereinbarung treffen. In formellen Briefen klingen diese Wendungen sachlicher als die einfachen Verben.',
            'Kritik üben, zum Ausdruck bringen, in Betracht ziehen, eine Vereinbarung treffen.')),
        order('q9', C2.ordnen, [
          ['Wir', 'sollten', 'bei der nächsten Versammlung', 'unbedingt', 'das Thema', 'Fahrräder', 'zur Sprache', 'bringen.'],
          ['Wir', 'sollten', 'das Thema', 'Fahrräder', 'bei der nächsten Versammlung', 'unbedingt', 'zur Sprache', 'bringen.']],
          aide('Das Modalverb „sollten“ steht an Position 2, der Infinitiv „bringen“ am Ende. Direkt davor steht der Nomenteil „zur Sprache“, wie eine Verbpartikel. Die Zeitangabe und das Objekt können ihre Reihenfolge tauschen.',
            'Modal en 2e position ; « zur Sprache » juste avant l’infinitif final.')),
        choice('q10', aide('Wie kritisieren Sie einen Vorschlag sachlich und vorsichtig?', 'Comment critiquer une proposition de façon factuelle et prudente ?'),
          [['Ihr Vorschlag ist schlecht, das sieht doch jeder sofort.'],
            ['Ich bin nicht sicher, ob diese Lösung für alle passt.', true],
            ['Darüber müssen wir gar nicht erst diskutieren.'],
            ['Das ist mal wieder typisch für Sie, Herr Wieczorek.']],
          aide('„Ich bin nicht sicher, ob …“ äußert Zweifel als eigene Einschätzung und lässt das Gespräch offen. Die anderen Sätze bewerten den Vorschlag pauschal, brechen die Diskussion ab oder greifen die Person an.',
            'Exprimer un doute à la première personne garde le dialogue ouvert.')),
      ] },

    // 7 · Lexique
    { id: 'b2-zusammenleben-wortschatz', kind: 'exercise', title: 'Wortschatz: Konflikte und Verständigung', estimatedMinutes: 14,
      competences: ['lecture', 'expression-ecrite'],
      lesson: { description: `${aide('Lernen Sie die Wörter für Konflikte und ihre Lösung: feste Verbindungen, Wortfamilien, Verben mit Präposition und Redewendungen.', 'Apprenez le vocabulaire du conflit et de sa résolution : combinaisons, familles de mots, verbes prépositionnels, expressions.')}

TIPP
Wer Konflikte beschreibt, braucht neutrale Wörter. Sagen Sie „Herr Wieczorek wünscht sich Ruhe am Abend“ statt „Herr Wieczorek nervt“. So bleiben Sie sachlich, auch wenn Sie selbst betroffen sind. [fr?] Pour décrire un conflit, choisissez des mots neutres.` },
      questions: [
        match('q1', aide('Welches Verb passt?', 'Quel verbe convient ?'),
          [['einen Konflikt', 'beilegen'], ['einen Kompromiss', 'eingehen'], ['Vorurteile', 'abbauen'], ['ein Missverständnis', 'ausräumen'],
            ['eine Vereinbarung', 'treffen'], ['eine Grenze', 'ziehen']],
          aide('Einen Konflikt beilegen (beenden), einen Kompromiss eingehen (akzeptieren), Vorurteile abbauen (verringern), ein Missverständnis ausräumen (klären), eine Vereinbarung treffen, eine Grenze ziehen (deutlich sagen, was nicht mehr geht). Diese Verbindungen sind typisch für die Sprache der Konfliktlösung.',
            'Régler un conflit, accepter un compromis, faire reculer les préjugés, dissiper un malentendu, conclure un accord, fixer une limite.')),
        fill('q2', aide('Bilden Sie das Nomen.', 'Formez le nom.'),
          'falsch verstehen → das [[1]] · vermitteln → die [[2]] · tolerant → die [[3]] · sich einigen → die [[4]] · empfindlich → die [[5]]',
          [['Missverständnis'], ['Vermittlung'], ['Toleranz'], ['Einigung'], ['Empfindlichkeit']],
          aide('„Miss-“ zeigt, dass etwas falsch läuft: das Missverständnis (Plural: die Missverständnisse). Aus Verben entstehen Nomen auf -ung (die Vermittlung, die Einigung), aus Adjektiven Nomen auf -keit (die Empfindlichkeit). Das Fremdwort „tolerant“ bildet „die Toleranz“.',
            'Miss- (erreur), -ung (action), -keit (qualité), Toleranz.')),
        fill('q3', aide('Ergänzen Sie die Präpositionen.', 'Complétez avec les prépositions.'),
          'Er hat sich bei der Hausverwaltung [[1]] den Lärm beschwert. · Am Ende haben sich beide [[2]] eine Probezeit geeinigt. · Bitte nehmen Sie Rücksicht [[3]] die Nachbarn. · Leider ist er mit seiner Nachbarin [[4]] Streit geraten.',
          [['über'], ['auf'], ['auf'], ['in']],
          aide('sich beschweren über + Akkusativ (bei + Dativ für die Person), sich einigen auf + Akkusativ, Rücksicht nehmen auf + Akkusativ, in Streit geraten mit + Dativ. Die Präpositionen muss man mit dem Verb zusammen lernen.',
            'sich beschweren über, sich einigen auf, Rücksicht nehmen auf, in Streit geraten.')),
        choice('q4', aide('Was bedeutet „jemandem eine gute Absicht unterstellen“?', 'Que signifie cette expression ?'),
          [['jemandem verbieten, etwas Gutes zu tun'],
            ['annehmen, dass jemand es gut meint', true],
            ['jemanden um einen Gefallen bitten'],
            ['jemandem eine Aufgabe geben']],
          aide('„Unterstellen“ heißt: jemandem eine Absicht zuschreiben, ohne sie zu kennen. Meist ist das negativ („Sie unterstellen mir eine Lüge“). Die Autorin des Artikels rät, das Gegenteil zu tun: dem Gegenüber zunächst eine gute Absicht zu unterstellen, also anzunehmen, dass es es gut meint.',
            '« unterstellen » = prêter une intention ; ici, supposer la bonne foi de l’autre.')),
        choice('q5', aide('Sie möchten ein mögliches Missverständnis klären. Was sagen Sie?', 'Vous voulez clarifier un éventuel malentendu. Que dites-vous ?'),
          [['Das haben Sie bestimmt absichtlich so gesagt, oder?'],
            ['Darüber rede ich nicht mehr, das ist für mich erledigt.'],
            ['Wie haben Sie das gemeint? Ich möchte Sie richtig verstehen.', true],
            ['Das ist bei Ihnen eben so, da kann man nichts machen.']],
          aide('Eine offene Frage nach dem Gemeinten („Wie haben Sie das gemeint?“) und eine Ich-Aussage („Ich möchte Sie richtig verstehen“) klären, ohne anzugreifen. Genau das empfiehlt der Artikel. Die anderen Antworten unterstellen Absicht, brechen ab oder stecken die Person in eine Schublade.',
            'Question ouverte + message en « je » : clarifier sans accuser.')),
        choice('q6', aide('„Man sollte niemanden in eine Schublade stecken.“ Was heißt das?', 'Que signifie cette phrase ?'),
          [['Man sollte Ordnung in seinen Unterlagen und in allen Schubladen halten.'],
            ['Man sollte niemanden einsperren oder vor anderen verstecken.'],
            ['Man sollte vor Freunden und Nachbarn keine Geheimnisse haben.'],
            ['Man sollte Menschen nicht vorschnell nach Klischees beurteilen.', true]],
          aide('Die Redewendung beschreibt das Einordnen eines Menschen in eine feste Kategorie, oft nach Herkunft, Alter oder Beruf, ohne die Person selbst kennenzulernen. Das Bild: Jeder bekommt eine Schublade mit Etikett. Die wörtlichen Deutungen sind hier falsch.',
            '« in eine Schublade stecken » = enfermer dans une case, juger d’après un cliché.')),
      ] },

    // 8 · Second document (thème pair : lecture)
    { id: 'b2-zusammenleben-lesen2', kind: 'exercise', title: 'Verstehen: eine Kolumne über zwei Missverständnisse', estimatedMinutes: 18,
      competences: ['lecture'],
      lesson: { description: `${C2.lesen}

TIPP
Eine Kolumne ist ein persönlicher, oft ironischer Text. Nicht alles ist wörtlich gemeint: Achten Sie auf Übertreibungen und Vergleiche, die einen Gedanken witzig zuspitzen. [fr?] Une chronique est personnelle et souvent ironique : repérez exagérations et comparaisons.

KOMMEN SIE DOCH MAL VORBEI!
Eine Kolumne von Yannick Morel

Als ich vor sechs Jahren von Marseille nach Bremen zog, hatte ich mich gut vorbereitet. Ich hatte gelesen, dass die Deutschen pünktlich sind, ihre Meinung direkt sagen und ungern über Gefühle sprechen. Mit diesem Wissen, dachte ich, könne mir nichts passieren. Ich lag gründlich falsch.

Das erste Missverständnis ereignete sich im Treppenhaus. Meine neue Nachbarin, Frau Hinrichs, eine pensionierte Lehrerin, sagte nach unserem dritten Gespräch über das Wetter: „Kommen Sie doch mal vorbei!“ Bei uns im Süden ist ein solcher Satz eine Höflichkeitsformel, ungefähr so verbindlich wie ein Wetterbericht. Ich habe mich deshalb nie bei ihr gemeldet. Drei Monate später erfuhr ich vom Hausmeister, dass sie extra einen Kuchen gebacken hatte, und zwar zweimal. Ihre Einladung war ernst gemeint gewesen.

Das zweite Missverständnis hatte ausgerechnet mit der Direktheit zu tun, auf die ich mich doch so gut vorbereitet hatte. Als ich meinem Kollegen Torben meine erste Präsentation zeigte, sagte er: „Nicht schlecht, aber die Folien sind zu voll.“ Ich hörte nur den zweiten Teil und war zwei Tage lang beleidigt. Torben dagegen wunderte sich, warum ich ihm in der Kantine keine Gesellschaft mehr leistete. Für ihn war „nicht schlecht“ ein großes Lob gewesen; im Norden ist das fast schon Begeisterung.

Ich will damit nicht sagen, dass alle Ratgeber falsch liegen. Aber sie hatten mir eine Brille aufgesetzt, durch die ich nur noch sah, was ich erwartete. Frau Hinrichs war gar nicht distanziert, und Torben war nicht unhöflich, sondern sachlich und, wie sich herausstellte, ausgesprochen herzlich.

Inzwischen habe ich eine einfache Regel: Wenn mich etwas irritiert, frage ich nach. „Meinen Sie das ernst mit dem Vorbeikommen?“ klingt vielleicht ungeschickt, erspart aber zwei Kuchen. Und wenn Torben heute „nicht schlecht“ sagt, lade ich ihn auf ein Bier ein.

Frau Hinrichs und ich trinken übrigens seit fünf Jahren an jedem ersten Sonntag im Monat zusammen Kaffee. Den Kuchen backe inzwischen ich.` },
      placements: [{ media: 'b2-zusammenleben-lesen2-kolumne', caption: 'Kolumne: Kommen Sie doch mal vorbei!' }],
      questions: [
        choice('q1', aide('Worum geht es in der Kolumne vor allem?', 'De quoi parle surtout la chronique ?'),
          [['wie man in Bremen schnell Freunde findet'],
            ['wie Erwartungen zu Missverständnissen führen können', true],
            ['warum Kuchen in Norddeutschland so beliebt ist'],
            ['wie man eine gute Präsentation vorbereitet']],
          aide('Der Autor hatte sich mit Ratgebern „gut vorbereitet“ und erlebt gerade deshalb zwei Missverständnisse. Sein Fazit: Die Ratgeber hatten ihm „eine Brille aufgesetzt, durch die ich nur noch sah, was ich erwartete“. Das ist dieselbe Idee wie im Artikel von Dr. Achterberg.',
            'Les attentes tirées des guides provoquent les malentendus.')),
        choice('q2', aide('Warum hat sich der Autor nie bei Frau Hinrichs gemeldet?', 'Pourquoi l’auteur n’est-il jamais allé chez Mme Hinrichs ?'),
          [['Er hatte keine Zeit, weil er viel arbeitete.'],
            ['Er fand Frau Hinrichs distanziert und ziemlich unfreundlich.'],
            ['Er hielt die Einladung für eine reine Höflichkeitsformel.', true],
            ['Er wusste nicht, in welcher Wohnung sie wohnt.']],
          aide('„Bei uns im Süden ist ein solcher Satz eine Höflichkeitsformel“: Er übertrug die Bedeutung aus seiner Heimat auf die neue Situation. Frau Hinrichs meinte die Einladung dagegen ernst und backte sogar zweimal Kuchen.',
            'Il a pris l’invitation pour une simple formule de politesse.')),
        choice('q3', aide('„Ungefähr so verbindlich wie ein Wetterbericht“: Was meint der Autor?', 'Que veut dire l’auteur par cette comparaison ?'),
          [['Man sollte die Einladung sehr ernst nehmen.'],
            ['Die Einladung hängt vom Wetter ab.'],
            ['Der Satz verpflichtet zu nichts.', true],
            ['Man spricht im Süden viel über das Wetter.']],
          aide('Ein Wetterbericht ist eine Vorhersage ohne Garantie. Der ironische Vergleich bedeutet: Der Satz „Kommen Sie doch mal vorbei!“ ist in Marseille kaum verbindlich, man muss ihn nicht wörtlich nehmen. Das Wetter selbst spielt keine Rolle.',
            'Comparaison ironique : la formule n’engage à rien.')),
        rf('q4', 'Torben fand die Präsentation schlecht.', 'f',
          aide('Falsch: „Für ihn war ‚nicht schlecht‘ ein großes Lob gewesen.“ Die Kritik an den Folien war nur ein Detail. Der Autor hörte „nur den zweiten Teil“ und verstand deshalb das Lob nicht. Die Untertreibung „nicht schlecht“ ist in Norddeutschland ein typisches Kompliment.',
            'Faux : « nicht schlecht » était un vrai compliment (litote).')),
        choice('q5', aide('Was meint der Autor mit dem Satz „Sie hatten mir eine Brille aufgesetzt“?', 'Que signifie l’image des lunettes ?'),
          [['Die Ratgeber hatten seine Wahrnehmung gefiltert.', true],
            ['Er hatte wegen der vielen Bücher schlechte Augen.'],
            ['Er wollte in Bremen intellektueller wirken.'],
            ['Die Ratgeber hatten ihm geholfen, klarer zu sehen.']],
          aide('Das Bild der Brille steht für eine Sichtweise: Durch sie sah er „nur noch, was ich erwartete“. Die Ratgeber haben also nicht geholfen, klarer zu sehen, sondern seinen Blick eingeschränkt. Die anderen Antworten nehmen das Bild wörtlich oder drehen es um.',
            'Les guides ont filtré sa perception : il ne voyait que ce qu’il attendait.')),
        choice('q6', aide('Welche Regel hat der Autor heute?', 'Quelle règle l’auteur suit-il aujourd’hui ?'),
          [['Er liest vor jeder Reise einen neuen Ratgeber.'],
            ['Er nimmt Einladungen grundsätzlich nicht mehr an.'],
            ['Er sagt Kritik nur noch unter vier Augen.'],
            ['Er fragt nach, wenn ihn etwas irritiert.', true]],
          aide('„Inzwischen habe ich eine einfache Regel: Wenn mich etwas irritiert, frage ich nach.“ Die Frage klingt vielleicht „ungeschickt“, aber sie „erspart zwei Kuchen“, also unnötige Missverständnisse. Das entspricht dem Rat des Artikels: „Wie meinst du das?“',
            'Il demande des précisions quand quelque chose le dérange.')),
        rf('q7', 'Frau Hinrichs und der Autor treffen sich heute regelmäßig.', 'r',
          aide('Richtig: Sie trinken „seit fünf Jahren an jedem ersten Sonntag im Monat zusammen Kaffee“. Die Pointe am Ende: Inzwischen backt der Autor den Kuchen, die Rollen haben sich umgekehrt.',
            'Vrai : ils se voient chaque premier dimanche du mois.')),
      ] },

    // 9 · Vérifier
    { id: 'b2-zusammenleben-kontrolle', kind: 'exercise', title: 'Prüfen: Konflikte, Funktionsverbgefüge und Diplomatie', estimatedMinutes: 12,
      competences: ['lecture', 'ecoute'],
      lesson: { description: `${aide('Prüfen Sie, was Sie in diesem Modul gelernt haben: Hören, Grammatik und Wortschatz.', 'Vérifiez ce que vous avez appris : écoute, grammaire et vocabulaire.')}

${aide('Vier Wochen nach der Mediation schickt Frau Asante Herrn Wieczorek eine Sprachnachricht. Hören Sie sie für die Fragen 1 und 2.', 'Quatre semaines après la médiation, Mme Asante laisse un message à M. Wieczorek ; écoutez-le pour les questions 1 et 2.')}` },
      placements: [{ media: 'b2-zusammenleben-kontrolle-audio', caption: 'Sprachnachricht von Frau Asante' }],
      questions: [
        choice('q1', aide('Wie beurteilt Frau Asante die ersten vier Wochen?', 'Comment Mme Asante juge-t-elle les quatre premières semaines ?'),
          [['Sie findet, dass die Vereinbarung gut funktioniert.', true],
            ['Sie möchte die Vereinbarung sofort beenden.'],
            ['Sie beschwert sich, dass Herr Wieczorek sie nicht einhält.'],
            ['Sie sagt, dass die Kinder nicht mehr im Hof spielen.']],
          aide('„Ich habe den Eindruck, dass es gut klappt“: Die Kinder spielen mit dem weichen Ball am Fahrradständer und kommen um sieben herein. Die Vereinbarung wird also eingehalten. Ihre Ich-Botschaft („Ich habe den Eindruck …“) ist selbst ein Beispiel für vorsichtige Kommunikation.',
            'L’accord fonctionne ; la formulation en « je » reste prudente.')),
        choice('q2', aide('Welches neue Anliegen bringt Frau Asante zur Sprache?', 'Quelle nouvelle demande formule-t-elle ?'),
          [['Herr Wieczorek soll den Kinderwagen im Keller lassen.'],
            ['Die Kinder sollen am Wochenende länger spielen dürfen.'],
            ['Das Radio von Herrn Wieczorek soll morgens leiser sein.', true],
            ['Das nächste Treffen soll früher stattfinden.']],
          aide('„Wäre es möglich, dass Ihr Radio morgens etwas leiser läuft? Mein Mann schläft nach der Nachtschicht bis mittags.“ Sie formuliert die Bitte im Konjunktiv II, schwächt sie mit „etwas“ ab und schlägt vor, darüber beim Treffen zu sprechen.',
            'Elle demande, avec diplomatie, que la radio soit moins forte le matin.')),
        fill('q3', aide('Ergänzen Sie die Funktionsverbgefüge.', 'Complétez les locutions.'),
          'Frau Asante möchte noch ein Thema zur Sprache [[1]]. · Sie bittet Herrn Wieczorek, auf ihren Mann Rücksicht zu [[2]]. · Beim Treffen wollen beide eine neue Vereinbarung [[3]].',
          [['bringen'], ['nehmen'], ['treffen']],
          aide('Zur Sprache bringen, Rücksicht nehmen auf, eine Vereinbarung treffen. Nach „bitten“ folgt eine Infinitivgruppe mit „zu“: „Rücksicht zu nehmen“. Der Nomenteil steht vor dem Verb am Ende.',
            'zur Sprache bringen, Rücksicht nehmen, eine Vereinbarung treffen.')),
        order('q4', C2.ordnen, [
          ['Wäre', 'es', 'möglich,', 'dass', 'Ihr Radio', 'morgens', 'etwas', 'leiser', 'läuft?'],
          ['Wäre', 'es', 'möglich,', 'dass', 'morgens', 'Ihr Radio', 'etwas', 'leiser', 'läuft?']],
          aide('Die diplomatische Bitte beginnt mit „Wäre es möglich, …“. Im Nebensatz mit „dass“ steht das konjugierte Verb „läuft“ am Ende, „etwas leiser“ direkt davor. Die Zeitangabe „morgens“ kann vor oder nach dem Subjekt stehen.',
            'Wäre es möglich, dass … + verbe conjugué en fin de subordonnée.')),
        choice('q5', aide('Welcher Satz ist eine diplomatische Bitte an eine Kollegin?', 'Quelle phrase est une demande diplomatique à une collègue ?'),
          [['Du telefonierst schon wieder viel zu laut.'],
            ['Telefonier gefälligst draußen auf dem Flur!'],
            ['Könntest du vielleicht etwas leiser telefonieren?', true],
            ['Das ist mal wieder typisch für dich.']],
          aide('Konjunktiv II (könntest), „vielleicht“ und „etwas“ machen die Bitte weich, ohne das Problem zu verschweigen. „Schon wieder“, „gefälligst“ und „typisch für dich“ sind Vorwürfe, die einen Konflikt eher verschärfen.',
            'Konjunktiv II + atténuateurs ; éviter reproches et généralisations.')),
        choice('q6', aide('Was bedeutet „ein Missverständnis ausräumen“?', 'Que signifie « ein Missverständnis ausräumen » ?'),
          [['ein Missverständnis aufschreiben'],
            ['ein Missverständnis klären und beenden', true],
            ['ein Missverständnis absichtlich verursachen'],
            ['ein Missverständnis an andere weitererzählen']],
          aide('„Ausräumen“ bedeutet wörtlich, etwas aus einem Raum herausnehmen. Im übertragenen Sinn räumt man Zweifel, Bedenken oder Missverständnisse aus, das heißt: Man klärt sie, bis sie nicht mehr da sind.',
            '« ausräumen » = dissiper, éclaircir.')),
        choice('q7', aide('„Ich … gern noch etwas dazu sagen.“ Welche Form passt?', 'Quelle forme convient ?'),
          [['hätte'], ['wäre'], ['würde', true], ['könnte']],
          aide('„Ich würde gern noch etwas dazu sagen“ ist eine höfliche Art, um das Wort zu bitten: würde + gern + Infinitiv. „Hätte“ und „wäre“ brauchen ein anderes Verb („Ich hätte gern das Wort“); „könnte gern“ ist keine übliche Verbindung.',
            '« Ich würde gern … » : demander la parole poliment.')),
      ] },
  ],
};
