// Module B1 n° 3 · thème « Beziehungen » (lot R1, thème nouveau). Parler de ses relations et de ses sentiments :
// verbes à préposition (sich freuen auf/über, sich ärgern über, sich verlassen auf, Angst haben vor…), adverbes
// pronominaux da- et wo- pour les choses (darauf, worüber, y compris pour annoncer une subordonnée), préposition et
// pronom pour les personnes (auf wen, auf sie), pronoms réfléchis à l'accusatif et au datif (ich ärgere mich, ich
// wünsche mir). Aucune reprise du brouillon B1 V1 : thème nouveau, textes originaux.
import { C, bi, choice, fill, order, match, dictation, speak } from '../../lib.mjs';

/** « Richtig / falsch / steht nicht im Text » : r, f ou n pour la bonne réponse. */
const rf = (id, statement, answer, explanation) => choice(id, `${statement} ${C.richtigFalsch}`,
  [['richtig', answer === 'r'], ['falsch', answer === 'f'], ['steht nicht im Text', answer === 'n']], explanation);

export default {
  id: 'b1-beziehungen',
  title: 'Beziehungen : parler de ses relations et de ses sentiments',
  objective: 'Décrire une amitié ou une relation familiale, dire ce que l’on ressent, montrer de la compréhension et s’excuser, avec les verbes à préposition et les mots en da- et wo-.',
  grammarFocus: ['verben-mit-praepositionen', 'da-wo-pronominaladverb', 'reflexive-verben'],
  sources: [
    'Textes, dialogues et exercices originaux LinguaCap.',
    'Thème nouveau du parcours B1 (sans reprise du brouillon B1 V1).',
  ],

  vocabulary: [
    { word: 'Freundschaft', article: 'die', plural: 'Freundschaften', partOfSpeech: 'noun', translation: 'l’amitié',
      example: 'Eine echte Freundschaft braucht Zeit.', note: null },
    { word: 'Vertrauen', article: 'das', plural: null, partOfSpeech: 'noun', translation: 'la confiance',
      example: 'Ohne Vertrauen gibt es keine Freundschaft.', note: 'Vertrauen zu + datif : Ich habe Vertrauen zu ihr.' },
    { word: 'Streit', article: 'der', plural: null, partOfSpeech: 'noun', translation: 'la dispute',
      example: 'Nach dem Streit haben wir lange nicht miteinander gesprochen.', note: 'pluriel rare (die Streite) ; on dit plutôt die Streitigkeiten' },
    { word: 'Missverständnis', article: 'das', plural: 'Missverständnisse', partOfSpeech: 'noun', translation: 'le malentendu',
      example: 'Zum Glück war alles nur ein Missverständnis.', note: null },
    { word: 'Beziehung', article: 'die', plural: 'Beziehungen', partOfSpeech: 'noun', translation: 'la relation',
      example: 'Ich habe eine sehr gute Beziehung zu meiner Schwester.', note: 'eine Beziehung zu + datif' },
    { word: 'Rat', article: 'der', plural: 'Ratschläge', partOfSpeech: 'noun', translation: 'le conseil',
      example: 'Wenn ich ein Problem habe, frage ich meine Schwester um Rat.', note: 'jemanden um Rat fragen · pluriel : die Ratschläge' },
    { word: 'sich streiten', partOfSpeech: 'verb', translation: 'se disputer',
      example: 'Mein Bruder und ich streiten uns oft über die Musik.', note: 'mit + datif (avec qn) ; über + accusatif (à propos de) · stritt, hat gestritten' },
    { word: 'sich versöhnen', partOfSpeech: 'verb', translation: 'se réconcilier',
      example: 'Nach einer Woche haben sie sich wieder versöhnt.', note: 'sich mit + datif versöhnen' },
    { word: 'sich verlassen', partOfSpeech: 'verb', translation: 'compter sur, se fier à',
      example: 'Auf meine beste Freundin kann ich mich immer verlassen.', note: 'sich auf + accusatif verlassen · verließ, hat verlassen' },
    { word: 'sich kümmern', partOfSpeech: 'verb', translation: 's’occuper de',
      example: 'Wer kümmert sich um deine Katze, wenn du weg bist?', note: 'sich um + accusatif kümmern' },
    { word: 'sich ärgern', partOfSpeech: 'verb', translation: 's’énerver, être contrarié',
      example: 'Ich ärgere mich über die ständigen Verspätungen.', note: 'sich über + accusatif ärgern' },
    { word: 'sich freuen', partOfSpeech: 'verb', translation: 'se réjouir',
      example: 'Ich freue mich schon auf deinen Besuch.', note: 'auf + acc. : à venir ; über + acc. : déjà là' },
    { word: 'Angst haben', partOfSpeech: 'expression', translation: 'avoir peur',
      example: 'Viele Menschen haben Angst vor Konflikten.', note: 'Angst vor + datif haben' },
    { word: 'sich entschuldigen', partOfSpeech: 'verb', translation: 's’excuser',
      example: 'Ich möchte mich bei dir für gestern entschuldigen.', note: 'bei + datif (auprès de qn) ; für + accusatif (de qch)' },
    { word: 'sich bedanken', partOfSpeech: 'verb', translation: 'remercier',
      example: 'Sie hat sich bei mir für die Hilfe bedankt.', note: 'bei + datif (qn) ; für + accusatif (qch)' },
    { word: 'sich Sorgen machen', partOfSpeech: 'expression', translation: 'se faire du souci',
      example: 'Ich mache mir Sorgen um meinen Bruder.', note: 'pronom au datif (mir, dir) ; um + accusatif' },
    { word: 'sich wünschen', partOfSpeech: 'verb', translation: 'souhaiter (pour soi)',
      example: 'Ich wünsche mir mehr Zeit mit meinen Freunden.', note: 'pronom au datif : ich wünsche mir etwas' },
    { word: 'sich melden', partOfSpeech: 'verb', translation: 'donner des nouvelles, se manifester',
      example: 'Melde dich mal wieder bei mir!', note: 'sich bei + datif melden' },
    { word: 'zuhören', partOfSpeech: 'verb', translation: 'écouter (qn)',
      example: 'Eine gute Freundin kann gut zuhören.', note: 'séparable : zu|hören · + datif' },
    { word: 'Verständnis haben', partOfSpeech: 'expression', translation: 'avoir de la compréhension',
      example: 'Ich habe Verständnis für deine Situation.', note: 'Verständnis für + accusatif haben' },
    { word: 'enttäuscht', partOfSpeech: 'adjective', translation: 'déçu',
      example: 'Ich war sehr enttäuscht von ihm.', note: 'von + datif (qn) ; über + accusatif (qch)' },
    { word: 'erleichtert', partOfSpeech: 'adjective', translation: 'soulagé',
      example: 'Nach dem Gespräch war ich total erleichtert.', note: null },
    { word: 'stolz', partOfSpeech: 'adjective', translation: 'fier',
      example: 'Meine Eltern sind stolz auf mich.', note: 'stolz auf + accusatif' },
    { word: 'eifersüchtig', partOfSpeech: 'adjective', translation: 'jaloux',
      example: 'Mein kleiner Bruder ist eifersüchtig auf das neue Baby.', note: 'eifersüchtig auf + accusatif' },
    { word: 'beleidigt', partOfSpeech: 'adjective', translation: 'vexé',
      example: 'Sie war beleidigt, weil ich ihren Geburtstag vergessen hatte.', note: null },
    { word: 'nachtragend', partOfSpeech: 'adjective', translation: 'rancunier',
      example: 'Zum Glück ist meine Freundin nicht nachtragend.', note: null },
  ],

  media: [
    { key: 'b1-beziehungen-hoeren-audio', kind: 'audio', title: 'Nele et Deniz : un malentendu',
      script: [
        { voice: 'frau', name: 'Nele', text: 'Hallo Deniz. Schön, dass du Zeit hast. Ehrlich gesagt war ich nicht sicher, ob du überhaupt kommst.' },
        { pause: 0.5 },
        { voice: 'mann2', name: 'Deniz', text: 'Hallo Nele. Klar komme ich! Aber du klingst irgendwie komisch. Ist etwas los?' },
        { pause: 0.5 },
        { voice: 'frau', name: 'Nele', text: 'Na ja, ich muss dir etwas sagen. Ich habe mich am Samstag ziemlich über dich geärgert. Ich hatte doch alle zu meinem Geburtstagsessen eingeladen, und du bist einfach nicht gekommen. Ich habe den ganzen Abend auf dich gewartet.' },
        { pause: 0.5 },
        { voice: 'mann2', name: 'Deniz', text: 'Moment mal. Ich habe dir doch am Freitag geschrieben, dass ich nicht kann! Meine Mutter musste ins Krankenhaus, und ich bin sofort nach Köln gefahren.' },
        { pause: 0.5 },
        { voice: 'frau', name: 'Nele', text: 'Was? Davon weiß ich nichts. Ich habe keine Nachricht von dir bekommen.' },
        { pause: 0.6 },
        { voice: 'mann2', name: 'Deniz', text: 'Warte, ich schaue mal nach. Oh nein! Die Nachricht ist in der Gruppe vom Volleyballteam gelandet, nicht bei dir. Das tut mir wirklich leid, Nele.' },
        { pause: 0.5 },
        { voice: 'frau', name: 'Nele', text: 'Ach, so war das! Und ich habe gedacht, du hast einfach keine Lust auf meine Party. Ich war richtig enttäuscht. Aber sag mal, wie geht es denn deiner Mutter?' },
        { pause: 0.5 },
        { voice: 'mann2', name: 'Deniz', text: 'Zum Glück wieder besser. Sie hatte einen Unfall mit dem Fahrrad, aber nach drei Tagen durfte sie nach Hause. Ich kümmere mich jetzt ein bisschen um sie und fahre am Wochenende immer nach Köln.' },
        { pause: 0.5 },
        { voice: 'frau', name: 'Nele', text: 'Gut, dass es ihr besser geht. Und ich bin so erleichtert, dass alles nur ein Missverständnis war. Ehrlich, ich hatte schon Angst davor, dass unsere Freundschaft kaputt ist.' },
        { pause: 0.5 },
        { voice: 'mann2', name: 'Deniz', text: 'Quatsch! Auf mich kannst du dich doch verlassen. Aber warum hast du mich nicht einfach angerufen?' },
        { pause: 0.5 },
        { voice: 'frau', name: 'Nele', text: 'Ich war beleidigt, und ich wollte nicht als Erste anrufen. Das war blöd von mir, ich weiß.' },
        { pause: 0.5 },
        { voice: 'mann2', name: 'Deniz', text: 'Wir haben beide einen Fehler gemacht. Weißt du was? Ich lade dich zum Essen ein, und wir feiern deinen Geburtstag noch einmal, nur wir zwei. Was hältst du davon?' },
        { pause: 0.5 },
        { voice: 'frau', name: 'Nele', text: 'Sehr gern! Darauf freue ich mich. Wie wäre es mit Donnerstag?' },
        { pause: 0.4 },
        { voice: 'mann2', name: 'Deniz', text: 'Donnerstag passt mir gut. Ich reserviere einen Tisch beim Italiener am Markt.' },
      ] },
    { key: 'b1-beziehungen-regel-tabelle', kind: 'image', title: 'Chose ou personne : da-, wo- ou pronom',
      alt: 'Tableau à deux colonnes. Chose : « Worauf wartest du? Ich warte darauf. Worüber ärgerst du dich? Ich ärgere mich darüber. » Personne : « Auf wen wartest du? Ich warte auf ihn. Über wen ärgerst du dich? Ich ärgere mich über sie. »',
      image: { layout: 'table', title: 'Sache oder Person?', icon: 'scale',
        columns: ['', 'Sache', 'Person'],
        rows: [
          ['Frage', '[Worauf] wartest du?', '[Auf wen] wartest du?'],
          ['Antwort', 'Ich warte [darauf].', 'Ich warte [auf ihn].'],
          ['Frage', '[Worüber] ärgerst du dich?', '[Über wen] ärgerst du dich?'],
          ['Antwort', 'Ich ärgere mich [darüber].', 'Ich ärgere mich [über sie].'],
        ] } },
    { key: 'b1-beziehungen-lesen2-forum', kind: 'image', title: 'Forum : « Rat gesucht »',
      alt: 'Fil de forum « Rat gesucht » : le message de Leonie sur son amie Jana, puis les réponses de Tom et de « Mama_von_drei ».',
      image: { layout: 'forum', title: 'Rat gesucht: Meine beste Freundin hat keine Zeit mehr für mich',
        posts: [
          { author: 'Leonie_22', date: 'Mo., 18:42', text: 'Hallo zusammen, ich brauche euren Rat. Meine beste Freundin Jana hat seit drei Monaten einen neuen Freund. Seitdem sagt sie fast jedes Treffen ab. Letzte Woche hat sie sogar meinen Geburtstag vergessen. Ich bin total enttäuscht, aber ich weiß nicht, ob ich mit ihr darüber sprechen soll. Ich habe Angst, dass wir uns dann streiten. Was würdet ihr machen?' },
          { author: 'Tom_B', date: 'Mo., 19:15', text: 'Hi Leonie, das kann ich gut verstehen. Mir ist das mit meinem besten Freund auch passiert. Ich habe lange nichts gesagt und mich nur still geärgert. Am Ende haben wir uns fast ein Jahr nicht gesehen. Heute bereue ich das. Mein Tipp: Ruf sie an und sag ihr ehrlich, wie du dich fühlst. Aber mach ihr keine Vorwürfe!' },
          { author: 'Mama_von_drei', date: 'Di., 08:05', text: 'Liebe Leonie, hab ein bisschen Geduld! Am Anfang einer Beziehung ist man oft sehr verliebt und vergisst alles andere. Das geht meistens von selbst vorbei. Vielleicht kannst du Jana vorschlagen, dass ihr einmal im Monat einen Abend nur zu zweit verbringt. Ich bin sicher, sie freut sich darüber.' },
        ] } },
    { key: 'b1-beziehungen-kontrolle-audio', kind: 'audio', title: 'Jakob parle de sa sœur',
      script: [
        { voice: 'mann3', name: 'Jakob', text: 'Mit meiner Schwester Mia habe ich mich früher ständig gestritten, meistens über ganz kleine Dinge: das Badezimmer, die Fernbedienung, die laute Musik. Als sie mit achtzehn ausgezogen ist, war ich zuerst froh. Aber nach ein paar Wochen habe ich sie richtig vermisst.' },
        { pause: 0.4 },
        { voice: 'mann3', name: 'Jakob', text: 'Heute verstehen wir uns super. Wir telefonieren jeden Sonntag, und wenn ich ein Problem habe, frage ich zuerst sie um Rat. Nur über Politik sprechen wir nicht so gern, denn darüber streiten wir uns immer noch!' },
      ] },
  ],

  activities: [
    // 1 · Mise en route
    { id: 'b1-beziehungen-einstieg', kind: 'lesson', title: 'Mise en route : amis, famille et sentiments', estimatedMinutes: 10,
      competences: ['lecture', 'expression-orale'],
      lesson: { description: `BEZIEHUNGEN
[fr] Les relations
${bi('Freunde, Familie, Kollegen, Nachbarn: Beziehungen machen uns glücklich, aber manchmal auch traurig oder wütend.', 'Amis, famille, collègues, voisins : les relations nous rendent heureux, mais parfois aussi tristes ou en colère.')}

FRAGEN ZUM EINSTIEG
[fr] Questions pour commencer
• ${bi('Wer ist für Sie ein besonders wichtiger Mensch, und warum?', 'Qui est pour vous une personne particulièrement importante, et pourquoi ?')}
• ${bi('Worüber streiten sich Freunde oder Familien oft?', 'À propos de quoi les amis ou les familles se disputent-ils souvent ?')}
• ${bi('Was ist Ihnen in einer Freundschaft am wichtigsten?', 'Qu’est-ce qui compte le plus pour vous dans une amitié ?')}
${bi('Antworten Sie in Gedanken auf Deutsch, in zwei oder drei einfachen Sätzen.', 'Répondez mentalement en allemand, en deux ou trois phrases simples.')}

ZIELE
[fr] Objectifs
• ${bi('Ich kann eine Freundschaft oder eine Beziehung in der Familie beschreiben.', 'Je peux décrire une amitié ou une relation familiale.')}
• ${bi('Ich kann sagen, was ich fühle: Freude, Ärger, Enttäuschung.', 'Je peux dire ce que je ressens : la joie, la colère, la déception.')}
• ${bi('Ich kann Verständnis zeigen und mich entschuldigen.', 'Je peux montrer de la compréhension et m’excuser.')}
• ${bi('Ich kann einen Zeitschriftenartikel und ein Gespräch über Freundschaft verstehen.', 'Je peux comprendre un article de magazine et une conversation sur l’amitié.')}

WICHTIGE WÖRTER
[fr] Mots-clés
• die Freundschaft — l’amitié
• das Vertrauen — la confiance
• der Streit — la dispute
• das Missverständnis — le malentendu
• sich streiten — se disputer
• sich versöhnen — se réconcilier
• enttäuscht — déçu
• erleichtert — soulagé` } },

    // 2 · Lecture longue avec stratégie
    { id: 'b1-beziehungen-lesen', kind: 'exercise', title: 'Comprendre : ce qui fait une bonne amitié', estimatedMinutes: 20,
      competences: ['lecture'],
      lesson: { description: `${C.lesen}

STRATEGIE
[fr] Stratégie
${bi('Lesen Sie zuerst den Titel und die Zitate. Wer spricht? Worum geht es?', 'Lisez d’abord le titre et les citations. Qui parle ? De quoi s’agit-il ?')}
${bi('Achten Sie beim genauen Lesen auf Wörter wie „darüber“ oder „damit“: Sie zeigen auf etwas, das schon im Text steht.', 'En lecture détaillée, faites attention aux mots comme « darüber » ou « damit » : ils renvoient à quelque chose qui est déjà dans le texte.')}
${bi('„Steht nicht im Text“ bedeutet: Der Text sagt dazu nichts.', '« Non mentionné » signifie : le texte n’en dit rien.')}

WAS MACHT EINE GUTE FREUNDSCHAFT AUS?
Aus einem Stadtmagazin, Rubrik „Psychologie“

(1) Fast jeder Mensch wünscht sich gute Freunde. Aber was macht eine gute Freundschaft eigentlich aus? Eine Psychologin hat für eine Studie über 500 Menschen zwischen 20 und 70 Jahren befragt. Das Ergebnis ist eindeutig: An erster Stelle steht das Vertrauen. „Meine beste Freundin ist immer für mich da. Auf sie kann ich mich hundertprozentig verlassen“, erzählt Lena, 34. Viele Befragte sagen außerdem, dass sie mit guten Freunden über alles sprechen können, auch über Probleme in der Familie oder bei der Arbeit.

(2) Interessant ist, worüber sich Freunde am häufigsten ärgern: nicht über Streit, sondern über fehlendes Interesse. Viele stört es, wenn sich jemand nur dann meldet, wenn er Hilfe braucht. Andere ärgern sich, wenn ein Freund beim Treffen ständig auf sein Handy schaut. „Darüber kann ich mich wirklich aufregen“, sagt Murat, 27. „Ich erwarte nicht, dass wir uns jeden Tag sehen. Aber wenn wir uns treffen, möchte ich, dass er mir zuhört.“

(3) Und was passiert, wenn es doch einmal Streit gibt? Laut der Studie ist ein Streit für eine Freundschaft nicht unbedingt gefährlich. Wichtig ist, wie man damit umgeht. Wer sich nach einem Konflikt ehrlich entschuldigt und über seine Gefühle spricht, kann die Freundschaft sogar stärken. Gefährlicher sind Missverständnisse, wenn niemand darüber redet. „Ich war einmal sehr enttäuscht von einer Freundin, weil sie meinen Geburtstag vergessen hatte“, erzählt Sabine, 58. „Ein Jahr lang habe ich nichts gesagt. Erst viel später habe ich erfahren, dass sie damals im Krankenhaus lag. Ich habe mich so geschämt!“

(4) Am Ende ihrer Studie gibt die Psychologin drei Tipps. Erstens: sich regelmäßig bei Freunden melden, nicht nur zum Geburtstag. Zweitens: sich für das Leben der anderen interessieren und Fragen stellen. Drittens: nicht zu lange warten, wenn einen etwas stört. „Sprechen Sie das Problem an, solange es noch klein ist“, rät die Expertin. „Viele Freundschaften gehen nicht an einem großen Streit kaputt, sondern an vielen kleinen Dingen, über die man nie gesprochen hat.“` },
      questions: [
        choice('q1', bi('Worum geht es in dem Artikel vor allem?', 'De quoi parle surtout cet article ?'),
          [['um einen Streit zwischen zwei Freundinnen'], ['um Tipps, wie man neue Freunde findet'], ['um die Frage, was Freundschaften stark macht', true]],
          'L’article présente une étude sur ce qui fait une bonne amitié (confiance, intérêt, manière de gérer les disputes) et se termine par des conseils pour la garder. Il ne raconte pas une seule dispute et n’explique pas comment se faire de nouveaux amis.'),
        choice('q2', bi('Was sagt der Artikel über Streit unter Freunden?', 'Que dit l’article des disputes entre amis ?'),
          [['Ein Streit kann eine Freundschaft sogar stärken, wenn man gut damit umgeht.', true], ['Nach einem Streit ist eine Freundschaft meistens vorbei.'], ['Gute Freunde streiten sich nie.']],
          'Paragraphe 3 : une dispute « ist … nicht unbedingt gefährlich » ; s’excuser et parler de ses sentiments « kann die Freundschaft sogar stärken ». Le danger, ce sont les malentendus dont personne ne parle.'),
        rf('q3', 'Für die meisten Befragten ist Vertrauen das Wichtigste in einer Freundschaft.', 'r',
          'Vrai : « An erster Stelle steht das Vertrauen » (paragraphe 1). « An erster Stelle » signifie « en première place », donc le plus important.'),
        rf('q4', 'Murat möchte seine Freunde jeden Tag sehen.', 'f',
          'Faux : Murat dit au contraire « Ich erwarte nicht, dass wir uns jeden Tag sehen ». Ce qui compte pour lui, c’est qu’on l’écoute quand on se voit.'),
        rf('q5', 'Sabine hat sich mit ihrer Freundin wieder versöhnt.', 'n',
          'Sabine raconte sa déception, puis sa honte quand elle a appris la vérité. Le texte ne dit pas si elles se sont réconciliées : non mentionné. Ne complétez pas avec ce qui vous semble probable.'),
        rf('q6', 'Sabine hat ein Jahr lang nicht über ihre Enttäuschung gesprochen.', 'r',
          'Vrai : « Ein Jahr lang habe ich nichts gesagt. » C’est justement l’exemple d’un malentendu dont personne ne parle, que l’article juge dangereux.'),
        match('q7', bi('Welche Überschrift passt zu welchem Absatz? Ordnen Sie zu.', 'Quel intertitre convient à quel paragraphe ? Associez.'),
          [['Absatz 1', 'Vertrauen an erster Stelle'], ['Absatz 2', 'Was Freunde wirklich stört'], ['Absatz 3', 'Streiten, aber richtig'], ['Absatz 4', 'Drei Tipps der Expertin']],
          'Paragraphe 1 : le résultat principal de l’étude, la confiance. Paragraphe 2 : ce qui énerve les amis (le manque d’intérêt). Paragraphe 3 : bien gérer une dispute et éviter les malentendus. Paragraphe 4 : les trois conseils de la psychologue.'),
        fill('q8', bi('Ergänzen Sie die Wörter aus dem Text.', 'Complétez avec les mots du texte.'),
          'Interessant ist, [[1]] sich Freunde am häufigsten ärgern. „[[2]] kann ich mich wirklich aufregen“, sagt Murat.', [['worüber'], ['Darüber']],
          'sich ärgern über : pour poser la question sur une chose, on emploie wo(r)- + préposition, ici dans une interrogative indirecte (worüber). Darüber reprend une chose déjà nommée : le téléphone regardé sans arrêt. Le r s’ajoute devant une voyelle : wor-über, dar-über.'),
      ] },

    // 3 · Écoute longue : prise de notes puis questions
    { id: 'b1-beziehungen-hoeren', kind: 'exercise', title: 'Comprendre : Nele et Deniz après un malentendu', estimatedMinutes: 18,
      competences: ['ecoute'],
      lesson: { description: `${C.hoeren}

${bi('Situation: Nele hat sich über ihren Freund Deniz geärgert. Jetzt treffen sich die beiden in einem Café und sprechen darüber.', 'Situation : Nele s’est fâchée contre son ami Deniz. Ils se retrouvent maintenant dans un café et en parlent.')}

STRATEGIE
[fr] Stratégie
${bi('Beim ersten Hören: Wie fühlt sich Nele am Anfang, wie am Ende?', 'Première écoute : comment Nele se sent-elle au début, et à la fin ?')}
${bi('Beim zweiten Hören achten Sie nur auf Stichwörter: Tage, Orte, Gründe.', 'À la deuxième écoute, concentrez-vous seulement sur des mots-clés : jours, lieux, raisons.')}
${bi('Die Transkription sehen Sie nach Ihren Antworten.', 'Vous verrez la transcription après vos réponses.')}` },
      placements: [{ media: 'b1-beziehungen-hoeren-audio', transcriptVisibility: 'after_answer' }],
      questions: [
        fill('q1', C.notizen,
          'Nele hat sich am [[1]] über Deniz geärgert. Deniz ist nach [[2]] gefahren, weil seine Mutter im Krankenhaus war. Seine Nachricht ist in der Gruppe vom [[3]] gelandet. Nele hatte Angst, dass ihre [[4]] kaputt ist. Neues Treffen: am [[5]] beim Italiener.',
          [['Samstag', 'Samstagabend'], ['Köln'], ['Volleyballteam', 'Volleyball-Team'], ['Freundschaft'], ['Donnerstag']],
          'Nele : « Ich habe mich am Samstag ziemlich über dich geärgert ». Deniz : « ich bin sofort nach Köln gefahren », « in der Gruppe vom Volleyballteam gelandet ». Nele : « Angst davor, dass unsere Freundschaft kaputt ist ». Le nouveau rendez-vous : jeudi.'),
        choice('q2', bi('Warum ist Deniz nicht zum Geburtstagsessen gekommen?', 'Pourquoi Deniz n’est-il pas venu au dîner d’anniversaire ?'),
          [['Er hatte keine Lust auf Neles Party und ist zu Hause geblieben.'], ['Er musste zu seiner Mutter ins Krankenhaus fahren.', true], ['Er hatte das Datum des Geburtstagsessens vergessen.']],
          'Sa mère a eu un accident de vélo et a dû aller à l’hôpital ; il est parti tout de suite à Cologne. « Keine Lust » est seulement ce que Nele avait imaginé, à cause du message égaré.'),
        choice('q3', bi('Warum hat Nele Deniz nicht angerufen?', 'Pourquoi Nele n’a-t-elle pas appelé Deniz ?'),
          [['Sie war beleidigt und wollte nicht als Erste anrufen.', true], ['Sie hatte seine neue Handynummer nicht und konnte ihn nicht erreichen.'], ['Sie war das ganze Wochenende krank und lag im Bett.']],
          '« Ich war beleidigt, und ich wollte nicht als Erste anrufen. Das war blöd von mir. » Nele reconnaît sa part d’erreur ; elle n’évoque ni problème de numéro ni maladie.'),
        choice('q4', bi('Was schlägt Deniz am Ende vor?', 'Que propose Deniz à la fin ?'),
          [['Sie sollen zusammen nach Köln fahren.'], ['Sie sollen mit dem Volleyballteam feiern.'], ['Er möchte Nele zum Essen einladen, nur sie beide.', true]],
          '« Ich lade dich zum Essen ein, und wir feiern deinen Geburtstag noch einmal, nur wir zwei. » Cologne est l’endroit où il rend visite à sa mère, et l’équipe de volley n’est citée qu’à cause du message égaré.'),
        choice('q5', bi('Wie fühlt sich Nele am Ende des Gesprächs?', 'Comment Nele se sent-elle à la fin de la conversation ?'),
          [['immer noch enttäuscht'], ['erleichtert und froh', true], ['eifersüchtig auf das Volleyballteam']],
          'Nele dit « ich bin so erleichtert, dass alles nur ein Missverständnis war » et accepte l’invitation avec joie : « Sehr gern! Darauf freue ich mich. » Sa déception appartient au passé (« Ich war richtig enttäuscht »).'),
      ] },

    // 4 · Grammaire inductive
    { id: 'b1-beziehungen-entdecken', kind: 'exercise', title: 'Découvrir : darauf, worüber, auf sie', estimatedMinutes: 10,
      competences: ['lecture'],
      lesson: { description: `${bi('Lesen Sie die Sätze aus dem Artikel und aus dem Gespräch. Achten Sie auf die Präpositionen und auf die Wörter mit da- und wo-.', 'Lisez ces phrases de l’article et de la conversation. Observez les prépositions et les mots en da- et wo-.')}

(1) Auf sie kann ich mich hundertprozentig verlassen. (Lena über ihre beste Freundin)
(2) Ich kümmere mich jetzt ein bisschen um sie. (Deniz über seine Mutter)
(3) Interessant ist, worüber sich Freunde am häufigsten ärgern.
(4) Darüber kann ich mich wirklich aufregen. (Murat über das Handy beim Treffen)
(5) Ich hatte schon Angst davor, dass unsere Freundschaft kaputt ist.
(6) Darauf freue ich mich. (Nele über das Essen mit Deniz)
(7) Fast jeder Mensch wünscht sich gute Freunde.

${bi('Beantworten Sie dann die Fragen. So finden Sie die Regel selbst.', 'Répondez ensuite aux questions : vous trouverez ainsi la règle vous-même.')}` },
      questions: [
        choice('q1', bi('Sätze (1) und (2): Wofür steht „sie“ nach der Präposition?', 'Phrases (1) et (2) : que représente « sie » après la préposition ?'),
          [['für eine Person', true], ['für eine Sache'], ['für einen Ort']],
          '« auf sie » renvoie à la meilleure amie, « um sie » à la mère : des personnes. Pour une personne, on garde la préposition et on ajoute le pronom personnel (auf sie, um ihn, mit dir).'),
        choice('q2', bi('Satz (4): Wofür steht „darüber“?', 'Phrase (4) : que représente « darüber » ?'),
          [['für Murat, also für eine Person'], ['für das Handy beim Treffen, also eine Sache', true], ['für die Psychologin, die die Studie gemacht hat']],
          'Darüber reprend une chose déjà nommée : regarder son téléphone pendant une rencontre. Pour une chose ou une idée, on remplace « über + nom » par da(r)- + préposition. Pour une personne, on dirait « über ihn » ou « über sie ».'),
        choice('q3', bi('Satz (5): Was macht „davor“ hier?', 'Phrase (5) : quel est le rôle de « davor » ici ?'),
          [['Es bedeutet „vorher“, also früher.'], ['Es zeigt auf einen Ort vor dem Haus.'], ['Es kündigt den dass-Satz an.', true]],
          'Angst haben vor + datif. Quand la « chose » dont on a peur est une subordonnée (dass …) ou un infinitif (zu …), da(r)- + préposition l’annonce dans la principale : Angst davor, dass …. Il ne s’agit ni de temps ni de lieu.'),
        match('q4', bi('Welche Präposition gehört zu welchem Ausdruck? Ordnen Sie zu.', 'Quelle préposition va avec quelle expression ? Associez.'),
          [['sich verlassen', 'auf + Akkusativ'], ['sich ärgern', 'über + Akkusativ'], ['Angst haben', 'vor + Dativ'], ['sich kümmern', 'um + Akkusativ']],
          'Ces prépositions sont fixes et souvent différentes du français : compter sur (auf), s’énerver de (über), avoir peur de (vor + datif), s’occuper de (um). On les apprend avec le verbe, comme un seul bloc.'),
      ] },

    // 5 · Règle
    { id: 'b1-beziehungen-regel', kind: 'lesson', title: 'Retenir : verbes à préposition, da- et wo-, pronoms réfléchis', estimatedMinutes: 8,
      competences: ['lecture'],
      lesson: { description: `À RETENIR
• Beaucoup de verbes ont une préposition fixe, avec un cas fixe. On les apprend en bloc : sich freuen auf + acc. (ce qui va venir) et über + acc. (ce qui est là), sich ärgern über + acc., sich kümmern um + acc., sich verlassen auf + acc., Angst haben vor + dat., sich streiten mit + dat. (über + acc.), sich entschuldigen bei + dat. (für + acc.), sich bedanken bei + dat. (für + acc.), sich interessieren für + acc., denken an + acc.

UNE CHOSE OU UNE PERSONNE ?
• Chose ou idée : da- + préposition (dar- devant une voyelle). Ich freue mich auf das Essen, ich freue mich darauf.
• Question sur une chose : wo- + préposition (wor- devant une voyelle). Worauf freust du dich? Worüber ärgerst du dich?
• Personne : préposition + pronom. Ich verlasse mich auf sie. Question : Auf wen verlässt du dich? Über wen ärgerst du dich?
• da- peut aussi annoncer une subordonnée ou un infinitif : Ich freue mich darauf, dass du kommst. Ich habe Angst davor, allein zu sein.

PRONOMS RÉFLÉCHIS : ACCUSATIF OU DATIF ?
• En général, accusatif : ich ärgere mich, du ärgerst dich, er ärgert sich, wir ärgern uns, ihr ärgert euch, sie ärgern sich.
• Datif quand le verbe a déjà un complément d’objet à l’accusatif : ich wünsche mir ein Fahrrad, du machst dir Sorgen, ich kaufe mir ein Buch.
• Seuls ich et du changent : mich devient mir, dich devient dir. Les autres formes restent identiques (sich, uns, euch).
• Comparez : Ich wasche mich. Ich wasche mir die Hände.

ATTENTION
• Jamais de da- pour une personne : Ich warte auf Paul, ich warte auf ihn (et non « darauf »).
• « penser à » : denken an + acc. Ich denke an dich. Ich denke daran.
• « se fâcher contre quelqu’un » : sich über jemanden ärgern (über + accusatif).
• « avoir peur de » : Angst vor + datif, et non « von ».
• Dans une question indirecte, wo- reste : Ich weiß nicht, worüber er sich ärgert.` },
      placements: [{ media: 'b1-beziehungen-regel-tabelle', caption: 'Sache: da- / wo- · Person: Präposition + Pronomen' }] },

    // 6 · S'entraîner : grammaire
    { id: 'b1-beziehungen-grammatik', kind: 'exercise', title: 'S’entraîner : prépositions, da- et wo-, pronoms réfléchis', estimatedMinutes: 14,
      competences: ['lecture', 'expression-ecrite'],
      lesson: { description: `${bi('Üben Sie die Verben mit Präposition, die Wörter mit da- und wo- und die Reflexivpronomen.', 'Entraînez-vous aux verbes à préposition, aux mots en da- et wo- et aux pronoms réfléchis.')}
${bi('Fragen Sie sich immer: Geht es um eine Sache oder um eine Person?', 'Demandez-vous toujours : s’agit-il d’une chose ou d’une personne ?')}` },
      questions: [
        fill('q1', bi('Ergänzen Sie die Präpositionen.', 'Complétez avec les prépositions.'),
          'Ich freue mich schon [[1]] die Ferien. Meine Schwester kümmert sich [[2]] unseren Hund. Viele Kinder haben Angst [[3]] der Dunkelheit. Gestern habe ich mich [[4]] den Lärm geärgert.',
          [['auf'], ['um'], ['vor'], ['über']],
          'sich freuen auf + accusatif (les vacances sont à venir), sich kümmern um, Angst haben vor + datif (der Dunkelheit), sich ärgern über + accusatif (den Lärm). Le cas de l’article confirme la préposition : der Dunkelheit est au datif.'),
        fill('q2', bi('Ergänzen Sie die Fragewörter.', 'Complétez avec les mots interrogatifs.'),
          '„[[1]] wartest du?“ – „Auf den Bus.“ „[[2]] denkst du gerade?“ – „An meinen Urlaub.“',
          [['Worauf'], ['Woran']],
          'Pour une chose, la question se forme avec wo- + préposition, et wor- devant une voyelle : warten auf → Worauf?, denken an → Woran? « Auf was » s’entend à l’oral familier, mais n’est pas la forme standard.'),
        choice('q3', bi('„Ich ärgere mich über meinen Kollegen.“ Wie fragt man nach dieser Person?', '« Je suis énervé contre mon collègue. » Comment pose-t-on la question sur cette personne ?'),
          [['Worüber ärgerst du dich?'], ['Über wen ärgerst du dich?', true], ['Über was ärgerst du dich?']],
          'Pour une personne, on garde la préposition et on emploie wen (accusatif) : Über wen? Worüber et « über was » interrogent sur une chose, pas sur le collègue.'),
        choice('q4', bi('„Freust du dich auf das Konzert?“ – „Ja, ich freue mich sehr …“', '« Tu te réjouis d’aller au concert ? » – « Oui, je m’en réjouis beaucoup. »'),
          [['auf es.'], ['darauf.', true], ['worauf.']],
          'Le concert est une chose : on le reprend avec da(r)- + préposition, darauf. « auf es » n’existe pas dans ce sens, et worauf sert à poser une question.'),
        fill('q5', bi('Ergänzen Sie die Reflexivpronomen.', 'Complétez avec les pronoms réfléchis.'),
          'Zum Geburtstag wünsche ich [[1]] ein neues Fahrrad. Du machst [[2]] zu viele Sorgen. Am Sonntag treffen wir [[3]] im Park.',
          [['mir'], ['dir'], ['uns']],
          'wünschen et Sorgen machen ont déjà un complément à l’accusatif (ein Fahrrad, Sorgen) : le pronom réfléchi passe au datif, mir et dir. Pour wir, accusatif et datif sont identiques : uns.'),
        choice('q6', bi('Welcher Satz ist richtig?', 'Quelle phrase est correcte ?'),
          [['Ich habe Angst vor, allein in eine neue Stadt zu ziehen.'], ['Ich habe Angst davon, allein in eine neue Stadt zu ziehen.'], ['Ich habe Angst davor, allein in eine neue Stadt zu ziehen.', true]],
          'Angst haben vor : l’infinitif avec zu est annoncé par da(r)- + la même préposition, davor. Une préposition seule (vor) ne peut pas annoncer la suite, et « davon » ne correspond pas à Angst haben.'),
        order('q7', C.ordnen,
          [['Ich', 'freue', 'mich', 'darauf,', 'dass', 'du', 'am Wochenende', 'kommst.']],
          'darauf annonce la subordonnée avec dass, qui précise la chose attendue. Dans la subordonnée, le sujet suit dass et le verbe conjugué kommst va à la fin.'),
        choice('q8', bi('Welche Präpositionen passen? „Ich möchte mich … dir … gestern entschuldigen.“', 'Quelles prépositions conviennent ? « Je voudrais m’excuser auprès de toi pour hier. »'),
          [['bei … für', true], ['an … über'], ['mit … wegen']],
          'sich entschuldigen bei + datif (la personne : bei dir) et für + accusatif (la raison : für gestern). Les autres combinaisons calquent d’autres verbes et ne conviennent pas ici.'),
        match('q9', bi('Welche Antwort passt zu welcher Frage? Ordnen Sie zu.', 'Quelle réponse va avec quelle question ? Associez.'),
          [['Worauf wartest du?', 'Auf den Bus.'], ['Auf wen wartest du?', 'Auf meine Schwester.'], ['Worüber sprecht ihr?', 'Über den Film.'], ['Über wen sprecht ihr?', 'Über unseren Lehrer.']],
          'wo- + préposition interroge sur une chose (le bus, le film) ; préposition + wen interroge sur une personne (ma sœur, notre professeur). La préposition reste la même dans la question et dans la réponse.'),
      ] },

    // 7 · Lexique : collocations, familles, Redemittel
    { id: 'b1-beziehungen-wortschatz', kind: 'exercise', title: 'S’entraîner : mots et formules pour parler des relations', estimatedMinutes: 12,
      competences: ['lecture', 'expression-ecrite'],
      lesson: { description: `${bi('Lernen Sie Wörter zusammen: Nomen mit Verb, Wortfamilien und feste Formulierungen.', 'Apprenez les mots ensemble : nom et verbe, familles de mots et formules toutes faites.')}

REDEMITTEL
[fr] Formules utiles
• pour dire ce qu’on ressent : Ich bin enttäuscht, dass … / Ich habe mich sehr darüber gefreut, dass … / Das hat mich wirklich geärgert.
• pour montrer de la compréhension : Das kann ich gut verstehen. / Das kann ich gut nachvollziehen. / Das tut mir leid für dich.
• pour s’excuser : Es tut mir wirklich leid, dass … / Entschuldige bitte, das war nicht so gemeint.
• pour se réconcilier : Lass uns noch einmal in Ruhe darüber reden. / Wollen wir das einfach vergessen?` },
      questions: [
        match('q1', bi('Welches Verb passt zu welchem Nomen? Ordnen Sie zu.', 'Quel verbe va avec quel nom ? Associez.'),
          [['jemandem einen Rat', 'geben'], ['Rücksicht', 'nehmen'], ['ein Geheimnis', 'verraten'], ['einen Fehler', 'zugeben'], ['Kontakt', 'halten']],
          'Collocations fixes : einen Rat geben (donner un conseil), Rücksicht nehmen (avoir des égards), ein Geheimnis verraten (trahir un secret), einen Fehler zugeben (reconnaître une erreur), Kontakt halten (garder le contact).'),
        fill('q2', bi('Ergänzen Sie: stolz, enttäuscht, erleichtert.', 'Complétez avec : stolz, enttäuscht, erleichtert.'),
          'Ich habe die Prüfung bestanden und bin richtig [[1]] auf mich. Mein Freund hat mich angelogen: Ich bin sehr [[2]] von ihm. Zum Glück war alles nur ein Missverständnis. Ich bin total [[3]].',
          [['stolz'], ['enttäuscht'], ['erleichtert']],
          'stolz auf + accusatif : fier de (soi-même ici). enttäuscht von + datif : déçu par quelqu’un qui a menti. erleichtert : soulagé, quand une inquiétude disparaît, comme à la fin d’un malentendu.'),
        fill('q3', bi('Bilden Sie das Nomen.', 'Formez le nom.'),
          'Nach dem [[1]] (sich streiten) haben wir uns versöhnt. Ohne [[2]] (vertrauen) gibt es keine Freundschaft. Die [[3]] (sich freuen) war groß. Seine [[4]] (eifersüchtig) nervt mich.',
          [['Streit'], ['Vertrauen'], ['Freude'], ['Eifersucht']],
          'streiten donne der Streit, vertrauen donne das Vertrauen (infinitif employé comme nom), sich freuen donne die Freude, eifersüchtig donne die Eifersucht. Tous les noms prennent une majuscule.'),
        choice('q4', bi('Ihre Freundin hat Liebeskummer. Wie zeigen Sie Verständnis?', 'Votre amie a un chagrin d’amour. Comment montrez-vous votre compréhension ?'),
          [['Das kann ich gut nachvollziehen. Das tut bestimmt weh.', true], ['Ich verstehe nicht, warum du so traurig bist.'], ['Selbst schuld, das habe ich dir gleich gesagt.']],
          '« Das kann ich gut nachvollziehen » (je comprends tout à fait) reconnaît ce que ressent l’autre. La deuxième réplique dit le contraire de la compréhension, la troisième fait un reproche.'),
        choice('q5', bi('Sie möchten sich entschuldigen. Welche Formulierung passt?', 'Vous voulez vous excuser. Quelle formule convient ?'),
          [['Es ist mir egal, dass ich dich nicht angerufen habe.'], ['Es tut mir wirklich leid, dass ich dich nicht angerufen habe.', true], ['Ich bedanke mich, dass ich dich nicht angerufen habe.']],
          '« Es tut mir leid, dass … » est la formule d’excuse ; « wirklich » la renforce. « Es ist mir egal » montre de l’indifférence, et « sich bedanken » sert à remercier.'),
        choice('q6', bi('„Meine Freundin ist sehr nachtragend.“ Was bedeutet das?', '« Mon amie est très rancunière. » Que veut dire « nachtragend » ?'),
          [['Sie kommt oft zu spät nach Hause.'], ['Sie entschuldigt sich sehr schnell.'], ['Sie vergisst einen Streit lange nicht.', true]],
          'nachtragend : quelqu’un qui garde longtemps en mémoire une dispute ou une offense, qui est rancunier. S’excuser vite serait presque le contraire.'),
        choice('q7', bi('Welche Präposition passt? „Mein kleiner Bruder ist eifersüchtig … das neue Baby.“', 'Quelle préposition convient ? « Mon petit frère est jaloux du nouveau bébé. »'),
          [['über'], ['auf', true], ['für']],
          'eifersüchtig auf + accusatif, comme stolz auf. Le français « jaloux de » pousse à chercher une autre préposition : apprenez l’adjectif avec sa préposition.'),
      ] },

    // 8 · Répéter à voix haute : Redemittel
    { id: 'b1-beziehungen-redemittel', kind: 'exercise', title: 'Répéter à voix haute : dire ce qu’on ressent', estimatedMinutes: 9,
      competences: ['expression-orale'],
      lesson: { description: `${C.sprechen}
${bi('Sprechen Sie mit Gefühl: Freude, Verständnis oder Bedauern hört man an der Stimme.', 'Parlez avec expression : la joie, la compréhension ou le regret s’entendent dans la voix.')}
${bi('Achten Sie auf die Betonung von „darauf“ und „darüber“: Der Akzent liegt auf der zweiten Silbe.', 'Faites attention à l’accent de « darauf » et « darüber » : il porte sur la deuxième syllabe.')}` },
      questions: [
        speak('q1', 'Ich habe mich sehr darüber gefreut, dass du gekommen bist.',
          'Pour dire sa joie. « darüber » annonce la subordonnée ; accent sur « da-RÜ-ber ». Le ü se prononce lèvres arrondies, comme dans « rue ».'),
        speak('q2', 'Das kann ich gut verstehen, das war bestimmt nicht leicht.',
          'Pour montrer de la compréhension. Accent sur « ver-STE-hen » et sur « LEICHT ». Le ch de « leicht » est doux, comme un souffle.'),
        speak('q3', 'Es tut mir wirklich leid, dass ich mich nicht gemeldet habe.',
          'Formule d’excuse complète. Après « dass », le verbe conjugué « habe » va à la fin. Accent sur « LEID » et sur « ge-MEL-det ».'),
        speak('q4', 'Auf dich kann ich mich immer verlassen.',
          'Pour une personne : préposition + pronom (auf dich), placés en tête pour insister. Accent sur « DICH » et sur « ver-LAS-sen ».'),
        speak('q5', 'Lass uns noch einmal in Ruhe darüber reden.',
          'Pour proposer de se réconcilier. « Lass uns … » équivaut à « parlons-en ». Le h de « Ruhe » est muet : on dit [rou-e].'),
        speak('q6', 'Worüber hast du dich denn so geärgert?',
          'Question avec wo- + préposition, adoucie par la particule « denn ». Intonation descendante ; dans « geärgert », on marque une légère coupure entre ge- et ärgert.'),
      ] },

    // 9 · Second document : forum (lecture) et dictées
    { id: 'b1-beziehungen-lesen2', kind: 'exercise', title: 'Comprendre : un forum « Rat gesucht »', estimatedMinutes: 15,
      competences: ['lecture', 'ecoute', 'expression-ecrite'],
      lesson: { description: `${C.lesen}

${bi('Situation: Leonie schreibt in einem Forum über ein Problem mit ihrer besten Freundin. Zwei Personen antworten ihr.', 'Situation : Leonie écrit sur un forum à propos d’un problème avec sa meilleure amie. Deux personnes lui répondent.')}

STRATEGIE
[fr] Stratégie
${bi('Lesen Sie zuerst Leonies Beitrag: Was ist ihr Problem? Lesen Sie dann die Antworten: Welchen Rat gibt jede Person?', 'Lisez d’abord le message de Leonie : quel est son problème ? Lisez ensuite les réponses : quel conseil donne chaque personne ?')}
${bi('Die zwei letzten Fragen sind Diktate. Schreiben Sie genau, mit Großbuchstaben und Kommas.', 'Les deux dernières questions sont des dictées. Écrivez exactement, avec les majuscules et les virgules.')}

RAT GESUCHT: MEINE BESTE FREUNDIN HAT KEINE ZEIT MEHR FÜR MICH

Leonie_22: Hallo zusammen, ich brauche euren Rat. Meine beste Freundin Jana hat seit drei Monaten einen neuen Freund. Seitdem sagt sie fast jedes Treffen ab. Letzte Woche hat sie sogar meinen Geburtstag vergessen. Ich bin total enttäuscht, aber ich weiß nicht, ob ich mit ihr darüber sprechen soll. Ich habe Angst, dass wir uns dann streiten. Was würdet ihr machen?

Tom_B: Hi Leonie, das kann ich gut verstehen. Mir ist das mit meinem besten Freund auch passiert. Ich habe lange nichts gesagt und mich nur still geärgert. Am Ende haben wir uns fast ein Jahr nicht gesehen. Heute bereue ich das. Mein Tipp: Ruf sie an und sag ihr ehrlich, wie du dich fühlst. Aber mach ihr keine Vorwürfe!

Mama_von_drei: Liebe Leonie, hab ein bisschen Geduld! Am Anfang einer Beziehung ist man oft sehr verliebt und vergisst alles andere. Das geht meistens von selbst vorbei. Vielleicht kannst du Jana vorschlagen, dass ihr einmal im Monat einen Abend nur zu zweit verbringt. Ich bin sicher, sie freut sich darüber.` },
      placements: [{ media: 'b1-beziehungen-lesen2-forum', caption: 'Forum: Rat gesucht' }],
      questions: [
        choice('q1', bi('Was ist Leonies Problem?', 'Quel est le problème de Leonie ?'),
          [['Ihre beste Freundin hat kaum noch Zeit für sie.', true], ['Sie hat sich mit ihrem Freund gestritten.'], ['Sie hat den Geburtstag ihrer Freundin vergessen.']],
          'Depuis que Jana a un nouveau copain, elle annule presque toutes les rencontres. Attention à l’inversion : c’est Jana qui a oublié l’anniversaire de Leonie, pas l’inverse.'),
        choice('q2', bi('Was rät Tom?', 'Que conseille Tom ?'),
          [['Leonie soll Geduld haben und warten, bis Jana sich wieder meldet.'], ['Leonie soll den Kontakt zu Jana abbrechen und neue Freundinnen suchen.'], ['Leonie soll Jana anrufen und ehrlich über ihre Gefühle sprechen.', true]],
          '« Ruf sie an und sag ihr ehrlich, wie du dich fühlst. » Tom parle d’expérience : se taire lui a coûté presque un an d’amitié. La patience, c’est le conseil de « Mama_von_drei ».'),
        match('q3', bi('Wer sagt oder erlebt was? Ordnen Sie zu.', 'Qui dit ou vit quoi ? Associez.'),
          [['Leonie', 'hat Angst vor einem Streit'], ['Jana', 'hat einen neuen Freund'], ['Tom', 'hat so etwas selbst erlebt'], ['Mama_von_drei', 'glaubt, dass das Problem von selbst vorbeigeht']],
          'Leonie : « Ich habe Angst, dass wir uns dann streiten. » Jana a un nouveau copain depuis trois mois. Tom : « Mir ist das … auch passiert. » « Mama_von_drei » : « Das geht meistens von selbst vorbei. »'),
        fill('q4', bi('Ergänzen Sie das Wort aus Leonies Beitrag.', 'Complétez avec le mot du message de Leonie.'),
          'Leonie weiß nicht, ob sie mit Jana [[1]] sprechen soll.', [['darüber']],
          'sprechen über + accusatif. Darüber reprend la chose dont il est question : la déception de Leonie et l’attitude de Jana. Pour une personne, on dirait « über sie ».'),
        dictation('q5', 'Nach unserem Streit haben wir uns zum Glück schnell wieder versöhnt.',
          'sich versöhnen : pronom réfléchi uns juste après le sujet dans la principale inversée. « Streit » prend une majuscule (nom) ; « zum Glück » : heureusement.', 'frau3'),
        dictation('q6', 'Auf eine gute Freundin kann man sich immer verlassen.',
          'sich verlassen auf + accusatif : « auf eine gute Freundin » en tête de phrase, puis le verbe kann en 2e position. Majuscule à Freundin ; deux s dans « verlassen ».', 'sprecher'),
      ] },

    // 10 · Vérifier
    { id: 'b1-beziehungen-kontrolle', kind: 'exercise', title: 'Vérifier : relations et sentiments', estimatedMinutes: 12,
      competences: ['lecture', 'ecoute'],
      lesson: { description: `${bi('Hier prüfen Sie, was Sie in diesem Modul gelernt haben: Hören, Grammatik und Wortschatz.', 'Vérifiez ici ce que vous avez appris dans ce module : écoute, grammaire et vocabulaire.')}
${bi('Hören Sie zuerst, was Jakob über seine Schwester erzählt. Sie brauchen es für die Fragen 1 bis 3.', 'Écoutez d’abord ce que Jakob raconte sur sa sœur : cela sert pour les questions 1 à 3.')}` },
      placements: [{ media: 'b1-beziehungen-kontrolle-audio', transcriptVisibility: 'after_answer' }],
      questions: [
        choice('q1', bi('Worüber haben sich Jakob und Mia früher gestritten?', 'À propos de quoi Jakob et Mia se disputaient-ils autrefois ?'),
          [['über kleine Dinge im Alltag', true], ['über Politik und Geld'], ['über ihre Freunde']],
          '« meistens über ganz kleine Dinge: das Badezimmer, die Fernbedienung, die laute Musik ». La politique est le sujet sur lequel ils se disputent encore aujourd’hui, et l’argent n’est pas cité.'),
        choice('q2', bi('Wie ist die Beziehung heute?', 'Comment est leur relation aujourd’hui ?'),
          [['Sie sprechen kaum noch miteinander, nur an Geburtstagen.'], ['Sie verstehen sich gut und telefonieren regelmäßig.', true], ['Sie wohnen wieder zusammen in derselben Wohnung.']],
          '« Heute verstehen wir uns super. Wir telefonieren jeden Sonntag. » Mia a quitté la maison à dix-huit ans et rien n’indique qu’ils vivent de nouveau ensemble.'),
        fill('q3', bi('Ergänzen Sie die Sätze nach Jakobs Bericht.', 'Complétez les phrases d’après le récit de Jakob.'),
          'Wenn Jakob ein Problem hat, fragt er zuerst Mia um [[1]]. Über Politik sprechen sie nicht so gern, denn [[2]] streiten sie sich immer noch.',
          [['Rat'], ['darüber']],
          'jemanden um Rat fragen : demander conseil à quelqu’un. Darüber reprend « Politik », une chose déjà nommée : da(r)- + über, car on dit sich streiten über.'),
        choice('q4', bi('„Ich interessiere mich sehr für Fotografie.“ Ergänzen Sie die Frage: „… interessierst du dich?“', '« Je m’intéresse beaucoup à la photographie. » Complétez la question : « À quoi t’intéresses-tu ? »'),
          [['Für wen'], ['Wovon'], ['Wofür', true]],
          'sich interessieren für + accusatif ; la photographie est une chose, donc wo- + für : Wofür? « Für wen » interroge sur une personne, et « wovon » ne correspond pas à la préposition du verbe.'),
        order('q5', C.ordnen,
          [['Ich', 'habe', 'mich', 'darüber', 'geärgert,', 'dass', 'du', 'nicht', 'angerufen', 'hast.']],
          'Principale au Perfekt : habe … geärgert, avec le pronom réfléchi juste après l’auxiliaire. darüber annonce la subordonnée en dass, dont le verbe conjugué hast va à la fin.'),
        choice('q6', bi('Welcher Satz ist richtig?', 'Quelle phrase est correcte ?'),
          [['Ich mache mich Sorgen um dich.'], ['Ich mache mir Sorgen um dich.', true], ['Ich mache mir Sorgen für dich.']],
          'sich Sorgen machen : Sorgen est déjà à l’accusatif, donc le pronom réfléchi est au datif (mir). La préposition est um : sich Sorgen um jemanden machen.'),
        choice('q7', bi('Sie haben endlich mit Ihrer Freundin gesprochen, und alles ist wieder gut. Wie fühlen Sie sich?', 'Vous avez enfin parlé avec votre amie, et tout va de nouveau bien. Comment vous sentez-vous ?'),
          [['eifersüchtig'], ['beleidigt'], ['erleichtert', true]],
          'erleichtert : soulagé, quand une inquiétude disparaît. beleidigt (vexé) et eifersüchtig (jaloux) décrivent des sentiments négatifs qui ne correspondent pas à une réconciliation.'),
      ] },
  ],
};
