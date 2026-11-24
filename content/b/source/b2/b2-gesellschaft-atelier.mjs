// Module B2 n° 20 · atelier « Gesellschaft » (lot R8, thème 10) : prendre part au débat démocratique. Modèle annoté
// (contribution à un forum et intervention dans une discussion), réagir à des arguments enregistrés, médiation (prendre
// des notes en réunion et rédiger un procès-verbal de résultats pour un membre absent), erreurs typiques, entraînement au
// format Lesen « commentaires d'opinion » (qui défend quelle opinion ?), deux missions sur grille B2 : contribution à un
// forum (wählen ab 16 ?) et discussion simulée (gagner des habitants à la politique locale).
// Textes, dialogues et exercices originaux LinguaCap (ville et personnages fictifs).
import { aide, C2, choice, fill, order, match, speakB2, GRIDS } from '../../lib.mjs';

/** Commentaire d'opinion : qui défend cette opinion ? Libellés de même longueur, dans l'ordre des commentaires. */
const AUTHORS = ['Bernd, 68', 'Selma, 34', 'Jonte, 17', 'Heike, 52'];
const who = (id, statement, answer, explanation) => choice(id, `„${statement}“ ${C2.wer}`,
  AUTHORS.map((author) => [author, author === answer]), explanation);

export default {
  id: 'b2-gesellschaft-atelier',
  title: 'Gesellschaft – Werkstatt: Stellung beziehen, protokollieren, mitdiskutieren',
  objective: 'Rédiger une contribution argumentée à un forum, réagir à des arguments dans une discussion, prendre des notes en réunion et en tirer un procès-verbal de résultats, repérer les opinions de plusieurs commentaires et défendre un point de vue dans une discussion simulée.',
  grammarFocus: [],
  sources: ['Textes, dialogues et exercices originaux LinguaCap (ville et personnages fictifs).'],

  vocabulary: [
    { word: 'Meiner Ansicht nach …', partOfSpeech: 'expression', translation: 'À mon avis…',
      example: 'Meiner Ansicht nach ist der Bürgerhaushalt eine gute Idee.', note: 'verbe juste après : Meiner Ansicht nach ist …' },
    { word: 'Ich bin davon überzeugt, dass …', partOfSpeech: 'expression', translation: 'Je suis convaincu(e) que…',
      example: 'Ich bin davon überzeugt, dass Beteiligung Vertrauen schafft.', note: 'verbe à la fin après dass' },
    { word: 'Dafür spricht, dass …', partOfSpeech: 'expression', translation: 'Ce qui plaide en faveur de cela, c’est que…',
      example: 'Dafür spricht vor allem, dass die Menschen direkt mitentscheiden.', note: 'contraire : Dagegen spricht, dass …' },
    { word: 'Es stimmt zwar, dass …, aber …', partOfSpeech: 'expression', translation: 'Certes…, mais…',
      example: 'Es stimmt zwar, dass das Verfahren Geld kostet, aber es lohnt sich.', note: 'concéder puis réfuter' },
    { word: 'Da ist etwas dran.', partOfSpeech: 'expression', translation: 'Il y a du vrai là-dedans.',
      example: 'Da ist etwas dran, aber man muss auch an die Kosten denken.', note: 'accord partiel, registre courant' },
    { word: 'zu bedenken geben', partOfSpeech: 'expression', translation: 'faire remarquer, objecter (poliment)',
      example: 'Ich gebe zu bedenken, dass nicht alle einen Computer haben.', note: 'séparable : Ich gebe zu bedenken, …' },
    { word: 'an etwas anknüpfen', partOfSpeech: 'verb', translation: 'rebondir sur, reprendre (une idée)',
      example: 'Ich möchte an das anknüpfen, was Sie eben gesagt haben.', note: '+ an (accusatif) · séparable : an|knüpfen' },
    { word: 'Wie wäre es, wenn …?', partOfSpeech: 'expression', translation: 'Et si… ? (proposition)',
      example: 'Wie wäre es, wenn wir mit einem Probejahr beginnen würden?', note: 'Konjunktiv II : proposition prudente' },
    { word: 'Alles in allem …', partOfSpeech: 'expression', translation: 'Somme toute…, Tout bien considéré…',
      example: 'Alles in allem halte ich den Vorschlag für einen Gewinn.', note: 'verbe juste après : Alles in allem halte ich …' },
    { word: 'plädieren für', partOfSpeech: 'verb', translation: 'plaider pour',
      example: 'Ich plädiere dafür, die Sitzungen online zu übertragen.', note: '+ accusatif · ich plädiere dafür, … zu …' },
    { word: 'Protokoll', article: 'das', plural: 'Protokolle', partOfSpeech: 'noun', translation: 'le procès-verbal, le compte rendu',
      example: 'Heute führt Liv das Protokoll.', note: 'das Protokoll führen : rédiger le procès-verbal' },
    { word: 'Tagesordnungspunkt', article: 'der', plural: 'Tagesordnungspunkte', partOfSpeech: 'noun', translation: 'le point de l’ordre du jour',
      example: 'Wir kommen zu Tagesordnungspunkt zwei.', note: 'abréviation : TOP · die Tagesordnung : l’ordre du jour' },
    { word: 'einen Beschluss fassen', partOfSpeech: 'expression', translation: 'prendre une décision (en assemblée)',
      example: 'Der Quartiersrat hat einen Beschluss gefasst.', note: 'beschließen : décider' },
    { word: 'einstimmig', partOfSpeech: 'adjective', translation: 'à l’unanimité',
      example: 'Der Termin für das Fest wurde einstimmig angenommen.', note: null },
    { word: 'Enthaltung', article: 'die', plural: 'Enthaltungen', partOfSpeech: 'noun', translation: 'l’abstention',
      example: 'Der Antrag wurde mit sieben Stimmen bei einer Enthaltung angenommen.', note: 'sich enthalten : s’abstenir' },
    { word: 'vertagen', partOfSpeech: 'verb', translation: 'ajourner, reporter',
      example: 'Der Punkt wird auf die nächste Sitzung vertagt.', note: 'auf + accusatif' },
    { word: 'Wahlpflicht', article: 'die', plural: null, partOfSpeech: 'noun', translation: 'le vote obligatoire',
      example: 'In einigen Ländern gibt es eine Wahlpflicht.', note: 'sans pluriel' },
    { word: 'Wahlalter', article: 'das', plural: null, partOfSpeech: 'noun', translation: 'l’âge du droit de vote',
      example: 'Soll das Wahlalter auf sechzehn Jahre gesenkt werden?', note: 'das Wahlalter senken : abaisser l’âge du vote' },
  ],

  media: [
    { key: 'b2-gesellschaft-atelier-modell-audio', kind: 'audio', title: 'Modèle : une intervention dans une discussion',
      script: [
        { voice: 'sprecher', name: 'Moderator', text: 'Frau Rademacher, Herr Brückner hält den Bürgerhaushalt für Zeitverschwendung. Wie sehen Sie das?' },
        { pause: 0.6 },
        { voice: 'frau2', name: 'Fenja Rademacher', text: 'Ich möchte gern an das anknüpfen, was Herr Brückner eben gesagt hat. Er meint, der Bürgerhaushalt bringe nichts, weil am Ende doch nur kleine Projekte gewinnen. Da ist etwas dran: Mit achtzigtausend Euro baut man keine Schwimmhalle.' },
        { voice: 'frau2', name: 'Fenja Rademacher', text: 'Trotzdem sehe ich das anders. Gerade kleine Projekte, also eine Bank, eine Lampe oder ein Spielgerät, verändern den Alltag der Menschen ganz direkt. Und wer erlebt, dass sein Vorschlag wirklich umgesetzt wird, engagiert sich auch beim nächsten Mal.' },
        { voice: 'frau2', name: 'Fenja Rademacher', text: 'Deshalb würde ich vorschlagen, den Bürgerhaushalt nicht abzuschaffen, sondern die Umsetzung zu beschleunigen. Kurz gesagt: weniger Papier, schnellere Ergebnisse.' },
      ] },
    { key: 'b2-gesellschaft-atelier-diskussion-a1', kind: 'audio', title: 'Argument 1',
      script: [{ voice: 'mann2', name: 'Herr Brückner', text: 'Jugendliche interessieren sich doch gar nicht für Kommunalpolitik. Da kann man machen, was man will.' }] },
    { key: 'b2-gesellschaft-atelier-diskussion-a2', kind: 'audio', title: 'Argument 2',
      script: [{ voice: 'frau3', name: 'Frau Aksoy', text: 'Wir sollten alle Sitzungen des Stadtrats live im Internet übertragen. Dann sieht jeder, was dort passiert, und das Problem ist gelöst.' }] },
    { key: 'b2-gesellschaft-atelier-diskussion-a3', kind: 'audio', title: 'Argument 3',
      script: [{ voice: 'mann3', name: 'Herr Wenzel', text: 'Ein Jugendbeirat ohne eigenes Budget ist doch reine Dekoration.' }] },
    { key: 'b2-gesellschaft-atelier-diskussion-a4', kind: 'audio', title: 'Argument 4',
      script: [{ voice: 'frau2', name: 'Frau Lenz', text: 'Wir drehen uns im Kreis. Können wir uns nicht wenigstens auf einen ersten Schritt einigen?' }] },
    { key: 'b2-gesellschaft-atelier-mediation-sitzung', kind: 'audio', title: 'Extrait d’une séance du conseil de quartier',
      script: [
        { voice: 'frau', name: 'Birgit Hollerbach', text: 'Gut, dann kommen wir zu Tagesordnungspunkt eins, dem Sommerfest am Kanal. Wir hatten zwei Termine zur Auswahl. Wer ist für Samstag, den einundzwanzigsten Juni?' },
        { pause: 1.2 },
        { voice: 'frau', name: 'Birgit Hollerbach', text: 'Das sind alle bis auf eine Stimme. Also bleibt es beim einundzwanzigsten. Herr Okonkwo, wie sieht es mit dem Geld aus?' },
        { voice: 'mann2', name: 'Herr Okonkwo', text: 'Vom Bezirksamt bekommen wir achthundert Euro, dazu kommen etwa zweihundert Euro aus unserer Kaffeekasse. Wir haben also ungefähr tausend Euro.' },
        { voice: 'frau2', name: 'Liv Lindqvist', text: 'Darf ich noch etwas anmerken? Letztes Jahr war es mittags so heiß, dass kaum jemand gekommen ist. Ich würde vorschlagen, das Fest erst um sechzehn Uhr beginnen zu lassen und bis zweiundzwanzig Uhr zu feiern.' },
        { voice: 'frau', name: 'Birgit Hollerbach', text: 'Gibt es Einwände? Nein? Dann machen wir das so: Beginn um sechzehn Uhr. Wer übernimmt die Getränke?' },
        { voice: 'mann2', name: 'Herr Okonkwo', text: 'Das mache ich, wie letztes Jahr.' },
        { voice: 'mann3', name: 'Herr Tamm', text: 'Und ich kümmere mich um die Musik. Übrigens, der Kaffee heute ist mal wieder furchtbar. Wer hat den denn gekocht?' },
        { voice: 'frau', name: 'Birgit Hollerbach', text: 'Den Kaffee besprechen wir ein anderes Mal, Herr Tamm. Punkt zwei: der Antrag auf Tempo dreißig vor der Grundschule in der Weidenstraße. Frau Lindqvist, Sie haben die Zahlen.' },
        { voice: 'frau2', name: 'Liv Lindqvist', text: 'Ja. Die Stadt hat im März eine Woche lang gemessen: Fast jedes dritte Auto fährt dort schneller als fünfzig. Und morgens zwischen sieben und acht gehen über zweihundert Kinder zur Schule.' },
        { voice: 'mann2', name: 'Herr Okonkwo', text: 'Ich bin grundsätzlich dafür, aber ich frage mich, ob Tempo dreißig allein reicht. Vielleicht brauchen wir zusätzlich einen Zebrastreifen.' },
        { voice: 'frau', name: 'Birgit Hollerbach', text: 'Das können wir in den Antrag aufnehmen. Ich schlage vor, wir stimmen ab: Der Quartiersrat beantragt beim Stadtrat Tempo dreißig und einen Zebrastreifen vor der Grundschule. Wer ist dafür?' },
        { pause: 1 },
        { voice: 'frau', name: 'Birgit Hollerbach', text: 'Sieben. Wer ist dagegen? Zwei. Enthaltungen? Eine. Damit ist der Antrag angenommen.' },
        { voice: 'mann3', name: 'Herr Tamm', text: 'Und wer schreibt den Antrag? Bis wann muss er beim Stadtrat sein?' },
        { voice: 'frau', name: 'Birgit Hollerbach', text: 'Frau Lindqvist und ich formulieren ihn zusammen. Abgabeschluss ist der dreißigste Mai, damit er noch in die Junisitzung des Stadtrats kommt.' },
        { voice: 'frau', name: 'Birgit Hollerbach', text: 'Punkt drei, Verschiedenes: Die nächste Sitzung ist am zwölften Juni, wieder hier im Nachbarschaftszentrum. Und Herr Tamm, die Frage nach dem Kaffee vertagen wir auf unbestimmte Zeit.' },
      ] },
    { key: 'b2-gesellschaft-atelier-pruefung-forum', kind: 'image', title: 'Forum des lecteurs : le vote obligatoire',
      alt: 'Forum des lecteurs d’un journal local sur le vote obligatoire : quatre commentaires de Bernd (68 ans), Selma (34 ans), Jonte (17 ans) et Heike (52 ans).',
      image: { layout: 'forum', title: 'Leserforum: Wahlpflicht – auch bei uns?', posts: [
        { author: 'Bernd, 68', date: '3. Oktober', text: 'Ich gehe seit fünfzig Jahren zu jeder Wahl, aber eine Pflicht lehne ich ab. Wer nicht wählt, trifft auch eine Entscheidung: Er zeigt, dass ihn kein Angebot überzeugt. Diese Botschaft sollten die Parteien ernst nehmen, statt sie mit Bußgeldern zu übertönen. Außerdem hat der Staat nicht zu bestimmen, wie ich meine Freiheit nutze.' },
        { author: 'Selma, 34', date: '3. Oktober', text: 'Ich arbeite in einem Stadtteilzentrum und sehe jeden Tag, wer nicht wählen geht: vor allem Menschen mit wenig Geld. Und genau um diese Menschen kümmert sich die Politik am wenigsten, weil sie als Wähler nicht zählen. Eine Pflicht würde das ändern. Die Ergebnisse wären gerechter, weil sie die ganze Bevölkerung abbilden.' },
        { author: 'Jonte, 17', date: '4. Oktober', text: 'Ich darf noch nicht einmal wählen, obwohl ich mich für Politik interessiere. Bevor man über eine Pflicht redet, sollte man lieber das Wahlalter senken und in der Schule mehr über Politik lernen. Eine Pflicht für Leute, die keine Ahnung haben, wen sie wählen sollen, bringt doch nichts. Dann kreuzen sie eben irgendwas an.' },
        { author: 'Heike, 52', date: '4. Oktober', text: 'Ich wäre unter einer Bedingung dafür: Auf dem Stimmzettel muss es ein Feld geben, mit dem man ausdrücklich keine Partei wählt. Dann zwingt niemand die Menschen, jemanden zu unterstützen, aber alle müssen sich wenigstens einmal mit der Wahl beschäftigen. So würde aus der Pflicht keine Bevormundung.' },
      ] } },
    { key: 'b2-gesellschaft-atelier-sprechen-runde', kind: 'audio', title: 'Table ronde : gagner des habitants à la politique locale',
      script: [
        { voice: 'sprecherin', name: 'Moderatorin', text: 'Willkommen zu unserer Diskussionsrunde. Die Frage heute lautet: Wie können wir mehr Menschen für die Kommunalpolitik gewinnen? Herr Kessler, bitte.' },
        { voice: 'mann', name: 'Herr Kessler', text: 'Für mich liegt das Problem bei den Sitzungen. Sie beginnen nachmittags, dauern oft vier Stunden und sind voller Fachbegriffe. Wer arbeitet oder kleine Kinder hat, kann da nicht mitmachen. Man müsste die Sitzungen abends ansetzen, kürzer machen und online übertragen.' },
        { voice: 'sprecherin', name: 'Moderatorin', text: 'Frau Aksoy, Sie sehen das anders?' },
        { voice: 'frau3', name: 'Frau Aksoy', text: 'Die Uhrzeit ist sicher ein Punkt. Aber ich glaube, das Hauptproblem ist ein anderes: Viele Menschen sehen nicht, dass sich durch ihr Engagement etwas ändert. Solange Vorschläge monatelang in der Verwaltung liegen, nützen auch bessere Uhrzeiten wenig.' },
        { voice: 'sprecherin', name: 'Moderatorin', text: 'Zwei Positionen also. Und was meinen Sie? Wie sehen Sie das?' },
      ] },
  ],

  activities: [
    // 1 · Modèle annoté
    { id: 'b2-gesellschaft-atelier-modell', kind: 'lesson', title: 'Modell: ein Forumsbeitrag und ein Diskussionsbeitrag', estimatedMinutes: 12,
      competences: ['lecture', 'ecoute'],
      lesson: { description: `MODELL 1: EIN BEITRAG IN EINEM FORUM
${aide('Lesen Sie den Beitrag von Fenja Rademacher im Forum der Lokalzeitung. Achten Sie auf den Aufbau und auf die Redemittel.', 'Lisez la contribution de Fenja Rademacher au forum du journal local ; observez la structure et les formules.')}

Betreff: Re: Bürgerhaushalt – sinnvoll oder Zeitverschwendung?
Ich verfolge die Diskussion über den Bürgerhaushalt schon eine Weile und möchte mich jetzt auch zu Wort melden. Meiner Ansicht nach ist der Bürgerhaushalt eine gute Idee, allerdings nur, wenn er richtig umgesetzt wird.
Dafür spricht vor allem, dass Menschen über Dinge mitentscheiden, die sie direkt betreffen. Wer jeden Tag durch den Stadtpark geht, weiß besser als jede Verwaltung, wo eine Bank oder eine Lampe fehlt. Ein weiteres Argument ist, dass man beim Mitmachen lernt, wie Politik funktioniert: Man muss Vorschläge begründen, Kosten schätzen und Mehrheiten finden.
Es stimmt zwar, dass sich bisher vor allem gut organisierte Gruppen beteiligen. Das spricht aber nicht gegen das Verfahren, sondern dafür, gezielter zu informieren, zum Beispiel in mehreren Sprachen und direkt in den Wohnvierteln.
Alles in allem halte ich den Bürgerhaushalt für einen Gewinn. Entscheidend ist, dass die Stadt am Ende transparent erklärt, was aus jedem Vorschlag geworden ist. Nur dann machen die Leute auch im nächsten Jahr wieder mit.
Fenja R.

AUFBAU
1. Einleitung: Bezug auf die Diskussion und eigene Position, hier schon mit einer Einschränkung („allerdings nur, wenn …“). [fr?] Introduction : lien avec le débat et position personnelle, déjà nuancée.
2. Erstes Argument mit einem konkreten Beispiel. [fr?] Premier argument avec un exemple concret.
3. Zweites Argument. [fr?] Deuxième argument.
4. Gegenargument einräumen und entkräften: „Es stimmt zwar, dass …“ – „Das spricht aber nicht gegen …, sondern …“. [fr?] Concéder un contre-argument, puis le réfuter.
5. Fazit mit einer Bedingung oder Forderung. [fr?] Conclusion avec une condition ou une demande.

EINLEITEN
• Ich möchte mich zu … äußern. · Meiner Ansicht nach … · Ich bin davon überzeugt, dass …
BEGRÜNDEN
• Dafür spricht vor allem, dass … · Ein weiteres Argument ist … · Hinzu kommt, dass …
EINRÄUMEN UND ENTKRÄFTEN
• Es stimmt zwar, dass …, aber … · Man könnte einwenden, dass … Allerdings … · Das spricht nicht gegen …, sondern …
ABSCHLIESSEN
• Alles in allem … · Entscheidend ist, dass … · Deshalb plädiere ich dafür, …

MODELL 2: EIN BEITRAG IN EINER DISKUSSION
${aide('Hören Sie, wie Fenja Rademacher in einer Radiodiskussion auf Herrn Brückner reagiert. Ihr Beitrag hat fünf Schritte: anknüpfen, die Gegenposition kurz wiedergeben, teilweise zustimmen, die eigene Position mit Beispiel begründen, einen Vorschlag machen und zusammenfassen.', 'Écoutez comment Fenja Rademacher réagit à M. Brückner : rebondir, résumer la position adverse, concéder, argumenter avec un exemple, proposer et conclure.')}
• Anknüpfen: Ich möchte gern an das anknüpfen, was … gesagt hat.
• Wiedergeben: Er meint, der Bürgerhaushalt bringe nichts, weil …
• Teilweise zustimmen: Da ist etwas dran: …
• Widersprechen und begründen: Trotzdem sehe ich das anders. Gerade …
• Vorschlagen und zusammenfassen: Deshalb würde ich vorschlagen, … Kurz gesagt: …` },
      placements: [{ media: 'b2-gesellschaft-atelier-modell-audio', caption: 'Fenja Rademacher in der Radiodiskussion' }] },

    // 2 · Discussion : réagir à des arguments
    { id: 'b2-gesellschaft-atelier-diskussion', kind: 'exercise', title: 'Diskutieren: auf Argumente reagieren', estimatedMinutes: 12,
      competences: ['ecoute', 'expression-orale'],
      lesson: { description: `${C2.argument}

SITUATION
In einer Diskussionsrunde geht es um die Frage, wie Jugendliche in der Kommunalpolitik mitreden können. Vier Personen bringen Argumente vor. [fr?] Dans une table ronde sur la participation des jeunes à la politique locale, quatre personnes avancent des arguments.
${aide('Hören Sie jedes Argument und wählen Sie die Reaktion, die zur genannten Absicht passt. Sprechen Sie danach die vier Reaktionen laut nach.', 'Écoutez chaque argument et choisissez la réaction qui correspond à l’intention indiquée ; répétez ensuite les quatre réactions à voix haute.')}

TIPP
In einer Diskussion zählt nicht nur, was Sie sagen, sondern auch wie: Erkennen Sie die andere Position an, bevor Sie widersprechen, und bleiben Sie sachlich. [fr?] Reconnaissez la position de l’autre avant de la contredire et restez factuel.` },
      placements: [
        { media: 'b2-gesellschaft-atelier-diskussion-a1', questionId: 'q1', transcriptVisibility: 'after_answer' },
        { media: 'b2-gesellschaft-atelier-diskussion-a2', questionId: 'q2', transcriptVisibility: 'after_answer' },
        { media: 'b2-gesellschaft-atelier-diskussion-a3', questionId: 'q3', transcriptVisibility: 'after_answer' },
        { media: 'b2-gesellschaft-atelier-diskussion-a4', questionId: 'q4', transcriptVisibility: 'after_answer' },
      ],
      questions: [
        choice('q1', aide('Argument 1: Sie sind anderer Meinung. Wie widersprechen Sie sachlich?', 'Vous n’êtes pas d’accord. Comment contredire de façon factuelle ?'),
          [['Das ist doch Quatsch, Herr Brückner, und das wissen Sie eigentlich auch ganz genau.'],
            ['Das sehe ich anders, denn beim Bürgerhaushalt kamen viele Vorschläge von Jugendlichen.', true],
            ['Da haben Sie völlig recht, das ist leider in fast allen Städten so.'],
            ['Können wir bitte über etwas anderes sprechen als über Jugendliche?']],
          aide('„Das sehe ich anders“ kündigt den Widerspruch höflich an, und „denn …“ liefert sofort ein überprüfbares Gegenbeispiel. Genau das macht einen Widerspruch sachlich. Die erste Antwort ist ein persönlicher Angriff, die dritte stimmt zu, die vierte weicht dem Thema aus.',
            'Contredire poliment (« Das sehe ich anders ») et justifier par un exemple vérifiable.')),
        choice('q2', aide('Argument 2: Sie stimmen nur teilweise zu. Was sagen Sie?', 'Vous n’êtes d’accord qu’en partie. Que dites-vous ?'),
          [['Genau, damit wären endlich alle Probleme unserer Stadt gelöst.'],
            ['Nein, das Internet hat in der Kommunalpolitik nichts zu suchen.'],
            ['Da ist etwas dran, aber zuschauen allein ist noch keine Beteiligung.', true],
            ['Das habe ich nicht ganz verstanden, aber ich bin trotzdem dagegen.']],
          aide('„Da ist etwas dran“ erkennt den richtigen Teil des Arguments an: Übertragungen machen Politik sichtbarer. „Aber …“ nennt die Grenze: Wer nur zuschaut, beteiligt sich noch nicht. Die erste Antwort stimmt übertrieben ganz zu, die zweite lehnt ganz ab, die vierte ist widersprüchlich.',
            'Accord partiel : reconnaître ce qui est juste (« Da ist etwas dran »), puis poser la limite (« aber … »).')),
        choice('q3', aide('Argument 3: Sie sind nicht sicher, was gemeint ist. Wie fragen Sie nach?', 'Vous n’êtes pas sûr(e) de comprendre. Comment demander une précision ?'),
          [['Wie meinen Sie das genau? Hat der Beirat denn gar keinen Einfluss?', true],
            ['Dekoration ist doch etwas Schönes, oder sehen Sie das anders?'],
            ['Das stimmt einfach nicht, und das wissen Sie auch selbst ganz genau.'],
            ['Dafür haben wir jetzt leider keine Zeit mehr, wir müssen weiter.']],
          aide('„Wie meinen Sie das genau?“ bittet um eine Erklärung, die zweite Frage prüft, ob man richtig verstanden hat. So vermeiden Sie Missverständnisse, bevor Sie Stellung nehmen. Die zweite Antwort versteht „Dekoration“ wörtlich und verfehlt den Sinn: Herr Wenzel meint, der Beirat habe nur symbolische Bedeutung.',
            'Demander une précision (« Wie meinen Sie das genau? ») et vérifier sa compréhension ; « Dekoration » est ici une image.')),
        choice('q4', aide('Argument 4: Sie möchten einen Kompromiss vorschlagen. Was sagen Sie?', 'Vous voulez proposer un compromis. Que dites-vous ?'),
          [['Solange nicht alle meiner Meinung sind, gibt es für mich keine Einigung.'],
            ['Ich habe jetzt leider keine Zeit mehr, ich muss gleich los.'],
            ['Dann stimmen wir eben gar nicht ab, das ist am einfachsten.'],
            ['Wie wäre es, wenn der Beirat zunächst ein kleines Budget zur Probe bekäme?', true]],
          aide('„Wie wäre es, wenn …?“ mit dem Konjunktiv II (bekäme) macht einen vorsichtigen Vorschlag, und „zunächst … zur Probe“ macht ihn für beide Seiten annehmbar: ein erster Schritt, kein endgültiger Beschluss. Die anderen Antworten blockieren die Diskussion oder brechen sie ab.',
            'Proposer prudemment au Konjunktiv II (« Wie wäre es, wenn … bekäme? ») un premier pas acceptable pour tous.')),
        speakB2('q5', 'Das sehe ich anders, denn beim Bürgerhaushalt kamen viele Vorschläge von Jugendlichen.',
          aide('Widerspruch mit Begründung. Betonen Sie „anders“ und „viele“. In „Bürgerhaushalt“ liegt der Hauptakzent auf der ersten Silbe: BÜR-ger-haus-halt.',
            'Accentuez « anders » et « viele » ; accent principal sur BÜR- dans Bürgerhaushalt.')),
        speakB2('q6', 'Da ist etwas dran, aber zuschauen allein ist noch keine Beteiligung.',
          aide('Teilweise Zustimmung. Machen Sie nach „dran“ eine kleine Pause, dann klingt das „aber“ deutlicher. „Beteiligung“ wird auf der zweiten Silbe betont: be-TEI-li-gung.',
            'Petite pause après « dran » ; accent sur -TEI- dans Beteiligung.')),
        speakB2('q7', 'Wie meinen Sie das genau? Hat der Beirat denn gar keinen Einfluss?',
          aide('Zwei Fragen: Die erste ist eine W-Frage, die Stimme fällt am Ende. Die zweite ist eine Ja-Nein-Frage, die Stimme steigt. Die Modalpartikel „denn“ ist unbetont und macht die Frage interessiert, nicht aggressiv.',
            'Question en W : intonation descendante ; question fermée : montante. « denn » reste inaccentué.')),
        speakB2('q8', 'Wie wäre es, wenn der Beirat zunächst ein kleines Budget zur Probe bekäme?',
          aide('Vorschlag im Konjunktiv II. „Wäre“ und „bekäme“ haben ein langes, offenes ä. In „Budget“ spricht man „dg“ wie „dsch“, und das t am Ende hört man nicht: bü-DSCHEE.',
            'ä long et ouvert dans wäre et bekäme ; « Budget » se prononce à la française, t muet.')),
      ] },

    // 3 · Médiation : notes de réunion et procès-verbal
    { id: 'b2-gesellschaft-atelier-mediation', kind: 'exercise', title: 'Vermitteln: Notizen und Protokoll einer Sitzung', estimatedMinutes: 16,
      competences: ['ecoute', 'expression-ecrite'],
      lesson: { description: `SITUATION
Sie sind Mitglied im Quartiersrat Nordstadt. Weil Greta Wiese krank ist, führen Sie heute das Protokoll. Greta möchte danach eine kurze Zusammenfassung per E-Mail. [fr?] Vous faites partie du conseil de quartier et rédigez aujourd’hui le procès-verbal à la place de Greta, malade, qui attend ensuite un court résumé.
Teilnehmende: Birgit Hollerbach (Vorsitz), Chinedu Okonkwo, Liv Lindqvist, Sven Tamm.

${aide('Hören Sie den Ausschnitt aus der Sitzung. Ergänzen Sie zuerst Ihre Notizen, formulieren Sie dann Sätze für das Protokoll und die E-Mail an Greta.', 'Écoutez l’extrait de la séance ; complétez vos notes, puis formulez des phrases pour le procès-verbal et le courriel à Greta.')}

TIPP
Ein Ergebnisprotokoll hält nur Ergebnisse fest: Beschlüsse, Abstimmungen, Aufgaben mit Namen und Fristen, Termine. Persönliche Bemerkungen und Nebengespräche gehören nicht hinein. Der Stil ist sachlich, im Präsens, oft mit Nomen und Passiv: „Der Antrag wird angenommen.“ [fr?] Un procès-verbal de résultats ne garde que les décisions, votes, tâches, délais et dates, dans un style neutre (présent, passif).` },
      placements: [{ media: 'b2-gesellschaft-atelier-mediation-sitzung', caption: 'Sitzung des Quartiersrats Nordstadt' }],
      questions: [
        fill('q1', aide('Ergänzen Sie Ihre Notizen zu TOP 1.', 'Complétez vos notes sur le point 1.'),
          'TOP 1 Sommerfest am Kanal · Termin: Samstag, [[1]] Juni · Budget: etwa [[2]] Euro (800 vom Bezirksamt, 200 aus der Kaffeekasse) · Beginn: [[3]] Uhr, Ende: 22 Uhr · Getränke: Herr [[4]] · Musik: Herr [[5]]',
          [['21.', '21', 'einundzwanzigster', 'einundzwanzigsten'], ['1 000', '1000', '1.000', 'tausend'], ['16', 'sechzehn'], ['Okonkwo'], ['Tamm']],
          aide('Der Termin wird mit allen Stimmen bis auf eine bestätigt: der 21. Juni. Das Budget ergibt sich aus 800 + 200 Euro. Den späteren Beginn um 16 Uhr schlägt Frau Lindqvist wegen der Mittagshitze vor; es gibt keine Einwände. Herr Okonkwo übernimmt die Getränke, Herr Tamm die Musik.',
            'Date, budget (800 + 200 €), début à 16 h à cause de la chaleur, répartition des tâches.')),
        fill('q2', aide('Ergänzen Sie Ihre Notizen zu TOP 2 und TOP 3.', 'Complétez vos notes sur les points 2 et 3.'),
          'TOP 2 Tempo 30 Weidenstraße · Messung der Stadt: fast jedes [[1]] Auto zu schnell · Beschluss: Antrag auf Tempo 30 und einen [[2]] · Abstimmung: 7 dafür, [[3]] dagegen, 1 Enthaltung · Antrag: Frau Hollerbach und Frau [[4]], Abgabe bis [[5]] Mai · TOP 3 nächste Sitzung: [[6]] Juni',
          [['dritte'], ['Zebrastreifen'], ['2', 'zwei'], ['Lindqvist'], ['30.', '30', 'dreißigsten', 'zum 30.'], ['12.', '12', 'zwölfter', 'zwölften', 'am 12.']],
          aide('Frau Lindqvist nennt die Messung: „Fast jedes dritte Auto fährt dort schneller als fünfzig.“ Herr Okonkwo schlägt den Zebrastreifen vor, der in den Antrag aufgenommen wird. Ergebnis: sieben Stimmen dafür, zwei dagegen, eine Enthaltung. Abgabeschluss ist der 30. Mai, die nächste Sitzung ist am 12. Juni.',
            'Mesure (une voiture sur trois), passage piéton ajouté, vote 7-2-1, rédaction et délai, prochaine séance.')),
        choice('q3', aide('Was gehört NICHT in das Ergebnisprotokoll?', 'Qu’est-ce qui n’a PAS sa place dans le procès-verbal de résultats ?'),
          [['dass der Antrag mit sieben Stimmen angenommen wurde'],
            ['dass Herr Tamm den Kaffee in der Sitzung schlecht fand', true],
            ['dass das Sommerfest erst um sechzehn Uhr beginnt'],
            ['wer den Antrag schreibt und bis wann er fertig ist']],
          aide('Ein Ergebnisprotokoll enthält Beschlüsse, Ergebnisse von Abstimmungen, Aufgaben und Fristen. Die Bemerkung über den Kaffee ist ein Nebengespräch ohne Ergebnis. Auch die scherzhafte „Vertagung“ der Kaffeefrage am Ende gehört nicht ins Protokoll.',
            'Les remarques personnelles et les apartés (le café) n’ont pas leur place dans un procès-verbal.')),
        match('q4', aide('Welche Formulierung im Protokoll passt zu welcher Aussage in der Sitzung?', 'Associez chaque phrase dite en séance à sa formulation dans le procès-verbal.'),
          [['„Das mache ich, wie letztes Jahr.“', 'Herr Okonkwo übernimmt die Getränke.'],
            ['„Sieben … zwei … eine. Damit ist der Antrag angenommen.“', 'Der Antrag wird bei einer Enthaltung mit 7 : 2 Stimmen angenommen.'],
            ['„Gibt es Einwände? Nein? Dann machen wir das so.“', 'Der spätere Beginn wird ohne Gegenstimme beschlossen.'],
            ['„Die nächste Sitzung ist am zwölften Juni.“', 'Die nächste Sitzung findet am 12. Juni statt.']],
          aide('Im Protokoll wird Gesprochenes in einen sachlichen Stil übertragen: dritte Person statt „ich“, Präsens, Passiv für Beschlüsse („wird angenommen“, „wird beschlossen“), Zahlen in Ziffern. Wer etwas übernimmt, wird mit Namen genannt.',
            'Style du procès-verbal : troisième personne, présent, passif pour les décisions, chiffres.')),
        order('q5', aide('Formulieren Sie den Vorschlag von Frau Lindqvist für das Protokoll.', 'Formulez la proposition de Mme Lindqvist pour le procès-verbal.'),
          [['Frau Lindqvist', 'schlägt vor,', 'das Fest', 'wegen der Hitze', 'erst', 'um 16 Uhr', 'beginnen', 'zu', 'lassen.'],
            ['Frau Lindqvist', 'schlägt vor,', 'wegen der Hitze', 'das Fest', 'erst', 'um 16 Uhr', 'beginnen', 'zu', 'lassen.']],
          aide('Nach „vorschlagen“ folgt eine Infinitivgruppe mit „zu“, das Komma steht nach „vor“. In der Infinitivgruppe stehen die Angaben vor den Verben, „erst um 16 Uhr“ bleibt zusammen, und „beginnen zu lassen“ schließt den Satz. Den Grund „wegen der Hitze“ kann man vor oder nach „das Fest“ stellen.',
            'vorschlagen, … zu + infinitif ; compléments avant les verbes ; « beginnen zu lassen » en fin de phrase.')),
        fill('q6', aide('Ergänzen Sie Ihre E-Mail an Greta.', 'Complétez votre courriel à Greta.'),
          'Liebe Greta, hier kurz das Wichtigste: Das Sommerfest am 21. Juni beginnt wegen der Hitze erst um 16 Uhr. Der Antrag auf Tempo 30 und einen Zebrastreifen wurde mit klarer [[1]] angenommen. Birgit und Liv [[2]] ihn bis zum 30. Mai. Die nächste Sitzung [[3]] am 12. Juni statt. Gute Besserung!',
          [['Mehrheit'], ['schreiben', 'formulieren', 'verfassen'], ['findet']],
          aide('Für Greta reichen die Ergebnisse, in einem freundlichen, aber knappen Ton. „Mit klarer Mehrheit angenommen“ fasst das Ergebnis 7 : 2 zusammen. „Einen Antrag schreiben“, „formulieren“ oder „verfassen“ sind gleichwertig. „Stattfinden“ ist trennbar: Die Sitzung findet … statt.',
            'Résumé pour une collègue : résultats seulement ; « mit klarer Mehrheit », « findet … statt ».')),
      ] },

    // 4 · Erreurs typiques
    { id: 'b2-gesellschaft-atelier-korrektur', kind: 'exercise', title: 'Korrigieren: typische Fehler in Meinungstexten', estimatedMinutes: 10,
      competences: ['lecture', 'expression-ecrite'],
      lesson: { description: `${aide('Diese Sätze stammen aus Forumsbeiträgen von Kursteilnehmenden. Finden Sie die richtige Form.', 'Ces phrases viennent de contributions d’apprenants à un forum ; trouvez la forme correcte.')}

KORREKTURZEICHEN
G Grammatik · W Wortschatz · St Satzstellung · R Rechtschreibung · A Ausdruck und Register. [fr?] Codes de correction employés par votre professeur : grammaire, vocabulaire, place des mots, orthographe, registre.` },
      questions: [
        choice('q1', aide('G: Welcher Satz ist richtig?', 'G : quelle phrase est correcte ?'),
          [['Die Person, wer zuerst kommt, bekommt einen Platz.'],
            ['Der, wer zuerst kommt, bekommt einen Platz.'],
            ['Wer zuerst kommt, bekommt einen Platz.', true],
            ['Welcher zuerst kommt, bekommt einen Platz.']],
          aide('Ohne Bezugswort beginnt der Relativsatz mit „wer“: Wer zuerst kommt, … Nach einem Nomen steht dagegen das Relativpronomen „die“ oder „der“: die Person, die zuerst kommt. Die Kombination „der, wer“ ist ein Lehnfehler aus dem Französischen.',
            '« celui qui » = wer ; après un nom : die Person, die … ; jamais « der, wer ».')),
        choice('q2', aide('G: Welcher Satz ist richtig?', 'G : quelle phrase est correcte ?'),
          [['Das ist das Einzige, was mich an dem Vorschlag stört.', true],
            ['Das ist das Einzige, das mich an dem Vorschlag stört.'],
            ['Das ist das Einzige, welches an dem Vorschlag mich stört.'],
            ['Das ist das Einzige, wo mich an dem Vorschlag stört.']],
          aide('Nach Wörtern wie „das Einzige“, „das Beste“, „alles“, „nichts“ steht „was“. „Das“ wäre nur nach einem echten Nomen richtig (das Problem, das mich stört). „Wo“ bezieht sich auf einen Ort, und im dritten Satz steht zudem das Pronomen „mich“ zu spät.',
            'Après das Einzige, das Beste, alles, nichts : was.')),
        fill('q3', aide('W: Ergänzen Sie.', 'W : complétez.'),
          'Ich bin mit diesem Vorschlag nicht [[1]]. · Ich [[2]] Ihnen nur teilweise zu. · Meiner [[3]] nach fehlen konkrete Beispiele.',
          [['einverstanden'], ['stimme'], ['Meinung', 'Ansicht']],
          aide('„Einverstanden sein mit“ + Dativ ist die deutsche Form für das Einverständnis; „d’accord“ ist kein deutsches Wort. „Jemandem zustimmen“ ist trennbar: Ich stimme Ihnen zu. „Meiner Meinung nach“ und „meiner Ansicht nach“ sind feste Wendungen mit dem Dativ und nachgestelltem „nach“.',
            'einverstanden sein mit ; jemandem zustimmen ; meiner Meinung / Ansicht nach.')),
        choice('q4', aide('St: Welcher Satz ist richtig?', 'St : quelle phrase est correcte ?'),
          [['Meiner Meinung nach Jugendliche sollten früher wählen dürfen.'],
            ['Meiner Meinung nach sollten Jugendliche früher wählen dürfen.', true],
            ['Meiner Meinung nach, Jugendliche sollten früher wählen dürfen.'],
            ['Meiner Meinung nach sollten Jugendliche dürfen früher wählen.']],
          aide('„Meiner Meinung nach“ besetzt die erste Position, also folgt sofort das konjugierte Verb (sollten), dann das Subjekt. Ein Komma steht hier nicht. Die Infinitive stehen am Satzende in der Reihenfolge „wählen dürfen“.',
            'Après « Meiner Meinung nach », verbe conjugué en 2e position, sans virgule ; infinitifs en fin de phrase.')),
        fill('q5', aide('G: Ergänzen Sie die Endungen im Genitiv.', 'G : complétez les terminaisons du génitif.'),
          'Die Meinung d[[1]] Jugendlichen wird oft nicht gehört. · Die Aufgabe d[[2]] Staates ist es, alle zu informieren.',
          [['er'], ['es']],
          aide('Plural im Genitiv: der (die Meinung der Jugendlichen). Maskulin im Genitiv: des + -es oder -s am Nomen (des Staates). Im Gespräch würde man oft „von den Jugendlichen“ sagen; im geschriebenen Meinungstext wirkt der Genitiv besser.',
            'Génitif pluriel : der ; masculin : des …-(e)s.')),
        choice('q6', aide('W: Welches Wort passt? „Am Samstag gibt es eine … gegen den Neubau am Hafen.“', 'W : quel mot convient ?'),
          [['Manifestation'], ['Demonstration', true], ['Manifestierung'], ['Veranstaltung']],
          aide('Eine öffentliche Protestaktion heißt auf Deutsch „Demonstration“ (kurz: Demo) oder „Kundgebung“. „Manifestation“ ist ein falscher Freund: Im Deutschen bedeutet es „sichtbarer Ausdruck“ von etwas, zum Beispiel einer Krankheit. „Veranstaltung“ ist zu allgemein und passt nicht zu „gegen“.',
            'Faux ami : « manifestation » = Demonstration ; « Manifestation » allemand signifie « manifestation (d’une maladie) ».')),
      ] },

    // 5 · Entraînement au format : Lesen, commentaires d'opinion
    { id: 'b2-gesellschaft-atelier-pruefung', kind: 'exercise', title: 'Prüfungstraining: Meinungen in Kommentaren erkennen', estimatedMinutes: 20,
      competences: ['lecture'],
      lesson: { description: `PRÜFUNGSTRAINING LESEN
${aide('Lesen Sie den Einleitungstext und die vier Kommentare aus einem Leserforum. Beantworten Sie dann die Fragen 1 und 2 zum Einleitungstext. Entscheiden Sie bei den Aussagen 3 bis 8: Wer vertritt diese Meinung?', 'Lisez l’introduction et les quatre commentaires ; répondez aux questions 1 et 2, puis indiquez pour les phrases 3 à 8 qui défend cette opinion.')}

ZEIT
Etwa 18 Minuten, ohne Wörterbuch. [fr?] Environ 18 minutes, sans dictionnaire.

STRATEGIE
1. Lesen Sie zuerst jeden Kommentar und fassen Sie die Position in einem Satz zusammen: dafür, dagegen oder „ja, aber …“? [fr?] Résumez d’abord chaque commentaire en une phrase : pour, contre ou « oui, mais » ?
2. Lesen Sie dann die Aussagen. Sie verwenden fast nie dieselben Wörter wie die Kommentare: Suchen Sie nach dem Sinn, nicht nach gleichen Wörtern. [fr?] Les phrases reformulent : cherchez le sens, pas les mots identiques.
3. Eine Person kann mehrere Aussagen vertreten. [fr?] Une même personne peut défendre plusieurs opinions.

WAHLPFLICHT – AUCH BEI UNS?
Bei der letzten Kommunalwahl in Wendelstedt hat nicht einmal jeder zweite Wahlberechtigte seine Stimme abgegeben. Ratsmitglied Uwe Brandes hat deshalb angeregt, über eine Wahlpflicht zu diskutieren, wie es sie zum Beispiel in Belgien gibt. Wer dort ohne triftigen Grund nicht wählt, dem kann ein Bußgeld drohen. Befürworter erhoffen sich von einer Pflicht eine höhere Beteiligung, vor allem in Stadtteilen, in denen bisher nur wenige Menschen wählen. Kritiker halten dagegen, dass auch das Recht, nicht zu wählen, zur Freiheit gehöre. Wir haben unsere Leserinnen und Leser gefragt: Was halten Sie von einer Wahlpflicht?

BERND, 68
Ich gehe seit fünfzig Jahren zu jeder Wahl, aber eine Pflicht lehne ich ab. Wer nicht wählt, trifft auch eine Entscheidung: Er zeigt, dass ihn kein Angebot überzeugt. Diese Botschaft sollten die Parteien ernst nehmen, statt sie mit Bußgeldern zu übertönen. Außerdem hat der Staat nicht zu bestimmen, wie ich meine Freiheit nutze.

SELMA, 34
Ich arbeite in einem Stadtteilzentrum und sehe jeden Tag, wer nicht wählen geht: vor allem Menschen mit wenig Geld. Und genau um diese Menschen kümmert sich die Politik am wenigsten, weil sie als Wähler nicht zählen. Eine Pflicht würde das ändern. Die Ergebnisse wären gerechter, weil sie die ganze Bevölkerung abbilden.

JONTE, 17
Ich darf noch nicht einmal wählen, obwohl ich mich für Politik interessiere. Bevor man über eine Pflicht redet, sollte man lieber das Wahlalter senken und in der Schule mehr über Politik lernen. Eine Pflicht für Leute, die keine Ahnung haben, wen sie wählen sollen, bringt doch nichts. Dann kreuzen sie eben irgendwas an.

HEIKE, 52
Ich wäre unter einer Bedingung dafür: Auf dem Stimmzettel muss es ein Feld geben, mit dem man ausdrücklich keine Partei wählt. Dann zwingt niemand die Menschen, jemanden zu unterstützen, aber alle müssen sich wenigstens einmal mit der Wahl beschäftigen. So würde aus der Pflicht keine Bevormundung.` },
      placements: [{ media: 'b2-gesellschaft-atelier-pruefung-forum', caption: 'Leserforum: Wahlpflicht – auch bei uns?' }],
      questions: [
        choice('q1', aide('Warum wird in Wendelstedt über eine Wahlpflicht diskutiert?', 'Pourquoi débat-on du vote obligatoire à Wendelstedt ?'),
          [['Weil Belgien der Stadt eine Partnerschaft angeboten hat.'],
            ['Weil ein Gericht die letzte Kommunalwahl für ungültig erklärt hat.'],
            ['Weil bei der letzten Wahl weniger als die Hälfte gewählt hat.', true],
            ['Weil die Stadt Bußgelder für Nichtwähler einführen will.']],
          aide('„Bei der letzten Kommunalwahl in Wendelstedt hat nicht einmal jeder zweite Wahlberechtigte seine Stimme abgegeben. Ratsmitglied Uwe Brandes hat deshalb angeregt …“ „Nicht einmal jeder zweite“ heißt: weniger als die Hälfte. Belgien ist nur ein Beispiel, und Bußgelder gibt es dort, nicht in Wendelstedt.',
            '« nicht einmal jeder zweite » : moins de la moitié des électeurs ont voté ; la Belgique n’est qu’un exemple.')),
        choice('q2', aide('Welches Argument der Kritiker nennt der Einleitungstext?', 'Quel argument des opposants l’introduction cite-t-elle ?'),
          [['Eine Pflicht würde zu viel Geld kosten.'],
            ['Die Stimmzettel wären zu kompliziert.'],
            ['Junge Menschen dürften noch nicht wählen.'],
            ['Auch das Nichtwählen gehört zur Freiheit.', true]],
          aide('„Kritiker halten dagegen, dass auch das Recht, nicht zu wählen, zur Freiheit gehöre.“ Der Konjunktiv I (gehöre) zeigt, dass der Text die Meinung der Kritiker wiedergibt. Kosten, Stimmzettel oder das Wahlalter kommen erst in den Kommentaren oder gar nicht vor.',
            'Les opposants : ne pas voter fait aussi partie de la liberté (discours indirect au Konjunktiv I).')),
        who('q3', 'Auch wer nicht wählt, sendet den Parteien eine Botschaft.', 'Bernd, 68',
          aide('Bernd: „Wer nicht wählt, trifft auch eine Entscheidung: Er zeigt, dass ihn kein Angebot überzeugt. Diese Botschaft sollten die Parteien ernst nehmen.“ Die Aussage fasst diesen Gedanken mit anderen Wörtern zusammen.',
            'Bernd : ne pas voter est aussi un message adressé aux partis.')),
        who('q4', 'Eine Wahlpflicht wäre nur akzeptabel, wenn man ausdrücklich niemanden wählen kann.', 'Heike, 52',
          aide('Heike: „Ich wäre unter einer Bedingung dafür: Auf dem Stimmzettel muss es ein Feld geben, mit dem man ausdrücklich keine Partei wählt.“ „Nur … wenn“ in der Aussage entspricht ihrer Bedingung.',
            'Heike : pour, à condition de pouvoir explicitement ne choisir aucun parti.')),
        who('q5', 'Wichtiger als eine Pflicht wären politische Bildung und ein niedrigeres Wahlalter.', 'Jonte, 17',
          aide('Jonte: „Bevor man über eine Pflicht redet, sollte man lieber das Wahlalter senken und in der Schule mehr über Politik lernen.“ „Lieber“ und „bevor“ zeigen, dass er diese Maßnahmen für wichtiger hält.',
            'Jonte : abaisser l’âge du vote et mieux former à la politique avant tout.')),
        who('q6', 'Die Politik vernachlässigt Gruppen, die selten wählen gehen.', 'Selma, 34',
          aide('Selma: „Genau um diese Menschen kümmert sich die Politik am wenigsten, weil sie als Wähler nicht zählen.“ „Vernachlässigen“ bedeutet: sich zu wenig um jemanden kümmern.',
            'Selma : la politique néglige ceux qui votent peu.')),
        who('q7', 'Es ist nicht Aufgabe des Staates, über die Freiheit des Einzelnen zu bestimmen.', 'Bernd, 68',
          aide('Bernd: „Außerdem hat der Staat nicht zu bestimmen, wie ich meine Freiheit nutze.“ Heike spricht zwar von „Bevormundung“, will die Pflicht aber unter einer Bedingung akzeptieren. Nur Bernd lehnt sie mit diesem Freiheitsargument ab.',
            'Bernd : l’État n’a pas à décider de l’usage de ma liberté ; Heike, elle, accepte l’obligation sous condition.')),
        who('q8', 'Mit einer Pflicht würden die Wahlergebnisse die Bevölkerung besser widerspiegeln.', 'Selma, 34',
          aide('Selma: „Die Ergebnisse wären gerechter, weil sie die ganze Bevölkerung abbilden.“ „Abbilden“ und „widerspiegeln“ bedeuten hier dasselbe. Jonte glaubt dagegen, dass viele dann „irgendwas“ ankreuzen würden.',
            'Selma : les résultats refléteraient mieux toute la population (abbilden = widerspiegeln).')),
      ] },

    // 6 · Mission écrite
    { id: 'b2-gesellschaft-atelier-schreiben', kind: 'mission', title: 'Mission: ein Forumsbeitrag zum Wahlalter', estimatedMinutes: 27,
      competences: ['expression-ecrite'],
      lesson: { description: `SITUATION
Die Lokalzeitung diskutiert in ihrem Onlineforum die Frage: „Sollen Jugendliche schon mit 16 bei allen Wahlen ihre Stimme abgeben dürfen?“ Zwei Beiträge gibt es schon. [fr?] Le forum du journal local débat du droit de vote à 16 ans pour toutes les élections ; deux contributions existent déjà.

LINA, 16
„Mit 16 machen viele schon eine Ausbildung, arbeiten und zahlen Steuern. Wer von politischen Entscheidungen so direkt betroffen ist, sollte auch mitbestimmen dürfen.“
GERHARD, 61
„Mit 16 ist man noch leicht zu beeinflussen, zum Beispiel durch soziale Medien. Das Wahlalter sollte bei 18 bleiben.“

SO GEHEN SIE VOR
1. Planen (6 Minuten): Überlegen Sie sich Ihre Position, zwei Argumente mit je einem Beispiel und ein Gegenargument. [fr?] Planifier : position, deux arguments avec exemple, un contre-argument.
2. Schreiben (16 Minuten): Folgen Sie dem Aufbau aus dem Modell von Fenja Rademacher. [fr?] Écrire en suivant la structure du modèle.
3. Prüfen (5 Minuten): Lesen Sie Ihren Text mit der Checkliste noch einmal. [fr?] Relire avec la liste de vérification.` },
      mission: {
        oral: null,
        written: { prompt: aide('Schreiben Sie einen Beitrag für das Forum (180 bis 220 Wörter). Nennen Sie Ihre Position, begründen Sie sie mit zwei Argumenten und Beispielen, gehen Sie auf eines der beiden Zitate ein und ziehen Sie ein Fazit.',
          'Écrivez une contribution au forum (180 à 220 mots) : position, deux arguments avec exemples, réaction à l’une des deux citations, conclusion.'),
          maxChars: 2200, minWords: 150 },
        checklist: [
          aide('Meine Position steht schon in der Einleitung.', 'Ma position figure dès l’introduction.'),
          aide('Zwei Argumente, jedes mit einem Beispiel', 'Deux arguments, chacun avec un exemple'),
          aide('Ich gehe auf Lina oder Gerhard ein: zustimmen, einräumen oder widersprechen.', 'Je réagis à Lina ou à Gerhard.'),
          aide('Konnektoren verbinden die Absätze (dafür spricht, hinzu kommt, zwar … aber, alles in allem).', 'Des connecteurs relient les paragraphes.'),
          aide('Mindestens ein Relativsatz mit „wer“ oder „was“', 'Au moins une relative avec wer ou was'),
        ],
        criteria: [
          { ...GRIDS.b2.schreiben[0], label: aide('Aufgabenerfüllung: Position, zwei Argumente mit Beispielen, Bezug auf ein Zitat, Fazit; Forumsstil, 180–220 Wörter', 'Tâche : position, deux arguments illustrés, réaction à une citation, conclusion') },
          ...GRIDS.b2.schreiben.slice(1),
        ],
      } },

    // 7 · Mission orale
    { id: 'b2-gesellschaft-atelier-sprechen', kind: 'mission', title: 'Mission: in einer Diskussionsrunde Stellung beziehen', estimatedMinutes: 20,
      competences: ['expression-orale'],
      lesson: { description: `SITUATION
${aide('Sie nehmen an einer Diskussionsrunde im Lokalradio teil. Die Frage lautet: „Wie können wir mehr Menschen für die Kommunalpolitik gewinnen?“ Hören Sie die beiden anderen Gäste. Dann fragt die Moderatorin nach Ihrer Meinung.', 'Vous participez à une table ronde à la radio locale sur la façon d’intéresser davantage d’habitants à la politique locale ; écoutez les deux invités, puis la modératrice vous donne la parole.')}

DIE POSITIONEN
• Herr Kessler: Die Sitzungen sind zu lang, zu früh am Tag und voller Fachbegriffe. Sie sollten abends stattfinden, kürzer sein und online übertragen werden. [fr?] Séances trop longues, trop tôt et trop techniques : le soir, plus courtes, retransmises en ligne.
• Frau Aksoy: Das Hauptproblem ist, dass Menschen keine Ergebnisse sehen. Solange Vorschläge monatelang liegen bleiben, helfen bessere Uhrzeiten wenig. [fr?] Le vrai problème : les gens ne voient pas de résultats concrets.

VORBEREITUNG
${aide('Nehmen Sie sich fünf Minuten Zeit. Überlegen Sie sich Stichwörter: Woran knüpfen Sie an? Wem stimmen Sie (teilweise) zu? Welchen eigenen Vorschlag machen Sie, und mit welchem Beispiel begründen Sie ihn?', 'Préparez en cinq minutes des mots-clés : à quoi rebondir, avec qui être (en partie) d’accord, quelle proposition faire et avec quel exemple.')}` },
      placements: [{ media: 'b2-gesellschaft-atelier-sprechen-runde', caption: 'Diskussionsrunde im Lokalradio' }],
      mission: {
        oral: { prompt: aide('Nehmen Sie Ihren Beitrag zur Diskussion auf (zwei bis drei Minuten). Gehen Sie auf beide Positionen ein, stimmen Sie einer teilweise zu und widersprechen Sie in einem Punkt, machen Sie einen eigenen Vorschlag mit Beispiel und fassen Sie am Ende kurz zusammen.',
          'Enregistrez votre intervention (deux à trois minutes) : réagissez aux deux positions, concédez et contredisez, faites une proposition illustrée et concluez.'),
          maxSeconds: 180 },
        written: null,
        checklist: [
          aide('Ich knüpfe an einen Beitrag an und gebe ihn kurz wieder.', 'Je rebondis sur une intervention et la résume.'),
          aide('Ich stimme teilweise zu und widerspreche sachlich in einem Punkt.', 'J’approuve en partie et contredis sur un point.'),
          aide('Ich mache einen eigenen Vorschlag mit einem Beispiel.', 'Je fais une proposition avec un exemple.'),
          aide('Ich fasse am Ende in einem Satz zusammen.', 'Je conclus en une phrase.'),
        ],
        criteria: [
          { ...GRIDS.b2.sprechen[0], label: aide('Aufgabenerfüllung: beide Positionen aufgegriffen, eigener Vorschlag mit Beispiel, Fazit, zwei bis drei Minuten', 'Tâche : les deux positions reprises, proposition illustrée, conclusion') },
          ...GRIDS.b2.sprechen.slice(1),
        ],
      } },

    // 8 · Bilan
    { id: 'b2-gesellschaft-atelier-bilan', kind: 'lesson', title: 'Bilanz: Gesellschaft und Beteiligung', estimatedMinutes: 6,
      competences: ['lecture'],
      lesson: { description: `${aide('Lesen Sie die Ziele der beiden Module „Gesellschaft“. Was können Sie schon sicher? Was möchten Sie noch üben?', 'Relisez les objectifs des deux modules « Gesellschaft » : qu’est-ce qui est acquis, que voulez-vous encore travailler ?')}

ICH KANN …
• Ich kann einen Meinungsbeitrag für ein Forum schreiben, der ein Gegenargument aufnimmt und entkräftet. [fr?] Je peux écrire une contribution qui concède puis réfute un contre-argument.
• Ich kann in einer Diskussion anknüpfen, teilweise zustimmen, nachfragen und einen Kompromiss vorschlagen. [fr?] Je peux rebondir, nuancer, demander une précision et proposer un compromis.
• Ich kann in einer Sitzung Notizen machen und daraus ein sachliches Ergebnisprotokoll formulieren. [fr?] Je peux prendre des notes en réunion et rédiger un procès-verbal de résultats.
• Ich kann in mehreren Kommentaren erkennen, wer welche Meinung vertritt. [fr?] Je peux repérer qui défend quelle opinion dans plusieurs commentaires.

STRATEGIEN
• Kommentare lesen: jede Position in einem Satz zusammenfassen, dann den Sinn der Aussagen suchen, nicht gleiche Wörter. [fr?] Résumer chaque position, chercher le sens et non les mots.
• Protokollieren: nur Beschlüsse, Zahlen, Namen und Fristen notieren, sachlich und im Präsens. [fr?] Noter décisions, chiffres, noms et délais.
• Diskutieren: erst anerkennen, dann widersprechen; Vorschläge im Konjunktiv II machen. [fr?] Reconnaître avant de contredire ; proposer au Konjunktiv II.

NOCH NICHT SICHER?
${aide('Relativsätze mit „wer“, „was“ und „wo(r)“: Lesen Sie noch einmal die Regel im Modul „Gesellschaft“ und wiederholen Sie die Übungen. Redemittel: Lesen Sie das Modell von Fenja Rademacher laut. Satzstellung nach „meiner Meinung nach“: Machen Sie die Übung „Korrigieren“ noch einmal.', 'Relisez la règle du module Gesellschaft, lisez le modèle à voix haute et refaites l’exercice de correction.')}` } },
  ],
};
