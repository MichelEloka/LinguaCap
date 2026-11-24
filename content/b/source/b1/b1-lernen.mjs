// Module B1 n° 11 · thème « Lernen » (lot R2). Comparer des offres de formation, comprendre des conditions
// d'inscription, exprimer un but (um … zu, damit) et parler de ses projets d'apprentissage (zu + infinitif,
// ohne … zu, statt … zu).
// Reprise réécrite du brouillon B1 V1 (content/b1-v1/source/partie2-suite.mjs › b1-lernen) : offres de cours,
// comparaison de deux formations (courriel de Lea), leçon « um … zu et damit », dialogue de conseil Elif / Herr Franke.
import { C, bi, choice, fill, order, match, dictation, speak } from '../../lib.mjs';

/** « Richtig / falsch / steht nicht im Text » : r, f ou n pour la bonne réponse. */
const rf = (id, statement, answer, explanation) => choice(id, `„${statement}“ ${C.richtigFalsch}`,
  [['richtig', answer === 'r'], ['falsch', answer === 'f'], ['steht nicht im Text', answer === 'n']], explanation);
/** Indices affichés sous les trous d'un fill (forme de base à transformer). */
const hints = (question, ...values) => ({ ...question,
  blanks: question.blanks.map((blank, index) => (values[index] ? { ...blank, hint: values[index] } : blank)) });

export default {
  id: 'b1-lernen',
  title: 'Lernen : choisir une formation',
  objective: 'Comparer des offres de formation, comprendre des conditions d’inscription, exprimer un but avec um … zu et damit, et parler de ses projets d’apprentissage (zu + infinitif, ohne … zu, statt … zu).',
  grammarFocus: ['um-zu-damit', 'zu-infinitiv', 'ohne-statt-zu'],
  sources: [
    'Textes, dialogues et exercices originaux LinguaCap.',
    'Situations reprises et réécrites du brouillon B1 V1 (LinguaCap) : offres de cours, comparaison de deux formations, entretien de conseil.',
  ],

  vocabulary: [
    { word: 'Weiterbildung', article: 'die', plural: 'Weiterbildungen', partOfSpeech: 'noun', translation: 'la formation continue',
      example: 'Meine Firma bezahlt mir eine Weiterbildung.', note: 'sich weiterbilden : se former' },
    { word: 'Kursgebühr', article: 'die', plural: 'Kursgebühren', partOfSpeech: 'noun', translation: 'les frais d’inscription (d’un cours)',
      example: 'Die Kursgebühr beträgt 240 Euro.', note: null },
    { word: 'Anmeldefrist', article: 'die', plural: 'Anmeldefristen', partOfSpeech: 'noun', translation: 'la date limite d’inscription',
      example: 'Die Anmeldefrist endet am 15. September.', note: null },
    { word: 'sich anmelden für', partOfSpeech: 'verb', translation: 's’inscrire à',
      example: 'Ich habe mich für den Onlinekurs angemeldet.', note: '+ accusatif · séparable : an|melden' },
    { word: 'Voraussetzung', article: 'die', plural: 'Voraussetzungen', partOfSpeech: 'noun', translation: 'la condition (requise), le prérequis',
      example: 'Voraussetzung für den Kurs ist das Niveau A2.', note: null },
    { word: 'Zertifikat', article: 'das', plural: 'Zertifikate', partOfSpeech: 'noun', translation: 'le certificat',
      example: 'Nach dem Abschlusstest bekommen Sie ein Zertifikat.', note: null },
    { word: 'Teilnahmebestätigung', article: 'die', plural: 'Teilnahmebestätigungen', partOfSpeech: 'noun', translation: 'l’attestation de participation',
      example: 'Am Ende bekommen alle eine Teilnahmebestätigung.', note: null },
    { word: 'Ermäßigung', article: 'die', plural: 'Ermäßigungen', partOfSpeech: 'noun', translation: 'la réduction (de prix)',
      example: 'Für Studierende gibt es eine Ermäßigung von 20 Prozent.', note: null },
    { word: 'Präsenzkurs', article: 'der', plural: 'Präsenzkurse', partOfSpeech: 'noun', translation: 'le cours en présentiel',
      example: 'Im Präsenzkurs sehe ich die anderen jede Woche.', note: null },
    { word: 'Onlinekurs', article: 'der', plural: 'Onlinekurse', partOfSpeech: 'noun', translation: 'le cours en ligne',
      example: 'Der Onlinekurs findet dienstags per Videokonferenz statt.', note: null },
    { word: 'Lerngruppe', article: 'die', plural: 'Lerngruppen', partOfSpeech: 'noun', translation: 'le groupe d’étude',
      example: 'In meiner Lerngruppe üben wir jeden Samstag.', note: null },
    { word: 'Bildungsurlaub', article: 'der', plural: null, partOfSpeech: 'noun', translation: 'le congé de formation',
      example: 'Für den Sprachkurs nehme ich fünf Tage Bildungsurlaub.', note: 'existe dans la plupart des Länder' },
    { word: 'Abschluss', article: 'der', plural: 'Abschlüsse', partOfSpeech: 'noun', translation: 'le diplôme (de fin d’études)',
      example: 'Mit diesem Abschluss finde ich leichter eine Stelle.', note: null },
    { word: 'lebenslanges Lernen', partOfSpeech: 'expression', translation: 'l’apprentissage tout au long de la vie',
      example: 'Lebenslanges Lernen ist heute in vielen Berufen normal.', note: null },
    { word: 'ein Ziel erreichen', partOfSpeech: 'expression', translation: 'atteindre un objectif',
      example: 'Mit einem festen Plan habe ich mein Ziel erreicht.', note: null },
    { word: 'eine Prüfung bestehen', partOfSpeech: 'expression', translation: 'réussir un examen',
      example: 'Ich möchte im Juni die Prüfung bestehen.', note: 'contraire : durch eine Prüfung fallen' },
    { word: 'Fortschritte machen', partOfSpeech: 'expression', translation: 'faire des progrès',
      example: 'Seit ich jeden Tag übe, mache ich schnelle Fortschritte.', note: null },
    { word: 'sich vornehmen', partOfSpeech: 'verb', translation: 'se fixer (un objectif), prendre la résolution de',
      example: 'Ich habe mir vorgenommen, jeden Tag zehn Wörter zu lernen.', note: 'séparable : vor|nehmen · + zu + infinitif' },
    { word: 'regelmäßig', partOfSpeech: 'adjective', translation: 'régulier, régulièrement',
      example: 'Wer regelmäßig lernt, vergisst weniger.', note: null },
    { word: 'kostenlos', partOfSpeech: 'adjective', translation: 'gratuit',
      example: 'Der erste Termin ist kostenlos.', note: null },
    { word: 'wozu', partOfSpeech: 'adverb', translation: 'dans quel but, à quoi bon',
      example: 'Wozu brauchst du das Zertifikat?', note: 'réponse : um … zu ou damit' },
    { word: 'damit', partOfSpeech: 'conjunction', translation: 'pour que, afin que',
      example: 'Die Lehrerin spricht langsam, damit alle sie verstehen.', note: 'verbe à la fin ; sujet différent possible' },
  ],

  media: [
    { key: 'b1-lernen-lesen-angebote', kind: 'image', title: 'Deux offres de cours comparées',
      alt: 'Tableau comparant deux cours « Deutsch für den Beruf B1 » : A en soirée au centre de formation (240 €, certificat), B en ligne (195 €, attestation de participation).',
      image: { layout: 'table', icon: 'graduation-cap', title: 'Deutsch für den Beruf (B1)', subtitle: 'Zwei Kursangebote im Vergleich',
        columns: ['', 'Kurs A · Abendkurs', 'Kurs B · Onlinekurs'],
        rows: [['Ort', 'Bildungszentrum Nord, Raum 12', 'online, per Videokonferenz'], ['Zeit', 'Mo + Mi, 18:30–20:00', 'Di, 19:00–20:30 + Lernplattform'],
          ['Dauer', '12 Wochen', '10 Wochen'], ['Preis', '240 € (−20 % für Arbeitssuchende)', '195 €'],
          ['Abschluss', 'Zertifikat nach Abschlusstest', 'Teilnahmebestätigung'], ['Anmeldung', 'bis 15. September', 'jederzeit · Start: 1. Oktober']] } },
    { key: 'b1-lernen-hoeren-audio', kind: 'audio', title: 'Un entretien de conseil en formation',
      script: [
        { voice: 'mann3', name: 'Herr Franke', text: 'Guten Abend, kommen Sie herein. Mein Name ist Franke. Was kann ich für Sie tun?' },
        { voice: 'frau', name: 'Elif Kaya', text: 'Guten Abend. Ich heiße Elif Kaya. Ich suche einen Deutschkurs, um bei der Arbeit sicherer zu telefonieren. Ich arbeite in einem Reisebüro, und am Telefon verstehe ich die Kundinnen und Kunden manchmal nicht gut.' },
        { voice: 'mann3', name: 'Herr Franke', text: 'Da haben wir zwei passende Angebote. Der Kurs hier im Haus findet montags und mittwochs um halb sieben statt. Und dann gibt es noch unseren Onlinekurs am Dienstag um neunzehn Uhr.' },
        { voice: 'frau', name: 'Elif Kaya', text: 'Montags und mittwochs arbeite ich bis halb sieben. Das schaffe ich nicht.' },
        { voice: 'mann3', name: 'Herr Franke', text: 'Dann wäre der Onlinekurs wahrscheinlich besser für Sie. Er dauert zehn Wochen. Pro Woche sollten Sie mit etwa einer Stunde Hausaufgaben rechnen.' },
        { voice: 'frau', name: 'Elif Kaya', text: 'Das geht. Kann man im Onlinekurs auch Gespräche üben, oder liest man hauptsächlich Texte?' },
        { voice: 'mann3', name: 'Herr Franke', text: 'Sie üben sehr viel mündlich. Sie telefonieren zu zweit auf unserer Lernplattform und spielen Situationen aus dem Beruf. Beim ersten Treffen hilft Ihnen eine Kollegin, damit Sie Kamera und Mikrofon richtig einstellen können.' },
        { voice: 'frau', name: 'Elif Kaya', text: 'Sehr gut. Und was kostet der Kurs?' },
        { voice: 'mann3', name: 'Herr Franke', text: 'Hundertfünfundneunzig Euro. Viele Arbeitgeber bezahlen einen Teil davon. Es lohnt sich, Ihre Chefin zu fragen.' },
        { voice: 'frau', name: 'Elif Kaya', text: 'Das mache ich. Bekomme ich am Ende ein Zertifikat?' },
        { voice: 'mann3', name: 'Herr Franke', text: 'Sie bekommen eine Teilnahmebestätigung. Wenn Sie ein Zertifikat möchten, können Sie im Dezember bei uns eine Prüfung machen. Die kostet aber extra, nämlich achtzig Euro.' },
        { voice: 'frau', name: 'Elif Kaya', text: 'Ich möchte vorher wissen, ob ich den ersten Termin kostenlos ausprobieren kann.' },
        { voice: 'mann3', name: 'Herr Franke', text: 'Ja, das geht. Schreiben Sie mir bis Freitag eine E-Mail, um einen Platz für den Probetermin zu bekommen. Ohne Anmeldung kann ich Ihnen leider keinen Platz garantieren. Den Link schicke ich Ihnen dann am Montag.' },
        { voice: 'frau', name: 'Elif Kaya', text: 'Perfekt. Statt lange zu überlegen, schreibe ich Ihnen gleich morgen.' },
        { voice: 'mann3', name: 'Herr Franke', text: 'Wunderbar. Hier ist meine Karte mit der E-Mail-Adresse. Und wenn Sie noch Fragen haben, rufen Sie einfach an.' },
        { voice: 'frau', name: 'Elif Kaya', text: 'Vielen Dank, Herr Franke. Auf Wiedersehen!' },
        { voice: 'mann3', name: 'Herr Franke', text: 'Auf Wiedersehen, Frau Kaya, und viel Erfolg!' },
      ] },
    { key: 'b1-lernen-lesen2-forum', kind: 'image', title: 'Forum : « Abendkurs oder online? »',
      alt: 'Fil de forum « Abendkurs oder online? » : Miriam demande conseil ; Tarek, Katrin et Jo donnent leur avis sur les cours du soir et les cours en ligne.',
      image: { layout: 'forum', title: 'Abendkurs oder online – was ist besser?', posts: [
        { author: 'Miriam', date: '3. März', text: 'Hallo zusammen! Ich möchte mein Englisch für die Arbeit verbessern und überlege, ob ich einen Abendkurs an der Volkshochschule oder einen Onlinekurs machen soll. Ich arbeite Vollzeit und habe zwei Kinder. Welche Erfahrungen habt ihr gemacht?' },
        { author: 'Tarek', date: '3. März', text: 'Ich habe beides ausprobiert. Online war am Anfang super praktisch: kein Weg, keine Parkplatzsuche. Aber nach ein paar Wochen habe ich die Hausaufgaben oft nicht gemacht, weil mich niemand kontrolliert hat. Im Abendkurs bin ich viel motivierter, weil ich die anderen jede Woche sehe.' },
        { author: 'Katrin', date: '4. März', text: 'Mit Kindern würde ich auf jeden Fall online lernen! Ich mache gerade einen Französischkurs im Internet, immer wenn die Kinder im Bett sind. Wichtig ist, dass der Kurs Live-Stunden mit einer Lehrerin hat und nicht nur Videos. Sonst fehlt das Sprechen.' },
        { author: 'Jo', date: '4. März', text: 'Ich finde, das kommt auf dein Ziel an. Wenn du eine Prüfung machen musst, ist ein Kurs mit Lehrerin vor Ort besser, weil sie deine Fehler korrigiert. Für ein bisschen Konversation reicht auch eine App. Und frag doch mal deinen Arbeitgeber, ob er den Kurs bezahlt!' },
      ] } },
    { key: 'b1-lernen-kontrolle-audio', kind: 'audio', title: 'Un message du bureau des cours',
      script: [
        { voice: 'sprecherin', name: 'Kursbüro', text: 'Guten Tag, hier ist das Kursbüro des Bildungszentrums Nord. Wir haben eine wichtige Information zu Ihrem Abendkurs „Deutsch für den Beruf“.' },
        { voice: 'sprecherin', name: 'Kursbüro', text: 'Der Kurs beginnt nicht am zweiundzwanzigsten September, sondern eine Woche später, am neunundzwanzigsten September, weil unser Kursraum renoviert wird. Die Uhrzeit bleibt gleich.' },
        { voice: 'sprecherin', name: 'Kursbüro', text: 'Bitte bringen Sie zum ersten Termin Ihre Anmeldebestätigung und ein Wörterbuch mit. Wenn der neue Termin für Sie nicht passt, rufen Sie uns bitte bis Freitag an. Vielen Dank!' },
      ] },
  ],

  activities: [
    // 1 · Mise en route
    { id: 'b1-lernen-einstieg', kind: 'lesson', title: 'Mise en route : apprendre à l’âge adulte', estimatedMinutes: 10,
      competences: ['lecture', 'expression-orale'],
      lesson: { description: `LERNEN – EIN LEBEN LANG
[fr] Apprendre toute la vie
${bi('Eine Sprache, ein neuer Beruf, ein Hobby: Viele Erwachsene lernen neben der Arbeit. Aber welcher Kurs ist der richtige?', 'Une langue, un nouveau métier, un loisir : beaucoup d’adultes apprennent en plus de leur travail. Mais quel cours choisir ?')}

FRAGEN ZUM EINSTIEG
[fr] Questions pour commencer
• ${bi('Was haben Sie zuletzt Neues gelernt, und wo?', 'Quelle est la dernière chose nouvelle que vous avez apprise, et où ?')}
• ${bi('Lernen Sie lieber allein, in einer Gruppe oder online?', 'Préférez-vous apprendre seul(e), en groupe ou en ligne ?')}
• ${bi('Was möchten Sie in den nächsten zwei Jahren lernen, und wozu?', 'Que voulez-vous apprendre dans les deux prochaines années, et dans quel but ?')}
${bi('Antworten Sie in Gedanken auf Deutsch, in zwei oder drei Sätzen.', 'Répondez mentalement en allemand, en deux ou trois phrases.')}

ZIELE
[fr] Objectifs
• ${bi('Ich kann zwei Kursangebote vergleichen.', 'Je peux comparer deux offres de cours.')}
• ${bi('Ich kann die Bedingungen für eine Anmeldung verstehen.', 'Je peux comprendre les conditions d’une inscription.')}
• ${bi('Ich kann sagen, wozu ich etwas lerne: „um … zu“, „damit“.', 'Je peux dire dans quel but j’apprends : « um … zu », « damit ».')}
• ${bi('Ich kann über meine Lerngewohnheiten sprechen.', 'Je peux parler de mes habitudes d’apprentissage.')}

WICHTIGE WÖRTER
[fr] Mots-clés
• die Weiterbildung — la formation continue
• die Kursgebühr — les frais d’inscription
• die Anmeldefrist — la date limite d’inscription
• sich anmelden für — s’inscrire à
• das Zertifikat — le certificat
• der Präsenzkurs / der Onlinekurs — le cours en présentiel / en ligne
• eine Prüfung bestehen — réussir un examen
• um … zu / damit — pour, afin de / pour que` } },

    // 2 · Lecture longue avec stratégie
    { id: 'b1-lernen-lesen', kind: 'exercise', title: 'Comprendre : deux offres de cours et un article', estimatedMinutes: 20,
      competences: ['lecture'],
      lesson: { description: `${C.lesen}

STRATEGIE
[fr] Stratégie
1. ${bi('Global: Lesen Sie die Überschrift und den ersten Satz jedes Absatzes. Worum geht es im Artikel?', 'Lecture globale : lisez le titre et la première phrase de chaque paragraphe. De quoi parle l’article ?')}
2. ${bi('Für die Kursangebote: Vergleichen Sie Zeile für Zeile, also Ort, Zeit, Dauer, Preis und Abschluss.', 'Pour les offres de cours : comparez ligne par ligne, c’est-à-dire lieu, horaire, durée, prix et diplôme.')}
3. ${bi('Für die Details: Suchen Sie die Schlüsselwörter der Aufgabe und lesen Sie genau.', 'Pour les détails : cherchez les mots-clés de la question et lisez ce passage avec précision.')}

KURSANGEBOTE
[fr] Les offres de cours
Kurs A ist ein Abendkurs „Deutsch für den Beruf (B1)“ im Bildungszentrum Nord: montags und mittwochs von 18:30 bis 20:00 Uhr, zwölf Wochen lang. Er kostet 240 Euro, und Arbeitssuchende bekommen 20 Prozent Ermäßigung. Nach einem Abschlusstest gibt es ein Zertifikat. Die Anmeldefrist endet am 15. September.
Kurs B ist ein Onlinekurs mit dem gleichen Titel: dienstags von 19:00 bis 20:30 Uhr per Videokonferenz, dazu Übungen auf einer Lernplattform, zehn Wochen lang. Er kostet 195 Euro. Am Ende bekommt man eine Teilnahmebestätigung. Man kann sich jederzeit anmelden, der Kurs beginnt am 1. Oktober.

NIE ZU ALT ZUM LERNEN
[fr] Article : on n’est jamais trop vieux pour apprendre
(A) Jedes Jahr besuchen Millionen Erwachsene in Deutschland einen Kurs: Sie lernen eine Sprache, machen eine Weiterbildung für den Beruf oder entdecken ein neues Hobby. Die Gründe sind ganz verschieden. Viele lernen, um im Beruf weiterzukommen. Andere möchten einfach etwas Neues ausprobieren.
(B) Für Erwachsene ist es aber oft nicht leicht, regelmäßig zu lernen. Arbeit, Familie und Haushalt kosten viel Zeit. „Ich habe mir jedes Jahr vorgenommen, Spanisch zu lernen, aber es hat nie geklappt“, erzählt Paula Neumann, 41, Krankenpflegerin aus Bremen. Erst als sie einen festen Kurs am Dienstagabend gebucht hat, hat sie wirklich angefangen.
(C) Fachleute für Erwachsenenbildung raten deshalb, kleine und konkrete Ziele zu setzen. Statt „Ich lerne Spanisch“ sagt man besser: „Ich lerne jeden Tag zehn neue Wörter.“ Hilfreich ist auch eine Lerngruppe. Wer mit anderen lernt, gibt nicht so schnell auf, und die Gruppe sorgt dafür, dass man dranbleibt.
(D) Und das Geld? Weiterbildung muss nicht teuer sein. Viele Arbeitgeber bezahlen einen Teil der Kursgebühr, damit ihre Mitarbeiter neue Kenntnisse bekommen. In den meisten Bundesländern haben Angestellte außerdem ein Recht auf Bildungsurlaub: Sie können bis zu fünf Tage im Jahr frei nehmen, um eine Weiterbildung zu machen, ohne Urlaubstage zu verlieren. Leider wissen das viele Menschen nicht.` },
      placements: [{ media: 'b1-lernen-lesen-angebote', caption: 'Zwei Kursangebote' }],
      questions: [
        choice('q1', bi('Was ist das Thema des Artikels?', 'Quel est le thème de l’article ?'),
          [['wie Kinder in der Schule besser lernen'], ['warum und wie Erwachsene weiterlernen', true], ['welche Sprachen man heute lernen sollte']],
          'Le titre « Nie zu alt zum Lernen » et le premier paragraphe (« Millionen Erwachsene … ») annoncent le thème : les adultes qui se forment, leurs raisons, leurs difficultés et des solutions.'),
        choice('q2', bi('Was möchte der Artikel vor allem zeigen?', 'Que veut surtout montrer l’article ?'),
          [['Auch Erwachsene können gut lernen, wenn sie es klug planen.', true], ['Weiterbildung ist für Erwachsene meistens zu teuer.'],
            ['Nur ein fester Kurs am Abend führt wirklich zum Erfolg.']],
          'L’article reconnaît les difficultés (le temps, l’argent) mais donne des solutions : petits objectifs, groupe, aide de l’employeur, congé de formation. Il dit même que la formation « muss nicht teuer sein ». Le cours de Paula n’est qu’un exemple.'),
        rf('q3', 'Paula Neumann hat sofort angefangen, Spanisch zu lernen.', 'f',
          'Faux : « Ich habe mir jedes Jahr vorgenommen, Spanisch zu lernen, aber es hat nie geklappt. » Elle n’a vraiment commencé qu’après avoir réservé un cours fixe (« Erst als … »).'),
        rf('q4', 'Laut Artikel ist es besser, sich kleine und konkrete Ziele zu setzen.', 'r',
          'Vrai : « Fachleute … raten deshalb, kleine und konkrete Ziele zu setzen. » L’exemple : dix mots nouveaux par jour plutôt que « j’apprends l’espagnol ».'),
        rf('q5', 'Bildungsurlaub gibt es in allen Bundesländern.', 'f',
          'Faux : « In den meisten Bundesländern » signifie « dans la plupart », pas dans tous. Attention aux petits mots comme meistens, die meisten, manche : ils changent le sens.'),
        choice('q6', bi('Lina arbeitet montags bis 19 Uhr und braucht ein Zertifikat. Welcher Kurs passt?', 'Lina travaille le lundi jusqu’à 19 h et a besoin d’un certificat. Quel cours convient ?'),
          [['Kurs A'], ['Kurs B'], ['keiner von beiden', true]],
          'Le cours A commence le lundi à 18 h 30, quand Lina travaille encore. Le cours B ne délivre qu’une attestation de participation, pas de certificat. Aucun des deux ne remplit les deux conditions.'),
        match('q7', bi('Welche Überschrift passt zu welchem Absatz? Ordnen Sie zu.', 'Quel intertitre convient à quel paragraphe ? Associez.'),
          [['Absatz A', 'Viele Gründe zu lernen'], ['Absatz B', 'Wenig Zeit im Alltag'], ['Absatz C', 'Kleine Ziele, eine Gruppe'], ['Absatz D', 'Wer bezahlt die Weiterbildung?']],
          'A présente les raisons d’apprendre, B le manque de temps (Arbeit, Familie, Haushalt), C les conseils des spécialistes (objectifs, groupe), D l’argent (employeur, congé de formation).'),
        fill('q8', bi('Ergänzen Sie mit Informationen aus den Kursangeboten.', 'Complétez avec les informations des offres de cours.'),
          'Ohne Ermäßigung kostet Kurs B [[1]] Euro weniger als Kurs A. Für Kurs A muss man sich bis zum [[2]] anmelden.',
          [['45', 'fünfundvierzig'], ['15. September', '15.9.', '15.09.', 'fünfzehnten September']],
          '240 − 195 = 45 euros d’écart. La date limite d’inscription (Anmeldefrist) du cours A est le 15 septembre ; pour le cours B, on peut s’inscrire à tout moment (jederzeit).'),
      ] },

    // 3 · Écoute longue : entretien de conseil
    { id: 'b1-lernen-hoeren', kind: 'exercise', title: 'Comprendre : un entretien de conseil en formation', estimatedMinutes: 18,
      competences: ['ecoute'],
      lesson: { description: `${C.hoeren}

SITUATION
[fr] La situation
${bi('Elif Kaya arbeitet in einem Reisebüro. Sie sucht einen Deutschkurs und lässt sich im Bildungszentrum Nord von Herrn Franke beraten.', 'Elif Kaya travaille dans une agence de voyages. Elle cherche un cours d’allemand et se fait conseiller par M. Franke au centre de formation.')}

STRATEGIE
[fr] Stratégie
1. ${bi('Beim ersten Hören: Was ist Elifs Ziel? Welcher Kurs passt am Ende?', 'Première écoute : quel est l’objectif d’Elif ? Quel cours retient-elle à la fin ?')}
2. ${bi('Lesen Sie dann die Notizen. Achten Sie auf Zahlen: Uhrzeit, Stunden, Euro.', 'Lisez ensuite les notes. Soyez attentif aux nombres : heures, durées, euros.')}
3. ${bi('Beim zweiten Hören: Achten Sie auf „um … zu“ und „damit“. Sie sagen, wozu etwas gut ist.', 'Deuxième écoute : repérez « um … zu » et « damit » : ils disent à quoi sert quelque chose.')}` },
      placements: [{ media: 'b1-lernen-hoeren-audio', caption: 'Elif und Herr Franke' }],
      questions: [
        fill('q1', C.notizen,
          'Ziel: bei der Arbeit sicherer [[1]] · passender Kurs: online, dienstags um [[2]] Uhr · Hausaufgaben: etwa [[3]] Stunde pro Woche · Prüfung für ein Zertifikat: im Dezember, [[4]] Euro extra · Probetermin: E-Mail bis [[5]]',
          [['telefonieren'], ['19', 'neunzehn'], ['eine', 'ein', '1'], ['80', 'achtzig'], ['Freitag', 'zum Freitag']],
          'Objectif : « um bei der Arbeit sicherer zu telefonieren ». Cours en ligne le mardi à 19 heures, environ une heure de devoirs par semaine. Le certificat demande un examen en décembre (80 euros en plus). Pour la séance d’essai : un courriel avant vendredi.'),
        choice('q2', bi('Warum passt Elif der Kurs im Haus nicht?', 'Pourquoi le cours sur place ne convient-il pas à Elif ?'),
          [['Er ist ihr mit 240 Euro einfach zu teuer.'], ['Sie arbeitet montags und mittwochs bis halb sieben.', true], ['Er dauert ihr mit zwölf Wochen zu lange.']],
          'Le cours sur place a lieu le lundi et le mercredi à 18 h 30, et Elif dit : « Montags und mittwochs arbeite ich bis halb sieben. Das schaffe ich nicht. » Le prix et la durée ne sont pas en cause.'),
        choice('q3', bi('Warum hilft beim ersten Treffen eine Kollegin?', 'Pourquoi une collègue aide-t-elle lors de la première séance ?'),
          [['damit alle die Hausaufgaben für die erste Woche verstehen'], ['damit die Teilnehmenden sich besser kennenlernen'],
            ['damit alle Kamera und Mikrofon richtig einstellen können', true]],
          '« Beim ersten Treffen hilft Ihnen eine Kollegin, damit Sie Kamera und Mikrofon richtig einstellen können. » Damit introduit le but ; le sujet change (la collègue aide, vous réglez).'),
        choice('q4', bi('Was rät Herr Franke wegen der Kosten?', 'Que conseille M. Franke à propos du prix ?'),
          [['Elif soll ihre Chefin fragen, ob die Firma etwas bezahlt.', true], ['Elif soll eine Ermäßigung für Arbeitssuchende beantragen.'],
            ['Elif soll den Kurs in drei Raten bezahlen.']],
          '« Viele Arbeitgeber bezahlen einen Teil davon. Es lohnt sich, Ihre Chefin zu fragen. » Il n’est question ni de réduction ni de paiement en plusieurs fois.'),
        choice('q5', bi('Was macht Elif als Nächstes?', 'Que fait Elif ensuite ?'),
          [['Sie meldet sich sofort für die Prüfung im Dezember an.'], ['Sie wartet auf den Link am Montag.'],
            ['Sie schreibt Herrn Franke schon morgen eine E-Mail.', true]],
          '« Statt lange zu überlegen, schreibe ich Ihnen gleich morgen. » Le lien arrivera lundi, mais seulement après son courriel ; l’examen n’est pas encore décidé.'),
      ] },

    // 4 · Grammaire inductive
    { id: 'b1-lernen-entdecken', kind: 'exercise', title: 'Découvrir : exprimer un but', estimatedMinutes: 10,
      competences: ['lecture'],
      lesson: { description: `${bi('Lesen Sie die Sätze aus dem Artikel und aus dem Beratungsgespräch. Achten Sie auf „um … zu“, „damit“, „ohne … zu“ und „statt … zu“.', 'Lisez ces phrases de l’article et de l’entretien. Observez « um … zu », « damit », « ohne … zu » et « statt … zu ».')}

SÄTZE
[fr] Le corpus
(1) Ich suche einen Deutschkurs, um bei der Arbeit sicherer zu telefonieren.
(2) Beim ersten Treffen hilft Ihnen eine Kollegin, damit Sie Kamera und Mikrofon richtig einstellen können.
(3) Viele Arbeitgeber bezahlen einen Teil der Kursgebühr, damit ihre Mitarbeiter neue Kenntnisse bekommen.
(4) Viele lernen, um im Beruf weiterzukommen.
(5) Es lohnt sich, Ihre Chefin zu fragen.
(6) Sie können bis zu fünf Tage im Jahr frei nehmen, ohne Urlaubstage zu verlieren.
(7) Statt lange zu überlegen, schreibe ich Ihnen gleich morgen.

${bi('Beantworten Sie dann die Fragen. Die Erklärungen formulieren die Regel.', 'Répondez ensuite aux questions. Les explications formulent la règle.')}` },
      questions: [
        choice('q1', bi('Satz 1: Wer möchte sicherer telefonieren?', 'Phrase 1 : qui veut téléphoner avec plus d’assurance ?'),
          [['Elif, also dieselbe Person, die den Kurs sucht', true], ['die Kundinnen und Kunden im Reisebüro'], ['Herr Franke, der Berater']],
          'Dans la phrase 1, c’est la même personne (ich) qui cherche le cours et qui veut mieux téléphoner. L’infinitif « telefonieren » n’a pas de sujet propre : il reprend celui de la principale. C’est le cas de um … zu.'),
        choice('q2', bi('Satz 2: Wer hilft, und wer stellt das Mikrofon ein?', 'Phrase 2 : qui aide, et qui règle le micro ?'),
          [['eine einzige Person, nämlich die Kollegin, die beides macht'], ['zwei verschiedene Personen: Die Kollegin hilft, „Sie“ stellen ein.', true], ['niemand, das macht die Lernplattform automatisch']],
          'La collègue aide ; les participants (Sie) règlent eux-mêmes caméra et micro. Il y a deux sujets différents : le but s’exprime alors avec damit + sujet + verbe conjugué à la fin (können).'),
        choice('q3', bi('Wann benutzt man „damit“ und nicht „um … zu“?', 'Quand emploie-t-on « damit » et pas « um … zu » ?'),
          [['quand la phrase principale est au passé ou au futur, jamais au présent'], ['toujours, dès que la phrase contient une virgule'],
            ['quand le but concerne une autre personne que le sujet de la principale', true]],
          'Avec deux sujets différents (phrases 2 et 3), um … zu est impossible : on emploie damit. Avec le même sujet, um … zu est la forme la plus naturelle (phrases 1 et 4), mais damit reste correct.'),
        match('q4', bi('Was bedeutet was? Ordnen Sie zu.', 'Que signifie chaque construction ? Associez.'),
          [['um … zu', 'un but, même sujet, infinitif avec zu à la fin'], ['damit', 'un but, sujet différent possible, verbe conjugué à la fin'],
            ['ohne … zu', 'sans faire quelque chose'], ['statt … zu', 'au lieu de faire quelque chose']],
          'Um, ohne et statt se construisent de la même façon : … zu + infinitif à la fin (phrases 1, 6, 7). Damit introduit une subordonnée complète avec son propre sujet et son verbe conjugué à la fin. Notez weiterzukommen (phrase 4) : avec un verbe à particule, zu se glisse au milieu.'),
      ] },

    // 5 · Règle
    { id: 'b1-lernen-regel', kind: 'lesson', title: 'À retenir : um … zu, damit, zu + infinitif, ohne et statt', estimatedMinutes: 10,
      competences: ['lecture'],
      lesson: { description: `À RETENIR — EXPRIMER UN BUT : UM … ZU ET DAMIT
Pour dire pourquoi on fait quelque chose (« pour », « afin de », « pour que »), l’allemand a deux constructions.
• Ich mache den Kurs, um sicherer zu telefonieren. — Je fais ce cours pour téléphoner avec plus d’assurance.
• Die Kollegin hilft, damit alle das Mikrofon einstellen können. — La collègue aide pour que tout le monde puisse régler le micro.
Um … zu + infinitif : même sujet dans les deux parties ; l’infinitif va à la fin, juste après zu. Damit + sujet + verbe conjugué à la fin : obligatoire quand les sujets sont différents, possible aussi avec le même sujet (Ich lerne viel, damit ich die Prüfung bestehe).

À RETENIR — L’INFINITIF AVEC ZU
Après beaucoup de verbes et d’expressions, l’infinitif complément prend zu : versuchen, vergessen, anfangen, aufhören, vorhaben, sich vornehmen, Lust haben, Zeit haben, es ist wichtig, es ist schwer, es lohnt sich…
• Ich habe vergessen, mich anzumelden. — J’ai oublié de m’inscrire.
• Es ist wichtig, regelmäßig zu üben. — Il est important de s’exercer régulièrement.
Verbe à particule : zu se glisse au milieu, en un seul mot (anzumelden, weiterzukommen, mitzubringen). Verbe sans particule séparable : zu reste devant (zu wiederholen, zu bezahlen). Pas de zu après les verbes de modalité (können, müssen, wollen, möchten…) : Ich möchte einen Kurs machen.

À RETENIR — OHNE … ZU ET STATT … ZU
• Sie hat sich angemeldet, ohne die Bedingungen zu lesen. — Elle s’est inscrite sans lire les conditions.
• Statt allein zu lernen, gehe ich in eine Lerngruppe. — Au lieu d’apprendre seul, je vais dans un groupe.
On dit aussi anstatt … zu. Comme pour um … zu, l’infinitif ferme la construction.

ATTENTION — LES PIÈGES DES FRANCOPHONES
• « Pour » + verbe ne se traduit jamais par für : « Ich lerne Deutsch für in Deutschland arbeiten » est faux ; on dit um in Deutschland zu arbeiten.
• L’infinitif va tout à la fin, après ses compléments : …, um die Prüfung zu bestehen (pas « um zu bestehen die Prüfung »).
• Damit (pour que) n’a rien à voir avec « avec ça » ; ne le confondez pas avec deshalb (c’est pourquoi).
• Um sert aussi pour l’heure (um acht Uhr) : c’est le zu + infinitif final qui signale le but.` } },

    // 6 · Grammaire : s'entraîner
    { id: 'b1-lernen-grammatik', kind: 'exercise', title: 'S’entraîner : um … zu, damit, zu + infinitif', estimatedMinutes: 14,
      competences: ['lecture', 'expression-ecrite'],
      lesson: { description: `${bi('Üben Sie „um … zu“, „damit“, „ohne … zu“, „statt … zu“ und den Infinitiv mit „zu“.', 'Entraînez-vous à « um … zu », « damit », « ohne … zu », « statt … zu » et à l’infinitif avec « zu ».')}

MERKE
[fr] À retenir
• um / ohne / statt … zu + infinitif à la fin : même sujet.
• damit + sujet + verbe conjugué à la fin : sujet différent possible.
• Verbe à particule : anzumelden, weiterzukommen.` },
      questions: [
        order('q1', C.ordnen, [['Ich', 'lerne', 'jeden Abend,', 'um', 'die Prüfung', 'zu', 'bestehen.']],
          'Le but avec le même sujet (ich) : um … zu. Le complément « die Prüfung » se place entre um et zu ; l’infinitif « bestehen » ferme la phrase.'),
        order('q2', C.ordnen, [['Der Lehrer', 'spricht', 'langsam,', 'damit', 'alle', 'ihn', 'verstehen.'],
          ['Der Lehrer', 'spricht', 'langsam,', 'damit', 'ihn', 'alle', 'verstehen.']],
          'Deux sujets différents (le professeur parle, tous comprennent) : damit. Le verbe « verstehen » va à la fin. Le pronom « ihn » peut se placer avant ou après « alle » : les deux ordres sont corrects.'),
        hints(fill('q3', bi('Ergänzen Sie den Infinitiv mit „zu“.', 'Complétez avec l’infinitif précédé de « zu ».'),
          'Ich habe vergessen, mich für den Kurs [[1]]. · Es ist wichtig, die Wörter regelmäßig [[2]].',
          [['anzumelden'], ['zu wiederholen']],
          'Anmelden a une particule séparable : zu se glisse au milieu, en un seul mot (anzumelden). Wiederholen (répéter, réviser) n’est pas séparable : zu reste devant, en deux mots (zu wiederholen).'),
        'anmelden', 'wiederholen'),
        choice('q4', bi('„Ich spreche mit meiner Chefin, … sie einen Teil der Kursgebühr bezahlt.“ Welches Wort passt?', 'Quel mot convient ?'),
          [['um'], ['damit', true], ['ohne']],
          'La suite a son propre sujet (sie) et un verbe conjugué à la fin (bezahlt) : seul damit est possible. Um et ohne demanderaient zu + infinitif.'),
        choice('q5', bi('„Ich gehe in die Bibliothek, … in Ruhe zu lernen.“ Welches Wort passt?', 'Quel mot convient ?'),
          [['um', true], ['damit'], ['weil']],
          'La suite est un infinitif avec zu, sans sujet : c’est um … zu (même sujet : ich vais à la bibliothèque, ich apprends). Damit et weil introduisent une subordonnée avec sujet et verbe conjugué.'),
        fill('q6', bi('Ergänzen Sie „ohne“ oder „statt“.', 'Complétez avec « ohne » ou « statt ».'),
          'Er hat sich angemeldet, [[1]] die Bedingungen zu lesen. · Ich lerne lieber mit anderen, [[2]] allein zu Hause zu sitzen.',
          [['ohne'], ['statt', 'anstatt']],
          'Ohne … zu : sans faire quelque chose (il n’a pas lu les conditions). Statt (anstatt) … zu : au lieu de faire quelque chose (je n’apprends pas seul chez moi).'),
        choice('q7', bi('Welcher Satz ist richtig?', 'Quelle phrase est correcte ?'),
          [['Ich möchte nächstes Jahr eine Weiterbildung zu machen.'], ['Ich möchte nächstes Jahr zu eine Weiterbildung machen.'],
            ['Ich möchte nächstes Jahr eine Weiterbildung machen.', true]],
          'Après un verbe de modalité (möchten, können, müssen…), l’infinitif s’emploie sans zu. C’est une erreur fréquente quand on vient de travailler zu + infinitif.'),
        match('q8', bi('Was passt zusammen? Ordnen Sie zu.', 'Qu’est-ce qui va ensemble ? Associez.'),
          [['Ich habe keine Lust,', 'heute noch Vokabeln zu lernen.'], ['Meine Chefin gibt mir frei,', 'damit ich am Freitag zur Prüfung gehen kann.'],
            ['Sie hat sich angemeldet,', 'ohne den Preis zu kennen.'], ['Ich spare jeden Monat Geld,', 'um im Sommer einen Intensivkurs zu bezahlen.']],
          'Lust haben + zu + infinitif ; damit quand le sujet change (la cheffe donne congé, je vais à l’examen) ; ohne … zu : sans connaître le prix ; um … zu : le but de celui qui économise.'),
        fill('q9', bi('Verbinden Sie die Sätze mit „um … zu“: „Ich lerne Vokabeln. Ich will die Prüfung bestehen.“', 'Reliez les phrases avec « um … zu ».'),
          'Ich lerne Vokabeln, [[1]] die Prüfung [[2]] bestehen.',
          [['um'], ['zu']],
          'Même sujet (ich) : la seconde phrase devient um … zu + infinitif. Le verbe de modalité « will » disparaît, le but est déjà exprimé par um … zu.'),
        order('q10', C.ordnen, [['Statt', 'jeden Tag', 'zu', 'fahren,', 'lerne', 'ich', 'online.']],
          'La construction statt … zu ouvre la phrase et compte comme premier élément : le verbe de la principale suit directement la virgule (lerne ich).'),
      ] },

    // 7 · Lexique
    { id: 'b1-lernen-wortschatz', kind: 'exercise', title: 'S’exercer : le vocabulaire de la formation', estimatedMinutes: 12,
      competences: ['lecture', 'expression-ecrite'],
      lesson: { description: `${bi('Lernen Sie Wörter zusammen: Nomen mit Verb, Wortfamilien und feste Formulierungen.', 'Apprenez les mots ensemble : nom et verbe, familles de mots et formules toutes faites.')}

ASTUCE
Le vocabulaire des cours se construit souvent par composition : der Kurs + die Gebühr = die Kursgebühr ; anmelden + die Frist = die Anmeldefrist. Le dernier mot donne le genre : die Gebühr, donc die Kursgebühr.` },
      questions: [
        match('q1', bi('Welches Verb passt? Ordnen Sie zu.', 'Quel verbe convient ? Associez.'),
          [['ein Ziel', 'erreichen'], ['sich für einen Kurs', 'anmelden'], ['eine Anmeldefrist', 'einhalten'], ['Fortschritte', 'machen'], ['einen Antrag', 'stellen']],
          'Ein Ziel erreichen (atteindre un objectif), sich für einen Kurs anmelden (s’inscrire à un cours), eine Frist einhalten (respecter un délai), Fortschritte machen (faire des progrès), einen Antrag stellen (déposer une demande).'),
        fill('q2', bi('Bilden Sie das Nomen.', 'Formez le nom.'),
          'teilnehmen → die [[1]] · anmelden → die [[2]] · prüfen → die [[3]] · ermäßigen → die [[4]]',
          [['Teilnahme'], ['Anmeldung'], ['Prüfung'], ['Ermäßigung']],
          'La plupart des verbes donnent un nom en -ung (die Anmeldung, die Prüfung, die Ermäßigung). Teilnehmen est une exception : die Teilnahme (comme annehmen → die Annahme). Tous sont féminins.'),
        choice('q3', bi('Was bedeutet „die Anmeldefrist“?', 'Que signifie « die Anmeldefrist » ?'),
          [['les frais d’inscription'], ['la date limite d’inscription', true], ['le formulaire d’inscription']],
          'Die Frist : le délai. Die Anmeldefrist : le délai, la date limite d’inscription. Les frais se disent die Kursgebühr, le formulaire das Anmeldeformular.'),
        hints(fill('q4', bi('Ergänzen Sie das Partizip.', 'Complétez avec le participe.'),
          'Ich habe die Prüfung [[1]]! · Leider ist mein Bruder durch die Prüfung [[2]].',
          [['bestanden'], ['gefallen']],
          'Eine Prüfung bestehen (réussir) : ich habe bestanden, avec haben. Durch eine Prüfung fallen (échouer) : er ist durchgefallen, avec sein, car fallen est un verbe de mouvement. On dit aussi : Er ist durch die Prüfung gefallen.'),
        'bestehen', 'durchfallen'),
        choice('q5', bi('Sie nennen Ihr Ziel. Welcher Satz ist richtig?', 'Vous indiquez votre objectif. Quelle phrase est correcte ?'),
          [['Mein Ziel ist, im Juni die Prüfung bestehen zu.'], ['Mein Ziel ist es, im Juni die Prüfung zu bestehen.', true],
            ['Mein Ziel ist es, um im Juni die Prüfung zu bestehen.']],
          '« Mein Ziel ist es, … zu + infinitif » : zu précède directement l’infinitif final. On n’ajoute pas um : il n’y a pas d’idée de but ici, l’infinitif explique ce qu’est l’objectif.'),
        choice('q6', bi('Sie vergleichen zwei Kurse. Welcher Satz ist richtig?', 'Vous comparez deux cours. Quelle phrase est correcte ?'),
          [['Für mich ist wichtiger, dass der Kurs findet abends statt.'], ['Für mich ist wichtiger, der Kurs abends stattfindet.'],
            ['Für mich ist wichtiger, dass der Kurs abends stattfindet.', true]],
          '« Für mich ist wichtiger, dass … » est une formule utile pour comparer. Après dass, le verbe conjugué va à la fin et la particule se ressoude : stattfindet. Sans dass, la subordonnée n’a pas de conjonction.'),
        match('q7', bi('Was passt? Ordnen Sie zu.', 'Qu’est-ce qui convient ? Associez.'),
          [['der Präsenzkurs', 'Alle sitzen zusammen im Kursraum.'], ['der Onlinekurs', 'Man lernt zu Hause am Computer.'],
            ['der Abendkurs', 'Der Unterricht beginnt erst nach der Arbeit.'], ['der Bildungsurlaub', 'Man bekommt frei, um sich weiterzubilden.']],
          'Präsenz : la présence sur place. Online : en ligne, depuis chez soi. Der Abend : le soir. Der Bildungsurlaub : quelques jours de congé payés par an pour se former, dans la plupart des Länder.'),
      ] },

    // 8 · Redemittel à voix haute
    { id: 'b1-lernen-redemittel', kind: 'exercise', title: 'Répéter à voix haute : parler de sa formation', estimatedMinutes: 9,
      competences: ['expression-orale'],
      lesson: { description: `${C.sprechen}

${bi('Mit diesen Sätzen sprechen Sie über Ihre Ziele und fragen nach einem Kurs.', 'Avec ces phrases, vous parlez de vos objectifs et vous vous renseignez sur un cours.')}
TIPP
[fr] Conseil
${bi('In „um … zu“ und „statt … zu“ ist das „zu“ unbetont. Betonen Sie das Verb am Ende.', 'Dans « um … zu » et « statt … zu », le « zu » n’est pas accentué : accentuez le verbe final.')}` },
      questions: [
        speak('q1', 'Ich mache den Kurs, um im Beruf weiterzukommen.',
          'Le but avec um … zu ; « weiterzukommen » s’écrit en un mot, zu au milieu. Accent sur WEI-.'),
        speak('q2', 'Könnten Sie mir sagen, ob der erste Termin kostenlos ist?',
          'Question indirecte polie : ob + verbe à la fin (ist). « Kostenlos » : accent sur KOS-.'),
        speak('q3', 'Für mich ist wichtiger, dass der Kurs abends stattfindet.',
          'Formule pour comparer et choisir. Après dass, « stattfindet » à la fin, accent sur STATT-.'),
        speak('q4', 'Ich lerne lieber in einer Gruppe, statt allein zu lernen.',
          'Lieber (plutôt, de préférence) et statt … zu pour une préférence. Le « zu » reste léger, « lernen » porte l’accent.'),
        speak('q5', 'Mein Ziel ist es, im Juni die Prüfung zu bestehen.',
          'Annoncer un objectif : « Mein Ziel ist es, … zu … ». « Bestehen » : accent sur -STE-.'),
        speak('q6', 'Ich habe mich gestern für den Onlinekurs angemeldet.',
          'Perfekt d’un verbe pronominal et séparable : habe mich … angemeldet. « Onlinekurs » se prononce à l’anglaise pour « online », accent sur ON-.'),
      ] },

    // 9 · Second document (thème pair : lecture) avec dictées
    { id: 'b1-lernen-lesen2', kind: 'exercise', title: 'Comprendre : un forum « cours du soir ou en ligne ? »', estimatedMinutes: 15,
      competences: ['lecture', 'ecoute'],
      lesson: { description: `${C.lesen}

SITUATION
[fr] La situation
${bi('Miriam überlegt, wie sie Englisch lernen soll. Sie fragt in einem Forum, und drei Personen antworten.', 'Miriam se demande comment apprendre l’anglais. Elle pose la question sur un forum, et trois personnes répondent.')}
TIPP
[fr] Conseil
${bi('Merken Sie sich für jede Person: Was empfiehlt sie, und warum?', 'Pour chaque personne, retenez : que recommande-t-elle, et pourquoi ?')}

ABENDKURS ODER ONLINE – WAS IST BESSER?
[fr] Forum : cours du soir ou en ligne, que choisir ?

Miriam: Hallo zusammen! Ich möchte mein Englisch für die Arbeit verbessern und überlege, ob ich einen Abendkurs an der Volkshochschule oder einen Onlinekurs machen soll. Ich arbeite Vollzeit und habe zwei Kinder. Welche Erfahrungen habt ihr gemacht?

Tarek: Ich habe beides ausprobiert. Online war am Anfang super praktisch: kein Weg, keine Parkplatzsuche. Aber nach ein paar Wochen habe ich die Hausaufgaben oft nicht gemacht, weil mich niemand kontrolliert hat. Im Abendkurs bin ich viel motivierter, weil ich die anderen jede Woche sehe.

Katrin: Mit Kindern würde ich auf jeden Fall online lernen! Ich mache gerade einen Französischkurs im Internet, immer wenn die Kinder im Bett sind. Wichtig ist, dass der Kurs Live-Stunden mit einer Lehrerin hat und nicht nur Videos. Sonst fehlt das Sprechen.

Jo: Ich finde, das kommt auf dein Ziel an. Wenn du eine Prüfung machen musst, ist ein Kurs mit Lehrerin vor Ort besser, weil sie deine Fehler korrigiert. Für ein bisschen Konversation reicht auch eine App. Und frag doch mal deinen Arbeitgeber, ob er den Kurs bezahlt!

DIKTAT
[fr] Dictée
${bi('Am nächsten Tag antwortet Miriam mit einer Sprachnachricht. Hören Sie und schreiben Sie die zwei Sätze.', 'Le lendemain, Miriam répond par un message vocal. Écoutez et écrivez les deux phrases.')}` },
      placements: [{ media: 'b1-lernen-lesen2-forum', caption: 'Abendkurs oder online?' }],
      questions: [
        match('q1', bi('Wer sagt was? Ordnen Sie zu.', 'Qui dit quoi ? Associez.'),
          [['Miriam', 'bittet um Rat für ihre Entscheidung.'], ['Tarek', 'ist im Präsenzkurs motivierter.'], ['Katrin', 'findet online mit Kindern praktischer.'],
            ['Jo', 'meint, es hängt vom Ziel ab.']],
          'Miriam pose la question ; Tarek a essayé les deux et préfère le cours du soir (motivation) ; Katrin recommande le cours en ligne avec des enfants ; Jo répond « das kommt auf dein Ziel an » (cela dépend de ton objectif).'),
        rf('q2', 'Katrin lernt nur mit Videos.', 'f',
          'Faux : Katrin dit au contraire qu’il faut des cours en direct avec une enseignante, « nicht nur Videos », sinon on ne parle pas.'),
        choice('q3', bi('Warum hat Tarek online oft keine Hausaufgaben gemacht?', 'Pourquoi Tarek ne faisait-il souvent pas ses devoirs en ligne ?'),
          [['Weil ihn niemand kontrolliert hat.', true], ['Weil die Lernplattform oft nicht funktioniert hat.'], ['Weil er abends zu lange arbeiten musste.']],
          '« … habe ich die Hausaufgaben oft nicht gemacht, weil mich niemand kontrolliert hat. » En cours du soir, voir les autres chaque semaine le motive.'),
        rf('q4', 'Jo hat selbst schon eine Englischprüfung gemacht.', 'n',
          'Non mentionné : Jo parle des examens en général (« Wenn du eine Prüfung machen musst … »), mais ne dit rien de sa propre expérience.'),
        dictation('q5', 'Vielen Dank für eure Tipps, ich frage morgen meinen Chef.',
          'Miriam tutoie plusieurs personnes : eure Tipps (possessif de ihr). Après la virgule commence une nouvelle proposition principale : ich frage … « Chef » prend une majuscule, comme tous les noms.', 'frau3'),
        dictation('q6', 'Ich melde mich für den Abendkurs an, um regelmäßig zu sprechen.',
          'Verbe séparable : melde … an, la particule avant la virgule. Puis le but : um … zu sprechen, l’infinitif à la fin. « Regelmäßig » s’écrit avec ä et ß.', 'frau3'),
      ] },

    // 10 · Vérifier
    { id: 'b1-lernen-kontrolle', kind: 'exercise', title: 'Vérifier : un changement de date du cours', estimatedMinutes: 12,
      competences: ['lecture', 'ecoute'],
      lesson: { description: `${bi('Prüfen Sie, was Sie in diesem Modul gelernt haben: Hören, Grammatik und Wortschatz.', 'Vérifiez ce que vous avez appris dans ce module : écoute, grammaire et vocabulaire.')}

${bi('Sie haben sich für den Abendkurs angemeldet. Jetzt bekommen Sie eine Nachricht vom Kursbüro. Hören Sie sie für die Fragen 1 und 2.', 'Vous vous êtes inscrit au cours du soir. Vous recevez un message du bureau des cours. Écoutez-le pour les questions 1 et 2.')}` },
      placements: [{ media: 'b1-lernen-kontrolle-audio', caption: 'Nachricht vom Kursbüro' }],
      questions: [
        choice('q1', bi('Was ändert sich?', 'Qu’est-ce qui change ?'),
          [['Der Kurs beginnt eine Woche später.', true], ['Der Kurs findet jetzt online statt.'], ['Der Kurs beginnt eine Stunde später.']],
          '« Der Kurs beginnt nicht am zweiundzwanzigsten September, sondern eine Woche später » ; « Die Uhrzeit bleibt gleich » : l’heure ne change pas. La salle est en travaux, mais le cours reste sur place.'),
        choice('q2', bi('Was sollen die Teilnehmenden zum ersten Termin mitbringen?', 'Que doivent apporter les participants à la première séance ?'),
          [['einen Laptop und ein Mikrofon'], ['die Anmeldebestätigung und ein Wörterbuch', true], ['ein Foto für den Kursausweis']],
          '« Bitte bringen Sie zum ersten Termin Ihre Anmeldebestätigung und ein Wörterbuch mit. » L’ordinateur et le micro concernent le cours en ligne.'),
        fill('q3', bi('Ergänzen Sie.', 'Complétez.'),
          'Ich mache den Kurs, [[1]] meine Chancen im Beruf zu verbessern.',
          [['um']],
          'Même sujet (ich) et zu + infinitif à la fin (zu verbessern) : le but s’exprime avec um … zu.'),
        order('q4', C.ordnen, [['Die Firma', 'bezahlt', 'den Kurs,', 'damit', 'die Mitarbeiter', 'besser', 'Deutsch', 'sprechen.'],
          ['Die Firma', 'bezahlt', 'den Kurs,', 'damit', 'die Mitarbeiter', 'Deutsch', 'besser', 'sprechen.']],
          'Deux sujets différents (l’entreprise paie, les employés parlent) : damit, avec le verbe « sprechen » à la fin. « Besser Deutsch » et « Deutsch besser » sont tous deux corrects.'),
        choice('q5', bi('Was ist eine „Teilnahmebestätigung“?', 'Qu’est-ce qu’une « Teilnahmebestätigung » ?'),
          [['un diplôme officiel obtenu après un examen final'], ['une facture pour les frais du cours'], ['un document qui atteste qu’on a suivi le cours', true]],
          'Die Teilnahme (la participation) + die Bestätigung (la confirmation) : une attestation de participation. Un certificat après examen se dit das Zertifikat.'),
        choice('q6', bi('Welcher Satz ist richtig?', 'Quelle phrase est correcte ?'),
          [['Ich habe keine Zeit, jeden Tag zu lernen.', true], ['Ich habe keine Zeit, um jeden Tag lernen.'], ['Ich habe keine Zeit, jeden Tag lernen zu.']],
          'Zeit haben + zu + infinitif, sans um (ce n’est pas un but). Zu se place juste avant l’infinitif final : jeden Tag zu lernen.'),
        hints(fill('q7', bi('Ergänzen Sie mit „zu“ und dem Infinitiv.', 'Complétez avec « zu » et l’infinitif.'),
          'Statt mit dem Auto [[1]], nehme ich das Fahrrad.',
          [['zu fahren']],
          'Statt … zu + infinitif : au lieu de prendre la voiture. Fahren n’a pas de particule : zu reste devant, en deux mots.'),
        'fahren'),
        choice('q8', bi('Sie möchten wissen, ob es eine Ermäßigung gibt. Was fragen Sie?', 'Vous voulez savoir s’il existe une réduction. Que demandez-vous ?'),
          [['Könnten Sie mir sagen, ob gibt es eine Ermäßigung?'], ['Könnten Sie mir sagen, ob es eine Ermäßigung gibt?', true],
            ['Könnten Sie mir sagen, wenn es eine Ermäßigung gibt?']],
          'Question indirecte fermée : ob + verbe à la fin (gibt). Wenn exprime une condition, pas une question indirecte (rappel du module Arbeit).'),
      ] },
  ],
};
