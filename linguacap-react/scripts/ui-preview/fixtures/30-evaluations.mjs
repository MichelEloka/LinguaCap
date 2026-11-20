// Évaluations : examen blanc en cours (lecture, écoute avec son, écrit, oral), copie remise en attente de correction,
// résultat « À consolider » avec scores par compétence et historique, premier accès au bilan, file et grille de correction.
import { day, mediaUrl } from './00-core.mjs';

const option = (labels) => labels.map((label, index) => ({ id: 'abcd'[index], label }));
const media = Object.fromEntries(['a1-essen-lesen-bild', 'a1-essen-dialog-audio', 'a1-essen-apfel-bild', 'a1-essen-banane-bild', 'a1-essen-trauben-bild',
  'a1-essen-fruehstueck-foto', 'a1-essen-sprechen-audio'].map((key) => [`${key}@1`, mediaUrl(key)]));
const placement = (assetId, usage, extra = {}) => ({ assetId, assetVersion: 1, usage, alt: null, caption: null, decorative: false, questionId: null, optionId: null, ...extra });

const finalParts = [
  { id: 'lecture', competence: 'lecture', mode: 'closed', title: 'Lire un message', criteria: [],
    instructions: 'Lisez le message de Lena, puis répondez aux questions.\n\nHallo Paula,\nich bin heute im Café am Markt. Ich möchte einen Kaffee und eine Brezel.\nKommst du auch? Wir sind um drei Uhr da.\nLiebe Grüße, Lena',
    placements: [placement('a1-essen-lesen-bild', 'illustration', { alt: 'La carte du Café am Markt : petit-déjeuner, plat du jour, gâteaux et boissons.', caption: 'Die Speisekarte vom Café am Markt' })],
    questions: [
      { id: 'q1', prompt: 'Où est Lena aujourd’hui ?', options: option(['Au café', 'À la gare', 'Au supermarché']) },
      { id: 'q2', prompt: 'Que veut-elle commander ?', options: option(['Un thé et un gâteau', 'Un café et un bretzel', 'Une soupe']) },
      { id: 'q3', prompt: 'À quelle heure Paula peut-elle venir ?', options: option(['À deux heures', 'À trois heures', 'À quatre heures']) },
    ] },
  { id: 'ecoute', competence: 'ecoute', mode: 'closed', title: 'Écouter une commande', criteria: [],
    instructions: 'Écoutez le dialogue au café. Vous pouvez l’écouter deux fois, puis répondez.',
    placements: [placement('a1-essen-dialog-audio', 'audio', { caption: 'Im Café' }),
      placement('a1-essen-apfel-bild', 'illustration', { questionId: 'q5', optionId: 'a', alt: 'Une pomme.' }),
      placement('a1-essen-banane-bild', 'illustration', { questionId: 'q5', optionId: 'b', alt: 'Une banane.' }),
      placement('a1-essen-trauben-bild', 'illustration', { questionId: 'q5', optionId: 'c', alt: 'Une grappe de raisin.' })],
    questions: [
      { id: 'q4', prompt: 'Que commande Paula ?', options: option(['Einen Cappuccino', 'Einen Orangensaft', 'Ein Mineralwasser']) },
      { id: 'q5', prompt: 'Quel fruit Emre choisit-il pour le dessert ?', options: option(['der Apfel', 'die Banane', 'die Trauben']) },
    ] },
  { id: 'ecrit', competence: 'expression-ecrite', mode: 'written', title: 'Écrire une invitation', questions: [], placements: [],
    instructions: 'Vous invitez votre amie Lena à dîner samedi. Écrivez-lui un message de 40 à 60 mots.\nPrécisez :\n• le jour et l’heure\n• le plat que vous préparez\n• ce qu’elle peut apporter',
    criteria: [{ id: 'consigne', label: 'Respect de la consigne', maxPoints: 4 }, { id: 'vocabulaire', label: 'Vocabulaire', maxPoints: 3 },
      { id: 'grammaire', label: 'Grammaire et orthographe', maxPoints: 3 }] },
  { id: 'oral', competence: 'expression-orale', mode: 'oral', title: 'Commander à l’oral', questions: [],
    instructions: 'Vous êtes au café avec une amie. Commandez une boisson et quelque chose à manger, puis demandez l’addition. Parlez environ une minute.\nPhrase modèle : Ich hätte gern einen Tee und ein Stück Kuchen, bitte.',
    placements: [placement('a1-essen-fruehstueck-foto', 'illustration', { alt: 'Une table de petit-déjeuner avec du pain, des croissants, du café et des fruits.', caption: 'Frühstück im Café' })],
    criteria: [{ id: 'aisance', label: 'Aisance et clarté', maxPoints: 5 }, { id: 'prononciation', label: 'Prononciation', maxPoints: 5 },
      { id: 'adaptation', label: 'Adaptation à la situation', maxPoints: 5 }] },
];
const midtermParts = [finalParts[0], { ...finalParts[2], title: 'Se présenter par écrit', instructions: 'Présentez-vous en 30 à 50 mots : prénom, âge, ville, ce que vous aimez manger.' }];

const definition = (kind, level = 'A1') => kind === 'final'
  ? { title: `Examen blanc ${level}`, description: 'Lecture, écoute, écrit et oral : la répétition générale avant l’examen.', passPercent: 60, levelCode: level, parts: finalParts }
  : { title: `Bilan intermédiaire ${level}`, description: 'Un point d’étape sur les modules déjà travaillés.', passPercent: 60, levelCode: level, parts: midtermParts };

const view = (id, extra = {}) => ({
  id, enrollmentId: 'e1', learnerId: 'u-l1', kind: 'final', number: 1, status: 'in_progress', definition: definition('final'),
  answers: {}, texts: {}, recordings: [], media, closedScores: null, dueAt: day(3), startedAt: day(-1, 10), submittedAt: null, onTime: true,
  canGrade: false, result: null, ...extra,
});
const summary = (exam) => ({
  id: exam.id, kind: exam.kind, number: exam.number, status: exam.status, title: exam.definition.title, startedAt: exam.startedAt,
  submittedAt: exam.submittedAt, dueAt: exam.dueAt, gradedAt: exam.result?.gradedAt ?? null, onTime: exam.onTime,
  percent: exam.result?.percent ?? null, decision: exam.result?.decision ?? null,
});
const score = (points, max) => ({ points, max, percent: Math.round((points / max) * 100) });
const lenaText = 'Hallo Lena,\nam Samstag koche ich Spaghetti mit Tomatensoße. Kommst du um sieben Uhr zu mir?\nKannst du bitte einen Salat oder Brot mitbringen?\n\nBis Samstag!\nPaula';
const recording = (partId) => ({ partId, productionId: `prod-${partId}`, mimeType: 'audio/mpeg', url: mediaUrl('a1-essen-sprechen-audio') });
const answered = { lecture: { q1: 'a', q2: 'b', q3: 'b' }, ecoute: { q4: 'a', q5: 'c' } };
const graded = (id, number, percent, decision, extra = {}) => view(id, {
  number, status: 'graded', answers: answered, texts: { ecrit: lenaText }, recordings: [recording('oral')], startedAt: day(-12 + number * 4, 10),
  submittedAt: day(-11 + number * 4, 17), dueAt: day(-10 + number * 4), closedScores: { lecture: score(3, 3), ecoute: score(1, 2) },
  result: { percent, decision, gradedAt: day(-10 + number * 4, 9), ...extra },
});

const exams = {
  // Nouvelle tentative en cours après un premier résultat à consolider (même situation que la recette navigateur).
  'f-retry-2': view('f-retry-2', { enrollmentId: 'e-retry', number: 2, answers: { lecture: { q1: 'a', q2: 'b' } },
    texts: { ecrit: 'Hallo Lena,\nam Samstag koche ich Spaghetti. Kommst du um sieben Uhr zu mir?' } }),
  'f-retry-1': graded('f-retry-1', 1, 52, 'to_consolidate', { scores: { lecture: score(3, 3), ecoute: score(1, 2), 'expression-ecrite': score(4, 10), 'expression-orale': score(6, 15) },
    review: null, feedback: null, comments: {} }),
  // Résultat corrigé « À consolider » avec deux tentatives.
  'f-e1-2': graded('f-e1-2', 2, 58, 'to_consolidate', {
    scores: { lecture: score(3, 3), ecoute: score(1, 2), 'expression-ecrite': score(6, 10), 'expression-orale': score(7, 15) },
    feedback: 'Belle progression depuis la première tentative : la lecture est solide et votre message écrit répond bien à la consigne.\nÀ l’oral, prenez le temps de formuler des phrases complètes : « Ich hätte gern … », « Ich möchte … ». Réécoutez aussi les dialogues du module pour les nombres.',
    comments: { ecrit: 'Message clair et bien organisé. Attention à la place du verbe après « am Samstag ».', oral: 'Bonne prononciation des voyelles. Pensez à « bitte » et « danke », et demandez l’addition avec « Die Rechnung, bitte ».' },
    review: [{ activityId: 's2-b', title: 'Les nombres de 1 à 100', moduleTitle: 'Zahlen · Les nombres' },
      { activityId: 's3-a', title: 'Commander au café', moduleTitle: 'Essen und Trinken · Manger et boire' },
      { activityId: 'hors-planning', title: 'Les formules de politesse', moduleTitle: 'Hallo! · Se saluer' }] }),
  'f-e1-1': graded('f-e1-1', 1, 44, 'to_consolidate', { scores: {}, review: null, feedback: null, comments: {} }),
  // Validé dans LinguaCap.
  'f-ok': graded('f-ok', 1, 78, 'validated', { scores: { lecture: score(3, 3), ecoute: score(2, 2), 'expression-ecrite': score(8, 10), 'expression-orale': score(11, 15) },
    feedback: 'Très bon examen blanc : vous êtes prête pour la suite du parcours.', comments: {}, review: [] }),
  // Copie remise, en attente de correction.
  'f-sent': view('f-sent', { enrollmentId: 'e-remise', status: 'submitted', answers: answered, texts: { ecrit: lenaText }, recordings: [recording('oral')],
    submittedAt: day(0, 9), closedScores: { lecture: score(3, 3), ecoute: score(1, 2) } }),
  // Copies de la file des corrections (élèves du professeur).
  x1: view('x1', { learnerId: 'u-l2', kind: 'midterm', definition: definition('midterm', 'A2'), status: 'submitted', canGrade: true, answers: { lecture: { q1: 'a', q2: 'b', q3: 'a' } },
    texts: { ecrit: 'Ich heiße Yanis und ich bin 24 Jahre alt. Ich wohne in Lyon. Ich esse gern Pizza und Obst, aber ich mag keinen Fisch.' },
    submittedAt: day(-1, 16), dueAt: day(1), closedScores: { lecture: score(2, 3) } }),
  x2: view('x2', { learnerId: 'u-l4', definition: definition('final', 'A2'), status: 'submitted', canGrade: true, answers: answered, texts: { ecrit: lenaText },
    recordings: [recording('oral')], submittedAt: day(-2, 11), dueAt: day(-3), onTime: false, closedScores: { lecture: score(3, 3), ecoute: score(1, 2) } }),
};
exams['x-done'] = { ...exams['f-e1-2'], id: 'x-done', learnerId: 'u-l3', canGrade: false };

const lists = {
  'e-retry': ['f-retry-2', 'f-retry-1'], e1: ['f-e1-2', 'f-e1-1'], 'e-valide': ['f-ok'], 'e-remise': ['f-sent'], 'e-nouveau': [],
};

export const screens = [
  { name: 'eval-en-cours', role: 'learner', path: '/espace/evaluation/e-retry/final' },
  { name: 'eval-oral-fichier', role: 'learner', path: '/espace/evaluation/e-retry/final', async setup(page) {
    await page.locator('input[type="file"]').setInputFiles({ name: 'ma-commande.mp3', mimeType: 'audio/mpeg', buffer: Buffer.from('ID3') });
  } },
  { name: 'eval-remise-confirmation', role: 'learner', path: '/espace/evaluation/e-retry/final', async setup(page) {
    await page.getByRole('button', { name: 'Remettre ma tentative' }).click();
    await page.evaluate(() => window.scrollTo(0, 0));
  } },
  { name: 'eval-remise', role: 'learner', path: '/espace/evaluation/e-remise/final' },
  { name: 'eval-resultat', role: 'learner', path: '/espace/evaluation/e1/final' },
  { name: 'eval-valide', role: 'learner', path: '/espace/evaluation/e-valide/final' },
  { name: 'eval-commencer', role: 'learner', path: '/espace/evaluation/e-nouveau/midterm' },
  { name: 'correction-copie', role: 'teacher', path: '/espace/corrections/x2', async setup(page) {
    await page.getByRole('tab', { name: 'Écrit' }).click();
    for (const [label, times] of [['Respect de la consigne', 3], ['Vocabulaire', 2]]) {
      for (let count = 0; count < times; count += 1) await page.getByRole('button', { name: `Ajouter un point · ${label}` }).click();
    }
    await page.evaluate(() => window.scrollTo(0, 0));
  } },
  { name: 'correction-oral', role: 'teacher', path: '/espace/corrections/x2', async setup(page) {
    await page.getByRole('tab', { name: 'Oral' }).click();
    await page.evaluate(() => window.scrollTo(0, 0));
  } },
  { name: 'correction-synthese', role: 'teacher', path: '/espace/corrections/x1', async setup(page) {
    await page.getByRole('tab', { name: 'Synthèse' }).click();
    await page.evaluate(() => window.scrollTo(0, 0));
  } },
  { name: 'correction-corrigee', role: 'teacher', path: '/espace/corrections/x-done' },
];

export function api(role, method, rawPath, body) {
  const [path, query = ''] = rawPath.split('?');
  if (path === '/assessments/exams' && method === 'GET') {
    const enrollmentId = new URLSearchParams(query).get('enrollmentId') ?? '';
    return (lists[enrollmentId] ?? []).map((id) => summary(exams[id]));
  }
  if (path === '/assessments/exams' && method === 'POST') {
    return view('f-new', { enrollmentId: body?.enrollmentId ?? 'e1', kind: body?.kind ?? 'final', definition: definition(body?.kind ?? 'final'), startedAt: new Date().toISOString() });
  }
  const match = path.match(/^\/assessments\/exams\/([^/]+)(\/.*)?$/);
  if (!match) return undefined;
  const exam = exams[match[1]] ?? view(match[1]);
  const rest = match[2] ?? '';
  if (!rest && method === 'GET') return exam;
  if (rest === '/answers' && method === 'PUT') return { ...exam, answers: body?.answers ?? exam.answers, texts: body?.texts ?? exam.texts };
  if (rest === '/submit') return { ...exam, status: 'submitted', submittedAt: new Date().toISOString() };
  if (rest === '/recordings' && method === 'POST') return { id: 'r1', uploadUrl: null, maxBytes: 25 * 1024 * 1024 };
  if (/^\/recordings\/[^/]+\/finalize$/.test(rest)) return { ...exam, recordings: [recording('oral')] };
  if (rest === '/grading' && method === 'POST') {
    return { ...exam, status: 'graded', canGrade: false, result: { ...exams['f-e1-2'].result, feedback: body?.feedback ?? null, gradedAt: new Date().toISOString() } };
  }
  return undefined;
}
