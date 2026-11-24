/*
 * Langues et niveaux tirés du catalogue : la seule source de « ce qui est ouvert ».
 * - `useLanguages(token)` : GET /languages (connecté). Tous les niveaux du catalogue de chaque langue, publiés ou non, avec
 *   leur position, leur prérequis, et les paliers du test de niveau publié (`placementTiers`).
 * - `usePublicLanguages()` : GET /public/languages (sans compte). Niveaux publiés seulement, pour la vitrine et les pages
 *   d'accès. En mode démonstration (sans API), la liste statique de domain/languages.ts en tient lieu.
 * Chaque réponse est gardée pour la session (mémoire et sessionStorage, cinq minutes, comme le cache de la route publique) :
 * l'écran suivant l'a aussitôt, et un niveau publié apparaît partout au plus tard cinq minutes après sa publication.
 * L'échelle CECRL (v2.ts : `levelCodes`, `levelRank`, `levelLabel`) ne sert qu'à valider, ordonner et nommer un code : elle ne
 * dit jamais qu'un niveau est ouvert.
 */
import { useCallback, useEffect, useMemo, useSyncExternalStore } from 'react';
import { isApiMode } from '../app/config';
import { availableLanguages, languages as staticLanguages } from '../domain/languages';
import { requestApi } from './api';
import {
  levelCodes, levelRank, type Language, type LanguageLevel, type LevelCode, type PublicLanguage, type PublicLanguageLevel, type StartLevel,
} from './v2';

// ---------------------------------------------------------------------------------------------------------------------
// Lecture des réponses (valeurs sûres si un service antérieur omet un champ récent)
// ---------------------------------------------------------------------------------------------------------------------

type Json = Record<string, unknown>;
const isObject = (value: unknown): value is Json => typeof value === 'object' && value !== null;
const isLevelCode = (value: unknown): value is LevelCode => typeof value === 'string' && (levelCodes as readonly string[]).includes(value);
const numberOrNull = (value: unknown) => (typeof value === 'number' && Number.isFinite(value) ? value : null);
const text = (value: unknown, fallback: string) => (typeof value === 'string' && value.trim() ? value : fallback);

/** Ordre du catalogue : `position` croissante (absente en dernier), puis rang de l'échelle. */
export function catalogueOrder<T extends { code: string; position: number | null }>(levels: readonly T[]): T[] {
  return [...levels].sort((a, b) => (a.position ?? Infinity) - (b.position ?? Infinity) || levelRank(a.code) - levelRank(b.code));
}

function parseLevel(raw: unknown): LanguageLevel | null {
  if (!isObject(raw) || !isLevelCode(raw.code)) return null;
  return {
    code: raw.code, title: text(raw.title, raw.code), published: raw.published === true,
    trackVersionId: typeof raw.trackVersionId === 'string' ? raw.trackVersionId : null,
    plannedMinutes: numberOrNull(raw.plannedMinutes), moduleCount: numberOrNull(raw.moduleCount) ?? 0,
    position: numberOrNull(raw.position), prerequisiteCode: isLevelCode(raw.prerequisiteCode) ? raw.prerequisiteCode : null,
  };
}

function parseLanguages(raw: unknown): Language[] {
  if (!Array.isArray(raw)) throw new Error('La liste des langues ne correspond pas au contrat attendu.');
  return raw.flatMap((item): Language[] => {
    if (!isObject(item) || typeof item.id !== 'string') return [];
    const levels = Array.isArray(item.levels) ? item.levels.map(parseLevel).filter((level): level is LanguageLevel => level !== null) : [];
    return [{
      id: item.id, name: text(item.name, item.id.toUpperCase()), nativeName: text(item.nativeName, ''),
      status: item.status === 'available' ? 'available' : 'coming_soon', position: numberOrNull(item.position) ?? 0,
      placementAvailable: item.placementAvailable === true, levels: catalogueOrder(levels),
      placementTiers: Array.isArray(item.placementTiers) ? item.placementTiers.filter(isLevelCode) : [],
    }];
  }).sort((a, b) => a.position - b.position);
}

function parsePublicLanguages(raw: unknown): PublicLanguage[] {
  if (!Array.isArray(raw)) throw new Error('La liste publique des langues ne correspond pas au contrat attendu.');
  return raw.flatMap((item): PublicLanguage[] => {
    if (!isObject(item) || typeof item.id !== 'string' || !Array.isArray(item.levels)) return [];
    const levels = item.levels.flatMap((level): PublicLanguageLevel[] => (isObject(level) && isLevelCode(level.code) ? [{
      code: level.code, title: text(level.title, level.code), position: numberOrNull(level.position),
      moduleCount: numberOrNull(level.moduleCount) ?? 0, plannedMinutes: numberOrNull(level.plannedMinutes),
    }] : []));
    return levels.length ? [{
      id: item.id, name: text(item.name, item.id.toUpperCase()), nativeName: text(item.nativeName, ''),
      position: numberOrNull(item.position) ?? 0, levels: catalogueOrder(levels),
    }] : [];
  }).sort((a, b) => a.position - b.position);
}

// ---------------------------------------------------------------------------------------------------------------------
// Cache de session
// ---------------------------------------------------------------------------------------------------------------------

interface Slot<T> { readonly data: T | null; readonly at: number; readonly failed: boolean; readonly loading: boolean }

const TTL = 5 * 60_000;
const storagePrefix = 'linguacap-catalogue:';
const EMPTY: Slot<never> = Object.freeze({ data: null, at: 0, failed: false, loading: false });
const slots = new Map<string, Slot<unknown>>();
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

/** Réponse gardée en mémoire, sinon relue dans sessionStorage (rechargement de la page dans la même session). */
function slotOf<T>(path: string): Slot<T> {
  const known = slots.get(path);
  if (known) return known as Slot<T>;
  try {
    const saved = JSON.parse(window.sessionStorage.getItem(storagePrefix + path) ?? 'null') as { at?: unknown; data?: unknown } | null;
    if (saved && typeof saved.at === 'number' && Array.isArray(saved.data)) {
      const slot: Slot<unknown> = { data: saved.data, at: saved.at, failed: false, loading: false };
      slots.set(path, slot);
      return slot as Slot<T>;
    }
  } catch { /* stockage indisponible ou illisible : la réponse sera relue */ }
  return EMPTY;
}

function update(path: string, slot: Slot<unknown>, persist = false) {
  slots.set(path, slot);
  if (persist) {
    try { window.sessionStorage.setItem(storagePrefix + path, JSON.stringify({ at: slot.at, data: slot.data })); } catch { /* mémoire seule */ }
  }
  listeners.forEach((listener) => listener());
}

/**
 * Lit la route si la réponse gardée manque ou date de plus de cinq minutes (`force` : toujours). Une réponse périmée reste
 * servie pendant la relecture ; un échec ne l'efface pas.
 */
function load<T>(path: string, token: string | undefined, parse: (raw: unknown) => T, force = false) {
  const slot = slotOf<T>(path);
  if (slot.loading || (!force && slot.data !== null && Date.now() - slot.at < TTL)) return;
  update(path, { ...slot, loading: true, failed: false });
  requestApi<unknown>(path, token)
    .then((raw) => update(path, { data: parse(raw), at: Date.now(), failed: false, loading: false }, true))
    .catch(() => update(path, { ...slotOf(path), failed: true, loading: false }));
}

function useCatalogue<T>(path: string, token: string | undefined, parse: (raw: unknown) => T, enabled: boolean) {
  const slot = useSyncExternalStore(subscribe, () => slotOf<T>(path));
  useEffect(() => { if (enabled) load(path, token, parse); }, [path, token, parse, enabled]);
  const retry = useCallback(() => { if (enabled) load(path, token, parse, true); }, [path, token, parse, enabled]);
  return { data: slot.data, failed: slot.data === null && slot.failed, loading: slot.loading, retry };
}

// ---------------------------------------------------------------------------------------------------------------------
// Mode démonstration : la liste statique, sans appel
// ---------------------------------------------------------------------------------------------------------------------

const demoLanguages: Language[] = staticLanguages.map((language) => ({
  id: language.id, name: language.name, nativeName: language.nativeName, status: language.status, position: language.position,
  placementAvailable: false, placementTiers: [],
  levels: language.levels.filter(isLevelCode).map((code, index) => ({
    code, title: `${language.name} ${code}`, published: true, trackVersionId: null, plannedMinutes: null, moduleCount: 0,
    position: index + 1, prerequisiteCode: null,
  })),
}));
const demoPublicLanguages: PublicLanguage[] = demoLanguages.filter((language) => language.levels.length).map((language) => ({
  id: language.id, name: language.name, nativeName: language.nativeName, position: language.position,
  levels: language.levels.map(({ code, title, position, moduleCount, plannedMinutes }) => ({ code, title, position, moduleCount, plannedMinutes })),
}));
const noop = () => undefined;

// ---------------------------------------------------------------------------------------------------------------------
// Crochets
// ---------------------------------------------------------------------------------------------------------------------

export interface LanguagesState<T> {
  /** null tant que la liste n'est pas connue (chargement ou échec sans réponse gardée). */
  languages: T[] | null;
  /** Échec sans aucune réponse gardée : l'écran l'annonce et propose de réessayer. */
  failed: boolean;
  loading: boolean;
  retry: () => void;
}

/** GET /languages (connecté) : tous les niveaux du catalogue, dans l'ordre de `position`. */
export function useLanguages(token: string | null | undefined): LanguagesState<Language> {
  const state = useCatalogue('/languages', token ?? undefined, parseLanguages, isApiMode && Boolean(token));
  if (!isApiMode) return { languages: demoLanguages, failed: false, loading: false, retry: noop };
  return { languages: state.data, failed: state.failed, loading: state.loading, retry: state.retry };
}

/** GET /public/languages (sans compte) : les niveaux publiés seulement, pour la vitrine et les pages d'accès. */
export function usePublicLanguages(): LanguagesState<PublicLanguage> {
  const state = useCatalogue('/public/languages', undefined, parsePublicLanguages, isApiMode);
  if (!isApiMode) return { languages: demoPublicLanguages, failed: false, loading: false, retry: noop };
  return { languages: state.data, failed: state.failed, loading: state.loading, retry: state.retry };
}

/** Liste connectée déjà gardée pour la session, sans la demander (calculs hors composant). */
export function peekLanguages(): Language[] | null {
  return isApiMode ? slotOf<Language[]>('/languages').data : demoLanguages;
}

// ---------------------------------------------------------------------------------------------------------------------
// Niveaux d'une langue
// ---------------------------------------------------------------------------------------------------------------------

export function languageById<T extends { id: string }>(list: readonly T[] | null | undefined, id: string | null | undefined): T | null {
  return id ? list?.find((language) => language.id === id) ?? null : null;
}

/** Niveaux publiés d'une langue (une version attribuable existe), dans l'ordre du catalogue. */
export function publishedLevels(language: Pick<Language, 'levels'> | null | undefined): LanguageLevel[] {
  return (language?.levels ?? []).filter((level) => level.published);
}

/** Niveaux strictement au-dessus d'un point de départ (rang de l'échelle), ordre conservé. */
export function levelsAbove<T extends { code: string }>(levels: readonly T[], start: StartLevel | string): T[] {
  return levels.filter((level) => levelRank(level.code) > levelRank(start));
}

/** Premier niveau publié au-dessus d'un point de départ, dans l'ordre du catalogue. */
export function nextPublishedLevel(language: Pick<Language, 'levels'> | null | undefined, start: StartLevel | string): LanguageLevel | null {
  return levelsAbove(publishedLevels(language), start)[0] ?? null;
}

/** Premier niveau du catalogue au-dessus d'un point de départ, publié ou non (perspective « Bientôt »). */
export function nextCatalogueLevel(language: Pick<Language, 'levels'> | null | undefined, start: StartLevel | string): LanguageLevel | null {
  return levelsAbove(language?.levels ?? [], start)[0] ?? null;
}

/** Codes publiés de plusieurs langues (union), dans l'ordre de l'échelle. */
export function publishedCodes(languages: readonly Pick<Language, 'levels'>[]): LevelCode[] {
  const codes = new Set(languages.flatMap((language) => publishedLevels(language).map((level) => level.code)));
  return levelCodes.filter((code) => codes.has(code));
}

// ---------------------------------------------------------------------------------------------------------------------
// Textes
// ---------------------------------------------------------------------------------------------------------------------

/** « A1 », « A1 et A2 », « A1, A2 et B1 ». */
export function joinFrench(items: readonly string[]): string {
  return items.length > 1 ? `${items.slice(0, -1).join(', ')} et ${items[items.length - 1]}` : items[0] ?? '';
}

/** Niveaux d'une phrase courte : « A1, A2 et B1 » jusqu'à trois, « A1 à C1 » au-delà (vitrine, pied de page, connexion). */
export function levelSeries(codes: readonly string[]): string {
  return codes.length > 3 ? `${codes[0]} à ${codes[codes.length - 1]}` : joinFrench(codes);
}

/** « A1 → B1 » (premier et dernier niveau), ou le seul code. */
export function levelRange(codes: readonly string[]): string {
  return codes.length > 1 ? `${codes[0]} → ${codes[codes.length - 1]}` : codes[0] ?? '';
}

const numberWords = ['zéro', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix'];
/** « trois » pour 3 (en chiffres au-delà de dix). */
export function countWord(count: number): string {
  return numberWords[count] ?? String(count);
}

/** « d’allemand », « de néerlandais ». */
function ofName(name: string) {
  const lower = name.toLowerCase();
  return /^[aeiouyéèêh]/.test(lower) ? `d’${lower}` : `de ${lower}`;
}

/**
 * Offre de la vitrine, tirée des niveaux publiés : langues (« Allemand »), complément (« d’allemand ») et codes publiés
 * (`[]` tant que la liste n'est pas connue ou si elle a échoué). Sans liste, les noms viennent des langues ouvertes.
 */
export interface PublicOffer {
  /** La liste publique est en cours de lecture (aucune réponse gardée) : les textes qui en dépendent attendent. */
  pending: boolean;
  /** « Allemand », « Allemand et anglais ». */
  languages: string;
  /** « d’allemand » pour une langue, « de langues » au-delà. */
  of: string;
  /** Niveaux publiés : ceux de la langue dans l'ordre du catalogue, ou l'union de plusieurs langues dans l'ordre de l'échelle. */
  codes: LevelCode[];
}

export function publicOffer(languages: readonly PublicLanguage[] | null, failed: boolean): PublicOffer {
  const open = languages?.length ? languages : availableLanguages;
  const names = open.map((language, index) => (index ? language.name.toLowerCase() : language.name));
  const codes = !languages ? [] : languages.length === 1 ? languages[0].levels.map((level) => level.code)
    : levelCodes.filter((code) => languages.some((language) => language.levels.some((level) => level.code === code)));
  return {
    pending: languages === null && !failed,
    languages: joinFrench(names),
    of: open.length === 1 ? ofName(open[0].name) : 'de langues',
    codes,
  };
}

/** Offre de la vitrine (voir `publicOffer`), relue avec la liste publique. */
export function usePublicOffer(): PublicOffer {
  const { languages, failed } = usePublicLanguages();
  return useMemo(() => publicOffer(languages, failed), [languages, failed]);
}

/**
 * Niveaux visés à proposer (contrats, avenants) : niveaux publiés de la langue au-dessus du départ, complétés par `extra`
 * (cibles autorisées par le serveur, cible en cours même si son niveau n'est plus publié). Ordre du catalogue.
 */
export function targetChoices(language: Pick<Language, 'levels'> | null | undefined, start: StartLevel | string,
  extra: readonly (LevelCode | null | undefined)[] = []): LevelCode[] {
  const catalogue = language?.levels ?? [];
  const codes = new Set<LevelCode>(levelsAbove(publishedLevels(language), start).map((level) => level.code));
  for (const code of extra) if (code && levelRank(code) > levelRank(start)) codes.add(code);
  return catalogueOrder([...codes].map((code) => ({ code, position: catalogue.find((level) => level.code === code)?.position ?? null })))
    .map((level) => level.code);
}
