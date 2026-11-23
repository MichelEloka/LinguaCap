// Couche pédagogique V4 · a2-kultur (lot A7, contenu A2).
// Clichés, école, environnement et fêtes : explications de toutes les questions, comparatif, superlatif et avis avec dass
// en exercices typés, répétition validée, dictées et mission remise au professeur.

export default {
  module: 'a2-kultur',
  grammarFocus: ['comparatif-superlatif', 'avis-dass-meinung'],

  vocabulary: [
    { id: 'grundschule', word: 'Grundschule', article: 'die', plural: 'Grundschulen', partOfSpeech: 'noun', translation: 'l’école primaire',
      example: 'Alle Kinder gehen zuerst in die Grundschule.', note: null },
    { id: 'gymnasium', word: 'Gymnasium', article: 'das', plural: 'Gymnasien', partOfSpeech: 'noun', translation: 'le lycée (filière générale)',
      example: 'Felix geht aufs Gymnasium.', note: 'faux ami : ce n’est pas une salle de sport' },
    { id: 'abitur', word: 'Abitur', article: 'das', plural: null, partOfSpeech: 'noun', translation: 'l’examen de fin d’études secondaires',
      example: 'Nach dem Gymnasium macht man das Abitur.', note: 'comparable au baccalauréat' },
    { id: 'note', word: 'Note', article: 'die', plural: 'Noten', partOfSpeech: 'noun', translation: 'la note',
      example: 'Eine Eins ist die beste Note.', note: 'de 1 (sehr gut) à 6 (ungenügend)' },
    { id: 'fach', word: 'Fach', article: 'das', plural: 'Fächer', partOfSpeech: 'noun', translation: 'la matière (scolaire)',
      example: 'Mein Lieblingsfach ist Geschichte.', note: null },
    { id: 'ausbildung', word: 'Ausbildung', article: 'die', plural: 'Ausbildungen', partOfSpeech: 'noun', translation: 'la formation professionnelle',
      example: 'Jana macht eine Ausbildung zur Elektronikerin.', note: 'en alternance : entreprise et école professionnelle' },
    { id: 'betrieb', word: 'Betrieb', article: 'der', plural: 'Betriebe', partOfSpeech: 'noun', translation: 'l’entreprise',
      example: 'Der Azubi arbeitet drei Tage im Betrieb.', note: null },
    { id: 'berufsschule', word: 'Berufsschule', article: 'die', plural: 'Berufsschulen', partOfSpeech: 'noun', translation: 'l’école professionnelle',
      example: 'Zwei Tage pro Woche lernt sie in der Berufsschule.', note: null },
    { id: 'studieren', word: 'studieren', article: null, plural: null, partOfSpeech: 'verb', translation: 'faire des études supérieures',
      example: 'Meine Schwester möchte Medizin studieren.', note: 'réviser un examen : lernen' },
    { id: 'umwelt', word: 'Umwelt', article: 'die', plural: null, partOfSpeech: 'noun', translation: 'l’environnement',
      example: 'Wir wollen die Umwelt schützen.', note: null },
    { id: 'muell', word: 'Müll', article: 'der', plural: null, partOfSpeech: 'noun', translation: 'les déchets, les ordures',
      example: 'Bei uns trennen alle den Müll.', note: null },
    { id: 'trennen', word: 'trennen', article: null, plural: null, partOfSpeech: 'verb', translation: 'trier, séparer',
      example: 'In Deutschland muss man den Müll trennen.', note: null },
    { id: 'biotonne', word: 'Biotonne', article: 'die', plural: 'Biotonnen', partOfSpeech: 'noun', translation: 'la poubelle des déchets organiques',
      example: 'Kartoffelschalen kommen in die Biotonne.', note: null },
    { id: 'altpapier', word: 'Altpapier', article: 'das', plural: null, partOfSpeech: 'noun', translation: 'les vieux papiers',
      example: 'Alte Zeitungen kommen ins Altpapier.', note: null },
    { id: 'pfand', word: 'Pfand', article: 'das', plural: null, partOfSpeech: 'noun', translation: 'la consigne',
      example: 'Für die Flasche bekomme ich 25 Cent Pfand zurück.', note: 'die Pfandflasche : la bouteille consignée' },
    { id: 'umweltfreundlich', word: 'umweltfreundlich', article: null, plural: null, partOfSpeech: 'adjective', translation: 'écologique',
      example: 'Das Fahrrad ist umweltfreundlich.', note: null },
    { id: 'sparen', word: 'sparen', article: null, plural: null, partOfSpeech: 'verb', translation: 'économiser',
      example: 'Ich möchte Energie sparen.', note: null },
    { id: 'vorurteil', word: 'Vorurteil', article: 'das', plural: 'Vorurteile', partOfSpeech: 'noun', translation: 'le préjugé',
      example: 'Ich glaube, das ist ein Vorurteil.', note: 'v se prononce [f] ; accent sur VOR' },
    { id: 'klischee', word: 'Klischee', article: 'das', plural: 'Klischees', partOfSpeech: 'noun', translation: 'le cliché',
      example: 'Die Pünktlichkeit ist ein Klischee.', note: null },
    { id: 'tradition', word: 'Tradition', article: 'die', plural: 'Traditionen', partOfSpeech: 'noun', translation: 'la tradition',
      example: 'Diese Tradition ist bei uns sehr wichtig.', note: null },
    { id: 'puenktlich', word: 'pünktlich', article: null, plural: null, partOfSpeech: 'adjective', translation: 'ponctuel, à l’heure',
      example: 'Bei der Arbeit sind alle pünktlich.', note: null },
    { id: 'feiertag', word: 'Feiertag', article: 'der', plural: 'Feiertage', partOfSpeech: 'noun', translation: 'le jour férié',
      example: 'Der 3. Oktober ist ein Feiertag.', note: null },
    { id: 'fest', word: 'Fest', article: 'das', plural: 'Feste', partOfSpeech: 'noun', translation: 'la fête',
      example: 'Der Karneval ist das schönste Fest im Jahr.', note: null },
    { id: 'weihnachtsmarkt', word: 'Weihnachtsmarkt', article: 'der', plural: 'Weihnachtsmärkte', partOfSpeech: 'noun', translation: 'le marché de Noël',
      example: 'Wir treffen uns auf dem Weihnachtsmarkt.', note: null },
    { id: 'meinung', word: 'Meinung', article: 'die', plural: 'Meinungen', partOfSpeech: 'noun', translation: 'l’opinion, l’avis',
      example: 'Meiner Meinung nach ist das System sinnvoll.', note: 'Meiner Meinung nach + verbe en 2e position' },
    { id: 'finden', word: 'finden', article: null, plural: null, partOfSpeech: 'verb', translation: 'trouver (donner son avis)',
      example: 'Ich finde, dass das System sinnvoll ist.', note: 'Ich finde, dass … : verbe conjugué à la fin' },
    { id: 'glauben', word: 'glauben', article: null, plural: null, partOfSpeech: 'verb', translation: 'croire',
      example: 'Ich glaube, das ist ein Klischee.', note: null },
    { id: 'sinnvoll', word: 'sinnvoll', article: null, plural: null, partOfSpeech: 'adjective', translation: 'sensé, utile',
      example: 'Ich finde die Mülltrennung sinnvoll.', note: null },
    { id: 'duzen', word: 'duzen', article: null, plural: null, partOfSpeech: 'verb', translation: 'tutoyer',
      example: 'Wollen wir uns duzen?', note: 'das Du anbieten : proposer le tutoiement' },
    { id: 'siezen', word: 'siezen', article: null, plural: null, partOfSpeech: 'verb', translation: 'vouvoyer',
      example: 'Meine Professorin muss ich siezen.', note: null },
  ],

  activities: {
    'a2-kultur-wortschatz': {
      title: 'Découvrir : école, formation et environnement',
    },

    'a2-kultur-dialog': {
      title: 'Comprendre : le tri des déchets en colocation',
    },

    'a2-kultur-native-umwelt': {
      title: 'Vérifier : les mots de l’environnement (voix native)',
      explanations: {
        q1: 'Die Mülltrennung vient de trennen (séparer, trier) : c’est le tri des déchets. Der Müll désigne les déchets eux-mêmes et das Recycling leur recyclage.',
        q2: 'On entend « die Umwelt schonen » : ménager, préserver l’environnement. Schützen a un sens proche, mais ce n’est pas le mot lu ; verbrauchen signifie consommer.',
        q3: 'Der Umweltmuffel désigne familièrement quelqu’un qui ne fait aucun effort pour l’environnement (ein Muffel : un ronchon). Das Umweltbewusstsein est au contraire la conscience écologique.',
        q4: 'On entend « den Wasserhahn zudrehen » : fermer le robinet en le tournant. Le laisser goutter (tropfen lassen) ou l’ouvrir (aufmachen) gaspillerait l’eau.',
        q5: 'Les noms en -ung sont féminins et prennent -en au pluriel : die Veranstaltung, die Veranstaltungen. Der Veranstalter est l’organisateur, pas l’événement.',
        q6: 'Le locuteur lit « teilnehmen an etwas », puis « an etwas teilnehmen » : participer à quelque chose (an + datif). Les autres expressions ne figurent pas dans la liste.',
      },
    },

    'a2-kultur-lesen': {
      title: 'Vérifier : lire une lettre sur l’école allemande',
      explanations: {
        q1: 'Katrin écrit « Das ist nicht so einfach, denn jedes Bundesland hat sein eigenes System ». Chaque Land organise ses écoles ; elle ne parle ni d’écoles privées ni de nouvelles règles.',
        q2: '« In den meisten Bundesländern gehen alle Kinder zuerst vier Jahre in die Grundschule » : quatre ans, en général de 6 à 10 ans.',
        q3: '« Unser Sohn Felix ist auf dem Gymnasium und macht in drei Jahren Abitur. » C’est sa sœur Jana qui a terminé la Realschule et fait une Ausbildung.',
        q4: '« Sein Schultag ist kürzer als in Frankreich » : les cours commencent à 8 h et Felix rentre souvent vers 13 h 30. Kürzer est le comparatif de kurz, le contraire de länger.',
        q5: 'Jana fait une Ausbildung : « Drei Tage pro Woche arbeitet sie in einem Betrieb, zwei Tage lernt sie in der Berufsschule. » Elle a justement choisi de ne pas étudier à l’université.',
        q6: '« Und sie verdient schon ihr eigenes Geld! Das findet sie natürlich am besten. » Das reprend le fait de gagner son argent ; am besten est le superlatif de gut.',
      },
    },

    'a2-kultur-feste': {
      title: 'Comprendre : fêtes et jours fériés en Allemagne',
    },

    'a2-kultur-bilder': {
      title: 'Vérifier : traditions et lieux en images',
      lesson: {
        description: `Observez quatre images tirées du manuel Deutsch im Blick : une peinture ancienne, une photo de Noël, une gravure de conte et un paysage de montagne. Lisez chaque question en allemand et choisissez la bonne réponse. Pour les fêtes, aidez-vous de l’activité « Fêtes et jours fériés en Allemagne ».

POUR BIEN LIRE
• das Gemälde — le tableau ; der Bischof — l’évêque ; der Stiefel — la botte
• der Stall — l’étable ; die Figur — la figurine ; die Zuckerstange — le sucre d’orge
• das Märchen — le conte ; die Hexe — la sorcière ; der Lebkuchen — le pain d’épice
• das Fachwerkhaus — la maison à colombages ; die Fahne — le drapeau ; das Kreuz — la croix

LE SAVIEZ-VOUS ?
À partir de 1812, deux frères linguistes ont publié un grand recueil de contes populaires, les « Contes de l’enfance et du foyer » (Kinder- und Hausmärchen). Hänsel und Gretel, Rotkäppchen (le Petit Chaperon rouge), Aschenputtel (Cendrillon) et Schneewittchen (Blanche-Neige) font partie de la culture commune des pays germanophones.

Enregistrements et images : Deutsch im Blick (COERLL, Université du Texas à Austin), CC BY 4.0.`,
      },
      // Liste complète : la question 3 ne nomme plus de personne réelle ; identifiants et images inchangés.
      questions: [
        {
          "id": "q1",
          "type": "choice",
          "prompt": "Ein altes Gemälde: Ein Bischof mit Mitra und goldenem Stab hält ein Buch mit drei goldenen Kugeln. In der Nacht zum 6. Dezember stellen die Kinder ihre Stiefel vor die Tür, und er füllt sie mit kleinen Geschenken. Wer ist das?",
          "options": [
            {
              "id": "a",
              "label": "der Osterhase",
              "correct": false
            },
            {
              "id": "b",
              "label": "Sankt Martin",
              "correct": false
            },
            {
              "id": "c",
              "label": "der Nikolaus",
              "correct": true
            },
            {
              "id": "d",
              "label": "der Weihnachtsmann",
              "correct": false
            }
          ],
          "explanation": "L’évêque à la mitre et la nuit du 5 au 6 décembre, quand les enfants posent leurs bottes devant la porte : c’est le Nikolaus. Sankt Martin se fête le 11 novembre avec des lanternes."
        },
        {
          "id": "q2",
          "type": "choice",
          "prompt": "Auf einem Holzschrank stehen ein kleiner Stall, viele kleine Figuren und ein Tier. Vorne liegen rot-weiße Zuckerstangen. Was ist das?",
          "options": [
            {
              "id": "a",
              "label": "ein Adventskranz",
              "correct": false
            },
            {
              "id": "b",
              "label": "eine Weihnachtskrippe",
              "correct": true
            },
            {
              "id": "c",
              "label": "ein Osterei",
              "correct": false
            },
            {
              "id": "d",
              "label": "ein Maibaum",
              "correct": false
            }
          ],
          "explanation": "Une petite étable (der Stall) avec des figurines et un animal : c’est une crèche de Noël, die Weihnachtskrippe. Der Adventskranz est une couronne à quatre bougies."
        },
        {
          "id": "q3",
          "type": "choice",
          "prompt": "Eine alte Zeichnung: Zwei Kinder stehen vor einem kleinen Haus mitten im Wald. Das Haus ist aus Lebkuchen, und darin wohnt eine böse Hexe. Welches deutsche Märchen ist das?",
          "options": [
            {
              "id": "a",
              "label": "Rotkäppchen",
              "correct": false
            },
            {
              "id": "b",
              "label": "Aschenputtel",
              "correct": false
            },
            {
              "id": "c",
              "label": "Schneewittchen",
              "correct": false
            },
            {
              "id": "d",
              "label": "Hänsel und Gretel",
              "correct": true
            }
          ],
          "explanation": "Deux enfants, une maison en pain d’épice (Lebkuchen) au milieu de la forêt et une méchante sorcière : c’est Hänsel und Gretel. Rotkäppchen rencontre un loup, pas une sorcière."
        },
        {
          "id": "q4",
          "type": "choice",
          "prompt": "Ein großes Fachwerkhaus steht auf einer grünen Wiese, hinter ihm sieht man hohe Berge mit Schnee. Auf dem Dach weht eine rote Fahne mit einem weißen Kreuz. In welchem Land ist das?",
          "options": [
            {
              "id": "a",
              "label": "In der Schweiz.",
              "correct": true
            },
            {
              "id": "b",
              "label": "In Österreich.",
              "correct": false
            },
            {
              "id": "c",
              "label": "In Belgien.",
              "correct": false
            },
            {
              "id": "d",
              "label": "In Deutschland.",
              "correct": false
            }
          ],
          "explanation": "Le drapeau rouge à croix blanche est celui de la Suisse. Le drapeau autrichien a trois bandes rouge, blanche, rouge, sans croix."
        }
      ],
    },

    'a2-kultur-hoeren': {
      title: 'Vérifier : écouter un micro-trottoir sur le « typiquement allemand »',
      explanations: {
        q1: 'Ingrid dit « Bei mir zu Hause gibt es fünf verschiedene Mülleimer! ». Ne confondez pas fünf (5) et vier (4).',
        q2: '« Ich finde, dass wir so die Umwelt schützen. Und das ist mir wichtiger als ein bisschen Platz in der Küche. » Das reprend la protection de l’environnement ; c’est sa petite-fille qui en rit.',
        q3: 'Pour Kofi, le cliché « stimmt nur teilweise » : « Bei der Arbeit kommen alle pünktlich », mais à une fête, ses collègues arrivent « oft eine Stunde später ».',
        q4: '« Nicht das Bier und nicht die Autos, sondern das Brot! » : nicht … sondern écarte la bière et les voitures. Kofi admire les plus de 3 000 sortes de pain.',
        q5: 'Lisa dit « in Berlin oder Hamburg ist er nicht so wichtig wie bei uns » : à Cologne (bei uns), le carnaval est la plus belle fête de l’année. Nicht so … wie exprime une inégalité.',
        q6: '« Am Sonntag gehe ich mit meiner Familie im Park spazieren. » Elle rappelle justement que presque tous les magasins sont fermés (zu) le dimanche.',
      },
      addQuestions: [
        { id: 'q7', type: 'dictation', prompt: 'Lisa : écoutez sa phrase sur le carnaval et écrivez-la.',
          accept: ['Hier in Köln ist der Karneval das schönste Fest im Jahr.'], voice: 'sprecherin',
          explanation: 'Das schönste Fest : devant un nom, le superlatif prend l’article et la terminaison -e. Köln s’écrit avec ö et der Karneval avec un K.' },
      ],
    },

    'a2-kultur-dach-lesen': {
      title: 'Vérifier : lire « Une langue, plusieurs pays »',
      explanations: {
        q1: '« In Bayern und in Österreich sagt man nämlich „Semmel“ » ; à Berlin, on dit « Schrippe ». Munich est en Bavière, mais le mot ne s’arrête pas à cette ville.',
        q2: 'Chloé commande un strudel « mit Sahne » et le serveur répond « Mit Schlagobers » : à Vienne, Schlagobers désigne la crème fouettée. Les pommes de terre, elles, s’appellent Erdäpfel.',
        q3: '« … in Norddeutschland „Moin“ ». Grüß Gott et Servus s’entendent en Autriche et en Bavière, Grüezi en Suisse.',
        q4: '« Am schwierigsten war Zürich. Im Alltag sprechen die Leute dort Schweizerdeutsch » : au début, elle ne comprenait presque rien. Payer en francs n’est pas un problème de langue.',
        q5: '« Die Schweiz ist übrigens nicht in der EU, und man bezahlt mit Franken », mais elle « gehört zum Schengen-Raum » : Chloé n’a pas eu à montrer sa carte d’identité.',
        q6: '« Deutsch klingt nicht überall gleich … Aber mit Hochdeutsch kommt man überall weiter. » Elle ne conseille pas d’apprendre les dialectes : l’allemand standard suffit pour se faire comprendre.',
      },
    },

    'a2-kultur-du-sie-hoeren': {
      title: 'Vérifier : écouter « du ou Sie ? »',
      explanations: {
        q1: '« Ich war nervös und habe sofort „du“ gesagt. » La voisine répond « Wir sagen hier noch Sie, junge Frau » : elle voulait être vouvoyée.',
        q2: '« Die ältere Person oder der Chef bietet das Du an, nicht die junge Studentin. » C’est donc la voisine, plus âgée, qui a proposé le tutoiement.',
        q3: '« Mit den anderen Studierenden sage ich immer „du“ … Aber meine Professorin sieze ich natürlich. » Siezen signifie vouvoyer.',
        q4: 'On dit « Bis später » seulement « wenn man sich wirklich bald wiedersieht, zum Beispiel am selben Tag ». Pour la semaine suivante, on dit « Bis nächste Woche ».',
        q5: '« Ja, im Uni-Chor. Wir singen jeden Mittwoch » : ses amis autrichiens viennent de la chorale de l’université. Au séminaire, elle ne cite que Jakob, un camarade de cours.',
        q6: '« Wenn ihr nicht wisst, ob ihr „du“ oder „Sie“ sagen sollt, dann sagt zuerst „Sie“. » Elle ajoute que les gens sont patients : il ne faut pas avoir peur des fautes.',
      },
    },

    'a2-kultur-grammatik': {
      title: 'S’entraîner : comparer et donner son avis',
      estimatedMinutes: 12,
      competences: ['lecture', 'ecoute', 'expression-ecrite'],
      lesson: {
        description: `Complétez, remettez dans l’ordre ou associez, puis écrivez la phrase dictée.

RAPPELS
• Comparatif : adjectif + -er, suivi de als : schneller als, billiger als. Beaucoup d’adjectifs courts prennent un Umlaut : alt → älter, groß → größer.
• Égalité : so + adjectif + wie ; à la forme négative, nicht so … wie. Jamais « so … als » ni « -er wie ».
• Superlatif : am + adjectif + -sten après un verbe (am schnellsten) ; der / die / das + adjectif + -ste devant un nom (der höchste Berg). Après -t, -d, -s, -ß ou -z, on ajoute un -e- : am ältesten.
• Formes irrégulières : gut, besser, am besten ; gern, lieber, am liebsten ; viel, mehr, am meisten ; hoch, höher, am höchsten.
• Donner son avis : après dass, le verbe conjugué va à la fin (Ich finde, dass das System sinnvoll ist). Meiner Meinung nach occupe la première position : le verbe suit immédiatement.`,
      },
      removeQuestions: ['q1', 'q2', 'q3', 'q5', 'q6', 'q7', 'q8'],
      explanations: {
        q4: 'Devant un nom, le superlatif prend l’article et une terminaison : der höchste Berg (hoch → höher → höchst-, avec Umlaut et sans c). Am höchsten s’emploie seulement sans nom, après un verbe.',
      },
      addQuestions: [
        { id: 'q9', type: 'fill', prompt: 'Complétez avec le comparatif de l’adjectif et le mot qui introduit la comparaison.',
          text: 'Mit dem Fahrrad ist man in der Stadt oft [[1]] [[2]] mit dem Auto.',
          blanks: [{ id: '1', accept: ['schneller'], size: 10, hint: 'schnell' }, { id: '2', accept: ['als'], size: 5, hint: null }],
          explanation: 'Le comparatif se forme avec -er (schnell → schneller) et le second terme est introduit par als. Wie sert à l’égalité : so schnell wie.' },
        { id: 'q10', type: 'fill', prompt: 'Comparez trois villes : complétez.',
          text: 'Köln ist [[1]] als Hamburg, und Hamburg ist nicht so groß [[2]] Berlin.',
          blanks: [{ id: '1', accept: ['kleiner'], size: 9, hint: 'klein' }, { id: '2', accept: ['wie'], size: 5, hint: null }],
          explanation: 'Cologne compte moins d’habitants que Hambourg : kleiner als (comparatif + als). L’égalité et sa négation se construisent avec so … wie : nicht so groß wie Berlin, jamais « so groß als ».' },
        { id: 'q11', type: 'fill', prompt: 'Complétez avec les formes irrégulières de gut.',
          text: 'Mein Deutsch ist gut, Paulas Deutsch ist [[1]], aber Ben spricht am [[2]] Deutsch.',
          blanks: [{ id: '1', accept: ['besser'], size: 8, hint: 'gut' }, { id: '2', accept: ['besten'], size: 8, hint: 'gut' }],
          explanation: 'Gut est irrégulier : gut, besser, am besten. Après un verbe (spricht), le superlatif prend la forme am … -sten : am besten, et non « am gutesten ».' },
        { id: 'q12', type: 'fill', prompt: 'Lena a 25 ans, son frère 28 et sa sœur 31. Complétez.',
          text: 'Ihr Bruder ist [[1]] als Lena, aber ihre Schwester ist am [[2]].',
          blanks: [{ id: '1', accept: ['älter'], size: 8, hint: 'alt' }, { id: '2', accept: ['ältesten'], size: 10, hint: 'alt' }],
          explanation: 'Alt prend un Umlaut au comparatif et au superlatif : älter, am ältesten. Après -t, le superlatif ajoute un -e- : ältesten, pas « ältsten ».' },
        { id: 'q13', type: 'fill', prompt: 'Complétez avec les formes de gern.',
          text: 'Ich trinke gern Tee, [[1]] trinke ich Kaffee, und am [[2]] trinke ich Kakao.',
          blanks: [{ id: '1', accept: ['lieber'], size: 8, hint: 'gern' }, { id: '2', accept: ['liebsten'], size: 10, hint: 'gern' }],
          explanation: 'Gern a des formes irrégulières : gern, lieber, am liebsten. « Mehr gern » et « am gernsten » n’existent pas. Lieber en tête de phrase est suivi du verbe trinke.' },
        { id: 'q14', type: 'order', prompt: 'Donnez votre avis avec dass : remettez les mots dans l’ordre.',
          answers: [['Ich finde,', 'dass', 'die Mülltrennung', 'sinnvoll', 'ist.']],
          explanation: 'Après dass, le verbe conjugué ist va à la fin de la proposition. « dass die Mülltrennung ist sinnvoll » garde l’ordre d’une principale, ce qui est faux.' },
        { id: 'q15', type: 'order', prompt: 'Donnez votre avis. Commencez par « Meiner Meinung nach ».',
          answers: [['Meiner Meinung nach', 'ist', 'der ruhige Sonntag', 'sehr angenehm.']],
          explanation: 'Meiner Meinung nach occupe la première position : le verbe conjugué ist vient juste après, puis le sujet der ruhige Sonntag. Ce n’est pas une subordonnée : le verbe ne va pas à la fin.' },
        { id: 'q16', type: 'match', prompt: 'Associez chaque adjectif à son comparatif.',
          pairs: [
            { left: 'gut', right: 'besser' },
            { left: 'viel', right: 'mehr' },
            { left: 'gern', right: 'lieber' },
            { left: 'hoch', right: 'höher' },
            { left: 'groß', right: 'größer' },
          ],
          explanation: 'Ces adjectifs courants ont un comparatif irrégulier ou avec Umlaut : gut → besser, viel → mehr, gern → lieber, hoch → höher (sans c), groß → größer.' },
        { id: 'q17', type: 'dictation', prompt: 'Écoutez et écrivez l’avis de cette personne.',
          accept: ['Ich glaube, dass das ein Klischee ist.'], voice: 'sprecher',
          explanation: 'Après dass, le verbe ist termine la phrase. Das Klischee, le cliché, prend une majuscule ; une virgule précède dass.' },
      ],
    },

    'a2-kultur-sprechen': {
      kind: 'mission',
      title: 'Mission : typiquement allemand, typiquement de chez moi',
      estimatedMinutes: 20,
      competences: ['expression-orale', 'expression-ecrite'],
      lesson: {
        description: `Écoutez Thomas, un Belge qui vit à Hanovre. Il compare l’Allemagne et la Belgique et donne son avis. Préparez ensuite votre propre intervention, puis votre message pour le forum.

MODÈLE
Hallo, ich bin Thomas und komme aus Brüssel. Seit zwei Jahren lebe ich in Hannover. Was ist für mich typisch deutsch? Ich finde, dass viele Deutsche sehr umweltfreundlich sind. Sie trennen den Müll genauer als wir in Belgien, und viele fahren mit dem Fahrrad zur Arbeit. Man sagt, die Deutschen sind immer pünktlich. Meiner Meinung nach stimmt das nur teilweise: Meine Kollegen sind pünktlich, meine Züge leider nicht immer! Die Schule ist hier anders als bei uns. In Belgien dauert der Schultag länger, hier haben viele Kinder schon am frühen Nachmittag frei. Und die Traditionen? Am schönsten finde ich den Weihnachtsmarkt. Aber die besten Pommes gibt es natürlich in Belgien!

POUR PRÉPARER
1. Votre expérience : Ich lerne seit … Deutsch. / Ich war schon einmal in … / Ich kenne Deutschland aus Filmen, aus dem Internet …
2. Un cliché : Man sagt, die Deutschen sind … Ich glaube, das stimmt (nicht / nur teilweise), weil …
3. Comparer : In Deutschland ist … größer / billiger / wichtiger als in … ; … ist (nicht) so … wie bei uns.
4. Votre avis : Ich finde, dass … ; Meiner Meinung nach …
5. Le meilleur : Am besten gefällt mir … ; Die schönste Tradition ist …

Nuancez : un cliché ne décrit jamais tout le monde (viele, manche, nicht alle, das stimmt nur teilweise). À l’oral, parlez à partir de mots-clés, sans lire un texte rédigé.`,
      },
      mission: {
        oral: {
          prompt: 'Présentez en une à deux minutes ce qui vous semble typiquement allemand et typique de votre pays : votre expérience, un cliché et votre avis, une comparaison entre les deux pays et ce que vous préférez.',
          maxSeconds: 120,
        },
        written: {
          prompt: 'Répondez sur le forum du cours à la question « Was ist typisch deutsch – und was ist typisch für dein Land? » en 60 à 80 mots : deux thèmes au choix (école, environnement, fêtes, ponctualité, cuisine), un comparatif avec als, une comparaison avec so … wie, votre avis et un superlatif pour finir.',
          maxChars: 1000,
          minWords: 60,
        },
        checklist: [
          'J’ai employé au moins un comparatif suivi de als et une comparaison avec so … wie.',
          'Après dass, le verbe conjugué est à la fin ; après « Meiner Meinung nach », il vient juste après.',
          'J’ai nuancé un cliché : viele, manche, nicht alle ou « Das stimmt nur teilweise ».',
          'Mon message parle de deux thèmes et se termine par un superlatif (am besten, das schönste …).',
        ],
      },
    },
  },

  add: [
    {
      after: 'a2-kultur-native-wortschatz',
      activity: {
        id: 'a2-kultur-repeter',
        kind: 'exercise',
        title: 'Répéter à voix haute : clichés et avis',
        estimatedMinutes: 8,
        competences: ['expression-orale'],
        lesson: {
          title: 'Répéter à voix haute : clichés et avis',
          description: 'Écoutez chaque modèle, puis dites la phrase à voix haute. Soignez les voyelles avec Umlaut (pünktlich, Müll) et le « sp » de sparsam, prononcé « chp ». Si la reconnaissance vocale ne comprend pas votre phrase, réécoutez le modèle et réessayez.',
          transcript: null,
        },
        placements: [],
        questions: [
          { id: 'q1', type: 'speak', prompt: 'Écoutez, puis répétez : nuancer un cliché.',
            text: 'Ich glaube, das stimmt nur teilweise.', accept: ['Ich glaube, das stimmt nur teilweise.'], threshold: 75,
            explanation: 'Teilweise (en partie) est accentué sur TEIL, et ei se prononce « aï ». Sans dass, la seconde partie garde l’ordre normal : das stimmt …' },
          { id: 'q2', type: 'speak', prompt: 'Écoutez, puis répétez : un cliché sur les Allemands.',
            text: 'Viele Deutsche sind sehr pünktlich.', accept: ['Viele Deutsche sind sehr pünktlich.'], threshold: 75,
            explanation: 'Le ü de pünktlich se prononce lèvres arrondies, comme le « u » de « tu ». Viele nuance le cliché : pas tous les Allemands.' },
          { id: 'q3', type: 'speak', prompt: 'Écoutez, puis répétez : donner son avis.',
            text: 'Meiner Meinung nach sind viele Deutsche sparsam.', accept: ['Meiner Meinung nach sind viele Deutsche sparsam.'], threshold: 75,
            explanation: 'Meiner Meinung nach est suivi directement du verbe sind. Au début d’un mot, sp se prononce « chp » : sparsam.' },
          { id: 'q4', type: 'speak', prompt: 'Écoutez, puis répétez : parler du tri des déchets.',
            text: 'Bei uns trennen alle den Müll.', accept: ['Bei uns trennen alle den Müll.'], threshold: 75,
            explanation: 'Le ü de Müll est bref, suivi de deux l. Trennen garde un e bref : TREN-nen.' },
          { id: 'q5', type: 'speak', prompt: 'Écoutez, puis répétez : comparer deux moyens de transport.',
            text: 'Das Fahrrad ist billiger als das Auto.', accept: ['Das Fahrrad ist billiger als das Auto.'], threshold: 75,
            explanation: 'Billiger als : comparatif en -er suivi de als. Entre deux voyelles, le g de billiger se prononce comme un vrai g.' },
          { id: 'q6', type: 'speak', prompt: 'Écoutez, puis répétez : parler d’une tradition.',
            text: 'Diese Tradition ist bei uns sehr wichtig.', accept: ['Diese Tradition ist bei uns sehr wichtig.'], threshold: 75,
            explanation: 'Les noms en -tion se prononcent « tsion » et sont accentués sur la fin : Tradi-TION. Le -ig de wichtig se dit comme le « ch » de ich.' },
        ],
      },
    },
  ],
};
