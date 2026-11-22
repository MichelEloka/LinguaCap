export default [
  {
    id: "a2-demarches",
    after: "a2-wohnen-atelier",
    title: "Faire une démarche et vérifier son rendez-vous",
    goal: "Remplir un formulaire simple, préparer les justificatifs à temps et demander puis vérifier une modification de rendez-vous.",
    guideTitle: "Comprendre un formulaire et les pièces demandées",
    drillTitle: "Déplacer un rendez-vous auprès d’un service",
    lessonTitle: "Lire le statut d’un dossier en ligne",
    sources: [
      "LinguaCap V4 — formulaires, messages, scènes et exercices originaux.",
      "Inspiration : Deutsch im Blick, chapitre 1 (COERLL), identification et coordonnées ; Conseil de l’Europe, CECR, volume complémentaire (2020), transactions en ligne A2.",
    ],
    soundModel: [
      "Meine Adresse ist Bergweg acht in Kassel.",
      "Ich muss den Adressnachweis bis Freitag um zwölf Uhr schicken.",
      "Mein Termin ist am Montag um zehn Uhr.",
      "Können Sie die Hausnummer im Formular ändern?",
    ],
    guide: `4 min — Lisez cette fiche de la médiathèque fictive Stadtbibliothek West. « Bibliotheksausweis – Antrag. Pflichtfelder: Familienname, Vorname, Straße und Hausnummer, PLZ und Ort, E-Mail-Adresse. Die Telefonnummer ist freiwillig. Bringen Sie zur Anmeldung Ihren Ausweis und einen Adressnachweis mit. » Séparez sur une feuille les informations à saisir des pièces à présenter. Citez le champ facultatif.

5 min — Remplissez le formulaire pour cette personne fictive : Lina Berger, Bergweg 8, 34117 Kassel, lina.berger@example.com. Elle ne souhaite pas communiquer son téléphone. Lisez les champs à voix haute en séparant la rue du numéro et le code postal de la ville. Comparez ensuite à ce modèle : Familienname: Berger. Vorname: Lina. Straße und Hausnummer: Bergweg 8. PLZ und Ort: 34117 Kassel.

5 min — Lisez ce rappel : « Ihre Unterlagen müssen bis Freitag, 12 Uhr, vorliegen. Ihr Termin ist am Montag um 10 Uhr. Bitte bestätigen Sie den Termin über den Link in dieser E-Mail. » Distinguez la date limite d’envoi et la date du rendez-vous. Reformulez ces deux actions avec bis et am : Ich muss … bis … schicken. Mein Termin ist am … um … .

6 min — Lina a indiqué le mauvais numéro de rue. Écrivez une demande de correction de deux ou trois phrases avec le nom du champ, l’ancien numéro et le bon. Modèle : Im Formular steht Bergweg 6. Richtig ist Bergweg 8. Können Sie das bitte ändern? Puis relisez la fiche pour contrôler les autres informations.`,
    drill: `4 min — Écoutez le dialogue sans lire. Notez la démarche et l’action urgente. Repérez si la personne appelle pour obtenir un premier rendez-vous ou pour déplacer celui qu’elle a déjà.

5 min — Réécoutez et tracez deux colonnes : rendez-vous et dossier. Dans la première, notez l’ancien et le nouveau créneau. Dans la seconde, écrivez les pièces demandées, la date limite et le format. Contrôlez à l’aide de la transcription et répétez les heures à voix haute.

5 min — Prenez le rôle de la personne au téléphone. Reprenez le début avec la référence fictive W-314 et remplacez le premier rendez-vous par mercredi à 15 h. Vous êtes libre vendredi après 16 h seulement. Essayez avec le modèle Könnten Sie den Termin auf Freitag verschieben? puis refaites l’appel sans lire vos phrases.

6 min — Dans le rôle du secrétariat, proposez vendredi à 16 h 45 et donnez une nouvelle date limite pour les documents. Dans le rôle de la personne qui appelle, reformulez la différence entre les deux échéances et demandez un récapitulatif par e-mail. Écrivez enfin une note pour votre agenda en allemand.`,
    lesson: `5 min — Votre messagerie affiche trois avis pour le dossier fictif W-314. « 08.40: Antrag gespeichert. Bitte laden Sie den Adressnachweis noch hoch. » « 09.10: Unterlagen erhalten. Ihr Termin am Freitag um 16.45 Uhr ist bestätigt. » « 11.20: Ihre Bitte um einen anderen Termin ist eingegangen. Bis zur neuen Bestätigung bleibt der Termin am Freitag bestehen. » Pour chaque message, écrivez ce qui est fait et ce qui reste à faire. Indiquez quel créneau mettre à l’agenda à 11 h 20.

5 min — Comparez gespeichert (enregistré), erhalten (reçu), eingegangen (parvenu) et bestätigt (confirmé). Faites correspondre les quatre mots aux événements : votre brouillon est conservé, un document a été reçu, votre demande est arrivée, votre rendez-vous est confirmé. Expliquez ensuite pourquoi « Ihre Anfrage ist eingegangen » ne suffit pas à établir qu’un rendez-vous a changé.

5 min — Le formulaire refuse le fichier : « Datei zu groß. Erlaubt: PDF oder JPG, maximal 2 MB. » Le dossier disponible comprend Adressnachweis.pdf (3 MB), Adressnachweis.jpg (1 MB) et Ausweis.pdf (1 MB). Choisissez le bon fichier à déposer pour la preuve d’adresse. Préparez une phrase pour signaler le problème s’il persiste : Ich kann den Adressnachweis nicht hochladen. Kann ich ihn per E-Mail schicken?

5 min — Un quatrième avis arrive : « Neuer Termin: Montag, 10.15 Uhr. Bitte bestätigen Sie bis Sonntag, 18 Uhr. » Écrivez votre réponse avec la référence du dossier et l’heure du nouveau rendez-vous. Indiquez sur votre fiche la date limite de confirmation et le créneau à supprimer de l’agenda. Vérifiez que l’heure de confirmation et l’heure du rendez-vous restent distinctes.`,
    dialogue: [
      "Guten Tag. Ich habe einen Termin für einen Bibliotheksausweis am Donnerstag um sechzehn Uhr. Kann ich ihn verschieben?",
      "Gerne. Haben Sie die Nummer aus Ihrer Bestätigung?",
      "Ja, die Nummer ist W-zwei-acht-vier. Könnte ich am Freitag nach siebzehn Uhr kommen?",
      "Am Freitag ist um siebzehn Uhr dreißig noch ein Termin frei. Passt das für Sie?",
      "Ja, danke. Muss ich das Formular noch einmal ausfüllen?",
      "Nein, Ihr Formular ist schon da. Laden Sie aber bis Mittwoch um zwölf Uhr einen Adressnachweis als PDF hoch.",
      "Also bis Mittwoch um zwölf. Soll ich am Freitag auch meinen Ausweis mitbringen?",
      "Ja, bitte. Den Termin am Donnerstag habe ich gelöscht.",
      "Bekomme ich eine neue Bestätigung per E-Mail?",
      "Ja. In der E-Mail finden Sie den neuen Termin und den Link zum Hochladen.",
    ],
    quiz: [
      ["Pourquoi la personne appelle-t-elle ?", ["Pour déplacer son rendez-vous de carte de médiathèque.", "Pour renouveler un livre emprunté.", "Pour corriger le prix de son abonnement."], "Kann ich ihn verschieben? demande de déplacer le rendez-vous déjà pris."],
      ["Quel nouveau créneau choisit-elle ?", ["Vendredi à 17 h 30", "Jeudi à 16 h", "Mercredi à 12 h"], "Vendredi à 17 h 30 est le rendez-vous proposé et accepté. Mercredi à midi est la date limite pour le justificatif."],
      ["Que doit-elle déposer en ligne ?", ["Un justificatif d’adresse au format PDF", "Un nouveau formulaire au format PDF", "Une photo de sa carte de médiathèque"], "Adressnachweis signifie justificatif d’adresse. Le formulaire est déjà arrivé."],
      ["Quand doit-elle déposer le document au plus tard ?", ["Mercredi à midi", "Jeudi à 16 h", "Vendredi à 17 h 30"], "Bis Mittwoch um zwölf Uhr indique la date limite, distincte du rendez-vous."],
      ["Que contient le nouvel e-mail ?", ["Le créneau et le lien de dépôt", "Le formulaire et une facture", "Une carte et un code de retrait"], "La dernière réplique annonce den neuen Termin et den Link zum Hochladen."],
      ["Le site indique : « Ihre Anfrage ist eingegangen. » Que savez-vous ?", ["La demande est arrivée.", "Le rendez-vous a déjà été changé.", "Le formulaire est incomplet."], "Eingegangen signifie que le service a reçu la demande. Le créneau n’est confirmé que par un avis explicite."],
      ["Comment demander de reporter le rendez-vous à lundi ?", ["Könnten Sie den Termin auf Montag verschieben?", "Könnten Sie den Termin seit Montag hochladen?", "Könnten Sie den Termin bis Montag ausfüllen?"], "Einen Termin auf Montag verschieben signifie reporter un rendez-vous à lundi."],
    ],
    task: `3 min — Vous demandez une carte de médiathèque pour une personne fictive. Remplissez sept champs : Familienname, Vorname, Straße und Hausnummer, PLZ, Ort, E-Mail et Unterschrift. Votre dossier est B-506. Le justificatif doit être déposé avant mardi à midi. Votre rendez-vous est jeudi à 14 h, mais vous ne pouvez pas venir.

5 min — Jouez l’appel. Donnez la référence, demandez de déplacer le rendez-vous et confirmez le nouveau créneau proposé, vendredi à 15 h 15. Demandez aussi si la date limite change. Modèle : Habe ich das richtig verstanden: Mein Termin ist jetzt am Freitag um fünfzehn Uhr fünfzehn?

8 min — Le portail affiche « Änderung angefragt », puis refuse votre fichier. Rédigez un e-mail de 45 à 65 mots pour demander confirmation du nouveau créneau et proposer d’envoyer le justificatif en pièce jointe. Mentionnez la référence et la date limite. Modèle : Ich kann die Datei nicht hochladen. Kann ich den Adressnachweis als PDF per E-Mail schicken?

4 min — Relisez le formulaire et le courriel. Le destinataire peut-il retrouver le dossier, savoir quelle réponse vous attendez et identifier le document concerné ? Vérifiez que la date limite n’a pas été confondue avec le rendez-vous, puis refaites votre confirmation orale sans notes.`,
  },
  {
    id: "a2-connecteurs",
    after: "a2-arbeit-atelier",
    title: "Relier une cause, un résultat et une opposition",
    goal: "Choisir entre weil, denn, deshalb et trotzdem et placer le verbe dans chaque structure pour expliquer un changement.",
    guideTitle: "Choisir le connecteur et placer le verbe",
    drillTitle: "Comprendre pourquoi un programme change",
    lessonTitle: "Relire et clarifier un changement de programme",
    audioProfile: "a2-suite",
    sources: [
      "LinguaCap V4 — messages, scène du Repair-Café et exercices originaux.",
      "Inspiration : Der und mehr, « Das Ausland » (KSU) et Grimm Grammar (COERLL), connecteurs et ordre du verbe.",
    ],
    soundModel: [
      "Ich komme später, weil mein Bus Verspätung hat.",
      "Wir nehmen den Bus, denn das Wetter ist schlecht.",
      "Der Aufzug ist kaputt. Deshalb nehmen wir die Treppe.",
      "Es regnet stark. Trotzdem findet das Fest statt.",
    ],
    guide: `4 min — Lisez ces trois messages d’un cours du soir fictif. « Wir treffen uns heute in Raum 12, weil Raum 7 geschlossen ist. » « Der Drucker funktioniert nicht. Deshalb schickt die Lehrerin das Blatt per E-Mail. » « Am Abend regnet es. Trotzdem findet der Fahrradkurs statt. » Repérez ce qui explique une décision, ce qui en résulte et ce qui arrive malgré un obstacle. Dessinez des flèches entre les deux idées.

5 min — Comparez deux façons de donner la même raison : Ich komme später, weil mein Bus Verspätung hat. Ich komme später, denn mein Bus hat Verspätung. Avec weil, le verbe conjugué va à la fin de la subordonnée. Après denn, la proposition suit l’ordre d’une phrase principale : mein Bus forme le premier élément et hat est en deuxième position. Réécrivez ces deux modèles avec « Ich rufe an » et « ich eine Frage habe ».

5 min — Lisez ces deux suites : Der Aufzug ist kaputt. Deshalb nehmen wir die Treppe. Der Aufzug ist kaputt. Trotzdem komme ich pünktlich. Deshalb annonce le résultat attendu. Trotzdem annonce ce qui arrive malgré l’obstacle. Placé en tête, chaque connecteur occupe le premier élément : le verbe vient juste après. Entourez deshalb / trotzdem, encadrez le verbe, puis soulignez le sujet.

6 min — À partir de la situation « La salle est fermée », complétez trois suites : la cause de la fermeture, une décision qui en résulte et une activité qui aura lieu malgré tout. Choisissez trois connecteurs différents. Lisez vos phrases, puis vérifiez la place des verbes : weil → fin ; denn → ordre V2 ; deshalb / trotzdem en tête → verbe juste après. V2 veut dire deuxième élément, même si le premier élément contient plusieurs mots.`,
    drill: `4 min — Écoutez la scène du Repair-Café sans lire. Notez le problème, le nouvel endroit et une décision prise par les organisateurs. Cherchez le mot qui introduit la première raison.

5 min — Réécoutez pour compléter quatre lignes : local changé / raison ; participants à prévenir / raison ; entrée choisie / résultat ; aide maintenue / opposition. Vérifiez avec la transcription et lisez à voix haute le début des propositions introduites par les quatre connecteurs.

5 min — Reformulez cette consigne d’abord avec weil puis avec denn : « On avertit les participants. Ils ne connaissent pas la nouvelle adresse. » Sur votre fiche, gardez seulement les deux verbes et dites les phrases de mémoire. Échangez ensuite l’ordre des deux idées pour commencer par la cause et donner le résultat avec deshalb.

6 min — Imaginez que vous organisez une projection : le projecteur est en panne, un voisin prête un appareil et vous disposez de peu de temps. Dites une raison et un résultat, puis annoncez une action maintenue avec trotzdem. Prenez une note de trois lignes pour la personne qui vous remplace et comparez-la à ce que vous avez dit.`,
    lesson: `5 min — Lisez ces deux notes pour l’équipe d’une cuisine collective. « Die Lieferung kommt erst um zwölf. Deshalb können wir um elf noch nicht kochen. Wir öffnen trotzdem um halb eins, denn die Suppe ist schon fertig. » Puis : « Wir verschieben den Kochkurs, weil zwei Personen fehlen. Die Gäste können trotzdem zum Mittagessen kommen. » Relevez dans chaque note le changement annoncé et ce qui est maintenu. Repérez la position de trotzdem lorsqu’un sujet est déjà placé en tête.

5 min — Reprenez le message « Der Schlüssel fehlt. Wir warten vor dem Haus. » Exprimez le lien avec weil, avec denn et avec deshalb. Dans chaque version, entourez l’élément conjugué et contrôlez la place du sujet. Modèles : Wir warten vor dem Haus, denn der Schlüssel fehlt. Der Schlüssel fehlt. Deshalb warten wir vor dem Haus.

5 min — Corrigez puis lisez ces trois brouillons : « Ich arbeite hier, weil ich kann heute helfen. » « Deshalb wir treffen uns draußen. » « Trotzdem meine Kollegin kommt um neun. » Proposez aussi une version qui commence par le sujet : Meine Kollegin kommt trotzdem um neun. Comparez les verbes et les sujets, puis expliquez une correction avec vos mots.

5 min — Une collègue voit ce message : « Die Tür ist geschlossen. Deshalb endet der Kurs nicht. » Le cours continue dans une autre salle. Réécrivez l’information avec trotzdem pour lever l’ambiguïté. Ajoutez une cause et un résultat dans deux nouvelles phrases sur le déménagement, puis contrôlez que les liens correspondent bien à la situation.`,
    dialogue: [
      "Wir können heute nicht im alten Raum arbeiten, weil dort die Heizung kaputt ist.",
      "Der Raum neben der Bibliothek ist frei. Können wir das Repair-Café dorthin verlegen?",
      "Ja, den Schlüssel habe ich schon. Die Adresse bleibt gleich, nur die Tür ist eine andere.",
      "Dann schreiben wir den Teilnehmern, denn einige kennen den neuen Raum noch nicht.",
      "Vor dem Haupteingang ist kein Platz für Fahrräder. Deshalb treffen wir uns am Seiteneingang.",
      "Ich habe heute wenig Zeit. Trotzdem kann ich eine halbe Stunde helfen.",
      "Danke. Kannst du einen Zettel an die Tür hängen, bevor du gehst?",
      "Ja. Ich schreibe die Uhrzeit und den Eingang darauf. Wir beginnen um fünfzehn Uhr, oder?",
      "Genau. Wir beginnen wie geplant um fünfzehn Uhr.",
      "Gut, dann schicke ich jetzt die Nachricht an alle.",
    ],
    quiz: [
      ["Pourquoi le groupe quitte-t-il l’ancienne salle ?", ["Le chauffage est en panne.", "La bibliothèque est fermée.", "Le groupe a perdu la clé."], "Weil dort die Heizung kaputt ist donne la raison du changement de salle."],
      ["Pourquoi faut-il prévenir les participants ?", ["Certains ne connaissent pas encore la nouvelle salle.", "La date de la rencontre a changé.", "Ils doivent apporter leurs propres vélos."], "Denn einige kennen den neuen Raum noch nicht indique le motif de l’envoi de la note."],
      ["Où le groupe se retrouvera-t-il ?", ["À l’entrée latérale", "À l’entrée principale", "Devant l’ancien local"], "Deshalb treffen wir uns am Seiteneingang donne le nouveau point de rendez-vous."],
      ["Que fait la personne qui a peu de temps ?", ["Elle aide quand même une demi-heure.", "Elle reporte l’activité d’une demi-heure.", "Elle annule sa participation."], "Trotzdem kann ich eine halbe Stunde helfen maintient l’aide malgré le manque de temps."],
      ["À quelle heure l’activité commence-t-elle ?", ["À 15 h, comme prévu", "À 15 h 30", "À 14 h 30"], "La personne confirme um fünfzehn Uhr et précise wie geplant, comme prévu."],
      ["Quel ordre des mots convient après weil ?", ["Wir warten, weil der Raum noch geschlossen ist.", "Wir warten, weil der Raum ist noch geschlossen.", "Wir warten, weil ist der Raum noch geschlossen."], "Dans la proposition avec weil, le verbe conjugué ist se place à la fin."],
      ["Quelle phrase donne la raison en gardant l’ordre d’une principale ?", ["Wir warten, denn der Raum ist noch geschlossen.", "Wir warten, denn der Raum noch geschlossen ist.", "Wir warten, denn ist der Raum noch geschlossen."], "Après denn, la principale garde l’ordre V2. Der Raum précède le verbe conjugué ist."],
      ["Quelle suite annonce un résultat qui va à l’encontre de ce qu’on attend ?", ["Es regnet. Trotzdem gehen wir in den Park.", "Es regnet. Deshalb bleiben wir zu Hause.", "Es regnet, denn der Himmel ist grau."], "Trotzdem indique que la sortie est maintenue malgré la pluie et occupe la première place avant gehen."],
    ],
    task: `3 min — Préparez trois notes pour un atelier de cuisine prévu à 17 h. Le four du local est en panne. La cuisine du centre voisin est disponible mais les participants ne la connaissent pas. Un collègue est pressé et peut tout de même aider quinze minutes.

5 min — Enregistrez un message pour votre équipe. Expliquez le changement de lieu avec weil, recommandez d’envoyer l’adresse avec deshalb et dites quelle aide reste possible avec trotzdem. Modèle : Wir wechseln den Raum, weil der Ofen kaputt ist. Deshalb schicken wir allen die neue Adresse.

8 min — Le responsable vous informe que le nouveau local ne sera libre qu’à 17 h 30. Rédigez un message de 50 à 70 mots aux participants. Indiquez le lieu et la nouvelle heure, donnez une raison avec denn et expliquez avec trotzdem ce qui reste prévu. Modèle : Wir beginnen um halb sechs, denn der Raum ist erst dann frei. Das gemeinsame Essen findet trotzdem statt.

4 min — Comparez le premier enregistrement et le message final. Dites à voix haute quelle information a changé. Soulignez les verbes conjugués, puis corrigez une phrase si le connecteur annonce le mauvais lien ou que le verbe n’est pas à sa place.`,
  },
];
