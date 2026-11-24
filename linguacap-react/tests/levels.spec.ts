import { expect, test, type Page } from '@playwright/test';

// Niveaux dynamiques (lot F2) sur le simulateur : les écrans lisent les niveaux du catalogue (GET /languages,
// GET /public/languages). B1, publié, apparaît partout sans code dédié ; B2, au catalogue sans version publiée, est
// « Bientôt » là où il donne une perspective (bibliothèque, questionnaire du professeur, résultat du test) et absent des
// choix actionnables (cibles, contrats) comme de la vitrine. L'échelle CECRL ne sert qu'à ordonner et nommer.
test.use({ baseURL: 'http://127.0.0.1:5191' });
// Le serveur de développement compile les écrans à la demande : lent au premier passage quand la suite tourne en parallèle.
test.describe.configure({ timeout: 60_000 });
/** Première attente d'un test (compilation à la demande des écrans). */
const FIRST = { timeout: 30_000 };

/** Visiteur sans compte : le simulateur ne rouvre pas la session de démonstration. */
const signedOut = (page: Page) => page.addInitScript(() => window.sessionStorage.setItem('linguacap-mock-sortie', '1'));

test('la vitrine, son pied de page et la connexion annoncent les niveaux publiés, B1 compris', async ({ page }) => {
  await signedOut(page);
  await page.goto('/');
  await expect(page.locator('.home-pill')).toHaveText('Pilote d’allemand A1, A2 et B1 sur invitation', FIRST);
  const proof = page.locator('.home-proof li').first();
  await expect(proof).toContainText('A1 → B1');
  await expect(proof).toContainText('trois niveaux complets');
  await expect(page.getByRole('list', { name: 'Niveaux proposés' }).getByRole('listitem'))
    .toHaveText(['A1 · Découverte', 'A2 · Survie', 'B1 · Seuil']);
  await expect(page.getByRole('contentinfo')).toContainText('Allemand · A1, A2 et B1 · Apprendre à son rythme');
  // B2 n'a pas de version publiée : la vitrine ne le cite jamais.
  await expect(page.locator('main')).not.toContainText('B2');

  await page.setViewportSize({ width: 390, height: 844 });
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);

  await page.goto('/connexion');
  await expect(page.locator('.acc-kicker')).toHaveText('Allemand · niveaux A1, A2 et B1');
});

test('l’accueil de l’élève suit le catalogue : paliers réels, B1 parmi les cibles, B2 absent', async ({ page }) => {
  await page.goto('/espace?as=eleve-autonome&reset=1');
  const german = page.getByRole('radio', { name: /Allemand/ });
  await expect(german.locator('xpath=ancestor::label')).toContainText(/Parcours\s*A1\s*A2\s*B1/, FIRST);
  await german.check();
  await page.getByRole('button', { name: 'Choisir cette langue' }).click();

  // Introduction du test : les paliers de la banque publiée (placementTiers), et leur nombre dans le texte.
  await expect(page.getByRole('heading', { name: /Situons votre niveau/ })).toBeVisible();
  await expect(page.getByRole('list', { name: 'Paliers du test' }).getByRole('listitem')).toHaveText([/Palier A1/, /Palier A2/, /Palier B1/]);
  await expect(page.getByText('Trois paliers au plus, une question à la fois.')).toBeVisible();

  await page.getByRole('button', { name: /Je n’ai jamais étudié/ }).click();
  await page.getByRole('button', { name: /Choisir mon objectif/ }).click();
  await expect(page.getByRole('heading', { name: /Quel niveau visez-vous/ })).toBeVisible();
  const targets = page.getByRole('group', { name: 'Niveau visé' });
  await expect(targets.getByRole('radio')).toHaveCount(3);
  await expect(targets.getByRole('radio', { name: /B2|C1|C2/ })).toHaveCount(0);
  const b1 = targets.getByRole('radio', { name: /B1 · Seuil/ });
  await expect(b1).toBeEnabled({ timeout: 15_000 });
  await b1.check();
  await expect(page.locator('.lo-pace-facts')).toContainText('B1 · Seuil', { timeout: 15_000 });
  await expect(page.getByRole('button', { name: /Valider mon objectif/ })).toBeEnabled({ timeout: 15_000 });
});

test('une élève placée B1 apprend que le parcours B2 arrive bientôt, sans objectif proposé', async ({ page }) => {
  await page.goto('/espace?as=eleve-autonome&reset=1');
  await page.getByRole('radio', { name: /Allemand/ }).check(FIRST);
  await page.getByRole('button', { name: 'Choisir cette langue' }).click();
  await page.getByRole('button', { name: /Je n’ai jamais étudié/ }).click();
  await expect(page.getByRole('button', { name: /Choisir mon objectif/ })).toBeVisible();
  // Tentative terminée transformée en réussite des trois paliers (A1, A2, B1), comme après un test complet.
  await page.evaluate(() => {
    type Tier = Record<string, unknown>;
    type Attempt = { declaredBeginner: boolean; placedLevel: string | null; currentTier: string | null; tiers: Tier[] };
    const mock = (window as unknown as { linguacapMock: { state: () => { placements: Attempt[] } } }).linguacapMock;
    const state = mock.state();
    const attempt = state.placements.find((item) => item.declaredBeginner);
    if (!attempt) throw new Error('Tentative introuvable dans le simulateur.');
    const tier = (code: string, title: string): Tier => ({ code, title, passPercent: 67, minCompetencePercent: 34, status: 'passed',
      correct: 11, total: 12, percent: 92, competences: { lecture: { correct: 7, total: 8, percent: 88 }, ecoute: { correct: 4, total: 4, percent: 100 } } });
    Object.assign(attempt, { declaredBeginner: false, placedLevel: 'B1', currentTier: null,
      tiers: [tier('A1', 'A1 · Découverte'), tier('A2', 'A2 · Survie'), tier('B1', 'B1 · Seuil')] });
    window.sessionStorage.setItem('linguacap-mock-state', JSON.stringify(state));
  });
  await page.goto('/espace/accueil/niveau');
  await expect(page.getByRole('heading', { name: 'Voici votre niveau' })).toBeVisible({ timeout: 15_000 });
  // Résumé du serveur (niveau suivant non publié) et encadré du catalogue : B2 n'est jamais présenté comme ouvert.
  await expect(page.getByText('Vous avez validé le palier B1 : le parcours B2 arrive bientôt.')).toBeVisible();
  await expect(page.getByText('Le parcours B2 arrive bientôt', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: /Ouvrir la bibliothèque/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /Choisir mon objectif/ })).toHaveCount(0);
});

test('la bibliothèque ouvre l’onglet B1 et annonce B2 « Bientôt »', async ({ page }) => {
  await page.goto('/espace/bibliotheque?as=eleve-parcours&reset=1');
  const levels = page.getByRole('navigation', { name: 'Niveaux' });
  const b1 = levels.getByRole('button', { name: /B1 · Seuil/ });
  await expect(b1).toBeVisible(FIRST);
  await expect(levels.getByRole('button')).toHaveCount(3);
  await expect(levels.locator('.lib-level.is-soon')).toHaveCount(1);
  await expect(levels.locator('.lib-level.is-soon')).toContainText('Bientôt');
  await expect(levels.getByText('B2 · Avancé, bientôt disponible')).toBeAttached();
  await expect(levels).not.toContainText('C1');
  await b1.click();
  await expect(page).toHaveURL(/niveau=B1/);
  await expect(page.getByRole('heading', { name: 'Allemand B1', level: 2 })).toBeVisible();
});

test('le questionnaire du professeur marque B1 « Parcours prêt » et B2 « Bientôt »', async ({ page }) => {
  await page.goto('/espace?as=professeur-nouveau&reset=1');
  await page.getByRole('button', { name: 'Commencer', exact: true }).click(FIRST);
  await expect(page.getByRole('checkbox', { name: /Allemand/ }).locator('xpath=ancestor::label')).toContainText(/Parcours\s*A1\s*A2\s*B1/);
  await page.getByRole('button', { name: 'Continuer', exact: true }).click();
  await page.getByRole('radio', { name: /Je souhaite accueillir/ }).check();
  await page.getByRole('button', { name: 'Continuer', exact: true }).click();
  await page.getByRole('radio', { name: /LinguaCap construit mes cours/ }).check();
  await page.getByRole('button', { name: 'Continuer', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Quels niveaux accompagnez-vous ?' })).toBeVisible();
  await expect(page.getByText('Les parcours A1, A2 et B1 sont disponibles aujourd’hui.', { exact: false })).toBeVisible();
  // Par défaut, les niveaux dont le parcours est publié ; toute l'échelle reste déclarable.
  await expect(page.getByRole('checkbox', { name: /B1.*Parcours prêt/ })).toBeChecked();
  await expect(page.getByRole('checkbox', { name: /B2.*Bientôt/ })).not.toBeChecked();
  await expect(page.getByRole('checkbox', { name: /C2.*Bientôt/ })).toBeVisible();
});

test('les filtres des indicateurs suivent les niveaux du catalogue', async ({ page }) => {
  await page.goto('/espace/indicateurs?as=admin&reset=1');
  const target = page.getByRole('combobox', { name: 'Niveau cible' }).first();
  await expect(target.locator('option')).toHaveText(['Tous', 'A1', 'A2', 'B1', 'B2'], FIRST);
  await expect(page.getByRole('combobox', { name: 'Niveau de départ' }).first().locator('option'))
    .toHaveText(['Tous', 'Débutant', 'A1', 'A2', 'B1', 'B2']);
  await target.selectOption('B1');
  await expect(page.getByRole('heading', { name: 'Objectifs validés à l’échéance' })).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText('Indicateurs indisponibles')).toHaveCount(0);
});

test('un avenant propose B1 parmi les niveaux visés, jamais un niveau sans version publiée', async ({ page }) => {
  await page.goto('/espace/contrat?as=eleve-parcours&reset=1');
  await page.getByRole('button', { name: /Proposer un avenant|Modifier ma proposition/ }).click(FIRST);
  const form = page.getByRole('dialog');
  const targets = form.getByRole('group', { name: 'Niveau visé' });
  await expect(targets.getByRole('button', { name: 'B1' })).toBeEnabled({ timeout: 15_000 });
  await expect(targets.getByRole('button', { name: /B2|C1|C2/ })).toHaveCount(0);
});
