import { useEffect, useSyncExternalStore } from 'react';

/**
 * Compteurs affichés à côté des liens de navigation (ex. contrats à valider).
 * Un écran déclare son compteur avec `useWorkspaceBadge(chemin, nombre)` ; le cadre les affiche sans dépendre de l'écran.
 */
const counts = new Map<string, number>();
const listeners = new Set<() => void>();
let snapshot: ReadonlyMap<string, number> = new Map();

function publish() {
  snapshot = new Map(counts);
  listeners.forEach((listener) => listener());
}

export function setWorkspaceBadge(path: string, count: number) {
  const next = Math.max(0, Math.floor(count));
  if ((counts.get(path) ?? 0) === next) return;
  if (next > 0) counts.set(path, next);
  else counts.delete(path);
  publish();
}

export function useWorkspaceBadges(): ReadonlyMap<string, number> {
  return useSyncExternalStore((listener) => {
    listeners.add(listener);
    return () => { listeners.delete(listener); };
  }, () => snapshot);
}

/** Déclare le compteur d'un lien tant que l'écran est monté ; `undefined` (chargement) ne change rien. */
export function useWorkspaceBadge(path: string, count: number | undefined) {
  useEffect(() => {
    if (count !== undefined) setWorkspaceBadge(path, count);
  }, [path, count]);
  useEffect(() => () => setWorkspaceBadge(path, 0), [path]);
}
