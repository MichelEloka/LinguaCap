// Couche pédagogique V4 · a2-gesundheit (lot A7, contenu A2).
// Santé et forme : explications de toutes les questions, wehtun au datif, verbes de modalité et impératif en exercices
// typés, répétition validée, dictées et mission remise au professeur.

export default {
  module: 'a2-gesundheit',
  grammarFocus: ['wehtun-datif', 'modaux-muessen-sollen-duerfen', 'imperatif'],

  // Son du kit corrigé : pas de nom de ligue déposé. À régénérer.
  media: [
    {
      "key": "a2-gesundheit-fitbleiben-audio-v3",
      "kind": "audio",
      "title": "Wie hältst du dich fit? — L’interview de Léa",
      "script": [
        {
          "voice": "mann",
          "name": "Jonas",
          "text": "Hallo Léa! Ich schreibe für die Unizeitung einen Artikel über Sport im Studium. Darf ich dir ein paar Fragen stellen?"
        },
        {
          "pause": 0.5
        },
        {
          "voice": "frau",
          "name": "Léa",
          "text": "Klar, gern! Was möchtest du wissen?"
        },
        {
          "pause": 0.5
        },
        {
          "voice": "mann",
          "name": "Jonas",
          "text": "Treibst du viel Sport?"
        },
        {
          "pause": 0.5
        },
        {
          "voice": "frau",
          "name": "Léa",
          "text": "Ja, ziemlich viel. Ich spiele Volleyball im Verein, und beim Hochschulsport mache ich Yoga."
        },
        {
          "pause": 0.5
        },
        {
          "voice": "mann",
          "name": "Jonas",
          "text": "Wie oft trainierst du?"
        },
        {
          "pause": 0.5
        },
        {
          "voice": "frau",
          "name": "Léa",
          "text": "Volleyball zweimal pro Woche, dienstags und donnerstags. Und Yoga mache ich auch zweimal pro Woche."
        },
        {
          "pause": 0.5
        },
        {
          "voice": "mann",
          "name": "Jonas",
          "text": "Warum spielst du so gern Volleyball?"
        },
        {
          "pause": 0.5
        },
        {
          "voice": "frau",
          "name": "Léa",
          "text": "Weil es ein Teamsport ist. Ich bin gern mit anderen Leuten zusammen, und nach dem Training gehen wir oft noch etwas trinken."
        },
        {
          "pause": 0.5
        },
        {
          "voice": "mann",
          "name": "Jonas",
          "text": "Hast du früher andere Sportarten gemacht?"
        },
        {
          "pause": 0.5
        },
        {
          "voice": "frau",
          "name": "Léa",
          "text": "Ja, als Kind bin ich viel geschwommen. Aber das war mir irgendwann zu langweilig."
        },
        {
          "pause": 0.5
        },
        {
          "voice": "mann",
          "name": "Jonas",
          "text": "Und welchen Sport schaust du gern?"
        },
        {
          "pause": 0.5
        },
        {
          "voice": "frau",
          "name": "Léa",
          "text": "Fußball! Ich schaue oft mit Freunden Fußball im Fernsehen."
        },
        {
          "pause": 0.5
        },
        {
          "voice": "mann",
          "name": "Jonas",
          "text": "Was machst du sonst noch für deine Gesundheit?"
        },
        {
          "pause": 0.5
        },
        {
          "voice": "frau",
          "name": "Léa",
          "text": "Ich fahre jeden Tag mit dem Fahrrad zur Uni, und ich esse viel Obst und Gemüse. Ich sollte mehr schlafen, aber das klappt nicht immer!"
        },
        {
          "pause": 0.5
        },
        {
          "voice": "mann",
          "name": "Jonas",
          "text": "Und welchen Sport möchtest du noch ausprobieren?"
        },
        {
          "pause": 0.5
        },
        {
          "voice": "frau",
          "name": "Léa",
          "text": "Klettern! Beim Hochschulsport gibt es einen Kletterkurs für Anfänger. Kommst du mit?"
        },
        {
          "pause": 0.5
        },
        {
          "voice": "mann",
          "name": "Jonas",
          "text": "Gute Idee, ich komme gern mit!"
        }
      ],
      "credit": "LinguaCap, synthèse Piper avec Thorsten Müller (CC0) et Kerstin, préentraînée sur la voix de Cori Samuel (Hi-Fi TTS, CC BY 4.0)",
      "license": "Jeux de données des voix : CC0 et CC BY 4.0"
    }
  ],

  vocabulary: [
    { id: 'kopf', word: 'Kopf', article: 'der', plural: 'Köpfe', partOfSpeech: 'noun', translation: 'la tête',
      example: 'Mir tut der Kopf weh.', note: null },
    { id: 'hals', word: 'Hals', article: 'der', plural: 'Hälse', partOfSpeech: 'noun', translation: 'le cou, la gorge',
      example: 'Der Hals ist ganz rot.', note: 'Halsschmerzen : mal à la gorge' },
    { id: 'ruecken', word: 'Rücken', article: 'der', plural: 'Rücken', partOfSpeech: 'noun', translation: 'le dos',
      example: 'Mir tut oft der Rücken weh.', note: null },
    { id: 'bauch', word: 'Bauch', article: 'der', plural: 'Bäuche', partOfSpeech: 'noun', translation: 'le ventre',
      example: 'Nach dem Essen tut mir der Bauch weh.', note: null },
    { id: 'zahn', word: 'Zahn', article: 'der', plural: 'Zähne', partOfSpeech: 'noun', translation: 'la dent',
      example: 'Der Zahn tut seit gestern weh.', note: null },
    { id: 'ohr', word: 'Ohr', article: 'das', plural: 'Ohren', partOfSpeech: 'noun', translation: 'l’oreille',
      example: 'Seit Montag tut mir das rechte Ohr weh.', note: null },
    { id: 'hand', word: 'Hand', article: 'die', plural: 'Hände', partOfSpeech: 'noun', translation: 'la main',
      example: 'Die Hand tut mir total weh.', note: null },
    { id: 'bein', word: 'Bein', article: 'das', plural: 'Beine', partOfSpeech: 'noun', translation: 'la jambe',
      example: 'Mein Bein ist gebrochen.', note: null },
    { id: 'knie', word: 'Knie', article: 'das', plural: 'Knie', partOfSpeech: 'noun', translation: 'le genou',
      example: 'Léa hat sich am Knie verletzt.', note: null },
    { id: 'fuss', word: 'Fuß', article: 'der', plural: 'Füße', partOfSpeech: 'noun', translation: 'le pied',
      example: 'Der Fuß ist okay, aber die Hand tut weh.', note: 'zu Fuß gehen : aller à pied' },
    { id: 'wehtun', word: 'wehtun', article: null, plural: null, partOfSpeech: 'verb', translation: 'faire mal',
      example: 'Nach dem Training kann der Rücken wehtun.', note: 'Mir tut der Kopf weh : la personne au datif · séparable : weh|tun' },
    { id: 'kopfschmerzen', word: 'Kopfschmerzen', article: 'die', plural: null, partOfSpeech: 'noun', translation: 'le mal de tête',
      example: 'Ich habe seit gestern Kopfschmerzen.', note: 'toujours au pluriel ; de même Halsschmerzen, Bauchschmerzen' },
    { id: 'fieber', word: 'Fieber', article: 'das', plural: null, partOfSpeech: 'noun', translation: 'la fièvre',
      example: 'Ich habe seit zwei Tagen Fieber.', note: 'Fieber haben : avoir de la fièvre' },
    { id: 'husten', word: 'Husten', article: 'der', plural: null, partOfSpeech: 'noun', translation: 'la toux',
      example: 'Ich habe Husten, vor allem nachts.', note: 'le verbe : husten (tousser)' },
    { id: 'erkaeltung', word: 'Erkältung', article: 'die', plural: 'Erkältungen', partOfSpeech: 'noun', translation: 'le rhume',
      example: 'Das ist eine starke Erkältung, aber keine Grippe.', note: null },
    { id: 'erkaeltet', word: 'erkältet', article: null, plural: null, partOfSpeech: 'adjective', translation: 'enrhumé',
      example: 'Emre ist total erkältet.', note: 'ich bin erkältet = ich habe eine Erkältung' },
    { id: 'uebel', word: 'übel', article: null, plural: null, partOfSpeech: 'adjective', translation: 'qui a la nausée',
      example: 'Mir ist übel.', note: 'mir ist übel : la personne au datif' },
    { id: 'arzt', word: 'Arzt', article: 'der', plural: 'Ärzte', partOfSpeech: 'noun', translation: 'le médecin',
      example: 'Morgen gehe ich zum Arzt.', note: 'au féminin : die Ärztin, die Ärztinnen' },
    { id: 'praxis', word: 'Praxis', article: 'die', plural: 'Praxen', partOfSpeech: 'noun', translation: 'le cabinet médical',
      example: 'Die Praxis ist bis Freitag geschlossen.', note: null },
    { id: 'termin', word: 'Termin', article: 'der', plural: 'Termine', partOfSpeech: 'noun', translation: 'le rendez-vous',
      example: 'Haben Sie heute noch einen Termin frei?', note: null },
    { id: 'versichertenkarte', word: 'Versichertenkarte', article: 'die', plural: 'Versichertenkarten', partOfSpeech: 'noun',
      translation: 'la carte d’assurance maladie', example: 'Bringen Sie bitte Ihre Versichertenkarte mit.', note: null },
    { id: 'rezept', word: 'Rezept', article: 'das', plural: 'Rezepte', partOfSpeech: 'noun', translation: 'l’ordonnance (aussi : la recette)',
      example: 'Für dieses Medikament brauchen Sie ein Rezept.', note: null },
    { id: 'medikament', word: 'Medikament', article: 'das', plural: 'Medikamente', partOfSpeech: 'noun', translation: 'le médicament',
      example: 'Nehmen Sie das Medikament nach dem Essen.', note: null },
    { id: 'tablette', word: 'Tablette', article: 'die', plural: 'Tabletten', partOfSpeech: 'noun', translation: 'le comprimé',
      example: 'Nehmen Sie dreimal am Tag eine Tablette.', note: null },
    { id: 'apotheke', word: 'Apotheke', article: 'die', plural: 'Apotheken', partOfSpeech: 'noun', translation: 'la pharmacie',
      example: 'Hustensaft bekommen Sie in der Apotheke.', note: null },
    { id: 'krankenhaus', word: 'Krankenhaus', article: 'das', plural: 'Krankenhäuser', partOfSpeech: 'noun', translation: 'l’hôpital',
      example: 'Sie müssen nicht ins Krankenhaus.', note: null },
    { id: 'krankschreibung', word: 'Krankschreibung', article: 'die', plural: 'Krankschreibungen', partOfSpeech: 'noun',
      translation: 'l’arrêt de travail', example: 'Brauche ich eine Krankschreibung?', note: null },
    { id: 'sich-ausruhen', word: 'sich ausruhen', article: null, plural: null, partOfSpeech: 'verb', translation: 'se reposer',
      example: 'Sie müssen sich ausruhen.', note: 'réfléchi et séparable : ich ruhe mich aus' },
    { id: 'gute-besserung', word: 'Gute Besserung', article: null, plural: null, partOfSpeech: 'expression', translation: 'bon rétablissement',
      example: 'Du bist krank? Gute Besserung!', note: null },
  ],

  activities: {
    'a2-gesundheit-wortschatz': {
      title: 'Découvrir : le corps, les symptômes et les soins',
    },

    'a2-gesundheit-dib-koerper': {
      title: 'Vérifier : écouter et nommer les parties du corps',
      explanations: {
        q1: 'Le numéro 3 désigne la tête : der Kopf, pluriel die Köpfe dans l’enregistrement. Der Rücken (le dos), das Knie (le genou) et die Hand (la main) correspondent à d’autres numéros.',
        q2: 'Le numéro 4 montre le cou : der Hals, premier mot de l’enregistrement. Le même mot désigne la gorge (Halsschmerzen). Der Knöchel, la cheville, se trouve en bas de la jambe.',
        q3: 'Le numéro 7 montre le poignet : das Handgelenk, formé de die Hand et das Gelenk (l’articulation). Le dernier mot donne le genre : das. Die Hand désignerait la main entière.',
        q4: 'Le numéro 11 désigne la cuisse : der Oberschenkel (ober, en haut + der Schenkel). Son pluriel ne change pas : die Oberschenkel. Das Knie se trouve plus bas, à la pliure de la jambe.',
        q5: 'Le numéro 16 désigne la cheville : der Knöchel, pluriel die Knöchel. Le même mot sert pour les articulations des doigts. Der Hals, die Lippe et das Ohr sont en haut du corps.',
        q6: 'Le numéro 19 montre le dos : der Rücken, dernier mot de l’enregistrement, que l’on retrouve dans Rückenschmerzen. Der Kopf et die Nase désignent la tête et le nez.',
      },
    },

    'a2-gesundheit-dialog': {
      title: 'Comprendre : prendre rendez-vous et consulter',
    },

    'a2-gesundheit-dib-aerzte': {
      title: 'Vérifier : écouter douleurs et médecins (voix natives)',
      explanations: {
        q1: 'Zahnschmerzen, ce sont des douleurs aux dents (der Zahn) : on va chez le dentiste, der Zahnarzt. Le nom du spécialiste se forme souvent avec la partie du corps + Arzt ; der Augenarzt soigne les yeux.',
        q2: 'Pour un enfant de quatre ans, on va chez le pédiatre : der Kinderarzt (das Kind + der Arzt). Der Frauenarzt est le gynécologue, et la fièvre ne concerne ni les dents ni la peau.',
        q3: 'Quand on voit mal et qu’on a peut-être besoin de lunettes, on consulte l’ophtalmologue : der Augenarzt (das Auge, l’œil). Le Hals-Nasen-Ohren-Arzt soigne la gorge, le nez et les oreilles.',
        q4: 'Un chat malade va chez le vétérinaire : der Tierarzt (das Tier, l’animal). Der Kinderarzt soigne les enfants, pas les animaux.',
        q5: 'Gorge et oreilles : c’est le domaine du Hals-Nasen-Ohren-Arzt (l’ORL), mot à mot « médecin du cou, du nez et des oreilles ». Der Zahnarzt soigne les dents.',
        q6: 'Avoir mal au dos se dit Rückenschmerzen haben (der Rücken + die Schmerzen). Bauchschmerzen concernent le ventre, Halsschmerzen la gorge et Kopfschmerzen la tête.',
      },
      addQuestions: [
        { id: 'q7', type: 'dictation', prompt: 'Écoutez ce qu’un patient dit au médecin, puis écrivez la phrase.',
          accept: ['Seit gestern habe ich starke Halsschmerzen.'], voice: 'sprecher',
          explanation: 'Seit gestern ouvre la phrase : le verbe habe suit directement, puis le sujet ich. Halsschmerzen s’écrit en un seul mot, avec une majuscule, et s’emploie au pluriel.' },
      ],
    },

    'a2-gesundheit-apotheke': {
      title: 'Comprendre : à la pharmacie, l’impératif',
    },

    'a2-gesundheit-lesen': {
      title: 'Vérifier : lire un forum santé',
      explanations: {
        q1: 'Jana écrit « Abends bin ich total müde » et « Außerdem tut mir oft der Rücken weh » : fatigue et mal de dos. Elle ne parle ni de fièvre ni de blessure.',
        q2: '« Am Nachmittag trinke ich drei oder vier Tassen Kaffee, dann bin ich wieder fit » : le café lui redonne de l’énergie. Elle ne dit pas qu’elle aime particulièrement le café.',
        q3: 'Bernd conseille « Du solltest jeden Tag mindestens 30 Minuten zu Fuß gehen. Oder fahr doch mit dem Fahrrad zur Arbeit! ». Le bon fauteuil de bureau est un conseil de Mia, pas de Bernd.',
        q4: 'Mia se présente ainsi : « ich bin Physiotherapeutin » (kinésithérapeute). Elle n’est pas médecin : c’est justement elle qui conseille d’aller chez le médecin si la douleur dure.',
        q5: 'Mia écrit « Wenn die Schmerzen in zwei Wochen nicht besser sind, solltest du zum Arzt gehen » : seulement si la douleur dure encore dans deux semaines, pas tout de suite.',
        q6: '« Ab morgen fahre ich mit dem Rad ins Büro, und nachmittags trinke ich Tee statt Kaffee. » Statt signifie « au lieu de » : Jana remplace le café de l’après-midi, pas celui du matin.',
      },
    },

    'a2-gesundheit-sportblog': {
      title: 'Vérifier : lire un blog sur le sport à l’université',
      explanations: {
        q1: 'Léa écrit « Es gibt keine großen Uni-Mannschaften und keine Sportstipendien ». Le sport universitaire est au contraire bon marché (für wenig Geld), et la salle de sport est simple, pas moderne.',
        q2: '« Ich mache zweimal pro Woche Yoga, weil Yoga gut gegen den Stress im Studium ist. » La raison suit weil ; Léa ne parle pas de mal de dos et le cours n’est pas gratuit.',
        q3: '« Der Beitrag kostet 8 Euro im Monat » : la cotisation du club est de 8 € par mois. Les 15 € par semestre concernent la salle de sport de l’université.',
        q4: '« Wir trainieren dienstags und donnerstags von 19 bis 21 Uhr » ; le week-end, l’équipe joue contre d’autres clubs. Dienstags signifie « le mardi, chaque semaine ».',
        q5: '« Die Ärztin hat gesagt, dass ich drei Wochen keinen Sport machen darf » : une interdiction de trois semaines seulement, puisque Léa joue de nouveau. Keinen … dürfen exprime l’interdiction.',
        q6: 'Son conseil final : « Wenn ihr im Ausland studiert, geht in einen Verein! So bleibt ihr fit und findet schnell Freunde. » La salle de sport bon marché n’est qu’un détail du texte.',
      },
    },

    'a2-gesundheit-fitbleiben': {
      title: 'Comprendre : une interview sur le sport',
      competences: ['ecoute', 'lecture', 'expression-orale'],
      lesson: {
        description: `Jonas écrit un article sur le sport des étudiants pour le journal de son université (die Unizeitung). Il interroge Léa, l’étudiante française du blog. Écoutez l’interview une première fois sans lire, puis réécoutez en suivant le texte.

MODÈLE
Jonas : Hallo Léa! Ich schreibe für die Unizeitung einen Artikel über Sport im Studium. Darf ich dir ein paar Fragen stellen?
Léa : Klar, gern!
Jonas : Treibst du viel Sport?
Léa : Ja, ziemlich viel. Ich spiele Volleyball im Verein, und beim Hochschulsport mache ich Yoga.
Jonas : Wie oft trainierst du?
Léa : Volleyball zweimal pro Woche, dienstags und donnerstags. Und Yoga mache ich auch zweimal pro Woche.
Jonas : Warum spielst du so gern Volleyball?
Léa : Weil es ein Teamsport ist. Ich bin gern mit anderen Leuten zusammen, und nach dem Training gehen wir oft noch etwas trinken.
Jonas : Hast du früher andere Sportarten gemacht?
Léa : Ja, als Kind bin ich viel geschwommen. Aber das war mir irgendwann zu langweilig.
Jonas : Und welchen Sport schaust du gern?
Léa : Fußball! Ich schaue oft mit Freunden Fußball im Fernsehen.
Jonas : Was machst du sonst noch für deine Gesundheit?
Léa : Ich fahre jeden Tag mit dem Fahrrad zur Uni, und ich esse viel Obst und Gemüse. Ich sollte mehr schlafen, aber das klappt nicht immer!
Jonas : Und welchen Sport möchtest du noch ausprobieren?
Léa : Klettern! Beim Hochschulsport gibt es einen Kletterkurs für Anfänger. Kommst du mit?
Jonas : Gute Idee, ich komme gern mit!

REPÉREZ DANS L’INTERVIEW
• Le sport et la fréquence : Ich spiele Volleyball im Verein. Zweimal pro Woche, dienstags und donnerstags.
• La raison, verbe conjugué à la fin : Weil es ein Teamsport ist.
• Le passé : Als Kind bin ich viel geschwommen (schwimmen se conjugue avec sein).
• Un conseil qu’on se donne : Ich sollte mehr schlafen.

MOTS ET FORMULES UTILES
• Le sport : Ich spiele Fußball / Tennis / Basketball. Ich schwimme. Ich jogge. Ich mache Yoga. Ich gehe ins Fitnessstudio.
• La fréquence : jeden Tag (täglich), zweimal pro Woche, am Wochenende, regelmäßig, selten, nie.
• Le lieu (wo? + datif) : im Verein, im Fitnessstudio, im Schwimmbad, im Park, auf dem Sportplatz, in der Turnhalle.
• La raison : …, weil es Spaß macht / weil ich gern im Team spiele / weil ich fit bleiben will.
• Le passé : Früher habe ich Handball gespielt. Als Kind bin ich viel geschwommen.
• La santé : Ich esse gesund. Ich schlafe genug. Ich gehe viel zu Fuß. Ich sollte mehr Sport machen.

À VOUS
Répondez à voix haute aux questions de Jonas, comme si l’interview vous était destinée : Treibst du Sport? Wie oft und wo trainierst du? Warum magst du diesen Sport? Welchen Sport hast du früher gemacht? Was machst du sonst noch für deine Gesundheit? Welchen Sport möchtest du gern ausprobieren? Réagissez comme Jonas : Echt? — Toll! — Ich auch. — Das möchte ich auch mal ausprobieren!

VÉRIFIEZ
• Après weil, le verbe conjugué va à la fin : …, weil es Spaß macht.
• Wo? + datif : Ich trainiere im Fitnessstudio. — Wohin? + accusatif : Ich gehe ins Fitnessstudio.
• Le Perfekt : avec haben pour spielen et machen (Ich habe Handball gespielt.), avec sein pour schwimmen, laufen et fahren (Ich bin viel geschwommen.).

BON À SAVOIR
Dans les universités allemandes, le sport tient une place modeste : pas de grandes équipes universitaires comme aux États-Unis, mais des cours bon marché (der Hochschulsport) et des salles de sport souvent simples. En Allemagne, on fait surtout du sport en club (der Sportverein) : il en existe des dizaines de milliers, jusque dans les petits villages, et beaucoup d’étudiants étrangers s’y inscrivent pour rester en forme et se faire des amis.

Situation adaptée de Der und mehr (Kennesaw State University), CC BY 4.0.`,
      },
    },

    'a2-gesundheit-hoeren': {
      title: 'Vérifier : écouter des scènes de santé au quotidien',
      explanations: {
        q1: 'Le répondeur annonce « Wir sind bis Freitag, den sechsten Juni, im Urlaub » et renvoie vers Doktor Keller « in dringenden Fällen ». Le cabinet n’a pas déménagé : la Bahnhofstraße est l’adresse de Doktor Keller.',
        q2: 'Nico dit « der Fuß ist okay. Aber die Hand tut mir total weh ». Le pied est donc exclu ; il craint même que sa main soit cassée (gebrochen).',
        q3: '« Ich habe heute um vier einen Termin » : aujourd’hui à 16 h. Samedi est le jour où il est tombé au volley, pas celui du rendez-vous.',
        q4: 'La pharmacienne dit « Nehmen Sie dreimal am Tag eine Tablette, immer nach dem Essen », et le client répète pour vérifier. Nach dem Essen signifie après le repas, pas avant.',
        q5: 'Conduire est permis (« Das ist kein Problem »), mais « trinken Sie bitte eine Woche lang keinen Alkohol ». Le distracteur Auto fahren correspond justement à ce qui est autorisé.',
        q6: 'Aylin a quitté la salle de sport (« das war mir zu langweilig ») : « Jetzt jogge ich dreimal pro Woche im Park, morgens vor der Arbeit ». C’est son ami qui préfère nager le soir.',
      },
    },

    'a2-gesundheit-grammatik': {
      title: 'S’entraîner : wehtun, verbes de modalité et impératif',
      estimatedMinutes: 12,
      competences: ['lecture', 'ecoute', 'expression-ecrite'],
      lesson: {
        description: `Complétez, remettez dans l’ordre ou choisissez la phrase correcte, puis écrivez la phrase dictée.

RAPPELS
• wehtun : la partie du corps est le sujet et la personne qui a mal est au datif (mir, dir, ihm, ihr, uns, euch, ihnen, Ihnen) ; avec un pluriel, le verbe devient tun : Mir tun die Füße weh.
• müssen (obligation), sollen (consigne donnée par quelqu’un d’autre), dürfen (permission) ; sollte pour un conseil : du solltest, Sie sollten.
• nicht müssen = ne pas être obligé ; nicht dürfen = ne pas avoir le droit.
• Impératif : Trink! (du) — Trinkt! (ihr) — Trinken Sie! (Sie). Verbes en e → i : du nimmst → Nimm! La particule séparable va à la fin : Macht den Fernseher aus!`,
      },
      removeQuestions: ['q1', 'q2', 'q4', 'q5', 'q7', 'q8'],
      explanations: {
        q3: 'Nicht müssen signifie « ne pas être obligé » : Sie müssen morgen nicht wiederkommen. Attention, nicht dürfen exprime une interdiction (« vous n’avez pas le droit de revenir »), ce qui n’est pas le sens voulu.',
        q6: 'À l’impératif de politesse, le verbe vient en tête, suivi de Sie, et la particule auf va à la fin : Machen Sie bitte den Mund auf! « Mach … auf! » tutoie le patient, et « Sie machen … » n’est qu’une affirmation.',
      },
      addQuestions: [
        { id: 'q9', type: 'fill', prompt: 'Complétez avec la forme de wehtun qui convient.',
          text: 'Ich bin viel gelaufen. Jetzt [[1]] mir die Füße weh.',
          blanks: [{ id: '1', accept: ['tun'], size: 5, hint: 'wehtun' }],
          explanation: 'Avec wehtun, le sujet est la partie du corps : die Füße est un pluriel, donc le verbe se conjugue tun. Mir, au datif, désigne la personne qui a mal. « Mir tut die Füße weh » est l’erreur fréquente.' },
        { id: 'q10', type: 'fill', prompt: 'Complétez avec le pronom qui convient : c’est la sœur qui a mal.',
          text: 'Meine Schwester ist krank. [[1]] tut der Hals weh.',
          blanks: [{ id: '1', accept: ['Ihr'], size: 5, hint: null }],
          explanation: 'La personne qui a mal se met au datif : sie (elle) devient ihr. Le sujet du verbe tut est der Hals. « Sie tut der Hals weh » garderait le nominatif, ce qui est faux.' },
        { id: 'q11', type: 'fill', prompt: 'Rapportez la consigne de la médecin avec sollen.',
          text: 'Die Ärztin sagt, ich [[1]] drei Tage zu Hause bleiben.',
          blanks: [{ id: '1', accept: ['soll'], size: 6, hint: 'sollen' }],
          explanation: 'Sollen rapporte une consigne donnée par quelqu’un d’autre, ici la médecin. À la 1re personne du singulier, pas de terminaison : ich soll, comme ich muss ou ich darf.' },
        { id: 'q12', type: 'fill', prompt: 'Donnez un conseil avec sollte.',
          text: 'Ich bin immer so müde. — Du [[1]] früher ins Bett gehen.',
          blanks: [{ id: '1', accept: ['solltest'], size: 9, hint: 'sollte' }],
          explanation: 'Pour un conseil, on emploie sollte ; avec du, la forme est solltest. L’infinitif gehen se place à la fin de la phrase.' },
        { id: 'q13', type: 'fill', prompt: 'Donnez un conseil à un ami, à l’impératif (du).',
          text: 'Du hast Kopfschmerzen? [[1]] doch eine Tablette!',
          blanks: [{ id: '1', accept: ['Nimm'], size: 6, hint: 'nehmen' }],
          explanation: 'Nehmen change e en i avec du (du nimmst) : l’impératif garde ce i et perd la terminaison -st, d’où Nimm! La forme « Nehm » n’existe pas en allemand standard.' },
        { id: 'q14', type: 'fill', prompt: 'Le père parle à ses deux enfants : complétez à l’impératif (ihr).',
          text: 'Kinder, es ist schon zehn Uhr! [[1]] bitte den Fernseher [[2]]!',
          blanks: [{ id: '1', accept: ['Macht'], size: 7, hint: 'ausmachen' }, { id: '2', accept: ['aus'], size: 4, hint: null }],
          explanation: 'À l’impératif de ihr, on reprend la forme du présent sans le pronom : ihr macht → Macht! La particule aus du verbe séparable ausmachen se place à la fin.' },
        { id: 'q15', type: 'order', prompt: 'La médecin interdit le sport. Remettez les mots dans l’ordre en commençant par « Diese Woche ».',
          answers: [['Diese Woche', 'dürfen', 'Sie', 'keinen Sport', 'machen.']],
          explanation: 'Diese Woche occupe la première position : le verbe de modalité dürfen suit immédiatement, puis le sujet Sie, et l’infinitif machen ferme la phrase. Dürfen à la forme négative (keinen Sport machen dürfen) exprime l’interdiction.' },
        { id: 'q16', type: 'dictation', prompt: 'Écoutez le conseil de la médecin et écrivez la phrase.',
          accept: ['Sie müssen sich ausruhen und viel Tee trinken.'], voice: 'sprecher',
          explanation: 'Le verbe de modalité müssen est en 2e position et les infinitifs ausruhen et trinken vont à la fin. Sich ausruhen est réfléchi : Sie müssen sich ausruhen.' },
      ],
    },

    'a2-gesundheit-sprechen': {
      kind: 'mission',
      title: 'Mission : prévenir qu’on est malade',
      estimatedMinutes: 20,
      competences: ['expression-orale', 'expression-ecrite'],
      lesson: {
        description: `Écoutez le message que Diego laisse sur le répondeur de sa professeure d’allemand.

MODÈLE
Guten Morgen, Frau Lorenz, hier ist Diego Ruiz aus dem Abendkurs. Leider kann ich heute und morgen nicht zum Deutschkurs kommen. Ich bin krank: Ich habe seit gestern Fieber und Halsschmerzen, und mir tut der Kopf weh. Ich war heute Morgen beim Arzt. Er sagt, ich habe eine Grippe und soll bis Freitag im Bett bleiben. Können Sie mir bitte die Hausaufgaben per E-Mail schicken? Vielen Dank und bis nächste Woche!

POUR PRÉPARER
1. Dites ce qui ne va pas : Leider kann ich heute nicht kommen. Ich bin krank.
2. Décrivez vos symptômes et leur durée : Ich habe seit zwei Tagen Fieber / Husten. Mir tut der Bauch weh. Mir ist übel.
3. Rapportez ce que le médecin a dit : Ich war beim Arzt. Ich soll im Bett bleiben. Ich darf keinen Sport machen.
4. Demandez quelque chose : Können Sie mir bitte die Hausaufgaben schicken?
5. Pour le message écrit : Leider kann ich am Samstag nicht mitkommen. Nimm genug Wasser mit! Du solltest … Vielleicht nächste Woche?

Préparez seulement des mots-clés : à l’oral, parlez sans lire un texte rédigé.`,
      },
      mission: {
        oral: {
          prompt: 'Laissez un message vocal à votre professeur ou à votre responsable (une minute environ) : dites que vous ne pouvez pas venir, décrivez vos symptômes et depuis quand, rapportez ce que le médecin a dit et demandez quelque chose.',
          maxSeconds: 90,
        },
        written: {
          prompt: 'Votre ami Paul vous a invité(e) à une randonnée samedi, mais vous êtes malade. Écrivez-lui un message de 60 à 80 mots : excusez-vous, dites ce que vous avez et ce que le médecin a dit, donnez-lui un conseil pour la randonnée et proposez autre chose.',
          maxChars: 1000,
          minWords: 60,
        },
        checklist: [
          'J’ai dit depuis quand je suis malade avec seit + datif : seit gestern, seit zwei Tagen.',
          'J’ai employé « Mir tut … weh » ou « Mir tun … weh » en accordant le verbe avec la partie du corps.',
          'J’ai rapporté la consigne du médecin avec soll ou darf, et l’infinitif est à la fin.',
          'Mon message à Paul contient un conseil à l’impératif sans « du » : Nimm …! Geh …!',
          'J’ai proposé une autre date et terminé par une formule de salutation.',
        ],
      },
    },
  },

  add: [
    {
      after: 'a2-gesundheit-aussprache',
      activity: {
        id: 'a2-gesundheit-repeter',
        kind: 'exercise',
        title: 'Répéter à voix haute : chez le médecin',
        estimatedMinutes: 8,
        competences: ['expression-orale'],
        lesson: {
          title: 'Répéter à voix haute : chez le médecin',
          description: 'Écoutez chaque modèle, puis dites la phrase à voix haute, comme au cabinet ou au téléphone. Soignez le z [ts], le sch et le ü. Si la reconnaissance vocale ne comprend pas votre phrase, réécoutez le modèle et réessayez.',
          transcript: null,
        },
        placements: [],
        questions: [
          { id: 'q1', type: 'speak', prompt: 'Écoutez, puis dites à la médecin où vous avez mal.',
            text: 'Mir tut der Hals sehr weh.', accept: ['Mir tut der Hals sehr weh.'], threshold: 75,
            explanation: 'Mir, au datif, ouvre la phrase et le verbe tut suit. Le h de Hals s’aspire, et weh se prononce avec un e long : [veː].' },
          { id: 'q2', type: 'speak', prompt: 'Écoutez, puis dites depuis quand vous avez de la fièvre.',
            text: 'Ich habe seit zwei Tagen Fieber.', accept: ['Ich habe seit zwei Tagen Fieber.', 'Ich habe seit 2 Tagen Fieber.'], threshold: 75,
            explanation: 'Seit + datif pluriel : seit zwei Tagen, avec le -n du datif. Dans zwei, le z se prononce [ts] et le w [v].' },
          { id: 'q3', type: 'speak', prompt: 'Écoutez, puis demandez un rendez-vous pour le jour même.',
            text: 'Kann ich heute noch kommen?', accept: ['Kann ich heute noch kommen?'], threshold: 75,
            explanation: 'Question fermée : le verbe de modalité kann ouvre la phrase et l’infinitif kommen la termine. Le eu de heute se prononce « oï ».' },
          { id: 'q4', type: 'speak', prompt: 'Écoutez, puis demandez un arrêt de travail.',
            text: 'Brauche ich eine Krankschreibung?', accept: ['Brauche ich eine Krankschreibung?'], threshold: 75,
            explanation: 'Krankschreibung se prononce d’un bloc, avec l’accent sur KRANK. Le sch se dit comme le « ch » de « chat ».' },
          { id: 'q5', type: 'speak', prompt: 'Écoutez, puis répétez le conseil du pharmacien.',
            text: 'Trinken Sie viel Wasser und machen Sie Pausen.', accept: ['Trinken Sie viel Wasser und machen Sie Pausen.'], threshold: 75,
            explanation: 'Impératif de politesse : le verbe en tête, puis Sie, deux fois. Viel se prononce [fiːl] : le v allemand se dit comme un f.' },
          { id: 'q6', type: 'speak', prompt: 'Écoutez, puis souhaitez un bon rétablissement à un ami.',
            text: 'Gute Besserung! Bleib heute im Bett.', accept: ['Gute Besserung! Bleib heute im Bett.'], threshold: 75,
            explanation: 'On souhaite « Gute Besserung! » à une personne malade. Bleib est l’impératif de bleiben pour du : ni pronom ni terminaison -st. Accentuez BES-serung.' },
        ],
      },
    },
  ],
};
