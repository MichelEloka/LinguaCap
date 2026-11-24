// Module B1 n° 16 · atelier « Konsum » (lot R3). Écrire une réclamation efficace : modèle de réclamation formelle annoté,
// réactions au magasin et au téléphone, médiation du français vers l'allemand (conditions de retour d'un site français
// expliquées à une voisine), erreurs typiques, entraînement au Lesen (avis de lecteurs : pour, contre ou sans avis), puis
// deux missions notées sur grille.
// Reprise réécrite du brouillon B1 V1 : tâches « Écrire une réclamation qui permet d'agir » et « Négocier une solution au
// téléphone », leçons « loesungen » et « bestaetigung » (content/b1-v1/source/partie2-suite.mjs › b1-konsum).
import { bi, choice, fill, order, speak, GRIDS } from '../../lib.mjs';

/** Grille B1 standard, libellé « tâche » précisé pour la mission. */
const grid = (base, task) => base.map((criterion) => (criterion.id === 'aufgabe' ? { ...criterion, label: task } : { ...criterion }));

/** Avis de lecteurs : une question par personne, réponse « dafür », « dagegen » ou « keine klare Meinung ». */
const OPINIONS = { dafuer: 'ja, dafür', dagegen: 'nein, dagegen', offen: 'keine klare Meinung' };
const opinion = (id, de, fr, answer, explanation) => choice(id, bi(de, fr),
  Object.entries(OPINIONS).map(([key, label]) => [label, key === answer]), explanation);

export default {
  id: 'b1-konsum-atelier',
  title: 'Konsum, atelier : écrire une réclamation efficace',
  objective: 'Écrire une réclamation formelle qui permet d’agir, réagir poliment au magasin et au téléphone, expliquer en allemand des conditions de retour rédigées en français et repérer l’avis de lecteurs sur un forum.',
  sources: [
    'Textes, messages, avis et exercices originaux LinguaCap.',
    'Tâches reprises et réécrites du brouillon B1 V1 (LinguaCap) : écrire une réclamation, négocier une solution au téléphone.',
  ],

  vocabulary: [
    { word: 'Sehr geehrte Damen und Herren', partOfSpeech: 'expression', translation: 'Madame, Monsieur (formule d’appel)',
      example: 'Sehr geehrte Damen und Herren, ich schreibe Ihnen wegen meiner Bestellung.', note: 'suivi d’une virgule ; la phrase suivante commence par une minuscule' },
    { word: 'Mit freundlichen Grüßen', partOfSpeech: 'expression', translation: 'formule finale d’une lettre formelle (Cordialement)',
      example: 'Mit freundlichen Grüßen, Nadia Haddad', note: 'sans virgule après la formule dans une lettre' },
    { word: 'Betreff', article: 'der', plural: 'Betreffe', partOfSpeech: 'noun', translation: 'l’objet (d’un courriel)',
      example: 'Im Betreff steht die Bestellnummer.', note: null },
    { word: 'Anhang', article: 'der', plural: 'Anhänge', partOfSpeech: 'noun', translation: 'la pièce jointe',
      example: 'Im Anhang finden Sie ein Foto des Schadens.', note: null },
    { word: 'mitteilen', partOfSpeech: 'verb', translation: 'faire savoir, informer',
      example: 'Leider muss ich Ihnen mitteilen, dass das Kabel fehlt.', note: 'séparable : mit|teilen · jdm. etwas mitteilen' },
    { word: 'Schaden', article: 'der', plural: 'Schäden', partOfSpeech: 'noun', translation: 'le dommage, les dégâts',
      example: 'Auf dem Foto sehen Sie den Schaden.', note: null },
    { word: 'beschädigt', partOfSpeech: 'adjective', translation: 'endommagé',
      example: 'Der Karton war beschädigt.', note: null },
    { word: 'fehlen', partOfSpeech: 'verb', translation: 'manquer',
      example: 'In dem Paket fehlt die Bedienungsanleitung.', note: 'Es fehlt … : il manque …' },
    { word: 'bitten', partOfSpeech: 'verb', translation: 'demander, prier',
      example: 'Ich bitte Sie um eine schnelle Antwort.', note: 'jdn. um + accusatif bitten · bat, hat gebeten' },
    { word: 'Frist', article: 'die', plural: 'Fristen', partOfSpeech: 'noun', translation: 'le délai',
      example: 'Ich setze Ihnen eine Frist bis zum 30. März.', note: 'eine Frist setzen : fixer un délai' },
    { word: 'Lösung', article: 'die', plural: 'Lösungen', partOfSpeech: 'noun', translation: 'la solution',
      example: 'Wir haben eine gute Lösung gefunden.', note: null },
    { word: 'Kompromiss', article: 'der', plural: 'Kompromisse', partOfSpeech: 'noun', translation: 'le compromis',
      example: 'Am Telefon haben wir einen Kompromiss gefunden.', note: null },
    { word: 'Bedingung', article: 'die', plural: 'Bedingungen', partOfSpeech: 'noun', translation: 'la condition',
      example: 'Ich bin einverstanden, aber unter einer Bedingung.', note: null },
    { word: 'schriftlich', partOfSpeech: 'adverb', translation: 'par écrit',
      example: 'Könnten Sie mir das bitte schriftlich bestätigen?', note: 'contraire : mündlich (oralement)' },
    { word: 'Ich hätte lieber mein Geld zurück.', partOfSpeech: 'expression', translation: 'Je préférerais être remboursé(e).',
      example: 'Danke für den Gutschein, aber ich hätte lieber mein Geld zurück.', note: 'hätte lieber : Konjunktiv II poli' },
    { word: 'Vielen Dank im Voraus', partOfSpeech: 'expression', translation: 'Merci d’avance',
      example: 'Vielen Dank im Voraus für Ihre Hilfe.', note: null },
  ],

  media: [
    { key: 'b1-konsum-atelier-modell-audio', kind: 'audio', title: 'La réclamation de Nadia Haddad lue à voix haute',
      script: [
        { voice: 'sprecherin', name: 'Nadia Haddad', text: 'Sehr geehrte Damen und Herren, am vierzehnten März habe ich in Ihrem Onlineshop eine Stehlampe für neunundsiebzig Euro bestellt, Bestellnummer sieben eins sechs zwei. Die Lampe wurde am achtzehnten März geliefert.' },
        { pause: 0.5 },
        { voice: 'sprecherin', name: 'Nadia Haddad', text: 'Leider muss ich Ihnen mitteilen, dass es zwei Probleme gibt: Der Lampenschirm hat einen Riss, und das Stromkabel fehlt. Ein Foto des Schadens finden Sie im Anhang.' },
        { pause: 0.5 },
        { voice: 'sprecherin', name: 'Nadia Haddad', text: 'Am neunzehnten März habe ich bei Ihrem Kundenservice angerufen. Man hat mir eine Antwort innerhalb von zwei Tagen versprochen, aber bis heute habe ich nichts gehört.' },
        { pause: 0.5 },
        { voice: 'sprecherin', name: 'Nadia Haddad', text: 'Ich möchte die Lampe gern behalten. Deshalb bitte ich Sie, mir einen neuen Lampenschirm und das fehlende Kabel zu schicken. Falls das nicht möglich ist, möchte ich die Lampe zurückgeben und den Kaufpreis zurückbekommen.' },
        { pause: 0.5 },
        { voice: 'sprecherin', name: 'Nadia Haddad', text: 'Ich bitte Sie um eine Antwort bis zum dreißigsten März. Mit freundlichen Grüßen, Nadia Haddad.' },
      ] },

    { key: 'b1-konsum-atelier-interaktion-s1', kind: 'audio', title: 'Situation 1 : au magasin',
      script: [{ voice: 'frau', name: 'Verkäuferin', text: 'Haben Sie den Kassenbon noch?' }] },
    { key: 'b1-konsum-atelier-interaktion-s2', kind: 'audio', title: 'Situation 2 : au téléphone avec le service',
      script: [{ voice: 'mann2', name: 'Servicemitarbeiter', text: 'Das Gerät kann leider erst in drei Wochen repariert werden.' }] },
    { key: 'b1-konsum-atelier-interaktion-s3', kind: 'audio', title: 'Situation 3 : une proposition de bon d’achat',
      script: [{ voice: 'frau3', name: 'Mitarbeiterin', text: 'Wir können Ihnen einen Gutschein über zwanzig Euro anbieten.' }] },
    { key: 'b1-konsum-atelier-interaktion-s4', kind: 'audio', title: 'Situation 4 : réparer ou remplacer',
      script: [{ voice: 'mann3', name: 'Verkäufer', text: 'Möchten Sie das Gerät reparieren lassen oder lieber ein neues?' }] },

    { key: 'b1-konsum-atelier-mediation-nachricht', kind: 'image', title: 'Les messages de Mme Becker',
      alt: 'Messages de la voisine, Mme Becker : les chaussures commandées sur un site français sont trop petites ; elle ne comprend pas la page de retour et demande si elle sera remboursée en espèces.',
      image: { layout: 'messages', icon: 'smartphone', title: 'Frau Becker (Nachbarin)',
        messages: [
          { from: 'Frau Becker', time: '9:14', text: 'Guten Morgen! Die Schuhe aus dem französischen Shop sind leider zu klein.' },
          { from: 'Frau Becker', time: '9:15', text: 'Wissen Sie, wie ich sie zurückschicken kann? Ich verstehe die Seite nicht, alles ist auf Französisch.' },
          { from: 'Frau Becker', time: '9:16', text: 'Und bekomme ich mein Geld dann bar zurück?' },
          { from: 'Ich', time: '9:20', side: 'right', text: 'Ich schaue mir das gleich an und erkläre es Ihnen!' },
        ] } },

    { key: 'b1-konsum-atelier-sprechen-roth', kind: 'audio', title: 'Le service client propose trois solutions',
      script: [
        { voice: 'frau2', name: 'Frau Roth', text: 'Kundenservice Küche und Co., mein Name ist Roth. Ich habe Ihre Reklamation zur Kaffeemaschine gelesen, das tut mir sehr leid. Ich kann Ihnen drei Lösungen anbieten.' },
        { pause: 0.5 },
        { voice: 'frau2', name: 'Frau Roth', text: 'Erstens: Wir schicken Ihnen eine neue Glaskanne und die Bedienungsanleitung. Das dauert etwa zehn Tage.' },
        { pause: 0.5 },
        { voice: 'frau2', name: 'Frau Roth', text: 'Zweitens: Sie schicken die ganze Maschine zurück und bekommen eine neue. Das Modell ist aber gerade nicht lieferbar, es kommt erst in drei Wochen.' },
        { pause: 0.5 },
        { voice: 'frau2', name: 'Frau Roth', text: 'Drittens: Sie behalten die Maschine, und wir erstatten Ihnen zwanzig Prozent des Kaufpreises. Eine neue Kanne müssten Sie dann allerdings selbst kaufen.' },
        { pause: 0.5 },
        { voice: 'frau2', name: 'Frau Roth', text: 'Was ist Ihnen am liebsten? Oder haben Sie vielleicht noch einen anderen Vorschlag?' },
      ] },
  ],

  activities: [
    // 1 · Modèle de production
    { id: 'b1-konsum-atelier-modell', kind: 'lesson', title: 'Modèle : une réclamation qui permet d’agir', estimatedMinutes: 12,
      competences: ['lecture', 'ecoute'],
      lesson: { description: `${bi('Lesen und hören Sie die Reklamation. Achten Sie auf den Aufbau und auf die markierten Wendungen.', 'Lisez et écoutez la réclamation. Observez sa structure et les tournures relevées.')}

SITUATION
[fr] Situation
${bi('Nadia Haddad hat online eine Stehlampe bestellt. Die Lampe ist beschädigt, und ein Teil fehlt. Sie schreibt dem Shop.', 'Nadia Haddad a commandé un lampadaire en ligne. Il est abîmé et une pièce manque. Elle écrit au magasin.')}

Betreff: Reklamation zur Bestellung Nr. 7162 (Stehlampe)
Sehr geehrte Damen und Herren,
am 14. März habe ich in Ihrem Onlineshop eine Stehlampe für 79 Euro bestellt (Bestellnummer 7162). Die Lampe wurde am 18. März geliefert. Leider muss ich Ihnen mitteilen, dass es zwei Probleme gibt: Der Lampenschirm hat einen Riss, und das Stromkabel fehlt. Ein Foto des Schadens finden Sie im Anhang.
Am 19. März habe ich bei Ihrem Kundenservice angerufen. Man hat mir eine Antwort innerhalb von zwei Tagen versprochen, aber bis heute habe ich nichts gehört.
Ich möchte die Lampe gern behalten. Deshalb bitte ich Sie, mir einen neuen Lampenschirm und das fehlende Kabel zu schicken. Falls das nicht möglich ist, möchte ich die Lampe zurückgeben und den Kaufpreis zurückbekommen.
Ich bitte Sie um eine Antwort bis zum 30. März.
Mit freundlichen Grüßen
Nadia Haddad

AUFBAU
[fr] Structure
1. ${bi('Betreff: worum es geht, mit Bestellnummer und Produkt.', 'Objet : de quoi il s’agit, avec numéro de commande et produit.')}
2. ${bi('Anrede: „Sehr geehrte Damen und Herren,“', 'Formule d’appel formelle.')}
3. ${bi('Kauf: was, wann, wo, Preis und Bestellnummer.', 'L’achat : quoi, quand, où, prix et numéro de commande.')}
4. ${bi('Problem: die Mängel genau beschreiben und einen Beweis nennen (Foto im Anhang).', 'Le problème : décrire précisément les défauts et citer une preuve (photo jointe).')}
5. ${bi('Bisherige Schritte: der Anruf und das Datum.', 'Les démarches déjà faites : l’appel et sa date.')}
6. ${bi('Forderung und Alternative: „Deshalb bitte ich Sie, … Falls das nicht möglich ist, …“', 'La demande et une solution de repli.')}
7. ${bi('Frist und Gruß: „Ich bitte Sie um eine Antwort bis zum … Mit freundlichen Grüßen“', 'Le délai et la formule finale.')}

EINLEITEN
[fr] Introduire
• Am … habe ich bei Ihnen … bestellt. — Le …, j’ai commandé … chez vous.
• Ich schreibe Ihnen wegen … — Je vous écris au sujet de…

PROBLEM BESCHREIBEN
[fr] Décrire le problème
• Leider muss ich Ihnen mitteilen, dass … — Je dois malheureusement vous informer que…
• Das Gerät funktioniert seit … nicht mehr. — L’appareil ne fonctionne plus depuis…
• Beim Auspacken habe ich festgestellt, dass … — En déballant, j’ai constaté que…

FORDERN
[fr] Demander une solution
• Deshalb bitte ich Sie, mir … zu schicken. — Je vous prie donc de m’envoyer…
• Ich möchte das Gerät umtauschen. — Je souhaite échanger l’appareil.
• Falls das nicht möglich ist, … — Si ce n’est pas possible, …

SCHLUSS
[fr] Conclure
• Ich bitte Sie um eine Antwort bis zum … — Je vous prie de me répondre d’ici le…
• Vielen Dank im Voraus. — Merci d’avance.
• Mit freundlichen Grüßen — Cordialement (formule finale)

ATTENTION
• Registre formel du début à la fin : Sie, Ihnen, Ihr avec majuscule ; jamais « Hallo » ni « Tschüss ».
• Les faits d’abord (dates, numéros, défauts), sans reproches ni majuscules de colère : une réclamation calme obtient plus vite une solution.
• Une demande claire, une solution de repli et un délai : le service sait exactement quoi faire.` },
      placements: [{ media: 'b1-konsum-atelier-modell-audio', transcriptVisibility: 'on_demand' }] },

    // 2 · Réagir en situation
    { id: 'b1-konsum-atelier-interaktion', kind: 'exercise', title: 'Réagir : au magasin et au téléphone', estimatedMinutes: 10,
      competences: ['ecoute', 'expression-orale'],
      lesson: { description: `${bi('Hören Sie vier kurze Situationen im Geschäft und am Telefon. Wählen Sie jeweils die passende Reaktion.', 'Écoutez quatre courtes situations au magasin et au téléphone. Choisissez chaque fois la réplique qui convient.')}
${bi('Danach sprechen Sie drei nützliche Sätze nach.', 'Ensuite, répétez trois phrases utiles.')}

STRATEGIE
[fr] Stratégie
${bi('Bleiben Sie höflich, aber klar: Sagen Sie, was Sie möchten, und fragen Sie nach Details.', 'Restez poli, mais clair : dites ce que vous voulez et demandez des précisions.')}` },
      placements: [
        { media: 'b1-konsum-atelier-interaktion-s1', questionId: 'q1', transcriptVisibility: 'after_answer' },
        { media: 'b1-konsum-atelier-interaktion-s2', questionId: 'q2', transcriptVisibility: 'after_answer' },
        { media: 'b1-konsum-atelier-interaktion-s3', questionId: 'q3', transcriptVisibility: 'after_answer' },
        { media: 'b1-konsum-atelier-interaktion-s4', questionId: 'q4', transcriptVisibility: 'after_answer' },
      ],
      questions: [
        choice('q1', bi('Situation 1: Die Verkäuferin stellt eine Frage. Was antworten Sie?', 'Situation 1 : la vendeuse pose une question. Que répondez-vous ?'),
          [['Ja, hier ist er. Ich habe das Gerät vor einer Woche gekauft.', true], ['Nein danke, ich brauche heute keine Tüte für das Gerät.'],
            ['Ja, gern geschehen. Ich komme dann morgen wieder vorbei.']],
          'La vendeuse demande le ticket de caisse (der Kassenbon) : on le montre et on donne la date d’achat. La deuxième réplique répond à une autre question (un sac) ; « gern geschehen » répond à un merci.'),
        choice('q2', bi('Situation 2: Der Servicemitarbeiter nennt eine lange Wartezeit. Was antworten Sie?', 'Situation 2 : le technicien annonce une longue attente. Que répondez-vous ?'),
          [['Super, dann ist es ja schnell fertig.'], ['Das ist leider zu spät für mich. Wäre ein Umtausch möglich?', true],
            ['Wurde das Gerät schon in drei Wochen repariert?']],
          'Trois semaines, c’est long : on le dit poliment et on propose une autre solution au Konjunktiv II (« Wäre ein Umtausch möglich? »). La première réplique contredit la situation, la troisième mélange passé et futur.'),
        choice('q3', bi('Situation 3: Die Mitarbeiterin bietet etwas an. Was antworten Sie?', 'Situation 3 : l’employée propose quelque chose. Que répondez-vous ?'),
          [['Ich habe keinen Gutschein, nur den Kassenbon.'], ['Gut, dann bezahle ich die zwanzig Euro sofort.'], ['Danke, aber ich hätte lieber mein Geld zurück.', true]],
          'On remercie, puis on dit poliment ce qu’on préfère : « Ich hätte lieber … » (Konjunktiv II). La première réplique répond à côté ; la deuxième comprend mal l’offre : c’est le magasin qui offre un bon de 20 euros, le client ne paie rien.'),
        choice('q4', bi('Situation 4: Der Verkäufer stellt eine Frage mit „oder“. Was antworten Sie?', 'Situation 4 : le vendeur pose une question avec « oder ». Que répondez-vous ?'),
          [['Ja, gern. Vielen Dank für Ihre schnelle Hilfe!'], ['Lieber reparieren lassen, wenn es nicht zu lange dauert.', true], ['Ich habe es schon gestern repariert worden.']],
          'À une question « A oder B? », on ne répond pas « Ja, gern » : on choisit. La bonne réplique choisit (reparieren lassen) et pose une condition. « habe … repariert worden » mélange actif et passif.'),
        speak('q5', 'Ich hätte lieber mein Geld zurück.',
          'Refus poli au Konjunktiv II. « hätte » : « ä » bref ; « zurück » : accent sur « RÜCK », « ü » bref, lèvres arrondies.'),
        speak('q6', 'Könnten Sie mir das bitte schriftlich bestätigen?',
          'Demande de confirmation écrite. « schriftlich » : « sch » puis « ch » doux de « ich » ; « bestätigen » : accent sur « STÄ ».'),
        speak('q7', 'Wie lange dauert die Reparatur ungefähr?',
          'Question ouverte : la voix descend à la fin. « ungefähr » : accent sur « UN », « ä » long. « Reparatur » : accent sur « TUR ».'),
      ] },

    // 3 · Médiation : du français vers l'allemand
    { id: 'b1-konsum-atelier-mediation', kind: 'exercise', title: 'Médiation : expliquer un retour à une voisine', estimatedMinutes: 15,
      competences: ['lecture', 'expression-ecrite'],
      lesson: { description: `SITUATION
[fr] Situation
${bi('Ihre Nachbarin, Frau Becker, hat in einem französischen Onlineshop Schuhe bestellt. Sie sind zu klein. Frau Becker spricht kein Französisch und schreibt Ihnen.', 'Votre voisine, Mme Becker, a commandé des chaussures sur un site français. Elles sont trop petites. Elle ne parle pas français et vous écrit.')}
${bi('Lesen Sie die Rückgabebedingungen auf Französisch. Erklären Sie Frau Becker dann auf Deutsch, was sie tun muss. Übersetzen Sie nicht Wort für Wort: Sagen Sie das Wichtige mit einfachen Sätzen.', 'Lisez les conditions de retour en français. Expliquez ensuite en allemand à Mme Becker ce qu’elle doit faire. Ne traduisez pas mot à mot : dites l’essentiel avec des phrases simples.')}

NACHRICHTEN VON FRAU BECKER
Frau Becker (9:14): Guten Morgen! Die Schuhe aus dem französischen Shop sind leider zu klein.
Frau Becker (9:15): Wissen Sie, wie ich sie zurückschicken kann? Ich verstehe die Seite nicht, alles ist auf Französisch.
Frau Becker (9:16): Und bekomme ich mein Geld dann bar zurück?
Ich (9:20): Ich schaue mir das gleich an und erkläre es Ihnen!

RETOURS ET REMBOURSEMENTS
Vous disposez de 30 jours à compter de la réception de votre colis pour nous retourner un article.
1. Connectez-vous à votre compte client et cliquez sur « Retourner un article ».
2. Imprimez l’étiquette de retour : elle est gratuite pour la France et l’Allemagne.
3. Remettez l’article dans son emballage d’origine, avec toutes ses étiquettes.
4. Déposez le colis dans un point relais ou un bureau de poste.
Le remboursement est effectué sous 14 jours après réception de votre retour, sur le moyen de paiement utilisé lors de la commande. Les articles soldés ne sont ni repris ni échangés.

STRATEGIE
[fr] Stratégie
${bi('Notieren Sie zuerst die Zahlen und die Schritte. Fragen Sie sich dann: Was will Frau Becker wissen?', 'Notez d’abord les chiffres et les étapes. Demandez-vous ensuite : que veut savoir Mme Becker ?')}` },
      placements: [{ media: 'b1-konsum-atelier-mediation-nachricht', caption: 'Nachrichten von Frau Becker' }],
      questions: [
        fill('q1', bi('Notieren Sie die wichtigsten Informationen auf Deutsch.', 'Notez les informations essentielles en allemand.'),
          'Rückgabe: innerhalb von [[1]] Tagen nach Erhalt des Pakets · Rücksendeetikett: [[2]] · Geld zurück: innerhalb von [[3]] Tagen · reduzierte Artikel: kein Umtausch und keine [[4]]',
          [['30', 'dreißig'], ['kostenlos', 'gratis', 'kostenfrei', 'umsonst'], ['14', 'vierzehn'], ['Rückgabe', 'Rücknahme', 'Erstattung', 'Rückerstattung']],
          '« 30 jours à compter de la réception » : innerhalb von 30 Tagen nach Erhalt. « gratuite » : kostenlos ou gratis. « sous 14 jours » : innerhalb von 14 Tagen. « ni repris ni échangés » : kein Umtausch und keine Rückgabe.'),
        order('q2', bi('Bringen Sie die Schritte für Frau Becker in die Reihenfolge der Anleitung.', 'Remettez les étapes dans l’ordre du document pour Mme Becker.'),
          [['im Kundenkonto auf „Artikel zurückschicken“ klicken', 'das Rücksendeetikett ausdrucken', 'die Schuhe in die Originalverpackung legen', 'das Paket in einem Paketshop oder bei der Post abgeben']],
          'L’ordre suit les étapes 1 à 4 du document : se connecter et cliquer, imprimer l’étiquette, remettre les chaussures dans leur emballage d’origine, déposer le colis. « point relais » se dit Paketshop en Allemagne.'),
        choice('q3', bi('Frau Becker hat die Schuhe vor 25 Tagen bekommen. Was sagen Sie ihr?', 'Mme Becker a reçu les chaussures il y a 25 jours. Que lui dites-vous ?'),
          [['Sie sind leider zu spät.'], ['Sie haben noch fünf Tage Zeit.', true], ['Sie haben noch dreißig Tage Zeit.']],
          'Le délai de 30 jours court à partir de la réception du colis : 30 − 25 = 5 jours. Elle n’est pas en retard, mais elle doit se dépêcher.'),
        choice('q4', bi('Frau Becker fragt: „Bekomme ich mein Geld bar zurück?“ Was antworten Sie?', 'Mme Becker demande si elle sera remboursée en espèces. Que répondez-vous ?'),
          [['Ja, im Paketshop bekommen Sie das Geld sofort bar zurück.'], ['Nein, Sie bekommen nach 14 Tagen einen Gutschein per Post.'],
            ['Nein, das Geld kommt auf die Karte, mit der Sie bezahlt haben.', true]],
          '« sur le moyen de paiement utilisé lors de la commande » : le remboursement revient sur la carte ou le compte utilisés pour payer. Il n’est question ni d’espèces ni de bon d’achat.'),
        fill('q5', bi('Ergänzen Sie Ihre Erklärung für Frau Becker.', 'Complétez votre explication pour Mme Becker.'),
          'Sie müssen das Rücksendeetikett nicht [[1]]. Das Geld [[2]] Ihnen innerhalb von 14 Tagen [[3]] (erstatten).',
          [['bezahlen', 'zahlen', 'kaufen'], ['wird'], ['erstattet', 'zurückerstattet']],
          'L’étiquette est gratuite : elle n’a pas à la payer. Puis un passif, comme dans les conditions de retour : « Das Geld wird Ihnen … erstattet » (werden + participe II à la fin).'),
        order('q6', bi('Erklären Sie den letzten Satz der Bedingungen einfach auf Deutsch: Bilden Sie den Satz.', 'Expliquez simplement en allemand la dernière phrase des conditions (« Les articles soldés ne sont ni repris ni échangés ») : remettez la phrase dans l’ordre.'),
          [['Reduzierte Artikel', 'können', 'nicht', 'zurückgegeben', 'oder', 'umgetauscht', 'werden.'],
            ['Reduzierte Artikel', 'können', 'nicht', 'umgetauscht', 'oder', 'zurückgegeben', 'werden.']],
          'Passif avec verbe de modalité : können en 2e position, puis les deux participes reliés par oder et werden à la fin. Les deux participes peuvent s’échanger.'),
      ] },

    // 4 · Erreurs typiques
    { id: 'b1-konsum-atelier-korrektur', kind: 'exercise', title: 'Corriger : erreurs typiques des francophones', estimatedMinutes: 10,
      competences: ['lecture', 'expression-ecrite'],
      lesson: { description: `${bi('Diese Fehler machen viele Französischsprachige in Reklamationen. Finden Sie die richtige Form.', 'Beaucoup de francophones font ces erreurs dans leurs réclamations. Trouvez la forme correcte.')}
${bi('Achten Sie auf lassen, werden, bekommen und auf die Zeitangaben.', 'Faites attention à lassen, werden, bekommen et aux indications de temps.')}` },
      questions: [
        choice('q1', bi('Ein Mechaniker hat Ihr Fahrrad repariert. Welcher Satz ist richtig?', 'Un mécanicien a réparé votre vélo. Quelle phrase est correcte ?'),
          [['Ich habe mein Fahrrad reparieren gemacht.'], ['Ich habe mein Fahrrad reparieren lassen.', true], ['Ich habe mein Fahrrad gelassen reparieren.']],
          '« Faire réparer » : reparieren lassen, avec lassen à l’infinitif à la fin, même au parfait. Le calque « reparieren machen » n’existe pas.'),
        choice('q2', bi('Welcher Satz bedeutet: Morgen bringt jemand das Paket?', 'Quelle phrase veut dire : demain, quelqu’un apporte le colis ?'),
          [['Das Paket ist morgen geliefert.'], ['Das Paket hat morgen geliefert.'], ['Das Paket wird morgen geliefert.', true]],
          'L’action (la livraison) se dit au passif avec werden : « wird geliefert ». « ist geliefert » décrit un résultat ; « hat geliefert » ferait du colis celui qui livre.'),
        fill('q3', bi('Ergänzen Sie bekommen oder werden in der richtigen Form.', 'Complétez avec bekommen ou werden à la bonne forme.'),
          'Ich [[1]] mein Geld in zwei Wochen zurück. Hoffentlich [[2]] das Gerät bald repariert.',
          [['bekomme'], ['wird']],
          'Faux ami : bekommen veut dire « recevoir », pas « devenir ». Je reçois mon argent : ich bekomme. Pour le passif (l’appareil est réparé), on emploie werden : wird repariert.'),
        fill('q4', bi('Ergänzen Sie das Wort „Kunde“ in der richtigen Form.', 'Complétez avec le mot « Kunde » à la bonne forme.'),
          'Der Verkäufer hat den [[1]] sofort zurückgerufen. Wir danken jedem [[2]] für seine Geduld.',
          [['Kunden'], ['Kunden']],
          'Der Kunde suit la n-Deklination : il prend -n à tous les cas sauf au nominatif singulier (den Kunden à l’accusatif, jedem Kunden au datif). Comme der Kollege, der Nachbar.'),
        choice('q5', bi('Wie beginnen Sie eine formelle Reklamation?', 'Comment commencez-vous une réclamation formelle ?'),
          [['Hallo liebes Kundenservice-Team,'], ['Sehr geehrte Damen und Herren,', true], ['Sehr geehrter Damen und Herren,']],
          'Quand on ne connaît pas le nom du destinataire, la formule formelle est « Sehr geehrte Damen und Herren, ». « Hallo … » est trop familier pour une réclamation formelle, et « geehrter » est faux : devant « Damen und Herren » (pluriel, sans article), l’adjectif prend -e.'),
        choice('q6', bi('Sie haben die Lampe am 1. März bestellt. Heute ist der 15. März. Welcher Satz ist richtig?', 'Vous avez commandé la lampe le 1er mars. Nous sommes le 15. Quelle phrase est correcte ?'),
          [['Ich habe die Lampe vor zwei Wochen bestellt.', true], ['Ich habe die Lampe seit zwei Wochen bestellt.'], ['Ich habe die Lampe für zwei Wochen bestellt.']],
          '« Il y a deux semaines » (un moment du passé) : vor + datif. Seit marque une durée qui continue (Ich warte seit zwei Wochen), et für une durée prévue (für zwei Wochen mieten).'),
      ] },

    // 5 · Entraînement au format : Lesen, avis de lecteurs
    { id: 'b1-konsum-atelier-pruefung', kind: 'exercise', title: 'Entraînement à l’examen : Lesen, avis de lecteurs', estimatedMinutes: 18,
      competences: ['lecture'],
      lesson: { description: `PRÜFUNGSTRAINING: LESEN
[fr] Entraînement à l’examen : compréhension écrite
${bi('Sie lesen in einer Zeitung Kommentare zu der Frage: Sollen Rücksendungen im Onlinehandel kostenlos bleiben? Ist die Person dafür oder dagegen, oder hat sie keine klare Meinung?', 'Vous lisez dans un journal des commentaires sur la question : les retours dans le commerce en ligne doivent-ils rester gratuits ? La personne est-elle pour, contre, ou n’a-t-elle pas d’avis tranché ?')}
${bi('Zeit: 15 Minuten.', 'Durée : 15 minutes.')}

STRATEGIE
[fr] Stratégie
1. ${bi('Lesen Sie zuerst die Frage genau: Wofür oder wogegen ist man hier?', 'Lisez d’abord précisément la question : pour ou contre quoi est-on ?')}
2. ${bi('Die Meinung steht oft am Ende des Kommentars. Achten Sie auf Wörter wie sollte, ein Muss, fair, unsicher.', 'L’avis est souvent à la fin du commentaire. Repérez des mots comme sollte, ein Muss, fair, unsicher.')}
3. ${bi('Vorsicht: Wer Argumente beider Seiten nennt und sich nicht entscheidet, hat keine klare Meinung.', 'Attention : qui cite les arguments des deux camps sans trancher n’a pas d’avis tranché.')}

LESERFORUM: SOLLEN RÜCKSENDUNGEN KOSTENLOS BLEIBEN?
Viele Onlineshops nehmen Waren kostenlos zurück. Einige Händler wollen dafür jetzt Geld verlangen. Wir haben unsere Leserinnen und Leser gefragt.

Anna, 34: „Ich bestelle oft Kleidung online, weil ich nur abends Zeit habe. Dann sind die Geschäfte schon zu. Wenn ich für jede Rücksendung bezahlen müsste, würde ich viel weniger bestellen. Für mich sind kostenlose Rücksendungen ein Muss.“

Herr Kowalski, 58: „Viele Leute bestellen eine Hose in drei Größen und schicken zwei zurück. Diese Pakete fahren quer durch das ganze Land. Das ist schlecht für die Umwelt und am Ende teuer für alle. Wer etwas zurückschickt, sollte dafür bezahlen.“

Lea, 22: „Ehrlich gesagt habe ich darüber noch nie nachgedacht. Ich kaufe fast alles im Laden bei mir um die Ecke und schicke so gut wie nie etwas zurück. Das Thema betrifft mich also kaum.“

Murat, 41: „Ich habe selbst einen kleinen Onlineshop. Jede Rücksendung muss ausgepackt, geprüft und neu verpackt werden. Manchmal kann man die Ware gar nicht mehr verkaufen. Gratis ist das nur für die Kunden, nicht für uns. Eine kleine Gebühr wäre fair.“

Frau Neumann, 67: „Ich gehe nicht mehr gern in die Stadt, weil mir das Laufen schwerfällt. Deshalb bin ich froh, dass ich Schuhe zu Hause anprobieren und ohne Kosten zurückschicken kann. Das soll bitte so bleiben!“

Jonas, 29: „Einerseits verstehe ich die Kundinnen und Kunden, andererseits auch die Händler. Vielleicht gibt es eine Lösung, die für beide gut ist, aber welche? Da bin ich wirklich unsicher.“` },
      questions: [
        opinion('q1', 'Anna: Ist sie für kostenlose Rücksendungen?', 'Anna est-elle pour les retours gratuits ?', 'dafuer',
          'Anna conclut : « Für mich sind kostenlose Rücksendungen ein Muss » (indispensables). Elle explique aussi qu’elle commanderait moins si elle devait payer.'),
        opinion('q2', 'Herr Kowalski: Ist er für kostenlose Rücksendungen?', 'M. Kowalski est-il pour les retours gratuits ?', 'dagegen',
          '« Wer etwas zurückschickt, sollte dafür bezahlen » : il veut des retours payants, à cause de l’environnement et des coûts. Il est donc contre la gratuité.'),
        opinion('q3', 'Lea: Ist sie für kostenlose Rücksendungen?', 'Lea est-elle pour les retours gratuits ?', 'offen',
          'Lea n’y a « jamais réfléchi » et achète en magasin : « Das Thema betrifft mich also kaum. » Elle ne donne aucun avis.'),
        opinion('q4', 'Murat: Ist er für kostenlose Rücksendungen?', 'Murat est-il pour les retours gratuits ?', 'dagegen',
          'Murat, commerçant, décrit le coût des retours et conclut : « Eine kleine Gebühr wäre fair. » Une petite taxe, donc contre la gratuité. « Gratis ist das nur für die Kunden » n’est pas un avis favorable : c’est une critique.'),
        opinion('q5', 'Frau Neumann: Ist sie für kostenlose Rücksendungen?', 'Mme Neumann est-elle pour les retours gratuits ?', 'dafuer',
          '« Deshalb bin ich froh, dass ich … ohne Kosten zurückschicken kann. Das soll bitte so bleiben! » Elle veut que la gratuité continue.'),
        opinion('q6', 'Jonas: Ist er für kostenlose Rücksendungen?', 'Jonas est-il pour les retours gratuits ?', 'offen',
          '« Einerseits …, andererseits … » présente les deux côtés, puis « Da bin ich wirklich unsicher » : il ne tranche pas. Piège classique : citer un argument n’est pas prendre position.'),
      ] },

    // 6 · Mission écrite
    { id: 'b1-konsum-atelier-schreiben', kind: 'mission', title: 'Mission : écrire une réclamation', estimatedMinutes: 25,
      competences: ['expression-ecrite'],
      lesson: { description: `SITUATION
[fr] Situation
${bi('Sie haben am 2. Mai im Onlineshop „Küche & Co.“ eine Kaffeemaschine für 89 Euro bestellt (Bestellnummer 20573). Sie wurde am 6. Mai geliefert.', 'Le 2 mai, vous avez commandé une machine à café à 89 euros sur la boutique en ligne « Küche & Co. » (commande n° 20573). Elle a été livrée le 6 mai.')}
• ${bi('Die Glaskanne war zerbrochen.', 'La verseuse en verre était cassée.')}
• ${bi('Die Bedienungsanleitung fehlt.', 'Le mode d’emploi manque.')}
${bi('Am 7. Mai haben Sie beim Kundenservice angerufen. Man hat Ihnen einen Rückruf versprochen, aber niemand hat sich gemeldet.', 'Le 7 mai, vous avez appelé le service client. On vous a promis de vous rappeler, mais personne ne s’est manifesté.')}

AUFGABE
[fr] Consigne
${bi('Schreiben Sie eine Reklamation an den Kundenservice (120 bis 150 Wörter).', 'Écrivez une réclamation au service client (120 à 150 mots).')}
• ${bi('Nennen Sie Kauf, Datum und Bestellnummer.', 'Indiquez l’achat, la date et le numéro de commande.')}
• ${bi('Beschreiben Sie die Mängel genau.', 'Décrivez précisément les défauts.')}
• ${bi('Erwähnen Sie Ihren Anruf.', 'Mentionnez votre appel.')}
• ${bi('Sagen Sie, welche Lösung Sie möchten, nennen Sie eine Alternative und setzen Sie eine Frist.', 'Dites quelle solution vous souhaitez, proposez une alternative et fixez un délai.')}
${bi('Denken Sie an Betreff, Anrede und Gruß.', 'Pensez à l’objet, à la formule d’appel et à la formule finale.')}` },
      mission: {
        oral: null,
        written: {
          prompt: bi('Schreiben Sie eine Reklamation (120–150 Wörter): Kauf, Datum und Bestellnummer, die zwei Mängel, Ihr Anruf, die gewünschte Lösung mit Alternative und eine Frist. Betreff, Anrede und Gruß sind formell.',
            'Écrivez une réclamation de 120 à 150 mots : achat, date et numéro de commande, les deux défauts, votre appel, la solution souhaitée avec une alternative et un délai. Objet, formule d’appel et salutation formels.'),
          maxChars: 1500, minWords: 120,
        },
        checklist: [
          bi('Betreff, Anrede und Gruß sind formell (Sie).', 'L’objet, l’appel et la salutation sont formels.'),
          bi('Kauf, Datum und Bestellnummer stehen am Anfang.', 'L’achat, la date et le numéro sont au début.'),
          bi('Ich beschreibe beide Mängel genau.', 'Je décris précisément les deux défauts.'),
          bi('Ich erwähne meinen Anruf vom 7. Mai.', 'Je mentionne mon appel du 7 mai.'),
          bi('Ich fordere eine Lösung, nenne eine Alternative und setze eine Frist.', 'Je demande une solution, une alternative et un délai.'),
        ],
        criteria: grid(GRIDS.b1.schreiben, 'Tâche : achat identifié, deux défauts décrits, appel mentionné, solution, alternative et délai ; registre formel (Sie)'),
      } },

    // 7 · Mission orale
    { id: 'b1-konsum-atelier-sprechen', kind: 'mission', title: 'Mission : négocier une solution au téléphone', estimatedMinutes: 20,
      competences: ['expression-orale'],
      lesson: { description: `SITUATION
[fr] Situation
${bi('Nach Ihrer Reklamation ruft Frau Roth vom Kundenservice an. Sie bietet Ihnen drei Lösungen an. Hören Sie das Gespräch; Sie können es mehrmals hören und die Transkription lesen.', 'Après votre réclamation, Mme Roth, du service client, vous appelle. Elle vous propose trois solutions. Écoutez ; vous pouvez réécouter et lire la transcription.')}

AUFGABE
[fr] Consigne
${bi('Antworten Sie Frau Roth (etwa 2 Minuten).', 'Répondez à Mme Roth (environ 2 minutes).')}
• ${bi('Bedanken Sie sich und reagieren Sie auf jedes Angebot.', 'Remerciez et réagissez à chaque offre.')}
• ${bi('Wählen Sie eine Lösung oder schlagen Sie einen Kompromiss vor, und begründen Sie Ihre Wahl.', 'Choisissez une solution ou proposez un compromis, et justifiez votre choix.')}
• ${bi('Fragen Sie nach einem Detail: Wann? Wie? Was kostet das?', 'Demandez une précision : quand ? comment ? combien ?')}
• ${bi('Bitten Sie um eine schriftliche Bestätigung.', 'Demandez une confirmation écrite.')}

REDEMITTEL
[fr] Formules utiles
• Vielen Dank für Ihren Anruf. — Merci pour votre appel.
• Die erste Lösung wäre gut, aber zehn Tage sind ziemlich lang. — La première solution serait bien, mais dix jours, c’est long.
• Ich hätte lieber … / Wäre es möglich, dass …? — Je préférerais… / Serait-il possible que…?
• Ich schlage einen Kompromiss vor: … — Je propose un compromis : …
• Könnten Sie mir das bitte schriftlich bestätigen? — Pourriez-vous me le confirmer par écrit ?` },
      placements: [{ media: 'b1-konsum-atelier-sprechen-roth', transcriptVisibility: 'on_demand' }],
      mission: {
        oral: {
          prompt: bi('Antworten Sie Frau Roth (etwa 2 Minuten): Reagieren Sie auf die drei Angebote, wählen Sie eine Lösung oder schlagen Sie einen Kompromiss vor, fragen Sie nach einem Detail und bitten Sie um eine schriftliche Bestätigung.',
            'Répondez à Mme Roth en 2 minutes environ : réagissez aux trois offres, choisissez une solution ou proposez un compromis, demandez une précision et une confirmation écrite.'),
          maxSeconds: 120,
        },
        written: null,
        checklist: [
          bi('Ich bedanke mich und reagiere auf jedes Angebot.', 'Je remercie et je réagis à chaque offre.'),
          bi('Ich wähle eine Lösung oder einen Kompromiss und begründe meine Wahl.', 'Je choisis une solution ou un compromis et je justifie.'),
          bi('Ich frage nach einem Detail (wann, wie, Kosten).', 'Je demande une précision (quand, comment, coût).'),
          bi('Ich bitte um eine schriftliche Bestätigung.', 'Je demande une confirmation écrite.'),
          bi('Ich bleibe höflich: Könnten Sie …? Ich hätte lieber …', 'Je reste poli : Könnten Sie…? Ich hätte lieber…'),
        ],
        criteria: grid(GRIDS.b1.sprechen, 'Tâche : réaction aux trois offres, choix ou compromis justifié, question de détail, confirmation écrite demandée, en 2 minutes'),
      } },

    // 8 · Faire le point
    { id: 'b1-konsum-atelier-bilan', kind: 'lesson', title: 'Faire le point : Konsum', estimatedMinutes: 6,
      competences: ['lecture'],
      lesson: { description: `ICH KANN JETZT …
[fr] Maintenant, je peux…
• ${bi('Rückgabe- und Garantiebedingungen verstehen.', 'comprendre des conditions de retour et de garantie.')}
• ${bi('einen Defekt genau beschreiben und eine Lösung verlangen.', 'décrire précisément un défaut et demander une solution.')}
• ${bi('eine formelle Reklamation mit Frist schreiben.', 'écrire une réclamation formelle avec un délai.')}
• ${bi('am Telefon höflich verhandeln und eine Bestätigung verlangen.', 'négocier poliment au téléphone et demander une confirmation.')}
• ${bi('französische Informationen auf Deutsch einfach erklären.', 'expliquer simplement en allemand des informations lues en français.')}

STRATÉGIES À GARDER
• Réclamation : les faits (date, numéro, défaut, preuve), puis une demande, une solution de repli et un délai.
• Passif : dans une réponse officielle, cherchez qui agit (von uns, vom Kundenservice) et ce que vous devez faire vous-même.
• Médiation : notez d’abord les chiffres et les étapes, puis répondez à la question précise de la personne.
• Lesen : l’avis est souvent à la fin ; « einerseits … andererseits » sans conclusion signale l’absence d’avis tranché.

À REVOIR SI BESOIN
• Le passif et lassen : « À retenir » et « S’entraîner » du module Konsum.
• Les formules de la réclamation : le modèle de cet atelier, rubriques EINLEITEN à SCHLUSS.
• Le vocabulaire (Reklamation, Umtausch, Rückerstattung, Kassenbon…) : lexique des deux modules, avec le son.
• Les missions : relisez le commentaire de votre correcteur et reprenez le point « À retravailler ».` } },
  ],
};
