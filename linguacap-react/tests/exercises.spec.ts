import { expect as baseExpect, test, type Page } from '@playwright/test';

// Exercices typés de la V4 (lot A3) sur le simulateur : saisie de chaque type, remise, corrigé, répétition orale,
// repli par enregistrement, bibliothèque. Les sessions sont simulées (`npm run dev:mock`, port 5191).
test.use({ baseURL: 'http://127.0.0.1:5191' });
// Premier chargement à froid du simulateur (Vite compile l'application à la demande, plusieurs tests en parallèle) : plus
// de 5 s sur un poste chargé. Les attentes visibles de ce fichier ont donc 15 s.
const expect = baseExpect.configure({ timeout: 15_000 });

const A1 = 'b1000000-0000-4000-8000-0000000000a1';
const A2 = 'b1000000-0000-4000-8000-0000000000a2';

/**
 * Reconnaissance vocale du navigateur simulée : chaque écoute renvoie `window.__speech`, ou à défaut la phrase modèle de
 * la carte dont on a touché le micro.
 */
async function fakeSpeech(page: Page) {
  await page.addInitScript(() => {
    let target = '';
    document.addEventListener('click', (event) => {
      const card = (event.target as Element | null)?.closest?.('.sx-speak');
      if (card) target = card.querySelector('.sx-speak-target')?.textContent ?? '';
    }, true);
    class FakeRecognition {
      lang = ''; interimResults = false; maxAlternatives = 1; continuous = false;
      onresult: ((event: unknown) => void) | null = null;
      onerror: ((event: unknown) => void) | null = null;
      onend: (() => void) | null = null;
      start() {
        window.setTimeout(() => {
          const text = (window as unknown as { __speech?: string }).__speech ?? target;
          const result = Object.assign([{ transcript: text, confidence: .9 }], { isFinal: true });
          this.onresult?.({ resultIndex: 0, results: [result] });
          this.onend?.();
        }, 200);
      }
      stop() {}
      abort() {}
    }
    Object.assign(window, { SpeechRecognition: FakeRecognition, webkitSpeechRecognition: FakeRecognition });
  });
}

/**
 * Élève du simulateur avec un parcours en cours (`?as=eleve-parcours`, Nora Lefèvre) : état remis à zéro, puis ouverture de
 * la séance qui contient `activityId` (aucune séance n'est encore faite ; `fresh` reste une précaution).
 */
async function openSession(page: Page, activityId: string, fresh: string[] = []) {
  await page.goto('/espace/bibliotheque?as=eleve-parcours&reset=1');
  await expect(page.getByRole('heading', { name: 'Bibliothèque', level: 1 })).toBeVisible();
  const sessionId = await page.evaluate(({ activityId, fresh }) => {
    type Item = { id: string };
    type Session = { id: string; levelCode: string; items: Item[]; completedAt: string | null };
    type Path = { learnerId: string; liveSessions: Session[]; progress: Record<string, unknown> };
    const state = (window as unknown as { linguacapMock: { state: () => { users: { id: string; displayName: string }[]; paths: Path[] } } }).linguacapMock.state();
    const nora = state.users.find((user) => user.displayName === 'Nora Lefèvre');
    const path = state.paths.find((item) => item.learnerId === nora?.id);
    const session = path?.liveSessions.find((item) => item.items.some((entry) => entry.id === activityId));
    if (!path || !session) throw new Error('Séance introuvable dans le simulateur.');
    for (const id of fresh) { delete path.progress[`${session.levelCode}:${id}`]; session.completedAt = null; }
    sessionStorage.setItem('linguacap-mock-state', JSON.stringify(state));
    return session.id;
  }, { activityId, fresh });
  await page.goto(`/espace/seance/${sessionId}`);
}

/** État sauvegardé d'une activité de séance dans le simulateur (`{answers, roundId}`). */
const savedState = (page: Page, key: string) => page.evaluate((progressKey) => {
  const state = JSON.parse(sessionStorage.getItem('linguacap-mock-state') ?? '{}') as {
    users?: { id: string; displayName: string }[]; paths?: { learnerId: string; progress?: Record<string, { state?: unknown }> }[];
  };
  const nora = state.users?.find((user) => user.displayName === 'Nora Lefèvre');
  return state.paths?.find((path) => path.learnerId === nora?.id)?.progress?.[progressKey]?.state as
    { roundId?: string; answers?: Record<string, { blanks?: Record<string, string>; choice?: string }> } | undefined;
}, key);

test('exercice typé en séance : trous, ordre, associations et choix au clavier, reprise, remise et corrigé', async ({ page }) => {
  await openSession(page, 'a1-hallo-ueben', ['a1-hallo-ueben', 'a1-hallo-nachsprechen']);
  await expect(page.getByRole('navigation', { name: 'Activités de la séance' })).toBeVisible();
  await expect(page.getByRole('button', { name: /Lexique du module/ })).toBeVisible();
  const submit = page.getByRole('button', { name: 'Valider mes réponses' });

  // Remise incomplète : chaque question est signalée.
  await submit.click();
  await expect(page.getByText('Il reste 5 questions sans réponse complète.')).toBeVisible();
  await expect(page.getByText('Complétez chaque trou.').first()).toBeVisible();

  // Texte à trous et barre de lettres allemandes (insertion au curseur).
  const blanks = page.getByRole('textbox', { name: /^Trou/ });
  await blanks.nth(0).fill('hei');
  await page.getByRole('button', { name: 'Insérer ß' }).first().click();
  await expect(blanks.nth(0)).toBeFocused();
  await page.keyboard.type('e');
  await expect(blanks.nth(0)).toHaveValue('heiße');
  await blanks.nth(0).press('Enter');
  await expect(blanks.nth(1)).toBeFocused();
  await page.keyboard.type('komme');
  await blanks.nth(2).fill('ist');
  await blanks.nth(3).fill('ist');

  // Phrase à remettre en ordre, au clavier : Entrée place un mot, les flèches le déplacent.
  for (const word of ['Welche', 'Sprachen', 'du', 'sprichst', 'gut?']) {
    await page.getByRole('button', { name: `Ajouter « ${word} » à la phrase` }).focus();
    await page.keyboard.press('Enter');
  }
  const line = page.getByRole('group', { name: 'Votre phrase' });
  await line.getByRole('button', { name: /^du, mot 3/ }).focus();
  await page.keyboard.press('ArrowRight');
  await expect(line.getByRole('button')).toHaveText(['Welche', 'Sprachen', 'sprichst', 'du', 'gut?']);

  // Associations au clavier : un élément, puis son partenaire.
  const pairs = [['Wie heißt du?', 'Ich heiße Jonas.'], ['Woher kommst du?', 'Aus Frankreich.'], ['Wo wohnst du?', 'In Würzburg.'], ['Wie geht\'s?', 'Gut, danke!']];
  for (const [left, right] of pairs) {
    await page.getByRole('button', { name: `${left}, à associer` }).focus();
    await page.keyboard.press('Enter');
    await page.getByRole('button', { name: `${right}, à associer` }).focus();
    await page.keyboard.press('Enter');
  }
  await expect(page.getByText('4 / 4 associations')).toBeVisible();
  await page.getByRole('radio', { name: 'Wie heißen Sie?' }).check();
  await expect(page.getByText('Toutes les réponses sont prêtes.')).toBeVisible();

  // L'état (réponses et manche) est sauvegardé et relu après rechargement.
  await expect.poll(async () => {
    const saved = await savedState(page, 'A1:a1-hallo-ueben');
    return Boolean(saved?.roundId && saved.answers?.q1?.blanks?.['1'] === 'heiße' && saved.answers?.q5?.choice);
  }).toBe(true);
  await page.reload();
  await expect(page.getByRole('textbox', { name: /^Trou 1/ }).first()).toHaveValue('heiße');
  await expect(page.getByRole('group', { name: 'Votre phrase' }).getByRole('button')).toHaveCount(5);
  await expect(page.getByText('4 / 4 associations')).toBeVisible();

  await page.getByRole('button', { name: 'Valider mes réponses' }).click();
  await expect(page.getByText('Résultat enregistré · 5 / 5')).toBeVisible();
  const review = page.getByRole('region', { name: 'Corrigé' });
  await expect(review.getByText('Juste', { exact: true })).toHaveCount(5);
  await expect(review.getByText('Pourquoi ?')).toHaveCount(5);
  await expect(review.getByText(/Avec « ich », le verbe se termine par -e/)).toBeVisible();
  // Le corrigé est relu après rechargement (tentative remise, activité terminée).
  await expect(page.getByRole('navigation', { name: 'Activités de la séance' }).getByRole('button', { name: /^S’entraîner.*terminée/ })).toBeVisible();
  await page.reload();
  // À la reprise, la séance s'ouvre sur l'activité restante : on revient à l'exercice par le sommaire.
  await page.getByRole('navigation', { name: 'Activités de la séance' }).getByRole('button', { name: /^S’entraîner/ }).click();
  await expect(page.getByRole('region', { name: 'Corrigé' }).getByText('Juste', { exact: true })).toHaveCount(5);
  await expect(page.getByRole('button', { name: 'Valider mes réponses' })).toHaveCount(0);
});

test('répétition orale : reconnaissance du navigateur, trois échecs puis « à revoir », mention claire', async ({ page }) => {
  await fakeSpeech(page);
  await openSession(page, 'a1-hallo-nachsprechen', ['a1-hallo-ueben', 'a1-hallo-nachsprechen']);
  await page.getByRole('navigation', { name: 'Activités de la séance' }).getByRole('button', { name: /^Répéter à voix haute/ }).click();
  await expect(page.getByText('La reconnaissance vocale de votre navigateur est utilisée.').first()).toBeVisible();
  const cards = page.locator('.study-question');
  await expect(cards).toHaveCount(4);
  for (const index of [0, 1, 3]) {
    await cards.nth(index).getByRole('button', { name: 'Parler' }).click();
    await expect(cards.nth(index).getByText('Bien prononcé !')).toBeVisible();
  }
  const third = cards.nth(2);
  await page.evaluate(() => { (window as unknown as { __speech: string }).__speech = 'Ich komme'; });
  for (let attempt = 1; attempt <= 3; attempt++) {
    await third.getByRole('button', { name: 'Parler' }).click();
    await expect(third.getByText(/Pas encore/)).toBeVisible();
    if (attempt < 3) await expect(third.getByRole('button', { name: /Continuer, à revoir/ })).toHaveCount(0);
  }
  await expect(third.getByRole('button', { name: 'Enregistrer pour mon professeur' })).toBeVisible();
  await third.getByRole('button', { name: /Continuer, à revoir/ }).click();
  await expect(third.getByText(/la phrase est notée « à revoir »/)).toBeVisible();
  // Reprise : chaque essai retenu est relu (réussites et phrase « à revoir »).
  await expect.poll(async () => Object.keys((await savedState(page, 'A1:a1-hallo-nachsprechen'))?.answers ?? {}).length).toBe(4);
  await page.reload();
  await page.getByRole('navigation', { name: 'Activités de la séance' }).getByRole('button', { name: /^Répéter à voix haute/ }).click();
  await expect(page.locator('.study-question').getByText('Bien prononcé !')).toHaveCount(3);
  await expect(page.locator('.study-question').nth(2).getByText(/la phrase est notée « à revoir »/)).toBeVisible();
  await page.getByRole('button', { name: 'Valider mes réponses' }).click();
  await expect(page.getByText('Résultat enregistré · 3 / 4')).toBeVisible();
  await expect(page.getByText('1 question à revoir')).toBeVisible();
  await expect(page.getByRole('region', { name: 'Corrigé' }).getByText('À revoir', { exact: true })).toHaveCount(1);
  // Le modèle de chaque phrase se réécoute depuis le corrigé.
  await expect(page.getByRole('region', { name: 'Corrigé' }).locator('audio')).toHaveCount(4);
});

test('sans reconnaissance vocale : enregistrement pour le professeur, réponse en attente de validation', async ({ page }) => {
  await page.addInitScript(() => {
    delete (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition;
    delete (window as unknown as { SpeechRecognition?: unknown }).SpeechRecognition;
  });
  await page.goto(`/espace/bibliotheque/${A1}/a1-hallo-nachsprechen?as=eleve-suivi&reset=1`);
  const first = page.locator('.study-question').first();
  await expect(first.getByText(/Votre navigateur ne propose pas la reconnaissance vocale/)).toBeVisible();
  await expect(first.getByRole('button', { name: 'Parler' })).toHaveCount(0);
  // Un court fichier WAV déposé à la place du micro.
  const samples = 800;
  const wav = Buffer.alloc(44 + samples * 2);
  wav.write('RIFF', 0); wav.writeUInt32LE(36 + samples * 2, 4); wav.write('WAVE', 8); wav.write('fmt ', 12);
  wav.writeUInt32LE(16, 16); wav.writeUInt16LE(1, 20); wav.writeUInt16LE(1, 22); wav.writeUInt32LE(8000, 24); wav.writeUInt32LE(16000, 28);
  wav.writeUInt16LE(2, 32); wav.writeUInt16LE(16, 34); wav.write('data', 36); wav.writeUInt32LE(samples * 2, 40);
  await first.locator('input[type="file"]').setInputFiles({ name: 'phrase.wav', mimeType: 'audio/wav', buffer: wav });
  await first.getByRole('button', { name: 'Envoyer cet enregistrement' }).click();
  await expect(first.getByText('Enregistrement envoyé.')).toBeVisible();
  await expect(first.locator('.study-question-num svg')).toBeVisible();
});

test('bibliothèque : dictée corrigée mot à mot, « À revoir », refaire, aucun débordement à 390 px', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/espace/bibliotheque?niveau=A1&module=a1-hallo&as=eleve-suivi&reset=1');
  await expect(page.getByRole('link', { name: /Répéter à voix haute.*À revoir/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /Lexique du module/ })).toBeVisible();

  await page.goto(`/espace/bibliotheque/${A1}/a1-zahlen-diktat?as=eleve-suivi`);
  const areas = page.getByRole('textbox', { name: 'Ce que vous entendez' });
  await expect(areas).toHaveCount(3);
  // Pas de fuite du corrigé avant la remise.
  await expect(page.getByText('Ich bin zwanzig Jahre alt.')).toHaveCount(0);
  await areas.nth(0).fill('Ich bin 20 Jahre alt.');
  await areas.nth(1).fill('Der Kaffee kostet drei Euro fünfzig.');
  await areas.nth(2).fill('Mein Fahrad ist grün.');
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  await page.getByRole('button', { name: 'Valider mes réponses' }).click();
  const review = page.getByRole('region', { name: 'Corrigé' });
  await expect(review.getByText('Phrase attendue').first()).toBeVisible();
  await expect(review.locator('.sx-word.is-wrong')).not.toHaveCount(0);
  await expect(review.getByText('Mein Fahrrad ist blau.')).toBeVisible();
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  await page.getByRole('button', { name: 'Refaire l’exercice' }).click();
  await expect(page.getByRole('textbox', { name: 'Ce que vous entendez' }).first()).toHaveValue('');
  await expect(page.getByRole('region', { name: 'Corrigé' })).toHaveCount(0);
});

test('bibliothèque : remettre les mots en ordre en les faisant glisser à la souris', async ({ page }) => {
  await page.goto(`/espace/bibliotheque/${A2}/a2-gesundheit-ueben?as=eleve-suivi&reset=1`);
  const order = page.locator('.sx-order').first();
  await order.scrollIntoViewIfNeeded();
  const words = ['Ich bleibe zu Hause,', 'weil', 'ich', 'Fieber', 'habe.'];
  // Les mots sont glissés dans la phrase dans le désordre, puis « weil » est glissé à sa place.
  for (const word of ['Ich bleibe zu Hause,', 'ich', 'Fieber', 'habe.']) await order.getByRole('button', { name: `Ajouter « ${word} » à la phrase` }).click();
  const source = order.getByRole('button', { name: 'Ajouter « weil » à la phrase' });
  const target = order.getByRole('group', { name: 'Votre phrase' }).getByRole('button', { name: /^ich, mot 2/ });
  const from = await source.boundingBox();
  const to = await target.boundingBox();
  if (!from || !to) throw new Error('Mots introuvables.');
  await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2);
  await page.mouse.down();
  await page.mouse.move(from.x + from.width / 2 + 12, from.y + from.height / 2 - 12, { steps: 4 });
  await page.mouse.move(to.x + 3, to.y + to.height / 2, { steps: 10 });
  await expect(order.locator('.sx-caret')).toBeVisible();
  await page.mouse.up();
  await expect(order.getByRole('group', { name: 'Votre phrase' }).getByRole('button')).toHaveText(words);
});
