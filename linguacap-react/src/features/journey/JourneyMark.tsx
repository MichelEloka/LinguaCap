import type { CSSProperties } from 'react';

/**
 * Le « L » du logo LinguaCap dans sa tuile de verre, avec ses deux lignes de vent. La variable CSS `--s` (0 → 1),
 * posée sur un parent, étire le pied du L et souffle sur les lignes de vent : le voyageur du chemin s'en sert pendant
 * ses trajets. Purement décoratif (`aria-hidden`).
 */
export function JourneyMark({ size = 44, glow = true, className = '' }: { size?: number; glow?: boolean; className?: string }) {
  return (
    <span className={`jm${glow ? ' is-glow' : ''}${className ? ` ${className}` : ''}`} style={{ '--jm-size': `${size}px` } as CSSProperties}
      aria-hidden="true">
      <svg viewBox="0 0 64 64" focusable="false">
        <path className="jm-stem" d="M19 12v34" />
        <path className="jm-foot" d="M19 46q11-5 22 0" />
        <path className="jm-wind is-high" d="M25 35q10-7 23-2" />
        <path className="jm-wind is-low" d="M25 42q10-6 23-1" />
      </svg>
    </span>
  );
}
