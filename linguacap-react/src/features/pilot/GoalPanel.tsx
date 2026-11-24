import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen, CalendarClock, CalendarRange, Check, CirclePause, CirclePlay, ClipboardList, Headphones, Hourglass, Mic, PencilLine,
  SlidersHorizontal, Target, TriangleAlert, Trophy,
} from 'lucide-react';
import { Badge, Dialog } from '../../components/ui';
import { Callout, Card, Drawer, Facts, SkeletonCard, Timeline, useToast, type TimelineEntry } from '../../design/kit';
import { requestApi } from '../../integration/api';
import { pilotToday } from '../../integration/pilot-day';
import type { Enrollment } from './LearnerSession';
import { daysFromToday, localDate } from './learner-calendar';
import { AvailabilityEditor, hours, ProposalView, weekdayNames, type Day, type Proposal, type Suggestion } from './Planning';
import './learner-planning.css';

export interface Goal {
  startLevel: string;
  targetLevel: string;
  startDate: string;
  targetDate: string | null;
  initialTargetDate: string | null;
  template: string;
  status: 'preparing' | 'active' | 'paused' | 'awaiting_assessment' | 'awaiting_grading' | 'validated' | 'to_consolidate';
  /** Début de la pause en cours (null hors pause). */
  pausedAt?: string | null;
  resumeDate: string | null;
  successCriteria: string | null;
  expectedCompetences: string[];
  prerequisiteLevel: string | null;
  prerequisiteMet: boolean;
  acquiredModules: string[];
  diagnosticLessonId: string | null;
  diagnosticAttemptId: string | null;
  diagnosticModules: string[] | null;
  diagnosticPrerequisite: boolean | null;
  startingPointConfirmedAt: string | null;
  accompanied: boolean;
}

export type PlannedEnrollment = Enrollment & {
  goal: Goal;
  availability: Day[];
  proposal: { number: number; status: string; overflowCount: number; validatable: boolean } | null;
  supersededSessions: number;
};

export const goalStatus: Record<Goal['status'], { label: string; tone: 'blue' | 'green' | 'amber' | 'neutral' | 'violet' }> = {
  preparing: { label: 'En préparation', tone: 'violet' },
  active: { label: 'En cours', tone: 'blue' },
  paused: { label: 'En pause', tone: 'neutral' },
  awaiting_assessment: { label: 'En attente d’évaluation', tone: 'amber' },
  awaiting_grading: { label: 'En attente de correction', tone: 'amber' },
  validated: { label: 'Validé', tone: 'green' },
  to_consolidate: { label: 'À consolider', tone: 'amber' },
};

const competences: Record<string, { name: string; icon: ReactNode }> = {
  lecture: { name: 'Lecture', icon: <BookOpen size={15} aria-hidden="true" /> },
  ecoute: { name: 'Écoute', icon: <Headphones size={15} aria-hidden="true" /> },
  'expression-ecrite': { name: 'Expression écrite', icon: <PencilLine size={15} aria-hidden="true" /> },
  'expression-orale': { name: 'Expression orale', icon: <Mic size={15} aria-hidden="true" /> },
};
const dateFormat = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' });

/**
 * Diagnostic initial proposé : le parcours en a un et l'élève ne débute pas. Un débutant (départ A0 du niveau ou du
 * parcours) a un parcours déjà adapté, sans diagnostic ni question supplémentaire (EVO-038) : le serveur ne renvoie
 * alors pas de diagnosticLessonId et refuse le diagnostic (409).
 */
export function diagnosticOffered(goal: Pick<Goal, 'startLevel' | 'diagnosticLessonId'>, pathStartLevel?: string | null) {
  return Boolean(goal.diagnosticLessonId) && goal.startLevel !== 'A0' && pathStartLevel !== 'A0';
}

export function showDate(value: string | null) {
  if (!value) return '—';
  return dateFormat.format(localDate(value));
}

export function paceLabel(template: string) {
  return template === 'intensive' ? 'Intensif' : template === 'standard' ? 'Standard' : 'Personnalisé';
}

function errorText(error: unknown) {
  return error instanceof Error ? error.message : 'Cette action est temporairement indisponible.';
}

/** Jour du pilote (fuseau du serveur), décalé de quelques jours : pause, reprise et date cible se comparent à ce jour. */
function today(offset = 0) {
  return pilotToday(offset);
}

function LevelPath({ from, to, done, total }: { from: string; to: string; done: number; total: number }) {
  const percent = total ? Math.round((done / total) * 100) : 0;
  const start = from === 'A0' ? 'Débutant' : from;
  return (
    <div className="lp-path">
      <div className="lp-path-node"><span>{from}</span><small>{from === 'A0' ? 'Débutant' : 'Point de départ'}</small></div>
      <div className="lp-path-line">
        <div className="lp-path-track" role="progressbar" aria-label={`Progression de ${start} vers ${to}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent}>
          <span style={{ width: `${percent}%` }} />
        </div>
        <small><strong>{percent} %</strong> du parcours · {done} séance{done > 1 ? 's' : ''} terminée{done > 1 ? 's' : ''} sur {total}</small>
      </div>
      <div className="lp-path-node is-target"><span>{to}</span><small>Objectif</small></div>
    </div>
  );
}

/**
 * Objectif et planning d'un parcours, pour l'élève (role learner) ou pour son professeur et l'administration.
 * Les actions proposées suivent les règles du serveur : il refuse toujours ce qui n'est pas permis.
 */
export function GoalPanel({ enrollment, token, viewer, onChanged }: {
  enrollment: PlannedEnrollment;
  token: string;
  viewer: 'learner' | 'staff';
  onChanged: () => void;
}) {
  const { goal } = enrollment;
  const toast = useToast();
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(false);
  const [confirmPause, setConfirmPause] = useState(false);
  const id = encodeURIComponent(enrollment.id);
  const learner = viewer === 'learner';
  const canPlan = !learner || !goal.accompanied;
  // Inscription rattachée à un parcours démarré : la date cible relève du contrat (un changement direct répond 409).
  const pathLinked = Boolean((enrollment as PlannedEnrollment & { pathId?: string | null }).pathId);

  useEffect(() => {
    let active = true;
    if (!enrollment.proposal) return;
    requestApi<Proposal>(`/learning/enrollments/${id}/proposal`, token).then(
      (data) => { if (active) setProposal(data); },
      (failure: unknown) => { if (active) setError(errorText(failure)); },
    );
    return () => { active = false; };
  }, [id, token, enrollment.proposal]);

  async function run(action: () => Promise<unknown>, message: string) {
    setBusy(true);
    setError('');
    try {
      const result = await action();
      if (result && typeof result === 'object' && 'sessions' in result && 'weeks' in result) setProposal(result as Proposal);
      toast(message);
      onChanged();
      return true;
    } catch (failure) {
      setError(errorText(failure));
      return false;
    } finally {
      setBusy(false);
    }
  }

  const saveAvailability = async (days: Day[], targetDate?: string) => {
    const saved = await run(
      () => requestApi<Proposal>(`/learning/enrollments/${id}/availability`, token, { method: 'PUT', body: { days, ...(targetDate ? { targetDate } : {}) } }),
      'Disponibilités enregistrées : une nouvelle proposition a été calculée.');
    if (saved) setEditing(false);
  };
  const apply = (suggestion: Suggestion) => saveAvailability(suggestion.availability, pathLinked ? undefined : suggestion.targetDate);
  const shownProposal = proposal && pathLinked
    ? { ...proposal, suggestions: proposal.suggestions.filter((suggestion) => suggestion.kind !== 'target_date'
      && !(suggestion as Suggestion & { requiresAmendment?: boolean }).requiresAmendment) }
    : proposal;
  const validate = () => proposal && run(
    () => requestApi(`/learning/enrollments/${id}/proposal/validate`, token, { method: 'POST', body: { number: proposal.number } }),
    'Planning validé : les séances sont publiées.');
  const pause = () => run(() => requestApi(`/learning/enrollments/${id}/pause`, token, { method: 'POST' }), 'Parcours mis en pause.');

  function resume(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const resumeDate = String(new FormData(event.currentTarget).get('resumeDate'));
    void run(() => requestApi<Proposal>(`/learning/enrollments/${id}/resume`, token, { method: 'POST', body: { resumeDate } }),
      'Reprise préparée : validez le nouveau planning pour republier les séances.');
  }

  function confirmStartingPoint(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const acquiredModules = (goal.diagnosticModules ?? []).filter((module) => form.get(`module-${module}`) === 'on');
    void run(() => requestApi(`/learning/enrollments/${id}/starting-point`, token, {
      method: 'PUT', body: { acquiredModules, prerequisiteMet: form.get('prerequisite') === 'on' },
    }), 'Point de départ confirmé : la proposition tient compte des acquis.');
  }

  const status = goalStatus[goal.status];
  const diagnosticDone = Boolean(goal.diagnosticAttemptId);
  const awaitingConfirmation = diagnosticDone && goal.accompanied && !goal.startingPointConfirmedAt;
  const sessions = enrollment.sessions;
  const complete = sessions.filter((session) => session.status === 'completed').length;
  const remaining = goal.targetDate ? daysFromToday(localDate(goal.targetDate)) : null;
  const targetChanged = Boolean(goal.initialTargetDate && goal.targetDate !== goal.initialTargetDate);
  const weekly = enrollment.availability.reduce((sum, day) => sum + day.sessions * day.minutes, 0);
  const modules = goal.diagnosticModules ?? [];
  const headingId = `goal-${enrollment.id}`;

  const diagnosticSteps: TimelineEntry[] = diagnosticDone ? [
    {
      id: 'done', tone: 'success', icon: <Check size={15} aria-hidden="true" />, title: 'Diagnostic passé',
      meta: modules.length
        ? <span className="lp-modules">Modules réussis : {modules.map((module) => <Badge key={module}>{module}</Badge>)}</span>
        : 'Aucun module réussi',
    },
    ...(goal.diagnosticPrerequisite !== null ? [{
      id: 'prerequisite', tone: goal.diagnosticPrerequisite ? 'success' as const : 'warning' as const,
      icon: goal.diagnosticPrerequisite ? <Check size={15} aria-hidden="true" /> : <TriangleAlert size={14} aria-hidden="true" />,
      title: goal.diagnosticPrerequisite ? 'Prérequis réussi' : 'Prérequis à retravailler',
    }] : []),
    ...(goal.startingPointConfirmedAt ? [{
      id: 'confirmed', tone: 'success' as const, icon: <Check size={15} aria-hidden="true" />, title: 'Point de départ confirmé',
      meta: `Le ${showDate(goal.startingPointConfirmedAt)}`,
    }] : goal.accompanied ? [{
      id: 'waiting', tone: 'warning' as const, icon: <Hourglass size={14} aria-hidden="true" />, title: 'En attente de confirmation du professeur',
      meta: learner && awaitingConfirmation ? 'Votre professeur va confirmer votre point de départ.' : undefined,
    }] : []),
  ] : [];

  return (
    <section className="lp-goal" aria-labelledby={headingId}>
      {error && !editing && <div role="alert" className="lp-alert"><Callout tone="warning" title="Action impossible">{error}</Callout></div>}
      <div className="lp-goal-grid lc-stagger">
        <article className="kit-card lp-goal-card">
          <header className="kit-card-head">
            <span className="kit-card-icon" aria-hidden="true"><Target size={19} /></span>
            <div>
              <h2 id={headingId}>{learner ? 'Mon objectif' : 'Objectif'} · {goal.targetLevel}</h2>
              <p>{remaining === null ? 'Sans date cible' : remaining > 0 ? `Encore ${remaining} jour${remaining > 1 ? 's' : ''} avant la date cible` : remaining === 0 ? 'Date cible aujourd’hui' : 'Date cible dépassée'}</p>
            </div>
            <div className="kit-card-action"><Badge tone={status.tone}>{status.label}</Badge></div>
          </header>
          <LevelPath from={goal.startLevel} to={goal.targetLevel} done={complete} total={sessions.length} />
          <Facts items={[
            { label: 'Point de départ', value: goal.startLevel === 'A0' ? 'Débutant' : goal.startLevel },
            { label: 'Début', value: showDate(goal.startDate) },
            { label: 'Date cible', value: <>{showDate(goal.targetDate)}{targetChanged && <small className="lp-initial">initialement {showDate(goal.initialTargetDate)}</small>}</> },
            { label: 'Rythme', value: paceLabel(goal.template) },
          ]} />
          {goal.successCriteria && (
            <div className="lp-criteria">
              <span className="lp-criteria-icon" aria-hidden="true"><Trophy size={18} /></span>
              <div><span className="lp-label">Critères de réussite</span><p>{goal.successCriteria}</p></div>
            </div>
          )}
          {goal.expectedCompetences.length > 0 && (
            <div className="lp-competences">
              <span className="lp-label">Compétences évaluées</span>
              <ul>{goal.expectedCompetences.map((item) => <li key={item}>{competences[item]?.icon}{competences[item]?.name ?? item}</li>)}</ul>
            </div>
          )}
          {goal.prerequisiteLevel && !goal.prerequisiteMet && (
            <div role="status">
              <Callout tone="warning" title={`Niveau ${goal.prerequisiteLevel} requis`}>
                Il doit être validé dans LinguaCap ou confirmé par le diagnostic.
              </Callout>
            </div>
          )}
          {goal.status === 'paused' ? (
            <div className="lp-paused">
              <p className="lp-paused-state"><CirclePause size={20} aria-hidden="true" />
                <span><strong>Parcours en pause</strong>{goal.resumeDate && <small>Reprise prévue le {showDate(goal.resumeDate)}</small>}</span></p>
              {canPlan && (
                <form className="lp-resume" onSubmit={resume}>
                  <label>Date de reprise<input type="date" name="resumeDate" required min={today()} defaultValue={goal.resumeDate ?? today(7)} /></label>
                  <button className="btn btn-primary" type="submit" disabled={busy}><CirclePlay size={17} aria-hidden="true" /> Préparer la reprise</button>
                </form>
              )}
            </div>
          ) : canPlan && (goal.status === 'active' || goal.status === 'preparing') && (
            <div className="lp-actions">
              <button className="btn btn-outline btn-sm" type="button" onClick={() => setConfirmPause(true)} disabled={busy}>
                <CirclePause size={16} aria-hidden="true" /> Mettre en pause
              </button>
            </div>
          )}
        </article>

        <div className="lp-goal-side">
          {diagnosticOffered(goal) && (
            <Card className="lp-diagnostic" title="Diagnostic initial" icon={<ClipboardList size={19} />}
              action={<Badge tone={diagnosticDone ? 'green' : 'amber'}>{diagnosticDone ? 'Passé' : 'À passer'}</Badge>}>
              {!diagnosticDone ? (
                learner ? (
                  <div className="lp-diagnostic-todo">
                    <p>Quelques questions pour adapter le parcours à ce que vous savez déjà.</p>
                    <Link className="btn btn-primary btn-sm" to="/espace/diagnostic">Passer le diagnostic</Link>
                  </div>
                ) : <p className="lp-hint"><Hourglass size={15} aria-hidden="true" /> L’élève n’a pas encore passé le diagnostic.</p>
              ) : <Timeline items={diagnosticSteps} />}
              {!learner && diagnosticDone && !goal.startingPointConfirmedAt && (
                <form className="lp-confirm" onSubmit={confirmStartingPoint} aria-label="Confirmer le point de départ">
                  {modules.map((module) => (
                    <label key={module} className="lp-check"><input type="checkbox" name={`module-${module}`} defaultChecked /> Module « {module} » acquis</label>
                  ))}
                  {goal.prerequisiteLevel && (
                    <label className="lp-check"><input type="checkbox" name="prerequisite" defaultChecked={goal.diagnosticPrerequisite === true}
                      disabled={goal.diagnosticPrerequisite !== true} /> Acquis {goal.prerequisiteLevel} confirmés</label>
                  )}
                  <button className="btn btn-primary btn-sm" type="submit" disabled={busy}>Confirmer le point de départ</button>
                </form>
              )}
            </Card>
          )}

          <Card className="lp-availability" title={learner ? 'Mes disponibilités' : 'Disponibilités'} icon={<CalendarClock size={19} />}
            description={weekly ? `${hours(weekly)} d’étude par semaine` : 'Aucune disponibilité renseignée'}>
            <ul className="lp-avail">
              {weekdayNames.map((name, index) => {
                const day = enrollment.availability.find((item) => item.weekday === index + 1);
                return (
                  <li key={name} className={day ? 'is-on' : undefined}>
                    <span className="lp-avail-day" aria-hidden="true">{name.slice(0, 3)}</span>
                    <strong aria-hidden="true">{day ? `${day.sessions}×` : '—'}</strong>
                    <small aria-hidden="true">{day ? `${day.minutes} min` : 'repos'}</small>
                    <span className="sr-only">{name} : {day ? `${day.sessions} séance${day.sessions > 1 ? 's' : ''} de ${day.minutes} minutes` : 'repos'}</span>
                  </li>
                );
              })}
            </ul>
            {!enrollment.proposal && <p className="lp-hint">Indiquez les jours et la durée des séances pour obtenir une proposition de planning.</p>}
            {goal.status !== 'paused' && (
              <button type="button" className="btn btn-soft btn-sm lp-edit" onClick={() => { setError(''); setEditing(true); }} aria-haspopup="dialog">
                <SlidersHorizontal size={16} aria-hidden="true" /> Modifier les disponibilités
              </button>
            )}
          </Card>
        </div>

        {enrollment.proposal && (
          <Card className="lp-proposal-card" icon={<CalendarRange size={19} />}
            title={proposal?.status === 'validated' ? 'Planning en vigueur' : 'Proposition de planning'}
            description={proposal ? `Version ${proposal.number}` : undefined}
            action={proposal && <Badge tone={proposal.status === 'validated' ? 'green' : proposal.overflowCount === 0 ? 'blue' : 'amber'}>
              {proposal.status === 'validated' ? 'Planning validé' : proposal.overflowCount === 0 ? 'Proposition à valider' : 'Programme trop chargé'}</Badge>}>
            {!proposal ? (!error && <SkeletonCard lines={4} label="Chargement du planning…" />) : (
              <>
                {proposal.status === 'proposed' && !proposal.validatable && proposal.overflowCount === 0 && goal.prerequisiteMet && (
                  <Callout tone="info">{goal.accompanied ? 'Le professeur référent valide cette proposition.' : 'L’élève valide cette proposition.'}</Callout>
                )}
                <ProposalView proposal={shownProposal ?? proposal} busy={busy} onApply={(suggestion) => void apply(suggestion)} onValidate={() => void validate()} />
              </>
            )}
          </Card>
        )}
      </div>

      {editing && (
        <Drawer title={learner ? 'Mes disponibilités' : 'Disponibilités de l’élève'} onClose={() => setEditing(false)}
          description="Choisissez les jours et la durée des séances : une nouvelle proposition de planning sera calculée.">
          {error && <div role="alert"><Callout tone="warning" title="Enregistrement impossible">{error}</Callout></div>}
          {pathLinked && (
            <Callout tone="info">La date cible fait partie du contrat : pour la changer, proposez un avenant depuis {learner ? 'votre contrat' : 'l’onglet « Parcours »'}.</Callout>
          )}
          <AvailabilityEditor value={enrollment.availability} targetDate={pathLinked ? undefined : goal.targetDate} busy={busy}
            onSave={(days, targetDate) => void saveAvailability(days, targetDate)} />
        </Drawer>
      )}
      {confirmPause && (
        <Dialog title="Mettre le parcours en pause ?" onClose={() => setConfirmPause(false)}>
          <p className="lp-dialog-text">Le parcours sera suspendu. Vous pourrez ensuite choisir une date de reprise : un nouveau planning sera alors proposé.</p>
          <div className="lp-dialog-actions">
            <button className="btn btn-ghost" type="button" onClick={() => setConfirmPause(false)}>Annuler</button>
            <button className="btn btn-primary" type="button" onClick={() => { setConfirmPause(false); void pause(); }}>
              <CirclePause size={16} aria-hidden="true" /> Mettre en pause
            </button>
          </div>
        </Dialog>
      )}
    </section>
  );
}
