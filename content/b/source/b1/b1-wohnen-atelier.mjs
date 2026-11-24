// Module B1 n° 6 · atelier « Wohnen » (lot R1). Signaler un problème et proposer un accord : courriel modèle annoté à la
// régie et négociation modèle entre voisins, réagir poliment, médiation (simplifier trois règles d'un règlement pour un
// voisin débutant), erreurs typiques, entraînement Lesen (règlement, a/b/c), missions « E-Mail an die Hausverwaltung :
// Problem und Vorschlag » et « Mit dem Nachbarn eine Lösung aushandeln ».
// Reprise réécrite du brouillon B1 V1 : tâches « Écrire au sujet d’un espace commun » et « Négocier un arrangement avec
// un voisin », leçons « signaler un problème » et « malentendu » (content/b1-v1/source/partie1.mjs › b1-wohnen).
import { C, bi, choice, fill, order, speak, GRIDS } from '../../lib.mjs';

/** Son de situation d'une question à choix (réplique entendue, transcription après la réponse). */
const situation = (question) => ({ media: `b1-wohnen-atelier-interaktion-${question}`, questionId: question, transcriptVisibility: 'after_answer' });

export default {
  id: 'b1-wohnen-atelier',
  title: 'Wohnen, atelier : signaler un problème et proposer un accord',
  objective: 'Écrire à la régie pour signaler un problème et proposer une solution, négocier un arrangement avec un voisin, réagir poliment et expliquer simplement un règlement à quelqu’un qui débute.',
  grammarFocus: ['relativsaetze', 'wechselpraepositionen'],
  sources: [
    'Textes, dialogues et exercices originaux LinguaCap.',
    'Tâches de production reprises et réécrites du brouillon B1 V1 (LinguaCap) : écrire au sujet d’un espace commun, négocier un arrangement avec un voisin.',
  ],

  vocabulary: [
    { word: 'Sehr geehrte Damen und Herren', partOfSpeech: 'expression', translation: 'Madame, Monsieur (formule d’appel)',
      example: 'Sehr geehrte Damen und Herren, ich wohne seit Mai in der Lindenstraße 12.', note: 'quand on ne connaît pas le nom du destinataire' },
    { word: 'Mit freundlichen Grüßen', partOfSpeech: 'expression', translation: 'Cordialement, veuillez agréer… (formule finale)',
      example: 'Ich beende die E-Mail mit „Mit freundlichen Grüßen“ und meinem Namen.', note: 'formule finale d’un courriel formel, sans virgule après' },
    { word: 'sich wenden', partOfSpeech: 'verb', translation: 's’adresser',
      example: 'Ich wende mich an Sie, weil die Heizung nicht funktioniert.', note: 'sich an + accusatif wenden' },
    { word: 'zuständig', partOfSpeech: 'adjective', translation: 'compétent, responsable (de)',
      example: 'Wer ist für die Reparatur zuständig?', note: 'für + accusatif' },
    { word: 'Heizung', article: 'die', plural: 'Heizungen', partOfSpeech: 'noun', translation: 'le chauffage',
      example: 'Seit Montag funktioniert die Heizung im Bad nicht.', note: null },
    { word: 'Wasserhahn', article: 'der', plural: 'Wasserhähne', partOfSpeech: 'noun', translation: 'le robinet',
      example: 'Der Wasserhahn in der Küche tropft.', note: null },
    { word: 'tropfen', partOfSpeech: 'verb', translation: 'goutter, fuir',
      example: 'Der Wasserhahn tropft seit drei Tagen.', note: null },
    { word: 'Schimmel', article: 'der', plural: null, partOfSpeech: 'noun', translation: 'la moisissure',
      example: 'Im Bad ist Schimmel an der Wand.', note: 'pas de pluriel' },
    { word: 'beheben', partOfSpeech: 'verb', translation: 'réparer, remédier à (un problème)',
      example: 'Könnten Sie das Problem bitte bald beheben?', note: 'behob, hat behoben' },
    { word: 'dringend', partOfSpeech: 'adjective', translation: 'urgent',
      example: 'Die Reparatur ist dringend, denn nachts ist es schon sehr kalt.', note: null },
    { word: 'vorschlagen', partOfSpeech: 'verb', translation: 'proposer',
      example: 'Ich schlage vor, dass der Hausmeister am Samstag kommt.', note: 'séparable : vor|schlagen · du schlägst vor' },
    { word: 'Vorschlag', article: 'der', plural: 'Vorschläge', partOfSpeech: 'noun', translation: 'la proposition',
      example: 'Haben Sie einen besseren Vorschlag?', note: null },
    { word: 'Kompromiss', article: 'der', plural: 'Kompromisse', partOfSpeech: 'noun', translation: 'le compromis',
      example: 'Wir haben schnell einen Kompromiss gefunden.', note: null },
    { word: 'einverstanden sein', partOfSpeech: 'expression', translation: 'être d’accord',
      example: 'Mit diesem Termin bin ich einverstanden.', note: 'mit + datif' },
    { word: 'Abgemacht!', partOfSpeech: 'expression', translation: 'C’est entendu ! Marché conclu !',
      example: 'Samstag um zehn? Abgemacht!', note: null },
    { word: 'Es tut mir leid, dass …', partOfSpeech: 'expression', translation: 'Je suis désolé(e) que …',
      example: 'Es tut mir leid, dass die Musik gestern so laut war.', note: 'dass : verbe à la fin' },
    { word: 'Ich wäre Ihnen dankbar, wenn …', partOfSpeech: 'expression', translation: 'Je vous serais reconnaissant(e) si …',
      example: 'Ich wäre Ihnen dankbar, wenn Sie mir bald antworten könnten.', note: 'formule polie d’un courriel formel' },
  ],

  media: [
    { key: 'b1-wohnen-atelier-modell-aufbau', kind: 'image', title: 'Plan du courriel à la régie',
      alt: 'Schéma en cinq étapes du courriel d’Amira Haddad : Betreff, Anrede, Problem (was, wo, seit wann), Vorschlag (Lösung und Termine), Schluss (Bitte um Antwort, Gruß).',
      image: { layout: 'route', title: 'Aufbau: eine E-Mail an die Hausverwaltung', stepWidth: 160,
        steps: [
          { icon: 'mail', label: 'Betreff', sub: 'das Problem\nin Kürze' },
          { icon: 'user', label: 'Anrede', sub: 'Sehr geehrte\nDamen und Herren,' },
          { icon: 'alert-triangle', label: 'Problem', sub: 'was, wo,\nseit wann?' },
          { icon: 'lightbulb', label: 'Vorschlag', sub: 'Lösung\nund Termine' },
          { icon: 'send', label: 'Schluss', sub: 'Mit freundlichen\nGrüßen' },
        ] } },
    { key: 'b1-wohnen-atelier-modell-audio', kind: 'audio', title: 'Modèle oral : deux voisins trouvent un compromis',
      script: [
        { voice: 'mann3', name: 'Herr Lindner', text: 'Guten Abend, Frau Novak. Haben Sie einen Moment? Ich wohne direkt unter Ihnen.' },
        { pause: 0.5 },
        { voice: 'frau', name: 'Frau Novak', text: 'Guten Abend! Ja, natürlich. Was gibt es denn?' },
        { pause: 0.5 },
        { voice: 'mann3', name: 'Herr Lindner', text: 'Es geht um das Klavier. Sie üben oft abends ziemlich spät, und ich muss jeden Tag um fünf Uhr aufstehen. Dann kann ich nicht schlafen.' },
        { pause: 0.5 },
        { voice: 'frau', name: 'Frau Novak', text: 'Oh, das tut mir leid, das wusste ich nicht. Ich komme erst um acht von der Arbeit, deshalb übe ich so spät.' },
        { pause: 0.5 },
        { voice: 'mann3', name: 'Herr Lindner', text: 'Das verstehe ich. Wie wäre es, wenn Sie nur bis halb zehn spielen?' },
        { pause: 0.5 },
        { voice: 'frau', name: 'Frau Novak', text: 'Hm, das ist ziemlich knapp. Könnten wir uns auf zehn Uhr einigen? Dafür spiele ich am Wochenende nur am Nachmittag.' },
        { pause: 0.5 },
        { voice: 'mann3', name: 'Herr Lindner', text: 'Gut, zehn Uhr, einverstanden. Und wenn es doch einmal später wird, klopfe ich einfach kurz.' },
        { pause: 0.5 },
        { voice: 'frau', name: 'Frau Novak', text: 'Abgemacht. Danke, dass Sie direkt mit mir gesprochen haben.' },
      ] },
    { key: 'b1-wohnen-atelier-interaktion-q1', kind: 'audio', title: 'Réplique : un voisin et sa poussette',
      script: [{ voice: 'mann', name: 'Herr Weber', text: 'Entschuldigung, ist das Ihr Fahrrad hier im Treppenhaus? Ich komme mit dem Kinderwagen kaum vorbei.' }] },
    { key: 'b1-wohnen-atelier-interaktion-q2', kind: 'audio', title: 'Réplique : une voisine annonce une fête',
      script: [{ voice: 'frau2', name: 'Frau Schulz', text: 'Hallo! Ich wollte Ihnen nur Bescheid sagen: Am Samstag feiere ich meinen Geburtstag. Es kann ein bisschen lauter werden.' }] },
    { key: 'b1-wohnen-atelier-interaktion-q3', kind: 'audio', title: 'Réplique : un voisin mécontent du tri',
      script: [{ voice: 'sprecher', name: 'Herr Krause', text: 'Sagen Sie mal, der Müll im Hof ist schon wieder nicht getrennt. Waren Sie das?' }] },
    { key: 'b1-wohnen-atelier-interaktion-q4', kind: 'audio', title: 'Réplique : la régie au téléphone',
      script: [{ voice: 'sprecherin', name: 'Frau Lange', text: 'Hausverwaltung, guten Tag, Sie sprechen mit Frau Lange. Was kann ich für Sie tun?' }] },
    { key: 'b1-wohnen-atelier-sprechen-aufbau', kind: 'image', title: 'Les étapes d’une négociation entre voisins',
      alt: 'Schéma en cinq étapes : Problem ansprechen, Verständnis zeigen, Vorschlag machen, auf einen Gegenvorschlag reagieren, sich einigen (wer, was, wann).',
      image: { layout: 'route', title: 'Eine Lösung aushandeln', stepWidth: 160,
        steps: [
          { icon: 'message-circle', label: 'Problem\nansprechen', sub: 'die Kiste,\ndie …' },
          { icon: 'heart', label: 'Verständnis\nzeigen', sub: 'Das verstehe\nich.' },
          { icon: 'lightbulb', label: 'Vorschlag', sub: 'Wie wäre es,\nwenn …?' },
          { icon: 'scale', label: 'Gegen-\nvorschlag', sub: 'Könnten wir\nstattdessen …?' },
          { icon: 'handshake', label: 'Einigung', sub: 'wer, was,\nwann?' },
        ] } },
    { key: 'b1-wohnen-atelier-sprechen-roth1', kind: 'audio', title: 'M. Roth, réplique 1 : de quoi s’agit-il ?',
      script: [{ voice: 'mann2', name: 'Herr Roth', text: 'Ach, hallo! Sie wollten mich sprechen? Worum geht es denn?' }] },
    { key: 'b1-wohnen-atelier-sprechen-roth2', kind: 'audio', title: 'M. Roth, réplique 2 : l’armoire est à lui',
      script: [{ voice: 'mann2', name: 'Herr Roth', text: 'Ach so, der Schrank. Ja, der gehört mir. Aber ich kann ihn nicht allein tragen, und mein Sohn kommt erst in drei Wochen.' }] },
    { key: 'b1-wohnen-atelier-sprechen-roth3', kind: 'audio', title: 'M. Roth, réplique 3 : samedi, impossible',
      script: [{ voice: 'mann2', name: 'Herr Roth', text: 'Am Samstag kann ich leider nicht, da bin ich bei meiner Tochter. Haben Sie noch eine andere Idee?' }] },
  ],

  activities: [
    // 1 · Modèles de production annotés
    { id: 'b1-wohnen-atelier-modell', kind: 'lesson', title: 'Découvrir : un courriel à la régie et une négociation modèles', estimatedMinutes: 12,
      competences: ['lecture', 'ecoute'],
      lesson: { description: `${bi('Lesen Sie die E-Mail von Amira Haddad an ihre Hausverwaltung. Hören Sie danach das Gespräch zwischen zwei Nachbarn. Beide sind Modelle für Ihre Missionen.', 'Lisez le courriel d’Amira Haddad à sa régie. Écoutez ensuite la conversation entre deux voisins. Ce sont deux modèles pour vos missions.')}

BETREFF: HEIZUNG IM BAD DEFEKT – BITTE UM REPARATUR
Sehr geehrte Damen und Herren,
ich wohne seit März in der Lindenstraße 12, im zweiten Stock links. Ich wende mich an Sie, weil die Heizung im Badezimmer seit Montag nicht mehr warm wird. Der Hausmeister, mit dem ich am Dienstag gesprochen habe, meint, dass ein Teil kaputt ist und dass eine Firma kommen muss.
Da es nachts schon sehr kalt ist, ist die Reparatur für mich dringend. Ich schlage deshalb vor, dass die Firma in den nächsten Tagen kommt. Am besten passt es mir am Donnerstag oder Freitag ab 15 Uhr, denn vormittags arbeite ich. Wäre das möglich?
Ich wäre Ihnen dankbar, wenn Sie mir den Termin kurz bestätigen könnten.
Mit freundlichen Grüßen
Amira Haddad

AUFBAU
[fr] Structure du courriel
• Betreff : le problème en quelques mots, pour que la régie comprenne tout de suite.
• Anrede : « Sehr geehrte Damen und Herren, » quand on ne connaît pas le nom ; sinon « Sehr geehrte Frau … » ou « Sehr geehrter Herr … ».
• Wer schreibt ? : l’adresse et l’étage, pour qu’on trouve le logement.
• Problem : quoi, où, depuis quand ; une relative pour préciser (der Hausmeister, mit dem ich gesprochen habe).
• Vorschlag : une solution concrète et vos disponibilités (Ich schlage vor, dass … / Wäre das möglich?).
• Schluss : demander une réponse (Ich wäre Ihnen dankbar, wenn …) et « Mit freundlichen Grüßen ».

REDEMITTEL
[fr] Formules par fonction
EINLEITEN
[fr] Commencer
• Ich wende mich an Sie, weil … / Ich möchte Sie auf ein Problem aufmerksam machen.
PROBLEM BESCHREIBEN
[fr] Décrire le problème
• Seit Montag funktioniert … nicht mehr. / Die Tür, die zum Hof führt, klemmt.
BEGRÜNDEN
[fr] Justifier
• Da es nachts sehr kalt ist, … / Das ist für mich dringend, denn …
VORSCHLAGEN
[fr] Proposer
• Ich schlage vor, dass … / Wäre es möglich, …? / Am besten passt es mir am …
SCHLUSS
[fr] Conclure
• Ich wäre Ihnen dankbar, wenn … / Vielen Dank im Voraus. / Mit freundlichen Grüßen

DAS GESPRÄCH ZWISCHEN NACHBARN
[fr] La conversation entre voisins
${bi('Hören Sie, wie Herr Lindner und Frau Novak einen Kompromiss finden.', 'Écoutez comment M. Lindner et Mme Novak trouvent un compromis.')}
• Problem ansprechen : Es geht um das Klavier. Sie üben oft abends ziemlich spät …
• Verständnis zeigen : Oh, das tut mir leid, das wusste ich nicht. / Das verstehe ich.
• Vorschlag : Wie wäre es, wenn Sie nur bis halb zehn spielen?
• Gegenvorschlag : Könnten wir uns auf zehn Uhr einigen?
• Einigung : Gut, zehn Uhr, einverstanden. / Abgemacht.` },
      placements: [
        { media: 'b1-wohnen-atelier-modell-aufbau', caption: 'Aufbau der E-Mail' },
        { media: 'b1-wohnen-atelier-modell-audio', transcriptVisibility: 'on_demand' },
      ] },

    // 2 · Réagir en situation
    { id: 'b1-wohnen-atelier-interaktion', kind: 'exercise', title: 'S’entraîner : réagir poliment entre voisins', estimatedMinutes: 10,
      competences: ['ecoute', 'expression-orale'],
      lesson: { description: `${bi('Hören Sie, was Ihre Nachbarn sagen, und wählen Sie die passende Reaktion.', 'Écoutez ce que disent vos voisins et choisissez la réplique qui convient.')}
${bi('Danach sprechen Sie drei Reaktionen nach.', 'Ensuite, répétez trois réactions à voix haute.')}

TIPP
[fr] Astuce
${bi('Unter Nachbarn bleibt man höflich, auch bei einem Problem: Sie, bitte, Könnten Sie …?, Wie wäre es, wenn …?', 'Entre voisins, on reste poli, même en cas de problème : Sie, bitte, Könnten Sie …?, Wie wäre es, wenn …?')}` },
      placements: [situation('q1'), situation('q2'), situation('q3'), situation('q4')],
      questions: [
        choice('q1', bi('Hören Sie. Es ist Ihr Fahrrad. Sie entschuldigen sich und lösen das Problem. Was passt?', 'Écoutez. C’est votre vélo. Vous vous excusez et vous réglez le problème. Quelle réplique convient ?'),
          [['Ja, das ist mein Fahrrad. Es ist ganz neu.'], ['Oh, das tut mir leid! Ich stelle es sofort in den Fahrradkeller.', true], ['Das Fahrrad steht da, weil ich es morgen brauche.']],
          'On s’excuse (« Das tut mir leid ») et on règle le problème tout de suite, en mettant le vélo à sa place : in den Fahrradkeller (Wohin ? + accusatif). Les deux autres réponses ignorent la gêne du voisin.'),
        choice('q2', bi('Hören Sie. Sie sind einverstanden, aber Sie möchten höflich um etwas bitten. Was passt?', 'Écoutez. Vous êtes d’accord, mais vous voulez demander poliment quelque chose. Quelle réplique convient ?'),
          [['Schön, herzlichen Glückwunsch! Wie alt werden Sie denn, und wer kommt alles?'], ['Das ist leider verboten. Ich rufe sofort die Hausverwaltung an und beschwere mich.'], ['Kein Problem! Könnten Sie die Musik ab zehn Uhr etwas leiser machen?', true]],
          'La troisième réplique accepte (« Kein Problem! ») et formule une demande polie avec « Könnten Sie … ? ». La première est aimable mais ne demande rien ; la deuxième refuse et menace, alors qu’une fête annoncée est permise.'),
        choice('q3', bi('Hören Sie. Sie waren es nicht. Sie bleiben ruhig und machen einen Vorschlag. Was passt?', 'Écoutez. Ce n’était pas vous. Vous restez calme et vous faites une proposition. Quelle réplique convient ?'),
          [['Nein, das war ich nicht. Wie wäre es mit einem Schild an den Tonnen?', true], ['Ja, Entschuldigung, das war ich. Ab jetzt trenne ich meinen Müll immer ganz genau.'], ['Das geht Sie nichts an. Kümmern Sie sich doch um Ihren eigenen Müll!']],
          'On corrige calmement le malentendu (« das war ich nicht »), puis on propose une solution avec « Wie wäre es mit … ? ». Avouer serait faux ici, et « Das geht Sie nichts an » (ça ne vous regarde pas) est impoli.'),
        choice('q4', bi('Hören Sie. Sie rufen an, weil der Wasserhahn in Ihrer Küche tropft. Was sagen Sie?', 'Écoutez. Vous appelez parce que le robinet de votre cuisine fuit. Que dites-vous ?'),
          [['Hallo, sagen Sie mal, tropft bei Ihnen in der Küche eigentlich auch der Wasserhahn so stark?'], ['Guten Tag, hier ist Martin, Lindenstraße 12. Ich möchte melden, dass mein Wasserhahn tropft.', true], ['Guten Tag, hier ist Martin. Ich möchte gern eine größere Wohnung mit einer neuen Küche mieten.']],
          'Au téléphone avec la régie, on dit qui l’on est et où l’on habite, puis on annonce le problème : « Ich möchte melden, dass … » (je voudrais signaler que …). La première réplique pose une question absurde à la régie, la troisième change de sujet.'),
        speak('q5', 'Oh, das tut mir leid! Ich stelle es sofort weg.',
          'S’excuser et agir. « leid » : ei se prononce [aï] ; « weg » : e bref. Accent sur « SO-fort ».'),
        speak('q6', 'Könnten Sie die Musik ab zehn Uhr bitte leiser machen?',
          'Demande polie avec könnten. La voix monte légèrement à la fin. « Musik » : accent sur la dernière syllabe, mu-SIK.',
          ['Könnten Sie die Musik ab zehn Uhr bitte leiser machen?', 'Könnten Sie die Musik ab 10 Uhr bitte leiser machen?']),
        speak('q7', 'Wie wäre es, wenn wir ein Schild an die Tonnen hängen?',
          'Proposer une solution : après wenn, le verbe « hängen » va à la fin. « Schild » : sch comme « ch » dans « chat », d final prononcé [t].'),
      ] },

    // 3 · Médiation : simplifier un règlement
    { id: 'b1-wohnen-atelier-mediation', kind: 'exercise', title: 'Médiation : expliquer simplement le règlement à un voisin', estimatedMinutes: 15,
      competences: ['lecture', 'expression-ecrite'],
      lesson: { description: `${bi('Situation: Ihr neuer Nachbar Dawit lernt erst seit zwei Monaten Deutsch. Er hat die Hausordnung bekommen, aber er versteht sie nicht. Er bittet Sie um Hilfe.', 'Situation : votre nouveau voisin Dawit n’apprend l’allemand que depuis deux mois. Il a reçu le règlement intérieur, mais il ne le comprend pas. Il vous demande de l’aide.')}
${bi('Lesen Sie die drei Regeln. Erklären Sie sie Dawit dann mit einfachen Wörtern und kurzen Sätzen. Sie duzen Dawit.', 'Lisez les trois règles. Expliquez-les ensuite à Dawit avec des mots simples et des phrases courtes. Vous tutoyez Dawit.')}

STRATEGIE
[fr] Stratégie
${bi('Fragen Sie sich bei jeder Regel: Was darf man? Was darf man nicht? Wann? Wo?', 'Pour chaque règle, demandez-vous : qu’est-ce qui est permis ? interdit ? quand ? où ?')}
${bi('Machen Sie aus langen Sätzen kurze Sätze mit „du darfst“, „du musst“ und „du darfst nicht“.', 'Transformez les longues phrases en phrases courtes avec « du darfst », « du musst » et « du darfst nicht ».')}

AUS DER HAUSORDNUNG
§ 1 Ruhezeiten: Werktags von 13 bis 15 Uhr und von 22 bis 7 Uhr sowie an Sonn- und Feiertagen ganztägig ist jede ruhestörende Tätigkeit zu unterlassen. Hierzu zählen insbesondere lautes Musizieren, Bohren und Staubsaugen.
§ 3 Fahrräder: Fahrräder sind ausschließlich im dafür vorgesehenen Fahrradkeller abzustellen. Das Abstellen im Treppenhaus, im Hof oder vor dem Hauseingang ist nicht gestattet.
§ 4 Abfall: Abfälle sind getrennt zu entsorgen: Papier und Pappe in die blaue Tonne, Verpackungen in die gelbe Tonne. Sperrmüll darf nicht im Hof abgestellt werden; er wird nach Anmeldung bei der Hausverwaltung abgeholt.

SCHWIERIGE WÖRTER
[fr] Mots difficiles
• ist zu unterlassen — on ne doit pas le faire
• sind abzustellen — on doit les ranger
• nicht gestattet — pas permis
• ganztägig — toute la journée
• der Sperrmüll — les encombrants (vieux meubles, gros appareils)` },
      questions: [
        choice('q1', bi('Wie erklären Sie Dawit § 1 einfach und richtig?', 'Comment expliquez-vous le § 1 à Dawit, simplement et correctement ?'),
          [['Von 13 bis 15 Uhr musst du leise sein. Am Sonntag darfst du nur nachmittags Musik machen.'], ['Von 13 bis 15 Uhr und ab 22 Uhr musst du leise sein, am Sonntag den ganzen Tag.', true], ['Ab 22 Uhr musst du leise sein, aber staubsaugen und bohren darfst du immer.']],
          'La deuxième phrase garde toutes les informations (les deux plages horaires, le dimanche toute la journée) en mots simples. La première oublie la nuit et autorise la musique le dimanche après-midi ; la troisième autorise l’aspirateur et la perceuse, justement interdits.'),
        choice('q2', bi('Wie erklären Sie Dawit § 3?', 'Comment expliquez-vous le § 3 à Dawit ?'),
          [['Dein Fahrrad muss in den Fahrradkeller. Im Treppenhaus und im Hof ist es verboten.', true], ['Du kannst dein Fahrrad in den Hof stellen, aber nicht ins Treppenhaus.'], ['Fahrräder sind im ganzen Haus verboten.']],
          '« ausschließlich im Fahrradkeller » : uniquement au local à vélos ; l’escalier, la cour et l’entrée sont interdits. La deuxième phrase autorise la cour à tort, la troisième interdit même le local à vélos.'),
        fill('q3', bi('Ergänzen Sie die Notizen für Dawit.', 'Complétez les notes pour Dawit.'),
          'Leise sein: von 13 bis [[1]] Uhr und von [[2]] bis 7 Uhr, am Sonntag den ganzen Tag. Papier kommt in die [[3]] Tonne, Verpackungen in die [[4]] Tonne. Alte Möbel nicht in den [[5]] stellen!',
          [['15', 'fünfzehn'], ['22', 'zweiundzwanzig'], ['blaue'], ['gelbe'], ['Hof']],
          'Les horaires viennent du § 1 (13–15 h et 22–7 h), les couleurs des poubelles et l’interdiction de déposer les encombrants dans la cour du § 4. Après « die » au nominatif ou à l’accusatif féminin, l’adjectif prend -e : die blaue Tonne.'),
        order('q4', bi('Erklären Sie Dawit § 4 in einem Satz. Beginnen Sie mit „Wenn“.', 'Expliquez le § 4 à Dawit en une phrase. Commencez par « Wenn ».'),
          [['Wenn', 'du', 'alte Möbel', 'wegwerfen', 'willst,', 'musst', 'du', 'es', 'der Hausverwaltung', 'sagen.']],
          'Dans la subordonnée avec wenn, le verbe conjugué willst va à la fin, après l’infinitif. La principale commence par son verbe (musst), puis le sujet du ; le pronom es se place avant le datif « der Hausverwaltung ».'),
        choice('q5', bi('Dawit fragt: „Kann ich am Sonntag meine Wohnung staubsaugen?“ Was antworten Sie?', 'Dawit demande : « Est-ce que je peux passer l’aspirateur dimanche ? » Que répondez-vous ?'),
          [['Ja, das geht, aber nur am Nachmittag zwischen 15 und 18 Uhr.'], ['Ja, klar, am Sonntag gelten die Regeln der Hausordnung nicht.'], ['Lieber nicht: Am Sonntag ist den ganzen Tag Ruhezeit.', true]],
          'Le dimanche, la Ruhezeit dure toute la journée (« an Sonn- und Feiertagen ganztägig ») et le Staubsaugen fait partie des activités bruyantes. Aucune plage n’est donc permise ce jour-là, pas même l’après-midi, et le règlement vaut aussi le dimanche.'),
        choice('q6', bi('Wie erklären Sie Dawit das Wort „Sperrmüll“ einfach?', 'Comment expliquez-vous simplement le mot « Sperrmüll » à Dawit ?'),
          [['Das ist Müll aus Papier.'], ['Das sind große Sachen, zum Beispiel alte Möbel.', true], ['Das ist Müll, den man in die gelbe Tonne wirft.']],
          'Le Sperrmüll, ce sont les encombrants : vieux meubles, gros appareils, qui ne rentrent pas dans une poubelle. Le papier va dans la poubelle bleue et les emballages dans la jaune.'),
      ] },

    // 4 · Erreurs typiques
    { id: 'b1-wohnen-atelier-korrektur', kind: 'exercise', title: 'Corriger : les erreurs fréquentes dans une réclamation', estimatedMinutes: 10,
      competences: ['lecture', 'expression-ecrite'],
      lesson: { description: `${bi('Diese Fehler machen viele Französischsprachige. Ergänzen Sie oder wählen Sie die richtige Form.', 'Ces erreurs sont fréquentes chez les francophones. Complétez ou choisissez la bonne forme.')}
${bi('Lesen Sie danach jede Erklärung genau: Sie hilft Ihnen bei der Mission.', 'Lisez ensuite attentivement chaque explication : elle vous aidera pour la mission.')}` },
      questions: [
        fill('q1', bi('Ergänzen Sie das Relativpronomen.', 'Complétez avec le pronom relatif.'),
          'Das ist der Nachbar, [[1]] ich gestern beim Tragen geholfen habe.', [['dem']],
          'helfen se construit avec le datif (jemandem helfen) : la relative garde ce datif, masculin dem. Le français « que » pousse à écrire den, l’accusatif, qui est faux ici.'),
        choice('q2', bi('Welcher Satz ist richtig?', 'Quelle phrase est correcte ?'),
          [['Die Tür, die klemmt seit Montag, ist im Keller.'], ['Die Tür, die seit Montag klemmt, ist im Keller.', true], ['Die Tür, sie klemmt seit Montag, ist im Keller.']],
          'Dans la relative, le verbe conjugué klemmt va à la fin. Après la relative, la principale reprend avec son verbe : ist im Keller. La troisième phrase remplace le pronom relatif par un pronom personnel : ce n’est plus une relative.'),
        fill('q3', bi('Ergänzen Sie: „C’est l’appartement où j’habite depuis trois ans.“', 'Complétez : « C’est l’appartement où j’habite depuis trois ans. »'),
          'Das ist die Wohnung, in [[1]] ich seit drei Jahren wohne.', [['der']],
          '« où » se traduit ici par préposition + pronom relatif : in + datif (position), die Wohnung est féminin, d’où in der. Le verbe wohne va à la fin, et seit + présent pour une situation qui dure.'),
        fill('q4', bi('Ergänzen Sie das passende Verb: stellen oder stehen?', 'Complétez avec le verbe qui convient : stellen ou stehen ?'),
          'Bitte [[1]] Sie Ihre Schuhe nicht ins Treppenhaus.', [['stellen']],
          '« ins Treppenhaus » (in das, accusatif) indique un déplacement : il faut stellen (poser debout), à la forme de politesse : stellen Sie. stehen décrirait une position, avec le datif « im Treppenhaus ».'),
        choice('q5', bi('Sie schreiben an die Hausverwaltung. Welcher Schluss passt?', 'Vous écrivez à la régie. Quelle formule finale convient ?'),
          [['Liebe Grüße und tschüss!'], ['Bis bald, dein Luc'], ['Mit freundlichen Grüßen', true]],
          'Dans un courriel formel, la formule standard est « Mit freundlichen Grüßen », suivie du prénom et du nom. « Liebe Grüße », « tschüss » et « dein » sont réservés aux personnes qu’on tutoie.'),
        fill('q6', bi('Ergänzen Sie: „J’habite au 12, rue des Tilleuls.“', 'Complétez : « J’habite au 12, rue des Tilleuls. »'),
          'Ich wohne [[1]] Lindenstraße 12.', [['in der']],
          'Avec une rue, on dit « in der …straße » (die Straße est féminin, in + datif). Le numéro vient après le nom de la rue. On ne traduit pas « au » ni « rue » mot à mot.'),
        choice('q7', bi('Welcher Satz ist richtig? „J’attends votre réponse.“', 'Quelle phrase est correcte ? « J’attends votre réponse. »'),
          [['Ich warte Ihre Antwort.'], ['Ich warte für Ihre Antwort.'], ['Ich warte auf Ihre Antwort.', true]],
          'warten se construit avec auf + accusatif : auf Ihre Antwort warten. Le français « attendre quelque chose » (sans préposition) pousse à oublier auf, et für (pour) est un calque. Ihre prend la majuscule du vouvoiement.'),
      ] },

    // 5 · Entraînement au format : Lesen (règlement, a/b/c)
    { id: 'b1-wohnen-atelier-pruefung', kind: 'exercise', title: 'Entraînement à l’examen : lire un règlement', estimatedMinutes: 20,
      competences: ['lecture'],
      lesson: { description: `PRÜFUNGSTRAINING: LESEN
[fr] Entraînement à l’examen : lecture
${bi('Zeit: 12 Minuten. Lesen Sie die Aufgaben 1 bis 6 und den Text. Wählen Sie bei jeder Aufgabe die richtige Lösung: a, b oder c.', 'Durée : 12 minutes. Lisez les questions 1 à 6 et le texte. Pour chaque question, choisissez la bonne réponse : a, b ou c.')}

STRATEGIE
[fr] Stratégie
${bi('Lesen Sie zuerst die Aufgaben. Unterstreichen Sie in Gedanken das wichtigste Wort, zum Beispiel „Kaution“ oder „Schlüssel“.', 'Lisez d’abord les questions. Repérez mentalement le mot le plus important, par exemple « Kaution » ou « Schlüssel ».')}
${bi('Suchen Sie dieses Wort im Text und lesen Sie nur dort genau.', 'Cherchez ce mot dans le texte et lisez précisément à cet endroit seulement.')}
${bi('Vorsicht: Oft stehen alle drei Lösungen irgendwo im Text, aber nur eine passt genau zur Aufgabe.', 'Attention : souvent, les trois réponses apparaissent quelque part dans le texte, mais une seule correspond exactement à la question.')}

GEMEINSCHAFTSRAUM IM ERDGESCHOSS: REGELN FÜR DIE NUTZUNG
Der Gemeinschaftsraum steht allen Mieterinnen und Mietern der Lindenstraße 10 bis 14 zur Verfügung, zum Beispiel für Geburtstage, Familienfeste oder Treffen von Hausgruppen.

Reservierung: Bitte reservieren Sie den Raum mindestens zwei Wochen vorher beim Hausmeister, Herrn Arslan. Er ist montags und donnerstags von 17 bis 19 Uhr in seinem Büro im Erdgeschoss. Pro Haushalt ist eine Reservierung im Monat möglich.

Kosten: Für Feiern bis 20 Personen zahlen Sie 25 Euro, für größere Feiern 40 Euro. Dazu kommt eine Kaution von 50 Euro, die Sie zurückbekommen, wenn der Raum sauber und ohne Schäden ist. Treffen von Hausgruppen sind kostenlos.

Ausstattung: Im Raum gibt es Tische und Stühle für 30 Personen, einen Kühlschrank und eine kleine Küche mit Geschirr. Eine Musikanlage gibt es nicht; Sie dürfen aber Ihre eigene mitbringen.

Ruhe: Ab 22 Uhr müssen die Fenster geschlossen bleiben, und die Musik darf nur noch leise laufen. Um Mitternacht muss die Feier zu Ende sein.

Nach der Feier: Räumen Sie den Raum bitte bis 12 Uhr am nächsten Tag auf. Den Müll nehmen Sie bitte mit oder trennen ihn in den Tonnen im Hof. Den Schlüssel geben Sie Herrn Arslan zurück oder werfen ihn in den Briefkasten an seinem Büro.` },
      questions: [
        choice('q1', bi('Den Raum reservieren Sie …', 'Vous réservez la salle …'),
          [['bei der Hausverwaltung, eine Woche vorher.'], ['beim Hausmeister, mindestens zwei Wochen vorher.', true], ['jeden Montag im Büro der Hausverwaltung.']],
          '« Bitte reservieren Sie den Raum mindestens zwei Wochen vorher beim Hausmeister ». Le lundi est cité, mais comme jour de permanence du gardien, pas de la régie.'),
        choice('q2', bi('Eine Feier mit 25 Gästen kostet …', 'Une fête avec 25 invités coûte …'),
          [['25 Euro und 50 Euro Kaution.'], ['40 Euro, ohne Kaution.'], ['40 Euro und 50 Euro Kaution.', true]],
          'Au-delà de 20 personnes, la salle coûte 40 euros ; s’y ajoute (« Dazu kommt ») une caution de 50 euros. Le piège : 25 est le nombre d’invités, et aussi le prix des petites fêtes.'),
        choice('q3', bi('Die Kaution bekommen Sie zurück, wenn …', 'Vous récupérez la caution si …'),
          [['der Raum sauber und nicht beschädigt ist.', true], ['Sie weniger als 20 Gäste haben.'], ['Sie den Raum zwei Wochen vorher reservieren.']],
          '« … eine Kaution von 50 Euro, die Sie zurückbekommen, wenn der Raum sauber und ohne Schäden ist ». « ohne Schäden » = « nicht beschädigt » : à l’examen, la bonne réponse reformule souvent le texte.'),
        choice('q4', bi('Wer bei der Feier Musik hören möchte, …', 'Si l’on veut écouter de la musique pendant la fête, …'),
          [['kann die Musikanlage im Raum benutzen.'], ['muss eine eigene Musikanlage mitbringen.', true], ['darf das nur bis 22 Uhr.']],
          '« Eine Musikanlage gibt es nicht; Sie dürfen aber Ihre eigene mitbringen. » Après 22 h, la musique reste permise, mais à faible volume : la troisième réponse est donc fausse.'),
        choice('q5', bi('Nach 22 Uhr …', 'Après 22 h …'),
          [['muss die Feier zu Ende sein, und alle Gäste gehen nach Hause.'], ['ist im Gemeinschaftsraum gar keine Musik mehr erlaubt.'], ['bleiben die Fenster zu, und die Musik ist leise.', true]],
          '« Ab 22 Uhr müssen die Fenster geschlossen bleiben, und die Musik darf nur noch leise laufen. » La fête doit se terminer à minuit seulement.'),
        choice('q6', bi('Den Schlüssel …', 'La clé …'),
          [['geben Sie Herrn Arslan zurück oder werfen ihn in seinen Briefkasten.', true], ['behalten Sie bis zur nächsten Feier, wenn Sie noch einmal reservieren.'], ['bringen Sie am nächsten Tag bis 12 Uhr zur Hausverwaltung.']],
          'Dernière phrase du texte : on rend la clé à M. Arslan ou on la dépose dans la boîte aux lettres de son bureau. La régie n’intervient pas dans la location de la salle.'),
      ] },

    // 6 · Mission écrite
    { id: 'b1-wohnen-atelier-schreiben', kind: 'mission', title: 'Mission : écrire à la régie pour signaler un problème', estimatedMinutes: 25,
      competences: ['expression-ecrite'],
      lesson: { description: `SITUATION
[fr] Situation
${bi('Sie wohnen in der Lindenstraße 12. Seit einer Woche gibt es im Haus ein Problem. Wählen Sie eins:', 'Vous habitez au 12, Lindenstraße. Depuis une semaine, il y a un problème dans l’immeuble. Choisissez-en un :')}
• ${bi('Die Haustür schließt nicht richtig. Abends können Fremde ins Haus kommen.', 'La porte d’entrée ne ferme pas bien. Le soir, des inconnus peuvent entrer.')}
• ${bi('Im Fahrradkeller ist das Licht kaputt. Man sieht nichts mehr.', 'Au local à vélos, la lumière ne fonctionne plus. On n’y voit plus rien.')}
• ${bi('Im Treppenhaus stehen seit Wochen alte Möbel. Man kommt kaum noch vorbei.', 'Dans l’escalier, de vieux meubles sont là depuis des semaines. On peut à peine passer.')}

AUFGABE
[fr] Consigne
${bi('Schreiben Sie eine E-Mail an die Hausverwaltung (100 bis 140 Wörter).', 'Écrivez un courriel à la régie (100 à 140 mots).')}
• ${bi('Stellen Sie sich kurz vor: Name, Wohnung, Stockwerk.', 'Présentez-vous brièvement : nom, logement, étage.')}
• ${bi('Beschreiben Sie das Problem genau: was, wo, seit wann? Benutzen Sie mindestens einen Relativsatz.', 'Décrivez précisément le problème : quoi, où, depuis quand ? Employez au moins une relative.')}
• ${bi('Erklären Sie, warum das Problem für Sie oder die anderen Bewohner wichtig ist.', 'Expliquez pourquoi ce problème est important pour vous ou pour les autres habitants.')}
• ${bi('Machen Sie einen Vorschlag für eine Lösung und nennen Sie Termine, an denen Sie zu Hause sind.', 'Proposez une solution et indiquez des moments où vous êtes chez vous.')}
• ${bi('Bitten Sie um eine Antwort.', 'Demandez une réponse.')}

TIPP
[fr] Astuce
${bi('Sie schreiben formell: Betreff, Sehr geehrte Damen und Herren, Sie und Ihnen, Mit freundlichen Grüßen. Das Modell vom Anfang des Moduls hilft Ihnen.', 'Vous écrivez de façon formelle : objet, « Sehr geehrte Damen und Herren », Sie et Ihnen, « Mit freundlichen Grüßen ». Le modèle du début du module vous aide.')}` },
      mission: {
        oral: null,
        written: { prompt: bi('Schreiben Sie eine E-Mail an die Hausverwaltung (100 bis 140 Wörter): Problem, Grund, Vorschlag mit Terminen, Bitte um Antwort.', 'Écrivez un courriel à la régie (100 à 140 mots) : le problème, pourquoi il compte, une proposition avec des disponibilités, une demande de réponse.'),
          maxChars: 1400, minWords: 100 },
        checklist: [
          bi('Ich schreibe formell: Betreff, Sehr geehrte Damen und Herren, Mit freundlichen Grüßen.', 'J’écris de façon formelle : objet, appel, formule finale.'),
          bi('Ich stelle mich vor: Name, Adresse, Stockwerk.', 'Je me présente : nom, adresse, étage.'),
          bi('Ich beschreibe das Problem (was, wo, seit wann?) mit mindestens einem Relativsatz.', 'Je décris le problème avec au moins une relative.'),
          bi('Ich erkläre, warum das wichtig ist, und schlage eine Lösung mit Terminen vor.', 'J’explique l’enjeu et je propose une solution avec des créneaux.'),
          bi('Ich sieze (Sie, Ihnen, Ihr) und bitte um eine Antwort.', 'Je vouvoie et je demande une réponse.'),
        ],
        criteria: [
          { ...GRIDS.b1.schreiben[0], label: 'Tâche : problème précis, raison, proposition avec disponibilités et demande de réponse ; registre formel (Sie) respecté' },
          ...GRIDS.b1.schreiben.slice(1),
        ] } },

    // 7 · Mission orale : négocier avec un voisin
    { id: 'b1-wohnen-atelier-sprechen', kind: 'mission', title: 'Mission : négocier un arrangement avec un voisin', estimatedMinutes: 20,
      competences: ['expression-orale'],
      lesson: { description: `SITUATION
[fr] Situation
${bi('Im Flur vor Ihrer Wohnung steht seit zwei Wochen ein großer Schrank. Sie kommen mit Ihren Einkäufen kaum noch zur Tür. Sie klingeln bei Ihrem Nachbarn, Herrn Roth.', 'Dans le couloir devant votre appartement, une grande armoire est là depuis deux semaines. Vous arrivez à peine jusqu’à votre porte avec vos courses. Vous sonnez chez votre voisin, M. Roth.')}

AUFGABE
[fr] Consigne
${bi('Hören Sie zuerst die drei Sätze von Herrn Roth. Nehmen Sie dann Ihre drei Antworten nacheinander auf, etwa zwei Minuten insgesamt.', 'Écoutez d’abord les trois répliques de M. Roth. Enregistrez ensuite vos trois réponses à la suite, environ deux minutes en tout.')}
• ${bi('Antwort 1: Beschreiben Sie das Problem höflich und genau.', 'Réponse 1 : décrivez le problème poliment et précisément.')}
• ${bi('Antwort 2: Zeigen Sie Verständnis und machen Sie einen Vorschlag.', 'Réponse 2 : montrez de la compréhension et faites une proposition.')}
• ${bi('Antwort 3: Machen Sie einen anderen Vorschlag. Einigen Sie sich: Wer macht was, und wann?', 'Réponse 3 : faites une autre proposition. Mettez-vous d’accord : qui fait quoi, et quand ?')}

VORBEREITUNG
[fr] Préparation
${bi('Überlegen Sie sich für jede Antwort zwei oder drei Stichwörter. Hören Sie noch einmal das Gespräch zwischen Herrn Lindner und Frau Novak im Modell.', 'Préparez mentalement deux ou trois mots-clés pour chaque réponse. Réécoutez la conversation entre M. Lindner et Mme Novak dans le modèle.')}
${bi('Sprechen Sie frei und höflich: Sie, bitte, Könnten wir …?, Wie wäre es, wenn …?', 'Parlez librement et poliment : Sie, bitte, Könnten wir …?, Wie wäre es, wenn …?')}` },
      placements: [
        { media: 'b1-wohnen-atelier-sprechen-roth1', transcriptVisibility: 'on_demand', caption: 'Herr Roth, Satz 1' },
        { media: 'b1-wohnen-atelier-sprechen-roth2', transcriptVisibility: 'on_demand', caption: 'Herr Roth, Satz 2' },
        { media: 'b1-wohnen-atelier-sprechen-roth3', transcriptVisibility: 'on_demand', caption: 'Herr Roth, Satz 3' },
        { media: 'b1-wohnen-atelier-sprechen-aufbau', caption: 'Eine Lösung aushandeln' },
      ],
      mission: {
        oral: { prompt: bi('Antworten Sie Herrn Roth nacheinander auf seine drei Sätze und finden Sie zusammen eine Lösung für den Schrank (etwa zwei Minuten).', 'Répondez successivement aux trois répliques de M. Roth et trouvez ensemble une solution pour l’armoire (environ deux minutes).'),
          maxSeconds: 120 },
        written: null,
        checklist: [
          bi('Ich beschreibe das Problem höflich, mit einem Relativsatz: der Schrank, der im Flur steht.', 'Je décris poliment le problème, avec une relative.'),
          bi('Ich zeige Verständnis für meinen Nachbarn: Das verstehe ich.', 'Je montre que je comprends la situation du voisin.'),
          bi('Ich mache einen Vorschlag und dann einen zweiten, wenn er ablehnt: Wie wäre es, wenn …?', 'Je fais une proposition, puis une autre s’il refuse.'),
          bi('Wir einigen uns: Wer macht was, an welchem Tag, um wie viel Uhr?', 'Nous nous mettons d’accord : qui fait quoi, quel jour, à quelle heure.'),
          bi('Ich bleibe höflich und sieze ihn (Sie, Ihnen).', 'Je reste poli et je le vouvoie.'),
        ],
        criteria: [
          { ...GRIDS.b1.sprechen[0], label: 'Tâche : réponses aux trois répliques, proposition puis contre-proposition, accord précis (qui, quoi, quand)' },
          ...GRIDS.b1.sprechen.slice(1),
        ] } },

    // 8 · Faire le point
    { id: 'b1-wohnen-atelier-bilan', kind: 'lesson', title: 'Faire le point : Wohnen', estimatedMinutes: 6,
      competences: ['lecture'],
      lesson: { description: `FAIRE LE POINT
${bi('Was können Sie jetzt? Lesen Sie die Sätze und prüfen Sie sich selbst.', 'Que savez-vous faire maintenant ? Lisez les phrases et évaluez-vous.')}
• ${bi('Ich kann eine Hausordnung und einen Aushang verstehen.', 'Je peux comprendre un règlement intérieur et un avis affiché.')}
• ${bi('Ich kann ein Problem in meiner Wohnung oder im Haus genau beschreiben.', 'Je peux décrire précisément un problème dans mon logement ou dans l’immeuble.')}
• ${bi('Ich kann mit Relativsätzen sagen, wen oder was ich meine.', 'Je peux préciser de qui ou de quoi je parle avec des relatives.')}
• ${bi('Ich kann der Hausverwaltung eine formelle E-Mail mit einem Vorschlag schreiben.', 'Je peux écrire à la régie un courriel formel avec une proposition.')}
• ${bi('Ich kann mit einem Nachbarn höflich eine Lösung aushandeln.', 'Je peux négocier poliment une solution avec un voisin.')}
• ${bi('Ich kann einer Person, die wenig Deutsch spricht, Regeln einfach erklären.', 'Je peux expliquer simplement des règles à quelqu’un qui parle peu allemand.')}

STRATÉGIES À GARDER
• Lecture d’un règlement : repérer le thème de chaque paragraphe, puis chercher le mot-clé de la question ; attention à nicht, kein, nur.
• Écoute d’un message : qui parle, pourquoi, quoi et quand, ce que je dois faire.
• Courriel formel : objet, appel, problème, proposition, demande de réponse, formule finale.
• Médiation : transformer les phrases longues et administratives en phrases courtes (du darfst, du musst, du darfst nicht).

À REVOIR SI BESOIN
• Les pronoms relatifs (denen au datif pluriel, préposition en tête) : leçon « Retenir » et exercice « S’entraîner » du module Wohnen.
• stellen ou stehen, legen ou liegen : leçon « Retenir » du module Wohnen et exercice « Corriger » de cet atelier.
• Le vocabulaire : die Hausordnung, die Hausverwaltung, die Nebenkosten, sich beschweren über, Rücksicht nehmen, vorschlagen, einverstanden sein (lexique sonore des deux modules).` } },
  ],
};
