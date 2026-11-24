/*
 * Liste statique des langues de LinguaCap, alignée sur `catalogue.languages` (migration 20261128000100) : noms, ordre et
 * ouverture des langues (réglage du service Identités). Elle ne dit pas quels niveaux sont ouverts : en mode API, la
 * vitrine lit GET /public/languages et les écrans connectés GET /languages (integration/languages.ts). Ses niveaux ne
 * valent qu'en mode démonstration, qui n'interroge pas le catalogue. Le pilote n'ouvre que l'allemand.
 */
import { isApiMode } from '../app/config';

export type LanguageStatus = 'available' | 'coming_soon';

export interface StaticLanguage {
  /** Code ISO 639-1 (deux lettres minuscules). */
  id: string;
  /** Nom en français. */
  name: string;
  /** Nom dans la langue elle-même. */
  nativeName: string;
  status: LanguageStatus;
  position: number;
  /**
   * Niveaux de la démonstration (vide en mode API : les niveaux ouverts viennent du catalogue, jamais de cette liste ;
   * vide aussi tant que la langue n'est pas ouverte).
   */
  levels: string[];
}

/** Niveaux du mode démonstration seulement (données fictives du `DemoProvider`). */
const demoLevels = isApiMode ? [] : ['A1', 'A2'];

export const languages: readonly StaticLanguage[] = [
  { id: 'de', name: 'Allemand', nativeName: 'Deutsch', status: 'available', position: 1, levels: demoLevels },
  { id: 'en', name: 'Anglais', nativeName: 'English', status: 'coming_soon', position: 2, levels: [] },
  { id: 'es', name: 'Espagnol', nativeName: 'Español', status: 'coming_soon', position: 3, levels: [] },
  { id: 'it', name: 'Italien', nativeName: 'Italiano', status: 'coming_soon', position: 4, levels: [] },
  { id: 'pt', name: 'Portugais', nativeName: 'Português', status: 'coming_soon', position: 5, levels: [] },
  { id: 'nl', name: 'Néerlandais', nativeName: 'Nederlands', status: 'coming_soon', position: 6, levels: [] },
  { id: 'fr', name: 'Français langue étrangère', nativeName: 'Français', status: 'coming_soon', position: 7, levels: [] },
  { id: 'ar', name: 'Arabe', nativeName: 'العربية', status: 'coming_soon', position: 8, levels: [] },
  { id: 'zh', name: 'Chinois (mandarin)', nativeName: '中文', status: 'coming_soon', position: 9, levels: [] },
  { id: 'ja', name: 'Japonais', nativeName: '日本語', status: 'coming_soon', position: 10, levels: [] },
  { id: 'ru', name: 'Russe', nativeName: 'Русский', status: 'coming_soon', position: 11, levels: [] },
  { id: 'ko', name: 'Coréen', nativeName: '한국어', status: 'coming_soon', position: 12, levels: [] },
  { id: 'tr', name: 'Turc', nativeName: 'Türkçe', status: 'coming_soon', position: 13, levels: [] },
  { id: 'pl', name: 'Polonais', nativeName: 'Polski', status: 'coming_soon', position: 14, levels: [] },
];

/** Langue par défaut du pilote. */
export const defaultLanguageId = 'de';

export const languageStatusLabels: Record<LanguageStatus, string> = {
  available: 'Disponible',
  coming_soon: 'Bientôt',
};

export function findLanguage(id: string | null | undefined): StaticLanguage | undefined {
  return id ? languages.find((language) => language.id === id) : undefined;
}

/** Nom français d'une langue (le code en majuscules si elle est inconnue). */
export function languageName(id: string | null | undefined): string {
  return findLanguage(id)?.name ?? (id ? id.toUpperCase() : '');
}

export function isLanguageAvailable(id: string | null | undefined): boolean {
  return findLanguage(id)?.status === 'available';
}

export const availableLanguages: readonly StaticLanguage[] = languages.filter((language) => language.status === 'available');
