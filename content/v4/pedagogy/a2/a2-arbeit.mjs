// Couche pédagogique V4 · a2-arbeit (lot A7, contenu A2).
// Travail et métiers : explications de toutes les questions, weil / dass et prétérit de sein / haben en exercices typés,
// répétition validée, dictées, leçons sans tâche hors application et mission remise au professeur.

export default {
  module: 'a2-arbeit',
  grammarFocus: ['weil-dass-verbe-final', 'praeteritum-sein-haben'],

  vocabulary: [
    { id: 'beruf', word: 'Beruf', article: 'der', plural: 'Berufe', partOfSpeech: 'noun', translation: 'le métier',
      example: 'Was sind Sie von Beruf?', note: 'Ich bin Koch von Beruf : sans article' },
    { id: 'arzt', word: 'Arzt', article: 'der', plural: 'Ärzte', partOfSpeech: 'noun', translation: 'le médecin',
      example: 'Der Arzt arbeitet in der Praxis.', note: 'au féminin : die Ärztin' },
    { id: 'koch', word: 'Koch', article: 'der', plural: 'Köche', partOfSpeech: 'noun', translation: 'le cuisinier',
      example: 'Der Koch arbeitet im Restaurant.', note: 'au féminin : die Köchin' },
    { id: 'kollege', word: 'Kollege', article: 'der', plural: 'Kollegen', partOfSpeech: 'noun', translation: 'le collègue',
      example: 'Mein Kollege hilft mir gern.', note: 'au féminin : die Kollegin' },
    { id: 'chef', word: 'Chef', article: 'der', plural: 'Chefs', partOfSpeech: 'noun', translation: 'le chef, le patron',
      example: 'Der Chef ist heute nicht im Büro.', note: 'au féminin : die Chefin' },
    { id: 'krankenhaus', word: 'Krankenhaus', article: 'das', plural: 'Krankenhäuser', partOfSpeech: 'noun', translation: 'l’hôpital',
      example: 'Die Krankenpflegerin arbeitet im Krankenhaus.', note: null },
    { id: 'werkstatt', word: 'Werkstatt', article: 'die', plural: 'Werkstätten', partOfSpeech: 'noun', translation: 'l’atelier, le garage',
      example: 'Der Mechaniker arbeitet in der Werkstatt.', note: null },
    { id: 'stelle', word: 'Stelle', article: 'die', plural: 'Stellen', partOfSpeech: 'noun', translation: 'le poste, l’emploi',
      example: 'Ab wann ist die Stelle frei?', note: 'eine feste Stelle : un emploi stable' },
    { id: 'stellenanzeige', word: 'Stellenanzeige', article: 'die', plural: 'Stellenanzeigen', partOfSpeech: 'noun', translation: 'l’offre d’emploi',
      example: 'Ich habe Ihre Stellenanzeige gelesen.', note: null },
    { id: 'sich-bewerben', word: 'sich bewerben', article: null, plural: null, partOfSpeech: 'verb', translation: 'postuler',
      example: 'Bis wann kann man sich bewerben?', note: 'um eine Stelle / als … ; er bewirbt sich · Perfekt : hat sich beworben' },
    { id: 'bewerbung', word: 'Bewerbung', article: 'die', plural: 'Bewerbungen', partOfSpeech: 'noun', translation: 'la candidature',
      example: 'Vielen Dank für Ihre Bewerbung.', note: null },
    { id: 'lebenslauf', word: 'Lebenslauf', article: 'der', plural: 'Lebensläufe', partOfSpeech: 'noun', translation: 'le CV',
      example: 'Schicken Sie bitte auch Ihren Lebenslauf.', note: null },
    { id: 'zeugnis', word: 'Zeugnis', article: 'das', plural: 'Zeugnisse', partOfSpeech: 'noun', translation: 'le certificat, le bulletin',
      example: 'Bringen Sie bitte Ihr Zeugnis mit.', note: null },
    { id: 'vorstellungsgespraech', word: 'Vorstellungsgespräch', article: 'das', plural: 'Vorstellungsgespräche', partOfSpeech: 'noun', translation: 'l’entretien d’embauche',
      example: 'Das Vorstellungsgespräch ist am Donnerstag um halb zehn.', note: null },
    { id: 'erfahrung', word: 'Erfahrung', article: 'die', plural: 'Erfahrungen', partOfSpeech: 'noun', translation: 'l’expérience',
      example: 'Sie haben Erfahrung im Verkauf.', note: null },
    { id: 'ausbildung', word: 'Ausbildung', article: 'die', plural: 'Ausbildungen', partOfSpeech: 'noun', translation: 'la formation professionnelle',
      example: 'Ich mache eine Ausbildung zum Koch.', note: 'eine Ausbildung zum … / zur … machen' },
    { id: 'betrieb', word: 'Betrieb', article: 'der', plural: 'Betriebe', partOfSpeech: 'noun', translation: 'l’entreprise',
      example: 'Moussa lernt im Betrieb und in der Berufsschule.', note: null },
    { id: 'berufsschule', word: 'Berufsschule', article: 'die', plural: 'Berufsschulen', partOfSpeech: 'noun', translation: 'l’école professionnelle',
      example: 'Einmal pro Woche geht er in die Berufsschule.', note: null },
    { id: 'praktikum', word: 'Praktikum', article: 'das', plural: 'Praktika', partOfSpeech: 'noun', translation: 'le stage',
      example: 'Im Sommer mache ich ein Praktikum.', note: null },
    { id: 'gehalt', word: 'Gehalt', article: 'das', plural: 'Gehälter', partOfSpeech: 'noun', translation: 'le salaire (mensuel)',
      example: 'Das Gehalt ist am Anfang nicht hoch.', note: null },
    { id: 'verdienen', word: 'verdienen', article: null, plural: null, partOfSpeech: 'verb', translation: 'gagner (de l’argent)',
      example: 'Am Anfang kann man nicht viel verdienen.', note: null },
    { id: 'schicht', word: 'Schicht', article: 'die', plural: 'Schichten', partOfSpeech: 'noun', translation: 'le poste, l’équipe (horaires)',
      example: 'Morgen habe ich die Schicht am Abend.', note: 'die Frühschicht, die Spätschicht, die Nachtschicht' },
    { id: 'in-teilzeit', word: 'in Teilzeit', article: null, plural: null, partOfSpeech: 'expression', translation: 'à temps partiel',
      example: 'Ich arbeite in Teilzeit, dreißig Stunden pro Woche.', note: 'contraire : in Vollzeit' },
    { id: 'feierabend', word: 'Feierabend', article: 'der', plural: null, partOfSpeech: 'noun', translation: 'la fin de la journée de travail',
      example: 'Um halb fünf habe ich Feierabend.', note: null },
    { id: 'besprechung', word: 'Besprechung', article: 'die', plural: 'Besprechungen', partOfSpeech: 'noun', translation: 'la réunion',
      example: 'Frau Schneider ist gerade in einer Besprechung.', note: null },
    { id: 'anfangen', word: 'anfangen', article: null, plural: null, partOfSpeech: 'verb', translation: 'commencer',
      example: 'Ich kann am ersten Mai anfangen.', note: 'séparable : an|fangen · Ich fange um acht Uhr an.' },
    { id: 'zurueckrufen', word: 'zurückrufen', article: null, plural: null, partOfSpeech: 'verb', translation: 'rappeler (au téléphone)',
      example: 'Könnte Frau Schneider mich bitte zurückrufen?', note: 'séparable : zurück|rufen' },
    { id: 'nachricht', word: 'Nachricht', article: 'die', plural: 'Nachrichten', partOfSpeech: 'noun', translation: 'le message',
      example: 'Möchten Sie eine Nachricht hinterlassen?', note: null },
    { id: 'zuverlaessig', word: 'zuverlässig', article: null, plural: null, partOfSpeech: 'adjective', translation: 'fiable, sérieux',
      example: 'Ich bin ruhig und zuverlässig.', note: null },
  ],

  activities: {
    'a2-arbeit-wortschatz': {
      title: 'Découvrir : les métiers et les lieux de travail',
    },

    'a2-arbeit-dialog': {
      title: 'Comprendre : l’entretien d’embauche',
    },

    'a2-arbeit-lesen': {
      title: 'Vérifier : lire une offre d’emploi',
      explanations: {
        q1: 'L’offre cherche « eine Verkäuferin / einen Verkäufer (m/w/d) in Teilzeit (25 Stunden pro Woche) » : un poste de vente à temps partiel. Il ne s’agit ni de faire le pain ni d’un stage.',
        q2: 'Les tâches sont beraten, verkaufen, Kaffee machen et an der Kasse arbeiten. On vend le pain (Brot verkaufen), mais on ne le fait pas : backen n’apparaît pas dans l’offre.',
        q3: 'Le profil demande de l’expérience en vente ou en restauration, de l’amabilité et des débuts à 6 h (Frühschicht). Lukas remplit les trois conditions ; Mira veut le dimanche, jour de fermeture, et Sara parle à peine allemand.',
        q4: '« Sonntags haben wir geschlossen » : la boulangerie est fermée le dimanche. Le samedi, au contraire, est travaillé (« Arbeit am Samstag »).',
        q5: 'Rubrique « Wir bieten » : 15,20 € de l’heure, 28 jours de congé et « kostenloses Mittagessen und Kaffee ». Kostenlos signifie gratuit ; les congés sont de 28 jours, pas de 40.',
        q6: '« Schicken Sie Ihre Bewerbung mit Lebenslauf bis zum 15. März per E-Mail an Frau Petra Ott. » Bis zum 15. März : au plus tard le 15 mars. Le téléphone sert seulement aux questions.',
      },
    },

    'a2-arbeit-aussprache': {
      lesson: {
        description: `Le r allemand a deux visages. Le premier ressemble beaucoup au r français : bonne nouvelle ! Le second est un piège classique pour les francophones.

1. LE R CONSONNE : COMME EN FRANÇAIS
Au début d’un mot ou d’une syllabe, et juste après une consonne, le r se prononce au fond de la gorge, comme le r de « Paris ». Inutile de le rouler.
• en début de mot ou de syllabe : Rubenstein, stubenrein, die Rente, der Beruf, die Lehrerin
• après une consonne : der Dreck, trug, sprach, graben, die Gruben, die Grillen

2. LE R VOYELLE : PRESQUE UN « A »
Après une voyelle, en fin de mot ou de syllabe, le r ne se prononce plus comme une consonne.
• La terminaison -er devient un « a » bref : der Lehrer ≈ « léra », der Dachdecker ≈ « dachdèka », über ≈ « uba », oder ≈ « oda », aber ≈ « aba », Oberammergau ≈ « oba-amma-gaou ».
• Après une voyelle longue, le r se fond en un léger « a » : der ≈ « déa », er ≈ « éa », vier ≈ « fia », die Uhr ≈ « oua ».
Le piège : prononcer -er comme dans « la mer », avec un r bien audible (« Lehrèr »), ou comme le « é » de « parler » (« Lehré »). Ni l’un ni l’autre : dites un petit « a ».

3. DANS LES NOMS DE MÉTIERS
Au masculin, la finale -er sonne « a » : der Lehrer, der Kellner, der Verkäufer, der Krankenpfleger. Au féminin, le r est suivi d’une voyelle et redevient consonne. Comparez : der Lehrer (« léra ») – die Lehrerin (« lé-re-rine »).

LES VIRELANGUES DE L’ENREGISTREMENT
• Der dicke Dachdecker deckte das dicke Dach. Dann trug der dicke Dachdecker die dicke Dame durch den dicken Dreck. Dann dankte die dicke Dame dem dicken Dachdecker, dass der dicke Dachdecker die dicke Dame durch den dicken Dreck trug. (Le gros couvreur couvrit le gros toit. Puis il porta la grosse dame à travers la boue épaisse. Puis la grosse dame remercia le gros couvreur de l’avoir portée à travers la boue.)
• Es sprach der Herr von Rubenstein: „Mein Hund, der ist nicht stubenrein.“ (Ainsi parla M. von Rubenstein : « Mon chien n’est pas propre. »)
• Graben Grabengräber Gruben? Graben Grubengräber Gräben? Nein! Grabengräber graben Gräben. Grubengräber graben Gruben. (Les creuseurs de fossés creusent-ils des fosses ? Les creuseurs de fosses creusent-ils des fossés ? Non ! Les creuseurs de fossés creusent des fossés, les creuseurs de fosses creusent des fosses.)
• Ob er über Oberammergau oder aber über Unterammergau oder ob er überhaupt noch kommt, ist ungewiss. (Passera-t-il par Oberammergau, ou plutôt par Unterammergau, ou viendra-t-il seulement ? On ne le sait pas. Ce sont deux villages de Bavière.)
• Wenn Grillen Grillen grillen, grillen Grillen Grillen. (Quand des grillons font griller des grillons, ce sont des grillons qui grillent des grillons.)

À VOUS
1. Écoutez chaque virelangue, puis répétez-le phrase par phrase, lentement.
2. Dans la transcription, repérez les r consonnes (Rubenstein, Dreck, Gruben) et les r voyelles (der, über, Dachdecker), puis relisez en les distinguant.
3. Dites à voix haute, en marquant bien la différence : der Lehrer – die Lehrerin, der Kellner – die Kellnerin, der Verkäufer – die Verkäuferin. Comparez avec l’enregistrement des métiers.
4. Accélérez peu à peu : pouvez-vous dire trois fois de suite le virelangue des grillons sans vous tromper ?
L’exercice « Répéter à voix haute » de ce module vérifie ensuite votre prononciation des noms de métiers.

Enregistrements et images : Deutsch im Blick (COERLL, Université du Texas à Austin), CC BY 4.0.`,
      },
    },

    'a2-arbeit-telefon': {
      title: 'Comprendre : téléphoner au travail',
      lesson: {
        description: `Au téléphone, on ne voit pas son interlocuteur : il faut se présenter clairement, parler lentement et bien vérifier les informations importantes (nom, numéro, jour, heure). Écoutez l’appel de Daniel Okafor, qui a postulé comme magasinier (Lagerist) dans une entreprise de logistique.

L’APPEL
Nina Krause : Holzmann Logistik, Sie sprechen mit Nina Krause. Was kann ich für Sie tun?
Daniel Okafor : Guten Tag, Frau Krause. Hier spricht Daniel Okafor. Ich möchte bitte Frau Schneider sprechen.
Nina Krause : Einen Moment, bitte. … Herr Okafor? Frau Schneider ist leider gerade in einer Besprechung. Möchten Sie eine Nachricht hinterlassen?
Daniel Okafor : Ja, gern. Ich habe mich letzte Woche als Lagerist beworben. Ich rufe an, weil ich eine Frage zum Vorstellungsgespräch am Dienstag habe. Könnte Frau Schneider mich bitte zurückrufen?
Nina Krause : Natürlich. Wie schreibt man Ihren Namen, bitte?
Daniel Okafor : O – K – A – F – O – R.
Nina Krause : Danke. Und wie ist Ihre Telefonnummer?
Daniel Okafor : 0176 – 48 39 20 15.
Nina Krause : Ich wiederhole: 0176 – 48 39 20 15. Richtig?
Daniel Okafor : Ja, genau. Vielen Dank!
Nina Krause : Gern. Frau Schneider ruft Sie heute Nachmittag zurück. Auf Wiederhören, Herr Okafor!
Daniel Okafor : Auf Wiederhören!

FORMULES UTILES
• Décrocher : au bureau, on donne le nom de l’entreprise et son propre nom ; sur une ligne personnelle, souvent juste son nom de famille : « Hartmann, guten Tag! »
• Se présenter : Guten Tag, hier spricht … / Mein Name ist … von der Firma …
• Demander quelqu’un : Ich möchte bitte Frau / Herrn … sprechen. — Können Sie mich bitte mit … verbinden?
• Faire patienter : Einen Moment, bitte. Ich verbinde. (Je vous passe la communication.)
• La personne n’est pas là : Frau … ist leider nicht im Haus / in einer Besprechung / heute nicht im Büro.
• Laisser un message : Kann ich eine Nachricht hinterlassen? — Können Sie ihm bitte sagen, dass ich angerufen habe? — Könnte er mich bitte zurückrufen?
• Épeler : on peut s’aider de noms de villes : A wie Aachen, B wie Berlin, K wie Köln.
• Prendre congé : Vielen Dank! Auf Wiederhören! (au téléphone, on ne se « revoit » pas, on se « réentend »).

LAISSER UN MESSAGE SUR LA MESSAGERIE (DIE MAILBOX)
1. Saluez et dites votre nom : Guten Tag, Frau Schneider, hier spricht …
2. Dites pourquoi vous appelez : Ich rufe an, weil …
3. Dites ce que vous souhaitez : Könnten Sie mich bitte zurückrufen?
4. Donnez votre numéro lentement, deux fois.
5. Terminez : Vielen Dank und auf Wiederhören!

À VOUS
Relisez l’appel à voix haute en changeant le nom, le poste et le numéro. Repérez dans la réplique de Daniel la raison de l’appel (weil … habe) et sa demande (Könnte … zurückrufen?). L’exercice « Répéter à voix haute » qui suit vérifie votre prononciation de ces formules.`,
      },
    },

    'a2-arbeit-ausbildung': {
      title: 'Vérifier : lire le portrait d’un apprenti',
      explanations: {
        q1: '« In Dakar habe ich das Abitur gemacht und danach ein Jahr Informatik studiert. » Moussa n’a jamais travaillé dans un garage avant : sa formation de mécatronicien se fait en Allemagne.',
        q2: '« Aber ich habe schnell gemerkt, dass ich lieber mit den Händen arbeite. » C’est la seule raison donnée ; le prix des études et ses notes ne sont pas évoqués.',
        q3: '« Im ersten Jahr war ich zwei Tage pro Woche in der Berufsschule, jetzt gehe ich nur noch einmal pro Woche hin. » Deux jours, c’était la première année ; jetzt (maintenant), une fois.',
        q4: '« Im ersten Jahr waren es 1.000 Euro im Monat, jetzt sind es 1.070 Euro. » 1 000 € correspond à la première année ; les apprentis touchent bien une rémunération.',
        q5: '« Am Anfang war die Fachsprache sehr schwer für mich » : le vocabulaire technique. Ses collègues, au contraire, l’aident volontiers (« meine Kollegen helfen mir gern »).',
        q6: '« Nach der Ausbildung möchte ich bei Autohaus Wiegand bleiben. Und später mache ich vielleicht sogar die Meisterprüfung! » Il ne parle ni de reprendre l’informatique ni de rentrer au Sénégal.',
      },
    },

    'a2-arbeit-schule-bilder': {
      title: 'Vérifier : lire des images sur l’école et la formation',
      explanations: {
        q1: 'Sur le schéma, tous les parcours partent de la Grundschule : c’est l’école primaire commune à tous les enfants. Le Gymnasium, la Realschule et la Hauptschule viennent ensuite.',
        q2: 'Les flèches « Abitur » sont placées au-dessus du Gymnasium et de la Gesamtschule. La Realschule et la Hauptschule mènent d’abord à la Mittlere Reife ou au Hauptschulabschluss.',
        q3: 'Sur le schéma, la Realschule se termine après la 10e année par la Mittlere Reife. L’Abitur se passe plus tard, au Gymnasium ou à la Gesamtschule.',
        q4: 'La photo montre une colonne couverte d’annonces et de petits papiers à numéros détachables : c’est un Schwarzes Brett, un panneau d’affichage. On n’y voit ni livres ni horaires de bus.',
        q5: 'Devant le bâtiment, des étudiants sont assis ou allongés sur la pelouse (die Wiese) au soleil. Ils ne sont ni dans un amphithéâtre (der Hörsaal) ni à la cantine (die Mensa).',
        q6: 'Dans le couloir, on voit deux portes bleues numérotées 8 et 9. Le hall est vide : il n’y a ni étudiants, ni lit, ni télévision.',
      },
    },

    'a2-arbeit-diskussion': {
      title: 'Comprendre : défendre un projet de formation',
      lesson: {
        description: `En Allemagne, on peut commencer une Ausbildung à tout âge, mais l’entourage n’est pas toujours convaincu ! Samira, 29 ans, travaille dans un supermarché. Elle veut devenir infirmière et a postulé pour une Ausbildung. Son ami Jens a des doutes. Écoutez leur discussion, puis repérez comment Samira défend son projet.

DIALOGUE
Jens : Samira, stimmt das? Du willst mit 29 noch eine Ausbildung machen?
Samira : Ja, ich habe mich schon um einen Ausbildungsplatz im Krankenhaus beworben. Ich möchte Pflegefachfrau werden. Die Ausbildung dauert drei Jahre.
Jens : Drei Jahre! Und dann verdienst du viel weniger als jetzt im Supermarkt, oder?
Samira : Das stimmt, am Anfang verdiene ich weniger. Aber ich glaube, dass es sich lohnt. Nach der Ausbildung habe ich einen richtigen Beruf, und dann verdiene ich mehr als heute.
Jens : Aber du hast doch schon eine feste Stelle. Warum willst du wechseln?
Samira : Weil ich im Supermarkt keine Zukunft sehe. Ich möchte mit Menschen arbeiten und ihnen helfen. Außerdem suchen viele Krankenhäuser Pflegekräfte.
Jens : Und die Schule? Du hast seit zehn Jahren nicht mehr für eine Prüfung gelernt!
Samira : Ja, das macht mir ein bisschen Angst. Aber ich bin nicht allein: Viele Erwachsene machen heute noch eine Ausbildung. Und mein Deutsch wird jeden Tag besser!
Jens : Na gut, du hast gute Argumente. Ich finde das mutig!
Samira : Danke, Jens! Und wenn du mal krank bist, pflege ich dich!

MOTS UTILES
• die Pflegefachfrau, der Pflegefachmann — l’infirmière, l’infirmier (nom officiel du métier)
• sich um einen Ausbildungsplatz bewerben — postuler à une place d’apprentissage
• es lohnt sich — ça vaut la peine
• eine feste Stelle — un emploi stable
• wechseln — changer (de métier, de poste)
• die Pflegekraft, die Pflegekräfte — le personnel soignant
• mutig — courageux, courageuse

FORMULES UTILES POUR ARGUMENTER
• Présenter son projet : Ich möchte eine Ausbildung zum … / zur … machen. — Ich möchte … werden.
• Donner une raison : …, weil ich gern mit Menschen arbeite. — …, denn ich arbeite gern mit Menschen.
• Ajouter un argument : Außerdem … (le verbe vient juste après : Außerdem suchen viele Betriebe Azubis.)
• Avantage, inconvénient : Ein Vorteil ist, dass man schon Geld verdient. — Ein Nachteil ist, dass die Ausbildung lange dauert.
• Exprimer un doute : Bist du sicher? — Warum willst du …? — Ist das nicht zu schwer?
• Admettre, puis répondre : Das stimmt, aber … — Du hast recht, aber …
• Conclure : Ich glaube, dass es sich lohnt.

À VOUS
1. Choisissez un métier qui s’apprend par une Ausbildung : Koch / Köchin, Friseur / Friseurin, Kfz-Mechatroniker / Kfz-Mechatronikerin, Pflegefachmann / Pflegefachfrau, Verkäufer / Verkäuferin… Cherchez trois arguments pour et deux arguments contre. Quelques idées :
• pour : Man verdient schon während der Ausbildung Geld. — Man lernt praktisch, im Betrieb. — Viele Betriebe suchen Fachkräfte. — Später kann man weiterlernen: Meisterprüfung, Studium.
• contre : Die Ausbildung dauert zwei bis dreieinhalb Jahre. — Am Anfang verdient man wenig. — Man muss wieder lernen und Prüfungen machen. — Die Fachsprache ist schwer.
2. Relisez à voix haute les questions de Jens et répondez à chacune avec vos propres arguments, en employant weil, dass, denn et außerdem.
3. Gardez ces arguments : la mission du module vous demande de présenter votre parcours et vos projets.
Vérifiez : après « weil » et « dass », le verbe conjugué est-il bien à la fin ? Après « denn », l’ordre des mots ne change pas ; après « außerdem », le verbe vient juste après.

Situation adaptée de Der und mehr (Kennesaw State University), CC BY 4.0.`,
      },
    },

    'a2-arbeit-hoeren': {
      title: 'Vérifier : écouter des messages au travail',
      explanations: {
        q1: 'M. Krämer propose « am Donnerstag um halb zehn » : halb zehn = 9 h 30, la demi-heure avant dix heures. Mardi est la date limite pour le rappeler, pas le jour de l’entretien.',
        q2: '« Können Sie mich bis Dienstag zurückrufen und den Termin bestätigen? » Les Zeugnisse sont à apporter le jour de l’entretien (mitbringen), pas à envoyer par e-mail.',
        q3: 'Jan dit « Ich habe seit gestern Abend hohes Fieber » : il est malade. Dresde est la ville des clients que Sabine doit recevoir ; il ne parle ni de télétravail ni d’enfant.',
        q4: '« Sie liegen auf meinem Schreibtisch, in der roten Mappe » : sur le bureau de Jan, dans la chemise rouge. Le placard près de la porte contient l’ordinateur portable.',
        q5: '« Früher war ich Köchin, fast zehn Jahre lang. » Erzieherin est son métier actuel (« Ich bin Erzieherin ») : früher (autrefois) marque le métier d’avant.',
        q6: '« Ich hatte nie Zeit für meine Familie, weil ich immer abends und am Wochenende gearbeitet habe. » Ni le salaire ni le chef ne sont évoqués.',
      },
    },

    'a2-arbeit-grammatik': {
      title: 'S’entraîner : weil, dass, war et hatte',
      estimatedMinutes: 12,
      competences: ['lecture', 'ecoute', 'expression-ecrite'],
      lesson: {
        description: `Remettez les mots dans l’ordre, complétez, associez, puis écrivez les deux phrases dictées.

RAPPELS
• Après weil et dass, le verbe conjugué va à la fin : …, weil ich in Wien arbeiten möchte. — Ich glaube, dass das Gespräch gut gelaufen ist.
• Un verbe séparable se ressoude à la fin : …, weil er um fünf Uhr aufsteht.
• Prétérit de sein : ich war, du warst, er war, wir waren, ihr wart, sie waren. Prétérit de haben : ich hatte, du hattest, er hatte, wir hatten, ihr hattet, sie hatten.`,
      },
      removeQuestions: ['q1', 'q2', 'q3', 'q4', 'q5', 'q6'],
      explanations: {
        q7: 'La suite « mein Sohn krank ist » a le verbe à la fin : il faut une conjonction de subordination, et elle donne la raison de l’absence, d’où weil. Dass introduit un contenu (je sais que…) ; und et aber garderaient le verbe en 2e position.',
        q8: 'Après dass, le verbe conjugué va tout à la fin, après le participe : gelaufen ist. Laufen (se dérouler) se conjugue ici avec sein : Das Gespräch ist gut gelaufen.',
      },
      addQuestions: [
        { id: 'q9', type: 'order', prompt: 'Donnez la raison avec weil : remettez les mots dans l’ordre.',
          answers: [['Ich lerne Deutsch,', 'weil', 'ich', 'in Wien', 'arbeiten', 'möchte.']],
          explanation: 'Après weil, le sujet ich suit la conjonction et le verbe conjugué möchte ferme la phrase, après l’infinitif arbeiten. « weil ich möchte in Wien arbeiten » garde l’ordre d’une principale : erreur fréquente.' },
        { id: 'q10', type: 'order', prompt: 'Exprimez une opinion avec dass : remettez les mots dans l’ordre.',
          answers: [['Ich glaube,', 'dass', 'Sie', 'gut in unser Team', 'passen.']],
          explanation: 'Dass renvoie le verbe conjugué passen à la fin et le sujet Sie suit directement dass. C’est ainsi que Frau Lehmann conclut l’entretien.' },
        { id: 'q11', type: 'fill', prompt: 'Complétez avec le verbe à la bonne forme.',
          text: 'Er ist immer müde, weil er jeden Tag um fünf Uhr [[1]].',
          blanks: [{ id: '1', accept: ['aufsteht'], size: 10, hint: 'aufstehen' }],
          explanation: 'Dans une subordonnée avec weil, le verbe séparable se ressoude à la fin : aufsteht, en un seul mot. « steht auf » est l’ordre d’une principale.' },
        { id: 'q12', type: 'fill', prompt: 'Complétez au prétérit avec haben et sein.',
          text: 'Wir [[1]] letzte Woche viel Stress, weil zwei Kollegen krank [[2]].',
          blanks: [{ id: '1', accept: ['hatten'], size: 8, hint: 'haben' }, { id: '2', accept: ['waren'], size: 7, hint: 'sein' }],
          explanation: 'Viel Stress haben donne au prétérit wir hatten. Krank sein donne zwei Kollegen waren, et après weil, waren se place à la fin.' },
        { id: 'q13', type: 'fill', prompt: 'Complétez avec la conjonction, puis le verbe.',
          text: 'Ich weiß, [[1]] das in einem Hotel normal [[2]].',
          blanks: [{ id: '1', accept: ['dass'], size: 6, hint: null }, { id: '2', accept: ['ist'], size: 5, hint: 'sein' }],
          explanation: 'Ce que l’on sait s’introduit par dass, avec deux s ; le verbe ist va à la fin de la subordonnée. Weil donnerait une raison, ce qui n’a pas de sens après « Ich weiß ».' },
        { id: 'q14', type: 'match', prompt: 'Associez chaque sujet à la forme du prétérit qui lui correspond.',
          pairs: [
            { left: 'du', right: 'warst' },
            { left: 'ihr', right: 'wart' },
            { left: 'wir', right: 'hatten' },
            { left: 'ich', right: 'hatte' },
          ],
          explanation: 'Au prétérit, sein donne du warst et ihr wart ; haben donne wir hatten et ich hatte. À la 1re personne du singulier, pas de terminaison : ich war, ich hatte.' },
        { id: 'q15', type: 'dictation', prompt: 'Écoutez et écrivez la phrase : une raison avec weil, au Perfekt.',
          accept: ['Ich bin müde, weil ich die ganze Nacht gearbeitet habe.'], voice: 'sprecherin',
          explanation: 'Après weil, l’auxiliaire habe se place tout à la fin, après le participe gearbeitet. Die ganze Nacht (toute la nuit) est à l’accusatif.' },
        { id: 'q16', type: 'dictation', prompt: 'Écoutez et écrivez la phrase : un souvenir au prétérit.',
          accept: ['Letztes Jahr hatte ich keine feste Stelle.'], voice: 'sprecher',
          explanation: 'Letztes Jahr est en tête : le verbe hatte suit, puis le sujet ich. Eine feste Stelle est un emploi stable ; keine prend la même terminaison que eine.' },
      ],
    },

    'a2-arbeit-sprechen': {
      kind: 'mission',
      title: 'Mission : présenter son parcours et postuler',
      estimatedMinutes: 20,
      competences: ['expression-orale', 'expression-ecrite'],
      lesson: {
        description: `Écoutez Ana, qui se présente au début d’un entretien d’embauche, et lisez son CV. Présentez ensuite votre propre parcours à l’oral, puis écrivez une courte candidature.

MODÈLE ORAL
Guten Tag, mein Name ist Ana Petrović. Ich bin 35 Jahre alt und komme aus Serbien. Ich bin Krankenpflegerin von Beruf. Nach meiner Ausbildung war ich elf Jahre in einem Krankenhaus in Belgrad. Ich hatte oft Nachtschicht, aber die Arbeit war sehr interessant. Seit Januar 2025 lebe ich mit meiner Familie in Stuttgart. Zurzeit arbeite ich in Teilzeit als Pflegehelferin in einem Seniorenheim. Ich lerne Deutsch, weil ich hier wieder als Krankenpflegerin arbeiten möchte. Ich glaube, dass ich gut in Ihr Team passe, weil ich ruhig und zuverlässig bin.

LE CV ALLEMAND (DER LEBENSLAUF)
En Allemagne, le CV se présente souvent sous forme de tableau, de l’expérience la plus récente à la plus ancienne. Voici celui d’Ana :
LEBENSLAUF — Ana Petrović
• Persönliche Daten : geboren am 14.03.1991 in Novi Sad (Serbien), wohnhaft in Stuttgart, verheiratet, zwei Kinder
• Berufserfahrung : seit 09/2025 Pflegehelferin (Teilzeit), Seniorenheim in Stuttgart — 2013 bis 2024 Krankenpflegerin, Krankenhaus in Belgrad
• Ausbildung : 2010 bis 2013 Ausbildung zur Krankenpflegerin in Novi Sad
• Sprachkenntnisse : Serbisch (Muttersprache), Englisch (gut), Deutsch (A2, Deutschkurs seit 01/2025)
• Hobbys : Schwimmen, Kochen

POUR PRÉPARER L’ORAL
1. Présentez-vous : Mein Name ist … Ich bin … Jahre alt und komme aus …
2. Votre métier et votre journée : Ich bin … von Beruf. / Ich arbeite als … bei … / in … Ich fange um … an und habe um … Feierabend.
3. Votre parcours au prétérit : Ich war … Jahre … in … Ich hatte …
4. Vos raisons avec « weil » : Ich lerne Deutsch, weil … / Ich möchte als … arbeiten, weil …
5. Vos qualités avec « dass » : Ich glaube, dass ich … bin.

POUR PRÉPARER L’ÉCRIT
• Objet : Bewerbung als Verkäuferin / Verkäufer
• Formule d’appel : Sehr geehrte Frau Ott, — après la virgule, on continue avec une minuscule : ich habe Ihre Anzeige gelesen und bewerbe mich um die Stelle als …
• Votre expérience : Ich war … / Ich hatte … — Vos raisons et vos qualités : …, weil … / Ich glaube, dass …
• Vos disponibilités : Ich kann ab … anfangen. Die Frühschicht ist für mich kein Problem.
• Fin : Über eine Einladung zu einem Vorstellungsgespräch freue ich mich. Mit freundlichen Grüßen, …`,
      },
      mission: {
        oral: {
          prompt: 'Présentez votre parcours comme au début d’un entretien d’embauche (une à deux minutes, sans lire) : qui vous êtes, votre métier ou vos études, votre parcours au prétérit (ich war, ich hatte), pourquoi vous apprenez l’allemand (weil …) et une qualité (Ich glaube, dass …).',
          maxSeconds: 120,
        },
        written: {
          prompt: 'Écrivez un courriel de candidature de 60 à 80 mots à Frau Ott pour l’offre de la boulangerie Sonnenkorn (ou pour une offre de votre choix) : objet, formule d’appel, expérience, raisons et qualités, disponibilités et formule finale.',
          maxChars: 1200,
          minWords: 60,
        },
        checklist: [
          'Mon parcours emploie le prétérit de sein et de haben : ich war, ich hatte.',
          'Après weil et dass, le verbe conjugué est à la fin de la proposition.',
          'Mon courriel commence par « Sehr geehrte Frau Ott, » et continue par une minuscule.',
          'J’ai vouvoyé du début à la fin : Sie, Ihre, Ihnen.',
          'J’ai donné mes disponibilités et terminé par « Mit freundlichen Grüßen ».',
        ],
      },
    },
  },

  add: [
    {
      after: 'a2-arbeit-telefon',
      activity: {
        id: 'a2-arbeit-repeter',
        kind: 'exercise',
        title: 'Répéter à voix haute : métiers et téléphone',
        estimatedMinutes: 8,
        competences: ['expression-orale'],
        lesson: {
          title: 'Répéter à voix haute : métiers et téléphone',
          description: 'Écoutez chaque modèle, puis dites la phrase à voix haute. Distinguez le r consonne (Beruf, Lehrerin) du r final qui sonne « a » (Verkäufer, Schneider). Si la reconnaissance vocale ne comprend pas votre phrase, réécoutez le modèle et réessayez.',
          transcript: null,
        },
        placements: [],
        questions: [
          { id: 'q1', type: 'speak', prompt: 'Écoutez, puis dites votre métier.',
            text: 'Ich bin Lehrerin von Beruf.', accept: ['Ich bin Lehrerin von Beruf.'], threshold: 75,
            explanation: 'Le métier se dit sans article. Dans Lehrerin, le r suivi d’une voyelle redevient une consonne : « lé-re-rine ».' },
          { id: 'q2', type: 'speak', prompt: 'Écoutez, puis répétez en faisant sonner -er comme un « a » bref.',
            text: 'Der Verkäufer arbeitet in einer Bäckerei.', accept: ['Der Verkäufer arbeitet in einer Bäckerei.'], threshold: 75,
            explanation: 'Les finales -er de Verkäufer et de einer sonnent comme un « a » bref. Dans Bäckerei, l’accent tombe sur la dernière syllabe : Bä-cke-REI.' },
          { id: 'q3', type: 'speak', prompt: 'Écoutez, puis demandez à parler à quelqu’un.',
            text: 'Ich möchte bitte Frau Schneider sprechen.', accept: ['Ich möchte bitte Frau Schneider sprechen.'], threshold: 75,
            explanation: 'Jemanden sprechen (sans préposition) : demander à parler à quelqu’un. L’infinitif sprechen ferme la phrase, après le verbe de modalité möchte.' },
          { id: 'q4', type: 'speak', prompt: 'Écoutez, puis demandez qu’on vous rappelle.',
            text: 'Könnte Frau Schneider mich bitte zurückrufen?', accept: ['Könnte Frau Schneider mich bitte zurückrufen?'], threshold: 75,
            explanation: 'Könnte rend la demande polie. La particule zurück porte l’accent : zu-RÜCK-rufen, avec un ü bien arrondi.' },
          { id: 'q5', type: 'speak', prompt: 'Écoutez, puis donnez la raison de votre appel.',
            text: 'Ich rufe an, weil ich eine Frage habe.', accept: ['Ich rufe an, weil ich eine Frage habe.'], threshold: 75,
            explanation: 'Dans la principale, la particule an de anrufen est à la fin ; après weil, le verbe habe ferme la subordonnée. Marquez la pause à la virgule.' },
          { id: 'q6', type: 'speak', prompt: 'Écoutez, puis racontez un changement de métier.',
            text: 'Früher war ich Köchin, jetzt bin ich Erzieherin.', accept: ['Früher war ich Köchin, jetzt bin ich Erzieherin.'], threshold: 75,
            explanation: 'Früher appelle le prétérit war, jetzt le présent bin. Dans Köchin, ö se prononce lèvres arrondies et ch comme dans ich.' },
        ],
      },
    },
  ],
};
