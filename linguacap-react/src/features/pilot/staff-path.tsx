/**
 * Onglet « Parcours » de la fiche élève (professeur, administration) : frise des niveaux, planning et jours,
 * contrat et historique, test de niveau, cours ajoutés, passage au niveau suivant, pause et reprise.
 * Il remplace l'ancienne attribution d'un parcours : l'élève construit son parcours, le professeur l'ajuste.
 */
import { useState, type FormEvent, type ReactNode } from 'react';
import {
  BookOpen, BookPlus, CalendarRange, Check, CirclePause, CirclePlay, ClipboardList, Flag, Handshake, History, Hourglass, PencilLine,
  Route, SkipForward, SlidersHorizontal, Trash2,
} from 'lucide-react';
import { Badge, Dialog, EmptyState, ProgressBar, type BadgeTone } from '../../components/ui';
import { Callout, Card, Drawer, Facts, SkeletonCard, useToast } from '../../design/kit';
import { requestApi } from '../../integration/api';
import { languageName } from '../../domain/languages';
import {
  additionPlacementLabels, additionStatusLabels, difficultyTones, formatMinutes, levelLabel, pathStatusLabels,
  pathStepStatusLabels, weeklyCapacity,
  type Addition, type AdditionRemoved, type Contract, type ContractTerms, type Day, type PathProposal, type PathStep, type PathView,
} from '../../integration/v2';
import { AvailabilityEditor } from './Planning';
import { PathProposalView } from '../onboarding/path-proposal';
import {
  ContractDecision, ContractHistory, DaysRow, PlacementLoader, TermsFacts, errorText, formatDay, formatShortDay, startLabel,
  todayIso, useLoad,
} from './staff-contracts';
import { goalStatusOf, plural, StaffError } from './staff-kit';
import { AddCourseDrawer } from './staff-add-course';

/** Conditions en vigueur reconstituées depuis le parcours (avant tout contrat accepté). */
export function pathTerms(path: PathView): ContractTerms {
  return {
    startLevel: path.startLevel, targetLevel: path.targetLevel, startDate: path.startDate, targetDate: path.targetDate,
    weeklyMinutes: path.weeklyMinutes, availability: path.availability, requiredMinutes: path.requiredMinutes, difficulty: path.difficulty,
  };
}

const stepTones: Record<PathStep['status'], BadgeTone> = { planned: 'neutral', active: 'blue', completed: 'green', withdrawn: 'neutral' };
const decisionLabels: Record<'validated' | 'to_consolidate', { label: string; tone: BadgeTone }> = {
  validated: { label: 'Niveau validé', tone: 'green' }, to_consolidate: { label: 'À consolider', tone: 'amber' },
};

/** Frise des niveaux : point de départ, chaque niveau du parcours, objectif. */
function LevelTrack({ path }: { path: PathView }) {
  const steps = path.steps.filter((step) => step.status !== 'withdrawn').sort((a, b) => a.position - b.position);
  return (
    <ol className="spx-track lc-stagger" aria-label="Niveaux du parcours">
      <li className="spx-node is-start">
        <span className="spx-node-dot">{path.startLevel}</span>
        <span className="spx-node-text"><strong>{startLabel(path.startLevel) === 'Débutant' ? 'Débutant' : 'Départ'}</strong><small>{formatShortDay(path.startDate)}</small></span>
      </li>
      {steps.map((step) => {
        const percent = step.sessionsTotal ? Math.round((step.sessionsCompleted / step.sessionsTotal) * 100) : step.status === 'completed' ? 100 : 0;
        const [, title] = levelLabel(step.levelCode).split(' · ');
        const goal = step.status === 'active' && step.goalStatus ? goalStatusOf(step.goalStatus) : null;
        return (
          <li key={step.id} className={`spx-step is-${step.status}`}>
            <div className="spx-step-head">
              <span className="spx-step-code">{step.status === 'completed' ? <Check size={18} strokeWidth={3} aria-hidden="true" /> : step.levelCode}</span>
              <span className="spx-step-title"><strong>{step.levelCode} · {title ?? step.levelTitle}</strong><small>Version {step.trackVersionNumber}</small></span>
            </div>
            <span className="staff-tags">
              <Badge tone={stepTones[step.status]}>{pathStepStatusLabels[step.status]}</Badge>
              {goal && goal.label !== pathStepStatusLabels.active && <Badge tone={goal.tone}>{goal.label}</Badge>}
              {step.finalDecision && <Badge tone={decisionLabels[step.finalDecision].tone}>{decisionLabels[step.finalDecision].label}</Badge>}
            </span>
            <p className="spx-step-dates">{step.firstDate ? `${formatShortDay(step.firstDate)} → ${formatShortDay(step.lastDate)}` : 'Dates à venir'}</p>
            <ProgressBar value={percent} label={`Niveau ${step.levelCode} : ${percent} % des séances terminées`} />
            <small className="spx-step-meta">{step.sessionsCompleted} / {plural(step.sessionsTotal, 'séance', 'séances')} · {formatMinutes(step.plannedMinutes)}</small>
          </li>
        );
      })}
      <li className="spx-node is-target">
        <span className="spx-node-dot"><Flag size={17} aria-hidden="true" /></span>
        <span className="spx-node-text"><strong>Objectif {path.targetLevel}</strong><small>{formatShortDay(path.targetDate)}</small></span>
      </li>
    </ol>
  );
}

function PlanningCard({ path, token, onChanged }: { path: PathView; token: string; onChanged: () => void }) {
  const toast = useToast();
  const pid = encodeURIComponent(path.id);
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const proposal = useLoad<PathProposal | null>(
    () => path.proposal ? requestApi<PathProposal>(`/learning/paths/${pid}/proposal`, token) : Promise.resolve(null),
    [pid, token, path.proposal?.number, path.proposal?.status, path.validatedRevision],
  );
  const data = proposal.data ?? null;
  const capacity = weeklyCapacity(path.availability);
  const engaged = path.contract.engaged;

  async function run(action: () => Promise<unknown>, message: string) {
    setBusy(true);
    setError('');
    try {
      await action();
      toast(message);
      setEditing(false);
      onChanged();
    } catch (failure) {
      setError(errorText(failure));
    } finally {
      setBusy(false);
    }
  }
  const saveDays = (days: Day[]) => run(
    () => requestApi<PathProposal>(`/learning/paths/${pid}/availability`, token, { method: 'PUT', body: { days } }),
    'Jours enregistrés : un nouveau planning est proposé.');
  const validate = () => data && run(
    () => requestApi<PathView>(`/learning/paths/${pid}/proposal/validate`, token, { method: 'POST', body: { number: data.number } }),
    'Planning validé : les séances de l’élève sont à jour.');
  const status = !data ? null : data.status === 'validated'
    ? { label: 'Planning en vigueur', tone: 'green' as const }
    : data.overflowCount ? { label: 'Programme trop chargé', tone: 'amber' as const } : { label: 'Proposition à valider', tone: 'blue' as const };

  return (
    <Card title="Planning" icon={<CalendarRange size={18} />} className="spx-planning"
      description={data ? `Version ${data.number}${data.status === 'validated' ? '' : ` · proposée le ${formatDay(data.createdAt)}`}` : undefined}
      action={status && <Badge tone={status.tone}>{status.label}</Badge>}>
      <div className="spx-days">
        <div className="spx-days-head">
          <span><strong>{formatMinutes(capacity)}</strong> par semaine{engaged ? <> · engagement <strong>{formatMinutes(path.weeklyMinutes)}</strong></> : null}</span>
          {path.permissions.canEditAvailability && (
            <button type="button" className="btn btn-soft btn-sm" onClick={() => { setError(''); setEditing(true); }} aria-haspopup="dialog">
              <SlidersHorizontal size={15} aria-hidden="true" /> Modifier les jours
            </button>
          )}
        </div>
        <DaysRow days={path.availability} label="Jours d’étude de l’élève" />
      </div>
      {error && !editing && <div role="alert"><Callout tone="warning" title="Action impossible">{error}</Callout></div>}
      {!path.proposal ? <p className="staff-muted staff-small">Aucun planning calculé pour le moment.</p>
        : proposal.error ? <Callout tone="warning">{proposal.error}</Callout>
        : !data ? <SkeletonCard lines={4} label="Chargement du planning…" />
        : <PathProposalView proposal={data} busy={busy} canValidate={path.permissions.canValidate} validateLabel="Valider ce planning"
            // Les suggestions qui demandent un avenant restent affichées, désactivées : elles passent par le contrat.
            onApply={path.permissions.canEditAvailability ? (suggestion) => void saveDays(suggestion.availability) : undefined}
            onValidate={() => void validate()}
            actionsNote={`Les séances de l’élève sont mises à jour dès la validation${path.accompanied ? '' : ' (élève autonome : il peut aussi valider lui-même)'}.`} />}
      {editing && (
        <Drawer title="Jours de l’élève" onClose={() => setEditing(false)}
          description={engaged ? `Le contrat engage au moins ${formatMinutes(path.weeklyMinutes)} par semaine : les jours choisis doivent atteindre ce total.`
            : 'Choisissez les jours et la durée des séances : un nouveau planning sera calculé.'}>
          {error && <div role="alert"><Callout tone="warning" title="Enregistrement impossible">{error}</Callout></div>}
          <AvailabilityEditor value={path.availability} busy={busy} onSave={(days) => void saveDays(days)} />
        </Drawer>
      )}
    </Card>
  );
}

function ContractCard({ path, learnerName, token, onChanged }: { path: PathView; learnerName: string; token: string; onChanged: () => void }) {
  const [opened, setOpened] = useState<'pending' | 'amendment' | null>(null);
  const [all, setAll] = useState(false);
  const pid = encodeURIComponent(path.id);
  const first = learnerName.trim().split(/\s+/)[0] || learnerName;
  const history = useLoad<Contract[]>(() => requestApi<Contract[]>(`/learning/paths/${pid}/contracts`, token),
    [pid, token, path.contract.pending?.number, path.contract.current?.number]);
  const { current, pending, engaged } = path.contract;
  const contracts = history.data ?? [];

  return (
    <Card title="Contrat" icon={<Handshake size={18} />} className="spx-contract"
      action={<Badge tone={engaged ? 'green' : 'amber'}>{engaged ? 'Engagé' : 'Non engagé'}</Badge>}
      description={current ? `Contrat n° ${current.number} en vigueur depuis le ${formatDay(current.decidedAt ?? current.createdAt)}` : 'Aucun contrat accepté pour le moment'}>
      {pending && (
        pending.status === 'pending_teacher' ? (
          <div className="spx-pending">
            <span className="spx-pending-icon" aria-hidden="true"><Hourglass size={18} /></span>
            <div><strong>Contrat n° {pending.number} à valider</strong><small>Proposé le {formatDay(pending.createdAt)} : {first} a déjà commencé avec ces conditions.</small></div>
            <button type="button" className="btn btn-primary btn-sm" onClick={() => setOpened('pending')}>Examiner le contrat</button>
          </div>
        ) : (
          <Callout tone="info" title={`Contrat n° ${pending.number} envoyé`}>En attente de la réponse de {first} depuis le {formatDay(pending.createdAt)}.</Callout>
        )
      )}
      <TermsFacts terms={current?.terms ?? pathTerms(path)} />
      {path.permissions.canProposeContract && !pending && (
        <button type="button" className="btn btn-outline btn-sm spx-amend" onClick={() => setOpened('amendment')}>
          <PencilLine size={15} aria-hidden="true" /> Proposer un avenant
        </button>
      )}
      <div className="spx-history">
        <span className="spx-label"><History size={14} aria-hidden="true" /> Historique</span>
        {history.error ? <p className="staff-muted staff-small">{history.error}</p>
          : !history.data ? <SkeletonCard lines={2} label="Chargement de l’historique…" />
          : <ContractHistory contracts={contracts} limit={all ? undefined : 3} />}
        {contracts.length > 3 && (
          <button type="button" className="text-link spx-more" onClick={() => setAll(!all)}>{all ? 'Réduire l’historique' : `Voir les ${contracts.length} contrats`}</button>
        )}
      </div>
      {opened && (
        <ContractDecision pathId={path.id} learnerId={path.learnerId} learnerName={learnerName}
          contract={opened === 'pending' ? pending : null} base={current?.terms ?? pathTerms(path)} token={token}
          onClose={() => setOpened(null)} onDone={() => { setOpened(null); onChanged(); }} />
      )}
    </Card>
  );
}

function AdditionsCard({ path, token, refresh, onAdd, onChanged }: {
  path: PathView; token: string; refresh: number; onAdd: () => void; onChanged: () => void;
}) {
  const toast = useToast();
  const pid = encodeURIComponent(path.id);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState('');
  const additions = useLoad<Addition[]>(() => requestApi<Addition[]>(`/learning/paths/${pid}/additions`, token), [pid, token, refresh]);
  const active = (additions.data ?? []).filter((addition) => !addition.removedAt)
    .sort((a, b) => b.addedAt.localeCompare(a.addedAt));
  const canEdit = path.permissions.canAddCourses;

  async function remove(addition: Addition) {
    setBusy(addition.id);
    setError('');
    try {
      await requestApi<AdditionRemoved>(`/learning/paths/${pid}/additions/${encodeURIComponent(addition.id)}/remove`, token, { method: 'POST', body: {} });
      toast(`« ${addition.title} » est retiré : validez le nouveau planning.`);
      additions.reload();
      onChanged();
    } catch (failure) {
      setError(errorText(failure));
    } finally {
      setBusy(null);
    }
  }

  return (
    <Card flush title="Cours ajoutés" icon={<BookPlus size={18} />} className="spx-additions"
      description={active.length ? plural(active.length, 'ajout', 'ajouts') : 'Modules et activités ajoutés au parcours'}
      action={canEdit && active.length > 0 && <button type="button" className="btn btn-soft btn-sm" onClick={onAdd}><BookPlus size={15} aria-hidden="true" /> Ajouter</button>}>
      {error && <div className="spx-card-message" role="alert"><Callout tone="warning">{error}</Callout></div>}
      {additions.error ? <div className="spx-card-message"><Callout tone="warning">{additions.error}</Callout></div>
        : !additions.data ? <div className="spx-card-message"><SkeletonCard lines={2} label="Chargement des cours ajoutés…" /></div>
        : active.length === 0 ? (
          <EmptyState icon={<BookOpen size={26} />} title="Aucun cours ajouté"
            description="Renforcez un point précis avec un module ou une activité de la bibliothèque."
            action={canEdit ? <button type="button" className="btn btn-primary btn-sm" onClick={onAdd}><BookPlus size={15} aria-hidden="true" /> Ajouter des cours</button> : undefined} />
        ) : (
          <ul className="spx-addition-list lc-stagger">
            {active.map((addition) => (
              <li key={addition.id} className="spx-addition">
                <span className={`spx-addition-icon is-${addition.status}`} aria-hidden="true">{addition.status === 'completed' ? <Check size={16} strokeWidth={3} /> : <BookPlus size={16} />}</span>
                <span className="spx-addition-main">
                  <strong>{addition.title}</strong>
                  <small>{addition.activityId ? 'Activité' : 'Module'} {addition.sourceLevelCode} · {formatMinutes(addition.minutes)} · {additionPlacementLabels[addition.placement]}{addition.stepLevel !== addition.sourceLevelCode ? ` (niveau ${addition.stepLevel})` : ''}</small>
                  {addition.note && <q>{addition.note}</q>}
                </span>
                <span className="spx-addition-end">
                  <Badge tone={addition.status === 'completed' ? 'green' : addition.status === 'in_progress' ? 'blue' : 'neutral'}>{additionStatusLabels[addition.status]}</Badge>
                  {canEdit && addition.status === 'planned' && (
                    <button type="button" className="icon-button" onClick={() => void remove(addition)} disabled={busy !== null}
                      aria-label={`Retirer « ${addition.title} »`} title="Retirer"><Trash2 size={17} aria-hidden="true" /></button>
                  )}
                </span>
              </li>
            ))}
          </ul>
        )}
    </Card>
  );
}

function PathHeader({ path, learnerName, token, onAdd, onChanged }: {
  path: PathView; learnerName: string; token: string; onAdd: () => void; onChanged: () => void;
}) {
  const toast = useToast();
  const pid = encodeURIComponent(path.id);
  const [confirm, setConfirm] = useState<'advance' | 'pause' | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const first = learnerName.trim().split(/\s+/)[0] || learnerName;
  const steps = [...path.steps].sort((a, b) => a.position - b.position);
  const activeStep = steps.find((step) => step.status === 'active');
  const nextStep = steps.find((step) => step.status === 'planned' && (!activeStep || step.position > activeStep.position));
  const targetChanged = path.initialTargetDate !== path.targetDate;
  const { permissions } = path;

  async function run(action: () => Promise<unknown>, message: string) {
    setBusy(true);
    setError('');
    try {
      await action();
      toast(message);
      onChanged();
    } catch (failure) {
      setError(errorText(failure));
    } finally {
      setBusy(false);
      setConfirm(null);
    }
  }
  const advance = () => run(() => requestApi<PathView>(`/learning/paths/${pid}/advance`, token, { method: 'POST', body: {} }),
    `Niveau ${nextStep?.levelCode ?? 'suivant'} ouvert pour ${learnerName}.`);
  const pause = () => run(() => requestApi<PathView>(`/learning/paths/${pid}/pause`, token, { method: 'POST', body: {} }),
    `Parcours de ${learnerName} mis en pause.`);
  function resume(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const resumeDate = String(new FormData(event.currentTarget).get('resumeDate'));
    void run(() => requestApi<PathProposal>(`/learning/paths/${pid}/resume`, token, { method: 'POST', body: { resumeDate } }),
      'Reprise préparée : validez le nouveau planning pour republier les séances.');
  }

  return (
    <Card className="spx-head" aria-label="Parcours de l’élève">
      <div className="spx-head-top">
        <span className="spx-head-icon" aria-hidden="true"><Route size={20} /></span>
        <div className="spx-head-title">
          <h2>{languageName(path.languageId)} · {startLabel(path.startLevel)} → {path.targetLevel}</h2>
          <span className="staff-tags">
            <Badge tone={path.paused ? 'neutral' : path.status === 'active' ? 'blue' : path.status === 'completed' ? 'green' : 'neutral'}>
              {path.paused ? 'En pause' : pathStatusLabels[path.status]}
            </Badge>
            <span className={`badge badge-${difficultyTones[path.difficulty.code]}`}>{path.difficulty.label}</span>
            {path.origin === 'migration' && <Badge tone="neutral">Repris de l’ancien parcours</Badge>}
            {path.accompanied ? null : <Badge tone="violet">Élève autonome</Badge>}
          </span>
        </div>
        <div className="spx-head-actions">
          {permissions.canAddCourses && (
            <button type="button" className="btn btn-primary" onClick={onAdd}><BookPlus size={17} aria-hidden="true" /> Ajouter des cours</button>
          )}
          {permissions.canAdvance && nextStep && (
            <button type="button" className="btn btn-outline" onClick={() => setConfirm('advance')} disabled={busy}>
              <SkipForward size={17} aria-hidden="true" /> Passer au niveau suivant
            </button>
          )}
          {permissions.canPause && !path.paused && path.status === 'active' && (
            <button type="button" className="btn btn-ghost" onClick={() => setConfirm('pause')} disabled={busy}>
              <CirclePause size={17} aria-hidden="true" /> Mettre en pause
            </button>
          )}
        </div>
      </div>

      <LevelTrack path={path} />

      <Facts items={[
        { label: 'Date cible', value: <>{formatDay(path.targetDate)}{targetChanged && <small className="sct-fact-note">initialement {formatDay(path.initialTargetDate)}</small>}</> },
        { label: 'Engagement', value: <>{formatMinutes(path.weeklyMinutes)}<small className="sct-fact-note">par semaine</small></> },
        { label: 'Programme restant', value: formatMinutes(path.requiredMinutes) },
        { label: 'Charge nécessaire', value: <>{formatMinutes(path.difficulty.requiredWeeklyMinutes)}<small className="sct-fact-note">par semaine</small></> },
      ]} />

      {path.paused && (
        <div className="spx-paused">
          <p><CirclePause size={20} aria-hidden="true" /><span><strong>Parcours en pause</strong>
            <small>{path.pausedAt ? `Depuis le ${formatDay(path.pausedAt)}` : ''}{path.resumeDate ? ` · reprise prévue le ${formatDay(path.resumeDate)}` : ''}</small></span></p>
          {permissions.canPause && (
            <form className="spx-resume" onSubmit={resume}>
              <label>Date de reprise<input type="date" name="resumeDate" required min={todayIso()} defaultValue={path.resumeDate ?? todayIso(7)} /></label>
              <button type="submit" className="btn btn-primary" disabled={busy}><CirclePlay size={17} aria-hidden="true" /> Préparer la reprise</button>
            </form>
          )}
        </div>
      )}
      {error && <div role="alert"><Callout tone="warning" title="Action impossible">{error}</Callout></div>}

      {confirm === 'advance' && nextStep && (
        <Dialog title={`Ouvrir le niveau ${nextStep.levelCode} ?`} onClose={() => setConfirm(null)}>
          <div className="spx-confirm">
            <p>Le niveau {activeStep?.levelCode ?? 'en cours'} de {first} sera clôturé et ses séances restantes ne seront plus proposées.
              Un nouveau planning {nextStep.levelCode} est calculé jusqu’à la date du contrat ({formatDay(path.targetDate)}).</p>
            <div className="spx-confirm-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setConfirm(null)}>Annuler</button>
              <button type="button" className="btn btn-primary" onClick={() => void advance()} disabled={busy}>
                <SkipForward size={16} aria-hidden="true" /> Ouvrir le niveau {nextStep.levelCode}
              </button>
            </div>
          </div>
        </Dialog>
      )}
      {confirm === 'pause' && (
        <Dialog title="Mettre le parcours en pause ?" onClose={() => setConfirm(null)}>
          <div className="spx-confirm">
            <p>Les séances de {first} sont suspendues. Vous choisirez ensuite une date de reprise : un nouveau planning sera alors proposé.</p>
            <div className="spx-confirm-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setConfirm(null)}>Annuler</button>
              <button type="button" className="btn btn-primary" onClick={() => void pause()} disabled={busy}>
                <CirclePause size={16} aria-hidden="true" /> Mettre en pause
              </button>
            </div>
          </div>
        </Dialog>
      )}
    </Card>
  );
}

export function StaffPathTab({ learnerId, learnerName, token, legacy, onChanged }: {
  learnerId: string; learnerName: string; token: string;
  /** Affichage historique (objectif et planning d'une inscription) quand aucun parcours n'est disponible. */
  legacy?: ReactNode;
  onChanged?: () => void;
}) {
  const id = encodeURIComponent(learnerId);
  const [reload, setReload] = useState(0);
  const [adding, setAdding] = useState(false);
  const path = useLoad<PathView | null>(() => requestApi<PathView | null>(`/learning/path?learnerId=${id}`, token), [id, token, reload]);
  const first = learnerName.trim().split(/\s+/)[0] || learnerName;
  const changed = () => { setReload((count) => count + 1); onChanged?.(); };

  if (path.data === undefined) {
    if (path.error) return legacy ? <div className="staff-page-body">{legacy}</div> : <StaffError message={path.error} onRetry={path.reload} />;
    return <SkeletonCard lines={6} label="Chargement du parcours…" />;
  }
  const data = path.data;
  if (!data) {
    return (
      <div className="staff-page-body">
        <Card>
          <EmptyState icon={<Route size={26} />} title="Pas encore de parcours"
            description={`${first} construit son parcours à sa première connexion : test de niveau, objectif puis planning. Son contrat vous sera alors envoyé pour validation.`} />
        </Card>
        {legacy}
      </div>
    );
  }
  return (
    <div className="staff-page-body spx">
      <PathHeader path={data} learnerName={learnerName} token={token} onAdd={() => setAdding(true)} onChanged={changed} />
      <div className="staff-sheet-grid">
        <div className="staff-col">
          <PlanningCard path={data} token={token} onChanged={changed} />
          <AdditionsCard path={data} token={token} refresh={reload} onAdd={() => setAdding(true)} onChanged={changed} />
        </div>
        <div className="staff-col">
          <ContractCard path={data} learnerName={learnerName} token={token} onChanged={changed} />
          <Card title="Test de niveau" icon={<ClipboardList size={18} />}>
            <PlacementLoader learnerId={learnerId} attemptId={data.placementAttemptId} token={token} />
          </Card>
        </div>
      </div>
      {adding && (
        <AddCourseDrawer path={data} learnerName={learnerName} token={token} onClose={() => setAdding(false)}
          onChanged={() => { setAdding(false); changed(); }} />
      )}
    </div>
  );
}
