// Profils de niveau des contenus (plan « Cours B1 et B2 complets », §3.4) : règles de construction et de contrôle propres
// à chaque niveau, lues par build-v4.mjs, build-b.mjs, build-common.mjs et check-content.mjs. Les valeurs A1 et A2 sont
// celles de la V4 (format 4), déplacées sans changement ; B1 et B2 décrivent le format 5. Un niveau sans profil (C1, C2)
// reçoit le profil B2, avec un avertissement. Règles du B2 : content/b/README.md, section « Profil B2 ».

/** Identifiant de niveau de parcours : a1 … c2 (échelle CECRL, minuscules). */
export const LEVEL_ID = /^[abc][12]$/;
export const isLevelId = (value) => typeof value === 'string' && LEVEL_ID.test(value);

const wordCount = (text) => String(text ?? '').trim().split(/\s+/).filter(Boolean).length;

/** Gabarit d'un module B : suffixe d'identifiant d'activité → type attendu ; une liste donne des variantes. */
const B1_THEME = [['einstieg', 'lesson'], ['lesen', 'exercise'], ['hoeren', 'exercise'], ['entdecken', 'exercise'],
  ['regel', 'lesson'], ['grammatik', 'exercise'], ['wortschatz', 'exercise'], ['redemittel', 'exercise'],
  [['hoeren2', 'lesen2'], 'exercise'], ['kontrolle', 'exercise']];
const B1_ATELIER = [['modell', 'lesson'], ['interaktion', 'exercise'], ['mediation', 'exercise'], ['korrektur', 'exercise'],
  ['pruefung', 'exercise'], ['schreiben', 'mission'], ['sprechen', 'mission'], ['bilan', 'lesson']];
/** Gabarit B2 (plan §1.4) : -redemittel quitte le thème ; à l'atelier, -interaktion devient -diskussion (4 speak). */
const B2_THEME = B1_THEME.filter(([suffix]) => suffix !== 'redemittel');
const B2_ATELIER = B1_ATELIER.map(([suffix, kind]) => [suffix === 'interaktion' ? 'diskussion' : suffix, kind]);

const V4 = {
  format: 4,
  /** Marqueurs de consigne bilingue ([fr], [fr?]) : interdits avant le format 5. */
  markers: 'none',
  /** Activités par module, durée d'une activité et d'un module (minutes), questions par exercice. */
  activities: [4, 16],
  activityMinutes: [5, 20],
  moduleMinutes: [55, 180],
  questions: [3, 10],
  /** Durées conseillées (avertissement) : leçon, exercice, répétition seule, mission. */
  durations: { lesson: [10, 15], exercise: [8, 12], speak: [8, 10], mission: [15, 20] },
  /** Explication d'une question typée : longueur admise et conseillée. */
  explanation: { min: 10, max: 600, advised: 400 },
  description: [20, 5000],
  /** Répétition : nombre de mots, seuil par défaut (80 jusqu'à 3 mots, 75 au-delà). */
  speakWords: [2, 12],
  threshold: (text) => (wordCount(text) <= 3 ? 80 : 75),
  /** Exercice « Répéter à voix haute » attendu : portée (all, theme, atelier), nombre de speak, exercice de speak seuls. */
  speakDrill: { scope: 'all', count: [4, 6], speakOnly: true },
  /** Dictées par module : portée (all, theme ou « à partir de » un module), nombre, longueur en mots (null : avertissement à 25). */
  dictations: { scope: 'all', count: [2, 4], words: null },
  /** Son de synthèse (caractères prononcés) et extrait natif (secondes). */
  synthCharacters: 2500,
  nativeSeconds: 240,
  /** Lexique : entrées par module (thème, atelier, modules de sons du début de l'A1). */
  vocabulary: { theme: [10, 30], atelier: [10, 30], sound: [6, 30] },
  soundModules: [],
  /** Missions : bornes par niveau ; criteria « optional » (aucune aujourd'hui) ou « required » (grille de 20 points). */
  missions: { oralSeconds: [30, 120], maxChars: [200, 1500], minWords: [0, 200], criteria: 'optional', perAtelier: null },
  /** Exercice de grammaire attendu si le module a un grammarFocus : titre « S’entraîner : … », 6 questions. */
  grammar: { by: 'title', pattern: /^S[’']entraîner/, min: 6 },
  /** Gabarit d'identifiants d'activité (B seulement). */
  template: null,
  /** Débit des sons d'après le manifeste : lengthScale minimal ou fourchette, tempo maximal des enregistrements natifs. */
  rate: null,
  /** Construction : profil lent des dictées et répétitions (null : profil du module), son du lexique, voix par défaut. */
  build: { questionProfile: null, lexiconProfile: 'a1-debut', lexiconVoice: 'sprecher', lexiconPause: 0.9,
    dictationVoices: ['sprecherin'], speakVoices: ['sprecherin'], missionMinWords: 25 },
  /** Prérequis par défaut (level.json sans bloc catalogue) : le diagnostic vérifie alors les acquis de ce niveau. */
  prerequisiteLevelId: null,
  // Règles ajoutées pour les niveaux B (null : non contrôlé ; les niveaux A et le B1 gardent leur comportement).
  /** Longueur du document à lire (mots hors consignes, intertitres et gloses) des activités dont l'id finit par un suffixe. */
  reading: null,
  /** Durée de l'écoute principale (secondes) par suffixe d'activité : manifeste audio, sinon estimation d'après le script. */
  listening: null,
  /** Prise de notes de l'écoute principale : nombre de fill et trous par fill (avertissement). */
  noteTaking: null,
  /** Questions d'inférence du texte principal : choice à 4 options attendus (avertissement). */
  inference: null,
  /** Nombre de paires d'un match et de jetons d'un order conseillés (avertissement), seuil exact des répétitions. */
  matchPairs: null,
  orderTokens: null,
  speakThreshold: null,
  /** Langue des titres d'activité et des explications contrôlée (« de » : titres et explications en allemand). */
  language: null,
  /** Aide française repliée conseillée ([fr?]) : explications et leçons par suffixe ; consignes, liste et grille des missions. */
  foldAdvised: null,
  /** Place des bonnes réponses des choice : part maximale d'un même rang ; longueur relative et part « la plus longue ». */
  choiceBalance: { rankShare: 0.5, lengthRatio: null, longestShare: null },
};

const B = {
  ...V4,
  format: 5,
  activities: [6, 14],
  activityMinutes: [5, 30],
  moduleMinutes: [100, 150],
  durations: { lesson: [6, 15], exercise: [8, 20], speak: [8, 10], mission: [20, 30] },
  description: [20, 8000],
  synthCharacters: 5000,
  vocabulary: { theme: [15, 30], atelier: [10, 20], sound: [15, 30] },
  grammar: { by: 'id', suffix: '-grammatik', min: 6, scope: 'theme' },
  // Voix variées : répétitions par Kerstin et Thorsten (modèles clairs), dictées en rotation si la question n'a pas de voix.
  build: { questionProfile: null, lexiconProfile: null, lexiconVoice: 'sprecher', lexiconPause: 0.9,
    dictationVoices: ['sprecherin', 'mann2', 'frau2', 'sprecher'], speakVoices: ['sprecherin', 'sprecher'], missionMinWords: 40 },
};

export const PROFILES = {
  a1: {
    ...V4,
    levelId: 'a1',
    soundModules: ['a1-abc', 'a1-voyelles', 'a1-rythme'],
    dictations: { scope: 'from', from: 'a1-zahlen', count: [2, 4], words: null },
    rate: { lengthScaleMin: 1.3, nativeTempoMax: 0.88 },
    build: { ...V4.build, questionProfile: 'a1-debut', missionMinWords: 25 },
    budget: { min: 2200, max: 2300 },
  },
  a2: {
    ...V4,
    levelId: 'a2',
    build: { ...V4.build, missionMinWords: 40 },
    budget: { min: 2050, max: 2200 },
    prerequisiteLevelId: 'a1',
  },
  b1: {
    ...B,
    levelId: 'b1',
    markers: 'beside',
    explanation: { min: 10, max: 700, advised: 500 },
    speakWords: [4, 16],
    threshold: (text) => (wordCount(text) > 10 ? 70 : 75),
    speakDrill: { scope: 'theme', count: [4, 6], speakOnly: true },
    dictations: { scope: 'theme', count: [1, 2], words: [8, 20] },
    nativeSeconds: 240,
    missions: { oralSeconds: [90, 180], maxChars: [1000, 1500], minWords: [40, 120], criteria: 'required', perAtelier: 2 },
    template: { theme: B1_THEME, atelier: B1_ATELIER },
    rate: { lengthScale: [0.95, 1.1] },
    build: { ...B.build, lexiconProfile: 'b1-lexique' },
    audio: { debut: 'b1-debut', suite: 'b1-suite', debutModules: 8 },
    budget: { min: 2950, max: 3100 },
    prerequisiteLevelId: 'a2',
    // Texte principal de 250 à 400 mots (B1 livré : 269 à 388 mots hors consignes).
    reading: { suffixes: ['-lesen'], words: [250, 400] },
  },
  // B2 (phase 2, lot S5), réglé d'après le B1 livré (thème 128–130 min en 10 activités, atelier 116–118 min en 8,
  // explications de 57 à 317 caractères, écoutes de 94 à 137 s, 16 à 18 caractères prononcés par seconde) et le gabarit
  // B2 (plan §1.4, §1.5, §2.1, §2.2) : consignes, règles et explications en allemand avec aide française repliée ([fr?],
  // jamais [fr]) ; titres d'activité en allemand ; textes de 450 à 700 mots ; écoutes de 3 à 5 minutes avec prise de
  // notes longue ; dictées facultatives ; répétitions seulement dans -diskussion (4 speak de 8 à 20 mots, seuil 70) ;
  // missions de 1 500 à 3 000 caractères (150 à 250 mots) et de 120 à 300 secondes, grilles B2 de 20 points.
  b2: {
    ...B,
    levelId: 'b2',
    markers: 'fold',
    // Thème de 9 activités (environ 125–140 min : -lesen et -hoeren de 20 à 25 min), atelier de 8 (115–130 min, écrit de
    // 25 à 30 min) ; un exercice de lecture longue ou d'entraînement au format peut durer 25 minutes.
    durations: { lesson: [6, 15], exercise: [8, 25], speak: [8, 10], mission: [20, 30] },
    // Allemand avec aide repliée : environ deux fois la longueur d'une explication B1.
    explanation: { min: 10, max: 1000, advised: 800 },
    speakWords: [8, 20],
    threshold: () => 70,
    speakThreshold: 70,
    speakDrill: { scope: 'atelier', suffix: '-diskussion', count: [4, 6], speakOnly: false },
    dictations: { scope: 'theme', count: [0, 2], words: [8, 20] },
    nativeSeconds: 300,
    missions: { oralSeconds: [120, 300], maxChars: [1500, 3000], minWords: [100, 220], criteria: 'required', perAtelier: 2 },
    template: { theme: B2_THEME, atelier: B2_ATELIER },
    rate: { lengthScale: [0.92, 1.05] },
    build: { ...B.build, lexiconProfile: 'b2-lexique' },
    audio: { debut: 'b2-debut', suite: 'b2-suite', debutModules: 8 },
    budget: { min: 2950, max: 3100 },
    prerequisiteLevelId: 'b1',
    reading: { suffixes: ['-lesen'], words: [450, 700] },
    // -hoeren : dialogue, interview ou débat de 3 à 5 min ; -hoeren2 : extrait authentique de 2 à 5 min (lot M2).
    listening: { '-hoeren': [180, 300], '-hoeren2': [120, 300] },
    noteTaking: { suffix: '-hoeren', fills: 2, blanks: [4, 8] },
    inference: { suffix: '-lesen', fourOptions: 2 },
    matchPairs: [4, 6],
    orderTokens: [8, 14],
    language: 'de',
    foldAdvised: { explanations: ['-entdecken', '-grammatik'], lessons: ['-regel'], mission: true },
    // Leçons du B1 : bonne réponse au même rang dans 43 % des choice au plus, jamais plus de 1,35 fois plus longue que le
    // plus long distracteur, et la plus longue des options dans une proportion proche du hasard (45 % au plus).
    choiceBalance: { rankShare: 0.43, lengthRatio: 1.35, longestShare: 0.45 },
  },
};

/**
 * Profil d'un niveau. Un niveau valide sans profil (c1, c2) prend celui du B2 : le message d'avertissement est passé à
 * warn (une fois par appel). Un identifiant qui n'est pas un niveau CECRL renvoie null.
 */
export function profileOf(levelId, { warn } = {}) {
  if (PROFILES[levelId]) return PROFILES[levelId];
  if (!isLevelId(levelId)) return null;
  warn?.(`niveau ${levelId} sans profil dans level-profiles.mjs : règles du B2 appliquées`);
  return {
    ...PROFILES.b2, levelId, fallback: true,
    build: { ...PROFILES.b2.build, lexiconProfile: `${levelId}-lexique` },
    audio: { debut: `${levelId}-debut`, suite: `${levelId}-suite`, debutModules: 8 },
    prerequisiteLevelId: null,
  };
}

/** Module « atelier » (production, médiation, examen) ou « thème » (compréhension, grammaire, lexique). */
export const isAtelier = (moduleId) => /-atelier$/.test(String(moduleId ?? ''));
