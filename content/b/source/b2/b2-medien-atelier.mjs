// Module B2 n° 12 · atelier « Medien » (lot R6), dernier module de la première moitié : la leçon -bilan annonce la
// Zwischenbilanz (modules 1 à 12). Contribution argumentée à un forum et discussion : modèles annotés (contribution qui
// rapporte l'avis d'un autre au discours indirect, intervention dans un débat), réagir à des arguments sur la
// suppression des fausses informations (-diskussion, 4 répétitions), médiation (rapporter une interview au discours
// indirect pour une lettre d'information), erreurs typiques, entraînement au format Hören (débat radiophonique : qui dit
// quoi ?), deux missions sur grille B2 (contribution à un forum, discussion simulée).
import { C2, aide, choice, fill, order, match, speakB2, GRIDS } from '../../lib.mjs';

/** « Wer sagt das? » dans le débat de l'entraînement Hören : trois options, toujours dans le même ordre. */
const STIMMEN = ['die Moderatorin', 'Rüdiger Feldmann', 'Dana Kaltenbach'];
const wer = (id, statement, speaker, explanation) => choice(id, aide(`Wer sagt das? „${statement}“`, 'Qui dit cela ?'),
  STIMMEN.map((name) => [name, name === speaker]), explanation);

export default {
  id: 'b2-medien-atelier',
  title: 'Medien – Werkstatt: Stellung beziehen und Aussagen wiedergeben',
  objective: 'Écrire une contribution argumentée à un forum (150 à 250 mots) en rapportant l’avis d’un autre participant, défendre un point de vue dans une discussion sur l’identité en ligne, rapporter une interview au discours indirect, s’entraîner au format Hören (débat : qui dit quoi ?) et préparer la Zwischenbilanz des modules 1 à 12.',
  grammarFocus: [],
  sources: [
    'Textes, dialogues et exercices originaux LinguaCap. Personnes, forum, interview, émission et entreprise fictives ; les effets de la disparition des journaux locaux sont évoqués de façon générale.',
  ],

  vocabulary: [
    { word: 'Ich verfolge diese Diskussion schon eine Weile.', partOfSpeech: 'expression', translation: 'Je suis cette discussion depuis un moment.',
      example: 'Ich verfolge diese Diskussion schon eine Weile und möchte etwas beitragen.', note: 'entrée en matière d’un message de forum' },
    { word: '… schreibt, … sei …', partOfSpeech: 'expression', translation: '… écrit que … serait …',
      example: 'Holger schreibt, ein Verbot sei die einzige Lösung.', note: 'rapporter un avis : Konjunktiv I' },
    { word: 'Ich halte … für …', partOfSpeech: 'expression', translation: 'Je considère … comme …',
      example: 'Ein generelles Verbot halte ich für den falschen Weg.', note: 'halten für + accusatif' },
    { word: 'Zwar …, aber …', partOfSpeech: 'expression', translation: 'Certes …, mais …',
      example: 'Zwar stören Handys im Unterricht, aber ein Verbot löst das Problem nicht.', note: 'concéder, puis objecter' },
    { word: 'Kurz gesagt: …', partOfSpeech: 'expression', translation: 'En bref : …',
      example: 'Kurz gesagt: Regeln ja, Verbot nein.', note: null },
    { word: 'Was meint ihr?', partOfSpeech: 'expression', translation: 'Qu’en pensez-vous ?',
      example: 'Was meint ihr, wäre so ein Kompromiss umsetzbar?', note: 'dans un forum, on se tutoie souvent' },
    { word: 'Meinungsfreiheit', article: 'die', plural: null, partOfSpeech: 'noun', translation: 'la liberté d’expression',
      example: 'Die Meinungsfreiheit ist ein Grundrecht.', note: 'sans pluriel' },
    { word: 'Zensur', article: 'die', plural: null, partOfSpeech: 'noun', translation: 'la censure',
      example: 'Ist das Löschen von Falschmeldungen schon Zensur?', note: null },
    { word: 'kennzeichnen', partOfSpeech: 'verb', translation: 'signaler, étiqueter',
      example: 'Falschmeldungen sollten deutlich gekennzeichnet werden.', note: 'die Kennzeichnung' },
    { word: 'Klarname', article: 'der', plural: 'Klarnamen', partOfSpeech: 'noun', translation: 'le vrai nom (en ligne)',
      example: 'Sollte man im Netz nur mit seinem Klarnamen schreiben dürfen?', note: 'die Klarnamenpflicht' },
    { word: 'Anonymität', article: 'die', plural: null, partOfSpeech: 'noun', translation: 'l’anonymat',
      example: 'Die Anonymität schützt Menschen, die Missstände melden.', note: 'anonym : anonyme' },
    { word: 'beleidigen', partOfSpeech: 'verb', translation: 'insulter, offenser',
      example: 'Wer andere im Netz beleidigt, kann angezeigt werden.', note: 'die Beleidigung' },
    { word: 'recherchieren', partOfSpeech: 'verb', translation: 'enquêter, se documenter',
      example: 'Für den Artikel hat sie zwei Wochen recherchiert.', note: 'die Recherche' },
    { word: 'Redaktion', article: 'die', plural: 'Redaktionen', partOfSpeech: 'noun', translation: 'la rédaction',
      example: 'Die Lokalredaktion berichtet über die Gemeinderatssitzung.', note: null },
    { word: 'eingestellt werden', partOfSpeech: 'expression', translation: 'cesser de paraître, être arrêté',
      example: 'Die Lokalzeitung wurde im letzten Jahr eingestellt.', note: 'einstellen : arrêter (aussi : embaucher)' },
    { word: 'gut / schlecht abschneiden', partOfSpeech: 'expression', translation: 'obtenir de bons / mauvais résultats',
      example: 'Bei solchen Tests wollen alle gut abschneiden.', note: 'séparable : ab|schneiden ; hat abgeschnitten' },
  ],

  media: [
    { key: 'b2-medien-atelier-modell-audio', kind: 'audio', title: 'Modèle : une intervention qui rapporte et répond',
      script: [
        { voice: 'frau3', name: 'Bente Marquardt', text: 'Herr Gräf hat vorhin gesagt, jedes Löschen sei Zensur. Ich verstehe, dass ihm die Meinungsfreiheit wichtig ist. Das ist sie mir auch. Aber eine erfundene Behauptung ist keine Meinung.' },
        { voice: 'frau3', name: 'Bente Marquardt', text: 'Wenn jemand schreibt, das Leitungswasser in unserer Stadt sei vergiftet, dann kann das Panik auslösen, und zwar ganz real. Trotzdem bin ich nicht dafür, dass die Plattformen alles allein entscheiden.' },
        { voice: 'frau3', name: 'Bente Marquardt', text: 'Mein Vorschlag wäre: Falschmeldungen werden deutlich gekennzeichnet, und gelöscht wird nur, was gegen Gesetze verstößt. So schützen wir die Meinungsfreiheit und bremsen trotzdem die Lügen.' },
      ] },
    { key: 'b2-medien-atelier-diskussion-satz1', kind: 'audio', title: 'Débat : argument 1',
      script: [{ voice: 'mann2', name: 'Herr Gräf', text: 'Wenn Plattformen Beiträge löschen, ist das Zensur. Jeder muss sagen dürfen, was er denkt.' }] },
    { key: 'b2-medien-atelier-diskussion-satz2', kind: 'audio', title: 'Débat : argument 2',
      script: [{ voice: 'frau3', name: 'Frau Mensah', text: 'Ich lese sowieso nur seriöse Zeitungen. Falschmeldungen betreffen mich überhaupt nicht.' }] },
    { key: 'b2-medien-atelier-diskussion-satz3', kind: 'audio', title: 'Débat : argument 3',
      script: [{ voice: 'mann3', name: 'Herr Hollmann', text: 'Faktenchecks bringen nichts. Wer an eine Lüge glauben will, glaubt sie trotzdem.' }] },
    { key: 'b2-medien-atelier-diskussion-satz4', kind: 'audio', title: 'Débat : question de l’animatrice',
      script: [{ voice: 'frau', name: 'Moderatorin', text: 'Was wäre aus Ihrer Sicht eine Lösung, die auch die Meinungsfreiheit schützt?' }] },
    { key: 'b2-medien-atelier-mediation-interview', kind: 'image', title: 'Interview avec une vérificatrice de faits',
      alt: 'Interview écrite d’Ida Kirchhoff, vérificatrice de faits : vingt vérifications par jour, recherche de la source d’origine, manque de temps, conseils, messages insultants.',
      image: { layout: 'messages', title: 'Interview: Ida Kirchhoff, Faktenprüferin', icon: 'search', messages: [
        { side: 'left', text: 'Wie viele Meldungen prüfen Sie pro Tag?' },
        { side: 'right', text: 'Unser Team prüft etwa zwanzig Meldungen am Tag. Die meisten kommen von Leserinnen und Lesern, die uns etwas Verdächtiges schicken.' },
        { side: 'left', text: 'Wie gehen Sie vor?' },
        { side: 'right', text: 'Zuerst suchen wir die ursprüngliche Quelle. Bei Fotos machen wir eine Rückwärtssuche. Oft zeigt sich, dass ein Bild schon Jahre alt ist oder aus einem anderen Land stammt.' },
        { side: 'left', text: 'Was ist die größte Schwierigkeit?' },
        { side: 'right', text: 'Die Zeit. Eine Lüge ist in zehn Sekunden geteilt, für eine gründliche Prüfung brauchen wir manchmal zwei Tage.' },
        { side: 'left', text: 'Was raten Sie den Menschen? Und werden Sie oft angegriffen?' },
        { side: 'right', text: 'Teilen Sie nichts, nur weil es Sie wütend macht. Fragen Sie sich: Wer hat das geschrieben? – Und ja, leider. Wir bekommen fast jeden Tag beleidigende Nachrichten. Aber ich habe gelernt, damit umzugehen.' },
      ] } },
    { key: 'b2-medien-atelier-pruefung-audio', kind: 'audio', title: 'Débat radiophonique : a-t-on encore besoin du journal local ?',
      script: [
        { voice: 'frau', name: 'Katja Hensel', text: 'Willkommen zur „Streitfrage“. Immer mehr Lokalzeitungen werden eingestellt; in manchen Landkreisen gibt es gar keine mehr. Ist das ein Verlust für die Demokratie, oder informieren wir uns heute einfach anders? Darüber diskutiere ich mit Rüdiger Feldmann, seit fünfundzwanzig Jahren Lokalredakteur, und mit Dana Kaltenbach, die eine Nachbarschafts-App gegründet hat.' },
        { voice: 'frau', name: 'Katja Hensel', text: 'Herr Feldmann, warum braucht es die Lokalzeitung noch?' },
        { voice: 'mann', name: 'Rüdiger Feldmann', text: 'Weil sonst niemand mehr hinschaut. Wer berichtet denn über die Sitzung des Gemeinderats am Dienstagabend, wenn es keine Lokalredaktion mehr gibt? Untersuchungen deuten darauf hin, dass dort, wo Lokalzeitungen verschwinden, weniger Menschen wählen gehen und die Verwaltung schlechter kontrolliert wird.' },
        { voice: 'frau3', name: 'Dana Kaltenbach', text: 'Da widerspreche ich gar nicht. Aber seien wir ehrlich: Die meisten jungen Leute lesen keine Zeitung mehr, weder auf Papier noch online. In unserer App tauschen sich jeden Tag über zwanzigtausend Menschen aus: über Baustellen, Veranstaltungen, verlorene Katzen. Das ist doch auch lokale Information.' },
        { voice: 'mann', name: 'Rüdiger Feldmann', text: 'Das ist Austausch, aber kein Journalismus. In Ihrer App kann jeder alles behaupten. Wer prüft denn, ob eine Meldung stimmt?' },
        { voice: 'frau3', name: 'Dana Kaltenbach', text: 'Unsere Nutzerinnen und Nutzer korrigieren sich oft gegenseitig, und offensichtliche Falschmeldungen löschen wir. Aber Sie haben recht: Eine Recherche über die Finanzen der Stadt kann eine App nicht leisten.' },
        { voice: 'frau', name: 'Katja Hensel', text: 'Herr Feldmann, sind die Lokalzeitungen an ihrer Lage nicht auch selbst schuld? Viele haben das Internet lange verschlafen.' },
        { voice: 'mann', name: 'Rüdiger Feldmann', text: 'Das will ich gar nicht bestreiten. Wir haben zu lange gedacht, die Leute würden die gedruckte Zeitung schon weiter abonnieren. Heute machen wir Podcasts und einen Newsletter, und gerade der Newsletter wird erstaunlich gut gelesen.' },
        { voice: 'frau', name: 'Katja Hensel', text: 'Frau Kaltenbach, wäre es denkbar, dass beides zusammenkommt? Also Journalistinnen und Journalisten, die in Ihrer App arbeiten?' },
        { voice: 'frau3', name: 'Dana Kaltenbach', text: 'Absolut. Wir sprechen gerade mit einer Redaktion über eine Zusammenarbeit. Die Frage ist nur, wer das bezahlt. Werbung allein reicht dafür nicht.' },
        { voice: 'mann', name: 'Rüdiger Feldmann', text: 'Und genau da liegt das Problem. Gute Recherche kostet Geld. Ich halte es deshalb für richtig, über eine öffentliche Förderung für Lokaljournalismus nachzudenken, unabhängig organisiert, damit die Politik keinen Einfluss nimmt.' },
        { voice: 'frau', name: 'Katja Hensel', text: 'Eine Förderung vom Staat für Zeitungen, die den Staat kontrollieren sollen: Ist das nicht ein Widerspruch?' },
        { voice: 'mann', name: 'Rüdiger Feldmann', text: 'Auf den ersten Blick schon. Aber der öffentlich-rechtliche Rundfunk zeigt ja, dass öffentliches Geld und Unabhängigkeit sich nicht ausschließen müssen.' },
        { voice: 'frau3', name: 'Dana Kaltenbach', text: 'Da bin ich skeptischer. Ich würde eher auf Stiftungen und auf die Leserinnen und Leser selbst setzen. Viele zahlen gern ein paar Euro im Monat, wenn sie merken, dass die Berichte ihr eigenes Viertel betreffen.' },
        { voice: 'frau', name: 'Katja Hensel', text: 'Zum Schluss: Was wünschen Sie sich in fünf Jahren?' },
        { voice: 'mann', name: 'Rüdiger Feldmann', text: 'Dass jede Region mindestens eine unabhängige Redaktion hat.' },
        { voice: 'frau3', name: 'Dana Kaltenbach', text: 'Und dass diese Redaktion dort ist, wo die Menschen ohnehin sind: auf dem Handy.' },
        { voice: 'frau', name: 'Katja Hensel', text: 'Vielen Dank Ihnen beiden.' },
      ] },
    { key: 'b2-medien-atelier-schreiben-forum', kind: 'image', title: 'Forum : les réseaux sociaux à partir de 16 ans ?',
      alt: 'Fil de forum « Soziale Netzwerke erst ab 16? » : une mère favorable à une limite d’âge, un lycéen de 17 ans opposé à une interdiction.',
      image: { layout: 'forum', title: 'Diskussion der Woche: Soziale Netzwerke erst ab 16?', posts: [
        { author: 'Antje, Mutter von zwei Kindern', text: 'Ja, unbedingt! Meine Tochter ist zwölf und hängt jeden Abend stundenlang am Handy. Seit sie in sozialen Netzwerken ist, vergleicht sie sich ständig mit anderen. Eine klare Altersgrenze würde uns Eltern helfen, Nein zu sagen.' },
        { author: 'Levin, 17', text: 'Ein Verbot bringt nichts. Wer unter 16 ist, gibt einfach ein falsches Alter an. Außerdem halten viele von uns über die Netzwerke Kontakt zu Freunden, die weit weg wohnen. Besser wäre es, in der Schule zu lernen, wie man die Apps vernünftig nutzt.' },
      ] } },
    { key: 'b2-medien-atelier-sprechen-positionen', kind: 'audio', title: 'Débat : faut-il imposer son vrai nom en ligne ?',
      script: [
        { voice: 'frau', name: 'Moderatorin', text: 'Unser Thema heute: Sollte man im Internet nur noch mit seinem echten Namen schreiben dürfen? Herr Hollmann, bitte.' },
        { voice: 'mann3', name: 'Herr Hollmann', text: 'Ich bin klar für eine Klarnamenpflicht. Wer mit seinem echten Namen schreibt, überlegt sich zweimal, ob er andere beleidigt. Die Anonymität macht viele Menschen im Netz rücksichtslos.' },
        { voice: 'frau3', name: 'Frau Mensah', text: 'Ich halte das für gefährlich. Menschen, die über eine Krankheit sprechen oder Missstände in ihrer Firma melden, brauchen den Schutz der Anonymität. Und wer beleidigen will, tut das oft auch mit seinem echten Namen.' },
        { voice: 'frau', name: 'Moderatorin', text: 'Zwei klare Positionen. Und wie sehen Sie das?' },
      ] },
  ],

  activities: [
    // 1 · Modèles annotés
    { id: 'b2-medien-atelier-modell', kind: 'lesson', title: 'Modell: ein Forumsbeitrag und ein Diskussionsbeitrag', estimatedMinutes: 12,
      competences: ['lecture', 'ecoute'],
      lesson: { description: `MODELL: EIN FORUMSBEITRAG MIT EIGENER MEINUNG
[fr?] Modèle : une contribution argumentée à un forum
${aide('Im Forum einer Stadtzeitung wird diskutiert, ob Smartphones an Schulen verboten werden sollten. Holger hat geschrieben: „Ein komplettes Verbot ist die einzige Lösung. Die Kinder können sich sonst nicht konzentrieren.“ Lesen Sie die Antwort von Carlotta und achten Sie darauf, wie sie Holgers Meinung wiedergibt.', 'Sur le forum d’un journal local, on débat de l’interdiction des smartphones à l’école. Lisez la réponse de Carlotta et observez comment elle rapporte l’avis de Holger.')}

Re: Handyverbot an Schulen?
Ich verfolge diese Diskussion schon eine Weile und möchte nun auch meine Sicht beitragen. Holger schreibt, ein komplettes Verbot sei die einzige Lösung, weil sich die Kinder sonst nicht konzentrieren könnten. Dass Handys im Unterricht stören, sehe ich genauso. Ein generelles Verbot halte ich trotzdem für den falschen Weg.
Erstens lernen Jugendliche den verantwortungsvollen Umgang mit dem Smartphone nicht, indem man es ihnen einfach wegnimmt. Gerade in der Schule könnten sie üben, Quellen zu prüfen und Falschmeldungen zu erkennen. Zweitens nutzen viele Lehrkräfte das Handy sinnvoll im Unterricht, zum Beispiel für kurze Umfragen oder Recherchen.
Zwar brauchen Kinder auch Pausen vom Bildschirm, aber dafür reichen klare Regeln: Im Unterricht bleibt das Handy in der Tasche, außer die Lehrkraft erlaubt es ausdrücklich, und in den Pausen der unteren Klassen gilt eine handyfreie Zeit.
Kurz gesagt: Regeln ja, Verbot nein. Was meint ihr, wäre so ein Kompromiss an euren Schulen umsetzbar?
Carlotta M.

AUFBAU
[fr?] Structure
1. ${aide('Einstieg: an die Diskussion anknüpfen.', 'Entrée en matière : se rattacher à la discussion.')}
2. ${aide('Fremde Meinung wiedergeben, im Konjunktiv I: „Holger schreibt, … sei …“.', 'Rapporter l’avis d’un autre au Konjunktiv I.')}
3. ${aide('Eigene Position klar nennen.', 'Annoncer clairement sa position.')}
4. ${aide('Zwei Argumente mit Beispielen („Erstens …, zweitens …“).', 'Deux arguments avec exemples.')}
5. ${aide('Gegenargument einräumen und entkräften („Zwar …, aber …“).', 'Concéder un contre-argument, puis le réfuter.')}
6. ${aide('Fazit und Frage an das Forum.', 'Conclusion et question au forum.')}

REDEMITTEL
[fr?] Formules utiles
• ${aide('Anknüpfen: Ich verfolge diese Diskussion schon eine Weile. · Ich möchte auf den Beitrag von … eingehen.', 'Se rattacher à la discussion.')}
• ${aide('Wiedergeben: … schreibt, … sei … · Laut … · … ist der Meinung, man müsse …', 'Rapporter un avis.')}
• ${aide('Position: Ich halte … für … · Meiner Ansicht nach …', 'Prendre position.')}
• ${aide('Einräumen: Zwar …, aber … · Es stimmt, dass …, trotzdem …', 'Concéder.')}
• ${aide('Schließen: Kurz gesagt: … · Was meint ihr?', 'Conclure.')}

MODELL: IN EINER DISKUSSION WIEDERGEBEN UND ANTWORTEN
[fr?] Modèle : rapporter et répondre dans un débat
${aide('Bei einer Podiumsdiskussion geht es darum, ob Plattformen Falschmeldungen löschen müssen. Hören Sie, wie Bente Marquardt die Aussage von Herrn Gräf wiedergibt, teilweise zustimmt, widerspricht, ein Beispiel gibt und einen Vorschlag macht.', 'Lors d’un débat public sur la suppression des fausses informations, écoutez comment Bente Marquardt rapporte, concède, objecte, illustre et propose.')}
• ${aide('Wiedergeben: Herr Gräf hat vorhin gesagt, jedes Löschen sei Zensur.', 'Rapporter.')}
• ${aide('Verständnis zeigen: Ich verstehe, dass ihm … wichtig ist. Das ist sie mir auch.', 'Montrer de la compréhension.')}
• ${aide('Widersprechen: Aber eine erfundene Behauptung ist keine Meinung.', 'Objecter.')}
• ${aide('Vorschlagen: Mein Vorschlag wäre: … So schützen wir … und …', 'Proposer.')}` },
      placements: [{ media: 'b2-medien-atelier-modell-audio', caption: 'Der Beitrag von Bente Marquardt' }] },

    // 2 · Réagir à des arguments
    { id: 'b2-medien-atelier-diskussion', kind: 'exercise', title: 'Diskutieren: Sollen Plattformen Falschmeldungen löschen?', estimatedMinutes: 12,
      competences: ['ecoute', 'expression-orale'],
      lesson: { description: `${C2.argument}

SITUATION
[fr?] La situation
${aide('Bei einer Podiumsdiskussion in der Stadtbibliothek geht es um Falschmeldungen im Netz. Hören Sie jede Äußerung und wählen Sie die Reaktion, die sachlich, höflich und konstruktiv ist.', 'Lors d’un débat public à la bibliothèque municipale sur les fausses informations, choisissez à chaque fois la réaction factuelle, polie et constructive.')}
${aide('Sprechen Sie danach vier Reaktionen laut nach.', 'Répétez ensuite quatre réactions à voix haute.')}` },
      placements: [
        { media: 'b2-medien-atelier-diskussion-satz1', questionId: 'q1', transcriptVisibility: 'after_answer' },
        { media: 'b2-medien-atelier-diskussion-satz2', questionId: 'q2', transcriptVisibility: 'after_answer' },
        { media: 'b2-medien-atelier-diskussion-satz3', questionId: 'q3', transcriptVisibility: 'after_answer' },
        { media: 'b2-medien-atelier-diskussion-satz4', questionId: 'q4', transcriptVisibility: 'after_answer' },
      ],
      questions: [
        choice('q1', aide('Äußerung 1 (Herr Gräf): Was antworten Sie?', 'Intervention 1 (M. Gräf) : que répondez-vous ?'),
          [['Genau, und deshalb sollte man im Internet am besten gar nichts mehr schreiben.'],
            ['Zensur gibt es bei uns nicht, das ist doch völliger Unsinn, Herr Gräf.'],
            ['Meinungsfreiheit ist wichtig, aber erfundene Tatsachen sind keine Meinung.', true],
            ['Was Sie denken, interessiert hier ehrlich gesagt niemanden so richtig.']],
          aide('Die passende Reaktion erkennt den Wert der Meinungsfreiheit an und unterscheidet dann zwischen Meinung und erfundener Tatsache. Die anderen Antworten übertreiben, wischen das Argument weg oder greifen die Person an.',
            'Distinguer opinion et fait inventé, sans attaquer la personne.')),
        choice('q2', aide('Äußerung 2 (Frau Mensah): Was antworten Sie?', 'Intervention 2 (Mme Mensah) : que répondez-vous ?'),
          [['Das mag für Sie gelten, aber viele informieren sich nur über soziale Netzwerke.', true],
            ['Seriöse Zeitungen lügen doch genauso, das weiß inzwischen wirklich jeder hier.'],
            ['Dann haben Sie ja Glück gehabt und brauchen hier eigentlich nicht mitzureden.'],
            ['Zeitungen lese ich nie, dafür habe ich neben der Arbeit einfach keine Zeit.']],
          aide('Frau Mensah spricht nur von sich selbst. Eine gute Reaktion lässt ihre Erfahrung gelten („Das mag für Sie gelten“) und erweitert den Blick auf andere Menschen. Die übrigen Antworten verallgemeinern, schließen sie aus oder reden von sich.',
            'Admettre son cas, puis élargir à la situation générale.')),
        choice('q3', aide('Äußerung 3 (Herr Hollmann): Was antworten Sie?', 'Intervention 3 (M. Hollmann) : que répondez-vous ?'),
          [['Stimmt, Lügen sind eben einfach viel spannender als die langweilige Wahrheit.'],
            ['Faktenchecks lese ich auch nie, die sind mir meistens viel zu lang und kompliziert.'],
            ['Woher wollen Sie das denn wissen? Sie verbreiten doch selbst ständig Lügen.'],
            ['Überzeugte vielleicht nicht, aber viele Unentschlossene lassen sich überzeugen.', true]],
          aide('Die beste Antwort räumt einen Teil ein (Überzeugte ändern ihre Meinung selten) und widerspricht dann mit einem Unterschied: Wer noch unentschlossen ist, kann sich durch Fakten überzeugen lassen. Die anderen Antworten stimmen ohne Nachdenken zu, weichen aus oder unterstellen etwas.',
            'Concéder une partie, puis nuancer.')),
        choice('q4', aide('Äußerung 4 (Moderatorin): Was antworten Sie?', 'Intervention 4 (animatrice) : que répondez-vous ?'),
          [['Eine Lösung gibt es nicht, deshalb sollten wir lieber aufhören zu diskutieren.'],
            ['Man könnte Falschmeldungen deutlich kennzeichnen, statt sie sofort zu löschen.', true],
            ['Am besten verbieten wir die sozialen Netzwerke einfach ganz und für immer.'],
            ['Darüber sollen die Politiker entscheiden, nicht wir hier in diesem Saal.']],
          aide('Gesucht ist eine Lösung, die zwei Ziele verbindet: Falschmeldungen bremsen und die Meinungsfreiheit schützen. Kennzeichnen statt löschen tut beides. Ein Totalverbot widerspricht der Meinungsfreiheit, die anderen Antworten weichen aus.',
            'Une solution qui concilie les deux objectifs.')),
        speakB2('q5', 'Meinungsfreiheit ist wichtig, aber erfundene Tatsachen sind keine Meinung.',
          aide('Betonen Sie die Gegenüberstellung: „MEInungsfreiheit … erFUNdene TATsachen … keine MEInung“. Vor „aber“ eine kurze Pause.',
            'Accentuez l’opposition ; pause avant « aber ».')),
        speakB2('q6', 'Das mag für Sie gelten, aber viele informieren sich nur über soziale Netzwerke.',
          aide('„Das mag für Sie gelten“ ist eine höfliche Einräumung: Die Stimme bleibt oben, dann folgt das Gegenargument. „Netzwerke“ wird auf der ersten Silbe betont.',
            'Concession polie ; accent sur NETZ-werke.')),
        speakB2('q7', 'Überzeugte vielleicht nicht, aber viele Unentschlossene lassen sich durchaus überzeugen.',
          aide('Achten Sie auf die Wortfamilie: überzeugt, überzeugen; „Unentschlossene“ wird auf der ersten Silbe betont: UN-entschlossene. „Durchaus“ verstärkt die Aussage.',
            'Accent sur UN- ; « durchaus » = tout à fait.')),
        speakB2('q8', 'Man könnte Falschmeldungen deutlich kennzeichnen, statt sie sofort zu löschen.',
          aide('Ein Vorschlag im Konjunktiv II (könnte). Nach „statt“ folgt ein Infinitiv mit „zu“ am Satzende. „Kennzeichnen“ wird auf der ersten Silbe betont.',
            'Proposition au Konjunktiv II ; statt … zu + infinitif.')),
      ] },

    // 3 · Médiation : rapporter une interview
    { id: 'b2-medien-atelier-mediation', kind: 'exercise', title: 'Vermitteln: ein Interview in indirekter Rede wiedergeben', estimatedMinutes: 16,
      competences: ['lecture', 'expression-ecrite'],
      lesson: { description: `SITUATION
[fr?] La situation
${aide('Ihr Sprachkurs gibt einen Newsletter heraus. Sie haben ein Interview mit der Faktenprüferin Ida Kirchhoff gelesen und sollen für den Newsletter darüber berichten. Im Bericht stehen ihre Aussagen in indirekter Rede.', 'Votre cours de langue publie une lettre d’information. Vous rapportez une interview de la vérificatrice de faits Ida Kirchhoff, au discours indirect.')}

DAS INTERVIEW
[fr?] L’interview
Frage: Wie viele Meldungen prüfen Sie pro Tag?
Ida Kirchhoff: Unser Team prüft etwa zwanzig Meldungen am Tag. Die meisten kommen von Leserinnen und Lesern, die uns etwas Verdächtiges schicken.
Frage: Wie gehen Sie vor?
Ida Kirchhoff: Zuerst suchen wir die ursprüngliche Quelle. Bei Fotos machen wir eine Rückwärtssuche. Oft zeigt sich, dass ein Bild schon Jahre alt ist oder aus einem anderen Land stammt.
Frage: Was ist die größte Schwierigkeit?
Ida Kirchhoff: Die Zeit. Eine Lüge ist in zehn Sekunden geteilt, für eine gründliche Prüfung brauchen wir manchmal zwei Tage.
Frage: Was raten Sie den Menschen?
Ida Kirchhoff: Teilen Sie nichts, nur weil es Sie wütend macht. Fragen Sie sich: Wer hat das geschrieben, und woher weiß diese Person das?
Frage: Werden Sie oft angegriffen?
Ida Kirchhoff: Ja, leider. Wir bekommen fast jeden Tag beleidigende Nachrichten. Aber ich habe gelernt, damit umzugehen.

STRATEGIE
[fr?] Stratégie
• ${aide('Nicht jede Frage wiedergeben, sondern die wichtigsten Antworten zusammenfassen.', 'Ne pas reprendre chaque question : résumer les réponses principales.')}
• ${aide('Abwechslungsreiche Redeverben benutzen: erklären, betonen, raten, einräumen.', 'Varier les verbes introducteurs.')}
• ${aide('Perspektive anpassen: „unser Team“ → ihr Team, „ich“ → sie.', 'Adapter les pronoms.')}` },
      placements: [{ media: 'b2-medien-atelier-mediation-interview', caption: 'Interview mit Ida Kirchhoff' }],
      questions: [
        hints(fill('q1', aide('Ergänzen Sie den Bericht mit den Verben im Konjunktiv.', 'Complétez le compte rendu avec les verbes au subjonctif.'),
          'Frau Kirchhoff erklärte, ihr Team [[1]] etwa zwanzig Meldungen am Tag. Die meisten [[2]] von Leserinnen und Lesern. Zuerst [[3]] man die ursprüngliche Quelle. Oft zeige sich, dass ein Bild schon Jahre alt [[4]] oder aus einem anderen Land [[5]].',
          [['prüfe'], ['kämen'], ['suche'], ['sei'], ['stamme']],
          aide('Singular: Konjunktiv I aus Stamm + -e (prüfe, suche, stamme), bei „sein“: sei. „Die meisten kommen“ ist Plural; der Konjunktiv I „kommen“ sähe aus wie der Indikativ, deshalb Konjunktiv II: kämen. Aus „wir suchen“ wird im Bericht „man suche“.',
            'prüfe, suche, stamme, sei ; pluriel : kämen.')),
        'prüfen', 'kommen', 'suchen', 'sein', 'stammen'),
        choice('q2', aide('Welcher Satz gibt ihren Rat richtig wieder?', 'Quelle phrase rapporte correctement son conseil ?'),
          [['Sie riet, teilen Sie nichts, nur weil es Sie wütend macht.'], ['Sie riet, man solle nichts teilen, nur weil es einen wütend mache.', true],
            ['Sie riet, man soll nichts teilen, nur weil es Sie wütend gemacht hat.'], ['Sie riet, man hätte nichts geteilt, weil es einen wütend mache.']],
          aide('Eine Aufforderung gibt man mit „solle“ + Infinitiv wieder; das „Sie“ der direkten Anrede wird zu „man“ bzw. „einen“. Die erste Antwort behält den Imperativ, die dritte mischt Indikativ und direkte Anrede, die vierte verändert die Bedeutung.',
            'Conseil rapporté : man solle … ; « Sie » devient « man / einen ».')),
        order('q3', aide('Bilden Sie einen Satz für den Bericht.', 'Formez une phrase pour le compte rendu.'),
          [['Sie', 'betonte,', 'dass', 'ihr Team', 'für eine gründliche Prüfung', 'manchmal', 'zwei Tage', 'brauche.'],
            ['Sie', 'betonte,', 'dass', 'ihr Team', 'manchmal', 'für eine gründliche Prüfung', 'zwei Tage', 'brauche.']],
          aide('Mit „dass“ steht das Verb im Konjunktiv I am Ende: brauche. Aus „wir“ wird „ihr Team“. Die Angaben „für eine gründliche Prüfung“ und „manchmal“ können im Mittelfeld ihre Reihenfolge tauschen.',
            'Avec « dass », verbe à la fin ; deux ordres possibles au milieu.')),
        match('q4', aide('Wie werden diese Stellen aus dem Interview im Bericht wiedergegeben? Ordnen Sie zu.', 'Comment ces passages de l’interview sont-ils rapportés ? Associez.'),
          [['Unser Team prüft …', 'Ihr Team prüfe …'], ['Die meisten kommen von Lesern.', 'Die meisten kämen von Lesern.'], ['Teilen Sie nichts!', 'Man solle nichts teilen.'],
            ['Wir bekommen beleidigende Nachrichten.', 'Sie bekämen beleidigende Nachrichten.'], ['Ich habe gelernt, damit umzugehen.', 'Sie habe gelernt, damit umzugehen.']],
          aide('Im Bericht spricht nicht mehr Frau Kirchhoff, sondern die Berichtende: unser → ihr, ich → sie, wir → sie. Im Singular steht der Konjunktiv I (prüfe, habe), im Plural der Konjunktiv II, weil der Konjunktiv I dem Indikativ gleicht (kämen, bekämen). Eine Aufforderung wird mit „solle“ wiedergegeben.',
            'Pronoms adaptés ; Konjunktiv I au singulier, Konjunktiv II au pluriel ; ordre rapporté avec « solle ».')),
        choice('q5', aide('„Werden Sie oft angegriffen?“ Wie lautet die Frage im Bericht?', 'Comment la question est-elle rapportée ?'),
          [['Die Journalistin fragte, dass sie oft angegriffen werde.'], ['Die Journalistin fragte, wenn sie oft angegriffen werde.'],
            ['Die Journalistin fragte, was sie oft angegriffen werde.'], ['Die Journalistin fragte, ob sie oft angegriffen werde.', true]],
          aide('Eine Ja-Nein-Frage gibt man mit „ob“ wieder, das Verb steht am Ende im Konjunktiv I: ob sie oft angegriffen werde. „Wenn“ ist eine Bedingung, „dass“ leitet keine Fragen ein.',
            'Question fermée rapportée : ob.')),
        choice('q6', aide('Welcher Satz fasst ihre Antwort zu den Angriffen richtig zusammen?', 'Quelle phrase résume correctement sa réponse sur les attaques ?'),
          [['Sie sagte, sie bekomme fast täglich Beleidigungen, könne aber damit umgehen.', true],
            ['Sie sagte, sie bekomme fast nie Beleidigungen, weil sie gut damit umgehe.'],
            ['Sie sagte, sie prüfe wegen der vielen Angriffe keine Meldungen mehr.'],
            ['Sie sagte, ihr Team bekomme kaum Nachrichten von Lesern und Leserinnen.']],
          aide('„Wir bekommen fast jeden Tag beleidigende Nachrichten. Aber ich habe gelernt, damit umzugehen.“ Die Zusammenfassung muss beides wiedergeben. Die anderen Sätze verdrehen die Aussage oder widersprechen dem Interview.',
            'Résumer fidèlement les deux idées.')),
      ] },

    // 4 · Erreurs typiques
    { id: 'b2-medien-atelier-korrektur', kind: 'exercise', title: 'Korrigieren: typische Fehler in Berichten und Forumsbeiträgen', estimatedMinutes: 10,
      competences: ['lecture', 'expression-ecrite'],
      lesson: { description: `${aide('Diese Sätze stammen aus Berichten und Forumsbeiträgen von Kursteilnehmenden. Finden Sie die richtige Form.', 'Ces phrases viennent de comptes rendus et de messages de forum d’apprenants. Trouvez la forme correcte.')}

KORREKTURZEICHEN
[fr?] Les codes de correction
${aide('St = Stellung im Satz · G = Grammatik · W = Wortschatz · R = Rechtschreibung · A = Register (du oder Sie)', 'St = place des mots ; G = grammaire ; W = vocabulaire ; R = orthographe ; A = registre')}` },
      questions: [
        hints(fill('q1', aide('G: Ergänzen Sie den Konjunktiv I.', 'G : complétez au Konjunktiv I.'),
          'Der Minister sagte, er [[1]] keine Zeit für ein Interview. · Die Sprecherin meinte, die Zahlen [[2]] noch nicht bekannt.',
          [['habe'], ['seien']],
          aide('Für die 3. Person Singular von „haben“ heißt der Konjunktiv I „habe“. „Sein“ bildet im Plural „seien“, das sich deutlich vom Indikativ „sind“ unterscheidet und deshalb bleibt.',
            'er habe ; sie seien.')),
        'haben', 'sein'),
        hints(fill('q2', aide('G: Ergänzen Sie die Ersatzform im Konjunktiv II.', 'G : complétez avec la forme de remplacement.'),
          'Die Schülerinnen erklärten, sie [[1]] zu wenig Zeit für Hausaufgaben. · Viele Nutzer sagen, sie [[2]] nicht, wer ihre Daten speichert.',
          [['hätten'], ['wüssten']],
          aide('Im Plural sind „sie haben“ und „sie wissen“ im Konjunktiv I identisch mit dem Indikativ. Deshalb nimmt man den Konjunktiv II: hätten, wüssten. Ein typischer Fehler ist, den Indikativ stehen zu lassen.',
            'sie haben → hätten ; sie wissen → wüssten.')),
        'haben', 'wissen'),
        order('q3', aide('St: Bilden Sie den Satz richtig.', 'St : remettez les mots dans le bon ordre.'),
          [['Der Studie', 'zufolge', 'erkennen', 'viele', 'Jugendliche', 'Falschmeldungen', 'nur selten', 'im Netz.'],
            ['Der Studie', 'zufolge', 'erkennen', 'viele', 'Jugendliche', 'nur selten', 'Falschmeldungen', 'im Netz.']],
          aide('„Zufolge“ steht nach dem Nomen: der Studie zufolge. Die ganze Gruppe steht auf Position 1, das Verb „erkennen“ folgt sofort. Ein typischer Fehler ist „Zufolge der Studie …“ nach dem Muster von „laut“.',
            '« zufolge » se place après le nom.')),
        fill('q4', aide('W: Ergänzen Sie die Präposition.', 'W : complétez avec la préposition.'),
          'Eine Leserin hat die Redaktion [[1]] einen Fehler im Artikel hingewiesen. · Man sollte sich nicht blind [[2]] Suchmaschinen verlassen.',
          [['auf'], ['auf']],
          aide('Beide Verben verlangen „auf“ + Akkusativ: jemanden auf etwas hinweisen, sich auf etwas verlassen. Die Präposition lässt sich nicht aus dem Französischen ableiten.',
            'signaler quelque chose à quelqu’un = jemanden auf etwas hinweisen ; compter sur = sich verlassen auf.')),
        choice('q5', aide('A: Welcher Einstieg passt zu einem sachlichen Forumsbeitrag?', 'A : quelle entrée en matière convient à un message de forum argumenté ?'),
          [['Hallo Leute, schon wieder so ein total dummes Thema hier im Forum!'],
            ['Ich kann die Sorge vieler Eltern verstehen, sehe aber auch Chancen.', true],
            ['Sehr geehrte Damen und Herren, hiermit teile ich Ihnen mit, dass …'],
            ['Also, ich sag mal so: Keine Ahnung, aber ich schreib trotzdem was.']],
          aide('Ein Forumsbeitrag ist persönlich, aber sachlich: Er knüpft an die Diskussion an und kündigt eine abgewogene Position an. Die erste und vierte Antwort sind abwertend oder nachlässig, die dritte ist für ein Forum zu förmlich (Brief an eine Behörde).',
            'Registre : personnel mais argumenté.')),
        choice('q6', aide('G: Welcher Satz ist richtig?', 'G : quelle phrase est correcte ?'),
          [['Er behauptete, er hätte die Nachricht nicht geteilt haben.'], ['Er behauptete, er habe die Nachricht nicht teilen.'],
            ['Er behauptete, er habe die Nachricht nicht geteilt.', true], ['Er behauptete, er sei die Nachricht nicht geteilt.']],
          aide('Vergangenheit in der indirekten Rede: habe + Partizip II (geteilt). „Teilen“ bildet das Perfekt mit „haben“, daher nicht „sei“. „Hätte … geteilt haben“ verdoppelt das Hilfsverb, „habe … teilen“ hat kein Partizip.',
            'er habe … geteilt.')),
      ] },

    // 5 · Entraînement au format : Hören (débat, qui dit quoi ?)
    { id: 'b2-medien-atelier-pruefung', kind: 'exercise', title: 'Prüfungstraining: eine Radiodebatte – wer sagt was?', estimatedMinutes: 20,
      competences: ['ecoute'],
      lesson: { description: `PRÜFUNGSTRAINING HÖREN
[fr?] Entraînement à l’examen : écoute
${aide('Sie hören eine Diskussion im Radio zum Thema „Brauchen wir die Lokalzeitung noch?“. Die Moderatorin Katja Hensel diskutiert mit dem Lokalredakteur Rüdiger Feldmann und mit Dana Kaltenbach, Gründerin einer Nachbarschafts-App. Wer sagt was? Zu jeder Aussage passt genau eine Person.', 'Vous entendez un débat radio : « A-t-on encore besoin du journal local ? ». Qui dit quoi ? Une seule personne par affirmation.')}

ZEIT
[fr?] Temps
${aide('Etwa 20 Minuten: zwei Minuten, um die Aussagen zu lesen, dann die Diskussion (etwa drei Minuten) zweimal.', 'Environ 20 minutes : deux minutes de lecture, puis le débat (trois minutes environ) deux fois.')}

STRATEGIE
[fr?] Stratégie
1. ${aide('Lesen Sie die Aussagen vorher und überlegen Sie: Wer würde das wahrscheinlich sagen?', 'Lisez les affirmations avant et anticipez : qui dirait cela ?')}
2. ${aide('Achtung: Die Aussagen benutzen andere Wörter als die Sprechenden. Auch die Moderatorin kann eine Meinung äußern, zum Beispiel in einer kritischen Frage.', 'Les affirmations reformulent ; l’animatrice peut aussi exprimer un point de vue dans une question critique.')}
3. ${aide('Wenn jemand zustimmt („Da widerspreche ich gar nicht“), gehört die ursprüngliche Aussage trotzdem der anderen Person.', 'Quand quelqu’un approuve, l’idée appartient toujours à celui qui l’a formulée.')}` },
      placements: [{ media: 'b2-medien-atelier-pruefung-audio', caption: 'Streitfrage: Brauchen wir die Lokalzeitung noch?' }],
      questions: [
        wer('q1', 'Ohne Lokalredaktion kontrolliert niemand mehr, was in der Gemeinde passiert.', 'Rüdiger Feldmann',
          aide('Feldmann: „Wer berichtet denn über die Sitzung des Gemeinderats …?“ und „die Verwaltung [wird] schlechter kontrolliert“. Kaltenbach stimmt zwar zu („Da widerspreche ich gar nicht“), aber die Aussage stammt von ihm.',
            'Idée de Feldmann, approuvée ensuite par Kaltenbach.')),
        wer('q2', 'Auch der Austausch unter Nachbarn ist eine Form lokaler Information.', 'Dana Kaltenbach',
          aide('Kaltenbach über ihre App: „Das ist doch auch lokale Information.“ Feldmann widerspricht direkt: „Das ist Austausch, aber kein Journalismus.“',
            'Kaltenbach défend la valeur des échanges entre voisins.')),
        wer('q3', 'Staatliches Geld für Medien, die den Staat kontrollieren, wirkt widersprüchlich.', 'die Moderatorin',
          aide('Die Moderatorin fragt kritisch: „Eine Förderung vom Staat für Zeitungen, die den Staat kontrollieren sollen: Ist das nicht ein Widerspruch?“ Feldmann antwortet darauf und verteidigt die Förderung.',
            'La question critique vient de l’animatrice.')),
        wer('q4', 'In einer App kann jeder unbelegte Behauptungen verbreiten.', 'Rüdiger Feldmann',
          aide('Feldmann: „In Ihrer App kann jeder alles behaupten. Wer prüft denn, ob eine Meldung stimmt?“ Kaltenbach antwortet, die Nutzer korrigierten sich gegenseitig.',
            'Critique de Feldmann envers l’appli.')),
        wer('q5', 'Werbeeinnahmen allein reichen nicht, um Journalismus zu bezahlen.', 'Dana Kaltenbach',
          aide('Kaltenbach: „Die Frage ist nur, wer das bezahlt. Werbung allein reicht dafür nicht.“ Feldmann sagt danach allgemeiner, gute Recherche koste Geld, spricht aber nicht über Werbung.',
            'C’est Kaltenbach qui parle de la publicité.')),
        wer('q6', 'Öffentliche Finanzierung und Unabhängigkeit schließen sich nicht aus.', 'Rüdiger Feldmann',
          aide('Feldmann nennt als Beispiel den öffentlich-rechtlichen Rundfunk: Öffentliches Geld und Unabhängigkeit „müssen sich nicht ausschließen“. Kaltenbach ist „skeptischer“.',
            'Feldmann cite l’exemple de l’audiovisuel public.')),
        wer('q7', 'Viele Leser würden für Berichte über ihr eigenes Viertel bezahlen.', 'Dana Kaltenbach',
          aide('Kaltenbach: „Viele zahlen gern ein paar Euro im Monat, wenn sie merken, dass die Berichte ihr eigenes Viertel betreffen.“ Sie setzt auf Stiftungen und Leser statt auf staatliche Förderung.',
            'Financement par les lecteurs : idée de Kaltenbach.')),
      ] },

    // 6 · Mission écrite : contribution à un forum
    { id: 'b2-medien-atelier-schreiben', kind: 'mission', title: 'Mission: ein Forumsbeitrag zu sozialen Netzwerken', estimatedMinutes: 28,
      competences: ['expression-ecrite'],
      lesson: { description: `SITUATION
[fr?] La situation
${aide('Das Onlinemagazin Ihrer Stadt stellt jede Woche eine Frage zur Diskussion. Diese Woche lautet sie: „Sollen soziale Netzwerke erst ab 16 Jahren erlaubt sein?“ Zwei Personen haben schon geantwortet.', 'Le magazine en ligne de votre ville soumet chaque semaine une question au débat : « Les réseaux sociaux devraient-ils être autorisés seulement à partir de 16 ans ? » Deux personnes ont déjà répondu.')}

DIE BEITRÄGE
[fr?] Les messages
Antje, Mutter von zwei Kindern: Ja, unbedingt! Meine Tochter ist zwölf und hängt jeden Abend stundenlang am Handy. Seit sie in sozialen Netzwerken ist, vergleicht sie sich ständig mit anderen. Eine klare Altersgrenze würde uns Eltern helfen, Nein zu sagen.
Levin, 17: Ein Verbot bringt nichts. Wer unter 16 ist, gibt einfach ein falsches Alter an. Außerdem halten viele von uns über die Netzwerke Kontakt zu Freunden, die weit weg wohnen. Besser wäre es, in der Schule zu lernen, wie man die Apps vernünftig nutzt.

SO GEHEN SIE VOR
[fr?] Démarche
1. ${aide('Planen (6 Minuten): Wie ist Ihre Position? Welches Argument von Antje oder Levin greifen Sie auf? Welche zwei eigenen Argumente haben Sie?', 'Planifier (6 minutes) : votre position, l’argument repris, deux arguments personnels.')}
2. ${aide('Schreiben (17 Minuten): Folgen Sie dem Aufbau aus Carlottas Beitrag.', 'Écrire (17 minutes) : suivez la structure de la contribution de Carlotta.')}
3. ${aide('Prüfen (5 Minuten): Lesen Sie mit der Checkliste. Stimmen die Formen der indirekten Rede?', 'Vérifier (5 minutes) : relisez avec la liste ; les formes du discours indirect sont-elles justes ?')}` },
      placements: [{ media: 'b2-medien-atelier-schreiben-forum', caption: 'Diskussion der Woche' }],
      mission: {
        oral: null,
        written: { prompt: aide('Schreiben Sie einen Beitrag für das Forum (150 bis 250 Wörter). Nennen Sie Ihre Meinung zur Altersgrenze. Geben Sie die Meinung von Antje oder Levin in indirekter Rede wieder und reagieren Sie darauf. Begründen Sie Ihre Position mit mindestens zwei Argumenten und einem Beispiel, gehen Sie auf ein Gegenargument ein und schließen Sie mit einem Fazit.',
          'Écrivez une contribution de 150 à 250 mots : votre avis, l’opinion d’Antje ou de Levin rapportée au discours indirect et votre réaction, deux arguments et un exemple, un contre-argument pris en compte, une conclusion.'),
          maxChars: 2400, minWords: 150 },
        checklist: [
          aide('Ich knüpfe an die Diskussion an und nenne meine Position.', 'Je me rattache à la discussion et j’annonce ma position.'),
          aide('Ich gebe eine Meinung aus dem Forum in indirekter Rede wieder.', 'Je rapporte un avis du forum au discours indirect.'),
          aide('Ich begründe mit zwei Argumenten und einem Beispiel.', 'Je justifie avec deux arguments et un exemple.'),
          aide('Ich gehe auf ein Gegenargument ein („Zwar …, aber …“).', 'Je prends en compte un contre-argument.'),
          aide('Mein Beitrag hat Absätze und ein klares Fazit.', 'Ma contribution a des paragraphes et une conclusion claire.'),
        ],
        criteria: [
          { ...GRIDS.b2.schreiben[0], label: aide('Aufgabe: Position, eine Forumsmeinung in indirekter Rede, zwei Argumente mit Beispiel, Gegenargument, Fazit', 'Tâche : position, avis rapporté, arguments, contre-argument, conclusion') },
          ...GRIDS.b2.schreiben.slice(1),
        ],
      } },

    // 7 · Mission orale : discussion simulée
    { id: 'b2-medien-atelier-sprechen', kind: 'mission', title: 'Mission: eine Diskussion über Klarnamen im Netz', estimatedMinutes: 20,
      competences: ['expression-orale'],
      lesson: { description: `SITUATION
[fr?] La situation
${aide('In einer Diskussionsrunde der Volkshochschule geht es um die Frage, ob man im Internet nur noch mit seinem echten Namen schreiben dürfen sollte. Hören Sie die beiden Positionen. Dann sind Sie an der Reihe.', 'Dans un débat organisé par l’université populaire, on se demande s’il faudrait écrire en ligne uniquement sous son vrai nom. Écoutez les deux positions ; ensuite, c’est à vous.')}

DIE POSITIONEN
[fr?] Les positions
• ${aide('Herr Hollmann: für eine Klarnamenpflicht, weil Menschen mit echtem Namen weniger beleidigen.', 'M. Hollmann : pour l’obligation du vrai nom, qui réduirait les insultes.')}
• ${aide('Frau Mensah: dagegen, weil manche Menschen den Schutz der Anonymität brauchen und Beleidigungen auch mit echtem Namen vorkommen.', 'Mme Mensah : contre, car certains ont besoin de l’anonymat et on insulte aussi sous son vrai nom.')}

IHR BEITRAG
[fr?] Votre intervention
• ${aide('Geben Sie die beiden Positionen kurz wieder, auch im Konjunktiv I: „Herr Hollmann meint, …“.', 'Résumez brièvement les deux positions, au Konjunktiv I.')}
• ${aide('Sagen Sie Ihre Meinung und begründen Sie sie mit mindestens zwei Argumenten.', 'Donnez votre avis avec au moins deux arguments.')}
• ${aide('Gehen Sie auf einen Einwand ein und schlagen Sie einen Kompromiss vor.', 'Répondez à une objection et proposez un compromis.')}

VORBEREITUNG
[fr?] Préparation
${aide('Hören Sie noch einmal das Modell von Bente Marquardt. Überlegen Sie sich Stichwörter, aber sprechen Sie frei, etwa zwei bis drei Minuten.', 'Réécoutez le modèle de Bente Marquardt. Préparez des mots-clés, mais parlez librement, deux à trois minutes environ.')}` },
      placements: [{ media: 'b2-medien-atelier-sprechen-positionen', caption: 'Diskussionsrunde: Klarnamen im Netz?' }],
      mission: {
        oral: { prompt: aide('Nehmen Sie an der Diskussion teil (zwei bis drei Minuten). Geben Sie die Positionen von Herrn Hollmann und Frau Mensah kurz wieder, sagen Sie begründet Ihre Meinung, reagieren Sie auf einen Einwand und machen Sie einen Kompromissvorschlag.',
          'Participez au débat (deux à trois minutes) : rapportez les deux positions, donnez votre avis argumenté, répondez à une objection et proposez un compromis.'),
          maxSeconds: 180 },
        written: null,
        checklist: [
          aide('Ich gebe beide Positionen wieder („… meint, … sei …“).', 'Je rapporte les deux positions.'),
          aide('Ich begründe meine Meinung mit zwei Argumenten.', 'Je justifie mon avis par deux arguments.'),
          aide('Ich reagiere höflich auf einen Einwand.', 'Je réponds poliment à une objection.'),
          aide('Ich schlage einen konkreten Kompromiss vor.', 'Je propose un compromis concret.'),
        ],
        criteria: [
          { ...GRIDS.b2.sprechen[0], label: aide('Aufgabe: beide Positionen wiedergegeben, Meinung mit zwei Argumenten, Einwand und Kompromiss', 'Tâche : positions rapportées, avis argumenté, objection, compromis') },
          ...GRIDS.b2.sprechen.slice(1),
        ],
      } },

    // 8 · Bilan et annonce de la Zwischenbilanz
    { id: 'b2-medien-atelier-bilan', kind: 'lesson', title: 'Bilanz: Medien und Vorbereitung auf die Zwischenbilanz', estimatedMinutes: 7,
      competences: ['lecture'],
      lesson: { description: `${aide('Lesen Sie die Ziele der beiden Module „Medien“. Was können Sie schon sicher? Was möchten Sie noch üben?', 'Relisez les objectifs des deux modules « Medien ». Qu’est-ce qui est acquis ? Que voulez-vous encore travailler ?')}

ICH KANN …
[fr?] Je peux…
• ${aide('Ich kann Artikel und Meldungen über Medien verstehen und erkennen, wer was behauptet.', 'Je peux comprendre articles et dépêches sur les médias et repérer qui affirme quoi.')}
• ${aide('Ich kann wiedergeben, was andere gesagt haben, im Konjunktiv I und mit „laut“ oder „zufolge“.', 'Je peux rapporter des propos au Konjunktiv I et avec laut ou zufolge.')}
• ${aide('Ich kann einen argumentierenden Forumsbeitrag schreiben und dabei auf andere Beiträge eingehen.', 'Je peux écrire une contribution argumentée à un forum en réagissant aux autres messages.')}
• ${aide('Ich kann in einer Diskussion Positionen wiedergeben, widersprechen und einen Kompromiss vorschlagen.', 'Je peux rapporter des positions, objecter et proposer un compromis dans un débat.')}
• ${aide('Ich kann in einer Radiodebatte erkennen, wer welche Meinung vertritt.', 'Je peux repérer qui défend quelle opinion dans un débat radio.')}

NÄCHSTER SCHRITT: DIE ZWISCHENBILANZ
[fr?] Prochaine étape : le bilan intermédiaire
${aide('Nach diesem Modul kommt die Zwischenbilanz zu den Modulen 1 bis 12: Lebenswege, Arbeitswelt, Bildung, Gesundheit, Wohnen und Medien. Sie dauert 75 Minuten und prüft Lesen, Hören, Schreiben und Sprechen. Sie entscheidet nicht über das Bestehen, sondern zeigt Ihnen, was Sie vor der zweiten Hälfte des Kurses wiederholen sollten.', 'Après ce module vient le bilan intermédiaire sur les modules 1 à 12. Il dure 75 minutes et porte sur la lecture, l’écoute, l’écrit et l’oral. Il ne valide rien : il montre ce qu’il faut revoir avant la seconde moitié du cours.')}

SO BEREITEN SIE SICH VOR
[fr?] Comment vous préparer
• ${aide('Grammatik: Lesen Sie die Regeln der sechs Themenmodule noch einmal: Konjunktiv II der Vergangenheit (Lebenswege), Passiv mit Modalverb und Passiversatz (Arbeitswelt), Partizipialattribut und Nominalisierung (Bildung), indem, sodass und subjektive Modalverben (Gesundheit), Genitivpräpositionen und Nomen-Verb-Verbindungen (Wohnen), Konjunktiv I (Medien).', 'Grammaire : relisez les règles des six modules de thème.')}
• ${aide('Schreiben: Wiederholen Sie die Modelle der Werkstätten: E-Mail mit Rat, formeller Brief, Forumsbeitrag. Achten Sie auf Aufbau und Register.', 'Écrit : revoyez les modèles des ateliers (courriel de conseil, lettre formelle, forum).')}
• ${aide('Sprechen: Üben Sie einen Vortrag mit Gliederung und einen Diskussionsbeitrag mit Einwand und Kompromiss.', 'Oral : entraînez-vous à un exposé structuré et à une intervention avec objection et compromis.')}
• ${aide('Hören und Lesen: Machen Sie die Prüfungstrainings noch einmal und achten Sie auf Ihre Zeit.', 'Écoute et lecture : refaites les entraînements à l’examen en surveillant le temps.')}` } },
  ],
};

/** Indices affichés sous les trous d'un fill (forme de base à transformer). */
function hints(question, ...values) {
  return { ...question, blanks: question.blanks.map((blank, index) => (values[index] ? { ...blank, hint: values[index] } : blank)) };
}
