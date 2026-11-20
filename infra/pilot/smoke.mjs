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
assert.ok(levels.some((level) => level.code === 'B1' && level.status === 'draft'));

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
  const asset = await api('/media/' + assetId, learnerToken);
  assert.equal(new URL(asset.url).origin, local.api);
  const content = await fetch(asset.url, { signal: AbortSignal.timeout(8_000) });
  assert.ok(content.ok);
  assert.equal(content.headers.get('content-type')?.split(';')[0], asset.mimeType);
  assert.ok((await content.arrayBuffer()).byteLength > 100);
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
    await expect(page.getByRole('heading', { name: 'Commander au café' })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText('Bravo pour cette première séance !')).toBeVisible();
    await page.waitForFunction(() => document.querySelector('.pilot-lesson-image')?.naturalWidth > 0
      && Number.isFinite(document.querySelector('audio')?.duration));
    await page.getByRole('radio', { name: 'Un café' }).check();
    await page.getByRole('button', { name: 'Valider mes réponses' }).click();
    await expect(page.getByText('Résultat enregistré · 1 / 1')).toBeVisible();
    console.log('Recette navigateur réussie · session Supabase, leçon, médias et quiz sur mobile.');

    const adminPage = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    await adminPage.goto('http://127.0.0.1:5186/connexion');
    await adminPage.getByLabel('Adresse e-mail').fill(admin.email);
    await adminPage.getByLabel('Mot de passe', { exact: true }).fill(password);
    await adminPage.getByRole('button', { name: 'Se connecter', exact: true }).click();
    await adminPage.getByRole('link', { name: 'Utilisateurs' }).click();
    await expect(adminPage).toHaveURL(/\/espace\/utilisateurs$/);
    await expect(adminPage.getByRole('row', { name: /Élève de recette/ })).toBeVisible({ timeout: 15_000 });
    await adminPage.getByRole('button', { name: 'Ouvrir la fiche de Élève de recette' }).click();
    await expect(adminPage.getByRole('dialog').getByText('Recette tiers').first()).toBeVisible();
    await adminPage.goto('http://127.0.0.1:5186/espace/invitations');
    await expect(adminPage.getByRole('row', { name: new RegExp(expiredEmail) })).toBeVisible();
    console.log('Recette navigateur réussie · administration des comptes et des invitations.');
  } finally {
    await browser.close();
  }
}
