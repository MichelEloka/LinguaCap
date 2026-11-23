import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type FormEventHandler, type PointerEvent, type ReactNode } from 'react';
import { JourneyPath, type JourneyStep } from './JourneyPath';
import { prefersReducedMotion } from './motion';
import './journey-shell.css';

/** Mots allemands qui flottent dans la toile (très faible opacité). */
export const defaultJourneyWords: readonly string[] = ['Willkommen', 'Hallo', 'Danke', 'Bitte', 'Guten Tag', 'Wunderbar', 'Tschüss', 'Los geht’s'];

/**
 * Emplacements des mots (en % de la toile) : hors de la colonne des libellés du chemin, jamais coupés au bord.
 * `x`/`y` avec un contenu de toile, `sx`/`sy` quand le chemin est seul (centré), `mx`/`my` dans le bandeau mobile.
 */
const wordSpots = [
  { x: 41, y: 11, sx: 6, sy: 9, mx: 44, my: 72, size: 2.5, depth: .9 },
  { x: 40, y: 31, sx: 70, sy: 15, mx: -40, my: 0, size: 1.35, depth: .45 },
  { x: 40, y: 47, sx: 66, sy: 44, mx: -40, my: 0, size: 3, depth: 1 },
  { x: 41, y: 90, sx: 6, sy: 62, mx: -40, my: 0, size: 1.6, depth: .6 },
  { x: 66, y: 94, sx: 70, sy: 80, mx: -40, my: 0, size: 1.25, depth: .35 },
  { x: 70, y: 3.5, sx: 8, sy: 88, mx: -40, my: 0, size: 1.15, depth: .7 },
  { x: 84, y: 89, sx: 74, sy: 94, mx: -40, my: 0, size: 1, depth: .5 },
  { x: 46, y: 70, sx: 10, sy: 36, mx: -40, my: 0, size: 1.1, depth: .8 },
];

export interface JourneyShellProps {
  /** Teinte de l'accueil : professeur (aurore violette) ou élève (aurore bleue). */
  variant?: 'teacher' | 'learner';
  /** Nom accessible de l'écran d'accueil (fenêtre plein écran). */
  label: string;
  /** Mention à côté du logo dans la toile, par exemple « Accueil professeur ». */
  kicker?: ReactNode;
  /** Stations du chemin. */
  steps: readonly JourneyStep[];
  /** Identifiant de l'étape en cours. */
  current: string;
  /** Étapes terminées (par défaut : celles qui précèdent l'étape en cours). */
  completed?: readonly string[];
  /** Fin du parcours : chemin illuminé, rafale de vent dans la toile. */
  celebrate?: boolean;
  /** Nom accessible de la navigation des étapes (défaut : « Étapes de l’accueil »). */
  navLabel?: string;
  /** Rend cliquables les stations marquées `reachable`. */
  onSelectStep?: (id: string) => void;
  /** Actions d'en-tête (par exemple « Se déconnecter ») : en haut à droite de la scène, dans le bandeau sur mobile. */
  actions?: ReactNode;
  /** Contenu facultatif de la toile à côté du chemin (bureau uniquement), par exemple un aperçu de carte. */
  canvas?: ReactNode;
  /** Mots qui flottent dans la toile (défaut : quelques mots allemands). */
  words?: readonly string[];
  /** `true` (défaut) : fenêtre modale native au-dessus de l'application ; `false` : calque fixe plein écran. */
  modal?: boolean;
  /** Sortie en fondu (environ 340 ms) avant de démonter l'accueil. */
  leaving?: boolean;
  className?: string;
  /** La scène : en général un `JourneyStage` qui contient `JourneyQuestion` et `JourneyActions`. */
  children: ReactNode;
}

/**
 * Cadre plein écran des accueils « Le souffle » : à gauche (en haut sur mobile) la toile bleu nuit avec son aurore, ses mots
 * qui flottent et le chemin animé ; à droite (dessous) la scène claire des questions.
 */
export function JourneyShell({
  variant = 'learner', label, kicker, steps, current, completed, celebrate = false, navLabel, onSelectStep, actions, canvas,
  words = defaultJourneyWords, modal = true, leaving = false, className = '', children,
}: JourneyShellProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const rootRef = useRef<HTMLElement | null>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const frame = useRef(0);
  const [gust, setGust] = useState(0);

  // Ouverture en modale avant les effets des enfants : le titre de la question peut ensuite recevoir le focus.
  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    if (!modal || !dialog) return;
    if (!dialog.open) dialog.showModal();
    return () => { if (dialog.open) dialog.close(); };
  }, [modal]);

  useLayoutEffect(() => { sceneRef.current?.scrollTo?.({ top: 0 }); }, [current]);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const timer = window.setTimeout(() => setGust((value) => (value === 0 ? 1 : value)), 900);
    return () => window.clearTimeout(timer);
  }, []);
  useEffect(() => {
    if (celebrate && !prefersReducedMotion()) setGust((value) => value + 1);
  }, [celebrate]);
  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  function parallax(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== 'mouse' || prefersReducedMotion()) return;
    const root = rootRef.current;
    if (!root) return;
    const x = (event.clientX / window.innerWidth) * 2 - 1;
    const y = (event.clientY / window.innerHeight) * 2 - 1;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      root.style.setProperty('--px', x.toFixed(3));
      root.style.setProperty('--py', y.toFixed(3));
    });
  }

  const classes = ['jy', `is-${variant}`, modal ? 'is-modal' : 'is-fixed', leaving ? 'is-leaving' : '', celebrate ? 'is-celebrating' : '', className]
    .filter(Boolean).join(' ');
  const body = (
    <div className="jy-frame" onPointerMove={parallax}>
      <div className="jy-canvas" data-journey-canvas="">
        <div className="jy-sky" aria-hidden="true">
          <span className="jy-aurora is-1" />
          <span className="jy-aurora is-2" />
          <span className="jy-aurora is-3" />
          <span className="jy-dots" />
          <span className="jy-words" lang="de">
            {words.slice(0, wordSpots.length).map((word, index) => {
              const spot = wordSpots[index];
              return (
                <span key={`${word}-${index}`} style={{
                  '--i': index, '--x': `${canvas ? spot.x : spot.sx}%`, '--y': `${canvas ? spot.y : spot.sy}%`, '--mx': `${spot.mx}%`,
                  '--my': `${spot.my}%`, '--size': `${spot.size}rem`, '--depth': spot.depth,
                } as CSSProperties}>{word}</span>
              );
            })}
          </span>
          {gust > 0 && (
            <span className="jy-gust" key={gust}>
              {Array.from({ length: 9 }, (_, index) => <i key={index} style={{ '--g': index } as CSSProperties} />)}
            </span>
          )}
        </div>
        <div className="jy-brand">
          <img src="/favicon.svg" alt="" width={36} height={36} />
          <span className="jy-brand-name">LinguaCap</span>
          {kicker && <span className="jy-kicker">{kicker}</span>}
        </div>
        <div className={`jy-canvas-body${canvas ? '' : ' is-solo'}`}>
          <div className="jy-path">
            <JourneyPath steps={steps} current={current} completed={completed} celebrate={celebrate} label={navLabel}
              onSelect={onSelectStep} />
          </div>
          {canvas && <div className="jy-canvas-extra">{canvas}</div>}
        </div>
      </div>
      <div className="jy-scene">
        <div className="jy-scene-scroll" ref={sceneRef}>{children}</div>
      </div>
      {actions && <div className="jy-head-actions">{actions}</div>}
    </div>
  );

  if (modal) {
    return (
      <dialog ref={(node) => { dialogRef.current = node; rootRef.current = node; }} className={classes} aria-label={label}
        onCancel={(event) => event.preventDefault()}>
        {body}
      </dialog>
    );
  }
  return <div ref={(node) => { rootRef.current = node; }} className={classes} role="region" aria-label={label}>{body}</div>;
}

/**
 * Colonne de la scène : la question centrée, puis les actions collées en bas. Avec `onSubmit`, c'est un formulaire
 * (le bouton principal de `JourneyActions` est alors de type `submit`).
 */
export function JourneyStage({ onSubmit, className = '', children }: {
  onSubmit?: FormEventHandler<HTMLFormElement>; className?: string; children: ReactNode;
}) {
  const classes = `jy-stage${className ? ` ${className}` : ''}`;
  return onSubmit
    ? <form className={classes} onSubmit={onSubmit} noValidate>{children}</form>
    : <div className={classes}>{children}</div>;
}
