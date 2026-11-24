// Module B2 n° 9 · thème « Wohnen » (lot R6). Ville et campagne, loyers, gentrification : un reportage argumentatif sur la
// transformation d'un quartier (points de vue opposés), une émission de radio « Stadt oder Land ? » (prise de notes
// longue). Grammaire : prépositions au génitif (aufgrund, infolge, angesichts, innerhalb, außerhalb ; von + datif sans
// article) et locutions verbo-nominales (eine Entscheidung treffen, in Anspruch nehmen, zur Verfügung stehen/stellen,
// Kritik üben, in Kraft treten). Thème impair : l'écoute authentique `b2-wohnen-hoeren2` (15 min) est fournie par le lot
// M2 dans _media.mjs, insérée après -wortschatz ; les activités de ce fichier totalisent 113 min (128 min avec elle).
// Consignes, règles et explications en allemand avec aide française repliée ([fr?]) ; lexique traduit en français.
import { C2, aide, choice, fill, order, match } from '../../lib.mjs';

/** « Richtig / falsch / steht nicht im Text » : r, f ou n pour la bonne réponse. */
const rf = (id, statement, answer, explanation) => choice(id, `„${statement}“ ${C2.richtigFalsch}`,
  [['richtig', answer === 'r'], ['falsch', answer === 'f'], ['steht nicht im Text', answer === 'n']], explanation);
/** Indices affichés sous les trous d'un fill (forme de base à transformer). */
const hints = (question, ...values) => ({ ...question,
  blanks: question.blanks.map((blank, index) => (values[index] ? { ...blank, hint: values[index] } : blank)) });

export default {
  id: 'b2-wohnen',
  title: 'Wohnen: Stadt, Land und steigende Mieten',
  objective: 'Comprendre un reportage argumentatif sur la gentrification d’un quartier et un débat radiophonique « ville ou campagne ? », distinguer les points de vue, employer les prépositions au génitif (aufgrund, infolge, angesichts, innerhalb, außerhalb) et les locutions verbo-nominales (eine Entscheidung treffen, in Anspruch nehmen, zur Verfügung stellen) d’un registre soutenu.',
  grammarFocus: ['genitivpraepositionen', 'nomen-verb-verbindungen'],
  sources: [
    'Textes, dialogues et exercices originaux LinguaCap. Le quartier, la commune, les personnes et l’émission sont fictifs ; les mécanismes décrits (gentrification, encadrement des loyers, zones de protection) sont présentés de façon simplifiée.',
  ],

  vocabulary: [
    { word: 'Gentrifizierung', article: 'die', plural: null, partOfSpeech: 'noun', translation: 'la gentrification',
      example: 'Die Gentrifizierung verändert viele alte Arbeiterviertel.', note: 'sans pluriel' },
    { word: 'Viertel', article: 'das', plural: 'Viertel', partOfSpeech: 'noun', translation: 'le quartier',
      example: 'Das Viertel ist in den letzten Jahren sehr beliebt geworden.', note: 'aussi : das Stadtviertel' },
    { word: 'verdrängen', partOfSpeech: 'verb', translation: 'évincer, chasser (d’un lieu)',
      example: 'Hohe Mieten verdrängen viele langjährige Bewohner.', note: 'die Verdrängung' },
    { word: 'sanieren', partOfSpeech: 'verb', translation: 'rénover, réhabiliter (un bâtiment)',
      example: 'Der neue Eigentümer hat das ganze Haus saniert.', note: 'die Sanierung' },
    { word: 'Altbau', article: 'der', plural: 'Altbauten', partOfSpeech: 'noun', translation: 'l’immeuble ancien',
      example: 'Sie wohnt in einem Altbau mit hohen Decken.', note: 'contraire : der Neubau' },
    { word: 'Eigentumswohnung', article: 'die', plural: 'Eigentumswohnungen', partOfSpeech: 'noun', translation: 'l’appartement dont on est propriétaire',
      example: 'Viele Mietwohnungen wurden in Eigentumswohnungen umgewandelt.', note: 'die Mietwohnung : l’appartement loué' },
    { word: 'Kaltmiete', article: 'die', plural: 'Kaltmieten', partOfSpeech: 'noun', translation: 'le loyer hors charges',
      example: 'Die Kaltmiete beträgt 780 Euro im Monat.', note: 'die Warmmiete : charges et chauffage compris' },
    { word: 'Mietspiegel', article: 'der', plural: 'Mietspiegel', partOfSpeech: 'noun', translation: 'le barème local des loyers de référence',
      example: 'Laut Mietspiegel ist die Miete für diese Wohnung zu hoch.', note: null },
    { word: 'Leerstand', article: 'der', plural: null, partOfSpeech: 'noun', translation: 'les locaux ou logements vacants',
      example: 'In der Dorfmitte gab es früher viel Leerstand.', note: 'leer stehen : être inoccupé' },
    { word: 'Wohnungsnot', article: 'die', plural: null, partOfSpeech: 'noun', translation: 'la pénurie de logements',
      example: 'Angesichts der Wohnungsnot baut die Stadt neue Wohnungen.', note: 'sans pluriel' },
    { word: 'Zuzug', article: 'der', plural: null, partOfSpeech: 'noun', translation: 'l’arrivée de nouveaux habitants',
      example: 'Der Zuzug junger Familien belebt das Dorf.', note: 'zuziehen : venir s’installer' },
    { word: 'pendeln', partOfSpeech: 'verb', translation: 'faire la navette (domicile-travail)',
      example: 'Sie pendelt jeden Tag eine Stunde in die Stadt.', note: 'der Pendler, die Pendlerin' },
    { word: 'Anbindung', article: 'die', plural: 'Anbindungen', partOfSpeech: 'noun', translation: 'la desserte (transports)',
      example: 'Das Dorf hat eine schlechte Anbindung an die Bahn.', note: 'gut angebunden sein : être bien desservi' },
    { word: 'bezahlbar', partOfSpeech: 'adjective', translation: 'abordable',
      example: 'Bezahlbare Wohnungen sind in der Innenstadt selten.', note: null },
    { word: 'angesagt', partOfSpeech: 'adjective', translation: 'à la mode, branché',
      example: 'Das alte Hafenviertel ist plötzlich angesagt.', note: 'familier' },
    { word: 'aufgrund', partOfSpeech: 'preposition', translation: 'en raison de, à cause de',
      example: 'Aufgrund der hohen Mieten ziehen viele weg.', note: '+ génitif ; sans article : aufgrund von + datif' },
    { word: 'infolge', partOfSpeech: 'preposition', translation: 'par suite de, à la suite de',
      example: 'Infolge der Sanierung ist die Miete gestiegen.', note: '+ génitif' },
    { word: 'angesichts', partOfSpeech: 'preposition', translation: 'face à, vu, compte tenu de',
      example: 'Angesichts der Wohnungsnot muss die Stadt handeln.', note: '+ génitif' },
    { word: 'innerhalb', partOfSpeech: 'preposition', translation: 'à l’intérieur de ; en l’espace de',
      example: 'Innerhalb eines Jahres sind drei Läden geschlossen worden.', note: '+ génitif ; sans article : innerhalb von + datif' },
    { word: 'außerhalb', partOfSpeech: 'preposition', translation: 'en dehors de, à l’extérieur de',
      example: 'Außerhalb der Stadt sind die Mieten niedriger.', note: '+ génitif' },
    { word: 'eine Entscheidung treffen', partOfSpeech: 'expression', translation: 'prendre une décision',
      example: 'Die Gemeinde hat eine klare Entscheidung getroffen.', note: 'traf, hat getroffen' },
    { word: 'in Anspruch nehmen', partOfSpeech: 'expression', translation: 'avoir recours à, utiliser (un service)',
      example: 'Den Coworking-Raum können alle Bürger in Anspruch nehmen.', note: null },
    { word: 'zur Verfügung stehen', partOfSpeech: 'expression', translation: 'être à disposition',
      example: 'Der Raum steht allen Bewohnern zur Verfügung.', note: 'zur Verfügung stellen : mettre à disposition' },
    { word: 'Kritik üben an', partOfSpeech: 'expression', translation: 'critiquer, formuler des critiques contre',
      example: 'Die Mieter üben scharfe Kritik an den Plänen.', note: '+ datif ; registre soutenu' },
    { word: 'in Kraft treten', partOfSpeech: 'expression', translation: 'entrer en vigueur',
      example: 'Die neue Regel tritt am 1. Januar in Kraft.', note: 'trat, ist getreten' },
  ],

  media: [
    { key: 'b2-wohnen-lesen-artikel', kind: 'image', title: 'Reportage : « Wem gehört das Viertel? »',
      alt: 'Page de journal intitulée « Wem gehört das Viertel? » : un ancien quartier ouvrier devenu à la mode, où les loyers ont fortement augmenté.',
      image: { layout: 'article', kicker: 'Stadtleben', title: 'Wem gehört das Viertel?', icon: 'building',
        lead: 'Wenn ein altes Arbeiterviertel plötzlich angesagt ist, freuen sich nicht alle',
        paragraphs: ['Vor zehn Jahren wollte kaum jemand ins Färberviertel ziehen. Die Altbauten bröckelten, im Erdgeschoss standen viele Läden leer, und abends war es auf den Straßen still.'] } },
    { key: 'b2-wohnen-hoeren-audio', kind: 'audio', title: 'Émission de radio : ville ou campagne ?',
      script: [
        { voice: 'mann3', name: 'Paul Rehberg', text: 'Guten Abend und willkommen beim „Stadtgespräch“. Heute geht es um eine Frage, die sich viele stellen: Stadt oder Land? Aufgrund der hohen Mieten ziehen immer mehr Familien aus den Großstädten weg. Bei mir im Studio sind Gesa Ruhnke, Bürgermeisterin der Gemeinde Oberwiesach, und die Architektin Lena Wiechert.' },
        { voice: 'mann3', name: 'Paul Rehberg', text: 'Frau Wiechert ist vor zwei Jahren mit ihrer Familie aufs Land gezogen. Frau Ruhnke, spüren Sie diesen Trend?' },
        { voice: 'frau2', name: 'Gesa Ruhnke', text: 'Ja, sehr deutlich. Oberwiesach hat etwa zweitausendvierhundert Einwohner. Innerhalb der letzten fünf Jahre sind fast sechzig Familien zu uns gezogen, viele davon aus der Stadt. Vor zehn Jahren hatten wir noch das umgekehrte Problem: Die Jungen sind weggezogen, und in der Dorfmitte standen Häuser leer.' },
        { voice: 'mann3', name: 'Paul Rehberg', text: 'Was hat sich geändert?' },
        { voice: 'frau2', name: 'Gesa Ruhnke', text: 'Zum einen die Arbeitswelt. Infolge der Pandemie arbeiten viele Menschen zwei oder drei Tage pro Woche von zu Hause. Dann ist eine Stunde Fahrt in die Stadt kein tägliches Problem mehr.' },
        { voice: 'frau2', name: 'Gesa Ruhnke', text: 'Zum anderen haben wir als Gemeinde eine klare Entscheidung getroffen: Wir investieren in die Zukunft. Seit letztem Jahr hat jedes Haus einen Glasfaseranschluss, und in unserer alten Schule gibt es jetzt einen Coworking-Raum. Den können alle Bürgerinnen und Bürger für fünf Euro am Tag in Anspruch nehmen.' },
        { voice: 'mann3', name: 'Paul Rehberg', text: 'Frau Wiechert, Sie sind mit Ihrer Familie nach Oberwiesach gezogen. Warum?' },
        { voice: 'frau3', name: 'Lena Wiechert', text: 'Ganz ehrlich: wegen des Platzes. In der Stadt hatten wir drei Zimmer für vier Personen, und für eine größere Wohnung hätten wir fast das Doppelte zahlen müssen. Jetzt haben wir ein altes Bauernhaus mit Garten, für weniger Geld. Die Kinder spielen draußen, die Nachbarn kennen uns. Das ist schon eine ganz andere Lebensqualität.' },
        { voice: 'mann3', name: 'Paul Rehberg', text: 'Das klingt fast zu schön. Gibt es auch Nachteile?' },
        { voice: 'frau3', name: 'Lena Wiechert', text: 'Natürlich. Ich fahre an zwei Tagen pro Woche ins Büro, und dann bin ich eine Stunde und zehn Minuten unterwegs, pro Strecke. Ohne Auto geht hier praktisch nichts. Nach neunzehn Uhr fährt kein Bus mehr, sodass ich meine Kinder zum Training und zu Freunden fahren muss. Manchmal fühle ich mich wie ein Taxiunternehmen.' },
        { voice: 'mann3', name: 'Paul Rehberg', text: 'Und wie hat das Dorf Sie aufgenommen?' },
        { voice: 'frau3', name: 'Lena Wiechert', text: 'Erstaunlich gut. Am Anfang waren manche skeptisch, weil viele Neue nur zum Schlafen ins Dorf kommen. Aber wir sind in den Sportverein eingetreten, und ich helfe jedes Jahr beim Dorffest. Wer sich engagiert, gehört schnell dazu.' },
        { voice: 'mann3', name: 'Paul Rehberg', text: 'Frau Ruhnke, zurück zum Verkehr. Das ist ein typischer Kritikpunkt. Was sagen Sie dazu?' },
        { voice: 'frau2', name: 'Gesa Ruhnke', text: 'Frau Wiechert hat völlig recht, der Verkehr ist unsere größte Baustelle. Wir haben einen Bürgerbus eingeführt, der von Ehrenamtlichen gefahren wird. Er fährt dreimal täglich in die Kreisstadt. Aber ich gebe zu: Das ersetzt keinen richtigen Nahverkehr. Dafür brauchen wir die Unterstützung des Landes.' },
        { voice: 'mann3', name: 'Paul Rehberg', text: 'Und wie sieht es mit Ärzten aus? Angesichts des Ärztemangels auf dem Land hört man oft, dass ältere Menschen wieder in die Stadt ziehen.' },
        { voice: 'frau2', name: 'Gesa Ruhnke', text: 'Das ist leider so. Unser Hausarzt hört nächstes Jahr auf, und bisher gibt es keine Nachfolge. Wir bieten einer jungen Ärztin oder einem jungen Arzt die Praxisräume kostenlos an. Außerdem stellt die Gemeinde jungen Familien günstige Bauplätze zur Verfügung, damit das Dorf nicht nur aus Rentnern besteht.' },
        { voice: 'mann3', name: 'Paul Rehberg', text: 'Frau Wiechert, würden Sie die Entscheidung noch einmal so treffen?' },
        { voice: 'frau3', name: 'Lena Wiechert', text: 'Ja, für diese Lebensphase auf jeden Fall. Ob wir hier bleiben, wenn die Kinder aus dem Haus sind, weiß ich nicht. Ich glaube, die Frage ist nicht: Stadt oder Land? Sondern: Was brauche ich gerade in meinem Leben?' },
        { voice: 'mann3', name: 'Paul Rehberg', text: 'Ein schönes Schlusswort. Vielen Dank Ihnen beiden.' },
      ] },
    { key: 'b2-wohnen-kontrolle-aushang', kind: 'image', title: 'Avis de la régie : ascenseur hors service',
      alt: 'Avis de la régie : en raison de travaux de rénovation, l’ascenseur ne sera pas disponible pendant les deux prochaines semaines ; aide possible pour les courses.',
      image: { layout: 'document', variant: 'sign', icon: 'triangle-alert', title: 'Mitteilung der Hausverwaltung',
        lines: ['Aufgrund von Sanierungsarbeiten steht der Aufzug innerhalb der nächsten zwei Wochen nicht zur Verfügung.',
          'Bewohnerinnen und Bewohner, die Hilfe beim Tragen ihrer Einkäufe in Anspruch nehmen möchten, melden sich bitte beim Hausmeister.',
          'Wir bitten um Ihr Verständnis.'] } },
  ],

  activities: [
    // 1 · Einstieg
    { id: 'b2-wohnen-einstieg', kind: 'lesson', title: 'Einstieg: Wo und wie wollen wir wohnen?', estimatedMinutes: 10,
      competences: ['lecture', 'expression-orale'],
      lesson: { description: `WOHNEN – EIN GRUNDBEDÜRFNIS WIRD ZUR STREITFRAGE
[fr?] Le logement, un besoin fondamental devenu un sujet de débat
${aide('In vielen Städten steigen die Mieten schneller als die Löhne. Beliebte Viertel verändern sich, und manche Familien ziehen aufs Land. In diesem Modul geht es um die Frage, wer wo wohnen kann – und um eine Sprache, mit der man in Briefen und Diskussionen sachlich und präzise argumentiert.', 'Dans beaucoup de villes, les loyers augmentent plus vite que les salaires. Des quartiers prisés se transforment, des familles partent à la campagne. Ce module traite de la question : qui peut habiter où ? Il travaille aussi une langue précise et soutenue pour les lettres et les débats.')}

FRAGEN ZUM EINSTIEG
[fr?] Questions pour commencer
• ${aide('Wohnen Sie lieber in der Stadt oder auf dem Land? Warum?', 'Préférez-vous vivre en ville ou à la campagne ? Pourquoi ?')}
• ${aide('Hat sich Ihr Viertel in den letzten Jahren verändert? Wie?', 'Votre quartier a-t-il changé ces dernières années ? Comment ?')}
• ${aide('Sollte der Staat in den Wohnungsmarkt eingreifen, zum Beispiel mit Mietobergrenzen?', 'L’État devrait-il intervenir sur le marché du logement, par exemple en plafonnant les loyers ?')}
${aide('Überlegen Sie sich zu jeder Frage zwei oder drei Sätze und mindestens ein Argument.', 'Préparez mentalement deux ou trois phrases et au moins un argument pour chaque question.')}

ZIELE
[fr?] Objectifs
• ${aide('Ich kann eine Reportage mit verschiedenen Standpunkten verstehen und die Positionen unterscheiden.', 'Je peux comprendre un reportage présentant plusieurs points de vue et distinguer les positions.')}
• ${aide('Ich kann einer Radiodiskussion über Stadt und Land Argumente und Zahlen entnehmen.', 'Je peux tirer d’un débat radiophonique sur la ville et la campagne des arguments et des chiffres.')}
• ${aide('Ich kann Gründe und Umstände mit Präpositionen im Genitiv ausdrücken: aufgrund, infolge, angesichts, innerhalb.', 'Je peux exprimer causes et circonstances avec des prépositions au génitif.')}
• ${aide('Ich kann Nomen-Verb-Verbindungen verstehen und in formellen Texten verwenden.', 'Je peux comprendre et employer des locutions verbo-nominales dans des textes formels.')}

WICHTIGE WÖRTER
[fr?] Mots-clés
• die Gentrifizierung — la gentrification
• verdrängen — évincer, chasser
• sanieren — rénover
• die Kaltmiete — le loyer hors charges
• der Leerstand — les logements vacants
• die Wohnungsnot — la pénurie de logements
• pendeln — faire la navette
• die Anbindung — la desserte` } },

    // 2 · Lecture longue : reportage argumentatif
    { id: 'b2-wohnen-lesen', kind: 'exercise', title: 'Verstehen: eine Reportage über ein Viertel im Wandel', estimatedMinutes: 22,
      competences: ['lecture'],
      lesson: { description: `${C2.lesen}

STRATEGIE
[fr?] Stratégie
1. ${aide('Eine Reportage mischt Fakten, Stimmen von Betroffenen und Bewertungen. Fragen Sie bei jedem Absatz: Wer spricht hier, und welche Position hat diese Person?', 'Un reportage mêle faits, témoignages et jugements. À chaque paragraphe, demandez-vous : qui parle, et quelle est sa position ?')}
2. ${aide('Die Meinung der Autorin oder des Autors steht oft am Ende. Lesen Sie den letzten Absatz besonders genau.', 'L’avis de l’auteur se trouve souvent à la fin : lisez le dernier paragraphe avec attention.')}

WEM GEHÖRT DAS VIERTEL?
Wenn ein altes Arbeiterviertel plötzlich angesagt ist, freuen sich nicht alle

(A) Vor zehn Jahren wollte kaum jemand ins Färberviertel ziehen. Die Altbauten bröckelten, im Erdgeschoss standen viele Läden leer, und abends war es auf den Straßen still. Heute gibt es hier Cafés mit selbst gerösteten Bohnen, eine Kletterhalle in der alten Spinnerei und Wohnungen, für die sich bei jeder Besichtigung dreißig Interessenten anstellen. Auf dem Wochenmarkt hört man inzwischen fast so oft Englisch wie Deutsch. Was nach einer Erfolgsgeschichte klingt, hat eine Kehrseite: Aufgrund der stark gestiegenen Mieten können sich viele langjährige Bewohnerinnen und Bewohner ihr Viertel nicht mehr leisten.

(B) Fachleute nennen diesen Prozess Gentrifizierung, und er verläuft fast überall ähnlich. Zuerst ziehen Studierende und Künstlerinnen in ein günstiges Viertel, weil die Innenstadt für sie zu teuer ist. Ihnen folgen Cafés, Galerien und kleine Läden, die das Viertel bekannt machen. Infolge der neuen Beliebtheit kaufen Investoren Häuser, sanieren sie und vermieten die Wohnungen deutlich teurer oder verkaufen sie als Eigentumswohnungen. Am Ende wohnen dort vor allem Menschen mit hohem Einkommen – und oft nicht einmal mehr die Studierenden, mit denen alles begann. Stadtforscher sprechen deshalb von einem Kreislauf, der sich kaum aufhalten lässt, wenn die Politik nicht eingreift.

(C) Gisela Bormann wohnt seit 1979 im Färberviertel. Im vergangenen Jahr wurde ihr Haus saniert; seitdem zahlt sie fast zweihundert Euro mehr Miete im Monat. „Neue Fenster und ein Aufzug sind ja schön“, sagt die Rentnerin. „Aber ich habe nie um einen Aufzug gebeten.“ Ihre Nachbarn aus dem zweiten Stock sind innerhalb eines Jahres ausgezogen, an den Stadtrand. Auch der kleine Gemüseladen an der Ecke hat geschlossen; an seiner Stelle verkauft heute ein Geschäft Designermöbel. „Ich kenne hier kaum noch jemanden“, sagt Frau Bormann. „Das ist das Schlimmste.“

(D) Nicht alle sehen die Entwicklung so negativ. Deniz Aktaş, der vor drei Jahren ein Café in der Färberstraße eröffnet hat, erinnert daran, wie es früher aussah: „Hier standen ganze Häuser leer. Ohne Investitionen wären viele Gebäude heute Ruinen.“ Auch die Stadtverwaltung verweist auf Fortschritte: Die Zahl der Einbrüche ist gesunken, und die Grundschule im Viertel hat wieder mehr Anmeldungen. Angesichts der Wohnungsnot in der ganzen Stadt hält man es im Rathaus außerdem für richtig, dass in alten Fabrikhallen neue Wohnungen entstehen. Und selbst manche Alteingesessene sehen Vorteile: Seit das Viertel belebter ist, fühlen sie sich abends auf der Straße sicherer.

(E) Die Frage ist also nicht, ob sich ein Viertel verändern darf, sondern für wen es sich verändert. Städte haben dafür durchaus Instrumente: Sie können sogenannte Milieuschutzgebiete ausweisen, in denen aufwendige Modernisierungen genehmigt werden müssen, selbst Wohnungen bauen oder Investoren verpflichten, einen Teil der Wohnungen günstig zu vermieten. Solche Maßnahmen kosten Geld, und Eigentümer üben oft scharfe Kritik an ihnen. Erfahrungen aus anderen Städten zeigen zudem, dass sie die Entwicklung nicht stoppen, sondern höchstens verlangsamen. Doch wer nichts unternimmt, trifft auch eine Entscheidung: die Entscheidung, dass in den beliebten Vierteln bald nur noch wohnt, wer es sich leisten kann.` },
      placements: [{ media: 'b2-wohnen-lesen-artikel', caption: 'Wem gehört das Viertel?' }],
      questions: [
        choice('q1', aide('Welche Position vertritt der Text im letzten Absatz?', 'Quelle position le texte défend-il dans le dernier paragraphe ?'),
          [['Ein Viertel sollte sich möglichst überhaupt nicht verändern.'], ['Investoren sollten grundsätzlich aus den Vierteln verbannt werden.'],
            ['Die Stadt sollte steuern, für wen sich ein Viertel verändert.', true], ['Gegen steigende Mieten kann eine Stadt nichts tun.']],
          aide('„Die Frage ist also nicht, ob sich ein Viertel verändern darf, sondern für wen.“ Danach nennt der Text Instrumente der Städte und kritisiert das Nichtstun. Veränderung an sich lehnt er nicht ab, und Investoren will er nicht verbannen, sondern verpflichten.',
            'Le texte accepte le changement, mais veut que la ville décide pour qui il se fait.')),
        choice('q2', aide('Was meint Frau Bormann mit dem Satz „Aber ich habe nie um einen Aufzug gebeten“?', 'Que veut dire Mme Bormann par cette phrase ?'),
          [['Sie bezahlt für eine Verbesserung, die sie nicht wollte.', true], ['Sie hat Angst, mit dem neuen Aufzug zu fahren.'],
            ['Sie hat den Einbau des Aufzugs selbst beantragt.'], ['Sie findet den neuen Aufzug viel zu klein und zu laut.']],
          aide('Der Satz steht direkt nach der Mieterhöhung von fast zweihundert Euro. Frau Bormann sagt damit indirekt: Die Sanierung war nicht ihr Wunsch, aber sie muss sie mitbezahlen. Über Angst oder die Größe des Aufzugs sagt sie nichts.',
            'Elle paie une amélioration qu’elle n’a pas demandée.')),
        rf('q3', 'Die ersten neuen Bewohner des Viertels waren Investoren mit viel Geld.', 'f',
          aide('Falsch: „Zuerst ziehen Studierende und Künstlerinnen in ein günstiges Viertel.“ Die Investoren kommen erst später, „infolge der neuen Beliebtheit“.',
            'Faux : d’abord les étudiants et les artistes, puis les investisseurs.')),
        rf('q4', 'Frau Bormanns Nachbarn aus dem zweiten Stock wohnen jetzt am Stadtrand.', 'r',
          aide('Richtig: „Ihre Nachbarn aus dem zweiten Stock sind innerhalb eines Jahres ausgezogen, an den Stadtrand.“',
            'Vrai : ils ont déménagé en périphérie.')),
        rf('q5', 'Die Stadt hat im Färberviertel bereits ein Milieuschutzgebiet ausgewiesen.', 'n',
          aide('Steht nicht im Text: Absatz E sagt nur, dass Städte solche Gebiete ausweisen „können“. Ob die Stadt das im Färberviertel getan hat, erfahren wir nicht.',
            'Non mentionné : le texte dit seulement que les villes « peuvent » le faire.')),
        match('q6', aide('Welche Überschrift passt zu welchem Absatz? Ordnen Sie zu.', 'Quel intertitre convient à quel paragraphe ? Associez.'),
          [['Absatz A', 'Vom Problemviertel zum Szeneviertel'], ['Absatz B', 'Wie Gentrifizierung abläuft'], ['Absatz C', 'Eine Bewohnerin erzählt'],
            ['Absatz D', 'Die andere Seite'], ['Absatz E', 'Was Städte tun können']],
          aide('A beschreibt den Wandel des Viertels; B erklärt den typischen Ablauf; C lässt eine Betroffene zu Wort kommen; D bringt Gegenstimmen (Café-Besitzer, Stadtverwaltung); E nennt Instrumente der Städte und zieht ein Fazit.',
            'A : la transformation ; B : le processus ; C : un témoignage ; D : l’autre point de vue ; E : les outils des villes.')),
        choice('q7', aide('Warum kommt im Text auch Deniz Aktaş zu Wort?', 'Pourquoi le texte donne-t-il aussi la parole à Deniz Aktaş ?'),
          [['Um zu zeigen, dass Cafés die Mieten erhöhen.'], ['Um seine Preise und sein Angebot zu bewerben.'],
            ['Um eine Gegenposition zu Frau Bormann zu zeigen.', true], ['Um zu beweisen, dass alle Bewohner zufrieden sind.']],
          aide('Absatz D beginnt mit „Nicht alle sehen die Entwicklung so negativ“: Eine gute Reportage zeigt mehrere Seiten. Herr Aktaş erinnert an den früheren Leerstand. Dass alle zufrieden sind, behauptet der Text gerade nicht.',
            'Un bon reportage montre plusieurs points de vue.')),
        fill('q8', aide('Ergänzen Sie die Präpositionen aus dem Text.', 'Complétez avec les prépositions du texte.'),
          '[[1]] der stark gestiegenen Mieten können sich viele ihr Viertel nicht mehr leisten. · [[2]] der neuen Beliebtheit kaufen Investoren Häuser. · [[3]] der Wohnungsnot hält man neue Wohnungen in alten Fabrikhallen für richtig.',
          [['Aufgrund'], ['Infolge'], ['Angesichts']],
          aide('Alle drei Präpositionen verlangen den Genitiv (der Mieten, der Beliebtheit, der Wohnungsnot). „Aufgrund“ nennt einen Grund, „infolge“ die Ursache einer Folge, „angesichts“ einen Umstand, den man berücksichtigt.',
            'aufgrund = en raison de ; infolge = à la suite de ; angesichts = face à.')),
      ] },

    // 3 · Écoute longue : débat radiophonique
    { id: 'b2-wohnen-hoeren', kind: 'exercise', title: 'Verstehen: eine Radiodiskussion über Stadt und Land', estimatedMinutes: 20,
      competences: ['ecoute'],
      lesson: { description: `${C2.hoeren}

SITUATION
[fr?] La situation
${aide('In der Sendung „Stadtgespräch“ diskutiert der Moderator Paul Rehberg mit Gesa Ruhnke, Bürgermeisterin der Gemeinde Oberwiesach, und mit Lena Wiechert, die mit ihrer Familie aus der Stadt aufs Land gezogen ist. Das Gespräch dauert etwa dreieinhalb Minuten.', 'Dans l’émission « Stadtgespräch », l’animateur Paul Rehberg débat avec Gesa Ruhnke, maire de la commune d’Oberwiesach, et Lena Wiechert, partie s’installer à la campagne avec sa famille. L’échange dure environ trois minutes et demie.')}

STRATEGIE
[fr?] Stratégie
1. ${aide('Unterscheiden Sie die Rollen: Die Bürgermeisterin wirbt für ihr Dorf, Frau Wiechert berichtet aus Erfahrung, der Moderator fragt kritisch nach.', 'Distinguez les rôles : la maire défend sa commune, Mme Wiechert témoigne, l’animateur pose des questions critiques.')}
2. ${aide('Zahlen kommen schnell: Lesen Sie die Notizen vorher und achten Sie auf Einwohner, Familien, Minuten und Uhrzeiten.', 'Les nombres passent vite : lisez les notes avant l’écoute et guettez habitants, familles, minutes et heures.')}
3. ${aide('Achten Sie auf Zugeständnisse: „Aber ich gebe zu …“, „Natürlich …“. Dort zeigen die Sprecherinnen die Grenzen ihrer Position.', 'Repérez les concessions : c’est là que chacune reconnaît les limites de sa position.')}` },
      placements: [{ media: 'b2-wohnen-hoeren-audio', caption: 'Stadtgespräch: Stadt oder Land?' }],
      questions: [
        fill('q1', C2.notizen,
          'Oberwiesach: etwa [[1]] Einwohner · in den letzten fünf Jahren: fast [[2]] neue Familien · Grund: viele arbeiten an zwei oder drei Tagen von [[3]] · Coworking-Raum in der alten [[4]], [[5]] Euro pro Tag',
          [['2400', '2.400', '2 400', 'zweitausendvierhundert'], ['60', 'sechzig'], ['zu Hause', 'zuhause', 'Zuhause', 'daheim'], ['Schule'], ['5', 'fünf']],
          aide('„Oberwiesach hat etwa zweitausendvierhundert Einwohner. Innerhalb der letzten fünf Jahre sind fast sechzig Familien zu uns gezogen.“ Viele arbeiten „zwei oder drei Tage pro Woche von zu Hause“. Der Coworking-Raum ist „in unserer alten Schule“ und kostet „fünf Euro am Tag“.',
            'Chiffres clés de la commune et télétravail (« von zu Hause »).')),
        choice('q2', aide('Warum ziehen laut Bürgermeisterin heute mehr Familien nach Oberwiesach?', 'Pourquoi, selon la maire, davantage de familles s’installent-elles à Oberwiesach ?'),
          [['Weil es dort inzwischen mehr Arbeitsplätze als in der Stadt gibt.'],
            ['Weil Homeoffice und Investitionen der Gemeinde das Dorf attraktiver machen.', true],
            ['Weil die Bahn seit letztem Jahr jede halbe Stunde in die Stadt fährt.'],
            ['Weil die jungen Leute aus dem Dorf alle wieder zurückgekommen sind.']],
          aide('Sie nennt zwei Gründe: „Zum einen die Arbeitswelt“ (Homeoffice nach der Pandemie) und „zum anderen“ die Investitionen der Gemeinde (Glasfaser, Coworking-Raum). Von neuen Arbeitsplätzen oder einer besseren Bahnverbindung spricht sie nicht, im Gegenteil: Der Verkehr ist die „größte Baustelle“.',
            '« Zum einen … zum anderen … » : deux raisons, le télétravail et les investissements.')),
        choice('q3', aide('Wie bewertet Lena Wiechert ihr Leben auf dem Land insgesamt?', 'Comment Lena Wiechert juge-t-elle sa vie à la campagne dans l’ensemble ?'),
          [['Sie bereut den Umzug und möchte so schnell wie möglich zurück.'], ['Sie findet es dort perfekt und sieht überhaupt keine Nachteile.'],
            ['Sie ist zufrieden, nennt aber auch deutliche Nachteile.', true], ['Sie findet das Leben dort teurer als in der Großstadt.']],
          aide('Sie lobt Platz, Garten und Nachbarschaft („eine ganz andere Lebensqualität“), nennt aber auch lange Fahrzeiten und die Abhängigkeit vom Auto. Auf die Frage, ob sie wieder so entscheiden würde, antwortet sie: „für diese Lebensphase auf jeden Fall“.',
            'Bilan nuancé : satisfaite, mais lucide sur les inconvénients.')),
        fill('q4', C2.notizen,
          'Frau Wiechert: in der Stadt drei Zimmer für [[1]] Personen · Weg ins Büro: eine Stunde und [[2]] Minuten pro Strecke · nach [[3]] Uhr kein Bus mehr · Bürgerbus: [[4]] täglich in die Kreisstadt',
          [['vier', '4'], ['zehn', '10'], ['19', 'neunzehn'], ['dreimal', '3-mal', '3 mal', 'drei Mal']],
          aide('„Drei Zimmer für vier Personen“; „eine Stunde und zehn Minuten unterwegs, pro Strecke“; „Nach neunzehn Uhr fährt kein Bus mehr“; der Bürgerbus „fährt dreimal täglich in die Kreisstadt“.',
            'pro Strecke = par trajet ; die Kreisstadt = le chef-lieu.')),
        choice('q5', aide('Was gibt die Bürgermeisterin zu?', 'Que reconnaît la maire ?'),
          [['Der Coworking-Raum wird kaum genutzt.'], ['Der Bürgerbus ersetzt keinen echten Nahverkehr.', true],
            ['Die Bauplätze sind für Familien zu teuer.'], ['Das Glasfasernetz funktioniert noch nicht.']],
          aide('„Aber ich gebe zu: Das ersetzt keinen richtigen Nahverkehr.“ Mit „ich gebe zu“ macht sie ein Zugeständnis. Die Bauplätze sind laut ihr gerade „günstig“, und über die Nutzung des Coworking-Raums sagt sie nichts.',
            '« ich gebe zu » = je reconnais ; une concession.')),
        choice('q6', aide('Was ist die Kernaussage von Frau Wiechert am Ende des Gesprächs?', 'Quel est le message principal de Mme Wiechert à la fin ?'),
          [['Auf dem Land lebt man grundsätzlich besser als in der Stadt.'], ['Wer Kinder hat, sollte auf keinen Fall in der Stadt wohnen.'],
            ['Die Wohnfrage sollte am besten der Staat für alle entscheiden.'], ['Welche Wohnform passt, hängt von der Lebensphase ab.', true]],
          aide('„Die Frage ist nicht: Stadt oder Land? Sondern: Was brauche ich gerade in meinem Leben?“ Sie verallgemeinert nicht; sie weiß nicht einmal, ob die Familie bleibt, wenn die Kinder aus dem Haus sind.',
            'Pas de vérité générale : tout dépend de la période de la vie.')),
      ] },

    // 4 · Grammaire inductive
    { id: 'b2-wohnen-entdecken', kind: 'exercise', title: 'Entdecken: Genitivpräpositionen und Nomen-Verb-Verbindungen', estimatedMinutes: 10,
      competences: ['lecture'],
      lesson: { description: `${aide('Lesen Sie die Sätze aus der Reportage und aus der Radiodiskussion. Achten Sie auf die markierten Präpositionen und auf die Verbindungen aus Nomen und Verb.', 'Lisez les phrases du reportage et du débat. Observez les prépositions et les associations nom + verbe.')}

SÄTZE
[fr?] Le corpus
(1) Aufgrund der stark gestiegenen Mieten können sich viele ihr Viertel nicht mehr leisten.
(2) Infolge der neuen Beliebtheit kaufen Investoren Häuser.
(3) Ihre Nachbarn sind innerhalb eines Jahres ausgezogen.
(4) Angesichts des Ärztemangels auf dem Land ziehen ältere Menschen wieder in die Stadt.
(5) Wir haben als Gemeinde eine klare Entscheidung getroffen.
(6) Den Coworking-Raum können alle Bürgerinnen und Bürger in Anspruch nehmen.
(7) Die Gemeinde stellt jungen Familien günstige Bauplätze zur Verfügung.
(8) Eigentümer üben oft scharfe Kritik an solchen Maßnahmen.

${aide('Beantworten Sie dann die Fragen. Die Erklärungen formulieren die Regel.', 'Répondez ensuite aux questions : les explications formulent la règle.')}` },
      questions: [
        choice('q1', aide('Sätze 1 bis 4: In welchem Kasus steht das Nomen nach diesen Präpositionen?', 'Phrases 1 à 4 : à quel cas est le nom après ces prépositions ?'),
          [['im Akkusativ'], ['im Dativ'], ['im Nominativ'], ['im Genitiv', true]],
          aide('Der Mieten, der Beliebtheit, eines Jahres, des Ärztemangels: Das sind Genitivformen. Typisch sind die Artikel „des“ und „der“ und die Endung -s oder -es bei maskulinen und neutralen Nomen (des Jahres, des Ärztemangels).',
            'Génitif : des / der, et -s / -es au masculin et au neutre.')),
        match('q2', aide('Was drückt die Präposition aus? Ordnen Sie zu.', 'Qu’exprime la préposition ? Associez.'),
          [['aufgrund', 'den Grund (weil …)'], ['infolge', 'die Ursache, aus der etwas folgt'], ['angesichts', 'einen Umstand, den man berücksichtigt'],
            ['innerhalb', 'einen zeitlichen oder räumlichen Rahmen']],
          aide('„Aufgrund“ entspricht „weil“, „infolge“ betont die Folge eines Ereignisses, „angesichts“ heißt „wenn man … betrachtet“, „innerhalb“ nennt einen Zeitraum (innerhalb eines Jahres) oder einen Raum (innerhalb der Stadt).',
            'cause, conséquence, circonstance prise en compte, cadre temporel ou spatial.')),
        choice('q3', aide('Satz 5: Welches einfache Verb hat ungefähr dieselbe Bedeutung wie „eine Entscheidung treffen“?', 'Phrase 5 : quel verbe simple a à peu près le même sens ?'),
          [['treffen'], ['entscheiden', true], ['erreichen'], ['bedeuten']],
          aide('In einer Nomen-Verb-Verbindung trägt das Nomen die Bedeutung (die Entscheidung → entscheiden). Das Verb „treffen“ hat hier kaum eigene Bedeutung; es heißt nicht „rencontrer“. Solche Verbindungen klingen formeller als das einfache Verb.',
            'Le nom porte le sens ; le verbe « treffen » est presque vide de sens ici.')),
        match('q4', aide('Sätze 6 bis 8: Welches einfache Verb passt? Ordnen Sie zu.', 'Phrases 6 à 8 : quel verbe simple correspond ? Associez.'),
          [['in Anspruch nehmen', 'nutzen'], ['zur Verfügung stellen', 'bereitstellen'], ['Kritik üben an', 'kritisieren'], ['eine Entscheidung treffen', 'entscheiden']],
          aide('Nomen-Verb-Verbindungen sind typisch für Zeitungen, Behörden und formelle Briefe. Sie haben feste Präpositionen und Artikel (zur Verfügung, in Anspruch, an + Dativ) und müssen als Ganzes gelernt werden.',
            'Expressions figées du registre soutenu : à apprendre en bloc.')),
      ] },

    // 5 · Règle
    { id: 'b2-wohnen-regel', kind: 'lesson', title: 'Regel: Genitivpräpositionen und Nomen-Verb-Verbindungen', estimatedMinutes: 10,
      competences: ['lecture'],
      lesson: { description: `REGEL — PRÄPOSITIONEN MIT GENITIV
[fr?] Règle : prépositions suivies du génitif
In formellen Texten stehen viele Präpositionen mit dem Genitiv. Wichtig für B2:
[fr?] Dans les textes formels, beaucoup de prépositions régissent le génitif.
• ${aide('Grund und Folge: aufgrund, infolge, angesichts – Aufgrund der hohen Mieten ziehen viele weg.', 'Cause et conséquence : en raison de, à la suite de, face à.')}
• ${aide('Ort und Zeit: innerhalb, außerhalb – Außerhalb der Stadt sind die Mieten niedriger. Innerhalb eines Jahres ist alles anders.', 'Lieu et temps : à l’intérieur de, en dehors de, en l’espace de.')}
• ${aide('Wiederholung aus B1: wegen, trotz, während, statt – Trotz der Kritik wird gebaut.', 'Rappel B1 : à cause de, malgré, pendant, au lieu de.')}
• ${aide('Weitere häufige Präpositionen: anlässlich (bei Gelegenheit), bezüglich (was … betrifft), mithilfe (mit Hilfe von).', 'Autres : à l’occasion de, concernant, à l’aide de.')}

REGEL — „VON“ + DATIV OHNE ARTIKEL
[fr?] Règle : von + datif sans article
Ohne Artikel oder Adjektiv ist der Genitiv oft nicht erkennbar. Dann steht „von“ + Dativ.
[fr?] Quand le génitif ne se voit pas (pas d’article), on emploie von + datif.
• ${aide('innerhalb von drei Tagen · aufgrund von Bauarbeiten · außerhalb von Großstädten', 'en trois jours ; en raison de travaux ; en dehors des grandes villes')}
• ${aide('Aber: innerhalb der nächsten drei Tage · aufgrund der Bauarbeiten', 'Mais avec article : génitif.')}

REGEL — NOMEN-VERB-VERBINDUNGEN
[fr?] Règle : les locutions verbo-nominales
Ein Nomen trägt die Bedeutung, das Verb (treffen, nehmen, stehen, stellen, üben, treten, bringen) ist fast leer. Die Verbindungen klingen formell und sachlich. Präposition und Artikel sind fest.
[fr?] Le nom porte le sens, le verbe est presque vide. Registre soutenu ; préposition et article figés.
• ${aide('eine Entscheidung treffen = entscheiden · Kritik üben an + Dativ = kritisieren', 'prendre une décision ; critiquer')}
• ${aide('in Anspruch nehmen = nutzen · Rücksicht nehmen auf + Akkusativ = rücksichtsvoll sein', 'avoir recours à ; tenir compte de, ménager')}
• ${aide('zur Verfügung stehen (passiv) ↔ zur Verfügung stellen (aktiv): Der Raum steht allen zur Verfügung. Die Gemeinde stellt den Raum zur Verfügung.', 'être à disposition ↔ mettre à disposition')}
• ${aide('in Kraft treten = gültig werden · zur Diskussion stellen = öffentlich diskutieren lassen', 'entrer en vigueur ; soumettre à la discussion')}

ACHTUNG
[fr?] Attention : pièges des francophones
• ${aide('Nicht wörtlich übersetzen: Man trifft eine Entscheidung, man „macht“ sie nicht. Man stellt eine Frage und übt Kritik.', 'On ne « fait » pas une décision : eine Entscheidung treffen, eine Frage stellen, Kritik üben.')}
• ${aide('Im Hauptsatz steht das Verb an zweiter Stelle, das Nomen bleibt am Ende: Die Regel tritt am 1. Januar in Kraft.', 'Le verbe en 2e position, la partie nominale à la fin (comme une particule).')}
• ${aide('Im gesprochenen Deutsch hört man oft „wegen dem“ statt „wegen des“. In formellen Texten schreiben Sie den Genitiv.', 'À l’oral, « wegen dem » est fréquent ; à l’écrit formel, employez le génitif.')}
• ${aide('Genitiv bei maskulinen und neutralen Nomen: -s oder -es nicht vergessen: des Jahres, des Viertels, des Ärztemangels.', 'Au génitif masculin et neutre, n’oubliez pas -s / -es.')}` } },

    // 6 · Grammaire : s'entraîner
    { id: 'b2-wohnen-grammatik', kind: 'exercise', title: 'Üben: Genitivpräpositionen und Nomen-Verb-Verbindungen', estimatedMinutes: 15,
      competences: ['lecture', 'expression-ecrite'],
      lesson: { description: `${aide('Üben Sie die Präpositionen mit Genitiv und die festen Verbindungen aus Nomen und Verb.', 'Entraînez-vous aux prépositions avec génitif et aux locutions verbo-nominales.')}

MERKE
[fr?] À retenir
• ${aide('aufgrund, infolge, angesichts, innerhalb, außerhalb + Genitiv; ohne Artikel: von + Dativ', 'génitif ; sans article : von + datif')}
• ${aide('Nomen-Verb-Verbindung: Verb an Position 2, Nomen am Satzende', 'verbe en 2e position, partie nominale à la fin')}` },
      questions: [
        fill('q1', aide('Ergänzen Sie den Artikel im Genitiv.', 'Complétez avec l’article au génitif.'),
          'Aufgrund [[1]] hohen Mieten ziehen viele weg. · Innerhalb [[2]] nächsten Jahres entstehen hundert neue Wohnungen. · Außerhalb [[3]] Stadtzentrums gibt es noch bezahlbare Wohnungen. · Angesichts [[4]] Wohnungsnot muss die Stadt handeln.',
          [['der'], ['des'], ['des', 'eines'], ['der', 'einer']],
          aide('Genitiv Plural und feminin: der (der Mieten, der Wohnungsnot). Genitiv maskulin und neutral: des, und das Nomen bekommt -s oder -es (des Jahres, des Stadtzentrums).',
            'Pluriel et féminin : der ; masculin et neutre : des + -s / -es.')),
        choice('q2', aide('Welche Präposition passt? „___ eines Jahres sind drei Familien ausgezogen.“', 'Quelle préposition convient ?'),
          [['Aufgrund'], ['Angesichts'], ['Innerhalb', true], ['Außerhalb']],
          aide('Gesucht ist ein Zeitraum: innerhalb eines Jahres. „Aufgrund eines Jahres“ und „angesichts eines Jahres“ ergeben keinen Sinn, „außerhalb“ bezeichnet hier keinen Zeitraum.',
            'Un cadre temporel : innerhalb eines Jahres = en l’espace d’un an.')),
        hints(fill('q3', aide('Formulieren Sie den Satz um: Präposition mit Genitiv statt „weil“.', 'Reformulez : préposition + génitif au lieu de « weil ».'),
          'Weil die Mieten stark gestiegen sind, ziehen viele weg. → [[1]] [[2]] stark gestiegenen Mieten ziehen viele weg.',
          [['Aufgrund', 'Wegen', 'Infolge'], ['der']],
          aide('Aus dem weil-Satz wird eine Nominalgruppe: die Mieten sind gestiegen → der gestiegenen Mieten (Genitiv Plural). „Aufgrund“, „wegen“ und „infolge“ sind hier möglich; „aufgrund“ klingt am sachlichsten.',
            'La subordonnée devient un groupe nominal au génitif : style plus soutenu.')),
        'Grund', 'Artikel'),
        order('q4', C2.ordnen, [['Aufgrund', 'der hohen Mieten', 'ziehen', 'immer mehr', 'junge Familien', 'in die Dörfer', 'außerhalb', 'der Stadt.']],
          aide('Die Präpositionalgruppe „aufgrund der hohen Mieten“ steht auf Position 1, das Verb „ziehen“ folgt sofort, dann das Subjekt. „Außerhalb der Stadt“ beschreibt die Dörfer genauer und steht deshalb direkt danach.',
            'Groupe prépositionnel en tête, puis le verbe, puis le sujet.')),
        match('q5', aide('Welches einfache Verb hat dieselbe Bedeutung? Ordnen Sie zu.', 'Quel verbe simple a le même sens ? Associez.'),
          [['eine Entscheidung treffen', 'entscheiden'], ['in Anspruch nehmen', 'nutzen'], ['Kritik üben an', 'kritisieren'], ['zur Verfügung stellen', 'bereitstellen'],
            ['in Kraft treten', 'gültig werden']],
          aide('Die Nomen-Verb-Verbindungen sind formeller, die einfachen Verben neutraler. In einem Brief an die Stadtverwaltung passen die Verbindungen gut, in einer Nachricht an Freunde eher die einfachen Verben.',
            'Même sens, registre différent.')),
        hints(fill('q6', aide('Ergänzen Sie das Verb in der richtigen Form.', 'Complétez avec le verbe à la bonne forme.'),
          'Der Gemeinderat hat gestern eine wichtige Entscheidung [[1]]. · Die neue Regel [[2]] am 1. Januar in Kraft. · Viele Mieterinnen [[3]] die kostenlose Beratung in Anspruch.',
          [['getroffen'], ['tritt'], ['nehmen']],
          aide('Eine Entscheidung treffen, Partizip II: getroffen. In Kraft treten, 3. Person Singular: tritt (mit Vokalwechsel e → i). In Anspruch nehmen, 3. Person Plural: nehmen. Das Nomen steht am Satzende.',
            'treffen → getroffen ; treten → tritt ; nehmen → nehmen.')),
        'treffen', 'treten', 'nehmen'),
        choice('q7', aide('Welcher Satz ist richtig?', 'Quelle phrase est correcte ?'),
          [['Die Wohnungen stellen ab März den Studierenden zur Verfügung.'], ['Die Wohnungen stehen ab März den Studierenden in Verfügung.'],
            ['Die Wohnungen stehen ab März für die Studierenden zu Verfügung.'], ['Die Wohnungen stehen ab März den Studierenden zur Verfügung.', true]],
          aide('Die Wohnungen selbst handeln nicht: Sie „stehen“ jemandem (Dativ) „zur Verfügung“. „Zur Verfügung stellen“ braucht eine Person oder Institution als Subjekt (Die Stadt stellt die Wohnungen zur Verfügung). Die Präposition ist immer „zur“.',
            'stehen (passif) ≠ stellen (actif) ; toujours « zur Verfügung ».')),
        choice('q8', aide('Welches Verb passt? „Wir müssen auf die älteren Nachbarn Rücksicht ___.“', 'Quel verbe convient ?'),
          [['machen'], ['geben'], ['nehmen', true], ['halten']],
          aide('Die feste Verbindung heißt „Rücksicht nehmen auf + Akkusativ“ (tenir compte de, ménager). Das Verb lässt sich nicht aus dem Französischen ableiten; man muss es mit dem Nomen lernen.',
            'Rücksicht nehmen auf = avoir des égards pour.')),
        fill('q9', aide('Genitiv oder „von“ + Dativ? Ergänzen Sie.', 'Génitif ou « von » + datif ? Complétez.'),
          'Bitte antworten Sie innerhalb [[1]] drei Tagen. · Außerhalb [[2]] Stadtzentrums ist das Parken kostenlos. · Aufgrund [[3]] starken Regenfällen ist die Straße gesperrt.',
          [['von'], ['des', 'eines'], ['von']],
          aide('„Drei Tagen“ und „starken Regenfällen“ sind Dativ Plural (Endung -n), ohne Artikel: Der Genitiv wäre nicht erkennbar, deshalb „von“ + Dativ. „Stadtzentrums“ hat die Genitivendung -s: Davor steht der Artikel im Genitiv, des (oder eines).',
            'Sans article (datif pluriel en -n) : von ; nom au génitif en -s : des.')),
        choice('q10', aide('Welcher Satz klingt am formellsten, zum Beispiel in einem Brief an die Stadt?', 'Quelle phrase est la plus formelle, par exemple dans une lettre à la mairie ?'),
          [['Wir bitten Sie, unseren Vorschlag in Betracht zu ziehen.', true], ['Wir bitten Sie, über unseren Vorschlag mal nachzudenken.'],
            ['Schauen Sie sich unseren Vorschlag doch einfach mal an.'], ['Denken Sie doch bitte mal kurz über unseren Vorschlag nach.']],
          aide('„In Betracht ziehen“ ist eine Nomen-Verb-Verbindung des formellen Stils und bedeutet „ernsthaft prüfen“. Die Partikeln „mal“, „doch“ und „einfach“ machen die anderen Sätze umgangssprachlich.',
            '« in Betracht ziehen » = prendre en considération ; « mal », « doch » = registre familier.')),
      ] },

    // 7 · Lexique
    { id: 'b2-wohnen-wortschatz', kind: 'exercise', title: 'Wortschatz: Wohnungsmarkt, Stadt und Land', estimatedMinutes: 12,
      competences: ['lecture', 'expression-ecrite'],
      lesson: { description: `${aide('Lernen Sie die Wörter des Wohnungsmarkts genau: In Anzeigen, Verträgen und Diskussionen kommt es auf Details an.', 'Apprenez précisément le vocabulaire du logement : dans les annonces, les contrats et les débats, les détails comptent.')}

TIPP
[fr?] Conseil
${aide('Bei einer Wohnungsanzeige immer fragen: Ist das die Kaltmiete oder die Warmmiete? Der Unterschied kann mehrere Hundert Euro betragen.', 'Devant une annonce, demandez toujours s’il s’agit du loyer hors charges ou charges comprises : l’écart peut atteindre plusieurs centaines d’euros.')}` },
      questions: [
        match('q1', aide('Was bedeutet das? Ordnen Sie zu.', 'Que signifient ces mots ? Associez.'),
          [['die Kaltmiete', 'Miete ohne Heizung und Nebenkosten'], ['die Warmmiete', 'Miete mit Heizung und Nebenkosten'], ['der Leerstand', 'Wohnungen, in denen niemand wohnt'],
            ['der Mietspiegel', 'Übersicht über die üblichen Mieten'], ['die Kaution', 'Geld als Sicherheit beim Einzug']],
          aide('Diese Begriffe stehen in fast jeder Anzeige und in jedem Mietvertrag. Die Kaution bekommt man beim Auszug zurück, wenn die Wohnung in Ordnung ist.',
            'loyer hors charges / charges comprises, logements vacants, loyers de référence, dépôt de garantie.')),
        fill('q2', aide('Bilden Sie das Nomen.', 'Formez le nom.'),
          'sanieren → die [[1]] · verdrängen → die [[2]] · zuziehen → der [[3]] · pendeln → der [[4]] (die Person)',
          [['Sanierung'], ['Verdrängung'], ['Zuzug'], ['Pendler']],
          aide('Viele Verben bilden ein feminines Nomen auf -ung (Sanierung, Verdrängung). „Zuziehen“ bildet ein maskulines Nomen ohne Endung mit Vokalwechsel: der Zuzug. Die Person, die pendelt, ist der Pendler (die Pendlerin).',
            '-ung ; der Zuzug (comme der Umzug) ; der Pendler.')),
        choice('q3', aide('Was bedeutet: „Das Viertel ist gerade sehr angesagt“?', 'Que signifie cette phrase ?'),
          [['Das Viertel ist gerade bei vielen sehr beliebt.', true], ['Das Viertel wird bald vollständig abgerissen.'],
            ['Die Stadt hat das Viertel neu benannt.'], ['Im Viertel wurden neue Regeln angekündigt.']],
          aide('„Angesagt“ ist umgangssprachlich und heißt: im Trend, sehr beliebt. Mit „ansagen“ im Sinn von „ankündigen“ hat es hier nichts zu tun.',
            'angesagt = à la mode, branché.')),
        choice('q4', aide('Sie wollen in einem Text zwei Seiten einer Frage zeigen. Welche Formulierung passt?', 'Vous voulez montrer deux aspects d’une question. Quelle formule convient ?'),
          [['Einerseits sind die Mieten niedrig, andererseits fehlt eine gute Anbindung.', true],
            ['Erstens sind die Mieten niedrig, und zweitens fehlt dann noch eine gute Anbindung.'],
            ['Weil die Mieten niedrig sind, fehlt deshalb eine gute Anbindung.'],
            ['Die Mieten sind niedrig, sodass eine gute Anbindung fehlt.']],
          aide('„Einerseits …, andererseits …“ stellt zwei Aspekte gegenüber: ein Vorteil, ein Nachteil. Die anderen Sätze zählen nur auf oder behaupten einen Zusammenhang von Grund und Folge, der nicht logisch ist.',
            'einerseits … andererseits = d’un côté … de l’autre.')),
        fill('q5', aide('Ergänzen Sie die Präposition.', 'Complétez avec la préposition.'),
          'Die Mieter beschweren sich [[1]] den Baulärm. · Die Bürgerinitiative übt Kritik [[2]] dem Bauprojekt. · Über hundert Personen haben sich [[3]] die Wohnung beworben.',
          [['über'], ['an'], ['um']],
          aide('Sich beschweren über + Akkusativ, Kritik üben an + Dativ, sich bewerben um + Akkusativ. Diese Präpositionen sind fest und lassen sich nicht aus dem Französischen ableiten.',
            'se plaindre de → über ; critiquer → Kritik üben an ; postuler à → sich bewerben um.')),
        match('q6', aide('Welche Erklärung passt? Ordnen Sie zu.', 'Quelle explication convient ? Associez.'),
          [['bezahlbar', 'nicht zu teuer'], ['gut angebunden', 'mit Bus und Bahn leicht erreichbar'], ['begehrt', 'von vielen gewünscht'],
            ['abgelegen', 'weit weg von anderen Orten']],
          aide('Diese Adjektive beschreiben Wohnungen und Orte in Anzeigen und Diskussionen: bezahlbar (abordable), gut angebunden (bien desservi), begehrt (convoité), abgelegen (isolé).',
            'abordable, bien desservi, convoité, isolé.')),
      ] },

    // 8 · Vérifier (l'écoute authentique -hoeren2 du lot M2 s'insère avant cette activité)
    { id: 'b2-wohnen-kontrolle', kind: 'exercise', title: 'Prüfen: Wohnen, Genitiv und feste Verbindungen', estimatedMinutes: 14,
      competences: ['lecture'],
      lesson: { description: `${aide('Prüfen Sie, was Sie in diesem Modul gelernt haben: Lesen, Grammatik und Wortschatz.', 'Vérifiez ce que vous avez appris dans ce module : lecture, grammaire et vocabulaire.')}

${aide('Für die Fragen 1 und 2 lesen Sie einen Aushang in einem Mietshaus.', 'Pour les questions 1 et 2, lisez un avis affiché dans un immeuble.')}

MITTEILUNG DER HAUSVERWALTUNG
Aufgrund von Sanierungsarbeiten steht der Aufzug innerhalb der nächsten zwei Wochen nicht zur Verfügung.
Bewohnerinnen und Bewohner, die Hilfe beim Tragen ihrer Einkäufe in Anspruch nehmen möchten, melden sich bitte beim Hausmeister.
Wir bitten um Ihr Verständnis.` },
      placements: [{ media: 'b2-wohnen-kontrolle-aushang', caption: 'Aushang im Treppenhaus' }],
      questions: [
        choice('q1', aide('Was teilt die Hausverwaltung mit?', 'Qu’annonce la régie ?'),
          [['Der Aufzug wird in zwei Wochen vollständig abgebaut.'], ['Zwei Wochen lang kann man den Aufzug nicht nutzen.', true],
            ['Der Aufzug ist ab jetzt nur noch für Einkäufe gedacht.'], ['Die Sanierung des Hauses dauert noch zwei Monate.']],
          aide('„Steht … nicht zur Verfügung“ heißt: Man kann ihn nicht benutzen. „Innerhalb der nächsten zwei Wochen“ nennt den Zeitraum. Von einem Abbau oder von zwei Monaten ist nicht die Rede.',
            '« nicht zur Verfügung stehen » = ne pas être disponible.')),
        choice('q2', aide('Was können Bewohner beim Hausmeister bekommen?', 'Que peuvent obtenir les habitants auprès du gardien ?'),
          [['einen Schlüssel für den Lastenaufzug'], ['Hilfe beim Tragen der Einkäufe', true], ['eine Senkung der Miete für zwei Wochen'],
            ['eine Liste der Handwerksfirmen']],
          aide('„Bewohnerinnen und Bewohner, die Hilfe beim Tragen ihrer Einkäufe in Anspruch nehmen möchten, melden sich bitte beim Hausmeister.“ „In Anspruch nehmen“ heißt hier: nutzen, bekommen wollen.',
            '« in Anspruch nehmen » = avoir recours à.')),
        order('q3', C2.ordnen,
          [['Die Stadt', 'hat', 'im März', 'aufgrund', 'der großen Wohnungsnot', 'eine', 'wichtige', 'Entscheidung', 'getroffen.'],
            ['Die Stadt', 'hat', 'aufgrund', 'der großen Wohnungsnot', 'im März', 'eine', 'wichtige', 'Entscheidung', 'getroffen.']],
          aide('Das Hilfsverb „hat“ steht an Position 2, das Partizip „getroffen“ am Ende. Die Angaben zu Zeit und Grund stehen im Mittelfeld vor dem Objekt; meist steht die Zeit vor dem Grund, beide Reihenfolgen sind möglich.',
            'Auxiliaire en 2e position, participe à la fin ; temps et cause avant l’objet.')),
        fill('q4', aide('Ergänzen Sie den Artikel im Genitiv.', 'Complétez avec l’article au génitif.'),
          'Infolge [[1]] Sanierung ist die Miete gestiegen. · Innerhalb [[2]] Monats haben drei Läden geschlossen.',
          [['der', 'einer'], ['eines', 'des']],
          aide('„Die Sanierung“ ist feminin: Genitiv „der Sanierung“. „Ein Monat“ ist maskulin: Genitiv „eines Monats“ mit der Endung -s am Nomen.',
            'féminin : der ; masculin indéfini : eines … -s.')),
        hints(fill('q5', aide('Ergänzen Sie das Verb der Nomen-Verb-Verbindung.', 'Complétez avec le verbe de la locution.'),
          'Die Mieterinnen und Mieter [[1]] scharfe Kritik an dem Bauprojekt. · Die Stadt will die Pläne nächste Woche zur Diskussion [[2]].',
          [['üben', 'übten'], ['stellen']],
          aide('„Kritik üben an“ + Dativ und „zur Diskussion stellen“ sind feste Verbindungen. Im zweiten Satz steht der Infinitiv nach dem Modalverb „will“ am Ende.',
            'Kritik üben ; zur Diskussion stellen.')),
        'üben', 'stellen'),
        choice('q6', aide('Welche Präposition passt? „___ der Stadt gibt es kaum noch Arztpraxen.“', 'Quelle préposition convient ?'),
          [['Aufgrund'], ['Infolge'], ['Außerhalb', true], ['Angesichts']],
          aide('Gesucht ist ein Ort: außerhalb der Stadt. Mit „aufgrund“, „infolge“ oder „angesichts“ wäre „die Stadt“ die Ursache, was keinen Sinn ergibt.',
            'Un lieu : außerhalb.')),
        choice('q7', aide('Was ist die Warmmiete?', 'Qu’est-ce que la « Warmmiete » ?'),
          [['die Miete im Winter'], ['die Miete mit Heizung und Nebenkosten', true], ['die Miete ohne Nebenkosten'], ['die Miete für ein Haus mit Garten']],
          aide('Die Warmmiete umfasst die Kaltmiete und die Nebenkosten, also Heizung, Wasser, Müllabfuhr usw. Mit der Jahreszeit hat das Wort nichts zu tun.',
            'Loyer charges et chauffage compris.')),
        fill('q8', aide('Genitiv oder „von“ + Dativ? Ergänzen Sie.', 'Génitif ou « von » + datif ?'),
          'Aufgrund [[1]] dringenden Reparaturen bleibt der Aufzug geschlossen. · Infolge [[2]] Sturms sind im Park mehrere Bäume umgestürzt.',
          [['von'], ['des']],
          aide('„Dringenden Reparaturen“ ist Dativ Plural ohne Artikel: aufgrund von + Dativ. „Sturms“ zeigt mit der Endung -s den Genitiv maskulin: infolge des Sturms.',
            'Datif pluriel sans article : von ; génitif en -s : des.')),
      ] },
  ],
};
