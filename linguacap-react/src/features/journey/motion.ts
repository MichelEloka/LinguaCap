import { useEffect, useState } from 'react';

const reducedQuery = '(prefers-reduced-motion: reduce)';

/** Vrai quand l'utilisateur a demandé de réduire les animations (lecture ponctuelle). */
export function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia?.(reducedQuery).matches === true;
}

/** Même réglage, suivi en direct pour les composants qui en dépendent au rendu. */
export function useReducedMotion() {
  const [reduced, setReduced] = useState(prefersReducedMotion);
  useEffect(() => {
    const list = window.matchMedia?.(reducedQuery);
    if (!list) return;
    const update = () => setReduced(list.matches);
    update();
    list.addEventListener('change', update);
    return () => list.removeEventListener('change', update);
  }, []);
  return reduced;
}

/** Pointeur précis avec survol (souris, pavé) : effets magnétiques, parallaxe et raccourcis affichés. */
export function hasFinePointer() {
  return typeof window !== 'undefined' && window.matchMedia?.('(hover: hover) and (pointer: fine)').matches === true;
}

/** Courbe de Bézier cubique (comme `cubic-bezier()` en CSS), résolue par Newton-Raphson. */
export function cubicBezier(x1: number, y1: number, x2: number, y2: number) {
  const at = (s: number, a: number, b: number) => 3 * a * s * (1 - s) ** 2 + 3 * b * s * s * (1 - s) + s ** 3;
  const slope = (s: number, a: number, b: number) => 3 * a * (1 - s) ** 2 + 6 * (b - a) * s * (1 - s) + 3 * (1 - b) * s * s;
  return (t: number) => {
    if (t <= 0) return 0;
    if (t >= 1) return 1;
    let s = t;
    for (let step = 0; step < 8; step++) {
      const error = at(s, x1, x2) - t;
      const derivative = slope(s, x1, x2);
      if (Math.abs(error) < 1e-5 || Math.abs(derivative) < 1e-6) break;
      s = Math.min(1, Math.max(0, s - error / derivative));
    }
    return at(s, y1, y2);
  };
}

/** Trajet du voyageur : départ franc comme une rafale, longue arrivée en douceur. */
export const travelEase = cubicBezier(.42, 0, .2, 1);

/** Vitesse normalisée (0 → 1 → 0) d'une courbe : l'étirement du L suit la vitesse réelle du trajet. */
export function speedOf(ease: (t: number) => number) {
  const delta = .004;
  const raw = (t: number) => (ease(Math.min(1, t + delta)) - ease(Math.max(0, t - delta))) / (Math.min(1, t + delta) - Math.max(0, t - delta));
  let peak = 0;
  for (let t = 0; t <= 1; t += .01) peak = Math.max(peak, raw(t));
  return (t: number) => (peak ? Math.min(1, raw(t) / peak) : 0);
}
export const travelSpeed = speedOf(travelEase);

/** Cible clavier qui gère déjà Entrée ou les chiffres (champ de saisie, bouton, lien…). */
export function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  if (target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement) return true;
  if (target instanceof HTMLInputElement) return !['checkbox', 'radio', 'button', 'submit', 'reset', 'range'].includes(target.type);
  return false;
}
