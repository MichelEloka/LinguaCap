/**
 * Composants d'application LinguaCap. À utiliser dans toutes les pages pour garder une interface homogène :
 * Card, Tabs, Segmented, Drawer (panneau latéral), useToast, Avatar, ProgressRing, Callout, Skeleton, Toolbar,
 * SearchField, Chip, SplitView, ListItem, Steps, Timeline, Bars, Sparkline, Facts et AudioPlayer.
 */
import { createContext, useCallback, useContext, useEffect, useId, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import type { KeyboardEvent, ReactNode } from 'react';
import { AlertTriangle, CheckCircle2, Info, Lightbulb, Pause, Play, RotateCcw, Search, X } from 'lucide-react';

type Tone = 'info' | 'tip' | 'warning' | 'success';

export function Card({ title, description, icon, action, children, flush = false, interactive = false, className = '', as: Tag = 'section', ...rest }: {
  title?: ReactNode; description?: ReactNode; icon?: ReactNode; action?: ReactNode; children?: ReactNode; flush?: boolean;
  interactive?: boolean; className?: string; as?: 'section' | 'article' | 'div' | 'aside'; 'aria-label'?: string;
}) {
  const titleId = useId();
  return (
    <Tag className={`kit-card${flush ? ' is-flush' : ''}${interactive ? ' is-interactive' : ''} ${className}`.trim()}
      aria-labelledby={title && !rest['aria-label'] ? titleId : undefined} {...rest}>
      {(title || action || icon) && (
        <header className="kit-card-head">
          {icon && <span className="kit-card-icon" aria-hidden="true">{icon}</span>}
          {(title || description) && <div>{title && <h2 id={titleId}>{title}</h2>}{description && <p>{description}</p>}</div>}
          {action && <div className="kit-card-action">{action}</div>}
        </header>
      )}
      {children}
    </Tag>
  );
}

export interface TabItem { id: string; label: string; icon?: ReactNode; count?: number }

/** Onglets accessibles (flèches gauche et droite) ; le parent affiche le contenu de l'onglet choisi dans <TabPanel>. */
export function Tabs({ tabs, value, onChange, label, idPrefix = 'tab' }: {
  tabs: TabItem[]; value: string; onChange: (id: string) => void; label: string; idPrefix?: string;
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  function keyboard(event: KeyboardEvent, index: number) {
    const delta = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
    if (!delta) return;
    event.preventDefault();
    const next = (index + delta + tabs.length) % tabs.length;
    onChange(tabs[next].id);
    refs.current[next]?.focus();
  }
  return (
    <div className="kit-tabs" role="tablist" aria-label={label}>
      {tabs.map((tab, index) => (
        <button key={tab.id} ref={(node) => { refs.current[index] = node; }} type="button" role="tab" className="kit-tab"
          id={`${idPrefix}-${tab.id}`} aria-controls={`${idPrefix}-panel-${tab.id}`} aria-selected={tab.id === value}
          tabIndex={tab.id === value ? 0 : -1} onClick={() => onChange(tab.id)} onKeyDown={(event) => keyboard(event, index)}>
          {tab.icon}{tab.label}{tab.count !== undefined && <span className="kit-count">{tab.count}</span>}
        </button>
      ))}
    </div>
  );
}

export function TabPanel({ id, idPrefix = 'tab', children }: { id: string; idPrefix?: string; children: ReactNode }) {
  return <div className="kit-tabpanel" role="tabpanel" id={`${idPrefix}-panel-${id}`} aria-labelledby={`${idPrefix}-${id}`} key={id}>{children}</div>;
}

export function Segmented<T extends string>({ options, value, onChange, label }: {
  options: { value: T; label: string }[]; value: T; onChange: (value: T) => void; label: string;
}) {
  return (
    <div className="kit-segmented" role="radiogroup" aria-label={label}>
      {options.map((option) => (
        <button key={option.value} type="button" role="radio" aria-checked={option.value === value} onClick={() => onChange(option.value)}>
          {option.label}
        </button>
      ))}
    </div>
  );
}

/** Panneau latéral modal (bas de l'écran sur mobile) pour les fiches, formulaires et aperçus. */
export function Drawer({ title, description, onClose, children, footer, wide = false }: {
  title: string; description?: ReactNode; onClose: () => void; children: ReactNode; footer?: ReactNode; wide?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    const dialog = ref.current;
    if (dialog && !dialog.open) dialog.showModal();
    return () => dialog?.close();
  }, []);
  return (
    <dialog ref={ref} className={`kit-drawer${wide ? ' is-wide' : ''}`} aria-labelledby={titleId}
      onCancel={(event) => { event.preventDefault(); onClose(); }}
      onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div className="kit-drawer-inner">
        <header className="kit-drawer-head">
          <div><h2 id={titleId}>{title}</h2>{description && <p>{description}</p>}</div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Fermer"><X size={20} aria-hidden="true" /></button>
        </header>
        <div className="kit-drawer-body">{children}</div>
        {footer && <footer className="kit-drawer-foot">{footer}</footer>}
      </div>
    </dialog>
  );
}

interface ToastItem { id: number; text: string; tone: 'success' | 'warning' }
const ToastContext = createContext<(text: string, tone?: 'success' | 'warning') => void>(() => {});

/** Notifications éphémères annoncées aux lecteurs d'écran ; à placer une fois à la racine de l'application. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const counter = useRef(0);
  const dismiss = useCallback((id: number) => setItems((list) => list.filter((item) => item.id !== id)), []);
  const push = useCallback((text: string, tone: 'success' | 'warning' = 'success') => {
    const id = ++counter.current;
    setItems((list) => [...list.slice(-2), { id, text, tone }]);
    window.setTimeout(() => dismiss(id), 5200);
  }, [dismiss]);
  return (
    <ToastContext.Provider value={push}>
      {children}
      <div className="kit-toasts" role="status" aria-live="polite">
        {items.map((item) => (
          <div key={item.id} className={`kit-toast${item.tone === 'warning' ? ' is-warning' : ''}`}>
            {item.tone === 'warning' ? <AlertTriangle size={18} aria-hidden="true" /> : <CheckCircle2 size={18} aria-hidden="true" />}
            <p>{item.text}</p>
            <button type="button" onClick={() => dismiss(item.id)} aria-label="Masquer la notification"><X size={16} aria-hidden="true" /></button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}

const avatarColors = ['#1f6bff', '#7c4dff', '#e11d63', '#0b9b6a', '#ff8a00', '#0891b2', '#4f46e5', '#c2410c'];

export function initialsOf(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part.charAt(0)).join('').toUpperCase() || '·';
}

export function Avatar({ name, size = 36 }: { name: string; size?: number }) {
  const color = avatarColors[[...name].reduce((sum, char) => sum + char.charCodeAt(0), 0) % avatarColors.length];
  return <span className="kit-avatar" aria-hidden="true" style={{ width: size, height: size, fontSize: size * .38, background: color }}>{initialsOf(name)}</span>;
}

export function ProgressRing({ value, size = 64, stroke = 7, color = 'var(--brand)', label, children }: {
  value: number; size?: number; stroke?: number; color?: string; label?: string; children?: ReactNode;
}) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, value));
  const [shown, setShown] = useState(0);
  useEffect(() => { const frame = requestAnimationFrame(() => setShown(clamped)); return () => cancelAnimationFrame(frame); }, [clamped]);
  return (
    <span className="kit-ring" role="img" aria-label={label ?? `${Math.round(clamped)} %`} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <circle className="kit-ring-track" cx={size / 2} cy={size / 2} r={radius} strokeWidth={stroke} />
        <circle className="kit-ring-value" cx={size / 2} cy={size / 2} r={radius} strokeWidth={stroke} stroke={color}
          strokeDasharray={circumference} strokeDashoffset={circumference * (1 - shown / 100)} />
      </svg>
      <span className="kit-ring-label" aria-hidden="true">{children ?? <strong>{Math.round(clamped)}%</strong>}</span>
    </span>
  );
}

const calloutIcons = { info: Info, tip: Lightbulb, warning: AlertTriangle, success: CheckCircle2 };

export function Callout({ tone = 'info', title, children }: { tone?: Tone; title?: ReactNode; children?: ReactNode }) {
  const Icon = calloutIcons[tone];
  return (
    <div className={`kit-callout is-${tone}`}>
      <Icon size={18} aria-hidden="true" />
      <div>{title && <strong>{title}</strong>}{children}</div>
    </div>
  );
}

export function Skeleton({ width = '100%', height = 14, radius }: { width?: number | string; height?: number | string; radius?: number }) {
  return <span className="kit-skeleton" aria-hidden="true" style={{ width, height, borderRadius: radius }} />;
}

/** Carte d'attente pendant un chargement (annoncée une seule fois). */
export function SkeletonCard({ lines = 3, label = 'Chargement…' }: { lines?: number; label?: string }) {
  return (
    <div className="kit-skeleton-card" role="status" aria-label={label}>
      <Skeleton width="45%" height={18} />
      {Array.from({ length: lines }, (_, index) => <Skeleton key={index} width={`${92 - index * 14}%`} />)}
    </div>
  );
}

export function Toolbar({ children, label }: { children: ReactNode; label?: string }) {
  return <div className="kit-toolbar" role={label ? 'group' : undefined} aria-label={label}>{children}</div>;
}

export function SearchField({ value, onChange, placeholder = 'Rechercher', label }: {
  value: string; onChange: (value: string) => void; placeholder?: string; label: string;
}) {
  return (
    <label className="kit-search">
      <span className="sr-only">{label}</span>
      <Search size={17} aria-hidden="true" />
      <input type="search" value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

export function Chip({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: ReactNode }) {
  return <button type="button" className="kit-chip" aria-pressed={selected} onClick={onClick}>{children}</button>;
}

/** Liste et détail côte à côte ; sur petit écran, le détail remplace la liste lorsqu'il est ouvert. */
export function SplitView({ list, detail, hasDetail }: { list: ReactNode; detail: ReactNode; hasDetail: boolean }) {
  return <div className={`kit-split${hasDetail ? ' has-detail' : ''}`}>{list}{detail}</div>;
}

export function ListItem({ title, subtitle, leading, trailing, onClick, href, current, as }: {
  title: ReactNode; subtitle?: ReactNode; leading?: ReactNode; trailing?: ReactNode; onClick?: () => void; href?: string;
  current?: boolean; as?: 'li';
}) {
  const content = <>{leading}<span className="kit-list-main"><strong>{title}</strong>{subtitle && <small>{subtitle}</small>}</span>{trailing && <span className="kit-list-end">{trailing}</span>}</>;
  const item = onClick
    ? <button type="button" className="kit-list-item" aria-pressed={current} onClick={onClick}>{content}</button>
    : href?.startsWith('/') ? <Link className="kit-list-item" to={href} aria-current={current ? 'true' : undefined}>{content}</Link>
    : href ? <a className="kit-list-item" href={href} aria-current={current ? 'true' : undefined}>{content}</a>
    : <div className="kit-list-item">{content}</div>;
  return as === 'li' ? <li>{item}</li> : item;
}

export function Steps({ total, current, done, label }: { total: number; current: number; done: number; label: string }) {
  return (
    <ol className="kit-steps" aria-label={label}>
      {Array.from({ length: total }, (_, index) => (
        <li key={index} className={index < done ? 'is-done' : index === current ? 'is-current' : ''} aria-current={index === current ? 'step' : undefined} />
      ))}
    </ol>
  );
}

export interface TimelineEntry { id: string; title: ReactNode; meta?: ReactNode; icon?: ReactNode; tone?: 'success' | 'brand' | 'warning' | 'danger' }

export function Timeline({ items }: { items: TimelineEntry[] }) {
  return (
    <ol className="kit-timeline">
      {items.map((item) => (
        <li key={item.id} className={item.tone ? `is-${item.tone}` : undefined}>
          <span className="kit-timeline-dot" aria-hidden="true">{item.icon}</span>
          <div><strong>{item.title}</strong>{item.meta && <small>{item.meta}</small>}</div>
        </li>
      ))}
    </ol>
  );
}

/** Histogramme léger ; chaque barre porte sa valeur pour les lecteurs d'écran. */
export function Bars({ data, height = 140, max, label }: {
  data: { label: string; value: number; muted?: boolean; display?: string }[]; height?: number; max?: number; label: string;
}) {
  const top = max ?? Math.max(1, ...data.map((item) => item.value));
  return (
    <div className="kit-bars" role="img" aria-label={`${label} : ${data.map((item) => `${item.label} ${item.display ?? item.value}`).join(', ')}`}
      style={{ ['--h' as string]: `${height}px` }}>
      {data.map((item) => (
        <div key={item.label} className={`kit-bar${item.muted ? ' is-muted' : ''}`} aria-hidden="true">
          <b>{item.display ?? item.value}</b>
          <span style={{ ['--v' as string]: `${Math.max(4, (item.value / top) * (height - 44))}px` }} />
          <small>{item.label}</small>
        </div>
      ))}
    </div>
  );
}

export function Sparkline({ values, width = 120, height = 36, label }: { values: number[]; width?: number; height?: number; label: string }) {
  const id = useId().replace(/:/g, '');
  const points = useMemo(() => {
    if (values.length < 2) return [] as [number, number][];
    const top = Math.max(...values);
    const bottom = Math.min(...values);
    const span = top - bottom || 1;
    return values.map((value, index) => [index * (width / (values.length - 1)), height - 4 - ((value - bottom) / span) * (height - 8)] as [number, number]);
  }, [values, width, height]);
  if (!points.length) return null;
  const line = points.map(([x, y], index) => `${index ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  return (
    <svg className="kit-sparkline" width={width} height={height} role="img" aria-label={label}>
      <defs><linearGradient id={`kit-spark-${id}`} x1="0" x2="0" y1="0" y2="1"><stop offset="0" style={{ stopColor: 'var(--brand)', stopOpacity: .22 }} /><stop offset="1" style={{ stopColor: 'var(--brand)', stopOpacity: 0 }} /></linearGradient></defs>
      <path d={`${line} L${width},${height} L0,${height} Z`} style={{ fill: `url(#kit-spark-${id})`, stroke: 'none' }} />
      <path d={line} />
    </svg>
  );
}

export function Facts({ items }: { items: { label: string; value: ReactNode }[] }) {
  return <dl className="kit-facts">{items.map((item) => <div key={item.label}><dt>{item.label}</dt><dd>{item.value}</dd></div>)}</dl>;
}

const speeds = [1, .75, 1.25];
const clock = (seconds: number) => Number.isFinite(seconds) ? `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}` : '0:00';

/**
 * Lecteur audio pour l'apprentissage : lecture, reprise de 5 secondes, vitesse (1, 0,75, 1,25) et position.
 * L'élément <audio> reste dans la page (préchargement des métadonnées, erreurs de lecture remontées).
 */
export function AudioPlayer({ src, title, compact = false, onError }: { src: string; title?: string; compact?: boolean; onError?: () => void }) {
  const audio = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeed] = useState(0);
  const progress = duration ? (time / duration) * 100 : 0;
  function toggle() {
    const element = audio.current;
    if (!element) return;
    if (element.paused) void element.play(); else element.pause();
  }
  return (
    <div className={`kit-audio${playing ? ' is-playing' : ''}${compact ? ' is-compact' : ''}`}>
      <audio ref={audio} src={src} preload="metadata" aria-label={title ?? 'Enregistrement audio'}
        onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={() => setPlaying(false)}
        onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)} onTimeUpdate={(event) => setTime(event.currentTarget.currentTime)}
        onError={onError} />
      <button type="button" className="kit-audio-play" onClick={toggle} aria-label={playing ? 'Mettre en pause' : `Écouter${title ? ` : ${title}` : ''}`}>
        {playing ? <Pause size={20} fill="currentColor" aria-hidden="true" /> : <Play size={20} fill="currentColor" aria-hidden="true" />}
      </button>
      <div className="kit-audio-main">
        {title && !compact && <span className="kit-audio-title">{title}</span>}
        <div className="kit-audio-track">
          <input type="range" min={0} max={duration || 0} step={.1} value={time} aria-label="Position dans l’enregistrement"
            style={{ ['--p' as string]: `${progress}%` }}
            onChange={(event) => { if (audio.current) audio.current.currentTime = Number(event.target.value); }} />
          <span className="kit-audio-time">{clock(time)} / {clock(duration)}</span>
        </div>
      </div>
      <div className="kit-audio-tools">
        <button type="button" onClick={() => { if (audio.current) audio.current.currentTime = Math.max(0, audio.current.currentTime - 5); }}
          aria-label="Revenir 5 secondes en arrière" title="Revenir 5 s en arrière"><RotateCcw size={16} aria-hidden="true" /></button>
        <button type="button" onClick={() => { const next = (speed + 1) % speeds.length; setSpeed(next); if (audio.current) audio.current.playbackRate = speeds[next]; }}
          aria-label={`Vitesse de lecture : ${speeds[speed]}`} title="Vitesse de lecture">{String(speeds[speed]).replace('.', ',')}×</button>
      </div>
    </div>
  );
}
