/**
 * Éléments partagés par les écrans de l'espace élève : ligne de séance (tuile du jour), avatar du professeur, scores,
 * « L » du logo, chemin du parcours (le L glisse jusqu'à la position de l'élève) et illustrations des états vides.
 */
import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { AlertTriangle, Check, ChevronRight, Target, Flag, GraduationCap, Lock, Play, BookOpen, ClipboardCheck, PencilLine, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '../../components/ui';
import { requestApi } from '../../integration/api';
import type { Library, PathStepStatus, PathView } from '../../integration/v2';
import { LevelMark } from '../onboarding/onboarding-kit';
import type { EventTone } from './learner-calendar';
import { daysFromToday, formatClock } from './learner-calendar';
import { sessionStatus, type Grade, type SessionStatus, type SessionSummary } from './LearnerSession';

export const statusTone: Record<SessionStatus, EventTone> = { completed: 'done', in_progress: 'current', planned: 'todo', late: 'late' };

export const activityIcons: Record<string, ReactNode> = {
  lesson: <BookOpen size={15} aria-hidden="true" />,
  exercise: <PencilLine size={15} aria-hidden="true" />,
  review: <RotateCcw size={15} aria-hidden="true" />,
  assessment: <ClipboardCheck size={15} aria-hidden="true" />,
  mission: <Target size={15} aria-hidden="true" />,
};

export function doneActivities(session: SessionSummary) {
  return session.activities.filter((activity) => activity.status === 'completed').length;
}

export function plural(count: number, one: string, many = `${one}s`) {
  return `${count} ${count > 1 ? many : one}`;
}

const weekdayShort = new Intl.DateTimeFormat('fr-FR', { weekday: 'short' });

/** Tuile du jour d'une séance (« lun. 23 ») ; la pastille d'angle porte l'état (terminée, en cours, en retard, verrouillée). */
export function DayTile({ date, tone, mark }: { date: Date; tone: SessionStatus | 'locked'; mark?: ReactNode }) {
  const today = daysFromToday(date) === 0;
  return (
    <span className={`ld-day-tile is-${tone}${today ? ' is-today' : ''}`} aria-hidden="true">
      <small>{weekdayShort.format(date).replace('.', '')}</small>
      <strong>{date.getDate()}</strong>
      {mark && <i>{mark}</i>}
    </span>
  );
}

const tileMarks: Partial<Record<SessionStatus, ReactNode>> = {
  completed: <Check size={11} strokeWidth={3.2} />,
  in_progress: <Play size={9} fill="currentColor" />,
  late: <AlertTriangle size={10} strokeWidth={2.6} />,
};

/** Ligne de séance cliquable (même rendu que ListItem, navigation interne). */
export function SessionRow({ session }: { session: SessionSummary }) {
  const done = doneActivities(session);
  const status = sessionStatus[session.status];
  const total = session.activities.length;
  return (
    <Link className="kit-list-item ld-session-row" to={`/espace/seance/${session.id}`}>
      <DayTile date={new Date(session.dueAt)} tone={session.status} mark={tileMarks[session.status]} />
      <span className="kit-list-main">
        <strong>{session.title}</strong>
        <small>Séance {session.position} · {formatClock(session.dueAt)} · {session.estimatedMinutes} min<span className="ld-row-extra"> · {done}/{plural(total, 'activité')}</span></small>
        {total > 0 && done > 0 && done < total && (
          <span className="ld-row-meter" aria-hidden="true"><span style={{ width: `${(done / total) * 100}%` }} /></span>
        )}
      </span>
      <span className="kit-list-end"><Badge tone={status.tone}>{status.label}</Badge><ChevronRight size={18} aria-hidden="true" /></span>
    </Link>
  );
}

/** Avatar du professeur référent (son nom n'est pas transmis à l'élève). */
export function TeacherAvatar({ size = 36 }: { size?: number }) {
  return (
    <span className="ld-teacher-avatar" aria-hidden="true" style={{ width: size, height: size }}>
      <GraduationCap size={Math.round(size * .5)} />
    </span>
  );
}

export interface LearnerMessage { id: string; text: string; sentAt: string }

/**
 * Nom lisible d'un résultat : l'activité et la séance quand elles sont connues ; sinon (bibliothèque) le titre de
 * l'activité retrouvé par sa leçon (`titles`, voir useLessonTitles).
 */
export function gradeTitle(grade: Grade, sessions: SessionSummary[], titles?: Map<string, string>) {
  const session = grade.sessionId ? sessions.find((item) => item.id === grade.sessionId) : undefined;
  const activity = session && grade.activityId ? session.activities.find((item) => item.id === grade.activityId) : undefined;
  const kind = grade.kind === 'quiz' ? 'Exercice' : 'Évaluation';
  const known = titles?.get(grade.lessonId);
  if (!activity && known) return { title: known, context: session ? session.title : 'Bibliothèque' };
  // Questions d'une séquence de film (leçon « cine-<séquence> », hors séance) : facultatif, hors parcours.
  if (!session && grade.lessonId.startsWith('cine-')) return { title: 'Séquence du Ciné-club', context: 'Ciné-club' };
  return { title: activity?.title ?? session?.title ?? kind, context: session ? (activity ? session.title : kind) : undefined };
}

/** Titres des activités de la bibliothèque par leçon (élève connecté, ou élève suivi avec `learnerId`). */
export function useLessonTitles(token: string | null | undefined, learnerId?: string) {
  const [titles, setTitles] = useState<Map<string, string>>(() => new Map());
  useEffect(() => {
    if (!token) return;
    let active = true;
    const request = learnerId
      ? requestApi<Library>(`/learning/library?learnerId=${encodeURIComponent(learnerId)}`, token)
      : requestApi<Library>('/learning/library', token);
    request.then((library) => {
      if (!active) return;
      const map = new Map<string, string>();
      for (const level of library.levels ?? []) for (const module of level.modules ?? []) {
        for (const activity of module.activities ?? []) if (activity.lessonId) map.set(activity.lessonId, activity.title);
      }
      setTitles(map);
    }, () => { /* bibliothèque indisponible : les titres génériques restent */ });
    return () => { active = false; };
  }, [token, learnerId]);
  return titles;
}

export const scoreOf = (grade: Grade) => (grade.total ? Math.round((grade.correct / grade.total) * 100) : 0);

/** V4 : questions « à revoir » d'une note (répétitions échouées trois fois) ; [] pour l'historique ou un service antérieur. */
export const flaggedOf = (grade: object): string[] => {
  const value = (grade as { flagged?: unknown }).flagged;
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
};
/** V4 : répétitions enregistrées en attente de la validation du professeur. */
export const pendingOf = (grade: object): number => {
  const value = (grade as { pending?: unknown }).pending;
  return typeof value === 'number' && value > 0 ? value : 0;
};
export const passed = (score: number) => score >= 70;
export const scoreColor = (score: number) => (passed(score) ? 'var(--success)' : 'var(--warning)');

export function byDate<T>(items: T[], date: (item: T) => string) {
  return [...items].sort((left, right) => new Date(date(left)).getTime() - new Date(date(right)).getTime());
}

// ---------------------------------------------------------------------------------------------------------------------
// Le « L » du logo et le chemin du parcours
// ---------------------------------------------------------------------------------------------------------------------

/** Le logo LinguaCap : « L » blanc sur tuile bleu nuit, lignes de vent bleues (le pied s'étire pendant un trajet). */
export function LogoL({ className = '' }: { className?: string }) {
  return (
    <svg className={`lc-logo-l ${className}`.trim()} viewBox="0 0 64 64" aria-hidden="true" focusable="false">
      <rect className="lc-logo-tile" width="64" height="64" rx="16" />
      <path className="lc-logo-wind" d="M25 35q10-7 23-2M25 42q10-6 23-1" />
      <path className="lc-logo-stem" d="M19 12v34" />
      <path className="lc-logo-foot" d="M19 46q11-5 22 0" />
    </svg>
  );
}

export type StationState = 'done' | 'current' | 'locked' | 'todo';

export const stationState = (status: PathStepStatus): StationState => (status === 'completed' ? 'done' : status === 'active' ? 'current' : 'locked');

/**
 * Avancement d'un parcours pour le chemin : chaque niveau est un tronçon entre deux stations ; la position avance dans le
 * tronçon du niveau en cours au fil de ses séances terminées.
 */
export function pathProgress(path: PathView) {
  const steps = path.steps.filter((step) => step.status !== 'withdrawn');
  const active = steps.findIndex((step) => step.status === 'active');
  const finished = steps.filter((step) => step.status === 'completed').length;
  const share = (index: number) => (steps[index].sessionsTotal ? steps[index].sessionsCompleted / steps[index].sessionsTotal : 0);
  const position = path.status === 'completed' ? steps.length : active >= 0 ? active + Math.min(.97, share(active)) : finished;
  const total = steps.reduce((sum, step) => sum + step.sessionsTotal, 0);
  const done = steps.reduce((sum, step) => sum + step.sessionsCompleted, 0);
  return { steps, position, done, total, percent: total ? Math.round((done / total) * 100) : 0 };
}

export interface JourneyStation {
  key: string;
  /** Niveau affiché dans la pastille (sinon un simple point). */
  code?: string | null;
  title: ReactNode;
  caption?: ReactNode;
  extra?: ReactNode;
  state: StationState;
  /** Dernière station : le niveau visé (drapeau). */
  goal?: boolean;
}

type Point = [number, number];
type Segment = [Point, Point, Point, Point];
interface RailGeometry { width: number; height: number; points: Point[]; segments: Segment[] }

const railSizes = {
  sm: { band: 60, tile: 34, pad: 16, gap: 0, axis: 0 },
  lg: { band: 92, tile: 44, pad: 30, gap: 104, axis: 34 },
} as const;

const lerp = (a: Point, b: Point, t: number): Point => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
const fmt = (point: Point) => `${point[0].toFixed(1)},${point[1].toFixed(1)}`;

/** Découpe une courbe de Bézier au paramètre t (de Casteljau) : première partie. */
function splitSegment([a, b, c, d]: Segment, t: number): Segment {
  const ab = lerp(a, b, t); const bc = lerp(b, c, t); const cd = lerp(c, d, t);
  const abc = lerp(ab, bc, t); const bcd = lerp(bc, cd, t);
  return [a, ab, abc, lerp(abc, bcd, t)];
}

function railGeometry(width: number, count: number, size: keyof typeof railSizes, column: boolean): RailGeometry {
  const spec = railSizes[size];
  const n = Math.max(2, count);
  const points: Point[] = [];
  const height = column ? spec.pad * 2 + (n - 1) * spec.gap : spec.band;
  for (let index = 0; index < n; index++) {
    points.push(column ? [spec.axis, spec.pad + index * spec.gap] : [spec.pad + index * ((width - spec.pad * 2) / (n - 1)), spec.band / 2]);
  }
  const segments = points.slice(0, -1).map((from, index): Segment => {
    const to = points[index + 1];
    const span = column ? to[1] - from[1] : to[0] - from[0];
    const swing = (index % 2 ? 1 : -1) * (column ? Math.min(44, span * .4) : Math.min(spec.band * .8, span * .12));
    if (column) {
      return [from, [from[0] + swing, from[1] + span * .38], [to[0] - swing, to[1] - span * .38], to];
    }
    return [from, [from[0] + span * .38, from[1] + swing], [to[0] - span * .38, to[1] - swing], to];
  });
  return { width, height, points, segments };
}

function locate(geometry: RailGeometry, position: number) {
  const last = geometry.segments.length - 1;
  const index = Math.max(0, Math.min(last, Math.floor(position)));
  return { index, t: Math.max(0, Math.min(1, position - index)) };
}

function pointAt(geometry: RailGeometry, position: number): Point {
  const { index, t } = locate(geometry, position);
  return splitSegment(geometry.segments[index], t)[3];
}

function pathTo(geometry: RailGeometry, position: number, from = 0) {
  let d = `M${fmt(geometry.points[from])}`;
  if (position <= from) return d;
  const { index, t } = locate(geometry, position);
  for (let k = from; k < index; k++) { const [, b, c, e] = geometry.segments[k]; d += ` C${fmt(b)} ${fmt(c)} ${fmt(e)}`; }
  const [, b, c, e] = splitSegment(geometry.segments[index], t);
  return `${d} C${fmt(b)} ${fmt(c)} ${fmt(e)}`;
}

const easeInOut = (k: number) => (k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);

/**
 * Chemin du parcours : stations (départ, niveaux, objectif) reliées par un tracé en vent, partie parcourue en dégradé
 * lumineux, et le « L » du logo qui glisse jusqu'à la position de l'élève (pied étiré, traînées de vent, éclat à
 * l'arrivée). `position` va de 0 (première station) à `stations.length - 1` (objectif atteint). Vertical sur un
 * conteneur étroit en grande taille. Décor masqué aux lecteurs d'écran : les stations restent une liste lisible.
 */
export function JourneyRail({ stations, position, label, size = 'sm', marker }: {
  stations: JourneyStation[]; position: number; label: string; size?: 'sm' | 'lg'; marker?: ReactNode;
}) {
  const box = useRef<HTMLDivElement>(null);
  const traveler = useRef<HTMLSpanElement>(null);
  const done = useRef<SVGPathElement>(null);
  const glow = useRef<SVGPathElement>(null);
  const shown = useRef<number | null>(null);
  const [width, setWidth] = useState(0);
  const gradientId = `lj-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const count = Math.max(2, stations.length);
  const target = Math.max(0, Math.min(count - 1, Number.isFinite(position) ? position : 0));
  const column = size === 'lg' && width > 0 && width < 560;

  useLayoutEffect(() => {
    const element = box.current;
    if (!element) return undefined;
    setWidth(Math.round(element.clientWidth));
    const observer = new ResizeObserver(([entry]) => setWidth(Math.round(entry.contentRect.width)));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const geometry = useMemo(() => (width ? railGeometry(width, count, size, column) : null), [width, count, size, column]);
  const track = useMemo(() => {
    if (!geometry) return { open: '', later: '' };
    // Les segments qui mènent à un niveau encore verrouillé sont pointillés.
    const firstLocked = stations.findIndex((station, index) => index > 0 && station.state === 'locked');
    const openUntil = firstLocked > 0 ? firstLocked - 1 : count - 1;
    return { open: pathTo(geometry, openUntil), later: openUntil < count - 1 ? pathTo(geometry, count - 1, openUntil) : '' };
  }, [geometry, stations, count]);

  useEffect(() => {
    if (!geometry) return undefined;
    const tile = railSizes[size].tile;
    const flashes: number[] = [];
    const place = (value: number, stretch = 0) => {
      const [x, y] = pointAt(geometry, value);
      const element = traveler.current;
      if (element) {
        element.style.transform = `translate3d(${(x - tile / 2).toFixed(1)}px, ${(y - tile / 2).toFixed(1)}px, 0)`;
        element.style.setProperty('--stretch', stretch.toFixed(3));
      }
      const d = pathTo(geometry, value);
      done.current?.setAttribute('d', d);
      glow.current?.setAttribute('d', d);
      box.current?.classList.add('is-ready');
      shown.current = value;
    };
    const flash = (index: number) => {
      const station = box.current?.querySelectorAll<HTMLElement>('.lj-station')[index];
      if (!station) return;
      station.classList.remove('is-flash');
      void station.offsetWidth;
      station.classList.add('is-flash');
      flashes.push(window.setTimeout(() => station.classList.remove('is-flash'), 900));
    };
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const first = shown.current === null;
    const from = shown.current ?? 0;
    if (reduce || (!first && Math.abs(from - target) < .001)) { place(target); return undefined; }
    place(from);
    const element = traveler.current;
    const duration = Math.min(1800, 800 + Math.abs(target - from) * 520);
    let frame = 0;
    let start = 0;
    const crossed = new Set<number>();
    const timer = window.setTimeout(() => {
      element?.classList.toggle('is-back', target < from);
      element?.classList.add('is-moving');
      const tick = (now: number) => {
        start ||= now;
        const k = Math.min(1, (now - start) / duration);
        const value = from + (target - from) * easeInOut(k);
        // Éclat de chaque station franchie en chemin (la station de départ exceptée).
        const low = Math.min(from, value); const high = Math.max(from, value);
        for (let index = Math.ceil(low + 1e-6); index <= Math.floor(high + 1e-6); index++) {
          if (!crossed.has(index)) { crossed.add(index); flash(index); }
        }
        place(value, Math.sin(Math.PI * k));
        if (k < 1) { frame = requestAnimationFrame(tick); return; }
        element?.classList.remove('is-moving');
        element?.classList.add('is-arrived');
        flashes.push(window.setTimeout(() => element?.classList.remove('is-arrived'), 1000));
      };
      frame = requestAnimationFrame(tick);
    }, first ? 420 : 60);
    return () => { window.clearTimeout(timer); cancelAnimationFrame(frame); flashes.forEach((id) => window.clearTimeout(id)); element?.classList.remove('is-moving'); };
  }, [geometry, target, size]);

  return (
    <div ref={box} className={`lj is-${size}${column ? ' is-column' : ' is-row'}`} role="group" aria-label={label}
      style={geometry && column ? { height: geometry.height } : undefined}>
      {geometry && (
        <svg className="lj-svg" width={geometry.width} height={geometry.height} viewBox={`0 0 ${geometry.width} ${geometry.height}`} aria-hidden="true" focusable="false">
          <defs>
            <linearGradient id={gradientId} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2={column ? 0 : geometry.width} y2={column ? geometry.height : 0}>
              <stop offset="0" style={{ stopColor: 'var(--success)' }} />
              <stop offset=".5" style={{ stopColor: 'var(--brand)' }} />
              <stop offset="1" style={{ stopColor: 'var(--violet)' }} />
            </linearGradient>
          </defs>
          <path className="lj-track" d={track.open} />
          {track.later && <path className="lj-track is-later" d={track.later} />}
          <path ref={glow} className="lj-glow" style={{ stroke: `url(#${gradientId})` }} />
          <path ref={done} className="lj-done" style={{ stroke: `url(#${gradientId})` }} />
        </svg>
      )}
      <ol className="lj-stations">
        {stations.map((station, index) => {
          const point = geometry?.points[index];
          const edge = index === 0 ? ' is-first' : index === stations.length - 1 ? ' is-last' : '';
          return (
            <li key={station.key} className={`lj-station is-${station.state}${station.goal ? ' is-goal' : ''}${edge}`}
              style={point ? { left: point[0], top: point[1] } : { visibility: 'hidden' }}>
              <span className="lj-dot">
                {station.code
                  ? <LevelMark code={station.code} size={size === 'lg' ? 'md' : 'sm'}
                      state={station.state === 'done' ? 'done' : station.state === 'current' ? 'current' : station.state === 'locked' ? 'locked' : 'planned'} />
                  : <span className="lj-dot-plain" />}
                {station.goal && <span className="lj-flag"><Flag size={size === 'lg' ? 11 : 9} strokeWidth={2.6} /></span>}
                {station.state === 'locked' && size === 'lg' && <span className="lj-lock"><Lock size={10} strokeWidth={2.6} /></span>}
              </span>
              <span className="lj-label">
                <strong>{station.title}</strong>
                {station.caption && <small>{station.caption}</small>}
                {station.extra}
              </span>
            </li>
          );
        })}
      </ol>
      <span ref={traveler} className="lj-traveler" aria-hidden="true">
        <span className="lj-wind"><i /><i /><i /></span>
        <span className="lj-tile"><LogoL /></span>
        {marker && !column && <span className="lj-chip">{marker}</span>}
      </span>
    </div>
  );
}

/** Décor animé des cartes bleu nuit : aurore lente, grain de points et lignes de vent du logo. */
export function NightDecor() {
  return (
    <span className="ld-night-decor" aria-hidden="true">
      <span className="ld-aurora"><i /><i /><i /></span>
      <svg className="ld-wind-lines" viewBox="0 0 320 160" focusable="false">
        <path d="M8 92 C 70 54, 150 58, 214 76 S 296 84, 314 70" />
        <path d="M40 116 C 96 88, 170 92, 232 104 S 300 110, 316 98" />
        <path d="M90 136 C 140 120, 204 124, 252 130" />
      </svg>
    </span>
  );
}

// ---------------------------------------------------------------------------------------------------------------------
// États vides illustrés
// ---------------------------------------------------------------------------------------------------------------------

export type EmptyArtKind = 'chart' | 'calendar' | 'messages' | 'search' | 'books' | 'contract';

/** Petite illustration d'état vide (décor), dans les couleurs de la marque. */
export function EmptyArt({ kind }: { kind: EmptyArtKind }) {
  return (
    <svg className={`ld-art is-${kind}`} viewBox="0 0 140 96" aria-hidden="true" focusable="false">
      <ellipse className="ld-art-shadow" cx="70" cy="88" rx="46" ry="5" />
      {kind === 'chart' && <>
        <rect className="ld-art-card" x="18" y="10" width="104" height="70" rx="14" />
        <rect className="ld-art-soft" x="34" y="50" width="14" height="18" rx="4" />
        <rect className="ld-art-mid" x="56" y="40" width="14" height="28" rx="4" />
        <rect className="ld-art-strong" x="78" y="28" width="14" height="40" rx="4" />
        <path className="ld-art-wind" d="M30 42 Q58 34 100 20" />
        <circle className="ld-art-accent" cx="102" cy="19" r="5" />
      </>}
      {kind === 'calendar' && <>
        <rect className="ld-art-card" x="28" y="14" width="84" height="66" rx="14" />
        <path className="ld-art-head" d="M28 28a14 14 0 0 1 14-14h56a14 14 0 0 1 14 14v6H28z" />
        <rect className="ld-art-pin" x="46" y="8" width="6" height="14" rx="3" />
        <rect className="ld-art-pin" x="88" y="8" width="6" height="14" rx="3" />
        {[0, 1, 2, 3].map((col) => [0, 1].map((row) => <rect key={`${col}-${row}`} className="ld-art-cell" x={40 + col * 16} y={44 + row * 14} width="10" height="8" rx="2.5" />))}
        <circle className="ld-art-ok" cx="104" cy="70" r="13" />
        <path className="ld-art-check" d="M98 70l4.5 4.5L111 66" />
      </>}
      {kind === 'messages' && <>
        <rect className="ld-art-card" x="36" y="12" width="88" height="34" rx="12" />
        <rect className="ld-art-line" x="48" y="23" width="58" height="5" rx="2.5" />
        <rect className="ld-art-line is-short" x="48" y="32" width="36" height="5" rx="2.5" />
        <rect className="ld-art-bubble" x="16" y="52" width="70" height="26" rx="12" />
        <rect className="ld-art-line is-light" x="27" y="62" width="42" height="5" rx="2.5" />
        <circle className="ld-art-accent" cx="122" cy="62" r="5" />
      </>}
      {kind === 'search' && <>
        <rect className="ld-art-card" x="14" y="16" width="80" height="62" rx="14" />
        <rect className="ld-art-line" x="28" y="32" width="48" height="5" rx="2.5" />
        <rect className="ld-art-line is-short" x="28" y="44" width="34" height="5" rx="2.5" />
        <rect className="ld-art-line is-short" x="28" y="56" width="40" height="5" rx="2.5" />
        <circle className="ld-art-lens" cx="98" cy="48" r="17" />
        <path className="ld-art-handle" d="M110 61l12 12" />
      </>}
      {kind === 'books' && <>
        <rect className="ld-art-spine is-a" x="30" y="22" width="18" height="58" rx="4" />
        <rect className="ld-art-spine is-b" x="50" y="14" width="18" height="66" rx="4" />
        <rect className="ld-art-spine is-c" x="70" y="26" width="18" height="54" rx="4" transform="rotate(8 79 53)" />
        <rect className="ld-art-shelf" x="20" y="78" width="100" height="5" rx="2.5" />
        <circle className="ld-art-accent" cx="108" cy="24" r="5" />
      </>}
      {kind === 'contract' && <>
        <rect className="ld-art-card" x="34" y="8" width="66" height="76" rx="12" />
        <rect className="ld-art-line" x="46" y="22" width="42" height="5" rx="2.5" />
        <rect className="ld-art-line is-short" x="46" y="32" width="30" height="5" rx="2.5" />
        <rect className="ld-art-line is-short" x="46" y="42" width="36" height="5" rx="2.5" />
        <circle className="ld-art-ok" cx="96" cy="68" r="15" />
        <path className="ld-art-check" d="M89 68l5 5 9-9" />
      </>}
    </svg>
  );
}

/** État vide illustré (titre, explication, action). */
export function EmptyScene({ art, title, description, action, compact = false }: {
  art: EmptyArtKind; title: string; description?: ReactNode; action?: ReactNode; compact?: boolean;
}) {
  return (
    <div className={`ld-empty${compact ? ' is-compact' : ''}`}>
      <EmptyArt kind={art} />
      <strong>{title}</strong>
      {description && <p>{description}</p>}
      {action}
    </div>
  );
}

/** Ligne verrouillée (niveau futur) avec sa tuile du jour. */
export function LockedTile({ date }: { date: Date }) {
  return <DayTile date={date} tone="locked" mark={<Lock size={10} strokeWidth={2.6} />} />;
}
