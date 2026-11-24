// Module B2 n° 15 · thème « Wirtschaft » (lot R7, thème 8). Consommation, publicité et durabilité : un article d'analyse
// sur la publicité « verte » (thèse, point de vue de l'autrice, comparaison d'une experte), une émission de radio sur les
// pièges de l'achat en ligne (prise de notes longue), un fil de forum sur la seconde main (second document, thème pair :
// -lesen2, « qui dit quoi ? »). Grammaire : comparaison irréelle (als ob, als wenn, als + verbe ; Konjunktiv II, au passé
// aussi) ; adjectifs à préposition (stolz auf, abhängig von, zufrieden mit, verantwortlich für…) et pronoms adverbiaux.
// Consignes, règles et explications en allemand avec aide française repliée ([fr?]) ; lexique traduit en français.
import { C2, aide, choice, fill, order, match } from '../../lib.mjs';

/** « Richtig / falsch / steht nicht im Text » : r, f ou n pour la bonne réponse. */
const rf = (id, statement, answer, explanation) => choice(id, `„${statement}“ ${C2.richtigFalsch}`,
  [['richtig', answer === 'r'], ['falsch', answer === 'f'], ['steht nicht im Text', answer === 'n']], explanation);
/** Indices affichés sous les trous d'un fill (forme de base à transformer). */
const hints = (question, ...values) => ({ ...question,
  blanks: question.blanks.map((blank, index) => (values[index] ? { ...blank, hint: values[index] } : blank)) });

export default {
  id: 'b2-wirtschaft',
  title: 'Wirtschaft: Konsum, Werbung und Nachhaltigkeit',
  objective: 'Comprendre un article d’analyse sur la publicité « verte » et une émission sur les pièges de l’achat en ligne, confronter des avis sur la seconde main, décrire une apparence trompeuse (als ob, als wenn, als + Konjunktiv II) et employer les adjectifs à préposition (stolz auf, abhängig von, zufrieden mit, verantwortlich für).',
  grammarFocus: ['als-ob', 'adjektive-mit-praepositionen'],
  sources: [
    'Textes, dialogues et exercices originaux LinguaCap. Personnes, émission, forum et produits sont fictifs ; aucune marque réelle.',
    'Repères juridiques publics résumés : règles européennes contre les allégations environnementales vagues ou fondées sur la seule compensation, interdiction des cases précochées payantes, bouton de résiliation obligatoire en Allemagne depuis 2022, droit de rétractation de 14 jours.',
  ],

  vocabulary: [
    { word: 'Werbung', article: 'die', plural: null, partOfSpeech: 'noun', translation: 'la publicité',
      example: 'Kaum eine Werbung kommt heute ohne Umweltversprechen aus.', note: 'sans pluriel ; der Werbespot : le spot publicitaire' },
    { word: 'werben mit', partOfSpeech: 'verb', translation: 'faire de la publicité en mettant en avant',
      example: 'Die Firma wirbt mit einem grünen Blatt auf der Verpackung.', note: '+ datif · wirbt, warb, hat geworben · werben für : faire de la publicité pour' },
    { word: 'Verbraucher', article: 'der', plural: 'Verbraucher', partOfSpeech: 'noun', translation: 'le consommateur',
      example: 'Viele Verbraucher achten beim Einkauf auf Siegel.', note: 'féminin : die Verbraucherin' },
    { word: 'Siegel', article: 'das', plural: 'Siegel', partOfSpeech: 'noun', translation: 'le label',
      example: 'Ein gutes Siegel wird von einer unabhängigen Stelle vergeben.', note: null },
    { word: 'nachhaltig', partOfSpeech: 'adjective', translation: 'durable, responsable',
      example: 'Viele Kunden zahlen für nachhaltige Produkte gern etwas mehr.', note: 'die Nachhaltigkeit : la durabilité' },
    { word: 'irreführend', partOfSpeech: 'adjective', translation: 'trompeur',
      example: 'Die Aussage auf der Verpackung ist irreführend.', note: 'in die Irre führen : induire en erreur' },
    { word: 'versprechen', partOfSpeech: 'verb', translation: 'promettre',
      example: 'Werbung sollte nichts versprechen, was das Produkt nicht halten kann.', note: 'verspricht, versprach, hat versprochen · das Versprechen : la promesse' },
    { word: 'Hersteller', article: 'der', plural: 'Hersteller', partOfSpeech: 'noun', translation: 'le fabricant',
      example: 'Der Hersteller muss seine Angaben belegen können.', note: null },
    { word: 'Kaufentscheidung', article: 'die', plural: 'Kaufentscheidungen', partOfSpeech: 'noun', translation: 'la décision d’achat',
      example: 'Für eine Kaufentscheidung haben wir oft nur ein paar Sekunden.', note: 'eine Entscheidung treffen : prendre une décision' },
    { word: 'Lebensdauer', article: 'die', plural: null, partOfSpeech: 'noun', translation: 'la durée de vie',
      example: 'Eine lange Lebensdauer ist gut für die Umwelt.', note: 'sans pluriel' },
    { word: 'Abonnement', article: 'das', plural: 'Abonnements', partOfSpeech: 'noun', translation: 'l’abonnement',
      example: 'Das kostenlose Probeabonnement verlängert sich automatisch.', note: 'familier : das Abo, die Abos' },
    { word: 'kündigen', partOfSpeech: 'verb', translation: 'résilier',
      example: 'Er hat das Abo sofort gekündigt.', note: 'die Kündigung : la résiliation' },
    { word: 'hereinfallen auf', partOfSpeech: 'verb', translation: 'se laisser prendre à, se faire avoir par',
      example: 'Viele fallen auf solche Tricks herein.', note: '+ accusatif · séparable : herein|fallen · ist hereingefallen' },
    { word: 'den Eindruck erwecken', partOfSpeech: 'expression', translation: 'donner l’impression',
      example: 'Die Werbung erweckt den Eindruck, als wäre das Produkt besonders gesund.', note: null },
    { word: 'Der Schein trügt.', partOfSpeech: 'expression', translation: 'Les apparences sont trompeuses.',
      example: 'Die Verpackung ist grün, aber der Schein trügt.', note: null },
    { word: 'abhängig von', partOfSpeech: 'adjective', translation: 'dépendant de',
      example: 'Viele Kunden sind von schönen Bildern abhängig.', note: '+ datif · es hängt davon ab, ob … : cela dépend de …' },
    { word: 'stolz auf', partOfSpeech: 'adjective', translation: 'fier de',
      example: 'Sie ist stolz auf ihr repariertes Fahrrad.', note: '+ accusatif · stolz darauf, dass …' },
    { word: 'zufrieden mit', partOfSpeech: 'adjective', translation: 'satisfait de',
      example: 'Ich bin mit meiner alten Jacke immer noch zufrieden.', note: '+ datif' },
    { word: 'verantwortlich für', partOfSpeech: 'adjective', translation: 'responsable de',
      example: 'Wer ist für die Angaben auf der Verpackung verantwortlich?', note: '+ accusatif' },
    { word: 'überzeugt von', partOfSpeech: 'adjective', translation: 'convaincu de',
      example: 'Sie ist von dem Produkt nicht überzeugt.', note: '+ datif · davon überzeugt, dass …' },
    { word: 'misstrauisch gegenüber', partOfSpeech: 'adjective', translation: 'méfiant à l’égard de',
      example: 'Viele sind gegenüber grüner Werbung misstrauisch.', note: '+ datif · gegenüber peut se placer après le nom' },
    { word: 'bereit zu', partOfSpeech: 'adjective', translation: 'prêt à',
      example: 'Sind Sie bereit, für fair produzierte Kleidung mehr zu bezahlen?', note: '+ datif ou zu + infinitif' },
    { word: 'gebraucht', partOfSpeech: 'adjective', translation: 'd’occasion',
      example: 'Sie kauft Möbel am liebsten gebraucht.', note: 'aus zweiter Hand : de seconde main' },
    { word: 'Widerrufsrecht', article: 'das', plural: null, partOfSpeech: 'noun', translation: 'le droit de rétractation',
      example: 'Bei Onlinekäufen gilt in der Regel ein Widerrufsrecht von vierzehn Tagen.', note: 'sans pluriel' },
  ],

  media: [
    { key: 'b2-wirtschaft-lesen-artikel', kind: 'image', title: 'Article d’analyse : la publicité « verte »',
      alt: 'Début de l’article « Grün ist nur die Verpackung » : surtitre, titre, signature, chapeau et premier paragraphe sur les emballages verts et les promesses écologiques au supermarché.',
      image: { layout: 'article', kicker: 'Analyse', title: 'Grün ist nur die Verpackung', icon: 'leaf',
        byline: 'Von Ines Kalkbrenner',
        lead: 'Klimaneutraler Joghurt, naturnahes Spülmittel, T-Shirts mit gutem Gewissen: Kaum eine Werbung kommt heute ohne Umweltversprechen aus. Doch viele davon halten einer Prüfung nicht stand.',
        paragraphs: ['Wer heute durch einen Supermarkt geht, könnte meinen, die Rettung des Planeten finde zwischen Kühlregal und Kasse statt. Der Joghurt ist „klimaneutral“, das Spülmittel wird „mit Liebe zur Natur“ hergestellt, und auf den T-Shirts im Aktionsregal steht „bewusst produziert“.'] } },
    { key: 'b2-wirtschaft-hoeren-audio', kind: 'audio', title: 'Émission de radio : les pièges des boutiques en ligne',
      script: [
        { voice: 'sprecher', name: 'Moderator', text: 'Willkommen bei „Wirtschaft am Mittag“. Nur noch zehn Minuten, nur noch zwei Stück auf Lager, gerade sehen sich fünfzehn andere Personen dieses Angebot an: Wer online einkauft, kennt solche Hinweise. Was steckt dahinter? Darüber spreche ich mit der Konsumpsychologin Nadine Hellwig. Frau Hellwig, wirken diese Tricks wirklich?' },
        { voice: 'frau2', name: 'Frau Hellwig', text: 'Leider ja, und zwar erstaunlich gut. Ein Countdown erzeugt Zeitdruck. Wir haben das Gefühl, als ob uns etwas entgehen würde, wenn wir nicht sofort zugreifen. Fachleute nennen solche Gestaltungen „Dark Patterns“, also dunkle Muster: Die Seite ist so gebaut, dass wir Entscheidungen treffen, die wir in Ruhe vielleicht nicht treffen würden.' },
        { voice: 'sprecher', name: 'Moderator', text: 'Aber stimmen diese Angaben denn? Gibt es wirklich nur noch zwei Stück?' },
        { voice: 'frau2', name: 'Frau Hellwig', text: 'Manchmal ja, manchmal nein. Verbraucherschützer haben festgestellt, dass bei einigen Shops der Countdown einfach wieder von vorn losging, wenn man die Seite neu geladen hat. Das Angebot war also gar nicht zeitlich begrenzt. Es sah nur so aus, als wäre es eine einmalige Chance.' },
        { voice: 'sprecher', name: 'Moderator', text: 'Wir haben vor der Sendung einen Hörer gebeten, von seinen Erfahrungen zu erzählen. Herr Ruppert, was ist Ihnen passiert?' },
        { voice: 'mann2', name: 'Herr Ruppert', text: 'Ich wollte eigentlich nur ein Paar Laufschuhe bestellen. Kurz vor dem Bezahlen stand da: „Kostenlos testen: ein Monat Premiumversand“. Das Häkchen war schon gesetzt, und ich habe nicht genau hingesehen. Zwei Monate später habe ich auf meinem Konto gesehen, dass jeden Monat neun Euro neunundneunzig abgebucht werden.' },
        { voice: 'sprecher', name: 'Moderator', text: 'Konnten Sie das Abo kündigen?' },
        { voice: 'mann2', name: 'Herr Ruppert', text: 'Ja, aber ich habe eine halbe Stunde gebraucht, bis ich die richtige Seite gefunden hatte. Ich kam mir vor, als wäre ich in einem Labyrinth. Das Geld für die zwei Monate habe ich nicht zurückbekommen.' },
        { voice: 'sprecher', name: 'Moderator', text: 'Frau Hellwig, ist das überhaupt erlaubt?' },
        { voice: 'frau2', name: 'Frau Hellwig', text: 'Vorangekreuzte Kästchen für kostenpflichtige Zusatzleistungen sind in der EU nicht zulässig. Und seit 2022 müssen Onlineshops in Deutschland für Verträge, die man im Internet abschließt, einen gut sichtbaren Kündigungsknopf anbieten.' },
        { voice: 'frau2', name: 'Frau Hellwig', text: 'Herr Ruppert hätte also gute Chancen gehabt, sein Geld zurückzufordern. Viele Menschen tun das aber nicht, weil es ihnen peinlich ist, dass sie darauf hereingefallen sind.' },
        { voice: 'sprecher', name: 'Moderator', text: 'Und was ist mit den vielen Fünf-Sterne-Bewertungen? Kann man denen trauen?' },
        { voice: 'frau2', name: 'Frau Hellwig', text: 'Nur bedingt. Ein Teil der Bewertungen ist gekauft oder stammt von Kunden, die dafür einen Gutschein bekommen haben. Mein Tipp: Lesen Sie lieber die mittelmäßigen Bewertungen mit drei Sternen. Die sind meistens am ehrlichsten und beschreiben genau, was gut und was weniger gut ist.' },
        { voice: 'sprecher', name: 'Moderator', text: 'Warum fallen eigentlich auch kluge Menschen auf so etwas herein?' },
        { voice: 'frau2', name: 'Frau Hellwig', text: 'Weil diese Tricks nicht unseren Verstand ansprechen, sondern unsere Gefühle. Niemand möchte etwas verpassen, und wir orientieren uns an anderen: Wenn angeblich fünfzehn Leute ein Produkt ansehen, muss es ja gut sein. Außerdem kaufen wir oft ein, wenn wir müde oder abgelenkt sind, zum Beispiel abends auf dem Sofa mit dem Handy.' },
        { voice: 'sprecher', name: 'Moderator', text: 'Was raten Sie unseren Hörerinnen und Hörern?' },
        { voice: 'frau2', name: 'Frau Hellwig', text: 'Erstens: Lassen Sie den Warenkorb über Nacht liegen. Wenn Sie das Produkt am nächsten Morgen immer noch wollen, kaufen Sie es. Zweitens: Lesen Sie die letzte Seite vor dem Bezahlen genau, denn dort verstecken sich die Zusatzangebote.' },
        { voice: 'frau2', name: 'Frau Hellwig', text: 'Und drittens: Denken Sie an das Widerrufsrecht. Was Sie online bestellt haben, können Sie in der Regel innerhalb von vierzehn Tagen ohne Begründung zurückgeben.' },
        { voice: 'sprecher', name: 'Moderator', text: 'Ein guter Rat zum Schluss. Frau Hellwig, Herr Ruppert, vielen Dank für das Gespräch.' },
      ] },
    { key: 'b2-wirtschaft-lesen2-forum', kind: 'image', title: 'Forum : la seconde main, durable ou nouvelle mode ?',
      alt: 'Fil de forum « Secondhand: nachhaltig oder nur ein neuer Trend? » avec quatre messages : Rosi, Jonas, Ayşe et Paul donnent chacun leur avis sur l’achat d’occasion.',
      image: { layout: 'forum', title: 'Forum „Besser leben“: Secondhand – nachhaltig oder nur ein neuer Trend?',
        posts: [
          { author: 'Rosi_74', date: 'vor 2 Tagen', text: 'Ich kaufe seit Jahren fast alles gebraucht: Kleidung, Möbel, sogar mein Fahrrad. Dabei spare ich viel Geld, und ich bin stolz darauf, dass bei uns kaum noch etwas Neues ins Haus kommt. Natürlich braucht man Geduld, bis man das Richtige findet. Aber genau das macht mir Spaß.' },
          { author: 'Jonas K.', date: 'vor 2 Tagen', text: 'Ehrlich gesagt bin ich skeptisch. Auf den Plattformen kaufen viele Leute gebrauchte Kleidung, nur um sie nach zwei Wochen wieder zu verkaufen. Das ist doch kein Verzicht, das ist Shopping mit gutem Gewissen. Es sieht so aus, als wäre man nachhaltig, aber man konsumiert genauso viel wie vorher.' },
          { author: 'Ayşe_D', date: 'gestern', text: 'Bei Elektronik bin ich vorsichtiger. Ich habe einmal ein gebrauchtes Handy gekauft, und der Akku war nach drei Monaten kaputt. Seitdem kaufe ich nur noch generalüberholte Geräte bei Händlern, die ein Jahr Gewährleistung geben. Das ist etwas teurer, aber ich kann mich darauf verlassen.' },
          { author: 'Paul aus Leipzig', date: 'heute', text: 'Ich finde, die Debatte geht am Thema vorbei. Ob neu oder gebraucht: Entscheidend ist, wie lange wir Dinge benutzen. Meine Winterjacke ist zwölf Jahre alt, und ich bin mit ihr immer noch zufrieden. Wer etwas lange trägt und repariert, ist nachhaltiger als jemand, der ständig Schnäppchen jagt.' },
        ] } },
    { key: 'b2-wirtschaft-kontrolle-audio', kind: 'audio', title: 'Spot publicitaire : un gel douche « neutre en carbone »',
      script: [
        { voice: 'frau', name: 'Sprecherin', text: 'Montagmorgen. Es regnet, die Bahn hat Verspätung, und im Büro warten schon dreißig E-Mails.' },
        { voice: 'mann3', name: 'Werbestimme', text: 'Kennen Sie das? Dann gönnen Sie sich Morgentau, das Duschgel mit echtem Bergkräuterduft! Schon nach der ersten Dusche fühlen Sie sich, als hätten Sie eine Woche Urlaub in den Alpen gemacht. Und das Beste: Morgentau ist klimaneutral, für ein gutes Gewissen bei jedem Tropfen.' },
        { voice: 'sprecher', name: 'Pflichthinweis', text: 'Klimaneutral durch Ausgleichszahlungen für ein Waldprojekt. Der Aktionspreis gilt nur bis Samstag und nur, solange der Vorrat reicht.' },
      ] },
  ],

  activities: [
    // 1 · Mise en route
    { id: 'b2-wirtschaft-einstieg', kind: 'lesson', title: 'Einstieg: Kaufen, werben, wegwerfen?', estimatedMinutes: 10,
      competences: ['lecture', 'expression-orale'],
      lesson: { description: `KONSUM UND NACHHALTIGKEIT
[fr?] Consommation et durabilité
${aide('Grüne Verpackungen, Countdowns im Onlineshop, Kleidung aus zweiter Hand: Wer heute einkauft, muss viele Versprechen prüfen. In diesem Modul geht es darum, was hinter Werbung und Kaufentscheidungen steckt.', 'Emballages verts, comptes à rebours en ligne, vêtements d’occasion : acheter aujourd’hui, c’est vérifier beaucoup de promesses. Ce module montre ce qui se cache derrière la publicité et nos décisions d’achat.')}

FRAGEN ZUM EINSTIEG
[fr?] Questions pour commencer
• ${aide('Auf welche Umweltsiegel oder Versprechen achten Sie beim Einkaufen, und vertrauen Sie ihnen?', 'À quels labels ou promesses écologiques faites-vous attention, et leur faites-vous confiance ?')}
• ${aide('Haben Sie schon einmal online etwas gekauft, das Sie eigentlich gar nicht wollten? Wie kam es dazu?', 'Avez-vous déjà acheté en ligne quelque chose que vous ne vouliez pas vraiment ? Comment est-ce arrivé ?')}
• ${aide('Was kaufen Sie lieber gebraucht, und was nur neu? Warum?', 'Qu’achetez-vous plutôt d’occasion, et quoi seulement neuf ? Pourquoi ?')}
${aide('Überlegen Sie sich zu jeder Frage zwei oder drei Sätze auf Deutsch und begründen Sie Ihre Antwort mit einem Beispiel.', 'Pour chaque question, préparez mentalement deux ou trois phrases en allemand avec un exemple.')}

ZIELE
[fr?] Objectifs
• ${aide('Ich kann einen analysierenden Artikel über Werbung verstehen und die Position der Autorin erkennen.', 'Je peux comprendre un article d’analyse sur la publicité et reconnaître la position de l’autrice.')}
• ${aide('Ich kann einem Radiogespräch über Verkaufstricks folgen und die wichtigsten Informationen festhalten.', 'Je peux suivre une émission sur les techniques de vente et en retenir l’essentiel.')}
• ${aide('Ich kann verschiedene Meinungen in einem Forum vergleichen und zuordnen.', 'Je peux comparer et attribuer différentes opinions dans un forum.')}
• ${aide('Ich kann beschreiben, wie etwas wirkt, ohne dass es stimmt: „Es sieht so aus, als ob …“', 'Je peux décrire une apparence trompeuse : « On dirait que … ».')}
• ${aide('Ich kann Adjektive mit der richtigen Präposition verwenden: stolz auf, abhängig von, zufrieden mit …', 'J’emploie les adjectifs avec la bonne préposition.')}

WICHTIGE WÖRTER
[fr?] Mots-clés
• die Werbung — la publicité
• der Verbraucher, die Verbraucherin — le consommateur, la consommatrice
• das Siegel — le label
• nachhaltig — durable
• irreführend — trompeur
• das Abo kündigen — résilier l’abonnement
• auf einen Trick hereinfallen — se faire avoir par une astuce
• gebraucht, aus zweiter Hand — d’occasion` } },

    // 2 · Lecture longue : article d'analyse
    { id: 'b2-wirtschaft-lesen', kind: 'exercise', title: 'Verstehen: ein Artikel über grüne Werbung', estimatedMinutes: 23,
      competences: ['lecture'],
      lesson: { description: `${C2.lesen}

STRATEGIE
[fr?] Stratégie
1. ${aide('Lesen Sie Überschrift, Vorspann und den letzten Absatz. Welche These vertritt der Text?', 'Lisez le titre, le chapeau et le dernier paragraphe : quelle thèse le texte défend-il ?')}
2. ${aide('Unterscheiden Sie: Was ist eine Tatsache (Regeln, Umfragen), was ist die Meinung einer zitierten Person, was ist die Meinung der Autorin?', 'Distinguez les faits, l’avis des personnes citées et l’avis de l’autrice.')}
3. ${aide('Achten Sie auf Vergleiche mit „als ob“ und „als würde“: Sie zeigen oft, dass etwas nur so aussieht.', 'Repérez les comparaisons avec « als ob » et « als würde » : elles signalent souvent une simple apparence.')}

GRÜN IST NUR DIE VERPACKUNG
Klimaneutraler Joghurt, naturnahes Spülmittel, T-Shirts mit gutem Gewissen: Kaum eine Werbung kommt heute ohne Umweltversprechen aus. Doch viele davon halten einer Prüfung nicht stand.
Von Ines Kalkbrenner

(A) Wer heute durch einen Supermarkt geht, könnte meinen, die Rettung des Planeten finde zwischen Kühlregal und Kasse statt. Der Joghurt ist „klimaneutral“, das Spülmittel wird „mit Liebe zur Natur“ hergestellt, und auf den T-Shirts im Aktionsregal steht „bewusst produziert“. Die Verpackungen sind grün, braun oder beige, und fast überall wächst ein Blatt. Sie tun so, als ob jeder Einkauf ein kleiner Beitrag zum Umweltschutz wäre. Dass die Werbung so stark auf dieses Gefühl setzt, ist kein Zufall: Umfragen zeigen regelmäßig, dass viele Verbraucherinnen und Verbraucher bereit sind, für nachhaltige Produkte mehr zu bezahlen.

(B) Das Problem: Viele dieser Versprechen lassen sich kaum überprüfen. Begriffe wie „natürlich“ oder „umweltfreundlich“ waren lange nicht geschützt, und hinter dem Wort „klimaneutral“ steckt oft nur, dass ein Unternehmen seine Emissionen nicht senkt, sondern durch den Kauf von Zertifikaten ausgleicht, etwa für Waldprojekte in anderen Teilen der Welt. Ob diese Projekte tatsächlich so viel CO₂ binden wie versprochen, ist häufig umstritten. Hinzu kamen Siegel, die sich Unternehmen selbst ausgedacht hatten: Ein grünes Logo mit einem Blatt und dem Wort „geprüft“ sah aus wie ein offizielles Gütezeichen, obwohl niemand außer dem Hersteller selbst etwas geprüft hatte. „Das ist ungefähr so, als würde man sich für sportlich halten, weil man jemand anderen fürs Joggen bezahlt“, sagt die Marketingforscherin Ruth Haberland.

(C) Inzwischen hat die Europäische Union reagiert. Nach den neuen Regeln dürfen Unternehmen allgemeine Aussagen wie „umweltfreundlich“ nur noch verwenden, wenn sie diese belegen können, und mit „klimaneutral“ darf nicht mehr werben, wer seine Emissionen nur durch Zertifikate ausgleicht. Auch Siegel müssen künftig auf einem unabhängigen Prüfsystem beruhen; selbst ausgedachte Logos sind nicht mehr erlaubt. Wer gegen die Regeln verstößt, kann abgemahnt werden. Für Verbraucherschützer ist das ein wichtiger Schritt. Ob die Regeln wirken, hängt allerdings davon ab, wie streng sie kontrolliert werden.

(D) Bis dahin bleibt den Kundinnen und Kunden vor allem ein kritischer Blick. „Die meisten Menschen sind nicht naiv“, sagt Kemal Tekin, der in einer Verbraucherberatung arbeitet. „Aber im Supermarkt haben sie für eine Kaufentscheidung oft nur ein paar Sekunden.“ Er rät, auf Siegel zu achten, deren Kriterien öffentlich sind und die von unabhängigen Stellen vergeben werden, und sich nicht von Naturbildern beeindrucken zu lassen. Wer unsicher ist, kann im Internet nachsehen, wer hinter einem Siegel steht und welche Kriterien gelten; dafür braucht man oft nur wenige Minuten. Sein wichtigster Tipp klingt fast altmodisch: „Das nachhaltigste Produkt ist oft das, das man gar nicht kauft, oder das, was man schon besitzt und länger benutzt.“

(E) Man sollte allerdings nicht jedes grüne Versprechen für eine Lüge halten. Es gibt Unternehmen, die ihre Produktion tatsächlich umstellen, und sie brauchen eine Möglichkeit, das auch zu zeigen. Gerade deshalb ist es ärgerlich, wenn andere so tun, als hätten sie dasselbe geleistet. Die Verantwortung darf dabei nicht allein bei den Verbrauchern liegen: Solange sie von schönen Bildern abhängig sind statt von überprüfbaren Angaben, gewinnt nicht das umweltfreundlichste Produkt, sondern die schönste Verpackung.` },
      placements: [{ media: 'b2-wirtschaft-lesen-artikel', caption: 'Der Artikel (Anfang)' }],
      questions: [
        choice('q1', aide('Was ist die zentrale Aussage des Artikels?', 'Quelle est l’idée centrale de l’article ?'),
          [['Nachhaltige Produkte sind grundsätzlich teurer und deshalb für viele normale Kunden unattraktiv.'],
            ['Die neuen Regeln der EU haben das Problem der grünen Werbung schon vollständig gelöst.'],
            ['Viele Umweltversprechen in der Werbung sind kaum überprüfbar und führen Kunden in die Irre.', true],
            ['Supermärkte verkaufen heute fast nur noch Produkte mit einem unabhängigen Umweltsiegel.']],
          'Schon der Vorspann sagt: „Doch viele davon halten einer Prüfung nicht stand.“ Absatz B erklärt, warum die Versprechen schwer zu überprüfen sind. Die EU-Regeln sind ein „wichtiger Schritt“, aber ob sie wirken, ist offen; vom Preis nachhaltiger Produkte als Hindernis spricht der Text nicht. [fr?] Beaucoup de promesses vertes sont invérifiables et trompeuses.'),
        choice('q2', aide('Welche Position vertritt die Autorin im letzten Absatz?', 'Quelle position l’autrice défend-elle dans le dernier paragraphe ?'),
          [['Ehrliche Firmen leiden unter falschen Versprechen, und Kunden brauchen überprüfbare Angaben.', true],
            ['Alle Firmen, die mit dem Umweltschutz werben, belügen ihre Kundinnen und Kunden ganz bewusst.'],
            ['Die Kunden sind selbst schuld, wenn sie auf schöne Bilder auf der Verpackung hereinfallen.'],
            ['Eine schöne Verpackung ist für den Erfolg wichtiger als ein umweltfreundliches Produkt.']],
          'Die Autorin warnt davor, „jedes grüne Versprechen für eine Lüge zu halten“, und nennt es ärgerlich, wenn andere nur so tun, „als hätten sie dasselbe geleistet“. Die Verantwortung dürfe „nicht allein bei den Verbrauchern liegen“. Der letzte Satz beschreibt ein Problem, keine Empfehlung. [fr?] Elle défend les entreprises honnêtes et demande des informations vérifiables.'),
        choice('q3', aide('Was will Ruth Haberland mit ihrem Vergleich zeigen?', 'Que veut montrer Ruth Haberland avec sa comparaison ?'),
          [['Sport und Umweltschutz haben mehr miteinander zu tun, als man denkt.'],
            ['Waldprojekte sind die beste Methode, um CO₂ auszugleichen.'],
            ['Unternehmen sollten ihre Mitarbeitenden zu mehr Bewegung motivieren.'],
            ['Wer nur Zertifikate kauft, ändert an seinem eigenen Verhalten nichts.', true]],
          'Wer jemand anderen fürs Joggen bezahlt, wird selbst nicht sportlicher. Genauso senkt ein Unternehmen, das nur Zertifikate kauft, seine eigenen Emissionen nicht. Der Vergleich mit „als würde“ beschreibt etwas Unwirkliches und zeigt so die Schwäche des Arguments. [fr?] Payer quelqu’un pour courir ne rend pas sportif : la compensation ne change rien chez soi.'),
        rf('q4', 'Laut Artikel sind viele Verbraucher bereit, für nachhaltige Produkte mehr Geld auszugeben.', 'r',
          'Richtig: „Umfragen zeigen regelmäßig, dass viele Verbraucherinnen und Verbraucher bereit sind, für nachhaltige Produkte mehr zu bezahlen.“ Genau deshalb setzt die Werbung auf dieses Gefühl. Beachten Sie: bereit sein zu + Infinitiv mit „zu“. [fr?] « bereit sein, … zu » = être prêt à.'),
        rf('q5', 'Nach den neuen EU-Regeln dürfen Firmen eigene Logos ohne unabhängige Prüfung als Siegel verwenden.', 'f',
          'Falsch: „Auch Siegel müssen künftig auf einem unabhängigen Prüfsystem beruhen; selbst ausgedachte Logos sind nicht mehr erlaubt.“ [fr?] Les labels inventés par les entreprises sont désormais interdits.'),
        rf('q6', 'Kemal Tekin empfiehlt, Lebensmittel nur noch in Bioläden einzukaufen.', 'n',
          'Steht nicht im Text: Tekin rät, auf unabhängige Siegel zu achten, sich nicht von Naturbildern beeindrucken zu lassen und weniger oder länger zu nutzen. Von Bioläden spricht er nicht. [fr?] Rien n’est dit sur les magasins bio.'),
        match('q7', aide('Welche Überschrift passt zu welchem Absatz? Ordnen Sie zu.', 'Quel intertitre convient à quel paragraphe ? Associez.'),
          [['Absatz A', 'Ein Regal voller guter Gewissen'], ['Absatz B', 'Was hinter „klimaneutral“ steckt'], ['Absatz C', 'Neue Regeln aus Brüssel'],
            ['Absatz D', 'Ratschläge für den Einkauf'], ['Absatz E', 'Eine Frage der Fairness']],
          'A beschreibt die grünen Verpackungen im Supermarkt, B erklärt den Ausgleich durch Zertifikate, C die neuen EU-Regeln (Brüssel steht hier für die EU), D die Tipps von Kemal Tekin, E das Problem für ehrliche Unternehmen. [fr?] « Brüssel » désigne ici les institutions européennes.'),
        fill('q8', aide('Welches Wort aus dem Text passt? Ergänzen Sie.', 'Quel mot du texte convient ? Complétez.'),
          'Absatz B: Manche Firmen senken ihre Emissionen nicht, sondern [[1]] sie durch den Kauf von Zertifikaten aus. · Absatz C: Allgemeine Aussagen sind nur erlaubt, wenn die Firma sie [[2]] kann.',
          [['gleichen'], ['belegen', 'beweisen', 'nachweisen']],
          '„Etwas ausgleichen“ heißt hier: einen Schaden an anderer Stelle wiedergutmachen; das trennbare Präfix „aus“ steht am Ende des Satzes. „Etwas belegen“ bedeutet: mit Fakten beweisen. [fr?] ausgleichen = compenser ; belegen = prouver, justifier.'),
      ] },

    // 3 · Écoute longue : émission de radio
    { id: 'b2-wirtschaft-hoeren', kind: 'exercise', title: 'Verstehen: ein Radiogespräch über Tricks im Onlinehandel', estimatedMinutes: 23,
      competences: ['ecoute'],
      lesson: { description: `${C2.hoeren}

SITUATION
[fr?] La situation
${aide('In der Sendung „Wirtschaft am Mittag“ spricht ein Moderator mit der Konsumpsychologin Nadine Hellwig. Ein Hörer, Herr Ruppert, erzählt von seiner Erfahrung.', 'Dans l’émission « Wirtschaft am Mittag », un animateur s’entretient avec la psychologue de la consommation Nadine Hellwig. Un auditeur, M. Ruppert, raconte son expérience.')}

STRATEGIE
[fr?] Stratégie
1. ${aide('Erstes Hören: Welche Tricks werden genannt, und welche Ratschläge gibt die Expertin am Ende?', 'Première écoute : quelles astuces sont citées, et quels conseils l’experte donne-t-elle à la fin ?')}
2. ${aide('Lesen Sie die Notizen und überlegen Sie: Fehlt ein Begriff, eine Zahl oder ein Gegenstand?', 'Lisez les notes : manque-t-il une notion, un chiffre ou un objet ?')}
3. ${aide('Zweites Hören: Ergänzen Sie die Notizen. Bei Zahlen genügen Ziffern.', 'Deuxième écoute : complétez les notes. Pour les nombres, les chiffres suffisent.')}` },
      placements: [{ media: 'b2-wirtschaft-hoeren-audio', caption: 'Wirtschaft am Mittag: Tricks im Onlinehandel' }],
      questions: [
        fill('q1', aide('Notizen zum ersten Teil: Ergänzen Sie die Lücken mit Stichwörtern.', 'Notes sur la première partie : complétez avec des mots-clés.'),
          'Countdown → erzeugt [[1]] · Fachbegriff: „Dark [[2]]“ · Untersuchung: Countdown beginnt nach dem Neuladen wieder von [[3]] · Herr Ruppert wollte [[4]] bestellen · das Häkchen für den Premiumversand war schon [[5]] · Kosten: [[6]] Euro pro Monat',
          [['Zeitdruck', 'Druck'], ['Patterns'], ['vorn', 'vorne'], ['Laufschuhe', 'ein Paar Laufschuhe', 'Schuhe'], ['gesetzt'], ['9,99', '9.99', 'neun Euro neunundneunzig']],
          'Ein Countdown „erzeugt Zeitdruck“; die Fachleute sprechen von „Dark Patterns“. Bei einigen Shops „ging der Countdown wieder von vorn los“. Herr Ruppert wollte „ein Paar Laufschuhe“ bestellen, das Häkchen „war schon gesetzt“, und jeden Monat wurden „neun Euro neunundneunzig“ abgebucht. [fr?] Dark Patterns : interfaces trompeuses ; Häkchen gesetzt = case cochée.'),
        fill('q2', aide('Notizen zum zweiten Teil: Ergänzen Sie die Lücken mit Stichwörtern.', 'Notes sur la seconde partie : complétez avec des mots-clés.'),
          'Rechtslage: vorangekreuzte Kästchen für Zusatzkosten sind in der EU [[1]] · seit 2022 Pflicht: ein gut sichtbarer [[2]] · Bewertungen: am ehrlichsten meist die mit [[3]] Sternen · warum man auf Tricks hereinfällt: sie sprechen die [[4]] an · Tipp 1: den Warenkorb über [[5]] liegen lassen · Tipp 2: die letzte Seite vor dem [[6]] genau lesen · Tipp 3: Widerrufsrecht, in der Regel [[7]] Tage',
          [['nicht zulässig', 'unzulässig', 'nicht erlaubt', 'verboten'], ['Kündigungsknopf', 'Kündigungsbutton'], ['3', 'drei'], ['Gefühle'], ['Nacht'], ['Bezahlen'], ['14', 'vierzehn']],
          'Vorangekreuzte Kästchen sind „nicht zulässig“, und ein „gut sichtbarer Kündigungsknopf“ ist seit 2022 Pflicht. Ehrlicher als die Fünf-Sterne-Bewertungen sind meist die „mit drei Sternen“. Die Tricks sprechen „nicht unseren Verstand, sondern unsere Gefühle“ an. Die drei Tipps: Warenkorb „über Nacht liegen lassen“, „die letzte Seite vor dem Bezahlen genau“ lesen, „vierzehn Tagen“ Widerrufsrecht. [fr?] zulässig = autorisé ; das Widerrufsrecht = le droit de rétractation.'),
        choice('q3', aide('Was sagt Frau Hellwig über Hinweise wie „nur noch zwei Stück“?', 'Que dit Mme Hellwig des mentions comme « plus que deux articles » ?'),
          [['Sie sind gesetzlich verboten und werden von Behörden streng kontrolliert.'],
            ['Sie stimmen nicht immer; oft sollen sie vor allem Druck erzeugen.', true],
            ['Sie stimmen fast immer, weil die Shops ihre Lager genau überwachen.'],
            ['Sie helfen den Kunden, sich schneller und besser zu entscheiden.']],
          '„Manchmal ja, manchmal nein“: Bei einigen Shops lief der Countdown einfach neu los, das Angebot sah also nur so aus, „als wäre es eine einmalige Chance“. Ein Verbot solcher Hinweise erwähnt sie nicht, verboten sind vorangekreuzte Kästchen für Zusatzkosten. [fr?] Ces mentions sont parfois fausses : elles servent à créer de la pression.'),
        choice('q4', aide('Wie hat Herr Ruppert die Kündigung erlebt?', 'Comment M. Ruppert a-t-il vécu la résiliation ?'),
          [['Sie war einfach, weil der Kündigungsknopf sofort zu sehen war.'],
            ['Er hat es nicht versucht, weil es ihm zu peinlich war.'],
            ['Sie war mühsam, denn er musste die richtige Seite lange suchen.', true],
            ['Der Kundenservice hat ihm sein Geld sofort zurücküberwiesen.']],
          '„Ich habe eine halbe Stunde gebraucht, bis ich die richtige Seite gefunden hatte. Ich kam mir vor, als wäre ich in einem Labyrinth.“ Er hat gekündigt, aber sein Geld nicht zurückbekommen. Der irreale Vergleich „als wäre ich in einem Labyrinth“ beschreibt sein Gefühl. [fr?] Il a eu l’impression d’être dans un labyrinthe : la résiliation était pénible.'),
        choice('q5', aide('Warum fordern viele Menschen ihr Geld nicht zurück?', 'Pourquoi beaucoup ne réclament-ils pas leur argent ?'),
          [['Weil es ihnen peinlich ist, dass sie auf den Trick hereingefallen sind.', true],
            ['Weil die Beträge meistens so klein sind, dass sich der ganze Aufwand nicht lohnt.'],
            ['Weil das Recht auf Rückzahlung nach einem Monat schon verfällt.'],
            ['Weil sie nicht wissen, an wen sie sich überhaupt wenden müssen.']],
          '„Viele Menschen tun das aber nicht, weil es ihnen peinlich ist, dass sie darauf hereingefallen sind.“ Die anderen Gründe klingen plausibel, werden aber im Gespräch nicht genannt. Achten Sie beim Hören auf „weil“: Dort steht oft die Antwort. [fr?] Par honte de s’être fait avoir.'),
        choice('q6', aide('Warum fallen laut Frau Hellwig auch kluge Menschen auf solche Tricks herein?', 'Selon Mme Hellwig, pourquoi même des gens intelligents se font-ils avoir ?'),
          [['Weil die meisten Onlineshops ihre Preise ständig und ganz ohne jede Vorwarnung ändern.'],
            ['Weil sie die Bedingungen der Shops grundsätzlich nicht lesen wollen.'],
            ['Weil kluge Menschen beim Einkaufen besonders gern Risiken eingehen.'],
            ['Weil die Tricks Gefühle ansprechen, zum Beispiel die Angst, etwas zu verpassen.', true]],
          'Die Tricks sprechen „nicht unseren Verstand an, sondern unsere Gefühle“: Niemand möchte etwas verpassen, und man orientiert sich an anderen. Dazu kommen Müdigkeit und Ablenkung, etwa abends mit dem Handy. [fr?] La peur de rater quelque chose et l’imitation des autres.'),
      ] },

    // 4 · Grammaire inductive
    { id: 'b2-wirtschaft-entdecken', kind: 'exercise', title: 'Entdecken: als ob und Adjektive mit Präposition', estimatedMinutes: 10,
      competences: ['lecture'],
      lesson: { description: `${aide('Lesen Sie die Sätze aus dem Artikel, dem Radiogespräch und dem Forum. Achten Sie auf die Wörter nach „als“ und auf die Präpositionen nach den Adjektiven.', 'Lisez ces phrases de l’article, de l’émission et du forum. Observez les mots après « als » et les prépositions après les adjectifs.')}

SÄTZE
[fr?] Le corpus
(1) Die Verpackungen tun so, als ob jeder Einkauf ein kleiner Beitrag zum Umweltschutz wäre.
(2) Das ist ungefähr so, als würde man sich für sportlich halten, weil man jemand anderen fürs Joggen bezahlt.
(3) Ich kam mir vor, als wäre ich in einem Labyrinth.
(4) Es ist ärgerlich, wenn andere so tun, als hätten sie dasselbe geleistet.
(5) Viele Verbraucher sind bereit, für nachhaltige Produkte mehr zu bezahlen.
(6) Ich bin stolz darauf, dass bei uns kaum noch etwas Neues ins Haus kommt.
(7) Solange sie von schönen Bildern abhängig sind, gewinnt die schönste Verpackung.

${aide('Beantworten Sie dann die Fragen. Die Erklärungen formulieren die Regel.', 'Répondez ensuite aux questions. Les explications formulent la règle.')}` },
      questions: [
        choice('q1', aide('Sätze 1 bis 4: Was drücken „als ob …“ und „als wäre …“ aus?', 'Phrases 1 à 4 : qu’expriment « als ob … » et « als wäre … » ?'),
          [['einen Grund, der die Handlung im Hauptsatz erklärt'],
            ['einen Vergleich mit etwas, das nicht der Wirklichkeit entspricht', true],
            ['eine Bedingung, die erfüllt sein muss, damit etwas passiert'],
            ['einen Zeitpunkt in der Vergangenheit, wie in „als ich noch klein war“']],
          'Die Verpackungen wirken umweltfreundlich, sind es aber nicht unbedingt; Herr Ruppert war nicht wirklich in einem Labyrinth. „Als ob“ und „als“ mit Konjunktiv II leiten einen irrealen Vergleich ein: Es scheint so, aber es ist (wahrscheinlich) nicht so. Das zeitliche „als“ (als ich klein war) steht dagegen mit dem Indikativ. [fr?] « comme si » : une comparaison avec quelque chose d’irréel.'),
        choice('q2', aide('Sätze 1 und 3: Wo steht das konjugierte Verb?', 'Phrases 1 et 3 : où se trouve le verbe conjugué ?'),
          [['in beiden Sätzen direkt nach „als“ oder „als ob“'],
            ['in beiden Sätzen ganz am Ende des Nebensatzes'],
            ['nach „als ob“ am Ende, nach „als“ allein direkt dahinter', true],
            ['nach „als ob“ direkt dahinter, nach „als“ am Ende']],
          'Mit „als ob“ (oder „als wenn“) ist es ein normaler Nebensatz: Das Verb steht am Ende („… ein Beitrag zum Umweltschutz wäre“). Ohne „ob“ rückt das Verb direkt hinter „als“: „als wäre ich in einem Labyrinth“. Beide Varianten bedeuten dasselbe. [fr?] als ob + verbe à la fin ; als + verbe juste après.'),
        choice('q3', aide('Sätze 1 bis 4: Welche Verbformen stehen nach „als ob“ und „als“?', 'Phrases 1 à 4 : quelles formes verbales suivent « als ob » et « als » ?'),
          [['Formen des Konjunktivs II: wäre, würde, hätten … geleistet', true],
            ['Formen des Indikativs Präsens, zum Beispiel: ist, wird, haben'],
            ['Formen des Imperativs, zum Beispiel: sei, werde, habt'],
            ['Formen des Präteritums, zum Beispiel: war, wurde, hatten']],
          'Nach „als ob“ und „als“ steht der Konjunktiv II: wäre, würde + Infinitiv, hätte. Für die Vergangenheit: hätte/wäre + Partizip II („als hätten sie dasselbe geleistet“). In Zeitungstexten findet man auch den Konjunktiv I („als ob er krank sei“). Den Indikativ hört man in der Umgangssprache, er gilt aber nicht als Standard. [fr?] Après « comme si », l’allemand emploie le Konjunktiv II.'),
        match('q4', aide('Sätze 5 bis 7: Welche Präposition gehört zu welchem Adjektiv? Ordnen Sie zu.', 'Phrases 5 à 7 : quelle préposition va avec quel adjectif ? Associez.'),
          [['bereit', 'zu'], ['stolz', 'auf'], ['abhängig', 'von'], ['zufrieden', 'mit']],
          'Viele Adjektive verlangen eine feste Präposition, oft eine andere als im Französischen: stolz auf (fier de), abhängig von, zufrieden mit (satisfait de), bereit zu oder „bereit, … zu“ + Infinitiv. Folgt ein Nebensatz, steht ein Pronominaladverb: „stolz darauf, dass …“. [fr?] Apprenez chaque adjectif avec sa préposition.'),
      ] },

    // 5 · Règle
    { id: 'b2-wirtschaft-regel', kind: 'lesson', title: 'Regel: irreale Vergleiche und Adjektive mit Präposition', estimatedMinutes: 10,
      competences: ['lecture'],
      lesson: { description: `REGEL — IRREALE VERGLEICHE: ALS OB, ALS WENN, ALS
[fr?] Règle : la comparaison irréelle (« comme si »)
Ein irrealer Vergleich beschreibt, wie etwas wirkt, obwohl es nicht (oder wahrscheinlich nicht) so ist. Man verwendet den Konjunktiv II.
[fr?] On compare avec une situation irréelle ; le verbe est au Konjunktiv II.
• ${aide('als ob / als wenn + Verb am Ende: Er tut so, als ob er alles wüsste.', 'Il fait comme s’il savait tout.')}
• ${aide('als + Verb direkt danach: Er tut so, als wüsste er alles.', 'Même sens, sans « ob » : le verbe suit « als ».')}
• ${aide('Gegenwart: wäre, hätte, würde + Infinitiv: Es sieht so aus, als würde der Laden bald schließen.', 'Présent : wäre, hätte, würde + infinitif.')}
• ${aide('Vergangenheit: hätte oder wäre + Partizip II: Sie tun so, als hätten sie dasselbe geleistet.', 'Passé : hätte / wäre + participe II.')}
${aide('Typische Einleitungen: so tun, als ob … · Es sieht so aus, als … · Ich habe das Gefühl, als … · Mir kommt es vor, als … · Er redet, als …', 'Formules fréquentes : faire comme si, on dirait que, j’ai l’impression que.')}
${aide('In Zeitungstexten steht manchmal der Konjunktiv I: Er tut so, als ob er krank sei.', 'À l’écrit soutenu, on trouve aussi le Konjunktiv I.')}

REGEL — ADJEKTIVE MIT PRÄPOSITION
[fr?] Règle : les adjectifs à préposition
Viele Adjektive haben eine feste Präposition mit einem festen Kasus. Lernen Sie sie immer zusammen.
[fr?] Préposition et cas sont fixes : apprenez-les avec l’adjectif.
• ${aide('auf + Akkusativ: stolz, gespannt, neugierig, angewiesen, wütend', 'fier de, impatient de, curieux de, dépendant de, furieux contre')}
• ${aide('von + Dativ: abhängig, überzeugt, begeistert, enttäuscht', 'dépendant de, convaincu de, enthousiasmé par, déçu par')}
• ${aide('mit + Dativ: zufrieden, einverstanden, vertraut', 'satisfait de, d’accord avec, familier de')}
• ${aide('für + Akkusativ: verantwortlich, zuständig, bekannt, typisch', 'responsable de, compétent pour, connu pour, typique de')}
• ${aide('an + Dativ: interessiert, beteiligt, reich', 'intéressé par, impliqué dans, riche en')}
• ${aide('über + Akkusativ: froh, verärgert, erstaunt', 'content de, fâché de, étonné de')}
• ${aide('gegenüber + Dativ: misstrauisch, skeptisch, offen (gegenüber steht oft nach dem Nomen: den Siegeln gegenüber)', 'méfiant, sceptique, ouvert envers')}
• ${aide('zu + Dativ: bereit, fähig; oft mit Infinitiv: bereit, mehr zu bezahlen', 'prêt à, capable de')}
${aide('Mit Nebensatz oder Infinitiv: Pronominaladverb da(r) + Präposition: stolz darauf, dass … · abhängig davon, ob … · einverstanden damit, dass …', 'Devant une subordonnée : darauf, davon, damit …')}
${aide('Fragen: bei Sachen wo(r) + Präposition (Worauf bist du stolz?), bei Personen Präposition + wen/wem (Auf wen bist du stolz?).', 'Questions : worauf ? pour une chose, auf wen ? pour une personne.')}

ACHTUNG
[fr?] Attention : pièges des francophones
• ${aide('„stolz auf“, nicht „stolz von“; „zufrieden mit“, nicht „zufrieden von“; „verantwortlich für“, nicht „verantwortlich von“.', 'Le « de » français ne se traduit pas toujours par « von ».')}
• ${aide('Nach „als ob“ steht der Konjunktiv II, nicht der Indikativ: Er tut so, als ob er krank wäre.', 'Après « als ob » : Konjunktiv II, comme après « comme si » on met l’imparfait.')}
• ${aide('Verwechseln Sie nicht: „als“ + Indikativ ist zeitlich (Als ich ankam, …), „als“ + Konjunktiv II ist ein Vergleich (…, als wäre ich angekommen).', 'Ne confondez pas « als » temporel et « als » de comparaison.')}
• ${aide('Bei realen Vergleichen steht „wie“: Das Gerät ist so gut wie neu. „Als ob“ passt nur, wenn etwas nicht stimmt.', 'Comparaison réelle : wie ; comparaison irréelle : als ob.')}` } },

    // 6 · Grammaire : s'entraîner
    { id: 'b2-wirtschaft-grammatik', kind: 'exercise', title: 'Üben: als ob und Adjektive mit Präposition', estimatedMinutes: 14,
      competences: ['lecture', 'expression-ecrite'],
      lesson: { description: `${aide('Üben Sie die irrealen Vergleiche und die Adjektive mit Präposition.', 'Entraînez-vous à la comparaison irréelle et aux adjectifs à préposition.')}

MERKE
[fr?] À retenir
• ${aide('als ob + … + Verb im Konjunktiv II · als + Verb im Konjunktiv II + …', 'als ob : verbe à la fin ; als : verbe juste après')}
• ${aide('stolz auf · abhängig von · zufrieden mit · verantwortlich für · interessiert an · bereit zu · misstrauisch gegenüber', 'les prépositions fixes à connaître')}` },
      questions: [
        hints(fill('q1', aide('Ergänzen Sie den Konjunktiv II.', 'Complétez au Konjunktiv II.'),
          'Der Verkäufer tut so, als ob das Angebot morgen vorbei [[1]]. · Sie redet, als [[2]] sie die Expertin. · Es sieht so aus, als ob der Laden bald [[3]] würde.',
          [['wäre'], ['wäre'], ['schließen']],
          'Nach „als ob“ und „als“ steht der Konjunktiv II: sein → wäre. Mit „als ob“ steht das Verb am Ende, mit „als“ allein direkt danach („als wäre sie …“). Bei den meisten Verben nimmt man „würde“ + Infinitiv: als ob der Laden bald schließen würde. [fr?] Konjunktiv II : wäre, ou würde + infinitif.'),
        'sein', 'sein', 'schließen'),
        hints(fill('q2', aide('Ergänzen Sie den irrealen Vergleich in der Vergangenheit.', 'Complétez la comparaison irréelle au passé.'),
          'Der Mitarbeiter tat so, als ob er meine E-Mail nie [[1]] [[2]]. · Sie sah mich an, als wäre ich vom Mond [[3]].',
          [['bekommen', 'erhalten'], ['hätte'], ['gekommen']],
          'Vergangenheit im irrealen Vergleich: hätte oder wäre + Partizip II. „Bekommen“ bildet das Perfekt mit „haben“: …, als ob er die E-Mail nie bekommen hätte. „Kommen“ bildet es mit „sein“: als wäre ich vom Mond gekommen. „Hätte“ steht nach „als ob“ ganz am Ende. [fr?] Passé : hätte / wäre + participe II.'),
        'bekommen', 'haben', 'kommen'),
        order('q3', C2.ordnen, [['Die Werbung', 'tut', 'so,', 'als ob', 'das Produkt', 'die Welt', 'retten', 'würde.']],
          'Hauptsatz „Die Werbung tut so“, danach der Nebensatz mit „als ob“: Subjekt, Objekt, Infinitiv und das konjugierte „würde“ ganz am Ende. [fr?] « La publicité fait comme si le produit sauvait le monde. »'),
        order('q4', C2.ordnen, [['Es', 'sieht', 'so', 'aus,', 'als', 'wäre', 'das Angebot', 'bald', 'vorbei.']],
          'Ohne „ob“ steht das konjugierte Verb direkt nach „als“: „als wäre das Angebot bald vorbei“. Das trennbare Verb „aussehen“ ist im Hauptsatz geteilt: „Es sieht so aus“. [fr?] « On dirait que l’offre va bientôt se terminer. »'),
        choice('q5', aide('Welcher Satz ist richtig?', 'Quelle phrase est correcte ?'),
          [['Er tut so, als er würde alles wissen.'],
            ['Er tut so, als ob würde er alles wissen.'],
            ['Er tut so, als ob er würde alles wissen.'],
            ['Er tut so, als würde er alles wissen.', true]],
          'Zwei richtige Muster: „als ob er alles wissen würde“ (Verb am Ende) oder „als würde er alles wissen“ (Verb direkt nach „als“). Die anderen Sätze mischen beide Muster oder stellen das Verb an die zweite Stelle wie im Hauptsatz. [fr?] Soit als ob … würde (fin), soit als würde … (juste après).'),
        fill('q6', aide('Ergänzen Sie die Präposition.', 'Complétez avec la préposition.'),
          'Viele Kunden sind [[1]] Umweltsiegeln misstrauisch. · Wer ist [[2]] die Angaben auf der Verpackung verantwortlich? · Ich bin [[3]] meinem neuen Handy sehr zufrieden. · Er ist stolz [[4]] seine Reparatur.',
          [['gegenüber'], ['für'], ['mit'], ['auf']],
          'misstrauisch gegenüber + Dativ (den Siegeln), verantwortlich für + Akkusativ, zufrieden mit + Dativ, stolz auf + Akkusativ. Der Kasus hängt von der Präposition ab: „mit meinem Handy“ (Dativ), „auf seine Reparatur“ (Akkusativ). [fr?] méfiant envers, responsable de, satisfait de, fier de.'),
        fill('q7', aide('Ergänzen Sie das Pronominaladverb (da… / dar…).', 'Complétez avec le pronom adverbial.'),
          'Ich bin stolz [[1]], dass ich mein Fahrrad selbst repariert habe. · Ob wir das Abo behalten, ist [[2]] abhängig, wie viel es kostet. · Bist du [[3]] einverstanden, dass wir das Abo kündigen?',
          [['darauf'], ['davon'], ['damit']],
          'Folgt ein Nebensatz, ersetzt ein Pronominaladverb die Präposition mit ihrem Nomen: stolz auf → stolz darauf, dass …; abhängig von → davon abhängig, wie …; einverstanden mit → damit einverstanden, dass … Vor einem Vokal steht „dar-“ (darauf), sonst „da-“ (davon, damit). [fr?] darauf, davon, damit annoncent la subordonnée.'),
        match('q8', aide('Welche Präposition passt? Ordnen Sie zu.', 'Quelle préposition convient ? Associez.'),
          [['verantwortlich', 'für'], ['interessiert', 'an'], ['misstrauisch', 'gegenüber'], ['überzeugt', 'von'], ['gespannt', 'auf'], ['froh', 'über']],
          'verantwortlich für (+ Akk.), interessiert an (+ Dat.), misstrauisch gegenüber (+ Dat.), überzeugt von (+ Dat.), gespannt auf (+ Akk.), froh über (+ Akk.). Beispiele: Ich bin gespannt auf das Ergebnis. Wir sind froh über die Lösung. [fr?] responsable de, intéressé par, méfiant envers, convaincu de, impatient de, content de.'),
        choice('q9', aide('„Sie ist stolz auf ihre Tochter.“ Wie fragt man nach dem unterstrichenen Teil „auf ihre Tochter“?', 'Comment poser la question sur « auf ihre Tochter » ?'),
          [['Worauf ist sie stolz?'], ['Auf wen ist sie stolz?', true], ['Wovon ist sie stolz?'], ['Für wen ist sie stolz?']],
          'Bei Personen fragt man mit Präposition + Fragepronomen: „Auf wen ist sie stolz?“ Bei Sachen nimmt man das Fragewort mit wo(r)-: „Worauf ist sie stolz? – Auf ihre Arbeit.“ „Wovon“ und „für wen“ haben die falsche Präposition. [fr?] Pour une personne : auf wen ? ; pour une chose : worauf ?'),
        choice('q10', aide('Welcher Satz ist richtig?', 'Quelle phrase est correcte ? (« Nous sommes très satisfaits du résultat. »)'),
          [['Wir sind von dem Ergebnis sehr zufrieden.'], ['Wir sind für das Ergebnis sehr zufrieden.'],
            ['Wir sind mit dem Ergebnis sehr zufrieden.', true], ['Wir sind auf das Ergebnis sehr zufrieden.']],
          '„Zufrieden mit“ + Dativ ist die einzige richtige Verbindung. „Von“ ist eine wörtliche Übersetzung des französischen „de“, „für“ und „auf“ gehören zu anderen Adjektiven (verantwortlich für, stolz auf). [fr?] satisfait de = zufrieden mit, jamais von.'),
      ] },

    // 7 · Lexique
    { id: 'b2-wirtschaft-wortschatz', kind: 'exercise', title: 'Wortschatz: Werbung, Kauf und Verbraucherrechte', estimatedMinutes: 12,
      competences: ['lecture', 'expression-ecrite'],
      lesson: { description: `${aide('Lernen Sie die Wörter in Verbindungen: Nomen mit Verb, Wortbildung und Formulierungen für die Diskussion.', 'Apprenez les mots en contexte : nom et verbe, formation des mots et formules pour débattre.')}

TIPP
[fr?] Conseil
${aide('Adjektive auf -bar und -lich bedeuten oft „kann man …“: reparierbar = kann man reparieren. Adjektive auf -los bedeuten „ohne“: kostenlos = ohne Kosten.', 'Les suffixes -bar et -lich expriment souvent une possibilité ; -los signifie « sans ».')}` },
      questions: [
        match('q1', aide('Welches Verb passt? Ordnen Sie zu.', 'Quel verbe convient ? Associez.'),
          [['ein Abo', 'kündigen'], ['sein Geld', 'zurückfordern'], ['auf einen Trick', 'hereinfallen'], ['den Eindruck', 'erwecken'],
            ['ein Versprechen', 'halten'], ['Emissionen', 'ausgleichen']],
          'ein Abo kündigen, sein Geld zurückfordern, auf einen Trick hereinfallen, den Eindruck erwecken, ein Versprechen halten, Emissionen ausgleichen. Diese Verbindungen kommen in allen Texten des Moduls vor. [fr?] résilier, réclamer son argent, se faire avoir, donner l’impression, tenir une promesse, compenser.'),
        fill('q2', aide('Bilden Sie das passende Adjektiv.', 'Formez l’adjectif correspondant.'),
          'Ein Gerät, das man reparieren kann, ist [[1]]. · Ein Angebot, das nichts kostet, ist [[2]]. · Eine Angabe, die man überprüfen kann, ist [[3]]. · Eine Werbung, die in die Irre führt, ist [[4]].',
          [['reparierbar'], ['kostenlos', 'gratis', 'umsonst'], ['überprüfbar', 'nachprüfbar'], ['irreführend']],
          '-bar bildet aus einem Verb ein Adjektiv der Möglichkeit: reparierbar, überprüfbar. -los bedeutet „ohne“: kostenlos. „Irreführend“ ist ein Partizip I (in die Irre führen) und wird wie ein Adjektiv gebraucht. [fr?] réparable, gratuit, vérifiable, trompeur.'),
        fill('q3', aide('Ergänzen Sie das zusammengesetzte Nomen.', 'Complétez avec le nom composé.'),
          'Die Entscheidung, etwas zu kaufen, ist die [[1]]. · Ein Kauf ohne Nachdenken ist ein [[2]]. · Die Zeit, die ein Produkt hält, ist seine [[3]].',
          [['Kaufentscheidung'], ['Impulskauf', 'Spontankauf'], ['Lebensdauer', 'Haltbarkeit']],
          'Bei zusammengesetzten Nomen bestimmt das letzte Wort Artikel und Bedeutung: die Kaufentscheidung (die Entscheidung), der Impulskauf (der Kauf), die Lebensdauer (die Dauer). [fr?] la décision d’achat, l’achat impulsif, la durée de vie.'),
        choice('q4', aide('Sie wollen eine Aussage in einer Diskussion relativieren. Was passt?', 'Vous voulez nuancer une affirmation dans un débat. Que dites-vous ?'),
          [['Das ist völlig falsch, und das wissen Sie auch ganz genau.'],
            ['Genau so ist es, da kann ich Ihnen nur zustimmen.'],
            ['Das trifft nur zum Teil zu, denn es kommt auf das Produkt an.', true],
            ['Darüber möchte ich lieber gar nicht mehr diskutieren.']],
          '„Das trifft nur zum Teil zu“ schränkt eine Aussage ein, ohne sie ganz abzulehnen; „es kommt auf … an“ nennt die Bedingung. Die anderen Antworten widersprechen ganz, stimmen ganz zu oder beenden das Gespräch. [fr?] « Ce n’est vrai qu’en partie, cela dépend du produit. »'),
        choice('q5', aide('Was bedeutet „Der Schein trügt“?', 'Que signifie « Der Schein trügt » ?'),
          [['Etwas leuchtet besonders hell.'], ['Ein Geldschein ist leider gefälscht worden.'],
            ['Etwas ist anders, als es aussieht.', true], ['Eine Rechnung ist zu hoch.']],
          '„Der Schein“ ist hier der äußere Eindruck, „trügen“ heißt täuschen. Die Redewendung passt genau zu grüner Werbung: Die Verpackung wirkt umweltfreundlich, das Produkt ist es vielleicht nicht. „Der Geldschein“ ist ein anderes Wort. [fr?] Les apparences sont trompeuses.'),
        choice('q6', aide('Ein Unternehmen stellt sich umweltfreundlicher dar, als es ist. Wie nennt man das?', 'Une entreprise se présente comme plus écologique qu’elle ne l’est. Comment appelle-t-on cela ?'),
          [['Upcycling'], ['Greenwashing', true], ['Crowdfunding'], ['Recycling']],
          '„Greenwashing“ (auf Deutsch auch „Grünfärberei“) bezeichnet eine grüne Fassade ohne entsprechende Leistung. Upcycling macht aus Altem etwas Neues, Recycling verwertet Abfall wieder, Crowdfunding ist die Finanzierung eines Projekts durch viele kleine Beiträge. [fr?] l’écoblanchiment.'),
        match('q7', aide('Was bedeuten die Verben? Ordnen Sie zu.', 'Que signifient ces verbes ? Associez.'),
          [['werben', 'für ein Produkt Reklame machen'], ['versprechen', 'sagen, dass etwas sicher eintritt'],
            ['ausgleichen', 'einen Schaden anderswo wiedergutmachen'], ['belegen', 'mit Fakten beweisen']],
          'Diese Verben braucht man, um über Werbung zu sprechen: Eine Firma wirbt mit einem Siegel, sie verspricht eine Wirkung, sie gleicht Emissionen aus, und sie muss ihre Aussagen belegen. [fr?] faire de la publicité, promettre, compenser, prouver.'),
      ] },

    // 8 · Second document (thème pair : lecture) : un forum
    { id: 'b2-wirtschaft-lesen2', kind: 'exercise', title: 'Verstehen: Meinungen in einem Forum', estimatedMinutes: 15,
      competences: ['lecture'],
      lesson: { description: `${C2.lesen}

SITUATION
[fr?] La situation
${aide('In einem Forum zum Thema „Besser leben“ diskutieren vier Personen über Secondhand: Ist gebraucht kaufen nachhaltig oder nur ein neuer Trend?', 'Dans un forum, quatre personnes débattent de la seconde main : est-ce durable, ou seulement une nouvelle mode ?')}
TIPP
[fr?] Conseil
${aide('Lesen Sie jeden Beitrag und fassen Sie ihn in Gedanken in einem Satz zusammen: Ist die Person dafür, dagegen oder sieht sie es differenziert?', 'Résumez mentalement chaque message en une phrase : pour, contre ou nuancé ?')}

FORUM „BESSER LEBEN“: SECONDHAND – NACHHALTIG ODER NUR EIN NEUER TREND?

Rosi_74: Ich kaufe seit Jahren fast alles gebraucht: Kleidung, Möbel, sogar mein Fahrrad. Dabei spare ich viel Geld, und ich bin stolz darauf, dass bei uns kaum noch etwas Neues ins Haus kommt. Natürlich braucht man Geduld, bis man das Richtige findet. Aber genau das macht mir Spaß.

Jonas K.: Ehrlich gesagt bin ich skeptisch. Auf den Plattformen kaufen viele Leute gebrauchte Kleidung, nur um sie nach zwei Wochen wieder zu verkaufen. Das ist doch kein Verzicht, das ist Shopping mit gutem Gewissen. Es sieht so aus, als wäre man nachhaltig, aber man konsumiert genauso viel wie vorher.

Ayşe_D: Bei Elektronik bin ich vorsichtiger. Ich habe einmal ein gebrauchtes Handy gekauft, und der Akku war nach drei Monaten kaputt. Seitdem kaufe ich nur noch generalüberholte Geräte bei Händlern, die ein Jahr Gewährleistung geben. Das ist etwas teurer, aber ich kann mich darauf verlassen.

Paul aus Leipzig: Ich finde, die Debatte geht am Thema vorbei. Ob neu oder gebraucht: Entscheidend ist, wie lange wir Dinge benutzen. Meine Winterjacke ist zwölf Jahre alt, und ich bin mit ihr immer noch zufrieden. Wer etwas lange trägt und repariert, ist nachhaltiger als jemand, der ständig Schnäppchen jagt.` },
      placements: [{ media: 'b2-wirtschaft-lesen2-forum', caption: 'Forum „Besser leben“' }],
      questions: [
        match('q1', aide('Wer vertritt welche Meinung? Ordnen Sie zu.', 'Qui défend quelle opinion ? Associez.'),
          [['Rosi_74', 'Gebraucht kaufen spart Geld und macht ihr Freude.'], ['Jonas K.', 'Auch Secondhand kann zu viel Konsum führen.'],
            ['Ayşe_D', 'Bei Geräten zählt für sie vor allem die Zuverlässigkeit.'], ['Paul aus Leipzig', 'Wichtiger als neu oder gebraucht ist die Nutzungsdauer.']],
          'Rosi nennt Geld und Spaß, Jonas kritisiert das ständige Kaufen und Wiederverkaufen, Ayşe will sich auf ihre Geräte „verlassen“ können, und für Paul ist „entscheidend, wie lange wir Dinge benutzen“. Achten Sie auf Schlüsselwörter, die die Meinung zusammenfassen. [fr?] Repérez dans chaque message la phrase qui résume l’opinion.'),
        choice('q2', aide('Wer hat mit einem gebrauchten Produkt schlechte Erfahrungen gemacht?', 'Qui a eu une mauvaise expérience avec un produit d’occasion ?'),
          [['Rosi_74'], ['Jonas K.'], ['Ayşe_D', true], ['Paul aus Leipzig']],
          'Ayşe schreibt: „Ich habe einmal ein gebrauchtes Handy gekauft, und der Akku war nach drei Monaten kaputt.“ Deshalb kauft sie Elektronik heute nur noch generalüberholt mit Gewährleistung. [fr?] Ayşe : la batterie de son téléphone d’occasion a lâché.'),
        choice('q3', aide('Was meint Jonas K. mit „Shopping mit gutem Gewissen“?', 'Que veut dire Jonas K. par « Shopping mit gutem Gewissen » ?'),
          [['Man kauft gebrauchte Kleidung, um sie anschließend an arme Menschen zu verschenken.'],
            ['Man kauft genauso viel wie vorher, fühlt sich dabei aber umweltbewusst.', true],
            ['Man kauft nur bei Händlern, die ihre Mitarbeiter fair bezahlen.'],
            ['Man kauft nur so viel, wie man wirklich braucht, und spart dabei.']],
          'Jonas kritisiert Leute, die Kleidung „nach zwei Wochen wieder verkaufen“: „Es sieht so aus, als wäre man nachhaltig, aber man konsumiert genauso viel wie vorher.“ Das gute Gewissen ist also nur ein Gefühl, kein echter Verzicht. [fr?] On consomme autant, mais avec bonne conscience.'),
        choice('q4', aide('Was bedeutet „generalüberholt“ im Beitrag von Ayşe_D?', 'Que signifie « generalüberholt » dans le message d’Ayşe_D ?'),
          [['ganz neu, aber zu einem günstigeren Preis verkauft'],
            ['gebraucht, aber geprüft und repariert, bevor es verkauft wird', true],
            ['gebraucht und ohne jede technische Prüfung direkt weiterverkauft'],
            ['von einem anderen Hersteller nachgebaut und billiger']],
          '„Generalüberholt“ heißt: Ein gebrauchtes Gerät wurde gründlich geprüft, gereinigt und wenn nötig repariert. Deshalb können Händler darauf Gewährleistung geben. Das Wort enthält „überholen“ im Sinn von „gründlich instand setzen“. [fr?] reconditionné : d’occasion, mais contrôlé et remis en état.'),
        rf('q5', 'Paul kauft grundsätzlich nur neue Kleidung.', 'n',
          'Steht nicht im Text: Paul sagt „Ob neu oder gebraucht: Entscheidend ist, wie lange wir Dinge benutzen.“ Wo er seine Kleidung kauft, erfahren wir nicht; wir wissen nur, dass seine Winterjacke zwölf Jahre alt ist. [fr?] On ne sait pas où Paul achète ses vêtements.'),
        fill('q6', aide('Ergänzen Sie die Wörter aus den Beiträgen.', 'Complétez avec les mots des messages.'),
          'Rosi ist stolz [[1]], dass kaum etwas Neues ins Haus kommt. · Paul ist mit seiner alten Jacke immer noch [[2]]. · Ayşe kann sich auf die Händler [[3]].',
          [['darauf'], ['zufrieden'], ['verlassen']],
          '„Stolz darauf, dass …“: Vor einem Nebensatz steht das Pronominaladverb „darauf“. „Zufrieden mit“ + Dativ: mit seiner Jacke. „Sich verlassen auf“ + Akkusativ: sich auf die Händler verlassen. [fr?] fier de ce que …, satisfait de, compter sur.'),
      ] },

    // 9 · Vérifier
    { id: 'b2-wirtschaft-kontrolle', kind: 'exercise', title: 'Prüfen: Werbung, Vergleiche und Präpositionen', estimatedMinutes: 14,
      competences: ['lecture', 'ecoute'],
      lesson: { description: `${aide('Prüfen Sie, was Sie in diesem Modul gelernt haben: Hören, Grammatik und Wortschatz.', 'Vérifiez ce que vous avez appris dans ce module : écoute, grammaire et vocabulaire.')}

${aide('Hören Sie einen Werbespot aus dem Radio. Er hilft Ihnen bei den Fragen 1 bis 3.', 'Écoutez un spot publicitaire de la radio. Il vous aide pour les questions 1 à 3.')}` },
      placements: [{ media: 'b2-wirtschaft-kontrolle-audio', caption: 'Werbespot im Radio' }],
      questions: [
        choice('q1', aide('Welchen Eindruck will der Werbespot erwecken?', 'Quelle impression le spot veut-il donner ?'),
          [['Das Duschgel wird ausschließlich in den Alpen aus frischen Bergkräutern hergestellt.'],
            ['Das Duschgel ist im Moment deutlich billiger als alle anderen.'],
            ['Das Duschgel hilft bei Stress im Büro und bei schlechtem Wetter.'],
            ['Nach dem Duschen fühlt man sich so erholt, als wäre man im Urlaub gewesen.', true]],
          '„Schon nach der ersten Dusche fühlen Sie sich, als hätten Sie eine Woche Urlaub in den Alpen gemacht.“ Der irreale Vergleich verspricht ein Gefühl, keine Tatsache. Wo das Duschgel hergestellt wird, sagt der Spot nicht. [fr?] Une impression de vacances : c’est une comparaison irréelle.'),
        choice('q2', aide('Was erfährt man im Pflichthinweis am Ende über „klimaneutral“?', 'Qu’apprend-on, dans la mention obligatoire finale, sur « neutre en carbone » ?'),
          [['Das Duschgel wird ohne Emissionen in einer Solarfabrik hergestellt.'],
            ['Die Firma zahlt für ein Waldprojekt, um ihre Emissionen auszugleichen.', true],
            ['Die Verpackung besteht vollständig aus recyceltem Kunststoff.'],
            ['Ein unabhängiges Siegel bestätigt, dass das Produkt klimaneutral ist.']],
          '„Klimaneutral durch Ausgleichszahlungen für ein Waldprojekt“: Genau diese Praxis kritisiert der Artikel des Moduls. Nach den neuen EU-Regeln wäre diese Werbung nicht mehr erlaubt. [fr?] La neutralité repose seulement sur une compensation.'),
        order('q3', C2.ordnen, [['Nach', 'der Dusche', 'fühlt', 'man', 'sich,', 'als', 'hätte', 'man', 'Urlaub', 'gemacht.']],
          'Hauptsatz mit Inversion („Nach der Dusche fühlt man sich“), dann der irreale Vergleich ohne „ob“: „als“ + konjugiertes Verb + Subjekt + … + Partizip II. [fr?] « Après la douche, on se sent comme si on avait pris des vacances. »'),
        rf('q4', 'Laut Artikel ist der Begriff „umweltfreundlich“ seit Langem gesetzlich geschützt.', 'f',
          'Falsch: „Begriffe wie ‚natürlich‘ oder ‚umweltfreundlich‘ waren lange nicht geschützt.“ Erst die neuen EU-Regeln verlangen, dass Unternehmen solche Aussagen belegen können. [fr?] Ces termes n’étaient justement pas protégés.'),
        fill('q5', aide('Ergänzen Sie die Präposition.', 'Complétez avec la préposition.'),
          'Die Firma ist [[1]] die Angaben in ihrer Werbung verantwortlich. · Viele Hörer sind solchen Versprechen [[2]] skeptisch. · Herr Ruppert war [[3]] dem Kundenservice sehr enttäuscht.',
          [['für'], ['gegenüber'], ['von']],
          'verantwortlich für + Akkusativ; skeptisch gegenüber + Dativ (hier nach dem Nomen: „solchen Versprechen gegenüber“); enttäuscht von + Dativ (bei Personen und Institutionen, über + Akkusativ bei Ereignissen). [fr?] responsable de, sceptique envers, déçu par.'),
        choice('q6', aide('Welche Form passt? „Er spricht über das Produkt, als ob er es selbst erfunden …“', 'Quelle forme convient ?'),
          [['hat'], ['hätte', true], ['hatte'], ['habe gehabt']],
          'Irrealer Vergleich in der Vergangenheit: Partizip II + „hätte“ am Ende des Nebensatzes mit „als ob“. „Hat“ und „hatte“ sind Indikativ und passen nicht zu einem irrealen Vergleich, „habe gehabt“ ist keine mögliche Form. [fr?] « comme s’il l’avait inventé » : hätte + participe.'),
        fill('q7', aide('Ergänzen Sie die Verben aus dem Radiogespräch.', 'Complétez avec les verbes de l’émission.'),
          'Herr Ruppert ist auf ein Zusatzangebot [[1]]. Zum Glück hat er das Abo später [[2]].',
          [['hereingefallen', 'reingefallen'], ['gekündigt']],
          '„Auf etwas hereinfallen“ bildet das Perfekt mit „sein“: Er ist hereingefallen (umgangssprachlich: reingefallen). „Kündigen“ bildet es mit „haben“: Er hat das Abo gekündigt. [fr?] se faire avoir ; résilier.'),
        choice('q8', aide('Was bedeutet im Werbespot „solange der Vorrat reicht“?', 'Que signifie « solange der Vorrat reicht » dans le spot ?'),
          [['nur so lange, wie noch Produkte da sind', true],
            ['nur für Kunden, die schon einen Vorrat haben'],
            ['so lange, bis man genug Duschgel gekauft hat'],
            ['nur für Bestellungen ab einer bestimmten Menge']],
          '„Der Vorrat“ ist die Menge der vorhandenen Ware, „reichen“ heißt genügen. Das Angebot endet also, wenn keine Produkte mehr da sind. Solche Formeln stehen oft im schnell gesprochenen Pflichthinweis am Ende eines Spots. [fr?] « dans la limite des stocks disponibles ».'),
      ] },
  ],
};
