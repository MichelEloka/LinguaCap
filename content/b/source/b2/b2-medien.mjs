// Module B2 n° 11 · thème « Medien » (lot R6). Fausses informations, réseaux sociaux et données personnelles : un article
// argumentatif sur la diffusion des fausses nouvelles (points de vue, inférence), une émission de radio sur les données
// collectées par les applications (prise de notes longue), une dépêche rapportant une étude au discours indirect
// (second document, thème pair : -lesen2). Grammaire : Konjunktiv I et discours rapporté (formes, remplacement par le
// Konjunktiv II, passé, questions et ordres rapportés, changement des pronoms ; laut, zufolge, nach Angaben).
// Consignes, règles et explications en allemand avec aide française repliée ([fr?]) ; lexique traduit en français.
import { C2, aide, choice, fill, order, match } from '../../lib.mjs';

/** « Richtig / falsch / steht nicht im Text » : r, f ou n pour la bonne réponse. */
const rf = (id, statement, answer, explanation) => choice(id, `„${statement}“ ${C2.richtigFalsch}`,
  [['richtig', answer === 'r'], ['falsch', answer === 'f'], ['steht nicht im Text', answer === 'n']], explanation);
/** Indices affichés sous les trous d'un fill (forme de base à transformer). */
const hints = (question, ...values) => ({ ...question,
  blanks: question.blanks.map((blank, index) => (values[index] ? { ...blank, hint: values[index] } : blank)) });

export default {
  id: 'b2-medien',
  title: 'Medien: Falschmeldungen, Netzwerke und Daten',
  objective: 'Comprendre un article argumentatif sur la diffusion des fausses informations, une émission de radio sur les données personnelles et une dépêche rapportant une étude, distinguer faits, opinions et propos rapportés, et rapporter les paroles d’autrui au discours indirect (Konjunktiv I, Konjunktiv II de remplacement, laut, zufolge).',
  grammarFocus: ['konjunktiv1-redewiedergabe'],
  sources: [
    'Textes, dialogues et exercices originaux LinguaCap. Personnes, émission, établissement scolaire et étude de la dépêche sont fictifs ; l’étude américaine sur la diffusion des fausses nouvelles et le règlement européen sur la protection des données sont évoqués de façon générale et simplifiée.',
  ],

  vocabulary: [
    { word: 'Falschmeldung', article: 'die', plural: 'Falschmeldungen', partOfSpeech: 'noun', translation: 'la fausse information',
      example: 'Die Falschmeldung wurde hunderttausend Mal geteilt.', note: 'aussi : die Fake News (pluriel)' },
    { word: 'Richtigstellung', article: 'die', plural: 'Richtigstellungen', partOfSpeech: 'noun', translation: 'le rectificatif',
      example: 'Die Richtigstellung erreichte nur wenige Menschen.', note: 'richtigstellen : rectifier' },
    { word: 'verbreiten', partOfSpeech: 'verb', translation: 'diffuser, propager',
      example: 'Falschmeldungen verbreiten sich schneller als wahre Nachrichten.', note: 'sich verbreiten : se propager' },
    { word: 'teilen', partOfSpeech: 'verb', translation: 'partager',
      example: 'Viele teilen Artikel, ohne sie gelesen zu haben.', note: null },
    { word: 'Quelle', article: 'die', plural: 'Quellen', partOfSpeech: 'noun', translation: 'la source',
      example: 'Prüfen Sie immer die Quelle einer Meldung.', note: 'eine Quelle prüfen, angeben' },
    { word: 'glaubwürdig', partOfSpeech: 'adjective', translation: 'crédible',
      example: 'Ist diese Seite eine glaubwürdige Quelle?', note: 'die Glaubwürdigkeit' },
    { word: 'irreführend', partOfSpeech: 'adjective', translation: 'trompeur',
      example: 'Die Überschrift ist irreführend.', note: null },
    { word: 'reißerisch', partOfSpeech: 'adjective', translation: 'racoleur, sensationnaliste',
      example: 'Reißerische Schlagzeilen werden besonders oft geteilt.', note: null },
    { word: 'Schlagzeile', article: 'die', plural: 'Schlagzeilen', partOfSpeech: 'noun', translation: 'le gros titre',
      example: 'Die Schlagzeile passt nicht zum Inhalt des Artikels.', note: null },
    { word: 'Algorithmus', article: 'der', plural: 'Algorithmen', partOfSpeech: 'noun', translation: 'l’algorithme',
      example: 'Der Algorithmus zeigt bevorzugt Inhalte, die Reaktionen auslösen.', note: null },
    { word: 'Faktencheck', article: 'der', plural: 'Faktenchecks', partOfSpeech: 'noun', translation: 'la vérification des faits',
      example: 'Die Redaktion hat einen Faktencheck veröffentlicht.', note: null },
    { word: 'Medienbildung', article: 'die', plural: null, partOfSpeech: 'noun', translation: 'l’éducation aux médias',
      example: 'Medienbildung sollte in allen Fächern vorkommen.', note: 'aussi : die Medienkompetenz' },
    { word: 'Datenschutz', article: 'der', plural: null, partOfSpeech: 'noun', translation: 'la protection des données',
      example: 'Beim Datenschutz hat die EU strenge Regeln.', note: 'die Datenschutz-Grundverordnung (DSGVO) : le RGPD' },
    { word: 'Einwilligung', article: 'die', plural: 'Einwilligungen', partOfSpeech: 'noun', translation: 'le consentement',
      example: 'Eine Einwilligung kann man jederzeit widerrufen.', note: 'einwilligen in + accusatif' },
    { word: 'widerrufen', partOfSpeech: 'verb', translation: 'révoquer, retirer',
      example: 'Sie können Ihre Einwilligung jederzeit widerrufen.', note: 'widerrief, hat widerrufen ; non séparable' },
    { word: 'Auskunft verlangen', partOfSpeech: 'expression', translation: 'demander des informations (officiellement)',
      example: 'Jeder darf Auskunft über seine gespeicherten Daten verlangen.', note: 'die Auskunft : le renseignement' },
    { word: 'löschen', partOfSpeech: 'verb', translation: 'effacer, supprimer',
      example: 'Ich habe vier Apps gelöscht.', note: null },
    { word: 'Werbung', article: 'die', plural: null, partOfSpeech: 'noun', translation: 'la publicité',
      example: 'Für gezielte Werbung zahlen Firmen mehr Geld.', note: 'gezielte Werbung : la publicité ciblée' },
    { word: 'behaupten', partOfSpeech: 'verb', translation: 'affirmer, prétendre',
      example: 'Er behauptet, das Foto sei echt.', note: 'die Behauptung' },
    { word: 'einräumen', partOfSpeech: 'verb', translation: 'admettre, concéder',
      example: 'Die Redaktion räumte ein, sie habe einen Fehler gemacht.', note: 'séparable : ein|räumen' },
    { word: 'bestreiten', partOfSpeech: 'verb', translation: 'contester, nier',
      example: 'Der Nutzer bestreitet, das Video gefälscht zu haben.', note: 'bestritt, hat bestritten' },
    { word: 'laut', partOfSpeech: 'preposition', translation: 'selon, d’après',
      example: 'Laut der Studie erkennen viele Jugendliche Falschmeldungen nicht.', note: '+ datif (ou génitif)' },
    { word: 'zufolge', partOfSpeech: 'preposition', translation: 'selon, d’après',
      example: 'Der Studie zufolge schneiden Jugendliche mit Projekterfahrung besser ab.', note: 'placé après le nom, + datif' },
    { word: 'angeblich', partOfSpeech: 'adverb', translation: 'soi-disant, prétendument',
      example: 'Das Video zeigt angeblich eine Explosion.', note: null },
  ],

  media: [
    { key: 'b2-medien-lesen-artikel', kind: 'image', title: 'Article : « Warum Lügen schneller laufen »',
      alt: 'Page de magazine intitulée « Warum Lügen schneller laufen » : une fausse photo d’inondation partagée cent mille fois en six heures.',
      image: { layout: 'article', kicker: 'Digitales', title: 'Warum Lügen schneller laufen', icon: 'newspaper',
        lead: 'Falschmeldungen verbreiten sich im Netz rasant. Was dahintersteckt – und was jeder Einzelne tun kann',
        paragraphs: ['Das Foto zeigte einen Bahnhof, der knietief unter Wasser stand. „Heute Morgen in unserer Stadt – und niemand berichtet darüber!“, schrieb jemand dazu.'] } },
    { key: 'b2-medien-hoeren-audio', kind: 'audio', title: 'Émission de radio : ce que les applis savent de nous',
      script: [
        { voice: 'mann', name: 'Simon Hemmer', text: 'Hallo und willkommen bei „Netzwerk“, dem Digitalmagazin. Heute fragen wir: Was wissen Apps eigentlich über uns? Im Studio ist die Datenschutzexpertin Tabea Asmussen, und am Telefon haben wir Linus Ohlendorf, siebzehn Jahre alt. Linus, du hast etwas ziemlich Ungewöhnliches gemacht. Erzähl mal!' },
        { voice: 'mann3', name: 'Linus Ohlendorf', text: 'Ja, also, ich habe bei einer App, die ich jeden Tag benutze, eine Kopie meiner Daten angefordert. Das darf man nämlich. Nach drei Wochen kam eine Datei mit über dreihundert Seiten. Da stand drin, wann ich die App geöffnet habe, wo ich gerade war und welche Videos ich wie lange angeschaut habe. Sogar, welche Videos ich nach zwei Sekunden weggewischt habe.' },
        { voice: 'mann', name: 'Simon Hemmer', text: 'War das kompliziert, Linus?' },
        { voice: 'mann3', name: 'Linus Ohlendorf', text: 'Gar nicht. In den Einstellungen gibt es einen Punkt „Meine Daten herunterladen“. Man muss nur seine E-Mail-Adresse bestätigen. Am schwierigsten war eigentlich, die Datei zu lesen, weil vieles nur aus Zahlen und Abkürzungen bestand.' },
        { voice: 'mann', name: 'Simon Hemmer', text: 'Frau Asmussen, ist das normal?' },
        { voice: 'frau2', name: 'Tabea Asmussen', text: 'Leider ja. Viele Apps sammeln deutlich mehr Daten, als sie für ihre eigentliche Funktion brauchen. Eine Taschenlampen-App muss nicht wissen, wo Sie sich gerade befinden. Trotzdem fragen manche genau danach.' },
        { voice: 'mann', name: 'Simon Hemmer', text: 'Warum machen die Firmen das?' },
        { voice: 'frau2', name: 'Tabea Asmussen', text: 'Weil sich mit Daten Geld verdienen lässt. Je genauer eine Firma weiß, wer Sie sind, was Sie mögen und wann Sie müde oder gelangweilt sind, desto gezielter kann sie Ihnen Werbung zeigen. Und für gezielte Werbung zahlen die Werbekunden mehr. Man sagt deshalb oft: Wenn eine App nichts kostet, bezahlen Sie mit Ihren Daten.' },
        { voice: 'mann', name: 'Simon Hemmer', text: 'Linus, hat dich das Ergebnis überrascht?' },
        { voice: 'mann3', name: 'Linus Ohlendorf', text: 'Ehrlich gesagt schon. Ich dachte, ich bin vorsichtig. Ich poste fast nichts Persönliches. Aber die App weiß trotzdem, wann ich schlafen gehe, nämlich meistens viel zu spät.' },
        { voice: 'mann', name: 'Simon Hemmer', text: 'Frau Asmussen, welche Rechte haben Nutzerinnen und Nutzer?' },
        { voice: 'frau2', name: 'Tabea Asmussen', text: 'In der Europäischen Union gilt die Datenschutz-Grundverordnung. Danach dürfen Sie jederzeit Auskunft darüber verlangen, welche Daten ein Unternehmen über Sie speichert, und das Unternehmen muss in der Regel innerhalb eines Monats antworten.' },
        { voice: 'frau2', name: 'Tabea Asmussen', text: 'Sie können außerdem verlangen, dass Ihre Daten gelöscht werden. Und eine Einwilligung, die Sie einmal gegeben haben, können Sie jederzeit widerrufen.' },
        { voice: 'mann', name: 'Simon Hemmer', text: 'Ist das nicht ein Kampf gegen Windmühlen? Die meisten klicken doch sowieso auf „Akzeptieren“.' },
        { voice: 'frau2', name: 'Tabea Asmussen', text: 'Das stimmt, und genau darauf setzen die Firmen. Die Fenster sind oft so gestaltet, dass der Knopf „Alle akzeptieren“ groß und bunt ist und die Ablehnung versteckt. Aber es tut sich etwas: Immer mehr Menschen nutzen ihre Rechte, und Verbraucherschützer gehen vor Gericht gegen solche Tricks vor.' },
        { voice: 'mann', name: 'Simon Hemmer', text: 'Was raten Sie ganz praktisch?' },
        { voice: 'frau2', name: 'Tabea Asmussen', text: 'Drei Dinge. Erstens: Prüfen Sie einmal im Monat in den Einstellungen, welche App auf Standort, Kamera und Mikrofon zugreifen darf. Zweitens: Klicken Sie bei den Cookie-Fenstern nicht automatisch auf „Alle akzeptieren“. Das kostet ein paar Sekunden mehr, aber die lohnen sich. Und drittens: Löschen Sie Apps, die Sie seit Monaten nicht mehr benutzt haben.' },
        { voice: 'mann', name: 'Simon Hemmer', text: 'Und wie machen Sie das selbst, Frau Asmussen?' },
        { voice: 'frau2', name: 'Tabea Asmussen', text: 'Ich habe auf meinem Handy nur die Apps, die ich wirklich brauche. Und vor jeder Installation sehe ich nach, welche Zugriffe eine App verlangt. Das dauert zwei Minuten und erspart mir viel Ärger.' },
        { voice: 'mann', name: 'Simon Hemmer', text: 'Linus, hast du nach deinem Experiment etwas geändert?' },
        { voice: 'mann3', name: 'Linus Ohlendorf', text: 'Ja. Ich habe vier Apps gelöscht und bei den anderen den Standort ausgeschaltet. Und ich habe meinen Freunden davon erzählt. Zwei haben auch schon ihre Daten angefordert.' },
        { voice: 'mann', name: 'Simon Hemmer', text: 'Na, dann hat sich das ja gelohnt. Vielen Dank, Linus, und vielen Dank, Frau Asmussen.' },
      ] },
    { key: 'b2-medien-lesen2-meldung', kind: 'image', title: 'Dépêche : une étude sur les jeunes et les fausses informations',
      alt: 'Dépêche intitulée « Studie: Viele Jugendliche erkennen Falschmeldungen nicht » : seul un tiers des jeunes interrogés a repéré presque toutes les fausses publications.',
      image: { layout: 'article', kicker: 'Bildung', title: 'Studie: Viele Jugendliche erkennen Falschmeldungen nicht', icon: 'file-text',
        lead: 'Forschende fordern mehr Medienbildung an den Schulen',
        paragraphs: ['Viele Jugendliche haben Schwierigkeiten, Falschmeldungen im Internet zu erkennen. Das geht aus einer Studie hervor, die ein Institut für Medienbildung am Dienstag vorgestellt hat.'] } },
    { key: 'b2-medien-kontrolle-audio', kind: 'audio', title: 'Journal radio : un incendie et des vidéos trompeuses',
      script: [
        { voice: 'sprecher', name: 'Nachrichten', text: 'Und nun die Meldungen aus der Region. Nach dem Brand in einer Lagerhalle im Gewerbegebiet Nord ist die Ursache weiter unklar. Wie die Feuerwehr mitteilte, wurde niemand verletzt. Ein Sprecher der Polizei sagte, man schließe Brandstiftung bisher nicht aus.' },
        { voice: 'sprecher', name: 'Nachrichten', text: 'Videos, die in sozialen Netzwerken kursieren und angeblich Explosionen in der Halle zeigen, stammen nach Angaben der Polizei nicht von diesem Brand. Die Polizei bittet Zeugen, sich zu melden.' },
      ] },
  ],

  activities: [
    // 1 · Einstieg
    { id: 'b2-medien-einstieg', kind: 'lesson', title: 'Einstieg: Wem glauben wir im Netz?', estimatedMinutes: 10,
      competences: ['lecture', 'expression-orale'],
      lesson: { description: `INFORMIERT ODER MANIPULIERT?
[fr?] Informés ou manipulés ?
${aide('Nachrichten erreichen uns heute vor allem über das Handy: in sozialen Netzwerken, in Chats, in Videos. Dabei ist nicht immer klar, wer etwas geschrieben hat und ob es stimmt. In diesem Modul geht es um Falschmeldungen, um unsere Daten und darum, wie man wiedergibt, was andere gesagt haben.', 'Aujourd’hui, l’information nous arrive surtout par le téléphone : réseaux sociaux, messageries, vidéos. On ne sait pas toujours qui a écrit quoi, ni si c’est vrai. Ce module traite des fausses informations, de nos données et de la manière de rapporter les propos d’autrui.')}

FRAGEN ZUM EINSTIEG
[fr?] Questions pour commencer
• ${aide('Wo informieren Sie sich über aktuelle Ereignisse? Warum gerade dort?', 'Où vous informez-vous sur l’actualité ? Pourquoi là ?')}
• ${aide('Haben Sie schon einmal eine Meldung geteilt, die sich später als falsch herausgestellt hat?', 'Avez-vous déjà partagé une information qui s’est révélée fausse ?')}
• ${aide('Welche Daten geben Sie Apps freiwillig, und welche lieber nicht?', 'Quelles données donnez-vous volontiers aux applis, et lesquelles pas ?')}
${aide('Überlegen Sie sich zu jeder Frage zwei oder drei Sätze und ein Beispiel.', 'Préparez mentalement deux ou trois phrases et un exemple par question.')}

ZIELE
[fr?] Objectifs
• ${aide('Ich kann einen Artikel über Falschmeldungen verstehen und Fakten, Meinungen und zitierte Aussagen unterscheiden.', 'Je peux comprendre un article sur les fausses informations et distinguer faits, opinions et propos cités.')}
• ${aide('Ich kann einem Radiogespräch über Datenschutz Informationen und Ratschläge entnehmen und Notizen machen.', 'Je peux tirer d’une émission sur la protection des données des informations et des conseils, en prenant des notes.')}
• ${aide('Ich kann wiedergeben, was andere gesagt haben: im Konjunktiv I und mit „laut“, „zufolge“, „nach Angaben“.', 'Je peux rapporter les propos d’autrui au Konjunktiv I et avec laut, zufolge, nach Angaben.')}
• ${aide('Ich kann in einer Nachrichtenmeldung erkennen, wer was behauptet.', 'Je peux repérer dans une dépêche qui affirme quoi.')}

WICHTIGE WÖRTER
[fr?] Mots-clés
• die Falschmeldung — la fausse information
• verbreiten — diffuser, propager
• die Quelle — la source
• glaubwürdig — crédible
• die Schlagzeile — le gros titre
• der Datenschutz — la protection des données
• die Einwilligung — le consentement
• behaupten — affirmer, prétendre` } },

    // 2 · Lecture longue : article argumentatif
    { id: 'b2-medien-lesen', kind: 'exercise', title: 'Verstehen: ein Artikel über Falschmeldungen', estimatedMinutes: 20,
      competences: ['lecture'],
      lesson: { description: `${C2.lesen}

STRATEGIE
[fr?] Stratégie
1. ${aide('Achten Sie darauf, wer spricht: Der Autor, eine Studie, eine Forscherin oder ein Lehrer? Zitierte Aussagen stehen in Anführungszeichen oder im Konjunktiv I (sei, gehe, habe).', 'Repérez qui parle : l’auteur, une étude, une chercheuse, un enseignant ? Les propos cités sont entre guillemets ou au Konjunktiv I.')}
2. ${aide('Die eigene Position des Textes erkennen Sie an Wertungen und Forderungen: „wäre bequem“, „müssen offenlegen“, „die einfachste Regel“.', 'La position du texte se lit dans les jugements et les exigences.')}

WARUM LÜGEN SCHNELLER LAUFEN
Falschmeldungen verbreiten sich im Netz rasant. Was dahintersteckt – und was jeder Einzelne tun kann

(A) Das Foto zeigte einen Bahnhof, der knietief unter Wasser stand. „Heute Morgen in unserer Stadt – und niemand berichtet darüber!“, schrieb jemand dazu. Innerhalb von sechs Stunden wurde der Beitrag über hunderttausend Mal geteilt. Am Abend stellte sich heraus, dass das Bild acht Jahre alt war und aus einem anderen Land stammte. Die Richtigstellung erreichte nur einen Bruchteil der Menschen, die das Foto gesehen hatten. Viele, die es weitergeleitet hatten, löschten ihren Beitrag nie, und manche teilten das Bild sogar noch weiter, als die Korrektur längst bekannt war.

(B) Solche Fälle sind kein Zufall. Eine viel zitierte Studie aus den USA, die Millionen von Beiträgen auf einer großen Plattform ausgewertet hat, kam zu dem Ergebnis, Falschmeldungen verbreiteten sich deutlich schneller und weiter als wahre Nachrichten. Für die Medienforscherin Carla Vossberg ist das keine Überraschung. Menschen teilten vor allem, was sie überrasche, empöre oder ängstige, erklärt sie. Die Wahrheit sei dagegen oft komplizierter, langweiliger und voller Einschränkungen. „Eine Lüge muss nicht stimmen, sie muss nur gut klingen“, sagt Vossberg. Wer sich über eine Nachricht aufregt, fragt seltener, ob sie überhaupt stimmt.

(C) Eine wichtige Rolle spielt auch die Technik. Die Algorithmen der Plattformen zeigen bevorzugt Inhalte, auf die viele Menschen reagieren – mit Klicks, Kommentaren oder wütenden Emojis. Ob ein Beitrag stimmt, spielt dabei keine Rolle. Vossberg zufolge belohnt das System damit genau die Inhalte, die die Gesellschaft spalten. Hinzu komme, dass viele Nutzerinnen und Nutzer einen Artikel teilten, ohne mehr als die Überschrift gelesen zu haben. Wer eine reißerische Schlagzeile sieht, die zur eigenen Meinung passt, klickt eben schnell auf „Teilen“. Und wer einmal auf einen solchen Beitrag reagiert hat, bekommt bald noch mehr davon zu sehen.

(D) Was lässt sich dagegen tun? Faktenchecks von Redaktionen helfen, doch sie kommen oft zu spät und erreichen vor allem Menschen, die ohnehin skeptisch sind. Einige Plattformen blenden inzwischen Hinweise unter umstrittenen Beiträgen ein; wie viel das bringt, ist noch offen. Deshalb setzen viele Fachleute auf Bildung. An einem Gymnasium in Norddeutschland hat der Lehrer Ole Brinkmann ein Wahlfach „Nachrichten prüfen“ eingeführt. Seine Schülerinnen und Schüler lernen, eine Bilder-Rückwärtssuche zu nutzen, Quellen zu vergleichen und Absender zu prüfen. Es gehe nicht darum, allem zu misstrauen, betont Brinkmann. Ziel sei vielmehr, zu wissen, wem man warum vertraut. Nach einem Jahr, so berichtet er, hätten seine Schüler in einem Test mehr Falschmeldungen erkannt als ihre Eltern.

(E) Die Verantwortung allein bei den Einzelnen abzuladen, wäre allerdings zu bequem. Plattformen, die mit unserer Aufmerksamkeit Geld verdienen, müssen offenlegen, nach welchen Regeln sie Inhalte verbreiten, und Falschmeldungen schneller kennzeichnen. Doch auch wer nur ein Handy in der Hand hält, trägt einen Teil der Verantwortung. Die einfachste Regel ist zugleich die wirksamste: erst prüfen, dann teilen. Und wer sich nicht sicher ist, teilt im Zweifel lieber gar nicht. Die Wahrheit mag langsamer sein – aber sie kann aufholen, wenn wir ihr ein wenig Zeit geben.` },
      placements: [{ media: 'b2-medien-lesen-artikel', caption: 'Warum Lügen schneller laufen' }],
      questions: [
        choice('q1', aide('Welche Position vertritt der Text insgesamt?', 'Quelle position le texte défend-il dans l’ensemble ?'),
          [['Nur strenge Gesetze können Falschmeldungen im Netz noch stoppen.'],
            ['Faktenchecks sind das wirksamste Mittel gegen Falschmeldungen.'],
            ['Wer Falschmeldungen teilt, tut das fast immer mit voller Absicht.'],
            ['Plattformen und Einzelne tragen gemeinsam Verantwortung.', true]],
          aide('Absatz E fordert zuerst etwas von den Plattformen („müssen offenlegen“, „schneller kennzeichnen“) und dann von jedem Einzelnen („erst prüfen, dann teilen“). Faktenchecks kommen laut Absatz D „oft zu spät“, und von Gesetzen oder bewusster Absicht spricht der Text nicht.',
            'Responsabilité partagée : plateformes et utilisateurs.')),
        choice('q2', aide('Was soll das Beispiel des Bahnhofsfotos in Absatz A vor allem zeigen?', 'Que doit surtout montrer l’exemple de la photo de la gare ?'),
          [['Eine Korrektur erreicht viel weniger Menschen als die Falschmeldung.', true],
            ['Bahnhöfe gehören bei starkem Unwetter zu den gefährlichsten Orten einer Stadt.'],
            ['Die Medien berichten insgesamt viel zu wenig über Unwetter.'],
            ['Alte Fotos darf man in sozialen Netzwerken nicht mehr teilen.']],
          aide('Der Absatz endet mit dem entscheidenden Punkt: „Die Richtigstellung erreichte nur einen Bruchteil der Menschen“, und viele löschten ihren Beitrag nie. Der Satz „niemand berichtet darüber“ war Teil der Falschmeldung, keine Kritik des Autors an den Medien.',
            'Le rectificatif touche bien moins de monde que la fausse information.')),
        rf('q3', 'Laut der Studie aus den USA verbreiten sich Falschmeldungen schneller als wahre Nachrichten.', 'r',
          aide('Richtig: Die Studie „kam zu dem Ergebnis, Falschmeldungen verbreiteten sich deutlich schneller und weiter als wahre Nachrichten“. Der Konjunktiv zeigt, dass der Text das Ergebnis der Studie wiedergibt.',
            'Vrai : c’est le résultat rapporté de l’étude.')),
        rf('q4', 'Ole Brinkmann rät seinen Schülern, grundsätzlich allen Medien zu misstrauen.', 'f',
          aide('Falsch: „Es gehe nicht darum, allem zu misstrauen, betont Brinkmann. Ziel sei vielmehr, zu wissen, wem man warum vertraut.“',
            'Faux : il ne s’agit pas de se méfier de tout.')),
        rf('q5', 'Das Wahlfach von Herrn Brinkmann gibt es inzwischen an allen Schulen des Landes.', 'n',
          aide('Steht nicht im Text: Der Artikel nennt nur ein Gymnasium in Norddeutschland. Ob andere Schulen das Fach übernommen haben, erfahren wir nicht.',
            'Non mentionné : un seul lycée est cité.')),
        match('q6', aide('Welche Überschrift passt zu welchem Absatz? Ordnen Sie zu.', 'Quel intertitre convient à quel paragraphe ? Associez.'),
          [['Absatz A', 'Ein Bild, das täuschte'], ['Absatz B', 'Warum wir Aufregendes teilen'], ['Absatz C', 'Die Rolle der Algorithmen'],
            ['Absatz D', 'Prüfen lernen in der Schule'], ['Absatz E', 'Geteilte Verantwortung']],
          aide('A erzählt ein Beispiel, B erklärt die psychologischen Gründe (überraschen, empören), C die Technik der Plattformen, D Gegenmittel, vor allem Bildung, E zieht das Fazit über Plattformen und Nutzer.',
            'Exemple, causes psychologiques, technique, éducation, conclusion.')),
        choice('q7', aide('Wie ist das Zitat „Eine Lüge muss nicht stimmen, sie muss nur gut klingen“ gemeint?', 'Comment comprendre cette citation ?'),
          [['Wer gut formulieren kann, darf ruhig auch einmal lügen.'], ['Lügen klingen meistens viel schlechter als die Wahrheit.'],
            ['Für die Verbreitung zählt die Wirkung, nicht die Wahrheit.', true], ['Nur Fachleute können Lügen von der Wahrheit unterscheiden.']],
          aide('Vossberg erklärt davor, man teile, was überrascht oder empört; die Wahrheit sei oft „komplizierter, langweiliger“. Ihr Satz fasst das zusammen: Ob etwas geteilt wird, hängt von seiner Wirkung ab, nicht davon, ob es stimmt.',
            'Ce qui compte pour la diffusion, c’est l’effet produit, pas la vérité.')),
        fill('q8', aide('Ergänzen Sie die Verben im Konjunktiv aus dem Text.', 'Complétez avec les verbes au subjonctif du texte.'),
          'Menschen [[1]] vor allem, was sie überrasche. · Die Wahrheit [[2]] dagegen oft komplizierter. · Es [[3]] nicht darum, allem zu misstrauen.',
          [['teilten'], ['sei'], ['gehe']],
          aide('Der Text gibt die Aussagen von Vossberg und Brinkmann in indirekter Rede wieder. „Sei“ und „gehe“ sind Konjunktiv I. „Teilten“ ist Konjunktiv II: Der Konjunktiv I „sie teilen“ sähe genauso aus wie der Indikativ.',
            'Discours indirect : sei, gehe (Konjunktiv I) ; teilten remplace « teilen », identique à l’indicatif.')),
      ] },

    // 3 · Écoute longue : émission sur les données personnelles
    { id: 'b2-medien-hoeren', kind: 'exercise', title: 'Verstehen: ein Radiogespräch über unsere Daten', estimatedMinutes: 20,
      competences: ['ecoute'],
      lesson: { description: `${C2.hoeren}

SITUATION
[fr?] La situation
${aide('Im Digitalmagazin „Netzwerk“ spricht der Moderator Simon Hemmer mit der Datenschutzexpertin Tabea Asmussen und mit dem 17-jährigen Linus Ohlendorf, der bei einer App seine Daten angefordert hat. Das Gespräch dauert etwa dreieinhalb Minuten.', 'Dans le magazine numérique « Netzwerk », l’animateur Simon Hemmer reçoit la spécialiste de la protection des données Tabea Asmussen et Linus Ohlendorf, 17 ans, qui a demandé ses données à une appli. L’échange dure environ trois minutes et demie.')}

STRATEGIE
[fr?] Stratégie
1. ${aide('Beim ersten Hören: Was hat Linus erlebt, und was erklärt die Expertin?', 'Première écoute : qu’a vécu Linus, et qu’explique la spécialiste ?')}
2. ${aide('Beim zweiten Hören ergänzen Sie die Notizen. Zahlen und Aufzählungen („Erstens …, zweitens …“) helfen Ihnen.', 'Deuxième écoute : complétez les notes ; les nombres et les énumérations vous guident.')}` },
      placements: [{ media: 'b2-medien-hoeren-audio', caption: 'Netzwerk: Was wissen Apps über uns?' }],
      questions: [
        fill('q1', C2.notizen,
          'Linus: Kopie seiner Daten nach drei [[1]] · Umfang: über [[2]] Seiten · gespeichert: Nutzungszeiten, [[3]] und angesehene Videos · warum Firmen Daten sammeln: für gezielte [[4]] · Linus geht meistens zu [[5]] schlafen',
          [['Wochen'], ['300', 'dreihundert'], ['Standort', 'Ort', 'Aufenthaltsort'], ['Werbung'], ['spät']],
          aide('„Nach drei Wochen kam eine Datei mit über dreihundert Seiten.“ Gespeichert war, „wo ich gerade war“, also der Standort. Mit Daten „lässt sich Geld verdienen“, weil man „gezielt Werbung zeigen“ kann. Die App weiß, wann Linus schlafen geht: „meistens viel zu spät“.',
            'der Standort : la localisation ; gezielte Werbung : publicité ciblée.')),
        choice('q2', aide('Was kritisiert Frau Asmussen am Beispiel der Taschenlampen-App?', 'Que critique Mme Asmussen avec l’exemple de l’appli lampe de poche ?'),
          [['Solche Apps kosten oft viel mehr Geld, als sie eigentlich wert sind.'], ['Solche Apps funktionieren nur, wenn das Internet an ist.'],
            ['Apps sammeln Daten, die sie für ihre Funktion nicht brauchen.', true], ['Apps zeigen nachts zu helles Licht und stören den Schlaf.']],
          aide('„Viele Apps sammeln deutlich mehr Daten, als sie für ihre eigentliche Funktion brauchen. Eine Taschenlampen-App muss nicht wissen, wo Sie sich gerade befinden.“ Über Preis, Internet oder Licht sagt sie nichts.',
            'Collecte de données inutiles à la fonction de l’appli.')),
        choice('q3', aide('Was bedeutet der Satz „Wenn eine App nichts kostet, bezahlen Sie mit Ihren Daten“?', 'Que signifie cette phrase ?'),
          [['Kostenlose Apps verlangen nach einiger Zeit doch noch eine Gebühr.'], ['Die App verdient Geld mit Werbung, die auf Ihren Daten beruht.', true],
            ['Wer seine Daten löscht, muss für die App bezahlen.'], ['Daten sind wertlos, solange eine App gratis bleibt.']],
          aide('Frau Asmussen erklärt davor: Je mehr eine Firma über Sie weiß, desto gezielter kann sie Werbung zeigen, und dafür zahlen Werbekunden mehr. Der Preis der App sind also Ihre Daten. Von Gebühren ist nicht die Rede.',
            'Le « prix » d’une appli gratuite, ce sont vos données.')),
        choice('q4', aide('Was hat Linus besonders überrascht?', 'Qu’est-ce qui a surtout surpris Linus ?'),
          [['Dass die App ihm für seine Daten sogar Geld anbieten wollte.'], ['Dass seine Freunde schon viel früher Bescheid wussten.'],
            ['Dass die Firma seine Anfrage einfach abgelehnt hat.'], ['Dass die App viel über ihn weiß, obwohl er kaum postet.', true]],
          aide('„Ich dachte, ich bin vorsichtig. Ich poste fast nichts Persönliches. Aber die App weiß trotzdem, wann ich schlafen gehe.“ Die Firma hat seine Anfrage beantwortet, und seine Freunde hat er erst danach informiert.',
            'Il pensait être prudent, mais l’appli sait beaucoup de choses.')),
        fill('q5', C2.notizen,
          'Rechte nach der Datenschutz-Grundverordnung: Auskunft verlangen, Antwort meist innerhalb eines [[1]] · Daten [[2]] lassen · Einwilligung jederzeit [[3]] · Tipp 1: einmal im Monat in den [[4]] prüfen, welche App auf Standort, Kamera und Mikrofon zugreift',
          [['Monats'], ['löschen'], ['widerrufen', 'zurückziehen'], ['Einstellungen']],
          aide('Das Unternehmen muss „in der Regel innerhalb eines Monats antworten“. Man kann verlangen, „dass Ihre Daten gelöscht werden“, und eine Einwilligung „jederzeit widerrufen“. Erster Tipp: „Prüfen Sie einmal im Monat in den Einstellungen …“',
            'widerrufen : retirer (un consentement) ; die Einstellungen : les réglages.')),
        choice('q6', aide('Was hat Linus nach seinem Experiment getan?', 'Qu’a fait Linus après son expérience ?'),
          [['Er hat alle sozialen Netzwerke für immer verlassen.'], ['Er hat Apps gelöscht und den Standort ausgeschaltet.', true],
            ['Er hat sich bei der Firma schriftlich über die App beschwert.'], ['Er hat ein neues Handy ohne Kamera gekauft.']],
          aide('„Ich habe vier Apps gelöscht und bei den anderen den Standort ausgeschaltet. Und ich habe meinen Freunden davon erzählt.“ Er hat nicht alle Netzwerke verlassen und sich auch nicht beschwert.',
            'Il a supprimé des applis et désactivé la localisation.')),
      ] },

    // 4 · Grammaire inductive
    { id: 'b2-medien-entdecken', kind: 'exercise', title: 'Entdecken: Wie gibt man wieder, was andere sagen?', estimatedMinutes: 10,
      competences: ['lecture'],
      lesson: { description: `${aide('Lesen Sie die Sätze aus dem Artikel und aus der Meldung über die Studie. Achten Sie auf die Verbformen.', 'Lisez les phrases de l’article et de la dépêche sur l’étude. Observez les formes verbales.')}

SÄTZE
[fr?] Le corpus
(1) Menschen teilten vor allem, was sie überrasche, erklärt Vossberg.
(2) Die Wahrheit sei dagegen oft komplizierter.
(3) Es gehe nicht darum, allem zu misstrauen, betont Brinkmann.
(4) Nur knapp ein Drittel habe fünf der sechs Falschmeldungen erkannt, teilte das Institut mit.
(5) Viele hätten angegeben, sie würden einem Beitrag eher glauben, wenn er oft geteilt worden sei.
(6) Sie forderte, das Prüfen von Quellen müsse in allen Fächern geübt werden.
(7) Die Studie kam zu dem Ergebnis, Falschmeldungen verbreiteten sich schneller als wahre Nachrichten.

${aide('Beantworten Sie dann die Fragen. Die Erklärungen formulieren die Regel.', 'Répondez ensuite aux questions : les explications formulent la règle.')}` },
      questions: [
        choice('q1', aide('Sätze 2, 3, 4 und 6: Warum stehen die Verben im Konjunktiv (sei, gehe, habe, müsse)?', 'Phrases 2, 3, 4 et 6 : pourquoi ces verbes sont-ils au subjonctif ?'),
          [['Weil die Aussagen sicher wahr sind.'], ['Weil der Text eine Bitte ausdrückt.'],
            ['Weil der Text Aussagen anderer wiedergibt.', true], ['Weil die Sätze in der Zukunft spielen.']],
          aide('Der Konjunktiv I ist das Zeichen der indirekten Rede: Der Text gibt wieder, was Vossberg, Brinkmann oder das Institut sagen, und übernimmt die Aussage nicht als eigene. Er sagt nichts darüber, ob sie wahr ist.',
            'Le Konjunktiv I signale le discours rapporté, sans prendre position.')),
        choice('q2', aide('Wie bildet man den Konjunktiv I in der 3. Person Singular?', 'Comment forme-t-on le Konjunktiv I à la 3e personne du singulier ?'),
          [['Infinitiv + -te (er gehte)'], ['Präteritum mit Umlaut (er ginge)'], ['würde + Infinitiv (er würde gehen)'],
            ['Verbstamm + -e (er gehe, er habe)', true]],
          aide('Stamm des Infinitivs + -e: geh-e, hab-e, müss-e, könn-e, werd-e. Ausnahme ist „sein“: er sei. „Er ginge“ ist Konjunktiv II, „würde + Infinitiv“ ist eine Ersatzform.',
            'Radical de l’infinitif + -e ; exception : er sei.')),
        choice('q3', aide('Sätze 1, 5 und 7: Warum steht hier der Konjunktiv II (teilten, hätten, verbreiteten)?', 'Phrases 1, 5 et 7 : pourquoi le Konjunktiv II ?'),
          [['Weil der Konjunktiv I im Plural wie der Indikativ aussieht.', true], ['Weil die Aussagen besonders höflich formuliert sein sollen.'],
            ['Weil es sich um unrealistische Wünsche handelt.'], ['Weil die Verben unregelmäßig sind.']],
          aide('Der Konjunktiv I von „sie teilen“, „sie haben“, „sie verbreiten“ ist identisch mit dem Indikativ. Damit die indirekte Rede erkennbar bleibt, nimmt man den Konjunktiv II: sie teilten, sie hätten, sie verbreiteten (oder würde + Infinitiv).',
            'Quand le Konjunktiv I = indicatif, on le remplace par le Konjunktiv II.')),
        choice('q4', aide('Satz 4: Worauf bezieht sich „habe … erkannt“?', 'Phrase 4 : à quoi renvoie « habe … erkannt » ?'),
          [['auf eine Handlung in der Zukunft'], ['auf eine Bitte des Instituts'], ['auf eine Handlung in der Vergangenheit', true],
            ['auf eine Möglichkeit']],
          aide('Vergangenheit in der indirekten Rede: Konjunktiv I von „haben“ oder „sein“ + Partizip II (habe erkannt, sei gewesen). Es gibt nur diese eine Vergangenheitsform; Präteritum und Perfekt der direkten Rede werden beide so wiedergegeben.',
            'Passé : habe / sei + participe II, quelle que soit la forme directe.')),
      ] },

    // 5 · Règle
    { id: 'b2-medien-regel', kind: 'lesson', title: 'Regel: Konjunktiv I und indirekte Rede', estimatedMinutes: 10,
      competences: ['lecture'],
      lesson: { description: `REGEL — WOZU DER KONJUNKTIV I?
[fr?] Règle : à quoi sert le Konjunktiv I ?
In Nachrichten, Berichten und formellen Texten zeigt der Konjunktiv I, dass man fremde Aussagen wiedergibt. Die Sprecherin übernimmt keine Verantwortung dafür, ob sie stimmen.
[fr?] Le Konjunktiv I signale un discours rapporté, surtout à l’écrit et dans les médias ; le français n’a pas de mode équivalent.
• ${aide('Direkt: „Die Wahrheit ist oft kompliziert.“ → Indirekt: Sie sagt, die Wahrheit sei oft kompliziert.', 'La conjonction « dass » est facultative ; sans elle, ordre de la principale.')}
• ${aide('Mit „dass“: Sie sagt, dass die Wahrheit oft kompliziert sei.', 'Avec « dass », verbe à la fin.')}

REGEL — DIE FORMEN
[fr?] Règle : les formes
Verbstamm + Endung: -e, -est, -e, -en, -et, -en. Am häufigsten ist die 3. Person Singular.
[fr?] Radical + -e, -est, -e, -en, -et, -en ; surtout à la 3e personne du singulier.
• ${aide('er/sie/es: habe, gehe, komme, könne, müsse, wolle, werde', 'formes courantes')}
• ${aide('sein: ich sei, du sei(e)st, er sei, wir seien, ihr seiet, sie seien', 'sein est irrégulier à toutes les personnes')}

REGEL — ERSATZFORM KONJUNKTIV II
[fr?] Règle : remplacement par le Konjunktiv II
Wenn der Konjunktiv I aussieht wie der Indikativ (ich habe, wir haben, sie haben), nimmt man den Konjunktiv II oder „würde“ + Infinitiv.
[fr?] Si le Konjunktiv I se confond avec l’indicatif, on prend le Konjunktiv II ou « würde » + infinitif.
• ${aide('Sie sagen, sie hätten keine Zeit. (nicht: sie haben)', 'ils disent n’avoir pas le temps')}
• ${aide('Die Studie zeigt, Jugendliche teilten / würden Artikel ungelesen teilen.', 'teilten ou würden … teilen')}

REGEL — ZEITEN, FRAGEN, AUFFORDERUNGEN
[fr?] Règle : temps, questions, ordres
• ${aide('Vergangenheit: habe / sei + Partizip II – Er sagt, er habe das Foto geprüft. Sie sagt, sie sei krank gewesen.', 'Passé : habe / sei + participe II')}
• ${aide('Zukunft: werde + Infinitiv – Er sagt, er werde morgen antworten.', 'Futur : werde + infinitif')}
• ${aide('Fragen: ob oder Fragewort, Verb am Ende – Sie fragt, ob das Foto echt sei. Sie fragt, woher es stamme.', 'Questions : ob ou mot interrogatif, verbe à la fin')}
• ${aide('Aufforderungen: sollen (oder höflich: mögen) – Er rät, man solle zuerst die Quelle prüfen.', 'Ordres et conseils : solle + infinitif')}

REGEL — PERSPEKTIVE ANPASSEN
[fr?] Règle : adapter le point de vue
${aide('Pronomen, Possessivartikel, Orts- und Zeitangaben ändern sich: ich → er/sie, mein → sein/ihr, hier → dort, heute → an diesem Tag, morgen → am nächsten Tag.', 'Pronoms, possessifs, indications de lieu et de temps changent, comme en français.')}

ACHTUNG
[fr?] Attention : pièges des francophones
• ${aide('Signale ohne Konjunktiv: laut + Dativ, … zufolge, nach Angaben + Genitiv – Laut der Polizei wurde niemand verletzt.', 'Après laut, zufolge, nach Angaben, l’indicatif suffit.')}
• ${aide('In der gesprochenen Sprache benutzen viele den Indikativ: Er hat gesagt, dass er krank ist. In Berichten und Prüfungstexten schreiben Sie den Konjunktiv.', 'À l’oral, l’indicatif est courant ; à l’écrit formel, employez le Konjunktiv.')}
• ${aide('Nicht überall „würde“: Die Formen „sei“, „habe“ (3. Person), „könne“, „müsse“ sind eindeutig und klingen besser.', 'Pas de « würde » partout : sei, habe, könne, müsse sont clairs.')}` } },

    // 6 · Grammaire : s'entraîner
    { id: 'b2-medien-grammatik', kind: 'exercise', title: 'Üben: indirekte Rede im Konjunktiv', estimatedMinutes: 15,
      competences: ['lecture', 'expression-ecrite'],
      lesson: { description: `${aide('Üben Sie die indirekte Rede: Formen, Ersatzformen, Vergangenheit, Fragen und Aufforderungen.', 'Entraînez-vous au discours indirect : formes, remplacements, passé, questions et ordres.')}

MERKE
[fr?] À retenir
• ${aide('er habe, sei, könne, gehe · sie hätten, kämen (Ersatz) · er habe … geprüft, sie sei … gewesen', 'formes clés')}
• ${aide('Frage: ob / Fragewort + Verb am Ende · Aufforderung: solle + Infinitiv', 'questions et ordres rapportés')}` },
      questions: [
        hints(fill('q1', aide('Ergänzen Sie den Konjunktiv I.', 'Complétez au Konjunktiv I.'),
          'Die Ministerin sagt, sie [[1]] keine Zeit. · Der Sprecher erklärt, das Gesetz [[2]] schon fertig. · Die Forscherin meint, man [[3]] Falschmeldungen erkennen. · Der Lehrer betont, es [[4]] um Vertrauen.',
          [['habe'], ['sei'], ['könne'], ['gehe']],
          aide('3. Person Singular: Verbstamm + -e (hab-e, könn-e, geh-e). „Sein“ ist unregelmäßig: er/sie/es sei. Diese Formen unterscheiden sich vom Indikativ (hat, ist, kann, geht) und zeigen klar die indirekte Rede.',
            '3e personne : radical + -e ; sein → sei.')),
        'haben', 'sein', 'können', 'gehen'),
        hints(fill('q2', aide('Konjunktiv I oder Ersatzform? Ergänzen Sie.', 'Konjunktiv I ou forme de remplacement ? Complétez.'),
          'Die Schüler sagen, sie [[1]] zu wenig Zeit für Medienbildung. · Die Eltern erklären, sie [[2]] heute etwas später.',
          [['hätten'], ['kämen']],
          aide('„Sie haben“ und „sie kommen“ wären im Konjunktiv I identisch mit dem Indikativ. Deshalb nimmt man den Konjunktiv II: hätten, kämen. Möglich wäre auch „würden … kommen“, das passt aber nicht in eine Lücke.',
            'Konjunktiv I = indicatif → Konjunktiv II : hätten, kämen.')),
        'haben', 'kommen'),
        choice('q3', aide('„Ich habe die Nachricht nicht geteilt“, sagt Tim. Welche Wiedergabe ist richtig?', 'Quelle version rapportée est correcte ?'),
          [['Tim sagt, ich habe die Nachricht nicht geteilt.'], ['Tim sagt, er hätte die Nachricht nicht geteilt haben.'],
            ['Tim sagt, er sei die Nachricht nicht geteilt.'], ['Tim sagt, er habe die Nachricht nicht geteilt.', true]],
          aide('Das Pronomen wechselt (ich → er), und die Vergangenheit bildet man mit „habe“ + Partizip II, weil „teilen“ das Perfekt mit „haben“ bildet. „Sei … geteilt“ wäre falsch, „hätte … geteilt haben“ doppelt.',
            'ich → er ; habe + participe II.')),
        order('q4', C2.ordnen, [['Die Forscherin', 'erklärte,', 'viele Nutzer', 'teilten', 'Artikel,', 'ohne', 'sie', 'gelesen', 'zu haben.']],
          aide('Indirekte Rede ohne „dass“: Nach dem Komma folgt ein Hauptsatz mit dem Verb an zweiter Stelle (viele Nutzer teilten). „Teilten“ ersetzt den Konjunktiv I „teilen“. Der Infinitivsatz mit „ohne … zu“ endet mit „gelesen zu haben“.',
            'Sans « dass », verbe en 2e position ; « ohne … zu haben » à la fin.')),
        hints(fill('q5', aide('Vergangenheit in der indirekten Rede: Ergänzen Sie.', 'Le passé au discours indirect : complétez.'),
          '„Ich war gestern im Büro“, sagt er. → Er sagt, er [[1]] gestern im Büro [[2]]. · „Wir haben das Foto geprüft“, sagen sie. → Sie sagen, sie [[3]] das Foto geprüft.',
          [['sei'], ['gewesen'], ['hätten']],
          aide('Präteritum und Perfekt werden gleich wiedergegeben: Konjunktiv von „sein“ oder „haben“ + Partizip II. „Er sei … gewesen“. Bei „sie“ (Plural) wäre „haben“ identisch mit dem Indikativ, also „hätten“.',
            'er sei … gewesen ; sie hätten … geprüft.')),
        'sein', null, 'haben'),
        choice('q6', aide('„Woher stammt das Foto?“, fragt die Journalistin. Welche Wiedergabe ist richtig?', 'Quelle version rapportée est correcte ?'),
          [['Die Journalistin fragt, woher stamme das Foto.'], ['Die Journalistin fragt, woher das Foto stamme.', true],
            ['Die Journalistin fragt, ob das Foto woher stamme.'], ['Die Journalistin fragt, dass das Foto woher stamme.']],
          aide('Eine W-Frage wird mit dem Fragewort eingeleitet, das Verb steht am Ende: woher das Foto stamme. „Ob“ nimmt man nur bei Ja-Nein-Fragen, „dass“ nie bei Fragen.',
            'Question en W : mot interrogatif, verbe à la fin.')),
        choice('q7', aide('„Prüfen Sie zuerst die Quelle!“, rät der Lehrer. Welche Wiedergabe ist richtig?', 'Quelle version rapportée est correcte ?'),
          [['Der Lehrer rät, man solle zuerst die Quelle prüfen.', true], ['Der Lehrer rät, prüfen Sie zuerst die Quelle sei.'],
            ['Der Lehrer rät, man solle die Quelle zuerst gründlich prüft.'], ['Der Lehrer rät, man sei zuerst die Quelle prüfen.']],
          aide('Aufforderungen gibt man mit „sollen“ im Konjunktiv I wieder: man solle + Infinitiv am Ende (prüfen). Der Imperativ „Prüfen Sie“ bleibt in der indirekten Rede nicht stehen.',
            'Ordre rapporté : solle + infinitif.')),
        match('q8', aide('Was bedeuten die Redeverben? Ordnen Sie zu.', 'Que signifient ces verbes introducteurs ? Associez.'),
          [['behaupten', 'etwas als wahr darstellen, ohne Beweis'], ['bestätigen', 'sagen, dass etwas stimmt'], ['einräumen', 'etwas zugeben'],
            ['bestreiten', 'sagen, dass etwas nicht stimmt'], ['betonen', 'etwas besonders hervorheben']],
          aide('Redeverben zeigen, wie die Person spricht, und machen einen Bericht genauer als „sagen“. Vorsicht: „behaupten“ klingt oft skeptisch, als ob man der Aussage nicht ganz glaubt.',
            'affirmer, confirmer, admettre, contester, souligner.')),
        fill('q9', aide('Passen Sie Pronomen und Ortsangabe an.', 'Adaptez le possessif et l’indication de lieu.'),
          '„Mein Team hat das hier geprüft“, sagt die Faktenprüferin. → Die Faktenprüferin sagt, [[1]] Team habe das [[2]] geprüft.',
          [['ihr'], ['dort']],
          aide('Aus der Sicht der Berichtenden wird „mein“ zu „ihr“ (die Faktenprüferin ist eine Frau) und „hier“ zu „dort“, weil die Berichtende nicht am selben Ort ist.',
            'mon → son (ihr, car c’est une femme) ; ici → là-bas.')),
        choice('q10', aide('Welches Wort passt? „___ der Studie erkennen viele Jugendliche Falschmeldungen nicht.“', 'Quel mot convient ?'),
          [['Zufolge'], ['Wegen'], ['Laut', true], ['Trotz']],
          aide('„Laut der Studie“ gibt die Quelle an. „Zufolge“ ist richtig, steht aber nach dem Nomen: der Studie zufolge. „Wegen“ und „trotz“ nennen Grund und Gegengrund, keine Quelle.',
            'laut + nom ; zufolge se place après le nom.')),
      ] },

    // 7 · Lexique
    { id: 'b2-medien-wortschatz', kind: 'exercise', title: 'Wortschatz: Nachrichten, Netz und Daten', estimatedMinutes: 12,
      competences: ['lecture', 'expression-ecrite'],
      lesson: { description: `${aide('Lernen Sie die Wörter der Medienwelt in festen Verbindungen und Wortfamilien.', 'Apprenez le vocabulaire des médias en collocations et en familles de mots.')}

TIPP
[fr?] Conseil
${aide('Viele Medienwörter sind Komposita: die Falsch-meldung, die Schlag-zeile, der Fakten-check. Zerlegen Sie ein langes Wort in seine Teile; das letzte Wort bestimmt den Artikel.', 'Beaucoup de mots des médias sont composés : décomposez-les ; le dernier élément donne l’article.')}` },
      questions: [
        match('q1', aide('Welches Verb passt? Ordnen Sie zu.', 'Quel verbe convient ? Associez.'),
          [['eine Quelle', 'prüfen'], ['eine Falschmeldung', 'verbreiten'], ['seine Daten', 'anfordern'], ['eine Einwilligung', 'widerrufen'],
            ['Aufmerksamkeit', 'erregen']],
          aide('Feste Verbindungen aus dem Modul: eine Quelle prüfen, eine Falschmeldung verbreiten, seine Daten anfordern (wie Linus), eine Einwilligung widerrufen, Aufmerksamkeit erregen.',
            'vérifier une source, propager une fausse information, demander ses données, retirer un consentement, attirer l’attention.')),
        fill('q2', aide('Bilden Sie das Nomen mit Artikel „die“.', 'Formez le nom (féminin).'),
          'glaubwürdig → die [[1]] · manipulieren → die [[2]] · verbreiten → die [[3]] · einwilligen → die [[4]] · behaupten → die [[5]]',
          [['Glaubwürdigkeit'], ['Manipulation'], ['Verbreitung'], ['Einwilligung'], ['Behauptung']],
          aide('Adjektive auf -ig bilden Nomen auf -keit (Glaubwürdigkeit). Verben auf -ieren bilden oft Nomen auf -ation (Manipulation). Die anderen Verben bilden Nomen auf -ung. Alle sind feminin.',
            '-ig → -keit ; -ieren → -ation ; sinon -ung.')),
        choice('q3', aide('Was ist eine „reißerische Schlagzeile“?', 'Qu’est-ce qu’une « reißerische Schlagzeile » ?'),
          [['eine sachliche Überschrift ohne jede Wertung'], ['eine übertriebene Überschrift, die auffallen soll', true], ['eine Überschrift, die man nicht drucken darf'],
            ['eine Überschrift über einen Unfall']],
          aide('„Reißerisch“ beschreibt einen Stil, der mit Übertreibung und Gefühl Aufmerksamkeit erregen will. Solche Überschriften werden besonders oft geklickt und geteilt.',
            'reißerisch = racoleur, sensationnaliste.')),
        choice('q4', aide('Die Überschrift ist „irreführend“. Was bedeutet das?', 'Que signifie « irreführend » ?'),
          [['Sie ist sehr lang und kompliziert.'], ['Sie ist in einer fremden Sprache.'], ['Sie ist sachlich und genau.'],
            ['Sie erweckt einen falschen Eindruck.', true]],
          aide('„Irreführend“ kommt von „in die Irre führen“: Man glaubt etwas Falsches. Eine irreführende Überschrift muss nicht direkt lügen; sie lässt aber etwas anders erscheinen, als es ist.',
            'irreführend = trompeur.')),
        fill('q5', aide('Ergänzen Sie die Präposition.', 'Complétez avec la préposition.'),
          'Fachleute warnen [[1]] gefälschten Videos. · Viele zweifeln [[2]] der Glaubwürdigkeit dieser Seite. · Die Studie beruht [[3]] einer Befragung von 2 000 Jugendlichen.',
          [['vor'], ['an'], ['auf']],
          aide('Warnen vor + Dativ, zweifeln an + Dativ, beruhen auf + Dativ. Die Präpositionen sind fest und lassen sich nicht aus dem Französischen ableiten.',
            'mettre en garde contre = warnen vor ; douter de = zweifeln an ; reposer sur = beruhen auf.')),
        choice('q6', aide('Sie möchten eine Information neutral wiedergeben. Welcher Satz passt?', 'Vous voulez rapporter une information de façon neutre. Quelle phrase convient ?'),
          [['Die Polizei lügt bestimmt, wenn sie behauptet, es gab keine Verletzten.'], ['Die Polizei hat endlich zugegeben, dass es keine Verletzten gab.'],
            ['Nach Angaben der Polizei gab es bei dem Brand keine Verletzten.', true], ['Angeblich soll es laut Gerüchten gar keine Verletzten gegeben haben.']],
          aide('„Nach Angaben der Polizei“ nennt die Quelle, ohne zu werten. „Lügt bestimmt“ und „endlich zugegeben“ enthalten eine Bewertung, und „angeblich … laut Gerüchten“ macht die Information unglaubwürdig.',
            '« nach Angaben » = selon (source neutre).')),
      ] },

    // 8 · Second document (thème pair) : une dépêche au discours indirect
    { id: 'b2-medien-lesen2', kind: 'exercise', title: 'Verstehen: eine Meldung über eine Studie', estimatedMinutes: 18,
      competences: ['lecture'],
      lesson: { description: `${C2.lesen}

STRATEGIE
[fr?] Stratégie
${aide('Eine Nachrichtenmeldung beginnt mit dem Wichtigsten. Danach kommen Einzelheiten und Stimmen. Fragen Sie bei jedem Absatz: Wer sagt das? Ist das eine Tatsache, ein Ergebnis oder eine Forderung?', 'Une dépêche commence par l’essentiel, puis donne détails et réactions. Demandez-vous : qui parle ? fait, résultat ou revendication ?')}

STUDIE: VIELE JUGENDLICHE ERKENNEN FALSCHMELDUNGEN NICHT
Forschende fordern mehr Medienbildung an den Schulen

Viele Jugendliche haben Schwierigkeiten, Falschmeldungen im Internet zu erkennen. Das geht aus einer Studie hervor, die ein Institut für Medienbildung am Dienstag vorgestellt hat. Für die Untersuchung hatten die Forschenden rund 2 000 Schülerinnen und Schüler zwischen 14 und 18 Jahren befragt.

Die Jugendlichen bekamen zwölf Beiträge aus sozialen Netzwerken gezeigt, darunter sechs Falschmeldungen. Nur knapp ein Drittel habe mindestens fünf der sechs falschen Beiträge richtig erkannt, teilte das Institut mit. Besonders schwer sei es den Befragten gefallen, bezahlte Werbung von unabhängigen Informationen zu unterscheiden. Viele hätten außerdem angegeben, sie würden einem Beitrag eher glauben, wenn er sehr oft geteilt worden sei. Ein Beispiel aus dem Test: Ein Foto, das angeblich einen Hai auf einer überfluteten Autobahn zeigte, hielt fast die Hälfte der Befragten für echt.

Studienleiterin Miriam Thalheim betonte, die Ergebnisse seien kein Grund, der jungen Generation die Schuld zu geben. „Erwachsene schneiden in ähnlichen Tests nicht besser ab“, sagte sie. Das Problem sei vielmehr, dass Medienbildung an vielen Schulen nur am Rande vorkomme. Sie forderte, das Prüfen von Quellen müsse in allen Fächern geübt werden, nicht nur im Deutschunterricht.

Positiv bewertete Thalheim, dass fast drei Viertel der Befragten mehr über das Thema lernen wollten. Jugendliche, die in der Schule bereits an einem Projekt zum Thema teilgenommen hatten, schnitten der Studie zufolge deutlich besser ab.

Ein Sprecher des Kultusministeriums erklärte auf Nachfrage, man nehme die Ergebnisse ernst. Medienbildung sei bereits seit einigen Jahren Teil der Lehrpläne. Man prüfe derzeit, wie Lehrkräfte besser fortgebildet werden könnten. Konkrete Pläne nannte er nicht.

Kritik kam von einer Lehrergewerkschaft. Deren Vorsitzende sagte, die Schulen hätten weder genug Zeit noch genug Personal für zusätzliche Aufgaben. Wer mehr Medienbildung wolle, müsse auch mehr Unterrichtsstunden dafür einplanen.` },
      placements: [{ media: 'b2-medien-lesen2-meldung', caption: 'Meldung: Studie zu Falschmeldungen' }],
      questions: [
        match('q1', aide('Wer sagt was? Ordnen Sie zu.', 'Qui dit quoi ? Associez.'),
          [['das Institut', 'Nur ein Drittel habe fast alle Fälschungen erkannt.'], ['die Studienleiterin', 'Quellenprüfung gehöre in alle Fächer.'],
            ['der Sprecher des Ministeriums', 'Medienbildung stehe schon im Lehrplan.'], ['die Gewerkschaftsvorsitzende', 'Den Schulen fehlten Zeit und Personal.']],
          aide('Die Meldung ordnet jede Aussage einer Quelle zu: „teilte das Institut mit“, „Sie forderte …“ (Thalheim), „Ein Sprecher des Kultusministeriums erklärte …“, „Deren Vorsitzende sagte …“. Genau darauf achtet man beim Lesen von Nachrichten.',
            'Chaque propos est attribué à une source.')),
        choice('q2', aide('Was fiel den Jugendlichen laut Studie besonders schwer?', 'Qu’est-ce qui a été particulièrement difficile pour les jeunes ?'),
          [['Werbung von unabhängigen Informationen zu unterscheiden.', true], ['die Beiträge in der vorgegebenen Zeit zu lesen.'],
            ['Fotos und Videos auf dem Handy zu öffnen.'], ['Fragen über ihre eigene Mediennutzung zu beantworten.']],
          aide('„Besonders schwer sei es den Befragten gefallen, bezahlte Werbung von unabhängigen Informationen zu unterscheiden.“ Die anderen Antworten kommen in der Meldung nicht vor.',
            'Distinguer publicité payée et information indépendante.')),
        choice('q3', aide('Was betont Studienleiterin Thalheim?', 'Que souligne la responsable de l’étude ?'),
          [['Die Jugendlichen seien selbst schuld an den Ergebnissen.'], ['Erwachsene erkennen Fälschungen deutlich besser als Junge.'],
            ['Das Problem liege bei der Medienbildung, nicht bei den Jugendlichen.', true], ['Der Deutschunterricht reiche für die Medienbildung an Schulen völlig aus.']],
          aide('Sie betont, die Ergebnisse seien „kein Grund, der jungen Generation die Schuld zu geben“; Erwachsene schnitten nicht besser ab. Das Problem sei, dass Medienbildung „nur am Rande vorkomme“, und sie fordert sie in allen Fächern, nicht nur in Deutsch.',
            'Pas la faute des jeunes : le problème est la place de l’éducation aux médias.')),
        rf('q4', 'Das Ministerium hat angekündigt, im nächsten Schuljahr mehr Stunden für Medienbildung einzuplanen.', 'f',
          aide('Falsch: Der Sprecher sagt nur, man prüfe, wie Lehrkräfte besser fortgebildet werden könnten. „Konkrete Pläne nannte er nicht.“ Mehr Stunden fordert die Gewerkschaft.',
            'Faux : aucun plan concret ; ce sont les enseignants qui demandent des heures.')),
        rf('q5', 'Jugendliche, die schon an einem Schulprojekt zum Thema teilgenommen hatten, erkannten Falschmeldungen besser.', 'r',
          aide('Richtig: Sie „schnitten der Studie zufolge deutlich besser ab“. „Gut / schlecht abschneiden“ heißt: ein gutes oder schlechtes Ergebnis haben.',
            'Vrai : « besser abschneiden » = obtenir de meilleurs résultats.')),
        choice('q6', aide('Warum stehen in dieser Meldung so viele Verben im Konjunktiv (habe, sei, müsse)?', 'Pourquoi tant de verbes au subjonctif dans cette dépêche ?'),
          [['Die Meldung gibt fremde Aussagen wieder, ohne sie zu bewerten.', true], ['Die Meldung zweifelt ganz offen an den Ergebnissen der neuen Studie.'],
            ['Die Meldung beschreibt Ereignisse in der fernen Zukunft.'], ['Die Meldung ist absichtlich sehr höflich formuliert.']],
          aide('Der Konjunktiv I zeigt in Nachrichten: Das sagt die Quelle, nicht die Redaktion. Er ist neutral und drückt keinen Zweifel aus; Zweifel würde man zum Beispiel mit „angeblich“ zeigen.',
            'Le Konjunktiv I est neutre : il attribue le propos à sa source.')),
        fill('q7', aide('Ergänzen Sie mit Wörtern aus der Meldung.', 'Complétez avec des mots de la dépêche.'),
          'Viele würden einem Beitrag eher glauben, wenn er sehr oft [[1]] worden sei. · Ein Foto, das angeblich einen [[2]] auf einer Autobahn zeigte, hielt fast die Hälfte für echt.',
          [['geteilt'], ['Hai']],
          aide('„Wenn er sehr oft geteilt worden sei“: Passiv in der Vergangenheit im Konjunktiv I. „Angeblich“ zeigt, dass das Foto nur behauptet, einen Hai zu zeigen: Es war eine Fälschung.',
            '« angeblich » = soi-disant.')),
      ] },

    // 9 · Vérifier
    { id: 'b2-medien-kontrolle', kind: 'exercise', title: 'Prüfen: Meldungen, Daten und indirekte Rede', estimatedMinutes: 14,
      competences: ['lecture', 'ecoute'],
      lesson: { description: `${aide('Prüfen Sie, was Sie in diesem Modul gelernt haben: Hören, Grammatik und Wortschatz.', 'Vérifiez ce que vous avez appris dans ce module : écoute, grammaire et vocabulaire.')}

${aide('Für die Fragen 1 und 2 hören Sie eine Meldung aus den Radionachrichten.', 'Pour les questions 1 et 2, écoutez une brève du journal radio.')}` },
      placements: [{ media: 'b2-medien-kontrolle-audio', caption: 'Radionachrichten' }],
      questions: [
        choice('q1', aide('Was sagt die Polizei über die Videos im Netz?', 'Que dit la police des vidéos qui circulent ?'),
          [['Sie zeigen Explosionen in der Lagerhalle.'], ['Sie zeigen gar nicht diesen Brand.', true], ['Sie wurden von der Feuerwehr gedreht.'],
            ['Sie sollen sofort gelöscht werden.']],
          aide('„Videos, die … angeblich Explosionen in der Halle zeigen, stammen nach Angaben der Polizei nicht von diesem Brand.“ „Angeblich“ zeigt schon den Zweifel. Vom Löschen ist nicht die Rede.',
            'Les vidéos ne viennent pas de cet incendie.')),
        choice('q2', aide('Was sagt die Polizei zur Ursache des Brandes?', 'Que dit la police de la cause de l’incendie ?'),
          [['Ein technischer Defekt sei die Ursache.'], ['Die Ursache sei längst geklärt.'], ['Ein Zeuge habe alles gefilmt.'],
            ['Brandstiftung sei nicht ausgeschlossen.', true]],
          aide('„Ein Sprecher der Polizei sagte, man schließe Brandstiftung bisher nicht aus.“ Die Ursache ist „weiter unklar“, und die Polizei sucht noch Zeugen.',
            'La police n’exclut pas un incendie criminel.')),
        hints(fill('q3', aide('Geben Sie die Aussage im Konjunktiv I wieder.', 'Rapportez au Konjunktiv I.'),
          '„Wir prüfen alle Hinweise“, sagt die Polizei. → Die Polizei sagt, sie [[1]] alle Hinweise.',
          [['prüfe']],
          aide('Die Polizei ist grammatisch ein Singular (sie = die Polizei): Konjunktiv I „prüfe“. Nur wenn man an die einzelnen Polizisten denkt (Plural), heißt es „sie prüften“.',
            'die Polizei = singulier : sie prüfe.')),
        'prüfen'),
        order('q4', C2.ordnen, [['Der Sprecher', 'der Polizei', 'sagte,', 'man', 'schließe', 'Brandstiftung', 'bisher nicht', 'aus.']],
          aide('Indirekte Rede ohne „dass“: Das Verb „schließe“ steht an zweiter Stelle, die Partikel „aus“ des trennbaren Verbs „ausschließen“ am Ende. „Nicht“ steht vor der Partikel.',
            'Verbe à particule : « aus » à la fin.')),
        hints(fill('q5', aide('Ergänzen Sie die Ersatzform.', 'Complétez avec la forme de remplacement.'),
          '„Die Videos haben nichts mit dem Brand zu tun“, sagt die Polizei. → Die Polizei sagt, die Videos [[1]] nichts mit dem Brand zu tun.',
          [['hätten']],
          aide('„Die Videos“ ist Plural: Der Konjunktiv I „haben“ sähe aus wie der Indikativ. Deshalb steht der Konjunktiv II „hätten“.',
            'Pluriel : haben → hätten.')),
        'haben'),
        choice('q6', aide('Was bedeutet „Videos, die im Netz kursieren“?', 'Que signifie « kursieren » ?'),
          [['Videos, die gelöscht wurden'], ['Videos, die viele weitergeben', true], ['Videos, die sehr kurz sind'], ['Videos, die die Polizei zeigt']],
          aide('„Kursieren“ heißt: im Umlauf sein, von vielen Menschen weitergegeben werden. Man sagt es oft von Gerüchten, Videos oder Falschmeldungen.',
            'kursieren = circuler.')),
        choice('q7', aide('„Ich habe das Video nicht gefälscht“, behauptet der Nutzer. Welcher Bericht ist richtig?', 'Quelle version rapportée est correcte ?'),
          [['Der Nutzer behauptet, er hat das Video nicht gefälscht haben.'], ['Der Nutzer behauptet, er habe das Video nicht gefälscht.', true],
            ['Der Nutzer behauptet, ich habe das Video nicht gefälscht.'], ['Der Nutzer behauptet, er sei das Video nicht gefälscht.']],
          aide('Pronomen anpassen (ich → er) und Vergangenheit mit „habe“ + Partizip II. „Fälschen“ bildet das Perfekt mit „haben“, deshalb nicht „sei“.',
            'er habe … gefälscht.')),
        choice('q8', aide('Welches Recht haben Sie nach der Datenschutz-Grundverordnung?', 'Quel droit avez-vous selon le RGPD ?'),
          [['Sie können verlangen, dass eine App immer kostenlos bleibt.'], ['Sie dürfen die Daten anderer Nutzer jederzeit einsehen.'],
            ['Sie müssen jede Einwilligung schriftlich und per Post abgeben.'], ['Sie können Auskunft über Ihre gespeicherten Daten verlangen.', true]],
          aide('Frau Asmussen nennt das Recht auf Auskunft, das Recht auf Löschung und das Recht, eine Einwilligung zu widerrufen. Ein Recht auf Gratis-Apps oder auf die Daten anderer gibt es nicht.',
            'Droit d’accès à ses propres données.')),
      ] },
  ],
};
