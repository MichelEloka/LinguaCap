import { expect, test } from '@playwright/test';

// Le serveur date les parcours dans le fuseau de Paris. Un élève hors d'Europe qui choisit son objectif le soir est déjà
// au lendemain pour le serveur : le début proposé doit être le jour du pilote, sinon la validation est refusée
// (« Le début doit être compris entre aujourd’hui et dans un an », vu par la recette CI à 0 h 14, heure de Paris).
test.use({ baseURL: 'http://127.0.0.1:5191', timezoneId: 'America/Montreal' });

test('à 18 h 30 à Montréal (0 h 30 à Paris), l’objectif commence le jour de Paris et se valide', async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-11-23T23:30:00Z'));
  await page.goto('/espace?as=eleve-suivi&reset=1');
  await expect(page.getByRole('heading', { name: /Situons votre niveau/ })).toBeVisible({ timeout: 15_000 });
  await page.getByRole('button', { name: /Je n’ai jamais étudié/ }).click();
  await page.getByRole('button', { name: /Choisir mon objectif/ }).click();
  // Trois mois à partir du 24 novembre (Paris), et non du 23 (Montréal).
  await expect(page.getByRole('button', { name: /^3 mois, jusqu’au 24 février 2027/ })).toBeVisible({ timeout: 15_000 });
  const validate = page.getByRole('button', { name: /Valider mon objectif/ });
  await expect(validate).toBeEnabled({ timeout: 15_000 });
  await validate.click();
  await expect(page.getByRole('heading', { name: 'Quels jours voulez-vous étudier ?' })).toBeVisible({ timeout: 15_000 });
});
