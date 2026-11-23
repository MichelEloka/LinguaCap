// Couche pédagogique V4 · a2-wohnen (lot A7, contenu A2).
// Se loger et vivre ensemble : explications de toutes les questions, Wo?/Wohin? avec stellen/stehen, legen/liegen, hängen
// et dürfen/müssen en exercices typés, répétition validée, dictées et mission remise au professeur.

export default {
  module: 'a2-wohnen',
  grammarFocus: ['wechselpraepositionen-wo-wohin', 'stellen-stehen-legen-liegen-haengen', 'duerfen-muessen'],

  vocabulary: [
    { id: 'wohnung', word: 'Wohnung', article: 'die', plural: 'Wohnungen', partOfSpeech: 'noun', translation: 'l’appartement, le logement',
      example: 'Die Wohnung gefällt mir sehr gut.', note: 'die Zweizimmerwohnung : le deux-pièces' },
    { id: 'zimmer', word: 'Zimmer', article: 'das', plural: 'Zimmer', partOfSpeech: 'noun', translation: 'la pièce, la chambre',
      example: 'Dein Zimmer ist 16 Quadratmeter groß.', note: 'compte les pièces principales, sans cuisine ni salle de bains' },
    { id: 'wohnzimmer', word: 'Wohnzimmer', article: 'das', plural: 'Wohnzimmer', partOfSpeech: 'noun', translation: 'le salon',
      example: 'Das Wohnzimmer ist richtig groß!', note: null },
    { id: 'kueche', word: 'Küche', article: 'die', plural: 'Küchen', partOfSpeech: 'noun', translation: 'la cuisine',
      example: 'Die Küche liegt zwischen dem Bad und dem Wohnzimmer.', note: 'die Einbauküche : la cuisine équipée' },
    { id: 'bad', word: 'Bad', article: 'das', plural: 'Bäder', partOfSpeech: 'noun', translation: 'la salle de bains',
      example: 'Links ist das Bad, rechts das Schlafzimmer.', note: null },
    { id: 'flur', word: 'Flur', article: 'der', plural: 'Flure', partOfSpeech: 'noun', translation: 'le couloir, l’entrée',
      example: 'Der große Spiegel liegt im Flur.', note: null },
    { id: 'keller', word: 'Keller', article: 'der', plural: 'Keller', partOfSpeech: 'noun', translation: 'la cave',
      example: 'Mein Fahrrad steht im Keller.', note: null },
    { id: 'balkon', word: 'Balkon', article: 'der', plural: 'Balkone', partOfSpeech: 'noun', translation: 'le balcon',
      example: 'Die Wohnung hat einen Balkon.', note: null },
    { id: 'schrank', word: 'Schrank', article: 'der', plural: 'Schränke', partOfSpeech: 'noun', translation: 'l’armoire, le placard',
      example: 'Der Schrank bleibt an der Tür.', note: 'der Kühlschrank : le réfrigérateur' },
    { id: 'regal', word: 'Regal', article: 'das', plural: 'Regale', partOfSpeech: 'noun', translation: 'l’étagère',
      example: 'Die Bücher stehen schon im Regal.', note: null },
    { id: 'teppich', word: 'Teppich', article: 'der', plural: 'Teppiche', partOfSpeech: 'noun', translation: 'le tapis',
      example: 'Ich lege den Teppich vor die Tür.', note: null },
    { id: 'spiegel', word: 'Spiegel', article: 'der', plural: 'Spiegel', partOfSpeech: 'noun', translation: 'le miroir',
      example: 'Morgen hängen wir den Spiegel im Bad auf.', note: null },
    { id: 'miete', word: 'Miete', article: 'die', plural: 'Mieten', partOfSpeech: 'noun', translation: 'le loyer',
      example: 'Die Miete ist ziemlich hoch.', note: 'Kaltmiete : hors charges · Warmmiete : charges comprises' },
    { id: 'nebenkosten', word: 'Nebenkosten', article: 'die', plural: null, partOfSpeech: 'noun', translation: 'les charges',
      example: 'Die Nebenkosten sind 130 Euro im Monat.', note: 'toujours au pluriel ; abréviation NK' },
    { id: 'kaution', word: 'Kaution', article: 'die', plural: 'Kautionen', partOfSpeech: 'noun', translation: 'la caution, le dépôt de garantie',
      example: 'Die Kaution beträgt drei Kaltmieten.', note: null },
    { id: 'vermieter', word: 'Vermieter', article: 'der', plural: 'Vermieter', partOfSpeech: 'noun', translation: 'le propriétaire (qui loue)',
      example: 'Wenn die Heizung kaputt ist, ruft man den Vermieter an.', note: 'au féminin : die Vermieterin · le locataire : der Mieter' },
    { id: 'mitbewohner', word: 'Mitbewohner', article: 'der', plural: 'Mitbewohner', partOfSpeech: 'noun', translation: 'le colocataire',
      example: 'Wir suchen einen netten Mitbewohner.', note: 'au féminin : die Mitbewohnerin' },
    { id: 'wohngemeinschaft', word: 'Wohngemeinschaft', article: 'die', plural: 'Wohngemeinschaften', partOfSpeech: 'noun',
      translation: 'la colocation', example: 'Ich wohne in einer Wohngemeinschaft.', note: 'abréviation : die WG, die WGs' },
    { id: 'nachbar', word: 'Nachbar', article: 'der', plural: 'Nachbarn', partOfSpeech: 'noun', translation: 'le voisin',
      example: 'Mein Nachbar wohnt im vierten Stock.', note: 'au féminin : die Nachbarin' },
    { id: 'umziehen', word: 'umziehen', article: null, plural: null, partOfSpeech: 'verb', translation: 'déménager',
      example: 'Anfang März kann ich umziehen.', note: 'séparable : um|ziehen · Perfekt : ist umgezogen' },
    { id: 'einziehen', word: 'einziehen', article: null, plural: null, partOfSpeech: 'verb', translation: 'emménager',
      example: 'Am Samstag möchte ich einziehen.', note: 'séparable : ein|ziehen · contraire : ausziehen' },
    { id: 'stellen', word: 'stellen', article: null, plural: null, partOfSpeech: 'verb', translation: 'mettre, placer (debout)',
      example: 'Kannst du die Milch in den Kühlschrank stellen?', note: 'Wohin? + accusatif' },
    { id: 'stehen', word: 'stehen', article: null, plural: null, partOfSpeech: 'verb', translation: 'être (debout), se trouver',
      example: 'Die Milch soll im Kühlschrank stehen.', note: 'Wo? + datif · Perfekt : hat gestanden' },
    { id: 'legen', word: 'legen', article: null, plural: null, partOfSpeech: 'verb', translation: 'poser (à plat)',
      example: 'Ich will das Handy auf den Tisch legen.', note: 'Wohin? + accusatif' },
    { id: 'liegen', word: 'liegen', article: null, plural: null, partOfSpeech: 'verb', translation: 'être posé (à plat), se trouver',
      example: 'Die Brille muss auf dem Nachttisch liegen.', note: 'Wo? + datif · Perfekt : hat gelegen' },
    { id: 'haengen', word: 'hängen', article: null, plural: null, partOfSpeech: 'verb', translation: 'accrocher ; être accroché',
      example: 'Darf ich Bilder an die Wände hängen?', note: 'Wohin? + acc. (hat gehängt) · Wo? + datif (hat gehangen)' },
    { id: 'hell', word: 'hell', article: null, plural: null, partOfSpeech: 'adjective', translation: 'clair, lumineux',
      example: 'Das Schlafzimmer ist schön hell.', note: 'contraire : dunkel' },
  ],

  activities: {
    'a2-wohnen-wortschatz': {
      title: 'Découvrir : pièces, meubles et petites annonces',
    },

    'a2-wohnen-dialog': {
      title: 'Comprendre : la visite d’un appartement',
    },

    'a2-wohnen-lesen': {
      title: 'Vérifier : lire trois petites annonces',
      explanations: {
        q1: 'KM signifie Kaltmiete, le loyer hors charges, et NK Nebenkosten, les charges (eau, chauffage…). La caution (Kaution) vaut ici trois loyers hors charges, bien plus que 140 €.',
        q2: 'Kaltmiete 590 € + Nebenkosten 140 € = 730 € par mois. 590 € ne compte que le loyer hors charges, et 1 770 € correspond à la caution (3 × 590 €).',
        q3: 'L’annonce indique « 3. OG mit Aufzug » : troisième étage, avec ascenseur. Le logement est libre « ab 1.4. » (pas tout de suite), « Keine Haustiere » exclut le chien, et il faut appeler le soir.',
        q4: 'Hanna et Paul cherchent quelqu’un pour leur « 3er-WG », une colocation de trois personnes : eux deux plus la personne qui arrive, donc trois.',
        q5: 'Kenza n’a pas de meubles et ne veut pas vivre seule : la chambre de l’annonce B est meublée (möbl.) et en colocation. L’annonce A est un appartement vide, et l’annonce C est une recherche de logement.',
        q6: 'La famille cherche « eine 4-Zi.-Wohnung oder ein kleines Haus mit Garten » et paie « bis 1.100 € warm », charges comprises. Elle préfère le bord de la ville (am Stadtrand) et a un chien.',
      },
    },

    'a2-wohnen-kultur': {
      title: 'Comprendre : vivre en colocation et dans un immeuble',
      estimatedMinutes: 10,
    },

    'a2-wohnen-aussprache': {
      lesson: {
        description: `Les voyelles ä, ö et ü (avec l’Umlaut, le tréma allemand) sont des sons à part entière. Elles changent le sens des mots et marquent souvent le pluriel : das Bad → die Bäder, der Garten → die Gärten, der Schrank → die Schränke, der Topf → die Töpfe. Bonne nouvelle : le français possède déjà ces sons !

COMMENT LES PRONONCER
• ü = le « u » français de « sûr ». Arrondissez les lèvres comme pour « ou », mais gardez la langue en avant comme pour « i ». Long dans die Bücher, kühl, die Tüten ; bref dans die Küche, die Würste.
• ö = le « eu » français. Long et fermé comme dans « deux » : schön, der Döner, töten ; bref et ouvert comme dans « neuf » : möchte, die Töpfe.
• ä = le « è » de « mère » : die Wäsche, anhängen, fällen, die Gärten. Le ä long (die Säle, die Bäder, zählen) est souvent prononcé comme un « é » long : die Säle sonne alors comme die Seele (l’âme).

LES PIÈGES POUR UN FRANCOPHONE
• Le u SANS tréma se prononce « ou » : das Buch, der Kuchen, der Bruder, zu. Ne le prononcez jamais comme le u français, sinon le sens change : der Kuchen (le gâteau) ≠ die Küchen (les cuisines).
• De même, o sans tréma reste « o » : schon (déjà) ≠ schön (beau).
• Les lettres eu et äu ne se disent pas « eu » mais « oï » : Deutsch, heute, die Häuser. Le son « eu » français s’écrit ö en allemand.
• Sans clavier allemand, on écrit ae, oe, ue : schoen = schön, Kueche = Küche. Dans l’application, utilisez plutôt les touches ä, ö et ü proposées pour la saisie.

ENREGISTREMENT 1 : SANS ET AVEC UMLAUT
der Anhang (la pièce jointe) – anhängen (joindre) ; der Saal (la salle) – die Säle ; ich wasche (je lave) – die Wäsche (le linge) ; schon (déjà) – schön (beau) ; mochte (aimait) – möchte (voudrais) ; der Topf (la casserole) – die Töpfe ; das Buch (le livre) – die Bücher ; der Kuchen (le gâteau) – die Küchen (les cuisines) ; cool (comme en anglais) – kühl (frais)

ENREGISTREMENT 2 : L’UMLAUT CHANGE LE SENS
Affen (des singes) – nachäffen (singer, imiter) ; Bruder (le frère) – Brüder (les frères) ; Donner (le tonnerre) – Döner (le kebab) ; fallen (tomber) – fällen (abattre un arbre) ; schon – schön ; schwul (homosexuel) – schwül (lourd, orageux) ; Toten (les morts) – töten (tuer) ; tuten (klaxonner) – Tüten (des sachets) ; Wurst (la saucisse) – Würste (les saucisses) ; wusste (savait) – Wüste (le désert) ; zahlen (payer) – zählen (compter)

ENREGISTREMENT 3 : DEUX VIRELANGUES
• Bäcker Braun bäckt braune Brezeln. Braune Brezeln bäckt Bäcker Braun. (Le boulanger Braun fait cuire des bretzels brunes.)
• Es grünt so grün, wenn Spaniens Blüten blühen. (Tout verdit quand les fleurs d’Espagne s’épanouissent.)

À VOUS
1. Écoutez chaque paire, puis répétez-la en exagérant la différence entre les deux voyelles.
2. Astuce : dites « i » puis arrondissez les lèvres sans bouger la langue : vous obtenez ü. Dites « é » et arrondissez les lèvres : vous obtenez ö.
3. Dites à voix haute les pluriels du logement : die Bäder, die Gärten, die Küchen, die Schränke, die Stühle, die Töpfe.
4. Lisez les virelangues lentement, puis de plus en plus vite. L’exercice « Répéter à voix haute » qui suit vérifie votre prononciation de ces voyelles.

Enregistrements et images : Deutsch im Blick (COERLL, Université du Texas à Austin), CC BY 4.0.`,
      },
    },

    'a2-wohnen-mieten': {
      title: 'Vérifier : lire un forum, louer ou acheter ?',
      explanations: {
        q1: 'Jörg confirme : « Mehr als die Hälfte der Menschen in Deutschland wohnt zur Miete. » Die Hälfte, c’est la moitié. Il ne limite pas ce constat aux grandes villes.',
        q2: 'Jörg l’explique lui-même : « viel arbeiten und ein Haus bauen ». Schaffe est la forme souabe de schaffen (travailler dur) et Häusle signifie « petite maison ».',
        q3: '« Wir müssen der Bank noch zehn Jahre lang Geld zurückzahlen » : il rembourse encore son crédit. Il a épargné vingt ans, mais a acheté sa maison il y a huit ans (vor acht Jahren).',
        q4: '« Vielleicht arbeite ich in zwei Jahren in Hamburg oder in Wien » : la location la laisse libre de partir (flexibel). Elle ne dit pas manquer d’argent, et pour le chauffage, elle appelle le propriétaire.',
        q5: 'Murat écrit « Zuhause ist für mich da, wo meine Familie ist ». Il précise justement qu’il ne peut pas payer une maison et que cela ne le dérange pas.',
        q6: '« In Deutschland zieht man nicht so oft um wie zum Beispiel in den USA » : nicht so oft … wie, pas aussi souvent que. Murat vit depuis douze ans dans le même appartement.',
      },
    },

    'a2-wohnen-hoeren': {
      title: 'Vérifier : écouter un déménagement, un voisin, une colocation',
      lesson: {
        description: 'Écoutez les trois scènes (vous pouvez les réécouter autant de fois que nécessaire), puis répondez aux questions. Scène 1 : Jana emménage avec l’aide de son ami Malik. Scène 2 : le soir, Jana rencontre un voisin. Scène 3 : Lisa, Ben et Kemal, trois colocataires, font le point sur le ménage de la semaine. La transcription s’affichera après votre réponse.',
      },
      explanations: {
        q1: 'Jana dit « Stell ihn bitte neben das Regal, nicht auf den Schreibtisch » : à côté de l’étagère, dans le bureau (ins Arbeitszimmer). Neben das Regal est à l’accusatif, car il y a un déplacement.',
        q2: '« Die stellen wir ins Wohnzimmer, zwischen das Sofa und den Sessel » : il s’agit du lampadaire (die Stehlampe), dont Malik vient de parler. Le miroir, lui, est déjà dans le couloir.',
        q3: '« Nein, den habe ich schon geholt. Er liegt im Flur. » Le miroir n’est plus dans la voiture ; Jana ne l’accrochera dans la salle de bains que demain (morgen).',
        q4: 'Herr Schulz dit « Ich wohne direkt über Ihnen, im vierten Stock » : au quatrième étage, juste au-dessus de Jana. Über + datif répond ici à la question wo?.',
        q5: 'Ben proteste (« Ich habe doch letzte Woche das Bad geputzt! ») et Kemal répond « Ich mache diese Woche das Bad ». Lisa descend les poubelles, et Ben prend la cuisine.',
        q6: 'Lisa dit « Ich schlage vor, jeder bekommt ein eigenes Fach » : chacun aura son compartiment dans le réfrigérateur. Le repas de vendredi est une proposition de Kemal, pas une règle de la semaine.',
      },
    },

    'a2-wohnen-grammatik': {
      title: 'S’entraîner : Wo? ou Wohin? avec stellen, stehen, legen, liegen, hängen',
      estimatedMinutes: 12,
      competences: ['lecture', 'ecoute', 'expression-ecrite'],
      lesson: {
        description: `Complétez, associez ou choisissez la forme correcte, puis écrivez les phrases dictées. Demandez-vous d’abord : y a-t-il un déplacement (Wohin? → accusatif) ou une position (Wo? → datif) ?

RAPPELS
• der → dem (datif) / den (accusatif) ; die → der / die ; das → dem / das ; pluriel die → den (+ -n) / die.
• in dem = im, in das = ins, an dem = am, an das = ans.
• stellen, legen, hängen + Wohin? (accusatif) : Ich stelle die Milch in den Kühlschrank.
• stehen, liegen, hängen + Wo? (datif) : Die Milch steht im Kühlschrank.
• dürfen : avoir le droit ; nicht dürfen : ne pas avoir le droit. müssen : être obligé.`,
      },
      removeQuestions: ['q1', 'q2', 'q3', 'q5', 'q6', 'q8'],
      explanations: {
        q4: 'La question Wo? demande une position : des lunettes posées à plat « liegen » : Sie liegt auf dem Nachttisch. Legt exprime l’action de poser, qui répond à Wohin?, et steht décrit un objet debout.',
        q7: 'Wohin? et neben das Fenster, à l’accusatif, indiquent un déplacement : on emploie le verbe d’action stellen, ici du stellst. Stehst décrit une position et répondrait à Wo?.',
      },
      addQuestions: [
        { id: 'q9', type: 'fill', prompt: 'Complétez avec l’article : d’abord un déplacement, puis une position.',
          text: 'Wir stellen das Sofa an [[1]] Wand, und das Bild hängt über [[2]] Sofa.',
          blanks: [{ id: '1', accept: ['die'], size: 5, hint: 'die Wand' }, { id: '2', accept: ['dem'], size: 5, hint: 'das Sofa' }],
          explanation: 'On déplace le canapé vers le mur (Wohin?) : an + accusatif, an die Wand. Le tableau est déjà accroché (Wo?) : über + datif, über dem Sofa.' },
        { id: 'q10', type: 'fill', prompt: 'Complétez avec l’article : l’action, puis le résultat.',
          text: 'Ich lege das Handy auf [[1]] Tisch. Jetzt liegt es auf [[2]] Tisch.',
          blanks: [{ id: '1', accept: ['den'], size: 5, hint: 'der Tisch' }, { id: '2', accept: ['dem'], size: 5, hint: 'der Tisch' }],
          explanation: 'Legen exprime un mouvement vers le lieu (Wohin?) : auf den Tisch, accusatif masculin. Liegen décrit la position obtenue (Wo?) : auf dem Tisch, datif.' },
        { id: 'q11', type: 'fill', prompt: 'Complétez avec l’article, puis avec le verbe de position.',
          text: 'Ich stelle die Milch in [[1]] Kühlschrank. Jetzt [[2]] sie im Kühlschrank.',
          blanks: [{ id: '1', accept: ['den'], size: 5, hint: 'der Kühlschrank' }, { id: '2', accept: ['steht'], size: 7, hint: 'stehen ou stellen ?' }],
          explanation: 'Stellen + Wohin? : in den Kühlschrank, à l’accusatif. Une fois rangée, la bouteille est debout (Wo?) : le verbe de position stehen, sie steht. « stellt » décrirait de nouveau l’action.' },
        { id: 'q12', type: 'fill', prompt: 'Complétez avec la préposition in contractée : position, puis déplacement.',
          text: 'Die Bücher stehen schon [[1]] Regal. Stell die Zeitschriften bitte auch [[2]] Regal!',
          blanks: [{ id: '1', accept: ['im', 'in dem'], size: 7, hint: null }, { id: '2', accept: ['ins', 'in das'], size: 7, hint: null }],
          explanation: 'Les livres sont déjà rangés (Wo?) : in dem = im, au datif. Pour les magazines, on demande un déplacement (Wohin?) : in das = ins, à l’accusatif.' },
        { id: 'q13', type: 'fill', prompt: 'Les règles de la colocation : complétez avec dürfen ou müssen.',
          text: 'In unserer WG [[1]] man nicht rauchen. Jede Woche [[2]] jeder einmal das Bad putzen.',
          blanks: [{ id: '1', accept: ['darf'], size: 6, hint: 'dürfen' }, { id: '2', accept: ['muss'], size: 6, hint: 'müssen' }],
          explanation: 'Nicht dürfen exprime l’interdiction : man darf nicht rauchen. Le ménage est une obligation : jeder muss. Avec man et jeder, le verbe est à la 3e personne du singulier, sans terminaison.' },
        { id: 'q14', type: 'match', prompt: 'Associez chaque question à la réponse qui convient.',
          pairs: [
            { left: 'Wohin hängst du das Bild?', right: 'An die Wand.' },
            { left: 'Wo hängt das Bild?', right: 'An der Wand.' },
            { left: 'Wohin legst du das Handy?', right: 'Auf den Tisch.' },
            { left: 'Wo liegt das Handy?', right: 'Auf dem Tisch.' },
          ],
          explanation: 'Wohin? appelle l’accusatif (an die Wand, auf den Tisch) ; Wo? appelle le datif (an der Wand, auf dem Tisch). Le verbe indique l’objet : on accroche un tableau et on pose un téléphone à plat.' },
        { id: 'q15', type: 'dictation', prompt: 'Écoutez et écrivez la phrase : où se trouve le miroir ?',
          accept: ['Der Spiegel hängt im Flur neben der Tür.'], voice: 'sprecherin',
          explanation: 'Une position (Wo?) : im Flur (in dem, datif) et neben der Tür (datif de die Tür). Spiegel et Flur sont des noms : majuscule.' },
        { id: 'q16', type: 'dictation', prompt: 'Écoutez et écrivez la demande faite à un ami pendant le déménagement.',
          accept: ['Leg die Schlüssel bitte auf den Tisch.', 'Lege die Schlüssel bitte auf den Tisch.'], voice: 'sprecher',
          explanation: 'Impératif de du sans pronom : Leg! (Lege est aussi correct). On pose les clés quelque part (Wohin?) : auf den Tisch, à l’accusatif masculin.' },
      ],
    },

    'a2-wohnen-haus': {
      title: 'S’entraîner : une maison en coupe, pièces et meubles',
      explanations: {
        q1: 'Sur le détail du salon, le numéro 1 est le téléviseur, placé entre deux enceintes : der Fernseher. Der Kühlschrank (le réfrigérateur) se trouve dans la cuisine, au rez-de-chaussée.',
        q2: 'La table à dessin (5), la bibliothèque (6) et l’ordinateur (7) sont dans la pièce de travail : im Arbeitszimmer. Im = in dem, datif, car la question Wo? demande une position.',
        q3: 'Le dessin montre un siège en forme d’œuf, posé sur un pied pivotant : der Sessel, le fauteuil. Das Bett sert à dormir et der Tisch n’a pas de dossier.',
        q4: 'Le numéro 11 est la baignoire avec son rideau : die Badewanne (das Bad + die Wanne). Das Waschbecken (13) est le lavabo et der Spiegel (14) le miroir.',
        q5: 'Le lit (8) et la commode (9) se trouvent dans la chambre : im Schlafzimmer, de schlafen (dormir). La pièce voisine, avec la baignoire, est la salle de bains.',
        q6: 'Dans la cuisine, le numéro 16 est le réfrigérateur : der Kühlschrank (kühl, frais + der Schrank, l’armoire). Der Herd (15) est la cuisinière.',
        q7: 'Au rez-de-chaussée, l’escalier se trouve au milieu, entre la cuisine et la salle à manger : eine Treppe. Zwischen + datif répond ici à la question wo?.',
        q8: 'Sur le dessin entier, la cuisine est au niveau le plus bas : im Erdgeschoss, le rez-de-chaussée. Der erste Stock est l’étage au-dessus du rez-de-chaussée.',
      },
    },

    'a2-wohnen-wohnungstour': {
      title: 'Vérifier : écouter la visite de l’appartement de Lea',
      explanations: {
        q1: 'Lea dit « Vor drei Wochen bin ich in meine erste eigene Wohnung gezogen » : elle y vit depuis trois semaines. Vor drei Wochen signifie « il y a trois semaines ».',
        q2: '« In Deutschland sind viele Mietwohnungen leer, oft gibt es nicht einmal eine Küche » : souvent vides, parfois sans cuisine. Lea n’avait d’ailleurs que des câbles au plafond, sans lampes.',
        q3: '« Zum Glück hat mir mein Vormieter seine alte Küche verkauft, für vierhundert Euro. » Le marché aux puces concerne la lampe au-dessus de la table, et le tableau vient de sa grand-mère.',
        q4: '« Wenn ich ausziehe, muss ich die Wände wieder weiß streichen. So steht es in meinem Mietvertrag. » Müssen exprime l’obligation fixée par le bail.',
        q5: '« Haustiere darf ich hier leider nicht haben » : nicht dürfen exprime l’interdiction. Peindre les murs, en revanche, est permis (« Ja, das darf ich »).',
        q6: '« Das Bett steht unter dem Fenster, und neben dem Bett steht ein kleines Regal mit meinen Büchern. » Sous la fenêtre se trouve le lit ; neben dem Bett répond à wo? avec le datif.',
      },
    },

    'a2-wohnen-sprechen': {
      kind: 'mission',
      title: 'Mission : décrire son logement et répondre à une annonce',
      estimatedMinutes: 20,
      competences: ['expression-orale', 'expression-ecrite'],
      lesson: {
        description: `Écoutez Amira, qui décrit son appartement à une amie, puis préparez votre propre description et votre réponse à une annonce de colocation.

MODÈLE
Ich wohne seit einem Jahr in einer Zweizimmerwohnung in Hannover, im zweiten Stock. Die Wohnung ist nicht sehr groß, aber hell und gemütlich. Im Wohnzimmer steht ein grünes Sofa, und vor dem Fenster steht mein Schreibtisch. An der Wand hängen viele Fotos von meiner Familie. Die Küche ist klein, deshalb esse ich meistens im Wohnzimmer. Leider ist die Miete ziemlich hoch, und die Nachbarn über mir sind manchmal laut. Nächstes Jahr möchte ich vielleicht in eine WG ziehen. Allein kochen ist nämlich langweilig!

POUR PARLER
1. Où et depuis quand : Ich wohne seit … in einer Wohnung / in einem Haus / in einer WG in …
2. Le logement : Die Wohnung hat … Zimmer. Sie ist groß / klein / hell / ruhig / zentral.
3. Trois meubles ou objets (Wo? + datif) : Im Wohnzimmer steht … An der Wand hängt … Auf dem Tisch liegt …
4. Ce qui vous plaît ou non : Mir gefällt … / Leider ist …
5. Un projet : Ich möchte … umziehen. / Ich möchte ein Regal neben das Bett stellen.

L’ANNONCE B
« Wir sind Hanna (26, Krankenpflegerin) und Paul (29, Koch) und suchen ab sofort eine nette Mitbewohnerin oder einen netten Mitbewohner für unsere 3er-WG in der Südvorstadt. Dein Zimmer ist 16 m² groß und möbl. (Bett, Schrank, Schreibtisch). Küche, Bad und Balkon teilen wir. Ordnung ist uns wichtig: Wir haben einen Putzplan, und in der Wohnung raucht niemand. Warmmiete: 420 € inkl. Internet. Schreib uns eine Nachricht und erzähl ein bisschen von dir! »

Modèles pour le message : Hallo Hanna, hallo Paul, ich habe eure Anzeige gelesen und interessiere mich für das Zimmer. Gibt es eine Waschmaschine? Darf ich mein Fahrrad in den Keller stellen? Kann ich das Zimmer am Samstag ansehen? Viele Grüße, …`,
      },
      mission: {
        oral: {
          prompt: 'Décrivez votre logement en une à deux minutes, sans lire : où et depuis quand vous habitez, les pièces, l’emplacement de trois meubles ou objets, ce qui vous plaît ou non, et un projet.',
          maxSeconds: 120,
        },
        written: {
          prompt: 'Répondez à l’annonce B par un message de 60 à 80 mots à Hanna et Paul : dites pourquoi vous écrivez, présentez-vous (âge, travail ou études, loisirs), expliquez pourquoi cette colocation vous plaît, posez une ou deux questions et proposez une visite.',
          maxChars: 1000,
          minWords: 60,
        },
        checklist: [
          'J’ai dit où et depuis quand j’habite : Ich wohne seit … in …',
          'J’ai situé trois meubles ou objets avec le datif : Im Wohnzimmer steht …, An der Wand hängt …',
          'Dans mon message, je tutoie Hanna et Paul (du, ihr, euch) et je termine par une salutation.',
          'J’ai posé au moins une question sur la colocation et proposé un jour de visite.',
          'J’ai vérifié le cas après les prépositions mixtes : datif pour Wo?, accusatif pour Wohin?.',
        ],
      },
    },
  },

  add: [
    {
      after: 'a2-wohnen-aussprache',
      activity: {
        id: 'a2-wohnen-repeter',
        kind: 'exercise',
        title: 'Répéter à voix haute : visiter un logement',
        estimatedMinutes: 8,
        competences: ['expression-orale'],
        lesson: {
          title: 'Répéter à voix haute : visiter un logement',
          description: 'Écoutez chaque modèle, puis dites la phrase à voix haute, comme pendant une visite d’appartement. Soignez les voyelles ä, ö et ü : elles changent le sens des mots. Si la reconnaissance vocale ne comprend pas votre phrase, réécoutez le modèle et réessayez.',
          transcript: null,
        },
        placements: [],
        questions: [
          { id: 'q1', type: 'speak', prompt: 'Écoutez, puis situez la cuisine.',
            text: 'Die Küche liegt zwischen dem Bad und dem Wohnzimmer.', accept: ['Die Küche liegt zwischen dem Bad und dem Wohnzimmer.'], threshold: 75,
            explanation: 'Küche se prononce avec ü, comme le « u » français : sans tréma, Kuchen serait le gâteau. Zwischen + datif : zwischen dem Bad und dem Wohnzimmer.' },
          { id: 'q2', type: 'speak', prompt: 'Écoutez, puis demandez la permission d’accrocher des tableaux.',
            text: 'Darf ich Bilder an die Wände hängen?', accept: ['Darf ich Bilder an die Wände hängen?'], threshold: 75,
            explanation: 'Darf ouvre la question et l’infinitif hängen la termine. Le ä de Wände et de hängen se prononce comme le « è » de « mère ».' },
          { id: 'q3', type: 'speak', prompt: 'Écoutez, puis demandez le montant des charges.',
            text: 'Wie hoch sind die Nebenkosten?', accept: ['Wie hoch sind die Nebenkosten?'], threshold: 75,
            explanation: 'Wie hoch …? sert à demander un montant. Le ch de hoch, après o, se prononce au fond de la gorge ; dans Nebenkosten, l’accent tombe sur NE.' },
          { id: 'q4', type: 'speak', prompt: 'Écoutez, puis demandez à partir de quand le logement est libre.',
            text: 'Ab wann ist die Wohnung frei?', accept: ['Ab wann ist die Wohnung frei?'], threshold: 75,
            explanation: 'Ab wann…? demande une date de départ. Le w se prononce [v] et le b final de ab se durcit en [p].' },
          { id: 'q5', type: 'speak', prompt: 'Écoutez, puis répétez en faisant entendre le ü.',
            text: 'Die Bücher stehen schon im Regal.', accept: ['Die Bücher stehen schon im Regal.'], threshold: 75,
            explanation: 'Bücher prend un ü long, lèvres arrondies ; schon, sans tréma, garde un o fermé : ne le confondez pas avec schön.' },
          { id: 'q6', type: 'speak', prompt: 'Écoutez, puis dites le virelangue lentement.',
            text: 'Es grünt so grün, wenn Spaniens Blüten blühen.', accept: ['Es grünt so grün, wenn Spaniens Blüten blühen.'], threshold: 75,
            explanation: 'Quatre ü de suite : grünt, grün, Blüten, blühen. Gardez la langue en avant comme pour « i » et arrondissez les lèvres ; le h de blühen ne se prononce pas.' },
        ],
      },
    },
  ],
};
