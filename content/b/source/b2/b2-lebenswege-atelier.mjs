// Module B2 n° 2 · atelier « Lebenswege » (lot R5). Raconter une expérience et la commenter avec le recul, présenter un
// exposé sur le plurilinguisme : modèles annotés (récit d'expérience écrit, début d'exposé enregistré), réagir à des
// arguments enregistrés (4 répétitions), médiation de deux sources dont une en français (portrait pour un journal de
// quartier), erreurs typiques, entraînement au format « Lesen : article et points de vue », deux missions sur grille B2.
import { C2, aide, choice, fill, order, match, speakB2, GRIDS } from '../../lib.mjs';

/** Indices affichés sous les trous d'un fill (forme de base à transformer). */
const hints = (question, ...values) => ({ ...question,
  blanks: question.blanks.map((blank, index) => (values[index] ? { ...blank, hint: values[index] } : blank)) });

const INTERVIEW = [
  '„Ich bin 2009 zum Studium nach Leipzig gekommen, Maschinenbau. Ehrlich gesagt hatte ich mir Deutschland wärmer vorgestellt, und damit meine ich nicht nur das Wetter. Im ersten Winter wäre ich fast zurückgeflogen. Geblieben bin ich wegen meiner Lerngruppe: Drei Kommilitonen haben mich zu sich nach Hause eingeladen, mit mir für die Prüfungen gelernt und mir geholfen, eine Wohnung zu finden.',
  'Nach dem Studium habe ich sechs Jahre bei einem Zulieferer für die Autoindustrie gearbeitet. 2021 habe ich gekündigt und mit zwei Freunden eine Fahrradwerkstatt im Leipziger Osten eröffnet. Dort bilden wir auch junge Geflüchtete aus. Ich will etwas von dem zurückgeben, was ich damals bekommen habe.“',
];

export default {
  id: 'b2-lebenswege-atelier',
  title: 'Lebenswege – Werkstatt: Erfahrungen erzählen und über Mehrsprachigkeit sprechen',
  objective: 'Rédiger un récit d’expérience commenté avec le recul, présenter un exposé structuré sur le plurilinguisme, réagir à des arguments dans une discussion, faire le portrait d’une personne à partir de deux sources (allemande et française) et s’entraîner à la lecture d’un article d’opinion.',
  grammarFocus: [],
  sources: ['Textes, dialogues et exercices originaux LinguaCap.'],

  vocabulary: [
    { word: 'Erfahrungsbericht', article: 'der', plural: 'Erfahrungsberichte', partOfSpeech: 'noun', translation: 'le récit d’expérience',
      example: 'Das Magazin sammelt Erfahrungsberichte zum Thema Auswandern.', note: null },
    { word: 'eine Entscheidung treffen', partOfSpeech: 'expression', translation: 'prendre une décision',
      example: 'Vor sieben Jahren habe ich eine Entscheidung getroffen, die mein Leben verändert hat.', note: 'jamais « eine Entscheidung nehmen »' },
    { word: 'Damals hätte ich nie gedacht, dass …', partOfSpeech: 'expression', translation: 'À l’époque, je n’aurais jamais pensé que …',
      example: 'Damals hätte ich nie gedacht, dass ich einmal ein Team leiten würde.', note: 'verbe à la fin après dass' },
    { word: 'Rückblickend würde ich sagen, …', partOfSpeech: 'expression', translation: 'Avec le recul, je dirais …',
      example: 'Rückblickend würde ich sagen, dass es die richtige Entscheidung war.', note: null },
    { word: 'Das hat mich viel Kraft gekostet.', partOfSpeech: 'expression', translation: 'Cela m’a demandé beaucoup d’énergie.',
      example: 'Die Anerkennung meines Abschlusses hat mich viel Kraft gekostet.', note: 'kosten + accusatif de la personne' },
    { word: 'Formalitäten', article: null, plural: null, partOfSpeech: 'noun', translation: 'les formalités',
      example: 'Klären Sie die Formalitäten so früh wie möglich.', note: 'toujours au pluriel dans ce sens · die Formalität' },
    { word: 'einplanen', partOfSpeech: 'verb', translation: 'prévoir (du temps, de l’argent)',
      example: 'Planen Sie für die ersten Monate mehr Zeit ein, als Sie glauben.', note: 'séparable : ein|planen' },
    { word: 'Geduld haben mit', partOfSpeech: 'expression', translation: 'être patient avec',
      example: 'Haben Sie Geduld mit sich selbst.', note: '+ datif' },
    { word: 'Mein Rat an alle, die …', partOfSpeech: 'expression', translation: 'Mon conseil à tous ceux qui …',
      example: 'Mein Rat an alle, die auswandern wollen: Lernen Sie die Sprache vorher.', note: null },
    { word: 'In meinem Vortrag geht es um …', partOfSpeech: 'expression', translation: 'Mon exposé porte sur …',
      example: 'In meinem Vortrag geht es um Mehrsprachigkeit.', note: '+ accusatif' },
    { word: 'Lassen Sie mich mit … beginnen.', partOfSpeech: 'expression', translation: 'Permettez-moi de commencer par …',
      example: 'Lassen Sie mich mit einer persönlichen Erfahrung beginnen.', note: '+ datif' },
    { word: 'Ich komme jetzt zu meinem nächsten Punkt.', partOfSpeech: 'expression', translation: 'J’en viens à mon point suivant.',
      example: 'Ich komme jetzt zu meinem nächsten Punkt: den Vorteilen.', note: null },
    { word: 'Zusammenfassend lässt sich sagen, dass …', partOfSpeech: 'expression', translation: 'En résumé, on peut dire que …',
      example: 'Zusammenfassend lässt sich sagen, dass Mehrsprachigkeit vor allem eine Chance ist.', note: 'verbe à la fin après dass' },
    { word: 'Da muss ich widersprechen.', partOfSpeech: 'expression', translation: 'Là, je dois vous contredire.',
      example: 'Da muss ich widersprechen: Kinder lernen Deutsch auch in der Kita.', note: 'jemandem widersprechen (datif) · inséparable' },
    { word: 'Kurz gesagt: …', partOfSpeech: 'expression', translation: 'En bref : …',
      example: 'Kurz gesagt: Jede Familie muss ihren eigenen Weg finden.', note: null },
    { word: 'Wie … erzählt, …', partOfSpeech: 'expression', translation: 'Comme le raconte …',
      example: 'Wie seine Schwester erzählt, reparierte er schon als Kind Fahrräder.', note: 'indiquer la source d’une information' },
    { word: 'stolz sein auf', partOfSpeech: 'expression', translation: 'être fier de',
      example: 'Sein Vater ist heute sehr stolz auf ihn.', note: '+ accusatif' },
  ],

  media: [
    { key: 'b2-lebenswege-atelier-modell-audio', kind: 'audio', title: 'Modèle : le début d’un exposé sur le plurilinguisme',
      script: [
        { voice: 'mann', name: 'Mateus Pereira', text: 'Guten Tag zusammen. In meinem Vortrag geht es um Mehrsprachigkeit, also um die Frage, was es bedeutet, mit mehr als einer Sprache zu leben. Lassen Sie mich mit einer persönlichen Erfahrung beginnen.' },
        { voice: 'mann', name: 'Mateus Pereira', text: 'Meine Eltern kommen aus Porto, ich bin in Mannheim aufgewachsen. Zu Hause haben wir Portugiesisch gesprochen, in der Schule Deutsch. Als Kind fand ich das oft peinlich. Heute bin ich froh, beide Sprachen behalten zu haben, und im Nachhinein hätte ich gern auch noch Spanisch gelernt.' },
        { pause: 0.8 },
        { voice: 'mann', name: 'Mateus Pereira', text: 'Mein Vortrag hat drei Teile. Zuerst erkläre ich kurz, was Fachleute unter Mehrsprachigkeit verstehen. Danach spreche ich über die Vorteile, aber auch über die Schwierigkeiten, die mehrsprachige Menschen erleben. Zum Schluss sage ich Ihnen, wie ich selbst dazu stehe, und ich freue mich auf Ihre Fragen.' },
        { pause: 0.8 },
        { voice: 'mann', name: 'Mateus Pereira', text: 'Ich komme also zu meinem ersten Punkt.' },
      ] },
    { key: 'b2-lebenswege-atelier-diskussion-beitrag1', kind: 'audio', title: 'Intervention 1 : parler allemand à la maison',
      script: [{ voice: 'frau2', name: 'Frau Ostermann', text: 'Ich finde, wer in Deutschland lebt, sollte auch zu Hause Deutsch sprechen. Sonst haben die Kinder in der Schule von Anfang an einen Nachteil, und den holen sie nie mehr auf.' }] },
    { key: 'b2-lebenswege-atelier-diskussion-beitrag2', kind: 'audio', title: 'Intervention 2 : un père inquiet',
      script: [{ voice: 'mann3', name: 'Herr Castillo', text: 'Bei uns zu Hause sprechen wir Spanisch, Deutsch und manchmal Englisch, alles durcheinander. Meine Tochter mischt ständig die Sprachen. Ich mache mir Sorgen, dass sie am Ende keine Sprache richtig kann.' }] },
    { key: 'b2-lebenswege-atelier-diskussion-beitrag3', kind: 'audio', title: 'Intervention 3 : des enfants qui ne répondent plus qu’en allemand',
      script: [{ voice: 'frau3', name: 'Frau Saarinen', text: 'Ich bin in Finnland aufgewachsen und habe mit meinen Kindern immer Finnisch gesprochen. Trotzdem antworten sie mir heute nur noch auf Deutsch. Hätte ich strenger sein sollen?' }] },
    { key: 'b2-lebenswege-atelier-diskussion-beitrag4', kind: 'audio', title: 'Intervention 4 : le modérateur demande un résumé',
      script: [{ voice: 'mann2', name: 'Moderator', text: 'Wir haben leider nur noch wenig Zeit. Können Sie Ihre Position bitte in einem Satz zusammenfassen?' }] },
    { key: 'b2-lebenswege-atelier-mediation-interview', kind: 'image', title: 'Extrait d’interview : Ousmane Sarr',
      alt: 'Extrait d’une interview dans un journal de quartier de Leipzig : Ousmane Sarr raconte ses études, son premier hiver, l’aide de son groupe d’étude et l’atelier de vélos qu’il a ouvert.',
      image: { layout: 'article', kicker: 'Menschen aus unserem Viertel', icon: 'bike', title: '„Ich will etwas zurückgeben“',
        byline: 'Stadtteilblatt Leipzig-Ost · Aus dem Interview mit Ousmane Sarr', paragraphs: INTERVIEW } },
  ],

  activities: [
    // 1 · Modèles annotés
    { id: 'b2-lebenswege-atelier-modell', kind: 'lesson', title: 'Modell: ein Erfahrungsbericht und der Anfang eines Vortrags', estimatedMinutes: 13,
      competences: ['lecture', 'ecoute'],
      lesson: { description: `MODELL 1: EIN ERFAHRUNGSBERICHT
[fr?] Modèle 1 : un récit d’expérience commenté
${aide('Lesen Sie den Beitrag von Ivana Marić im Leserforum eines Magazins. Thema: „Eine Entscheidung, die mein Leben verändert hat“. Achten Sie auf den Aufbau und auf die Formulierungen, mit denen sie zurückblickt.', 'Lisez la contribution d’Ivana Marić au forum des lecteurs d’un magazine, sur le thème « Une décision qui a changé ma vie ». Observez la structure et les formules qui lui servent à regarder en arrière.')}

Vor sieben Jahren habe ich eine Entscheidung getroffen, die mein Leben gründlich verändert hat: Ich habe meine Stelle als Bauingenieurin in Split gekündigt und bin nach Stuttgart gezogen. Ein früherer Kollege hatte mir von einer offenen Stelle erzählt, und ich hatte nur drei Wochen Zeit, mich zu entscheiden.
Die ersten Monate waren schwieriger, als ich erwartet hatte. Mein Abschluss musste erst anerkannt werden, und bis dahin durfte ich nur als Assistentin arbeiten. Außerdem hatte ich Heimweh, vor allem nach dem Meer. Rückblickend hätte ich mich vor dem Umzug besser informieren sollen: Wenn ich gewusst hätte, wie lange die Anerkennung dauert, hätte ich den Antrag schon von Split aus gestellt.
Trotzdem bereue ich meine Entscheidung nicht. Heute leite ich ein kleines Team, ich habe Freunde gefunden und spreche fast fließend Deutsch. Ich bin froh, diesen Schritt gewagt zu haben, auch wenn er mich viel Kraft gekostet hat.
Mein Rat an alle, die über einen Umzug ins Ausland nachdenken: Klären Sie die Formalitäten so früh wie möglich, und planen Sie für die ersten Monate mehr Zeit und Geld ein, als Sie glauben. Und haben Sie Geduld mit sich selbst.

AUFBAU
1. ${aide('Einleitung: die Entscheidung, der Zeitpunkt und die Situation damals.', 'Introduction : la décision, le moment et la situation de départ.')}
2. ${aide('Erfahrung: Was ist danach passiert? Was war schwierig? Konkrete Beispiele.', 'L’expérience : la suite, les difficultés, des exemples concrets.')}
3. ${aide('Rückblick: Was hätten Sie anders machen sollen? Hier steht der Konjunktiv II der Vergangenheit.', 'Le regard rétrospectif : ce que vous auriez dû faire autrement, au Konjunktiv II passé.')}
4. ${aide('Bewertung: Wie sehen Sie die Entscheidung heute?', 'Le bilan : comment jugez-vous cette décision aujourd’hui ?')}
5. ${aide('Schluss: ein Rat an die Leserinnen und Leser.', 'Conclusion : un conseil aux lecteurs.')}

EINLEITEN
[fr?] Introduire
• Vor … Jahren habe ich eine Entscheidung getroffen, die …
• Damals hätte ich nie gedacht, dass …
ZURÜCKBLICKEN
[fr?] Regarder en arrière
• Rückblickend hätte ich … sollen.
• Wenn ich gewusst hätte, dass …, hätte ich …
• Im Nachhinein war das …
BEWERTEN
[fr?] Juger
• Trotzdem bereue ich meine Entscheidung nicht.
• Ich bin froh, … zu haben, auch wenn …
RATEN
[fr?] Conseiller
• Mein Rat an alle, die …: …
• Planen Sie … ein, und haben Sie Geduld mit sich selbst.

MODELL 2: DER ANFANG EINES VORTRAGS
[fr?] Modèle 2 : le début d’un exposé
${aide('Hören Sie, wie Mateus Pereira seinen Vortrag über Mehrsprachigkeit beginnt. Er nennt das Thema, beginnt mit einer persönlichen Erfahrung und kündigt dann die drei Teile seines Vortrags an.', 'Écoutez comment Mateus Pereira commence son exposé sur le plurilinguisme : il annonce le sujet, part d’une expérience personnelle, puis présente les trois parties de son exposé.')}

VORTRAGEN
[fr?] Structurer un exposé
• In meinem Vortrag geht es um …
• Lassen Sie mich mit einer persönlichen Erfahrung beginnen.
• Mein Vortrag hat drei Teile. Zuerst …, danach … und zum Schluss …
• Ich komme jetzt zu meinem nächsten Punkt.
• Zusammenfassend lässt sich sagen, dass …` },
      placements: [{ media: 'b2-lebenswege-atelier-modell-audio', caption: 'Mateus Pereira beginnt seinen Vortrag' }] },

    // 2 · Réagir à des arguments enregistrés
    { id: 'b2-lebenswege-atelier-diskussion', kind: 'exercise', title: 'Diskutieren: Sollen Familien zu Hause Deutsch sprechen?', estimatedMinutes: 12,
      competences: ['ecoute', 'expression-orale'],
      lesson: { description: `SITUATION
${aide('Im Stadtteilzentrum findet ein Gesprächsabend statt. Das Thema: „Sollen zugewanderte Familien mit ihren Kindern zu Hause Deutsch sprechen?“ Sie hören vier Beiträge. Wählen Sie jeweils die Reaktion, die am besten passt.', 'Une soirée-débat a lieu au centre de quartier sur le thème : « Les familles immigrées doivent-elles parler allemand à la maison avec leurs enfants ? » Vous entendez quatre interventions. Choisissez chaque fois la réaction qui convient le mieux.')}
${aide('Sprechen Sie danach die vier Reaktionen laut nach. Sprechen Sie ruhig und freundlich, auch wenn Sie widersprechen.', 'Répétez ensuite les quatre réactions à voix haute, calmement et aimablement, même pour contredire.')}` },
      placements: [
        { media: 'b2-lebenswege-atelier-diskussion-beitrag1', questionId: 'q1', transcriptVisibility: 'after_answer' },
        { media: 'b2-lebenswege-atelier-diskussion-beitrag2', questionId: 'q2', transcriptVisibility: 'after_answer' },
        { media: 'b2-lebenswege-atelier-diskussion-beitrag3', questionId: 'q3', transcriptVisibility: 'after_answer' },
        { media: 'b2-lebenswege-atelier-diskussion-beitrag4', questionId: 'q4', transcriptVisibility: 'after_answer' },
      ],
      questions: [
        choice('q1', aide('Beitrag 1: Sie sind anderer Meinung. Welche Reaktion widerspricht höflich und mit einem Argument?', 'Intervention 1 : vous n’êtes pas d’accord. Quelle réaction contredit poliment, avec un argument ?'),
          [['Genau, und in der Pause sollten die Kinder dann auch wirklich nur Deutsch sprechen dürfen.'],
            ['Das ist doch Unsinn, davon haben Sie offensichtlich überhaupt keine Ahnung.'],
            ['Da muss ich widersprechen: Deutsch lernen die Kinder auch in der Kita und in der Schule.', true],
            ['Da muss ich widersprechen, aber darüber möchte ich heute lieber nicht reden.']],
          aide('„Da muss ich widersprechen“ kündigt den Widerspruch höflich an, und nach dem Doppelpunkt folgt das Argument. Die erste Reaktion stimmt zu, die zweite greift die Person an, und die vierte widerspricht, ohne etwas zu begründen.',
            'On annonce poliment son désaccord, puis on donne un argument après les deux-points. Les autres réactions approuvent, attaquent la personne ou contredisent sans justifier.')),
        choice('q2', aide('Beitrag 2: Sie haben in einer Radiosendung gehört, dass Fachleute das Mischen von Sprachen bei Kindern für normal halten. Sie möchten Herrn Castillo damit beruhigen. Was sagen Sie?', 'Intervention 2 : vous avez entendu à la radio que, pour les spécialistes, il est normal qu’un enfant mélange les langues. Vous voulez rassurer M. Castillo avec cette information. Que dites-vous ?'),
          [['Das verstehe ich, aber Fachleute sagen, dass das Mischen ganz normal ist.', true],
            ['Das verstehe ich, deshalb sollten Sie ab sofort nur noch Deutsch sprechen.'],
            ['Ihre Sorge ist berechtigt: Mit drei Sprachen ist jedes Kind überfordert.'],
            ['Das ist Ihre Sache, dazu möchte ich mich lieber nicht äußern.']],
          aide('Zuerst zeigen Sie Verständnis („Das verstehe ich“), dann geben Sie die Information weiter: Für Fachleute ist das Mischen kein Zeichen von Verwirrung. Die zweite und die dritte Reaktion widersprechen genau dem, was die Fachleute sagen; die vierte beruhigt niemanden.',
            'On montre d’abord de la compréhension, puis on transmet l’information des spécialistes : mélanger les langues est normal. Deux réponses la contredisent, la dernière ne rassure personne.')),
        choice('q3', aide('Beitrag 3: Sie möchten Frau Saarinen mit einer eigenen Erfahrung Mut machen. Welche Reaktion passt?', 'Intervention 3 : vous voulez encourager Mme Saarinen en racontant votre propre expérience. Quelle réaction convient ?'),
          [['Ja, da hätten Sie wirklich viel strenger sein müssen, jetzt ist es zu spät.'],
            ['Bei uns war es anders: Unsere Kinder haben nie richtig Deutsch gelernt.'],
            ['Das kenne ich gar nicht, meine Kinder sprechen bis heute alle Sprachen perfekt.'],
            ['Bei uns war es ähnlich. Erst die Ferien bei den Großeltern haben das geändert.', true]],
          aide('„Bei uns war es ähnlich“ zeigt, dass Sie die Situation kennen, und der zweite Satz macht Mut: Es gibt einen Weg zurück zur Familiensprache. Die erste Reaktion macht ihr Vorwürfe, die zweite und die dritte haben mit ihrem Problem nichts zu tun.',
            'On montre qu’on connaît la situation, puis on encourage : une solution existe. Les autres réactions font des reproches ou sont hors sujet.')),
        choice('q4', aide('Beitrag 4: Der Moderator bittet um eine Zusammenfassung. Was antworten Sie?', 'Intervention 4 : le modérateur demande un résumé. Que répondez-vous ?'),
          [['Kurz gesagt: Es ist ein schwieriges Thema, und alle haben irgendwie ein bisschen recht.'],
            ['Kurz gesagt: Eltern sollten die Sprache sprechen, in der sie sich zu Hause fühlen.', true],
            ['Kurz gesagt: Dazu habe ich eigentlich gar keine eigene Meinung.'],
            ['Kurz gesagt: erstens die Kita, zweitens die Schule und drittens die Familie.']],
          aide('Eine Zusammenfassung nennt die eigene Position in einem klaren Satz. Die erste Antwort weicht aus, die dritte hat keine Position, und die vierte zählt nur Stichwörter auf, ohne etwas zu behaupten.',
            'Un résumé formule sa position en une phrase claire. Les autres réponses esquivent, n’ont pas d’avis ou énumèrent des mots sans rien affirmer.')),
        speakB2('q5', 'Da muss ich widersprechen: Deutsch lernen die Kinder auch in der Kita und in der Schule.',
          aide('„widersprechen“ ist untrennbar, die Betonung liegt auf „-spre-“. „Kita“ betonen Sie auf der ersten Silbe, mit langem i. Den Satzakzent setzen Sie auf „auch“: Das ist Ihr Gegenargument.',
            'widersprechen est inséparable : accent sur « -spre- ». Kita : accent sur la première syllabe, i long. Accent de phrase sur « auch ».')),
        speakB2('q6', 'Das verstehe ich, aber Fachleute sagen, dass das Mischen ganz normal ist.',
          aide('„Fachleute“: Betonung auf „Fach-“, das ch klingt wie in „Bach“. „normal“ betonen Sie auf der zweiten Silbe, mit langem a. Nach „Das verstehe ich“ machen Sie eine kleine Pause.',
            'Accent sur « Fach- » (ch guttural, comme dans « Bach ») ; « normal » accentué sur la deuxième syllabe, a long. Petite pause après « Das verstehe ich ».')),
        speakB2('q7', 'Bei uns war es ähnlich. Erst die Ferien bei den Großeltern haben das geändert.',
          aide('„ähnlich“ mit langem ä und dem ich-Laut am Ende. „Großeltern“: Betonung auf „Groß-“, langes o. „geändert“: Betonung auf „-än-“, hier ist das ä kurz.',
            'ä long dans « ähnlich », terminé par le son ich ; accent sur « Groß- » (o long) ; dans « geändert », accent sur « -än- », ä bref.')),
        speakB2('q8', 'Kurz gesagt: Eltern sollten die Sprache sprechen, in der sie sich zu Hause fühlen.',
          aide('Nach „Kurz gesagt“ machen Sie eine kleine Pause. „fühlen“ mit langem ü, „zu Hause“ mit Betonung auf „Hau-“. Am Ende geht die Stimme nach unten: Sie stellen Ihre Position fest.',
            'Petite pause après « Kurz gesagt » ; ü long dans « fühlen » ; accent sur « Hau- ». Voix descendante à la fin : vous affirmez votre position.')),
      ] },

    // 3 · Médiation : deux sources, dont une en français
    { id: 'b2-lebenswege-atelier-mediation', kind: 'exercise', title: 'Vermitteln: ein Porträt aus zwei Quellen', estimatedMinutes: 15,
      competences: ['lecture', 'expression-ecrite'],
      lesson: { description: `SITUATION
${aide('Das „Stadtteilblatt Leipzig-Ost“ stellt in jeder Ausgabe einen Menschen aus dem Viertel vor. Sie schreiben das nächste Porträt über Ousmane Sarr, der aus dem Senegal stammt. Sie haben zwei Quellen: einen Auszug aus einem Interview und eine E-Mail seiner Schwester Awa auf Französisch.', 'Le journal de quartier présente dans chaque numéro un habitant. Vous écrivez le prochain portrait, celui d’Ousmane Sarr, originaire du Sénégal. Vous disposez de deux sources : un extrait d’interview et un courriel de sa sœur Awa, en français.')}
${aide('Fassen Sie die wichtigsten Informationen aus beiden Quellen auf Deutsch zusammen. Übersetzen Sie nicht Wort für Wort, und sagen Sie, woher eine Information stammt.', 'Résumez en allemand les informations essentielles des deux sources. Ne traduisez pas mot à mot, et indiquez d’où vient chaque information.')}

QUELLE 1: AUS DEM INTERVIEW
[fr?] Source 1 : extrait de l’interview
${INTERVIEW.join('\n')}

QUELLE 2: E-MAIL VON AWA SARR
[fr?] Source 2 : le courriel d’Awa Sarr (en français)
Bonjour, merci pour votre message. Mon frère a toujours aimé réparer les choses : à douze ans, il démontait déjà les vélos de tout le quartier, à Thiès ! Notre père voulait qu’il devienne médecin, et il a été très déçu quand Ousmane a choisi la mécanique. Aujourd’hui, il est très fier de lui. Ce qu’Ousmane ne vous dira pas lui-même : chaque année, il envoie des pièces de vélo à une école professionnelle de Thiès, et il y anime un atelier de deux semaines pendant ses vacances. Il parle wolof, français, allemand et un peu d’anglais.
Bien cordialement, Awa Sarr

STRATEGIE
${aide('Suchen Sie zuerst, was nur in einer Quelle steht. Achten Sie dann darauf, was Ousmane selbst sagt und was andere über ihn erzählen.', 'Repérez d’abord ce qui ne figure que dans une source. Distinguez ensuite ce qu’Ousmane dit lui-même et ce que d’autres racontent de lui.')}` },
      placements: [{ media: 'b2-lebenswege-atelier-mediation-interview', caption: 'Quelle 1: Auszug aus dem Interview' }],
      questions: [
        fill('q1', aide('Ergänzen Sie die Notizen für das Porträt.', 'Complétez les notes pour le portrait.'),
          'Herkunft: [[1]] im Senegal · in Leipzig seit: [[2]] · Studium: [[3]] · Grund zu bleiben: seine [[4]] · heute: eine eigene [[5]] im Leipziger Osten, bildet junge Geflüchtete aus',
          [['Thiès', 'Thies'], ['2009'], ['Maschinenbau'], ['Lerngruppe', 'Kommilitonen', 'Lerngruppe an der Uni'], ['Fahrradwerkstatt', 'Werkstatt']],
          aide('Die Herkunft steht nur in der E-Mail („à Thiès“). Alles andere steht im Interview: „2009 zum Studium“, „Maschinenbau“, „Geblieben bin ich wegen meiner Lerngruppe“ und „eine Fahrradwerkstatt im Leipziger Osten“.',
            'La ville d’origine ne figure que dans le courriel. Le reste vient de l’interview : arrivée en 2009, études de génie mécanique, le groupe d’étude, l’atelier de vélos.')),
        fill('q2', aide('Was steht nur in der E-Mail? Geben Sie es auf Deutsch wieder.', 'Qu’est-ce qui ne figure que dans le courriel ? Transmettez-le en allemand.'),
          'Schon mit [[1]] Jahren reparierte er die Fahrräder seines Viertels. · Sein Vater wollte, dass er [[2]] wird, und war zuerst enttäuscht. · Jedes Jahr schickt er Fahrradteile an eine [[3]] in Thiès und gibt dort im Urlaub einen zweiwöchigen [[4]].',
          [['zwölf', '12'], ['Arzt', 'Mediziner'], ['Berufsschule', 'Berufsfachschule', 'berufsbildende Schule', 'Fachschule'], ['Workshop', 'Kurs', 'Lehrgang']],
          aide('„à douze ans“ → mit zwölf Jahren; „médecin“ → Arzt; „une école professionnelle“ → eine Berufsschule; „un atelier de deux semaines“ → hier kein Ort, sondern ein Kurs: ein zweiwöchiger Workshop oder Kurs. Achtung: „atelier“ heißt hier nicht „Werkstatt“.',
            '« Atelier » désigne ici une formation, pas un local : un Workshop ou un Kurs. Médecin se dit Arzt ; une école professionnelle, eine Berufsschule.')),
        choice('q3', aide('Ousmane erzählt im Interview nichts von seinem Engagement in Thiès. Wie gehen Sie im Porträt damit um?', 'Ousmane ne parle pas dans l’interview de son engagement à Thiès. Comment le traitez-vous dans le portrait ?'),
          [['Sie schreiben es so, als hätte Ousmane es Ihnen selbst erzählt.'],
            ['Sie erwähnen es und nennen die Quelle: „Wie seine Schwester erzählt, …“', true],
            ['Sie lassen es weg, weil die Information nur auf Französisch vorliegt.'],
            ['Sie zitieren die ganze E-Mail von Awa Sarr im Original.']],
          aide('Eine gute Mediation sagt, woher eine Information kommt. Awa schreibt ausdrücklich, dass Ousmane davon selbst nicht erzählen würde: Man darf es ihm also nicht in den Mund legen. Weglassen wäre schade, und ein französisches Zitat verstehen die Leser des Stadtteilblatts nicht.',
            'Une bonne médiation indique la source. On ne peut pas attribuer à Ousmane ce qu’il ne dit pas lui-même ; l’omettre serait dommage, et une citation en français serait incompréhensible pour les lecteurs.')),
        match('q4', aide('Wie geben Sie diese Stellen aus der E-Mail auf Deutsch wieder? Ordnen Sie zu.', 'Comment rendre ces passages du courriel en allemand ? Associez.'),
          [['il démontait déjà les vélos', 'er nahm schon Fahrräder auseinander'], ['il a été très déçu', 'er war sehr enttäuscht'],
            ['il est très fier de lui', 'er ist sehr stolz auf ihn'], ['ce qu’Ousmane ne vous dira pas lui-même', 'was Ousmane selbst nicht erzählen würde']],
          aide('„démonter“ heißt hier „auseinandernehmen“ (trennbar: er nahm … auseinander). „stolz sein auf“ steht mit Akkusativ. Für „ne vous dira pas“ passt im Deutschen der Konjunktiv II: „was er selbst nicht erzählen würde“.',
            'démonter : auseinandernehmen (séparable) ; être fier de : stolz sein auf + accusatif ; « ne vous dira pas » se rend bien par le Konjunktiv II.')),
        choice('q5', aide('Welcher Satz fasst beide Quellen richtig zusammen?', 'Quelle phrase résume correctement les deux sources ?'),
          [['Ousmane Sarr kam 2009 zum Studium nach Leipzig und eröffnete gleich danach eine Werkstatt.'],
            ['Sein Vater wollte, dass er Mechaniker wird, und ist heute sehr stolz auf ihn.'],
            ['Aus Dankbarkeit für die Hilfe im Studium bildet er heute selbst junge Menschen aus.', true],
            ['Nach dem ersten Winter verließ er Leipzig und kam erst nach Jahren zurück.']],
          aide('Im Interview sagt Ousmane, er wolle „etwas von dem zurückgeben“, was er bekommen hat; deshalb bildet er junge Geflüchtete aus. Vor der Werkstatt arbeitete er sechs Jahre bei einem Zulieferer, sein Vater wollte einen Arzt, und nach dem ersten Winter wäre er nur „fast“ zurückgeflogen.',
            'Il veut rendre ce qu’il a reçu. Les autres phrases se trompent : six ans dans l’industrie avant l’atelier, un père qui le voulait médecin, et un départ seulement envisagé (« fast »).')),
        order('q6', aide('Bilden Sie den Schlusssatz des Porträts.', 'Formez la phrase finale du portrait.'),
          [['Was', 'er', 'damals', 'bekommen hat,', 'gibt', 'er', 'heute', 'an junge Menschen', 'weiter.']],
          aide('Der Nebensatz mit „was“ steht auf Position 1, das Verb „bekommen hat“ an seinem Ende. Danach folgt direkt das Verb des Hauptsatzes: „gibt er“. „Weitergeben“ ist trennbar: „weiter“ steht ganz am Ende.',
            'La relative en « was » occupe la première place ; le verbe principal suit immédiatement (gibt er), et la particule « weiter » ferme la phrase.')),
      ] },

    // 4 · Erreurs typiques
    { id: 'b2-lebenswege-atelier-korrektur', kind: 'exercise', title: 'Korrigieren: typische Fehler im Erfahrungsbericht', estimatedMinutes: 10,
      competences: ['lecture', 'expression-ecrite'],
      lesson: { description: `${aide('Diese Sätze stammen aus Erfahrungsberichten von Kursteilnehmenden. Finden Sie die richtige Form.', 'Ces phrases viennent de récits d’expérience d’apprenants. Trouvez la forme correcte.')}

KORREKTURZEICHEN
[fr?] Les codes de correction
${aide('Ihre Lehrkraft verwendet diese Zeichen: G (Grammatik), W (Wortschatz), St (Satzstellung), R (Rechtschreibung), A (Ausdruck und Register).', 'Votre professeur utilise ces codes : G grammaire, W vocabulaire, St place des mots, R orthographe, A registre.')}` },
      questions: [
        choice('q1', aide('G: Welcher Satz ist richtig?', 'G : quelle phrase est correcte ?'),
          [['Wenn ich das gewusst würde, wäre ich früher gekommen.'], ['Wenn ich das gewusst hätte, wäre ich früher gekommen.', true],
            ['Wenn ich das gewusst hätte, hätte ich früher gekommen.'], ['Wenn ich das gewusst habe, wäre ich früher gekommen.']],
          aide('Beide Teile stehen im Konjunktiv II der Vergangenheit: „gewusst hätte“ (Perfekt mit „haben“) und „wäre gekommen“ (Perfekt mit „sein“). „Gewusst würde“ ist keine Form, „hätte gekommen“ hat das falsche Hilfsverb, und „gewusst habe“ ist Indikativ.',
            'Les deux propositions sont au Konjunktiv II passé, chacune avec l’auxiliaire de son parfait : gewusst hätte, wäre gekommen.')),
        hints(fill('q2', aide('G: Ergänzen Sie das Modalverb in der richtigen Form.', 'G : complétez avec le verbe de modalité à la bonne forme.'),
          'Ich hätte den Antrag früher stellen [[1]]. · Wir hätten nicht so lange warten [[2]].',
          [['müssen'], ['sollen']],
          aide('Mit einem zweiten Verb bleibt das Modalverb im Infinitiv: „hätte … stellen müssen“, „hätten … warten sollen“. „Gemusst“ und „gesollt“ sind hier falsch, auch wenn viele Lernende sie aus dem Perfekt ableiten.',
            'Avec un autre verbe, le modal reste à l’infinitif : jamais gemusst ni gesollt dans ce cas.')),
        'müssen', 'sollen'),
        choice('q3', aide('St: „Sie schreibt, …“ Welcher Nebensatz ist richtig?', 'St : quelle subordonnée est correcte ?'),
          [['…, dass sie sich früher um die Anerkennung hätte kümmern sollen.', true],
            ['…, dass sie sich früher um die Anerkennung kümmern sollen hätte.'],
            ['…, dass sie hätte sich früher um die Anerkennung kümmern sollen.'],
            ['…, dass sie sich früher um die Anerkennung hat kümmern gesollt.']],
          aide('Im Nebensatz mit zwei Infinitiven steht „hätte“ direkt vor den Infinitiven, nicht am Ende und nicht vor dem Mittelfeld. Die vierte Antwort mischt Indikativ und ein falsches Partizip.',
            'Dans la subordonnée, hätte se place juste avant le double infinitif : ni à la fin, ni avant le reste de la proposition.')),
        choice('q4', aide('W: Sie sind vor sieben Jahren umgezogen und wohnen immer noch dort. Welcher Satz ist richtig?', 'W : vous avez déménagé il y a sept ans et vous y habitez toujours. Quelle phrase est correcte ?'),
          [['Ich bin seit sieben Jahren nach Stuttgart gezogen.'], ['Ich bin für sieben Jahre nach Stuttgart gezogen.'],
            ['Ich bin in sieben Jahren nach Stuttgart gezogen.'], ['Ich bin vor sieben Jahren nach Stuttgart gezogen.', true]],
          aide('Der Umzug ist ein einmaliges Ereignis in der Vergangenheit: „vor sieben Jahren“. „Seit“ passt nur zu einem Zustand, der noch andauert („Ich wohne seit sieben Jahren in Stuttgart“). „Für sieben Jahre“ nennt eine geplante Dauer, „in sieben Jahren“ liegt in der Zukunft.',
            '« Il y a sept ans » : vor. Seit exige un état qui dure (ich wohne seit …) ; für indique une durée prévue, in un moment futur.')),
        fill('q5', aide('G: „als“, „wenn“ oder „wann“? Ergänzen Sie.', 'G : « als », « wenn » ou « wann » ? Complétez.'),
          '[[1]] ich nach Stuttgart kam, sprach ich kaum Deutsch. · Ich weiß nicht mehr genau, [[2]] ich meinen ersten Kurs besucht habe. · [[3]] ich heute Heimweh habe, rufe ich meine Schwester an.',
          [['Als'], ['wann'], ['Wenn']],
          aide('„Als“ steht für ein einmaliges Ereignis in der Vergangenheit, „wenn“ für eine Wiederholung oder für die Gegenwart, „wann“ für eine indirekte Frage nach dem Zeitpunkt.',
            'als : fait unique dans le passé ; wenn : répétition ou présent ; wann : question indirecte portant sur le moment.')),
        choice('q6', aide('A: Welcher Satz passt in einen sachlichen Erfahrungsbericht für ein Magazin?', 'A : quelle phrase convient dans un récit d’expérience publié dans un magazine ?'),
          [['Echt krass, das war mega die beste Entscheidung überhaupt!'], ['Rückblickend war es die beste Entscheidung meines Lebens.', true],
            ['Hiermit teile ich Ihnen mit, dass meine Entscheidung richtig war.'], ['Also, äh, ich würde sagen, das war schon irgendwie gut so.']],
          aide('Ein Erfahrungsbericht ist persönlich, aber sachlich formuliert. Die erste Antwort ist Jugendsprache, die dritte klingt wie ein Behördenbrief, und die vierte ist gesprochene Sprache mit Füllwörtern.',
            'Registre personnel mais soigné. Les autres phrases sont trop familières, trop administratives ou relèvent de l’oral.')),
      ] },

    // 5 · Entraînement au format : Lesen (article et points de vue)
    { id: 'b2-lebenswege-atelier-pruefung', kind: 'exercise', title: 'Prüfungstraining: Lesen, ein Artikel mit mehreren Standpunkten', estimatedMinutes: 20,
      competences: ['lecture'],
      lesson: { description: `PRÜFUNGSTRAINING LESEN
${aide('Lesen Sie den Zeitungsartikel. Wählen Sie bei jeder Aufgabe die richtige Antwort: a, b oder c.', 'Lisez l’article de presse. Pour chaque question, choisissez la bonne réponse : a, b ou c.')}
ZEIT
${aide('Etwa 18 Minuten, ohne Wörterbuch.', 'Environ 18 minutes, sans dictionnaire.')}

STRATEGIE
1. ${aide('Lesen Sie zuerst Titel und Vorspann und überfliegen Sie dann den Text: Wer kommt zu Wort?', 'Lisez d’abord le titre et le chapeau, puis parcourez le texte : qui prend la parole ?')}
2. ${aide('Die Aufgaben folgen der Reihenfolge des Textes. Suchen Sie für jede Aufgabe die passende Stelle.', 'Les questions suivent l’ordre du texte : cherchez pour chacune le passage correspondant.')}
3. ${aide('Unterscheiden Sie genau: Was ist Tatsache, was ist Meinung, und wessen Meinung ist es?', 'Distinguez bien les faits des opinions, et demandez-vous à qui appartient chaque opinion.')}

RENTE UNTER PALMEN – UND DANN?
[fr?] Article : « La retraite sous les palmiers, et après ? »
Von Theresa Kuhlmann
Jedes Jahr ziehen Tausende Menschen im Ruhestand aus Deutschland ins Ausland. Viele finden dort, was sie gesucht haben. Andere kehren nach einigen Jahren zurück. Was unterscheidet die beiden Gruppen?
Als Dieter Assmann vor neun Jahren in Rente ging, stand der Plan längst fest. Das Haus in Kassel wurde verkauft, und das Ehepaar zog an die Algarve, wo es schon zwanzig Jahre lang Urlaub gemacht hatte. „Wir dachten, wir kennen das Land“, erzählt Brigitte Assmann. „Aber Urlaub und Alltag sind zwei verschiedene Dinge.“ Ohne Portugiesisch wurde jeder Gang zum Amt zum Abenteuer, und die ersten Freundschaften entstanden fast nur mit anderen Deutschen. Heute, nach zwei Sprachkursen und vielen Missverständnissen, fühlen sich die beiden angekommen. Hätten sie sich besser vorbereiten können? „Natürlich“, sagt Dieter Assmann und lacht. „Aber vielleicht hätten wir uns dann gar nicht getraut.“
Der Soziologe Ansgar Mahler beschäftigt sich seit Jahren mit Menschen, die im Alter auswandern. Er hält das Phänomen weder für eine Flucht noch für ein Privileg der Reichen. „Die meisten suchen nicht nur die Sonne, sondern einen neuen Lebensabschnitt mit einer Aufgabe“, sagt er. Entscheidend für das Gelingen ist seiner Ansicht nach weniger das Geld als das soziale Netz: Wer nur unter Deutschen bleibt, lebt nach einigen Jahren oft isolierter als zu Hause. Kritisch wird es nach Mahlers Beobachtung vor allem, wenn einer der Partner stirbt oder pflegebedürftig wird. Dann fehlt häufig die Familie, und das Gesundheitssystem bleibt fremd.
Mit solchen Situationen hat Gesine Brüggemann täglich zu tun. Sie berät Menschen, die ins Ausland ziehen wollen, und zunehmend auch solche, die zurückkommen möchten. „Viele unterschätzen, wie kompliziert die Rückkehr ist“, sagt sie. Die Wohnung ist verkauft, der Freundeskreis hat sich aufgelöst, und die Krankenversicherung muss neu geregelt werden. Brüggemann rät deshalb, die ersten Jahre im Ausland als eine Art Probezeit zu betrachten: „Mieten Sie zunächst, statt zu kaufen. Und behalten Sie, wenn möglich, einen Fuß in Deutschland.“
Die Geschichten der Rückkehrer sollten niemanden abschrecken. Sie zeigen nur, dass ein Neuanfang im Alter ebenso viel Mut und Planung verlangt wie in jungen Jahren, vielleicht sogar mehr. Die Assmanns jedenfalls wollen bleiben. Ihr Rat an alle, die es ihnen nachmachen möchten, klingt einfach: „Lernen Sie die Sprache, bevor Sie sie brauchen.“` },
      questions: [
        choice('q1', aide('Was erfahren wir über die Vorbereitung des Ehepaars Assmann?', 'Qu’apprend-on sur la préparation du couple Assmann ?'),
          [['Sie hatten vor dem Umzug Portugiesisch gelernt.'], ['Sie hatten ihr Haus in Kassel vorsichtshalber zunächst nur vermietet.'],
            ['Sie kannten die Region aus dem Urlaub, aber nicht den Alltag.', true]],
          aide('„… an die Algarve, wo es schon zwanzig Jahre lang Urlaub gemacht hatte“ und „Urlaub und Alltag sind zwei verschiedene Dinge“. Portugiesisch lernten sie erst später („nach zwei Sprachkursen“), und das Haus wurde verkauft, nicht vermietet.',
            'Ils connaissaient la région par les vacances, pas la vie quotidienne. Le portugais est venu après ; la maison a été vendue.')),
        choice('q2', aide('Was meint Dieter Assmann mit dem Satz „Aber vielleicht hätten wir uns dann gar nicht getraut“?', 'Que veut dire Dieter Assmann par cette phrase ?'),
          [['Mit mehr Wissen über die Probleme hätte ihnen der Mut gefehlt.', true], ['Sie hatten vor der langen Reise an die Algarve große Angst.'],
            ['Sie bereuen den Umzug inzwischen und wollen zurück.']],
          aide('„dann“ bezieht sich auf die bessere Vorbereitung: Hätten sie alle Schwierigkeiten gekannt, hätten sie den Schritt vielleicht nicht gewagt. Von Angst vor der Reise spricht er nicht, und die beiden wollen bleiben.',
            '« dann » renvoie à une meilleure préparation : en connaissant toutes les difficultés, ils n’auraient peut-être pas osé. Ils ne regrettent rien et restent.')),
        choice('q3', aide('Was ist laut Ansgar Mahler entscheidend dafür, ob das Leben im Ausland gelingt?', 'Selon Ansgar Mahler, qu’est-ce qui décide de la réussite de la vie à l’étranger ?'),
          [['ein ausreichend hohes Einkommen im Ruhestand'], ['Kontakte, die über andere Deutsche hinausgehen', true], ['ein Land mit warmem Klima und viel Sonne']],
          aide('„Entscheidend für das Gelingen ist seiner Ansicht nach weniger das Geld als das soziale Netz: Wer nur unter Deutschen bleibt, lebt … oft isolierter.“ „Weniger … als …“ stellt Geld und soziales Netz gegenüber, und die Sonne suchen die meisten „nicht nur“.',
            '« weniger … als … » : moins l’argent que le réseau social ; rester entre Allemands isole. Le soleil n’est pas le critère décisif.')),
        choice('q4', aide('In welcher Situation wird es nach Mahler besonders schwierig?', 'Dans quelle situation cela devient-il particulièrement difficile, selon Mahler ?'),
          [['wenn ein Partner stirbt oder Pflege braucht', true], ['wenn die Kinder nicht regelmäßig zu Besuch kommen'],
            ['wenn man zu wenig Kontakt zu anderen Deutschen hat']],
          aide('„Kritisch wird es … vor allem, wenn einer der Partner stirbt oder pflegebedürftig wird.“ Die dritte Antwort dreht seine Aussage um: Gerade wer nur unter Deutschen bleibt, wird isoliert.',
            'Le moment critique : le décès ou la dépendance d’un des partenaires. La troisième réponse inverse son propos.')),
        choice('q5', aide('Welche Haltung vertritt Gesine Brüggemann?', 'Quelle position Gesine Brüggemann défend-elle ?'),
          [['Ältere Menschen sollten besser gar nicht auswandern.'], ['Eine Immobilie im Ausland ist eine sichere Geldanlage.'],
            ['Man sollte sich die Rückkehr zunächst offenhalten.', true]],
          aide('Sie rät, die ersten Jahre „als eine Art Probezeit“ zu betrachten, zuerst zu mieten und „einen Fuß in Deutschland“ zu behalten: Die Rückkehr soll möglich bleiben. Vom Auswandern rät sie nicht ab, und vom Kaufen rät sie gerade ab.',
            'Elle conseille de considérer les premières années comme une période d’essai, de louer d’abord et de garder « un pied en Allemagne ».')),
        choice('q6', aide('Welche Absicht verfolgt die Autorin im letzten Absatz?', 'Quelle intention l’autrice poursuit-elle dans le dernier paragraphe ?'),
          [['Sie warnt eindringlich vor dem Auswandern im Alter.'], ['Sie ermutigt zu einem gut vorbereiteten Neuanfang.', true],
            ['Sie kritisiert die Arbeit der Beratungsstellen.']],
          aide('„Die Geschichten der Rückkehrer sollten niemanden abschrecken“: Die Autorin ermutigt, betont aber, dass ein Neuanfang „Mut und Planung“ verlangt. Sie warnt also nicht, und die Beratung kritisiert sie nicht.',
            'L’autrice encourage tout en rappelant qu’un nouveau départ exige courage et préparation. Elle ne met pas en garde et ne critique personne.')),
      ] },

    // 6 · Mission écrite
    { id: 'b2-lebenswege-atelier-schreiben', kind: 'mission', title: 'Mission: einen Erfahrungsbericht schreiben', estimatedMinutes: 28,
      competences: ['expression-ecrite'],
      lesson: { description: `SITUATION
${aide('Das Online-Magazin „Neue Wege“ sammelt im Leserforum Erfahrungsberichte zum Thema „Eine Entscheidung, die mein Leben verändert hat“. Die besten Beiträge werden in der nächsten Ausgabe veröffentlicht.', 'Le magazine en ligne « Neue Wege » recueille dans son forum des récits sur le thème « Une décision qui a changé ma vie ». Les meilleurs seront publiés dans le prochain numéro.')}
${aide('Die Entscheidung kann groß oder klein sein: ein Umzug, eine neue Stelle, eine Ausbildung, eine neue Sprache, eine Rückkehr.', 'La décision peut être importante ou modeste : un déménagement, un nouvel emploi, une formation, une nouvelle langue, un retour.')}

SO GEHEN SIE VOR
1. ${aide('Planen (6 Minuten): Überlegen Sie sich Stichwörter zu den fünf Teilen aus dem Modell von Ivana Marić.', 'Planifier (6 minutes) : trouvez des mots-clés pour les cinq parties du modèle d’Ivana Marić.')}
2. ${aide('Schreiben (17 Minuten): Schreiben Sie in Absätzen und verbinden Sie Ihre Sätze mit Konnektoren.', 'Écrire (17 minutes) : rédigez en paragraphes et reliez vos phrases par des connecteurs.')}
3. ${aide('Prüfen (5 Minuten): Lesen Sie Ihren Text mit der Checkliste. Achten Sie besonders auf „hätte“ und „wäre“.', 'Relire (5 minutes) : vérifiez votre texte avec la liste, en particulier hätte et wäre.')}` },
      mission: {
        oral: null,
        written: { prompt: aide('Schreiben Sie einen Erfahrungsbericht für das Forum (150 bis 250 Wörter). Beschreiben Sie die Entscheidung und die Situation damals, erzählen Sie, was danach passiert ist, kommentieren Sie im Rückblick, was Sie anders gemacht hätten, und geben Sie den Leserinnen und Lesern zum Schluss einen Rat.',
          'Écrivez un récit d’expérience pour le forum (150 à 250 mots) : la décision et la situation de départ, la suite, votre regard rétrospectif (ce que vous auriez fait autrement) et, pour finir, un conseil aux lecteurs.'),
          maxChars: 2400, minWords: 150 },
        checklist: [
          aide('Entscheidung, Zeitpunkt und Situation stehen in der Einleitung.', 'La décision, le moment et la situation sont dans l’introduction.'),
          aide('Ich erzähle die Folgen mit konkreten Beispielen.', 'Je raconte les conséquences avec des exemples concrets.'),
          aide('Mindestens zwei Sätze im Konjunktiv II der Vergangenheit (hätte … sollen, wäre …)', 'Au moins deux phrases au Konjunktiv II passé'),
          aide('Ein Satz mit Infinitiv Perfekt: „Ich bin froh, … zu haben.“', 'Une phrase à l’infinitif passé'),
          aide('Absätze, verschiedene Konnektoren und ein Rat zum Schluss', 'Des paragraphes, des connecteurs variés et un conseil final'),
        ],
        criteria: [
          { ...GRIDS.b2.schreiben[0], label: aide('Aufgabenerfüllung: Entscheidung, Folgen, Rückblick mit Bewertung und Rat; Erfahrungsbericht, sachliches Register', 'Tâche : décision, suites, regard rétrospectif, conseil ; registre soigné') },
          ...GRIDS.b2.schreiben.slice(1),
        ],
      } },

    // 7 · Mission orale : exposé
    { id: 'b2-lebenswege-atelier-sprechen', kind: 'mission', title: 'Mission: ein Referat über Mehrsprachigkeit halten', estimatedMinutes: 20,
      competences: ['expression-orale'],
      lesson: { description: `SITUATION
${aide('In Ihrem Deutschkurs hält jede Person ein kurzes Referat. Ihr Thema: „Mehrsprachigkeit – Chance oder Belastung?“ Sie sprechen drei bis vier Minuten.', 'Dans votre cours d’allemand, chacun présente un court exposé. Votre sujet : « Le plurilinguisme, une chance ou un fardeau ? » Vous parlez trois à quatre minutes.')}

INHALT
1. ${aide('Einleitung: Thema nennen und Aufbau ankündigen.', 'Introduction : annoncer le sujet et le plan.')}
2. ${aide('Eine persönliche Erfahrung mit Sprachen: in der Familie, in der Schule, bei der Arbeit.', 'Une expérience personnelle avec les langues : en famille, à l’école, au travail.')}
3. ${aide('Vorteile und Schwierigkeiten, jeweils mit einem Beispiel.', 'Avantages et difficultés, chacun avec un exemple.')}
4. ${aide('Die Situation in Ihrem Herkunftsland: Welche Sprachen spricht man dort, und wie werden sie gelernt?', 'La situation dans votre pays d’origine : quelles langues y parle-t-on, et comment les apprend-on ?')}
5. ${aide('Schluss: Ihre Meinung und eine kurze Zusammenfassung.', 'Conclusion : votre avis et un bref résumé.')}

VORBEREITUNG
${aide('Nehmen Sie sich zehn Minuten Zeit. Überlegen Sie sich zu jedem Teil nur Stichwörter, keine ganzen Sätze. Verwenden Sie die Formulierungen aus dem Modell von Mateus Pereira, um den Aufbau anzukündigen und von Punkt zu Punkt überzuleiten.', 'Prenez dix minutes. Pour chaque partie, cherchez seulement des mots-clés, pas des phrases entières. Reprenez les formules du modèle de Mateus Pereira pour annoncer le plan et passer d’un point à l’autre.')}` },
      mission: {
        oral: { prompt: aide('Halten Sie Ihr Referat „Mehrsprachigkeit – Chance oder Belastung?“ frei und ohne abzulesen (drei bis vier Minuten). Kündigen Sie den Aufbau an, sprechen Sie über Ihre eigenen Erfahrungen, über Vorteile und Schwierigkeiten und über Ihr Herkunftsland, und schließen Sie mit Ihrer Meinung.',
          'Présentez votre exposé librement, sans lire (trois à quatre minutes) : annoncez le plan, parlez de votre expérience, des avantages et des difficultés, de votre pays d’origine, et concluez par votre avis.'),
          maxSeconds: 240 },
        written: null,
        checklist: [
          aide('Ich nenne das Thema und kündige den Aufbau an.', 'J’annonce le sujet et le plan.'),
          aide('Ich erzähle eine persönliche Erfahrung mit Sprachen.', 'Je raconte une expérience personnelle avec les langues.'),
          aide('Ich nenne Vorteile und Schwierigkeiten mit Beispielen.', 'Je présente avantages et difficultés avec des exemples.'),
          aide('Ich leite von Punkt zu Punkt über: „Ich komme jetzt zu …“', 'Je fais des transitions entre les parties.'),
          aide('Ich schließe mit meiner Meinung und einer Zusammenfassung.', 'Je conclus par mon avis et un résumé.'),
        ],
        criteria: [
          { ...GRIDS.b2.sprechen[0], label: aide('Aufgabenerfüllung: alle fünf Teile in drei bis vier Minuten, klarer Aufbau, begründete Meinung', 'Tâche : les cinq parties en trois à quatre minutes, plan clair, avis justifié') },
          ...GRIDS.b2.sprechen.slice(1),
        ],
      } },

    // 8 · Bilan
    { id: 'b2-lebenswege-atelier-bilan', kind: 'lesson', title: 'Bilanz: Lebenswege', estimatedMinutes: 6,
      competences: ['lecture'],
      lesson: { description: `${aide('Lesen Sie die Ziele der beiden Module „Lebenswege“. Was können Sie schon sicher? Was möchten Sie noch üben?', 'Relisez les objectifs des deux modules « Lebenswege ». Que maîtrisez-vous déjà ? Que voulez-vous encore travailler ?')}

ICH KANN …
• ${aide('Ich kann einen Artikel mit mehreren Standpunkten verstehen und die Meinung der Autorin erkennen.', 'Je peux comprendre un article qui présente plusieurs points de vue et y reconnaître l’avis de l’autrice.')}
• ${aide('Ich kann einem längeren Radiogespräch folgen und dabei Notizen machen.', 'Je peux suivre une longue émission de radio en prenant des notes.')}
• ${aide('Ich kann von einer wichtigen Entscheidung erzählen und sie im Rückblick bewerten.', 'Je peux raconter une décision importante et la juger avec le recul.')}
• ${aide('Ich kann ein Referat mit klarem Aufbau halten und von Punkt zu Punkt überleiten.', 'Je peux présenter un exposé bien construit, avec des transitions.')}
• ${aide('Ich kann Informationen aus einer deutschen und einer französischen Quelle auf Deutsch zusammenfassen.', 'Je peux résumer en allemand les informations d’une source allemande et d’une source française.')}

STRATEGIEN
• ${aide('Beim Lesen: Tatsachen und Meinungen trennen und fragen, wessen Meinung es ist.', 'En lecture : séparer faits et opinions, et se demander à qui appartient l’opinion.')}
• ${aide('Bei der Mediation: die Quelle nennen („Wie seine Schwester erzählt, …“).', 'En médiation : citer la source.')}
• ${aide('Im Referat: den Aufbau ankündigen und am Ende zusammenfassen.', 'Dans un exposé : annoncer le plan et résumer à la fin.')}

NOCH NICHT SICHER?
${aide('Konjunktiv II der Vergangenheit und Infinitiv Perfekt: Lesen Sie noch einmal „Regel“ und machen Sie „Üben“ im Modul „Lebenswege“. Formulierungen für Bericht und Referat: Lesen Sie die beiden Modelle und den Wortschatz dieser Werkstatt. Satzstellung mit „hätte … sollen“ im Nebensatz: Wiederholen Sie „Korrigieren“.', 'Konjunktiv II passé et infinitif passé : revoyez « Regel » puis « Üben » du module Lebenswege. Formules du récit et de l’exposé : relisez les deux modèles et le lexique de cet atelier. Place de hätte … sollen en subordonnée : refaites « Korrigieren ».')}` } },
  ],
};
