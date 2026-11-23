import { Component, createRef, useEffect, useId, useRef, type ReactNode } from 'react';
import { prefersReducedMotion } from './motion';
import { typeset } from './typeset';
import './journey-scene.css';

export type JourneyDirection = 'forward' | 'back';

export interface JourneyQuestionProps {
  /** Identifiant de la question : quand il change, la question sortante monte et s'efface, l'entrante arrive du bas. */
  stepKey: string;
  /** `back` inverse le mouvement (retour à une question précédente). */
  direction?: JourneyDirection;
  /** Surtitre, par exemple « Question 2 sur 6 ». */
  eyebrow?: ReactNode;
  /** Icône décorative du surtitre. */
  icon?: ReactNode;
  /** Titre `h1` de l'écran, focalisé à l'arrivée de chaque question. */
  title: ReactNode;
  description?: ReactNode;
  /** Identifiant du titre (pour `aria-labelledby` ailleurs) ; généré sinon. */
  titleId?: string;
  /** Place le focus sur le titre à l'arrivée (défaut : oui). */
  autoFocus?: boolean;
  className?: string;
  /** Contenu de la question : choix, champ, compteur… */
  children?: ReactNode;
}

interface Snapshot { clone: HTMLElement; top: number; left: number; width: number }

/**
 * Garde une image de la question sortante (clone inerte et masqué) le temps de son départ, pendant que l'entrante
 * arrive. `getSnapshotBeforeUpdate` est le seul moment où l'ancien DOM est encore en place.
 */
class QuestionTransition extends Component<{ stepKey: string; direction: JourneyDirection; children: ReactNode }> {
  private layer = createRef<HTMLDivElement>();
  private ghosts = createRef<HTMLDivElement>();

  getSnapshotBeforeUpdate(previous: Readonly<{ stepKey: string }>): Snapshot | null {
    if (previous.stepKey === this.props.stepKey || prefersReducedMotion()) return null;
    const node = this.layer.current?.firstElementChild;
    if (!(node instanceof HTMLElement) || typeof node.animate !== 'function') return null;
    const clone = node.cloneNode(true) as HTMLElement;
    const sources = node.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('input, textarea');
    const copies = clone.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('input, textarea');
    const linked = ['id', 'name', 'for', 'aria-labelledby', 'aria-describedby', 'aria-controls'];
    for (const element of [clone, ...clone.querySelectorAll('[id], [name], [for], [aria-labelledby], [aria-describedby], [aria-controls]')]) {
      for (const attribute of linked) element.removeAttribute(attribute);
    }
    copies.forEach((copy, index) => {
      const source = sources[index];
      if (!source) return;
      if (copy instanceof HTMLInputElement && source instanceof HTMLInputElement) copy.checked = source.checked;
      copy.value = source.value;
      copy.tabIndex = -1;
    });
    return { clone, top: node.offsetTop, left: node.offsetLeft, width: node.offsetWidth };
  }

  componentDidUpdate(_previous: unknown, _state: unknown, snapshot: Snapshot | null) {
    const ghosts = this.ghosts.current;
    if (!snapshot || !ghosts) return;
    const { clone, top, left, width } = snapshot;
    Object.assign(clone.style, { position: 'absolute', top: `${top}px`, left: `${left}px`, width: `${width}px`, margin: '0' });
    ghosts.replaceChildren(clone);
    const shift = this.props.direction === 'back' ? 30 : -30;
    const animation = clone.animate(
      [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: `translateY(${shift}px)` }],
      { duration: 230, easing: 'cubic-bezier(.5, 0, .9, .5)', fill: 'forwards' },
    );
    const remove = () => clone.remove();
    animation.onfinish = remove;
    animation.oncancel = remove;
  }

  render() {
    return (
      <div className={`jq-stage is-${this.props.direction}`}>
        <div className="jq-ghosts" ref={this.ghosts} aria-hidden="true" inert />
        <div className="jq-layer" ref={this.layer}>{this.props.children}</div>
      </div>
    );
  }
}

function QuestionBody({ eyebrow, icon, title, description, titleId, autoFocus, className, children }: Omit<JourneyQuestionProps, 'stepKey' | 'direction'>) {
  const generated = useId();
  const id = titleId ?? generated;
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (autoFocus !== false) heading.current?.focus({ preventScroll: true });
  }, [autoFocus]);
  return (
    <section className={`jq${className ? ` ${className}` : ''}`} aria-labelledby={id}>
      <header className="jq-head">
        {(eyebrow || icon) && (
          <p className="jq-eyebrow">
            {icon && <span className="jq-eyebrow-icon" aria-hidden="true">{icon}</span>}
            {eyebrow}
          </p>
        )}
        <h1 id={id} ref={heading} tabIndex={-1}>{typeset(title)}</h1>
        {description && <p className="jq-description">{description}</p>}
      </header>
      {children !== undefined && children !== null && children !== false && <div className="jq-body">{children}</div>}
    </section>
  );
}

/**
 * Une question de l'accueil : surtitre, grand titre `h1` (focalisé à l'arrivée), description puis contenu, avec entrée
 * animée et transition entre deux questions. Garder un seul `JourneyQuestion` monté et changer `stepKey`.
 */
export function JourneyQuestion({ stepKey, direction = 'forward', ...body }: JourneyQuestionProps) {
  return (
    <QuestionTransition stepKey={stepKey} direction={direction}>
      <QuestionBody key={stepKey} {...body} />
    </QuestionTransition>
  );
}
