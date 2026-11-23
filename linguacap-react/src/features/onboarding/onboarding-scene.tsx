/**
 * Outils de mise en scène de l'accueil élève dans le cadre « Le souffle » (features/journey) : contexte partagé par les
 * étapes (sens du déplacement, sortie en fondu, emplacement de la toile), transition entre deux étapes, liens qui
 * quittent l'accueil en douceur et carnet de route affiché dans la toile sur grand écran.
 */
import { Component, createContext, createRef, useContext, useLayoutEffect, type MouseEvent, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { CalendarDays, Check, Gauge, Languages, Target } from 'lucide-react';
import { LanguageFlag } from '../../components/LanguagePicker';
import { prefersReducedMotion, type JourneyDirection } from '../journey';
import { formatMinutes, weekdayShortLabels, weeklyCapacity, type Day, type StartLevel } from '../../integration/v2';
import { LevelMark, levelName, shortDate } from './onboarding-kit';

export interface SceneContextValue {
  /** Sens du dernier déplacement entre deux étapes (les questions entrent par le bas ou par le haut). */
  direction: JourneyDirection;
  /** Quitte l'accueil : fondu de sortie du cadre, puis navigation. */
  leave: (to: string) => void;
  /** Emplacement de la toile (bureau) où une étape peut afficher son propre contenu (avancement du test). */
  canvasSlot: HTMLElement | null;
  /** Une étape occupe la toile (+1) ou la libère (-1) : le carnet de route s'efface tant qu'elle l'occupe. */
  claimCanvas: (delta: number) => void;
}

export const SceneContext = createContext<SceneContextValue>({
  direction: 'forward', leave: () => {}, canvasSlot: null, claimCanvas: () => {},
});
export const useScene = () => useContext(SceneContext);

/** Affiche son contenu dans la toile du voyage (bureau uniquement ; rien sur mobile) à la place du carnet de route. */
export function CanvasPortal({ children }: { children: ReactNode }) {
  const { canvasSlot, claimCanvas } = useScene();
  useLayoutEffect(() => {
    claimCanvas(1);
    return () => claimCanvas(-1);
  }, [claimCanvas]);
  return canvasSlot ? createPortal(children, canvasSlot) : null;
}

/** Lien qui quitte l'accueil : le cadre s'efface (environ 340 ms) avant d'ouvrir la page demandée. */
export function LeaveLink({ to, className, children, ...rest }: {
  to: string; className?: string; children: ReactNode; 'aria-label'?: string; title?: string;
}) {
  const { leave } = useScene();
  function click(event: MouseEvent<HTMLAnchorElement>) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    leave(to);
  }
  return <Link to={to} className={className} onClick={click} {...rest}>{children}</Link>;
}

interface Snapshot { clone: HTMLElement; top: number; left: number; width: number }
const linked = ['id', 'name', 'for', 'aria-labelledby', 'aria-describedby', 'aria-controls'];

/**
 * Transition entre deux étapes de l'accueil : chaque étape a sa propre question, donc le cadre ne peut pas garder
 * l'image de la précédente. Ce conteneur la garde : un clone inerte de la question sortante monte et s'efface pendant
 * que l'entrante arrive (même mouvement que `JourneyQuestion`, sans rien dupliquer pour les technologies d'assistance).
 */
export class SceneTransition extends Component<{ sceneKey: string; direction: JourneyDirection; children: ReactNode }> {
  private root = createRef<HTMLDivElement>();
  private ghosts = createRef<HTMLDivElement>();

  getSnapshotBeforeUpdate(previous: Readonly<{ sceneKey: string }>): Snapshot | null {
    if (previous.sceneKey === this.props.sceneKey || prefersReducedMotion()) return null;
    const root = this.root.current;
    const node = root?.querySelector(':scope > .lo-scene-live .jq, :scope > .lo-scene-live .jcel');
    if (!root || !(node instanceof HTMLElement) || typeof node.animate !== 'function') return null;
    const clone = node.cloneNode(true) as HTMLElement;
    for (const element of [clone, ...clone.querySelectorAll('[id], [name], [for], [aria-labelledby], [aria-describedby], [aria-controls]')]) {
      for (const attribute of linked) element.removeAttribute(attribute);
    }
    clone.querySelectorAll('audio, video').forEach((media) => media.remove());
    clone.querySelectorAll<HTMLElement>('input, button, a, textarea, select').forEach((control) => { control.tabIndex = -1; });
    const from = node.getBoundingClientRect();
    const box = root.getBoundingClientRect();
    return { clone, top: from.top - box.top, left: from.left - box.left, width: from.width };
  }

  componentDidUpdate(_previous: unknown, _state: unknown, snapshot: Snapshot | null) {
    const ghosts = this.ghosts.current;
    if (!snapshot || !ghosts) return;
    const { clone, top, left, width } = snapshot;
    Object.assign(clone.style, { position: 'absolute', top: `${top}px`, left: `${left}px`, width: `${width}px`, margin: '0' });
    ghosts.replaceChildren(clone);
    const shift = this.props.direction === 'back' ? 30 : -30;
    const animation = clone.animate(
      [{ opacity: 1, transform: 'none', filter: 'blur(0)' }, { opacity: 0, transform: `translateY(${shift}px)`, filter: 'blur(2px)' }],
      { duration: 320, easing: 'cubic-bezier(.4, 0, .8, .4)', fill: 'forwards' },
    );
    const remove = () => clone.remove();
    animation.onfinish = remove;
    animation.oncancel = remove;
  }

  render() {
    return (
      <div className="lo-scene" ref={this.root}>
        <div className="lo-scene-ghosts" ref={this.ghosts} aria-hidden="true" inert />
        <div className="lo-scene-live">{this.props.children}</div>
      </div>
    );
  }
}

// ---------------------------------------------------------------------------------------------------------------------
// Carnet de route (toile, bureau)
// ---------------------------------------------------------------------------------------------------------------------

export interface CarnetData {
  language: { id: string; name: string } | null;
  level: StartLevel | null;
  levelLabel: string | null;
  target: { level: StartLevel; date: string } | null;
  weeklyMinutes: number | null;
  days: readonly Day[];
}

/** Carte de verre dans la toile : ce que l'élève a déjà décidé se remplit au fil des étapes. */
export function JourneyCarnet({ data }: { data: CarnetData }) {
  const capacity = data.days.length ? weeklyCapacity([...data.days]) : 0;
  const rows: { key: string; icon: ReactNode; label: string; value: ReactNode; filled: boolean }[] = [
    {
      key: 'language', icon: <Languages size={15} />, label: 'Langue', filled: Boolean(data.language),
      value: data.language ? <span className="lo-carnet-lang"><LanguageFlag languageId={data.language.id} />{data.language.name}</span> : 'À choisir',
    },
    {
      key: 'level', icon: <Gauge size={15} />, label: 'Niveau', filled: Boolean(data.level),
      value: data.level ? <span className="lo-carnet-level"><LevelMark code={data.level} size="sm" />{data.levelLabel ?? levelName(data.level)}</span> : 'À découvrir',
    },
    {
      key: 'target', icon: <Target size={15} />, label: 'Objectif', filled: Boolean(data.target),
      value: data.target ? <span className="lo-carnet-level"><LevelMark code={data.target.level} size="sm" />d’ici le {shortDate(data.target.date)}</span> : 'À définir',
    },
    {
      key: 'days', icon: <CalendarDays size={15} />, label: 'Ma semaine', filled: data.days.length > 0,
      value: data.days.length ? (
        <span className="lo-carnet-week">
          <span className="lo-carnet-dots" aria-hidden="true">
            {weekdayShortLabels.map((day, index) => (
              <i key={day} className={data.days.some((item) => item.weekday === index + 1) ? 'is-on' : undefined}>{day.charAt(0)}</i>
            ))}
          </span>
          {formatMinutes(capacity)} / sem.
        </span>
      ) : data.weeklyMinutes ? `${formatMinutes(data.weeklyMinutes)} / sem. à répartir` : 'À organiser',
    },
  ];
  return (
    <aside className="lo-carnet" aria-label="Votre carnet de route">
      <p className="lo-carnet-title">Votre carnet de route</p>
      <ul className="lo-carnet-rows">
        {rows.map((row) => (
          <li key={row.key} data-row={row.key} className={row.filled ? 'is-filled' : undefined}>
            <span className="lo-carnet-icon" aria-hidden="true">{row.filled ? <Check size={14} strokeWidth={3} /> : row.icon}</span>
            <span className="lo-carnet-text"><small>{row.label}</small><strong>{row.value}</strong></span>
          </li>
        ))}
      </ul>
    </aside>
  );
}
