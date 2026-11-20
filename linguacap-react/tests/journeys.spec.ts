import { expect, test } from '@playwright/test';

test('la séance multimédia alimente le suivi professeur et résiste au rechargement', async ({ page }) => {
  await page.goto('/eleve/seances/premiere-seance');
  await expect(page.getByRole('heading', { name: 'Commander au café' })).toBeVisible();
  const photo = page.getByRole('img', { name: /tasse blanche/ });
  await expect(photo).toBeVisible();
  await expect.poll(() => photo.evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0);
  const audio = page.getByLabel('Prononciation de « Kaffee »');
  await expect.poll(() => audio.evaluate((element: HTMLAudioElement) => Number.isFinite(element.duration))).toBe(true);
  await page.getByRole('radio', { name: 'Ich möchte einen Kaffee, bitte.' }).check();
  await page.getByRole('button', { name: 'Valider ma réponse' }).click();
  await expect(page.getByText('Bonne réponse.')).toBeVisible();
  await page.reload();
  await expect(page.getByText('Terminée', { exact: true })).toBeVisible();
  await page.goto('/professeur/eleves/camille');
  await expect(page.getByRole('heading', { name: 'Camille Bernard' })).toBeVisible();
  await expect(page.getByText(/[1-8] séances? terminées?/)).toBeVisible();
});

test('une remise élève est corrigée par le professeur', async ({ page }) => {
  await page.goto('/eleve/evaluations/bilan-a1');
  await page.getByRole('textbox', { name: /Présentez-vous en allemand/ }).fill('Hallo, ich heiße Camille. Ich wohne in Lyon. Ich mag Kaffee.');
  await page.getByRole('button', { name: 'Remettre mon évaluation' }).click();
  await expect(page.getByRole('heading', { name: 'Remise reçue' })).toBeVisible();
  await page.goto('/professeur/corrections?copie=bilan-a1');
  const correction = page.getByRole('dialog', { name: 'Corriger Bilan des premières séances' });
  await expect(correction).toBeVisible();
  await correction.getByRole('spinbutton', { name: 'Note sur 100' }).fill('82');
  await correction.getByRole('textbox', { name: 'Retour à l’élève' }).fill('Très bon travail sur les salutations.');
  await correction.locator('button[type="submit"]').click();
  await page.goto('/eleve/evaluations/bilan-a1');
  await expect(page.getByText('Très bon travail sur les salutations.')).toBeVisible();
});

test('un média importé reste disponible et peut servir dans un niveau publié', async ({ page }) => {
  await page.goto('/administration/mediatheque');
  await page.getByRole('button', { name: /Ajouter un média/ }).click();
  const upload = page.getByRole('dialog', { name: 'Ajouter un média' });
  await upload.getByRole('textbox', { name: 'Titre', exact: true }).fill('Photo pour le B1 de recette');
  await upload.locator('input[type="file"]').setInputFiles('public/media/kaffee.jpg');
  await upload.getByRole('textbox', { name: 'Texte alternatif' }).fill('Une tasse de café sur une soucoupe.');
  await upload.locator('button[type="submit"]').click();
  await expect(page.getByRole('heading', { name: 'Photo pour le B1 de recette' })).toBeVisible();
  await page.goto('/administration/catalogue');
  const level = page.locator('article').filter({ has: page.getByRole('heading', { name: 'Allemand B1' }) });
  await level.getByRole('button', { name: 'Modifier' }).click();
  const edition = page.getByRole('dialog', { name: /Modifier B1/ });
  await edition.getByRole('checkbox', { name: /Photo pour le B1 de recette/ }).check();
  await edition.getByRole('button', { name: 'Publier le niveau' }).click();
  await expect(level.getByText('Publié', { exact: true })).toBeVisible();
  await page.reload();
  await expect(level.getByText('Publié', { exact: true })).toBeVisible();
});

test('la sonde distingue une réponse JSON et un fallback HTML', async ({ page }) => {
  await page.goto('/integration');
  await page.route('**/api/v1/health', (route) => route.fulfill({ json: { status: 'ok' } }));
  await page.getByRole('button', { name: 'Tester la connexion' }).click();
  await expect(page.getByText('Disponible', { exact: true })).toBeVisible();
  await page.unroute('**/api/v1/health');
  await page.route('**/api/v1/health', (route) => route.fulfill({ contentType: 'text/html', body: '<!doctype html>' }));
  await page.getByRole('button', { name: 'Tester la connexion' }).click();
  await expect(page.getByText(/ne renvoie pas le contrat JSON/)).toBeVisible();
});

test('la navigation mobile ouvre l’administration sans débordement global', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Ouvrir le menu', includeHidden: true })).toBeHidden();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: 'Ouvrir le menu' }).click();
  await page.getByRole('navigation', { name: 'Navigation principale' }).getByRole('link', { name: 'Administration', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});
