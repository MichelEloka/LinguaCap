// Module B1 n° 7 · thème « Arbeit » (lot R2). Comprendre une offre d'emploi et des conseils de préparation, réussir un
// premier contact téléphonique, demander poliment (Konjunktiv II de politesse) et poser des questions indirectes
// (Könnten Sie mir sagen, ob / wann …) ; n-Deklination dans le lexique (der Kollege, den Kollegen).
// Reprise réécrite du brouillon B1 V1 (content/b1-v1/source/partie1-suite.mjs › b1-arbeit) : annonce du centre de
// formation (document B), passation de poste (document A), entretien de Herr Demir, quiz et leçon « Konjunktiv ».
import { C, bi, choice, fill, order, match, dictation, speak } from '../../lib.mjs';

/** « Richtig / falsch / steht nicht im Text » : r, f ou n pour la bonne réponse. */
const rf = (id, statement, answer, explanation) => choice(id, `„${statement}“ ${C.richtigFalsch}`,
  [['richtig', answer === 'r'], ['falsch', answer === 'f'], ['steht nicht im Text', answer === 'n']], explanation);
/** Indices affichés sous les trous d'un fill (forme de base à transformer). */
const hints = (question, ...values) => ({ ...question,
  blanks: question.blanks.map((blank, index) => (values[index] ? { ...blank, hint: values[index] } : blank)) });

export default {
  id: 'b1-arbeit',
  title: 'Arbeit : comprendre une offre et préparer un entretien',
  objective: 'Comprendre une offre d’emploi et des conseils de préparation, présenter ses compétences avec un exemple et poser des questions polies au Konjunktiv II (Könnten Sie mir sagen, ob … ?).',
  grammarFocus: ['konjunktiv2-hoeflichkeit', 'indirekte-fragen'],
  sources: [
    'Textes, dialogues et exercices originaux LinguaCap.',
    'Situations reprises et réécrites du brouillon B1 V1 (LinguaCap) : annonce d’un centre de formation, passation de poste, entretien pour un poste d’accueil.',
  ],

  vocabulary: [
    { word: 'Stellenanzeige', article: 'die', plural: 'Stellenanzeigen', partOfSpeech: 'noun', translation: 'l’offre d’emploi',
      example: 'Ich habe die Stellenanzeige gestern im Internet gelesen.', note: null },
    { word: 'sich bewerben um', partOfSpeech: 'verb', translation: 'postuler à',
      example: 'Ich möchte mich um die Stelle am Empfang bewerben.', note: '+ accusatif · er bewirbt sich, hat sich beworben' },
    { word: 'Bewerbung', article: 'die', plural: 'Bewerbungen', partOfSpeech: 'noun', translation: 'la candidature',
      example: 'Schicken Sie Ihre Bewerbung bitte per E-Mail.', note: null },
    { word: 'Lebenslauf', article: 'der', plural: 'Lebensläufe', partOfSpeech: 'noun', translation: 'le CV',
      example: 'In meinem Lebenslauf stehen meine Ausbildung und meine Berufserfahrung.', note: null },
    { word: 'Zeugnis', article: 'das', plural: 'Zeugnisse', partOfSpeech: 'noun', translation: 'le certificat (de travail), le bulletin',
      example: 'Bringen Sie bitte Ihre Zeugnisse im Original mit.', note: 'das Arbeitszeugnis : l’attestation de l’employeur' },
    { word: 'Berufserfahrung', article: 'die', plural: null, partOfSpeech: 'noun', translation: 'l’expérience professionnelle',
      example: 'Für diese Stelle brauchen Sie keine Berufserfahrung.', note: 'sans pluriel' },
    { word: 'Kenntnisse', article: null, plural: null, partOfSpeech: 'noun', translation: 'les connaissances, les compétences',
      example: 'Gute Deutschkenntnisse sind für die Stelle wichtig.', note: 'toujours au pluriel dans ce sens · die Deutschkenntnisse' },
    { word: 'in Teilzeit / in Vollzeit', partOfSpeech: 'expression', translation: 'à temps partiel / à temps plein',
      example: 'Sie arbeitet in Teilzeit, zwanzig Stunden pro Woche.', note: null },
    { word: 'Probezeit', article: 'die', plural: 'Probezeiten', partOfSpeech: 'noun', translation: 'la période d’essai',
      example: 'Die Probezeit dauert drei Monate.', note: null },
    { word: 'Gehalt', article: 'das', plural: 'Gehälter', partOfSpeech: 'noun', translation: 'le salaire',
      example: 'Über das Gehalt sprechen wir im zweiten Gespräch.', note: null },
    { word: 'Vorstellungsgespräch', article: 'das', plural: 'Vorstellungsgespräche', partOfSpeech: 'noun', translation: 'l’entretien d’embauche',
      example: 'Das Vorstellungsgespräch findet am Donnerstag um vierzehn Uhr statt.', note: null },
    { word: 'Arbeitgeber', article: 'der', plural: 'Arbeitgeber', partOfSpeech: 'noun', translation: 'l’employeur',
      example: 'Mein letzter Arbeitgeber war ein Hotel in Lyon.', note: 'contraire : der Arbeitnehmer (le salarié)' },
    { word: 'Aufgabe', article: 'die', plural: 'Aufgaben', partOfSpeech: 'noun', translation: 'la tâche, la mission',
      example: 'Zu Ihren Aufgaben gehört die Anmeldung neuer Kursteilnehmer.', note: null },
    { word: 'Einarbeitung', article: 'die', plural: 'Einarbeitungen', partOfSpeech: 'noun', translation: 'la formation au poste, l’intégration',
      example: 'In der ersten Woche gibt es eine gründliche Einarbeitung.', note: null },
    { word: 'Kollege', article: 'der', plural: 'Kollegen', partOfSpeech: 'noun', translation: 'le collègue',
      example: 'Ich frage meinen Kollegen, wann die Besprechung beginnt.', note: 'n-Deklination : den, dem, des Kollegen' },
    { word: 'Praktikant', article: 'der', plural: 'Praktikanten', partOfSpeech: 'noun', translation: 'le stagiaire',
      example: 'Wir suchen einen Praktikanten für drei Monate.', note: 'n-Deklination : den, dem, des Praktikanten' },
    { word: 'zuverlässig', partOfSpeech: 'adjective', translation: 'fiable',
      example: 'Das Team sucht eine zuverlässige Kollegin.', note: null },
    { word: 'belastbar', partOfSpeech: 'adjective', translation: 'résistant au stress',
      example: 'Am Empfang muss man freundlich und belastbar sein.', note: null },
    { word: 'Erfahrung sammeln', partOfSpeech: 'expression', translation: 'acquérir de l’expérience',
      example: 'Im Hotel habe ich viel Erfahrung gesammelt.', note: null },
    { word: 'zuständig sein für', partOfSpeech: 'expression', translation: 'être responsable de, s’occuper de',
      example: 'Frau Brenner ist für die Bewerbungen zuständig.', note: '+ accusatif' },
    { word: 'vereinbaren', partOfSpeech: 'verb', translation: 'convenir de, fixer',
      example: 'Wir vereinbaren einen Termin für das Gespräch.', note: 'einen Termin vereinbaren' },
    { word: 'sich vorbereiten auf', partOfSpeech: 'verb', translation: 'se préparer à',
      example: 'Ich bereite mich gut auf das Gespräch vor.', note: '+ accusatif · séparable : vor|bereiten' },
    { word: 'Bescheid sagen', partOfSpeech: 'expression', translation: 'prévenir, informer',
      example: 'Wenn Sie später kommen, sagen Sie bitte kurz Bescheid.', note: 'jemandem (datif) Bescheid sagen' },
  ],

  media: [
    { key: 'b1-arbeit-lesen-anzeige', kind: 'image', title: 'Offre d’emploi du Bildungszentrum Nord',
      alt: 'Offre d’emploi : poste à l’accueil d’un centre de formation à Hanovre, à temps partiel (20 heures), début le 1er mai, candidature avant le 15 avril.',
      image: { layout: 'document', icon: 'briefcase', title: 'Mitarbeiter/in am Empfang (m/w/d)', subtitle: 'Bildungszentrum Nord · Hannover',
        meta: [['Arbeitszeit', 'Teilzeit, 20 Std./Woche'], ['Beginn', '1. Mai'], ['Bewerbung bis', '15. April']],
        lines: ['Kursteilnehmende begrüßen, Fragen beantworten, Anmeldungen eintragen', 'Zwei Abende pro Woche: das Haus schließen',
          'Erfahrung hilfreich, aber keine Voraussetzung', 'Einarbeitung · Monatsticket · Probezeit: 3 Monate'],
        footer: 'Bewerbung per E-Mail an Frau Brenner, Personalabteilung' } },
    { key: 'b1-arbeit-hoeren-audio', kind: 'audio', title: 'Un appel du service du personnel',
      script: [
        { voice: 'frau2', name: 'Frau Brenner', text: 'Guten Tag, hier spricht Sabine Brenner vom Bildungszentrum Nord. Spreche ich mit Herrn Haddad?' },
        { voice: 'mann', name: 'Karim Haddad', text: 'Ja, am Apparat. Guten Tag, Frau Brenner!' },
        { voice: 'frau2', name: 'Frau Brenner', text: 'Herr Haddad, vielen Dank für Ihre Bewerbung als Mitarbeiter am Empfang. Ihre Unterlagen haben uns gut gefallen, und wir würden Sie gern zu einem Vorstellungsgespräch einladen.' },
        { voice: 'mann', name: 'Karim Haddad', text: 'Oh, das freut mich sehr! Vielen Dank.' },
        { voice: 'frau2', name: 'Frau Brenner', text: 'Darf ich vorher kurz etwas fragen? In Ihrem Lebenslauf steht, dass Sie Französisch und Arabisch sprechen. Viele von unseren Teilnehmenden kommen aus Westafrika und aus Nordafrika. Das wäre für uns natürlich sehr praktisch.' },
        { voice: 'mann', name: 'Karim Haddad', text: 'Ja, Französisch ist meine Muttersprache, und Arabisch spreche ich mit meiner Familie. Im Hotel spreche ich außerdem jeden Tag Englisch.' },
        { voice: 'frau2', name: 'Frau Brenner', text: 'Wunderbar. Dann zum Termin: Hätten Sie am Donnerstag, dem vierundzwanzigsten April, Zeit? Wir könnten Ihnen zehn Uhr oder vierzehn Uhr anbieten.' },
        { voice: 'mann', name: 'Karim Haddad', text: 'Am Donnerstagvormittag arbeite ich leider noch im Hotel. Vierzehn Uhr wäre für mich ideal.' },
        { voice: 'frau2', name: 'Frau Brenner', text: 'Gut, dann notiere ich vierzehn Uhr. Das Gespräch dauert ungefähr fünfundvierzig Minuten. Sie sprechen mit mir und mit Herrn Yilmaz, unserem Teamleiter am Empfang.' },
        { voice: 'mann', name: 'Karim Haddad', text: 'Könnten Sie mir sagen, ob ich etwas mitbringen soll?' },
        { voice: 'frau2', name: 'Frau Brenner', text: 'Bringen Sie bitte Ihre Zeugnisse mit, und zwar im Original. Ihren Lebenslauf haben wir ja schon.' },
        { voice: 'mann', name: 'Karim Haddad', text: 'In Ordnung. Ich hätte noch eine Frage: Wissen Sie schon, an welchen Abenden ich arbeiten würde?' },
        { voice: 'frau2', name: 'Frau Brenner', text: 'Das planen wir jeden Monat neu im Team. Meistens sind es zwei Abende pro Woche. Darüber können wir im Gespräch genauer sprechen.' },
        { voice: 'mann', name: 'Karim Haddad', text: 'Sehr gut. Und könnten Sie mir noch sagen, wo das Gespräch genau stattfindet?' },
        { voice: 'frau2', name: 'Frau Brenner', text: 'Im Hauptgebäude in der Lindenallee zwölf, im zweiten Stock, Raum zweihundertvier. Melden Sie sich einfach am Empfang im Erdgeschoss, dann holen wir Sie dort ab.' },
        { voice: 'mann', name: 'Karim Haddad', text: 'Lindenallee zwölf, zweiter Stock. Wie komme ich am besten dorthin?' },
        { voice: 'frau2', name: 'Frau Brenner', text: 'Am besten mit der Straßenbahn, Linie vier, bis zur Haltestelle Marktplatz. Von dort sind es nur drei Minuten zu Fuß.' },
        { voice: 'mann', name: 'Karim Haddad', text: 'Vielen Dank, Frau Brenner. Dann bis Donnerstag um vierzehn Uhr.' },
        { voice: 'frau2', name: 'Frau Brenner', text: 'Ich schicke Ihnen heute noch eine Bestätigung per E-Mail. Falls etwas dazwischenkommt, rufen Sie mich bitte an. Auf Wiederhören, Herr Haddad!' },
        { voice: 'mann', name: 'Karim Haddad', text: 'Auf Wiederhören!' },
      ] },
    { key: 'b1-arbeit-kontrolle-audio', kind: 'audio', title: 'Un message vocal après l’entretien',
      script: [
        { voice: 'mann2', name: 'Herr Yilmaz', text: 'Guten Tag, Herr Haddad, hier ist Yilmaz vom Bildungszentrum Nord. Vielen Dank noch einmal für das angenehme Gespräch am Donnerstag. Ich habe eine gute Nachricht für Sie: Wir würden Sie gern bei uns einstellen.' },
        { voice: 'mann2', name: 'Herr Yilmaz', text: 'Könnten Sie mich bis Freitag zurückrufen? Dann besprechen wir die Einzelheiten zum Vertrag. Als ersten Arbeitstag hätten wir gern den zweiten Mai. Falls das für Sie nicht passt, finden wir bestimmt eine Lösung.' },
        { voice: 'mann2', name: 'Herr Yilmaz', text: 'Sie erreichen mich vormittags im Büro. Bis bald, auf Wiederhören!' },
      ] },
  ],

  activities: [
    // 1 · Mise en route
    { id: 'b1-arbeit-einstieg', kind: 'lesson', title: 'Mise en route : chercher un emploi', estimatedMinutes: 10,
      competences: ['lecture', 'expression-orale'],
      lesson: { description: `ARBEIT SUCHEN
[fr] Chercher un emploi
${bi('Eine Anzeige lesen, eine Bewerbung schreiben, ein Gespräch führen: Bei der Stellensuche brauchen Sie viel Deutsch.', 'Lire une annonce, écrire une candidature, passer un entretien : chercher un emploi demande beaucoup d’allemand.')}

FRAGEN ZUM EINSTIEG
[fr] Questions pour commencer
• ${bi('Was ist Ihr Beruf, oder als was möchten Sie gern arbeiten?', 'Quel est votre métier, ou quel travail aimeriez-vous faire ?')}
• ${bi('Wie haben Sie Ihre letzte Stelle gefunden: im Internet, durch Freunde oder anders?', 'Comment avez-vous trouvé votre dernier emploi : sur Internet, par des amis ou autrement ?')}
• ${bi('Was ist Ihnen bei der Arbeit am wichtigsten: das Gehalt, das Team oder die Arbeitszeiten?', 'Qu’est-ce qui compte le plus pour vous au travail : le salaire, l’équipe ou les horaires ?')}
${bi('Antworten Sie in Gedanken auf Deutsch, in zwei oder drei Sätzen.', 'Répondez mentalement en allemand, en deux ou trois phrases.')}

ZIELE
[fr] Objectifs
• ${bi('Ich kann eine Stellenanzeige und Tipps für das Vorstellungsgespräch verstehen.', 'Je peux comprendre une offre d’emploi et des conseils pour l’entretien d’embauche.')}
• ${bi('Ich kann meine Kenntnisse und Erfahrungen mit einem Beispiel präsentieren.', 'Je peux présenter mes compétences et mon expérience avec un exemple.')}
• ${bi('Ich kann höflich fragen: „Könnten Sie mir sagen, ob …?“', 'Je peux poser des questions polies : « Könnten Sie mir sagen, ob … ? »')}
• ${bi('Ich kann am Telefon einen Termin für ein Gespräch vereinbaren.', 'Je peux convenir d’un rendez-vous d’entretien au téléphone.')}

WICHTIGE WÖRTER
[fr] Mots-clés
• die Stellenanzeige — l’offre d’emploi
• sich bewerben um — postuler à
• der Lebenslauf — le CV
• die Berufserfahrung — l’expérience professionnelle
• in Teilzeit / in Vollzeit — à temps partiel / à temps plein
• die Probezeit — la période d’essai
• das Vorstellungsgespräch — l’entretien d’embauche
• der Kollege, den Kollegen — le collègue` } },

    // 2 · Lecture longue avec stratégie
    { id: 'b1-arbeit-lesen', kind: 'exercise', title: 'Comprendre : une offre d’emploi et des conseils pour l’entretien', estimatedMinutes: 20,
      competences: ['lecture'],
      lesson: { description: `${C.lesen}

STRATEGIE
[fr] Stratégie
1. ${bi('Global: Lesen Sie zuerst die Anzeige und die Überschrift des Artikels. Worum geht es?', 'Lecture globale : lisez d’abord l’annonce et le titre de l’article. De quoi s’agit-il ?')}
2. ${bi('Selektiv: Lesen Sie dann die Aufgaben. Suchen Sie im Text nur die passenden Sätze.', 'Lecture sélective : lisez ensuite les questions et cherchez seulement les phrases utiles.')}
3. ${bi('Detailliert: Lesen Sie diese Sätze genau. „Steht nicht im Text“ heißt: Der Text sagt dazu nichts.', 'Lecture détaillée : lisez ces phrases avec précision. « Steht nicht im Text » signifie que le texte n’en dit rien.')}

STELLENANZEIGE
[fr] L’offre d’emploi
Das Bildungszentrum Nord in Hannover sucht ab dem 1. Mai eine Mitarbeiterin oder einen Mitarbeiter am Empfang (m/w/d), in Teilzeit mit 20 Stunden pro Woche.
Ihre Aufgaben
Sie begrüßen unsere Kursteilnehmenden, beantworten Fragen zum Kursprogramm am Telefon und per E-Mail und tragen neue Anmeldungen ins System ein. An zwei Abenden pro Woche schließen Sie das Haus zusammen mit einer Kollegin oder einem Kollegen.
Ihr Profil
Sie sind freundlich und zuverlässig und bleiben ruhig, auch wenn viele Menschen gleichzeitig etwas von Ihnen wollen. Erfahrung am Empfang ist hilfreich, aber keine Voraussetzung. Sie sprechen gut Deutsch, weitere Sprachen sind ein Plus.
Wir bieten
Eine gründliche Einarbeitung, ein freundliches Team und ein Monatsticket für Bus und Bahn. Die Probezeit dauert drei Monate.
Bewerbung
Ihre Bewerbung mit Lebenslauf und Zeugnissen schicken Sie bitte bis zum 15. April per E-Mail an Frau Brenner aus der Personalabteilung.

SO BEREITEN SIE SICH AUF DAS VORSTELLUNGSGESPRÄCH VOR
[fr] Article : comment se préparer à un entretien d’embauche
Eine Einladung zum Vorstellungsgespräch macht viele Menschen nervös. Doch wer sich gut vorbereitet, fühlt sich sicherer.
(A) Informieren Sie sich vorher über den Arbeitgeber: Was bietet die Firma an? Wer sind ihre Kunden? Die Antworten finden Sie meistens auf der Internetseite. Nehmen Sie sich auch die Stellenanzeige noch einmal vor und überlegen Sie, welche Aufgaben am wichtigsten sind.
(B) Fast alle Bewerber sagen, dass sie teamfähig und zuverlässig sind. Das allein überzeugt aber niemanden. Besser ist ein kurzes Beispiel aus Ihrem Leben: Wann haben Sie im Team ein Problem gelöst? Wann mussten Sie mehrere Aufgaben gleichzeitig organisieren? Beschreiben Sie die Situation in drei Schritten: Was war das Problem, was haben Sie getan, und was war das Ergebnis?
(C) Am Ende hört man oft die Frage: „Haben Sie noch Fragen an uns?“ Antworten Sie dann nicht einfach mit „Nein, danke“. Bereiten Sie zwei oder drei Fragen vor, zum Beispiel zur Einarbeitung oder zum Team, und formulieren Sie sie höflich: „Könnten Sie mir sagen, wie die Einarbeitung organisiert ist?“ klingt besser als „Wie ist die Einarbeitung?“. Nach dem Gehalt fragen Sie am besten erst, wenn der Arbeitgeber das Thema selbst anspricht.
(D) Planen Sie Ihren Weg am Tag vorher und rechnen Sie mit Verspätungen bei Bus und Bahn. Wer zehn Minuten zu früh kommt, hat Zeit, sich zu beruhigen. Nehmen Sie eine Kopie Ihrer Bewerbung mit. Und wenn Sie doch einmal zu spät kommen: Rufen Sie sofort an und sagen Sie Bescheid. Auch das zeigt, dass Sie zuverlässig sind.` },
      placements: [{ media: 'b1-arbeit-lesen-anzeige', caption: 'Stellenanzeige' }],
      questions: [
        choice('q1', bi('Was ist das Ziel des Artikels?', 'Quel est le but de l’article ?'),
          [['Er erklärt Schritt für Schritt, wie man ein Anschreiben formuliert.'],
            ['Er gibt Tipps, wie man sich auf ein Vorstellungsgespräch vorbereitet.', true],
            ['Er beschreibt, wie ein Arbeitstag am Empfang eines Bildungszentrums aussieht.']],
          'Le titre « So bereiten Sie sich auf das Vorstellungsgespräch vor » annonce des conseils de préparation, et chaque paragraphe en donne un. Le texte ne parle pas de la rédaction d’une lettre : il conseille seulement d’apporter une copie de sa candidature.'),
        choice('q2', bi('Wen sucht das Bildungszentrum?', 'Qui le centre de formation cherche-t-il ?'),
          [['Eine Person für 20 Stunden pro Woche am Empfang.', true], ['Eine Lehrerin oder einen Lehrer für die Abendkurse.'],
            ['Eine neue Leitung für das Team am Empfang.']],
          'L’annonce cherche « eine Mitarbeiterin oder einen Mitarbeiter am Empfang (m/w/d), in Teilzeit mit 20 Stunden pro Woche ». Les soirées sont mentionnées, mais pour fermer le bâtiment, pas pour enseigner. La mention m/w/d (homme, femme, divers) figure dans toutes les offres allemandes.'),
        rf('q3', 'Für die Stelle braucht man unbedingt Erfahrung am Empfang.', 'f',
          'Faux : « Erfahrung am Empfang ist hilfreich, aber keine Voraussetzung. » L’expérience est un plus (hilfreich), pas une condition (die Voraussetzung).'),
        rf('q4', 'Die neue Mitarbeiterin oder der neue Mitarbeiter arbeitet auch an manchen Abenden.', 'r',
          'Vrai : « An zwei Abenden pro Woche schließen Sie das Haus. » « An manchen Abenden » (certains soirs) reformule « an zwei Abenden pro Woche ».'),
        rf('q5', 'Im Team am Empfang arbeiten fünf Personen.', 'n',
          'Non mentionné : l’annonce parle d’« ein freundliches Team » et d’une collègue ou d’un collègue le soir, mais ne donne jamais le nombre de personnes. Ne déduisez rien : seul ce qui est écrit compte.'),
        rf('q6', 'Laut Artikel fragt man im Gespräch am besten zuerst nach dem Gehalt.', 'f',
          'Faux : « Nach dem Gehalt fragen Sie am besten erst, wenn der Arbeitgeber das Thema selbst anspricht. » « Erst » signifie ici « seulement à ce moment-là », pas « d’abord ». Le texte conseille plutôt des questions sur l’intégration ou l’équipe.'),
        match('q7', bi('Welche Überschrift passt zu welchem Absatz? Ordnen Sie zu.', 'Quel intertitre convient à quel paragraphe ? Associez.'),
          [['Absatz A', 'Den Arbeitgeber kennenlernen'], ['Absatz B', 'Beispiele statt schöner Wörter'], ['Absatz C', 'Selbst Fragen stellen'],
            ['Absatz D', 'Pünktlich und gut organisiert']],
          'A : s’informer sur l’entreprise (Internetseite, Kunden). B : un exemple vécu vaut mieux que des adjectifs (« Das allein überzeugt aber niemanden »). C : préparer ses propres questions. D : le trajet, l’avance de dix minutes et que faire en cas de retard.'),
        fill('q8', bi('Welches Wort aus dem Text passt? Ergänzen Sie.', 'Quel mot du texte convient ? Complétez.'),
          'Absatz A: Die Firma, bei der Sie arbeiten möchten, ist Ihr zukünftiger [[1]]. Absatz D: Wenn Sie zu spät kommen, rufen Sie an und sagen [[2]].',
          [['Arbeitgeber'], ['Bescheid']],
          '« Der Arbeitgeber » : celui qui donne le travail, l’employeur (le salarié est « der Arbeitnehmer »). « Bescheid sagen » : prévenir quelqu’un ; c’est une expression figée, « Bescheid » ne prend jamais d’article ici.'),
      ] },

    // 3 · Écoute longue : l'appel du service du personnel
    { id: 'b1-arbeit-hoeren', kind: 'exercise', title: 'Comprendre : une invitation à un entretien', estimatedMinutes: 18,
      competences: ['ecoute'],
      lesson: { description: `${C.hoeren}

SITUATION
[fr] La situation
${bi('Karim Haddad hat sich beim Bildungszentrum Nord beworben. Jetzt ruft ihn Frau Brenner aus der Personalabteilung an.', 'Karim Haddad a postulé au Bildungszentrum Nord. Mme Brenner, du service du personnel, l’appelle.')}

STRATEGIE
[fr] Stratégie
1. ${bi('Beim ersten Hören: Wer spricht? Warum ruft Frau Brenner an?', 'Première écoute : qui parle ? Pourquoi Mme Brenner appelle-t-elle ?')}
2. ${bi('Lesen Sie dann die Notizen. Was fehlt: eine Uhrzeit, ein Ort, eine Zahl?', 'Lisez ensuite les notes. Que manque-t-il : une heure, un lieu, un nombre ?')}
3. ${bi('Beim zweiten Hören: Ergänzen Sie die Notizen nur mit Stichwörtern, nicht mit ganzen Sätzen.', 'Deuxième écoute : complétez les notes avec des mots-clés seulement, pas avec des phrases entières.')}` },
      placements: [{ media: 'b1-arbeit-hoeren-audio', caption: 'Frau Brenner ruft Karim Haddad an' }],
      questions: [
        fill('q1', C.notizen,
          'Vorstellungsgespräch: Donnerstag, 24. April, um [[1]] Uhr · Dauer: etwa [[2]] Minuten · mitbringen: [[3]] im Original · Ort: Lindenallee 12, [[4]] Stock, Raum 204 · Anfahrt: Straßenbahn, Linie [[5]]',
          [['14', 'vierzehn'], ['45', 'fünfundvierzig'], ['Zeugnisse', 'die Zeugnisse', 'seine Zeugnisse', 'meine Zeugnisse', 'Ihre Zeugnisse', 'ihre Zeugnisse'],
            ['2.', 'zweiter', 'zweiten', 'zwei'], ['4', 'vier']],
          '14 Uhr : Karim refuse 10 heures parce qu’il travaille le matin. Durée : « ungefähr fünfundvierzig Minuten ». À apporter : « Ihre Zeugnisse … im Original » ; le CV, ils l’ont déjà. Lieu : « im zweiten Stock » (2. Stock dans des notes). Tram : « Linie vier ».'),
        choice('q2', bi('Warum passt Karim der Termin um zehn Uhr nicht?', 'Pourquoi le rendez-vous de dix heures ne convient-il pas à Karim ?'),
          [['Er hat am Vormittag einen Termin beim Arzt.'], ['Er arbeitet am Donnerstagvormittag noch im Hotel.', true],
            ['Er muss am Vormittag seine Kinder in die Schule bringen.']],
          '« Am Donnerstagvormittag arbeite ich leider noch im Hotel. » Il propose donc l’autre horaire : « Vierzehn Uhr wäre für mich ideal. » Ni médecin ni enfants ne sont mentionnés.'),
        choice('q3', bi('Mit wem spricht Karim im Vorstellungsgespräch?', 'Avec qui Karim parlera-t-il pendant l’entretien ?'),
          [['Mit Frau Brenner und mit dem Teamleiter am Empfang.', true], ['Nur mit Frau Brenner aus der Personalabteilung.'],
            ['Mit allen Kolleginnen und Kollegen vom Empfang.']],
          '« Sie sprechen mit mir und mit Herrn Yilmaz, unserem Teamleiter am Empfang. » Ils seront donc deux : Mme Brenner et M. Yilmaz.'),
        choice('q4', bi('Was sagt Frau Brenner über die Abende?', 'Que dit Mme Brenner au sujet des soirées ?'),
          [['Karim arbeitet immer montags und donnerstags.'], ['Karim kann die Abende jede Woche selbst wählen.'],
            ['Das Team plant die Abende jeden Monat neu.', true]],
          '« Das planen wir jeden Monat neu im Team. Meistens sind es zwei Abende pro Woche. » Aucun jour fixe n’est donné, et ce n’est pas Karim seul qui choisit : l’équipe planifie.'),
        choice('q5', bi('Was macht Frau Brenner nach dem Telefonat?', 'Que fait Mme Brenner après l’appel ?'),
          [['Sie schickt Karim eine Bestätigung per E-Mail.', true], ['Sie ruft Herrn Yilmaz an und fragt nach einem Raum.'],
            ['Sie schickt Karim eine Kopie von seinem Lebenslauf.']],
          '« Ich schicke Ihnen heute noch eine Bestätigung per E-Mail. » Le CV est déjà chez eux (« Ihren Lebenslauf haben wir ja schon ») : personne ne le renvoie.'),
      ] },

    // 4 · Grammaire inductive
    { id: 'b1-arbeit-entdecken', kind: 'exercise', title: 'Découvrir : demander poliment', estimatedMinutes: 10,
      competences: ['lecture'],
      lesson: { description: `${bi('Lesen Sie die Sätze aus dem Telefongespräch und aus dem Artikel. Achten Sie auf die Verben.', 'Lisez ces phrases de l’appel et de l’article. Observez les verbes.')}

SÄTZE
[fr] Le corpus
(1) Wir würden Sie gern zu einem Vorstellungsgespräch einladen.
(2) Hätten Sie am Donnerstag Zeit?
(3) Vierzehn Uhr wäre für mich ideal.
(4) Könnten Sie mir sagen, ob ich etwas mitbringen soll?
(5) Wissen Sie schon, an welchen Abenden ich arbeiten würde?
(6) Könnten Sie mir noch sagen, wo das Gespräch genau stattfindet?
(7) „Könnten Sie mir sagen, wie die Einarbeitung organisiert ist?“ klingt besser als „Wie ist die Einarbeitung?“

${bi('Beantworten Sie dann die Fragen. Die Erklärungen formulieren die Regel.', 'Répondez ensuite aux questions. Les explications formulent la règle.')}` },
      questions: [
        choice('q1', bi('Sätze 1 bis 3: Warum sagen Frau Brenner und Karim „würden“, „hätten“ und „wäre“?', 'Phrases 1 à 3 : pourquoi Mme Brenner et Karim disent-ils « würden », « hätten » et « wäre » ?'),
          [['pour parler poliment, avec un peu de distance', true], ['pour parler d’une action terminée dans le passé'], ['pour donner un ordre clair et direct']],
          'Würden, hätten, wäre et könnten sont des formes du Konjunktiv II, l’équivalent du conditionnel de politesse français : « nous aimerions vous inviter », « auriez-vous le temps ? », « ce serait idéal ». Elles adoucissent la demande. Le passé se dirait au Perfekt (hat eingeladen) ou au Präteritum (hatte, war).'),
        choice('q2', bi('Satz 4: Wo steht das Verb „soll“?', 'Phrase 4 : où se trouve le verbe « soll » ?'),
          [['juste après « ob »'], ['en tête, comme dans la question directe « Soll ich … ? »'], ['à la fin de la proposition introduite par « ob »', true]],
          'Après « Könnten Sie mir sagen, … », la question devient une subordonnée : le verbe conjugué « soll » passe à la fin (…, ob ich etwas mitbringen soll). La question directe serait « Soll ich etwas mitbringen? », avec le verbe en tête.'),
        match('q3', bi('Welche indirekte Frage gehört zu welcher direkten Frage? Ordnen Sie zu.', 'Associez chaque question directe à sa question indirecte.'),
          [['Soll ich etwas mitbringen?', '…, ob ich etwas mitbringen soll.'], ['Wo findet das Gespräch statt?', '…, wo das Gespräch stattfindet.'],
            ['Wie ist die Einarbeitung organisiert?', '…, wie die Einarbeitung organisiert ist.'], ['An welchen Abenden arbeite ich?', '…, an welchen Abenden ich arbeite.']],
          'Dans la question indirecte, le verbe conjugué va toujours à la fin : soll, stattfindet, ist, arbeite. Le verbe à particule se ressoude (findet … statt → stattfindet). Le mot interrogatif (wo, wie, an welchen Abenden) reste en tête de la subordonnée.'),
        choice('q4', bi('Sätze 4 und 6: Wann beginnt die indirekte Frage mit „ob“?', 'Phrases 4 et 6 : quand la question indirecte commence-t-elle par « ob » ?'),
          [['quand la question directe commence par un mot interrogatif (wo, wann, wie…)'], ['quand la question directe se répond par oui ou par non', true],
            ['dans toutes les questions indirectes polies']],
          '« Soll ich etwas mitbringen? » se répond par ja ou nein : la question indirecte commence par ob (= si). « Wo findet das Gespräch statt? » commence par wo : on garde wo, sans ob (phrase 6).'),
      ] },

    // 5 · Règle
    { id: 'b1-arbeit-regel', kind: 'lesson', title: 'À retenir : Konjunktiv II de politesse et question indirecte', estimatedMinutes: 10,
      competences: ['lecture'],
      lesson: { description: `À RETENIR — DEMANDER POLIMENT : LE KONJUNKTIV II
Pour demander, proposer ou exprimer un souhait avec politesse, l’allemand emploie le Konjunktiv II, comme le conditionnel français (« pourriez-vous… », « j’aimerais… »). On l’entend sans cesse au travail, au téléphone et dans les démarches.

LES FORMES À CONNAÎTRE
• ich hätte, Sie hätten — j’aurais, vous auriez (haben)
• ich wäre, Sie wären — je serais, vous seriez (sein)
• ich könnte, Sie könnten — je pourrais, vous pourriez (können)
• ich würde, Sie würden + infinitif — je ferais, vous feriez… (presque tous les autres verbes)
• ich möchte — je voudrais (forme polie de mögen, déjà au Konjunktiv)

EXEMPLES
• Könnten Sie mir bitte helfen? — Pourriez-vous m’aider, s’il vous plaît ?
• Ich hätte gern einen Termin am Nachmittag. — J’aimerais un rendez-vous l’après-midi.
• Würden Sie mich bitte zurückrufen? — Pourriez-vous me rappeler ?
• Vierzehn Uhr wäre für mich ideal. — Quatorze heures serait idéal pour moi.

À RETENIR — LA QUESTION INDIRECTE
Une question devient plus polie quand on l’introduit par une formule : Könnten Sie mir sagen, … ? · Wissen Sie, … ? · Ich möchte wissen, … · Ich würde gern wissen, … La question devient alors une subordonnée : le verbe conjugué va à la fin.
• Question fermée (réponse oui ou non) : ob. Soll ich etwas mitbringen? → Könnten Sie mir sagen, ob ich etwas mitbringen soll?
• Question ouverte : le mot interrogatif reste. Wann beginnt das Gespräch? → Wissen Sie, wann das Gespräch beginnt?
• Verbe à particule : il se ressoude à la fin. Wo findet das Gespräch statt? → …, wo das Gespräch stattfindet.
• Ponctuation : virgule avant ob ou le mot interrogatif ; point d’interrogation seulement si la phrase entière est une question (Könnten Sie mir sagen, …?), sinon un point (Ich möchte wissen, wann das Gespräch beginnt.).

LA N-DEKLINATION
Quelques noms masculins, souvent des personnes, prennent -n ou -en à tous les cas sauf au nominatif singulier : der Kollege → den, dem, des Kollegen ; der Praktikant → den Praktikanten ; der Kunde → den Kunden ; der Herr → Herrn Yilmaz.

ATTENTION — LES PIÈGES DES FRANCOPHONES
• « Si » se dit ob dans une question indirecte (Ich weiß nicht, ob die Stelle noch frei ist) et wenn dans une condition (Wenn ich Zeit habe, komme ich).
• Pas d’inversion après ob ou un mot interrogatif : « …, ob ich soll etwas mitbringen » est faux.
• Ich möchte est déjà une forme polie : « ich würde möchten » n’existe pas.
• Ne confondez pas Sie könnten (vous pourriez, poli) et Sie können (vous pouvez, simple constat).` } },

    // 6 · Grammaire : s'entraîner
    { id: 'b1-arbeit-grammatik', kind: 'exercise', title: 'S’entraîner : Konjunktiv II et questions indirectes', estimatedMinutes: 14,
      competences: ['lecture', 'expression-ecrite'],
      lesson: { description: `${bi('Üben Sie die höflichen Formen und die indirekte Frage.', 'Entraînez-vous aux formes polies et à la question indirecte.')}

MERKE
[fr] À retenir
• hätte, wäre, könnte, würde + infinitif : demander poliment.
• Könnten Sie mir sagen, ob / wann / wo … + verbe à la fin.` },
      questions: [
        hints(fill('q1', bi('Ergänzen Sie die höfliche Form.', 'Complétez avec la forme polie.'),
          '[[1]] Sie mir bitte die Adresse schicken? · Ich [[2]] gern noch eine Frage. · Vierzehn Uhr [[3]] für mich besser.',
          [['Könnten'], ['hätte'], ['wäre']],
          'Können → Sie könnten (avec Umlaut) ; haben → ich hätte ; sein → wäre. Ces formes de Konjunktiv II rendent la demande polie, comme « pourriez-vous », « j’aurais », « serait ». Sans Umlaut (konnten, hatte, war), ce serait le prétérit, donc du passé.'),
        'können', 'haben', 'sein'),
        hints(fill('q2', bi('Ergänzen Sie mit „würde“ in der richtigen Form.', 'Complétez avec « würde » à la bonne forme.'),
          'Wir [[1]] Sie gern zu einem Gespräch einladen. · [[2]] du mir bitte kurz helfen? · Ich [[3]] gern am Montag anfangen.',
          [['würden'], ['Würdest'], ['würde']],
          'Würde se conjugue comme un prétérit : ich würde, du würdest, er/sie würde, wir würden, Sie würden. L’infinitif (einladen, helfen, anfangen) va à la fin de la phrase.'),
        'werden', 'werden', 'werden'),
        order('q3', C.ordnen, [['Könnten', 'Sie', 'mir', 'sagen,', 'wann', 'das Gespräch', 'beginnt?']],
          'La formule polie « Könnten Sie mir sagen » ouvre la phrase. Puis vient la question indirecte : wann + sujet (das Gespräch) + verbe conjugué à la fin (beginnt).'),
        order('q4', C.ordnen, [['Ich', 'möchte', 'wissen,', 'ob', 'ich', 'am Samstag', 'arbeiten', 'muss.']],
          'Question fermée (« Muss ich am Samstag arbeiten? ») → ob. Dans la subordonnée, le verbe conjugué « muss » se place tout à la fin, après l’infinitif « arbeiten ». La phrase se termine par un point : c’est une affirmation (Ich möchte wissen).'),
        order('q5', C.ordnen, [['Wissen', 'Sie,', 'wann', 'die Einarbeitung', 'anfängt?']],
          'Le verbe à particule « fängt … an » se ressoude à la fin de la subordonnée : …, wann die Einarbeitung anfängt.'),
        choice('q6', bi('Welche indirekte Frage ist richtig?', 'Quelle question indirecte est correcte ?'),
          [['Können Sie mir sagen, ob gibt es einen Parkplatz?'], ['Können Sie mir sagen, ob es einen Parkplatz gibt?', true],
            ['Können Sie mir sagen, es gibt einen Parkplatz?']],
          'Après ob, le verbe conjugué va à la fin : …, ob es einen Parkplatz gibt. La première phrase garde l’ordre de la question directe (erreur fréquente), la troisième oublie ob.'),
        choice('q7', bi('Welches Wort passt? „Ich weiß nicht, … die Stelle noch frei ist.“', 'Quel mot convient ?'),
          [['wenn'], ['ob', true], ['weil']],
          '« Je ne sais pas si le poste est encore libre » : c’est une question indirecte fermée, donc ob. Wenn traduit « si » seulement dans une condition (Wenn die Stelle frei ist, bewerbe ich mich). Weil (parce que) n’a pas de sens ici.'),
        match('q8', bi('Was ist höflicher? Ordnen Sie zu.', 'Quelle forme est plus polie ? Associez.'),
          [['Ich will einen Termin.', 'Ich hätte gern einen Termin.'], ['Rufen Sie mich zurück!', 'Würden Sie mich bitte zurückrufen?'],
            ['Ist Montag okay?', 'Wäre Montag für Sie möglich?'], ['Wann fängt der Kurs an?', 'Könnten Sie mir sagen, wann der Kurs anfängt?']],
          'Ich will → ich hätte gern ; l’impératif → Würden Sie bitte … ? ; ist → wäre ; question directe → question indirecte avec « Könnten Sie mir sagen ». Au travail et au téléphone, ces formes sont attendues avec des inconnus.'),
        hints(fill('q9', bi('Ergänzen Sie die richtige Form (n-Deklination).', 'Complétez avec la bonne forme (n-Deklination).'),
          'Ich frage meinen [[1]]. · Wir suchen einen [[2]] für drei Monate. · Ich spreche gleich mit dem [[3]].',
          [['Kollegen'], ['Praktikanten'], ['Kunden']],
          'Kollege, Praktikant et Kunde suivent la n-Deklination : -n ou -en à l’accusatif (meinen Kollegen, einen Praktikanten) et au datif (mit dem Kunden). Seul le nominatif singulier garde la forme courte : der Kollege, der Praktikant, der Kunde.'),
        'der Kollege', 'der Praktikant', 'der Kunde'),
        choice('q10', bi('Sie sind im Vorstellungsgespräch. Welche Frage ist richtig und höflich?', 'Vous êtes en entretien. Quelle question est correcte et polie ?'),
          [['Könnten Sie mir sagen, wie sind die Arbeitszeiten geregelt?'], ['Können Sie mir sagen, wie die Arbeitszeiten geregelt sein?'],
            ['Könnten Sie mir sagen, wie die Arbeitszeiten geregelt sind?', true]],
          'Formule polie (Könnten Sie mir sagen) et question indirecte : le verbe conjugué « sind » va à la fin. La première phrase garde l’ordre de la question directe ; la deuxième met l’infinitif « sein » à la place du verbe conjugué.'),
      ] },

    // 7 · Lexique
    { id: 'b1-arbeit-wortschatz', kind: 'exercise', title: 'S’exercer : le vocabulaire de la candidature', estimatedMinutes: 12,
      competences: ['lecture', 'expression-ecrite'],
      lesson: { description: `${bi('Lernen Sie Wörter zusammen: Nomen mit Verb, Wortfamilien und feste Formulierungen.', 'Apprenez les mots ensemble : nom et verbe, familles de mots et formules toutes faites.')}

ASTUCE
Apprenez chaque nom avec son verbe, car ils ne se traduisent pas mot à mot. En français, on « prend » rendez-vous ; en allemand, on en convient ensemble : einen Termin vereinbaren. On « acquiert » de l’expérience ; l’allemand la « rassemble » : Erfahrung sammeln.` },
      questions: [
        match('q1', bi('Welches Verb passt? Ordnen Sie zu.', 'Quel verbe convient ? Associez.'),
          [['Erfahrung', 'sammeln'], ['einen Termin', 'vereinbaren'], ['ein Gespräch', 'führen'], ['Bescheid', 'sagen'], ['eine Frage', 'stellen']],
          'Erfahrung sammeln (acquérir de l’expérience), einen Termin vereinbaren (fixer un rendez-vous), ein Gespräch führen (mener un entretien), Bescheid sagen (prévenir), eine Frage stellen (poser une question). Ces associations se retiennent en bloc.'),
        fill('q2', bi('Bilden Sie das Nomen auf -ung.', 'Formez le nom en -ung.'),
          'bewerben → die [[1]] · erfahren → die [[2]] · vorbereiten → die [[3]] · einarbeiten → die [[4]]',
          [['Bewerbung'], ['Erfahrung'], ['Vorbereitung'], ['Einarbeitung']],
          'Le suffixe -ung forme un nom à partir du radical du verbe : bewerb- → die Bewerbung. Tous ces noms sont féminins (die) et prennent -en au pluriel (die Bewerbungen). La particule reste devant : vor|bereiten → die Vorbereitung.'),
        fill('q3', bi('Ergänzen Sie das Wort mit „Arbeit“.', 'Complétez avec un mot formé sur « Arbeit ».'),
          'Der Arbeitgeber gibt die Arbeit, der [[1]] nimmt sie: Er ist angestellt. · Die Zeit, in der man arbeitet, heißt die [[2]].',
          [['Arbeitnehmer'], ['Arbeitszeit']],
          'Der Arbeitgeber (celui qui donne le travail) s’oppose à der Arbeitnehmer (le salarié, celui qui le prend). Die Arbeitszeit prend un -s- de liaison (Fugen-s) entre Arbeit et Zeit, comme die Arbeitsstelle.'),
        choice('q4', bi('Sie möchten im Gespräch ein Beispiel geben. Was sagen Sie?', 'Vous voulez donner un exemple pendant l’entretien. Que dites-vous ?'),
          [['Zum Beispiel ich habe im Hotel zwei Gruppen gleichzeitig betreut.'], ['Im Gegenteil habe ich im Hotel zwei Gruppen gleichzeitig betreut.'],
            ['Zum Beispiel habe ich im Hotel zwei Gruppen gleichzeitig betreut.', true]],
          '« Zum Beispiel » annonce un exemple ; comme il occupe la première place, le verbe suit directement : Zum Beispiel habe ich … La première phrase garde l’ordre français (sujet avant le verbe) ; « im Gegenteil » (au contraire) introduit une opposition qui n’a pas de sens ici.'),
        choice('q5', bi('Sie haben eine Frage nicht verstanden. Was sagen Sie höflich?', 'Vous n’avez pas compris une question. Que dites-vous poliment ?'),
          [['Entschuldigung, könnten Sie die Frage bitte wiederholen?', true], ['Entschuldigung, könntest du die Frage bitte wiederholen?'],
            ['Entschuldigung, könnten Sie die Frage bitte wiederholt?']],
          'Entschuldigung + Könnten Sie … bitte … ? + infinitif à la fin : c’est la formule polie pour faire répéter. En entretien, on vouvoie (Sie, pas du) ; et après könnten, il faut l’infinitif « wiederholen », pas le participe « wiederholt ».'),
        choice('q6', bi('Welche Grußformel passt am Ende einer Bewerbung?', 'Quelle formule de salutation convient à la fin d’une candidature ?'),
          [['Liebe Grüße und bis bald'], ['Mit freundlichen Grüßen', true], ['Tschüss und schönen Tag']],
          '« Mit freundlichen Grüßen » est la formule finale standard d’une lettre ou d’un courriel formel (Sie). « Liebe Grüße » et « Tschüss » conviennent seulement à des amis ou à des collègues proches (du).'),
        match('q7', bi('Was bedeuten die Adjektive? Ordnen Sie zu.', 'Que signifient ces adjectifs ? Associez.'),
          [['zuverlässig', 'Man kann sich auf diese Person verlassen.'], ['belastbar', 'Die Person bleibt auch bei viel Arbeit ruhig.'],
            ['teamfähig', 'Die Person arbeitet gut mit anderen zusammen.'], ['pünktlich', 'Die Person kommt immer zur richtigen Zeit.']],
          'Ces adjectifs reviennent dans presque toutes les offres. Zuverlässig : fiable ; belastbar : résistant au stress ; teamfähig : qui sait travailler en équipe ; pünktlich : ponctuel. Au lieu de simplement les citer, illustrez-les par un exemple (article, paragraphe B).'),
      ] },

    // 8 · Redemittel à voix haute
    { id: 'b1-arbeit-redemittel', kind: 'exercise', title: 'Répéter à voix haute : se présenter en entretien', estimatedMinutes: 9,
      competences: ['expression-orale'],
      lesson: { description: `${C.sprechen}

${bi('Diese Sätze brauchen Sie im Vorstellungsgespräch. Hören Sie jeden Satz, sprechen Sie ihn dann laut nach.', 'Ces phrases vous serviront en entretien. Écoutez chaque phrase, puis répétez-la à voix haute.')}
TIPP
[fr] Conseil
${bi('Sprechen Sie langsam und deutlich. Betonen Sie das wichtigste Wort im Satz.', 'Parlez lentement et distinctement. Accentuez le mot le plus important de la phrase.')}` },
      questions: [
        speak('q1', 'Könnten Sie mir sagen, wann die Einarbeitung beginnt?',
          'Question indirecte polie : « Könnten » s’ouvre sur un ö arrondi (lèvres en avant), et le verbe « beginnt » ferme la phrase. Accentuez EIN- dans Einarbeitung.'),
        speak('q2', 'Ich habe drei Jahre in einem Hotel am Empfang gearbeitet.',
          'Présenter son expérience au Perfekt : « habe … gearbeitet », le participe à la fin. Dans « Empfang », l’accent tombe sur -FANG (emp-FANG) ; le p s’entend à peine.',
          ['Ich habe drei Jahre in einem Hotel am Empfang gearbeitet.', 'Ich habe 3 Jahre in einem Hotel am Empfang gearbeitet.']),
        speak('q3', 'Ich hätte noch eine Frage zu den Arbeitszeiten.',
          'Formule pour annoncer sa question à la fin de l’entretien. « Hätte » : ä ouvert comme dans « mère », t bref. Arbeitszeiten : accent sur AR-.'),
        speak('q4', 'Zum Beispiel habe ich einmal zwei Gruppen gleichzeitig betreut.',
          'Après « Zum Beispiel », le verbe « habe » vient tout de suite. « Gleichzeitig » : accent sur GLEICH- ; le z de -zeitig se prononce « ts ».',
          ['Zum Beispiel habe ich einmal zwei Gruppen gleichzeitig betreut.', 'Zum Beispiel habe ich einmal 2 Gruppen gleichzeitig betreut.']),
        speak('q5', 'Vierzehn Uhr wäre für mich ideal.',
          'Accepter un horaire poliment. « Wäre » : ä long et ouvert. Dans « ideal », l’accent tombe sur la dernière syllabe : i-de-AL.',
          ['Vierzehn Uhr wäre für mich ideal.', '14 Uhr wäre für mich ideal.']),
        speak('q6', 'Die Stelle interessiert mich, weil ich gern mit Menschen arbeite.',
          'Motiver sa candidature : après « weil », le verbe « arbeite » va à la fin. « Interessiert » : accent sur -SIERT ; le double s se prononce [s] sourd, comme dans « tasse ».'),
      ] },

    // 9 · Second document (thème pair : lecture) avec dictées
    { id: 'b1-arbeit-lesen2', kind: 'exercise', title: 'Comprendre : une passation avant les vacances', estimatedMinutes: 15,
      competences: ['lecture', 'ecoute'],
      lesson: { description: `${C.lesen}

SITUATION
[fr] La situation
${bi('Karim hat die Stelle bekommen. Seine Kollegin Jana fährt in den Urlaub und schreibt ihm eine E-Mail.', 'Karim a obtenu le poste. Sa collègue Jana part en vacances et lui écrit un courriel.')}
TIPP
[fr] Conseil
${bi('Lesen Sie die E-Mail wie eine Liste: Was muss Karim tun, und bis wann?', 'Lisez le courriel comme une liste : que doit faire Karim, et pour quand ?')}

Betreff: Übergabe für deine erste Woche
Hallo Karim,
ab Montag bin ich zwei Wochen im Urlaub. Hier ist das Wichtigste für deine erste Woche am Empfang.
Die Anmeldungen für den Sprachkurs am Samstag musst du bis Mittwoch ins System eintragen. Die Formulare liegen in der blauen Mappe.
Frau Schulte vom Computerkurs hat angerufen: Der Beamer in Raum 104 funktioniert nicht. Sag bitte dem Hausmeister Bescheid, am besten gleich am Montagmorgen, denn ihr Kurs findet schon am Montag um 17 Uhr statt.
Neue Teilnehmende bekommen am ersten Tag eine Infomappe mit dem Hausplan und dem WLAN-Passwort. Es sind noch zehn Mappen da. Wenn sie nicht reichen, druckst du einfach neue aus.
Am Donnerstag kommt eine Gruppe aus Frankreich. Herr Yilmaz fragt, ob du sie begrüßen könntest, weil du Französisch sprichst. Könntest du ihm bis Dienstag antworten?
Deine Passwörter für das System bekommst du von Herrn Yilmaz. Wenn du Fragen hast, frag einfach Tobias aus dem Büro nebenan. Er kennt hier alles.
Viel Erfolg und bis bald!
Jana

DIKTAT
[fr] Dictée
${bi('Jana hat Karim danach noch eine Sprachnachricht geschickt. Hören Sie und schreiben Sie die zwei Sätze.', 'Jana a ensuite envoyé un message vocal à Karim. Écoutez et écrivez les deux phrases.')}` },
      questions: [
        choice('q1', bi('Was muss Karim bis Mittwoch erledigen?', 'Que doit faire Karim d’ici mercredi ?'),
          [['Er muss neue Infomappen für die Teilnehmenden drucken.'], ['Er muss die Anmeldungen für den Sprachkurs eintragen.', true],
            ['Er muss Herrn Yilmaz eine Antwort schicken.']],
          '« Die Anmeldungen für den Sprachkurs am Samstag musst du bis Mittwoch ins System eintragen. » La réponse à M. Yilmaz est attendue pour mardi, et de nouvelles pochettes ne sont à imprimer que si les dix ne suffisent pas.'),
        choice('q2', bi('Warum soll Karim den Hausmeister schon am Montagmorgen informieren?', 'Pourquoi Karim doit-il prévenir le concierge dès lundi matin ?'),
          [['Weil der Hausmeister nur montags im Haus ist und sonst keine Zeit hat.'], ['Weil Raum 104 am Montag renoviert wird.'],
            ['Weil der Computerkurs den Beamer schon am Montag braucht.', true]],
          '« Denn ihr Kurs findet schon am Montag um 17 Uhr statt » : le cours de Mme Schulte a besoin du vidéoprojecteur le jour même. « Denn » (car) introduit la raison, avec le verbe en deuxième position. Les autres raisons ne figurent pas dans le courriel.'),
        rf('q3', 'Herr Yilmaz möchte, dass Karim die Gruppe aus Frankreich begrüßt.', 'r',
          'Vrai : « Herr Yilmaz fragt, ob du sie begrüßen könntest, weil du Französisch sprichst. » Remarquez la question indirecte avec ob et le Konjunktiv II poli « könntest ».'),
        rf('q4', 'Tobias gibt Karim die Passwörter für das System.', 'f',
          'Faux : « Deine Passwörter für das System bekommst du von Herrn Yilmaz. » Tobias, du bureau voisin, aide seulement si Karim a des questions.'),
        dictation('q5', 'Die blaue Mappe liegt im Schrank hinter dem Empfang.',
          'Les noms prennent une majuscule : Mappe, Schrank, Empfang. « Hinter dem Empfang » : hinter + datif (position, sans mouvement), d’où « dem ».', 'frau3'),
        dictation('q6', 'Könntest du Herrn Yilmaz bitte bis Dienstag eine kurze Antwort schicken?',
          'Demande polie au Konjunktiv II avec du : « Könntest du … ? ». « Herrn » prend un -n (n-Deklination, ici au datif). L’infinitif « schicken » ferme la phrase, suivi du point d’interrogation.', 'frau3'),
      ] },

    // 10 · Vérifier
    { id: 'b1-arbeit-kontrolle', kind: 'exercise', title: 'Vérifier : la réponse du Bildungszentrum', estimatedMinutes: 12,
      competences: ['lecture', 'ecoute'],
      lesson: { description: `${bi('Prüfen Sie, was Sie in diesem Modul gelernt haben: Hören, Grammatik und Wortschatz.', 'Vérifiez ce que vous avez appris dans ce module : écoute, grammaire et vocabulaire.')}

${bi('Nach dem Gespräch hat Herr Yilmaz Karim eine Nachricht hinterlassen. Hören Sie sie für die Fragen 1 und 2.', 'Après l’entretien, M. Yilmaz a laissé un message à Karim. Écoutez-le pour les questions 1 et 2.')}` },
      placements: [{ media: 'b1-arbeit-kontrolle-audio', caption: 'Nachricht von Herrn Yilmaz' }],
      questions: [
        choice('q1', bi('Warum ruft Herr Yilmaz an?', 'Pourquoi M. Yilmaz appelle-t-il ?'),
          [['Er möchte das Gespräch auf Freitag verschieben.'], ['Er braucht noch Karims Zeugnisse im Original.'],
            ['Er möchte Karim die Stelle geben.', true]],
          '« Wir würden Sie gern bei uns einstellen » : einstellen signifie embaucher. Vendredi est la date limite pour rappeler, pas une nouvelle date d’entretien.'),
        choice('q2', bi('Wann soll Karim zurückrufen?', 'Quand Karim doit-il rappeler ?'),
          [['bis Freitag, am besten am Vormittag', true], ['am zweiten Mai, an seinem ersten Arbeitstag'], ['am Donnerstag nach dem Gespräch']],
          '« Könnten Sie mich bis Freitag zurückrufen? … Sie erreichen mich vormittags im Büro. » Le 2 mai est le premier jour de travail proposé.'),
        fill('q3', bi('Ergänzen Sie die Sätze aus der Nachricht.', 'Complétez les phrases du message.'),
          'Herr Yilmaz sagt: „Wir [[1]] Sie gern bei uns einstellen. [[2]] Sie mich bis Freitag zurückrufen?“',
          [['würden'], ['Könnten', 'Würden']],
          '« Wir würden … einstellen » : souhait poli (würden + infinitif à la fin). Pour la demande, M. Yilmaz dit « Könnten Sie … ? » ; « Würden Sie … ? » est tout aussi poli et correct.'),
        order('q4', C.ordnen, [['Ich', 'möchte', 'wissen,', 'wann', 'mein erster Arbeitstag', 'ist.']],
          'Question indirecte ouverte : wann + sujet (mein erster Arbeitstag) + verbe conjugué à la fin (ist). Pas de point d’interrogation après « Ich möchte wissen, … ».'),
        choice('q5', bi('Was ist ein „Arbeitgeber“?', 'Qu’est-ce qu’un « Arbeitgeber » ?'),
          [['eine Person, die eine Stelle sucht'], ['die Firma oder Person, die jemanden beschäftigt', true], ['ein Kollege, der die neuen Mitarbeiter einarbeitet']],
          'Der Arbeitgeber, c’est l’employeur : il « donne » (geben) le travail. La personne qui cherche un emploi est der Bewerber (candidat) ; celle qui est employée, der Arbeitnehmer.'),
        choice('q6', bi('Welche Form ist richtig?', 'Quelle forme est correcte ?'),
          [['Morgen lerne ich den neuen Kollege kennen.'], ['Morgen lerne ich der neue Kollege kennen.'],
            ['Morgen lerne ich den neuen Kollegen kennen.', true]],
          'Kennenlernen demande un accusatif : den neuen Kollegen. Kollege suit la n-Deklination : il prend -n à l’accusatif. « Den neuen Kollege » oublie ce -n ; « der neue Kollege » est un nominatif.'),
        fill('q7', bi('Ergänzen Sie das passende Wort.', 'Complétez avec le mot qui convient.'),
          'Die ersten drei Monate in der neuen Stelle sind die [[1]]: Danach entscheiden beide Seiten, ob sie weiter zusammenarbeiten.',
          [['Probezeit']],
          'Die Probezeit : la période d’essai, souvent de trois à six mois en Allemagne. Dans l’annonce du Bildungszentrum : « Die Probezeit dauert drei Monate. »'),
        choice('q8', bi('Das Gespräch ist am Donnerstag um 14 Uhr. Sie bestätigen den Termin am Telefon. Was sagen Sie?', 'L’entretien a lieu jeudi à 14 h. Vous confirmez au téléphone. Que dites-vous ?'),
          [['Gut, dann kommen Sie am Donnerstag um vierzehn Uhr. Vielen Dank!'], ['Gut, dann komme ich am Donnerstag um vierzehn Uhr. Vielen Dank!', true],
            ['Gut, dann komme ich am Donnerstag um vier Uhr. Vielen Dank!']],
          'Pour confirmer, on reprend le jour et l’heure exacts : « dann komme ich am Donnerstag um vierzehn Uhr ». La première réplique inverse les rôles (c’est vous qui venez) ; la troisième confond vierzehn (14) et vier (4).'),
      ] },
  ],
};
