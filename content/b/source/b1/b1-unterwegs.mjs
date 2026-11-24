// Module B1 n° 13 · thème « Unterwegs » (lot R3). Voyager malgré les imprévus : comprendre une annonce de perturbation,
// comparer deux trajets, exprimer une concession (obwohl, trotzdem) et une cause, un obstacle ou un remplacement au génitif
// (wegen, trotz, statt, während).
// Reprise réécrite du brouillon B1 V1 : avis de perturbation, solutions porte à porte, concession, dialogue du train
// supprimé avant le concert et son quiz (content/b1-v1/source/partie2.mjs › b1-unterwegs).
import { C, bi, choice, fill, order, match, dictation, speak } from '../../lib.mjs';

/** « Richtig / falsch / steht nicht im Text » : r, f ou n pour la bonne réponse. */
const rf = (id, statement, answer, explanation) => choice(id, `${statement} ${C.richtigFalsch}`,
  [['richtig', answer === 'r'], ['falsch', answer === 'f'], ['steht nicht im Text', answer === 'n']], explanation);

export default {
  id: 'b1-unterwegs',
  title: 'Unterwegs : voyager malgré les imprévus',
  objective: 'Comprendre une annonce de perturbation et un échange au guichet, comparer deux trajets, exprimer une concession (obwohl, trotzdem) et employer wegen, trotz, statt et während avec le génitif.',
  grammarFocus: ['obwohl-trotzdem', 'genitiv-praepositionen'],
  sources: [
    'Textes, dialogues, annonces et exercices originaux LinguaCap.',
    'Situations reprises et réécrites du brouillon B1 V1 (LinguaCap) : avis de perturbation, dialogue du train supprimé avant le concert.',
  ],

  vocabulary: [
    { word: 'Verspätung', article: 'die', plural: 'Verspätungen', partOfSpeech: 'noun', translation: 'le retard',
      example: 'Der Zug hat heute zwanzig Minuten Verspätung.', note: 'Verspätung haben : être en retard (train, bus)' },
    { word: 'sich verspäten', partOfSpeech: 'verb', translation: 'être en retard, avoir du retard',
      example: 'Der Bus verspätet sich um zehn Minuten.', note: null },
    { word: 'Ausfall', article: 'der', plural: 'Ausfälle', partOfSpeech: 'noun', translation: 'la suppression (d’un train), l’annulation',
      example: 'Wegen des Ausfalls fahren heute Busse.', note: null },
    { word: 'ausfallen', partOfSpeech: 'verb', translation: 'être supprimé, être annulé',
      example: 'Der Zug nach Talheim fällt heute aus.', note: 'séparable : aus|fallen · Perfekt : ist ausgefallen' },
    { word: 'Schienenersatzverkehr', article: 'der', plural: null, partOfSpeech: 'noun', translation: 'le service de bus de remplacement',
      example: 'Am Wochenende gibt es zwischen Wiesenbach und Talheim Schienenersatzverkehr.', note: 'souvent abrégé SEV' },
    { word: 'Ersatzbus', article: 'der', plural: 'Ersatzbusse', partOfSpeech: 'noun', translation: 'le bus de remplacement',
      example: 'Der Ersatzbus fährt am Ausgang West ab.', note: null },
    { word: 'den Anschluss verpassen', partOfSpeech: 'expression', translation: 'rater la correspondance',
      example: 'Wegen der Verspätung haben wir den Anschluss verpasst.', note: 'der Anschluss : la correspondance' },
    { word: 'umsteigen', partOfSpeech: 'verb', translation: 'changer (de train, de bus)',
      example: 'In Neudorf steigen Sie in den Regionalexpress um.', note: 'séparable : um|steigen · Perfekt : ist umgestiegen' },
    { word: 'Verbindung', article: 'die', plural: 'Verbindungen', partOfSpeech: 'noun', translation: 'la liaison, le trajet (en transports)',
      example: 'Ich habe eine schnellere Verbindung gefunden.', note: null },
    { word: 'Strecke', article: 'die', plural: 'Strecken', partOfSpeech: 'noun', translation: 'la ligne, le trajet',
      example: 'Auf der Strecke nach Talheim wird gebaut.', note: null },
    { word: 'Störung', article: 'die', plural: 'Störungen', partOfSpeech: 'noun', translation: 'la panne, l’incident technique',
      example: 'Wegen einer Störung fällt der Zug aus.', note: null },
    { word: 'Baustelle', article: 'die', plural: 'Baustellen', partOfSpeech: 'noun', translation: 'le chantier',
      example: 'Wegen einer großen Baustelle fahren weniger Züge.', note: null },
    { word: 'Durchsage', article: 'die', plural: 'Durchsagen', partOfSpeech: 'noun', translation: 'l’annonce (au haut-parleur)',
      example: 'Haben Sie die Durchsage am Bahnsteig verstanden?', note: null },
    { word: 'Bahnsteig', article: 'der', plural: 'Bahnsteige', partOfSpeech: 'noun', translation: 'le quai',
      example: 'Der Zug hält im vorderen Bereich des Bahnsteigs.', note: null },
    { word: 'Umweg', article: 'der', plural: 'Umwege', partOfSpeech: 'noun', translation: 'le détour',
      example: 'Wegen der Baustelle mussten wir einen Umweg fahren.', note: 'einen Umweg fahren / machen' },
    { word: 'Fahrgastrechte', article: null, plural: null, partOfSpeech: 'noun', translation: 'les droits des voyageurs',
      example: 'Die Fahrgastrechte gelten auch für Monatskarten.', note: 'toujours au pluriel ici : die Fahrgastrechte' },
    { word: 'Monatskarte', article: 'die', plural: 'Monatskarten', partOfSpeech: 'noun', translation: 'l’abonnement mensuel',
      example: 'Mit meiner Monatskarte fahre ich jeden Tag in die Stadt.', note: null },
    { word: 'gelten', partOfSpeech: 'verb', translation: 'être valable',
      example: 'Gelten die Fahrkarten auch im Ersatzbus?', note: 'es gilt, galt, hat gegolten' },
    { word: 'einen Antrag stellen', partOfSpeech: 'expression', translation: 'faire une demande (officielle)',
      example: 'Nach einer Stunde Verspätung können Sie einen Antrag stellen.', note: 'der Antrag : la demande, le formulaire' },
    { word: 'pendeln', partOfSpeech: 'verb', translation: 'faire la navette (domicile-travail)',
      example: 'Miriam pendelt jeden Tag in die Stadt.', note: null },
    { word: 'Pendler', article: 'der', plural: 'Pendler', partOfSpeech: 'noun', translation: 'le navetteur',
      example: 'Viele Pendler fahren morgens mit dem Zug.', note: 'féminin : die Pendlerin, die Pendlerinnen' },
    { word: 'im Stau stehen', partOfSpeech: 'expression', translation: 'être pris dans les bouchons',
      example: 'Im Winter steht Jonas oft im Stau.', note: 'der Stau : l’embouteillage' },
    { word: 'rechtzeitig', partOfSpeech: 'adverb', translation: 'à temps',
      example: 'Trotz der Störung sind wir rechtzeitig angekommen.', note: null },
    { word: 'obwohl', partOfSpeech: 'conjunction', translation: 'bien que, alors que',
      example: 'Obwohl es regnet, fährt Jonas mit dem Rad.', note: 'subordonnée : verbe conjugué à la fin' },
    { word: 'trotzdem', partOfSpeech: 'adverb', translation: 'quand même, malgré cela',
      example: 'Der Bus war voll. Trotzdem sind wir eingestiegen.', note: 'adverbe en tête : verbe juste après (Trotzdem sind wir …)' },
    { word: 'wegen', partOfSpeech: 'preposition', translation: 'à cause de',
      example: 'Wegen des Regens nehmen wir den Bus.', note: '+ génitif (à l’oral, souvent + datif)' },
    { word: 'trotz', partOfSpeech: 'preposition', translation: 'malgré',
      example: 'Trotz des Regens fahre ich mit dem Rad.', note: '+ génitif' },
    { word: 'statt', partOfSpeech: 'preposition', translation: 'au lieu de',
      example: 'Statt des Zuges nehmen wir den Bus.', note: '+ génitif ; aussi : anstatt' },
    { word: 'während', partOfSpeech: 'preposition', translation: 'pendant',
      example: 'Während der Fahrt lese ich die Zeitung.', note: '+ génitif ; aussi conjonction : pendant que' },
  ],

  media: [
    { key: 'b1-unterwegs-lesen-aushang', kind: 'image', title: 'Affiche : travaux et bus de remplacement',
      alt: 'Affiche « Bauarbeiten : Zugausfall zwischen Wiesenbach und Talheim » : du samedi 6 h au lundi 4 h, des bus remplacent les trains, départ devant la gare (sortie nord), environ 30 minutes de plus ; pas de vélo dans le bus ; le billet reste valable.',
      image: { layout: 'document', variant: 'sign', icon: 'construction', title: 'Bauarbeiten: Zugausfall zwischen Wiesenbach und Talheim',
        subtitle: 'Information für Fahrgäste',
        rows: [['Wann?', 'Samstag, 6 Uhr, bis Montag, 4 Uhr'], ['Statt der Züge', 'Busse (Schienenersatzverkehr)'],
          ['Abfahrt', 'vor dem Bahnhof, Ausgang Nord'], ['Fahrzeit', 'ca. 30 Minuten länger']],
        lines: [{ icon: 'bike', text: 'Fahrräder können im Bus nicht mitgenommen werden.' },
          { icon: 'ticket', text: 'Ihre Fahrkarte gilt auch im Bus.' }] } },

    { key: 'b1-unterwegs-hoeren-dialog', kind: 'audio', title: 'Au guichet : un train supprimé avant le concert',
      script: [
        { voice: 'frau', name: 'Mila', text: 'Paul, schau mal auf die Anzeige! Unser Zug nach Rosenau fällt aus. Wegen einer Signalstörung.' },
        { pause: 0.5 },
        { voice: 'mann2', name: 'Paul', text: 'Ach nein, nicht schon wieder! Das Konzert fängt um sechs an, und der Einlass endet schon um halb sechs. Was machen wir jetzt?' },
        { pause: 0.5 },
        { voice: 'frau', name: 'Mila', text: 'Komm, wir fragen am Infoschalter. Die wissen sicher mehr.' },
        { pause: 0.9 },
        { voice: 'frau3', name: 'Mitarbeiterin', text: 'Guten Tag, was kann ich für Sie tun?' },
        { pause: 0.4 },
        { voice: 'frau', name: 'Mila', text: 'Guten Tag. Unser Regionalzug nach Rosenau um fünfzehn Uhr zehn fällt aus. Könnten Sie uns sagen, wie wir jetzt am besten dorthin kommen?' },
        { pause: 0.5 },
        { voice: 'frau3', name: 'Mitarbeiterin', text: 'Sie haben zwei Möglichkeiten. Statt des Zuges fährt ein Ersatzbus. Er fährt um fünfzehn Uhr dreißig am Ausgang West ab und braucht ungefähr eine Stunde. In Rosenau hält er direkt am Marktplatz.' },
        { pause: 0.5 },
        { voice: 'mann2', name: 'Paul', text: 'Und fährt heute gar kein Zug mehr nach Rosenau?' },
        { pause: 0.4 },
        { voice: 'frau3', name: 'Mitarbeiterin', text: 'Doch. Um sechzehn Uhr zehn fährt ein Regionalexpress nach Neudorf. Dort steigen Sie um und sind um sechzehn Uhr fünfundfünfzig am Bahnhof Rosenau.' },
        { pause: 0.5 },
        { voice: 'mann2', name: 'Paul', text: 'Der Zug ist doch schneller. Den würde ich nehmen.' },
        { pause: 0.4 },
        { voice: 'frau', name: 'Mila', text: 'Moment mal. Vom Bahnhof Rosenau bis zur Konzerthalle läuft man fast vierzig Minuten. Vom Marktplatz sind es nur zehn Minuten.' },
        { pause: 0.5 },
        { voice: 'mann2', name: 'Paul', text: 'Stimmt. Obwohl der Zug schneller fährt, sind wir mit dem Bus früher an der Halle. Und wenn wir in Neudorf den Anschluss verpassen, ist sowieso alles zu spät.' },
        { pause: 0.5 },
        { voice: 'frau', name: 'Mila', text: 'Gilt unsere Fahrkarte eigentlich auch im Bus?' },
        { pause: 0.4 },
        { voice: 'frau3', name: 'Mitarbeiterin', text: 'Ja, Ihre Fahrkarte gilt auch im Ersatzbus, Sie brauchen kein neues Ticket. Und falls Sie wegen der Störung mehr als eine Stunde später ankommen, können Sie ein Formular für die Fahrgastrechte ausfüllen.' },
        { pause: 0.5 },
        { voice: 'frau', name: 'Mila', text: 'Vielen Dank! Und wo genau ist der Ausgang West?' },
        { pause: 0.4 },
        { voice: 'frau3', name: 'Mitarbeiterin', text: 'Gehen Sie hier links an Gleis eins vorbei und dann die Treppe hinunter. Dort sehen Sie die Busse schon.' },
        { pause: 0.7 },
        { voice: 'mann2', name: 'Paul', text: 'Danke schön! Ich schreibe schnell Lena, dass wir den Bus nehmen. Trotz der Störung schaffen wir es also noch rechtzeitig.' },
        { pause: 0.4 },
        { voice: 'frau', name: 'Mila', text: 'Hoffentlich! Obwohl es regnet, laufen wir vom Marktplatz zu Fuß. Ein Taxi zu finden dauert sicher zu lange.' },
      ] },

    { key: 'b1-unterwegs-hoeren2-d1', kind: 'audio', title: 'Annonce 1 : changement de voie',
      script: [{ voice: 'sprecherin', text: 'Gleis vier. Information zum Regionalexpress nach Talheim, Abfahrt zehn Uhr zwölf. Dieser Zug fährt heute ausnahmsweise von Gleis sieben ab. Bitte beachten Sie den Gleiswechsel.' }] },
    { key: 'b1-unterwegs-hoeren2-d2', kind: 'audio', title: 'Annonce 2 : un train en retard',
      script: [{ voice: 'sprecher', text: 'Achtung an Gleis zwei. Die Regionalbahn nach Neudorf, planmäßige Abfahrt zehn Uhr zwanzig, hat heute etwa fünfundzwanzig Minuten Verspätung. Grund ist eine Reparatur am Zug. Wir bitten um Entschuldigung.' }] },
    { key: 'b1-unterwegs-hoeren2-d3', kind: 'audio', title: 'Annonce 3 : un bus à la place du train',
      script: [{ voice: 'sprecherin', text: 'Information für Fahrgäste in Richtung Wiesenbach. Wegen Bauarbeiten fällt der Zug um zehn Uhr dreißig aus. Statt des Zuges fährt ein Bus. Er fährt am Busbahnhof vor dem Ausgang Nord ab.' }] },
    { key: 'b1-unterwegs-hoeren2-d4', kind: 'audio', title: 'Annonce 4 : un arrêt supplémentaire',
      script: [{ voice: 'sprecher', text: 'Ein Hinweis für alle Fahrgäste. Der Regionalexpress nach Hamburg, Abfahrt zehn Uhr fünfundvierzig von Gleis drei, hält heute zusätzlich in Neudorf. Fahrgäste nach Neudorf können also auch diesen Zug nehmen.' }] },

    { key: 'b1-unterwegs-kontrolle-nachricht', kind: 'audio', title: 'Message vocal de Lena',
      script: [
        { voice: 'frau2', name: 'Lena', text: 'Hallo ihr zwei, hier ist Lena! Ich habe eure Nachricht gerade gelesen. Super, dass ihr trotz der Störung noch kommt!' },
        { pause: 0.4 },
        { voice: 'frau2', name: 'Lena', text: 'Ich warte nicht am Marktplatz, sondern direkt am Eingang der Konzerthalle. Am Marktplatz ist wegen des Regens alles voll, da findet ihr mich nie.' },
        { pause: 0.4 },
        { voice: 'frau2', name: 'Lena', text: 'Eure Karten habe ich schon. Falls euer Bus Verspätung hat, schreibt mir bitte kurz. Bis gleich!' },
      ] },
  ],

  activities: [
    // 1 · Mise en route
    { id: 'b1-unterwegs-einstieg', kind: 'lesson', title: 'Mise en route : en route malgré les imprévus', estimatedMinutes: 10,
      competences: ['lecture', 'expression-orale'],
      lesson: { description: `UNTERWEGS
[fr] En route
${bi('Zug, Bus, Fahrrad oder Auto: Unterwegs passiert oft etwas Unerwartetes.', 'Train, bus, vélo ou voiture : en route, il arrive souvent quelque chose d’inattendu.')}

FRAGEN ZUM EINSTIEG
[fr] Questions pour commencer
• ${bi('Wie kommen Sie jeden Tag zur Arbeit oder zum Kurs? Wie lange brauchen Sie?', 'Comment allez-vous chaque jour au travail ou en cours ? Combien de temps vous faut-il ?')}
• ${bi('Was war Ihre längste Verspätung? Was haben Sie dann gemacht?', 'Quel a été votre plus long retard ? Qu’avez-vous fait alors ?')}
• ${bi('Was ist Ihnen unterwegs am wichtigsten: Zeit, Geld oder Komfort?', 'Qu’est-ce qui compte le plus pour vous en route : le temps, l’argent ou le confort ?')}
${bi('Antworten Sie laut auf Deutsch, in zwei oder drei Sätzen.', 'Répondez à voix haute en allemand, en deux ou trois phrases.')}

ICH KANN …
[fr] Je peux…
• ${bi('eine Durchsage über eine Störung verstehen', 'comprendre une annonce de perturbation')}
• ${bi('zwei Verbindungen vergleichen und mich entscheiden', 'comparer deux trajets et choisir')}
• ${bi('sagen, was trotz eines Problems passiert (obwohl, trotzdem)', 'dire ce qui se passe malgré un problème (obwohl, trotzdem)')}
• ${bi('einen Grund oder eine Alternative nennen (wegen, statt)', 'donner une cause ou une alternative (wegen, statt)')}

WICHTIGE WÖRTER
[fr] Mots-clés
• die Verspätung — le retard
• der Ausfall — la suppression (d’un train)
• der Schienenersatzverkehr — le bus de remplacement
• den Anschluss verpassen — rater la correspondance
• die Durchsage — l’annonce (au haut-parleur)
• der Umweg — le détour
• pendeln — faire la navette (domicile-travail)
• die Fahrgastrechte — les droits des voyageurs` } },

    // 2 · Lecture longue : article et affiche
    { id: 'b1-unterwegs-lesen', kind: 'exercise', title: 'Comprendre : un article sur les navetteurs', estimatedMinutes: 20,
      competences: ['lecture'],
      lesson: { description: `${C.lesen}
${bi('Lesen Sie auch den Aushang am Bahnhof von Wiesenbach unter dem Bericht.', 'Lisez aussi l’affiche de la gare de Wiesenbach, sous l’article.')}

STRATEGIE
[fr] Stratégie
${bi('Lesen Sie zuerst den Titel und den ersten Satz von jedem Absatz. Worum geht es?', 'Lisez d’abord le titre et la première phrase de chaque paragraphe. De quoi s’agit-il ?')}
${bi('Lesen Sie dann die Aussagen und suchen Sie die passende Stelle im Text.', 'Lisez ensuite les affirmations et cherchez le passage qui correspond.')}
${bi('„Steht nicht im Text“ bedeutet: Der Text sagt dazu nichts.', '« Non mentionné » signifie : le texte n’en dit rien.')}

JEDEN TAG UNTERWEGS
Ein Bericht aus der Regionalzeitung

(A) Fast jeden Morgen um 6.40 Uhr steht Miriam Köhler am Bahnhof von Wiesenbach. Die 34-jährige Krankenpflegerin arbeitet in einer Klinik in der Stadt, 48 Kilometer entfernt. Wie sie fahren viele Menschen aus der Region jeden Tag zur Arbeit in die Stadt und abends wieder zurück; manche sind mehr als eine Stunde pro Strecke unterwegs. „Obwohl die Fahrt lang ist, möchte ich nicht in die Stadt ziehen“, sagt Miriam. „Auf dem Land sind die Mieten niedriger, und meine Eltern wohnen gleich nebenan.“

(B) Leicht ist das Pendeln nicht immer. Wegen einer großen Baustelle fällt der Zug zurzeit oft aus. Dann fahren Ersatzbusse, und die Fahrt dauert eine halbe Stunde länger. „Letzte Woche habe ich wegen einer Störung auch noch den Anschluss verpasst und bin zu spät zum Dienst gekommen“, erzählt sie. Trotzdem bleibt sie gelassen. Sie liest, hört Musik oder plant ihren Tag. „Während der Fahrt habe ich Zeit nur für mich. Das ist fast wie eine kleine Pause.“

(C) Ihr Kollege Jonas Brandt hat sich anders entschieden. Statt des Zuges nimmt er seit einem Jahr das E-Bike, zumindest von April bis Oktober. Für die 18 Kilometer aus seinem Dorf braucht er etwa 50 Minuten. „Trotz des Regens fahre ich fast immer. Danach bin ich wacher als nach jeder Bahnfahrt“, sagt er und lacht. Im Winter nimmt er allerdings das Auto, obwohl er dann oft im Stau steht.

(D) Wer pendelt, sollte seine Rechte kennen. Wer mit mehr als einer Stunde Verspätung am Ziel ankommt, kann in vielen Fällen einen Teil des Fahrpreises zurückbekommen. Diese Fahrgastrechte gelten auch für Monatskarten. Viele Fahrgäste wissen das aber nicht und stellen keinen Antrag. Miriam hat es einmal ausprobiert: „Das Formular war in zehn Minuten ausgefüllt. Ein paar Wochen später war das Geld auf meinem Konto.“

AUSHANG AM BAHNHOF WIESENBACH
Bauarbeiten – Zugausfall zwischen Wiesenbach und Talheim
Information für Fahrgäste
• Wann? Samstag, 6 Uhr, bis Montag, 4 Uhr
• Statt der Züge: Busse (Schienenersatzverkehr)
• Abfahrt: vor dem Bahnhof, Ausgang Nord
• Fahrzeit: ca. 30 Minuten länger
• Fahrräder können im Bus nicht mitgenommen werden.
• Ihre Fahrkarte gilt auch im Bus.` },
      placements: [{ media: 'b1-unterwegs-lesen-aushang', caption: 'Aushang am Bahnhof Wiesenbach' }],
      questions: [
        choice('q1', bi('Worum geht es in dem Bericht vor allem?', 'De quoi parle surtout cet article ?'),
          [['wie zwei Menschen ihren langen Weg zur Arbeit erleben', true], ['warum immer mehr Menschen in die Stadt ziehen'],
            ['wie man im Zug am besten arbeiten kann']],
          'Les paragraphes A à C suivent Miriam et son collègue Jonas sur leur trajet quotidien, et D donne un conseil aux navetteurs. Personne ne déménage en ville : Miriam dit justement qu’elle ne veut pas y habiter. Le travail dans le train n’est pas évoqué.'),
        choice('q2', bi('Lesen Sie den Aushang: Was kündigt er an?', 'Lisez l’affiche : qu’annonce-t-elle ?'),
          [['Ab Montag fahren keine Züge mehr nach Talheim.'], ['Am Wochenende braucht man für den Bus eine neue Fahrkarte.'],
            ['Am Wochenende fahren zwischen Wiesenbach und Talheim Busse statt Züge.', true]],
          'L’affiche annonce des travaux du samedi au lundi matin et un « Schienenersatzverkehr » : des bus à la place des trains. Le lundi à 4 h, les trains reprennent, et le billet reste valable dans le bus (« Ihre Fahrkarte gilt auch im Bus »).'),
        rf('q3', 'Miriam möchte in die Stadt ziehen, weil die Fahrt so lang ist.', 'f',
          'Faux : « Obwohl die Fahrt lang ist, möchte ich nicht in die Stadt ziehen ». Obwohl introduit l’obstacle (le long trajet), mais la conclusion est l’inverse : elle reste à la campagne, où les loyers sont plus bas.'),
        rf('q4', 'Wegen einer Baustelle fahren zurzeit manchmal Busse statt Züge.', 'r',
          'Paragraphe B : « Wegen einer großen Baustelle fällt der Zug zurzeit oft aus. Dann fahren Ersatzbusse ». Wegen donne la cause, et les Ersatzbusse remplacent le train.'),
        rf('q5', 'Jonas’ Arbeitgeber hat ihm das E-Bike bezahlt.', 'n',
          'Le texte dit seulement que Jonas prend son vélo électrique d’avril à octobre. Qui l’a payé n’est jamais dit : non mentionné. « Falsch » supposerait que le texte dise le contraire.'),
        rf('q6', 'Mit einer Monatskarte bekommt man bei Verspätung kein Geld zurück.', 'f',
          'Faux : paragraphe D, « Diese Fahrgastrechte gelten auch für Monatskarten ». Les droits des voyageurs valent aussi pour les abonnés, même si beaucoup ne le savent pas.'),
        match('q7', bi('Welche Überschrift passt zu welchem Absatz? Ordnen Sie zu.', 'Quel intertitre convient à quel paragraphe ? Associez.'),
          [['Absatz A', 'Warum Miriam auf dem Land bleibt'], ['Absatz B', 'Wenn der Zug nicht kommt'],
            ['Absatz C', 'Eine Alternative auf zwei Rädern'], ['Absatz D', 'Geld zurück bei Verspätung']],
          'A : Miriam explique pourquoi elle reste à la campagne (loyers, parents). B : les suppressions de trains et le bus de remplacement. C : Jonas et son vélo électrique (« auf zwei Rädern »). D : les droits des voyageurs et le remboursement.'),
        fill('q8', bi('Absatz D: „Viele Fahrgäste wissen das aber nicht.“ Was wissen sie nicht? Ergänzen Sie.', 'Paragraphe D : que ne savent-ils pas ? Complétez.'),
          'Sie kennen ihre [[1]] nicht: Bei mehr als einer Stunde Verspätung bekommen sie einen Teil des [[2]] zurück.',
          [['Rechte', 'Fahrgastrechte'], ['Fahrpreises', 'Preises', 'Ticketpreises', 'Geldes']],
          '« das » reprend toute l’information qui précède : les droits des voyageurs (die Fahrgastrechte) et le remboursement d’une partie du prix du billet. « einen Teil des Fahrpreises » : génitif, d’où le -es final.'),
      ] },

    // 3 · Écoute longue : prise de notes puis questions
    { id: 'b1-unterwegs-hoeren', kind: 'exercise', title: 'Comprendre : un train supprimé avant le concert', estimatedMinutes: 18,
      competences: ['ecoute'],
      lesson: { description: `${C.hoeren}

${bi('Situation: Mila und Paul wollen am Samstag zu einem Konzert nach Rosenau fahren. Am Bahnhof gibt es ein Problem.', 'Situation : Mila et Paul veulent aller samedi à un concert à Rosenau. À la gare, il y a un problème.')}

STRATEGIE
[fr] Stratégie
${bi('Beim ersten Hören: Wer spricht? Wo sind die Personen? Was ist das Problem?', 'Première écoute : qui parle ? où sont les personnes ? quel est le problème ?')}
${bi('Lesen Sie dann die Notizen: Welche Information fehlt – eine Uhrzeit, ein Ort, eine Zahl?', 'Lisez ensuite les notes : quel type d’information manque – une heure, un lieu, un nombre ?')}
${bi('Beim zweiten Hören notieren Sie nur Stichwörter, keine ganzen Sätze.', 'À la deuxième écoute, notez seulement des mots-clés, pas des phrases entières.')}
${bi('Die Transkription sehen Sie nach Ihren Antworten.', 'Vous verrez la transcription après vos réponses.')}` },
      placements: [{ media: 'b1-unterwegs-hoeren-dialog', transcriptVisibility: 'after_answer' }],
      questions: [
        fill('q1', C.notizen,
          'Grund für den Ausfall: eine [[1]] · Ersatzbus: Abfahrt um [[2]] am Ausgang [[3]] · Regionalexpress: umsteigen in [[4]] · Fußweg vom Marktplatz zur Konzerthalle: [[5]] Minuten',
          [['Signalstörung', 'Störung', 'Störung am Signal'], ['15.30 Uhr', '15:30 Uhr', '15.30', '15:30', '15 Uhr 30', 'fünfzehn Uhr dreißig', 'halb vier'],
            ['West'], ['Neudorf'], ['10', 'zehn']],
          'Mila lit « wegen einer Signalstörung » sur le panneau. L’employée annonce le bus « um fünfzehn Uhr dreißig am Ausgang West » et le changement « in Neudorf ». Mila calcule ensuite : du Marktplatz à la salle, « nur zehn Minuten » (contre quarante depuis la gare).'),
        choice('q2', bi('Warum nehmen Mila und Paul den Bus und nicht den Regionalexpress?', 'Pourquoi Mila et Paul prennent-ils le bus et pas le RE ?'),
          [['Der Bus ist billiger als der Zug.'], ['Mit dem Zug wären sie zu spät an der Konzerthalle.', true], ['Im Zug gibt es keine freien Plätze mehr.']],
          'Le train arrive à 16 h 55 à la gare, puis il faut marcher près de 40 minutes : arrivée vers 17 h 35, après la fin des entrées (17 h 30). Le bus arrive vers 16 h 30 au Marktplatz, à 10 minutes de la salle. D’où « Obwohl der Zug schneller fährt, sind wir mit dem Bus früher an der Halle ». Le prix n’est jamais comparé.'),
        choice('q3', bi('Was sagt die Mitarbeiterin über die Fahrkarte?', 'Que dit l’employée à propos du billet ?'),
          [['Die Fahrkarte gilt auch im Ersatzbus.', true], ['Man muss für den Bus ein neues Ticket kaufen.'], ['Man bekommt das Geld sofort zurück.']],
          '« Ihre Fahrkarte gilt auch im Ersatzbus, Sie brauchen kein neues Ticket ». Le remboursement n’est pas immédiat : il faut remplir un formulaire, et seulement en cas de retard de plus d’une heure.'),
        choice('q4', bi('Wann können die beiden ein Formular für die Fahrgastrechte ausfüllen?', 'Quand peuvent-ils remplir un formulaire de droits des voyageurs ?'),
          [['sofort, wenn ihr Zug ausgefallen ist'], ['nur, wenn sie eine Monatskarte haben'], ['wenn sie über eine Stunde später ankommen', true]],
          '« Falls Sie wegen der Störung mehr als eine Stunde später ankommen, können Sie ein Formular … ausfüllen ». La condition est le retard à l’arrivée, pas la suppression du train en elle-même.'),
        choice('q5', bi('Was macht Paul am Ende?', 'Que fait Paul à la fin ?'),
          [['Er bestellt ein Taxi.'], ['Er schreibt Lena eine Nachricht.', true], ['Er fragt nach dem Weg zum Marktplatz.']],
          '« Ich schreibe schnell Lena, dass wir den Bus nehmen ». Le taxi est écarté par Mila (« dauert sicher zu lange »), et la question sur le chemin porte sur la sortie West, posée par Mila.'),
      ] },

    // 4 · Grammaire inductive
    { id: 'b1-unterwegs-entdecken', kind: 'exercise', title: 'Découvrir : obwohl, trotzdem et le génitif', estimatedMinutes: 10,
      competences: ['lecture'],
      lesson: { description: `${bi('Lesen Sie die Sätze aus dem Bericht und aus dem Gespräch. Beantworten Sie dann die Fragen.', 'Lisez les phrases tirées de l’article et du dialogue, puis répondez aux questions.')}
${bi('Achten Sie auf die Wörter obwohl, trotzdem, wegen, trotz, statt und während.', 'Observez les mots obwohl, trotzdem, wegen, trotz, statt et während.')}

SÄTZE AUS DEN TEXTEN
[fr] Phrases tirées des textes
1. Obwohl die Fahrt lang ist, möchte ich nicht in die Stadt ziehen.
2. Im Winter nimmt er das Auto, obwohl er dann oft im Stau steht.
3. Miriam hat den Anschluss verpasst. Trotzdem bleibt sie gelassen.
4. Obwohl der Zug schneller fährt, sind wir mit dem Bus früher an der Halle.
5. Wegen einer großen Baustelle fällt der Zug zurzeit oft aus.
6. Trotz des Regens fahre ich fast immer.
7. Statt des Zuges nimmt er das E-Bike.
8. Während der Fahrt habe ich Zeit nur für mich.` },
      questions: [
        choice('q1', bi('Sätze 1, 2 und 4: Wo steht das konjugierte Verb im Satzteil mit „obwohl“?', 'Phrases 1, 2 et 4 : où est le verbe conjugué dans la partie avec « obwohl » ?'),
          [['direkt nach „obwohl“'], ['an zweiter Position, wie im Hauptsatz'], ['am Ende des Satzteils', true]],
          'Obwohl introduit une subordonnée : le verbe conjugué va à la fin (« obwohl die Fahrt lang ist », « obwohl er … im Stau steht »). Quand la subordonnée ouvre la phrase (1 et 4), la principale commence par son verbe : « …, möchte ich », « …, sind wir ».'),
        choice('q2', bi('Satz 3: Was kommt direkt nach „trotzdem“?', 'Phrase 3 : qu’est-ce qui vient juste après « trotzdem » ?'),
          [['das konjugierte Verb, dann das Subjekt', true], ['das Subjekt, dann das konjugierte Verb'], ['das Subjekt, und das Verb steht am Ende']],
          'Trotzdem n’est pas une conjonction mais un adverbe : il occupe la première place de la phrase, le verbe reste en 2e position et le sujet passe après (« Trotzdem bleibt sie gelassen »). « Trotzdem sie bleibt » est la faute typique.'),
        match('q3', bi('Was bedeuten die Präpositionen? Ordnen Sie zu.', 'Que signifient ces prépositions ? Associez.'),
          [['wegen', 'à cause de'], ['trotz', 'malgré'], ['statt', 'au lieu de'], ['während', 'pendant']],
          'Phrase 5 : la cause (wegen einer Baustelle). Phrase 6 : l’obstacle qui n’empêche rien (trotz des Regens). Phrase 7 : le remplacement (statt des Zuges). Phrase 8 : la durée (während der Fahrt). Trotz (malgré + nom) est le cousin de trotzdem (malgré cela).'),
        choice('q4', bi('Sätze 5 bis 8: Welcher Kasus folgt auf wegen, trotz, statt und während?', 'Phrases 5 à 8 : quel cas suit wegen, trotz, statt et während ?'),
          [['der Dativ'], ['der Genitiv', true], ['der Akkusativ']],
          'On reconnaît le génitif : des Regens, des Zuges (masculin : des + nom en -s ou -es), der Fahrt, einer Baustelle (féminin : der, einer). Le datif serait « dem Regen », « dem Zug », qu’on entend à l’oral mais pas dans un texte écrit soigné.'),
      ] },

    // 5 · Règle
    { id: 'b1-unterwegs-regel', kind: 'lesson', title: 'À retenir : la concession et les prépositions du génitif', estimatedMinutes: 8,
      competences: ['lecture'],
      lesson: { description: `À RETENIR — obwohl et trotzdem
Les deux expriment une concession : quelque chose se passe malgré un obstacle.
• obwohl (bien que, alors que) introduit une subordonnée : le verbe conjugué va à la fin. Ich bleibe ruhig, obwohl der Zug Verspätung hat.
• Si la subordonnée vient en premier, la principale commence par son verbe : Obwohl es regnet, fahre ich mit dem Rad.
• trotzdem (quand même, malgré cela) est un adverbe qui renvoie à la phrase précédente. En tête, il est suivi du verbe, puis du sujet : Der Zug hat Verspätung. Trotzdem bleibe ich ruhig.
• trotzdem peut aussi se placer après le verbe : Ich bleibe trotzdem ruhig.

LES PRÉPOSITIONS DU GÉNITIF
wegen (à cause de), trotz (malgré), statt (au lieu de) et während (pendant) sont suivies du génitif.
• Masculin et neutre : des + nom en -s ou -es → wegen des Regens, statt des Zuges, während des Konzerts
• Féminin et pluriel : der → wegen der Baustelle, trotz der Verspätung, während der Ferien
• Article indéfini : eines, einer → wegen eines Unfalls, wegen einer Störung
• Adjectif après l’article : -en → trotz des starken Regens, wegen der langen Fahrt

DEUX FAÇONS DE DIRE LA MÊME CHOSE
• Obwohl es stark regnet, fahren wir los. = Trotz des starken Regens fahren wir los.
• Der Zug fällt aus, weil gebaut wird. = Wegen der Bauarbeiten fällt der Zug aus.
La préposition + nom est plus courte et plus écrite ; la subordonnée est plus fréquente à l’oral.

ATTENTION
• « malgré » + nom se dit trotz, jamais obwohl : trotz des Streiks (et non *obwohl des Streiks*).
• Après trotzdem, pas de virgule ni de subordonnée : Trotzdem fahren wir (et non *Trotzdem wir fahren*).
• À l’oral, on entend souvent wegen dem Regen (datif). À l’écrit et à l’examen, employez le génitif : wegen des Regens.
• während est aussi une conjonction (pendant que) : Während ich warte, lese ich. Vous la retrouverez au thème Medien.` } },

    // 6 · Grammaire : s'entraîner
    { id: 'b1-unterwegs-grammatik', kind: 'exercise', title: 'S’entraîner : obwohl, trotzdem et le génitif', estimatedMinutes: 14,
      competences: ['lecture', 'expression-ecrite'],
      lesson: { description: `${bi('Üben Sie obwohl, trotzdem und die Präpositionen mit Genitiv.', 'Entraînez-vous avec obwohl, trotzdem et les prépositions suivies du génitif.')}
${bi('Achten Sie auf die Position des Verbs und auf die Artikel.', 'Faites attention à la place du verbe et aux articles.')}` },
      questions: [
        fill('q1', bi('Ergänzen Sie obwohl oder trotzdem.', 'Complétez avec obwohl ou trotzdem.'),
          'Der Zug hatte zwanzig Minuten Verspätung. [[1]] haben wir den Anschluss erreicht. – [[2]] der Zug zwanzig Minuten Verspätung hatte, haben wir den Anschluss erreicht.',
          [['Trotzdem', 'Dennoch'], ['Obwohl', 'Auch wenn']],
          'Première phrase : le verbe « haben » suit directement le mot manquant, c’est donc l’adverbe trotzdem. Seconde phrase : le verbe « hatte » est à la fin de la subordonnée, c’est donc la conjonction obwohl. Le sens est le même.'),
        order('q2', bi('Bilden Sie einen Satz mit „obwohl“.', 'Formez une phrase avec « obwohl ».'),
          [['Obwohl', 'es', 'stark', 'regnet,', 'fährt', 'Jonas', 'mit dem Rad', 'zur Arbeit.']],
          '« Obwohl es stark regnet, fährt Jonas mit dem Rad zur Arbeit. » Dans la subordonnée, « regnet » est à la fin ; la principale commence ensuite par son verbe « fährt », puis le sujet Jonas.'),
        order('q3', bi('Der Bus war voll. Bilden Sie den zweiten Satz mit „trotzdem“.', 'Le bus était plein. Formez la deuxième phrase avec « trotzdem ».'),
          [['Trotzdem', 'haben', 'wir', 'noch', 'zwei Plätze', 'gefunden.']],
          '« Trotzdem haben wir noch zwei Plätze gefunden. » Trotzdem occupe la 1re place : l’auxiliaire « haben » suit immédiatement, puis le sujet « wir » ; le participe « gefunden » ferme la phrase.'),
        choice('q4', bi('Welcher Satz ist richtig?', 'Quelle phrase est correcte ?'),
          [['Obwohl ich hatte keine Zeit, bin ich gekommen.'], ['Obwohl ich keine Zeit hatte, bin ich gekommen.', true],
            ['Obwohl ich keine Zeit hatte, ich bin gekommen.']],
          'Deux règles à la fois : verbe à la fin après obwohl (« keine Zeit hatte »), puis inversion dans la principale (« bin ich gekommen »). La première phrase oublie la première règle, la troisième oublie la seconde.'),
        fill('q5', bi('Ergänzen Sie den Artikel im Genitiv.', 'Complétez avec l’article au génitif.'),
          'Wegen [[1]] Streiks fahren heute keine Busse. Trotz [[2]] Verspätung haben wir das Konzert nicht verpasst. Während [[3]] Fahrt habe ich gelesen. Statt [[4]] Autos nehme ich heute das Fahrrad.',
          [['des'], ['der'], ['der'], ['des']],
          'Der Streik et das Auto (masculin, neutre) : des + nom en -s (des Streiks, des Autos). Die Verspätung et die Fahrt (féminin) : der, sans terminaison sur le nom. Au génitif, le féminin ne prend jamais de -s.'),
        match('q6', bi('Was passt zusammen? Ordnen Sie zu.', 'Qu’est-ce qui va ensemble ? Associez.'),
          [['Wegen des Schnees', 'fallen heute viele Züge aus.'], ['Trotz des Schnees', 'ist unser Zug pünktlich angekommen.'],
            ['Statt des Zuges', 'nehmen wir heute den Bus.'], ['Während der Fahrt', 'kann man im Zug gut lesen.']],
          'Wegen annonce une conséquence logique (la neige, donc des trains supprimés) ; trotz, un résultat inattendu (la neige, et pourtant à l’heure) ; statt, un remplacement (le bus au lieu du train) ; während, une activité pendant le trajet.'),
        choice('q7', bi('Wählen Sie die richtige Form: „Wir sind trotz … zu Fuß gegangen.“', 'Choisissez la bonne forme.'),
          [['der starke Regen'], ['den starken Regen'], ['des starken Regens', true]],
          'Trotz demande le génitif : der Regen (masculin) devient des Regens, et l’adjectif prend -en après l’article (des starken Regens). « der starke Regen » est le nominatif, « den starken Regen » l’accusatif.'),
        order('q8', bi('Bilden Sie einen Satz.', 'Remettez les mots dans l’ordre.'),
          [['Während', 'der', 'Bauarbeiten', 'fahren', 'zwischen Wiesenbach und Talheim', 'Busse.']],
          '« Während der Bauarbeiten fahren zwischen Wiesenbach und Talheim Busse. » Ici während est une préposition (+ génitif : der Bauarbeiten, pluriel). Le groupe prépositionnel occupe la 1re place, le verbe « fahren » la 2e.'),
        fill('q9', bi('Verbinden Sie die Sätze mit „obwohl“: Die Fahrkarte war teuer. Wir haben sie gekauft.', 'Reliez les phrases avec « obwohl ».'),
          'Obwohl die Fahrkarte teuer [[1]], haben wir sie [[2]].',
          [['war'], ['gekauft']],
          'Dans la subordonnée, « war » passe à la fin. La principale garde son Perfekt : « haben wir sie gekauft », avec l’auxiliaire juste après la virgule et le participe à la fin.'),
      ] },

    // 7 · Lexique : collocations, familles de mots, formules
    { id: 'b1-unterwegs-wortschatz', kind: 'exercise', title: 'Vocabulaire : trajets, retards et formules utiles', estimatedMinutes: 12,
      competences: ['lecture', 'expression-ecrite'],
      lesson: { description: `${bi('Lernen Sie Wörter in festen Verbindungen: Nomen und Verb gehören oft zusammen.', 'Apprenez les mots dans des groupes figés : nom et verbe vont souvent ensemble.')}
${bi('Hören Sie den Wortschatz des Moduls in der Wortliste.', 'Écoutez le vocabulaire du module dans le lexique.')}` },
      questions: [
        match('q1', bi('Welches Verb passt zu welchem Nomen? Ordnen Sie zu.', 'Quel verbe va avec quel nom ? Associez.'),
          [['den Anschluss', 'verpassen'], ['einen Antrag', 'stellen'], ['im Stau', 'stehen'], ['einen Sitzplatz', 'reservieren'], ['einen Umweg', 'fahren']],
          'Ce sont des groupes figés à apprendre en bloc : den Anschluss verpassen (rater la correspondance), einen Antrag stellen (faire une demande), im Stau stehen (être dans les bouchons), einen Sitzplatz reservieren, einen Umweg fahren (faire un détour).'),
        fill('q2', bi('Ergänzen Sie das Nomen aus derselben Wortfamilie.', 'Complétez avec le nom de la même famille.'),
          'Der Zug fährt um 8 Uhr ab: Die [[1]] ist um 8 Uhr. Er kommt um 9 Uhr an: Die [[2]] ist um 9 Uhr. Heute fällt der Zug aus: Der Grund für den [[3]] ist eine Störung. Der Zug verspätet sich: Er hat zehn Minuten [[4]].',
          [['Abfahrt'], ['Ankunft'], ['Ausfall'], ['Verspätung']],
          'abfahren → die Abfahrt, ankommen → die Ankunft (forme irrégulière à retenir), ausfallen → der Ausfall, sich verspäten → die Verspätung (-ung, toujours féminin). Les noms prennent une majuscule.'),
        choice('q3', bi('Sie möchten am Schalter höflich nach dem nächsten Zug fragen. Was sagen Sie?', 'Vous voulez demander poliment au guichet le prochain train. Que dites-vous ?'),
          [['Sagen Sie mir sofort, wann der nächste Zug fährt!'], ['Könnten Sie mir sagen, wann der nächste Zug fährt?', true],
            ['Können Sie mir sagen, wann fährt der nächste Zug?']],
          'La question indirecte au Konjunktiv II (« Könnten Sie mir sagen, wann … fährt? ») est la formule polie standard ; le verbe « fährt » va à la fin. L’impératif avec « sofort » sonne comme un ordre ; la troisième phrase garde l’ordre de la question directe après wann, ce qui est faux.'),
        choice('q4', bi('Sie möchten eine Alternative vorschlagen. Welche Formulierung passt?', 'Vous voulez proposer une alternative. Quelle formulation convient ?'),
          [['Ich bin dagegen, dass wir heute den Bus nehmen.'], ['Wir hätten gestern lieber den Bus nehmen sollen.'], ['Wie wäre es, wenn wir stattdessen den Bus nehmen?', true]],
          '« Wie wäre es, wenn … ? » (et si … ?) est la formule pour proposer ; « stattdessen » signifie « à la place ». La première phrase refuse le bus, la deuxième exprime un regret sur le passé : aucune ne propose quelque chose.'),
        choice('q5', bi('Sie sehen einen Nachteil, entscheiden sich aber trotzdem für den Bus. Welcher Satz passt?', 'Vous voyez un inconvénient mais choisissez quand même le bus. Quelle phrase convient ?'),
          [['Der Bus braucht zwar länger, aber er hält direkt vor der Halle.', true], ['Der Bus braucht länger, deshalb hält er vor der Halle.'],
            ['Weil der Bus länger braucht, nehmen wir ihn.']],
          '« zwar …, aber … » (certes …, mais …) admet l’inconvénient puis donne l’argument décisif. Deshalb et weil expriment une cause, ce qui rend les deux autres phrases illogiques : on ne prend pas le bus parce qu’il est plus lent.'),
        fill('q6', bi('Ergänzen Sie die Präposition.', 'Complétez avec la préposition.'),
          'Wir warten schon lange [[1]] den Zug. In Neudorf steigen wir [[2]] den Regionalexpress um. Der Bus hält direkt [[3]] Marktplatz.',
          [['auf'], ['in'], ['am', 'an dem']],
          'warten auf + accusatif (attendre quelque chose) ; umsteigen in + accusatif (monter dans un autre train, mouvement) ; halten an + datif (lieu où l’on s’arrête) : an dem → am.'),
        match('q7', bi('Was bedeutet das? Ordnen Sie die Erklärungen zu.', 'Que signifient ces mots ? Associez les définitions.'),
          [['der Schienenersatzverkehr', 'Busse fahren statt der Züge.'], ['die Durchsage', 'eine Information über den Lautsprecher'],
            ['der Umweg', 'ein längerer Weg als normal'], ['pendeln', 'jeden Tag zur Arbeit und zurück fahren']],
          'Définir un mot en allemand simple est une compétence d’examen et de médiation. Schienenersatzverkehr : « Schiene » (le rail) + « Ersatz » (le remplacement) + « Verkehr » (la circulation).'),
      ] },

    // 8 · Répéter à voix haute
    { id: 'b1-unterwegs-redemittel', kind: 'exercise', title: 'Répéter à voix haute : formules du voyage', estimatedMinutes: 9,
      competences: ['expression-orale'],
      lesson: { description: `${C.sprechen}
${bi('Hören Sie zuerst das Modell. Sprechen Sie dann den ganzen Satz flüssig und mit der richtigen Betonung.', 'Écoutez d’abord le modèle. Dites ensuite toute la phrase d’un trait, avec la bonne accentuation.')}
${bi('Diese Sätze helfen Ihnen am Schalter, am Telefon und in der Mission dieses Themas.', 'Ces phrases vous serviront au guichet, au téléphone et dans la mission de ce thème.')}` },
      questions: [
        speak('q1', 'Könnten Sie mir sagen, wo der Ersatzbus abfährt?',
          'Question indirecte polie : « abfährt » en un seul mot à la fin. Accent sur « Ersatz » (ER-satz-bus) et sur la particule « ab » (AB-fährt).'),
        speak('q2', 'Obwohl der Zug schneller ist, nehmen wir lieber den Bus.',
          'Marquez la virgule par une courte pause après « ist », puis enchaînez sur le verbe « nehmen ». Le « ü » de « Zug » n’existe pas : c’est un « u » long.'),
        speak('q3', 'Wegen einer Störung haben wir den Anschluss verpasst.',
          'Störung : « ö » long, lèvres arrondies comme pour « eu » dans « deux ». Anschluss : accent sur « AN ». Verpasst : la syllabe « ver » n’est pas accentuée.'),
        speak('q4', 'Gilt meine Fahrkarte auch im Ersatzbus?',
          'Question fermée : la voix monte à la fin. « Gilt » avec un « i » bref, comme « il » ; « Fahrkarte » : accent sur « FAHR », « h » muet qui allonge le « a ».'),
        speak('q5', 'Wie wäre es, wenn wir stattdessen den nächsten Zug nehmen?',
          'Formule de proposition. « wäre » : « ä » long et ouvert ; « stattdessen » : accent sur « DES ». Le « ch » de « nächsten » se prononce comme dans « ich », pas comme « sch ».'),
        speak('q6', 'Trotz der Verspätung kommen wir noch rechtzeitig zum Konzert.',
          'Trotz : « tz » se prononce « ts ». Rechtzeitig : accent sur « RECHT », « ch » doux. Laissez retomber la voix à la fin : c’est une affirmation.'),
      ] },

    // 9 · Second document : annonces en gare, avec dictées
    { id: 'b1-unterwegs-hoeren2', kind: 'exercise', title: 'Comprendre : annonces en gare', estimatedMinutes: 15,
      competences: ['ecoute'],
      lesson: { description: `${bi('Sie sind am Bahnhof und hören vier Durchsagen. Hören Sie jede Durchsage und beantworten Sie die Frage dazu.', 'Vous êtes à la gare et entendez quatre annonces. Écoutez chaque annonce et répondez à la question correspondante.')}

STRATEGIE
[fr] Stratégie
${bi('Lesen Sie zuerst die Frage: Was müssen Sie wissen – ein Gleis, eine Uhrzeit, eine Zahl?', 'Lisez d’abord la question : que devez-vous savoir – une voie, une heure, un nombre ?')}
${bi('Achten Sie auf Signalwörter wie Achtung, wegen, statt, heute, leider.', 'Repérez les mots-signaux comme Achtung, wegen, statt, heute, leider.')}

${bi('Die letzten zwei Aufgaben sind Diktate: Schreiben Sie genau, was Sie hören.', 'Les deux dernières questions sont des dictées : écrivez exactement ce que vous entendez.')}` },
      placements: [
        { media: 'b1-unterwegs-hoeren2-d1', questionId: 'q1', transcriptVisibility: 'after_answer' },
        { media: 'b1-unterwegs-hoeren2-d2', questionId: 'q2', transcriptVisibility: 'after_answer' },
        { media: 'b1-unterwegs-hoeren2-d3', questionId: 'q3', transcriptVisibility: 'after_answer' },
        { media: 'b1-unterwegs-hoeren2-d4', questionId: 'q4', transcriptVisibility: 'after_answer' },
      ],
      questions: [
        choice('q1', bi('Durchsage 1: Was ändert sich heute für den Zug nach Talheim?', 'Annonce 1 : qu’est-ce qui change aujourd’hui pour le train de Talheim ?'),
          [['die Abfahrtszeit'], ['das Gleis', true], ['das Ziel']],
          '« Dieser Zug fährt heute ausnahmsweise von Gleis sieben ab » : il part de la voie 7 au lieu de la voie 4 (der Gleiswechsel). L’heure (10 h 12) et la destination (Talheim) restent les mêmes.'),
        choice('q2', bi('Durchsage 2: Wie viel Verspätung hat die Regionalbahn nach Neudorf?', 'Annonce 2 : quel est le retard du train régional pour Neudorf ?'),
          [['etwa 15 Minuten'], ['etwa 35 Minuten'], ['etwa 25 Minuten', true]],
          'On entend « etwa fünfundzwanzig Minuten Verspätung ». En allemand, l’unité se dit avant la dizaine : fünf-und-zwanzig = 25. La cause est « eine Reparatur am Zug ».'),
        choice('q3', bi('Durchsage 3: Was sollen die Fahrgäste nach Wiesenbach tun?', 'Annonce 3 : que doivent faire les voyageurs pour Wiesenbach ?'),
          [['den Bus vor dem Ausgang Nord nehmen', true], ['am Gleis auf den nächsten Zug warten'], ['eine neue Fahrkarte kaufen']],
          '« Statt des Zuges fährt ein Bus. Er fährt am Busbahnhof vor dem Ausgang Nord ab. » Le train de 10 h 30 est supprimé : attendre sur le quai ne sert à rien. L’annonce ne parle pas de billet.'),
        choice('q4', bi('Durchsage 4: Was ist heute anders?', 'Annonce 4 : qu’est-ce qui est différent aujourd’hui ?'),
          [['Der Regionalexpress nach Hamburg fällt aus.'], ['Der Regionalexpress nach Hamburg fährt von einem anderen Gleis.'],
            ['Der Regionalexpress nach Hamburg hält auch in Neudorf.', true]],
          '« hält heute zusätzlich in Neudorf » : il fait un arrêt supplémentaire (zusätzlich = en plus). La voie 3 est la voie habituelle, et le train n’est pas supprimé.'),
        dictation('q5', ['Wegen einer Störung hat der Zug nach Neudorf etwa zwanzig Minuten Verspätung.',
          'Wegen einer Störung hat der Zug nach Neudorf etwa 20 Minuten Verspätung.'],
          'Wegen + génitif : « einer Störung » (féminin). Störung et Verspätung prennent une majuscule et s’écrivent avec ö et ä. Le nombre peut s’écrire en lettres ou en chiffres.', 'sprecher'),
        dictation('q6', 'Obwohl der Zug ausfällt, können Sie mit Ihrer Fahrkarte den Ersatzbus nehmen.',
          'Virgule après la subordonnée, verbe « ausfällt » en un mot à la fin, puis « können Sie » inversé. « Ihrer » prend une majuscule : c’est le vouvoiement (Sie).', 'frau'),
      ] },

    // 10 · Vérifier
    { id: 'b1-unterwegs-kontrolle', kind: 'exercise', title: 'Vérifier : en route malgré les imprévus', estimatedMinutes: 14,
      competences: ['lecture', 'ecoute'],
      lesson: { description: `${bi('Hier wiederholen Sie das ganze Modul: Grammatik, Wörter und Hören.', 'Ici, vous révisez tout le module : grammaire, vocabulaire et écoute.')}
${bi('Für die Fragen 4 und 5 hören Sie eine Sprachnachricht von Lena, der Freundin von Mila und Paul.', 'Pour les questions 4 et 5, écoutez un message vocal de Lena, l’amie de Mila et Paul.')}` },
      placements: [{ media: 'b1-unterwegs-kontrolle-nachricht', transcriptVisibility: 'after_answer' }],
      questions: [
        fill('q1', bi('Ergänzen Sie wegen, trotzdem oder obwohl.', 'Complétez avec wegen, trotzdem ou obwohl.'),
          '[[1]] des Gewitters fiel der Zug aus. [[2]] kamen wir pünktlich an, [[3]] wir einen Umweg fahren mussten.',
          [['Wegen', 'Aufgrund'], ['Trotzdem', 'Dennoch'], ['obwohl', 'auch wenn']],
          'Devant un nom au génitif (des Gewitters) : la préposition wegen. Devant un verbe en 2e position (kamen wir) : l’adverbe trotzdem. Devant une subordonnée au verbe final (fahren mussten) : la conjonction obwohl, en minuscule après la virgule.'),
        order('q2', bi('Bilden Sie einen Satz.', 'Remettez les mots dans l’ordre.'),
          [['Ich', 'nehme', 'den Bus,', 'obwohl', 'er', 'länger', 'braucht.']],
          '« Ich nehme den Bus, obwohl er länger braucht. » La principale d’abord (verbe en 2e position), puis la subordonnée avec obwohl et le verbe « braucht » à la fin.'),
        choice('q3', bi('Wählen Sie die richtige Form: „Statt … nehme ich heute das Rad.“', 'Choisissez la bonne forme.'),
          [['dem Auto'], ['des Autos', true], ['das Auto']],
          'Statt est suivi du génitif : das Auto (neutre) devient des Autos. « statt dem Auto » s’entend parfois à l’oral, mais la forme correcte à l’écrit est le génitif.'),
        choice('q4', bi('Hören Sie die Nachricht: Wo wartet Lena?', 'Écoutez le message : où Lena attend-elle ?'),
          [['am Marktplatz, wie geplant'], ['am Bahnhof, Ausgang West'], ['am Eingang der Konzerthalle', true]],
          '« Ich warte nicht am Marktplatz, sondern direkt am Eingang der Konzerthalle. » Avec « nicht …, sondern … », l’information juste vient après sondern. Le Marktplatz est cité, mais pour être exclu.'),
        choice('q5', bi('Warum wartet Lena nicht am Marktplatz?', 'Pourquoi Lena n’attend-elle pas sur la place du marché ?'),
          [['Dort ist es wegen des Regens zu voll.', true], ['Der Bus hält heute nicht am Marktplatz.'], ['Sie hat die Karten noch nicht.']],
          '« Am Marktplatz ist wegen des Regens alles voll » : à cause de la pluie, tout le monde s’y abrite. Lena a déjà les billets (« Eure Karten habe ich schon »), et le bus s’arrête bien au Marktplatz.'),
        choice('q6', bi('Ihr Zug fällt aus. Sie schreiben Ihrer Gruppe. Welcher Satz passt am besten?', 'Votre train est supprimé. Vous écrivez à votre groupe. Quelle phrase convient le mieux ?'),
          [['Unser Zug fällt aus. Trotzdem nehmen wir den Zug.'], ['Leider fällt unser Zug aus, obwohl wir den Bus nehmen.'],
            ['Leider fällt unser Zug aus. Wir nehmen stattdessen den Bus um 15.30 Uhr.', true]],
          'Le bon message dit le problème puis la solution, avec une heure précise. Les deux autres sont illogiques : on ne peut pas prendre un train supprimé, et prendre le bus n’est pas un obstacle à la suppression du train.'),
        match('q7', bi('Welcher Satz passt zu welcher Situation? Ordnen Sie zu.', 'Quelle phrase convient à quelle situation ? Associez.'),
          [['Sie wissen nicht, wo der Bus abfährt.', 'Könnten Sie mir sagen, wo der Bus abfährt?'],
            ['Ihr Zug kam mit 70 Minuten Verspätung an.', 'Ich möchte einen Antrag auf Erstattung stellen.'],
            ['Sie haben in Neudorf den Anschluss verpasst.', 'Wann fährt die nächste Verbindung nach Rosenau?'],
            ['Der Bus ist langsamer, aber praktischer.', 'Obwohl der Bus länger braucht, nehme ich ihn.']],
          'À chaque situation sa formule : demander une information (question indirecte polie), faire valoir ses droits après plus d’une heure de retard (einen Antrag stellen), chercher une solution après une correspondance ratée, justifier un choix avec obwohl.'),
      ] },
  ],
};
