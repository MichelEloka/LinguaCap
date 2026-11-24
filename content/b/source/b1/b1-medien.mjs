// Module B1 n° 17 · thème « Medien » (lot R3). S'informer et vérifier une information : article de presse locale,
// radio de quartier qui corrige une rumeur, publication dans un groupe de quartier ; rapporter avec dass, ob et laut,
// situer dans le temps avec bevor, während, seitdem, bis et sobald, former des noms en -ung, -heit et -keit.
// Reprise réécrite du brouillon B1 V1 : communiqué de la bibliothèque, billet de blog, dass et ob, confirmation ou rumeur,
// radio locale et son quiz (content/b1-v1/source/partie2.mjs › b1-medien).
// Second document : -lesen2 (publication de quartier, gabarit forum), comme le prévoit la fiche du module.
import { C, bi, choice, fill, order, match, dictation, speak } from '../../lib.mjs';

/** « Richtig / falsch / steht nicht im Text » : r, f ou n pour la bonne réponse. */
const rf = (id, statement, answer, explanation) => choice(id, `${statement} ${C.richtigFalsch}`,
  [['richtig', answer === 'r'], ['falsch', answer === 'f'], ['steht nicht im Text', answer === 'n']], explanation);

export default {
  id: 'b1-medien',
  title: 'Medien : s’informer et vérifier une information',
  objective: 'Distinguer fait, opinion et rumeur, rapporter ce que dit une source (dass, ob, laut), situer des événements dans le temps (bevor, während, seitdem, bis, sobald) et comprendre une émission de radio locale.',
  grammarFocus: ['dass-ob-redewiedergabe', 'temporale-nebensaetze', 'nominalisierung'],
  sources: [
    'Textes, émission de radio, publications et exercices originaux LinguaCap.',
    'Situations reprises et réécrites du brouillon B1 V1 (LinguaCap) : communiqué de la bibliothèque, radio locale sur la piscine.',
  ],

  vocabulary: [
    { word: 'Quelle', article: 'die', plural: 'Quellen', partOfSpeech: 'noun', translation: 'la source (d’une information)',
      example: 'Gibt es für diese Nachricht eine Quelle?', note: null },
    { word: 'Meldung', article: 'die', plural: 'Meldungen', partOfSpeech: 'noun', translation: 'l’information, la dépêche',
      example: 'Die Meldung kam am Montag im Radio.', note: 'melden : signaler, annoncer' },
    { word: 'Gerücht', article: 'das', plural: 'Gerüchte', partOfSpeech: 'noun', translation: 'la rumeur',
      example: 'Das ist nur ein Gerücht.', note: null },
    { word: 'Nachricht', article: 'die', plural: 'Nachrichten', partOfSpeech: 'noun', translation: 'la nouvelle, le message',
      example: 'Ich höre morgens die Nachrichten im Radio.', note: 'die Nachrichten : les informations (radio, télé)' },
    { word: 'Mitteilung', article: 'die', plural: 'Mitteilungen', partOfSpeech: 'noun', translation: 'le communiqué, l’avis',
      example: 'Laut Mitteilung der Stadt bleibt das kleine Becken offen.', note: 'mitteilen : faire savoir' },
    { word: 'Tatsache', article: 'die', plural: 'Tatsachen', partOfSpeech: 'noun', translation: 'le fait',
      example: 'Das ist eine Tatsache, keine Meinung.', note: null },
    { word: 'Meinung', article: 'die', plural: 'Meinungen', partOfSpeech: 'noun', translation: 'l’opinion, l’avis',
      example: 'Meiner Meinung nach ist der Artikel gut recherchiert.', note: 'meiner Meinung nach : à mon avis' },
    { word: 'bestätigen', partOfSpeech: 'verb', translation: 'confirmer',
      example: 'Die Stadt hat die Meldung bestätigt.', note: 'inséparable : hat bestätigt' },
    { word: 'behaupten', partOfSpeech: 'verb', translation: 'affirmer, prétendre',
      example: 'Mia behauptet, dass das Fest ausfällt.', note: null },
    { word: 'berichten', partOfSpeech: 'verb', translation: 'rendre compte, faire un reportage',
      example: 'Die Zeitung berichtet über die neue Bibliothek.', note: 'über + accusatif' },
    { word: 'veröffentlichen', partOfSpeech: 'verb', translation: 'publier',
      example: 'Die Zeitung hat den Artikel gestern veröffentlicht.', note: 'inséparable : hat veröffentlicht' },
    { word: 'teilen', partOfSpeech: 'verb', translation: 'partager',
      example: 'Viele haben das Foto im Netz geteilt.', note: null },
    { word: 'weiterleiten', partOfSpeech: 'verb', translation: 'transférer (un message)',
      example: 'Bitte leite die Nachricht nicht weiter.', note: 'séparable : weiter|leiten' },
    { word: 'überprüfen', partOfSpeech: 'verb', translation: 'vérifier',
      example: 'Bevor ich etwas teile, überprüfe ich die Quelle.', note: 'inséparable : hat überprüft' },
    { word: 'Artikel', article: 'der', plural: 'Artikel', partOfSpeech: 'noun', translation: 'l’article',
      example: 'Der Artikel ist in der Lokalzeitung erschienen.', note: null },
    { word: 'Beitrag', article: 'der', plural: 'Beiträge', partOfSpeech: 'noun', translation: 'la publication, la contribution (forum)',
      example: 'Ihr Beitrag im Forum hat viele Kommentare bekommen.', note: null },
    { word: 'Schlagzeile', article: 'die', plural: 'Schlagzeilen', partOfSpeech: 'noun', translation: 'le gros titre',
      example: 'Die Schlagzeile war falsch, der Artikel war richtig.', note: null },
    { word: 'soziale Medien', partOfSpeech: 'expression', translation: 'les réseaux sociaux',
      example: 'In den sozialen Medien wird viel geteilt.', note: 'aussi : soziale Netzwerke' },
    { word: 'glaubwürdig', partOfSpeech: 'adjective', translation: 'crédible, fiable',
      example: 'Die Mitteilung der Stadt ist glaubwürdig.', note: 'die Glaubwürdigkeit : la crédibilité' },
    { word: 'angeblich', partOfSpeech: 'adverb', translation: 'soi-disant, paraît-il',
      example: 'Angeblich schließt das Kino am Markt.', note: 'signale une information non vérifiée' },
    { word: 'laut', partOfSpeech: 'preposition', translation: 'selon, d’après',
      example: 'Laut der Stadt bleibt das Bad offen.', note: '+ datif ; souvent sans article : laut Mitteilung' },
    { word: 'verbreiten', partOfSpeech: 'verb', translation: 'répandre, diffuser',
      example: 'Die falsche Nachricht wurde schnell im Netz verbreitet.', note: 'inséparable : hat verbreitet · ein Gerücht verbreiten' },
    { word: 'bevor', partOfSpeech: 'conjunction', translation: 'avant que, avant de',
      example: 'Bevor ich etwas teile, lese ich den ganzen Artikel.', note: '≠ vor + nom (vor dem Essen)' },
    { word: 'seitdem', partOfSpeech: 'conjunction', translation: 'depuis que',
      example: 'Seitdem die Bibliothek renoviert wurde, kommen mehr Besucher.', note: 'aussi : seit ; verbe à la fin' },
    { word: 'sobald', partOfSpeech: 'conjunction', translation: 'dès que',
      example: 'Sobald die Arbeiten fertig sind, öffnet das Bad.', note: null },
  ],

  media: [
    { key: 'b1-medien-hoeren-radio', kind: 'audio', title: 'Radio de quartier : une fermeture à préciser',
      script: [
        { voice: 'sprecherin', name: 'Hanna', text: 'Guten Morgen, hier ist das Stadtteilradio Neustadt, es ist acht Uhr. Seit gestern Abend wird in mehreren Gruppen im Netz ein Foto geteilt. Darauf steht, dass das Hallenbad ab Montag geschlossen ist.' },
        { pause: 0.4 },
        { voice: 'sprecherin', name: 'Hanna', text: 'Viele von euch haben uns gefragt, ob das stimmt. Unser Reporter Jonas hat bei der Stadt nachgefragt. Jonas, was hast du herausgefunden?' },
        { pause: 0.5 },
        { voice: 'mann2', name: 'Jonas', text: 'Also, das Foto zeigt nur einen Teil des Aushangs. Die Stadt bestätigt, dass am Montag und Dienstag nur das große Becken geschlossen bleibt. Dort wird die Beleuchtung erneuert. Während die Techniker die Lampen austauschen, darf aus Sicherheitsgründen niemand ins große Becken. Das kleine Becken und die Sauna sind ganz normal geöffnet.' },
        { pause: 0.5 },
        { voice: 'sprecherin', name: 'Hanna', text: 'Was bedeutet das für die Schwimmkurse? Einige Eltern wollen wissen, ob die Kurse am Montagnachmittag ausfallen.' },
        { pause: 0.4 },
        { voice: 'mann2', name: 'Jonas', text: 'Dazu habe ich mit Frau Krüger vom Sportamt gesprochen. Hören wir mal rein.' },
        { pause: 0.7 },
        { voice: 'frau3', name: 'Frau Krüger', text: 'Die Anfängerkurse für Kinder finden wie immer statt, und zwar im kleinen Becken. Die Eltern müssen also nichts ändern. Beim Training für Fortgeschrittene ist es schwieriger. Bevor wir entscheiden, sprechen wir noch mit dem Schwimmverein. Die Gruppen bekommen bis Sonntagabend eine Nachricht.' },
        { pause: 0.6 },
        { voice: 'sprecherin', name: 'Hanna', text: 'Und ab wann ist wieder alles offen?' },
        { pause: 0.4 },
        { voice: 'mann2', name: 'Jonas', text: 'Sobald die Arbeiten fertig sind, ist wieder alles offen, also voraussichtlich ab Mittwoch. Falls es Verzögerungen gibt, meldet die Stadt das auf ihrer Internetseite.' },
        { pause: 0.5 },
        { voice: 'sprecherin', name: 'Hanna', text: 'Danke, Jonas. Liebe Hörerinnen und Hörer: Bevor ihr ein Foto weiterleitet, schaut bitte, woher es kommt. Die vollständige Mitteilung der Stadt findet ihr auf unserer Internetseite. Und jetzt: Musik!' },
      ] },

    { key: 'b1-medien-lesen2-gruppe', kind: 'image', title: 'Publication dans un groupe de quartier',
      alt: 'Fil d’un groupe de quartier : Mia écrit que la fête d’été de samedi est annulée, paraît-il à cause du temps ; M. Okafor demande sa source ; l’association de quartier répond que la fête a lieu au gymnase de l’école à 15 h ; Mia s’excuse.',
      image: { layout: 'forum', title: 'Nachbarschaftsgruppe Lindenviertel',
        posts: [
          { author: 'Mia L.', date: 'Mo., 18:02', text: 'Hab gerade gehört, dass das Sommerfest am Samstag ausfällt. Angeblich wegen des Wetters. Schade!' },
          { author: 'Herr Okafor', date: 'Mo., 18:40', text: 'Woher weißt du das, Mia? Auf der Seite des Bürgervereins steht nichts davon. Gibt es dafür eine Quelle?' },
          { author: 'Bürgerverein Lindenviertel', date: 'Mo., 19:15', text: 'Liebe Nachbarinnen und Nachbarn, das Sommerfest findet statt! Wegen des Regens ziehen wir nur in die Turnhalle der Grundschule um. Beginn wie geplant um 15 Uhr.' },
          { author: 'Mia L.', date: 'Mo., 19:30', text: 'Oh, sorry! Da hatte ich etwas falsch verstanden. Danke für die Info, dann bis Samstag in der Turnhalle!' },
        ] } },

    { key: 'b1-medien-kontrolle-nachrichten', kind: 'audio', title: 'Informations locales : le marché déménage',
      script: [
        { voice: 'mann3', text: 'Und nun die Lokalnachrichten. Die Stadt Neustadt hat bestätigt, dass der Wochenmarkt ab nächster Woche auf dem Rathausplatz stattfindet. Der Grund: Auf dem Marktplatz wird bis Ende Oktober ein neuer Brunnen gebaut.' },
        { pause: 0.4 },
        { voice: 'mann3', text: 'Ob der Markt danach auf den Marktplatz zurückkehrt, ist noch nicht entschieden. Die Marktzeiten bleiben gleich: dienstags und freitags von sieben bis dreizehn Uhr.' },
      ] },
  ],

  activities: [
    // 1 · Mise en route
    { id: 'b1-medien-einstieg', kind: 'lesson', title: 'Mise en route : s’informer, mais comment ?', estimatedMinutes: 10,
      competences: ['lecture', 'expression-orale'],
      lesson: { description: `MEDIEN
[fr] Les médias
${bi('Zeitung, Radio, Internet, Gruppen auf dem Handy: Nachrichten kommen von überall. Aber was stimmt wirklich?', 'Journal, radio, internet, groupes sur le téléphone : les nouvelles viennent de partout. Mais qu’est-ce qui est vrai ?')}

FRAGEN ZUM EINSTIEG
[fr] Questions pour commencer
• ${bi('Wie informieren Sie sich über das, was in Ihrer Stadt passiert?', 'Comment vous informez-vous sur ce qui se passe dans votre ville ?')}
• ${bi('Haben Sie schon einmal eine Nachricht geteilt, die nicht gestimmt hat?', 'Avez-vous déjà partagé une nouvelle qui était fausse ?')}
• ${bi('Woran erkennen Sie, dass eine Information glaubwürdig ist?', 'À quoi reconnaissez-vous qu’une information est fiable ?')}
${bi('Antworten Sie laut auf Deutsch, in zwei oder drei Sätzen.', 'Répondez à voix haute en allemand, en deux ou trois phrases.')}

ICH KANN …
[fr] Je peux…
• ${bi('Tatsache, Meinung und Gerücht unterscheiden', 'distinguer un fait, une opinion et une rumeur')}
• ${bi('sagen, was eine Quelle berichtet (dass, ob, laut)', 'rapporter ce que dit une source (dass, ob, laut)')}
• ${bi('eine Sendung im Lokalradio verstehen', 'comprendre une émission de radio locale')}
• ${bi('sagen, wann etwas passiert (bevor, während, seitdem, bis, sobald)', 'dire quand quelque chose se passe (bevor, während, seitdem, bis, sobald)')}

WICHTIGE WÖRTER
[fr] Mots-clés
• die Quelle — la source
• die Meldung — l’information, la dépêche
• das Gerücht — la rumeur
• bestätigen — confirmer
• behaupten — affirmer, prétendre
• berichten über — rendre compte de
• glaubwürdig — crédible, fiable
• angeblich — soi-disant` } },

    // 2 · Lecture longue : article de presse locale
    { id: 'b1-medien-lesen', kind: 'exercise', title: 'Comprendre : un article de la presse locale', estimatedMinutes: 20,
      competences: ['lecture'],
      lesson: { description: `${C.lesen}

STRATEGIE
[fr] Stratégie
${bi('Ein Zeitungsartikel beantwortet die W-Fragen: Was? Wer? Wann? Wo? Warum? Suchen Sie die Antworten zuerst im ersten Absatz.', 'Un article de presse répond aux questions : quoi ? qui ? quand ? où ? pourquoi ? Cherchez d’abord les réponses dans le premier paragraphe.')}
${bi('Achten Sie darauf, wer spricht: die Stadt, die Bibliotheksleiterin oder die sozialen Netzwerke.', 'Observez qui parle : la ville, la directrice de la bibliothèque ou les réseaux sociaux.')}
${bi('„Steht nicht im Text“ bedeutet: Der Text sagt dazu nichts.', '« Non mentionné » signifie : le texte n’en dit rien.')}

MEHR ZEIT ZUM LESEN: STADTBIBLIOTHEK ÖFFNET ZWEI ABENDE LÄNGER
Neustädter Rundschau, Lokales

(A) Ab dem 3. Juni bleibt die Hauptbibliothek in der Neustädter Innenstadt dienstags und donnerstags bis 20 Uhr geöffnet. Das hat die Stadtverwaltung am Montag mitgeteilt. Laut Mitteilung handelt es sich zunächst um einen Versuch für die Monate Juni und Juli. Für die längeren Öffnungszeiten werden zwei zusätzliche Mitarbeiterinnen eingestellt. Die drei kleinen Stadtteilbibliotheken behalten ihre bisherigen Öffnungszeiten, und sonntags bleiben alle Standorte wie bisher geschlossen.

(B) Seitdem die Bibliothek vor zwei Jahren renoviert wurde, kommen deutlich mehr Besucherinnen und Besucher, vor allem Studierende und Berufstätige. „Viele haben uns gefragt, ob wir nicht auch abends öffnen können“, sagt Bibliotheksleiterin Petra Albers. „Wer bis 18 Uhr arbeitet, hatte bisher kaum eine Möglichkeit, in Ruhe Bücher auszuleihen.“ Besonders in der Prüfungszeit war der Lesesaal schon am Nachmittag oft voll.

(C) Allerdings gibt es eine Einschränkung: Der Lesesaal ist bis 20 Uhr zugänglich, die Ausleihe endet aber schon um 19.45 Uhr. Einen Termin braucht man für die Abendstunden nicht. Auch das Café im Erdgeschoss bleibt an diesen Abenden bis 19 Uhr geöffnet. Ob es abends auch Veranstaltungen wie Lesungen geben wird, ist laut Albers noch offen. „Bevor wir so etwas planen, wollen wir sehen, wie das neue Angebot angenommen wird.“

(D) Im August wertet die Stadt die Besucherzahlen aus. Erst danach wird entschieden, ob die neuen Zeiten bleiben. Bis die Entscheidung fällt, können Bürgerinnen und Bürger ihre Meinung über das Kontaktformular auf der Internetseite der Stadt mitteilen. In sozialen Netzwerken wurde die Nachricht übrigens schon am Wochenende verbreitet, allerdings oft falsch: Dort hieß es, dass die Bibliothek ab sofort jeden Abend geöffnet ist. Das stimmt nicht, betont die Stadt. Sie bittet deshalb, Informationen immer auf ihrer Internetseite zu prüfen.` },
      questions: [
        choice('q1', bi('Worum geht es in dem Artikel?', 'De quoi parle l’article ?'),
          [['Die Stadtbibliothek schließt im Sommer für zwei Monate.'], ['Die Stadtbibliothek testet längere Öffnungszeiten an zwei Abenden.', true],
            ['Die Stadt baut im Juni eine neue Bibliothek in der Innenstadt.']],
          'Le premier paragraphe donne l’essentiel : ouverture jusqu’à 20 h le mardi et le jeudi, « zunächst … ein Versuch » (d’abord un essai) en juin et juillet. Il n’est question ni de fermeture ni de construction.'),
        choice('q2', bi('Was will der Artikel vor allem?', 'Que veut surtout l’article ?'),
          [['für neue Lesungen am Abend werben'], ['die Bibliotheksleiterin und ihr Team kritisieren'], ['informieren und eine falsche Meldung richtigstellen', true]],
          'L’article informe sur les nouveaux horaires et, au paragraphe D, corrige la rumeur des réseaux sociaux (« Das stimmt nicht, betont die Stadt »). La directrice est citée, pas critiquée, et les lectures du soir ne sont pas annoncées : elles sont « noch offen ».'),
        rf('q3', 'Alle Bibliotheken der Stadt sind dienstags und donnerstags länger geöffnet.', 'f',
          'Faux : seule la bibliothèque centrale ouvre plus tard ; « Die drei kleinen Stadtteilbibliotheken behalten ihre bisherigen Öffnungszeiten ».'),
        rf('q4', 'Für die Abendstunden braucht man keinen Termin.', 'r',
          'Paragraphe C : « Einen Termin braucht man für die Abendstunden nicht. » Le complément placé en tête (Einen Termin) n’en change pas le sens.'),
        rf('q5', 'Man kann abends bis 20 Uhr Bücher ausleihen.', 'f',
          'Faux : la salle de lecture est accessible jusqu’à 20 h, mais « die Ausleihe endet aber schon um 19.45 Uhr ». Piège classique : 20 h est bien dans le texte, mais pour autre chose.'),
        rf('q6', 'Die Renovierung der Bibliothek hat zwei Millionen Euro gekostet.', 'n',
          'Le texte dit seulement que la bibliothèque a été rénovée il y a deux ans ; il ne donne aucun prix : non mentionné.'),
        match('q7', bi('Welche Überschrift passt zu welchem Absatz? Ordnen Sie zu.', 'Quel intertitre convient à quel paragraphe ? Associez.'),
          [['Absatz A', 'Zwei Abende mehr, zunächst als Test'], ['Absatz B', 'Warum die Bibliothek länger öffnet'],
            ['Absatz C', 'Lesesaal ja, Ausleihe nur bis 19.45 Uhr'], ['Absatz D', 'Wie es weitergeht und was im Netz falsch war']],
          'A annonce la décision et son caractère d’essai ; B en donne la raison (la demande des visiteurs) ; C précise la limite (le prêt s’arrête à 19 h 45) ; D parle de la suite (bilan en août) et de la fausse information en ligne.'),
        fill('q8', bi('Absatz D: „Das stimmt nicht, betont die Stadt.“ Was stimmt nicht? Ergänzen Sie.', 'Paragraphe D : qu’est-ce qui est faux ? Complétez.'),
          'Es stimmt nicht, dass die Bibliothek ab sofort jeden [[1]] geöffnet ist.',
          [['Abend']],
          '« Das » reprend la phrase précédente : sur les réseaux, on disait que la bibliothèque était ouverte « ab sofort jeden Abend ». En réalité, seulement deux soirs (mardi et jeudi), à partir du 3 juin.'),
      ] },

    // 3 · Écoute longue : radio de quartier
    { id: 'b1-medien-hoeren', kind: 'exercise', title: 'Comprendre : la radio du quartier vérifie une rumeur', estimatedMinutes: 18,
      competences: ['ecoute'],
      lesson: { description: `${C.hoeren}

${bi('Situation: Im Netz wird ein Foto geteilt: Das Hallenbad soll geschlossen sein. Das Stadtteilradio hat nachgefragt.', 'Situation : une photo circule en ligne : la piscine serait fermée. La radio du quartier s’est renseignée.')}

STRATEGIE
[fr] Stratégie
${bi('Beim ersten Hören: Was sagt das Gerücht? Was sagt die Stadt?', 'Première écoute : que dit la rumeur ? que dit la ville ?')}
${bi('Beim zweiten Hören achten Sie auf Signalwörter: nur, bestätigt, ob, bevor, sobald.', 'Deuxième écoute : repérez les mots-signaux nur, bestätigt, ob, bevor, sobald.')}
${bi('Die Transkription sehen Sie nach Ihren Antworten.', 'Vous verrez la transcription après vos réponses.')}` },
      placements: [{ media: 'b1-medien-hoeren-radio', transcriptVisibility: 'after_answer' }],
      questions: [
        fill('q1', C.notizen,
          'Gerücht im Netz: Das Hallenbad ist ab Montag [[1]]. · Wirklich geschlossen: nur das große [[2]] (Montag und Dienstag) · Grund: Die [[3]] wird erneuert. · Fortgeschrittene: Nachricht bis [[4]] · wieder alles offen: voraussichtlich ab [[5]]',
          [['geschlossen', 'zu'], ['Becken'], ['Beleuchtung'], ['Sonntagabend', 'Sonntag'], ['Mittwoch']],
          'La photo dit « dass das Hallenbad ab Montag geschlossen ist ». La ville précise : « nur das große Becken », car « die Beleuchtung » est remplacée. Les avancés auront un message « bis Sonntagabend », et tout rouvre « voraussichtlich ab Mittwoch ».'),
        choice('q2', bi('Woher hat Jonas seine Informationen?', 'D’où Jonas tient-il ses informations ?'),
          [['aus einer Gruppe im Netz'], ['von der Stadt und vom Sportamt', true], ['von den Eltern']],
          'Jonas « hat bei der Stadt nachgefragt » et a parlé avec Mme Krüger « vom Sportamt » : deux sources officielles. La photo vient des groupes en ligne, et les parents posent des questions.'),
        choice('q3', bi('Was gilt für die Anfängerkurse der Kinder?', 'Qu’en est-il des cours pour enfants débutants ?'),
          [['Sie fallen am Montag und am Dienstag aus.'], ['Sie finden wie immer statt, im großen Becken.'], ['Sie finden wie immer statt, im kleinen Becken.', true]],
          '« Die Anfängerkurse für Kinder finden wie immer statt, und zwar im kleinen Becken. » La décision encore ouverte concerne l’entraînement des avancés, pas les débutants.'),
        choice('q4', bi('Was rät die Moderatorin am Ende?', 'Que conseille l’animatrice à la fin ?'),
          [['vor dem Weiterleiten zu prüfen, woher ein Foto kommt', true], ['am Montag lieber nicht ins Hallenbad zu gehen'], ['bei Fragen direkt beim Sportamt anzurufen']],
          '« Bevor ihr ein Foto weiterleitet, schaut bitte, woher es kommt. » Elle renvoie ensuite au communiqué complet sur le site de la radio.'),
      ] },

    // 4 · Grammaire inductive
    { id: 'b1-medien-entdecken', kind: 'exercise', title: 'Découvrir : rapporter et situer dans le temps', estimatedMinutes: 10,
      competences: ['lecture'],
      lesson: { description: `${bi('Lesen Sie die Sätze aus dem Artikel und aus der Radiosendung. Beantworten Sie dann die Fragen.', 'Lisez les phrases tirées de l’article et de l’émission de radio, puis répondez aux questions.')}
${bi('Achten Sie auf die Wörter dass, ob, laut und auf die Wörter am Satzanfang der Sätze 4 bis 8.', 'Observez dass, ob, laut et les mots qui ouvrent les phrases 4 à 8.')}

SÄTZE AUS DEN TEXTEN
[fr] Phrases tirées des textes
1. Die Stadt bestätigt, dass nur das große Becken geschlossen bleibt.
2. Einige Eltern wollen wissen, ob die Kurse ausfallen.
3. Laut Mitteilung handelt es sich um einen Versuch.
4. Seitdem die Bibliothek renoviert wurde, kommen mehr Besucher.
5. Bevor wir entscheiden, sprechen wir mit dem Schwimmverein.
6. Sobald die Arbeiten fertig sind, ist wieder alles offen.
7. Während die Techniker die Lampen austauschen, darf niemand ins große Becken.
8. Bis die Entscheidung fällt, können Bürgerinnen und Bürger ihre Meinung mitteilen.

NOMEN AUS DEN TEXTEN
[fr] Noms tirés des textes
die Mitteilung, die Entscheidung, die Möglichkeit, die Sicherheit` },
      questions: [
        choice('q1', bi('Sätze 1 und 2: Wann benutzt man „dass“, wann „ob“?', 'Phrases 1 et 2 : quand emploie-t-on « dass », quand « ob » ?'),
          [['„dass“ für eine Aussage, „ob“ für eine Ja-Nein-Frage', true], ['„dass“ für eine Frage, „ob“ für eine Aussage'], ['Beide bedeuten dasselbe.']],
          'Dass rapporte une affirmation (la ville confirme que…). Ob rapporte une question fermée, à laquelle on répondrait par oui ou non (les parents veulent savoir si…). Dans les deux cas, le verbe conjugué va à la fin.'),
        choice('q2', bi('Satz 3: Was bedeutet „laut Mitteilung“?', 'Phrase 3 : que signifie « laut Mitteilung » ?'),
          [['Die Mitteilung ist sehr laut.'], ['So steht es in der Mitteilung.', true], ['gegen die Mitteilung']],
          'La préposition laut (+ datif) signifie « selon, d’après » : elle cite la source. Rien à voir avec l’adjectif laut (fort, bruyant). Souvent sans article : laut Mitteilung, laut Polizei.'),
        match('q3', bi('Sätze 4 bis 8: Was bedeuten die Wörter? Ordnen Sie zu.', 'Phrases 4 à 8 : que signifient ces mots ? Associez.'),
          [['seitdem', 'depuis que'], ['bevor', 'avant que, avant de'], ['sobald', 'dès que'], ['während', 'pendant que'], ['bis', 'jusqu’à ce que']],
          'Ce sont des conjonctions de temps : elles ouvrent une subordonnée, donc le verbe conjugué va à la fin (renoviert wurde, entscheiden, sind, austauschen, fällt). Quand la subordonnée vient d’abord, la principale commence par son verbe.'),
        match('q4', bi('Aus welchem Wort kommt das Nomen? Ordnen Sie zu.', 'De quel mot vient ce nom ? Associez.'),
          [['die Mitteilung', 'mitteilen'], ['die Entscheidung', 'entscheiden'], ['die Möglichkeit', 'möglich'], ['die Sicherheit', 'sicher']],
          'Un verbe donne un nom en -ung (mitteilen → die Mitteilung) ; un adjectif donne un nom en -heit ou -keit (sicher → die Sicherheit, möglich → die Möglichkeit). Tous ces noms sont féminins et prennent -en au pluriel.'),
      ] },

    // 5 · Règle
    { id: 'b1-medien-regel', kind: 'lesson', title: 'À retenir : rapporter, situer dans le temps, former des noms', estimatedMinutes: 8,
      competences: ['lecture'],
      lesson: { description: `À RETENIR — rapporter ce que dit une source
• dass + affirmation : Die Stadt schreibt, dass das Bad am Mittwoch öffnet.
• ob + question fermée (oui ou non) : Ich weiß nicht, ob die Meldung stimmt.
• mot interrogatif + question ouverte : Kannst du mir sagen, wann das Fest beginnt?
• Dans les trois cas, virgule devant la subordonnée et verbe conjugué à la fin.
• laut + datif cite une source : laut der Stadt, laut Polizei, laut Mitteilung (souvent sans article).

LES SUBORDONNÉES DE TEMPS
• bevor (avant que, avant de) : Bevor ich etwas teile, prüfe ich die Quelle.
• während (pendant que) : Während die Arbeiten laufen, ist das Becken zu.
• seitdem ou seit (depuis que) : Seitdem ich die App habe, lese ich mehr Nachrichten.
• bis (jusqu’à ce que) : Warte, bis die Stadt es bestätigt.
• sobald (dès que) : Sobald ich mehr weiß, rufe ich dich an.
Avec seitdem, une action qui dure encore se met au présent, comme avec « depuis que ».

FORMER DES NOMS
• verbe → -ung : mitteilen → die Mitteilung, entscheiden → die Entscheidung, bestätigen → die Bestätigung
• adjectif → -heit : sicher → die Sicherheit, frei → die Freiheit
• adjectif en -ig, -lich, -bar → -keit : möglich → die Möglichkeit, glaubwürdig → die Glaubwürdigkeit
Ces noms sont toujours féminins, avec un pluriel en -en.

ATTENTION
• ob n’est pas wenn : les deux se traduisent par « si ». ob = question (Ich frage, ob er kommt) ; wenn = condition (Wenn er kommt, essen wir).
• bevor n’est pas vor : vor + nom (vor der Sitzung), bevor + verbe (bevor die Sitzung beginnt).
• Pas d’inversion après dass : Er sagt, dass der Markt umzieht (et non *dass der Markt zieht um*). Le verbe séparable se ressoude à la fin.
• laut sert pour une source extérieure. Pour son propre avis : meiner Meinung nach (et non *laut mir*).` } },

    // 6 · Grammaire : s'entraîner
    { id: 'b1-medien-grammatik', kind: 'exercise', title: 'S’entraîner : dass, ob, laut et les subordonnées de temps', estimatedMinutes: 14,
      competences: ['lecture', 'expression-ecrite'],
      lesson: { description: `${bi('Üben Sie dass, ob und laut, die Nebensätze mit bevor, seitdem, bis und sobald und die Nomen auf -ung, -heit und -keit.', 'Entraînez-vous avec dass, ob et laut, les subordonnées avec bevor, seitdem, bis et sobald et les noms en -ung, -heit et -keit.')}
${bi('Achten Sie immer auf das Verb am Ende des Nebensatzes.', 'Faites toujours attention au verbe à la fin de la subordonnée.')}` },
      questions: [
        choice('q1', bi('„Ich weiß nicht, … die Meldung stimmt.“ Welches Wort passt?', 'Quel mot convient ?'),
          [['dass'], ['ob', true], ['wenn']],
          'Ne pas savoir quelque chose, c’est une question ouverte de type oui ou non : ob. Dass affirmerait que la nouvelle est vraie ; wenn exprime une condition (« au cas où »).'),
        fill('q2', bi('Ergänzen Sie dass oder ob.', 'Complétez avec dass ou ob.'),
          'Die Stadt bestätigt, [[1]] das Bad am Mittwoch wieder öffnet. Viele fragen, [[2]] die Kurse stattfinden. Ich habe gelesen, [[3]] die Bibliothek länger offen ist. Weißt du, [[4]] das stimmt?',
          [['dass'], ['ob'], ['dass'], ['ob']],
          'Après bestätigen et lesen (une information affirmée) : dass. Après fragen et « Weißt du … ? » (une question fermée) : ob.'),
        order('q3', bi('Bilden Sie eine höfliche indirekte Frage.', 'Formez une question indirecte polie.'),
          [['Können', 'Sie', 'mir', 'sagen,', 'ob', 'der Kurs', 'am Montag', 'stattfindet?'], ['Können', 'Sie', 'mir', 'sagen,', 'ob', 'am Montag', 'der Kurs', 'stattfindet?']],
          '« Können Sie mir sagen, ob der Kurs am Montag stattfindet? » Dans la subordonnée avec ob, le verbe séparable se ressoude à la fin : stattfindet.'),
        order('q4', bi('Bilden Sie einen Satz mit „laut“.', 'Formez une phrase avec « laut ».'),
          [['Laut', 'der Stadt', 'ist', 'das kleine Becken', 'am Montag', 'geöffnet.'], ['Laut', 'der Stadt', 'ist', 'am Montag', 'das kleine Becken', 'geöffnet.']],
          '« Laut der Stadt » occupe la 1re position, puis vient le verbe ist. Le sujet et le complément de temps peuvent s’échanger ; le participe geöffnet reste à la fin.'),
        choice('q5', bi('„… du ein Foto teilst, prüf bitte die Quelle.“ Welches Wort passt?', 'Quel mot convient ?'),
          [['Bevor', true], ['Seitdem'], ['Sobald']],
          'On vérifie la source avant de partager : bevor. Sobald (dès que) placerait la vérification après le partage, trop tard ; seitdem (depuis que) ne convient pas à un conseil.'),
        fill('q6', bi('Ergänzen Sie bevor, seitdem, bis oder sobald.', 'Complétez avec bevor, seitdem, bis ou sobald.'),
          '[[1]] ich die App habe, lese ich jeden Morgen Nachrichten. Ich rufe dich an, [[2]] ich etwas Neues weiß. Warte bitte, [[3]] die Stadt die Meldung bestätigt. [[4]] ich etwas teile, lese ich den ganzen Artikel.',
          [['Seitdem', 'Seit'], ['sobald', 'wenn'], ['bis'], ['Bevor']],
          'Seitdem : depuis que j’ai l’appli (et ça continue, d’où le présent). Sobald : dès que j’en sais plus. Bis : jusqu’à ce que la ville confirme. Bevor : avant de partager. En tête de phrase, majuscule.'),
        fill('q7', bi('Bilden Sie das Nomen.', 'Formez le nom.'),
          'bestätigen → die [[1]] · möglich → die [[2]] · frei → die [[3]] · ehrlich → die [[4]]',
          [['Bestätigung'], ['Möglichkeit'], ['Freiheit'], ['Ehrlichkeit']],
          'Verbe → -ung (die Bestätigung). Adjectif en -lich → -keit (die Möglichkeit, die Ehrlichkeit). Adjectif court → -heit (die Freiheit). Majuscule et article féminin.'),
        choice('q8', bi('Welcher Satz gibt die Quelle richtig an?', 'Quelle phrase cite correctement la source ?'),
          [['Laut die Stadt bleibt das Bad offen.'], ['Laut der Stadt das Bad bleibt offen.'], ['Laut der Stadt bleibt das Bad am Montag offen.', true]],
          'Laut + datif : der Stadt. Le groupe « Laut der Stadt » compte comme 1er élément, donc le verbe bleibt vient juste après. La première phrase a un accusatif, la deuxième oublie l’inversion.'),
        order('q9', bi('Bilden Sie einen Satz.', 'Remettez les mots dans l’ordre.'),
          [['Sobald', 'die Arbeiten', 'fertig', 'sind,', 'öffnet', 'das große Becken', 'wieder.']],
          '« Sobald die Arbeiten fertig sind, öffnet das große Becken wieder. » Subordonnée d’abord (verbe sind à la fin), puis la principale commence par son verbe öffnet.'),
      ] },

    // 7 · Lexique
    { id: 'b1-medien-wortschatz', kind: 'exercise', title: 'Vocabulaire : sources, faits et rumeurs', estimatedMinutes: 12,
      competences: ['lecture', 'expression-ecrite'],
      lesson: { description: `${bi('Lernen Sie die Wörter der Medien in festen Verbindungen und mit ihrer Wortfamilie.', 'Apprenez les mots des médias dans leurs groupes figés et avec leur famille.')}
${bi('Hören Sie den Wortschatz des Moduls in der Wortliste.', 'Écoutez le vocabulaire du module dans le lexique.')}` },
      questions: [
        match('q1', bi('Welches Verb passt zu welchem Nomen? Ordnen Sie zu.', 'Quel verbe va avec quel nom ? Associez.'),
          [['eine Frage', 'stellen'], ['eine Entscheidung', 'treffen'], ['einen Artikel', 'veröffentlichen'], ['eine Quelle', 'angeben'], ['seine Meinung', 'äußern']],
          'Groupes figés : eine Frage stellen (poser une question), eine Entscheidung treffen (prendre une décision), einen Artikel veröffentlichen (publier un article), eine Quelle angeben (indiquer une source), seine Meinung äußern (exprimer son avis).'),
        fill('q2', bi('Ergänzen Sie das Nomen aus derselben Wortfamilie.', 'Complétez avec le nom de la même famille.'),
          'Die Stadt hat die Nachricht bestätigt: Es gibt eine offizielle [[1]]. Die Zeitung berichtet über das Bad: Der [[2]] ist sehr genau. Diese Quelle ist glaubwürdig: Ihre [[3]] ist hoch.',
          [['Bestätigung'], ['Bericht'], ['Glaubwürdigkeit']],
          'bestätigen → die Bestätigung (-ung) ; berichten → der Bericht (nom masculin sans suffixe) ; glaubwürdig → die Glaubwürdigkeit (-keit après -ig).'),
        choice('q3', bi('Sie wollen höflich nach der Quelle fragen. Was sagen Sie?', 'Vous voulez demander poliment la source. Que dites-vous ?'),
          [['Das ist doch Quatsch!'], ['Woher hast du diese Information?', true], ['Ich habe das auch gehört.']],
          '« Woher hast du diese Information? » demande la source sans accuser. « Das ist doch Quatsch » (n’importe quoi) est agressif ; « Ich habe das auch gehört » relaie la rumeur au lieu de la vérifier.'),
        choice('q4', bi('Sie sind nicht sicher. Welche Formulierung passt?', 'Vous n’êtes pas sûr. Quelle formulation convient ?'),
          [['Es ist bewiesen, dass das stimmt.'], ['Ganz klar, das ist richtig.'], ['Ich bin mir nicht sicher, ob das stimmt.', true]],
          'Pour exprimer un doute : « Ich bin mir nicht sicher, ob … » (avec ob et le verbe à la fin). Les deux autres phrases affirment une certitude.'),
        choice('q5', bi('„Angeblich schließt das Kino am Markt für immer.“ Was ist das?', 'De quoi s’agit-il ?'),
          [['ein Gerücht', true], ['eine Meinung'], ['eine Tatsache']],
          'Angeblich (soi-disant, paraît-il) signale une information non vérifiée : une rumeur. Une opinion exprimerait un jugement (ich finde …), un fait serait confirmé par une source.'),
        match('q6', bi('Was bedeutet das? Ordnen Sie die Erklärungen zu.', 'Que signifient ces mots ? Associez les définitions.'),
          [['die Quelle', 'woher eine Information kommt'], ['das Gerücht', 'eine Information, die niemand bestätigt hat'],
            ['die Meldung', 'eine kurze Nachricht in den Medien'], ['glaubwürdig', 'so, dass man es glauben kann']],
          'Définir un mot en allemand simple est utile pour la médiation. Die Quelle désigne aussi, au sens propre, la source d’une rivière.'),
        fill('q7', bi('Ergänzen Sie die Präposition.', 'Complétez avec la préposition.'),
          'Die Zeitung berichtet [[1]] die neue Bibliothek. Viele diskutieren [[2]] die Öffnungszeiten. Ich höre die Nachrichten morgens [[3]] Radio.',
          [['über'], ['über'], ['im']],
          'berichten über + accusatif, diskutieren über + accusatif : de quoi on parle. « im Radio » (in dem) : à la radio ; de même im Fernsehen, in der Zeitung.'),
      ] },

    // 8 · Répéter à voix haute
    { id: 'b1-medien-redemittel', kind: 'exercise', title: 'Répéter à voix haute : citer, douter, vérifier', estimatedMinutes: 9,
      competences: ['expression-orale'],
      lesson: { description: `${C.sprechen}
${bi('Hören Sie zuerst das Modell. Sprechen Sie dann den ganzen Satz ruhig und deutlich.', 'Écoutez d’abord le modèle. Dites ensuite toute la phrase calmement et distinctement.')}
${bi('Mit diesen Sätzen nennen Sie eine Quelle, drücken Zweifel aus und korrigieren eine Information.', 'Ces phrases servent à citer une source, à exprimer un doute et à corriger une information.')}` },
      questions: [
        speak('q1', 'Laut der Stadt bleibt nur das große Becken geschlossen.',
          '« nur » porte l’accent : c’est l’information qui corrige la rumeur. « geschlossen » : accent sur « SCHLOS », « o » bref.'),
        speak('q2', 'Ich weiß noch nicht, ob die Meldung stimmt.',
          'Petite pause à la virgule, puis « ob » ; le verbe « stimmt » termine la phrase. « Meldung » : « e » long, « ung » nasal sans le « g » français.'),
        speak('q3', 'Woher hast du diese Information?',
          'Question ouverte : la voix descend à la fin. « Woher » : accent sur « HER ». « Information » : accent sur « TION », prononcé « tsion ».'),
        speak('q4', 'Bevor ich etwas teile, prüfe ich die Quelle.',
          'Subordonnée puis inversion « prüfe ich ». « prüfe » : « ü » long, lèvres arrondies ; « Quelle » : « qu » se prononce « kv ».'),
        speak('q5', 'In der Mitteilung steht, dass die Kurse stattfinden.',
          '« stattfinden » en un mot à la fin, accent sur « STATT ». « Mitteilung » : accent sur « MIT ».'),
        speak('q6', 'Das ist nur ein Gerücht, das ist nicht bestätigt.',
          '« Gerücht » : accent sur « RÜCHT », « ch » doux comme dans « ich ». Accent de phrase sur « nur » et « nicht ».'),
      ] },

    // 9 · Second document : publication de quartier, avec dictées
    { id: 'b1-medien-lesen2', kind: 'exercise', title: 'Comprendre : une rumeur dans le groupe du quartier', estimatedMinutes: 15,
      competences: ['lecture', 'ecoute'],
      lesson: { description: `${bi('Lesen Sie die Beiträge in der Nachbarschaftsgruppe. Beantworten Sie dann die Fragen.', 'Lisez les publications du groupe de quartier, puis répondez aux questions.')}

STRATEGIE
[fr] Stratégie
${bi('Fragen Sie bei jedem Beitrag: Wer schreibt? Ist das eine Tatsache, eine Meinung oder ein Gerücht? Gibt es eine Quelle?', 'Pour chaque publication, demandez-vous : qui écrit ? est-ce un fait, une opinion ou une rumeur ? y a-t-il une source ?')}
${bi('Die letzten zwei Aufgaben sind Diktate: Schreiben Sie genau, was Sie hören.', 'Les deux dernières questions sont des dictées : écrivez exactement ce que vous entendez.')}

NACHBARSCHAFTSGRUPPE LINDENVIERTEL
Mia L. (Mo., 18:02): Hab gerade gehört, dass das Sommerfest am Samstag ausfällt. Angeblich wegen des Wetters. Schade!
Herr Okafor (Mo., 18:40): Woher weißt du das, Mia? Auf der Seite des Bürgervereins steht nichts davon. Gibt es dafür eine Quelle?
Bürgerverein Lindenviertel (Mo., 19:15): Liebe Nachbarinnen und Nachbarn, das Sommerfest findet statt! Wegen des Regens ziehen wir nur in die Turnhalle der Grundschule um. Beginn wie geplant um 15 Uhr.
Mia L. (Mo., 19:30): Oh, sorry! Da hatte ich etwas falsch verstanden. Danke für die Info, dann bis Samstag in der Turnhalle!` },
      placements: [{ media: 'b1-medien-lesen2-gruppe', caption: 'Nachbarschaftsgruppe Lindenviertel' }],
      questions: [
        choice('q1', bi('Was hat Mia zuerst geschrieben?', 'Qu’a écrit Mia en premier ?'),
          [['Das Fest findet in der Turnhalle statt.'], ['Das Fest fällt aus.', true], ['Das Fest beginnt später.']],
          'Mia : « Hab gerade gehört, dass das Sommerfest am Samstag ausfällt. » Elle l’a seulement entendu dire (gehört), sans source.'),
        choice('q2', bi('Welche Information ist offiziell bestätigt?', 'Quelle information est officiellement confirmée ?'),
          [['Das Fest fällt wegen des Wetters aus.'], ['Das Fest wird auf Sonntag verschoben.'], ['Das Fest findet um 15 Uhr in der Turnhalle statt.', true]],
          'L’association, organisatrice de la fête, écrit : « das Sommerfest findet statt … in die Turnhalle … Beginn wie geplant um 15 Uhr ». C’est la source officielle ; il n’est jamais question de dimanche.'),
        choice('q3', bi('Wie reagiert Herr Okafor?', 'Comment réagit M. Okafor ?'),
          [['Er fragt nach der Quelle.', true], ['Er teilt die Nachricht weiter.'], ['Er beschwert sich über das Wetter.']],
          '« Woher weißt du das, Mia? … Gibt es dafür eine Quelle? » Il vérifie avant de croire : le bon réflexe face à une rumeur.'),
        choice('q4', bi('Welches Wort zeigt, dass Mias Information unsicher war?', 'Quel mot montre que l’information de Mia était incertaine ?'),
          [['„gerade“'], ['„angeblich“', true], ['„Schade“']],
          'Angeblich (soi-disant) indique qu’on rapporte une information non vérifiée. Gerade (à l’instant) donne le moment, et Schade (dommage) un sentiment.'),
        dictation('q5', 'Bevor man eine Nachricht weiterleitet, sollte man die Quelle prüfen.',
          'Subordonnée avec bevor : verbe « weiterleitet » en un mot à la fin, puis virgule et inversion « sollte man ». Nachricht et Quelle : noms, donc majuscule.', 'sprecher'),
        dictation('q6', 'Laut Bürgerverein findet das Fest trotz des Regens in der Turnhalle statt.',
          'Laut sans article devant le nom de la source ; trotz + génitif (des Regens). Le verbe séparable stattfinden se coupe : « findet … statt ».', 'frau'),
      ] },

    // 10 · Vérifier
    { id: 'b1-medien-kontrolle', kind: 'exercise', title: 'Vérifier : s’informer et vérifier une information', estimatedMinutes: 14,
      competences: ['lecture', 'ecoute'],
      lesson: { description: `${bi('Hier wiederholen Sie das ganze Modul: Grammatik, Wörter und Hören.', 'Ici, vous révisez tout le module : grammaire, vocabulaire et écoute.')}
${bi('Für die Fragen 1 und 2 hören Sie eine kurze Meldung aus dem Lokalradio.', 'Pour les questions 1 et 2, écoutez une courte information de la radio locale.')}` },
      placements: [{ media: 'b1-medien-kontrolle-nachrichten', transcriptVisibility: 'after_answer' }],
      questions: [
        choice('q1', bi('Hören Sie die Meldung: Wo findet der Markt ab nächster Woche statt?', 'Écoutez l’information : où le marché a-t-il lieu à partir de la semaine prochaine ?'),
          [['auf dem Marktplatz'], ['auf dem Rathausplatz', true], ['vor dem Bahnhof']],
          '« dass der Wochenmarkt ab nächster Woche auf dem Rathausplatz stattfindet ». Le Marktplatz est cité, mais c’est là qu’on construit la fontaine.'),
        choice('q2', bi('Was ist noch offen?', 'Qu’est-ce qui n’est pas encore décidé ?'),
          [['ob der Markt danach auf den Marktplatz zurückkehrt', true], ['an welchen Tagen und wann der Markt geöffnet ist'], ['warum der Markt auf den Rathausplatz umzieht']],
          '« Ob der Markt danach … zurückkehrt, ist noch nicht entschieden. » Les horaires (7 h à 13 h) et la raison (la fontaine) sont connus.'),
        order('q3', bi('Bilden Sie einen Satz.', 'Remettez les mots dans l’ordre.'),
          [['Die Stadt', 'hat', 'bestätigt,', 'dass', 'der Markt', 'auf dem Rathausplatz', 'stattfindet.'],
            ['Die Stadt', 'hat', 'bestätigt,', 'dass', 'auf dem Rathausplatz', 'der Markt', 'stattfindet.']],
          '« Die Stadt hat bestätigt, dass der Markt auf dem Rathausplatz stattfindet. » Principale au parfait (hat … bestätigt), puis dass avec le verbe séparable ressoudé à la fin.'),
        fill('q4', bi('Ergänzen Sie ob und das Nomen von „entscheiden“.', 'Complétez avec ob et le nom formé sur « entscheiden ».'),
          'Ich weiß nicht, [[1]] die [[2]] schon gefallen ist.',
          [['ob'], ['Entscheidung']],
          'Ne pas savoir → question fermée → ob. entscheiden → die Entscheidung (-ung, féminin). « Eine Entscheidung fällt » : une décision est prise.'),
        choice('q5', bi('„… der Brunnen fertig ist, kann der Markt vielleicht zurückkommen.“ Welches Wort passt?', 'Quel mot convient ?'),
          [['Bevor'], ['Während'], ['Sobald', true]],
          'Le retour est possible dès que la fontaine est terminée : sobald. Bevor (avant que) contredit le sens, et während (pendant que) ne va pas avec un état achevé (fertig sein).'),
        choice('q6', bi('„Ich finde, der Rathausplatz ist viel schöner für den Markt.“ Was ist das?', 'De quoi s’agit-il ?'),
          [['eine Meinung', true], ['eine Tatsache'], ['ein Gerücht']],
          '« Ich finde, … » introduit un jugement personnel : une opinion. Elle n’est ni vraie ni fausse, contrairement à un fait ou à une rumeur.'),
        match('q7', bi('Welcher Satz passt zu welcher Absicht? Ordnen Sie zu.', 'Quelle phrase convient à quelle intention ? Associez.'),
          [['eine Quelle nennen', 'Laut der Stadt findet der Markt dienstags statt.'], ['Zweifel ausdrücken', 'Ich bin nicht sicher, ob das stimmt.'],
            ['nach der Quelle fragen', 'Woher weißt du das?'], ['eine Information korrigieren', 'Das stimmt so nicht: In der Mitteilung steht etwas anderes.']],
          'Les quatre gestes du thème : citer (laut), douter (ob), demander la source (woher), corriger poliment en renvoyant au texte officiel.'),
      ] },
  ],
};
