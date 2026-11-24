// Module B2 n° 7 · thème « Gesundheit » (lot R6). Stress, sommeil et système de santé : un article argumentatif sur le
// manque de sommeil (position du texte, inférence), une émission de radio sur le stress au travail (prise de notes
// longue), un guide pratique « où consulter ? » (second document, thème pair : -lesen2). Grammaire : indem (le moyen),
// sodass et so … dass (la conséquence), je … desto en rappel, verbes de modalité au sens subjectif (muss, dürfte,
// kann/könnte, soll, will), y compris au passé (Infinitiv Perfekt).
// Consignes, règles et explications en allemand avec aide française repliée ([fr?]) ; lexique traduit en français.
import { C2, aide, choice, fill, order, match } from '../../lib.mjs';

/** « Richtig / falsch / steht nicht im Text » : r, f ou n pour la bonne réponse. */
const rf = (id, statement, answer, explanation) => choice(id, `„${statement}“ ${C2.richtigFalsch}`,
  [['richtig', answer === 'r'], ['falsch', answer === 'f'], ['steht nicht im Text', answer === 'n']], explanation);
/** Indices affichés sous les trous d'un fill (forme de base à transformer). */
const hints = (question, ...values) => ({ ...question,
  blanks: question.blanks.map((blank, index) => (values[index] ? { ...blank, hint: values[index] } : blank)) });

export default {
  id: 'b2-gesundheit',
  title: 'Gesundheit: Stress, Schlaf und Erholung',
  objective: 'Comprendre un article argumentatif sur le manque de sommeil et une émission sur le stress au travail, s’orienter dans le système de santé, dire comment on atteint un but (indem) et quelle en est la conséquence (sodass, so … dass), exprimer une supposition avec les verbes de modalité au sens subjectif (muss, dürfte, kann, soll).',
  grammarFocus: ['indem-sodass', 'modalverben-subjektiv'],
  sources: [
    'Textes, dialogues et exercices originaux LinguaCap. Personnes, émission et enquête sont fictives ; les chiffres sont arrondis. Les conseils de santé restent généraux et ne remplacent pas un avis médical.',
  ],

  vocabulary: [
    { word: 'Schlafmangel', article: 'der', plural: null, partOfSpeech: 'noun', translation: 'le manque de sommeil',
      example: 'Schlafmangel kann auf Dauer krank machen.', note: 'sans pluriel' },
    { word: 'Erschöpfung', article: 'die', plural: null, partOfSpeech: 'noun', translation: 'l’épuisement',
      example: 'Nach der Nachtschicht spürte sie eine tiefe Erschöpfung.', note: 'erschöpft sein : être épuisé' },
    { word: 'Belastung', article: 'die', plural: 'Belastungen', partOfSpeech: 'noun', translation: 'la charge, la pression (psychique ou physique)',
      example: 'Die Belastung in der Pflege ist seit Jahren hoch.', note: 'belasten : peser sur, accabler' },
    { word: 'Erholung', article: 'die', plural: null, partOfSpeech: 'noun', translation: 'le repos, la récupération',
      example: 'Ohne Erholungsphasen wird Stress gefährlich.', note: 'sich erholen : se reposer, récupérer' },
    { word: 'Warnsignal', article: 'das', plural: 'Warnsignale', partOfSpeech: 'noun', translation: 'le signal d’alarme',
      example: 'Schlechter Schlaf ist oft das erste Warnsignal.', note: null },
    { word: 'Ursache', article: 'die', plural: 'Ursachen', partOfSpeech: 'noun', translation: 'la cause',
      example: 'Die Ursachen liegen oft nicht im Schlafzimmer.', note: 'die Folge : la conséquence' },
    { word: 'Folge', article: 'die', plural: 'Folgen', partOfSpeech: 'noun', translation: 'la conséquence',
      example: 'Die Folgen von Schlafmangel sind gut erforscht.', note: 'zur Folge haben : avoir pour conséquence' },
    { word: 'Schichtdienst', article: 'der', plural: null, partOfSpeech: 'noun', translation: 'le travail posté, les horaires en équipes',
      example: 'Im Schichtdienst ist ein fester Schlafrhythmus schwierig.', note: 'die Nachtschicht : l’équipe de nuit' },
    { word: 'Rhythmus', article: 'der', plural: 'Rhythmen', partOfSpeech: 'noun', translation: 'le rythme',
      example: 'Der Körper braucht einen festen Rhythmus.', note: 'der Schlafrhythmus' },
    { word: 'abschalten', partOfSpeech: 'verb', translation: 'décrocher, se déconnecter (mentalement) ; éteindre',
      example: 'Am Wochenende kann ich einfach nicht mehr abschalten.', note: 'séparable : ab|schalten' },
    { word: 'Stress abbauen', partOfSpeech: 'expression', translation: 'réduire le stress, évacuer le stress',
      example: 'Viele bauen Stress ab, indem sie Sport treiben.', note: 'séparable : ab|bauen' },
    { word: 'unter Druck stehen', partOfSpeech: 'expression', translation: 'être sous pression',
      example: 'Im Kundenservice stehen viele ständig unter Druck.', note: 'stand, hat gestanden' },
    { word: 'erreichbar sein', partOfSpeech: 'expression', translation: 'être joignable',
      example: 'Nach Feierabend muss niemand erreichbar sein.', note: 'die Erreichbarkeit : le fait d’être joignable' },
    { word: 'nachlassen', partOfSpeech: 'verb', translation: 'diminuer, baisser (force, attention)',
      example: 'Nach einer kurzen Nacht lässt die Konzentration schnell nach.', note: 'séparable : nach|lassen' },
    { word: 'sich auswirken auf', partOfSpeech: 'verb', translation: 'avoir des effets sur',
      example: 'Stress wirkt sich auch auf den Schlaf aus.', note: '+ accusatif ; séparable : aus|wirken' },
    { word: 'leiden unter', partOfSpeech: 'verb', translation: 'souffrir de (une situation)',
      example: 'Viele Beschäftigte leiden unter Zeitdruck.', note: '+ datif ; litt, hat gelitten ; leiden an : souffrir d’une maladie' },
    { word: 'vorbeugen', partOfSpeech: 'verb', translation: 'prévenir (une maladie, un risque)',
      example: 'Bewegung beugt Rückenschmerzen vor.', note: '+ datif ; séparable : vor|beugen' },
    { word: 'gereizt', partOfSpeech: 'adjective', translation: 'irritable, à cran',
      example: 'Wer zu wenig schläft, ist oft gereizt.', note: null },
    { word: 'ausgeschlafen', partOfSpeech: 'adjective', translation: 'reposé (après avoir assez dormi)',
      example: 'Heute bin ich endlich einmal ausgeschlafen.', note: 'ausschlafen : faire la grasse matinée, dormir assez' },
    { word: 'umstritten', partOfSpeech: 'adjective', translation: 'controversé',
      example: 'Ob ein Mittagsschlaf die Leistung steigert, ist umstritten.', note: null },
    { word: 'Bereitschaftsdienst', article: 'der', plural: 'Bereitschaftsdienste', partOfSpeech: 'noun', translation: 'le service médical de garde',
      example: 'Am Wochenende hilft der ärztliche Bereitschaftsdienst.', note: null },
    { word: 'Notaufnahme', article: 'die', plural: 'Notaufnahmen', partOfSpeech: 'noun', translation: 'les urgences (service de l’hôpital)',
      example: 'Die Notaufnahme ist für echte Notfälle da.', note: 'der Notfall : l’urgence' },
    { word: 'indem', partOfSpeech: 'conjunction', translation: 'en (+ participe présent), par le fait de',
      example: 'Man baut Stress ab, indem man regelmäßig Pausen macht.', note: 'le moyen ; verbe à la fin' },
    { word: 'sodass', partOfSpeech: 'conjunction', translation: 'si bien que, de sorte que',
      example: 'Er arbeitet nachts, sodass er tagsüber schlafen muss.', note: 'aussi : so dass ; la conséquence ; verbe à la fin' },
    { word: 'vermutlich', partOfSpeech: 'adverb', translation: 'probablement',
      example: 'Vermutlich hat sie den Termin vergessen.', note: 'même sens : wahrscheinlich ; sie dürfte … vergessen haben' },
  ],

  media: [
    { key: 'b2-gesundheit-lesen-artikel', kind: 'image', title: 'Article : « Schlaf ist kein Luxus »',
      alt: 'Page de magazine intitulée « Schlaf ist kein Luxus » : pourquoi tant de gens dorment trop peu, et pourquoi ce n’est pas seulement un problème privé.',
      image: { layout: 'article', kicker: 'Gesundheit', title: 'Schlaf ist kein Luxus', icon: 'moon',
        lead: 'Warum so viele Menschen zu wenig schlafen – und weshalb das nicht nur ein privates Problem ist',
        paragraphs: ['Wer morgens in der U-Bahn in die Gesichter der Mitreisenden schaut, sieht selten ausgeschlafene Menschen. Das ist kein Zufall.'] } },
    { key: 'b2-gesundheit-hoeren-audio', kind: 'audio', title: 'Émission de radio : le stress au travail',
      script: [
        { voice: 'frau2', name: 'Ruth Engelhard', text: 'Guten Tag und herzlich willkommen zu „Gesundheit heute“. Unser Thema: Stress im Beruf. Fast jeder kennt Tage, an denen einfach alles zu viel ist. Aber wann wird Stress gefährlich, und was kann man dagegen tun? Darüber spreche ich mit dem Arbeitspsychologen Doktor Volker Imhof. Guten Tag, Herr Imhof.' },
        { voice: 'mann', name: 'Volker Imhof', text: 'Guten Tag, Frau Engelhard. Danke für die Einladung.' },
        { voice: 'frau2', name: 'Ruth Engelhard', text: 'Herr Imhof, ist Stress eigentlich immer schlecht?' },
        { voice: 'mann', name: 'Volker Imhof', text: 'Nein, und das ist mir wichtig. Kurzfristiger Stress ist sogar nützlich. Vor einer Prüfung oder einem wichtigen Gespräch schüttet der Körper Hormone aus, sodass wir wacher und konzentrierter sind. Problematisch wird es erst, wenn der Stress zum Dauerzustand wird und die Erholungsphasen fehlen.' },
        { voice: 'frau2', name: 'Ruth Engelhard', text: 'Woran merkt man denn, dass es zu viel wird?' },
        { voice: 'mann', name: 'Volker Imhof', text: 'Die ersten Warnsignale sind oft unspektakulär. Man schläft schlechter, ist gereizt und vergisst Dinge, die man früher nie vergessen hätte. Viele bekommen Kopf- oder Rückenschmerzen. Und typisch ist, dass man selbst am Wochenende nicht mehr abschalten kann. Wer schon am Sonntag Bauchschmerzen hat, weil er an den Montag denkt, sollte das ernst nehmen.' },
        { voice: 'frau2', name: 'Ruth Engelhard', text: 'Sind bestimmte Berufe stärker betroffen als andere?' },
        { voice: 'mann', name: 'Volker Imhof', text: 'In unseren Befragungen berichten vor allem Beschäftigte in der Pflege, in der Erziehung und im Kundenservice von hoher Belastung. Dort kommen viel Verantwortung und wenig Einfluss auf den eigenen Arbeitstag zusammen. Aber ehrlich gesagt: Auch im Büro hat der Druck zugenommen. Mit Smartphone und Laptop ist die Arbeit immer dabei.' },
        { voice: 'frau2', name: 'Ruth Engelhard', text: 'Wir haben eine Hörerin am Telefon. Frau Ewert, Sie arbeiten als Krankenpflegerin. Wie erleben Sie das?' },
        { voice: 'frau3', name: 'Nadja Ewert', text: 'Ja, hallo. Also, bei uns auf der Station ist es seit zwei Jahren extrem. Es fehlen drei Kolleginnen, und die Stellen werden einfach nicht besetzt. Letzten Winter war ich so erschöpft, dass ich nach dem Dienst im Auto eingeschlafen bin, noch auf dem Parkplatz. Da habe ich gemerkt: So geht es nicht weiter.' },
        { voice: 'mann', name: 'Volker Imhof', text: 'Das klingt nach einer sehr ernsten Situation. Sie dürften damals schon über Wochen zu wenig geschlafen haben.' },
        { voice: 'frau3', name: 'Nadja Ewert', text: 'Ja, bestimmt. Ich habe dann mit meiner Hausärztin gesprochen und meine Stunden reduziert, von hundert auf achtzig Prozent. Finanziell ist das nicht leicht, aber ich schlafe wieder.' },
        { voice: 'frau2', name: 'Ruth Engelhard', text: 'Herr Imhof, was raten Sie Menschen wie Frau Ewert?' },
        { voice: 'mann', name: 'Volker Imhof', text: 'Zunächst einmal: Frau Ewert hat genau richtig gehandelt, indem sie früh Hilfe gesucht hat. Viele warten viel zu lange. Ansonsten gilt: Man baut Stress nicht ab, indem man am Wochenende alles nachholt. Wirksamer sind kleine, regelmäßige Pausen: fünf Minuten an der frischen Luft, bewusst langsam atmen, das Handy in der Mittagspause in der Tasche lassen.' },
        { voice: 'mann', name: 'Volker Imhof', text: 'Und dann Bewegung. Schon dreimal pro Woche eine halbe Stunde zügiges Gehen senkt das Stressniveau messbar.' },
        { voice: 'frau2', name: 'Ruth Engelhard', text: 'Aber ist das nicht ein bisschen zu einfach? Wenn auf der Station Personal fehlt, hilft auch kein Spaziergang.' },
        { voice: 'mann', name: 'Volker Imhof', text: 'Da haben Sie völlig recht. Individuelle Tipps sind kein Ersatz für bessere Arbeitsbedingungen. Arbeitgeber können sehr viel tun, indem sie zum Beispiel realistische Dienstpläne machen und klare Regeln für die Erreichbarkeit einführen. In Betrieben, die das ernsthaft angehen, sinken die Krankmeldungen deutlich. Das muss also auch im Interesse der Unternehmen liegen.' },
        { voice: 'frau2', name: 'Ruth Engelhard', text: 'Eine letzte Frage: Woran erkennt man, dass man professionelle Hilfe braucht?' },
        { voice: 'mann', name: 'Volker Imhof', text: 'Wenn die Beschwerden länger als zwei bis drei Wochen anhalten, wenn man sich morgens nicht mehr aufraffen kann oder wenn Freunde sagen: Du bist nicht mehr du selbst. Dann sollte man mit der Hausärztin oder dem Hausarzt sprechen. Das ist keine Schwäche, sondern vernünftig.' },
        { voice: 'frau2', name: 'Ruth Engelhard', text: 'Herzlichen Dank, Herr Imhof. Und Ihnen, Frau Ewert, alles Gute! Nach den Nachrichten geht es weiter mit dem Thema Ernährung im Schichtdienst.' },
      ] },
    { key: 'b2-gesundheit-lesen2-karten', kind: 'image', title: 'Guide : où consulter ?',
      alt: 'Quatre fiches : cabinet du médecin traitant, service de garde (116 117), urgences et appel au 112, pharmacie de garde.',
      image: { layout: 'cards', cards: [
        { title: 'Hausarztpraxis', icon: 'stethoscope', lines: ['Erste Anlaufstelle bei fast allen Beschwerden', 'Überweist bei Bedarf an eine Fachpraxis'] },
        { title: 'Bereitschaftsdienst 116 117', icon: 'phone', lines: ['Abends und am Wochenende', 'Wenn es nicht bis zum nächsten Werktag warten kann'] },
        { title: 'Notruf 112', icon: 'ambulance', lines: ['Nur bei lebensbedrohlichen Notfällen', 'Atemnot, Brustschmerzen, schwerer Unfall'] },
        { title: 'Apotheke', icon: 'pill', lines: ['Kostenlose Beratung bei kleineren Beschwerden', 'Notdienst: Aushang an jeder Apotheke'] },
      ] } },
    { key: 'b2-gesundheit-kontrolle-audio', kind: 'audio', title: 'Annonce interne : la journée santé',
      script: [
        { voice: 'sprecherin', name: 'Ansage', text: 'Liebe Kolleginnen und Kollegen, am Donnerstag, dem zwölften März, findet unser Gesundheitstag statt. Von zehn bis fünfzehn Uhr können Sie sich im Erdgeschoss kostenlos beraten lassen: Es gibt einen Rückencheck, eine Ernährungsberatung und einen kurzen Vortrag zum Thema gesunder Schlaf.' },
        { voice: 'sprecherin', name: 'Ansage', text: 'Der Vortrag beginnt um halb zwölf im großen Besprechungsraum. Bitte melden Sie sich bis Montag im Intranet an, denn die Plätze sind begrenzt. Die Teilnahme gilt selbstverständlich als Arbeitszeit.' },
      ] },
  ],

  activities: [
    // 1 · Einstieg
    { id: 'b2-gesundheit-einstieg', kind: 'lesson', title: 'Einstieg: Gesundheit zwischen Stress und Erholung', estimatedMinutes: 10,
      competences: ['lecture', 'expression-orale'],
      lesson: { description: `GESUND BLEIBEN IN EINER GESTRESSTEN WELT
[fr?] Rester en bonne santé dans un monde stressé
${aide('Termine, Mails, Verpflichtungen: Viele Menschen fühlen sich dauerhaft unter Druck und schlafen zu wenig. In diesem Modul geht es um Stress, Schlaf und die Frage, wo man in Deutschland die richtige Hilfe findet.', 'Rendez-vous, courriels, obligations : beaucoup se sentent sous pression en permanence et dorment trop peu. Ce module traite du stress, du sommeil et de la question : où trouver la bonne aide en Allemagne ?')}

FRAGEN ZUM EINSTIEG
[fr?] Questions pour commencer
• ${aide('Wie viele Stunden schlafen Sie in einer normalen Woche? Reicht Ihnen das?', 'Combien d’heures dormez-vous dans une semaine normale ? Est-ce suffisant pour vous ?')}
• ${aide('Was stresst Sie im Alltag am meisten, und was tun Sie dagegen?', 'Qu’est-ce qui vous stresse le plus au quotidien, et que faites-vous contre ?')}
• ${aide('Ist Stress Privatsache, oder tragen auch Arbeitgeber Verantwortung?', 'Le stress est-il une affaire privée, ou les employeurs en sont-ils aussi responsables ?')}
${aide('Überlegen Sie sich zu jeder Frage zwei oder drei Sätze auf Deutsch und begründen Sie Ihre Meinung.', 'Préparez mentalement deux ou trois phrases en allemand par question et justifiez votre avis.')}

ZIELE
[fr?] Objectifs
• ${aide('Ich kann einen argumentierenden Artikel verstehen und die Position des Textes erkennen.', 'Je peux comprendre un article argumentatif et reconnaître la position qu’il défend.')}
• ${aide('Ich kann einem Radiogespräch über Stress die wichtigsten Informationen entnehmen und dabei Notizen machen.', 'Je peux tirer d’une émission de radio sur le stress les informations essentielles, en prenant des notes.')}
• ${aide('Ich kann sagen, wie man ein Ziel erreicht („indem“) und welche Folge etwas hat („sodass“, „so … dass“).', 'Je peux dire comment on atteint un but (« indem ») et quelle conséquence a une chose (« sodass », « so … dass »).')}
• ${aide('Ich kann Vermutungen abstufen: „Das muss …“, „Das dürfte …“, „Das kann …“, „Er soll …“.', 'Je peux nuancer une supposition : certitude, probabilité, possibilité, ouï-dire.')}
• ${aide('Ich kann entscheiden, an welche Stelle im Gesundheitssystem ich mich wenden sollte.', 'Je peux choisir à quel service de santé m’adresser.')}

WICHTIGE WÖRTER
[fr?] Mots-clés
• der Schlafmangel — le manque de sommeil
• die Erschöpfung — l’épuisement
• abschalten — décrocher, se déconnecter
• Stress abbauen — réduire le stress
• unter Druck stehen — être sous pression
• erreichbar sein — être joignable
• der Bereitschaftsdienst — le service médical de garde
• die Notaufnahme — les urgences (à l’hôpital)` } },

    // 2 · Lecture longue : article argumentatif
    { id: 'b2-gesundheit-lesen', kind: 'exercise', title: 'Verstehen: ein Artikel über Schlafmangel', estimatedMinutes: 20,
      competences: ['lecture'],
      lesson: { description: `${C2.lesen}

STRATEGIE
[fr?] Stratégie
1. ${aide('Lesen Sie Überschrift, Unterzeile und den letzten Absatz: Welche Position vertritt der Text?', 'Lisez le titre, le sous-titre et le dernier paragraphe : quelle position le texte défend-il ?')}
2. ${aide('Achten Sie auf Signalwörter wie „allerdings“, „doch“, „zwar … aber“: Dort widerspricht der Text oft einer verbreiteten Meinung.', 'Repérez les mots signaux (« allerdings », « doch », « zwar … aber ») : c’est souvent là que le texte contredit une idée reçue.')}
3. ${aide('Unterscheiden Sie Fakten (Zahlen, Studien) von Meinungen und Bewertungen.', 'Distinguez les faits (chiffres, études) des opinions et des jugements.')}

SCHLAF IST KEIN LUXUS
Warum so viele Menschen zu wenig schlafen – und weshalb das nicht nur ein privates Problem ist

(A) Wer morgens in der U-Bahn in die Gesichter der Mitreisenden schaut, sieht selten ausgeschlafene Menschen. Das ist kein Zufall. Nach einer Umfrage einer großen Krankenkasse schläft rund ein Drittel der Erwachsenen regelmäßig schlecht; jeder Zehnte fühlt sich sogar fast jeden Tag erschöpft. Lange galt Schlafmangel als Privatsache: Wer zu wenig schläft, so die verbreitete Meinung, ist selbst schuld und sollte eben früher ins Bett gehen. Diese Sicht dürfte allerdings zu einfach sein.

(B) Denn die Ursachen liegen oft nicht im Schlafzimmer. Viele Beschäftigte sind auch nach Feierabend erreichbar und lesen abends noch dienstliche E-Mails. Andere arbeiten im Schichtdienst, sodass ihr Körper nie einen festen Rhythmus findet. Hinzu kommen lange Pendelwege, Sorgen um die Miete und Bildschirme, die bis kurz vor dem Einschlafen leuchten. Auch Eltern kleiner Kinder kennen das Problem: Wer nachts mehrmals aufsteht, kommt selten auf sieben Stunden Schlaf. Manche sind abends so erschöpft, dass sie schon vor dem Fernseher einschlafen – und liegen dann um drei Uhr nachts hellwach im Bett. „Der Körper lässt sich nicht auf Knopfdruck abschalten“, erklärt die Schlafforscherin Regine Lohmann. „Wer bis 23 Uhr Mails beantwortet, darf sich nicht wundern, wenn er um Mitternacht noch grübelt.“

(C) Die Folgen sind besser erforscht, als viele denken. Schon nach wenigen Nächten mit fünf statt sieben Stunden Schlaf lassen Konzentration und Reaktionsfähigkeit deutlich nach. Wer übermüdet Auto fährt, reagiert ähnlich langsam wie jemand, der Alkohol getrunken hat. Auf Dauer steigt außerdem das Risiko für Bluthochdruck, Übergewicht und Depressionen. Besonders tückisch ist, dass viele Betroffene ihre Müdigkeit irgendwann gar nicht mehr bemerken: Sie halten den Zustand für normal. Schlafmangel ist also nicht nur unangenehm, er kann krank machen. Und er kostet die Wirtschaft jedes Jahr Milliarden, weil übermüdete Menschen mehr Fehler machen und häufiger ausfallen.

(D) Was hilft? Die üblichen Ratschläge kennt fast jeder: regelmäßige Schlafenszeiten, kein schweres Essen am Abend, das Handy aus dem Schlafzimmer verbannen. Solche Tipps sind sinnvoll, greifen aber zu kurz, solange die Arbeitsbedingungen gleich bleiben. Einige Unternehmen gehen deshalb neue Wege. Sie schützen den Feierabend ihrer Belegschaft, indem sie E-Mails nach 19 Uhr erst am nächsten Morgen zustellen. Andere bieten flexible Arbeitszeiten an oder richten Ruheräume ein, in denen man sich mittags zwanzig Minuten hinlegen kann. In manchen Ländern sollen solche Räume schon lange üblich sein. Ob ein kurzer Mittagsschlaf tatsächlich die Leistung steigert, ist unter Fachleuten zwar umstritten. Klar ist aber: Wer seine Leute nachts in Ruhe lässt, hat tagsüber wachere Kolleginnen und Kollegen.

(E) Natürlich kann kein Arbeitgeber und kein Staat einem Menschen das Schlafen abnehmen. Jeder trägt auch selbst Verantwortung für seine Abende. Doch es wäre ein Fehler, Schlaf weiterhin als Luxus zu betrachten, den man sich erst gönnt, wenn alle Aufgaben erledigt sind. Eine Gesellschaft, die stolz darauf ist, mit wenig Schlaf auszukommen, sollte sich fragen, welchen Preis sie dafür bezahlt. Vielleicht beginnt gesunder Schlaf nicht mit einem teuren Kissen, sondern mit einer einfachen Frage im Büro: Muss das wirklich heute Abend noch sein?` },
      placements: [{ media: 'b2-gesundheit-lesen-artikel', caption: 'Schlaf ist kein Luxus' }],
      questions: [
        choice('q1', aide('Welche Position vertritt der Text insgesamt?', 'Quelle position le texte défend-il dans l’ensemble ?'),
          [['Schlafmangel ist vor allem eine Frage der persönlichen Disziplin.'],
            ['Schlafmangel hat auch gesellschaftliche Ursachen und geht alle an.', true],
            ['Firmen sollten ihren Leuten einen Mittagsschlaf vorschreiben.'],
            ['Gegen Schlafmangel hilft vor allem ein besseres Bett zu Hause.']],
          aide('Der Text widerspricht der Meinung, Schlafmangel sei Privatsache (A), nennt Ursachen in der Arbeitswelt (B) und Kosten für die Wirtschaft (C). Absatz E betont zwar die Eigenverantwortung, fordert aber ein Umdenken der Gesellschaft. Ein Mittagsschlaf wird nirgends gefordert, und das „teure Kissen“ ist gerade nicht die Lösung.',
            'Le texte rejette l’idée d’une affaire purement privée et appelle la société à changer de regard. La sieste n’est jamais imposée, et l’« oreiller coûteux » n’est justement pas la solution.')),
        choice('q2', aide('Wie ist der Satz „Diese Sicht dürfte allerdings zu einfach sein“ (Absatz A) gemeint?', 'Comment comprendre la phrase « Diese Sicht dürfte allerdings zu einfach sein » (paragraphe A) ?'),
          [['Die Umfrage der Krankenkasse ist vermutlich nicht korrekt.'],
            ['Früh ins Bett zu gehen, fällt den meisten Menschen leicht.'],
            ['Wahrscheinlich ist es falsch, nur dem Einzelnen die Schuld zu geben.', true],
            ['Über Schlafmangel sollte man in der Öffentlichkeit nicht sprechen.']],
          aide('„Diese Sicht“ bezieht sich auf die Meinung davor: Wer schlecht schläft, ist selbst schuld. „Dürfte“ drückt eine Vermutung aus (wahrscheinlich), „allerdings“ einen Widerspruch. Die Umfrage selbst wird nicht in Frage gestellt.',
            '« Diese Sicht » renvoie à l’opinion qui précède (chacun est responsable de son manque de sommeil). « dürfte » = probablement ; « allerdings » marque l’objection. L’enquête n’est pas mise en doute.')),
        rf('q3', 'Laut der Umfrage fühlt sich jeder zehnte Erwachsene fast täglich erschöpft.', 'r',
          aide('Richtig: „jeder Zehnte fühlt sich sogar fast jeden Tag erschöpft“. Achtung, nicht verwechseln: Schlecht schläft rund ein Drittel der Erwachsenen.',
            'Vrai : un adulte sur dix se sent épuisé presque tous les jours ; un tiers dort mal.')),
        rf('q4', 'Fachleute sind sich einig, dass ein kurzer Mittagsschlaf die Leistung steigert.', 'f',
          aide('Falsch: „Ob ein kurzer Mittagsschlaf tatsächlich die Leistung steigert, ist unter Fachleuten zwar umstritten.“ Umstritten heißt: Die Fachleute sind sich gerade nicht einig.',
            'Faux : « umstritten » = controversé ; les spécialistes ne sont pas d’accord.')),
        rf('q5', 'Frauen schlafen laut der Umfrage schlechter als Männer.', 'n',
          aide('Steht nicht im Text: Die Umfrage wird nur mit zwei Zahlen zitiert (ein Drittel schläft schlecht, jeder Zehnte ist fast täglich erschöpft). Unterschiede zwischen Frauen und Männern werden nicht erwähnt.',
            'Non mentionné : aucune différence entre femmes et hommes n’est évoquée.')),
        match('q6', aide('Welche Überschrift passt zu welchem Absatz? Ordnen Sie zu.', 'Quel intertitre convient à quel paragraphe ? Associez.'),
          [['Absatz A', 'Ein unterschätztes Problem'], ['Absatz B', 'Ursachen außerhalb des Schlafzimmers'], ['Absatz C', 'Was zu wenig Schlaf anrichtet'],
            ['Absatz D', 'Wenn Betriebe umdenken'], ['Absatz E', 'Eine Frage der Haltung']],
          aide('A stellt das Problem vor und kritisiert die Sicht „Privatsache“; B nennt Ursachen (Erreichbarkeit, Schichtdienst, Pendeln); C beschreibt die Folgen für Gesundheit und Wirtschaft; D zeigt, was Unternehmen ändern; E zieht ein Fazit über unsere Einstellung zum Schlaf.',
            'A : le problème ; B : les causes ; C : les conséquences ; D : ce que changent les entreprises ; E : la conclusion sur notre rapport au sommeil.')),
        fill('q7', aide('Ergänzen Sie mit Informationen aus Absatz D.', 'Complétez avec des informations du paragraphe D.'),
          'Einige Firmen stellen E-Mails, die nach [[1]] Uhr geschrieben werden, erst am nächsten Morgen zu. · „Solche Räume“ sind [[2]], in denen man sich mittags hinlegen kann.',
          [['19', 'neunzehn'], ['Ruheräume']],
          aide('„Indem sie E-Mails nach 19 Uhr erst am nächsten Morgen zustellen“: So schützen die Firmen den Feierabend. „Solche Räume“ verweist zurück auf die „Ruheräume“ im Satz davor; solche Verweise helfen, einen Text zu verstehen.',
            '« Solche Räume » renvoie aux « Ruheräume » (salles de repos) de la phrase précédente.')),
        choice('q8', aide('Warum endet der Text mit der Frage „Muss das wirklich heute Abend noch sein?“', 'Pourquoi le texte se termine-t-il par cette question ?'),
          [['Er kritisiert Menschen, die abends zu früh ins Bett gehen.'],
            ['Er fordert ein Gesetz, das Arbeit nach 19 Uhr verbietet.'],
            ['Er erklärt, warum Arbeit am Abend die Leistung steigert.'],
            ['Er regt an, Arbeit am Abend kritisch zu hinterfragen.', true]],
          aide('Die rhetorische Frage soll zum Nachdenken anregen: Vieles, was abends noch erledigt wird, ist nicht dringend. Der Text fordert kein Gesetz („kein Staat kann einem Menschen das Schlafen abnehmen“) und behauptet nirgends, Abendarbeit steigere die Leistung.',
            'Une question rhétorique invite à réfléchir : beaucoup de tâches du soir ne sont pas urgentes. Aucune loi n’est réclamée.')),
      ] },

    // 3 · Écoute longue : émission de radio avec prise de notes
    { id: 'b2-gesundheit-hoeren', kind: 'exercise', title: 'Verstehen: ein Radiogespräch über Stress im Beruf', estimatedMinutes: 20,
      competences: ['ecoute'],
      lesson: { description: `${C2.hoeren}

SITUATION
[fr?] La situation
${aide('In der Sendung „Gesundheit heute“ spricht die Moderatorin Ruth Engelhard mit dem Arbeitspsychologen Volker Imhof. Eine Hörerin, die Krankenpflegerin Nadja Ewert, ruft an. Das Gespräch dauert etwa vier Minuten.', 'Dans l’émission « Gesundheit heute », l’animatrice Ruth Engelhard reçoit le psychologue du travail Volker Imhof. Une auditrice, l’infirmière Nadja Ewert, appelle. L’échange dure environ quatre minutes.')}

STRATEGIE
[fr?] Stratégie
1. ${aide('Lesen Sie vor dem Hören die Notizen: Welche Art von Information fehlt (Zahl, Nomen, Adjektiv)?', 'Avant l’écoute, lisez les notes : quel type d’information manque (nombre, nom, adjectif) ?')}
2. ${aide('Beim ersten Hören reichen Stichwörter: Ganze Sätze kosten zu viel Zeit.', 'À la première écoute, des mots-clés suffisent : des phrases entières prennent trop de temps.')}
3. ${aide('Achten Sie beim zweiten Hören auf Meinungen und Einschränkungen: „Aber ist das nicht …?“, „Da haben Sie recht, aber …“.', 'À la deuxième écoute, repérez les opinions et les nuances : « Aber ist das nicht … ? », « Da haben Sie recht, aber … ».')}` },
      placements: [{ media: 'b2-gesundheit-hoeren-audio', caption: 'Gesundheit heute: Stress im Beruf' }],
      questions: [
        fill('q1', C2.notizen,
          'Kurzer Stress: macht wacher und [[1]] · Warnsignale: schlechter Schlaf, man ist [[2]], vergisst Dinge, Kopf- oder Rückenschmerzen · besonders belastet: Pflege, Erziehung, [[3]] · Frau Ewert: auf der Station fehlen [[4]] Kolleginnen · neue Arbeitszeit: [[5]] Prozent',
          [['konzentrierter'], ['gereizt'], ['Kundenservice', 'im Kundenservice', 'der Kundenservice'], ['drei', '3'], ['80', 'achtzig']],
          aide('Kurzfristiger Stress macht „wacher und konzentrierter“. Warnsignal: Man ist „gereizt“. Stark belastet sind Pflege, Erziehung und „Kundenservice“. Auf der Station fehlen drei Kolleginnen; Frau Ewert hat ihre Stunden „von hundert auf achtzig Prozent“ reduziert.',
            'konzentrierter : plus concentré ; gereizt : irritable ; der Kundenservice : le service client.')),
        choice('q2', aide('Welche Haltung hat Herr Imhof zum Thema Stress?', 'Quelle est la position de M. Imhof sur le stress ?'),
          [['Stress ist immer schädlich und sollte ganz vermieden werden.'],
            ['Stress betrifft heute fast nur noch Beschäftigte in der Pflege.'],
            ['Stress ist vor allem eine Frage der richtigen Einstellung.'],
            ['Kurzer Stress kann helfen, Dauerstress ohne Erholung schadet.', true]],
          aide('„Kurzfristiger Stress ist sogar nützlich … Problematisch wird es erst, wenn der Stress zum Dauerzustand wird und die Erholungsphasen fehlen.“ Die Pflege nennt er als ein Beispiel unter mehreren, und er sagt ausdrücklich, dass auch im Büro der Druck zugenommen hat.',
            'Le stress ponctuel peut être utile ; c’est le stress permanent sans récupération qui pose problème.')),
        choice('q3', aide('Warum hat Frau Ewert ihre Arbeitszeit reduziert?', 'Pourquoi Mme Ewert a-t-elle réduit son temps de travail ?'),
          [['Sie war so erschöpft, dass sie im Auto eingeschlafen ist.', true],
            ['Ihre Hausärztin hat ihr verboten, weiter Vollzeit zu arbeiten.'],
            ['Auf ihrer Station wurden mehrere Stellen dauerhaft gestrichen.'],
            ['Sie möchte mehr Zeit haben, um eine Weiterbildung zu machen.']],
          aide('„Letzten Winter war ich so erschöpft, dass ich nach dem Dienst im Auto eingeschlafen bin … Da habe ich gemerkt: So geht es nicht weiter.“ Sie hat mit ihrer Hausärztin gesprochen, von einem Verbot ist nicht die Rede. Die Stellen sind nicht gestrichen, sondern nur nicht besetzt.',
            'Elle s’est endormie au volant, épuisée. Le médecin ne lui a rien interdit ; les postes ne sont pas supprimés mais vacants.')),
        choice('q4', aide('Was kritisiert die Moderatorin mit der Frage „Aber ist das nicht ein bisschen zu einfach?“', 'Que critique l’animatrice avec cette question ?'),
          [['Bewegung und Pausen sind wissenschaftlich nicht bewiesen.'],
            ['Persönliche Tipps lösen das Problem des Personalmangels nicht.', true],
            ['Herr Imhof hat die Frage der Hörerin nicht beantwortet.'],
            ['Spaziergänge sind für Pflegekräfte zeitlich nicht möglich.']],
          aide('Sie ergänzt: „Wenn auf der Station Personal fehlt, hilft auch kein Spaziergang.“ Sie zweifelt also nicht an den Tipps selbst, sondern daran, dass sie ohne bessere Arbeitsbedingungen genügen. Herr Imhof gibt ihr recht: „Individuelle Tipps sind kein Ersatz …“',
            'Elle doute que des conseils individuels suffisent quand il manque du personnel.')),
        fill('q5', C2.notizen,
          'Was Arbeitgeber tun können: realistische [[1]] und klare Regeln für die [[2]] · Ergebnis in solchen Betrieben: weniger [[3]] · professionelle Hilfe suchen, wenn die Beschwerden länger als zwei bis [[4]] Wochen anhalten',
          [['Dienstpläne'], ['Erreichbarkeit'], ['Krankmeldungen'], ['drei', '3']],
          aide('„Indem sie zum Beispiel realistische Dienstpläne machen und klare Regeln für die Erreichbarkeit einführen“; dann „sinken die Krankmeldungen deutlich“. Hilfe sucht man, „wenn die Beschwerden länger als zwei bis drei Wochen anhalten“.',
            'der Dienstplan : le planning de service ; die Erreichbarkeit : le fait d’être joignable ; die Krankmeldung : l’arrêt maladie déclaré.')),
        choice('q6', aide('Herr Imhof sagt zu Frau Ewert: „Sie dürften damals schon über Wochen zu wenig geschlafen haben.“ Was drückt er damit aus?', 'Que veut dire M. Imhof par cette phrase ?'),
          [['Er weiß es genau, weil sie es ihm erzählt hat.'],
            ['Er erlaubt ihr nachträglich, weniger zu schlafen.'],
            ['Er vermutet es, ist sich aber nicht ganz sicher.', true],
            ['Er wirft ihr vor, dass sie zu spät reagiert hat.']],
          aide('„Dürfte“ + Infinitiv Perfekt (geschlafen haben) ist eine Vermutung über die Vergangenheit: wahrscheinlich, aber nicht sicher. Mit „dürfen“ im Sinn von Erlaubnis hat das nichts zu tun. Einen Vorwurf macht er nicht, im Gegenteil: Er lobt später, dass sie früh Hilfe gesucht hat.',
            '« dürfte » + infinitif passé = supposition probable sur le passé, pas une permission.')),
      ] },

    // 4 · Grammaire inductive
    { id: 'b2-gesundheit-entdecken', kind: 'exercise', title: 'Entdecken: Mittel, Folge und Vermutung', estimatedMinutes: 10,
      competences: ['lecture'],
      lesson: { description: `${aide('Lesen Sie die Sätze aus dem Artikel und aus dem Radiogespräch. Achten Sie auf die markierten Wörter und auf die Stellung der Verben.', 'Lisez les phrases de l’article et de l’émission. Observez les mots clés et la place des verbes.')}

SÄTZE
[fr?] Le corpus
(1) Andere arbeiten im Schichtdienst, sodass ihr Körper nie einen festen Rhythmus findet.
(2) Letzten Winter war ich so erschöpft, dass ich im Auto eingeschlafen bin.
(3) Frau Ewert hat richtig gehandelt, indem sie früh Hilfe gesucht hat.
(4) Man baut Stress nicht ab, indem man am Wochenende alles nachholt.
(5) Diese Sicht dürfte allerdings zu einfach sein.
(6) Sie dürften damals schon über Wochen zu wenig geschlafen haben.
(7) In manchen Ländern sollen solche Räume schon lange üblich sein.
(8) Das muss also auch im Interesse der Unternehmen liegen.

${aide('Beantworten Sie dann die Fragen. Die Erklärungen formulieren die Regel.', 'Répondez ensuite aux questions : les explications formulent la règle.')}` },
      questions: [
        choice('q1', aide('Sätze 3 und 4: Auf welche Frage antwortet der Nebensatz mit „indem“?', 'Phrases 3 et 4 : à quelle question répond la subordonnée avec « indem » ?'),
          [['Wann? (Zeitpunkt)'], ['Warum? (Grund)'], ['Wie? (Mittel, Methode)', true], ['Wozu? (Ziel)']],
          aide('„Indem“ nennt das Mittel: Wie hat sie richtig gehandelt? – Indem sie früh Hilfe gesucht hat. Das Verb steht am Ende des Nebensatzes. Im Französischen entspricht das meist einem Gérondif.',
            'indem = le moyen, souvent « en + participe présent » : « en cherchant de l’aide tôt ».')),
        choice('q2', aide('Sätze 1 und 2: Was steht im Nebensatz mit „sodass“ bzw. „so …, dass“?', 'Phrases 1 et 2 : qu’exprime la subordonnée avec « sodass » ou « so …, dass » ?'),
          [['ein Ziel, das man erreichen will'], ['eine Folge, ein Ergebnis', true], ['eine Bedingung'], ['ein Gegensatz']],
          aide('Der Nebensatz nennt die Folge: Schichtdienst → kein fester Rhythmus; so erschöpft → im Auto eingeschlafen. Bei „so …, dass“ steht „so“ im Hauptsatz vor dem Adjektiv (so erschöpft). Ein Ziel würde man mit „damit“ oder „um … zu“ ausdrücken.',
            'sodass / so … dass = la conséquence (si bien que, si … que), pas le but (damit).')),
        match('q3', aide('Was drückt das Modalverb in diesen Sätzen aus? Ordnen Sie zu.', 'Qu’exprime le verbe de modalité dans ces phrases ? Associez.'),
          [['Satz 5: „dürfte … sein“', 'Das ist wahrscheinlich.'], ['Satz 7: „sollen … sein“', 'Das sagt man, das wird berichtet.'],
            ['Satz 8: „muss … liegen“', 'Das ist fast sicher, ein logischer Schluss.'], ['„Das kann auch am Wetter liegen.“', 'Das ist möglich.']],
          aide('Hier geht es nicht um Pflicht oder Erlaubnis, sondern darum, wie sicher die Sprecherin ist: muss (fast sicher) – dürfte (wahrscheinlich) – kann/könnte (möglich). „Sollen“ gibt etwas wieder, das andere sagen (Hörensagen).',
            'Sens subjectif : degré de certitude du locuteur. soll = on dit que, il paraît que.')),
        choice('q4', aide('Satz 6: Worauf bezieht sich die Vermutung, und wie wird sie gebildet?', 'Phrase 6 : sur quoi porte la supposition, et comment est-elle formée ?'),
          [['auf die Zukunft: Modalverb + werden'], ['auf die Gegenwart: Modalverb + Infinitiv'], ['auf eine Pflicht: Modalverb im Präteritum'],
            ['auf die Vergangenheit: Modalverb + Infinitiv Perfekt', true]],
          aide('„Dürften … geschlafen haben“: Das Modalverb steht in der Gegenwart (die Vermutung ist jetzt), das Ereignis liegt in der Vergangenheit (Partizip II + haben/sein am Satzende). Ebenso: Er muss den Zug verpasst haben.',
            'Supposition actuelle sur un fait passé : modal + participe II + haben/sein (« elle a dû mal dormir »).')),
      ] },

    // 5 · Règle
    { id: 'b2-gesundheit-regel', kind: 'lesson', title: 'Regel: indem, sodass und subjektive Modalverben', estimatedMinutes: 10,
      competences: ['lecture'],
      lesson: { description: `REGEL — INDEM: DAS MITTEL
[fr?] Règle : indem exprime le moyen
„Indem“ antwortet auf die Frage „Wie? Auf welche Weise?“. Der Nebensatz nennt das Mittel oder die Methode, das konjugierte Verb steht am Ende. Haupt- und Nebensatz haben meist dasselbe Subjekt. Gleiche Bedeutung: „dadurch, dass …“.
[fr?] « indem » correspond souvent au gérondif français « en + participe présent » (en bougeant, en dormant). Verbe conjugué à la fin.
• ${aide('Man baut Stress ab, indem man sich regelmäßig bewegt.', 'On réduit le stress en bougeant régulièrement.')}
• ${aide('Indem sie früh Hilfe gesucht hat, hat sie Schlimmeres verhindert.', 'En cherchant de l’aide tôt, elle a évité le pire.')}
• ${aide('Man baut Stress dadurch ab, dass man sich regelmäßig bewegt.', 'Même sens, avec « dadurch, dass ».')}

REGEL — SODASS UND SO … DASS: DIE FOLGE
[fr?] Règle : la conséquence
„Sodass“ (auch „so dass“) leitet eine Folge ein. Der Nebensatz steht immer nach dem Hauptsatz. Bei „so …, dass“ steht „so“ im Hauptsatz direkt vor dem Adjektiv oder Adverb, das betont wird.
[fr?] sodass = si bien que, de sorte que ; so + adjectif …, dass = si … que. La conséquence suit toujours la principale.
• ${aide('Sie arbeitet im Schichtdienst, sodass sie keinen festen Rhythmus hat.', 'Elle travaille en équipes alternées, si bien qu’elle n’a pas de rythme fixe.')}
• ${aide('Ich war so erschöpft, dass ich im Auto eingeschlafen bin.', 'J’étais si épuisée que je me suis endormie dans la voiture.')}
• ${aide('Wiederholung „je … desto/umso“: Je länger man wach bleibt, desto schlechter konzentriert man sich.', 'Rappel : plus on reste éveillé, moins on se concentre. Après « desto » + comparatif vient directement le verbe.')}

REGEL — MODALVERBEN MIT SUBJEKTIVER BEDEUTUNG
[fr?] Règle : les verbes de modalité au sens subjectif
Modalverben drücken nicht nur Pflicht, Erlaubnis oder Fähigkeit aus. Sie zeigen auch, wie sicher die Sprecherin ist oder woher eine Information kommt.
[fr?] Ils indiquent aussi le degré de certitude du locuteur ou l’origine d’une information.
• ${aide('muss – fast sicher, logischer Schluss: Sein Büro ist seit Tagen dunkel. Er muss krank sein.', 'Il doit être malade (j’en suis presque sûr).')}
• ${aide('dürfte – wahrscheinlich: Das dürfte zu einfach sein.', 'C’est probablement trop simple.')}
• ${aide('kann / könnte – möglich: Das kann (könnte) auch am Stress liegen.', 'Cela peut aussi venir du stress.')}
• ${aide('soll – man sagt es, es wird berichtet: In manchen Ländern sollen Ruheräume üblich sein.', 'Il paraît que, selon certaines sources.')}
• ${aide('will – die Person behauptet es selbst: Er will nie krank gewesen sein.', 'Il prétend n’avoir jamais été malade.')}

REGEL — VERMUTUNGEN ÜBER DIE VERGANGENHEIT
[fr?] Règle : supposer à propos du passé
Modalverb (Gegenwart) + Partizip II + „haben“ oder „sein“ am Satzende (Infinitiv Perfekt).
[fr?] Le verbe de modalité reste au présent ; c’est l’infinitif qui passe au passé.
• ${aide('Sie dürfte zu wenig geschlafen haben.', 'Elle a probablement trop peu dormi.')}
• ${aide('Er muss im Zug eingeschlafen sein.', 'Il a dû s’endormir dans le train.')}

ACHTUNG
[fr?] Attention : pièges des francophones
• ${aide('Ein französisches Gérondif, das einen Zeitpunkt nennt, übersetzt man nicht mit „indem“, sondern mit „als“: Als ich nach Hause kam, habe ich sie gesehen. „Indem“ nennt nur das Mittel.', '« En rentrant, je l’ai vue » indique le moment : als (ou beim + nom), jamais indem.')}
• ${aide('„Damit“ nennt ein Ziel, „sodass“ eine Folge: Ich gehe früh ins Bett, damit ich fit bin. – Ich war müde, sodass ich früh ins Bett ging.', 'damit = but (pour que) ; sodass = conséquence (si bien que).')}
• ${aide('Eine sichere Vermutung drückt „muss“ aus: Er muss krank sein. „Er soll krank sein“ bedeutet dagegen: Man sagt, dass er krank ist.', '« Il doit être malade » (supposition) = Er muss krank sein ; « Er soll krank sein » = il paraît qu’il est malade.')}
• ${aide('„Sie dürfte zu Hause sein“ ist eine Vermutung, keine Erlaubnis. Die Erlaubnis heißt: „Sie darf nach Hause gehen.“', '« dürfte » = probablement ; « darf » = a le droit.')}` } },

    // 6 · Grammaire : s'entraîner
    { id: 'b2-gesundheit-grammatik', kind: 'exercise', title: 'Üben: indem, sodass und Vermutungen', estimatedMinutes: 15,
      competences: ['lecture', 'expression-ecrite'],
      lesson: { description: `${aide('Üben Sie Mittel, Folge und Vermutung. Lesen Sie jeden Satz bis zum Ende, bevor Sie antworten.', 'Entraînez-vous au moyen, à la conséquence et à la supposition. Lisez chaque phrase jusqu’au bout avant de répondre.')}

MERKE
[fr?] À retenir
• ${aide('indem + Verb am Ende = das Mittel (Wie?) · sodass / so …, dass = die Folge · damit = das Ziel', 'indem = moyen ; sodass / so … dass = conséquence ; damit = but')}
• ${aide('muss (fast sicher) · dürfte (wahrscheinlich) · kann/könnte (möglich) · soll (man sagt) · will (behauptet selbst)', 'degrés de certitude et ouï-dire')}
• ${aide('Vergangenheit: Modalverb + Partizip II + haben/sein', 'passé : modal + participe II + haben/sein')}` },
      questions: [
        fill('q1', aide('Ergänzen Sie „indem“, „sodass“ oder „damit“.', 'Complétez avec « indem », « sodass » ou « damit ».'),
          '[[1]] ich abends besser einschlafe, lasse ich das Handy in der Küche. · Wie hat er seinen Schlaf verbessert? Er hat ihn verbessert, [[2]] er abends nicht mehr fernsieht. · Auf der Station war es nachts sehr laut, [[3]] niemand schlafen konnte.',
          [['Damit'], ['indem'], ['sodass', 'so dass']],
          aide('Satz 1 nennt ein Ziel (damit); ein Nebensatz mit „sodass“ kann außerdem nie am Satzanfang stehen. Satz 2 antwortet auf „Wie?“: indem. Satz 3 nennt die Folge des Lärms: sodass (auch „so dass“).',
            '1 : but (damit) ; 2 : moyen (indem) ; 3 : conséquence (sodass).')),
        order('q2', C2.ordnen, [['Man', 'kann', 'Stress', 'abbauen,', 'indem', 'man', 'regelmäßig', 'kurze Pausen', 'macht.']],
          aide('Hauptsatz mit Modalverb an zweiter Stelle und Infinitiv am Ende (kann … abbauen), dann der Nebensatz: „indem“ + Subjekt + Ergänzungen, das konjugierte Verb „macht“ steht ganz am Ende.',
            'Principale : modal en 2e position, infinitif à la fin ; subordonnée : verbe conjugué en dernier.')),
        order('q3', C2.ordnen, [['Die Kollegin', 'war', 'so', 'erschöpft,', 'dass', 'sie', 'im Zug', 'eingeschlafen', 'ist.']],
          aide('„So“ steht im Hauptsatz direkt vor dem Adjektiv, das betont wird (so erschöpft). Im dass-Satz steht das Hilfsverb am Ende, nach dem Partizip: eingeschlafen ist.',
            '« so » précède l’adjectif ; dans la subordonnée, l’auxiliaire « ist » vient en dernier.')),
        choice('q4', aide('Welcher deutsche Satz entspricht dem französischen Satz « Il paraît qu’elle a changé de poste » ?', 'Quelle phrase allemande correspond à cette phrase française ?'),
          [['Sie muss die Stelle gewechselt haben.'], ['Sie will die Stelle gewechselt haben.'], ['Sie soll die Stelle gewechselt haben.', true],
            ['Sie sollte die Stelle wechseln.']],
          aide('„Soll“ + Infinitiv Perfekt gibt eine Information wieder, die man gehört hat. „Muss … haben“ wäre ein sicherer Schluss, „will … haben“ eine eigene Behauptung der Frau, „sollte … wechseln“ ein Rat.',
            'soll = ouï-dire ; muss = déduction ; will = elle le prétend ; sollte = conseil.')),
        hints(fill('q5', aide('Formulieren Sie die Vermutung mit einem Modalverb.', 'Exprimez la supposition avec un verbe de modalité.'),
          'Wahrscheinlich ist er krank. → Er [[1]] krank sein. · Ich bin mir fast sicher, dass sie im Büro ist. → Sie [[2]] im Büro sein. · Vielleicht liegt es am Wetter. → Es [[3]] am Wetter liegen.',
          [['dürfte'], ['muss'], ['kann', 'könnte']],
          aide('Wahrscheinlich → dürfte (Konjunktiv II von „dürfen“). Fast sicher → muss. Vielleicht, möglich → kann oder könnte. Die Modalverben stehen hier in der Gegenwart, weil die Vermutung sich auf jetzt bezieht.',
            'probablement → dürfte ; presque sûr → muss ; peut-être → kann / könnte.')),
        'wahrscheinlich', 'fast sicher', 'möglich'),
        match('q6', aide('Wie sicher ist die Sprecherin? Ordnen Sie zu.', 'Quel est le degré de certitude ? Associez.'),
          [['Er muss den Zug verpasst haben.', 'Ich bin mir fast sicher.'], ['Er dürfte den Zug verpasst haben.', 'Das ist wahrscheinlich.'],
            ['Er könnte den Zug verpasst haben.', 'Das ist möglich.'], ['Er soll den Zug verpasst haben.', 'Das habe ich gehört.'],
            ['Er will den Zug verpasst haben.', 'Das behauptet er selbst.']],
          aide('Die Skala reicht von „muss“ (fast sicher) über „dürfte“ (wahrscheinlich) bis „könnte“ (möglich). „Soll“ gibt fremde Aussagen wieder, „will“ die eigene Behauptung des Subjekts, oft mit Zweifel der Sprecherin.',
            'Échelle de certitude, puis ouï-dire (soll) et prétention (will).')),
        hints(fill('q7', aide('Vermutungen über die Vergangenheit: Ergänzen Sie.', 'Suppositions sur le passé : complétez.'),
          'Sicher hat sie den Termin vergessen. → Sie muss den Termin [[1]] [[2]]. · Wahrscheinlich ist er schon nach Hause gegangen. → Er dürfte schon nach Hause [[3]] [[4]].',
          [['vergessen'], ['haben'], ['gegangen'], ['sein']],
          aide('Infinitiv Perfekt am Satzende: Partizip II + haben oder sein. „Vergessen“ bildet das Perfekt mit „haben“, „gehen“ als Bewegungsverb mit „sein“. Das Modalverb bleibt in der Gegenwart.',
            'vergessen → haben ; gehen → sein (verbe de déplacement).')),
        null, 'haben oder sein?', null, 'haben oder sein?'),
        choice('q8', aide('„Je später ich ins Bett gehe, …“ Wie geht der Satz richtig weiter?', 'Comment la phrase continue-t-elle correctement ?'),
          [['desto ich bin müder am nächsten Morgen.'], ['desto müder ich bin am nächsten Morgen.'], ['ich bin desto müder am nächsten Morgen.'],
            ['desto müder bin ich am nächsten Morgen.', true]],
          aide('Nach „desto“ (oder „umso“) folgt zuerst der Komparativ (müder), dann sofort das konjugierte Verb (bin) und erst dann das Subjekt. Im je-Satz steht das Verb am Ende (gehe).',
            'desto + comparatif + verbe + sujet : « desto müder bin ich ».')),
        choice('q9', aide('Welcher deutsche Satz entspricht dem französischen Satz « En rentrant du travail, j’ai rencontré ma voisine » ?', 'Quelle phrase allemande correspond à cette phrase française ?'),
          [['Als ich von der Arbeit kam, habe ich meine Nachbarin getroffen.', true], ['Indem ich von der Arbeit kam, habe ich meine Nachbarin getroffen.'],
            ['Sodass ich von der Arbeit kam, habe ich meine Nachbarin getroffen.'], ['Damit ich von der Arbeit kam, habe ich meine Nachbarin getroffen.']],
          aide('Hier bezeichnet der französische Gérondif einen Zeitpunkt, kein Mittel: Man trifft die Nachbarin nicht „durch“ das Nachhausekommen. Deshalb „als“. „Indem“ würde ein Mittel nennen, „sodass“ und „damit“ passen inhaltlich und grammatisch nicht.',
            'Ici le gérondif indique le moment (als), pas le moyen.')),
        choice('q10', aide('Welcher Satz ist richtig?', 'Quelle phrase est correcte ?'),
          [['Sodass er nicht schlafen konnte, trank er abends Kaffee.'], ['Er trank abends Kaffee, sodass konnte er nicht schlafen.'],
            ['Er trank abends Kaffee, sodass er nicht schlafen konnte.', true], ['Er trank abends Kaffee, sodass er konnte nicht schlafen.']],
          aide('Der sodass-Satz steht nach dem Hauptsatz, und das konjugierte Verb (konnte) steht am Ende des Nebensatzes. „Sodass“ am Satzanfang ist nicht möglich, und weder Verbzweitstellung noch Hauptsatzstellung ist nach „sodass“ korrekt.',
            'sodass : toujours après la principale, verbe conjugué à la fin.')),
      ] },

    // 7 · Lexique
    { id: 'b2-gesundheit-wortschatz', kind: 'exercise', title: 'Wortschatz: Stress, Erholung und feste Wendungen', estimatedMinutes: 12,
      competences: ['lecture', 'expression-ecrite'],
      lesson: { description: `${aide('Lernen Sie Wörter in Verbindungen: Nomen mit Verb, Wortfamilien, Verben mit Präposition und Formulierungen zum Abwägen.', 'Apprenez les mots en contexte : nom + verbe, familles de mots, verbes à préposition et formules pour nuancer.')}

TIPP
[fr?] Conseil
${aide('Viele Nomen zum Thema enden auf -ung, -heit oder -keit und sind feminin: die Belastung, die Müdigkeit, die Erreichbarkeit. Lernen Sie das Verb oder Adjektiv gleich mit.', 'Beaucoup de noms du thème se terminent en -ung, -heit, -keit et sont féminins. Apprenez le verbe ou l’adjectif de base avec eux.')}` },
      questions: [
        match('q1', aide('Welches Verb passt? Ordnen Sie zu.', 'Quel verbe convient ? Associez.'),
          [['Stress', 'abbauen'], ['unter Druck', 'stehen'], ['eine Pause', 'einlegen'], ['Warnsignale', 'ernst nehmen'], ['Überstunden', 'machen']],
          aide('Feste Verbindungen lernt man am besten als Ganzes: Stress abbauen, unter Druck stehen, eine Pause einlegen, Warnsignale ernst nehmen, Überstunden machen. „Eine Pause machen“ ist auch korrekt, „Überstunden einlegen“ aber nicht: Deshalb gehört „machen“ hier zu den Überstunden.',
            'réduire le stress, être sous pression, faire une pause, prendre les signaux au sérieux, faire des heures supplémentaires.')),
        fill('q2', aide('Bilden Sie das Nomen mit Artikel „die“.', 'Formez le nom (féminin).'),
          'müde → die [[1]] · erschöpft → die [[2]] · belasten → die [[3]] · erreichbar → die [[4]] · leistungsfähig → die [[5]]',
          [['Müdigkeit'], ['Erschöpfung'], ['Belastung'], ['Erreichbarkeit'], ['Leistungsfähigkeit']],
          aide('Adjektive auf -ig und -bar bilden Nomen auf -keit (Müdigkeit, Erreichbarkeit, Leistungsfähigkeit). Aus Verben und Partizipien werden Nomen auf -ung (Erschöpfung, Belastung). Alle sind feminin.',
            '-ig / -bar → -keit ; verbes → -ung ; tous féminins.')),
        choice('q3', aide('„Solche Tipps greifen zu kurz.“ Was bedeutet das?', 'Que signifie « Solche Tipps greifen zu kurz » ?'),
          [['Die Tipps reichen allein nicht aus.', true], ['Die Tipps sind viel zu kompliziert.'], ['Die Tipps wirken nur sehr kurz.'],
            ['Die Tipps sind inzwischen veraltet.']],
          aide('„Zu kurz greifen“ heißt: nicht weit genug gehen, das Problem nur teilweise lösen. Im Artikel: Die Tipps sind sinnvoll, aber ohne bessere Arbeitsbedingungen genügen sie nicht.',
            '« zu kurz greifen » = être insuffisant, ne pas aller assez loin.')),
        choice('q4', aide('Sie möchten einem Argument nur teilweise zustimmen. Welche Formulierung passt?', 'Vous voulez approuver un argument en partie seulement. Quelle formule convient ?'),
          [['Das ist doch völliger Unsinn, denn man muss sehen, dass …'], ['Da haben Sie hundertprozentig recht, denn man sieht, dass …'],
            ['Dazu möchte ich lieber gar nichts sagen, weil man sieht, dass …'], ['Da ist etwas dran, aber man muss auch sehen, dass …', true]],
          aide('„Da ist etwas dran, aber …“ erkennt einen Teil des Arguments an und bringt dann einen Einwand: typisch für eine sachliche Diskussion auf B2-Niveau. Die anderen Formulierungen lehnen ganz ab, stimmen ganz zu oder weichen aus.',
            '« Da ist etwas dran, aber … » = il y a du vrai, mais …')),
        match('q5', aide('Was bedeutet das? Ordnen Sie zu.', 'Que signifient ces mots ? Associez.'),
          [['umstritten', 'Fachleute sind sich nicht einig.'], ['gereizt', 'schnell nervös und ärgerlich'], ['ausgeschlafen', 'nach genug Schlaf wach und fit'],
            ['erschöpft', 'völlig ohne Kraft']],
          aide('Diese Adjektive kommen im Artikel und im Radiogespräch vor. Bei einem umstrittenen Thema gibt es unter Fachleuten verschiedene Meinungen; wer gereizt ist, reagiert schnell ärgerlich; wer ausgeschlafen ist, hat genug geschlafen; wer erschöpft ist, hat keine Kraft mehr.',
            'umstritten : controversé ; gereizt : irritable ; ausgeschlafen : reposé ; erschöpft : épuisé.')),
        fill('q6', aide('Ergänzen Sie die Präposition.', 'Complétez avec la préposition.'),
          'Schlafmangel wirkt sich negativ [[1]] die Konzentration aus. · Viele Beschäftigte leiden [[2]] ständigem Zeitdruck. · Die Patientin klagt seit Tagen [[3]] Kopfschmerzen.',
          [['auf'], ['unter'], ['über']],
          aide('Sich auswirken auf + Akkusativ, leiden unter + Dativ (eine Situation; bei einer Krankheit auch „leiden an“), klagen über + Akkusativ. Die Präposition gehört zum Verb und muss mitgelernt werden.',
            'sich auswirken auf ; leiden unter ; klagen über.')),
      ] },

    // 8 · Second document (thème pair) : un guide pratique
    { id: 'b2-gesundheit-lesen2', kind: 'exercise', title: 'Verstehen: ein Ratgeber zum Gesundheitssystem', estimatedMinutes: 18,
      competences: ['lecture'],
      lesson: { description: `${C2.lesen}

STRATEGIE
[fr?] Stratégie
${aide('Ein Ratgeber liest sich selektiv: Lesen Sie zuerst die Zwischenüberschriften und suchen Sie dann gezielt die Stelle, die zur Aufgabe passt.', 'Un guide se lit de façon sélective : lisez d’abord les intertitres, puis cherchez le passage utile à chaque question.')}

WOHIN MIT WELCHEN BESCHWERDEN?
Ein Ratgeber für alle, die neu in Deutschland sind

1. Die Hausarztpraxis
Erste Anlaufstelle bei fast allen gesundheitlichen Problemen ist die Hausarztpraxis. Hausärztinnen und Hausärzte kennen Ihre Krankengeschichte, behandeln die meisten Beschwerden selbst und überweisen Sie bei Bedarf an eine Fachpraxis. Wer sich krank fühlt, ruft am besten gleich morgens an. Viele Praxen bieten inzwischen auch eine offene Sprechstunde ohne Termin oder eine Videosprechstunde an.

2. Die Facharztpraxis
Für Augen, Haut, Herz oder Zähne gibt es Fachärztinnen und Fachärzte. Zur Zahnarzt-, Augenarzt- oder Frauenarztpraxis gehen Sie direkt, ohne Überweisung. Bei anderen Fachrichtungen ist eine Überweisung von der Hausärztin oft nicht vorgeschrieben, aber sinnvoll: Die Fachpraxis erfährt dann, was schon untersucht wurde. Planen Sie Zeit ein, denn auf manche Facharzttermine wartet man mehrere Wochen.

3. Abends und am Wochenende
Sind die Praxen geschlossen, hilft der ärztliche Bereitschaftsdienst. Unter der bundesweiten Nummer 116 117 erfahren Sie, welche Bereitschaftspraxis in Ihrer Nähe geöffnet ist. In manchen Fällen kommt auch eine Ärztin zu Ihnen nach Hause. Der Bereitschaftsdienst ist für Beschwerden gedacht, mit denen Sie normalerweise zur Hausärztin gehen würden, die aber nicht bis zum nächsten Werktag warten können, etwa hohes Fieber oder starke Ohrenschmerzen.

4. Der Notfall
Bei lebensbedrohlichen Situationen, zum Beispiel bei Atemnot, starken Brustschmerzen, einem schweren Unfall oder Anzeichen eines Schlaganfalls, wählen Sie sofort die 112. Die Notaufnahmen der Krankenhäuser sind für solche echten Notfälle da. Weil dort aber immer mehr Menschen mit leichten Beschwerden erscheinen, müssen Schwerkranke manchmal länger warten. Viele Kliniken prüfen deshalb bei der Ankunft zuerst, wie dringend ein Fall ist. Wer mit einer einfachen Erkältung kommt, sitzt dann unter Umständen viele Stunden im Wartebereich.

5. Die Apotheke
Bei kleineren Beschwerden wie Schnupfen oder leichten Kopfschmerzen lohnt sich oft zuerst der Weg in die Apotheke. Apothekerinnen und Apotheker beraten kostenlos und sagen Ihnen auch, wann Sie besser ärztliche Hilfe suchen sollten. Nachts und am Wochenende hat in jeder Region eine Notdienst-Apotheke geöffnet. Welche das ist, steht auf einem Aushang an der Tür jeder Apotheke.` },
      placements: [{ media: 'b2-gesundheit-lesen2-karten', caption: 'Wohin mit welchen Beschwerden?' }],
      questions: [
        match('q1', aide('Wohin wenden sich diese Personen am besten? Ordnen Sie zu.', 'À quel service ces personnes doivent-elles s’adresser ? Associez.'),
          [['Sonntagabend, 39,5 Grad Fieber, aber kein Notfall', 'ärztlicher Bereitschaftsdienst'], ['plötzlich starke Brustschmerzen und Atemnot', 'Notruf 112'],
            ['seit gestern ein leichter Schnupfen', 'Apotheke'], ['seit Wochen Rückenschmerzen', 'Hausarztpraxis'], ['jährliche Kontrolle der Zähne', 'Zahnarztpraxis']],
          aide('Hohes Fieber am Wochenende kann nicht bis Montag warten, ist aber nicht lebensbedrohlich: Bereitschaftsdienst. Brustschmerzen und Atemnot: sofort 112. Leichter Schnupfen: Beratung in der Apotheke. Lang anhaltende Beschwerden: zuerst die Hausarztpraxis. Zur Zahnarztpraxis geht man direkt.',
            'Fièvre le dimanche : service de garde ; douleur thoracique : 112 ; rhume : pharmacie ; mal de dos durable : médecin traitant ; dentiste : en direct.')),
        choice('q2', aide('Warum müssen Schwerkranke in der Notaufnahme manchmal länger warten?', 'Pourquoi les grands malades attendent-ils parfois plus longtemps aux urgences ?'),
          [['Weil es nachts in den Kliniken zu wenig Ärztinnen gibt.'], ['Weil viele Menschen mit leichten Beschwerden dorthin kommen.', true],
            ['Weil man dort zuerst eine Überweisung vorzeigen muss.'], ['Weil die Notaufnahmen nur am Wochenende geöffnet sind.']],
          aide('„Weil dort aber immer mehr Menschen mit leichten Beschwerden erscheinen, müssen Schwerkranke manchmal länger warten.“ Von Personalmangel in der Nacht oder einer Überweisung für die Notaufnahme steht nichts im Text.',
            'Les urgences sont encombrées par des cas bénins.')),
        choice('q3', aide('Was rät der Ratgeber indirekt?', 'Que conseille implicitement le guide ?'),
          [['Bei jeder Erkältung sofort einen Facharzt aufzusuchen.'], ['Abends grundsätzlich die Notaufnahme zu wählen.'],
            ['Die Notaufnahme nur bei echten Notfällen aufzusuchen.', true], ['Vor jedem Arztbesuch die Apotheke anzurufen.']],
          aide('Der Text sagt nicht direkt „Gehen Sie nicht in die Notaufnahme“, aber er erklärt, wofür sie da ist („für solche echten Notfälle“) und dass man mit einer Erkältung dort „viele Stunden“ wartet. Daraus folgt der indirekte Rat.',
            'Conseil implicite : réserver les urgences aux vraies urgences.')),
        rf('q4', 'Für einen Termin bei der Augenärztin braucht man eine Überweisung.', 'f',
          aide('Falsch: „Zur Zahnarzt-, Augenarzt- oder Frauenarztpraxis gehen Sie direkt, ohne Überweisung.“',
            'Faux : on va chez l’ophtalmologue sans lettre d’orientation.')),
        rf('q5', 'Die Beratung in der Apotheke kostet nichts.', 'r',
          aide('Richtig: „Apothekerinnen und Apotheker beraten kostenlos.“ Kostenlos heißt: Man muss nichts bezahlen.',
            'Vrai : le conseil en pharmacie est gratuit.')),
        fill('q6', aide('Ergänzen Sie mit Wörtern aus dem Ratgeber.', 'Complétez avec des mots du guide.'),
          'Der Bereitschaftsdienst ist für Beschwerden da, die nicht bis zum nächsten [[1]] warten können. · Welche Apotheke Notdienst hat, steht auf einem [[2]] an der Tür.',
          [['Werktag'], ['Aushang']],
          aide('Der Werktag: ein Tag von Montag bis Samstag, an dem normal gearbeitet wird; hier vor allem der nächste Tag, an dem die Praxen öffnen. Der Aushang: ein Zettel, der öffentlich hängt, zum Beispiel an einer Tür.',
            'der Werktag : jour ouvrable ; der Aushang : l’affiche, l’avis affiché.')),
      ] },

    // 9 · Vérifier
    { id: 'b2-gesundheit-kontrolle', kind: 'exercise', title: 'Prüfen: Stress, Schlaf und Vermutungen', estimatedMinutes: 14,
      competences: ['lecture', 'ecoute'],
      lesson: { description: `${aide('Prüfen Sie, was Sie in diesem Modul gelernt haben: Hören, Grammatik und Wortschatz.', 'Vérifiez ce que vous avez appris dans ce module : écoute, grammaire et vocabulaire.')}

${aide('Für die Fragen 1 und 2 hören Sie eine Durchsage in Ihrer Firma.', 'Pour les questions 1 et 2, écoutez une annonce dans votre entreprise.')}` },
      placements: [{ media: 'b2-gesundheit-kontrolle-audio', caption: 'Durchsage: Gesundheitstag' }],
      questions: [
        fill('q1', aide('Hören Sie die Durchsage und ergänzen Sie die Notiz.', 'Écoutez l’annonce et complétez la note.'),
          'Gesundheitstag am 12. März · Beginn des Vortrags über gesunden Schlaf: [[1]] · Anmeldung bis [[2]] im Intranet',
          [['11.30 Uhr', '11:30 Uhr', '11.30', '11:30', 'halb zwölf', 'halb 12', '11 Uhr 30', 'elf Uhr dreißig'], ['Montag']],
          aide('„Der Vortrag beginnt um halb zwölf“: halb zwölf ist 11.30 Uhr, nicht 12.30 Uhr. „Bitte melden Sie sich bis Montag im Intranet an.“',
            'halb zwölf = 11 h 30 (et non 12 h 30).')),
        choice('q2', aide('Was sagt die Durchsage über die Teilnahme?', 'Que dit l’annonce sur la participation ?'),
          [['Sie kostet zehn Euro pro Person.'], ['Sie ist nur für die Pflegekräfte.'], ['Sie zählt als Arbeitszeit.', true], ['Sie ist für alle verpflichtend.']],
          aide('„Die Teilnahme gilt selbstverständlich als Arbeitszeit.“ Die Beratung ist kostenlos, und von einer Pflicht ist nicht die Rede: Man muss sich anmelden, weil die Plätze begrenzt sind.',
            'La participation compte comme temps de travail ; elle est gratuite et facultative.')),
        order('q3', C2.ordnen, [['Sie', 'hat', 'ihren Stress', 'abgebaut,', 'indem', 'sie', 'jeden Tag eine halbe Stunde', 'spazieren gegangen', 'ist.']],
          aide('Hauptsatz im Perfekt (hat … abgebaut), dann der indem-Satz mit dem Mittel. Im Nebensatz steht das Hilfsverb „ist“ am Ende, nach „spazieren gegangen“.',
            'Le moyen (indem) suit la principale ; « ist » en fin de subordonnée.')),
        hints(fill('q4', aide('Ergänzen Sie die Vermutung über die Vergangenheit.', 'Complétez la supposition sur le passé.'),
          'Ich bin mir fast sicher: Sie hat die Mail nicht gelesen. → Sie [[1]] die Mail nicht gelesen [[2]].',
          [['muss'], ['haben']],
          aide('Fast sicher → „muss“, in der Gegenwart. Die Handlung liegt in der Vergangenheit: Partizip II + „haben“ am Ende (Infinitiv Perfekt).',
            'presque sûr → muss … gelesen haben.')),
        'Modalverb', 'haben oder sein?'),
        choice('q5', aide('Ihr Kollege ist seit einer Woche nicht im Büro. Man erzählt sich, dass er im Urlaub ist. Was sagen Sie?', 'Votre collègue est absent depuis une semaine ; on raconte qu’il est en vacances. Que dites-vous ?'),
          [['Er darf im Urlaub sein.'], ['Er will im Urlaub sein.'], ['Er muss im Urlaub sein.'], ['Er soll im Urlaub sein.', true]],
          aide('Eine Information vom Hörensagen gibt man mit „sollen“ wieder: Er soll im Urlaub sein, das erzählt man sich. „Muss“ wäre ein eigener sicherer Schluss, „will“ seine eigene Behauptung, „darf“ eine Erlaubnis.',
            'Ouï-dire → soll.')),
        choice('q6', aide('„Der Lärm war ___ laut, ___ niemand schlafen konnte.“ Was passt?', 'Qu’est-ce qui convient ?'),
          [['so … dass', true], ['sodass … so'], ['indem … dass'], ['je … desto']],
          aide('„So“ betont das Adjektiv im Hauptsatz (so laut), der dass-Satz nennt die Folge: so laut, dass niemand schlafen konnte. „Je … desto“ verlangt zwei Komparative.',
            'si bruyant que … : so … dass.')),
        hints(fill('q7', aide('Bilden Sie das passende Nomen.', 'Formez le nom qui convient.'),
          'Die ständige [[1]] nach Feierabend ist für viele eine große [[2]].',
          [['Erreichbarkeit'], ['Belastung']],
          aide('Aus „erreichbar“ wird „die Erreichbarkeit“ (-keit), aus „belasten“ wird „die Belastung“ (-ung). Beide Nomen sind feminin: „die ständige …“, „eine große …“.',
            'erreichbar → die Erreichbarkeit ; belasten → die Belastung.')),
        'erreichbar', 'belasten'),
        choice('q8', aide('Was bedeutet „abschalten“ im Satz „Am Wochenende kann ich nicht mehr abschalten“?', 'Que signifie « abschalten » ici ?'),
          [['das Handy und den Laptop ausmachen'], ['die Arbeit innerlich loslassen', true], ['auch am Wochenende arbeiten'], ['früher am Abend schlafen gehen']],
          aide('„Abschalten“ kann wörtlich „ein Gerät ausmachen“ bedeuten. In diesem Satz geht es aber um den Kopf: Man kann die Gedanken an die Arbeit nicht loslassen und sich nicht erholen.',
            'Ici, sens figuré : décrocher mentalement.')),
      ] },
  ],
};
