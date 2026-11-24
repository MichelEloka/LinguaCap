// Module B2 n° 6 · atelier « Bildung » (lot R5). Prendre position et présenter un système éducatif : modèle annoté (une
// contribution argumentée à un forum, le début d'un exposé), réagir à des arguments enregistrés sur la suppression des
// notes (4 répétitions), médiation (synthèse de deux articles sur la formation continue pour un collègue), erreurs typiques
// (participe épithète, génitif, nominalisation, registre), entraînement au format « texte à trous avec phrases à replacer »
// (Lesen, une question par trou), deux missions sur grille B2.
import { C2, aide, choice, fill, order, match, speakB2, GRIDS } from '../../lib.mjs';

/** Indices affichés sous les trous d'un fill (forme de base à transformer). */
const hints = (question, ...values) => ({ ...question,
  blanks: question.blanks.map((blank, index) => (values[index] ? { ...blank, hint: values[index] } : blank)) });

// Entraînement Lesen : les six phrases à replacer (une reste inutilisée) ; chaque trou propose quatre d'entre elles.
const SATZ = {
  A: '„Am Anfang habe ich mich ein bisschen fremd gefühlt“, gibt sie zu, „aber das hat sich schnell gelegt.“',
  B: 'Man meldet sich einfach als Gasthörerin oder Gasthörer an und zahlt eine Gebühr pro Semester.',
  C: 'Erst nach dem Ende ihres Berufslebens konnte sie sich diesen Wunsch erfüllen.',
  D: 'Ein Student beschwerte sich sogar, weil er keinen Platz in einem Pflichtseminar bekam.',
  E: 'Seiner Erfahrung nach profitieren beide Seiten von den unterschiedlichen Perspektiven.',
  F: 'Deshalb hat sie direkt nach der Schule Geschichte studiert.',
};
const luecke = (id, number, letters, right, explanation) => choice(id, aide(`Lücke ${number}: Welcher Satz passt?`, `Trou ${number} : quelle phrase convient ?`),
  letters.map((letter) => [SATZ[letter], letter === right]), explanation);

const ARTIKEL_1 = 'Ob Programmierkurs am Abend, Sprachkurs in der Mittagspause oder ein Zertifikat in Projektmanagement: Weiterbildung ist für viele Beschäftigte selbstverständlich geworden. Vor allem Onlinekurse haben das Lernen flexibler gemacht. Man lernt, wann und wo es passt, und kann Familie, Beruf und Bildung besser verbinden.';
const ARTIKEL_1B = 'Auch Ältere profitieren: Eine Fünfzigjährige, die sich in eine neue Software einarbeitet, bleibt für ihren Arbeitgeber unverzichtbar. Unternehmen, die in die Weiterbildung ihrer Mitarbeitenden investieren, berichten zudem, dass weniger Beschäftigte kündigen. Lebenslanges Lernen, so das Fazit, ist keine Last, sondern eine Chance in einer Arbeitswelt, die sich ständig verändert.';
const FORUM_POST = 'Ich mache nächstes Jahr Abitur, und alle sagen mir, dass ich studieren soll. Aber ich arbeite gern mit den Händen und könnte in einer Tischlerei eine Ausbildung anfangen. Ist ein Studium heute wirklich noch der beste Weg in den Beruf? Was meint ihr?';

export default {
  id: 'b2-bildung-atelier',
  title: 'Bildung – Werkstatt: Stellung nehmen und Bildungswege vorstellen',
  objective: 'Écrire une contribution argumentée à un forum, réagir à des arguments dans une discussion sur l’école, résumer deux articles de points de vue différents pour un collègue, s’entraîner au texte à trous avec phrases à replacer et présenter le système éducatif de son pays.',
  grammarFocus: [],
  sources: ['Textes, discussions, articles et exercices originaux LinguaCap.'],

  vocabulary: [
    { word: 'Stellung nehmen zu', partOfSpeech: 'expression', translation: 'prendre position sur',
      example: 'Im Forum nehmen viele Leser Stellung zu dieser Frage.', note: '+ datif' },
    { word: 'die Auffassung vertreten, dass …', partOfSpeech: 'expression', translation: 'défendre l’idée que …',
      example: 'Ich vertrete die Auffassung, dass Weiterbildung freiwillig bleiben sollte.', note: 'verbe en fin de subordonnée après dass' },
    { word: 'Meiner Ansicht nach …', partOfSpeech: 'expression', translation: 'à mon avis …',
      example: 'Meiner Ansicht nach brauchen wir ein Recht auf Weiterbildung.', note: 'verbe juste après : Meiner Ansicht nach brauchen wir …' },
    { word: 'Zwar …, aber …', partOfSpeech: 'expression', translation: 'certes …, mais …',
      example: 'Zwar spricht einiges für Noten, aber sie sagen wenig über das Lernen aus.', note: 'verbe juste après zwar' },
    { word: 'Dafür spricht, dass …', partOfSpeech: 'expression', translation: 'un argument en faveur, c’est que …',
      example: 'Dafür spricht, dass man flexibel lernen kann.', note: 'contraire : Dagegen spricht, dass …' },
    { word: 'Hinzu kommt, dass …', partOfSpeech: 'expression', translation: 'à cela s’ajoute que …',
      example: 'Hinzu kommt, dass viele Eltern wenig Zeit haben.', note: null },
    { word: 'unterm Strich', partOfSpeech: 'expression', translation: 'au bout du compte, en fin de compte',
      example: 'Unterm Strich lernt man am meisten, wenn man einen Sinn darin sieht.', note: 'familier mais courant ; soutenu : alles in allem' },
    { word: 'etwas gelten lassen', partOfSpeech: 'expression', translation: 'admettre, accepter (un argument)',
      example: 'Dieses Argument lasse ich nur teilweise gelten.', note: null },
    { word: 'plädieren für', partOfSpeech: 'verb', translation: 'plaider pour',
      example: 'Ich plädiere für bezahlte Lernzeit während der Arbeit.', note: '+ accusatif' },
    { word: 'Forumsbeitrag', article: 'der', plural: 'Forumsbeiträge', partOfSpeech: 'noun', translation: 'la contribution à un forum',
      example: 'Ihr Forumsbeitrag sollte etwa zweihundert Wörter lang sein.', note: null },
    { word: 'Referat', article: 'das', plural: 'Referate', partOfSpeech: 'noun', translation: 'l’exposé',
      example: 'Im Deutschkurs hält jeder ein kurzes Referat.', note: 'ein Referat halten' },
    { word: 'Schulpflicht', article: 'die', plural: null, partOfSpeech: 'noun', translation: 'la scolarité obligatoire',
      example: 'In Frankreich beginnt die Schulpflicht mit drei Jahren.', note: 'sans pluriel' },
    { word: 'Abitur', article: 'das', plural: null, partOfSpeech: 'noun', translation: 'le baccalauréat allemand',
      example: 'Ohne Abitur kann man unter bestimmten Voraussetzungen studieren.', note: 'das Abitur machen' },
    { word: 'Note', article: 'die', plural: 'Noten', partOfSpeech: 'noun', translation: 'la note (scolaire)',
      example: 'In Deutschland ist eine Eins die beste Note.', note: 'de 1 (sehr gut) à 6 (ungenügend)' },
    { word: 'Rückmeldung', article: 'die', plural: 'Rückmeldungen', partOfSpeech: 'noun', translation: 'le retour (sur un travail), le feedback',
      example: 'Eine schriftliche Rückmeldung hilft oft mehr als eine Note.', note: null },
    { word: 'Lernzeit', article: 'die', plural: 'Lernzeiten', partOfSpeech: 'noun', translation: 'le temps consacré à apprendre',
      example: 'Bezahlte Lernzeit macht Weiterbildung für alle möglich.', note: null },
    { word: 'im Vergleich zu', partOfSpeech: 'expression', translation: 'par rapport à, comparé à',
      example: 'Im Vergleich zu Deutschland werden die Kinder in Frankreich später getrennt.', note: '+ datif' },
  ],

  media: [
    { key: 'b2-bildung-atelier-modell-audio', kind: 'audio', title: 'Modèle : le début d’un exposé sur l’école en France',
      script: [
        { voice: 'frau', name: 'Élodie Marchand', text: 'Guten Tag zusammen. Mein Thema heute ist das Bildungssystem in Frankreich, wo ich aufgewachsen bin, und ich möchte es mit dem deutschen System vergleichen.' },
        { voice: 'frau', name: 'Élodie Marchand', text: 'Mein Vortrag hat drei Teile. Zuerst gebe ich Ihnen einen kurzen Überblick über die Schulzeit in Frankreich. Danach vergleiche ich den Weg zum Abitur und zum Studium in beiden Ländern. Und zum Schluss erzähle ich, was ich selbst aus beiden Systemen mitgenommen habe.' },
        { voice: 'frau', name: 'Élodie Marchand', text: 'Lassen Sie mich mit einem Unterschied beginnen, der viele Deutsche überrascht: In Frankreich beginnt die Schulpflicht schon mit drei Jahren, in Deutschland erst mit sechs. Und während die Kinder in den meisten Bundesländern schon nach der vierten Klasse auf verschiedene Schulen verteilt werden, lernen in Frankreich fast alle bis etwa fünfzehn zusammen.' },
        { voice: 'frau', name: 'Élodie Marchand', text: 'Das hat Vorteile, aber auch Nachteile, auf die ich gleich zurückkomme. Ich komme also zu meinem ersten Punkt, der Schulzeit.' },
      ] },
    { key: 'b2-bildung-atelier-diskussion-beitrag1', kind: 'audio', title: 'Débat sur les notes : intervention 1',
      script: [{ voice: 'frau2', name: 'Frau Hadžić', text: 'Ich unterrichte seit zwanzig Jahren, und ich bin überzeugt: Noten messen vor allem, wer sich gut anpassen kann. Schriftliche Rückmeldungen würden den Kindern viel mehr helfen. Deshalb sollten wir die Noten bis zur neunten Klasse abschaffen.' }] },
    { key: 'b2-bildung-atelier-diskussion-beitrag2', kind: 'audio', title: 'Débat sur les notes : intervention 2',
      script: [{ voice: 'mann3', name: 'Herr Doğan', text: 'Mein Sohn ist in der siebten Klasse. Wenn er eine Vier schreibt, weiß ich sofort: Da muss er etwas tun. Bei einem langen Text der Lehrerin weiß ich das nicht. Ohne Noten tappen wir Eltern im Dunkeln.' }] },
    { key: 'b2-bildung-atelier-diskussion-beitrag3', kind: 'audio', title: 'Débat sur les notes : intervention 3',
      script: [{ voice: 'mann2', name: 'Herr Oswald', text: 'An unserer Schule haben wir einen Mittelweg gefunden. In den unteren Klassen gibt es Lernentwicklungsgespräche mit Eltern und Kindern, ab Klasse acht dann wieder Noten. Die Eltern sind damit überwiegend zufrieden.' }] },
    { key: 'b2-bildung-atelier-diskussion-beitrag4', kind: 'audio', title: 'Débat sur les notes : la modératrice',
      script: [{ voice: 'sprecherin', name: 'Moderatorin', text: 'Wir müssen langsam zum Schluss kommen. Können Sie Ihre Position bitte in einem Satz zusammenfassen?' }] },
    { key: 'b2-bildung-atelier-mediation-artikel', kind: 'image', title: 'Article 1 : « Jamais trop vieux pour apprendre »',
      alt: 'Article de magazine optimiste sur la formation continue : les cours en ligne rendent l’apprentissage plus flexible, les salariés plus âgés et les entreprises en profitent.',
      image: { layout: 'article', kicker: 'Weiterbildung', icon: 'newspaper', title: 'Nie zu alt zum Lernen',
        lead: 'Immer mehr Erwachsene bilden sich neben dem Beruf weiter. Digitale Angebote machen es möglich.', paragraphs: [ARTIKEL_1, ARTIKEL_1B] } },
    { key: 'b2-bildung-atelier-schreiben-forum', kind: 'image', title: 'Forum : le message de départ',
      alt: 'Message de forum d’une lycéenne : tout le monde lui conseille de faire des études, mais elle aime le travail manuel et pourrait commencer un apprentissage en menuiserie ; elle demande l’avis des lecteurs.',
      image: { layout: 'forum', title: 'Forum „Bildungswege“: Ist ein Studium noch der beste Weg?',
        posts: [{ author: 'Smilla_18', date: 'Mo., 19:42', text: FORUM_POST }] } },
  ],

  activities: [
    // 1 · Modèle annoté
    { id: 'b2-bildung-atelier-modell', kind: 'lesson', title: 'Modell: ein Forumsbeitrag und der Anfang eines Referats', estimatedMinutes: 13,
      competences: ['lecture', 'ecoute'],
      lesson: { description: `MODELL 1: EIN FORUMSBEITRAG
[fr?] Modèle 1 : une contribution argumentée à un forum
${aide('Lesen Sie den Beitrag aus dem Forum eines Bildungsmagazins. Achten Sie auf den Aufbau und auf die Formulierungen, mit denen der Autor argumentiert.', 'Lisez cette contribution au forum d’un magazine. Observez la structure et les formules avec lesquelles l’auteur argumente.')}

Forum „Bildung heute“ · Sollte Weiterbildung für alle Beschäftigten Pflicht sein?
Beitrag von T. Brandl
In vielen Branchen verändert sich die Arbeit so schnell, dass das in der Ausbildung erworbene Wissen nach wenigen Jahren veraltet ist. Trotzdem vertrete ich die Auffassung, dass eine allgemeine Pflicht zur Weiterbildung der falsche Weg wäre.
Zwar spricht einiges für eine solche Pflicht: Wer regelmäßig dazulernt, bleibt auf dem Arbeitsmarkt gefragt, und die Betriebe müssten endlich in ihre Beschäftigten investieren. Aber Lernen unter Zwang bringt erfahrungsgemäß wenig. Ich habe selbst an einem vorgeschriebenen Onlinekurs teilgenommen, bei dem die meisten Kolleginnen und Kollegen die Videos nur nebenbei laufen ließen.
Hinzu kommt, dass eine Pflicht vor allem diejenigen belasten würde, die ohnehin wenig Zeit haben, zum Beispiel Eltern kleiner Kinder oder Beschäftigte im Schichtdienst.
Meiner Ansicht nach brauchen wir stattdessen ein Recht auf Weiterbildung: bezahlte Lernzeit, gute Beratung und Angebote, die zur Lebenssituation passen. Unterm Strich lernen Menschen dann am meisten, wenn sie einen Sinn darin sehen, und nicht, wenn sie müssen.

AUFBAU
1. ${aide('Einleitung: das Thema aufgreifen und die eigene Position nennen („Trotzdem vertrete ich die Auffassung, dass …“).', 'Introduction : reprendre le thème et annoncer sa position.')}
2. ${aide('Gegenargument anerkennen und entkräften: „Zwar …, aber …“.', 'Reconnaître un contre-argument, puis le réfuter : « certes …, mais … ».')}
3. ${aide('Eigenes Argument mit einem Beispiel aus der Erfahrung.', 'Un argument personnel, appuyé par un exemple vécu.')}
4. ${aide('Weiteres Argument: „Hinzu kommt, dass …“.', 'Un argument supplémentaire : « à cela s’ajoute que … ».')}
5. ${aide('Schluss: ein Vorschlag und ein Fazit („Meiner Ansicht nach …“, „Unterm Strich …“).', 'Conclusion : une proposition et un bilan.')}

STELLUNG NEHMEN
[fr?] Prendre position
• Ich vertrete die Auffassung, dass …
• Meiner Ansicht nach …
• Ich halte es für richtig, … zu … / Ich halte es für einen Fehler, … zu …
ABWÄGEN
[fr?] Peser le pour et le contre
• Zwar spricht einiges für …, aber …
• Dafür spricht, dass … Dagegen spricht, dass …
• Das lasse ich nur teilweise gelten, denn …
ERGÄNZEN UND BELEGEN
[fr?] Ajouter un argument, donner un exemple
• Hinzu kommt, dass …
• Ein Beispiel aus meiner eigenen Erfahrung …
SCHLUSS
[fr?] Conclure
• Unterm Strich …
• Deshalb plädiere ich für …

MODELL 2: DER ANFANG EINES REFERATS
[fr?] Modèle 2 : le début d’un exposé
${aide('Hören Sie, wie Élodie Marchand ihr Referat über das Bildungssystem in Frankreich beginnt. Achten Sie darauf, wie sie das Thema nennt, den Aufbau ankündigt und mit einem Unterschied einsteigt.', 'Écoutez comment Élodie Marchand commence son exposé sur le système éducatif français : elle annonce le thème, puis son plan, et entre dans le sujet par une différence frappante.')}
REFERAT: STRUKTUR ANKÜNDIGEN
[fr?] Exposé : annoncer le plan
• Mein Thema heute ist …
• Mein Vortrag hat drei Teile. Zuerst … Danach … Zum Schluss …
• Lassen Sie mich mit einem Unterschied beginnen, der viele überrascht.
• Ich komme jetzt zu meinem zweiten Punkt.
• Im Vergleich zu Deutschland …` },
      placements: [{ media: 'b2-bildung-atelier-modell-audio', caption: 'Élodie Marchand beginnt ihr Referat' }] },

    // 2 · Réagir à des arguments enregistrés
    { id: 'b2-bildung-atelier-diskussion', kind: 'exercise', title: 'Diskutieren: Sollen Schulnoten abgeschafft werden?', estimatedMinutes: 12,
      competences: ['ecoute', 'expression-orale'],
      lesson: { description: `SITUATION
${aide('Der Elternbeirat Ihrer Schule hat zu einer Diskussionsrunde eingeladen. Das Thema: „Sollen Schulnoten bis zur neunten Klasse abgeschafft werden?“ Sie hören vier Beiträge. Wählen Sie jeweils die Reaktion, die am besten passt.', 'Le conseil des parents de votre école organise un débat : faut-il supprimer les notes jusqu’en neuvième classe ? Vous entendez quatre interventions. Choisissez chaque fois la réaction qui convient le mieux.')}
${aide('Sprechen Sie danach die vier Reaktionen laut nach. Achten Sie auf eine ruhige, sachliche Satzmelodie.', 'Répétez ensuite les quatre réactions à voix haute, sur un ton calme et posé.')}` },
      placements: [
        { media: 'b2-bildung-atelier-diskussion-beitrag1', questionId: 'q1', transcriptVisibility: 'after_answer' },
        { media: 'b2-bildung-atelier-diskussion-beitrag2', questionId: 'q2', transcriptVisibility: 'after_answer' },
        { media: 'b2-bildung-atelier-diskussion-beitrag3', questionId: 'q3', transcriptVisibility: 'after_answer' },
        { media: 'b2-bildung-atelier-diskussion-beitrag4', questionId: 'q4', transcriptVisibility: 'after_answer' },
      ],
      questions: [
        choice('q1', aide('Beitrag 1: Sie sind anderer Meinung. Welche Reaktion widerspricht höflich und mit einem Argument?', 'Intervention 1 : vous n’êtes pas d’accord. Quelle réaction contredit poliment, avec un argument ?'),
          [['Genau, schriftliche Rückmeldungen helfen den Kindern viel mehr als jede Note.'],
            ['Da bin ich anderer Meinung: Noten sind für viele Eltern die einzige klare Information.', true],
            ['Das ist doch naiv, so etwas kann wirklich nur eine Lehrerin behaupten.'],
            ['Da bin ich anderer Meinung, aber dazu möchte ich jetzt lieber nichts sagen.']],
          aide('„Da bin ich anderer Meinung“ leitet den Widerspruch höflich ein, und der Doppelpunkt kündigt das Argument an. Die erste Reaktion stimmt zu, die dritte greift die Person an statt das Argument, und die vierte widerspricht ohne Begründung.',
            'On annonce poliment son désaccord, puis on donne un argument. Les autres réactions approuvent, attaquent la personne ou contredisent sans justifier.')),
        choice('q2', aide('Beitrag 2: Sie möchten sichergehen, dass Sie Herrn Doğan richtig verstanden haben. Was sagen Sie?', 'Intervention 2 : vous voulez vérifier que vous avez bien compris M. Doğan. Que dites-vous ?'),
          [['Sie haben recht, eine Vier ist wirklich keine gute Note für einen Schüler.'],
            ['Ihr Sohn sollte einfach mehr lernen, dann haben Sie dieses Problem nicht.'],
            ['Verstehe ich Sie richtig, dass Ihr Sohn an seiner Schule schon jetzt keine Noten mehr bekommt?'],
            ['Verstehe ich Sie richtig, dass Ihnen schriftliche Rückmeldungen zu ungenau sind?', true]],
          aide('Mit „Verstehe ich Sie richtig, dass …?“ fasst man die Aussage des anderen zusammen und fragt nach. Herr Doğan kritisiert, dass ein Text der Lehrerin weniger klar ist als eine Note. Sein Sohn bekommt aber Noten („eine Vier“): Die dritte Antwort hat ihn missverstanden.',
            '« Verstehe ich Sie richtig, dass … ? » reformule pour vérifier. M. Doğan trouve les commentaires écrits moins clairs qu’une note ; son fils a bien des notes, la troisième réponse se trompe.')),
        choice('q3', aide('Beitrag 3: Der Vorschlag von Herrn Oswald überzeugt Sie nur teilweise. Welche Reaktion passt?', 'Intervention 3 : la proposition de M. Oswald ne vous convainc qu’en partie. Quelle réaction convient ?'),
          [['Das klingt vernünftig, allerdings frage ich mich, warum gerade ab Klasse acht.', true],
            ['Das ist der einzig richtige Weg, alle Schulen sollten ihn sofort übernehmen.'],
            ['Das überzeugt mich überhaupt nicht, Kompromisse bringen in der Schule nie etwas.'],
            ['Das klingt vernünftig, allerdings war ich selbst noch nie an Ihrer Schule.']],
          aide('Teilweise zustimmen heißt: zuerst das Positive anerkennen („Das klingt vernünftig“), dann mit „allerdings“ eine Frage oder Einschränkung anschließen, die sich auf den Inhalt bezieht. Die letzte Antwort hat dieselbe Struktur, aber ihre Einschränkung hat nichts mit dem Vorschlag zu tun.',
            'Accord partiel : on reconnaît d’abord le positif, puis « allerdings » introduit une réserve sur le fond. La dernière réponse a la même forme, mais sa réserve est hors sujet.')),
        choice('q4', aide('Beitrag 4: Die Moderatorin bittet um eine Zusammenfassung. Was antworten Sie?', 'Intervention 4 : la modératrice demande un résumé. Que répondez-vous ?'),
          [['Kurz gesagt: Es gibt viele verschiedene Meinungen, und irgendwie haben alle ein bisschen recht.'],
            ['Kurz gesagt: Zu diesem Thema habe ich eigentlich gar keine eigene Meinung.'],
            ['Kurz gesagt: Noten allein reichen nicht, sie sollten durch Gespräche ergänzt werden.', true],
            ['Kurz gesagt: erstens die Noten, zweitens die Eltern und drittens die Lehrkräfte.']],
          aide('Eine Zusammenfassung nennt die eigene Position in einem klaren Satz. Die richtige Antwort formuliert eine Position mit Vorschlag (Passiv mit Modalverb: „sollten ergänzt werden“). Die anderen Antworten weichen aus oder zählen nur Stichwörter auf.',
            'Un résumé exprime sa position en une phrase claire. Les autres réponses esquivent ou se contentent d’énumérer des mots.')),
        speakB2('q5', 'Da bin ich anderer Meinung: Noten sind für viele Eltern die einzige klare Information.',
          aide('„Meinung“ mit „ei“ wie in „mein“; „Noten“ mit langem o. In „Information“ liegt die Betonung auf der letzten Silbe („-tion“, gesprochen etwa „tsjohn“). Den Satzakzent setzen Sie auf „einzige“.',
            'Accent de mot sur la dernière syllabe de « Information » ; accent de phrase sur « einzige ». Le o de « Noten » est long.')),
        speakB2('q6', 'Verstehe ich Sie richtig, dass Ihnen schriftliche Rückmeldungen zu ungenau sind?',
          aide('In „Rückmeldungen“ liegt die Betonung auf „Rück-“, in „ungenau“ auf „un-“. Am Ende geht die Stimme nach oben: Es ist eine Frage, auf die man mit Ja oder Nein antworten kann.',
            'Accent sur « Rück- » et sur « un- ». Intonation montante à la fin : c’est une question fermée.')),
        speakB2('q7', 'Das klingt vernünftig, allerdings frage ich mich, warum gerade ab Klasse acht.',
          aide('„vernünftig“: Betonung auf „-nünf-“, das ü ist kurz. „acht“ endet mit dem hinteren ch-Laut wie in „Bach“. Machen Sie nach „vernünftig“ eine kleine Pause: Dann kommt die Einschränkung.',
            'Accent sur « -nünf- », ü bref ; le ch de « acht » se prononce au fond de la gorge. Petite pause avant « allerdings ».'),
          ['Das klingt vernünftig, allerdings frage ich mich, warum gerade ab Klasse acht.', 'Das klingt vernünftig, allerdings frage ich mich, warum gerade ab Klasse 8.']),
        speakB2('q8', 'Kurz gesagt: Noten allein reichen nicht, sie sollten durch Gespräche ergänzt werden.',
          aide('„Gespräche“ mit langem ä, „ergänzt“ mit Betonung auf „-gänzt“. Am Ende stehen Partizip und Infinitiv: „ergänzt werden“. Sprechen Sie das Ende deutlich und lassen Sie die Stimme fallen: Das ist Ihre Position.',
            'ä long dans « Gespräche », accent sur « -gänzt ». Voix descendante à la fin : vous affirmez votre position.')),
      ] },

    // 3 · Médiation : synthèse de deux sources
    { id: 'b2-bildung-atelier-mediation', kind: 'exercise', title: 'Vermitteln: zwei Artikel zur Weiterbildung zusammenfassen', estimatedMinutes: 16,
      competences: ['lecture', 'expression-ecrite'],
      lesson: { description: `SITUATION
${aide('Ihr Kollege Christoph bereitet eine Teambesprechung zum Thema „Weiterbildung im Betrieb“ vor. Er hat keine Zeit, zwei Artikel zu lesen, und bittet Sie um eine kurze, neutrale Zusammenfassung: Was sagen beide, und worin unterscheiden sie sich?', 'Votre collègue Christoph prépare une réunion d’équipe sur la formation continue. Il n’a pas le temps de lire deux articles et vous demande un résumé court et neutre : sur quoi s’accordent-ils, en quoi diffèrent-ils ?')}

ARTIKEL 1: NIE ZU ALT ZUM LERNEN
[fr?] Article 1 : « Jamais trop vieux pour apprendre »
Immer mehr Erwachsene bilden sich neben dem Beruf weiter. Digitale Angebote machen es möglich.
${ARTIKEL_1}
${ARTIKEL_1B}

ARTIKEL 2: DIE WEITERBILDUNGSFALLE
[fr?] Article 2 : « Le piège de la formation continue »
Lebenslanges Lernen gilt als Antwort auf eine Arbeitswelt, die sich immer schneller verändert. Doch die Angebote erreichen nicht alle gleichermaßen. Wer bereits einen Hochschulabschluss hat, bildet sich deutlich häufiger weiter als Beschäftigte ohne Berufsabschluss, also genau diejenigen, die eine Qualifizierung am dringendsten bräuchten.
Auch die viel gelobten Onlinekurse helfen hier wenig: Viele Teilnehmende brechen sie nach wenigen Wochen ab, weil ihnen nach einem langen Arbeitstag die Kraft fehlt. Hinzu kommt, dass die Verantwortung zunehmend beim Einzelnen liegt. Wer nicht lernt, so die unausgesprochene Botschaft, ist selbst schuld. Sinnvoller wäre bezahlte Lernzeit während der Arbeitszeit, damit Weiterbildung nicht vom Feierabend abhängt.

STRATEGIE
${aide('Lesen Sie zuerst beide Überschriften: Sie verraten oft schon die Haltung. Suchen Sie dann in jedem Artikel das Hauptargument und die Forderung. Geben Sie die Positionen neutral wieder, ohne Ihre eigene Meinung.', 'Lisez d’abord les deux titres : ils trahissent souvent la position. Cherchez ensuite l’argument principal et la revendication de chaque article. Restituez les positions de façon neutre, sans votre avis.')}` },
      placements: [{ media: 'b2-bildung-atelier-mediation-artikel', caption: 'Artikel 1: Nie zu alt zum Lernen' }],
      questions: [
        fill('q1', aide('Ergänzen Sie Ihre Notizen zu Artikel 1.', 'Complétez vos notes sur l’article 1.'),
          'Artikel 1 · Haltung: [[1]] · Onlinekurse machen das Lernen [[2]] · Ältere bleiben für den Arbeitgeber [[3]] · Vorteil für die Unternehmen: Weniger Beschäftigte [[4]]',
          [['optimistisch', 'positiv', 'zuversichtlich'], ['flexibler', 'flexibel'], ['unverzichtbar', 'unersetzlich'], ['kündigen']],
          aide('Schon die Überschrift „Nie zu alt zum Lernen“ und das Fazit („keine Last, sondern eine Chance“) zeigen die positive Haltung. Onlinekurse haben das Lernen „flexibler gemacht“; die Fünfzigjährige „bleibt für ihren Arbeitgeber unverzichtbar“; in Unternehmen, die investieren, „kündigen“ weniger Beschäftigte.',
            'Le titre et la conclusion montrent un ton optimiste : apprentissage plus flexible, salariés âgés indispensables, moins de démissions.')),
        fill('q2', aide('Ergänzen Sie Ihre Notizen zu Artikel 2.', 'Complétez vos notes sur l’article 2.'),
          'Artikel 2 · Haltung: kritisch · Wer schon gut qualifiziert ist, bildet sich [[1]] weiter · Onlinekurse: Viele [[2]] sie nach wenigen Wochen ab · Problem: Die Verantwortung liegt beim [[3]] · Forderung: bezahlte [[4]] während der Arbeitszeit',
          [['häufiger', 'öfter', 'mehr'], ['brechen'], ['Einzelnen'], ['Lernzeit']],
          aide('Menschen mit Hochschulabschluss bilden sich „deutlich häufiger“ weiter. Viele „brechen“ Onlinekurse ab (abbrechen, trennbar). Die Verantwortung liegt „beim Einzelnen“ (substantiviertes Adjektiv, großgeschrieben). Die Forderung: „bezahlte Lernzeit während der Arbeitszeit“.',
            'Les plus qualifiés se forment plus souvent ; beaucoup abandonnent les cours en ligne ; la responsabilité repose sur l’individu ; l’article réclame du temps de formation rémunéré.')),
        choice('q3', aide('Worin sind sich beide Artikel einig?', 'Sur quel point les deux articles sont-ils d’accord ?'),
          [['Onlinekurse erreichen alle Beschäftigten gleich gut.'], ['Die Unternehmen sollten die Weiterbildung allein bezahlen.'],
            ['Weiterbildung ist nötig, weil sich die Arbeitswelt ständig verändert.', true],
            ['Ältere Beschäftigte interessieren sich heute kaum noch für eine Weiterbildung.']],
          aide('Artikel 1 spricht von „einer Arbeitswelt, die sich ständig verändert“, Artikel 2 von „einer Arbeitswelt, die sich immer schneller verändert“: Beide halten lebenslanges Lernen für nötig. Über Onlinekurse sind sie sich gerade nicht einig, und die anderen Aussagen stehen in keinem Artikel.',
            'Les deux partent d’un monde du travail qui change vite. Ils divergent justement sur les cours en ligne ; les autres affirmations ne figurent dans aucun article.')),
        choice('q4', aide('Christoph braucht die Zusammenfassung für eine Teambesprechung. Was ist dabei am wichtigsten?', 'Christoph a besoin du résumé pour une réunion. Qu’est-ce qui compte le plus ?'),
          [['nur den Artikel zusammenfassen, der Ihrer eigenen Meinung entspricht'],
            ['die Positionen beider Artikel neutral wiedergeben und klar zuordnen', true],
            ['möglichst viele Formulierungen aus beiden Artikeln wörtlich übernehmen'],
            ['die beiden Artikel Satz für Satz in der richtigen Reihenfolge nacherzählen']],
          aide('Christoph möchte wissen, was beide Artikel sagen und worin sie sich unterscheiden. Eine gute Zusammenfassung ist neutral, ordnet jede Position ihrem Artikel zu und konzentriert sich auf das Wichtigste, statt Satz für Satz nachzuerzählen oder wörtlich abzuschreiben.',
            'Un bon résumé est neutre, attribue chaque position à sa source et va à l’essentiel, sans tout raconter ni recopier.')),
        match('q5', aide('Wie geben Sie die Aussagen neutral wieder? Ordnen Sie zu.', 'Comment restituer ces propos de façon neutre ? Associez.'),
          [['„… keine Last, sondern eine Chance“', 'Der erste Artikel betont die Chancen des Lernens.'],
            ['„Man lernt, wann und wo es passt.“', 'Onlinekurse machen das Lernen zeitlich flexibel.'],
            ['„… genau diejenigen, die eine Qualifizierung am dringendsten bräuchten“', 'Gering Qualifizierte bilden sich am seltensten weiter.'],
            ['„Wer nicht lernt, ist selbst schuld.“', 'Die Verantwortung wird auf den Einzelnen abgeschoben.']],
          aide('Bei einer Zusammenfassung zitiert man nicht, sondern formuliert mit eigenen Worten und nennt die Quelle. Aus bildhaften oder zugespitzten Sätzen werden sachliche Aussagen: „selbst schuld“ wird zu „Die Verantwortung wird … abgeschoben“.',
            'On ne cite pas : on reformule avec ses mots, de façon neutre et en nommant la source. Les formules imagées deviennent des constats factuels.')),
        order('q6', aide('Bilden Sie einen Satz für Ihre Zusammenfassung.', 'Formez une phrase pour votre résumé.'),
          [['Während', 'der erste Artikel', 'die Chancen', 'betont,', 'warnt', 'der zweite', 'vor neuen', 'Ungleichheiten.']],
          aide('„Während“ stellt hier zwei Positionen gegenüber (comme « alors que »). Im Nebensatz steht das Verb „betont“ am Ende. Danach beginnt der Hauptsatz direkt mit dem Verb „warnt“; „warnen vor“ verlangt den Dativ: vor neuen Ungleichheiten.',
            'Während oppose deux positions ; verbe en fin de subordonnée, puis la principale commence par le verbe. warnen vor + datif.')),
      ] },

    // 4 · Erreurs typiques
    { id: 'b2-bildung-atelier-korrektur', kind: 'exercise', title: 'Korrigieren: typische Fehler im Nominalstil', estimatedMinutes: 10,
      competences: ['lecture', 'expression-ecrite'],
      lesson: { description: `${aide('Diese Sätze stammen aus Texten von Kursteilnehmenden. Finden Sie jeweils die richtige Form.', 'Ces phrases viennent de textes d’apprenants. Trouvez chaque fois la forme correcte.')}

KORREKTURZEICHEN
[fr?] Les codes de correction
${aide('Ihre Lehrkraft verwendet diese Zeichen: G (Grammatik), W (Wortschatz), St (Satzstellung), R (Rechtschreibung), A (Ausdruck und Register). Jede Aufgabe übt eines davon.', 'Votre professeur utilise ces codes : G (grammaire), W (vocabulaire), St (place des mots), R (orthographe), A (registre). Chaque question en travaille un.')}` },
      questions: [
        choice('q1', aide('G: Welcher Satz ist richtig?', 'G : quelle phrase est correcte ?'),
          [['Mit der seit Jahren steigenden Zahl der Bewerbungen hat niemand gerechnet.', true],
            ['Mit der seit Jahren steigende Zahl der Bewerbungen hat niemand gerechnet.'],
            ['Mit der seit Jahren steigender Zahl der Bewerbungen hat niemand gerechnet.'],
            ['Mit der seit Jahren gestiegenden Zahl der Bewerbungen hat niemand gerechnet.']],
          aide('Das Partizip wird wie ein Adjektiv dekliniert: „mit der“ verlangt den Dativ, nach dem bestimmten Artikel endet es auf „-en“. „Gestiegenden“ mischt Partizip II und Partizip I; richtig wäre „gestiegenen“.',
            'Le participe se décline comme un adjectif : datif après « mit der », donc -en. « gestiegenden » mélange les deux participes.')),
        choice('q2', aide('St: Welcher Satz ist richtig?', 'St : quelle phrase est correcte ?'),
          [['Die finanzierte von der Stadt Beratung ist kostenlos.'], ['Die Beratung von der Stadt finanzierte ist kostenlos.'],
            ['Die von der Stadt Beratung finanzierte ist kostenlos.'], ['Die von der Stadt finanzierte Beratung ist kostenlos.', true]],
          aide('Reihenfolge des Partizipialattributs: Artikel, Erweiterung („von der Stadt“), Partizip („finanzierte“), Nomen („Beratung“). Das Partizip steht immer direkt vor dem Nomen, die Erweiterung immer davor.',
            'Ordre : article, complément, participe, nom. Le participe se place toujours juste devant le nom.')),
        fill('q3', aide('G: Ergänzen Sie den Artikel im Genitiv.', 'G : complétez avec l’article au génitif.'),
          'Nach Abschluss [[1]] Studiums hat sie ein Jahr im Ausland gearbeitet. · Wegen [[2]] hohen Kosten verzichten viele auf eine Weiterbildung. · Zur Verbesserung [[3]] Beratung stellt die Hochschule zwei Mitarbeiterinnen ein.',
          [['des'], ['der'], ['der']],
          aide('Im Nominalstil hängt am Nomen oft ein Genitiv: „des Studiums“ (Neutrum, mit „-s“ am Nomen), „der Beratung“ (Femininum). „Wegen“ verlangt in der Standardsprache ebenfalls den Genitiv: „wegen der hohen Kosten“ (Plural).',
            'Génitif après le nom : des (neutre), der (féminin et pluriel). wegen se construit aussi avec le génitif en langue standard.')),
        choice('q4', aide('W: Sie haben gestern eine Prüfung geschrieben. Das Ergebnis kennen Sie noch nicht. Welcher Satz passt?', 'W : vous avez passé un examen hier et n’en connaissez pas encore le résultat. Quelle phrase convient ?'),
          [['Ich habe gestern eine Prüfung bestanden.'], ['Ich habe gestern eine Prüfung abgelegt.', true],
            ['Ich habe gestern eine Prüfung passiert.'], ['Ich bin gestern durch eine Prüfung gegangen.']],
          aide('„Eine Prüfung ablegen“ (oder „machen“, „schreiben“) bedeutet, an ihr teilzunehmen. „Bestehen“ heißt, sie mit Erfolg abzuschließen: Das wissen Sie noch nicht. „Eine Prüfung passieren“ ist eine wörtliche Übersetzung, die es im Deutschen nicht gibt.',
            '« Passer un examen » se dit ablegen, machen ou schreiben ; bestehen signifie le réussir. « passieren » est un calque fautif.')),
        hints(fill('q5', aide('R: Ergänzen Sie das Verb als Nomen.', 'R : complétez avec le verbe employé comme nom.'),
          'Beim [[1]] hilft mir leise Musik. · Das regelmäßige [[2]] der Vokabeln ist wichtig. · Zum [[3]] braucht man vor allem Zeit.',
          [['Lernen'], ['Wiederholen'], ['Studieren']],
          aide('Ein substantivierter Infinitiv ist ein Nomen: Er wird großgeschrieben und ist immer neutral. Man erkennt ihn am Artikel davor: beim (bei dem), das, zum (zu dem).',
            'L’infinitif employé comme nom prend une majuscule et il est neutre ; on le repère à l’article qui le précède.')),
        'lernen', 'wiederholen', 'studieren'),
        choice('q6', aide('A: Welcher Satz passt in einen sachlichen Forumsbeitrag?', 'A : quelle phrase convient dans une contribution argumentée à un forum ?'),
          [['Ey Leute, Studiengebühren sind echt voll der Mist!'], ['Sehr geehrte Damen und Herren, hiermit teile ich Ihnen meine Meinung mit.'],
            ['Meiner Ansicht nach sollte das Studium gebührenfrei bleiben.', true], ['Studiengebühren? Keine Ahnung, ist mir eigentlich egal.']],
          aide('Ein Forumsbeitrag ist kein Brief: „Sehr geehrte Damen und Herren“ passt nicht. Er sollte aber sachlich sein und eine klare Position haben. Die erste Antwort ist zu umgangssprachlich, die letzte nimmt keine Stellung.',
            'Une contribution de forum n’est pas une lettre formelle, mais elle reste argumentée. Les autres phrases sont trop familières, trop formelles ou sans position.')),
      ] },

    // 5 · Entraînement au format : texte à trous avec phrases à replacer
    { id: 'b2-bildung-atelier-pruefung', kind: 'exercise', title: 'Prüfungstraining: Sätze in einen Text einsetzen', estimatedMinutes: 20,
      competences: ['lecture'],
      lesson: { description: `PRÜFUNGSTRAINING LESEN
${aide('In dem Zeitungstext fehlen fünf Sätze. Welcher Satz passt in welche Lücke? Ein Satz bleibt übrig.', 'Il manque cinq phrases dans cet article. Quelle phrase va dans quel trou ? Une phrase reste inutilisée.')}
ZEIT
${aide('Etwa 18 Minuten, ohne Wörterbuch.', 'Environ 18 minutes, sans dictionnaire.')}

STRATEGIE
1. ${aide('Lesen Sie zuerst den ganzen Text, ohne die Lücken zu füllen. Worum geht es in jedem Absatz?', 'Lisez d’abord tout le texte sans remplir les trous : de quoi parle chaque paragraphe ?')}
2. ${aide('Achten Sie auf die Wörter vor und nach der Lücke: Pronomen (sie, seiner), Verweise (diesen Wunsch, deshalb) und Signalwörter (sogar, erst).', 'Regardez les mots avant et après le trou : pronoms, reprises (diesen Wunsch, deshalb) et mots signaux (sogar, erst).')}
3. ${aide('Ein Satz passt nur, wenn er mit beiden Seiten der Lücke verbunden ist. Prüfen Sie am Ende, ob der übrige Satz wirklich nirgends passt.', 'Une phrase ne convient que si elle s’enchaîne avec ce qui précède et ce qui suit. Vérifiez à la fin que la phrase restante ne va nulle part.')}

MIT SIEBZIG ZURÜCK IN DEN HÖRSAAL
[fr?] Article de journal
Ingeborg Kuhnert sitzt in der dritten Reihe und schreibt eifrig mit. Um sie herum sitzen Studierende, die ihre Enkel sein könnten. (1) ………… Die 73-Jährige ist eine von rund dreißig Gasthörerinnen und Gasthörern, die in diesem Semester Vorlesungen im Fach Geschichte besuchen.
Ein solches Seniorenstudium bieten viele deutsche Hochschulen an. Wer teilnehmen möchte, braucht weder Abitur noch eine Aufnahmeprüfung. (2) ………… Einen Abschluss erwirbt man auf diesem Weg allerdings nicht.
Für Kuhnert spielt das keine Rolle. Vierzig Jahre lang hat sie als Steuerberaterin gearbeitet, für Geschichte blieb dabei kaum Zeit. (3) ………… „Ich wollte endlich verstehen, worüber ich früher nur nebenbei in der Zeitung gelesen habe“, sagt sie.
Nicht alle sind von den älteren Gästen begeistert. In beliebten Seminaren sind die Plätze knapp, und manche jüngere Studierende fühlen sich verdrängt. (4) ………… Die Universität hat deshalb eine Regel eingeführt: In Seminaren mit begrenzter Teilnehmerzahl haben regulär eingeschriebene Studierende Vorrang.
Kuhnerts Dozent sieht die gemischten Gruppen trotzdem positiv. (5) ………… „Wenn eine Siebzigjährige erzählt, wie sie selbst die Sechzigerjahre erlebt hat, wird Geschichte plötzlich lebendig.“
Kuhnert hat sich bereits für das nächste Semester eingeschrieben. Ihr Ziel: eine eigene Hausarbeit schreiben, „ganz freiwillig“.

DIE SÄTZE
• A ${SATZ.A}
• B ${SATZ.B}
• C ${SATZ.C}
• D ${SATZ.D}
• E ${SATZ.E}
• F ${SATZ.F}` },
      questions: [
        luecke('q1', 1, ['C', 'D', 'A', 'F'], 'A',
          aide('Satz A passt: Nach der Beschreibung (die Studierenden könnten ihre Enkel sein) erzählt Kuhnert, wie sie sich am Anfang gefühlt hat; „sie“ verweist auf Kuhnert. C braucht einen Wunsch, der vorher genannt wird, D setzt mit „sogar“ eine Beschwerde voraus, und F hat mit „deshalb“ keinen Grund.',
            'A enchaîne sur la description : « sie » renvoie à Mme Kuhnert. C, D et F exigent un élément qui n’a pas encore été mentionné (un souhait, une plainte, une cause).')),
        luecke('q2', 2, ['B', 'A', 'D', 'E'], 'B',
          aide('Satz B erklärt, wie man ohne Abitur und ohne Prüfung teilnimmt: Man meldet sich als Gasthörer an. Danach folgt die Einschränkung mit „allerdings“. In diesem Absatz kommt keine Person vor, auf die „sie“ (A) oder „seiner“ (E) verweisen könnte.',
            'B explique comment on s’inscrit, avant la restriction introduite par « allerdings ». Aucune personne dans ce paragraphe ne permet de comprendre « sie » (A) ou « seiner » (E).')),
        luecke('q3', 3, ['F', 'B', 'E', 'C'], 'C',
          aide('„Für Geschichte blieb dabei kaum Zeit“ – „diesen Wunsch“ in Satz C greift das auf: Erst nach dem Berufsleben hat sie Zeit für Geschichte. F widerspricht dem Text, denn sie war vierzig Jahre Steuerberaterin. B ist eine allgemeine Information und gehört in Absatz 2.',
            'C reprend l’idée : « ce souhait » ne se réalise qu’à la retraite. F contredit le texte ; B est une information générale du paragraphe 2.')),
        luecke('q4', 4, ['A', 'D', 'C', 'E'], 'D',
          aide('Satz D führt die Kritik weiter („fühlen sich verdrängt“ → „beschwerte sich sogar“). „Sogar“ steigert die Aussage davor. Danach erklärt „deshalb“, warum die Universität eine Regel eingeführt hat: wegen der Beschwerden.',
            'D prolonge la critique ; « sogar » renchérit. Puis « deshalb » explique la nouvelle règle : à cause de ces plaintes.')),
        luecke('q5', 5, ['D', 'B', 'E', 'F'], 'E',
          aide('Satz E passt zu „sieht die gemischten Gruppen trotzdem positiv“: „Seiner“ verweist auf den Dozenten, und das Zitat danach gibt ein Beispiel für die „unterschiedlichen Perspektiven“. D wäre hier ein Gegenargument und passt nicht zu „positiv“.',
            'E justifie le point de vue positif : « seiner » renvoie à l’enseignant, et la citation qui suit illustre les perspectives différentes.')),
        choice('q6', aide('Welche Regel gilt in Seminaren mit wenigen Plätzen?', 'Quelle règle s’applique dans les séminaires à places limitées ?'),
          [['Regulär eingeschriebene Studierende haben Vorrang.', true], ['Gasthörer dürfen nur in Vorlesungen sitzen.'],
            ['Ältere Gäste zahlen dort eine höhere Gebühr.'], ['Die Plätze werden unter allen Interessierten verlost.']],
          aide('„In Seminaren mit begrenzter Teilnehmerzahl haben regulär eingeschriebene Studierende Vorrang.“ „Vorrang haben“ heißt: zuerst drankommen. Gasthörer sind also nicht ausgeschlossen, und von Gebühren oder einer Verlosung ist keine Rede.',
            'Les étudiants régulièrement inscrits sont prioritaires ; les auditeurs libres ne sont pas exclus, et il n’est question ni de frais ni de tirage au sort.')),
      ] },

    // 6 · Mission écrite
    { id: 'b2-bildung-atelier-schreiben', kind: 'mission', title: 'Mission: einen Forumsbeitrag schreiben', estimatedMinutes: 28,
      competences: ['expression-ecrite'],
      lesson: { description: `SITUATION
${aide('Im Forum eines Bildungsmagazins hat eine Schülerin eine Frage gestellt. Viele Leserinnen und Leser antworten mit ihrer Meinung. Sie möchten auch einen Beitrag schreiben.', 'Sur le forum d’un magazine, une lycéenne a posé une question. De nombreux lecteurs répondent en donnant leur avis. Vous voulez écrire vous aussi une contribution.')}

FORUM „BILDUNGSWEGE“
[fr?] Le message de départ
Smilla_18 · Ist ein Studium noch der beste Weg?
${FORUM_POST}

SO GEHEN SIE VOR
1. ${aide('Planen (8 Minuten): Entscheiden Sie sich für eine Position. Überlegen Sie sich Stichwörter zu zwei Argumenten, zu einem Beispiel und zu einem Gegenargument.', 'Planifier (8 minutes) : choisissez une position ; trouvez des mots-clés pour deux arguments, un exemple et un contre-argument.')}
2. ${aide('Schreiben (15 Minuten): Folgen Sie dem Aufbau aus dem Modell: Einleitung mit Position, Gegenargument mit „zwar … aber“, Argumente, Schluss mit Rat.', 'Écrire (15 minutes) : suivez la structure du modèle.')}
3. ${aide('Prüfen (5 Minuten): Lesen Sie Ihren Text mit der Checkliste. Achten Sie auf die Stellung des Verbs und auf die Endungen.', 'Vérifier (5 minutes) : relisez avec la liste ; attention à la place du verbe et aux terminaisons.')}` },
      placements: [{ media: 'b2-bildung-atelier-schreiben-forum', caption: 'Forum „Bildungswege“' }],
      mission: {
        oral: null,
        written: { prompt: aide('Schreiben Sie einen Forumsbeitrag (150 bis 250 Wörter). Nehmen Sie Stellung zu der Frage, ob ein Studium heute noch der beste Weg in den Beruf ist. Begründen Sie Ihre Meinung mit mindestens zwei Argumenten und einem Beispiel, gehen Sie auf ein Gegenargument ein und geben Sie Smilla zum Schluss einen Rat.',
          'Écrivez une contribution au forum (150 à 250 mots). Prenez position : les études sont-elles encore le meilleur chemin vers un métier ? Justifiez votre avis par au moins deux arguments et un exemple, discutez un contre-argument et terminez par un conseil à Smilla.'),
          maxChars: 2400, minWords: 150 },
        checklist: [
          aide('Meine Position steht klar in der Einleitung.', 'Ma position est claire dès l’introduction.'),
          aide('Zwei Argumente, eines davon mit einem Beispiel', 'Deux arguments, dont un avec un exemple'),
          aide('Ein Gegenargument mit „zwar … aber“ oder „Dagegen spricht, dass …“', 'Un contre-argument discuté'),
          aide('Absätze und Konnektoren: hinzu kommt, deshalb, unterm Strich', 'Des paragraphes et des connecteurs variés'),
          aide('Zum Schluss ein Rat an Smilla; im Forum ist „du“ möglich.', 'Pour finir, un conseil à Smilla ; le tutoiement est possible sur un forum.'),
        ],
        criteria: [
          { ...GRIDS.b2.schreiben[0], label: aide('Aufgabenerfüllung: klare Position, zwei begründete Argumente, ein Gegenargument, ein Rat an Smilla', 'Tâche : position, arguments, contre-argument et conseil') },
          ...GRIDS.b2.schreiben.slice(1),
        ],
      } },

    // 7 · Mission orale
    { id: 'b2-bildung-atelier-sprechen', kind: 'mission', title: 'Mission: das Bildungssystem des Herkunftslandes vorstellen', estimatedMinutes: 20,
      competences: ['expression-orale'],
      lesson: { description: `SITUATION
${aide('In Ihrem Deutschkurs stellen alle Teilnehmenden das Bildungssystem ihres Herkunftslandes vor. Sie halten ein Referat von drei bis vier Minuten.', 'Dans votre cours d’allemand, chacun présente le système éducatif de son pays d’origine. Vous faites un exposé de trois à quatre minutes.')}

INHALT
1. ${aide('Überblick: Schulpflicht, Schularten und wichtige Abschlüsse in Ihrem Herkunftsland', 'Vue d’ensemble : scolarité obligatoire, types d’écoles, diplômes importants')}
2. ${aide('Nach der Schule: Studium, Ausbildung oder direkt arbeiten? Was ist üblich?', 'Après l’école : études, formation ou travail ? Qu’est-ce qui est courant ?')}
3. ${aide('Vergleich mit Deutschland: zwei Unterschiede, zum Beispiel die duale Ausbildung oder den Zugang zum Studium', 'Comparaison avec l’Allemagne : deux différences, par exemple l’alternance ou l’accès aux études')}
4. ${aide('Ihre Erfahrung und Ihre Bewertung: Was finden Sie gut, was würden Sie ändern?', 'Votre expérience et votre jugement : qu’est-ce qui est bien, que changeriez-vous ?')}

VORBEREITUNG
${aide('Nehmen Sie sich acht Minuten Zeit. Überlegen Sie sich nur Stichwörter, keine ganzen Sätze. Kündigen Sie am Anfang den Aufbau an, wie im Modell.', 'Prenez huit minutes. Préparez seulement des mots-clés, pas de phrases entières. Annoncez votre plan au début, comme dans le modèle.')}` },
      mission: {
        oral: { prompt: aide('Halten Sie Ihr Referat frei und ohne abzulesen (drei bis vier Minuten). Nennen Sie das Thema, kündigen Sie den Aufbau an, sprechen Sie über die vier Punkte und schließen Sie mit einem kurzen Fazit.',
          'Faites votre exposé librement, sans lire (trois à quatre minutes). Annoncez le thème et le plan, traitez les quatre points et terminez par une courte conclusion.'),
          maxSeconds: 240 },
        written: null,
        checklist: [
          aide('Ich nenne das Thema und kündige den Aufbau an.', 'J’annonce le thème et le plan.'),
          aide('Ich beschreibe das System meines Landes mit konkreten Beispielen.', 'Je décris le système de mon pays avec des exemples concrets.'),
          aide('Ich nenne zwei Unterschiede zu Deutschland.', 'Je cite deux différences avec l’Allemagne.'),
          aide('Ich bewerte und schließe mit einem Fazit („Unterm Strich …“).', 'Je donne mon avis et je conclus.'),
          aide('Ich spreche frei, in ganzen Sätzen, mit Verbindungswörtern.', 'Je parle librement, en phrases complètes, avec des connecteurs.'),
        ],
        criteria: [
          { ...GRIDS.b2.sprechen[0], label: aide('Aufgabenerfüllung: Aufbau angekündigt, System beschrieben, zwei Unterschiede, Bewertung und Fazit in drei bis vier Minuten', 'Tâche : plan, description, comparaison, avis, en 3 à 4 min') },
          ...GRIDS.b2.sprechen.slice(1),
        ],
      } },

    // 8 · Bilan
    { id: 'b2-bildung-atelier-bilan', kind: 'lesson', title: 'Bilanz: Bildung', estimatedMinutes: 6,
      competences: ['lecture'],
      lesson: { description: `${aide('Lesen Sie die Ziele der beiden Module „Bildung“. Was können Sie schon gut? Was möchten Sie noch üben?', 'Relisez les objectifs des deux modules « Bildung ». Que savez-vous déjà bien faire ? Que voulez-vous encore travailler ?')}

ICH KANN …
• ${aide('Ich kann einen argumentativen Artikel verstehen und die Positionen der Personen und der Autorin unterscheiden.', 'Je peux comprendre un article argumentatif et distinguer les positions des personnes et de l’autrice.')}
• ${aide('Ich kann lange Nomengruppen und Nominalstil verstehen und in einfache Sätze umformen.', 'Je peux comprendre les longs groupes nominaux et le style nominal, et les reformuler simplement.')}
• ${aide('Ich kann in einem Forumsbeitrag Stellung nehmen, ein Gegenargument entkräften und einen Rat geben.', 'Je peux prendre position sur un forum, réfuter un contre-argument et donner un conseil.')}
• ${aide('Ich kann zwei Texte mit unterschiedlichen Positionen neutral zusammenfassen.', 'Je peux résumer de façon neutre deux textes aux positions différentes.')}
• ${aide('Ich kann in einem Referat ein Bildungssystem vorstellen und mit Deutschland vergleichen.', 'Je peux présenter un système éducatif dans un exposé et le comparer à celui de l’Allemagne.')}

STRATEGIEN
• ${aide('Lange Nomengruppen: vom Artikel zum Nomen springen, dann die Erweiterung lesen.', 'Longs groupes nominaux : passer de l’article au nom, puis lire les compléments.')}
• ${aide('Sätze einsetzen: auf Pronomen, Verweise und Signalwörter vor und nach der Lücke achten.', 'Phrases à replacer : observer les pronoms, les reprises et les mots signaux autour du trou.')}
• ${aide('Zusammenfassen: neutral bleiben, jede Position ihrer Quelle zuordnen, nicht wörtlich abschreiben.', 'Résumer : rester neutre, attribuer chaque position à sa source, ne pas recopier.')}

NOCH NICHT SICHER?
${aide('Partizipialattribut und Nominalstil: Wiederholen Sie „Regel“ und „Üben“ im Modul „Bildung“. Argumentieren: Lesen Sie noch einmal den Forumsbeitrag aus dem Modell und die Redemittel dieser Werkstatt.', 'Participe épithète et style nominal : reprenez la règle et les exercices du module « Bildung ». Argumentation : relisez la contribution modèle et les formules de cet atelier.')}` } },
  ],
};
