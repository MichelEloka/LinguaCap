/**
 * Proposition de planning d'un parcours multi-niveaux (PathProposal) : chiffres clés, frise des niveaux avec leurs dates,
 * charge par semaine, débordement et ajustements, calendrier par semaine (chaque niveau a sa couleur), puis validation.
 * Réutilisée par l'espace professeur (fiche élève, onglet « Parcours ») : aucun libellé propre à l'élève par défaut.
 */
import { useMemo, useState, type ReactNode } from 'react';
import {
  ArrowRight, BookOpen, CalendarClock, CalendarPlus, CalendarRange, ChevronLeft, ChevronRight, CircleCheck, ClipboardCheck, Clock, Target,
  Flag, Layers, ListChecks, LoaderCircle, PencilLine, Plus, RotateCcw, Timer, TriangleAlert,
} from 'lucide-react';
import { Bars, Callout, Drawer, Facts, ListItem } from '../../design/kit';
import {
  blockingReasonMessages, formatMinutes, type LevelCode, type PathProposal, type PlannedSession, type Suggestion,
} from '../../integration/v2';
import { addDays, dayKey, formatDayLong, formatMonthDay, localDate, relativeMoment, startOfWeek } from '../pilot/learner-calendar';
import { DifficultyBadge, FeasibilityBadge, LevelMark, levelName, longDate, shortDate } from './onboarding-kit';

const itemKinds: Record<string, { label: string; icon: typeof BookOpen }> = {
  lesson: { label: 'Leçon', icon: BookOpen },
  exercise: { label: 'Exercice', icon: PencilLine },
  review: { label: 'Révision', icon: RotateCcw },
  assessment: { label: 'Évaluation', icon: ClipboardCheck },
  mission: { label: 'Mission', icon: Target },
};
const suggestionIcons: Record<Suggestion['kind'], typeof Clock> = { minutes: Timer, sessions: Layers, days: CalendarPlus, target_date: CalendarClock };
const suggestionKinds: Record<Suggestion['kind'], string> = {
  minutes: 'Séances plus longues', sessions: 'Plus de séances', days: 'Plus de jours', target_date: 'Nouvelle date cible',
};
const weekdayShort = new Intl.DateTimeFormat('fr-FR', { weekday: 'short' });
const monthShort = new Intl.DateTimeFormat('fr-FR', { month: 'short' });
const monthYear = new Intl.DateTimeFormat('fr-FR', { month: 'short', year: '2-digit' });

interface WeekView { start: Date; planned: number; available: number }

/** Frise des niveaux : chaque niveau occupe la part de la période qui lui revient, avec ses dates et sa charge. */
export function LevelSpans({ proposal, onJump }: { proposal: PathProposal; onJump?: (date: string) => void }) {
  const from = localDate(proposal.startDate).getTime();
  const to = Math.max(localDate(proposal.targetDate).getTime(), from + 86_400_000);
  const spans = proposal.levels.length ? proposal.levels : [];
  if (!spans.length) return null;
  return (
    <div className="pp-levels">
      <div className="pp-levels-track" aria-hidden="true">
        {spans.map((span) => {
          const start = span.firstDate ? localDate(span.firstDate).getTime() : from;
          const end = span.lastDate ? localDate(span.lastDate).getTime() + 86_400_000 : start;
          return <span key={span.levelCode} className={`lvl-${span.levelCode}`}
            style={{ left: `${((start - from) / (to - from)) * 100}%`, width: `${Math.max(3, ((end - start) / (to - from)) * 100)}%` }} />;
        })}
        <i className="pp-levels-flag"><Flag size={13} /></i>
      </div>
      <div className="pp-levels-dates" aria-hidden="true"><span>{shortDate(proposal.startDate)}</span><span>{longDate(proposal.targetDate)}</span></div>
      <ol className="pp-levels-list">
        {spans.map((span) => {
          const content = (
            <>
              <LevelMark code={span.levelCode} size="md" />
              <span className="pp-level-text">
                <strong>{levelName(span.levelCode)}</strong>
                <small>{span.firstDate ? `${shortDate(span.firstDate)} → ${shortDate(span.lastDate)}` : 'Hors période'} · {span.sessionCount} séance{span.sessionCount > 1 ? 's' : ''}</small>
              </span>
              <b>{formatMinutes(span.minutes)}</b>
            </>
          );
          return (
            <li key={span.levelCode} className={`lvl-${span.levelCode}`}>
              {onJump && span.firstDate
                ? <button type="button" className="pp-level" onClick={() => onJump(span.firstDate ?? proposal.startDate)} aria-label={`Voir les séances ${span.levelCode}, à partir du ${longDate(span.firstDate)}`}>{content}</button>
                : <div className="pp-level">{content}</div>}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export function PathProposalView({ proposal, busy = false, onApply, onValidate, onEditDays, canValidate = true,
  validateLabel = 'Valider ce planning', editDaysLabel = 'Modifier les jours', actionsNote }: {
  proposal: PathProposal;
  busy?: boolean;
  onApply?: (suggestion: Suggestion) => void;
  onValidate?: () => void;
  onEditDays?: () => void;
  /** Droit calculé côté serveur (PathView.permissions.canValidate) ; `proposal.validatable` est aussi exigé. */
  canValidate?: boolean;
  validateLabel?: string;
  editDaysLabel?: string;
  /** Remarque affichée au-dessus des boutons (conséquence de la validation, par exemple). */
  actionsNote?: ReactNode;
}) {
  const [opened, setOpened] = useState<PlannedSession | null>(null);
  const weeks = useMemo<WeekView[]>(() => {
    if (proposal.weeks.length) {
      return proposal.weeks.map((week) => ({ start: startOfWeek(localDate(week.start)), planned: week.plannedMinutes, available: week.availableMinutes }));
    }
    const keys = [...new Set(proposal.sessions.map((session) => dayKey(startOfWeek(localDate(session.date)))))].sort();
    return keys.map((key) => ({ start: localDate(key), available: 0,
      planned: proposal.sessions.filter((session) => dayKey(startOfWeek(localDate(session.date))) === key).reduce((sum, session) => sum + session.minutes, 0) }));
  }, [proposal]);
  const [page, setPage] = useState(() => {
    const now = new Date();
    return Math.max(0, weeks.findIndex((week) => now >= week.start && now < addDays(week.start, 7)));
  });
  const current = weeks[Math.min(page, Math.max(0, weeks.length - 1))];
  const open = new Set(proposal.availability.map((day) => day.weekday));
  const fits = proposal.overflowCount === 0;
  const validatable = proposal.status === 'proposed' && proposal.validatable && canValidate && !proposal.blockingReason;
  const jump = (date: string) => {
    const index = weeks.findIndex((week) => localDate(date) >= week.start && localDate(date) < addDays(week.start, 7));
    if (index >= 0) setPage(index);
  };
  // Au-delà de 14 semaines, la charge est résumée mois par mois (moyenne hebdomadaire) pour rester lisible.
  const chart = useMemo(() => {
    if (weeks.length <= 14) {
      return weeks.map((week, index) => ({ label: formatMonthDay(week.start), value: week.planned, display: formatMinutes(week.planned), muted: index !== page }));
    }
    const months = new Map<string, { date: Date; total: number; count: number; pages: number[] }>();
    weeks.forEach((week, index) => {
      const key = `${week.start.getFullYear()}-${week.start.getMonth()}`;
      const entry = months.get(key) ?? { date: week.start, total: 0, count: 0, pages: [] };
      entry.total += week.planned;
      entry.count += 1;
      entry.pages.push(index);
      months.set(key, entry);
    });
    const list = [...months.values()];
    const years = new Set(list.map((entry) => entry.date.getFullYear())).size > 1 && list.length > 12;
    return list.map((entry) => {
      const value = Math.round(entry.total / entry.count);
      return { label: (years ? monthYear : monthShort).format(entry.date), value, display: value ? formatMinutes(value) : '—', muted: !entry.pages.includes(page) };
    });
  }, [weeks, page]);
  const levelsInWeek = current ? [...new Set(proposal.sessions
    .filter((session) => { const date = localDate(session.date); return date >= current.start && date < addDays(current.start, 7); })
    .map((session) => session.levelCode).filter(Boolean))] as LevelCode[] : [];

  return (
    <div className="pp">
      <ul className="pp-kpis lc-stagger">
        <li><CalendarRange size={17} aria-hidden="true" /><span>Période</span><strong>{shortDate(proposal.startDate)} → {shortDate(proposal.targetDate)}</strong></li>
        <li><BookOpen size={17} aria-hidden="true" /><span>Programme</span><strong>{formatMinutes(proposal.requiredMinutes)}</strong></li>
        <li><Clock size={17} aria-hidden="true" /><span>Temps disponible</span><strong>{formatMinutes(proposal.capacityMinutes)}</strong></li>
        <li><ListChecks size={17} aria-hidden="true" /><span>Séances</span><strong>{proposal.sessions.length}</strong></li>
        <li className="pp-kpi-wide">
          <span>Charge</span>
          <strong className="pp-kpi-badges"><FeasibilityBadge code={proposal.feasibility.code} /><DifficultyBadge code={proposal.difficulty.code} label={proposal.difficulty.label} /></strong>
          <small>Le programme occupe {Math.min(proposal.feasibility.loadPercent, 999)} % du temps disponible · {formatMinutes(proposal.difficulty.requiredWeeklyMinutes)} par semaine</small>
        </li>
      </ul>

      <div className="pp-grid">
        <section className="pp-panel" aria-labelledby="pp-levels-title">
          <h3 id="pp-levels-title">Les niveaux du parcours</h3>
          <LevelSpans proposal={proposal} onJump={jump} />
        </section>
        {weeks.length > 0 && (
          <section className="pp-panel pp-load" aria-labelledby="pp-load-title">
            <h3 id="pp-load-title">{weeks.length > 14 ? 'Charge moyenne par semaine, mois par mois' : 'Charge par semaine'}</h3>
            <Bars height={150} label={weeks.length > 14 ? 'Temps planifié en moyenne par semaine, pour chaque mois' : 'Temps planifié par semaine'} data={chart} />
          </section>
        )}
      </div>

      {!fits && (
        <div role="alert">
          <Callout tone="warning" title={`${proposal.overflowCount} activité${proposal.overflowCount > 1 ? 's' : ''} ne tien${proposal.overflowCount > 1 ? 'nent' : 't'} pas avant la date visée`}>
            <ul className="pp-overflow">
              {proposal.overflow.slice(0, 6).map((item) => <li key={item.id}><span>{item.levelCode ? `${item.levelCode} · ` : ''}{item.title}</span><b>{item.minutes} min</b></li>)}
              {proposal.overflow.length > 6 && <li><span>Et {proposal.overflow.length - 6} autre{proposal.overflow.length - 6 > 1 ? 's' : ''}</span></li>}
            </ul>
          </Callout>
        </div>
      )}
      {!fits && proposal.suggestions.length > 0 && onApply && (
        <section className="pp-suggestions" aria-labelledby="pp-suggestions-title">
          <h3 id="pp-suggestions-title">Ajustements possibles</h3>
          <div className="pp-suggestion-grid lc-stagger">
            {proposal.suggestions.map((suggestion) => {
              const Icon = suggestionIcons[suggestion.kind] ?? CalendarClock;
              return (
                <button key={`${suggestion.kind}-${suggestion.label}`} type="button" className="pp-suggestion" disabled={busy || suggestion.requiresAmendment}
                  onClick={() => onApply(suggestion)}>
                  <span className={`pp-suggestion-icon is-${suggestion.kind}`} aria-hidden="true"><Icon size={19} /></span>
                  <span className="pp-suggestion-text"><small>{suggestionKinds[suggestion.kind]}</small><strong>{suggestion.label}</strong>
                    {suggestion.requiresAmendment && <em>Demande un avenant au contrat</em>}</span>
                  <ArrowRight className="pp-suggestion-arrow" size={18} aria-hidden="true" />
                </button>
              );
            })}
          </div>
        </section>
      )}

      {current && (
        <section className="pp-panel pp-calendar" aria-labelledby="pp-calendar-title">
          <div className="pp-calendar-bar">
            <h3 id="pp-calendar-title">Séances, semaine du {formatMonthDay(current.start)}</h3>
            <div className="pp-pager">
              <button type="button" className="icon-button" onClick={() => setPage(page - 1)} disabled={page === 0} aria-label="Semaine précédente"><ChevronLeft size={18} aria-hidden="true" /></button>
              <span aria-live="polite">Semaine {page + 1} sur {weeks.length}</span>
              <button type="button" className="icon-button" onClick={() => setPage(page + 1)} disabled={page >= weeks.length - 1} aria-label="Semaine suivante"><ChevronRight size={18} aria-hidden="true" /></button>
            </div>
            {levelsInWeek.length > 0 && <span className="pp-week-levels">{levelsInWeek.map((code) => <LevelMark key={code} code={code} size="sm" label={`Niveau ${code}`} />)}</span>}
          </div>
          <ol className="pp-week" aria-label={`Séances de la semaine du ${formatMonthDay(current.start)}`}>
            {Array.from({ length: 7 }, (_, index) => {
              const date = addDays(current.start, index);
              const key = dayKey(date);
              const items = proposal.sessions.filter((session) => session.date.slice(0, 10) === key).sort((a, b) => a.slot - b.slot);
              const off = !open.has(index + 1);
              return (
                <li key={key} className={`pp-day${off ? ' is-off' : ''}${items.length ? '' : ' is-empty'}`}>
                  <span className="pp-day-head"><span>{weekdayShort.format(date).replace('.', '')}</span><strong>{date.getDate()}</strong>
                    <span className="sr-only">{formatDayLong(date)}{items.length ? '' : off ? ', repos' : ', aucune séance'}</span></span>
                  {items.length > 0 && (
                    <div className="pp-day-items">
                      {items.map((session) => (
                        <button key={`${session.date}-${session.slot}`} type="button" className={`pp-session lvl-${session.levelCode ?? 'A1'}`} onClick={() => setOpened(session)}>
                          <strong>{session.title}</strong>
                          <small>{session.levelCode ? `${session.levelCode} · ` : ''}{formatMinutes(session.minutes)}</small>
                          <span className="sr-only">, {session.items.length} activité{session.items.length > 1 ? 's' : ''}</span>
                        </button>
                      ))}
                    </div>
                  )}
                  {off && !items.length && <span className="pp-day-off" aria-hidden="true">Repos</span>}
                </li>
              );
            })}
          </ol>
        </section>
      )}

      {(onValidate || onEditDays) && proposal.status === 'proposed' && (
        <div className="pp-actions">
          {actionsNote && <div className="pp-actions-note">{actionsNote}</div>}
          {proposal.blockingReason && proposal.blockingReason !== 'overflow' && (
            <p className="pp-blocking"><TriangleAlert size={16} aria-hidden="true" /> {blockingReasonMessages[proposal.blockingReason]}</p>
          )}
          {onEditDays && <button type="button" className="btn btn-outline" onClick={onEditDays} disabled={busy}><CalendarPlus size={17} aria-hidden="true" /> {editDaysLabel}</button>}
          {onValidate && (
            <button type="button" className="btn btn-primary btn-lg" disabled={busy || !validatable} onClick={onValidate}>
              {busy ? <LoaderCircle size={18} className="ob-spin" aria-hidden="true" /> : <CircleCheck size={18} aria-hidden="true" />} {validateLabel}
            </button>
          )}
        </div>
      )}

      {(onValidate || onEditDays) && proposal.status === 'validated' && (
        <p className="pp-validated" role="status"><CircleCheck size={17} aria-hidden="true" /> Ce planning est en vigueur : vos séances sont à jour.</p>
      )}

      {opened && (
        <Drawer title={formatDayLong(localDate(opened.date))} description={`${opened.title} · ${formatMinutes(opened.minutes)}`} onClose={() => setOpened(null)}>
          <Facts items={[
            { label: 'Niveau', value: opened.levelCode ? levelName(opened.levelCode) : '—' },
            { label: 'Échéance', value: relativeMoment(opened.dueAt) },
            { label: 'Durée', value: formatMinutes(opened.minutes) },
            { label: 'Activités', value: opened.items.length },
          ]} />
          <ul className="kit-list pp-items">
            {opened.items.map((item) => {
              const kind = itemKinds[item.kind];
              const Icon = kind?.icon ?? BookOpen;
              return (
                <ListItem as="li" key={item.id} title={item.title}
                  subtitle={<>{kind?.label ?? item.kind}{item.additionId ? <span className="pp-added"><Plus size={12} aria-hidden="true" /> Cours ajouté</span> : null}</>}
                  leading={<span className={`pp-item-icon is-${item.kind}`} aria-hidden="true"><Icon size={17} /></span>}
                  trailing={<span className="pp-item-minutes">{item.minutes} min</span>} />
              );
            })}
          </ul>
        </Drawer>
      )}
    </div>
  );
}
