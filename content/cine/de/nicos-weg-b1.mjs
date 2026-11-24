// Ciné-club · Nicos Weg B1 (Deutsche Welle, chaîne YouTube officielle « Deutsch lernen mit der DW », vidéo LkufozluseI).
// Quatorze séquences de 6 à 10 minutes qui suivent les 76 folgen du film. Bornes estimées (approx: true) d'après l'ordre et la
// durée des épisodes publiés par la DW sur learngerman.dw.com (durée de chaque folge moins environ 12,5 s de générique, que
// le film complet ne répète pas) : à vérifier en regardant, dans l'éditeur du catalogue. La folge 1 dure à elle seule près de
// 8 minutes : la première séquence ne réunit donc que deux folgen. Contextes, mots-clés, questions et explications originaux :
// rien n'est recopié des sous-titres, des manuscrits ni des exercices de la DW.
import { DW, bi, choice, contexte, fill, match, mot, nom, order } from '../lib.mjs';

/** Vrai / faux / non dit (3 options, ordre fixe) : affirmation allemande et sa traduction, suivies de la consigne. */
const rf = (id, [de, fr], answer, explanation) => choice(id, bi(`${de} Richtig, falsch oder nicht gesagt?`, `${fr} Vrai, faux ou non dit ?`),
  ['richtig', 'falsch', 'nicht gesagt'].map((label) => [label, label === answer]), explanation);
const ordnen = bi('Ordnen Sie die Szenen.', 'Remettez les scènes dans l’ordre.');

export default {
  film: {
    id: 'nicos-weg-b1', levelId: 'b1', title: 'Nicos Weg · B1', position: 1,
    videoId: 'LkufozluseI', durationSeconds: '1:53:00',
    courseUrl: 'https://learngerman.dw.com/de/nicos-weg/c-36519718',
    channel: DW.channel, credit: DW.credit, licenseNote: DW.licenseNote,
    description: 'Nico vit maintenant en Allemagne, en colocation, et parle déjà bien allemand. Il lui reste à choisir un '
      + 'métier et à réussir son examen de langue. Autour de lui, Selma rêve d’études malgré la méfiance de ses parents, son '
      + 'frère Pepe cache des soucis d’argent, et le nouvel amour d’Inge intrigue ses amis. Le film complet du niveau B1 '
      + '(76 épisodes courts) est découpé ici en 14 séquences de 6 à 10 minutes. Pour chacune : un contexte et des mots-clés '
      + 'avant de regarder, le film dans le lecteur YouTube avec les sous-titres allemands, votre carnet de mots pendant le '
      + 'visionnage, puis des questions corrigées.',
  },
  sequences: [
    // 1 · Folgen 1–2
    {
      title: 'Was will ich werden?',
      episodes: [1, 2], start: '0:00', end: '8:51', approx: true,
      context: contexte({
        episodes: [1, 2],
        situation: [
          ['Nico lebt seit einiger Zeit in Deutschland und spricht schon ziemlich gut Deutsch. Heute hat er einen Termin bei einer Berufsberaterin.', 'Nico vit depuis quelque temps en Allemagne et parle déjà assez bien allemand. Aujourd’hui, il a rendez-vous avec une conseillère d’orientation professionnelle.'],
          ['Er möchte endlich einen Beruf lernen. Aber welcher Beruf passt zu ihm?', 'Il voudrait enfin apprendre un métier. Mais quel métier lui convient ?'],
          ['Danach besucht Lisa ihre Schülerin Selma und deren Mutter Aya. Sie sprechen über Sprachen und Pläne.', 'Ensuite, Lisa rend visite à son élève Selma et à sa mère, Aya. Elles parlent de langues et de projets.'],
        ],
        questions: [
          ['Was fragt eine Berufsberaterin wohl? Was möchte sie über Nico wissen?', 'Que demande sans doute une conseillère d’orientation ? Que veut-elle savoir sur Nico ?'],
          ['Welche Sprachen sprechen Sie, und seit wann lernen Sie Deutsch?', 'Quelles langues parlez-vous, et depuis quand apprenez-vous l’allemand ?'],
        ],
        focus: [
          ['Achten Sie darauf, was Nico gut kann und was er gern werden möchte.', 'Soyez attentif à ce que Nico sait bien faire et à ce qu’il aimerait devenir.'],
          ['Achten Sie auch auf die Sprachen, die Selma und ihre Mutter sprechen.', 'Soyez aussi attentif aux langues que parlent Selma et sa mère.'],
        ],
      }),
      keywords: [
        nom('die', 'Berufsberaterin', 'Berufsberaterinnen', 'la conseillère d’orientation professionnelle', 'masculin : der Berufsberater'),
        nom('die', 'Ausbildung', 'Ausbildungen', 'la formation professionnelle (souvent en alternance)', 'eine Ausbildung machen : suivre une formation'),
        nom('die', 'Deutschkenntnisse', null, 'les connaissances en allemand', 'toujours au pluriel : gute Deutschkenntnisse haben'),
        nom('die', 'Sprachprüfung', 'Sprachprüfungen', 'l’examen de langue', 'eine Prüfung machen / bestehen : passer / réussir un examen'),
        nom('der', 'Nachweis', 'Nachweise', 'l’attestation, le justificatif', 'ein Nachweis über (+ accusatif) : une attestation de…'),
        nom('die', 'Schauspielschule', 'Schauspielschulen', 'l’école d’art dramatique'),
        nom('die', 'Aufnahmeprüfung', 'Aufnahmeprüfungen', 'le concours d’entrée'),
        mot('zweisprachig', 'bilingue', 'zweisprachig aufwachsen : grandir avec deux langues'),
        nom('die', 'Muttersprache', 'Muttersprachen', 'la langue maternelle'),
        mot('sich sicher sein', 'être sûr', 'Ich bin mir sicher, dass … / Ich bin mir nicht sicher.'),
      ],
      questions: [
        choice('q1', bi('Was braucht man laut der Beraterin für viele Ausbildungen und für ein Studium?', 'Selon la conseillère, de quoi a-t-on besoin pour beaucoup de formations et pour des études ?'), [
          ['Erfahrung in einem deutschen Betrieb'],
          ['ein deutsches Abitur'],
          ['gute bis sehr gute Deutschkenntnisse', true],
        ], 'La conseillère le répète à Nico : sans un bon, voire très bon niveau d’allemand, ni formation ni études ne sont possibles. Elle ajoute que les entreprises demandent une attestation de langue. Elle ne parle ni du baccalauréat allemand ni d’expérience en entreprise.'),
        choice('q2', bi('Was stimmt über Nicos Deutsch?', 'Qu’est-ce qui est vrai à propos de l’allemand de Nico ?'), [
          ['Er hat einen A2-Kurs gemacht, aber keine Prüfung.', true],
          ['Er hat die A2-Prüfung schon vor einem Jahr bestanden.'],
          ['Er hat schon ein B1-Zertifikat für die Ausbildung.'],
        ], 'Nico vient de commencer le niveau B1. Il a suivi un cours A2, mais il n’a pas passé l’examen A2. Il n’a donc encore aucun certificat : pour une formation, il devra d’abord passer un examen de langue.'),
        choice('q3', bi('Nach welcher Ausbildung fragt Nico die Beraterin?', 'Sur quelle formation Nico interroge-t-il la conseillère ?'), [
          ['nach einem Studium der Informatik'],
          ['nach einer Schauspielausbildung', true],
          ['nach einer Ausbildung als Koch'],
        ], 'Quand la conseillère lui demande quel métier il veut apprendre, Nico avoue qu’il n’est pas sûr, puis il demande s’il existe une formation de comédien. La conseillère parle alors des écoles d’art dramatique.'),
        choice('q4', bi('Warum ist die Beraterin bei diesem Berufswunsch vorsichtig?', 'Pourquoi la conseillère est-elle prudente face à ce projet de métier ?'), [
          ['Nico ist schon zu alt für eine Schauspielschule.'],
          ['Eine Schauspielschule ist in Deutschland sehr teuer.'],
          ['Für Schauspieler ist es auf dem Arbeitsmarkt sehr schwer.', true],
        ], 'Elle explique que le concours d’entrée est très difficile et que personne ne peut garantir un emploi d’acteur après la formation, car le marché du travail est très dur pour les comédiens. Elle ne parle ni de l’âge de Nico ni du prix de l’école.'),
        match('q5', bi('Wer ist das? Verbinden Sie die Personen mit den Informationen.', 'Qui est-ce ? Associez les personnes aux informations.'), [
          ['Nico', 'hat gerade mit dem Niveau B1 angefangen'],
          ['Aya', 'spricht Arabisch und Armenisch'],
          ['Selma', 'lernt in der Schule Englisch und Französisch'],
          ['Lisa', 'glaubt, dass Selma die B2-Prüfung schafft'],
        ], 'Nico explique à la conseillère qu’il vient de commencer le niveau B1. Aya a grandi avec deux langues, l’arabe et l’arménien ; Selma apprend l’anglais et le français à l’école, et Lisa est sûre qu’elle réussira l’examen B2.'),
        fill('q6', bi('Aya macht einen Fehler, und Selma korrigiert sie. Ergänzen Sie die richtigen Formen.', 'Aya fait une faute, et Selma la corrige. Complétez avec les formes correctes.'), 'Aya lernt seit [[1]] Jahr Deutsch. In Syrien hat sie schon [[2]] Englischkurs besucht.', [
          ['einem'],
          ['einen'],
        ], 'Après seit, on emploie le datif : seit einem Jahr (Aya dit d’abord « seit ein Jahre », et Selma la corrige). Après besuchen, le complément est à l’accusatif : einen Kurs. Aya a suivi un cours d’anglais en Syrie, mais elle parle encore peu cette langue.'),
        rf('q7', ['Selma weiß schon genau, was sie studieren möchte.', 'Selma sait déjà exactement ce qu’elle veut étudier.'], 'falsch',
          'Faux : Selma veut absolument faire des études, mais elle hésite encore. Elle pense peut-être à la médecine, ou bien à devenir professeure comme Lisa. Lisa la rassure : elle a encore un peu de temps pour choisir.'),
        order('q8', bi('In welcher Reihenfolge passiert das? Ordnen Sie.', 'Dans quel ordre cela se passe-t-il ? Remettez dans l’ordre.'), [
          ['Nico bittet die Beraterin, ihren Satz zu wiederholen.', 'Die Beraterin spricht über eine schwere Aufnahmeprüfung.', 'Nico erzählt, dass er Fahrräder reparieren kann.', 'Lisa fragt Aya nach ihren Sprachen.'],
        ], 'Nico demande d’abord à la conseillère de répéter sa phrase. Elle évoque ensuite le concours difficile des écoles d’art dramatique, puis Nico explique qu’il sait réparer des vélos et des mobylettes. La scène chez Selma, où Lisa interroge Aya, vient après.'),
      ],
    },
    // 2 · Folgen 3–8
    {
      title: 'Unter Zeitdruck',
      episodes: [3, 8], start: '8:51', end: '17:29', approx: true,
      context: contexte({
        episodes: [3, 8],
        situation: [
          ['Selmas Vater Ibrahim hat eine neue Stelle. Lisa spricht mit ihm über Selmas Deutschstunden.', 'Ibrahim, le père de Selma, a un nouvel emploi. Lisa lui parle des cours d’allemand de Selma.'],
          ['Nico hat Neuigkeiten für Selma, und Pepe bringt Max und Tarek eine überraschende Nachricht.', 'Nico a des nouvelles pour Selma, et Pepe apporte à Max et Tarek une nouvelle surprenante.'],
          ['In der WG und in Lisas Klasse sind alle gestresst: Die Zeit ist knapp.', 'Dans la colocation et dans la classe de Lisa, tout le monde est stressé : le temps manque.'],
        ],
        questions: [
          ['Was macht man, wenn man für ein großes Projekt zu wenig Zeit hat?', 'Que fait-on quand on a trop peu de temps pour un grand projet ?'],
          ['Ist Pünktlichkeit für Sie wichtig? Wie reagieren Sie, wenn jemand zu spät kommt?', 'La ponctualité est-elle importante pour vous ? Comment réagissez-vous quand quelqu’un arrive en retard ?'],
        ],
        focus: [
          ['Achten Sie auf die Zeitangaben: Wochen, Jahre, Uhrzeiten.', 'Soyez attentif aux indications de temps : semaines, années, heures.'],
        ],
      }),
      keywords: [
        nom('der', 'Zweiradmechatroniker', 'Zweiradmechatroniker', 'le mécanicien cycles et motocycles', 'eine Ausbildung zum Zweiradmechatroniker (zu + datif)'),
        nom('die', 'Werkstatt', 'Werkstätten', 'l’atelier (de réparation)'),
        mot('vertrauen', 'faire confiance', '+ datif : jemandem vertrauen ; das Vertrauen : la confiance'),
        mot('anlügen', 'mentir à quelqu’un', 'séparable ; Perfekt : hat angelogen'),
        nom('der', 'Investor', 'Investoren', 'l’investisseur'),
        nom('der', 'Lieferservice', 'Lieferservices', 'le service de livraison'),
        nom('das', 'Personal', null, 'le personnel', 'Personal einstellen : embaucher du personnel'),
        mot('gleichzeitig', 'en même temps'),
        nom('die', 'Pünktlichkeit', null, 'la ponctualité', 'contraire : die Unpünktlichkeit'),
        nom('die', 'Bedingung', 'Bedingungen', 'la condition'),
      ],
      questions: [
        choice('q1', bi('Was sagt Ibrahim über seine neue Arbeit?', 'Que dit Ibrahim de son nouveau travail ?'), [
          ['Sie ist ganz anders als seine Arbeit als Arzt.', true],
          ['Er arbeitet dort schon wieder als Arzt.'],
          ['Er möchte sie so schnell wie möglich kündigen.'],
        ], 'Ibrahim reconnaît que ce travail n’a rien à voir avec son métier de médecin, mais il est content d’avoir un emploi : pour lui, c’est le plus important. Il ne travaille pas comme médecin et ne parle pas de démissionner.'),
        choice('q2', bi('Warum ist Ibrahim dagegen, dass Selma wieder bei Lisa lernt?', 'Pourquoi Ibrahim refuse-t-il que Selma retourne apprendre chez Lisa ?'), [
          ['Der Unterricht bei Lisa ist zu teuer.'],
          ['Selma hat keine Zeit mehr für den Unterricht.'],
          ['Die Eltern können Selma nicht mehr vertrauen.', true],
        ], 'Ibrahim refuse poliment : Selma a menti à ses parents, et ils ne peuvent plus lui faire confiance. Pour lui, c’est une affaire de famille. Il remercie au contraire Lisa pour son aide et ne parle ni d’argent ni de manque de temps.'),
        fill('q3', bi('Hören Sie gut auf die Zahlen und ergänzen Sie.', 'Écoutez bien les nombres et complétez.'), 'Nicos Ausbildung dauert [[1]] Jahre. Der Investor gibt Max und Tarek nur [[2]] Wochen Zeit für den Lieferservice.', [
          ['drei', '3'],
          ['vier', '4'],
        ], 'La formation de mécanicien cycles dure trois ans. L’investisseur, lui, ne laisse que quatre semaines, soit un mois, pour lancer la livraison. Max trouve ce délai impossible : rien que les travaux dans la cuisine prendraient trois à quatre semaines.'),
        match('q4', bi('Wer macht was? Verbinden Sie.', 'Qui fait quoi ? Associez.'), [
          ['Pepe', 'will die App und die Webseite machen'],
          ['Lisa', 'sucht ihren Terminplan'],
          ['Sebastian', 'hat gerade den Boden gewischt'],
          ['Nina', 'hat einen Termin beim Frauenarzt'],
        ], 'Pepe se charge de l’application, du site et du plan d’affaires. Dans la colocation, Lisa cherche son agenda tout en téléphonant, Sebastian vient de laver le sol, et Nina a rendez-vous chez le gynécologue à trois heures et demie.'),
        choice('q5', bi('Nina will allein zum Arzt gehen. Lisa antwortet: „Das kommt gar nicht in Frage.“ Was bedeutet das?', 'Nina veut aller seule chez le médecin. Lisa répond : « Das kommt gar nicht in Frage. » Qu’est-ce que cela veut dire ?'), [
          ['Ce n’est pas un problème.'],
          ['Il n’en est pas question.', true],
          ['Je n’ai pas de question.'],
        ], '« Das kommt (gar) nicht in Frage » signifie « il n’en est pas question » : Lisa refuse de laisser Nina y aller seule, car elle lui a promis de l’accompagner. Le mot Frage ne désigne pas ici une question posée.'),
        rf('q6', ['Inge und Selma sind in Lisas Klasse, um über das Thema Flucht zu sprechen.', 'Inge et Selma sont dans la classe de Lisa pour parler de la fuite et de l’exil.'], 'richtig',
          'Vrai : Lisa présente ses deux invitées, Inge Kohlhaas et Selma, venues parler de la fuite et de l’exil, car leurs deux familles ont dû quitter leur pays. Mais le cours est sans cesse interrompu par des élèves en retard.'),
        choice('q7', bi('Welche Bedingung stellt der Investor?', 'Quelle condition l’investisseur pose-t-il ?'), [
          ['Er will 50 Prozent vom Restaurant haben.', true],
          ['Max und Tarek sollen ein zweites Restaurant eröffnen.'],
          ['Pepe soll die App ohne Bezahlung machen.'],
        ], 'L’investisseur veut devenir l’associé de Max et Tarek et réclame la moitié (50 %) de leur affaire. Tarek refuse aussitôt, et Max trouve aussi que c’est beaucoup trop. Pepe, lui, précise qu’il ne travaillera pas gratuitement.'),
        order('q8', ordnen, [
          ['Lisa spricht mit Ibrahim über Selma.', 'Nico erzählt Selma von seiner Ausbildung.', 'Pepe kommt mit einer Neuigkeit ins Restaurant.', 'Lisa unterbricht den Unterricht wegen einer Schülerin.', 'Max sagt Pepe, dass sie keinen Investor wollen.'],
        ], 'Lisa parle d’abord avec Ibrahim, puis Nico surprend Selma près de chez elle. Pepe annonce ensuite l’investisseur au restaurant. Après la scène de la colocation, Lisa reprend une élève en retard, et à la fin Max renonce à l’investisseur.'),
      ],
    },
    // 3 · Folgen 9–14
    {
      title: 'Geschichte und Geschichten',
      episodes: [9, 14], start: '17:29', end: '26:03', approx: true,
      context: contexte({
        episodes: [9, 14],
        situation: [
          ['Inge und Selma sind Gäste in Lisas Klasse. Sie erzählen von ihren Familien und zeigen Fotos.', 'Inge et Selma sont invitées dans la classe de Lisa. Elles parlent de leurs familles et montrent des photos.'],
          ['Yara findet ein altes Fahrrad wunderschön. Nico sieht das ganz anders.', 'Yara trouve un vieux vélo magnifique. Nico voit les choses tout autrement.'],
          ['Am Ende kommt Pepe mit einem Angebot zu Yara. Aber warum gerade jetzt?', 'À la fin, Pepe vient voir Yara avec une offre. Mais pourquoi justement maintenant ?'],
        ],
        questions: [
          ['Was bedeutet Heimat für Sie: ein Ort, eine Sprache, bestimmte Menschen?', 'Que signifie Heimat pour vous : un lieu, une langue, certaines personnes ?'],
          ['Was wissen Sie schon über die DDR und die deutsche Wiedervereinigung?', 'Que savez-vous déjà de la RDA et de la réunification allemande ?'],
        ],
        focus: [
          ['Achten Sie darauf, woher die Familien von Inge und Selma kommen.', 'Soyez attentif à l’origine des familles d’Inge et de Selma.'],
          ['Achten Sie auch auf das Wort „Wende“.', 'Soyez aussi attentif au mot « Wende ».'],
        ],
      }),
      keywords: [
        nom('die', 'Heimat', null, 'le pays natal, le lieu où l’on se sent chez soi', 'pas de traduction exacte en français'),
        nom('der', 'Weltkrieg', 'Weltkriege', 'la guerre mondiale', 'vor dem Zweiten Weltkrieg : avant la Seconde Guerre mondiale'),
        mot('fliehen', 'fuir', 'Perfekt : ist geflohen ; der Flüchtling : le réfugié'),
        nom('das', 'Klapprad', 'Klappräder', 'le vélo pliant', 'zusammenklappen : replier'),
        nom('der', 'Schrott', null, 'la ferraille, le tas de ferraille'),
        nom('die', 'Währung', 'Währungen', 'la monnaie (d’un pays)'),
        nom('die', 'Wiedervereinigung', null, 'la réunification'),
        nom('die', 'Schulden', null, 'les dettes', 'toujours au pluriel dans ce sens : Schulden haben'),
        nom('der', 'Auftrag', 'Aufträge', 'la commande (d’un client)'),
        mot('stolz auf', 'fier de', '+ accusatif : stolz auf jemanden sein'),
      ],
      questions: [
        choice('q1', bi('Wo liegt der Ort, aus dem Inges Familie stammt, heute?', 'Où se trouve aujourd’hui le lieu d’où vient la famille d’Inge ?'), [
          ['in Österreich'],
          ['in Tschechien'],
          ['in Polen', true],
        ], 'Le village de la famille d’Inge se trouve aujourd’hui en Pologne ; à l’époque où ses parents y vivaient, avant la Seconde Guerre mondiale, il faisait partie de l’Allemagne. Après la défaite, ses parents ont dû partir.'),
        rf('q2', ['Inge ist in dem Dorf geboren, aus dem ihre Familie kommt.', 'Inge est née dans le village d’où vient sa famille.'], 'falsch',
          'Faux : quand ses parents ont dû partir, Inge n’était pas encore née. Elle est retournée quelques fois dans ce village avec eux, et sa mère lui en a beaucoup parlé, mais elle dit que son Heimat, c’est l’Allemagne.'),
        choice('q3', bi('Woran erinnert sich Selma, wenn sie das Foto von ihrem sechzehnten Geburtstag sieht?', 'De quoi Selma se souvient-elle en voyant la photo de ses seize ans ?'), [
          ['an ein großes Fest mit sehr viel Essen', true],
          ['an ihren ersten Schultag in Syrien'],
          ['an eine Reise mit vielen Touristen'],
        ], 'Selma se souvient très bien de ses seize ans : la fête était superbe, et il y avait tellement à manger que tout le monde se sentait mal le soir. Les touristes, eux, sont évoqués à propos de sa ville avant la guerre.'),
        match('q4', bi('Wer sagt oder macht was? Verbinden Sie.', 'Qui dit ou fait quoi ? Associez.'), [
          ['Inge', 'fühlt sich in Deutschland zu Hause'],
          ['Selma', 'möchte gern nach Syrien zurück'],
          ['Otto', 'sammelt alte Fahrräder'],
          ['Nico', 'findet das alte Fahrrad nicht stabil'],
          ['Yara', 'erklärt Nico die deutsche Geschichte'],
        ], 'Inge dit que son Heimat est ici, en Allemagne, tandis que Selma aimerait rentrer chez elle, ce qui est impossible pour l’instant. Otto collectionne les vélos ; Nico trouve que le vieux vélo n’est que de la ferraille, et Yara lui raconte la RDA et la réunification.'),
        choice('q5', bi('Nico fragt Yara, was das Wort „Wende“ bedeutet. Was bedeutet es hier?', 'Nico demande à Yara ce que veut dire le mot « Wende ». Que signifie-t-il ici ?'), [
          ['un virage dangereux sur une route de montagne'],
          ['la période de la réunification allemande', true],
          ['le retour des réfugiés dans leur pays d’origine'],
        ], 'Wende signifie littéralement « tournant ». Yara explique que c’est le nom donné à la période de la réunification, quand l’Allemagne de l’Est et celle de l’Ouest sont devenues un seul pays. Le mot n’a ici rien à voir avec la route.'),
        fill('q6', bi('Ergänzen Sie die Sätze.', 'Complétez les phrases.'), 'Die Klappräder werden heute nicht mehr gebaut, weil es die [[1]] nicht mehr gibt. In Syrien hat Ibrahim als [[2]] gearbeitet.', [
          ['Firma', 'Fabrik', 'Herstellerfirma'],
          ['Arzt', 'Urologe', 'Mediziner'],
        ], 'Yara explique que l’entreprise qui fabriquait ces vélos pliants n’existe plus : beaucoup d’entreprises de l’ex-RDA ont fermé après la Wende. Au restaurant, Ibrahim raconte qu’il était médecin en Syrie, plus précisément urologue.'),
        choice('q7', bi('Was erfahren Yara und Nico über Pepe?', 'Qu’apprennent Yara et Nico au sujet de Pepe ?'), [
          ['Er will zurück nach Spanien gehen.'],
          ['Er hat ein neues Restaurant gekauft.'],
          ['Er hat Schulden und braucht Aufträge.', true],
          ['Er arbeitet jetzt für Max und Tarek.'],
        ], 'Pepe finit par avouer que son entreprise va mal : il a des dettes et a besoin de commandes. Nico entend tout, lui à qui leurs parents citaient toujours Pepe en exemple. Yara exige la vérité, mais lui confie quand même son site.'),
        order('q8', ordnen, [
          ['Inge erzählt, woher ihre Familie kommt.', 'Selma zeigt Fotos von ihrer Heimatstadt.', 'Yara kauft Otto ein altes Fahrrad ab.', 'Tarek hat eine neue Idee für den Lieferservice.', 'Pepe gibt zu, dass er gelogen hat.'],
        ], 'Le cours commence par l’histoire de la famille d’Inge, puis Selma montre ses photos. Viennent ensuite l’achat du vélo pliant, l’idée de Tarek au restaurant (livrer gratuitement des institutions) et enfin les aveux de Pepe.'),
      ],
    },
    // 4 · Folgen 15–20
    {
      title: 'Der erste Schritt',
      episodes: [15, 20], start: '26:03', end: '34:58', approx: true,
      context: contexte({
        episodes: [15, 20],
        situation: [
          ['Lisa und Nina sind auf dem Weg zu einem wichtigen Arzttermin. Beide haben gerade viel Stress.', 'Lisa et Nina se rendent à un rendez-vous médical important. Toutes les deux sont très stressées en ce moment.'],
          ['Nico und Pepe treffen sich im Park und sprechen über die letzten Jahre.', 'Nico et Pepe se retrouvent au parc et parlent des dernières années.'],
          ['Selma sucht einen Weg ins Berufsleben, und auch Nico muss eine Bewerbung schreiben.', 'Selma cherche sa voie vers la vie professionnelle, et Nico aussi doit écrire une candidature.'],
        ],
        questions: [
          ['Was gehört zu einer guten Bewerbung?', 'Que faut-il pour une bonne candidature ?'],
          ['Warum kann ein Praktikum nützlich sein, wenn man noch nicht weiß, was man werden will?', 'Pourquoi un stage peut-il être utile quand on ne sait pas encore ce qu’on veut faire ?'],
        ],
        focus: [
          ['Achten Sie auf die Ratschläge: Wer rät wem was?', 'Soyez attentif aux conseils : qui conseille quoi à qui ?'],
        ],
      }),
      keywords: [
        nom('die', 'Beratung', 'Beratungen', 'le conseil, la consultation (auprès d’un service)'),
        mot('aufgeben', 'abandonner, renoncer', 'séparable : Wir geben nicht auf.'),
        mot('versprechen', 'promettre', 'Perfekt : hat versprochen ; das Versprechen : la promesse'),
        nom('die', 'Aufenthaltserlaubnis', 'Aufenthaltserlaubnisse', 'le titre de séjour'),
        nom('das', 'Praktikum', 'Praktika', 'le stage'),
        nom('die', 'Stellenanzeige', 'Stellenanzeigen', 'l’offre d’emploi (annonce)'),
        nom('die', 'Bewerbung', 'Bewerbungen', 'la candidature', 'sich bewerben für / um (+ accusatif) : postuler à'),
        nom('der', 'Lebenslauf', 'Lebensläufe', 'le CV'),
        nom('das', 'Motivationsschreiben', 'Motivationsschreiben', 'la lettre de motivation'),
        nom('die', 'Zusage', 'Zusagen', 'la réponse positive', 'contraire : die Absage'),
      ],
      questions: [
        choice('q1', bi('Warum ist Lisa in letzter Zeit so gestresst?', 'Pourquoi Lisa est-elle si stressée ces derniers temps ?'), [
          ['Sie sucht dringend eine neue Wohnung.'],
          ['Sie hat bald selbst eine Prüfung.'],
          ['Ihre Schüler haben schlechte Noten.'],
          ['Einige Kollegen von ihr sind krank.', true],
        ], 'Lisa explique à Nina qu’elle est très stressée parce que plusieurs collègues sont malades. Nina lui conseille de travailler moins et d’apprendre à dire non. Il n’est question ni de logement, ni d’examen, ni des notes de ses élèves.'),
        rf('q2', ['Nina weiß schon sicher, dass sie das Kind haben will.', 'Nina sait déjà avec certitude qu’elle veut garder l’enfant.'], 'falsch',
          'Faux : sur le chemin du rendez-vous, Nina avoue qu’elle ne sait toujours pas si elle veut cet enfant ; Sebastian la presse de se décider. Lisa l’encourage et lui suggère de consulter un service de conseil.'),
        match('q3', bi('Wer rät was? Verbinden Sie.', 'Qui conseille quoi ? Associez.'), [
          ['Nina', 'weniger arbeiten und auch mal Nein sagen'],
          ['die Beraterin', 'sich für ein Praktikum bewerben'],
          ['Pepe', 'das Motivationsschreiben persönlicher machen'],
          ['Selma', 'sich vorher über die Schule informieren'],
        ], 'Nina conseille à Lisa de travailler moins et de savoir dire non. La conseillère propose à Selma un stage en entreprise. Pepe trouve que la lettre de motivation de Nico doit être plus personnelle, et Selma lui recommande de bien se renseigner sur l’école avant l’entretien.'),
        choice('q4', bi('Warum hat Selma ihre Bewerbung noch nicht abgeschickt?', 'Pourquoi Selma n’a-t-elle pas encore envoyé sa candidature ?'), [
          ['Sie war nur eine Übung im Sprachkurs.', true],
          ['Ihre Mutter hat es ihr verboten.'],
          ['Sie hat keine passende Stelle gefunden.'],
        ], 'Selma explique que ce texte ne répondait à aucune offre précise : c’était un exercice de son cours de langue. La conseillère trouve qu’il est temps de passer de la théorie à la pratique. Sa mère est présente et la soutient.'),
        fill('q5', bi('Ergänzen Sie.', 'Complétez.'), 'Mit ihrer Aufenthaltserlaubnis darf Selma in Deutschland wohnen, [[1]] und studieren. Die [[2]]-Prüfung hat sie schon bestanden.', [
          ['arbeiten'],
          ['B1'],
        ], 'La conseillère rappelle que le titre de séjour de Selma lui permet non seulement d’habiter en Allemagne, mais aussi d’y travailler ou d’y étudier. Selma a réussi l’examen B1, et la conseillère pense que le B2 ne lui posera aucun problème.'),
        choice('q6', bi('Was sagt Selma, als ihre Mutter ins Zimmer kommt?', 'Que dit Selma quand sa mère entre dans la chambre ?'), [
          ['Sie telefoniert mit Lisa wegen der Hausaufgaben.'],
          ['Sie spricht mit der Berufsberaterin.'],
          ['Sie übt Sätze für ein Bewerbungsgespräch.', true],
        ], 'Selma est au téléphone avec Nico, mais elle prétend s’entraîner à des phrases pour un entretien d’embauche : ses parents ne doivent pas savoir qu’elle lui parle. Sa mère l’encourage, puis lui demande de l’aider pour le repas.'),
        choice('q7', bi('Was hat Pepe gerade verkauft?', 'Qu’est-ce que Pepe vient de vendre ?'), [
          ['sein Auto', true],
          ['seine Firma'],
          ['seine Wohnung'],
        ], 'En arrivant au magasin, Pepe annonce qu’il vient de vendre sa voiture, et Yara s’en réjouit : elle lui avait demandé d’en finir avec les dépenses de prestige pour repartir de zéro. Son entreprise, elle, existe toujours.'),
        order('q8', ordnen, [
          ['Nina wartet mit Tee auf Lisa.', 'Pepe und Nico versprechen sich etwas.', 'Selma liest Nico Stellenanzeigen vor.', 'Pepe liest Nicos Lebenslauf.', 'Selma erzählt Nico von ihrer Zusage.'],
        ], 'La séquence s’ouvre sur Nina qui attend Lisa avec du thé. Au parc, les deux frères se promettent de ne pas abandonner. Selma lit ensuite des annonces à Nico au téléphone ; plus tard, Pepe relit le CV de Nico, et enfin Selma annonce qu’elle est prise en stage.'),
      ],
    },
    // 5 · Folgen 21–25
    {
      title: 'Typisch Mann, typisch Frau?',
      episodes: [21, 25], start: '34:58', end: '43:02', approx: true,
      context: contexte({
        episodes: [21, 25],
        situation: [
          ['Yara hat ein Problem mit ihrer neuen Webseite und ruft Pepe zu Hilfe.', 'Yara a un problème avec son nouveau site et appelle Pepe à l’aide.'],
          ['Im Restaurant schwärmt Inge von ihrem Freund Jacques, und Sebastian arbeitet an Fotos über Berufe.', 'Au restaurant, Inge ne tarit pas d’éloges sur son ami Jacques, et Sebastian travaille à des photos sur les métiers.'],
          ['Auch Ibrahim hat bei der Arbeit einen schwierigen Tag.', 'Ibrahim aussi passe une journée difficile au travail.'],
        ],
        questions: [
          ['Welche Berufe gelten oft als typische Frauen- oder Männerberufe?', 'Quels métiers passent souvent pour typiquement féminins ou masculins ?'],
          ['Welche Klischees über Männer und Frauen hört man oft?', 'Quels clichés sur les hommes et les femmes entend-on souvent ?'],
        ],
        focus: [
          ['Achten Sie auf die Adjektive, mit denen die Personen Männer und Frauen beschreiben.', 'Soyez attentif aux adjectifs avec lesquels les personnages décrivent les hommes et les femmes.'],
        ],
      }),
      keywords: [
        nom('das', 'Klischee', 'Klischees', 'le cliché, le stéréotype'),
        mot('rücksichtsvoll', 'attentionné, plein d’égards', 'contraire : rücksichtslos'),
        mot('schlank', 'mince'),
        nom('die', 'Gleichberechtigung', null, 'l’égalité des droits'),
        nom('der', 'Gehaltsunterschied', 'Gehaltsunterschiede', 'l’écart de salaire'),
        nom('der', 'Handwerker', 'Handwerker', 'l’artisan (plombier, maçon…)'),
        nom('der', 'Haushalt', 'Haushalte', 'le ménage, les tâches ménagères', 'den Haushalt machen : faire le ménage'),
        nom('der', 'Krankenwagen', 'Krankenwagen', 'l’ambulance'),
        nom('die', 'Überweisung', 'Überweisungen', 'le virement', 'überweisen : virer de l’argent'),
        mot('stornieren', 'annuler (une réservation)'),
      ],
      questions: [
        choice('q1', bi('Warum ärgert sich Yara über Pepe?', 'Pourquoi Yara est-elle fâchée contre Pepe ?'), [
          ['Er redet in Klischees über Frauen und Technik.', true],
          ['Er verlangt plötzlich viel Geld für seine Hilfe.'],
          ['Er kommt erst am nächsten Tag zu ihr in den Laden.'],
        ], 'Pepe répare le site en un instant, puis enchaîne les clichés sur les femmes et la technique. Yara trouve ce stéréotype stupide et lui répond que beaucoup de femmes programment mieux que lui. Il est venu vite et ne lui demande pas d’argent.'),
        rf('q2', ['Pepe sagt, dass sein Satz über Yaras Fahrradreparaturen ein Kompliment war.', 'Pepe dit que sa phrase sur les réparations de vélos de Yara était un compliment.'], 'richtig',
          'Vrai : après sa remarque sur les femmes et la technique, Pepe ajoute que Yara sait au moins réparer des vélos, et il présente cela comme un compliment. Yara, elle, ne le prend pas du tout comme ça.'),
        choice('q3', bi('Wen erkennt Nico auf dem Foto von Jacques?', 'Qui Nico reconnaît-il sur la photo de Jacques ?'), [
          ['einen Kollegen von Max und Tarek'],
          ['den Vermieter von Yaras Laden'],
          ['Otto, den Fahrradhändler von Yara', true],
        ], 'Inge montre enfin une photo de Jacques, grand, mince, aux beaux yeux. Nico demande à la revoir : pour lui, c’est Otto, le marchand de vélos de Yara. Inge trouve cette idée absurde et assure que c’est bien Jacques.'),
        match('q4', bi('Wer sagt oder macht was? Verbinden Sie.', 'Qui dit ou fait quoi ? Associez.'), [
          ['Inge', 'findet Jacques charmant und romantisch'],
          ['Sebastian', 'macht Fotos zum Thema Frauen- und Männerberufe'],
          ['Nina', 'will so lange wie möglich arbeiten'],
          ['Ibrahims Kollege', 'ärgert sich über seine Chefin'],
          ['Jacques', 'hat angeblich Probleme mit der Bank'],
        ], 'Inge décrit Jacques comme attentionné, charmant et romantique. Sebastian prépare des photos sur les métiers dits d’hommes et de femmes. Nina veut travailler aussi longtemps que possible ; le collègue d’Ibrahim s’emporte contre sa cheffe, et Jacques dit avoir un problème avec sa banque.'),
        choice('q5', bi('Nina sagt: „Mitbewohner Nummer fünf!“ Was meint sie damit?', 'Nina dit : « Mitbewohner Nummer fünf! » Que veut-elle dire ?'), [
          ['Elle garde le bébé : ce sera le cinquième habitant.', true],
          ['Elle cherche un nouveau colocataire pour la chambre libre.'],
          ['Elle a déjà eu quatre colocataires avant Sebastian.'],
        ], 'Sebastian demande si Nina veut vraiment garder le bébé. En répondant « colocataire numéro cinq », Nina dit oui à sa manière : la colocation compte déjà quatre habitants (Lisa, Nina, Sebastian et Nico), le bébé sera le cinquième.'),
        fill('q6', bi('Ergänzen Sie.', 'Complétez.'), 'Sebastian hat einen Fotoauftrag von einer [[1]] bekommen. Auf seinem Foto trägt eine Frau die Kleidung eines [[2]].', [
          ['Frauenzeitschrift', 'Zeitschrift'],
          ['Bauarbeiters', 'Bauarbeiter'],
        ], 'Sebastian a reçu une commande d’un magazine féminin ; Nina trouve que la photo ressemble plutôt à un magazine pour hommes. Il y montre une femme en tenue d’ouvrier du bâtiment. Au génitif, Bauarbeiter prend un -s : die Kleidung eines Bauarbeiters.'),
        order('q7', ordnen, [
          ['Pepe löst Yaras Problem mit der Webseite.', 'Nico sieht ein Foto von Jacques.', 'Sebastian zeigt Nina sein neues Foto.', 'Ibrahims Kollege ruft einen Krankenwagen.', 'Jacques füllt ein Profil im Internet aus.'],
        ], 'Pepe dépanne d’abord le site de Yara. Au restaurant, Nico voit ensuite la photo de Jacques. Dans la colocation, Sebastian montre sa photo à Nina ; puis Ibrahim fait un malaise et son collègue appelle une ambulance. Enfin, Jacques remplit un profil en ligne.'),
        choice('q8', bi('Warum bezahlt Inge am Ende die Reise?', 'Pourquoi Inge paie-t-elle finalement le voyage ?'), [
          ['Jacques hat die Reise vergessen und kein Geld dabei.'],
          ['Inge will nicht, dass Jacques allein in Urlaub fährt.'],
          ['Jacques sagt, dass seine Bank die Überweisung nicht schafft.', true],
        ], 'Jacques prétend que sa banque n’arrive pas à traiter son virement, alors que l’hôtel et le trajet doivent être payés le jour même. Plutôt que d’annuler, Inge propose de payer : elle lui fait confiance, il la remboursera plus tard.'),
      ],
    },
    // 6 · Folgen 26–30
    {
      title: 'Funkstille',
      episodes: [26, 30], start: '43:02', end: '50:13', approx: true,
      context: contexte({
        episodes: [26, 30],
        situation: [
          ['In der WG gibt es Streit ums Putzen. Nico ist mit den Gedanken woanders.', 'Dans la colocation, on se dispute à propos du ménage. Nico a la tête ailleurs.'],
          ['Selma antwortet nicht mehr auf seine Nachrichten. Was ist los?', 'Selma ne répond plus à ses messages. Que se passe-t-il ?'],
          ['Später ärgert sich Lisa über ihre Gehaltsabrechnung, und Yara kommt mit einer Idee in die WG.', 'Plus tard, Lisa s’énerve à cause de sa fiche de paie, et Yara passe à la colocation avec une idée.'],
        ],
        questions: [
          ['Warum antwortet jemand vielleicht nicht auf Anrufe und Nachrichten?', 'Pourquoi quelqu’un ne répond-il peut-être pas aux appels et aux messages ?'],
          ['Was wird in Deutschland vom Bruttogehalt abgezogen?', 'Qu’est-ce qui est retenu sur le salaire brut en Allemagne ?'],
        ],
        focus: [
          ['Achten Sie auf die Erklärungen, die Nina, Sebastian und später Selma geben.', 'Soyez attentif aux explications que donnent Nina, Sebastian, puis Selma.'],
          ['Achten Sie auch auf die Wörter für Steuern und Versicherungen.', 'Soyez aussi attentif aux mots qui désignent les impôts et les assurances.'],
        ],
      }),
      keywords: [
        nom('der', 'Putzplan', 'Putzpläne', 'le planning du ménage'),
        nom('die', 'Schwangerschaft', 'Schwangerschaften', 'la grossesse'),
        nom('die', 'Beziehungskrise', 'Beziehungskrisen', 'la crise dans le couple'),
        mot('verunsichern', 'faire douter, déstabiliser', 'inséparable : Du verunsicherst ihn.'),
        nom('der', 'Herzinfarkt', 'Herzinfarkte', 'l’infarctus, la crise cardiaque'),
        nom('die', 'Arbeitsbedingung', 'Arbeitsbedingungen', 'la condition de travail', 'surtout au pluriel : die Arbeitsbedingungen'),
        mot('hilfsbereit', 'serviable'),
        nom('das', 'Bruttogehalt', 'Bruttogehälter', 'le salaire brut', 'contraire : das Nettogehalt'),
        nom('die', 'Kirchensteuer', 'Kirchensteuern', 'l’impôt d’Église', 'aus der Kirche austreten : quitter l’Église'),
        nom('die', 'Versicherung', 'Versicherungen', 'l’assurance', 'die Krankenversicherung, die Rentenversicherung…'),
      ],
      questions: [
        order('q1', ordnen, [
          ['Sebastian bittet Nico um ein Putztuch.', 'Nina und Sebastian geben Nico Tipps.', 'Nico wartet vor Selmas Haus.', 'Sebastian trifft Selma auf der Straße.', 'Yara zeigt ihre neue Webseite.'],
        ], 'Sebastian réclame d’abord un chiffon à Nico. Nina et Sebastian lui donnent ensuite des conseils à propos de Selma, puis Nico va l’attendre devant chez elle. Plus tard, Sebastian croise Selma dans la rue, et pour finir Yara montre son nouveau site à la colocation.'),
        match('q2', bi('Wer sagt das? Verbinden Sie.', 'Qui dit cela ? Associez.'), [
          ['Nina', 'Selma hat bestimmt einfach keine Zeit.'],
          ['Sebastian', 'Selma will Nico vielleicht testen.'],
          ['Nico', 'Er hat Selma schon dreimal angerufen.'],
          ['Selma', 'Ihre Eltern erlauben die Treffen nicht.'],
        ], 'Nico s’inquiète : il a déjà appelé Selma trois fois. Nina pense qu’elle n’a sans doute pas le temps, avec son stage ; Sebastian imagine qu’elle veut le tester, ou qu’elle est fâchée. Selma donne enfin la vraie raison : ses parents interdisent leurs rencontres.'),
        choice('q3', bi('Was ist mit Selmas Vater passiert?', 'Qu’est-il arrivé au père de Selma ?'), [
          ['Er hat seine Arbeit verloren.'],
          ['Er ist allein nach Syrien gereist.'],
          ['Er hatte einen Herzinfarkt.', true],
        ], 'Selma explique que son père est de nouveau à l’hôpital : il a fait un infarctus et doit être opéré. Elle ne veut pas que ses parents s’inquiètent davantage en ce moment. Nico lui dit que ce n’est pas sa faute.'),
        rf('q4', ['Selma arbeitet in ihrem Praktikum meistens im Team.', 'Pendant son stage, Selma travaille surtout en équipe.'], 'falsch',
          'Faux : Selma raconte à Sebastian qu’elle travaille peu en équipe et n’a pas beaucoup affaire à la plupart de ses collègues, ce qu’elle regrette un peu. Ils déjeunent cependant ensemble tous les midis.'),
        fill('q5', bi('Wie beschreibt Selma ihr Praktikum? Ergänzen Sie.', 'Comment Selma décrit-elle son stage ? Complétez.'), 'Die Arbeitszeiten sind an manchen Tagen ziemlich [[1]]. Ihr Chef ist [[2]], aber hilfsbereit und verständnisvoll.', [
          ['lang'],
          ['streng'],
        ], 'Selma trouve les conditions de travail excellentes, même si les journées sont parfois longues. Son chef est strict, mais serviable et compréhensif, et elle apprécie d’avoir des tâches à responsabilité.'),
        choice('q6', bi('Sebastian fragt: „Soll ich ihn von dir grüßen?“ Selma antwortet: „Besser nicht.“ Was meint sie?', 'Sebastian demande : « Soll ich ihn von dir grüßen? » Selma répond : « Besser nicht. » Que veut-elle dire ?'), [
          ['Elle préfère qu’il ne transmette pas son bonjour.', true],
          ['Elle pense que Nico va beaucoup mieux sans elle.'],
          ['Elle compte saluer Nico elle-même dès ce soir.'],
        ], '« Besser nicht » signifie « mieux vaut pas » : Selma ne veut pas que Sebastian transmette ses salutations à Nico. Elle a pourtant demandé de ses nouvelles, ce qui montre qu’elle tient à lui malgré l’interdiction de ses parents.'),
        choice('q7', bi('Was stimmt nicht auf Lisas Gehaltsabrechnung?', 'Qu’est-ce qui ne va pas sur la fiche de paie de Lisa ?'), [
          ['Ihr Gehalt ist seit zwei Monaten nicht gekommen.'],
          ['Ihre Krankenversicherung ist doppelt so teuer.'],
          ['Sie zahlt Kirchensteuer, obwohl sie ausgetreten ist.', true],
        ], 'Yara repère l’impôt d’Église parmi les retenues. Or Lisa a quitté l’Église il y a des années : dans ce cas, elle n’a plus à payer cet impôt. Yara lui conseille d’appeler pour vérifier. Le reste (impôt sur le revenu, assurances) est normal.'),
        choice('q8', bi('Warum braucht Yara Hilfe im Laden und in der Werkstatt?', 'Pourquoi Yara a-t-elle besoin d’aide au magasin et à l’atelier ?'), [
          ['Seit ihre Webseite online ist, hat sie viel mehr Kunden.', true],
          ['Sie will bald einen zweiten Laden in der Stadt eröffnen.'],
          ['Sie muss für ein paar Monate nach Spanien reisen.'],
        ], 'Depuis que son nouveau site est en ligne, Yara a presque deux fois plus de clients. Elle ne s’en sort plus seule et ne veut pas les perdre : c’est pourquoi elle se tourne vers Nico et lui annonce qu’elle a une proposition à lui faire.'),
      ],
    },
    // 7 · Folgen 31–36
    {
      title: 'Ein Angebot und viele Fragen',
      episodes: [31, 36], start: '50:13', end: '56:23', approx: true,
      context: contexte({
        episodes: [31, 36],
        situation: [
          ['Selmas Vater ist wieder zu Hause. Lisa hilft der Familie mit den Papieren und ruft bei der Versicherung an.', 'Le père de Selma est de retour à la maison. Lisa aide la famille avec les papiers et appelle l’assurance.'],
          ['In der WG denken Nina und Sebastian an ihre Schulzeit zurück, während Lisa arbeiten will.', 'Dans la colocation, Nina et Sebastian repensent à leurs années d’école, pendant que Lisa veut travailler.'],
          ['Im Fahrradladen spricht Nico mit Yara über seine Zukunft.', 'Au magasin de vélos, Nico parle de son avenir avec Yara.'],
        ],
        questions: [
          ['Was bezahlt eine Versicherung, wenn jemand lange krank ist?', 'Que paie une assurance quand quelqu’un est longtemps malade ?'],
          ['Welche Fächer mochten Sie in der Schule, und welche nicht?', 'Quelles matières aimiez-vous à l’école, et lesquelles non ?'],
          ['Welche Schulabschlüsse gibt es in Ihrem Land?', 'Quels diplômes de fin d’études existe-t-il dans votre pays ?'],
        ],
        focus: [
          ['Achten Sie auf die gute und die schlechte Nachricht der Versicherung.', 'Soyez attentif à la bonne et à la mauvaise nouvelle de l’assurance.'],
        ],
      }),
      keywords: [
        nom('der', 'Unfallbericht', 'Unfallberichte', 'le rapport d’accident'),
        nom('die', 'Reha', 'Rehas', 'la rééducation', 'abréviation de die Rehabilitation'),
        mot('krankgeschrieben', 'en arrêt maladie', 'krankgeschrieben sein'),
        mot('befristet', 'à durée déterminée', 'ein befristeter Arbeitsvertrag : un CDD'),
        mot('ungerecht', 'injuste'),
        nom('das', 'Lieblingsfach', 'Lieblingsfächer', 'la matière préférée'),
        nom('das', 'Zeugnis', 'Zeugnisse', 'le bulletin scolaire, le certificat'),
        nom('die', 'Berufsschule', 'Berufsschulen', 'l’école professionnelle', 'pendant l’Ausbildung, on alterne entreprise et Berufsschule'),
        nom('der', 'Meisterbetrieb', 'Meisterbetriebe', 'l’entreprise d’un maître artisan', 'elle peut former des apprentis (ausbilden)'),
        nom('die', 'Privatstunde', 'Privatstunden', 'le cours particulier'),
      ],
      questions: [
        choice('q1', bi('Was ist die gute Nachricht von der Versicherung?', 'Quelle est la bonne nouvelle de l’assurance ?'), [
          ['Sie zahlt die Miete der Familie bis zum Sommer.'],
          ['Sie zahlt Ibrahims Gehalt für drei Monate.'],
          ['Sie bezahlt die Reha, wenn ein Arzt sie verordnet.', true],
        ], 'Lisa annonce d’abord la bonne nouvelle : si un médecin prescrit la rééducation, l’assurance la paie. La mauvaise suit aussitôt : Ibrahim risque de ne plus toucher de salaire. L’assurance ne paie ni le loyer ni le salaire.'),
        choice('q2', bi('Warum bekommt Ibrahim in dieser Zeit vielleicht kein Gehalt?', 'Pourquoi Ibrahim risque-t-il de ne pas toucher de salaire pendant cette période ?'), [
          ['Sein befristeter Vertrag endet diese Woche.', true],
          ['Er war bei der Arbeit nicht versichert.'],
          ['Er hat seine Krankmeldung zu spät geschickt.'],
        ], 'Ibrahim a un contrat à durée déterminée qui se termine cette semaine. S’il ne peut pas travailler, l’employeur ne le prolongera sans doute pas et n’a donc plus à le payer. Selma trouve cela injuste, mais il ne s’agit pas d’un accident du travail.'),
        match('q3', bi('Wer ist das? Verbinden Sie.', 'Qui est-ce ? Associez.'), [
          ['Sebastian', 'hatte Sport als Lieblingsfach'],
          ['Nina', 'fand Mathe in der Schule schrecklich'],
          ['Lisa', 'möchte in Ruhe arbeiten'],
          ['Yara', 'erklärt Nico die deutschen Schulabschlüsse'],
        ], 'Sebastian adorait le sport, tandis que Nina préférait l’allemand et l’histoire et détestait les maths. Lisa leur demande de faire moins de bruit, car elle veut travailler. Au magasin, Yara présente à Nico les diplômes scolaires allemands.'),
        choice('q4', bi('Was muss Nico als Erstes tun, damit er die Ausbildung beginnen kann?', 'Que doit faire Nico en premier pour pouvoir commencer la formation ?'), [
          ['ein Praktikum in einer Werkstatt machen'],
          ['seine spanischen Zeugnisse übersetzen lassen', true],
          ['sich an einer Universität einschreiben'],
        ], 'Yara explique les étapes : d’abord faire traduire ses diplômes espagnols ; dès qu’il aura une place à l’école professionnelle, il pourra commencer la formation chez elle. Il devra aussi prouver son niveau d’allemand avec l’examen B1.'),
        fill('q5', bi('Ergänzen Sie die deutschen Schulabschlüsse.', 'Complétez avec les diplômes scolaires allemands.'), 'Es gibt den Hauptschulabschluss, den Realschulabschluss und das [[1]]. Das macht man auf dem [[2]].', [
          ['Abitur'],
          ['Gymnasium'],
        ], 'Yara cite les trois diplômes de fin de scolarité : Hauptschulabschluss, Realschulabschluss et Abitur, que l’on passe au Gymnasium (le lycée général). Avec son diplôme espagnol, Nico pourrait sans doute étudier, mais il doit se renseigner.'),
        choice('q6', bi('Lisa sagt über ihre Privatschüler: „Ich will niemanden im Stich lassen.“ Was bedeutet das?', 'Lisa dit à propos de ses élèves particuliers : « Ich will niemanden im Stich lassen. » Qu’est-ce que cela veut dire ?'), [
          ['Je ne veux obliger personne à venir.'],
          ['Je ne veux déranger personne.'],
          ['Je ne veux laisser tomber personne.', true],
        ], 'Jemanden im Stich lassen signifie « laisser tomber quelqu’un ». Lisa sait qu’elle doit réduire sa charge de travail, mais elle ne veut pas abandonner ses élèves : avec qui apprendraient-ils, sinon ?'),
        rf('q7', ['Lisa sagt ihrer Klasse, dass Bauarbeiter ein Beruf nur für Männer ist.', 'Lisa dit à sa classe qu’ouvrier du bâtiment est un métier réservé aux hommes.'], 'falsch',
          'Faux : Lisa reconnaît que beaucoup d’hommes travaillent dans le bâtiment et beaucoup de femmes dans les jardins d’enfants, mais elle insiste : chacun peut apprendre le métier qui l’intéresse. Zora peut devenir ouvrière du bâtiment, Alan éducateur.'),
        order('q8', ordnen, [
          ['Selma bittet Lisa, den Unfallbericht zu lesen.', 'Lisa telefoniert mit der Versicherung.', 'Lisa beschwert sich über den Lärm in der WG.', 'Yara erklärt Nico die Schritte zur Ausbildung.', 'Lisa zeigt ihrer Klasse Fotos von Berufen.'],
        ], 'Chez les Al-Pascha, Selma demande d’abord à Lisa de lire le rapport d’accident, puis Lisa appelle l’assurance. Dans la colocation, elle se plaint ensuite du bruit. Yara explique alors à Nico les étapes de sa formation, et enfin Lisa montre les photos à sa classe.'),
      ],
    },
    // 8 · Folgen 37–42
    {
      title: 'Jeder auf seinem Weg',
      episodes: [37, 42], start: '56:23', end: '64:01', approx: true,
      context: contexte({
        episodes: [37, 42],
        situation: [
          ['Pepe erzählt von seiner Firma und sagt seine Meinung zu Nicos Berufswahl.', 'Pepe parle de son entreprise et donne son avis sur le choix de métier de Nico.'],
          ['Auch Selma und Sebastian haben Neuigkeiten von ihrer Arbeit und ihrem Studium.', 'Selma et Sebastian aussi ont des nouvelles de leur travail et de leurs études.'],
          ['Draußen ist es kalt geworden. Im Fahrradladen steht plötzlich ein Kunde, den Yara nicht kennt.', 'Dehors, il fait froid. Au magasin de vélos arrive soudain un client que Yara ne connaît pas.'],
        ],
        questions: [
          ['Was ist Ihnen bei einem Beruf wichtiger: viel Geld oder Spaß an der Arbeit?', 'Qu’est-ce qui compte le plus pour vous dans un métier : gagner beaucoup d’argent ou aimer son travail ?'],
          ['Möchten Sie lieber angestellt sein oder Ihr eigener Chef? Warum?', 'Préféreriez-vous être salarié ou votre propre patron ? Pourquoi ?'],
        ],
        focus: [
          ['Achten Sie auf die Vor- und Nachteile, die die Personen nennen.', 'Soyez attentif aux avantages et aux inconvénients que citent les personnages.'],
        ],
      }),
      keywords: [
        mot('entlassen', 'licencier', 'Perfekt : hat entlassen'),
        mot('anerkennen', 'reconnaître (un diplôme)', 'séparable ; passif : Das Diplom wird anerkannt.'),
        nom('die', 'Umschulung', 'Umschulungen', 'la reconversion professionnelle'),
        nom('der', 'Wettbewerb', 'Wettbewerbe', 'le concours'),
        nom('der', 'Entwurf', 'Entwürfe', 'le projet, l’esquisse'),
        nom('die', 'Brücke', 'Brücken', 'le pont'),
        nom('der', 'Jahrgang', 'Jahrgänge', 'la promotion (d’étudiants)', 'der beste Abschluss im Jahrgang'),
        nom('die', 'Studiengebühr', 'Studiengebühren', 'les frais d’inscription à l’université', 'surtout au pluriel'),
        mot('wetterfühlig', 'sensible aux changements de temps'),
        nom('die', 'Sehenswürdigkeit', 'Sehenswürdigkeiten', 'le monument, le lieu touristique'),
      ],
      questions: [
        choice('q1', bi('Wo arbeitet Pepes Firma jetzt?', 'Où l’entreprise de Pepe travaille-t-elle maintenant ?'), [
          ['in einem kleinen Büro über Yaras Laden'],
          ['in den Räumen einer größeren Firma'],
          ['zu Hause oder in Cafés', true],
        ], 'Pepe a dû vendre ses bureaux : son équipe travaille désormais à domicile ou dans des cafés. C’est difficile, mais il n’a licencié personne. Il discute avec de petites entreprises et espère rembourser bientôt ses dettes.'),
        rf('q2', ['Für Nico ist es am wichtigsten, viel Geld zu verdienen.', 'Pour Nico, le plus important est de gagner beaucoup d’argent.'], 'falsch',
          'Faux : Pepe se demande de quoi Nico vivra avec des vélos cassés, mais Nico répond qu’il n’a pas besoin d’être riche : il veut aimer son travail. Pepe propose alors d’appeler leurs parents ensemble.'),
        choice('q3', bi('Mit welcher Nachricht kommt Nico von der Agentur für Arbeit?', 'Avec quelle nouvelle Nico revient-il de l’agence pour l’emploi ?'), [
          ['Sein spanischer Abschluss ist anerkannt worden.', true],
          ['Er braucht keine Sprachprüfung mehr zu machen.'],
          ['Er hat einen Studienplatz an der Universität.'],
        ], 'Nico annonce à Max que son diplôme espagnol a été reconnu : il pourra bientôt commencer sa formation. Il raconte que, petit, il aimait déjà réparer des objets. L’examen de langue, lui, reste nécessaire.'),
        match('q4', bi('Wer ist das? Verbinden Sie.', 'Qui est-ce ? Associez.'), [
          ['Pepe', 'schlägt Nico vor, sich bei ihm zu bewerben'],
          ['Max', 'hat mit Tarek eine Umschulung gemacht'],
          ['Selma', 'darf einen Entwurf für eine Brücke machen'],
          ['Sebastian', 'hat den besten Abschluss seines Jahrgangs'],
          ['Inge', 'hat im Urlaub die Pyramiden gesehen'],
        ], 'Pepe propose à Nico de postuler chez lui. Max raconte que Tarek et lui se sont reconvertis en ouvrant le restaurant. Selma peut proposer un projet de pont, Sebastian sort major de sa promotion et Inge a vu les pyramides pendant ses vacances.'),
        choice('q5', bi('Warum glaubt Selma nicht, dass sie den Wettbewerb gewinnt?', 'Pourquoi Selma ne croit-elle pas qu’elle gagnera le concours ?'), [
          ['Die anderen sind Architekten, die viel mehr wissen.', true],
          ['Ihr Chef ist mit ihrem Vorschlag nicht zufrieden.'],
          ['Sie darf als Praktikantin keinen Vorschlag machen.'],
        ], 'Selma est ravie de pouvoir proposer son propre projet de pont, mais le concours s’adresse à de jeunes architectes qui en savent bien plus qu’elle : elle pense donc avoir peu de chances. Son chef, lui, est très content d’elle.'),
        choice('q6', bi('Nico fragt, was „sich selbstständig machen“ bedeutet. Wie erklärt Sebastian das?', 'Nico demande ce que veut dire « sich selbstständig machen ». Comment Sebastian l’explique-t-il ?'), [
          ['Man lernt einen Beruf allein, ohne Schule und ohne Chef.'],
          ['Man ist sein eigener Chef und wählt seine Aufträge selbst.', true],
          ['Man zieht von zu Hause aus und lebt allein.'],
        ], 'Sebastian explique qu’être à son compte, c’est être son propre patron et choisir les commandes qu’on accepte. Lisa rappelle le revers : on peut aussi ne pas avoir de commandes du tout, comme Pepe. Sebastian remet la décision à plus tard.'),
        fill('q7', bi('Ergänzen Sie.', 'Complétez.'), 'Selma fährt mit dem Fahrrad zur Arbeit. Das ist [[1]] als eine Monatskarte für die Straßenbahn. Inge war mit Jacques in [[2]] im Urlaub.', [
          ['günstiger', 'billiger'],
          ['Ägypten'],
        ], 'Ibrahim explique que sa fille va au travail à vélo, ce qui coûte moins cher qu’un abonnement mensuel de tramway : il cherche lui aussi un vélo d’occasion. Inge, elle, revient d’Égypte, où la météo et les touristes l’ont fatiguée.'),
        order('q8', ordnen, [
          ['Pepe erzählt, dass er die Büros verkauft hat.', 'Max erklärt Nico das Wort „Umschulung“.', 'Selma erzählt Lisa von der Brücke.', 'Sebastian kommt mit einer guten Nachricht nach Hause.', 'Ibrahim kommt in Yaras Laden.'],
        ], 'Pepe annonce d’abord qu’il a vendu ses bureaux. Au restaurant, Max explique ensuite à Nico ce qu’est une reconversion. Selma parle à Lisa de son pont, Sebastian rentre à la colocation avec une bonne nouvelle, puis Ibrahim entre, gelé, dans le magasin de Yara.'),
      ],
    },
    // 9 · Folgen 43–48
    {
      title: 'Der Umwelt zuliebe',
      episodes: [43, 48], start: '64:01', end: '71:21', approx: true,
      context: contexte({
        episodes: [43, 48],
        situation: [
          ['Nico soll bald bei Yara anfangen. Max und Tarek ziehen ihn damit auf.', 'Nico doit bientôt commencer chez Yara. Max et Tarek le taquinent à ce sujet.'],
          ['Yara ärgert sich über einen Nachbarn, und Lisa sucht eine gute Idee für ihren Unterricht über Umweltschutz.', 'Yara s’énerve contre un voisin, et Lisa cherche une bonne idée pour son cours sur la protection de l’environnement.'],
          ['Dann plant Yara eine Aktion für Flüchtlinge und lernt dabei eine junge Frau kennen, von der sie schon gehört hat.', 'Puis Yara prépare une action pour les réfugiés et fait la connaissance d’une jeune femme dont elle a déjà entendu parler.'],
        ],
        questions: [
          ['Was tun Sie im Alltag für die Umwelt?', 'Que faites-vous au quotidien pour l’environnement ?'],
          ['Könnten Sie eine Woche ohne Plastik leben? Was wäre schwierig?', 'Pourriez-vous vivre une semaine sans plastique ? Qu’est-ce qui serait difficile ?'],
        ],
        focus: [
          ['Achten Sie auf die Argumente für den Umweltschutz und darauf, wie die anderen reagieren.', 'Soyez attentif aux arguments en faveur de l’environnement et à la réaction des autres.'],
        ],
      }),
      keywords: [
        nom('die', 'Gewohnheit', 'Gewohnheiten', 'l’habitude'),
        nom('der', 'Vermieter', 'Vermieter', 'le propriétaire (bailleur)', 'féminin : die Vermieterin'),
        nom('das', 'Abgas', 'Abgase', 'le gaz d’échappement', 'surtout au pluriel : die Abgase'),
        nom('die', 'Erwärmung', null, 'le réchauffement', 'die globale Erwärmung'),
        nom('das', 'Treibhausgas', 'Treibhausgase', 'le gaz à effet de serre'),
        mot('verzichten auf', 'renoncer à, se passer de', '+ accusatif : auf Plastik verzichten'),
        mot('umweltschädlich', 'nocif pour l’environnement'),
        nom('die', 'Solarzelle', 'Solarzellen', 'la cellule solaire'),
        nom('der', 'Flohmarkt', 'Flohmärkte', 'le marché aux puces'),
        mot('wegwerfen', 'jeter', 'séparable ; Perfekt : hat weggeworfen'),
      ],
      questions: [
        choice('q1', bi('Was sagen Max und Tarek über Nicos Zukunft im Fahrradladen?', 'Que disent Max et Tarek de l’avenir de Nico au magasin de vélos ?'), [
          ['Er wird dort sehr viel Geld verdienen.'],
          ['Er wird im Winter fast nichts zu tun haben.'],
          ['Er wird kaum noch Freizeit haben.', true],
        ], 'Pour taquiner Nico, Max et Tarek décrivent Yara comme une patronne exigeante : il travaillera jour et nuit et n’aura plus jamais de temps libre. Nico pense que l’hiver sera calme, mais eux roulent à vélo même sous la neige.'),
        choice('q2', bi('Worüber ärgert sich Yara bei ihrem Nachbarn Herrn Murz?', 'Qu’est-ce qui agace Yara chez son voisin, M. Murz ?'), [
          ['Er lässt den Motor seines Autos minutenlang laufen.', true],
          ['Er stellt jeden Abend seinen Müll vor ihren Laden.'],
          ['Er beschwert sich ständig über ihre Kunden.'],
        ], 'M. Murz laisse tourner le moteur de sa voiture pendant plusieurs minutes. Pour Yara, c’est du bruit et c’est mauvais pour l’environnement à cause des gaz d’échappement. Le propriétaire suppose qu’il voulait seulement chauffer la voiture.'),
        rf('q3', ['Yaras Vermieter hätte nichts gegen ein wärmeres Klima.', 'Le propriétaire de Yara ne serait pas contre un climat plus chaud.'], 'richtig',
          'Vrai : le propriétaire plaisante en disant qu’un changement climatique ne le fâcherait pas, tant il fait froid ce jour-là. Yara lui répond que le réchauffement climatique est un fait, causé par les gaz à effet de serre.'),
        match('q4', bi('Wer sagt oder macht was? Verbinden Sie.', 'Qui dit ou fait quoi ? Associez.'), [
          ['Sebastian', 'will die Klasse mit Zahlen überzeugen'],
          ['Nina', 'schlägt eine Woche ohne Plastik vor'],
          ['Lisa', 'möchte, dass die Schüler selbst aktiv werden'],
          ['Selma', 'will Solarzellen an ihrer Brücke montieren'],
          ['Yara', 'organisiert einen Flohmarkt für Flüchtlinge'],
        ], 'Sebastian aligne les statistiques, que Lisa juge trop abstraites : elle veut que ses élèves agissent eux-mêmes. Nina propose une semaine sans plastique. Selma veut alimenter les lampes de son pont avec des cellules solaires, et Yara organise un marché aux puces.'),
        choice('q5', bi('Nina sagt: „Umweltschutz ist kein Zuckerschlecken!“ Was meint sie?', 'Nina dit : « Umweltschutz ist kein Zuckerschlecken! » Que veut-elle dire ?'), [
          ['Pour l’environnement, il faut manger moins de sucre.'],
          ['Les bonbons emballés polluent beaucoup.'],
          ['Protéger l’environnement n’est pas toujours agréable.', true],
        ], 'Kein Zuckerschlecken signifie que ce n’est ni facile ni agréable. Nina surprend Lisa avec un pot de yaourt en plastique, alors qu’elle a promis à sa classe de se passer de plastique pendant une semaine.'),
        fill('q6', bi('Welche Zahlen nennt Sebastian? Ergänzen Sie.', 'Quels chiffres Sebastian cite-t-il ? Complétez.'), 'Wenn wir so weitermachen, brauchen wir 2030 mindestens [[1]] Erden. Jeden Tag sterben [[2]] Tierarten aus.', [
          ['zwei', '2'],
          ['130', 'hundertdreißig', 'einhundertdreißig'],
        ], 'Sebastian veut impressionner les élèves : au rythme actuel, il faudrait au moins deux Terres en 2030, et 130 espèces animales disparaissent chaque jour, insectes compris. Lisa trouve ces chiffres trop abstraits pour motiver sa classe.'),
        choice('q7', bi('Wie begründet Yara, dass auf dem Flohmarkt alles umsonst ist?', 'Comment Yara justifie-t-elle que tout soit gratuit au marché aux puces ?'), [
          ['Die Stadt bezahlt alle Sachen für die Flüchtlinge.'],
          ['Wer etwas wegwirft, bekommt auch kein Geld dafür.', true],
          ['So bekommt ihr Laden kostenlos neue Kunden.'],
        ], 'Yara répond au journaliste par une question : quand on jette quelque chose, on ne reçoit pas d’argent non plus. Sur son marché, les objets d’occasion ne finissent pas à la poubelle, ils changent simplement de propriétaire.'),
        order('q8', ordnen, [
          ['Nico spricht über die Siesta in Spanien.', 'Yara beschwert sich bei ihrem Vermieter.', 'Nina bietet allen Plätzchen an.', 'Lisa erklärt ihrer Klasse das Experiment.', 'Yara lernt Selma kennen.'],
        ], 'Au restaurant, Nico évoque la sieste espagnole. Yara se plaint ensuite de son voisin auprès du propriétaire. Dans la colocation, Nina offre ses biscuits pendant que Lisa prépare son cours ; Lisa présente l’expérience à sa classe, puis Yara rencontre Selma au restaurant.'),
      ],
    },
    // 10 · Folgen 49–54
    {
      title: 'Schlagzeilen und Missverständnisse',
      episodes: [49, 54], start: '71:21', end: '79:06', approx: true,
      context: contexte({
        episodes: [49, 54],
        situation: [
          ['Nach dem Flohmarkt macht die Zeitung Yara ein Angebot. Pepe hat dazu eine klare Meinung.', 'Après le marché aux puces, le journal fait une offre à Yara. Pepe a un avis bien tranché sur la question.'],
          ['Yara besucht die Redaktion, und der Reporter trifft später einen alten Bekannten.', 'Yara visite la rédaction, et plus tard le reporter retrouve une vieille connaissance.'],
          ['Im Restaurant von Max und Tarek stehen plötzlich zwei Sanitäter. Was ist passiert?', 'Deux ambulanciers débarquent soudain au restaurant de Max et Tarek. Que s’est-il passé ?'],
        ],
        questions: [
          ['Lesen Sie Nachrichten lieber in der Zeitung oder auf dem Handy?', 'Préférez-vous lire les informations dans le journal ou sur votre portable ?'],
          ['Welche Rubriken hat eine Zeitung?', 'Quelles rubriques un journal comporte-t-il ?'],
        ],
        focus: [
          ['Achten Sie auf die Arbeitsschritte in der Redaktion.', 'Soyez attentif aux étapes du travail à la rédaction.'],
          ['Achten Sie auch darauf, wie Max und Tarek das Missverständnis erklären.', 'Soyez aussi attentif à la façon dont Max et Tarek expliquent le malentendu.'],
        ],
      }),
      keywords: [
        nom('die', 'Anzeige', 'Anzeigen', 'l’annonce', 'synonyme : die Annonce ; die Kontaktanzeige : l’annonce de rencontre'),
        nom('die', 'Rubrik', 'Rubriken', 'la rubrique'),
        nom('die', 'Redaktion', 'Redaktionen', 'la rédaction (d’un journal)'),
        mot('recherchieren', 'faire des recherches, enquêter'),
        mot('lektorieren', 'relire et corriger (un texte)'),
        mot('sich verlieben in', 'tomber amoureux de', '+ accusatif ; familier : sich verknallen'),
        nom('der', 'Sanitäter', 'Sanitäter', 'l’ambulancier, le secouriste'),
        nom('das', 'Missverständnis', 'Missverständnisse', 'le malentendu'),
        mot('peinlich', 'gênant, embarrassant'),
        mot('wörtlich nehmen', 'prendre au pied de la lettre'),
      ],
      questions: [
        choice('q1', bi('Was bietet die Zeitung Yara an?', 'Que propose le journal à Yara ?'), [
          ['eine feste Stelle in der Lokalredaktion'],
          ['ein Abonnement der Zeitung für ein Jahr'],
          ['eine kostenlose Anzeige für ihren Laden', true],
        ], 'Le journal qui publiera l’article sur le marché aux puces propose d’imprimer gratuitement une annonce pour le magasin de Yara. Yara hésite, car elle pense que le reporter a le béguin pour elle ; Pepe, lui, la pousse à accepter.'),
        choice('q2', bi('In welcher Rubrik erscheint die Anzeige wahrscheinlich?', 'Dans quelle rubrique l’annonce paraîtra-t-elle probablement ?'), [
          ['im Sportteil'],
          ['im Feuilleton'],
          ['im Wirtschaftsteil'],
          ['im Lokalteil', true],
        ], 'Yara pense que l’annonce paraîtra dans les pages locales. Pepe préférerait la rubrique sport, mais ce n’est pas Yara qui décide. Yara précise aussi que la rubrique culture s’appelle souvent Feuilleton, un mot venu du français.'),
        order('q3', bi('Wie entsteht eine Zeitung? Ordnen Sie die Arbeitsschritte.', 'Comment un journal est-il fabriqué ? Remettez les étapes dans l’ordre.'), [
          ['Man bespricht die Idee mit der Redaktionsleitung.', 'Die Reporter recherchieren und machen Interviews.', 'Die Artikel werden geschrieben und lektoriert.', 'Die Grafiker setzen alle Artikel zusammen.', 'Die Zeitung geht in den Druck.'],
        ], 'Le reporter détaille les étapes : une idée est proposée puis discutée avec la direction de la rédaction ; les reporters enquêtent et font des interviews ; les articles sont écrits, puis relus ; les graphistes assemblent le tout, et seulement ensuite le journal part à l’impression.'),
        rf('q4', ['Pepe findet Zeitungen unpraktisch und nicht mehr modern.', 'Pepe trouve les journaux peu pratiques et démodés.'], 'richtig',
          'Vrai : pour Pepe, on lit aujourd’hui tout sur son portable, et les journaux sont peu pratiques et démodés. Yara n’est pas d’accord : elle aime lire le journal le matin avec un café, et la plupart des journaux ont une application.'),
        match('q5', bi('Wer sagt oder macht was? Verbinden Sie.', 'Qui dit ou fait quoi ? Associez.'), [
          ['Pepe', 'will der Zeitung eine App verkaufen'],
          ['der Reporter', 'lädt Yara zu einem Kaffee ein'],
          ['Otto', 'möchte keine Kontaktanzeigen mehr'],
          ['Nico', 'hat wegen Inge die Sanitäter gerufen'],
          ['Inge', 'freut sich, dass man sie „junge Frau“ nennt'],
        ], 'Pepe répète une présentation pour vendre une application au journal. Le reporter invite Yara à prendre un café, et Otto ne veut plus d’annonces de rencontre. Nico a appelé les secours en croyant Inge en danger, et Inge est flattée qu’on l’appelle « jeune femme ».'),
        choice('q6', bi('Was ist die „Tote Oma“?', 'Qu’est-ce que la « Tote Oma » ?'), [
          ['ein Wurstgericht, das im Restaurant so heißt', true],
          ['ein Spitzname, den Max und Tarek für Inge haben'],
          ['eine Stammkundin, die vor Kurzem gestorben ist'],
        ], 'Au restaurant, on appelle ainsi un plat, la Tiegelwurst : c’est un nom familier. Quand Max s’écrie « die Tote Oma » en voyant le plat brûler, Nico prend l’expression au pied de la lettre et croit qu’il est arrivé malheur à Inge.'),
        fill('q7', bi('Ergänzen Sie die Zahlen.', 'Complétez les nombres.'), 'Otto und Thomas kennen sich seit [[1]] Jahren. Seit [[2]] Jahren veröffentlicht Thomas Kontaktanzeigen für Otto in seiner Zeitung.', [
          ['15', 'fünfzehn'],
          ['10', 'zehn'],
        ], 'Le reporter s’appelle Thomas : il connaît Otto depuis quinze ans et publie depuis dix ans ses annonces de rencontre, chaque fois sous un nouveau prénom. Cette fois, Otto ne veut plus d’annonce : il est vraiment amoureux.'),
        choice('q8', bi('Wie bewertet Tarek am Ende Nicos Reaktion?', 'Comment Tarek juge-t-il finalement la réaction de Nico ?'), [
          ['Nico hätte zuerst in der Küche fragen sollen.'],
          ['Nico muss den Einsatz der Sanitäter bezahlen.'],
          ['Nico hat Zivilcourage gezeigt.', true],
        ], 'Après les excuses, Tarek retourne la situation : au fond, il faudrait remercier Nico, qui s’est inquiété pour Inge et a fait preuve de courage civique (Zivilcourage). Max ajoute que ce n’est pas gênant quand on agit avec de bonnes intentions.'),
      ],
    },
    // 11 · Folgen 55–60
    {
      title: 'Die Wahrheit kommt ans Licht',
      episodes: [55, 60], start: '79:06', end: '88:01', approx: true,
      context: contexte({
        episodes: [55, 60],
        situation: [
          ['Die Familie Al-Pascha lädt Yara und Nico zum Abendessen ein. Nico will alles richtig machen.', 'La famille Al-Pascha invite Yara et Nico à dîner. Nico veut tout faire comme il faut.'],
          ['Am nächsten Tag sehen sich Nico und Selma kurz auf der Straße.', 'Le lendemain, Nico et Selma se voient brièvement dans la rue.'],
          ['Im Restaurant erzählt Jacques Max und Tarek von seinem Leben, bis Yara hereinkommt.', 'Au restaurant, Jacques raconte sa vie à Max et Tarek, jusqu’à ce que Yara entre.'],
        ],
        questions: [
          ['Welche Höflichkeitsregeln gelten in Ihrem Land, wenn man zum Essen eingeladen ist?', 'Quelles règles de politesse s’appliquent dans votre pays quand on est invité à dîner ?'],
          ['Was passiert oft, wenn eine Lüge herauskommt?', 'Que se passe-t-il souvent quand un mensonge est découvert ?'],
        ],
        focus: [
          ['Achten Sie auf die Reaktionen von Ibrahim und von Inge.', 'Soyez attentif aux réactions d’Ibrahim et d’Inge.'],
        ],
      }),
      keywords: [
        nom('die', 'Benimmregel', 'Benimmregeln', 'la règle de savoir-vivre'),
        mot('gastfreundlich', 'accueillant, hospitalier'),
        mot('sich erkundigen nach', 'se renseigner sur, demander des nouvelles de', '+ datif'),
        mot('duzen', 'tutoyer', 'contraire : siezen (vouvoyer)'),
        mot('anstoßen auf', 'trinquer à', 'séparable ; + accusatif : auf den Erfolg anstoßen'),
        nom('der', 'Personalausweis', 'Personalausweise', 'la carte d’identité'),
        mot('volljährig', 'majeur'),
        nom('die', 'Schande', null, 'la honte, le déshonneur'),
        nom('die', 'Verwechslung', 'Verwechslungen', 'la confusion (entre deux personnes)'),
        nom('der', 'Neuanfang', 'Neuanfänge', 'le nouveau départ'),
      ],
      questions: [
        choice('q1', bi('Warum laden die Al-Paschas Yara und Nico zum Essen ein?', 'Pourquoi les Al-Pascha invitent-ils Yara et Nico à dîner ?'), [
          ['als Dank für den Flohmarkt und das Fahrrad', true],
          ['weil Selma einen Preis gewonnen hat'],
          ['weil Ibrahim Nico besser kennenlernen will'],
        ], 'Yara annonce à Nico que les Al-Pascha les invitent pour les remercier du marché aux puces et du vélo. Ibrahim ne sait pas qui est Nico ; Nico, lui, tient à bien se tenir, peut-être à cause de Selma.'),
        rf('q2', ['Laut Nicos Internetseite soll ein Mann einer syrischen Frau zur Begrüßung die Hand geben.', 'D’après le site que lit Nico, un homme doit serrer la main d’une femme syrienne pour la saluer.'], 'falsch',
          'Faux : d’après ce que lit Nico, il est inhabituel, et même impoli, qu’un homme serre la main d’une femme pour la saluer. Le site conseille aussi de demander des nouvelles de la famille, ce que Nico fera, maladroitement.'),
        choice('q3', bi('Warum versteht Ibrahim Nicos Frage nach der Familie zuerst nicht?', 'Pourquoi Ibrahim ne comprend-il pas d’abord la question de Nico sur la famille ?'), [
          ['Man stellt diese Frage nur beim ersten Treffen.'],
          ['Nur die älteste Person am Tisch darf so fragen.'],
          ['Man fragt so, wenn man die Familie schon kennt.', true],
        ], 'Ibrahim l’explique au dessert : on demande des nouvelles de la famille quand on la connaît. Or Nico ne connaît pas la famille d’Ibrahim, d’où sa réponse étonnée (« Welcher Familie? »). Il trouve pourtant très bien que Nico se soit renseigné.'),
        choice('q4', bi('Warum hätte Nico den Sekt und den Wein fast nicht bekommen?', 'Pourquoi Nico a-t-il failli ne pas avoir le mousseux et le vin ?'), [
          ['Die Verkäuferin wollte zuerst seinen Ausweis sehen.', true],
          ['Der Laden wollte gerade schließen, als er kam.'],
          ['Er hatte sein Portemonnaie in der WG vergessen.'],
        ], 'La vendeuse ne voulait pas lui vendre d’alcool sans pièce d’identité : elle doutait qu’il soit majeur. Nico est vexé, mais Selma y voit un compliment : il fait plus jeune que son âge. Les bouteilles doivent servir à fêter un nouveau départ.'),
        match('q5', bi('Wer sagt was? Verbinden Sie.', 'Qui dit quoi ? Associez.'), [
          ['Ibrahim', 'verbietet Selma, Nico zu sehen'],
          ['Selma', 'sagt ihrem Vater, dass sie Nico liebt'],
          ['Nico', 'sagt, sie haben sich nur zufällig getroffen'],
          ['Yara', 'sagt, dass Jacques in Wirklichkeit Otto ist'],
          ['Inge', 'will Jacques nie mehr wiedersehen'],
        ], 'Ibrahim surprend Nico et Selma ensemble et interdit à sa fille de le revoir ; Nico prétend qu’ils se sont croisés par hasard, et Selma avoue qu’elle l’aime. Au restaurant, Yara reconnaît Otto, et Inge, trompée, ne veut plus jamais revoir Jacques.'),
        fill('q6', bi('Was haben die beiden Wirte früher gemacht? Ergänzen Sie.', 'Que faisaient les deux restaurateurs auparavant ? Complétez.'), 'Bevor Max und Tarek das Restaurant hatten, war Tarek [[1]] und Max [[2]].', [
          ['Elektriker'],
          ['Bankkaufmann', 'Bankangestellter'],
        ], 'Avant d’ouvrir leur restaurant, Tarek était électricien dans une entreprise et Max employé de banque. Jacques est surpris par ces changements de métier. Lui prétend avoir été cuisinier, et plongeur avant cela.'),
        choice('q7', bi('Ibrahim sagt über Nico: „Er ist kein Umgang für dich!“ Was meint er?', 'Ibrahim dit de Nico : « Er ist kein Umgang für dich! » Que veut-il dire ?'), [
          ['Il ne sait pas comment se comporter avec toi.'],
          ['Ce n’est pas une fréquentation pour toi.', true],
          ['Il n’a plus le droit d’entrer chez nous.'],
        ], 'Der Umgang désigne ici les personnes que l’on fréquente. Ibrahim juge que Nico est une mauvaise fréquentation pour sa fille : selon lui, il la pousse à mentir, achète de l’alcool et n’a aucune perspective d’avenir.'),
        order('q8', ordnen, [
          ['Nico liest Benimmregeln im Internet.', 'Ibrahim versteht, warum Nico nach der Familie gefragt hat.', 'Ibrahim sieht Nico und Selma zusammen.', 'Yara erkennt den Mann an Inges Tisch.', 'Jacques gibt zu, dass er gelogen hat.'],
        ], 'Nico se renseigne d’abord sur les règles de politesse, puis Ibrahim comprend au dessert l’origine de sa question. Le lendemain, Ibrahim surprend Nico et Selma. Au restaurant, Yara reconnaît l’homme assis avec Inge, et Jacques finit par avouer ses mensonges.'),
      ],
    },
    // 12 · Folgen 61–66
    {
      title: 'Kurz vor der Prüfung',
      episodes: [61, 66], start: '88:01', end: '96:42', approx: true,
      context: contexte({
        episodes: [61, 66],
        situation: [
          ['Bald ist Nicos B1-Prüfung. Er lernt viel, aber er ist sich nicht sicher.', 'L’examen B1 de Nico approche. Il travaille beaucoup, mais il doute de lui.'],
          ['Max und Tarek haben ein neues Projekt, und Yara bekommt wieder Besuch von ihrem Vermieter.', 'Max et Tarek ont un nouveau projet, et Yara reçoit de nouveau la visite de son propriétaire.'],
          ['Lisa probiert etwas Neues aus, und Selma braucht Hilfe.', 'Lisa essaie quelque chose de nouveau, et Selma a besoin d’aide.'],
        ],
        questions: [
          ['Was hilft Ihnen kurz vor einer Prüfung: lernen, Sport machen oder sich ausruhen?', 'Qu’est-ce qui vous aide juste avant un examen : réviser, faire du sport ou vous reposer ?'],
          ['Was wissen Sie über die Bundesländer und die Wahlen in Deutschland?', 'Que savez-vous des Länder et des élections en Allemagne ?'],
        ],
        focus: [
          ['Achten Sie auf die Namen von Regionen und auf die Wörter rund um die Wahlen.', 'Soyez attentif aux noms de régions et au vocabulaire des élections.'],
        ],
      }),
      keywords: [
        nom('das', 'Bundesland', 'Bundesländer', 'le Land (État fédéré)'),
        nom('das', 'Vokabelheft', 'Vokabelhefte', 'le carnet de vocabulaire'),
        mot('sich beschweren über', 'se plaindre de', '+ accusatif'),
        mot('sich engagieren für', 's’engager pour', '+ accusatif : sich für Flüchtlinge engagieren'),
        nom('die', 'Steuererklärung', 'Steuererklärungen', 'la déclaration d’impôts'),
        mot('ehrenamtlich', 'bénévole', 'eine ehrenamtliche Tätigkeit : une activité bénévole'),
        nom('die', 'Wahlbenachrichtigung', 'Wahlbenachrichtigungen', 'l’avis de convocation électorale'),
        nom('der', 'Landtag', 'Landtage', 'le parlement d’un Land'),
        nom('die', 'Kohle', null, 'le charbon', 'die Steinkohle : la houille ; die Braunkohle : le lignite'),
        nom('das', 'Bergwerk', 'Bergwerke', 'la mine'),
      ],
      questions: [
        choice('q1', bi('Was planen Max und Tarek mit den Gerichten auf der Deutschlandkarte?', 'Que préparent Max et Tarek avec les plats épinglés sur la carte d’Allemagne ?'), [
          ['ein Kochbuch mit Rezepten aus allen Bundesländern'],
          ['eine neue Speisekarte nur mit Gerichten aus dem Norden'],
          ['Videos über deutsche Gerichte für das Internet', true],
        ], 'Max et Tarek cherchent des plats allemands classiques aux noms farfelus, comme « Tote Oma » : ils veulent expliquer leur origine et leur préparation dans des vidéos publiées sur Internet. Tarek se trompe encore sur la région d’origine d’un plat.'),
        rf('q2', ['Yara muss wegen des Flohmarkts eine Strafe bezahlen.', 'Yara doit payer une amende à cause du marché aux puces.'], 'nicht gesagt',
          'Non dit : le propriétaire rapporte seulement que des voisins se sont plaints du bruit et de la foule, et il reproche à Yara de ne pas l’avoir appelé avant. Il n’est jamais question d’amende ; Yara répond qu’elle n’a rien fait de mal.'),
        match('q3', bi('Wer macht was? Verbinden Sie.', 'Qui fait quoi ? Associez.'), [
          ['Nico', 'sucht sein Vokabelheft'],
          ['Lisa', 'macht zum ersten Mal eine Steuererklärung'],
          ['Pepe', 'boxt, um sich abzureagieren'],
          ['Sebastian', 'zeigt seine Wahlbenachrichtigung'],
          ['Selma', 'liest über die Kohleindustrie'],
        ], 'Nico vient chercher son carnet de vocabulaire au restaurant. Lisa fait sa première déclaration d’impôts, et Pepe lui parle de la boxe, qui l’aide à se défouler. Sebastian arrive avec son avis de vote, et Selma se documente sur l’industrie du charbon pour son bureau d’architectes.'),
        fill('q4', bi('Wie erklärt Sebastian die Wahl? Ergänzen Sie.', 'Comment Sebastian explique-t-il le vote ? Complétez.'), 'Mit der [[1]] wählt man einen Kandidaten im Wahlkreis, mit der Zweitstimme eine [[2]].', [
          ['Erststimme', 'ersten Stimme'],
          ['Partei'],
        ], 'Sebastian explique le système à Nico : la première voix (Erststimme) va à un candidat de la circonscription, la seconde (Zweitstimme) à un parti. Pour les mandats supplémentaires, il avoue lui-même ne pas tout comprendre.'),
        choice('q5', bi('Pepe sagt zu Nico: „Keine falsche Bescheidenheit, Bruderherz!“ Was meint er?', 'Pepe dit à Nico : « Keine falsche Bescheidenheit, Bruderherz! » Que veut-il dire ?'), [
          ['Ne sois pas trop modeste : tu es bon.', true],
          ['Ne mens pas : tu n’as pas assez révisé.'],
          ['Ne te compare pas toujours à ton frère.'],
        ], 'Die Bescheidenheit, c’est la modestie. Nico doute de son niveau, et Pepe l’encourage : il parle très bien, il connaît les règles, il doit simplement rester détendu. Bruderherz est une manière affectueuse de dire « frérot ».'),
        choice('q6', bi('Was erfährt Lisa, als Pepe ihr bei der Steuererklärung hilft?', 'Qu’apprend Lisa quand Pepe l’aide à remplir sa déclaration d’impôts ?'), [
          ['Sie muss für ihre Privatstunden mehr Steuern zahlen.'],
          ['Sie kann ihre Miete von der Steuer absetzen.'],
          ['Sie kann die Fahrtkosten für ihr Ehrenamt absetzen.', true],
        ], 'Lisa ne savait pas qu’elle pouvait déduire de ses impôts les frais de trajet liés à ses activités bénévoles. Pepe précise que cela ne marche pas toujours, mais qu’il faut essayer. Il se demande comment elle arrive à tout faire.'),
        choice('q7', bi('Warum kann Lisa beim Boxen so gut zuschlagen?', 'Pourquoi Lisa frappe-t-elle si bien à la boxe ?'), [
          ['Sie hat früher lange in einem Boxverein trainiert.'],
          ['Sie war als Kind viel mit Jungen unterwegs.', true],
          ['Sie macht seit Jahren jeden Morgen Krafttraining.'],
        ], 'C’est la première fois que Lisa boxe. Elle explique qu’enfant, dans la Ruhr, elle ne jouait pas aux poupées mais traînait avec les garçons : on n’y devient pas douillet. Elle a d’ailleurs dit à Pepe qu’elle ne faisait pas de sport.'),
        order('q8', ordnen, [
          ['Nico holt sein Vokabelheft im Restaurant.', 'Yara diskutiert mit ihrem Vermieter.', 'Pepe hilft Lisa bei der Steuererklärung.', 'Sebastian erklärt Nico die Wahlen.', 'Pepe leiht sich Lisas Auto.'],
        ], 'Nico récupère d’abord son carnet au restaurant, puis le propriétaire vient se plaindre chez Yara. Dans la colocation, Pepe aide Lisa avec ses impôts. Au magasin, Sebastian explique les élections à Nico, et après la séance de boxe, Pepe emprunte la voiture de Lisa.'),
      ],
    },
    // 13 · Folgen 67–71
    {
      title: 'Entscheidungen',
      episodes: [67, 71], start: '96:42', end: '103:50', approx: true,
      context: contexte({
        episodes: [67, 71],
        situation: [
          ['Inge will Jacques nicht mehr sehen. Trotzdem steht er vor ihrer Tür und erzählt, wer er wirklich ist.', 'Inge ne veut plus voir Jacques. Pourtant, il est devant sa porte et raconte qui il est vraiment.'],
          ['Heute ist Nicos Prüfung. Selma will unbedingt mit ihm sprechen, aber ihre Eltern dürfen das nicht wissen.', 'C’est aujourd’hui l’examen de Nico. Selma veut absolument lui parler, mais ses parents ne doivent pas le savoir.'],
          ['Später trifft sich Pepe mit Ibrahim. Es geht um die Zukunft der Familie Al-Pascha.', 'Plus tard, Pepe rencontre Ibrahim. Il est question de l’avenir de la famille Al-Pascha.'],
        ],
        questions: [
          ['Wie fühlt man sich direkt nach einer wichtigen Prüfung?', 'Comment se sent-on juste après un examen important ?'],
          ['Was muss man tun, wenn man mit einem ausländischen Abschluss in Deutschland arbeiten möchte?', 'Que faut-il faire quand on veut travailler en Allemagne avec un diplôme étranger ?'],
        ],
        focus: [
          ['Achten Sie darauf, was Otto über seine Vergangenheit erzählt.', 'Soyez attentif à ce qu’Otto raconte de son passé.'],
          ['Achten Sie auch auf Ibrahims Pläne.', 'Soyez aussi attentif aux projets d’Ibrahim.'],
        ],
      }),
      keywords: [
        nom('die', 'Stahlindustrie', null, 'la sidérurgie'),
        mot('arbeitslos', 'au chômage'),
        nom('die', 'Ausstellung', 'Ausstellungen', 'l’exposition'),
        nom('die', 'Notlüge', 'Notlügen', 'le pieux mensonge'),
        mot('bereuen', 'regretter'),
        mot('durchfallen', 'échouer (à un examen)', 'séparable ; Perfekt : ist durchgefallen'),
        nom('die', 'Praxis', 'Praxen', 'le cabinet (médical)', 'eine Praxis eröffnen'),
        nom('der', 'Hausarzt', 'Hausärzte', 'le médecin généraliste'),
        nom('die', 'Nachtschicht', 'Nachtschichten', 'le service de nuit'),
        nom('der', 'Kredit', 'Kredite', 'le prêt, le crédit', 'einen Kredit aufnehmen : contracter un prêt'),
      ],
      questions: [
        choice('q1', bi('Was erzählt Otto vor Inges Tür über seine Herkunft?', 'Que raconte Otto, devant la porte d’Inge, sur ses origines ?'), [
          ['Er kommt aus Duisburg und war Arbeiter in der Stahlindustrie.', true],
          ['Er kommt aus Frankreich und hatte dort Restaurants.'],
          ['Er kommt aus Polen und kam als Kind nach Duisburg.'],
        ], 'Otto avoue qu’il vient de Duisburg : son père était ouvrier dans la sidérurgie, et lui aussi plus tard. Quand le travail a manqué, il a vécu de petits commerces et de l’argent des femmes. Les restaurants en France faisaient partie du mensonge.'),
        rf('q2', ['Ibrahim ist sofort einverstanden, dass Selma mit Lisa ausgeht.', 'Ibrahim accepte tout de suite que Selma sorte avec Lisa.'], 'falsch',
          'Faux : Ibrahim répond d’abord que Selma n’a pas le temps. C’est Aya qui intervient pour qu’il la laisse partir. Ensuite, Lisa fait remarquer à Selma qu’elle a dû mentir effrontément à ses parents.'),
        choice('q3', bi('Was ist die Kulturveranstaltung, von der Lisa erzählt, in Wirklichkeit?', 'Qu’est en réalité l’événement culturel dont parle Lisa ?'), [
          ['ein Theaterstück, in dem Selma mitspielt'],
          ['eine Feier zu Nicos Prüfung im Restaurant'],
          ['eine Notlüge, damit Selma zu Nico kann', true],
        ], 'Lisa a décrit aux parents une exposition, une pièce et un film sur le thème de l’exil, mais c’était un prétexte : Selma lui avait demandé de l’aide pour pouvoir rejoindre Nico. Selma parle elle-même d’un pieux mensonge.'),
        choice('q4', bi('Warum will Nico nicht mit Selma zusammen sein?', 'Pourquoi Nico ne veut-il pas être avec Selma ?'), [
          ['Er will nach der Prüfung zurück nach Spanien.'],
          ['Er ist sauer, weil Selma ihn lange nicht angerufen hat.'],
          ['Selma soll nicht zwischen ihm und ihren Eltern wählen müssen.', true],
        ], 'Nico refuse que Selma doive choisir entre lui et ses parents : il a peur qu’elle le regrette un jour. Sa propre famille est un chaos, et il ne veut pas en briser une autre. Il ne parle ni de repartir en Espagne ni de colère.'),
        choice('q5', bi('Selma fragt: „Machst du Schluss?“ Was bedeutet das hier?', 'Selma demande : « Machst du Schluss? » Que signifie cette question ici ?'), [
          ['Tu as fini ton examen ?'],
          ['Tu me quittes ?', true],
          ['Tu fermes la porte ?'],
        ], 'Schluss machen (mit jemandem), c’est rompre. Selma comprend que Nico met fin à leur relation ; il répond qu’ils n’ont jamais été ensemble. Rien à voir ici avec la fin de l’examen, qui est déjà terminé.'),
        fill('q6', bi('Worüber macht sich Nico nach der Prüfung Sorgen? Ergänzen Sie.', 'Qu’est-ce qui inquiète Nico après l’examen ? Complétez.'), 'Nico ist sich wegen des [[1]], den er schreiben musste, nicht sicher. Er hat Angst, dass er im schriftlichen Teil zu viele [[2]] gemacht hat.', [
          ['Briefs', 'Briefes'],
          ['Fehler'],
        ], 'Nico ne sait pas encore s’il a réussi : il doute de la lettre qu’il devait écrire et craint d’avoir fait trop de fautes à l’écrit. Wegen se construit avec le génitif : wegen des Briefs (ou Briefes). Pepe le rassure.'),
        match('q7', bi('Wer sagt was? Verbinden Sie.', 'Qui dit quoi ? Associez.'), [
          ['Otto', 'sagt, dass er allein schuld ist'],
          ['Aya', 'findet, dass Ibrahim Selma gehen lassen soll'],
          ['Max', 'ist überzeugt, dass Nico bestanden hat'],
          ['Ibrahim', 'will in ein paar Jahren eine eigene Praxis eröffnen'],
          ['Pepe', 'glaubt, dass Ibrahim einen Kredit braucht'],
        ], 'Otto reconnaît qu’il est seul responsable. Aya demande à Ibrahim de laisser partir Selma. Max est convaincu que Nico a réussi. Ibrahim veut ouvrir son propre cabinet dans quelques années, et Pepe conclut qu’il lui faut un prêt.'),
        order('q8', ordnen, [
          ['Otto spricht vor Inges Tür.', 'Lisa besucht Selmas Eltern.', 'Nico kommt aus der Prüfung.', 'Max und Pepe stoßen mit Nico an.', 'Ibrahim erzählt Pepe von seinen Plänen.'],
        ], 'Otto parle d’abord à Inge à travers la porte. Lisa rend ensuite visite aux parents de Selma. Nico sort de son examen et parle avec Selma, puis il trinque avec Max et Pepe. La séquence se termine sur la discussion entre Ibrahim et Pepe.'),
      ],
    },
    // 14 · Folgen 72–76
    {
      title: 'Wünsche für die Zukunft',
      episodes: [72, 76], start: '103:50', end: '113:00', approx: true,
      context: contexte({
        episodes: [72, 76],
        situation: [
          ['Ibrahim braucht Geld für seine Pläne. Aber eine Bank gibt nicht jedem einen Kredit.', 'Ibrahim a besoin d’argent pour ses projets. Mais une banque n’accorde pas un prêt à tout le monde.'],
          ['In Lisas Klasse geht es um die Frage, warum Menschen ihre Heimat verlassen.', 'Dans la classe de Lisa, on se demande pourquoi des gens quittent leur pays.'],
          ['Zum Schluss treffen sich viele im Restaurant von Max und Tarek. Auch Otto hat noch etwas vor.', 'Pour finir, beaucoup se retrouvent au restaurant de Max et Tarek. Otto, lui aussi, a encore un projet.'],
        ],
        questions: [
          ['Aus welchen Gründen verlassen Menschen ihre Heimat?', 'Pour quelles raisons des gens quittent-ils leur pays ?'],
          ['Wie könnte die Geschichte von Nico, Selma, Inge und Otto enden?', 'Comment l’histoire de Nico, Selma, Inge et Otto pourrait-elle se terminer ?'],
        ],
        focus: [
          ['Achten Sie auf die Wünsche und Pläne der Personen am Ende des Films.', 'Soyez attentif aux souhaits et aux projets des personnages à la fin du film.'],
        ],
      }),
      keywords: [
        nom('die', 'Voraussetzung', 'Voraussetzungen', 'la condition préalable'),
        nom('die', 'Unterlage', 'Unterlagen', 'le document, la pièce justificative', 'surtout au pluriel : die Unterlagen'),
        nom('die', 'Perspektive', 'Perspektiven', 'la perspective (d’avenir)'),
        mot('verfolgen', 'persécuter', 'passif : verfolgt werden'),
        nom('die', 'Bürokratie', null, 'la bureaucratie'),
        nom('der', 'Migrationshintergrund', null, 'l’origine immigrée', 'einen Migrationshintergrund haben'),
        nom('das', 'Rezept', 'Rezepte', 'la recette'),
        mot('wiedergutmachen', 'réparer (une faute)', 'séparable : Ich will es wiedergutmachen.'),
        nom('der', 'Preis', 'Preise', 'le prix (récompense)', 'aussi : le prix (coût)'),
        mot('heimkehren', 'rentrer chez soi', 'séparable ; Perfekt : ist heimgekehrt'),
      ],
      questions: [
        choice('q1', bi('Warum ist es für Ibrahim schwer, einen Kredit zu bekommen?', 'Pourquoi est-il difficile pour Ibrahim d’obtenir un prêt ?'), [
          ['Er kann sein Einkommen nicht mit Unterlagen belegen.', true],
          ['Er ist zu alt für einen Kredit von der Bank.'],
          ['Er hat schon Schulden bei einer anderen Bank.'],
        ], 'Pepe explique qu’Ibrahim ne peut pas prouver ses revenus ni sa solvabilité : la famille a fui la guerre sans emporter ses documents, restés en Syrie. La banque veut aussi être sûre qu’il restera assez longtemps en Allemagne pour rembourser.'),
        choice('q2', bi('Pepe sagt zu Ibrahim: „Ich bürge für dich.“ Was bedeutet das?', 'Pepe dit à Ibrahim : « Ich bürge für dich. » Qu’est-ce que cela veut dire ?'), [
          ['Je te prête l’argent moi-même.'],
          ['Je vais parler au directeur de la banque.'],
          ['Je me porte garant pour toi.', true],
        ], 'Für jemanden bürgen, c’est se porter garant : si Ibrahim ne rembourse pas, c’est Pepe qui en portera la responsabilité. Pepe ne prête pas lui-même l’argent ; il permet à Ibrahim d’obtenir le prêt de la banque.'),
        fill('q3', bi('Ergänzen Sie.', 'Complétez.'), 'Menschen, die politisch verfolgt werden, können in anderen Ländern [[1]] beantragen. Das größte Problem ist laut Lisa aber oft die [[2]].', [
          ['Asyl'],
          ['Sprache'],
        ], 'Lisa rappelle que les personnes persécutées pour des raisons politiques peuvent demander l’asile. Parmi les difficultés, un élève cite la bureaucratie, mais pour Lisa, le plus grand problème est souvent de ne pas parler la langue.'),
        choice('q4', bi('Was will Otto von Max und Tarek?', 'Que veut Otto de Max et Tarek ?'), [
          ['Er möchte in ihrem Video ein Rezept vorstellen.'],
          ['Sie sollen mit Inge reden, weil sie ihm nicht zuhört.', true],
          ['Er will ihnen das Geld für Inges Urlaub geben.'],
        ], 'Otto interrompt le tournage de la vidéo. Il sait que Max et Tarek lui en veulent d’avoir menti à Inge, mais il l’aime sincèrement : comme elle refuse de l’écouter, il les supplie de lui parler à sa place.'),
        choice('q5', bi('Was hat Selmas Chef zu Ibrahim gesagt?', 'Qu’a dit le chef de Selma à Ibrahim ?'), [
          ['Mit dem Preis ist ein Studienplatz kein Problem.', true],
          ['Selma bekommt sofort eine feste Stelle im Büro.'],
          ['Selma muss vor dem Studium noch viel lernen.'],
        ], 'Ibrahim a parlé au chef de Selma : avec ce prix, l’admission à l’université ne devrait poser aucun problème. Selma pourra donc étudier en Allemagne. Il n’est pas question d’un emploi fixe au bureau.'),
        match('q6', bi('Wer ist das? Verbinden Sie.', 'Qui est-ce ? Associez.'), [
          ['Selma', 'hat den Wettbewerb gewonnen'],
          ['Ibrahim', 'ist sehr stolz auf seine Tochter'],
          ['Aya', 'glaubt, dass das Leben besser wird als je zuvor'],
          ['Nina', 'darf keinen Champagner trinken'],
          ['Otto', 'hält vor allen eine Rede für Inge'],
        ], 'Selma a remporté le concours des jeunes architectes, et Ibrahim se dit très fier d’elle. Aya est sûre que leur vie sera meilleure que jamais. Au restaurant, Nina, enceinte, doit se contenter d’un jus d’orange, et Otto se lance dans un discours pour Inge.'),
        rf('q7', ['Inge nimmt Ottos Heiratsantrag an.', 'Inge accepte la demande en mariage d’Otto.'], 'richtig',
          'Vrai : après le discours d’Otto, qui promet de ne plus jamais mentir, Inge commence par plaisanter en demandant si le champagne est payé. Puis elle lui dit qu’elle le croit et qu’elle veut devenir sa femme. Tout le monde trinque à l’amour.'),
        order('q8', ordnen, [
          ['Pepe bietet Ibrahim seine Hilfe bei der Bank an.', 'Lisa spricht mit ihrer Klasse über Migration.', 'Otto stört das Video von Max und Tarek.', 'Selma erzählt ihren Eltern von ihrem Preis.', 'Inge bestellt im Restaurant Champagner.'],
        ], 'Pepe propose d’abord son aide à Ibrahim pour le prêt. Lisa parle ensuite des raisons de la migration avec sa classe. Otto interrompt le tournage de Max et Tarek, Selma annonce sa victoire à ses parents, et enfin Inge commande du champagne au restaurant.'),
      ],
    },
  ],
};
