// Module B1 n° 10 · atelier « Gesundheit » (lot R2). Organiser un rendez-vous et donner des conseils : modèles annotés
// (message formel court au cabinet, message vocal de conseils), réagir au téléphone avec le cabinet, médiation (retenir
// pour une voisine âgée ce qui compte dans une lettre du cabinet), erreurs typiques, entraînement au format Hören
// (conversation longue, richtig / falsch), deux missions sur grille.
// Reprise réécrite du brouillon B1 V1 (content/b1-v1/source/partie1-suite.mjs › b1-gesundheit) : tâches « Demander un
// autre créneau et une confirmation » et « Clarifier une consigne et confirmer un nouveau rendez-vous ».
import { C, bi, choice, fill, order, speak, GRIDS } from '../../lib.mjs';

/** Indices affichés sous les trous d'un fill (forme de base à transformer). */
const hints = (question, ...values) => ({ ...question,
  blanks: question.blanks.map((blank, index) => (values[index] ? { ...blank, hint: values[index] } : blank)) });
/** « Richtig / falsch / nicht gesagt » pour une écoute : r, f ou n pour la bonne réponse. */
const rfHoeren = (id, statement, answer, explanation) => choice(id, `„${statement}“ ${bi('Richtig, falsch oder nicht gesagt?', 'Vrai, faux ou non dit ?')}`,
  [['richtig', answer === 'r'], ['falsch', answer === 'f'], ['nicht gesagt', answer === 'n']], explanation);

export default {
  id: 'b1-gesundheit-atelier',
  title: 'Gesundheit, atelier : organiser un rendez-vous et donner des conseils',
  objective: 'Écrire un message formel court pour déplacer un rendez-vous et demander une attestation, conseiller un ami à l’oral, relayer les consignes d’un cabinet pour une proche et s’entraîner à comprendre une longue conversation.',
  grammarFocus: [],
  sources: [
    'Textes, dialogues et exercices originaux LinguaCap. Situations fictives : les conseils de santé restent généraux et ne remplacent pas un avis médical.',
    'Situations reprises et réécrites du brouillon B1 V1 (LinguaCap) : déplacer un rendez-vous, demander une confirmation au secrétariat.',
  ],

  vocabulary: [
    { word: 'einen Termin verschieben', partOfSpeech: 'expression', translation: 'déplacer un rendez-vous',
      example: 'Ich möchte meinen Termin am Dienstag verschieben.', note: 'auf + accusatif : auf Donnerstag verschieben' },
    { word: 'einen Termin absagen', partOfSpeech: 'expression', translation: 'annuler un rendez-vous',
      example: 'Wenn Sie nicht kommen können, sagen Sie den Termin bitte rechtzeitig ab.', note: 'séparable : ab|sagen' },
    { word: 'einen Termin wahrnehmen', partOfSpeech: 'expression', translation: 'se rendre à un rendez-vous (formel)',
      example: 'Leider kann ich den Termin am Montag nicht wahrnehmen.', note: 'séparable : wahr|nehmen' },
    { word: 'Wäre es möglich, … zu …?', partOfSpeech: 'expression', translation: 'Serait-il possible de … ?',
      example: 'Wäre es möglich, den Termin auf Donnerstag zu verschieben?', note: 'infinitif avec zu à la fin' },
    { word: 'eine Bescheinigung ausstellen', partOfSpeech: 'expression', translation: 'établir une attestation',
      example: 'Könnten Sie mir eine Bescheinigung für meinen Arbeitgeber ausstellen?', note: 'die Bescheinigung : l’attestation' },
    { word: 'Ich bitte Sie um …', partOfSpeech: 'expression', translation: 'Je vous prie de bien vouloir m’envoyer … / Je vous demande …',
      example: 'Ich bitte Sie um eine kurze Bestätigung per E-Mail.', note: 'bitten um + accusatif' },
    { word: 'Vielen Dank für Ihr Verständnis.', partOfSpeech: 'expression', translation: 'Merci de votre compréhension.',
      example: 'Vielen Dank für Ihr Verständnis und freundliche Grüße.', note: null },
    { word: 'Das tut mir leid.', partOfSpeech: 'expression', translation: 'Je suis désolé(e).',
      example: 'Du schläfst schlecht? Das tut mir wirklich leid.', note: null },
    { word: 'Du solltest …', partOfSpeech: 'expression', translation: 'Tu devrais …',
      example: 'Du solltest abends nicht so lange am Handy sein.', note: 'infinitif à la fin' },
    { word: 'An deiner Stelle würde ich …', partOfSpeech: 'expression', translation: 'À ta place, je …',
      example: 'An deiner Stelle würde ich nach drei Uhr keinen Kaffee mehr trinken.', note: null },
    { word: 'Wie wäre es, wenn du …?', partOfSpeech: 'expression', translation: 'Et si tu … ?',
      example: 'Wie wäre es, wenn du nach der Arbeit spazieren gehst?', note: 'verbe à la fin après wenn' },
    { word: 'Es hilft, wenn …', partOfSpeech: 'expression', translation: 'Ça aide si …',
      example: 'Es hilft, wenn man jeden Tag zur gleichen Zeit ins Bett geht.', note: null },
    { word: 'Ich mache mir Sorgen um dich.', partOfSpeech: 'expression', translation: 'Je m’inquiète pour toi.',
      example: 'Du arbeitest so viel, ich mache mir Sorgen um dich.', note: 'sich Sorgen machen um + accusatif' },
    { word: 'Gute Besserung!', partOfSpeech: 'expression', translation: 'Bon rétablissement !',
      example: 'Gute Besserung und melde dich bald!', note: null },
    { word: 'Pass gut auf dich auf!', partOfSpeech: 'expression', translation: 'Prends bien soin de toi !',
      example: 'Bis bald, und pass gut auf dich auf!', note: 'séparable : auf|passen' },
  ],

  media: [
    { key: 'b1-gesundheit-atelier-modell-audio', kind: 'audio', title: 'Modèle : un message vocal pour conseiller un ami',
      script: [
        { voice: 'frau3', name: 'Lena', text: 'Hallo Jonas, ich habe deine Nachricht gehört. Du schläfst seit Wochen schlecht? Das tut mir wirklich leid. Ich habe ein paar Tipps für dich.' },
        { voice: 'frau3', name: 'Lena', text: 'Erstens: Du solltest abends nicht so lange am Handy sein. Ich lege mein Handy immer um zehn Uhr weg, und seitdem schlafe ich viel besser.' },
        { voice: 'frau3', name: 'Lena', text: 'Zweitens: Wie wäre es, wenn du nach der Arbeit einen Spaziergang machst? Bewegung hilft wirklich. Und drittens: An deiner Stelle würde ich nach drei Uhr keinen Kaffee mehr trinken.' },
        { voice: 'frau3', name: 'Lena', text: 'Wenn das alles nicht hilft, solltest du mal mit deinem Hausarzt sprechen. Wenn du willst, gehen wir am Samstag zusammen spazieren. Gute Besserung und melde dich!' },
      ] },
    { key: 'b1-gesundheit-atelier-interaktion-satz1', kind: 'audio', title: 'Au cabinet : réplique 1',
      script: [{ voice: 'mann3', name: 'Herr Kühn', text: 'Praxis Doktor Albers, Kühn am Apparat. Was kann ich für Sie tun?' }] },
    { key: 'b1-gesundheit-atelier-interaktion-satz2', kind: 'audio', title: 'Au cabinet : réplique 2',
      script: [{ voice: 'mann3', name: 'Herr Kühn', text: 'Waren Sie schon einmal bei uns in der Praxis?' }] },
    { key: 'b1-gesundheit-atelier-interaktion-satz3', kind: 'audio', title: 'Au cabinet : réplique 3',
      script: [{ voice: 'mann3', name: 'Herr Kühn', text: 'Morgen um acht Uhr fünfzehn hätten wir noch etwas frei.' }] },
    { key: 'b1-gesundheit-atelier-interaktion-satz4', kind: 'audio', title: 'Au cabinet : réplique 4',
      script: [{ voice: 'mann3', name: 'Herr Kühn', text: 'Gut, dann trage ich Sie für Donnerstag um zehn Uhr ein. Bringen Sie bitte Ihre Versichertenkarte und die Überweisung mit.' }] },
    { key: 'b1-gesundheit-atelier-mediation-brief', kind: 'image', title: 'Lettre du cabinet à Mme Petrova',
      alt: 'Lettre du cabinet du Dr Albers à Mme Petrova : prise de sang à jeun le lundi 14 octobre à 7 h 45, résultats le jeudi 17 octobre à 10 h 30.',
      image: { layout: 'document', icon: 'stethoscope', title: 'Praxis Dr. Albers', subtitle: 'Allgemeinmedizin · Gartenweg 5',
        intro: ['Sehr geehrte Frau Petrova,'],
        lines: ['wie besprochen haben wir für Sie einen Termin zur Blutabnahme vereinbart: am Montag, dem 14. Oktober, um 7:45 Uhr. Bitte kommen Sie nüchtern. Das heißt: Ab 22 Uhr am Abend vorher dürfen Sie nichts mehr essen. Wasser und ungesüßten Tee dürfen Sie trinken.', 'Ihre Tabletten gegen Bluthochdruck nehmen Sie bitte wie gewohnt am Morgen ein. Bringen Sie Ihre Versichertenkarte und Ihren aktuellen Medikamentenplan mit.', 'Die Ergebnisse bespricht Frau Doktor Albers mit Ihnen am Donnerstag, dem 17. Oktober, um 10:30 Uhr. Falls Sie einen der beiden Termine nicht wahrnehmen können, rufen Sie uns bitte spätestens am Vortag an.', 'Unsere Praxis ist barrierefrei. Den Aufzug finden Sie links neben dem Eingang.'],
        footer: 'Mit freundlichen Grüßen · Ihr Praxisteam Dr. Albers' } },
    { key: 'b1-gesundheit-atelier-pruefung-audio', kind: 'audio', title: 'Une conversation dans la cuisine du bureau',
      script: [
        { voice: 'frau', name: 'Aylin', text: 'Sven, du gehst ja ganz komisch. Was ist denn los?' },
        { voice: 'mann', name: 'Sven', text: 'Ach, mein Rücken. Seit dem Umzug letzte Woche tut er mir weh. Ich habe zu viele schwere Kisten getragen.' },
        { voice: 'frau', name: 'Aylin', text: 'Oje. Warst du schon beim Arzt?' },
        { voice: 'mann', name: 'Sven', text: 'Ja, gestern. Eigentlich wollte ich nicht gehen, aber meine Frau hat gesagt, ich soll nicht so stur sein. Die Ärztin meint, es ist nur eine Verspannung, nichts Schlimmes.' },
        { voice: 'frau', name: 'Aylin', text: 'Zum Glück. Hat sie dich krankgeschrieben?' },
        { voice: 'mann', name: 'Sven', text: 'Nein, arbeiten kann ich ja, ich soll nur nichts Schweres heben. Sie hat mir Physiotherapie verschrieben, sechs Termine. Der erste ist am Montag.' },
        { voice: 'frau', name: 'Aylin', text: 'Das ist gut. Ich hatte vor zwei Jahren auch Probleme mit dem Rücken, wegen der Arbeit am Computer. Die Physiotherapeutin hat mir ein paar Übungen gezeigt. Wenn ich sie jeden Morgen mache, habe ich keine Schmerzen.' },
        { voice: 'mann', name: 'Sven', text: 'Jeden Morgen? Dafür habe ich keine Zeit. Ich stehe sowieso schon um sechs auf.' },
        { voice: 'frau', name: 'Aylin', text: 'Die Übungen dauern nur zehn Minuten! Und du solltest dich auch mehr bewegen. Ich laufe zweimal pro Woche mit einer Gruppe im Stadtpark. Komm doch mal mit!' },
        { voice: 'mann', name: 'Sven', text: 'Laufen? Mit meinem Rücken? Das ist im Moment keine gute Idee.' },
        { voice: 'frau', name: 'Aylin', text: 'Nicht jetzt, natürlich. Aber wenn es dir wieder besser geht. Wir laufen ganz langsam, und es sind auch Anfänger dabei. Wir treffen uns dienstags und freitags um halb sieben.' },
        { voice: 'mann', name: 'Sven', text: 'Morgens?' },
        { voice: 'frau', name: 'Aylin', text: 'Nein, abends, nach der Arbeit.' },
        { voice: 'mann', name: 'Sven', text: 'Hm. Freitags geht bei mir nicht, da spiele ich mit meinem Sohn Fußball. Aber dienstags könnte ich vielleicht.' },
        { voice: 'frau', name: 'Aylin', text: 'Super. Und noch ein Tipp: Du solltest dir einen besseren Bürostuhl besorgen. Die Firma bezahlt das, wenn du einen Antrag stellst. Frag einfach Frau Kaiser in der Personalabteilung.' },
        { voice: 'mann', name: 'Sven', text: 'Echt? Das wusste ich nicht. Dann schreibe ich ihr heute noch eine E-Mail.' },
        { voice: 'frau', name: 'Aylin', text: 'Mach das. Und gute Besserung!' },
      ] },
    { key: 'b1-gesundheit-atelier-sprechen-nachricht', kind: 'audio', title: 'Le message vocal de Jonas',
      script: [
        { voice: 'mann2', name: 'Jonas', text: 'Hallo, hier ist Jonas. Du, mir geht es gerade nicht so gut. Ich bin total gestresst bei der Arbeit, und ich schlafe seit Wochen schlecht.' },
        { voice: 'mann2', name: 'Jonas', text: 'Mittags esse ich meistens nur schnell eine Pizza am Schreibtisch, und für Sport habe ich überhaupt keine Zeit. Abends sitze ich dann müde vor dem Fernseher.' },
        { voice: 'mann2', name: 'Jonas', text: 'Hast du vielleicht ein paar Tipps für mich? Melde dich mal!' },
      ] },
  ],

  activities: [
    // 1 · Modèle annoté
    { id: 'b1-gesundheit-atelier-modell', kind: 'lesson', title: 'Modèle : un message au cabinet et des conseils à un ami', estimatedMinutes: 12,
      competences: ['lecture', 'ecoute'],
      lesson: { description: `MODELL: EINEN TERMIN VERSCHIEBEN
[fr] Modèle : déplacer un rendez-vous
${bi('Lesen Sie die E-Mail von Malik Traoré an seine Arztpraxis. Achten Sie auf den Aufbau: kurz, klar und höflich.', 'Lisez le courriel de Malik Traoré à son cabinet médical. Observez la structure : court, clair et poli.')}

Betreff: Verschiebung meines Termins am 12. März
Sehr geehrte Damen und Herren,
leider kann ich meinen Termin am Dienstag, dem 12. März, um 10 Uhr nicht wahrnehmen, weil ich an diesem Tag beruflich nach Hamburg fahren muss. Wäre es möglich, den Termin auf die nächste Woche zu verschieben? Ich kann montags und donnerstags ab 15 Uhr.
Außerdem bitte ich Sie um eine Bescheinigung über meinen Besuch am 3. März. Mein Arbeitgeber braucht sie für meine Unterlagen.
Vielen Dank für Ihr Verständnis.
Mit freundlichen Grüßen
Malik Traoré

AUFBAU
[fr] Structure
1. ${bi('Betreff: Termin und Datum nennen.', 'Objet : nommer le rendez-vous et sa date.')}
2. ${bi('Problem und Grund: Sie können nicht kommen, weil …', 'Problème et raison : vous ne pouvez pas venir, parce que …')}
3. ${bi('Erste Bitte: neuer Termin und wann Sie Zeit haben.', 'Première demande : un nouveau rendez-vous et vos disponibilités.')}
4. ${bi('Zweite Bitte: die Bescheinigung und wofür Sie sie brauchen.', 'Deuxième demande : l’attestation et à quoi elle sert.')}
5. ${bi('Schluss: Dank und Grußformel.', 'Conclusion : remerciement et formule finale.')}

EINLEITEN
[fr] Introduire
• Leider kann ich meinen Termin am … nicht wahrnehmen. — Malheureusement, je ne peux pas venir au rendez-vous du …
BEGRÜNDEN
[fr] Justifier
• …, weil ich an diesem Tag arbeiten muss. — … parce que je dois travailler ce jour-là.
BITTEN
[fr] Demander
• Wäre es möglich, den Termin zu verschieben? — Serait-il possible de déplacer le rendez-vous ?
• Ich bitte Sie um eine Bescheinigung. — Je vous prie de m’établir une attestation.
SCHLUSS
[fr] Conclure
• Vielen Dank für Ihr Verständnis. — Merci de votre compréhension.

MODELL: RATSCHLÄGE GEBEN
[fr] Modèle : donner des conseils
${bi('Jonas schläft schlecht. Hören Sie die Sprachnachricht von Lena. Sie zeigt Verständnis, gibt drei Tipps, nennt eine Bedingung und macht ein Angebot.', 'Jonas dort mal. Écoutez le message vocal de Lena : elle montre sa compréhension, donne trois conseils, pose une condition et fait une proposition.')}
• Das tut mir wirklich leid. — Je suis vraiment désolée.
• Du solltest … · Wie wäre es, wenn du …? · An deiner Stelle würde ich … — Tu devrais … · Et si tu … ? · À ta place, je …
• Erstens …, zweitens …, und drittens … — Premièrement …, deuxièmement …, et troisièmement …
• Wenn das nicht hilft, solltest du … — Si ça n’aide pas, tu devrais …
• Gute Besserung und melde dich! — Bon rétablissement, et donne-moi des nouvelles !` },
      placements: [{ media: 'b1-gesundheit-atelier-modell-audio', caption: 'Lenas Sprachnachricht' }] },

    // 2 · Réagir en situation
    { id: 'b1-gesundheit-atelier-interaktion', kind: 'exercise', title: 'Réagir : prendre rendez-vous au téléphone', estimatedMinutes: 10,
      competences: ['ecoute', 'expression-orale'],
      lesson: { description: `${C.reagieren}

SITUATION
[fr] La situation
${bi('Sie haben seit einer Woche Rückenschmerzen und rufen in der Praxis Doktor Albers an. Herr Kühn ist am Telefon. Hören Sie jeden Satz und wählen Sie die beste Reaktion.', 'Vous avez mal au dos depuis une semaine et vous appelez le cabinet du Dr Albers. M. Kühn répond. Écoutez chaque réplique et choisissez la meilleure réaction.')}
${bi('Sprechen Sie danach die Sätze laut nach.', 'Répétez ensuite les phrases à voix haute.')}` },
      placements: [
        { media: 'b1-gesundheit-atelier-interaktion-satz1', questionId: 'q1', transcriptVisibility: 'after_answer' },
        { media: 'b1-gesundheit-atelier-interaktion-satz2', questionId: 'q2', transcriptVisibility: 'after_answer' },
        { media: 'b1-gesundheit-atelier-interaktion-satz3', questionId: 'q3', transcriptVisibility: 'after_answer' },
        { media: 'b1-gesundheit-atelier-interaktion-satz4', questionId: 'q4', transcriptVisibility: 'after_answer' },
      ],
      questions: [
        choice('q1', bi('Satz 1: Was antworten Sie?', 'Réplique 1 : que répondez-vous ?'),
          [['Guten Tag, ich bin krank, und ich muss sofort kommen, sonst gehe ich in eine andere Praxis.'],
            ['Guten Tag, ich hätte gern einen Termin. Ich habe seit einer Woche Rückenschmerzen.', true], ['Ja, das kann ich gern für Sie machen.']],
          'On se présente brièvement, on demande poliment (ich hätte gern) et on donne la raison. La première réponse est exigeante et menaçante ; la troisième ne répond pas à la question « Was kann ich für Sie tun? ».'),
        choice('q2', bi('Satz 2: Was antworten Sie?', 'Réplique 2 : que répondez-vous ?'),
          [['Nein, ich komme zum ersten Mal zu Ihnen.', true], ['Nein, ich war gestern den ganzen Tag zu Hause.'], ['Ja, ich komme sehr gern zu Ihnen.']],
          'La question porte sur une visite antérieure au cabinet : « Nein, ich komme zum ersten Mal » (c’est la première fois). Les deux autres réponses comprennent mal la question.'),
        choice('q3', bi('Satz 3: Der Termin passt Ihnen nicht. Was sagen Sie?', 'Réplique 3 : l’horaire ne vous convient pas. Que dites-vous ?'),
          [['Um acht Uhr fünfzehn? Das ist mir egal, ich komme einfach irgendwann.'], ['Morgen habe ich leider auch noch starke Rückenschmerzen.'],
            ['Geht es vielleicht auch etwas später? Um acht muss ich arbeiten.', true]],
          'On refuse poliment en demandant une alternative (Geht es vielleicht auch …?) et en donnant la raison. « Das ist mir egal » signifie « je m’en moque », ce qui est impoli et ne dit pas si l’horaire convient.'),
        choice('q4', bi('Satz 4: Was antworten Sie?', 'Réplique 4 : que répondez-vous ?'),
          [['Ich überweise Ihnen das Geld dann morgen früh von meinem Konto.'], ['Alles klar: die Versichertenkarte und die Überweisung. Danke!', true],
            ['Nein, ich bringe lieber nichts mit, das ist mir zu schwer.']],
          'On confirme en répétant les deux documents : c’est la meilleure façon d’éviter un malentendu. Attention au piège : ici, die Überweisung est la lettre d’orientation du médecin, pas un virement bancaire (überweisen).'),
        speak('q5', 'Geht es vielleicht auch etwas später? Um acht muss ich arbeiten.',
          'Demander une alternative avec « Geht es … ? » : la voix monte à la fin de la question. Dans la seconde phrase, « muss » vient en deuxième position et « arbeiten » à la fin.',
          ['Geht es vielleicht auch etwas später? Um acht muss ich arbeiten.', 'Geht es vielleicht auch etwas später? Um 8 muss ich arbeiten.']),
        speak('q6', 'Ich habe seit einer Woche starke Rückenschmerzen.',
          'Décrire depuis quand : seit + datif (einer Woche) et le présent. « Rückenschmerzen » : accent sur RÜ-, ü arrondi.'),
        speak('q7', 'Muss ich zu dem Termin etwas mitbringen?',
          'Question fermée : le verbe de modalité « muss » ouvre la phrase, l’infinitif « mitbringen » la ferme. Accent sur MIT-.'),
      ] },

    // 3 · Médiation
    { id: 'b1-gesundheit-atelier-mediation', kind: 'exercise', title: 'Médiation : expliquer une lettre du cabinet à une voisine', estimatedMinutes: 15,
      competences: ['lecture', 'expression-ecrite'],
      lesson: { description: `SITUATION
[fr] La situation
${bi('Ihre Nachbarin, Frau Petrova, ist 78 Jahre alt. Sie hat einen Brief von ihrer Arztpraxis bekommen und versteht nicht alles. Sie bittet Sie um Hilfe.', 'Votre voisine, Mme Petrova, a 78 ans. Elle a reçu une lettre de son cabinet médical et ne comprend pas tout. Elle vous demande de l’aide.')}

DER BRIEF
[fr] La lettre
Sehr geehrte Frau Petrova,
wie besprochen haben wir für Sie einen Termin zur Blutabnahme vereinbart: am Montag, dem 14. Oktober, um 7:45 Uhr. Bitte kommen Sie nüchtern. Das heißt: Ab 22 Uhr am Abend vorher dürfen Sie nichts mehr essen. Wasser und ungesüßten Tee dürfen Sie trinken.
Ihre Tabletten gegen Bluthochdruck nehmen Sie bitte wie gewohnt am Morgen ein. Bringen Sie Ihre Versichertenkarte und Ihren aktuellen Medikamentenplan mit.
Die Ergebnisse bespricht Frau Doktor Albers mit Ihnen am Donnerstag, dem 17. Oktober, um 10:30 Uhr. Falls Sie einen der beiden Termine nicht wahrnehmen können, rufen Sie uns bitte spätestens am Vortag an.
Unsere Praxis ist barrierefrei. Den Aufzug finden Sie links neben dem Eingang.
Mit freundlichen Grüßen
Ihr Praxisteam Dr. Albers

AUFGABE
[fr] Votre tâche
${bi('Machen Sie Notizen für Frau Petrova, beantworten Sie ihre Fragen und erklären Sie die Regeln mit einfachen Worten.', 'Prenez des notes pour Mme Petrova, répondez à ses questions et expliquez les règles avec des mots simples.')}
TIPP
[fr] Conseil
${bi('Einfach erklären heißt: kurze Sätze, Wörter wie „nüchtern“ oder „wie gewohnt“ mit anderen Worten sagen.', 'Expliquer simplement : des phrases courtes, et des mots comme « nüchtern » ou « wie gewohnt » dits autrement.')}` },
      placements: [{ media: 'b1-gesundheit-atelier-mediation-brief', caption: 'Der Brief der Praxis' }],
      questions: [
        fill('q1', bi('Ergänzen Sie die Notizen für Frau Petrova.', 'Complétez les notes pour Mme Petrova.'),
          'Blutabnahme: Montag, 14.10., um [[1]] · ab 22 Uhr am Abend vorher: nichts mehr [[2]] · trinken: nur Wasser oder [[3]] ohne Zucker · Blutdrucktabletten am Morgen: ganz [[4]] nehmen · mitbringen: Versichertenkarte und [[5]]',
          [['7.45 Uhr', '7:45 Uhr', '7.45', '7:45', 'Viertel vor acht'], ['essen'], ['Tee'], ['normal', 'wie immer', 'wie gewohnt'],
            ['Medikamentenplan', 'den Medikamentenplan', 'ihren Medikamentenplan', 'Ihren Medikamentenplan']],
          'Les points pratiques de la lettre : rendez-vous à 7 h 45 (Viertel vor acht), rien manger après 22 heures, eau ou thé non sucré (ungesüßt), comprimés comme d’habitude (wie gewohnt = ganz normal), carte d’assurance et liste des médicaments.'),
        choice('q2', bi('Frau Petrova fragt: „Darf ich am Montag früh meinen Kaffee trinken?“ Was antworten Sie?', 'Mme Petrova demande si elle peut boire son café lundi matin. Que répondez-vous ?'),
          [['Ja, Kaffee ist ja kein Essen.'], ['Ja, aber nur mit Milch und ohne Zucker.'], ['Nein, nur Wasser oder Tee ohne Zucker.', true]],
          'La lettre n’autorise que l’eau et le thé non sucré (« Wasser und ungesüßten Tee dürfen Sie trinken »). Le café n’en fait pas partie, et le lait encore moins : pour une prise de sang à jeun, c’est non.'),
        choice('q3', bi('Frau Petrova geht schlecht zu Fuß. Welche Information ist für sie besonders wichtig?', 'Mme Petrova marche difficilement. Quelle information est particulièrement importante pour elle ?'),
          [['Den Aufzug findet sie links neben dem Eingang.', true], ['Die Ergebnisse bekommt sie am Donnerstag.'], ['Sie soll ihre Versichertenkarte mitbringen.']],
          'En médiation, on choisit ce qui compte pour la personne : « Unsere Praxis ist barrierefrei. Den Aufzug finden Sie links neben dem Eingang. » Barrierefrei : accessible sans marches.'),
        order('q4', bi('Erklären Sie Frau Petrova die Regel einfach. Bilden Sie den Satz.', 'Expliquez simplement la règle à Mme Petrova. Remettez les mots dans l’ordre.'),
          [['Wenn', 'Sie', 'nicht', 'kommen', 'können,', 'rufen', 'Sie', 'bitte', 'am Tag vorher', 'an.'],
            ['Wenn', 'Sie', 'nicht', 'kommen', 'können,', 'rufen', 'Sie', 'am Tag vorher', 'bitte', 'an.']],
          'On remplace « Falls Sie einen der beiden Termine nicht wahrnehmen können » par une phrase plus simple avec wenn. Verbe « können » à la fin de la subordonnée, puis « rufen Sie … an ». « Bitte » peut se placer avant ou après « am Tag vorher ».'),
        choice('q5', bi('Frau Petrova fragt: „Wann erfahre ich die Ergebnisse?“ Was antworten Sie?', 'Mme Petrova demande quand elle connaîtra les résultats. Que répondez-vous ?'),
          [['Am Montag, gleich nach der Blutabnahme.'], ['Am Donnerstag um halb elf, in der Praxis.', true], ['Die Praxis schickt sie Ihnen per Post.']],
          '« Die Ergebnisse bespricht Frau Doktor Albers mit Ihnen am Donnerstag, dem 17. Oktober, um 10:30 Uhr » : 10 h 30 = halb elf. Rien n’est dit d’un envoi par la poste.'),
      ] },

    // 4 · Erreurs typiques
    { id: 'b1-gesundheit-atelier-korrektur', kind: 'exercise', title: 'Corriger : parler de sa santé sans calquer le français', estimatedMinutes: 12,
      competences: ['lecture', 'expression-ecrite'],
      lesson: { description: `${bi('Diese Sätze kommen aus Nachrichten von Kursteilnehmenden. Finden Sie die richtige Form.', 'Ces phrases viennent de messages d’apprenants. Trouvez la forme correcte.')}

KORREKTURZEICHEN
[fr] Les codes de correction
Rappel des codes de votre professeur : St (place des mots), G (grammaire), W (vocabulaire), R (orthographe), A (registre : du ou Sie). Les sensations et les douleurs sont un terrain miné pour les francophones : on n’« a » pas froid en allemand.` },
      questions: [
        choice('q1', bi('W: Sie frieren. Was sagen Sie?', 'W : vous avez froid. Que dites-vous ?'),
          [['Ich bin kalt.'], ['Ich habe kalt.'], ['Mir ist kalt.', true]],
          'Les sensations se disent avec un datif : Mir ist kalt, mir ist warm, mir ist übel. « Ich habe kalt » calque le français ; « Ich bin kalt » voudrait dire « je suis froid » (au toucher, ou de caractère).'),
        hints(fill('q2', bi('G: Ergänzen Sie das Pronomen im Dativ.', 'G : complétez avec le pronom au datif.'),
          'Mein Kopf tut [[1]] weh. · Jonas, tut [[2]] der Hals noch weh?',
          [['mir'], ['dir']],
          'Wehtun se construit avec un datif : la partie du corps est le sujet (der Kopf tut weh) et la personne est au datif (mir, dir). Mot à mot : « la tête me fait mal ».'),
        'ich', 'du'),
        hints(fill('q3', bi('G: Ergänzen Sie.', 'G : complétez.'),
          'Ich [[1]] mich heute nicht gut, aber gestern [[2]] ich mich besser gefühlt.',
          [['fühle'], ['habe']],
          'Sich fühlen est un verbe pronominal : ich fühle mich. Au Perfekt, les verbes pronominaux prennent haben : ich habe mich gefühlt (jamais « bin »).'),
        'sich fühlen', 'haben oder sein?'),
        order('q4', bi('St: Bilden Sie den Satz.', 'St : remettez les mots dans l’ordre.'),
          [['Wenn', 'ich', 'Fieber', 'habe,', 'bleibe', 'ich', 'zu Hause.']],
          'Verbe à la fin de la subordonnée (habe), puis verbe de la principale tout de suite après la virgule (bleibe ich). L’ordre français « si j’ai de la fièvre, je reste » donnerait une faute de place.'),
        choice('q5', bi('W: Der Arzt verbietet das Rauchen. Was sagt er?', 'W : le médecin interdit de fumer. Que dit-il ?'),
          [['Sie dürfen nicht mehr rauchen.', true], ['Sie müssen nicht mehr rauchen.'], ['Sie brauchen nicht mehr rauchen.']],
          'Une interdiction se dit avec nicht dürfen. « Sie müssen nicht » signifie « vous n’êtes pas obligé » : ce serait presque un encouragement à continuer ! Brauchen demande en plus zu.'),
        fill('q6', bi('G: Ergänzen Sie „ob“ oder „wenn“.', 'G : complétez avec « ob » ou « wenn ».'),
          'Ich weiß noch nicht, [[1]] ich morgen arbeiten kann. [[2]] das Fieber sinkt, gehe ich hin.',
          [['ob'], ['Wenn', 'Falls']],
          'Après « ich weiß nicht », c’est une question indirecte : ob. Dans la seconde phrase, c’est une condition : wenn (ou falls). Les deux se traduisent par « si » en français.'),
      ] },

    // 5 · Entraînement au format : Hören (conversation longue)
    { id: 'b1-gesundheit-atelier-pruefung', kind: 'exercise', title: 'Format d’examen : comprendre une longue conversation', estimatedMinutes: 18,
      competences: ['ecoute'],
      lesson: { description: `PRÜFUNGSTRAINING HÖREN
[fr] Entraînement à l’examen : écoute
${bi('Sie hören ein Gespräch zwischen zwei Kollegen in der Pause. Sie hören das Gespräch zweimal. Sind die Aussagen richtig oder falsch, oder sagt das Gespräch dazu nichts?', 'Vous entendez une conversation entre deux collègues pendant la pause. Vous l’entendez deux fois. Les affirmations sont-elles vraies ou fausses, ou la conversation n’en dit-elle rien ?')}
ZEIT
[fr] Temps
${bi('Etwa 12 Minuten: eine Minute zum Lesen, dann zweimal hören.', 'Environ 12 minutes : une minute de lecture, puis deux écoutes.')}

STRATEGIE
[fr] Stratégie
1. ${bi('Lesen Sie zuerst alle Aussagen. Achten Sie auf Wörter wie „jeden Morgen“, „sechs“, „freitags“: Hier liegt oft die Falle.', 'Lisez d’abord toutes les affirmations. Repérez les mots comme « chaque matin », « six », « le vendredi » : c’est souvent là que se trouve le piège.')}
2. ${bi('Beim ersten Hören: Beantworten Sie, was Sie sicher wissen.', 'Première écoute : répondez à ce dont vous êtes sûr.')}
3. ${bi('Beim zweiten Hören: Prüfen Sie den Rest. „Nicht gesagt“ wählen Sie nur, wenn das Gespräch wirklich nichts dazu sagt.', 'Deuxième écoute : vérifiez le reste. Ne choisissez « nicht gesagt » que si la conversation n’en dit vraiment rien.')}` },
      placements: [{ media: 'b1-gesundheit-atelier-pruefung-audio', caption: 'Aylin und Sven in der Pause' }],
      questions: [
        rfHoeren('q1', 'Svens Rücken tut weh, weil er beim Umzug schwere Kisten getragen hat.', 'r',
          'Vrai : « Seit dem Umzug letzte Woche tut er mir weh. Ich habe zu viele schwere Kisten getragen. » Le mal de dos vient du déménagement.'),
        rfHoeren('q2', 'Die Ärztin hat Sven für eine Woche krankgeschrieben.', 'f',
          'Faux : à la question « Hat sie dich krankgeschrieben? », Sven répond « Nein, arbeiten kann ich ja ». Il doit seulement éviter de porter des charges lourdes.'),
        rfHoeren('q3', 'Sven bekommt sechs Termine bei der Physiotherapie.', 'r',
          'Vrai : « Sie hat mir Physiotherapie verschrieben, sechs Termine. Der erste ist am Montag. »'),
        rfHoeren('q4', 'Aylin macht ihre Rückenübungen jeden Abend.', 'f',
          'Faux : « Wenn ich sie jeden Morgen mache, habe ich keine Schmerzen. » Le soir, Aylin va courir, mais ses exercices pour le dos, elle les fait le matin.'),
        rfHoeren('q5', 'Aylin läuft schon seit zwei Jahren mit der Gruppe.', 'n',
          'Non dit : « vor zwei Jahren » se rapporte à ses problèmes de dos, pas au groupe de course. On ne sait pas depuis quand elle court avec ce groupe. Piège classique : un même nombre dans un autre contexte.'),
        rfHoeren('q6', 'Sven kann freitags mit der Laufgruppe laufen.', 'f',
          'Faux : « Freitags geht bei mir nicht, da spiele ich mit meinem Sohn Fußball. Aber dienstags könnte ich vielleicht. »'),
        rfHoeren('q7', 'Die Firma bezahlt einen neuen Bürostuhl, wenn man einen Antrag stellt.', 'r',
          'Vrai : « Die Firma bezahlt das, wenn du einen Antrag stellst. » Einen Antrag stellen : faire une demande officielle.'),
      ] },

    // 6 · Mission écrite
    { id: 'b1-gesundheit-atelier-schreiben', kind: 'mission', title: 'Mission : déplacer un rendez-vous et demander une attestation', estimatedMinutes: 25,
      competences: ['expression-ecrite'],
      lesson: { description: `SITUATION
[fr] La situation
${bi('Sie haben am Mittwoch, dem 8. Mai, um 9:30 Uhr einen Termin bei Ihrer Zahnärztin, Frau Doktor Roth. An diesem Tag haben Sie aber eine Prüfung in Ihrem Deutschkurs. Außerdem braucht Ihr Arbeitgeber eine Bescheinigung über Ihren letzten Besuch in der Praxis am 24. April.', 'Vous avez rendez-vous le mercredi 8 mai à 9 h 30 chez votre dentiste, le Dr Roth. Mais ce jour-là, vous avez un examen dans votre cours d’allemand. Votre employeur a aussi besoin d’une attestation pour votre dernière visite au cabinet, le 24 avril.')}

SO GEHEN SIE VOR
[fr] Démarche
1. ${bi('Planen (5 Minuten): Wann haben Sie in den nächsten zwei Wochen Zeit? Überlegen Sie sich zwei Möglichkeiten.', 'Planifier (5 minutes) : quand êtes-vous disponible dans les deux semaines à venir ? Trouvez deux possibilités.')}
2. ${bi('Schreiben (15 Minuten): Folgen Sie dem Aufbau aus dem Modell von Malik.', 'Écrire (15 minutes) : suivez la structure du modèle de Malik.')}
3. ${bi('Prüfen (5 Minuten): Lesen Sie Ihren Text mit der Checkliste noch einmal.', 'Vérifier (5 minutes) : relisez votre texte avec la liste de vérification.')}
TIPP
[fr] Conseil
${bi('Kurz ist hier gut: Die Praxis liest viele E-Mails. Jeder Satz hat eine klare Funktion.', 'Ici, court, c’est bien : le cabinet lit beaucoup de courriels. Chaque phrase a une fonction claire.')}` },
      mission: {
        oral: null,
        written: { prompt: bi('Schreiben Sie eine kurze E-Mail an die Praxis (40 bis 80 Wörter). Sagen Sie, dass Sie den Termin nicht wahrnehmen können, und nennen Sie den Grund. Bitten Sie um einen neuen Termin und sagen Sie, wann Sie Zeit haben. Bitten Sie außerdem um die Bescheinigung.',
          'Écrivez un court courriel au cabinet (40 à 80 mots). Dites que vous ne pouvez pas venir au rendez-vous et pourquoi. Demandez un nouveau rendez-vous en indiquant vos disponibilités. Demandez aussi l’attestation.'),
          maxChars: 1000, minWords: 40 },
        checklist: [
          bi('Betreff mit dem Datum des Termins', 'Objet avec la date du rendez-vous'),
          bi('Grund mit „weil“ (Verb am Ende)', 'Raison avec « weil » (verbe à la fin)'),
          bi('Zwei Bitten: neuer Termin und Bescheinigung', 'Deux demandes : nouveau rendez-vous et attestation'),
          bi('Höflich: „Wäre es möglich …?“, „Könnten Sie …?“', 'Poli : « Wäre es möglich … ? », « Könnten Sie … ? »'),
          bi('Anrede und Grußformel mit „Sie“', 'Formule d’appel et formule finale avec « Sie »'),
        ],
        criteria: [
          { ...GRIDS.b1.schreiben[0], label: 'Tâche : rendez-vous annulé avec la raison, nouvelles disponibilités, attestation demandée ; message court et formel (Sie)' },
          ...GRIDS.b1.schreiben.slice(1),
        ],
      } },

    // 7 · Mission orale
    { id: 'b1-gesundheit-atelier-sprechen', kind: 'mission', title: 'Mission : donner des conseils santé à un ami', estimatedMinutes: 20,
      competences: ['expression-orale'],
      lesson: { description: `SITUATION
[fr] La situation
${bi('Ihr Freund Jonas hat Ihnen eine Sprachnachricht geschickt. Es geht ihm nicht gut. Hören Sie seine Nachricht und antworten Sie ihm mit einer Sprachnachricht.', 'Votre ami Jonas vous a envoyé un message vocal. Il ne va pas bien. Écoutez son message et répondez-lui par un message vocal.')}

IHRE ANTWORT
[fr] Votre réponse
• ${bi('Zeigen Sie Verständnis.', 'Montrez que vous le comprenez.')}
• ${bi('Geben Sie drei Ratschläge: zum Schlaf, zum Essen und zur Bewegung.', 'Donnez trois conseils : sur le sommeil, l’alimentation et l’activité physique.')}
• ${bi('Nennen Sie eine Bedingung mit „wenn“ oder „falls“.', 'Formulez une condition avec « wenn » ou « falls ».')}
• ${bi('Machen Sie ein Angebot, zum Beispiel etwas zusammen zu unternehmen.', 'Faites une proposition, par exemple faire quelque chose ensemble.')}
• ${bi('Verabschieden Sie sich freundlich.', 'Prenez congé amicalement.')}

VORBEREITUNG
[fr] Préparation
${bi('Hören Sie noch einmal das Modell von Lena. Überlegen Sie sich Stichwörter, aber sprechen Sie frei.', 'Réécoutez le modèle de Lena. Préparez des mots-clés, mais parlez librement.')}` },
      placements: [{ media: 'b1-gesundheit-atelier-sprechen-nachricht', caption: 'Die Sprachnachricht von Jonas' }],
      mission: {
        oral: { prompt: bi('Antworten Sie Jonas mit einer Sprachnachricht (etwa zwei Minuten). Zeigen Sie Verständnis, geben Sie drei Ratschläge zu Schlaf, Essen und Bewegung, nennen Sie eine Bedingung mit „wenn“ oder „falls“ und machen Sie ihm ein Angebot.',
          'Répondez à Jonas par un message vocal (environ deux minutes). Montrez votre compréhension, donnez trois conseils sur le sommeil, l’alimentation et l’activité physique, formulez une condition avec « wenn » ou « falls » et faites-lui une proposition.'),
          maxSeconds: 120 },
        written: null,
        checklist: [
          bi('Ich zeige Verständnis: „Das tut mir leid.“', 'Je montre ma compréhension : « Das tut mir leid. »'),
          bi('Drei Ratschläge mit verschiedenen Formeln (sollte, Wie wäre es, …)', 'Trois conseils avec des formules variées'),
          bi('Eine Bedingung mit „wenn“ oder „falls“, Verb am Ende', 'Une condition avec « wenn » ou « falls », verbe à la fin'),
          bi('Ein Angebot und ein freundlicher Schluss', 'Une proposition et une fin amicale'),
        ],
        criteria: [
          { ...GRIDS.b1.sprechen[0], label: 'Tâche : compréhension, trois conseils (sommeil, alimentation, activité), une condition et une proposition, dans le temps imparti' },
          ...GRIDS.b1.sprechen.slice(1),
        ],
      } },

    // 8 · Faire le point
    { id: 'b1-gesundheit-atelier-bilan', kind: 'lesson', title: 'Faire le point : santé et rendez-vous', estimatedMinutes: 6,
      competences: ['lecture'],
      lesson: { description: `${bi('Lesen Sie die Ziele der Module Gesundheit. Was können Sie schon gut? Was möchten Sie noch üben?', 'Relisez les objectifs des modules Gesundheit. Que savez-vous déjà bien faire ? Que voulez-vous encore travailler ?')}

ICH KANN …
[fr] Je peux…
• ${bi('Ich kann Beschwerden beschreiben und sagen, seit wann ich sie habe.', 'Je peux décrire des symptômes et dire depuis quand je les ai.')}
• ${bi('Ich kann am Telefon einen Termin vereinbaren oder verschieben.', 'Je peux prendre ou déplacer un rendez-vous au téléphone.')}
• ${bi('Ich kann eine kurze formelle E-Mail an eine Praxis schreiben.', 'Je peux écrire un court courriel formel à un cabinet.')}
• ${bi('Ich kann einer Freundin oder einem Freund Ratschläge geben.', 'Je peux donner des conseils à une amie ou à un ami.')}
• ${bi('Ich kann einer anderen Person die wichtigen Punkte aus einem Brief erklären.', 'Je peux expliquer à une autre personne les points importants d’une lettre.')}

STRATEGIEN
[fr] Stratégies
• ${bi('Am Telefon: Termine und Dokumente immer wiederholen.', 'Au téléphone : toujours répéter les rendez-vous et les documents.')}
• ${bi('Beim Hören: zuerst die Aussagen lesen, auf Zahlen und Zeitangaben achten.', 'À l’écoute : lire d’abord les affirmations, être attentif aux nombres et aux indications de temps.')}
• ${bi('Bei einer Mediation: nur das sagen, was für die Person wichtig ist.', 'En médiation : ne dire que ce qui compte pour la personne.')}

NOCH NICHT SICHER?
[fr] Pas encore sûr ?
Wenn et falls, sollte, nicht brauchen … zu : reprenez « À retenir » et « S’entraîner » du module Gesundheit. Sensations au datif (mir ist kalt) et nicht müssen ≠ nicht dürfen : refaites l’exercice « Corriger ». Formules du message formel : relisez le modèle de Malik.` } },
  ],
};
