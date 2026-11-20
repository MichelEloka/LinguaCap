// Administration : comptes, fiche de compte, invitations et indicateurs du pilote (profil « admin » de 00-core).
import { day } from './00-core.mjs';

const user = (id, displayName, role, extra = {}) => ({
  id, displayName, email: `${displayName.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z]+/g, '.')}@exemple.fr`,
  role, status: 'active', permissions: [], teacherId: null, teacherName: null, reviewerId: null, reviewerName: null,
  invitedAt: day(-20), activatedAt: day(-19), lastSeenAt: day(-1), createdAt: day(-20), ...extra,
});

export const users = [
  user('a1', 'Inès Morel', 'admin', { invitedAt: null, activatedAt: day(-60), lastSeenAt: new Date(Date.now() - 6 * 60_000).toISOString(), createdAt: day(-60) }),
  user('t1', 'Marie Weber', 'teacher', { lastSeenAt: new Date(Date.now() - 2 * 3_600_000).toISOString() }),
  user('t2', 'Lukas Braun', 'teacher', { permissions: ['correction'], lastSeenAt: day(-3) }),
  user('s1', 'Jonas Richter', 'staff', { permissions: ['catalogue', 'correction'], lastSeenAt: day(-2) }),
  user('s2', 'Sofia Lang', 'staff', { permissions: ['catalogue'], status: 'disabled', lastSeenAt: day(-24) }),
  user('u-l1', 'Camille Martin', 'learner', { teacherId: 't1', teacherName: 'Marie Weber', lastSeenAt: day(0, 9) }),
  user('u-l2', 'Yanis Benali', 'learner', { teacherId: 't1', teacherName: 'Marie Weber', lastSeenAt: day(-1) }),
  user('u-l3', 'Awa Diallo', 'learner', { teacherId: 't2', teacherName: 'Lukas Braun', lastSeenAt: day(-4) }),
  user('u-l4', 'Léa Kaya', 'learner', { reviewerId: 's1', reviewerName: 'Jonas Richter', lastSeenAt: day(-6) }),
  user('u-l5', 'Tomás Rivera', 'learner', { lastSeenAt: null, activatedAt: null }),
  user('u-l6', 'Noah Petit', 'learner', { teacherId: 't2', teacherName: 'Lukas Braun', status: 'disabled', lastSeenAt: day(-40) }),
];

const assignment = (personId, personName, startedAt, endedAt = null, assignedByName = 'Inès Morel') => ({ personId, personName, assignedByName, startedAt, endedAt });
const details = {
  'u-l1': { teacherHistory: [assignment('t1', 'Marie Weber', day(-8)), assignment('t2', 'Lukas Braun', day(-19), day(-8))], reviewerHistory: [] },
  'u-l4': { teacherHistory: [assignment('t1', 'Marie Weber', day(-19), day(-10))], reviewerHistory: [assignment('s1', 'Jonas Richter', day(-10))] },
};

export const adminInvitations = [
  { id: 'i1', email: 'lea.k@exemple.fr', displayName: 'Léa Kaya', role: 'learner', teacherId: 't1', teacherName: 'Marie Weber', invitedByName: 'Marie Weber',
    status: 'pending', sendCount: 1, createdAt: day(-1), lastSentAt: day(-1), expiresAt: day(6), acceptedAt: null },
  { id: 'i3', email: 'paul.henry@exemple.fr', displayName: 'Paul Henry', role: 'teacher', teacherId: null, teacherName: null, invitedByName: 'Inès Morel',
    status: 'pending', sendCount: 0, createdAt: day(0, 8), lastSentAt: null, expiresAt: day(7), acceptedAt: null },
  { id: 'i2', email: 'tomas.r@exemple.fr', displayName: 'Tomás Rivera', role: 'learner', teacherId: null, teacherName: null, invitedByName: 'Inès Morel',
    status: 'accepted', sendCount: 2, createdAt: day(-9), lastSentAt: day(-7), expiresAt: day(-2), acceptedAt: day(-6) },
  { id: 'i4', email: 'nina.vogel@exemple.fr', displayName: 'Nina Vogel', role: 'staff', teacherId: null, teacherName: null, invitedByName: 'Inès Morel',
    status: 'expired', sendCount: 1, createdAt: day(-12), lastSentAt: day(-12), expiresAt: day(-5), acceptedAt: null },
  { id: 'i5', email: 'hugo.leroy@exemple.fr', displayName: 'Hugo Leroy', role: 'learner', teacherId: 't2', teacherName: 'Lukas Braun', invitedByName: 'Lukas Braun',
    status: 'cancelled', sendCount: 1, createdAt: day(-15), lastSentAt: day(-15), expiresAt: day(-8), acceptedAt: null },
];

const week = (offset) => { const date = new Date(); date.setDate(date.getDate() - date.getDay() + 1 + offset * 7); return date.toISOString().slice(0, 10); };
export const kpis = {
  activation: { numerator: 9, denominator: 11, rate: 81.8 },
  activeLearners: [-7, -6, -5, -4, -3, -2, -1, 0].map((offset, index) => ({ weekStart: week(offset), learners: [3, 4, 6, 6, 8, 7, 9, 5][index] })),
  activeLearnersTotal: 12,
  sessionsOnTime: { numerator: 87, denominator: 104, rate: 83.7 },
  goalsValidated: { numerator: 5, denominator: 8, rate: 62.5 },
  goalsAwaitingGrading: 2,
  progression: [
    { competence: 'lecture', learners: 6, midterm: 58, fin: 71, delta: 13 },
    { competence: 'ecoute', learners: 6, midterm: 52, fin: 66, delta: 14 },
    { competence: 'expression-ecrite', learners: 5, midterm: 61, fin: 59, delta: -2 },
    { competence: 'expression-orale', learners: 5, midterm: 47, fin: 63, delta: 16 },
  ],
  resumption: { numerator: 4, denominator: 7, rate: 57.1 },
  goals: 14,
  filters: { from: day(-56).slice(0, 10), to: day(0).slice(0, 10) },
  freshness: { syncedAt: new Date(Date.now() - 2 * 3_600_000).toISOString(), lastStatus: 'succeeded' },
};
const emptyRate = { numerator: 0, denominator: 0, rate: null };
export const emptyKpis = {
  ...kpis, activation: emptyRate, sessionsOnTime: emptyRate, goalsValidated: emptyRate, resumption: emptyRate, goalsAwaitingGrading: 0,
  activeLearners: kpis.activeLearners.map((item) => ({ ...item, learners: 0 })), activeLearnersTotal: 0, progression: [], goals: 0,
  freshness: { syncedAt: null, lastStatus: 'failed' },
};

/** Remplace une réponse pour un seul écran (les routes de la page passent avant celles du contexte), puis recharge. */
const override = (pattern, json) => async (page) => {
  await page.route(pattern, (route) => route.fulfill({ json }));
  await page.reload({ waitUntil: 'networkidle' });
};

export const screens = [
  { name: 'admin-accueil', role: 'admin', path: '/espace' },
  { name: 'admin-utilisateurs', role: 'admin', path: '/espace/utilisateurs' },
  { name: 'admin-fiche', role: 'admin', path: '/espace/utilisateurs', setup: async (page) => {
    await page.getByRole('button', { name: 'Ouvrir la fiche de Camille Martin' }).click();
    await page.waitForTimeout(500);
  } },
  { name: 'admin-fiche-equipe', role: 'admin', path: '/espace/utilisateurs', setup: async (page) => {
    await page.getByRole('button', { name: 'Ouvrir la fiche de Jonas Richter' }).click();
    await page.waitForTimeout(500);
  } },
  { name: 'admin-fiche-role', role: 'admin', path: '/espace/utilisateurs', setup: async (page) => {
    await page.getByRole('button', { name: 'Ouvrir la fiche de Lukas Braun' }).click();
    await page.getByRole('radio', { name: 'Équipe' }).click();
  } },
  { name: 'admin-desactiver', role: 'admin', path: '/espace/utilisateurs', setup: async (page) => {
    await page.getByRole('button', { name: 'Ouvrir la fiche de Léa Kaya' }).click();
    await page.getByRole('button', { name: 'Désactiver le compte' }).click();
  } },
  { name: 'admin-indicateurs', role: 'admin', path: '/espace/indicateurs' },
  { name: 'admin-indicateurs-vide', role: 'admin', path: '/espace/indicateurs', setup: override('**/api/v1/tracking/kpis*', emptyKpis) },
  { name: 'admin-invitations', role: 'admin', path: '/espace/invitations', setup: override('**/api/v1/invitations', adminInvitations) },
  { name: 'admin-inviter', role: 'admin', path: '/espace/invitations', setup: async (page) => {
    await page.getByRole('button', { name: 'Inviter un utilisateur' }).click();
    await page.waitForTimeout(500);
  } },
];

export function api(role, method, rawPath) {
  if (role !== 'admin') return undefined;
  const path = rawPath.split('?')[0];
  if (method === 'GET' && path === '/admin/users') return users;
  const match = path.match(/^\/admin\/users\/([^/]+)$/);
  if (method === 'GET' && match) {
    const found = users.find((item) => item.id === decodeURIComponent(match[1]));
    return found ? { user: found, ...(details[found.id] ?? { teacherHistory: [], reviewerHistory: [] }) } : { __status: 404, body: { code: 'NOT_FOUND', message: 'Compte introuvable.' } };
  }
  if (method === 'GET' && path === '/tracking/kpis') return kpis;
  return undefined;
}
