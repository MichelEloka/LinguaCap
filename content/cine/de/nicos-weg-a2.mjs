// Ciné-club · Nicos Weg A2 (Deutsche Welle, chaîne YouTube officielle « Deutsch lernen mit der DW », vidéo Lg5P2w_Ro1c).
// Séquences de 6 à 10 minutes qui suivent les 76 folgen du film. Bornes estimées (approx: true) d'après l'ordre et la durée
// des épisodes publiés par la DW sur learngerman.dw.com (durée de chaque folge moins environ 10 s de générique, que le film
// complet ne répète pas) : à vérifier en regardant, dans l'éditeur du catalogue. Contextes, mots-clés, questions et
// explications originaux : rien n'est recopié des sous-titres, des manuscrits ni des exercices de la DW.
import { DW, bi, choice, contexte, fill, match, mot, nom, order } from '../lib.mjs';

export default {
  film: {
    id: 'nicos-weg-a2', levelId: 'a2', title: 'Nicos Weg · A2', position: 1,
    videoId: 'Lg5P2w_Ro1c', durationSeconds: '1:51:00',
    courseUrl: 'https://learngerman.dw.com/de/nicos-weg/c-36519709',
    channel: DW.channel, credit: DW.credit, licenseNote: DW.licenseNote,
    description: 'Nico a enfin retrouvé sa tante Yara et veut rester en Allemagne : il abandonne ses études de droit et '
      + 'cherche sa voie, un logement et un travail, pendant que son grand frère Pepe arrive pour le ramener en Espagne. '
      + 'Autour de lui, la colocation de Lisa, Selma et sa famille, Inge, Max et Tarek vivent leurs propres histoires : un '
      + 'loyer qui augmente, une rencontre au restaurant, un secret difficile à garder. Le film A2 (76 épisodes '
      + 'courts) est découpé ici en 14 séquences de 6 à 10 minutes. Pour chacune : un contexte et des mots-clés '
      + 'avant de regarder, le film dans le lecteur YouTube avec les sous-titres allemands, votre carnet de mots pendant le '
      + 'visionnage, puis des questions corrigées.',
  },
  sequences: [
    {
      title: 'Wiedersehen mit Yara · Les retrouvailles avec Yara',
      episodes: [1, 5], start: '0:00', end: '8:19', approx: true,
      context: contexte({
        episodes: [1, 5],
        situation: [
          ['Yara ist wieder in der Stadt. Plötzlich steht ihr Neffe Nico vor ihr.', 'Yara est de retour en ville. Soudain, son neveu Nico se trouve devant elle.'],
          ['Nico spricht schon ein bisschen Deutsch, und er hat viel zu erzählen.', 'Nico parle déjà un peu allemand, et il a beaucoup de choses à raconter.'],
          ['Auch Yara erklärt, wo sie in den letzten Wochen war.', 'Yara aussi explique où elle était ces dernières semaines.'],
        ],
        questions: [
          ['Was möchte Yara von Nico wissen?', 'Que veut savoir Yara ?'],
          ['Was braucht man für ein neues Leben in einem anderen Land?', 'De quoi a-t-on besoin pour une nouvelle vie dans un autre pays ?'],
        ],
        focus: [
          ['Achten Sie auf die Zeitangaben: Wann ist wer nach Deutschland gekommen?', 'Soyez attentif aux indications de temps : qui est arrivé en Allemagne, et quand ?'],
        ],
      }),
      keywords: [
        nom('das', 'Heimweh', null, 'le mal du pays'),
        mot('vermissen', 'regretter l’absence de', 'Ich vermisse Spanien. : l’Espagne me manque.'),
        nom('das', 'Zuhause', null, 'le chez-soi, le foyer'),
        nom('das', 'Heimatland', 'Heimatländer', 'le pays d’origine'),
        nom('das', 'Jurastudium', 'Jurastudien', 'les études de droit', 'Jura studieren : faire du droit (Jura, sans article)'),
        nom('der', 'Neuanfang', 'Neuanfänge', 'le nouveau départ'),
        mot('sich kümmern um', 's’occuper de', '+ accusatif : Ich kümmere mich um alles.'),
        mot('wütend', 'furieux, en colère'),
        nom('das', 'Konto', 'Konten', 'le compte (bancaire)', 'ein Konto eröffnen : ouvrir un compte'),
      ],
      questions: [
        choice('q1', bi('Warum war Yara in der Schweiz?', 'Pourquoi Yara était-elle en Suisse ?'), [
          ['Sie hat dort einen neuen Laden gesucht.'],
          ['Ihre beste Freundin hat Hilfe gebraucht.', true],
          ['Sie hat dort ein Semester studiert.'],
        ], 'Yara raconte que le père de Sarah, sa meilleure amie, est mort : Sarah avait besoin d’elle, alors elle a fait ses valises et pris l’avion pour Zurich. Elle n’y cherchait ni magasin ni études.'),
        fill('q2', bi('Ergänzen Sie die Zahlen.', 'Complétez les nombres.'), 'Tarek lebt seit [[1]] Jahren in Deutschland, Yara seit [[2]] Jahren.', [
          ['30', 'dreißig'],
          ['15', 'fünfzehn'],
        ], 'Tarek est arrivé de Turquie avec ses parents il y a 30 ans (vor 30 Jahren) ; Yara est venue comme jeune fille au pair il y a 15 ans. Vor + datif situe le départ, seit + datif dit depuis combien de temps cela dure.'),
        choice('q3', bi('Für Yara ist Spanien ihr Zuhause. Richtig, falsch oder nicht gesagt?', 'Pour Yara, l’Espagne est son chez-soi. Vrai, faux ou pas dit ?'), [
          ['richtig'],
          ['falsch', true],
          ['nicht gesagt'],
        ], 'Yara fait la différence : l’Espagne est son pays d’origine (Heimatland), mais son chez-soi (Zuhause), c’est l’Allemagne. En Suisse, c’est l’Allemagne qui lui a manqué, pas l’Espagne.'),
        choice('q4', bi('Was will Nico auf keinen Fall?', 'Que Nico ne veut-il en aucun cas ?'), [
          ['mit den Händen arbeiten'],
          ['in Deutschland bleiben'],
          ['weiter Jura studieren', true],
        ], 'Nico déteste le droit (Jura) et ne veut plus étudier, même si ses parents l’exigent. Rester en Allemagne et travailler de ses mains, ce sont au contraire ses projets, pas ce qu’il refuse.'),
        choice('q5', bi('Nico sagt, er sucht sich einfach eine Arbeit. Yara antwortet: „Viel Erfolg!“ Wie meint sie das?', 'Nico dit qu’il va simplement se trouver un travail. Yara répond « Viel Erfolg! ». Que veut-elle dire ?'), [
          ['Elle doute qu’il y arrive aussi facilement.', true],
          ['Elle le félicite pour son nouvel emploi.'],
          ['Elle lui propose de travailler au magasin.'],
        ], '« Viel Erfolg! » veut dire « bonne chance », mais le ton est ironique : Yara ne croit pas qu’on trouve un travail aussi simplement, sans plan ni allemand solide. Nico le comprend bien : il lui reproche de penser, comme les autres, qu’il n’y arrivera pas.'),
        choice('q6', bi('Wie reagieren Nicos Eltern auf seine Pläne?', 'Comment les parents de Nico réagissent-ils à ses projets ?'), [
          ['Sie wünschen ihm viel Glück.'],
          ['Sie kommen bald nach Deutschland.'],
          ['Sie sind sehr wütend.', true],
        ], 'Nico commence par une blague : ses parents seraient ravis et lui souhaiteraient bonne chance. Puis il avoue la vérité : ils sont furieux (wütend), parce qu’il arrête ses études et ne veut pas rentrer en Espagne.'),
        match('q7', bi('Wer macht was? Verbinden Sie.', 'Qui fait quoi ? Associez.'), [
          ['Tarek', 'kocht für alle im Restaurant.'],
          ['Nico', 'telefoniert mit seinen Eltern.'],
          ['Lisa', 'gibt Nico Deutschunterricht.'],
          ['Yara', 'schenkt Nico etwas zur Begrüßung.'],
        ], 'Tarek emmène tout le monde au restaurant et cuisine ; Nico appelle ses parents, comme Yara l’exige ; il a cours d’allemand chez Lisa à onze heures ; enfin, Yara lui offre un cadeau de bienvenue pour aller plus vite.'),
        order('q8', bi('Was passiert zuerst? Ordnen Sie die Szenen.', 'Que se passe-t-il d’abord ? Remettez les scènes dans l’ordre.'), [
          ['Yara sieht Nico und Tarek.', 'Yara erzählt von ihrer Freundin.', 'Yara stellt Nico Bedingungen.', 'Nico plant den Weg zur Bank.'],
        ], 'Yara découvre d’abord Nico avec Tarek ; au restaurant, elle raconte pourquoi elle est partie chez son amie ; elle pose ensuite ses conditions à Nico ; enfin, après l’appel aux parents, Nico organise sa journée : cours chez Lisa, puis banque.'),
      ],
    },
    {
      title: 'Bank, Familie und Deutschkurs · Banque, famille et cours d’allemand',
      episodes: [6, 11], start: '8:19', end: '16:02', approx: true,
      context: contexte({
        episodes: [6, 11],
        situation: [
          ['Nico möchte ein Bankkonto eröffnen. Max erklärt ihm, wie das geht.', 'Nico veut ouvrir un compte bancaire. Max lui explique comment faire.'],
          ['Vor der Bank trifft Nico eine Bekannte: Selma.', 'Devant la banque, Nico retrouve une connaissance : Selma.'],
          ['Zusammen gehen sie zum Deutschunterricht bei Lisa.', 'Ensemble, ils vont au cours d’allemand chez Lisa.'],
        ],
        questions: [
          ['Was braucht man, wenn man ein Konto eröffnet?', 'De quoi a-t-on besoin pour ouvrir un compte ?'],
          ['Wie sprechen Nico und Selma wohl über ihre Eltern?', 'Comment Nico et Selma parlent-ils sans doute de leurs parents ?'],
        ],
        focus: [
          ['Achten Sie auf die Wörter rund um Bank und Geld.', 'Soyez attentif au vocabulaire de la banque et de l’argent.'],
          ['Achten Sie auch auf Selmas Handy.', 'Soyez aussi attentif au portable de Selma.'],
        ],
      }),
      keywords: [
        nom('das', 'Formular', 'Formulare', 'le formulaire', 'ein Formular ausfüllen : remplir un formulaire'),
        nom('das', 'Einkommen', 'Einkommen', 'le revenu', 'ein festes Einkommen : un revenu régulier'),
        nom('die', 'Rechnung', 'Rechnungen', 'la facture'),
        mot('überweisen', 'virer (de l’argent)', 'Perfekt : Ich habe die Miete überwiesen.'),
        nom('der', 'Bankautomat', 'Bankautomaten', 'le distributeur de billets', 'n-Deklination : am Bankautomaten'),
        mot('Geld abheben', 'retirer de l’argent', 'séparable : Ich hebe Geld ab.'),
        nom('die', 'Ausbildung', 'Ausbildungen', 'la formation professionnelle', 'eine Ausbildung machen : suivre une formation'),
        mot('erwachsen', 'adulte'),
        nom('das', 'Pflegeheim', 'Pflegeheime', 'la maison de retraite médicalisée'),
        mot('sich Sorgen machen', 's’inquiéter', 'um + accusatif : Sie macht sich Sorgen um ihre Tochter.'),
      ],
      questions: [
        choice('q1', bi('Welche Adresse schreibt Nico in das Formular?', 'Quelle adresse Nico écrit-il sur le formulaire ?'), [
          ['die Adresse von Yara', true],
          ['die Adresse von Max'],
          ['die Adresse von Lisa'],
        ], 'Nico n’a pas encore de logement à lui. Il demande s’il peut simplement écrire l’adresse de sa tante Yara, chez qui il habite, et Max lui répond que c’est en ordre.'),
        choice('q2', bi('Ohne Job bekommt Nico kein Konto. Richtig, falsch oder nicht gesagt?', 'Sans emploi, Nico n’obtient pas de compte. Vrai, faux ou pas dit ?'), [
          ['richtig'],
          ['falsch', true],
          ['nicht gesagt'],
        ], 'Max explique que la banque préfère un revenu régulier, mais que Nico peut dire sans problème qu’il n’a pas encore de travail. D’ailleurs, Yara annonce ensuite à Tarek que Nico a maintenant son propre compte.'),
        choice('q3', bi('Was ist am Bankautomaten passiert?', 'Que s’est-il passé au distributeur ?'), [
          ['Selma hat ihre PIN vergessen.'],
          ['Der Automat hatte kein Geld mehr.'],
          ['Die Karte ist im Automaten geblieben.', true],
        ], 'Un message d’erreur est apparu : Selma n’a même pas pu taper son code, et la carte est restée dans l’appareil. Un employé de la banque a dû l’aider. Elle n’a donc pas oublié son code : elle n’a pas eu le temps de le saisir.'),
        match('q4', bi('Wer macht was? Verbinden Sie.', 'Qui fait quoi ? Associez.'), [
          ['Max', 'erklärt Nico, wie man ein Konto eröffnet.'],
          ['Selma', 'braucht Hilfe am Bankautomaten.'],
          ['Sebastian', 'hat die Porträts fotografiert.'],
          ['Lisa', 'leitet den Deutschunterricht.'],
        ], 'Max, qui s’y connaît, explique la banque à Nico ; Selma a besoin d’un employé au distributeur ; les portraits de la colocation sont des photos de Sebastian ; et c’est Lisa qui mène le cours d’allemand, avec ces photos comme support.'),
        choice('q5', bi('Wie beschreibt Nico seinen Bruder?', 'Comment Nico décrit-il son frère ?'), [
          ['Er sagt fast nichts über ihn.', true],
          ['Er findet ihn sehr sympathisch.'],
          ['Er zeigt ein Foto von ihm.'],
        ], 'Lisa insiste, mais Nico ne dit presque rien : son frère a les cheveux foncés et a l’air « normal », puis « keine Ahnung » (aucune idée). Il évite visiblement le sujet et ne montre aucune photo.'),
        fill('q6', bi('Ergänzen Sie.', 'Complétez.'), 'Selmas Großeltern wohnen in einem [[1]], weil sie viel [[2]] brauchen.', [
          ['Pflegeheim', 'Altenpflegeheim'],
          ['Hilfe'],
        ], 'Selma explique que ses autres grands-parents vivent dans une maison de retraite médicalisée (Pflegeheim) : ils sont très âgés et ont besoin de beaucoup d’aide. Son grand-père ne mange plus seul, sa grand-mère voit mal.'),
        choice('q7', bi('Warum muss Selma plötzlich gehen?', 'Pourquoi Selma doit-elle partir brusquement ?'), [
          ['Ihr Kurs fängt gleich an.'],
          ['Ihr Vater ist beim Arzt.', true],
          ['Ihre Mutter hat Geburtstag.'],
        ], 'Sa mère a appelé cinq fois : son père a eu un malaise (un problème de circulation) et il est chez le médecin. Selma part tout de suite, et Lisa propose de la conduire. Le cours, lui, avait déjà commencé.'),
        order('q8', bi('Ordnen Sie die Szenen.', 'Remettez les scènes dans l’ordre.'), [
          ['Max erklärt Nico das Konto.', 'Nico trifft Selma vor der Bank.', 'Selmas Mutter ruft an.', 'Lisa beginnt den Unterricht.'],
        ], 'Au restaurant, Max explique d’abord le compte à Nico ; devant la banque, Nico retrouve Selma ; sur le chemin du cours, la mère de Selma l’appelle ; enfin, chez Lisa, la leçon commence avec les photos de Sebastian.'),
      ],
    },
    {
      title: 'WG, Nachbarn und ein Überraschungsgast · Colocation, voisins et visite surprise',
      episodes: [12, 17], start: '16:02', end: '23:28', approx: true,
      context: contexte({
        episodes: [12, 17],
        situation: [
          ['Selma ist auf dem Weg zu ihrem Vater. In der U-Bahn-Station trifft sie eine ältere Dame.', 'Selma est en route pour rejoindre son père. Dans la station de métro, elle croise une dame âgée.'],
          ['In der WG ist Nina gar nicht zufrieden, und Yara ärgert sich über ihren Nachbarn.', 'Dans la colocation, Nina n’est pas du tout contente, et Yara est agacée par son voisin.'],
          ['Am Abend feiern die Freunde im Restaurant.', 'Le soir, les amis font la fête au restaurant.'],
        ],
        questions: [
          ['Welche Aufgaben gibt es in einer WG?', 'Quelles tâches y a-t-il dans une colocation ?'],
          ['Welche Probleme kann man mit Nachbarn haben?', 'Quels problèmes peut-on avoir avec des voisins ?'],
          ['Wer kommt wohl am Abend ins Restaurant?', 'Qui va arriver le soir au restaurant, à votre avis ?'],
        ],
        focus: [
          ['Achten Sie auf die Wörter rund um Haushalt und Wohnen.', 'Soyez attentif au vocabulaire du ménage et du logement.'],
        ],
      }),
      keywords: [
        nom('die', 'WG', 'WGs', 'la colocation', 'abréviation de Wohngemeinschaft ; on prononce [ve:ge:]'),
        nom('der', 'Müll', null, 'les ordures, les déchets', 'den Müll rausbringen : sortir les poubelles'),
        mot('aufräumen', 'ranger', 'séparable : Ich räume später auf.'),
        mot('einziehen', 'emménager', 'séparable ; Perfekt avec sein : Nico ist eingezogen.'),
        nom('der', 'Vermieter', 'Vermieter', 'le propriétaire (bailleur)', 'féminin : die Vermieterin'),
        nom('die', 'Mülltonne', 'Mülltonnen', 'la poubelle (conteneur)'),
        mot('sich beschweren über', 'se plaindre de', '+ accusatif : Sie beschwert sich über den Nachbarn.'),
        mot('schwanger', 'enceinte'),
        nom('die', 'Tagesmutter', 'Tagesmütter', 'l’assistante maternelle'),
        mot('einsam', 'seul, isolé'),
      ],
      questions: [
        choice('q1', bi('Wie geht es Inge – nach ihren eigenen Worten?', 'Comment va Inge, d’après ses propres mots ?'), [
          ['Sie fühlt sich einsam.'],
          ['Sie ist krank und müde.'],
          ['Sie ist fit und gesund.', true],
        ], 'Inge sort de chez le médecin, mais pour elle ce sont des broutilles : elle se dit en pleine forme. C’est son fils qui la croit seule et lui cherche une maison de retraite ; elle trouve cette idée absurde.'),
        choice('q2', bi('Warum ist Nina sauer?', 'Pourquoi Nina est-elle fâchée ?'), [
          ['Niemand hilft ihr im Haushalt.', true],
          ['Nico wohnt jetzt in der WG.'],
          ['Lisa hat ihr Zimmer vermietet.'],
        ], 'Nina a encore fait tout le ménage seule : l’aspirateur, les poubelles, la salle de bains, les bouteilles consignées… Personne ne l’a aidée. À ce moment, Nico n’habite pas encore là : la chambre libre n’est qu’une idée de Lisa.'),
        choice('q3', bi('Herr Friese findet das Problem mit der Mülltonne sehr schlimm. Richtig, falsch oder nicht gesagt?', 'M. Friese trouve le problème de la poubelle très grave. Vrai, faux ou pas dit ?'), [
          ['richtig'],
          ['falsch', true],
          ['nicht gesagt'],
        ], 'Le propriétaire minimise : pour lui, ce n’est pas si grave, et Yara devrait arrêter de s’énerver. Il promet seulement de parler au voisin, car il ne veut pas de dispute. Il a aussi autre chose à dire à Yara, mais plus tard.'),
        choice('q4', bi('Nico sagt zu Yara: „Du bist schon sehr deutsch geworden!“ Was meint er?', 'Nico dit à Yara : « Du bist schon sehr deutsch geworden! ». Que veut-il dire ?'), [
          ['Elle parle allemand sans aucun accent.'],
          ['Elle a enfin la nationalité allemande.'],
          ['Elle tient à l’ordre et aux règles.', true],
        ], 'Nico taquine sa tante : elle vient de se plaindre au propriétaire d’une poubelle mal placée. Pour lui, insister ainsi sur l’ordre et les règles, c’est un cliché « très allemand ». Yara proteste, mais Nico maintient.'),
        match('q5', bi('Wer macht was? Verbinden Sie.', 'Qui fait quoi ? Associez.'), [
          ['Lisa', 'bietet Nico ein freies Zimmer an.'],
          ['Yara', 'beschwert sich beim Vermieter.'],
          ['Nina', 'erzählt Lisa ein großes Geheimnis.'],
          ['Inge', 'erzählt, wie man früher gewohnt hat.'],
          ['Max', 'bittet Pepe, das Restaurant zu verlassen.'],
        ], 'Lisa a l’idée de la chambre libre ; Yara se plaint du voisin auprès de M. Friese ; Nina confie à Lisa qu’elle est enceinte ; Inge raconte qu’autrefois on vivait chez ses parents ; et Max demande à Pepe de partir.'),
        fill('q6', bi('Ergänzen Sie.', 'Complétez.'), 'Nico wohnt jetzt in einer [[1]] mit Lisa, Nina und Sebastian. Früher hat Inge noch bei ihrer [[2]] gewohnt.', [
          ['WG', 'Wohngemeinschaft'],
          ['Familie'],
        ], 'Au restaurant, on trinque à la nouvelle chambre de Nico dans la colocation (WG, abréviation de Wohngemeinschaft). Inge explique qu’à son époque, les jeunes restaient vivre dans leur famille : c’était moins cher.'),
        choice('q7', bi('Warum ist Pepe gekommen?', 'Pourquoi Pepe est-il venu ?'), [
          ['Er will in Deutschland eine Firma gründen.'],
          ['Er will Nico nach Spanien zurückbringen.', true],
          ['Er will mit Yara über ihren Laden sprechen.'],
        ], 'Pepe, le grand frère de Nico, est venu exprès de Munich : leur père lui a demandé de ramener Nico en Espagne, et il parle déjà du prochain vol pour Séville. Nico refuse : il reste en Allemagne.'),
        order('q8', bi('Ordnen Sie die Szenen.', 'Remettez les scènes dans l’ordre.'), [
          ['Selma trifft Inge.', 'Lisa bietet Nico ein Zimmer an.', 'Nina erzählt Lisa ihr Geheimnis.', 'Pepe kommt ins Restaurant.'],
        ], 'Selma croise d’abord Inge dans le métro ; à la colocation, Lisa propose la chambre libre à Nico ; après la scène avec le propriétaire, Nina confie son secret à Lisa ; enfin, pendant la fête, Pepe entre au restaurant.'),
      ],
    },
    {
      title: 'Hotel, Bahn und Umzug · Hôtel, train et déménagement',
      episodes: [18, 22], start: '23:28', end: '30:32', approx: true,
      context: contexte({
        episodes: [18, 22],
        situation: [
          ['Pepe bleibt erst einmal in der Stadt und sucht ein Hotelzimmer.', 'Pepe reste pour l’instant en ville et cherche une chambre d’hôtel.'],
          ['Inge sitzt allein im Restaurant. Max und Tarek wollen ihr helfen.', 'Inge est seule au restaurant. Max et Tarek veulent l’aider.'],
          ['Yara hilft einem Fremden an einem Ticketautomaten, und Nico zieht endlich um.', 'Yara aide un inconnu à un distributeur de tickets, et Nico déménage enfin.'],
        ],
        questions: [
          ['Was fragt man an der Rezeption eines Hotels?', 'Que demande-t-on à la réception d’un hôtel ?'],
          ['Was ist für Sie bei einer Zugreise wichtig?', 'Qu’est-ce qui compte pour vous lors d’un voyage en train ?'],
          ['Was braucht man für einen Umzug?', 'De quoi a-t-on besoin pour un déménagement ?'],
        ],
        focus: [
          ['Achten Sie auf die Zahlen: Preise, Uhrzeiten, Gleise und Linien.', 'Soyez attentif aux nombres : prix, horaires, voies et lignes.'],
        ],
      }),
      keywords: [
        nom('das', 'Einzelzimmer', 'Einzelzimmer', 'la chambre simple', 'contraire : das Doppelzimmer'),
        nom('die', 'Übernachtung', 'Übernachtungen', 'la nuitée'),
        nom('die', 'Kreditkarte', 'Kreditkarten', 'la carte de crédit', 'mit Karte zahlen : payer par carte'),
        nom('der', 'Ausflug', 'Ausflüge', 'l’excursion', 'einen Ausflug buchen : réserver une excursion'),
        nom('das', 'Gleis', 'Gleise', 'la voie (à la gare)', 'Der Zug fährt von Gleis 7 ab.'),
        mot('umsteigen', 'changer (de train, de bus)', 'séparable ; Perfekt avec sein : Ich bin umgestiegen.'),
        nom('der', 'Fahrschein', 'Fahrscheine', 'le titre de transport, le ticket'),
        nom('das', 'Krankenhaus', 'Krankenhäuser', 'l’hôpital'),
        nom('das', 'Möbelstück', 'Möbelstücke', 'le meuble', 'au pluriel, on dit surtout : die Möbel'),
        nom('die', 'Bedingung', 'Bedingungen', 'la condition', 'unter einer Bedingung : à une condition'),
      ],
      questions: [
        choice('q1', bi('Pepe kann sofort mit seiner Kreditkarte bezahlen. Richtig, falsch oder nicht gesagt?', 'Pepe peut payer tout de suite avec sa carte de crédit. Vrai, faux ou pas dit ?'), [
          ['richtig'],
          ['falsch', true],
          ['nicht gesagt'],
        ], 'À la réception, la carte de Pepe est refusée : elle n’est pas acceptée. L’employée s’excuse ensuite du désagrément et lui indique l’ascenseur. Après son long voyage en bus, Pepe n’avait vraiment pas besoin de ça.'),
        fill('q2', bi('Ergänzen Sie die Zahlen.', 'Complétez les nombres.'), 'Pepes Zimmer kostet [[1]] Euro pro Nacht. Inges Zug fährt von Gleis [[2]] ab.', [
          ['139', 'hundertneununddreißig'],
          ['7', 'sieben'],
        ], 'La nuit sans petit-déjeuner coûte 139 euros, au quatrième étage. Le train d’Inge part de la gare centrale de Cologne à 9 h 45, voie 7 : abfahren est séparable, d’où « fährt … ab » en fin de phrase.'),
        choice('q3', bi('Welche Reise buchen Max und Tarek für Inge?', 'Quel voyage Max et Tarek réservent-ils pour Inge ?'), [
          ['eine Busfahrt von Köln nach Bingen'],
          ['eine Zugfahrt von Bingen nach Köln'],
          ['eine Zugfahrt von Köln nach Bingen', true],
        ], 'L’offre pour les groupes de seniors part de la gare centrale de Cologne et traverse la vallée du Rhin en train jusqu’à Bingen, avec déjeuner et visite de la ville, sans changement. Ce n’est pas un voyage en bus.'),
        choice('q4', bi('Warum übernachtet Inge in Bingen?', 'Pourquoi Inge passe-t-elle la nuit à Bingen ?'), [
          ['Alles an einem Tag ist ihr zu anstrengend.', true],
          ['Am Abend fährt kein Zug mehr zurück.'],
          ['Sie will dort abends ins Theater gehen.'],
        ], 'Le train du retour part à 18 h 30 : il y en a donc bien un le soir. Mais tout faire en une seule journée serait trop fatigant pour Inge. Max propose alors de lui réserver une chambre d’hôtel à Bingen.'),
        choice('q5', bi('Wohin möchte der Mann am Ticketautomaten fahren?', 'Où l’homme au distributeur de tickets veut-il aller ?'), [
          ['zum Flughafen'],
          ['zum Krankenhaus', true],
          ['zum Hauptbahnhof'],
        ], 'L’homme a oublié sa pièce d’identité à l’hôpital et veut y retourner. Yara lui conseille la ligne 66 : la 64 va dans l’autre sens, vers l’aéroport. Il préfère un trajet un peu plus long, mais sans changement.'),
        match('q6', bi('Wer macht was? Verbinden Sie.', 'Qui fait quoi ? Associez.'), [
          ['Max', 'hat die Idee, für Inge eine Reise zu buchen.'],
          ['Yara', 'hilft einem Fremden am Ticketautomaten.'],
          ['Sebastian', 'braucht Lisa für sein Fotoprojekt.'],
          ['Inge', 'bringt Nico ein paar Sachen für die WG.'],
        ], 'Max pousse Inge à partir et réserve l’excursion avec Tarek ; Yara aide un inconnu à acheter son ticket ; Sebastian porte les meubles à condition que Lisa participe à son projet photo ; Inge apporte à Nico quelques affaires pour son emménagement.'),
        choice('q7', bi('Am Ende sagen Nico und Sebastian: „Keine Zeit.“ Was meinen sie?', 'À la fin, Nico et Sebastian disent : « Keine Zeit. ». Que veulent-ils dire ?'), [
          ['Ils s’excusent : ils ne peuvent pas aider Inge.'],
          ['Ils sourient : Inge, pressée, a parlé très longtemps.', true],
          ['Ils se plaignent : le déménagement est trop long.'],
        ], 'Inge répète qu’elle n’a pas le temps et qu’elle doit repartir, mais elle parle sans s’arrêter de ses courriels, du surf et de son voyage. Quand elle s’en va, les deux garçons reprennent sa formule en souriant : c’est de l’humour.'),
        order('q8', bi('Ordnen Sie die Szenen.', 'Remettez les scènes dans l’ordre.'), [
          ['Pepe nimmt ein Hotelzimmer.', 'Max und Tarek buchen Inges Ausflug.', 'Yara hilft einem Mann am Automaten.', 'Nico zieht in die WG ein.'],
        ], 'Pepe prend d’abord une chambre pour une nuit ; au restaurant, Max et Tarek réservent l’excursion d’Inge ; Yara aide ensuite un inconnu au distributeur ; enfin, Nico emménage dans la colocation avec ses meubles d’occasion.'),
      ],
    },
    {
      title: 'Gute und schlechte Nachrichten · Bonnes et mauvaises nouvelles',
      episodes: [23, 27], start: '30:32', end: '37:16', approx: true,
      context: contexte({
        episodes: [23, 27],
        situation: [
          ['In der WG-Küche erzählt Nico von seinem Bruder. Lisa bringt einen Brief mit.', 'Dans la cuisine de la colocation, Nico parle de son frère. Lisa arrive avec une lettre.'],
          ['Herr Friese kommt wieder zu Yara: Er hat eine Nachricht für sie.', 'M. Friese revient voir Yara : il a une nouvelle à lui annoncer.'],
          ['Im Deutschkurs geht es um Interessen, im Restaurant um Hobbys.', 'Au cours d’allemand, on parle de centres d’intérêt ; au restaurant, de loisirs.'],
        ],
        questions: [
          ['Was macht Sie froh, und was ärgert Sie?', 'Qu’est-ce qui vous rend heureux, et qu’est-ce qui vous agace ?'],
          ['Wofür interessieren Sie sich in Ihrer Freizeit?', 'À quoi vous intéressez-vous pendant vos loisirs ?'],
        ],
        focus: [
          ['Achten Sie auf Verben mit Präposition: sich ärgern über, sich interessieren für.', 'Soyez attentif aux verbes à préposition : s’agacer de, s’intéresser à.'],
        ],
      }),
      keywords: [
        mot('sich ärgern über', 'être agacé par', '+ accusatif : Ich ärgere mich über meinen Bruder.'),
        nom('das', 'Hausverbot', 'Hausverbote', 'l’interdiction d’entrer (dans un lieu)'),
        nom('der', 'Umschlag', 'Umschläge', 'l’enveloppe'),
        nom('die', 'Zusage', 'Zusagen', 'la réponse positive', 'contraire : die Absage'),
        nom('die', 'Mieterhöhung', 'Mieterhöhungen', 'l’augmentation de loyer'),
        mot('sich interessieren für', 's’intéresser à', '+ accusatif : Ich interessiere mich für Fußball.'),
        mot('beibringen', 'apprendre (à quelqu’un)', 'séparable, datif de la personne : Ich bringe dir das Radfahren bei.'),
        nom('der', 'Verein', 'Vereine', 'le club, l’association'),
        mot('angeln', 'pêcher (à la ligne)'),
        mot('sich etwas überlegen', 'réfléchir à quelque chose', 'Ich überlege es mir. : je vais y réfléchir.'),
      ],
      questions: [
        choice('q1', bi('Was erzählt Nico über Pepe?', 'Que raconte Nico au sujet de Pepe ?'), [
          ['Er hat eine Firma in Deutschland.', true],
          ['Er studiert noch in Sevilla.'],
          ['Er arbeitet bei den Eltern.'],
        ], 'Pepe travaille en Allemagne depuis quelques années et a sa propre entreprise. Selon Nico, il fait toujours ce que disent leurs parents et ne s’intéresse pas à lui. Sebastian déclare même Pepe interdit d’entrée dans la colocation.'),
        choice('q2', bi('Was steht in Lisas Brief von der Abendschule?', 'Que dit la lettre que Lisa reçoit des cours du soir ?'), [
          ['eine Absage'],
          ['eine Zusage', true],
          ['eine Rechnung'],
        ], 'Lisa n’ose pas ouvrir l’enveloppe ; Sebastian est sûr que c’est une réponse positive. Il a raison : c’est une Zusage (le contraire, Absage, est un refus). Nina propose une pizza pour fêter ça.'),
        choice('q3', bi('Herr Friese spricht von einer Mieterhöhung. Yara antwortet: „Das meinen Sie nicht ernst!“ Was drückt sie aus?', 'M. Friese parle d’une augmentation de loyer. Yara répond : « Das meinen Sie nicht ernst! ». Qu’exprime-t-elle ?'), [
          ['Elle accepte la hausse sans discuter.'],
          ['Elle ne comprend pas le mot allemand.'],
          ['Elle est indignée et n’y croit pas.', true],
        ], 'Littéralement « vous ne le pensez pas sérieusement » : Yara est choquée et indignée. Le propriétaire a déjà augmenté son loyer il y a deux ans ; elle refuse de payer plus, car beaucoup de petits commerces ferment à cause des loyers.'),
        choice('q4', bi('Was kann Selma nicht?', 'Que Selma ne sait-elle pas faire ?'), [
          ['Fahrrad fahren', true],
          ['schwimmen'],
          ['singen'],
        ], 'À la question de Lisa, Selma avoue qu’elle ne sait pas faire de vélo. Nico trouve ça impossible, puisque tout le monde roule à vélo ici, et promet de lui apprendre. Selon Lisa, c’est plutôt Nico qui ne chante pas bien.'),
        match('q5', bi('Wer sagt das (sinngemäß)? Verbinden Sie.', 'Qui dit cela (en substance) ? Associez.'), [
          ['Nico', 'Ich zeige dir, wie man Fahrrad fährt.'],
          ['Yara', 'Mehr Miete bezahle ich nicht!'],
          ['Tarek', 'Als Angler sind wir eine Katastrophe.'],
          ['Pepe', 'Bitte lass uns reden, Nico.'],
        ], 'Nico promet d’apprendre le vélo à Selma ; Yara refuse toute hausse de loyer ; Tarek rappelle qu’ils n’ont pris qu’un seul poisson en dix sorties de pêche ; Pepe demande à Nico une chance de lui parler.'),
        fill('q6', bi('Ergänzen Sie.', 'Complétez.'), 'Max mag [[1]], aber er kann nicht reiten. Yara und Tarek finden [[2]] toll.', [
          ['Pferde'],
          ['Volleyball'],
        ], 'Max aime les chevaux (Pferde), mais il ne sait pas monter à cheval et ne veut pas apprendre. Quant au volley, Max croit que personne n’aime ça ; or Yara l’aime et Tarek l’adore.'),
        choice('q7', bi('Was schlägt Pepe am Ende vor?', 'Que propose Pepe à la fin ?'), [
          ['Er fliegt sofort nach Spanien zurück.'],
          ['Er bleibt eine Zeit lang hier.', true],
          ['Er nimmt Nico mit nach München.'],
        ], 'Pepe dit qu’il respecte la décision de Nico, mais qu’il s’inquiète et veut que la famille arrête de se disputer : il reste quelques jours, quelques semaines, peut-être plus, pour l’aider. Nico répond qu’il va y réfléchir.'),
        order('q8', bi('Ordnen Sie die Szenen.', 'Remettez les scènes dans l’ordre.'), [
          ['Lisa öffnet einen Brief.', 'Yara streitet mit ihrem Vermieter.', 'Selma sagt, was sie nicht kann.', 'Pepe kommt ins Restaurant.'],
        ], 'Lisa ouvre d’abord sa lettre dans la colocation ; Yara se dispute ensuite avec M. Friese ; au cours, Selma avoue qu’elle ne sait pas faire de vélo ; enfin, Pepe entre au restaurant pendant que Max et Tarek parlent de loisirs.'),
      ],
    },
    {
      title: 'Viel Arbeit, wenig Hilfe · Beaucoup de travail, peu d’aide',
      episodes: [28, 32], start: '37:16', end: '44:33', approx: true,
      context: contexte({
        episodes: [28, 32],
        situation: [
          ['In der WG gibt es einen neuen Plan, aber Lisa hat gerade viel zu viel zu tun.', 'Dans la colocation, il y a un nouveau planning, mais Lisa a beaucoup trop à faire en ce moment.'],
          ['Yara braucht mehr Kunden für ihren Fahrradladen. Vielleicht kann Pepe helfen?', 'Yara a besoin de plus de clients pour son magasin de vélos. Pepe peut-il l’aider ?'],
          ['Nico ist mit Selma verabredet, und Pepe arbeitet in seinem Hotelzimmer.', 'Nico a rendez-vous avec Selma, et Pepe travaille dans sa chambre d’hôtel.'],
        ],
        questions: [
          ['Wie kann ein kleiner Laden neue Kunden finden?', 'Comment un petit magasin peut-il trouver de nouveaux clients ?'],
          ['Was machen Sie, wenn jemand nicht zu einer Verabredung kommt?', 'Que faites-vous quand quelqu’un ne vient pas à un rendez-vous ?'],
        ],
        focus: [
          ['Achten Sie darauf, wer wem hilft – und wer nicht.', 'Soyez attentif à qui aide qui, et à qui refuse.'],
          ['Achten Sie auch auf die Nachrichten auf dem Handy.', 'Soyez aussi attentif aux messages sur le portable.'],
        ],
      }),
      keywords: [
        nom('das', 'Ehrenamt', 'Ehrenämter', 'le bénévolat', 'adjectif : ehrenamtlich (bénévole)'),
        mot('sich engagieren', 's’engager'),
        nom('der', 'Putzplan', 'Putzpläne', 'le planning de ménage'),
        nom('die', 'Werbung', null, 'la publicité'),
        nom('der', 'Kunde', 'Kunden', 'le client', 'n-Deklination : einen Kunden ; féminin : die Kundin'),
        nom('die', 'Internetseite', 'Internetseiten', 'le site internet', 'synonyme : die Website'),
        mot('sich lohnen', 'valoir la peine', 'Das lohnt sich nicht. : ça ne vaut pas la peine.'),
        nom('die', 'Verabredung', 'Verabredungen', 'le rendez-vous'),
        mot('unzufrieden', 'mécontent'),
        mot('umtauschen', 'échanger (un article)', 'séparable : Ich möchte die Tablets umtauschen.'),
      ],
      questions: [
        choice('q1', bi('Warum hat Lisa im Moment so wenig Zeit?', 'Pourquoi Lisa a-t-elle si peu de temps en ce moment ?'), [
          ['Sie muss für eine Prüfung lernen.'],
          ['Sie hilft Nina jeden Tag.'],
          ['Sie hat jetzt noch einen Job.', true],
        ], 'Lisa a maintenant un emploi en plus de ses cours de langue et de son bénévolat : elle ne sait plus comment tout faire. Sebastian la félicite en plaisantant pour ce nouveau travail. Il n’est question d’aucun examen.'),
        choice('q2', bi('Lisa will mit ihrer ehrenamtlichen Arbeit aufhören. Richtig, falsch oder nicht gesagt?', 'Lisa veut arrêter son travail bénévole. Vrai, faux ou pas dit ?'), [
          ['richtig'],
          ['falsch', true],
          ['nicht gesagt'],
        ], 'Lisa dit le contraire : ce travail lui plaît et elle veut continuer à s’engager ; seulement, avec son emploi, elle n’a plus le temps. Nina propose donc que les colocataires reprennent ses tâches à la maison pendant quelques semaines.'),
        choice('q3', bi('Wie viele Kunden mehr braucht Yara?', 'Combien de clients en plus faut-il à Yara ?'), [
          ['zehn Prozent mehr', true],
          ['zwanzig Prozent mehr'],
          ['doppelt so viele'],
        ], 'Comme M. Friese augmente le loyer, Yara calcule qu’il lui faut dix pour cent de clients en plus, sinon elle devra fermer. Max trouve que c’est déjà beaucoup ; pour toucher beaucoup de monde, ils pensent à Internet.'),
        choice('q4', bi('Warum macht Pepes Firma keine Website für Yara?', 'Pourquoi l’entreprise de Pepe ne fait-elle pas de site pour Yara ?'), [
          ['Seine Mitarbeiter haben Urlaub.'],
          ['Yara kann ihn nicht bezahlen.'],
          ['Ihr Laden ist zu klein für die Firma.', true],
        ], 'Pepe explique que son entreprise travaille pour de très grandes sociétés : le petit magasin de Yara ne vaut pas la peine (das lohnt sich nicht). Yara est blessée et pense que Nico a peut-être raison au sujet de son frère.'),
        match('q5', bi('Wer macht was? Verbinden Sie.', 'Qui fait quoi ? Associez.'), [
          ['Nina', 'stellt einen neuen WG-Plan vor.'],
          ['Max', 'schreibt einen Werbetext für Yara.'],
          ['Selma', 'sagt ihrer Mutter, sie geht zum Kurs.'],
          ['Herr Troyzig', 'will die Tablets zurückgeben.'],
        ], 'Nina présente le nouveau planning de la colocation ; Max invente un texte publicitaire que Yara trouve affreux ; Selma dit à sa mère qu’elle va au cours d’allemand ; et M. Troyzig, client mécontent de Pepe, veut rendre les tablettes.'),
        choice('q6', bi('Warum kann Selmas Mutter Nicos Nachricht lesen?', 'Pourquoi la mère de Selma peut-elle lire le message de Nico ?'), [
          ['Selmas Handy ist zu Hause geblieben.', true],
          ['Nico hat ihr direkt geschrieben.'],
          ['Selma zeigt ihr die Nachricht.'],
        ], 'Selma est partie sans son portable. Quand le message de Nico arrive, c’est sa mère, Aya, qui l’entend sonner et le lit. Elle répond elle-même que Selma ne peut pas venir, et Nico ne comprend pas ce qui se passe.'),
        fill('q7', bi('Ergänzen Sie.', 'Complétez.'), 'Der Kunde ist sehr unzufrieden: Die [[1]] funktioniert nicht, und die Tablets sind zu [[2]].', [
          ['App'],
          ['langsam'],
        ], 'M. Troyzig se plaint : l’application ne fonctionne pas, le site est trop confus et les tablettes conseillées par Pepe sont trop lentes. Il met fin à leur collaboration et veut être remboursé, ce que Pepe refuse.'),
        order('q8', bi('Ordnen Sie die Szenen.', 'Remettez les scènes dans l’ordre.'), [
          ['Nina zeigt den neuen Plan.', 'Max’ Fahrrad geht kaputt.', 'Pepe sagt Yara Nein.', 'Nico wartet auf Selma.', 'Pepe telefoniert mit einem Kunden.'],
        ], 'Nina présente d’abord le planning ; devant le magasin, le vélo de Max se casse ; Pepe refuse ensuite de faire le site de Yara ; Nico attend Selma pour leur leçon de vélo ; enfin, au téléphone, un client reproche à Pepe un travail raté.'),
      ],
    },
    {
      title: 'Inge in Bingen · Inge à Bingen',
      episodes: [33, 36], start: '44:33', end: '53:02', approx: true,
      context: contexte({
        episodes: [33, 36],
        situation: [
          ['Inge macht ihren Ausflug nach Bingen und möchte in einem Lokal essen.', 'Inge fait son excursion à Bingen et veut manger dans un restaurant.'],
          ['Das Lokal ist voll. Ein charmanter Herr fragt, ob er sich zu ihr setzen darf.', 'Le restaurant est plein. Un monsieur charmant demande s’il peut s’asseoir à sa table.'],
        ],
        questions: [
          ['Was ist für Sie ein gutes Essen?', 'Qu’est-ce qu’un bon repas pour vous ?'],
          ['Was ist typisch deutsches Essen – und stimmt das Klischee?', 'Qu’est-ce que la cuisine allemande typique, et ce cliché est-il vrai ?'],
        ],
        focus: [
          ['Achten Sie auf die Gerichte und auf die Wette zwischen Inge und dem Herrn.', 'Soyez attentif aux plats et au pari entre Inge et ce monsieur.'],
        ],
      }),
      keywords: [
        nom('die', 'Speisekarte', 'Speisekarten', 'la carte (du restaurant)'),
        nom('das', 'Gericht', 'Gerichte', 'le plat'),
        nom('der', 'Feinschmecker', 'Feinschmecker', 'le gourmet', 'féminin : die Feinschmeckerin'),
        mot('wetten', 'parier', 'Ich wette, dass … : je parie que …'),
        nom('die', 'Vorspeise', 'Vorspeisen', 'l’entrée', 'puis : die Hauptspeise, die Nachspeise'),
        nom('der', 'Konditor', 'Konditoren', 'le pâtissier', 'die Konditorei : la pâtisserie (le magasin)'),
        mot('schmecken', 'avoir bon goût', '+ datif : Hat es Ihnen geschmeckt?'),
        mot('einladen', 'inviter (payer pour quelqu’un)', 'séparable : Ich lade Sie ein.'),
        nom('das', 'Portemonnaie', 'Portemonnaies', 'le porte-monnaie'),
        mot('peinlich', 'gênant, embarrassant'),
      ],
      questions: [
        choice('q1', bi('Warum ist Jacques in Bingen?', 'Pourquoi Jacques est-il à Bingen ?'), [
          ['Er testet Restaurants in Deutschland.', true],
          ['Er macht denselben Ausflug wie Inge.'],
          ['Er arbeitet als Koch in diesem Lokal.'],
        ], 'Jacques est seulement de passage : il possède trois restaurants en France et veut en ouvrir un en Allemagne. Il teste donc des restaurants allemands. Il ne fait pas partie de l’excursion d’Inge et ne travaille pas dans cet établissement.'),
        choice('q2', bi('Jacques findet die typischen deutschen Gerichte zu einfach. Richtig, falsch oder nicht gesagt?', 'Jacques trouve les plats allemands typiques trop simples. Vrai, faux ou pas dit ?'), [
          ['richtig', true],
          ['falsch'],
          ['nicht gesagt'],
        ], 'Pour Jacques, la cuisine allemande typique, c’est toujours de la saucisse : trop simple, pas assez raffinée. Inge n’est pas d’accord et lui répond que les Français ne mangent pas non plus que de la baguette.'),
        choice('q3', bi('Worum wetten Inge und Jacques?', 'Sur quoi Inge et Jacques parient-ils ?'), [
          ['wer am Ende die Rechnung bezahlt'],
          ['wie viel das Essen am Ende kostet'],
          ['was eine Frau im Lokal bestellt', true],
        ], 'Jacques prétend que les Allemands mangent toujours la même chose et prédit la commande d’une cliente : soupe de tomates et salade. Inge parie qu’elle prendra autre chose. Si Inge perd, elle devra revoir Jacques.'),
        choice('q4', bi('Wer gewinnt die Wette?', 'Qui gagne le pari ?'), [
          ['Jacques'],
          ['Inge', true],
          ['keiner von beiden'],
        ], 'La cliente ne commande pas ce que Jacques avait prévu. À la fin, quand il promet de rendre l’argent du repas et de la rappeler, Inge lui rappelle avec malice qu’il a perdu le pari, avant de partir.'),
        fill('q5', bi('Ergänzen Sie.', 'Complétez.'), 'Jacques ist eigentlich [[1]] von Beruf. Seine Eltern hatten früher ein kleines Bistro in [[2]].', [
          ['Konditor'],
          ['Hamburg'],
        ], 'Jacques avoue qu’il est pâtissier de formation (Konditor) et qu’il a eu sa propre pâtisserie. Ses parents tenaient un petit bistro à Hambourg ; plus tard, il a été critique gastronomique avant d’ouvrir son premier restaurant.'),
        match('q6', bi('Wer macht was? Verbinden Sie.', 'Qui fait quoi ? Associez.'), [
          ['Inge', 'bezahlt am Ende die Rechnung.'],
          ['Jacques', 'bestellt Champagner zum Dessert.'],
          ['die Kellnerin', 'nimmt Jacques’ Mantel und Schal.'],
        ], 'À l’arrivée, la serveuse prend le manteau et l’écharpe de Jacques ; au dessert, Jacques commande du gâteau au citron et du champagne ; à la fin, comme il a oublié son porte-monnaie à l’hôtel, c’est Inge qui paie.'),
        choice('q7', bi('Inge bezahlt und sagt zur Kellnerin: „Stimmt so.“ Was bedeutet das?', 'Inge paie et dit à la serveuse : « Stimmt so. ». Qu’est-ce que cela veut dire ?'), [
          ['Vérifiez l’addition, s’il vous plaît.'],
          ['Je suis d’accord avec vous.'],
          ['Gardez la monnaie.', true],
        ], '« Stimmt so » se dit en payant : on ne veut pas qu’on nous rende la monnaie, le reste est un pourboire pour le personnel. Rien à voir ici avec le verbe stimmen au sens de « être exact » ou « être d’accord ».'),
        order('q8', bi('Ordnen Sie die Szenen.', 'Remettez les scènes dans l’ordre.'), [
          ['Jacques setzt sich zu Inge.', 'Die beiden schließen eine Wette.', 'Jacques bestellt Champagner.', 'Jacques findet sein Portemonnaie nicht.'],
        ], 'Jacques s’assoit d’abord à la table d’Inge ; en regardant la carte, ils font leur pari ; au dessert, Jacques commande du champagne ; au moment de payer, il cherche en vain son porte-monnaie, resté à l’hôtel.'),
      ],
    },
    {
      title: 'Fotos, Erinnerungen und Pläne · Photos, souvenirs et projets',
      episodes: [37, 42], start: '53:02', end: '62:15', approx: true,
      context: contexte({
        episodes: [37, 42],
        situation: [
          ['Sebastian macht heute die Fotos für sein Projekt. Er braucht Hilfe.', 'Sebastian fait aujourd’hui les photos de son projet. Il a besoin d’aide.'],
          ['Inge ist von ihrem Ausflug zurück. Max und Tarek sind sehr neugierig.', 'Inge est rentrée de son excursion. Max et Tarek sont très curieux.'],
          ['Pepe besucht Yara im Laden. Er bringt Blumen mit.', 'Pepe rend visite à Yara au magasin. Il apporte des fleurs.'],
        ],
        questions: [
          ['Kennen Sie schon deutsche Redewendungen? Welche?', 'Connaissez-vous déjà des expressions idiomatiques allemandes ? Lesquelles ?'],
          ['Wohnen Sie lieber in der Stadt oder auf dem Land? Warum?', 'Préférez-vous habiter en ville ou à la campagne ? Pourquoi ?'],
          ['Warum bringt Pepe wohl Blumen mit?', 'Pourquoi Pepe apporte-t-il des fleurs, à votre avis ?'],
        ],
        focus: [
          ['Achten Sie auf die Vergleiche: lauter als, lieber als, günstiger als.', 'Soyez attentif aux comparatifs : plus bruyant que, plutôt que, moins cher que.'],
        ],
      }),
      keywords: [
        nom('die', 'Redewendung', 'Redewendungen', 'l’expression idiomatique'),
        nom('der', 'Ehemann', 'Ehemänner', 'le mari'),
        mot('sich verlieben', 'tomber amoureux', 'Perfekt : Wir haben uns verliebt.'),
        nom('der', 'Ehering', 'Eheringe', 'l’alliance'),
        nom('das', 'Jubiläum', 'Jubiläen', 'l’anniversaire (d’une entreprise, d’un événement)'),
        nom('das', 'Gewissen', null, 'la conscience', 'ein schlechtes Gewissen haben : avoir mauvaise conscience'),
        nom('der', 'Lärm', null, 'le bruit'),
        nom('die', 'Kaltmiete', 'Kaltmieten', 'le loyer hors charges', 'contraire : die Warmmiete (charges comprises)'),
        nom('die', 'Nebenkosten', null, 'les charges (eau, chauffage…)', 'toujours au pluriel'),
        nom('die', 'Kaution', 'Kautionen', 'la caution, le dépôt de garantie'),
      ],
      questions: [
        choice('q1', bi('Was zeigt Sebastian auf seinen neuen Fotos?', 'Que montre Sebastian sur ses nouvelles photos ?'), [
          ['Gerichte aus dem Restaurant'],
          ['Redewendungen, ganz wörtlich', true],
          ['Porträts von alten Menschen'],
        ], 'Sebastian met en scène des expressions allemandes au pied de la lettre, par exemple « alles unter einen Hut bringen » (tout concilier, littéralement « tout mettre sous un chapeau »). Quand Lisa s’étonne du chapeau, il dit travailler avec la perspective.'),
        choice('q2', bi('Inge sagt, die anderen Reisenden standen „mit einem Bein im Grab“. Was meint sie?', 'Inge dit que les autres voyageurs avaient « un pied dans la tombe ». Que veut-elle dire ?'), [
          ['Ils étaient très vieux.', true],
          ['Ils marchaient avec une canne.'],
          ['Ils étaient fatigués du voyage.'],
        ], 'L’expression signifie être très vieux ou malade, proche de la mort. Inge exagère avec humour : ses compagnons de voyage, des retraités, ne parlaient que de leurs maladies. Le voyage lui a quand même plu.'),
        choice('q3', bi('Das Smartphone auf Inges Tisch gehört ihr. Richtig, falsch oder nicht gesagt?', 'Le smartphone sur la table d’Inge est à elle. Vrai, faux ou pas dit ?'), [
          ['richtig'],
          ['falsch', true],
          ['nicht gesagt'],
        ], 'Max remarque ce beau smartphone, mais Inge répond qu’il n’est pas à elle : il appartient à Jacques. Tarek, surpris, demande aussitôt qui est ce Jacques. À Bingen, Jacques avait promis de l’appeler sur ce portable.'),
        fill('q4', bi('Ergänzen Sie.', 'Complétez.'), 'Inge und Günther haben [[1]] geheiratet. Sie trägt immer noch seinen [[2]].', [
          ['1993', 'neunzehnhundertdreiundneunzig'],
          ['Ehering', 'Ring'],
        ], 'Inge raconte que Günther, son mari, était aussi son meilleur ami : d’abord l’amitié, puis l’amour. Ils ont été fiancés longtemps et se sont mariés assez tard, en 1993. Elle porte toujours son alliance (Ehering).'),
        choice('q5', bi('Wie lange gibt es das Restaurant von Max und Tarek schon?', 'Depuis combien de temps le restaurant de Max et Tarek existe-t-il ?'), [
          ['ungefähr fünf Jahre'],
          ['ungefähr zwanzig Jahre'],
          ['ungefähr zehn Jahre', true],
        ], 'Devant le mur de photos, Nico pose la question : cela fait à peu près dix ans. Max et Tarek se rendent compte qu’ils ont presque oublié leur jubilé ! Tarek aimerait une fête avec des invités et de la musique.'),
        match('q6', bi('Wer sagt das (sinngemäß)? Verbinden Sie.', 'Qui dit cela (en substance) ? Associez.'), [
          ['Yara', 'Auf dem Land ist die Luft besser.'],
          ['Pepe', 'In der Stadt kann ich abends ausgehen.'],
          ['Tarek', 'Zum Jubiläum möchte ich ein Fest.'],
          ['Inge', 'Ihr vergesst sicher euren Hochzeitstag.'],
        ], 'Yara rêve de campagne : moins de circulation, un air meilleur, plus de calme ; Pepe préfère la ville pour sortir le soir ; Tarek souhaite une fête pour le jubilé ; Inge taquine Max et Tarek, qui oublieraient sûrement leur anniversaire de mariage.'),
        choice('q7', bi('Was möchte Pepe eigentlich von Yara?', 'Que veut Pepe de Yara, au fond ?'), [
          ['Sie soll Nico von einem Job erzählen.', true],
          ['Sie soll mit ihm eine Wohnung ansehen.'],
          ['Sie soll ihm Geld für die Firma leihen.'],
        ], 'Pepe a trouvé un travail pour Nico, mais son frère ne l’écoute pas : il voudrait que Yara le lui annonce. Elle refuse et lui dit d’essayer lui-même ; si le travail est bon, Nico l’écoutera.'),
        order('q8', bi('Ordnen Sie die Szenen.', 'Remettez les scènes dans l’ordre.'), [
          ['Sebastian fotografiert seine Freunde.', 'Inge erzählt von Günther.', 'Inge fotografiert Max, Tarek und Nico.', 'Pepe bringt Yara Blumen.'],
        ], 'Sebastian fait d’abord ses photos dans la colocation ; au restaurant, Inge parle de Günther à Tarek ; plus tard, elle photographie Max, Tarek et Nico pour le mur ; enfin, Pepe arrive au magasin de Yara avec des fleurs.'),
      ],
    },
    {
      title: 'Umzug und Fahrradstunden · Déménagement et leçons de vélo',
      episodes: [43, 48], start: '62:15', end: '71:43', approx: true,
      context: contexte({
        episodes: [43, 48],
        situation: [
          ['Nico will wissen, warum Selma nicht gekommen ist. Er fährt zu ihr.', 'Nico veut savoir pourquoi Selma n’est pas venue. Il va la voir.'],
          ['Inge und Jacques treffen sich wieder: ein Spaziergang, dann eine Überraschung.', 'Inge et Jacques se revoient : une promenade, puis une surprise.'],
          ['Später üben Nico und Selma zusammen Fahrrad fahren.', 'Plus tard, Nico et Selma s’entraînent ensemble à faire du vélo.'],
        ],
        questions: [
          ['Warum hat Selma das Treffen wohl abgesagt?', 'Pourquoi Selma a-t-elle annulé le rendez-vous, à votre avis ?'],
          ['Was war früher anders, ohne Handy und Internet?', 'Qu’est-ce qui était différent autrefois, sans portable ni Internet ?'],
        ],
        focus: [
          ['Achten Sie beim Umzug auf die Präpositionen: auf, neben, hinter, an.', 'Pendant le déménagement, soyez attentif aux prépositions : sur, à côté de, derrière, contre.'],
          ['Achten Sie auch auf „früher“ und „heute“.', 'Soyez aussi attentif à « autrefois » et « aujourd’hui ».'],
        ],
      }),
      keywords: [
        nom('die', 'Kiste', 'Kisten', 'la caisse, le carton'),
        nom('das', 'Regal', 'Regale', 'l’étagère'),
        mot('versichert', 'assuré', 'die Versicherung : l’assurance'),
        mot('sich verletzen', 'se blesser', 'Er hat sich am Kopf verletzt.'),
        nom('die', 'Kutsche', 'Kutschen', 'la calèche'),
        mot('erreichbar', 'joignable'),
        nom('die', 'Tradition', 'Traditionen', 'la tradition'),
        nom('das', 'Naturtalent', 'Naturtalente', 'le don naturel'),
        mot('bremsen', 'freiner'),
        mot('sich melden', 'donner des nouvelles', 'Ich melde mich bei dir. : je te recontacte.'),
      ],
      questions: [
        choice('q1', bi('Warum hat Selma Ärger mit ihren Eltern?', 'Pourquoi Selma a-t-elle des ennuis avec ses parents ?'), [
          ['Ihre Mutter hat ihre Lüge entdeckt.', true],
          ['Sie will nicht mit umziehen.'],
          ['Sie hat ihren Kurs abgebrochen.'],
        ], 'Selma avait dit à sa mère qu’elle allait au cours d’allemand, alors qu’elle voulait voir Nico. Sa mère l’a prise en flagrant délit de mensonge et a annulé le rendez-vous à sa place. Désormais, elle ne doit plus voir d’inconnus.'),
        match('q2', bi('Wohin kommen die Sachen im Umzugswagen? Verbinden Sie.', 'Où vont les affaires dans le camion de déménagement ? Associez.'), [
          ['das Regal', 'hinten auf die Ladefläche'],
          ['die Matratzen', 'neben das Regal'],
          ['die Kisten', 'hinter das Regal'],
          ['die kleinen Sachen', 'an die Seite'],
        ], 'Avec un déplacement (wohin?), les prépositions mixtes prennent l’accusatif : auf die Ladefläche, neben das Regal, hinter das Regal, an die Seite. Selma et son père placent d’abord l’étagère, puis le reste autour.'),
        choice('q3', bi('Selma möchte, dass Nico beim Umzug hilft. Richtig, falsch oder nicht gesagt?', 'Selma veut que Nico aide au déménagement. Vrai, faux ou pas dit ?'), [
          ['richtig'],
          ['falsch', true],
          ['nicht gesagt'],
        ], 'Son père trouve le jeune homme très aimable, mais Selma veut qu’il parte : elle invente toutes sortes de dangers (pas d’assurance, armoire sur le pied, chute dans l’escalier…) pour que son père ne découvre pas qui est Nico.'),
        choice('q4', bi('Welche Überraschung hat Jacques für Inge?', 'Quelle surprise Jacques a-t-il pour Inge ?'), [
          ['ein Abendessen im Hotel'],
          ['eine Bootsfahrt auf dem Rhein'],
          ['eine Fahrt mit der Kutsche', true],
        ], 'Après leur promenade, où ils parlent du bon vieux temps, Jacques propose un moyen de transport vieux de deux cents ans : un tour en calèche dans le centre-ville et le parc. Inge trouve l’idée merveilleuse.'),
        choice('q5', bi('Was sagt Jacques über das Stadtzentrum?', 'Que dit Jacques du centre-ville ?'), [
          ['Es ist heute größer als früher.', true],
          ['Es hat sich kaum verändert.'],
          ['Die Geschäfte sind heute kleiner.'],
        ], 'Jacques est venu ici pour la dernière fois il y a 40 ans : le centre et la rue commerçante étaient beaucoup plus petits, et le nouvel hôtel de ville n’existait pas. Inge regrette seulement qu’aujourd’hui les magasins se ressemblent tous.'),
        fill('q6', bi('Ergänzen Sie.', 'Complétez.'), 'Selma ist ein [[1]]: Letzte Woche konnte sie noch nicht Fahrrad fahren. Früher hat sie viele Jahre [[2]].', [
          ['Naturtalent'],
          ['getanzt'],
        ], 'Selma progresse si vite qu’elle se dit elle-même un don naturel (Naturtalent). Elle raconte aussi qu’elle jouait un peu au basket avec des amies et surtout qu’elle a dansé pendant des années : Perfekt de tanzen, hat getanzt.'),
        choice('q7', bi('Was erwartet Selmas Familie von ihr?', 'Qu’est-ce que la famille de Selma attend d’elle ?'), [
          ['Sie soll schnell Ärztin werden.'],
          ['Sie soll allein in Deutschland leben.'],
          ['Sie soll die Tradition respektieren.', true],
        ], 'Selma aime ses parents, mais dans certaines familles traditionnelles en Syrie, hommes et femmes n’ont pas les mêmes rôles. Sa famille attend qu’elle respecte cette tradition : elle ne doit pas voir un homme seule.'),
        order('q8', bi('Ordnen Sie die Szenen.', 'Remettez les scènes dans l’ordre.'), [
          ['Selma lädt Kisten in den Umzugswagen.', 'Inge und Jacques machen einen Spaziergang.', 'Selma fährt fast allein Fahrrad.', 'Nico spielt Gitarre für Selma.'],
        ], 'Nico trouve d’abord Selma en plein déménagement ; Inge et Jacques se promènent, puis montent en calèche ; Selma fait ensuite de grands progrès à vélo ; enfin, pour qu’elle danse, Nico joue de la guitare.'),
      ],
    },
    {
      title: 'Lebenslauf und Bewerbung · CV et candidature',
      episodes: [49, 54], start: '71:43', end: '80:55', approx: true,
      context: contexte({
        episodes: [49, 54],
        situation: [
          ['Im Restaurant erzählt Pepe Max, warum er und Nico kaum Kontakt haben.', 'Au restaurant, Pepe explique à Max pourquoi Nico et lui n’ont presque pas de contact.'],
          ['Im Deutschkurs geht es um den Lebenslauf. Dann bittet Selma Lisa um Hilfe.', 'Au cours d’allemand, on parle du CV. Puis Selma demande de l’aide à Lisa.'],
          ['Bald feiert das Restaurant sein Jubiläum, doch es gibt ein Problem.', 'Le restaurant va bientôt fêter son jubilé, mais il y a un problème.'],
        ],
        questions: [
          ['Was gehört in einen Lebenslauf?', 'Que met-on dans un CV ?'],
          ['Welche Fragen hört man oft in einem Bewerbungsgespräch?', 'Quelles questions entend-on souvent dans un entretien d’embauche ?'],
        ],
        focus: [
          ['Achten Sie auf höfliche Fragen am Telefon und im Gespräch.', 'Soyez attentif aux questions polies au téléphone et pendant l’entretien.'],
        ],
      }),
      keywords: [
        nom('der', 'Lebenslauf', 'Lebensläufe', 'le CV'),
        nom('der', 'Schulabschluss', 'Schulabschlüsse', 'le diplôme de fin d’études scolaires'),
        nom('das', 'Praktikum', 'Praktika', 'le stage', 'pluriel d’origine latine : die Praktika'),
        mot('sich bewerben', 'postuler', 'auf + accusatif : Ich bewerbe mich auf eine Stelle.'),
        nom('die', 'Stelle', 'Stellen', 'le poste, l’emploi'),
        nom('das', 'Bewerbungsgespräch', 'Bewerbungsgespräche', 'l’entretien d’embauche'),
        mot('zuverlässig', 'fiable'),
        nom('die', 'Vollzeit', null, 'le temps plein', 'contraire : die Teilzeit'),
        mot('absagen', 'annuler', 'séparable : Die Band hat abgesagt.'),
        nom('die', 'Ausstellung', 'Ausstellungen', 'l’exposition'),
      ],
      questions: [
        choice('q1', bi('Warum redet Nico nicht mit Pepe – nach Pepes Meinung?', 'Pourquoi Nico ne parle-t-il pas à Pepe, selon Pepe ?'), [
          ['Pepe wohnt zu weit weg.'],
          ['Pepe hat nicht studiert.'],
          ['Pepe hat ihn nie unterstützt.', true],
        ], 'Pepe raconte qu’il a toujours été le fils préféré : il a fait de brillantes études, comme le voulaient leurs parents, alors que Nico voulait apprendre un métier manuel. La vraie raison, avoue-t-il, c’est qu’il n’a jamais soutenu son frère.'),
        choice('q2', bi('Max sagt zu Pepe: „Das geht aufs Haus.“ Was bedeutet das?', 'Max dit à Pepe : « Das geht aufs Haus. ». Qu’est-ce que cela veut dire ?'), [
          ['C’est offert par la maison.', true],
          ['On vous le livre à domicile.'],
          ['Mettez-le sur ma note.'],
        ], '« Das geht aufs Haus » signifie que le restaurant offre le repas : Pepe n’a rien à payer. Pepe plaisante qu’il est pourtant « le méchant frère », et Max répond qu’il n’est pas son méchant frère à lui.'),
        match('q3', bi('Wer macht was? Verbinden Sie.', 'Qui fait quoi ? Associez.'), [
          ['Lisa', 'erklärt, was in einen Lebenslauf gehört.'],
          ['Ibrahim', 'will in einem Fast-Food-Restaurant arbeiten.'],
          ['Pepe', 'spielt im Übungsgespräch den Chef.'],
          ['Tarek', 'sagt, dass die Band nicht kommt.'],
          ['Herr Friese', 'gibt Yara Tipps für die Stadt.'],
        ], 'Lisa détaille le contenu d’un CV ; Ibrahim postule dans un fast-food ; Pepe joue le recruteur pour l’entraîner ; Tarek annonce que le groupe a annulé ; M. Friese, le propriétaire, donne à Yara des idées de visites culturelles.'),
        choice('q4', bi('Was ist Ibrahim eigentlich von Beruf?', 'Quel est en réalité le métier d’Ibrahim ?'), [
          ['Arzt', true],
          ['Koch'],
          ['Lehrer'],
        ], 'Selma révèle que son père est médecin (urologue, précise-t-il plus tard), mais il doit encore réussir un examen de langue pour exercer en Allemagne. Ibrahim n’aime pas qu’elle en parle : cela ne regarde personne, dit-il.'),
        choice('q5', bi('Lisa verbessert Ibrahims Frage am Telefon. Warum?', 'Lisa corrige la question d’Ibrahim au téléphone. Pourquoi ?'), [
          ['Seine Frage war grammatisch falsch.'],
          ['Ihre Version klingt höflicher.', true],
          ['Er hat den falschen Namen gesagt.'],
        ], 'La phrase d’Ibrahim était correcte, mais trop directe. Lisa propose une question indirecte, « Können Sie mir sagen, wie … ? », plus polie au téléphone. Elle lui conseille aussi de ne parler de ses qualifications que si on les lui demande.'),
        fill('q6', bi('Ergänzen Sie.', 'Complétez.'), 'Ibrahim möchte [[1]] arbeiten, nicht Teilzeit. Im Übungsgespräch bekommt er die Stelle, zuerst für [[2]] Monate.', [
          ['Vollzeit'],
          ['drei', '3'],
        ], 'Pepe, dans son rôle de patron, demande temps partiel ou temps plein : Ibrahim veut travailler à temps plein (Vollzeit), l’après-midi et le soir, car il suit un cours de langue le matin. À la fin, il « obtient » un contrat de trois mois.'),
        choice('q7', bi('Warum hat die Band für das Jubiläum abgesagt?', 'Pourquoi le groupe a-t-il annulé pour le jubilé ?'), [
          ['Die Band ist zu teuer.'],
          ['Der Sänger ist krank.', true],
          ['Das Konzert ist zu spät.'],
        ], 'Tarek annonce la mauvaise nouvelle : le chanteur est malade, et si tard, impossible de trouver un remplaçant. Les invités arrivent dans quelques heures… Max et Tarek se tournent alors vers Nico, qui refuse aussitôt.'),
        order('q8', bi('Ordnen Sie die Szenen.', 'Remettez les scènes dans l’ordre.'), [
          ['Pepe erzählt Max von seiner Familie.', 'Lisa bekommt eine Nachricht von Selma.', 'Ibrahim übt ein Gespräch mit Pepe.', 'Tarek bringt eine schlechte Nachricht.'],
        ], 'Pepe raconte d’abord son histoire familiale à Max ; pendant son cours sur le CV, Lisa reçoit un message de Selma ; après l’entraînement au téléphone, Ibrahim répète l’entretien avec Pepe ; enfin, Tarek annonce que le groupe ne viendra pas.'),
      ],
    },
    {
      title: 'Ein Fest im Restaurant · Une fête au restaurant',
      episodes: [55, 60], start: '80:55', end: '88:28', approx: true,
      context: contexte({
        episodes: [55, 60],
        situation: [
          ['Yaras beste Freundin Sarah ist zu Besuch. Die beiden besichtigen die Stadt.', 'Sarah, la meilleure amie de Yara, est en visite. Toutes deux visitent la ville.'],
          ['Am Abend suchen sie ein Programm: Konzert, Theater oder Club?', 'Le soir, elles cherchent un programme : concert, théâtre ou club ?'],
          ['Im Restaurant von Max und Tarek wird das Jubiläum gefeiert.', 'Au restaurant de Max et Tarek, on fête le jubilé.'],
        ],
        questions: [
          ['Was zeigen Sie einer Freundin in Ihrer Stadt?', 'Que montrez-vous à une amie dans votre ville ?'],
          ['Welche Feste kennen Sie aus Deutschland?', 'Quelles fêtes allemandes connaissez-vous ?'],
        ],
        focus: [
          ['Achten Sie auf die Feste und die Länder, aus denen sie kommen.', 'Soyez attentif aux fêtes et aux pays d’où elles viennent.'],
          ['Achten Sie auch auf Nina beim Anstoßen.', 'Soyez aussi attentif à Nina au moment de trinquer.'],
        ],
      }),
      keywords: [
        mot('beeindruckend', 'impressionnant'),
        nom('die', 'Sehenswürdigkeit', 'Sehenswürdigkeiten', 'le monument, le lieu à voir'),
        mot('ausverkauft', 'complet (épuisé)', 'Die Tickets sind ausverkauft.'),
        nom('die', 'Abendkasse', 'Abendkassen', 'la billetterie du soir (sur place)'),
        nom('der', 'Kürbis', 'Kürbisse', 'la citrouille, la courge'),
        nom('das', 'Volksfest', 'Volksfeste', 'la fête populaire'),
        mot('anstoßen', 'trinquer', 'séparable : Wir stoßen auf das Jubiläum an.'),
        mot('verantwortungslos', 'irresponsable'),
        mot('sich raushalten', 'ne pas se mêler (de quelque chose)', 'séparable : Halt dich da raus!'),
        mot('brav', 'sage'),
      ],
      questions: [
        choice('q1', bi('Wie fand Sarah die Ausstellung im Stadtschloss?', 'Comment Sarah a-t-elle trouvé l’exposition au château ?'), [
          ['wunderschön und spannend'],
          ['nicht besonders interessant', true],
          ['zu voll und zu teuer'],
        ], 'Le château lui-même l’a impressionnée, mais l’exposition l’a peu intéressée. Yara s’en amuse : à peine arrivée, Sarah critique déjà, comme au temps où elles étaient en formation ensemble.'),
        choice('q2', bi('Warum reist Sarah gerade herum?', 'Pourquoi Sarah voyage-t-elle en ce moment ?'), [
          ['Ihr Vater wollte, dass sie die Welt sieht.', true],
          ['Sie sucht in Deutschland eine Arbeit.'],
          ['Sie möchte Yaras Laden kaufen.'],
        ], 'Le père de Sarah est mort il y a peu, et il lui manque beaucoup. Il avait toujours voulu qu’elle voie le monde : elle voyage donc, et passe dire bonjour à Yara, qu’elle remercie de l’avoir aidée ces dernières semaines.'),
        choice('q3', bi('Was ist das Problem mit dem Rockkonzert?', 'Quel est le problème avec le concert de rock ?'), [
          ['Sarah mag keine laute Rockmusik.'],
          ['Der Club ist heute Abend geschlossen.'],
          ['Die Tickets sind wohl ausverkauft.', true],
        ], 'Le rock plaît à Sarah, mais la chanteuse est très populaire : Yara pense que les billets sont épuisés, même à la caisse du soir. Elles envisagent alors une comédie musicale ou le théâtre, puis Yara propose de rencontrer son neveu.'),
        match('q4', bi('Wer sagt das (sinngemäß)? Verbinden Sie.', 'Qui dit cela (en substance) ? Associez.'), [
          ['Nina', 'Halloween ohne Kürbisse geht nicht.'],
          ['Max', 'Wir brauchen auch deutsche Feste.'],
          ['Lisa', 'Du darfst keinen Alkohol trinken!'],
          ['Nico', 'Was heißt eigentlich „schwanger“?'],
        ], 'Nina énumère tous les plats à la citrouille ; Max veut aussi des fêtes populaires allemandes, comme le carnaval ou une fête du vin ; Lisa crie que Nina, enceinte, ne doit pas boire ; et Nico, à la fin, demande ce que veut dire « schwanger ».'),
        choice('q5', bi('Sebastian weiß schon lange, dass Nina schwanger ist. Richtig, falsch oder nicht gesagt?', 'Sebastian sait depuis longtemps que Nina est enceinte. Vrai, faux ou pas dit ?'), [
          ['richtig'],
          ['falsch', true],
          ['nicht gesagt'],
        ], 'Sebastian l’apprend pendant la dispute : surpris, il demande à Nina si elle est vraiment enceinte, puis la félicite. Seule Lisa était au courant. Nico, lui, n’a même pas encore compris le mot.'),
        fill('q6', bi('Ergänzen Sie.', 'Complétez.'), 'Nina ist wütend: Lisa hat sie nicht zu den [[1]] begleitet. Außerdem hat Dario sie [[2]].', [
          ['Untersuchungen', 'Arztterminen', 'Terminen'],
          ['verlassen'],
        ], 'Nina reproche à Lisa de ne pas l’avoir accompagnée à ses examens médicaux (Untersuchungen), alors qu’elle avait promis de l’aider. Puis elle révèle que Dario, le père de l’enfant, l’a quittée (verlassen).'),
        choice('q7', bi('Nina sagt zu Lisa: „Halt dich da raus!“ Was bedeutet das?', 'Nina dit à Lisa : « Halt dich da raus! ». Qu’est-ce que cela veut dire ?'), [
          ['Ne te mêle pas de ça !', true],
          ['Sors d’ici tout de suite !'],
          ['Tiens-toi tranquille à table !'],
        ], 'Sich raushalten, c’est rester en dehors d’une affaire : pour Nina, sa grossesse ne regarde pas Lisa. Il ne s’agit pas de quitter la pièce : raus évoque ici le fait de rester « en dehors » de la question.'),
        order('q8', bi('Ordnen Sie die Szenen.', 'Remettez les scènes dans l’ordre.'), [
          ['Yara und Sarah besichtigen die Stadt.', 'Nico, Lisa und Sebastian machen Musik.', 'Lisa und Nina streiten sich.', 'Sarah verabschiedet sich von Yara.'],
        ], 'Yara et Sarah visitent d’abord la ville ; le soir, au restaurant, Nico, Lisa et Sebastian remplacent le groupe et chantent ; après le toast, Lisa et Nina se disputent ; enfin, au magasin, Sarah fait ses adieux à Yara.'),
      ],
    },
    {
      title: 'Geschenke und ein Jobangebot · Cadeaux et offre d’emploi',
      episodes: [61, 66], start: '88:28', end: '97:16', approx: true,
      context: contexte({
        episodes: [61, 66],
        situation: [
          ['Lisa übt mit Selma Deutsch. Selmas Mutter kommt dazu.', 'Lisa fait travailler l’allemand à Selma. La mère de Selma les rejoint.'],
          ['Nico hat eine Idee für ein Geschenk, aber er braucht Yaras Hilfe.', 'Nico a une idée de cadeau, mais il a besoin de l’aide de Yara.'],
          ['Inge hat Jacques zu sich eingeladen. Und Nico besucht endlich seinen Bruder.', 'Inge a invité Jacques chez elle. Et Nico rend enfin visite à son frère.'],
        ],
        questions: [
          ['Was schenken Sie gern, und was bekommen Sie gern?', 'Qu’aimez-vous offrir, et qu’aimez-vous recevoir ?'],
          ['Welches Fest feiern Sie am liebsten? Warum?', 'Quelle fête préférez-vous ? Pourquoi ?'],
        ],
        focus: [
          ['Achten Sie auf den Dativ: Wem schenkt man was?', 'Soyez attentif au datif : à qui offre-t-on quoi ?'],
        ],
      }),
      keywords: [
        mot('schenken', 'offrir', 'datif + accusatif : Ich schenke ihr ein Fahrrad.'),
        mot('gebraucht', 'd’occasion'),
        mot('sich leisten', 's’offrir, avoir les moyens de', 'Das kann ich mir nicht leisten.'),
        mot('überraschen', 'surprendre', 'die Überraschung : la surprise'),
        nom('der', 'Weihnachtsbaum', 'Weihnachtsbäume', 'le sapin de Noël', 'den Baum schmücken : décorer le sapin'),
        nom('der', 'Osterhase', 'Osterhasen', 'le lièvre de Pâques', 'n-Deklination : den Osterhasen'),
        nom('das', 'Christkind', null, 'l’Enfant Jésus (qui apporte les cadeaux)'),
        nom('das', 'Filmset', 'Filmsets', 'le plateau de tournage'),
        nom('die', 'Serie', 'Serien', 'la série'),
        nom('der', 'Kommissar', 'Kommissare', 'le commissaire'),
      ],
      questions: [
        choice('q1', bi('Was möchte Selma an ihrem Geburtstag machen?', 'Que veut faire Selma pour son anniversaire ?'), [
          ['ins Theater gehen'],
          ['eine Party feiern'],
          ['eislaufen gehen', true],
        ], 'Selma n’a jamais fait de patin à glace et voudrait essayer le jour de son anniversaire, dans quelques semaines. Sa mère précise que son père doit encore donner son accord. Le théâtre n’apparaît que dans l’exercice de grammaire.'),
        fill('q2', bi('Ergänzen Sie die Pronomen im Dativ.', 'Complétez avec les pronoms au datif.'), 'Selma schenkt ihrem Vater ein Theaterticket: Sie schenkt [[1]] ein Ticket. Ihrer Mutter schenkt sie eine DVD: Sie schenkt [[2]] eine DVD.', [
          ['ihm'],
          ['ihr'],
        ], 'Dans l’exercice de Lisa, Selma raisonne à voix haute : der Vater est masculin, le pronom est er, et son datif est ihm. Pour die Mutter, sie devient ihr au datif. Schenken se construit avec un datif (à qui ?) et un accusatif (quoi ?).'),
        choice('q3', bi('Was möchte Nico Selma schenken?', 'Que veut offrir Nico à Selma ?'), [
          ['ein gebrauchtes Fahrrad', true],
          ['ein neues Fahrrad'],
          ['einen Fahrradhelm'],
        ], 'Nico veut offrir un vélo à Selma, mais il n’a pas les moyens d’en acheter un neuf : ce sera donc un vélo d’occasion (gebraucht). Yara trouve que c’est encore cher, mais accepte d’en chercher un ; Nico la remboursera.'),
        choice('q4', bi('Yara findet, Nico sollte mehr Zeit für die Jobsuche verwenden. Richtig, falsch oder nicht gesagt?', 'Yara trouve que Nico devrait consacrer plus de temps à chercher du travail. Vrai, faux ou pas dit ?'), [
          ['richtig', true],
          ['falsch'],
          ['nicht gesagt'],
        ], 'Yara trouve l’idée du cadeau gentille, mais elle rappelle à Nico qu’il devrait plutôt passer du temps à chercher un emploi ; en attendant, il lui faut des cadeaux bon marché. Nico répond qu’il trouvera bientôt quelque chose.'),
        choice('q5', bi('Warum hat Inge ein Problem?', 'Pourquoi Inge a-t-elle un problème ?'), [
          ['Sie hat keine Zeit für Jacques.'],
          ['Sie kocht nicht gut.', true],
          ['Ihr Herd ist kaputt.'],
        ], 'Inge a invité Jacques chez elle et promis de cuisiner, mais elle cuisine mal, et lui est restaurateur ! Max et Tarek la rassurent : ils préparent tout, des paupiettes au chou rouge et aux quenelles ; elle n’aura qu’à réchauffer.'),
        match('q6', bi('Wer macht was? Verbinden Sie.', 'Qui fait quoi ? Associez.'), [
          ['Max und Tarek', 'kochen das Essen für Inges Abend.'],
          ['Jacques', 'hat als Kind wegen eines Hasenbratens geweint.'],
          ['Inge', 'hat mit Günther den Weihnachtsbaum geschmückt.'],
          ['Pepe', 'bietet Nico ein Praktikum beim Film an.'],
        ], 'Max et Tarek préparent le repas d’Inge ; Jacques raconte qu’enfant, il a pleuré en croyant manger le lièvre de Pâques ; Inge se souvient des Noëls avec Günther, du sapin et des bougies ; Pepe propose à Nico un stage sur un tournage.'),
        choice('q7', bi('Was für eine Serie wird gedreht?', 'Quel genre de série tourne-t-on ?'), [
          ['eine ernste Arztserie'],
          ['eine lustige Krimiserie', true],
          ['eine Serie über Fußball'],
        ], 'Pepe explique que c’est une série policière, mais pas sérieuse : plutôt une comédie policière, où un commissaire doit travailler avec son adversaire. Elle est tirée d’un roman. Pepe, lui, préfère les documentaires.'),
        order('q8', bi('Ordnen Sie die Szenen.', 'Remettez les scènes dans l’ordre.'), [
          ['Selma übt den Dativ mit Lisa.', 'Nico bittet Yara um Hilfe.', 'Inge bittet Max und Tarek um Hilfe.', 'Pepe erzählt Nico von der Serie.'],
        ], 'Selma révise d’abord le datif avec Lisa ; Nico demande ensuite à Yara de l’aider à trouver un vélo ; au restaurant, Inge appelle Max et Tarek au secours ; enfin, à l’hôtel, Pepe décrit à Nico la série de son futur stage.'),
      ],
    },
    {
      title: 'Filmträume und ein Geburtstag · Rêves de cinéma et un anniversaire',
      episodes: [67, 71], start: '97:16', end: '104:10', approx: true,
      context: contexte({
        episodes: [67, 71],
        situation: [
          ['Das Praktikum ist vorbei. Nico erzählt Max und Tarek von seiner Zeit am Filmset.', 'Le stage est terminé. Nico raconte à Max et Tarek son expérience sur le tournage.'],
          ['Dann spricht er mit Yara über seine Zukunft.', 'Puis il parle de son avenir avec Yara.'],
          ['Im Park hat Nico eine Überraschung für Selma.', 'Au parc, Nico a une surprise pour Selma.'],
        ],
        questions: [
          ['Möchten Sie gern beim Film arbeiten? Warum (nicht)?', 'Aimeriez-vous travailler dans le cinéma ? Pourquoi (pas) ?'],
          ['Was kann passieren, wenn Selmas Eltern von dem Treffen erfahren?', 'Que peut-il se passer si les parents de Selma apprennent ce rendez-vous ?'],
        ],
        focus: [
          ['Achten Sie auf die Gefühle: Stolz, Freude, Ärger.', 'Soyez attentif aux sentiments : fierté, joie, colère.'],
        ],
      }),
      keywords: [
        nom('die', 'Filmklappe', 'Filmklappen', 'le clap (de cinéma)'),
        nom('der', 'Regisseur', 'Regisseure', 'le réalisateur', 'féminin : die Regisseurin'),
        nom('die', 'Rolle', 'Rollen', 'le rôle'),
        nom('der', 'Fußgänger', 'Fußgänger', 'le piéton'),
        nom('das', 'Autogramm', 'Autogramme', 'l’autographe'),
        nom('der', 'Schauspieler', 'Schauspieler', 'l’acteur', 'féminin : die Schauspielerin'),
        nom('der', 'Lohn', 'Löhne', 'le salaire'),
        nom('das', 'Zeugnis', 'Zeugnisse', 'le certificat, l’attestation', 'das Praktikumszeugnis : l’attestation de stage'),
        mot('erlauben', 'permettre, autoriser', 'Hat dein Vater das erlaubt?'),
        mot('schuld sein', 'être responsable, fautif', 'Du bist schuld! : c’est ta faute !'),
      ],
      questions: [
        choice('q1', bi('Welche Rolle spielt Nico in der Serie?', 'Quel rôle Nico joue-t-il dans la série ?'), [
          ['einen Kommissar'],
          ['einen Gangster'],
          ['einen Fußgänger', true],
        ], 'Nico joue un petit rôle : à la fin d’une course-poursuite, le commissaire épuisé lui fonce dedans. Nico est ce piéton ; il lance une réplique, aide le commissaire à se relever, et celui-ci attrape ensuite le gangster.'),
        order('q2', bi('Ordnen Sie die Szenen.', 'Remettez les scènes dans l’ordre.'), [
          ['Nico zeigt seine Filmklappe.', 'Nico spricht mit Yara über seine Zukunft.', 'Selma bekommt ihr Geschenk.', 'Pepe telefoniert mit Selmas Vater.', 'Selma muss nach Hause.'],
        ], 'Nico montre d’abord son clap signé à Max et Tarek ; il parle ensuite de son avenir avec Yara ; au parc, Selma découvre son vélo ; non loin de là, Pepe téléphone au père de Selma ; enfin, Selma doit rentrer chez elle.'),
        choice('q3', bi('Yara kennt einen Schauspieler, der seit einem Jahr keine Aufträge hat. Richtig, falsch oder nicht gesagt?', 'Yara connaît un acteur qui n’a plus de contrat depuis un an. Vrai, faux ou pas dit ?'), [
          ['richtig', true],
          ['falsch'],
          ['nicht gesagt'],
        ], 'Yara parle d’un ami acteur, assez célèbre, qui a même gagné un prix : pourtant, il n’a plus de travail depuis un an, et la plupart des acteurs gagnent peu. Elle promet quand même de soutenir Nico si c’est vraiment ce qu’il veut.'),
        choice('q4', bi('Was möchte Nico nach dem Praktikum werden?', 'Que veut devenir Nico après son stage ?'), [
          ['Regisseur'],
          ['Kameramann'],
          ['Schauspieler', true],
        ], 'Le stage lui a tellement plu qu’il veut continuer dans le cinéma : il pourrait devenir acteur, car il existe de bonnes écoles d’art dramatique en Allemagne. Yara lui demande s’il y a bien réfléchi.'),
        fill('q5', bi('Ergänzen Sie.', 'Complétez.'), 'Nico gibt Yara Geld für das [[1]]. Für das Praktikum hat er einen Lohn und ein sehr gutes [[2]] bekommen.', [
          ['Fahrrad'],
          ['Zeugnis', 'Praktikumszeugnis'],
        ], 'Nico rembourse Yara pour le vélo d’occasion destiné à Selma : il a touché son salaire de stagiaire et reçu une très bonne attestation de stage (Zeugnis). Yara le félicite chaleureusement.'),
        match('q6', bi('Wer macht was? Verbinden Sie.', 'Qui fait quoi ? Associez.'), [
          ['Nico', 'schenkt Selma ein Fahrrad.'],
          ['Pepe', 'telefoniert im Park mit Selmas Vater.'],
          ['Max', 'möchte ein Autogramm von Nico.'],
          ['Tarek', 'war früher Fahrer bei einer Filmproduktion.'],
        ], 'Nico offre un vélo à Selma pour son anniversaire ; Pepe, qui fait du sport au parc, parle au téléphone avec le père de Selma ; Max réclame un autographe avant que Nico soit célèbre ; Tarek a été chauffeur sur un tournage.'),
        choice('q7', bi('Pepe sieht Nico und Selma und nennt sie „Turteltauben“. Was meint er?', 'Pepe voit Nico et Selma et les appelle « Turteltauben ». Que veut-il dire ?'), [
          ['deux amoureux', true],
          ['deux sportifs'],
          ['deux enfants'],
        ], 'Die Turteltaube, c’est la tourterelle : comme « tourtereaux » en français, le mot désigne un couple d’amoureux. Pepe croit que son frère et Selma sont ensemble et propose, pour plaisanter, de les saluer de la part du père.'),
        choice('q8', bi('Warum ist Nico am Ende so wütend auf Pepe?', 'Pourquoi Nico est-il si furieux contre Pepe à la fin ?'), [
          ['Pepe hat Selmas Fahrrad kaputt gemacht.'],
          ['Pepe will Nicos Praktikum beenden.'],
          ['Pepe hat Selmas Vater erzählt, wo sie ist.', true],
        ], 'Au téléphone, Pepe a dit au père de Selma qu’il voyait sa fille au parc avec Nico. Or les parents de Selma la croient au cours d’allemand : elle a de gros ennuis. Pepe ne le savait pas et s’excuse, mais Nico ne veut plus le voir.'),
      ],
    },
    {
      title: 'Ideen für die Zukunft · Des idées pour l’avenir',
      episodes: [72, 76], start: '104:10', end: '111:00', approx: true,
      context: contexte({
        episodes: [72, 76],
        situation: [
          ['Nico ist traurig und geht ins Restaurant. Max und Tarek sehen gerade Fußball.', 'Nico est triste et va au restaurant. Max et Tarek regardent un match de foot.'],
          ['Max und Pepe haben eine Geschäftsidee. Dafür brauchen sie Yara.', 'Max et Pepe ont une idée d’entreprise. Pour cela, ils ont besoin de Yara.'],
          ['In der WG ist die Stimmung immer noch schlecht. Sebastian hat einen Vorschlag.', 'Dans la colocation, l’ambiance est toujours mauvaise. Sebastian a une proposition.'],
        ],
        questions: [
          ['Wie kann man Essen umweltfreundlich liefern?', 'Comment peut-on livrer des repas de façon écologique ?'],
          ['Wie kann man in einer WG einen Streit lösen?', 'Comment peut-on régler une dispute dans une colocation ?'],
        ],
        focus: [
          ['Achten Sie auf das Passiv: Das Essen wird geliefert, es wird gezeigt …', 'Soyez attentif au passif : le repas est livré, c’est indiqué…'],
          ['Achten Sie auf die Argumente für und gegen einen Investor.', 'Soyez attentif aux arguments pour et contre un investisseur.'],
        ],
      }),
      keywords: [
        nom('das', 'Abseits', null, 'le hors-jeu (football)'),
        nom('der', 'Lieferservice', 'Lieferservices', 'le service de livraison', 'liefern : livrer'),
        mot('umweltfreundlich', 'écologique'),
        nom('der', 'Gewinn', 'Gewinne', 'le bénéfice', 'am Gewinn beteiligt sein : toucher une part des bénéfices'),
        nom('das', 'Risiko', 'Risiken', 'le risque'),
        nom('der', 'Investor', 'Investoren', 'l’investisseur'),
        nom('die', 'Zutat', 'Zutaten', 'l’ingrédient'),
        mot('sich versöhnen', 'se réconcilier', 'Habt ihr euch versöhnt?'),
        nom('der', 'Saugroboter', 'Saugroboter', 'le robot aspirateur'),
        mot('teilen', 'partager, diviser', 'den Preis durch vier teilen : diviser le prix par quatre'),
      ],
      questions: [
        choice('q1', bi('Welche Nachricht bekommt Nico von Selma im Restaurant?', 'Quel message Nico reçoit-il de Selma au restaurant ?'), [
          ['Sie kommt gleich vorbei.'],
          ['Das Eislaufen fällt aus.', true],
          ['Ihr Vater ist wieder krank.'],
        ], 'Selma écrit que le patin à glace est annulé, et tout le reste aussi : ses parents, furieux, ne la laissent plus sortir. Nico l’avait prévu : s’ils sont fâchés, elle ne sort pas, et il ne la voit plus.'),
        choice('q2', bi('Zuerst interessieren sich Max und Tarek mehr für das Fußballspiel als für Nico. Richtig, falsch oder nicht gesagt?', 'Au début, Max et Tarek s’intéressent plus au match qu’à Nico. Vrai, faux ou pas dit ?'), [
          ['richtig', true],
          ['falsch'],
          ['nicht gesagt'],
        ], 'Max et Tarek encouragent les joueurs et réagissent à chaque action pendant que Nico raconte ses soucis. Ils l’écoutent à moitié, le consolent avec une phrase de footballeur, puis crient au but et au hors-jeu.'),
        choice('q3', bi('Wie soll das Essen geliefert werden?', 'Comment les repas doivent-ils être livrés ?'), [
          ['mit dem Auto'],
          ['mit dem Motorroller'],
          ['mit dem Fahrrad', true],
        ], 'Max veut un service de livraison écologique : on livrera à vélo, ce qui économise aussi l’essence. C’est pour cela qu’ils ont besoin des vélos de Yara. Seule limite, admet Max : quand il neige, ça ne marche pas.'),
        choice('q4', bi('Was bekommt Yara, wenn sie Geschäftspartnerin wird?', 'Que reçoit Yara si elle devient associée ?'), [
          ['einen Teil vom Gewinn', true],
          ['jeden Monat einen festen Lohn'],
          ['kostenlose Mahlzeiten'],
        ], 'Pepe propose à Yara d’entrer dans le projet comme associée : elle toucherait une part des bénéfices, mais partagerait aussi le risque. Sinon, ils lui loueraient simplement des vélos et feraient de la publicité pour son magasin.'),
        fill('q5', bi('Ergänzen Sie.', 'Complétez.'), 'Die Kunden bestellen über eine [[1]]. Sie können ein fertiges Essen oder nur die [[2]] bestellen.', [
          ['App'],
          ['Zutaten'],
        ], 'Les clients commandent par une application que l’entreprise de Pepe va développer. La particularité, selon Max : on peut choisir un repas prêt ou seulement les ingrédients (Zutaten). L’application signale aussi les plats végétariens ou végans.'),
        match('q6', bi('Wer denkt was? Verbinden Sie.', 'Qui pense quoi ? Associez.'), [
          ['Tarek', 'traut dem Investor nicht.'],
          ['Sebastian', 'möchte einen Saugroboter kaufen.'],
          ['Lisa', 'findet die Idee mit dem Roboter blöd.'],
          ['Yara', 'kann jetzt keinen Kredit aufnehmen.'],
        ], 'Tarek se méfie de l’investisseur et ne voit pas pourquoi il en faudrait un ; Sebastian veut acheter un robot aspirateur à quatre ; Lisa trouve l’idée stupide ; Yara aime le projet, mais ne peut pas emprunter d’argent en ce moment.'),
        choice('q7', bi('Was sagt Selma Nico am Ende?', 'Que dit Selma à Nico à la fin ?'), [
          ['Ihre Eltern erlauben jetzt alles.'],
          ['Sie können sich nicht mehr sehen.', true],
          ['Sie zieht mit ihrer Familie weg.'],
        ], 'Selma vient en personne à la colocation, car elle doit le lui dire en face : ils ne peuvent plus se voir. Elle ajoute pourtant qu’elle l’aime bien. Elle ne parle ni d’un déménagement ni d’une permission de ses parents.'),
        order('q8', bi('Ordnen Sie die Szenen.', 'Remettez les scènes dans l’ordre.'), [
          ['Nico erzählt von Selmas Eltern.', 'Max und Pepe erklären Yara ihre Idee.', 'Sebastian schlägt einen Saugroboter vor.', 'Selma kommt zu Nico in die WG.'],
        ], 'Nico raconte d’abord ses soucis pendant le match ; Max et Pepe présentent ensuite leur idée à Yara ; dans la colocation, Sebastian propose son robot ; enfin, pendant la visioconférence avec l’investisseur, Selma vient voir Nico.'),
      ],
    },
  ],
};
