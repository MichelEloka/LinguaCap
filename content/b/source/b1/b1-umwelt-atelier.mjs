// Module 20 · b1-umwelt-atelier (lot R4, thème 10) : défendre une proposition, présenter un thème.
// Médiation : expliquer un graphique (gabarit chart) à une voisine. Examen : Sprechen, présenter un thème en cinq parties.
// Missions : proposition écrite au conseil de quartier (120 à 150 mots) et exposé oral de 3 minutes.
// Reprise réécrite du brouillon B1 V1 (partie3.mjs › b1-umwelt, tâches writing et speaking).
import { C, bi, choice, fill, order, speak, GRIDS } from '../../lib.mjs';

// Répétition de plus de dix mots : seuil 70 (plan, §1.5 ; c’est aussi le seuil par défaut du profil B1).
const speakLong = (id, text, explanation, accept) => ({ ...speak(id, text, explanation, accept), threshold: 70 });
// Grille standard B1, libellé « Tâche » précisé pour la mission (mêmes identifiants et points).
const grid = (criteria, aufgabe) => criteria.map((criterion) => (criterion.id === 'aufgabe' ? { ...criterion, label: aufgabe } : { ...criterion }));
const lines = (...items) => items.join('\n');

export default {
  id: 'b1-umwelt-atelier',
  title: 'Umwelt (atelier) : défendre une proposition, présenter un thème',
  objective: 'Présenter un thème en cinq parties, répondre aux questions du public, expliquer un graphique à une voisine et défendre par écrit un projet devant le conseil de quartier.',
  sources: [
    'Textes, dialogues et exercices originaux LinguaCap.',
    'Tâches reprises et réécrites du brouillon B1 V1 (LinguaCap) : écrire au conseil du quartier, défendre un choix en réunion.',
  ],
  vocabulary: [
    { word: 'Grafik', article: 'die', plural: 'Grafiken', partOfSpeech: 'noun', translation: 'le graphique',
      example: 'Die Grafik zeigt, woraus der Restmüll besteht.', note: null },
    { word: 'Anteil', article: 'der', plural: 'Anteile', partOfSpeech: 'noun', translation: 'la part, la proportion',
      example: 'Der Anteil von Bioabfall ist sehr hoch.', note: null },
    { word: 'Hälfte', article: 'die', plural: 'Hälften', partOfSpeech: 'noun', translation: 'la moitié',
      example: 'Fast die Hälfte des Mülls ist Bioabfall.', note: 'ein Drittel, ein Viertel : un tiers, un quart' },
    { word: 'Restmüll', article: 'der', plural: null, partOfSpeech: 'noun', translation: 'les ordures ménagères (non triées)',
      example: 'Batterien gehören nicht in den Restmüll.', note: null },
    { word: 'Biotonne', article: 'die', plural: 'Biotonnen', partOfSpeech: 'noun', translation: 'la poubelle à biodéchets',
      example: 'Kaffeesatz und Essensreste kommen in die Biotonne.', note: 'der Bioabfall : les biodéchets' },
    { word: 'den Müll trennen', partOfSpeech: 'expression', translation: 'trier les déchets',
      example: 'Bei uns im Haus trennen alle den Müll.', note: null },
    { word: 'Stadtteilrat', article: 'der', plural: 'Stadtteilräte', partOfSpeech: 'noun', translation: 'le conseil de quartier',
      example: 'Der Stadtteilrat entscheidet im Juni.', note: null },
    { word: 'Gemeinschaftsgarten', article: 'der', plural: 'Gemeinschaftsgärten', partOfSpeech: 'noun', translation: 'le jardin partagé',
      example: 'Im Gemeinschaftsgarten pflanzen Nachbarn zusammen Gemüse.', note: null },
    { word: 'beantragen', partOfSpeech: 'verb', translation: 'demander officiellement (une aide, une autorisation)',
      example: 'Wir möchten Geld für einen Trinkbrunnen beantragen.', note: 'der Antrag : la demande officielle' },
    { word: 'im Vergleich zu', partOfSpeech: 'expression', translation: 'par rapport à, en comparaison de',
      example: 'Im Vergleich zu Paris gibt es hier mehr Radwege.', note: '+ datif' },
    { word: 'Ich möchte heute über … sprechen.', partOfSpeech: 'expression', translation: 'Je voudrais parler aujourd’hui de …',
      example: 'Ich möchte heute über Mülltrennung sprechen.', note: 'über + accusatif' },
    { word: 'Dafür spricht, dass …', partOfSpeech: 'expression', translation: 'Un argument en faveur de cela, c’est que …',
      example: 'Dafür spricht, dass ein Garten wenig kostet.', note: 'contraire : Dagegen spricht, dass …' },
    { word: 'Meiner Meinung nach …', partOfSpeech: 'expression', translation: 'À mon avis …',
      example: 'Meiner Meinung nach überwiegen die Vorteile.', note: 'verbe juste après : Meiner Meinung nach ist …' },
    { word: 'überwiegen', partOfSpeech: 'verb', translation: 'l’emporter, prédominer',
      example: 'Die Vorteile überwiegen klar.', note: 'non séparable : die Vorteile überwiegen' },
    { word: 'Zum Schluss …', partOfSpeech: 'expression', translation: 'Pour finir …, en conclusion …',
      example: 'Zum Schluss möchte ich mich bedanken.', note: null },
    { word: 'Sehr geehrte Damen und Herren,', partOfSpeech: 'expression', translation: 'Madame, Monsieur, (lettre formelle)',
      example: 'Sehr geehrte Damen und Herren, ich wohne seit drei Jahren im Viertel.', note: 'après la virgule, minuscule : ich …' },
    { word: 'Ich würde mich über eine Antwort freuen.', partOfSpeech: 'expression', translation: 'Je serais heureux/heureuse d’avoir une réponse.',
      example: 'Ich würde mich über eine baldige Antwort freuen.', note: 'sich freuen über + accusatif' },
  ],
  media: [
    { key: 'b1-umwelt-atelier-modell-audio', kind: 'audio', title: 'Exposé modèle : l’eau du robinet ou l’eau en bouteille ?',
      script: [
        { voice: 'frau2', name: 'Amélie', text: 'Ich möchte heute über ein Thema sprechen, das uns alle betrifft: Trinken wir Leitungswasser oder Wasser aus Flaschen? Zuerst erzähle ich von meiner Erfahrung, dann spreche ich über die Situation in meinem Heimatland. Am Ende sage ich meine Meinung.' },
        { pause: 0.8 },
        { voice: 'frau2', name: 'Amélie', text: 'Ich selbst habe früher immer Wasser in Plastikflaschen gekauft. Die Kisten waren schwer, und jede Woche hatte ich einen großen Sack Plastikmüll. Seit zwei Jahren trinke ich nur noch Leitungswasser, und ich vermisse nichts.' },
        { pause: 0.8 },
        { voice: 'frau2', name: 'Amélie', text: 'In meiner Familie in Frankreich trinken fast alle Wasser aus Flaschen, obwohl das Leitungswasser gut ist. In Deutschland ist es ähnlich. Aber hier gibt es in vielen Büros und Schulen Wasserspender, und ich habe den Eindruck, dass junge Leute öfter Leitungswasser trinken.' },
        { pause: 0.8 },
        { voice: 'frau2', name: 'Amélie', text: 'Dafür spricht, dass Leitungswasser viel billiger ist und keinen Müll macht. Man muss auch keine schweren Kisten tragen. Ein Nachteil ist, dass manche Leute den Geschmack nicht mögen. Meiner Meinung nach sind die Vorteile aber viel größer.' },
        { pause: 0.8 },
        { voice: 'frau2', name: 'Amélie', text: 'Zum Schluss möchte ich sagen: Wenn alle eine eigene Trinkflasche dabeihätten, gäbe es viel weniger Plastikmüll. Vielen Dank fürs Zuhören! Haben Sie Fragen?' },
      ] },
    { key: 'b1-umwelt-atelier-interaktion-f1', kind: 'audio', title: 'Question du public 1',
      script: [{ voice: 'mann', name: 'Zuhörer', text: 'Die Idee ist gut. Aber wer bezahlt, wenn ein teures Gerät kaputtgeht?' }] },
    { key: 'b1-umwelt-atelier-interaktion-f2', kind: 'audio', title: 'Question du public 2',
      script: [{ voice: 'frau3', name: 'Zuhörerin', text: 'Entschuldigung, das habe ich nicht ganz verstanden. Wann genau ist der Laden geöffnet?' }] },
    { key: 'b1-umwelt-atelier-interaktion-f3', kind: 'audio', title: 'Question du public 3',
      script: [{ voice: 'mann3', name: 'Zuhörer', text: 'Ich finde den Radweg wichtiger. Warum sollte ich für Ihren Laden stimmen?' }] },
    { key: 'b1-umwelt-atelier-interaktion-f4', kind: 'audio', title: 'Question du public 4',
      script: [{ voice: 'frau', name: 'Zuhörerin', text: 'Gibt es so ein Projekt schon woanders? Funktioniert das wirklich?' }] },
    { key: 'b1-umwelt-atelier-mediation-grafik', kind: 'image', title: 'Graphique : ce que contiennent les poubelles du quartier',
      alt: 'Diagramme en barres « Was landet im Nordring im Restmüll? » : Bioabfall 39 %, echter Restmüll 28 %, Verpackungen 15 %, Papier und Pappe 12 %, Glas 6 %.',
      image: { layout: 'chart', title: 'Was landet im Nordring im Restmüll?', unit: '%',
        bars: [
          { label: 'Bioabfall', value: 39 },
          { label: 'echter Restmüll', value: 28 },
          { label: 'Verpackungen', value: 15 },
          { label: 'Papier und Pappe', value: 12 },
          { label: 'Glas', value: 6 },
        ],
        highlight: 0, source: 'Kontrolle der Bürgerinitiative, eine Woche im März' } },
    { key: 'b1-umwelt-atelier-pruefung-folie', kind: 'image', title: 'Support de l’exposé : cinq parties',
      alt: 'Support d’exposé « Thema: Autofreie Innenstadt? » avec cinq parties numérotées : thème, expérience, pays d’origine, avantages et inconvénients, conclusion.',
      image: { layout: 'document', icon: 'presentation', title: 'Thema: Autofreie Innenstadt?', subtitle: 'Präsentation, etwa 3 Minuten',
        lines: [
          { icon: 'megaphone', text: '1 · Thema vorstellen und Aufbau nennen' },
          { icon: 'user-round', text: '2 · Eigene Erfahrung' },
          { icon: 'map', text: '3 · Situation im Heimatland' },
          { icon: 'list-checks', text: '4 · Vor- und Nachteile, Ihre Meinung' },
          { icon: 'star', text: '5 · Schluss und Dank' },
        ] } },
  ],
  activities: [
    { id: 'b1-umwelt-atelier-modell', kind: 'lesson', title: 'Modèle : présenter un thème en cinq parties', estimatedMinutes: 12,
      competences: ['lecture', 'ecoute'],
      lesson: { description: `${bi('Hören Sie die Präsentation und lesen Sie mit. Achten Sie auf den Aufbau und auf die Redemittel.', 'Écoutez la présentation en suivant le texte. Observez la structure et les formules.')}

DIE SITUATION
[fr] La situation
Amélie lernt Deutsch und präsentiert in ihrem Kurs ein Thema: „Leitungswasser oder Wasser aus Flaschen?“ [fr] Amélie apprend l’allemand et présente un thème à son cours : « L’eau du robinet ou l’eau en bouteille ? »

TEIL 1 · DAS THEMA VORSTELLEN
[fr] Partie 1 · annoncer le thème et le plan
Ich möchte heute über ein Thema sprechen, das uns alle betrifft: Trinken wir Leitungswasser oder Wasser aus Flaschen? Zuerst erzähle ich von meiner Erfahrung, dann spreche ich über die Situation in meinem Heimatland. Am Ende sage ich meine Meinung.

TEIL 2 · EIGENE ERFAHRUNG
[fr] Partie 2 · une expérience personnelle
Ich selbst habe früher immer Wasser in Plastikflaschen gekauft. Die Kisten waren schwer, und jede Woche hatte ich einen großen Sack Plastikmüll. Seit zwei Jahren trinke ich nur noch Leitungswasser, und ich vermisse nichts.

TEIL 3 · DIE SITUATION IM HEIMATLAND
[fr] Partie 3 · la situation dans son pays
In meiner Familie in Frankreich trinken fast alle Wasser aus Flaschen, obwohl das Leitungswasser gut ist. In Deutschland ist es ähnlich. Aber hier gibt es in vielen Büros und Schulen Wasserspender, und ich habe den Eindruck, dass junge Leute öfter Leitungswasser trinken.

TEIL 4 · VOR- UND NACHTEILE, MEINUNG
[fr] Partie 4 · avantages, inconvénients, avis
Dafür spricht, dass Leitungswasser viel billiger ist und keinen Müll macht. Man muss auch keine schweren Kisten tragen. Ein Nachteil ist, dass manche Leute den Geschmack nicht mögen. Meiner Meinung nach sind die Vorteile aber viel größer.

TEIL 5 · SCHLUSS
[fr] Partie 5 · conclusion
Zum Schluss möchte ich sagen: Wenn alle eine eigene Trinkflasche dabeihätten, gäbe es viel weniger Plastikmüll. Vielen Dank fürs Zuhören! Haben Sie Fragen?

REDEMITTEL
[fr] Formules utiles
EINLEITEN
[fr] Introduire
• Ich möchte heute über … sprechen. / Mein Thema ist …
• Zuerst …, dann …, am Ende …
BEISPIEL
[fr] Raconter, donner un exemple
• Ich selbst habe … / Zum Beispiel …
• In meinem Heimatland ist es anders / ähnlich: …
BEGRÜNDEN
[fr] Justifier
• Dafür spricht, dass … / Ein Nachteil ist, dass …
• Meiner Meinung nach …, weil …
SCHLUSS
[fr] Conclure
• Zum Schluss möchte ich sagen, … / Vielen Dank fürs Zuhören!

À REMARQUER
• Chaque partie dure de 30 à 40 secondes : trois minutes en tout.
• Les mots zuerst, dann et am Ende annoncent le plan et guident l’auditeur.
• La conclusion réemploie le Konjunktiv II du module thème : Wenn alle … dabeihätten, gäbe es …` },
      placements: [{ media: 'b1-umwelt-atelier-modell-audio', transcriptVisibility: 'on_demand' }] },

    { id: 'b1-umwelt-atelier-interaktion', kind: 'exercise', title: 'Réagir : répondre aux questions du public', estimatedMinutes: 10,
      competences: ['ecoute', 'expression-orale'],
      lesson: { description: `${C.reagieren}

DIE SITUATION
[fr] La situation
Sie haben im Nachbarschaftshaus den Leihladen vorgestellt. Jetzt stellen die Zuhörer Fragen oder machen Einwände. [fr] Vous avez présenté le magasin de prêt à la maison de quartier. Le public pose maintenant des questions ou fait des objections.
${bi('Hören Sie jede Frage und wählen Sie eine passende Antwort. Sprechen Sie dann die Sätze nach.', 'Écoutez chaque question et choisissez une réponse adaptée, puis répétez les phrases.')}` },
      placements: [
        { media: 'b1-umwelt-atelier-interaktion-f1', questionId: 'q1', transcriptVisibility: 'after_answer' },
        { media: 'b1-umwelt-atelier-interaktion-f2', questionId: 'q2', transcriptVisibility: 'after_answer' },
        { media: 'b1-umwelt-atelier-interaktion-f3', questionId: 'q3', transcriptVisibility: 'after_answer' },
        { media: 'b1-umwelt-atelier-interaktion-f4', questionId: 'q4', transcriptVisibility: 'after_answer' },
      ],
      questions: [
        choice('q1', bi('Frage 1: Was antworten Sie?', 'Question 1 : que répondez-vous ?'), [
          ['Gute Frage. Dafür gibt es ein Pfand von zehn Euro.', true],
          ['Das weiß ich leider nicht. Das ist nicht mein Problem.'],
          ['Ja, Sie haben recht, die Geräte sind viel zu teuer.'],
        ], 'On remercie pour la question (« Gute Frage »), puis on répond précisément : la caution couvre ce risque. La troisième réplique donne raison à l’objection sans défendre le projet.'),
        choice('q2', bi('Frage 2: Was antworten Sie?', 'Question 2 : que répondez-vous ?'), [
          ['Das habe ich doch schon gesagt.'],
          ['Der Laden ist im Keller, gleich neben dem Eingang zum Hof.'],
          ['Natürlich, ich wiederhole gern: dienstags und samstags.', true],
        ], 'La personne demande les horaires : on répète volontiers (« ich wiederhole gern »). La deuxième réponse donne le lieu au lieu des horaires, la première est impolie.'),
        choice('q3', bi('Frage 3: Was antworten Sie?', 'Question 3 : que répondez-vous ?'), [
          ['Weil der Radweg eine schlechte und für die Stadt viel zu teure Idee ist.'],
          ['Ich verstehe Ihren Punkt. Trotzdem hilft der Leihladen mehr Leuten.', true],
          ['Dann stimmen Sie doch einfach für den Radweg, kein Problem.'],
        ], 'Face à une objection, on reconnaît le point de vue (« Ich verstehe Ihren Punkt »), puis on avance son argument avec « trotzdem ». Dénigrer l’autre projet ou couper court n’argumente pas.'),
        choice('q4', bi('Frage 4: Was antworten Sie?', 'Question 4 : que répondez-vous ?'), [
          ['Ja, ich fahre jeden Tag mit dem Rad durch das Viertel.'],
          ['Nein, ich habe dazu leider keine weiteren Fragen.'],
          ['Ja, in meiner alten Stadt gab es einen Leihladen, er war beliebt.', true],
        ], 'On répond à la question « Gibt es so ein Projekt schon woanders? » par un exemple vécu, au prétérit (« gab es », « war »). Les deux autres réponses ne parlent pas du projet.'),
        speak('q5', 'Das ist eine gute Frage. Darauf komme ich gleich zurück.',
          'Pour gagner du temps poliment : « Darauf komme ich gleich zurück » (j’y reviens tout de suite). L’accent porte sur « gleich ».'),
        speak('q6', 'Ich verstehe Ihren Punkt, aber ich sehe das etwas anders.',
          'Désaccord poli : on reconnaît d’abord l’avis de l’autre. Accentuez « verstehe » puis « anders ».'),
        speak('q7', 'Habe ich Ihre Frage damit beantwortet?',
          'Question de vérification à la fin d’une réponse. Question fermée : la voix monte à la fin.'),
      ] },

    { id: 'b1-umwelt-atelier-mediation', kind: 'exercise', title: 'Médiation : expliquer un graphique à une voisine', estimatedMinutes: 15,
      competences: ['lecture', 'expression-ecrite'],
      lesson: { description: `${bi('Lesen Sie die Situation und sehen Sie sich die Grafik an. Beantworten Sie dann die Fragen.', 'Lisez la situation et regardez le graphique, puis répondez aux questions.')}

DIE SITUATION
[fr] La situation
Die Bürgerinitiative hat eine Woche lang die Restmülltonnen im Viertel kontrolliert. Ihre Nachbarin, Frau Kovač, versteht die Grafik nicht gut. Sie möchte vor allem wissen, was sie selbst tun kann. [fr] Le collectif a contrôlé pendant une semaine les poubelles d’ordures ménagères du quartier. Votre voisine, Mme Kovač, comprend mal le graphique. Elle veut surtout savoir ce qu’elle peut faire elle-même.

STRATEGIE
[fr] Stratégie
Nennen Sie zuerst das Thema der Grafik, dann die wichtigste Zahl. Sagen Sie zum Schluss, was die Person tun kann. [fr] Dites d’abord le thème du graphique, puis le chiffre le plus important. Terminez par ce que la personne peut faire.
Benutzen Sie einfache Wörter: fast die Hälfte, ein Viertel, der größte Teil. [fr] Employez des mots simples : presque la moitié, un quart, la plus grande partie.

WICHTIGE WÖRTER
[fr] Mots utiles
• der Restmüll — les ordures ménagères non triées
• der Bioabfall — les biodéchets
• die Biotonne — la poubelle à biodéchets
• die Verpackung — l’emballage` },
      placements: [{ media: 'b1-umwelt-atelier-mediation-grafik', caption: 'Restmüll im Nordring' }],
      questions: [
        choice('q1', bi('Was zeigt die Grafik?', 'Que montre le graphique ?'), [
          ['Wie viel Müll jede Familie pro Jahr produziert.'],
          ['Woraus der Restmüll im Viertel besteht.', true],
          ['Wie sich der Müll seit zehn Jahren verändert hat.'],
        ], 'Le titre le dit : « Was landet im Nordring im Restmüll? ». Les barres donnent la composition des ordures ménagères en pourcentages, pas des quantités par famille ni une évolution dans le temps.'),
        choice('q2', bi('Welcher Satz beschreibt die Grafik richtig?', 'Quelle phrase décrit correctement le graphique ?'), [
          ['Glas ist der größte Teil des Restmülls.'],
          ['Verpackungen aus Plastik machen mehr als die Hälfte des Mülls aus.'],
          ['Fast vierzig Prozent des Restmülls sind Bioabfall.', true],
        ], 'Les biodéchets représentent 39 %, donc presque 40 %. Le verre n’en fait que 6 %, et les emballages 15 %, bien moins que la moitié.'),
        choice('q3', bi('Was ist für Frau Kovač am wichtigsten?', 'Qu’est-ce qui compte le plus pour Mme Kovač ?'), [
          ['Sie kann ihre Essensreste in die Biotonne werfen.', true],
          ['Die Kontrolle der Bürgerinitiative hat eine ganze Woche gedauert.'],
          ['Glas macht nur sechs Prozent aus.'],
        ], 'Mme Kovač veut savoir ce qu’elle peut faire. Le plus gros poste est celui des biodéchets : les mettre dans la Biotonne allège le plus la poubelle. La durée du contrôle est un détail qui ne l’aide pas.'),
        fill('q4', bi('Ergänzen Sie die Erklärung für Frau Kovač.', 'Complétez l’explication pour Mme Kovač.'),
          'Die Grafik zeigt, was bei uns im [[1]] landet. Der größte Teil ist Bioabfall: fast [[2]] Prozent. Nur etwas mehr als ein [[3]] ist wirklich Restmüll. Je besser wir den Müll trennen, [[4]] weniger landet in der Restmülltonne.',
          [['Restmüll'], ['40', 'vierzig'], ['Viertel'], ['desto', 'umso']],
          'Le thème d’abord (der Restmüll), puis le chiffre clé (39 %, presque 40), puis une comparaison simple : 28 %, c’est un peu plus d’un quart (ein Viertel). « je … desto » (ou « umso ») relie l’effort et son effet.'),
        order('q5', bi('Bilden Sie einen einfachen Satz für Frau Kovač.', 'Formez une phrase simple pour Mme Kovač.'), [
          ['Wenn', 'Sie', 'den Bioabfall', 'trennen,', 'sparen', 'Sie', 'Platz', 'in der Restmülltonne.'],
        ], 'Une phrase courte et concrète, au vouvoiement : la subordonnée en « wenn » se termine par « trennen », puis la principale commence par le verbe « sparen » suivi du sujet « Sie ».'),
      ] },

    { id: 'b1-umwelt-atelier-korrektur', kind: 'exercise', title: 'Corriger : les erreurs typiques des francophones', estimatedMinutes: 10,
      competences: ['lecture', 'expression-ecrite'],
      lesson: { description: bi('Diese Sätze schreiben französischsprachige Lernende oft falsch. Finden Sie die richtige Form.', 'Les francophones se trompent souvent dans ces phrases. Trouvez la forme correcte.') },
      questions: [
        choice('q1', bi('Welcher Satz ist richtig?', 'Quelle phrase est correcte ?'), [
          ['Wenn ich würde mehr Geld haben, ich würde ein Lastenrad kaufen.'],
          ['Wenn ich mehr Geld hätte, ich würde ein Lastenrad kaufen.'],
          ['Wenn ich mehr Geld hätte, würde ich ein Lastenrad kaufen.', true],
        ], 'Deux pièges : « wenn ich würde haben » (on dit « hätte ») et l’ordre « ich würde » après la virgule. La subordonnée occupe la première place : la principale commence donc par le verbe, « würde ich ».'),
        fill('q2', bi('Ergänzen Sie das fehlende Wort.', 'Complétez le mot qui manque.'),
          'Für die Kinder ist der Radweg wichtiger [[1]] der Leihladen.',
          [['als']],
          'Après un comparatif, « que » se dit « als » : wichtiger als. « wie » sert à l’égalité : so wichtig wie. « dass » est une conjonction de subordination, sans rapport avec la comparaison.'),
        fill('q3', bi('Ergänzen Sie den Komparativ von „gut“ mit der richtigen Endung.', 'Complétez avec le comparatif de « gut » et la bonne terminaison.'),
          'Dieses Jahr brauchen wir eine [[1]] Lösung als letztes Jahr.',
          [['bessere']],
          'gut → besser (irrégulier), puis -e après « eine » (féminin, accusatif). Placé devant un nom, le comparatif prend toujours une terminaison : « eine besser Lösung » est faux, et le calque du français « plus bonne » (« mehr gute ») n’existe pas.'),
        order('q4', C.ordnen, [
          ['Je', 'mehr', 'wir', 'recyceln,', 'desto', 'weniger', 'Müll', 'verbrennen', 'wir.'],
        ], 'La partie en « je » est une subordonnée : le verbe « recyceln » va à la fin. La partie en « desto » est une principale : « desto weniger Müll » occupe la première place, puis viennent le verbe « verbrennen » et le sujet « wir ». Erreur fréquente : garder l’ordre du français (« desto wir verbrennen … »).'),
        fill('q5', bi('Ergänzen Sie die Form von „viel“.', 'Complétez avec la forme de « viel ».'),
          'Heute gibt es in unserer Stadt [[1]] Radwege als vor zehn Jahren.',
          [['mehr']],
          '« viel » → « mehr », toujours invariable : mehr Radwege, mehr Zeit. « mehrere » signifie « plusieurs » et ne s’emploie pas pour comparer.'),
        choice('q6', bi('Welcher Satz ist richtig?', 'Quelle phrase est correcte ?'), [
          ['Der Bus fährt selten, deshalb ich nehme das Auto.'],
          ['Der Bus fährt selten, deshalb nehme ich das Auto.', true],
          ['Der Bus fährt selten, deshalb ich das Auto nehme.'],
        ], '« deshalb » est un adverbe qui occupe la première place de la proposition : le verbe suit immédiatement (« nehme »), puis le sujet. Ce n’est pas une conjonction de subordination : le verbe ne va pas à la fin.'),
        choice('q7', bi('Sie schreiben an den Stadtteilrat. Welche Anrede passt?', 'Vous écrivez au conseil de quartier. Quelle formule d’appel convient ?'), [
          ['Hallo liebe Leute vom Stadtteilrat,'],
          ['Sehr geehrte Damen und Herren,', true],
          ['Liebe Stadtteilrat,'],
        ], 'Pour un courrier formel à une institution dont on ne connaît pas les membres : « Sehr geehrte Damen und Herren, ». « Hallo liebe Leute vom Stadtteilrat » est familier, et « Liebe Stadtteilrat » est faux (der Rat : « Lieber Stadtteilrat ») et trop familier.'),
      ] },

    { id: 'b1-umwelt-atelier-pruefung', kind: 'exercise', title: 'Entraînement à l’examen : présenter un thème (Sprechen)', estimatedMinutes: 20,
      competences: ['lecture', 'expression-orale'],
      lesson: { description: `PRÜFUNGSTRAINING SPRECHEN · EIN THEMA PRÄSENTIEREN
[fr] Entraînement à l’examen, oral : présenter un thème

${bi('In dieser Aufgabe präsentieren Sie allein ein Thema, etwa drei Minuten lang.', 'Dans cette épreuve, vous présentez seul un thème pendant environ trois minutes.')}
${bi('Ihre Präsentation hat fünf Teile. Die Folie zeigt sie.', 'Votre présentation comporte cinq parties, indiquées sur le support.')}

ZEIT
[fr] Temps
Vorbereitung: etwa 10 Minuten. Präsentation: etwa 3 Minuten, also 30 bis 40 Sekunden pro Teil. [fr] Préparation : environ 10 minutes. Exposé : environ 3 minutes, soit 30 à 40 secondes par partie.

STRATEGIE
[fr] Stratégie
Überlegen Sie sich zu jedem Teil nur zwei oder drei Stichwörter, keine ganzen Sätze. [fr] Pour chaque partie, prévoyez seulement deux ou trois mots-clés, pas de phrases complètes.
Nennen Sie am Anfang den Aufbau Ihrer Präsentation. [fr] Annoncez au début le plan de votre exposé.
Sprechen Sie frei und langsam genug. [fr] Parlez librement et assez lentement.

${bi('Lösen Sie jetzt die Aufgaben zum Thema „Autofreie Innenstadt?“.', 'Faites maintenant les exercices sur le thème « Un centre-ville sans voitures ? ».')}` },
      placements: [{ media: 'b1-umwelt-atelier-pruefung-folie', caption: 'Folie: Autofreie Innenstadt?' }],
      questions: [
        order('q1', bi('Bringen Sie die Teile der Präsentation in die richtige Reihenfolge.', 'Remettez les parties de l’exposé dans l’ordre.'), [
          ['Mein Thema heute: Brauchen wir eine autofreie Innenstadt?',
            'Ich selbst fahre seit Jahren mit dem Rad ins Zentrum.',
            'In meinem Heimatland gibt es nur wenige Fußgängerzonen.',
            'Dafür spricht die saubere Luft, dagegen der lange Weg für ältere Menschen.',
            'Zum Schluss: Ich wäre für einen Versuch von einem Jahr. Danke!'],
        ], 'L’ordre suit le support : thème, expérience personnelle (« Ich selbst … »), pays d’origine (« In meinem Heimatland … »), pour et contre (« Dafür spricht …, dagegen … »), conclusion (« Zum Schluss … »).'),
        choice('q2', bi('Mit welchem Satz beginnen Sie die Präsentation am besten?', 'Par quelle phrase commencez-vous le mieux l’exposé ?'), [
          ['Also, Autos sind schlecht für die Stadt, das ist klar.'],
          ['Ich möchte heute über das Thema „autofreie Innenstadt“ sprechen.', true],
          ['Zum Schluss möchte ich mich für Ihre Aufmerksamkeit bedanken.'],
        ], 'On commence en annonçant le thème : « Ich möchte heute über … sprechen ». La première phrase donne un avis sans présenter le sujet, la troisième sert à conclure.'),
        choice('q3', bi('Teil 3: Welcher Satz beschreibt die Situation im Heimatland?', 'Partie 3 : quelle phrase décrit la situation dans votre pays ?'), [
          ['Bei uns fahren mehr Menschen mit dem Auto ins Zentrum als hier.', true],
          ['Ich finde das Thema sehr interessant und auch wichtig.'],
          ['Vielen Dank, dass Sie mir alle so lange und aufmerksam zugehört haben.'],
        ], '« Bei uns … als hier » compare votre pays et l’Allemagne, ce qu’attend la partie 3. Les deux autres phrases sont des formules d’introduction et de conclusion.'),
        choice('q4', bi('Teil 4: Welcher Satz nennt einen Nachteil?', 'Partie 4 : quelle phrase cite un inconvénient ?'), [
          ['Dafür spricht, dass die Luft sauberer wäre.'],
          ['In meinem Heimatland gibt es in fast jeder Stadt viele Fußgängerzonen.'],
          ['Ein Nachteil wäre, dass manche Geschäfte weniger Kunden hätten.', true],
        ], '« Ein Nachteil wäre, dass … » annonce un inconvénient, au Konjunktiv II puisque la ville sans voitures est imaginée. « Dafür spricht » introduit un avantage.'),
        choice('q5', bi('Teil 4: Wie sagen Sie Ihre Meinung?', 'Partie 4 : comment donnez-vous votre avis ?'), [
          ['Meiner Meinung nach überwiegen die Vorteile, weil es ruhiger wäre.', true],
          ['Viele Leute in meiner Straße sagen, dass Autos zu laut sind.'],
          ['Ich habe selbst ein Auto und auch ein Fahrrad im Keller.'],
        ], '« Meiner Meinung nach … , weil … » donne un avis personnel et le justifie. Rapporter l’avis des autres ou décrire sa situation ne suffit pas pour la partie 4.'),
        choice('q6', bi('Was ist ein guter Schluss?', 'Quelle est une bonne conclusion ?'), [
          ['Zusammengefasst: Ich bin für einen Versuch. Vielen Dank fürs Zuhören!', true],
          ['Das war’s eigentlich schon. Tschüss und bis zum nächsten Mal!'],
          ['Jetzt erzähle ich Ihnen noch kurz von meiner eigenen Erfahrung.'],
        ], 'Une bonne conclusion résume la position (« Zusammengefasst … ») et remercie. « Das war’s … Tschüss » est trop familier, et la troisième phrase ouvre une partie au lieu de conclure.'),
        speak('q7', 'Ich möchte heute über ein wichtiges Thema sprechen.',
          'Première phrase d’un exposé. « über » + accusatif ; l’infinitif « sprechen » termine la phrase.'),
        speakLong('q8', 'Zum Schluss möchte ich sagen, dass ich für einen Versuch bin.',
          'Conclusion : après « dass », le verbe « bin » va à la fin. Marquez une petite pause après « sagen ».'),
      ] },

    { id: 'b1-umwelt-atelier-schreiben', kind: 'mission', title: 'Mission : proposer un projet au conseil de quartier', estimatedMinutes: 25,
      competences: ['expression-ecrite'],
      lesson: { description: `DIE SITUATION
[fr] La situation
Der Stadtteilrat Nordring sammelt Ideen für das nächste Jahr. Er hat wieder 8000 Euro für ein Umweltprojekt. Jede Bewohnerin und jeder Bewohner kann einen Vorschlag schicken. [fr] Le conseil de quartier du Nordring recueille des idées pour l’an prochain. Il dispose de nouveau de 8 000 euros pour un projet écologique. Chaque habitant peut envoyer une proposition.

IDEEN
[fr] Idées
• ein Gemeinschaftsgarten — un jardin partagé
• ein Reparaturtreff — un atelier de réparation entre voisins
• ein Trinkbrunnen auf dem Marktplatz — une fontaine d’eau potable sur la place du marché
• Lastenräder zum Ausleihen — des vélos cargos à emprunter
• Ihre eigene Idee — votre propre idée

REDEMITTEL
[fr] Formules utiles
• Sehr geehrte Damen und Herren, ich wohne seit … im Nordring und möchte Ihnen ein Projekt vorschlagen.
• Mein Vorschlag ist … / Ich schlage vor, dass …
• Ein großer Vorteil wäre, dass … / Außerdem …
• Natürlich gibt es auch einen Nachteil: … Aber …
• Wenn wir …, könnten wir … / Je mehr …, desto …
• Als ersten Schritt könnten wir …
• Ich würde mich über eine Antwort freuen. Mit freundlichen Grüßen

${bi('Planen Sie 5 Minuten, schreiben Sie 15 Minuten und lesen Sie Ihren Text dann 5 Minuten lang noch einmal.', 'Prévoyez 5 minutes de plan, 15 minutes de rédaction et 5 minutes de relecture.')}` },
      mission: {
        oral: null,
        written: {
          prompt: lines(
            bi('Schreiben Sie eine E-Mail an den Stadtteilrat (120 bis 150 Wörter).', 'Écrivez un courriel au conseil de quartier (120 à 150 mots).'),
            bi('Stellen Sie sich kurz vor und sagen Sie, warum Sie schreiben.', 'Présentez-vous brièvement et dites pourquoi vous écrivez.'),
            bi('Beschreiben Sie Ihr Projekt: Was? Wo? Für wen?', 'Décrivez votre projet : quoi ? où ? pour qui ?'),
            bi('Nennen Sie zwei Vorteile und einen möglichen Nachteil.', 'Citez deux avantages et un inconvénient possible.'),
            bi('Schlagen Sie einen ersten Schritt vor.', 'Proposez une première étape concrète.'),
          ),
          maxChars: 1500, minWords: 120,
        },
        checklist: [
          bi('Ich beginne mit „Sehr geehrte Damen und Herren,“ und sieze bis zum Ende.', 'J’écris « Sehr geehrte … » et je vouvoie jusqu’au bout.'),
          bi('Ich beschreibe mein Projekt: was, wo, für wen.', 'Je décris mon projet : quoi, où, pour qui.'),
          bi('Ich nenne zwei Vorteile und einen Nachteil, mit einem Komparativ.', 'Deux avantages, un inconvénient, un comparatif.'),
          bi('Ich mache eine Hypothese: Wenn wir …, könnten wir …', 'Je fais une hypothèse au Konjunktiv II.'),
          bi('Ich schlage einen ersten Schritt vor und schließe mit „Mit freundlichen Grüßen“.', 'Je propose une première étape et je conclus poliment.'),
        ],
        criteria: grid(GRIDS.b1.schreiben, 'Tâche : projet décrit (quoi, où, pour qui), deux avantages et un inconvénient, première étape proposée, registre formel (Sie)'),
      } },

    { id: 'b1-umwelt-atelier-sprechen', kind: 'mission', title: 'Mission : présenter un thème en trois minutes', estimatedMinutes: 20,
      competences: ['expression-orale'],
      lesson: { description: `DIE SITUATION
[fr] La situation
Sie präsentieren in Ihrem Deutschkurs ein Thema. Wählen Sie eins von zwei Themen. [fr] Vous présentez un thème dans votre cours d’allemand. Choisissez l’un des deux thèmes.

THEMA A: KAUFEN ODER REPARIEREN?
[fr] Thème A : acheter ou réparer ?
• Was machen Sie, wenn etwas kaputtgeht? [fr] Que faites-vous quand un objet tombe en panne ?
• Gibt es in Ihrem Heimatland Reparaturtreffs? [fr] Existe-t-il des ateliers de réparation entre voisins dans votre pays ?

THEMA B: MIT DEM AUTO IN DIE STADT?
[fr] Thème B : aller en ville en voiture ?
• Wie kommen Sie ins Zentrum? [fr] Comment allez-vous au centre-ville ?
• Wie ist der Verkehr in Ihrem Heimatland? [fr] Comment est la circulation dans votre pays ?

DIE FÜNF TEILE
[fr] Les cinq parties
• Thema vorstellen [fr] Annoncer le thème et le plan
• Eigene Erfahrung [fr] Raconter une expérience personnelle
• Situation im Heimatland [fr] Décrire la situation dans votre pays
• Vor- und Nachteile, Ihre Meinung [fr] Avantages, inconvénients et avis
• Schluss und Dank [fr] Conclure et remercier

${bi('Bereiten Sie sich 10 Minuten vor: Überlegen Sie sich zu jedem Teil zwei oder drei Stichwörter. Nehmen Sie dann Ihre Präsentation auf.', 'Préparez-vous 10 minutes en prévoyant deux ou trois mots-clés par partie, puis enregistrez votre exposé.')}` },
      mission: {
        oral: {
          prompt: lines(
            bi('Präsentieren Sie Thema A oder Thema B, etwa drei Minuten lang.', 'Présentez le thème A ou le thème B pendant environ trois minutes.'),
            bi('Sprechen Sie über alle fünf Teile: Thema, Erfahrung, Heimatland, Vor- und Nachteile mit Ihrer Meinung, Schluss.', 'Traitez les cinq parties : thème, expérience, pays, avantages et inconvénients avec votre avis, conclusion.'),
            bi('Sprechen Sie frei, ohne einen Text abzulesen.', 'Parlez librement, sans lire de texte.'),
          ),
          maxSeconds: 180,
        },
        written: null,
        checklist: [
          bi('Ich nenne mein Thema und den Aufbau meiner Präsentation.', 'J’annonce mon thème et mon plan.'),
          bi('Ich erzähle eine eigene Erfahrung mit einem Beispiel.', 'Je raconte une expérience personnelle avec un exemple.'),
          bi('Ich vergleiche mit meinem Heimatland (Bei uns …, Im Vergleich zu …).', 'Je compare avec mon pays.'),
          bi('Ich nenne Vor- und Nachteile und begründe meine Meinung.', 'Je donne le pour, le contre et mon avis justifié.'),
          bi('Ich schließe mit einem Dank und spreche etwa drei Minuten.', 'Je conclus et je remercie, en trois minutes environ.'),
        ],
        criteria: grid(GRIDS.b1.sprechen, 'Tâche : les cinq parties sont présentes (thème, expérience, pays, pour et contre avec avis, conclusion), en environ 3 minutes'),
      } },

    { id: 'b1-umwelt-atelier-bilan', kind: 'lesson', title: 'Faire le point : environnement et présentation', estimatedMinutes: 6,
      competences: ['lecture'],
      lesson: { description: `FAIRE LE POINT
Relisez ces objectifs. Si l’un d’eux vous fait hésiter, refaites l’exercice indiqué.

DAS KANN ICH JETZT
[fr] Ce que je sais faire maintenant
• Ich kann Vorschläge für mein Viertel verstehen und vergleichen. [fr] Je peux comprendre et comparer des propositions pour mon quartier (module thème, « Comprendre : deux idées pour le quartier »).
• Ich kann sagen, was ich tun würde: Wenn ich …, würde ich … [fr] Je peux dire ce que je ferais (module thème, « S’entraîner »).
• Ich kann eine Grafik einfach erklären. [fr] Je peux expliquer simplement un graphique (« Médiation »).
• Ich kann ein Thema in fünf Teilen präsentieren. [fr] Je peux présenter un thème en cinq parties (« Entraînement à l’examen »).
• Ich kann einen Vorschlag schriftlich begründen. [fr] Je peux justifier une proposition par écrit (mission écrite).

MES STRATÉGIES
• Lire : d’abord le titre et le premier paragraphe, puis seulement les passages utiles.
• Exposé : deux ou trois mots-clés par partie, jamais un texte rédigé à lire.
• Graphique : le thème, puis le chiffre le plus important, puis ce que cela change pour la personne.

À REVOIR
• Le lexique des deux modules : Müll vermeiden, nachhaltig, der Verbrauch, der Anteil, die Hälfte…
• Les formules de l’exposé : Ich möchte heute über … sprechen. Dafür spricht, dass … Zum Schluss …
• En cas de doute : la leçon « Retenir » du module thème (Konjunktiv II, comparatif devant le nom, je … desto).` } },
  ],
};
