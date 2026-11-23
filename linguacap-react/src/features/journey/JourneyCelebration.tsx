import { useEffect, useId, useRef, type CSSProperties, type ReactNode } from 'react';
import { Check } from 'lucide-react';
import { JourneyMark } from './JourneyMark';
import { prefersReducedMotion } from './motion';
import { typeset } from './typeset';
import './journey-scene.css';

export interface JourneyCelebrationItem {
  icon?: ReactNode;
  label: string;
  value: ReactNode;
}

export interface JourneyCelebrationProps {
  eyebrow?: ReactNode;
  /** Titre `h1`, focalisé à l'arrivée. */
  title: ReactNode;
  description?: ReactNode;
  /** Récapitulatif élégant (deux colonnes sur bureau). */
  items?: readonly JourneyCelebrationItem[];
  /**
   * Suite automatique : barre de progression et appel de `onContinue` après `after` ms (raccourci de moitié si les
   * animations sont réduites). Le bouton d'action reste disponible pour continuer tout de suite.
   */
  autoContinue?: { after: number; label: ReactNode; onContinue: () => void };
  titleId?: string;
  /** Actions (bouton, lien « Aller à mon accueil »…). */
  children?: ReactNode;
}

/** Écran de fin : emblème du L qui s'illumine, rayons, titre, récapitulatif et actions. À combiner avec `celebrate` du cadre. */
export function JourneyCelebration({ eyebrow, title, description, items, autoContinue, titleId, children }: JourneyCelebrationProps) {
  const generated = useId();
  const id = titleId ?? generated;
  const heading = useRef<HTMLHeadingElement>(null);
  const onContinue = useRef(autoContinue?.onContinue);
  onContinue.current = autoContinue?.onContinue;
  const delay = autoContinue ? (prefersReducedMotion() ? Math.round(autoContinue.after / 2) : autoContinue.after) : 0;

  useEffect(() => { heading.current?.focus({ preventScroll: true }); }, []);
  useEffect(() => {
    if (!delay) return;
    const timer = window.setTimeout(() => onContinue.current?.(), delay);
    return () => window.clearTimeout(timer);
  }, [delay]);

  return (
    <section className="jcel" aria-labelledby={id}>
      <div className="jcel-emblem" aria-hidden="true">
        <span className="jcel-ring" />
        <span className="jcel-ring is-2" />
        <span className="jcel-ring is-3" />
        <span className="jcel-rays">
          {Array.from({ length: 10 }, (_, index) => <i key={index} style={{ '--r': index } as CSSProperties} />)}
        </span>
        <JourneyMark size={88} />
        <span className="jcel-badge"><Check size={18} strokeWidth={3.2} /></span>
      </div>
      {eyebrow && <p className="jq-eyebrow jcel-eyebrow">{eyebrow}</p>}
      <h1 id={id} ref={heading} tabIndex={-1}>{typeset(title)}</h1>
      {description && <p className="jcel-description">{description}</p>}
      {items && items.length > 0 && (
        <dl className="jcel-recap lc-stagger">
          {items.map((item) => (
            <div key={item.label}>
              {item.icon && <span className="jcel-recap-icon" aria-hidden="true">{item.icon}</span>}
              <dt>{item.label}</dt>
              <dd>{item.value}</dd>
            </div>
          ))}
        </dl>
      )}
      {(children || autoContinue) && (
        <div className="jcel-actions">
          {children}
          {autoContinue && (
            <div className="jcel-countdown">
              <span className="jcel-bar" aria-hidden="true"><i style={{ '--d': `${delay}ms` } as CSSProperties} /></span>
              <span>{autoContinue.label}</span>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
