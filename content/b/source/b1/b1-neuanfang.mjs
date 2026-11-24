// Module B1 n° 1 · thème « Neuanfang » (lot R1). Raconter un nouveau départ : récit écrit au Präteritum, récit oral au
// Perfekt, antériorité avec nachdem (Plusquamperfekt), als (fait unique) ou wenn (fait répété).
// Reprise réécrite du brouillon B1 V1 : portrait de Selin (documents A et B), dialogue Aylin / Tobias, quiz et leçon
// « vergangenheit » de b1-einstieg (content/b1-v1/source/partie1.mjs).
import { C, bi, choice, fill, order, match, dictation, speak } from '../../lib.mjs';

/** « Richtig / falsch / steht nicht im Text » : r, f ou n pour la bonne réponse. */
const rf = (id, statement, answer, explanation) => choice(id, `${statement} ${C.richtigFalsch}`,
  [['richtig', answer === 'r'], ['falsch', answer === 'f'], ['steht nicht im Text', answer === 'n']], explanation);

export default {
  id: 'b1-neuanfang',
  title: 'Neuanfang : raconter un nouveau départ',
  objective: 'Raconter dans l’ordre une étape de sa vie (déménagement, nouveau travail), situer les moments avec als, wenn, nachdem et seitdem, et réagir au récit de quelqu’un.',
  grammarFocus: ['praeteritum-perfekt', 'plusquamperfekt-nachdem', 'als-wenn'],
  sources: [
    'Textes, dialogues et exercices originaux LinguaCap.',
    'Situations reprises et réécrites du brouillon B1 V1 (LinguaCap) : portrait de Selin, dialogue d’Aylin et Tobias.',
  ],

  vocabulary: [
    { word: 'Umzug', article: 'der', plural: 'Umzüge', partOfSpeech: 'noun', translation: 'le déménagement',
      example: 'Nach dem Umzug kannte ich in Leipzig fast niemanden.', note: null },
    { word: 'umziehen', partOfSpeech: 'verb', translation: 'déménager',
      example: 'Im Mai wollen wir nach Leipzig umziehen.', note: 'séparable : um|ziehen · Perfekt avec sein : ist umgezogen' },
    { word: 'Neuanfang', article: 'der', plural: 'Neuanfänge', partOfSpeech: 'noun', translation: 'le nouveau départ',
      example: 'Der Neuanfang war nicht leicht, aber spannend.', note: null },
    { word: 'Wendepunkt', article: 'der', plural: 'Wendepunkte', partOfSpeech: 'noun', translation: 'le tournant',
      example: 'Der Lauftreff war ein Wendepunkt in meinem ersten Jahr.', note: null },
    { word: 'Herausforderung', article: 'die', plural: 'Herausforderungen', partOfSpeech: 'noun', translation: 'le défi',
      example: 'Die Sprache war für mich die größte Herausforderung.', note: null },
    { word: 'Erfahrung', article: 'die', plural: 'Erfahrungen', partOfSpeech: 'noun', translation: 'l’expérience',
      example: 'Das war eine wichtige Erfahrung für mich.', note: 'Erfahrungen sammeln : acquérir de l’expérience' },
    { word: 'Stelle', article: 'die', plural: 'Stellen', partOfSpeech: 'noun', translation: 'le poste, l’emploi',
      example: 'Meine Firma hat mir in Hamburg eine Stelle angeboten.', note: null },
    { word: 'Gegend', article: 'die', plural: 'Gegenden', partOfSpeech: 'noun', translation: 'le coin, le quartier, la région',
      example: 'Ich kenne die Gegend noch nicht gut.', note: null },
    { word: 'sich eingewöhnen', partOfSpeech: 'verb', translation: 'prendre ses marques, s’acclimater',
      example: 'Ich habe mich schnell in der neuen Stadt eingewöhnt.', note: 'séparable : ein|gewöhnen · sich in + datif eingewöhnen' },
    { word: 'sich gewöhnen', partOfSpeech: 'verb', translation: 's’habituer',
      example: 'Langsam habe ich mich an das Wetter gewöhnt.', note: 'sich an + accusatif gewöhnen' },
    { word: 'sich zurechtfinden', partOfSpeech: 'verb', translation: 's’y retrouver, se repérer',
      example: 'Am Anfang fand ich mich in der Universität kaum zurecht.', note: 'séparable : zurecht|finden' },
    { word: 'Anschluss finden', partOfSpeech: 'expression', translation: 'se faire des contacts, trouver sa place',
      example: 'Im Lauftreff habe ich schnell Anschluss gefunden.', note: null },
    { word: 'Heimweh haben', partOfSpeech: 'expression', translation: 'avoir le mal du pays',
      example: 'In den ersten Wochen hatte ich oft Heimweh.', note: null },
    { word: 'eine Entscheidung treffen', partOfSpeech: 'expression', translation: 'prendre une décision',
      example: 'Nach zwei Wochen habe ich eine Entscheidung getroffen.', note: 'treffen, traf, hat getroffen' },
    { word: 'vermissen', partOfSpeech: 'verb', translation: 'regretter l’absence de (… me manque)',
      example: 'Ich vermisse meine Familie.', note: 'Ich vermisse dich = tu me manques (sujet inversé)' },
    { word: 'kündigen', partOfSpeech: 'verb', translation: 'démissionner, résilier',
      example: 'Im März kündigte ich meine Stelle.', note: 'die Stelle / die Wohnung kündigen' },
    { word: 'ankommen', partOfSpeech: 'verb', translation: 'arriver',
      example: 'Unser Zug soll um acht Uhr in Leipzig ankommen.', note: 'séparable : an|kommen · ist angekommen' },
    { word: 'sich verändern', partOfSpeech: 'verb', translation: 'changer, évoluer',
      example: 'Seit dem Umzug hat sich viel verändert.', note: null },
    { word: 'sich anmelden', partOfSpeech: 'verb', translation: 's’inscrire',
      example: 'Ich möchte mich für den Lauftreff anmelden.', note: 'séparable : an|melden · sich für + accusatif / bei + datif' },
    { word: 'damals', partOfSpeech: 'adverb', translation: 'à l’époque',
      example: 'Damals hatte ich noch keine Wohnung.', note: null },
    { word: 'seitdem', partOfSpeech: 'adverb', translation: 'depuis (ce moment-là)',
      example: 'Seitdem gehe ich jede Woche zum Lauftreff.', note: 'adverbe : verbe juste après (Seitdem gehe ich …)' },
    { word: 'nachdem', partOfSpeech: 'conjunction', translation: 'après que',
      example: 'Nachdem ich die Wohnung gefunden hatte, war alles leichter.', note: '+ Plusquamperfekt si la principale est au passé ; verbe final' },
    { word: 'als', partOfSpeech: 'conjunction', translation: 'quand, lorsque (une fois, au passé)',
      example: 'Als ich ankam, kannte ich niemanden.', note: 'fait unique au passé ; wenn = chaque fois' },
    { word: 'unsicher', partOfSpeech: 'adjective', translation: 'pas sûr de soi, hésitant',
      example: 'Beim ersten Treffen war ich ziemlich unsicher.', note: 'contraire : selbstsicher' },
  ],

  media: [
    { key: 'b1-neuanfang-hoeren-audio', kind: 'audio', title: 'Avant le cours : Aylin et Tobias font connaissance',
      script: [
        { voice: 'mann2', name: 'Tobias', text: 'Entschuldigung, ist das hier der Raum für den Deutschkurs am Donnerstagabend?' },
        { pause: 0.5 },
        { voice: 'frau2', name: 'Aylin', text: 'Ja, ich glaube schon. Ich warte auch, aber die Tür ist noch zu. Ich bin übrigens Aylin.' },
        { pause: 0.5 },
        { voice: 'mann2', name: 'Tobias', text: 'Freut mich, ich heiße Tobias. Bist du auch neu in der Stadt? Ich habe dich hier noch nie gesehen.' },
        { pause: 0.5 },
        { voice: 'frau2', name: 'Aylin', text: 'Ganz neu! Ich bin erst vor drei Wochen hierhergezogen. Vorher habe ich fast zehn Jahre in Marseille gewohnt.' },
        { pause: 0.5 },
        { voice: 'mann2', name: 'Tobias', text: 'Oh, das ist ja ein großer Schritt. Warum bist du umgezogen? Wegen der Arbeit?' },
        { pause: 0.5 },
        { voice: 'frau2', name: 'Aylin', text: 'Ja, genau. Meine Firma hat hier ein neues Büro eröffnet, und man hat mir dort eine Stelle angeboten. Ich habe zwei Wochen lang überlegt, dann habe ich zugesagt. Das war keine leichte Entscheidung.' },
        { pause: 0.5 },
        { voice: 'mann2', name: 'Tobias', text: 'Das glaube ich dir. Und wie geht es dir bis jetzt?' },
        { pause: 0.5 },
        { voice: 'frau2', name: 'Aylin', text: 'Gemischt. Die Arbeit gefällt mir, aber ich kenne noch fast niemanden. Als ich am ersten Sonntag allein durch die Stadt gelaufen bin, hatte ich richtig Heimweh.' },
        { pause: 0.5 },
        { voice: 'mann2', name: 'Tobias', text: 'Das kenne ich gut. Ich bin vor zwei Jahren aus Polen gekommen, und am Anfang war es bei mir genauso.' },
        { pause: 0.4 },
        { voice: 'frau2', name: 'Aylin', text: 'Und was hat dir geholfen?' },
        { pause: 0.5 },
        { voice: 'mann2', name: 'Tobias', text: 'Ehrlich gesagt: ein Fußballverein. Nachdem ich mich dort angemeldet hatte, war ich jeden Mittwoch mit anderen Leuten zusammen. Und wenn wir nach dem Training zusammen gegessen haben, musste ich Deutsch sprechen, auch mit vielen Fehlern.' },
        { pause: 0.5 },
        { voice: 'frau2', name: 'Aylin', text: 'Gute Idee. In Marseille habe ich früher Volleyball gespielt. Vielleicht suche ich mir hier auch einen Verein.' },
        { pause: 0.5 },
        { voice: 'mann2', name: 'Tobias', text: 'Mach das unbedingt! Und hast du schon eine Wohnung gefunden?' },
        { pause: 0.5 },
        { voice: 'frau2', name: 'Aylin', text: 'Noch nicht. Im Moment wohne ich in einem möblierten Zimmer, aber nur bis Ende März. Am Samstag habe ich zwei Besichtigungen.' },
        { pause: 0.5 },
        { voice: 'mann2', name: 'Tobias', text: 'Dann drücke ich dir die Daumen! Wenn du willst, gebe ich dir nach dem Kurs ein paar Tipps für die Wohnungssuche.' },
        { pause: 0.8 },
        { voice: 'sprecherin', name: 'Frau Brandt', text: 'Guten Abend zusammen! Entschuldigen Sie bitte die Verspätung. Ich bin Frau Brandt, Ihre Kursleiterin. Kommen Sie herein, wir fangen gleich an. Heute erzählt jeder zuerst kurz, wie er hierhergekommen ist.' },
        { pause: 0.5 },
        { voice: 'frau2', name: 'Aylin', text: 'Na, dann haben wir ja schon geübt!' },
      ] },
    { key: 'b1-neuanfang-regel-zeitstrahl', kind: 'image', title: 'Frise : avant, pendant, après',
      alt: 'Frise chronologique en quatre étapes : « Ich hatte gekündigt » (Plusquamperfekt), « Ich zog nach Leipzig » (Präteritum), « Ich habe Anschluss gefunden » (Perfekt), « Heute bin ich zu Hause » (Präsens).',
      image: { layout: 'route', variant: 'timeline', title: 'Vorher, dann, danach, heute', stepWidth: 190,
        steps: [
          { icon: 'briefcase', label: 'Plusquamperfekt', sub: 'Ich hatte\ngekündigt.' },
          { icon: 'luggage', label: 'Präteritum', sub: 'Ich zog\nnach Leipzig.' },
          { icon: 'users', label: 'Perfekt', sub: 'Ich habe Anschluss\ngefunden.' },
          { icon: 'home', label: 'Präsens', sub: 'Heute bin ich\nzu Hause.' },
        ],
        note: 'Nachdem ich gekündigt hatte, zog ich um.', noteIcon: 'info' } },
    { key: 'b1-neuanfang-hoeren2-audio', kind: 'audio', title: 'Message vocal de Mira après sa première semaine',
      script: [
        { voice: 'frau3', name: 'Mira', text: 'Hallo Jana, hier ist Mira! Tut mir leid, dass ich mich erst jetzt melde, aber die erste Woche in Hamburg war total voll. Also, ich erzähle dir kurz alles.' },
        { pause: 0.4 },
        { voice: 'frau3', name: 'Mira', text: 'Am Montag war ich schon um halb acht im Büro, weil ich so nervös war. Natürlich war noch niemand da! Als meine Chefin dann kam, hat sie mir das ganze Team vorgestellt. Das sind zwölf Leute, und ich habe mir keinen einzigen Namen gemerkt.' },
        { pause: 0.4 },
        { voice: 'frau3', name: 'Mira', text: 'Am Dienstag und am Mittwoch hatte ich Schulungen. Das war ziemlich anstrengend, aber auch interessant. Und am Donnerstag ist etwas Lustiges passiert: Nachdem ich einen Kollegen den ganzen Tag gesiezt hatte, erklärte er mir, dass sich hier alle duzen. Ich war so rot im Gesicht!' },
        { pause: 0.4 },
        { voice: 'frau3', name: 'Mira', text: 'Wenn ich abends nach Hause gekommen bin, war ich so müde, dass ich nur noch Nudeln gekocht habe. Mein Zimmer in der WG ist klein, aber hell, und meine Mitbewohnerin ist super nett. Am Wochenende zeigt sie mir die Stadt.' },
        { pause: 0.4 },
        { voice: 'frau3', name: 'Mira', text: 'Ach ja, du wolltest doch im Mai kommen, oder? Ruf mich mal an, dann planen wir das zusammen. Bis bald, tschüss!' },
      ] },
    { key: 'b1-neuanfang-kontrolle-audio', kind: 'audio', title: 'Karim raconte son arrivée à Vienne',
      script: [
        { voice: 'mann3', name: 'Karim', text: 'Ich heiße Karim. Als ich vor fünf Jahren nach Wien kam, sprach ich kaum Deutsch. Ich hatte in Tunis Informatik studiert, aber hier fand ich zuerst keine Stelle.' },
        { pause: 0.4 },
        { voice: 'mann3', name: 'Karim', text: 'Deshalb arbeitete ich ein Jahr lang in einer Bäckerei. Wenn ich frühmorgens Brötchen verkaufte, übte ich mit den Kunden Deutsch.' },
        { pause: 0.4 },
        { voice: 'mann3', name: 'Karim', text: 'Nachdem ich meine Deutschprüfung bestanden hatte, bewarb ich mich wieder als Programmierer. Seit drei Jahren arbeite ich jetzt in einer kleinen IT-Firma. Die Zeit in der Bäckerei vermisse ich trotzdem manchmal.' },
      ] },
  ],

  activities: [
    // 1 · Mise en route
    { id: 'b1-neuanfang-einstieg', kind: 'lesson', title: 'Mise en route : un nouveau départ', estimatedMinutes: 10,
      competences: ['lecture', 'expression-orale'],
      lesson: { description: `EIN NEUANFANG
[fr] Un nouveau départ
${bi('Eine neue Stadt, eine neue Arbeit, neue Menschen: Ein Neuanfang ist spannend, aber nicht immer leicht.', 'Une nouvelle ville, un nouveau travail, de nouvelles personnes : un nouveau départ est passionnant, mais pas toujours facile.')}

FRAGEN ZUM EINSTIEG
[fr] Questions pour commencer
• ${bi('Wann haben Sie zum letzten Mal etwas ganz Neues angefangen?', 'Quand avez-vous commencé pour la dernière fois quelque chose de tout nouveau ?')}
• ${bi('Was war am Anfang schwierig, was war schön?', 'Qu’est-ce qui était difficile au début, qu’est-ce qui était agréable ?')}
• ${bi('Wer oder was hat Ihnen geholfen, sich einzugewöhnen?', 'Qui ou qu’est-ce qui vous a aidé à prendre vos marques ?')}
${bi('Antworten Sie in Gedanken auf Deutsch, in zwei oder drei einfachen Sätzen.', 'Répondez mentalement en allemand, en deux ou trois phrases simples.')}

ZIELE
[fr] Objectifs
• ${bi('Ich kann eine wichtige Etappe in meinem Leben der Reihe nach erzählen.', 'Je peux raconter dans l’ordre une étape importante de ma vie.')}
• ${bi('Ich kann sagen, wann etwas passiert ist: als, nachdem, seitdem.', 'Je peux situer les moments d’un récit : als, nachdem, seitdem.')}
• ${bi('Ich kann einen Blog und ein Gespräch über einen Neuanfang verstehen.', 'Je peux comprendre un blog et une conversation sur un nouveau départ.')}
• ${bi('Ich kann auf die Geschichte von anderen reagieren und nachfragen.', 'Je peux réagir au récit de quelqu’un et poser des questions.')}

WICHTIGE WÖRTER
[fr] Mots-clés
• der Umzug — le déménagement
• umziehen — déménager
• sich eingewöhnen — prendre ses marques
• Heimweh haben — avoir le mal du pays
• Anschluss finden — se faire des contacts
• sich zurechtfinden — s’y retrouver
• die Herausforderung — le défi
• der Wendepunkt — le tournant` } },

    // 2 · Lecture longue avec stratégie
    { id: 'b1-neuanfang-lesen', kind: 'exercise', title: 'Comprendre : le blog de Selin, un an à Leipzig', estimatedMinutes: 20,
      competences: ['lecture'],
      lesson: { description: `${C.lesen}

STRATEGIE
[fr] Stratégie
${bi('Lesen Sie zuerst nur den Titel und den ersten Satz von jedem Absatz. Worum geht es?', 'Lisez d’abord seulement le titre et la première phrase de chaque paragraphe. De quoi s’agit-il ?')}
${bi('Lesen Sie dann den ganzen Text genau. Suchen Sie für jede Aussage die passende Stelle im Text.', 'Lisez ensuite tout le texte en détail. Pour chaque affirmation, cherchez le passage qui correspond.')}
${bi('„Steht nicht im Text“ bedeutet: Der Text sagt dazu nichts.', '« Non mentionné » signifie : le texte n’en dit rien.')}

MEIN ERSTES JAHR IN LEIPZIG
Ein Blogbeitrag von Selin, 29

(1) Vor genau einem Jahr stand ich mit zwei Koffern am Leipziger Hauptbahnhof. Es regnete, es war kalt, und ich kannte in der ganzen Stadt nur meine Cousine Derya. Vorher hatte ich sechs Jahre lang in einem kleinen Hotel in Izmir an der Rezeption gearbeitet. Die Arbeit gefiel mir, aber ich wollte schon lange in Deutschland studieren. Als die Zusage von der Universität kam, zögerte ich keinen Moment: Ich kündigte meine Stelle und buchte den Flug.

(2) Die ersten Wochen waren schwieriger, als ich gedacht hatte. In der großen Universität fand ich mich kaum zurecht, und in den Seminaren sprachen alle sehr schnell. Wenn ich abends allein in meinem Zimmer saß, hatte ich oft Heimweh. Dann rief ich meine Mutter an oder schrieb meinen Freundinnen lange Nachrichten. Am meisten vermisste ich das Meer und unser gemeinsames Frühstück am Sonntag.

(3) Im November kam der Wendepunkt. Eine Kommilitonin erzählte mir von einem Lauftreff im Park. Nachdem ich mich dort angemeldet hatte, lief ich jeden Dienstag mit zehn anderen Leuten durch den Park. Beim ersten Treffen war ich sehr nervös und sagte fast nichts. Aber nach dem Training gingen wir zusammen etwas trinken, und eine Läuferin fragte mich nach meinem Studium. So fand ich langsam Anschluss. Seitdem treffe ich zwei Leute aus der Gruppe auch am Wochenende.

(4) Heute fühle ich mich in Leipzig fast zu Hause. Natürlich vermisse ich meine Familie noch, aber ich habe mich an das neue Leben gewöhnt, sogar an das Wetter. Mein Tipp für alle, die neu in einer Stadt sind: Wartet nicht, bis euch jemand anspricht. Sucht euch eine Gruppe, die zu euch passt, zum Beispiel einen Sportverein, einen Chor oder ein Sprachcafé. Die ersten Treffen sind immer ein bisschen komisch, aber es lohnt sich!` },
      questions: [
        choice('q1', bi('Worum geht es in dem Blogbeitrag vor allem?', 'De quoi parle surtout ce billet de blog ?'),
          [['um Selins Arbeit in einem Hotel in Izmir'], ['um Selins erstes Jahr in einer neuen Stadt', true], ['um einen Lauftreff, der neue Mitglieder sucht']],
          'Les quatre paragraphes suivent l’année de Selin à Leipzig, de l’arrivée (« Vor genau einem Jahr ») à aujourd’hui (« Heute »). L’hôtel n’est que le point de départ du paragraphe 1, et le Lauftreff un épisode du paragraphe 3.'),
        choice('q2', bi('Wie hat sich Selins Situation im Laufe des Jahres verändert?', 'Comment la situation de Selin a-t-elle évolué au cours de l’année ?'),
          [['Am Anfang war sie begeistert, heute möchte sie zurück nach Izmir.'], ['Sie hat sich von Anfang an in Leipzig zu Hause gefühlt.'],
            ['Am Anfang fühlte sie sich fremd, heute fühlt sie sich fast zu Hause.', true]],
          'Le paragraphe 2 décrit des débuts difficiles (« kaum zurecht », « oft Heimweh ») et le paragraphe 4 conclut : « Heute fühle ich mich in Leipzig fast zu Hause ». Elle ne veut pas repartir : elle conseille au contraire aux nouveaux venus de chercher un groupe.'),
        rf('q3', 'Selin hatte vor ihrem Umzug in einem Hotel gearbeitet.', 'r',
          'Paragraphe 1 : « Vorher hatte ich sechs Jahre lang in einem kleinen Hotel … gearbeitet ». Le Plusquamperfekt (hatte gearbeitet) situe ce travail avant le départ pour Leipzig.'),
        rf('q4', 'An der Universität fand Selin schnell neue Freunde.', 'f',
          'C’est faux : à l’université, elle « fand sich kaum zurecht » et passait ses soirées seule. Elle a trouvé des contacts plus tard, en novembre, grâce au Lauftreff.'),
        rf('q5', 'Selin besucht ihre Cousine jede Woche.', 'n',
          'Le texte dit seulement qu’à son arrivée, Selin ne connaissait que sa cousine Derya. Il ne dit rien de visites régulières : non mentionné. « Falsch » supposerait que le texte dise le contraire.'),
        rf('q6', 'Derya hat Selin den Lauftreff empfohlen.', 'f',
          'Faux : « Eine Kommilitonin erzählte mir von einem Lauftreff ». C’est une camarade d’études (die Kommilitonin), pas la cousine Derya. Piège classique : le nom de Derya apparaît, mais au paragraphe 1.'),
        match('q7', bi('Welche Überschrift passt zu welchem Absatz? Ordnen Sie zu.', 'Quel intertitre convient à quel paragraphe ? Associez.'),
          [['Absatz 1', 'Eine schnelle Entscheidung'], ['Absatz 2', 'Allein in der neuen Stadt'], ['Absatz 3', 'Endlich neue Kontakte'], ['Absatz 4', 'Ein Rat für Neue']],
          'Paragraphe 1 : la décision prise sans hésiter (« zögerte ich keinen Moment »). Paragraphe 2 : la solitude des débuts (Heimweh). Paragraphe 3 : le Lauftreff et les premiers contacts (Anschluss). Paragraphe 4 : le conseil aux nouveaux venus (« Mein Tipp für alle … »).'),
        fill('q8', bi('Ergänzen Sie die Wörter aus dem Text.', 'Complétez avec les mots du texte.'),
          'Abends hatte Selin oft [[1]]. Im November fand sie beim Lauftreff langsam [[2]].', [['Heimweh'], ['Anschluss']],
          '« Heimweh haben » : avoir le mal du pays (paragraphe 2). « Anschluss finden » : se faire des contacts, trouver sa place dans un groupe (paragraphe 3). Les deux sont des noms : majuscule.'),
      ] },

    // 3 · Écoute longue : prise de notes puis questions
    { id: 'b1-neuanfang-hoeren', kind: 'exercise', title: 'Comprendre : deux nouveaux avant le cours', estimatedMinutes: 18,
      competences: ['ecoute'],
      lesson: { description: `${C.hoeren}

${bi('Situation: Vor dem ersten Abend im Deutschkurs warten Aylin und Tobias vor dem Kursraum.', 'Situation : avant la première soirée du cours d’allemand, Aylin et Tobias attendent devant la salle.')}

STRATEGIE
[fr] Stratégie
${bi('Beim ersten Hören: Wer spricht? Wo sind die Personen? Wie ist die Stimmung?', 'Première écoute : qui parle ? où sont les personnes ? quelle est l’ambiance ?')}
${bi('Beim zweiten Hören achten Sie nur auf Stichwörter, zum Beispiel Zahlen, Orte und Gründe.', 'À la deuxième écoute, concentrez-vous seulement sur des mots-clés, par exemple des nombres, des lieux et des raisons.')}
${bi('Die Transkription sehen Sie nach Ihren Antworten.', 'Vous verrez la transcription après vos réponses.')}` },
      placements: [{ media: 'b1-neuanfang-hoeren-audio', transcriptVisibility: 'after_answer' }],
      questions: [
        fill('q1', C.notizen,
          'Aylin wohnt seit [[1]] Wochen in der Stadt. Vorher hat sie in [[2]] gewohnt. Grund für den Umzug: eine neue [[3]]. Tobias hat Anschluss in einem [[4]] gefunden. Aylin kann bis Ende [[5]] in ihrem möblierten Zimmer bleiben.',
          [['drei', '3'], ['Marseille'], ['Stelle', 'Arbeit', 'Arbeitsstelle'], ['Fußballverein', 'Verein', 'Fußballklub', 'Fußballclub'], ['März']],
          'Aylin : « erst vor drei Wochen hierhergezogen », « fast zehn Jahre in Marseille », « man hat mir dort eine Stelle angeboten ». Tobias : « ein Fußballverein ». Le meublé : « nur bis Ende März ». Pour les notes, les chiffres suffisent : 3 vaut drei.'),
        choice('q2', bi('Wie hat Aylin die Entscheidung für den Umzug getroffen?', 'Comment Aylin a-t-elle pris la décision de déménager ?'),
          [['Sie hat sofort zugesagt.'], ['Ihre Firma hat für sie entschieden.'], ['Sie hat zwei Wochen lang überlegt.', true]],
          'Aylin dit : « Ich habe zwei Wochen lang überlegt, dann habe ich zugesagt. Das war keine leichte Entscheidung. » Elle n’a donc pas accepté tout de suite ; l’entreprise lui a proposé le poste, mais c’est elle qui a décidé.'),
        choice('q3', bi('Wann hatte Aylin besonders Heimweh?', 'Quand Aylin a-t-elle eu particulièrement le mal du pays ?'),
          [['an ihrem ersten Sonntag in der Stadt', true], ['jeden Abend, wenn sie allein von der Arbeit kam'], ['als sie ihre erste Wohnung besichtigt hat']],
          '« Als ich am ersten Sonntag allein durch die Stadt gelaufen bin, hatte ich richtig Heimweh. » Als marque un moment unique. Les visites d’appartements n’ont pas encore eu lieu : elles sont prévues samedi.'),
        choice('q4', bi('Was hat Tobias beim Deutschlernen besonders geholfen?', 'Qu’est-ce qui a surtout aidé Tobias à progresser en allemand ?'),
          [['ein Abendkurs an der Volkshochschule'], ['die Gespräche beim Essen nach dem Training', true], ['ein Tandem mit einer Kollegin']],
          'Tobias raconte : « wenn wir nach dem Training zusammen gegessen haben, musste ich Deutsch sprechen ». Wenn indique ici une habitude du passé (chaque fois que). Il ne parle ni d’un autre cours ni d’un tandem.'),
        choice('q5', bi('Was bietet Tobias Aylin am Ende an?', 'Que propose Tobias à Aylin à la fin ?'),
          [['einen Platz in seinem Fußballverein'], ['ein Zimmer in seiner Wohnung'], ['Tipps für die Wohnungssuche', true]],
          '« Wenn du willst, gebe ich dir nach dem Kurs ein paar Tipps für die Wohnungssuche. » Il lui conseille de chercher un club (« Mach das unbedingt! »), mais ne lui propose pas de place dans le sien.'),
      ] },

    // 4 · Grammaire inductive
    { id: 'b1-neuanfang-entdecken', kind: 'exercise', title: 'Découvrir : raconter le passé avec als, wenn et nachdem', estimatedMinutes: 10,
      competences: ['lecture'],
      lesson: { description: `${bi('Lesen Sie die Sätze aus dem Blog und aus dem Gespräch. Achten Sie auf die Verben und auf als, wenn und nachdem.', 'Lisez ces phrases du blog et de la conversation. Observez les verbes ainsi que als, wenn et nachdem.')}

(1) Als die Zusage von der Universität kam, zögerte ich keinen Moment.
(2) Als ich am ersten Sonntag allein durch die Stadt gelaufen bin, hatte ich richtig Heimweh.
(3) Wenn ich abends allein in meinem Zimmer saß, hatte ich oft Heimweh.
(4) Wenn wir nach dem Training zusammen gegessen haben, musste ich Deutsch sprechen.
(5) Vorher hatte ich sechs Jahre lang in einem kleinen Hotel gearbeitet.
(6) Nachdem ich mich dort angemeldet hatte, lief ich jeden Dienstag durch den Park.
(7) In der großen Universität fand ich mich kaum zurecht.

${bi('Beantworten Sie dann die Fragen. So finden Sie die Regel selbst.', 'Répondez ensuite aux questions : vous trouverez ainsi la règle vous-même.')}` },
      questions: [
        choice('q1', bi('Sätze (1) und (2): Wie oft ist das passiert?', 'Phrases (1) et (2) : combien de fois cela s’est-il passé ?'),
          [['nur einmal, in einem bestimmten Moment', true], ['oft, immer wieder, wie eine Gewohnheit'], ['jetzt, in der Gegenwart, nicht in der Vergangenheit']],
          'La réponse de l’université n’est arrivée qu’une fois, et le premier dimanche n’a eu lieu qu’une fois. Pour un fait unique (ou une période unique) du passé, on emploie als. Les phrases (3) et (4), elles, décrivent des habitudes.'),
        choice('q2', bi('Sätze (3) und (4): Was bedeutet „wenn“ hier?', 'Phrases (3) et (4) : que signifie « wenn » ici ?'),
          [['nur ein einziges Mal'], ['falls, vielleicht'], ['jedes Mal, wenn …', true]],
          'Les mots « abends » et « oft », puis la répétition des entraînements, montrent une habitude : wenn signifie ici « chaque fois que ». Au passé, wenn s’emploie seulement pour un fait répété ; pour un fait unique, c’est als.'),
        choice('q3', bi('Satz (6): Was ist zuerst passiert?', 'Phrase (6) : qu’est-ce qui s’est passé en premier ?'),
          [['Selin ist jeden Dienstag durch den Park gelaufen.'], ['Selin hat sich beim Lauftreff angemeldet.', true], ['Beides ist zur gleichen Zeit passiert.']],
          'Nachdem introduit l’action antérieure : d’abord l’inscription (hatte angemeldet, Plusquamperfekt), ensuite les courses du mardi (lief, Präteritum). Le Plusquamperfekt sert justement à marquer ce « passé du passé ».'),
        match('q4', bi('Ordnen Sie die Verbformen den Zeitformen zu.', 'Associez les formes verbales aux temps.'),
          [['kam, saß, fand', 'Präteritum'], ['bin … gelaufen, haben … gegessen', 'Perfekt'], ['hatte … gearbeitet, hatte … angemeldet', 'Plusquamperfekt']],
          'Präteritum : une seule forme, souvent avec changement de voyelle pour les verbes forts (kommen → kam, sitzen → saß, finden → fand). Perfekt : haben ou sein au présent + participe II. Plusquamperfekt : haben ou sein au Präteritum (hatte, war) + participe II.'),
      ] },

    // 5 · Règle
    { id: 'b1-neuanfang-regel', kind: 'lesson', title: 'Retenir : Präteritum, Plusquamperfekt, als ou wenn', estimatedMinutes: 8,
      competences: ['lecture'],
      lesson: { description: `À RETENIR
• Präteritum : le temps du récit écrit (blog, lettre, article). À l’oral, on l’emploie surtout pour sein, haben et les verbes de modalité : ich war, ich hatte, ich musste, ich wollte.
• Perfekt : le temps du récit oral et des messages : Ich bin umgezogen. Wir haben zusammen gegessen.
• Plusquamperfekt : une action antérieure à une autre action passée. hatte ou war + participe II : Ich hatte gekündigt. Sie war schon angekommen.

LES FORMES DU PRÄTERITUM
• Verbes faibles : radical + -te. ich kaufte, du kauftest, er kaufte, wir kauften, ihr kauftet, sie kauften.
• Verbes forts : changement de voyelle, sans -te ; ich et er n’ont pas de terminaison : ich kam, er kam, wir kamen.
• Verbes mixtes : changement de voyelle et -te : kennen, kannte ; denken, dachte ; bringen, brachte ; wissen, wusste.
• À apprendre : gehen, ging ; kommen, kam ; finden, fand ; stehen, stand ; sitzen, saß ; schreiben, schrieb ; bleiben, blieb ; ziehen, zog ; laufen, lief ; sprechen, sprach.

ALS, WENN, NACHDEM
• als : un fait unique ou une période unique du passé. Als ich in Leipzig ankam, regnete es. Als ich Kind war, wohnten wir in Lyon.
• wenn : « chaque fois que » au passé, ou « si, quand » au présent et au futur. Wenn ich Heimweh hatte, rief ich meine Mutter an.
• nachdem : « après que ». Si la principale est au passé, la subordonnée est au Plusquamperfekt. Nachdem ich mich angemeldet hatte, lief ich jeden Dienstag.
• Dans les trois cas, le verbe conjugué va à la fin de la subordonnée. Quand la subordonnée vient en premier, la principale commence par son verbe : Als ich ankam, kannte ich niemanden.

ATTENTION
• « quand » n’est pas toujours wann : wann sert seulement aux questions (Wann bist du angekommen?).
• Après nachdem, pas de Perfekt devant une principale au Präteritum : Nachdem ich gekündigt hatte, zog ich um.
• « J’habite ici depuis un an » se dit au présent : Ich wohne seit einem Jahr hier.
• umziehen, ankommen, laufen, gehen : Perfekt et Plusquamperfekt avec sein (ich bin umgezogen, ich war angekommen).` },
      placements: [{ media: 'b1-neuanfang-regel-zeitstrahl', caption: 'Plusquamperfekt, Präteritum, Perfekt, Präsens' }] },

    // 6 · S'entraîner : grammaire
    { id: 'b1-neuanfang-grammatik', kind: 'exercise', title: 'S’entraîner : Präteritum, Plusquamperfekt, als ou wenn', estimatedMinutes: 14,
      competences: ['lecture', 'expression-ecrite'],
      lesson: { description: `${bi('Üben Sie das Präteritum, das Plusquamperfekt und die Konjunktionen als, wenn und nachdem.', 'Entraînez-vous au Präteritum, au Plusquamperfekt et aux conjonctions als, wenn et nachdem.')}
${bi('Lesen Sie bei einem Fehler die Erklärung und schauen Sie noch einmal in die Regel.', 'En cas d’erreur, lisez l’explication et revoyez la règle.')}` },
      questions: [
        fill('q1', bi('Ergänzen Sie die Verben im Präteritum.', 'Complétez avec les verbes au Präteritum.'),
          'Vor einem Jahr [[1]] (ankommen) ich in Leipzig an. Ich [[2]] (kennen) nur meine Cousine. Die ersten Wochen [[3]] (sein) schwierig, und ich [[4]] (finden) mich kaum zurecht.',
          [['kam'], ['kannte'], ['waren'], ['fand']],
          'ankommen est fort et séparable : ich kam … an. kennen est mixte : kannte (voyelle changée et -te). sein : waren au pluriel (die Wochen). finden est fort : fand, sans terminaison à la 1re personne.'),
        fill('q2', bi('Ergänzen Sie „hatte“ oder „war“.', 'Complétez avec « hatte » ou « war ».'),
          'Nachdem ich die Wohnung gefunden [[1]], kaufte ich Möbel. Nachdem Aylin in der Stadt angekommen [[2]], suchte sie einen Verein.',
          [['hatte'], ['war']],
          'Le Plusquamperfekt garde l’auxiliaire du Perfekt, mis au Präteritum : ich habe gefunden → ich hatte gefunden ; sie ist angekommen → sie war angekommen (déplacement : sein). Le verbe conjugué ferme la subordonnée.'),
        choice('q3', bi('Welches Wort passt? „… ich ein Kind war, wohnten wir in Lyon.“', 'Quel mot convient ? « … j’étais enfant, nous habitions à Lyon. »'),
          [['Wenn'], ['Als', true], ['Wann']],
          'L’enfance est une période unique du passé : als. Wenn au passé exprimerait une répétition (« chaque fois que »), et wann ne s’emploie que pour poser une question.'),
        choice('q4', bi('Welches Wort passt? „Immer … ich Heimweh hatte, rief ich meine Schwester an.“', 'Quel mot convient ? « Chaque fois que j’avais le mal du pays, j’appelais ma sœur. »'),
          [['wann'], ['als'], ['wenn', true]],
          '« Immer » signale une habitude : immer wenn = chaque fois que. Als ne convient que pour un fait unique ; wann est réservé aux questions directes ou indirectes (Ich weiß nicht, wann …).'),
        order('q5', bi('Bilden Sie einen Satz. Beginnen Sie mit „Nachdem“.', 'Remettez les mots dans l’ordre en commençant par « Nachdem ».'),
          [['Nachdem', 'ich', 'mich', 'beim Lauftreff', 'angemeldet', 'hatte,', 'lief', 'ich', 'jeden Dienstag', 'durch den Park.']],
          'Dans la subordonnée, le sujet suit nachdem, le pronom réfléchi vient tôt (ich mich) et le verbe conjugué hatte ferme la proposition. La principale commence ensuite par son verbe : lief ich … Erreur fréquente : « nachdem ich hatte mich angemeldet ».'),
        fill('q6', bi('Ergänzen Sie die Verben im Präteritum.', 'Complétez avec les verbes au Präteritum.'),
          'In Izmir [[1]] (müssen) ich jeden Morgen um sechs aufstehen, und ich [[2]] (haben) kaum Freizeit. Deshalb [[3]] (wollen) ich etwas Neues.',
          [['musste'], ['hatte'], ['wollte']],
          'Verbes de modalité au Präteritum : pas d’Umlaut, terminaison -te : müssen → musste, wollen → wollte. haben → hatte. À la 1re et à la 3e personne du singulier, pas de -e ajouté : ich musste, er musste.'),
        choice('q7', bi('Welcher Satz ist richtig?', 'Quelle phrase est correcte ?'),
          [['Nachdem er gekündigt hat, zog er nach Wien.'], ['Nachdem er hatte gekündigt, zog er nach Wien.'], ['Nachdem er gekündigt hatte, zog er nach Wien.', true]],
          'La principale est au Präteritum (zog) : la subordonnée avec nachdem passe au Plusquamperfekt (hatte gekündigt), et le verbe conjugué hatte va à la fin. La première phrase mélange les temps, la deuxième place mal l’auxiliaire.'),
        match('q8', bi('Ordnen Sie den Infinitiv dem Präteritum zu.', 'Associez l’infinitif à sa forme de Präteritum.'),
          [['gehen', 'ging'], ['schreiben', 'schrieb'], ['ziehen', 'zog'], ['denken', 'dachte'], ['bleiben', 'blieb']],
          'Ces verbes forts changent de voyelle : gehen → ging, schreiben → schrieb, bleiben → blieb, ziehen → zog. denken est un verbe mixte : voyelle et consonne changent, et il prend -te (dachte). À apprendre avec le participe : gegangen, geschrieben, geblieben, gezogen, gedacht.'),
      ] },

    // 7 · Lexique : collocations, familles, Redemittel
    { id: 'b1-neuanfang-wortschatz', kind: 'exercise', title: 'S’entraîner : mots et formules pour raconter un nouveau départ', estimatedMinutes: 12,
      competences: ['lecture', 'expression-ecrite'],
      lesson: { description: `${bi('Lernen Sie Wörter zusammen: Nomen mit Verb, Wortfamilien und feste Formulierungen.', 'Apprenez les mots ensemble : nom et verbe, familles de mots et formules toutes faites.')}

REDEMITTEL
[fr] Formules utiles
• pour commencer : Alles fing damit an, dass … / Vor einem Jahr habe ich beschlossen, …
• pour enchaîner : Am Anfang … / Kurz danach … / Nachdem ich …, … / Seitdem …
• pour dire ce qui a changé : Das war ein echter Wendepunkt. / Seitdem hat sich viel verändert.
• pour réagir au récit de quelqu’un : Das kann ich gut verstehen. / Wie ging es dann weiter? / Was hat dir geholfen?` },
      questions: [
        match('q1', bi('Welches Verb passt zu welchem Nomen? Ordnen Sie zu.', 'Quel verbe va avec quel nom ? Associez.'),
          [['eine Entscheidung', 'treffen'], ['Erfahrungen', 'sammeln'], ['Heimweh', 'haben'], ['Anschluss', 'finden'], ['den Mietvertrag', 'kündigen']],
          'Ce sont des collocations figées : eine Entscheidung treffen (prendre une décision, et non « machen »), Erfahrungen sammeln (acquérir de l’expérience), Heimweh haben, Anschluss finden (se faire des contacts), den Mietvertrag kündigen (résilier le bail).'),
        fill('q2', bi('Bilden Sie das Nomen aus dem Verb.', 'Formez le nom à partir du verbe.'),
          'Der [[1]] (umziehen) war anstrengend. Die [[2]] (entscheiden) war nicht leicht. Das war eine wichtige [[3]] (erfahren). Seitdem gab es viele [[4]] (sich verändern).',
          [['Umzug'], ['Entscheidung'], ['Erfahrung'], ['Veränderungen']],
          'umziehen → der Umzug (nom masculin sans suffixe). entscheiden → die Entscheidung, erfahren → die Erfahrung, verändern → die Veränderung : le suffixe -ung donne un nom féminin. Après viele, il faut le pluriel : Veränderungen.'),
        choice('q3', bi('Sie möchten Ihre Geschichte beginnen. Welche Formulierung passt?', 'Vous voulez commencer votre récit. Quelle formule convient ?'),
          [['Zum Schluss möchte ich sagen, dass ich zufrieden bin.'], ['Alles fing damit an, dass ich eine neue Stelle bekam.', true], ['Ich bin der Meinung, dass Umzüge schwierig sind.']],
          '« Alles fing damit an, dass … » (tout a commencé quand …) ouvre un récit. « Zum Schluss » sert à conclure, et « Ich bin der Meinung, dass … » donne un avis, pas le début d’une histoire.'),
        choice('q4', bi('Ihre Kollegin erzählt von ihren schwierigen ersten Wochen. Wie reagieren Sie verständnisvoll?', 'Votre collègue raconte ses premières semaines difficiles. Comment réagissez-vous avec compréhension ?'),
          [['Das kann ich gut verstehen. Am Anfang ist alles neu.', true], ['Das stimmt doch nicht, so schwer war das sicher nicht.'], ['Da hast du aber Glück gehabt, dass alles so leicht war!']],
          '« Das kann ich gut verstehen » montre de l’empathie, et la suite justifie. « Das stimmt doch nicht » conteste son récit ; « Da hast du aber Glück gehabt … » (tu as eu de la chance) suppose que tout a été facile.'),
        choice('q5', bi('Welche Präposition passt? „Ich habe mich langsam … das kalte Wetter gewöhnt.“', 'Quelle préposition convient ? « Je me suis peu à peu habitué au froid. »'),
          [['an', true], ['auf'], ['über']],
          'sich gewöhnen se construit avec an + accusatif : sich an das Wetter gewöhnen. Le français « s’habituer à » pousse vers une autre préposition : apprenez le verbe avec sa préposition.'),
        fill('q6', bi('Ergänzen Sie das Verb: „Ma famille me manque.“', 'Complétez le verbe : « Ma famille me manque. »'),
          'Ich [[1]] meine Familie.', [['vermisse']],
          'vermissen inverse la construction française : en allemand, celui qui ressent le manque est le sujet. Ich vermisse meine Familie = ma famille me manque. On peut aussi dire « Meine Familie fehlt mir », avec fehlen + datif.'),
        choice('q7', bi('„Für mich war die Sprache die größte Herausforderung.“ Was bedeutet das?', '« Pour moi, la langue a été le plus grand défi. » Qu’est-ce que cela veut dire ?'),
          [['Die Sprache hat mir am meisten Spaß gemacht.'], ['Ich habe die Sprache sehr schnell gelernt.'], ['Die Sprache war für mich am schwierigsten.', true]],
          'die Herausforderung, c’est le défi : ce qui demande le plus d’efforts. La phrase ne dit donc ni que la langue était amusante ni qu’elle a été apprise vite.'),
      ] },

    // 8 · Répéter à voix haute : Redemittel
    { id: 'b1-neuanfang-redemittel', kind: 'exercise', title: 'Répéter à voix haute : raconter un tournant', estimatedMinutes: 9,
      competences: ['expression-orale'],
      lesson: { description: `${C.sprechen}
${bi('Achten Sie auf die Betonung: Das wichtigste Wort im Satz ist etwas lauter.', 'Faites attention à l’accent : le mot le plus important de la phrase est un peu plus appuyé.')}
${bi('Sprechen Sie in Wortgruppen, nicht Wort für Wort, und machen Sie beim Komma eine kleine Pause.', 'Parlez par groupes de mots, pas mot à mot, et marquez une petite pause à la virgule.')}` },
      questions: [
        speak('q1', 'Alles fing damit an, dass ich eine neue Stelle bekam.',
          'Formule pour commencer un récit. Petite pause après « an » ; dans « Stelle », le st se prononce [cht] en début de mot, et l’accent tombe sur « STEL-le ».'),
        speak('q2', 'Als ich ankam, kannte ich hier fast niemanden.',
          'Als + fait unique, puis la principale commence par le verbe (kannte). Accentuez « AN-kam » (verbe séparable : accent sur la particule) et « NIE-manden ».'),
        speak('q3', 'Am Anfang hatte ich oft Heimweh.',
          'Phrase courte et naturelle pour parler des débuts. Le h de « hatte » et de « Heimweh » s’entend : soufflez-le. « Heimweh » : accent sur « HEIM ».'),
        speak('q4', 'Nachdem ich mich eingewöhnt hatte, ging es mir viel besser.',
          'Plusquamperfekt avec nachdem, puis principale au Präteritum. Accent sur « EIN-gewöhnt » ; le ö se prononce lèvres arrondies, comme dans « peu ».'),
        speak('q5', 'Das war ein echter Wendepunkt in meinem Leben.',
          'Pour souligner un tournant. Le ch de « echter » est doux, comme un chuintement léger ; accent sur « WEN-de-punkt ».'),
        speak('q6', 'Wie ist es dir in den ersten Wochen ergangen?',
          'Question pour relancer quelqu’un sur ses débuts (es ist mir gut ergangen : cela s’est bien passé pour moi). Intonation descendante : c’est une question avec mot interrogatif.'),
      ] },

    // 9 · Second document : message vocal (écoute) et dictées
    { id: 'b1-neuanfang-hoeren2', kind: 'exercise', title: 'Comprendre : le message vocal de Mira', estimatedMinutes: 15,
      competences: ['ecoute', 'expression-ecrite'],
      lesson: { description: `${C.hoeren}

${bi('Situation: Mira ist für eine neue Stelle nach Hamburg gezogen. Nach der ersten Woche schickt sie ihrer Freundin Jana eine Sprachnachricht.', 'Situation : Mira a déménagé à Hambourg pour un nouveau poste. Après la première semaine, elle envoie un message vocal à son amie Jana.')}

STRATEGIE
[fr] Stratégie
${bi('Eine Sprachnachricht ist oft schnell und nicht geordnet. Achten Sie auf die Zeitangaben: am Montag, am Donnerstag, am Wochenende.', 'Un message vocal est souvent rapide et peu ordonné. Repérez les indications de temps : lundi, jeudi, le week-end.')}
${bi('Die zwei letzten Fragen sind Diktate. Schreiben Sie genau, mit Großbuchstaben und Kommas.', 'Les deux dernières questions sont des dictées. Écrivez exactement, avec les majuscules et les virgules.')}` },
      placements: [{ media: 'b1-neuanfang-hoeren2-audio', transcriptVisibility: 'after_answer' }],
      questions: [
        choice('q1', bi('Warum war Mira am Montag so früh im Büro?', 'Pourquoi Mira était-elle si tôt au bureau lundi ?'),
          [['Ihre Chefin wollte sie früh sehen.'], ['Sie war sehr nervös.', true], ['Sie musste eine Schulung vorbereiten.']],
          '« Am Montag war ich schon um halb acht im Büro, weil ich so nervös war. » Weil donne la raison. La cheffe arrive plus tard, et les formations n’ont lieu que mardi et mercredi.'),
        choice('q2', bi('Was ist am Donnerstag passiert?', 'Que s’est-il passé jeudi ?'),
          [['Mira hat erfahren, dass sich im Team alle duzen.', true], ['Mira hat die Namen aller Kollegen gelernt.'], ['Ein Kollege hat Mira zum Essen eingeladen.']],
          'Mira a vouvoyé un collègue toute la journée (gesiezt), puis il lui a expliqué « dass sich hier alle duzen » : ici, tout le monde se tutoie. Les noms, au contraire, elle ne les a pas retenus (« keinen einzigen Namen »).'),
        choice('q3', bi('Was erfahren wir über Miras Wohnung?', 'Qu’apprend-on sur le logement de Mira ?'),
          [['Sie sucht noch ein Zimmer.'], ['Sie wohnt allein in einer großen Wohnung.'], ['Sie wohnt in einer WG mit einer netten Mitbewohnerin.', true]],
          '« Mein Zimmer in der WG ist klein, aber hell, und meine Mitbewohnerin ist super nett. » Une WG (Wohngemeinschaft) est une colocation : elle n’est donc ni seule ni à la recherche d’un logement.'),
        choice('q4', bi('Worum bittet Mira ihre Freundin am Ende?', 'Que demande Mira à son amie à la fin ?'),
          [['Jana soll sie anrufen, damit sie den Besuch im Mai planen.', true], ['Jana soll schon am Wochenende nach Hamburg kommen.'], ['Jana soll ihr eine lange Nachricht schreiben.']],
          '« Ruf mich mal an, dann planen wir das zusammen » : Jana doit appeler pour organiser sa visite de mai. Le week-end, c’est la colocataire qui fera visiter la ville à Mira.'),
        dictation('q5', 'Als meine Chefin kam, hat sie mir das ganze Team vorgestellt.',
          'Als + fait unique ; le verbe kam ferme la subordonnée, puis la principale commence par l’auxiliaire hat. Majuscules : Chefin, Team. Virgule entre les deux propositions.', 'frau3'),
        dictation('q6', 'Wenn ich abends nach Hause kam, war ich sehr müde.',
          'Wenn au passé : une habitude (chaque soir). Attention à « nach Hause » (h majuscule : c’est un nom) et à la virgule avant la principale, qui commence par le verbe war.', 'sprecher'),
      ] },

    // 10 · Vérifier
    { id: 'b1-neuanfang-kontrolle', kind: 'exercise', title: 'Vérifier : raconter un nouveau départ', estimatedMinutes: 12,
      competences: ['lecture', 'ecoute'],
      lesson: { description: `${bi('Hier prüfen Sie, was Sie in diesem Modul gelernt haben: Hören, Grammatik und Wortschatz.', 'Vérifiez ici ce que vous avez appris dans ce module : écoute, grammaire et vocabulaire.')}
${bi('Hören Sie zuerst Karims Geschichte. Sie brauchen sie für die Fragen 1 bis 3.', 'Écoutez d’abord l’histoire de Karim : elle sert pour les questions 1 à 3.')}` },
      placements: [{ media: 'b1-neuanfang-kontrolle-audio', transcriptVisibility: 'after_answer' }],
      questions: [
        choice('q1', bi('Was machte Karim im ersten Jahr in Wien?', 'Que faisait Karim pendant sa première année à Vienne ?'),
          [['Er studierte Informatik.'], ['Er arbeitete als Programmierer.'], ['Er arbeitete in einer Bäckerei.', true]],
          '« Deshalb arbeitete ich ein Jahr lang in einer Bäckerei. » Il avait étudié l’informatique avant, à Tunis (hatte studiert : Plusquamperfekt), et il n’est redevenu programmeur qu’après son examen.'),
        choice('q2', bi('Wie übte Karim Deutsch?', 'Comment Karim s’entraînait-il en allemand ?'),
          [['im Gespräch mit den Kunden', true], ['in einem Abendkurs'], ['mit Kollegen in der IT-Firma']],
          '« Wenn ich frühmorgens Brötchen verkaufte, übte ich mit den Kunden Deutsch. » Wenn indique une habitude du passé : chaque matin. Il ne parle pas de cours, et la société informatique vient plus tard.'),
        fill('q3', bi('Ergänzen Sie den Satz aus Karims Geschichte.', 'Complétez la phrase de l’histoire de Karim.'),
          'Nachdem Karim seine Prüfung bestanden [[1]], [[2]] er sich wieder als Programmierer.', [['hatte'], ['bewarb']],
          'Nachdem + Plusquamperfekt (hatte bestanden), puis la principale au Präteritum. sich bewerben est fort : bewarb, beworben. La principale commence par le verbe parce que la subordonnée occupe la première place.'),
        choice('q4', bi('Welches Wort passt? „… ich letztes Jahr nach Graz kam, war alles neu für mich.“', 'Quel mot convient ? « Quand je suis arrivé à Graz l’an dernier, tout était nouveau pour moi. »'),
          [['Als', true], ['Wenn'], ['Wann']],
          'L’arrivée à Graz est un fait unique du passé (letztes Jahr) : als. Wenn indiquerait une répétition, et wann pose une question.'),
        order('q5', C.ordnen,
          [['Als', 'ich', 'in Leipzig', 'ankam,', 'kannte', 'ich', 'nur meine Cousine.'],
            ['Als', 'ich', 'ankam,', 'kannte', 'ich', 'in Leipzig', 'nur meine Cousine.']],
          'La subordonnée avec als commence la phrase : son verbe ankam va à la fin, devant la virgule. La principale commence par le verbe kannte, puis le sujet ich. « in Leipzig » peut aller dans la subordonnée ou dans la principale.'),
        choice('q6', bi('Welche Form passt? „Ich habe mich schnell an die neue Arbeit …“', 'Quelle forme convient ? « Je me suis vite habitué à mon nouveau travail. »'),
          [['gewohnt'], ['gewöhnt', true], ['gewöhnen']],
          'sich an etwas gewöhnen : participe gewöhnt (avec ö). gewohnt est le participe de wohnen (habiter) ou l’adjectif « habituel » ; gewöhnen est l’infinitif, impossible après « habe ».'),
        choice('q7', bi('Ihr Freund erzählt: „Nach dem Umzug hatte ich oft Heimweh.“ Was antworten Sie?', 'Votre ami raconte : « Après le déménagement, j’avais souvent le mal du pays. » Que répondez-vous ?'),
          [['Herzlichen Glückwunsch zum Umzug! Das klingt super.'], ['Schade, dass du keine Zeit hast. Vielleicht nächste Woche?'], ['Das verstehe ich gut. Wie ging es dann weiter?', true]],
          'On montre de la compréhension, puis on relance le récit avec « Wie ging es dann weiter? » (et ensuite ?). Les félicitations ignorent ce qu’il vient de dire, et la troisième réplique répond à autre chose.'),
      ] },
  ],
};
