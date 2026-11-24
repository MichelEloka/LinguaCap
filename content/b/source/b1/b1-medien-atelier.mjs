// Module B1 n° 18 · atelier « Medien » (lot R3). Relayer une information fiable : modèle de contribution d'opinion à un
// forum, réactions à une rumeur, médiation (corriger une annonce erronée du groupe de quartier à partir de la source
// officielle), erreurs typiques, entraînement au Lesen (article de presse, a/b/c), puis deux missions notées sur grille.
// Reprise réécrite du brouillon B1 V1 : tâches « Corriger une annonce dans le groupe du quartier » et « Vérifier ensemble
// avant de transmettre », leçons « synthese » et « lexique » (content/b1-v1/source/partie2.mjs › b1-medien).
import { bi, choice, fill, order, speak, GRIDS } from '../../lib.mjs';

/** Grille B1 standard, libellé « tâche » précisé pour la mission. */
const grid = (base, task) => base.map((criterion) => (criterion.id === 'aufgabe' ? { ...criterion, label: task } : { ...criterion }));

export default {
  id: 'b1-medien-atelier',
  title: 'Medien, atelier : relayer une information fiable',
  objective: 'Corriger une information erronée à partir de la source officielle, réagir à une rumeur, s’entraîner à lire un article de presse, puis écrire une contribution d’opinion à un forum et présenter une information et sa source.',
  sources: [
    'Textes, publications, article et exercices originaux LinguaCap.',
    'Tâches reprises et réécrites du brouillon B1 V1 (LinguaCap) : corriger une annonce, vérifier avant de transmettre.',
  ],

  vocabulary: [
    { word: 'meiner Meinung nach', partOfSpeech: 'expression', translation: 'à mon avis',
      example: 'Meiner Meinung nach brauchen wir eine Lokalzeitung.', note: 'en tête : inversion (Meiner Meinung nach ist …)' },
    { word: 'der Meinung sein', partOfSpeech: 'expression', translation: 'être d’avis',
      example: 'Ich bin der Meinung, dass soziale Medien nützlich sind.', note: null },
    { word: 'einerseits … andererseits', partOfSpeech: 'expression', translation: 'd’un côté… de l’autre',
      example: 'Einerseits ist das praktisch, andererseits auch gefährlich.', note: 'inversion après chacun des deux mots' },
    { word: 'Gegenargument', article: 'das', plural: 'Gegenargumente', partOfSpeech: 'noun', translation: 'le contre-argument',
      example: 'Ein Gegenargument ist der Preis.', note: null },
    { word: 'erstens', partOfSpeech: 'adverb', translation: 'premièrement',
      example: 'Erstens ist die Lokalzeitung genau.', note: 'zweitens, drittens · inversion après erstens' },
    { word: 'außerdem', partOfSpeech: 'adverb', translation: 'en outre, de plus',
      example: 'Außerdem prüfen die Journalisten ihre Quellen.', note: null },
    { word: 'alles in allem', partOfSpeech: 'expression', translation: 'dans l’ensemble, en somme',
      example: 'Alles in allem finde ich die Idee gut.', note: null },
    { word: 'zustimmen', partOfSpeech: 'verb', translation: 'approuver, être d’accord avec',
      example: 'Da kann ich dir nur zustimmen.', note: 'séparable : zu|stimmen · + datif' },
    { word: 'widersprechen', partOfSpeech: 'verb', translation: 'contredire',
      example: 'Da muss ich dir leider widersprechen.', note: 'inséparable · + datif' },
    { word: 'Hinweis', article: 'der', plural: 'Hinweise', partOfSpeech: 'noun', translation: 'l’indication, le signalement',
      example: 'Danke für den Hinweis!', note: null },
    { word: 'richtigstellen', partOfSpeech: 'verb', translation: 'rectifier',
      example: 'Ich möchte eine Information richtigstellen.', note: 'séparable : richtig|stellen' },
    { word: 'Falschmeldung', article: 'die', plural: 'Falschmeldungen', partOfSpeech: 'noun', translation: 'la fausse information',
      example: 'Das war leider eine Falschmeldung.', note: null },
    { word: 'Abonnement', article: 'das', plural: 'Abonnements', partOfSpeech: 'noun', translation: 'l’abonnement',
      example: 'Ein Abonnement der Zeitung kostet zwölf Euro im Monat.', note: 'familier : das Abo' },
    { word: 'nachfragen', partOfSpeech: 'verb', translation: 'se renseigner, demander des précisions',
      example: 'Ich frage lieber noch einmal bei der Stadt nach.', note: 'séparable : nach|fragen' },
    { word: 'Wie seht ihr das?', partOfSpeech: 'expression', translation: 'Qu’en pensez-vous ?',
      example: 'Ich finde das gut. Wie seht ihr das?', note: 'poli : Wie sehen Sie das?' },
    { word: 'Pressestelle', article: 'die', plural: 'Pressestellen', partOfSpeech: 'noun', translation: 'le service de presse',
      example: 'Die Pressestelle der Stadt hat die Mitteilung veröffentlicht.', note: null },
  ],

  media: [
    { key: 'b1-medien-atelier-modell-audio', kind: 'audio', title: 'La contribution de Samira lue à voix haute',
      script: [
        { voice: 'frau2', name: 'Samira', text: 'Brauchen wir noch eine Lokalzeitung? Ich lese seit drei Jahren jeden Morgen unsere Lokalzeitung, und zwar online. Meiner Meinung nach brauchen wir sie heute mehr als früher.' },
        { pause: 0.5 },
        { voice: 'frau2', name: 'Samira', text: 'Erstens erfährt man dort, was direkt vor der eigenen Haustür passiert: Baustellen, neue Geschäfte oder Entscheidungen des Stadtrats. Zum Beispiel habe ich nur durch die Zeitung erfahren, dass unsere Straße im Sommer gesperrt wird.' },
        { pause: 0.5 },
        { voice: 'frau2', name: 'Samira', text: 'Zweitens prüfen Journalistinnen und Journalisten ihre Quellen, bevor sie etwas veröffentlichen. In sozialen Netzwerken ist das leider nicht immer so.' },
        { pause: 0.5 },
        { voice: 'frau2', name: 'Samira', text: 'Natürlich gibt es auch Nachteile: Ein Abonnement kostet Geld, und manche Artikel erscheinen später als im Netz. Trotzdem finde ich: Eine gute Lokalzeitung ist ihr Geld wert. Wie seht ihr das?' },
      ] },

    { key: 'b1-medien-atelier-interaktion-s1', kind: 'audio', title: 'Situation 1 : une amie a entendu une rumeur',
      script: [{ voice: 'frau2', name: 'Lisa', text: 'Hast du schon gehört? Das Kino am Markt macht angeblich zu!' }] },
    { key: 'b1-medien-atelier-interaktion-s2', kind: 'audio', title: 'Situation 2 : un collègue a lu le journal',
      script: [{ voice: 'mann', name: 'Kollege', text: 'Laut Zeitung wird die Brücke ab Montag gesperrt.' }] },
    { key: 'b1-medien-atelier-interaktion-s3', kind: 'audio', title: 'Situation 3 : une question de la radio',
      script: [{ voice: 'frau3', name: 'Moderatorin', text: 'Wie informieren Sie sich über das, was in Ihrer Stadt passiert?' }] },
    { key: 'b1-medien-atelier-interaktion-s4', kind: 'audio', title: 'Situation 4 : une photo étonnante',
      script: [{ voice: 'mann3', name: 'Nachbar', text: 'Ich glaube, das Foto ist echt. Es sieht doch ganz realistisch aus.' }] },

    { key: 'b1-medien-atelier-mediation-gruppe', kind: 'image', title: 'Une annonce erronée dans le groupe du quartier',
      alt: 'Groupe de quartier « Nordviertel » : Kai écrit que le bureau des citoyens ferme trois semaines dès lundi et que les rendez-vous ne se prennent plus qu’en ligne ; Rosa s’inquiète, car elle a besoin d’une nouvelle carte d’identité la semaine prochaine.',
      image: { layout: 'forum', title: 'Nachbarschaftsgruppe Nordviertel',
        posts: [
          { author: 'Kai_B', date: 'Fr., 21:10', text: 'Achtung, Leute! Ab Montag ist das Bürgerbüro für drei Wochen zu! Termine gibt’s nur noch online. Teilt das bitte!' },
          { author: 'Rosa M.', date: 'Fr., 21:25', text: 'Oh nein, ich brauche doch nächste Woche einen neuen Ausweis. Weiß jemand mehr?' },
        ] } },

    { key: 'b1-medien-atelier-sprechen-karten', kind: 'image', title: 'Un communiqué et une publication',
      alt: 'Deux documents : un communiqué des transports de Neustadt du 12 mai annonçant dès le 1er juillet un billet scolaire à 1 euro par jour, en vente dans l’appli ou aux distributeurs ; une publication anonyme affirmant que les élèves voyageront gratuitement.',
      image: { layout: 'cards',
        cards: [
          { title: 'Mitteilung der Verkehrsbetriebe', subtitle: 'Neustadt, 12. Mai', icon: 'bus',
            lines: ['Ab 1. Juli: Schülerticket für 1 Euro pro Tag', 'Gilt für alle Busse und Straßenbahnen der Stadt', 'Kauf in der App oder am Automaten'] },
          { title: 'Beitrag in einer Gruppe', subtitle: 'gepostet von „StadtNews_24“', icon: 'message-circle',
            lines: ['Ab Juli fahren alle Schüler gratis Bus!!!', 'Teilt das, bevor es gelöscht wird!'] },
        ] } },
  ],

  activities: [
    // 1 · Modèle de production
    { id: 'b1-medien-atelier-modell', kind: 'lesson', title: 'Modèle : une contribution d’opinion à un forum', estimatedMinutes: 12,
      competences: ['lecture', 'ecoute'],
      lesson: { description: `${bi('Lesen und hören Sie den Forumsbeitrag. Achten Sie auf den Aufbau und auf die markierten Wendungen.', 'Lisez et écoutez la contribution au forum. Observez sa structure et les tournures relevées.')}

SITUATION
[fr] Situation
${bi('Im Forum eines Stadtmagazins diskutieren die Leserinnen und Leser: „Brauchen wir noch eine Lokalzeitung?“ Samira schreibt ihre Meinung.', 'Sur le forum d’un magazine de la ville, les lecteurs débattent : « Avons-nous encore besoin d’un journal local ? » Samira donne son avis.')}

BRAUCHEN WIR NOCH EINE LOKALZEITUNG?
Beitrag von Samira K.
Ich lese seit drei Jahren jeden Morgen unsere Lokalzeitung, und zwar online. Meiner Meinung nach brauchen wir sie heute mehr als früher.
Erstens erfährt man dort, was direkt vor der eigenen Haustür passiert: Baustellen, neue Geschäfte oder Entscheidungen des Stadtrats. Zum Beispiel habe ich nur durch die Zeitung erfahren, dass unsere Straße im Sommer gesperrt wird.
Zweitens prüfen Journalistinnen und Journalisten ihre Quellen, bevor sie etwas veröffentlichen. In sozialen Netzwerken ist das leider nicht immer so.
Natürlich gibt es auch Nachteile: Ein Abonnement kostet Geld, und manche Artikel erscheinen später als im Netz.
Trotzdem finde ich: Eine gute Lokalzeitung ist ihr Geld wert. Wie seht ihr das?

AUFBAU
[fr] Structure
1. ${bi('Einleitung: eigene Erfahrung und Meinung („Ich lese seit … Meiner Meinung nach …“).', 'Introduction : expérience personnelle et avis.')}
2. ${bi('Erstes Argument mit Beispiel („Erstens … Zum Beispiel …“).', 'Premier argument, avec un exemple.')}
3. ${bi('Zweites Argument („Zweitens …“).', 'Deuxième argument.')}
4. ${bi('Gegenargument („Natürlich gibt es auch Nachteile: …“).', 'Contre-argument : on montre qu’on voit l’autre côté.')}
5. ${bi('Schluss: Fazit und Frage an die anderen („Trotzdem finde ich … Wie seht ihr das?“).', 'Conclusion : bilan et question aux autres lecteurs.')}

EINLEITEN
[fr] Introduire
• Ich lese / nutze seit … — Je lis / j’utilise depuis…
• Meiner Meinung nach … / Ich bin der Meinung, dass … — À mon avis… / Je pense que…

BEGRÜNDEN
[fr] Justifier
• Erstens …, zweitens … — Premièrement…, deuxièmement…
• Ein wichtiger Grund ist, dass … — Une raison importante, c’est que…
• Außerdem … — En outre…

BEISPIEL
[fr] Donner un exemple
• Zum Beispiel habe ich … — Par exemple, j’ai…
• Das sieht man zum Beispiel daran, dass … — On le voit par exemple au fait que…

GEGENARGUMENT
[fr] Nuancer
• Natürlich gibt es auch Nachteile: … — Bien sûr, il y a aussi des inconvénients : …
• Einerseits …, andererseits … — D’un côté…, de l’autre…

SCHLUSS
[fr] Conclure
• Trotzdem finde ich … / Alles in allem … — Malgré tout, je trouve… / Dans l’ensemble…
• Wie seht ihr das? — Qu’en pensez-vous ?

ATTENTION
• Après erstens, außerdem, trotzdem, meiner Meinung nach, le verbe vient juste après : Erstens erfährt man …, Trotzdem finde ich …
• Un forum n’est ni une lettre formelle ni un message à un ami : pas de « Sehr geehrte… », pas d’abréviations de messagerie.` },
      placements: [{ media: 'b1-medien-atelier-modell-audio', transcriptVisibility: 'on_demand' }] },

    // 2 · Réagir en situation
    { id: 'b1-medien-atelier-interaktion', kind: 'exercise', title: 'Réagir : rumeurs et informations', estimatedMinutes: 10,
      competences: ['ecoute', 'expression-orale'],
      lesson: { description: `${bi('Hören Sie vier kurze Situationen. Wählen Sie jeweils die passende Reaktion.', 'Écoutez quatre courtes situations. Choisissez chaque fois la réplique qui convient.')}
${bi('Danach sprechen Sie drei nützliche Sätze nach.', 'Ensuite, répétez trois phrases utiles.')}

STRATEGIE
[fr] Stratégie
${bi('Bei einer unsicheren Information: nicht sofort glauben, nicht sofort widersprechen, sondern nach der Quelle fragen.', 'Face à une information incertaine : ne pas croire tout de suite, ne pas contredire tout de suite, mais demander la source.')}` },
      placements: [
        { media: 'b1-medien-atelier-interaktion-s1', questionId: 'q1', transcriptVisibility: 'after_answer' },
        { media: 'b1-medien-atelier-interaktion-s2', questionId: 'q2', transcriptVisibility: 'after_answer' },
        { media: 'b1-medien-atelier-interaktion-s3', questionId: 'q3', transcriptVisibility: 'after_answer' },
        { media: 'b1-medien-atelier-interaktion-s4', questionId: 'q4', transcriptVisibility: 'after_answer' },
      ],
      questions: [
        choice('q1', bi('Situation 1: Eine Freundin erzählt eine Neuigkeit. Was antworten Sie?', 'Situation 1 : une amie raconte une nouvelle. Que répondez-vous ?'),
          [['Wirklich? Woher hast du das?', true], ['Nein, ich gehe heute nicht ins Kino.'], ['Gern geschehen!']],
          'Lisa dit « angeblich » : l’information n’est pas vérifiée. La bonne réaction demande la source. Les deux autres répliques ne répondent pas à ce qu’elle dit.'),
        choice('q2', bi('Situation 2: Ein Kollege nennt eine Information aus der Zeitung. Was antworten Sie?', 'Situation 2 : un collègue cite une information du journal. Que répondez-vous ?'),
          [['Das ist doch nur deine Meinung, das glaube ich nicht.'], ['Danke für die Info! Weißt du auch, wie lange?', true], ['Gern geschehen, das mache ich gern für dich!']],
          'Le collègue cite une source (« Laut Zeitung ») : on remercie et on demande une précision utile. Ce n’est pas une opinion mais une information sourcée, et « gern geschehen » répond à un merci.'),
        choice('q3', bi('Situation 3: Eine Moderatorin macht eine Umfrage auf der Straße. Was antworten Sie?', 'Situation 3 : une animatrice fait un micro-trottoir. Que répondez-vous ?'),
          [['In meiner Stadt passiert eigentlich jeden Tag sehr viel.'], ['Ja, ich informiere mich sehr gern über meine Stadt.'], ['Meistens lese ich die Lokalzeitung online oder höre Radio.', true]],
          'À une question ouverte (« Wie …? »), on répond par des moyens concrets. La première réplique parle de la ville, pas de la façon de s’informer ; « Ja » ne répond pas à une question en wie.'),
        choice('q4', bi('Situation 4: Ein Nachbar zeigt Ihnen ein Foto. Was antworten Sie?', 'Situation 4 : un voisin vous montre une photo. Que répondez-vous ?'),
          [['Stimmt, es sieht echt aus. Teilen wir es gleich mit allen!'], ['Vielleicht, aber bevor wir es teilen, sollten wir die Quelle prüfen.', true],
            ['Nein, das ist sicher falsch. Alle Fotos im Netz sind gefälscht.']],
          'On accepte la possibilité (« Vielleicht ») tout en proposant de vérifier avant de partager : réaction nuancée et polie. Les deux autres jugent trop vite : l’une partage sans vérifier, l’autre rejette tout sans vérifier non plus.'),
        speak('q5', 'Gibt es dafür eine offizielle Quelle?',
          'Question fermée : la voix monte à la fin. « offizielle » : accent sur « -ELL » (offi-zi-ELL-e), « z » prononcé « ts ». « Quelle » : « kv ».'),
        speak('q6', 'Ich würde lieber warten, bis die Stadt es bestätigt.',
          'Konjunktiv II poli (« würde lieber ») puis subordonnée avec bis : « bestätigt » à la fin, accent sur « STÄ ».'),
        speak('q7', 'Danke für den Hinweis, ich schaue gleich nach.',
          'Formule pour accueillir une information avant de la vérifier. « nachschauen » est séparable : « schaue … nach ». « Hinweis » : accent sur « HIN ».'),
      ] },

    // 3 · Médiation : corriger une annonce erronée
    { id: 'b1-medien-atelier-mediation', kind: 'exercise', title: 'Médiation : corriger une annonce erronée', estimatedMinutes: 15,
      competences: ['lecture', 'expression-ecrite'],
      lesson: { description: `SITUATION
[fr] Situation
${bi('In Ihrer Nachbarschaftsgruppe hat Kai eine Nachricht geteilt. Rosa macht sich Sorgen. Sie finden die offizielle Mitteilung der Stadt.', 'Dans votre groupe de quartier, Kai a partagé un message. Rosa s’inquiète. Vous trouvez le communiqué officiel de la ville.')}
${bi('Vergleichen Sie Kais Nachricht mit der Mitteilung. Korrigieren Sie dann freundlich und mit einfachen Worten.', 'Comparez le message de Kai et le communiqué. Corrigez ensuite aimablement, avec des mots simples.')}

NACHBARSCHAFTSGRUPPE NORDVIERTEL
Kai_B (Fr., 21:10): Achtung, Leute! Ab Montag ist das Bürgerbüro für drei Wochen zu! Termine gibt’s nur noch online. Teilt das bitte!
Rosa M. (Fr., 21:25): Oh nein, ich brauche doch nächste Woche einen neuen Ausweis. Weiß jemand mehr?

MITTEILUNG DER STADT NEUSTADT
Bürgerbüro Nord vorübergehend geschlossen
Wegen Umbauarbeiten bleibt das Bürgerbüro Nord vom 4. bis 8. März geschlossen. In dieser Zeit können Bürgerinnen und Bürger das Bürgerbüro Mitte im Rathaus (Erdgeschoss) besuchen. Termine können wie gewohnt online oder telefonisch vereinbart werden. Ausweise und Pässe, die schon im Bürgerbüro Nord abholbereit sind, können ab dem 11. März dort abgeholt werden. Ab dem 11. März gelten wieder die normalen Öffnungszeiten.
Stadt Neustadt, Pressestelle, 28. Februar

STRATEGIE
[fr] Stratégie
${bi('Vergleichen Sie Punkt für Punkt: Welcher Ort? Wie lange? Was kann man tun? Was ist in Kais Nachricht falsch oder fehlt?', 'Comparez point par point : quel lieu ? combien de temps ? que peut-on faire ? qu’est-ce qui est faux ou manque dans le message de Kai ?')}` },
      placements: [{ media: 'b1-medien-atelier-mediation-gruppe', caption: 'Nachbarschaftsgruppe Nordviertel' }],
      questions: [
        choice('q1', bi('Wie lange ist das Bürgerbüro Nord wirklich geschlossen?', 'Combien de temps le bureau des citoyens Nord est-il vraiment fermé ?'),
          [['drei Wochen, ab Montag'], ['eine Woche, vom 4. bis 8. März', true], ['zwei Wochen, vom 4. bis 18. März']],
          'Le communiqué dit « vom 4. bis 8. März » : une semaine de travaux, puis réouverture le 11 mars. Kai a exagéré (« für drei Wochen »).'),
        choice('q2', bi('Rosa braucht nächste Woche einen neuen Ausweis. Was ist für sie wichtig?', 'Rosa a besoin d’une nouvelle carte d’identité la semaine prochaine. Qu’est-ce qui compte pour elle ?'),
          [['Sie kann ins Bürgerbüro Mitte im Rathaus gehen.', true], ['Sie muss drei Wochen warten.'], ['Sie kann nur online einen Ausweis bekommen.']],
          'Pendant les travaux, « können Bürgerinnen und Bürger das Bürgerbüro Mitte im Rathaus besuchen ». Kai a oublié cette information, la plus utile pour Rosa.'),
        fill('q3', bi('Ergänzen Sie Ihre Korrektur für die Gruppe.', 'Complétez votre correction pour le groupe.'),
          'Kleine Korrektur: Laut [[1]] der Stadt ist nur das Bürgerbüro Nord geschlossen, und zwar nur vom 4. bis [[2]] März. In dieser Zeit könnt ihr ins Bürgerbüro [[3]] im Rathaus gehen. Termine gibt es online oder [[4]].',
          [['Mitteilung', 'Pressemitteilung', 'Internetseite', 'Website'], ['8.', '8', 'achten'], ['Mitte'], ['telefonisch', 'per Telefon', 'am Telefon']],
          'On cite la source (laut Mitteilung der Stadt), on rectifie la durée (du 4 au 8 mars), on donne l’alternative (Bürgerbüro Mitte) et on corrige le dernier point : rendez-vous en ligne ou par téléphone, pas seulement en ligne.'),
        order('q4', bi('Beginnen Sie Ihre Korrektur höflich: Bilden Sie den Satz.', 'Commencez poliment votre correction : remettez la phrase dans l’ordre.'),
          [['Ich', 'glaube,', 'dass', 'das', 'nicht', 'ganz', 'stimmt.']],
          '« Ich glaube, dass das nicht ganz stimmt. » Une correction prudente (nicht ganz : pas tout à fait) évite de vexer. Après dass, le verbe stimmt va à la fin.'),
        choice('q5', bi('Wie korrigieren Sie Kai freundlich?', 'Comment corrigez-vous Kai aimablement ?'),
          [['Das ist totaler Unsinn, Kai! Lies die Mitteilung doch mal richtig.'], ['Danke, Kai! Ich teile deine Nachricht gleich mit allen Nachbarn.'],
            ['Danke für den Hinweis! Laut Mitteilung ist aber nur das Bürgerbüro Nord eine Woche zu.', true]],
          'On remercie pour le signalement, puis on corrige en citant la source (laut Mitteilung). La première réplique corrige, mais de façon blessante ; la deuxième diffuse l’erreur au lieu de la corriger.'),
        order('q6', bi('Sagen Sie es einfacher: „Termine können wie gewohnt online oder telefonisch vereinbart werden.“ Bilden Sie den Satz.', 'Dites-le plus simplement : remettez la phrase dans l’ordre.'),
          [['Ihr', 'könnt', 'Termine', 'wie immer', 'online oder am Telefon', 'machen.'], ['Ihr', 'könnt', 'wie immer', 'Termine', 'online oder am Telefon', 'machen.']],
          'Simplifier : passer du passif (können … vereinbart werden) à l’actif avec « ihr », et remplacer les mots difficiles (wie gewohnt → wie immer, vereinbaren → machen). « Termine » et « wie immer » peuvent s’échanger.'),
      ] },

    // 4 · Erreurs typiques
    { id: 'b1-medien-atelier-korrektur', kind: 'exercise', title: 'Corriger : erreurs typiques des francophones', estimatedMinutes: 10,
      competences: ['lecture', 'expression-ecrite'],
      lesson: { description: `${bi('Diese Fehler machen viele Französischsprachige, wenn sie Informationen weitergeben. Finden Sie die richtige Form.', 'Beaucoup de francophones font ces erreurs quand ils transmettent une information. Trouvez la forme correcte.')}
${bi('Achten Sie auf dass, ob, laut und auf die Zeitangaben.', 'Faites attention à dass, ob, laut et aux indications de temps.')}` },
      questions: [
        order('q1', bi('Viele schreiben: „Er sagt, dass der Markt zieht um.“ Bilden Sie den Satz richtig.', 'Beaucoup écrivent cette phrase fautive. Remettez-la dans le bon ordre.'),
          [['Er', 'sagt,', 'dass', 'der Markt', 'umzieht.']],
          'Après dass, le verbe conjugué va à la fin, et un verbe séparable se ressoude : « dass der Markt umzieht ». En français, « qu’il déménage » garde l’ordre de la principale ; pas en allemand.'),
        fill('q2', bi('Ergänzen Sie den Satz: „Ich weiß nicht, … die Information stimmt.“', 'Complétez la phrase : « Je ne sais pas si l’information est vraie. »'),
          'Ich weiß nicht, [[1]] die Information stimmt.',
          [['ob']],
          '« si » se traduit par ob quand il introduit une question (je me demande si…) et par wenn quand il pose une condition (s’il pleut…). Ici, c’est une question : ob.'),
        choice('q3', bi('Sie möchten Ihre eigene Meinung sagen. Welcher Satz ist richtig?', 'Vous voulez donner votre propre avis. Quelle phrase est correcte ?'),
          [['Laut mir ist diese Information falsch.'], ['Nach mir diese Information ist falsch.'], ['Meiner Meinung nach ist diese Information falsch.', true]],
          '« Selon moi » ne se dit pas *laut mir* : laut sert à citer une source extérieure (laut der Stadt). Pour son avis : meiner Meinung nach, suivi de l’inversion (ist diese Information).'),
        fill('q4', bi('Ergänzen Sie vor oder bevor.', 'Complétez avec vor ou bevor.'),
          '[[1]] der Sitzung lese ich die Zeitung. [[2]] ich etwas teile, prüfe ich die Quelle.',
          [['Vor'], ['Bevor']],
          '« Avant » + nom : vor (+ datif : vor der Sitzung). « Avant de / avant que » + verbe : la conjonction bevor, avec le verbe à la fin (bevor ich etwas teile).'),
        fill('q5', bi('Ergänzen Sie den Satz: „… ich diese App benutze, … ich mehr Nachrichten.“', 'Complétez la phrase : « Depuis que j’utilise cette appli, je lis plus d’informations. »'),
          '[[1]] ich diese App benutze, [[2]] ich mehr Nachrichten.',
          [['Seitdem', 'Seit'], ['lese']],
          'Seitdem (ou seit) + subordonnée au présent pour une situation qui dure encore, comme « depuis que » en français. Puis la principale commence par son verbe : « lese ich ».'),
        choice('q6', bi('Sie sind derselben Meinung wie Ihr Freund. Welcher Satz ist richtig?', 'Vous êtes du même avis que votre ami. Quelle phrase est correcte ?'),
          [['Ich bin mit dir einverstanden.', true], ['Ich habe mit dir einverstanden.'], ['Ich bin einverstanden mit dich.']],
          '« Être d’accord » : einverstanden sein (avec sein, pas haben), mit + datif (mit dir). On peut aussi dire « Ich stimme dir zu ».'),
      ] },

    // 5 · Entraînement au format : Lesen, article de presse
    { id: 'b1-medien-atelier-pruefung', kind: 'exercise', title: 'Entraînement à l’examen : Lesen, article de presse', estimatedMinutes: 20,
      competences: ['lecture'],
      lesson: { description: `PRÜFUNGSTRAINING: LESEN
[fr] Entraînement à l’examen : compréhension écrite
${bi('Lesen Sie den Zeitungsartikel und die Aufgaben. Wählen Sie für jede Aufgabe die richtige Antwort: a, b oder c.', 'Lisez l’article de journal et les questions. Choisissez pour chaque question la bonne réponse : a, b ou c.')}
${bi('Zeit: 20 Minuten.', 'Durée : 20 minutes.')}

STRATEGIE
[fr] Stratégie
1. ${bi('Lesen Sie zuerst den Titel und die Aufgaben. Die Aufgaben folgen der Reihenfolge des Textes.', 'Lisez d’abord le titre et les questions. Les questions suivent l’ordre du texte.')}
2. ${bi('Suchen Sie die passende Stelle und lesen Sie sie genau. Die falschen Antworten nehmen oft Wörter aus dem Text, sagen aber etwas anderes.', 'Cherchez le passage et lisez-le en détail. Les mauvaises réponses reprennent souvent des mots du texte, mais disent autre chose.')}
3. ${bi('Achten Sie auf Verneinungen und auf Wörter wie nur, eher, nicht.', 'Attention aux négations et aux mots comme nur, eher, nicht.')}

NACHRICHTEN AUS DEM HANDY – ABER WOHER GENAU?
Neustadt. Zeitung, Radio oder Fernsehen? Für die meisten jungen Leute in Neustadt kommen die Nachrichten heute vor allem aus dem Handy. Das zeigt eine kleine Umfrage, die Schülerinnen und Schüler der Gesamtschule Nord im Frühjahr gemacht haben. Sie haben 240 Jugendliche zwischen 14 und 19 Jahren gefragt, wie sie sich informieren.

Fast drei Viertel der Befragten sagen, dass sie Nachrichten vor allem in sozialen Netzwerken lesen oder sehen. Eine gedruckte Zeitung liest nur jeder Zehnte regelmäßig, meistens bei den Eltern oder Großeltern. „Das hat uns nicht überrascht“, sagt die 17-jährige Lara, die bei dem Projekt mitgearbeitet hat. „Überrascht hat uns eher, wie selten die Leute prüfen, woher eine Nachricht kommt.“

Tatsächlich sagen nur 30 Prozent, dass sie die Quelle kontrollieren, bevor sie einen Beitrag teilen. Viele wussten auch nicht, ob ein Video echt oder bearbeitet war. „Sobald etwas lustig oder spannend aussieht, wird es weitergeschickt“, erklärt Lara.

Lehrer Thomas Berger, der das Projekt betreut hat, sieht darin aber keinen Grund zur Panik. „Junge Menschen sind nicht weniger klug als Erwachsene. Auch viele Ältere teilen Gerüchte, ohne nachzudenken.“ Wichtig ist aus seiner Sicht, dass man in der Schule übt, wie man Informationen prüft.

Die Schülerinnen und Schüler haben deshalb einen kleinen Ratgeber geschrieben: Wer hat die Nachricht veröffentlicht? Gibt es ein Datum? Berichten auch andere Medien darüber? Der Ratgeber wird ab nächster Woche in allen Neustädter Schulen verteilt. Außerdem planen die Jugendlichen im Herbst einen Workshop in der Stadtbibliothek, und zwar für alle Generationen.` },
      questions: [
        choice('q1', bi('Was zeigt die Umfrage vor allem?', 'Que montre surtout l’enquête ?'),
          [['Die meisten Jugendlichen lesen jeden Tag Zeitung.'], ['Die meisten Jugendlichen informieren sich vor allem über das Handy.', true],
            ['Jugendliche interessieren sich nicht für Nachrichten.']],
          'Premier paragraphe : les nouvelles « kommen … vor allem aus dem Handy ». Seul un sur dix lit un journal imprimé, et rien ne dit que les jeunes se désintéressent de l’actualité.'),
        choice('q2', bi('Wer hat die Umfrage gemacht?', 'Qui a réalisé l’enquête ?'),
          [['Schülerinnen und Schüler einer Schule', true], ['das Team der Stadtbibliothek'], ['eine Journalistin der Lokalzeitung']],
          '« eine kleine Umfrage, die Schülerinnen und Schüler der Gesamtschule Nord … gemacht haben ». La bibliothèque n’apparaît qu’à la fin, pour l’atelier prévu en automne.'),
        choice('q3', bi('Was hat die Gruppe überrascht?', 'Qu’est-ce qui a surpris le groupe ?'),
          [['dass nur wenige Jugendliche eine gedruckte Zeitung lesen'], ['dass viele Jugendliche lustige Videos teilen'],
            ['dass viele nicht prüfen, woher eine Nachricht kommt', true]],
          '« Das hat uns nicht überrascht » porte sur le journal imprimé ; « Überrascht hat uns eher, wie selten die Leute prüfen, woher eine Nachricht kommt. » Piège : la première réponse reprend une information du texte, mais justement non surprenante.'),
        choice('q4', bi('Wie sieht Herr Berger die Ergebnisse?', 'Comment M. Berger voit-il les résultats ?'),
          [['Er macht sich große Sorgen um die Jugendlichen.'], ['Er meint, dass auch Erwachsene ähnliche Fehler machen.', true],
            ['Er findet, dass soziale Netzwerke verboten werden sollten.']],
          '« keinen Grund zur Panik … Auch viele Ältere teilen Gerüchte, ohne nachzudenken. » Il relativise et propose d’apprendre à vérifier à l’école, pas d’interdire.'),
        choice('q5', bi('Was passiert mit dem Ratgeber?', 'Que va-t-il se passer avec le guide ?'),
          [['Er wird in der Zeitung veröffentlicht.'], ['Er wird nur im Internet gezeigt.'], ['Er wird in allen Schulen der Stadt verteilt.', true]],
          '« Der Ratgeber wird ab nächster Woche in allen Neustädter Schulen verteilt. » Passif au présent avec valeur de futur.'),
        choice('q6', bi('Für wen ist der Workshop in der Stadtbibliothek?', 'À qui s’adresse l’atelier à la bibliothèque ?'),
          [['für Menschen jeden Alters', true], ['nur für Schülerinnen und Schüler'], ['nur für Eltern und Großeltern']],
          '« für alle Generationen » : pour tous les âges. Les deux autres réponses ajoutent « nur », qui contredit le texte.'),
      ] },

    // 6 · Mission écrite
    { id: 'b1-medien-atelier-schreiben', kind: 'mission', title: 'Mission : donner son avis sur les réseaux sociaux', estimatedMinutes: 25,
      competences: ['expression-ecrite'],
      lesson: { description: `SITUATION
[fr] Situation
${bi('Im Online-Forum des Stadtmagazins „Neustadt aktuell“ diskutieren die Leserinnen und Leser über die Frage: „Soziale Medien als Nachrichtenquelle: praktisch oder gefährlich?“', 'Sur le forum en ligne du magazine de la ville « Neustadt aktuell », les lecteurs débattent : « Les réseaux sociaux comme source d’information : pratiques ou dangereux ? »')}

AUFGABE
[fr] Consigne
${bi('Schreiben Sie einen Forumsbeitrag (100 bis 130 Wörter).', 'Écrivez une contribution au forum (100 à 130 mots).')}
• ${bi('Erzählen Sie kurz, wie Sie sich selbst informieren.', 'Dites brièvement comment vous vous informez vous-même.')}
• ${bi('Nennen Sie einen Vorteil sozialer Medien als Nachrichtenquelle.', 'Donnez un avantage des réseaux sociaux comme source d’information.')}
• ${bi('Nennen Sie einen Nachteil oder eine Gefahr, mit einem Beispiel.', 'Donnez un inconvénient ou un danger, avec un exemple.')}
• ${bi('Sagen Sie Ihre Meinung und geben Sie einen Tipp, wie man Informationen prüft.', 'Donnez votre avis et un conseil pour vérifier une information.')}

${bi('Nehmen Sie das Modell dieses Ateliers als Hilfe, aber schreiben Sie Ihren eigenen Text.', 'Aidez-vous du modèle de cet atelier, mais écrivez votre propre texte.')}` },
      mission: {
        oral: null,
        written: {
          prompt: bi('Schreiben Sie einen Forumsbeitrag (100–130 Wörter): wie Sie sich informieren, ein Vorteil, ein Nachteil mit Beispiel, Ihre Meinung und ein Tipp zum Prüfen von Informationen.',
            'Écrivez une contribution au forum de 100 à 130 mots : comment vous vous informez, un avantage, un inconvénient avec un exemple, votre avis et un conseil pour vérifier une information.'),
          maxChars: 1200, minWords: 100,
        },
        checklist: [
          bi('Ich beginne mit meiner eigenen Erfahrung.', 'Je commence par ma propre expérience.'),
          bi('Ich nenne einen Vorteil und einen Nachteil mit Beispiel.', 'Je donne un avantage et un inconvénient avec un exemple.'),
          bi('Meine Meinung ist klar (Meiner Meinung nach …, Ich finde, dass …).', 'Mon avis est clair.'),
          bi('Ich verbinde die Ideen (erstens, außerdem, trotzdem, alles in allem).', 'Je relie les idées avec des connecteurs.'),
          bi('Am Ende gebe ich einen Tipp oder stelle eine Frage an die anderen.', 'Je termine par un conseil ou une question aux autres.'),
        ],
        criteria: grid(GRIDS.b1.schreiben, 'Tâche : expérience personnelle, un avantage, un inconvénient illustré, avis clair et conseil ; ton adapté à un forum'),
      } },

    // 7 · Mission orale
    { id: 'b1-medien-atelier-sprechen', kind: 'mission', title: 'Mission : présenter une information et sa source', estimatedMinutes: 20,
      competences: ['expression-orale'],
      lesson: { description: `SITUATION
[fr] Situation
${bi('In Ihrem Deutschkurs stellt jede Person eine Nachricht aus der Stadt vor. Sie haben zwei Texte gefunden: eine Mitteilung der Verkehrsbetriebe und einen Beitrag in einer Gruppe.', 'Dans votre cours d’allemand, chacun présente une nouvelle de la ville. Vous avez trouvé deux textes : un communiqué des transports et une publication dans un groupe.')}

MITTEILUNG DER VERKEHRSBETRIEBE
Neustadt, 12. Mai
Ab 1. Juli: Schülerticket für 1 Euro pro Tag
Gilt für alle Busse und Straßenbahnen der Stadt
Kauf in der App oder am Automaten

BEITRAG IN EINER GRUPPE
gepostet von „StadtNews_24“
Ab Juli fahren alle Schüler gratis Bus!!!
Teilt das, bevor es gelöscht wird!

AUFGABE
[fr] Consigne
${bi('Stellen Sie die Nachricht vor (etwa 2 Minuten).', 'Présentez la nouvelle (environ 2 minutes).')}
• ${bi('Sagen Sie, worum es geht: was, für wen, ab wann.', 'Dites de quoi il s’agit : quoi, pour qui, à partir de quand.')}
• ${bi('Nennen Sie die Quelle und sagen Sie, warum sie glaubwürdig ist.', 'Indiquez la source et dites pourquoi elle est fiable.')}
• ${bi('Vergleichen Sie mit dem Beitrag in der Gruppe: Was ist dort falsch?', 'Comparez avec la publication du groupe : qu’est-ce qui y est faux ?')}
• ${bi('Sagen Sie Ihre Meinung zu der Neuigkeit.', 'Donnez votre avis sur cette nouveauté.')}

REDEMITTEL
[fr] Formules utiles
• In meiner Präsentation geht es um … — Ma présentation porte sur…
• Laut den Verkehrsbetrieben … / In der Mitteilung steht, dass … — Selon les transports… / Le communiqué dit que…
• Im Netz liest man, dass … Das stimmt aber nicht, denn … — En ligne, on lit que… Mais c’est faux, car…
• Ich finde die Idee gut, weil … — Je trouve l’idée bonne parce que…
• Zum Schluss möchte ich sagen: … — Pour finir, je voudrais dire : …

${bi('Überlegen Sie sich vorher Stichwörter, aber lesen Sie nicht ab: Sprechen Sie frei.', 'Pensez d’abord à quelques mots-clés, mais ne lisez pas : parlez librement.')}` },
      placements: [{ media: 'b1-medien-atelier-sprechen-karten', caption: 'Mitteilung und Gruppenbeitrag' }],
      mission: {
        oral: {
          prompt: bi('Stellen Sie die Nachricht vor (etwa 2 Minuten): worum es geht, die Quelle und warum sie glaubwürdig ist, was im Gruppenbeitrag falsch ist, und Ihre Meinung.',
            'Présentez la nouvelle en 2 minutes environ : de quoi il s’agit, la source et sa fiabilité, l’erreur de la publication du groupe, et votre avis.'),
          maxSeconds: 120,
        },
        written: null,
        checklist: [
          bi('Ich sage, worum es geht: was, für wen, ab wann.', 'Je dis de quoi il s’agit : quoi, pour qui, depuis quand.'),
          bi('Ich nenne die Quelle mit laut oder „In der Mitteilung steht, dass …“.', 'Je cite la source avec laut ou une phrase avec dass.'),
          bi('Ich korrigiere den falschen Beitrag.', 'Je corrige la publication erronée.'),
          bi('Ich sage meine Meinung und begründe sie.', 'Je donne mon avis et je le justifie.'),
          bi('Ich spreche frei und deutlich, ohne abzulesen.', 'Je parle librement et distinctement, sans lire.'),
        ],
        criteria: grid(GRIDS.b1.sprechen, 'Tâche : la nouvelle (quoi, pour qui, quand), la source et sa fiabilité, l’erreur corrigée, un avis, en 2 minutes'),
      } },

    // 8 · Faire le point
    { id: 'b1-medien-atelier-bilan', kind: 'lesson', title: 'Faire le point : Medien', estimatedMinutes: 6,
      competences: ['lecture'],
      lesson: { description: `ICH KANN JETZT …
[fr] Maintenant, je peux…
• ${bi('Tatsache, Meinung und Gerücht unterscheiden.', 'distinguer un fait, une opinion et une rumeur.')}
• ${bi('eine Quelle nennen und berichten, was sie sagt (dass, ob, laut).', 'citer une source et rapporter ce qu’elle dit (dass, ob, laut).')}
• ${bi('eine falsche Information freundlich korrigieren.', 'corriger aimablement une information fausse.')}
• ${bi('in einem Forum meine Meinung mit Argumenten und Beispiel schreiben.', 'donner mon avis dans un forum avec des arguments et un exemple.')}
• ${bi('eine Nachricht und ihre Quelle mündlich vorstellen.', 'présenter oralement une nouvelle et sa source.')}

STRATÉGIES À GARDER
• Avant de partager : qui a publié ? quand ? d’autres sources le disent-elles ?
• Médiation : comparez point par point (lieu, durée, ce qu’on peut faire), puis corrigez en citant la source officielle.
• Écrit : expérience, arguments avec exemple, contre-argument, conclusion et question ; le verbe juste après erstens, außerdem, trotzdem.
• Lesen : les questions suivent l’ordre du texte ; méfiez-vous des réponses qui reprennent des mots du texte pour dire autre chose.

À REVOIR SI BESOIN
• dass, ob, laut et les subordonnées de temps : « À retenir » et « S’entraîner » du module Medien.
• Les noms en -ung, -heit, -keit : « S’entraîner » et le lexique du module, avec le son.
• La radio du quartier : réécoutez l’émission sans lire la transcription.
• Les missions : relisez le commentaire de votre correcteur et reprenez le point « À retravailler ».` } },
  ],
};
