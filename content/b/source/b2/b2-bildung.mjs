// Module B2 n° 5 · thème « Bildung » (lot R5). Études, formation professionnelle et formation tout au long de la vie : un
// article argumentatif sur le faux choix entre études et apprentissage, une réunion d'information sur les études en
// parallèle d'un emploi (prise de notes longue), un message d'un service d'orientation (l'écoute authentique -hoeren2 vient
// du lot M2). Grammaire : participe épithète étendu (die seit Jahren steigende Zahl, die zu erwartenden Kosten) et style
// nominal ou verbal (nach Abschluss der Ausbildung ↔ nachdem man die Ausbildung abgeschlossen hat). Consignes et
// explications en allemand, aide française repliée ([fr?]).
import { C2, aide, choice, fill, order, match } from '../../lib.mjs';

/** « Richtig / falsch / steht nicht im Text » (lecture) ou « nicht gesagt » (écoute) : r, f ou n pour la bonne réponse. */
const rf = (id, statement, answer, explanation) => choice(id, `„${statement}“ ${C2.richtigFalsch}`,
  [['richtig', answer === 'r'], ['falsch', answer === 'f'], ['steht nicht im Text', answer === 'n']], explanation);
const rfHoeren = (id, statement, answer, explanation) => choice(id, `„${statement}“ ${aide('Richtig, falsch oder nicht gesagt?', 'Vrai, faux ou non dit ?')}`,
  [['richtig', answer === 'r'], ['falsch', answer === 'f'], ['nicht gesagt', answer === 'n']], explanation);
/** Indices affichés sous les trous d'un fill (forme de base à transformer). */
const hints = (question, ...values) => ({ ...question,
  blanks: question.blanks.map((blank, index) => (values[index] ? { ...blank, hint: values[index] } : blank)) });

const ARTIKEL_A = 'Lange galt in Deutschland eine einfache Regel: Wer Abitur hat, studiert; wer keines hat, macht eine Ausbildung. Diese Regel stimmt schon lange nicht mehr. Die seit Jahren steigende Zahl der Studienanfänger hat dazu geführt, dass inzwischen etwa ebenso viele junge Menschen ein Studium beginnen wie eine duale Ausbildung. Fachleute sprechen von einer „Akademisierung“ der Gesellschaft. Gleichzeitig bleiben in vielen Handwerksbetrieben die für den Herbst ausgeschriebenen Ausbildungsplätze unbesetzt.';
const VORSPANN = 'Jedes Jahr stehen Hunderttausende junge Menschen vor derselben Entscheidung: Hochschule oder Betrieb? Doch die scheinbar klare Alternative verliert an Bedeutung.';

export default {
  id: 'b2-bildung',
  title: 'Bildung: Studium, Ausbildung und lebenslanges Lernen',
  objective: 'Comprendre un article argumentatif sur le choix entre études et formation professionnelle, suivre une réunion d’information sur les études en parallèle d’un emploi en prenant des notes, lire et reformuler le style nominal des textes informatifs (participe épithète étendu, nominalisation).',
  grammarFocus: ['partizipialattribut', 'nominalisierung'],
  sources: ['Textes, réunion d’information, message et exercices originaux LinguaCap.'],

  vocabulary: [
    { word: 'Studium', article: 'das', plural: 'Studien', partOfSpeech: 'noun', translation: 'les études (supérieures)',
      example: 'Nach dem Studium möchte sie im Ausland arbeiten.', note: 'ein Studium beginnen, abschließen, abbrechen' },
    { word: 'Ausbildung', article: 'die', plural: 'Ausbildungen', partOfSpeech: 'noun', translation: 'la formation professionnelle, l’apprentissage',
      example: 'Er macht eine Ausbildung zum Mechatroniker.', note: 'eine Ausbildung zum / zur … machen' },
    { word: 'duale Ausbildung', partOfSpeech: 'expression', translation: 'la formation en alternance (entreprise et école professionnelle)',
      example: 'In der dualen Ausbildung lernt man im Betrieb und in der Berufsschule.', note: 'die duale Ausbildung · das duale Studium' },
    { word: 'Ausbildungsbetrieb', article: 'der', plural: 'Ausbildungsbetriebe', partOfSpeech: 'noun', translation: 'l’entreprise formatrice',
      example: 'Ihr Ausbildungsbetrieb hat ihr das Studium empfohlen.', note: null },
    { word: 'Berufsschule', article: 'die', plural: 'Berufsschulen', partOfSpeech: 'noun', translation: 'l’école professionnelle (en alternance)',
      example: 'Zwei Tage pro Woche geht sie in die Berufsschule.', note: null },
    { word: 'Abschluss', article: 'der', plural: 'Abschlüsse', partOfSpeech: 'noun', translation: 'le diplôme, la fin (d’une formation)',
      example: 'Nach Abschluss der Ausbildung hat er ein Jahr im Betrieb gearbeitet.', note: 'einen Abschluss machen / erwerben' },
    { word: 'Hochschule', article: 'die', plural: 'Hochschulen', partOfSpeech: 'noun', translation: 'l’établissement d’enseignement supérieur',
      example: 'Die Hochschule bietet drei berufsbegleitende Studiengänge an.', note: 'die Fachhochschule : université de sciences appliquées' },
    { word: 'Studiengang', article: 'der', plural: 'Studiengänge', partOfSpeech: 'noun', translation: 'la filière, le cursus',
      example: 'Der Studiengang dauert acht Semester.', note: null },
    { word: 'berufsbegleitend', partOfSpeech: 'adjective', translation: 'en parallèle d’un emploi',
      example: 'Sie studiert berufsbegleitend Soziale Arbeit.', note: null },
    { word: 'Weiterbildung', article: 'die', plural: 'Weiterbildungen', partOfSpeech: 'noun', translation: 'la formation continue',
      example: 'Viele Betriebe bezahlen ihren Mitarbeitenden eine Weiterbildung.', note: null },
    { word: 'sich weiterbilden', partOfSpeech: 'verb', translation: 'se former, se perfectionner',
      example: 'Wer sich regelmäßig weiterbildet, bleibt auf dem Arbeitsmarkt gefragt.', note: 'séparable : weiter|bilden' },
    { word: 'Fachkraft', article: 'die', plural: 'Fachkräfte', partOfSpeech: 'noun', translation: 'le travailleur qualifié, la travailleuse qualifiée',
      example: 'Im Handwerk fehlen überall Fachkräfte.', note: 'der Fachkräftemangel : la pénurie de main-d’œuvre qualifiée' },
    { word: 'Durchlässigkeit', article: 'die', plural: null, partOfSpeech: 'noun', translation: 'la perméabilité (passerelles entre filières)',
      example: 'Die Durchlässigkeit des Bildungssystems ist größer geworden.', note: 'sans pluriel · durchlässig : perméable' },
    { word: 'Zulassung', article: 'die', plural: 'Zulassungen', partOfSpeech: 'noun', translation: 'l’admission',
      example: 'Für die Zulassung brauchen Sie drei Jahre Berufserfahrung.', note: 'zulassen : admettre' },
    { word: 'Voraussetzung', article: 'die', plural: 'Voraussetzungen', partOfSpeech: 'noun', translation: 'la condition préalable',
      example: 'Unter bestimmten Voraussetzungen kann man ohne Abitur studieren.', note: 'unter dieser Voraussetzung : à cette condition' },
    { word: 'anrechnen', partOfSpeech: 'verb', translation: 'valider, prendre en compte (des acquis)',
      example: 'Kann die Hochschule Module aus meiner Ausbildung anrechnen?', note: 'séparable : an|rechnen · jemandem etwas anrechnen' },
    { word: 'Studiengebühr', article: 'die', plural: 'Studiengebühren', partOfSpeech: 'noun', translation: 'les frais de scolarité',
      example: 'Für das berufsbegleitende Studium fallen Studiengebühren an.', note: 'surtout au pluriel' },
    { word: 'Studienabbruch', article: 'der', plural: 'Studienabbrüche', partOfSpeech: 'noun', translation: 'l’abandon des études',
      example: 'Die meisten Studienabbrüche passieren im ersten Jahr.', note: 'ein Studium abbrechen' },
    { word: 'Quereinsteiger', article: 'der', plural: 'Quereinsteiger', partOfSpeech: 'noun', translation: 'la personne en reconversion (venue d’un autre métier)',
      example: 'Als Quereinsteiger bringt er viel Praxiserfahrung mit.', note: 'die Quereinsteigerin · der Quereinstieg' },
    { word: 'lebenslanges Lernen', partOfSpeech: 'expression', translation: 'l’apprentissage tout au long de la vie',
      example: 'Lebenslanges Lernen ist in vielen Berufen selbstverständlich geworden.', note: 'das lebenslange Lernen' },
    { word: 'Wissen vermitteln', partOfSpeech: 'expression', translation: 'transmettre des connaissances',
      example: 'Eine gute Lehrerin vermittelt nicht nur Wissen, sondern auch Neugier.', note: null },
    { word: 'eine Prüfung ablegen', partOfSpeech: 'expression', translation: 'passer un examen',
      example: 'Am Ende des Semesters legen die Studierenden eine Prüfung ab.', note: 'bestehen : réussir · durchfallen : échouer' },
    { word: 'Akademisierung', article: 'die', plural: null, partOfSpeech: 'noun', translation: 'la hausse de la part des diplômés du supérieur',
      example: 'Fachleute sprechen von einer Akademisierung der Gesellschaft.', note: 'sans pluriel' },
    { word: 'Chancengleichheit', article: 'die', plural: null, partOfSpeech: 'noun', translation: 'l’égalité des chances',
      example: 'Gute Beratung ist eine Frage der Chancengleichheit.', note: 'sans pluriel' },
    { word: 'Entscheidungsdruck', article: 'der', plural: null, partOfSpeech: 'noun', translation: 'la pression de devoir décider',
      example: 'Viele Jugendliche stehen nach dem Abitur unter großem Entscheidungsdruck.', note: 'sans pluriel · unter Druck stehen' },
  ],

  media: [
    { key: 'b2-bildung-lesen-artikel', kind: 'image', title: 'Article : études ou formation professionnelle ?',
      alt: 'Début d’un article de magazine intitulé « Studium oder Ausbildung? » : le nombre d’étudiants augmente depuis des années, tandis que des places d’apprentissage restent vacantes dans l’artisanat.',
      image: { layout: 'article', kicker: 'Bildung', icon: 'graduation-cap', title: 'Studium oder Ausbildung?',
        byline: 'Warum die Frage oft falsch gestellt wird · Von Swantje Eckhard', lead: VORSPANN, paragraphs: [ARTIKEL_A] } },
    { key: 'b2-bildung-hoeren-audio', kind: 'audio', title: 'Réunion d’information : étudier en parallèle d’un emploi',
      script: [
        { voice: 'frau2', name: 'Merle Fröhlich', text: 'Guten Abend und herzlich willkommen an der Hochschule Nordhafen. Mein Name ist Merle Fröhlich, ich leite die Studienberatung. Schön, dass so viele von Ihnen nach der Arbeit gekommen sind. Heute geht es um unsere berufsbegleitenden Studiengänge, also um ein Studium, das man neben dem Beruf absolviert.' },
        { voice: 'frau2', name: 'Merle Fröhlich', text: 'Wir bieten zurzeit drei solche Studiengänge an: Maschinenbau, Betriebswirtschaft und Soziale Arbeit. Alle drei schließen mit einem Bachelor ab und dauern in der Regel acht Semester, also vier Jahre. Das ist etwas länger als ein Vollzeitstudium, dafür verdienen Sie weiter Ihr Gehalt.' },
        { voice: 'frau2', name: 'Merle Fröhlich', text: 'Wie läuft das konkret ab? Der größte Teil des Studiums findet online statt: Sie arbeiten mit Lernmaterialien und Videos, wann es Ihnen passt. Dazu kommen Präsenzphasen an der Hochschule, und zwar ein Samstag pro Monat und einmal im Jahr eine Blockwoche im Sommer.' },
        { voice: 'frau2', name: 'Merle Fröhlich', text: 'Zu den Kosten: Das berufsbegleitende Studium ist bei uns gebührenpflichtig. Sie zahlen zweihundertneunzig Euro im Monat. Viele Arbeitgeber beteiligen sich an diesen Kosten, es lohnt sich also, im eigenen Betrieb nachzufragen. Und noch etwas: Der Abschluss ist genau derselbe wie im Vollzeitstudium. Auf Ihrem Zeugnis steht nicht, dass Sie berufsbegleitend studiert haben.' },
        { voice: 'frau2', name: 'Merle Fröhlich', text: 'So, jetzt haben Sie sicher Fragen. Ja, bitte, der Herr in der zweiten Reihe.' },
        { voice: 'mann3', name: 'Valentin Rieger', text: 'Guten Abend, Valentin Rieger. Ich bin Industriemechaniker und arbeite seit zwölf Jahren im Schichtdienst. Ein Abitur habe ich nicht. Kann ich mich trotzdem für Maschinenbau bewerben?' },
        { voice: 'frau2', name: 'Merle Fröhlich', text: 'Ja, das können Sie. Mit einer abgeschlossenen Berufsausbildung und mindestens drei Jahren Berufserfahrung in einem passenden Bereich bekommen Sie bei uns die Zulassung auch ohne Abitur. Wir empfehlen Ihnen allerdings dringend unseren Vorkurs in Mathematik. Er beginnt sechs Wochen vor dem Semester und ist kostenlos.' },
        { voice: 'mann3', name: 'Valentin Rieger', text: 'Und wird meine Ausbildung angerechnet? Ich habe ja schon vieles gelernt, was im Studium vorkommt.' },
        { voice: 'frau2', name: 'Merle Fröhlich', text: 'Das prüfen wir im Einzelfall. Bei Industriemechanikern rechnen wir häufig bis zu zwei Module an, zum Beispiel Werkstoffkunde und technisches Zeichnen. Dafür reichen Sie Ihr Zeugnis und eine Beschreibung Ihrer Tätigkeiten ein. Ein ganzes Semester sparen Sie dadurch allerdings nicht.' },
        { voice: 'mann3', name: 'Valentin Rieger', text: 'Und wie viel Zeit muss ich pro Woche einplanen?' },
        { voice: 'frau2', name: 'Merle Fröhlich', text: 'Rechnen Sie mit fünfzehn bis zwanzig Stunden pro Woche. Das ist neben einer Vollzeitstelle viel, das möchte ich ganz ehrlich sagen. Die meisten Studienabbrüche passieren im ersten Jahr, weil die Leute die Belastung unterschätzt haben. Sprechen Sie vorher mit Ihrer Familie, und klären Sie mit Ihrem Arbeitgeber, ob Sie Ihre Arbeitszeit reduzieren können.' },
        { voice: 'mann3', name: 'Valentin Rieger', text: 'Und wenn ich merke, dass es zu viel wird? Kann ich dann eine Pause machen?' },
        { voice: 'frau2', name: 'Merle Fröhlich', text: 'Ja. Sie können sich für ein oder zwei Semester beurlauben lassen, zum Beispiel bei Krankheit oder wenn ein Kind kommt. In dieser Zeit zahlen Sie keine Gebühren.' },
        { voice: 'frau2', name: 'Merle Fröhlich', text: 'Ja, bitte, Sie haben auch eine Frage?' },
        { voice: 'frau3', name: 'Paulina Zielińska', text: 'Ja, Paulina Zielińska. Ich bin Erzieherin und interessiere mich für Soziale Arbeit. Ich habe zwei kleine Kinder. Sind die Samstage Pflicht? Und gibt es an diesen Tagen eine Kinderbetreuung?' },
        { voice: 'frau2', name: 'Merle Fröhlich', text: 'Die Präsenztage sind Pflicht, weil dort die Prüfungen und die praktischen Übungen stattfinden. Sie dürfen aber pro Semester einen Termin versäumen. Eine Kinderbetreuung bieten wir samstags leider noch nicht an. Wir arbeiten daran, aber versprechen kann ich Ihnen nichts.' },
        { voice: 'frau3', name: 'Paulina Zielińska', text: 'Hm, das macht es für mich schwierig. Wann ist denn der Bewerbungsschluss?' },
        { voice: 'frau2', name: 'Merle Fröhlich', text: 'Für das Wintersemester ist Bewerbungsschluss am fünfzehnten Juli. Mein Tipp: Kommen Sie vorher zu einem persönlichen Beratungsgespräch. Dann schauen wir gemeinsam, ob das Studium zu Ihrer Lebenssituation passt. Termine können Sie auf der Internetseite der Studienberatung buchen.' },
        { voice: 'frau2', name: 'Merle Fröhlich', text: 'Vielen Dank für Ihre Aufmerksamkeit. Im Foyer liegen Broschüren für Sie bereit, und ich bleibe gern noch für weitere Fragen hier.' },
      ] },
    { key: 'b2-bildung-kontrolle-audio', kind: 'audio', title: 'Message vocal du service de conseil en formation',
      script: [
        { voice: 'frau', name: 'Frederike Lamm', text: 'Guten Tag, hier spricht Frederike Lamm von der Weiterbildungsberatung der Stadt. Sie hatten uns wegen eines berufsbegleitenden Studiums geschrieben. Vielen Dank für Ihre Nachricht.' },
        { voice: 'frau', name: 'Frederike Lamm', text: 'Für das von Ihnen gewünschte Beratungsgespräch hätte ich am Donnerstag um sechzehn Uhr einen Termin frei. Bringen Sie bitte Ihre Zeugnisse und einen kurzen Lebenslauf mit, damit wir prüfen können, welche Leistungen angerechnet werden können.' },
        { voice: 'frau', name: 'Frederike Lamm', text: 'Und noch ein Hinweis: Für Weiterbildungen gibt es verschiedene Förderprogramme. Darüber sprechen wir dann am Donnerstag. Bitte bestätigen Sie den Termin bis morgen Mittag per E-Mail. Vielen Dank und bis bald!' },
      ] },
  ],

  activities: [
    // 1 · Einstieg
    { id: 'b2-bildung-einstieg', kind: 'lesson', title: 'Einstieg: Bildungswege', estimatedMinutes: 10,
      competences: ['lecture', 'expression-orale'],
      lesson: { description: `BILDUNG
[fr?] Formation et éducation
${aide('Studium oder Ausbildung, Vollzeit oder neben dem Beruf, mit zwanzig oder mit fünfzig: In diesem Modul geht es um Bildungswege und um die Frage, wie man im Leben weiterlernt.', 'Études ou apprentissage, à temps plein ou en parallèle d’un emploi, à vingt ou à cinquante ans : ce module parle des parcours de formation et de la manière de continuer à apprendre toute sa vie.')}

FRAGEN ZUM EINSTIEG
• ${aide('Welchen Bildungsweg sind Sie gegangen, und warum?', 'Quel parcours de formation avez-vous suivi, et pourquoi ?')}
• ${aide('Hat in Ihrem Herkunftsland ein Studium mehr Ansehen als eine Ausbildung?', 'Dans votre pays d’origine, les études ont-elles plus de prestige qu’une formation professionnelle ?')}
• ${aide('Was haben Sie zuletzt gelernt, das nichts mit der Schule zu tun hatte?', 'Qu’avez-vous appris récemment qui n’avait rien à voir avec l’école ?')}
${aide('Antworten Sie in Gedanken auf Deutsch, jeweils in drei oder vier Sätzen.', 'Répondez mentalement en allemand, en trois ou quatre phrases à chaque fois.')}

ZIELE
• ${aide('Ich kann einen argumentativen Artikel über Bildungswege verstehen und die Positionen unterscheiden.', 'Je peux comprendre un article argumentatif sur les parcours de formation et en distinguer les positions.')}
• ${aide('Ich kann einer Informationsveranstaltung folgen und dabei ausführliche Notizen machen.', 'Je peux suivre une réunion d’information en prenant des notes détaillées.')}
• ${aide('Ich kann Partizipialattribute verstehen: „die seit Jahren steigende Zahl“.', 'Je peux comprendre les participes épithètes étendus : « le nombre qui augmente depuis des années ».')}
• ${aide('Ich kann Nominalstil in Verbalstil umformen und umgekehrt: „nach Abschluss der Ausbildung“.', 'Je peux passer du style nominal au style verbal et inversement : « après la fin de la formation ».')}

WICHTIGE WÖRTER
• die duale Ausbildung — Lernen im Betrieb und in der Berufsschule
• das Studium — Lernen an einer Hochschule oder Universität
• der Abschluss — das Zeugnis am Ende einer Schule, Ausbildung oder eines Studiums
• berufsbegleitend — neben der Arbeit
• die Weiterbildung — Lernen nach der ersten Ausbildung, oft für den Beruf
• anrechnen — schon Gelerntes offiziell berücksichtigen
• die Zulassung — die Erlaubnis, ein Studium zu beginnen
• der Quereinsteiger — jemand, der aus einem ganz anderen Beruf kommt` } },

    // 2 · Lecture longue : article argumentatif
    { id: 'b2-bildung-lesen', kind: 'exercise', title: 'Verstehen: Studium oder Ausbildung?', estimatedMinutes: 22,
      competences: ['lecture'],
      lesson: { description: `${C2.lesen}

STRATEGIE
1. ${aide('Global: Lesen Sie Titel, Vorspann und letzten Absatz. Welche Frage stellt der Artikel, und welche Antwort gibt die Autorin?', 'Lecture globale : lisez le titre, le chapeau et le dernier paragraphe. Quelle question l’article pose-t-il, et quelle réponse l’autrice donne-t-elle ?')}
2. ${aide('Selektiv: Drei Personen kommen zu Wort. Markieren Sie in Gedanken, wer was sagt.', 'Lecture sélective : trois personnes s’expriment. Repérez mentalement qui dit quoi.')}
3. ${aide('Detailliert: Lange Nomengruppen wie „die für den Herbst ausgeschriebenen Ausbildungsplätze“ lesen Sie am besten vom Artikel direkt zum Nomen und dann zurück.', 'Lecture détaillée : lisez les longs groupes nominaux de l’article directement jusqu’au nom, puis revenez aux compléments.')}

STUDIUM ODER AUSBILDUNG?
[fr?] Article de magazine : études ou formation professionnelle ?
Warum die Frage oft falsch gestellt wird · Von Swantje Eckhard
${VORSPANN}
(A) ${ARTIKEL_A}
(B) Moritz Hagedorn kennt dieses Problem aus nächster Nähe. Der Ausbildungsleiter eines mittelständischen Metallbaubetriebs in Kassel konnte in diesem Jahr nur vier seiner acht Ausbildungsplätze besetzen. „Viele Eltern halten eine Ausbildung immer noch für die zweite Wahl“, sagt er. „Dabei verdienen unsere Meister oft mehr als mancher Kollege mit Bachelorabschluss.“ Ein Argument hört er in Gesprächen mit Eltern besonders oft: Wer studiert, hat später mehr Möglichkeiten. Hagedorn lässt das nur teilweise gelten. „Nach Abschluss der Ausbildung kann man bei uns den Meister machen oder ein Studium anschließen. Die Türen stehen in beide Richtungen offen.“ Seit zwei Jahren stellt sich sein Betrieb deshalb an Gymnasien vor, bisher mit mäßigem Erfolg.
(C) Genau diese Durchlässigkeit des Bildungssystems hält die Bildungsforscherin Yasemin Ertürk für entscheidend. „Die eigentliche Frage lautet nicht: Studium oder Ausbildung? Sie lautet: Was passt zu mir, und wie komme ich später weiter?“, sagt sie. Ertürk verweist auf die wachsende Zahl dualer Studiengänge, in denen Studierende abwechselnd an der Hochschule und im Betrieb lernen. Auch ohne Abitur kann man heute unter bestimmten Voraussetzungen studieren, etwa nach einer abgeschlossenen Ausbildung und mehreren Jahren Berufserfahrung. Viele junge Menschen wissen das allerdings nicht, kritisiert Ertürk: „Die Berufsorientierung an den Gymnasien konzentriert sich zu sehr auf das Studium und zu wenig auf die vielen Wege, die es daneben gibt.“
(D) Merit Thiel ist ein Beispiel für einen solchen Weg. Nach der Realschule begann die heute 22-Jährige eine Ausbildung zur Mechatronikerin. „Mit sechzehn hatte ich genug von der Schule, ich wollte endlich etwas mit den Händen machen“, erzählt sie. Ihre Eltern waren anfangs alles andere als begeistert: Sie hätten es lieber gesehen, wenn ihre Tochter Abitur gemacht hätte. Nach der Ausbildung arbeitete sie ein Jahr lang im Betrieb und merkte, dass sie die Anlagen nicht nur reparieren, sondern auch verstehen wollte. Heute studiert sie Elektrotechnik an einer Fachhochschule, die ihr einen Teil der in der Ausbildung erworbenen Kenntnisse angerechnet hat. „Im Labor bin ich den anderen oft einen Schritt voraus. Dafür musste ich im ersten Semester Mathe mühsam nachholen.“
(E) Was bedeutet das für Eltern und Schulen? Vor allem weniger Prestigedenken und mehr Information. Schulen sollten Betriebe ebenso selbstverständlich einladen wie Hochschulen, und Eltern sollten ihren Kindern zuhören, statt ihre eigenen Erwartungen auf sie zu übertragen. Ich halte es für einen Fehler, Ausbildung und Studium gegeneinander auszuspielen, wie es in vielen Debatten geschieht. Beide Wege haben ihre Berechtigung, und immer öfter verbinden sie sich in einem einzigen Lebenslauf. Wer mit sechzehn oder neunzehn eine Entscheidung trifft, legt sich damit nicht für immer fest. Das ist vielleicht die wichtigste Botschaft an eine Generation, die unter großem Entscheidungsdruck steht: Der erste Abschluss ist nicht der letzte.` },
      placements: [{ media: 'b2-bildung-lesen-artikel', caption: 'Artikel aus einem Bildungsmagazin' }],
      questions: [
        choice('q1', aide('Was ist die zentrale Aussage des Artikels?', 'Quelle est l’idée centrale de l’article ?'),
          [['Eine Ausbildung ist heute in jedem Fall die bessere Wahl als ein Studium.'],
            ['Studium und Ausbildung schließen sich nicht mehr für das ganze Leben aus.', true],
            ['Junge Menschen sollten erst nach einigen Berufsjahren an die Hochschule gehen.'],
            ['Die Hochschulen nehmen inzwischen zu viele Studierende ohne Abitur auf.']],
          aide('Titel („Warum die Frage oft falsch gestellt wird“) und Absatz E geben die Antwort: Beide Wege „verbinden sich in einem einzigen Lebenslauf“, und „der erste Abschluss ist nicht der letzte“. Der Text bevorzugt keinen Weg und kritisiert die Zulassung ohne Abitur nicht.',
            'Le titre et le paragraphe E le disent : les deux voies se combinent de plus en plus, et le premier diplôme n’est pas le dernier. L’article ne préfère aucune voie et ne critique pas l’admission sans baccalauréat.')),
        choice('q2', aide('Welche Position vertritt die Autorin im letzten Absatz?', 'Quelle position l’autrice défend-elle dans le dernier paragraphe ?'),
          [['Sie hält das Studium für den sichereren Weg in einen gut bezahlten Beruf.'],
            ['Sie fordert, dass Jugendliche sich später für einen Bildungsweg entscheiden.'],
            ['Sie bleibt neutral und gibt nur die Meinungen der Fachleute wieder.'],
            ['Sie hält es für falsch, die beiden Bildungswege gegeneinander auszuspielen.', true]],
          aide('„Ich halte es für einen Fehler, Ausbildung und Studium gegeneinander auszuspielen.“ Mit „Ich halte es für …“ äußert sie ihre eigene Meinung; sie ist also nicht neutral. Ein späteres Alter für die Entscheidung fordert sie nicht: Sie sagt nur, dass man sich nicht „für immer“ festlegt.',
            'Elle donne son avis à la première personne : opposer les deux voies est une erreur. Elle ne demande pas de décider plus tard ; elle dit seulement qu’une décision n’engage pas pour toujours.')),
        rf('q3', 'Moritz Hagedorn konnte in diesem Jahr alle Ausbildungsplätze in seinem Betrieb besetzen.', 'f',
          aide('Falsch: Er „konnte in diesem Jahr nur vier seiner acht Ausbildungsplätze besetzen“. Die Hälfte der Plätze bleibt also frei; das passt zu Absatz A („unbesetzt“).',
            'Faux : il n’a pourvu que quatre de ses huit places d’apprentissage ; la moitié reste vacante.')),
        choice('q4', aide('Was will Moritz Hagedorn mit seinem Hinweis auf das Gehalt der Meister zeigen?', 'Que veut montrer Moritz Hagedorn en évoquant le salaire des maîtres artisans ?'),
          [['dass eine Ausbildung keineswegs eine schlechtere Wahl sein muss', true], ['dass die Meister in seinem Betrieb zu viel Geld verdienen'],
            ['dass sich ein Bachelorabschluss finanziell nie lohnt'], ['dass er bald keine Meister mehr für seinen Betrieb findet']],
          aide('Er widerspricht den Eltern, die eine Ausbildung „für die zweite Wahl“ halten: „Dabei verdienen unsere Meister oft mehr als mancher Kollege mit Bachelorabschluss.“ „Oft“ und „mancher“ zeigen: Er sagt nicht, dass ein Studium sich „nie“ lohnt.',
            'Il répond aux parents qui voient l’apprentissage comme un second choix. « oft » et « mancher » nuancent : il ne prétend pas que les études ne rapportent jamais.')),
        rf('q5', 'Yasemin Ertürk meint, dass die Gymnasien zu wenig über die verschiedenen Bildungswege informieren.', 'r',
          aide('Richtig: „Die Berufsorientierung an den Gymnasien konzentriert sich zu sehr auf das Studium und zu wenig auf die vielen Wege, die es daneben gibt.“ Die Aussage gibt diese Kritik mit anderen Worten wieder.',
            'Vrai : selon elle, l’orientation dans les lycées se concentre trop sur les études et pas assez sur les autres voies.')),
        rf('q6', 'Merit Thiel möchte nach dem Studium in ihren Ausbildungsbetrieb zurückkehren.', 'n',
          aide('Steht nicht im Text: Wir erfahren, was sie gemacht hat und was sie heute studiert, aber nichts über ihre Pläne nach dem Studium.',
            'Non mentionné : le texte parle de son parcours et de ses études actuelles, pas de ses projets après le diplôme.')),
        match('q7', aide('Welche Überschrift passt zu welchem Absatz? Ordnen Sie zu.', 'Quel intertitre convient à quel paragraphe ? Associez.'),
          [['Absatz A', 'Eine alte Regel gilt nicht mehr'], ['Absatz B', 'Leere Plätze im Betrieb'], ['Absatz C', 'Mehr Wege, als viele wissen'],
            ['Absatz D', 'Von der Werkstatt ins Labor'], ['Absatz E', 'Der erste Abschluss ist nicht der letzte']],
          aide('A: Die Regel „Abitur, also Studium“ stimmt nicht mehr. B: Hagedorn findet nicht genug Auszubildende. C: Ertürk nennt Wege, die viele nicht kennen. D: Merit geht von der Ausbildung zum Studium. E: das Fazit der Autorin.',
            'A : la vieille règle ; B : des places vacantes ; C : des voies méconnues ; D : de l’atelier au laboratoire ; E : la conclusion de l’autrice.')),
        fill('q8', aide('Welches Wort aus dem Text passt? Ergänzen Sie.', 'Quel mot du texte convient ? Complétez.'),
          'Absatz A: Dass immer mehr junge Menschen studieren, nennen Fachleute eine [[1]] der Gesellschaft. · Absatz C: Wer abwechselnd an der Hochschule und im Betrieb lernt, macht ein [[2]] Studium. · Absatz D: Die Fachhochschule hat Merit einen Teil ihrer Kenntnisse [[3]].',
          [['Akademisierung'], ['duales'], ['angerechnet']],
          aide('„Akademisierung“: Immer mehr Menschen erwerben einen Hochschulabschluss. Ein Studium mit Phasen im Betrieb heißt „dual“; vor dem neutralen Nomen „Studium“ mit „ein“ endet das Adjektiv auf „-es“. „Anrechnen“: schon Gelerntes offiziell berücksichtigen.',
            'Akademisierung : la part croissante de diplômés du supérieur. « ein duales Studium » : adjectif en -es devant un neutre après ein. anrechnen : valider des acquis.')),
      ] },

    // 3 · Écoute longue : réunion d'information avec prise de notes
    { id: 'b2-bildung-hoeren', kind: 'exercise', title: 'Verstehen: ein Informationsabend zum Studium neben dem Beruf', estimatedMinutes: 22,
      competences: ['ecoute'],
      lesson: { description: `${C2.hoeren}

SITUATION
${aide('An der Hochschule Nordhafen stellt Merle Fröhlich von der Studienberatung die berufsbegleitenden Studiengänge vor. Danach stellen zwei Interessierte Fragen.', 'À la Hochschule Nordhafen, Merle Fröhlich, du service d’orientation, présente les études en parallèle d’un emploi. Deux personnes intéressées posent ensuite des questions.')}

STRATEGIE
1. ${aide('Lesen Sie vor dem Hören die Notizen. Überlegen Sie: Welche Information fehlt? Eine Zahl, ein Datum, ein Nomen?', 'Avant d’écouter, lisez les notes et demandez-vous ce qui manque : un nombre, une date, un nom ?')}
2. ${aide('Zahlen kommen oft schnell und nacheinander. Achten Sie auf das Wort danach: Semester, Euro, Stunden, Module.', 'Les nombres s’enchaînent vite : soyez attentif au mot qui suit (semestres, euros, heures, modules).')}
3. ${aide('Beim zweiten Hören: Achten Sie auch darauf, wie die Personen reagieren. Begeisterung und Zweifel hört man oft an kleinen Wörtern wie „Hm“ oder „allerdings“.', 'À la deuxième écoute, observez aussi les réactions : l’enthousiasme ou le doute s’entendent souvent dans de petits mots comme « Hm » ou « allerdings ».')}` },
      placements: [{ media: 'b2-bildung-hoeren-audio', caption: 'Informationsabend an der Hochschule Nordhafen' }],
      questions: [
        fill('q1', C2.notizen,
          'Studiengänge: Maschinenbau, Betriebswirtschaft, [[1]] · Dauer: [[2]] Semester · Präsenz: ein [[3]] pro Monat und eine Blockwoche im Sommer · Kosten: [[4]] Euro im Monat · Tipp: im eigenen [[5]] nach einer Beteiligung fragen · Abschluss: derselbe wie im [[6]]',
          [['Soziale Arbeit', 'soziale Arbeit'], ['acht', '8'], ['Samstag'], ['290', 'zweihundertneunzig'], ['Betrieb', 'Unternehmen', 'Firma'],
            ['Vollzeitstudium']],
          aide('Die drei Studiengänge sind „Maschinenbau, Betriebswirtschaft und Soziale Arbeit“. Sie dauern „acht Semester, also vier Jahre“. Präsenz: „ein Samstag pro Monat“. Kosten: „zweihundertneunzig Euro im Monat“. Viele Arbeitgeber zahlen mit: „im eigenen Betrieb nachzufragen“. Der Abschluss ist „genau derselbe wie im Vollzeitstudium“.',
            'Travail social, huit semestres, un samedi par mois, 290 euros par mois ; il faut demander une participation à son entreprise ; le diplôme est le même qu’à temps plein.')),
        fill('q2', C2.notizen,
          'Zulassung ohne Abitur: abgeschlossene [[1]] und mindestens [[2]] Jahre Berufserfahrung · empfohlen: kostenloser [[3]] in Mathematik · Anrechnung: bis zu [[4]] Module · Zeitaufwand: [[5]] bis zwanzig Stunden pro Woche · Bewerbungsschluss: [[6]] Juli',
          [['Berufsausbildung', 'Ausbildung'], ['drei', '3'], ['Vorkurs'], ['zwei', '2'], ['fünfzehn', '15'],
            ['15.', '15', 'fünfzehnter', 'fünfzehnten', 'am 15.', 'am fünfzehnten']],
          aide('„Mit einer abgeschlossenen Berufsausbildung und mindestens drei Jahren Berufserfahrung“ gibt es die Zulassung ohne Abitur. Empfohlen wird der kostenlose „Vorkurs in Mathematik“. Angerechnet werden „bis zu zwei Module“. Zeitaufwand: „fünfzehn bis zwanzig Stunden pro Woche“. Bewerbungsschluss: „am fünfzehnten Juli“.',
            'Formation terminée et au moins trois ans d’expérience ; cours préparatoire gratuit en maths ; jusqu’à deux modules validés ; quinze à vingt heures par semaine ; date limite le 15 juillet.')),
        choice('q3', aide('Wie spricht Frau Fröhlich über den Zeitaufwand des Studiums?', 'Comment Mme Fröhlich parle-t-elle du temps que demandent les études ?'),
          [['beruhigend: Die meisten Teilnehmenden schaffen es problemlos'], ['werbend: Vor allem die Online-Phasen machen alles leicht'],
            ['offen: Sie warnt davor, die Belastung zu unterschätzen', true], ['ausweichend: Sie nennt keine konkreten Zahlen']],
          aide('„Das ist neben einer Vollzeitstelle viel, das möchte ich ganz ehrlich sagen.“ Sie erwähnt sogar die Studienabbrüche im ersten Jahr, „weil die Leute die Belastung unterschätzt haben“. Sie nennt außerdem konkrete Zahlen (fünfzehn bis zwanzig Stunden).',
            'Elle est franche : c’est beaucoup à côté d’un temps plein, et beaucoup abandonnent la première année pour avoir sous-estimé la charge. Elle donne des chiffres précis.')),
        choice('q4', aide('Was erfährt Herr Rieger über die Anrechnung seiner Ausbildung?', 'Qu’apprend M. Rieger sur la validation de sa formation ?'),
          [['Einzelne Module können angerechnet werden, ein Semester sparen kann er nicht.', true],
            ['Seine Ausbildung ersetzt das erste Studienjahr vollständig.'],
            ['Eine Anrechnung ist nur für Studierende mit Abitur möglich.'],
            ['Für jedes angerechnete Modul muss er zusätzlich eine Prüfung ablegen.']],
          aide('„Bei Industriemechanikern rechnen wir häufig bis zu zwei Module an … Ein ganzes Semester sparen Sie dadurch allerdings nicht.“ Von einer zusätzlichen Prüfung ist keine Rede; er muss nur sein Zeugnis und eine Beschreibung seiner Tätigkeiten einreichen.',
            'Jusqu’à deux modules peuvent être validés, mais il ne gagne pas un semestre entier. Aucun examen supplémentaire : il suffit de fournir son certificat et une description de ses activités.')),
        choice('q5', aide('Wie reagiert Frau Zielińska auf die Antwort zur Kinderbetreuung?', 'Comment Mme Zielińska réagit-elle à la réponse sur la garde d’enfants ?'),
          [['Sie ist erleichtert, weil sie einen Samstag pro Semester versäumen darf.'], ['Sie entscheidet sich sofort gegen ein Studium.'],
            ['Sie beschwert sich, dass die Hochschule nichts für Eltern tut.'], ['Sie zweifelt, ob das Studium für sie machbar ist.', true]],
          aide('„Hm, das macht es für mich schwierig.“ Sie zweifelt, gibt aber nicht auf: Sie fragt gleich nach dem Bewerbungsschluss. Sie beschwert sich auch nicht; Frau Fröhlich sagt ja, dass die Hochschule an einer Lösung arbeitet.',
            'Elle doute (« cela complique les choses pour moi ») mais demande aussitôt la date limite : elle ne renonce pas et ne se plaint pas.')),
        rfHoeren('q6', 'Frau Fröhlich empfiehlt, vor der Bewerbung ein persönliches Beratungsgespräch zu vereinbaren.', 'r',
          aide('Richtig: „Mein Tipp: Kommen Sie vorher zu einem persönlichen Beratungsgespräch.“ „Vorher“ bedeutet hier: vor dem Bewerbungsschluss, also vor der Bewerbung.',
            'Vrai : elle conseille de venir avant à un entretien personnel, c’est-à-dire avant de postuler.')),
      ] },

    // 4 · Grammaire inductive
    { id: 'b2-bildung-entdecken', kind: 'exercise', title: 'Entdecken: lange Nomengruppen', estimatedMinutes: 10,
      competences: ['lecture'],
      lesson: { description: `${aide('Lesen Sie die Sätze aus dem Artikel und aus dem Informationsabend. Achten Sie auf die Wörter vor und nach den Nomen.', 'Lisez ces phrases de l’article et de la réunion d’information. Observez les mots placés avant et après les noms.')}

SÄTZE
(1) Die seit Jahren steigende Zahl der Studienanfänger hat dazu geführt, dass …
(2) Gleichzeitig bleiben in vielen Handwerksbetrieben die für den Herbst ausgeschriebenen Ausbildungsplätze unbesetzt.
(3) … einen Teil der in der Ausbildung erworbenen Kenntnisse.
(4) Nach Abschluss der Ausbildung kann man bei uns den Meister machen oder ein Studium anschließen.
(5) Genau diese Durchlässigkeit des Bildungssystems hält die Bildungsforscherin Yasemin Ertürk für entscheidend.
(6) Mit einer abgeschlossenen Berufsausbildung und mindestens drei Jahren Berufserfahrung bekommen Sie bei uns die Zulassung auch ohne Abitur.
(7) Die meisten Studienabbrüche passieren im ersten Jahr, …

${aide('Beantworten Sie dann die Fragen. Die Erklärungen formulieren die Regel.', 'Répondez ensuite aux questions : les explications formulent la règle.')}` },
      questions: [
        choice('q1', aide('Satz 1: Was bedeutet „die seit Jahren steigende Zahl“?', 'Phrase 1 : que signifie « die seit Jahren steigende Zahl » ?'),
          [['die Zahl, die seit Jahren gestiegen ist'], ['die Zahl, die seit Jahren steigt', true],
            ['die Zahl, die man seit Jahren steigert'], ['die Zahl, die seit Jahren steigen soll']],
          aide('„Steigend“ ist ein Partizip I (Infinitiv + d). Es hat aktive Bedeutung und beschreibt etwas, das gleichzeitig abläuft: Die Zahl steigt, und zwar seit Jahren. „Gestiegen“ wäre abgeschlossen, „man steigert“ hätte ein anderes Subjekt.',
            'steigend est un participe présent (infinitif + d) : sens actif, action en cours. Le nombre augmente depuis des années ; « gestiegen » exprimerait une action achevée.')),
        match('q2', aide('Welcher Relativsatz entspricht welcher Nomengruppe? Ordnen Sie zu.', 'Quelle relative correspond à quel groupe nominal ? Associez.'),
          [['die seit Jahren steigende Zahl', 'die Zahl, die seit Jahren steigt'],
            ['die für den Herbst ausgeschriebenen Plätze', 'die Plätze, die für den Herbst ausgeschrieben wurden'],
            ['die in der Ausbildung erworbenen Kenntnisse', 'die Kenntnisse, die man in der Ausbildung erworben hat'],
            ['eine abgeschlossene Berufsausbildung', 'eine Berufsausbildung, die man abgeschlossen hat']],
          aide('Partizip I (steigend) entspricht einem aktiven Relativsatz im Präsens. Partizip II eines Verbs mit Akkusativobjekt (ausgeschrieben, erworben, abgeschlossen) entspricht einem Passiv oder einer abgeschlossenen Handlung. Die Wörter zwischen Artikel und Partizip werden im Relativsatz zu Ergänzungen des Verbs.',
            'Participe présent = relative active au présent ; participe passé d’un verbe transitif = sens passif ou action achevée. Les mots placés entre l’article et le participe deviennent les compléments du verbe de la relative.')),
        choice('q3', aide('Sätze 1 bis 3: Wo stehen die zusätzlichen Informationen („seit Jahren“, „für den Herbst“, „in der Ausbildung“)?', 'Phrases 1 à 3 : où se trouvent les informations supplémentaires ?'),
          [['nach dem Nomen, wie in einem Relativsatz'], ['vor dem Artikel, am Anfang der Gruppe'],
            ['zwischen dem Artikel und dem Partizip', true], ['am Ende des Satzes, nach dem Verb']],
          aide('Das erweiterte Partizipialattribut hat die Form: Artikel + Erweiterung + Partizip + Nomen. „die | seit Jahren | steigende | Zahl“. Beim Lesen springt man deshalb vom Artikel zum Nomen und liest dann die Erweiterung.',
            'Article + compléments + participe + nom : les compléments se placent entre l’article et le participe. Pour lire, on saute de l’article au nom, puis on revient aux compléments.')),
        choice('q4', aide('Sätze 4, 5 und 7: Was haben „Abschluss“, „Durchlässigkeit“ und „Studienabbrüche“ gemeinsam?', 'Phrases 4, 5 et 7 : qu’ont en commun ces trois mots ?'),
          [['Es sind Nomen, die aus Verben oder Adjektiven gebildet sind.', true], ['Es sind Partizipien, die wie Adjektive dekliniert werden.'],
            ['Es sind Lehnwörter aus dem Englischen.'], ['Es sind Verben, die im Passiv stehen.']],
          aide('abschließen → der Abschluss, durchlässig → die Durchlässigkeit, abbrechen → der Abbruch. Solche Nominalisierungen machen Sachtexte knapp (Nominalstil). Oft folgt ein Genitiv: „der Ausbildung“, „des Bildungssystems“. Im Verbalstil hieße Satz 4: Nachdem man die Ausbildung abgeschlossen hat, …',
            'Ce sont des noms tirés de verbes ou d’adjectifs : c’est le style nominal, souvent suivi d’un génitif. En style verbal : « Nachdem man die Ausbildung abgeschlossen hat, … ».')),
      ] },

    // 5 · Règle
    { id: 'b2-bildung-regel', kind: 'lesson', title: 'Regel: Partizipialattribut und Nominalstil', estimatedMinutes: 10,
      competences: ['lecture'],
      lesson: { description: `REGEL: DAS ERWEITERTE PARTIZIPIALATTRIBUT
[fr?] Règle : le participe épithète étendu
${aide('In Sachtexten ersetzt ein Partizip vor dem Nomen oft einen Relativsatz. Das Partizip wird wie ein Adjektiv dekliniert.', 'Dans les textes informatifs, un participe placé devant le nom remplace souvent une relative ; il se décline comme un adjectif. Le français n’a pas cette construction : on traduit par une relative.')}

FORMEN
• ${aide('Partizip I (Infinitiv + d): aktiv und gleichzeitig. die steigende Zahl = die Zahl, die steigt.', 'Participe présent : sens actif, action simultanée ou en cours.')}
• ${aide('Partizip II von Verben mit Akkusativobjekt: passiv. die ausgeschriebenen Plätze = die Plätze, die ausgeschrieben wurden.', 'Participe passé d’un verbe transitif : sens passif (ou action achevée).')}
• ${aide('Partizip II von Verben mit Perfekt auf „sein“: aktiv und abgeschlossen. die gestiegenen Preise = die Preise, die gestiegen sind.', 'Participe passé d’un verbe qui se conjugue avec sein : sens actif, action achevée.')}
• ${aide('zu + Partizip I: Notwendigkeit oder Möglichkeit. die zu erwartenden Kosten = die Kosten, die man erwarten muss.', 'zu + participe présent : ce qui doit ou peut être fait, « les coûts à prévoir ».')}

STELLUNG
[fr?] Place des éléments
• ${aide('Artikel + Erweiterung + Partizip + Nomen: das von der Stadt finanzierte Programm.', 'Article + compléments + participe + nom ; les compléments gardent l’ordre qu’ils auraient dans la relative.')}
• ${aide('Lesetipp: Springen Sie vom Artikel direkt zum Nomen. Lesen Sie dann die Erweiterung.', 'Astuce de lecture : passez de l’article au nom, puis lisez les compléments.')}

REGEL: NOMINALSTIL UND VERBALSTIL
[fr?] Règle : style nominal et style verbal
${aide('Sachtexte verwandeln Verben oft in Nomen. Der Nominalstil ist knapp und sachlich; der Verbalstil ist leichter zu verstehen und typisch für die gesprochene Sprache.', 'Les textes informatifs transforment souvent les verbes en noms. Le style nominal est concis ; le style verbal est plus facile à comprendre et typique de l’oral.')}
• ${aide('nach + Nomen ↔ nachdem: Nach Abschluss der Ausbildung … ↔ Nachdem man die Ausbildung abgeschlossen hat, …', 'nach + nom ↔ nachdem + verbe (antériorité).')}
• ${aide('bei + Nomen ↔ wenn: Bei der Anmeldung … ↔ Wenn man sich anmeldet, …', 'bei + nom ↔ wenn (« lors de », « quand »).')}
• ${aide('wegen + Nomen ↔ weil: wegen der Erhöhung der Gebühren ↔ weil die Gebühren erhöht wurden.', 'wegen + nom ↔ weil (cause).')}
• ${aide('zu / zur + Nomen ↔ um … zu: zur Verbesserung der Beratung ↔ um die Beratung zu verbessern.', 'zur + nom ↔ um … zu (but).')}
• ${aide('trotz + Nomen ↔ obwohl: trotz der hohen Kosten ↔ obwohl die Kosten hoch sind.', 'trotz + nom ↔ obwohl (concession).')}
• ${aide('Das Akkusativobjekt wird zum Genitivattribut: die Gebühren erhöhen → die Erhöhung der Gebühren. Das Subjekt folgt mit „durch“: die Finanzierung durch die Stadt.', 'Le complément d’objet devient un génitif ; l’agent est introduit par durch.')}

NOMEN BILDEN
[fr?] Former des noms
• ${aide('-ung: erhöhen → die Erhöhung · Verbstamm: abschließen → der Abschluss, abbrechen → der Abbruch · Infinitiv: lernen → das Lernen · -heit, -keit: durchlässig → die Durchlässigkeit', '-ung, radical du verbe, infinitif substantivé (neutre, avec majuscule), -heit / -keit.')}

ACHTUNG
[fr?] Attention : les pièges des francophones
• ${aide('Das Partizip bekommt die Endung eines Adjektivs: mit der seit Jahren steigenden Zahl (Dativ).', 'Le participe prend la terminaison d’un adjectif épithète : n’oubliez pas la déclinaison.')}
• ${aide('Nomen auf -ung, -heit und -keit sind immer feminin; der substantivierte Infinitiv ist immer neutral und großgeschrieben: das Lernen.', 'Les noms en -ung, -heit, -keit sont féminins ; l’infinitif substantivé est neutre et prend une majuscule.')}
• ${aide('Beim Sprechen und in E-Mails klingen lange Partizipialattribute steif. Nehmen Sie dort lieber einen Relativsatz.', 'À l’oral et dans un courriel, les longs participes épithètes paraissent raides : préférez une relative.')}` } },

    // 6 · Grammaire : s'entraîner
    { id: 'b2-bildung-grammatik', kind: 'exercise', title: 'Üben: Partizipialattribut und Nominalisierung', estimatedMinutes: 14,
      competences: ['lecture', 'expression-ecrite'],
      lesson: { description: `${aide('Üben Sie die Formen. Lesen Sie jede Erklärung, auch wenn Ihre Antwort richtig ist.', 'Entraînez-vous aux formes. Lisez chaque explication, même si votre réponse est juste.')}

MERKE
• Artikel + Erweiterung + Partizip + Nomen: die seit Jahren steigende Zahl
• Partizip I aktiv · Partizip II passiv oder abgeschlossen · zu + Partizip I: muss oder kann
• nach + Nomen ↔ nachdem · bei ↔ wenn · wegen ↔ weil · zur ↔ um … zu · trotz ↔ obwohl` },
      questions: [
        hints(fill('q1', aide('Ergänzen Sie das Partizip mit der richtigen Endung.', 'Complétez avec le participe et la bonne terminaison.'),
          'die [[1]] Kosten · die im letzten Jahr [[2]] Reform · das erfolgreich [[3]] Studium',
          [['steigenden'], ['eingeführte'], ['abgeschlossene']],
          aide('Steigen → Partizip I „steigend“; Plural mit „die“ → „-en“. Einführen → Partizip II „eingeführt“; Femininum Singular mit „die“ → „-e“. Abschließen → „abgeschlossen“; Neutrum mit „das“ → „-e“. Die Endungen sind die des Adjektivs nach dem bestimmten Artikel.',
            'Participe présent ou passé, puis terminaison de l’adjectif après l’article défini : -en au pluriel, -e au nominatif singulier.')),
        'steigen (Partizip I)', 'einführen (Partizip II)', 'abschließen (Partizip II)'),
        order('q2', C2.ordnen,
          [['Die', 'seit dem letzten Jahr', 'von der Stadt', 'finanzierte', 'Beratung', 'ist', 'für alle Interessierten', 'kostenlos.'],
            ['Die', 'von der Stadt', 'seit dem letzten Jahr', 'finanzierte', 'Beratung', 'ist', 'für alle Interessierten', 'kostenlos.']],
          aide('Artikel „Die“, dann die Erweiterungen, dann das Partizip „finanzierte“ direkt vor dem Nomen „Beratung“. Danach folgt das Verb „ist“ an zweiter Stelle. Die beiden Erweiterungen dürfen die Plätze tauschen.',
            'L’article, puis les compléments, puis le participe juste devant le nom. Le verbe conjugué vient ensuite en deuxième position. Les deux compléments peuvent permuter.')),
        fill('q3', aide('Machen Sie aus dem Relativsatz ein Partizipialattribut.', 'Transformez la relative en participe épithète.'),
          'die Studierenden, die neben dem Beruf lernen → die neben dem Beruf [[1]] Studierenden · die Gebühren, die im Juli erhöht wurden → die im Juli [[2]] Gebühren · die Fragen, die noch geklärt werden müssen → die noch zu [[3]] Fragen',
          [['lernenden'], ['erhöhten'], ['klärenden']],
          aide('Aktiv und gleichzeitig → Partizip I: „lernend“. Passiv → Partizip II: „erhöht“. „Müssen“ + Passiv → „zu“ + Partizip I: „zu klärend“. Nach „die“ im Plural endet alles auf „-en“.',
            'Actif et simultané : participe présent ; passif : participe passé ; nécessité au passif : zu + participe présent. Au pluriel après die : -en.')),
        choice('q4', aide('Welche Nomengruppe entspricht „die Studentin, die gerade ihre Abschlussarbeit schreibt“?', 'Quel groupe nominal correspond à cette relative ?'),
          [['die gerade ihre Abschlussarbeit geschriebene Studentin'], ['die gerade ihre Abschlussarbeit schreibenden Studentin'],
            ['die Studentin gerade ihre Abschlussarbeit schreibende'], ['die gerade ihre Abschlussarbeit schreibende Studentin', true]],
          aide('Die Studentin schreibt (aktiv, gleichzeitig) → Partizip I „schreibend“. Femininum Singular, Nominativ, nach „die“ → „-e“. Das Partizip steht direkt vor dem Nomen. „Geschrieben“ wäre passiv: Die Studentin wird nicht geschrieben.',
            'Actif et en cours : participe présent, terminaison -e (féminin, nominatif). Le participe se place juste devant le nom ; « geschrieben » serait passif.')),
        match('q5', aide('Nominalstil und Verbalstil: Ordnen Sie zu.', 'Style nominal et style verbal : associez.'),
          [['nach Abschluss des Studiums', 'nachdem man das Studium abgeschlossen hat'], ['bei der Anmeldung', 'wenn man sich anmeldet'],
            ['wegen der Erhöhung der Gebühren', 'weil die Gebühren erhöht wurden'], ['zur Verbesserung der Beratung', 'um die Beratung zu verbessern'],
            ['trotz der guten Noten', 'obwohl die Noten gut sind']],
          aide('Jede Präposition hat eine passende Konjunktion: nach ↔ nachdem (vorher), bei ↔ wenn (gleichzeitig), wegen ↔ weil (Grund), zur ↔ um … zu (Ziel), trotz ↔ obwohl (Gegengrund). Aus dem Nomen wird wieder ein Verb, aus dem Genitiv das Objekt.',
            'Chaque préposition a sa conjonction : nach/nachdem, bei/wenn, wegen/weil, zur/um … zu, trotz/obwohl. Le nom redevient verbe et le génitif redevient complément.')),
        hints(fill('q6', aide('Formulieren Sie im Nominalstil.', 'Reformulez en style nominal.'),
          'Weil die Hochschule die Gebühren erhöht hat, … → Wegen der [[1]] der Gebühren … · Nachdem sie die Prüfung bestanden hatte, … → Nach dem [[2]] der Prüfung … · Um die Chancen zu verbessern, … → Zur [[3]] der Chancen …',
          [['Erhöhung'], ['Bestehen'], ['Verbesserung']],
          aide('erhöhen → die Erhöhung, verbessern → die Verbesserung (-ung, feminin). „Bestehen“ hat kein Nomen auf „-ung“: Man nimmt den substantivierten Infinitiv, „das Bestehen“, Dativ „dem Bestehen“. Das Objekt wird jeweils zum Genitiv: der Gebühren, der Prüfung, der Chancen.',
            '-ung pour erhöhen et verbessern ; pour bestehen, l’infinitif substantivé « das Bestehen ». Le complément devient un génitif.')),
        'erhöhen', 'bestehen', 'verbessern'),
        fill('q7', aide('Formulieren Sie im Verbalstil.', 'Reformulez en style verbal.'),
          'Nach Abschluss der Ausbildung arbeitete sie ein Jahr im Betrieb. → Nachdem sie die Ausbildung [[1]] hatte, arbeitete sie ein Jahr im Betrieb. · Trotz der hohen Belastung gibt er nicht auf. → Obwohl die Belastung hoch [[2]], gibt er nicht auf.',
          [['abgeschlossen', 'beendet'], ['ist']],
          aide('„Nach Abschluss“ wird zu „nachdem“ + Plusquamperfekt, weil die Handlung vor dem Arbeiten im Betrieb liegt: „abgeschlossen hatte“ („beendet hatte“ ist auch richtig). „Trotz“ wird zu „obwohl“, das Verb steht am Ende: „obwohl die Belastung hoch ist“.',
            'nach + nom → nachdem + plus-que-parfait (antériorité) ; trotz + nom → obwohl, verbe en fin de subordonnée.')),
        choice('q8', aide('Das Akkusativobjekt wird im Nominalstil zum Genitiv. Welche Form ist richtig? „Man verlängert die Bewerbungsfrist.“', 'Quelle forme est correcte ?'),
          [['die Verlängerung die Bewerbungsfrist'], ['die Verlängerung des Bewerbungsfrist'],
            ['die Verlängerung der Bewerbungsfrist', true], ['die Verlängerung der Bewerbungsfristes']],
          aide('„Die Bewerbungsfrist“ ist feminin; der Genitiv lautet „der Bewerbungsfrist“, ohne Endung am Nomen. „Des“ und die Endung „-es“ gibt es nur bei maskulinen und neutralen Nomen (des Studiums, des Abschlusses).',
            'Frist est féminin : génitif « der Bewerbungsfrist », sans terminaison sur le nom. des et -es ne valent que pour le masculin et le neutre.')),
        choice('q9', aide('Was bedeutet „die zu erwartenden Kosten“?', 'Que signifie « die zu erwartenden Kosten » ?'),
          [['die Kosten, die man schon bezahlt hat'], ['die Kosten, mit denen man rechnen muss', true],
            ['die Kosten, die gerade sinken'], ['die Kosten, die niemand erwartet hat']],
          aide('„zu“ + Partizip I drückt eine Notwendigkeit oder Möglichkeit im Passiv aus: Die Kosten müssen erwartet werden, man muss mit ihnen rechnen. Es geht also um die Zukunft, nicht um bereits bezahlte oder unerwartete Kosten.',
            'zu + participe présent : ce qui doit être fait, au passif. Les coûts « à prévoir » : il faut s’y attendre.')),
        hints(fill('q10', aide('Ergänzen Sie das Partizip mit der richtigen Endung.', 'Complétez avec le participe et la bonne terminaison.'),
          'Mit der seit Jahren [[1]] Nachfrage hat niemand gerechnet. · In den neu [[2]] Studiengängen gibt es noch freie Plätze.',
          [['wachsenden'], ['gegründeten']],
          aide('„Mit der … Nachfrage“ ist Dativ Singular feminin, „in den … Studiengängen“ Dativ Plural: Nach dem bestimmten Artikel enden beide Partizipien auf „-en“. „Wachsend“ ist aktiv (Partizip I), „gegründet“ passiv (Partizip II).',
            'Datif après l’article défini : -en dans les deux cas. wachsend (actif, participe présent), gegründet (passif, participe passé).')),
        'wachsen', 'gründen'),
      ] },

    // 7 · Lexique
    { id: 'b2-bildung-wortschatz', kind: 'exercise', title: 'Wortschatz: über Bildung sprechen', estimatedMinutes: 12,
      competences: ['lecture', 'expression-ecrite'],
      lesson: { description: `${aide('Lernen Sie die Wörter in festen Verbindungen und in Wortfamilien.', 'Apprenez les mots dans des expressions figées et des familles de mots.')}

TIPP
${aide('Auf Deutsch „passiert“ man keine Prüfung: Man legt sie ab, man schreibt sie, und am Ende besteht man sie oder fällt durch. Lernen Sie deshalb immer Nomen und Verb zusammen.', 'En allemand, on ne « passe » pas un examen avec un calque : on le présente (ablegen), on l’écrit, puis on le réussit (bestehen) ou on échoue (durchfallen). Apprenez toujours le nom avec son verbe.')}` },
      questions: [
        match('q1', aide('Welches Verb passt? Ordnen Sie zu.', 'Quel verbe convient ? Associez.'),
          [['eine Prüfung', 'ablegen'], ['Wissen', 'vermitteln'], ['Lücken', 'schließen'], ['den Lebensunterhalt', 'verdienen'], ['Entscheidungen', 'treffen']],
          aide('Eine Prüfung ablegen, Wissen vermitteln (weitergeben), Lücken schließen (Fehlendes nachholen), den Lebensunterhalt verdienen (Geld zum Leben), Entscheidungen treffen. Diese Verbindungen sind fest und lassen sich nicht wörtlich übersetzen.',
            'Passer un examen, transmettre des connaissances, combler des lacunes, gagner sa vie, prendre des décisions.')),
        fill('q2', aide('Bilden Sie das Nomen.', 'Formez le nom.'),
          'studieren → das [[1]] · ausbilden → die [[2]] · durchlässig → die [[3]] · abbrechen → der [[4]] · zulassen → die [[5]]',
          [['Studium'], ['Ausbildung'], ['Durchlässigkeit'], ['Abbruch'], ['Zulassung']],
          aide('Studieren → das Studium (unregelmäßig, Plural: die Studien). Verb + „-ung“: die Ausbildung, die Zulassung. Adjektiv auf „-ig“ + „-keit“: die Durchlässigkeit. Verbstamm mit Vokalwechsel: abbrechen → der Abbruch.',
            'das Studium (irrégulier) ; -ung pour ausbilden et zulassen ; -keit après un adjectif en -ig ; radical avec changement de voyelle : der Abbruch.')),
        choice('q3', aide('Welches Wort passt? „Viele Betriebe finden keine Mitarbeitenden mit passender Ausbildung. Man spricht vom …“', 'Quel mot convient ?'),
          [['Fachkräftemangel', true], ['Leistungsdruck'], ['Studienabbruch'], ['Quereinstieg']],
          aide('„Der Fachkräftemangel“: Es fehlen qualifizierte Arbeitskräfte. „Leistungsdruck“ ist der Druck, gute Ergebnisse zu bringen, ein „Studienabbruch“ das vorzeitige Ende eines Studiums und ein „Quereinstieg“ der Wechsel aus einem anderen Beruf.',
            'Fachkräftemangel : la pénurie de main-d’œuvre qualifiée. Les autres mots désignent la pression de la performance, l’abandon des études et la reconversion.')),
        choice('q4', aide('Sie stimmen einem Argument nur teilweise zu. Welche Formulierung passt?', 'Vous n’êtes d’accord qu’en partie avec un argument. Quelle formulation convient ?'),
          [['Das sehe ich genauso, ohne jede Einschränkung.'], ['Dem kann ich überhaupt nicht zustimmen.'],
            ['Darüber möchte ich lieber nicht sprechen.'], ['Das lasse ich nur teilweise gelten, denn …', true]],
          aide('„Etwas gelten lassen“ heißt „etwas als richtig anerkennen“; „nur teilweise“ schränkt ein. So reagiert Hagedorn im Artikel. Die anderen Sätze drücken volle Zustimmung, klare Ablehnung oder keine Meinung aus.',
            '« Das lasse ich nur teilweise gelten » : je ne l’admets qu’en partie. Les autres phrases expriment un accord total, un désaccord net ou un refus de répondre.')),
        match('q5', aide('Was bedeuten die Wörter? Ordnen Sie zu.', 'Que signifient ces mots ? Associez.'),
          [['berufsbegleitend', 'neben der Arbeit'], ['der Quereinsteiger', 'jemand, der aus einem anderen Beruf kommt'],
            ['die Zulassung', 'die Erlaubnis, ein Studium zu beginnen'], ['anrechnen', 'schon Gelerntes offiziell berücksichtigen']],
          aide('Alle vier Wörter kommen im Informationsabend vor: Herr Rieger möchte berufsbegleitend studieren, bekommt die Zulassung ohne Abitur, und die Hochschule rechnet Module aus seiner Ausbildung an. Als Industriemechaniker im Maschinenbau ist er aber kein Quereinsteiger.',
            'Ces mots apparaissent dans la réunion d’information : études en parallèle d’un emploi, reconversion, admission, validation des acquis.')),
        fill('q6', aide('Ergänzen Sie die Präpositionen.', 'Complétez avec les prépositions.'),
          'Sie bewirbt sich [[1]] einen Studienplatz. · Er hat sich [[2]] ein duales Studium entschieden. · Viele Eltern halten eine Ausbildung [[3]] die zweite Wahl.',
          [['um'], ['für'], ['für']],
          aide('Sich bewerben um + Akkusativ, sich entscheiden für + Akkusativ, etwas halten für + Akkusativ (eine Meinung über etwas haben). Lernen Sie diese Verben immer mit ihrer Präposition.',
            'Postuler à (sich bewerben um), choisir (sich entscheiden für), considérer comme (halten für), tous suivis de l’accusatif.')),
        choice('q7', aide('Was meint die Autorin mit „weniger Prestigedenken“ (Absatz E)?', 'Que veut dire l’autrice par « weniger Prestigedenken » ?'),
          [['Man sollte weniger Geld für teure Hochschulen ausgeben.'], ['Die Schulen sollten weniger über das Abitur informieren.'],
            ['Bildungswege sollte man nicht nach ihrem Ansehen bewerten.', true], ['Jugendliche sollten weniger über ihre Zukunft nachdenken.']],
          aide('„Das Prestige“ ist das Ansehen in der Gesellschaft. Die Autorin kritisiert die Haltung, eine Ausbildung sei „die zweite Wahl“ (Absatz B). Weniger Prestigedenken heißt: Wege nach ihrem Nutzen bewerten, nicht nach ihrem Ruf.',
            'Le prestige, c’est la considération sociale. L’autrice critique l’idée que l’apprentissage serait un second choix : il faut juger les voies sur leur utilité, pas sur leur réputation.')),
      ] },

    // 8 · Vérifier (l'écoute authentique b2-bildung-hoeren2 est insérée avant, par le lot M2)
    { id: 'b2-bildung-kontrolle', kind: 'exercise', title: 'Prüfen: eine Nachricht von der Weiterbildungsberatung', estimatedMinutes: 14,
      competences: ['lecture', 'ecoute'],
      lesson: { description: `${aide('Prüfen Sie, was Sie in diesem Modul gelernt haben: Hören, Grammatik und Wortschatz.', 'Vérifiez ce que vous avez appris dans ce module : écoute, grammaire et vocabulaire.')}

${aide('Sie haben sich bei der Weiterbildungsberatung Ihrer Stadt nach einem Studium erkundigt. Frau Lamm hat Ihnen eine Sprachnachricht hinterlassen. Hören Sie sie für die Fragen 1 bis 3.', 'Vous vous êtes renseigné auprès du service de conseil en formation de votre ville. Mme Lamm vous a laissé un message vocal. Écoutez-le pour les questions 1 à 3.')}` },
      placements: [{ media: 'b2-bildung-kontrolle-audio', caption: 'Nachricht von Frederike Lamm' }],
      questions: [
        choice('q1', aide('Warum ruft Frau Lamm an?', 'Pourquoi Mme Lamm appelle-t-elle ?'),
          [['Sie sagt einen bereits vereinbarten Termin ab.'], ['Sie bietet einen Termin für ein Beratungsgespräch an.', true],
            ['Sie bittet darum, die Unterlagen per Post zu schicken.'], ['Sie teilt mit, dass die Bewerbung angenommen wurde.']],
          aide('„Für das von Ihnen gewünschte Beratungsgespräch hätte ich am Donnerstag um sechzehn Uhr einen Termin frei.“ Der Termin wird angeboten und soll bestätigt werden; die Unterlagen bringt man zum Gespräch mit.',
            'Elle propose un rendez-vous jeudi à 16 h, à confirmer ; les documents sont à apporter à l’entretien.')),
        choice('q2', aide('Warum soll man Zeugnisse und einen Lebenslauf mitbringen?', 'Pourquoi faut-il apporter ses certificats et un CV ?'),
          [['damit man sich gleich für das Studium einschreiben kann'], ['damit die Förderung schon beantragt werden kann'],
            ['damit Frau Lamm einen neuen Lebenslauf schreiben kann'], ['damit geprüft werden kann, was angerechnet werden kann', true]],
          aide('„… damit wir prüfen können, welche Leistungen angerechnet werden können.“ Über die Förderprogramme will Frau Lamm erst im Gespräch sprechen; von einer Einschreibung sagt sie nichts.',
            'Pour vérifier quels acquis peuvent être validés. Les aides financières seront seulement abordées pendant l’entretien.')),
        hints(fill('q3', aide('Machen Sie aus dem Relativsatz ein Partizipialattribut.', 'Transformez la relative en participe épithète.'),
          'der Termin, der am Donnerstag stattfindet → der am Donnerstag [[1]] Termin · die Unterlagen, die mitgebracht werden müssen → die [[2]] Unterlagen · die Leistungen, die bereits erbracht wurden → die bereits [[3]] Leistungen',
          [['stattfindende'], ['mitzubringenden'], ['erbrachten']],
          aide('Aktiv und gleichzeitig → Partizip I: „stattfindend“, nach „der“ im Nominativ → „-e“. Notwendigkeit im Passiv → „zu“ + Partizip I; bei trennbaren Verben steht „zu“ zwischen Präfix und Stamm: „mitzubringend“. Passiv → Partizip II „erbracht“. Im Plural nach „die“ → „-en“.',
            'Participe présent pour l’actif ; zu + participe présent pour la nécessité, avec zu inséré dans les verbes séparables (mitzubringend) ; participe passé pour le passif.')),
        'stattfinden', 'mitbringen', 'erbringen'),
        order('q4', aide('Formulieren Sie mit „weil“: „Wegen der Erhöhung der Gebühren haben sich weniger Studierende angemeldet.“', 'Reformulez avec « weil ».'),
          [['Weil', 'die Gebühren', 'erhöht', 'wurden,', 'haben', 'sich', 'weniger', 'Studierende', 'angemeldet.']],
          aide('„Wegen der Erhöhung der Gebühren“ wird zu einem Nebensatz im Passiv: „Weil die Gebühren erhöht wurden“. Das Verb steht am Ende des Nebensatzes. Danach beginnt der Hauptsatz direkt mit dem Verb „haben“; das Reflexivpronomen „sich“ folgt gleich danach.',
            'Le groupe nominal devient une subordonnée au passif, verbe en fin de proposition. La principale commence ensuite par le verbe conjugué, suivi du pronom réfléchi.')),
        choice('q5', aide('Was bedeutet „die neu gegründete Fachhochschule“?', 'Que signifie « die neu gegründete Fachhochschule » ?'),
          [['die Fachhochschule, die neu gegründet wurde', true], ['die Fachhochschule, die gerade etwas gründet'],
            ['die Fachhochschule, die man neu gründen muss'], ['die Fachhochschule, die selbst Firmen gründet']],
          aide('„Gegründet“ ist ein Partizip II von „gründen“ (Verb mit Akkusativobjekt): Es hat passive Bedeutung. Die Fachhochschule wurde gegründet. Eine Notwendigkeit („muss“) würde man mit „zu“ + Partizip I ausdrücken: die neu zu gründende Fachhochschule.',
            'Participe passé d’un verbe transitif : sens passif, l’école a été fondée. La nécessité s’exprimerait avec zu + participe présent.')),
        fill('q6', aide('Ergänzen Sie die Wörter aus dem Modul.', 'Complétez avec des mots du module.'),
          'Wer neben dem Beruf studiert, studiert [[1]]. · Wer ein Studium vorzeitig beendet, [[2]] es ab. · Wer aus einem ganz anderen Beruf kommt, ist ein [[3]].',
          [['berufsbegleitend'], ['bricht'], ['Quereinsteiger']],
          aide('„berufsbegleitend“ studieren; ein Studium „abbrechen“ (er bricht ab, Vokalwechsel e → i); „der Quereinsteiger“ kommt aus einem anderen Beruf.',
            'Étudier en parallèle d’un emploi ; abandonner ses études (er bricht ab) ; la personne en reconversion.')),
        choice('q7', aide('Welcher Satz sagt dasselbe im Nominalstil? „Wenn Sie sich anmelden, brauchen Sie Ihr Zeugnis.“', 'Quelle phrase dit la même chose en style nominal ?'),
          [['Nach der Anmeldung brauchen Sie Ihr Zeugnis.'], ['Wegen der Anmeldung brauchen Sie Ihr Zeugnis.'],
            ['Bei der Anmeldung brauchen Sie Ihr Zeugnis.', true], ['Trotz der Anmeldung brauchen Sie Ihr Zeugnis.']],
          aide('„Wenn“ (gleichzeitig) entspricht „bei“ + Nomen: bei der Anmeldung. „Nach“ verlegt die Handlung auf später, „wegen“ nennt einen Grund und „trotz“ einen Gegengrund: Alle drei verändern den Sinn.',
            'wenn (simultanéité) ↔ bei + nom. nach, wegen et trotz changent le sens (après, à cause de, malgré).')),
      ] },
  ],
};
