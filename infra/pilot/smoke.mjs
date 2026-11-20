import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { randomBytes, randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { localQuery, localSql, localSupabase } from './local.mjs';

const local = localSupabase();
const suffix = randomBytes(6).toString('hex');
const password = randomBytes(24).toString('hex') + 'Aa1!';
const gateway = process.env.LINGUACAP_SMOKE_GATEWAY ?? 'http://127.0.0.1:8080';
assert.ok(['localhost', '127.0.0.1'].includes(new URL(gateway).hostname), 'Utiliser la recette locale.');

async function json(url, { method = 'GET', headers = {}, body, status = 200 } = {}) {
  const result = await fetch(url, {
    method, headers: { ...headers, ...(body === undefined ? {} : { 'Content-Type': 'application/json' }) },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(12_000),
  });
  if (result.status !== status) {
    const details = await result.json().catch(() => ({}));
    assert.equal(result.status, status, `${method} ${new URL(url).pathname} · ${details.code ?? details.error_code ?? ''} ${details.message ?? ''}`);
  }
  return result.json();
}

const api = (path, token, options = {}) => json(gateway + '/api/v1' + path, {
  ...options, headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers },
});
const post = (path, token, body = {}, status = 200) => api(path, token, { method: 'POST', body, status });
const put = (path, token, body, status = 200) => api(path, token, { method: 'PUT', body, status });
const auth = (path, options = {}) => json(local.api + '/auth/v1' + path, {
  ...options, headers: { apikey: local.publishable, ...options.headers },
});

async function login(email) {
  const session = await auth('/token?grant_type=password', { method: 'POST', body: { email, password } });
  assert.ok(session.access_token);
  return session.access_token;
}

async function createAccount(label, role, teacherId) {
  const email = `${label}-${suffix}@example.org`;
  const user = await auth('/admin/users', {
    method: 'POST', headers: {
      apikey: local.secret,
      ...(!local.secret.startsWith('sb_secret_') ? { Authorization: `Bearer ${local.secret}` } : {}),
    },
    body: { email, password, email_confirm: true },
  });
  localSql(local.container, `insert into identity.profiles(id,display_name,role,teacher_id)
    values ('${user.id}', 'Recette ${label}', '${role}', ${teacherId ? `'${teacherId}'` : 'null'});`);
  return { id: user.id, email, token: await login(email) };
}

async function createStaff(label, role) {
  const email = `${label}-${suffix}@example.org`;
  const user = await auth('/admin/users', {
    method: 'POST', headers: {
      apikey: local.secret,
      ...(!local.secret.startsWith('sb_secret_') ? { Authorization: `Bearer ${local.secret}` } : {}),
    },
    body: { email, password, email_confirm: true },
  });
  assert.match(user.id, /^[a-f0-9-]{36}$/i);
  localSql(local.container, `insert into identity.profiles(id,display_name,role)
    values ('${user.id}', 'Recette ${label}', '${role}');`);
  return { id: user.id, email, token: await login(email) };
}

async function inbox(email) {
  const messages = await json(local.mail + '/api/v1/messages');
  return messages.messages.filter((item) => item.To.some((address) => address.Address === email));
}

/** Ouvre le dernier lien d'invitation reçu et renvoie la session obtenue à l'activation. */
async function openInvitation(email) {
  let entry;
  for (let attempt = 0; attempt < 15 && !entry; attempt++) {
    entry = (await inbox(email))[0];
    if (!entry) await new Promise((resolve) => setTimeout(resolve, 250));
  }
  assert.ok(entry, 'Invitation reçue dans Mailpit');
  const mail = await json(local.mail + '/api/v1/message/' + encodeURIComponent(entry.ID));
  const link = (mail.HTML ?? '').match(/https?:[^"<>\s]+\/auth\/v1\/verify[^"<>\s]*/)?.[0]?.replaceAll('&amp;', '&');
  assert.ok(link, 'Lien d’activation Supabase présent');
  assert.equal(new URL(link).origin, local.api);
  const verified = await fetch(link, { redirect: 'manual', signal: AbortSignal.timeout(8_000) });
  assert.equal(verified.status, 303);
  const redirect = new URL(verified.headers.get('location'));
  assert.equal(redirect.origin, 'http://127.0.0.1:5186');
  assert.equal(redirect.pathname, '/activer-compte');
  const activationToken = new URLSearchParams(redirect.hash.slice(1)).get('access_token');
  assert.ok(activationToken, 'Session fournie à l’activation');
  return activationToken;
}

async function followInvitation(email) {
  const activationToken = await openInvitation(email);
  await auth('/user', { method: 'PUT', headers: { Authorization: `Bearer ${activationToken}` }, body: { password } });
  return login(email);
}

// --- Premier administrateur (DEV-012) -------------------------------------------------------------
assert.deepEqual(await api('/health'), { status: 'ok' });
await api('/me', null, { status: 401 });

const activeAdmins = Number(localQuery(local.container, "select count(*) from identity.profiles where role = 'admin' and status = 'active';"));
const bootstrapEmail = `admin-${suffix}@example.org`;
const bootstrap = spawnSync(process.execPath, [fileURLToPath(new URL('bootstrap-admin.mjs', import.meta.url)),
  '--local', '--email', bootstrapEmail, '--name', 'Administration de recette'], { encoding: 'utf8' });
let admin;
if (activeAdmins === 0) {
  assert.equal(bootstrap.status, 0, bootstrap.stderr);
  const token = await followInvitation(bootstrapEmail);
  const me = await api('/me', token);
  assert.equal(me.role, 'admin');
  admin = { id: me.id, email: bootstrapEmail, token };
} else {
  assert.notEqual(bootstrap.status, 0, 'Le premier administrateur ne peut être créé qu’une fois.');
  assert.match(bootstrap.stderr, /administrateur actif existe déjà/);
  admin = await createStaff('admin', 'admin');
}
const teacher = await createStaff('prof', 'teacher');
const otherTeacher = await createStaff('tiers', 'teacher');
assert.equal((await api('/me', admin.token)).role, 'admin');
const levels = await api('/levels', admin.token);
assert.ok(levels.some((level) => level.code === 'B1'));

// --- Parcours du pilote -------------------------------------------------------------------------------
const email = `eleve-${suffix}@example.org`;
const invite = await post('/invitations', teacher.token, { email, displayName: 'Élève de recette', role: 'learner' }, 201);
assert.equal(invite.teacherId, teacher.id);
assert.equal(invite.status, 'pending');
const learnerToken = await followInvitation(email);
const learner = await api('/me', learnerToken);
assert.equal(learner.role, 'learner');
assert.deepEqual(learner.permissions, []);
assert.match(learner.id, /^[a-f0-9-]{36}$/i);
await api('/learners/' + learner.id, otherTeacher.token, { status: 403 });

const lesson = await api('/lessons/commander-au-cafe', learnerToken);
assert.equal(lesson.level, 'A1');
assert.ok(lesson.questions.every((question) => question.options.every((option) => !('correct' in option))));
await api('/internal/lessons/commander-au-cafe/answer-key', learnerToken, { status: 404 });
for (const assetId of lesson.mediaIds) {
  await api('/media/' + assetId, learnerToken, { status: 403 });
}

const goal = {
  level: 'A1', pace: 'intensive', startDate: '2026-11-20', targetDate: '2026-12-20',
  studyDays: [1, 2, 3, 4, 5, 6, 7], sessionsPerDay: 2, minutesPerSession: 25,
};
await put('/learning/goal', learnerToken, goal);
const storedGoal = await api('/learning/goal', learnerToken);
assert.equal(storedGoal.sessionsPerDay, 2);
assert.equal(storedGoal.studyDays.length, 7);
const submission = {
  method: 'POST', headers: { 'Idempotency-Key': randomUUID() },
  body: { lessonId: lesson.id, answers: { 'cafe-question': 'cafe' } },
};
const grade = await api('/assessments/quiz', learnerToken, submission);
assert.equal(grade.correct, 1);
assert.equal((await api('/assessments/quiz', learnerToken, submission)).id, grade.id);
assert.equal((await api('/assessments/results', learnerToken)).filter((item) => item.id === grade.id).length, 1);
const overview = await api('/tracking/overview', teacher.token);
assert.ok(overview.learners.some((entry) => entry.learnerId === learner.id && entry.progress.completedCount === 1));
await api('/assessments/results?learnerId=' + learner.id, otherTeacher.token, { status: 403 });
assert.ok(!(await api('/tracking/overview', otherTeacher.token)).learners.length);

const message = await post('/tracking/messages', teacher.token, { learnerId: learner.id, text: 'Bravo pour cette première séance !' });
assert.ok((await api('/tracking/messages', learnerToken)).some((item) => item.id === message.id));
await api('/tracking/messages?learnerId=' + learner.id, otherTeacher.token, { status: 403 });
console.log('Recette du pilote réussie · invitation, Auth, cours SQL, médias privés, objectif, résultat, droits professeur et encouragement.');

// --- Invitations : liste, réémission sans doublon, annulation, expiration (DEV-018 à DEV-021, DEV-024) --
const teacherInvitations = await api('/invitations', teacher.token);
assert.equal(teacherInvitations.find((item) => item.email === email)?.status, 'accepted');
await api('/invitations', learnerToken, { status: 403 });
await post('/invitations', teacher.token, { email, displayName: 'Doublon', role: 'learner' }, 409);

// Supabase espace d'au moins une seconde deux e-mails vers la même adresse (auth.email.max_frequency).
const pause = () => new Promise((resolve) => setTimeout(resolve, 1_200));
const pendingEmail = `attente-${suffix}@example.org`;
const first = await post('/invitations', teacher.token, { email: pendingEmail, displayName: 'Élève en attente', role: 'learner' }, 201);
await pause();
const reissued = await post('/invitations', teacher.token, { email: pendingEmail, displayName: 'Élève en attente', role: 'learner' }, 201);
assert.equal(reissued.id, first.id, 'La réémission met à jour l’invitation existante');
assert.equal(reissued.sendCount, 2);
await pause();
const resent = await post(`/invitations/${first.id}/resend`, teacher.token);
assert.equal(resent.sendCount, 3);
assert.equal((await api('/invitations', teacher.token)).filter((item) => item.email === pendingEmail).length, 1);
assert.ok((await inbox(pendingEmail)).length >= 2, 'Chaque envoi produit un e-mail');
await post(`/invitations/${first.id}/resend`, otherTeacher.token, {}, 404);
await post(`/invitations/${first.id}/cancel`, otherTeacher.token, {}, 404);
assert.equal((await post(`/invitations/${first.id}/cancel`, teacher.token)).status, 'cancelled');
await post(`/invitations/${first.id}/resend`, teacher.token, {}, 409);
const cancelledSession = await openInvitation(pendingEmail);
const refused = await api('/me', cancelledSession, { status: 403 });
assert.match(refused.message, /annulée/);

const expiredEmail = `expire-${suffix}@example.org`;
const expiring = await post('/invitations', admin.token, {
  email: expiredEmail, displayName: 'Élève à relancer', role: 'learner', teacherId: teacher.id,
}, 201);
localSql(local.container, `update identity.invitations set expires_at = now() - interval '1 minute' where id = '${expiring.id}';`);
assert.equal((await api('/invitations', admin.token)).find((item) => item.id === expiring.id).status, 'expired');
assert.match((await api('/me', await openInvitation(expiredEmail), { status: 403 })).message, /expiré/);
// Le lien déjà ouvert a validé l'adresse : le renvoi passe par un lien de choix du mot de passe.
await pause();
assert.equal((await post(`/invitations/${expiring.id}/resend`, admin.token)).status, 'pending');
const relaunched = await api('/me', await followInvitation(expiredEmail));
assert.equal(relaunched.role, 'learner');

// --- Élève autonome et membre de l'équipe ---------------------------------------------------------------
const autonomousEmail = `autonome-${suffix}@example.org`;
const autonomousInvite = await post('/invitations', admin.token, { email: autonomousEmail, displayName: 'Élève autonome', role: 'learner' }, 201);
assert.equal(autonomousInvite.teacherId, null);
const autonomous = await api('/me', await followInvitation(autonomousEmail));
await post('/invitations', teacher.token, { email: `equipe-refus-${suffix}@example.org`, displayName: 'Refus', role: 'staff' }, 403);

const staffEmail = `equipe-${suffix}@example.org`;
await post('/invitations', admin.token, { email: staffEmail, displayName: 'Éditrice de recette', role: 'staff' }, 201);
const staffToken = await followInvitation(staffEmail);
const staff = await api('/me', staffToken);
assert.equal(staff.role, 'staff');
assert.deepEqual(staff.permissions, []);
await api('/media', staffToken, { status: 403 });
await api('/media', teacher.token, { status: 403 });
const granted = await put(`/admin/users/${staff.id}/permissions`, admin.token, { permissions: ['catalogue', 'correction'] });
assert.deepEqual(granted.user.permissions, ['catalogue', 'correction']);
assert.deepEqual((await api('/me', staffToken)).permissions, ['catalogue', 'correction']);
assert.ok((await api('/media', staffToken)).length >= 2, 'La permission Catalogue ouvre la médiathèque');
for (const forbidden of ['/tracking/overview', '/learners', '/invitations', '/learners/' + learner.id, '/admin/users']) {
  await api(forbidden, staffToken, { status: 403 });
}
await api(`/assessments/results?learnerId=${learner.id}`, staffToken, { status: 403 });

// --- Correcteur désigné et réaffectation (DEV-013, DEV-023) -------------------------------------------
const designated = await put(`/admin/users/${autonomous.id}/reviewer`, admin.token, { reviewerId: staff.id });
assert.equal(designated.user.reviewerId, staff.id);
assert.equal(designated.reviewerHistory.length, 1);
await put(`/admin/users/${learner.id}/reviewer`, admin.token, { reviewerId: staff.id }, 409);
await put(`/admin/users/${autonomous.id}/reviewer`, admin.token, { reviewerId: teacher.id }, 409);
const withoutCorrection = await put(`/admin/users/${staff.id}/permissions`, admin.token, { permissions: ['catalogue'] });
assert.deepEqual(withoutCorrection.user.permissions, ['catalogue']);
assert.equal((await api(`/admin/users/${autonomous.id}`, admin.token)).user.reviewerId, null,
  'Retirer la permission Correction met fin à la désignation');

const moved = await put(`/admin/users/${learner.id}/teacher`, admin.token, { teacherId: otherTeacher.id });
assert.equal(moved.user.teacherId, otherTeacher.id);
assert.equal(moved.teacherHistory.length, 2);
assert.equal(moved.teacherHistory[0].personId, otherTeacher.id);
assert.equal(moved.teacherHistory[0].endedAt, null);
assert.equal(moved.teacherHistory[0].assignedBy, admin.id);
assert.notEqual(moved.teacherHistory[1].endedAt, null);
assert.equal((await api('/learners/' + learner.id, otherTeacher.token)).id, learner.id);
await api('/learners/' + learner.id, teacher.token, { status: 403 });
await api('/assessments/results?learnerId=' + learner.id, teacher.token, { status: 403 });
assert.equal((await api('/assessments/results?learnerId=' + learner.id, otherTeacher.token)).length, 1,
  'L’historique pédagogique suit l’élève chez son nouveau professeur');
await put(`/admin/users/${learner.id}/teacher`, teacher.token, { teacherId: teacher.id }, 403);

// --- Désactivation et gestion des comptes (DEV-022) ---------------------------------------------------
await put(`/admin/users/${admin.id}/status`, admin.token, { status: 'disabled' }, 409);
await put(`/admin/users/${learner.id}/role`, admin.token, { role: 'staff' }, 409);
await put(`/admin/users/${otherTeacher.id}/role`, admin.token, { role: 'staff' }, 409);
assert.equal((await put(`/admin/users/${otherTeacher.id}/status`, admin.token, { status: 'disabled' })).user.status, 'disabled');
assert.match((await api('/me', otherTeacher.token, { status: 403 })).message, /désactivé/);
await api('/learners/' + learner.id, otherTeacher.token, { status: 403 });
await api('/tracking/overview', otherTeacher.token, { status: 403 });
assert.equal((await put(`/admin/users/${otherTeacher.id}/status`, admin.token, { status: 'active' })).user.status, 'active');
assert.equal((await api('/me', otherTeacher.token)).role, 'teacher');

const users = await api('/admin/users', admin.token);
const learnerRow = users.find((user) => user.id === learner.id);
assert.equal(learnerRow.email, email);
assert.equal(learnerRow.teacherName, 'Recette tiers');
assert.ok(learnerRow.activatedAt && learnerRow.lastSeenAt && learnerRow.invitedAt);
await api('/admin/users', teacher.token, { status: 403 });

// --- Parcours versionné, séances et progression (incrément 3) -----------------------------------------
const tracks = await api('/tracks', otherTeacher.token);
const a1 = tracks.find((track) => track.levelCode === 'A1');
const a2 = tracks.find((track) => track.levelCode === 'A2');
assert.ok(a1 && a2, 'Les parcours A1 et A2 publiés sont attribuables');
assert.equal(a1.activityCount, 2);
assert.equal(a1.totalMinutes, 15);
assert.equal(a2.prerequisiteLevelCode, 'A1');
const inDays = (days) => {
  const date = new Date(Date.now() + days * 86_400_000);
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Paris' }).format(date);
};
// Les parcours de recette démarrent demain : une séance du jour passerait « en retard » après 20 h à Paris.
const goalFor = (learnerId, extra = {}) => ({
  learnerId, trackVersionId: a1.versionId, startLevel: 'A0', template: 'intensive', startDate: inDays(1), ...extra,
});
const goalPath = (enrollmentId, suffix) => `/learning/enrollments/${enrollmentId}/${suffix}`;

// Le référent actuel de l'élève est le professeur « tiers » depuis la réaffectation.
await post('/learning/enrollments', teacher.token, goalFor(learner.id), 403);
await post('/learning/enrollments', staffToken, goalFor(learner.id), 403);
await post('/learning/enrollments', otherTeacher.token, goalFor(learner.id, { startDate: '2020-01-01' }), 400);
const enrolled = await post('/learning/enrollments', otherTeacher.token, goalFor(learner.id), 201);
assert.equal(enrolled.trackVersionNumber, 1);
assert.equal(enrolled.goal.status, 'preparing');
assert.equal(enrolled.goal.initialTargetDate, enrolled.goal.targetDate);
assert.equal(enrolled.sessions.length, 0, 'Les séances attendent la validation du planning');
assert.equal(enrolled.proposal.number, 1);
await post(goalPath(enrolled.id, 'proposal/validate'), learnerToken, { number: 1 }, 403);
const mainPlan = await post(goalPath(enrolled.id, 'proposal/validate'), otherTeacher.token, { number: 1 });
assert.equal(mainPlan.goal.status, 'active');
assert.deepEqual(mainPlan.sessions[0].activities.map((activity) => activity.id),
  ['commander-au-cafe', 'quiz-la-commande', 'revision-au-cafe']);
assert.equal(mainPlan.sessions[0].status, 'planned');
await post('/learning/enrollments', otherTeacher.token, goalFor(learner.id), 409);
assert.equal((await api('/learning/enrollment', learnerToken)).id, enrolled.id);

const autonomousToken = await login(autonomousEmail);
const autoEnrollment = await post('/learning/enrollments', admin.token, goalFor(autonomous.id), 201);
const autoPlan = await post(goalPath(autoEnrollment.id, 'proposal/validate'), autonomousToken, { number: autoEnrollment.proposal.number });
const autoSession = autoPlan.sessions[0].id;
const sessionPath = `/learning/sessions/${autoSession}`;
const progressPath = (activity) => `${sessionPath}/activities/${activity}/progress`;
await api(sessionPath, learnerToken, { status: 403 });
let detail = await api(sessionPath, autonomousToken);
const activityOf = (session, id) => session.activities.find((activity) => activity.id === id);
const lessonActivity = activityOf(detail, 'commander-au-cafe');
const exercise = activityOf(detail, 'quiz-la-commande');
assert.equal(lessonActivity.kind, 'lesson');
assert.equal(exercise.kind, 'exercise');
assert.equal(activityOf(detail, 'revision-au-cafe').kind, 'review');
const illustration = lessonActivity.placements.find((placement) => placement.usage === 'illustration');
assert.ok(illustration.alt.length > 10, 'Le visuel a son alternative textuelle');
assert.ok(lessonActivity.transcript, 'La transcription de la leçon est disponible à la demande');
assert.equal(exercise.transcript, null, 'La transcription de l’exercice attend la réponse');
assert.ok(exercise.questions.every((question) => question.options.every((option) => !('correct' in option))));
// Les supports arrivent avec la séance, avec une adresse temporaire renouvelée à chaque ouverture.
assert.equal(new URL(illustration.url).origin, local.api);
const pictureFile = await fetch(illustration.url, { signal: AbortSignal.timeout(8_000) });
assert.ok(pictureFile.ok);
assert.equal(pictureFile.headers.get('content-type')?.split(';')[0], illustration.mimeType);
assert.ok((await pictureFile.arrayBuffer()).byteLength > 100);
const audioPlacement = lessonActivity.placements.find((placement) => placement.usage === 'audio');
assert.ok((await fetch(audioPlacement.url, { signal: AbortSignal.timeout(8_000) })).ok, 'L’audio de la leçon est lisible');
await api(`/media/${illustration.assetId}/versions/${illustration.assetVersion}`, autonomousToken, { status: 403 });
// La signature est horodatée à la seconde : une nouvelle ouverture un peu plus tard en produit une autre.
await new Promise((resolve) => setTimeout(resolve, 1_100));
assert.notEqual((await api(sessionPath, autonomousToken)).activities[0].placements[0].url, illustration.url,
  'Rouvrir la séance renouvelle les adresses des supports');

await put(progressPath('quiz-la-commande'), autonomousToken, { state: { answers: { 'cafe-question': 'the' } } });
detail = await api(sessionPath, autonomousToken);
assert.equal(activityOf(detail, 'quiz-la-commande').state.answers['cafe-question'], 'the', 'La progression reprend après fermeture');
assert.equal(detail.session.status, 'in_progress');
const lessonDone = await put(progressPath('commander-au-cafe'), autonomousToken, { completed: true });
const lessonReplay = await put(progressPath('commander-au-cafe'), autonomousToken, { completed: true });
assert.ok(activityOf(lessonDone, 'commander-au-cafe').completedAt);
assert.equal(activityOf(lessonReplay, 'commander-au-cafe').completedAt, activityOf(lessonDone, 'commander-au-cafe').completedAt,
  'Une fin rejouée n’est pas recomptée');
await put(progressPath('quiz-la-commande'), autonomousToken, { completed: true }, 400);
await put(progressPath('commander-au-cafe'), learnerToken, { state: {} }, 404);
const looseGrade = await api('/assessments/quiz', autonomousToken, {
  method: 'POST', headers: { 'Idempotency-Key': randomUUID() },
  body: { lessonId: 'commander-au-cafe', answers: { 'cafe-question': 'cafe' } },
});
await put(progressPath('quiz-la-commande'), autonomousToken, { completed: true, attemptId: looseGrade.id }, 409);
const sessionGrade = await api('/assessments/quiz', autonomousToken, {
  method: 'POST', headers: { 'Idempotency-Key': randomUUID() },
  body: { lessonId: 'commander-au-cafe', answers: { 'cafe-question': 'cafe' }, sessionId: autoSession, activityId: 'quiz-la-commande' },
});
assert.equal(sessionGrade.sessionId, autoSession);
assert.equal(sessionGrade.activityId, 'quiz-la-commande');
const quizDone = await put(progressPath('quiz-la-commande'), autonomousToken, { completed: true, attemptId: sessionGrade.id });
assert.equal(quizDone.status, 'in_progress', 'La révision reste à faire');
assert.equal(activityOf(await put(progressPath('quiz-la-commande'), autonomousToken, { completed: true, attemptId: sessionGrade.id }),
  'quiz-la-commande').completedAt, activityOf(quizDone, 'quiz-la-commande').completedAt);
const finished = await put(progressPath('revision-au-cafe'), autonomousToken, { completed: true });
assert.equal(finished.status, 'completed');
assert.ok(finished.completedAt);
detail = await api(sessionPath, autonomousToken);
assert.ok(activityOf(detail, 'quiz-la-commande').transcript, 'La transcription de l’exercice est disponible après la réponse');
assert.equal(activityOf(detail, 'quiz-la-commande').attemptId, sessionGrade.id);

const autonomousSheet = await api(`/tracking/learners/${autonomous.id}`, admin.token);
assert.equal(autonomousSheet.enrollment.sessions[0].status, 'completed');
assert.ok(autonomousSheet.results.some((grade) => grade.id === sessionGrade.id));
await api(`/tracking/learners/${autonomous.id}`, teacher.token, { status: 403 });
await api(`/tracking/learners/${autonomous.id}`, staffToken, { status: 403 });
assert.equal((await api(`/tracking/learners/${learner.id}`, otherTeacher.token)).enrollment.sessions[0].status, 'planned');
console.log('Recette des séances réussie · parcours versionné, attribution, contenu et médias versionnés, reprise, '
  + 'fin idempotente, exercice corrigé et fiche professeur.');

// --- Planning personnalisé (incrément 4) ------------------------------------------------------------
const templates = await api('/learning/templates', learnerToken);
const intensive = templates.find((template) => template.id === 'intensive');
assert.equal(intensive.days.length, 7);
assert.ok(intensive.days.every((day) => day.sessions === 2 && day.minutes === 45));

const mainProposal = await api(goalPath(enrolled.id, 'proposal'), otherTeacher.token);
assert.equal(mainProposal.status, 'validated');
assert.ok(mainProposal.weeks.some((week) => week.availableMinutes === 630),
  'Deux séances de 45 minutes sept jours sur sept donnent 10 h 30 par semaine');
const firstDay = mainProposal.sessions.filter((session) => session.date === mainProposal.sessions[0].date);
assert.ok(firstDay.length >= 2 && firstDay[1].slot === 2, 'Plusieurs séances le même jour, chacune avec son échéance');
assert.ok(mainProposal.sessions.some((session) => session.items.some((item) => item.id === 'bilan-intermediaire')));
assert.ok(mainProposal.sessions.at(-1).items.some((item) => item.id === 'examen-blanc'), 'L’examen blanc ferme le planning');
assert.equal((await api('/tracking/overview', otherTeacher.token)).learners
  .find((entry) => entry.learnerId === learner.id).progress.enrollment.levelCode, 'A1');

// Créneaux insuffisants : débordement, ajustements chiffrés, validation refusée puis ajustement appliqué.
const autoId = autoEnrollment.id;
const tight = await put(goalPath(autoId, 'availability'), autonomousToken,
  { days: [{ weekday: 1, sessions: 1, minutes: 10 }], targetDate: inDays(3) });
assert.ok(tight.overflowCount > 0, 'Le programme déborde de la date cible');
assert.equal(tight.validatable, false);
assert.ok(tight.suggestions.length > 0, 'Des ajustements sont proposés');
await post(goalPath(autoId, 'proposal/validate'), autonomousToken, { number: tight.number }, 409);
const remedy = tight.suggestions.find((suggestion) => suggestion.kind === 'target_date') ?? tight.suggestions[0];
const adjusted = await put(goalPath(autoId, 'availability'), autonomousToken,
  { days: remedy.availability, targetDate: remedy.targetDate });
assert.equal(adjusted.overflowCount, 0, `L’ajustement « ${remedy.label} » fait tenir le programme`);
await post(goalPath(autoId, 'proposal/validate'), autonomousToken, { number: tight.number }, 409);

// Replanification après un retard : la séance en retard est remplacée, son retard reste dans l'historique.
const pending = (await api('/learning/enrollment', autonomousToken)).sessions.find((session) => session.status !== 'completed');
localSql(local.container, `update learning.sessions set due_at = now() - interval '1 day' where id = '${pending.id}';`);
assert.equal((await api('/learning/enrollment', autonomousToken)).sessions.find((session) => session.id === pending.id).status, 'late');
const replanned = await post(goalPath(autoId, 'proposal/validate'), autonomousToken, { number: adjusted.number });
assert.equal(replanned.goal.validatedRevision, adjusted.number);
assert.ok(replanned.supersededSessions >= 1);
assert.ok(replanned.sessions.some((session) => session.status === 'completed'), 'Les séances terminées sont conservées');
assert.ok(!replanned.sessions.some((session) => session.id === pending.id), 'La séance en retard est remplacée');
assert.ok(!replanned.sessions.filter((session) => session.status !== 'completed')
  .some((session) => session.activities.some((activity) => activity.id === 'commander-au-cafe')), 'Le travail fait n’est pas replanifié');
assert.equal(replanned.goal.initialTargetDate, autoEnrollment.goal.initialTargetDate, 'La date cible initiale est conservée');
assert.equal(replanned.goal.targetDate, remedy.targetDate);
assert.equal(localQuery(local.container,
  `select count(*) from learning.session_due_history where session_id = '${pending.id}' and was_late;`), '1');

// Pause et reprise à une nouvelle date.
const paused = await post(goalPath(autoId, 'pause'), autonomousToken, {});
assert.equal(paused.goal.status, 'paused');
const open = paused.sessions.find((session) => session.status !== 'completed');
await put(`/learning/sessions/${open.id}/activities/${open.activities[0].id}/progress`, autonomousToken, { state: {} }, 409);
await post(goalPath(enrolled.id, 'pause'), learnerToken, {}, 403);
const resumeDate = inDays(5);
const resumed = await post(goalPath(autoId, 'resume'), autonomousToken, { resumeDate, targetDate: inDays(45) });
assert.equal(resumed.startDate, resumeDate);
const reactivated = await post(goalPath(autoId, 'proposal/validate'), autonomousToken, { number: resumed.number });
assert.equal(reactivated.goal.status, 'active');
assert.ok(reactivated.sessions.filter((session) => session.status !== 'completed')
  .every((session) => session.dueAt.slice(0, 10) >= resumeDate), 'Les activités restantes reprennent à la nouvelle date');

// Diagnostic et prérequis A1 d'un parcours A2 accompagné : le professeur confirme le point de départ.
const learnerA2 = await createAccount('eleve-a2', 'learner', teacher.id);
const a2Goal = await post('/learning/enrollments', teacher.token,
  { learnerId: learnerA2.id, trackVersionId: a2.versionId, startLevel: 'A1', template: 'intensive' }, 201);
assert.equal(a2Goal.goal.prerequisiteLevel, 'A1');
assert.equal(a2Goal.goal.prerequisiteMet, false);
assert.equal(a2Goal.proposal.validatable, false);
await post(goalPath(a2Goal.id, 'proposal/validate'), teacher.token, { number: a2Goal.proposal.number }, 409);
await put(goalPath(a2Goal.id, 'starting-point'), teacher.token, { acquiredModules: [], prerequisiteMet: true }, 409);
const diagnostic = await api(goalPath(a2Goal.id, 'diagnostic'), learnerA2.token);
assert.equal(diagnostic.lessonId, 'diagnostic-a2');
assert.ok(diagnostic.questions.every((question) => question.options.every((option) => !('correct' in option))));
const diagGrade = await api('/assessments/diagnostics', learnerA2.token, {
  method: 'POST', headers: { 'Idempotency-Key': randomUUID() },
  body: { lessonId: 'diagnostic-a2', answers: { 'diag-prerequis': 'cafe', 'diag-journee': 'sept' } },
});
assert.equal(diagGrade.kind, 'diagnostic');
assert.deepEqual(diagGrade.moduleScores, { 'ma-journee': { correct: 1, total: 1 }, prerequis: { correct: 1, total: 1 } });
const afterDiag = await post(goalPath(a2Goal.id, 'diagnostic'), learnerA2.token, { attemptId: diagGrade.id });
assert.deepEqual(afterDiag.goal.diagnosticModules, ['ma-journee']);
assert.equal(afterDiag.goal.diagnosticPrerequisite, true);
assert.equal(afterDiag.goal.prerequisiteMet, false, 'Le professeur confirme le point de départ d’un élève accompagné');
await put(goalPath(a2Goal.id, 'starting-point'), learnerA2.token, { acquiredModules: ['ma-journee'], prerequisiteMet: true }, 403);
await put(goalPath(a2Goal.id, 'starting-point'), teacher.token, { acquiredModules: ['inconnu'] }, 400);
const confirmed = await put(goalPath(a2Goal.id, 'starting-point'), teacher.token, { acquiredModules: ['ma-journee'], prerequisiteMet: true });
assert.equal(confirmed.goal.prerequisiteMet, true);
assert.deepEqual(confirmed.goal.acquiredModules, ['ma-journee']);
const a2Proposal = await api(goalPath(a2Goal.id, 'proposal'), teacher.token);
const a2Items = a2Proposal.sessions.flatMap((session) => session.items.map((item) => item.id));
assert.ok(!a2Items.includes('raconter-sa-journee'), 'Les modules acquis ne sont pas replanifiés');
assert.ok(a2Items.includes('examen-blanc'));
assert.equal((await post(goalPath(a2Goal.id, 'proposal/validate'), teacher.token, { number: a2Proposal.number })).goal.status, 'active');

// Élève autonome : son diagnostic s'applique directement et il valide lui-même son planning.
const learnerAuto = await createAccount('autonome-a1', 'learner', null);
const a1Goal = await post('/learning/enrollments', admin.token,
  { learnerId: learnerAuto.id, trackVersionId: a1.versionId, startLevel: 'A0', template: 'standard' }, 201);
assert.equal(a1Goal.goal.template, 'standard');
const a1Diag = await api('/assessments/diagnostics', learnerAuto.token, {
  method: 'POST', headers: { 'Idempotency-Key': randomUUID() },
  body: { lessonId: 'diagnostic-a1', answers: { 'diag-cafe-1': 'cafe', 'diag-cafe-2': 'bitte' } },
});
await post(goalPath(a2Goal.id, 'diagnostic'), learnerA2.token, { attemptId: a1Diag.id }, 409);
const applied = await post(goalPath(a1Goal.id, 'diagnostic'), learnerAuto.token, { attemptId: a1Diag.id });
assert.deepEqual(applied.goal.acquiredModules, ['au-cafe'], 'Le diagnostic d’un élève autonome s’applique directement');
const a1Proposal = await api(goalPath(a1Goal.id, 'proposal'), learnerAuto.token);
assert.ok(!a1Proposal.sessions.some((session) => session.items.some((item) => item.id === 'commander-au-cafe')));
await post(goalPath(a1Goal.id, 'proposal/validate'), teacher.token, { number: a1Proposal.number }, 403);
assert.equal((await post(goalPath(a1Goal.id, 'proposal/validate'), learnerAuto.token, { number: a1Proposal.number })).goal.status, 'active');
console.log('Recette du planning réussie · modèles, charge hebdomadaire, débordement et ajustements, proposition périmée, '
  + 'replanification après retard, pause et reprise, diagnostic, prérequis A2 et validation par le référent ou l’élève autonome.');

// --- Médiathèque et catalogue éditable (incrément 5) ------------------------------------------------
const png = (base64) => Buffer.from(base64, 'base64');
const firstPicture = png('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==');
const secondPicture = png('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=');
const sendFile = (upload, bytes, type, token) => fetch(upload.uploadUrl, {
  method: 'POST', body: bytes, signal: AbortSignal.timeout(12_000),
  headers: { Authorization: `Bearer ${token}`, apikey: local.publishable, 'Content-Type': type, 'x-upsert': 'false' },
});
const pictureRequest = (extra = {}) => ({
  title: 'Bretzel de recette', mimeType: 'image/png', size: firstPicture.length, source: 'Recette LinguaCap', license: 'CC0 1.0',
  alt: 'Un bretzel doré sur une table en bois.', ...extra,
});
const objectCount = (upload) => Number(localQuery(local.container,
  `select count(*) from storage.objects where bucket_id = 'linguacap-course' and name like '%${upload.id}%';`));

// Dépôt réservé aux éditeurs du catalogue, avec les textes exigés selon le type et des tailles bornées.
await post('/media/uploads', learnerToken, pictureRequest(), 403);
await post('/media/uploads', teacher.token, pictureRequest(), 403);
await post('/media/uploads', staffToken, pictureRequest({ alt: '' }), 400);
await post('/media/uploads', staffToken, pictureRequest({ size: 6 * 1024 * 1024 }), 400);
await post('/media/uploads', staffToken, pictureRequest({ mimeType: 'video/mp4' }), 400);
await post('/media/uploads', staffToken, { ...pictureRequest(), mimeType: 'audio/mpeg', alt: null, transcript: '' }, 400);

// Dépôt valide : seul son auteur peut envoyer le fichier au chemin réservé, puis Médias contrôle le fichier reçu.
const reserved = await post('/media/uploads', staffToken, pictureRequest(), 201);
assert.equal(reserved.status, 'pending');
assert.equal(new URL(reserved.uploadUrl).origin, local.api);
assert.ok(!(await sendFile(reserved, firstPicture, 'image/png', teacher.token)).ok, 'Un autre compte ne peut pas déposer au chemin réservé');
assert.ok((await sendFile(reserved, firstPicture, 'image/png', staffToken)).ok, 'Le navigateur dépose directement dans le stockage');
const accepted = await post(`/media/uploads/${reserved.id}/finalize`, staffToken);
assert.equal(accepted.status, 'available');
assert.equal(accepted.version, 1);
assert.deepEqual(await post(`/media/uploads/${reserved.id}/finalize`, staffToken), accepted, 'La finalisation rejouée ne crée rien deux fois');
await post(`/media/uploads/${reserved.id}/finalize`, admin.token, {}, 404);
const assetId = accepted.assetId;
let library = await api('/media', staffToken);
const pictureAsset = library.find((asset) => asset.id === assetId);
assert.equal(pictureAsset.credit, 'Recette LinguaCap · CC0 1.0');
assert.deepEqual(pictureAsset.versions.map((version) => [version.version, version.status]), [[1, 'draft']]);
const draftFile = await api(`/media/${assetId}/versions/1`, staffToken);
assert.equal(draftFile.status, 'draft');
assert.deepEqual(Buffer.from(await (await fetch(draftFile.url)).arrayBuffer()), firstPicture);
await api(`/media/${assetId}/versions/1`, learnerToken, { status: 403 });
const renamed = await put(`/media/${assetId}`, staffToken, { title: 'Bretzel', source: 'Recette LinguaCap', license: 'CC0 1.0', alt: 'Un bretzel doré.', transcript: null });
assert.equal(renamed.title, 'Bretzel');

// Fichier refusé : le contenu ne correspond pas au type annoncé ; il est supprimé du stockage.
const disguised = Buffer.from('<html><script>alert(1)</script></html>');
const refusedUpload = await post('/media/uploads', staffToken, pictureRequest({ mimeType: 'image/jpeg', size: disguised.length }), 201);
assert.ok((await sendFile(refusedUpload, disguised, 'image/jpeg', staffToken)).ok);
assert.equal(objectCount(refusedUpload), 1);
const refusal = await api(`/media/uploads/${refusedUpload.id}/finalize`, staffToken, { method: 'POST', body: {}, status: 422 });
assert.equal(refusal.code, 'INVALID_FILE');
assert.match(refusal.message, /image JPEG/);
assert.equal(objectCount(refusedUpload), 0, 'Le fichier refusé est supprimé');
await post(`/media/uploads/${refusedUpload.id}/finalize`, staffToken, {}, 409);

// Dépôt interrompu : rien n'est reçu, la finalisation le signale ; après expiration il est abandonné.
const interrupted = await post('/media/uploads', staffToken, pictureRequest(), 201);
const notReceived = await api(`/media/uploads/${interrupted.id}/finalize`, staffToken, { method: 'POST', body: {}, status: 409 });
assert.match(notReceived.message, /pas été reçu/);
localSql(local.container, `update media.uploads set expires_at = now() - interval '1 minute' where id = '${interrupted.id}';`);
const recent = await api('/media/uploads', staffToken);
assert.equal(recent.find((upload) => upload.id === interrupted.id).status, 'abandoned');
assert.equal(recent.find((upload) => upload.id === refusedUpload.id).status, 'rejected');
assert.equal(recent.find((upload) => upload.id === reserved.id).status, 'available');
await post(`/media/uploads/${interrupted.id}/finalize`, staffToken, {}, 409);
console.log('Recette de la médiathèque réussie · dépôt direct, chemin réservé à l’auteur, contrôle du contenu, fichier refusé et supprimé, '
  + 'dépôt interrompu puis abandonné, aperçu des brouillons réservé aux éditeurs.');

// Niveau B1 de démonstration : ordre et prérequis, brouillon, contrôle de complétude, publication sans redéploiement.
await api('/catalogue/levels', teacher.token, { status: 403 });
await api('/catalogue/levels', learnerToken, { status: 403 });
await put('/catalogue/levels/a1', staffToken, { title: 'Allemand A1', description: '', position: 1, prerequisiteLevelId: 'a2' }, 400);
let catalogueLevels = await put('/catalogue/levels/b1', staffToken,
  { title: 'Allemand B1', description: 'Parcours de démonstration.', position: 3, prerequisiteLevelId: null });
let b1Level = catalogueLevels.find((level) => level.id === 'b1');
assert.equal(b1Level.prerequisiteLevelId, null);
const openDraft = b1Level.versions.find((version) => version.status === 'draft');
const b1Draft = openDraft ? await api(`/catalogue/versions/${openDraft.id}`, staffToken)
  : await post('/catalogue/levels/b1/versions', staffToken, {}, 201);
assert.equal(b1Draft.status, 'draft');
await post('/catalogue/levels/b1/versions', staffToken, {}, 409);
await api(`/catalogue/versions/${b1Draft.id}`, teacher.token, { status: 403 });
const picturePlacement = (version) => ({
  assetId, assetVersion: version, usage: 'illustration', alt: 'Un bretzel doré.', caption: 'die Brezel', transcriptVisibility: 'hidden',
  decorative: false, questionId: null, optionId: null,
});
const b1Content = (pictureVersion, objective = 'Commander une spécialité à la boulangerie.') => ({
  settings: { expectedCompetences: ['lecture', 'ecoute'], successCriteria: 'Réussir 60 % du bilan.', passPercent: 60,
    reviewMinutes: 10, midtermMinutes: 30, finalMinutes: 60 },
  diagnostic: null,
  modules: [{ id: 'baeckerei', title: 'À la boulangerie', objective, prerequisites: [], activities: [
    { id: 'b1-lecon', kind: 'lesson', title: 'Chez le boulanger', estimatedMinutes: 10, competences: ['lecture'],
      lesson: { title: 'Chez le boulanger', description: 'Ich hätte gern eine Brezel.', transcript: null }, questions: [],
      placements: [picturePlacement(pictureVersion)] },
    { id: 'b1-quiz', kind: 'exercise', title: 'Que demande-t-on ?', estimatedMinutes: 5, competences: ['lecture'],
      lesson: { title: 'Que demande-t-on ?', description: 'Choisissez la bonne réponse.', transcript: null },
      questions: [{ id: 'brezel', prompt: 'Que veut dire « eine Brezel » ?', moduleRef: null, options: [
        { id: 'a', label: 'Un bretzel', correct: true }, { id: 'b', label: 'Une baguette', correct: false }] }],
      placements: [{ ...picturePlacement(pictureVersion), questionId: 'brezel', optionId: 'a', caption: null }] },
  ] }],
  assessments: [{ kind: 'midterm', title: 'Bilan B1', description: '', parts: [
    { id: 'lecture', competence: 'lecture', mode: 'closed', title: 'Lecture', instructions: 'Lisez puis répondez.', criteria: [], placements: [],
      questions: [{ id: 'bilan-1', prompt: 'Brezel ?', moduleRef: null, options: [
        { id: 'a', label: 'Bretzel', correct: true }, { id: 'b', label: 'Pain', correct: false }] }] },
    { id: 'ecrit', competence: 'expression-ecrite', mode: 'written', title: 'Écrire', instructions: 'Commandez par écrit.',
      questions: [], placements: [], criteria: [{ id: 'clarte', label: 'La demande est claire', maxPoints: 5 }] },
  ] }],
});
const incomplete = await put(`/catalogue/versions/${b1Draft.id}`, staffToken, b1Content(1, ''));
assert.equal(incomplete.checks.publishable, false);
assert.deepEqual(incomplete.checks.issues.map((issue) => issue.path), ['modules[0].objective']);
await post(`/catalogue/versions/${b1Draft.id}/publish`, staffToken, {}, 409);
await put(`/catalogue/versions/${b1Draft.id}`, staffToken, { ...b1Content(1), modules: [{ ...b1Content(1).modules[0], id: 'Bad Id' }] }, 400);
const saved = await put(`/catalogue/versions/${b1Draft.id}`, staffToken, b1Content(1));
assert.equal(saved.checks.publishable, true, JSON.stringify(saved.checks.issues));
assert.equal(saved.version.assessments[0].parts[1].criteria[0].maxPoints, 5);
const draftLesson = `b1-v${b1Draft.number}-b1-lecon`;
await api(`/lessons/${draftLesson}`, learnerToken, { status: 404 });
assert.equal((await api(`/lessons/${draftLesson}`, staffToken)).title, 'Chez le boulanger');
const publishedB1 = await post(`/catalogue/versions/${b1Draft.id}/publish`, staffToken);
assert.equal(publishedB1.version.status, 'published');
assert.deepEqual(publishedB1.media, [{ assetId, version: 1 }]);
await put(`/catalogue/versions/${b1Draft.id}`, staffToken, b1Content(1), 409);
library = await api('/media', staffToken);
assert.equal(library.find((asset) => asset.id === assetId).versions[0].status, 'published', 'Les fichiers du parcours sont publiés avec lui');
const b1Track = (await api('/tracks', teacher.token)).find((track) => track.levelCode === 'B1');
assert.equal(b1Track.versionId, b1Draft.id, 'Le B1 publié est attribuable sans redéploiement');
assert.equal(b1Track.prerequisiteLevelCode, null);

// Un élève inscrit sur la version 1 garde ses fichiers quand le média est remplacé dans la version suivante.
const learnerB1 = await createAccount('eleve-b1', 'learner', teacher.id);
const enrollB1 = async (learnerId, trackVersionId) => {
  const goal = await post('/learning/enrollments', teacher.token,
    { learnerId, trackVersionId, startLevel: 'A2', template: 'intensive', startDate: inDays(1) }, 201);
  const plan = await post(goalPath(goal.id, 'proposal/validate'), teacher.token, { number: goal.proposal.number });
  return plan.sessions[0].id;
};
const firstSessionB1 = await enrollB1(learnerB1.id, b1Draft.id);
const placementsOf = async (sessionId, token) => (await api(`/learning/sessions/${sessionId}`, token)).activities
  .flatMap((activity) => activity.placements.map((placement) => ({ ...placement, activityId: activity.id })));
let oldPlacements = await placementsOf(firstSessionB1, learnerB1.token);
const lessonPicture = oldPlacements.find((placement) => placement.activityId === 'b1-lecon');
assert.equal(lessonPicture.assetVersion, 1);
assert.ok(lessonPicture.url.includes(reserved.id), 'La séance pointe vers le fichier de la version 1');
assert.deepEqual(Buffer.from(await (await fetch(lessonPicture.url)).arrayBuffer()), firstPicture);
const optionPicture = oldPlacements.find((placement) => placement.activityId === 'b1-quiz');
assert.deepEqual([optionPicture.questionId, optionPicture.optionId], ['brezel', 'a'], 'Un support peut illustrer un choix de réponse');

const replacement = await post('/media/uploads', staffToken, { ...pictureRequest(), assetId, title: '', size: secondPicture.length }, 201);
assert.equal(replacement.replaces, true);
assert.ok((await sendFile(replacement, secondPicture, 'image/png', staffToken)).ok);
const replaced = await post(`/media/uploads/${replacement.id}/finalize`, staffToken);
assert.deepEqual([replaced.assetId, replaced.version, replaced.title], [assetId, 2, 'Bretzel']);
const b1Next = await post('/catalogue/levels/b1/versions', staffToken, { fromVersionId: b1Draft.id }, 201);
assert.equal(b1Next.number, b1Draft.number + 1);
assert.equal(b1Next.modules[0].activities[0].placements[0].assetVersion, 1, 'La copie reprend les versions figées des fichiers');
assert.equal(b1Next.assessments.length, 1);
await api(`/lessons/b1-v${b1Next.number}-b1-lecon`, learnerB1.token, { status: 404 });
await api(`/media/${assetId}/versions/2`, learnerB1.token, { status: 403 });
const nextSaved = await put(`/catalogue/versions/${b1Next.id}`, staffToken, b1Content(2));
assert.equal(nextSaved.checks.publishable, true);
await post(`/catalogue/versions/${b1Next.id}/publish`, staffToken);
catalogueLevels = await api('/catalogue/levels', staffToken);
b1Level = catalogueLevels.find((level) => level.id === 'b1');
assert.equal(b1Level.versions.find((version) => version.id === b1Draft.id).status, 'retired');
assert.equal((await api('/tracks', teacher.token)).find((track) => track.levelCode === 'B1').versionId, b1Next.id);

oldPlacements = await placementsOf(firstSessionB1, learnerB1.token);
const oldPicture = oldPlacements.find((placement) => placement.activityId === 'b1-lecon');
assert.equal(oldPicture.assetVersion, 1);
assert.ok(oldPicture.url.includes(reserved.id), 'L’ancien élève garde le fichier de sa version');
assert.deepEqual(Buffer.from(await (await fetch(oldPicture.url)).arrayBuffer()), firstPicture);
const learnerB1Next = await createAccount('eleve-b1-v2', 'learner', teacher.id);
const nextPicture = (await placementsOf(await enrollB1(learnerB1Next.id, b1Next.id), learnerB1Next.token))
  .find((placement) => placement.activityId === 'b1-lecon');
assert.equal(nextPicture.assetVersion, 2);
assert.ok(nextPicture.url.includes(replacement.id), 'Un nouvel élève lit le fichier remplacé');
assert.deepEqual(Buffer.from(await (await fetch(nextPicture.url)).arrayBuffer()), secondPicture);
await post(`/catalogue/versions/${b1Next.id}/retire`, staffToken);
assert.ok(!(await api('/tracks', teacher.token)).some((track) => track.levelCode === 'B1'), 'Une version retirée n’est plus attribuable');
assert.equal((await placementsOf(firstSessionB1, learnerB1.token)).length, 2, 'Le retrait ne coupe pas l’accès des élèves inscrits');
await put('/catalogue/levels/b1', staffToken, { title: 'Allemand B1', description: 'Parcours de démonstration.', position: 3, prerequisiteLevelId: 'a2' });
console.log('Recette du catalogue réussie · niveaux et prérequis, brouillon repris, contrôle de complétude, bilan avec grille, '
  + 'publication et retrait sans redéploiement, nouvelle version avec média remplacé, ancien élève sur son fichier, brouillons inaccessibles.');

// --- Bilan, examen blanc, productions privées et corrections (incrément 6) ---------------------------------
const choice = (id, right = 'a') => ({ id, prompt: `Question ${id} ?`, moduleRef: null, options: [
  { id: 'a', label: 'Réponse A', correct: right === 'a' }, { id: 'b', label: 'Réponse B', correct: right === 'b' }] });
// L'exercice du module travaille aussi l'oral : il sera proposé en révision si l'oral reste sous le seuil.
const examModules = b1Content(2).modules.map((module) => ({ ...module, activities: module.activities.map((activity) =>
  activity.id === 'b1-quiz' ? { ...activity, competences: ['lecture', 'expression-orale'] } : activity) }));
const examContent = { ...b1Content(2), modules: examModules, assessments: [
  { kind: 'midterm', title: 'Bilan B1', description: 'Lecture des modules travaillés.', parts: [
    { id: 'lecture', competence: 'lecture', mode: 'closed', title: 'Lecture', instructions: 'Lisez puis répondez.',
      questions: [choice('m1'), choice('m2', 'b')], criteria: [], placements: [] }] },
  { kind: 'final', title: 'Examen blanc B1', description: 'Lecture, écrit et oral.', parts: [
    { id: 'lecture', competence: 'lecture', mode: 'closed', title: 'Lecture', instructions: 'Répondez aux questions.',
      questions: [choice('l1'), choice('l2', 'b')], criteria: [], placements: [] },
    { id: 'ecrit', competence: 'expression-ecrite', mode: 'written', title: 'Écrire une commande',
      instructions: 'Commandez un bretzel par écrit.', questions: [], placements: [],
      criteria: [{ id: 'clarte', label: 'La demande est claire', maxPoints: 5 }, { id: 'langue', label: 'La langue est correcte', maxPoints: 5 }] },
    { id: 'oral', competence: 'expression-orale', mode: 'oral', title: 'Commander à l’oral',
      instructions: 'Enregistrez votre commande.', questions: [], placements: [],
      criteria: [{ id: 'aisance', label: 'Aisance', maxPoints: 10 }] }] },
] };
await put('/catalogue/levels/b1', staffToken, { title: 'Allemand B1', description: 'Parcours de démonstration.', position: 3, prerequisiteLevelId: null });
const examVersion = await post('/catalogue/levels/b1/versions', staffToken, { fromVersionId: b1Next.id }, 201);
assert.equal((await put(`/catalogue/versions/${examVersion.id}`, staffToken, examContent)).checks.publishable, true);
await post(`/catalogue/versions/${examVersion.id}/publish`, staffToken);

const enrollmentOf = async (token) => (await api('/learning/enrollment', token));
const webm = Buffer.concat([Buffer.from([0x1a, 0x45, 0xdf, 0xa3]), Buffer.alloc(2_044, 7)]);
const record = async (exam, token) => {
  const reservation = await post(`/assessments/exams/${exam.id}/recordings`, token, { partId: 'oral', mimeType: 'audio/webm', size: webm.length });
  assert.equal(reservation.status, 'pending');
  const sent = await fetch(reservation.uploadUrl, { method: 'POST', body: webm, signal: AbortSignal.timeout(12_000),
    headers: { Authorization: `Bearer ${token}`, apikey: local.publishable, 'Content-Type': 'audio/webm', 'x-upsert': 'false' } });
  assert.ok(sent.ok, 'L’enregistrement part directement dans l’espace privé des productions');
  return { reservation, exam: await post(`/assessments/exams/${exam.id}/recordings/${reservation.id}/finalize`, token) };
};
const submitExam = (exam, token, key = randomUUID()) => api(`/assessments/exams/${exam.id}/submit`, token, {
  method: 'POST', body: {}, headers: { 'Idempotency-Key': key } });

// Examen accompagné : l'élève passe le bilan puis l'examen blanc, son professeur référent corrige.
const examLearner = await createAccount('eleve-examen', 'learner', teacher.id);
const examGoal = await post('/learning/enrollments', teacher.token,
  { learnerId: examLearner.id, trackVersionId: examVersion.id, startLevel: 'A2', template: 'intensive', startDate: inDays(1) }, 201);
await post(goalPath(examGoal.id, 'proposal/validate'), teacher.token, { number: examGoal.proposal.number });
assert.deepEqual(await api(`/assessments/exams?enrollmentId=${examGoal.id}`, examLearner.token), []);
await post('/assessments/exams', teacher.token, { enrollmentId: examGoal.id, kind: 'midterm' }, 403);
const midterm = await post('/assessments/exams', examLearner.token, { enrollmentId: examGoal.id, kind: 'midterm' }, 201);
assert.ok(!JSON.stringify(midterm.definition).includes('correct'), 'Le corrigé ne part pas vers l’élève');
assert.equal((await post('/assessments/exams', examLearner.token, { enrollmentId: examGoal.id, kind: 'midterm' })).id, midterm.id,
  'Rouvrir le bilan reprend la tentative en cours');
await put(`/assessments/exams/${midterm.id}/answers`, examLearner.token, { answers: { lecture: { m1: 'z' } } }, 400);
await put(`/assessments/exams/${midterm.id}/answers`, examLearner.token, { answers: { lecture: { m1: 'a', m2: 'a' } } });
assert.deepEqual((await api(`/assessments/exams/${midterm.id}`, examLearner.token)).answers, { lecture: { m1: 'a', m2: 'a' } },
  'La progression est enregistrée dans la tentative');
const midtermKey = randomUUID();
const midtermResult = await submitExam(midterm, examLearner.token, midtermKey);
assert.equal(midtermResult.status, 'graded', 'Un bilan sans production est corrigé immédiatement');
assert.equal(midtermResult.result.decision, 'completed');
assert.deepEqual(midtermResult.result.scores.lecture, { points: 1, max: 2, percent: 50 });
assert.ok(midtermResult.result.review.some((item) => item.activityId === 'b1-lecon'), 'Les activités de lecture sont à revoir');
assert.equal((await submitExam(midterm, examLearner.token, midtermKey)).submittedAt, midtermResult.submittedAt, 'La remise rejouée ne compte qu’une fois');
await post('/assessments/exams', examLearner.token, { enrollmentId: examGoal.id, kind: 'midterm' }, 409);
const midtermSlot = (await enrollmentOf(examLearner.token)).sessions.flatMap((session) => session.activities)
  .find((activity) => activity.id === 'bilan-intermediaire');
assert.equal(midtermSlot.status, 'completed', 'La remise termine le créneau du bilan dans le calendrier');

const final = await post('/assessments/exams', examLearner.token, { enrollmentId: examGoal.id, kind: 'final' }, 201);
assert.ok(final.dueAt, 'L’examen blanc reprend l’échéance de son créneau');
const missing = await api(`/assessments/exams/${final.id}/submit`, examLearner.token, {
  method: 'POST', body: {}, headers: { 'Idempotency-Key': randomUUID() }, status: 409 });
assert.match(missing.message, /production écrite/);
await put(`/assessments/exams/${final.id}/answers`, examLearner.token,
  { answers: { lecture: { l1: 'a', l2: 'b' } }, texts: { ecrit: 'Guten Tag, ich hätte gern eine Brezel, bitte.' } });
await post(`/assessments/exams/${final.id}/recordings`, examLearner.token, { partId: 'ecrit', mimeType: 'audio/webm', size: 10 }, 400);
await post(`/assessments/exams/${final.id}/recordings`, examLearner.token, { partId: 'oral', mimeType: 'video/mp4', size: 10 }, 400);
const intruderUpload = await post(`/assessments/exams/${final.id}/recordings`, examLearner.token, { partId: 'oral', mimeType: 'audio/webm', size: webm.length });
const intrusion = await fetch(intruderUpload.uploadUrl, { method: 'POST', body: webm,
  headers: { Authorization: `Bearer ${learnerToken}`, apikey: local.publishable, 'Content-Type': 'audio/webm' } });
assert.ok(!intrusion.ok, 'Un autre élève ne peut pas déposer dans l’envoi réservé');
const recorded = await record(final, examLearner.token);
const ownRecording = recorded.exam.recordings.find((recording) => recording.partId === 'oral');
assert.equal(ownRecording.productionId, recorded.reservation.id);
assert.deepEqual(Buffer.from(await (await fetch(ownRecording.url)).arrayBuffer()), webm, 'L’élève réécoute son enregistrement');
await api(`/assessments/exams/${final.id}`, otherTeacher.token, { status: 403 });
await api(`/assessments/exams/${final.id}`, learnerToken, { status: 403 });
const submitted = await submitExam(final, examLearner.token);
assert.equal(submitted.status, 'submitted');
assert.equal(submitted.onTime, true);
assert.equal((await enrollmentOf(examLearner.token)).goal.status, 'awaiting_grading');
await post(`/assessments/exams/${final.id}/recordings`, examLearner.token, { partId: 'oral', mimeType: 'audio/webm', size: webm.length }, 409);

// File des corrections : le référent voit la remise, le professeur tiers et le correcteur d'un autre élève non.
assert.ok((await api('/assessments/grading', teacher.token)).some((item) => item.id === final.id));
assert.ok(!(await api('/assessments/grading', otherTeacher.token)).some((item) => item.id === final.id));
assert.ok(!(await api('/assessments/grading', staffToken)).some((item) => item.id === final.id));
await post(`/assessments/exams/${final.id}/grading`, otherTeacher.token, { parts: {} }, 403);
const toGrade = await api(`/assessments/exams/${final.id}`, teacher.token);
assert.equal(toGrade.canGrade, true);
assert.equal(toGrade.texts.ecrit, 'Guten Tag, ich hätte gern eine Brezel, bitte.');
assert.deepEqual(toGrade.closedScores.lecture, { points: 2, max: 2, percent: 100 });
const teacherRecording = toGrade.recordings.find((recording) => recording.partId === 'oral');
assert.ok((await fetch(teacherRecording.url)).ok, 'Le professeur référent écoute la production orale');

// Remise à temps corrigée après l'échéance : elle reste à temps.
localSql(local.container, `update assessment.exam_attempts set submitted_at = now() - interval '2 days', due_at = now() - interval '1 day'
  where id = '${final.id}';`);
await post(`/assessments/exams/${final.id}/grading`, teacher.token,
  { parts: { ecrit: { points: { clarte: 6, langue: 3 } }, oral: { points: { aisance: 2 } } } }, 400);
const graded = await post(`/assessments/exams/${final.id}/grading`, teacher.token, {
  parts: { ecrit: { points: { clarte: 4, langue: 3 }, comment: 'Demande claire.' }, oral: { points: { aisance: 2 }, comment: 'Travaillez l’aisance.' } },
  feedback: 'Reprenez les dialogues du module avant une nouvelle tentative.' });
assert.equal(graded.status, 'graded');
assert.equal(graded.result.decision, 'to_consolidate', 'Une compétence trop faible empêche la validation');
assert.equal(graded.onTime, true, 'Remise à temps, corrigée après l’échéance');
assert.ok(new Date(graded.result.gradedAt) > new Date(graded.dueAt));
assert.deepEqual(graded.result.scores['expression-orale'], { points: 2, max: 10, percent: 20 });
await post(`/assessments/exams/${final.id}/grading`, teacher.token, { parts: {} }, 409);
assert.equal((await enrollmentOf(examLearner.token)).goal.status, 'to_consolidate');
const learnerView = await api(`/assessments/exams/${final.id}`, examLearner.token);
assert.equal(learnerView.result.comments.oral, 'Travaillez l’aisance.');
assert.ok(learnerView.result.review.length > 0, 'L’élève voit les activités à retravailler');

// Nouvelle tentative après un résultat à consolider ; l'historique garde la première.
const retry = await post('/assessments/exams', examLearner.token, { enrollmentId: examGoal.id, kind: 'final' }, 201);
assert.equal(retry.number, 2);
const examHistory = await api(`/assessments/exams?enrollmentId=${examGoal.id}`, teacher.token);
assert.deepEqual(examHistory.filter((item) => item.kind === 'final').map((item) => [item.number, item.status, item.decision]),
  [[2, 'in_progress', null], [1, 'graded', 'to_consolidate']]);
await api(`/assessments/exams?enrollmentId=${examGoal.id}`, otherTeacher.token, { status: 403 });

// Examen autonome : le correcteur désigné (permission Correction) corrige ; le professeur tiers est refusé.
const examAutonomous = await createAccount('autonome-examen', 'learner', null);
await put(`/admin/users/${staff.id}/permissions`, admin.token, { permissions: ['catalogue', 'correction'] });
await put(`/admin/users/${examAutonomous.id}/reviewer`, admin.token, { reviewerId: staff.id });
const autoGoal = await post('/learning/enrollments', admin.token,
  { learnerId: examAutonomous.id, trackVersionId: examVersion.id, startLevel: 'A2', template: 'intensive', startDate: inDays(1) }, 201);
await post(goalPath(autoGoal.id, 'proposal/validate'), examAutonomous.token, { number: autoGoal.proposal.number });
const autoFinal = await post('/assessments/exams', examAutonomous.token, { enrollmentId: autoGoal.id, kind: 'final' }, 201);
await put(`/assessments/exams/${autoFinal.id}/answers`, examAutonomous.token,
  { answers: { lecture: { l1: 'a', l2: 'b' } }, texts: { ecrit: 'Ich möchte zwei Brezeln.' } });
await record(autoFinal, examAutonomous.token);
await submitExam(autoFinal, examAutonomous.token);
assert.ok((await api('/assessments/grading', staffToken)).some((item) => item.id === autoFinal.id), 'Le correcteur désigné voit la remise');
assert.ok(!(await api('/assessments/grading', teacher.token)).some((item) => item.id === autoFinal.id));
await api(`/assessments/exams/${autoFinal.id}`, teacher.token, { status: 403 });
const reviewerView = await api(`/assessments/exams/${autoFinal.id}`, staffToken);
assert.ok((await fetch(reviewerView.recordings[0].url)).ok, 'Le correcteur désigné écoute la production orale');
const validated = await post(`/assessments/exams/${autoFinal.id}/grading`, staffToken, {
  parts: { ecrit: { points: { clarte: 5, langue: 4 } }, oral: { points: { aisance: 8 } } }, feedback: 'Très bien.' });
assert.equal(validated.result.decision, 'validated');
assert.equal((await enrollmentOf(examAutonomous.token)).goal.status, 'validated');
await put('/catalogue/levels/b1', staffToken, { title: 'Allemand B1', description: 'Parcours de démonstration.', position: 3, prerequisiteLevelId: 'a2' });
console.log('Recette des évaluations réussie · bilan corrigé immédiatement, examen blanc avec écrit et oral privé, remise idempotente, '
  + 'file et grille du référent, remise à temps corrigée après l’échéance, résultat à consolider puis nouvelle tentative, '
  + 'correcteur désigné d’un élève autonome, refus d’accès des tiers.');

// --- Traces métier pour Suivi ---------------------------------------------------------------------------
const events = localQuery(local.container, `select string_agg(distinct type, ',' order by type) from identity.outbox_events
  where learner_id = '${learner.id}' or subject_id in ('${invite.id}', '${first.id}');`).split(',');
for (const type of ['identity.account_activated', 'identity.invitation_cancelled', 'identity.invitation_sent', 'identity.teacher_assigned']) {
  assert.ok(events.includes(type), `Événement ${type} enregistré`);
}

localSql(local.container, readFileSync(new URL('db-isolation.sql', import.meta.url), 'utf8'));
console.log('Recette des comptes réussie · premier admin, invitations, réémission, annulation, expiration, équipe et permissions, '
  + 'correcteur, réaffectation, désactivation, événements et isolation des rôles SQL.');

// --- Navigateur ----------------------------------------------------------------------------------------
if (process.argv.includes('--browser')) {
  const require = createRequire(new URL('../../linguacap-react/package.json', import.meta.url));
  const { chromium, expect } = require('@playwright/test');
  const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL });
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await page.goto('http://127.0.0.1:5186/connexion');
    await page.getByLabel('Adresse e-mail').fill(email);
    await page.getByLabel('Mot de passe', { exact: true }).fill(password);
    await page.getByRole('button', { name: 'Se connecter', exact: true }).click();
    // Accueil : prochaine séance et message du professeur.
    await expect(page.getByRole('heading', { name: 'Ma prochaine séance' })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole('heading', { name: 'Au café' })).toBeVisible();
    await expect(page.getByText('Bravo pour cette première séance !')).toBeVisible();
    await page.getByRole('link', { name: 'Commencer la séance' }).click();
    await expect(page).toHaveURL(/\/espace\/seance\/[0-9a-f-]{36}$/);
    // Leçon : visuel avec son alternative textuelle, audio pilotable, transcription à la demande.
    await expect(page.getByRole('heading', { name: 'Commander au café' })).toBeVisible();
    const picture = page.getByRole('img', { name: 'Une tasse blanche remplie de café posée sur une soucoupe.' });
    await expect(picture).toBeVisible();
    await page.waitForFunction(() => document.querySelector('.pilot-lesson-image')?.naturalWidth > 0
      && [...document.querySelectorAll('audio')].every((audio) => Number.isFinite(audio.duration)));
    await expect(page.getByText('Lire la transcription')).toHaveCount(1);
    await page.getByRole('button', { name: 'J’ai terminé la leçon' }).click();
    await expect(page.getByText('Leçon terminée')).toBeVisible();
    // Exercice : la réponse choisie est sauvegardée et retrouvée après rechargement.
    const saved = page.waitForResponse((response) => response.url().includes('/activities/quiz-la-commande/progress')
      && response.request().method() === 'PUT' && response.ok());
    await page.getByRole('radio', { name: 'Un café' }).check();
    await saved;
    await page.reload();
    await expect(page.getByRole('radio', { name: 'Un café' })).toBeChecked({ timeout: 15_000 });
    await expect(page.getByText('Leçon terminée')).toBeVisible();
    await page.getByRole('button', { name: 'Valider mes réponses' }).click();
    await expect(page.getByText('Résultat enregistré · 1 / 1')).toBeVisible();
    await page.getByRole('button', { name: 'J’ai terminé la révision' }).click();
    await expect(page.getByText('Séance terminée. Bravo !')).toBeVisible();
    await expect(page.getByText('Lire la transcription')).toHaveCount(2);
    console.log('Recette navigateur réussie · accueil, séance, visuel, audio, reprise après rechargement et exercice sur mobile.');

    // Fiche du professeur référent : la séance terminée et le résultat apparaissent.
    const teacherPage = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    await teacherPage.goto('http://127.0.0.1:5186/connexion');
    await teacherPage.getByLabel('Adresse e-mail').fill(otherTeacher.email);
    await teacherPage.getByLabel('Mot de passe', { exact: true }).fill(password);
    await teacherPage.getByRole('button', { name: 'Se connecter', exact: true }).click();
    await teacherPage.getByRole('button', { name: 'Voir le suivi de Élève de recette' }).click({ timeout: 15_000 });
    const followUp = teacherPage.getByRole('dialog');
    await expect(followUp.getByText('Séance 1 · Au café')).toBeVisible();
    await expect(followUp.getByText('Terminée', { exact: true })).toBeVisible();
    await expect(followUp.getByText('3 / 3 activités terminées', { exact: false })).toBeVisible();
    console.log('Recette navigateur réussie · fiche élève du professeur référent.');

    const adminPage = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    await adminPage.goto('http://127.0.0.1:5186/connexion');
    await adminPage.getByLabel('Adresse e-mail').fill(admin.email);
    await adminPage.getByLabel('Mot de passe', { exact: true }).fill(password);
    await adminPage.getByRole('button', { name: 'Se connecter', exact: true }).click();
    await adminPage.getByRole('link', { name: 'Utilisateurs' }).click();
    await expect(adminPage).toHaveURL(/\/espace\/utilisateurs$/);
    await expect(adminPage.getByRole('row', { name: /Élève de recette/ })).toBeVisible({ timeout: 15_000 });
    await adminPage.getByRole('button', { name: 'Ouvrir la fiche de Élève de recette' }).click();
    const sheet = adminPage.getByRole('dialog');
    await expect(sheet.getByLabel('Professeur référent')).toHaveValue(otherTeacher.id);
    await expect(sheet.getByRole('listitem').filter({ hasText: 'Recette tiers' })).toContainText('en cours');
    await expect(sheet.getByRole('listitem').filter({ hasText: 'Recette prof' })).toBeVisible();
    await adminPage.goto('http://127.0.0.1:5186/espace/invitations');
    await expect(adminPage.getByRole('row', { name: new RegExp(expiredEmail) })).toBeVisible();
    console.log('Recette navigateur réussie · administration des comptes et des invitations.');

    const editorPage = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await editorPage.goto('http://127.0.0.1:5186/connexion');
    await editorPage.getByLabel('Adresse e-mail').fill(staffEmail);
    await editorPage.getByLabel('Mot de passe', { exact: true }).fill(password);
    await editorPage.getByRole('button', { name: 'Se connecter', exact: true }).click();
    await editorPage.getByRole('link', { name: 'Médiathèque' }).click({ timeout: 15_000 });
    await expect(editorPage.getByRole('heading', { name: 'Médiathèque' })).toBeVisible();
    await editorPage.getByRole('button', { name: 'Déposer un média' }).click();
    const uploadDialog = editorPage.getByRole('dialog');
    await uploadDialog.getByLabel(/^Fichier/).setInputFiles({ name: 'brezel.png', mimeType: 'image/png', buffer: secondPicture });
    await uploadDialog.getByLabel('Titre').fill('Bretzel du navigateur');
    await uploadDialog.getByLabel('Texte alternatif').fill('Un bretzel photographié de près.');
    await uploadDialog.getByLabel('Source').fill('Recette navigateur');
    await uploadDialog.getByLabel('Licence').fill('CC0 1.0');
    await uploadDialog.getByRole('button', { name: 'Déposer' }).click();
    await expect(editorPage.getByText('« Bretzel du navigateur » est disponible en version 1.')).toBeVisible({ timeout: 15_000 });
    await editorPage.getByRole('link', { name: 'Catalogue' }).click();
    await editorPage.getByRole('link', { name: `Ouvrir B1 version ${b1Next.number}` }).click();
    await expect(editorPage.getByRole('heading', { name: `B1 · version ${b1Next.number}` })).toBeVisible();
    await expect(editorPage.getByText('Cette version est figée')).toBeVisible();
    await editorPage.getByLabel('Activité à prévisualiser').selectOption({ label: 'Chez le boulanger' });
    await editorPage.getByRole('button', { name: 'Ouvrir l’aperçu élève' }).click();
    const previewDialog = editorPage.getByRole('dialog');
    await expect(previewDialog.getByRole('img', { name: 'Un bretzel doré.' })).toBeVisible({ timeout: 15_000 });
    await editorPage.keyboard.press('Escape');
    console.log('Recette navigateur réussie · dépôt avec progression depuis la médiathèque et aperçu élève dans l’éditeur, sur mobile.');

    const examPage = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await examPage.goto('http://127.0.0.1:5186/connexion');
    await examPage.getByLabel('Adresse e-mail').fill(examLearner.email);
    await examPage.getByLabel('Mot de passe', { exact: true }).fill(password);
    await examPage.getByRole('button', { name: 'Se connecter', exact: true }).click();
    await expect(examPage.getByRole('heading', { name: 'Ma prochaine séance' })).toBeVisible({ timeout: 15_000 });
    await examPage.goto(`http://127.0.0.1:5186/espace/evaluation/${examGoal.id}/final`);
    await expect(examPage.getByRole('heading', { name: 'Examen blanc B1' })).toBeVisible({ timeout: 15_000 });
    await expect(examPage.getByRole('heading', { name: 'Commander à l’oral' })).toBeVisible();
    await expect(examPage.getByRole('button', { name: 'Déposer un fichier' }).or(examPage.getByText('Déposer un fichier'))).toBeVisible();
    await expect(examPage.getByText('Tentative 1')).toBeVisible();
    await expect(examPage.getByText('À consolider')).toBeVisible();
    const typed = examPage.waitForResponse((response) => response.url().includes(`/assessments/exams/${retry.id}/answers`) && response.ok());
    await examPage.getByLabel('Votre texte').fill('Ich hätte gern einen Kaffee.');
    await typed;
    console.log('Recette navigateur réussie · nouvelle tentative de l’examen blanc, sauvegarde de l’écrit et historique sur mobile.');
  } finally {
    await browser.close();
  }
}
