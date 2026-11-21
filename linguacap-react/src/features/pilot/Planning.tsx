import { useMemo, useState, type FormEvent } from 'react';
import {
  ArrowRight, BookOpen, CalendarClock, CalendarPlus, CalendarRange, CircleCheck, ClipboardCheck, Clock, Layers, ListChecks, Minus, PencilLine,
  Plus, RotateCcw, Timer,
} from 'lucide-react';
import { ProgressBar } from '../../components/ui';
import { Bars, Callout, Chip, Drawer, Facts, ListItem, Segmented } from '../../design/kit';
import { addDays, dayKey, formatDayLong, formatMonthDay, localDate, relativeMoment, startOfWeek, WeekGrid, WeekPager, type CalendarDay } from './learner-calendar';
import './learner-planning.css';

export interface Day { weekday: number; sessions: number; minutes: number }
interface PlanItem { id: string; kind: string; title: string; minutes: number }
interface PlannedSession { date: string; slot: number; dueAt: string; title: string; minutes: number; items: PlanItem[] }
interface Week { start: string; availableMinutes: number; plannedMinutes: number }
export interface Suggestion { kind: 'minutes' | 'sessions' | 'days' | 'target_date'; label: string; availability: Day[]; targetDate: string }
export interface Proposal {
  number: number;
  status: 'proposed' | 'validated';
  startDate: string;
  targetDate: string;
  availability: Day[];
  capacityMinutes: number;
  requiredMinutes: number;
  overflowCount: number;
  sessions: PlannedSession[];
  overflow: PlanItem[];
  weeks: Week[];
  suggestions: Suggestion[];
  validatable: boolean;
}

export const weekdayNames = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
const weekdayShort = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

export function hours(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h ? `${h} h${m ? ` ${String(m).padStart(2, '0')}` : ''}` : `${m} min`;
}

const itemKinds: Record<string, { label: string; icon: typeof BookOpen }> = {
  lesson: { label: 'Leçon', icon: BookOpen },
  exercise: { label: 'Exercice', icon: PencilLine },
  review: { label: 'Révision', icon: RotateCcw },
  assessment: { label: 'Évaluation', icon: ClipboardCheck },
};

function Stepper({ label, value, min, max, step, suffix, disabled, onChange }: {
  label: string; value: number; min: number; max: number; step: number; suffix?: string; disabled?: boolean; onChange: (value: number) => void;
}) {
  const clamp = (next: number) => Math.min(max, Math.max(min, next));
  return (
    <div className="lp-stepper" role="group" aria-label={label}>
      <button type="button" className="lp-step" onClick={() => onChange(clamp(value - step))} disabled={disabled || value <= min} aria-label={`Diminuer : ${label}`}>
        <Minus size={16} aria-hidden="true" />
      </button>
      <span className="lp-step-value">
        <input type="number" inputMode="numeric" min={min} max={max} step={step} value={value} disabled={disabled} aria-label={label}
          onChange={(event) => onChange(Number(event.target.value))} onBlur={() => onChange(clamp(value || min))} />
        {suffix && <span aria-hidden="true">{suffix}</span>}
      </span>
      <button type="button" className="lp-step" onClick={() => onChange(clamp(value + step))} disabled={disabled || value >= max} aria-label={`Augmenter : ${label}`}>
        <Plus size={16} aria-hidden="true" />
      </button>
    </div>
  );
}

/** Disponibilités : pour chaque jour travaillé, le nombre de séances et la durée de chacune (DEV-039). */
export function AvailabilityEditor({ value, targetDate, busy, onSave }: {
  value: Day[];
  targetDate?: string | null;
  busy: boolean;
  onSave: (days: Day[], targetDate?: string) => void;
}) {
  const [days, setDays] = useState(() => weekdayNames.map((_, index) => {
    const existing = value.find((day) => day.weekday === index + 1);
    return { weekday: index + 1, enabled: Boolean(existing), sessions: existing?.sessions ?? 1, minutes: existing?.minutes ?? 30 };
  }));
  const [target, setTarget] = useState(targetDate ?? '');
  const update = (index: number, change: Partial<(typeof days)[number]>) =>
    setDays((current) => current.map((day, position) => position === index ? { ...day, ...change } : day));
  const setAll = (change: Partial<(typeof days)[number]>) => setDays((current) => current.map((day) => day.enabled ? { ...day, ...change } : day));
  const enabled = days.filter((day) => day.enabled);
  const weekly = enabled.reduce((sum, day) => sum + day.sessions * day.minutes, 0);
  const common = (key: 'sessions' | 'minutes') => enabled.length && enabled.every((day) => day[key] === enabled[0][key]) ? String(enabled[0][key]) : '';
  const tooLong = enabled.filter((day) => day.sessions * day.minutes > 720);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSave(days.filter((day) => day.enabled).map(({ weekday, sessions, minutes }) => ({ weekday, sessions, minutes })),
      target && target !== targetDate ? target : undefined);
  }

  return (
    <form className="lp-editor" onSubmit={submit} aria-label="Disponibilités">
      <fieldset className="lp-field">
        <legend>Jours d’étude</legend>
        <div className="lp-day-chips">
          {days.map((day, index) => (
            <Chip key={day.weekday} selected={day.enabled} onClick={() => update(index, { enabled: !day.enabled })}>
              <span aria-hidden="true">{weekdayShort[index]}</span><span className="sr-only">{weekdayNames[index]}</span>
            </Chip>
          ))}
        </div>
      </fieldset>

      {enabled.length > 0 && (
        <fieldset className="lp-field">
          <legend>Pour tous les jours choisis</legend>
          <div className="lp-quick">
            <div><span className="lp-quick-label">Séances par jour</span>
              <Segmented label="Séances par jour, pour tous les jours choisis" value={common('sessions')} onChange={(next) => setAll({ sessions: Number(next) })}
                options={['1', '2', '3'].map((option) => ({ value: option, label: option }))} /></div>
            <div><span className="lp-quick-label">Durée d’une séance</span>
              <Segmented label="Durée d’une séance, pour tous les jours choisis" value={common('minutes')} onChange={(next) => setAll({ minutes: Number(next) })}
                options={['20', '30', '45', '60'].map((option) => ({ value: option, label: `${option} min` }))} /></div>
          </div>
        </fieldset>
      )}

      <fieldset className="lp-field">
        <legend>Jour par jour</legend>
        {enabled.length === 0 ? <p className="lp-hint">Choisissez au moins un jour d’étude.</p> : (
          <ul className="lp-day-rows">
            {days.map((day, index) => day.enabled && (
              <li key={day.weekday} className="lp-day-row">
                <strong>{weekdayNames[index]}</strong>
                <Stepper label={`Séances le ${weekdayNames[index].toLowerCase()}`} value={day.sessions} min={1} max={6} step={1}
                  suffix={day.sessions > 1 ? 'séances' : 'séance'} onChange={(next) => update(index, { sessions: next })} />
                <Stepper label={`Minutes par séance le ${weekdayNames[index].toLowerCase()}`} value={day.minutes} min={10} max={240} step={5}
                  suffix="min" onChange={(next) => update(index, { minutes: next })} />
                <span className="lp-day-total">{hours(day.sessions * day.minutes)}</span>
              </li>
            ))}
          </ul>
        )}
      </fieldset>

      {targetDate !== undefined && (
        <label className="field">Date cible<input type="date" value={target} onChange={(event) => setTarget(event.target.value)} /></label>
      )}

      <div className="lp-editor-summary">
        <div className="lp-editor-total"><span>Temps disponible</span><strong>{hours(weekly)}</strong><small>par semaine</small></div>
        <Bars height={118} label="Temps disponible par jour" data={days.map((day, index) => ({
          label: weekdayShort[index], value: day.enabled ? day.sessions * day.minutes : 0,
          display: day.enabled ? hours(day.sessions * day.minutes) : '—', muted: !day.enabled,
        }))} />
      </div>
      {tooLong.length > 0 && (
        <Callout tone="warning" title="Journée trop chargée">12 heures d’étude par jour au plus : réduisez le nombre ou la durée des séances.</Callout>
      )}
      <div className="lp-editor-foot">
        <button className="btn btn-primary btn-block" type="submit" disabled={busy || weekly === 0}>{busy ? 'Calcul en cours…' : 'Recalculer le planning'}</button>
      </div>
    </form>
  );
}

interface WeekView { start: Date; planned: number; available: number; days: CalendarDay[] }

const loadWindow = 8;
const suggestionIcons: Record<Suggestion['kind'], typeof Clock> = { minutes: Timer, sessions: Layers, days: CalendarPlus, target_date: CalendarClock };
const suggestionKinds: Record<Suggestion['kind'], string> = {
  minutes: 'Séances plus longues', sessions: 'Plus de séances', days: 'Plus de jours', target_date: 'Nouvelle date cible',
};

/** Proposition : capacité, charge hebdomadaire, calendrier des séances, débordement et ajustements (DEV-042). */
export function ProposalView({ proposal, busy, onApply, onValidate }: {
  proposal: Proposal;
  busy: boolean;
  onApply?: (suggestion: Suggestion) => void;
  onValidate?: () => void;
}) {
  const fits = proposal.overflowCount === 0;
  const [opened, setOpened] = useState<PlannedSession | null>(null);
  const weeks = useMemo<WeekView[]>(() => {
    const starts = proposal.weeks.length
      ? proposal.weeks.map((week) => ({ start: localDate(week.start), planned: week.plannedMinutes, available: week.availableMinutes }))
      : [...new Set(proposal.sessions.map((session) => dayKey(startOfWeek(localDate(session.date)))))].sort()
        .map((key) => ({ start: localDate(key), planned: 0, available: 0 }));
    const open = new Set(proposal.availability.map((day) => day.weekday));
    return starts.map((week) => {
      const days = Array.from({ length: 7 }, (_, index) => {
        const date = addDays(week.start, index);
        const key = dayKey(date);
        return {
          date,
          off: !open.has(((date.getDay() + 6) % 7) + 1),
          events: proposal.sessions.filter((session) => session.date.slice(0, 10) === key).sort((left, right) => left.slot - right.slot)
            .map((session) => ({
              key: `${session.date}-${session.slot}`, title: session.title,
              meta: `${session.minutes} min${session.slot > 1 ? ` · n° ${session.slot}` : ''}`,
              tone: proposal.status === 'validated' ? 'current' as const : 'plan' as const,
              label: `${session.items.length} activité${session.items.length > 1 ? 's' : ''}`,
              onClick: () => setOpened(session),
            })),
        };
      });
      const planned = week.planned || days.reduce((sum, day) => sum + proposal.sessions.filter((session) => session.date.slice(0, 10) === dayKey(day.date))
        .reduce((total, session) => total + session.minutes, 0), 0);
      return { ...week, planned, days };
    });
  }, [proposal]);
  const [page, setPage] = useState(() => {
    const now = new Date();
    const index = weeks.findIndex((week) => now >= week.start && now < addDays(week.start, 7));
    return Math.max(0, index);
  });
  const current = weeks[Math.min(page, weeks.length - 1)];
  const usage = proposal.capacityMinutes ? Math.round((proposal.requiredMinutes / proposal.capacityMinutes) * 100) : 0;
  // Un parcours sur plusieurs niveaux compte des dizaines de semaines : la charge montre huit semaines autour de celle affichée.
  const firstBar = Math.max(0, Math.min(page - 3, weeks.length - loadWindow));
  const loadWeeks = weeks.slice(firstBar, firstBar + loadWindow);
  const weekEmpty = current && current.days.every((day) => !day.events.length);

  return (
    <div className="lp-proposal">
      <div className="lp-proposal-top">
        <div className="lp-kpis">
          <div className="lp-kpi"><CalendarRange size={17} aria-hidden="true" /><span>Période</span>
            <strong>{formatMonthDay(localDate(proposal.startDate))} → {formatMonthDay(localDate(proposal.targetDate))}</strong></div>
          <div className="lp-kpi"><BookOpen size={17} aria-hidden="true" /><span>Programme</span><strong>{hours(proposal.requiredMinutes)}</strong></div>
          <div className="lp-kpi"><Clock size={17} aria-hidden="true" /><span>Disponible</span><strong>{hours(proposal.capacityMinutes)}</strong></div>
          <div className="lp-kpi"><ListChecks size={17} aria-hidden="true" /><span>Séances</span><strong>{proposal.sessions.length}</strong></div>
          <div className={`lp-usage${usage > 100 ? ' is-over' : ''}`}>
            <span>Le programme occupe <strong>{usage} %</strong> du temps disponible</span>
            <ProgressBar value={usage} label="Part du temps disponible occupée par le programme" />
          </div>
        </div>
        {weeks.length > 0 && (
          <div className="lp-load">
            <h3>Charge hebdomadaire</h3>
            <Bars height={150} label="Charge hebdomadaire (temps planifié par semaine)" data={loadWeeks.map((week, index) => ({
              label: formatMonthDay(week.start), value: week.planned, display: hours(week.planned), muted: firstBar + index !== page,
            }))} />
          </div>
        )}
      </div>

      {!fits && (
        <div role="alert">
          <Callout tone="warning" title={`${proposal.overflowCount} activité${proposal.overflowCount > 1 ? 's' : ''} ne tien${proposal.overflowCount > 1 ? 'nent' : 't'} pas avant la date cible`}>
            <ul className="lp-overflow">
              {proposal.overflow.map((item) => <li key={item.id}><span>{item.title}</span><b>{item.minutes} min</b></li>)}
            </ul>
          </Callout>
        </div>
      )}
      {!fits && proposal.suggestions.length > 0 && onApply && (
        <div className="lp-suggestions">
          <h3>Ajustements possibles</h3>
          <div className="lp-suggestion-grid">
            {proposal.suggestions.map((suggestion) => {
              const Icon = suggestionIcons[suggestion.kind] ?? CalendarClock;
              return (
                <button key={suggestion.kind} type="button" className="lp-suggestion" disabled={busy} onClick={() => onApply(suggestion)}>
                  <span className={`lp-suggestion-icon is-${suggestion.kind}`} aria-hidden="true"><Icon size={19} /></span>
                  <span className="lp-suggestion-text"><small>{suggestionKinds[suggestion.kind] ?? 'Ajustement'}</small><strong>{suggestion.label}</strong></span>
                  <ArrowRight className="lp-suggestion-arrow" size={18} aria-hidden="true" />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {current && (
        <div className="lp-calendar">
          <div className="lp-calendar-bar">
            <WeekPager label={`Semaine du ${formatMonthDay(current.start)}`} position={`${page + 1} sur ${weeks.length}`}
              onPrevious={page > 0 ? () => setPage(page - 1) : undefined} onNext={page < weeks.length - 1 ? () => setPage(page + 1) : undefined} />
            {current.available > 0 && (
              <div className="lp-week-load">
                <span><strong>{hours(current.planned)}</strong> planifiées sur {hours(current.available)}</span>
                <ProgressBar value={(current.planned / current.available) * 100} label="Temps planifié sur le temps disponible de la semaine" />
              </div>
            )}
          </div>
          <WeekGrid days={current.days} variant="agenda" label={`Séances ${proposal.status === 'validated' ? 'prévues' : 'proposées'}, semaine du ${formatMonthDay(current.start)}`} />
          {weekEmpty && <p className="lp-hint">Aucune séance cette semaine.</p>}
        </div>
      )}

      {proposal.status === 'proposed' && onValidate && (
        <div className="lp-validate">
          <button type="button" className="btn btn-primary btn-lg" disabled={busy || !proposal.validatable} onClick={onValidate}>
            <CircleCheck size={18} aria-hidden="true" /> Valider ce planning
          </button>
        </div>
      )}

      {opened && (
        <Drawer title={formatDayLong(localDate(opened.date))} description={`${opened.title} · ${hours(opened.minutes)}`} onClose={() => setOpened(null)}>
          <Facts items={[
            { label: 'Échéance', value: relativeMoment(opened.dueAt) },
            { label: 'Durée', value: hours(opened.minutes) },
            { label: 'Activités', value: opened.items.length },
          ]} />
          <ul className="kit-list lp-items">
            {opened.items.map((item) => {
              const kind = itemKinds[item.kind];
              const Icon = kind?.icon ?? BookOpen;
              return (
                <ListItem as="li" key={item.id} title={item.title} subtitle={kind?.label ?? item.kind}
                  leading={<span className={`lp-item-icon is-${item.kind}`} aria-hidden="true"><Icon size={17} /></span>}
                  trailing={<span className="lp-item-minutes">{item.minutes} min</span>} />
              );
            })}
          </ul>
        </Drawer>
      )}
    </div>
  );
}
