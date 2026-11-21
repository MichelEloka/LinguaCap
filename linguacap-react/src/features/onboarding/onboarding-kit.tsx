/**
 * Éléments partagés par l'accueil en étapes, « Mon planning », « Mon contrat » et la bibliothèque de l'élève :
 * dates, pastilles de niveau, jauge de difficulté en six bandes, planificateur de la semaine et jauge de faisabilité.
 */
import { useState, type ReactNode } from 'react';
import { CalendarCheck, CalendarDays, Check, Minus, Moon, Plus, Sun, TriangleAlert } from 'lucide-react';
import { Badge } from '../../components/ui';
import {
  difficultyCodes, difficultyLabels, difficultyThresholds, feasibilityLabels, formatMinutes, levelLabel, weekdayLabels,
  weekdayShortLabels, weeklyCapacity, type Day, type DifficultyBand, type DifficultyCode, type FeasibilityCode, type StartLevel,
} from '../../integration/v2';
import { localDate } from '../pilot/learner-calendar';
import './onboarding.css';

// ---------------------------------------------------------------------------------------------------------------------
// Dates et textes
// ---------------------------------------------------------------------------------------------------------------------

const pad = (value: number) => String(value).padStart(2, '0');

/** Date locale au format « AAAA-MM-JJ ». */
export function isoDay(date = new Date()) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function addDaysIso(iso: string, days: number) {
  const date = localDate(iso);
  date.setDate(date.getDate() + days);
  return isoDay(date);
}

/** Ajoute des mois en restant sur le dernier jour du mois quand le jour n'existe pas (31 janvier + 1 mois = 28 février). */
export function addMonthsIso(iso: string, months: number) {
  const date = localDate(iso);
  const day = date.getDate();
  date.setDate(1);
  date.setMonth(date.getMonth() + months);
  const last = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  date.setDate(Math.min(day, last));
  return isoDay(date);
}

export function daysBetween(from: string, to: string) {
  return Math.round((localDate(to).getTime() - localDate(from).getTime()) / 86_400_000);
}

const longFormat = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
const mediumFormat = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
const shortFormat = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' });
const momentFormat = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });

/** « 12 mars 2027 » */
export const longDate = (iso: string | null | undefined) => (iso ? longFormat.format(localDate(iso)) : '—');
/** « 12 mars 2027 » avec le mois abrégé (« 12 sept. 2027 »). */
export const mediumDate = (iso: string | null | undefined) => (iso ? mediumFormat.format(localDate(iso)) : '—');
/** « 12 mars » */
export const shortDate = (iso: string | null | undefined) => (iso ? shortFormat.format(localDate(iso)) : '—');
/** « 12 mars à 18:00 » pour un horodatage complet. */
export const momentText = (iso: string | null | undefined) => (iso ? momentFormat.format(new Date(iso)) : '—');

/** Durée en semaines lisible : « 6 semaines », « 3 mois ». */
export function durationText(from: string, to: string) {
  const days = daysBetween(from, to);
  if (days < 7) return `${days} jour${days > 1 ? 's' : ''}`;
  const months = Math.round(days / 30.44);
  if (days >= 56 && Math.abs(days - months * 30.44) <= 6) return `${months} mois`;
  const weeks = Math.round(days / 7);
  return `${weeks} semaine${weeks > 1 ? 's' : ''}`;
}

export function errorText(error: unknown) {
  return error instanceof Error && error.name !== 'TimeoutError'
    ? error.message : 'Le service est momentanément indisponible. Réessayez dans un instant.';
}

export const firstName = (name: string) => name.trim().split(/\s+/)[0] ?? name;

/** « d’allemand », « de néerlandais » : complément du nom d'une langue, avec élision. */
export function ofLanguage(language: string) {
  const lower = language.toLowerCase();
  return /^[aeiouyéèêh]/.test(lower) ? `d’${lower}` : `de ${lower}`;
}

/** « l’allemand », « le néerlandais ». */
export function theLanguage(language: string) {
  const lower = language.toLowerCase();
  return /^[aeiouyéèêh]/.test(lower) ? `l’${lower}` : `le ${lower}`;
}

/** Statut d'un contrat vu par l'élève (« En attente de l'élève » devient « Votre réponse est attendue »). */
export const learnerContractLabels: Record<string, string> = {
  pending_teacher: 'Chez votre professeur', pending_learner: 'Votre réponse est attendue', accepted: 'En vigueur',
  rejected: 'Refusé', superseded: 'Remplacé', withdrawn: 'Retiré',
};

// ---------------------------------------------------------------------------------------------------------------------
// Niveaux
// ---------------------------------------------------------------------------------------------------------------------

/** Pastille ronde d'un niveau (couleur propre à chaque niveau, état facultatif). */
export function LevelMark({ code, size = 'md', state, label }: {
  code: StartLevel | string; size?: 'sm' | 'md' | 'lg' | 'xl'; state?: 'done' | 'current' | 'locked' | 'planned'; label?: string;
}) {
  return (
    <span className={`lv-mark lvl-${code} is-${size}${state ? ` is-${state}` : ''}`} role={label ? 'img' : undefined}
      aria-label={label} aria-hidden={label ? undefined : true}>
      {code === 'A0' ? <Sun size={size === 'sm' ? 13 : 18} aria-hidden="true" /> : code}
    </span>
  );
}

export const levelName = (code: string | null | undefined) => (code === 'A0' ? 'Débutant' : levelLabel(code));

// ---------------------------------------------------------------------------------------------------------------------
// Difficulté
// ---------------------------------------------------------------------------------------------------------------------

/** Bande de difficulté d'une charge hebdomadaire (barème du plan : 150, 300, 450, 630, 840 min). */
export function difficultyOf(weeklyMinutes: number, weeks = 2): DifficultyCode {
  if (weeks < 1) return 'unrealistic';
  return difficultyCodes.find((code) => {
    const max = difficultyThresholds[code];
    return max === null || weeklyMinutes <= max;
  }) ?? 'unrealistic';
}

export function DifficultyBadge({ code, label }: { code: DifficultyCode; label?: string }) {
  return <span className={`dg-badge dg-${code}`}><span aria-hidden="true" />{label ?? difficultyLabels[code]}</span>;
}

/**
 * Jauge de difficulté en six bandes : la bande courante est mise en avant ; chaque bande indique la charge maximale par
 * semaine et, quand `onPick` est fourni, la date la plus proche qui la respecte (un clic la retient).
 */
export function DifficultyGauge({ bands, current, onPick, busy = false }: {
  bands: DifficultyBand[]; current: DifficultyCode; onPick?: (band: DifficultyBand) => void; busy?: boolean;
}) {
  const ordered = difficultyCodes.map((code) => bands.find((band) => band.code === code) ?? {
    code, label: difficultyLabels[code], maxWeeklyMinutes: difficultyThresholds[code], minWeeks: null, earliestTargetDate: null,
  });
  const index = difficultyCodes.indexOf(current);
  return (
    <div className={`dg${busy ? ' is-busy' : ''}`}>
      <div className="dg-track" role="img" aria-label={`Difficulté : ${difficultyLabels[current]} (${index + 1} sur 6)`}>
        {ordered.map((band, position) => (
          <span key={band.code} className={`dg-seg dg-${band.code}${position === index ? ' is-current' : ''}${position < index ? ' is-before' : ''}`} />
        ))}
        <span className="dg-needle" style={{ ['--i' as string]: index }} aria-hidden="true" />
      </div>
      <ul className="dg-legend">
        {ordered.map((band) => {
          const selected = band.code === current;
          const pickable = Boolean(onPick && band.earliestTargetDate && band.code !== 'unrealistic' && !selected);
          const limit = band.maxWeeklyMinutes === null ? 'Au-delà de 14 h' : `Jusqu’à ${formatMinutes(band.maxWeeklyMinutes)}`;
          const content = (
            <>
              <span className="dg-legend-name"><span className={`dg-dot dg-${band.code}`} aria-hidden="true" />{band.label}</span>
              <small>{limit} / sem.</small>
              {onPick && band.code !== 'unrealistic' && (
                <small className="dg-legend-date">{band.earliestTargetDate ? `Dès le ${shortDate(band.earliestTargetDate)}` : 'Indisponible'}</small>
              )}
            </>
          );
          return (
            <li key={band.code} className={`dg-legend-item dg-${band.code}${selected ? ' is-current' : ''}`}>
              {pickable
                ? <button type="button" onClick={() => onPick?.(band)} disabled={busy}
                    aria-label={`Rythme ${band.label.toLowerCase()} : viser le ${longDate(band.earliestTargetDate)}`}>{content}</button>
                : <div aria-current={selected ? 'true' : undefined}>{content}</div>}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// ---------------------------------------------------------------------------------------------------------------------
// Faisabilité de la semaine
// ---------------------------------------------------------------------------------------------------------------------

export function feasibilityOf(required: number, capacity: number): { code: FeasibilityCode; loadPercent: number } {
  if (capacity <= 0) return { code: 'insufficient', loadPercent: required > 0 ? 999 : 0 };
  const loadPercent = Math.round((required / capacity) * 100);
  return { code: loadPercent <= 85 ? 'comfortable' : loadPercent <= 100 ? 'tight' : 'insufficient', loadPercent };
}

const feasibilityTones: Record<FeasibilityCode, 'green' | 'amber' | 'red'> = { comfortable: 'green', tight: 'amber', insufficient: 'red' };
const feasibilityHints: Record<FeasibilityCode, string> = {
  comfortable: 'Votre semaine laisse de la marge pour rattraper une séance.',
  tight: 'Cela tient, sans marge : une séance manquée devra être rattrapée vite.',
  insufficient: 'Le programme ne tient pas : ajoutez un jour ou allongez vos séances.',
};

export function FeasibilityBadge({ code }: { code: FeasibilityCode }) {
  return <Badge tone={feasibilityTones[code]}>{feasibilityLabels[code]}</Badge>;
}

/** Temps disponible par semaine face au temps nécessaire, et engagement minimal du contrat s'il existe. */
export function FeasibilityMeter({ capacity, required, commitment }: { capacity: number; required: number; commitment?: number | null }) {
  const { code, loadPercent } = feasibilityOf(required, capacity);
  const scale = Math.max(capacity, required, commitment ?? 0, 1) * 1.08;
  const belowCommitment = commitment ? capacity < commitment : false;
  return (
    <div className={`fm is-${code}`}>
      <div className="fm-head">
        <div className="fm-figure"><span>Votre semaine</span><strong>{formatMinutes(capacity)}</strong></div>
        <div className="fm-figure is-need"><span>Nécessaire</span><strong>{formatMinutes(required)}</strong></div>
        <FeasibilityBadge code={code} />
      </div>
      <div className="fm-bar" role="img" aria-label={`Temps disponible ${formatMinutes(capacity)} par semaine, temps nécessaire ${formatMinutes(required)} : ${feasibilityLabels[code].toLowerCase()}`}>
        <span className="fm-capacity" style={{ width: `${(capacity / scale) * 100}%` }} />
        <span className="fm-need" style={{ left: `${(required / scale) * 100}%` }}><i>Programme</i></span>
        {commitment ? <span className="fm-commit" style={{ left: `${(commitment / scale) * 100}%` }}><i>Engagement</i></span> : null}
      </div>
      <p className="fm-hint">
        {belowCommitment
          ? <><TriangleAlert size={15} aria-hidden="true" /> Votre contrat prévoit au moins {formatMinutes(commitment ?? 0)} par semaine.</>
          : <>{code === 'comfortable' ? <CalendarCheck size={15} aria-hidden="true" /> : <TriangleAlert size={15} aria-hidden="true" />}
            {capacity > 0 ? `Le programme occupe ${Math.min(loadPercent, 999)} % de votre temps. ` : ''}{feasibilityHints[code]}</>}
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------------------------------------------------
// Planificateur de la semaine : jours d'étude et jours de repos
// ---------------------------------------------------------------------------------------------------------------------

interface DayRow { weekday: number; on: boolean; sessions: number; minutes: number }

function rowsOf(days: readonly Day[], fallbackMinutes = 30): DayRow[] {
  return weekdayLabels.map((_, index) => {
    const day = days.find((item) => item.weekday === index + 1);
    return { weekday: index + 1, on: Boolean(day), sessions: day?.sessions ?? 1, minutes: day?.minutes ?? fallbackMinutes };
  });
}

const daysOf = (rows: DayRow[]): Day[] => rows.filter((row) => row.on).map(({ weekday, sessions, minutes }) => ({ weekday, sessions, minutes }));

function MiniStepper({ label, value, min, max, step, unit, onChange }: {
  label: string; value: number; min: number; max: number; step: number; unit: string; onChange: (value: number) => void;
}) {
  const clamp = (next: number) => Math.min(max, Math.max(min, next));
  return (
    <div className="dp-stepper" role="group" aria-label={label}>
      <button type="button" onClick={() => onChange(clamp(value - step))} disabled={value <= min} aria-label={`Moins : ${label}`}><Minus size={14} aria-hidden="true" /></button>
      <span><strong>{value}</strong><small>{unit}</small></span>
      <button type="button" onClick={() => onChange(clamp(value + step))} disabled={value >= max} aria-label={`Plus : ${label}`}><Plus size={14} aria-hidden="true" /></button>
    </div>
  );
}

const presets: { id: string; label: string; weekdays: number[] }[] = [
  { id: 'week', label: 'Du lundi au vendredi', weekdays: [1, 2, 3, 4, 5] },
  { id: 'all', label: 'Tous les jours', weekdays: [1, 2, 3, 4, 5, 6, 7] },
  { id: 'alternate', label: 'Un jour sur deux', weekdays: [1, 3, 5, 7] },
  { id: 'weekend', label: 'Soirs et week-end', weekdays: [2, 4, 6, 7] },
];

/**
 * Semaine type de l'élève : chaque jour est un jour d'étude (nombre et durée des séances) ou de repos. La jauge de
 * faisabilité se met à jour à chaque changement. Composant non contrôlé : `initial` fixe le départ, `onChange` reçoit les jours.
 */
export function DayPlanner({ initial, required, commitment, onChange, footer }: {
  initial: readonly Day[]; required: number; commitment?: number | null; onChange: (days: Day[]) => void; footer?: ReactNode;
}) {
  const [rows, setRows] = useState<DayRow[]>(() => rowsOf(initial, initial[0]?.minutes ?? 30));
  const capacity = weeklyCapacity(daysOf(rows));
  const update = (next: DayRow[]) => { setRows(next); onChange(daysOf(next)); };
  const change = (weekday: number, patch: Partial<DayRow>) => update(rows.map((row) => (row.weekday === weekday ? { ...row, ...patch } : row)));
  const usual = rows.find((row) => row.on)?.minutes ?? 30;
  const activePreset = presets.find((preset) => rows.every((row) => row.on === preset.weekdays.includes(row.weekday)))?.id;

  return (
    <div className="dp">
      <div className="dp-presets" role="group" aria-label="Semaines types">
        {presets.map((preset) => (
          <button key={preset.id} type="button" className="kit-chip" aria-pressed={activePreset === preset.id}
            onClick={() => update(rows.map((row) => ({ ...row, on: preset.weekdays.includes(row.weekday), minutes: row.on ? row.minutes : usual })))}>
            <CalendarDays size={14} aria-hidden="true" />{preset.label}
          </button>
        ))}
      </div>
      <ol className="dp-week lc-stagger" aria-label="Ma semaine type">
        {rows.map((row, index) => (
          <li key={row.weekday} className={`dp-day${row.on ? ' is-on' : ' is-off'}`}>
            <button type="button" className="dp-toggle" aria-pressed={row.on} onClick={() => change(row.weekday, { on: !row.on })}
              aria-label={`${weekdayLabels[index]} : ${row.on ? 'jour d’étude' : 'jour de repos'}`}>
              <span className="dp-day-name"><span aria-hidden="true">{weekdayShortLabels[index]}</span><span className="dp-day-long" aria-hidden="true">{weekdayLabels[index]}</span></span>
              <span className="dp-switch" aria-hidden="true"><span /></span>
              <small aria-hidden="true">{row.on ? 'Étude' : 'Repos'}</small>
            </button>
            {row.on ? (
              <div className="dp-controls">
                <MiniStepper label={`Durée d’une séance le ${weekdayLabels[index].toLowerCase()}`} value={row.minutes} min={10} max={240} step={5} unit="min"
                  onChange={(minutes) => change(row.weekday, { minutes })} />
                <MiniStepper label={`Séances le ${weekdayLabels[index].toLowerCase()}`} value={row.sessions} min={1} max={6} step={1}
                  unit={row.sessions > 1 ? 'séances' : 'séance'} onChange={(sessions) => change(row.weekday, { sessions })} />
                <span className="dp-total"><Check size={13} strokeWidth={3} aria-hidden="true" />{formatMinutes(row.minutes * row.sessions)}</span>
              </div>
            ) : (
              <div className="dp-rest" aria-hidden="true"><Moon size={18} /><span>Jour de repos</span></div>
            )}
          </li>
        ))}
      </ol>
      <FeasibilityMeter capacity={capacity} required={required} commitment={commitment} />
      {footer}
    </div>
  );
}

/** Résumé compact d'une semaine type (sept pastilles). */
export function WeekSummary({ days }: { days: readonly Day[] }) {
  return (
    <div className="dp-summary-wrap"><ul className="dp-summary" aria-label="Jours d’étude">
      {weekdayLabels.map((label, index) => {
        const day = days.find((item) => item.weekday === index + 1);
        return (
          <li key={label} className={day ? 'is-on' : undefined}>
            <span className="dp-summary-day" aria-hidden="true">{weekdayShortLabels[index]}</span>
            <strong aria-hidden="true">{day ? formatMinutes(day.minutes * day.sessions) : '—'}</strong>
            <small aria-hidden="true">{day ? (day.sessions > 1 ? `${day.sessions} séances` : '1 séance') : 'Repos'}</small>
            <span className="sr-only">{label} : {day ? `${day.sessions} séance${day.sessions > 1 ? 's' : ''} de ${day.minutes} minutes` : 'repos'}</span>
          </li>
        );
      })}
    </ul></div>
  );
}
