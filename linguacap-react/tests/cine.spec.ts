import { expect as baseExpect, test, type Page } from '@playwright/test';

// Ciné-club (EVO-055) sur le simulateur (`npm run dev:mock`, port 5191) : accord avant tout chargement de YouTube, lecteur
// aux bornes de la séquence, carnet de mots (séquence, lexique d'un module, page du carnet), questions corrigées,
// proposition du professeur vue par l'élève, éditeur du catalogue (« Prendre le temps actuel ») et affichage à 390 px.
// Aucun accès réel à YouTube : toute requête vers ses domaines est interceptée et remplacée par un lecteur local, qui
// répond à l'API postMessage du cadre comme le lecteur officiel.
test.use({ baseURL: 'http://127.0.0.1:5191' });
const expect = baseExpect.configure({ timeout: 15_000 });

const LEA = '00000000-0000-4000-8000-000000000102';
const youtubeHosts = /^https:\/\/([^/]*\.)?(youtube(-nocookie)?\.com|ytimg\.com|googlevideo\.com|youtu\.be)\//;

/** Lecteur YouTube simulé : répond à « listening » avec un temps courant, applique seekTo. Renvoie les adresses demandées. */
async function fakeYoutube(page: Page, currentTime = 431.6) {
  const requested: string[] = [];
  await page.route(youtubeHosts, (route) => {
    requested.push(route.request().url());
    return route.fulfill({ status: 200, contentType: 'text/html', body: `<!doctype html><html><body style="margin:0;background:#111;color:#eee">Lecteur simulé
      <script>
        let time = ${currentTime};
        addEventListener('message', (event) => {
          const data = JSON.parse(event.data);
          if (data.event === 'listening') parent.postMessage(JSON.stringify({ event: 'initialDelivery', id: data.id, info: { currentTime: time, playerState: 2 } }), '*');
          if (data.event === 'command' && data.func === 'seekTo') { time = data.args[0]; parent.postMessage(JSON.stringify({ event: 'infoDelivery', info: { currentTime: time } }), '*'); }
        });
      </script></body></html>` });
  });
  return requested;
}

const horizontalOverflow = (page: Page) => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);

test('accord YouTube : rien ne part avant le clic, puis lecteur sans cookie aux bornes de la séquence ; choix mémorisé et révocable', async ({ page }) => {
  const requested = await fakeYoutube(page);
  await page.goto('/espace/cine/nicos-weg-a1/nicos-weg-a1-02?as=eleve-suivi&reset=1&etape=regarder');
  await expect(page.getByRole('heading', { name: 'La vidéo est hébergée par YouTube' })).toBeVisible();
  await expect(page.getByText(/Rien ne lui est envoyé avant votre clic/)).toBeVisible();
  await expect(page.locator('iframe')).toHaveCount(0);
  await page.waitForTimeout(500);
  expect(requested, 'aucune requête vers YouTube avant l’accord').toEqual([]);

  await page.getByRole('button', { name: 'Charger la vidéo YouTube' }).click();
  const frame = page.locator('iframe[title^="Lecteur YouTube"]');
  await expect(frame).toBeVisible();
  const src = new URL(await frame.getAttribute('src') ?? '');
  expect(src.origin).toBe('https://www.youtube-nocookie.com');
  expect(src.pathname).toBe('/embed/4-eDoThe6qo');
  expect(Object.fromEntries(src.searchParams)).toMatchObject({ start: '420', end: '930', rel: '0', cc_load_policy: '1', cc_lang_pref: 'de', hl: 'de', enablejsapi: '1' });
  await expect.poll(() => requested.length).toBeGreaterThan(0);
  expect(requested.every((url) => url.startsWith('https://www.youtube-nocookie.com/embed/')), 'seul le lecteur sans cookie est chargé, sans script externe').toBe(true);
  expect(await page.evaluate(() => localStorage.getItem('lc-youtube-consent'))).toBeNull();
  await expect(page.getByRole('button', { name: 'Revoir la séquence' })).toBeVisible();

  // Accord non mémorisé : demandé de nouveau ; mémorisé : lecteur chargé d'emblée, puis accord retiré.
  await page.reload();
  await expect(page.getByRole('button', { name: 'Charger la vidéo YouTube' })).toBeVisible();
  await page.getByLabel('Se souvenir de mon choix sur cet appareil').check();
  await page.getByRole('button', { name: 'Charger la vidéo YouTube' }).click();
  await expect(frame).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('lc-youtube-consent'))).toBe('granted');
  await page.reload();
  await expect(frame).toBeVisible();
  await page.getByRole('button', { name: 'Retirer mon accord' }).click();
  await expect(page.getByRole('button', { name: 'Charger la vidéo YouTube' })).toBeVisible();
  await expect(page.locator('iframe')).toHaveCount(0);
  expect(await page.evaluate(() => localStorage.getItem('lc-youtube-consent'))).toBeNull();
});

test('carnet : mot noté pendant la séquence et depuis le lexique d’un module, retrouvé, modifié et supprimé dans « Mon carnet de mots »', async ({ page }) => {
  await fakeYoutube(page);
  await page.goto('/espace/cine/nicos-weg-a1/nicos-weg-a1-02?as=eleve-suivi&reset=1&etape=regarder');
  const notebook = page.getByRole('complementary', { name: 'Mon carnet' });
  await notebook.getByLabel('Mot ou expression').fill('die Ampel');
  await notebook.getByLabel(/Traduction ou remarque/).fill('le feu tricolore');
  await notebook.getByRole('button', { name: 'Noter' }).click();
  await expect(page.getByText('« die Ampel » est noté dans votre carnet.')).toBeVisible();
  await expect(notebook.getByRole('list', { name: 'Mots notés pour cette séquence' }).getByText('die Ampel')).toBeVisible();
  await expect(notebook.getByLabel('Mot ou expression')).toHaveValue('');

  // Mot-clé noté avant de regarder : le signet passe à « dans votre carnet ».
  await page.getByRole('tab', { name: /Avant/ }).click();
  await page.getByRole('button', { name: 'Noter « der Bahnhof » dans mon carnet' }).click();
  await expect(page.getByRole('button', { name: '« der Bahnhof » est dans votre carnet' })).toBeVisible();

  // Lexique d'un module : « Noter ce mot ».
  await page.goto('/espace/bibliotheque?niveau=A1&module=a1-hallo');
  await page.getByRole('button', { name: /Lexique du module/ }).click();
  const note = page.getByRole('dialog').getByRole('button', { name: /^Noter ce mot : / }).first();
  const lexiconWord = (await note.getAttribute('aria-label'))?.replace('Noter ce mot : ', '') ?? '';
  await note.click();
  await expect(page.getByRole('dialog').getByRole('button', { name: `« ${lexiconWord} » est dans votre carnet` })).toBeVisible();
  await page.keyboard.press('Escape');

  await page.goto('/espace/mots');
  await expect(page.getByRole('heading', { name: 'Mon carnet de mots', level: 1 })).toBeVisible();
  const sequenceGroup = page.getByRole('region', { name: /Nicos Weg A1 · Wo ist/ });
  // L'article est une pastille colorée à côté du nom : « die » + « Ampel ».
  await expect(sequenceGroup.getByText('Ampel', { exact: true })).toBeVisible();
  await expect(sequenceGroup.getByRole('button', { name: 'Modifier « die Ampel »' })).toBeVisible();
  await expect(sequenceGroup.getByText('le feu tricolore')).toBeVisible();
  await expect(sequenceGroup.getByRole('button', { name: 'Modifier « der Bahnhof »' })).toBeVisible();
  await expect(page.getByRole('region', { name: /^A1 · / }).getByText(lexiconWord.replace(/^(der|die|das) /, ''), { exact: true })).toBeVisible();

  await page.getByRole('searchbox', { name: 'Chercher dans mon carnet' }).fill('tricolore');
  await expect(page.getByRole('button', { name: /^Modifier/ })).toHaveCount(1);
  await page.getByRole('button', { name: 'Modifier « die Ampel »' }).click();
  await page.getByRole('dialog').getByLabel(/Traduction ou remarque/).fill('le feu (de circulation)');
  await page.getByRole('dialog').getByRole('button', { name: 'Enregistrer' }).click();
  await expect(page.getByText('Mot modifié.')).toBeVisible();
  await page.getByRole('searchbox', { name: 'Chercher dans mon carnet' }).fill('');
  await expect(page.getByText('le feu (de circulation)')).toBeVisible();
  await page.getByRole('button', { name: 'Supprimer « die Ampel »' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Supprimer' }).click();
  await expect(page.getByText('« die Ampel » est supprimé du carnet.')).toBeVisible();
  await expect(page.getByText('le feu (de circulation)')).toHaveCount(0);
});

test('questions « après » : remise, corrigé par question avec explications, score repris dans le Ciné-club', async ({ page }) => {
  await page.goto('/espace/cine/nicos-weg-a1/nicos-weg-a1-02?as=eleve-suivi&reset=1&etape=apres');
  await expect(page.getByRole('heading', { name: 'Avez-vous bien compris ?' })).toBeVisible();
  await page.getByRole('radio', { name: 'Entschuldigung, …' }).check();
  for (const [left, right] of [['links', 'à gauche'], ['rechts', 'à droite'], ['geradeaus', 'tout droit'], ['zurück', 'en arrière']]) {
    await page.getByRole('button', { name: `${left}, à associer` }).click();
    await page.getByRole('button', { name: `${right}, à associer` }).click();
  }
  await page.getByRole('textbox', { name: /^Trou/ }).first().fill('wo');
  for (const word of ['Gehen', 'Sie', 'hier', 'links.']) await page.getByRole('button', { name: `Ajouter « ${word} » à la phrase` }).click();
  await page.getByRole('radio', { name: 'Je le sais très bien.' }).check();
  await page.getByRole('button', { name: 'Valider mes réponses' }).click();

  await expect(page.getByText('Résultat enregistré · 4 / 5')).toBeVisible();
  await expect(page.getByText('Questions corrigées : 4 sur 5. Le corrigé est affiché.')).toBeVisible();
  const review = page.getByRole('region', { name: 'Corrigé' });
  await expect(review.getByText('Juste', { exact: true })).toHaveCount(4);
  await expect(review.getByText('Faux', { exact: true })).toHaveCount(1);
  await expect(review.getByText('Pourquoi ?')).toHaveCount(5);
  await expect(review.getByText('« nicht » marque la négation.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Refaire les questions' })).toBeVisible();

  await page.getByRole('link', { name: 'Ciné-club', exact: true }).click();
  await expect(page.getByRole('tab', { name: /Ciné-club/, selected: true })).toBeVisible();
  await expect(page.getByRole('link', { name: /Wo ist …\? · Où est… \?.*4\/5/ })).toBeVisible();
});

test('le professeur propose une séquence depuis la fiche élève ; l’élève la voit en tête de son Ciné-club et peut la masquer', async ({ page }) => {
  await page.goto(`/espace/eleves/${LEA}?as=professeur&reset=1&onglet=cine`);
  await expect(page.getByRole('heading', { name: 'Ciné-club et mots' })).toBeVisible();
  await expect(page.getByText('Hallo! · Bonjour !')).toBeVisible();
  await page.getByRole('button', { name: 'Proposer une séquence' }).first().click();
  const drawer = page.getByRole('dialog', { name: 'Proposer une séquence' });
  await drawer.getByLabel('Film').selectOption({ label: 'A2 · Nicos Weg A2' });
  await drawer.getByRole('radio', { name: /Ein neuer Job/ }).check();
  await drawer.getByLabel(/Mot pour l’élève/).fill('Idéal avant ton entretien de stage.');
  await drawer.getByRole('button', { name: 'Proposer' }).click();
  await expect(page.getByText('Séquence proposée à Léa Durand.')).toBeVisible();
  await expect(page.getByRole('listitem').filter({ hasText: 'Ein neuer Job' }).getByText('En cours')).toBeVisible();

  // Même session du simulateur : l'élève retrouve la proposition, avec le mot du professeur.
  await page.goto('/espace/bibliotheque?as=eleve-suivi&niveau=A2&vue=cine');
  const proposals = page.getByRole('region', { name: 'Proposées par votre professeur' });
  await expect(proposals.getByRole('heading', { name: 'Ein neuer Job · Un nouveau travail' })).toBeVisible();
  await expect(proposals.getByText('« Idéal avant ton entretien de stage. »')).toBeVisible();
  await proposals.getByRole('link', { name: 'Regarder' }).click();
  await expect(page.getByRole('heading', { name: 'Ein neuer Job · Un nouveau travail', level: 1 })).toBeVisible();
  await expect(page.getByText(/Proposée par votre professeur/)).toBeVisible();

  await page.goto('/espace/bibliotheque?niveau=A2&vue=cine');
  await page.getByRole('button', { name: 'Masquer la proposition : Ein neuer Job · Un nouveau travail' }).click();
  await expect(page.getByText('Proposition masquée. Elle reste accessible dans le Ciné-club.')).toBeVisible();
  await expect(page.getByRole('region', { name: 'Proposées par votre professeur' })).toHaveCount(0);
});

test('éditeur du catalogue : « Prendre le temps actuel » dans le lecteur, enregistrement du film au format 1', async ({ page }) => {
  const requested = await fakeYoutube(page, 431.6);
  await page.goto('/espace/catalogue/films?as=admin&reset=1');
  await page.getByRole('link', { name: 'Ouvrir Nicos Weg A1 (A1)' }).click();
  await expect(page.getByRole('heading', { name: 'Nicos Weg A1' })).toBeVisible();
  await page.getByRole('button', { name: /Wo ist …\?/ }).click();
  await page.getByRole('button', { name: 'Charger la vidéo YouTube' }).click();
  await expect(page.locator('iframe[title^="Lecteur YouTube"]')).toBeVisible();
  const start = page.getByLabel('Début', { exact: true });
  await expect(start).toHaveValue('7:00');
  await expect(async () => {
    await page.getByRole('button', { name: 'Prendre le temps actuel du lecteur pour : début' }).click();
    await expect(start).toHaveValue('7:12', { timeout: 1000 });
  }).toPass();
  await expect(page.getByText('Modifications non enregistrées')).toBeVisible();
  await page.getByRole('button', { name: 'Enregistrer' }).click();
  await expect(page.getByText('Film enregistré.')).toBeVisible();
  expect(requested.every((url) => url.startsWith('https://www.youtube-nocookie.com/embed/4-eDoThe6qo?'))).toBe(true);

  await page.reload();
  await page.getByRole('button', { name: /Wo ist …\?/ }).click();
  await expect(page.getByLabel('Début', { exact: true })).toHaveValue('7:12');
  await expect(page.getByText('Film publié')).toBeVisible();
});

test('390 px : Ciné-club, séquence, carnet et fiche élève sans débordement horizontal', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await fakeYoutube(page);
  await page.goto('/espace/bibliotheque?as=eleve-suivi&reset=1&vue=cine');
  await expect(page.getByRole('heading', { name: 'Nicos Weg A1' })).toBeVisible();
  expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0);
  for (const step of ['avant', 'regarder', 'apres']) {
    await page.goto(`/espace/cine/nicos-weg-a1/nicos-weg-a1-01?etape=${step}`);
    await expect(page.getByRole('heading', { name: 'Hallo! · Bonjour !', level: 1 })).toBeVisible();
    if (step === 'regarder') await page.getByRole('button', { name: 'Charger la vidéo YouTube' }).click();
    if (step === 'apres') await expect(page.getByText('Résultat enregistré · 4 / 5')).toBeVisible();
    expect(await horizontalOverflow(page), `étape ${step}`).toBeLessThanOrEqual(0);
  }
  await page.goto('/espace/mots');
  await expect(page.getByText('gemütlich')).toBeVisible();
  expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0);
  await page.goto(`/espace/eleves/${LEA}?as=professeur&onglet=cine`);
  await expect(page.getByRole('heading', { name: 'Ciné-club et mots' })).toBeVisible();
  expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0);
});
