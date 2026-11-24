// Module 24 · b1-kultur-atelier (lot R4, thème 12) : organiser un événement et faire le bilan (avant l’examen blanc).
// Médiation (du français vers l’allemand) : transmettre à un ami germanophone le programme d’un festival en français.
// Examen : révision mixte Lesen et Hören dans les conditions de l’examen (8 questions).
// Missions : invitation et rétrospective avec le Konjunktiv II passé en formules (wir hätten … sollen), 120 à 150 mots ;
// planifier une fête en réponse à quatre propositions enregistrées (150 s).
// Reprise réécrite du brouillon B1 V1 (partie3-suite.mjs › b1-projekt) : contraintes, modifier un programme, objections,
// présenter un programme et une solution de secours.
import { C, bi, choice, fill, order, speak, GRIDS } from '../../lib.mjs';

const rf = (id, statement, answer, explanation) => choice(id, `„${statement}“ ${C.richtigFalsch}`,
  [['richtig', answer === 'r'], ['falsch', answer === 'f'], ['steht nicht im Text', answer === 'n']], explanation);
const grid = (criteria, aufgabe) => criteria.map((criterion) => (criterion.id === 'aufgabe' ? { ...criterion, label: aufgabe } : { ...criterion }));
const lines = (...items) => items.join('\n');

export default {
  id: 'b1-kultur-atelier',
  title: 'Kultur (atelier) : organiser une fête et faire le bilan',
  objective: 'Inviter à une fête en tirant le bilan de la précédente (Wir hätten … sollen), planifier un événement à deux, transmettre en allemand un programme rédigé en français et s’entraîner à l’examen en lecture et en écoute.',
  sources: [
    'Textes, dialogues et exercices originaux LinguaCap.',
    'Situations reprises et réécrites du brouillon B1 V1 (LinguaCap) : organiser un événement, contraintes, objections et solution de secours.',
  ],
  vocabulary: [
    { word: 'Einladung', article: 'die', plural: 'Einladungen', partOfSpeech: 'noun', translation: 'l’invitation',
      example: 'Die Einladung hängt im Treppenhaus.', note: null },
    { word: 'einladen', partOfSpeech: 'verb', translation: 'inviter',
      example: 'Wir laden alle Nachbarn zum Hoffest ein.', note: 'séparable : ein|laden · Perfekt : hat eingeladen' },
    { word: 'Rückblick', article: 'der', plural: 'Rückblicke', partOfSpeech: 'noun', translation: 'le regard en arrière, le bilan',
      example: 'Im Rückblick war das Fest ein großer Erfolg.', note: null },
    { word: 'Hoffest', article: 'das', plural: 'Hoffeste', partOfSpeech: 'noun', translation: 'la fête dans la cour (d’immeuble)',
      example: 'Unser Hoffest findet im Juni statt.', note: null },
    { word: 'Wir hätten … sollen.', partOfSpeech: 'expression', translation: 'Nous aurions dû …',
      example: 'Wir hätten mehr Stühle organisieren sollen.', note: 'hätten + infinitif + sollen, en fin de phrase' },
    { word: 'Es wäre besser gewesen, … zu …', partOfSpeech: 'expression', translation: 'Il aurait mieux valu …',
      example: 'Es wäre besser gewesen, früher anzufangen.', note: null },
    { word: 'mitbringen', partOfSpeech: 'verb', translation: 'apporter',
      example: 'Bringt bitte etwas für das Buffet mit!', note: 'séparable : mit|bringen · Perfekt : hat mitgebracht' },
    { word: 'sich einigen auf', partOfSpeech: 'verb', translation: 'se mettre d’accord sur',
      example: 'Wir haben uns auf Samstag geeinigt.', note: '+ accusatif' },
    { word: 'Gegenvorschlag', article: 'der', plural: 'Gegenvorschläge', partOfSpeech: 'noun', translation: 'la contre-proposition',
      example: 'Ich hätte einen Gegenvorschlag.', note: null },
    { word: 'einverstanden', partOfSpeech: 'adjective', translation: 'd’accord',
      example: 'Einverstanden, dann machen wir es so.', note: 'mit etwas einverstanden sein : être d’accord avec' },
    { word: 'Ich wäre eher für …', partOfSpeech: 'expression', translation: 'Je serais plutôt pour …',
      example: 'Ich wäre eher für eine Playlist.', note: 'für + accusatif' },
    { word: 'Das klingt gut, aber …', partOfSpeech: 'expression', translation: 'Ça a l’air bien, mais …',
      example: 'Das klingt gut, aber eine Band ist zu teuer.', note: null },
    { word: 'Nachtruhe', article: 'die', plural: null, partOfSpeech: 'noun', translation: 'le repos nocturne (heures de silence)',
      example: 'Um 22 Uhr beginnt die Nachtruhe.', note: null },
    { word: 'aufräumen', partOfSpeech: 'verb', translation: 'ranger',
      example: 'Nach dem Fest räumen alle zusammen auf.', note: 'séparable : auf|räumen' },
    { word: 'Zelt', article: 'das', plural: 'Zelte', partOfSpeech: 'noun', translation: 'la tente, le chapiteau',
      example: 'Bei Regen feiern wir im Zelt.', note: null },
    { word: 'Wir freuen uns auf euch!', partOfSpeech: 'expression', translation: 'Nous avons hâte de vous voir !',
      example: 'Bis Samstag, wir freuen uns auf euch!', note: 'sich freuen auf + accusatif : se réjouir à l’avance' },
  ],
  media: [
    { key: 'b1-kultur-atelier-modell-audio', kind: 'audio', title: 'Invitation modèle lue à voix haute',
      script: [
        { voice: 'mann3', name: 'Tarek', text: 'Liebe Nachbarinnen und Nachbarn, erinnert ihr euch an unser erstes Hoffest im letzten Sommer? Es war ein wunderbarer Abend: Wir haben zusammen gegrillt, die Kinder haben bis spät gespielt, und viele haben sich zum ersten Mal richtig kennengelernt.' },
        { pause: 0.7 },
        { voice: 'mann3', name: 'Tarek', text: 'Natürlich hat nicht alles geklappt. Wir hätten mehr Stühle organisieren sollen, und es wäre besser gewesen, die Musik früher leiser zu machen. Das machen wir dieses Jahr anders!' },
        { pause: 0.7 },
        { voice: 'mann3', name: 'Tarek', text: 'Deshalb laden wir euch herzlich zum zweiten Hoffest ein: am Samstag, dem vierzehnten Juni, ab siebzehn Uhr im Hof. Es wird ein großes Buffet geben, und Frau Yilmaz wird mit den Kindern Spiele organisieren. Bringt bitte etwas zu essen und, wenn möglich, einen Stuhl mit!' },
        { pause: 0.7 },
        { voice: 'mann3', name: 'Tarek', text: 'Um zweiundzwanzig Uhr beginnt die Nachtruhe, dann räumen wir gemeinsam auf. Wir freuen uns auf euch! Viele Grüße, Tarek und Sophie aus dem dritten Stock.' },
      ] },
    { key: 'b1-kultur-atelier-interaktion-f1', kind: 'audio', title: 'Réplique 1 : choisir le jour',
      script: [{ voice: 'mann2', name: 'Theo', text: 'Wollen wir das Hoffest am Samstag oder am Sonntag machen?' }] },
    { key: 'b1-kultur-atelier-interaktion-f2', kind: 'audio', title: 'Réplique 2 : une idée de musique',
      script: [{ voice: 'frau3', name: 'Nachbarin', text: 'Ich finde, wir sollten eine Band einladen. Das wäre doch toll!' }] },
    { key: 'b1-kultur-atelier-interaktion-f3', kind: 'audio', title: 'Réplique 3 : le concierge',
      script: [{ voice: 'mann', name: 'Hausmeister', text: 'Im Hof dürfen Sie nur bis zweiundzwanzig Uhr feiern. Dann beginnt die Nachtruhe.' }] },
    { key: 'b1-kultur-atelier-interaktion-f4', kind: 'audio', title: 'Réplique 4 : souvenir de l’an dernier',
      script: [{ voice: 'frau2', name: 'Nachbarin', text: 'Letztes Jahr gab es viel zu wenig zu essen, oder?' }] },
    { key: 'b1-kultur-atelier-mediation-faltblatt', kind: 'image', title: 'Dépliant en français du festival Sons d’été',
      alt: 'Dépliant « Festival Sons d’été », parc des Tilleuls, 11 au 13 juillet : concert gratuit vendredi, atelier percussions samedi (5 €, inscription avant le 5 juillet), bal samedi soir (8 €), pique-nique partagé dimanche, navette gratuite depuis la gare.',
      image: { layout: 'document', icon: 'music', title: 'Festival Sons d’été', subtitle: 'Parc des Tilleuls · du 11 au 13 juillet',
        rows: [
          ['Vendredi 20 h', 'Concert d’ouverture, gratuit'],
          ['Samedi 10 h', 'Atelier percussions (6–12 ans), 5 €, inscription avant le 5 juillet'],
          ['Samedi 21 h', 'Bal populaire, 8 €'],
          ['Dimanche midi', 'Pique-nique partagé : apportez un plat'],
          ['Accès', 'Pas de parking sur place, navette gratuite depuis la gare'],
        ] } },
    { key: 'b1-kultur-atelier-pruefung-radio', kind: 'audio', title: 'Conseils culturels de la radio',
      script: [
        { voice: 'sprecher', name: 'Moderator', text: 'Und hier unsere Kulturtipps fürs Wochenende. Am Freitagabend zeigt das Kino im Park den Film „Sommer am See“. Beginn ist um einundzwanzig Uhr dreißig. Bei Regen fällt die Vorführung leider aus.' },
        { pause: 0.6 },
        { voice: 'sprecher', name: 'Moderator', text: 'Am Samstag lädt das Stadtmuseum zur langen Nacht der Museen ein: Von achtzehn Uhr bis Mitternacht sind alle Ausstellungen geöffnet, und um zwanzig Uhr gibt es eine Führung für Familien. Eine Karte kostet acht Euro, für Schüler und Studierende fünf Euro.' },
        { pause: 0.6 },
        { voice: 'sprecher', name: 'Moderator', text: 'Und am Sonntag um elf Uhr spielt die Musikschule im Rathaus ein Konzert mit Liedern aus aller Welt. Der Eintritt ist frei, aber die Plätze sind begrenzt. Reservieren Sie deshalb am besten vorher telefonisch. Wir wünschen Ihnen ein schönes Wochenende!' },
      ] },
    { key: 'b1-kultur-atelier-sprechen-theo', kind: 'audio', title: 'Message vocal de Theo : quatre propositions',
      script: [
        { voice: 'mann2', name: 'Theo', text: 'Hallo, hier ist Theo aus dem zweiten Stock. Ich habe ein paar Ideen für unser Hoffest.' },
        { pause: 0.6 },
        { voice: 'mann2', name: 'Theo', text: 'Erstens: Wir könnten das Fest am Freitagabend machen, dann haben alle am Samstag frei.' },
        { pause: 0.8 },
        { voice: 'mann2', name: 'Theo', text: 'Zweitens: Ich würde gern einen DJ engagieren. Mein Cousin macht das für hundert Euro.' },
        { pause: 0.8 },
        { voice: 'mann2', name: 'Theo', text: 'Drittens: Jeder Haushalt sollte zehn Euro für die Getränke bezahlen.' },
        { pause: 0.8 },
        { voice: 'mann2', name: 'Theo', text: 'Und viertens: Wir könnten doch bis Mitternacht feiern, das wäre schön! Was meinst du? Ruf mich einfach zurück!' },
      ] },
  ],
  activities: [
    { id: 'b1-kultur-atelier-modell', kind: 'lesson', title: 'Modèle : une invitation avec un retour sur l’an dernier', estimatedMinutes: 12,
      competences: ['lecture', 'ecoute'],
      lesson: { description: `${bi('Lesen und hören Sie die E-Mail. Achten Sie auf den Aufbau und auf die Redemittel.', 'Lisez et écoutez le courriel. Observez la structure et les formules.')}

DIE E-MAIL
[fr] Le courriel
Betreff: Unser Hoffest am 14. Juni

Liebe Nachbarinnen und Nachbarn,
erinnert ihr euch an unser erstes Hoffest im letzten Sommer? Es war ein wunderbarer Abend: Wir haben zusammen gegrillt, die Kinder haben bis spät gespielt, und viele haben sich zum ersten Mal richtig kennengelernt.
Natürlich hat nicht alles geklappt. Wir hätten mehr Stühle organisieren sollen, und es wäre besser gewesen, die Musik früher leiser zu machen. Das machen wir dieses Jahr anders!
Deshalb laden wir euch herzlich zum zweiten Hoffest ein: am Samstag, dem 14. Juni, ab 17 Uhr im Hof. Es wird ein großes Buffet geben, und Frau Yilmaz wird mit den Kindern Spiele organisieren. Bringt bitte etwas zu essen und, wenn möglich, einen Stuhl mit!
Um 22 Uhr beginnt die Nachtruhe, dann räumen wir gemeinsam auf.
Wir freuen uns auf euch!
Viele Grüße
Tarek und Sophie aus dem dritten Stock

AUFBAU
[fr] Structure
• Anrede : Liebe Nachbarinnen und Nachbarn, (registre familier : ihr, euch).
• Rückblick : ce qui était bien l’an dernier, au Perfekt.
• Was wir besser machen : ce qu’il aurait fallu faire, au Konjunktiv II passé.
• Einladung : date, heure, lieu, programme, au Futur I (Es wird … geben).
• Bitte und Schluss : ce que chacun apporte, formule amicale.

REDEMITTEL
[fr] Formules utiles
EINLEITEN
[fr] Ouvrir
• Erinnert ihr euch an …? / Letztes Jahr haben wir …
BEGRÜNDEN
[fr] Tirer la leçon
• Wir hätten … sollen. / Es wäre besser gewesen, … zu …
BEISPIEL
[fr] Annoncer le programme
• Es wird … geben. / … wird … organisieren.
SCHLUSS
[fr] Conclure
• Bringt bitte … mit! / Wir freuen uns auf euch!

À REMARQUER
• « Wir hätten mehr Stühle organisieren sollen » : pour dire ce qu’on aurait dû faire, hätten + infinitif + sollen, les deux infinitifs à la fin. Retenez-le comme une formule.
• « Es wäre besser gewesen, … zu … » : il aurait mieux valu …
• Le Futur I (Es wird ein großes Buffet geben) annonce le programme ; le présent est aussi possible avec une date (Am Samstag gibt es …).` },
      placements: [{ media: 'b1-kultur-atelier-modell-audio', transcriptVisibility: 'on_demand' }] },

    { id: 'b1-kultur-atelier-interaktion', kind: 'exercise', title: 'Réagir : planifier une fête avec les voisins', estimatedMinutes: 10,
      competences: ['ecoute', 'expression-orale'],
      lesson: { description: `${C.reagieren}

${bi('Sie planen mit Ihren Nachbarn ein Hoffest. Hören Sie jede Situation und wählen Sie die passende Antwort. Sprechen Sie dann die Sätze nach.', 'Vous préparez une fête de la cour avec vos voisins. Écoutez chaque situation, choisissez la réponse qui convient, puis répétez les phrases.')}` },
      placements: [
        { media: 'b1-kultur-atelier-interaktion-f1', questionId: 'q1', transcriptVisibility: 'after_answer' },
        { media: 'b1-kultur-atelier-interaktion-f2', questionId: 'q2', transcriptVisibility: 'after_answer' },
        { media: 'b1-kultur-atelier-interaktion-f3', questionId: 'q3', transcriptVisibility: 'after_answer' },
        { media: 'b1-kultur-atelier-interaktion-f4', questionId: 'q4', transcriptVisibility: 'after_answer' },
      ],
      questions: [
        choice('q1', bi('Situation 1: Was antworten Sie?', 'Situation 1 : que répondez-vous ?'), [
          ['Ich wäre für Samstag, dann können alle länger bleiben.', true],
          ['Ja, gern, das machen wir dann so wie letztes Jahr.'],
          ['Am Samstag war ich mit meiner Schwester im Kino.'],
        ], 'À une question à deux options (« am Samstag oder am Sonntag? »), on choisit et on justifie : « Ich wäre für …, dann … ». « Ja » ne répond pas à une alternative, et la troisième réplique parle du passé.'),
        choice('q2', bi('Situation 2: Was antworten Sie?', 'Situation 2 : que répondez-vous ?'), [
          ['Nein, Musik ist bei einem Hoffest doch langweilig.'],
          ['Das klingt gut, aber teuer. Wie wäre es mit einer Playlist?', true],
          ['Ja, und die Band bezahlst du dann bitte ganz allein, oder?'],
        ], 'On reconnaît l’idée (« Das klingt gut »), on nomme le problème (le prix) et on fait une contre-proposition polie (« Wie wäre es mit …? »). Les deux autres réponses ferment la discussion.'),
        choice('q3', bi('Situation 3: Was antworten Sie?', 'Situation 3 : que répondez-vous ?'), [
          ['Dann feiern wir eben einfach bis Mitternacht im Hof.'],
          ['Das ist uns egal, wir feiern so lange, wie wir wollen.'],
          ['Alles klar, um zehn machen wir die Musik aus.', true],
        ], 'Le concierge rappelle la règle du repos nocturne. On l’accepte (« Alles klar ») et on montre qu’on l’appliquera concrètement. Les deux autres réponses ignorent la règle.'),
        choice('q4', bi('Situation 4: Was antworten Sie?', 'Situation 4 : que répondez-vous ?'), [
          ['Nein, letztes Jahr gab es im Hof gar kein Fest.'],
          ['Stimmt, wir hätten mehr Essen einplanen sollen.', true],
          ['Ja, aber ich habe heute gar keinen Hunger.'],
        ], 'On reconnaît l’erreur avec le Konjunktiv II passé (« wir hätten … einplanen sollen »). La première réponse contredit la situation, la troisième est hors sujet.'),
        speak('q5', 'Wir hätten die Einladungen früher verschicken sollen.',
          'Regret au Konjunktiv II passé : « hätten » en 2e position, puis les deux infinitifs « verschicken sollen » à la fin.'),
        speak('q6', 'Ich wäre eher dafür, dass jeder etwas zu essen mitbringt.',
          'Contre-proposition nuancée : « Ich wäre eher dafür, dass … ». Dans la subordonnée, le verbe séparable reste soudé à la fin : « mitbringt ».'),
        speak('q7', 'Einverstanden, dann machen wir es so.',
          'Pour conclure un accord. Accentuez « Einverstanden » sur la syllabe « stan ».'),
      ] },

    { id: 'b1-kultur-atelier-mediation', kind: 'exercise', title: 'Médiation : expliquer en allemand un programme en français', estimatedMinutes: 15,
      competences: ['lecture', 'expression-ecrite'],
      lesson: { description: `${bi('Lesen Sie das Faltblatt auf Französisch. Helfen Sie dann Ihrem Freund Jonas auf Deutsch.', 'Lisez le dépliant en français, puis aidez votre ami Jonas en allemand.')}

DIE SITUATION
[fr] La situation
Ihr Freund Jonas aus Freiburg besucht Sie im Juli mit seinen zwei Kindern (7 und 10 Jahre). Er kommt mit dem Auto und spricht kein Französisch. Er fragt: „Was ist am Wochenende los? Lohnt sich das mit den Kindern?“ [fr] Votre ami Jonas, de Fribourg-en-Brisgau, vient vous voir en juillet avec ses deux enfants (7 et 10 ans). Il vient en voiture et ne parle pas français. Il demande : « Qu’est-ce qui se passe ce week-end ? Ça vaut le coup avec les enfants ? »

LE DÉPLIANT
Festival Sons d’été, parc des Tilleuls, du vendredi 11 au dimanche 13 juillet.
Vendredi à 20 h : concert d’ouverture, gratuit.
Samedi de 10 h à 12 h : atelier de percussions pour les enfants de 6 à 12 ans, 5 € par enfant. Inscription obligatoire avant le 5 juillet, sur place ou par téléphone.
Samedi à 21 h : bal populaire, entrée 8 €.
Dimanche midi : grand pique-nique partagé. Apportez un plat à partager ; boissons en vente sur place.
Accès : pas de parking sur le site. Navette gratuite depuis la gare toutes les 20 minutes.
En cas de pluie, les concerts ont lieu sous le chapiteau.

STRATEGIE
[fr] Stratégie
Übersetzen Sie nicht Wort für Wort. Fragen Sie sich: Was braucht Jonas mit Kindern und Auto? [fr] Ne traduisez pas mot à mot. Demandez-vous ce dont Jonas a besoin, avec ses enfants et sa voiture.` },
      placements: [{ media: 'b1-kultur-atelier-mediation-faltblatt', caption: 'Faltblatt des Festivals (auf Französisch)' }],
      questions: [
        fill('q1', bi('Notizen für Jonas: Ergänzen Sie auf Deutsch.', 'Notes pour Jonas : complétez en allemand.'),
          'Festival vom 11. bis zum [[1]] Juli im Park · Samstag: Trommelworkshop für Kinder, [[2]] Euro pro Kind · Anmeldung vor dem [[3]] Juli · Parkplätze am Park: [[4]]',
          [['13.', 'dreizehnten'], ['5', 'fünf'], ['5.', 'fünften'], ['keine', 'keine Parkplätze', 'es gibt keine', 'gibt es nicht', 'nein']],
          'Les informations utiles pour Jonas : les dates (jusqu’au 13), l’atelier de percussions (« Trommelworkshop ») à 5 € par enfant avec inscription avant le 5 juillet, et l’absence de parking.'),
        choice('q2', bi('Was ist für Jonas besonders wichtig?', 'Qu’est-ce qui est particulièrement important pour Jonas ?'), [
          ['Das Festival findet in diesem Jahr zum elften Mal statt.'],
          ['Er muss die Kinder vor dem 5. Juli anmelden.', true],
          ['Getränke kann man auf dem Festival vor Ort kaufen.'],
        ], 'Ses enfants ont 7 et 10 ans : l’atelier leur convient, mais l’inscription est obligatoire avant le 5 juillet. S’il l’apprend trop tard, les enfants ne pourront pas participer. Les autres informations sont secondaires.'),
        choice('q3', bi('Jonas kommt mit dem Auto. Was sagen Sie ihm?', 'Jonas vient en voiture. Que lui dites-vous ?'), [
          ['Du kannst direkt am Park parken, dort gibt es viele freie Plätze.'],
          ['Vom Bahnhof fährt ein Shuttlebus, aber er kostet acht Euro.'],
          ['Am Park gibt es keine Parkplätze, nimm den Gratisbus vom Bahnhof.', true],
        ], '« pas de parking sur le site » et « navette gratuite depuis la gare toutes les 20 minutes ». Les 8 € sont le prix du bal du samedi soir, pas de la navette.'),
        choice('q4', bi('Wie sagen Sie „apportez un plat à partager“ auf Deutsch?', 'Comment dites-vous « apportez un plat à partager » en allemand ?'), [
          ['Bringt etwas zu essen für alle mit.', true],
          ['Kauft euer Essen am Sonntag dort vor Ort.'],
          ['Teilt euch einen Teller.'],
        ], 'On transmet le sens : chacun apporte de quoi manger pour tout le monde. « Teilt euch einen Teller » traduit mot à mot (« plat » = assiette) et trahit le sens ; sur place, on n’achète que les boissons.'),
        order('q5', bi('Bilden Sie einen einfachen Satz für Jonas.', 'Formez une phrase simple pour Jonas.'), [
          ['Wenn', 'es', 'regnet,', 'finden', 'die Konzerte', 'im Zelt', 'statt.'],
          ['Wenn', 'es', 'regnet,', 'finden', 'im Zelt', 'die Konzerte', 'statt.'],
        ], '« En cas de pluie » se rend simplement par « Wenn es regnet ». La principale commence par le verbe « finden », et la particule « statt » termine la phrase.'),
        fill('q6', bi('Ergänzen Sie für Jonas.', 'Complétez pour Jonas.'),
          'Das Konzert am Freitag ist [[1]]. Für den Tanzabend am Samstag bezahlt man acht [[2]].',
          [['kostenlos', 'gratis', 'umsonst'], ['Euro']],
          '« gratuit » : kostenlos (aussi gratis, umsonst). « frei » ne s’emploie qu’avec l’entrée : « Der Eintritt ist frei ». « bal populaire » se transmet simplement par « Tanzabend ».'),
      ] },

    { id: 'b1-kultur-atelier-korrektur', kind: 'exercise', title: 'Corriger : les erreurs typiques des francophones', estimatedMinutes: 10,
      competences: ['lecture', 'expression-ecrite'],
      lesson: { description: bi('Diese Sätze schreiben französischsprachige Lernende oft falsch. Finden Sie die richtige Form.', 'Les francophones se trompent souvent dans ces phrases. Trouvez la forme correcte.') },
      questions: [
        fill('q1', bi('Ergänzen Sie die Adjektivendung.', 'Complétez la terminaison de l’adjectif.'),
          'Gestern haben wir einen [[1]] Abend erlebt (schön).',
          [['schönen']],
          'Accusatif masculin après « einen » : -en. L’erreur fréquente est d’oublier la terminaison (« einen schön Abend ») comme en français, où l’adjectif ne change pas autant.'),
        fill('q2', bi('Ergänzen Sie: Das war letztes Jahr ein Fehler.', 'Complétez : « Nous aurions dû apporter plus de chaises. »'),
          'Wir [[1]] mehr Stühle mitbringen sollen.',
          [['hätten']],
          '« nous aurions dû » : « wir hätten … sollen », avec les deux infinitifs à la fin. On ne dit pas « wir sollten haben » ni « wir hätten gesollt ».'),
        choice('q3', bi('Sie versprechen, dass Sie morgen kommen. Was ist richtig?', 'Vous promettez : « Je viendrai demain. » Quelle phrase est juste ?'), [
          ['Ich will morgen kommen.'],
          ['Ich werde morgen kommen.', true],
          ['Ich wird morgen kommen.'],
        ], 'Le futur se forme avec « werden » : ich werde. « Ich will » signifie « je veux » : faux ami fréquent. « wird » est la 3e personne (er, sie, es).'),
        fill('q4', bi('Ergänzen Sie die Adjektivendung ohne Artikel.', 'Complétez la terminaison sans article.'),
          'Bei [[1]] Regen (stark) feiern wir in der Halle.',
          [['starkem']],
          'Sans article, l’adjectif prend la terminaison de l’article : bei dem Regen → bei starkem Regen (datif masculin).'),
        order('q5', C.ordnen, [
          ['Wir', 'hoffen,', 'dass', 'viele', 'Nachbarn', 'kommen', 'werden.'],
        ], 'Subordonnée en « dass » : l’auxiliaire du futur « werden » va à la fin, après l’infinitif « kommen ». En français, l’ordre reste le même qu’en principale : c’est l’erreur à éviter.'),
        choice('q6', bi('Was ist richtig? „Die … Kinder liefen über den Hof.“ (lachen)', 'Qu’est-ce qui est juste ? (Les enfants qui riaient couraient dans la cour.)'), [
          ['gelachten'],
          ['lachenden', true],
          ['lachende'],
        ], 'Action en cours, sens actif : participe I (lachend) + -en au pluriel après « die ». « gelacht » est un participe II, et « lachende » oublie la terminaison -en du pluriel après l’article.'),
        choice('q7', bi('Sie schreiben an Ihre Nachbarn (ihr). Welcher Schluss passt?', 'Vous écrivez à vos voisins (tutoiement collectif). Quelle formule finale convient ?'), [
          ['Hochachtungsvoll'],
          ['Wir freuen uns auf euch! Viele Grüße', true],
          ['Mit freundlichen Grüßen, Ihre Familie Haddad'],
        ], 'Dans un courriel familier (ihr, euch), on termine par une formule amicale. « Hochachtungsvoll » est très solennel et vieilli, et la troisième formule vouvoie, ce qui ne va pas avec le tutoiement du reste du message.'),
      ] },

    { id: 'b1-kultur-atelier-pruefung', kind: 'exercise', title: 'Entraînement à l’examen : lecture et écoute en conditions réelles', estimatedMinutes: 20,
      competences: ['lecture', 'ecoute'],
      lesson: { description: `PRÜFUNGSTRAINING · LESEN UND HÖREN
[fr] Entraînement à l’examen : lecture et écoute

${bi('Diese Übung ist wie eine kleine Prüfung. Arbeiten Sie ohne Wörterbuch und ohne Pause.', 'Cet exercice est comme un petit examen : travaillez sans dictionnaire et sans pause.')}

ZEIT
[fr] Temps
Teil 1, Lesen: 8 Minuten. Teil 2, Hören: 8 Minuten, Sie hören den Text zweimal. Kontrolle: 4 Minuten. [fr] Partie 1, lecture : 8 minutes. Partie 2, écoute : 8 minutes, texte entendu deux fois. Vérification : 4 minutes.

STRATEGIE
[fr] Stratégie
Lesen Sie immer zuerst die Aufgaben. Dann wissen Sie, welche Informationen Sie suchen. [fr] Lisez toujours d’abord les questions : vous savez alors quelles informations chercher.
Bleiben Sie nicht zu lange bei einer Frage. Kontrollieren Sie am Ende alles noch einmal. [fr] Ne restez pas trop longtemps sur une question. À la fin, vérifiez tout encore une fois.

TEIL 1 · LESEN: AUS DEM STADTANZEIGER
[fr] Partie 1 · lecture : extrait du journal municipal (questions 1 à 4)

Stadtfest: Was ist neu?
Nach der Kritik im letzten Jahr hat das Organisationsteam einiges geändert. Damals war der Marktplatz am Abend so voll, dass viele Familien früher nach Hause gegangen sind. Dieses Jahr wird das Fest deshalb auf zwei Plätze verteilt: Auf dem Marktplatz spielen wie immer die Bands, im Rosengarten gibt es ein ruhigeres Programm für Familien mit Kindern. Neu ist auch das Pfandsystem: Getränke werden nur noch in Mehrwegbechern verkauft. Wer seinen Becher zurückgibt, bekommt zwei Euro zurück. Der Eintritt bleibt frei. Wegen der vielen Besucher bittet die Stadt alle, mit dem Fahrrad oder mit dem Bus zu kommen: Am Festwochenende fahren die Busse bis ein Uhr nachts alle fünfzehn Minuten.

TEIL 2 · HÖREN: KULTURTIPPS IM RADIO
[fr] Partie 2 · écoute : conseils culturels à la radio (questions 5 à 8)
${bi('Hören Sie die Kulturtipps zweimal und beantworten Sie die Fragen 5 bis 8.', 'Écoutez deux fois les conseils culturels et répondez aux questions 5 à 8.')}` },
      placements: [{ media: 'b1-kultur-atelier-pruefung-radio', transcriptVisibility: 'after_answer' }],
      questions: [
        rf('q1', 'Letztes Jahr sind viele Familien wegen der vielen Menschen früher gegangen.', 'r',
          'Vrai : « Damals war der Marktplatz am Abend so voll, dass viele Familien früher nach Hause gegangen sind. » « so …, dass » exprime la conséquence.'),
        rf('q2', 'Im Rosengarten spielen dieses Jahr die Bands.', 'f',
          'Faux : les groupes jouent « wie immer » sur la place du marché ; le Rosengarten accueille « ein ruhigeres Programm für Familien ».'),
        rf('q3', 'Die Bands kommen dieses Jahr alle aus der Region.', 'n',
          'Non mentionné : le texte ne dit rien de l’origine des groupes, seulement où ils jouent.'),
        choice('q4', bi('Was bekommt man, wenn man seinen Becher zurückgibt?', 'Que reçoit-on quand on rend son gobelet ?'), [
          ['Ein Getränk gratis.'],
          ['Einen Platz im Rosengarten.'],
          ['Zwei Euro.', true],
        ], '« Wer seinen Becher zurückgibt, bekommt zwei Euro zurück » : c’est le principe de la consigne (das Pfand), vu au thème 10.'),
        choice('q5', bi('Was passiert am Freitag, wenn es regnet?', 'Que se passe-t-il vendredi s’il pleut ?'), [
          ['Der Film wird nicht gezeigt.', true],
          ['Der Film läuft im Museum.'],
          ['Der Film beginnt eine Stunde später.'],
        ], '« Bei Regen fällt die Vorführung leider aus » : « ausfallen » signifie être annulé. Aucune salle de remplacement n’est annoncée.'),
        choice('q6', bi('Wie viel bezahlen Studierende für die lange Nacht der Museen?', 'Combien paient les étudiants pour la longue nuit des musées ?'), [
          ['Acht Euro.'],
          ['Fünf Euro.', true],
          ['Nichts.'],
        ], '« Eine Karte kostet acht Euro, für Schüler und Studierende fünf Euro. » L’entrée libre concerne le concert du dimanche.'),
        choice('q7', bi('Was gibt es am Samstag um 20 Uhr?', 'Qu’y a-t-il samedi à 20 heures ?'), [
          ['Ein Konzert der Musikschule.'],
          ['Den Film „Sommer am See“.'],
          ['Eine Führung für Familien.', true],
        ], '« Um zwanzig Uhr gibt es eine Führung für Familien » au musée. Le concert de l’école de musique a lieu dimanche à 11 heures, le film vendredi à 21 h 30.'),
        choice('q8', bi('Was sollte man für das Konzert am Sonntag tun?', 'Que vaut-il mieux faire pour le concert de dimanche ?'), [
          ['Vorher telefonisch einen Platz reservieren.', true],
          ['Eine Karte im Museum kaufen.'],
          ['Früh kommen, weil es keine Reservierung gibt.'],
        ], '« Die Plätze sind begrenzt. Reservieren Sie deshalb am besten vorher telefonisch. » L’entrée est libre, mais il faut réserver.'),
      ] },

    { id: 'b1-kultur-atelier-schreiben', kind: 'mission', title: 'Mission : inviter à une fête et tirer le bilan de la dernière', estimatedMinutes: 25,
      competences: ['expression-ecrite'],
      lesson: { description: `DIE SITUATION
[fr] La situation
Letzten Sommer haben Sie mit Ihren Nachbarn ein Hoffest organisiert. Dieses Jahr möchten Sie wieder eins machen und schreiben eine E-Mail an alle Nachbarn. [fr] L’été dernier, vous avez organisé une fête dans la cour avec vos voisins. Cette année, vous voulez recommencer et vous écrivez un courriel à tous les voisins.

IHRE NOTIZEN
[fr] Vos notes
• letztes Jahr: tolles Buffet, viele neue Kontakte, Kinderspiele im Hof
• Probleme: zu wenige Stühle, um 20 Uhr Regen und kein Zelt, Musik nach 22 Uhr zu laut
• dieses Jahr: Samstag, 21. Juni, ab 16 Uhr, Hof der Lindenstraße 12, Zelt vom Sportverein, Flohmarkt für Kinder
• Bitte: Essen für das Buffet, Stühle, Hilfe beim Aufbau um 15 Uhr

REDEMITTEL
[fr] Formules utiles
• Liebe Nachbarinnen und Nachbarn,
• Erinnert ihr euch an …? / Letztes Jahr war … besonders schön.
• Wir hätten … sollen. / Es wäre besser gewesen, … zu …
• Deshalb laden wir euch herzlich zu … ein.
• Es wird … geben. / Dieses Jahr werden wir …
• Bringt bitte … mit! / Wer kann beim Aufbau helfen?
• Wir freuen uns auf euch! Viele Grüße

${bi('Planen Sie 5 Minuten, schreiben Sie 15 Minuten und lesen Sie Ihren Text dann 5 Minuten lang noch einmal.', 'Prévoyez 5 minutes de plan, 15 minutes de rédaction et 5 minutes de relecture.')}` },
      mission: {
        oral: null,
        written: {
          prompt: lines(
            bi('Schreiben Sie eine E-Mail an alle Nachbarn (120 bis 150 Wörter).', 'Écrivez un courriel à tous les voisins (120 à 150 mots).'),
            bi('Erinnern Sie an das Fest vom letzten Jahr: Was war schön?', 'Rappelez la fête de l’an dernier : qu’est-ce qui était bien ?'),
            bi('Sagen Sie, was Sie letztes Jahr besser hätten machen sollen.', 'Dites ce que vous auriez dû mieux faire l’an dernier.'),
            bi('Laden Sie zum neuen Fest ein: Wann? Wo? Was wird es geben?', 'Invitez à la nouvelle fête : quand ? où ? qu’y aura-t-il ?'),
            bi('Bitten Sie um Hilfe oder um etwas für das Buffet.', 'Demandez de l’aide ou une contribution au buffet.'),
          ),
          maxChars: 1500, minWords: 120,
        },
        checklist: [
          bi('Ich duze die Nachbarn vom Anfang bis zum Ende (ihr, euch).', 'Je tutoie les voisins du début à la fin.'),
          bi('Ich erinnere an zwei schöne Momente vom letzten Jahr.', 'Je rappelle deux bons moments de l’an dernier.'),
          bi('Ich sage, was wir besser hätten machen sollen (Wir hätten … sollen).', 'Je dis ce que nous aurions dû faire autrement.'),
          bi('Ich nenne Datum, Uhrzeit, Ort und Programm (Es wird … geben).', 'Je donne la date, l’heure, le lieu et le programme.'),
          bi('Ich bitte um Hilfe und schließe freundlich.', 'Je demande de l’aide et je conclus amicalement.'),
        ],
        criteria: grid(GRIDS.b1.schreiben, 'Tâche : bilan de l’an dernier (réussites et ce qu’il aurait fallu faire), invitation complète (date, lieu, programme), demande d’aide, registre familier (ihr)'),
      } },

    { id: 'b1-kultur-atelier-sprechen', kind: 'mission', title: 'Mission : planifier une fête à deux', estimatedMinutes: 20,
      competences: ['expression-orale'],
      lesson: { description: `DIE SITUATION
[fr] La situation
Sie organisieren mit Ihrem Nachbarn Theo das Hoffest. Theo hat Ihnen eine Nachricht mit vier Vorschlägen geschickt. Rufen Sie ihn zurück. [fr] Vous organisez la fête de la cour avec votre voisin Theo. Il vous a laissé un message avec quatre propositions. Rappelez-le.
${bi('Hören Sie die Nachricht. Sie können sie auch zweimal hören.', 'Écoutez le message. Vous pouvez aussi l’écouter deux fois.')}

WICHTIG
[fr] Important
• Laut Hausordnung beginnt die Nachtruhe um 22 Uhr. [fr] D’après le règlement, le repos nocturne commence à 22 heures.
• Die Hausgemeinschaft hat 150 Euro für das Fest. [fr] Les habitants disposent de 150 euros pour la fête.
• Viele Familien mit kleinen Kindern wohnen im Haus. [fr] Beaucoup de familles avec de jeunes enfants habitent l’immeuble.

REDEMITTEL
[fr] Formules utiles
• accepter : Gute Idee! / Einverstanden, weil …
• refuser poliment : Das klingt gut, aber … / Ich bin nicht sicher, ob …
• contre-proposer : Ich wäre eher für … / Wie wäre es, wenn …?
• conclure : Also, wir machen Folgendes: … / Dann sind wir uns einig.

${bi('Bereiten Sie sich 5 Minuten vor. Nehmen Sie dann Ihre Antwort an Theo auf.', 'Préparez-vous 5 minutes, puis enregistrez votre réponse à Theo.')}` },
      placements: [{ media: 'b1-kultur-atelier-sprechen-theo', transcriptVisibility: 'on_demand' }],
      mission: {
        oral: {
          prompt: lines(
            bi('Hören Sie die Nachricht von Theo. Er macht vier Vorschläge für das Hoffest.', 'Écoutez le message de Theo. Il fait quatre propositions pour la fête de la cour.'),
            bi('Rufen Sie Theo zurück und reagieren Sie auf jeden Vorschlag (etwa zweieinhalb Minuten).', 'Rappelez Theo et réagissez à chaque proposition (environ deux minutes et demie).'),
            bi('Stimmen Sie zu oder machen Sie einen Gegenvorschlag, immer mit einem Grund.', 'Acceptez ou faites une contre-proposition, toujours avec une raison.'),
            bi('Fassen Sie am Ende zusammen, was Sie entscheiden.', 'Résumez à la fin ce que vous décidez.'),
          ),
          maxSeconds: 150,
        },
        written: null,
        checklist: [
          bi('Ich reagiere auf alle vier Vorschläge von Theo.', 'Je réagis aux quatre propositions de Theo.'),
          bi('Ich begründe jede Antwort (weil …, denn …).', 'Je justifie chaque réponse.'),
          bi('Ich mache mindestens einen Gegenvorschlag (Ich wäre eher für …).', 'Je fais au moins une contre-proposition.'),
          bi('Ich denke an die Nachtruhe um 22 Uhr und an das Budget.', 'Je tiens compte du repos nocturne et du budget.'),
          bi('Am Ende fasse ich zusammen, was wir entscheiden.', 'Je résume à la fin ce que nous décidons.'),
        ],
        criteria: grid(GRIDS.b1.sprechen, 'Tâche : réaction justifiée aux quatre propositions, au moins une contre-proposition, contraintes respectées, décision résumée'),
      } },

    { id: 'b1-kultur-atelier-bilan', kind: 'lesson', title: 'Faire le point : fin du niveau B1', estimatedMinutes: 6,
      competences: ['lecture'],
      lesson: { description: `FAIRE LE POINT
C’est le dernier module du niveau B1. Relisez ces objectifs : si l’un d’eux vous fait hésiter, refaites l’exercice indiqué avant l’examen blanc.

DAS KANN ICH JETZT
[fr] Ce que je sais faire maintenant
• Ich kann ein Kulturprogramm und eine Kritik verstehen. [fr] Je peux comprendre un programme culturel et une critique (module thème, « Comprendre »).
• Ich kann zu einem Fest einladen und sagen, was wir besser hätten machen sollen. [fr] Je peux inviter à une fête et dire ce que nous aurions dû mieux faire (« Modèle », mission écrite).
• Ich kann mit jemandem ein Fest planen und Gegenvorschläge machen. [fr] Je peux planifier une fête avec quelqu’un et faire des contre-propositions (« Réagir », mission orale).
• Ich kann einen französischen Text auf Deutsch weitergeben. [fr] Je peux transmettre en allemand un document français (« Médiation »).
• Ich kann in Prüfungszeit lesen und hören. [fr] Je peux lire et écouter dans le temps d’un examen (« Entraînement à l’examen »).

MES STRATÉGIES POUR L’EXAMEN BLANC
• Toujours lire les questions avant le texte ou l’écoute.
• « Steht nicht im Text » : choisir cette réponse seulement si le texte n’en dit rien du tout.
• À l’écrit : un plan rapide, tous les points de la consigne, puis cinq minutes de relecture (verbe, cas, terminaisons).
• À l’oral : des mots-clés, jamais un texte rédigé ; réagir, justifier, conclure.

À REVOIR
• La déclinaison de l’adjectif et le Futur I (module thème, « Retenir »).
• Les formules de ce module : Wir hätten … sollen. Es wird … geben. Ich wäre eher für …
• Les leçons « Retenir » des thèmes 10 et 11 : Konjunktiv II, comparatif, je … desto, connecteurs doubles, relatives.` } },
  ],
};
