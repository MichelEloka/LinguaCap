/**
 * « Mon planning » d'un parcours multi-niveaux : frise des niveaux, jours d'étude, contrat en bref, proposition à valider
 * et séances par semaine (les niveaux futurs restent grisés et verrouillés). Les actions suivent `PathView.permissions`.
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, CalendarCog, CalendarDays, CalendarRange, CheckCircle2, CirclePause, CirclePlay, Clock, Flag, Handshake, Hourglass,
  ListChecks, LoaderCircle, Lock, Rocket, Target,
} from 'lucide-react';
import { Badge, Dialog } from '../../components/ui';
import { Callout, Card, Drawer, Segmented, useToast } from '../../design/kit';
import { requestApi } from '../../integration/api';
import {
  contractStatusTones, formatMinutes, pathStepStatusLabels, weeklyCapacity, type Day, type LevelCode, type PathProposal,
  type PathStep, type PathView, type Suggestion,
} from '../../integration/v2';
import { languageName } from '../../domain/languages';
import {
  DayPlanner, learnerContractLabels, DifficultyBadge, errorText, isoDay, LevelMark, levelName, longDate, ofLanguage, shortDate, WeekSummary,
} from '../onboarding/onboarding-kit';
import { PathProposalView } from '../onboarding/path-proposal';
import { PathSessionsByWeek } from './learner-views';
import './learner-path.css';

const stepTone = { planned: 'neutral', active: 'blue', completed: 'green', withdrawn: 'neutral' } as const;

/** Frise des niveaux du parcours : départ, chaque niveau (avancement, dates), date cible. */
export function LevelTrack({ path }: { path: PathView }) {
  const total = path.steps.reduce((sum, step) => sum + step.sessionsTotal, 0);
  const done = path.steps.reduce((sum, step) => sum + step.sessionsCompleted, 0);
  return (
    <ol className="lpa-track" aria-label="Niveaux du parcours">
      <li className="lpa-node is-start">
        <LevelMark code={path.startLevel} size="md" state="done" />
        <span><strong>Départ</strong><small>{levelName(path.startLevel)} · {shortDate(path.startDate)}</small></span>
      </li>
      {path.steps.map((step, index) => <StepNode key={step.id} step={step} previous={path.steps[index - 1]} />)}
      <li className="lpa-node is-goal">
        <span className="lpa-goal-icon" aria-hidden="true"><Flag size={18} /></span>
        <span><strong>Objectif {path.targetLevel}</strong><small>{longDate(path.targetDate)} · {total ? Math.round((done / total) * 100) : 0} % fait</small></span>
      </li>
    </ol>
  );
}

function StepNode({ step, previous }: { step: PathStep; previous?: PathStep }) {
  const percent = step.sessionsTotal ? Math.round((step.sessionsCompleted / step.sessionsTotal) * 100) : 0;
  const state = step.status === 'active' ? 'current' : step.status === 'completed' ? 'done' : 'locked';
  const decision = step.finalDecision === 'validated' ? 'Validé' : step.finalDecision === 'to_consolidate' ? 'À consolider' : null;
  return (
    <li className={`lpa-node lvl-${step.levelCode} is-${step.status}`}>
      <LevelMark code={step.levelCode} size="md" state={state} />
      <span className="lpa-node-text">
        <strong>{levelName(step.levelCode)} <Badge tone={stepTone[step.status]}>{decision ?? pathStepStatusLabels[step.status]}</Badge></strong>
        <small>{step.firstDate ? `${shortDate(step.firstDate)} → ${shortDate(step.lastDate)}` : 'Dates à venir'} · {step.sessionsCompleted}/{step.sessionsTotal} séances</small>
        {step.status === 'planned'
          ? <small className="lpa-lock"><Lock size={12} aria-hidden="true" /> S’ouvre à la remise de l’examen blanc {previous?.levelCode ?? ''}</small>
          : <span className="lpa-progress" role="img" aria-label={`${percent} % des séances ${step.levelCode} terminées`}><span style={{ width: `${percent}%` }} /></span>}
      </span>
    </li>
  );
}

type Panel = { mode: 'days' } | { mode: 'proposal'; proposal: PathProposal } | null;

export function LearnerPath({ token, path, onChanged }: { token: string; path: PathView; onChanged: () => void }) {
  const toast = useToast();
  const [panel, setPanel] = useState<Panel>(null);
  const [days, setDays] = useState<Day[]>(path.availability);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [pausing, setPausing] = useState(false);
  const active = path.steps.find((step) => step.status === 'active') ?? path.steps[0];
  const [filter, setFilter] = useState<string>(active?.levelCode ?? 'all');
  const { permissions, contract } = path;
  const engagedMinutes = contract.engaged ? contract.current?.terms.weeklyMinutes ?? null : null;
  const capacity = weeklyCapacity(path.availability);
  const pendingTeacher = contract.pending?.canAccept;
  const sessions = filter === 'all' ? path.sessions : path.sessions.filter((session) => session.levelCode === filter);
  const levelsWithSessions = [...new Set(path.sessions.map((session) => session.levelCode))] as LevelCode[];

  async function run<T>(action: () => Promise<T>, done: (result: T) => void) {
    setBusy(true);
    setError('');
    try { done(await action()); } catch (failure) { setError(errorText(failure)); } finally { setBusy(false); }
  }

  const openProposal = () => run(
    () => requestApi<PathProposal>(`/learning/paths/${encodeURIComponent(path.id)}/proposal`, token),
    (proposal) => setPanel({ mode: 'proposal', proposal }),
  );
  const recompute = (body: { days: Day[]; targetDate?: string }) => run(
    () => requestApi<PathProposal>(`/learning/paths/${encodeURIComponent(path.id)}/availability`, token, { method: 'PUT', body }),
    (proposal) => {
      setPanel({ mode: 'proposal', proposal });
      // Validée d'office (elle tient et le contrat n'est pas encore engagé) : les séances sont déjà à jour.
      if (proposal.status === 'validated') { toast('Vos jours sont enregistrés : le planning est à jour.'); onChanged(); }
    },
  );
  const validate = (proposal: PathProposal) => run(
    () => requestApi<PathView>(`/learning/paths/${encodeURIComponent(path.id)}/proposal/validate`, token, { method: 'POST', body: { number: proposal.number } }),
    () => { setPanel(null); toast('Nouveau planning validé : vos séances sont à jour.'); onChanged(); },
  );
  const pause = () => run(
    () => requestApi<PathView>(`/learning/paths/${encodeURIComponent(path.id)}/pause`, token, { method: 'POST', body: {} }),
    () => { setPausing(false); toast('Parcours en pause. Reprenez quand vous voulez.'); onChanged(); },
  );
  const resume = () => run(
    () => requestApi<PathProposal>(`/learning/paths/${encodeURIComponent(path.id)}/resume`, token, { method: 'POST', body: { resumeDate: isoDay() } }),
    (proposal) => { toast('Bon retour ! Validez le planning recalculé pour reprendre.'); setPanel({ mode: 'proposal', proposal }); },
  );
  const advance = () => run(
    () => requestApi<PathView>(`/learning/paths/${encodeURIComponent(path.id)}/advance`, token, { method: 'POST', body: {} }),
    () => { toast('Niveau suivant ouvert : bonne continuation !'); onChanged(); },
  );
  const apply = (suggestion: Suggestion) => recompute({ days: suggestion.availability });
  const next = path.steps.find((step) => step.status === 'planned');

  return (
    <div className="lpa">
      <section className="lpa-hero" aria-labelledby="lpa-title">
        <div className="lpa-hero-head">
          <div>
            <p className="lpa-kicker">{languageName(path.languageId)} · {path.paused ? 'En pause' : 'Parcours en cours'}</p>
            <h2 id="lpa-title">De {levelName(path.startLevel)} à {levelName(path.targetLevel)}</h2>
            <p className="lpa-sub">Objectif le {longDate(path.targetDate)}{path.initialTargetDate !== path.targetDate ? ` (prévu d’abord le ${longDate(path.initialTargetDate)})` : ''}</p>
          </div>
          <div className="lpa-hero-badges">
            <DifficultyBadge code={path.difficulty.code} label={path.difficulty.label} />
            {permissions.canPause && !path.paused && (
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setPausing(true)}><CirclePause size={16} aria-hidden="true" /> Mettre en pause</button>
            )}
          </div>
        </div>
        <LevelTrack path={path} />
        <ul className="lpa-facts">
          <li><CalendarRange size={17} aria-hidden="true" /><span>Date cible</span><strong>{longDate(path.targetDate)}</strong></li>
          <li><Clock size={17} aria-hidden="true" /><span>Temps prévu</span><strong>{formatMinutes(capacity)} / sem.</strong></li>
          <li><Target size={17} aria-hidden="true" /><span>Nécessaire</span><strong>{formatMinutes(path.difficulty.requiredWeeklyMinutes)} / sem.</strong></li>
          <li><Handshake size={17} aria-hidden="true" /><span>Engagement</span><strong>{engagedMinutes ? `${formatMinutes(engagedMinutes)} / sem.` : 'À confirmer'}</strong></li>
        </ul>
      </section>

      {error && <div role="alert"><Callout tone="warning" title="Une action n’a pas abouti">{error}</Callout></div>}

      {path.paused && (
        <Callout tone="info" title={`Parcours en pause${path.resumeDate ? ` jusqu’au ${longDate(path.resumeDate)}` : ''}`}>
          <p>Vos séances sont suspendues. À la reprise, le planning est recalculé à partir du jour choisi.</p>
          {permissions.canPause && <button type="button" className="btn btn-primary btn-sm" disabled={busy} onClick={() => void resume()}><CirclePlay size={16} aria-hidden="true" /> Reprendre aujourd’hui</button>}
        </Callout>
      )}
      {path.proposal?.status === 'proposed' && !path.paused && (
        <Callout tone="tip" title="Un nouveau planning attend votre validation">
          <p>{path.proposal.overflowCount ? `${path.proposal.overflowCount} activité${path.proposal.overflowCount > 1 ? 's' : ''} ne tiennent pas encore : un ajustement est nécessaire.` : 'Il tient dans vos jours d’étude : relisez-le puis validez.'}</p>
          <button type="button" className="btn btn-primary btn-sm" disabled={busy} onClick={() => void openProposal()}>Voir la proposition <ArrowRight size={15} aria-hidden="true" /></button>
        </Callout>
      )}
      {permissions.canAdvance && next && (
        <Callout tone="success" title={`Examen blanc ${active?.levelCode ?? ''} remis : le niveau ${next.levelCode} peut s’ouvrir`}>
          <p>Ses séances seront planifiées à partir d’aujourd’hui, jusqu’à la date de votre contrat.</p>
          <button type="button" className="btn btn-primary btn-sm" disabled={busy} onClick={() => void advance()}><Rocket size={16} aria-hidden="true" /> Ouvrir le niveau {next.levelCode}</button>
        </Callout>
      )}

      <div className="lpa-grid">
        <Card className="lpa-days" title="Mes jours d’étude" icon={<CalendarDays size={19} />}
          description={`${path.availability.length} jour${path.availability.length > 1 ? 's' : ''} par semaine · ${formatMinutes(capacity)}`}
          action={permissions.canEditAvailability ? (
            <button type="button" className="btn btn-soft btn-sm" onClick={() => { setDays(path.availability); setPanel({ mode: 'days' }); }}>
              <CalendarCog size={16} aria-hidden="true" /> Modifier mes jours</button>
          ) : undefined}>
          <WeekSummary days={path.availability} />
          <p className="lpa-note">{contract.engaged
            ? `Réorganisez vos jours librement, tant que la semaine garde au moins ${formatMinutes(engagedMinutes ?? 0)} (engagement de votre contrat).`
            : 'Vos jours restent modifiables à tout moment : le planning se recalcule aussitôt.'}</p>
        </Card>
        <Card className="lpa-contract" title="Mon contrat" icon={<Handshake size={19} />}
          action={contract.current ? <Badge tone={contractStatusTones[contract.current.status]}>{learnerContractLabels[contract.current.status]}</Badge>
            : contract.pending ? <Badge tone={contractStatusTones[contract.pending.status]}>{learnerContractLabels[contract.pending.status]}</Badge> : undefined}>
          {pendingTeacher ? (
            <p className="lpa-contract-alert"><Hourglass size={16} aria-hidden="true" /> Votre professeur vous propose de nouvelles conditions.</p>
          ) : contract.pending ? (
            <p className="lpa-note">Proposition n° {contract.pending.number} envoyée le {shortDate(contract.pending.createdAt.slice(0, 10))} : en attente de réponse.</p>
          ) : null}
          <ul className="lpa-contract-terms">
            <li><span>Objectif</span><strong>{levelName(path.targetLevel)}</strong></li>
            <li><span>Date cible</span><strong>{longDate(path.targetDate)}</strong></li>
            <li><span>Temps minimal</span><strong>{engagedMinutes ? `${formatMinutes(engagedMinutes)} / semaine` : formatMinutes(path.weeklyMinutes) + ' / semaine'}</strong></li>
          </ul>
          <Link className="text-link" to="/espace/contrat">{pendingTeacher ? 'Répondre à la proposition' : 'Voir mon contrat'} <ArrowRight size={15} aria-hidden="true" /></Link>
        </Card>
      </div>

      <Card flush className="lpa-sessions" title="Mes séances" icon={<ListChecks size={19} />}
        description={`${path.sessions.filter((session) => session.status === 'completed').length} sur ${path.sessions.length} terminées${path.steps.length > 1 ? ' · les niveaux suivants s’ouvrent l’un après l’autre' : ''}`}
        action={levelsWithSessions.length > 1 ? (
          <Segmented label="Niveau affiché" value={filter} onChange={setFilter}
            options={[...levelsWithSessions.map((code) => ({ value: code, label: code })), { value: 'all', label: 'Tous' }]} />
        ) : undefined}>
        <PathSessionsByWeek sessions={sessions} emptyText={path.status === 'draft' ? 'Vos séances apparaîtront dès la validation de votre planning.' : 'Aucune séance pour ce niveau.'} />
      </Card>

      {panel?.mode === 'days' && (
        <Drawer wide title="Modifier mes jours" description={`Objectif ${path.targetLevel} ${ofLanguage(languageName(path.languageId))} le ${longDate(path.targetDate)}`}
          onClose={() => setPanel(null)}
          footer={<>
            <button type="button" className="btn btn-ghost" onClick={() => setPanel(null)}>Annuler</button>
            <button type="button" className="btn btn-primary" disabled={busy || !days.length || (engagedMinutes !== null && weeklyCapacity(days) < engagedMinutes)}
              onClick={() => void recompute({ days })}>
              {busy ? <LoaderCircle size={17} className="ob-spin" aria-hidden="true" /> : <CalendarCog size={17} aria-hidden="true" />} Recalculer mon planning
            </button>
          </>}>
          <DayPlanner initial={path.availability} required={path.difficulty.requiredWeeklyMinutes} commitment={engagedMinutes} onChange={setDays} />
          {error && <div role="alert"><Callout tone="warning" title="Planning non recalculé">{error}</Callout></div>}
        </Drawer>
      )}
      {panel?.mode === 'proposal' && (
        <Drawer wide title={`Proposition n° ${panel.proposal.number}`} description="Relisez le planning recalculé puis validez-le pour mettre vos séances à jour."
          onClose={() => setPanel(null)}>
          <PathProposalView proposal={panel.proposal} busy={busy} onApply={(suggestion) => void apply(suggestion)}
            onEditDays={permissions.canEditAvailability ? () => setPanel({ mode: 'days' }) : undefined}
            onValidate={() => void validate(panel.proposal)} validateLabel="Valider ce planning" editDaysLabel="Modifier mes jours" />
          {error && <div role="alert"><Callout tone="warning" title="Validation impossible">{error}</Callout></div>}
        </Drawer>
      )}
      {pausing && (
        <Dialog title="Mettre votre parcours en pause ?" onClose={() => setPausing(false)}>
          <p className="lpa-dialog-text">Vos séances sont suspendues jusqu’à votre retour. À la reprise, le planning est recalculé ; la date cible peut alors devoir être repoussée.</p>
          <div className="lpa-dialog-actions">
            <button type="button" className="btn btn-ghost" onClick={() => setPausing(false)}>Continuer mon parcours</button>
            <button type="button" className="btn btn-primary" disabled={busy} onClick={() => void pause()}><CirclePause size={16} aria-hidden="true" /> Mettre en pause</button>
          </div>
        </Dialog>
      )}
      {path.status === 'completed' && <Callout tone="success" title="Parcours terminé"><CheckCircle2 size={14} aria-hidden="true" /> Bravo, votre objectif est atteint !</Callout>}
    </div>
  );
}
