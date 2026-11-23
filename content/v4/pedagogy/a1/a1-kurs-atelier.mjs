// Couche pédagogique V4 · A1 · Atelier : trouver sa salle et préparer son matériel.
const REPEAT = 'Écoutez le modèle, puis dites la phrase à voix haute.';
const speak = (id, text, explanation, accept = [text]) => ({ id, type: 'speak', prompt: REPEAT, text, accept, explanation });
const dialogue = { media: 'a1-kurs-atelier-dialogue', usage: 'audio', transcriptVisibility: 'after_answer', decorative: false };

export default {
  module: 'a1-kurs-atelier',
  vocabulary: [
    { id: 'deutschkurs', word: 'Deutschkurs', article: 'der', plural: 'Deutschkurse', partOfSpeech: 'noun', translation: 'le cours d’allemand', example: 'Der Deutschkurs ist am Dienstag.', note: null },
    { id: 'raum', word: 'Raum', article: 'der', plural: 'Räume', partOfSpeech: 'noun', translation: 'la salle', example: 'Der Kurs ist in Raum zwanzig.', note: 'in Raum 20 : sans article devant le numéro' },
    { id: 'stift', word: 'Stift', article: 'der', plural: 'Stifte', partOfSpeech: 'noun', translation: 'le stylo, le crayon', example: 'Hast du einen Stift?', note: null },
    { id: 'heft', word: 'Heft', article: 'das', plural: 'Hefte', partOfSpeech: 'noun', translation: 'le cahier', example: 'Ich habe nur ein Heft.', note: null },
    { id: 'tasche', word: 'Tasche', article: 'die', plural: 'Taschen', partOfSpeech: 'noun', translation: 'le sac', example: 'Mein Buch ist in der Tasche.', note: null },
    { id: 'dienstag', word: 'Dienstag', article: 'der', plural: 'Dienstage', partOfSpeech: 'noun', translation: 'le mardi', example: 'Bis Dienstag!', note: 'am Dienstag : mardi, ce mardi-là' },
    { id: 'beginnen', word: 'beginnen', article: null, plural: null, partOfSpeech: 'verb', translation: 'commencer', example: 'Die Kurse beginnen um neun Uhr.', note: 'er beginnt' },
    { id: 'mitbringen', word: 'mitbringen', article: null, plural: null, partOfSpeech: 'verb', translation: 'apporter', example: 'Bitte ein Heft mitbringen.', note: 'séparable : mit|bringen ; Bring bitte ein Heft mit!' },
    { id: 'brauchen', word: 'brauchen', article: null, plural: null, partOfSpeech: 'verb', translation: 'avoir besoin de', example: 'Wir brauchen ein Buch.', note: '+ accusatif : Ich brauche einen Stift.' },
    { id: 'wann', word: 'wann', article: null, plural: null, partOfSpeech: 'adverb', translation: 'quand', example: 'Wann ist der Deutschkurs?', note: null },
    { id: 'um-neun-uhr', word: 'um neun Uhr', article: null, plural: null, partOfSpeech: 'expression', translation: 'à neuf heures', example: 'Der Kurs beginnt um neun Uhr.', note: 'um + heure : um zehn Uhr, um halb neun' },
    { id: 'am-mittwoch', word: 'am Mittwoch', article: null, plural: null, partOfSpeech: 'expression', translation: 'mercredi (ce jour-là), le mercredi', example: 'Der Kurs ist am Mittwoch in Raum sieben.', note: 'am (= an dem) + jour : am Montag, am Freitag' },
    { id: 'kein', word: 'kein', article: null, plural: null, partOfSpeech: 'other', translation: 'pas de, aucun', example: 'Hier ist kein Stift.', note: 'kein, keine ; keinen pour un masculin après haben' },
    { id: 'nur', word: 'nur', article: null, plural: null, partOfSpeech: 'adverb', translation: 'seulement', example: 'Ich habe nur ein Heft.', note: null },
  ],
  activities: {
    'a1-kurs-atelier-guide': {
      title: 'Découvrir : le jour, l’heure, la salle et le matériel',
      estimatedMinutes: 15,
      lesson: {
        title: 'Découvrir : le jour, l’heure, la salle et le matériel',
        description: `À LIRE AU TABLEAU · 15 MIN

1. Lire l’annonce (5 min). Au tableau, on lit : « Deutschkurs: Mittwoch, zehn Uhr, Raum sieben. Bitte ein Heft und einen Stift mitbringen. Am Freitag ist der Kurs in Raum neun. » Repérez le premier jour, l’heure, la salle et les deux objets à apporter. Quel renseignement change le vendredi ? (La salle : neuf au lieu de sept.)

2. Nommer le matériel (5 min). Lisez der Stift, die Tasche et das Heft avec leur article. Comparez « Das ist ein Stift », « Das ist eine Tasche » et « Das ist ein Heft ». Pour dire qu’un objet manque : « Hier ist kein Stift », « Hier ist keine Tasche ». Après haben, le masculin change : « Ich habe einen Stift », « Ich habe keinen Stift ».

3. Dire quand et où (5 min). « Wann? » demande un jour ou une heure, « Wo? » un lieu. On dit am + jour, um + heure, in + salle : « am Mittwoch », « um zehn Uhr », « in Raum sieben ». Dites les trois informations d’un trait : « Der Kurs ist am Mittwoch um zehn Uhr in Raum sieben. » Pour emprunter un stylo : « Hast du einen Stift? » — « Ja, hier ist ein Stift. » ou « Nein, ich habe keinen Stift. »`,
      },
    },
    'a1-kurs-atelier-pratique': {
      title: 'Comprendre : avant le cours',
      estimatedMinutes: 12,
      lesson: {
        title: 'Comprendre : avant le cours',
        description: `UNE QUESTION DE SALLE · 12 MIN

1. Première écoute (3 min). Écoutez la scène sans lire la transcription : de quoi parlent les deux personnes ?
2. Deuxième écoute (4 min). Repérez le jour, l’heure et la salle du cours. Attention : la première personne propose une salle, l’autre la corrige.
3. L’objet qui manque (2 min). Repérez l’objet que la première personne emprunte et celui qu’elle a déjà. Où est son livre ?
4. Relire et répéter (3 min). Ouvrez la transcription et lisez les deux rôles à voix haute. Redites ensuite la scène en changeant le jour, l’heure et la salle : « am Montag », « um zehn Uhr », « in Raum acht ».`,
      },
    },
    'a1-kurs-atelier-controle': {
      title: 'Vérifier : le cours et le matériel',
      estimatedMinutes: 10,
      lesson: {
        title: 'Vérifier : le cours et le matériel',
        description: 'Écoutez la scène une première fois pour la situation, puis lisez les questions et réécoutez pour les détails. Les deux dernières questions portent sur l’article d’un nom et sur la façon d’annoncer un cours. La transcription s’affiche après votre réponse.',
      },
      explanations: {
        q1: 'On entend « Wann ist der Deutschkurs? – Am Dienstag. » : Dienstag est le mardi. Jeudi se dirait Donnerstag et vendredi Freitag.',
        q2: '« Er beginnt um neun Uhr » : neun = 9. Zwölf (12) est un numéro de salle, cité dans la question qui suit.',
        q3: 'La première personne demande « Ist der Kurs in Raum zwölf? » et l’autre corrige : « Nein, er ist in Raum zwanzig. » Zwanzig = 20 ; zwölf = 12.',
        q4: '« Hast du einen Stift? Ich habe nur ein Heft. » : elle emprunte un stylo (der Stift). Elle a déjà un cahier, et son livre est dans son sac.',
        q5: 'On dit das Heft, ein Heft. Le genre allemand ne suit pas le français (« le cahier ») : on apprend chaque nom avec son article.',
        q6: 'Freitag = vendredi et zehn = 10 : am Freitag um zehn Uhr. La première phrase garde Dienstag (mardi), la deuxième dit zwölf (12 h).',
      },
    },
    'a1-kurs-atelier-mission': {
      kind: 'mission',
      title: 'Mission : annoncer un changement de salle',
      estimatedMinutes: 20,
      competences: ['expression-orale', 'expression-ecrite'],
      lesson: {
        title: 'Mission : annoncer un changement de salle',
        description: `Vous êtes responsable du groupe de votre cours d’allemand. Cette semaine, le cours change de salle. Vous prévenez le groupe par un message vocal, puis par écrit.

MODÈLE
Hallo! Der Deutschkurs ist am Montag um zehn Uhr. Er ist nicht in Raum zwölf, er ist in Raum acht. Bringt bitte ein Heft und einen Stift mit. Ich habe keinen Stift. Hat jemand einen Stift für mich? Bis Montag!`,
      },
      mission: {
        oral: {
          prompt: 'Enregistrez le message vocal pour le groupe : le jour, l’heure, l’ancienne salle et la nouvelle salle, puis deux objets à apporter. Terminez en demandant à emprunter un objet qui vous manque.',
          maxSeconds: 60,
        },
        written: {
          prompt: 'Écrivez le même message pour le groupe : le jour, l’heure, la nouvelle salle et deux objets à apporter. Ajoutez une phrase avec kein pour dire ce qui vous manque.',
          maxChars: 500,
          minWords: 20,
        },
        checklist: [
          'J’ai donné le jour avec am, l’heure avec um et la salle avec in Raum.',
          'J’ai distingué clairement l’ancienne salle et la nouvelle.',
          'J’ai nommé deux objets avec le bon article (ein Heft, einen Stift, eine Tasche).',
          'J’ai dit ce qui me manque avec kein (keinen Stift, kein Heft) ou demandé « Hat jemand …? ».',
          'Mon message écrit et mon message vocal donnent les mêmes informations.',
        ],
      },
    },
  },
  add: [
    {
      after: 'a1-kurs-atelier-pratique',
      activity: {
        id: 'a1-kurs-atelier-entrainer',
        kind: 'exercise',
        title: 'S’entraîner : quand, où et avec quel matériel',
        estimatedMinutes: 10,
        competences: ['ecoute', 'expression-ecrite'],
        lesson: {
          title: 'S’entraîner : quand, où et avec quel matériel',
          description: 'Réécoutez la scène pour compléter l’annonce du cours, puis travaillez ein, eine, einen, kein, keinen et l’ordre des mots. Les deux dernières questions sont des dictées. La transcription de la scène s’affiche après votre réponse.',
          transcript: null,
        },
        placements: [dialogue],
        questions: [
          {
            id: 'q1', type: 'fill', prompt: 'Écoutez la scène et complétez l’annonce du cours.',
            text: 'Deutschkurs: am [[1]], um [[2]] Uhr, in Raum [[3]].',
            blanks: [
              { id: '1', accept: ['Dienstag'], size: 10, hint: null },
              { id: '2', accept: ['neun', '9'], size: 6, hint: null },
              { id: '3', accept: ['zwanzig', '20'], size: 8, hint: null },
            ],
            explanation: 'On entend « Am Dienstag. Er beginnt um neun Uhr », puis « Nein, er ist in Raum zwanzig ». La salle zwölf (12) est une fausse piste, corrigée aussitôt.',
          },
          {
            id: 'q2', type: 'fill', prompt: 'Complétez avec ein, eine ou einen.',
            text: 'Das ist [[1]] Stift. Das ist [[2]] Tasche. Hast du [[3]] Stift?',
            blanks: [
              { id: '1', accept: ['ein'], size: 6, hint: null },
              { id: '2', accept: ['eine'], size: 6, hint: null },
              { id: '3', accept: ['einen'], size: 6, hint: null },
            ],
            explanation: 'Der Stift donne ein Stift, die Tasche donne eine Tasche. Après haben, le masculin prend -en : Hast du einen Stift? Le féminin et le neutre ne changent pas.',
          },
          {
            id: 'q3', type: 'fill', prompt: 'Complétez avec kein, keine ou keinen.',
            text: 'Hier ist [[1]] Heft. Und ich habe [[2]] Stift.',
            blanks: [{ id: '1', accept: ['kein'], size: 6, hint: null }, { id: '2', accept: ['keinen'], size: 7, hint: null }],
            explanation: 'Kein se comporte comme ein : das Heft → kein Heft. Après haben, le masculin der Stift devient keinen Stift. « Ich habe nicht einen Stift » ne se dit pas pour « je n’ai pas de stylo ».',
          },
          {
            id: 'q4', type: 'match', prompt: 'Associez chaque question à la bonne réponse.',
            pairs: [
              { left: 'Wann ist der Kurs?', right: 'Am Dienstag.' },
              { left: 'Um wie viel Uhr beginnt er?', right: 'Um neun Uhr.' },
              { left: 'Wo ist der Kurs?', right: 'In Raum zwanzig.' },
              { left: 'Hast du einen Stift?', right: 'Ja, hier ist ein Stift.' },
            ],
            explanation: 'Am introduit le jour, um l’heure, in le lieu. À une question oui/non comme Hast du …?, on répond par ja ou nein.',
          },
          {
            id: 'q5', type: 'order', prompt: 'Remettez les mots dans l’ordre. Commencez par « Am Freitag ».',
            answers: [['Am Freitag', 'ist', 'der Kurs', 'in Raum neun.']],
            explanation: 'Quand le jour ouvre la phrase, le verbe ist reste en 2e position et le sujet der Kurs passe après : Am Freitag ist der Kurs in Raum neun.',
          },
          {
            id: 'q6', type: 'dictation', prompt: 'Dictée : écoutez la phrase et écrivez-la.',
            accept: ['Der Kurs ist am Montag in Raum acht.', 'Der Kurs ist am Montag in Raum 8.'],
            voice: 'frau',
            explanation: 'Am Montag : am devant un jour ; in Raum acht : pas d’article devant le numéro de salle. Montag et Raum sont des noms, avec une majuscule.',
          },
          {
            id: 'q7', type: 'dictation', prompt: 'Dictée : écoutez la phrase et écrivez-la.',
            accept: ['Ich habe keinen Stift, nur ein Heft.'],
            voice: 'mann',
            explanation: 'Keinen Stift : der Stift est masculin et complément de haben, d’où -en. Ein Heft ne change pas (neutre). Nur veut dire « seulement ».',
          },
        ],
      },
    },
    {
      after: 'a1-kurs-atelier-entrainer',
      activity: {
        id: 'a1-kurs-atelier-repeter',
        kind: 'exercise',
        title: 'Répéter à voix haute : le cours et le matériel',
        estimatedMinutes: 8,
        competences: ['expression-orale'],
        lesson: {
          title: 'Répéter à voix haute : le cours et le matériel',
          description: 'Écoutez chaque modèle autant de fois que nécessaire, puis dites la phrase sans vous presser. La voix monte à la fin d’une question oui/non (Ist der Kurs …?) et descend après un mot en W (Wann …?).',
          transcript: null,
        },
        placements: [],
        questions: [
          speak('q1', 'Wann ist der Deutschkurs?', 'Wann commence par un son [v]. Dans Deutschkurs, eu se dit « oï » et sch « ch » ; l’accent tombe sur Deutsch.'),
          speak('q2', 'Der Kurs beginnt um neun Uhr.', 'Um se dit « oum ». Dans neun, eu se dit « oï ». Accentuez beginnt sur la deuxième syllabe : be-GINNT.', ['Der Kurs beginnt um neun Uhr.', 'Der Kurs beginnt um 9 Uhr.']),
          speak('q3', 'Ist der Kurs in Raum zwölf?', 'Zwölf commence par [ts] et contient un ö, lèvres arrondies. Dans Raum, au se dit « aou ». La voix monte à la fin.', ['Ist der Kurs in Raum zwölf?', 'Ist der Kurs in Raum 12?']),
          speak('q4', 'Hast du einen Stift?', 'Le h de hast se prononce. Stift commence par « cht » : st en début de mot se dit comme dans Straße.'),
          speak('q5', 'Nein, ich habe keinen Stift.', 'Keinen : ei se dit « aï » et on entend bien la fin -nen. Le ch de ich est un souffle doux.'),
          speak('q6', 'Mein Buch ist in der Tasche.', 'Buch : u se dit « ou » et ch se forme au fond de la gorge. Tasche : sch se dit « ch ».'),
        ],
      },
    },
  ],
  order: [
    'a1-kurs-atelier-guide', 'a1-kurs-atelier-pratique', 'a1-kurs-atelier-entrainer', 'a1-kurs-atelier-repeter',
    'a1-kurs-atelier-controle', 'a1-kurs-atelier-mission',
  ],
};
