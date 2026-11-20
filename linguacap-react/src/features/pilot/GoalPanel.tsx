import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, PauseCircle, PlayCircle, Target } from 'lucide-react';
import { Badge } from '../../components/ui';
import { requestApi } from '../../integration/api';
import type { Enrollment } from './LearnerSession';
import { AvailabilityEditor, ProposalView, type Day, type Proposal, type Suggestion } from './Planning';

export interface Goal {
  startLevel: string;
  targetLevel: string;
  startDate: string;
  targetDate: string | null;
  initialTargetDate: string | null;
  template: string;
  status: 'preparing' | 'active' | 'paused' | 'awaiting_assessment' | 'awaiting_grading' | 'validated' | 'to_consolidate';
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

const competenceNames: Record<string, string> = {
  lecture: 'Lecture', ecoute: 'Écoute', 'expression-ecrite': 'Expression écrite', 'expression-orale': 'Expression orale',
};
const dateFormat = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' });

function showDate(value: string | null) {
  if (!value) return '—';
  const [year, month, day] = value.slice(0, 10).split('-').map(Number);
  return dateFormat.format(new Date(year, month - 1, day));
}

function errorText(error: unknown) {
  return error instanceof Error ? error.message : 'Cette action est temporairement indisponible.';
}

function today(offset = 0) {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
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
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(false);
  const id = encodeURIComponent(enrollment.id);
  const learner = viewer === 'learner';
  const canPlan = !learner || !goal.accompanied;

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
    setNotice('');
    try {
      const result = await action();
      if (result && typeof result === 'object' && 'sessions' in result && 'weeks' in result) setProposal(result as Proposal);
      setNotice(message);
      onChanged();
    } catch (failure) {
      setError(errorText(failure));
    } finally {
      setBusy(false);
    }
  }

  const saveAvailability = (days: Day[], targetDate?: string) => run(
    () => requestApi<Proposal>(`/learning/enrollments/${id}/availability`, token, { method: 'PUT', body: { days, ...(targetDate ? { targetDate } : {}) } }),
    'Disponibilités enregistrées : une nouvelle proposition a été calculée.');
  const apply = (suggestion: Suggestion) => saveAvailability(suggestion.availability, suggestion.targetDate);
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
  return (
    <section className="panel stack" aria-labelledby={`goal-${enrollment.id}`}>
      <div className="panel-heading">
        <h2 id={`goal-${enrollment.id}`}><Target size={20} aria-hidden="true" /> {learner ? 'Mon objectif' : 'Objectif'} · {goal.targetLevel}</h2>
        <Badge tone={status.tone}>{status.label}</Badge>
      </div>
      <dl className="goal-facts">
        <div><dt>Point de départ</dt><dd>{goal.startLevel === 'A0' ? 'Débutant' : goal.startLevel}</dd></div>
        <div><dt>Début</dt><dd>{showDate(goal.startDate)}</dd></div>
        <div><dt>Date cible</dt><dd>{showDate(goal.targetDate)}</dd></div>
        <div><dt>Rythme</dt><dd>{goal.template === 'intensive' ? 'Intensif' : goal.template === 'standard' ? 'Standard' : 'Personnalisé'}</dd></div>
      </dl>
      {goal.initialTargetDate && goal.targetDate !== goal.initialTargetDate && (
        <p className="muted">Date cible initiale : {showDate(goal.initialTargetDate)}</p>
      )}
      {goal.successCriteria && <p><strong>Critères de réussite.</strong> {goal.successCriteria}</p>}
      {goal.expectedCompetences.length > 0 && (
        <p className="muted">Compétences évaluées : {goal.expectedCompetences.map((item) => competenceNames[item] ?? item).join(', ')}</p>
      )}
      {goal.prerequisiteLevel && !goal.prerequisiteMet && (
        <p className="inline-message warning" role="status">
          Le niveau {goal.prerequisiteLevel} est requis : il doit être validé dans LinguaCap ou confirmé par le diagnostic.
        </p>
      )}

      {goal.diagnosticLessonId && (
        <div className="stack">
          <h3><ClipboardList size={18} aria-hidden="true" /> Diagnostic initial</h3>
          {!diagnosticDone ? (
            learner
              ? <Link className="btn btn-outline" to="/espace/diagnostic">Passer le diagnostic</Link>
              : <p className="muted">L’élève n’a pas encore passé le diagnostic.</p>
          ) : (
            <p className="muted">
              Modules réussis au diagnostic : {(goal.diagnosticModules ?? []).length ? goal.diagnosticModules?.join(', ') : 'aucun'}
              {goal.diagnosticPrerequisite !== null && ` · prérequis ${goal.diagnosticPrerequisite ? 'réussi' : 'à retravailler'}`}
              {goal.startingPointConfirmedAt ? ' · point de départ confirmé' : goal.accompanied ? ' · en attente de confirmation du professeur' : ''}
            </p>
          )}
          {!learner && diagnosticDone && !goal.startingPointConfirmedAt && (
            <form className="stack" onSubmit={confirmStartingPoint} aria-label="Confirmer le point de départ">
              {(goal.diagnosticModules ?? []).map((module) => (
                <label key={module}><input type="checkbox" name={`module-${module}`} defaultChecked /> Module « {module} » acquis</label>
              ))}
              {goal.prerequisiteLevel && (
                <label><input type="checkbox" name="prerequisite" defaultChecked={goal.diagnosticPrerequisite === true}
                  disabled={goal.diagnosticPrerequisite !== true} /> Acquis {goal.prerequisiteLevel} confirmés</label>
              )}
              <button className="btn btn-outline" type="submit" disabled={busy}>Confirmer le point de départ</button>
            </form>
          )}
          {learner && awaitingConfirmation && <p className="muted">Votre professeur va confirmer votre point de départ.</p>}
        </div>
      )}

      {notice && <p className="inline-message" role="status">{notice}</p>}
      {error && <p className="inline-message warning" role="alert">{error}</p>}

      {goal.status === 'paused' ? (
        <div className="stack">
          <p><PauseCircle size={16} aria-hidden="true" /> Parcours en pause{goal.resumeDate ? ` · reprise prévue le ${showDate(goal.resumeDate)}` : ''}.</p>
          {canPlan && (
            <form className="accounts-row" onSubmit={resume}>
              <label>Date de reprise<input type="date" name="resumeDate" required min={today()} defaultValue={goal.resumeDate ?? today(7)} /></label>
              <button className="btn btn-outline" type="submit" disabled={busy}><PlayCircle size={16} aria-hidden="true" /> Préparer la reprise</button>
            </form>
          )}
        </div>
      ) : canPlan && (goal.status === 'active' || goal.status === 'preparing') && (
        <button className="btn btn-outline" type="button" onClick={() => void pause()} disabled={busy}>
          <PauseCircle size={16} aria-hidden="true" /> Mettre en pause
        </button>
      )}

      {proposal && (
        <div className="stack">
          <h3>{proposal.status === 'validated' ? 'Planning en vigueur' : 'Proposition de planning'}</h3>
          {proposal.status === 'proposed' && !proposal.validatable && proposal.overflowCount === 0 && goal.prerequisiteMet && (
            <p className="muted">{goal.accompanied ? 'Le professeur référent valide cette proposition.' : 'L’élève valide cette proposition.'}</p>
          )}
          <ProposalView proposal={proposal} busy={busy} onApply={apply} onValidate={() => void validate()} />
        </div>
      )}

      {goal.status !== 'paused' && (
        <div className="stack">
          <button type="button" className="text-link" onClick={() => setEditing((value) => !value)} aria-expanded={editing}>
            {editing ? 'Masquer les disponibilités' : 'Modifier les disponibilités'}
          </button>
          {editing && <AvailabilityEditor value={enrollment.availability} targetDate={goal.targetDate} busy={busy}
            onSave={(days, targetDate) => void saveAvailability(days, targetDate)} />}
        </div>
      )}
    </section>
  );
}
