// Module B2 n° 8 · atelier « Gesundheit » (lot R6). Conseiller de façon argumentée et discuter de la santé au travail :
// modèles annotés (courriel de conseil à un ami, intervention dans une réunion), réagir à des arguments enregistrés
// (-diskussion, 4 répétitions), médiation (simplifier une notice de médicament pour une colocataire qui débute en
// allemand), erreurs typiques, entraînement au format Hören (exposé avec prise de notes : l'assurance maladie en
// Allemagne), deux missions sur grille B2 (courriel de conseil argumenté, discussion simulée).
import { C2, aide, choice, fill, order, match, speakB2, GRIDS } from '../../lib.mjs';

export default {
  id: 'b2-gesundheit-atelier',
  title: 'Gesundheit – Werkstatt: begründet raten und mitdiskutieren',
  objective: 'Écrire un courriel de conseil argumenté (150 à 250 mots), défendre un point de vue dans une discussion sur la santé au travail, simplifier une notice de médicament pour une personne qui débute en allemand et s’entraîner au format Hören (exposé avec prise de notes).',
  grammarFocus: [],
  sources: [
    'Textes, dialogues et exercices originaux LinguaCap. Personnes et situations fictives ; la notice est inventée (aucun produit réel) et les informations sur l’assurance maladie sont simplifiées. Les conseils de santé ne remplacent pas un avis médical.',
  ],

  vocabulary: [
    { word: 'Ich kann gut verstehen, dass …', partOfSpeech: 'expression', translation: 'Je comprends bien que …',
      example: 'Ich kann gut verstehen, dass du nach diesem Jahr erschöpft bist.', note: 'verbe à la fin après dass' },
    { word: 'Für … spricht, dass …', partOfSpeech: 'expression', translation: 'Ce qui plaide pour …, c’est que …',
      example: 'Für die Auszeit spricht, dass du endlich abschalten könntest.', note: 'contraire : Gegen … spricht, dass …' },
    { word: 'Auf der anderen Seite …', partOfSpeech: 'expression', translation: 'D’un autre côté …',
      example: 'Auf der anderen Seite verdienst du in dieser Zeit nichts.', note: 'verbe juste après : Auf der anderen Seite verdienst du …' },
    { word: 'Ich würde dir raten, … zu …', partOfSpeech: 'expression', translation: 'Je te conseillerais de …',
      example: 'Ich würde dir raten, zuerst mit deiner Chefin zu sprechen.', note: 'raten + datif ; infinitif avec zu' },
    { word: 'Es wäre sinnvoll, … zu …', partOfSpeech: 'expression', translation: 'Il serait judicieux de …',
      example: 'Es wäre sinnvoll, die Regel zuerst drei Monate zu testen.', note: null },
    { word: 'Da ist etwas dran, aber …', partOfSpeech: 'expression', translation: 'Il y a du vrai, mais …',
      example: 'Da ist etwas dran, aber man muss auch die Kosten sehen.', note: 'familier mais courant en réunion' },
    { word: 'Ich sehe das etwas anders.', partOfSpeech: 'expression', translation: 'Je vois les choses un peu différemment.',
      example: 'Ich sehe das etwas anders als Herr Krull.', note: 'désaccord poli' },
    { word: 'Mein Vorschlag wäre …', partOfSpeech: 'expression', translation: 'Ma proposition serait …',
      example: 'Mein Vorschlag wäre, keine Mails nach 19 Uhr zu verschicken.', note: null },
    { word: 'auf etwas eingehen', partOfSpeech: 'verb', translation: 'revenir sur quelque chose, répondre à (un argument)',
      example: 'Ich möchte kurz auf Ihr Argument eingehen.', note: '+ accusatif ; séparable : ein|gehen' },
    { word: 'Einwand', article: 'der', plural: 'Einwände', partOfSpeech: 'noun', translation: 'l’objection',
      example: 'Ich verstehe Ihren Einwand, aber die Kosten sind gering.', note: 'einen Einwand erheben : faire une objection' },
    { word: 'Kompromiss', article: 'der', plural: 'Kompromisse', partOfSpeech: 'noun', translation: 'le compromis',
      example: 'Wir haben uns auf einen Kompromiss geeinigt.', note: 'einen Kompromiss finden, eingehen' },
    { word: 'Auszeit', article: 'die', plural: 'Auszeiten', partOfSpeech: 'noun', translation: 'la pause, le congé (pour souffler)',
      example: 'Sie überlegt, eine Auszeit von drei Monaten zu nehmen.', note: null },
    { word: 'Packungsbeilage', article: 'die', plural: 'Packungsbeilagen', partOfSpeech: 'noun', translation: 'la notice (d’un médicament)',
      example: 'Lesen Sie vor der Einnahme die Packungsbeilage.', note: 'familier : der Beipackzettel' },
    { word: 'Dosierung', article: 'die', plural: 'Dosierungen', partOfSpeech: 'noun', translation: 'la posologie',
      example: 'Halten Sie sich an die empfohlene Dosierung.', note: null },
    { word: 'Gegenanzeige', article: 'die', plural: 'Gegenanzeigen', partOfSpeech: 'noun', translation: 'la contre-indication',
      example: 'Unter „Gegenanzeigen“ steht, wer das Mittel nicht nehmen darf.', note: 'surtout au pluriel' },
    { word: 'Reaktionsvermögen', article: 'das', plural: null, partOfSpeech: 'noun', translation: 'la capacité de réaction, les réflexes',
      example: 'Das Mittel kann das Reaktionsvermögen beeinträchtigen.', note: 'sans pluriel' },
    { word: 'Krankenversicherung', article: 'die', plural: 'Krankenversicherungen', partOfSpeech: 'noun', translation: 'l’assurance maladie',
      example: 'In Deutschland ist die Krankenversicherung Pflicht.', note: 'gesetzlich / privat versichert sein' },
    { word: 'Beitrag', article: 'der', plural: 'Beiträge', partOfSpeech: 'noun', translation: 'la cotisation ; la contribution',
      example: 'Der Beitrag hängt vom Einkommen ab.', note: 'aussi : la contribution (Diskussionsbeitrag)' },
  ],

  media: [
    { key: 'b2-gesundheit-atelier-modell-audio', kind: 'audio', title: 'Modèle : une intervention dans une réunion d’équipe',
      script: [
        { voice: 'frau2', name: 'Frau Ebeling', text: 'Ich möchte kurz auf das eingehen, was Herr Krull gesagt hat. Er meint, jeder sei selbst schuld, wenn er abends noch Mails liest. Da ist sicher etwas dran: Niemand muss um elf Uhr nachts antworten.' },
        { voice: 'frau2', name: 'Frau Ebeling', text: 'Aber ich sehe das trotzdem etwas anders. Wer sieht, dass die Chefin um zehn Uhr abends schreibt, fühlt sich unter Druck, sodass er eben doch antwortet. Deshalb brauchen wir meiner Meinung nach eine klare Regel.' },
        { voice: 'frau2', name: 'Frau Ebeling', text: 'Mein Vorschlag wäre: keine Mails nach neunzehn Uhr, mit einer Ausnahme für echte Notfälle. Wir könnten das drei Monate lang testen und dann gemeinsam schauen, ob es etwas gebracht hat.' },
      ] },
    { key: 'b2-gesundheit-atelier-diskussion-satz1', kind: 'audio', title: 'Réunion : argument 1',
      script: [{ voice: 'mann2', name: 'Herr Krull', text: 'Ich verstehe die ganze Aufregung nicht. Wer abends noch Mails liest, ist selbst schuld. Niemand zwingt ihn dazu.' }] },
    { key: 'b2-gesundheit-atelier-diskussion-satz2', kind: 'audio', title: 'Réunion : argument 2',
      script: [{ voice: 'frau3', name: 'Frau Adeyemi', text: 'Ich schlage vor, dass wir ab nächstem Monat nach neunzehn Uhr keine Mails mehr verschicken. Was halten Sie davon?' }] },
    { key: 'b2-gesundheit-atelier-diskussion-satz3', kind: 'audio', title: 'Réunion : argument 3',
      script: [{ voice: 'mann3', name: 'Herr Vogelsang', text: 'Ein Ruheraum kostet Geld und Platz. Das Geld sollten wir lieber in neue Laptops stecken.' }] },
    { key: 'b2-gesundheit-atelier-diskussion-satz4', kind: 'audio', title: 'Réunion : argument 4',
      script: [{ voice: 'frau2', name: 'Frau Ebeling', text: 'Mir ist das alles zu theoretisch. Können wir nicht einfach etwas ausprobieren und dann schauen, ob es wirkt?' }] },
    { key: 'b2-gesundheit-atelier-mediation-beilage', kind: 'image', title: 'Notice : Baldrian-Dragees',
      alt: 'Notice d’un médicament à base de valériane : indications, posologie, mode et durée d’emploi, contre-indications, précautions, effets indésirables.',
      image: { layout: 'document', icon: 'pill', title: 'Baldrian-Dragees 450 mg', subtitle: 'Gebrauchsinformation: Information für Anwender · pflanzliches Arzneimittel',
        lines: [
          'Anwendungsgebiete: zur Besserung des Befindens bei nervöser Anspannung und bei Schlafstörungen.',
          'Dosierung: Jugendliche ab 12 Jahren und Erwachsene nehmen bei Schlafstörungen 1 Dragee eine halbe bis eine Stunde vor dem Schlafengehen ein, bei nervöser Anspannung bis zu 3-mal täglich 1 Dragee.',
          'Art der Anwendung: unzerkaut mit ausreichend Flüssigkeit, vorzugsweise einem Glas Wasser.',
          'Dauer der Anwendung: Da die Wirkung allmählich eintritt, wird eine regelmäßige Einnahme über 2 bis 4 Wochen empfohlen. Bessern sich die Beschwerden nach 2 Wochen nicht, suchen Sie einen Arzt auf.',
          'Gegenanzeigen: Überempfindlichkeit gegen Baldrian; Kinder unter 12 Jahren.',
          'Hinweis: Das Arzneimittel kann das Reaktionsvermögen beeinträchtigen, sodass die Fahrtüchtigkeit vermindert ist. Dies gilt verstärkt im Zusammenwirken mit Alkohol.',
          'Nebenwirkungen: sehr selten Magen-Darm-Beschwerden wie Übelkeit.',
        ] } },
    { key: 'b2-gesundheit-atelier-pruefung-audio', kind: 'audio', title: 'Exposé : l’assurance maladie en Allemagne',
      script: [
        { voice: 'sprecher', name: 'Moderator', text: 'Herzlich willkommen zu unserer Reihe „Neu in der Stadt“ hier in der Volkshochschule. Heute spricht die Sozialberaterin Doris Kämmerer über ein Thema, das alle betrifft: die Krankenversicherung. Frau Kämmerer, bitte.' },
        { pause: 0.8 },
        { voice: 'frau3', name: 'Doris Kämmerer', text: 'Vielen Dank. Ich beginne mit der wichtigsten Regel: In Deutschland muss jeder Mensch krankenversichert sein. Das ist Pflicht, und zwar für alle, die hier wohnen. Es gibt zwei Systeme, die gesetzliche und die private Krankenversicherung. Rund neun von zehn Menschen sind gesetzlich versichert, etwa einer von zehn privat.' },
        { voice: 'frau3', name: 'Doris Kämmerer', text: 'Schauen wir zuerst auf die gesetzliche Versicherung. Wer angestellt ist und nicht sehr viel verdient, ist automatisch gesetzlich versichert. Der Beitrag hängt vom Einkommen ab: Wer mehr verdient, zahlt mehr. Arbeitgeber und Beschäftigte teilen sich den Beitrag ungefähr zur Hälfte, und er wird direkt vom Lohn abgezogen.' },
        { voice: 'frau3', name: 'Doris Kämmerer', text: 'Ein großer Vorteil ist die Familienversicherung. Kinder und Ehepartner ohne oder mit nur geringem eigenem Einkommen sind kostenlos mitversichert. Für eine Familie mit nur einem Gehalt ist das ein enormer Unterschied. In der Praxis zeigen Sie Ihre Versichertenkarte, und die Praxis rechnet direkt mit der Krankenkasse ab. Sie selbst sehen in der Regel keine Rechnung.' },
        { voice: 'frau3', name: 'Doris Kämmerer', text: 'Ganz anders funktioniert die private Versicherung. Sie steht vor allem Selbstständigen, Beamtinnen und Beamten und Angestellten mit hohem Einkommen offen. Hier richtet sich der Beitrag nicht nach dem Einkommen, sondern nach dem Alter beim Eintritt, nach dem Gesundheitszustand und nach den gewählten Leistungen.' },
        { voice: 'frau3', name: 'Doris Kämmerer', text: 'Für junge, gesunde Menschen ist das oft günstiger, und manche Leistungen sind besser, zum Beispiel ein Einzelzimmer im Krankenhaus. Aber Vorsicht: Jede Person braucht einen eigenen Vertrag, auch die Kinder. Und im Alter können die Beiträge deutlich steigen.' },
        { voice: 'frau3', name: 'Doris Kämmerer', text: 'Außerdem bezahlen Privatversicherte die Arztrechnung oft zuerst selbst und reichen sie dann bei der Versicherung ein. Das Geld kommt also erst später zurück. Ein Wechsel zurück in die gesetzliche Versicherung ist nur in bestimmten Fällen möglich, für ältere Menschen meistens gar nicht mehr.' },
        { voice: 'frau3', name: 'Doris Kämmerer', text: 'Was heißt das nun für Sie? Mein Rat: Entscheiden Sie nicht nur nach dem Preis von heute. Denken Sie an Ihre Familienplanung und an Ihr Einkommen in zwanzig oder dreißig Jahren. Wer Kinder möchte und vielleicht einmal in Teilzeit arbeitet, fährt mit der gesetzlichen Versicherung häufig besser.' },
        { voice: 'frau3', name: 'Doris Kämmerer', text: 'Und noch ein praktischer Hinweis zum Schluss: Wer eine neue Stelle antritt, muss dem Arbeitgeber spätestens zwei Wochen nach Beginn mitteilen, bei welcher gesetzlichen Krankenkasse er versichert sein möchte. Die Kassen unterscheiden sich kaum bei den Pflichtleistungen, wohl aber beim Zusatzbeitrag und beim Service. Ein Vergleich lohnt sich also. Haben Sie Fragen? Dann gern jetzt.' },
      ] },
    { key: 'b2-gesundheit-atelier-schreiben-nachricht', kind: 'image', title: 'Le message de Hauke',
      alt: 'Message de Hauke : il travaille 55 heures par semaine, dort mal, a mal au dos ; on lui propose de diriger l’équipe ; il hésite à accepter ou à chercher un poste plus calme.',
      image: { layout: 'messages', title: 'Hauke', icon: 'message-circle', messages: [
        { side: 'left', text: 'Hey, ich brauche mal deinen Rat. Seit zwei Jahren arbeite ich in dem Start-up fast 55 Stunden pro Woche. Ich schlafe schlecht, und mein Rücken tut ständig weh.' },
        { side: 'left', text: 'Jetzt bietet mir meine Chefin die Teamleitung an: mehr Geld, aber noch mehr Verantwortung. Oder soll ich mir lieber eine ruhigere Stelle suchen, auch wenn sie schlechter bezahlt ist? Was meinst du?' },
      ] } },
    { key: 'b2-gesundheit-atelier-sprechen-positionen', kind: 'audio', title: 'Réunion : deux positions sur le budget santé',
      script: [
        { voice: 'frau2', name: 'Frau Ebeling', text: 'Wir haben für nächstes Jahr ein Budget von zwanzigtausend Euro für die Gesundheit im Team. Es gibt zwei Vorschläge. Herr Krull, bitte.' },
        { voice: 'mann2', name: 'Herr Krull', text: 'Ich bin klar für einen Sportkurs. Zweimal pro Woche eine Stunde Rückentraining während der Arbeitszeit, das tut allen gut. Und es zeigt, dass sich die Firma um uns kümmert.' },
        { voice: 'frau3', name: 'Frau Adeyemi', text: 'Ich halte das für Kosmetik. Unser eigentliches Problem sind die Überstunden. Solange jeder zehn Stunden am Tag arbeitet, hilft auch kein Rückentraining. Ich wäre dafür, mit dem Geld eine zusätzliche Teilzeitkraft einzustellen, sodass die Arbeit besser verteilt wird.' },
        { voice: 'frau2', name: 'Frau Ebeling', text: 'Danke. Und was meinen Sie? Wie sollten wir das Geld einsetzen?' },
      ] },
  ],

  activities: [
    // 1 · Modèles annotés
    { id: 'b2-gesundheit-atelier-modell', kind: 'lesson', title: 'Modell: begründet raten und in einer Besprechung Stellung nehmen', estimatedMinutes: 12,
      competences: ['lecture', 'ecoute'],
      lesson: { description: `MODELL: EINE E-MAIL MIT BEGRÜNDETEM RAT
[fr?] Modèle : un courriel de conseil argumenté
${aide('Svea ist nach einem anstrengenden Jahr erschöpft. Sie fragt ihren Freund Rasmus, ob sie eine Auszeit nehmen oder ihre Stunden reduzieren soll. Lesen Sie seine Antwort und achten Sie auf den Aufbau.', 'Svea est épuisée après une année difficile. Elle demande à son ami Rasmus si elle doit prendre un congé ou réduire son temps de travail. Lisez sa réponse et observez sa structure.')}

Betreff: Re: Auszeit – ja oder nein?
Liebe Svea,
vielen Dank für deine offene Nachricht. Ich kann gut verstehen, dass du nach diesem Jahr völlig erschöpft bist: zwei große Projekte gleichzeitig und dazu der Umzug, das war einfach zu viel.
Du fragst, ob du drei Monate unbezahlten Urlaub nehmen oder lieber deine Stunden reduzieren sollst. Für die Auszeit spricht, dass du endlich wirklich abschalten könntest. Drei Monate ohne Mails und Termine dürften dir mehr helfen als zwei Wochen Urlaub, nach denen alles wieder von vorn beginnt. Auf der anderen Seite verdienst du in dieser Zeit nichts, sodass du deine Ersparnisse aufbrauchen müsstest.
Ich würde dir deshalb raten, zuerst mit deiner Chefin über eine Lösung in Teilzeit zu sprechen. Mit 30 Stunden hättest du jede Woche einen freien Tag und könntest testen, ob dir das reicht. Außerdem kannst du deine Erholung planen, indem du diesen Tag ganz bewusst für Sport oder Freunde reservierst. Falls du nach drei Monaten merkst, dass es nicht besser wird, bleibt die Auszeit immer noch eine Option.
Egal, wie du dich entscheidest: Bitte sprich auch mit deiner Hausärztin. Erschöpfung ist kein Zeichen von Schwäche.
Melde dich, wenn du reden möchtest!
Liebe Grüße
Rasmus

AUFBAU
[fr?] Structure
1. ${aide('Bezug und Verständnis: auf die Nachricht reagieren, Gefühle ernst nehmen.', 'Reprendre le message et montrer sa compréhension.')}
2. ${aide('Die Frage aufgreifen: Welche Möglichkeiten gibt es?', 'Reformuler la question : quelles sont les options ?')}
3. ${aide('Abwägen: Argumente dafür und dagegen, mit Folgen („sodass …“).', 'Peser le pour et le contre, avec les conséquences (« sodass … »).')}
4. ${aide('Begründeter Rat: eine klare Empfehlung, ein konkreter Weg („indem …“), eine Alternative („falls …“).', 'Un conseil justifié : une recommandation claire, un moyen concret (« indem … »), une alternative (« falls … »).')}
5. ${aide('Schluss: Ermutigung und Angebot.', 'Conclusion : encouragement et proposition.')}

REDEMITTEL
[fr?] Formules utiles
• ${aide('Verständnis zeigen: Ich kann gut verstehen, dass … · Das klingt wirklich anstrengend.', 'Montrer sa compréhension.')}
• ${aide('Abwägen: Für … spricht, dass … · Dagegen spricht, dass … · Auf der anderen Seite …', 'Peser le pour et le contre.')}
• ${aide('Raten: Ich würde dir raten, … zu … · Es wäre sinnvoll, … zu … · An deiner Stelle würde ich …', 'Conseiller.')}
• ${aide('Schließen: Egal, wie du dich entscheidest, … · Melde dich, wenn …', 'Conclure.')}

MODELL: IN EINER BESPRECHUNG STELLUNG NEHMEN
[fr?] Modèle : prendre position en réunion
${aide('Im Team wird diskutiert, ob man nach Feierabend noch Mails lesen muss. Hören Sie den Beitrag von Frau Ebeling. Sie greift ein Argument auf, stimmt teilweise zu, widerspricht, begründet und macht einen Vorschlag.', 'L’équipe discute des courriels après le travail. Écoutez l’intervention de Mme Ebeling : elle reprend un argument, l’approuve en partie, objecte, justifie et propose.')}
• ${aide('Aufgreifen: Ich möchte kurz auf das eingehen, was … gesagt hat.', 'Reprendre l’argument de quelqu’un.')}
• ${aide('Teilweise zustimmen: Da ist sicher etwas dran, aber …', 'Approuver en partie.')}
• ${aide('Widersprechen: Ich sehe das trotzdem etwas anders.', 'Objecter poliment.')}
• ${aide('Vorschlagen: Mein Vorschlag wäre … · Wir könnten … testen und dann gemeinsam schauen, ob …', 'Proposer un compromis.')}` },
      placements: [{ media: 'b2-gesundheit-atelier-modell-audio', caption: 'Der Beitrag von Frau Ebeling' }] },

    // 2 · Réagir à des arguments
    { id: 'b2-gesundheit-atelier-diskussion', kind: 'exercise', title: 'Diskutieren: auf Argumente reagieren', estimatedMinutes: 12,
      competences: ['ecoute', 'expression-orale'],
      lesson: { description: `${C2.argument}

SITUATION
[fr?] La situation
${aide('In Ihrem Team wird über Stress und Erreichbarkeit diskutiert. Ihre Kolleginnen und Kollegen äußern sich. Hören Sie jedes Argument und wählen Sie die Reaktion, die sachlich und höflich ist und die Diskussion weiterbringt.', 'Votre équipe discute du stress et de la disponibilité. Écoutez chaque argument et choisissez la réaction factuelle, polie et constructive.')}
${aide('Sprechen Sie danach vier Reaktionen laut nach. Achten Sie auf die Betonung der wichtigen Wörter.', 'Répétez ensuite quatre réactions à voix haute, en accentuant les mots importants.')}` },
      placements: [
        { media: 'b2-gesundheit-atelier-diskussion-satz1', questionId: 'q1', transcriptVisibility: 'after_answer' },
        { media: 'b2-gesundheit-atelier-diskussion-satz2', questionId: 'q2', transcriptVisibility: 'after_answer' },
        { media: 'b2-gesundheit-atelier-diskussion-satz3', questionId: 'q3', transcriptVisibility: 'after_answer' },
        { media: 'b2-gesundheit-atelier-diskussion-satz4', questionId: 'q4', transcriptVisibility: 'after_answer' },
      ],
      questions: [
        choice('q1', aide('Argument 1 (Herr Krull): Was antworten Sie?', 'Argument 1 : que répondez-vous ?'),
          [['Da haben Sie recht, abends sollte man sogar noch mehr Mails lesen.'],
            ['Ganz so einfach ist es nicht: Viele haben Angst, etwas zu verpassen.', true],
            ['Das ist mir egal, ich lese abends sowieso nie dienstliche Mails.'],
            ['Sie sind wohl selbst schuld, dass Sie das Problem nicht verstehen.']],
          aide('Die passende Reaktion widerspricht sachlich und nennt ein Gegenargument (Angst, etwas zu verpassen). Die erste Antwort stimmt unlogisch zu, die dritte weicht aus, die vierte greift die Person an statt des Arguments.',
            'Objecter avec un argument, sans attaquer la personne.')),
        choice('q2', aide('Argument 2 (Frau Adeyemi): Was antworten Sie?', 'Argument 2 : que répondez-vous ?'),
          [['Nach 19 Uhr schreibe ich sowieso nichts, mich betrifft das nicht.'],
            ['Das geht auf keinen Fall, so etwas hat es bei uns noch nie gegeben.'],
            ['Grundsätzlich gut, aber wir brauchen eine Ausnahme für Notfälle.', true],
            ['Warum fragen Sie ausgerechnet mich? Dafür bin ich nicht zuständig.']],
          aide('Frau Adeyemi fragt nach Ihrer Meinung. Eine konstruktive Antwort stimmt grundsätzlich zu und ergänzt eine Bedingung. „Das hat es noch nie gegeben“ ist kein Argument, und die anderen Antworten weichen der Frage aus.',
            'Approuver le principe en ajoutant une condition.')),
        choice('q3', aide('Argument 3 (Herr Vogelsang): Was antworten Sie?', 'Argument 3 : que répondez-vous ?'),
          [['Ich verstehe den Einwand, aber gesunde Leute kosten weniger als Krankmeldungen.', true],
            ['Neue Laptops brauchen wir nicht, die alten funktionieren doch noch ganz gut.'],
            ['Ruheräume finde ich langweilig, da möchte ich mich bestimmt nicht hinlegen.'],
            ['Sie wollen also, dass wir alle krank werden? Das finde ich unglaublich.']],
          aide('Die beste Reaktion erkennt den Einwand an („Ich verstehe den Einwand“) und antwortet mit einem Argument auf derselben Ebene: Kosten. Die zweite Antwort reagiert nur auf die Laptops, die dritte ist rein persönlich, die vierte unterstellt etwas, was er nicht gesagt hat.',
            'Reconnaître l’objection, puis répondre sur le même terrain (les coûts).')),
        choice('q4', aide('Argument 4 (Frau Ebeling): Was antworten Sie?', 'Argument 4 : que répondez-vous ?'),
          [['Nein, ausprobieren ist unnötig, wir sollten lieber noch länger reden.'],
            ['Theorie ist immer besser als Praxis, das weiß doch jeder hier im Team.'],
            ['Ich kann leider nichts ausprobieren, weil ich bald im Urlaub bin.'],
            ['Gute Idee. Wir testen die Regel drei Monate und werten sie dann aus.', true]],
          aide('Frau Ebeling schlägt einen Test vor. Die passende Antwort nimmt den Vorschlag auf und macht ihn konkret (Dauer, Auswertung). Die anderen Antworten lehnen ohne Grund ab, verallgemeinern oder bleiben persönlich.',
            'Reprendre la proposition et la rendre concrète.')),
        speakB2('q5', 'Ganz so einfach ist es nicht. Viele haben Angst, etwas Wichtiges zu verpassen.',
          aide('Widerspruch ohne Angriff: „Ganz so einfach ist es nicht.“ Betonen Sie „so einfach“ und „Angst“. Im Infinitivsatz steht „zu“ direkt vor „verpassen“.',
            'Accent sur « so einfach » et « Angst ».')),
        speakB2('q6', 'Das finde ich grundsätzlich gut, aber wir brauchen eine Ausnahme für echte Notfälle.',
          aide('Zustimmung mit Einschränkung: Die Stimme steigt leicht bei „grundsätzlich gut“ und fällt am Satzende. „Notfälle“: langes, betontes o.',
            'Approbation nuancée : « grundsätzlich » = en principe.')),
        speakB2('q7', 'Ich verstehe den Einwand, aber gesunde Mitarbeitende sind auf Dauer billiger als Krankmeldungen.',
          aide('„Einwand“ wird auf der ersten Silbe betont: EIN-wand. „Auf Dauer“ heißt langfristig. Machen Sie nach „Einwand“ eine kurze Pause.',
            'Accent sur la première syllabe de « Einwand » ; « auf Dauer » = à long terme.')),
        speakB2('q8', 'Wie wäre es, wenn wir die Regel drei Monate testen und danach gemeinsam auswerten?',
          aide('Vorschlag als Frage: „Wie wäre es, wenn …?“ Im wenn-Satz stehen die Verben am Ende (testen, auswerten). Die Stimme steigt am Ende leicht.',
            'Proposer sous forme de question ; verbes à la fin après « wenn ».'),
          ['Wie wäre es, wenn wir die Regel drei Monate testen und danach gemeinsam auswerten?', 'Wie wäre es, wenn wir die Regel 3 Monate testen und danach gemeinsam auswerten?']),
      ] },

    // 3 · Médiation : simplifier une notice
    { id: 'b2-gesundheit-atelier-mediation', kind: 'exercise', title: 'Vermitteln: eine Packungsbeilage einfach erklären', estimatedMinutes: 16,
      competences: ['lecture', 'expression-ecrite'],
      lesson: { description: `SITUATION
[fr?] La situation
${aide('Ihre Mitbewohnerin Ilinca lernt seit einem Jahr Deutsch (Niveau A2). Wegen ihrer Prüfungen schläft sie schlecht und hat in der Apotheke pflanzliche Tabletten gekauft. Die Packungsbeilage versteht sie nicht. Erklären Sie ihr in einfachem Deutsch, was wichtig ist.', 'Votre colocataire Ilinca apprend l’allemand depuis un an (A2). Stressée par ses examens, elle dort mal et a acheté des comprimés à base de plantes. Elle ne comprend pas la notice : expliquez-lui l’essentiel en allemand simple.')}

DIE PACKUNGSBEILAGE
[fr?] La notice
Baldrian-Dragees 450 mg · pflanzliches Arzneimittel
Anwendungsgebiete: zur Besserung des Befindens bei nervöser Anspannung und bei Schlafstörungen.
Dosierung: Jugendliche ab 12 Jahren und Erwachsene nehmen bei Schlafstörungen 1 Dragee eine halbe bis eine Stunde vor dem Schlafengehen ein, bei nervöser Anspannung bis zu 3-mal täglich 1 Dragee.
Art der Anwendung: unzerkaut mit ausreichend Flüssigkeit, vorzugsweise einem Glas Wasser.
Dauer der Anwendung: Da die Wirkung allmählich eintritt, wird eine regelmäßige Einnahme über 2 bis 4 Wochen empfohlen. Bessern sich die Beschwerden nach 2 Wochen nicht, suchen Sie einen Arzt auf.
Gegenanzeigen: Überempfindlichkeit gegen Baldrian; Kinder unter 12 Jahren.
Hinweis: Das Arzneimittel kann das Reaktionsvermögen beeinträchtigen, sodass die Fahrtüchtigkeit vermindert ist. Dies gilt verstärkt im Zusammenwirken mit Alkohol.
Nebenwirkungen: sehr selten Magen-Darm-Beschwerden wie Übelkeit.

STRATEGIE: EINFACH ERKLÄREN
[fr?] Stratégie : expliquer simplement
• ${aide('Fachwörter ersetzen: „Anwendungsgebiete“ → Wofür ist das Mittel?', 'Remplacer les termes techniques par des questions simples.')}
• ${aide('Kurze Sätze, Verben statt Nomen: „bei regelmäßiger Einnahme“ → wenn du sie jeden Tag nimmst.', 'Phrases courtes, verbes plutôt que noms.')}
• ${aide('Nur das Wichtige für diese Person: Was muss Ilinca wissen, um das Mittel richtig zu nehmen?', 'Ne garder que ce qui compte pour cette personne.')}` },
      placements: [{ media: 'b2-gesundheit-atelier-mediation-beilage', caption: 'Die Packungsbeilage' }],
      questions: [
        fill('q1', aide('Ergänzen Sie die Notizen für Ilinca in einfachem Deutsch.', 'Complétez les notes pour Ilinca, en allemand simple.'),
          'Wofür? Wenn du schlecht schläfst oder sehr [[1]] bist. · Wann? Eine halbe bis eine [[2]] vor dem Schlafen. · Wie? Nicht [[3]], mit einem Glas Wasser. · Wie lange? Jeden Tag, zwei bis vier [[4]]. · Zum Arzt, wenn es nach [[5]] Wochen nicht besser ist.',
          [['nervös', 'angespannt', 'gestresst'], ['Stunde'], ['kauen', 'zerkauen'], ['Wochen'], ['zwei', '2']],
          aide('„Nervöse Anspannung“ wird zu „nervös“ (oder „angespannt“). „Unzerkaut“ heißt: nicht kauen, ganz schlucken. Die Wirkung braucht Zeit: zwei bis vier Wochen jeden Tag. Wenn es nach zwei Wochen nicht besser ist, soll Ilinca zum Arzt gehen.',
            'unzerkaut = sans croquer ; la valériane agit lentement.')),
        choice('q2', aide('Ilinca fragt: „Kann ich am Samstag nach der Party eine Tablette nehmen und dann mit dem Auto nach Hause fahren?“ Was antworten Sie?', 'Ilinca demande si elle peut prendre un comprimé après la fête puis rentrer en voiture. Que répondez-vous ?'),
          [['Ja, das Mittel ist ja pflanzlich, da kann gar nichts passieren.'],
            ['Lieber nicht: Es kann müde machen, mit Alkohol noch mehr. Fahr nicht.', true],
            ['Ja, aber nur, wenn du vorher noch etwas Richtiges gegessen hast.'],
            ['Nein, die Tabletten darf man am Wochenende grundsätzlich nicht nehmen.']],
          aide('Der Hinweis sagt: Das Mittel kann das Reaktionsvermögen beeinträchtigen, „verstärkt im Zusammenwirken mit Alkohol“. „Pflanzlich“ heißt nicht „ohne Wirkung“. Vom Essen oder vom Wochenende steht nichts in der Beilage.',
            'Plante ne veut pas dire sans effet : prudence au volant, surtout avec de l’alcool.')),
        match('q3', aide('Welche einfache Frage erklärt das Fachwort? Ordnen Sie zu.', 'Quelle question simple explique le terme technique ? Associez.'),
          [['Anwendungsgebiete', 'Wofür ist das Mittel?'], ['Dosierung', 'Wie viel nimmt man?'], ['Gegenanzeigen', 'Wer darf es nicht nehmen?'],
            ['Nebenwirkungen', 'Welche Probleme kann es geben?'], ['unzerkaut', 'Wie schluckt man die Tablette?']],
          aide('Eine Packungsbeilage folgt immer derselben Ordnung. Wer die Rubriken in einfache Fragen übersetzt, kann sie jedem erklären: Wofür? Wie viel? Wer nicht? Welche Probleme? Wie einnehmen?',
            'Rubriques de la notice : indications, posologie, contre-indications, effets indésirables, mode d’emploi.')),
        choice('q4', aide('Ilinca ist enttäuscht: „Ich habe gestern eine genommen und trotzdem schlecht geschlafen.“ Was erklären Sie ihr?', 'Ilinca est déçue : elle a mal dormi malgré un comprimé. Que lui expliquez-vous ?'),
          [['Dann hast du zu wenig genommen. Nimm heute einfach drei auf einmal.'],
            ['Dann wirkt es bei dir nicht. Du musst sofort zu einem Arzt gehen.'],
            ['Das ist normal: Die Wirkung kommt langsam, nach zwei bis vier Wochen.', true],
            ['Das liegt daran, dass man die Tabletten nur morgens nehmen darf.']],
          aide('„Da die Wirkung allmählich eintritt …“: allmählich heißt langsam, nach und nach. Drei Tabletten auf einmal widersprechen der Dosierung, und zum Arzt soll sie erst, wenn es nach zwei Wochen nicht besser ist.',
            'allmählich = progressivement ; l’effet n’est pas immédiat.')),
        order('q5', aide('Erklären Sie Ilinca die Regel in einem einfachen Satz. Bilden Sie den Satz.', 'Expliquez la règle à Ilinca en une phrase simple. Remettez les mots dans l’ordre.'),
          [['Wenn', 'es', 'nach zwei Wochen', 'nicht', 'besser', 'ist,', 'solltest', 'du', 'zum Arzt', 'gehen.']],
          aide('Aus dem Amtsdeutsch „Bessern sich die Beschwerden nach 2 Wochen nicht, suchen Sie einen Arzt auf“ wird ein einfacher Satz mit „wenn“ und „solltest“. Im wenn-Satz steht „ist“ am Ende, danach folgen „solltest du“ und der Infinitiv „gehen“.',
            'Une condition simple avec « wenn », puis un conseil avec « solltest ».')),
        choice('q6', aide('„Das Arzneimittel kann das Reaktionsvermögen beeinträchtigen.“ Welche Vereinfachung ist richtig?', 'Quelle simplification est juste ?'),
          [['Du reagierst vielleicht langsamer als sonst.', true], ['Du kannst danach viel schneller reagieren.'], ['Das Mittel reagiert mit anderen Mitteln.'],
            ['Du darfst danach gar nichts mehr essen.']],
          aide('„Beeinträchtigen“ heißt verschlechtern, stören. Das Reaktionsvermögen ist die Fähigkeit, schnell zu reagieren. Gemeint ist also: Man reagiert vielleicht langsamer. Von Wechselwirkungen mit anderen Mitteln oder vom Essen ist hier nicht die Rede.',
            'beeinträchtigen = altérer ; on peut réagir plus lentement.')),
      ] },

    // 4 · Erreurs typiques
    { id: 'b2-gesundheit-atelier-korrektur', kind: 'exercise', title: 'Korrigieren: typische Fehler beim Raten und Vermuten', estimatedMinutes: 10,
      competences: ['lecture', 'expression-ecrite'],
      lesson: { description: `${aide('Diese Sätze stammen aus E-Mails von Kursteilnehmenden. Finden Sie die richtige Form.', 'Ces phrases viennent de courriels d’apprenants. Trouvez la forme correcte.')}

KORREKTURZEICHEN
[fr?] Les codes de correction
${aide('St = Stellung im Satz · G = Grammatik · W = Wortschatz · R = Rechtschreibung · A = Register (du oder Sie)', 'St = place des mots ; G = grammaire ; W = vocabulaire ; R = orthographe ; A = registre')}` },
      questions: [
        order('q1', aide('St: Bilden Sie den Satz richtig.', 'St : remettez les mots dans le bon ordre.'),
          [['Ich', 'habe', 'mich', 'letzte Woche', 'so', 'müde', 'gefühlt,', 'dass', 'ich', 'früh', 'ins Bett', 'gegangen', 'bin.']],
          aide('Im Perfekt steht das Partizip „gefühlt“ am Ende des Hauptsatzes, also vor dem Komma, und „so“ direkt vor dem Adjektiv. Im dass-Satz steht das Hilfsverb „bin“ ganz am Ende. Typischer Fehler: „Ich habe mich gefühlt so müde …“ nach französischem Muster.',
            'Le participe « gefühlt » ferme la principale ; « so » précède l’adjectif.')),
        hints(fill('q2', aide('G: Ergänzen Sie den Infinitiv mit „zu“.', 'G : complétez avec l’infinitif précédé de « zu ».'),
          'Ich rate dir, abends weniger [[1]]. · Es ist wichtig, regelmäßig Pausen [[2]].',
          [['zu arbeiten'], ['einzulegen']],
          aide('Nach „raten“ und nach „Es ist wichtig“ folgt ein Infinitiv mit „zu“ am Satzende. Bei trennbaren Verben steht „zu“ zwischen Präfix und Verb und wird zusammengeschrieben: einzulegen.',
            'Avec un verbe séparable, « zu » s’insère : einzulegen.')),
        'arbeiten', 'einlegen'),
        hints(fill('q3', aide('G: Ergänzen Sie das Reflexivpronomen.', 'G : complétez avec le pronom réfléchi.'),
          'Nach dem Urlaub habe ich [[1]] gut erholt. · Du musst [[2]] mehr ausruhen.',
          [['mich'], ['dich']],
          aide('„Sich erholen“ und „sich ausruhen“ sind reflexiv: ich erhole mich, du ruhst dich aus. Ohne Pronomen ist der Satz falsch, auch wenn das französische Verb „se reposer“ es leicht vergessen lässt.',
            'Verbes pronominaux : ne pas oublier mich / dich.')),
        'sich erholen', 'sich ausruhen'),
        fill('q4', aide('W: Ergänzen Sie die Präposition.', 'W : complétez avec la préposition.'),
          'Viele Studierende leiden [[1]] Schlafmangel. · Ich habe mich [[2]] der Grippe noch nicht ganz erholt.',
          [['unter'], ['von']],
          aide('„Leiden unter“ + Dativ für eine belastende Situation, „sich erholen von“ + Dativ. Französisch „souffrir de“ und „se remettre de“ verleiten zu „von“ in beiden Sätzen.',
            'souffrir de → leiden unter ; se remettre de → sich erholen von.')),
        choice('q5', aide('G: Sie vermuten, dass Ihr Kollege gestern krank war. Welcher Satz ist richtig?', 'G : vous supposez que votre collègue était malade hier. Quelle phrase est correcte ?'),
          [['Er durfte gestern krank sein.'], ['Er dürfte gestern krank gewesen sein.', true], ['Er dürfte gestern krank sein gewesen.'],
            ['Er hat gestern krank sein dürfen.']],
          aide('Vermutung über die Vergangenheit: „dürfte“ (Konjunktiv II) + Partizip II + „sein“ am Ende. „Durfte“ (Präteritum) und „hat … dürfen“ drücken eine Erlaubnis aus, und „sein gewesen“ ist die falsche Reihenfolge.',
            'Supposition sur le passé : dürfte + gewesen sein.')),
        choice('q6', aide('St: Welcher Satz ist richtig?', 'St : quelle phrase est correcte ?'),
          [['Je mehr ich arbeite, desto ich bin müder.'], ['Je mehr arbeite ich, desto müder bin ich.'], ['Je mehr ich arbeite, umso müder ich bin.'],
            ['Je mehr ich arbeite, desto müder bin ich.', true]],
          aide('Im je-Satz steht das Verb am Ende (arbeite). Nach „desto“ oder „umso“ folgen der Komparativ und sofort das konjugierte Verb: desto müder bin ich.',
            'je + verbe à la fin ; desto/umso + comparatif + verbe.')),
      ] },

    // 5 · Entraînement au format : Hören (exposé et prise de notes)
    { id: 'b2-gesundheit-atelier-pruefung', kind: 'exercise', title: 'Prüfungstraining: einen Vortrag hören und Notizen machen', estimatedMinutes: 20,
      competences: ['ecoute'],
      lesson: { description: `PRÜFUNGSTRAINING HÖREN
[fr?] Entraînement à l’examen : écoute
${aide('Sie hören einen Vortrag in einer Volkshochschule über die Krankenversicherung in Deutschland. Machen Sie beim Hören Notizen und beantworten Sie dann die Fragen.', 'Vous entendez un exposé sur l’assurance maladie en Allemagne. Prenez des notes pendant l’écoute, puis répondez aux questions.')}

ZEIT
[fr?] Temps
${aide('Etwa 20 Minuten: zwei Minuten, um die Aufgaben zu lesen, dann der Vortrag (etwa drei Minuten), Zeit zum Ergänzen und ein zweites Hören.', 'Environ 20 minutes : deux minutes de lecture des questions, l’exposé (trois minutes environ), le temps de compléter, puis une seconde écoute.')}

STRATEGIE
[fr?] Stratégie
1. ${aide('Trainieren Sie wie in einer Prüfung: Machen Sie Ihre Notizen möglichst schon beim ersten Hören.', 'Entraînez-vous comme à l’examen : prenez vos notes dès la première écoute.')}
2. ${aide('Ein Vortrag ist gegliedert: Achten Sie auf Signale wie „zuerst“, „ganz anders“, „aber Vorsicht“, „zum Schluss“.', 'Un exposé est structuré : repérez « zuerst », « ganz anders », « aber Vorsicht », « zum Schluss ».')}
3. ${aide('Achten Sie besonders auf Zahlen, Gegensätze und Ratschläge: Hier liegen die Antworten.', 'Soyez attentif aux nombres, aux oppositions et aux conseils : c’est là que sont les réponses.')}` },
      placements: [{ media: 'b2-gesundheit-atelier-pruefung-audio', caption: 'Vortrag: Gesetzlich oder privat?' }],
      questions: [
        fill('q1', C2.notizen,
          'Krankenversicherung ist für alle [[1]] · gesetzlich versichert: etwa neun von [[2]] Menschen · Beitrag (gesetzlich) hängt vom [[3]] ab · Familienversicherung: Kinder und Ehepartner ohne eigenes Einkommen sind [[4]] mitversichert',
          [['Pflicht'], ['zehn', '10'], ['Einkommen'], ['kostenlos', 'beitragsfrei', 'gratis']],
          aide('„In Deutschland muss jeder Mensch krankenversichert sein. Das ist Pflicht.“ „Rund neun von zehn Menschen sind gesetzlich versichert.“ „Der Beitrag hängt vom Einkommen ab.“ Kinder und Ehepartner ohne (oder mit nur geringem) Einkommen sind „kostenlos mitversichert“.',
            'die Pflicht : l’obligation ; kostenlos : gratuitement.')),
        fill('q2', C2.notizen,
          'privat: Beitrag nach Eintrittsalter, [[1]] und Leistungen · jede Person braucht einen eigenen [[2]] · Arztrechnung: zuerst selbst [[3]], dann einreichen · neue Stelle: Krankenkasse spätestens [[4]] Wochen nach Beginn mitteilen',
          [['Gesundheitszustand', 'Gesundheit'], ['Vertrag'], ['bezahlen', 'zahlen'], ['zwei', '2']],
          aide('Der private Beitrag richtet sich „nach dem Alter beim Eintritt, nach dem Gesundheitszustand und nach den gewählten Leistungen“. „Jede Person braucht einen eigenen Vertrag.“ Privatversicherte „bezahlen die Arztrechnung oft zuerst selbst“. Die Kasse teilt man dem Arbeitgeber „spätestens zwei Wochen nach Beginn“ mit.',
            'der Gesundheitszustand : l’état de santé ; der Vertrag : le contrat.')),
        choice('q3', aide('Was nennt die Referentin als Vorteil der privaten Versicherung?', 'Quel avantage de l’assurance privée l’intervenante cite-t-elle ?'),
          [['Die Kinder sind dort ohne Beitrag mitversichert.'], ['Die Beiträge sinken mit zunehmendem Alter.'],
            ['Für Junge und Gesunde ist sie oft günstiger.', true], ['Man bekommt beim Arzt nie eine Rechnung.']],
          aide('„Für junge, gesunde Menschen ist das oft günstiger.“ Die anderen Aussagen gelten gerade nicht: Jede Person braucht einen eigenen Vertrag, die Beiträge können im Alter steigen, und Privatversicherte bezahlen die Rechnung oft zuerst selbst.',
            'Les autres propositions décrivent l’assurance publique ou sont fausses.')),
        choice('q4', aide('Welchen Rat gibt die Referentin?', 'Quel conseil l’intervenante donne-t-elle ?'),
          [['Bei der Wahl auch an Zukunft und Familie denken.', true], ['Immer die heute günstigste Versicherung wählen.'],
            ['Als junger Mensch unbedingt privat versichern.'], ['Die Krankenkasse jedes Jahr wechseln, um zu sparen.']],
          aide('„Entscheiden Sie nicht nur nach dem Preis von heute. Denken Sie an Ihre Familienplanung und an Ihr Einkommen in zwanzig oder dreißig Jahren.“ Einen jährlichen Wechsel empfiehlt sie nicht, nur einen Vergleich vor der Wahl.',
            'Penser à l’avenir et à la famille, pas seulement au prix actuel.')),
        choice('q5', aide('Was sagt die Referentin über die gesetzlichen Krankenkassen?', 'Que dit-elle des caisses publiques ?'),
          [['Ihre Pflichtleistungen sind ganz unterschiedlich.'], ['Sie sind für alle Selbstständigen streng verboten.'],
            ['Sie bezahlen gar keine Behandlung im Krankenhaus.'], ['Sie unterscheiden sich bei Zusatzbeitrag und Service.', true]],
          aide('„Die Kassen unterscheiden sich kaum bei den Pflichtleistungen, wohl aber beim Zusatzbeitrag und beim Service.“ „Kaum“ heißt fast nicht: Die erste Aussage ist also falsch. Von einem Verbot für Selbstständige ist keine Rede.',
            'kaum = presque pas ; « wohl aber » = mais bien.')),
        choice('q6', aide('Warum ist die Familienversicherung laut Vortrag so wichtig?', 'Pourquoi l’assurance familiale est-elle si importante selon l’exposé ?'),
          [['Weil sie nur für Familien mit sehr hohem Einkommen gilt.'], ['Weil sie Familien mit nur einem Gehalt stark entlastet.', true],
            ['Weil man mit ihr jedes Jahr die Krankenkasse wechseln kann.'], ['Weil sie die Arztrechnungen zuerst selbst bezahlt.']],
          aide('„Für eine Familie mit nur einem Gehalt ist das ein enormer Unterschied“: Die Angehörigen kosten keinen zusätzlichen Beitrag. Mit dem Einkommen der Familie oder einem Kassenwechsel hat die Familienversicherung nichts zu tun.',
            'Elle soulage les familles qui vivent d’un seul salaire.')),
      ] },

    // 6 · Mission écrite
    { id: 'b2-gesundheit-atelier-schreiben', kind: 'mission', title: 'Mission: einem Freund begründet raten', estimatedMinutes: 28,
      competences: ['expression-ecrite'],
      lesson: { description: `SITUATION
[fr?] La situation
${aide('Ihr Freund Hauke hat Ihnen geschrieben. Er arbeitet sehr viel, schläft schlecht und muss eine wichtige Entscheidung treffen.', 'Votre ami Hauke vous a écrit. Il travaille énormément, dort mal et doit prendre une décision importante.')}

DIE NACHRICHT VON HAUKE
[fr?] Le message de Hauke
Hey, ich brauche mal deinen Rat. Seit zwei Jahren arbeite ich in dem Start-up fast 55 Stunden pro Woche. Ich schlafe schlecht, und mein Rücken tut ständig weh.
Jetzt bietet mir meine Chefin die Teamleitung an: mehr Geld, aber noch mehr Verantwortung. Oder soll ich mir lieber eine ruhigere Stelle suchen, auch wenn sie schlechter bezahlt ist? Was meinst du?

SO GEHEN SIE VOR
[fr?] Démarche
1. ${aide('Planen (5 Minuten): Sammeln Sie je zwei Argumente für beide Möglichkeiten. Was raten Sie ihm, und warum?', 'Planifier (5 minutes) : deux arguments pour chaque option ; quel conseil, et pourquoi ?')}
2. ${aide('Schreiben (18 Minuten): Folgen Sie dem Aufbau aus Rasmus’ E-Mail.', 'Écrire (18 minutes) : suivez la structure du courriel de Rasmus.')}
3. ${aide('Prüfen (5 Minuten): Lesen Sie Ihren Text mit der Checkliste. Achten Sie besonders auf die Verbstellung nach „indem“, „sodass“ und „dass“.', 'Vérifier (5 minutes) : relisez avec la liste ; attention à la place du verbe après indem, sodass, dass.')}` },
      placements: [{ media: 'b2-gesundheit-atelier-schreiben-nachricht', caption: 'Haukes Nachricht' }],
      mission: {
        oral: null,
        written: { prompt: aide('Antworten Sie Hauke mit einer E-Mail (150 bis 250 Wörter). Zeigen Sie Verständnis für seine Situation. Wägen Sie die Vor- und Nachteile beider Möglichkeiten ab. Geben Sie ihm einen klaren, begründeten Rat und schlagen Sie einen konkreten Schritt vor. Beenden Sie die E-Mail mit einer Ermutigung.',
          'Répondez à Hauke par un courriel de 150 à 250 mots : montrez votre compréhension, pesez le pour et le contre des deux options, donnez un conseil clair et justifié avec une étape concrète, terminez par un encouragement.'),
          maxChars: 2400, minWords: 150 },
        checklist: [
          aide('Ich zeige Verständnis und beziehe mich auf seine Nachricht.', 'Je montre ma compréhension et je reprends son message.'),
          aide('Ich nenne Vor- und Nachteile beider Möglichkeiten.', 'Je donne le pour et le contre des deux options.'),
          aide('Mein Rat ist klar und begründet („Ich würde dir raten, … zu …“).', 'Mon conseil est clair et justifié.'),
          aide('Ich verwende „indem“, „sodass“ oder eine Vermutung mit „dürfte“.', 'J’emploie indem, sodass ou une supposition avec dürfte.'),
          aide('Anrede, Absätze und Gruß passen zu einer persönlichen E-Mail (du).', 'Salutation, paragraphes et formule finale d’un courriel personnel (tutoiement).'),
        ],
        criteria: [
          { ...GRIDS.b2.schreiben[0], label: aide('Aufgabe: Verständnis, Vor- und Nachteile beider Möglichkeiten, klarer Rat mit konkretem Schritt, persönlicher Ton (du)', 'Tâche : compréhension, pour et contre, conseil concret, tutoiement') },
          ...GRIDS.b2.schreiben.slice(1),
        ],
      } },

    // 7 · Mission orale : discussion simulée
    { id: 'b2-gesundheit-atelier-sprechen', kind: 'mission', title: 'Mission: in einer Teambesprechung mitdiskutieren', estimatedMinutes: 20,
      competences: ['expression-orale'],
      lesson: { description: `SITUATION
[fr?] La situation
${aide('Ihre Firma hat für das nächste Jahr 20 000 Euro für die Gesundheit Ihres Teams. In der Teambesprechung gibt es zwei Vorschläge. Hören Sie die Aufnahme und nehmen Sie dann Stellung.', 'Votre entreprise dispose de 20 000 euros pour la santé de votre équipe l’an prochain. En réunion, deux propositions s’affrontent. Écoutez l’enregistrement, puis prenez position.')}

DIE VORSCHLÄGE
[fr?] Les propositions
• ${aide('Herr Krull: zweimal pro Woche Rückentraining während der Arbeitszeit, weil es allen guttut und zeigt, dass sich die Firma kümmert.', 'M. Krull : renforcement du dos deux fois par semaine pendant le temps de travail.')}
• ${aide('Frau Adeyemi: eine zusätzliche Teilzeitkraft einstellen, weil die Überstunden das eigentliche Problem sind.', 'Mme Adeyemi : embaucher un renfort à temps partiel, car le vrai problème, ce sont les heures supplémentaires.')}

IHR BEITRAG
[fr?] Votre intervention
• ${aide('Gehen Sie auf beide Vorschläge ein: Was finden Sie überzeugend, was nicht?', 'Revenez sur les deux propositions : qu’est-ce qui vous convainc, qu’est-ce qui ne vous convainc pas ?')}
• ${aide('Sagen Sie Ihre eigene Meinung und begründen Sie sie mit mindestens zwei Argumenten.', 'Donnez votre avis et justifiez-le avec au moins deux arguments.')}
• ${aide('Reagieren Sie auf einen möglichen Einwand und machen Sie einen Kompromissvorschlag.', 'Répondez à une objection possible et proposez un compromis.')}

VORBEREITUNG
[fr?] Préparation
${aide('Hören Sie noch einmal das Modell von Frau Ebeling. Überlegen Sie sich Stichwörter, aber sprechen Sie frei, etwa zwei bis drei Minuten.', 'Réécoutez le modèle de Mme Ebeling. Préparez des mots-clés, mais parlez librement, deux à trois minutes environ.')}` },
      placements: [{ media: 'b2-gesundheit-atelier-sprechen-positionen', caption: 'Teambesprechung: zwei Vorschläge' }],
      mission: {
        oral: { prompt: aide('Nehmen Sie in der Teambesprechung Stellung (zwei bis drei Minuten). Gehen Sie auf die Vorschläge von Herrn Krull und Frau Adeyemi ein, sagen Sie begründet, wie Sie das Budget einsetzen würden, reagieren Sie auf einen Einwand und schlagen Sie einen Kompromiss vor.',
          'Prenez position en réunion (deux à trois minutes) : revenez sur les deux propositions, dites de façon argumentée comment utiliser le budget, répondez à une objection et proposez un compromis.'),
          maxSeconds: 180 },
        written: null,
        checklist: [
          aide('Ich greife beide Vorschläge auf („Herr Krull meint, …“).', 'Je reprends les deux propositions.'),
          aide('Ich begründe meine Meinung mit zwei Argumenten.', 'Je justifie mon avis par deux arguments.'),
          aide('Ich stimme teilweise zu und widerspreche höflich („Da ist etwas dran, aber …“).', 'J’approuve en partie et j’objecte poliment.'),
          aide('Ich mache einen konkreten Kompromissvorschlag.', 'Je propose un compromis concret.'),
        ],
        criteria: [
          { ...GRIDS.b2.sprechen[0], label: aide('Aufgabe: beide Vorschläge aufgegriffen, Meinung mit zwei Argumenten, Einwand und Kompromiss', 'Tâche : propositions reprises, avis argumenté, objection, compromis') },
          ...GRIDS.b2.sprechen.slice(1),
        ],
      } },

    // 8 · Bilan
    { id: 'b2-gesundheit-atelier-bilan', kind: 'lesson', title: 'Bilanz: Gesundheit', estimatedMinutes: 6,
      competences: ['lecture'],
      lesson: { description: `${aide('Lesen Sie die Ziele der beiden Module „Gesundheit“. Was können Sie schon sicher? Was möchten Sie noch üben?', 'Relisez les objectifs des deux modules « Gesundheit ». Qu’est-ce qui est acquis ? Que voulez-vous encore travailler ?')}

ICH KANN …
[fr?] Je peux…
• ${aide('Ich kann einen argumentierenden Artikel und ein Radiogespräch über Stress verstehen und Notizen machen.', 'Je peux comprendre un article argumentatif et une émission sur le stress, en prenant des notes.')}
• ${aide('Ich kann einer Freundin oder einem Freund begründet raten und Vor- und Nachteile abwägen.', 'Je peux conseiller un ami de façon argumentée en pesant le pour et le contre.')}
• ${aide('Ich kann in einer Besprechung Stellung nehmen, höflich widersprechen und einen Kompromiss vorschlagen.', 'Je peux prendre position en réunion, objecter poliment et proposer un compromis.')}
• ${aide('Ich kann einen schwierigen Text, zum Beispiel eine Packungsbeilage, für eine andere Person vereinfachen.', 'Je peux simplifier un texte difficile, une notice par exemple, pour quelqu’un d’autre.')}
• ${aide('Ich kann einem Vortrag über das Gesundheitssystem die wichtigsten Informationen entnehmen.', 'Je peux tirer l’essentiel d’un exposé sur le système de santé.')}

STRATEGIEN
[fr?] Stratégies
• ${aide('Beim Hören: Gliederungssignale nutzen und nur Stichwörter notieren.', 'À l’écoute : s’appuyer sur les mots de structure et noter des mots-clés.')}
• ${aide('In der Diskussion: zuerst das Argument der anderen aufgreifen, dann widersprechen.', 'En discussion : reprendre l’argument de l’autre avant d’objecter.')}
• ${aide('Beim Vereinfachen: Fachwörter durch einfache Fragen ersetzen, Nomen durch Verben.', 'Pour simplifier : remplacer les termes techniques par des questions simples, les noms par des verbes.')}

NOCH NICHT SICHER?
[fr?] Pas encore sûr ?
${aide('Indem, sodass und die Modalverben für Vermutungen: Wiederholen Sie die Regel und die Übungen im Modul „Gesundheit“. Reflexive Verben und Verben mit Präposition: Machen Sie die Übung „Korrigieren“ noch einmal.', 'indem, sodass et les verbes de modalité de supposition : revoyez la règle et les exercices du module « Gesundheit ». Verbes pronominaux et à préposition : refaites l’exercice « Korrigieren ».')}` } },
  ],
};

/** Indices affichés sous les trous d'un fill (forme de base à transformer). */
function hints(question, ...values) {
  return { ...question, blanks: question.blanks.map((blank, index) => (values[index] ? { ...blank, hint: values[index] } : blank)) };
}
