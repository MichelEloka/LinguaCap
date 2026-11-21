import { useId } from 'react';
import './welcome-journey.css';

const WIDTH = 700;
const START = 91;
const END = 639;
const curves = [43, 30, 50, 34, 51, 28, 44];

/** Décor de progression partagé. Le stepper et les commandes restent dans le flux normal. */
export function WelcomeJourney({ steps, current, label, variant = 'learner' }: {
  steps: readonly string[];
  current: number;
  label?: string;
  variant?: 'teacher' | 'learner';
}) {
  const id = useId();
  if (!steps.length) return null;

  const index = Math.max(0, Math.min(steps.length - 1, current));
  const points = steps.map((_, step) => ({
    x: START + (END - START) * step / Math.max(1, steps.length - 1),
    y: curves[step % curves.length],
  }));
  const segments = points.slice(1).map((point, step) => {
    const from = points[step];
    const middle = (from.x + point.x) / 2;
    return `M ${from.x} ${from.y} C ${middle} ${from.y}, ${middle} ${point.y}, ${point.x} ${point.y}`;
  });
  const active = points[index];

  return (
    <div className={`welcome-journey is-${variant}`}>
      <div className="welcome-journey-meta">
        <strong>{steps[index]}</strong>
        <span aria-label={label ? `${label}, étape ${index + 1} sur ${steps.length}` : undefined}>
          Étape {index + 1} sur {steps.length}
        </span>
      </div>
      <svg viewBox={`0 0 ${WIDTH} 84`} className="welcome-journey-track" aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id={`${id}-wind`} gradientUnits="userSpaceOnUse" x1="20" y1="18" x2={END} y2="66">
            <stop stopColor="var(--welcome-light)" />
            <stop offset=".48" stopColor="var(--welcome-accent)" />
            <stop offset="1" stopColor="var(--welcome-tip)" />
          </linearGradient>
          <radialGradient id={`${id}-halo`}>
            <stop stopColor="var(--welcome-accent)" stopOpacity=".48" />
            <stop offset="1" stopColor="var(--welcome-accent)" stopOpacity="0" />
          </radialGradient>
        </defs>
        <g className="welcome-journey-start">
          <path className="welcome-journey-gust" d="M 24 24 Q 19 70 48 71 H 85" />
          <path className="welcome-journey-origin" d={`M 33 14 V 40 Q 33 52 45 52 H 61 Q 81 52 91 ${points[0].y}`} pathLength="1" stroke={`url(#${id}-wind)`} />
        </g>
        {segments.map((segment, step) => <g key={step}>
          <path className="welcome-journey-skeleton" d={segment} />
          <path className={`welcome-journey-trail${step < index ? ' is-drawn' : ''}`} d={segment} pathLength="1" stroke={`url(#${id}-wind)`} />
        </g>)}
        {points.map((point, step) => <circle className={`welcome-journey-point${step < index ? ' is-done' : ''}`}
          key={step} cx={point.x} cy={point.y} r={step < index ? 4 : 3.5} />)}
        <g className="welcome-journey-runner" style={{ transform: `translate(${active.x}px, ${active.y}px)` }}>
          <circle className="welcome-journey-halo" r="30" fill={`url(#${id}-halo)`} />
          <circle className="welcome-journey-marker" r="11" />
          <path d="M -2.5 -4.5 V 2.5 Q -2.5 4 -1 4 H 4" className="welcome-journey-letter" />
        </g>
      </svg>
    </div>
  );
}
