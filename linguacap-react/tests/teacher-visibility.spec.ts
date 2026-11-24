import { expect, test, type Page } from '@playwright/test';

// EVO-038 et EVO-039 sur le simulateur : un débutant déclaré n'a pas de diagnostic, et son professeur voit l'accueil
// et le parcours dès sa création (brouillon compris), sans attendre la synchronisation périodique du Suivi.
test.use({ baseURL: 'http://127.0.0.1:5191' });

/** Léa (élève suivie) se déclare débutante puis valide son objectif : le parcours est créé au brouillon. */
async function beginnerDraft(page: Page) {
  await page.goto('/espace?as=eleve-suivi&reset=1');
  await expect(page.getByRole('heading', { name: /Situons votre niveau/ })).toBeVisible({ timeout: 15_000 });
  await page.getByRole('button', { name: /Je n’ai jamais étudié/ }).click();
  await page.getByRole('button', { name: /Choisir mon objectif/ }).click();
  const validate = page.getByRole('button', { name: /Valider mon objectif/ });
  await expect(validate).toBeEnabled({ timeout: 15_000 });
  await validate.click();
  await expect(page.getByRole('heading', { name: 'Quels jours voulez-vous étudier ?' })).toBeVisible();
}

test('le professeur voit l’accueil et le parcours en préparation d’une élève débutante', async ({ page }) => {
  await beginnerDraft(page);

  await page.goto('/espace/eleves?as=professeur');
  const row = page.getByRole('row', { name: /Léa Durand/ });
  await expect(row.getByText('Parcours en préparation')).toBeVisible({ timeout: 15_000 });
  await expect(row.getByText('Parcours créé aujourd’hui')).toBeVisible();
  await page.getByRole('button', { name: /En préparation/ }).click();
  await expect(page.getByRole('row', { name: /Léa Durand/ })).toBeVisible();
  await expect(page.getByRole('row', { name: /Yanis Benali/ })).toHaveCount(0);

  await page.getByRole('link', { name: 'Léa Durand', exact: true }).click();
  const welcome = page.getByRole('region', { name: 'Accueil' });
  await expect(welcome.getByText('Débutant déclaré, sans test')).toBeVisible({ timeout: 15_000 });
  await expect(welcome.getByText(/^Débutant → A1, pour le/)).toBeVisible();
  await expect(welcome.getByText('3 étapes sur 5')).toBeVisible();
  await expect(page.getByRole('region', { name: 'Séances', exact: true }).getByText('Parcours en préparation')).toBeVisible();

  await page.setViewportSize({ width: 390, height: 844 });
  await expect(welcome).toBeVisible();
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);

  await page.goto('/espace?as=professeur');
  const health = page.getByRole('region', { name: 'Élèves à jour' });
  await expect(health.getByRole('listitem').filter({ hasText: 'Parcours en préparation' })).toContainText('1');
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});

test('un débutant n’a ni bandeau ni accès au diagnostic', async ({ page }) => {
  await page.goto('/espace?as=eleve-parcours&reset=1');
  await expect(page.getByText('Ma prochaine séance')).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText('Diagnostic initial à passer')).toHaveCount(0);

  await page.goto('/espace/diagnostic');
  await expect(page.getByRole('region', { name: 'Diagnostic initial' }).getByText('Pas de diagnostic pour vous')).toBeVisible({ timeout: 15_000 });
  await expect(page.getByRole('button', { name: 'Commencer le test' })).toHaveCount(0);
});

test('les remises à corriger viennent des files de correction, missions et oral compris', async ({ page }) => {
  await page.goto('/espace?as=professeur&reset=1');
  const kpi = page.getByRole('link').filter({ hasText: 'À corriger' });
  await expect(kpi).toContainText('1 mission · 1 répétition', { timeout: 15_000 });
  await expect(page.getByText(/^Suivi actualisé/)).toBeVisible();

  await page.goto('/espace/eleves?as=professeur&filtre=copies');
  await expect(page.getByRole('row', { name: /Yanis Benali/ }).getByText('2 à corriger')).toBeVisible({ timeout: 15_000 });
  await expect(page.getByRole('row', { name: /Awa Diallo/ })).toHaveCount(0);
});
