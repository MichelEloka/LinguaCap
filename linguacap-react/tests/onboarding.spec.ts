import { expect, test, type Page } from '@playwright/test';

test.use({ baseURL: 'http://127.0.0.1:5191' });

async function completeFirstQuestions(page: Page, available: boolean) {
  await page.goto('/espace?as=professeur-nouveau&reset=1');
  await page.getByRole('button', { name: 'Commencer', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Quelles langues enseignez-vous ?' })).toBeVisible();
  const flag = page.getByText('Allemand', { exact: true }).locator('xpath=ancestor::label').locator('img');
  await expect.poll(() => flag.evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0);
  await expect(page.getByRole('checkbox', { name: /Espagnol/ })).toBeDisabled();
  await page.getByRole('button', { name: 'Continuer', exact: true }).click();
  await expect(page.getByRole('heading', { name: /Êtes-vous à l’écoute de nouveaux élèves/ })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Continuer', exact: true })).toBeDisabled();
  await page.getByRole('radio', { name: available ? /Je souhaite accueillir/ : /J’ai déjà mes élèves/ }).check();
  await page.getByRole('button', { name: 'Continuer', exact: true }).click();
  await expect(page.locator('.welcome-journey-trail.is-drawn')).not.toHaveCount(0);
  await expect(page.getByRole('heading', { name: /Voulez-vous construire vos cours/ })).toBeVisible();
  await page.getByRole('radio', { name: available ? /LinguaCap construit mes cours/ : /Je construis mes cours/ }).check();
  await page.getByRole('button', { name: 'Continuer', exact: true }).click();
  await page.getByRole('checkbox', { name: /A1/ }).check();
  await page.getByRole('button', { name: 'Continuer', exact: true }).click();
  await page.getByRole('button', { name: '15 élèves', exact: true }).click();
  await page.getByRole('button', { name: 'Continuer', exact: true }).click();
  await page.getByRole('radio', { name: /48 heures|2 jours/ }).check();
  await page.getByRole('button', { name: 'Continuer', exact: true }).click();
}

test('un professeur déjà accompagné d’élèves passe aux invitations et ses réponses sont consultables', async ({ page }) => {
  await completeFirstQuestions(page, false);
  await expect(page.getByRole('heading', { name: 'Tout est prêt ?' })).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Courte présentation' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Valider et ouvrir les invitations' }).click();
  await expect(page).toHaveURL(/\/espace\/invitations/);

  await page.goto('/espace/utilisateurs?as=admin');
  await page.getByRole('button', { name: 'Ouvrir la fiche de Lukas Braun' }).click();
  await expect(page.getByRole('heading', { name: 'Réponses d’accueil du professeur' })).toBeVisible();
  for (const text of ['A déjà ses élèves', 'Par le professeur', '48 h']) {
    await expect(page.getByText(text, { exact: true })).toBeVisible();
  }
  await page.goto('/espace/indicateurs?as=admin');
  const stats = page.getByRole('region', { name: 'Accueil des professeurs' });
  await expect(stats.getByText('Ont déjà leurs élèves', { exact: true }).first()).toBeVisible();
  await expect(stats.getByRole('heading', { name: 'Tendance des réponses' })).toBeVisible();
});

test('un professeur disponible prépare sa présentation avec les animations désactivées', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 390, height: 844 });
  await completeFirstQuestions(page, true);
  await expect(page.getByRole('heading', { name: 'Présentez-vous en quelques mots' })).toBeVisible();
  await expect(page.locator('.welcome-journey-origin')).toHaveCSS('animation-name', 'none');
  await page.getByRole('textbox', { name: 'Courte présentation' }).fill('Cours d’allemand orientés vers la conversation.');
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  await page.getByRole('button', { name: 'Continuer', exact: true }).click();
  await page.getByRole('button', { name: 'Valider mon profil' }).click();
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(page).not.toHaveURL(/\/espace\/invitations/);
});

test('l’élève retrouve la signature, le choix des langues et l’entrée du test', async ({ page }) => {
  await page.goto('/espace?as=eleve-autonome&reset=1');
  await expect(page.getByRole('heading', { name: 'Quelle langue voulez-vous apprendre ?' })).toBeVisible({ timeout: 15_000 });
  await expect(page.locator('.welcome-journey.is-learner')).toBeVisible();
  await expect(page.getByRole('radio', { name: /Chinois/ })).toBeDisabled();
  await page.getByRole('radio', { name: /Allemand/ }).check();
  await page.getByRole('button', { name: 'Choisir cette langue' }).click();
  await expect(page.getByRole('heading', { name: /Situons votre niveau/ })).toBeVisible();
  await expect(page.locator('.welcome-journey-trail.is-drawn')).not.toHaveCount(0);
});
