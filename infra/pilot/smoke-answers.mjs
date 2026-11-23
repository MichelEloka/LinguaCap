// Réponses de la recette V4 : construites à partir du contenu (qui porte le corrigé) et de la vue servie à l'élève
// (identifiants opaques des jetons et des éléments à associer). Les répétitions orales passent par POST /assessments/speech
// avec le texte attendu : le serveur recalcule le score, comme pour le texte reconnu par le navigateur.
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';

/** Clés de corrigé qui ne doivent jamais apparaître dans une question servie à l'élève (séance, bibliothèque). */
export const ANSWER_KEYS = ['correct', 'accept', 'answers', 'pairs', 'explanation', 'feedback', 'spec'];

/** Chemins des clés de corrigé trouvées dans une valeur (à appliquer aux questions servies) : doit être vide. */
export function leaks(value, path = '') {
  if (Array.isArray(value)) return value.flatMap((item, index) => leaks(item, `${path}[${index}]`));
  if (!value || typeof value !== 'object') return [];
  return Object.entries(value).flatMap(([key, item]) => [
    ...(ANSWER_KEYS.includes(key) ? [`${path}.${key}`] : []), ...leaks(item, `${path}.${key}`),
  ]);
}

export const questionType = (question) => question.type ?? 'choice';
export const isTyped = (activity) => (activity.questions ?? []).some((question) => questionType(question) !== 'choice');
/** Champ d'une question de contenu : format plat des fichiers (V4) ou `spec` du document de version. */
const field = (question, name) => question[name] ?? question.spec?.[name];
/** Texte qui réussit une répétition orale. */
export const speakText = (question) => (field(question, 'accept') ?? [])[0] ?? field(question, 'text');

/** Identifiant d'un élément de la vue par son texte, chaque élément n'étant pris qu'une fois (jetons répétés). */
function picker(items, label) {
  const free = [...items];
  return (text) => {
    const index = free.findIndex((item) => item.text === text);
    assert.ok(index >= 0, `${label} : « ${text} » absent de la vue servie`);
    return free.splice(index, 1)[0].id;
  };
}

/** Bonne réponse d'une question (sauf `speak`, qui demande un essai de répétition). */
export function rightAnswer(source, view) {
  switch (questionType(source)) {
    case 'fill':
      return { blanks: Object.fromEntries(field(source, 'blanks').map((blank) => [blank.id, blank.accept[0]])) };
    case 'order': {
      const take = picker(view.tokens, `Jetons de ${source.id}`);
      return { order: field(source, 'answers')[0].map(take) };
    }
    case 'match': {
      const left = picker(view.left, `Gauche de ${source.id}`);
      const right = picker(view.right, `Droite de ${source.id}`);
      return { pairs: Object.fromEntries(field(source, 'pairs').map((pair) => [left(pair.left), right(pair.right)])) };
    }
    case 'dictation':
      return { text: field(source, 'accept')[0] };
    case 'choice':
      return { choice: source.options.find((option) => option.correct).id };
    default:
      throw new Error(`Type de question sans réponse directe : ${questionType(source)} (${source.id})`);
  }
}

/**
 * Réponses de toute une activité, dans une manche (`roundId`) : justes par défaut. `fail` : répétitions à manquer trois
 * fois (la question passe « à revoir ») ; `record` : répétitions envoyées en enregistrement au professeur, avec
 * `upload(reservation)` qui dépose le fichier. `api` est le client de la recette : api(path, token, { method, body, status }).
 */
export async function answerActivity({ api, token, content, view, lessonId, roundId = randomUUID(), sessionId, activityId,
  fail = [], record = [], upload }) {
  const answers = {};
  const attempts = {};
  const context = { lessonId, roundId, ...(sessionId ? { sessionId, activityId } : {}) };
  for (const question of view.questions) {
    const source = content.questions.find((item) => item.id === question.id);
    assert.ok(source, `Question ${question.id} connue du contenu`);
    assert.equal(questionType(question), questionType(source), `Type servi pour ${question.id}`);
    if (questionType(source) !== 'speak') {
      answers[question.id] = rightAnswer(source, question);
      continue;
    }
    let attempt;
    if (record.includes(question.id)) {
      const reserved = await api('/assessments/speech/recordings', token, { method: 'POST', status: 201,
        body: { ...context, questionId: question.id, mimeType: 'audio/webm', size: 2_048 } });
      assert.equal(reserved.attempt.reviewStatus, 'uploading');
      if (upload) await upload(reserved.upload);
      attempt = await api(`/assessments/speech/${reserved.attempt.id}/recordings/${reserved.upload.id}/finalize`, token, { method: 'POST', body: {} });
      assert.equal(attempt.reviewStatus, 'pending', 'L’enregistrement attend le professeur');
    } else if (fail.includes(question.id)) {
      for (let index = 0; index < 3; index++) {
        attempt = await api('/assessments/speech', token, { method: 'POST',
          body: { ...context, questionId: question.id, transcripts: ['Das habe ich leider ganz falsch gesagt'] } });
        assert.equal(attempt.passed, false, 'Le texte reconnu ne correspond pas');
      }
      assert.deepEqual([attempt.failures, attempt.canSkip], [3, true], 'Trois échecs permettent de passer');
    } else {
      attempt = await api('/assessments/speech', token, { method: 'POST',
        body: { ...context, questionId: question.id, transcripts: [speakText(source)] } });
      assert.equal(attempt.passed, true, `Répétition ${question.id} réussie (${attempt.score} pour un seuil de ${attempt.threshold})`);
    }
    attempts[question.id] = attempt;
    answers[question.id] = { speechAttemptId: attempt.id };
  }
  return { answers, roundId, attempts };
}

/** Remet un exercice par POST /assessments/exercises (clé de remise unique). */
export function submitExercise({ api, token, lessonId, roundId, answers, sessionId, activityId, key = randomUUID() }) {
  return api('/assessments/exercises', token, { method: 'POST', headers: { 'Idempotency-Key': key },
    body: { lessonId, roundId, answers, ...(sessionId ? { sessionId, activityId } : {}) } });
}

/** Contrôle d'un corrigé entièrement juste : une explication par question, aucune question en attente ou à revoir. */
export function assertAllRight(result, label) {
  assert.equal(result.grade.correct, result.grade.total, `${label} : toutes les bonnes réponses sont reconnues`);
  assert.deepEqual([result.grade.pending, result.grade.flagged, result.grade.typed], [0, [], true], `${label} : rien en attente ni à revoir`);
  assert.equal(result.questions.length, result.grade.total, `${label} : une correction par question`);
  for (const question of result.questions) {
    assert.equal(question.status, 'correct', `${label} : ${question.id} juste`);
    assert.ok(question.explanation && question.explanation.length >= 10, `${label} : explication de ${question.id}`);
  }
}

const words = (text) => text.trim().split(/\s+/u).filter(Boolean).length;
/** Texte allemand de mission d'au moins `minWords` mots, sans dépasser `maxChars`. */
export function missionText(written) {
  const sentences = ['Guten Tag, ich heiße Alex Martin.', 'Ich komme aus Frankreich und wohne jetzt in Köln.',
    'Ich lerne Deutsch, weil ich hier arbeite.', 'Am Wochenende gehe ich gern mit Freunden ins Kino.', 'Viele Grüße!'];
  let text = '';
  for (let index = 0; words(text) < Math.max(written?.minWords ?? 0, 12); index++) text = `${text} ${sentences[index % sentences.length]}`.trim();
  assert.ok(text.length <= (written?.maxChars ?? 1500), 'Le texte de recette tient dans la limite');
  return text;
}

/**
 * Complète un brouillon de mission (texte, enregistrement de la partie orale, liste entièrement cochée) puis l'envoie,
 * deux fois avec la même clé (une seule remise). `upload(reservation)` dépose l'enregistrement. Renvoie la vue envoyée.
 */
export async function completeMission({ api, token, mission, upload, key = randomUUID() }) {
  assert.equal(mission.status, 'draft');
  const { written, oral, checklist } = mission.definition;
  await api(`/assessments/missions/${mission.id}`, token, { method: 'PUT',
    body: { ...(written ? { text: missionText(written) } : {}), checklist: checklist.map((_, index) => index) } });
  if (oral) {
    const reservation = await api(`/assessments/missions/${mission.id}/recordings`, token, { method: 'POST',
      body: { mimeType: 'audio/webm', size: 2_048 } });
    if (upload) await upload(reservation);
    const recorded = await api(`/assessments/missions/${mission.id}/recordings/${reservation.id}/finalize`, token, { method: 'POST', body: {} });
    assert.ok(recorded.recording, 'L’enregistrement est rattaché à la mission');
  }
  const submit = () => api(`/assessments/missions/${mission.id}/submit`, token, { method: 'POST', body: {}, headers: { 'Idempotency-Key': key } });
  const sent = await submit();
  assert.equal((await submit()).submittedAt, sent.submittedAt, 'La remise rejouée avec la même clé ne compte qu’une fois');
  return sent;
}

/** Ouvre une nouvelle mission (`open` : corps de POST /assessments/missions, réponse 201), la complète et l'envoie. */
export async function sendMission({ api, token, open, upload, key }) {
  const mission = await api('/assessments/missions', token, { method: 'POST', body: open, status: 201 });
  return completeMission({ api, token, mission, upload, key });
}
