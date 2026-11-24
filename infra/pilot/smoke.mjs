import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import { randomBytes, randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { localQuery, localSql, localSupabase } from './local.mjs';
import { answerActivity, assertAllRight, completeMission, isTyped, leaks, sendMission, submitExercise } from './smoke-answers.mjs';

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
// 2. Professeurs : questionnaire d'accueil (l'interface l'affiche tant que onboardedAt est nul), langues ouvertes seulement.
assert.equal((await api('/me', teacher.token)).teacherProfile?.onboardedAt ?? null, null, 'Le profil d’un nouveau professeur est à remplir');
await put('/me/teacher-profile', teacher.token, { languages: ['en'], levels: ['A1'] }, 409);
const teaching = { languages: ['de'], levels: ['A1', 'A2'], gradingDelayHours: 48, maxLearners: 12, bio: 'Professeur de recette.' };
const legacyTeaching = (await put('/me/teacher-profile', teacher.token, teaching)).teacherProfile;
assert.deepEqual([legacyTeaching.acceptingNewStudents, legacyTeaching.courseCreationMode], [null, null]);
await put('/me/teacher-profile', teacher.token, { ...teaching, acceptingNewStudents: true }, 400);
await put('/me/teacher-profile', teacher.token, { ...teaching, acceptingNewStudents: null, courseCreationMode: null }, 400);
await put('/me/teacher-profile', teacher.token, { ...teaching, acceptingNewStudents: 'false', courseCreationMode: 'self' }, 400);
await put('/me/teacher-profile', teacher.token, { ...teaching, acceptingNewStudents: false, courseCreationMode: 'autre' }, 400);
for (const [account, acceptingNewStudents, courseCreationMode] of [[teacher, true, 'self'], [otherTeacher, false, 'linguacap']]) {
  const onboarded = await put('/me/teacher-profile', account.token, { ...teaching, acceptingNewStudents, courseCreationMode });
  assert.ok(onboarded.teacherProfile.onboardedAt, 'Le questionnaire d’accueil est enregistré');
  assert.deepEqual(onboarded.teacherProfile.languages, ['de']);
  assert.deepEqual([onboarded.teacherProfile.acceptingNewStudents, onboarded.teacherProfile.courseCreationMode], [
    acceptingNewStudents, courseCreationMode,
  ]);
  const adminProfile = (await api(`/admin/users/${account.id}`, admin.token)).teacherProfile;
  assert.deepEqual(adminProfile, onboarded.teacherProfile, 'La fiche admin contient toutes les réponses du professeur');
  const reread = (await put('/me/teacher-profile', account.token, teaching)).teacherProfile;
  assert.deepEqual(reread, onboarded.teacherProfile, 'Une ancienne soumission préserve les deux réponses explicites');
}
await api(`/admin/users/${teacher.id}`, otherTeacher.token, { status: 403 });
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
assert.equal(lesson.transcript, null, 'La transcription passe par la séance, qui applique sa visibilité');
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
// L'attribution enveloppe l'inscription dans un parcours (origine « assignment ») : contrat n°1 accepté d'office.
// Dans les bornes du contrat, l'élève comme son référent valident le planning ; un ancien référent est refusé.
const assignedPath = await api('/learning/path', learnerToken);
assert.equal((await api('/learning/enrollment', learnerToken)).pathId, assignedPath.id, 'L’attribution crée un parcours');
assert.deepEqual([assignedPath.origin, assignedPath.contract.current?.status, assignedPath.contract.current?.proposedBy],
  ['assignment', 'accepted', 'teacher']);
await post(goalPath(enrolled.id, 'proposal/validate'), teacher.token, { number: 1 }, 403);
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

// Créneaux insuffisants : validation refusée, puis jours rétablis et proposition périmée refusée.
const autoId = autoEnrollment.id;
// Le parcours est démarré : sa date cible est fixée par le contrat et ne change que par un avenant.
await put(goalPath(autoId, 'availability'), autonomousToken,
  { days: [{ weekday: 1, sessions: 1, minutes: 10 }], targetDate: inDays(3) }, 409);
// Des jours sous l'engagement hebdomadaire du contrat bloquent la validation (le débordement est contrôlé sur un
// brouillon, dans la recette des parcours multi-niveaux).
const tight = await put(goalPath(autoId, 'availability'), autonomousToken, { days: [{ weekday: 1, sessions: 1, minutes: 10 }] });
assert.equal(tight.validatable, false);
assert.equal(tight.blockingReason, 'commitment', 'Dix minutes par semaine passent sous l’engagement du contrat');
await post(goalPath(autoId, 'proposal/validate'), autonomousToken, { number: tight.number }, 409);
const adjusted = await put(goalPath(autoId, 'availability'), autonomousToken, { days: intensive.days });
assert.equal(adjusted.overflowCount, 0, 'Le rythme intensif fait tenir le programme');
assert.equal(adjusted.validatable, true, `Proposition validable : ${adjusted.blockingReason}`);
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
assert.equal(replanned.goal.targetDate, autoEnrollment.goal.targetDate, 'La date cible du contrat est conservée');
assert.equal(localQuery(local.container,
  `select count(*) from learning.session_due_history where session_id = '${pending.id}' and was_late;`), '1');

// Pause et reprise à une nouvelle date.
const paused = await post(goalPath(autoId, 'pause'), autonomousToken, {});
assert.equal(paused.goal.status, 'paused');
const open = paused.sessions.find((session) => session.status !== 'completed');
await put(`/learning/sessions/${open.id}/activities/${open.activities[0].id}/progress`, autonomousToken, { state: {} }, 409);
await post(goalPath(enrolled.id, 'pause'), learnerToken, {}, 403);
const resumeDate = inDays(5);
await post(goalPath(autoId, 'resume'), autonomousToken, { resumeDate, targetDate: inDays(45) }, 409);
const resumed = await post(goalPath(autoId, 'resume'), autonomousToken, { resumeDate });
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
assert.equal(a2Goal.proposal.validatable, false, 'Un prérequis non confirmé empêche la validation (le bouton n’est pas proposé)');
await post(goalPath(a2Goal.id, 'proposal/validate'), teacher.token, { number: a2Goal.proposal.number }, 409);
await put(goalPath(a2Goal.id, 'starting-point'), teacher.token, { acquiredModules: [], prerequisiteMet: true }, 409);
const diagnostic = await api(goalPath(a2Goal.id, 'diagnostic'), learnerA2.token);
assert.equal(diagnostic.lessonId, 'diagnostic-a2');
assert.ok(diagnostic.questions.every((question) => question.options.every((option) => !('correct' in option))));
// Le diagnostic ne se corrige ni comme un exercice (sa clé détaillée n'est pas servie) ni comme un quiz (score à volonté).
await api('/assessments/exercises', learnerA2.token, { method: 'POST', headers: { 'Idempotency-Key': randomUUID() },
  body: { lessonId: 'diagnostic-a2', roundId: randomUUID(), answers: { 'diag-prerequis': { choice: 'cafe' } } }, status: 404 });
await api('/assessments/quiz', learnerA2.token, { method: 'POST', headers: { 'Idempotency-Key': randomUUID() },
  body: { lessonId: 'diagnostic-a2', answers: { 'diag-prerequis': 'cafe', 'diag-journee': 'sept' } }, status: 409 });
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

// Élève autonome débutant (A0) : parcours adapté d'office, ni diagnostic ni question (EVO-038).
const learnerAuto = await createAccount('autonome-a1', 'learner', null);
const a1Goal = await post('/learning/enrollments', admin.token,
  { learnerId: learnerAuto.id, trackVersionId: a1.versionId, startLevel: 'A0', template: 'standard' }, 201);
assert.equal(a1Goal.goal.template, 'standard');
assert.equal(a1Goal.goal.diagnosticLessonId, null, 'Un débutant n’a pas de diagnostic');
await api(goalPath(a1Goal.id, 'diagnostic'), learnerAuto.token, { status: 409 });
const a1Diag = await api('/assessments/diagnostics', learnerAuto.token, {
  method: 'POST', headers: { 'Idempotency-Key': randomUUID() },
  body: { lessonId: 'diagnostic-a1', answers: { 'diag-cafe-1': 'cafe', 'diag-cafe-2': 'bitte' } },
});
await post(goalPath(a2Goal.id, 'diagnostic'), learnerA2.token, { attemptId: a1Diag.id }, 409);
await post(goalPath(a1Goal.id, 'diagnostic'), learnerAuto.token, { attemptId: a1Diag.id }, 409);
const a1Proposal = await api(goalPath(a1Goal.id, 'proposal'), learnerAuto.token);
assert.ok(a1Proposal.sessions.some((session) => session.items.some((item) => item.id === 'commander-au-cafe')), 'Le débutant suit tout le niveau');
await post(goalPath(a1Goal.id, 'proposal/validate'), teacher.token, { number: a1Proposal.number }, 403);
assert.equal((await post(goalPath(a1Goal.id, 'proposal/validate'), learnerAuto.token, { number: a1Proposal.number })).goal.status, 'active');
// Élève autonome qui part de A1 : son diagnostic A2 s'applique directement, prérequis compris.
const learnerAutoA2 = await createAccount('autonome-a2-diag', 'learner', null);
const autoA2Goal = await post('/learning/enrollments', admin.token,
  { learnerId: learnerAutoA2.id, trackVersionId: a2.versionId, startLevel: 'A1', template: 'standard' }, 201);
assert.equal(autoA2Goal.goal.diagnosticLessonId, 'diagnostic-a2');
const autoA2Diag = await api('/assessments/diagnostics', learnerAutoA2.token, {
  method: 'POST', headers: { 'Idempotency-Key': randomUUID() },
  body: { lessonId: 'diagnostic-a2', answers: { 'diag-prerequis': 'cafe', 'diag-journee': 'sept' } },
});
const applied = await post(goalPath(autoA2Goal.id, 'diagnostic'), learnerAutoA2.token, { attemptId: autoA2Diag.id });
assert.deepEqual(applied.goal.acquiredModules, ['ma-journee'], 'Le diagnostic d’un élève autonome s’applique directement');
assert.equal(applied.goal.prerequisiteMet, true);
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

// Niveau de démonstration : ordre et prérequis, brouillon, contrôle de complétude, publication sans redéploiement. La recette
// le place en C1 (créé s'il manque, 5e position) : les vrais niveaux A1, A2 et B1 viennent de l'import des contenus, et un
// niveau ajouté au catalogue apparaît sans modifier le code.
const demoLevel = 'c1';
const DEMO = demoLevel.toUpperCase();
const demoSettings = (prerequisiteLevelId) => ({ title: 'Allemand C1 (démonstration)', description: 'Parcours de démonstration de la recette.',
  position: 5, prerequisiteLevelId });
if (!(await api('/catalogue/levels', staffToken)).some((level) => level.id === demoLevel)) {
  await post('/levels', teacher.token, { code: DEMO, title: demoSettings(null).title }, 403);
  const createdDemo = await post('/levels', admin.token, { code: DEMO, title: demoSettings(null).title, description: demoSettings(null).description }, 201);
  assert.deepEqual([createdDemo.id, createdDemo.code], [demoLevel, DEMO]);
}
await api('/catalogue/levels', teacher.token, { status: 403 });
await api('/catalogue/levels', learnerToken, { status: 403 });
await put('/catalogue/levels/a1', staffToken, { title: 'Allemand A1', description: '', position: 1, prerequisiteLevelId: 'a2' }, 400);
let catalogueLevels = await put(`/catalogue/levels/${demoLevel}`, staffToken, demoSettings(null));
let demoCatalogue = catalogueLevels.find((level) => level.id === demoLevel);
assert.equal(demoCatalogue.prerequisiteLevelId, null);
const openDraft = demoCatalogue.versions.find((version) => version.status === 'draft');
const demoDraft = openDraft ? await api(`/catalogue/versions/${openDraft.id}`, staffToken)
  : await post(`/catalogue/levels/${demoLevel}/versions`, staffToken, {}, 201);
assert.equal(demoDraft.status, 'draft');
await post(`/catalogue/levels/${demoLevel}/versions`, staffToken, {}, 409);
await api(`/catalogue/versions/${demoDraft.id}`, teacher.token, { status: 403 });
const picturePlacement = (version) => ({
  assetId, assetVersion: version, usage: 'illustration', alt: 'Un bretzel doré.', caption: 'die Brezel', transcriptVisibility: 'hidden',
  decorative: false, questionId: null, optionId: null,
});
const demoContent = (pictureVersion, objective = 'Commander une spécialité à la boulangerie.') => ({
  settings: { expectedCompetences: ['lecture', 'ecoute'], successCriteria: 'Réussir 60 % du bilan.', passPercent: 60,
    reviewMinutes: 10, midtermMinutes: 30, finalMinutes: 60 },
  diagnostic: null,
  modules: [{ id: 'baeckerei', title: 'À la boulangerie', objective, prerequisites: [], activities: [
    { id: 'demo-lecon', kind: 'lesson', title: 'Chez le boulanger', estimatedMinutes: 10, competences: ['lecture'],
      lesson: { title: 'Chez le boulanger', description: 'Ich hätte gern eine Brezel.', transcript: null }, questions: [],
      placements: [picturePlacement(pictureVersion)] },
    { id: 'demo-quiz', kind: 'exercise', title: 'Que demande-t-on ?', estimatedMinutes: 5, competences: ['lecture'],
      lesson: { title: 'Que demande-t-on ?', description: 'Choisissez la bonne réponse.', transcript: null },
      questions: [{ id: 'brezel', prompt: 'Que veut dire « eine Brezel » ?', moduleRef: null, options: [
        { id: 'a', label: 'Un bretzel', correct: true }, { id: 'b', label: 'Une baguette', correct: false }] }],
      placements: [{ ...picturePlacement(pictureVersion), questionId: 'brezel', optionId: 'a', caption: null }] },
  ] }],
  assessments: [{ kind: 'midterm', title: `Bilan ${DEMO}`, description: '', parts: [
    { id: 'lecture', competence: 'lecture', mode: 'closed', title: 'Lecture', instructions: 'Lisez puis répondez.', criteria: [], placements: [],
      questions: [{ id: 'bilan-1', prompt: 'Brezel ?', moduleRef: null, options: [
        { id: 'a', label: 'Bretzel', correct: true }, { id: 'b', label: 'Pain', correct: false }] }] },
    { id: 'ecrit', competence: 'expression-ecrite', mode: 'written', title: 'Écrire', instructions: 'Commandez par écrit.',
      questions: [], placements: [], criteria: [{ id: 'clarte', label: 'La demande est claire', maxPoints: 5 }] },
  ] }],
});
const incomplete = await put(`/catalogue/versions/${demoDraft.id}`, staffToken, demoContent(1, ''));
assert.equal(incomplete.checks.publishable, false);
assert.deepEqual(incomplete.checks.issues.map((issue) => issue.path), ['modules[0].objective']);
await post(`/catalogue/versions/${demoDraft.id}/publish`, staffToken, {}, 409);
await put(`/catalogue/versions/${demoDraft.id}`, staffToken, { ...demoContent(1), modules: [{ ...demoContent(1).modules[0], id: 'Bad Id' }] }, 400);
const saved = await put(`/catalogue/versions/${demoDraft.id}`, staffToken, demoContent(1));
assert.equal(saved.checks.publishable, true, JSON.stringify(saved.checks.issues));
assert.equal(saved.version.assessments[0].parts[1].criteria[0].maxPoints, 5);
const draftLesson = `${demoLevel}-v${demoDraft.number}-demo-lecon`;
await api(`/lessons/${draftLesson}`, learnerToken, { status: 404 });
assert.equal((await api(`/lessons/${draftLesson}`, staffToken)).title, 'Chez le boulanger');
assert.ok((await api('/lessons/commander-au-cafe', staffToken)).transcript, 'L’éditeur relit la transcription');
const publishedDemo = await post(`/catalogue/versions/${demoDraft.id}/publish`, staffToken);
assert.equal(publishedDemo.version.status, 'published');
assert.deepEqual(publishedDemo.media, [{ assetId, version: 1 }]);
await put(`/catalogue/versions/${demoDraft.id}`, staffToken, demoContent(1), 409);
library = await api('/media', staffToken);
assert.equal(library.find((asset) => asset.id === assetId).versions[0].status, 'published', 'Les fichiers du parcours sont publiés avec lui');
const demoTrack = (await api('/tracks', teacher.token)).find((track) => track.levelCode === DEMO);
assert.equal(demoTrack.versionId, demoDraft.id, 'Le niveau publié est attribuable sans redéploiement');
assert.equal(demoTrack.prerequisiteLevelCode, null);

// Un élève inscrit sur la version 1 garde ses fichiers quand le média est remplacé dans la version suivante.
const demoLearner = await createAccount('eleve-demo', 'learner', teacher.id);
const enrollDemo = async (learnerId, trackVersionId) => {
  const goal = await post('/learning/enrollments', teacher.token,
    { learnerId, trackVersionId, startLevel: 'B2', template: 'intensive', startDate: inDays(1) }, 201);
  const plan = await post(goalPath(goal.id, 'proposal/validate'), teacher.token, { number: goal.proposal.number });
  return plan.sessions[0].id;
};
const firstDemoSession = await enrollDemo(demoLearner.id, demoDraft.id);
const placementsOf = async (sessionId, token) => (await api(`/learning/sessions/${sessionId}`, token)).activities
  .flatMap((activity) => activity.placements.map((placement) => ({ ...placement, activityId: activity.id })));
let oldPlacements = await placementsOf(firstDemoSession, demoLearner.token);
const lessonPicture = oldPlacements.find((placement) => placement.activityId === 'demo-lecon');
assert.equal(lessonPicture.assetVersion, 1);
assert.ok(lessonPicture.url.includes(reserved.id), 'La séance pointe vers le fichier de la version 1');
assert.deepEqual(Buffer.from(await (await fetch(lessonPicture.url)).arrayBuffer()), firstPicture);
const optionPicture = oldPlacements.find((placement) => placement.activityId === 'demo-quiz');
assert.deepEqual([optionPicture.questionId, optionPicture.optionId], ['brezel', 'a'], 'Un support peut illustrer un choix de réponse');

const replacement = await post('/media/uploads', staffToken, { ...pictureRequest(), assetId, title: '', size: secondPicture.length }, 201);
assert.equal(replacement.replaces, true);
assert.ok((await sendFile(replacement, secondPicture, 'image/png', staffToken)).ok);
const replaced = await post(`/media/uploads/${replacement.id}/finalize`, staffToken);
assert.deepEqual([replaced.assetId, replaced.version, replaced.title], [assetId, 2, 'Bretzel']);
const demoNext = await post(`/catalogue/levels/${demoLevel}/versions`, staffToken, { fromVersionId: demoDraft.id }, 201);
assert.equal(demoNext.number, demoDraft.number + 1);
assert.equal(demoNext.modules[0].activities[0].placements[0].assetVersion, 1, 'La copie reprend les versions figées des fichiers');
assert.equal(demoNext.assessments.length, 1);
await api(`/lessons/${demoLevel}-v${demoNext.number}-demo-lecon`, demoLearner.token, { status: 404 });
await api(`/media/${assetId}/versions/2`, demoLearner.token, { status: 403 });
const nextSaved = await put(`/catalogue/versions/${demoNext.id}`, staffToken, demoContent(2));
assert.equal(nextSaved.checks.publishable, true);
await post(`/catalogue/versions/${demoNext.id}/publish`, staffToken);
catalogueLevels = await api('/catalogue/levels', staffToken);
demoCatalogue = catalogueLevels.find((level) => level.id === demoLevel);
assert.equal(demoCatalogue.versions.find((version) => version.id === demoDraft.id).status, 'retired');
assert.equal((await api('/tracks', teacher.token)).find((track) => track.levelCode === DEMO).versionId, demoNext.id);

oldPlacements = await placementsOf(firstDemoSession, demoLearner.token);
const oldPicture = oldPlacements.find((placement) => placement.activityId === 'demo-lecon');
assert.equal(oldPicture.assetVersion, 1);
assert.ok(oldPicture.url.includes(reserved.id), 'L’ancien élève garde le fichier de sa version');
assert.deepEqual(Buffer.from(await (await fetch(oldPicture.url)).arrayBuffer()), firstPicture);
const demoLearnerNext = await createAccount('eleve-demo-v2', 'learner', teacher.id);
const nextPicture = (await placementsOf(await enrollDemo(demoLearnerNext.id, demoNext.id), demoLearnerNext.token))
  .find((placement) => placement.activityId === 'demo-lecon');
assert.equal(nextPicture.assetVersion, 2);
assert.ok(nextPicture.url.includes(replacement.id), 'Un nouvel élève lit le fichier remplacé');
assert.deepEqual(Buffer.from(await (await fetch(nextPicture.url)).arrayBuffer()), secondPicture);
await post(`/catalogue/versions/${demoNext.id}/retire`, staffToken);
assert.ok(!(await api('/tracks', teacher.token)).some((track) => track.levelCode === DEMO), 'Une version retirée n’est plus attribuable');
assert.ok(!(await api('/levels', learnerToken)).some((level) => level.code === DEMO), 'Sans version publiée, le niveau repasse en brouillon');
assert.equal((await placementsOf(firstDemoSession, demoLearner.token)).length, 2, 'Le retrait ne coupe pas l’accès des élèves inscrits');
await put(`/catalogue/levels/${demoLevel}`, staffToken, demoSettings('b2'));
console.log('Recette du catalogue réussie · niveaux et prérequis, brouillon repris, contrôle de complétude, bilan avec grille, '
  + 'publication et retrait sans redéploiement, nouvelle version avec média remplacé, ancien élève sur son fichier, brouillons inaccessibles.');

// --- Bilan, examen blanc, productions privées et corrections (incrément 6) ---------------------------------
const choice = (id, right = 'a') => ({ id, prompt: `Question ${id} ?`, moduleRef: null, options: [
  { id: 'a', label: 'Réponse A', correct: right === 'a' }, { id: 'b', label: 'Réponse B', correct: right === 'b' }] });
// L'exercice du module travaille aussi l'oral : il sera proposé en révision si l'oral reste sous le seuil.
const examModules = demoContent(2).modules.map((module) => ({ ...module, activities: module.activities.map((activity) =>
  activity.id === 'demo-quiz' ? { ...activity, competences: ['lecture', 'expression-orale'] } : activity) }));
const examContent = { ...demoContent(2), modules: examModules, assessments: [
  { kind: 'midterm', title: `Bilan ${DEMO}`, description: 'Lecture des modules travaillés.', parts: [
    { id: 'lecture', competence: 'lecture', mode: 'closed', title: 'Lecture', instructions: 'Lisez puis répondez.',
      questions: [choice('m1'), choice('m2', 'b')], criteria: [], placements: [] }] },
  { kind: 'final', title: `Examen blanc ${DEMO}`, description: 'Lecture, écrit et oral.', parts: [
    { id: 'lecture', competence: 'lecture', mode: 'closed', title: 'Lecture', instructions: 'Répondez aux questions.',
      questions: [choice('l1'), choice('l2', 'b')], criteria: [], placements: [] },
    { id: 'ecrit', competence: 'expression-ecrite', mode: 'written', title: 'Écrire une commande',
      instructions: 'Commandez un bretzel par écrit.', questions: [], placements: [],
      criteria: [{ id: 'clarte', label: 'La demande est claire', maxPoints: 5 }, { id: 'langue', label: 'La langue est correcte', maxPoints: 5 }] },
    { id: 'oral', competence: 'expression-orale', mode: 'oral', title: 'Commander à l’oral',
      instructions: 'Enregistrez votre commande.', questions: [], placements: [],
      criteria: [{ id: 'aisance', label: 'Aisance', maxPoints: 10 }] }] },
] };
await put(`/catalogue/levels/${demoLevel}`, staffToken, demoSettings(null));
const examVersion = await post(`/catalogue/levels/${demoLevel}/versions`, staffToken, { fromVersionId: demoNext.id }, 201);
assert.equal((await put(`/catalogue/versions/${examVersion.id}`, staffToken, examContent)).checks.publishable, true);
await post(`/catalogue/versions/${examVersion.id}/publish`, staffToken);
assert.ok((await api('/levels', learnerToken)).some((level) => level.code === DEMO), 'Le niveau republié réapparaît pour les élèves');

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
  { learnerId: examLearner.id, trackVersionId: examVersion.id, startLevel: 'B2', template: 'intensive', startDate: inDays(1) }, 201);
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
assert.ok(midtermResult.result.review.some((item) => item.activityId === 'demo-lecon'), 'Les activités de lecture sont à revoir');
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
// Replanifier un objectif en attente de correction le garde en attente : plan_validated porte l'état (EVO-042).
const gradingReplan = await put(goalPath(examGoal.id, 'availability'), teacher.token, { days: intensive.days, targetDate: null });
assert.equal(gradingReplan.validatable, true);
const gradingReplanned = await post(goalPath(examGoal.id, 'proposal/validate'), teacher.token, { number: gradingReplan.number });
assert.equal(gradingReplanned.goal.status, 'awaiting_grading', 'La replanification garde l’attente de correction');
assert.equal(localQuery(local.container, `select data->>'goalStatus' from learning.outbox_events
  where type = 'learning.plan_validated' and data->>'enrollmentId' = '${examGoal.id}' order by sequence desc limit 1;`),
  'awaiting_grading', 'plan_validated porte l’état de l’objectif');

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
  { learnerId: examAutonomous.id, trackVersionId: examVersion.id, startLevel: 'B2', template: 'intensive', startDate: inDays(1) }, 201);
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
// Le niveau de démonstration est retiré pour la suite : seuls A1, A2 et B1 restent publiés ; les inscrits gardent leur version.
await post(`/catalogue/versions/${examVersion.id}/retire`, staffToken);
await put(`/catalogue/levels/${demoLevel}`, staffToken, demoSettings('b2'));
assert.ok(!(await api('/levels', learnerToken)).some((level) => level.code === DEMO), 'Le niveau de démonstration retiré n’est plus proposé');
console.log('Recette des évaluations réussie · bilan corrigé immédiatement, examen blanc avec écrit et oral privé, remise idempotente, '
  + 'file et grille du référent, remise à temps corrigée après l’échéance, résultat à consolider puis nouvelle tentative, '
  + 'correcteur désigné d’un élève autonome, refus d’accès des tiers.');

// --- Suivi : événements, alertes, relance, reprise et clôture (incrément 7) -------------------------------
const trackingJobs = process.env.LINGUACAP_SMOKE_TRACKING ?? 'http://127.0.0.1:8086';
const internalSecret = readFileSync(join(tmpdir(), 'linguacap-recette-secret'), 'utf8').trim();
const runJob = async (kind = 'sync', { allowErrors = false } = {}) => {
  const result = await json(`${trackingJobs}/v1/internal/tracking/jobs/${kind}`, {
    method: 'POST', headers: { 'X-Linguacap-Internal': internalSecret } });
  // V4 : les nouveaux événements (exercise_flagged, mission_submitted, mission_reviewed) ne bloquent jamais le suivi.
  if (!allowErrors) assert.deepEqual(result.errors ?? {}, {}, `Le suivi traite tous les événements (${kind})`);
  return result;
};
await json(`${trackingJobs}/v1/internal/tracking/jobs/sync`, { method: 'POST', status: 403 });
const firstRun = await runJob();
assert.ok(firstRun.imported > 0, 'Les événements des services sont importés');
assert.deepEqual(firstRun.errors, {});
const sequences = (producer) => Number(localQuery(local.container,
  `select last_sequence from tracking.checkpoints where producer = '${producer}';`));
// Point de reprise (transaction, séquence) : le dernier événement servi dans l'ordre (tx, sequence) (EVO-042).
const checkpoint = (producer) => localQuery(local.container,
  `select last_tx || ':' || last_sequence from tracking.checkpoints where producer = '${producer}';`);
const lastEvent = (producer) => localQuery(local.container,
  `select tx || ':' || sequence from ${producer}.outbox_events order by tx desc, sequence desc limit 1;`);
for (const producer of ['identity', 'learning', 'assessment']) {
  assert.equal(checkpoint(producer), lastEvent(producer), `Le point de reprise suit le dernier événement lu (${producer})`);
}
assert.equal((await runJob()).imported, 0, 'Un second passage ne réimporte rien');

// Un événement validé en retard par une transaction concurrente n'est jamais sauté. Deux sessions psql : la lente prend
// le plus petit numéro puis attend 6 s avant de valider ; la rapide valide aussitôt.
const probeEvent = (label) => `insert into learning.outbox_events (id, type, subject_kind, subject_id, learner_id, data)
  values (gen_random_uuid(), 'learning.recette_concurrence', 'path', '${label}-${suffix}', '${teacher.id}', '{"probe": "${label}"}');`;
const probesImported = () => localQuery(local.container, `select coalesce(string_agg(subject_id, ',' order by subject_id), '')
  from tracking.event_log where type = 'learning.recette_concurrence' and subject_id like '%-${suffix}';`);
const slowSession = spawn('docker', ['exec', '-i', local.container, 'psql', '-U', 'postgres', '-d', 'postgres', '-X', '-q',
  '-v', 'ON_ERROR_STOP=1'], { stdio: ['pipe', 'ignore', 'inherit'] });
const slowDone = new Promise((resolve, reject) => slowSession.on('exit',
  (code) => (code === 0 ? resolve() : reject(new Error(`La transaction lente a échoué (code ${code})`)))));
slowSession.stdin.end(`begin;\n${probeEvent('lente')}\nselect pg_sleep(6);\ncommit;\n`);
const slowSleeping = () => Number(localQuery(local.container,
  "select count(*) from pg_stat_activity where query like 'select pg_sleep(6)%' and pid <> pg_backend_pid();"));
for (let tries = 0; slowSleeping() === 0; tries += 1) {
  assert.ok(tries < 50, 'La transaction lente a pris son numéro');
  await new Promise((resolve) => setTimeout(resolve, 100));
}
localSql(local.container, probeEvent('rapide'));
await runJob();
assert.equal(probesImported(), '', 'Pendant la transaction lente, l’événement rapide attend : aucun numéro n’est dépassé');
await slowDone;
await runJob();
assert.equal(probesImported(), `lente-${suffix},rapide-${suffix}`, 'L’événement validé en retard est importé, sans perte');
assert.equal(localQuery(local.container, `select (select sequence from learning.outbox_events where subject_id = 'lente-${suffix}')
  < (select sequence from learning.outbox_events where subject_id = 'rapide-${suffix}');`), 't',
  'La transaction lente avait le plus petit numéro : l’ancienne lecture « sequence > dernier vu » l’aurait sautée');
assert.equal(checkpoint('learning'), lastEvent('learning'));

const followLearner = async (label) => {
  const account = await createAccount(label, 'learner', teacher.id);
  const goal = await post('/learning/enrollments', teacher.token, goalFor(account.id), 201);
  const plan = await post(goalPath(goal.id, 'proposal/validate'), teacher.token, { number: goal.proposal.number });
  return { ...account, enrollmentId: goal.id, firstSession: plan.sessions[0].id };
};
// La première séance passe dans le passé : le retard s'accumule avant le bilan et l'examen blanc.
const makeLate = (learnerRow) => localSql(local.container, `update tracking.sessions set due_at = now() - interval '10 days'
  where session_id = '${learnerRow.firstSession}';`);
const trackingOf = async (learnerId, token = teacher.token) => (await api('/tracking/overview', token)).learners
  .find((row) => row.learnerId === learnerId).tracking;
const activeAlerts = (enrollmentId) => Number(localQuery(local.container,
  `select count(*) from tracking.alerts where enrollment_id = '${enrollmentId}' and status <> 'closed';`));

const lateLearner = await followLearner('suivi-retard');
await runJob();
assert.equal((await trackingOf(lateLearner.id)).goalStatus, 'active');
assert.equal((await trackingOf(lateLearner.id)).alert, null, 'Un élève à jour n’a pas d’alerte');
makeLate(lateLearner);
const alertRun = await runJob();
assert.ok(alertRun.opened >= 1);
let followed = await trackingOf(lateLearner.id);
assert.equal(followed.alert.status, 'open');
assert.equal(followed.lateSessions, 1);
assert.match(followed.alert.reason, /approche avec du retard/);
await runJob();
assert.equal(activeAlerts(lateLearner.enrollmentId), 1, 'Un second contrôle met l’alerte à jour sans la dupliquer');

// Relance depuis l'alerte, puis première activité de reprise.
const relance = await post('/tracking/messages', teacher.token,
  { learnerId: lateLearner.id, text: 'On reprend ensemble cette semaine ?', alertId: followed.alert.id });
assert.equal(relance.alertId, followed.alert.id);
assert.ok((await api('/tracking/messages', lateLearner.token)).some((message) => message.id === relance.id), 'L’élève voit l’encouragement');
const lateSession = `/learning/sessions/${lateLearner.firstSession}`;
const lateDetail = await api(lateSession, lateLearner.token);
for (const activity of lateDetail.activities) {
  const progressPath = `${lateSession}/activities/${activity.id}/progress`;
  if (activity.kind === 'exercise') {
    const answers = Object.fromEntries(activity.questions.map((question) => [question.id, question.options[0].id]));
    await put(progressPath, lateLearner.token, { state: { answers } });
    const grade = await api('/assessments/quiz', lateLearner.token, { method: 'POST', headers: { 'Idempotency-Key': randomUUID() },
      body: { lessonId: activity.lesson.id, answers, sessionId: lateLearner.firstSession, activityId: activity.id } });
    await put(progressPath, lateLearner.token, { completed: true, attemptId: grade.id });
  } else if (activity.kind !== 'assessment') {
    await put(progressPath, lateLearner.token, { completed: true });
  }
}
const closingRun = await runJob();
assert.ok(closingRun.closed >= 1);
followed = await trackingOf(lateLearner.id);
assert.equal(followed.alert, null, 'L’alerte se clôt quand le retard est rattrapé');
assert.equal(followed.lateSessions, 0);
assert.equal(followed.sessionsCompleted, 1);
assert.ok(followed.lastActivityAt, 'La dernière activité pédagogique est connue');
const relanceVue = (await api(`/tracking/messages?learnerId=${lateLearner.id}`, teacher.token)).find((message) => message.id === relance.id);
assert.ok(relanceVue.resumedAt, 'La reprise après encouragement est enregistrée');
const sheet = await api(`/tracking/learners/${lateLearner.id}`, teacher.token);
assert.equal(sheet.tracking.alerts[0].status, 'closed');
assert.ok(sheet.tracking.alerts[0].encouragedAt);
assert.ok(sheet.tracking.sessions.length > 1);
assert.ok(sheet.freshness.syncedAt, 'La fiche indique la fraîcheur du suivi');

// Un événement arrivé tard ne remplace pas un état plus récent.
localSql(local.container, `insert into learning.outbox_events (id, type, occurred_at, subject_kind, subject_id, learner_id, data)
  values (gen_random_uuid(), 'learning.goal_status_changed', now() - interval '1 day', 'goal', '${lateLearner.enrollmentId}',
          '${lateLearner.id}', '{"enrollmentId": "${lateLearner.enrollmentId}", "goalStatus": "to_consolidate"}');`);
assert.equal((await runJob()).imported, 1);
assert.equal((await trackingOf(lateLearner.id)).goalStatus, 'active', 'L’état le plus récent reste en place');

// Parcours mis en pause : l'alerte est suspendue, sans relance.
const pausedLearner = await followLearner('suivi-pause');
await runJob();
makeLate(pausedLearner);
await runJob();
assert.equal((await trackingOf(pausedLearner.id)).alert.status, 'open');
await post(goalPath(pausedLearner.enrollmentId, 'pause'), teacher.token, {});
await runJob();
const pausedTracking = await trackingOf(pausedLearner.id);
assert.equal(pausedTracking.goalStatus, 'paused');
assert.equal(pausedTracking.alert.status, 'suspended', 'L’alerte est suspendue pendant la pause');
// En pause, seules les séances échues avant la pause sont en retard ; pas d'échéance tant que la reprise n'est pas prévue.
localSql(local.container, `update tracking.sessions s set due_at = g.status_at + (now() - g.status_at) / 2
  from tracking.goals g where g.enrollment_id = s.enrollment_id and s.session_id = (select session_id from tracking.sessions
    where enrollment_id = '${pausedLearner.enrollmentId}' and not superseded and session_id <> '${pausedLearner.firstSession}'
    order by due_at limit 1);`);
const pausedNow = await trackingOf(pausedLearner.id);
assert.equal(pausedNow.lateSessions, 1, 'La séance échue pendant la pause ne compte pas en retard');
assert.equal(pausedNow.nextDueAt, null, 'Pas d’échéance tant que la reprise n’est pas prévue');
// Reprise prévue visible dans le Suivi (EVO-042) ; l'objectif reste en pause jusqu'à la validation du planning de reprise.
const pauseResumeDate = inDays(1);
const pausedResume = await post(goalPath(pausedLearner.enrollmentId, 'resume'), teacher.token, { resumeDate: pauseResumeDate });
assert.equal(localQuery(local.container, `select data->>'goalStatus' || ' ' || (data->>'resumeDate') from learning.outbox_events
  where type = 'learning.goal_resumed' and data->>'enrollmentId' = '${pausedLearner.enrollmentId}' order by sequence desc limit 1;`),
  `paused ${pauseResumeDate}`, 'Apprentissage annonce la reprise prévue (learning.goal_resumed)');
await runJob();
let resumeTracking = await trackingOf(pausedLearner.id);
assert.equal(resumeTracking.goalStatus, 'paused', 'L’objectif reste en pause jusqu’à la validation du planning de reprise');
assert.equal(resumeTracking.resumeDate, pauseResumeDate, 'La date de reprise est visible dans le suivi');
assert.equal(resumeTracking.lateSessions, 1, 'L’annonce de la reprise ne déplace pas l’instant de la pause');
assert.ok(resumeTracking.nextDueAt, 'La prochaine échéance devient la reprise prévue');
assert.equal(resumeTracking.alert.status, 'suspended');

// Reprise après coupure et reconstruction : relire depuis le début ne double rien ; la projection se reconstruit.
localSql(local.container, "update tracking.checkpoints set last_tx = 0, last_sequence = 0 where producer = 'learning';");
assert.equal((await runJob()).imported, 0, 'Les événements déjà traités sont dédupliqués par identifiant');
assert.equal(checkpoint('learning'), lastEvent('learning'));
const rebuilt = await runJob('rebuild');
assert.equal(rebuilt.imported, Number(localQuery(local.container, 'select count(*) from tracking.event_log;')));
const afterRebuild = await trackingOf(lateLearner.id);
assert.equal(afterRebuild.sessionsCompleted, 1);
assert.equal(afterRebuild.goalStatus, 'active');
assert.equal(afterRebuild.alert, null);
assert.equal((await trackingOf(pausedLearner.id)).alert.status, 'suspended');
assert.equal((await trackingOf(pausedLearner.id)).resumeDate, pauseResumeDate, 'La reconstruction retrouve la reprise prévue');
assert.ok((await api(`/tracking/messages?learnerId=${lateLearner.id}`, teacher.token)).find((message) => message.id === relance.id).resumedAt,
  'La reconstruction retrouve la reprise après encouragement');
// Le planning de reprise validé reprend l'objectif dans le suivi.
assert.equal(pausedResume.validatable, true);
const resumedPlan = await post(goalPath(pausedLearner.enrollmentId, 'proposal/validate'), teacher.token, { number: pausedResume.number });
assert.equal(resumedPlan.goal.status, 'active');
await runJob();
resumeTracking = await trackingOf(pausedLearner.id);
assert.equal(resumeTracking.goalStatus, 'active', 'Le planning de reprise validé reprend l’objectif dans le suivi');
assert.equal(resumeTracking.resumeDate, null);
await api('/tracking/overview', staffToken, { status: 403 });
console.log('Recette du suivi réussie · import par lots avec point de reprise, déduplication, retard et alerte, second contrôle '
  + 'sans doublon, relance liée à l’alerte, reprise puis clôture, événement tardif, pause suspendant l’alerte, reconstruction.');

// --- Indicateurs administrateur (incrément 8) ---------------------------------------------------------------
// Les règles de calcul sont vérifiées sur un jeu fictif calculé à l'avance (KpiRulesTest) ; la recette contrôle
// l'accès réservé, les filtres, les effectifs et les groupes vides sur les données du pilote.
await api('/tracking/kpis', teacher.token, { status: 403 });
await api('/tracking/kpis', staffToken, { status: 403 });
await api('/tracking/kpis', learnerToken, { status: 403 });
await api('/tracking/kpis?kind=autre', admin.token, { status: 400 });
await api('/tracking/kpis?inconnu=1', admin.token, { status: 400 });
await api('/tracking/kpis?from=2026-02-31', admin.token, { status: 400 });
await runJob();
const horizon = `?from=${inDays(-1)}&to=${inDays(120)}`;
const dashboard = await api('/tracking/kpis' + horizon, admin.token);
const teacherKpis = dashboard.teacherOnboarding;
assert.ok(teacherKpis.teachers >= 2 && teacherKpis.byLanguage.de >= 2 && teacherKpis.byLevel.A1 >= 2);
assert.ok(teacherKpis.byAvailability.yes >= 1 && teacherKpis.byAvailability.no >= 1);
assert.ok(teacherKpis.byCourseMode.self >= 1 && teacherKpis.byCourseMode.linguacap >= 1);
assert.ok(teacherKpis.byMaxLearners['12'] >= 2 && teacherKpis.byGradingDelayHours['48'] >= 2);
assert.ok(teacherKpis.trend.some(day => /^\d{4}-\d{2}-\d{2}$/.test(day.date) && day.responses >= 1));
assert.ok(teacherKpis.trend.some(day => day.accepting >= 1 && day.self >= 1));
assert.ok(teacherKpis.trend.some(day => day.notAccepting >= 1 && day.linguacap >= 1));
assert.ok(dashboard.goals >= 4, 'Les parcours de la recette sont retenus');
assert.ok(dashboard.activeLearnersTotal >= 2, 'Les activités pédagogiques comptent les élèves actifs');
assert.ok(dashboard.activeLearners.length >= 1);
assert.ok(dashboard.goalsValidated.denominator >= 1);
assert.ok(dashboard.goalsValidated.numerator >= 1, 'L’examen blanc validé à temps compte à l’échéance');
assert.ok(dashboard.freshness.syncedAt, 'Le tableau de bord indique la fraîcheur des données');
for (const rate of [dashboard.activation, dashboard.sessionsOnTime, dashboard.goalsValidated, dashboard.resumption]) {
  assert.ok(rate.numerator <= rate.denominator);
  assert.equal(rate.rate, rate.denominator === 0 ? null : Math.round(1000 * rate.numerator / rate.denominator) / 10);
}
const autonomousKpis = await api('/tracking/kpis' + horizon + '&kind=autonomous', admin.token);
const accompaniedKpis = await api('/tracking/kpis' + horizon + '&kind=accompanied', admin.token);
assert.equal(autonomousKpis.goals + accompaniedKpis.goals, dashboard.goals, 'Parcours accompagnés et autonomes se partagent le total');
assert.ok(autonomousKpis.goalsValidated.numerator >= 1, 'L’élève autonome validé par son correcteur compte parmi les autonomes');
const emptyGroup = await api('/tracking/kpis' + horizon + '&level=B2', admin.token);
assert.equal(emptyGroup.goals, 0);
assert.equal(emptyGroup.goalsValidated.rate, null, 'Un groupe vide ne produit pas de taux');
console.log('Recette des indicateurs réussie · accès réservé à l’administration, filtres contrôlés, effectifs, '
  + 'parcours accompagnés et autonomes, groupe vide et fraîcheur.');

// --- Traces métier pour Suivi ---------------------------------------------------------------------------
const events = localQuery(local.container, `select string_agg(distinct type, ',' order by type) from identity.outbox_events
  where learner_id = '${learner.id}' or subject_id in ('${invite.id}', '${first.id}');`).split(',');
for (const type of ['identity.account_activated', 'identity.invitation_cancelled', 'identity.invitation_sent', 'identity.teacher_assigned']) {
  assert.ok(events.includes(type), `Événement ${type} enregistré`);
}

localSql(local.container, readFileSync(new URL('db-isolation.sql', import.meta.url), 'utf8'));
console.log('Recette des comptes réussie · premier admin, invitations, réémission, annulation, expiration, équipe et permissions, '
  + 'correcteur, réaffectation, désactivation, événements et isolation des rôles SQL.');

// --- Contenus A1, A2, B1 (et B2) : import, publication, parcours intensif accompagné et parcours autonome (incrément 9) ---
const { importContent } = await import('../content/import-content.mjs');
const { availableLevels, loadLevel, loadPlacement } = await import('../content/content-lib.mjs');
// Cours B, phase 2 : dès que content/de/b2 est construit (génération G2), le B2 est importé et publié comme les autres
// niveaux ; avant, il reste au catalogue en brouillon et les attentes « B2 non publié » s'appliquent.
const hasB2 = availableLevels().includes('b2');
const builtLevels = hasB2 ? ['a1', 'a2', 'b1', 'b2'] : ['a1', 'a2', 'b1'];
const publishedCodes = builtLevels.map((id) => id.toUpperCase());
const listedCodes = `${publishedCodes.slice(0, -1).join(', ')} et ${publishedCodes.at(-1)}`;
assert.deepEqual(availableLevels(), builtLevels, `Contenus construits : ${listedCodes} (content/de, générations des lots S3 et S5)`);
const contentA1 = loadLevel('a1');
const contentA2 = loadLevel('a2');
const contentB1 = loadLevel('b1');
const contentB2 = hasB2 ? loadLevel('b2') : null;
const importState = join(tmpdir(), `linguacap-import-${suffix}.json`);
const importStarted = Date.now();
const imported = await importContent({ api: gateway + '/api/v1', token: staffToken, publishable: local.publishable,
  publish: true, statePath: importState, log: () => {} });
const importSeconds = Math.round((Date.now() - importStarted) / 1000);
assert.deepEqual(imported.map((result) => [result.levelId, result.published]), builtLevels.map((id) => [id, true]),
  `Import et publication de ${listedCodes}`);
const reimported = await importContent({ api: gateway + '/api/v1', token: staffToken, publishable: local.publishable,
  publish: true, statePath: importState, log: () => {} });
assert.ok(reimported.every((result) => result.unchanged), 'Un second import reconnaît les médias et les versions déjà publiés');
await post(`/catalogue/versions/${imported[0].versionId}/publish`, staffToken, {}, 409);

const contentTracks = await api('/tracks', teacher.token);
const trackA1 = contentTracks.find((track) => track.levelCode === 'A1');
const trackA2 = contentTracks.find((track) => track.levelCode === 'A2');
const trackB1 = contentTracks.find((track) => track.levelCode === 'B1');
const trackB2 = hasB2 ? contentTracks.find((track) => track.levelCode === 'B2') : null;
assert.equal(trackA1.versionId, imported[0].versionId, 'La version A1 importée est celle proposée à l’attribution');
assert.equal(trackA2.versionId, imported[1].versionId);
assert.equal(trackB1.versionId, imported[2].versionId);
if (hasB2) assert.equal(trackB2?.versionId, imported[3].versionId, 'La version B2 importée est celle proposée à l’attribution');
const activitiesOf = (level) => level.modules.flatMap((module) => module.activities);
for (const [level, result] of [[contentA1, imported[0]], [contentA2, imported[1]], [contentB1, imported[2]],
  ...(hasB2 ? [[contentB2, imported[3]]] : [])]) {
  assert.ok(level.format >= 4, `Contenu V4 importé (${level.levelId})`);
  assert.deepEqual(activitiesOf(level).filter((activity) => activity.id.endsWith('-correction')).map((activity) => activity.id), [],
    'Aucune activité « -correction » : le corrigé s’affiche après la remise');
  assert.deepEqual(level.modules.filter((module) => !module.vocabulary?.length).map((module) => module.id), [], 'Un lexique par module');
  const document = JSON.stringify(await api(`/catalogue/versions/${result.versionId}`, staffToken));
  assert.ok(Buffer.byteLength(document) < 2 * 1024 * 1024, `Document de version sous 2 Mo (${Buffer.byteLength(document)} octets)`);
}
assert.equal(trackA1.activityCount, activitiesOf(contentA1).length);
assert.equal(trackA1.totalMinutes, activitiesOf(contentA1).reduce((sum, activity) => sum + activity.estimatedMinutes, 0));
assert.equal(trackA2.activityCount, activitiesOf(contentA2).length);
assert.equal(trackA2.prerequisiteLevelCode, 'A1', 'Le parcours A2 requiert le niveau A1');
// B1 au format 5 : bloc catalogue appliqué par l'importeur, prérequis A2, missions notées sur grille (4 ou 5 critères, 20 points).
assert.equal(contentB1.format, 5, 'Contenu B1 au format 5');
const b1Level = (await api('/catalogue/levels', staffToken)).find((level) => level.id === 'b1');
assert.deepEqual([b1Level.title, b1Level.position, b1Level.prerequisiteLevelId, b1Level.status],
  [contentB1.catalogue.title, 3, 'a2', 'published'], 'Le niveau B1 du catalogue suit le bloc « catalogue » de level.json');
assert.equal(contentB1.catalogue.position, 3);
assert.equal(trackB1.prerequisiteLevelCode, 'A2', 'Le parcours B1 requiert le niveau A2');
assert.equal(trackB1.activityCount, activitiesOf(contentB1).length);
assert.equal(trackB1.totalMinutes, activitiesOf(contentB1).reduce((sum, activity) => sum + activity.estimatedMinutes, 0));
const b1Document = await api(`/catalogue/versions/${trackB1.versionId}`, staffToken);
const b1Missions = b1Document.modules.flatMap((module) => module.activities).filter((activity) => activity.kind === 'mission');
assert.ok(b1Missions.length >= 24, `Missions B1 : ${b1Missions.length}`);
for (const activity of b1Missions) {
  const criteria = activity.mission.criteria ?? [];
  assert.ok([4, 5].includes(criteria.length) && criteria.reduce((sum, criterion) => sum + criterion.maxPoints, 0) === 20,
    `Mission ${activity.id} : grille de 4 ou 5 critères sur 20 points`);
}
for (const activity of b1Document.modules.flatMap((module) => module.activities).filter((item) => item.kind === 'exercise')) {
  for (const question of activity.questions) assert.ok(question.prompt.includes(' [fr] '), `${activity.id}/${question.id} : énoncé bilingue au catalogue`);
}
// B2 au format 5 (phase 2) : position 4 après le B1 prérequis, consignes en allemand avec aide française repliée ([fr?],
// jamais [fr]), missions plus longues (écrit de 1 500 à 3 000 caractères, oral de 120 à 300 s) notées sur grille.
let b2FoldedPrompts = 0;
if (hasB2) {
  assert.equal(contentB2.format, 5, 'Contenu B2 au format 5');
  const b2Level = (await api('/catalogue/levels', staffToken)).find((level) => level.id === 'b2');
  assert.deepEqual([b2Level.title, b2Level.position, b2Level.prerequisiteLevelId, b2Level.status],
    [contentB2.catalogue.title, 4, 'b1', 'published'], 'Le niveau B2 du catalogue suit le bloc « catalogue » de level.json');
  assert.equal(trackB2.prerequisiteLevelCode, 'B1', 'Le parcours B2 requiert le niveau B1');
  assert.equal(trackB2.activityCount, activitiesOf(contentB2).length);
  assert.equal(trackB2.totalMinutes, activitiesOf(contentB2).reduce((sum, activity) => sum + activity.estimatedMinutes, 0));
  const b2Document = await api(`/catalogue/versions/${trackB2.versionId}`, staffToken);
  assert.ok(!JSON.stringify(b2Document).includes('[fr]'), 'Aucune traduction affichée [fr] au B2 : l’aide française est repliée');
  const b2Missions = b2Document.modules.flatMap((module) => module.activities).filter((activity) => activity.kind === 'mission');
  assert.ok(b2Missions.length >= 24, `Missions B2 : ${b2Missions.length}`);
  for (const activity of b2Missions) {
    const criteria = activity.mission.criteria ?? [];
    assert.ok([4, 5].includes(criteria.length) && criteria.reduce((sum, criterion) => sum + criterion.maxPoints, 0) === 20,
      `Mission ${activity.id} : grille de 4 ou 5 critères sur 20 points`);
    const { written, oral } = activity.mission;
    if (written) {
      assert.ok(written.maxChars >= 1500 && written.maxChars <= 3000 && written.minWords >= 100 && written.minWords <= 220,
        `Mission ${activity.id} : écrit B2 (${written.maxChars} caractères, ${written.minWords} mots au moins)`);
    }
    if (oral) assert.ok(oral.maxSeconds >= 120 && oral.maxSeconds <= 300, `Mission ${activity.id} : oral B2 de ${oral.maxSeconds} s`);
  }
  for (const activity of b2Document.modules.flatMap((module) => module.activities).filter((item) => item.kind === 'exercise')) {
    for (const question of activity.questions) if (question.prompt.includes(' [fr?] ')) b2FoldedPrompts++;
  }
  assert.ok(b2FoldedPrompts > 0, 'Des énoncés B2 portent l’aide française repliée [fr?]');
  assert.deepEqual(loadPlacement().tiers.map((tier) => tier.code), ['A1', 'A2', 'B1', 'B2'],
    'Le test de niveau livré avec le B2 a son palier B2 (content/de/placement/placement.json)');
}

// Corrigés lus dans les fichiers de contenu. Diagnostic et examens restent à choix unique : activité → question → bon choix.
// Les exercices (questions typées, répétitions orales) sont répondus par smoke-answers.mjs à partir du contenu et de la vue.
const keyOf = (questions) => Object.fromEntries((questions ?? []).map((question) =>
  [question.id, question.options.find((option) => option.correct).id]));
const contentActivities = new Map([...activitiesOf(contentA1), ...activitiesOf(contentA2), ...activitiesOf(contentB1),
  ...(hasB2 ? activitiesOf(contentB2) : [])].map((activity) => [activity.id, activity]));
const sourceOf = (activity) => {
  const source = contentActivities.get(activity.contentActivityId ?? activity.id);
  assert.ok(source, `Contenu connu pour ${activity.id}`);
  return source;
};
const diagnosticAnswers = (level, mastered) => Object.fromEntries(level.diagnostic.questions.map((question) =>
  [question.id, question.options.find((option) => option.correct === mastered.includes(question.moduleRef)).id]));
/** Dépôt direct d'un enregistrement (répétition ou mission) dans l'espace privé des productions, avec le jeton de l'élève. */
const uploadRecording = (token) => async (reservation) => {
  if (!reservation.uploadUrl) return;
  const sent = await fetch(reservation.uploadUrl, { method: 'POST', body: webm, signal: AbortSignal.timeout(12_000),
    headers: { Authorization: `Bearer ${token}`, apikey: local.publishable, 'Content-Type': 'audio/webm', 'x-upsert': 'false' } });
  assert.ok(sent.ok, `Dépôt de l’enregistrement · HTTP ${sent.status}`);
};
/** Questions servies sans corrigé dans toutes les activités d'une séance ou d'une bibliothèque. */
const assertNoLeak = (activities, label) => assert.deepEqual(activities.flatMap((activity) => leaks(activity.questions)
  .map((path) => `${activity.id}${path}`)), [], `${label} : aucune clé de corrigé dans les questions servies`);
/**
 * Fait une séance comme un élève : exercices remis par /assessments/exercises (répétitions orales comprises, corrigé
 * entièrement juste avec une explication par question), missions écrites, enregistrées, cochées et envoyées, leçons et
 * révisions terminées. Renvoie la séance relue et les missions envoyées.
 */
const workSession = async (sessionId, token) => {
  const path = `/learning/sessions/${sessionId}`;
  const session = await api(path, token);
  assertNoLeak(session.activities, `Séance ${sessionId}`);
  const missions = [];
  for (const activity of session.activities) {
    const progress = `${path}/activities/${activity.id}/progress`;
    if (activity.kind === 'exercise') {
      const { answers, roundId } = await answerActivity({ api, token, content: sourceOf(activity), view: activity,
        lessonId: activity.lesson.id, sessionId, activityId: activity.id });
      await put(progress, token, { state: { answers, roundId } });
      const result = await submitExercise({ api, token, lessonId: activity.lesson.id, roundId, answers, sessionId, activityId: activity.id });
      assertAllRight(result, activity.id);
      await put(progress, token, { completed: true, attemptId: result.grade.id });
    } else if (activity.kind === 'mission') {
      assert.ok(activity.mission?.checklist?.length >= 2, `Définition de la mission ${activity.id}`);
      await put(progress, token, { completed: true, attemptId: randomUUID() }, 409);
      const mission = await sendMission({ api, token, upload: uploadRecording(token), open: {
        trackVersionId: activity.contentVersionId, activityId: activity.contentActivityId ?? activity.id, sessionId, sessionActivityId: activity.id } });
      assert.ok(['submitted', 'sent'].includes(mission.status), `Mission ${activity.id} envoyée`);
      assert.deepEqual([mission.sessionId, mission.sessionActivityId], [sessionId, activity.id]);
      await put(progress, token, { completed: true, attemptId: mission.id });
      missions.push(mission);
    } else if (activity.kind === 'lesson' || activity.kind === 'review') {
      await put(progress, token, { completed: true });
    }
  }
  const after = await api(path, token);
  after.missions = missions;
  return after;
};
const checkSupports = async (session) => {
  for (const placement of session.activities.flatMap((activity) => activity.placements)) {
    assert.ok(placement.url, `Le support ${placement.assetId} est servi avec la séance`);
    if (placement.usage === 'illustration' && !placement.decorative) assert.ok(placement.alt.length >= 10, 'Alternative textuelle présente');
  }
  const first = session.activities.flatMap((activity) => activity.placements)[0];
  if (first) assert.ok((await fetch(first.url, { signal: AbortSignal.timeout(8_000) })).ok, 'Le premier support est lisible');
};

// A1 intensif accompagné : débutant sans diagnostic, module déclaré acquis par le référent, deux séances par jour, séances
// faites, retard replanifié.
const a1Learner = await createAccount('eleve-a1-contenu', 'learner', teacher.id);
const a1Course = await post('/learning/enrollments', teacher.token,
  { learnerId: a1Learner.id, trackVersionId: trackA1.versionId, startLevel: 'A0', template: 'intensive', startDate: inDays(1) }, 201);
assert.equal(a1Course.goal.diagnosticLessonId, null, 'Départ A0 : pas de diagnostic');
await api(goalPath(a1Course.id, 'diagnostic'), a1Learner.token, { status: 409 });
await put(goalPath(a1Course.id, 'starting-point'), teacher.token, { acquiredModules: ['a1-hallo'] });
const courseA1Proposal = await api(goalPath(a1Course.id, 'proposal'), teacher.token);
assert.equal(courseA1Proposal.overflowCount, 0, 'Le programme A1 tient dans le mois intensif');
const courseA1Planned = courseA1Proposal.sessions.flatMap((session) => session.items.map((item) => item.id));
assert.ok(!courseA1Proposal.sessions.some((session) => session.items.some((item) => item.moduleId === 'a1-hallo')),
  'Le module acquis n’est pas planifié');
assert.ok(courseA1Planned.includes('bilan-intermediaire') && courseA1Planned.includes('examen-blanc'));
const courseA1FirstDay = courseA1Proposal.sessions.filter((session) => session.date === courseA1Proposal.sessions[0].date);
assert.ok(courseA1FirstDay.length >= 2, 'Plusieurs séances par jour en rythme intensif');
const courseA1Plan = await post(goalPath(a1Course.id, 'proposal/validate'), teacher.token, { number: courseA1Proposal.number });
assert.equal(courseA1Plan.goal.status, 'active');
const a1Worked = [];
for (const session of courseA1Plan.sessions.slice(0, 2)) {
  await checkSupports(await api(`/learning/sessions/${session.id}`, a1Learner.token));
  a1Worked.push(await workSession(session.id, a1Learner.token));
  assert.equal(a1Worked.at(-1).session.status, 'completed', 'Les séances du premier jour se terminent');
}
const a1Late = (await api('/learning/enrollment', a1Learner.token)).sessions.find((session) => session.status !== 'completed');
localSql(local.container, `update learning.sessions set due_at = now() - interval '1 day' where id = '${a1Late.id}';`);
const a1Availability = await put(goalPath(a1Course.id, 'availability'), teacher.token, { days: intensive.days, targetDate: null });
assert.equal(a1Availability.validatable, true);
const a1Replanned = await post(goalPath(a1Course.id, 'proposal/validate'), teacher.token, { number: a1Availability.number });
assert.ok(a1Replanned.supersededSessions >= 1 && !a1Replanned.sessions.some((session) => session.id === a1Late.id),
  'La séance en retard est replanifiée');
assert.equal(a1Replanned.sessions.filter((session) => session.status === 'completed').length, 2, 'Les séances faites restent acquises');
const a1Sheet = await api(`/tracking/learners/${a1Learner.id}`, teacher.token);
assert.ok(a1Sheet.results.filter((grade) => grade.kind !== 'diagnostic').length >= 1, 'Les résultats apparaissent dans la fiche');

// A2 autonome : prérequis par le diagnostic, planning validé par l'élève, séance, bilan puis examen blanc corrigés.
const a2Learner = await createAccount('autonome-a2-contenu', 'learner', null);
await put(`/admin/users/${a2Learner.id}/reviewer`, admin.token, { reviewerId: staff.id });
const a2Course = await post('/learning/enrollments', admin.token,
  { learnerId: a2Learner.id, trackVersionId: trackA2.versionId, startLevel: 'A1', template: 'standard', startDate: inDays(1) }, 201);
assert.equal(a2Course.goal.prerequisiteMet, false);
const a2Diagnostic = await api(goalPath(a2Course.id, 'diagnostic'), a2Learner.token);
const a2DiagnosticGrade = await api('/assessments/diagnostics', a2Learner.token, { method: 'POST',
  headers: { 'Idempotency-Key': randomUUID() },
  body: { lessonId: a2Diagnostic.lessonId, answers: diagnosticAnswers(contentA2, ['prerequis']) } });
const a2Diagnosed = await post(goalPath(a2Course.id, 'diagnostic'), a2Learner.token, { attemptId: a2DiagnosticGrade.id });
assert.equal(a2Diagnosed.goal.diagnosticPrerequisite, true, 'Le diagnostic confirme les acquis A1');
const courseA2Proposal = await api(goalPath(a2Course.id, 'proposal'), a2Learner.token);
assert.equal(courseA2Proposal.validatable, true, 'L’élève autonome peut valider son planning');
const courseA2Plan = await post(goalPath(a2Course.id, 'proposal/validate'), a2Learner.token, { number: courseA2Proposal.number });
await checkSupports(await api(`/learning/sessions/${courseA2Plan.sessions[0].id}`, a2Learner.token));
assert.equal((await workSession(courseA2Plan.sessions[0].id, a2Learner.token)).session.status, 'completed');

const midtermDone = () => localQuery(local.container, `select count(*) from learning.activity_progress p
  join learning.sessions s on s.id = p.session_id
  where s.enrollment_id = '${a2Course.id}' and p.activity_id = 'bilan-intermediaire' and p.completed_at is not null;`);
const answerExam = async (kind, { learningDown = false } = {}) => {
  const exam = await post('/assessments/exams', a2Learner.token, { enrollmentId: a2Course.id, kind }, 201);
  const definition = contentA2.assessments.find((assessment) => assessment.kind === kind);
  const listening = exam.definition.parts.find((part) => part.competence === 'ecoute');
  assert.ok(listening.placements.some((placement) => placement.usage === 'audio'), 'La partie d’écoute a son enregistrement');
  const answers = Object.fromEntries(definition.parts.filter((part) => part.mode === 'closed').map((part) => [part.id, keyOf(part.questions)]));
  const written = definition.parts.find((part) => part.mode === 'written');
  await put(`/assessments/exams/${exam.id}/answers`, a2Learner.token,
    { answers, texts: { [written.id]: 'Liebe Anna, letztes Wochenende war ich in Hamburg. Ich habe den Hafen besucht, weil das Wetter schön war.' } });
  const oral = definition.parts.find((part) => part.mode === 'oral');
  const reservation = await post(`/assessments/exams/${exam.id}/recordings`, a2Learner.token,
    { partId: oral.id, mimeType: 'audio/webm', size: webm.length });
  const sent = await fetch(reservation.uploadUrl, { method: 'POST', body: webm, signal: AbortSignal.timeout(12_000),
    headers: { Authorization: `Bearer ${a2Learner.token}`, apikey: local.publishable, 'Content-Type': 'audio/webm', 'x-upsert': 'false' } });
  assert.ok(sent.ok);
  await post(`/assessments/exams/${exam.id}/recordings/${reservation.id}/finalize`, a2Learner.token);
  if (learningDown) await control('stop', 'learning');
  assert.equal((await submitExam(exam, a2Learner.token)).status, 'submitted');
  if (learningDown) {
    // Apprentissage indisponible pendant la remise : elle est enregistrée, le créneau attend la notification, que la
    // lecture suivante de la tentative rattrape (accusé de réception).
    await control('start', 'learning');
    await ready(8084);
    assert.equal(midtermDone(), '0', 'La notification perdue laisse le créneau du bilan à faire');
    await api(`/assessments/exams/${exam.id}`, a2Learner.token);
    assert.equal(midtermDone(), '1', 'La relecture de la tentative termine le créneau du bilan');
  }
  assert.ok((await api('/assessments/grading', staffToken)).some((item) => item.id === exam.id), 'Le correcteur désigné reçoit la copie');
  const full = (part) => ({ points: Object.fromEntries(part.criteria.map((criterion) => [criterion.id, criterion.maxPoints])) });
  const graded = await post(`/assessments/exams/${exam.id}/grading`, staffToken, {
    parts: { [written.id]: full(written), [oral.id]: full(oral) }, feedback: 'Très bon travail sur l’ensemble des compétences.' });
  assert.equal(graded.status, 'graded');
  for (const competence of ['lecture', 'ecoute', 'expression-ecrite', 'expression-orale']) {
    assert.equal(graded.result.scores[competence].percent, 100, `Compétence ${competence} notée`);
  }
  return graded;
};
assert.equal((await answerExam('midterm', { learningDown: true })).result.decision, 'completed', 'Le bilan intermédiaire est corrigé');
assert.equal((await answerExam('final')).result.decision, 'validated', 'L’examen blanc A2 est validé');
// Copies en attente sur tous les niveaux de l'élève et résultats par niveau (revue des cas similaires, constat A).
await runJob();
const beforeLevels = (await api(`/tracking/learners/${a2Learner.id}`, admin.token)).tracking;
const previousGoal = randomUUID();
localSql(local.container, `insert into tracking.goals (enrollment_id, learner_id, level_code, goal_status, assigned_at, pending_grading, results)
  values ('${previousGoal}', '${a2Learner.id}', 'A1', 'awaiting_grading', now() - interval '90 days', 1,
    '{"final": {"percent": 72, "decision": "validated", "onTime": true, "scores": {}}}'::jsonb);`);
try {
  const afterLevels = (await api(`/tracking/learners/${a2Learner.id}`, admin.token)).tracking;
  assert.equal(afterLevels.pendingGrading, beforeLevels.pendingGrading + 1, 'La copie du niveau précédent reste comptée');
  assert.equal(afterLevels.levelCode, 'A2', 'La synthèse reste celle du niveau en cours');
  assert.deepEqual(Object.keys(afterLevels.resultsByLevel).sort(), ['A1', 'A2']);
  assert.equal(afterLevels.resultsByLevel.A1.final.percent, 72);
} finally {
  localSql(local.container, `delete from tracking.goals where enrollment_id = '${previousGoal}';`);
}
assert.equal((await api('/learning/enrollment', a2Learner.token)).goal.status, 'validated');
console.log(`Import des contenus : ${importSeconds} s pour ${listedCodes} (délai de la recette éphémère : 35 min).`);
console.log(`Recette des contenus réussie · import idempotent de ${trackA1.activityCount} activités A1, ${trackA2.activityCount} A2`
  + `${hasB2 ? `, ${trackB1.activityCount} B1 et ${trackB2.activityCount} B2` : ` et ${trackB1.activityCount} B1`} `
  + 'avec leurs médias, publication et prérequis A2, A1 intensif accompagné (débutant sans diagnostic, module déclaré acquis, deux séances par jour, retard '
  + 'replanifié), A2 autonome de l’attribution à la correction du bilan et de l’examen blanc.');

// --- Parcours multi-niveaux : langues, test de niveau, objectif, contrat, ajouts et bibliothèque (incrément Parcours) ---
const fiveDays = (minutes) => [1, 2, 3, 4, 5].map((weekday) => ({ weekday, sessions: 1, minutes }));
const bandOf = (weekly) => [['light', 150], ['moderate', 300], ['sustained', 450], ['intensive', 630], ['very_intensive', 840]]
  .find(([, max]) => weekly <= max)?.[0] ?? 'unrealistic';
const sqlList = (sql) => localQuery(local.container, sql).split(',').filter(Boolean);

// 1. Langues : l'allemand seul est ouvert, les autres arrivent bientôt.
const languages = await api('/languages', teacher.token);
assert.ok(languages.length >= 14, 'Au moins quatorze langues sont listées');
assert.deepEqual(languages.filter((language) => language.status === 'available').map((language) => language.id), ['de']);
assert.ok(languages.filter((language) => language.id !== 'de').every((language) => language.status === 'coming_soon'));
const germanLevels = languages.find((language) => language.id === 'de').levels;
assert.equal(germanLevels.find((level) => level.code === 'A1').trackVersionId, trackA1.versionId, 'Les niveaux publiés de la langue');

// 3. Banque du test de niveau : brouillon de l'éditeur, contrôle de complétude, publication.
const bankQuestion = (code, index) => ({
  id: `recette-${code.toLowerCase()}-${index}`, competence: 'lecture', moduleRef: null, placements: [],
  prompt: `Question de recette ${code} n° ${index} : choisissez « richtig ».`,
  options: [{ id: 'a', label: 'richtig', correct: true }, { id: 'b', label: 'falsch', correct: false }, { id: 'c', label: 'vielleicht', correct: false }],
});
const bankTier = (code, drawCount = 8) => ({ code, title: `Palier ${code}`, passPercent: 67, minCompetencePercent: 34, drawCount,
  questions: Array.from({ length: 8 }, (_, index) => bankQuestion(code, index + 1)) });
await api('/catalogue/placement-tests', teacher.token, { status: 403 });
const bankDraft = await post('/catalogue/placement-tests', staffToken, { languageId: 'de' }, 201);
assert.equal(bankDraft.status, 'draft');
const bankContent = { title: 'Test de niveau de recette', description: 'Deux paliers de lecture.', tiers: [bankTier('A1'), bankTier('A2', 9)] };
const incompleteBank = await put(`/catalogue/placement-tests/${bankDraft.id}`, staffToken, bankContent);
assert.equal(incompleteBank.checks.publishable, false);
assert.deepEqual(incompleteBank.checks.issues.map((issue) => issue.path), ['tiers[1].drawCount'], 'Un palier tire plus de questions qu’il n’en a');
await post(`/catalogue/placement-tests/${bankDraft.id}/publish`, staffToken, {}, 409);
const completeBank = await put(`/catalogue/placement-tests/${bankDraft.id}`, staffToken, { ...bankContent, tiers: [bankTier('A1'), bankTier('A2')] });
assert.equal(completeBank.checks.publishable, true, JSON.stringify(completeBank.checks.issues));
const publishedBank = await post(`/catalogue/placement-tests/${bankDraft.id}/publish`, staffToken);
assert.equal(publishedBank.test.status, 'published');
assert.equal(publishedBank.test.questionCount, 16);
await put(`/catalogue/placement-tests/${bankDraft.id}`, staffToken, bankContent, 409);
assert.ok((await api('/languages', teacher.token)).find((language) => language.id === 'de').placementAvailable);

// 4. Élève suivi : invité avec sa langue, qu'il ne peut pas changer.
const followedEmail = `parcours-suivi-${suffix}@example.org`;
const followedInvite = await post('/invitations', teacher.token,
  { email: followedEmail, displayName: 'Élève suivi de recette', role: 'learner', languageId: 'de' }, 201);
assert.equal(followedInvite.languageId, 'de');
await post('/invitations', teacher.token,
  { email: `parcours-anglais-${suffix}@example.org`, displayName: 'Refus', role: 'learner', languageId: 'en' }, 409);
const followedToken = await followInvitation(followedEmail);
const followedMe = await api('/me', followedToken);
assert.deepEqual([followedMe.languageId, followedMe.teacherId], ['de', teacher.id], 'La langue vient de l’invitation');
await put('/me/language', followedToken, { languageId: 'de' }, 403);
assert.equal((await api('/me/teacher', followedToken)).id, teacher.id);
const followedStart = await api('/learning/onboarding', followedToken);
assert.deepEqual([followedStart.accompanied, followedStart.languageLocked, followedStart.completed], [true, true, false]);

// 5. Élève autonome : langue, puis test de niveau à paliers.
const solo = await createAccount('parcours-autonome', 'learner', null);
const soloStart = await api('/learning/onboarding', solo.token);
assert.deepEqual([soloStart.steps[0].id, soloStart.steps[0].status, soloStart.completed], ['language', 'current', false]);
assert.equal(await api('/me/teacher', solo.token), null);
await post('/assessments/placements', solo.token, {}, 409);
await put('/me/language', solo.token, { languageId: 'en' }, 409);
assert.equal((await put('/me/language', solo.token, { languageId: 'de' })).languageId, 'de');
let soloTest = await post('/assessments/placements', solo.token, {}, 201);
assert.equal(soloTest.currentTier, 'A1');
assert.equal(soloTest.questions.length, 8);
assert.ok(soloTest.questions.every((question) => question.options.every((option) => !('correct' in option))), 'Aucun corrigé exposé');
assert.equal((await post('/assessments/placements', solo.token, {})).id, soloTest.id, 'Le test en cours est repris');
await put(`/assessments/placements/${soloTest.id}/answers`, solo.token, { tier: 'A1', answers: { [soloTest.questions[0].id]: 'z' } }, 400);
soloTest = await put(`/assessments/placements/${soloTest.id}/answers`, solo.token, { tier: 'A1', answers: { [soloTest.questions[0].id]: 'a' } });
assert.equal(soloTest.savedAnswers[soloTest.questions[0].id], 'a', 'Les réponses sont enregistrées en cours de palier');
const tierAnswers = (view, right) => Object.fromEntries(view.questions.map((question) => [question.id, right ? 'a' : 'dontknow']));
const submitTier = (view, tier, answers, key = randomUUID()) => api(`/assessments/placements/${view.id}/submit`, solo.token,
  { method: 'POST', body: { tier, answers }, headers: { 'Idempotency-Key': key } });
const tierKey = randomUUID();
const afterA1 = await submitTier(soloTest, 'A1', tierAnswers(soloTest, true), tierKey);
assert.deepEqual([afterA1.tiers[0].status, afterA1.currentTier], ['passed', 'A2'], 'Palier A1 réussi');
const replayedTier = await submitTier(soloTest, 'A1', tierAnswers(soloTest, true), tierKey);
assert.deepEqual([replayedTier.currentTier, replayedTier.tiers], [afterA1.currentTier, afterA1.tiers], 'La remise rejouée renvoie le même état');
const placed = await submitTier(afterA1, 'A2', tierAnswers(afterA1, false));
assert.equal(placed.status, 'completed');
assert.equal(placed.result.placedLevel, 'A1', 'A1 réussi puis A2 échoué : niveau A1');
assert.ok(placed.retakeAvailableAt, 'Un nouvel essai est possible plus tard');
await post('/assessments/placements', solo.token, { restart: true }, 409);
await api(`/assessments/placements?learnerId=${solo.id}`, teacher.token, { status: 403 });
assert.deepEqual((await api(`/assessments/placements/${placed.id}`, admin.token)).questions, [], 'Un tiers ne voit pas les questions');

// 6. Débutant déclaré : niveau A0 sans questions.
const beginner = await post('/assessments/placements', followedToken, { declaredBeginner: true }, 201);
assert.deepEqual([beginner.status, beginner.result.placedLevel, beginner.result.declaredBeginner], ['completed', 'A0', true]);
assert.equal((await api(`/assessments/placements?learnerId=${followedMe.id}`, teacher.token))[0].placedLevel, 'A0');
await api(`/assessments/placements?learnerId=${followedMe.id}`, otherTeacher.token, { status: 403 });

// 7. Estimation de la charge et barème de difficulté.
const estimate = await post('/learning/paths/estimate', solo.token, { targetLevel: 'A2', startDate: inDays(1), targetDate: inDays(181) });
assert.equal(estimate.startLevel, 'A1', 'Le départ suit le résultat du test');
assert.deepEqual(estimate.levels.map((level) => level.levelCode), ['A2']);
assert.ok(estimate.requiredMinutes > 1000, 'La charge vient du parcours A2 publié');
assert.equal(estimate.difficulty.code, bandOf(estimate.requiredWeeklyMinutes), 'Difficulté selon le barème hebdomadaire');
assert.equal(estimate.bands.length, 6);
const rushed = await post('/learning/paths/estimate', solo.token, { targetLevel: 'A2', startDate: inDays(1), targetDate: inDays(4) });
assert.equal(rushed.difficulty.code, 'unrealistic', 'Trois jours pour un niveau : irréaliste');
await post('/learning/paths', solo.token, { placementAttemptId: placed.id, targetLevel: 'A2', startDate: inDays(1), targetDate: inDays(4) }, 409);

// 10. Élève autonome : contrat accepté d'office au démarrage, avenant accepté immédiatement.
let soloPath = await post('/learning/paths', solo.token,
  { placementAttemptId: placed.id, targetLevel: 'A2', startDate: inDays(1), targetDate: inDays(181) }, 201);
assert.deepEqual([soloPath.status, soloPath.sessions.length, soloPath.permissions.canChangeObjective], ['draft', 0, true]);
const soloProposal = await put(`/learning/paths/${soloPath.id}/availability`, solo.token, { days: fiveDays(45) });
assert.equal(soloProposal.validatable, true, soloProposal.blockingReason);
soloPath = await post(`/learning/paths/${soloPath.id}/proposal/validate`, solo.token, { number: soloProposal.number });
assert.equal(soloPath.status, 'active');
assert.deepEqual([soloPath.contract.current?.number, soloPath.contract.current?.status, soloPath.contract.engaged], [1, 'accepted', true]);
const soloAmendment = await post(`/learning/paths/${soloPath.id}/contracts`, solo.token,
  { targetLevel: 'A2', targetDate: inDays(200), weeklyMinutes: 60, availability: fiveDays(45) }, 201);
assert.deepEqual([soloAmendment.number, soloAmendment.status], [2, 'accepted'], 'L’avenant de l’élève autonome s’applique');
assert.deepEqual((await api(`/learning/paths/${soloPath.id}/contracts`, solo.token)).map((contract) => [contract.number, contract.status]),
  [[2, 'accepted'], [1, 'superseded']]);
assert.equal((await api('/learning/path', solo.token)).targetDate, inDays(200));

// 8. Parcours A0 → A2 de l'élève suivi : brouillon, débordement, deux niveaux sans mélange, démarrage.
let followedPath = await post('/learning/paths', followedToken,
  { placementAttemptId: beginner.id, targetLevel: 'A2', startDate: inDays(1), targetDate: inDays(241) }, 201);
// EVO-039 : le professeur voit l'accueil et le parcours au brouillon tout de suite, sans traitement du Suivi.
const followedLive = (await api('/tracking/overview', teacher.token)).learners.find((row) => row.learnerId === followedMe.id);
assert.deepEqual([followedLive.learning.path.id, followedLive.learning.path.status, followedLive.learning.path.startLevel,
  followedLive.learning.path.activeLevel], [followedPath.id, 'draft', 'A0', null], 'Le parcours au brouillon est visible');
assert.equal(followedLive.learning.onboarding.placement.declaredBeginner, true, 'Débutant déclaré, sans test');
assert.deepEqual(followedLive.learning.onboarding.steps.map((step) => `${step.id}:${step.status}`),
  ['language:done', 'placement:done', 'result:done', 'objective:done', 'days:current', 'planning:todo', 'start:todo']);
assert.equal(followedLive.learning.onboarding.completed, false);
const followedSheet = await api(`/tracking/learners/${followedMe.id}`, teacher.token);
assert.deepEqual([followedSheet.learning.path.status, followedSheet.enrollment], ['draft', null], 'La fiche montre le brouillon');
assert.equal(localQuery(local.container, `select count(*) from tracking.goals where learner_id = '${followedMe.id}';`), '0',
  'Rien dans la projection du Suivi : la vue vient d’Apprentissage');
assert.ok(!(await api('/tracking/overview', otherTeacher.token)).learners.some((row) => row.learnerId === followedMe.id));
assert.deepEqual(followedPath.steps.map((step) => [step.levelCode, step.status]), [['A1', 'planned'], ['A2', 'planned']]);
const overloaded = await put(`/learning/paths/${followedPath.id}/availability`, followedToken,
  { days: [{ weekday: 1, sessions: 1, minutes: 10 }], targetDate: inDays(240) });
assert.ok(overloaded.overflowCount > 0, 'Dix minutes par semaine ne suffisent pas');
assert.equal(overloaded.blockingReason, 'overflow');
assert.ok(overloaded.suggestions.length > 0, 'Des ajustements sont proposés');
await post(`/learning/paths/${followedPath.id}/proposal/validate`, followedToken, { number: overloaded.number }, 409);
const followedProposal = await put(`/learning/paths/${followedPath.id}/availability`, followedToken, { days: fiveDays(60) });
assert.equal(followedProposal.overflowCount, 0);
assert.deepEqual([...new Set(followedProposal.sessions.map((session) => session.levelCode))], ['A1', 'A2'], 'Séances A1 puis A2');
assert.ok(followedProposal.sessions.every((session) => session.items.every((item) => item.levelCode === session.levelCode)),
  'Une séance ne mélange jamais deux niveaux');
assert.deepEqual(followedProposal.levels.map((level) => level.levelCode), ['A1', 'A2']);
await post(`/learning/paths/${followedPath.id}/proposal/validate`, teacher.token, { number: followedProposal.number }, 403);
followedPath = await post(`/learning/paths/${followedPath.id}/proposal/validate`, followedToken, { number: followedProposal.number });
const startedLive = (await api('/tracking/overview', teacher.token)).learners.find((row) => row.learnerId === followedMe.id).learning;
assert.deepEqual([startedLive.path.status, startedLive.path.activeLevel, startedLive.path.goalStatus, startedLive.onboarding.completed],
  ['active', 'A1', 'active', true], 'Démarrage visible sans passage du Suivi');
// EVO-039 : Apprentissage arrêté, la vue d'ensemble et la fiche restent servies (learning null, synthèse du Suivi).
await control('stop', 'learning');
try {
  const degraded = await api('/tracking/overview', teacher.token);
  assert.ok(degraded.learners.length > 0 && degraded.learners.every((row) => row.learning === null && row.progress === null
    && Array.isArray(row.results)), 'Sans Apprentissage : learning null, vue servie');
  const degradedSheet = await api(`/tracking/learners/${followedMe.id}`, teacher.token);
  assert.deepEqual([degradedSheet.learning, degradedSheet.enrollment, degradedSheet.results], [null, null, []]);
  assert.ok(degradedSheet.tracking && degradedSheet.freshness, 'La synthèse du Suivi reste servie');
} finally {
  await control('start', 'learning');
  await ready(8084);
}
assert.deepEqual(followedPath.steps.map((step) => step.status), ['active', 'planned'], 'Niveau 1 actif, niveau 2 prévu');
assert.ok(followedPath.sessions.some((session) => session.levelCode === 'A2' && session.locked && session.id === null),
  'Les séances A2 sont une projection verrouillée');
assert.ok(followedPath.sessions.filter((session) => session.levelCode === 'A1').every((session) => session.id && !session.locked));
assert.equal((await api('/learning/enrollment', followedToken)).pathId, followedPath.id);
assert.deepEqual([followedPath.contract.pending?.number, followedPath.contract.pending?.status, followedPath.contract.engaged],
  [1, 'pending_teacher', false], 'L’élève suivi démarre, son contrat attend le professeur');
assert.equal((await api('/learning/onboarding', followedToken)).completed, true);

// 9. Contrat : contre-proposition, refus, nouvelle proposition, acceptation, engagement.
assert.ok((await api('/learning/contracts/pending', teacher.token)).some((item) => item.pathId === followedPath.id && item.contract.number === 1));
assert.ok(!(await api('/learning/contracts/pending', otherTeacher.token)).some((item) => item.pathId === followedPath.id));
await api('/learning/contracts/pending', followedToken, { status: 403 });
await api(`/learning/path?learnerId=${followedMe.id}`, otherTeacher.token, { status: 403 });
const counterTerms = { targetLevel: 'A2', targetDate: inDays(271), weeklyMinutes: 90, availability: fiveDays(60), note: 'Prenons un mois de plus.' };
await post(`/learning/paths/${followedPath.id}/contracts`, otherTeacher.token, counterTerms, 403);
const counter = await post(`/learning/paths/${followedPath.id}/contracts`, teacher.token, counterTerms, 201);
assert.deepEqual([counter.number, counter.status, counter.proposedBy], [2, 'pending_learner', 'teacher']);
const afterCounter = await api(`/learning/paths/${followedPath.id}/contracts`, followedToken);
assert.deepEqual(afterCounter.map((contract) => [contract.number, contract.status]), [[2, 'pending_learner'], [1, 'rejected']]);
assert.equal(afterCounter[0].canAccept, true);
assert.ok(!(await api('/learning/contracts/pending', teacher.token)).some((item) => item.pathId === followedPath.id),
  'Seuls les contrats en attente du professeur lui sont listés');
await post(`/learning/paths/${followedPath.id}/contracts/2/accept`, teacher.token, {}, 403);
followedPath = await post(`/learning/paths/${followedPath.id}/contracts/2/reject`, followedToken, { note: 'Je préfère garder ma date.' });
assert.deepEqual([followedPath.contract.pending, followedPath.contract.engaged], [null, false]);
const third = await post(`/learning/paths/${followedPath.id}/contracts`, followedToken,
  { targetLevel: 'A2', targetDate: inDays(251), weeklyMinutes: 100, availability: fiveDays(60) }, 201);
assert.deepEqual([third.number, third.status], [3, 'pending_teacher']);
followedPath = await post(`/learning/paths/${followedPath.id}/contracts/3/accept`, teacher.token, { note: 'Validé, bon courage !' });
assert.deepEqual([followedPath.contract.current?.number, followedPath.contract.engaged, followedPath.targetDate], [3, true, inDays(251)]);
const underCommitment = await put(`/learning/paths/${followedPath.id}/availability`, followedToken, { days: [{ weekday: 1, sessions: 1, minutes: 60 }] });
assert.deepEqual([underCommitment.blockingReason, underCommitment.validatable], ['commitment', false], 'Les jours restent au-dessus de l’engagement');
await post(`/learning/paths/${followedPath.id}/proposal/validate`, followedToken, { number: underCommitment.number }, 409);
await put(`/learning/paths/${followedPath.id}/availability`, followedToken, { days: fiveDays(60), targetDate: inDays(300) }, 409);
const restored = await put(`/learning/paths/${followedPath.id}/availability`, teacher.token, { days: fiveDays(60) });
assert.equal(restored.validatable, true, restored.blockingReason);
followedPath = await post(`/learning/paths/${followedPath.id}/proposal/validate`, teacher.token, { number: restored.number });

// 11. Ajout de cours par le professeur : activité d'une autre version, servie depuis sa version source.
const reisenLesson = contentA2.modules.find((module) => module.id === 'a2-reisen').activities.find((activity) => activity.kind === 'lesson');
const additionRequest = { stepLevel: 'A1', trackVersionId: trackA2.versionId, moduleId: 'a2-reisen', activityId: reisenLesson.id,
  placement: 'next', note: 'Pour préparer le voyage.' };
await post(`/learning/paths/${followedPath.id}/additions`, followedToken, additionRequest, 403);
const added = await post(`/learning/paths/${followedPath.id}/additions`, teacher.token, additionRequest, 201);
assert.deepEqual([added.addition.sourceLevelCode, added.addition.status], ['A2', 'planned']);
const addedItem = added.proposal.sessions[0].items[0];
assert.ok(addedItem.id.startsWith('ajout-') && addedItem.id.endsWith(reisenLesson.id), `Élément ajouté en tête : ${addedItem.id}`);
assert.deepEqual([addedItem.sourceVersionId, addedItem.sourceActivityId, addedItem.additionId],
  [trackA2.versionId, reisenLesson.id, added.addition.id]);
assert.equal(added.proposal.validatable, true, added.proposal.blockingReason);
followedPath = await post(`/learning/paths/${followedPath.id}/proposal/validate`, teacher.token, { number: added.proposal.number });
const addedSession = followedPath.sessions.find((session) => session.activities.some((activity) => activity.id === addedItem.id));
assert.ok(addedSession?.id, 'La séance du cours ajouté est ouverte');
assert.ok(addedSession.activities.find((activity) => activity.id === addedItem.id).added);
const addedDetail = (await api(`/learning/sessions/${addedSession.id}`, followedToken)).activities.find((activity) => activity.id === addedItem.id);
assert.equal(addedDetail.title, reisenLesson.title, 'Le contenu vient de la version source');
assert.ok(addedDetail.lesson, 'La leçon ajoutée est servie');
const addedDone = await put(`/learning/sessions/${addedSession.id}/activities/${addedItem.id}/progress`, followedToken, { completed: true });
assert.equal(addedDone.activities.find((activity) => activity.id === addedItem.id).status, 'completed');
assert.equal((await api(`/learning/paths/${followedPath.id}/additions`, followedToken)).find((item) => item.id === added.addition.id).status, 'completed');
await post(`/learning/paths/${followedPath.id}/additions/${added.addition.id}/remove`, teacher.token, {}, 409);

// 12. Passage au niveau suivant : refusé à l'élève avant l'examen blanc, forcé par le professeur.
await post(`/learning/paths/${followedPath.id}/advance`, followedToken, {}, 409);
const firstStep = followedPath.steps[0];
followedPath = await post(`/learning/paths/${followedPath.id}/advance`, teacher.token, {});
assert.deepEqual(followedPath.steps.map((step) => step.status), ['completed', 'active'], 'Le niveau A2 est ouvert');
const secondEnrollment = followedPath.steps[1].enrollmentId;
assert.equal(localQuery(local.container, `select status from learning.enrollments where id = '${firstStep.enrollmentId}';`), 'completed');
assert.equal((await api('/learning/enrollment', followedToken)).id, secondEnrollment);
const stepEvents = sqlList(`select string_agg(distinct type, ',' order by type) from learning.outbox_events
  where data->>'enrollmentId' = '${secondEnrollment}';`);
for (const type of ['learning.goal_set', 'learning.plan_validated']) assert.ok(stepEvents.includes(type), `${type} émis pour le niveau A2`);
const pathEvents = sqlList(`select string_agg(distinct type, ',' order by type) from learning.outbox_events
  where subject_id = '${followedPath.id}' or subject_id like '${followedPath.id}:%';`);
for (const type of ['learning.path_created', 'learning.path_started', 'learning.path_step_activated', 'learning.contract_proposed',
  'learning.contract_rejected', 'learning.contract_accepted', 'learning.path_addition_created']) {
  assert.ok(pathEvents.includes(type), `Événement ${type} enregistré`);
}
assert.equal(localQuery(local.container, `select count(*) from learning.outbox_events
  where subject_kind in ('path', 'contract') and data::jsonb ? 'enrollmentId';`), '0', 'Aucun événement de parcours ne porte enrollmentId');

// 13. Bibliothèque : tous les niveaux publiés, activité avec ses supports, exercice libre corrigé.
const learnerLibrary = await api('/learning/library', solo.token);
assert.equal(learnerLibrary.languageId, 'de');
const libraryA1 = learnerLibrary.levels.find((level) => level.levelCode === 'A1');
assert.equal(libraryA1.trackVersionId, trackA1.versionId);
assert.ok(learnerLibrary.levels.find((level) => level.levelCode === 'A2').current, 'Le niveau en cours est signalé');
assert.deepEqual(libraryA1.practice.map((item) => [item.kind, item.available]), [['midterm', true], ['final', false]],
  'L’examen de passage de niveau n’est pas proposé en entraînement');
const dialog = await api(`/learning/library/${trackA1.versionId}/activities/a1-hallo-dialog`, solo.token);
assert.deepEqual([dialog.status, dialog.trackVersionId, dialog.moduleId], ['todo', trackA1.versionId, 'a1-hallo']);
const dialogFile = dialog.placements.find((placement) => placement.url);
assert.ok(dialogFile && (await fetch(dialogFile.url, { signal: AbortSignal.timeout(8_000) })).ok, 'Le support de l’activité est lisible');
const freeExercise = libraryA1.modules.flatMap((module) => module.activities)
  .find((activity) => activity.kind === 'exercise' && isTyped(contentActivities.get(activity.id)));
assert.ok(freeExercise, 'La bibliothèque A1 propose un exercice à questions typées');
const freeDetail = await api(`/learning/library/${trackA1.versionId}/activities/${freeExercise.id}`, solo.token);
assertNoLeak([freeDetail], 'Bibliothèque');
const freeLesson = freeDetail.lesson?.id ?? freeExercise.lessonId;
await api('/assessments/quiz', solo.token, { method: 'POST', headers: { 'Idempotency-Key': randomUUID() },
  body: { lessonId: freeLesson, answers: { q1: 'a' } }, status: 409 });
const freeAnswers = await answerActivity({ api, token: solo.token, content: contentActivities.get(freeExercise.id), view: freeDetail, lessonId: freeLesson });
const freeResult = await submitExercise({ api, token: solo.token, lessonId: freeLesson, ...freeAnswers });
assertAllRight(freeResult, 'Exercice libre');
const freeGrade = freeResult.grade;
assert.deepEqual(await api(`/assessments/exercises/${freeGrade.id}`, solo.token), freeResult, 'Le corrigé figé est relu à l’identique');
await api(`/assessments/exercises/${freeGrade.id}`, teacher.token, { status: 403 });
const libraryAgain = (await api('/learning/library', solo.token)).levels.find((level) => level.levelCode === 'A1');
assert.equal(libraryAgain.modules.flatMap((module) => module.activities).find((activity) => activity.id === freeExercise.id).lastResult?.correct,
  freeGrade.correct, 'Le dernier score est affiché');
await api(`/learning/library?learnerId=${solo.id}`, teacher.token, { status: 403 });
assert.ok((await api(`/learning/library?learnerId=${followedMe.id}`, teacher.token)).levels.length >= 2, 'Le référent consulte la bibliothèque');

// 14. Examen blanc d'entraînement : bilan intermédiaire seulement, sans corrigé, sans événement, nouvel essai après 12 h.
const assessmentEvents = () => localQuery(local.container, 'select count(*) from assessment.outbox_events;');
const eventsBefore = assessmentEvents();
const practiceRequest = { trackVersionId: trackA1.versionId, kind: 'midterm' };
await post('/assessments/practice', solo.token, { ...practiceRequest, kind: 'final' }, 409);
const practice = await post('/assessments/practice', solo.token, practiceRequest, 201);
assert.equal(practice.mode, 'practice');
const closedParts = practice.definition.parts.filter((part) => part.mode === 'closed');
assert.ok(closedParts.length > 0 && closedParts.every((part) => part.questions.every((question) =>
  question.options.every((option) => !('correct' in option)))), 'Aucun corrigé dans l’entraînement');
assert.equal((await post('/assessments/practice', solo.token, practiceRequest)).id, practice.id, 'L’entraînement en cours est repris');
await put(`/assessments/practice/${practice.id}/answers`, solo.token, { answers: Object.fromEntries(closedParts.map((part) =>
  [part.id, Object.fromEntries(part.questions.map((question) => [question.id, question.options[0].id]))])) });
const practiceKey = randomUUID();
const submitPractice = () => api(`/assessments/practice/${practice.id}/submit`, solo.token,
  { method: 'POST', body: {}, headers: { 'Idempotency-Key': practiceKey } });
const practiced = await submitPractice();
assert.equal(practiced.status, 'submitted');
assert.ok(Number.isInteger(practiced.result.percent) && practiced.nextAttemptAt, 'Score par partie, nouvel essai daté');
assert.equal((await submitPractice()).submittedAt, practiced.submittedAt, 'La remise rejouée ne compte qu’une fois');
await post('/assessments/practice', solo.token, practiceRequest, 409);
assert.equal((await api('/assessments/practice', solo.token)).find((item) => item.id === practice.id).percent, practiced.result.percent);
assert.equal(assessmentEvents(), eventsBefore, 'L’entraînement n’émet aucun événement');
console.log('Recette des parcours réussie · langues, banque du test de niveau, test à paliers idempotent, débutant déclaré, '
  + 'estimation et difficulté, parcours A0 → A2 sans mélange de niveaux, contrat (contre-proposition, refus, acceptation, '
  + 'engagement), avenant autonome, ajout de cours d’une autre version, passage forcé, bibliothèque et entraînement sans événement.');

// --- V4 : corrigé par question, répétition orale validée, missions et lexique ------------------------------------
// 1. L'ancienne route des quiz refuse une leçon typée, mais corrige toujours la leçon de démonstration.
const demoQuiz = await api('/assessments/quiz', learnerToken, { method: 'POST', headers: { 'Idempotency-Key': randomUUID() },
  body: { lessonId: lesson.id, answers: { 'cafe-question': 'cafe' } } });
assert.deepEqual([demoQuiz.correct, demoQuiz.typed, demoQuiz.pending, demoQuiz.flagged], [1, false, 0, []], 'La leçon de démonstration reste un quiz');

// 2. Répétition orale : trois échecs → « à revoir » chez le référent et en bibliothèque, puis la reprise efface le marquage.
const speakActivity = activitiesOf(contentA1).find((activity) => activity.questions?.some((question) => question.type === 'speak'));
assert.ok(speakActivity, 'Le contenu A1 contient une répétition orale');
const speakQuestion = speakActivity.questions.find((question) => question.type === 'speak');
const speakView = await api(`/learning/library/${trackA1.versionId}/activities/${speakActivity.id}`, followedToken);
assertNoLeak([speakView], 'Répétition');
const speakLesson = speakView.lesson?.id ?? libraryA1.modules.flatMap((module) => module.activities).find((item) => item.id === speakActivity.id).lessonId;
const speakRound = await answerActivity({ api, token: followedToken, content: speakActivity, view: speakView, lessonId: speakLesson,
  fail: [speakQuestion.id] });
const flaggedResult = await submitExercise({ api, token: followedToken, lessonId: speakLesson, ...speakRound });
assert.deepEqual([flaggedResult.grade.flagged, flaggedResult.grade.correct, flaggedResult.grade.total],
  [[speakQuestion.id], speakView.questions.length - 1, speakView.questions.length], 'Trois échecs : la phrase est à revoir et comptée fausse');
assert.equal(flaggedResult.questions.find((question) => question.id === speakQuestion.id).status, 'flagged');
assert.ok((await api(`/assessments/results?learnerId=${followedMe.id}`, teacher.token)).some((grade) => grade.id === flaggedResult.grade.id
  && grade.flagged.includes(speakQuestion.id)), 'Le référent voit la phrase à revoir');
const toReview = async () => (await api('/learning/library', followedToken)).levels.find((level) => level.levelCode === 'A1').modules
  .flatMap((module) => module.activities).find((activity) => activity.id === speakActivity.id).toReview;
assert.equal(await toReview(), true, 'La bibliothèque marque l’exercice « à revoir »');
const redone = await answerActivity({ api, token: followedToken, content: speakActivity, view: speakView, lessonId: speakLesson });
assertAllRight(await submitExercise({ api, token: followedToken, lessonId: speakLesson, ...redone }), 'Reprise de la répétition');
assert.equal(await toReview(), false, 'La reprise en bibliothèque efface le marquage');

// 3. Enregistrement de repli : en attente du professeur, visible dans sa file, puis validé (correct + 1, pending 0).
const recordedRound = await answerActivity({ api, token: followedToken, content: speakActivity, view: speakView, lessonId: speakLesson,
  record: [speakQuestion.id], upload: uploadRecording(followedToken) });
const pendingResult = await submitExercise({ api, token: followedToken, lessonId: speakLesson, ...recordedRound });
assert.deepEqual([pendingResult.grade.pending, pendingResult.grade.correct], [1, pendingResult.grade.total - 1], 'Répétition en attente');
const speechId = recordedRound.attempts[speakQuestion.id].id;
assert.ok((await api('/assessments/reviews', teacher.token)).some((item) => item.kind === 'speech' && item.id === speechId
  && item.context === 'library'), 'Le référent reçoit la répétition enregistrée');
await api('/assessments/reviews', followedToken, { status: 403 });
await api(`/assessments/speech/${speechId}`, otherTeacher.token, { status: 403 });
assert.ok((await api(`/assessments/speech/${speechId}`, teacher.token)).recording?.url, 'Le professeur écoute l’enregistrement');
await post(`/assessments/speech/${speechId}/review`, otherTeacher.token, { decision: 'validated' }, 403);
assert.equal((await post(`/assessments/speech/${speechId}/review`, teacher.token, { decision: 'validated', comment: 'Bien prononcé.' })).reviewStatus, 'validated');
const validatedResult = await api(`/assessments/exercises/${pendingResult.grade.id}`, followedToken);
assert.deepEqual([validatedResult.grade.correct, validatedResult.grade.pending], [validatedResult.grade.total, 0], 'Validée : correct + 1, pending 0');
assert.equal(validatedResult.questions.find((question) => question.id === speakQuestion.id).status, 'correct');

// 4. Missions : élève suivi → son référent (refusée à un tiers), à reprendre puis numéro 2 ; contrôles de remise.
const missionA1 = activitiesOf(contentA1).find((activity) => activity.kind === 'mission');
const missionA2 = activitiesOf(contentA2).find((activity) => activity.kind === 'mission');
assert.ok(missionA1 && missionA2, 'Les contenus A1 et A2 contiennent des missions');
const missionOpen = { trackVersionId: trackA1.versionId, activityId: missionA1.id };
const draft = await post('/assessments/missions', followedToken, missionOpen, 201);
assert.deepEqual([draft.number, draft.status, draft.sessionId], [1, 'draft', null], 'Brouillon de bibliothèque');
assert.equal((await post('/assessments/missions', followedToken, missionOpen)).id, draft.id, 'Le brouillon ouvert est repris (200)');
await put(`/assessments/missions/${draft.id}`, followedToken, { text: 'x'.repeat(1_501) }, 400);
await put(`/assessments/missions/${draft.id}`, followedToken, { checklist: [0] });
await api(`/assessments/missions/${draft.id}/submit`, followedToken, { method: 'POST', body: {}, headers: { 'Idempotency-Key': randomUUID() }, status: 409 });
await api(`/assessments/missions/${draft.id}/submit`, followedToken, { method: 'POST', body: {}, status: 400 });
await put(`/assessments/missions/${draft.id}`, teacher.token, { checklist: [] }, 404);
const followedMission = await completeMission({ api, token: followedToken, mission: draft, upload: uploadRecording(followedToken) });
assert.deepEqual([followedMission.status, followedMission.reviewerKind], ['submitted', 'teacher'], 'La mission arrive chez le référent');
assert.ok((await api('/assessments/reviews', teacher.token)).some((item) => item.kind === 'mission' && item.id === draft.id
  && item.context === 'library'), 'Elle figure dans la file du référent');
assert.ok(!(await api('/assessments/reviews', otherTeacher.token)).some((item) => item.id === draft.id), 'Pas dans celle d’un tiers');
await api(`/assessments/missions/${draft.id}`, otherTeacher.token, { status: 403 });
await post(`/assessments/missions/${draft.id}/review`, otherTeacher.token, { decision: 'validated', comment: 'Bien.' }, 403);
const teacherMission = await api(`/assessments/missions/${draft.id}`, teacher.token);
assert.ok(teacherMission.canReview && teacherMission.recording?.url, 'Le référent lit le texte et écoute l’enregistrement');
await post(`/assessments/missions/${draft.id}/review`, teacher.token, { decision: 'to_redo', comment: '' }, 400);
const toRedo = await post(`/assessments/missions/${draft.id}/review`, teacher.token,
  { decision: 'to_redo', comment: 'Ajoutez votre ville et relisez la place du verbe.' });
assert.deepEqual([toRedo.status, toRedo.review?.decision], ['reviewed', 'to_redo']);
assert.equal((await api(`/assessments/missions/${draft.id}`, followedToken)).review.comment, 'Ajoutez votre ville et relisez la place du verbe.');
const secondTry = await post('/assessments/missions', followedToken, { ...missionOpen, restart: true }, 201);
assert.deepEqual([secondTry.number, secondTry.status, secondTry.text], [2, 'draft', followedMission.text], 'Reprise : numéro 2 prérempli');
assert.ok((await api(`/assessments/missions?learnerId=${followedMe.id}`, teacher.token)).filter((item) => item.activityId === missionA1.id).length >= 2);

// Élève autonome avec correcteur désigné : la mission arrive chez le correcteur ; sans correcteur : envoyée (auto-vérification).
const reviewerMission = await sendMission({ api, token: a2Learner.token, upload: uploadRecording(a2Learner.token),
  open: { trackVersionId: trackA2.versionId, activityId: missionA2.id } });
assert.deepEqual([reviewerMission.status, reviewerMission.reviewerKind], ['submitted', 'reviewer'], 'La mission arrive chez le correcteur');
assert.ok((await api('/assessments/reviews', staffToken)).some((item) => item.id === reviewerMission.id));
assert.equal((await post(`/assessments/missions/${reviewerMission.id}/review`, staffToken,
  { decision: 'validated', comment: 'Très clair, bravo.' })).review.decision, 'validated');
const soloMission = await sendMission({ api, token: solo.token, upload: uploadRecording(solo.token),
  open: { trackVersionId: trackA2.versionId, activityId: missionA2.id } });
assert.deepEqual([soloMission.status, soloMission.reviewerKind, soloMission.canReview], ['sent', null, false], 'Sans correcteur : envoyée');
await post(`/assessments/missions/${soloMission.id}/review`, admin.token, { decision: 'validated', comment: 'Bien.' }, 409);

// 5. Mission de séance : l'activité se termine avec l'identifiant de la mission envoyée au référent.
const missionSessionRow = (await api('/learning/enrollment', a1Learner.token)).sessions.find((session) => session.status !== 'completed'
  && session.activities.some((activity) => activity.kind === 'mission') && !session.activities.some((activity) => activity.kind === 'assessment'));
assert.ok(missionSessionRow, 'Une séance A1 contient une mission');
const missionWorked = await workSession(missionSessionRow.id, a1Learner.token);
assert.equal(missionWorked.session.status, 'completed', 'La séance avec mission se termine');
assert.ok(missionWorked.missions.length && missionWorked.missions.every((mission) => mission.reviewerKind === 'teacher'));
assert.ok((await api('/assessments/reviews', teacher.token)).some((item) => item.id === missionWorked.missions[0].id && item.context === 'session'));

// 6. Lexique de séance et de bibliothèque : adresses présentes et segments ordonnés.
const checkLexicon = async (lexicon, label) => {
  assert.ok(lexicon?.entries?.length > 0, `${label} : lexique servi`);
  for (const entry of lexicon.entries) {
    assert.ok(entry.audio?.url && entry.audio.start < entry.audio.end, `${label} : son de « ${entry.word} »`);
    if (entry.partOfSpeech === 'noun' && !/pluriel/.test(entry.note ?? '')) assert.ok(entry.article, `${label} : article de ${entry.word}`);
  }
  assert.ok((await fetch(lexicon.entries[0].audio.url, { signal: AbortSignal.timeout(8_000) })).ok, `${label} : son lisible`);
};
await checkLexicon(missionWorked.lexicon, 'Séance');
const lexiconPath = `/learning/library/${trackA1.versionId}/modules/${missionWorked.session.moduleId}/lexicon`;
await checkLexicon(await api(lexiconPath, followedToken), 'Bibliothèque');
await checkLexicon(await api(`${lexiconPath}?learnerId=${followedMe.id}`, teacher.token), 'Bibliothèque vue du référent');
await api(`${lexiconPath}?learnerId=${followedMe.id}`, otherTeacher.token, { status: 403 });
// Chaque niveau importé (A1, A2, B1) porte un lexique par module ; le niveau de démonstration de la recette n'en a pas.
const importedCodes = imported.map((result) => result.levelId.toUpperCase());
for (const level of (await api('/learning/library', followedToken)).levels.filter((item) => importedCodes.includes(item.levelCode))) {
  assert.deepEqual(level.modules.filter((module) => !(module.vocabularyCount > 0)).map((module) => module.id), [],
    `Lexique annoncé pour chaque module ${level.levelCode}`);
}

// 7. Événements de la V4 : publiés sans enrollmentId, traités par le suivi sans erreur.
const v4Events = sqlList(`select string_agg(distinct type, ',' order by type) from assessment.outbox_events
  where subject_kind in ('exercise', 'mission');`);
for (const type of ['assessment.exercise_flagged', 'assessment.mission_reviewed', 'assessment.mission_submitted']) {
  assert.ok(v4Events.includes(type), `Événement ${type} enregistré`);
}
assert.equal(localQuery(local.container, `select count(*) from assessment.outbox_events
  where subject_kind in ('exercise', 'mission') and data::jsonb ? 'enrollmentId';`), '0', 'Aucun événement V4 ne porte enrollmentId');
await runJob();
console.log('Recette V4 réussie · corrigé par question sans fuite, quiz refusé sur une leçon typée, répétition orale à revoir puis '
  + 'reprise, enregistrement validé par le référent, missions (référent, tiers refusé, à reprendre, correcteur désigné, '
  + 'auto-vérification, séance), lexiques et événements.');

// --- Cours B1 : niveaux dynamiques, consignes bilingues, parcours A2 → B1, missions sur grille, test de niveau -------------
// Le B1 importé plus haut (content/de/b1, format 5) est le vrai niveau publié ; le B2 l'est aussi dès que content/de/b2
// existe (phase 2, section suivante), sinon il reste au catalogue en brouillon ; le niveau de démonstration C1 de la
// recette a été retiré à la fin de la section des évaluations.
const codesOf = (levels) => levels.map((level) => level.code);
const glossedB1 = (prompt) => prompt.includes(' [fr] ') && !prompt.includes('[fr?]');

// 1. Route publique : sans session, niveaux publiés seulement, dans l'ordre des positions, mise en cache cinq minutes.
const publicResponse = await fetch(`${gateway}/api/v1/public/languages`, { signal: AbortSignal.timeout(12_000) });
assert.equal(publicResponse.status, 200, 'GET /public/languages répond sans session');
assert.equal(publicResponse.headers.get('cache-control'), 'public, max-age=300', 'La liste publique se met en cache cinq minutes');
const publicLanguages = await publicResponse.json();
assert.deepEqual(publicLanguages.map((language) => language.id), ['de'], 'Seules les langues ayant un niveau publié sont listées');
const publicGerman = publicLanguages[0].levels;
assert.deepEqual(codesOf(publicGerman), publishedCodes,
  `${listedCodes} publiés, dans l’ordre ; ${hasB2 ? 'ni le C1 retiré' : 'ni B2 (brouillon) ni le C1 retiré'}`);
assert.deepEqual(publicGerman.map((level) => level.position), publishedCodes.map((_, index) => index + 1));
assert.ok(publicGerman.every((level) => level.moduleCount > 0 && level.plannedMinutes > 0), 'Modules et durée prévue de chaque niveau');
assert.deepEqual(Object.keys(publicGerman[2]).sort(), ['code', 'moduleCount', 'plannedMinutes', 'position', 'title'],
  'La route publique ne donne que des données publiques');
await api('/public/languages?level=B1', null, { status: 400 });

// 2. GET /languages : tous les niveaux du catalogue, leur position, leur prérequis et les paliers du test publié.
const germanCatalogue = (await api('/languages', teacher.token)).find((language) => language.id === 'de');
const catalogueLevel = (code) => germanCatalogue.levels.find((level) => level.code === code);
const positionsOf = germanCatalogue.levels.map((level) => level.position ?? Number.MAX_SAFE_INTEGER);
assert.deepEqual(positionsOf, [...positionsOf].sort((a, b) => a - b), 'Niveaux dans l’ordre du catalogue');
const plannedOf = (level) => activitiesOf(level).reduce((sum, activity) => sum + activity.estimatedMinutes, 0)
  + level.settings.reviewMinutes * level.modules.filter((module) => module.activities.length).length
  + level.settings.midtermMinutes + level.settings.finalMinutes;
const languageB1 = catalogueLevel('B1');
assert.deepEqual([languageB1.published, languageB1.position, languageB1.prerequisiteCode, languageB1.trackVersionId],
  [true, 3, 'A2', trackB1.versionId], 'B1 publié, en position 3, après A2');
assert.equal(languageB1.plannedMinutes, plannedOf(contentB1), 'Durée prévue du B1 : activités, révisions, bilan et examen blanc');
assert.equal(languageB1.moduleCount, contentB1.modules.length);
assert.deepEqual([catalogueLevel('B2')?.published, catalogueLevel('B2')?.position, catalogueLevel('B2')?.prerequisiteCode],
  [hasB2, 4, 'B1'], hasB2 ? 'B2 publié, en position 4, après B1' : 'B2 au catalogue, en brouillon');
if (hasB2) {
  assert.equal(catalogueLevel('B2').trackVersionId, trackB2.versionId);
  assert.equal(catalogueLevel('B2').plannedMinutes, plannedOf(contentB2), 'Durée prévue du B2 : activités, révisions, bilan et examen blanc');
  assert.equal(catalogueLevel('B2').moduleCount, contentB2.modules.length);
}
assert.equal(catalogueLevel(DEMO)?.published, false, 'Le niveau de démonstration retiré n’est plus publié');
assert.deepEqual(germanCatalogue.placementTiers, ['A1', 'A2'], 'Paliers de la banque publiée (recette)');
const learnerLevels = codesOf(await api('/levels', learnerToken));
assert.ok(learnerLevels.includes('B1') && learnerLevels.includes('B2') === hasB2 && !learnerLevels.includes(DEMO),
  'Un élève ne voit que les niveaux ouverts');

// 3. Modèles de rythme : A1 et A2 calibrés, tout autre niveau selon la formule (minutes prévues × 1,25 / capacité / 4,345).
const rhythmTemplates = await api('/learning/templates', learnerToken);
const b1Months = {};
const b2Months = {};
for (const [id, weekly, a1Months, a2Months] of [['standard', 150, 5, 5], ['intensive', 630, 1, 2]]) {
  const model = rhythmTemplates.find((template) => template.id === id);
  assert.deepEqual(model.durations.map((duration) => duration.levelCode), publishedCodes, `${id} : une durée par niveau publié`);
  const months = Object.fromEntries(model.durations.map((duration) => [duration.levelCode, duration.months]));
  assert.deepEqual([months.A1, months.A2], [a1Months, a2Months], `${id} : durées A1 et A2 inchangées`);
  assert.equal(model.durations.find((duration) => duration.levelCode === 'B1').plannedMinutes, languageB1.plannedMinutes);
  assert.equal(months.B1, Math.max(1, Math.ceil((languageB1.plannedMinutes * 1.25) / weekly / 4.345)), `${id} : durée B1 selon la formule`);
  if (hasB2) {
    const plannedB2 = catalogueLevel('B2').plannedMinutes;
    assert.equal(model.durations.find((duration) => duration.levelCode === 'B2').plannedMinutes, plannedB2);
    assert.equal(months.B2, Math.max(1, Math.ceil((plannedB2 * 1.25) / weekly / 4.345)), `${id} : durée B2 selon la formule`);
    b2Months[id] = months.B2;
  }
  assert.ok(typeof model.a1Duration === 'string' && typeof model.a2Duration === 'string', 'Les anciens champs restent servis');
  b1Months[id] = months.B1;
}

// 4. Bibliothèque B1 : énoncés bilingues transmis tels quels, aucun corrigé, grille des missions avant la remise.
const b1Reader = await createAccount('b1-lecteur', 'learner', teacher.id);
localSql(local.container, `update identity.profiles set language_id = 'de' where id = '${b1Reader.id}';`);
const readerB1 = (await api('/learning/library', b1Reader.token)).levels.find((level) => level.levelCode === 'B1');
assert.equal(readerB1?.trackVersionId, trackB1.versionId, 'La bibliothèque propose le B1 publié');
assert.deepEqual(readerB1.modules.map((module) => module.id), contentB1.modules.map((module) => module.id));
let glossedPrompts = 0;
for (const module of readerB1.modules) {
  assert.ok(module.vocabularyCount > 0, `Lexique annoncé pour ${module.id}`);
  for (const [index, item] of module.activities.filter((activity) => activity.kind !== 'lesson').entries()) {
    const served = await api(`/learning/library/${trackB1.versionId}/activities/${item.id}`, b1Reader.token);
    assertNoLeak([served], `Bibliothèque B1 (${item.id})`);
    const source = contentActivities.get(item.id);
    for (const question of served.questions) {
      assert.equal(question.prompt, source.questions.find((entry) => entry.id === question.id).prompt, `${item.id}/${question.id} : énoncé transmis tel quel`);
      assert.ok(glossedB1(question.prompt), `${item.id}/${question.id} : consigne allemande et traduction [fr]`);
      glossedPrompts++;
    }
    if (served.kind === 'mission') {
      const grid = served.mission?.criteria ?? [];
      assert.ok([4, 5].includes(grid.length) && grid.reduce((sum, criterion) => sum + criterion.maxPoints, 0) === 20,
        `${item.id} : grille de 20 points servie avant la remise`);
      assert.ok(!JSON.stringify(served).includes('"points"'), `${item.id} : aucun point avant le retour`);
    }
    // Aperçu de la leçon (route des leçons) : vues élève sans corrigé, sur le premier exercice de chaque module.
    if (index === 0) assert.deepEqual(leaks((await api(`/lessons/${item.lessonId}`, b1Reader.token)).questions), [], `Aperçu de ${item.id} sans corrigé`);
  }
}
assert.ok(glossedPrompts >= 300, `Énoncés B1 bilingues contrôlés : ${glossedPrompts}`);

// 5. Parcours A2 → B1 : estimation, attribution avec le prérequis A2 confirmé par le diagnostic, séances B1 travaillées.
const b1Learner = await createAccount('b1-parcours', 'learner', teacher.id);
localSql(local.container, `update identity.profiles set language_id = 'de' where id = '${b1Learner.id}';`);
const b1Estimate = await post('/learning/paths/estimate', b1Learner.token,
  { startLevel: 'A2', targetLevel: 'B1', startDate: inDays(1), targetDate: inDays(240) });
assert.deepEqual(b1Estimate.allowedTargets, hasB2 ? ['B1', 'B2'] : ['B1'],
  hasB2 ? 'Depuis A2 : B1 puis B2, tous deux publiés' : 'Depuis A2 : B1 seulement, B2 n’est pas publié');
assert.deepEqual(b1Estimate.levels.map((level) => [level.levelCode, level.trackVersionId]), [['B1', trackB1.versionId]]);
// B2 non publié : aucune estimation vers B2 (la section B2 vérifie le cas publié).
if (!hasB2) await post('/learning/paths/estimate', b1Learner.token, { startLevel: 'B1', targetLevel: 'B2', startDate: inDays(1), targetDate: inDays(240) }, 409);
await post('/learning/enrollments', otherTeacher.token, { learnerId: b1Learner.id, trackVersionId: trackB1.versionId, startLevel: 'A2',
  template: 'standard', startDate: inDays(1) }, 403);
const b1Course = await post('/learning/enrollments', teacher.token, { learnerId: b1Learner.id, trackVersionId: trackB1.versionId,
  startLevel: 'A2', template: 'standard', startDate: inDays(1) }, 201);
assert.deepEqual([b1Course.goal.prerequisiteLevel, b1Course.goal.prerequisiteMet], ['A2', false], 'Le B1 exige l’A2 : à confirmer par le diagnostic');
assert.ok(contentB1.diagnostic.questions.some((question) => question.moduleRef === 'prerequis'), 'Le diagnostic B1 évalue les acquis A2');
const b1Diagnostic = await api(goalPath(b1Course.id, 'diagnostic'), b1Learner.token);
const b1DiagnosticGrade = await api('/assessments/diagnostics', b1Learner.token, { method: 'POST',
  headers: { 'Idempotency-Key': randomUUID() }, body: { lessonId: b1Diagnostic.lessonId, answers: diagnosticAnswers(contentB1, ['prerequis']) } });
const b1Diagnosed = await post(goalPath(b1Course.id, 'diagnostic'), b1Learner.token, { attemptId: b1DiagnosticGrade.id });
assert.equal(b1Diagnosed.goal.diagnosticPrerequisite, true, 'Le diagnostic confirme les acquis A2');
// Élève suivi : le diagnostic propose, le référent confirme le point de départ (comme en A2).
const b1Confirmed = await put(goalPath(b1Course.id, 'starting-point'), teacher.token,
  { acquiredModules: b1Diagnosed.goal.diagnosticModules ?? [], prerequisiteMet: true });
assert.equal(b1Confirmed.goal.prerequisiteMet, true, 'Le référent confirme le prérequis A2');
const b1Proposal = await api(goalPath(b1Course.id, 'proposal'), teacher.token);
assert.equal(b1Proposal.overflowCount, 0, 'Le B1 tient dans la durée conseillée du modèle standard');
const b1Plan = await post(goalPath(b1Course.id, 'proposal/validate'), teacher.token, { number: b1Proposal.number });
assert.equal(b1Plan.goal.status, 'active');
await checkSupports(await api(`/learning/sessions/${b1Plan.sessions[0].id}`, b1Learner.token));
const b1Types = new Set();
let b1Worked = 0;
for (const session of b1Plan.sessions) {
  if ((b1Types.has('speak') && b1Types.has('dictation')) || b1Worked >= 12) break;
  const before = await api(`/learning/sessions/${session.id}`, b1Learner.token);
  if (before.activities.some((activity) => activity.kind === 'assessment')) continue;
  for (const activity of before.activities) {
    for (const question of activity.questions ?? []) assert.ok(glossedB1(question.prompt), `Séance B1 : ${activity.id}/${question.id} bilingue`);
  }
  const worked = await workSession(session.id, b1Learner.token);
  assert.equal(worked.session.status, 'completed', `Séance B1 ${session.id} terminée`);
  for (const activity of worked.activities.filter((item) => item.kind === 'exercise')) {
    for (const question of sourceOf(activity).questions ?? []) b1Types.add(question.type ?? 'choice');
  }
  b1Worked++;
}
assert.ok(b1Types.has('speak') && b1Types.has('dictation'), `Séances B1 travaillées (${b1Worked}) : répétitions et dictées réussies`);

// Parcours A0 → B1 en trois étapes : le prérequis de chaque étape vient du catalogue, pas du rang dans l'échelle.
const stepLearner = await createAccount('b1-etapes', 'learner', teacher.id);
localSql(local.container, `update identity.profiles set language_id = 'de' where id = '${stepLearner.id}';`);
const stepBeginner = await post('/assessments/placements', stepLearner.token, { declaredBeginner: true }, 201);
let stepPath = await post('/learning/paths', stepLearner.token,
  { placementAttemptId: stepBeginner.id, targetLevel: 'B1', startDate: inDays(1), targetDate: inDays(540) }, 201);
assert.deepEqual(stepPath.steps.map((step) => step.levelCode), ['A1', 'A2', 'B1'], 'Parcours A1 → B1 en trois étapes');
const stepProposal = await put(`/learning/paths/${stepPath.id}/availability`, stepLearner.token, { days: fiveDays(60) });
assert.equal(stepProposal.validatable, true, stepProposal.blockingReason);
assert.deepEqual(stepProposal.levels.map((level) => level.levelCode), ['A1', 'A2', 'B1']);
stepPath = await post(`/learning/paths/${stepPath.id}/proposal/validate`, stepLearner.token, { number: stepProposal.number });
stepPath = await post(`/learning/paths/${stepPath.id}/contracts/1/accept`, teacher.token, { note: 'Bon parcours jusqu’au B1.' });
stepPath = await post(`/learning/paths/${stepPath.id}/advance`, teacher.token, {});
assert.deepEqual([stepPath.steps.map((step) => step.status), (await api('/learning/enrollment', stepLearner.token)).goal.prerequisiteLevel],
  [['completed', 'active', 'planned'], 'A1'], 'Étape A2 ouverte, prérequis A1 lu dans le catalogue');
const b1Catalogue = { title: contentB1.catalogue.title, description: contentB1.catalogue.description, position: contentB1.catalogue.position };
await put('/catalogue/levels/b1', staffToken, { ...b1Catalogue, prerequisiteLevelId: 'a1' });
try {
  stepPath = await post(`/learning/paths/${stepPath.id}/advance`, teacher.token, {});
  const stepB1 = await api('/learning/enrollment', stepLearner.token);
  assert.deepEqual([stepB1.levelCode, stepB1.goal.prerequisiteLevel], ['B1', 'A1'], 'Le prérequis de l’étape B1 suit le catalogue, pas le rang (A2)');
} finally {
  await put('/catalogue/levels/b1', staffToken, { ...b1Catalogue, prerequisiteLevelId: 'a2' });
}
assert.equal((await api('/tracks', teacher.token)).find((track) => track.levelCode === 'B1').prerequisiteLevelCode, 'A2', 'Prérequis rétabli');

// 6. Missions sur grille : écrit noté critère par critère par le référent, oral élargi, mission A2 sans grille inchangée.
const missionsB1 = activitiesOf(contentB1).filter((activity) => activity.kind === 'mission');
for (const module of contentB1.modules.filter((item) => item.id.endsWith('-atelier'))) {
  assert.deepEqual(module.activities.filter((activity) => activity.kind === 'mission').map((activity) => activity.id.split('-').at(-1)).sort(),
    ['schreiben', 'sprechen'], `${module.id} : une mission écrite et une mission orale`);
}
const writtenB1 = missionsB1.find((activity) => activity.mission.written && !activity.mission.oral);
const oralB1 = missionsB1.filter((activity) => activity.mission.oral && !activity.mission.written)
  .sort((a, b) => b.mission.oral.maxSeconds - a.mission.oral.maxSeconds)[0];
assert.ok(writtenB1 && oralB1, 'Missions écrites et orales B1');
assert.ok(oralB1.mission.oral.maxSeconds > 120, `Bornes élargies : oral B1 de ${oralB1.mission.oral.maxSeconds} s`);
const writtenDraft = await post('/assessments/missions', b1Learner.token, { trackVersionId: trackB1.versionId, activityId: writtenB1.id }, 201);
assert.deepEqual([writtenDraft.review, writtenDraft.definition.criteria], [null, writtenB1.mission.criteria], 'La grille est figée dans la remise');
await put(`/assessments/missions/${writtenDraft.id}`, b1Learner.token, { text: 'x'.repeat(3_001) }, 400);
await put(`/assessments/missions/${writtenDraft.id}`, b1Learner.token, { text: 'x'.repeat(writtenB1.mission.written.maxChars + 1) }, 400);
const writtenSent = await completeMission({ api, token: b1Learner.token, mission: writtenDraft });
assert.deepEqual([writtenSent.status, writtenSent.reviewerKind], ['submitted', 'teacher'], 'L’écrit B1 arrive chez le référent');
assert.ok((await api('/assessments/reviews', teacher.token)).some((item) => item.kind === 'mission' && item.id === writtenDraft.id
  && item.levelCode === 'B1'), 'Il figure dans la file du référent');
const grid = writtenDraft.definition.criteria;
const fullPoints = Object.fromEntries(grid.map((criterion) => [criterion.id, criterion.maxPoints]));
const reviewWritten = (body, status) => post(`/assessments/missions/${writtenDraft.id}/review`, teacher.token, body, status);
await reviewWritten({ decision: 'validated', comment: 'Bien.' }, 400);
await reviewWritten({ decision: 'validated', comment: 'Bien.', points: Object.fromEntries(Object.entries(fullPoints).slice(1)) }, 400);
await reviewWritten({ decision: 'validated', comment: 'Bien.', points: { ...fullPoints, [grid[0].id]: grid[0].maxPoints + 1 } }, 400);
await reviewWritten({ decision: 'validated', comment: 'Bien.', points: { ...fullPoints, [grid[0].id]: -1 } }, 400);
await reviewWritten({ decision: 'validated', comment: 'Bien.', points: { ...fullPoints, inconnu: 1 } }, 400);
await reviewWritten({ decision: 'to_redo', comment: '', points: fullPoints }, 400);
await post(`/assessments/missions/${writtenDraft.id}/review`, otherTeacher.token, { decision: 'validated', comment: 'Bien.', points: fullPoints }, 403);
const givenPoints = { ...fullPoints, [grid[0].id]: grid[0].maxPoints - 2 };
const gridComment = 'Points forts : message clair et bien organisé.\nÀ retravailler : place du verbe après « weil » (St).\nRelance : quelle question poseriez-vous ?';
const reviewedB1 = await reviewWritten({ decision: 'validated', comment: gridComment, points: givenPoints });
assert.deepEqual([reviewedB1.status, reviewedB1.review.decision, reviewedB1.review.score, reviewedB1.review.maxScore], ['reviewed', 'validated', 18, 20]);
const seenB1 = await api(`/assessments/missions/${writtenDraft.id}`, b1Learner.token);
assert.deepEqual([seenB1.review.points, seenB1.review.score, seenB1.review.comment], [givenPoints, 18, gridComment], 'L’élève voit points, score et commentaire');
const summaryB1 = (await api('/assessments/missions', b1Learner.token)).find((item) => item.id === writtenDraft.id);
assert.deepEqual([summaryB1.score, summaryB1.maxScore], [18, 20]);
assert.equal(localQuery(local.container, `select concat(data->>'score', '/', data->>'maxScore') from assessment.outbox_events
  where type = 'assessment.mission_reviewed' and subject_id = '${writtenDraft.id}';`), '18/20', 'L’événement du retour porte le score');
const oralSent = await sendMission({ api, token: b1Learner.token, upload: uploadRecording(b1Learner.token),
  open: { trackVersionId: trackB1.versionId, activityId: oralB1.id } });
assert.deepEqual([oralSent.status, oralSent.definition.oral.maxSeconds, oralSent.definition.criteria.length],
  ['submitted', oralB1.mission.oral.maxSeconds, oralB1.mission.criteria.length], 'L’oral B1 enregistré part chez le référent avec sa grille');
const a2Sent = await sendMission({ api, token: b1Learner.token, upload: uploadRecording(b1Learner.token),
  open: { trackVersionId: trackA2.versionId, activityId: missionA2.id } });
assert.deepEqual(a2Sent.definition.criteria, [], 'Mission A2 sans grille');
await post(`/assessments/missions/${a2Sent.id}/review`, teacher.token, { decision: 'validated', comment: 'Bien.', points: { aufgabe: 3 } }, 400);
await post(`/assessments/missions/${a2Sent.id}/review`, teacher.token, { decision: 'validated', comment: 'Bien.', points: {} }, 400);
const a2Reviewed = await post(`/assessments/missions/${a2Sent.id}/review`, teacher.token, { decision: 'validated', comment: 'Bien.' });
assert.deepEqual([a2Reviewed.review.points, a2Reviewed.review.score, a2Reviewed.review.maxScore], [null, null, null], 'Retour A2 inchangé');

// 7. Test de niveau : un palier par niveau publié (A1, A2, B1, puis B2 en phase 2). Sans B2 publié, B1 réussi et B2
//    annoncé « bientôt », jamais comme ouvert ; avec B2, quatre paliers réussis donnent B2, et un élève qui échoue au
//    palier B2 est placé en B1 avec le B2 annoncé comme ouvert.
const tierCodes = publishedCodes;
const tieredBank = await post('/catalogue/placement-tests', staffToken, { languageId: 'de' }, 201);
const tieredSaved = await put(`/catalogue/placement-tests/${tieredBank.id}`, staffToken,
  { title: `Test de niveau de recette (${tierCodes.length} paliers)`, description: 'Un palier de lecture par niveau publié.',
    tiers: tierCodes.map((code) => bankTier(code)) });
assert.equal(tieredSaved.checks.publishable, true, JSON.stringify(tieredSaved.checks.issues));
await post(`/catalogue/placement-tests/${tieredBank.id}/publish`, staffToken);
assert.deepEqual((await api('/languages', teacher.token)).find((language) => language.id === 'de').placementTiers, tierCodes,
  'Les paliers suivent la banque publiée');
/** Passe le test de niveau à paliers : chaque palier réussi (choix « a »), sauf ceux de `failed` (choix « b »). */
const takePlacement = async (label, failed = []) => {
  const learner = await createAccount(label, 'learner', null);
  await put('/me/language', learner.token, { languageId: 'de' });
  let attempt = await post('/assessments/placements', learner.token, {}, 201);
  const seen = [];
  while (attempt.status === 'in_progress') {
    const code = attempt.currentTier;
    seen.push(code);
    assert.equal(code, tierCodes[seen.length - 1], 'Les paliers se suivent dans l’ordre du test');
    attempt = await api(`/assessments/placements/${attempt.id}/submit`, learner.token, { method: 'POST', headers: { 'Idempotency-Key': randomUUID() },
      body: { tier: code, answers: Object.fromEntries(attempt.questions.map((question) => [question.id, failed.includes(code) ? 'b' : 'a'])) } });
  }
  return attempt;
};
const tiered = await takePlacement('b1-test-niveau');
assert.deepEqual([tiered.status, tiered.result.placedLevel], ['completed', tierCodes.at(-1)], `${tierCodes.length} paliers réussis : niveau ${tierCodes.at(-1)}`);
if (!hasB2) {
  assert.match(tiered.result.summary, /B2 arrive bientôt/, 'Le niveau suivant non publié est annoncé « bientôt »');
  assert.doesNotMatch(tiered.result.summary, /commencer au niveau B2/, 'B2 n’est jamais présenté comme ouvert');
} else {
  assert.match(tiered.result.summary, /jusqu.à B2/, 'Quatre paliers réussis : le résumé annonce le niveau B2');
  assert.doesNotMatch(tiered.result.summary, /B2 arrive bientôt/, 'Le B2 publié n’est plus annoncé « bientôt »');
  const stoppedAtB2 = await takePlacement('b2-test-niveau', ['B2']);
  assert.deepEqual([stoppedAtB2.status, stoppedAtB2.result.placedLevel], ['completed', 'B1'], 'Palier B2 échoué : niveau B1');
  assert.match(stoppedAtB2.result.summary, /peut commencer au niveau B2/, 'Le B2 publié est annoncé comme ouvert après le palier B1');
}

// 8. Indicateurs : filtre B1 accepté, parcours B1 comptés.
await runJob();
const b1Kpis = await api('/tracking/kpis' + horizon + '&level=B1', admin.token);
assert.ok(b1Kpis.goals >= 1, 'Les parcours B1 de la recette sont comptés');
console.log(`Recette B1 réussie · route publique (${publishedCodes.join(', ')}) mise en cache, niveaux dynamiques `
  + `(${hasB2 ? 'B2 publié' : 'B2 en brouillon'}, C1 retiré), durées B1 de `
  + `${b1Months.standard} mois en standard et ${b1Months.intensive} en intensif, ${glossedPrompts} énoncés bilingues sans corrigé, prérequis A2 par `
  + `le diagnostic, ${b1Worked} séances B1 justes (répétitions, dictées, missions), étapes A1 → B1 au prérequis du catalogue, écrit noté 18/20 sur `
  + `grille (refus contrôlés), oral de ${oralB1.mission.oral.maxSeconds} s, mission A2 inchangée, test de niveau à `
  + `${tierCodes.length} paliers et indicateurs B1.`);

// --- Cours B2 (phase 2) : quatre niveaux publiés, aide française repliée, parcours B1 → B2, missions B2 sur grille -------
// Joué dès que content/de/b2 est construit et importé (génération G2) ; les attentes générales (route publique, catalogue,
// modèles de rythme, test de niveau à quatre paliers) sont vérifiées plus haut.
if (hasB2) {
  const noBesideGloss = (prompt) => !prompt.includes('[fr]');
  // 1. Bibliothèque B2 : énoncés transmis tels quels, jamais de traduction affichée [fr], aucun corrigé, grille avant la remise.
  const b2Reader = await createAccount('b2-lecteur', 'learner', teacher.id);
  localSql(local.container, `update identity.profiles set language_id = 'de' where id = '${b2Reader.id}';`);
  const readerB2 = (await api('/learning/library', b2Reader.token)).levels.find((level) => level.levelCode === 'B2');
  assert.equal(readerB2?.trackVersionId, trackB2.versionId, 'La bibliothèque propose le B2 publié');
  assert.deepEqual(readerB2.modules.map((module) => module.id), contentB2.modules.map((module) => module.id));
  let servedB2 = 0;
  let foldedB2 = 0;
  for (const module of readerB2.modules) {
    assert.ok(module.vocabularyCount > 0, `Lexique annoncé pour ${module.id}`);
    for (const [index, item] of module.activities.filter((activity) => activity.kind !== 'lesson').entries()) {
      const served = await api(`/learning/library/${trackB2.versionId}/activities/${item.id}`, b2Reader.token);
      assertNoLeak([served], `Bibliothèque B2 (${item.id})`);
      const source = contentActivities.get(item.id);
      for (const question of served.questions) {
        assert.equal(question.prompt, source.questions.find((entry) => entry.id === question.id).prompt, `${item.id}/${question.id} : énoncé transmis tel quel`);
        assert.ok(noBesideGloss(question.prompt), `${item.id}/${question.id} : au B2, aide repliée [fr?] et jamais [fr]`);
        servedB2++;
        if (question.prompt.includes(' [fr?] ')) foldedB2++;
      }
      if (served.kind === 'mission') {
        const grid = served.mission?.criteria ?? [];
        assert.ok([4, 5].includes(grid.length) && grid.reduce((sum, criterion) => sum + criterion.maxPoints, 0) === 20,
          `${item.id} : grille de 20 points servie avant la remise`);
        assert.ok(grid.every((criterion) => noBesideGloss(criterion.label)), `${item.id} : grille B2 en allemand, aide repliée`);
        assert.ok(!JSON.stringify(served).includes('"points"'), `${item.id} : aucun point avant le retour`);
      }
      if (index === 0) assert.deepEqual(leaks((await api(`/lessons/${item.lessonId}`, b2Reader.token)).questions), [], `Aperçu de ${item.id} sans corrigé`);
    }
  }
  assert.ok(servedB2 >= 300 && foldedB2 > 0, `Énoncés B2 contrôlés : ${servedB2}, dont ${foldedB2} avec l’aide repliée`);

  // 2. Parcours B1 → B2 : estimation, attribution avec le prérequis B1 confirmé par le diagnostic, séances B2 travaillées.
  const b2Learner = await createAccount('b2-parcours', 'learner', teacher.id);
  localSql(local.container, `update identity.profiles set language_id = 'de' where id = '${b2Learner.id}';`);
  const b2Estimate = await post('/learning/paths/estimate', b2Learner.token,
    { startLevel: 'B1', targetLevel: 'B2', startDate: inDays(1), targetDate: inDays(240) });
  assert.deepEqual(b2Estimate.allowedTargets, ['B2'], 'Depuis B1 : B2');
  assert.deepEqual(b2Estimate.levels.map((level) => [level.levelCode, level.trackVersionId]), [['B2', trackB2.versionId]]);
  const twoLevels = await post('/learning/paths/estimate', b2Learner.token,
    { startLevel: 'A2', targetLevel: 'B2', startDate: inDays(1), targetDate: inDays(540) });
  assert.deepEqual(twoLevels.levels.map((level) => level.levelCode), ['B1', 'B2'], 'Depuis A2 : B1 puis B2');
  const b2Course = await post('/learning/enrollments', teacher.token, { learnerId: b2Learner.id, trackVersionId: trackB2.versionId,
    startLevel: 'B1', template: 'standard', startDate: inDays(1) }, 201);
  assert.deepEqual([b2Course.goal.prerequisiteLevel, b2Course.goal.prerequisiteMet], ['B1', false], 'Le B2 exige le B1 : à confirmer par le diagnostic');
  assert.ok(contentB2.diagnostic.questions.some((question) => question.moduleRef === 'prerequis'), 'Le diagnostic B2 évalue les acquis B1');
  const b2Diagnostic = await api(goalPath(b2Course.id, 'diagnostic'), b2Learner.token);
  const b2DiagnosticGrade = await api('/assessments/diagnostics', b2Learner.token, { method: 'POST',
    headers: { 'Idempotency-Key': randomUUID() }, body: { lessonId: b2Diagnostic.lessonId, answers: diagnosticAnswers(contentB2, ['prerequis']) } });
  const b2Diagnosed = await post(goalPath(b2Course.id, 'diagnostic'), b2Learner.token, { attemptId: b2DiagnosticGrade.id });
  assert.equal(b2Diagnosed.goal.diagnosticPrerequisite, true, 'Le diagnostic confirme les acquis B1');
  // Élève suivi : le diagnostic propose, le référent confirme le point de départ.
  const b2Confirmed = await put(goalPath(b2Course.id, 'starting-point'), teacher.token,
    { acquiredModules: b2Diagnosed.goal.diagnosticModules ?? [], prerequisiteMet: true });
  assert.equal(b2Confirmed.goal.prerequisiteMet, true, 'Le référent confirme le prérequis B1');
  const b2Proposal = await api(goalPath(b2Course.id, 'proposal'), teacher.token);
  assert.equal(b2Proposal.overflowCount, 0, 'Le B2 tient dans la durée conseillée du modèle standard');
  const b2Plan = await post(goalPath(b2Course.id, 'proposal/validate'), teacher.token, { number: b2Proposal.number });
  assert.equal(b2Plan.goal.status, 'active');
  await checkSupports(await api(`/learning/sessions/${b2Plan.sessions[0].id}`, b2Learner.token));
  const b2Types = new Set();
  let b2Worked = 0;
  for (const session of b2Plan.sessions) {
    if (b2Types.has('speak') || b2Worked >= 14) break;
    const before = await api(`/learning/sessions/${session.id}`, b2Learner.token);
    if (before.activities.some((activity) => activity.kind === 'assessment')) continue;
    for (const activity of before.activities) {
      for (const question of activity.questions ?? []) assert.ok(noBesideGloss(question.prompt), `Séance B2 : ${activity.id}/${question.id} sans [fr]`);
    }
    const worked = await workSession(session.id, b2Learner.token);
    assert.equal(worked.session.status, 'completed', `Séance B2 ${session.id} terminée`);
    for (const activity of worked.activities.filter((item) => item.kind === 'exercise')) {
      for (const question of sourceOf(activity).questions ?? []) b2Types.add(question.type ?? 'choice');
    }
    b2Worked++;
  }
  assert.ok(b2Types.has('speak'), `Séances B2 travaillées (${b2Worked}) : répétitions de la discussion réussies (seuil 70)`);

  // 3. Parcours A0 → B2 en quatre étapes : le prérequis de chaque étape vient du catalogue.
  const b2StepLearner = await createAccount('b2-etapes', 'learner', teacher.id);
  localSql(local.container, `update identity.profiles set language_id = 'de' where id = '${b2StepLearner.id}';`);
  const b2Beginner = await post('/assessments/placements', b2StepLearner.token, { declaredBeginner: true }, 201);
  const b2Path = await post('/learning/paths', b2StepLearner.token,
    { placementAttemptId: b2Beginner.id, targetLevel: 'B2', startDate: inDays(1), targetDate: inDays(760) }, 201);
  assert.deepEqual(b2Path.steps.map((step) => step.levelCode), ['A1', 'A2', 'B1', 'B2'], 'Parcours A1 → B2 en quatre étapes');
  const b2PathProposal = await put(`/learning/paths/${b2Path.id}/availability`, b2StepLearner.token, { days: fiveDays(60) });
  assert.deepEqual(b2PathProposal.levels.map((level) => level.levelCode), ['A1', 'A2', 'B1', 'B2']);

  // 4. Missions B2 : écrit de plus de 1 500 caractères accepté et noté sur grille, oral long.
  const missionsB2 = activitiesOf(contentB2).filter((activity) => activity.kind === 'mission');
  for (const module of contentB2.modules.filter((item) => item.id.endsWith('-atelier'))) {
    assert.deepEqual(module.activities.filter((activity) => activity.kind === 'mission').map((activity) => activity.id.split('-').at(-1)).sort(),
      ['schreiben', 'sprechen'], `${module.id} : une mission écrite et une mission orale`);
  }
  const writtenB2 = missionsB2.filter((activity) => activity.mission.written && !activity.mission.oral)
    .sort((a, b) => b.mission.written.maxChars - a.mission.written.maxChars)[0];
  const oralB2 = missionsB2.filter((activity) => activity.mission.oral && !activity.mission.written)
    .sort((a, b) => b.mission.oral.maxSeconds - a.mission.oral.maxSeconds)[0];
  assert.ok(writtenB2 && oralB2, 'Missions écrites et orales B2');
  const b2Draft = await post('/assessments/missions', b2Learner.token, { trackVersionId: trackB2.versionId, activityId: writtenB2.id }, 201);
  assert.deepEqual([b2Draft.review, b2Draft.definition.criteria], [null, writtenB2.mission.criteria], 'La grille B2 est figée dans la remise');
  const maxChars = writtenB2.mission.written.maxChars;
  await put(`/assessments/missions/${b2Draft.id}`, b2Learner.token, { text: 'x'.repeat(maxChars + 1) }, 400);
  const longText = 'Ich halte diese Lösung für sinnvoll. '.repeat(Math.floor(maxChars / 37)).trim();
  assert.ok(longText.length > 1500 || maxChars < 1540, 'Texte de recette au-delà de l’ancienne limite de 1 500 caractères');
  await put(`/assessments/missions/${b2Draft.id}`, b2Learner.token, { text: longText });
  const b2Sent = await completeMission({ api, token: b2Learner.token, mission: b2Draft });
  assert.deepEqual([b2Sent.status, b2Sent.reviewerKind], ['submitted', 'teacher'], 'L’écrit B2 arrive chez le référent');
  const b2Grid = b2Draft.definition.criteria;
  const b2Points = Object.fromEntries(b2Grid.map((criterion, index) => [criterion.id, criterion.maxPoints - (index === 0 ? 3 : 0)]));
  await post(`/assessments/missions/${b2Draft.id}/review`, teacher.token, { decision: 'validated', comment: 'Gut.' }, 400);
  const b2Reviewed = await post(`/assessments/missions/${b2Draft.id}/review`, teacher.token,
    { decision: 'validated', comment: 'Stärken: klarer Aufbau.\nNoch üben: Konnektoren (St).\nRückfrage: Welches Beispiel überzeugt Sie am meisten?', points: b2Points });
  assert.deepEqual([b2Reviewed.review.score, b2Reviewed.review.maxScore], [17, 20], 'Écrit B2 noté 17/20 sur la grille');
  assert.deepEqual((await api(`/assessments/missions/${b2Draft.id}`, b2Learner.token)).review.points, b2Points, 'L’élève voit ses points');
  const b2Oral = await sendMission({ api, token: b2Learner.token, upload: uploadRecording(b2Learner.token),
    open: { trackVersionId: trackB2.versionId, activityId: oralB2.id } });
  assert.deepEqual([b2Oral.status, b2Oral.definition.oral.maxSeconds, b2Oral.definition.criteria.length],
    ['submitted', oralB2.mission.oral.maxSeconds, oralB2.mission.criteria.length], 'L’oral B2 enregistré part chez le référent avec sa grille');

  // 5. Indicateurs : filtre B2 accepté, parcours B2 comptés.
  await runJob();
  const b2Kpis = await api('/tracking/kpis' + horizon + '&level=B2', admin.token);
  assert.ok(b2Kpis.goals >= 1, 'Les parcours B2 de la recette sont comptés');
  console.log(`Recette B2 réussie · quatre niveaux publiés (route publique, catalogue, durées B2 de ${b2Months.standard} mois en standard `
    + `et ${b2Months.intensive} en intensif), ${servedB2} énoncés B2 sans [fr] ni corrigé (${foldedB2} avec l’aide repliée, `
    + `${b2FoldedPrompts} au catalogue), prérequis B1 par le diagnostic, ${b2Worked} séances B2 justes (répétitions de la `
    + `discussion), étapes A1 → B2, écrit de ${longText.length} caractères noté 17/20, oral de ${oralB2.mission.oral.maxSeconds} s, `
    + 'test de niveau à quatre paliers (B2, et B1 avec B2 ouvert) et indicateurs B2.');
} else {
  console.log('Recette B2 non jouée : content/de/b2 n’est pas encore construit (le B2 reste au catalogue en brouillon).');
}

// --- Ciné-club : film d'essai importé par l'API, lecture sans corrigé, remise et corrigé, mots, propositions (EVO-055) ---
// Film d'essai propre à la recette (identifiant fixe, réimporté à chaque passage, retiré à la fin) : aucun accès à YouTube,
// l'identifiant de vidéo n'est jamais chargé. Les films réels (content/de/cine) ne sont ni lus ni modifiés.
{
  const filmId = 'recette-cine';
  const cineQuestions = (extra = []) => [
    { id: 'q1', type: 'choice', prompt: 'Où se passe la scène ?', explanation: 'Les annonces et les quais situent la scène à la gare.',
      options: [{ id: 'a', label: 'À la gare', correct: true, feedback: 'Oui : on entend les annonces.' },
        { id: 'b', label: 'Au café', correct: false }] },
    { id: 'q2', type: 'choice', prompt: 'Que demande le personnage ?', explanation: 'Il demande le chemin vers son hôtel.',
      options: [{ id: 'a', label: 'Son chemin', correct: true }, { id: 'b', label: 'Un billet', correct: false }] },
    { id: 'q3', type: 'fill', prompt: 'Complétez la phrase.', explanation: 'ankommen est séparable : la particule va à la fin.',
      spec: { text: 'Der Zug [[1]] um zehn Uhr an.', blanks: [{ id: '1', accept: ['kommt'] }] } },
    { id: 'q4', type: 'order', prompt: 'Remettez les mots dans l’ordre.', explanation: 'Le verbe conjugué est en deuxième position.',
      spec: { answers: [['Ich', 'suche', 'den', 'Bahnhof.']] } },
    { id: 'q5', type: 'match', prompt: 'Associez chaque mot à sa traduction.', explanation: 'Vocabulaire de la séquence.',
      spec: { pairs: [{ left: 'der Bahnhof', right: 'la gare' }, { left: 'die Fahrkarte', right: 'le billet' }] } },
    ...extra,
  ];
  const cineSequence = (number, start, questions = cineQuestions()) => ({
    id: `${filmId}-0${number}`, position: number, title: `Séquence ${number}`, start, end: start + 420, approx: number === 2,
    context: 'Avant de regarder : le personnage arrive en ville. [fr] Que cherche-t-il ?',
    keywords: [
      { word: 'Bahnhof', article: 'der', plural: 'Bahnhöfe', translation: 'la gare', note: null },
      { word: 'Fahrkarte', article: 'die', plural: 'Fahrkarten', translation: 'le billet' },
      { word: 'ankommen', translation: 'arriver', note: 'séparable : an|kommen' },
      { word: 'Entschuldigung', translation: 'pardon' }],
    questions,
  });
  const filmDocument = (first = cineQuestions()) => ({
    format: 1,
    film: { id: filmId, languageId: 'de', levelId: 'a1', title: 'Film de recette', description: 'Film d’essai de la recette.',
      provider: 'youtube', videoId: 'AbCdEfGhIj0', channel: 'Chaîne de recette', videoUrl: 'https://www.youtube.com/watch?v=AbCdEfGhIj0',
      courseUrl: 'https://example.org/cours', credit: 'Film : recette, lecteur YouTube', licenseNote: 'Essai de recette.',
      durationSeconds: 3600, position: 99 },
    sequences: [cineSequence(1, 0, first), cineSequence(2, 420)],
  });
  const firstLesson = `cine-${filmId}-01`;

  // 1. Comptes : élève accompagné, élève autonome et son correcteur désigné, professeur tiers.
  const cineLearner = await createAccount('cine-eleve', 'learner', teacher.id);
  const cineAuto = await createAccount('cine-autonome', 'learner', null);
  localSql(local.container, `update identity.profiles set language_id = 'de' where id in ('${cineLearner.id}', '${cineAuto.id}');`);
  const cineReviewer = await createStaff('cine-correcteur', 'staff');
  await put(`/admin/users/${cineReviewer.id}/permissions`, admin.token, { permissions: ['correction'] });
  assert.equal((await put(`/admin/users/${cineAuto.id}/reviewer`, admin.token, { reviewerId: cineReviewer.id })).user.reviewerId,
    cineReviewer.id);
  const cineOutsider = await createStaff('cine-tiers', 'teacher');

  // 2. Import par l'API (administration) : structure contrôlée, brouillon invisible des élèves.
  await put(`/catalogue/films/${filmId}`, cineLearner.token, filmDocument(), 403);
  await api('/catalogue/films', teacher.token, { status: 403 });
  const badBounds = filmDocument();
  badBounds.sequences[0].end = 120;
  assert.match((await put(`/catalogue/films/${filmId}`, admin.token, badBounds, 400)).message, /3 à 15 minutes/);
  const badVideo = filmDocument();
  badVideo.film.videoUrl = 'https://example.org/video.mp4';
  assert.match((await put(`/catalogue/films/${filmId}`, admin.token, badVideo, 400)).message, /youtube\.com\/watch/);
  const withTranscript = filmDocument();
  withTranscript.sequences[0].transcript = 'Texte recopié';
  const transcriptRefusal = await fetch(`${gateway}/api/v1/catalogue/films/${filmId}`, { method: 'PUT',
    headers: { Authorization: `Bearer ${admin.token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(withTranscript), signal: AbortSignal.timeout(12_000) });
  assert.equal(transcriptRefusal.status, 400, 'Aucune transcription ne peut entrer au catalogue');
  let imported = await put(`/catalogue/films/${filmId}`, admin.token, filmDocument());
  if (imported.film.status === 'published') {
    await post(`/catalogue/films/${filmId}/retire`, admin.token);
    imported = await api(`/catalogue/films/${filmId}`, admin.token);
  }
  assert.deepEqual([imported.film.status, imported.checks.publishable, imported.sequences.map((sequence) => sequence.lessonId)],
    ['draft', true, [firstLesson, `cine-${filmId}-02`]]);
  assert.equal(imported.sequences[0].questions[0].options[0].correct, true, 'L’éditeur relit le corrigé');
  assert.deepEqual((await put(`/catalogue/films/${filmId}`, admin.token, imported)).sequences.map((sequence) => sequence.id),
    [`${filmId}-01`, `${filmId}-02`], 'Le document de l’éditeur fait l’aller-retour');
  assert.ok((await api('/catalogue/films', admin.token)).some((film) => film.id === filmId && film.sequenceCount === 2));
  await api(`/films/${filmId}`, cineLearner.token, { status: 404 });
  await api(`/lessons/${firstLesson}`, cineLearner.token, { status: 404 });
  await submitExercise({ api: (path, token, options) => api(path, token, { ...options, status: 404 }), token: cineLearner.token,
    lessonId: firstLesson, roundId: randomUUID(), answers: { q1: { choice: 'a' } } });
  assert.ok(!(await api('/films?languageId=de&level=A1', cineLearner.token)).some((film) => film.id === filmId),
    'Un film en brouillon n’est pas proposé');

  // 3. Publication et lecture sans corrigé (liste, film, leçon « après »).
  assert.equal((await post(`/catalogue/films/${filmId}/publish`, admin.token)).status, 'published');
  assert.equal((await post(`/catalogue/films/${filmId}/publish`, admin.token)).status, 'published', 'Publier deux fois ne change rien');
  const listed = (await api('/films?languageId=de&level=A1', cineLearner.token)).find((film) => film.id === filmId);
  assert.ok(listed, 'Le film publié est proposé au niveau A1');
  assert.deepEqual([listed.sequences.length, listed.sequences[0].questions, listed.sequences[0].questionCount], [2, null, 5]);
  assert.ok(!(await api('/films?languageId=de&level=A2', cineLearner.token)).some((film) => film.id === filmId));
  await api('/films?level=a1', cineLearner.token, { status: 400 });
  const servedFilm = await api(`/films/${filmId}`, cineLearner.token);
  assert.deepEqual(leaks(servedFilm), [], 'Aucun corrigé dans le film servi');
  assert.deepEqual([servedFilm.credit, servedFilm.videoId, servedFilm.sequences[1].approx], ['Film : recette, lecteur YouTube', 'AbCdEfGhIj0', true]);
  const servedLesson = await api(`/lessons/${firstLesson}`, cineLearner.token);
  assert.deepEqual(leaks(servedLesson), [], 'Aucun corrigé dans la leçon « après »');
  assert.equal(servedLesson.transcript, null);
  assert.deepEqual(servedLesson.questions.map((question) => question.id), servedFilm.sequences[0].questions.map((question) => question.id));

  // 4. Remise hors séance et corrigé par question (clé d'exercice servie pour une leçon sans version).
  const cineRound = await answerActivity({ api, token: cineLearner.token, content: { questions: cineQuestions() },
    view: servedFilm.sequences[0], lessonId: firstLesson });
  const cineResult = await submitExercise({ api, token: cineLearner.token, lessonId: firstLesson, ...cineRound });
  assertAllRight(cineResult, 'Questions « après » du film');
  assert.equal((await api(`/assessments/exercises/${cineResult.grade.id}`, teacher.token)).questions.length, 5,
    'Le référent relit le corrigé');
  const wrong = await submitExercise({ api, token: cineLearner.token, lessonId: firstLesson, roundId: randomUUID(),
    answers: { ...cineRound.answers, q1: { choice: 'b' } } });
  const wrongReview = wrong.questions.find((question) => question.id === 'q1');
  assert.deepEqual([wrong.grade.correct, wrongReview.status], [4, 'incorrect'], 'Une mauvaise réponse est corrigée');
  assert.ok(wrongReview.explanation, 'L’explication est servie après la remise');
  // Réimport d'un film publié : la clé n'est pas figée, la nouvelle question est corrigée aussitôt.
  const sixth = { id: 'q6', type: 'choice', prompt: 'Le personnage est-il pressé ?', explanation: 'Il court vers le quai.',
    options: [{ id: 'a', label: 'Oui', correct: true }, { id: 'b', label: 'Non', correct: false }] };
  assert.equal((await put(`/catalogue/films/${filmId}`, admin.token, filmDocument(cineQuestions([sixth])))).film.status, 'published');
  const incomplete = filmDocument(cineQuestions().slice(0, 4));
  assert.match((await put(`/catalogue/films/${filmId}`, admin.token, incomplete, 409)).message, /5 à 8 questions/,
    'Un film publié exige un document complet');
  const reread = await api(`/films/${filmId}`, cineLearner.token);
  assert.equal(reread.sequences[0].questions.length, 6);
  const sixRound = await answerActivity({ api, token: cineLearner.token, content: { questions: cineQuestions([sixth]) },
    view: reread.sequences[0], lessonId: firstLesson });
  const sixResult = await submitExercise({ api, token: cineLearner.token, lessonId: firstLesson, ...sixRound });
  assertAllRight(sixResult, 'Film réimporté');
  assert.equal(sixResult.grade.total, 6);

  // 5. Carnet de mots : l'élève note, corrige et supprime ; son référent lit ; un tiers est refusé.
  const noted = await post('/learning/words', cineLearner.token,
    { word: ' Bahnhof ', note: 'la gare', sourceKind: 'film', sourceId: `${filmId}-01` }, 201);
  assert.deepEqual([noted.word, noted.note, noted.sourceKind, noted.sourceId, noted.languageId],
    ['Bahnhof', 'la gare', 'film', `${filmId}-01`, 'de']);
  await post('/learning/words', cineLearner.token, { word: 'bahnhof', note: '', sourceKind: 'film', sourceId: `${filmId}-01` }, 409);
  const manual = await post('/learning/words', cineLearner.token, { word: 'doch', note: 'si (réponse)', sourceKind: 'manual', sourceId: null }, 201);
  await post('/learning/words', cineLearner.token, { word: 'Termin', note: '', sourceKind: 'activity',
    sourceId: `${a1.versionId}/hallo` }, 201);
  await post('/learning/words', cineLearner.token, { word: 'Zug', sourceKind: 'manual', sourceId: `${filmId}-01` }, 400);
  await post('/learning/words', teacher.token, { word: 'Zug', sourceKind: 'manual', sourceId: null }, 403);
  const edited = await api(`/learning/words/${noted.id}`, cineLearner.token, { method: 'PATCH', body: { note: 'la gare (f. : die Station)' } });
  assert.equal(edited.note, 'la gare (f. : die Station)');
  await api(`/learning/words/${noted.id}`, teacher.token, { method: 'PATCH', body: { note: 'x' }, status: 403 });
  await api(`/learning/words/${manual.id}`, cineAuto.token, { method: 'DELETE', status: 404 });
  assert.deepEqual(await api(`/learning/words/${manual.id}`, cineLearner.token, { method: 'DELETE' }), { id: manual.id, deleted: true });
  const carnet = await api('/learning/words', cineLearner.token);
  assert.deepEqual(carnet.map((word) => word.word), ['Termin', 'Bahnhof']);
  assert.equal((await api(`/learning/words?learnerId=${cineLearner.id}`, teacher.token)).length, 2, 'Le référent lit le carnet');
  await api(`/learning/words?learnerId=${cineLearner.id}`, cineOutsider.token, { status: 403 });
  await api(`/learning/words?learnerId=${cineLearner.id}`, cineAuto.token, { status: 403 });
  await api('/learning/words', teacher.token, { status: 403 });

  // 6. Séquences proposées : référent, correcteur désigné et administration ; tiers et élève refusés.
  const proposal = { learnerId: cineLearner.id, sequenceId: `${filmId}-02`, note: 'Regarde-la avant jeudi.' };
  const proposed = await post('/learning/film-recommendations', teacher.token, proposal, 201);
  assert.deepEqual([proposed.filmId, proposed.recommendedByRole, proposed.dismissedAt], [filmId, 'teacher', null]);
  await post('/learning/film-recommendations', teacher.token, proposal, 409);
  await post('/learning/film-recommendations', cineOutsider.token, proposal, 403);
  await post('/learning/film-recommendations', cineReviewer.token, proposal, 403);
  await post('/learning/film-recommendations', cineLearner.token, proposal, 403);
  await post('/learning/film-recommendations', teacher.token, { ...proposal, sequenceId: 'film-inconnu-01' }, 404);
  const byReviewer = await post('/learning/film-recommendations', cineReviewer.token,
    { learnerId: cineAuto.id, sequenceId: `${filmId}-01`, note: '' }, 201);
  assert.equal(byReviewer.recommendedByRole, 'reviewer');
  assert.equal((await post('/learning/film-recommendations', admin.token,
    { learnerId: cineAuto.id, sequenceId: `${filmId}-02` }, 201)).recommendedByRole, 'admin');
  await api(`/learning/film-recommendations?learnerId=${cineAuto.id}`, cineOutsider.token, { status: 403 });
  assert.equal((await api(`/learning/film-recommendations?learnerId=${cineAuto.id}`, cineReviewer.token)).length, 2);

  // 7. Agrégation : dernier résultat, mots par séquence, propositions en cours ; puis l'élève écarte la proposition.
  let cine = await api('/learning/cine?level=A1', cineLearner.token);
  let cineFilm = cine.films.find((film) => film.id === filmId);
  assert.deepEqual([cine.languageId, cine.level, cine.wordCount], ['de', 'A1', 2]);
  assert.deepEqual([cineFilm.sequences[0].lastResult?.attemptId, cineFilm.sequences[0].lastResult?.total], [sixResult.grade.id, 6],
    'Le dernier résultat est la remise la plus récente');
  assert.deepEqual(cineFilm.sequences[0].words.map((word) => word.word), ['Bahnhof']);
  assert.equal(cineFilm.sequences[1].recommendation?.id, proposed.id);
  assert.ok(cine.recommendations.some((item) => item.id === proposed.id));
  assert.deepEqual(leaks(cine.films.map((film) => film.sequences.map(({ lastResult, ...sequence }) => sequence))), [],
    'Aucun corrigé dans l’agrégation (lastResult ne porte que le score)');
  assert.ok(cineFilm.sequences.every((sequence) => !('questions' in sequence)));
  const asReferent = await api(`/learning/cine?learnerId=${cineLearner.id}`, teacher.token);
  assert.equal(asReferent.films.find((film) => film.id === filmId).sequences[0].lastResult?.attemptId, sixResult.grade.id,
    'Le référent voit le score');
  assert.ok((await api(`/learning/cine?level=A1&learnerId=${cineAuto.id}`, cineReviewer.token)).films
    .find((film) => film.id === filmId).sequences[0].recommendation, 'Le correcteur désigné voit ses propositions');
  await api(`/learning/cine?learnerId=${cineLearner.id}`, cineOutsider.token, { status: 403 });
  await api(`/learning/cine?learnerId=${cineLearner.id}`, cineReviewer.token, { status: 403 });
  await post(`/learning/film-recommendations/${proposed.id}/dismiss`, teacher.token, {}, 403);
  await post(`/learning/film-recommendations/${proposed.id}/dismiss`, cineAuto.token, {}, 404);
  assert.ok((await post(`/learning/film-recommendations/${proposed.id}/dismiss`, cineLearner.token)).dismissedAt);
  cine = await api('/learning/cine?level=A1', cineLearner.token);
  cineFilm = cine.films.find((film) => film.id === filmId);
  assert.deepEqual([cineFilm.sequences[1].recommendation, cine.recommendations.some((item) => item.id === proposed.id)], [null, false]);
  assert.ok((await api('/learning/film-recommendations', cineLearner.token)).find((item) => item.id === proposed.id).dismissedAt,
    'La proposition écartée reste dans l’historique');

  // 8. Retrait : le film n'est plus servi ni corrigé ; les remises passées gardent leur corrigé.
  assert.equal((await post(`/catalogue/films/${filmId}/retire`, admin.token)).status, 'draft');
  await post(`/catalogue/films/${filmId}/retire`, admin.token, {}, 409);
  await api(`/films/${filmId}`, cineLearner.token, { status: 404 });
  assert.equal((await api(`/films/${filmId}`, admin.token)).id, filmId, 'Aperçu de l’éditeur');
  assert.ok(!(await api('/learning/cine', cineLearner.token)).films.some((film) => film.id === filmId));
  assert.equal((await api(`/assessments/exercises/${cineResult.grade.id}`, cineLearner.token)).questions.length, 5);
  console.log('Recette Ciné-club réussie · film d’essai importé par l’API (structure contrôlée, brouillon invisible), publié, '
    + 'servi sans corrigé (liste, film, leçon « après »), remis et corrigé hors séance, réimporté avec une question de plus '
    + 'corrigée aussitôt, carnet de mots (ajout, doublon, note, suppression), propositions du référent, du correcteur '
    + 'désigné et de l’administration, refus des tiers, agrégation, puis retrait.');
}

// --- Indisponibilité temporaire d'un service et rattrapage du suivi (DEV-101) ------------------------------

async function control(action, service) {
  const response = await fetch(`http://127.0.0.1:8099/${action}/${service}`, {
    method: 'POST', headers: { 'X-Linguacap-Internal': internalSecret }, signal: AbortSignal.timeout(60_000) });
  assert.ok(response.ok, `${action} ${service} · HTTP ${response.status}`);
}
async function ready(port) {
  for (let attempt = 0; attempt < 120; attempt++) {
    const response = await fetch(`http://127.0.0.1:${port}/q/health/ready`, { signal: AbortSignal.timeout(2_000) }).catch(() => null);
    if (response?.ok) return;
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`Le service du port ${port} ne redémarre pas.`);
}
const health = () => json(gateway + '/api/v1/health');
const filesOf = (detail) => detail.activities.flatMap((activity) => activity.placements);

// Médias indisponible : la séance reste lisible, ses supports reviennent avec le service.
const outageSession = a1Worked[0].session.id;
await control('stop', 'media');
assert.equal((await health()).status, 'degraded', 'La sonde signale le service indisponible');
const withoutMedia = await api(`/learning/sessions/${outageSession}`, a1Learner.token);
assert.ok(withoutMedia.activities.length > 0, 'La séance reste lisible sans la médiathèque');
assert.ok(filesOf(withoutMedia).every((placement) => !placement.url), 'Les supports attendent le retour de la médiathèque');
await control('start', 'media');
await ready(8083);
assert.equal((await health()).status, 'ok');
assert.ok(filesOf(await api(`/learning/sessions/${outageSession}`, a1Learner.token)).some((placement) => placement.url),
  'Les supports sont de nouveau servis');

// Apprentissage indisponible pendant le traitement du suivi : l'erreur est signalée, le point de reprise n'avance pas,
// puis les événements produits entre-temps sont rattrapés sans perte.
await runJob();
let outageDetail = null;
let outageLesson = null;
for (const session of a1Replanned.sessions.filter((item) => item.status !== 'completed')) {
  outageDetail = await api(`/learning/sessions/${session.id}`, a1Learner.token);
  outageLesson = outageDetail.activities.find((activity) => activity.kind === 'lesson' && activity.status !== 'completed');
  if (outageLesson) break;
}
assert.ok(outageLesson, 'Une leçon reste à faire pour produire un événement');
await put(`/learning/sessions/${outageDetail.session.id}/activities/${outageLesson.id}/progress`, a1Learner.token, { completed: true });
const learningBefore = sequences('learning');
await control('stop', 'learning');
const syncDuringOutage = await runJob('sync', { allowErrors: true });
assert.ok(syncDuringOutage.errors.learning, 'Le traitement signale le producteur indisponible');
assert.equal(sequences('learning'), learningBefore, 'Le point de reprise n’avance pas pendant l’indisponibilité');
await control('start', 'learning');
await ready(8084);
const caughtUp = await runJob();
assert.deepEqual(caughtUp.errors, {});
assert.ok(caughtUp.imported >= 1, 'Les événements produits avant la coupure sont rattrapés');
assert.equal(checkpoint('learning'), lastEvent('learning'));
console.log('Recette des indisponibilités réussie · séance lisible sans la médiathèque puis supports rétablis, '
  + 'sonde dégradée puis rétablie, suivi interrompu sans perte puis rattrapé après le retour de l’Apprentissage.');

// --- Sauvegarde et restauration (DEV-108) ----------------------------------------------------------------
const { backup } = await import('./backup.mjs');
const { restoreCheck } = await import('./restore-check.mjs');
const backupFolder = join(tmpdir(), `linguacap-sauvegarde-${suffix}`);
const exported = await backup({ out: backupFolder, dbUrl: local.dbUrl, storage: local.api, storageKey: local.secret, log: () => {} });
assert.ok(Object.keys(exported.tables).length >= 20, 'Les tables des six services sont exportées');
assert.ok(exported.tables['learning.sessions'] > 0 && exported.tables['tracking.event_log'] > 0);
assert.ok(exported.storage['linguacap-course'].files >= 400, 'Les médias des parcours sont copiés');
assert.ok(exported.storage['linguacap-productions'].files >= 1, 'Les productions orales sont copiées');
const restoration = restoreCheck(backupFolder);
assert.deepEqual(restoration.problems, [], 'La restauration retrouve chaque table et chaque fichier');
console.log(`Recette de sauvegarde réussie · ${restoration.tables} tables et ${restoration.rows} lignes restaurées à l’identique, `
  + `${exported.storage['linguacap-course'].files + exported.storage['linguacap-productions'].files} fichiers Storage copiés.`);

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
    // Accueil : prochaine séance, puis message du professeur dans sa rubrique (barre de navigation mobile).
    const mobileNav = page.getByRole('navigation', { name: 'Raccourcis mobiles' });
    await expect(page.getByText('Ma prochaine séance')).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole('heading', { name: 'Au café' })).toBeVisible();
    await mobileNav.getByRole('link', { name: 'Mes messages' }).click();
    await expect(page.getByText('Bravo pour cette première séance !')).toBeVisible();
    await mobileNav.getByRole('link', { name: 'Aujourd’hui' }).click();
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
    // La séance affiche une activité à la fois : son sommaire indique la leçon terminée.
    const steps = page.getByRole('navigation', { name: 'Activités de la séance' });
    await expect(steps.getByRole('button', { name: /^Commander au café.*terminée/ })).toBeVisible();
    await page.getByRole('button', { name: 'Valider mes réponses' }).click();
    await expect(page.getByText('Résultat enregistré · 1 / 1')).toBeVisible();
    await expect(page.getByText('Lire la transcription')).toHaveCount(1);
    await page.getByRole('button', { name: 'Suivant', exact: true }).click();
    await page.getByRole('button', { name: 'J’ai terminé la révision' }).click();
    await expect(page.getByRole('heading', { name: 'Séance terminée. Bravo !' })).toBeVisible();
    console.log('Recette navigateur réussie · accueil, séance, visuel, audio, reprise après rechargement et exercice sur mobile.');

    // Fiche du professeur référent : la séance terminée et le résultat apparaissent.
    const teacherPage = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    await teacherPage.goto('http://127.0.0.1:5186/connexion');
    await teacherPage.getByLabel('Adresse e-mail').fill(otherTeacher.email);
    await teacherPage.getByLabel('Mot de passe', { exact: true }).fill(password);
    await teacherPage.getByRole('button', { name: 'Se connecter', exact: true }).click();
    await teacherPage.getByRole('navigation', { name: 'Sections de l’application' }).getByRole('link', { name: 'Mes élèves' })
      .click({ timeout: 15_000 });
    await teacherPage.getByRole('link', { name: 'Voir le suivi de Élève de recette' }).click({ timeout: 15_000 });
    const followUp = teacherPage.getByRole('region', { name: 'Séances', exact: true });
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
    await adminPage.keyboard.press('Escape');
    await adminPage.goto('http://127.0.0.1:5186/espace/indicateurs');
    await expect(adminPage.getByText('Objectifs validés à l’échéance', { exact: true })).toBeVisible({ timeout: 15_000 });
    await expect(adminPage.getByRole('heading', { name: /Élèves actifs par semaine/ })).toBeVisible();
    await adminPage.goto('http://127.0.0.1:5186/espace/invitations');
    await expect(adminPage.getByRole('row', { name: new RegExp(expiredEmail) })).toBeVisible();
    console.log('Recette navigateur réussie · administration des comptes et des invitations.');

    const editorPage = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await editorPage.goto('http://127.0.0.1:5186/connexion');
    await editorPage.getByLabel('Adresse e-mail').fill(staffEmail);
    await editorPage.getByLabel('Mot de passe', { exact: true }).fill(password);
    await editorPage.getByRole('button', { name: 'Se connecter', exact: true }).click();
    const editorNav = editorPage.getByRole('navigation', { name: 'Raccourcis mobiles' });
    await editorNav.getByRole('link', { name: 'Médiathèque' }).click({ timeout: 15_000 });
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
    await editorNav.getByRole('link', { name: 'Catalogue' }).click();
    await editorPage.getByRole('link', { name: `Ouvrir ${DEMO} version ${demoNext.number}` }).click();
    await expect(editorPage.getByRole('heading', { name: `${DEMO} · version ${demoNext.number}` })).toBeVisible();
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
    await expect(examPage.getByText('Ma prochaine séance')).toBeVisible({ timeout: 15_000 });
    await examPage.goto(`http://127.0.0.1:5186/espace/evaluation/${examGoal.id}/final`);
    await expect(examPage.getByRole('heading', { name: `Examen blanc ${DEMO}` })).toBeVisible({ timeout: 15_000 });
    await expect(examPage.getByRole('heading', { name: 'Commander à l’oral' })).toBeVisible();
    await expect(examPage.getByText('Déposer un fichier').first()).toBeVisible();
    await expect(examPage.getByText('Tentative 1')).toBeVisible();
    await expect(examPage.getByText('À consolider')).toBeVisible();
    const typed = examPage.waitForResponse((response) => response.url().includes(`/assessments/exams/${retry.id}/answers`) && response.ok());
    await examPage.getByLabel('Votre texte').fill('Ich hätte gern einen Kaffee.');
    await typed;
    console.log('Recette navigateur réussie · nouvelle tentative de l’examen blanc, sauvegarde de l’écrit et historique sur mobile.');

    // Séance A1 réelle : textes de leçon et d'exercice, illustrations décrites, sons lisibles, sur mobile.
    const contentPage = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await contentPage.goto('http://127.0.0.1:5186/connexion');
    await contentPage.getByLabel('Adresse e-mail').fill(a1Learner.email);
    await contentPage.getByLabel('Mot de passe', { exact: true }).fill(password);
    await contentPage.getByRole('button', { name: 'Se connecter', exact: true }).click();
    await expect(contentPage.getByText('Ma prochaine séance')).toBeVisible({ timeout: 15_000 });
    const shown = a1Worked.find((session) => session.activities.some((activity) => activity.kind === 'exercise')) ?? a1Worked[0];
    await contentPage.goto(`http://127.0.0.1:5186/espace/seance/${shown.session.id}`);
    // Une activité à la fois : chacune s'ouvre depuis le sommaire de la séance, avec ses textes, images et sons.
    const escape = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const contentSteps = contentPage.getByRole('navigation', { name: 'Activités de la séance' });
    for (const activity of shown.activities) {
      await contentSteps.getByRole('button', { name: new RegExp('^' + escape(activity.title)) }).click({ timeout: 15_000 });
      await expect(contentPage.getByRole('heading', { name: activity.title, exact: true })).toBeVisible({ timeout: 15_000 });
      // Le rendu enrichi découpe les lignes (articles, répliques) : on retrouve leurs premiers mots dans l'ordre.
      const firstLine = activity.lesson?.description?.split(/\r?\n/).find((line) => line.trim().length > 12)?.trim();
      const words = firstLine?.match(/[\p{L}\p{N}]+/gu)?.slice(0, 4) ?? [];
      if (words.length) await expect(contentPage.locator('main')).toContainText(new RegExp(words.map(escape).join('[^\\p{L}\\p{N}]*'), 'u'));
      const picture = activity.placements.find((placement) => placement.usage === 'illustration' && !placement.decorative && !placement.questionId);
      if (picture) await expect(contentPage.getByRole('img', { name: picture.alt }).first()).toBeVisible();
      if (activity.placements.some((placement) => placement.usage === 'audio')) await expect(contentPage.locator('audio').first()).toBeAttached();
    }
    console.log('Recette navigateur réussie · séance A1 importée : textes de leçon et d’exercice, illustrations et sons sur mobile.');

    // Incrément Parcours : accueil complet d'un élève autonome, questionnaire d'un nouveau professeur, décision de contrat.
    const signIn = async (viewport, accountEmail) => {
      const signedIn = await browser.newPage({ viewport });
      await signedIn.goto('http://127.0.0.1:5186/connexion');
      await signedIn.getByLabel('Adresse e-mail').fill(accountEmail);
      await signedIn.getByLabel('Mot de passe', { exact: true }).fill(password);
      await signedIn.getByRole('button', { name: 'Se connecter', exact: true }).click();
      return signedIn;
    };
    const phone = { width: 390, height: 844 };

    // (a) Élève autonome sans parcours : l'espace l'envoie vers l'accueil, de la langue au départ, sur mobile.
    const newcomer = await createAccount('navigateur-autonome', 'learner', null);
    const welcome = await signIn(phone, newcomer.email);
    await expect(welcome).toHaveURL(/\/espace\/accueil\/langue$/, { timeout: 15_000 });
    await expect(welcome.getByRole('navigation', { name: 'Étapes de l’accueil' })).toBeVisible();
    await expect(welcome.getByRole('radio', { name: /^Anglais/ })).toBeDisabled();
    await expect(welcome.getByRole('radio', { name: /^Allemand/ })).toBeChecked();
    await welcome.getByRole('button', { name: 'Choisir cette langue' }).click();
    await expect(welcome).toHaveURL(/\/espace\/accueil\/test$/, { timeout: 15_000 });
    await welcome.getByRole('button', { name: 'Commencer le test' }).click();
    // Banque de recette : huit questions par palier, « richtig » est la bonne réponse.
    const answerTier = async (choice) => {
      for (let number = 1; number <= 8; number++) {
        await expect(welcome.locator('.pt-count')).toHaveText(`Question ${number}/8`, { timeout: 15_000 });
        await welcome.getByText(choice, { exact: true }).click();
      }
    };
    await answerTier('richtig');
    await welcome.getByRole('button', { name: 'Valider le palier A1' }).click();
    await expect(welcome.getByRole('heading', { name: 'Bravo, vous passez au palier A2' })).toBeVisible({ timeout: 15_000 });
    await welcome.getByRole('button', { name: 'Commencer le palier A2' }).click();
    await answerTier('Je ne sais pas');
    await welcome.getByRole('button', { name: 'Valider le palier A2' }).click();
    await expect(welcome).toHaveURL(/\/espace\/accueil\/niveau$/, { timeout: 15_000 });
    await expect(welcome.getByRole('heading', { name: 'A1 · Découverte', level: 2 })).toBeVisible();
    await welcome.getByRole('button', { name: 'Choisir mon objectif' }).click();
    await expect(welcome).toHaveURL(/\/espace\/accueil\/objectif$/);
    await welcome.getByRole('button', { name: /^3 mois, jusqu’au/ }).click();
    const objective = welcome.getByRole('button', { name: 'Valider mon objectif' });
    await expect(objective).toBeEnabled({ timeout: 15_000 });
    await objective.click();
    await expect(welcome).toHaveURL(/\/espace\/accueil\/jours$/, { timeout: 15_000 });
    await welcome.getByRole('button', { name: 'Voir mon planning' }).click();
    await expect(welcome).toHaveURL(/\/espace\/accueil\/planning$/, { timeout: 15_000 });
    const planned = welcome.getByRole('button', { name: 'Valider mon planning' });
    await expect(planned).toBeEnabled({ timeout: 15_000 });
    await planned.click();
    await expect(welcome).toHaveURL(/\/espace\/accueil\/depart$/, { timeout: 15_000 });
    await expect(welcome.getByRole('heading', { name: 'Bravo Recette, votre parcours est prêt' })).toBeVisible();
    await expect(welcome.getByText('Votre contrat est en vigueur')).toBeVisible();
    const newcomerPath = await api('/learning/path', newcomer.token);
    assert.deepEqual([newcomerPath.status, newcomerPath.startLevel, newcomerPath.targetLevel, newcomerPath.contract.current?.status],
      ['active', 'A1', 'A2', 'accepted'], 'L’accueil démarre le parcours de l’élève autonome');
    await welcome.getByRole('link', { name: 'Aller à mon accueil' }).click();
    await expect(welcome).toHaveURL(/\/espace$/);
    await expect(welcome.getByRole('navigation', { name: 'Raccourcis mobiles' }).getByRole('link', { name: /^Bibliothèque/ })).toBeVisible();
    // Niveaux dynamiques : la bibliothèque ouvre l'onglet B1 publié et montre B2 « Bientôt » tant qu'il est en brouillon,
    // comme un onglet ouvert dès qu'il est publié (phase 2).
    await welcome.getByRole('navigation', { name: 'Raccourcis mobiles' }).getByRole('link', { name: /^Bibliothèque/ }).click();
    await expect(welcome.getByRole('button', { name: /B1/ }).first()).toBeVisible({ timeout: 15_000 });
    if (hasB2) {
      await expect(welcome.getByRole('button', { name: /B2/ }).first()).toBeVisible({ timeout: 15_000 });
      await expect(welcome.locator('.lib-level.is-soon').filter({ hasText: 'B2' })).toHaveCount(0);
    } else {
      await expect(welcome.locator('.lib-level.is-soon').filter({ hasText: 'B2' })).toContainText('Bientôt');
    }
    console.log('Recette navigateur réussie · accueil de l’élève autonome sur mobile : langue, test à paliers, niveau, objectif, jours, planning, '
      + `départ, bibliothèque avec ${hasB2 ? 'les onglets B1 et B2 ouverts' : 'l’onglet B1 et B2 « Bientôt »'}.`);

    // (b) Nouveau professeur : questionnaire d'accueil en plein écran jusqu'à « Valider mon profil ».
    const newTeacher = await createStaff('navigateur-prof', 'teacher');
    const questionnaire = await signIn(phone, newTeacher.email);
    await expect(questionnaire.getByRole('heading', { name: 'Bienvenue Recette !' })).toBeVisible({ timeout: 15_000 });
    await questionnaire.getByRole('button', { name: 'Commencer', exact: true }).click();
    await expect(questionnaire.getByRole('heading', { name: 'Quelles langues enseignez-vous ?' })).toBeVisible();
    await expect(questionnaire.getByRole('checkbox', { name: /^Allemand/ })).toBeChecked();
    await questionnaire.getByRole('button', { name: 'Continuer', exact: true }).click();
    await questionnaire.getByRole('radio', { name: /Je souhaite accueillir de nouveaux élèves/ }).check();
    await questionnaire.getByRole('button', { name: 'Continuer', exact: true }).click();
    await questionnaire.getByRole('radio', { name: /LinguaCap construit mes cours/ }).check();
    await questionnaire.getByRole('button', { name: 'Continuer', exact: true }).click();
    await questionnaire.getByRole('checkbox', { name: /^B1/ }).check();
    for (let question = 0; question < 4; question++) await questionnaire.getByRole('button', { name: 'Continuer', exact: true }).click();
    await expect(questionnaire.getByRole('heading', { name: 'Tout est prêt ?' })).toBeVisible();
    await questionnaire.getByRole('button', { name: 'Valider mon profil' }).click();
    await expect(questionnaire.getByRole('heading', { name: 'Tout est prêt ?' })).toBeHidden({ timeout: 15_000 });
    const savedProfile = (await api('/me', newTeacher.token)).teacherProfile;
    assert.ok(savedProfile.onboardedAt, 'Le questionnaire est enregistré');
    // Niveaux proposés par défaut : ceux dont le parcours est publié (A1, A2, B1, puis B2).
    assert.deepEqual([savedProfile.languages, savedProfile.levels], [['de'], publishedCodes]);
    assert.equal(savedProfile.acceptingNewStudents, true);
    assert.equal(savedProfile.courseCreationMode, 'linguacap');
    console.log('Recette navigateur réussie · questionnaire d’accueil d’un nouveau professeur sur mobile.');

    // (c) Professeur référent : décision d'un contrat en attente depuis la rubrique « Contrats ».
    const contractLearner = await createAccount('navigateur-suivi', 'learner', teacher.id);
    localSql(local.container, `update identity.profiles set language_id = 'de' where id = '${contractLearner.id}';`);
    const contractTest = await post('/assessments/placements', contractLearner.token, { declaredBeginner: true }, 201);
    let contractPath = await post('/learning/paths', contractLearner.token,
      { placementAttemptId: contractTest.id, targetLevel: 'A1', startDate: inDays(1), targetDate: inDays(121) }, 201);
    const contractProposal = await put(`/learning/paths/${contractPath.id}/availability`, contractLearner.token, { days: fiveDays(45) });
    contractPath = await post(`/learning/paths/${contractPath.id}/proposal/validate`, contractLearner.token, { number: contractProposal.number });
    assert.equal(contractPath.contract.pending?.status, 'pending_teacher');
    const referent = await signIn({ width: 1280, height: 900 }, teacher.email);
    await referent.getByRole('navigation', { name: 'Sections de l’application' }).getByRole('link', { name: /^Contrats/ })
      .click({ timeout: 15_000 });
    await expect(referent.getByRole('heading', { name: 'Contrats', exact: true })).toBeVisible({ timeout: 15_000 });
    await referent.getByRole('region', { name: 'Contrats à valider' })
      .getByRole('button', { name: 'Examiner le contrat de Recette navigateur-suivi' }).click({ timeout: 15_000 });
    await referent.getByRole('button', { name: 'Valider le contrat' }).click();
    await expect(referent.getByText('Contrat de Recette navigateur-suivi validé', { exact: false })).toBeVisible({ timeout: 15_000 });
    const decided = await api('/learning/path', contractLearner.token);
    assert.deepEqual([decided.contract.current?.number, decided.contract.current?.status, decided.contract.engaged], [1, 'accepted', true]);
    console.log('Recette navigateur réussie · décision de contrat par le professeur référent.');
  } finally {
    await browser.close();
  }
}
