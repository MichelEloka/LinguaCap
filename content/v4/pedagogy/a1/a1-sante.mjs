// Couche pédagogique V4 · A1 · Dire où l’on a mal et trouver de l’aide.
const REPEAT = 'Écoutez le modèle, puis dites la phrase à voix haute.';
const speak = (id, text, explanation, accept = [text]) => ({ id, type: 'speak', prompt: REPEAT, text, accept, explanation });
const DICTATION = 'Écoutez et écrivez la phrase.';
const dialogue = { media: 'a1-sante-dialogue', usage: 'audio', transcriptVisibility: 'after_answer', decorative: false };

export default {
  module: 'a1-sante',
  vocabulary: [
    { id: 'kopf', word: 'Kopf', article: 'der', plural: 'Köpfe', partOfSpeech: 'noun', translation: 'la tête', example: 'Mein Kopf tut weh.', note: null },
    { id: 'hals', word: 'Hals', article: 'der', plural: 'Hälse', partOfSpeech: 'noun', translation: 'la gorge ; le cou', example: 'Mein Hals tut weh.', note: null },
    { id: 'bauch', word: 'Bauch', article: 'der', plural: 'Bäuche', partOfSpeech: 'noun', translation: 'le ventre', example: 'Mein Bauch tut weh.', note: null },
    { id: 'schmerz', word: 'Schmerz', article: 'der', plural: 'Schmerzen', partOfSpeech: 'noun', translation: 'la douleur', example: 'Haben Sie Schmerzen?', note: 'surtout au pluriel : Ich habe Schmerzen.' },
    { id: 'kopfschmerzen', word: 'Kopfschmerzen', article: 'die', plural: null, partOfSpeech: 'noun', translation: 'le mal de tête', example: 'Ich habe Kopfschmerzen und Husten.', note: 'toujours au pluriel, sans article : Ich habe Kopfschmerzen.' },
    { id: 'halsschmerzen', word: 'Halsschmerzen', article: 'die', plural: null, partOfSpeech: 'noun', translation: 'le mal de gorge', example: 'Seit gestern habe ich Halsschmerzen.', note: 'toujours au pluriel ; de même : Bauchschmerzen' },
    { id: 'husten', word: 'Husten', article: 'der', plural: null, partOfSpeech: 'noun', translation: 'la toux', example: 'Ich habe Husten.', note: 'Ich habe Husten : je tousse.' },
    { id: 'tut-weh', word: 'tut weh', article: null, plural: null, partOfSpeech: 'expression', translation: '… fait mal', example: 'Mein Kopf tut weh.', note: 'verbe séparable weh|tun' },
    { id: 'krank', word: 'krank', article: null, plural: null, partOfSpeech: 'adjective', translation: 'malade', example: 'Ich bin krank.', note: null },
    { id: 'termin', word: 'Termin', article: 'der', plural: 'Termine', partOfSpeech: 'noun', translation: 'le rendez-vous', example: 'Ich möchte einen Termin, bitte.', note: null },
    { id: 'praxis', word: 'Praxis', article: 'die', plural: 'Praxen', partOfSpeech: 'noun', translation: 'le cabinet (médical)', example: 'Die Praxis ist in der Marktstraße fünf.', note: null },
    { id: 'apotheke', word: 'Apotheke', article: 'die', plural: 'Apotheken', partOfSpeech: 'noun', translation: 'la pharmacie', example: 'Wo ist die nächste Apotheke?', note: null },
    { id: 'arzt', word: 'Arzt', article: 'der', plural: 'Ärzte', partOfSpeech: 'noun', translation: 'le médecin', example: 'Ich gehe heute zum Arzt.', note: 'féminin : die Ärztin, die Ärztinnen' },
    { id: 'seit', word: 'seit', article: null, plural: null, partOfSpeech: 'preposition', translation: 'depuis', example: 'Ich habe seit gestern Husten.', note: '+ datif ; avec le présent, comme en français' },
    { id: 'gestern', word: 'gestern', article: null, plural: null, partOfSpeech: 'adverb', translation: 'hier', example: 'Seit gestern Abend habe ich Halsschmerzen.', note: null },
    { id: 'morgen', word: 'morgen', article: null, plural: null, partOfSpeech: 'adverb', translation: 'demain', example: 'Morgen rufe ich in der Praxis an.', note: 'heute Morgen : ce matin' },
    { id: 'anrufen', word: 'anrufen', article: null, plural: null, partOfSpeech: 'verb', translation: 'téléphoner, appeler', example: 'Ich möchte in der Praxis anrufen.', note: 'séparable : an|rufen ; ich rufe … an' },
    { id: 'helfen', word: 'helfen', article: null, plural: null, partOfSpeech: 'verb', translation: 'aider', example: 'Können Sie mir bitte helfen?', note: '+ datif : mir, Ihnen' },
    { id: 'offen', word: 'offen', article: null, plural: null, partOfSpeech: 'adjective', translation: 'ouvert', example: 'Ist die Apotheke noch offen?', note: 'contraire : geschlossen' },
    { id: 'das-passt', word: 'Das passt.', article: null, plural: null, partOfSpeech: 'expression', translation: 'Ça me convient.', example: 'Heute um elf Uhr? Ja, das passt.', note: null },
  ],
  activities: {
    'a1-sante-guide': {
      title: 'Découvrir : dire où l’on a mal',
      estimatedMinutes: 15,
      lesson: {
        title: 'Découvrir : dire où l’on a mal',
        description: `DIRE QU’ON NE VA PAS BIEN · 15 MIN

1. Lire un message (4 min). Mina écrit à Ivo : « Hallo, Ivo. Ich bin heute nicht im Kurs. Ich habe Kopfschmerzen und Husten. Morgen rufe ich in der Praxis an. Bis bald! Mina ». À la première lecture, trouvez la raison du message. À la seconde, repérez ce que Mina ressent, le jour où elle manque le cours (heute) et le jour où elle téléphonera au cabinet (morgen).

2. Nommer une douleur (4 min). « Ich habe Kopfschmerzen » signifie « j’ai mal à la tête ». On peut aussi dire « Mein Kopf tut weh ». Le mot en -schmerzen se forme avec la partie du corps :
• der Kopf → Kopfschmerzen — Mein Kopf tut weh.
• der Hals → Halsschmerzen — Mein Hals tut weh.
• der Bauch → Bauchschmerzen — Mein Bauch tut weh.
Pour dire que vous toussez : « Ich habe Husten ». Kopfschmerzen est un pluriel qui s’emploie sans article : Ich habe Kopfschmerzen.

3. Dire depuis quand (4 min). « Seit wann? » signifie « depuis quand ? ». Comme en français, on répond au présent : « Ich habe seit gestern Halsschmerzen ». Si « seit gestern » ouvre la phrase, le verbe reste en deuxième position et le sujet passe après : « Seit gestern habe ich Halsschmerzen ». Retenez : seit heute Morgen (depuis ce matin), seit gestern (depuis hier), seit gestern Abend (depuis hier soir), seit Montag (depuis lundi). Sans seit, « morgen » veut dire « demain ».

4. Écouter les modèles (3 min). Écoutez les cinq phrases du modèle audio et répétez-les pendant les pauses. Dites ensuite à voix haute deux phrases sur un personnage inventé : ce qu’il a et depuis quand.`,
      },
    },
    'a1-sante-pratique': {
      title: 'Comprendre : prendre rendez-vous au téléphone',
      estimatedMinutes: 12,
      lesson: {
        title: 'Comprendre : prendre rendez-vous au téléphone',
        description: `AU TÉLÉPHONE AVEC LE CABINET · 12 MIN

PHRASES UTILES
• Ich möchte einen Termin, bitte. — Je voudrais un rendez-vous, s’il vous plaît.
• Haben Sie Schmerzen? — Avez-vous mal ?
• Seit wann haben Sie Halsschmerzen? — Depuis quand avez-vous mal à la gorge ?
• Können Sie heute um neun Uhr kommen? — Pouvez-vous venir aujourd’hui à neuf heures ?
• Um neun Uhr kann ich leider nicht. Geht es später? — À neuf heures, je ne peux malheureusement pas. C’est possible plus tard ?
• Können Sie die Uhrzeit bitte wiederholen? — Pouvez-vous répéter l’heure, s’il vous plaît ?
• Das passt, danke! — Ça me convient, merci !

À VOUS
1. Écoutez l’appel sans lire la transcription : pourquoi la personne téléphone-t-elle ?
2. Réécoutez et repérez cinq informations : le symptôme, depuis quand, l’horaire proposé d’abord, l’horaire retenu et l’adresse du cabinet.
3. Affichez la transcription. Repérez l’horaire refusé (um neun Uhr) et la reprise finale, qui confirme tout : « Heute um elf Uhr, Marktstraße fünf ».
4. Lisez à voix haute le rôle du patient, puis redites-le avec d’autres données : mal au ventre depuis ce matin, rendez-vous demain à neuf heures.`,
      },
    },
    'a1-sante-approfondir': {
      title: 'Comprendre : trouver une pharmacie ou un cabinet',
      estimatedMinutes: 12,
      competences: ['lecture', 'expression-orale'],
      lesson: {
        title: 'Comprendre : trouver une pharmacie ou un cabinet',
        description: `PHARMACIE OU CABINET ? · 12 MIN

1. Distinguer deux lieux (3 min). Lisez les deux panneaux : « Linden-Apotheke. Bahnhofstraße 8. Heute geöffnet: 8–18 Uhr. » et « Praxis am Park. Gartenstraße 12. Eingang neben dem Café. Termine nach Vereinbarung. ». Repérez la pharmacie (die Apotheke), le cabinet médical (die Praxis), l’adresse de chacun et l’entrée du cabinet. « Termine nach Vereinbarung » signifie « sur rendez-vous ».

2. Demander de l’aide (3 min). Lisez chaque question avec sa réponse :
• Können Sie mir bitte helfen? — Ja, natürlich.
• Wo ist die nächste Apotheke? — In der Bahnhofstraße, Nummer acht.
• Ist die Apotheke noch offen? — Ja, bis achtzehn Uhr.
Redites ensuite l’échange à voix haute avec une autre rue et un autre numéro.

3. Confirmer le rendez-vous (3 min). La Praxis am Park propose « Mittwoch, 9 Uhr oder Donnerstag, 15 Uhr ». Vous êtes en cours mercredi matin : le seul créneau possible est jeudi. On confirme ainsi : « Guten Tag, der Termin am Donnerstag um fünfzehn Uhr passt. Ist der Eingang neben dem Café? Vielen Dank. » Le jour prend am, l’heure prend um.

4. Attention aux nombres (3 min). Un ami a compris « Gartenstraße 21 » au lieu de 12. Dites les deux nombres à voix haute : zwölf (12) et einundzwanzig (21). Dans einundzwanzig, l’unité vient avant la dizaine : « un et vingt ». Dites ensuite l’adresse exacte du cabinet et l’endroit de l’entrée.`,
      },
    },
    'a1-sante-controle': {
      title: 'Vérifier : un rendez-vous chez le médecin',
      estimatedMinutes: 10,
      lesson: {
        title: 'Vérifier : un rendez-vous chez le médecin',
        description: 'Écoutez l’appel une première fois pour la situation générale. Lisez les questions, puis réécoutez pour les détails : symptômes, durée, horaire et adresse. Les deux dernières questions vérifient les phrases à réemployer. La transcription s’affiche après votre réponse.',
      },
      explanations: {
        q1: 'La personne dit tout de suite « Ich möchte einen Termin, bitte » : der Termin est le rendez-vous. Il n’est question ni d’un cours ni d’un numéro de téléphone.',
        q2: 'Elle répond « Ich habe Halsschmerzen und Husten » : der Hals est la gorge, der Husten la toux. Kopfschmerzen (la tête) et Bauchschmerzen (le ventre) ne sont pas dits.',
        q3: 'À la question « Seit wann haben Sie Halsschmerzen? », elle répond « Seit gestern Abend » : depuis hier soir. « Heute Morgen » voudrait dire « ce matin ».',
        q4: 'Le premier horaire, « um neun Uhr », est refusé (« kann ich leider nicht »). La réception propose « heute um elf Uhr » et la personne confirme : « Das passt ».',
        q5: 'La réception dit « Die Praxis ist in der Marktstraße fünf » et le patient le répète. Fünf (5) n’est pas fünfzehn (15) ; la Gartenstraße est l’adresse d’un autre cabinet.',
        q6: '« Seit heute Morgen » veut dire « depuis ce matin » et Bauchschmerzen « mal au ventre ». Sans seit, « morgen » signifie « demain » ; Kopfschmerzen désigne le mal de tête.',
        q7: 'Jeudi se dit Donnerstag, avec am pour le jour et um pour l’heure. 15 h se dit fünfzehn Uhr ; fünf Uhr serait 5 h, et Mittwoch est mercredi.',
      },
    },
    'a1-sante-mission': {
      kind: 'mission',
      title: 'Mission : déplacer un rendez-vous',
      estimatedMinutes: 20,
      competences: ['expression-orale', 'expression-ecrite'],
      lesson: {
        title: 'Mission : déplacer un rendez-vous',
        description: `Vous avez mal à la gorge et vous avez rendez-vous à la Praxis am Park mercredi à neuf heures. Mais vous avez cours ce matin-là. Vous appelez le cabinet pour déplacer le rendez-vous, puis vous confirmez par écrit.

MODÈLE : L’APPEL
– Praxis am Park, guten Tag.
– Guten Tag, hier ist Sami Keller. Ich habe seit Montag Halsschmerzen. Ich habe am Mittwoch um neun Uhr einen Termin, aber um neun Uhr kann ich leider nicht. Geht es am Donnerstag?
– Ja, am Donnerstag um fünfzehn Uhr.
– Am Donnerstag um fünfzehn Uhr. Das passt, danke!

MODÈLE : LE MESSAGE
Guten Tag, ich habe seit Montag Halsschmerzen. Der Termin am Mittwoch um neun Uhr passt leider nicht. Der neue Termin am Donnerstag um fünfzehn Uhr passt. Vielen Dank! Sami Keller`,
      },
      mission: {
        oral: {
          prompt: 'Enregistrez votre rôle dans l’appel au cabinet : présentez-vous, dites ce que vous avez et depuis quand, expliquez que l’ancien créneau ne vous convient pas, demandez un autre jour, puis répétez le nouveau jour et la nouvelle heure pour confirmer.',
          maxSeconds: 90,
        },
        written: {
          prompt: 'Écrivez le message au cabinet pour déplacer le rendez-vous : une salutation, votre symptôme et depuis quand, l’ancien créneau (jour et heure), le nouveau créneau, une formule de politesse et votre nom.',
          maxChars: 600,
          minWords: 25,
        },
        checklist: [
          'J’ai dit ce que j’ai (Ich habe … / Mein … tut weh) et depuis quand, avec seit.',
          'J’ai nommé l’ancien et le nouveau rendez-vous, chacun avec am + jour et um + heure.',
          'Quand une phrase commence par seit … ou am …, le verbe est en deuxième position.',
          'On distingue sans hésiter l’heure du rendez-vous et le numéro de la rue.',
          'Mon message se termine par une formule de politesse et mon nom.',
        ],
      },
    },
  },
  add: [
    {
      after: 'a1-sante-approfondir',
      activity: {
        id: 'a1-sante-entrainer',
        kind: 'exercise',
        title: 'S’entraîner : symptômes, seit et rendez-vous',
        estimatedMinutes: 10,
        competences: ['ecoute', 'expression-ecrite'],
        lesson: {
          title: 'S’entraîner : symptômes, seit et rendez-vous',
          description: 'Réécoutez l’appel au cabinet et complétez la fiche de la réception. Entraînez-vous ensuite à dire depuis quand on a mal et à fixer un rendez-vous (am + jour, um + heure). Les deux dernières questions sont des dictées. La transcription de l’appel s’affiche après votre réponse.',
          transcript: null,
        },
        placements: [dialogue],
        questions: [
          {
            id: 'q1', type: 'fill', prompt: 'Écoutez l’appel et complétez la fiche : pourquoi le patient appelle-t-il ?',
            text: 'Der Patient hat [[1]] und Husten, seit gestern [[2]].',
            blanks: [{ id: '1', accept: ['Halsschmerzen'], size: 14, hint: null }, { id: '2', accept: ['Abend'], size: 8, hint: null }],
            explanation: 'Le patient dit « Ich habe Halsschmerzen und Husten », puis « Seit gestern Abend » : il a mal à la gorge depuis hier soir. Halsschmerzen s’écrit en un seul mot, avec deux s.',
          },
          {
            id: 'q2', type: 'fill', prompt: 'Complétez le rendez-vous finalement retenu.',
            text: 'Termin: heute um [[1]] Uhr, Marktstraße [[2]].',
            blanks: [{ id: '1', accept: ['elf', '11'], size: 6, hint: null }, { id: '2', accept: ['fünf', '5'], size: 6, hint: null }],
            explanation: 'Neuf heures est refusé ; la réception propose « heute um elf Uhr » et le patient le répète avec l’adresse : « Marktstraße fünf ».',
          },
          {
            id: 'q3', type: 'match', prompt: 'Associez chaque phrase française à son équivalent allemand.',
            pairs: [
              { left: 'J’ai mal à la tête.', right: 'Mein Kopf tut weh.' },
              { left: 'J’ai mal à la gorge.', right: 'Ich habe Halsschmerzen.' },
              { left: 'J’ai mal au ventre.', right: 'Mein Bauch tut weh.' },
              { left: 'Je tousse.', right: 'Ich habe Husten.' },
            ],
            explanation: 'Deux tournures disent la douleur : Ich habe …schmerzen ou Mein … tut weh (der Kopf, der Hals, der Bauch). Pour la toux, on dit Ich habe Husten.',
          },
          {
            id: 'q4', type: 'order', prompt: 'Remettez les mots dans l’ordre en commençant par « Seit gestern ».',
            answers: [['Seit gestern', 'habe', 'ich', 'Halsschmerzen']],
            explanation: 'Seit gestern occupe la 1re place : le verbe habe reste en 2e position et le sujet ich passe après. Comme en français, la douleur qui dure encore se dit au présent.',
          },
          {
            id: 'q5', type: 'fill', prompt: 'Complétez le message : « Je ne suis pas en cours aujourd’hui. Je tousse depuis hier. »',
            text: 'Ich bin [[1]] nicht im Kurs. Ich habe [[2]] gestern Husten.',
            blanks: [{ id: '1', accept: ['heute'], size: 7, hint: 'aujourd’hui' }, { id: '2', accept: ['seit'], size: 6, hint: 'depuis' }],
            explanation: 'Heute veut dire « aujourd’hui » et seit « depuis » : Ich habe seit gestern Husten. Le piège est d’employer morgen, qui signifie « demain ».',
          },
          {
            id: 'q6', type: 'fill', prompt: 'Vous ne pouvez pas venir mercredi. Complétez avec am ou um.',
            text: '[[1]] Mittwoch kann ich leider nicht. Geht es am Donnerstag [[2]] fünfzehn Uhr?',
            blanks: [{ id: '1', accept: ['Am'], size: 4, hint: null }, { id: '2', accept: ['um'], size: 4, hint: null }],
            explanation: 'On dit am devant un jour (am Mittwoch, am Donnerstag) et um devant une heure (um fünfzehn Uhr). Quand am Mittwoch ouvre la phrase, kann reste en 2e position.',
          },
          {
            id: 'q7', type: 'dictation', prompt: DICTATION, voice: 'mann',
            accept: ['Mein Hals tut seit Montag weh.'],
            explanation: 'Weh se place à la fin : Mein Hals tut seit Montag weh. Hals et Montag sont des noms, avec une majuscule ; seit Montag dit depuis quand.',
          },
          {
            id: 'q8', type: 'dictation', prompt: DICTATION, voice: 'mann',
            accept: ['Wo ist die nächste Apotheke?'],
            explanation: 'Nächste prend un tréma (ä) et Apotheke s’écrit avec th, prononcé comme un simple t. C’est la question à poser pour trouver la pharmacie la plus proche.',
          },
        ],
      },
    },
    {
      after: 'a1-sante-entrainer',
      activity: {
        id: 'a1-sante-repeter',
        kind: 'exercise',
        title: 'Répéter à voix haute : dire où l’on a mal',
        estimatedMinutes: 8,
        competences: ['expression-orale'],
        lesson: {
          title: 'Répéter à voix haute : dire où l’on a mal',
          description: 'Écoutez chaque modèle autant de fois que nécessaire, puis dites la phrase sans vous presser. Articulez chaque mot : la reconnaissance vocale compare votre phrase au modèle.',
          transcript: null,
        },
        placements: [],
        questions: [
          speak('q1', 'Ich habe Kopfschmerzen und Husten.', 'Dans Kopfschmerzen, prononcez bien pf puis sch : Kopf-schmer-zen. Le h de Husten se souffle, comme dans habe.'),
          speak('q2', 'Mein Bauch tut weh.', 'Après au, le ch de Bauch se forme au fond de la bouche (ach-Laut). Weh se prononce avec un e long : « vé ».'),
          speak('q3', 'Seit gestern habe ich Halsschmerzen.', 'Seit commence par le son « z » et ei se dit « aï ». Après seit gestern, le verbe habe vient avant ich.'),
          speak('q4', 'Ich möchte einen Termin, bitte.', 'Termin : accent sur la 2e syllabe, ter-MIN. Ich et möchte ont le même souffle doux du ich-Laut.'),
          speak('q5', 'Um neun Uhr kann ich leider nicht.', 'Neun se dit « noïn » et leider « laïder ». C’est la phrase pour refuser poliment un horaire.', ['Um neun Uhr kann ich leider nicht.', 'Um 9 Uhr kann ich leider nicht.']),
          speak('q6', 'Wo ist die nächste Apotheke?', 'Le w de wo se prononce comme un v français. Dans nächste, le ä se dit « è » et ch est un souffle doux.'),
        ],
      },
    },
  ],
  order: ['a1-sante-guide', 'a1-sante-pratique', 'a1-sante-approfondir', 'a1-sante-entrainer', 'a1-sante-repeter', 'a1-sante-controle', 'a1-sante-mission'],
};
