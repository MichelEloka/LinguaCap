// Module B1 n° 9 · thème « Gesundheit » (lot R2). Décrire des symptômes et leur évolution, comprendre des conseils de
// santé et un message du cabinet médical, poser une condition (wenn, falls), conseiller (sollte) et dire qu'une chose
// n'est pas nécessaire (nicht müssen, nicht brauchen … zu ; à distinguer de nicht dürfen).
// Reprise réécrite du brouillon B1 V1 (content/b1-v1/source/partie1-suite.mjs › b1-gesundheit) : confirmation et
// déplacement d'un rendez-vous, condition avec wenn, faire préciser un document, appel au secrétariat.
import { C, bi, choice, fill, order, match, dictation, speak } from '../../lib.mjs';

/** « Richtig / falsch / steht nicht im Text » : r, f ou n pour la bonne réponse. */
const rf = (id, statement, answer, explanation) => choice(id, `„${statement}“ ${C.richtigFalsch}`,
  [['richtig', answer === 'r'], ['falsch', answer === 'f'], ['steht nicht im Text', answer === 'n']], explanation);
/** Même format pour une écoute : « nicht gesagt » au lieu de « steht nicht im Text ». */
const rfHoeren = (id, statement, answer, explanation) => choice(id, `„${statement}“ ${bi('Richtig, falsch oder nicht gesagt?', 'Vrai, faux ou non dit ?')}`,
  [['richtig', answer === 'r'], ['falsch', answer === 'f'], ['nicht gesagt', answer === 'n']], explanation);
/** Indices affichés sous les trous d'un fill (forme de base à transformer). */
const hints = (question, ...values) => ({ ...question,
  blanks: question.blanks.map((blank, index) => (values[index] ? { ...blank, hint: values[index] } : blank)) });

export default {
  id: 'b1-gesundheit',
  title: 'Gesundheit : prendre soin de sa santé',
  objective: 'Décrire des symptômes et leur évolution, comprendre des conseils de santé et un message du cabinet médical, poser une condition (wenn, falls) et conseiller avec sollte.',
  grammarFocus: ['wenn-falls', 'sollte-ratschlag', 'brauchen-zu'],
  sources: [
    'Textes, dialogues et exercices originaux LinguaCap. Situations fictives : les conseils de santé restent généraux et ne remplacent pas un avis médical.',
    'Situations reprises et réécrites du brouillon B1 V1 (LinguaCap) : message du cabinet, déplacement d’un rendez-vous, appel au secrétariat.',
  ],

  vocabulary: [
    { word: 'Beschwerden', article: 'die', plural: null, partOfSpeech: 'noun', translation: 'les troubles, les symptômes',
      example: 'Seit wann haben Sie diese Beschwerden?', note: 'presque toujours au pluriel' },
    { word: 'Erkältung', article: 'die', plural: 'Erkältungen', partOfSpeech: 'noun', translation: 'le rhume',
      example: 'Im Winter haben viele Menschen eine Erkältung.', note: 'erkältet sein : être enrhumé' },
    { word: 'Fieber', article: 'das', plural: null, partOfSpeech: 'noun', translation: 'la fièvre',
      example: 'Wenn das Fieber steigt, sollten Sie zum Arzt gehen.', note: 'sans pluriel · Fieber haben, Fieber messen' },
    { word: 'husten', partOfSpeech: 'verb', translation: 'tousser',
      example: 'Mein Sohn hustet seit drei Tagen.', note: 'der Husten : la toux' },
    { word: 'Krankschreibung', article: 'die', plural: 'Krankschreibungen', partOfSpeech: 'noun', translation: 'l’arrêt de travail (certificat du médecin)',
      example: 'Für die Arbeit brauche ich eine Krankschreibung.', note: 'krankschreiben : mettre en arrêt de travail' },
    { word: 'sich krankmelden', partOfSpeech: 'verb', translation: 'se déclarer malade (auprès de l’employeur)',
      example: 'Heute Morgen habe ich mich bei meiner Chefin krankgemeldet.', note: 'séparable : krank|melden' },
    { word: 'Überweisung', article: 'die', plural: 'Überweisungen', partOfSpeech: 'noun', translation: 'la lettre d’orientation (vers un spécialiste)',
      example: 'Für den Hautarzt brauchen Sie eine Überweisung.', note: 'aussi : le virement bancaire' },
    { word: 'Rezept', article: 'das', plural: 'Rezepte', partOfSpeech: 'noun', translation: 'l’ordonnance',
      example: 'Mit diesem Rezept bekommen Sie das Medikament in der Apotheke.', note: 'aussi : la recette de cuisine' },
    { word: 'verschreiben', partOfSpeech: 'verb', translation: 'prescrire',
      example: 'Kann die Ärztin mir etwas gegen den Husten verschreiben?', note: 'verschrieb, hat verschrieben' },
    { word: 'einnehmen', partOfSpeech: 'verb', translation: 'prendre (un médicament)',
      example: 'Nehmen Sie die Tabletten dreimal täglich nach dem Essen ein.', note: 'séparable : ein|nehmen' },
    { word: 'Nebenwirkung', article: 'die', plural: 'Nebenwirkungen', partOfSpeech: 'noun', translation: 'l’effet secondaire',
      example: 'Müdigkeit ist eine mögliche Nebenwirkung.', note: null },
    { word: 'Vorsorge', article: 'die', plural: null, partOfSpeech: 'noun', translation: 'la prévention, le dépistage',
      example: 'Zur Vorsorge gehe ich einmal im Jahr zum Zahnarzt.', note: 'sans pluriel · die Vorsorgeuntersuchung' },
    { word: 'Sprechstunde', article: 'die', plural: 'Sprechstunden', partOfSpeech: 'noun', translation: 'les heures de consultation',
      example: 'Die Sprechstunde beginnt um acht Uhr.', note: null },
    { word: 'Versichertenkarte', article: 'die', plural: 'Versichertenkarten', partOfSpeech: 'noun', translation: 'la carte d’assurance maladie',
      example: 'Bringen Sie bitte Ihre Versichertenkarte mit.', note: null },
    { word: 'nüchtern', partOfSpeech: 'adjective', translation: 'à jeun',
      example: 'Zur Blutabnahme müssen Sie nüchtern kommen.', note: null },
    { word: 'ansteckend', partOfSpeech: 'adjective', translation: 'contagieux',
      example: 'Eine Grippe ist sehr ansteckend.', note: 'jemanden anstecken : contaminer quelqu’un' },
    { word: 'sich erholen', partOfSpeech: 'verb', translation: 'se reposer, se rétablir',
      example: 'Im Urlaub habe ich mich gut erholt.', note: null },
    { word: 'sich schonen', partOfSpeech: 'verb', translation: 'se ménager',
      example: 'Sie sollten sich ein paar Tage schonen.', note: null },
    { word: 'sich ernähren', partOfSpeech: 'verb', translation: 'se nourrir, s’alimenter',
      example: 'Wer sich gesund ernährt, isst viel Obst und Gemüse.', note: 'die Ernährung : l’alimentation' },
    { word: 'Immunsystem', article: 'das', plural: 'Immunsysteme', partOfSpeech: 'noun', translation: 'le système immunitaire',
      example: 'Guter Schlaf stärkt das Immunsystem.', note: null },
    { word: 'Bewegung', article: 'die', plural: null, partOfSpeech: 'noun', translation: 'l’activité physique, le mouvement',
      example: 'Bewegung an der frischen Luft tut gut.', note: 'au sens d’activité physique : sans pluriel' },
    { word: 'falls', partOfSpeech: 'conjunction', translation: 'au cas où, si',
      example: 'Falls Sie Fieber bekommen, rufen Sie uns an.', note: 'verbe à la fin, comme après wenn' },
  ],

  media: [
    { key: 'b1-gesundheit-lesen-artikel', kind: 'image', title: 'Article : « Gesund durch den Winter »',
      alt: 'Page de magazine santé intitulée « Gesund durch den Winter » : conseils pour rester en forme en hiver (sommeil, activité physique, alimentation).',
      image: { layout: 'article', kicker: 'Gesundheit', title: 'Gesund durch den Winter', icon: 'heart-pulse',
        lead: 'Kurze Tage, kalte Luft, volle Busse: Im Winter haben Erkältungen leichtes Spiel. Ganz vermeiden kann man sie nicht. Aber mit ein paar einfachen Gewohnheiten bleibt das Immunsystem stark.',
        paragraphs: ['Schlaf ist die beste Medizin. Wer regelmäßig sieben bis acht Stunden schläft, wird seltener krank. Fachleute empfehlen, jeden Abend ungefähr zur gleichen Zeit ins Bett zu gehen.'] } },
    { key: 'b1-gesundheit-hoeren-audio', kind: 'audio', title: 'Un message du cabinet médical et le rappel',
      script: [
        { voice: 'mann3', name: 'Herr Kühn', text: 'Guten Tag, Frau Moreau, hier ist Kühn von der Praxis Doktor Albers. Ihre Blutwerte sind da. Es ist nichts Schlimmes, aber Frau Doktor Albers möchte gern noch einmal mit Ihnen sprechen. Bitte rufen Sie uns zurück, dann vereinbaren wir einen Termin. Wir sind heute bis achtzehn Uhr erreichbar. Vielen Dank!' },
        { pause: 1.5 },
        { voice: 'mann3', name: 'Herr Kühn', text: 'Praxis Doktor Albers, Kühn am Apparat, guten Tag.' },
        { voice: 'frau', name: 'Claire Moreau', text: 'Guten Tag, hier ist Claire Moreau. Sie haben mir heute Vormittag eine Nachricht hinterlassen.' },
        { voice: 'mann3', name: 'Herr Kühn', text: 'Ach ja, Frau Moreau, danke für Ihren Rückruf. Frau Doktor Albers möchte mit Ihnen über Ihre Blutwerte sprechen. Ein Wert ist etwas zu niedrig, wahrscheinlich das Eisen.' },
        { voice: 'frau', name: 'Claire Moreau', text: 'Eisen? Muss ich mir Sorgen machen?' },
        { voice: 'mann3', name: 'Herr Kühn', text: 'Nein, das kommt sehr oft vor und ist meistens nicht schlimm. Frau Doktor Albers erklärt Ihnen beim Termin alles genau.' },
        { voice: 'frau', name: 'Claire Moreau', text: 'Das erklärt vielleicht einiges. Ich bin seit ein paar Wochen sehr müde, und manchmal habe ich Kopfschmerzen.' },
        { voice: 'mann3', name: 'Herr Kühn', text: 'Das notiere ich für die Ärztin. Haben Sie noch andere Beschwerden, zum Beispiel Schwindel?' },
        { voice: 'frau', name: 'Claire Moreau', text: 'Nein, Schwindel nicht. Aber ich friere schneller als früher.' },
        { voice: 'mann3', name: 'Herr Kühn', text: 'Ist es in den letzten Tagen besser oder schlechter geworden?' },
        { voice: 'frau', name: 'Claire Moreau', text: 'Eher schlechter. Letzte Woche war ich nach der Arbeit so müde, dass ich sofort ins Bett gegangen bin.' },
        { voice: 'mann3', name: 'Herr Kühn', text: 'Verstehe. Hätten Sie am Mittwoch um neun Uhr Zeit?' },
        { voice: 'frau', name: 'Claire Moreau', text: 'Mittwochvormittag ist schwierig, da habe ich eine wichtige Besprechung. Wäre auch ein Termin am Nachmittag möglich?' },
        { voice: 'mann3', name: 'Herr Kühn', text: 'Am Mittwoch leider nicht, aber am Freitag um fünfzehn Uhr dreißig ist noch etwas frei.' },
        { voice: 'frau', name: 'Claire Moreau', text: 'Freitag um halb vier passt sehr gut.' },
        { voice: 'mann3', name: 'Herr Kühn', text: 'Gut, dann trage ich Sie ein. Bitte bringen Sie Ihre Versichertenkarte mit. Für diesen Termin brauchen Sie nicht nüchtern zu kommen, Sie können also ganz normal frühstücken.' },
        { voice: 'frau', name: 'Claire Moreau', text: 'Und falls ich am Freitag doch nicht kann?' },
        { voice: 'mann3', name: 'Herr Kühn', text: 'Dann sagen Sie bitte mindestens vierundzwanzig Stunden vorher ab, am besten telefonisch. Und noch ein Tipp von Frau Doktor Albers: Wenn Sie so müde sind, sollten Sie bis zum Termin keinen Sport machen und viel schlafen.' },
        { voice: 'frau', name: 'Claire Moreau', text: 'Alles klar. Vielen Dank, Herr Kühn.' },
        { voice: 'mann3', name: 'Herr Kühn', text: 'Gern. Am Tag vorher bekommen Sie von uns noch eine Erinnerung per SMS. Bis Freitag, Frau Moreau. Auf Wiederhören!' },
      ] },
    { key: 'b1-gesundheit-hoeren2-audio', kind: 'audio', title: 'Un conseil à la pharmacie',
      script: [
        { voice: 'frau2', name: 'Apothekerin', text: 'Guten Tag, was kann ich für Sie tun?' },
        { voice: 'mann2', name: 'Herr Okoro', text: 'Guten Tag. Ich habe seit zwei Tagen Halsschmerzen und Schnupfen. Fieber habe ich nicht. Haben Sie etwas, das schnell hilft?' },
        { voice: 'frau2', name: 'Apothekerin', text: 'Nehmen Sie im Moment andere Medikamente?' },
        { voice: 'mann2', name: 'Herr Okoro', text: 'Nein, gar keine.' },
        { voice: 'frau2', name: 'Apothekerin', text: 'Gut. Dann empfehle ich Ihnen diese Lutschtabletten gegen die Halsschmerzen. Sie können alle drei bis vier Stunden eine nehmen, aber höchstens sechs am Tag. Für die Nase gibt es dieses Spray. Das sollten Sie aber nicht länger als eine Woche benutzen.' },
        { voice: 'mann2', name: 'Herr Okoro', text: 'Brauche ich dafür ein Rezept?' },
        { voice: 'frau2', name: 'Apothekerin', text: 'Nein, beides bekommen Sie ohne Rezept. Zusammen macht das elf Euro achtzig.' },
        { voice: 'mann2', name: 'Herr Okoro', text: 'Und wenn es nicht besser wird?' },
        { voice: 'frau2', name: 'Apothekerin', text: 'Wenn Sie in drei, vier Tagen immer noch Beschwerden haben oder Fieber bekommen, sollten Sie zum Arzt gehen. Und trinken Sie viel, am besten warmen Tee.' },
        { voice: 'mann2', name: 'Herr Okoro', text: 'Kann ich denn mit der Erkältung arbeiten gehen? Ich bin Erzieher in einer Kita.' },
        { voice: 'frau2', name: 'Apothekerin', text: 'Mit kleinen Kindern? Dann bleiben Sie lieber zu Hause, bis es Ihnen besser geht. Eine Erkältung ist ansteckend. Und denken Sie daran: Viele Arbeitgeber möchten nach drei Tagen eine Krankschreibung vom Arzt sehen.' },
        { voice: 'mann2', name: 'Herr Okoro', text: 'Gut zu wissen. Vielen Dank für die Beratung!' },
        { voice: 'frau2', name: 'Apothekerin', text: 'Gern geschehen. Gute Besserung!' },
      ] },
    { key: 'b1-gesundheit-kontrolle-audio', kind: 'audio', title: 'L’annonce du répondeur du cabinet',
      script: [
        { voice: 'sprecher', name: 'Ansage', text: 'Guten Tag, Sie sind mit der Praxis Doktor Albers verbunden. Vom zweiten bis zum sechzehnten August ist die Praxis wegen Urlaub geschlossen.' },
        { voice: 'sprecher', name: 'Ansage', text: 'In dringenden Fällen wenden Sie sich bitte an unsere Vertretung, die Praxis Doktor Schmitt in der Gartenstraße vierzehn. Wenn Sie ein neues Rezept brauchen, können Sie es noch bis zum ersten August bei uns bestellen.' },
        { voice: 'sprecher', name: 'Ansage', text: 'Ab dem neunzehnten August sind wir wieder für Sie da. Nachts und am Wochenende erreichen Sie den ärztlichen Bereitschaftsdienst.' },
      ] },
  ],

  activities: [
    // 1 · Mise en route
    { id: 'b1-gesundheit-einstieg', kind: 'lesson', title: 'Mise en route : la santé au quotidien', estimatedMinutes: 10,
      competences: ['lecture', 'expression-orale'],
      lesson: { description: `GESUND BLEIBEN
[fr] Rester en bonne santé
${bi('Schlafen, essen, sich bewegen, zum Arzt gehen: Gesundheit ist ein Thema für jeden Tag, auch auf Deutsch.', 'Dormir, manger, bouger, aller chez le médecin : la santé est un sujet de tous les jours, en allemand aussi.')}

FRAGEN ZUM EINSTIEG
[fr] Questions pour commencer
• ${bi('Was machen Sie, wenn Sie eine Erkältung haben?', 'Que faites-vous quand vous avez un rhume ?')}
• ${bi('Wann waren Sie zum letzten Mal beim Arzt, und warum?', 'Quand êtes-vous allé(e) chez le médecin pour la dernière fois, et pourquoi ?')}
• ${bi('Welcher Tipp für die Gesundheit funktioniert bei Ihnen wirklich?', 'Quel conseil santé fonctionne vraiment pour vous ?')}
${bi('Antworten Sie in Gedanken auf Deutsch, in zwei oder drei Sätzen.', 'Répondez mentalement en allemand, en deux ou trois phrases.')}

ZIELE
[fr] Objectifs
• ${bi('Ich kann Beschwerden beschreiben und sagen, wie sie sich entwickeln.', 'Je peux décrire des symptômes et dire comment ils évoluent.')}
• ${bi('Ich kann Gesundheitstipps und eine Nachricht aus der Arztpraxis verstehen.', 'Je peux comprendre des conseils de santé et un message du cabinet médical.')}
• ${bi('Ich kann eine Bedingung nennen: „Wenn …, dann …“, „Falls …“.', 'Je peux poser une condition : « Wenn …, dann … », « Falls … ».')}
• ${bi('Ich kann einen Rat geben: „Du solltest …“.', 'Je peux donner un conseil : « Du solltest … ».')}

WICHTIGE WÖRTER
[fr] Mots-clés
• die Beschwerden — les troubles, les symptômes
• die Erkältung — le rhume
• das Rezept — l’ordonnance
• die Überweisung — la lettre d’orientation (vers un spécialiste)
• die Krankschreibung — l’arrêt de travail
• nüchtern — à jeun
• sich schonen — se ménager
• Sie sollten … — vous devriez …` } },

    // 2 · Lecture longue avec stratégie
    { id: 'b1-gesundheit-lesen', kind: 'exercise', title: 'Comprendre : un article sur la santé en hiver', estimatedMinutes: 20,
      competences: ['lecture'],
      lesson: { description: `${C.lesen}

STRATEGIE
[fr] Stratégie
1. ${bi('Global: Lesen Sie die Überschrift und den ersten Absatz. Was ist das Thema?', 'Lecture globale : lisez le titre et le premier paragraphe. Quel est le thème ?')}
2. ${bi('Lesen Sie dann von jedem Absatz nur den ersten Satz. Er sagt oft schon, worum es im Absatz geht.', 'Lisez ensuite seulement la première phrase de chaque paragraphe : elle annonce souvent son sujet.')}
3. ${bi('Für die Details: Suchen Sie die Schlüsselwörter der Aufgabe im Text und lesen Sie dort genau.', 'Pour les détails : cherchez dans le texte les mots-clés de la question et lisez ce passage avec précision.')}

GESUND DURCH DEN WINTER
[fr] Article : rester en bonne santé tout l’hiver
Kurze Tage, kalte Luft, volle Busse: Im Winter haben Erkältungen leichtes Spiel. Ganz vermeiden kann man sie nicht. Aber mit ein paar einfachen Gewohnheiten bleibt das Immunsystem stark.
(A) Schlaf ist die beste Medizin. Wer regelmäßig sieben bis acht Stunden schläft, wird seltener krank. Fachleute empfehlen, jeden Abend ungefähr zur gleichen Zeit ins Bett zu gehen. Das Handy sollte man mindestens eine halbe Stunde vorher weglegen, denn das helle Licht macht wach.
(B) Auch wenn es draußen grau und kalt ist: Bewegung an der frischen Luft tut gut. Schon ein Spaziergang von zwanzig Minuten in der Mittagspause bringt den Kreislauf in Schwung. Dafür brauchen Sie kein Fitnessstudio und keine teure Sportkleidung, warme Schuhe genügen. Wenn Sie wenig Zeit haben, steigen Sie einfach eine Haltestelle früher aus und gehen den Rest zu Fuß. Oder Sie verabreden sich mit Kolleginnen und Kollegen zu einem kurzen Spaziergang nach dem Essen.
(C) Im Winter essen viele Menschen schwerer und weniger frisch. Dabei sind gerade jetzt Obst und Gemüse wichtig: Kohl, Karotten, Äpfel und Orangen enthalten viele Vitamine. Wer sich abwechslungsreich ernährt, braucht meistens keine Vitamintabletten zu nehmen. Und vergessen Sie das Trinken nicht: Auch im Winter braucht der Körper etwa anderthalb Liter am Tag.
(D) Und wenn es Sie doch erwischt? Bei einer normalen Erkältung müssen Sie nicht sofort zum Arzt. Ruhen Sie sich aus, trinken Sie viel und bleiben Sie ein paar Tage zu Hause, damit Sie niemanden anstecken. Falls das Fieber über 39 Grad steigt oder Sie nach einer Woche immer noch starke Beschwerden haben, sollten Sie aber in die Sprechstunde gehen. Viele Praxen bieten im Winter auch eine Telefonsprechstunde an.` },
      placements: [{ media: 'b1-gesundheit-lesen-artikel', caption: 'Gesund durch den Winter' }],
      questions: [
        choice('q1', bi('Worum geht es in dem Artikel?', 'De quoi parle l’article ?'),
          [['um ein neues Medikament gegen Erkältungen'], ['um Tipps, wie man im Winter gesund bleibt', true], ['um die Arbeit in einer Arztpraxis im Winter']],
          'Le titre (« Gesund durch den Winter ») et le chapeau (« mit ein paar einfachen Gewohnheiten bleibt das Immunsystem stark ») annoncent des conseils pratiques. Aucun médicament nouveau n’est présenté.'),
        choice('q2', bi('Welcher Satz fasst die Botschaft des Artikels am besten zusammen?', 'Quelle phrase résume le mieux le message de l’article ?'),
          [['Mit einfachen Gewohnheiten kann man viel für seine Gesundheit tun.', true], ['Im Winter wird jeder Mensch mindestens einmal richtig krank.'],
            ['Ohne Sport im Fitnessstudio wird man im Winter schnell krank.']],
          'Le texte dit qu’on ne peut pas éviter tous les rhumes, mais que le sommeil, la marche, l’alimentation et quelques règles aident beaucoup. Il ne dit pas que tout le monde tombe malade, et il précise qu’une salle de sport n’est pas nécessaire.'),
        rf('q3', 'Für Bewegung im Winter braucht man ein Fitnessstudio.', 'f',
          'Faux : « Dafür brauchen Sie kein Fitnessstudio und keine teure Sportkleidung, warme Schuhe genügen. » Une promenade de vingt minutes suffit déjà.'),
        rf('q4', 'Wer sich gut ernährt, muss meistens keine Vitamintabletten nehmen.', 'r',
          'Vrai : « Wer sich abwechslungsreich ernährt, braucht meistens keine Vitamintabletten zu nehmen. » « Nicht / keine … zu brauchen » a le même sens que « nicht müssen » : ce n’est pas nécessaire.'),
        rf('q5', 'Joggen am Morgen ist laut Artikel gesünder als Joggen am Abend.', 'n',
          'Non mentionné : le texte parle de promenade et d’activité au grand air, jamais de course à pied ni du meilleur moment de la journée pour faire du sport.'),
        rf('q6', 'Bei einer normalen Erkältung soll man sofort zum Arzt gehen.', 'f',
          'Faux : « Bei einer normalen Erkältung müssen Sie nicht sofort zum Arzt. » On consulte seulement si la fièvre dépasse 39 degrés ou si les troubles durent plus d’une semaine.'),
        match('q7', bi('Welche Überschrift passt zu welchem Absatz? Ordnen Sie zu.', 'Quel intertitre convient à quel paragraphe ? Associez.'),
          [['Absatz A', 'Früh genug ins Bett'], ['Absatz B', 'Raus an die frische Luft'], ['Absatz C', 'Bunt essen, genug trinken'], ['Absatz D', 'Was tun, wenn man krank ist?']],
          'A parle du sommeil (Schlaf, ins Bett gehen), B de la marche dehors (Bewegung an der frischen Luft), C des fruits, des légumes et de l’eau, D de ce qu’on fait quand on est malade (« Und wenn es Sie doch erwischt? »).'),
        fill('q8', bi('Ergänzen Sie mit Informationen aus Absatz D.', 'Complétez avec des informations du paragraphe D.'),
          'Bei Fieber über [[1]] Grad sollte man in die Sprechstunde gehen. Viele Praxen bieten im Winter auch eine [[2]] an.',
          [['39', 'neununddreißig'], ['Telefonsprechstunde']],
          '« Falls das Fieber über 39 Grad steigt » : au-delà de 39 °C, on consulte. Die Telefonsprechstunde : une consultation par téléphone, mot composé de Telefon et Sprechstunde.'),
      ] },

    // 3 · Écoute longue : message du cabinet et rappel
    { id: 'b1-gesundheit-hoeren', kind: 'exercise', title: 'Comprendre : un message du cabinet et le rappel', estimatedMinutes: 18,
      competences: ['ecoute'],
      lesson: { description: `${C.hoeren}

SITUATION
[fr] La situation
${bi('Claire Moreau hört eine Nachricht von ihrer Arztpraxis. Dann ruft sie zurück und spricht mit Herrn Kühn am Empfang.', 'Claire Moreau écoute un message de son cabinet médical. Elle rappelle ensuite et parle avec M. Kühn, à l’accueil.')}

STRATEGIE
[fr] Stratégie
1. ${bi('Beim ersten Hören: Warum soll Frau Moreau in die Praxis kommen?', 'Première écoute : pourquoi Mme Moreau doit-elle venir au cabinet ?')}
2. ${bi('Lesen Sie die Notizen. Bei Terminen hören Sie genau auf Tag, Uhrzeit und Zahlen.', 'Lisez les notes. Pour un rendez-vous, écoutez bien le jour, l’heure et les nombres.')}
3. ${bi('Achtung: Die Praxis schlägt zuerst einen anderen Termin vor. In die Notizen gehört nur der Termin, der am Ende gilt.', 'Attention : le cabinet propose d’abord un autre rendez-vous. Seul celui qui est retenu à la fin va dans les notes.')}` },
      placements: [{ media: 'b1-gesundheit-hoeren-audio', caption: 'Nachricht und Rückruf' }],
      questions: [
        fill('q1', C.notizen,
          'Grund: ein Blutwert ist zu niedrig, wahrscheinlich das [[1]] · Beschwerden: seit ein paar Wochen sehr [[2]], manchmal Kopfschmerzen · neuer Termin: Freitag um [[3]] · mitbringen: [[4]] · absagen: mindestens [[5]] Stunden vorher',
          [['Eisen'], ['müde'], ['15.30 Uhr', '15:30 Uhr', '15.30', '15:30', 'halb vier', '15 Uhr 30', 'fünfzehn Uhr dreißig'],
            ['Versichertenkarte', 'die Versichertenkarte', 'ihre Versichertenkarte', 'Ihre Versichertenkarte'], ['24', 'vierundzwanzig']],
          'Eisen : le fer. Müde : fatiguée. Le rendez-vous retenu est vendredi à 15 h 30 (« fünfzehn Uhr dreißig » ou « halb vier »), pas mercredi à 9 heures. À apporter : la carte d’assurance maladie. Annulation : « mindestens vierundzwanzig Stunden vorher ».'),
        choice('q2', bi('Warum ruft Frau Moreau in der Praxis an?', 'Pourquoi Mme Moreau appelle-t-elle le cabinet ?'),
          [['Weil die Praxis ihr eine Nachricht hinterlassen hat.', true], ['Weil sie starke Kopfschmerzen hat und sofort kommen möchte.'],
            ['Weil sie ihre Versichertenkarte in der Praxis vergessen hat.']],
          '« Sie haben mir heute Vormittag eine Nachricht hinterlassen » : elle rappelle après le message sur son répondeur. Ses maux de tête sont mentionnés plus tard, comme symptôme, pas comme raison de l’appel.'),
        choice('q3', bi('Wie haben sich ihre Beschwerden in den letzten Tagen entwickelt?', 'Comment ses troubles ont-ils évolué ces derniers jours ?'),
          [['Sie sind besser geworden.'], ['Sie sind gleich geblieben.'], ['Sie sind eher schlimmer geworden.', true]],
          'À la question « besser oder schlechter? », elle répond « Eher schlechter » : plutôt moins bien. Schlechter et schlimmer ont ici le même sens.'),
        choice('q4', bi('Warum nimmt Frau Moreau den Termin am Mittwoch nicht?', 'Pourquoi Mme Moreau ne prend-elle pas le rendez-vous de mercredi ?'),
          [['Am Mittwoch ist die Praxis den ganzen Tag geschlossen.'], ['Sie hat am Mittwochvormittag eine wichtige Besprechung.', true],
            ['Sie möchte vor dem Termin nicht frühstücken.']],
          '« Mittwochvormittag ist schwierig, da habe ich eine wichtige Besprechung. » Le cabinet n’est pas fermé ; il n’a simplement plus de place l’après-midi ce jour-là.'),
        choice('q5', bi('Was soll Frau Moreau bis zum Termin tun?', 'Que doit faire Mme Moreau d’ici le rendez-vous ?'),
          [['viel schlafen und keinen Sport machen', true], ['morgens nichts essen und nichts trinken'], ['jeden Tag eine halbe Stunde joggen']],
          'Le conseil de la médecin : « Wenn Sie so müde sind, sollten Sie bis zum Termin keinen Sport machen und viel schlafen. » Elle n’a pas besoin d’être à jeun : « Sie brauchen nicht nüchtern zu kommen ».'),
      ] },

    // 4 · Grammaire inductive
    { id: 'b1-gesundheit-entdecken', kind: 'exercise', title: 'Découvrir : condition, conseil et absence d’obligation', estimatedMinutes: 10,
      competences: ['lecture'],
      lesson: { description: `${bi('Lesen Sie die Sätze aus dem Artikel und aus dem Telefongespräch. Achten Sie auf die Verben.', 'Lisez ces phrases de l’article et de l’appel. Observez les verbes.')}

SÄTZE
[fr] Le corpus
(1) Wenn Sie wenig Zeit haben, steigen Sie einfach eine Haltestelle früher aus.
(2) Falls das Fieber über 39 Grad steigt, sollten Sie in die Sprechstunde gehen.
(3) Und falls ich am Freitag doch nicht kann?
(4) Wenn Sie so müde sind, sollten Sie bis zum Termin keinen Sport machen.
(5) Wer sich abwechslungsreich ernährt, braucht meistens keine Vitamintabletten zu nehmen.
(6) Für diesen Termin brauchen Sie nicht nüchtern zu kommen.
(7) Bei einer normalen Erkältung müssen Sie nicht sofort zum Arzt.

${bi('Beantworten Sie dann die Fragen. Die Erklärungen formulieren die Regel.', 'Répondez ensuite aux questions. Les explications formulent la règle.')}` },
      questions: [
        choice('q1', bi('Sätze 1 bis 4: Wo steht das Verb nach „wenn“ und „falls“?', 'Phrases 1 à 4 : où se trouve le verbe après « wenn » et « falls » ?'),
          [['juste après wenn ou falls'], ['à la fin de la subordonnée', true], ['toujours en deuxième position']],
          'Wenn et falls sont des conjonctions de subordination : le verbe conjugué va à la fin (…, wenn Sie wenig Zeit haben ; falls das Fieber … steigt ; falls ich … nicht kann).'),
        choice('q2', bi('Sätze 1, 2 und 4: Was steht direkt nach dem Komma?', 'Phrases 1, 2 et 4 : qu’est-ce qui vient juste après la virgule ?'),
          [['le verbe conjugué de la principale (steigen, sollten)', true], ['le sujet de la principale (Sie), comme en français'], ['un deuxième wenn ou falls pour continuer la condition']],
          'La subordonnée occupe la première place de la phrase : le verbe de la principale arrive donc tout de suite après la virgule, puis le sujet (…, sollten Sie … gehen). C’est la règle du verbe en deuxième position.'),
        choice('q3', bi('Sätze 2 und 4: Was drückt „sollten“ hier aus?', 'Phrases 2 et 4 : qu’exprime « sollten » ici ?'),
          [['une interdiction'], ['une capacité'], ['un conseil', true]],
          'Sollten est le Konjunktiv II de sollen : « vous devriez ». C’est un conseil, pas un ordre ni une interdiction (qui serait « Sie dürfen nicht … »). L’infinitif (gehen, machen) va à la fin.'),
        match('q4', bi('Was bedeutet das Gleiche? Ordnen Sie zu.', 'Qu’est-ce qui veut dire la même chose ? Associez.'),
          [['Sie brauchen nicht nüchtern zu kommen.', 'Sie müssen nicht nüchtern kommen.'], ['Sie sollten viel schlafen.', 'Es ist ein guter Rat, viel zu schlafen.'],
            ['Falls Sie nicht kommen können, rufen Sie an.', 'Wenn Sie nicht kommen können, rufen Sie an.'], ['Sie dürfen vorher nichts essen.', 'Essen ist vorher verboten.']],
          'Nicht brauchen … zu = nicht müssen : ce n’est pas nécessaire. Sollte = un conseil. Falls ≈ wenn pour une condition. Mais nicht dürfen = c’est interdit : ne le confondez pas avec nicht müssen.'),
      ] },

    // 5 · Règle
    { id: 'b1-gesundheit-regel', kind: 'lesson', title: 'À retenir : wenn et falls, sollte, nicht brauchen … zu', estimatedMinutes: 10,
      competences: ['lecture'],
      lesson: { description: `À RETENIR — LA CONDITION : WENN ET FALLS
Wenn et falls introduisent une condition (« si », « au cas où »). Ce sont des conjonctions de subordination : le verbe conjugué va à la fin de la subordonnée. Si la subordonnée ouvre la phrase, la principale commence par son verbe.
• Wenn Sie Fieber haben, bleiben Sie zu Hause. — Si vous avez de la fièvre, restez à la maison.
• Falls der Termin nicht passt, rufen Sie uns an. — Au cas où le rendez-vous ne conviendrait pas, appelez-nous.
• Ich gehe zum Arzt, wenn es nicht besser wird. — J’irai chez le médecin si ça ne va pas mieux.
Falls insiste sur l’éventualité ; wenn est plus courant et signifie aussi « quand, chaque fois que ».

À RETENIR — CONSEILLER : SOLLTE
Pour donner un conseil, on emploie sollen au Konjunktiv II : sollte (« devrais », « devriez »). L’infinitif va à la fin.
• ich sollte, du solltest, er/sie sollte — je devrais, tu devrais, il/elle devrait
• wir sollten, ihr solltet, Sie sollten — nous devrions, vous devriez
• Du solltest mehr trinken. — Tu devrais boire davantage.
• Sie sollten sich ein paar Tage schonen. — Vous devriez vous ménager quelques jours.
Autres formules de conseil : An deiner Stelle würde ich … (à ta place, je …) · Wie wäre es, wenn du …? (et si tu … ?)

À RETENIR — CE N’EST PAS NÉCESSAIRE : NICHT MÜSSEN, NICHT BRAUCHEN … ZU
• Sie müssen nicht nüchtern kommen. — Vous n’êtes pas obligé(e) de venir à jeun.
• Sie brauchen nicht nüchtern zu kommen. — Même sens, avec brauchen.
Brauchen se construit avec zu + infinitif, surtout avec une négation (nicht, kein) ou avec nur : Sie brauchen keinen Termin zu machen. Sie brauchen nur anzurufen. Avec un verbe à particule, zu se glisse entre la particule et le verbe : anzurufen, mitzubringen.

ATTENTION — LES PIÈGES DES FRANCOPHONES
• « Vous ne devez pas » est ambigu en français. En allemand : Sie müssen nicht = ce n’est pas nécessaire ; Sie dürfen nicht = c’est interdit. « Sie dürfen nicht rauchen » et « Sie müssen nicht rauchen » n’ont pas du tout le même sens.
• Le « si » d’une question indirecte se dit ob, pas wenn : Die Ärztin fragt, ob ich Allergien habe.
• Après une subordonnée en tête de phrase, le sujet ne passe pas devant le verbe : « Wenn ich Fieber habe, ich bleibe zu Hause » est faux ; on dit bleibe ich.
• Avec brauchen, gardez le zu à l’écrit : Du brauchst nicht zu kommen.` } },

    // 6 · Grammaire : s'entraîner
    { id: 'b1-gesundheit-grammatik', kind: 'exercise', title: 'S’entraîner : wenn, falls, sollte et brauchen … zu', estimatedMinutes: 14,
      competences: ['lecture', 'expression-ecrite'],
      lesson: { description: `${bi('Üben Sie Bedingungen, Ratschläge und „nicht brauchen … zu“.', 'Entraînez-vous aux conditions, aux conseils et à « nicht brauchen … zu ».')}

MERKE
[fr] À retenir
• wenn / falls … verbe à la fin, puis verbe de la principale juste après la virgule.
• sollte + infinitif à la fin : un conseil.
• nicht brauchen … zu + infinitif = nicht müssen.` },
      questions: [
        order('q1', C.ordnen, [['Wenn', 'du', 'Fieber', 'hast,', 'solltest', 'du', 'zu Hause', 'bleiben.']],
          'La subordonnée avec wenn se termine par son verbe (hast). Après la virgule viennent le verbe de la principale (solltest), puis le sujet (du) ; l’infinitif « bleiben » ferme la phrase.'),
        order('q2', C.ordnen, [['Ich', 'gehe', 'zum Arzt,', 'falls', 'die Schmerzen', 'nicht', 'besser', 'werden.']],
          'Ici la principale vient d’abord, avec le verbe en deuxième position (gehe). Après falls, le verbe « werden » va à la fin ; la négation nicht se place devant « besser ».'),
        hints(fill('q3', bi('Ergänzen Sie „sollte“ in der richtigen Form.', 'Complétez avec « sollte » à la bonne forme.'),
          'Du [[1]] mehr Wasser trinken. · Ihr [[2]] früher ins Bett gehen. · Herr Okoro, Sie [[3]] sich ein paar Tage schonen.',
          [['solltest'], ['solltet'], ['sollten']],
          'Sollte se conjugue comme un prétérit faible : du solltest, ihr solltet, Sie sollten. Pas d’Umlaut : « söllte » n’existe pas (contrairement à könnte, müsste).'),
        'sollen', 'sollen', 'sollen'),
        hints(fill('q4', bi('Ergänzen Sie mit „zu“ oder der Form mit „zu“.', 'Complétez avec « zu » ou la forme avec « zu ».'),
          'Sie brauchen keinen Termin [[1]] machen. · Morgen brauchst du nicht früh [[2]].',
          [['zu'], ['aufzustehen']],
          'Brauchen + négation + zu + infinitif : « vous n’avez pas besoin de prendre rendez-vous ». Avec un verbe à particule, zu se place entre la particule et le verbe, en un seul mot : aufzustehen.'),
        null, 'aufstehen'),
        choice('q5', bi('Was bedeutet: „Sie müssen nicht nüchtern kommen.“?', 'Que signifie : « Sie müssen nicht nüchtern kommen » ?'),
          [['Vous ne devez rien manger avant de venir.'], ['Vous pouvez manger avant de venir.', true], ['Vous devez venir le matin.']],
          'Nicht müssen = ne pas être obligé : vous pouvez manger normalement. La première traduction exprime une interdiction, qui se dirait « Sie dürfen vorher nichts essen ».'),
        choice('q6', bi('Ihr Kollege hustet seit zwei Wochen. Was sagen Sie?', 'Votre collègue tousse depuis deux semaines. Que dites-vous ?'),
          [['Du solltest zum Arzt gehen.', true], ['Du musst nicht zum Arzt gehen.'], ['Du brauchst zum Arzt gehen.']],
          'Un conseil : du solltest + infinitif à la fin. « Du musst nicht » dirait que ce n’est pas nécessaire, le contraire du conseil voulu. « Du brauchst zum Arzt gehen » est incorrect : brauchen + infinitif s’emploie avec une négation et zu.'),
        choice('q7', bi('„Die Ärztin fragt, … ich Allergien habe.“ Welches Wort passt?', 'Quel mot convient ?'),
          [['wenn'], ['falls'], ['ob', true]],
          'C’est une question indirecte (« Haben Sie Allergien? ») : on emploie ob. Wenn et falls expriment une condition et ne conviennent pas après « fragen ».'),
        hints(fill('q8', bi('Ergänzen Sie die Verben in der richtigen Form.', 'Complétez avec les verbes à la bonne forme.'),
          'Wenn du dich nicht gut [[1]], [[2]] du besser zu Hause.',
          [['fühlst'], ['bleibst']],
          'Dans la subordonnée, « fühlst » va à la fin. La principale commence par son verbe conjugué : bleibst du. Les deux verbes s’accordent avec du (-st).'),
        'fühlen', 'bleiben'),
        match('q9', bi('Was passt zusammen? Ordnen Sie zu.', 'Qu’est-ce qui va ensemble ? Associez.'),
          [['Wenn Sie hohes Fieber haben,', 'sollten Sie in die Sprechstunde gehen.'], ['Falls die Praxis geschlossen ist,', 'rufen Sie den Bereitschaftsdienst an.'],
            ['Wenn man genug schläft,', 'wird man seltener krank.'], ['Falls Sie Nebenwirkungen bemerken,', 'nehmen Sie das Medikament nicht weiter.']],
          'Chaque condition appelle sa conséquence logique : forte fièvre → consultation ; cabinet fermé → service de garde (Bereitschaftsdienst) ; bon sommeil → moins de maladies ; effets secondaires → arrêter le médicament. Remarquez le verbe en tête de chaque principale.'),
        choice('q10', bi('Welcher Satz ist richtig?', 'Quelle phrase est correcte ?'),
          [['Wenn ich krank bin, ich bleibe zu Hause.'], ['Wenn ich krank bin, bleibe ich zu Hause.', true], ['Wenn ich bin krank, bleibe ich zu Hause.']],
          'Verbe à la fin de la subordonnée (bin), puis verbe de la principale juste après la virgule (bleibe ich). La première phrase calque l’ordre français ; la troisième oublie de placer « bin » à la fin.'),
      ] },

    // 7 · Lexique
    { id: 'b1-gesundheit-wortschatz', kind: 'exercise', title: 'S’exercer : le vocabulaire de la santé', estimatedMinutes: 12,
      competences: ['lecture', 'expression-ecrite'],
      lesson: { description: `${bi('Lernen Sie Wörter zusammen: Nomen mit Verb, Wortfamilien und feste Formulierungen.', 'Apprenez les mots ensemble : nom et verbe, familles de mots et formules toutes faites.')}

ASTUCE
Pour dire où l’on a mal, l’allemand aime les mots composés : der Kopf + die Schmerzen = die Kopfschmerzen ; der Hals (la gorge) donne die Halsschmerzen. Et beaucoup de sensations se disent avec un datif : Mir ist kalt, mir ist übel (j’ai froid, j’ai la nausée).` },
      questions: [
        match('q1', bi('Welches Verb passt? Ordnen Sie zu.', 'Quel verbe convient ? Associez.'),
          [['Fieber', 'messen'], ['ein Medikament', 'einnehmen'], ['sich ein paar Tage', 'schonen'], ['einen Termin', 'absagen'], ['sich gesund', 'ernähren']],
          'Fieber messen (prendre la température), ein Medikament einnehmen (prendre un médicament ; en français on « prend » tout, en allemand non), sich schonen (se ménager), einen Termin absagen (annuler un rendez-vous), sich gesund ernähren (bien se nourrir).'),
        fill('q2', bi('Bilden Sie das Nomen.', 'Formez le nom.'),
          'gesund → die [[1]] · sich erkälten → die [[2]] · untersuchen → die [[3]] · krank → die [[4]]',
          [['Gesundheit'], ['Erkältung'], ['Untersuchung'], ['Krankheit']],
          'Les adjectifs donnent des noms en -heit (gesund → die Gesundheit, krank → die Krankheit) ; les verbes, des noms en -ung (erkälten → die Erkältung, untersuchen → die Untersuchung). Tous sont féminins.'),
        choice('q3', bi('Was ist eine „Überweisung“ beim Arzt?', 'Qu’est-ce qu’une « Überweisung » chez le médecin ?'),
          [['une ordonnance pour la pharmacie'], ['une lettre pour consulter un spécialiste', true], ['un arrêt de travail pour l’employeur']],
          'Chez le médecin, die Überweisung est la lettre qui vous oriente vers un spécialiste. L’ordonnance se dit das Rezept, l’arrêt de travail die Krankschreibung. À la banque, eine Überweisung est un virement.'),
        choice('q4', bi('Sie möchten sagen, dass es schlimmer wird. Was sagen Sie?', 'Vous voulez dire que ça empire. Que dites-vous ?'),
          [['Die Schmerzen werden immer stärker.', true], ['Die Schmerzen werden immer weniger.'], ['Die Schmerzen sind seit gestern weg.']],
          '« Immer + comparatif » exprime une évolution : immer stärker (de plus en plus fort). « Immer weniger » dirait le contraire ; « weg » signifie que la douleur a disparu.'),
        choice('q5', bi('Sie geben einer Freundin einen Rat. Was passt?', 'Vous donnez un conseil à une amie. Qu’est-ce qui convient ?'),
          [['Du hättest schon letzte Woche zum Arzt gegangen.'], ['An deiner Stelle ich würde mal zum Arzt gehen.'], ['An deiner Stelle würde ich mal zum Arzt gehen.', true]],
          '« An deiner Stelle würde ich … » (à ta place, je …) est une formule de conseil amicale. « An deiner Stelle » occupe la première place : le verbe « würde » suit directement, avant le sujet. La première phrase est fautive (gehen se conjugue avec sein : du wärst … gegangen).'),
        match('q6', bi('Was bedeutet das? Ordnen Sie zu.', 'Qu’est-ce que cela veut dire ? Associez.'),
          [['Ich habe Halsschmerzen.', 'J’ai mal à la gorge.'], ['Mir ist schwindelig.', 'J’ai des vertiges.'], ['Ich bin erkältet.', 'Je suis enrhumé(e).'], ['Mir ist übel.', 'J’ai la nausée.']],
          'Schwindelig et übel se construisent avec un datif sans sujet réel : Mir ist schwindelig, mir ist übel (littéralement « il m’est … »). Erkältet sein : être enrhumé ; die Halsschmerzen : le mal de gorge.'),
        hints(fill('q7', bi('Ergänzen Sie das Verb.', 'Complétez avec le verbe.'),
          'Ich fühle mich nicht gut. Ich [[1]] mich heute bei meiner Chefin krank.',
          [['melde']],
          'Sich krankmelden est séparable : ich melde mich … krank. On se déclare malade auprès de l’employeur (bei + datif) ; le médecin, lui, établit la Krankschreibung.'),
        'sich krankmelden'),
      ] },

    // 8 · Redemittel à voix haute
    { id: 'b1-gesundheit-redemittel', kind: 'exercise', title: 'Répéter à voix haute : chez le médecin et entre amis', estimatedMinutes: 9,
      competences: ['expression-orale'],
      lesson: { description: `${C.sprechen}

${bi('Mit diesen Sätzen beschreiben Sie Beschwerden, fragen in der Praxis nach und geben Ratschläge.', 'Avec ces phrases, vous décrivez des symptômes, vous posez des questions au cabinet et vous donnez des conseils.')}
TIPP
[fr] Conseil
${bi('Achten Sie auf die Umlaute: ä in „stärker“, ö in „könnte“, ü in „nüchtern“ und „frühstücken“.', 'Soignez les voyelles infléchies : ä dans « stärker », ö dans « könnte », ü dans « nüchtern » et « frühstücken ».')}` },
      questions: [
        speak('q1', 'Seit drei Tagen habe ich Halsschmerzen und Fieber.',
          'Décrire depuis quand : seit + datif et le présent. Après « Seit drei Tagen », le verbe « habe » vient en deuxième position. Halsschmerzen : accent sur HALS-.',
          ['Seit drei Tagen habe ich Halsschmerzen und Fieber.', 'Seit 3 Tagen habe ich Halsschmerzen und Fieber.']),
        speak('q2', 'Die Schmerzen sind seit gestern stärker geworden.',
          'Décrire une évolution : werden au Perfekt avec sein (sind … geworden). « Stärker » : comparatif de stark, avec Umlaut.'),
        speak('q3', 'Könnte ich bitte einen Termin für diese Woche bekommen?',
          'Demande polie au cabinet : « Könnte ich … ? » + infinitif à la fin. Attention : bekommen signifie recevoir, obtenir (pas « devenir »).'),
        speak('q4', 'Wenn es nicht besser wird, solltest du zum Arzt gehen.',
          'Une condition et un conseil : verbe « wird » à la fin de la subordonnée, puis « solltest du » juste après la virgule.'),
        speak('q5', 'Muss ich nüchtern kommen, oder darf ich frühstücken?',
          'Question à deux options reliées par oder : la voix monte sur la première (nüchtern kommen) et redescend à la fin (frühstücken). « Nüchtern » : ü bref et arrondi, proche du u français ; ch doux, comme dans ich.'),
        speak('q6', 'An deiner Stelle würde ich mich ein paar Tage schonen.',
          'Conseil amical : « An deiner Stelle würde ich … ». Le pronom réfléchi « mich » suit directement le sujet ; l’infinitif « schonen » ferme la phrase.'),
      ] },

    // 9 · Second document (thème impair : écoute) avec dictées
    { id: 'b1-gesundheit-hoeren2', kind: 'exercise', title: 'Comprendre : un conseil à la pharmacie', estimatedMinutes: 15,
      competences: ['ecoute', 'expression-ecrite'],
      lesson: { description: `${C.hoeren}

SITUATION
[fr] La situation
${bi('Herr Okoro ist erkältet und geht in die Apotheke. Die Apothekerin berät ihn.', 'M. Okoro est enrhumé et va à la pharmacie. La pharmacienne le conseille.')}
TIPP
[fr] Conseil
${bi('Achten Sie auf Zahlen: Wie oft? Wie lange? Wie viel?', 'Soyez attentif aux nombres : combien de fois ? combien de temps ? combien ?')}

DIKTAT
[fr] Dictée
${bi('Zum Schluss gibt die Apothekerin noch zwei Tipps. Hören Sie und schreiben Sie die Sätze.', 'Pour finir, la pharmacienne donne encore deux conseils. Écoutez et écrivez les phrases.')}` },
      placements: [{ media: 'b1-gesundheit-hoeren2-audio', caption: 'In der Apotheke' }],
      questions: [
        choice('q1', bi('Welche Beschwerden hat Herr Okoro?', 'Quels symptômes M. Okoro a-t-il ?'),
          [['Kopfschmerzen, Fieber und seit einer Woche Husten'], ['Halsschmerzen und Schnupfen, aber kein Fieber', true], ['Fieber und starke Bauchschmerzen']],
          '« Ich habe seit zwei Tagen Halsschmerzen und Schnupfen. Fieber habe ich nicht. » Der Schnupfen : le nez qui coule.'),
        choice('q2', bi('Wie viele Lutschtabletten darf er höchstens am Tag nehmen?', 'Combien de pastilles peut-il prendre au maximum par jour ?'),
          [['drei'], ['vier'], ['sechs', true]],
          '« Alle drei bis vier Stunden eine, aber höchstens sechs am Tag. » Trois et quatre indiquent l’intervalle en heures, pas le nombre de pastilles. Höchstens : au maximum.'),
        rfHoeren('q3', 'Für das Nasenspray braucht Herr Okoro ein Rezept.', 'f',
          'Faux : « Nein, beides bekommen Sie ohne Rezept. » Les pastilles et le spray sont en vente libre ; ensemble, ils coûtent 11,80 euros.'),
        choice('q4', bi('Was rät die Apothekerin wegen der Arbeit?', 'Que conseille la pharmacienne au sujet du travail ?'),
          [['Er soll zu Hause bleiben, weil er mit kleinen Kindern arbeitet.', true], ['Er kann ruhig arbeiten, wenn er kein Fieber hat.'],
            ['Er soll sofort eine Krankschreibung beim Arzt holen.']],
          '« Mit kleinen Kindern? Dann bleiben Sie lieber zu Hause … Eine Erkältung ist ansteckend. » Elle rappelle seulement que beaucoup d’employeurs veulent un certificat après trois jours.'),
        dictation('q5', 'Trinken Sie viel warmen Tee und schonen Sie sich ein paar Tage.',
          'Deux impératifs de politesse : Trinken Sie …, schonen Sie sich … Le pronom réfléchi « sich » suit « Sie ». « Warmen Tee » : accusatif masculin, -en.', 'frau2'),
        dictation('q6', 'Falls die Halsschmerzen nicht besser werden, kommen Sie bitte wieder.',
          'Falls envoie « werden » à la fin ; la principale commence par le verbe (kommen Sie). « Halsschmerzen » s’écrit en un mot, avec une majuscule.', 'sprecher'),
      ] },

    // 10 · Vérifier
    { id: 'b1-gesundheit-kontrolle', kind: 'exercise', title: 'Vérifier : le cabinet ferme pour les vacances', estimatedMinutes: 12,
      competences: ['lecture', 'ecoute'],
      lesson: { description: `${bi('Prüfen Sie, was Sie in diesem Modul gelernt haben: Hören, Grammatik und Wortschatz.', 'Vérifiez ce que vous avez appris dans ce module : écoute, grammaire et vocabulaire.')}

${bi('Sie rufen in der Praxis an und hören eine Ansage. Hören Sie sie für die Fragen 1 und 2.', 'Vous appelez le cabinet et tombez sur une annonce. Écoutez-la pour les questions 1 et 2.')}` },
      placements: [{ media: 'b1-gesundheit-kontrolle-audio', caption: 'Ansage der Praxis' }],
      questions: [
        choice('q1', bi('Was sollen Patientinnen und Patienten in dringenden Fällen tun?', 'Que doivent faire les patients en cas d’urgence ?'),
          [['bis zum neunzehnten August warten'], ['zur Praxis Doktor Schmitt in der Gartenstraße gehen', true], ['eine Nachricht auf dem Anrufbeantworter hinterlassen']],
          '« In dringenden Fällen wenden Sie sich bitte an unsere Vertretung, die Praxis Doktor Schmitt. » Die Vertretung : le cabinet qui remplace. Le 19 août est la date de réouverture.'),
        choice('q2', bi('Bis wann kann man bei Doktor Albers noch ein Rezept bestellen?', 'Jusqu’à quand peut-on encore commander une ordonnance chez le Dr Albers ?'),
          [['bis zum 1. August', true], ['bis zum 2. August'], ['bis zum 16. August']],
          '« Wenn Sie ein neues Rezept brauchen, können Sie es noch bis zum ersten August bei uns bestellen. » Le cabinet est fermé du 2 au 16 août.'),
        order('q3', C.ordnen, [['Ich', 'rufe', 'in der Praxis', 'an,', 'falls', 'das Fieber', 'steigt.']],
          'La principale « Ich rufe in der Praxis an » a un verbe séparable : la particule « an » se place à la fin de la principale, avant la virgule. Après falls, le verbe « steigt » termine la phrase.'),
        hints(fill('q4', bi('Ergänzen Sie den Ratschlag.', 'Complétez le conseil.'),
          'Mit hohem Fieber [[1]] du nicht zur Arbeit gehen.',
          [['solltest']],
          'Un conseil à un ami : du solltest + infinitif à la fin (gehen). Sollte est le Konjunktiv II de sollen.'),
        'sollen (Konjunktiv II)'),
        choice('q5', bi('Was bedeutet „nüchtern“ beim Arzt?', 'Que signifie « nüchtern » chez le médecin ?'),
          [['sans rendez-vous'], ['sans avoir dormi'], ['sans avoir mangé', true]],
          'Nüchtern kommen : venir à jeun, sans avoir mangé (souvent pour une prise de sang). Dans la vie courante, nüchtern veut aussi dire « sobre ».'),
        choice('q6', bi('Welcher Satz ist richtig?', 'Quelle phrase est correcte ?'),
          [['Du brauchst morgen nicht kommen zu.'], ['Du brauchst morgen zu nicht kommen.'], ['Du brauchst morgen nicht zu kommen.', true]],
          'Zu se place juste devant l’infinitif, à la fin : nicht zu kommen. La négation « nicht » précède le groupe zu + infinitif.'),
        fill('q7', bi('Ergänzen Sie das passende Wort.', 'Complétez avec le mot qui convient.'),
          'In der Apotheke bekommen Sie dieses Medikament nur mit einem [[1]] von der Ärztin.',
          [['Rezept']],
          'Das Rezept : l’ordonnance (« mit einem Rezept », datif neutre). Certains médicaments sont « verschreibungspflichtig » : il faut une ordonnance.'),
        choice('q8', bi('„Die Apothekerin fragt, … ich noch andere Medikamente nehme.“ Welches Wort passt?', 'Quel mot convient ?'),
          [['ob', true], ['wenn'], ['dass']],
          'La question directe « Nehmen Sie andere Medikamente? » se répond par oui ou non : la question indirecte commence par ob. Wenn exprimerait une condition ; « fragen, dass » est impossible.'),
      ] },
  ],
};
