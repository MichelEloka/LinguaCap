import { useState, type FormEvent } from 'react';
import { AlertTriangle, CalendarRange, CheckCircle2 } from 'lucide-react';
import { Badge } from '../../components/ui';

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
const dayFormat = new Intl.DateTimeFormat('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
const weekFormat = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' });

export function hours(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h ? `${h} h${m ? ` ${String(m).padStart(2, '0')}` : ''}` : `${m} min`;
}

function localDate(value: string) {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
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
  const weekly = days.filter((day) => day.enabled).reduce((sum, day) => sum + day.sessions * day.minutes, 0);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSave(days.filter((day) => day.enabled).map(({ weekday, sessions, minutes }) => ({ weekday, sessions, minutes })),
      target && target !== targetDate ? target : undefined);
  }

  return (
    <form className="stack" onSubmit={submit} aria-label="Disponibilités">
      <div className="planning-days">
        {days.map((day, index) => (
          <fieldset key={day.weekday} className="planning-day">
            <legend>
              <label><input type="checkbox" checked={day.enabled} onChange={(event) => update(index, { enabled: event.target.checked })} /> {weekdayNames[index]}</label>
            </legend>
            <label>Séances<input type="number" min={1} max={6} value={day.sessions} disabled={!day.enabled}
              aria-label={`Séances le ${weekdayNames[index].toLowerCase()}`}
              onChange={(event) => update(index, { sessions: Number(event.target.value) })} /></label>
            <label>Minutes<input type="number" min={10} max={240} step={5} value={day.minutes} disabled={!day.enabled}
              aria-label={`Minutes par séance le ${weekdayNames[index].toLowerCase()}`}
              onChange={(event) => update(index, { minutes: Number(event.target.value) })} /></label>
          </fieldset>
        ))}
      </div>
      {targetDate !== undefined && (
        <label className="field">Date cible<input type="date" value={target} onChange={(event) => setTarget(event.target.value)} /></label>
      )}
      <p className="muted">Temps disponible : {hours(weekly)} par semaine.</p>
      <button className="btn btn-outline" type="submit" disabled={busy || weekly === 0}>Recalculer le planning</button>
    </form>
  );
}

/** Proposition : capacité, charge hebdomadaire, séances prévues, débordement et ajustements (DEV-042). */
export function ProposalView({ proposal, busy, onApply, onValidate }: {
  proposal: Proposal;
  busy: boolean;
  onApply?: (suggestion: Suggestion) => void;
  onValidate?: () => void;
}) {
  const [showAll, setShowAll] = useState(false);
  const fits = proposal.overflowCount === 0;
  const visible = showAll ? proposal.sessions : proposal.sessions.slice(0, 6);
  return (
    <div className="stack planning-proposal">
      <div className="planning-summary">
        <span><CalendarRange size={16} aria-hidden="true" /> Du {weekFormat.format(localDate(proposal.startDate))} au {weekFormat.format(localDate(proposal.targetDate))}</span>
        <span>Programme : <strong>{hours(proposal.requiredMinutes)}</strong></span>
        <span>Disponible : <strong>{hours(proposal.capacityMinutes)}</strong></span>
        <Badge tone={proposal.status === 'validated' ? 'green' : fits ? 'blue' : 'amber'}>
          {proposal.status === 'validated' ? 'Planning validé' : fits ? 'Proposition à valider' : 'Programme trop chargé'}
        </Badge>
      </div>
      {!fits && (
        <div className="inline-message warning" role="alert">
          <p><AlertTriangle size={16} aria-hidden="true" /> {proposal.overflowCount} activité{proposal.overflowCount > 1 ? 's' : ''} ne tien{proposal.overflowCount > 1 ? 'nent' : 't'} pas avant la date cible :</p>
          <ul>{proposal.overflow.map((item) => <li key={item.id}>{item.title} · {item.minutes} min</li>)}</ul>
        </div>
      )}
      {!fits && proposal.suggestions.length > 0 && onApply && (
        <div className="stack">
          <h4>Ajustements possibles</h4>
          <div className="accounts-actions">
            {proposal.suggestions.map((suggestion) => (
              <button key={suggestion.kind} type="button" className="btn btn-outline" disabled={busy} onClick={() => onApply(suggestion)}>
                {suggestion.label}
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="teacher-table-wrap">
        <table className="teacher-table">
          <caption className="muted">Charge hebdomadaire</caption>
          <thead><tr><th scope="col">Semaine du</th><th scope="col">Planifié</th><th scope="col">Disponible</th></tr></thead>
          <tbody>
            {proposal.weeks.map((week) => (
              <tr key={week.start}><th scope="row">{weekFormat.format(localDate(week.start))}</th><td>{hours(week.plannedMinutes)}</td><td>{hours(week.availableMinutes)}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
      <h4>Séances proposées</h4>
      <ol className="planning-sessions">
        {visible.map((session) => (
          <li key={`${session.date}-${session.slot}`}>
            <strong>{dayFormat.format(localDate(session.date))}{session.slot > 1 ? ` · séance ${session.slot}` : ''}</strong>
            <span>{session.title} · {session.items.map((item) => item.title).join(', ')} · {session.minutes} min</span>
          </li>
        ))}
      </ol>
      {proposal.sessions.length > visible.length && (
        <button type="button" className="text-link" onClick={() => setShowAll(true)}>Afficher les {proposal.sessions.length} séances</button>
      )}
      {proposal.status === 'proposed' && onValidate && (
        <button type="button" className="btn btn-primary" disabled={busy || !proposal.validatable} onClick={onValidate}>
          <CheckCircle2 size={17} aria-hidden="true" /> Valider ce planning
        </button>
      )}
    </div>
  );
}
