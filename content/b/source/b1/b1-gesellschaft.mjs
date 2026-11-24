// Module 21 · b1-gesellschaft (lot R4, thème 11) : s’engager dans une association.
// Grammaire : connecteurs doubles (sowohl … als auch, weder … noch, entweder … oder, nicht nur … sondern auch,
// zwar … aber) ; relatives avec was et wo, rappel des relatives avec préposition.
// Reprise réécrite du brouillon B1 V1 (partie3.mjs › b1-gesellschaft) : annonce du Sprachcafé, message de changement
// d’organisation, relatives, reformuler pour un nouveau venu.
import { C, bi, choice, fill, order, match, dictation, speak } from '../../lib.mjs';

const rf = (id, statement, answer, explanation) => choice(id, `„${statement}“ ${C.richtigFalsch}`,
  [['richtig', answer === 'r'], ['falsch', answer === 'f'], ['steht nicht im Text', answer === 'n']], explanation);

export default {
  id: 'b1-gesellschaft',
  title: 'Gesellschaft : s’engager dans une association',
  objective: 'Comprendre une annonce d’association et ses conditions, s’informer sur le bénévolat et faire une démarche simple, en reliant les idées avec des connecteurs doubles (sowohl … als auch, weder … noch) et des relatives (alles, was …).',
  grammarFocus: ['zweiteilige-konnektoren', 'relativsaetze-was-wo'],
  sources: [
    'Textes, dialogues et exercices originaux LinguaCap.',
    'Situations reprises et réécrites du brouillon B1 V1 (LinguaCap) : le Sprachcafé d’une association, un changement d’organisation.',
  ],
  vocabulary: [
    { word: 'Ehrenamt', article: 'das', plural: 'Ehrenämter', partOfSpeech: 'noun', translation: 'le bénévolat, la fonction bénévole',
      example: 'Sie hat seit drei Jahren ein Ehrenamt im Sportverein.', note: 'ein Ehrenamt übernehmen' },
    { word: 'ehrenamtlich', partOfSpeech: 'adjective', translation: 'bénévole',
      example: 'Er arbeitet ehrenamtlich in der Hausaufgabenhilfe.', note: null },
    { word: 'Verein', article: 'der', plural: 'Vereine', partOfSpeech: 'noun', translation: 'l’association, le club',
      example: 'Der Verein hilft Menschen, die neu in der Stadt sind.', note: 'e. V. = eingetragener Verein (association déclarée)' },
    { word: 'Mitglied', article: 'das', plural: 'Mitglieder', partOfSpeech: 'noun', translation: 'le membre',
      example: 'Man muss kein Mitglied sein, um zu helfen.', note: 'Mitglied werden : adhérer' },
    { word: 'Mitgliedsbeitrag', article: 'der', plural: 'Mitgliedsbeiträge', partOfSpeech: 'noun', translation: 'la cotisation',
      example: 'Der Mitgliedsbeitrag kostet 24 Euro im Jahr.', note: null },
    { word: 'sich engagieren für', partOfSpeech: 'verb', translation: 's’engager pour',
      example: 'Viele Rentner engagieren sich für Kinder und Familien.', note: '+ accusatif · prononcé « angaschieren »' },
    { word: 'freiwillig', partOfSpeech: 'adjective', translation: 'volontaire, de son plein gré',
      example: 'Die Mitarbeit im Verein ist freiwillig.', note: 'der/die Freiwillige : le/la bénévole' },
    { word: 'Behörde', article: 'die', plural: 'Behörden', partOfSpeech: 'noun', translation: 'l’administration, le service public',
      example: 'Marta begleitet Familien zu den Behörden.', note: null },
    { word: 'Antrag', article: 'der', plural: 'Anträge', partOfSpeech: 'noun', translation: 'la demande officielle',
      example: 'Für das Führungszeugnis muss man einen Antrag stellen.', note: 'einen Antrag stellen auf + accusatif' },
    { word: 'Bürgeramt', article: 'das', plural: 'Bürgerämter', partOfSpeech: 'noun', translation: 'le guichet municipal (mairie de quartier)',
      example: 'Das Bürgeramt ist montags bis 18 Uhr geöffnet.', note: null },
    { word: 'Führungszeugnis', article: 'das', plural: 'Führungszeugnisse', partOfSpeech: 'noun', translation: 'l’extrait de casier judiciaire',
      example: 'Für die Arbeit mit Kindern braucht man ein Führungszeugnis.', note: null },
    { word: 'Bestätigung', article: 'die', plural: 'Bestätigungen', partOfSpeech: 'noun', translation: 'l’attestation, la confirmation',
      example: 'Bringen Sie bitte die Bestätigung des Vereins mit.', note: null },
    { word: 'Voraussetzung', article: 'die', plural: 'Voraussetzungen', partOfSpeech: 'noun', translation: 'la condition (préalable)',
      example: 'Eine Ausbildung ist keine Voraussetzung.', note: null },
    { word: 'zuverlässig', partOfSpeech: 'adjective', translation: 'fiable, sérieux',
      example: 'Wir suchen zuverlässige Helferinnen und Helfer.', note: null },
    { word: 'beitreten', partOfSpeech: 'verb', translation: 'adhérer à, entrer dans',
      example: 'Ich bin dem Verein letztes Jahr beigetreten.', note: '+ datif · séparable : bei|treten · Perfekt : ist beigetreten' },
    { word: 'teilnehmen an', partOfSpeech: 'verb', translation: 'participer à',
      example: 'Alle können am Sprachcafé teilnehmen.', note: '+ datif · séparable : teil|nehmen' },
    { word: 'Hausaufgabenhilfe', article: 'die', plural: null, partOfSpeech: 'noun', translation: 'l’aide aux devoirs',
      example: 'Die Hausaufgabenhilfe findet montags statt.', note: null },
    { word: 'begleiten', partOfSpeech: 'verb', translation: 'accompagner',
      example: 'Sie begleitet eine Familie zum Bürgeramt.', note: null },
    { word: 'Bescheid geben', partOfSpeech: 'expression', translation: 'prévenir, tenir au courant',
      example: 'Gib mir bitte Bescheid, wenn du später kommst.', note: 'jemandem Bescheid geben (+ datif)' },
    { word: 'einspringen', partOfSpeech: 'verb', translation: 'remplacer quelqu’un au pied levé',
      example: 'Kannst du am Mittwoch für Lena einspringen?', note: 'séparable : ein|springen · Perfekt : ist eingesprungen' },
    { word: 'sowohl … als auch', partOfSpeech: 'conjunction', translation: 'aussi bien … que, et … et',
      example: 'Wir suchen sowohl Studierende als auch Rentner.', note: null },
    { word: 'weder … noch', partOfSpeech: 'conjunction', translation: 'ni … ni',
      example: 'Sie müssen weder Mitglied sein noch etwas bezahlen.', note: 'déjà négatif : sans nicht ni kein' },
    { word: 'entweder … oder', partOfSpeech: 'conjunction', translation: 'soit … soit, ou bien … ou bien',
      example: 'Sie können entweder mittwochs oder samstags helfen.', note: null },
    { word: 'nicht nur …, sondern auch', partOfSpeech: 'conjunction', translation: 'non seulement …, mais aussi',
      example: 'Das hilft nicht nur den Gästen, sondern auch den Helfern.', note: 'virgule avant sondern' },
  ],
  media: [
    { key: 'b1-gesellschaft-lesen-steckbrief', kind: 'image', title: 'Fiche de l’association Türklinke',
      alt: 'Fiche « Türklinke e. V. – Nachbarn helfen Nachbarn » : Sprachcafé un mercredi sur deux à la bibliothèque, aide aux devoirs lundi et jeudi, accompagnement aux administrations sur rendez-vous, soirée d’information le 3 mars à 18 h.',
      image: { layout: 'document', icon: 'hand-heart', title: 'Türklinke e. V.', subtitle: 'Nachbarn helfen Nachbarn',
        rows: [
          ['Sprachcafé', 'jeden zweiten Mittwoch, Stadtbibliothek'],
          ['Hausaufgabenhilfe', 'montags und donnerstags, Klassen 3 bis 6'],
          ['Behördenlotsen', 'nach Termin'],
          ['Infoabend', '3. März, 18 Uhr, Stadtbibliothek, Raum 2'],
        ] } },
    { key: 'b1-gesellschaft-hoeren-anruf', kind: 'audio', title: 'Appel de Nadine avant le Sprachcafé',
      script: [
        { voice: 'frau', name: 'Nadine', text: 'Hallo Samir, hier ist Nadine von Türklinke. Hast du kurz Zeit? Es geht um das Sprachcafé am Mittwoch. Es gibt leider ein paar Änderungen.' },
        { pause: 0.4 },
        { voice: 'mann2', name: 'Samir', text: 'Hallo Nadine! Ja, klar. Was ist los?' },
        { pause: 0.4 },
        { voice: 'frau', name: 'Nadine', text: 'Die Bibliothek hat am Mittwoch bis halb sechs eine Lesung in unserem Raum. Wir können deshalb erst um Viertel vor sechs rein. Das Café beginnt aber trotzdem um sechs.' },
        { pause: 0.4 },
        { voice: 'mann2', name: 'Samir', text: 'Okay, das ist knapp. Und wo bekomme ich den Schlüssel?' },
        { pause: 0.4 },
        { voice: 'frau', name: 'Nadine', text: 'An der Information im Erdgeschoss. Dort liegen auch die Namensschilder, die wir für die Gäste brauchen. Kannst du sie mitnehmen?' },
        { pause: 0.4 },
        { voice: 'mann2', name: 'Samir', text: 'Mache ich. Soll ich auch Getränke kaufen?' },
        { pause: 0.4 },
        { voice: 'frau', name: 'Nadine', text: 'Nein, danke, Getränke haben wir genug. Aber es gibt noch etwas: Der Hof ist gesperrt, weil dort gebaut wird. Man kann also weder durch den Hof gehen noch den Aufzug hinten benutzen. Alle müssen den Eingang in der Lindenstraße nehmen.' },
        { pause: 0.4 },
        { voice: 'mann2', name: 'Samir', text: 'Gibt es dort auch einen Aufzug? Eine Frau aus meinem Deutschkurs sitzt im Rollstuhl, und sie möchte gern kommen.' },
        { pause: 0.4 },
        { voice: 'frau', name: 'Nadine', text: 'Ja, gleich rechts neben dem Eingang. Sag ihr das bitte. Und noch etwas: Lena, die normalerweise die Gäste begrüßt, kommt erst um zwanzig nach sechs, weil sie länger arbeiten muss. Könntest du am Anfang an der Tür stehen?' },
        { pause: 0.4 },
        { voice: 'mann2', name: 'Samir', text: 'Gern. Und was mache ich, wenn die Gäste da sind? Ich war ja noch nie dabei.' },
        { pause: 0.4 },
        { voice: 'frau', name: 'Nadine', text: 'Keine Sorge. Wir haben Karten mit Themen, zum Beispiel Arbeit, Wohnen oder Freizeit. Du kannst entweder eine kleine Gruppe übernehmen oder mit einzelnen Gästen sprechen. Wichtig ist nur, dass alle zu Wort kommen.' },
        { pause: 0.4 },
        { voice: 'mann2', name: 'Samir', text: 'Verstanden. Und was sage ich, wenn jemand fragt, ob man sich anmelden muss?' },
        { pause: 0.4 },
        { voice: 'frau', name: 'Nadine', text: 'Das ist ja das Gute: Man muss sich weder anmelden noch etwas bezahlen. Die Leute können einfach kommen. Diesmal kommen übrigens sowohl neue Gäste als auch zwei neue Helferinnen. Darüber freue ich mich sehr.' },
        { pause: 0.4 },
        { voice: 'mann2', name: 'Samir', text: 'Super. Und wann ist Schluss?' },
        { pause: 0.4 },
        { voice: 'frau', name: 'Nadine', text: 'Um halb acht. Aber um sieben sammeln wir Ideen für das nächste Treffen. Das ist der Teil, der mir am wichtigsten ist. Wenn du früher gehen musst, gib mir einfach Bescheid.' },
        { pause: 0.4 },
        { voice: 'mann2', name: 'Samir', text: 'Nein, ich bleibe bis zum Schluss. Dann bis Mittwoch!' },
        { pause: 0.3 },
        { voice: 'frau', name: 'Nadine', text: 'Danke, Samir. Bis Mittwoch!' },
      ] },
    { key: 'b1-gesellschaft-kontrolle-nachricht', kind: 'audio', title: 'Message vocal de l’association',
      script: [
        { voice: 'frau', name: 'Nadine', text: 'Guten Tag, Frau Diallo, hier ist Nadine Haas vom Verein Türklinke. Vielen Dank für Ihre E-Mail! Sie können sowohl im Sprachcafé als auch bei der Hausaufgabenhilfe mitmachen. Für die Hausaufgabenhilfe brauchen wir aber ein Führungszeugnis.' },
        { pause: 0.4 },
        { voice: 'frau', name: 'Nadine', text: 'Das beantragen Sie im Bürgeramt. Für Ehrenamtliche ist es kostenlos, wenn Sie unsere Bestätigung mitbringen. Ich schicke sie Ihnen heute noch per E-Mail. Bis bald!' },
      ] },
  ],
  activities: [
    { id: 'b1-gesellschaft-einstieg', kind: 'lesson', title: 'Mise en route : s’engager pour les autres', estimatedMinutes: 10,
      competences: ['lecture', 'expression-orale'],
      lesson: { description: `GEMEINSAM STATT EINSAM
[fr] Ensemble plutôt que seul

In Deutschland engagieren sich viele Menschen ehrenamtlich: im Sportverein, in der Schule, bei der Feuerwehr oder in der Nachbarschaft. [fr] En Allemagne, beaucoup de gens s’engagent bénévolement : au club de sport, à l’école, chez les pompiers volontaires ou dans le voisinage.

FRAGEN ZUM EINSTIEG
[fr] Questions pour commencer
• Sind Sie Mitglied in einem Verein oder in einer Gruppe? [fr] Êtes-vous membre d’une association ou d’un groupe ?
• Wem würden Sie gern helfen: Kindern, älteren Menschen, Tieren? [fr] Qui aimeriez-vous aider : des enfants, des personnes âgées, des animaux ?
• Wie viel Zeit hätten Sie pro Woche für ein Ehrenamt? [fr] Combien de temps auriez-vous par semaine pour du bénévolat ?

Antworten Sie laut und in ganzen Sätzen. [fr] Répondez à voix haute, par des phrases complètes.

DAS LERNEN SIE
[fr] Objectifs
• Ich kann die Anzeige eines Vereins und ihre Bedingungen verstehen. [fr] Je peux comprendre l’annonce d’une association et ses conditions.
• Ich kann mich über ein Ehrenamt informieren. [fr] Je peux m’informer sur une activité bénévole.
• Ich kann eine einfache Sache bei einer Behörde erledigen. [fr] Je peux faire une démarche simple dans une administration.
• Ich kann Ideen verbinden: sowohl … als auch, weder … noch. [fr] Je peux relier des idées : et … et, ni … ni.

WICHTIGE WÖRTER
[fr] Mots-clés
• das Ehrenamt — le bénévolat
• der Verein — l’association
• das Mitglied — le membre
• der Mitgliedsbeitrag — la cotisation
• sich engagieren für — s’engager pour
• freiwillig — volontaire
• die Behörde — l’administration
• der Antrag — la demande officielle` } },

    { id: 'b1-gesellschaft-lesen', kind: 'exercise', title: 'Comprendre : l’annonce d’une association', estimatedMinutes: 20,
      competences: ['lecture'],
      lesson: { description: `${C.lesen}

STRATEGIE
[fr] Stratégie
Lesen Sie zuerst die Überschrift und den ersten Absatz: Wer schreibt? Für wen? [fr] Lisez d’abord le titre et le premier paragraphe : qui écrit ? pour qui ?
Suchen Sie bei Bedingungen kleine Wörter wie „müssen“, „brauchen“, „nur“ oder „kein“. [fr] Pour repérer les conditions, cherchez les petits mots comme « müssen », « brauchen », « nur » ou « kein ».

Mitmachen bei Türklinke e. V. – Nachbarn helfen Nachbarn

(1) Türklinke ist ein Verein im Westviertel. Seit 2015 helfen wir Menschen, die neu in der Stadt sind. Unsere Mitglieder sind sowohl Studierende als auch Berufstätige und Rentner. Wir sind weder eine Partei noch eine religiöse Gruppe: Bei uns ist jeder willkommen.

(2) Jeden zweiten Mittwoch findet in der Stadtbibliothek unser Sprachcafé statt. Dort sprechen Gäste und Helfer eine Stunde lang Deutsch, ohne Druck und ohne Noten. Außerdem gibt es montags und donnerstags eine Hausaufgabenhilfe für Kinder der Klassen 3 bis 6. Wer Fragen zu Formularen hat, kann einen Termin bei unseren Behördenlotsen bekommen: Sie erklären Briefe und begleiten Menschen zu den Ämtern.

(3) Wir suchen Freiwillige, die regelmäßig Zeit haben, zum Beispiel einmal pro Woche oder zweimal im Monat. Sie brauchen keine pädagogische Ausbildung. Wichtig ist nur, dass Sie zuverlässig sind und gern mit Menschen arbeiten. Sie können entweder im Sprachcafé oder bei der Hausaufgabenhilfe anfangen.

(4) Als Helferin oder Helfer müssen Sie weder Mitglied sein noch einen Beitrag zahlen. Wer den Verein unterstützen möchte, kann aber gern Mitglied werden: Der Beitrag kostet 24 Euro im Jahr, für Studierende und Menschen ohne Einkommen 12 Euro. Mitglieder dürfen auf der Jahresversammlung mitbestimmen, was der Verein im nächsten Jahr plant.

(5) Für die Arbeit mit Kindern brauchen Sie ein erweitertes Führungszeugnis. Sie beantragen es im Bürgeramt. Für Ehrenamtliche ist es kostenlos, wenn Sie eine Bestätigung des Vereins mitbringen. Während Ihres Einsatzes sind Sie über den Verein versichert, und Fahrtkosten zahlen wir Ihnen zurück.

Interesse? Dann kommen Sie zu unserem Infoabend am 3. März um 18 Uhr in die Stadtbibliothek, Raum 2. Wir freuen uns auf Sie!` },
      placements: [{ media: 'b1-gesellschaft-lesen-steckbrief', caption: 'Türklinke e. V. auf einen Blick' }],
      questions: [
        choice('q1', bi('Was für ein Text ist das?', 'De quel type de texte s’agit-il ?'), [
          ['Ein Zeitungsartikel über eine neue Partei.'],
          ['Eine Anzeige, mit der ein Verein Helfer sucht.', true],
          ['Ein Formular für einen Antrag im Bürgeramt.'],
        ], 'Le titre « Mitmachen bei Türklinke » et le paragraphe 3 (« Wir suchen Freiwillige … ») montrent qu’il s’agit d’une annonce pour recruter des bénévoles. Le texte précise même que l’association n’est pas un parti (« weder eine Partei … »).'),
        choice('q2', bi('Für wen ist der Text vor allem geschrieben?', 'À qui le texte s’adresse-t-il surtout ?'), [
          ['Für Kinder, die Hilfe bei den Hausaufgaben brauchen.'],
          ['Für Mitarbeiter des Bürgeramts.'],
          ['Für Menschen, die ehrenamtlich helfen möchten.', true],
        ], 'Le texte s’adresse à de futurs bénévoles : il dit ce qu’ils peuvent faire, ce qu’il leur faut et les invite à la soirée d’information. Les enfants profitent de l’aide aux devoirs, mais ils ne sont pas les lecteurs visés.'),
        rf('q3', 'Für die Hausaufgabenhilfe braucht man eine pädagogische Ausbildung.', 'f',
          'Faux : « Sie brauchen keine pädagogische Ausbildung » (paragraphe 3). Il faut seulement être fiable et aimer travailler avec les gens, plus un extrait de casier judiciaire pour travailler avec des enfants.'),
        rf('q4', 'Mitglieder können mitentscheiden, was der Verein plant.', 'r',
          'Vrai : « Mitglieder dürfen auf der Jahresversammlung mitbestimmen, was der Verein … plant » (paragraphe 4). « mitbestimmen » et « mitentscheiden » ont le même sens.'),
        rf('q5', 'Der Verein bekommt Geld von der Stadt.', 'n',
          'Non mentionné : le texte parle des cotisations des membres et du remboursement des frais de transport, mais jamais d’une subvention de la ville.'),
        choice('q6', bi('Was muss man für die Arbeit mit Kindern tun?', 'Que faut-il faire pour travailler avec des enfants ?'), [
          ['Ein Führungszeugnis im Bürgeramt beantragen.', true],
          ['Einen Beitrag von 24 Euro im Jahr an den Verein zahlen.'],
          ['Mitglied im Verein werden.'],
        ], 'Paragraphe 5 : « Für die Arbeit mit Kindern brauchen Sie ein erweitertes Führungszeugnis. Sie beantragen es im Bürgeramt. » La cotisation et l’adhésion sont facultatives pour les bénévoles (paragraphe 4).'),
        match('q7', bi('Welche Überschrift passt zu welchem Absatz?', 'Quel intertitre va avec quel paragraphe ?'), [
          ['Absatz 1', 'Wer wir sind'],
          ['Absatz 2', 'Unsere Angebote'],
          ['Absatz 3', 'Wen wir suchen'],
          ['Absatz 4', 'Mitglied werden: muss das sein?'],
          ['Absatz 5', 'Gut zu wissen'],
        ], 'Repérez l’idée de chaque paragraphe : présentation de l’association (1), Sprachcafé, aide aux devoirs et accompagnement (2), profil des bénévoles (3), adhésion et cotisation (4), démarches pratiques, assurance et frais (5).'),
        fill('q8', bi('Ergänzen Sie mit Wörtern aus dem Text.', 'Complétez avec des mots du texte.'),
          '„Sie erklären Briefe und begleiten Menschen zu den Ämtern“ (Absatz 2): „Sie“ sind die [[1]]. Für Ehrenamtliche ist das Führungszeugnis [[2]].',
          [['Behördenlotsen'], ['kostenlos', 'gratis', 'umsonst']],
          '« Sie » reprend le dernier nom au pluriel de la phrase précédente : « unseren Behördenlotsen » (les guides pour les démarches administratives). L’extrait de casier est « kostenlos » (gratuit) pour les bénévoles qui apportent l’attestation de l’association.'),
      ] },

    { id: 'b1-gesellschaft-hoeren', kind: 'exercise', title: 'Comprendre : un changement d’organisation', estimatedMinutes: 18,
      competences: ['ecoute'],
      lesson: { description: `${C.hoeren}

STRATEGIE
[fr] Stratégie
Beim ersten Hören: Was ändert sich? Achten Sie nur auf das Wichtigste. [fr] Première écoute : qu’est-ce qui change ? Retenez seulement l’essentiel.
Beim zweiten Hören: Achten Sie auf Uhrzeiten und Orte. [fr] Deuxième écoute : soyez attentif aux heures et aux lieux.

DIE SITUATION
[fr] La situation
Nadine organisiert das Sprachcafé des Vereins Türklinke. Sie ruft Samir an, einen neuen Helfer. [fr] Nadine organise le Sprachcafé de l’association Türklinke. Elle appelle Samir, un nouveau bénévole.` },
      placements: [{ media: 'b1-gesellschaft-hoeren-anruf', transcriptVisibility: 'after_answer' }],
      questions: [
        fill('q1', C.notizen,
          'Raum frei: ab Viertel vor [[1]] · Schlüssel und [[2]]: an der Information · Eingang: [[3]] · Ideen sammeln: um [[4]] Uhr',
          [['sechs', '6'], ['Namensschilder', 'die Namensschilder'], ['Lindenstraße', 'in der Lindenstraße', 'Lindenstrasse'], ['sieben', '7', '19']],
          'Nadine : « erst um Viertel vor sechs » (17 h 45), « die Namensschilder » sont à l’accueil avec la clé, l’entrée se fait « in der Lindenstraße » car la cour est fermée, et « um sieben sammeln wir Ideen ».'),
        choice('q2', bi('Warum kann man nicht durch den Hof gehen?', 'Pourquoi ne peut-on pas passer par la cour ?'), [
          ['Weil dort eine Lesung stattfindet.'],
          ['Weil der Aufzug kaputt ist.'],
          ['Weil dort gebaut wird.', true],
        ], '« Der Hof ist gesperrt, weil dort gebaut wird » : il y a des travaux. La lecture a lieu dans la salle (jusqu’à 17 h 30), et l’ascenseur de derrière est seulement inaccessible.'),
        choice('q3', bi('Was soll Samir am Anfang machen?', 'Que doit faire Samir au début ?'), [
          ['An der Tür stehen und die Gäste begrüßen.', true],
          ['Vorher Getränke für alle Gäste kaufen.'],
          ['Lena nach der Arbeit mit dem Auto abholen.'],
        ], 'Lena, qui accueille d’habitude les invités, arrive à 18 h 20. Nadine demande donc : « Könntest du am Anfang an der Tür stehen? ». Les boissons, il y en a déjà assez.'),
        choice('q4', bi('Was gilt für neue Gäste?', 'Qu’est-ce qui vaut pour les nouveaux invités ?'), [
          ['Sie müssen sich vorher bei Nadine anmelden.'],
          ['Sie müssen sich weder anmelden noch etwas bezahlen.', true],
          ['Sie zahlen einen kleinen Beitrag an der Tür.'],
        ], '« Man muss sich weder anmelden noch etwas bezahlen. Die Leute können einfach kommen. » « weder … noch » exclut les deux choses à la fois.'),
        choice('q5', bi('Was erzählt Samir über eine Frau aus seinem Kurs?', 'Que dit Samir d’une femme de son cours ?'), [
          ['Sie möchte als Helferin mitmachen.'],
          ['Sie kommt später, weil sie am Mittwoch länger arbeitet.'],
          ['Sie sitzt im Rollstuhl und braucht einen Aufzug.', true],
        ], '« Eine Frau aus meinem Deutschkurs sitzt im Rollstuhl » : c’est pour elle qu’il demande s’il y a un ascenseur à l’entrée de la Lindenstraße. Nadine répond qu’il se trouve juste à droite de l’entrée.'),
        choice('q6', bi('Worüber freut sich Nadine besonders?', 'De quoi Nadine se réjouit-elle particulièrement ?'), [
          ['Es kommen sowohl neue Gäste als auch neue Helferinnen.', true],
          ['Die Bibliothek gibt dem Verein einen größeren Raum.'],
          ['Samir bringt Getränke mit.'],
        ], '« Diesmal kommen übrigens sowohl neue Gäste als auch zwei neue Helferinnen. Darüber freue ich mich sehr. » « darüber » reprend toute l’information qui précède.'),
      ] },

    { id: 'b1-gesellschaft-entdecken', kind: 'exercise', title: 'Découvrir : relier deux idées, préciser avec was et wo', estimatedMinutes: 10,
      competences: ['lecture'],
      lesson: { description: `${bi('Lesen Sie die Sätze aus der Anzeige und aus dem Telefongespräch. Beantworten Sie dann die Fragen.', 'Lisez les phrases tirées de l’annonce et de l’appel, puis répondez aux questions.')}

Satz 1: Unsere Mitglieder sind sowohl Studierende als auch Berufstätige.
Satz 2: Sie müssen weder Mitglied sein noch einen Beitrag zahlen.
Satz 3: Sie können entweder im Sprachcafé oder bei der Hausaufgabenhilfe anfangen.
Satz 4: Wir sind weder eine Partei noch eine religiöse Gruppe.
Satz 5: Mitglieder dürfen mitbestimmen, was der Verein im nächsten Jahr plant.
Satz 6: Das ist der Teil, der mir am wichtigsten ist.
Satz 7: In der Bibliothek, wo das Sprachcafé stattfindet, gibt es einen Aufzug.

${bi('Achten Sie auf die Wörter, die zusammengehören, und auf die Wörter am Anfang der Nebensätze.', 'Observez les mots qui vont par deux et les mots qui ouvrent les subordonnées.')}` },
      questions: [
        match('q1', bi('Was bedeuten die Konnektoren?', 'Que signifient ces connecteurs ?'), [
          ['sowohl … als auch', 'et … et (les deux)'],
          ['weder … noch', 'ni … ni'],
          ['entweder … oder', 'soit … soit (l’un des deux)'],
          ['nicht nur …, sondern auch', 'non seulement …, mais aussi'],
        ], 'Ces connecteurs vont toujours par deux. Phrase 1 : étudiants et actifs à la fois. Phrases 2 et 4 : aucune des deux choses. Phrase 3 : l’une ou l’autre. « nicht nur …, sondern auch » ajoute un second élément en le mettant en valeur.'),
        choice('q2', bi('Sätze 2 und 4: Braucht man mit „weder … noch“ noch „nicht“ oder „kein“?', 'Phrases 2 et 4 : faut-il ajouter « nicht » ou « kein » avec « weder … noch » ?'), [
          ['Ja, nach „weder“ steht immer „kein“.'],
          ['Nein, „weder … noch“ ist schon negativ.', true],
          ['Ja, am Satzende steht „nicht“.'],
        ], '« weder … noch » contient déjà la négation, comme « ni … ni ». On dit « Sie müssen weder Mitglied sein noch … zahlen », sans « nicht » ni « kein ». Ajouter une seconde négation est une erreur fréquente.'),
        choice('q3', bi('Sätze 5 und 7: Wann benutzt man „was“ und „wo“?', 'Phrases 5 et 7 : quand emploie-t-on « was » et « wo » ?'), [
          ['„was“ nach einem Ort, „wo“ nach einer Person.'],
          ['„was“ und „wo“ ersetzen „der, die, das“ nach jedem Nomen.'],
          ['„was“ für eine Sache ohne Nomen, „wo“ nach einem Ort.', true],
        ], '« was » ouvre une subordonnée qui ne reprend pas un nom précis (« mitbestimmen, was … », « alles, was … », « das, was … »). « wo » reprend un lieu (« in der Bibliothek, wo … »). Après un nom ordinaire (« der Teil »), on garde der, die, das.'),
        choice('q4', bi('Satz 6: Warum steht hier „der“ und nicht „was“?', 'Phrase 6 : pourquoi a-t-on « der » et non « was » ici ?'), [
          ['Weil der Relativsatz das Nomen „der Teil“ beschreibt.', true],
          ['Weil nach „das ist“ im Relativsatz immer „der“ steht.'],
          ['Weil man „was“ nur in Fragen und nie im Relativsatz benutzt.'],
        ], 'Le pronom relatif reprend le nom « der Teil » (masculin, sujet de la relative) : « der Teil, der … ». « was » ne s’emploie que sans nom précis à reprendre, après alles, etwas, nichts, das ou un superlatif (« das Beste, was … »).'),
      ] },

    { id: 'b1-gesellschaft-regel', kind: 'lesson', title: 'Retenir : connecteurs doubles et relatives avec was et wo', estimatedMinutes: 10,
      competences: ['lecture'],
      lesson: { description: `À RETENIR — 1. LES CONNECTEURS DOUBLES
Ils relient deux mots, deux groupes ou deux propositions. Les deux éléments vont toujours ensemble.
• sowohl … als auch → et … et : Wir suchen sowohl Studierende als auch Rentner.
• weder … noch → ni … ni (déjà négatif) : Ich habe weder Zeit noch Geld.
• entweder … oder → soit … soit : Wir treffen uns entweder am Mittwoch oder am Samstag.
• nicht nur …, sondern auch → non seulement …, mais aussi : Das hilft nicht nur den Gästen, sondern auch den Helfern.
• zwar …, aber → certes …, mais : Die Arbeit ist zwar anstrengend, aber sie macht Spaß.

Quand ils relient deux sujets, le verbe se met au pluriel avec sowohl … als auch : Sowohl Lena als auch Samir helfen mit.
« zwar » se place après le verbe conjugué ; « aber » ouvre la seconde proposition sans changer l’ordre des mots : aber sie macht Spaß.

À RETENIR — 2. LES RELATIVES AVEC WAS ET WO
• was reprend une chose sans nom précis, après alles, etwas, nichts, vieles, das, ou un superlatif employé comme nom.
Das ist alles, was ich weiß.
Das Beste, was du tun kannst, ist mitmachen.
• wo reprend un lieu (ville, pays, bâtiment, « dort ») ; on peut aussi employer préposition + pronom relatif.
In der Bibliothek, wo das Café stattfindet, gibt es einen Aufzug.
In der Bibliothek, in der das Café stattfindet, gibt es einen Aufzug.

À RETENIR — 3. RAPPEL : RELATIVES AVEC PRÉPOSITION
La préposition vient avant le pronom relatif ; le cas dépend de la préposition, le genre du nom repris.
Der Verein, für den ich mich engagiere, sucht Helfer.
Die Kinder, mit denen ich lerne, sind in der vierten Klasse.

ATTENTION
• « ce que » se traduit par was, jamais par das : Das ist alles, was ich weiß.
• « le jour où » ne se dit pas « der Tag, wo » à l’écrit soigné, mais der Tag, an dem … ou als … : Ich erinnere mich an den Tag, an dem ich angekommen bin.
• Pas de double négation : « Ich habe weder Zeit noch Geld », jamais « weder keine Zeit ».
• Virgule obligatoire devant sondern et devant aber ; jamais de virgule devant als auch, noch ou oder dans un connecteur double qui relie deux mots.` } },

    { id: 'b1-gesellschaft-grammatik', kind: 'exercise', title: 'S’entraîner : connecteurs doubles et relatives', estimatedMinutes: 14,
      competences: ['lecture', 'expression-ecrite'],
      lesson: { description: bi('Üben Sie die Konnektoren und die Relativsätze. Lesen Sie zuerst den ganzen Satz.', 'Entraînez-vous aux connecteurs et aux relatives. Lisez d’abord toute la phrase.') },
      questions: [
        fill('q1', bi('Ergänzen Sie den Konnektor: Nur eine von zwei Möglichkeiten passt.', 'Complétez avec le connecteur « soit … soit ».'),
          'Ich kann [[1]] am Mittwoch [[2]] am Samstag helfen.',
          [['entweder'], ['oder']],
          '« entweder … oder » propose deux possibilités dont une seule sera retenue. Ici, il relie deux compléments de temps.'),
        fill('q2', bi('Ergänzen Sie den Konnektor: Beide Gruppen sind gemeint.', 'Complétez avec le connecteur « et … et ».'),
          'Wir suchen [[1]] Studierende [[2]] auch Rentnerinnen und Rentner.',
          [['sowohl'], ['als']],
          '« sowohl … als auch » : les deux groupes sont concernés. Ne confondez pas avec « als » du comparatif : ici, « als auch » forme un tout.'),
        choice('q3', bi('Welcher Satz bedeutet: Man muss kein Mitglied sein und keinen Beitrag zahlen?', 'Quelle phrase signifie : on ne doit pas être membre ni payer de cotisation ?'), [
          ['Man muss entweder Mitglied sein oder einen Beitrag zahlen.'],
          ['Man muss sowohl Mitglied sein als auch einen Beitrag zahlen.'],
          ['Man muss weder Mitglied sein noch einen Beitrag zahlen.', true],
        ], '« weder … noch » exclut les deux éléments : ni membre, ni cotisation. « entweder … oder » imposerait l’un des deux, « sowohl … als auch » les deux.'),
        order('q4', C.ordnen, [
          ['Die Arbeit', 'ist', 'zwar', 'anstrengend,', 'aber', 'sie', 'macht', 'Spaß.'],
        ], '« zwar » suit le verbe conjugué « ist ». Après la virgule, « aber » n’occupe aucune place dans la proposition : on a ensuite l’ordre normal sujet + verbe (« sie macht Spaß »).'),
        fill('q5', bi('Ergänzen Sie den Konnektor: Das Zweite kommt noch dazu.', 'Complétez : « non seulement …, mais aussi ».'),
          'Das Sprachcafé hilft nicht [[1]] den Gästen, [[2]] auch den Helfern.',
          [['nur'], ['sondern']],
          '« nicht nur …, sondern auch » : le second élément s’ajoute au premier. Après une négation, « mais » se dit « sondern » (et non « aber »), précédé d’une virgule.'),
        choice('q6', bi('Welche Konnektoren passen? „Ich habe … Zeit … Lust, heute mitzukommen.“', 'Quels connecteurs conviennent ? (Je n’ai ni le temps ni l’envie de venir aujourd’hui.)'), [
          ['entweder … oder'],
          ['weder … noch', true],
          ['sowohl … als auch'],
        ], 'La phrase française contient « ni … ni » : on choisit « weder … noch ». Avec « sowohl … als auch », la personne aurait au contraire le temps et l’envie.'),
        fill('q7', bi('Ergänzen Sie das Relativpronomen.', 'Complétez avec le pronom relatif.'),
          'Das ist alles, [[1]] ich über den Verein weiß. In der Stadt, [[2]] ich wohne, gibt es viele Vereine.',
          [['was'], ['wo', 'in der']],
          'Après « alles », on emploie « was ». Pour reprendre un lieu, « wo » convient ; « in der » (préposition + pronom relatif, die Stadt) est aussi juste.'),
        choice('q8', bi('Welche Form ist richtig? „Der Verein, … ich mich engagiere, sucht Helfer.“', 'Quelle forme est juste ? (L’association pour laquelle je m’engage cherche des bénévoles.)'), [
          ['für den', true],
          ['für das'],
          ['was'],
        ], '« sich engagieren für + accusatif » : la préposition passe devant le pronom relatif. « der Verein » est masculin, donc « für den ». « was » ne reprend pas un nom précis.'),
        match('q9', bi('Welche Satzteile passen zusammen?', 'Quelles parties de phrase vont ensemble ?'), [
          ['Das Beste,', 'was du tun kannst, ist mitmachen.'],
          ['In Leipzig,', 'wo meine Schwester wohnt, gibt es viele Vereine.'],
          ['Die Kollegin,', 'mit der ich arbeite, kommt aus Polen.'],
          ['Der Verein,', 'für den ich spende, hilft Kindern.'],
        ], '« das Beste » (superlatif employé comme nom) → was ; une ville → wo ; « die Kollegin » (féminin, mit + datif) → mit der ; « der Verein » (masculin, für + accusatif) → für den.'),
        order('q10', C.ordnen, [
          ['Das', 'ist', 'die Frau,', 'mit', 'der', 'ich', 'im Sprachcafé', 'arbeite.'],
        ], 'Relative avec préposition : « mit » + « der » (die Frau, datif féminin) ouvre la relative, et le verbe conjugué « arbeite » va à la fin.'),
      ] },

    { id: 'b1-gesellschaft-wortschatz', kind: 'exercise', title: 'Mots et formules : bénévolat et démarches', estimatedMinutes: 12,
      competences: ['lecture', 'expression-ecrite'],
      lesson: { description: `${bi('Lernen Sie die Wörter in festen Verbindungen.', 'Apprenez les mots dans leurs associations fixes.')}

REDEMITTEL
[fr] Formules utiles
• s’informer : Ich interessiere mich für … Was muss ich mitbringen?
• demander une condition : Muss man dafür Mitglied sein? Braucht man Erfahrung?
• au guichet : Ich möchte einen Antrag auf … stellen.
• proposer son aide : Ich könnte einmal pro Woche helfen.` },
      questions: [
        match('q1', bi('Welches Verb passt zu welchem Nomen?', 'Quel verbe va avec quel nom ?'), [
          ['ein Ehrenamt', 'übernehmen'],
          ['einen Antrag', 'stellen'],
          ['Mitglied', 'werden'],
          ['einen Beitrag', 'zahlen'],
          ['jemandem Bescheid', 'geben'],
        ], 'Associations figées : ein Ehrenamt übernehmen (prendre une fonction bénévole), einen Antrag stellen (déposer une demande), Mitglied werden (adhérer), einen Beitrag zahlen, jemandem Bescheid geben (prévenir quelqu’un).'),
        fill('q2', bi('Ergänzen Sie ein Wort aus derselben Familie.', 'Complétez avec un mot de la même famille.'),
          'das Ehrenamt → [[1]] (bénévole, adjectif) · freiwillig → die [[2]] (les bénévoles) · das Mitglied → die [[3]] (l’adhésion)',
          [['ehrenamtlich'], ['Freiwilligen'], ['Mitgliedschaft']],
          'Le suffixe -lich forme un adjectif : ehrenamtlich. L’adjectif devient un nom décliné : der/die Freiwillige, die Freiwilligen. Le suffixe -schaft forme un nom féminin : die Mitgliedschaft.'),
        fill('q3', bi('Ergänzen Sie die Präposition.', 'Complétez avec la préposition.'),
          'sich engagieren [[1]] (+ Akk.) · sich bewerben [[2]] eine Stelle (+ Akk.) · teilnehmen [[3]] (+ Dat.)',
          [['für'], ['um'], ['an']],
          'Verbes à préposition (thème 2) : sich engagieren für etwas, sich bewerben um eine Stelle, teilnehmen an einem Kurs. La préposition est figée : apprenez-la avec le verbe.'),
        choice('q4', bi('Sie möchten sich über ein Ehrenamt informieren. Was sagen Sie?', 'Vous voulez vous renseigner sur une activité bénévole. Que dites-vous ?'), [
          ['Ich habe gestern zum ersten Mal bei der Hausaufgabenhilfe gearbeitet.'],
          ['Ich interessiere mich für die Hausaufgabenhilfe. Was muss ich mitbringen?', true],
          ['Geben Sie mir bitte sofort eine Stelle bei der Hausaufgabenhilfe.'],
        ], 'On se présente avec « Ich interessiere mich für … » (+ accusatif), puis on pose une question pratique. La troisième phrase est un ordre impoli ; la première raconte une expérience au lieu de demander une information.'),
        choice('q5', bi('Sie fragen höflich nach einer Bedingung. Was passt?', 'Vous demandez poliment une condition. Quelle phrase convient ?'), [
          ['Muss man dafür Mitglied im Verein sein?', true],
          ['Ich bin kein Mitglied und möchte auch keins werden.'],
          ['Warum gibt es so viele Regeln?'],
        ], '« Muss man dafür … ? » demande une condition de façon neutre (« dafür » = pour cela). La deuxième phrase est une affirmation, la troisième une critique.'),
        choice('q6', bi('Im Bürgeramt: Was sagen Sie am Schalter?', 'Au guichet municipal : que dites-vous ?'), [
          ['Hallo, gib mir bitte schnell ein Führungszeugnis für den Verein.'],
          ['Guten Tag, ich habe mein altes Führungszeugnis leider verloren.'],
          ['Guten Tag, ich möchte einen Antrag auf ein Führungszeugnis stellen.', true],
        ], 'Formule administrative : « einen Antrag auf + accusatif stellen ». Au guichet, on vouvoie : « gib mir » (tutoiement) ne convient pas. La deuxième phrase ne correspond pas à la situation.'),
        fill('q7', bi('Ergänzen Sie.', 'Complétez.'),
          'Ich kann leider nicht kommen. Kannst du für mich [[1]]? Gib mir bitte [[2]], ob das klappt.',
          [['einspringen'], ['Bescheid']],
          '« für jemanden einspringen » : remplacer quelqu’un au pied levé (verbe séparable, ici à l’infinitif après « kannst du »). « jemandem Bescheid geben » : prévenir, donner une réponse.'),
      ] },

    { id: 'b1-gesellschaft-redemittel', kind: 'exercise', title: 'Répéter à voix haute : se renseigner et proposer son aide', estimatedMinutes: 9,
      competences: ['expression-orale'],
      lesson: { description: `${C.sprechen}

${bi('Sprechen Sie zuerst langsam, dann im normalen Tempo.', 'Répétez d’abord lentement, puis à vitesse normale.')}
${bi('Betonen Sie beide Teile der Konnektoren: entweder … oder, zwar … aber.', 'Accentuez les deux parties des connecteurs : entweder … oder, zwar … aber.')}` },
      questions: [
        speak('q1', 'Ich interessiere mich für ein Ehrenamt im Sprachcafé.',
          '« sich interessieren für » + accusatif. L’accent de « Ehrenamt » porte sur la première syllabe : EHrenamt.'),
        speak('q2', 'Muss man dafür Mitglied im Verein sein?',
          'Question fermée : la voix monte à la fin. « dafür » reprend l’activité dont on parle.'),
        speak('q3', 'Ich kann entweder mittwochs oder samstags helfen.',
          'Accentuez « mittwochs » et « samstags », les deux possibilités. Les jours avec -s (mittwochs) signifient « le mercredi » (chaque semaine).'),
        speak('q4', 'Ich habe zwar wenig Erfahrung, aber viel Motivation.',
          '« zwar … aber » : on concède un point faible, puis on met en avant un point fort. La voix monte légèrement sur « Erfahrung » et retombe sur « Motivation ».'),
        speak('q5', 'Das ist genau das, was ich suche.',
          'Relative avec « was » après « das ». Accentuez « genau ».'),
        speak('q6', 'Ich möchte einen Antrag auf ein Führungszeugnis stellen.',
          'Formule de guichet. « Führungszeugnis » : accent sur la première syllabe, le « ü » se prononce lèvres arrondies.'),
      ] },

    { id: 'b1-gesellschaft-lesen2', kind: 'exercise', title: 'Comprendre : le portrait d’une bénévole', estimatedMinutes: 15,
      competences: ['lecture', 'ecoute', 'expression-ecrite'],
      lesson: { description: `${C.lesen}

${bi('Die Fragen 5 und 6 sind Diktate: Hören Sie die Sätze und schreiben Sie sie.', 'Les questions 5 et 6 sont des dictées : écoutez les phrases et écrivez-les.')}

PORTRÄT: EINE STUNDE, DIE ZÄHLT
[fr] Portrait : une heure qui compte

Marta Nowak ist 41, Krankenpflegerin und Mutter von zwei Kindern. Freizeit hat sie wenig. Trotzdem verbringt sie jeden Montagnachmittag in der Grundschule am Westpark, wo der Verein Türklinke eine Hausaufgabenhilfe organisiert. „Viele denken, dass man für ein Ehrenamt sehr viel Zeit braucht“, sagt sie. „Aber man braucht weder Erfahrung noch viel Zeit, nur ein bisschen Geduld.“

Vor zwölf Jahren ist Marta selbst aus Polen nach Deutschland gekommen. Damals verstand sie die Briefe von den Ämtern kaum. „Eine Nachbarin hat mir geholfen, alle Formulare auszufüllen. Das ist etwas, was ich nie vergessen habe.“ Heute gibt Marta diese Hilfe weiter. Montags betreut sie drei Kinder aus der vierten Klasse. Sie üben sowohl Lesen als auch Rechnen. „Das Schönste ist, wenn ein Kind plötzlich allein einen ganzen Satz lesen kann.“ Einmal im Monat begleitet sie außerdem Familien zum Bürgeramt, wenn sie Hilfe bei einem Antrag brauchen.

Ist das nicht anstrengend? „Doch, manchmal schon“, sagt Marta und lacht. „Nach einer Nachtschicht bin ich zwar müde, aber die Kinder geben mir viel Energie zurück.“ Nicht nur die Kinder, sondern auch Marta selbst lernt dabei etwas: „Ich bin geduldiger geworden, und mein Deutsch ist auch noch besser geworden!“

Ihr Tipp für alle, die sich engagieren möchten: „Fangen Sie klein an. Eine Stunde pro Woche ist mehr, als viele denken.“` },
      questions: [
        choice('q1', bi('Worum geht es in dem Porträt?', 'De quoi parle le portrait ?'), [
          ['Um eine Lehrerin, die an einer Grundschule arbeitet.'],
          ['Um eine Frau, die neben ihrem Beruf Kindern und Familien hilft.', true],
          ['Um eine Familie, die gerade nach Deutschland gekommen ist.'],
        ], 'Marta est infirmière (« Krankenpflegerin ») et aide bénévolement des enfants et des familles en plus de son travail. Elle n’est pas enseignante : elle intervient à l’école dans le cadre de l’association.'),
        rf('q2', 'Marta hat in Polen einer Nachbarin mit Formularen geholfen.', 'f',
          'Faux : c’est l’inverse. Quand Marta est arrivée en Allemagne, « eine Nachbarin hat mir geholfen, alle Formulare auszufüllen ».'),
        rf('q3', 'Marta arbeitet manchmal nachts.', 'r',
          'Vrai : elle parle d’une « Nachtschicht » (garde de nuit) après laquelle elle est fatiguée.'),
        choice('q4', bi('Warum begleitet Marta Familien zum Bürgeramt?', 'Pourquoi Marta accompagne-t-elle des familles au guichet municipal ?'), [
          ['Weil sie früher selbst lange im Bürgeramt gearbeitet hat.'],
          ['Weil der Verein sie für diese Begleitung gut bezahlt.'],
          ['Weil sie am Anfang selbst Hilfe bekommen hat.', true],
        ], '« Heute gibt Marta diese Hilfe weiter » : elle transmet l’aide reçue de sa voisine. Le texte ne dit pas qu’elle a travaillé à la mairie, et le bénévolat n’est pas rémunéré.'),
        dictation('q5', 'Marta hilft den Kindern sowohl beim Lesen als auch beim Rechnen.',
          '« sowohl … als auch » relie les deux activités. « beim Lesen », « beim Rechnen » : infinitifs employés comme noms, donc avec majuscule (bei + dem = beim).', 'frau2'),
        dictation('q6', 'Wer sich engagieren möchte, sollte zuerst mit einer Stunde pro Woche anfangen.',
          '« Wer … möchte, sollte … » : la relative en « wer » joue le rôle de sujet, puis le verbe « sollte » ouvre la principale. « anfangen » reste en un mot à l’infinitif.', 'sprecher'),
      ] },

    { id: 'b1-gesellschaft-kontrolle', kind: 'exercise', title: 'Vérifier : association, démarches, connecteurs et relatives', estimatedMinutes: 12,
      competences: ['lecture', 'ecoute'],
      lesson: { description: bi('Hören Sie die Nachricht für die Fragen 1 und 2. Lösen Sie dann die anderen Aufgaben.', 'Écoutez le message pour les questions 1 et 2, puis faites les autres exercices.') },
      placements: [{ media: 'b1-gesellschaft-kontrolle-nachricht', transcriptVisibility: 'after_answer' }],
      questions: [
        choice('q1', bi('Wo kann Frau Diallo mitmachen?', 'Où Mme Diallo peut-elle participer ?'), [
          ['Nur im Sprachcafé.'],
          ['Sowohl im Sprachcafé als auch bei der Hausaufgabenhilfe.', true],
          ['Weder im Sprachcafé noch bei der Hausaufgabenhilfe.'],
        ], '« Sie können sowohl im Sprachcafé als auch bei der Hausaufgabenhilfe mitmachen » : les deux activités lui sont ouvertes, avec une condition pour l’aide aux devoirs.'),
        choice('q2', bi('Was muss sie für das Führungszeugnis ins Bürgeramt mitbringen?', 'Que doit-elle apporter au guichet pour l’extrait de casier ?'), [
          ['Eine Bestätigung des Vereins.', true],
          ['Eine Gebühr von dreizehn Euro.'],
          ['Ein Foto und ihren Mietvertrag.'],
        ], '« Für Ehrenamtliche ist es kostenlos, wenn Sie unsere Bestätigung mitbringen. » Nadine lui envoie cette attestation par courriel. Aucun frais n’est à payer.'),
        fill('q3', bi('Ergänzen Sie den Konnektor.', 'Complétez avec le connecteur.'),
          'Sie können [[1]] Mitglied werden [[2]] einfach nur mithelfen. Beides ist möglich.',
          [['entweder'], ['oder']],
          'Deux possibilités, au choix : « entweder … oder ». « Beides ist möglich » confirme qu’il ne s’agit pas de « weder … noch ».'),
        fill('q4', bi('Ergänzen Sie das Relativpronomen.', 'Complétez avec le pronom relatif.'),
          'Das Bürgeramt, [[1]] man das Führungszeugnis beantragt, ist in der Hauptstraße. Das ist alles, [[2]] Sie wissen müssen.',
          [['wo', 'in dem', 'bei dem'], ['was']],
          'Un lieu : « wo » (ou « in dem », « bei dem », das Bürgeramt étant neutre). Après « alles » : « was ».'),
        order('q5', C.ordnen, [
          ['Ich', 'suche', 'einen Verein,', 'in', 'dem', 'ich', 'Kindern', 'helfen', 'kann.'],
        ], 'Relative avec préposition : « in dem » (der Verein, datif masculin). Dans la relative, le verbe conjugué « kann » va tout à la fin, après l’infinitif « helfen ».'),
        choice('q6', bi('Welcher Satz ist richtig?', 'Quelle phrase est correcte ?'), [
          ['Ich habe weder keine Zeit noch kein Geld.'],
          ['Ich habe nicht weder Zeit noch Geld.'],
          ['Ich habe weder Zeit noch Geld.', true],
        ], '« weder … noch » est déjà négatif : aucune autre négation (kein, nicht) ne s’ajoute.'),
        choice('q7', bi('Was ist ein „Ehrenamt“?', 'Qu’est-ce qu’un « Ehrenamt » ?'), [
          ['Eine bezahlte Stelle in einem Verein.'],
          ['Eine Arbeit ohne Lohn für die Gemeinschaft.', true],
          ['Ein Büro in der Stadtverwaltung für alle Vereine der Stadt.'],
        ], 'Un Ehrenamt est une activité bénévole, non rémunérée, au service des autres. Le mot « Amt » (fonction) peut faire penser à une administration, mais « ehren- » (l’honneur) indique qu’on le fait sans salaire.'),
        fill('q8', bi('Ergänzen Sie.', 'Complétez.'),
          'Für die Arbeit mit Kindern muss ich im Bürgeramt einen [[1]] auf ein Führungszeugnis stellen.',
          [['Antrag']],
          'Collocation administrative : « einen Antrag (auf + accusatif) stellen », déposer une demande. Le nom est masculin : der Antrag, die Anträge.'),
      ] },
  ],
};
