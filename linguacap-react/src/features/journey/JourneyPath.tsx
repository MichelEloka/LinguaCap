import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { Check, Lock, Minus } from 'lucide-react';
import { JourneyMark } from './JourneyMark';
import { prefersReducedMotion, travelEase, travelSpeed } from './motion';
import './journey-path.css';

export type JourneyStepStatus = 'done' | 'current' | 'todo' | 'blocked' | 'skipped';

/** Une station du chemin. */
export interface JourneyStep {
  id: string;
  /** Libellé court affiché à côté de la station (« Langues », « Niveaux »…). */
  label: string;
  /** Icône de la station (par exemple `<Languages />` de lucide-react) ; un numéro sinon. */
  icon?: ReactNode;
  /** Statut imposé ; par défaut il est déduit de `current` et `completed`. */
  status?: JourneyStepStatus;
  /** Avec `onSelect`, la station devient un bouton « Revenir à l’étape … ». */
  reachable?: boolean;
}

export interface JourneyPathProps {
  steps: readonly JourneyStep[];
  /** Identifiant de l'étape en cours : le voyageur s'y rend. */
  current: string;
  /** Étapes terminées (par défaut : toutes celles qui précèdent l'étape en cours). */
  completed?: readonly string[];
  /** Fin du parcours : chemin entièrement illuminé, toutes les stations faites, éclat général. */
  celebrate?: boolean;
  /** Nom accessible de la navigation. */
  label?: string;
  /** Rend cliquables les stations `reachable` (sauf l'étape en cours). */
  onSelect?: (id: string) => void;
  /** `auto` : vertical si la boîte est plus haute que large, horizontal sinon. */
  orientation?: 'auto' | 'vertical' | 'horizontal';
  /** Ouverture « waouh » : tracé dessiné, stations qui apparaissent, le L qui descend sur la première station. */
  intro?: boolean;
  className?: string;
}

interface Point { x: number; y: number }
interface Geometry { vertical: boolean; origin: Point; start: string; points: Point[]; segments: string[]; d: string; labelX: number }

const round = (value: number) => Math.round(value * 10) / 10;
const svgNamespace = 'http://www.w3.org/2000/svg';

/** Tracé : spline de Catmull-Rom (convertie en courbes de Bézier) qui serpente d'une station à l'autre. */
function layout(count: number, width: number, height: number, vertical: boolean): Geometry {
  let origin: Point;
  let points: Point[];
  let labelX = 0;
  if (vertical) {
    const amplitude = Math.max(8, Math.min(20, width * .08));
    const axis = 26 + amplitude;
    const top = Math.min(68, Math.max(40, height * .09));
    const bottom = height - 24;
    const gap = count > 1 ? (bottom - top) / (count - 1) : 0;
    points = Array.from({ length: count }, (_, index) => ({
      x: round(axis + amplitude * Math.sin(index * 1.3 + .6)), y: round(top + gap * index),
    }));
    origin = { x: round(axis - amplitude * .3), y: 2 };
    labelX = axis + amplitude + 30;
  } else {
    const amplitude = Math.max(3, Math.min(8, height * .16));
    const axis = height / 2;
    const left = Math.min(46, width * .11);
    const right = width - 18;
    const gap = count > 1 ? (right - left) / (count - 1) : 0;
    points = Array.from({ length: count }, (_, index) => ({
      x: round(left + gap * index), y: round(axis + amplitude * Math.sin(index * 1.3 + .6)),
    }));
    origin = { x: 2, y: round(axis + amplitude * .5) };
  }
  const all = [origin, ...points];
  const tension = .2;
  const segments = all.slice(1).map((to, index) => {
    const from = all[index];
    const before = all[index - 1] ?? from;
    const after = all[index + 2] ?? to;
    const first = { x: from.x + (to.x - before.x) * tension, y: from.y + (to.y - before.y) * tension };
    const second = { x: to.x - (after.x - from.x) * tension, y: to.y - (after.y - from.y) * tension };
    return `C ${round(first.x)} ${round(first.y)} ${round(second.x)} ${round(second.y)} ${to.x} ${to.y}`;
  });
  const start = `M ${origin.x} ${origin.y}`;
  return { vertical, origin, start, points, segments, d: `${start} ${segments.join(' ')}`, labelX };
}

const statusSuffix: Record<JourneyStepStatus, string> = {
  done: ', terminée', current: ', en cours', todo: ', à venir', blocked: ', bloquée', skipped: ', passée',
};

type Phase = 'idle' | 'intro-wait' | 'intro-aborted' | 'travel' | 'rest' | 'interrupted';

/**
 * Chemin animé de l'accueil : un tracé SVG courbe, une station par étape et le « L » voyageur qui glisse de station
 * en station (positions par `getPointAtLength`, `requestAnimationFrame`, ~900 ms). Pendant le trajet, son pied s'étire
 * comme un coup de vent, des traînées et quelques particules le suivent ; à l'arrivée, rebond et éclat de la station.
 * Vertical et sinueux dans une boîte haute (bureau), horizontal dans une boîte large (mobile).
 */
export function JourneyPath({
  steps, current, completed, celebrate = false, label = 'Étapes de l’accueil', onSelect, orientation = 'auto', intro = true,
  className = '',
}: JourneyPathProps) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const boxRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<SVGPathElement>(null);
  const progressRef = useRef<SVGPathElement>(null);
  const glowRef = useRef<SVGPathElement>(null);
  const cometRefs = useRef<(SVGPathElement | null)[]>([]);
  const particlesRef = useRef<SVGGElement>(null);
  const travelerRef = useRef<HTMLDivElement>(null);
  const tileRef = useRef<HTMLDivElement>(null);
  const burstRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const motion = useRef({
    started: false, phase: 'idle' as Phase, raf: 0, timer: 0, pos: 0, angle: Math.PI / 2, target: 0,
    total: 0, lengths: [] as number[], geo: null as Geometry | null, splash: [] as Animation[],
  });
  const [introOn, setIntroOn] = useState(() => intro && !prefersReducedMotion());
  const introRef = useRef(introOn);
  const celebrateRef = useRef(celebrate);
  celebrateRef.current = celebrate;
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  const [arrived, setArrived] = useState(-1);

  useLayoutEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    const measure = () => {
      const rect = box.getBoundingClientRect();
      const next = { w: Math.round(rect.width), h: Math.round(rect.height) };
      setSize((previous) => (previous && previous.w === next.w && previous.h === next.h ? previous : next));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(box);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!introOn) return;
    const timer = window.setTimeout(() => setIntroOn(false), 3600);
    return () => window.clearTimeout(timer);
  }, [introOn]);

  const vertical = orientation === 'vertical' || (orientation === 'auto' && size !== null && size.h > size.w);
  const geo = useMemo(
    () => (size && size.w > 0 && size.h > 0 && steps.length ? layout(steps.length, size.w, size.h, vertical) : null),
    [size, steps.length, vertical],
  );
  const currentIndex = Math.max(0, steps.findIndex((step) => step.id === current));
  const targetIndex = celebrate ? Math.max(0, steps.length - 1) : currentIndex;
  const statuses: JourneyStepStatus[] = steps.map((step, index) => {
    if (celebrate) return step.status === 'skipped' ? 'skipped' : 'done';
    if (step.status) return step.status;
    if (index === currentIndex) return 'current';
    return (completed ? completed.includes(step.id) : index < currentIndex) ? 'done' : 'todo';
  });

  /** Pose le voyageur à la distance `length` du départ ; `stretch` (0 → 1) règle l'étirement et les traînées. */
  function place(length: number, stretch: number, direction: number) {
    const m = motion.current;
    const path = progressRef.current;
    const traveler = travelerRef.current;
    if (!path || !traveler || !m.total) return;
    const total = m.total;
    const at = Math.max(0, Math.min(total, length));
    const point = path.getPointAtLength(at);
    const ahead = path.getPointAtLength(Math.min(total, at + 1.5));
    const behind = path.getPointAtLength(Math.max(0, at - 1.5));
    let angle = Math.atan2(ahead.y - behind.y, ahead.x - behind.x);
    if (direction < 0) angle += Math.PI;
    traveler.style.transform = `translate3d(${point.x.toFixed(2)}px, ${point.y.toFixed(2)}px, 0)`;
    traveler.style.setProperty('--s', stretch.toFixed(3));
    traveler.style.setProperty('--angle', `${angle.toFixed(3)}rad`);
    traveler.style.setProperty('--lean', `${(Math.cos(angle) * 9 * stretch).toFixed(2)}deg`);
    for (const line of [path, glowRef.current]) {
      if (!line) continue;
      line.style.strokeDasharray = `${total} ${total}`;
      line.style.strokeDashoffset = `${total - at}`;
      line.style.opacity = at < 1 ? '0' : '';
    }
    const scale = m.geo?.vertical === false ? .55 : 1;
    cometRefs.current.forEach((comet, index) => {
      if (!comet) return;
      const trail = stretch * [110, 68, 32][index] * scale;
      comet.style.opacity = trail < 2 ? '0' : '1';
      comet.style.strokeDasharray = `${trail} ${total + trail}`;
      comet.style.strokeDashoffset = `${-(direction > 0 ? at - trail : at)}`;
    });
    m.pos = at;
    m.angle = angle;
  }

  function spawnParticle() {
    const m = motion.current;
    const group = particlesRef.current;
    const path = progressRef.current;
    if (!group || !path) return;
    const point = path.getPointAtLength(m.pos);
    const dot = document.createElementNS(svgNamespace, 'circle');
    dot.setAttribute('cx', point.x.toFixed(1));
    dot.setAttribute('cy', point.y.toFixed(1));
    dot.setAttribute('r', (.9 + Math.random() * 1.5).toFixed(2));
    dot.setAttribute('class', 'jp-particle');
    group.appendChild(dot);
    const back = 14 + Math.random() * 24;
    const side = (Math.random() - .5) * 24;
    const cos = Math.cos(m.angle);
    const sin = Math.sin(m.angle);
    const dx = -cos * back - sin * side;
    const dy = -sin * back + cos * side;
    const animation = dot.animate(
      [{ transform: 'translate(0px, 0px)', opacity: .95 }, { transform: `translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px)`, opacity: 0 }],
      { duration: 620 + Math.random() * 380, easing: 'cubic-bezier(.2, .7, .3, 1)', fill: 'forwards' },
    );
    animation.onfinish = () => dot.remove();
  }

  function arrive(index: number, animate: boolean) {
    setArrived(index);
    if (!animate || prefersReducedMotion()) return;
    const burst = [{ transform: 'scale(.55)', opacity: .95 }, { transform: 'scale(2.4)', opacity: 0 }];
    burstRefs.current[index]?.animate(burst, { duration: 780, easing: 'cubic-bezier(.2, .7, .3, 1)' });
    tileRef.current?.animate([{ scale: '1' }, { scale: '1.18' }, { scale: '.94' }, { scale: '1' }], { duration: 600, easing: 'ease-out' });
    if (celebrateRef.current) {
      burstRefs.current.forEach((station, position) => station?.animate(burst, {
        duration: 900, delay: 140 + (index - position) * 75, easing: 'cubic-bezier(.2, .7, .3, 1)',
      }));
    }
  }

  /**
   * Ouverture sur bureau : le L apparaît en grand au centre de la toile, lumineux, puis rétrécit et file vers le départ du
   * chemin pendant que le tracé se dessine ; `then` lance ensuite la descente vers la première station.
   */
  function splash(geometry: Geometry, then: () => void) {
    const m = motion.current;
    const traveler = travelerRef.current;
    const box = boxRef.current;
    const canvas = box?.closest<HTMLElement>('[data-journey-canvas]');
    if (!geometry.vertical || !traveler || !box || !canvas || typeof traveler.animate !== 'function') return false;
    const frame = canvas.getBoundingClientRect();
    const own = box.getBoundingClientRect();
    const center = { x: frame.left + frame.width / 2 - own.left, y: frame.top + frame.height * .44 - own.top };
    const origin = geometry.origin;
    const at = (point: Point, scale: number) => `translate3d(${point.x.toFixed(1)}px, ${point.y.toFixed(1)}px, 0) scale(${scale})`;
    traveler.style.setProperty('--angle', `${Math.atan2(origin.y - center.y, origin.x - center.x).toFixed(3)}rad`);
    const flight = traveler.animate([
      { transform: at(center, 2.9), opacity: 0, offset: 0, easing: 'cubic-bezier(.2, .7, .3, 1)' },
      { transform: at(center, 2.5), opacity: 1, offset: .42, easing: 'cubic-bezier(.55, 0, .25, 1)' },
      { transform: at(origin, 1), opacity: 1, offset: 1 },
    ], { duration: 1650 });
    const gust = traveler.animate([{ '--s': 0, offset: 0 }, { '--s': 0, offset: .45 }, { '--s': .95, offset: .74 }, { '--s': 0, offset: 1 }],
      { duration: 1650 });
    const halo = traveler.querySelector('.jp-halo');
    const rings = halo ? [0, 520].map((delay) => halo.animate(
      [{ transform: 'scale(.7)', opacity: 0 }, { transform: 'scale(1)', opacity: .9, offset: .15 }, { transform: 'scale(2.6)', opacity: 0 }],
      { duration: 1100, delay: 180 + delay, easing: 'cubic-bezier(.2, .7, .3, 1)' },
    )) : [];
    m.splash = [flight, gust, ...rings];
    flight.onfinish = () => {
      m.splash = [];
      then();
    };
    return true;
  }

  function rest(index: number) {
    const m = motion.current;
    cancelAnimationFrame(m.raf);
    m.target = index;
    m.phase = 'rest';
    place(m.lengths[index] ?? 0, 0, 1);
    if (travelerRef.current) travelerRef.current.style.opacity = '';
    arrive(index, false);
  }

  function travel(from: number, to: number, index: number, duration: number, fadeIn = false) {
    const m = motion.current;
    cancelAnimationFrame(m.raf);
    m.target = index;
    m.phase = 'travel';
    setArrived(-1);
    const direction = to >= from ? 1 : -1;
    const start = performance.now();
    let nextParticle = .1;
    let landed = false;
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      const stretch = travelSpeed(progress);
      place(from + (to - from) * travelEase(progress), stretch, direction);
      if (travelerRef.current) travelerRef.current.style.opacity = fadeIn ? String(Math.min(1, progress * 3)) : '';
      if (progress >= nextParticle && progress < .84) {
        spawnParticle();
        nextParticle += .085;
      }
      // Le L est visuellement arrivé bien avant la fin de la courbe : l'éclat part à ce moment-là.
      if (!landed && progress >= .74) {
        landed = true;
        arrive(index, true);
      }
      if (progress < 1) {
        m.raf = requestAnimationFrame(tick);
        return;
      }
      m.phase = 'rest';
      place(to, 0, direction);
      if (!landed) arrive(index, true);
    };
    m.raf = requestAnimationFrame(tick);
  }

  useLayoutEffect(() => {
    const m = motion.current;
    const path = progressRef.current;
    const measure = measureRef.current;
    if (!geo || !path || !measure) return;
    if (m.geo !== geo) {
      m.lengths = geo.points.map((_, index) => {
        measure.setAttribute('d', `${geo.start} ${geo.segments.slice(0, index + 1).join(' ')}`);
        return measure.getTotalLength();
      });
      m.total = path.getTotalLength();
      const resized = m.geo !== null;
      m.geo = geo;
      if (resized && m.started) {
        // Nouvelle géométrie (fenêtre redimensionnée, étape ajoutée) : le voyageur se recale sur sa station.
        const anchor = Math.max(0, Math.min(m.target, geo.points.length - 1));
        cancelAnimationFrame(m.raf);
        if (anchor === targetIndex) rest(anchor);
        else {
          m.target = anchor;
          m.phase = 'interrupted';
          place(m.lengths[anchor], 0, 1);
        }
      }
    }
    const reduced = prefersReducedMotion();
    if (!m.started) {
      m.started = true;
      if (m.phase === 'intro-aborted' && m.target !== targetIndex) {
        // L'utilisateur a avancé pendant l'ouverture : pas de nouvelle ouverture, le L part directement vers sa station.
        if (travelerRef.current) travelerRef.current.style.opacity = '';
        if (reduced) rest(targetIndex);
        else travel(m.pos, m.lengths[targetIndex] ?? 0, targetIndex, 1000);
      } else if (!introRef.current || reduced) {
        rest(targetIndex);
      } else {
        m.target = targetIndex;
        m.phase = 'intro-wait';
        place(0, 0, 1);
        if (!splash(geo, () => travel(0, m.lengths[targetIndex] ?? 0, targetIndex, 1100))) {
          if (travelerRef.current) travelerRef.current.style.opacity = '0';
          m.timer = window.setTimeout(() => travel(0, m.lengths[targetIndex] ?? 0, targetIndex, 1300, true), 700);
        }
      }
    } else if (targetIndex !== m.target || m.phase === 'interrupted') {
      if (reduced) rest(targetIndex);
      else {
        const span = Math.abs(targetIndex - m.target);
        travel(m.pos, m.lengths[targetIndex] ?? 0, targetIndex, Math.min(1500, 820 + span * 110));
      }
    }
    return () => {
      cancelAnimationFrame(m.raf);
      window.clearTimeout(m.timer);
      m.splash.forEach((animation) => animation.cancel());
      m.splash = [];
      // Ouverture interrompue : rejouée si rien n'a changé (double montage du mode strict), abandonnée si l'étape a changé.
      if (m.phase === 'intro-wait') {
        m.started = false;
        m.phase = 'intro-aborted';
      } else if (m.phase === 'travel') m.phase = 'interrupted';
    };
    // Les fonctions de déplacement lisent les références : seuls la géométrie et la cible relancent un trajet.
  }, [geo, targetIndex]);

  const active = steps[targetIndex];
  const announce = celebrate ? 'Accueil terminé : toutes les étapes sont faites.'
    : active ? `Étape ${targetIndex + 1} sur ${steps.length} : ${active.label}` : '';
  const classes = ['jp', vertical ? 'is-vertical' : 'is-horizontal', geo ? 'is-ready' : '', introOn ? 'is-intro' : '',
    celebrate ? 'is-celebrating' : '', className].filter(Boolean).join(' ');

  return (
    <nav className={classes} aria-label={label}>
      <div className="jp-box" ref={boxRef}>
        {geo && size && (
          <svg className="jp-svg" width={size.w} height={size.h} viewBox={`0 0 ${size.w} ${size.h}`} aria-hidden="true" focusable="false">
            <defs>
              <linearGradient id={`${uid}-glow`} gradientUnits="userSpaceOnUse" x1="0" y1="0"
                x2={geo.vertical ? 0 : size.w} y2={geo.vertical ? size.h : 0}>
                <stop offset="0" className="jp-stop-a" />
                <stop offset=".55" className="jp-stop-b" />
                <stop offset="1" className="jp-stop-c" />
              </linearGradient>
              <mask id={`${uid}-reveal`} maskUnits="userSpaceOnUse" x="0" y="0" width={size.w} height={size.h}>
                <path className="jp-reveal" d={geo.d} pathLength={1} />
              </mask>
            </defs>
            <path ref={measureRef} className="jp-measure" d={geo.d} />
            <g mask={`url(#${uid}-reveal)`}>
              <path className="jp-road" d={geo.d} />
              <path className="jp-track" d={geo.d} />
            </g>
            <path className="jp-lead welcome-journey-origin" d={`${geo.start} ${geo.segments[0] ?? ''}`} pathLength={1} />
            <path ref={glowRef} className="jp-glow" d={geo.d} stroke={`url(#${uid}-glow)`} />
            <path ref={progressRef} className={`jp-progress welcome-journey-trail${targetIndex > 0 ? ' is-drawn' : ''}`} d={geo.d}
              stroke={`url(#${uid}-glow)`} />
            {[0, 1, 2].map((index) => (
              <path key={index} ref={(node) => { cometRefs.current[index] = node; }} className={`jp-comet is-${index + 1}`} d={geo.d} />
            ))}
            <g ref={particlesRef} className="jp-particles" />
          </svg>
        )}
        <ol className="jp-stations">
          {steps.map((step, index) => {
            const status = statuses[index];
            const point = geo?.points[index];
            const visual = status === 'current' ? (arrived === index ? 'current' : 'incoming') : status;
            const style = {
              '--x': `${point?.x ?? 0}px`, '--y': `${point?.y ?? 0}px`, '--lx': `${(geo?.labelX ?? 0) - (point?.x ?? 0)}px`, '--i': index,
            } as CSSProperties;
            const mark = status === 'done' ? <Check size={16} strokeWidth={3} />
              : status === 'skipped' ? <Minus size={16} strokeWidth={3} />
              : status === 'blocked' ? <Lock size={14} />
              : step.icon ?? <span className="jp-number">{index + 1}</span>;
            const inner = (
              <>
                <span className="jp-dot" aria-hidden="true">
                  <span className="jp-dot-mark">{mark}</span>
                  <span className="jp-burst" ref={(node) => { burstRefs.current[index] = node; }} />
                </span>
                <span className="jp-label">{step.label}</span>
              </>
            );
            const clickable = Boolean(onSelect && step.reachable && status !== 'current');
            return (
              <li key={step.id} className={`jp-station is-${visual}`} style={style}>
                {clickable ? (
                  <button type="button" className="jp-hit" onClick={() => onSelect?.(step.id)}
                    aria-label={`Revenir à l’étape ${step.label}${statusSuffix[status]}`}>
                    {inner}
                  </button>
                ) : (
                  <span className="jp-hit" aria-current={status === 'current' ? 'step' : undefined}>
                    {inner}
                    {status !== 'current' && <span className="sr-only">{statusSuffix[status]}</span>}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
        <div className="jp-traveler" ref={travelerRef} aria-hidden="true">
          <span className="jp-halo" />
          <span className="jp-streaks"><i /><i /><i /></span>
          <div className="jp-tile" ref={tileRef}><JourneyMark size={vertical ? 46 : 32} /></div>
        </div>
      </div>
      {!vertical && active && (
        <p className="jp-caption" aria-hidden="true">
          <strong>{celebrate ? 'Tout est prêt' : active.label}</strong>
          <span>{celebrate ? `${steps.length} / ${steps.length}` : `${targetIndex + 1} / ${steps.length}`}</span>
        </p>
      )}
      <p className="sr-only" aria-live="polite">{announce}</p>
    </nav>
  );
}
