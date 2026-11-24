// Module B2 n° 14 · atelier « Umwelt » (lot R7, thème 7). Défendre une proposition et présenter un sujet : modèle annoté
// (proposition au budget participatif et extrait d'exposé), réagir à des objections enregistrées lors d'une réunion
// publique (choix et 4 répétitions), médiation (expliquer un graphique et une annonce de la ville à une voisine âgée),
// erreurs typiques, entraînement au format Lesen (article de fond, 7 questions), deux missions sur grille B2 : proposition
// argumentée au conseil municipal (écrit) et exposé de 3 à 4 minutes (oral).
// Consignes, règles et explications en allemand avec aide française repliée ([fr?]) ; lexique traduit en français.
import { C2, aide, choice, fill, order, speakB2, GRIDS } from '../../lib.mjs';

/** Indices affichés sous les trous d'un fill (forme de base à transformer). */
const hints = (question, ...values) => ({ ...question,
  blanks: question.blanks.map((blank, index) => (values[index] ? { ...blank, hint: values[index] } : blank)) });

export default {
  id: 'b2-umwelt-atelier',
  title: 'Umwelt – Werkstatt: Vorschläge begründen und Daten erklären',
  objective: 'Rédiger une proposition argumentée pour le budget participatif d’une ville, réagir à des objections dans une réunion publique, expliquer un graphique et une annonce officielle à une personne âgée, s’entraîner à la lecture d’un article de fond (format B2) et présenter un exposé de trois à quatre minutes.',
  grammarFocus: [],
  sources: [
    'Textes, dialogues et exercices originaux LinguaCap. Personnes, ville de Brackenfurt et données du graphique sont fictives.',
    'Article d’entraînement sur les tourbières : repères publics arrondis (part des émissions dues aux tourbières drainées en Allemagne, stockage du carbone comparé aux forêts).',
  ],

  vocabulary: [
    { word: 'Ich schlage vor, dass …', partOfSpeech: 'expression', translation: 'je propose que …',
      example: 'Ich schlage vor, dass wir den Schulhof begrünen.', note: 'verbe à la fin après dass' },
    { word: 'Dafür spricht, dass …', partOfSpeech: 'expression', translation: 'un argument en faveur est que …',
      example: 'Dafür spricht, dass Bäume die Straße im Sommer kühlen.', note: 'contraire : Dagegen spricht, dass …' },
    { word: 'Dagegen lässt sich einwenden, dass …', partOfSpeech: 'expression', translation: 'on peut objecter que …',
      example: 'Dagegen lässt sich einwenden, dass ein grüner Hof mehr Pflege braucht.', note: 'ein|wenden : objecter' },
    { word: 'Das ist nicht von der Hand zu weisen.', partOfSpeech: 'expression', translation: 'on ne peut pas le nier ; c’est indéniable',
      example: 'Die Kosten sind hoch, das ist nicht von der Hand zu weisen.', note: 'pour reconnaître une objection' },
    { word: 'Da ist etwas dran.', partOfSpeech: 'expression', translation: 'il y a du vrai là-dedans',
      example: 'Da ist etwas dran, allerdings übersehen Sie die Folgekosten.', note: 'registre oral, courant' },
    { word: 'Ich bin der Auffassung, dass …', partOfSpeech: 'expression', translation: 'je suis d’avis que …',
      example: 'Ich bin der Auffassung, dass jede Stadt einen Hitzeschutzplan braucht.', note: 'synonymes : der Meinung, der Ansicht sein' },
    { word: 'Abschließend möchte ich betonen, dass …', partOfSpeech: 'expression', translation: 'pour conclure, je voudrais souligner que …',
      example: 'Abschließend möchte ich betonen, dass Hitzeschutz Gesundheitsschutz ist.', note: null },
    { word: 'Das Diagramm zeigt …', partOfSpeech: 'expression', translation: 'le graphique montre …',
      example: 'Das Diagramm zeigt die Zahl der heißen Tage pro Jahr.', note: 'synonyme : veranschaulichen' },
    { word: 'um … Prozent steigen', partOfSpeech: 'expression', translation: 'augmenter de … %',
      example: 'Die Zahl der Anmeldungen ist um zehn Prozent gestiegen.', note: 'um = l’écart ; auf = la nouvelle valeur (auf 25 Prozent)' },
    { word: 'sich vervierfachen', partOfSpeech: 'verb', translation: 'quadrupler',
      example: 'Die Zahl der heißen Tage hat sich fast vervierfacht.', note: 'sich verdoppeln : doubler' },
    { word: 'im Vergleich zu', partOfSpeech: 'expression', translation: 'par rapport à',
      example: 'Im Vergleich zu früher gibt es heute viel mehr heiße Tage.', note: '+ datif' },
    { word: 'Maßnahme', article: 'die', plural: 'Maßnahmen', partOfSpeech: 'noun', translation: 'la mesure',
      example: 'Die Stadt hat mehrere Maßnahmen gegen die Hitze beschlossen.', note: 'eine Maßnahme ergreifen : prendre une mesure' },
    { word: 'umsetzen', partOfSpeech: 'verb', translation: 'mettre en œuvre, réaliser',
      example: 'Wir wollen den Vorschlag möglichst schnell umsetzen.', note: 'séparable : um|setzen' },
    { word: 'einen Vorschlag unterstützen', partOfSpeech: 'expression', translation: 'soutenir une proposition',
      example: 'Ich bitte Sie, unseren Vorschlag zu unterstützen.', note: null },
    { word: 'für Rückfragen zur Verfügung stehen', partOfSpeech: 'expression', translation: 'rester à disposition pour toute question',
      example: 'Für Rückfragen stehe ich Ihnen gern zur Verfügung.', note: 'formule de fin d’un écrit formel' },
    { word: 'Hitzeschutz', article: 'der', plural: null, partOfSpeech: 'noun', translation: 'la protection contre la chaleur',
      example: 'Hitzeschutz ist kein Luxus, sondern Gesundheitsschutz.', note: 'sans pluriel' },
  ],

  media: [
    { key: 'b2-umwelt-atelier-modell-audio', kind: 'audio', title: 'Modèle : extrait d’un exposé sur les toits végétalisés',
      script: [
        { voice: 'mann', name: 'Jannik Sommer', text: 'Guten Tag zusammen. Mein Thema heute lautet: Sollte unsere Stadt vorschreiben, dass neue Flachdächer begrünt werden? Ich gehe in drei Schritten vor: Zuerst erkläre ich, worum es geht, dann nenne ich Argumente dafür und dagegen, und zum Schluss sage ich, was ich selbst denke.' },
        { voice: 'mann', name: 'Jannik Sommer', text: 'Ein Gründach ist ein Dach, auf dem Gräser, Moose oder kleine Pflanzen wachsen. In manchen Städten ist das bei Neubauten mit flachem Dach schon Pflicht. Bei uns ist es bisher freiwillig, und nur wenige Bauherren machen mit.' },
        { pause: 0.8 },
        { voice: 'mann', name: 'Jannik Sommer', text: 'Was spricht dafür? Erstens speichern begrünte Dächer Regenwasser. Bei Starkregen läuft also weniger Wasser auf einmal in die Kanalisation. Zweitens kühlen sie im Sommer die Wohnungen darunter und die Luft in der Umgebung.' },
        { voice: 'mann', name: 'Jannik Sommer', text: 'Dagegen lässt sich einwenden, dass ein Gründach den Bau teurer macht und gepflegt werden muss. Das ist nicht von der Hand zu weisen. Auch wenn die Kosten am Anfang höher sind, hält die Abdichtung unter den Pflanzen aber oft deutlich länger, weil sie vor Sonne und Frost geschützt ist.' },
        { pause: 0.8 },
        { voice: 'mann', name: 'Jannik Sommer', text: 'Abschließend möchte ich sagen: Ich bin der Auffassung, dass die Stadt Gründächer bei Neubauten vorschreiben sollte, zumindest bei großen Gebäuden. In zehn Jahren werden wir dann Hunderte grüne Dächer gewonnen haben, ohne einen einzigen Quadratmeter Boden zu verbrauchen. Vielen Dank für Ihre Aufmerksamkeit. Ich freue mich auf Ihre Fragen.' },
      ] },
    { key: 'b2-umwelt-atelier-diskussion-argument1', kind: 'audio', title: 'Objection 1 : un commerçant',
      script: [{ voice: 'mann2', name: 'Herr Kowalczyk', text: 'Wenn die Parkplätze wegfallen, kommen meine Kunden nicht mehr. Dann kann ich meinen Laden in zwei Jahren zumachen.' }] },
    { key: 'b2-umwelt-atelier-diskussion-argument2', kind: 'audio', title: 'Objection 2 : une habitante',
      script: [{ voice: 'frau3', name: 'Frau Rosenthal', text: 'Bäume sind ja schön, aber die Pflege kostet Geld. Und die Stadt hat doch jetzt schon kein Geld für das Schwimmbad.' }] },
    { key: 'b2-umwelt-atelier-diskussion-argument3', kind: 'audio', title: 'Objection 3 : un habitant sceptique',
      script: [{ voice: 'mann3', name: 'Herr Stöckl', text: 'Ein paar Bäume ändern doch nichts am Klimawandel. Das ist reine Symbolpolitik.' }] },
    { key: 'b2-umwelt-atelier-diskussion-argument4', kind: 'audio', title: 'Objection 4 : une habitante hésitante',
      script: [{ voice: 'frau', name: 'Frau Benedek', text: 'Ich bin mir nicht sicher, ob das funktioniert. Warum testen wir das nicht erst einmal?' }] },
    { key: 'b2-umwelt-atelier-mediation-diagramm', kind: 'image', title: 'Graphique : les journées de forte chaleur à Brackenfurt',
      alt: 'Diagramme en barres « Heiße Tage in Brackenfurt » : 4 jours par an en moyenne entre 1961 et 1990, 7 entre 1991 et 2010, 11 entre 2011 et 2020, 16 entre 2021 et 2025.',
      image: { layout: 'chart', title: 'Heiße Tage in Brackenfurt (mindestens 30 °C)', unit: 'Tage pro Jahr',
        bars: [
          { label: '1961–1990', value: 4 },
          { label: '1991–2010', value: 7 },
          { label: '2011–2020', value: 11 },
          { label: '2021–2025', value: 16 },
        ],
        highlight: 3, source: 'Wetterstation Brackenfurt, Durchschnitt pro Jahr' } },
    { key: 'b2-umwelt-atelier-mediation-mitteilung', kind: 'image', title: 'Annonce de la ville : protection contre la chaleur',
      alt: 'Annonce de la ville de Brackenfurt, valable dès le 1er juin : téléphone canicule pour les seniors, salle fraîche à la bibliothèque, alertes par application, douze fontaines, trois cents arbres d’ici 2028.',
      image: { layout: 'document', icon: 'thermometer-sun', title: 'Hitzeschutz in Brackenfurt', subtitle: 'Mitteilung der Stadt · gilt ab 1. Juni',
        lines: [
          'Hitzetelefon für Seniorinnen und Senioren: täglich 8–20 Uhr. Wer sich im Bürgerbüro anmeldet, wird an heißen Tagen auch selbst angerufen.',
          'Kühler Raum: Stadtbibliothek, Montag bis Samstag 10–18 Uhr, Wasser kostenlos',
          'Hitzewarnungen per App für alle mit Smartphone',
          '12 neue Trinkbrunnen im Stadtpark und am Bahnhof',
          '300 neue Straßenbäume bis 2028',
        ] } },
    { key: 'b2-umwelt-atelier-pruefung-artikel', kind: 'image', title: 'Article d’entraînement : les tourbières et le climat',
      alt: 'Début de l’article « Nasse Füße fürs Klima » : titre, chapeau et premier paragraphe sur une prairie de Frise orientale qui était autrefois une tourbière.',
      image: { layout: 'article', kicker: 'Landwirtschaft und Klima', title: 'Nasse Füße fürs Klima', icon: 'droplets',
        lead: 'Jahrhundertelang hat man Moore trockengelegt, um Äcker und Weiden zu gewinnen. Jetzt sollen viele von ihnen wieder nass werden. Für manche Landwirte ist das eine Zumutung, für andere eine Chance.',
        paragraphs: ['Auf den ersten Blick sieht die Weide von Hinrich Janssen aus wie jede andere in Ostfriesland: flach, grün, mit einem Graben am Rand. Doch unter dem Gras liegt Torf, mehrere Meter tief. Vor gut hundert Jahren war hier noch Moor.'] } },
    { key: 'b2-umwelt-atelier-sprechen-folie', kind: 'image', title: 'Support de l’exposé : deux sujets au choix',
      alt: 'Support d’exposé : sujet A, faut-il rendre l’avion nettement plus cher ? Sujet B, chaque ville doit-elle avoir un plan canicule ? Puis cinq parties : sujet et plan, situation, pour, contre, avis.',
      image: { layout: 'document', icon: 'presentation', title: 'Kurzvortrag: 3 bis 4 Minuten', subtitle: 'Wählen Sie Thema A oder Thema B.',
        lines: [
          'Thema A: Sollte das Fliegen deutlich teurer werden?',
          'Thema B: Sollte jede Stadt einen Hitzeschutzplan haben?',
          '1. Thema und Gliederung · 2. Situation, mit einem Beispiel aus Ihrem Land',
          '3. Argumente dafür · 4. Argumente dagegen, ein Einwand anerkannt',
          '5. Ihre Meinung und Schluss',
        ] } },
  ],

  activities: [
    // 1 · Modèle annoté
    { id: 'b2-umwelt-atelier-modell', kind: 'lesson', title: 'Modell: ein Vorschlag und ein Kurzvortrag', estimatedMinutes: 12,
      competences: ['lecture', 'ecoute'],
      lesson: { description: `MODELL: EIN VORSCHLAG FÜR DEN BÜRGERHAUSHALT
[fr?] Modèle : une proposition pour le budget participatif
${aide('Lesen Sie den Vorschlag von Leyla Durmaz. Achten Sie auf den Aufbau und darauf, wie sie einen Einwand aufgreift und entkräftet.', 'Lisez la proposition de Leyla Durmaz. Observez la structure et la façon dont elle reprend puis réfute une objection.')}

Betreff: Vorschlag für den Bürgerhaushalt – ein grüner Schulhof für die Grundschule am Mühlenweg
Sehr geehrte Damen und Herren,
im Namen des Elternbeirats der Grundschule am Mühlenweg schlage ich vor, den asphaltierten Schulhof teilweise zu entsiegeln und zu begrünen.
Im Sommer heizt sich der Hof so stark auf, dass die Kinder in den Pausen kaum noch draußen spielen können. Letzten Juli haben wir an einem Nachmittag 52 Grad am Boden gemessen. Bäume, eine Wiese und ein kleiner Wasserspielplatz würden den Hof spürbar abkühlen. Dafür spricht außerdem, dass der Boden bei Starkregen wieder Wasser aufnehmen könnte, statt die Kanalisation zu überlasten.
Dagegen lässt sich einwenden, dass ein grüner Hof mehr Pflege braucht. Das ist nicht von der Hand zu weisen. Allerdings haben sich bereits zwölf Familien bereit erklärt, sich in einer Gartengruppe um die Beete zu kümmern. Auch wenn die Umgestaltung rund 85 000 Euro kostet, ist sie eine Investition für Jahrzehnte.
Wenn der Vorschlag angenommen wird, können die Arbeiten im Sommer 2028 beginnen. Bis dahin werden die Kinder ihren neuen Hof in einer Projektwoche mit einer Landschaftsarchitektin selbst mitgeplant haben.
Ich bitte Sie, unseren Vorschlag zu unterstützen, und stehe Ihnen für Rückfragen gern zur Verfügung.
Mit freundlichen Grüßen
Leyla Durmaz, Elternbeirat

AUFBAU
[fr?] Structure
1. ${aide('Betreff: Vorschlag und Ort nennen.', 'Objet : nommer la proposition et le lieu.')}
2. ${aide('Einleitung: Wer schreibt, und was wird vorgeschlagen?', 'Introduction : qui écrit, et que propose-t-on ?')}
3. ${aide('Begründung: das Problem mit einem konkreten Beispiel (52 Grad), dann ein zweites Argument.', 'Justification : le problème avec un exemple concret, puis un second argument.')}
4. ${aide('Einwand: aufgreifen, anerkennen, entkräften („Dagegen lässt sich einwenden … Das ist nicht von der Hand zu weisen. Allerdings …“).', 'Objection : la reprendre, la reconnaître, la réfuter.')}
5. ${aide('Ausblick: Was wird bis wann erreicht sein? Hier passt das Futur II.', 'Perspective : qu’aura-t-on atteint, et quand ? Le Futur II convient ici.')}
6. ${aide('Schluss: Bitte um Unterstützung, Angebot für Rückfragen, Grußformel.', 'Conclusion : demande de soutien, offre de répondre aux questions, formule finale.')}

EINLEITEN
[fr?] Introduire
• ${aide('Im Namen des Elternbeirats schlage ich vor, … zu …', 'Au nom du conseil des parents, je propose de …')}
• ${aide('Mit diesem Schreiben möchte ich Ihnen ein Projekt vorstellen.', 'Par ce courrier, je souhaite vous présenter un projet.')}
BEGRÜNDEN
[fr?] Justifier
• ${aide('Dafür spricht vor allem, dass … · Hinzu kommt, dass …', 'Un argument en faveur est surtout que … · S’y ajoute que …')}
• ${aide('Ein Beispiel: Letzten Juli haben wir … gemessen.', 'Un exemple : en juillet dernier, nous avons mesuré …')}
EINWAND AUFGREIFEN
[fr?] Reprendre une objection
• ${aide('Dagegen lässt sich einwenden, dass … Das ist nicht von der Hand zu weisen. Allerdings …', 'On peut objecter que … C’est indéniable. Toutefois …')}
• ${aide('Zwar kostet …, aber … · Auch wenn …, ist … trotzdem …', 'Certes …, mais … · Même si …, … reste …')}
AUSBLICK UND SCHLUSS
[fr?] Perspective et conclusion
• ${aide('Bis 2028 werden wir … erreicht haben.', 'D’ici 2028, nous aurons atteint …')}
• ${aide('Ich bitte Sie, unseren Vorschlag zu unterstützen.', 'Je vous prie de soutenir notre proposition.')}
• ${aide('Für Rückfragen stehe ich Ihnen gern zur Verfügung.', 'Je reste à votre disposition pour toute question.')}

MODELL: EIN KURZVORTRAG
[fr?] Modèle : un court exposé
${aide('Hören Sie den Anfang, die Argumente und den Schluss eines Kurzvortrags von Jannik Sommer. Achten Sie darauf, wie er die Gliederung ankündigt, einen Einwand anerkennt und am Ende Stellung nimmt.', 'Écoutez le début, les arguments et la fin d’un exposé de Jannik Sommer. Observez comment il annonce son plan, reconnaît une objection et prend position à la fin.')}` },
      placements: [{ media: 'b2-umwelt-atelier-modell-audio', caption: 'Jannik Sommer: Gründächer für alle Neubauten?', transcriptVisibility: 'on_demand' }] },

    // 2 · Réagir à des objections
    { id: 'b2-umwelt-atelier-diskussion', kind: 'exercise', title: 'Diskutieren: auf Einwände reagieren', estimatedMinutes: 12,
      competences: ['ecoute', 'expression-orale'],
      lesson: { description: `SITUATION
[fr?] La situation
${aide('Bürgerversammlung in Brackenfurt: Auf dem Marktplatz sollen 40 Parkplätze wegfallen. Geplant sind 25 Bäume, Sitzbänke und ein Trinkbrunnen. Sie unterstützen das Projekt.', 'Réunion publique à Brackenfurt : 40 places de stationnement doivent disparaître de la place du marché au profit de 25 arbres, de bancs et d’une fontaine. Vous soutenez le projet.')}
${aide('Hören Sie die Einwände der Nachbarn und wählen Sie jeweils die Reaktion, die den Einwand ernst nimmt und trotzdem überzeugt. Sprechen Sie danach die guten Reaktionen laut nach.', 'Écoutez les objections des voisins et choisissez chaque fois la réaction qui prend l’objection au sérieux tout en restant convaincante. Répétez ensuite les bonnes réactions à voix haute.')}

TIPP
[fr?] Conseil
${aide('Eine gute Reaktion hat zwei Teile: Sie erkennen zuerst etwas an („Ich verstehe Ihre Sorge“, „Zwar …“), dann bringen Sie ein Argument oder einen Vorschlag („aber“, „allerdings“).', 'Une bonne réaction a deux temps : reconnaître d’abord, puis argumenter ou proposer.')}` },
      placements: [
        { media: 'b2-umwelt-atelier-diskussion-argument1', questionId: 'q1', transcriptVisibility: 'after_answer' },
        { media: 'b2-umwelt-atelier-diskussion-argument2', questionId: 'q2', transcriptVisibility: 'after_answer' },
        { media: 'b2-umwelt-atelier-diskussion-argument3', questionId: 'q3', transcriptVisibility: 'after_answer' },
        { media: 'b2-umwelt-atelier-diskussion-argument4', questionId: 'q4', transcriptVisibility: 'after_answer' },
      ],
      questions: [
        choice('q1', aide('Einwand 1 (ein Ladenbesitzer): Welche Reaktion passt am besten?', 'Objection 1 (un commerçant) : quelle réaction convient le mieux ?'),
          [['Dann machen Sie Ihren Laden eben zu, das ist wirklich nicht unser Problem.'],
            ['Ich verstehe Ihre Sorge. Wir könnten aber Kurzzeitparkplätze für Ihre Kundschaft einrichten.', true],
            ['Da haben Sie völlig recht, deshalb sollten wir auf dem Marktplatz lieber noch mehr Parkplätze bauen.'],
            ['Auch wenn Sie Kunden verlieren, das Projekt ist uns ehrlich gesagt wichtiger als Ihr Laden.']],
          'Die gute Reaktion erkennt die Sorge an und macht einen konkreten Vorschlag, der dem Ladenbesitzer hilft. Die erste ist verletzend, die dritte gibt die eigene Position auf, die vierte ist unhöflich und grammatisch falsch: Nach „Auch wenn …“ muss der Hauptsatz mit dem Verb beginnen („…, ist uns das Projekt wichtiger“). [fr?] Reconnaître la crainte, puis proposer une solution.'),
        choice('q2', aide('Einwand 2 (eine Anwohnerin): Welche Reaktion passt am besten?', 'Objection 2 (une habitante) : quelle réaction convient le mieux ?'),
          [['Zwar kostet die Pflege Geld, aber die Bäume senken im Sommer die Temperatur auf dem Platz.', true],
            ['Das Schwimmbad ist doch ein ganz anderes Thema, und darüber reden wir heute Abend wirklich nicht.'],
            ['Zwar kostet die Pflege Geld, deshalb pflanzen wir am besten überhaupt keine Bäume.'],
            ['Die Pflege der Bäume kostet überhaupt nichts, das machen ja die Nachbarn.']],
          '„Zwar … aber“ gibt den Kostenpunkt zu und stellt einen Nutzen dagegen. Die zweite Reaktion weicht aus, die dritte ist unlogisch („zwar“ verlangt einen Gegensatz mit „aber“), die vierte behauptet etwas Falsches. [fr?] « Certes … mais » : concéder le coût, opposer un avantage.'),
        choice('q3', aide('Einwand 3 (ein skeptischer Nachbar): Welche Reaktion passt am besten?', 'Objection 3 (un voisin sceptique) : quelle réaction convient le mieux ?'),
          [['Sie haben recht, ein paar Bäume bringen gar nichts, wir sollten das ganze Projekt besser stoppen.'],
            ['Allein retten die Bäume das Klima nicht, aber sie schützen uns vor der Hitze, die schon da ist.', true],
            ['Wer so etwas sagt, hat sich mit dem Thema offensichtlich noch nie beschäftigt.'],
            ['Allein retten die Bäume das Klima nicht, deshalb brauchen wir auch keinen Schatten.']],
          'Die gute Reaktion gibt dem Nachbarn teilweise recht (Bäume allein retten das Klima nicht) und verschiebt das Argument: Es geht auch um Anpassung an die Hitze. Die dritte Reaktion greift die Person an statt das Argument, die vierte zieht einen unlogischen Schluss. [fr?] Lui donner en partie raison, puis déplacer l’argument : s’adapter à la chaleur.'),
        choice('q4', aide('Einwand 4 (eine unsichere Nachbarin): Welche Reaktion passt am besten?', 'Objection 4 (une voisine hésitante) : quelle réaction convient le mieux ?'),
          [['Das ist ein guter Vorschlag: Mit mobilen Pflanzkübeln könnten wir einen Sommer lang testen.', true],
            ['Testen kostet nur Zeit, wir müssen jetzt sofort und ohne weitere Diskussion entscheiden.'],
            ['Selbst wenn der Test gut läuft, werden wir den Platz auf keinen Fall umbauen.'],
            ['Ein Test ist leider völlig unmöglich, weil man große Bäume nicht einfach wieder ausgraben kann.']],
          'Die Nachbarin ist nicht dagegen, sondern unsicher: Ein Test mit mobilen Pflanzkübeln nimmt ihre Idee auf und macht das Projekt wahrscheinlicher. Die zweite Reaktion übergeht sie, die dritte widerspricht Ihrer eigenen Position, und die vierte übersieht genau diese Lösung. [fr?] Accueillir l’idée d’un test : des bacs mobiles le rendent possible.'),
        speakB2('q5', 'Ich verstehe Ihre Sorge, aber wir könnten Kurzzeitparkplätze für die Kundschaft einrichten.',
          'Zustimmung, dann Vorschlag mit „könnten“. In „Kurzzeitparkplätze“ liegt der Hauptakzent auf dem ersten Teil: KURZ-zeit-park-plätze. „Sorge“ hat ein kurzes, offenes o. [fr?] Accent principal sur le premier élément du mot composé.'),
        speakB2('q6', 'Zwar kostet die Pflege Geld, aber die Bäume senken im Sommer die Temperatur auf dem Platz.',
          '„Zwar“ wird mit langem a gesprochen, „Pflege“ mit langem e. In „Temperatur“ liegt der Akzent auf der letzten Silbe: tem-pe-ra-TUR. Betonen Sie „aber“ leicht, um den Gegensatz hörbar zu machen. [fr?] « Temperatur » : accent sur la dernière syllabe.'),
        speakB2('q7', 'Auch wenn ein paar Bäume das Klima nicht retten, schützen sie uns vor der Hitze.',
          'Vor dem Komma bleibt die Stimme oben, denn der Satz geht weiter; erst am Ende fällt sie. „Schützen“ hat ein kurzes ü, die Lippen sind gerundet. Achten Sie auf die Inversion nach dem Komma: „schützen sie“. [fr?] Voix suspendue avant la virgule, descendante à la fin.'),
        speakB2('q8', 'Selbst wenn nicht alle zustimmen, sollten wir das Projekt zumindest einen Sommer lang testen.',
          'In „zustimmen“ spricht man „st“ am Anfang des Stammes wie „scht“, in „testen“ dagegen wie im Französischen [st]. „Zumindest“ wird auf der zweiten Silbe betont: zu-MIN-dest; „Projekt“ auf der letzten: pro-JEKT. [fr?] « st » en début de radical se prononce « cht » ; au milieu du mot, [st].'),
      ] },

    // 3 · Médiation : un graphique et une annonce pour une voisine
    { id: 'b2-umwelt-atelier-mediation', kind: 'exercise', title: 'Vermitteln: ein Diagramm einfach erklären', estimatedMinutes: 15,
      competences: ['lecture', 'expression-ecrite'],
      lesson: { description: `SITUATION
[fr?] La situation
${aide('Ihre Nachbarin, Frau Olbrich, ist 84 Jahre alt und lebt allein. Sie hat kein Smartphone und geht nicht mehr gern weit zu Fuß; die Stadtbibliothek liegt aber gleich bei ihr um die Ecke.', 'Votre voisine, Mme Olbrich, a 84 ans et vit seule. Elle n’a pas de smartphone et ne marche plus volontiers longtemps ; la bibliothèque municipale est juste au coin de sa rue.')}
${aide('In der Lokalzeitung hat sie ein Diagramm und eine Mitteilung der Stadt gesehen. Sie fragt Sie: „Ist es wirklich so viel heißer geworden? Und was bringt mir das alles?“', 'Dans le journal local, elle a vu un graphique et une annonce de la ville. Elle vous demande si la chaleur a vraiment augmenté et ce que tout cela lui apporte.')}

QUELLE 1: DAS DIAGRAMM
[fr?] Source 1 : le graphique
Heiße Tage in Brackenfurt (mindestens 30 °C), Durchschnitt pro Jahr: 1961–1990: 4 Tage · 1991–2010: 7 Tage · 2011–2020: 11 Tage · 2021–2025: 16 Tage. Quelle: Wetterstation Brackenfurt.

QUELLE 2: DIE MITTEILUNG DER STADT
[fr?] Source 2 : l’annonce de la ville
Hitzeschutz in Brackenfurt – gilt ab 1. Juni
• Hitzetelefon für Seniorinnen und Senioren: täglich 8–20 Uhr. Wer sich im Bürgerbüro anmeldet, wird an heißen Tagen auch selbst angerufen.
• Kühler Raum: Stadtbibliothek, Montag bis Samstag 10–18 Uhr, Wasser kostenlos
• Hitzewarnungen per App für alle mit Smartphone
• 12 neue Trinkbrunnen im Stadtpark und am Bahnhof
• 300 neue Straßenbäume bis 2028

AUFGABE
[fr?] Votre tâche
${aide('Fassen Sie beide Quellen für Frau Olbrich zusammen: zuerst die Entwicklung, dann nur das, was ihr wirklich hilft. Sprechen Sie einfach, konkret und freundlich.', 'Synthétisez les deux sources pour Mme Olbrich : d’abord l’évolution, puis seulement ce qui l’aide vraiment. Parlez simplement, concrètement et aimablement.')}
TIPP
[fr?] Conseil
${aide('Bei einer Grafik nennen Sie zuerst das Thema, dann den Trend und eine oder zwei Zahlen. Runden Sie: „fast viermal so viele“ ist leichter zu verstehen als „eine Steigerung um 300 Prozent“.', 'Pour un graphique : le sujet, puis la tendance et un ou deux chiffres. Arrondissez : « près de quatre fois plus » est plus clair que « +300 % ».')}` },
      placements: [
        { media: 'b2-umwelt-atelier-mediation-diagramm', caption: 'Quelle 1: Heiße Tage in Brackenfurt' },
        { media: 'b2-umwelt-atelier-mediation-mitteilung', caption: 'Quelle 2: Mitteilung der Stadt' },
      ],
      questions: [
        choice('q1', aide('Welcher Satz beschreibt das Diagramm richtig?', 'Quelle phrase décrit correctement le graphique ?'),
          [['Die Zahl der heißen Tage ist seit 2011 wieder deutlich gesunken.'],
            ['Zwischen 1991 und 2010 gab es die meisten heißen Tage pro Jahr.'],
            ['Die Zahl der heißen Tage hat sich ungefähr vervierfacht.', true],
            ['Die Zahl der heißen Tage hat sich ungefähr verdoppelt.']],
          'Von durchschnittlich 4 Tagen (1961–1990) auf 16 Tage (2021–2025): Das ist das Vierfache, die Zahl hat sich also vervierfacht. Die Werte steigen in jedem Zeitraum; die meisten heißen Tage gibt es im letzten Zeitraum. [fr?] De 4 à 16 jours : le nombre a quadruplé (sich vervierfachen).'),
        fill('q2', aide('Machen Sie Notizen für Frau Olbrich. Ergänzen Sie.', 'Prenez des notes pour Mme Olbrich. Complétez.'),
          'Diagramm: früher (1961–1990) etwa [[1]] heiße Tage pro Jahr, heute (2021–2025) etwa [[2]] · also ungefähr [[3]] so viele · für Frau Olbrich: das [[4]] (täglich 8 bis 20 Uhr, vorher im Bürgerbüro anmelden) · kühler Raum: die [[5]], Montag bis Samstag',
          [['4', 'vier'], ['16', 'sechzehn'], ['viermal', '4-mal', 'vier Mal'], ['Hitzetelefon'], ['Stadtbibliothek', 'Bibliothek']],
          'Die Notizen verbinden beide Quellen: den Trend aus dem Diagramm (4 → 16, also viermal so viele) und die zwei Angebote, die zu Frau Olbrich passen. App, Trinkbrunnen im Park und neue Bäume bis 2028 helfen ihr kaum. [fr?] Ne gardez que ce qui sert à la personne : tendance, téléphone canicule, salle fraîche.'),
        choice('q3', aide('Was ist für Frau Olbrich besonders wichtig?', 'Qu’est-ce qui est particulièrement important pour Mme Olbrich ?'),
          [['die Hitzewarnungen per App und die neuen Trinkbrunnen am Bahnhof'],
            ['das Hitzetelefon und der kühle Raum in der Stadtbibliothek', true],
            ['die 300 neuen Straßenbäume, die bis 2028 gepflanzt werden'],
            ['die neuen Trinkbrunnen im Stadtpark und die vielen Bäume']],
          'Frau Olbrich lebt allein und hat kein Smartphone: Das Hitzetelefon (mit Anruf an heißen Tagen) passt genau zu ihr, und die Bibliothek liegt um die Ecke. Die App kann sie nicht nutzen, Park und Bahnhof sind weit, und die Bäume helfen erst in einigen Jahren. [fr?] Choisissez selon la situation de la personne : seule, sans smartphone, peu mobile.'),
        order('q4', aide('Erklären Sie das Diagramm einfach: Bilden Sie den Satz.', 'Expliquez simplement le graphique : remettez les mots dans l’ordre.'),
          [['Früher', 'gab', 'es', 'nur wenige heiße Tage,', 'heute', 'sind', 'es', 'fast', 'viermal so viele.']],
          'Zwei Hauptsätze mit Inversion: Das Zeitadverb steht vorn („Früher“, „heute“), das Verb an zweiter Stelle („gab“, „sind“), dann das Subjekt „es“. „Es gibt“ wird im zweiten Teil zu „es sind … so viele“, weil sich „viele“ auf die Tage im Plural bezieht. [fr?] Adverbe de temps en tête, puis verbe, puis « es ».'),
        order('q5', aide('Geben Sie Frau Olbrich einen Rat: Bilden Sie den Satz.', 'Donnez un conseil à Mme Olbrich : remettez les mots dans l’ordre.'),
          [['Wenn', 'es Ihnen', 'bei der Hitze', 'nicht gut', 'geht,', 'rufen', 'Sie', 'einfach', 'das Hitzetelefon', 'an.'],
            ['Wenn', 'es Ihnen', 'bei der Hitze', 'nicht gut', 'geht,', 'rufen', 'Sie', 'das Hitzetelefon', 'einfach', 'an.']],
          'Nebensatz mit „wenn“: Verb „geht“ am Ende. Danach beginnt der Hauptsatz mit dem Verb „rufen“, das Präfix „an“ steht ganz am Ende. Bleiben Sie beim höflichen „Sie“: Frau Olbrich ist Ihre Nachbarin, nicht Ihre Freundin. [fr?] Subordonnée, puis verbe en tête ; la particule « an » ferme la phrase.'),
        fill('q6', aide('Erklären Sie zwei Wörter aus der Mitteilung mit einfachen Worten. Ergänzen Sie.', 'Expliquez simplement deux mots de l’annonce. Complétez.'),
          'Ein „kühler Raum“ ist ein Ort, an dem man sich an heißen Tagen [[1]] kann. · „Sich anmelden“ heißt hier: Man gibt im Bürgerbüro seinen [[2]] und seine Telefonnummer an.',
          [['abkühlen', 'ausruhen', 'erholen'], ['Namen']],
          'Beim Vermitteln ersetzen Sie Fachwörter durch einfache Erklärungen: ein Ort, an dem man sich abkühlen oder ausruhen kann. Achtung: „der Name“ wird im Akkusativ zu „seinen Namen“ (n-Deklination). [fr?] Remplacer les termes techniques par une explication simple ; der Name → den Namen.'),
      ] },

    // 4 · Erreurs typiques
    { id: 'b2-umwelt-atelier-korrektur', kind: 'exercise', title: 'Korrigieren: typische Fehler in Argumenten und Grafikbeschreibungen', estimatedMinutes: 10,
      competences: ['lecture', 'expression-ecrite'],
      lesson: { description: `${aide('Diese Sätze stammen aus Vorschlägen und Vorträgen von Kursteilnehmenden. Finden Sie jeweils die richtige Form.', 'Ces phrases viennent de propositions et d’exposés d’apprenants. Trouvez chaque fois la forme correcte.')}

KORREKTURZEICHEN
[fr?] Les codes de correction
${aide('Ihre Lehrkraft verwendet in ihren Kommentaren diese Zeichen: St (Wortstellung), G (Grammatik), W (Wortschatz), R (Rechtschreibung), A (Register: du oder Sie). Jede Frage übt eines davon.', 'Votre enseignant emploie ces codes : place des mots, grammaire, vocabulaire, orthographe, registre. Chaque question en travaille un.')}` },
      questions: [
        choice('q1', aide('St: Welcher Satz ist richtig?', 'St : quelle phrase est correcte ?'),
          [['Die Kosten sind hoch. Trotzdem die Investition lohnt sich.'],
            ['Die Kosten sind hoch. Trotzdem sich lohnt die Investition.'],
            ['Die Kosten sind hoch, trotzdem die Investition sich lohnt.'],
            ['Die Kosten sind hoch. Trotzdem lohnt sich die Investition.', true]],
          '„Trotzdem“ ist ein Adverb und besetzt die erste Position: Das Verb folgt sofort („lohnt“), dann das Reflexivpronomen und das Subjekt. Wie nach „deshalb“ oder „dennoch“ gilt hier die normale Verbzweitstellung. [fr?] trotzdem occupe la première place : le verbe suit immédiatement.'),
        fill('q2', aide('G: „um“ oder „auf“? Ergänzen Sie.', 'G : « um » ou « auf » ? Complétez.'),
          'Die Zahl der heißen Tage ist von 4 [[1]] 16 gestiegen, also [[2]] 12 Tage. · Nach der Dämmung ist der Verbrauch [[3]] ein Viertel gesunken.',
          [['auf'], ['um'], ['um']],
          '„Von … auf …“ nennt den alten und den neuen Wert, „um“ den Unterschied: von 4 auf 16 gestiegen, also um 12 Tage. Auch „um ein Viertel gesunken“ nennt die Differenz. Diese Präpositionen sind bei jeder Grafikbeschreibung wichtig. [fr?] auf = nouvelle valeur (« à ») ; um = écart (« de »).'),
        hints(fill('q3', aide('W: Ergänzen Sie das passende Verb.', 'W : complétez avec le verbe qui convient.'),
          'Der Klimaschutz [[1]] bei der Wahl eine wichtige Rolle. · Der Stadtrat muss bald eine Entscheidung [[2]]. · Alle Beteiligten haben sich viel Mühe [[3]].',
          [['spielt'], ['treffen', 'fällen'], ['gegeben']],
          'Feste Verbindungen: eine Rolle spielen, eine Entscheidung treffen (gehoben auch: fällen), sich Mühe geben. Wörtliche Übersetzungen wie „eine Entscheidung nehmen“ oder „Mühe machen“ sind typische Fehler. [fr?] jouer un rôle, prendre une décision, faire des efforts : en allemand, spielen, treffen, sich Mühe geben.'),
        'spielen', 'treffen', 'geben'),
        choice('q4', aide('A: Welcher Satz passt in einen Vorschlag an den Stadtrat?', 'A : quelle phrase convient dans une proposition au conseil municipal ?'),
          [['Macht doch endlich mal was gegen die Hitze auf dem Schulhof!'],
            ['Wir bitten Sie, unseren Vorschlag wohlwollend zu prüfen.', true],
            ['Ihr müsst unseren Vorschlag unbedingt sofort annehmen.'],
            ['Wir wollen, dass Sie das jetzt sofort bezahlen, okay?']],
          'An eine Behörde schreibt man mit „Sie“ und formulierte Bitten: „Wir bitten Sie, … zu prüfen“. „Wohlwollend“ bedeutet: mit positiver Einstellung. Die anderen Sätze duzen den Stadtrat, fordern zu direkt oder sind umgangssprachlich („mal was“, „okay?“). [fr?] Registre formel : vouvoiement et demande polie.'),
        hints(fill('q5', aide('G: Ergänzen Sie die richtige Verbform.', 'G : complétez avec la bonne forme verbale.'),
          'Wenn wir die Bäume [[1]] [[2]], wird der Platz im Sommer kühler sein.',
          [['gepflanzt'], ['haben']],
          'Für eine abgeschlossene Handlung in der Zukunft steht nach dem zeitlichen „wenn“ das Perfekt: Wenn wir die Bäume gepflanzt haben, … Das Futur II („gepflanzt haben werden“) wäre hier unnatürlich. [fr?] « Quand nous aurons planté » = Wenn wir … gepflanzt haben.'),
        'pflanzen'),
        choice('q6', aide('G: Welcher Satz ist richtig?', 'G : quelle phrase est correcte ?'),
          [['Selbst wenn wir mehr Geld hätten, könnten wir nicht alle Dächer begrünen.', true],
            ['Selbst wenn wir mehr Geld hätten, wir könnten nicht alle Dächer begrünen.'],
            ['Selbst wenn wir mehr Geld haben würden, können wir nicht alle Dächer begrünen.'],
            ['Selbst wenn hätten wir mehr Geld, könnten wir nicht alle Dächer begrünen.']],
          'Ein gedachter Fall steht mit „selbst wenn“ im Konjunktiv II („hätten“), und der Hauptsatz beginnt nach dem Komma mit dem Verb („könnten wir“). Im zweiten Satz fehlt die Inversion, im dritten passen die Formen nicht zusammen, im vierten steht das Verb im Nebensatz an der falschen Stelle. [fr?] Hypothèse : Konjunktiv II, verbe à la fin de la subordonnée, puis en tête de la principale.'),
      ] },

    // 5 · Entraînement au format : Lesen (article de fond)
    { id: 'b2-umwelt-atelier-pruefung', kind: 'exercise', title: 'Prüfungstraining: Lesen, ein Hintergrundartikel', estimatedMinutes: 22,
      competences: ['lecture'],
      lesson: { description: `PRÜFUNGSTRAINING LESEN
[fr?] Entraînement à l’examen : lecture
${aide('Lesen Sie den Artikel und lösen Sie die Aufgaben 1 bis 7. Wählen Sie jeweils die richtige Antwort.', 'Lisez l’article et faites les exercices 1 à 7. Choisissez chaque fois la bonne réponse.')}
ZEIT
[fr?] Temps
${aide('Etwa 20 Minuten. Arbeiten Sie ohne Wörterbuch.', 'Environ 20 minutes. Travaillez sans dictionnaire.')}

STRATEGIE
[fr?] Stratégie
1. ${aide('Lesen Sie zuerst die Aufgaben und markieren Sie in Gedanken die Schlüsselwörter.', 'Lisez d’abord les questions et repérez mentalement les mots-clés.')}
2. ${aide('Die Aufgaben folgen meist der Reihenfolge des Textes. Suchen Sie die passende Stelle und lesen Sie sie genau.', 'Les questions suivent en général l’ordre du texte : trouvez le passage et lisez-le précisément.')}
3. ${aide('Vorsicht bei Wörtern, die im Text und in einer Antwort gleich sind: Oft ist die richtige Antwort eine Umschreibung.', 'Méfiez-vous des mots identiques dans le texte et dans une réponse : la bonne réponse est souvent une reformulation.')}

NASSE FÜSSE FÜRS KLIMA
Jahrhundertelang hat man Moore trockengelegt, um Äcker und Weiden zu gewinnen. Jetzt sollen viele von ihnen wieder nass werden. Für manche Landwirte ist das eine Zumutung, für andere eine Chance.

Auf den ersten Blick sieht die Weide von Hinrich Janssen aus wie jede andere in Ostfriesland: flach, grün, mit einem Graben am Rand. Doch unter dem Gras liegt Torf, mehrere Meter tief. Vor gut hundert Jahren war hier noch Moor. Dann wurden Gräben gezogen, das Wasser floss ab, und aus dem nassen Land wurde Grünland für Kühe. Was damals als Fortschritt galt, gilt heute als Klimaproblem.

Denn solange ein Moor nass ist, speichert es Kohlenstoff, und zwar in großen Mengen: Obwohl Moore weltweit nur etwa drei Prozent der Landfläche bedecken, binden sie ungefähr doppelt so viel Kohlenstoff wie alle Wälder der Erde zusammen. Wird ein Moor dagegen entwässert, kommt der Torf mit Luft in Berührung und zersetzt sich. Dabei entweicht Kohlendioxid. In Deutschland sind über neunzig Prozent der Moorböden trockengelegt. Nach Schätzungen stammen aus ihnen rund sieben Prozent der deutschen Treibhausgasemissionen.

Die Lösung klingt einfach: Gräben schließen, den Wasserstand anheben, das Moor wieder vernässen. Für Landwirte wie Janssen bedeutet das jedoch, dass ihre Flächen für Kühe und Mais nicht mehr taugen. „Mein Großvater hat dieses Land urbar gemacht. Und jetzt soll ich es wieder absaufen lassen?“, fragt er. Auch wenn er die Zahlen kennt, fällt ihm der Gedanke schwer. Viele seiner Nachbarn fürchten außerdem, dass ein höherer Wasserstand auch ihre Keller und Felder erreicht.

Die Biologin Anke Vosswinkel begleitet seit Jahren Projekte zur Wiedervernässung. Sie versteht die Sorgen, hält das Bild vom „Absaufen“ aber für falsch. „Ein nasses Moor ist keine tote Fläche“, sagt sie. Auf vernässten Böden lassen sich Schilf, Rohrkolben oder Torfmoose anbauen; Fachleute sprechen von Paludikultur. Mit Schilf werden seit jeher Dächer gedeckt, Rohrkolben eignet sich als Dämmstoff für Häuser, und Torfmoos könnte in Gärtnereien den Torf ersetzen, der bisher aus Mooren abgebaut wird.

Ob sich das für die Betriebe rechnet, ist allerdings offen. Maschinen für nasse Böden sind teuer, und Abnehmer für die neuen Produkte gibt es noch wenige. Vosswinkel fordert deshalb, dass der Staat die Umstellung über viele Jahre unterstützt: „Wenn wir den Landwirten nur sagen, was sie nicht mehr dürfen, werden wir scheitern. Wir müssen ihnen zeigen, wovon sie in zwanzig Jahren leben können.“

Janssen hat inzwischen einen Teil seiner Fläche für einen Versuch zur Verfügung gestellt. Auf zwei Hektar wächst seit dem letzten Sommer Rohrkolben. Überzeugt ist er noch nicht. Aber er sagt: „Bis meine Tochter den Hof übernimmt, wird sich hier einiges verändert haben. Dann soll sie wenigstens wissen, welche Möglichkeiten es gibt.“` },
      placements: [{ media: 'b2-umwelt-atelier-pruefung-artikel', caption: 'Der Artikel (Anfang)' }],
      questions: [
        choice('q1', aide('1. Warum gilt die Entwässerung der Moore heute als Problem?', '1. Pourquoi le drainage des tourbières pose-t-il problème aujourd’hui ?'),
          [['Weil sich trockener Torf zersetzt und dabei Kohlendioxid freisetzt.', true],
            ['Weil auf den entwässerten Flächen keine Kühe mehr weiden können.'],
            ['Weil die offenen Gräben bei Regen die Keller der Nachbarn überschwemmen.']],
          '„Wird ein Moor dagegen entwässert, kommt der Torf mit Luft in Berührung und zersetzt sich. Dabei entweicht Kohlendioxid.“ Die Antwort umschreibt diesen Satz. Kühe weiden gerade auf den entwässerten Flächen, und die Sorge um die Keller betrifft die Wiedervernässung. [fr?] La tourbe asséchée se décompose et libère du CO₂.'),
        choice('q2', aide('2. Was sagt der Text über die Speicherung von Kohlenstoff?', '2. Que dit le texte sur le stockage du carbone ?'),
          [['Moore und Wälder speichern weltweit ungefähr gleich viel Kohlenstoff.'],
            ['Nur die Moore in Deutschland speichern mehr Kohlenstoff als alle deutschen Wälder.'],
            ['Moore speichern doppelt so viel wie alle Wälder, bedecken aber viel weniger Fläche.', true]],
          '„Obwohl Moore weltweit nur etwa drei Prozent der Landfläche bedecken, binden sie ungefähr doppelt so viel Kohlenstoff wie alle Wälder der Erde zusammen.“ Die Aussage gilt weltweit, nicht nur für Deutschland. [fr?] Peu de surface, mais deux fois plus de carbone que toutes les forêts.'),
        choice('q3', aide('3. Wie steht Hinrich Janssen zur Wiedervernässung?', '3. Quelle est la position de Hinrich Janssen sur la remise en eau ?'),
          [['Er lehnt sie entschieden ab, weil er die Zahlen der Fachleute für falsch hält.'],
            ['Er hat schon beschlossen, seine gesamte Fläche wieder zu vernässen.'],
            ['Er kennt die Argumente, aber der Gedanke fällt ihm persönlich schwer.', true]],
          '„Auch wenn er die Zahlen kennt, fällt ihm der Gedanke schwer.“ Er bezweifelt die Zahlen nicht, und er vernässt nur einen Teil seiner Fläche zum Versuch (zwei Hektar). [fr?] Il connaît les chiffres, mais l’idée lui coûte.'),
        choice('q4', aide('4. Was bezeichnet der Begriff „Paludikultur“?', '4. Que désigne le terme « Paludikultur » ?'),
          [['die Gewinnung von Torf für Gärtnereien und private Gärten'],
            ['den Bau von Häusern auf ehemaligen, trockengelegten Moorflächen'],
            ['den Anbau von Pflanzen wie Schilf auf wieder nassen Moorböden', true]],
          '„Auf vernässten Böden lassen sich Schilf, Rohrkolben oder Torfmoose anbauen; Fachleute sprechen von Paludikultur.“ Torf soll gerade nicht mehr abgebaut werden, und von Häusern auf Moorflächen ist nicht die Rede. Ein Fachbegriff wird oft direkt im Satz davor oder danach erklärt. [fr?] Un terme technique est souvent expliqué juste avant ou après.'),
        choice('q5', aide('5. Was fordert Anke Vosswinkel?', '5. Que demande Anke Vosswinkel ?'),
          [['langfristige Hilfe des Staates, damit die Betriebe neue Einnahmen finden', true],
            ['strengere Verbote und höhere Strafen für Landwirte, die Moore entwässern'],
            ['dass die Landwirte ihre Höfe an Naturschutzverbände verkaufen']],
          'Sie fordert, „dass der Staat die Umstellung über viele Jahre unterstützt“, und sagt: „Wenn wir den Landwirten nur sagen, was sie nicht mehr dürfen, werden wir scheitern.“ Verbote lehnt sie als alleinige Lösung also gerade ab. [fr?] Un soutien de l’État sur la durée, pas seulement des interdictions.'),
        choice('q6', aide('6. Was erfährt man am Ende über Hinrich Janssen?', '6. Qu’apprend-on à la fin sur Hinrich Janssen ?'),
          [['Er probiert etwas Neues aus, obwohl er noch nicht überzeugt ist.', true],
            ['Er hat alle seine Kühe verkauft und lebt inzwischen nur noch vom Rohrkolben.'],
            ['Seine Tochter hat den Hof bereits im letzten Sommer übernommen.']],
          'Auf zwei Hektar wächst Rohrkolben als Versuch, aber: „Überzeugt ist er noch nicht.“ Seine Tochter wird den Hof erst später übernehmen: „Bis meine Tochter den Hof übernimmt, wird sich hier einiges verändert haben“ (Futur II). [fr?] Il fait un essai sans être encore convaincu.'),
        choice('q7', aide('7. Welches Ziel verfolgt der Text vor allem?', '7. Quel est surtout le but du texte ?'),
          [['Er wirbt für Dämmstoffe aus Rohrkolben und anderen Moorpflanzen.'],
            ['Er fordert die Landwirte auf, ihre Flächen sofort und vollständig zu vernässen.'],
            ['Er informiert über Chancen und Schwierigkeiten eines Klimaprojekts.', true]],
          'Der Text stellt beide Seiten dar: den Nutzen für das Klima und die Paludikultur, aber auch die Sorgen der Landwirte und die offenen Kostenfragen. Er wirbt nicht für ein Produkt und ruft niemanden direkt zu etwas auf. [fr?] Un article de fond informe en présentant avantages et difficultés.'),
      ] },

    // 6 · Mission écrite
    { id: 'b2-umwelt-atelier-schreiben', kind: 'mission', title: 'Mission: einen Vorschlag für den Bürgerhaushalt schreiben', estimatedMinutes: 27,
      competences: ['expression-ecrite'],
      lesson: { description: `SITUATION
[fr?] La situation
${aide('Ihre Stadt stellt im Bürgerhaushalt 200 000 Euro für Klimaschutz und Hitzeschutz zur Verfügung. Alle Einwohnerinnen und Einwohner können bis Ende März ein Projekt vorschlagen; danach entscheidet der Stadtrat.', 'Votre ville consacre 200 000 euros de son budget participatif à la protection du climat et contre la chaleur. Chaque habitant peut proposer un projet jusqu’à fin mars ; le conseil municipal décide ensuite.')}

IDEEN
[fr?] Idées
• ${aide('eine Solaranlage auf dem Dach der Turnhalle', 'une installation solaire sur le toit du gymnase')}
• ${aide('Lastenräder zum Ausleihen im Stadtteil', 'des vélos cargos en prêt dans le quartier')}
• ${aide('Trinkbrunnen und Sonnensegel auf dem Marktplatz', 'des fontaines et des voiles d’ombrage sur la place du marché')}
• ${aide('oder eine eigene Idee', 'ou votre propre idée')}

SO GEHEN SIE VOR
[fr?] Démarche
1. ${aide('Planen (7 Minuten): Überlegen Sie sich Stichwörter zum Projekt, zu zwei Argumenten, zu einem möglichen Einwand und zum Ziel.', 'Planifier (7 minutes) : trouvez des mots-clés sur le projet, deux arguments, une objection possible et l’objectif.')}
2. ${aide('Schreiben (15 Minuten): Folgen Sie dem Aufbau aus dem Modell von Leyla Durmaz.', 'Écrire (15 minutes) : suivez la structure du modèle de Leyla Durmaz.')}
3. ${aide('Prüfen (5 Minuten): Lesen Sie Ihren Text mit der Checkliste und achten Sie auf die Wortstellung nach „auch wenn“ und „trotzdem“.', 'Vérifier (5 minutes) : relisez avec la liste et surveillez l’ordre des mots après « auch wenn » et « trotzdem ».')}` },
      mission: {
        oral: null,
        written: { prompt: aide('Schreiben Sie einen Vorschlag an den Stadtrat (180 bis 250 Wörter). Beschreiben Sie Ihr Projekt, begründen Sie es mit zwei Argumenten und einem konkreten Beispiel, greifen Sie einen möglichen Einwand auf und entkräften Sie ihn. Sagen Sie, was bis wann erreicht sein wird, und bitten Sie am Ende um Unterstützung.',
          'Écrivez une proposition au conseil municipal (180 à 250 mots) : décrivez votre projet, justifiez-le par deux arguments et un exemple concret, reprenez et réfutez une objection possible, dites ce qui sera atteint et quand, et demandez pour finir un soutien.'),
          maxChars: 2400, minWords: 170 },
        checklist: [
          aide('Betreff, Anrede und Grußformel sind formell.', 'Objet, formule d’appel et formule finale formels.'),
          aide('Das Projekt ist klar beschrieben: Was, wo, für wen?', 'Le projet est clairement décrit : quoi, où, pour qui ?'),
          aide('Zwei Argumente, eines mit einem konkreten Beispiel oder einer Zahl', 'Deux arguments, dont un avec un exemple concret ou un chiffre'),
          aide('Ein Einwand ist aufgegriffen und entkräftet (zwar … aber, auch wenn).', 'Une objection est reprise et réfutée.'),
          aide('Ausblick mit Zeitpunkt, zum Beispiel im Futur II: „Bis … werden wir … haben.“', 'Une perspective datée, par exemple au Futur II.'),
        ],
        criteria: [
          { ...GRIDS.b2.schreiben[0], label: aide('Aufgabe: Projekt, zwei Argumente mit Beispiel, Einwand entkräftet, Ausblick, Bitte; formell', 'Tâche : projet, arguments, objection réfutée, perspective, demande ; registre formel') },
          ...GRIDS.b2.schreiben.slice(1),
        ],
      } },

    // 7 · Mission orale
    { id: 'b2-umwelt-atelier-sprechen', kind: 'mission', title: 'Mission: einen Kurzvortrag halten', estimatedMinutes: 20,
      competences: ['expression-orale'],
      lesson: { description: `SITUATION
[fr?] La situation
${aide('Sie halten in Ihrem Deutschkurs einen Kurzvortrag von drei bis vier Minuten. Wählen Sie eines der beiden Themen.', 'Vous présentez un exposé de trois à quatre minutes dans votre cours d’allemand. Choisissez l’un des deux sujets.')}

DIE THEMEN
[fr?] Les sujets
• ${aide('Thema A: Sollte das Fliegen deutlich teurer werden?', 'Sujet A : faut-il rendre l’avion nettement plus cher ?')}
• ${aide('Thema B: Sollte jede Stadt einen Hitzeschutzplan haben?', 'Sujet B : chaque ville doit-elle avoir un plan canicule ?')}

AUFBAU
[fr?] Structure
1. ${aide('Thema und Gliederung nennen („Mein Thema lautet … Ich gehe in drei Schritten vor …“)', 'Annoncer le sujet et le plan')}
2. ${aide('Die Situation erklären, mit einem Beispiel aus Ihrem Land', 'Expliquer la situation, avec un exemple de votre pays')}
3. ${aide('Argumente dafür', 'Arguments pour')}
4. ${aide('Argumente dagegen; einen Einwand anerkennen („Das ist nicht von der Hand zu weisen. Auch wenn …“)', 'Arguments contre ; reconnaître une objection')}
5. ${aide('Ihre Meinung begründen und schließen („Abschließend möchte ich betonen …“)', 'Justifier votre avis et conclure')}

VORBEREITUNG
[fr?] Préparation
${aide('Nehmen Sie sich acht Minuten Zeit und überlegen Sie sich Stichwörter zu jedem Teil, keine ganzen Sätze. Sprechen Sie dann frei.', 'Prenez huit minutes pour trouver des mots-clés pour chaque partie, pas des phrases entières. Parlez ensuite librement.')}` },
      placements: [{ media: 'b2-umwelt-atelier-sprechen-folie', caption: 'Kurzvortrag: Thema A oder B' }],
      mission: {
        oral: { prompt: aide('Halten Sie einen Vortrag von drei bis vier Minuten zu Thema A oder B. Folgen Sie den fünf Teilen, nennen Sie mindestens ein Beispiel aus Ihrem Land und erkennen Sie ein Gegenargument an, bevor Sie Ihre Meinung begründen.',
          'Présentez un exposé de trois à quatre minutes sur le sujet A ou B : suivez les cinq parties, donnez au moins un exemple de votre pays et reconnaissez un contre-argument avant de justifier votre avis.'),
          maxSeconds: 240 },
        written: null,
        checklist: [
          aide('Ich nenne das Thema und kündige meine Gliederung an.', 'J’annonce le sujet et mon plan.'),
          aide('Ich erkläre die Situation mit einem Beispiel aus meinem Land.', 'J’explique la situation avec un exemple de mon pays.'),
          aide('Ich nenne Argumente dafür und dagegen.', 'Je donne des arguments pour et contre.'),
          aide('Ich erkenne einen Einwand an: „Auch wenn …, …“', 'Je reconnais une objection : « Auch wenn …, … ».'),
          aide('Ich schließe mit meiner begründeten Meinung und bedanke mich.', 'Je conclus par mon avis justifié et je remercie.'),
        ],
        criteria: [
          { ...GRIDS.b2.sprechen[0], label: aide('Aufgabe: fünf Teile in drei bis vier Minuten, Beispiel, Gegenargument, begründete Meinung', 'Tâche : cinq parties, exemple, contre-argument, avis justifié') },
          ...GRIDS.b2.sprechen.slice(1),
        ],
      } },

    // 8 · Faire le point
    { id: 'b2-umwelt-atelier-bilan', kind: 'lesson', title: 'Bilanz: Umwelt und Argumentieren', estimatedMinutes: 6,
      competences: ['lecture'],
      lesson: { description: `${aide('Lesen Sie die Ziele der beiden Module „Umwelt“. Was können Sie schon gut? Was möchten Sie noch üben?', 'Relisez les objectifs des deux modules « Umwelt ». Que savez-vous déjà bien faire ? Que voulez-vous encore travailler ?')}

ICH KANN …
[fr?] Je peux…
• ${aide('Ich kann einen Hintergrundartikel verstehen und die Haltung der Autorin oder des Autors erkennen.', 'Je peux comprendre un article de fond et reconnaître la position de l’auteur.')}
• ${aide('Ich kann einen formellen Vorschlag mit Argumenten, Beispiel und entkräftetem Einwand schreiben.', 'Je peux écrire une proposition formelle avec arguments, exemple et objection réfutée.')}
• ${aide('Ich kann in einer Diskussion einen Einwand anerkennen und trotzdem überzeugen.', 'Je peux reconnaître une objection dans un débat et rester convaincant.')}
• ${aide('Ich kann ein Diagramm einfach erklären und nur das Wichtige weitergeben.', 'Je peux expliquer simplement un graphique et ne transmettre que l’essentiel.')}
• ${aide('Ich kann einen strukturierten Kurzvortrag von drei bis vier Minuten halten.', 'Je peux présenter un exposé structuré de trois à quatre minutes.')}

STRATEGIEN
[fr?] Stratégies
• ${aide('Argumentieren: erst anerkennen, dann widersprechen („Da ist etwas dran, allerdings …“).', 'Argumenter : reconnaître, puis contredire.')}
• ${aide('Grafiken: Thema, Trend, eine oder zwei gerundete Zahlen; „um“ für den Unterschied, „auf“ für den neuen Wert.', 'Graphiques : sujet, tendance, un ou deux chiffres arrondis ; um = écart, auf = nouvelle valeur.')}
• ${aide('Prüfung Lesen: zuerst die Aufgaben lesen, dann im Text nach Umschreibungen suchen.', 'Examen de lecture : lire d’abord les questions, puis chercher les reformulations dans le texte.')}

NOCH NICHT SICHER?
[fr?] Pas encore sûr ?
${aide('Futur II und konzessive Sätze: Wiederholen Sie die Regel und die Übungen im Modul „Umwelt“. Formulierungen für Vorschläge und Vorträge: Lesen Sie das Modell von Leyla Durmaz und hören Sie den Vortrag von Jannik Sommer noch einmal. Wortstellung nach „trotzdem“ und „auch wenn“: Wiederholen Sie die Übung „Korrigieren“.', 'Futur II et concessives : revoyez la règle et les exercices du module « Umwelt ». Formules : relisez le modèle et réécoutez l’exposé. Ordre des mots : refaites l’exercice de correction.')}` } },
  ],
};
