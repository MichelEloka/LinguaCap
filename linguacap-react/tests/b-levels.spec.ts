import { expect as baseExpect, test, type Page } from '@playwright/test';

// Niveaux B (lot F1) sur le simulateur : consignes bilingues (` [fr] ` affiché sous l'allemand, ` [fr?] ` replié puis
// ouvert, aucun marqueur visible), missions sur grille (grille avant la remise, correction refusée tant qu'un critère
// manque, score après le retour, auto-évaluation sans correcteur) et moyenne par critère dans la fiche élève.
// Simulateur : `npm run dev:mock`, port 5191 ; module B1 détaillé « b1-arbeit » et son atelier.
test.use({ baseURL: 'http://127.0.0.1:5191' });
// Parcours à plusieurs écrans (élève, professeur, élève) : 60 s par test.
test.setTimeout(60_000);
// Premier chargement à froid du simulateur (Vite compile à la demande, plusieurs tests en parallèle) : attentes de 15 s.
const expect = baseExpect.configure({ timeout: 15_000 });

const B1 = 'b1000000-0000-4000-8000-0000000000b1';
const library = (activityId: string, as: string, reset = true) => `/espace/bibliotheque/${B1}/${activityId}?as=${as}${reset ? '&reset=1' : ''}`;

/** Candidature de 130 mots environ (la mission demande 120 mots au moins). */
const APPLICATION = 'Sehr geehrte Frau Keller, ich habe Ihre Anzeige für die Stelle als Verkäuferin in Teilzeit gelesen und möchte mich um die Stelle bewerben. '
  + 'Seit drei Jahren arbeite ich in einem Supermarkt in Leipzig. Dort berate ich die Kunden, räume Waren ein und arbeite oft an der Kasse. '
  + 'Letzten Monat habe ich zum Beispiel eine neue Kollegin eingearbeitet, und das hat mir viel Spaß gemacht. '
  + 'In meiner Freizeit koche ich gern und kaufe oft frische Produkte auf dem Wochenmarkt ein. Ich arbeite gern im Team und bin zuverlässig. '
  + 'Die Stelle passt gut zu mir, weil ich feste Arbeitszeiten suche und mich für Bio-Produkte interessiere. '
  + 'Könnten Sie mir bitte sagen, wie lange die Probezeit dauert und wann ich anfangen könnte? '
  + 'Ich würde mich sehr freuen, von Ihnen zu hören. Mit freundlichen Grüßen Léa Durand';

/** Aucune barre de défilement horizontale de page. */
async function noOverflow(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
}

/** Rédige la candidature, coche la liste de vérification puis envoie la mission. */
async function sendApplication(page: Page, button: RegExp) {
  await page.getByLabel('Votre texte en allemand').fill(APPLICATION);
  for (const item of await page.locator('.ms-checklist .ms-check').all()) await item.click();
  await page.getByRole('button', { name: button }).click();
}

test('B1 : consigne allemande avec sa traduction dessous, texte gardé comme document, aucun marqueur visible, corrigé bilingue', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(library('b1-arbeit-lesen', 'eleve-suivi'));
  await expect(page.getByRole('heading', { name: 'Comprendre : une offre d’emploi', level: 1 })).toBeVisible();

  // Consigne de l'activité : l'allemand, puis le français sous lui (une consigne, jamais un « Texte »).
  const instruction = page.locator('.lc-instruction').first();
  await expect(instruction.locator('p[lang="de"]')).toHaveText('Lesen Sie den Text. Beantworten Sie dann die Fragen.');
  await expect(instruction.locator('.bi-fr[lang="fr"]')).toHaveText('Lisez le texte, puis répondez aux questions.');
  // Encadré « STRATEGIE » : intertitre allemand traduit, chaque ligne suivie de sa traduction.
  const strategy = page.locator('.lc-callout').filter({ hasText: 'STRATEGIE' });
  await expect(strategy).toContainText('Stratégie');
  await expect(strategy.locator('.bi-fr').first()).toHaveText('Lisez d’abord seulement le titre et la première ligne : quel poste est proposé ?');
  // L'annonce reste un document à lire.
  await expect(page.locator('figure.lc-doc')).toContainText('Biomarkt am Lindenplatz');
  await expect(page.locator('figure.lc-doc')).not.toContainText('Lesen Sie');

  // Énoncés des questions : allemand puis français, sans marqueur.
  const first = page.getByRole('group', { name: /^Question 1/ });
  await expect(first.locator('.study-question-prompt [lang="de"]')).toHaveText('Was sucht der Biomarkt?');
  await expect(first.locator('.study-question-prompt .bi-fr')).toHaveText('Que cherche le magasin bio ?');
  await expect(first.locator('.study-question-prompt .bi-fr')).toBeVisible();
  await expect(page.locator('body')).not.toContainText('[fr]');
  await noOverflow(page);

  // Remise (réponses quelconques), puis corrigé : énoncé bilingue, toujours sans marqueur.
  for (const group of await page.locator('.study-choices').all()) await group.locator('label.study-choice-hit').first().click();
  for (const input of await page.locator('.sx-blank-input').all()) await input.fill('Monate');
  const lefts = page.locator('.sx-match-item.is-left');
  const rights = page.locator('.sx-match-item.is-right');
  for (let index = 0; index < await lefts.count(); index++) { await lefts.nth(index).click(); await rights.nth(index).click(); }
  await page.getByRole('button', { name: 'Valider mes réponses' }).click();
  const review = page.getByRole('article', { name: /^Was sucht der Biomarkt\?/ });
  await expect(review.locator('.bi-fr')).toHaveText('Que cherche le magasin bio ?');
  await expect(page.locator('body')).not.toContainText('[fr]');
  await noOverflow(page);
});

test('B2 : « Aide en français » repliée puis ouverte, préférence « toujours afficher » gardée dans le navigateur', async ({ page }) => {
  // Aucun contenu B2 n'est publié : une consigne ` [fr?] ` est saisie dans un brouillon et vue dans l'aperçu élève.
  await page.goto('/espace/catalogue?as=admin&reset=1');
  const b1 = page.locator('article').filter({ has: page.getByRole('heading', { name: 'Allemand B1' }) });
  await b1.getByRole('button', { name: /Nouvelle version/ }).click();
  await expect(page.getByRole('navigation', { name: 'Plan du parcours' })).toBeVisible();
  await page.getByRole('button', { name: 'Déplier le module 7' }).click();
  await page.getByRole('button', { name: /Comprendre : une offre d’emploi/ }).first().click();
  const question = page.locator('.ed-question').first();
  await question.locator('summary').click();
  const prompt = question.getByLabel('Consigne de la question');
  await prompt.fill('Was sucht der Biomarkt? [fr?] Que cherche le magasin bio ?');
  // Aide aux marqueurs sous le champ.
  await expect(question.locator('label[data-path$=".prompt"] > .ed-markers.is-used')).toContainText('aide repliée (B2)');
  await page.getByRole('button', { name: 'Aperçu élève', exact: true }).click();

  const preview = page.getByRole('dialog');
  const card = preview.getByRole('group', { name: /^Question 1/ });
  await expect(card.locator('.study-question-prompt [lang="de"]')).toHaveText('Was sucht der Biomarkt?');
  const help = card.getByRole('button', { name: 'Aide en français' });
  await expect(help).toHaveAttribute('aria-expanded', 'false');
  await expect(card.getByText('Que cherche le magasin bio ?')).toBeHidden();
  await help.click();
  await expect(help).toHaveAttribute('aria-expanded', 'true');
  await expect(card.getByText('Que cherche le magasin bio ?')).toBeVisible();
  await expect(card.locator('.bi-help-body')).toHaveAttribute('lang', 'fr');
  await help.click();
  await expect(card.getByText('Que cherche le magasin bio ?')).toBeHidden();

  // Préférence de l'élève : toujours afficher l'aide (localStorage « lc-french-help »).
  const always = preview.getByRole('switch', { name: /Toujours afficher l’aide en français/ });
  await always.check();
  await expect(help).toHaveAttribute('aria-expanded', 'true');
  await expect(card.getByText('Que cherche le magasin bio ?')).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('lc-french-help'))).toBe('always');
  await always.uncheck();
  await expect(help).toHaveAttribute('aria-expanded', 'false');
  expect(await page.evaluate(() => localStorage.getItem('lc-french-help'))).toBeNull();
  await expect(preview).not.toContainText('[fr?]');
});

test('mission B1 : grille avant la remise, correction refusée tant qu’un critère manque, score et commentaire après le retour', async ({ page }) => {
  await page.goto(library('b1-arbeit-atelier-schreiben', 'eleve-suivi'));
  // La grille est visible avant la remise.
  const grid = page.getByRole('region', { name: 'Comment votre production sera évaluée' });
  await expect(grid).toBeVisible();
  await expect(grid.getByRole('listitem')).toHaveCount(4);
  await expect(grid).toContainText('4 critères · 20 points');
  await expect(grid.getByRole('listitem').first()).toContainText('Tâche');
  await expect(grid.getByRole('listitem').first()).toContainText('5 pts');
  await expect(page.getByRole('list', { name: 'Ce que demande la mission' })).toContainText('Grille sur 20 points');
  // Consigne de l'écrit bilingue, sans marqueur.
  await expect(page.locator('.ms-step-prompt .bi-fr').first()).toHaveText('Écrivez votre candidature par courriel (120 à 150 mots).');
  await expect(page.locator('body')).not.toContainText('[fr]');
  await sendApplication(page, /^Envoyer à mon professeur/);
  await expect(page.getByRole('heading', { name: 'Mission envoyée à votre professeur' })).toBeVisible();

  // Correction sur la grille (Marie Weber, professeure de Léa).
  await page.goto('/espace/corrections/missions?as=professeur');
  await page.getByRole('link', { name: 'Corriger : Mission : postuler par courriel, Léa Durand' }).click();
  const rubric = page.getByRole('group', { name: 'Grille de correction' });
  await expect(rubric).toBeVisible();
  const send = page.locator('.rv-form button[type="submit"]');
  await expect(send).toBeDisabled();
  await expect(page.getByLabel(/^Retour à l’élève/)).toHaveValue(/^Points forts : \nÀ retravailler \(2 points au plus\) : \nRelance : $/);
  await expect(page.locator('.ms-codes')).toContainText('Place des mots (Stellung)');
  await rubric.getByRole('spinbutton', { name: /^Tâche/ }).fill('4');
  await rubric.getByRole('spinbutton', { name: /^Cohérence/ }).fill('3');
  await rubric.getByRole('spinbutton', { name: /^Vocabulaire/ }).fill('3');
  await expect(rubric.getByRole('status')).toContainText('Total : 10 / 20');
  await expect(rubric.getByRole('status')).toContainText('3/4 critères notés');
  await expect(send).toBeDisabled();
  await expect(page.getByText('Notez chaque critère pour envoyer (1 critère restant).')).toBeVisible();
  await rubric.getByRole('spinbutton', { name: /^Structures/ }).fill('1');
  // 11/20 : moins de 60 %, « À reprendre » est présélectionnée ; la décision reste au professeur.
  await expect(rubric.getByRole('status')).toContainText('Total : 11 / 20');
  await expect(page.getByRole('radio', { name: /^À reprendre/ })).toBeChecked();
  await rubric.getByRole('spinbutton', { name: /^Structures/ }).fill('2');
  await expect(page.getByRole('radio', { name: /^Valider la mission/ })).toBeChecked();
  await expect(page.getByText(/Présélection d’après le score \(12\/20\)/)).toBeVisible();
  await expect(send).toBeEnabled();
  await page.getByLabel(/^Retour à l’élève/).fill('Points forts : la tâche est complète et la formule finale est juste.\n'
    + 'À retravailler (2 points au plus) : après « weil », le verbe va à la fin (St).\nRelance : quelle question poseriez-vous sur l’équipe ?');
  await send.click();
  await expect(page.getByText('Retour envoyé', { exact: true })).toBeVisible();

  // L'élève voit ses points par critère, son score, la décision et le commentaire.
  await page.goto(library('b1-arbeit-atelier-schreiben', 'eleve-suivi', false));
  await expect(page.getByRole('heading', { name: 'Mission validée, bravo !' })).toBeVisible();
  const result = page.getByRole('region', { name: 'Points par critère' });
  await expect(result).toContainText('12 / 20');
  await expect(result.getByRole('listitem')).toHaveCount(4);
  await expect(result.getByRole('listitem').first()).toContainText('4/5');
  await expect(result.getByRole('listitem').last()).toContainText('2/5');
  await expect(page.locator('.ms-feedback blockquote')).toContainText('après « weil », le verbe va à la fin (St)');
  await expect(page.getByText('Codes utilisés dans le retour')).toBeVisible();
});

test('mission B1 sans correcteur : auto-évaluation sur la grille, non enregistrée, et recommandation d’un correcteur', async ({ page }) => {
  await page.goto(library('b1-arbeit-atelier-schreiben', 'eleve-autonome'));
  await expect(page.getByRole('region', { name: 'Comment votre production sera évaluée' }))
    .toContainText('vous vous évaluerez vous-même avec cette grille');
  await sendApplication(page, /^Envoyer$/);
  await expect(page.getByRole('heading', { name: 'Mission enregistrée' })).toBeVisible();
  const self = page.getByRole('region', { name: 'Évaluez-vous avec la grille' });
  await expect(self).toContainText('cette auto-évaluation n’est pas enregistrée');
  await expect(self.getByRole('status')).toContainText('0/4 critères évalués');
  for (const [criterion, points] of [['Tâche', '4'], ['Cohérence', '3'], ['Vocabulaire', '2'], ['Structures', '4']] as const) {
    await self.getByRole('group', { name: new RegExp(`^${criterion}`) }).getByRole('radio', { name: points, exact: true }).check();
  }
  await expect(self.getByRole('status')).toContainText('13/20');
  await expect(self.getByRole('status')).toContainText('Point à soigner : vocabulaire');
  await expect(self).toContainText('Un correcteur pour les niveaux B');
  // Rien n'est enregistré : la page rouverte repart d'une grille vierge.
  await page.goto(library('b1-arbeit-atelier-schreiben', 'eleve-autonome', false));
  await expect(page.getByRole('region', { name: 'Évaluez-vous avec la grille' }).getByRole('status')).toContainText('0/4 critères évalués');
});

test('fiche élève : score des missions notées sur grille et moyenne par critère ; mission A2 sans grille inchangée', async ({ page }) => {
  await page.goto('/espace/eleves?as=professeur&reset=1');
  await page.getByRole('link', { name: 'Voir le suivi de Léa Durand' }).click();
  await page.getByRole('tab', { name: /Résultats/ }).click();
  const averages = page.getByRole('region', { name: 'Moyenne par critère' });
  await expect(averages).toContainText('1 mission notée · score moyen 16/20');
  await expect(averages.getByRole('listitem')).toHaveCount(5);
  await expect(averages.getByRole('listitem').filter({ hasText: 'Tâche' })).toContainText('100 %');
  await expect(averages.getByRole('listitem').filter({ hasText: 'Prononciation et intonation' })).toContainText('75 %');
  await expect(page.getByRole('button', { name: /^Ouvrir la mission Mission : répondre à trois questions d’entretien/ })).toContainText('16/20');

  // Non-régression : une mission A1 ou A2 n'a ni grille ni score.
  await page.goto(`/espace/bibliotheque/b1000000-0000-4000-8000-0000000000a2/a2-gesundheit-mission?as=eleve-autonome&reset=1`);
  await expect(page.getByLabel('Votre texte en allemand')).toBeVisible();
  await expect(page.getByRole('region', { name: 'Comment votre production sera évaluée' })).toHaveCount(0);
  await expect(page.getByRole('list', { name: 'Ce que demande la mission' })).not.toContainText('Grille');
});
