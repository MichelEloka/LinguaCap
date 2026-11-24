// Module B2 n° 10 · atelier « Wohnen » (lot R6). Écrire formellement et présenter un exposé : modèles annotés (lettre
// formelle à la ville, début d'exposé structuré), réagir à des arguments sur les locations touristiques (-diskussion,
// 4 répétitions), médiation du français vers l'allemand (comparer deux annonces et un règlement intérieur pour un
// collègue germanophone), erreurs typiques de la lettre formelle, entraînement au format Lesen (commentaires de
// lecteurs : qui pense quoi ?), deux missions sur grille B2 (prise de position écrite adressée à la ville, exposé).
import { C2, aide, choice, fill, order, match, speakB2, GRIDS } from '../../lib.mjs';

/** « Wer sagt das? » : une question par affirmation, les quatre auteurs des commentaires comme options. */
const AUTOREN = ['Ilse T.', 'Yusuf A.', 'Saskia R.', 'Jörg W.'];
const wer = (id, statement, author, explanation) => choice(id, aide(`Wer äußert diese Meinung? „${statement}“`, 'Qui exprime cette opinion ?'),
  AUTOREN.map((name) => [name, name === author]), explanation);

export default {
  id: 'b2-wohnen-atelier',
  title: 'Wohnen – Werkstatt: formell schreiben und überzeugend vortragen',
  objective: 'Écrire une prise de position formelle adressée à la ville (150 à 250 mots), présenter un exposé structuré de trois à quatre minutes sur la ville et la campagne, transmettre en allemand deux annonces et un règlement rédigés en français, et s’entraîner au format Lesen (commentaires de lecteurs : qui pense quoi ?).',
  grammarFocus: [],
  sources: [
    'Textes, dialogues et exercices originaux LinguaCap. Personnes, adresses, annonces et chiffres fictifs ; les valeurs du graphique sont des exemples, non des statistiques.',
  ],

  vocabulary: [
    { word: 'Ich wende mich an Sie, weil …', partOfSpeech: 'expression', translation: 'Je m’adresse à vous parce que …',
      example: 'Ich wende mich an Sie, weil in unserem Haus Wohnungen leer stehen.', note: 'sich wenden an + accusatif' },
    { word: 'Stellung nehmen zu', partOfSpeech: 'expression', translation: 'prendre position sur',
      example: 'Ich möchte zum geplanten Verkauf der Schule Stellung nehmen.', note: '+ datif ; die Stellungnahme : la prise de position' },
    { word: 'Ich möchte Sie bitten, … zu …', partOfSpeech: 'expression', translation: 'Je voudrais vous prier de …',
      example: 'Ich möchte Sie bitten, die Genehmigungen zu überprüfen.', note: null },
    { word: 'Ich würde es begrüßen, wenn …', partOfSpeech: 'expression', translation: 'Je verrais d’un bon œil que …',
      example: 'Ich würde es begrüßen, wenn die Stadt eine Bürgerversammlung organisiert.', note: 'registre soutenu' },
    { word: 'in Betracht ziehen', partOfSpeech: 'expression', translation: 'envisager, prendre en considération',
      example: 'Bitte ziehen Sie unseren Vorschlag in Betracht.', note: 'zog, hat gezogen' },
    { word: 'Für Rückfragen stehe ich Ihnen gern zur Verfügung.', partOfSpeech: 'expression', translation: 'Je reste à votre disposition pour toute question.',
      example: 'Für Rückfragen stehe ich Ihnen gern zur Verfügung. Mit freundlichen Grüßen', note: 'formule finale d’une lettre formelle' },
    { word: 'In meinem Vortrag geht es um …', partOfSpeech: 'expression', translation: 'Mon exposé porte sur …',
      example: 'In meinem Vortrag geht es um die Frage, wo junge Familien wohnen sollten.', note: null },
    { word: 'Zunächst …, anschließend …, zum Schluss …', partOfSpeech: 'expression', translation: 'D’abord …, ensuite …, pour finir …',
      example: 'Zunächst erkläre ich die Situation, anschließend nenne ich Argumente.', note: 'annoncer le plan' },
    { word: 'Abschließend lässt sich sagen, dass …', partOfSpeech: 'expression', translation: 'Pour conclure, on peut dire que …',
      example: 'Abschließend lässt sich sagen, dass beide Wohnformen Vorteile haben.', note: null },
    { word: 'Stellungnahme', article: 'die', plural: 'Stellungnahmen', partOfSpeech: 'noun', translation: 'la prise de position, l’avis',
      example: 'Bürger können bis zum 15. Mai eine Stellungnahme abgeben.', note: null },
    { word: 'Bekanntmachung', article: 'die', plural: 'Bekanntmachungen', partOfSpeech: 'noun', translation: 'l’avis officiel, la publication officielle',
      example: 'Die Stadt hat eine Bekanntmachung im Amtsblatt veröffentlicht.', note: null },
    { word: 'Bürgerinitiative', article: 'die', plural: 'Bürgerinitiativen', partOfSpeech: 'noun', translation: 'le collectif de citoyens',
      example: 'Eine Bürgerinitiative sammelt Unterschriften gegen den Verkauf.', note: null },
    { word: 'Genehmigung', article: 'die', plural: 'Genehmigungen', partOfSpeech: 'noun', translation: 'l’autorisation',
      example: 'Für eine Ferienwohnung braucht man oft eine Genehmigung.', note: 'genehmigen : autoriser' },
    { word: 'Nebenkosten', article: 'die', plural: null, partOfSpeech: 'noun', translation: 'les charges (locatives)',
      example: 'Die Miete beträgt 780 Euro plus 120 Euro Nebenkosten.', note: 'toujours au pluriel' },
    { word: 'Kaution', article: 'die', plural: 'Kautionen', partOfSpeech: 'noun', translation: 'le dépôt de garantie',
      example: 'Die Kaution beträgt drei Monatsmieten.', note: null },
    { word: 'möbliert', partOfSpeech: 'adjective', translation: 'meublé',
      example: 'Er sucht eine möblierte Wohnung für ein Jahr.', note: null },
    { word: 'Erdgeschoss', article: 'das', plural: 'Erdgeschosse', partOfSpeech: 'noun', translation: 'le rez-de-chaussée',
      example: 'Die Wohnung liegt im Erdgeschoss und hat einen Garten.', note: 'der erste Stock : le premier étage' },
  ],

  media: [
    { key: 'b2-wohnen-atelier-modell-audio', kind: 'audio', title: 'Modèle : le début d’un exposé',
      script: [
        { voice: 'mann2', name: 'Dariusz Wilk', text: 'Guten Tag zusammen. In meinem Vortrag geht es um die Frage, ob Städte leer stehende Bürogebäude in Wohnungen umwandeln sollten. Zunächst erkläre ich kurz die Situation, anschließend nenne ich Argumente dafür und dagegen, und zum Schluss sage ich Ihnen meine eigene Meinung.' },
        { voice: 'mann2', name: 'Dariusz Wilk', text: 'Zur Situation: Infolge der vielen Arbeit im Homeoffice stehen in manchen Städten ganze Bürohäuser leer. Gleichzeitig suchen Tausende Menschen eine Wohnung.' },
        { voice: 'mann2', name: 'Dariusz Wilk', text: 'Für eine Umwandlung spricht vor allem, dass man keine neuen Flächen braucht. Dagegen spricht, dass ein Umbau teuer ist und dass Büros oft sehr tief sind, sodass viele Räume kein Tageslicht hätten.' },
        { voice: 'mann2', name: 'Dariusz Wilk', text: 'Ein Beispiel aus meiner Heimatstadt: Dort wurde ein altes Verwaltungsgebäude zu sechzig Studentenwohnungen umgebaut, und alle waren innerhalb eines Monats vermietet.' },
        { voice: 'mann2', name: 'Dariusz Wilk', text: 'Abschließend lässt sich sagen: Nicht jedes Büro eignet sich, aber angesichts der Wohnungsnot sollten Städte jede Möglichkeit prüfen. Vielen Dank für Ihre Aufmerksamkeit. Haben Sie Fragen?' },
      ] },
    { key: 'b2-wohnen-atelier-diskussion-satz1', kind: 'audio', title: 'Débat : argument 1',
      script: [{ voice: 'mann2', name: 'Herr Lüdemann', text: 'Wenn ich meine Wohnung an Touristen vermiete, ist das meine Sache. Die Stadt hat mir nicht vorzuschreiben, was ich mit meinem Eigentum mache.' }] },
    { key: 'b2-wohnen-atelier-diskussion-satz2', kind: 'audio', title: 'Débat : argument 2',
      script: [{ voice: 'frau3', name: 'Frau Demirel', text: 'Seit es in unserem Haus drei Ferienwohnungen gibt, kommen jedes Wochenende neue Leute mit Rollkoffern. Ruhe gibt es bei uns nicht mehr.' }] },
    { key: 'b2-wohnen-atelier-diskussion-satz3', kind: 'audio', title: 'Débat : argument 3',
      script: [{ voice: 'mann3', name: 'Herr Ostendorf', text: 'Touristen bringen Geld in die Stadt. Ohne Ferienwohnungen verlieren unsere Cafés und Geschäfte viele Kunden.' }] },
    { key: 'b2-wohnen-atelier-diskussion-satz4', kind: 'audio', title: 'Débat : question de l’animatrice',
      script: [{ voice: 'frau', name: 'Moderatorin', text: 'Wir haben zwei Positionen gehört. Gibt es einen Weg, beide Seiten zu berücksichtigen?' }] },
    { key: 'b2-wohnen-atelier-mediation-dokumente', kind: 'image', title: 'Deux annonces et un règlement (en français)',
      alt: 'Deux annonces de location à Lyon et à Villeurbanne et un extrait de règlement intérieur, en français : loyer, surface, animaux, vélos, jardin, bruit.',
      image: { layout: 'cards', cards: [
        { title: 'Annonce A · Lyon 3e', icon: 'building', lines: ['T2 meublé, 45 m², 3e étage avec ascenseur, à 10 minutes à pied de la gare Part-Dieu.', 'Loyer : 890 € charges comprises. Disponible le 1er mars. Bail d’un an minimum. Animaux non acceptés.'] },
        { title: 'Annonce B · Villeurbanne', icon: 'house', lines: ['T2 meublé, 52 m², rez-de-chaussée avec petit jardin, à 20 minutes à vélo de la gare Part-Dieu.', 'Loyer : 780 € + 120 € de charges. Disponible immédiatement. Animaux acceptés avec l’accord du propriétaire. Local vélos sécurisé.'] },
        { title: 'Règlement intérieur (B)', icon: 'clipboard-list', lines: ['Vélos dans le local prévu, interdits dans les couloirs. Animaux tenus en laisse dans les parties communes.', 'Jardin entretenu par le locataire (tonte de la pelouse). Pas de bruit entre 22 h et 7 h. Poubelles sorties le mardi et le vendredi soir.'] },
      ] } },
    { key: 'b2-wohnen-atelier-pruefung-forum', kind: 'image', title: 'Commentaires de lecteurs : la maison individuelle',
      alt: 'Quatre commentaires de lecteurs sous un article sur la maison individuelle : liberté de choix, prix trop élevés, consommation de terrain, maisons vides dans les centres.',
      image: { layout: 'forum', title: 'Das Einfamilienhaus – ein Auslaufmodell? Ihre Meinung', posts: [
        { author: 'Ilse T., 62', text: 'Mein Mann und ich haben dreißig Jahre für unser Haus gespart, und wir haben es nie bereut. Dass Politiker jungen Familien diesen Traum ausreden wollen, finde ich anmaßend. Wie man wohnen möchte, sollte jeder selbst entscheiden dürfen. Da hat sich der Staat herauszuhalten.' },
        { author: 'Yusuf A., 35', text: 'Wir sind zu viert und wohnen in einer Dreizimmerwohnung. Ein eigenes Haus wäre schön, aber bei den heutigen Preisen ist das für uns unbezahlbar. Ehrlich gesagt fände ich ein Reihenhaus völlig in Ordnung: weniger Fläche, geringere Kosten, und die Kinder hätten trotzdem einen Garten.' },
        { author: 'Saskia R., 28', text: 'Neue Baugebiete am Ortsrand verbrauchen wertvolle Flächen, und wer dort wohnt, braucht für jeden Einkauf das Auto. Das passt nicht in eine Zeit, in der wir über Klimaschutz reden. Ich wohne selbst auf dem Dorf, aber in einer Wohnung über der alten Bäckerei, und mir fehlt nichts.' },
        { author: 'Jörg W., 51', text: 'Das eigentliche Problem sind nicht die neuen Häuser, sondern die leeren alten. In unserem Ort stehen im Zentrum zwölf Häuser leer, während am Rand ein Baugebiet entsteht. Die Gemeinden sollten Familien beim Kauf und bei der Sanierung alter Häuser helfen, statt immer neue Flächen freizugeben.' },
      ] } },
    { key: 'b2-wohnen-atelier-schreiben-bekanntmachung', kind: 'image', title: 'Avis officiel : vente de l’ancienne école',
      alt: 'Avis officiel de la ville : projet de vente de l’ancienne école de la Lindenstraße à un investisseur pour 24 appartements ; prises de position possibles jusqu’au 15 mai.',
      image: { layout: 'document', variant: 'sign', icon: 'landmark', title: 'Öffentliche Bekanntmachung', subtitle: 'Amt für Stadtentwicklung',
        lines: ['Verkauf des Grundstücks „Alte Lindenschule“, Lindenstraße 12',
          'Die Stadt beabsichtigt, das seit drei Jahren leer stehende Schulgebäude an einen privaten Investor zu verkaufen. Geplant sind 24 Eigentumswohnungen.',
          'Bürgerinnen und Bürger können bis zum 15. Mai schriftlich Stellung nehmen, per Post oder über das Bürgerportal.'] } },
    { key: 'b2-wohnen-atelier-sprechen-grafik', kind: 'image', title: 'Graphique : loyers moyens (exemples)',
      alt: 'Graphique en barres : loyer moyen hors charges au mètre carré, valeurs d’exemple — grande ville 14,20 €, ville moyenne 9,80 €, petite ville 7,60 €, village 6,10 €.',
      image: { layout: 'chart', title: 'Durchschnittliche Kaltmiete pro Quadratmeter', unit: '€/m²', highlight: 0,
        bars: [{ label: 'Großstadt', value: 14.2 }, { label: 'Mittelstadt', value: 9.8 }, { label: 'Kleinstadt', value: 7.6 }, { label: 'Dorf', value: 6.1 }],
        source: 'Beispielwerte (fiktiv), nur für diese Übung' } },
  ],

  activities: [
    // 1 · Modèles annotés
    { id: 'b2-wohnen-atelier-modell', kind: 'lesson', title: 'Modell: ein formeller Brief und ein gegliederter Vortrag', estimatedMinutes: 12,
      competences: ['lecture', 'ecoute'],
      lesson: { description: `MODELL: EIN FORMELLER BRIEF AN DIE STADT
[fr?] Modèle : une lettre formelle à la ville
${aide('Amadou Kane wohnt seit elf Jahren in einem Mietshaus. Immer mehr Wohnungen im Haus werden an Touristen vermietet. Er schreibt an die Stadtverwaltung. Achten Sie auf den Aufbau und auf den formellen Stil.', 'Amadou Kane habite depuis onze ans dans un immeuble où de plus en plus de logements sont loués à des touristes. Il écrit à la mairie. Observez la structure et le style formel.')}

Betreff: Ferienwohnungen im Haus Gartenstraße 8 – Bitte um Überprüfung
Sehr geehrte Damen und Herren,
ich wende mich an Sie als Mieter im Haus Gartenstraße 8, in dem ich seit elf Jahren wohne.
Innerhalb der letzten zwei Jahre wurden in unserem Haus vier von zwölf Wohnungen in Ferienwohnungen umgewandelt. Seitdem wechseln die Gäste fast täglich. Aufgrund des ständigen Lärms im Treppenhaus, auch nach 22 Uhr, finden viele Familien kaum noch Ruhe. Zudem fehlen diese Wohnungen auf dem Mietmarkt, obwohl in unserer Stadt bekanntlich Wohnungsnot herrscht.
Soweit ich weiß, ist die dauerhafte Vermietung an Touristen ohne Genehmigung nicht erlaubt. Ich möchte Sie daher bitten, zu überprüfen, ob für diese Wohnungen eine Genehmigung vorliegt. Darüber hinaus würde ich es begrüßen, wenn die Stadt die Mieterinnen und Mieter bei einer Informationsveranstaltung über ihre Rechte informieren könnte.
Für Rückfragen stehe ich Ihnen gern zur Verfügung.
Mit freundlichen Grüßen
Amadou Kane

AUFBAU
[fr?] Structure
1. ${aide('Betreff: Thema und Anliegen in einer Zeile.', 'Objet : le sujet et la demande en une ligne.')}
2. ${aide('Einleitung: Wer schreibt, und in welcher Rolle?', 'Introduction : qui écrit, et à quel titre ?')}
3. ${aide('Sachverhalt: Fakten mit Zahlen und Zeitangaben, ohne Übertreibung.', 'Les faits : chiffres et dates, sans exagération.')}
4. ${aide('Begründung: Folgen für die Bewohner und für die Stadt.', 'Justification : conséquences pour les habitants et pour la ville.')}
5. ${aide('Bitten: eine klare Hauptbitte, eventuell ein zweiter Wunsch.', 'Demandes : une demande principale claire, éventuellement un second souhait.')}
6. ${aide('Schluss: Angebot für Rückfragen und Grußformel.', 'Conclusion : disponibilité et formule de politesse.')}

REDEMITTEL FÜR DEN FORMELLEN BRIEF
[fr?] Formules pour la lettre formelle
• ${aide('Einleiten: Ich wende mich an Sie, weil … · Ich möchte zu … Stellung nehmen.', 'Introduire.')}
• ${aide('Begründen: Aufgrund … · Angesichts … · Hinzu kommt, dass …', 'Justifier.')}
• ${aide('Bitten: Ich möchte Sie bitten, … zu … · Ich würde es begrüßen, wenn … · Bitte ziehen Sie … in Betracht.', 'Demander.')}
• ${aide('Schließen: Für Rückfragen stehe ich Ihnen gern zur Verfügung. · Mit freundlichen Grüßen', 'Conclure.')}

MODELL: EINEN VORTRAG GLIEDERN
[fr?] Modèle : structurer un exposé
${aide('Hören Sie den Anfang und das Ende eines Vortrags von Dariusz Wilk. Achten Sie darauf, wie er das Thema nennt, die Gliederung ankündigt, abwägt, ein Beispiel gibt und ein Fazit zieht.', 'Écoutez le début et la fin de l’exposé de Dariusz Wilk : sujet, annonce du plan, arguments, exemple, conclusion.')}
• ${aide('Einleitung: In meinem Vortrag geht es um … · Zunächst …, anschließend …, zum Schluss …', 'Introduction et plan.')}
• ${aide('Argumente: Für … spricht vor allem, dass … · Dagegen spricht, dass …', 'Arguments.')}
• ${aide('Beispiel: Ein Beispiel aus meiner Heimatstadt: …', 'Exemple.')}
• ${aide('Schluss: Abschließend lässt sich sagen, … · Vielen Dank für Ihre Aufmerksamkeit.', 'Conclusion.')}` },
      placements: [{ media: 'b2-wohnen-atelier-modell-audio', caption: 'Vortrag von Dariusz Wilk' }] },

    // 2 · Réagir à des arguments
    { id: 'b2-wohnen-atelier-diskussion', kind: 'exercise', title: 'Diskutieren: Ferienwohnungen in der Innenstadt?', estimatedMinutes: 12,
      competences: ['ecoute', 'expression-orale'],
      lesson: { description: `${C2.argument}

SITUATION
[fr?] La situation
${aide('Bei einer Bürgerversammlung wird diskutiert, ob die Stadt Ferienwohnungen in der Innenstadt begrenzen soll. Hören Sie jede Äußerung und wählen Sie die Reaktion, die sachlich, höflich und konstruktiv ist.', 'Lors d’une réunion publique, on débat de la limitation des locations touristiques en centre-ville. Choisissez à chaque fois la réaction factuelle, polie et constructive.')}
${aide('Sprechen Sie danach vier Reaktionen laut nach.', 'Répétez ensuite quatre réactions à voix haute.')}` },
      placements: [
        { media: 'b2-wohnen-atelier-diskussion-satz1', questionId: 'q1', transcriptVisibility: 'after_answer' },
        { media: 'b2-wohnen-atelier-diskussion-satz2', questionId: 'q2', transcriptVisibility: 'after_answer' },
        { media: 'b2-wohnen-atelier-diskussion-satz3', questionId: 'q3', transcriptVisibility: 'after_answer' },
        { media: 'b2-wohnen-atelier-diskussion-satz4', questionId: 'q4', transcriptVisibility: 'after_answer' },
      ],
      questions: [
        choice('q1', aide('Äußerung 1 (Herr Lüdemann, Vermieter): Was antworten Sie?', 'Intervention 1 (M. Lüdemann, propriétaire) : que répondez-vous ?'),
          [['Eigentum ist wichtig, aber jede Ferienwohnung fehlt auf dem Mietmarkt.', true],
            ['Da haben Sie völlig recht, Touristen sind eben die besseren Mieter.'],
            ['Dann vermieten Sie doch einfach an mich, ich suche gerade eine Wohnung.'],
            ['Mit Leuten wie Ihnen kann man leider überhaupt nicht diskutieren.']],
          aide('Die passende Reaktion erkennt das Recht auf Eigentum an und bringt ein sachliches Gegenargument: Die Wohnung fehlt Menschen, die dauerhaft eine Wohnung suchen. Die anderen Antworten sind unlogisch, nicht ernst gemeint oder persönlich angreifend.',
            'Reconnaître le droit de propriété, puis opposer un argument de fond.')),
        choice('q2', aide('Äußerung 2 (Frau Demirel, Mieterin): Was antworten Sie?', 'Intervention 2 (Mme Demirel, locataire) : que répondez-vous ?'),
          [['Rollkoffer sind doch wirklich nicht so schlimm, da müssen Sie eben durch.'],
            ['Das verstehe ich. Wäre eine Obergrenze pro Haus aus Ihrer Sicht eine Lösung?', true],
            ['Ziehen Sie doch einfach aufs Land, da ist es bestimmt viel ruhiger als hier.'],
            ['Das Problem haben wir in unserer Straße zum Glück überhaupt nicht, wissen Sie.']],
          aide('Frau Demirel beschreibt eine Belastung. Eine gute Reaktion zeigt zuerst Verständnis und führt dann mit einer Frage zu einer Lösung. Die anderen Antworten verharmlosen das Problem, geben einen unpassenden Rat oder reden von sich selbst.',
            'Montrer de la compréhension, puis orienter vers une solution.')),
        choice('q3', aide('Äußerung 3 (Herr Ostendorf, Gewerbeverein): Was antworten Sie?', 'Intervention 3 (M. Ostendorf, association des commerçants) : que répondez-vous ?'),
          [['Cafés und Geschäfte gibt es in der Innenstadt ohnehin viel zu viele.'],
            ['Touristen bringen eigentlich nur Müll und Lärm, sonst gar nichts.'],
            ['Das stimmt teilweise, aber für Touristen gibt es auch Hotels und Pensionen.', true],
            ['Das Geld ist mir völlig egal, Hauptsache, es ist endlich wieder ruhig.']],
          aide('„Das stimmt teilweise, aber …“ erkennt das wirtschaftliche Argument an und relativiert es: Touristen können auch in Hotels übernachten. Die anderen Antworten übertreiben oder ignorieren das Argument.',
            'Concéder en partie, puis nuancer.')),
        choice('q4', aide('Äußerung 4 (Moderatorin): Was antworten Sie?', 'Intervention 4 (animatrice) : que répondez-vous ?'),
          [['Nein, eine Seite muss gewinnen, sonst bringt die ganze Diskussion nichts.'],
            ['Darüber sollten wir vielleicht erst in ein paar Jahren wieder sprechen.'],
            ['Beide Seiten haben unrecht, deshalb sollten wir jetzt am besten gar nichts tun.'],
            ['Vielleicht: Ferienwohnungen nur mit Genehmigung und höchstens 90 Tage im Jahr.', true]],
          aide('Die Moderatorin fragt nach einem Kompromiss. Die passende Antwort macht einen konkreten Vorschlag, der beide Seiten berücksichtigt: Vermietung bleibt möglich, aber begrenzt. Die anderen Antworten lehnen einen Kompromiss ab oder vertagen die Frage.',
            'Une proposition concrète qui tient compte des deux camps.')),
        speakB2('q5', 'Eigentum ist wichtig, aber jede Ferienwohnung fehlt auf dem Mietmarkt.',
          aide('Betonen Sie die Gegenüberstellung: „EIGENTUM ist wichtig, aber jede FERIENWOHNUNG fehlt …“. Machen Sie vor „aber“ eine kleine Pause.',
            'Accentuez l’opposition ; petite pause avant « aber ».')),
        speakB2('q6', 'Das verstehe ich. Wäre eine Obergrenze pro Haus aus Ihrer Sicht eine Lösung?',
          aide('Zuerst Verständnis, dann eine Frage im Konjunktiv II (wäre). Bei der Entscheidungsfrage steigt die Stimme am Ende.',
            'Question fermée : intonation montante à la fin.')),
        speakB2('q7', 'Das stimmt teilweise, aber für Touristen gibt es auch Hotels und Pensionen.',
          aide('„Teilweise“ wird auf der ersten Silbe betont: TEIL-weise. „Pensionen“: Das „s“ spricht man stimmlos, die Betonung liegt auf „-sio-“.',
            'Accent sur TEIL- ; « Pensionen » accentué sur -sio-.')),
        speakB2('q8', 'Mein Vorschlag wäre, Ferienwohnungen nur mit Genehmigung und höchstens neunzig Tage im Jahr zu erlauben.',
          aide('Ein Vorschlag mit „Mein Vorschlag wäre, … zu …“: Der Infinitiv mit „zu“ steht am Ende. „Genehmigung“ wird auf der zweiten Silbe betont: ge-NEH-mi-gung.',
            'Accent sur -NEH- dans « Genehmigung ».'),
          ['Mein Vorschlag wäre, Ferienwohnungen nur mit Genehmigung und höchstens neunzig Tage im Jahr zu erlauben.',
            'Mein Vorschlag wäre, Ferienwohnungen nur mit Genehmigung und höchstens 90 Tage im Jahr zu erlauben.']),
      ] },

    // 3 · Médiation du français vers l'allemand
    { id: 'b2-wohnen-atelier-mediation', kind: 'exercise', title: 'Vermitteln: Wohnungsanzeigen aus dem Französischen erklären', estimatedMinutes: 16,
      competences: ['lecture', 'expression-ecrite'],
      lesson: { description: `SITUATION
[fr?] La situation
${aide('Ihr Kollege Mattis aus Hamburg arbeitet ab März ein Jahr lang in der Filiale in Lyon, in der Nähe des Bahnhofs Part-Dieu. Er spricht kaum Französisch. Er sucht eine möblierte Wohnung, möchte mit dem Fahrrad zur Arbeit fahren, kann höchstens 1 000 Euro warm bezahlen und hat einen kleinen Hund. Sie haben zwei Anzeigen und die Hausordnung zu Wohnung B gefunden.', 'Votre collègue Mattis, de Hambourg, travaillera un an à Lyon près de la gare Part-Dieu à partir de mars. Il parle à peine français, cherche un meublé, veut aller au travail à vélo, ne peut pas payer plus de 1 000 euros charges comprises et a un petit chien. Vous avez trouvé deux annonces et le règlement de l’immeuble B.')}

DIE ANZEIGEN UND DIE HAUSORDNUNG
[fr?] Les annonces et le règlement (en français)
Annonce A · Lyon 3e : T2 meublé, 45 m², 3e étage avec ascenseur, à 10 minutes à pied de la gare Part-Dieu. Loyer : 890 € charges comprises. Disponible le 1er mars. Bail d’un an minimum. Animaux non acceptés.
Annonce B · Villeurbanne : T2 meublé, 52 m², rez-de-chaussée avec petit jardin, à 20 minutes à vélo de la gare Part-Dieu. Loyer : 780 € + 120 € de charges. Disponible immédiatement. Animaux acceptés avec l’accord du propriétaire. Local vélos sécurisé.
Règlement intérieur (immeuble B) : Les vélos doivent être rangés dans le local prévu à cet effet ; ils sont interdits dans les couloirs. Les animaux doivent être tenus en laisse dans les parties communes. Le jardin privatif est entretenu par le locataire (tonte de la pelouse). Aucun bruit entre 22 h et 7 h. Les poubelles sont sorties le mardi et le vendredi soir.

STRATEGIE
[fr?] Stratégie
• ${aide('Nicht übersetzen, sondern auswählen: Was ist für Mattis wichtig? Budget, Hund, Fahrrad, Einzugstermin.', 'Ne pas traduire, mais sélectionner ce qui compte pour Mattis : budget, chien, vélo, date d’entrée.')}
• ${aide('Französische Abkürzungen erklären: „T2“ heißt Zweizimmerwohnung, „charges comprises“ heißt warm.', 'Expliquer les abréviations françaises.')}
• ${aide('Vergleichen und eine Empfehlung mit Begründung geben.', 'Comparer et recommander en justifiant.')}` },
      placements: [{ media: 'b2-wohnen-atelier-mediation-dokumente', caption: 'Zwei Anzeigen und eine Hausordnung' }],
      questions: [
        fill('q1', aide('Ergänzen Sie Ihre Notizen für Mattis auf Deutsch.', 'Complétez vos notes pour Mattis, en allemand.'),
          'Wohnung A: [[1]] Euro warm, Haustiere nicht erlaubt · Wohnung B: zusammen [[2]] Euro warm (780 + 120), im Erdgeschoss mit kleinem [[3]] · mit dem Rad [[4]] Minuten bis zum Bahnhof · Hund in B nur mit Zustimmung des [[5]]',
          [['890'], ['900'], ['Garten'], ['20', 'zwanzig'], ['Vermieters', 'Eigentümers', 'Besitzers']],
          aide('„Charges comprises“ heißt: Nebenkosten inklusive, also 890 Euro warm. Bei B kommen 120 Euro Nebenkosten zur Kaltmiete von 780 Euro dazu: 900 Euro warm. „Rez-de-chaussée“ ist das Erdgeschoss, „à 20 minutes à vélo“ heißt 20 Minuten mit dem Rad, „l’accord du propriétaire“ die Zustimmung des Vermieters (Genitiv).',
            'charges comprises = warm ; propriétaire = Vermieter / Eigentümer (génitif : des Vermieters).')),
        choice('q2', aide('Welche Wohnung empfehlen Sie Mattis, und mit welcher Begründung?', 'Quel logement recommandez-vous à Mattis, et pourquoi ?'),
          [['Wohnung A, weil sie näher am Büro ist und Hunde dort erlaubt sind.'],
            ['Wohnung B, weil sie im Budget liegt und der Hund mit Zustimmung erlaubt ist.', true],
            ['Wohnung B, weil sie billiger ist und Hunde dort ohne Bedingung erlaubt sind.'],
            ['Wohnung A, weil sie größer ist und einen sicheren Fahrradraum hat.']],
          aide('In A sind Tiere verboten („Animaux non acceptés“), das schließt A für Mattis aus. B kostet 900 Euro warm und liegt damit im Budget; der Hund ist erlaubt, aber nur mit Zustimmung des Vermieters. A ist außerdem kleiner (45 m²), und der Fahrradraum gehört zu B.',
            'A exclut les animaux ; B respecte le budget, chien accepté sous condition.')),
        choice('q3', aide('Mattis fragt: „Kann ich mein Fahrrad im Flur abstellen?“ Was antworten Sie?', 'Mattis demande s’il peut laisser son vélo dans le couloir. Que répondez-vous ?'),
          [['Ja, im Flur ist das erlaubt, solange es die Nachbarn nicht stört.'], ['Nein, im Flur ist es verboten, aber es gibt einen sicheren Fahrradraum.', true],
            ['Nein, Fahrräder sind in diesem Haus leider komplett verboten.'], ['Ja, aber nur am Dienstag und am Freitagabend nach 22 Uhr.']],
          aide('„Les vélos doivent être rangés dans le local prévu à cet effet ; ils sont interdits dans les couloirs.“ Fahrräder sind also erlaubt, aber nur im Fahrradraum. Dienstag und Freitag betreffen die Mülltonnen.',
            'Interdits dans les couloirs, autorisés dans le local à vélos.')),
        match('q4', aide('Wie erklären Sie die französischen Ausdrücke auf Deutsch? Ordnen Sie zu.', 'Comment expliquer ces expressions françaises en allemand ? Associez.'),
          [['charges comprises', 'warm, mit Nebenkosten'], ['bail d’un an minimum', 'Mietvertrag für mindestens ein Jahr'], ['tenus en laisse', 'an der Leine'],
            ['rez-de-chaussée', 'im Erdgeschoss'], ['tonte de la pelouse', 'den Rasen mähen']],
          aide('Gute Mediation sucht die deutsche Entsprechung, nicht die Wort-für-Wort-Übersetzung: „charges comprises“ wird in Anzeigen zu „warm“, „bail“ ist der Mietvertrag, „tenir en laisse“ heißt „an der Leine führen“.',
            'Chercher l’équivalent allemand usuel, pas le mot à mot.')),
        order('q5', aide('Erklären Sie Mattis eine Regel in einem Satz. Bilden Sie den Satz.', 'Expliquez une règle à Mattis en une phrase. Remettez les mots dans l’ordre.'),
          [['Wenn', 'du', 'den Hund', 'mitbringen', 'willst,', 'musst', 'du', 'vorher', 'den Vermieter', 'fragen.'],
            ['Wenn', 'du', 'den Hund', 'mitbringen', 'willst,', 'musst', 'du', 'den Vermieter', 'vorher', 'fragen.']],
          aide('Im wenn-Satz steht das Modalverb „willst“ am Ende, nach dem Infinitiv. Im Hauptsatz folgen „musst du“ und am Ende der Infinitiv „fragen“. „Vorher“ kann vor oder nach dem Objekt stehen.',
            'Modal en fin de subordonnée ; « vorher » avant ou après l’objet.')),
        choice('q6', aide('Mattis fragt: „Muss ich mich in Wohnung B um den Garten kümmern?“ Was antworten Sie?', 'Mattis demande s’il doit s’occuper du jardin. Que répondez-vous ?'),
          [['Nein, das macht der Hausmeister jeden Dienstag.'], ['Ja, du musst als Mieter selbst den Rasen mähen.', true],
            ['Nein, der Garten gehört allen Mietern zusammen.'], ['Ja, aber nur, wenn du den Hund mitbringst.']],
          aide('„Le jardin privatif est entretenu par le locataire (tonte de la pelouse)“: Der Garten gehört zur Wohnung, und der Mieter pflegt ihn selbst. Von einem Hausmeister steht in der Hausordnung nichts.',
            'jardin privatif = jardin privé ; entretenu par le locataire.')),
      ] },

    // 4 · Erreurs typiques
    { id: 'b2-wohnen-atelier-korrektur', kind: 'exercise', title: 'Korrigieren: typische Fehler im formellen Brief', estimatedMinutes: 10,
      competences: ['lecture', 'expression-ecrite'],
      lesson: { description: `${aide('Diese Sätze stammen aus Briefen von Kursteilnehmenden an eine Behörde. Finden Sie die richtige Form.', 'Ces phrases viennent de lettres d’apprenants à une administration. Trouvez la forme correcte.')}

KORREKTURZEICHEN
[fr?] Les codes de correction
${aide('St = Stellung im Satz · G = Grammatik · W = Wortschatz · R = Rechtschreibung · A = Register (du oder Sie)', 'St = place des mots ; G = grammaire ; W = vocabulaire ; R = orthographe ; A = registre')}` },
      questions: [
        fill('q1', aide('A: Ergänzen Sie Anrede und Grußformel.', 'A : complétez la formule d’appel et la formule finale.'),
          'Sehr [[1]] Frau Ruhnke, … [[2]] freundlichen Grüßen',
          [['geehrte'], ['Mit']],
          aide('Die formelle Anrede heißt „Sehr geehrte Frau …“ (für einen Mann: „Sehr geehrter Herr …“). Die Grußformel beginnt mit „Mit“ und wird großgeschrieben, weil sie am Anfang der Zeile steht.',
            'Sehr geehrte / geehrter ; Mit freundlichen Grüßen.')),
        hints(fill('q2', aide('G: Ergänzen Sie den Artikel im Genitiv.', 'G : complétez avec l’article au génitif.'),
          'Ich schreibe Ihnen wegen [[1]] geplanten Verkaufs der Lindenschule. · Aufgrund [[2]] Lärms auf der Baustelle können wir nicht schlafen.',
          [['des'], ['des']],
          aide('„Der Verkauf“ und „der Lärm“ sind maskulin: Genitiv „des“, und das Nomen bekommt -s (Verkaufs, Lärms). Im formellen Brief schreibt man nach „wegen“ den Genitiv, nicht „wegen dem“.',
            'Masculin au génitif : des … -s ; à l’écrit formel, wegen + génitif.')),
        'der Verkauf', 'der Lärm'),
        fill('q3', aide('W: Ergänzen Sie das Verb der festen Verbindung.', 'W : complétez avec le verbe de la locution.'),
          'Ich möchte zu dem Projekt Stellung [[1]]. · Bitte [[2]] Sie unseren Vorschlag in Betracht.',
          [['nehmen'], ['ziehen']],
          aide('„Stellung nehmen zu“ und „in Betracht ziehen“ sind feste Verbindungen. „Stellung geben“ oder „in Betracht nehmen“ gibt es nicht.',
            'Stellung nehmen zu = prendre position sur ; in Betracht ziehen = prendre en considération.')),
        order('q4', aide('St: Bilden Sie den Satz richtig.', 'St : remettez les mots dans le bon ordre.'),
          [['Ich', 'wäre', 'Ihnen', 'dankbar,', 'wenn', 'Sie', 'meinen Vorschlag', 'in Betracht', 'ziehen', 'könnten.']],
          aide('Im Nebensatz mit „wenn“ steht das konjugierte Modalverb „könnten“ ganz am Ende, nach dem Infinitiv „ziehen“. Die Nomen-Verb-Verbindung bleibt zusammen: in Betracht ziehen.',
            'Le verbe conjugué « könnten » ferme la subordonnée.')),
        choice('q5', aide('A: Welcher Schluss passt zu einem formellen Brief an die Stadt?', 'A : quelle fin convient à une lettre formelle à la ville ?'),
          [['Melde dich einfach, wenn du noch Fragen hast!'], ['Ich warte auf Ihre Antwort, und zwar schnell.'],
            ['Für Rückfragen stehe ich Ihnen gern zur Verfügung.', true], ['Tschüss und bis bald, Ihre Nachbarin aus Nummer 8']],
          aide('Die feste Formel „Für Rückfragen stehe ich Ihnen gern zur Verfügung“ ist höflich und sachlich. „Du“ ist im Brief an eine Behörde falsch, und „und zwar schnell“ wirkt unhöflich und fordernd.',
            'Formule figée, polie et neutre.')),
        choice('q6', aide('W: Welcher Satz ist richtig?', 'W : quelle phrase est correcte ?'),
          [['Der Gemeinderat soll bald eine Entscheidung machen.'], ['Der Gemeinderat soll bald eine Entscheidung nehmen.'],
            ['Der Gemeinderat soll bald eine Entscheidung stellen.'], ['Der Gemeinderat soll bald eine Entscheidung treffen.', true]],
          aide('Man „trifft“ eine Entscheidung. „Eine Entscheidung machen“ ist ein typischer Fehler nach dem Muster „prendre / faire une décision“. „Nehmen“ und „stellen“ passen ebenfalls nicht.',
            'prendre une décision = eine Entscheidung treffen.')),
      ] },

    // 5 · Entraînement au format : Lesen (commentaires de lecteurs)
    { id: 'b2-wohnen-atelier-pruefung', kind: 'exercise', title: 'Prüfungstraining: Leserkommentare – wer meint was?', estimatedMinutes: 20,
      competences: ['lecture'],
      lesson: { description: `PRÜFUNGSTRAINING LESEN
[fr?] Entraînement à l’examen : lecture
${aide('Unter einem Zeitungsartikel mit dem Titel „Das Einfamilienhaus – ein Auslaufmodell?“ haben vier Personen kommentiert. Lesen Sie die Kommentare. Zu jeder Aussage passt genau eine Person; eine Person kann mehrmals die Lösung sein.', 'Sous un article intitulé « La maison individuelle, un modèle dépassé ? », quatre personnes ont réagi. À chaque affirmation correspond une seule personne ; une personne peut être la réponse plusieurs fois.')}

ZEIT
[fr?] Temps
${aide('Etwa 15 Minuten für das Lesen und die Aufgaben, 5 Minuten zum Überprüfen.', 'Environ 15 minutes de lecture et de réponse, 5 minutes de vérification.')}

STRATEGIE
[fr?] Stratégie
1. ${aide('Lesen Sie zuerst jeden Kommentar und fassen Sie die Position in drei Wörtern zusammen, zum Beispiel: „Staat raushalten“.', 'Lisez chaque commentaire et résumez sa position en trois mots.')}
2. ${aide('Die Aussagen benutzen andere Wörter als die Kommentare. Suchen Sie Synonyme: „unbezahlbar“ = „kann es sich nicht leisten“.', 'Les affirmations reformulent : cherchez les synonymes.')}
3. ${aide('Achtung bei ähnlichen Themen: Zwei Personen sprechen über das Dorf, aber mit verschiedenen Argumenten.', 'Attention : deux personnes parlent du village, mais avec des arguments différents.')}

DIE KOMMENTARE
Ilse T., 62: Mein Mann und ich haben dreißig Jahre für unser Haus gespart, und wir haben es nie bereut. Dass Politiker jungen Familien diesen Traum ausreden wollen, finde ich anmaßend. Wie man wohnen möchte, sollte jeder selbst entscheiden dürfen. Da hat sich der Staat herauszuhalten.
Yusuf A., 35: Wir sind zu viert und wohnen in einer Dreizimmerwohnung. Ein eigenes Haus wäre schön, aber bei den heutigen Preisen ist das für uns unbezahlbar. Ehrlich gesagt fände ich ein Reihenhaus völlig in Ordnung: weniger Fläche, geringere Kosten, und die Kinder hätten trotzdem einen Garten.
Saskia R., 28: Neue Baugebiete am Ortsrand verbrauchen wertvolle Flächen, und wer dort wohnt, braucht für jeden Einkauf das Auto. Das passt nicht in eine Zeit, in der wir über Klimaschutz reden. Ich wohne selbst auf dem Dorf, aber in einer Wohnung über der alten Bäckerei, und mir fehlt nichts.
Jörg W., 51: Das eigentliche Problem sind nicht die neuen Häuser, sondern die leeren alten. In unserem Ort stehen im Zentrum zwölf Häuser leer, während am Rand ein Baugebiet entsteht. Die Gemeinden sollten Familien beim Kauf und bei der Sanierung alter Häuser helfen, statt immer neue Flächen freizugeben.` },
      placements: [{ media: 'b2-wohnen-atelier-pruefung-forum', caption: 'Leserkommentare' }],
      questions: [
        wer('q1', 'Der Staat sollte sich aus der Frage, wie man wohnt, heraushalten.', 'Ilse T.',
          aide('Ilse T.: „Wie man wohnen möchte, sollte jeder selbst entscheiden dürfen. Da hat sich der Staat herauszuhalten.“ Die anderen fordern im Gegenteil, dass Gemeinden oder Politik handeln (Jörg W.) oder argumentieren mit dem Klimaschutz (Saskia R.).',
            'Ilse T. refuse l’intervention de l’État.')),
        wer('q2', 'Ein eigenes Haus wäre schön, ist aber zu teuer.', 'Yusuf A.',
          aide('Yusuf A.: „Ein eigenes Haus wäre schön, aber bei den heutigen Preisen ist das für uns unbezahlbar.“ „Unbezahlbar“ entspricht „zu teuer“. Ilse T. besitzt bereits ein Haus.',
            'unbezahlbar = hors de prix.')),
        wer('q3', 'Ohne Auto kommt man in neuen Siedlungen am Ortsrand kaum aus.', 'Saskia R.',
          aide('Saskia R.: „Wer dort wohnt, braucht für jeden Einkauf das Auto.“ „Dort“ bezieht sich auf die Baugebiete am Ortsrand. Jörg W. spricht zwar auch vom Ortsrand, aber über den Leerstand im Zentrum, nicht über das Auto.',
            'Saskia R. : dépendance à la voiture.')),
        wer('q4', 'Es ist widersprüchlich, neu zu bauen, während alte Häuser leer stehen.', 'Jörg W.',
          aide('Jörg W.: „In unserem Ort stehen im Zentrum zwölf Häuser leer, während am Rand ein Baugebiet entsteht.“ Das Wort „während“ zeigt hier den Gegensatz, den die Aussage „widersprüchlich“ nennt.',
            '« während » exprime ici l’opposition.')),
        wer('q5', 'Eine kleinere Hausform wäre ein guter Kompromiss.', 'Yusuf A.',
          aide('Yusuf A. findet „ein Reihenhaus völlig in Ordnung: weniger Fläche, geringere Kosten“. Das ist ein Kompromiss zwischen Wohnung und freistehendem Haus. Saskia R. wohnt in einer Wohnung, schlägt aber keine Hausform vor.',
            'La maison mitoyenne comme compromis.')),
        wer('q6', 'Gemeinden sollten den Kauf alter Gebäude finanziell unterstützen.', 'Jörg W.',
          aide('Jörg W.: „Die Gemeinden sollten Familien beim Kauf und bei der Sanierung alter Häuser helfen.“ Helfen heißt hier vor allem finanziell unterstützen. Saskia R. lobt zwar ihre Wohnung in einem alten Haus, macht aber keinen Vorschlag an die Gemeinden.',
            'Jörg W. demande une aide aux communes.')),
        wer('q7', 'Der Klimaschutz spricht gegen neue Baugebiete.', 'Saskia R.',
          aide('Saskia R.: „Das passt nicht in eine Zeit, in der wir über Klimaschutz reden.“ Sie ist die Einzige, die mit dem Klima argumentiert.',
            'Seule Saskia R. invoque le climat.')),
      ] },

    // 6 · Mission écrite : prise de position formelle
    { id: 'b2-wohnen-atelier-schreiben', kind: 'mission', title: 'Mission: Stellung nehmen in einem Brief an die Stadt', estimatedMinutes: 28,
      competences: ['expression-ecrite'],
      lesson: { description: `SITUATION
[fr?] La situation
${aide('In Ihrem Viertel steht seit drei Jahren die alte Lindenschule leer. Die Stadt will das Gebäude an einen Investor verkaufen, der dort 24 Eigentumswohnungen bauen möchte. Eine Bürgerinitiative schlägt vor, dort bezahlbare Mietwohnungen und einen Nachbarschaftstreff einzurichten. Die Stadt bittet bis zum 15. Mai um Stellungnahmen.', 'Dans votre quartier, l’ancienne école de la Lindenstraße est vide depuis trois ans. La ville veut la vendre à un investisseur qui y ferait 24 appartements en copropriété. Un collectif propose plutôt des logements à loyer abordable et un lieu de rencontre. La ville recueille les avis jusqu’au 15 mai.')}

DIE BEKANNTMACHUNG
[fr?] L’avis officiel
Öffentliche Bekanntmachung · Amt für Stadtentwicklung
Verkauf des Grundstücks „Alte Lindenschule“, Lindenstraße 12
Die Stadt beabsichtigt, das seit drei Jahren leer stehende Schulgebäude an einen privaten Investor zu verkaufen. Geplant sind 24 Eigentumswohnungen.
Bürgerinnen und Bürger können bis zum 15. Mai schriftlich Stellung nehmen, per Post oder über das Bürgerportal.

SO GEHEN SIE VOR
[fr?] Démarche
1. ${aide('Planen (6 Minuten): Wofür sind Sie? Sammeln Sie zwei Argumente und einen konkreten Vorschlag.', 'Planifier (6 minutes) : quelle position ? Deux arguments et une proposition concrète.')}
2. ${aide('Schreiben (17 Minuten): Folgen Sie dem Aufbau aus dem Brief von Amadou Kane.', 'Écrire (17 minutes) : suivez la structure de la lettre d’Amadou Kane.')}
3. ${aide('Prüfen (5 Minuten): Lesen Sie mit der Checkliste. Achten Sie auf Genitivformen und feste Verbindungen.', 'Vérifier (5 minutes) : relisez avec la liste ; attention au génitif et aux locutions.')}` },
      placements: [{ media: 'b2-wohnen-atelier-schreiben-bekanntmachung', caption: 'Bekanntmachung der Stadt' }],
      mission: {
        oral: null,
        written: { prompt: aide('Schreiben Sie an das Amt für Stadtentwicklung (150 bis 250 Wörter). Beziehen Sie sich auf die Bekanntmachung und sagen Sie, wer Sie sind. Nehmen Sie Stellung zum geplanten Verkauf und begründen Sie Ihre Position mit mindestens zwei Argumenten. Machen Sie einen konkreten Vorschlag und formulieren Sie eine Bitte an die Stadt. Achten Sie auf einen formellen Stil.',
          'Écrivez au service de l’urbanisme (150 à 250 mots) : référence à l’avis, qui vous êtes, votre position argumentée (deux arguments au moins), une proposition concrète et une demande à la ville, dans un style formel.'),
          maxChars: 2400, minWords: 150 },
        checklist: [
          aide('Betreff, formelle Anrede und Bezug auf die Bekanntmachung', 'Objet, formule d’appel formelle, référence à l’avis'),
          aide('Meine Position und mindestens zwei Argumente', 'Ma position et au moins deux arguments'),
          aide('Ein konkreter Vorschlag und eine klare Bitte', 'Une proposition concrète et une demande claire'),
          aide('Formeller Stil: Genitivpräpositionen, Nomen-Verb-Verbindungen, Konjunktiv II', 'Style formel : prépositions au génitif, locutions, subjonctif II'),
          aide('Schluss mit Angebot für Rückfragen und Grußformel', 'Fin avec disponibilité et formule de politesse'),
        ],
        criteria: [
          { ...GRIDS.b2.schreiben[0], label: aide('Aufgabe: Bezug, Position mit zwei Argumenten, Vorschlag und Bitte, formelles Register (Sie)', 'Tâche : référence, position argumentée, proposition, demande, registre formel') },
          ...GRIDS.b2.schreiben.slice(1),
        ],
      } },

    // 7 · Mission orale : exposé
    { id: 'b2-wohnen-atelier-sprechen', kind: 'mission', title: 'Mission: ein Vortrag über Stadt und Land', estimatedMinutes: 20,
      competences: ['expression-orale'],
      lesson: { description: `SITUATION
[fr?] La situation
${aide('In Ihrem Deutschkurs hält jede Person einen kurzen Vortrag. Ihr Thema: „Stadt oder Land – wo sollten junge Familien heute wohnen?“ Die Grafik zeigt Beispielwerte für die Miete pro Quadratmeter.', 'Dans votre cours, chacun présente un court exposé. Votre sujet : « Ville ou campagne : où les jeunes familles devraient-elles vivre aujourd’hui ? » Le graphique donne des loyers d’exemple au mètre carré.')}

DIE GRAFIK
[fr?] Le graphique
Durchschnittliche Kaltmiete pro Quadratmeter (Beispielwerte): Großstadt 14,20 Euro · Mittelstadt 9,80 Euro · Kleinstadt 7,60 Euro · Dorf 6,10 Euro

IHR VORTRAG
[fr?] Votre exposé
1. ${aide('Einleitung: Nennen Sie das Thema und kündigen Sie die Gliederung an.', 'Introduction : annoncez le sujet et le plan.')}
2. ${aide('Kosten: Erklären Sie die Grafik in zwei oder drei Sätzen.', 'Les coûts : commentez le graphique en deux ou trois phrases.')}
3. ${aide('Vor- und Nachteile: Infrastruktur, Arbeit, Lebensqualität, Umwelt.', 'Avantages et inconvénients : infrastructures, travail, qualité de vie, environnement.')}
4. ${aide('Beispiel: Wie ist es in Ihrem Herkunftsland oder in Ihrer Stadt?', 'Un exemple de votre pays ou de votre ville.')}
5. ${aide('Fazit: Ihre begründete Meinung und eine Empfehlung.', 'Conclusion : votre avis justifié et une recommandation.')}

VORBEREITUNG
[fr?] Préparation
${aide('Hören Sie noch einmal den Vortrag von Dariusz Wilk. Überlegen Sie sich Stichwörter zu jedem Punkt, aber lesen Sie nicht ab. Sprechen Sie drei bis vier Minuten.', 'Réécoutez l’exposé de Dariusz Wilk. Préparez des mots-clés pour chaque partie, sans lire. Parlez trois à quatre minutes.')}` },
      placements: [{ media: 'b2-wohnen-atelier-sprechen-grafik', caption: 'Kaltmiete pro Quadratmeter (Beispielwerte)' }],
      mission: {
        oral: { prompt: aide('Halten Sie einen Vortrag zum Thema „Stadt oder Land – wo sollten junge Familien heute wohnen?“ (drei bis vier Minuten). Nennen Sie Thema und Gliederung, erklären Sie die Grafik, wägen Sie Vor- und Nachteile ab, geben Sie ein Beispiel und schließen Sie mit Ihrer begründeten Meinung.',
          'Présentez un exposé sur ce sujet (trois à quatre minutes) : sujet et plan, commentaire du graphique, avantages et inconvénients, un exemple, conclusion argumentée.'),
          maxSeconds: 240 },
        written: null,
        checklist: [
          aide('Einleitung mit Thema und Gliederung („Zunächst …, anschließend …“)', 'Introduction avec sujet et plan'),
          aide('Die Grafik in eigenen Worten erklärt', 'Le graphique expliqué avec mes mots'),
          aide('Vor- und Nachteile von Stadt und Land, mit Beispiel', 'Avantages et inconvénients, avec un exemple'),
          aide('Fazit mit begründeter Meinung („Abschließend lässt sich sagen …“)', 'Conclusion avec un avis justifié'),
        ],
        criteria: [
          { ...GRIDS.b2.sprechen[0], label: aide('Aufgabe: Gliederung angekündigt, Grafik erklärt, Vor- und Nachteile, Beispiel, Fazit in drei bis vier Minuten', 'Tâche : plan, graphique, pour et contre, exemple, conclusion') },
          ...GRIDS.b2.sprechen.slice(1),
        ],
      } },

    // 8 · Bilan
    { id: 'b2-wohnen-atelier-bilan', kind: 'lesson', title: 'Bilanz: Wohnen', estimatedMinutes: 6,
      competences: ['lecture'],
      lesson: { description: `${aide('Lesen Sie die Ziele der beiden Module „Wohnen“. Was können Sie schon sicher? Was möchten Sie noch üben?', 'Relisez les objectifs des deux modules « Wohnen ». Qu’est-ce qui est acquis ? Que voulez-vous encore travailler ?')}

ICH KANN …
[fr?] Je peux…
• ${aide('Ich kann eine Reportage und eine Radiodiskussion über Wohnen verstehen und die Positionen unterscheiden.', 'Je peux comprendre un reportage et un débat sur le logement et distinguer les positions.')}
• ${aide('Ich kann einen formellen Brief an eine Behörde schreiben und darin Stellung nehmen.', 'Je peux écrire une lettre formelle à une administration et y prendre position.')}
• ${aide('Ich kann einen Vortrag gliedern, eine Grafik erklären und ein Fazit ziehen.', 'Je peux structurer un exposé, commenter un graphique et conclure.')}
• ${aide('Ich kann Informationen aus französischen Wohnungsanzeigen auf Deutsch vergleichen und erklären.', 'Je peux comparer et expliquer en allemand des annonces de logement françaises.')}
• ${aide('Ich kann in Leserkommentaren erkennen, wer welche Meinung vertritt.', 'Je peux repérer qui défend quelle opinion dans des commentaires de lecteurs.')}

STRATEGIEN
[fr?] Stratégies
• ${aide('Formell schreiben: Nomen-Verb-Verbindungen und Genitivpräpositionen gezielt einsetzen, aber nicht übertreiben.', 'Écrire formellement : employer locutions et génitif à bon escient, sans excès.')}
• ${aide('Vortragen: Gliederung ankündigen und mit Signalwörtern durch den Vortrag führen.', 'Exposer : annoncer le plan et guider l’auditoire avec des mots de structure.')}
• ${aide('Mediation: nicht übersetzen, sondern das Wichtige für die Person auswählen und vergleichen.', 'Médiation : sélectionner et comparer ce qui compte pour la personne.')}

NOCH NICHT SICHER?
[fr?] Pas encore sûr ?
${aide('Genitivpräpositionen und „von“ + Dativ: Wiederholen Sie die Regel im Modul „Wohnen“. Nomen-Verb-Verbindungen: Machen Sie die Übungen „Üben“ und „Korrigieren“ noch einmal und lernen Sie jede Verbindung als Ganzes.', 'Prépositions au génitif et von + datif : revoyez la règle du module « Wohnen ». Locutions verbo-nominales : refaites les exercices et apprenez chaque locution en bloc.')}` } },
  ],
};

/** Indices affichés sous les trous d'un fill (forme de base à transformer). */
function hints(question, ...values) {
  return { ...question, blanks: question.blanks.map((blank, index) => (values[index] ? { ...blank, hint: values[index] } : blank)) };
}
