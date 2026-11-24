// Module B2 n° 24 · atelier « Zusammenleben » (lot R8, thème 12), dernier module avant la Probeprüfung : servir
// d'intermédiaire. Modèle annoté (courriel de médiation et reformulation des positions à l'oral), réagir avec diplomatie
// dans une réunion de colocation, médiation (reformuler deux positions opposées pour une réunion d'équipe), erreurs
// typiques, révision mixte Lesen et Hören dans les conditions de l'examen, deux missions sur grille B2 : courriel formel
// de médiation entre voisins et discussion finale sur la langue de travail d'une équipe internationale.
// Textes, dialogues et exercices originaux LinguaCap (personnages fictifs).
import { aide, C2, choice, fill, order, match, speakB2, GRIDS } from '../../lib.mjs';

/** « Richtig / falsch / steht nicht im Text » : r, f ou n pour la bonne réponse. */
const rf = (id, statement, answer, explanation) => choice(id, `„${statement}“ ${C2.richtigFalsch}`,
  [['richtig', answer === 'r'], ['falsch', answer === 'f'], ['steht nicht im Text', answer === 'n']], explanation);

export default {
  id: 'b2-zusammenleben-atelier',
  title: 'Zusammenleben – Werkstatt: vermitteln, schlichten, gemeinsam entscheiden',
  objective: 'Rédiger un courriel formel de médiation, reformuler avec neutralité des positions opposées, réagir avec diplomatie dans une réunion tendue, réviser lecture et écoute dans les conditions de l’examen et défendre un point de vue dans une discussion finale avant la Probeprüfung.',
  grammarFocus: [],
  sources: ['Textes, dialogues et exercices originaux LinguaCap (personnages fictifs).'],

  vocabulary: [
    { word: 'Wenn ich Sie richtig verstehe, …', partOfSpeech: 'expression', translation: 'Si je vous comprends bien…',
      example: 'Wenn ich Sie richtig verstehe, geht es Ihnen vor allem um Ruhe.', note: 'verbe de la principale en tête : …, geht es …' },
    { word: 'Ihnen ist also wichtig, dass …', partOfSpeech: 'expression', translation: 'Ce qui compte pour vous, c’est donc que…',
      example: 'Ihnen ist also wichtig, dass die Kinder draußen spielen können.', note: null },
    { word: 'Ich habe den Eindruck, dass …', partOfSpeech: 'expression', translation: 'J’ai l’impression que…',
      example: 'Ich habe den Eindruck, dass beide Seiten eine Lösung wollen.', note: 'message en « je »' },
    { word: 'Könnten wir uns darauf einigen, dass …?', partOfSpeech: 'expression', translation: 'Pourrions-nous convenir que… ?',
      example: 'Könnten wir uns darauf einigen, dass wir die Regel vier Wochen testen?', note: 'sich einigen auf + accusatif' },
    { word: 'Wäre es denkbar, dass …?', partOfSpeech: 'expression', translation: 'Serait-il envisageable que… ?',
      example: 'Wäre es denkbar, dass die Familien den Gießdienst am Wochenende übernehmen?', note: null },
    { word: 'aufeinander zugehen', partOfSpeech: 'expression', translation: 'faire un pas l’un vers l’autre',
      example: 'Wenn beide Seiten aufeinander zugehen, findet sich eine Lösung.', note: 'séparable : zu|gehen' },
    { word: 'Sichtweise', article: 'die', plural: 'Sichtweisen', partOfSpeech: 'noun', translation: 'le point de vue',
      example: 'Zuerst hören wir uns beide Sichtweisen an.', note: null },
    { word: 'Anliegen', article: 'das', plural: 'Anliegen', partOfSpeech: 'noun', translation: 'la demande, la préoccupation',
      example: 'Ich habe Ihr Anliegen an die Hausverwaltung weitergegeben.', note: null },
    { word: 'Bedürfnis', article: 'das', plural: 'Bedürfnisse', partOfSpeech: 'noun', translation: 'le besoin',
      example: 'Hinter jeder Forderung steht ein Bedürfnis, zum Beispiel nach Ruhe.', note: null },
    { word: 'neutral', partOfSpeech: 'adjective', translation: 'neutre',
      example: 'Als Vermittlerin muss ich neutral bleiben.', note: null },
    { word: 'sachlich', partOfSpeech: 'adjective', translation: 'objectif, factuel',
      example: 'Bitte bleiben Sie sachlich, auch wenn Sie verärgert sind.', note: 'contraire : persönlich, emotional' },
    { word: 'schlichten', partOfSpeech: 'verb', translation: 'arbitrer, apaiser (un conflit)',
      example: 'Konfliktlotsen helfen, Streit unter Schülern zu schlichten.', note: 'die Schlichtung' },
    { word: 'herunterschlucken', partOfSpeech: 'verb', translation: 'ravaler (sa colère, une remarque)',
      example: 'Man sollte Ärger nicht zu lange herunterschlucken.', note: 'séparable : herunter|schlucken (familier)' },
    { word: 'Arbeitssprache', article: 'die', plural: 'Arbeitssprachen', partOfSpeech: 'noun', translation: 'la langue de travail',
      example: 'In unserem Team ist Deutsch die Arbeitssprache.', note: null },
    { word: 'sich verständigen', partOfSpeech: 'verb', translation: 'se faire comprendre, communiquer',
      example: 'Im Team verständigen wir uns meistens auf Deutsch.', note: 'auch : sich verständigen auf (+ acc.) : convenir de' },
  ],

  media: [
    { key: 'b2-zusammenleben-atelier-modell-audio', kind: 'audio', title: 'Modèle : reformuler les positions en réunion',
      script: [
        { voice: 'frau2', name: 'Gudrun Seifert', text: 'Danke, dass Sie beide Ihre Sicht so offen geschildert haben. Ich versuche einmal zusammenzufassen, und bitte korrigieren Sie mich, wenn ich etwas falsch verstanden habe.' },
        { voice: 'frau2', name: 'Gudrun Seifert', text: 'Herr Thiele, Ihnen ist wichtig, dass die Beete nicht beschädigt werden, weil Sie viel Zeit und Arbeit hineinstecken. Frau Kampmann, für Sie ist der Garten auch ein Ort für die Kinder, weil es in der Nähe keinen Spielplatz gibt.' },
        { voice: 'frau2', name: 'Gudrun Seifert', text: 'Ich habe den Eindruck, dass Sie beide denselben Garten lieben, nur auf unterschiedliche Weise. Wäre es denkbar, dass wir eine Ecke als Spielwiese abtrennen und dafür einen gemeinsamen Gießplan machen? Was meinen Sie?' },
      ] },
    { key: 'b2-zusammenleben-atelier-diskussion-a1', kind: 'audio', title: 'Réplique 1',
      script: [{ voice: 'mann3', name: 'Jasper', text: 'Ich putze hier als Einziger das Bad, und zwar seit Wochen. Ihr seid echt unmöglich!' }] },
    { key: 'b2-zusammenleben-atelier-diskussion-a2', kind: 'audio', title: 'Réplique 2',
      script: [{ voice: 'frau2', name: 'Pia', text: 'Ich arbeite abends bis zehn im Restaurant. Ich kann nicht jeden Samstag putzen, das geht einfach nicht.' }] },
    { key: 'b2-zusammenleben-atelier-diskussion-a3', kind: 'audio', title: 'Réplique 3',
      script: [{ voice: 'mann2', name: 'Levent', text: 'Na ja, Leute aus dem Süden nehmen das mit der Ordnung eben nicht so ernst.' }] },
    { key: 'b2-zusammenleben-atelier-diskussion-a4', kind: 'audio', title: 'Réplique 4',
      script: [{ voice: 'frau3', name: 'Merve', text: 'Wir diskutieren jetzt seit einer Stunde. Haben wir eigentlich schon eine Lösung?' }] },
    { key: 'b2-zusammenleben-atelier-mediation-nachrichten', kind: 'image', title: 'Deux messages adressés à l’équipe',
      alt: 'Deux messages au responsable d’équipe : Ole Hinze se plaint des appels téléphoniques bruyants dans l’open space ; Ngozi Nwosu explique qu’elle doit appeler ses clients et attend un casque depuis des semaines.',
      image: { layout: 'messages', icon: 'mail', title: 'Team Kundenservice', subtitle: 'Nachrichten an die Teamsprecherin',
        messages: [
          { from: 'Ole Hinze', time: 'Mo 9:12', text: 'Ich halte das nicht mehr aus. Frau Nwosu telefoniert den ganzen Vormittag, und zwar so laut, dass ich keinen klaren Gedanken fassen kann. Ich muss bis Monatsende die Abrechnung fertig machen und mache nur noch Fehler. Ich verlange, dass Telefonate im Großraumbüro verboten werden.' },
          { from: 'Ngozi Nwosu', time: 'Mo 11:47', text: 'Ich habe gehört, dass sich Herr Hinze über mich beschwert hat. Ehrlich gesagt bin ich verletzt, dass er nicht direkt mit mir spricht. Ich betreue sechzig Kunden, und die meisten rufen vormittags an. Der kleine Besprechungsraum ist fast immer belegt, und das Headset, das ich beantragt habe, ist bis heute nicht da. Ich telefoniere nicht zum Spaß.' },
        ] } },
    { key: 'b2-zusammenleben-atelier-pruefung-artikel', kind: 'image', title: 'Article « Konfliktlotsen »',
      alt: 'Article de journal sur des élèves médiateurs dans une école : leur rôle, leur formation, le bilan de l’année et les limites de leur mission.',
      image: { layout: 'article', kicker: 'Schule', icon: 'school', title: 'Konfliktlotsen: Wenn Schülerinnen und Schüler Streit schlichten',
        lead: 'An der Gesamtschule Wendelstedt-Ost gibt es seit drei Jahren ein besonderes Team: zwölf Schülerinnen und Schüler der neunten und zehnten Klassen, die als Konfliktlotsen arbeiten.',
        paragraphs: ['Wenn sich Jüngere auf dem Schulhof streiten, können sie sich an die Lotsen wenden, statt gleich zur Lehrkraft zu gehen.'] } },
    { key: 'b2-zusammenleben-atelier-pruefung-radio', kind: 'audio', title: 'Reportage radio : une maison pour toutes les générations',
      script: [
        { voice: 'sprecherin', name: 'Reporterin', text: 'In der Lindenstraße in Wendelstedt wohnen seit zwei Jahren zwanzig Menschen zwischen zwei und einundachtzig Jahren unter einem Dach. Jede Partei hat ihre eigene Wohnung, aber Küche, Garten und Werkstatt teilen sich alle. Wie klappt das Zusammenleben?' },
        { voice: 'frau3', name: 'Frau Dahlmann', text: 'Besser, als ich dachte. Ich passe zweimal in der Woche auf die Kinder von nebenan auf, und dafür kauft die Familie für mich ein. Allein in meiner alten Wohnung habe ich manchmal tagelang mit niemandem gesprochen.' },
        { voice: 'sprecherin', name: 'Reporterin', text: 'Gibt es auch Streit?' },
        { voice: 'mann3', name: 'Tilman', text: 'Natürlich. Am Anfang haben wir fast jede Woche über die Gemeinschaftsküche diskutiert: wer aufräumt, wie laut es abends sein darf. Inzwischen haben wir einmal im Monat eine Hausversammlung. Da kommt alles auf den Tisch, und wir entscheiden gemeinsam.' },
        { voice: 'sprecherin', name: 'Reporterin', text: 'Und wenn man sich nicht einigt?' },
        { voice: 'mann3', name: 'Tilman', text: 'Dann holen wir uns Hilfe von außen, eine Mediatorin. Das war bisher zweimal nötig. Wichtig ist, dass man nichts zu lange herunterschluckt.' },
        { voice: 'frau3', name: 'Frau Dahlmann', text: 'Und dass man auch mal über sich selbst lachen kann. Ich bin ja auch nicht immer pflegeleicht.' },
      ] },
    { key: 'b2-zusammenleben-atelier-sprechen-runde', kind: 'audio', title: 'Réunion d’équipe : quelle langue de travail ?',
      script: [
        { voice: 'sprecherin', name: 'Teamleiterin', text: 'In unserem Team arbeiten inzwischen Kolleginnen und Kollegen aus neun Ländern. Deshalb möchte ich heute eine Frage klären: Sollen unsere Besprechungen in Zukunft auf Englisch stattfinden? Herr Kirchner, bitte.' },
        { voice: 'mann', name: 'Herr Kirchner', text: 'Ich bin klar dafür. Fast alle sprechen gut Englisch, die Besprechungen wären schneller, und niemand müsste sich mit dem Deutschen quälen. Unsere Partnerfirmen schreiben uns ohnehin auf Englisch.' },
        { voice: 'sprecherin', name: 'Teamleiterin', text: 'Frau Nwosu?' },
        { voice: 'frau3', name: 'Ngozi Nwosu', text: 'Ich sehe das anders. Unsere Kunden sprechen Deutsch, und wer neu ist, lernt die Sprache am schnellsten im Alltag. Außerdem sprechen nicht alle gut Englisch. Ich möchte nicht, dass einige Kolleginnen in den Besprechungen plötzlich schweigen.' },
        { voice: 'sprecherin', name: 'Teamleiterin', text: 'Zwei Positionen also. Wie sehen Sie das? Und hätten Sie vielleicht einen Vorschlag, mit dem alle leben könnten?' },
      ] },
  ],

  activities: [
    // 1 · Modèle annoté
    { id: 'b2-zusammenleben-atelier-modell', kind: 'lesson', title: 'Modell: eine Vermittlungs-E-Mail und eine Zusammenfassung', estimatedMinutes: 12,
      competences: ['lecture', 'ecoute'],
      lesson: { description: `MODELL 1: EINE FORMELLE VERMITTLUNGS-E-MAIL
${aide('Im Gemeinschaftsgarten „Hinterhof Nord“ gibt es Streit zwischen der Gießgruppe und einigen Familien. Die Vorsitzende Gudrun Seifert schreibt allen Mitgliedern. Achten Sie auf den Aufbau und auf die neutralen, diplomatischen Formulierungen.', 'Dans un jardin partagé, la présidente écrit à tous les membres après un conflit ; observez la structure et les formulations neutres.')}

Betreff: Unser Garten – Vorschlag für ein gutes Miteinander
Liebe Mitglieder des Gemeinschaftsgartens,
in den letzten Wochen hat es im Garten mehrfach Ärger gegeben, und mehrere von Ihnen haben sich bei mir gemeldet. Ich möchte das Thema deshalb offen zur Sprache bringen, bevor sich die Fronten verhärten.
Die Gießgruppe ist besorgt, weil Beete beim Spielen beschädigt wurden und abends Grillrauch über die Pflanzen zieht. Für viele Familien ist der Garten dagegen der einzige Ort, an dem ihre Kinder draußen spielen können, denn in der Nähe gibt es keinen Spielplatz. Beide Anliegen sind aus meiner Sicht berechtigt.
Ich würde deshalb Folgendes vorschlagen: Wir trennen die Wiese hinter dem Schuppen als Spielfläche ab, gegrillt wird nur noch freitags auf dem Grillplatz, und die Familien übernehmen am Wochenende den Gießdienst. Diese Regeln könnten wir zunächst bis zum Herbst ausprobieren.
Damit alle mitreden können, lade ich Sie herzlich zu einem Treffen am Donnerstag, dem 5. Juni, um 19 Uhr im Gartenhaus ein. Wenn Sie nicht kommen können, schreiben Sie mir gern Ihre Meinung.
Mit freundlichen Grüßen
Gudrun Seifert, Vorsitzende

AUFBAU
1. Anlass: Was ist passiert, und warum schreibe ich? [fr?] L’occasion : ce qui s’est passé et pourquoi j’écris.
2. Beide Sichtweisen neutral wiedergeben, ohne Schuldige zu nennen. [fr?] Les deux points de vue, sans désigner de coupable.
3. Anerkennen: Beide Anliegen sind berechtigt. [fr?] Reconnaître la légitimité des deux demandes.
4. Konkreter Vorschlag, vorsichtig im Konjunktiv II, mit Probezeit. [fr?] Une proposition concrète, prudente, à l’essai.
5. Einladung zum Gespräch und formeller Schluss. [fr?] Invitation à en parler et formule finale.

ANLASS NENNEN
• Ich möchte das Thema offen zur Sprache bringen. · Mehrere von Ihnen haben sich bei mir gemeldet.
SICHTWEISEN WIEDERGEBEN
• Die Gießgruppe ist besorgt, weil … · Für viele Familien ist … dagegen … · Beide Anliegen sind berechtigt.
VORSCHLAGEN
• Ich würde Folgendes vorschlagen: … · Wäre es denkbar, dass …? · Diese Regeln könnten wir zunächst ausprobieren.
EINLADEN UND ABSCHLIESSEN
• Damit alle mitreden können, lade ich Sie … ein. · Ich freue mich auf ein offenes Gespräch.

MODELL 2: POSITIONEN MÜNDLICH ZUSAMMENFASSEN
${aide('Hören Sie, wie Gudrun Seifert beim Treffen die beiden Positionen zusammenfasst. Sie dankt, spiegelt die Interessen beider Seiten, nennt das Gemeinsame und macht dann einen vorsichtigen Vorschlag.', 'Écoutez la présidente résumer les deux positions : remercier, reformuler les intérêts, souligner le point commun, proposer prudemment.')}` },
      placements: [{ media: 'b2-zusammenleben-atelier-modell-audio', caption: 'Gudrun Seifert fasst zusammen' }] },

    // 2 · Discussion : réagir avec diplomatie
    { id: 'b2-zusammenleben-atelier-diskussion', kind: 'exercise', title: 'Diskutieren: diplomatisch reagieren', estimatedMinutes: 12,
      competences: ['ecoute', 'expression-orale'],
      lesson: { description: `${C2.reagieren}

SITUATION
In einer Wohngemeinschaft gibt es eine WG-Besprechung zum Putzplan. Die Stimmung ist angespannt. Sie möchten helfen, dass die Diskussion sachlich bleibt. In der WG duzen sich alle. [fr?] Réunion tendue de colocation sur le planning de ménage ; vous voulez garder un ton apaisé (tutoiement).
${aide('Hören Sie jede Äußerung und wählen Sie die Reaktion, die zur genannten Absicht passt. Sprechen Sie danach die vier Reaktionen laut nach.', 'Écoutez chaque réplique, choisissez la réaction qui correspond à l’intention indiquée, puis répétez les quatre réactions.')}` },
      placements: [
        { media: 'b2-zusammenleben-atelier-diskussion-a1', questionId: 'q1', transcriptVisibility: 'after_answer' },
        { media: 'b2-zusammenleben-atelier-diskussion-a2', questionId: 'q2', transcriptVisibility: 'after_answer' },
        { media: 'b2-zusammenleben-atelier-diskussion-a3', questionId: 'q3', transcriptVisibility: 'after_answer' },
        { media: 'b2-zusammenleben-atelier-diskussion-a4', questionId: 'q4', transcriptVisibility: 'after_answer' },
      ],
      questions: [
        choice('q1', aide('Äußerung 1: Sie möchten Jaspers Ärger anerkennen und die Diskussion beruhigen. Was sagen Sie?', 'Vous voulez reconnaître la colère de Jasper et apaiser. Que dites-vous ?'),
          [['Das stimmt doch gar nicht, ich habe letzten Monat auch einmal geputzt.'],
            ['Dann putz eben nicht mehr, wenn es dich so sehr stört, Jasper.'],
            ['Ich verstehe, dass du dich ärgerst. Lass uns einen fairen Plan machen.', true],
            ['Immer musst du dich beschweren, das ist doch wirklich anstrengend.']],
          aide('„Ich verstehe, dass du dich ärgerst“ erkennt das Gefühl an, ohne Schuld zuzugeben oder zu streiten. „Lass uns …“ lenkt den Blick auf eine gemeinsame Lösung. Die anderen Reaktionen rechtfertigen sich, provozieren oder werfen Jasper selbst etwas vor („immer“).',
            'Reconnaître l’émotion, puis orienter vers une solution commune.')),
        choice('q2', aide('Äußerung 2: Sie möchten herausfinden, was Pia braucht. Was fragen Sie?', 'Vous voulez savoir de quoi Pia a besoin. Que demandez-vous ?'),
          [['Welche Tage würden dir denn besser passen, wenn du abends arbeitest?', true],
            ['Warum suchst du dir nicht einfach einen anderen Job mit besseren Zeiten?'],
            ['Das ist dein Problem, wir haben schließlich alle viel zu tun.'],
            ['Musst du wirklich jeden Abend bis zehn Uhr im Restaurant arbeiten?']],
          aide('Hinter Pias Position („nicht jeden Samstag“) steht ein Interesse: Sie braucht Zeiten, die zu ihrer Arbeit passen. Die offene Frage nach passenden Tagen sucht dieses Interesse. Die anderen Fragen zweifeln ihre Situation an oder schieben das Problem zurück.',
            'Une question ouverte sur ses disponibilités révèle l’intérêt derrière la position.')),
        choice('q3', aide('Äußerung 3: Sie möchten die Verallgemeinerung zurückweisen, ohne Levent anzugreifen. Was sagen Sie?', 'Vous voulez refuser la généralisation sans attaquer Levent. Que dites-vous ?'),
          [['Das ist rassistisch, und mit dir rede ich heute ganz sicher nicht mehr weiter.'],
            ['Stimmt, das kenne ich auch von vielen Leuten aus dem Süden.'],
            ['Und Leute aus dem Norden sind ja bekanntlich alle Putzteufel, oder etwa nicht?'],
            ['Ich würde ungern über ganze Gruppen sprechen. Bleiben wir bei den Aufgaben.', true]],
          aide('Die Antwort lehnt das Klischee klar ab („ungern über ganze Gruppen sprechen“), ohne Levent als Person zu verurteilen, und führt das Gespräch zur Sache zurück. Die erste Reaktion bricht das Gespräch ab, die zweite bestätigt das Vorurteil, die dritte antwortet mit einem Gegenklischee.',
            'Refuser le cliché sans attaquer la personne, puis revenir aux faits.')),
        choice('q4', aide('Äußerung 4: Sie möchten das Ergebnis zusammenfassen und eine Vereinbarung vorschlagen. Was sagen Sie?', 'Vous voulez résumer et proposer un accord. Que dites-vous ?'),
          [['Nein, wir haben gar nichts, und das liegt nur an Jasper.'],
            ['Wenn ich zusammenfassen darf: Wir testen einen Putzplan vier Wochen lang.', true],
            ['Keine Ahnung, mir ist das inzwischen eigentlich völlig egal.'],
            ['Dann machen wir eben einfach weiter wie bisher, das ist doch am einfachsten.']],
          aide('„Wenn ich zusammenfassen darf“ ist eine höfliche Einleitung, und der Vorschlag ist konkret und begrenzt: ein Plan, vier Wochen, dann neu sprechen. Eine Probezeit macht es leichter, zuzustimmen. Die anderen Antworten geben die Schuld, resignieren oder verschieben das Problem.',
            'Résumer poliment et proposer un accord concret, limité dans le temps.')),
        speakB2('q5', 'Ich verstehe, dass du dich ärgerst. Lass uns einen fairen Plan machen.',
          aide('Ruhig und langsam sprechen. Betonen Sie „verstehe“ und „fairen“. „Fair“ spricht man wie im Englischen: fär.',
            'Débit calme ; « fair » se prononce comme en anglais.')),
        speakB2('q6', 'Welche Tage würden dir denn besser passen, wenn du abends arbeitest?',
          aide('W-Frage mit fallender Melodie. Die Modalpartikel „denn“ bleibt unbetont und macht die Frage interessiert und freundlich.',
            'Intonation descendante ; « denn » inaccentué rend la question bienveillante.')),
        speakB2('q7', 'Ich würde ungern über ganze Gruppen sprechen. Bleiben wir bei den Aufgaben.',
          aide('Der erste Satz ist vorsichtig (Konjunktiv II, „ungern“), der zweite klar. Betonen Sie „Gruppen“ und „Aufgaben“, den Kontrast der beiden Sätze.',
            'Accentuez Gruppen et Aufgaben pour marquer le contraste.')),
        speakB2('q8', 'Wenn ich zusammenfassen darf: Wir testen einen Putzplan vier Wochen lang.',
          aide('Nach dem Doppelpunkt eine kurze Pause. In „zusammenfassen“ trägt die zweite Silbe den Hauptakzent: zu-SAM-men-fas-sen.',
            'Pause après les deux-points ; accent sur -SAM- dans zusammenfassen.'),
          ['Wenn ich zusammenfassen darf: Wir testen einen Putzplan vier Wochen lang.', 'Wenn ich zusammenfassen darf: Wir testen einen Putzplan 4 Wochen lang.']),
      ] },

    // 3 · Médiation : reformuler deux positions
    { id: 'b2-zusammenleben-atelier-mediation', kind: 'exercise', title: 'Vermitteln: zwei Positionen neutral wiedergeben', estimatedMinutes: 16,
      competences: ['lecture', 'expression-ecrite'],
      lesson: { description: `SITUATION
Sie sind Teamsprecherin oder Teamsprecher im Kundenservice. Zwei Kollegen haben Ihnen geschrieben. In der Teambesprechung am Mittwoch sollen Sie beide Positionen neutral vorstellen, damit das Team eine Lösung finden kann. [fr?] Porte-parole d’équipe, vous devez présenter avec neutralité deux positions opposées en réunion.

NACHRICHT VON OLE HINZE
Ich halte das nicht mehr aus. Frau Nwosu telefoniert den ganzen Vormittag, und zwar so laut, dass ich keinen klaren Gedanken fassen kann. Ich muss bis Monatsende die Abrechnung fertig machen und mache nur noch Fehler. Ich verlange, dass Telefonate im Großraumbüro verboten werden.

NACHRICHT VON NGOZI NWOSU
Ich habe gehört, dass sich Herr Hinze über mich beschwert hat. Ehrlich gesagt bin ich verletzt, dass er nicht direkt mit mir spricht. Ich betreue sechzig Kunden, und die meisten rufen vormittags an. Der kleine Besprechungsraum ist fast immer belegt, und das Headset, das ich beantragt habe, ist bis heute nicht da. Ich telefoniere nicht zum Spaß.

${aide('Unterscheiden Sie zuerst Positionen (was jemand fordert) und Interessen (was jemand braucht). Formulieren Sie dann neutral: ohne Wertung, ohne Vorwürfe, in der dritten Person.', 'Distinguez positions (ce qu’on exige) et intérêts (ce dont on a besoin), puis reformulez sans jugement, à la troisième personne.')}` },
      placements: [{ media: 'b2-zusammenleben-atelier-mediation-nachrichten', caption: 'Zwei Nachrichten an die Teamsprecherin' }],
      questions: [
        fill('q1', aide('Ergänzen Sie Ihre Notizen.', 'Complétez vos notes.'),
          'Herr Hinze: Position: Telefonate im Großraumbüro [[1]] · Interesse: Ruhe, um bis Monatsende die [[2]] ohne Fehler zu schaffen · Frau Nwosu: Position: Sie muss weiter telefonieren · Interesse: ihre [[3]] Kunden erreichen, die meist [[4]] anrufen · Hindernisse: der Besprechungsraum ist oft [[5]], das beantragte [[6]] fehlt',
          [['verbieten', 'verboten'], ['Abrechnung'], ['60', 'sechzig'], ['vormittags', 'am Vormittag'], ['belegt', 'besetzt'], ['Headset']],
          aide('Die Position ist die Forderung (Telefonate verbieten, weiter telefonieren), das Interesse der Grund dahinter (Konzentration für die Abrechnung, Erreichbarkeit für sechzig Kunden). Die Hindernisse zeigen, wo eine Lösung ansetzen kann: Raum und Headset.',
            'Position = exigence ; intérêt = besoin ; les obstacles indiquent des pistes de solution.')),
        match('q2', aide('Welche neutrale Formulierung passt zu welcher Aussage?', 'Associez chaque phrase à sa reformulation neutre.'),
          [['„Ich halte das nicht mehr aus.“', 'Herr Hinze fühlt sich durch die Telefonate stark belastet.'],
            ['„Ich verlange, dass Telefonate verboten werden.“', 'Herr Hinze wünscht sich eine klare Regel für Telefonate.'],
            ['„Ich telefoniere nicht zum Spaß.“', 'Für Frau Nwosu gehören die Telefonate zu ihren Kernaufgaben.'],
            ['„Ich bin verletzt, dass er nicht mit mir spricht.“', 'Frau Nwosu hätte sich ein direktes Gespräch gewünscht.']],
          aide('Neutral wiedergeben heißt: Gefühle und Forderungen sachlich benennen, in der dritten Person, ohne zu übertreiben oder zu bewerten. Aus einer Forderung wird ein Wunsch, aus einem Vorwurf ein Bedürfnis („hätte sich … gewünscht“, Konjunktiv II der Vergangenheit).',
            'Reformuler sans juger : émotions et exigences deviennent souhaits et besoins.')),
        choice('q3', aide('Welche Formulierung ist für Ihre Zusammenfassung NICHT neutral?', 'Quelle formulation n’est PAS neutre ?'),
          [['Beide Kollegen möchten gut und konzentriert arbeiten können.'],
            ['Herr Hinze übertreibt maßlos und hetzt das ganze Team auf.', true],
            ['Frau Nwosu wartet seit einiger Zeit auf ein Headset.'],
            ['Der Besprechungsraum ist vormittags meistens belegt.']],
          aide('„Übertreibt maßlos“ und „hetzt auf“ bewerten Herrn Hinze und ergreifen Partei. Wer vermittelt, beschreibt Tatsachen und Bedürfnisse, nicht Charaktere. Die anderen Sätze sind sachlich und überprüfbar; der erste nennt sogar das gemeinsame Interesse.',
            'Juger une personne (« übertreibt maßlos ») n’est pas neutre ; on décrit faits et besoins.')),
        choice('q4', aide('Welche Lösung berücksichtigt die Interessen beider?', 'Quelle solution tient compte des intérêts des deux ?'),
          [['Frau Nwosu betreut ihre Kunden in Zukunft nur noch per E-Mail.'],
            ['Herr Hinze trägt Ohrstöpsel und beschwert sich nicht mehr.'],
            ['Das ganze Team stimmt darüber ab, wer in diesem Streit eigentlich im Recht ist.'],
            ['Das Headset wird sofort bestellt und vormittags ein Raum reserviert.', true]],
          aide('Mit dem Headset telefoniert Frau Nwosu leiser, und ein reservierter Raum am Vormittag gibt ihr einen Ort für lange Gespräche: Ihre Kunden bleiben erreichbar, Herr Hinze hat mehr Ruhe. Die anderen Lösungen erfüllen nur die Interessen einer Seite oder suchen einen Schuldigen.',
            'Une solution « gagnant-gagnant » répond aux besoins des deux parties.')),
        order('q5', aide('Formulieren Sie Ihren Vorschlag für die Besprechung.', 'Formulez votre proposition pour la réunion.'),
          [['Ich', 'würde', 'vorschlagen,', 'dass', 'wir', 'zuerst', 'beide Sichtweisen', 'anhören', 'und', 'dann', 'gemeinsam', 'nach Lösungen', 'suchen.'],
            ['Ich', 'würde', 'vorschlagen,', 'dass', 'wir', 'beide Sichtweisen', 'zuerst', 'anhören', 'und', 'dann', 'gemeinsam', 'nach Lösungen', 'suchen.']],
          aide('„Ich würde vorschlagen, dass …“ leitet den Vorschlag diplomatisch ein. Im Nebensatz stehen die beiden Verben jeweils am Ende ihres Satzteils: „anhören“ und „suchen“. „Zuerst … und dann …“ ordnet die Schritte; „zuerst“ kann vor oder nach dem Objekt stehen.',
            'Ich würde vorschlagen, dass … : verbes en fin de chaque partie ; « zuerst … dann » pour les étapes.')),
        fill('q6', aide('Ergänzen Sie die Sätze für Ihre Zusammenfassung.', 'Complétez les phrases de votre synthèse.'),
          'Herr Hinze möchte das Thema Lärm in der Besprechung zur [[1]] bringen. · Frau Nwosu bittet darum, ihre Situation in [[2]] zu ziehen. · Ziel ist, dass beide Seiten am Ende eine [[3]] treffen.',
          [['Sprache'], ['Betracht'], ['Vereinbarung', 'Entscheidung']],
          aide('Sachliche Funktionsverbgefüge passen gut zu einer neutralen Zusammenfassung: etwas zur Sprache bringen, etwas in Betracht ziehen, eine Vereinbarung (oder Entscheidung) treffen. Sie klingen distanziert und vermeiden Wertungen.',
            'Les locutions verbo-nominales donnent un ton neutre et formel.')),
      ] },

    // 4 · Erreurs typiques
    { id: 'b2-zusammenleben-atelier-korrektur', kind: 'exercise', title: 'Korrigieren: typische Fehler beim Vermitteln', estimatedMinutes: 10,
      competences: ['lecture', 'expression-ecrite'],
      lesson: { description: `${aide('Diese Sätze stammen aus Vermittlungs-E-Mails von Kursteilnehmenden. Finden Sie die richtige Form.', 'Ces phrases viennent de courriels de médiation d’apprenants ; trouvez la forme correcte.')}

KORREKTURZEICHEN
G Grammatik · W Wortschatz · St Satzstellung · R Rechtschreibung · A Ausdruck und Register. [fr?] Codes de correction : grammaire, vocabulaire, place des mots, orthographe, registre.` },
      questions: [
        choice('q1', aide('W: Welcher Satz ist richtig?', 'W : quelle phrase est correcte ?'),
          [['Wir müssen bis zum Freitag eine Entscheidung machen.'], ['Wir müssen bis Freitag eine Entscheidung tun.'],
            ['Wir müssen bis Freitag eine Entscheidung treffen.', true], ['Wir müssen bis Freitag eine Entscheidung geben.']],
          aide('Die feste Verbindung heißt „eine Entscheidung treffen“. „Machen“ ist ein typischer Lehnfehler aus dem Französischen (« prendre » oder « faire »). Funktionsverbgefüge muss man als Ganzes lernen.',
            'eine Entscheidung treffen ; jamais « machen ».')),
        fill('q2', aide('W: Ergänzen Sie das Verb.', 'W : complétez avec le verbe.'),
          'Darf ich Ihnen eine Frage [[1]]? · Herr Hinze hat Kritik an der Raumplanung [[2]].',
          [['stellen'], ['geübt']],
          aide('Eine Frage stellt man, Kritik übt man (an + Dativ). „Eine Frage fragen“ und „Kritik machen“ sind falsch. Im Perfekt: Er hat Kritik geübt.',
            'eine Frage stellen, Kritik üben (Perfekt : geübt).')),
        choice('q3', aide('G: Welcher Satz ist richtig?', 'G : quelle phrase est correcte ?'),
          [['Ich würde haben eine Bitte an Sie.'], ['Ich hätte eine Bitte an Sie.', true],
            ['Ich habe würde eine Bitte an Sie.'], ['Ich hätte gehabt eine Bitte an Sie.']],
          aide('Bei „haben“ bildet man den Konjunktiv II mit der eigenen Form „hätte“, nicht mit „würde haben“. „Ich hätte eine Bitte“ ist eine typische höfliche Einleitung. „Hätte gehabt“ wäre Vergangenheit und steht außerdem an der falschen Stelle.',
            'Konjunktiv II de haben : hätte (pas « würde haben »).')),
        choice('q4', aide('A: Sie schreiben zum ersten Mal an Herrn Pfeiffer, den Sie nicht kennen. Welche Anrede passt?', 'A : vous écrivez pour la première fois à M. Pfeiffer, que vous ne connaissez pas. Quelle formule d’appel ?'),
          [['Hallo Herr Pfeiffer!'], ['Sehr geehrter Herr Pfeiffer,', true],
            ['Hi Herr Pfeiffer,'], ['Lieber Herr Pfeiffer, wie geht’s?']],
          aide('In einem ersten formellen Schreiben an eine unbekannte Person ist „Sehr geehrter Herr …,“ der Standard, mit Komma; die nächste Zeile beginnt klein. „Hallo“ und „Hi“ sind zu locker, „Lieber Herr …“ setzt eine persönliche Beziehung voraus.',
            'Premier courrier formel : « Sehr geehrter Herr …, » suivi d’une minuscule.')),
        choice('q5', aide('St: Welcher Satz ist richtig?', 'St : quelle phrase est correcte ?'),
          [['Ich möchte heute zur Sprache ein Problem bringen.'], ['Ich möchte heute ein Problem bringen zur Sprache.'],
            ['Ich möchte zur Sprache bringen heute ein Problem.'], ['Ich möchte heute ein Problem zur Sprache bringen.', true]],
          aide('Der Nomenteil „zur Sprache“ steht am Ende des Mittelfelds direkt vor dem Infinitiv „bringen“, wie eine Verbpartikel. Das Objekt „ein Problem“ steht davor. Im Französischen folgt das Objekt dem Verb, deshalb ist diese Stellung schwierig.',
            '« zur Sprache » juste avant l’infinitif ; l’objet avant.')),
        fill('q6', aide('G: Ergänzen Sie „nicht“ oder „kein“.', 'G : complétez avec nicht ou kein.'),
          'Leider hat er [[1]] Rücksicht auf die Nachbarn genommen. · Ein Verbot kommt für mich [[2]] in Frage.',
          [['keine'], ['nicht']],
          aide('Ein Nomen ohne Artikel wie „Rücksicht“ verneint man mit „kein“: keine Rücksicht nehmen. Ein Nomen mit Präposition verneint man mit „nicht“: nicht in Frage kommen. Achtung: „in Frage kommen“ (möglich sein) ist nicht dasselbe wie „in Frage stellen“.',
            'keine Rücksicht nehmen ; nicht in Frage kommen.')),
      ] },

    // 5 · Révision mixte dans les conditions de l'examen
    { id: 'b2-zusammenleben-atelier-pruefung', kind: 'exercise', title: 'Prüfungstraining: Generalprobe Lesen und Hören', estimatedMinutes: 20,
      competences: ['lecture', 'ecoute'],
      lesson: { description: `GENERALPROBE VOR DER PROBEPRÜFUNG
${aide('Diese Übung ist wie ein kleiner Teil der Prüfung. Arbeiten Sie ohne Wörterbuch, ohne Pause und halten Sie die Zeit ein. Teil 1: Lesen Sie den Artikel und beantworten Sie die Fragen 1 bis 4. Teil 2: Hören Sie den Radiobeitrag zweimal und beantworten Sie die Fragen 5 bis 8.', 'Comme une petite partie de l’examen : sans dictionnaire, sans pause, en respectant le temps. Partie 1 : questions 1 à 4 ; partie 2 : écoutez deux fois, questions 5 à 8.')}

ZEIT
Teil 1: 8 Minuten. Teil 2: 9 Minuten. Kontrolle: 3 Minuten. [fr?] Partie 1 : 8 minutes ; partie 2 : 9 minutes ; vérification : 3 minutes.

STRATEGIE
• Lesen Sie immer zuerst die Aufgaben: Dann wissen Sie, was Sie suchen. [fr?] Lisez toujours d’abord les questions.
• Bleiben Sie nicht zu lange bei einer Frage. Kreuzen Sie im Zweifel die wahrscheinlichste Antwort an und kommen Sie am Ende zurück. [fr?] Ne bloquez pas : répondez au plus probable et revenez-y à la fin.
• Beim Hören: Im ersten Durchgang den Inhalt verstehen, im zweiten die Antworten prüfen. [fr?] Première écoute pour comprendre, seconde pour vérifier.

TEIL 1 · KONFLIKTLOTSEN: WENN SCHÜLERINNEN UND SCHÜLER STREIT SCHLICHTEN
An der Gesamtschule Wendelstedt-Ost gibt es seit drei Jahren ein besonderes Team: zwölf Schülerinnen und Schüler der neunten und zehnten Klassen, die als Konfliktlotsen arbeiten. Wenn sich Jüngere auf dem Schulhof streiten, können sie sich an die Lotsen wenden, statt gleich zur Lehrkraft zu gehen. In einem ruhigen Raum hören die Lotsen beide Seiten an, achten darauf, dass niemand unterbrochen wird, und helfen, eine Lösung zu finden. Entscheiden dürfen sie nichts.
Ausgebildet werden die Lotsen in einem Kurs von vierzig Stunden, den die Schulsozialarbeiterin Katrin Möller leitet. „Am schwersten ist es für die Jugendlichen, neutral zu bleiben“, sagt sie, „vor allem, wenn ein Freund an dem Streit beteiligt ist.“ In solchen Fällen übernimmt ein anderes Team.
Die Bilanz fällt positiv aus: Von etwa sechzig Konflikten im letzten Schuljahr endeten über fünfzig mit einer Vereinbarung. Lehrkräfte berichten, dass es in den Pausen ruhiger geworden ist. Doch nicht jeder Streit gehört zu den Lotsen: Bei Gewalt oder Mobbing schalten sie sofort Erwachsene ein.
Auch die Lotsen selbst profitieren. „Ich habe gelernt, zuzuhören, bevor ich etwas sage“, erzählt die Zehntklässlerin Defne. „Das hilft mir inzwischen auch zu Hause.“

TEIL 2 · RADIOBEITRAG: EIN HAUS FÜR ALLE GENERATIONEN
${aide('Eine Reporterin besucht ein Mehrgenerationenhaus und spricht mit zwei Bewohnern.', 'Une reporter visite une maison intergénérationnelle et interroge deux habitants.')}` },
      placements: [
        { media: 'b2-zusammenleben-atelier-pruefung-artikel', caption: 'Konfliktlotsen' },
        { media: 'b2-zusammenleben-atelier-pruefung-radio', caption: 'Ein Haus für alle Generationen', transcriptVisibility: 'after_answer' },
      ],
      questions: [
        choice('q1', aide('Teil 1: Was ist die Aufgabe der Konfliktlotsen?', 'Partie 1 : quelle est la mission des élèves médiateurs ?'),
          [['Sie bestrafen Schüler, die sich auf dem Schulhof streiten.'],
            ['Sie helfen Streitenden, selbst eine Lösung zu finden.', true],
            ['Sie unterrichten jüngere Klassen im Fach Sozialkunde.'],
            ['Sie entscheiden, wer in einem Streit im Recht ist.']],
          aide('Die Lotsen „hören beide Seiten an, achten darauf, dass niemand unterbrochen wird, und helfen, eine Lösung zu finden. Entscheiden dürfen sie nichts.“ Sie arbeiten also wie Mediatoren: Sie strafen und urteilen nicht.',
            'Comme des médiateurs : ils écoutent et aident, sans juger ni sanctionner.')),
        rf('q2', 'Wenn ein Lotse mit einer Streitpartei befreundet ist, übernimmt ein anderes Team.', 'r',
          aide('Richtig: „vor allem, wenn ein Freund an dem Streit beteiligt ist.“ In solchen Fällen übernimmt ein anderes Team. Der Grund: Neutralität ist das Schwierigste und das Wichtigste bei der Vermittlung.',
            'Vrai : un autre binôme prend le relais pour garantir la neutralité.')),
        choice('q3', aide('Teil 1: Welche Konflikte bearbeiten die Lotsen nicht?', 'Partie 1 : quels conflits ne traitent-ils pas ?'),
          [['Streit zwischen Schülern verschiedener Klassen'],
            ['Konflikte, die in der Pause entstehen'],
            ['Fälle von Gewalt oder Mobbing', true],
            ['Streit unter jüngeren Schülerinnen']],
          aide('„Bei Gewalt oder Mobbing schalten sie sofort Erwachsene ein.“ Das ist die Grenze ihrer Aufgabe. Streit auf dem Schulhof oder in der Pause unter Jüngeren ist dagegen genau ihr Arbeitsbereich.',
            'Violence et harcèlement relèvent des adultes.')),
        choice('q4', aide('Teil 1: Was sagt die Bilanz des letzten Schuljahres?', 'Partie 1 : que montre le bilan de l’année ?'),
          [['Etwa die Hälfte der Konflikte blieb am Ende ungelöst.'],
            ['Es gab weniger Konflikte als in früheren Jahren.'],
            ['Die Lehrkräfte wollen das Projekt beenden.'],
            ['Die meisten Fälle endeten mit einer Vereinbarung.', true]],
          aide('„Von etwa sechzig Konflikten im letzten Schuljahr endeten über fünfzig mit einer Vereinbarung.“ Das ist die große Mehrheit. Über die Zahl der Konflikte in früheren Jahren sagt der Text nichts, und die Lehrkräfte berichten Positives.',
            'Plus de cinquante conflits sur soixante ont abouti à un accord.')),
        choice('q5', aide('Teil 2: Wie ist das Haus organisiert?', 'Partie 2 : comment la maison est-elle organisée ?'),
          [['Alle wohnen in einer großen Wohngemeinschaft.'],
            ['Jede Partei hat eine Wohnung, manche Räume teilen alle.', true],
            ['Nur ältere Menschen wohnen dort, Familien helfen.'],
            ['Jede Familie hat ein eigenes kleines Haus mit Garten.']],
          aide('„Jede Partei hat ihre eigene Wohnung, aber Küche, Garten und Werkstatt teilen sich alle.“ Es ist also keine große Wohngemeinschaft, und es wohnen Menschen „zwischen zwei und einundachtzig Jahren“ dort, nicht nur ältere.',
            'Logements privés, cuisine, jardin et atelier communs.')),
        choice('q6', aide('Teil 2: Was tauscht Frau Dahlmann mit der Nachbarfamilie?', 'Partie 2 : quel échange Mme Dahlmann fait-elle avec ses voisins ?'),
          [['Sie kocht für die Familie, dafür putzt die Familie.'],
            ['Sie gibt Nachhilfe, dafür repariert die Familie ihr Rad.'],
            ['Sie betreut die Kinder, dafür kauft die Familie für sie ein.', true],
            ['Sie leiht der Familie ihr Auto, dafür gießt sie den Garten.']],
          aide('„Ich passe zweimal in der Woche auf die Kinder von nebenan auf, und dafür kauft die Familie für mich ein.“ „Dafür“ zeigt hier den Tausch: eine Leistung gegen eine andere.',
            'Garde des enfants contre courses ; « dafür » marque l’échange.')),
        choice('q7', aide('Teil 2: Wie lösen die Bewohner Konflikte normalerweise?', 'Partie 2 : comment les habitants règlent-ils d’habitude leurs conflits ?'),
          [['in einer monatlichen Hausversammlung', true],
            ['mit Hilfe der Hausverwaltung'],
            ['durch eine schriftliche Hausordnung'],
            ['mit einer Mediatorin bei jedem Streit']],
          aide('„Inzwischen haben wir einmal im Monat eine Hausversammlung. Da kommt alles auf den Tisch.“ Eine Mediatorin holen sie nur, wenn sie sich nicht einigen, „bisher zweimal“. Eine Hausverwaltung erwähnt Tilman nicht.',
            'Réunion mensuelle ; la médiatrice seulement en cas de blocage.')),
        choice('q8', aide('Teil 2: Was meint Tilman mit „Wichtig ist, dass man nichts zu lange herunterschluckt“?', 'Partie 2 : que veut dire Tilman ?'),
          [['Man sollte beim Essen in der Küche langsam sein.'],
            ['Man sollte keinen Streit vor anderen austragen.'],
            ['Man sollte Probleme früh ansprechen, statt zu schweigen.', true],
            ['Man sollte Kritik möglichst schnell wieder vergessen.']],
          aide('„Etwas herunterschlucken“ ist hier bildlich: Man sagt nichts, obwohl einen etwas stört. Tilman meint also, man sollte Ärger früh zur Sprache bringen. Die wörtliche Bedeutung mit dem Essen ist eine Falle.',
            'Sens figuré : ne pas taire trop longtemps ce qui dérange.')),
      ] },

    // 6 · Mission écrite : courriel formel de médiation
    { id: 'b2-zusammenleben-atelier-schreiben', kind: 'mission', title: 'Mission: eine formelle Vermittlungs-E-Mail', estimatedMinutes: 27,
      competences: ['expression-ecrite'],
      lesson: { description: `SITUATION
Sie sind Sprecherin oder Sprecher der Hausgemeinschaft in der Ahornstraße 7. Zwischen der Wohngemeinschaft im dritten Stock und dem Ehepaar Pfeiffer im zweiten Stock gibt es Streit. [fr?] Porte-parole des locataires, vous intervenez dans un conflit entre une colocation et un couple âgé.

WAS SIE WISSEN
• Die WG (drei Studierende) feiert etwa zweimal im Monat am Wochenende, oft bis zwei Uhr nachts. [fr?] La colocation fait la fête deux fois par mois, souvent jusqu’à 2 h.
• Herr und Frau Pfeiffer (beide über siebzig) haben sich bei der Hausverwaltung beschwert. Frau Pfeiffer ist herzkrank und braucht nachts Ruhe. [fr?] Le couple s’est plaint ; Mme Pfeiffer, malade du cœur, a besoin de calme la nuit.
• Die WG sagt, sie habe von der Beschwerde erst durch die Hausverwaltung erfahren. Sie hätte lieber direkt mit den Nachbarn gesprochen. [fr?] La colocation regrette de l’avoir appris par la gérance.
• In der Hausordnung steht: Nachtruhe von 22 bis 6 Uhr. Im Hof gibt es einen Gemeinschaftsraum, den man mieten kann. [fr?] Règlement : calme de 22 h à 6 h ; une salle commune se loue dans la cour.

SO GEHEN SIE VOR
1. Planen (6 Minuten): Überlegen Sie sich Stichwörter zu beiden Sichtweisen und zu zwei möglichen Lösungen. [fr?] Planifier : les deux points de vue, deux solutions.
2. Schreiben (16 Minuten): Folgen Sie dem Aufbau aus dem Modell von Gudrun Seifert. [fr?] Écrire en suivant la structure du modèle.
3. Prüfen (5 Minuten): Lesen Sie Ihren Text mit der Checkliste noch einmal. [fr?] Relire avec la liste de vérification.` },
      mission: {
        oral: null,
        written: { prompt: aide('Schreiben Sie eine formelle E-Mail an beide Parteien (180 bis 220 Wörter). Nennen Sie den Anlass, geben Sie beide Sichtweisen neutral wieder, machen Sie mindestens zwei konkrete Vorschläge und laden Sie zu einem gemeinsamen Gespräch ein.',
          'Écrivez un courriel formel aux deux parties (180 à 220 mots) : occasion, deux points de vue neutres, au moins deux propositions concrètes, invitation à une rencontre.'),
          maxChars: 2200, minWords: 150 },
        checklist: [
          aide('Betreff, formelle Anrede und Grußformel', 'Objet, formule d’appel et formule finale formelles'),
          aide('Beide Sichtweisen neutral, ohne Schuldige zu nennen', 'Les deux points de vue, sans coupable'),
          aide('Zwei konkrete Vorschläge, vorsichtig im Konjunktiv II', 'Deux propositions concrètes au Konjunktiv II'),
          aide('Mindestens zwei Funktionsverbgefüge (zur Sprache bringen, eine Vereinbarung treffen …)', 'Au moins deux locutions verbo-nominales'),
          aide('Einladung mit Datum, Uhrzeit und Ort', 'Invitation avec date, heure et lieu'),
        ],
        criteria: [
          { ...GRIDS.b2.schreiben[0], label: aide('Aufgabenerfüllung: Anlass, beide Sichtweisen neutral, zwei Vorschläge, Einladung; formelles Register', 'Tâche : occasion, points de vue neutres, propositions, invitation') },
          ...GRIDS.b2.schreiben.slice(1),
        ],
      } },

    // 7 · Mission orale : discussion finale
    { id: 'b2-zusammenleben-atelier-sprechen', kind: 'mission', title: 'Mission: Diskussion über die Arbeitssprache im Team', estimatedMinutes: 20,
      competences: ['expression-orale'],
      lesson: { description: `SITUATION
${aide('Ihr Team im Kundenservice ist international geworden. Die Teamleiterin möchte klären, ob die Besprechungen in Zukunft auf Englisch stattfinden sollen. Hören Sie die beiden Positionen. Dann bittet die Teamleiterin Sie um Ihre Meinung und um einen Vorschlag.', 'Votre équipe est devenue internationale ; la responsable demande si les réunions doivent passer à l’anglais. Écoutez les deux positions, puis donnez votre avis et une proposition.')}

DIE POSITIONEN
• Herr Kirchner: für Englisch. Fast alle sprechen gut Englisch, Besprechungen wären schneller, die Partnerfirmen schreiben ohnehin auf Englisch. [fr?] Pour l’anglais : réunions plus rapides, entreprises associées anglophones.
• Frau Nwosu: für Deutsch. Die Kunden sprechen Deutsch, Neue lernen die Sprache im Alltag, und nicht alle sprechen gut Englisch. [fr?] Pour l’allemand : clients germanophones, apprentissage, personne exclu.

VORBEREITUNG
${aide('Nehmen Sie sich fünf Minuten Zeit und überlegen Sie sich Stichwörter: Welche Argumente beider Seiten überzeugen Sie? Wo widersprechen Sie? Welcher Kompromiss wäre für alle annehmbar?', 'Préparez en cinq minutes des mots-clés : arguments convaincants, désaccords, compromis acceptable par tous.')}` },
      placements: [{ media: 'b2-zusammenleben-atelier-sprechen-runde', caption: 'Teambesprechung: Englisch oder Deutsch?' }],
      mission: {
        oral: { prompt: aide('Nehmen Sie Ihren Beitrag auf (zwei bis drei Minuten). Fassen Sie beide Positionen kurz und neutral zusammen, nehmen Sie diplomatisch Stellung, widersprechen Sie in mindestens einem Punkt und schlagen Sie einen Kompromiss vor.',
          'Enregistrez votre intervention (deux à trois minutes) : résumez les deux positions avec neutralité, prenez position avec diplomatie, contredisez sur un point et proposez un compromis.'),
          maxSeconds: 180 },
        written: null,
        checklist: [
          aide('Ich fasse beide Positionen neutral zusammen („Wenn ich richtig verstehe …“).', 'Je résume les deux positions avec neutralité.'),
          aide('Ich nehme Stellung und begründe meine Meinung.', 'Je prends position et je justifie.'),
          aide('Ich widerspreche höflich in einem Punkt.', 'Je contredis poliment sur un point.'),
          aide('Ich schlage einen Kompromiss im Konjunktiv II vor.', 'Je propose un compromis au Konjunktiv II.'),
        ],
        criteria: [
          { ...GRIDS.b2.sprechen[0], label: aide('Aufgabenerfüllung: Positionen neutral zusammengefasst, Stellungnahme, Widerspruch, Kompromiss, 2–3 Minuten', 'Tâche : synthèse neutre, avis, désaccord, compromis') },
          ...GRIDS.b2.sprechen.slice(1),
        ],
      } },

    // 8 · Bilan du thème et du niveau
    { id: 'b2-zusammenleben-atelier-bilan', kind: 'lesson', title: 'Bilanz: Zusammenleben und Ihr Weg zur Probeprüfung', estimatedMinutes: 8,
      competences: ['lecture'],
      lesson: { description: `${aide('Lesen Sie die Ziele der beiden Module „Zusammenleben“ und die Checkliste für die Probeprüfung. Was können Sie schon sicher? Was möchten Sie vorher noch einmal üben?', 'Relisez les objectifs des modules « Zusammenleben » et la liste avant l’examen blanc : qu’est-ce qui est acquis, que revoir ?')}

ICH KANN …
• Ich kann in einem Konflikt beide Sichtweisen neutral wiedergeben und Positionen von Interessen unterscheiden. [fr?] Je peux reformuler deux points de vue avec neutralité.
• Ich kann Bitten, Kritik und Vorschläge diplomatisch formulieren, auch in angespannten Situationen. [fr?] Je peux m’exprimer avec diplomatie dans une situation tendue.
• Ich kann eine formelle Vermittlungs-E-Mail schreiben. [fr?] Je peux écrire un courriel formel de médiation.
• Ich kann in einer Diskussion Stellung nehmen und einen Kompromiss vorschlagen. [fr?] Je peux prendre position et proposer un compromis.

VOR DER PROBEPRÜFUNG
• Lesen: zuerst die Aufgaben, dann global, selektiv und im Detail lesen; nach Synonymen suchen, nicht nach gleichen Wörtern. [fr?] Lire d’abord les questions ; chercher les synonymes.
• Hören: beim ersten Hören das Thema und die Sprecher erfassen, beim zweiten die Notizen ergänzen; auf Signalwörter achten (aber, allerdings, da muss ich widersprechen). [fr?] Repérer thème, locuteurs et mots-signaux.
• Schreiben: fünf Minuten planen, mit Absätzen und Konnektoren schreiben, Register prüfen (du oder Sie), am Ende die Zeit für die Kontrolle einplanen. [fr?] Planifier, structurer, vérifier le registre et garder du temps pour relire.
• Sprechen: frei sprechen mit Stichwörtern, anknüpfen, begründen, Beispiele geben, höflich widersprechen. [fr?] Parler à partir de mots-clés, rebondir, justifier, illustrer.

NOCH NICHT SICHER?
${aide('Funktionsverbgefüge und Konjunktiv II: Lesen Sie noch einmal die Regel im Modul „Zusammenleben“. Redemittel der Diskussion: Wiederholen Sie die Übungen „Diskutieren“ der Module Gesellschaft, Kultur und Zusammenleben. Prüfungsformate: Machen Sie die Übungen „Prüfungstraining“ der letzten Module noch einmal unter Zeitdruck.', 'Relisez la règle du module, refaites les exercices de discussion et les entraînements à l’examen en temps limité.')}` } },
  ],
};
