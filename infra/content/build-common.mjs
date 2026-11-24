// Fonctions de construction partagées par build-v4.mjs (V4 A1/A2, format 4) et build-b.mjs (niveaux B, format 5) :
// normalisation des activités, questions et supports, sons des dictées et répétitions, son du lexique, médias inutilisés,
// écriture d'un niveau et crédits. Les règles propres à un niveau (profil lent, voix et profil du lexique, seuil des
// répétitions…) viennent de son profil (level-profiles.mjs).
import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { allMedia, availableLevels, baseDir, isLibre, levelFormat, loadLevel, loadRegistry, loadVoices } from './content-lib.mjs';
import { PROFILES } from './level-profiles.mjs';

export const clone = (value) => (value === undefined ? undefined : JSON.parse(JSON.stringify(value)));
export const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
export const words = (text) => String(text ?? '').trim().split(/\s+/).filter(Boolean);
export const clip = (text, max) => (text.length <= max ? text : `${text.slice(0, max - 1).trimEnd()}…`);

/** Crédit des voix de base (Thorsten et Kerstin), porté par chaque son de synthèse. */
export const voiceAttribution = {
  credit: 'LinguaCap, synthèse Piper avec Thorsten Müller (CC0) et Kerstin, préentraînée sur la voix de Cori Samuel (Hi-Fi TTS, CC BY 4.0)',
  license: 'Jeux de données des voix : CC0 et CC BY 4.0',
};
/** Révision épinglée des modèles Piper (content/README.md). */
export const PIPER_REVISION = 'cf910fb59f1d79ab3b625a63993a108751c6c25d';
const MLS = 'de_DE-mls-medium';
const EMOTIONAL = 'de_DE-thorsten_emotional-medium';
const BASE_MODELS = new Set(['de_DE-kerstin-medium', 'de_DE-thorsten-medium']);

/**
 * Crédit d'un son de synthèse d'après ses voix : celui des voix de base si le script n'emploie qu'elles, sinon un crédit
 * qui cite aussi le corpus MLS (CC BY 4.0) ou Thorsten émotionnel (CC0), selon infra/content/tts/voices.json.
 */
let knownVoices;
const voicesOf = () => (knownVoices ??= loadVoices().voices);
export function voiceCreditOf(script, voices = voicesOf()) {
  const models = new Set((script ?? []).filter((line) => line.voice).map((line) => voices[line.voice]?.model ?? 'inconnu'));
  if ([...models].every((model) => BASE_MODELS.has(model))) return { ...voiceAttribution };
  const extra = [...models].includes(MLS) ? ' et voix du corpus Multilingual LibriSpeech (MLS, CC BY 4.0)' : '';
  return {
    credit: `LinguaCap, synthèse Piper : Thorsten Müller (CC0), Kerstin (CC0, base Hi-Fi TTS CC BY 4.0)${extra}`,
    license: 'Jeux de données des voix : CC0 et CC BY 4.0',
  };
}

/** Identifiant d'une entrée de lexique tiré du mot : minuscules, translittération, tirets. */
export function slugOf(text) {
  return String(text).toLowerCase().replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'mot';
}

/** Ligne prononcée pour une entrée de lexique : « der Kopf, die Köpfe », « anfangen », « die Eltern ». */
export function lexiconLine(entry) {
  if (entry.partOfSpeech !== 'noun') return entry.word.trim();
  const article = entry.article ?? (/pluriel/i.test(entry.note ?? '') ? 'die' : null);
  const head = article ? `${article} ${entry.word.trim()}` : entry.word.trim();
  const plural = typeof entry.plural === 'string' ? entry.plural.trim() : '';
  if (!plural || /^[-–—]$/.test(plural)) return head;
  return `${head}, ${/^die\s/i.test(plural) ? plural : `die ${plural}`}`;
}

/** Seuil par défaut d'une répétition : celui du profil (V4 : 80 jusqu'à 3 mots, 75 au-delà). */
export const defaultThreshold = (text, profile = PROFILES.a1) => profile.threshold(text);

/** Collecte des problèmes : les erreurs empêchent l'écriture, les avertissements sont affichés. */
export function reporter() {
  const errors = [];
  const warnings = [];
  return {
    errors, warnings,
    fail: (where, message) => errors.push(`${where} : ${message}`),
    warn: (where, message) => warnings.push(`${where} : ${message}`),
  };
}

export function normalizePlacement(placement, mediaByKey) {
  const media = mediaByKey.get(placement.media);
  const usage = placement.usage ?? (media?.kind === 'audio' ? 'audio' : 'illustration');
  return {
    ...placement, usage,
    transcriptVisibility: placement.transcriptVisibility ?? (usage === 'audio' ? 'on_demand' : 'hidden'),
    decorative: Boolean(placement.decorative),
  };
}

/** Champs par défaut d'une question typée ; les champs fournis par l'auteur sont conservés tels quels. */
export function normalizeQuestion(question, profile = PROFILES.a1) {
  const type = question.type ?? 'choice';
  const normalized = { ...question, type };
  if (type === 'choice') {
    normalized.options = (question.options ?? []).map((option) => ({ ...option }));
  } else if (type === 'fill') {
    normalized.blanks = (question.blanks ?? []).map((blank) => ({
      ...blank, id: String(blank.id),
      size: blank.size ?? Math.min(30, Math.max(3, ...(blank.accept ?? []).map((value) => String(value).length + 1))),
      hint: blank.hint ?? null,
    }));
  } else if (type === 'dictation') {
    normalized.showWordCount = question.showWordCount ?? true;
  } else if (type === 'speak') {
    normalized.accept = question.accept ?? (question.text ? [question.text] : []);
    normalized.threshold = question.threshold ?? defaultThreshold(question.text, profile);
  }
  return normalized;
}

/** Activité normalisée : type déduit, leçon complète, questions typées, supports, mission (grille au format 5). */
export function normalizeActivity(activity, profile = PROFILES.a1) {
  const kind = activity.kind ?? ((activity.questions ?? []).length ? 'exercise' : activity.mission ? 'mission' : 'lesson');
  const normalized = {
    ...activity, kind,
    lesson: { title: activity.lesson?.title ?? activity.title, description: activity.lesson?.description ?? '',
      transcript: activity.lesson?.transcript ?? null },
    questions: kind === 'exercise' ? (activity.questions ?? []).map((question) => normalizeQuestion(question, profile)) : [],
    placements: activity.placements ?? [],
  };
  if (kind === 'mission') {
    const mission = activity.mission ?? {};
    normalized.mission = {
      oral: mission.oral ? { ...mission.oral, maxSeconds: mission.oral.maxSeconds ?? 120 } : null,
      written: mission.written ? { ...mission.written, maxChars: mission.written.maxChars ?? 1500 } : null,
      checklist: mission.checklist ?? [],
      ...(mission.criteria !== undefined ? { criteria: clone(mission.criteria) } : {}),
    };
  } else {
    delete normalized.mission;
    delete normalized.draft;
  }
  return normalized;
}

/**
 * Sons des questions dictation et speak : un MP3 par question (<activité>-<question>), support rattaché à la question.
 * Voix : celle de la question, sinon la rotation du profil selon le rang de la question ; profil lent éventuel du niveau.
 */
export function questionMedia(module, profile = PROFILES.a1, voices = undefined) {
  for (const activity of module.activities) {
    activity.questions.forEach((question, index) => {
      if (!['dictation', 'speak'].includes(question.type)) return;
      const key = `${activity.id}-${question.id}`;
      const text = question.type === 'dictation' ? question.accept?.[0] : question.text;
      if (!module.media.some((item) => item.key === key) && typeof text === 'string' && text.trim()) {
        const rotation = question.type === 'dictation' ? profile.build.dictationVoices : profile.build.speakVoices;
        const script = [{ voice: question.voice ?? rotation[index % rotation.length], text: text.trim() }];
        module.media.push({
          key, kind: 'audio',
          title: clip(`${question.type === 'dictation' ? 'Dictée' : 'Modèle à répéter'} ${question.id} · ${activity.title}`, 120),
          script,
          ...(profile.build.questionProfile ? { audioProfile: profile.build.questionProfile } : {}),
          ...voiceCreditOf(script, voices),
        });
      }
      if (!activity.placements.some((placement) => placement.media === key)) {
        activity.placements.push({
          media: key, usage: 'audio', questionId: question.id,
          transcriptVisibility: question.type === 'dictation' ? 'after_answer' : 'on_demand', decorative: false,
        });
      }
    });
  }
}

/** Vocabulaire : identifiants, champs par défaut et son du lexique (une réplique par entrée, segments). */
export function vocabulary(module, report, profile = PROFILES.a1, voices = undefined) {
  const entries = module.vocabulary ?? [];
  const key = `${module.id}-lexique`;
  const seen = new Set();
  module.vocabulary = entries.map((entry, line) => {
    let id = entry.id ?? slugOf(entry.word ?? `mot-${line + 1}`);
    if (!entry.id) for (let rank = 2; seen.has(id); rank++) id = `${slugOf(entry.word ?? 'mot')}-${rank}`;
    if (seen.has(id)) report.fail(`${module.id} › vocabulaire`, `identifiant « ${id} » en double`);
    seen.add(id);
    if (entry.audio) report.fail(`${module.id} › vocabulaire › ${id}`, 'audio est calculé par la construction : ne pas l’indiquer');
    return {
      id, word: entry.word, article: entry.article ?? null, plural: entry.plural ?? null, partOfSpeech: entry.partOfSpeech,
      translation: entry.translation, example: entry.example ?? null, note: entry.note ?? null, audio: { media: key, line },
    };
  });
  module.media = module.media.filter((item) => item.key !== key);
  if (!module.vocabulary.length) return;
  const script = module.vocabulary.flatMap((entry, index) => [
    ...(index ? [{ pause: profile.build.lexiconPause }] : []),
    { voice: profile.build.lexiconVoice, text: lexiconLine(entry) },
  ]);
  module.media.push({
    key, kind: 'audio', title: clip(`Lexique · ${module.title}`, 120), segments: true, audioProfile: profile.build.lexiconProfile,
    script,
    ...voiceCreditOf(script, voices),
  });
}

/** Médias qui ne servent plus (activité retirée…) ; ceux déclarés par l'auteur restent, signalés. */
export function pruneMedia(module, layerMedia, imageMeta, report) {
  const used = new Set(module.activities.flatMap((activity) => activity.placements.map((placement) => placement.media)));
  module.media = module.media.filter((item) => {
    if (used.has(item.key) || item.key === `${module.id}-lexique`) return true;
    if (layerMedia.has(item.key)) {
      report.warn(`${module.id} › média ${item.key}`, 'déclaré par la couche mais jamais placé');
      return true;
    }
    // Une illustration V4 dessinée pour ce module ne doit pas disparaître sans qu'on le voie (liste de supports remplacée…).
    if (imageMeta.has(item.key)) report.warn(`${module.id} › média ${item.key}`, 'illustration V4 plus placée par la couche : retirée');
    return false;
  });
}

export function writeJson(file, data) {
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
}

/**
 * Écrit le niveau dans <sortie>/<niveau> ; les fichiers de modules d'une construction précédente sont supprimés. Le
 * numéro NN de « NN-<id>.json » est le rang du module, ou celui donné par numbers (id → rang) pour un aperçu partiel.
 */
export function writeLevel(output, { level, modules }, { numbers } = {}) {
  const directory = join(output, level.levelId);
  const files = modules.map(({ id }, index) => ({ id, file: `${String(numbers?.get(id) ?? index + 1).padStart(2, '0')}-${id}.json` }));
  mkdirSync(directory, { recursive: true });
  const keep = new Set(['level.json', ...files.map(({ file }) => file)]);
  for (const name of readdirSync(directory)) if (name.endsWith('.json') && !keep.has(name)) rmSync(join(directory, name));
  writeJson(join(directory, 'level.json'), { ...level, modules: files });
  modules.forEach((module, index) => writeJson(join(directory, files[index].file), module));
  return files;
}

/** Crédits des médias de la V2 de référence, mis à jour pour le kit (V3 ou V4). */
export function baseCredits(edition) {
  const credits = JSON.parse(readFileSync(join(baseDir, 'media', 'credits.json'), 'utf8'));
  credits.sources[0].changes += ' ; tempo de plusieurs enregistrements adapté au niveau en V3, hauteur conservée';
  const voices = credits.sources.find(({ name }) => name.startsWith('Piper'));
  Object.assign(voices, {
    name: 'Piper 1.8 · Thorsten et Kerstin',
    author: 'Thorsten Müller, OHF Voice et Cori Samuel (Hi-Fi TTS, locutrice 92)',
    license: 'Données Thorsten et modèle de base rdh : CC0. Données Kerstin : CC0. Voix de base Hi-Fi TTS de Cori Samuel : CC BY 4.0.',
    url: `https://huggingface.co/rhasspy/piper-voices/tree/${PIPER_REVISION}/de/de_DE`,
    licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
    used: `Toutes les synthèses vocales du kit ${edition.toUpperCase()}, avec débits progressifs par niveau.`,
  });
  return credits;
}

const LICENSE_URLS = {
  CC0: 'https://creativecommons.org/publicdomain/zero/1.0/',
  'Domaine public': 'https://creativecommons.org/publicdomain/mark/1.0/',
  'CC BY 2.0 FR': 'https://creativecommons.org/licenses/by/2.0/fr/',
  'CC BY 2.5': 'https://creativecommons.org/licenses/by/2.5/',
  'CC BY 3.0': 'https://creativecommons.org/licenses/by/3.0/',
  'CC BY 4.0': 'https://creativecommons.org/licenses/by/4.0/',
  'CC BY-SA 3.0': 'https://creativecommons.org/licenses/by-sa/3.0/',
  'CC BY-SA 4.0': 'https://creativecommons.org/licenses/by-sa/4.0/',
};

/**
 * Crédits de content/de/media/credits.json : ceux de la V4 (V2 de référence, voix de base, Lucide, illustrations V4),
 * plus, pour chaque niveau au format 5 présent dans output, les fichiers du registre content/b/libre/registre.json
 * réellement employés et les voix ajoutées (MLS, Thorsten émotionnel). Sans niveau B, le résultat est celui de la V4.
 */
export function composeCredits(output, { edition = 'v4', voices = loadVoices().voices } = {}) {
  const credits = baseCredits(edition);
  // Seuls les niveaux au format 5 sont relus en entier (level.json d'abord, pour ne pas charger la V4).
  const levels = availableLevels(output).map((levelId) => {
    try {
      const head = JSON.parse(readFileSync(join(output, levelId, 'level.json'), 'utf8'));
      return levelFormat(head) >= 5 ? loadLevel(levelId, output) : null;
    } catch {
      return null;
    }
  }).filter(Boolean);
  if (!levels.length) return credits;
  const codes = levels.map((level) => level.levelId.toUpperCase());
  credits.description = `Origine et licence des ressources des parcours LinguaCap A1/A2 et ${codes.join(', ')}.`;
  const piper = credits.sources.find(({ name }) => name.startsWith('Piper'));
  piper.used = `Toutes les synthèses vocales des parcours A1, A2 et ${codes.join(', ')}, avec débits progressifs par niveau.`;

  // Fichiers téléchargés sous licence libre : une entrée par fichier, avec les médias qui l'emploient.
  const registry = loadRegistry();
  const usedFiles = new Map();
  // Voix ajoutées réellement employées (modèle → locuteurs), pour créditer MLS et Thorsten émotionnel.
  const models = new Map();
  for (const level of levels) {
    for (const media of allMedia(level)) {
      const file = media.photo?.file ?? media.native?.file;
      if (isLibre(file)) {
        if (!usedFiles.has(file)) usedFiles.set(file, []);
        usedFiles.get(file).push(`${media.key} (${level.levelId.toUpperCase()})`);
      }
      for (const line of media.script ?? []) {
        const voice = line.voice && voices[line.voice];
        if (!voice || BASE_MODELS.has(voice.model)) continue;
        if (!models.has(voice.model)) models.set(voice.model, new Set());
        if (Number.isInteger(voice.speaker)) models.get(voice.model).add(voice.speaker);
      }
    }
  }
  for (const [file, keys] of [...usedFiles].sort(([left], [right]) => left.localeCompare(right))) {
    const entry = registry.get(file) ?? {};
    credits.sources.push({
      name: entry.title ?? file.split('/').pop(), author: entry.author ?? 'inconnu (registre à compléter)',
      license: entry.license ?? 'inconnue (registre à compléter)', url: entry.url ?? null,
      licenseUrl: entry.licenseUrl ?? LICENSE_URLS[entry.license] ?? null,
      used: `${entry.source ? `${entry.source} · ` : ''}${keys.join(', ')}`,
      changes: entry.changes ?? 'aucune', file,
    });
  }
  if (models.has(MLS)) {
    const speakers = [...models.get(MLS)].sort((left, right) => left - right);
    credits.sources.push({
      name: 'Piper 1.8 · voix MLS (de_DE-mls-medium)',
      author: 'Multilingual LibriSpeech (V. Pratap et al., Meta AI, enregistrements LibriVox) ; modèle Piper de Rhasspy et OHF Voice',
      license: 'CC BY 4.0', url: `https://huggingface.co/rhasspy/piper-voices/tree/${PIPER_REVISION}/de/de_DE/mls/medium`,
      licenseUrl: LICENSE_URLS['CC BY 4.0'],
      used: `Voix variées des dialogues, écoutes et dictées des parcours ${codes.join(', ')}${speakers.length ? ` (locuteurs ${speakers.join(', ')})` : ''}.`,
    });
  }
  if (models.has(EMOTIONAL)) {
    credits.sources.push({
      name: 'Piper 1.8 · Thorsten émotionnel (de_DE-thorsten_emotional-medium)', author: 'Thorsten Müller, OHF Voice',
      license: 'CC0', url: `https://huggingface.co/rhasspy/piper-voices/tree/${PIPER_REVISION}/de/de_DE/thorsten_emotional/medium`,
      licenseUrl: LICENSE_URLS.CC0, used: `Voix d’appoint des dialogues des parcours ${codes.join(', ')}.`,
    });
  }
  return credits;
}
