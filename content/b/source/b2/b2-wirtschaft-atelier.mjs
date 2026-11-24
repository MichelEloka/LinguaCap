// Module B2 n° 16 · atelier « Wirtschaft » (lot R7, thème 8). Réclamer et négocier : modèle annoté (réclamation formelle
// détaillée et négociation téléphonique), réagir aux propositions d'un service client (choix et 4 répétitions), médiation
// (résumer les conditions générales d'un abonnement de vélo pour un client), erreurs typiques, entraînement au format
// Hören (reportage radio, 9 questions), deux missions sur grille B2 : réclamation formelle détaillée (écrit) et négociation
// simulée au téléphone (oral, 2 à 3 minutes).
// Consignes, règles et explications en allemand avec aide française repliée ([fr?]) ; lexique traduit en français.
import { C2, aide, choice, fill, order, speakB2, GRIDS } from '../../lib.mjs';

/** Indices affichés sous les trous d'un fill (forme de base à transformer). */
const hints = (question, ...values) => ({ ...question,
  blanks: question.blanks.map((blank, index) => (values[index] ? { ...blank, hint: values[index] } : blank)) });
/** Écoute : « richtig / falsch / nicht gesagt » (r, f ou n pour la bonne réponse). */
const rfh = (id, statement, answer, explanation) => choice(id,
  aide(`„${statement}“ Richtig, falsch oder nicht gesagt?`, 'Vrai, faux ou non mentionné dans le reportage ?'),
  [['richtig', answer === 'r'], ['falsch', answer === 'f'], ['nicht gesagt', answer === 'n']], explanation);

export default {
  id: 'b2-wirtschaft-atelier',
  title: 'Wirtschaft – Werkstatt: reklamieren, verhandeln, Bedingungen erklären',
  objective: 'Rédiger une réclamation formelle détaillée (faits, demande, délai, conséquence), négocier une solution au téléphone, résumer pour un client les conditions générales d’un abonnement, s’entraîner à l’écoute d’un reportage (format B2) et éviter les erreurs typiques des lettres formelles.',
  grammarFocus: [],
  sources: [
    'Textes, dialogues et exercices originaux LinguaCap. Personnes, entreprises, conditions générales et grand magasin d’occasion sont fictifs.',
  ],

  vocabulary: [
    { word: 'Reklamation', article: 'die', plural: 'Reklamationen', partOfSpeech: 'noun', translation: 'la réclamation',
      example: 'Ich schicke Ihnen meine Reklamation per E-Mail.', note: 'reklamieren : faire une réclamation' },
    { word: 'sich beschweren über', partOfSpeech: 'verb', translation: 'se plaindre de',
      example: 'Ich möchte mich über die lange Wartezeit beschweren.', note: '+ accusatif · die Beschwerde : la plainte' },
    { word: 'Mangel', article: 'der', plural: 'Mängel', partOfSpeech: 'noun', translation: 'le défaut, le vice',
      example: 'Der Mangel trat schon nach zwei Wochen auf.', note: 'mangelhaft : défectueux' },
    { word: 'Gewährleistung', article: 'die', plural: null, partOfSpeech: 'noun', translation: 'la garantie légale',
      example: 'Für gebrauchte Geräte gilt ein Jahr Gewährleistung.', note: 'sans pluriel · die Garantie : la garantie commerciale' },
    { word: 'erstatten', partOfSpeech: 'verb', translation: 'rembourser',
      example: 'Bitte erstatten Sie mir die Kosten für den Waschsalon.', note: 'die Erstattung, die Rückerstattung : le remboursement' },
    { word: 'Frist', article: 'die', plural: 'Fristen', partOfSpeech: 'noun', translation: 'le délai',
      example: 'Ich setze Ihnen eine Frist bis zum 25. März.', note: 'eine Frist setzen : fixer un délai' },
    { word: 'Ich fordere Sie auf, … zu …', partOfSpeech: 'expression', translation: 'je vous demande (formellement) de …',
      example: 'Ich fordere Sie auf, mir den Betrag bis Freitag zu erstatten.', note: 'auf|fordern : sommer, demander' },
    { word: 'Andernfalls sehe ich mich gezwungen, … zu …', partOfSpeech: 'expression', translation: 'à défaut, je me verrai contraint(e) de …',
      example: 'Andernfalls sehe ich mich gezwungen, eine Verbraucherberatung einzuschalten.', note: 'conséquence annoncée, ton ferme et poli' },
    { word: 'beilegen', partOfSpeech: 'verb', translation: 'joindre (à un courrier)',
      example: 'Die Quittungen lege ich diesem Schreiben bei.', note: 'séparable : bei|legen · als Anlage : en pièce jointe' },
    { word: 'angewiesen sein auf', partOfSpeech: 'expression', translation: 'dépendre de, avoir absolument besoin de',
      example: 'Mit zwei kleinen Kindern bin ich auf eine Waschmaschine angewiesen.', note: '+ accusatif' },
    { word: 'Kulanz', article: 'die', plural: null, partOfSpeech: 'noun', translation: 'le geste commercial',
      example: 'Aus Kulanz übernimmt die Firma die Kosten.', note: 'sans pluriel · kulant : arrangeant' },
    { word: 'jemandem entgegenkommen', partOfSpeech: 'expression', translation: 'faire un geste envers quelqu’un',
      example: 'Wir möchten Ihnen gern entgegenkommen.', note: 'séparable : entgegen|kommen' },
    { word: 'Wären Sie bereit, … zu …?', partOfSpeech: 'expression', translation: 'seriez-vous prêt(e) à … ?',
      example: 'Wären Sie bereit, mir einen Teil der Gebühr zu erstatten?', note: 'proposition polie au Konjunktiv II' },
    { word: 'Damit wäre ich einverstanden.', partOfSpeech: 'expression', translation: 'j’accepterais cela',
      example: 'Damit wäre ich einverstanden, wenn Sie es schriftlich bestätigen.', note: 'einverstanden sein mit : être d’accord avec' },
    { word: 'Mindestlaufzeit', article: 'die', plural: 'Mindestlaufzeiten', partOfSpeech: 'noun', translation: 'la durée minimale d’engagement',
      example: 'Das Abo hat eine Mindestlaufzeit von sechs Monaten.', note: null },
    { word: 'Kündigungsfrist', article: 'die', plural: 'Kündigungsfristen', partOfSpeech: 'noun', translation: 'le préavis de résiliation',
      example: 'Die Kündigungsfrist beträgt einen Monat.', note: null },
    { word: 'Selbstbeteiligung', article: 'die', plural: 'Selbstbeteiligungen', partOfSpeech: 'noun', translation: 'la franchise (part à la charge du client)',
      example: 'Bei einem Diebstahl beträgt die Selbstbeteiligung 100 Euro.', note: null },
    { word: 'Allgemeine Geschäftsbedingungen', partOfSpeech: 'expression', translation: 'les conditions générales de vente',
      example: 'Die Allgemeinen Geschäftsbedingungen stehen auf der Internetseite.', note: 'toujours au pluriel · abréviation : die AGB' },
  ],

  media: [
    { key: 'b2-wirtschaft-atelier-modell-audio', kind: 'audio', title: 'Modèle : négocier au téléphone',
      script: [
        { voice: 'frau3', name: 'Frau Pohl', text: 'Reparaturservice, Pohl, guten Tag.' },
        { voice: 'frau', name: 'Selma Yildirim', text: 'Guten Tag, Yildirim hier. Ich rufe wegen meiner Reklamation vom Montag an, Auftragsnummer viertausendvierhunderteinundsiebzig B.' },
        { voice: 'frau3', name: 'Frau Pohl', text: 'Einen Moment bitte. Ja, ich sehe Ihren Vorgang. Das Ersatzteil kommt leider erst Ende des Monats.' },
        { voice: 'frau', name: 'Selma Yildirim', text: 'Das ist für mich ehrlich gesagt keine Lösung. Ich warte schon sechs Wochen. Wären Sie bereit, mir in der Zwischenzeit ein Ersatzgerät zu leihen?' },
        { voice: 'frau3', name: 'Frau Pohl', text: 'Ein Leihgerät haben wir im Moment leider nicht. Ich könnte Ihnen aber die Kosten für den Waschsalon erstatten.' },
        { voice: 'frau', name: 'Selma Yildirim', text: 'Das ist ein Anfang. Ich schlage vor, Sie erstatten mir die vierundsechzig Euro bis heute und übernehmen auch die weiteren Kosten, bis ich die Maschine zurückhabe.' },
        { voice: 'frau3', name: 'Frau Pohl', text: 'Damit kann ich leben. Ich schicke Ihnen das heute noch schriftlich.' },
        { voice: 'frau', name: 'Selma Yildirim', text: 'Vielen Dank, Frau Pohl. Dann warte ich auf Ihre E-Mail.' },
      ] },
    { key: 'b2-wirtschaft-atelier-diskussion-angebot1', kind: 'audio', title: 'Service client : première réponse',
      script: [{ voice: 'frau2', name: 'Frau Seidel', text: 'Das tut mir leid. Aber laut unseren Bedingungen zahlen Sie die Monatsgebühr auch, wenn das Rad in der Werkstatt ist.' }] },
    { key: 'b2-wirtschaft-atelier-diskussion-angebot2', kind: 'audio', title: 'Service client : un bon d’achat',
      script: [{ voice: 'frau2', name: 'Frau Seidel', text: 'Ich könnte Ihnen einen Gutschein über zwanzig Euro für unseren Onlineshop anbieten.' }] },
    { key: 'b2-wirtschaft-atelier-diskussion-angebot3', kind: 'audio', title: 'Service client : la supérieure',
      script: [{ voice: 'frau2', name: 'Frau Seidel', text: 'Eine Rückerstattung kann ich leider nicht selbst entscheiden. Da müsste ich meine Vorgesetzte fragen.' }] },
    { key: 'b2-wirtschaft-atelier-diskussion-angebot4', kind: 'audio', title: 'Service client : la proposition finale',
      script: [{ voice: 'frau2', name: 'Frau Seidel', text: 'Gut. Wir würden Ihnen einen halben Monatsbeitrag erstatten und den Akku kostenlos gegen einen neuen tauschen. Wären Sie damit einverstanden?' }] },
    { key: 'b2-wirtschaft-atelier-mediation-agb', kind: 'image', title: 'Conditions générales : abonnement de vélo électrique',
      alt: 'Extrait de conditions générales d’un abonnement de vélo électrique : durée minimale et résiliation, entretien et réparations, vol, restitution.',
      image: { layout: 'document', icon: 'scroll-text', title: 'E-Bike-Abo: Allgemeine Geschäftsbedingungen', subtitle: 'Auszug: §§ 3, 5, 6 und 8',
        lines: [
          '§ 3 Laufzeit und Kündigung: Mindestlaufzeit sechs Monate, danach Kündigung mit einer Frist von einem Monat',
          '§ 5 Wartung und Reparaturen: Verschleiß und Inspektion in der Gebühr enthalten; selbst verschuldete Schäden bis 150 Euro',
          '§ 6 Diebstahl: Anzeige bei der Polizei innerhalb von 48 Stunden; Selbstbeteiligung 100 Euro, sonst Zeitwert',
          '§ 8 Rückgabe: innerhalb von sieben Tagen; danach 5 Euro pro Tag',
        ] } },
    { key: 'b2-wirtschaft-atelier-pruefung-audio', kind: 'audio', title: 'Reportage radio : un grand magasin d’occasion',
      script: [
        { voice: 'sprecherin', name: 'Reporterin', text: 'Samstagvormittag in Holmsbrügge. Vor einem ehemaligen Elektrogeschäft in der Innenstadt stehen schon um halb zehn die ersten Leute Schlange. Seit einem Jahr verkauft hier das Kaufhaus „Zweites Leben“ ausschließlich gebrauchte Waren: Möbel, Kleidung, Geschirr, Fahrräder und Elektrogeräte. Betrieben wird es von der Stadt zusammen mit einem gemeinnützigen Verein.' },
        { voice: 'mann', name: 'Detlef Unruh', text: 'Die Idee ist ganz einfach: Was die Leute auf dem Wertstoffhof abgeben, wird nicht sofort entsorgt. Unsere Mitarbeiter schauen sich alles an, reparieren, was sich reparieren lässt, und bringen es hierher. Im ersten Jahr haben wir so rund hundertzwanzig Tonnen Abfall vermieden.' },
        { voice: 'mann', name: 'Detlef Unruh', text: 'Die Preise legen wir so fest, dass sich auch Menschen mit wenig Geld etwas leisten können. Ein Wintermantel kostet bei uns zum Beispiel selten mehr als fünfzehn Euro.' },
        { voice: 'sprecherin', name: 'Reporterin', text: 'Die meisten Möbel stammen aus Haushaltsauflösungen, erzählt Unruh. Wenn ältere Menschen in ein Pflegeheim ziehen, bleibt oft eine ganze Wohnung zurück, und vieles davon ist noch gut erhalten.' },
        { voice: 'sprecherin', name: 'Reporterin', text: 'Detlef Unruh leitet das Kaufhaus. Zwölf seiner zwanzig Mitarbeiterinnen und Mitarbeiter waren vorher lange arbeitslos. Für viele ist es die erste feste Stelle seit Jahren.' },
        { voice: 'mann', name: 'Detlef Unruh', text: 'Das ist uns genauso wichtig wie die Umwelt. Wer bei uns in der Werkstatt Waschmaschinen repariert, lernt etwas, das auf dem Arbeitsmarkt gefragt ist. Zwei Kollegen sind inzwischen in normale Betriebe gewechselt, und darauf sind wir stolz.' },
        { voice: 'sprecherin', name: 'Reporterin', text: 'Zwischen den Regalen treffe ich Tamina. Sie studiert Sozialpädagogik und richtet gerade ihre erste eigene Wohnung ein.' },
        { voice: 'frau2', name: 'Tamina', text: 'Ich habe hier einen Schreibtisch für fünfundzwanzig Euro gekauft und zwei Stühle für je acht Euro. Neu hätte ich mir das nie leisten können. Und ehrlich gesagt gefällt mir, dass die Sachen schon eine Geschichte haben. Für die Küche suche ich noch einen Tisch, aber da muss ich wohl nächste Woche wiederkommen.' },
        { voice: 'sprecherin', name: 'Reporterin', text: 'Nicht alle sind so begeistert. Am Eingang steht Herr Lüdtke, einen Toaster in der Hand.' },
        { voice: 'mann3', name: 'Herr Lüdtke', text: 'Den habe ich vor drei Wochen hier gekauft, und jetzt geht er schon nicht mehr. Ich bekomme mein Geld zurück, das ist in Ordnung. Aber man fragt sich schon, ob man bei Elektrogeräten nicht lieber gleich etwas Neues kaufen sollte.' },
        { voice: 'sprecherin', name: 'Reporterin', text: 'Detlef Unruh kennt solche Fälle.' },
        { voice: 'mann', name: 'Detlef Unruh', text: 'Jedes Elektrogerät wird bei uns geprüft, und wir geben ein halbes Jahr Gewährleistung. Trotzdem kann natürlich mal etwas kaputtgehen, genau wie bei neuen Geräten. Wichtig ist, dass wir dann schnell und unkompliziert helfen.' },
        { voice: 'sprecherin', name: 'Reporterin', text: 'Wirtschaftlich trägt sich das Kaufhaus noch nicht. Ohne den Zuschuss der Stadt würde das Geld für Miete und Löhne nicht reichen.' },
        { voice: 'mann', name: 'Detlef Unruh', text: 'Unser Ziel ist, dass wir in drei Jahren ohne Zuschuss auskommen. Bis dahin werden wir unser Angebot erweitert haben. Ab dem Frühjahr bieten wir zum Beispiel Kurse an, in denen die Leute lernen, ihre Kleidung selbst zu flicken.' },
        { voice: 'sprecherin', name: 'Reporterin', text: 'Kurz vor Mittag ist der Laden voll. An der Kasse fragt eine Kundin, ob man hier auch Sachen abgeben kann. Man kann, sagt die Kassiererin, aber bitte nur, was noch funktioniert. Für „Morgen im Land“ berichtete Corinna Haupt aus Holmsbrügge.' },
      ] },
    { key: 'b2-wirtschaft-atelier-sprechen-audio', kind: 'audio', title: 'Mission : les réponses du service client',
      script: [
        { voice: 'mann2', name: 'Herr Brockmann', text: 'Kundenservice Haushaltsgeräte, mein Name ist Brockmann. Was kann ich für Sie tun?' },
        { pause: 2.5 },
        { voice: 'mann2', name: 'Herr Brockmann', text: 'Acht Monate alt, sagen Sie. Wir können einen Techniker schicken, aber der nächste freie Termin ist leider erst in vier Wochen.' },
        { pause: 2.5 },
        { voice: 'mann2', name: 'Herr Brockmann', text: 'Ein Ersatzgerät haben wir nicht. Ich könnte Ihnen höchstens einen Gutschein über dreißig Euro für einen Waschsalon anbieten.' },
        { pause: 2.5 },
        { voice: 'mann2', name: 'Herr Brockmann', text: 'Also gut. Was würden Sie denn vorschlagen?' },
      ] },
  ],

  activities: [
    // 1 · Modèle annoté
    { id: 'b2-wirtschaft-atelier-modell', kind: 'lesson', title: 'Modell: eine Reklamation und eine Verhandlung', estimatedMinutes: 12,
      competences: ['lecture', 'ecoute'],
      lesson: { description: `MODELL: EINE FORMELLE REKLAMATION
[fr?] Modèle : une réclamation formelle
${aide('Lesen Sie die Reklamation von Selma Yildirim. Achten Sie auf den Aufbau, auf die genauen Angaben und auf den Ton: bestimmt, aber höflich.', 'Lisez la réclamation de Selma Yildirim. Observez la structure, la précision des informations et le ton : ferme mais poli.')}

Betreff: Reklamation – Reparaturauftrag Nr. 4471-B, Waschmaschine
Sehr geehrte Damen und Herren,
am 3. Februar habe ich Ihrem Reparaturservice meine Waschmaschine übergeben. Bei der Annahme wurde mir zugesagt, dass die Reparatur höchstens zehn Werktage dauern würde. Heute, sechs Wochen später, habe ich das Gerät noch immer nicht zurück.
Seitdem habe ich dreimal bei Ihrer Hotline angerufen. Jedes Mal wurde mir versichert, das Ersatzteil sei „schon unterwegs“. Man tat so, als ob die Verzögerung nur eine Frage von Tagen wäre; geändert hat sich jedoch nichts. Als Mutter von zwei kleinen Kindern bin ich auf eine funktionierende Waschmaschine angewiesen. Für den Waschsalon habe ich bisher 64 Euro ausgegeben. Die Quittungen lege ich diesem Schreiben bei.
Ich fordere Sie daher auf, die Reparatur bis spätestens 25. März abzuschließen und mir die Kosten für den Waschsalon zu erstatten. Sollte die Reparatur bis dahin nicht möglich sein, erwarte ich, dass Sie mir für die restliche Zeit ein Ersatzgerät zur Verfügung stellen. Andernfalls sehe ich mich gezwungen, eine Verbraucherberatung einzuschalten.
Ich gehe davon aus, dass wir eine faire Lösung finden, und freue mich auf Ihre baldige Antwort.
Mit freundlichen Grüßen
Selma Yildirim
Anlagen: Auftragsbestätigung, drei Quittungen

AUFBAU
[fr?] Structure
1. ${aide('Betreff: Art des Schreibens und Auftrags- oder Bestellnummer.', 'Objet : nature du courrier et numéro de commande.')}
2. ${aide('Sachverhalt: Was ist wann passiert, und was wurde zugesagt? Chronologisch, mit Daten.', 'Les faits : quoi, quand, ce qui avait été promis ; dans l’ordre, avec des dates.')}
3. ${aide('Problem und Folgen: konkret, mit Beträgen und Belegen.', 'Le problème et ses conséquences : concrets, avec montants et justificatifs.')}
4. ${aide('Forderung mit Frist: „Ich fordere Sie auf, … bis spätestens … zu …“', 'La demande, avec un délai.')}
5. ${aide('Alternative und Konsequenz: „Sollte … nicht möglich sein, erwarte ich … Andernfalls …“', 'Une solution de repli, puis la conséquence annoncée.')}
6. ${aide('Schluss: sachlich und versöhnlich, Grußformel, Anlagen.', 'Conclusion : posée et conciliante, formule finale, pièces jointes.')}

SACHVERHALT DARSTELLEN
[fr?] Exposer les faits
• ${aide('Am 3. Februar habe ich bei Ihnen … bestellt / übergeben.', 'Le 3 février, j’ai commandé / remis chez vous …')}
• ${aide('Bei der Annahme wurde mir zugesagt, dass …', 'À la réception, on m’a assuré que …')}
FORDERN
[fr?] Demander
• ${aide('Ich fordere Sie daher auf, … bis spätestens … zu …', 'Je vous demande donc de … au plus tard le …')}
• ${aide('Ich erwarte, dass Sie mir die Kosten erstatten.', 'J’attends que vous me remboursiez les frais.')}
FRIST UND KONSEQUENZ
[fr?] Délai et conséquence
• ${aide('Sollte … bis dahin nicht möglich sein, …', 'Si … n’était pas possible d’ici là, …')}
• ${aide('Andernfalls sehe ich mich gezwungen, … einzuschalten.', 'À défaut, je me verrai contrainte de faire appel à …')}
SCHLUSS
[fr?] Conclure
• ${aide('Ich gehe davon aus, dass wir eine faire Lösung finden.', 'Je ne doute pas que nous trouverons une solution équitable.')}
• ${aide('Die Belege lege ich diesem Schreiben bei.', 'Je joins les justificatifs à ce courrier.')}

MODELL: AM TELEFON VERHANDELN
[fr?] Modèle : négocier au téléphone
${aide('Hören Sie, wie Selma Yildirim mit dem Reparaturservice telefoniert. Achten Sie auf drei Schritte: ein Angebot höflich ablehnen, einen Gegenvorschlag machen, die Einigung schriftlich festhalten lassen.', 'Écoutez l’appel de Selma Yildirim. Repérez trois étapes : refuser poliment une offre, faire une contre-proposition, faire confirmer l’accord par écrit.')}` },
      placements: [{ media: 'b2-wirtschaft-atelier-modell-audio', caption: 'Selma Yildirim verhandelt mit dem Reparaturservice', transcriptVisibility: 'on_demand' }] },

    // 2 · Réagir aux propositions d'un service client
    { id: 'b2-wirtschaft-atelier-diskussion', kind: 'exercise', title: 'Diskutieren: mit dem Kundenservice verhandeln', estimatedMinutes: 12,
      competences: ['ecoute', 'expression-orale'],
      lesson: { description: `SITUATION
[fr?] La situation
${aide('Sie haben ein E-Bike im Abo. Der Akku ist zum zweiten Mal kaputt, und Sie konnten drei Wochen nicht fahren. Sie rufen beim Kundenservice an und möchten einen Teil der Monatsgebühr zurück.', 'Vous avez un vélo électrique en abonnement. La batterie est en panne pour la deuxième fois et vous n’avez pas pu rouler pendant trois semaines. Vous appelez le service client pour récupérer une partie du forfait mensuel.')}
${aide('Hören Sie, was Frau Seidel vom Kundenservice sagt, und wählen Sie jeweils die Reaktion, die bestimmt, aber höflich ist. Sprechen Sie danach die guten Reaktionen laut nach.', 'Écoutez Mme Seidel et choisissez chaque fois la réaction ferme mais polie. Répétez ensuite les bonnes réactions à voix haute.')}

TIPP
[fr?] Conseil
${aide('Gut verhandeln heißt: ruhig bleiben, das eigene Ziel nennen und Vorschläge im Konjunktiv II machen („Wäre es möglich, …?“, „Damit wäre ich einverstanden, wenn …“).', 'Bien négocier : rester calme, dire son objectif et proposer au Konjunktiv II.')}` },
      placements: [
        { media: 'b2-wirtschaft-atelier-diskussion-angebot1', questionId: 'q1', transcriptVisibility: 'after_answer' },
        { media: 'b2-wirtschaft-atelier-diskussion-angebot2', questionId: 'q2', transcriptVisibility: 'after_answer' },
        { media: 'b2-wirtschaft-atelier-diskussion-angebot3', questionId: 'q3', transcriptVisibility: 'after_answer' },
        { media: 'b2-wirtschaft-atelier-diskussion-angebot4', questionId: 'q4', transcriptVisibility: 'after_answer' },
      ],
      questions: [
        choice('q1', aide('Frau Seidel verweist auf die Bedingungen. Wie reagieren Sie?', 'Mme Seidel invoque les conditions. Comment réagissez-vous ?'),
          [['Dann kündige ich eben sofort, und Sie hören nie wieder etwas von mir.'],
            ['Ach so, das wusste ich leider nicht. Dann ist ja alles in bester Ordnung, danke.'],
            ['Das verstehe ich, aber drei Wochen ohne Rad sind kein normaler Werkstattbesuch.', true],
            ['Das verstehe ich, deshalb zahle ich ab sofort einfach gar nichts mehr.']],
          'Die gute Reaktion zeigt Verständnis und hält trotzdem am Ziel fest: Drei Wochen sind kein normaler Fall. Eine Drohung mit Kündigung beendet die Verhandlung, die zweite Antwort gibt sofort auf, die vierte ist eine einseitige Entscheidung, die Ihnen nur schadet. [fr?] Montrer de la compréhension, sans lâcher son objectif.'),
        choice('q2', aide('Frau Seidel bietet einen Gutschein an. Wie reagieren Sie?', 'Mme Seidel propose un bon d’achat. Comment réagissez-vous ?'),
          [['Zwanzig Euro? Das ist doch lächerlich, den Gutschein können Sie gleich behalten!'],
            ['Ein Gutschein hilft mir wenig. Wäre es möglich, einen Teil der Gebühr zu erstatten?', true],
            ['Sehr gern, damit bin ich vollkommen einverstanden, vielen herzlichen Dank dafür.'],
            ['Ein Gutschein hilft mir wenig, als ob ich bei Ihnen noch mehr Sachen kaufen wollte.']],
          'Man lehnt das Angebot höflich ab und macht einen Gegenvorschlag im Konjunktiv II: „Wäre es möglich, …?“ Die erste Antwort ist beleidigend, die dritte nimmt ein Angebot an, das Ihr Problem nicht löst, die vierte ist ironisch und bringt die Verhandlung nicht weiter. [fr?] Refuser poliment, puis contre-proposer.'),
        choice('q3', aide('Frau Seidel kann nicht selbst entscheiden. Wie reagieren Sie?', 'Mme Seidel ne peut pas décider seule. Comment réagissez-vous ?'),
          [['Gut. Könnten Sie mich bitte bis morgen zurückrufen, wenn Sie mit ihr gesprochen haben?', true],
            ['Dann holen Sie gefälligst sofort Ihre Vorgesetzte, ich habe keine Zeit für so etwas.'],
            ['Schade. Dann vergessen wir das Ganze einfach, es ist ja nicht so wichtig.'],
            ['Das verstehe ich. Dann entscheide ich eben selbst und überweise mir das Geld.']],
          'Sie akzeptieren den Weg über die Vorgesetzte, legen aber einen Zeitpunkt fest: „bis morgen“. So bleibt die Sache in Bewegung. „Gefälligst“ ist sehr unhöflich, die dritte Antwort gibt auf, die vierte ist unsinnig. [fr?] Accepter la procédure, mais fixer une échéance.'),
        choice('q4', aide('Frau Seidel macht ein Angebot. Wie reagieren Sie?', 'Mme Seidel fait une offre. Comment réagissez-vous ?'),
          [['Nein, ich will den ganzen Beitrag für ein Jahr zurück, sonst gehe ich vor Gericht.'],
            ['Einverstanden, aber nur, wenn Sie mir einen halben Monatsbeitrag erstatten.'],
            ['Ich weiß nicht genau. Ich rufe nächsten Monat vielleicht noch einmal an.'],
            ['Damit wäre ich einverstanden, wenn Sie mir das noch schriftlich bestätigen.', true]],
          'Das Angebot ist fair: Sie nehmen es an und sichern es ab („wenn Sie mir das schriftlich bestätigen“). Die erste Forderung ist übertrieben, die zweite verlangt genau das, was schon angeboten wurde, die dritte lässt eine gute Lösung liegen. [fr?] Accepter un compromis équitable et demander une confirmation écrite.'),
        speakB2('q5', 'Das verstehe ich, aber drei Wochen ohne Rad sind kein normaler Werkstattbesuch.',
          'Betonen Sie „drei Wochen“ und „kein“: Dort liegt Ihr Argument. „Werkstattbesuch“ hat den Hauptakzent auf dem ersten Teil: WERK-statt-be-such. Das „r“ in „aber“ und „Werkstatt“ klingt fast wie ein kurzes a. [fr?] Accent sur « drei Wochen » et « kein ».',
          ['Das verstehe ich, aber drei Wochen ohne Rad sind kein normaler Werkstattbesuch.', 'Das verstehe ich, aber 3 Wochen ohne Rad sind kein normaler Werkstattbesuch.']),
        speakB2('q6', 'Ein Gutschein hilft mir wenig. Wäre es möglich, einen Teil der Gebühr zu erstatten?',
          '„Wäre“ mit langem, offenem ä. „Gebühr“ wird auf der zweiten Silbe betont: ge-BÜHR, mit langem ü. In der Frage steigt die Stimme am Ende leicht an. [fr?] « Gebühr » : accent sur la seconde syllabe, ü long.'),
        speakB2('q7', 'Könnten Sie mich bitte bis morgen zurückrufen, wenn Sie mit Ihrer Vorgesetzten gesprochen haben?',
          '„Könnten“ mit kurzem, gerundetem ö. In „zurückrufen“ liegt der Akzent auf „rück“: zu-RÜCK-ru-fen. „Vorgesetzten“ wird am Anfang betont: VOR-ge-setz-ten. Machen Sie vor „wenn“ eine kleine Pause. [fr?] Petite pause avant « wenn ».'),
        speakB2('q8', 'Damit wäre ich einverstanden, wenn Sie mir das noch schriftlich bestätigen.',
          '„Einverstanden“ wird auf der ersten Silbe betont: EIN-ver-stan-den. „Schriftlich“ beginnt mit „schr“, also mit „sch“ wie im Französischen « ch ». Sprechen Sie ruhig und freundlich: Sie nehmen ein Angebot an. [fr?] « einverstanden » : accent sur EIN-.'),
      ] },

    // 3 · Médiation : résumer des conditions générales
    { id: 'b2-wirtschaft-atelier-mediation', kind: 'exercise', title: 'Vermitteln: Geschäftsbedingungen einfach erklären', estimatedMinutes: 15,
      competences: ['lecture', 'expression-ecrite'],
      lesson: { description: `SITUATION
[fr?] La situation
${aide('Sie arbeiten in einem Fahrradladen, der E-Bikes im Abo anbietet. Herr Quaye, 67, möchte ein E-Bike für seine Fahrten zum Markt und in seinen Garten abonnieren. Er hat die Geschäftsbedingungen gelesen und versteht sie nicht. Außerdem erzählt er: „Beim Bäcker lasse ich das Rad manchmal kurz unabgeschlossen stehen.“', 'Vous travaillez dans un magasin qui propose des vélos électriques en abonnement. M. Quaye, 67 ans, voudrait en louer un. Il n’a pas compris les conditions générales et raconte qu’il laisse parfois le vélo sans cadenas devant la boulangerie.')}

ALLGEMEINE GESCHÄFTSBEDINGUNGEN (AUSZUG): E-BIKE-ABO
§ 3 Laufzeit und Kündigung
(1) Der Vertrag wird für eine Mindestlaufzeit von sechs Monaten geschlossen. (2) Nach Ablauf der Mindestlaufzeit verlängert er sich auf unbestimmte Zeit und kann jederzeit mit einer Frist von einem Monat gekündigt werden. (3) Die Kündigung bedarf der Textform; eine E-Mail genügt. Alternativ kann der Vertrag über die Schaltfläche „Vertrag kündigen“ im Kundenkonto gekündigt werden.
§ 5 Wartung und Reparaturen
(1) Verschleißbedingte Reparaturen sowie eine jährliche Inspektion sind in der monatlichen Gebühr enthalten. (2) Schäden, die durch unsachgemäße Nutzung oder einen vom Kunden verschuldeten Unfall entstehen, trägt der Kunde bis zu einem Betrag von 150 Euro je Schadensfall.
§ 6 Diebstahl
(1) Ein Diebstahl ist unverzüglich, spätestens jedoch innerhalb von 48 Stunden, bei der Polizei anzuzeigen; die Anzeige ist dem Anbieter vorzulegen. (2) War das Fahrrad mit dem mitgelieferten Schloss an einem festen Gegenstand angeschlossen, beträgt die Selbstbeteiligung des Kunden 100 Euro. Andernfalls haftet der Kunde für den Zeitwert des Fahrrads.
§ 8 Rückgabe
Bei Vertragsende ist das Fahrrad innerhalb von sieben Tagen in einer Filiale zurückzugeben. Für jeden Tag der Verspätung wird eine Gebühr von 5 Euro berechnet.

AUFGABE
[fr?] Votre tâche
${aide('Fassen Sie die Bedingungen für Herrn Quaye zusammen: kurz, in einfachen Worten, mit „Sie“, und mit dem, was für ihn besonders wichtig ist.', 'Résumez les conditions pour M. Quaye : brièvement, simplement, en le vouvoyant, en insistant sur ce qui compte pour lui.')}
TIPP
[fr?] Conseil
${aide('Juristische Texte verwenden viele Nomen und Passivformen („ist anzuzeigen“). Machen Sie daraus aktive Sätze mit „Sie“: „Sie müssen den Diebstahl bei der Polizei melden.“', 'Les textes juridiques emploient beaucoup de noms et de passifs : transformez-les en phrases actives avec « Sie ».')}` },
      placements: [{ media: 'b2-wirtschaft-atelier-mediation-agb', caption: 'E-Bike-Abo: AGB (Auszug)' }],
      questions: [
        fill('q1', aide('Machen Sie Notizen für Herrn Quaye. Ergänzen Sie.', 'Prenez des notes pour M. Quaye. Complétez.'),
          'Mindestens [[1]] Monate · danach jederzeit kündbar, Frist: [[2]] Monat · Kündigung per [[3]] oder im Kundenkonto · Reparaturen wegen Verschleiß: [[4]] · Unfall, selbst verschuldet: höchstens [[5]] Euro pro Schaden',
          [['6', 'sechs'], ['1', 'ein', 'einen'], ['E-Mail', 'Mail', 'Email'], ['kostenlos', 'inklusive', 'gratis', 'in der Gebühr enthalten', 'enthalten'], ['150', 'hundertfünfzig']],
          '§ 3: sechs Monate Mindestlaufzeit, danach eine Kündigungsfrist von einem Monat; „Textform“ heißt hier: Eine E-Mail genügt. § 5: Verschleißreparaturen sind „in der monatlichen Gebühr enthalten“, selbst verschuldete Schäden kosten den Kunden höchstens 150 Euro pro Fall. [fr?] Textform = par écrit, un courriel suffit.'),
        choice('q2', aide('Herr Quaye fragt: „Und wenn mir das Rad gestohlen wird?“ Was antworten Sie?', 'M. Quaye demande ce qui se passe en cas de vol. Que répondez-vous ?'),
          [['Melden Sie den Diebstahl in zwei Tagen nur bei uns, nicht bei der Polizei; Sie zahlen 100 Euro.'],
            ['Bei Diebstahl zahlen Sie nichts, denn das Rad gehört uns und ist bei uns versichert.'],
            ['Zeigen Sie den Diebstahl in zwei Tagen bei der Polizei an. War das Rad angeschlossen: 100 Euro.', true],
            ['Sie zahlen immer den ganzen Wert des Rads, egal ob es abgeschlossen war oder nicht.']],
          '§ 6 verlangt eine Anzeige „bei der Polizei“ innerhalb von 48 Stunden, also zwei Tagen. Die Selbstbeteiligung von 100 Euro gilt nur, wenn das Rad mit dem Schloss an einem festen Gegenstand angeschlossen war, sonst zahlt der Kunde den Zeitwert. [fr?] Plainte à la police sous 48 heures ; franchise de 100 euros seulement si le vélo était attaché.'),
        choice('q3', aide('Was ist für Herrn Quaye besonders wichtig zu wissen?', 'Qu’est-ce que M. Quaye doit tout particulièrement savoir ?'),
          [['dass das Rad nach sieben Tagen in eine Filiale gebracht werden muss'],
            ['dass er unabgeschlossen bei Diebstahl den ganzen Zeitwert des Rads zahlen muss', true],
            ['dass die jährliche Inspektion schon in der Monatsgebühr enthalten ist'],
            ['dass er den Vertrag später auch über eine Schaltfläche im Kundenkonto kündigen kann']],
          'Herr Quaye lässt das Rad beim Bäcker „manchmal kurz unabgeschlossen stehen“. Genau dann gilt § 6 (2), Satz 2: „Andernfalls haftet der Kunde für den Zeitwert.“ Beim Vermitteln wählen Sie die Information, die für diese Person ein echtes Risiko bedeutet. [fr?] Son habitude le rend responsable de la valeur du vélo en cas de vol.'),
        order('q4', aide('Erklären Sie § 8 einfach: Bilden Sie den Satz.', 'Expliquez simplement le § 8 : remettez les mots dans l’ordre.'),
          [['Wenn', 'Sie', 'das Rad', 'zu spät', 'zurückgeben,', 'zahlen', 'Sie', 'fünf Euro', 'pro Tag.']],
          'Aus „Für jeden Tag der Verspätung wird eine Gebühr von 5 Euro berechnet“ (Passiv, Nominalstil) wird ein aktiver Satz mit „Sie“: Nebensatz mit „wenn“ und Verb am Ende, dann Hauptsatz mit dem Verb zuerst. [fr?] Du style juridique à une phrase active et simple.'),
        fill('q5', aide('Erklären Sie die schwierigen Wörter. Ergänzen Sie.', 'Expliquez les mots difficiles. Complétez.'),
          '„Unverzüglich“ heißt: [[1]]. · Die „Selbstbeteiligung“ ist der Betrag, den Sie [[2]] bezahlen müssen. · Der „Zeitwert“ ist das, was das Rad [[3]] noch wert ist.',
          [['sofort', 'so schnell wie möglich', 'ohne Verzögerung'], ['selbst'], ['jetzt', 'heute', 'im Moment', 'aktuell', 'zu diesem Zeitpunkt']],
          '„Unverzüglich“ ist Behördensprache für „sofort, ohne schuldhaftes Zögern“. Die „Selbstbeteiligung“ ist der Teil des Schadens, den Sie selbst tragen. Der „Zeitwert“ ist der heutige Wert eines gebrauchten Gegenstands, also weniger als der Neupreis. [fr?] immédiatement ; la franchise ; la valeur actuelle (vétusté déduite).'),
        choice('q6', aide('Wie beginnen Sie Ihre Erklärung für Herrn Quaye am besten?', 'Comment commencer au mieux votre explication pour M. Quaye ?'),
          [['Gemäß § 3 Absatz 2 verlängert sich der Vertrag auf unbestimmte Zeit.'],
            ['Die Bedingungen sind kompliziert, aber die liest sowieso fast niemand.'],
            ['Unterschreiben Sie am besten einfach, dann sehen wir später weiter.'],
            ['Ich fasse Ihnen die wichtigsten Punkte kurz zusammen, fragen Sie gern nach.', true]],
          'Eine gute Vermittlung kündigt an, was kommt, und lädt zu Rückfragen ein. Paragrafen zu zitieren hilft Herrn Quaye nicht; die anderen Antworten nehmen ihn nicht ernst oder sind sogar unseriös. [fr?] Annoncer un résumé et inviter aux questions.'),
      ] },

    // 4 · Erreurs typiques
    { id: 'b2-wirtschaft-atelier-korrektur', kind: 'exercise', title: 'Korrigieren: typische Fehler in formellen Briefen', estimatedMinutes: 10,
      competences: ['lecture', 'expression-ecrite'],
      lesson: { description: `${aide('Diese Sätze stammen aus Reklamationen von Kursteilnehmenden. Finden Sie jeweils die richtige Form.', 'Ces phrases viennent de réclamations écrites par des apprenants. Trouvez chaque fois la forme correcte.')}

KORREKTURZEICHEN
[fr?] Les codes de correction
${aide('St (Wortstellung), G (Grammatik), W (Wortschatz), R (Rechtschreibung), A (Register: du oder Sie). Jede Frage übt eines davon.', 'Place des mots, grammaire, vocabulaire, orthographe, registre : chaque question en travaille un.')}` },
      questions: [
        fill('q1', aide('G: Ergänzen Sie die Präposition oder das Pronominaladverb.', 'G : complétez avec la préposition ou le pronom adverbial.'),
          'Ich bin [[1]] Ihrem Service sehr enttäuscht. · Mit Ihrem Vorschlag bin ich nicht einverstanden, und ich bin auch nicht [[2]] einverstanden, dass Sie die Frist verlängern. · Sie sind [[3]] den Schaden verantwortlich.',
          [['von'], ['damit'], ['für']],
          'enttäuscht von + Dativ (bei Personen und Firmen); einverstanden mit → vor einem Nebensatz „damit einverstanden, dass …“; verantwortlich für + Akkusativ. Das französische « de » entspricht hier nicht immer „von“. [fr?] déçu par, d’accord pour que, responsable de.'),
        choice('q2', aide('A: Welcher Satz passt in eine formelle Reklamation?', 'A : quelle phrase convient dans une réclamation formelle ?'),
          [['Ihr habt mir echt ein kaputtes Gerät geschickt, das geht gar nicht!'],
            ['Ich fordere Sie hiermit auf, mir den Betrag bis zum 15. März zu erstatten.', true],
            ['Wäre total nett, wenn ihr mir das Geld irgendwann zurückgebt.'],
            ['Sie müssen mir sofort das Geld geben, sonst passiert was!']],
          'In einer Reklamation bleibt man beim „Sie“, nennt die Forderung klar und setzt eine genaue Frist: „Ich fordere Sie hiermit auf, … bis zum … zu …“. Die anderen Sätze duzen, sind zu vage („irgendwann“) oder drohen unbestimmt („sonst passiert was“). [fr?] Registre formel, demande claire, délai précis.'),
        hints(fill('q3', aide('G: Ergänzen Sie den irrealen Vergleich.', 'G : complétez la comparaison irréelle.'),
          'Der Mitarbeiter tat so, als ob er meine E-Mail nie [[1]] [[2]].',
          [['bekommen', 'erhalten'], ['hätte']],
          'Irrealer Vergleich in der Vergangenheit: als ob + Partizip II + „hätte“ am Ende. Er hat die E-Mail bekommen, tut aber so, als hätte er sie nicht bekommen. [fr?] « comme s’il n’avait jamais reçu mon courriel ».'),
        'bekommen', 'haben'),
        choice('q4', aide('W: Welches Verb passt? „Bitte … Sie mir den Kaufpreis.“', 'W : quel verbe convient ?'),
          [['erstellen'], ['bestatten'], ['erstatten', true], ['verstatten']],
          '„Erstatten“ heißt zurückzahlen: Bitte erstatten Sie mir den Kaufpreis. „Erstellen“ bedeutet herstellen oder anfertigen (eine Rechnung erstellen), „bestatten“ heißt beerdigen, „verstatten“ ist ein veraltetes Wort für erlauben. [fr?] erstatten = rembourser ; attention aux mots qui se ressemblent.'),
        fill('q5', aide('G: Ergänzen Sie die Präposition.', 'G : complétez avec la préposition.'),
          'Bitte überweisen Sie den Betrag [[1]] zum 20. Mai. · Ich habe das Gerät [[2]] drei Wochen bei Ihnen gekauft. · Die Rechnung lege ich diesem Schreiben [[3]] Anlage bei.',
          [['bis'], ['vor'], ['als']],
          '„Bis zum 20. Mai“ nennt die Frist. „Vor drei Wochen“ heißt: drei Wochen zurück in der Vergangenheit (nicht „seit“, das bis heute andauert). „Als Anlage“ ist eine feste Formulierung in Briefen. [fr?] bis = jusqu’au ; vor = il y a ; als Anlage = en pièce jointe.'),
        choice('q6', aide('St: Welcher Satz ist richtig?', 'St : quelle phrase est correcte ?'),
          [['Andernfalls ich sehe mich gezwungen, einen Anwalt einzuschalten.'],
            ['Andernfalls sehe ich mich gezwungen, einen Anwalt einzuschalten.', true],
            ['Andernfalls sehe ich mich gezwungen, einzuschalten einen Anwalt.'],
            ['Andernfalls sehe ich gezwungen mich, einen Anwalt einzuschalten.']],
          '„Andernfalls“ steht auf Position 1, das Verb folgt sofort („sehe“), dann Subjekt und Reflexivpronomen. In der Infinitivgruppe steht „einzuschalten“ am Ende. Die erste Antwort übernimmt die französische Wortstellung. [fr?] Verbe en deuxième position, infinitif avec zu à la fin.'),
        order('q7', C2.ordnen, [['Ich', 'bitte', 'Sie,', 'mir', 'den Betrag', 'bis', 'zum 20. Mai', 'zu erstatten.'],
          ['Ich', 'bitte', 'Sie,', 'mir', 'bis', 'zum 20. Mai', 'den Betrag', 'zu erstatten.']],
          'Nach „Ich bitte Sie“ folgt eine Infinitivgruppe mit „zu“: Dativ „mir“, Akkusativ „den Betrag“, Frist „bis zum 20. Mai“ (sie kann auch vor „den Betrag“ stehen) und „zu erstatten“ am Ende. [fr?] « Je vous prie de me rembourser la somme avant le 20 mai. »'),
      ] },

    // 5 · Entraînement au format : Hören (reportage)
    { id: 'b2-wirtschaft-atelier-pruefung', kind: 'exercise', title: 'Prüfungstraining: Hören, eine Reportage', estimatedMinutes: 22,
      competences: ['ecoute'],
      lesson: { description: `PRÜFUNGSTRAINING HÖREN
[fr?] Entraînement à l’examen : compréhension orale
${aide('Sie hören eine Radioreportage über ein Kaufhaus für gebrauchte Waren. Lösen Sie die Aufgaben 1 bis 9. Sie hören den Text zweimal.', 'Vous écoutez un reportage radio sur un grand magasin d’occasion. Faites les exercices 1 à 9. Vous entendez le document deux fois.')}
ZEIT
[fr?] Temps
${aide('Etwa 20 Minuten. Lesen Sie die Aufgaben vor dem ersten Hören eine Minute lang.', 'Environ 20 minutes. Lisez les questions pendant une minute avant la première écoute.')}

STRATEGIE
[fr?] Stratégie
1. ${aide('Vor dem Hören: Lesen Sie die Aufgaben und überlegen Sie, nach welchen Informationen Sie suchen (Zahlen, Meinungen, Pläne).', 'Avant l’écoute : lisez les questions et repérez ce que vous cherchez (chiffres, opinions, projets).')}
2. ${aide('Erstes Hören: Achten Sie auf die Personen. Wer spricht, und was ist seine oder ihre Rolle?', 'Première écoute : qui parle, et avec quel rôle ?')}
3. ${aide('Zweites Hören: Prüfen Sie Ihre Antworten. „Nicht gesagt“ wählen Sie nur, wenn die Reportage wirklich nichts dazu sagt.', 'Deuxième écoute : vérifiez. « nicht gesagt » seulement si le reportage n’en dit rien.')}` },
      placements: [{ media: 'b2-wirtschaft-atelier-pruefung-audio', caption: 'Reportage: das Kaufhaus „Zweites Leben“' }],
      questions: [
        rfh('q1', 'Das Kaufhaus wird von einer privaten Firma betrieben.', 'f',
          'Falsch: „Betrieben wird es von der Stadt zusammen mit einem gemeinnützigen Verein.“ Gemeinnützig heißt: nicht auf Gewinn ausgerichtet. [fr?] La ville et une association à but non lucratif.'),
        choice('q2', aide('2. Was passiert mit den Dingen vom Wertstoffhof?', '2. Que deviennent les objets de la déchetterie ?'),
          [['Sie werden sorgfältig sortiert und anschließend vollständig recycelt.'],
            ['Sie werden geprüft, wenn möglich repariert und dann verkauft.', true],
            ['Sie werden kostenlos an bedürftige Familien verschenkt.']],
          '„Unsere Mitarbeiter schauen sich alles an, reparieren, was sich reparieren lässt, und bringen es hierher“, also ins Kaufhaus, wo es verkauft wird. Die Preise sind niedrig, aber die Waren werden nicht verschenkt. [fr?] Contrôlés, réparés si possible, puis vendus.'),
        choice('q3', aide('3. Was ist Detlef Unruh neben dem Umweltschutz genauso wichtig?', '3. Qu’est-ce qui compte autant pour Detlef Unruh que l’environnement ?'),
          [['möglichst schnell einen hohen Gewinn für die Stadt zu erzielen'],
            ['neue Elektrogeräte zu besonders günstigen Preisen anzubieten'],
            ['Menschen, die lange arbeitslos waren, eine Chance zu geben', true]],
          'Zwölf der zwanzig Beschäftigten waren lange arbeitslos. Unruh sagt: „Das ist uns genauso wichtig wie die Umwelt“, und er ist stolz, dass zwei Kollegen in normale Betriebe gewechselt sind. [fr?] Donner une chance à des chômeurs de longue durée.'),
        rfh('q4', 'Tamina hat für den Schreibtisch und die zwei Stühle zusammen 41 Euro bezahlt.', 'r',
          'Richtig: Der Schreibtisch kostete 25 Euro, die zwei Stühle „je acht Euro“, also 16 Euro: zusammen 41 Euro. Bei Zahlen lohnt es sich, genau mitzurechnen; „je“ bedeutet „pro Stück“. [fr?] je = chacun : 25 + 2 × 8 = 41.'),
        choice('q5', aide('5. Wie reagiert Herr Lüdtke auf seinen kaputten Toaster?', '5. Comment M. Lüdtke réagit-il à son grille-pain en panne ?'),
          [['Er bekommt sein Geld zurück, zweifelt aber an gebrauchten Elektrogeräten.', true],
            ['Er ist wütend und will nie wieder im Kaufhaus „Zweites Leben“ einkaufen.'],
            ['Er lässt den Toaster in der Werkstatt des Kaufhauses kostenlos reparieren.']],
          '„Ich bekomme mein Geld zurück, das ist in Ordnung. Aber man fragt sich schon, ob man bei Elektrogeräten nicht lieber gleich etwas Neues kaufen sollte.“ Er ist skeptisch, aber nicht wütend, und von einer Reparatur ist nicht die Rede. [fr?] Remboursé, mais sceptique sur l’électroménager d’occasion.'),
        rfh('q6', 'Das Kaufhaus kommt im Moment noch nicht ohne Geld von der Stadt aus.', 'r',
          'Richtig: „Wirtschaftlich trägt sich das Kaufhaus noch nicht. Ohne den Zuschuss der Stadt würde das Geld für Miete und Löhne nicht reichen.“ „Sich tragen“ heißt: genug einnehmen, um die Kosten zu decken. [fr?] Il n’est pas encore rentable sans subvention.'),
        choice('q7', aide('7. Was plant das Kaufhaus ab dem Frühjahr?', '7. Que prévoit le magasin à partir du printemps ?'),
          [['eine zweite Filiale am Stadtrand von Holmsbrügge'],
            ['einen eigenen Onlineshop für gebrauchte Elektrogeräte und Möbel'],
            ['Kurse, in denen man lernt, Kleidung selbst zu flicken', true]],
          '„Ab dem Frühjahr bieten wir zum Beispiel Kurse an, in denen die Leute lernen, ihre Kleidung selbst zu flicken.“ Achten Sie auf das Futur II davor: „Bis dahin werden wir unser Angebot erweitert haben.“ [fr?] Des cours pour apprendre à raccommoder ses vêtements.'),
        rfh('q8', 'An der Kasse kann man auch defekte Geräte abgeben.', 'f',
          'Falsch: Man kann Sachen abgeben, „aber bitte nur, was noch funktioniert“. Defekte Geräte nimmt das Kaufhaus also nicht direkt an; sie kommen über den Wertstoffhof. [fr?] Seulement des objets qui fonctionnent encore.'),
        rfh('q9', 'Die meisten Kundinnen und Kunden des Kaufhauses sind Studierende.', 'n',
          'Nicht gesagt: Die Reportage stellt eine Studentin vor, Tamina, aber sie sagt nichts darüber, wer die meisten Kunden sind. Ein einzelnes Beispiel erlaubt keine allgemeine Aussage. [fr?] Un exemple ne permet pas de généraliser.'),
      ] },

    // 6 · Mission écrite
    { id: 'b2-wirtschaft-atelier-schreiben', kind: 'mission', title: 'Mission: eine ausführliche Reklamation schreiben', estimatedMinutes: 27,
      competences: ['expression-ecrite'],
      lesson: { description: `SITUATION
[fr?] La situation
${aide('Vor sieben Wochen haben Sie in einem Onlineshop für Outdoorausrüstung Wanderschuhe für 139 Euro gekauft (Bestellnummer 20931). Es gibt zwei Probleme:', 'Il y a sept semaines, vous avez acheté des chaussures de randonnée à 139 euros dans une boutique en ligne (commande 20931). Il y a deux problèmes :')}
1. ${aide('Nach zwei Wochen hat sich an einem Schuh die Sohle gelöst.', 'Au bout de deux semaines, la semelle d’une chaussure s’est décollée.')}
2. ${aide('Beim Bezahlen war das Kästchen „Premium-Mitgliedschaft: 30 Tage gratis, danach 4,99 Euro pro Monat“ schon angekreuzt. Seitdem wurden zweimal 4,99 Euro abgebucht.', 'Lors du paiement, la case « abonnement premium » était déjà cochée ; 4,99 euros ont été prélevés deux fois.')}
${aide('Ihre E-Mail an den Kundenservice vor zehn Tagen ist bis heute ohne Antwort geblieben.', 'Votre courriel au service client, il y a dix jours, est resté sans réponse.')}

SO GEHEN SIE VOR
[fr?] Démarche
1. ${aide('Planen (7 Minuten): Ordnen Sie die Fakten zeitlich und überlegen Sie sich, was Sie genau fordern und bis wann.', 'Planifier (7 minutes) : classez les faits dans l’ordre et décidez ce que vous demandez, et pour quand.')}
2. ${aide('Schreiben (15 Minuten): Folgen Sie dem Aufbau aus dem Modell von Selma Yildirim.', 'Écrire (15 minutes) : suivez la structure du modèle de Selma Yildirim.')}
3. ${aide('Prüfen (5 Minuten): Lesen Sie Ihren Text mit der Checkliste. Achten Sie auf Daten, Beträge und auf das „Sie“.', 'Vérifier (5 minutes) : relisez avec la liste ; attention aux dates, aux montants et au vouvoiement.')}` },
      mission: {
        oral: null,
        written: { prompt: aide('Schreiben Sie eine formelle Reklamation an den Onlineshop (180 bis 250 Wörter). Schildern Sie beide Probleme mit Daten und Beträgen, fordern Sie eine Lösung für die Schuhe und die Rückzahlung der Abbuchungen, setzen Sie eine Frist und nennen Sie die Konsequenz, falls niemand reagiert.',
          'Écrivez une réclamation formelle à la boutique en ligne (180 à 250 mots) : exposez les deux problèmes avec dates et montants, demandez une solution pour les chaussures et le remboursement des prélèvements, fixez un délai et annoncez la conséquence en l’absence de réponse.'),
          maxChars: 2400, minWords: 170 },
        checklist: [
          aide('Betreff mit Bestellnummer, formelle Anrede und Grußformel', 'Objet avec numéro de commande, formules formelles'),
          aide('Beide Probleme sind klar und zeitlich geordnet geschildert.', 'Les deux problèmes sont exposés clairement et dans l’ordre.'),
          aide('Genaue Forderungen: Umtausch oder Erstattung, 9,98 Euro zurück, Kündigung', 'Demandes précises : échange ou remboursement, 9,98 €, résiliation'),
          aide('Frist und Konsequenz („bis spätestens …“, „Andernfalls …“)', 'Un délai et une conséquence'),
          aide('Ton: bestimmt, aber höflich; kein Duzen, keine Drohung ohne Inhalt', 'Ton ferme mais poli ; pas de tutoiement ni de menace vague'),
        ],
        criteria: [
          { ...GRIDS.b2.schreiben[0], label: aide('Aufgabe: beide Probleme mit Fakten, genaue Forderungen, Frist und Konsequenz; formell', 'Tâche : les deux problèmes, demandes précises, délai, conséquence ; registre formel') },
          ...GRIDS.b2.schreiben.slice(1),
        ],
      } },

    // 7 · Mission orale
    { id: 'b2-wirtschaft-atelier-sprechen', kind: 'mission', title: 'Mission: am Telefon eine Lösung aushandeln', estimatedMinutes: 20,
      competences: ['expression-orale'],
      lesson: { description: `SITUATION
[fr?] La situation
${aide('Ihre Waschmaschine ist acht Monate alt und läuft nicht mehr. Sie haben zwei kleine Kinder und brauchen die Maschine dringend. Sie rufen beim Händler an. Herr Brockmann vom Kundenservice bietet Ihnen zuerst einen Techniker in vier Wochen und dann einen Gutschein über 30 Euro für einen Waschsalon an.', 'Votre lave-linge a huit mois et ne fonctionne plus. Avec deux jeunes enfants, vous en avez besoin d’urgence. M. Brockmann, du service client, vous propose d’abord un technicien dans quatre semaines, puis un bon de 30 euros pour une laverie.')}

AUFGABE
[fr?] Votre tâche
${aide('Hören Sie zuerst, was Herr Brockmann sagt. Nehmen Sie dann Ihre Seite des Gesprächs auf, so als würden Sie direkt mit ihm sprechen.', 'Écoutez d’abord M. Brockmann. Enregistrez ensuite votre partie de la conversation, comme si vous lui parliez directement.')}
1. ${aide('Das Problem schildern: Gerät, Alter, Ihre Situation', 'Exposer le problème : appareil, âge, situation')}
2. ${aide('Den Termin in vier Wochen höflich ablehnen und begründen', 'Refuser poliment le rendez-vous dans quatre semaines, en justifiant')}
3. ${aide('Den Gutschein ablehnen und einen Gegenvorschlag machen (früherer Termin, Leihgerät, Kostenübernahme …)', 'Refuser le bon et faire une contre-proposition')}
4. ${aide('Einen Kompromiss annehmen und um eine schriftliche Bestätigung bitten', 'Accepter un compromis et demander une confirmation écrite')}

VORBEREITUNG
[fr?] Préparation
${aide('Überlegen Sie sich fünf Minuten lang Stichwörter und zwei Vorschläge im Konjunktiv II („Wäre es möglich, …?“, „Ich könnte mir vorstellen, …“).', 'Préparez pendant cinq minutes des mots-clés et deux propositions au Konjunktiv II.')}` },
      placements: [{ media: 'b2-wirtschaft-atelier-sprechen-audio', caption: 'Herr Brockmann vom Kundenservice', transcriptVisibility: 'on_demand' }],
      mission: {
        oral: { prompt: aide('Sprechen Sie Ihre Seite des Telefongesprächs (zwei bis drei Minuten): Schildern Sie das Problem, lehnen Sie die beiden Angebote höflich ab, machen Sie einen begründeten Gegenvorschlag, nehmen Sie einen Kompromiss an und bitten Sie um eine schriftliche Bestätigung.',
          'Enregistrez votre partie de l’appel (deux à trois minutes) : exposez le problème, refusez poliment les deux offres, faites une contre-proposition justifiée, acceptez un compromis et demandez une confirmation écrite.'),
          maxSeconds: 180 },
        written: null,
        checklist: [
          aide('Ich schildere das Problem kurz und genau.', 'J’expose le problème brièvement et précisément.'),
          aide('Ich lehne die Angebote höflich und mit Begründung ab.', 'Je refuse les offres poliment, en justifiant.'),
          aide('Ich mache einen Gegenvorschlag im Konjunktiv II.', 'Je fais une contre-proposition au Konjunktiv II.'),
          aide('Ich nehme einen Kompromiss an und bitte um eine schriftliche Bestätigung.', 'J’accepte un compromis et demande une confirmation écrite.'),
        ],
        criteria: [
          { ...GRIDS.b2.sprechen[0], label: aide('Aufgabe: Problem, zwei Ablehnungen, Gegenvorschlag, Kompromiss und Bestätigung in zwei bis drei Minuten', 'Tâche : problème, refus, contre-proposition, compromis, confirmation') },
          ...GRIDS.b2.sprechen.slice(1),
        ],
      } },

    // 8 · Faire le point
    { id: 'b2-wirtschaft-atelier-bilan', kind: 'lesson', title: 'Bilanz: Konsum, Reklamation und Verhandlung', estimatedMinutes: 6,
      competences: ['lecture'],
      lesson: { description: `${aide('Lesen Sie die Ziele der beiden Module „Wirtschaft“. Was können Sie schon gut? Was möchten Sie noch üben?', 'Relisez les objectifs des deux modules « Wirtschaft ». Que savez-vous déjà bien faire ? Que voulez-vous encore travailler ?')}

ICH KANN …
[fr?] Je peux…
• ${aide('Ich kann Werbeversprechen kritisch lesen und beschreiben, was nur so aussieht, als ob …', 'Je peux lire la publicité d’un œil critique et décrire une apparence trompeuse.')}
• ${aide('Ich kann eine ausführliche, formelle Reklamation mit Forderung und Frist schreiben.', 'Je peux écrire une réclamation formelle détaillée, avec demande et délai.')}
• ${aide('Ich kann am Telefon höflich, aber bestimmt eine Lösung aushandeln.', 'Je peux négocier une solution au téléphone, poliment mais fermement.')}
• ${aide('Ich kann Geschäftsbedingungen für eine andere Person einfach zusammenfassen.', 'Je peux résumer simplement des conditions générales pour quelqu’un.')}
• ${aide('Ich kann einer Radioreportage Fakten, Meinungen und Pläne entnehmen.', 'Je peux tirer d’un reportage radio des faits, des opinions et des projets.')}

STRATEGIEN
[fr?] Stratégies
• ${aide('Reklamieren: Fakten mit Daten, klare Forderung, Frist, Konsequenz, versöhnlicher Schluss.', 'Réclamer : faits datés, demande claire, délai, conséquence, conclusion conciliante.')}
• ${aide('Verhandeln: ablehnen, begründen, im Konjunktiv II vorschlagen, Einigung schriftlich bestätigen lassen.', 'Négocier : refuser, justifier, proposer au Konjunktiv II, faire confirmer par écrit.')}
• ${aide('Vermitteln: Passiv und Nominalstil in aktive Sätze mit „Sie“ übersetzen.', 'Médiation : transformer passifs et noms en phrases actives avec « Sie ».')}

NOCH NICHT SICHER?
[fr?] Pas encore sûr ?
${aide('Irreale Vergleiche und Adjektive mit Präposition: Wiederholen Sie die Regel und die Übungen im Modul „Wirtschaft“. Formulierungen für Reklamationen: Lesen Sie das Modell von Selma Yildirim noch einmal. Verhandeln: Sprechen Sie die vier Sätze aus „Diskutieren“ noch einmal nach.', 'Revoyez la règle et les exercices du module « Wirtschaft », relisez le modèle de réclamation et répétez les phrases de négociation.')}` } },
  ],
};
