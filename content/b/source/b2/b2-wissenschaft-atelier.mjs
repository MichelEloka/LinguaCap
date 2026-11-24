// Module B2 n° 18 · atelier « Wissenschaft » (lot R7, thème 9). Rendre compte et vulgariser : modèle annoté (compte rendu
// d'une conférence et extrait d'exposé sur une invention), réagir à des arguments sur la recherche spatiale (choix et
// 4 répétitions), médiation (vulgariser un texte scientifique original pour un collégien), erreurs typiques, entraînement
// au format Hören (exposé d'un historien des techniques, 7 questions), deux missions sur grille B2 : compte rendu de
// l'exposé à partir de notes (écrit) et présentation d'une invention en 3 à 4 minutes (oral).
// Médiation : texte scientifique original et non adapté de Wikipédia (décision Q6 du plan : CC BY-SA réservé aux médias).
// Consignes, règles et explications en allemand avec aide française repliée ([fr?]) ; lexique traduit en français.
import { C2, aide, choice, fill, order, speakB2, GRIDS } from '../../lib.mjs';

/** Indices affichés sous les trous d'un fill (forme de base à transformer). */
const hints = (question, ...values) => ({ ...question,
  blanks: question.blanks.map((blank, index) => (values[index] ? { ...blank, hint: values[index] } : blank)) });

export default {
  id: 'b2-wissenschaft-atelier',
  title: 'Wissenschaft – Werkstatt: berichten, vereinfachen, vortragen',
  objective: 'Rédiger le compte rendu d’une conférence à partir de notes, vulgariser un texte scientifique pour un collégien, défendre un point de vue nuancé sur la recherche spatiale, s’entraîner à l’écoute d’un exposé (format B2) et présenter une invention en trois à quatre minutes.',
  grammarFocus: [],
  sources: [
    'Textes, dialogues et exercices originaux LinguaCap. Personnes, conférence et notes sont fictives.',
    'Texte de médiation sur le sens magnétique des oiseaux migrateurs rédigé pour LinguaCap d’après l’état général des connaissances (mécanisme encore à l’étude). Repères historiques arrondis : voitures électriques vers 1900, visiophonie présentée dans les années 1960.',
  ],

  vocabulary: [
    { word: 'Bericht', article: 'der', plural: 'Berichte', partOfSpeech: 'noun', translation: 'le compte rendu, le rapport',
      example: 'Für den Kursblog schreibe ich einen Bericht über den Vortrag.', note: 'berichten über + accusatif' },
    { word: 'Vortrag', article: 'der', plural: 'Vorträge', partOfSpeech: 'noun', translation: 'la conférence, l’exposé',
      example: 'Der Vortrag war gut besucht.', note: 'einen Vortrag halten : faire un exposé' },
    { word: 'Referent', article: 'der', plural: 'Referenten', partOfSpeech: 'noun', translation: 'l’intervenant, le conférencier',
      example: 'Der Referent beantwortete im Anschluss viele Fragen.', note: 'n-Deklination : den, dem, des Referenten · féminin : die Referentin' },
    { word: 'Im Mittelpunkt stand …', partOfSpeech: 'expression', translation: 'au centre se trouvait …',
      example: 'Im Mittelpunkt stand die Frage, warum sich manche Erfindungen spät durchsetzen.', note: null },
    { word: 'erläutern', partOfSpeech: 'verb', translation: 'expliquer (en détail)',
      example: 'Die Referentin erläuterte, wie das Projekt funktioniert.', note: 'die Erläuterung' },
    { word: 'betonen', partOfSpeech: 'verb', translation: 'souligner',
      example: 'Er betonte, dass eine Idee allein nicht genüge.', note: 'souvent suivi du discours indirect (Konjunktiv I)' },
    { word: 'laut', partOfSpeech: 'preposition', translation: 'selon, d’après',
      example: 'Laut dem Referenten fuhr um 1900 jedes dritte Auto elektrisch.', note: '+ datif (ou génitif) ; souvent sans article : laut Studie' },
    { word: 'im Anschluss an', partOfSpeech: 'expression', translation: 'à la suite de, après',
      example: 'Im Anschluss an den Vortrag wurden viele Fragen gestellt.', note: '+ accusatif · im Anschluss : ensuite' },
    { word: 'Zusammenfassend lässt sich sagen, dass …', partOfSpeech: 'expression', translation: 'en résumé, on peut dire que …',
      example: 'Zusammenfassend lässt sich sagen, dass der Vortrag sehr anschaulich war.', note: null },
    { word: 'Innovation', article: 'die', plural: 'Innovationen', partOfSpeech: 'noun', translation: 'l’innovation',
      example: 'Eine Innovation ist eine Erfindung, die sich verbreitet.', note: null },
    { word: 'sich verbreiten', partOfSpeech: 'verb', translation: 'se répandre',
      example: 'Die Videotelefonie hat sich sehr schnell verbreitet.', note: 'die Verbreitung' },
    { word: 'Voraussetzung', article: 'die', plural: 'Voraussetzungen', partOfSpeech: 'noun', translation: 'la condition préalable',
      example: 'Schnelles Internet war die Voraussetzung für Videoanrufe.', note: null },
    { word: 'veranschaulichen', partOfSpeech: 'verb', translation: 'illustrer, rendre concret',
      example: 'Ein Beispiel veranschaulicht die Idee.', note: 'anschaulich : concret, parlant' },
    { word: 'vereinfachen', partOfSpeech: 'verb', translation: 'simplifier',
      example: 'Für Kinder muss man einen Fachtext stark vereinfachen.', note: 'die Vereinfachung' },
    { word: 'Fachbegriff', article: 'der', plural: 'Fachbegriffe', partOfSpeech: 'noun', translation: 'le terme technique',
      example: 'Erklären Sie jeden Fachbegriff mit einfachen Worten.', note: null },
    { word: 'Mit anderen Worten: …', partOfSpeech: 'expression', translation: 'autrement dit : …',
      example: 'Mit anderen Worten: Die Vögel sehen das Magnetfeld vielleicht.', note: 'pour reformuler' },
    { word: 'etwas auf den Punkt bringen', partOfSpeech: 'expression', translation: 'résumer l’essentiel en peu de mots',
      example: 'Am Ende bringt die Referentin alles auf den Punkt.', note: null },
  ],

  media: [
    { key: 'b2-wissenschaft-atelier-modell-audio', kind: 'audio', title: 'Modèle : extrait d’un exposé sur la fermeture éclair',
      script: [
        { voice: 'frau', name: 'Clara Ostrowski', text: 'Guten Tag! Wie oft haben Sie heute schon einen Reißverschluss benutzt? Wahrscheinlich öfter, als Sie denken: an der Jacke, an der Tasche, vielleicht am Mäppchen. Ich möchte Ihnen heute diese kleine Erfindung vorstellen, die unseren Alltag stärker verändert hat, als man glaubt.' },
        { voice: 'frau', name: 'Clara Ostrowski', text: 'Zuerst kurz zur Funktion: Ein Reißverschluss besteht aus zwei Reihen kleiner Zähne und einem Schieber. Wird der Schieber nach oben gezogen, greifen die Zähne ineinander; zieht man ihn nach unten, werden sie wieder getrennt. Das Prinzip ist einfach, aber es hat lange gedauert, bis es zuverlässig funktionierte.' },
        { voice: 'frau', name: 'Clara Ostrowski', text: 'Erfunden wurde der Reißverschluss vor etwa hundertdreißig Jahren. Durchgesetzt hat er sich aber erst Jahrzehnte später, als er billig in großen Mengen hergestellt werden konnte. Vorher schloss man Kleidung mit Knöpfen, Haken oder Bändern, und das dauerte deutlich länger.' },
        { pause: 0.8 },
        { voice: 'frau', name: 'Clara Ostrowski', text: 'Natürlich hat die Erfindung auch Nachteile. Wenn ein Reißverschluss kaputtgeht, ist oft das ganze Kleidungsstück unbrauchbar, und viele Menschen werfen es weg, statt es reparieren zu lassen. Zwar ist eine Reparatur meist nicht teuer, aber sie ist mühsam.' },
        { voice: 'frau', name: 'Clara Ostrowski', text: 'Zusammenfassend lässt sich sagen: Der Reißverschluss ist ein gutes Beispiel dafür, dass nicht nur große Erfindungen unseren Alltag prägen. Ich persönlich finde, wir sollten solche kleinen Dinge öfter reparieren, statt sie wegzuwerfen. Vielen Dank fürs Zuhören!' },
      ] },
    { key: 'b2-wissenschaft-atelier-diskussion-argument1', kind: 'audio', title: 'Argument 1 : l’argent sur Terre',
      script: [{ voice: 'mann2', name: 'Herr Brettschneider', text: 'Wir sollten das Geld lieber für Probleme hier auf der Erde ausgeben, zum Beispiel für Krankenhäuser.' }] },
    { key: 'b2-wissenschaft-atelier-diskussion-argument2', kind: 'audio', title: 'Argument 2 : le tourisme spatial',
      script: [{ voice: 'frau3', name: 'Frau Lindemann', text: 'Die Raumfahrt bringt doch nur reichen Leuten teure Abenteuerreisen ins All.' }] },
    { key: 'b2-wissenschaft-atelier-diskussion-argument3', kind: 'audio', title: 'Argument 3 : Mars, un projet lointain',
      script: [{ voice: 'mann3', name: 'Herr Petzold', text: 'Bis Menschen auf dem Mars leben, werden wir alle längst tot sein. Was bringt uns das heute?' }] },
    { key: 'b2-wissenschaft-atelier-diskussion-argument4', kind: 'audio', title: 'Argument 4 : choisir les projets',
      script: [{ voice: 'frau2', name: 'Frau Oyelaran', text: 'Und wie sollen wir entscheiden, welche Projekte sich wirklich lohnen?' }] },
    { key: 'b2-wissenschaft-atelier-mediation-fachtext', kind: 'image', title: 'Texte scientifique : le sens magnétique des oiseaux migrateurs',
      alt: 'Extrait d’un ouvrage spécialisé, en allemand technique, sur l’orientation des oiseaux migrateurs grâce au champ magnétique terrestre et sur un mécanisme possible dans la rétine.',
      image: { layout: 'document', icon: 'book-open-text', title: 'Orientierung bei Zugvögeln', subtitle: 'Auszug aus einem Fachbuch',
        lines: [
          'Die Orientierung von Zugvögeln beruht auf mehreren Informationsquellen. Neben dem Sonnenstand und dem Sternenhimmel nutzen viele Arten das Erdmagnetfeld.',
          'Als wahrscheinliche Grundlage dieses Magnetsinns gilt ein lichtabhängiger Prozess in der Netzhaut, an dem das Protein Cryptochrom beteiligt ist.',
          'Bei der Absorption von blauem Licht entstehen in diesem Protein kurzlebige Molekülpaare, deren Reaktionen durch die Ausrichtung des Magnetfelds beeinflusst werden.',
          'Experimentelle Befunde zeigen, dass die Orientierung unter Licht bestimmter Wellenlängen sowie bei schwachen elektromagnetischen Störfeldern beeinträchtigt ist. Ein abschließender Nachweis des Mechanismus steht jedoch noch aus.',
        ] } },
    { key: 'b2-wissenschaft-atelier-pruefung-audio', kind: 'audio', title: 'Exposé : pourquoi certaines inventions s’imposent tard',
      script: [
        { voice: 'sprecherin', name: 'Moderatorin', text: 'Herzlich willkommen zum Tag der offenen Hochschule. Unser nächster Vortrag beschäftigt sich mit der Frage, warum sich manche Erfindungen erst spät durchsetzen. Es spricht der Technikhistoriker Ben Hollstein.' },
        { voice: 'sprecher', name: 'Ben Hollstein', text: 'Vielen Dank. Meine Damen und Herren, wussten Sie, dass nach Schätzungen um das Jahr neunzehnhundert in den USA mehr als jedes dritte Auto elektrisch fuhr? Elektroautos waren leise, sauber und leicht zu bedienen. Trotzdem verschwanden sie innerhalb von zwanzig Jahren fast vollständig. Erst hundert Jahre später kamen sie zurück. Wie kann das sein?' },
        { voice: 'sprecher', name: 'Ben Hollstein', text: 'Mein Vortrag hat drei Teile. Zuerst zeige ich, dass eine gute Idee allein nicht genügt. Dann spreche ich über die Bedingungen, unter denen sich eine Innovation durchsetzt. Und zum Schluss frage ich, was wir daraus für heutige Technologien lernen können.' },
        { voice: 'sprecher', name: 'Ben Hollstein', text: 'Erstens: Eine Erfindung ist noch keine Innovation. Von einer Innovation sprechen wir erst, wenn eine neue Technik tatsächlich genutzt wird und sich verbreitet. Viele Erfindungen sind technisch ausgereift, aber sie finden keinen Markt. Beim Elektroauto von damals waren die Batterien schwer und teuer, die Reichweite war gering, und außerhalb der Städte gab es kaum Strom.' },
        { voice: 'sprecher', name: 'Ben Hollstein', text: 'Zweitens: Ob sich eine Innovation durchsetzt, hängt weniger von der Technik selbst ab als von ihrem Umfeld. Dazu gehören die Infrastruktur, also Straßen, Leitungen, Tankstellen oder Ladesäulen, außerdem der Preis und die Gewohnheiten der Menschen. Gewohnheiten ändern sich besonders langsam: Viele Menschen kaufen lieber das, was ihre Nachbarn schon haben und kennen.' },
        { voice: 'sprecher', name: 'Ben Hollstein', text: 'Als das Benzinauto in großen Stückzahlen und damit billiger produziert wurde und überall Tankstellen entstanden, war das Elektroauto nicht mehr konkurrenzfähig.' },
        { voice: 'sprecher', name: 'Ben Hollstein', text: 'Ein zweites Beispiel ist die Videotelefonie. Die Technik war schon vor über sechzig Jahren vorgestellt worden, aber sie war teuer, und kaum jemand hatte ein passendes Gerät. Erst mit schnellem Internet, günstigen Kameras und Smartphones wurde sie alltäglich, und während der Pandemie innerhalb weniger Wochen für Millionen Menschen selbstverständlich.' },
        { voice: 'sprecher', name: 'Ben Hollstein', text: 'Drittens: Was folgt daraus für heute? Wenn wir wollen, dass sich klimafreundliche Technologien schnell verbreiten, reicht es nicht, sie zu erfinden. Wir müssen gleichzeitig die Infrastruktur aufbauen, die Kosten senken und Vertrauen schaffen. Eine Wärmepumpe ist nur dann attraktiv, wenn es genug Fachleute gibt, die sie einbauen können.' },
        { voice: 'sprecher', name: 'Ben Hollstein', text: 'Lassen Sie mich mit einem Gedanken schließen: Die Geschichte der Technik ist keine gerade Linie. Ideen verschwinden und kommen zurück, wenn die Zeit reif ist. Unsere Aufgabe ist es, die Bedingungen dafür zu schaffen, dass das schneller geht als beim Elektroauto. Vielen Dank für Ihre Aufmerksamkeit.' },
        { voice: 'sprecherin', name: 'Moderatorin', text: 'Vielen Dank, Herr Hollstein. Wir haben jetzt noch etwa zehn Minuten Zeit für Ihre Fragen.' },
      ] },
    { key: 'b2-wissenschaft-atelier-schreiben-notizen', kind: 'image', title: 'Notes prises pendant l’exposé',
      alt: 'Notes manuscrites sur l’exposé de Ben Hollstein à la journée portes ouvertes : cadre, thème, exemples des voitures électriques et de la visiophonie, conclusions et questions du public.',
      image: { layout: 'document', icon: 'notebook-pen', title: 'Meine Notizen zum Vortrag', subtitle: 'Tag der offenen Hochschule, Samstag',
        lines: [
          'Hörsaal 3, ca. 120 Gäste, Vortrag: 45 Minuten',
          'Ben Hollstein, Technikhistoriker: Warum setzen sich manche Erfindungen erst spät durch?',
          'Elektroautos um 1900: mehr als jedes dritte Auto in den USA → verschwunden → 100 Jahre später zurück',
          'Erfindung ≠ Innovation · entscheidend: das Umfeld (Infrastruktur, Preis, Gewohnheiten)',
          'Videotelefonie: über 60 Jahre alt, alltäglich erst mit Internet und Smartphone',
          'heute: z. B. Wärmepumpen → brauchen genug Fachleute für den Einbau',
          'Fragen aus dem Publikum: Ladesäulen auf dem Land? Wasserstoff?',
        ] } },
    { key: 'b2-wissenschaft-atelier-sprechen-folie', kind: 'image', title: 'Support de l’exposé : une invention du quotidien',
      alt: 'Support d’exposé : présenter une invention qui a changé le quotidien (lave-linge, GPS, réfrigérateur, internet ou autre), en cinq parties.',
      image: { layout: 'document', icon: 'lightbulb', title: 'Eine Erfindung, die unseren Alltag verändert hat', subtitle: 'Kurzvortrag: 3 bis 4 Minuten',
        lines: [
          'Zur Auswahl: die Waschmaschine · das Navigationsgerät · der Kühlschrank · das Internet · eine eigene Idee',
          '1. Einstieg mit einer Frage oder einem Beispiel',
          '2. Wie funktioniert die Erfindung? (einfach erklärt)',
          '3. Wie hat sie den Alltag verändert? (früher – heute)',
          '4. Nachteile und Kritik · 5. Ihre Meinung und Schluss',
        ] } },
  ],

  activities: [
    // 1 · Modèle annoté
    { id: 'b2-wissenschaft-atelier-modell', kind: 'lesson', title: 'Modell: ein Bericht und ein Kurzvortrag', estimatedMinutes: 12,
      competences: ['lecture', 'ecoute'],
      lesson: { description: `MODELL: EIN BERICHT ÜBER EINEN VORTRAG
[fr?] Modèle : le compte rendu d’une conférence
${aide('Lesen Sie den Bericht von Aleksandra Brzezińska für den Blog ihres Sprachkurses. Achten Sie darauf, wie sie den Rahmen nennt, den Inhalt wiedergibt und ihre eigene Meinung kennzeichnet.', 'Lisez le compte rendu d’Aleksandra Brzezińska pour le blog de son cours. Observez comment elle présente le cadre, rapporte le contenu et signale son avis personnel.')}

Forschen kann jeder – ein Abend über Bürgerwissenschaft
Am vergangenen Donnerstag fand in der Stadtbibliothek ein Vortrag zum Thema Bürgerwissenschaft statt. Referentin war die Biologin Johanna Riedl, die das Projekt „Summ mit“ leitet. Der Saal war mit rund achtzig Gästen gut gefüllt.
Im Mittelpunkt stand die Frage, wie Laien zur Forschung beitragen können. Zunächst erläuterte Frau Riedl, wie das Projekt funktioniert: Freiwillige beobachten im Sommer fünfzehn Minuten lang eine blühende Fläche und melden die Insekten über eine App. Anschließend ging sie auf die Qualität der Daten ein. Sie betonte, alle Fotos würden von Fachleuten geprüft; etwa jede zehnte Meldung werde korrigiert.
Besonders interessant fand ich ein erstes Ergebnis: In Gärten mit heimischen Pflanzen wurden fast doppelt so viele Wildbienen gezählt wie in Gärten mit exotischen Zierpflanzen.
Im Anschluss an den Vortrag wurden zahlreiche Fragen gestellt, etwa zum Datenschutz. Laut Frau Riedl sind die Daten anonymisiert.
Zusammenfassend lässt sich sagen, dass der Vortrag verständlich und anschaulich war. Wer selbst mitmachen möchte: Die App ist ab dem 1. Juni freigeschaltet.

AUFBAU
[fr?] Structure
1. ${aide('Überschrift: Thema, gern mit einem kurzen Zitat oder einer Frage.', 'Titre : le sujet, éventuellement une citation ou une question.')}
2. ${aide('Rahmen: wann, wo, wer, wie viele Gäste (im Präteritum).', 'Cadre : quand, où, qui, combien de personnes (au prétérit).')}
3. ${aide('Thema: „Im Mittelpunkt stand …“', 'Sujet : « Au centre se trouvait … »')}
4. ${aide('Inhalt in der Reihenfolge des Vortrags, neutral wiedergegeben: „erläuterte“, „betonte“, „laut …“, oft im Konjunktiv I.', 'Contenu dans l’ordre, rapporté de façon neutre, souvent au Konjunktiv I.')}
5. ${aide('Eigene Bewertung, deutlich markiert: „Besonders interessant fand ich …“', 'Avis personnel, clairement signalé.')}
6. ${aide('Schluss: Fazit und ein praktischer Hinweis.', 'Conclusion : bilan et information pratique.')}

RAHMEN NENNEN
[fr?] Présenter le cadre
• ${aide('Am vergangenen Donnerstag fand in … ein Vortrag zum Thema … statt.', 'Jeudi dernier a eu lieu à … une conférence sur …')}
• ${aide('Referentin war …, die …', 'L’intervenante était …, qui …')}
INHALT WIEDERGEBEN
[fr?] Rapporter le contenu
• ${aide('Zunächst erläuterte sie, wie … · Anschließend ging sie auf … ein.', 'Elle a d’abord expliqué comment … · Elle a ensuite abordé …')}
• ${aide('Sie betonte, die Daten seien anonymisiert. · Laut Frau Riedl …', 'Elle a souligné que … (Konjunktiv I) · Selon Mme Riedl …')}
BEWERTEN UND SCHLIESSEN
[fr?] Évaluer et conclure
• ${aide('Besonders interessant / überzeugend fand ich …', 'J’ai trouvé particulièrement intéressant / convaincant …')}
• ${aide('Zusammenfassend lässt sich sagen, dass …', 'En résumé, on peut dire que …')}

MODELL: EINE ERFINDUNG VORSTELLEN
[fr?] Modèle : présenter une invention
${aide('Hören Sie den Kurzvortrag von Clara Ostrowski über den Reißverschluss. Achten Sie auf den Einstieg mit einer Frage, die einfache Erklärung, den Vergleich zwischen früher und heute, die Nachteile und den Schluss mit der eigenen Meinung.', 'Écoutez l’exposé de Clara Ostrowski sur la fermeture éclair : question d’ouverture, explication simple, avant et maintenant, inconvénients, conclusion personnelle.')}` },
      placements: [{ media: 'b2-wissenschaft-atelier-modell-audio', caption: 'Clara Ostrowski: Der Reißverschluss', transcriptVisibility: 'on_demand' }] },

    // 2 · Réagir à des arguments
    { id: 'b2-wissenschaft-atelier-diskussion', kind: 'exercise', title: 'Diskutieren: Raumfahrt, ja oder nein?', estimatedMinutes: 12,
      competences: ['ecoute', 'expression-orale'],
      lesson: { description: `SITUATION
[fr?] La situation
${aide('In einer Podiumsdiskussion an der Volkshochschule geht es um die Frage: Ist Raumfahrt Geldverschwendung oder eine Investition in die Zukunft? Sie finden, dass öffentliche Weltraumforschung sinnvoll ist, nehmen aber Kritik ernst.', 'Lors d’un débat public, la question est : la recherche spatiale est-elle un gaspillage ou un investissement d’avenir ? Vous la trouvez utile, mais vous prenez les critiques au sérieux.')}
${C2.argument}
${aide('Sprechen Sie danach die guten Reaktionen laut nach.', 'Répétez ensuite les bonnes réactions à voix haute.')}

TIPP
[fr?] Conseil
${aide('Gehen Sie auf das Argument ein, bevor Sie widersprechen. Ein konkretes Beispiel (Wettervorhersage, Navigation) überzeugt mehr als eine allgemeine Behauptung.', 'Répondez à l’argument avant de le contredire ; un exemple concret convainc davantage.')}` },
      placements: [
        { media: 'b2-wissenschaft-atelier-diskussion-argument1', questionId: 'q1', transcriptVisibility: 'after_answer' },
        { media: 'b2-wissenschaft-atelier-diskussion-argument2', questionId: 'q2', transcriptVisibility: 'after_answer' },
        { media: 'b2-wissenschaft-atelier-diskussion-argument3', questionId: 'q3', transcriptVisibility: 'after_answer' },
        { media: 'b2-wissenschaft-atelier-diskussion-argument4', questionId: 'q4', transcriptVisibility: 'after_answer' },
      ],
      questions: [
        choice('q1', aide('Argument 1: Welche Reaktion passt am besten?', 'Argument 1 : quelle réaction convient le mieux ?'),
          [['Krankenhäuser sind doch heute Abend gar nicht unser Thema, also bleiben wir bitte strikt bei der Raumfahrt.'],
            ['Das ist ein wichtiger Punkt. Allerdings nützen Satelliten auch uns hier, etwa bei der Wettervorhersage.', true],
            ['Da haben Sie recht, Geld für Forschung ist eigentlich immer und überall reine Verschwendung.'],
            ['Das ist ein wichtiger Punkt, deshalb sollten wir noch viel mehr Raketen ins All schicken.']],
          'Die gute Reaktion erkennt das Argument an und zeigt mit einem konkreten Beispiel, dass Raumfahrt auch auf der Erde nützt. Die erste weicht aus, die dritte gibt die eigene Position auf, die vierte zieht einen unlogischen Schluss („deshalb“ passt nicht). [fr?] Reconnaître, puis montrer une utilité concrète sur Terre.'),
        choice('q2', aide('Argument 2: Welche Reaktion passt am besten?', 'Argument 2 : quelle réaction convient le mieux ?'),
          [['Den Weltraumtourismus sehe ich auch kritisch, aber die öffentliche Forschung hat ganz andere Ziele.', true],
            ['Reiche Leute haben eben Glück gehabt, und das muss man ihnen ehrlich gesagt auch einfach gönnen.'],
            ['Den Weltraumtourismus sehe ich auch kritisch, deshalb sollten wir die Forschung sofort beenden.'],
            ['Das stimmt nicht, denn ins All fliegen heute schon fast alle Menschen, die das möchten.']],
          'Die gute Reaktion unterscheidet: Weltraumtourismus (privat, für Reiche) ist nicht dasselbe wie öffentliche Forschung. So stimmt man teilweise zu und widerlegt trotzdem den Kern des Arguments. Die vierte Antwort behauptet etwas offensichtlich Falsches. [fr?] Distinguer le tourisme spatial privé de la recherche publique.'),
        choice('q3', aide('Argument 3: Welche Reaktion passt am besten?', 'Argument 3 : quelle réaction convient le mieux ?'),
          [['Das kann ich Ihnen leider auch nicht sagen, das müssen die Fachleute irgendwann entscheiden.'],
            ['Sie haben völlig recht, dann sollten wir lieber gar nicht mehr in die ferne Zukunft investieren.'],
            ['Mag sein. Aber manche Technik aus der Raumfahrt ist heute schon in unserem Alltag angekommen.', true],
            ['Mag sein, aber bis dahin werden wir den Mars sicher schon längst verlassen haben.']],
          '„Mag sein“ lässt die Zukunftsfrage offen; „aber“ verschiebt das Gespräch auf den Nutzen heute. Achten Sie im Argument auf das Futur II („werden … tot sein“): eine Prognose über einen Zeitpunkt in der Zukunft. Die vierte Antwort ist unsinnig, die erste weicht aus. [fr?] Concéder, puis parler de l’utilité actuelle.'),
        choice('q4', aide('Argument 4: Welche Reaktion passt am besten?', 'Argument 4 : quelle réaction convient le mieux ?'),
          [['Am besten entscheiden wir das einfach spontan, ohne lange und kompliziert darüber nachzudenken.'],
            ['Das ist mir ehrlich gesagt egal, Hauptsache, es fliegen auch in Zukunft weiter Raketen ins All.'],
            ['Ich fände es sinnvoll, wenn wir einfach jedes Jahr per Los ein Projekt auswählen würden.'],
            ['Ich fände es sinnvoll, wenn unabhängige Fachleute die Projekte regelmäßig bewerten würden.', true]],
          'Auf eine offene Frage antwortet man mit einem begründeten Vorschlag im Konjunktiv II: „Ich fände es sinnvoll, wenn … würden.“ Unabhängige Bewertung ist ein sachliches Kriterium; Losverfahren, Spontanentscheidungen oder Gleichgültigkeit sind es nicht. [fr?] Proposer un critère au Konjunktiv II : une évaluation indépendante.'),
        speakB2('q5', 'Das ist ein wichtiger Punkt. Allerdings nützen Satelliten auch uns hier, etwa bei der Wettervorhersage.',
          '„Satelliten“ wird auf der dritten Silbe betont: sa-tel-LI-ten. In „Wettervorhersage“ liegt der Hauptakzent auf dem ersten Teil: WET-ter-vor-her-sa-ge. „Allerdings“ betonen Sie auf der ersten Silbe. [fr?] Accent sur LI dans « Satelliten », sur WET dans « Wettervorhersage ».'),
        speakB2('q6', 'Den Weltraumtourismus sehe ich auch kritisch, aber die öffentliche Forschung hat ganz andere Ziele.',
          '„Weltraumtourismus“ hat den Hauptakzent auf „Welt“, „kritisch“ ein kurzes i. Das „ö“ in „öffentliche“ ist kurz und offen, die Lippen sind gerundet. Machen Sie vor „aber“ eine kleine Pause. [fr?] « ö » bref et arrondi ; petite pause avant « aber ».'),
        speakB2('q7', 'Mag sein. Aber manche Technik aus der Raumfahrt ist heute schon in unserem Alltag angekommen.',
          '„Mag sein“ klingt gelassen: kurze Pause danach. „Raumfahrt“ wird auf „Raum“ betont, das a in „-fahrt“ ist lang. „Angekommen“: AN-ge-kom-men, das trennbare Präfix trägt den Akzent. [fr?] Les préfixes séparables portent l’accent : AN-gekommen.'),
        speakB2('q8', 'Ich fände es sinnvoll, wenn unabhängige Fachleute die Projekte regelmäßig bewerten würden.',
          '„Fände“ ist Konjunktiv II von „finden“, mit offenem ä wie in « mère ». „Unabhängige“ wird auf „un“ betont, „regelmäßig“ auf der ersten Silbe mit langem e: RE-gel-mä-ßig. [fr?] « fände » : ä ouvert ; accent sur UN et sur RE.'),
      ] },

    // 3 · Médiation : vulgariser un texte scientifique
    { id: 'b2-wissenschaft-atelier-mediation', kind: 'exercise', title: 'Vermitteln: einen Fachtext für ein Kind vereinfachen', estimatedMinutes: 15,
      competences: ['lecture', 'expression-ecrite'],
      lesson: { description: `SITUATION
[fr?] La situation
${aide('Ihr Cousin Noah ist dreizehn und muss in der Schule ein Referat über Zugvögel halten. In einem Fachbuch hat er den folgenden Abschnitt gefunden und versteht fast nichts. Erklären Sie ihm das Wichtigste.', 'Votre cousin Noah, 13 ans, prépare un exposé sur les oiseaux migrateurs. Il a trouvé ce passage dans un ouvrage spécialisé et n’y comprend presque rien. Expliquez-lui l’essentiel.')}

ORIENTIERUNG BEI ZUGVÖGELN (AUSZUG AUS EINEM FACHBUCH)
Die Orientierung von Zugvögeln beruht auf mehreren Informationsquellen. Neben dem Sonnenstand und dem Sternenhimmel nutzen viele Arten das Erdmagnetfeld. Als wahrscheinliche Grundlage dieses Magnetsinns gilt ein lichtabhängiger Prozess in der Netzhaut, an dem das Protein Cryptochrom beteiligt ist. Bei der Absorption von blauem Licht entstehen in diesem Protein kurzlebige Molekülpaare, deren Reaktionen durch die Ausrichtung des Magnetfelds beeinflusst werden. Experimentelle Befunde zeigen, dass die Orientierung unter Licht bestimmter Wellenlängen sowie bei schwachen elektromagnetischen Störfeldern beeinträchtigt ist. Ein abschließender Nachweis des Mechanismus steht jedoch noch aus.

AUFGABE
[fr?] Votre tâche
${aide('Wählen Sie aus, was Noah für sein Referat wirklich braucht, ersetzen Sie Fachwörter durch Alltagswörter und formulieren Sie kurze Sätze im Verbalstil.', 'Choisissez ce dont Noah a vraiment besoin, remplacez les termes techniques par des mots courants et formulez des phrases courtes au style verbal.')}
TIPP
[fr?] Conseil
${aide('Ein Vergleich aus dem Alltag hilft: „eine Art Kompass im Auge“. Sagen Sie aber auch ehrlich, was die Forschung noch nicht weiß.', 'Une comparaison du quotidien aide ; dites aussi honnêtement ce que la recherche ignore encore.')}` },
      placements: [{ media: 'b2-wissenschaft-atelier-mediation-fachtext', caption: 'Der Abschnitt aus dem Fachbuch' }],
      questions: [
        fill('q1', aide('Machen Sie einfache Notizen für Noah. Ergänzen Sie.', 'Prenez des notes simples pour Noah. Complétez.'),
          'Zugvögel orientieren sich an der [[1]], an den Sternen und am [[2]] der Erde · den Magnetsinn haben sie wahrscheinlich im [[3]] · dafür brauchen sie [[4]], vor allem blaues · ganz sicher weiß man das noch [[5]]',
          [['Sonne', 'Sonnenstand'], ['Magnetfeld', 'Erdmagnetfeld'], ['Auge', 'in der Netzhaut', 'Netzhaut'], ['Licht'], ['nicht']],
          'Aus „Sonnenstand und Sternenhimmel“ werden „die Sonne“ und „die Sterne“, aus „Netzhaut“ einfach „das Auge“, aus „lichtabhängiger Prozess“ der Satz „dafür brauchen sie Licht“. „Ein abschließender Nachweis steht noch aus“ heißt: Man weiß es noch nicht sicher. [fr?] Remplacer chaque terme technique par un mot courant.'),
        choice('q2', aide('Was ist für Noahs Referat am wichtigsten?', 'Qu’est-ce qui est le plus important pour l’exposé de Noah ?'),
          [['der genaue Name des Proteins und die exakte Wellenlänge des blauen Lichts im Auge'],
            ['dass Vögel das Magnetfeld wohl mit den Augen wahrnehmen und die Forschung noch läuft', true],
            ['welche Geräte im Alltag schwache elektromagnetische Felder erzeugen'],
            ['wie viele verschiedene Arten von Zugvögeln es heute auf der ganzen Welt überhaupt gibt']],
          'Für ein Schulreferat zählt die Kernaussage: Vögel nutzen das Magnetfeld, wahrscheinlich über die Augen, und die Forschung ist noch nicht abgeschlossen. Proteinnamen und Wellenlängen sind für einen Dreizehnjährigen zu speziell; die Zahl der Arten steht nicht im Text. [fr?] Garder le message central et l’incertitude de la recherche.'),
        order('q3', aide('Formulieren Sie für Noah einfach: Bilden Sie den Satz.', 'Formulez simplement pour Noah : remettez les mots dans l’ordre.'),
          [['Forscher', 'glauben,', 'dass', 'Vögel', 'das Magnetfeld', 'mit den Augen', 'wahrnehmen', 'können.'],
            ['Forscher', 'glauben,', 'dass', 'Vögel', 'mit den Augen', 'das Magnetfeld', 'wahrnehmen', 'können.']],
          'Aus dem Nominalstil („Als wahrscheinliche Grundlage gilt ein lichtabhängiger Prozess in der Netzhaut“) wird ein einfacher Satz: „Forscher glauben, dass …“ zeigt, dass es eine Vermutung ist. Im dass-Satz stehen Infinitiv und „können“ am Ende; Objekt und Ortsangabe können die Plätze tauschen. [fr?] « Les chercheurs pensent que les oiseaux perçoivent le champ magnétique avec leurs yeux. »'),
        fill('q4', aide('Erklären Sie zwei Ausdrücke aus dem Fachtext. Ergänzen Sie.', 'Expliquez deux expressions du texte. Complétez.'),
          '„Die Orientierung ist beeinträchtigt“ heißt: Die Vögel finden den Weg dann [[1]]. · „Ein Nachweis steht noch aus“ heißt: Es ist noch nicht [[2]].',
          [['schlechter', 'nicht mehr so gut', 'nicht richtig'], ['bewiesen', 'sicher', 'nachgewiesen']],
          '„Beeinträchtigt“ ist ein Zustandspassiv: Die Orientierung funktioniert schlechter. „Etwas steht noch aus“ bedeutet: Es fehlt noch. Ein Nachweis fehlt, also ist der Mechanismus nicht bewiesen. [fr?] beeinträchtigt = perturbé ; aussteht = manque encore.'),
        choice('q5', aide('Welcher Satz ist für Noah eine gute Erklärung?', 'Quelle phrase est une bonne explication pour Noah ?'),
          [['Bei der Absorption von blauem Licht entstehen in einem Protein kurzlebige Molekülpaare.'],
            ['Die Vögel haben einen kleinen Magneten im Schnabel, das ist schon lange bewiesen.'],
            ['Das ist viel zu kompliziert für dich, frag lieber einfach deine Lehrerin danach.'],
            ['Stell dir vor, die Vögel haben im Auge eine Art Kompass, der mit Licht funktioniert.', true]],
          'Ein Vergleich aus dem Alltag („eine Art Kompass“) und die Anrede mit „du“ passen zu einem Dreizehnjährigen. Der erste Satz übernimmt nur den Fachtext, der zweite ist falsch (der Text spricht vom Auge und sagt, dass noch nichts endgültig bewiesen ist), der dritte hilft Noah nicht. [fr?] Une image du quotidien, le tutoiement, et rien de faux.'),
      ] },

    // 4 · Erreurs typiques
    { id: 'b2-wissenschaft-atelier-korrektur', kind: 'exercise', title: 'Korrigieren: typische Fehler in Berichten', estimatedMinutes: 10,
      competences: ['lecture', 'expression-ecrite'],
      lesson: { description: `${aide('Diese Sätze stammen aus Berichten von Kursteilnehmenden. Finden Sie jeweils die richtige Form.', 'Ces phrases viennent de comptes rendus d’apprenants. Trouvez chaque fois la forme correcte.')}

KORREKTURZEICHEN
[fr?] Les codes de correction
${aide('St (Wortstellung), G (Grammatik), W (Wortschatz), R (Rechtschreibung), A (Register). Jede Frage übt eines davon.', 'Place des mots, grammaire, vocabulaire, orthographe, registre : chaque question en travaille un.')}` },
      questions: [
        choice('q1', aide('G: Welcher Satz ist richtig?', 'G : quelle phrase est correcte ?'),
          [['Seit Montag werden die Ergebnisse online veröffentlicht worden.'],
            ['Seit Montag haben die Ergebnisse online veröffentlicht.'],
            ['Seit Montag sind die Ergebnisse online veröffentlicht.', true],
            ['Seit Montag sind die Ergebnisse online veröffentlichen.']],
          '„Seit Montag“ beschreibt einen Zustand bis heute: Zustandspassiv mit „sind“ + Partizip II. Die erste Form mischt „werden“ und „worden“, die zweite ist Aktiv ohne Objekt, die vierte hat den Infinitiv statt des Partizips. [fr?] « sont publiés depuis lundi » : état → sind veröffentlicht.'),
        hints(fill('q2', aide('G: Geben Sie die Aussagen im Konjunktiv I wieder.', 'G : rapportez les propos au Konjunktiv I.'),
          'Die Referentin erklärte, die Daten [[1]] anonymisiert. · Sie betonte, Bürgerwissenschaft [[2]] die Forschung nicht.',
          [['seien'], ['ersetze']],
          'In Berichten gibt man Aussagen anderer oft im Konjunktiv I wieder: sein → sie seien (Plural), ersetzen → sie ersetze (3. Person Singular, Endung -e). So zeigt der Bericht, dass es sich um die Meinung der Referentin handelt. [fr?] Konjunktiv I : discours rapporté, sans prendre position.'),
        'sein', 'ersetzen'),
        fill('q3', aide('W: Ergänzen Sie.', 'W : complétez.'),
          '[[1]] der Referentin nehmen jedes Jahr mehr Menschen teil. · [[2]] Mittelpunkt des Vortrags stand die Frage, wie Laien forschen können.',
          [['Laut', 'Nach Angaben', 'Nach'], ['Im']],
          '„Laut“ (+ Dativ oder Genitiv) nennt die Quelle einer Aussage, ebenso „nach Angaben“. „Im Mittelpunkt stand …“ ist eine feste Wendung, um das Thema zu nennen: „im“ = „in dem“. [fr?] laut = selon ; im Mittelpunkt = au centre.'),
        choice('q4', aide('A: Welche Formulierung passt in einen Bericht?', 'A : quelle formulation convient dans un compte rendu ?'),
          [['Der Typ hat dann noch ewig und total begeistert über Autos gequatscht.'],
            ['Der Referent erläuterte anschließend die Rolle der Infrastruktur.', true],
            ['Dann redet er halt so über Tankstellen und Ladesäulen und so.'],
            ['Und dann kam noch voll das spannende Beispiel.']],
          'Ein Bericht ist sachlich und steht meist im Präteritum: „Der Referent erläuterte …“. „Der Typ“, „quatschen“, „halt“, „und so“ und „voll“ sind Umgangssprache und passen nicht in einen geschriebenen Bericht. [fr?] Registre neutre et prétérit dans un compte rendu.'),
        fill('q5', aide('G: Ergänzen Sie den Artikel im Genitiv.', 'G : complétez avec l’article au génitif.'),
          'Nach der Begrüßung [[1]] Gäste begann der Vortrag. · Im Anschluss an die Präsentation [[2]] Ergebnisse gab es viele Fragen. · Die Auswertung [[3]] Daten erfolgt im Herbst.',
          [['der'], ['der'], ['der']],
          'Im Nominalstil steht die Ergänzung eines Nomens im Genitiv. Im Plural ist der Artikel immer „der“: die Begrüßung der Gäste, die Präsentation der Ergebnisse, die Auswertung der Daten. Ein häufiger Fehler ist „von die“ statt des Genitivs. [fr?] Génitif pluriel : der (de les → der).'),
        choice('q6', aide('St: Welcher Satz ist richtig?', 'St : quelle phrase est correcte ?'),
          [['Im Anschluss zahlreiche Fragen wurden gestellt.'],
            ['Im Anschluss wurden gestellt zahlreiche Fragen.'],
            ['Im Anschluss sind zahlreiche Fragen gestellt worden sein.'],
            ['Im Anschluss wurden zahlreiche Fragen gestellt.', true]],
          '„Im Anschluss“ besetzt Position 1, das konjugierte „wurden“ folgt sofort, das Subjekt kommt danach, und das Partizip „gestellt“ steht am Satzende. Die erste Antwort übernimmt die französische Wortstellung, die dritte häuft Hilfsverben an. [fr?] Verbe en deuxième position, participe à la fin.'),
        order('q7', C2.ordnen, [['Der Vortrag', 'war', 'gut', 'besucht,', 'und', 'alle Plätze', 'waren', 'besetzt.']],
          'Zwei Hauptsätze mit „und“ verbunden, beide im Zustandspassiv: „war gut besucht“, „waren besetzt“. Nach „und“ bleibt die normale Wortstellung: Subjekt, Verb, Partizip. [fr?] « La conférence était bien fréquentée, et toutes les places étaient occupées. »'),
      ] },

    // 5 · Entraînement au format : Hören (exposé)
    { id: 'b2-wissenschaft-atelier-pruefung', kind: 'exercise', title: 'Prüfungstraining: Hören, ein Vortrag', estimatedMinutes: 22,
      competences: ['ecoute'],
      lesson: { description: `PRÜFUNGSTRAINING HÖREN
[fr?] Entraînement à l’examen : compréhension orale
${aide('Sie hören einen Vortrag am Tag der offenen Hochschule. Lösen Sie die Aufgaben 1 bis 7. Sie hören den Vortrag zweimal.', 'Vous écoutez une conférence lors d’une journée portes ouvertes. Faites les exercices 1 à 7. Vous l’entendez deux fois.')}
ZEIT
[fr?] Temps
${aide('Etwa 20 Minuten. Lesen Sie die Aufgaben vor dem ersten Hören eine Minute lang.', 'Environ 20 minutes. Lisez les questions pendant une minute avant la première écoute.')}

STRATEGIE
[fr?] Stratégie
1. ${aide('Ein Vortrag ist gegliedert: Achten Sie auf die Ankündigung („Mein Vortrag hat drei Teile“) und auf „erstens“, „zweitens“, „drittens“.', 'Une conférence est structurée : repérez l’annonce du plan et les mots « erstens », « zweitens », « drittens ».')}
2. ${aide('Beispiele dienen einer Aussage. Fragen Sie sich beim Hören: Was soll dieses Beispiel zeigen?', 'Les exemples illustrent une idée : demandez-vous ce que chaque exemple doit montrer.')}
3. ${aide('Beim zweiten Hören prüfen Sie vor allem die Antworten, bei denen Sie unsicher waren.', 'À la deuxième écoute, vérifiez surtout les réponses dont vous n’étiez pas sûr.')}` },
      placements: [{ media: 'b2-wissenschaft-atelier-pruefung-audio', caption: 'Vortrag: Warum sich manche Erfindungen spät durchsetzen' }],
      questions: [
        choice('q1', aide('1. Womit beginnt der Referent seinen Vortrag?', '1. Par quoi le conférencier commence-t-il ?'),
          [['mit einer überraschenden Tatsache aus der Geschichte des Autos', true],
            ['mit einer persönlichen Geschichte über sein erstes eigenes Auto'],
            ['mit einer Statistik über die Elektroautos, die heute verkauft werden']],
          'Er beginnt mit einer Frage: „Wussten Sie, dass … um das Jahr neunzehnhundert in den USA mehr als jedes dritte Auto elektrisch fuhr?“ Ein überraschender Einstieg weckt das Interesse des Publikums. Über heutige Verkaufszahlen oder sein eigenes Auto spricht er nicht. [fr?] Un fait historique surprenant pour capter l’attention.'),
        choice('q2', aide('2. Wann spricht der Referent von einer „Innovation“?', '2. Quand le conférencier parle-t-il d’« innovation » ?'),
          [['sobald eine neue Technik zum ersten Mal irgendwo offiziell patentiert worden ist'],
            ['wenn eine Erfindung technisch fehlerfrei und ausgereift ist'],
            ['wenn eine neue Technik tatsächlich genutzt wird und sich verbreitet', true]],
          '„Von einer Innovation sprechen wir erst, wenn eine neue Technik tatsächlich genutzt wird und sich verbreitet.“ Technisch ausgereift sind viele Erfindungen, aber „sie finden keinen Markt“. Von Patenten ist nicht die Rede. [fr?] Une invention devient innovation quand elle se diffuse.'),
        choice('q3', aide('3. Warum verschwanden die frühen Elektroautos?', '3. Pourquoi les premières voitures électriques ont-elles disparu ?'),
          [['Weil die Elektroautos lauter und schmutziger waren als Benzinautos.'],
            ['Weil Benzinautos billiger wurden und überall Tankstellen entstanden.', true],
            ['Weil ein Gesetz Elektroautos in den großen Städten verboten hatte.']],
          '„Als das Benzinauto in großen Stückzahlen und damit billiger produziert wurde und überall Tankstellen entstanden, war das Elektroauto nicht mehr konkurrenzfähig.“ Die Elektroautos waren im Gegenteil „leise, sauber“. Ein Verbot wird nicht erwähnt. [fr?] Prix plus bas et stations-service partout.'),
        choice('q4', aide('4. Was gehört laut Vortrag zum „Umfeld“ einer Innovation?', '4. D’après l’exposé, qu’est-ce qui fait partie de l’« environnement » d’une innovation ?'),
          [['die Infrastruktur, der Preis und die Gewohnheiten der Menschen', true],
            ['vor allem die Erfahrung, das Alter und der gute Ruf des Erfinders'],
            ['die Zahl der Patente und die Größe der beteiligten Forschungslabore']],
          '„Dazu gehören die Infrastruktur, also Straßen, Leitungen, Tankstellen oder Ladesäulen, außerdem der Preis und die Gewohnheiten der Menschen.“ Achten Sie auf Signalwörter wie „dazu gehören“: Danach folgt oft eine Aufzählung, nach der gefragt wird. [fr?] « dazu gehören » annonce une énumération.'),
        choice('q5', aide('5. Was zeigt das Beispiel der Videotelefonie?', '5. Que montre l’exemple de la visiophonie ?'),
          [['Videotelefonie wurde erst während der Pandemie überhaupt erfunden.'],
            ['Eine Technik kann jahrzehntelang existieren, bevor sie alltäglich wird.', true],
            ['Smartphones haben die Qualität von Videoanrufen kaum spürbar verbessert.']],
          'Die Technik „war schon vor über sechzig Jahren vorgestellt worden“, wurde aber erst mit schnellem Internet und Smartphones alltäglich. Die Pandemie hat sie nur schnell verbreitet, nicht erfunden. [fr?] Une technique peut exister des décennies avant de se banaliser.'),
        choice('q6', aide('6. Welche Schlussfolgerung zieht der Referent für heute?', '6. Quelle conclusion le conférencier tire-t-il pour aujourd’hui ?'),
          [['Klimafreundliche Technik setzt sich von selbst durch, wenn sie gut ist.'],
            ['Wir sollten auf neue Erfindungen warten, statt alte Technik zu fördern.'],
            ['Neue Technik braucht zugleich Infrastruktur, niedrigere Kosten und Vertrauen.', true]],
          '„Wir müssen gleichzeitig die Infrastruktur aufbauen, die Kosten senken und Vertrauen schaffen.“ Gerade „von selbst“ setzt sich nach seiner Analyse nichts durch. Das Beispiel der Wärmepumpe zeigt: Es braucht auch genug Fachleute für den Einbau. [fr?] Infrastructure, coûts plus bas et confiance, en même temps.'),
        choice('q7', aide('7. Was meint der Referent mit dem Satz „Die Geschichte der Technik ist keine gerade Linie“?', '7. Que veut dire le conférencier par cette phrase ?'),
          [['Technische Entwicklungen verlaufen immer schneller und ganz ohne jeden Rückschritt.'],
            ['Die meisten Erfinder haben ihre Ideen von anderen Erfindern übernommen.'],
            ['Ideen können verschwinden und später unter besseren Bedingungen zurückkommen.', true]],
          'Direkt danach erklärt er: „Ideen verschwinden und kommen zurück, wenn die Zeit reif ist.“ Das Elektroauto ist das beste Beispiel dafür. Ein bildlicher Ausdruck wird in einem Vortrag oft im nächsten Satz erklärt. [fr?] Les idées peuvent disparaître puis revenir quand le contexte est favorable.'),
      ] },

    // 6 · Mission écrite
    { id: 'b2-wissenschaft-atelier-schreiben', kind: 'mission', title: 'Mission: einen Bericht über einen Vortrag schreiben', estimatedMinutes: 27,
      competences: ['expression-ecrite'],
      lesson: { description: `SITUATION
[fr?] La situation
${aide('Sie waren am Samstag beim Tag der offenen Hochschule und haben den Vortrag von Ben Hollstein gehört (siehe Prüfungstraining). Ihr Sprachkurs hat einen Blog, und Sie sollen einen Bericht darüber schreiben. Grundlage sind Ihre Notizen.', 'Samedi, vous avez assisté à la conférence de Ben Hollstein lors d’une journée portes ouvertes. Vous écrivez un compte rendu pour le blog de votre cours, à partir de vos notes.')}

MEINE NOTIZEN
[fr?] Mes notes
• Hörsaal 3, ca. 120 Gäste, Vortrag: 45 Minuten
• Ben Hollstein, Technikhistoriker: Warum setzen sich manche Erfindungen erst spät durch?
• Elektroautos um 1900: mehr als jedes dritte Auto in den USA → verschwunden → 100 Jahre später zurück
• Erfindung ≠ Innovation · entscheidend: das Umfeld (Infrastruktur, Preis, Gewohnheiten)
• Videotelefonie: über 60 Jahre alt, alltäglich erst mit Internet und Smartphone
• heute: z. B. Wärmepumpen → brauchen genug Fachleute für den Einbau
• Fragen aus dem Publikum: Ladesäulen auf dem Land? Wasserstoff?

SO GEHEN SIE VOR
[fr?] Démarche
1. ${aide('Planen (7 Minuten): Ordnen Sie die Notizen nach dem Aufbau des Modells: Rahmen, Thema, Inhalt, Bewertung, Schluss.', 'Planifier (7 minutes) : classez les notes selon la structure du modèle.')}
2. ${aide('Schreiben (15 Minuten): Machen Sie aus den Stichwörtern ganze Sätze. Geben Sie Aussagen des Referenten mit „laut“, „erläuterte“ oder im Konjunktiv I wieder.', 'Écrire (15 minutes) : transformez les mots-clés en phrases ; rapportez les propos avec « laut », « erläuterte » ou au Konjunktiv I.')}
3. ${aide('Prüfen (5 Minuten): Lesen Sie Ihren Text mit der Checkliste. Achten Sie auf das Präteritum und auf Ihre eigene Meinung, die klar markiert sein soll.', 'Vérifier (5 minutes) : relisez avec la liste ; prétérit et avis personnel bien signalé.')}` },
      placements: [{ media: 'b2-wissenschaft-atelier-schreiben-notizen', caption: 'Meine Notizen zum Vortrag' }],
      mission: {
        oral: null,
        written: { prompt: aide('Schreiben Sie einen Bericht über den Vortrag für den Blog Ihres Sprachkurses (180 bis 250 Wörter). Nennen Sie den Rahmen und das Thema, geben Sie die drei Hauptgedanken mit je einem Beispiel wieder, erwähnen Sie die Fragen aus dem Publikum und schließen Sie mit einer kurzen, deutlich markierten eigenen Bewertung.',
          'Écrivez un compte rendu de la conférence pour le blog de votre cours (180 à 250 mots) : cadre et sujet, trois idées principales avec un exemple chacune, questions du public, et une brève appréciation personnelle clairement signalée.'),
          maxChars: 2400, minWords: 170 },
        checklist: [
          aide('Überschrift und Rahmen: wann, wo, wer, wie viele Gäste', 'Titre et cadre : quand, où, qui, combien'),
          aide('Das Thema ist genannt: „Im Mittelpunkt stand …“', 'Le sujet est annoncé.'),
          aide('Drei Hauptgedanken, je mit einem Beispiel aus den Notizen', 'Trois idées principales, chacune avec un exemple'),
          aide('Aussagen des Referenten sind neutral wiedergegeben (laut, erläuterte, Konjunktiv I).', 'Les propos de l’intervenant sont rapportés de façon neutre.'),
          aide('Eigene Bewertung am Schluss, klar gekennzeichnet', 'Un avis personnel à la fin, clairement signalé'),
        ],
        criteria: [
          { ...GRIDS.b2.schreiben[0], label: aide('Aufgabe: Rahmen, Thema, drei Hauptgedanken mit Beispielen, Publikum, Bewertung; sachlicher Bericht', 'Tâche : cadre, sujet, trois idées, public, avis ; compte rendu neutre') },
          ...GRIDS.b2.schreiben.slice(1),
        ],
      } },

    // 7 · Mission orale
    { id: 'b2-wissenschaft-atelier-sprechen', kind: 'mission', title: 'Mission: eine Erfindung vorstellen', estimatedMinutes: 20,
      competences: ['expression-orale'],
      lesson: { description: `SITUATION
[fr?] La situation
${aide('In Ihrem Deutschkurs gibt es eine Reihe von Kurzvorträgen: „Eine Erfindung, die unseren Alltag verändert hat“. Wählen Sie eine Erfindung und stellen Sie sie in drei bis vier Minuten vor.', 'Votre cours organise une série d’exposés : « Une invention qui a changé notre quotidien ». Choisissez-en une et présentez-la en trois à quatre minutes.')}

ZUR AUSWAHL
[fr?] Au choix
• ${aide('die Waschmaschine · das Navigationsgerät · der Kühlschrank · das Internet · eine eigene Idee', 'le lave-linge, le GPS, le réfrigérateur, internet, ou votre idée')}

AUFBAU
[fr?] Structure
1. ${aide('Einstieg mit einer Frage oder einem Beispiel aus dem Alltag', 'Ouverture par une question ou un exemple du quotidien')}
2. ${aide('Wie funktioniert die Erfindung? Einfach erklärt, ohne viele Fachwörter', 'Comment fonctionne l’invention ? Expliquée simplement')}
3. ${aide('Wie hat sie den Alltag verändert? Vergleichen Sie früher und heute.', 'Comment a-t-elle changé le quotidien ? Comparez avant et maintenant.')}
4. ${aide('Nachteile und Kritik: „Zwar …, aber …“', 'Inconvénients et critiques')}
5. ${aide('Ihre Meinung und ein Schluss: „Zusammenfassend lässt sich sagen …“', 'Votre avis et une conclusion')}

VORBEREITUNG
[fr?] Préparation
${aide('Nehmen Sie sich acht Minuten Zeit und überlegen Sie sich Stichwörter zu jedem Teil. Wie Clara Ostrowski im Modell können Sie mit einer Frage an das Publikum beginnen.', 'Prenez huit minutes pour préparer des mots-clés ; vous pouvez ouvrir par une question au public, comme dans le modèle.')}` },
      placements: [{ media: 'b2-wissenschaft-atelier-sprechen-folie', caption: 'Kurzvortrag: eine Erfindung' }],
      mission: {
        oral: { prompt: aide('Stellen Sie in drei bis vier Minuten eine Erfindung vor, die unseren Alltag verändert hat. Folgen Sie den fünf Teilen, erklären Sie die Funktion einfach, vergleichen Sie früher und heute und nennen Sie mindestens einen Nachteil, bevor Sie Ihre Meinung sagen.',
          'Présentez en trois à quatre minutes une invention qui a changé le quotidien : suivez les cinq parties, expliquez simplement son fonctionnement, comparez avant et maintenant et citez au moins un inconvénient avant de donner votre avis.'),
          maxSeconds: 240 },
        written: null,
        checklist: [
          aide('Ich beginne mit einer Frage oder einem Beispiel.', 'Je commence par une question ou un exemple.'),
          aide('Ich erkläre die Funktion einfach und ohne viele Fachwörter.', 'J’explique le fonctionnement simplement.'),
          aide('Ich vergleiche den Alltag früher und heute.', 'Je compare le quotidien d’avant et d’aujourd’hui.'),
          aide('Ich nenne mindestens einen Nachteil („Zwar …, aber …“).', 'Je cite au moins un inconvénient.'),
          aide('Ich schließe mit meiner Meinung und bedanke mich.', 'Je conclus par mon avis et je remercie.'),
        ],
        criteria: [
          { ...GRIDS.b2.sprechen[0], label: aide('Aufgabe: fünf Teile in drei bis vier Minuten, einfache Erklärung, Vergleich, Nachteil, Meinung', 'Tâche : cinq parties, explication simple, comparaison, inconvénient, avis') },
          ...GRIDS.b2.sprechen.slice(1),
        ],
      } },

    // 8 · Faire le point
    { id: 'b2-wissenschaft-atelier-bilan', kind: 'lesson', title: 'Bilanz: Wissenschaft und Vermittlung', estimatedMinutes: 6,
      competences: ['lecture'],
      lesson: { description: `${aide('Lesen Sie die Ziele der beiden Module „Wissenschaft“. Was können Sie schon gut? Was möchten Sie noch üben?', 'Relisez les objectifs des deux modules « Wissenschaft ». Que savez-vous déjà bien faire ? Que voulez-vous encore travailler ?')}

ICH KANN …
[fr?] Je peux…
• ${aide('Ich kann eine wissenschaftliche Meldung kritisch lesen und Zusammenhang und Ursache unterscheiden.', 'Je peux lire une nouvelle scientifique avec esprit critique.')}
• ${aide('Ich kann einen sachlichen Bericht über einen Vortrag schreiben und Aussagen neutral wiedergeben.', 'Je peux écrire un compte rendu neutre d’une conférence.')}
• ${aide('Ich kann einen Fachtext für ein Kind oder einen Laien vereinfachen.', 'Je peux simplifier un texte spécialisé pour un enfant ou un profane.')}
• ${aide('Ich kann einem Vortrag folgen und seine Gliederung und Beispiele verstehen.', 'Je peux suivre une conférence, son plan et ses exemples.')}
• ${aide('Ich kann eine Erfindung in einem strukturierten Kurzvortrag vorstellen.', 'Je peux présenter une invention dans un exposé structuré.')}

STRATEGIEN
[fr?] Stratégies
• ${aide('Vermitteln: Fachwörter ersetzen, Nominalstil in kurze Verbalsätze umformen, ehrlich sagen, was unsicher ist.', 'Médiation : remplacer les termes techniques, passer au style verbal, signaler l’incertitude.')}
• ${aide('Berichten: Rahmen, Thema, Inhalt in der Reihenfolge, eigene Meinung erst am Ende und deutlich markiert.', 'Compte rendu : cadre, sujet, contenu dans l’ordre, avis à la fin.')}
• ${aide('Prüfung Hören: auf die Gliederung achten und sich fragen, was ein Beispiel zeigen soll.', 'Examen d’écoute : suivre le plan et la fonction des exemples.')}

NOCH NICHT SICHER?
[fr?] Pas encore sûr ?
${aide('Zustandspassiv und Nominalstil: Wiederholen Sie die Regel und die Übungen im Modul „Wissenschaft“. Wiedergabe von Aussagen: Lesen Sie den Bericht von Aleksandra Brzezińska noch einmal. Wortstellung in Berichten: Wiederholen Sie die Übung „Korrigieren“.', 'Revoyez la règle et les exercices du module « Wissenschaft », relisez le compte rendu modèle et refaites l’exercice de correction.')}` } },
  ],
};
