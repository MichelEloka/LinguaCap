// Module B2 n° 4 · atelier « Arbeitswelt » (lot R5). Écrire à la direction au nom d'une équipe et défendre une position
// dans une discussion sur le télétravail : modèle annoté (courriel formel et présentation en réunion), réagir à des
// arguments enregistrés, médiation (expliquer les résultats d'une enquête interne présentés en graphique), erreurs
// typiques, entraînement au format « Hören : interview », deux missions sur grille B2.
import { C2, aide, choice, fill, order, speakB2, GRIDS } from '../../lib.mjs';

/** Indices affichés sous les trous d'un fill (forme de base à transformer). */
const hints = (question, ...values) => ({ ...question,
  blanks: question.blanks.map((blank, index) => (values[index] ? { ...blank, hint: values[index] } : blank)) });

const POSITION_LORENZEN = 'Ich bin dagegen. Ein Recht auf Homeoffice nützt nur den Leuten im Büro. In der Produktion und im Lager geht das nicht, und das spaltet die Belegschaft. Außerdem leidet der Zusammenhalt, wenn sich ein Team kaum noch sieht.';
const POSITION_MELZER = 'Ich sehe das anders. Zu Hause bin ich konzentrierter, und ich spare jeden Tag eine Stunde Fahrzeit. Wer das Homeoffice wieder abschafft, verliert gute Leute an andere Firmen. Gerecht heißt für mich nicht, dass alle dasselbe bekommen, sondern dass alle eine faire Lösung bekommen.';

export default {
  id: 'b2-arbeitswelt-atelier',
  title: 'Arbeitswelt – Werkstatt: an die Geschäftsleitung schreiben und mitdiskutieren',
  objective: 'Écrire un courriel formel à la direction au nom d’une équipe, réagir à des arguments dans une discussion sur le télétravail, expliquer à un collègue les résultats d’une enquête présentés en graphique et s’entraîner à l’épreuve d’écoute « interview ».',
  grammarFocus: [],
  sources: ['Textes, dialogues, interview et exercices originaux LinguaCap. Enquête interne fictive.'],

  vocabulary: [
    { word: 'Sehr geehrte Damen und Herren', partOfSpeech: 'expression', translation: 'Madame, Monsieur (formule d’appel)',
      example: 'Sehr geehrte Damen und Herren, im Namen meines Teams schreibe ich Ihnen.', note: 'quand on ne connaît pas le nom' },
    { word: 'im Namen des Teams', partOfSpeech: 'expression', translation: 'au nom de l’équipe',
      example: 'Im Namen des Teams möchte ich Ihnen einen Vorschlag machen.', note: '+ génitif' },
    { word: 'sich wenden an', partOfSpeech: 'verb', translation: 's’adresser à',
      example: 'Bei Fragen können Sie sich jederzeit an die Personalabteilung wenden.', note: '+ accusatif · Ich wende mich mit einem Anliegen an Sie.' },
    { word: 'Anliegen', article: 'das', plural: 'Anliegen', partOfSpeech: 'noun', translation: 'la requête, la demande',
      example: 'Unser Anliegen betrifft die neue Homeoffice-Regelung.', note: null },
    { word: 'einen Vorschlag unterbreiten', partOfSpeech: 'expression', translation: 'soumettre une proposition',
      example: 'Wir möchten Ihnen folgenden Vorschlag unterbreiten.', note: 'registre formel · unterbreiten est inséparable' },
    { word: 'Wir würden es begrüßen, wenn …', partOfSpeech: 'expression', translation: 'Nous apprécierions que …',
      example: 'Wir würden es begrüßen, wenn wir darüber sprechen könnten.', note: 'verbe à la fin après wenn' },
    { word: 'Präsenzpflicht', article: 'die', plural: null, partOfSpeech: 'noun', translation: 'l’obligation de présence (au bureau)',
      example: 'Seit Januar gilt eine Präsenzpflicht an vier Tagen.', note: 'sans pluriel' },
    { word: 'Regelung', article: 'die', plural: 'Regelungen', partOfSpeech: 'noun', translation: 'la règle, le dispositif',
      example: 'Die Regelung soll nach drei Monaten überprüft werden.', note: null },
    { word: 'umsetzbar', partOfSpeech: 'adjective', translation: 'réalisable, applicable',
      example: 'Die Regel ist für unseren Bereich nur schwer umsetzbar.', note: '= kann umgesetzt werden' },
    { word: 'Befragte', article: 'die', plural: 'Befragten', partOfSpeech: 'noun', translation: 'la personne interrogée',
      example: 'Mehr als ein Drittel der Befragten arbeitet nie zu Hause.', note: 'adjectif substantivé : ein Befragter, die Befragten' },
    { word: 'ein Großteil', partOfSpeech: 'expression', translation: 'une grande partie',
      example: 'Ein Großteil unserer Arbeit lässt sich von zu Hause erledigen.', note: '+ génitif : ein Großteil der Befragten' },
    { word: 'im Vergleich zu', partOfSpeech: 'expression', translation: 'par rapport à',
      example: 'Im Vergleich zum Vorjahr arbeiten mehr Menschen im Homeoffice.', note: '+ datif' },
    { word: 'Das mag sein, aber …', partOfSpeech: 'expression', translation: 'C’est possible, mais …',
      example: 'Das mag sein, aber gerecht heißt nicht gleich.', note: 'pour contredire poliment' },
    { word: 'Da ist etwas dran.', partOfSpeech: 'expression', translation: 'Il y a du vrai là-dedans.',
      example: 'Da ist etwas dran, aber man könnte es auch anders lösen.', note: 'pour approuver en partie' },
    { word: 'etwas an etwas festmachen', partOfSpeech: 'expression', translation: 'fonder quelque chose sur quelque chose',
      example: 'Woran machen Sie fest, dass Sie zu Hause produktiver sind?', note: 'séparable : fest|machen · woran … festmachen ?' },
    { word: 'zusammengefasst', partOfSpeech: 'adverb', translation: 'en résumé, pour résumer',
      example: 'Zusammengefasst: Homeoffice braucht klare Regeln.', note: null },
    { word: 'Für eine Rückmeldung wären wir Ihnen dankbar.', partOfSpeech: 'expression', translation: 'Nous vous serions reconnaissants de bien vouloir nous répondre.',
      example: 'Für eine kurze Rückmeldung wären wir Ihnen dankbar.', note: 'die Rückmeldung : la réponse, le retour' },
    { word: 'Mit freundlichen Grüßen', partOfSpeech: 'expression', translation: 'Cordialement (formule finale formelle)',
      example: 'Am Ende der E-Mail steht „Mit freundlichen Grüßen“.', note: 'sans virgule après la formule' },
  ],

  media: [
    { key: 'b2-arbeitswelt-atelier-modell-audio', kind: 'audio', title: 'Modèle : présenter une proposition en réunion d’équipe',
      script: [
        { voice: 'frau', name: 'Silke Kröger', text: 'Guten Morgen zusammen. Ich möchte kurz erklären, was wir der Geschäftsleitung schreiben wollen. Zuerst zur Ausgangslage: Seit Januar gilt bei uns die Präsenzregel mit vier Bürotagen pro Woche.' },
        { voice: 'frau', name: 'Silke Kröger', text: 'Dann zu den Folgen für unser Team: Die Krankmeldungen haben zugenommen, und zwei erfahrene Kolleginnen haben gekündigt, unter anderem wegen der langen Arbeitswege.' },
        { voice: 'frau', name: 'Silke Kröger', text: 'Und schließlich zu unserem Vorschlag: zwei feste Bürotage, die Teamsitzung immer dienstags und nach drei Monaten eine gemeinsame Bilanz. Mir ist wichtig, dass wir nicht gegen die Geschäftsleitung argumentieren, sondern eine Lösung anbieten, die für beide Seiten funktioniert. Gibt es noch Fragen oder Ergänzungen?' },
      ] },
    { key: 'b2-arbeitswelt-atelier-diskussion-beitrag1', kind: 'audio', title: 'Discussion : intervention 1',
      script: [{ voice: 'mann2', name: 'Tjark Lorenzen', text: 'Homeoffice für alle? Das finde ich ungerecht. In der Produktion und im Lager kann niemand von zu Hause arbeiten. Warum sollen die Leute im Büro ein Privileg bekommen, das die anderen nie haben werden?' }] },
    { key: 'b2-arbeitswelt-atelier-diskussion-beitrag2', kind: 'audio', title: 'Discussion : intervention 2',
      script: [{ voice: 'frau2', name: 'Iris Melzer', text: 'Ich arbeite seit drei Jahren überwiegend zu Hause und bin viel produktiver als früher im Großraumbüro. Keine Unterbrechungen, kein Stau. Ich verstehe nicht, warum man das jetzt wieder abschaffen will.' }] },
    { key: 'b2-arbeitswelt-atelier-diskussion-beitrag3', kind: 'audio', title: 'Discussion : intervention 3',
      script: [{ voice: 'mann3', name: 'Thilo Sievers', text: 'Mir fehlt der Austausch. Neue Kolleginnen und Kollegen lernen am meisten, wenn sie anderen über die Schulter schauen können. Das funktioniert per Video einfach nicht.' }] },
    { key: 'b2-arbeitswelt-atelier-diskussion-beitrag4', kind: 'audio', title: 'Discussion : intervention de l’animateur',
      script: [{ voice: 'sprecher', name: 'Moderator', text: 'Wir müssen langsam zum Schluss kommen. Wer möchte die wichtigsten Punkte noch einmal kurz zusammenfassen?' }] },
    { key: 'b2-arbeitswelt-atelier-mediation-grafik', kind: 'image', title: 'Graphique : jours de télétravail par semaine (enquête interne)',
      alt: 'Graphique en barres d’une enquête interne (212 réponses) : 38 % des salariés ne télétravaillent aucun jour, 17 % un jour, 21 % deux jours, 12 % trois jours et 12 % quatre ou cinq jours par semaine.',
      image: { layout: 'chart', title: 'Homeoffice-Tage pro Woche: Wie ist es heute?', unit: '%',
        bars: [{ label: 'kein Tag', value: 38 }, { label: '1 Tag', value: 17 }, { label: '2 Tage', value: 21 }, { label: '3 Tage', value: 12 },
          { label: '4 bis 5 Tage', value: 12 }],
        highlight: 0, source: 'Interne Befragung, 212 von 260 Beschäftigten' } },
    { key: 'b2-arbeitswelt-atelier-pruefung-interview', kind: 'audio', title: 'Interview : un espace de coworking à la campagne',
      script: [
        { voice: 'mann', name: 'Moderator', text: 'In unserer Reihe „Neue Arbeitswelten“ geht es heute um das Arbeiten auf dem Land. Gunda Ehlert hat vor drei Jahren in einem alten Gutshof in der Uckermark einen Coworking-Space eröffnet, das Landbüro Kastanienhof. Frau Ehlert, wie kam es dazu?' },
        { voice: 'frau3', name: 'Gunda Ehlert', text: 'Eigentlich aus Eigennutz. Ich bin Übersetzerin und war mit meiner Familie aus Berlin aufs Land gezogen. Zu Hause zu arbeiten, mit zwei kleinen Kindern, war schwierig. Und mir fehlten die Kolleginnen und Kollegen, der Kaffee zwischendurch, das Gespräch über etwas anderes. Ich dachte: Andere hier müssen doch das gleiche Problem haben.' },
        { voice: 'mann', name: 'Moderator', text: 'Und hatten sie es?' },
        { voice: 'frau3', name: 'Gunda Ehlert', text: 'Mehr, als ich erwartet hatte. Am Anfang hatten wir acht Arbeitsplätze, heute sind es fünfundzwanzig, und meistens ist mehr als die Hälfte belegt. Die meisten Nutzerinnen und Nutzer sind Angestellte, die für Firmen in Berlin oder Hamburg arbeiten, aber nicht jeden Tag zwei Stunden pendeln wollen.' },
        { voice: 'mann', name: 'Moderator', text: 'Was bieten Sie, was das eigene Arbeitszimmer nicht bietet?' },
        { voice: 'frau3', name: 'Gunda Ehlert', text: 'Zuerst einmal eine schnelle Internetverbindung, und die ist hier draußen leider keine Selbstverständlichkeit. Dann Ruhe, aber eben keine Einsamkeit. Wir essen mittags zusammen, und daraus sind schon richtige Projekte entstanden. Ein Grafiker und eine Programmiererin haben sich bei uns kennengelernt und inzwischen zusammen eine kleine Firma gegründet.' },
        { voice: 'mann', name: 'Moderator', text: 'Wie sieht ein ganz normaler Tag im Landbüro aus?' },
        { voice: 'frau3', name: 'Gunda Ehlert', text: 'Ab acht Uhr kommen die Ersten, viele bringen vorher ihre Kinder in die Kita gegenüber. Mittags kochen wir abwechselnd, und am Nachmittag wird es ruhiger, weil einige nur halbtags bleiben. Wer telefonieren muss, geht in eine der beiden Telefonkabinen, damit die anderen nicht gestört werden.' },
        { voice: 'mann', name: 'Moderator', text: 'Das klingt nach einer Erfolgsgeschichte. Gab es auch Schwierigkeiten?' },
        { voice: 'frau3', name: 'Gunda Ehlert', text: 'Natürlich. Das größte Problem war die Finanzierung. Die Banken hielten das Projekt für zu riskant. Geholfen hat uns am Ende die Gemeinde: Sie hat uns das Gebäude für eine sehr niedrige Miete überlassen, unter einer Bedingung. Abends und am Wochenende dürfen die Vereine des Dorfes die Räume nutzen.' },
        { voice: 'frau3', name: 'Gunda Ehlert', text: 'Das hat sich als Glücksfall erwiesen. Heute probt bei uns der Chor, die Feuerwehr hält dort ihre Versammlungen ab, und das Haus ist wieder ein Treffpunkt für das ganze Dorf geworden.' },
        { voice: 'mann', name: 'Moderator', text: 'Man hört manchmal, Coworking auf dem Land sei nur etwas für Großstädter, die aufs Land ziehen. Was sagen Sie dazu?' },
        { voice: 'frau3', name: 'Gunda Ehlert', text: 'Am Anfang war das tatsächlich so. Inzwischen kommen aber auch viele Einheimische, zum Beispiel junge Leute, die nach der Ausbildung in der Region bleiben wollen und eine Stelle mit Homeoffice gefunden haben. Früher hätten sie wegziehen müssen. Das ist für mich der schönste Effekt.' },
        { voice: 'mann', name: 'Moderator', text: 'Was würden Sie jemandem raten, der so etwas plant?' },
        { voice: 'frau3', name: 'Gunda Ehlert', text: 'Sprechen Sie zuerst mit den Menschen im Ort, nicht nur mit den Zugezogenen. Ein Coworking-Space funktioniert nur, wenn er im Dorf verankert ist. Und rechnen Sie nicht damit, dass Sie davon reich werden. Ich verdiene mein Geld immer noch hauptsächlich mit Übersetzungen.' },
        { voice: 'mann', name: 'Moderator', text: 'Frau Ehlert, vielen Dank für das Gespräch.' },
      ] },
    { key: 'b2-arbeitswelt-atelier-sprechen-runde', kind: 'audio', title: 'Débat : deux positions sur le télétravail',
      script: [
        { voice: 'sprecher', name: 'Moderator', text: 'Willkommen zu unserer Gesprächsrunde „Homeoffice für alle?“. Zwei Stimmen aus der Belegschaft haben wir schon. Herr Lorenzen, bitte.' },
        { voice: 'mann2', name: 'Tjark Lorenzen', text: POSITION_LORENZEN },
        { voice: 'sprecher', name: 'Moderator', text: 'Frau Melzer, bitte.' },
        { voice: 'frau2', name: 'Iris Melzer', text: POSITION_MELZER },
        { voice: 'sprecher', name: 'Moderator', text: 'Und jetzt Sie: Wie sehen Sie das? Sie haben zwei bis drei Minuten.' },
      ] },
  ],

  activities: [
    // 1 · Modèle annoté
    { id: 'b2-arbeitswelt-atelier-modell', kind: 'lesson', title: 'Modell: eine E-Mail an die Geschäftsleitung und ein Beitrag im Team', estimatedMinutes: 13,
      competences: ['lecture', 'ecoute'],
      lesson: { description: `MODELL 1: EINE FORMELLE E-MAIL AN DIE GESCHÄFTSLEITUNG
[fr?] Modèle 1 : un courriel formel à la direction
${aide('Lesen Sie die E-Mail von Silke Kröger, Teamleiterin im Kundenservice. Achten Sie auf den Aufbau und auf die Formulierungen, mit denen sie ihr Anliegen höflich und zugleich bestimmt vorträgt.', 'Lisez le courriel de Silke Kröger, responsable d’équipe au service client. Observez la structure et les formules qui rendent sa demande à la fois polie et ferme.')}

Betreff: Vorschlag zur Homeoffice-Regelung im Kundenservice
Sehr geehrte Damen und Herren,
im Namen des Teams Kundenservice wende ich mich mit einem Anliegen an Sie. Seit der Einführung der neuen Präsenzregel müssen alle Beschäftigten an vier Tagen pro Woche im Büro arbeiten. Wir verstehen, dass die Zusammenarbeit im Team dadurch gestärkt werden soll. In der Praxis hat sich jedoch gezeigt, dass diese Regel für unseren Bereich nur schwer umsetzbar ist.
Ein Großteil unserer Arbeit besteht aus Telefonaten und E-Mails, die sich ohne Weiteres von zu Hause erledigen lassen. Gleichzeitig haben mehrere Kolleginnen und Kollegen einen Arbeitsweg von über einer Stunde. Seit Januar ist die Zahl der Krankmeldungen in unserem Team deutlich gestiegen, und zwei erfahrene Kolleginnen haben bereits gekündigt.
Wir möchten Ihnen daher folgenden Vorschlag unterbreiten: Jedes Teammitglied arbeitet an zwei festen Tagen im Büro, die übrigen Tage können flexibel im Homeoffice verbracht werden. Teambesprechungen finden immer dienstags statt, damit alle persönlich anwesend sind. Nach drei Monaten könnte die Regelung gemeinsam überprüft werden.
Wir würden es sehr begrüßen, wenn wir unseren Vorschlag in einem persönlichen Gespräch erläutern könnten. Für eine kurze Rückmeldung wären wir Ihnen dankbar.
Mit freundlichen Grüßen
Silke Kröger
Teamleitung Kundenservice

AUFBAU
1. ${aide('Betreff: das Thema klar und sachlich nennen.', 'Objet : nommer le sujet de façon claire et neutre.')}
2. ${aide('Einleitung: Wer schreibt, in wessen Namen, und worum geht es?', 'Introduction : qui écrit, au nom de qui, et de quoi s’agit-il ?')}
3. ${aide('Ausgangslage: die Regel sachlich beschreiben und das Ziel der Geschäftsleitung anerkennen.', 'Situation : décrire la règle sans polémique et reconnaître l’objectif de la direction.')}
4. ${aide('Folgen: Probleme mit konkreten Beispielen oder Zahlen belegen.', 'Conséquences : appuyer les problèmes sur des exemples ou des chiffres.')}
5. ${aide('Vorschlag: eine konkrete, überprüfbare Lösung anbieten.', 'Proposition : offrir une solution concrète et vérifiable.')}
6. ${aide('Schluss: um ein Gespräch bitten, dann die Grußformel.', 'Conclusion : demander un entretien, puis la formule finale.')}

ANLIEGEN NENNEN
[fr?] Exposer sa demande
• Im Namen des Teams wende ich mich mit einem Anliegen an Sie.
• Ich schreibe Ihnen in Bezug auf die neue Regelung zum Homeoffice.
BEGRÜNDEN
[fr?] Justifier
• In der Praxis hat sich jedoch gezeigt, dass …
• Ein Großteil unserer Arbeit lässt sich ohne Weiteres von zu Hause erledigen.
• Seit Januar ist die Zahl der Krankmeldungen deutlich gestiegen.
VORSCHLAGEN
[fr?] Proposer
• Wir möchten Ihnen daher folgenden Vorschlag unterbreiten: …
• Nach drei Monaten könnte die Regelung gemeinsam überprüft werden.
ABSCHLIESSEN
[fr?] Conclure
• Wir würden es sehr begrüßen, wenn …
• Für eine kurze Rückmeldung wären wir Ihnen dankbar.

MODELL 2: EINEN VORSCHLAG IM TEAM VORSTELLEN
[fr?] Modèle 2 : présenter une proposition en réunion
${aide('Hören Sie, wie Silke Kröger den Vorschlag in der Teambesprechung vorstellt. Ihr Beitrag hat drei Schritte: Ausgangslage, Folgen, Vorschlag. Achten Sie auf „Zuerst zur …“, „Dann zu …“ und „Und schließlich zu …“.', 'Écoutez Silke Kröger présenter la proposition en réunion. Son intervention suit trois étapes : situation, conséquences, proposition, annoncées par « Zuerst zur … », « Dann zu … », « Und schließlich zu … ».')}` },
      placements: [{ media: 'b2-arbeitswelt-atelier-modell-audio', caption: 'Silke Kröger in der Teambesprechung' }] },

    // 2 · Réagir à des arguments
    { id: 'b2-arbeitswelt-atelier-diskussion', kind: 'exercise', title: 'Diskutieren: auf Argumente zum Homeoffice reagieren', estimatedMinutes: 12,
      competences: ['ecoute', 'expression-orale'],
      lesson: { description: `SITUATION
${aide('In Ihrem Unternehmen findet eine Betriebsversammlung zum Thema „Homeoffice für alle?“ statt. Sie hören vier Beiträge. Wählen Sie jeweils die Reaktion, die zur Aufgabe passt. Sprechen Sie danach die vier Reaktionen nach.', 'Votre entreprise organise une assemblée du personnel sur le thème « Le télétravail pour tous ? ». Vous entendez quatre interventions. Choisissez à chaque fois la réaction qui correspond à la consigne, puis répétez les quatre réactions.')}

TIPP
${aide('In einer Diskussion reagieren Sie auf das, was gesagt wurde: widersprechen („Das mag sein, aber …“), nachfragen („Woran machen Sie fest, dass …?“), teilweise zustimmen („Da ist etwas dran.“) oder zusammenfassen („Zusammengefasst: …“).', 'Dans une discussion, on réagit à ce qui a été dit : contredire, demander une précision, approuver en partie ou résumer.')}` },
      placements: [
        { media: 'b2-arbeitswelt-atelier-diskussion-beitrag1', questionId: 'q1', transcriptVisibility: 'after_answer' },
        { media: 'b2-arbeitswelt-atelier-diskussion-beitrag2', questionId: 'q2', transcriptVisibility: 'after_answer' },
        { media: 'b2-arbeitswelt-atelier-diskussion-beitrag3', questionId: 'q3', transcriptVisibility: 'after_answer' },
        { media: 'b2-arbeitswelt-atelier-diskussion-beitrag4', questionId: 'q4', transcriptVisibility: 'after_answer' },
      ],
      questions: [
        choice('q1', aide('Beitrag 1: Sie sehen das anders. Welche Reaktion widerspricht höflich und mit einem Argument?', 'Intervention 1 : vous n’êtes pas d’accord. Quelle réaction contredit poliment, avec un argument ?'),
          [['Genau, deshalb sollten auch alle in der Verwaltung wieder jeden Tag ins Büro kommen.'],
            ['Das ist doch reiner Neid, darüber möchte ich mit Ihnen nicht diskutieren.'],
            ['Das mag sein, aber gerecht heißt nicht gleich. Für die Produktion brauchen wir andere Lösungen.', true],
            ['Da haben Sie recht, das Lager liegt wirklich sehr weit vom Bürogebäude entfernt, am anderen Ende.']],
          aide('„Das mag sein, aber …“ erkennt das Argument an und widerspricht dann sachlich. Das Gegenargument: Gerechtigkeit bedeutet nicht, dass alle dasselbe bekommen. Die erste Reaktion stimmt zu, die zweite ist unhöflich, und die vierte missversteht den Beitrag.',
            '« Das mag sein, aber … » reconnaît l’argument avant de le contester : juste ne veut pas dire identique. Les autres réactions approuvent, sont impolies ou passent à côté du sujet.')),
        choice('q2', aide('Beitrag 2: Sie möchten das Argument prüfen. Welche Rückfrage passt?', 'Intervention 2 : vous voulez vérifier l’argument. Quelle question de relance convient ?'),
          [['Woran machen Sie fest, dass Sie zu Hause produktiver sind als im Büro?', true], ['Wie lange stehen Sie denn morgens normalerweise mit dem Auto im Stau?'],
            ['Finden Sie nicht auch, dass Homeoffice einfach viel bequemer ist?'], ['Warum arbeiten Sie eigentlich nicht lieber in der Produktion?']],
          aide('Frau Melzer behauptet, sie sei zu Hause „viel produktiver“. Eine gute Rückfrage fragt nach dem Beleg: „Woran machen Sie fest, dass …?“ Die Frage nach dem Stau geht an der Behauptung vorbei, die dritte legt die Antwort schon nahe, und die vierte ist ein Angriff.',
            'Pour tester une affirmation, on demande sur quoi elle repose (« Woran machen Sie fest … ? »). Les autres questions s’écartent du sujet, orientent la réponse ou attaquent la personne.')),
        choice('q3', aide('Beitrag 3: Sie stimmen teilweise zu und schlagen einen Kompromiss vor. Was sagen Sie?', 'Intervention 3 : vous êtes en partie d’accord et proposez un compromis. Que dites-vous ?'),
          [['Da haben Sie völlig recht, Homeoffice sollte deshalb für alle Beschäftigten ganz verboten werden.'],
            ['Das stimmt so nicht, per Video lernen neue Kollegen genauso viel wie im Büro.'],
            ['Über die Schulter schauen ist unhöflich, das sollte man lassen.'],
            ['Da ist etwas dran. Vielleicht könnten neue Kollegen die ersten Monate ganz im Büro arbeiten.', true]],
          aide('„Da ist etwas dran“ stimmt teilweise zu; der Kompromiss betrifft genau das genannte Problem: Neue Kolleginnen und Kollegen lernen im Büro, die anderen behalten ihr Homeoffice. Die erste Reaktion stimmt völlig zu, die zweite widerspricht ganz, die dritte missversteht die Redewendung.',
            '« Da ist etwas dran » approuve en partie ; le compromis répond au problème soulevé. Les autres réactions approuvent tout, rejettent tout ou prennent l’expression au pied de la lettre.')),
        choice('q4', aide('Beitrag 4: Die Moderation bittet um eine Zusammenfassung. Welcher Beitrag passt?', 'Intervention 4 : l’animateur demande un résumé. Quelle intervention convient ?'),
          [['Zusammengefasst: Ich bin für Homeoffice, weil ich morgens keinen Stau mag.'],
            ['Zusammengefasst: Homeoffice ist sinnvoll, braucht aber klare Regeln für Einarbeitung und Fairness.', true],
            ['Zusammengefasst: Wir haben heute sehr viel diskutiert, und irgendwie hatten am Ende alle ein bisschen recht.'],
            ['Zusammengefasst: Die Produktion sollte ab sofort ebenfalls ins Homeoffice wechseln.']],
          aide('Eine Zusammenfassung greift die wichtigsten Punkte aller Beiträge auf: Vorteile des Homeoffice (Beitrag 2), Einarbeitung (Beitrag 3) und Fairness (Beitrag 1). Die erste nennt nur die eigene Meinung, die dritte ist inhaltsleer, die vierte ist unrealistisch.',
            'Un bon résumé reprend les points de toutes les interventions : avantages, intégration des nouveaux, équité. Les autres ne donnent qu’un avis personnel, restent vides ou sont irréalistes.')),
        speakB2('q5', 'Das mag sein, aber gerecht heißt nicht gleich. Für die Produktion brauchen wir andere Lösungen.',
          aide('„mag“ mit langem a. „gerecht“ wird auf der zweiten Silbe betont (ge-RECHT), das „ch“ klingt wie in „ich“. Betonen Sie den Gegensatz: GERECHT und GLEICH. In „Produktion“ liegt der Ton auf der letzten Silbe.',
            'a long dans « mag » ; « gerecht » accentué sur la deuxième syllabe, ch comme dans « ich » ; soulignez l’opposition gerecht / gleich. « Produktion » : accent sur la dernière syllabe.')),
        speakB2('q6', 'Woran machen Sie fest, dass Sie zu Hause produktiver sind als im Büro?',
          aide('„woran“ wird auf der zweiten Silbe betont (wo-RAN). In „produktiver“ liegt der Ton auf „-ti-“ mit langem i. Bei einer Frage mit Fragewort fällt die Stimme am Ende meist.',
            '« woran » : accent sur la seconde syllabe ; « produktiver » : accent sur -ti-, i long. Avec un mot interrogatif, l’intonation descend généralement à la fin.')),
        speakB2('q7', 'Da ist etwas dran. Vielleicht könnten neue Kollegen die ersten Monate ganz im Büro arbeiten.',
          aide('„vielleicht“ wird auf der zweiten Silbe betont, das „v“ klingt wie „f“. „könnten“ hat ein kurzes ö. In „Kollegen“ liegt der Ton auf „-le-“ mit langem e.',
            '« vielleicht » : accent sur la deuxième syllabe, v prononcé f ; ö bref dans « könnten » ; « Kollegen » : accent sur -le-, e long.')),
        speakB2('q8', 'Zusammengefasst: Homeoffice ist sinnvoll, braucht aber klare Regeln für Einarbeitung und Fairness.',
          aide('„Homeoffice“ und „Fairness“ werden englisch ausgesprochen und auf der ersten Silbe betont. „zusammengefasst“ trägt den Ton auf „-sam-“, „Einarbeitung“ auf „ein-“. Machen Sie nach dem Doppelpunkt eine kurze Pause.',
            'Homeoffice et Fairness se prononcent à l’anglaise, accent sur la première syllabe ; zusammengefasst : accent sur -sam- ; Einarbeitung : sur ein-. Petite pause après les deux-points.')),
      ] },

    // 3 · Médiation : expliquer un graphique
    { id: 'b2-arbeitswelt-atelier-mediation', kind: 'exercise', title: 'Vermitteln: die Ergebnisse einer Umfrage erklären', estimatedMinutes: 15,
      competences: ['lecture', 'expression-ecrite'],
      lesson: { description: `SITUATION
${aide('Sie arbeiten in der Verwaltung eines Möbelherstellers mit 260 Beschäftigten. Die Personalabteilung hat eine interne Befragung zum Homeoffice gemacht. Ihr Kollege Hannes Brix aus der Niederlassung in Rostock konnte bei der Vorstellung der Ergebnisse nicht dabei sein. Er schreibt Ihnen:', 'Vous travaillez dans l’administration d’un fabricant de meubles de 260 salariés. Le service du personnel a mené une enquête interne sur le télétravail. Votre collègue Hannes Brix, de l’agence de Rostock, n’a pas pu assister à la présentation des résultats. Il vous écrit :')}
„Kannst du mir kurz erklären, was bei der Umfrage herausgekommen ist? Ich muss morgen meinem Team davon erzählen.“

DIE ERGEBNISSE
Geantwortet haben 212 von 260 Beschäftigten.
Frage 1: An wie vielen Tagen pro Woche arbeiten Sie zurzeit im Homeoffice? Kein Tag: 38 Prozent. Ein Tag: 17 Prozent. Zwei Tage: 21 Prozent. Drei Tage: 12 Prozent. Vier bis fünf Tage: 12 Prozent.
Frage 2: Wie viele Tage wünschen Sie sich? 64 Prozent der Befragten möchten zwei oder drei Tage pro Woche zu Hause arbeiten, 9 Prozent möchten gar kein Homeoffice.
Frage 3: Was ist im Homeoffice am schwierigsten? Am häufigsten genannt wurden die Absprachen im Team (41 Prozent).

AUFGABE
${aide('Erklären Sie Hannes die wichtigsten Ergebnisse. Beschreiben Sie die Zahlen nicht alle einzeln, sondern zeigen Sie, was sie bedeuten. Bleiben Sie sachlich: Ihre eigene Meinung gehört nicht in die Zusammenfassung.', 'Expliquez à Hannes les résultats essentiels. Ne reprenez pas chaque chiffre : montrez ce qu’ils signifient. Restez neutre : votre avis n’a pas sa place dans ce résumé.')}` },
      placements: [{ media: 'b2-arbeitswelt-atelier-mediation-grafik', caption: 'Homeoffice-Tage pro Woche (interne Befragung)' }],
      questions: [
        fill('q1', aide('Ergänzen Sie Ihre Notizen für Hannes.', 'Complétez vos notes pour Hannes.'),
          'Teilnahme: [[1]] von 260 Beschäftigten · zurzeit gar kein Homeoffice: [[2]] Prozent · zwei Tage: [[3]] Prozent · vier oder fünf Tage: [[4]] Prozent · Wunsch der meisten: zwei oder [[5]] Tage',
          [['212', 'zweihundertzwölf'], ['38', 'achtunddreißig'], ['21', 'einundzwanzig'], ['12', 'zwölf'], ['drei', '3']],
          aide('Die Zahlen stehen in der Grafik und in der Beschreibung: 212 Antworten; kein Tag 38 %, zwei Tage 21 %, vier bis fünf Tage 12 %. Der Wunsch kommt nur in der Beschreibung vor: 64 % möchten zwei oder drei Tage. Prüfen Sie Zahlen immer zweimal, bevor Sie sie weitergeben.',
            'Les chiffres figurent dans le graphique et dans le texte ; le souhait (deux ou trois jours) n’apparaît que dans le texte. Vérifiez toujours deux fois un chiffre avant de le transmettre.')),
        choice('q2', aide('Welcher Satz beschreibt die Grafik richtig?', 'Quelle phrase décrit correctement le graphique ?'),
          [['Die meisten Beschäftigten arbeiten zwei Tage pro Woche zu Hause.'], ['Ein Viertel arbeitet vier oder fünf Tage pro Woche zu Hause.'],
            ['Die größte Gruppe arbeitet zurzeit gar nicht im Homeoffice.', true], ['Genau die Hälfte der Beschäftigten arbeitet nie im Homeoffice.']],
          aide('Der höchste Balken ist „kein Tag“ mit 38 Prozent: Das ist die größte Gruppe, aber keine Mehrheit und nicht die Hälfte. Zwei Tage sind 21 Prozent, also nicht „die meisten“; vier bis fünf Tage sind 12 Prozent, also deutlich weniger als ein Viertel.',
            'La barre la plus haute (« aucun jour », 38 %) est le groupe le plus important, sans être majoritaire. 21 % ne sont pas « la plupart », et 12 % sont loin d’un quart.')),
        choice('q3', aide('Hannes fragt: „Und was heißt das jetzt?“ Welche Antwort fasst die Ergebnisse sachlich zusammen?', 'Hannes demande : « Et qu’est-ce que ça veut dire ? » Quelle réponse résume les résultats de façon neutre ?'),
          [['Wunsch und Wirklichkeit gehen auseinander: Viele möchten mehr Homeoffice, als sie jetzt haben.', true],
            ['Die Leute wollen eben nicht mehr ins Büro kommen, das zeigt die Umfrage ganz klar.'],
            ['Ich persönlich finde Homeoffice super, und die Umfrage gibt mir endlich recht.'],
            ['Das lässt sich nicht sagen, solche Umfragen werden doch immer manipuliert.']],
          aide('Mehr als die Hälfte arbeitet heute höchstens einen Tag zu Hause (38 + 17 Prozent), aber 64 Prozent wünschen sich zwei oder drei Tage: Wunsch und Wirklichkeit gehen auseinander. Die anderen Antworten übertreiben, bringen die eigene Meinung ins Spiel oder unterstellen eine Manipulation.',
            'Plus de la moitié télétravaille au plus un jour, alors que 64 % en voudraient deux ou trois : souhait et réalité divergent. Les autres réponses exagèrent, donnent un avis personnel ou supposent une manipulation.')),
        order('q4', C2.ordnen,
          [['Mehr', 'als', 'ein', 'Drittel', 'der', 'Befragten', 'arbeitet', 'zurzeit', 'gar nicht', 'im Homeoffice.']],
          aide('Die Mengenangabe „mehr als ein Drittel der Befragten“ steht auf Position 1, das Verb folgt auf Position 2. „Ein Drittel“ ist das Subjekt, deshalb steht das Verb im Singular: „arbeitet“. Danach kommen Zeit (zurzeit), Negation und Ort.',
            'Le groupe « mehr als ein Drittel der Befragten » occupe la première place ; le verbe suit, au singulier, car le sujet est « ein Drittel ». Viennent ensuite le temps, la négation et le lieu.')),
        hints(fill('q5', aide('Ergänzen Sie den Schluss Ihrer Nachricht an Hannes.', 'Complétez la fin de votre message à Hannes.'),
          'Die Ergebnisse sollen im nächsten Teamtreffen [[1]] werden. · Bis zum Sommer ist eine neue Regelung [[2]].',
          [['besprochen', 'diskutiert'], ['auszuarbeiten', 'zu erarbeiten', 'zu entwickeln']],
          aide('Passiv mit Modalverb: „sollen … besprochen werden“. Danach Passiversatz mit „sein + zu“: „ist … auszuarbeiten“ bedeutet „muss ausgearbeitet werden“; bei trennbaren Verben steht „zu“ zwischen Präfix und Stamm.',
            'Passif avec modal : sollen … besprochen werden. Puis sein + zu, équivalent de « doit être élaborée » ; zu s’intercale dans le verbe séparable : auszuarbeiten.')),
        'besprechen', 'ausarbeiten'),
        fill('q6', aide('Ergänzen Sie zwei weitere Ergebnisse für Hannes.', 'Complétez deux autres résultats pour Hannes.'),
          'Als größte Schwierigkeit im Homeoffice nennen 41 Prozent die [[1]] im Team. · Nur [[2]] Prozent wünschen sich gar kein Homeoffice.',
          [['Absprachen'], ['9', 'neun']],
          aide('Beide Informationen stehen nur in der Beschreibung, nicht in der Grafik: „Am häufigsten genannt wurden die Absprachen im Team (41 Prozent)“ und „9 Prozent möchten gar kein Homeoffice“. Eine Grafik zeigt selten alles: Lesen Sie auch den Text dazu.',
            'Ces deux informations ne figurent que dans le texte, pas dans le graphique : la coordination en équipe (41 %) et les 9 % qui ne veulent pas de télétravail.')),
      ] },

    // 4 · Erreurs typiques
    { id: 'b2-arbeitswelt-atelier-korrektur', kind: 'exercise', title: 'Korrigieren: typische Fehler in formellen Texten', estimatedMinutes: 10,
      competences: ['lecture', 'expression-ecrite'],
      lesson: { description: `${aide('Diese Sätze stammen aus E-Mails von Kursteilnehmenden an eine Geschäftsleitung. Finden Sie die richtige Form.', 'Ces phrases viennent de courriels d’apprenants à une direction. Trouvez la forme correcte.')}

KORREKTURZEICHEN
[fr?] Les codes de correction
${aide('Ihre Lehrkraft benutzt diese Zeichen: G (Grammatik), W (Wortschatz), St (Satzstellung), R (Rechtschreibung), A (Register: du oder Sie). Jede Frage übt eines davon.', 'Votre professeur emploie ces codes : G grammaire, W vocabulaire, St place des mots, R orthographe, A registre. Chaque question en travaille un.')}` },
      questions: [
        choice('q1', aide('G: Welcher Satz ist richtig?', 'G : quelle phrase est correcte ?'),
          [['Das Problem hätte früher gelöst worden müssen.'], ['Das Problem hätte früher gelöst werden müssen.', true],
            ['Das Problem hätte früher lösen werden müssen.'], ['Das Problem wäre früher gelöst werden müssen.']],
          aide('Konjunktiv II der Vergangenheit im Passiv mit Modalverb: hätte + Partizip II + „werden“ + Modalverb im Infinitiv. „Worden“ steht nur im Passiv ohne Modalverb (wäre gelöst worden), „lösen“ ist kein Partizip, und das Hilfsverb ist hier „hätte“, weil das Modalverb das Perfekt mit „haben“ bildet.',
            'hätte + participe + werden + modal à l’infinitif. worden n’apparaît qu’au passif sans modal ; l’auxiliaire est hätte, car les modaux se conjuguent avec haben.')),
        fill('q2', aide('W: Ergänzen Sie die passenden Wörter.', 'W : complétez avec les mots qui conviennent.'),
          'Wir möchten Ihnen folgenden Vorschlag [[1]]. · Für eine kurze Rückmeldung wären wir Ihnen [[2]].',
          [['unterbreiten', 'machen'], ['dankbar', 'sehr dankbar']],
          aide('„einen Vorschlag unterbreiten“ (oder einfacher „machen“) ist die formelle Wendung; ein Vorschlag wird nicht „gegeben“. „Wir wären Ihnen dankbar“ ist eine höfliche Bitte im Konjunktiv II.',
            'On « soumet » (unterbreiten) ou on « fait » (machen) une proposition. « Wir wären Ihnen dankbar » : formule de politesse au Konjunktiv II.')),
        choice('q3', aide('St: Welcher Nebensatz ist richtig? „Wir mussten länger warten, …“', 'St : quelle subordonnée est correcte ?'),
          [['…, weil die Software nicht rechtzeitig installiert werden können hat.'], ['…, weil die Software hat nicht rechtzeitig installiert werden können.'],
            ['…, weil die Software nicht rechtzeitig installiert hat werden können.'], ['…, weil die Software nicht rechtzeitig hat installiert werden können.', true]],
          aide('Im Nebensatz mit drei Verben am Ende steht „hat“ nicht ganz am Schluss, sondern direkt vor dem Verbblock: hat installiert werden können. Die Angaben (nicht rechtzeitig) bleiben davor im Mittelfeld.',
            'Avec trois verbes en fin de subordonnée, hat se place juste avant le bloc verbal, et les compléments restent devant.')),
        choice('q4', aide('A: Welche Formulierung passt in eine E-Mail an die Geschäftsleitung?', 'A : quelle formulation convient dans un courriel à la direction ?'),
          [['Wir würden es begrüßen, wenn Sie unseren Vorschlag prüfen könnten.', true], ['Checkt doch bitte mal unseren Vorschlag und meldet euch, okay?'],
            ['Sie müssen unseren Vorschlag jetzt sofort und gründlich prüfen!'], ['Hallo zusammen, könnt ihr euch unseren Vorschlag mal anschauen?']],
          aide('In einer formellen E-Mail schreibt man „Sie“ und formuliert Bitten im Konjunktiv II: „Wir würden es begrüßen, wenn …“. „Checkt“, „meldet euch“ und „könnt ihr“ sind informell, und „Sie müssen … sofort“ klingt wie ein Befehl.',
            'Registre formel : vouvoiement et demande au Konjunktiv II. Les autres phrases sont familières (tutoiement collectif) ou sonnent comme un ordre.')),
        hints(fill('q5', aide('G: Ergänzen Sie die richtige Verbform im Präsens.', 'G : complétez avec la forme verbale correcte au présent.'),
          'Den Beschäftigten [[1]] mehr Flexibilität ermöglicht werden. · Den neuen Kollegen [[2]] bei der Einarbeitung geholfen.',
          [['soll'], ['wird']],
          aide('Satz 1: Das Subjekt ist „mehr Flexibilität“ (Singular), „den Beschäftigten“ ist Dativ: soll … ermöglicht werden. Satz 2: „helfen“ verlangt den Dativ; im Passiv gibt es dann kein Subjekt, und das Verb steht im Singular: wird … geholfen.',
            'Phrase 1 : le sujet est « mehr Flexibilität » (singulier). Phrase 2 : helfen régit le datif ; le passif n’a pas de sujet, d’où le singulier wird.')),
        'sollen', 'werden'),
        choice('q6', aide('R: Welcher Satz ist richtig geschrieben?', 'R : quelle phrase est correctement orthographiée ?'),
          [['Wir hoffen, das dass Gespräch bald stattfindet.'], ['Wir hoffen, das das Gespräch bald stattfindet.'],
            ['Wir hoffen, dass das Gespräch bald stattfindet.', true], ['Wir hoffen, dass dass Gespräch bald stattfindet.']],
          aide('„dass“ leitet einen Nebensatz ein, „das“ ist hier der Artikel von „Gespräch“. Ein Test hilft: Wenn man „dieses“ oder „welches“ einsetzen kann, schreibt man „das“ mit einem s; sonst ist es die Konjunktion „dass“.',
            'dass introduit une subordonnée (« que ») ; das est ici l’article de « Gespräch ». Astuce : si l’on peut remplacer le mot par dieses ou welches, on écrit das.')),
      ] },

    // 5 · Entraînement au format : Hören, interview
    { id: 'b2-arbeitswelt-atelier-pruefung', kind: 'exercise', title: 'Prüfungstraining: Hören, ein Interview', estimatedMinutes: 20,
      competences: ['ecoute'],
      lesson: { description: `PRÜFUNGSTRAINING HÖREN
${aide('Sie hören ein Interview aus einer Radiosendung. Sie hören es zweimal. Wählen Sie bei jeder Aufgabe die richtige Antwort: a, b oder c.', 'Vous allez entendre une interview radiophonique, deux fois. Pour chaque question, choisissez la bonne réponse : a, b ou c.')}

ZEIT
${aide('Etwa 18 Minuten: zwei Minuten zum Lesen der Aufgaben, zweimal Hören, danach Zeit zum Kontrollieren.', 'Environ 18 minutes : deux minutes pour lire les questions, deux écoutes, puis un temps de vérification.')}

STRATEGIE
1. ${aide('Lesen Sie vor dem Hören alle Aufgaben und unterstreichen Sie in Gedanken die Schlüsselwörter.', 'Avant l’écoute, lisez toutes les questions et repérez les mots-clés.')}
2. ${aide('Die Aufgaben folgen der Reihenfolge des Interviews. Verpassen Sie eine Antwort, gehen Sie zur nächsten Aufgabe weiter.', 'Les questions suivent l’ordre de l’interview. Si vous ratez une réponse, passez à la suivante.')}
3. ${aide('Vorsicht bei gleichen Wörtern: Eine Antwort, die ein Wort aus dem Interview wiederholt, ist nicht automatisch richtig.', 'Attention aux mots identiques : une réponse qui reprend un mot entendu n’est pas forcément juste.')}` },
      placements: [{ media: 'b2-arbeitswelt-atelier-pruefung-interview', caption: 'Interview: Coworking auf dem Land' }],
      questions: [
        choice('q1', aide('Warum hat Frau Ehlert das Landbüro gegründet?', 'Pourquoi Mme Ehlert a-t-elle créé le Landbüro ?'),
          [['Sie suchte selbst einen Arbeitsplatz mit Kontakt zu anderen.', true], ['Die Gemeinde hatte sie um ein neues Projekt gebeten.'],
            ['Sie wollte mit Coworking ihr Hauptgeld verdienen.']],
          aide('„Eigentlich aus Eigennutz“: Zu Hause zu arbeiten war schwierig, und ihr „fehlten die Kolleginnen und Kollegen“. Die Gemeinde half erst später, und ihr Geld verdient sie „immer noch hauptsächlich mit Übersetzungen“.',
            'Par intérêt personnel : travailler chez elle était difficile et ses collègues lui manquaient. La commune n’intervient qu’ensuite, et elle vit toujours surtout de ses traductions.')),
        choice('q2', aide('Wer nutzt das Landbüro vor allem?', 'Qui utilise principalement le Landbüro ?'),
          [['Studierende, die in Berlin oder Hamburg studieren'], ['Angestellte, die nicht täglich weit pendeln wollen', true],
            ['Selbstständige, die ihre Firma in der Region haben']],
          aide('„Die meisten Nutzerinnen und Nutzer sind Angestellte, die für Firmen in Berlin oder Hamburg arbeiten, aber nicht jeden Tag zwei Stunden pendeln wollen.“ Berlin und Hamburg kommen vor, aber als Sitz der Firmen, nicht als Studienort.',
            'Ce sont surtout des salariés d’entreprises de Berlin ou de Hambourg qui ne veulent pas faire deux heures de trajet chaque jour. Les deux villes sont citées, mais pas comme lieux d’études.')),
        choice('q3', aide('Was sagt Frau Ehlert über das gemeinsame Mittagessen?', 'Que dit Mme Ehlert du déjeuner en commun ?'),
          [['Alle Nutzerinnen und Nutzer müssen daran teilnehmen.'], ['Es wird von der Gemeinde bezahlt.'],
            ['Daraus ist schon eine Firma entstanden.', true]],
          aide('„Wir essen mittags zusammen, und daraus sind schon richtige Projekte entstanden.“ Ein Grafiker und eine Programmiererin haben „zusammen eine kleine Firma gegründet“. Von einer Pflicht oder einer Bezahlung durch die Gemeinde ist nicht die Rede.',
            'Des projets sont nés de ces déjeuners, dont une petite entreprise. Rien n’indique une obligation ni un financement par la commune.')),
        choice('q4', aide('Wie wurde das Problem der Finanzierung gelöst?', 'Comment le problème du financement a-t-il été résolu ?'),
          [['Eine Bank gab ihr nach langen Verhandlungen schließlich doch einen Kredit.'], ['Die Nutzer zahlten ihre Miete ein Jahr im Voraus.'],
            ['Die Gemeinde überließ das Gebäude günstig, mit einer Bedingung.', true]],
          aide('„Die Banken hielten das Projekt für zu riskant. Geholfen hat uns am Ende die Gemeinde“: niedrige Miete unter der Bedingung, dass die Vereine die Räume abends und am Wochenende nutzen dürfen. Ein Kredit wurde nicht erwähnt.',
            'Les banques ont refusé ; la commune a loué le bâtiment à bas prix, à condition que les associations puissent l’utiliser le soir et le week-end.')),
        choice('q5', aide('Was ist für Frau Ehlert „der schönste Effekt“?', 'Qu’est-ce que Mme Ehlert appelle « l’effet le plus beau » ?'),
          [['Junge Leute aus der Region können dort bleiben.', true], ['Viele Großstädter ziehen jetzt aus Berlin in die Uckermark.'],
            ['Das Landbüro ist jeden Tag voll belegt.']],
          aide('Junge Einheimische finden eine Stelle mit Homeoffice und können in der Region bleiben: „Früher hätten sie wegziehen müssen.“ Das Landbüro ist „meistens“ zu mehr als der Hälfte belegt, nicht jeden Tag voll.',
            'Les jeunes de la région peuvent rester grâce au télétravail ; autrefois, ils auraient dû partir. Le lieu est le plus souvent occupé à plus de moitié, pas complet.')),
        choice('q6', aide('Welchen Rat gibt Frau Ehlert?', 'Quel conseil Mme Ehlert donne-t-elle ?'),
          [['Zuerst Fördergelder beantragen, dann planen.'], ['Das Projekt mit den Menschen im Ort planen.', true],
            ['Den Coworking-Space hauptberuflich betreiben.']],
          aide('„Sprechen Sie zuerst mit den Menschen im Ort … Ein Coworking-Space funktioniert nur, wenn er im Dorf verankert ist.“ Fördergelder nennt sie nicht, und vom Coworking allein lebt sie gerade nicht.',
            'Elle conseille d’associer d’abord les habitants. Elle ne parle pas de subventions et ne vit justement pas du coworking.')),
      ] },

    // 6 · Mission écrite
    { id: 'b2-arbeitswelt-atelier-schreiben', kind: 'mission', title: 'Mission: im Namen des Teams an die Geschäftsleitung schreiben', estimatedMinutes: 28,
      competences: ['expression-ecrite'],
      lesson: { description: `SITUATION
${aide('Sie arbeiten in der Buchhaltung eines mittelgroßen Unternehmens. Die Geschäftsleitung hat angekündigt, das Homeoffice ab Oktober auf einen Tag pro Woche zu begrenzen, weil die Zusammenarbeit im Team schlechter geworden sei. In Ihrem Team sind viele beunruhigt: Einige haben einen langen Arbeitsweg, andere müssen Kinder betreuen, und die meisten Aufgaben lassen sich gut von zu Hause erledigen. Das Team hat Sie gebeten, im Namen aller an die Geschäftsleitung zu schreiben.', 'Vous travaillez à la comptabilité d’une entreprise de taille moyenne. La direction veut limiter le télétravail à un jour par semaine à partir d’octobre, car la coopération se serait dégradée. Votre équipe s’inquiète (longs trajets, garde d’enfants, tâches faisables à distance) et vous demande d’écrire à la direction au nom de tous.')}

SO GEHEN SIE VOR
1. ${aide('Planen (5 Minuten): Überlegen Sie sich Stichwörter zum Anliegen, zu zwei Folgen mit Beispiel und zu einem Gegenvorschlag.', 'Planifier (5 minutes) : trouvez des mots-clés pour la demande, deux conséquences avec exemple et une contre-proposition.')}
2. ${aide('Schreiben (18 Minuten): Folgen Sie dem Aufbau aus dem Modell von Silke Kröger.', 'Écrire (18 minutes) : suivez la structure du modèle de Silke Kröger.')}
3. ${aide('Prüfen (5 Minuten): Lesen Sie Ihren Text mit der Checkliste noch einmal, vor allem Register und Satzstellung.', 'Vérifier (5 minutes) : relisez votre texte avec la liste de vérification, surtout le registre et la place des verbes.')}` },
      mission: {
        oral: null,
        written: { prompt: aide('Schreiben Sie im Namen Ihres Teams eine formelle E-Mail an die Geschäftsleitung (150 bis 250 Wörter). Nennen Sie Ihr Anliegen, beschreiben Sie mindestens zwei Folgen der geplanten Regelung für Ihr Team, machen Sie einen konkreten Gegenvorschlag und bitten Sie um ein Gespräch.',
          'Écrivez au nom de votre équipe un courriel formel à la direction (150 à 250 mots) : votre demande, au moins deux conséquences de la règle prévue, une contre-proposition concrète et une demande d’entretien.'),
          maxChars: 2400, minWords: 150 },
        checklist: [
          aide('Betreff, Anrede und Grußformel sind formell.', 'Objet, formule d’appel et formule finale sont formels.'),
          aide('Das Anliegen steht gleich in der Einleitung.', 'La demande figure dès l’introduction.'),
          aide('Mindestens zwei Folgen, jeweils mit einem Beispiel', 'Au moins deux conséquences, chacune avec un exemple'),
          aide('Ein konkreter Gegenvorschlag und die Bitte um ein Gespräch', 'Une contre-proposition concrète et une demande d’entretien'),
          aide('Passiv oder Passiversatz: „muss geklärt werden“, „lässt sich erledigen“', 'Passif ou équivalent du passif'),
        ],
        criteria: [
          { ...GRIDS.b2.schreiben[0], label: aide('Aufgabe: Anliegen, zwei Folgen mit Beispiel, Gegenvorschlag, Bitte um Gespräch; formelles Register', 'Tâche : demande, conséquences, contre-proposition, entretien ; registre formel') },
          ...GRIDS.b2.schreiben.slice(1),
        ],
      } },

    // 7 · Mission orale : discussion simulée
    { id: 'b2-arbeitswelt-atelier-sprechen', kind: 'mission', title: 'Mission: in einer Gesprächsrunde Stellung nehmen', estimatedMinutes: 20,
      competences: ['expression-orale'],
      lesson: { description: `SITUATION
${aide('In Ihrer Firma findet eine Gesprächsrunde zum Thema „Homeoffice für alle?“ statt. Zwei Kollegen haben schon gesprochen. Hören Sie die Beiträge. Dann sind Sie an der Reihe.', 'Votre entreprise organise une table ronde : « Le télétravail pour tous ? ». Deux collègues ont déjà pris la parole. Écoutez-les, puis c’est votre tour.')}

DIE BEITRÄGE
Tjark Lorenzen: ${POSITION_LORENZEN}
Iris Melzer: ${POSITION_MELZER}

VORBEREITUNG
${aide('Nehmen Sie sich fünf Minuten Zeit und überlegen Sie sich Stichwörter, keine ganzen Sätze: Was antworten Sie Herrn Lorenzen, was Frau Melzer? Welche zwei Argumente haben Sie, welches Beispiel? Welcher Kompromiss ist möglich?', 'Prenez cinq minutes pour trouver des mots-clés, pas des phrases entières : votre réponse à chacun, deux arguments, un exemple, un compromis possible.')}
${aide('Nützliche Formulierungen: „Herr Lorenzen hat gesagt, dass …“, „Das mag sein, aber …“, „Da ist etwas dran.“, „Ein Beispiel aus meiner Erfahrung: …“, „Wie wäre es, wenn …?“', 'Formules utiles pour reprendre, contredire, approuver en partie, illustrer et proposer.')}` },
      placements: [{ media: 'b2-arbeitswelt-atelier-sprechen-runde', caption: 'Gesprächsrunde „Homeoffice für alle?“' }],
      mission: {
        oral: { prompt: aide('Nehmen Sie an der Gesprächsrunde teil (zwei bis drei Minuten). Reagieren Sie auf beide Beiträge, vertreten Sie Ihre eigene Position mit zwei Argumenten und einem Beispiel, und schlagen Sie zum Schluss einen Kompromiss vor.',
          'Participez à la table ronde (deux à trois minutes) : réagissez aux deux interventions, défendez votre position avec deux arguments et un exemple, puis proposez un compromis.'),
          maxSeconds: 180 },
        written: null,
        checklist: [
          aide('Ich greife beide Beiträge auf und nenne die Personen.', 'Je reprends les deux interventions en nommant les personnes.'),
          aide('Ich widerspreche höflich: „Das mag sein, aber …“', 'Je contredis poliment.'),
          aide('Meine Position hat zwei Argumente und ein Beispiel.', 'Ma position a deux arguments et un exemple.'),
          aide('Zum Schluss schlage ich einen Kompromiss vor.', 'Pour finir, je propose un compromis.'),
        ],
        criteria: [
          { ...GRIDS.b2.sprechen[0], label: aide('Aufgabe: auf beide Beiträge reagiert, eigene Position mit zwei Argumenten und Beispiel, Kompromiss', 'Tâche : réaction aux deux avis, position argumentée, compromis') },
          ...GRIDS.b2.sprechen.slice(1),
        ],
      } },

    // 8 · Bilanz
    { id: 'b2-arbeitswelt-atelier-bilan', kind: 'lesson', title: 'Bilanz: Arbeitswelt', estimatedMinutes: 6,
      competences: ['lecture'],
      lesson: { description: `${aide('Lesen Sie die Ziele der beiden Module zur Arbeitswelt. Was können Sie schon gut? Was möchten Sie noch üben?', 'Relisez les objectifs des deux modules sur le monde du travail. Que savez-vous déjà bien faire ? Que voulez-vous encore travailler ?')}

ICH KANN …
• ${aide('Ich kann einen Artikel über künstliche Intelligenz im Büro verstehen und die Positionen unterscheiden.', 'Je peux comprendre un article sur l’IA au bureau et distinguer les positions.')}
• ${aide('Ich kann im Namen eines Teams eine formelle E-Mail mit einem Vorschlag schreiben.', 'Je peux écrire un courriel formel avec une proposition au nom d’une équipe.')}
• ${aide('Ich kann in einer Diskussion höflich widersprechen, nachfragen und einen Kompromiss vorschlagen.', 'Je peux, dans une discussion, contredire poliment, demander des précisions et proposer un compromis.')}
• ${aide('Ich kann die Ergebnisse einer Umfrage sachlich für eine andere Person zusammenfassen.', 'Je peux résumer de façon neutre les résultats d’une enquête pour quelqu’un d’autre.')}
• ${aide('Ich kann sagen, was getan werden muss oder hätte getan werden müssen.', 'Je peux dire ce qui doit être fait ou ce qui aurait dû être fait.')}

STRATEGIEN
• ${aide('Formelle E-Mail: Ausgangslage anerkennen, Folgen belegen, konkret vorschlagen.', 'Courriel formel : reconnaître la situation, prouver les conséquences, proposer concrètement.')}
• ${aide('Diskussion: erst auf das Gesagte reagieren, dann die eigene Position begründen.', 'Discussion : réagir d’abord à ce qui a été dit, puis justifier sa position.')}
• ${aide('Grafik erklären: die wichtigste Aussage zuerst, dann nur die Zahlen, die sie belegen.', 'Expliquer un graphique : l’idée principale d’abord, puis seulement les chiffres qui l’appuient.')}

NOCH NICHT SICHER?
${aide('Passiv mit Modalverb und Passiversatz: Lesen Sie die Regel und wiederholen Sie die Übungen im Modul „Arbeitswelt“. Formelle Wendungen: Lesen Sie die E-Mail von Silke Kröger und den Wortschatz dieses Ateliers. Satzstellung im Nebensatz: Machen Sie die Übung „Korrigieren“ noch einmal.', 'Passif avec modal et équivalents : reprenez la règle et les exercices du module « Arbeitswelt ». Formules formelles : relisez le courriel de Silke Kröger et le lexique de cet atelier. Ordre des mots : refaites l’exercice « Korrigieren ».')}` } },
  ],
};
