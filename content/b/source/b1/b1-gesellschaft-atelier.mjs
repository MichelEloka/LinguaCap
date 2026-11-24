// Module 22 · b1-gesellschaft-atelier (lot R4, thème 11) : transmettre une information à un groupe.
// Médiation : reformuler en allemand simple, pour un nouveau venu, un courriel interne compliqué.
// Examen : Hören, discussion à la radio, « qui dit quoi ? » (animateur, invitée, invité).
// Missions : candidature formelle pour une activité bénévole (80 à 120 mots) ; réagir à un exposé enregistré (90 s).
// Reprise réécrite du brouillon B1 V1 (partie3.mjs › b1-gesellschaft, leçon « vermittlung » et tâches).
import { C, bi, choice, fill, order, speak, GRIDS } from '../../lib.mjs';

const speakLong = (id, text, explanation, accept) => ({ ...speak(id, text, explanation, accept), threshold: 70 });
const grid = (criteria, aufgabe) => criteria.map((criterion) => (criterion.id === 'aufgabe' ? { ...criterion, label: aufgabe } : { ...criterion }));
const lines = (...items) => items.join('\n');
// « Wer sagt das? » : trois locuteurs de la discussion radio, dans l’ordre de leur première prise de parole.
const WHO = ['der Moderator', 'Frau Lehmann', 'Herr Brandt'];
const who = (id, statement, speaker, explanation) => choice(id, bi(`Wer sagt das? „${statement}“`, 'Qui dit cela ?'),
  WHO.map((name) => [name, name === speaker]), explanation);

export default {
  id: 'b1-gesellschaft-atelier',
  title: 'Gesellschaft (atelier) : transmettre une information, réagir à un exposé',
  objective: 'Postuler par écrit pour une activité bénévole, reformuler une information compliquée pour un nouveau venu, suivre une discussion à la radio et réagir à un exposé par un retour et une question.',
  sources: [
    'Textes, dialogues et exercices originaux LinguaCap.',
    'Situations reprises et réécrites du brouillon B1 V1 (LinguaCap) : reformuler pour un nouveau venu, informer les bénévoles.',
  ],
  vocabulary: [
    { word: 'Bewerbung', article: 'die', plural: 'Bewerbungen', partOfSpeech: 'noun', translation: 'la candidature',
      example: 'Vielen Dank für Ihre Bewerbung!', note: null },
    { word: 'sich bewerben als', partOfSpeech: 'verb', translation: 'postuler comme, se porter candidat comme',
      example: 'Ich möchte mich als Lesepatin bewerben.', note: 'sich bewerben um eine Stelle (+ accusatif)' },
    { word: 'Anzeige', article: 'die', plural: 'Anzeigen', partOfSpeech: 'noun', translation: 'l’annonce',
      example: 'Ich habe Ihre Anzeige in der Stadtteilzeitung gelesen.', note: null },
    { word: 'Betreff', article: 'der', plural: 'Betreffe', partOfSpeech: 'noun', translation: 'l’objet (d’un courriel)',
      example: 'Im Betreff steht: Bewerbung als Lesepatin.', note: null },
    { word: 'zur Verfügung stehen', partOfSpeech: 'expression', translation: 'être disponible',
      example: 'Ich stehe dienstags ab 15 Uhr zur Verfügung.', note: null },
    { word: 'Erfahrung sammeln', partOfSpeech: 'expression', translation: 'acquérir de l’expérience',
      example: 'In einem Sportverein habe ich viel Erfahrung gesammelt.', note: null },
    { word: 'Einarbeitung', article: 'die', plural: null, partOfSpeech: 'noun', translation: 'la formation de départ, la prise de poste',
      example: 'Gibt es eine Einarbeitung für neue Helfer?', note: null },
    { word: 'Lesepatin', article: 'die', plural: 'Lesepatinnen', partOfSpeech: 'noun', translation: 'la bénévole qui lit avec des enfants',
      example: 'Als Lesepatin lese ich einmal pro Woche mit Kindern.', note: 'der Lesepate (n-Deklination : den Lesepaten)' },
    { word: 'Rückmeldung', article: 'die', plural: 'Rückmeldungen', partOfSpeech: 'noun', translation: 'le retour, l’avis (feedback)',
      example: 'Danke für deine Rückmeldung!', note: null },
    { word: 'Mir hat besonders gefallen, dass …', partOfSpeech: 'expression', translation: 'Ce qui m’a particulièrement plu, c’est que …',
      example: 'Mir hat besonders gefallen, dass du viele Beispiele gebracht hast.', note: null },
    { word: 'Ich hätte noch eine Frage zu …', partOfSpeech: 'expression', translation: 'J’aurais encore une question sur …',
      example: 'Ich hätte noch eine Frage zu den Kosten.', note: 'zu + datif' },
    { word: 'Einwand', article: 'der', plural: 'Einwände', partOfSpeech: 'noun', translation: 'l’objection',
      example: 'Das ist ein berechtigter Einwand.', note: null },
    { word: 'Pflicht', article: 'die', plural: 'Pflichten', partOfSpeech: 'noun', translation: 'l’obligation, le devoir',
      example: 'Ein soziales Jahr ist in Deutschland keine Pflicht.', note: 'verpflichtend : obligatoire' },
    { word: 'Freiwilligendienst', article: 'der', plural: 'Freiwilligendienste', partOfSpeech: 'noun', translation: 'le service volontaire',
      example: 'Nach dem Abitur hat er einen Freiwilligendienst gemacht.', note: null },
    { word: 'Verantwortung', article: 'die', plural: null, partOfSpeech: 'noun', translation: 'la responsabilité',
      example: 'Bei dieser Arbeit lernt man, Verantwortung zu übernehmen.', note: 'Verantwortung übernehmen' },
    { word: 'in einfacher Sprache', partOfSpeech: 'expression', translation: 'en langage simple',
      example: 'Kannst du das in einfacher Sprache erklären?', note: null },
    { word: 'Mit freundlichen Grüßen', partOfSpeech: 'expression', translation: 'Veuillez agréer mes salutations distinguées (lettre formelle)',
      example: 'Mit freundlichen Grüßen, Inès Morel', note: 'pas de virgule après la formule en allemand' },
  ],
  media: [
    { key: 'b1-gesellschaft-atelier-modell-audio', kind: 'audio', title: 'Candidature modèle lue à voix haute',
      script: [
        { voice: 'frau3', name: 'Inès', text: 'Betreff: Bewerbung als Lesepatin.' },
        { pause: 0.6 },
        { voice: 'frau3', name: 'Inès', text: 'Sehr geehrte Frau Kern, in der Stadtteilzeitung habe ich Ihre Anzeige gelesen, und ich möchte mich gern als Lesepatin bewerben.' },
        { pause: 0.6 },
        { voice: 'frau3', name: 'Inès', text: 'Ich bin vierunddreißig Jahre alt, komme aus Belgien und lebe seit drei Jahren in Leipzig. In meiner Heimat habe ich zwei Jahre lang in einer Schulbibliothek mitgeholfen. Ich lese nicht nur selbst sehr gern, sondern ich habe auch viel Geduld mit Kindern.' },
        { pause: 0.6 },
        { voice: 'frau3', name: 'Inès', text: 'Ich stehe dienstags und donnerstags ab fünfzehn Uhr zur Verfügung. Ich hätte noch eine Frage: Gibt es eine Einarbeitung für neue Lesepaten?' },
        { pause: 0.6 },
        { voice: 'frau3', name: 'Inès', text: 'Über eine Antwort würde ich mich sehr freuen. Mit freundlichen Grüßen, Inès Morel.' },
      ] },
    { key: 'b1-gesellschaft-atelier-interaktion-f1', kind: 'audio', title: 'Réplique 1 : accueil au Sprachcafé',
      script: [{ voice: 'frau', name: 'Nadine', text: 'Schön, dass Sie da sind! Haben Sie schon einmal ehrenamtlich gearbeitet?' }] },
    { key: 'b1-gesellschaft-atelier-interaktion-f2', kind: 'audio', title: 'Réplique 2 : un nouvel invité',
      script: [{ voice: 'mann3', name: 'Gast', text: 'Entschuldigung, ich bin neu hier. Muss ich etwas bezahlen?' }] },
    { key: 'b1-gesellschaft-atelier-interaktion-f3', kind: 'audio', title: 'Réplique 3 : une collègue malade',
      script: [{ voice: 'frau3', name: 'Lena', text: 'Ich bin leider krank. Kannst du am Mittwoch für mich einspringen?' }] },
    { key: 'b1-gesellschaft-atelier-interaktion-f4', kind: 'audio', title: 'Réplique 4 : après un exposé',
      script: [{ voice: 'mann', name: 'Referent', text: 'Das war meine Präsentation. Haben Sie noch Fragen oder Anmerkungen?' }] },
    { key: 'b1-gesellschaft-atelier-pruefung-sprecher', kind: 'image', title: 'Les trois personnes de la discussion',
      alt: 'Trois fiches : Jan Krüger, animateur de l’émission ; Mme Lehmann, directrice d’une maison de retraite ; M. Brandt, étudiant en travail social.',
      image: { layout: 'cards', cards: [
        { icon: 'mic', title: 'Jan Krüger', intro: [{ text: 'Moderator' }] },
        { icon: 'heart-handshake', title: 'Frau Lehmann', intro: [{ text: 'leitet ein Seniorenheim' }] },
        { icon: 'graduation-cap', title: 'Herr Brandt', intro: [{ text: 'studiert Sozialarbeit' }] },
      ] } },
    { key: 'b1-gesellschaft-atelier-pruefung-radio', kind: 'audio', title: 'Discussion radio : une année obligatoire pour la société ?',
      script: [
        { voice: 'sprecher', name: 'Moderator', text: 'Guten Abend und willkommen beim Stadtgespräch. Unser Thema heute: Sollte jeder junge Mensch nach der Schule ein Jahr für die Gesellschaft arbeiten, zum Beispiel im Krankenhaus, im Altenheim oder im Umweltschutz? Bei mir im Studio sind Frau Lehmann, sie leitet ein Seniorenheim, und Herr Brandt, er studiert Sozialarbeit. Frau Lehmann, Sie sind für ein Pflichtjahr. Warum?' },
        { pause: 0.5 },
        { voice: 'frau2', name: 'Frau Lehmann', text: 'Ganz einfach: Wir finden kaum noch Freiwillige. In meinem Haus helfen zurzeit drei junge Leute. Sie gehen mit den Bewohnern spazieren, lesen ihnen vor oder helfen beim Essen. Ohne sie hätten unsere Pflegekräfte für solche Dinge keine Zeit. Und die jungen Leute lernen dabei etwas, was man in keiner Schule lernt: Verantwortung.' },
        { pause: 0.5 },
        { voice: 'sprecher', name: 'Moderator', text: 'Herr Brandt, Sie sehen das anders.' },
        { pause: 0.4 },
        { voice: 'mann3', name: 'Herr Brandt', text: 'Ja. Ich habe nach dem Abitur selbst ein freiwilliges Jahr gemacht, in einer Kita, und das war eine tolle Erfahrung. Aber gerade deshalb bin ich gegen eine Pflicht. Wer gezwungen wird, macht die Arbeit nicht mit Freude. Und die Menschen im Heim merken das sofort.' },
        { pause: 0.5 },
        { voice: 'frau2', name: 'Frau Lehmann', text: 'Das sehe ich nicht so. Viele junge Leute wissen einfach nicht, was es alles gibt. Ein Pflichtjahr würde ihnen zeigen, wie unsere Gesellschaft funktioniert. Und manche bleiben danach sogar im sozialen Bereich.' },
        { pause: 0.5 },
        { voice: 'mann3', name: 'Herr Brandt', text: 'Mag sein. Aber dann sollten wir das freiwillige Jahr attraktiver machen. Im Moment bekommt man nur ein kleines Taschengeld. Davon kann man in einer großen Stadt kaum leben. Wenn die Bezahlung besser wäre, würden sich sicher mehr junge Menschen melden.' },
        { pause: 0.5 },
        { voice: 'sprecher', name: 'Moderator', text: 'Da sind wir beim Geld. Frau Lehmann, wer soll das bezahlen?' },
        { pause: 0.4 },
        { voice: 'frau2', name: 'Frau Lehmann', text: 'Der Staat natürlich. Das Geld wäre gut investiert, weil wir alle davon profitieren.' },
        { pause: 0.5 },
        { voice: 'sprecher', name: 'Moderator', text: 'Wir haben auch unsere Hörerinnen und Hörer gefragt. Die Meinungen sind sehr unterschiedlich: Ungefähr die Hälfte ist für ein Pflichtjahr, die andere Hälfte dagegen. Viele wünschen sich aber, dass freiwilliges Engagement mehr anerkannt wird. Frau Lehmann, Herr Brandt, vielen Dank für das Gespräch!' },
      ] },
    { key: 'b1-gesellschaft-atelier-sprechen-praesentation', kind: 'audio', title: 'Exposé de Leonie : l’aide aux courses du quartier',
      script: [
        { voice: 'frau3', name: 'Leonie', text: 'Hallo zusammen! Ich möchte euch heute kurz unser neues Projekt vorstellen: die Einkaufshilfe im Viertel. Viele ältere Menschen können nicht mehr gut laufen, und der nächste Supermarkt ist zwei Kilometer entfernt. Deshalb kaufen Freiwillige einmal pro Woche für sie ein.' },
        { pause: 0.5 },
        { voice: 'frau3', name: 'Leonie', text: 'Die Bewohner rufen montags bei uns an und sagen, was sie brauchen. Am Dienstag bringen wir die Einkäufe nach Hause, und das Geld bekommen wir bar zurück. Im Moment machen zwölf Freiwillige mit, und wir helfen schon dreißig Menschen.' },
        { pause: 0.5 },
        { voice: 'frau3', name: 'Leonie', text: 'Aber wir haben noch ein Problem: Wir haben kein Auto, und schwere Sachen wie Wasserkisten sind mit dem Fahrrad schwierig. Wir suchen also sowohl neue Helfer als auch eine Lösung für den Transport. Vielen Dank fürs Zuhören! Habt ihr Fragen oder Ideen?' },
      ] },
  ],
  activities: [
    { id: 'b1-gesellschaft-atelier-modell', kind: 'lesson', title: 'Modèle : une candidature pour une activité bénévole', estimatedMinutes: 12,
      competences: ['lecture', 'ecoute'],
      lesson: { description: `${bi('Lesen Sie die Anzeige und die Bewerbung. Hören Sie die Bewerbung auch an. Achten Sie auf den Aufbau.', 'Lisez l’annonce et la candidature, écoutez aussi la candidature. Observez sa structure.')}

DIE ANZEIGE
[fr] L’annonce
Lesepatinnen und Lesepaten gesucht! Die Stadtbibliothek sucht Freiwillige, die einmal pro Woche mit Kindern zwischen 6 und 10 Jahren lesen. Wir bieten eine Einarbeitung und im Sommer ein kleines Dankeschön-Fest. Bewerbung per E-Mail an Frau Kern.

DIE BEWERBUNG
[fr] La candidature
Betreff: Bewerbung als Lesepatin

Sehr geehrte Frau Kern,
in der Stadtteilzeitung habe ich Ihre Anzeige gelesen, und ich möchte mich gern als Lesepatin bewerben.
Ich bin 34 Jahre alt, komme aus Belgien und lebe seit drei Jahren in Leipzig. In meiner Heimat habe ich zwei Jahre lang in einer Schulbibliothek mitgeholfen. Ich lese nicht nur selbst sehr gern, sondern ich habe auch viel Geduld mit Kindern.
Ich stehe dienstags und donnerstags ab 15 Uhr zur Verfügung. Ich hätte noch eine Frage: Gibt es eine Einarbeitung für neue Lesepaten?
Über eine Antwort würde ich mich sehr freuen.
Mit freundlichen Grüßen
Inès Morel

AUFBAU
[fr] Structure
• Betreff : l’objet dit en quelques mots pourquoi on écrit.
• Anrede : Sehr geehrte Frau Kern, (virgule, puis minuscule à la ligne suivante).
• Einleitung : où l’on a lu l’annonce et ce que l’on veut.
• Über mich : âge, origine, expérience, qualités, avec un exemple concret.
• Zeit und Frage : disponibilités, puis une question précise.
• Schluss : formule de politesse et nom complet.

REDEMITTEL
[fr] Formules utiles
EINLEITEN
[fr] Introduire
• Ich habe Ihre Anzeige in … gelesen. / Ich schreibe Ihnen, weil …
BEGRÜNDEN
[fr] Justifier
• Ich möchte mich engagieren, weil … / Für diese Aufgabe bringe ich … mit.
BEISPIEL
[fr] Donner un exemple
• In meiner Heimat habe ich … / Zum Beispiel habe ich …
SCHLUSS
[fr] Conclure
• Über eine Antwort würde ich mich freuen. / Mit freundlichen Grüßen

À REMARQUER
• Dans une lettre formelle, Sie, Ihnen et Ihre prennent toujours une majuscule.
• « nicht nur …, sondern auch » met en valeur deux qualités : c’est le connecteur double du module thème.
• On ne met pas de virgule après « Mit freundlichen Grüßen ».` },
      placements: [{ media: 'b1-gesellschaft-atelier-modell-audio', transcriptVisibility: 'on_demand' }] },

    { id: 'b1-gesellschaft-atelier-interaktion', kind: 'exercise', title: 'Réagir : accueillir, rassurer, remplacer, donner un retour', estimatedMinutes: 10,
      competences: ['ecoute', 'expression-orale'],
      lesson: { description: `${C.reagieren}

${bi('Sie helfen im Sprachcafé von Türklinke. Hören Sie jede Situation und wählen Sie die passende Antwort. Sprechen Sie dann die Sätze nach.', 'Vous aidez au Sprachcafé de Türklinke. Écoutez chaque situation, choisissez la réponse qui convient, puis répétez les phrases.')}` },
      placements: [
        { media: 'b1-gesellschaft-atelier-interaktion-f1', questionId: 'q1', transcriptVisibility: 'after_answer' },
        { media: 'b1-gesellschaft-atelier-interaktion-f2', questionId: 'q2', transcriptVisibility: 'after_answer' },
        { media: 'b1-gesellschaft-atelier-interaktion-f3', questionId: 'q3', transcriptVisibility: 'after_answer' },
        { media: 'b1-gesellschaft-atelier-interaktion-f4', questionId: 'q4', transcriptVisibility: 'after_answer' },
      ],
      questions: [
        choice('q1', bi('Situation 1: Was antworten Sie?', 'Situation 1 : que répondez-vous ?'), [
          ['Ja, ich arbeite seit drei Jahren in einem Büro im Zentrum.'],
          ['Ja, in meiner Heimatstadt habe ich in einem Sportverein geholfen.', true],
          ['Nein, dafür habe ich neben der Arbeit leider keine Zeit.'],
        ], 'La question porte sur une expérience bénévole : on répond par un exemple précis, au Perfekt. Un emploi de bureau n’est pas du bénévolat, et « je n’ai pas le temps » contredit votre présence au Sprachcafé.'),
        choice('q2', bi('Situation 2: Was antworten Sie?', 'Situation 2 : que répondez-vous ?'), [
          ['Nein, keine Sorge, das Sprachcafé ist kostenlos.', true],
          ['Ja, das Café kostet 24 Euro im Jahr für alle Gäste.'],
          ['Das weiß ich leider nicht. Fragen Sie bitte jemand anderen.'],
        ], 'On rassure (« keine Sorge ») et on donne l’information exacte : le Sprachcafé est gratuit. Les 24 euros sont la cotisation facultative des membres, pas un prix d’entrée.'),
        choice('q3', bi('Situation 3: Was antworten Sie?', 'Situation 3 : que répondez-vous ?'), [
          ['Schade, dann fällt das Sprachcafé am Mittwoch eben aus.'],
          ['Nein, am Mittwoch bin ich leider auch krank, tut mir leid.'],
          ['Klar, das mache ich. Gute Besserung! Wo liegt der Schlüssel?', true],
        ], 'Lena demande si vous pouvez la remplacer (« einspringen »). On accepte, on souhaite un bon rétablissement (« Gute Besserung! ») et on pose la question pratique utile.'),
        choice('q4', bi('Situation 4: Was antworten Sie?', 'Situation 4 : que répondez-vous ?'), [
          ['Ja, ich habe letzte Woche auch eine Präsentation über Musik gemacht.'],
          ['Danke! Mir hat besonders gefallen, dass Sie Beispiele gebracht haben.', true],
          ['Nein. Das war leider viel zu lang und nicht sehr interessant.'],
        ], 'Après un exposé, on remercie et on donne un retour positif précis (« Mir hat besonders gefallen, dass … »). Une critique sèche sans remerciement est impolie, et parler de soi ne répond pas à la question.'),
        speakLong('q5', 'Mir hat besonders gut gefallen, dass Sie so viele Beispiele gebracht haben.',
          'Retour positif : « gefallen » + datif (mir). Dans la subordonnée en « dass », l’auxiliaire « haben » va à la fin, après le participe « gebracht ».'),
        speak('q6', 'Ich hätte noch eine Frage zu den Kosten.',
          'Question polie au Konjunktiv II (« ich hätte »). « zu » + datif pluriel : zu den Kosten.'),
        speak('q7', 'Könnten Sie das bitte noch einmal genauer erklären?',
          'Demande de précision polie au Konjunktiv II. Accentuez « genauer » ; la voix monte légèrement à la fin.'),
      ] },

    { id: 'b1-gesellschaft-atelier-mediation', kind: 'exercise', title: 'Médiation : simplifier un courriel pour un nouveau venu', estimatedMinutes: 15,
      competences: ['lecture', 'expression-ecrite'],
      lesson: { description: `${bi('Lesen Sie die E-Mail an das Team. Helfen Sie dann Herrn Haddad.', 'Lisez le courriel adressé à l’équipe, puis aidez M. Haddad.')}

DIE SITUATION
[fr] La situation
Herr Haddad lernt seit einem Jahr Deutsch und möchte zum ersten Mal ins Sprachcafé kommen. Er versteht einfache Sätze, aber die E-Mail von Nadine ist für ihn zu schwer. [fr] M. Haddad apprend l’allemand depuis un an et veut venir pour la première fois au Sprachcafé. Il comprend des phrases simples, mais le courriel de Nadine est trop difficile pour lui.

DIE E-MAIL AN DAS TEAM
[fr] Le courriel à l’équipe
Liebes Team,
aufgrund der Bauarbeiten im Innenhof, die voraussichtlich bis Ende Juni andauern, ist der hintere Zugang zur Bibliothek vorübergehend nicht nutzbar. Gäste und Helfer werden daher gebeten, ausschließlich den Haupteingang in der Lindenstraße zu benutzen; der Aufzug befindet sich unmittelbar rechts davon. Da die Lesung in Raum 2 erst um 17:30 Uhr endet, können wir mit dem Aufbau nicht vor 17:45 Uhr beginnen. Den Schlüssel sowie die Namensschilder holt Samir an der Information ab. Das Sprachcafé selbst beginnt wie gewohnt um 18 Uhr, ist für Gäste weiterhin kostenlos und erfordert keine Anmeldung. Lena übernimmt ab 18:20 Uhr die Begrüßung.
Viele Grüße
Nadine

STRATEGIE
[fr] Stratégie
Fragen Sie sich: Was muss Herr Haddad wissen, um pünktlich am richtigen Ort zu sein? [fr] Demandez-vous : que doit savoir M. Haddad pour être à l’heure au bon endroit ?
Lassen Sie Details für das Team weg. Benutzen Sie kurze Sätze. [fr] Laissez de côté les détails destinés à l’équipe. Faites des phrases courtes.` },
      questions: [
        fill('q1', bi('Notizen für Herrn Haddad: Ergänzen Sie.', 'Notes pour M. Haddad : complétez.'),
          'Sprachcafé am Mittwoch um [[1]] Uhr · Eingang: [[2]] · Aufzug: rechts neben dem Eingang · Kosten: [[3]] Euro · Anmeldung: nicht [[4]]',
          [['18', 'achtzehn'], ['Lindenstraße', 'in der Lindenstraße', 'Haupteingang', 'Lindenstrasse'], ['0', 'null', 'keine'], ['nötig', 'notwendig']],
          'Seules comptent pour M. Haddad l’heure de début (18 h), l’entrée de la Lindenstraße, la gratuité et l’absence d’inscription. L’heure du montage (17 h 45) ne concerne que les bénévoles.'),
        choice('q2', bi('Welche Information ist für Herrn Haddad wichtig?', 'Quelle information est importante pour M. Haddad ?'), [
          ['Samir holt den Schlüssel an der Information ab.'],
          ['Er muss den Eingang in der Lindenstraße nehmen.', true],
          ['Die Helfer beginnen um 17:45 Uhr mit dem Aufbau.'],
        ], 'Sans cette information, M. Haddad irait vers la cour fermée. La clé et le montage sont des détails d’organisation interne.'),
        choice('q3', bi('Welche Information braucht Herr Haddad nicht?', 'De quelle information M. Haddad n’a-t-il pas besoin ?'), [
          ['Lena übernimmt ab 18:20 Uhr die Begrüßung.', true],
          ['Das Sprachcafé ist für die Gäste kostenlos.'],
          ['Gäste müssen sich vorher nicht anmelden.'],
        ], 'Qui accueille à 18 h 20 ne change rien pour un invité. La gratuité et l’absence d’inscription, en revanche, le rassurent et lui évitent une démarche inutile.'),
        choice('q4', bi('Welche Formulierung ist für Herrn Haddad am einfachsten?', 'Quelle formulation est la plus simple pour M. Haddad ?'), [
          ['Aufgrund der Bauarbeiten ist der hintere Zugang nicht nutzbar.'],
          ['Der Zugang, der wegen der Arbeiten, die bis Juni dauern, gesperrt ist, ist hinten.'],
          ['Der Hof ist gesperrt. Bitte kommen Sie durch den Eingang in der Lindenstraße.', true],
        ], 'Deux phrases courtes, des mots courants (« gesperrt », « Eingang ») et une consigne claire. Les autres versions gardent le style administratif (« aufgrund », « nutzbar ») ou empilent les relatives.'),
        order('q5', bi('Bilden Sie einen einfachen Satz für Herrn Haddad.', 'Formez une phrase simple pour M. Haddad.'), [
          ['Sie', 'müssen', 'sich', 'nicht', 'anmelden', 'und', 'nichts', 'bezahlen.'],
        ], 'Une seule phrase pour deux informations rassurantes : le verbe de modalité « müssen » en deuxième position, les deux infinitifs en fin de groupe, reliés par « und ».'),
      ] },

    { id: 'b1-gesellschaft-atelier-korrektur', kind: 'exercise', title: 'Corriger : les erreurs typiques des francophones', estimatedMinutes: 10,
      competences: ['lecture', 'expression-ecrite'],
      lesson: { description: bi('Diese Sätze schreiben französischsprachige Lernende oft falsch. Finden Sie die richtige Form.', 'Les francophones se trompent souvent dans ces phrases. Trouvez la forme correcte.') },
      questions: [
        fill('q1', bi('Ergänzen Sie das fehlende Wort.', 'Complétez le mot qui manque.'),
          'Ich habe leider weder Zeit [[1]] Geld für einen Sprachkurs.',
          [['noch']],
          '« ni … ni » se dit « weder … noch ». « weder … oder » mélange deux connecteurs ; « und » ne convient pas non plus.'),
        choice('q2', bi('Welcher Satz ist richtig?', 'Quelle phrase est correcte ?'), [
          ['Ich kann weder nicht schwimmen noch Rad fahren.'],
          ['Ich kann weder schwimmen noch Rad fahren.', true],
          ['Ich kann nicht weder schwimmen noch Rad fahren.'],
        ], '« weder … noch » porte déjà la négation. Comme en français « ni … ni », on n’ajoute pas « nicht » (en français, on ajoute « ne » : je ne sais ni … ni …, d’où l’erreur).'),
        fill('q3', bi('Ergänzen Sie das Relativpronomen.', 'Complétez avec le pronom relatif.'),
          'Das ist alles, [[1]] ich über das Sprachcafé weiß.',
          [['was']],
          '« tout ce que » : alles, was … Le calque « alles, das » est une erreur fréquente : après alles, etwas, nichts, on emploie « was ».'),
        fill('q4', bi('Ergänzen Sie. Achtung: nicht „wo“!', 'Complétez. Attention : pas « wo » !'),
          'Ich erinnere mich gut an den Tag, [[1]] ich nach Deutschland gekommen bin.',
          [['an dem', 'als']],
          '« le jour où » : der Tag, an dem … (ou als, pour un fait unique au passé). « wo » ne reprend qu’un lieu dans la langue soignée.'),
        fill('q5', bi('Ergänzen Sie das Relativpronomen. Das Verb ist „helfen“ (+ Dativ).', 'Complétez avec le pronom relatif. Le verbe est « helfen » (+ datif).'),
          'Die Kinder, [[1]] ich bei den Hausaufgaben helfe, sind in der vierten Klasse.',
          [['denen']],
          '« helfen » se construit avec le datif. Au pluriel, le pronom relatif datif est « denen » (et non « den », qui serait l’article).'),
        order('q6', C.ordnen, [
          ['Ich', 'interessiere', 'mich', 'nicht nur', 'für Sport,', 'sondern auch', 'für Musik.'],
        ], '« nicht nur » se place juste avant l’élément qu’il met en valeur (für Sport), puis « sondern auch » introduit le second, après une virgule.'),
        choice('q7', bi('Welche Form ist richtig? „Ich danke … für Ihre schnelle Antwort.“', 'Quelle forme est juste ? (Je vous remercie de votre réponse rapide.)'), [
          ['Sie'],
          ['Ihnen', true],
          ['euch'],
        ], '« danken » se construit avec le datif : Ihnen (vouvoiement, toujours avec majuscule ; « ihnen » en minuscule signifie « à eux »). « Sie » est un accusatif, et « euch » (vous, tutoiement pluriel) ne va pas avec « Ihre » dans la même phrase.'),
      ] },

    { id: 'b1-gesellschaft-atelier-pruefung', kind: 'exercise', title: 'Entraînement à l’examen : une discussion à la radio (Hören)', estimatedMinutes: 18,
      competences: ['ecoute'],
      lesson: { description: `PRÜFUNGSTRAINING HÖREN · EINE DISKUSSION IM RADIO
[fr] Entraînement à l’examen, compréhension orale : une discussion à la radio

${bi('Sie hören eine Diskussion im Radio. Sie hören sie zweimal.', 'Vous entendez une discussion à la radio. Vous l’entendez deux fois.')}
${bi('Wer sagt was? Wählen Sie bei jeder Aussage: der Moderator, Frau Lehmann oder Herr Brandt.', 'Qui dit quoi ? Pour chaque affirmation, choisissez : l’animateur, Mme Lehmann ou M. Brandt.')}

ZEIT
[fr] Temps
Lesen Sie zuerst die sechs Aussagen: eine Minute. Dann hören Sie die Diskussion zweimal. Insgesamt etwa 12 Minuten. [fr] Lisez d’abord les six affirmations : une minute. Puis écoutez deux fois la discussion. En tout, environ 12 minutes.

STRATEGIE
[fr] Stratégie
Die Aussagen benutzen andere Wörter als die Personen. Achten Sie auf die Bedeutung. [fr] Les affirmations n’emploient pas les mêmes mots que les personnes : soyez attentif au sens.
Achten Sie beim ersten Hören darauf: Wer ist für das Pflichtjahr, wer ist dagegen? [fr] À la première écoute, repérez qui est pour l’année obligatoire et qui est contre.` },
      placements: [
        { media: 'b1-gesellschaft-atelier-pruefung-sprecher', caption: 'Im Studio' },
        { media: 'b1-gesellschaft-atelier-pruefung-radio', transcriptVisibility: 'after_answer' },
      ],
      questions: [
        who('q1', 'Es ist heute schwer, Freiwillige zu finden.', 'Frau Lehmann',
          'Mme Lehmann : « Wir finden kaum noch Freiwillige. » « kaum noch » (presque plus) correspond à « schwer zu finden ».'),
        who('q2', 'Wer eine Arbeit machen muss, macht sie nicht gern.', 'Herr Brandt',
          'M. Brandt : « Wer gezwungen wird, macht die Arbeit nicht mit Freude. » « gezwungen werden » (être obligé) = « machen müssen ».'),
        who('q3', 'Bei dieser Arbeit lernt man, Verantwortung zu übernehmen.', 'Frau Lehmann',
          'Mme Lehmann : les jeunes apprennent « etwas, was man in keiner Schule lernt: Verantwortung ».'),
        who('q4', 'Mit mehr Geld gäbe es mehr Freiwillige.', 'Herr Brandt',
          'M. Brandt : « Wenn die Bezahlung besser wäre, würden sich sicher mehr junge Menschen melden. » Il propose d’améliorer le volontariat plutôt que d’imposer une obligation.'),
        who('q5', 'Die Hörer sind nicht einer Meinung.', 'der Moderator',
          'L’animateur résume le sondage : « Die Meinungen sind sehr unterschiedlich: Ungefähr die Hälfte ist für ein Pflichtjahr, die andere Hälfte dagegen. »'),
        who('q6', 'Ich habe nach der Schule mit kleinen Kindern gearbeitet.', 'Herr Brandt',
          'M. Brandt a fait une année de volontariat « in einer Kita » (une crèche) après le baccalauréat. Mme Lehmann parle des jeunes qui travaillent dans sa maison de retraite, pas d’elle-même.'),
      ] },

    { id: 'b1-gesellschaft-atelier-schreiben', kind: 'mission', title: 'Mission : postuler pour une activité bénévole', estimatedMinutes: 25,
      competences: ['expression-ecrite'],
      lesson: { description: `${bi('Lesen Sie die zwei Anzeigen. Wählen Sie eine Anzeige und schreiben Sie eine Bewerbung.', 'Lisez les deux annonces. Choisissez-en une et écrivez une candidature.')}

ANZEIGE A
[fr] Annonce A
Türklinke e. V. sucht Helferinnen und Helfer für die Hausaufgabenhilfe: montags und donnerstags von 15 bis 17 Uhr, Kinder der Klassen 3 bis 6. Bewerbung bitte per E-Mail an Frau Haas.

ANZEIGE B
[fr] Annonce B
Das Seniorenheim „Lindenhof“ sucht Freiwillige, die mit unseren Bewohnern spazieren gehen, vorlesen oder spielen. Die Zeiten sind flexibel, mindestens zwei Stunden pro Woche. Bewerbung bitte per E-Mail an Herrn Yıldız.

REDEMITTEL
[fr] Formules utiles
• Betreff: Bewerbung als Helferin / Helfer in der Hausaufgabenhilfe
• Sehr geehrte Frau Haas, / Sehr geehrter Herr Yıldız,
• Ich habe Ihre Anzeige … gelesen und möchte mich als … bewerben.
• In meiner Heimat habe ich … / Ich habe Erfahrung mit …
• Ich bin nicht nur …, sondern auch …
• Ich stehe … zur Verfügung.
• Ich hätte noch eine Frage: …
• Über eine Antwort würde ich mich freuen. Mit freundlichen Grüßen

${bi('Planen Sie 5 Minuten, schreiben Sie 15 Minuten und lesen Sie Ihren Text 5 Minuten lang noch einmal.', 'Prévoyez 5 minutes de plan, 15 minutes de rédaction et 5 minutes de relecture.')}` },
      mission: {
        oral: null,
        written: {
          prompt: lines(
            bi('Wählen Sie Anzeige A oder B und schreiben Sie eine Bewerbung per E-Mail (80 bis 120 Wörter).', 'Choisissez l’annonce A ou B et écrivez une candidature par courriel (80 à 120 mots).'),
            bi('Sagen Sie, wo Sie die Anzeige gelesen haben und warum Sie sich engagieren möchten.', 'Dites où vous avez lu l’annonce et pourquoi vous voulez vous engager.'),
            bi('Stellen Sie sich vor: Erfahrung, Sprachen, Eigenschaften.', 'Présentez-vous : expérience, langues, qualités.'),
            bi('Sagen Sie, wann Sie Zeit haben, und stellen Sie eine Frage zur Aufgabe.', 'Dites quand vous êtes disponible et posez une question sur la mission.'),
          ),
          maxChars: 1200, minWords: 80,
        },
        checklist: [
          bi('Ich schreibe einen Betreff und eine formelle Anrede.', 'J’écris un objet et une formule d’appel formelle.'),
          bi('Ich sage, wo ich die Anzeige gelesen habe und warum ich helfen möchte.', 'Je dis où j’ai lu l’annonce et pourquoi je veux aider.'),
          bi('Ich beschreibe meine Erfahrung mit einem Beispiel.', 'Je présente mon expérience avec un exemple.'),
          bi('Ich sage, wann ich Zeit habe, und stelle eine Frage.', 'J’indique mes disponibilités et je pose une question.'),
          bi('Ich benutze einen Konnektor mit zwei Teilen (nicht nur …, sondern auch …).', 'J’emploie un connecteur double.'),
          bi('Ich sieze (Sie, Ihnen) und schließe mit „Mit freundlichen Grüßen“.', 'Je vouvoie et je termine par la formule finale.'),
        ],
        criteria: grid(GRIDS.b1.schreiben, 'Tâche : annonce citée, motivation, expérience, disponibilités et question ; lettre formelle complète (objet, appel, formule finale, Sie)'),
      } },

    { id: 'b1-gesellschaft-atelier-sprechen', kind: 'mission', title: 'Mission : réagir à un exposé', estimatedMinutes: 20,
      competences: ['expression-orale'],
      lesson: { description: `DIE SITUATION
[fr] La situation
In einer Versammlung des Vereins stellt Leonie ein neues Projekt vor. Danach bittet sie um Rückmeldungen und Fragen. [fr] Lors d’une réunion de l’association, Leonie présente un nouveau projet. Ensuite, elle demande des retours et des questions.
${bi('Hören Sie die Präsentation. Sie können sie auch zweimal hören.', 'Écoutez l’exposé. Vous pouvez aussi l’écouter deux fois.')}

REDEMITTEL
[fr] Formules utiles
• remercier : Vielen Dank für die interessante Präsentation!
• retour positif : Mir hat besonders gefallen, dass … / Ich finde es toll, dass …
• point à préciser : Mir ist noch nicht ganz klar, wie … / Was passiert, wenn …?
• question : Ich hätte noch eine Frage zu … / Kannst du noch erklären, …?
• proposition : Wie wäre es, wenn …? / Vielleicht könnte man …

${bi('Bereiten Sie sich 5 Minuten vor. Nehmen Sie dann Ihre Reaktion auf.', 'Préparez-vous 5 minutes, puis enregistrez votre réaction.')}` },
      placements: [{ media: 'b1-gesellschaft-atelier-sprechen-praesentation', transcriptVisibility: 'on_demand' }],
      mission: {
        oral: {
          prompt: lines(
            bi('Hören Sie die Präsentation von Leonie. Reagieren Sie dann etwa 90 Sekunden lang.', 'Écoutez l’exposé de Leonie, puis réagissez pendant environ 90 secondes.'),
            bi('Bedanken Sie sich und sagen Sie, was Ihnen besonders gefallen hat.', 'Remerciez-la et dites ce qui vous a particulièrement plu.'),
            bi('Nennen Sie einen Punkt, der Ihnen nicht ganz klar ist, oder ein mögliches Problem.', 'Citez un point qui ne vous paraît pas clair ou un problème possible.'),
            bi('Stellen Sie eine Frage und machen Sie einen Vorschlag für den Transport.', 'Posez une question et faites une proposition pour le transport.'),
          ),
          maxSeconds: 90,
        },
        written: null,
        checklist: [
          bi('Ich bedanke mich und sage genau, was mir gefallen hat.', 'Je remercie et je dis précisément ce qui m’a plu.'),
          bi('Ich nenne höflich einen Punkt, der mir nicht ganz klar ist.', 'Je cite poliment un point à préciser.'),
          bi('Ich stelle eine Frage (Ich hätte noch eine Frage zu …).', 'Je pose une question.'),
          bi('Ich mache einen Vorschlag für den Transport (Wie wäre es, wenn …?).', 'Je propose une solution pour le transport.'),
          bi('Ich spreche etwa 90 Sekunden und verbinde meine Ideen.', 'Je parle environ 90 secondes en reliant mes idées.'),
        ],
        criteria: grid(GRIDS.b1.sprechen, 'Tâche : remerciement et retour positif précis, point à préciser, question et proposition, en environ 90 secondes'),
      } },

    { id: 'b1-gesellschaft-atelier-bilan', kind: 'lesson', title: 'Faire le point : s’engager et transmettre', estimatedMinutes: 6,
      competences: ['lecture'],
      lesson: { description: `FAIRE LE POINT
Relisez ces objectifs. Si l’un d’eux vous fait hésiter, refaites l’exercice indiqué.

DAS KANN ICH JETZT
[fr] Ce que je sais faire maintenant
• Ich kann die Anzeige eines Vereins verstehen. [fr] Je peux comprendre l’annonce d’une association (module thème, « Comprendre »).
• Ich kann mich schriftlich für ein Ehrenamt bewerben. [fr] Je peux poser ma candidature par écrit pour du bénévolat (« Modèle », mission écrite).
• Ich kann eine schwierige Information einfach erklären. [fr] Je peux expliquer simplement une information difficile (« Médiation »).
• Ich kann einer Diskussion folgen und sagen, wer was meint. [fr] Je peux suivre une discussion et dire qui pense quoi (« Entraînement à l’examen »).
• Ich kann auf eine Präsentation reagieren: Dank, Rückmeldung, Frage. [fr] Je peux réagir à un exposé : remerciement, retour, question (mission orale).

MES STRATÉGIES
• Médiation : se demander ce dont la personne a besoin pour agir, et laisser de côté le reste.
• Écoute d’un débat : noter d’abord qui est pour et qui est contre, puis les arguments.
• Lettre formelle : objet, appel, motivation, expérience, disponibilités, question, formule finale.

À REVOIR
• Les connecteurs doubles et les relatives avec was et wo (module thème, « Retenir » et « S’entraîner »).
• Les formules de la candidature et du retour sur un exposé (lexique de ce module).` } },
  ],
};
