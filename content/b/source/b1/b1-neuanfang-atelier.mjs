// Module B1 n° 2 · atelier « Neuanfang » (lot R1). Se présenter à un nouveau groupe : modèle annoté (écrit et oral),
// réagir et relancer, médiation d'un courriel d'accueil (allemand → allemand), erreurs typiques, entraînement Lesen
// (richtig / falsch / steht nicht im Text), missions « Vorstellung an die neue Gruppe » et « Einen Wendepunkt erzählen ».
// Reprise réécrite du brouillon B1 V1 : message à David (document B), tâches writing et speaking, leçon « nachfragen »
// de b1-einstieg (content/b1-v1/source/partie1.mjs).
import { C, bi, choice, fill, order, speak, GRIDS } from '../../lib.mjs';

const rf = (id, statement, answer, explanation) => choice(id, `${statement} ${C.richtigFalsch}`,
  [['richtig', answer === 'r'], ['falsch', answer === 'f'], ['steht nicht im Text', answer === 'n']], explanation);

/** Son de situation d'une question à choix (réplique entendue, transcription après la réponse). */
const situation = (question) => ({ media: `b1-neuanfang-atelier-interaktion-${question}`, questionId: question, transcriptVisibility: 'after_answer' });

export default {
  id: 'b1-neuanfang-atelier',
  title: 'Atelier Neuanfang : se présenter à un nouveau groupe',
  objective: 'Se présenter par écrit à un nouveau groupe, raconter à l’oral un tournant de sa vie, réagir au récit des autres et relayer les informations d’un courriel d’accueil.',
  grammarFocus: ['praeteritum-perfekt', 'als-wenn'],
  sources: [
    'Textes, dialogues et exercices originaux LinguaCap.',
    'Tâches de production reprises et réécrites du brouillon B1 V1 (LinguaCap) : message après le premier cours, récit d’un nouveau départ.',
  ],

  vocabulary: [
    { word: 'sich vorstellen', partOfSpeech: 'verb', translation: 'se présenter',
      example: 'Darf ich mich kurz vorstellen?', note: 'séparable : vor|stellen · sich vorstellen (accusatif) : se présenter' },
    { word: 'mitmachen', partOfSpeech: 'verb', translation: 'participer, faire partie de',
      example: 'Ich möchte gern bei euch in der Theatergruppe mitmachen.', note: 'séparable : mit|machen · bei + datif' },
    { word: 'Mitglied', article: 'das', plural: 'Mitglieder', partOfSpeech: 'noun', translation: 'le membre',
      example: 'Wir freuen uns über neue Mitglieder.', note: 'neutre, même pour une personne : das Mitglied' },
    { word: 'Treffen', article: 'das', plural: 'Treffen', partOfSpeech: 'noun', translation: 'la rencontre, la réunion',
      example: 'Das erste Treffen ist am Donnerstag um 19 Uhr.', note: null },
    { word: 'Probe', article: 'die', plural: 'Proben', partOfSpeech: 'noun', translation: 'la répétition (théâtre, musique)',
      example: 'Die Probe beginnt heute im Raum 3.', note: 'proben : répéter (une pièce)' },
    { word: 'Bescheid sagen', partOfSpeech: 'expression', translation: 'prévenir, tenir au courant',
      example: 'Sag Malte bitte Bescheid, wenn du nicht kommen kannst.', note: 'jemandem (datif) Bescheid sagen' },
    { word: 'absagen', partOfSpeech: 'verb', translation: 'annuler, se décommander',
      example: 'Ich muss das Treffen am Donnerstag leider absagen.', note: 'séparable : ab|sagen · contraire : zusagen' },
    { word: 'zusagen', partOfSpeech: 'verb', translation: 'accepter (une offre, une invitation)',
      example: 'Kannst du bis Freitag zusagen?', note: 'séparable : zu|sagen' },
    { word: 'zögern', partOfSpeech: 'verb', translation: 'hésiter',
      example: 'Ich habe keinen Moment gezögert.', note: null },
    { word: 'sich trauen', partOfSpeech: 'verb', translation: 'oser',
      example: 'Am Anfang habe ich mich nicht getraut, Fragen zu stellen.', note: 'sich trauen + zu + infinitif' },
    { word: 'Grund', article: 'der', plural: 'Gründe', partOfSpeech: 'noun', translation: 'la raison',
      example: 'Der Grund für meinen Umzug war die Arbeit.', note: 'der Grund für + accusatif' },
    { word: 'im Nachhinein', partOfSpeech: 'expression', translation: 'avec le recul, après coup',
      example: 'Im Nachhinein war der Umzug die beste Entscheidung.', note: null },
    { word: 'Ich bin neu in …', partOfSpeech: 'expression', translation: 'Je suis nouveau / nouvelle dans …',
      example: 'Hallo zusammen, ich bin neu in der Laufgruppe.', note: 'in + datif : in der Gruppe, im Kurs' },
    { word: 'Ich freue mich darauf, …', partOfSpeech: 'expression', translation: 'Je me réjouis de …',
      example: 'Ich freue mich darauf, euch kennenzulernen.', note: 'sich freuen auf (accusatif) : darauf annonce la suite' },
    { word: 'Wie kam es dazu?', partOfSpeech: 'expression', translation: 'Comment en es-tu arrivé(e) là ?',
      example: 'Du hast gekündigt? Wie kam es dazu?', note: 'relance pour demander la raison' },
    { word: 'Erzähl mal!', partOfSpeech: 'expression', translation: 'Raconte !',
      example: 'Du warst ein Jahr in Kanada? Erzähl mal!', note: 'à quelqu’un qu’on tutoie ; vouvoiement : Erzählen Sie mal!' },
    { word: 'Das kann ich gut verstehen.', partOfSpeech: 'expression', translation: 'Je comprends bien.',
      example: 'Du hattest Heimweh? Das kann ich gut verstehen.', note: 'pour montrer de l’empathie' },
    { word: 'Viele Grüße', partOfSpeech: 'expression', translation: 'Amitiés, bien à vous (fin de message)',
      example: 'Viele Grüße und bis Donnerstag!', note: 'neutre : convient au tutoiement et au vouvoiement' },
  ],

  media: [
    { key: 'b1-neuanfang-atelier-modell-aufbau', kind: 'image', title: 'Plan du message de présentation',
      alt: 'Schéma en cinq étapes du message de Jonas : Begrüßung, Wer bin ich ?, Meine Geschichte, Warum diese Gruppe ?, Frage und Gruß.',
      image: { layout: 'route', title: 'Aufbau: eine Nachricht an die neue Gruppe', stepWidth: 160,
        steps: [
          { icon: 'hand', label: 'Begrüßung', sub: 'Hallo\nzusammen,' },
          { icon: 'user', label: 'Wer bin ich?', sub: 'Name, seit\nwann dabei' },
          { icon: 'route', label: 'Meine\nGeschichte', sub: 'vorher, als,\nseitdem' },
          { icon: 'heart', label: 'Warum diese\nGruppe?', sub: 'Ich freue\nmich darauf …' },
          { icon: 'message-circle', label: 'Frage\nund Gruß', sub: 'Viele Grüße' },
        ] } },
    { key: 'b1-neuanfang-atelier-modell-audio', kind: 'audio', title: 'Modèle oral : Samir raconte un tournant',
      script: [
        { voice: 'mann', name: 'Samir', text: 'Ich möchte euch von einem Wendepunkt in meinem Leben erzählen. Vor vier Jahren arbeitete ich als Buchhalter in einer großen Firma in Lille. Die Arbeit war sicher, aber ich saß den ganzen Tag allein vor dem Computer, und das machte mich nicht glücklich.' },
        { pause: 0.5 },
        { voice: 'mann', name: 'Samir', text: 'Dann kam ein Abend, den ich nie vergesse: Ein Freund hatte mich zu einem Kochkurs mitgenommen, und ich merkte plötzlich, wie viel Spaß mir das Kochen machte.' },
        { pause: 0.5 },
        { voice: 'mann', name: 'Samir', text: 'Nachdem ich ein paar Monate lang jeden Samstag gekocht hatte, traf ich eine Entscheidung: Ich kündigte und machte eine Ausbildung zum Koch, hier in Deutschland. Das war nicht leicht. Ich musste Deutsch lernen, und am Anfang verstand ich in der Küche fast nichts.' },
        { pause: 0.5 },
        { voice: 'mann', name: 'Samir', text: 'Aber seitdem habe ich viel gelernt. Heute arbeite ich in einem Restaurant in Köln, und ich bin sehr froh, dass ich damals den Mut hatte. Im Nachhinein war das die beste Entscheidung meines Lebens.' },
      ] },
    { key: 'b1-neuanfang-atelier-interaktion-q1', kind: 'audio', title: 'Réplique : Clara se présente',
      script: [{ voice: 'frau2', name: 'Clara', text: 'Hallo! Ich bin Clara. Ich bin auch neu hier, ich bin erst letzte Woche aus Lyon hergezogen.' }] },
    { key: 'b1-neuanfang-atelier-interaktion-q2', kind: 'audio', title: 'Réplique : Ben parle de ses débuts',
      script: [{ voice: 'mann2', name: 'Ben', text: 'Am Anfang war es echt schwer für mich. Ich kannte niemanden, und mein Deutsch war noch nicht so gut.' }] },
    { key: 'b1-neuanfang-atelier-interaktion-q3', kind: 'audio', title: 'Réplique : Nora a changé de métier',
      script: [{ voice: 'frau3', name: 'Nora', text: 'Vor zwei Jahren habe ich meinen Job im Büro gekündigt und eine Ausbildung als Krankenpflegerin angefangen.' }] },
    { key: 'b1-neuanfang-atelier-interaktion-q4', kind: 'audio', title: 'Réplique : Paul a oublié un prénom',
      script: [{ voice: 'mann3', name: 'Paul', text: 'Entschuldige, ich habe deinen Namen schon wieder vergessen. Wie heißt du noch mal?' }] },
  ],

  activities: [
    // 1 · Modèle de production annoté
    { id: 'b1-neuanfang-atelier-modell', kind: 'lesson', title: 'Découvrir : un message de présentation modèle', estimatedMinutes: 12,
      competences: ['lecture', 'ecoute'],
      lesson: { description: `${bi('Lesen Sie die Nachricht von Jonas an seine neue Theatergruppe. Hören Sie danach Samirs Bericht über einen Wendepunkt. Beide Texte sind Modelle für Ihre Missionen.', 'Lisez le message de Jonas à sa nouvelle troupe de théâtre. Écoutez ensuite le récit de Samir sur un tournant de sa vie. Ces deux textes sont des modèles pour vos missions.')}

NACHRICHT AN DIE THEATERGRUPPE
Hallo zusammen,
ich bin Jonas, 31, und seit dieser Woche neu in der Theatergruppe. Rosa hat mich gebeten, mich kurz vorzustellen.
Ich komme aus Belgien und bin vor vier Monaten nach Freiburg gezogen, weil ich hier eine Stelle als Krankenpfleger bekommen habe. Am Anfang war das nicht leicht: Ich kannte niemanden, und nach der Arbeit war ich oft allein. Als ich dann euer Plakat im Stadtteilzentrum sah, dachte ich sofort an meine alte Theatergruppe in Lüttich. Dort habe ich sechs Jahre lang gespielt.
Ich freue mich darauf, mit euch zu spielen und neue Leute kennenzulernen. Eine Frage habe ich noch: Muss man für die Proben schon Text auswendig lernen?
Viele Grüße und bis Donnerstag
Jonas

AUFBAU
[fr] Structure du message
• Begrüßung : « Hallo zusammen » ; on tutoie un groupe d’amateurs (ihr, euch, euer).
• Wer bin ich ? : nom, âge, depuis quand on est dans le groupe et pourquoi on écrit.
• Meine Geschichte : d’où l’on vient, le déménagement et sa raison (weil), les débuts difficiles (kannte, war), le déclic (Als ich … sah, …).
• Warum diese Gruppe ? : ce qu’on attend du groupe (Ich freue mich darauf, …).
• Frage und Gruß : une question concrète, puis « Viele Grüße und bis Donnerstag ».

REDEMITTEL
[fr] Formules par fonction
EINLEITEN
[fr] Commencer
• Hallo zusammen, ich bin … und seit … neu in … / Ich möchte mich kurz vorstellen.
ERZÄHLEN
[fr] Raconter dans l’ordre
• Vor vier Monaten … / Am Anfang … / Als ich …, … / Nachdem ich …, … / Seitdem …
BEGRÜNDEN
[fr] Justifier
• …, weil ich hier eine Stelle bekommen habe. / Deshalb habe ich … / Der Grund dafür war …
BEISPIEL
[fr] Donner un exemple
• Zum Beispiel … / Einmal ist mir Folgendes passiert: …
SCHLUSS
[fr] Conclure
• Ich freue mich darauf, euch kennenzulernen. / Eine Frage habe ich noch: … / Viele Grüße und bis …

SAMIRS BERICHT
[fr] Le récit de Samir
${bi('Hören Sie Samirs Bericht. Er erzählt in vier Schritten: vorher, der Wendepunkt, danach, heute.', 'Écoutez le récit de Samir. Il raconte en quatre temps : avant, le tournant, après, aujourd’hui.')}
• vorher : Vor vier Jahren arbeitete ich als Buchhalter …
• der Wendepunkt : Dann kam ein Abend, den ich nie vergesse …
• danach : Nachdem ich … gekocht hatte, traf ich eine Entscheidung …
• heute : Heute arbeite ich in einem Restaurant … Im Nachhinein war das die beste Entscheidung.` },
      placements: [
        { media: 'b1-neuanfang-atelier-modell-aufbau', caption: 'Aufbau der Nachricht' },
        { media: 'b1-neuanfang-atelier-modell-audio', transcriptVisibility: 'on_demand' },
      ] },

    // 2 · Réagir en situation
    { id: 'b1-neuanfang-atelier-interaktion', kind: 'exercise', title: 'S’entraîner : réagir et relancer la conversation', estimatedMinutes: 10,
      competences: ['ecoute', 'expression-orale'],
      lesson: { description: `${bi('Sie sind neu in einer Gruppe. Hören Sie, was die anderen sagen, und wählen Sie die passende Reaktion.', 'Vous êtes nouveau dans un groupe. Écoutez ce que disent les autres et choisissez la réplique qui convient.')}
${bi('Danach sprechen Sie drei Reaktionen nach.', 'Ensuite, répétez trois réactions à voix haute.')}

TIPP
[fr] Astuce
${bi('Eine gute Reaktion hat zwei Teile: Zeigen Sie, dass Sie zugehört haben, und stellen Sie dann eine Frage.', 'Une bonne réaction a deux parties : montrez que vous avez écouté, puis posez une question.')}
• Du warst also am Anfang allein. Wer hat dir dann geholfen?
• Das klingt spannend! Wie kam es dazu?` },
      placements: [situation('q1'), situation('q2'), situation('q3'), situation('q4')],
      questions: [
        choice('q1', bi('Hören Sie. Sie möchten Clara begrüßen und ihr eine Frage stellen. Was passt?', 'Écoutez. Vous voulez accueillir Clara et lui poser une question. Quelle réplique convient ?'),
          [['Herzlich willkommen! Wie gefällt es dir bisher hier?', true], ['Ich bin schon seit drei Jahren in der Gruppe.'], ['Lyon? Da war ich letzten Sommer im Urlaub.']],
          'Seule la première réplique accueille Clara (Herzlich willkommen) et lui pose une question sur ses débuts. Les deux autres parlent de soi : elles ne relancent pas la conversation sur elle.'),
        choice('q2', bi('Hören Sie. Wie zeigen Sie Verständnis und fragen weiter?', 'Écoutez. Comment montrez-vous de la compréhension tout en relançant ?'),
          [['Aha. Und was machst du beruflich?'], ['Das kann ich gut verstehen. Was hat dir dann geholfen?', true], ['Dein Deutsch ist doch super, das stimmt gar nicht.']],
          '« Das kann ich gut verstehen » reprend ce que Ben ressent, et « Was hat dir dann geholfen? » l’invite à poursuivre. Changer de sujet ignore son récit ; le contredire, même pour le complimenter, nie ce qu’il a vécu.'),
        choice('q3', bi('Hören Sie. Sie möchten nach dem Grund für Noras Entscheidung fragen. Was passt?', 'Écoutez. Vous voulez demander à Nora la raison de sa décision. Quelle réplique convient ?'),
          [['Spannend! Wann fängst du mit der Ausbildung an?'], ['Spannend! Wie lange arbeitest du schon in dem Büro?'], ['Spannend! Wie kam es zu dieser Entscheidung?', true]],
          'Nora a commencé sa formation il y a deux ans et a quitté le bureau : les deux premières questions montrent qu’on n’a pas écouté. « Wie kam es zu dieser Entscheidung? » demande la raison sans être indiscret.'),
        choice('q4', bi('Hören Sie. Was antworten Sie freundlich?', 'Écoutez. Que répondez-vous aimablement ?'),
          [['Kein Problem! Ich heiße Lea. Und du bist Paul, oder?', true], ['Ich komme aus Frankreich, aus Nantes.'], ['Nein, du hast meinen Namen nicht vergessen.']],
          'Paul demande votre prénom : on le redonne simplement (« Kein Problem! Ich heiße … ») et on vérifie le sien avec « …, oder? ». La provenance ne répond pas à la question, et la dernière réplique n’a pas de sens.'),
        speak('q5', 'Herzlich willkommen! Wie gefällt es dir bisher hier?',
          'Pour accueillir un nouveau venu. Intonation montante sur « willkommen », puis descendante à la fin de la question avec « wie ». Accent sur « will-KOM-men ».'),
        speak('q6', 'Das kann ich gut verstehen. Was hat dir dann geholfen?',
          'Montrer de l’empathie, puis relancer. Accent sur « ver-STE-hen » : le préfixe ver- n’est jamais accentué. Dans « geholfen », le h s’entend.'),
        speak('q7', 'Spannend! Wie kam es zu dieser Entscheidung?',
          'Relance pour demander une raison. « Entscheidung » : accent sur « SCHEI », et le ei se prononce [aï]. Le z de « zu » se dit [ts].'),
      ] },

    // 3 · Médiation (allemand → allemand)
    { id: 'b1-neuanfang-atelier-mediation', kind: 'exercise', title: 'Médiation : informer une nouvelle venue', estimatedMinutes: 15,
      competences: ['lecture', 'expression-ecrite'],
      lesson: { description: `${bi('Situation: Ihre Mitbewohnerin Sofia möchte auch in der Theatergruppe mitmachen. Sie hat die E-Mail nicht bekommen und bittet Sie um Hilfe.', 'Situation : votre colocataire Sofia veut elle aussi rejoindre la troupe de théâtre. Elle n’a pas reçu le courriel et vous demande de l’aide.')}
${bi('Lesen Sie die E-Mail. Machen Sie dann Notizen für Sofia und beantworten Sie ihre Fragen: kurz, einfach und auf Deutsch.', 'Lisez le courriel. Prenez ensuite des notes pour Sofia et répondez à ses questions : brièvement, simplement et en allemand.')}

STRATEGIE
[fr] Stratégie
${bi('Was muss Sofia wissen? Suchen Sie nur das Wichtigste: Wann? Wo? Was mitbringen? Was kostet es? Wen informieren?', 'Que doit savoir Sofia ? Ne cherchez que l’essentiel : quand ? où ? quoi apporter ? combien ? qui prévenir ?')}

BETREFF: WILLKOMMEN BEI „BÜHNE FREI“
Liebe neue Mitglieder,
schön, dass ihr dabei seid! Unser erstes Treffen nach der Sommerpause findet am Donnerstag, dem 12. September, um 19 Uhr statt. Wir proben wie immer im Stadtteilzentrum in der Gartenstraße 8, aber diesmal nicht im großen Saal, sondern im Raum 3 im ersten Stock, weil der Saal renoviert wird.
Bitte bringt bequeme Kleidung und Hausschuhe oder dicke Socken mit, denn wir arbeiten viel auf dem Boden. Getränke gibt es vor Ort, Snacks sind immer willkommen.
Der Mitgliedsbeitrag beträgt 5 Euro im Monat. Ihr zahlt ihn aber erst ab Oktober: Die ersten zwei Treffen sind zum Kennenlernen kostenlos.
Wer am 12. September nicht kann, sagt bitte bis Dienstag Malte in unserer Chatgruppe Bescheid. Dann schicken wir euch die Texte für das neue Stück.
Wir freuen uns auf euch!
Herzliche Grüße
Rosa und Malte` },
      questions: [
        fill('q1', bi('Ergänzen Sie die Notizen für Sofia.', 'Complétez les notes pour Sofia.'),
          'Erstes Treffen: Donnerstag, [[1]] September, 19 Uhr. Ort: Stadtteilzentrum, Raum [[2]]. Mitbringen: bequeme Kleidung und [[3]]. Kosten: 5 Euro im Monat, aber erst ab [[4]]. Wer nicht kommen kann, sagt [[5]] Bescheid.',
          [['12.', '12', 'zwölften'], ['3', 'drei'], ['Hausschuhe', 'dicke Socken', 'Hausschuhe oder dicke Socken', 'Socken'], ['Oktober'], ['Malte']],
          'Toutes les informations utiles sont dans le courriel : le jeudi 12 septembre, la salle 3 (et non la grande salle, en travaux), des chaussons ou de grosses chaussettes, la cotisation à partir d’octobre et Malte à prévenir avant mardi.'),
        choice('q2', bi('Sofia fragt: „Muss ich beim ersten Treffen schon bezahlen?“ Was antworten Sie?', 'Sofia demande : « Est-ce que je dois déjà payer à la première rencontre ? » Que répondez-vous ?'),
          [['Ja, 5 Euro, und zwar bar.'], ['Nein, die ersten zwei Treffen sind kostenlos.', true], ['Nein, die Gruppe ist immer kostenlos.']],
          'Le courriel précise : « Die ersten zwei Treffen sind zum Kennenlernen kostenlos » et la cotisation de 5 euros n’est due qu’à partir d’octobre. Le groupe n’est donc pas gratuit pour toujours.'),
        choice('q3', bi('Sofia hat am 12. September vielleicht keine Zeit. Was ist für sie besonders wichtig?', 'Sofia ne sera peut-être pas libre le 12 septembre. Qu’est-ce qui est particulièrement important pour elle ?'),
          [['Sie muss Malte bis Dienstag Bescheid sagen, dann bekommt sie die Texte.', true], ['Sie kann einfach eine Woche später kommen, ohne etwas zu sagen.'], ['Sie muss Rosa eine E-Mail schreiben.']],
          'Le courriel demande de prévenir Malte avant mardi, dans le groupe de discussion ; en échange, on reçoit les textes de la nouvelle pièce. Rosa n’est pas la personne à contacter, et venir sans prévenir ferait manquer les textes.'),
        choice('q4', bi('Warum trifft sich die Gruppe diesmal nicht im großen Saal?', 'Pourquoi le groupe ne se retrouve-t-il pas dans la grande salle cette fois ?'),
          [['Weil die Gruppe zu groß ist.'], ['Weil im Saal ein Konzert stattfindet.'], ['Weil der Saal renoviert wird.', true]],
          '« … weil der Saal renoviert wird » : la grande salle est en travaux. Le courriel ne parle ni de concert ni de la taille du groupe.'),
        order('q5', bi('Erklären Sie Sofia den neuen Ort. Bilden Sie einen Satz.', 'Expliquez à Sofia le nouveau lieu. Remettez les mots dans l’ordre.'),
          [['Wir', 'proben', 'im Raum 3,', 'weil', 'der Saal', 'renoviert', 'wird.']],
          'Principale d’abord (Wir proben im Raum 3), puis la subordonnée avec weil : le verbe conjugué wird va tout à la fin, après le participe renoviert. C’est la reformulation la plus simple de la phrase du courriel.'),
        choice('q6', bi('Welche Nachricht an Sofia gibt die E-Mail richtig wieder?', 'Quel message à Sofia restitue correctement le courriel ?'),
          [['Es geht am 12. um 19 Uhr los, im Saal. Bring etwas zu trinken mit!'], ['Es geht am 12. um 19 Uhr los, im Raum 3. Bring bequeme Sachen und dicke Socken mit!', true],
            ['Es geht am Dienstag um 19 Uhr los, im Raum 3. Du musst gleich 5 Euro bezahlen.']],
          'Le deuxième message reprend la date, l’heure, la salle 3 et ce qu’il faut apporter. Le premier se trompe de salle et demande d’apporter à boire (les boissons sont fournies) ; le troisième confond la date limite (mardi) avec la rencontre et la cotisation.'),
      ] },

    // 4 · Erreurs typiques
    { id: 'b1-neuanfang-atelier-korrektur', kind: 'exercise', title: 'Corriger : les erreurs fréquentes dans un récit', estimatedMinutes: 10,
      competences: ['lecture', 'expression-ecrite'],
      lesson: { description: `${bi('Diese Fehler machen viele Französischsprachige. Wählen Sie die richtige Form oder ergänzen Sie.', 'Ces erreurs sont fréquentes chez les francophones. Choisissez la bonne forme ou complétez.')}
${bi('Lesen Sie danach jede Erklärung genau: Sie hilft Ihnen bei der Mission.', 'Lisez ensuite attentivement chaque explication : elle vous aidera pour la mission.')}` },
      questions: [
        choice('q1', bi('Welcher Satz ist richtig?', 'Quelle phrase est correcte ?'),
          [['Letztes Jahr ich bin nach Bremen gezogen.'], ['Letztes Jahr bin ich nach Bremen gezogen.', true], ['Letztes Jahr ich nach Bremen gezogen bin.']],
          'Dans une principale, le verbe conjugué est en 2e position. Si la phrase commence par un complément (Letztes Jahr), le sujet passe après le verbe : bin ich. Le français « L’an dernier, je … » pousse à l’erreur de la première phrase.'),
        fill('q2', bi('Korrigieren Sie den Fehler: „Ich habe vor drei Monaten umgezogen.“', 'Corrigez l’erreur : « Ich habe vor drei Monaten umgezogen. »'),
          'Ich [[1]] vor drei Monaten umgezogen.', [['bin']],
          'umziehen (déménager) exprime un changement de lieu : Perfekt avec sein, donc ich bin umgezogen. Le participe était juste (verbe fort séparable : um-ge-zogen) ; seul l’auxiliaire haben était faux.'),
        choice('q3', bi('Welches Wort passt? „… ich in Hamburg ankam, regnete es.“', 'Quel mot convient ? « Quand je suis arrivé à Hambourg, il pleuvait. »'),
          [['Wann'], ['Wenn'], ['Als', true]],
          'Le français « quand » a trois équivalents. Fait unique au passé : als. Wenn : chaque fois (ou une condition). Wann : seulement dans une question. L’arrivée à Hambourg est un fait unique.'),
        fill('q4', bi('Ergänzen Sie das Verb „wohnen“ in der richtigen Zeitform.', 'Complétez avec « wohnen » au bon temps : « J’habite à Fribourg depuis deux ans. »'),
          'Ich [[1]] seit zwei Jahren in Freiburg.', [['wohne']],
          'Avec seit, une situation qui dure encore se dit au présent, comme en français : Ich wohne seit zwei Jahren hier. « Ich habe … gewohnt » signifierait que ce n’est plus le cas.'),
        fill('q5', bi('Korrigieren Sie den Fehler: „Nachdem ich die Prüfung bestanden habe, suchte ich eine Stelle.“', 'Corrigez l’erreur : « Nachdem ich die Prüfung bestanden habe, suchte ich eine Stelle. »'),
          'Nachdem ich die Prüfung bestanden [[1]], suchte ich eine Stelle.', [['hatte']],
          'La principale est au Präteritum (suchte) : l’action antérieure, introduite par nachdem, passe au Plusquamperfekt, avec l’auxiliaire au Präteritum : hatte bestanden. « habe bestanden » (Perfekt) mélange les temps. La principale commence bien par son verbe : suchte ich.'),
        fill('q6', bi('Ergänzen Sie das passende Verb im Perfekt.', 'Complétez avec le verbe qui convient au Perfekt : « Après la formation, je suis devenu infirmier. »'),
          'Nach der Ausbildung bin ich Krankenpfleger [[1]].', [['geworden']],
          '« devenir » se dit werden : ich bin … geworden (Perfekt avec sein). Faux ami : bekommen veut dire « recevoir », jamais « devenir ».'),
        choice('q7', bi('Sie schreiben an Ihre neue Laufgruppe. Alle duzen sich. Wie beginnen Sie?', 'Vous écrivez à votre nouveau groupe de course à pied. Tout le monde se tutoie. Comment commencez-vous ?'),
          [['Sehr geehrte Damen und Herren,'], ['Hallo zusammen,', true], ['Liebe Frau Hartmann,']],
          '« Hallo zusammen » salue tout un groupe qu’on tutoie. « Sehr geehrte Damen und Herren » est réservé aux courriers formels, et « Liebe Frau Hartmann » s’adresse à une seule personne qu’on vouvoie.'),
      ] },

    // 5 · Entraînement au format : Lesen
    { id: 'b1-neuanfang-atelier-pruefung', kind: 'exercise', title: 'Entraînement à l’examen : lire un récit personnel', estimatedMinutes: 20,
      competences: ['lecture'],
      lesson: { description: `PRÜFUNGSTRAINING: LESEN
[fr] Entraînement à l’examen : lecture
${bi('Zeit: 12 Minuten. Lesen Sie den Text und die Aussagen 1 bis 6. Ist die Aussage richtig oder falsch, oder steht das nicht im Text?', 'Durée : 12 minutes. Lisez le texte et les affirmations 1 à 6. Chaque affirmation est-elle vraie ou fausse, ou le texte n’en dit-il rien ?')}

STRATEGIE
[fr] Stratégie
${bi('Lesen Sie zuerst die Aussagen und merken Sie sich die Schlüsselwörter.', 'Lisez d’abord les affirmations et retenez les mots-clés.')}
${bi('Die Aussagen folgen meistens der Reihenfolge des Textes.', 'Les affirmations suivent le plus souvent l’ordre du texte.')}
${bi('Vorsicht bei Wörtern wie „immer“, „nie“ oder „alle“: Prüfen Sie genau.', 'Méfiez-vous des mots comme « toujours », « jamais » ou « tous » : vérifiez précisément.')}
${bi('„Falsch“ heißt: Der Text sagt etwas anderes. „Steht nicht im Text“ heißt: Der Text sagt dazu nichts.', '« Faux » : le texte dit autre chose. « Non mentionné » : le texte n’en dit rien.')}

VOM SCHREIBTISCH IN DEN GARTEN
Ein Beitrag von Heike, 46, aus Kassel

Zwanzig Jahre lang saß ich jeden Tag von acht bis fünf in einem Versicherungsbüro. Ich verdiente gut, meine Kolleginnen waren nett, und trotzdem war ich nicht wirklich zufrieden. Wenn ich abends nach Hause kam, ging ich als Erstes in meinen kleinen Garten. Dort konnte ich stundenlang Pflanzen umsetzen, Gemüse ernten oder einfach nur Unkraut zupfen. Das war meine Art, mich zu erholen.

Vor drei Jahren hatte unsere Firma große Probleme, und viele Stellen wurden gestrichen, auch meine. Am Anfang war ich schockiert. Ich hatte keine Ahnung, was ich jetzt machen sollte. Aber nachdem der erste Schreck vorbei war, sprach ich lange mit meinem Mann. Er fragte mich: „Was machst du eigentlich am liebsten?“ Die Antwort war einfach.

Mit 43 Jahren begann ich eine Ausbildung zur Gärtnerin. In meiner Klasse waren fast alle zwanzig Jahre jünger als ich. Die Arbeit war körperlich hart, und im ersten Winter hatte ich oft kalte Hände und Rückenschmerzen. Mehr als einmal wollte ich aufhören. Meine Mitschüler haben mich aber immer wieder motiviert, und im letzten Juli habe ich die Prüfung bestanden.

Heute arbeite ich in einer Gärtnerei am Stadtrand. Ich verdiene weniger als früher, aber ich bin jeden Tag an der frischen Luft und sehe am Abend, was ich geschafft habe. Meine alten Kolleginnen besuchen mich manchmal und kaufen Blumen bei mir. Sie sagen, ich sehe zehn Jahre jünger aus. Ob das stimmt, weiß ich nicht. Aber eines weiß ich: Ich habe meinen Neuanfang nie bereut.` },
      questions: [
        rf('q1', 'Im Versicherungsbüro hatte Heike unfreundliche Kolleginnen.', 'f',
          'Faux : « meine Kolleginnen waren nett ». Heike n’était pas satisfaite malgré de bonnes conditions (« trotzdem war ich nicht wirklich zufrieden »).'),
        rf('q2', 'Heike hat schon vor ihrer Ausbildung gern im Garten gearbeitet.', 'r',
          'Vrai : le soir, elle allait d’abord dans son jardin et y passait des heures ; c’était sa manière de se détendre. Wenn + Präteritum décrit cette habitude.'),
        rf('q3', 'Heike hat ihre Stelle selbst gekündigt.', 'f',
          'Faux : l’entreprise avait de gros problèmes et « viele Stellen wurden gestrichen, auch meine » : son poste a été supprimé. Elle n’a pas démissionné.'),
        rf('q4', 'Heikes Mann hat auch eine neue Ausbildung begonnen.', 'n',
          'Le mari de Heike lui pose une question décisive, mais le texte ne dit rien de sa propre vie professionnelle : non mentionné.'),
        rf('q5', 'Während der Ausbildung wollte Heike manchmal aufgeben.', 'r',
          'Vrai : « Mehr als einmal wollte ich aufhören. » aufhören et aufgeben veulent dire ici la même chose : arrêter, abandonner. Ses camarades l’ont motivée à continuer.'),
        rf('q6', 'Heike möchte später eine eigene Gärtnerei eröffnen.', 'n',
          'Heike travaille aujourd’hui dans une jardinerie, mais elle ne parle d’aucun projet d’ouvrir la sienne : non mentionné. Attention à ne pas compléter le texte avec ce qui semble logique.'),
      ] },

    // 6 · Mission écrite
    { id: 'b1-neuanfang-atelier-schreiben', kind: 'mission', title: 'Mission : se présenter au nouveau groupe', estimatedMinutes: 25,
      competences: ['expression-ecrite'],
      lesson: { description: `SITUATION
[fr] Situation
${bi('Sie sind neu in einer Gruppe: Theater, Chor, Sport oder Sprachcafé, wie Sie möchten. Die Leiterin bittet alle neuen Mitglieder, sich in der Chatgruppe kurz vorzustellen.', 'Vous êtes nouveau dans un groupe : théâtre, chorale, sport ou café linguistique, au choix. La responsable demande à tous les nouveaux membres de se présenter brièvement dans la discussion du groupe.')}

AUFGABE
[fr] Consigne
${bi('Schreiben Sie eine Nachricht an die Gruppe (90 bis 130 Wörter).', 'Écrivez un message au groupe (90 à 130 mots).')}
• ${bi('Wer sind Sie, und seit wann sind Sie in der Stadt oder in der Gruppe?', 'Qui êtes-vous, et depuis quand êtes-vous dans la ville ou dans le groupe ?')}
• ${bi('Erzählen Sie von einem Neuanfang in Ihrem Leben: Was war vorher, was ist dann passiert?', 'Racontez un nouveau départ dans votre vie : qu’y avait-il avant, que s’est-il passé ensuite ?')}
• ${bi('Warum möchten Sie in dieser Gruppe mitmachen?', 'Pourquoi voulez-vous participer à ce groupe ?')}
• ${bi('Stellen Sie der Gruppe eine Frage.', 'Posez une question au groupe.')}

TIPP
[fr] Astuce
${bi('Nehmen Sie das Modell vom Anfang des Moduls: Begrüßung, Ihre Geschichte, Ihre Erwartungen, eine Frage, ein Gruß.', 'Reprenez le modèle du début du module : salutation, votre histoire, vos attentes, une question, une formule finale.')}
${bi('Erzählen Sie im Präteritum oder im Perfekt und verbinden Sie die Etappen mit als, nachdem und seitdem.', 'Racontez au Präteritum ou au Perfekt et reliez les étapes avec als, nachdem et seitdem.')}
${bi('Sie schreiben an eine Gruppe, die sich duzt: ihr, euch, euer.', 'Vous écrivez à un groupe qui se tutoie : ihr, euch, euer.')}` },
      mission: {
        oral: null,
        written: { prompt: bi('Schreiben Sie Ihre Vorstellung an die neue Gruppe (90 bis 130 Wörter): wer Sie sind, Ihr Neuanfang, warum diese Gruppe, eine Frage.', 'Écrivez votre présentation au nouveau groupe (90 à 130 mots) : qui vous êtes, votre nouveau départ, pourquoi ce groupe, une question.'),
          maxChars: 1200, minWords: 90 },
        checklist: [
          bi('Ich begrüße die Gruppe und duze alle: Hallo zusammen, ihr, euch.', 'Je salue le groupe et je tutoie tout le monde.'),
          bi('Ich sage, wer ich bin und seit wann ich hier bin.', 'Je dis qui je suis et depuis quand je suis là.'),
          bi('Ich erzähle meinen Neuanfang der Reihe nach, mit als, nachdem oder seitdem.', 'Je raconte mon nouveau départ dans l’ordre.'),
          bi('Ich erkläre mit weil oder deshalb, warum ich mitmachen möchte.', 'J’explique pourquoi je veux participer.'),
          bi('Ich stelle der Gruppe eine Frage und ende mit einem Gruß: Viele Grüße.', 'Je pose une question au groupe et je termine par une formule.'),
        ],
        criteria: [
          { ...GRIDS.b1.schreiben[0], label: 'Tâche : présentation, nouveau départ, motivation et question au groupe ; tutoiement (ihr, euch) respecté' },
          ...GRIDS.b1.schreiben.slice(1),
        ] } },

    // 7 · Mission orale
    { id: 'b1-neuanfang-atelier-sprechen', kind: 'mission', title: 'Mission : raconter un tournant de sa vie', estimatedMinutes: 20,
      competences: ['expression-orale'],
      lesson: { description: `SITUATION
[fr] Situation
${bi('Im Deutschkurs erzählt jede Person von einem Wendepunkt in ihrem Leben. Sie nehmen Ihre Geschichte auf, etwa zwei Minuten lang.', 'Au cours d’allemand, chacun raconte un tournant de sa vie. Vous enregistrez votre récit, environ deux minutes.')}

AUFGABE
[fr] Consigne
• ${bi('Wie war Ihr Leben vorher?', 'Comment était votre vie avant ?')}
• ${bi('Was ist passiert? Was war der Wendepunkt?', 'Que s’est-il passé ? Quel a été le tournant ?')}
• ${bi('Was war danach schwierig, und was hat Ihnen geholfen?', 'Qu’est-ce qui a été difficile ensuite, et qu’est-ce qui vous a aidé ?')}
• ${bi('Wie geht es Ihnen heute damit?', 'Où en êtes-vous aujourd’hui ?')}

VORBEREITUNG
[fr] Préparation
${bi('Überlegen Sie sich fünf Stichwörter, keine ganzen Sätze. Hören Sie noch einmal Samirs Bericht.', 'Préparez mentalement cinq mots-clés, pas de phrases entières. Réécoutez le récit de Samir.')}
${bi('Sprechen Sie frei und verbinden Sie die Etappen: vorher, als, nachdem, seitdem, heute.', 'Parlez librement et reliez les étapes : vorher, als, nachdem, seitdem, heute.')}` },
      placements: [{ media: 'b1-neuanfang-atelier-modell-audio', transcriptVisibility: 'on_demand' }],
      mission: {
        oral: { prompt: bi('Erzählen Sie von einem Wendepunkt in Ihrem Leben: vorher, der Wendepunkt, danach, heute (etwa zwei Minuten).', 'Racontez un tournant de votre vie : avant, le tournant, après, aujourd’hui (environ deux minutes).'),
          maxSeconds: 120 },
        written: null,
        checklist: [
          bi('Ich beschreibe im Präteritum oder im Perfekt, wie es vorher war: damals, vorher.', 'Je présente au passé ma situation de départ.'),
          bi('Ich erzähle den Wendepunkt mit als oder nachdem; das Verb steht am Ende.', 'Je raconte le tournant ; dans la subordonnée, le verbe est à la fin.'),
          bi('Ich sage, was schwierig war und was mir geholfen hat.', 'Je dis ce qui a été difficile et ce qui m’a aidé.'),
          bi('Ich ende in der Gegenwart: Wie geht es mir heute? (seitdem, heute)', 'Je termine au présent : où j’en suis aujourd’hui.'),
          bi('Ich spreche frei mit Stichwörtern und lese keinen Text vor.', 'Je parle librement à partir de mots-clés, sans lire.'),
        ],
        criteria: [
          { ...GRIDS.b1.sprechen[0], label: 'Tâche : avant, tournant, après et aujourd’hui sont racontés en deux minutes environ' },
          ...GRIDS.b1.sprechen.slice(1),
        ] } },

    // 8 · Faire le point
    { id: 'b1-neuanfang-atelier-bilan', kind: 'lesson', title: 'Faire le point : Neuanfang', estimatedMinutes: 6,
      competences: ['lecture'],
      lesson: { description: `FAIRE LE POINT
${bi('Was können Sie jetzt? Lesen Sie die Sätze und prüfen Sie sich selbst.', 'Que savez-vous faire maintenant ? Lisez les phrases et évaluez-vous.')}
• ${bi('Ich kann eine wichtige Etappe in meinem Leben der Reihe nach erzählen.', 'Je peux raconter dans l’ordre une étape importante de ma vie.')}
• ${bi('Ich kann sagen, wann etwas passiert ist: als, nachdem, seitdem.', 'Je peux situer les moments d’un récit : als, nachdem, seitdem.')}
• ${bi('Ich kann auf die Geschichte von anderen reagieren und nachfragen.', 'Je peux réagir au récit de quelqu’un et poser des questions.')}
• ${bi('Ich kann mich einer neuen Gruppe schriftlich vorstellen.', 'Je peux me présenter par écrit à un nouveau groupe.')}
• ${bi('Ich kann die wichtigen Informationen aus einer E-Mail für eine andere Person notieren.', 'Je peux noter pour une autre personne les informations importantes d’un courriel.')}

STRATÉGIES À GARDER
• Lecture : d’abord le titre et la première phrase de chaque paragraphe, puis le détail ; « steht nicht im Text » quand le texte n’en dit rien.
• Écoute : une première écoute globale (qui ? où ?), une deuxième écoute avec des mots-clés.
• Production : un plan simple (avant, tournant, après, aujourd’hui) et des mots de liaison temporels.
• Médiation : ne transmettre que ce dont la personne a besoin, en phrases courtes.

À REVOIR SI BESOIN
• Le Präteritum des verbes forts : exercice « S’entraîner : Präteritum, Plusquamperfekt, als ou wenn » du module Neuanfang.
• als, wenn ou wann : leçon « Retenir » du module Neuanfang et exercice « Corriger » de cet atelier.
• Le vocabulaire : der Umzug, sich eingewöhnen, Anschluss finden, Heimweh haben, eine Entscheidung treffen, Bescheid sagen (lexique sonore des deux modules).` } },
  ],
};
