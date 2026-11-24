// Module B1 n° 8 · atelier « Arbeit » (lot R2). Postuler et se présenter en entretien : modèle annoté (courriel de
// candidature et réponse orale), réagir aux questions d'un recruteur, médiation (relayer les consignes prioritaires
// d'une passation), erreurs typiques, entraînement au format « annonces et personnes » (Lesen), deux missions sur grille.
// Reprise réécrite du brouillon B1 V1 (content/b1-v1/source/partie1-suite.mjs › b1-arbeit) : passation de Lea
// (document A), tâches « Confirmer les consignes » et « Mener un entretien pour un poste d'accueil ».
import { C, bi, choice, fill, order, match, speak, GRIDS } from '../../lib.mjs';

/** Indices affichés sous les trous d'un fill (forme de base à transformer). */
const hints = (question, ...values) => ({ ...question,
  blanks: question.blanks.map((blank, index) => (values[index] ? { ...blank, hint: values[index] } : blank)) });
/** Annonce correspondant à une personne (entraînement Lesen) : A, B, C ou aucune. */
const ANZEIGEN = ['Anzeige A', 'Anzeige B', 'Anzeige C', 'keine Anzeige'];
const person = (id, number, text, answer, explanation) => choice(id, bi(`Person ${number}: ${text} Welche Anzeige passt?`, 'Quelle annonce convient ?'),
  ANZEIGEN.map((label) => [label, label === answer]), explanation);

export default {
  id: 'b1-arbeit-atelier',
  title: 'Arbeit, atelier : postuler et se présenter en entretien',
  objective: 'Écrire une candidature formelle par courriel, répondre aux questions d’un entretien avec des exemples, relayer des consignes à un collègue et s’entraîner à associer des annonces à des personnes.',
  grammarFocus: [],
  sources: [
    'Textes, dialogues et exercices originaux LinguaCap.',
    'Situations reprises et réécrites du brouillon B1 V1 (LinguaCap) : passation pour l’équipe du matin, entretien pour un poste d’accueil.',
  ],

  vocabulary: [
    { word: 'Sehr geehrte Damen und Herren', partOfSpeech: 'expression', translation: 'Madame, Monsieur (formule d’appel)',
      example: 'Sehr geehrte Damen und Herren, hiermit bewerbe ich mich um die Stelle am Empfang.', note: 'quand on ne connaît pas le nom' },
    { word: 'Sehr geehrte Frau …', partOfSpeech: 'expression', translation: 'Madame … (formule d’appel avec le nom)',
      example: 'Sehr geehrte Frau Brenner, vielen Dank für Ihre schnelle Antwort.', note: 'au masculin : Sehr geehrter Herr …' },
    { word: 'mit großem Interesse', partOfSpeech: 'expression', translation: 'avec beaucoup d’intérêt',
      example: 'Mit großem Interesse habe ich Ihre Anzeige gelesen.', note: null },
    { word: 'sich bewerben als', partOfSpeech: 'verb', translation: 'postuler comme, au poste de',
      example: 'Hiermit bewerbe ich mich als Mitarbeiterin am Empfang.', note: '+ nominatif · sich um eine Stelle bewerben' },
    { word: 'zurzeit', partOfSpeech: 'adverb', translation: 'actuellement',
      example: 'Zurzeit arbeite ich an der Rezeption eines Hotels.', note: 'en un mot · verbe juste après : Zurzeit arbeite ich …' },
    { word: 'Erfahrung mitbringen', partOfSpeech: 'expression', translation: 'avoir de l’expérience (à apporter)',
      example: 'Ich bringe drei Jahre Erfahrung im Kundenservice mit.', note: 'séparable : mit|bringen' },
    { word: 'Es macht mir Spaß, … zu …', partOfSpeech: 'expression', translation: 'j’aime… (+ infinitif avec zu)',
      example: 'Es macht mir Spaß, mit Menschen zu arbeiten.', note: null },
    { word: 'Meine Stärke ist …', partOfSpeech: 'expression', translation: 'mon point fort est …',
      example: 'Meine Stärke ist, dass ich auch unter Stress ruhig bleibe.', note: null },
    { word: 'Ein Beispiel dafür: …', partOfSpeech: 'expression', translation: 'en voici un exemple : …',
      example: 'Ich organisiere gern. Ein Beispiel dafür: Letzten Sommer habe ich ein Fest geplant.', note: null },
    { word: 'im Anhang', partOfSpeech: 'expression', translation: 'en pièce jointe',
      example: 'Im Anhang finden Sie meinen Lebenslauf und meine Zeugnisse.', note: null },
    { word: 'sich über eine Einladung freuen', partOfSpeech: 'expression', translation: 'être heureux d’être invité',
      example: 'Über eine Einladung zu einem Gespräch würde ich mich sehr freuen.', note: 'sich über + accusatif freuen' },
    { word: 'Mit freundlichen Grüßen', partOfSpeech: 'expression', translation: 'Cordialement (formule finale formelle)',
      example: 'Am Ende der E-Mail schreibe ich „Mit freundlichen Grüßen“ und meinen Namen.', note: 'formule finale formelle (Sie), sans virgule après' },
    { word: 'ab sofort', partOfSpeech: 'expression', translation: 'dès maintenant, immédiatement',
      example: 'Ich kann ab sofort bei Ihnen anfangen.', note: null },
    { word: 'Das ist eine gute Frage.', partOfSpeech: 'expression', translation: 'C’est une bonne question (pour gagner du temps).',
      example: 'Das ist eine gute Frage. Ich glaube, meine größte Stärke ist meine Geduld.', note: null },
    { word: 'Habe ich richtig verstanden, dass …?', partOfSpeech: 'expression', translation: 'Ai-je bien compris que … ?',
      example: 'Habe ich richtig verstanden, dass ich auch samstags arbeite?', note: 'verbe à la fin après dass' },
    { word: 'In diesem Fall würde ich …', partOfSpeech: 'expression', translation: 'Dans ce cas, je … (hypothèse)',
      example: 'In diesem Fall würde ich zuerst meine Kollegin fragen.', note: null },
    { word: 'Vorrang haben', partOfSpeech: 'expression', translation: 'avoir la priorité',
      example: 'Der Rückruf hat Vorrang, die Anmeldungen haben Zeit bis Freitag.', note: null },
  ],

  media: [
    { key: 'b1-arbeit-atelier-modell-audio', kind: 'audio', title: 'Modèle : se présenter au début d’un entretien',
      script: [
        { voice: 'mann2', name: 'Herr Yilmaz', text: 'Frau Benali, erzählen Sie doch bitte zuerst etwas über sich.' },
        { pause: 0.6 },
        { voice: 'frau', name: 'Nadia Benali', text: 'Gern. Ich heiße Nadia Benali, ich komme aus Marseille und lebe seit vier Jahren in Hannover. Zurzeit arbeite ich an der Rezeption eines Hotels.' },
        { voice: 'frau', name: 'Nadia Benali', text: 'Meine Stärke ist, dass ich auch in stressigen Situationen freundlich bleibe. Ein Beispiel dafür: Letzten Sommer war eine Kollegin krank, und ich habe an einem Abend allein zwei Reisegruppen eingecheckt.' },
        { voice: 'frau', name: 'Nadia Benali', text: 'Ich habe zuerst die Gruppe informiert, die schon wartete, und dann die zweite Gruppe. Am Ende hatten alle ihre Zimmer, und niemand hat sich beschwert.' },
        { voice: 'frau', name: 'Nadia Benali', text: 'Ihre Stelle interessiert mich, weil ich gern mit Menschen arbeite, die etwas Neues lernen. Ich besuche selbst seit zwei Jahren Kurse und weiß, wie wichtig ein freundlicher Empfang ist.' },
      ] },
    { key: 'b1-arbeit-atelier-interaktion-frage1', kind: 'audio', title: 'Question 1 du recruteur',
      script: [{ voice: 'mann2', name: 'Herr Yilmaz', text: 'Was würden Sie tun, wenn zwei Besucher gleichzeitig Hilfe bräuchten?' }] },
    { key: 'b1-arbeit-atelier-interaktion-frage2', kind: 'audio', title: 'Question 2 du recruteur',
      script: [{ voice: 'mann2', name: 'Herr Yilmaz', text: 'Warum möchten Sie Ihre Stelle im Hotel wechseln?' }] },
    { key: 'b1-arbeit-atelier-interaktion-frage3', kind: 'audio', title: 'Question 3 du recruteur',
      script: [{ voice: 'mann2', name: 'Herr Yilmaz', text: 'So, das war es von unserer Seite. Haben Sie noch Fragen an uns?' }] },
    { key: 'b1-arbeit-atelier-interaktion-frage4', kind: 'audio', title: 'Fin de l’entretien',
      script: [{ voice: 'mann2', name: 'Herr Yilmaz', text: 'Gut. Wir melden uns bis Ende nächster Woche bei Ihnen.' }] },
    { key: 'b1-arbeit-atelier-mediation-nachricht', kind: 'image', title: 'Message de Lea pour l’équipe du matin',
      alt: 'Trois messages envoyés par Lea ce soir pour demain matin : préparer les badges avant 9 heures, vérifier les trois tables, rappeler une participante avant 11 heures.',
      image: { layout: 'messages', icon: 'message-square', title: 'Lea · Empfang', subtitle: 'Für morgen früh',
        messages: [
          { from: 'Lea', time: '21:14', text: 'Hallo zusammen, morgen kommen die ersten Besucher schon um neun Uhr. Bevor ihr die Tür öffnet, legt bitte die Namensschilder neben die Teilnehmerliste. Die Ersatzschilder sind in der unteren Schublade.' },
          { from: 'Lea', time: '21:15', text: 'Prüft danach, ob im Seminarraum drei Tische stehen. Wenn ein Tisch fehlt, sagt bitte zuerst Herrn Berger Bescheid. Er weiß, wo die zusätzlichen Möbel sind. Die Anmeldungen für nächste Woche haben Zeit bis Freitag.' },
          { from: 'Lea', time: '21:17', text: 'Eine Teilnehmerin aus dem Montagskurs hat um einen Rückruf gebeten. Ihre Nummer steht auf dem Zettel neben dem Telefon. Ruft sie bitte bis elf Uhr zurück, denn sie muss sich bis zwölf Uhr für einen Kurs entscheiden. Um halb zwölf übernehme ich den Empfang. Schreibt mir bitte kurz auf, was dann noch offen ist. Danke! Lea' },
        ] } },
    { key: 'b1-arbeit-atelier-pruefung-anzeigen', kind: 'image', title: 'Trois petites annonces',
      alt: 'Trois annonces : A, un café cherche un extra le week-end ; B, une école de langues cherche une personne pour son secrétariat ; C, une entreprise de logistique cherche un manutentionnaire à temps plein.',
      image: { layout: 'cards', cards: [
        { title: 'Anzeige A', subtitle: 'Café am Stadtpark', icon: 'coffee',
          lines: ['Aushilfe (m/w/d) am Wochenende', 'Sa + So, 8–14 Uhr', 'Erfahrung im Service erwünscht', '14 € pro Stunde · ab sofort'] },
        { title: 'Anzeige B', subtitle: 'Sprachschule', icon: 'languages',
          lines: ['Sekretariat (m/w/d), 15 Std./Woche', 'Mo–Mi nachmittags', 'Deutsch und Französisch', 'Bewerbung per E-Mail'] },
        { title: 'Anzeige C', subtitle: 'Logistikfirma', icon: 'forklift',
          lines: ['Lagerhelfer (m/w/d) in Vollzeit', 'Früh- oder Spätschicht', 'Staplerschein nicht nötig', 'Zuschuss zum Monatsticket'] },
      ] } },
    { key: 'b1-arbeit-atelier-sprechen-fragen', kind: 'audio', title: 'Les trois questions de l’entretien',
      script: [
        { voice: 'mann2', name: 'Herr Yilmaz', text: 'Erste Frage: Erzählen Sie bitte kurz etwas über sich und über Ihre Berufserfahrung.' },
        { pause: 2 },
        { voice: 'mann2', name: 'Herr Yilmaz', text: 'Zweite Frage: Beschreiben Sie eine Situation, in der Sie mehrere Aufgaben gleichzeitig erledigen mussten. Was haben Sie gemacht?' },
        { pause: 2 },
        { voice: 'mann2', name: 'Herr Yilmaz', text: 'Dritte Frage: Was würden Sie tun, wenn ein Kursteilnehmer am Empfang sehr unfreundlich wäre?' },
        { pause: 2 },
        { voice: 'mann2', name: 'Herr Yilmaz', text: 'Und zum Schluss: Haben Sie noch Fragen an uns?' },
      ] },
  ],

  activities: [
    // 1 · Modèle annoté
    { id: 'b1-arbeit-atelier-modell', kind: 'lesson', title: 'Modèle : une candidature et une présentation en entretien', estimatedMinutes: 12,
      competences: ['lecture', 'ecoute'],
      lesson: { description: `MODELL: EINE BEWERBUNG PER E-MAIL
[fr] Modèle : une candidature par courriel
${bi('Lesen Sie die Bewerbung von Nadia Benali. Achten Sie auf den Aufbau und auf die festen Formulierungen.', 'Lisez la candidature de Nadia Benali. Observez la structure et les formules toutes faites.')}

Betreff: Bewerbung als Mitarbeiterin am Empfang, Ihre Anzeige vom 2. April
Sehr geehrte Frau Brenner,
mit großem Interesse habe ich Ihre Stellenanzeige gelesen und bewerbe mich hiermit um die Stelle am Empfang in Teilzeit.
Zurzeit arbeite ich an der Rezeption eines Hotels in Hannover. Dort begrüße ich jeden Tag Gäste aus vielen Ländern, beantworte Fragen am Telefon und organisiere Reservierungen. Ich bleibe auch ruhig, wenn viele Menschen gleichzeitig etwas brauchen. Ein Beispiel dafür: Letzten Sommer habe ich an einem Abend allein zwei Reisegruppen eingecheckt, weil eine Kollegin krank war.
Ich spreche Französisch, Arabisch und gut Deutsch. Die Arbeit mit Kursteilnehmenden interessiert mich besonders, weil ich selbst seit zwei Jahren Kurse besuche und weiß, wie wichtig ein freundlicher Empfang ist. Ich könnte ab dem 1. Mai anfangen.
Über eine Einladung zu einem Vorstellungsgespräch würde ich mich sehr freuen.
Mit freundlichen Grüßen
Nadia Benali
Anhang: Lebenslauf, Zeugnisse

AUFBAU
[fr] Structure
1. ${bi('Betreff: Stelle und Anzeige nennen.', 'Objet : nommer le poste et l’annonce.')}
2. ${bi('Anrede: „Sehr geehrte Frau …“ oder „Sehr geehrte Damen und Herren“, dann ein Komma. Die nächste Zeile beginnt klein.', 'Formule d’appel suivie d’une virgule ; la ligne suivante commence par une minuscule.')}
3. ${bi('Einleitung: Warum schreiben Sie?', 'Introduction : pourquoi écrivez-vous ?')}
4. ${bi('Hauptteil: Erfahrung, ein konkretes Beispiel, Sprachen, Motivation.', 'Développement : expérience, un exemple concret, langues, motivation.')}
5. ${bi('Schluss: Starttermin, Bitte um ein Gespräch, Grußformel.', 'Conclusion : date de début, demande d’entretien, formule finale.')}

EINLEITEN
[fr] Introduire
• Mit großem Interesse habe ich Ihre Anzeige gelesen. — J’ai lu votre annonce avec beaucoup d’intérêt.
• Hiermit bewerbe ich mich um die Stelle als … — Par la présente, je postule au poste de …
BEGRÜNDEN
[fr] Justifier
• Die Stelle interessiert mich, weil … — Ce poste m’intéresse parce que …
• Ich bringe Erfahrung im Kundenservice mit. — J’ai de l’expérience dans le service client.
BEISPIEL
[fr] Donner un exemple
• Ein Beispiel dafür: Letzten Sommer habe ich … — En voici un exemple : l’été dernier, j’ai …
• Zum Beispiel habe ich … — Par exemple, j’ai …
SCHLUSS
[fr] Conclure
• Ich könnte ab dem 1. Mai anfangen. — Je pourrais commencer le 1er mai.
• Über eine Einladung würde ich mich sehr freuen. — Je serais heureux(se) d’être invité(e) à un entretien.
• Mit freundlichen Grüßen — Cordialement (formule finale formelle)

MODELL: SICH IM GESPRÄCH VORSTELLEN
[fr] Modèle : se présenter en entretien
${bi('Hören Sie, wie Nadia auf die erste Frage antwortet. Ihre Antwort hat drei Teile: wer sie ist, was sie kann (mit Beispiel) und warum sie diese Stelle möchte.', 'Écoutez comment Nadia répond à la première question. Sa réponse a trois parties : qui elle est, ce qu’elle sait faire (avec un exemple) et pourquoi elle veut ce poste.')}` },
      placements: [{ media: 'b1-arbeit-atelier-modell-audio', caption: 'Nadia stellt sich vor' }] },

    // 2 · Réagir en situation
    { id: 'b1-arbeit-atelier-interaktion', kind: 'exercise', title: 'Réagir : répondre aux questions d’un recruteur', estimatedMinutes: 10,
      competences: ['ecoute', 'expression-orale'],
      lesson: { description: `${C.reagieren}

SITUATION
[fr] La situation
${bi('Sie sind im Vorstellungsgespräch beim Bildungszentrum Nord. Herr Yilmaz stellt Ihnen Fragen. Hören Sie jede Frage und wählen Sie die beste Antwort.', 'Vous êtes en entretien au Bildungszentrum Nord. M. Yilmaz vous pose des questions. Écoutez chaque question et choisissez la meilleure réponse.')}
${bi('Sprechen Sie danach die guten Antworten laut nach.', 'Répétez ensuite les bonnes réponses à voix haute.')}` },
      placements: [
        { media: 'b1-arbeit-atelier-interaktion-frage1', questionId: 'q1', transcriptVisibility: 'after_answer' },
        { media: 'b1-arbeit-atelier-interaktion-frage2', questionId: 'q2', transcriptVisibility: 'after_answer' },
        { media: 'b1-arbeit-atelier-interaktion-frage3', questionId: 'q3', transcriptVisibility: 'after_answer' },
        { media: 'b1-arbeit-atelier-interaktion-frage4', questionId: 'q4', transcriptVisibility: 'after_answer' },
      ],
      questions: [
        choice('q1', bi('Frage 1: Was antworten Sie?', 'Question 1 : que répondez-vous ?'),
          [['Ich habe beiden Besuchern sofort geholfen, und das war für mich gar kein Problem.'], ['Ich würde beide kurz begrüßen und ihnen dann nacheinander helfen.', true],
            ['Das weiß ich nicht, das ist nicht meine Aufgabe.']],
          'La question est hypothétique (« Was würden Sie tun, wenn … bräuchten? ») : on répond au Konjunktiv II, « Ich würde … ». La première réponse raconte un fait passé qui n’a pas eu lieu ; la troisième refuse de répondre, ce qui fait mauvaise impression.'),
        choice('q2', bi('Frage 2: Was antworten Sie?', 'Question 2 : que répondez-vous ?'),
          [['Ich wechsle die Stelle am ersten Mai.'], ['Weil mein Chef im Hotel sehr unfreundlich ist und ich keine Lust mehr auf ihn habe.'],
            ['Ich möchte mehr mit Menschen arbeiten, die etwas lernen wollen.', true]],
          'M. Yilmaz demande pourquoi (warum), pas quand : la première réponse est hors sujet. Critiquer son employeur actuel est une maladresse classique en entretien ; mieux vaut une raison positive, tournée vers le nouveau poste.'),
        choice('q3', bi('Frage 3: Was antworten Sie?', 'Question 3 : que répondez-vous ?'),
          [['Ja: Könnten Sie mir sagen, wie die Einarbeitung organisiert ist?', true], ['Nein, ich habe keine Fragen. Tschüss!'],
            ['Ja: Wann bekomme ich mein Geld, und wie viele Urlaubstage habe ich im ersten Jahr?']],
          'Une question préparée et polie montre votre intérêt : Könnten Sie mir sagen, wie … (verbe à la fin). « Tschüss » est trop familier, et des questions directes sur l’argent et les congés paraissent brutales à la fin d’un premier entretien.'),
        choice('q4', bi('Herr Yilmaz beendet das Gespräch. Was sagen Sie?', 'M. Yilmaz termine l’entretien. Que dites-vous ?'),
          [['Bis Ende nächster Woche? Das ist mir ehrlich gesagt viel zu spät, ich brauche die Antwort früher.'], ['Vielen Dank für das Gespräch. Ich freue mich auf Ihre Nachricht.', true],
            ['Danke, ich habe mich schon bei Ihnen gemeldet.']],
          'On remercie pour l’entretien et on dit qu’on attend la réponse avec plaisir : « Ich freue mich auf Ihre Nachricht » (sich freuen auf + accusatif, pour un événement à venir). Protester contre le délai serait impoli ; la troisième réplique n’a pas de sens.'),
        speak('q5', 'Ich würde beide kurz begrüßen und ihnen dann nacheinander helfen.',
          'Réponse hypothétique : « würde » + infinitifs à la fin (begrüßen, helfen). « Nacheinander » : l’un après l’autre ; accent sur -AN-.'),
        speak('q6', 'Könnten Sie mir sagen, wie die Einarbeitung organisiert ist?',
          'Question indirecte : le verbe « ist » ferme la phrase. Faites monter légèrement la voix à la fin : c’est une question polie.'),
        speak('q7', 'Vielen Dank für das Gespräch. Ich freue mich auf Ihre Nachricht.',
          'Formule de clôture d’un entretien. « Gespräch » : le ä est long ; « freue » se prononce « froï-e ».'),
      ] },

    // 3 · Médiation
    { id: 'b1-arbeit-atelier-mediation', kind: 'exercise', title: 'Médiation : transmettre les priorités à un collègue', estimatedMinutes: 15,
      competences: ['lecture', 'expression-ecrite'],
      lesson: { description: `SITUATION
[fr] La situation
${bi('Sie arbeiten am Empfang. Ihre Chefin Lea hat heute Abend drei lange Nachrichten an das Team geschickt. Morgen früh ist Ihr neuer Kollege Tim von 8:30 bis 11:30 Uhr allein am Empfang. Er braucht nur das Wichtigste, kurz und einfach.', 'Vous travaillez à l’accueil. Votre cheffe Lea a envoyé ce soir trois longs messages à l’équipe. Demain matin, votre nouveau collègue Tim sera seul à l’accueil de 8 h 30 à 11 h 30. Il n’a besoin que de l’essentiel, court et simple.')}

DIE NACHRICHT VON LEA
[fr] Le message de Lea
Hallo zusammen, morgen kommen die ersten Besucher schon um neun Uhr. Bevor ihr die Tür öffnet, legt bitte die Namensschilder neben die Teilnehmerliste. Die Ersatzschilder sind in der unteren Schublade.
Prüft danach, ob im Seminarraum drei Tische stehen. Wenn ein Tisch fehlt, sagt bitte zuerst Herrn Berger Bescheid. Er weiß, wo die zusätzlichen Möbel sind. Die Anmeldungen für nächste Woche haben Zeit bis Freitag.
Eine Teilnehmerin aus dem Montagskurs hat um einen Rückruf gebeten. Ihre Nummer steht auf dem Zettel neben dem Telefon. Ruft sie bitte bis elf Uhr zurück, denn sie muss sich bis zwölf Uhr für einen Kurs entscheiden. Um halb zwölf übernehme ich den Empfang. Schreibt mir bitte kurz auf, was dann noch offen ist. Danke! Lea

AUFGABE
[fr] Votre tâche
${bi('Machen Sie Notizen für Tim, wählen Sie die wichtigen Informationen und formulieren Sie einfache Sätze mit „du“.', 'Prenez des notes pour Tim, choisissez les informations importantes et formulez des phrases simples avec « du ».')}
TIPP
[fr] Conseil
${bi('Bei einer Mediation geben Sie nicht alles weiter, sondern nur das, was die Person wirklich braucht.', 'En médiation, on ne transmet pas tout : seulement ce dont la personne a vraiment besoin.')}` },
      placements: [{ media: 'b1-arbeit-atelier-mediation-nachricht', caption: 'Die Nachricht von Lea' }],
      questions: [
        fill('q1', bi('Ergänzen Sie die Notizen für Tim.', 'Complétez les notes pour Tim.'),
          'Vor 9 Uhr: Namensschilder neben die [[1]] legen · danach: im Seminarraum [[2]] Tische prüfen · fehlt ein Tisch: [[3]] Bescheid sagen · bis [[4]] Uhr: Teilnehmerin aus dem Montagskurs zurückrufen',
          [['Teilnehmerliste', 'Liste'], ['drei', '3'], ['Herrn Berger', 'Herr Berger', 'Berger'], ['elf', '11']],
          'Les trois priorités de la matinée, dans l’ordre de Lea : les badges près de la liste des participants avant l’ouverture, les trois tables (avec M. Berger si l’une manque), puis le rappel avant onze heures.'),
        choice('q2', bi('Was ist für Tim morgen NICHT wichtig?', 'Qu’est-ce qui n’est PAS important pour Tim demain ?'),
          [['die Namensschilder vor 9 Uhr'], ['der Rückruf bis elf Uhr'], ['die Anmeldungen für nächste Woche', true]],
          '« Die Anmeldungen für nächste Woche haben Zeit bis Freitag » : ce n’est pas une tâche du matin. Pour Tim, seul à l’accueil, l’important est ce qui doit être fait avant 11 h 30.'),
        fill('q3', bi('Tim fragt: „Es fehlen zwei Namensschilder. Wo finde ich neue?“ Ergänzen Sie Ihre Antwort.', 'Tim demande où trouver d’autres badges. Complétez votre réponse.'),
          'Neue Namensschilder findest du in der [[1]] Schublade, und die Nummer der Teilnehmerin liegt neben dem [[2]].',
          [['unteren'], ['Telefon']],
          '« Die Ersatzschilder sind in der unteren Schublade » : les badges de rechange sont dans le tiroir du bas (in der unteren Schublade, datif féminin, d’où -en). Le numéro de la participante est sur le papier près du téléphone (neben dem Telefon).'),
        order('q4', bi('Formulieren Sie für Tim einfach: Bilden Sie den Satz.', 'Reformulez simplement pour Tim : remettez les mots dans l’ordre.'),
          [['Wenn', 'ein Tisch', 'fehlt,', 'sagst', 'du', 'Herrn Berger', 'Bescheid.']],
          'Wenn ouvre la subordonnée, son verbe « fehlt » va à la fin. La principale suit la virgule et commence par le verbe : sagst du. Le tutoiement (du) convient entre collègues ; Lea écrivait au groupe avec ihr (sagt).'),
        fill('q5', bi('Ergänzen Sie Ihre Nachricht an Tim.', 'Complétez votre message à Tim.'),
          'Und zum Schluss: Um [[1]] kommt Lea und übernimmt den [[2]]. Schreib ihr kurz auf, was noch offen ist.',
          [['halb zwölf', '11.30', '11:30', '11.30 Uhr', '11:30 Uhr'], ['Empfang']],
          '« Um halb zwölf übernehme ich den Empfang » : halb zwölf = 11 h 30 (la demi-heure avant midi). Übernehmen : prendre le relais. Tim doit noter ce qui reste à faire.'),
      ] },

    // 4 · Erreurs typiques
    { id: 'b1-arbeit-atelier-korrektur', kind: 'exercise', title: 'Corriger : les erreurs fréquentes dans une candidature', estimatedMinutes: 12,
      competences: ['lecture', 'expression-ecrite'],
      lesson: { description: `${bi('Diese Sätze kommen aus Bewerbungen von Kursteilnehmenden. Finden Sie die richtige Form.', 'Ces phrases viennent de candidatures d’apprenants. Trouvez la forme correcte.')}

KORREKTURZEICHEN
[fr] Les codes de correction
Votre professeur emploie ces codes dans ses commentaires : St (place des mots), G (grammaire), W (vocabulaire), R (orthographe), A (registre : du ou Sie). Ici, chaque question en travaille un.` },
      questions: [
        choice('q1', bi('St: Welcher Satz ist richtig?', 'St : quelle phrase est correcte ?'),
          [['Zurzeit ich arbeite in einem Hotel.'], ['Zurzeit arbeite ich in einem Hotel.', true], ['Zurzeit ich arbeiten in einem Hotel.']],
          'Le verbe conjugué est toujours en deuxième position : si « Zurzeit » ouvre la phrase, le sujet passe après le verbe (arbeite ich). Calquer l’ordre français « actuellement je travaille » est l’erreur la plus fréquente des francophones.'),
        choice('q2', bi('G: Sie wohnen schon drei Jahre in Hannover. Welcher Satz ist richtig?', 'G : vous habitez à Hanovre depuis trois ans. Quelle phrase est correcte ?'),
          [['Ich wohne für drei Jahre in Hannover.'], ['Ich habe seit drei Jahren in Hannover gewohnt.'], ['Ich wohne seit drei Jahren in Hannover.', true]],
          'Une situation qui dure encore : seit + datif (drei Jahren) et le présent, comme en français (« j’habite depuis »). « Für drei Jahre » signifie « pour trois ans » (durée prévue) ; le Perfekt laisserait entendre que c’est fini.'),
        fill('q3', bi('W: Ergänzen Sie die Präpositionen.', 'W : complétez avec les prépositions.'),
          'Ich bewerbe mich [[1]] die Stelle [[2]] Mitarbeiterin am Empfang.',
          [['um'], ['als']],
          'Sich um eine Stelle bewerben (postuler à un poste, accusatif) ; als + nom de métier pour la fonction (comme, en tant que). « Sich für eine Stelle bewerben » s’entend à l’oral, mais um est la construction standard, attendue dans une candidature écrite.'),
        choice('q4', bi('A: Welcher Satz passt in eine E-Mail an Frau Brenner?', 'A : quelle phrase convient dans un courriel à Mme Brenner ?'),
          [['Vielen Dank für deine Nachricht und deine Einladung.'], ['Vielen Dank für Ihre Nachricht und Ihre Einladung.', true],
            ['Danke für dich Nachricht und die Einladung.']],
          'Avec une personne qu’on vouvoie, le possessif est Ihr, avec une majuscule : Ihre Nachricht, Ihre Einladung. Deine appartient au tutoiement ; « dich » est un pronom, pas un possessif.'),
        hints(fill('q5', bi('G und St: Ergänzen Sie.', 'G et St : complétez.'),
          'Ich interessiere mich [[1]] diese Stelle, weil ich gern mit Menschen [[2]].',
          [['für'], ['arbeite']],
          'Sich interessieren für + accusatif (s’intéresser à). Après weil, le verbe conjugué va à la fin : …, weil ich gern mit Menschen arbeite.'),
        null, 'arbeiten'),
        choice('q6', bi('G: Welcher Satz beendet die Bewerbung richtig?', 'G : quelle phrase termine correctement la candidature ?'),
          [['Ich freue mich auf Ihre Antwort.', true], ['Ich freue mich für Ihre Antwort.'], ['Ich freue mich an Ihre Antwort.']],
          'Sich freuen auf + accusatif : se réjouir d’une chose à venir (la réponse n’est pas encore arrivée). Sich freuen über : se réjouir de ce qui est déjà là. « Für » et « an » sont des calques fautifs.'),
      ] },

    // 5 · Entraînement au format : Lesen (annonces et personnes)
    { id: 'b1-arbeit-atelier-pruefung', kind: 'exercise', title: 'Format d’examen : associer des annonces à des personnes', estimatedMinutes: 18,
      competences: ['lecture'],
      lesson: { description: `PRÜFUNGSTRAINING LESEN
[fr] Entraînement à l’examen : lecture
${bi('Fünf Personen suchen eine Arbeit. Lesen Sie die drei Anzeigen. Welche Anzeige passt zu welcher Person? Für manche Personen gibt es keine passende Anzeige.', 'Cinq personnes cherchent un emploi. Lisez les trois annonces. Quelle annonce convient à quelle personne ? Pour certaines personnes, aucune annonce ne convient.')}
ZEIT
[fr] Temps
${bi('Etwa 15 Minuten. Arbeiten Sie ohne Wörterbuch.', 'Environ 15 minutes. Travaillez sans dictionnaire.')}

STRATEGIE
[fr] Stratégie
1. ${bi('Lesen Sie zuerst die Personen. Merken Sie sich zwei oder drei Bedingungen: Zeit, Ort, Sprache, Erfahrung.', 'Lisez d’abord les personnes. Retenez deux ou trois conditions : horaires, lieu, langue, expérience.')}
2. ${bi('Suchen Sie dann in den Anzeigen. Eine Anzeige passt nur, wenn alle Bedingungen stimmen.', 'Cherchez ensuite dans les annonces. Une annonce ne convient que si toutes les conditions sont remplies.')}
3. ${bi('Vorsicht bei gleichen Wörtern: Ein Wort aus der Anzeige in der Beschreibung der Person heißt noch nicht, dass die Anzeige passt.', 'Attention aux mots identiques : un même mot dans l’annonce et chez la personne ne suffit pas.')}

ANZEIGE A
Das Café am Stadtpark sucht eine Aushilfe (m/w/d) für das Wochenende: samstags und sonntags von 8 bis 14 Uhr. Erfahrung im Service ist erwünscht, gute Deutschkenntnisse sind nötig. Wir zahlen 14 Euro pro Stunde. Ab sofort. Bitte bewerben Sie sich persönlich im Café.
ANZEIGE B
Eine Sprachschule sucht eine Mitarbeiterin oder einen Mitarbeiter (m/w/d) für das Sekretariat, 15 Stunden pro Woche, montags bis mittwochs am Nachmittag. Sie sprechen Deutsch und Französisch, arbeiten gern am Computer und haben Freude am Kontakt mit Menschen. Bewerbung per E-Mail.
ANZEIGE C
Eine Logistikfirma sucht Lagerhelfer (m/w/d) in Vollzeit. Wir arbeiten im Schichtdienst: Frühschicht ab 6 Uhr oder Spätschicht bis 22 Uhr. Ein Staplerschein ist wünschenswert, aber nicht nötig, denn wir bilden Sie selbst aus. Gute Bezahlung und Zuschuss zum Monatsticket.` },
      placements: [{ media: 'b1-arbeit-atelier-pruefung-anzeigen', caption: 'Drei Anzeigen' }],
      questions: [
        person('q1', 1, 'Amira studiert Informatik und sucht einen Job für 10 bis 15 Stunden pro Woche. Montags bis mittwochs hat sie ab 13 Uhr frei. Sie spricht Arabisch, Französisch und Deutsch.', 'Anzeige B',
          'Annonce B : 15 heures par semaine (Amira en cherche 10 à 15), du lundi au mercredi l’après-midi (elle est libre dès 13 h ces jours-là), allemand et français exigés. Toutes les conditions sont remplies.'),
        person('q2', 2, 'Lukas sucht eine Stelle im Büro in Teilzeit. Er kann nur vormittags arbeiten, weil er nachmittags seine Tochter betreut.', 'keine Anzeige',
          'Aucune annonce : le seul travail de bureau (B, secrétariat) a lieu l’après-midi, du lundi au mercredi, justement quand Lukas garde sa fille. A (café) et C (entrepôt) ne sont pas des postes de bureau.'),
        person('q3', 3, 'Fatou hat zwei Jahre in einem Restaurant gearbeitet. Unter der Woche macht sie eine Ausbildung, aber am Wochenende möchte sie etwas Geld verdienen.', 'Anzeige A',
          'Annonce A : un extra le samedi et le dimanche, expérience en service souhaitée. Fatou est en formation en semaine et a deux ans d’expérience en restaurant.'),
        person('q4', 4, 'Marek möchte eine feste Stelle mit vielen Stunden. Er arbeitet gern körperlich und kann auch sehr früh anfangen. Einen Staplerschein hat er nicht.', 'Anzeige C',
          'Annonce C : temps plein (Vollzeit), travail physique en entrepôt, équipe du matin dès 6 h. Le permis de cariste (Staplerschein) n’est « pas nécessaire » : l’entreprise forme elle-même.'),
        person('q5', 5, 'Elena sucht eine Stelle als Kellnerin am Abend, am liebsten von Montag bis Freitag. Sie hat drei Jahre Erfahrung im Service.', 'keine Anzeige',
          'Aucune annonce : le café (A) cherche quelqu’un le week-end, de 8 h à 14 h, alors qu’Elena veut travailler le soir en semaine. L’expérience en service ne suffit pas si les horaires ne vont pas.'),
      ] },

    // 6 · Mission écrite
    { id: 'b1-arbeit-atelier-schreiben', kind: 'mission', title: 'Mission : postuler par courriel', estimatedMinutes: 25,
      competences: ['expression-ecrite'],
      lesson: { description: `SITUATION
[fr] La situation
${bi('Sie suchen eine neue Stelle und haben zwei Anzeigen gefunden. Wählen Sie eine Anzeige und bewerben Sie sich per E-Mail.', 'Vous cherchez un nouvel emploi et avez trouvé deux annonces. Choisissez-en une et postulez par courriel.')}

ANZEIGE 1
Das Hotel am Stadtpark sucht eine Rezeptionistin oder einen Rezeptionisten (m/w/d) in Teilzeit, ab dem 1. Juni. Früh- und Spätdienst, auch am Wochenende. Gute Deutsch- und Englischkenntnisse sind wichtig. Ihr Ansprechpartner ist Herr Wagner.
ANZEIGE 2
Ein Bio-Supermarkt im Stadtzentrum sucht eine Verkäuferin oder einen Verkäufer (m/w/d) in Vollzeit. Sie beraten unsere Kundinnen und Kunden und arbeiten an der Kasse. Erfahrung im Verkauf ist ein Plus. Ihre Ansprechpartnerin ist Frau Lorenz.

SO GEHEN SIE VOR
[fr] Démarche
1. ${bi('Planen (5 Minuten): Überlegen Sie sich Stichwörter zu Ihrer Erfahrung, zu einem Beispiel und zu Ihren Sprachen.', 'Planifier (5 minutes) : trouvez des mots-clés sur votre expérience, un exemple et vos langues.')}
2. ${bi('Schreiben (15 Minuten): Folgen Sie dem Aufbau aus dem Modell von Nadia.', 'Écrire (15 minutes) : suivez la structure du modèle de Nadia.')}
3. ${bi('Prüfen (5 Minuten): Lesen Sie Ihren Text mit der Checkliste noch einmal.', 'Vérifier (5 minutes) : relisez votre texte avec la liste de vérification.')}` },
      mission: {
        oral: null,
        written: { prompt: bi('Schreiben Sie eine Bewerbung per E-Mail an die Person aus der Anzeige (120 bis 150 Wörter). Nennen Sie die Stelle, Ihre Erfahrung mit einem konkreten Beispiel, Ihre Sprachkenntnisse und ab wann Sie anfangen können. Bitten Sie am Ende um ein Gespräch.',
          'Écrivez un courriel de candidature à la personne indiquée dans l’annonce (120 à 150 mots). Nommez le poste, votre expérience avec un exemple concret, vos langues et votre date de début possible. Demandez un entretien pour finir.'),
          maxChars: 1500, minWords: 120 },
        checklist: [
          bi('Betreff, Anrede mit Namen und Grußformel', 'Objet, formule d’appel avec le nom, formule finale'),
          bi('Die Stelle und die Anzeige sind genannt.', 'Le poste et l’annonce sont nommés.'),
          bi('Erfahrung mit einem konkreten Beispiel', 'Expérience avec un exemple concret'),
          bi('Sprachkenntnisse und Starttermin', 'Langues et date de début'),
          bi('Immer „Sie“ und „Ihr“; nach „weil“ steht das Verb am Ende.', 'Toujours « Sie » ; après « weil », verbe à la fin.'),
        ],
        criteria: [
          { ...GRIDS.b1.schreiben[0], label: 'Tâche : poste et annonce nommés, expérience avec un exemple, langues, date de début et demande d’entretien ; registre formel (Sie)' },
          ...GRIDS.b1.schreiben.slice(1),
        ],
      } },

    // 7 · Mission orale
    { id: 'b1-arbeit-atelier-sprechen', kind: 'mission', title: 'Mission : répondre à trois questions d’entretien', estimatedMinutes: 20,
      competences: ['expression-orale'],
      lesson: { description: `SITUATION
[fr] La situation
${bi('Sie haben ein Vorstellungsgespräch für eine Stelle am Empfang. Herr Yilmaz stellt Ihnen drei Fragen. Hören Sie die Fragen und nehmen Sie Ihre Antworten auf.', 'Vous passez un entretien pour un poste d’accueil. M. Yilmaz vous pose trois questions. Écoutez-les et enregistrez vos réponses.')}

DIE FRAGEN
[fr] Les questions
1. ${bi('Erzählen Sie bitte kurz etwas über sich und über Ihre Berufserfahrung.', 'Parlez brièvement de vous et de votre expérience professionnelle.')}
2. ${bi('Beschreiben Sie eine Situation, in der Sie mehrere Aufgaben gleichzeitig erledigen mussten.', 'Décrivez une situation où vous avez dû faire plusieurs tâches à la fois.')}
3. ${bi('Was würden Sie tun, wenn ein Kursteilnehmer am Empfang sehr unfreundlich wäre?', 'Que feriez-vous si un participant était très désagréable à l’accueil ?')}
${bi('Zum Schluss stellen Sie selbst eine höfliche Frage zur Stelle.', 'Pour finir, posez vous-même une question polie sur le poste.')}

VORBEREITUNG
[fr] Préparation
${bi('Nehmen Sie sich fünf Minuten Zeit und überlegen Sie sich nur Stichwörter, keine ganzen Sätze. Frage 2: Problem, Handlung, Ergebnis. Frage 3: „Ich würde zuerst …, dann …“.', 'Prenez cinq minutes pour trouver des mots-clés, pas des phrases entières. Question 2 : problème, action, résultat. Question 3 : « Ich würde zuerst …, dann … ».')}` },
      placements: [{ media: 'b1-arbeit-atelier-sprechen-fragen', caption: 'Die Fragen von Herrn Yilmaz' }],
      mission: {
        oral: { prompt: bi('Beantworten Sie die drei Fragen nacheinander, frei und ohne abzulesen (zusammen etwa zwei Minuten). Stellen Sie am Ende eine höfliche Frage zur Stelle.',
          'Répondez aux trois questions l’une après l’autre, librement et sans lire (environ deux minutes en tout). Posez pour finir une question polie sur le poste.'),
          maxSeconds: 150 },
        written: null,
        checklist: [
          bi('Ich stelle mich kurz vor: Name, Herkunft, jetzige Arbeit.', 'Je me présente : nom, origine, emploi actuel.'),
          bi('Ich erzähle ein Beispiel: Problem, Handlung, Ergebnis.', 'Je raconte un exemple : problème, action, résultat.'),
          bi('Frage 3 beantworte ich mit „Ich würde …“.', 'Je réponds à la question 3 avec « Ich würde … ».'),
          bi('Ich stelle eine höfliche indirekte Frage.', 'Je pose une question indirecte polie.'),
        ],
        criteria: [
          { ...GRIDS.b1.sprechen[0], label: 'Tâche : trois réponses complètes (présentation, exemple vécu, réaction hypothétique) et une question polie, dans le temps imparti' },
          ...GRIDS.b1.sprechen.slice(1),
        ],
      } },

    // 8 · Faire le point
    { id: 'b1-arbeit-atelier-bilan', kind: 'lesson', title: 'Faire le point : travail et candidature', estimatedMinutes: 6,
      competences: ['lecture'],
      lesson: { description: `${bi('Lesen Sie die Ziele der Module Arbeit. Was können Sie schon gut? Was möchten Sie noch üben?', 'Relisez les objectifs des modules Arbeit. Que savez-vous déjà bien faire ? Que voulez-vous encore travailler ?')}

ICH KANN …
[fr] Je peux…
• ${bi('Ich kann eine Stellenanzeige verstehen und prüfen, ob sie zu mir passt.', 'Je peux comprendre une offre d’emploi et vérifier si elle me convient.')}
• ${bi('Ich kann eine formelle Bewerbung per E-Mail schreiben.', 'Je peux écrire une candidature formelle par courriel.')}
• ${bi('Ich kann im Gespräch meine Erfahrung mit einem Beispiel erklären.', 'Je peux expliquer mon expérience avec un exemple pendant un entretien.')}
• ${bi('Ich kann höflich nachfragen: „Könnten Sie mir sagen, ob …?“', 'Je peux demander poliment : « Könnten Sie mir sagen, ob … ? »')}
• ${bi('Ich kann einer Kollegin oder einem Kollegen die wichtigsten Aufgaben weitergeben.', 'Je peux transmettre les tâches essentielles à un ou une collègue.')}

STRATEGIEN
[fr] Stratégies
• ${bi('Beim Lesen von Anzeigen: alle Bedingungen prüfen, nicht nur gleiche Wörter suchen.', 'En lisant des annonces : vérifier toutes les conditions, pas seulement les mots identiques.')}
• ${bi('Im Gespräch: Beispiel in drei Schritten erzählen (Problem, Handlung, Ergebnis).', 'En entretien : raconter un exemple en trois étapes (problème, action, résultat).')}
• ${bi('Bei einer Mediation: nur das Wichtigste weitergeben, in einfachen Sätzen.', 'En médiation : ne transmettre que l’essentiel, en phrases simples.')}

NOCH NICHT SICHER?
[fr] Pas encore sûr ?
Konjunktiv II de politesse et questions indirectes : reprenez « À retenir » puis « S’entraîner » du module Arbeit. Formules de la candidature : relisez le modèle de Nadia et le lexique de cet atelier. Erreurs de place du verbe (St) : refaites l’exercice « Corriger ».` } },
  ],
};
