/**
 * Contrats de parcours côté professeur : liste des contrats en attente (/espace/contrats), fiche de décision
 * (conditions, test de niveau, difficulté, planning, historique), contre-proposition ou avenant avec estimation
 * en direct. Les briques communes (jauge de difficulté, jours, étapes des niveaux) servent aussi à l'onglet
 * « Parcours » de la fiche élève.
 */
import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, CalendarClock, CalendarRange, ChevronRight, CircleCheck, ClipboardList, FileSignature, Gauge, Handshake,
  History, Hourglass, Inbox, Lock, MessageSquareText, Minus, Plus, RefreshCw, Send, Sparkles, Target,
} from 'lucide-react';
import { Badge, EmptyState, PageHeading, ProgressBar, StatCard, type BadgeTone } from '../../components/ui';
import { Avatar, Callout, Card, Drawer, Facts, SkeletonCard, Timeline, useToast, type TimelineEntry } from '../../design/kit';
import { requestApi } from '../../integration/api';
import { pilotToday } from '../../integration/pilot-day';
import {
  competenceLabels, contractStatusLabels, contractStatusTones, difficultyCodes, difficultyLabels,
  difficultyThresholds, difficultyTones, feasibilityLabels, formatMinutes, levelCodes, levelLabel, levelRank, placementTierStatusLabels,
  startLevels, weekdayLabels, weekdayShortLabels, weeklyCapacity,
  type Contract, type ContractTerms, type Day, type Difficulty, type DifficultyBand, type Estimate, type LevelCode, type LevelSpan,
  type PathProposal, type PathView, type PendingContract, type PlacementSummary, type PlacementView, type StartLevel,
} from '../../integration/v2';
import { localDate } from './learner-calendar';
import { learnerUrl, plural, relativeDay } from './staff-kit';
import './staff-contracts.css';

// ---------------------------------------------------------------------------------------------------------------------
// Aides partagées
// ---------------------------------------------------------------------------------------------------------------------

const pad = (value: number) => String(value).padStart(2, '0');
const DAY = 86_400_000;
const mediumDay = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
const shortDay = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' });

export function isoDate(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Jour du pilote (fuseau du serveur), décalé de quelques jours. */
export function todayIso(offsetDays = 0) {
  return pilotToday(offsetDays);
}

/** Date « AAAA-MM-JJ » décalée de quelques mois (le jour est conservé autant que possible). */
export function addMonthsIso(value: string, months: number) {
  const date = localDate(value);
  date.setMonth(date.getMonth() + months);
  return isoDate(date);
}

/** « 15 févr. 2027 » pour une date « AAAA-MM-JJ » (ou un horodatage, dont seule la date compte). */
export function formatDay(value: string | null | undefined) {
  return value ? mediumDay.format(localDate(value)) : '—';
}

export function formatShortDay(value: string | null | undefined) {
  return value ? shortDay.format(localDate(value)) : '—';
}

export function weeksBetween(start: string, end: string) {
  return Math.max(0, Math.round((localDate(end).getTime() - localDate(start).getTime()) / (7 * DAY)));
}

export function errorText(error: unknown) {
  return error instanceof Error ? error.message : 'Cette action est temporairement indisponible.';
}

/** Chargement d'une réponse de l'API : `data` vaut `undefined` tant que rien n'est arrivé (une réponse `null` est valable). */
export function useLoad<T>(loader: () => Promise<T>, deps: readonly unknown[]) {
  const [state, setState] = useState<{ data: T | undefined; error: string; loading: boolean }>({ data: undefined, error: '', loading: true });
  const [tick, setTick] = useState(0);
  const latest = useRef(loader);
  latest.current = loader;
  useEffect(() => {
    let active = true;
    setState((current) => ({ ...current, loading: true, error: '' }));
    latest.current().then(
      (data) => { if (active) setState({ data, error: '', loading: false }); },
      (failure: unknown) => { if (active) setState((current) => ({ data: current.data, error: errorText(failure), loading: false })); },
    );
    return () => { active = false; };
  }, [...deps, tick]);
  return { ...state, reload: () => setTick((count) => count + 1) };
}

/** Contrats en attente (professeur, administration). Une passerelle plus ancienne répond en erreur : liste vide. */
export function usePendingContracts(token: string, enabled = true) {
  return useLoad<PendingContract[]>(
    () => enabled ? requestApi<PendingContract[]>('/learning/contracts/pending', token) : Promise.resolve([]),
    [token, enabled],
  );
}

/** Élèves dont un contrat attend la décision du professeur. */
export function learnersAwaitingDecision(pending: readonly PendingContract[] | undefined) {
  return new Set((pending ?? []).filter((item) => item.contract.status === 'pending_teacher').map((item) => item.learnerId));
}

/** Libellé d'un niveau de départ : « Débutant » pour A0, sinon le code. */
export function startLabel(level: StartLevel | string) {
  return level === 'A0' ? 'Débutant' : level;
}

// ---------------------------------------------------------------------------------------------------------------------
// Briques visuelles
// ---------------------------------------------------------------------------------------------------------------------

/** « A0 → A2 » : point de départ et niveau visé. */
export function LevelRoute({ from, to }: { from: StartLevel | string; to: LevelCode | string }) {
  return (
    <span className="sct-route" aria-label={`De ${levelLabel(from)} à ${levelLabel(to)}`}>
      <b aria-hidden="true">{startLabel(from)}</b><ArrowRight size={13} aria-hidden="true" /><b aria-hidden="true" className="is-target">{to}</b>
    </span>
  );
}

/** Jauge de difficulté en six bandes, avec la charge hebdomadaire nécessaire. */
export function DifficultyGauge({ difficulty, bands, caption }: { difficulty: Difficulty; bands?: DifficultyBand[]; caption?: ReactNode }) {
  const index = Math.max(0, difficultyCodes.indexOf(difficulty.code));
  const lower = index > 0 ? difficultyThresholds[difficultyCodes[index - 1]] ?? 0 : 0;
  const upper = difficultyThresholds[difficulty.code];
  const within = upper === null ? .5 : Math.min(1, Math.max(0, (difficulty.requiredWeeklyMinutes - lower) / Math.max(1, upper - lower)));
  const position = ((index + within) / difficultyCodes.length) * 100;
  const label = (code: typeof difficultyCodes[number]) => bands?.find((band) => band.code === code)?.label ?? difficultyLabels[code];
  return (
    <div className={`sct-gauge is-${difficulty.code}`}>
      <div className="sct-gauge-head">
        <span className={`badge badge-${difficultyTones[difficulty.code]}`}><Gauge size={13} aria-hidden="true" /> {difficulty.label || label(difficulty.code)}</span>
        <span className="sct-gauge-load"><strong>{formatMinutes(difficulty.requiredWeeklyMinutes)}</strong> par semaine</span>
      </div>
      <div className="sct-gauge-scale" role="img"
        aria-label={`Difficulté ${difficulty.label || label(difficulty.code)} : ${formatMinutes(difficulty.requiredWeeklyMinutes)} de travail par semaine`}>
        <div className="sct-gauge-track" aria-hidden="true">
          {difficultyCodes.map((code) => <span key={code} className={`is-${code}${code === difficulty.code ? ' is-current' : ''}`} />)}
        </div>
        <span className="sct-gauge-marker" aria-hidden="true" style={{ ['--x' as string]: `${position}%` }} />
        <div className="sct-gauge-labels" aria-hidden="true">
          {difficultyCodes.map((code) => <small key={code} className={code === difficulty.code ? 'is-current' : undefined}>{label(code)}</small>)}
        </div>
      </div>
      {caption && <p className="sct-gauge-caption">{caption}</p>}
    </div>
  );
}

/** Semaine type : séances et durée de chaque jour travaillé. */
export function DaysRow({ days, label = 'Jours d’étude' }: { days: readonly Day[]; label?: string }) {
  return (
    <ul className="lp-avail sct-days" aria-label={label}>
      {weekdayLabels.map((name, index) => {
        const day = days.find((item) => item.weekday === index + 1);
        return (
          <li key={name} className={day ? 'is-on' : undefined}>
            <span className="lp-avail-day" aria-hidden="true">{weekdayShortLabels[index]}</span>
            <strong aria-hidden="true">{day ? `${day.sessions}×` : '—'}</strong>
            <small aria-hidden="true">{day ? `${day.minutes} min` : 'repos'}</small>
            <span className="sr-only">{name} : {day ? `${plural(day.sessions, 'séance', 'séances')} de ${day.minutes} minutes` : 'repos'}</span>
          </li>
        );
      })}
    </ul>
  );
}

/** Conditions d'un contrat sous forme de faits clés. */
export function TermsFacts({ terms }: { terms: ContractTerms }) {
  const weeks = weeksBetween(terms.startDate, terms.targetDate);
  return (
    <Facts items={[
      { label: 'Niveaux', value: <LevelRoute from={terms.startLevel} to={terms.targetLevel} /> },
      { label: 'Date cible', value: <>{formatDay(terms.targetDate)}<small className="sct-fact-note">{plural(weeks, 'semaine', 'semaines')} depuis le {formatShortDay(terms.startDate)}</small></> },
      { label: 'Engagement minimal', value: <>{formatMinutes(terms.weeklyMinutes)}<small className="sct-fact-note">par semaine</small></> },
      { label: 'Programme restant', value: formatMinutes(terms.requiredMinutes) },
    ]} />
  );
}

/** Répartition des niveaux dans le planning (dates et nombre de séances). */
export function LevelSpans({ spans }: { spans: readonly LevelSpan[] }) {
  const total = spans.reduce((sum, span) => sum + Math.max(1, span.sessionCount), 0) || 1;
  if (!spans.length) return null;
  return (
    <div className="sct-spans">
      <div className="sct-spans-bar" aria-hidden="true">
        {spans.map((span, index) => (
          <span key={span.levelCode} className={`is-${index % 3}`} style={{ ['--w' as string]: `${(Math.max(1, span.sessionCount) / total) * 100}%` }}>{span.levelCode}</span>
        ))}
      </div>
      <ul className="sct-spans-list">
        {spans.map((span, index) => (
          <li key={span.levelCode}>
            <i className={`is-${index % 3}`} aria-hidden="true" />
            <strong>{levelLabel(span.levelCode)}</strong>
            <span>{span.firstDate ? `${formatShortDay(span.firstDate)} → ${formatShortDay(span.lastDate)}` : 'Dates à venir'}</span>
            <small>{plural(span.sessionCount, 'séance', 'séances')} · {formatMinutes(span.minutes)}</small>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** « par l’élève », « par le professeur »… */
export const proposerPhrases: Record<Contract['proposedBy'], string> = {
  learner: 'par l’élève', teacher: 'par le professeur', admin: 'par l’administration', system: 'par LinguaCap',
};

const contractIcons: Record<Contract['status'], ReactNode> = {
  pending_teacher: <Hourglass size={14} />, pending_learner: <Hourglass size={14} />, accepted: <CircleCheck size={14} />,
  rejected: <ArrowLeft size={14} />, superseded: <History size={14} />, withdrawn: <Minus size={14} />,
};
const contractTimelineTones: Record<Contract['status'], TimelineEntry['tone']> = {
  pending_teacher: 'warning', pending_learner: 'brand', accepted: 'success', rejected: 'danger', superseded: undefined, withdrawn: undefined,
};

/** Historique des contrats d'un parcours (récents d'abord). */
export function ContractHistory({ contracts, limit }: { contracts: readonly Contract[]; limit?: number }) {
  const shown = limit ? contracts.slice(0, limit) : contracts;
  if (!contracts.length) return <p className="staff-muted staff-small">Aucun contrat pour le moment.</p>;
  return (
    <Timeline items={shown.map((contract) => ({
      id: `${contract.pathId}-${contract.number}`, tone: contractTimelineTones[contract.status], icon: contractIcons[contract.status],
      title: `Contrat n° ${contract.number} · ${contractStatusLabels[contract.status]}`,
      meta: (
        <span className="sct-history-meta">
          <span>Proposé {proposerPhrases[contract.proposedBy]} le {formatDay(contract.createdAt)} · {startLabel(contract.terms.startLevel)} → {contract.terms.targetLevel}, {formatShortDay(contract.terms.targetDate)}, {formatMinutes(contract.terms.weeklyMinutes)} par semaine</span>
          {contract.note && <q>{contract.note}</q>}
          {contract.decisionNote && <span className="sct-history-decision">Réponse : « {contract.decisionNote} »</span>}
        </span>
      ),
    }))} />
  );
}

/** Résultat du test de niveau : niveau retenu, puis réussite par palier et par compétence. */
export function PlacementResultView({ view }: { view: PlacementView }) {
  const result = view.result;
  const tiers = view.tiers.filter((tier) => tier.status !== 'locked');
  const tone = (status: string): BadgeTone => status === 'passed' ? 'green' : status === 'failed' ? 'amber' : status === 'current' ? 'blue' : 'neutral';
  return (
    <div className="sct-placement">
      <div className="sct-placement-head">
        <span className="sct-level-badge" aria-hidden="true">{result?.placedLevel ?? '…'}</span>
        <div>
          <strong>{result ? levelLabel(result.placedLevel) : 'Test en cours'}</strong>
          <small>{result?.declaredBeginner ? 'Débutant déclaré, sans test' : view.completedAt ? `Test passé le ${formatDay(view.completedAt)}` : `Commencé le ${formatDay(view.startedAt)}`}</small>
        </div>
        {result?.beyondTest && <Badge tone="violet">Au-delà du test</Badge>}
      </div>
      {result?.summary && <p className="sct-placement-summary">{result.summary}</p>}
      {tiers.length > 0 && (
        <ul className="sct-tiers">
          {tiers.map((tier) => (
            <li key={tier.code} className={`sct-tier is-${tier.status}`}>
              <span className="sct-tier-code" aria-hidden="true">{tier.code}</span>
              <div className="sct-tier-main">
                <div className="sct-tier-top">
                  <strong>Palier {tier.code}</strong>
                  <Badge tone={tone(tier.status)}>{placementTierStatusLabels[tier.status]}</Badge>
                  <b>{tier.percent === null ? '—' : `${tier.percent} %`}</b>
                </div>
                <ProgressBar value={tier.percent ?? 0} label={`Palier ${tier.code} : ${tier.percent ?? 0} % de bonnes réponses`} />
                {tier.competences && (
                  <div className="sct-tier-skills">
                    {Object.entries(tier.competences).map(([competence, score]) => score && (
                      <span key={competence}>{competenceLabels[competence] ?? competence} <b>{score.percent} %</b></span>
                    ))}
                    {tier.correct !== null && tier.total !== null && <span>{tier.correct} / {tier.total} bonnes réponses</span>}
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function SectionTitle({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return <h3 className="sct-section-title"><span aria-hidden="true">{icon}</span>{children}</h3>;
}

// ---------------------------------------------------------------------------------------------------------------------
// Proposition d'un autre contrat (contre-proposition ou avenant)
// ---------------------------------------------------------------------------------------------------------------------

const durationMonths = [1, 2, 3, 4, 6, 9, 12];
const roundUp = (value: number, step: number) => Math.ceil(value / step) * step;

/** Jours proposés pour une charge hebdomadaire (règle du serveur, section 3.1 du plan). */
export function suggestDays(weekly: number): Day[] {
  if (weekly <= 0) return [];
  const sevenDays = weekly * 1.15 / 5 > 240;
  const count = sevenDays ? 7 : 5;
  const perDay = Math.max(15, roundUp(Math.ceil(weekly * 1.15 / count), 5));
  const sessions = perDay > 60 ? Math.min(6, Math.ceil(perDay / 60)) : 1;
  const minutes = Math.min(240, Math.max(10, roundUp(Math.ceil(perDay / sessions), 5)));
  return Array.from({ length: count }, (_, index) => ({ weekday: index + 1, sessions, minutes }));
}

function MinutesStepper({ label, value, onChange, min = 30, max = 2520, step = 15 }: {
  label: string; value: number; onChange: (value: number) => void; min?: number; max?: number; step?: number;
}) {
  const clamp = (next: number) => Math.min(max, Math.max(min, Math.round(next / step) * step));
  return (
    <div className="sct-stepper" role="group" aria-label={label}>
      <button type="button" className="icon-button" onClick={() => onChange(clamp(value - step))} disabled={value <= min} aria-label={`Diminuer : ${label}`}>
        <Minus size={17} aria-hidden="true" />
      </button>
      <output aria-live="polite"><strong>{formatMinutes(value)}</strong><small>par semaine</small></output>
      <button type="button" className="icon-button" onClick={() => onChange(clamp(value + step))} disabled={value >= max} aria-label={`Augmenter : ${label}`}>
        <Plus size={17} aria-hidden="true" />
      </button>
    </div>
  );
}

/**
 * Formulaire de contrat : niveau de départ, niveau visé, date cible, engagement hebdomadaire, jours et note, avec
 * l'estimation du serveur recalculée à chaque changement. `kind` : contre-proposition (contrat en attente du
 * professeur) ou avenant (contrat en vigueur).
 */
export function ContractForm({ learnerId, learnerName, pathId, base, token, formId, kind, onBusy, onSent }: {
  learnerId: string; learnerName: string; pathId: string; base: ContractTerms; token: string; formId: string;
  kind: 'counter' | 'amendment'; onBusy: (busy: boolean) => void; onSent: (contract: Contract) => void;
}) {
  const [startLevel, setStartLevel] = useState<StartLevel>(base.startLevel);
  const [targetLevel, setTargetLevel] = useState<LevelCode>(base.targetLevel);
  const [targetDate, setTargetDate] = useState(base.targetDate);
  const [weekly, setWeekly] = useState(Math.max(30, base.weeklyMinutes));
  const [note, setNote] = useState('');
  const [estimate, setEstimate] = useState<Estimate | null>(null);
  const [estimateError, setEstimateError] = useState('');
  const [estimating, setEstimating] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const ticket = useRef(0);
  const noteId = useId();
  const minDate = todayIso(7);
  const first = learnerName.trim().split(/\s+/)[0] || learnerName;

  useEffect(() => {
    if (!targetDate) return;
    const handle = window.setTimeout(() => {
      const current = ++ticket.current;
      setEstimating(true);
      requestApi<Estimate>('/learning/paths/estimate', token, {
        method: 'POST', body: { learnerId, pathId, startLevel, targetLevel, targetDate },
      }).then(
        (data) => { if (current === ticket.current) { setEstimate(data); setEstimateError(''); } },
        (failure: unknown) => { if (current === ticket.current) setEstimateError(errorText(failure)); },
      ).finally(() => { if (current === ticket.current) setEstimating(false); });
    }, 320);
    return () => window.clearTimeout(handle);
  }, [learnerId, pathId, startLevel, targetLevel, targetDate, token]);

  const required = estimate?.requiredWeeklyMinutes ?? base.difficulty.requiredWeeklyMinutes;
  const needed = Math.max(required, weekly);
  const currentCapacity = weeklyCapacity(base.availability);
  const suggested = estimate && weeklyCapacity(estimate.suggestedAvailability) >= needed ? estimate.suggestedAvailability : suggestDays(needed);
  const keepDays = currentCapacity >= needed;
  const days = keepDays ? base.availability : suggested;
  const allowed = estimate?.allowedTargets ?? null;
  const targetAllowed = !allowed || allowed.includes(targetLevel);
  const unrealistic = estimate?.difficulty.code === 'unrealistic';
  const unchanged = startLevel === base.startLevel && targetLevel === base.targetLevel && targetDate === base.targetDate && weekly === base.weeklyMinutes;
  const ready = Boolean(estimate) && !estimateError && !unrealistic && targetAllowed && !unchanged && targetDate >= minDate;
  const targets = levelCodes.filter((code) => levelRank(code) > levelRank(startLevel));

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || !ready) return;
    setBusy(true);
    onBusy(true);
    setError('');
    try {
      const contract = await requestApi<Contract>(`/learning/paths/${encodeURIComponent(pathId)}/contracts`, token, {
        method: 'POST',
        body: {
          targetLevel, targetDate, weeklyMinutes: weekly,
          ...(startLevel !== base.startLevel ? { startLevel } : {}),
          ...(keepDays ? {} : { availability: days }),
          ...(note.trim() ? { note: note.trim() } : {}),
        },
      });
      onSent(contract);
    } catch (failure) {
      setError(errorText(failure));
    } finally {
      setBusy(false);
      onBusy(false);
    }
  }

  return (
    <form id={formId} className="sct-form" onSubmit={submit} aria-label={kind === 'counter' ? 'Proposer un autre contrat' : 'Proposer un avenant'}>
      <Callout tone="info">
        {kind === 'counter'
          ? `${first} poursuit avec les conditions actuelles jusqu’à sa réponse. S’il accepte, le planning est recalculé.`
          : `Le contrat en vigueur reste appliqué tant que ${first} n’a pas accepté l’avenant.`}
      </Callout>

      <div className="sct-form-grid">
        <label>Niveau de départ
          <select value={startLevel} onChange={(event) => {
            const next = event.target.value as StartLevel;
            setStartLevel(next);
            if (levelRank(targetLevel) <= levelRank(next)) setTargetLevel(levelCodes.find((code) => levelRank(code) > levelRank(next)) ?? targetLevel);
          }}>
            {startLevels.filter((level) => level !== 'C2').map((level) => <option key={level} value={level}>{levelLabel(level)}</option>)}
          </select>
        </label>
        <label>Date cible
          <input type="date" value={targetDate} min={minDate} required onChange={(event) => setTargetDate(event.target.value)} />
        </label>
      </div>

      <fieldset className="sct-field">
        <legend>Niveau visé</legend>
        <div className="sct-pills" role="radiogroup" aria-label="Niveau visé">
          {targets.map((code) => {
            const disabled = Boolean(allowed && !allowed.includes(code));
            return (
              <button key={code} type="button" role="radio" aria-checked={targetLevel === code} className="sct-pill" disabled={disabled}
                onClick={() => setTargetLevel(code)} title={disabled ? 'Parcours non publié pour ce niveau' : undefined}>
                <strong>{code}</strong><small>{disabled ? 'Non publié' : levelLabel(code).split(' · ')[1] ?? ''}</small>
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset className="sct-field">
        <legend>Durée depuis le début du parcours ({formatShortDay(base.startDate)})</legend>
        <div className="sct-chips" role="group" aria-label="Durées prédéfinies">
          {durationMonths.map((months) => {
            const date = addMonthsIso(base.startDate, months);
            return (
              <button key={months} type="button" className="kit-chip" aria-pressed={targetDate === date} disabled={date < minDate}
                onClick={() => setTargetDate(date)}>{months} mois</button>
            );
          })}
        </div>
      </fieldset>

      <section className="sct-estimate" aria-label="Estimation de la charge" aria-busy={estimating}>
        {estimateError ? <Callout tone="warning" title="Estimation impossible">{estimateError}</Callout>
          : !estimate ? <SkeletonCard lines={2} label="Estimation en cours…" />
          : (
            <>
              <DifficultyGauge difficulty={estimate.difficulty} bands={estimate.bands}
                caption={<>Environ <strong>{formatMinutes(estimate.requiredDailyMinutes.fiveDays)}</strong> par jour sur cinq jours, ou {formatMinutes(estimate.requiredDailyMinutes.sevenDays)} sur sept, pendant {plural(Math.round(estimate.weeks), 'semaine', 'semaines')}.</>} />
              {unrealistic && <Callout tone="warning" title="Objectif irréaliste">Repoussez la date cible ou visez un niveau plus proche : ce contrat serait refusé.</Callout>}
              {!targetAllowed && <Callout tone="warning">Ce niveau n’a pas encore de parcours publié.</Callout>}
            </>
          )}
      </section>

      <div className="sct-field">
        <span className="sct-field-label">Engagement hebdomadaire minimal</span>
        <MinutesStepper label="Engagement hebdomadaire minimal" value={weekly} onChange={setWeekly} />
        {estimate && weekly < required && (
          <p className="sct-field-hint is-warning">
            En dessous de la charge nécessaire ({formatMinutes(required)}).{' '}
            <button type="button" className="text-link" onClick={() => setWeekly(roundUp(required, 15))}>Aligner sur {formatMinutes(roundUp(required, 15))}</button>
          </p>
        )}
      </div>

      <div className="sct-field">
        <span className="sct-field-label">{keepDays ? `Jours actuels de ${first}` : 'Jours proposés'}</span>
        <DaysRow days={days} label={keepDays ? `Jours actuels de ${first}` : 'Jours proposés'} />
        <p className="sct-field-hint">
          {keepDays
            ? `${formatMinutes(currentCapacity)} par semaine : ses jours actuels suffisent et restent inchangés.`
            : `Ses jours actuels (${formatMinutes(currentCapacity)} par semaine) ne suffisent plus : ces jours accompagneront la proposition, ${first} pourra les réorganiser.`}
        </p>
      </div>

      <label htmlFor={noteId}>Message à {first} (conseillé)
        <textarea id={noteId} rows={3} maxLength={1000} value={note} onChange={(event) => setNote(event.target.value)}
          placeholder="Expliquez en quelques mots pourquoi ces conditions lui conviendront mieux." />
      </label>
      {unchanged && <p className="sct-field-hint">Modifiez au moins une condition pour proposer un autre contrat.</p>}
      {error && <div role="alert"><Callout tone="warning" title="Envoi impossible">{error}</Callout></div>}
    </form>
  );
}

// ---------------------------------------------------------------------------------------------------------------------
// Fiche de décision
// ---------------------------------------------------------------------------------------------------------------------

/** Dernier test de niveau de l'élève (celui du parcours s'il est connu, sinon le plus récent terminé). */
export function PlacementLoader({ learnerId, attemptId, token }: { learnerId: string; attemptId: string | null; token: string }) {
  const id = encodeURIComponent(learnerId);
  const placement = useLoad<PlacementView | null>(async () => {
    let chosen = attemptId;
    if (!chosen) {
      const attempts = await requestApi<PlacementSummary[]>(`/assessments/placements?learnerId=${id}`, token);
      chosen = attempts.filter((attempt) => attempt.status === 'completed')
        .sort((a, b) => (b.completedAt ?? '').localeCompare(a.completedAt ?? ''))[0]?.id ?? null;
    }
    return chosen ? requestApi<PlacementView>(`/assessments/placements/${encodeURIComponent(chosen)}`, token) : null;
  }, [id, attemptId, token]);
  return placement.error ? <Callout tone="warning">{placement.error}</Callout>
    : placement.data === undefined ? <SkeletonCard lines={3} label="Chargement du test de niveau…" />
    : placement.data === null ? <p className="staff-muted staff-small">Aucun test de niveau terminé : le niveau de départ a été choisi sans test.</p>
    : <PlacementResultView view={placement.data} />;
}

function PlacementSection({ learnerId, attemptId, token }: { learnerId: string; attemptId: string | null; token: string }) {
  return (
    <section className="sct-section">
      <SectionTitle icon={<ClipboardList size={17} />}>Test de niveau</SectionTitle>
      <PlacementLoader learnerId={learnerId} attemptId={attemptId} token={token} />
    </section>
  );
}

function PlanningSection({ pathId, terms, token }: { pathId: string; terms: ContractTerms; token: string }) {
  const proposal = useLoad<PathProposal>(() => requestApi<PathProposal>(`/learning/paths/${encodeURIComponent(pathId)}/proposal`, token), [pathId, token]);
  const capacity = weeklyCapacity(terms.availability);
  return (
    <section className="sct-section">
      <SectionTitle icon={<CalendarRange size={17} />}>Planning</SectionTitle>
      <DaysRow days={terms.availability} label="Jours d’étude prévus par le contrat" />
      <div className="sct-capacity">
        <span><strong>{formatMinutes(capacity)}</strong> disponibles par semaine</span>
        <span>Engagement : <strong>{formatMinutes(terms.weeklyMinutes)}</strong></span>
        {proposal.data && <Badge tone={proposal.data.feasibility.code === 'comfortable' ? 'green' : proposal.data.feasibility.code === 'tight' ? 'amber' : 'red'}>
          {feasibilityLabels[proposal.data.feasibility.code]} · {proposal.data.feasibility.loadPercent} %</Badge>}
      </div>
      {proposal.error ? <p className="staff-muted staff-small">Le détail du planning n’est pas disponible pour le moment.</p>
        : !proposal.data ? <SkeletonCard lines={2} label="Chargement du planning…" />
        : <LevelSpans spans={proposal.data.levels} />}
    </section>
  );
}

/**
 * Fiche de décision d'un contrat en attente, dans un panneau latéral large. Sans contrat (`contract: null`), le panneau
 * s'ouvre directement sur le formulaire d'avenant à partir des conditions en vigueur (`base`).
 */
export function ContractDecision({ pathId, learnerId, learnerName, contract, base, token, onClose, onDone }: {
  pathId: string; learnerId: string; learnerName: string; contract: Contract | null; base: ContractTerms; token: string;
  onClose: () => void; onDone: () => void;
}) {
  const toast = useToast();
  const [mode, setMode] = useState<'decide' | 'propose'>(contract ? 'decide' : 'propose');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const formId = useId();
  const noteId = useId();
  const pid = encodeURIComponent(pathId);
  const id = encodeURIComponent(learnerId);
  const first = learnerName.trim().split(/\s+/)[0] || learnerName;
  const path = useLoad<PathView | null>(() => contract ? requestApi<PathView | null>(`/learning/path?learnerId=${id}`, token) : Promise.resolve(null), [id, token, Boolean(contract)]);
  const history = useLoad<Contract[]>(() => contract ? requestApi<Contract[]>(`/learning/paths/${pid}/contracts`, token) : Promise.resolve([]), [pid, token, Boolean(contract)]);
  const decidable = Boolean(contract && (contract.canAccept || contract.canReject) && contract.status === 'pending_teacher');

  async function accept() {
    if (!contract || busy) return;
    setBusy(true);
    setError('');
    try {
      await requestApi<PathView>(`/learning/paths/${pid}/contracts/${contract.number}/accept`, token, {
        method: 'POST', body: note.trim() ? { note: note.trim() } : {},
      });
      toast(`Contrat de ${learnerName} validé : ses conditions sont désormais engagées.`);
      onDone();
    } catch (failure) {
      setError(errorText(failure));
    } finally {
      setBusy(false);
    }
  }

  const proposing = mode === 'propose';
  const terms = contract?.terms ?? base;
  const footer = <div className="sct-foot">{proposing ? (
    <>
      {contract
        ? <button type="button" className="btn btn-outline" onClick={() => setMode('decide')}><ArrowLeft size={16} aria-hidden="true" /> Revenir au contrat</button>
        : <button type="button" className="btn btn-outline" onClick={onClose}>Annuler</button>}
      <button type="submit" form={formId} className="btn btn-primary" disabled={busy}>
        <Send size={16} aria-hidden="true" /> {busy ? 'Envoi…' : contract ? 'Envoyer la contre-proposition' : 'Envoyer l’avenant'}
      </button>
    </>
  ) : decidable ? (
    <>
      <button type="button" className="btn btn-outline" onClick={() => { setError(''); setMode('propose'); }} disabled={busy}>
        <FileSignature size={16} aria-hidden="true" /> Proposer un autre contrat
      </button>
      <button type="button" className="btn btn-primary" onClick={() => void accept()} disabled={busy}>
        <Handshake size={17} aria-hidden="true" /> {busy ? 'Validation…' : 'Valider le contrat'}
      </button>
    </>
  ) : <button type="button" className="btn btn-outline" onClick={onClose}>Fermer</button>}</div>;

  return (
    <Drawer wide onClose={onClose} footer={footer}
      title={proposing ? (contract ? 'Proposer un autre contrat' : 'Proposer un avenant') : `Contrat de ${learnerName}`}
      description={proposing ? learnerName : contract
        ? `Contrat n° ${contract.number} · proposé ${proposerPhrases[contract.proposedBy]} le ${formatDay(contract.createdAt)}`
        : undefined}>
      {proposing ? (
        <ContractForm learnerId={learnerId} learnerName={learnerName} pathId={pathId} base={terms} token={token} formId={formId}
          kind={contract ? 'counter' : 'amendment'} onBusy={setBusy} onSent={(sent) => {
            toast(contract ? `Contre-proposition envoyée à ${learnerName} (contrat n° ${sent.number}).` : `Avenant envoyé à ${learnerName} (contrat n° ${sent.number}).`);
            onDone();
          }} />
      ) : contract && (
        <div className="sct-decision">
          <div className="sct-decision-banner">
            <Avatar name={learnerName} size={44} />
            <div>
              <strong>{learnerName}</strong>
              <span className="staff-tags">
                <Badge tone={contractStatusTones[contract.status]}>{contractStatusLabels[contract.status]}</Badge>
                <LevelRoute from={terms.startLevel} to={terms.targetLevel} />
              </span>
            </div>
            <Link className="btn btn-ghost btn-sm" to={learnerUrl(learnerId, 'parcours')}>Fiche <ChevronRight size={15} aria-hidden="true" /></Link>
          </div>
          {contract.status === 'pending_teacher' && (
            <Callout tone="info" title={`${first} a déjà commencé`}>Ces conditions s’appliquent en attendant votre décision. Validez-les pour les engager, ou proposez-en d’autres.</Callout>
          )}

          <section className="sct-section">
            <SectionTitle icon={<Target size={17} />}>Conditions proposées</SectionTitle>
            <TermsFacts terms={terms} />
            {contract.note && (
              <blockquote className="sct-quote"><MessageSquareText size={16} aria-hidden="true" /><p>{contract.note}</p></blockquote>
            )}
          </section>

          <section className="sct-section">
            <SectionTitle icon={<Gauge size={17} />}>Difficulté</SectionTitle>
            <DifficultyGauge difficulty={terms.difficulty}
              caption={<>Charge calculée sur {plural(weeksBetween(terms.startDate, terms.targetDate), 'semaine', 'semaines')} pour {formatMinutes(terms.requiredMinutes)} de programme.</>} />
          </section>

          {path.data === undefined && !path.error
            ? <SkeletonCard lines={3} label="Chargement du test de niveau…" />
            : <PlacementSection learnerId={learnerId} attemptId={path.data?.placementAttemptId ?? null} token={token} />}

          <PlanningSection pathId={pathId} terms={terms} token={token} />

          <section className="sct-section">
            <SectionTitle icon={<History size={17} />}>Historique</SectionTitle>
            {history.error ? <p className="staff-muted staff-small">{history.error}</p>
              : !history.data ? <SkeletonCard lines={2} label="Chargement de l’historique…" />
              : <ContractHistory contracts={history.data} />}
          </section>

          {decidable && (
            <label htmlFor={noteId} className="sct-decision-note">Un mot pour {first} (facultatif)
              <textarea id={noteId} rows={2} maxLength={1000} value={note} onChange={(event) => setNote(event.target.value)}
                placeholder="Bravo pour ce bel objectif, je vous accompagne !" />
            </label>
          )}
          {error && <div role="alert"><Callout tone="warning" title="Décision impossible">{error}</Callout></div>}
        </div>
      )}
    </Drawer>
  );
}

// ---------------------------------------------------------------------------------------------------------------------
// Page « Contrats »
// ---------------------------------------------------------------------------------------------------------------------

function ContractRow({ item, onOpen }: { item: PendingContract; onOpen: () => void }) {
  const { contract } = item;
  const terms = contract.terms;
  return (
    <li className={`sct-row is-${contract.status}`}>
      <Avatar name={item.learnerName} size={42} />
      <div className="sct-row-main">
        <button type="button" className="sct-row-title" onClick={onOpen}>{item.learnerName}</button>
        <small>Contrat n° {contract.number} · proposé {proposerPhrases[contract.proposedBy]} {relativeDay(contract.createdAt)}</small>
        <span className="sct-row-terms">
          <LevelRoute from={terms.startLevel} to={terms.targetLevel} />
          <span className="sct-term"><CalendarClock size={13} aria-hidden="true" />{formatDay(terms.targetDate)}</span>
          <span className="sct-term"><Hourglass size={13} aria-hidden="true" />{formatMinutes(terms.weeklyMinutes)} / sem.</span>
          <span className={`badge badge-${difficultyTones[terms.difficulty.code]}`}>{terms.difficulty.label || difficultyLabels[terms.difficulty.code]}</span>
        </span>
      </div>
      <div className="sct-row-end">
        <Badge tone={contractStatusTones[contract.status]}>{contract.status === 'pending_teacher' ? 'À valider' : contractStatusLabels[contract.status]}</Badge>
        <button type="button" className="btn btn-soft btn-sm" onClick={onOpen} aria-label={`Examiner le contrat de ${item.learnerName}`}>
          Examiner <ChevronRight size={15} aria-hidden="true" />
        </button>
      </div>
    </li>
  );
}

const howItWorks = [
  { icon: Sparkles, title: 'L’élève démarre aussitôt', text: 'Il valide son planning : son contrat vous est envoyé et il commence sans attendre.' },
  { icon: Handshake, title: 'Vous décidez', text: 'Validez les conditions, ou proposez-en d’autres avec un message.' },
  { icon: Lock, title: 'Le contrat engage', text: 'Une fois accepté, niveau visé, date cible et temps minimal par semaine sont fixés.' },
];

export function ContractsPage({ admin, token }: { admin: boolean; token: string }) {
  const pending = usePendingContracts(token);
  const [params, setParams] = useSearchParams();
  const [openKey, setOpenKey] = useState<string | null>(() => params.get('contrat'));
  const list = pending.data ?? [];
  const toDecide = list.filter((item) => item.contract.status === 'pending_teacher')
    .sort((a, b) => a.contract.createdAt.localeCompare(b.contract.createdAt));
  const waiting = list.filter((item) => item.contract.status === 'pending_learner');
  const opened = list.find((item) => item.pathId === openKey) ?? null;
  const oldest = toDecide[0];

  function open(item: PendingContract | null) {
    setOpenKey(item?.pathId ?? null);
    setParams(item ? { contrat: item.pathId } : {}, { replace: true });
  }

  return (
    <div className="staff-page sct-page">
      <PageHeading title="Contrats" description={admin
        ? 'Parcours proposés par les élèves : validez les conditions ou proposez-en d’autres.'
        : 'Parcours proposés par vos élèves : validez les conditions ou proposez-en d’autres.'}
        action={<button type="button" className="btn btn-outline" onClick={pending.reload}><RefreshCw size={17} aria-hidden="true" /> Actualiser</button>} />

      {pending.error ? (
        <div className="staff-error" role="alert"><p>{pending.error}</p>
          <button type="button" className="btn btn-sm btn-outline" onClick={pending.reload}><RefreshCw size={15} aria-hidden="true" /> Réessayer</button></div>
      ) : !pending.data ? <SkeletonCard lines={5} label="Chargement des contrats…" /> : (
        <div className="staff-page-body">
          <div className="staff-kpis is-three lc-stagger">
            <StatCard label="À valider" value={toDecide.length} icon={<FileSignature size={20} />}
              note={toDecide.length ? 'Les élèves ont déjà commencé' : 'Rien en attente'} />
            <StatCard label="En attente de l’élève" value={waiting.length} icon={<Hourglass size={20} />}
              note={waiting.length ? 'Vos propositions envoyées' : 'Aucune proposition en cours'} />
            <StatCard label="Plus ancien" value={oldest ? relativeDay(oldest.contract.createdAt) : '—'} icon={<CalendarClock size={20} />}
              note={oldest ? oldest.learnerName : 'Tout est à jour'} />
          </div>

          <div className="sct-layout">
            <div className="staff-col">
              <Card flush title="À valider" icon={<FileSignature size={18} />} aria-label="Contrats à valider"
                description={toDecide.length ? 'Du plus ancien au plus récent' : undefined}>
                {toDecide.length ? (
                  <ul className="sct-rows lc-stagger">
                    {toDecide.map((item) => <ContractRow key={`${item.pathId}-${item.contract.number}`} item={item} onOpen={() => open(item)} />)}
                  </ul>
                ) : (
                  <EmptyState icon={<Inbox size={26} />} title="Aucun contrat à valider"
                    description="Les contrats de vos élèves apparaîtront ici dès qu’ils auront validé leur planning." />
                )}
              </Card>
              {waiting.length > 0 && (
                <Card flush title="En attente de l’élève" icon={<Hourglass size={18} />} aria-label="Contrats en attente de l’élève"
                  description="Vos propositions, en attente de réponse">
                  <ul className="sct-rows lc-stagger">
                    {waiting.map((item) => <ContractRow key={`${item.pathId}-${item.contract.number}`} item={item} onOpen={() => open(item)} />)}
                  </ul>
                </Card>
              )}
            </div>
            <Card title="Comment ça marche" icon={<Handshake size={18} />} className="sct-help">
              <ol className="sct-how">
                {howItWorks.map(({ icon: Icon, title, text }) => (
                  <li key={title}><span aria-hidden="true"><Icon size={17} /></span><div><strong>{title}</strong><small>{text}</small></div></li>
                ))}
              </ol>
            </Card>
          </div>
        </div>
      )}

      {opened && (
        <ContractDecision key={`${opened.pathId}-${opened.contract.number}`} pathId={opened.pathId} learnerId={opened.learnerId}
          learnerName={opened.learnerName} contract={opened.contract} base={opened.contract.terms} token={token}
          onClose={() => open(null)} onDone={() => { open(null); pending.reload(); }} />
      )}
    </div>
  );
}
