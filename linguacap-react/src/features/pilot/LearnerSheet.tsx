import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge, EmptyState, PageHeading } from '../../components/ui';
import { requestApi } from '../../integration/api';
import { formatDue, sessionStatus, type Grade } from './LearnerSession';
import { GoalPanel, type PlannedEnrollment } from './GoalPanel';
import type { TrackingAlert, TrackingSummary } from './StaffPilot';

interface Track {
  versionId: string;
  levelCode: string;
  levelTitle: string;
  number: number;
  moduleCount: number;
  activityCount: number;
  totalMinutes: number;
  prerequisiteLevelCode: string | null;
}

interface Sheet {
  profile: { id: string; displayName: string };
  enrollment: PlannedEnrollment | null;
  goal: { level: string; targetDate: string } | null;
  results: Grade[];
  completedCount: number;
  messages: { id: string; text: string; sentAt: string; resumedAt?: string | null; alertId?: string | null }[];
  tracking?: TrackingSummary & { alerts?: TrackingAlert[] };
}

const competenceNames: Record<string, string> = {
  lecture: 'Lecture', ecoute: 'Écoute', 'expression-ecrite': 'Expression écrite', 'expression-orale': 'Expression orale',
};
const alertStatus = { open: 'Ouverte', suspended: 'Suspendue (pause)', closed: 'Close' } as const;

const dateFormat = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' });

function getError(error: unknown) {
  return error instanceof Error ? error.message : 'Cette action est temporairement indisponible.';
}

function inDays(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Attribution d'un parcours publié et de l'échéance de la première séance (DEV-029). */
function AssignTrack({ learnerId, token, onAssigned }: { learnerId: string; token: string; onAssigned: () => void }) {
  const [tracks, setTracks] = useState<Track[] | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    requestApi<Track[]>('/tracks', token).then(
      (data) => { if (active) setTracks(data); },
      (failure: unknown) => { if (active) setError(getError(failure)); },
    );
    return () => { active = false; };
  }, [token]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const form = new FormData(event.currentTarget);
    setBusy(true);
    setError('');
    try {
      const targetDate = String(form.get('targetDate') ?? '');
      await requestApi<PlannedEnrollment>('/learning/enrollments', token, {
        method: 'POST',
        body: {
          learnerId, trackVersionId: String(form.get('trackVersionId')), startLevel: String(form.get('startLevel')),
          template: String(form.get('template')), startDate: String(form.get('startDate')),
          ...(targetDate ? { targetDate } : {}),
        },
      });
      onAssigned();
    } catch (failure) {
      setError(getError(failure));
    } finally {
      setBusy(false);
    }
  }

  if (tracks === null) return error ? <p className="inline-message warning" role="alert">{error}</p> : <p role="status">Chargement des parcours…</p>;
  if (tracks.length === 0) return <EmptyState title="Aucun parcours publié" description="Publiez une version de parcours dans le catalogue pour l’attribuer." />;
  return (
    <form className="teacher-form stack" onSubmit={submit}>
      <label>Parcours
        <select name="trackVersionId" required defaultValue={tracks[0].versionId}>
          {tracks.map((track) => (
            <option key={track.versionId} value={track.versionId}>
              {track.levelTitle} · version {track.number} · {track.activityCount} activités, {track.totalMinutes} min
            </option>
          ))}
        </select>
      </label>
      <label>Niveau de départ
        <select name="startLevel" defaultValue="A0">
          <option value="A0">Débutant</option><option value="A1">A1</option><option value="A2">A2</option><option value="B1">B1</option>
        </select>
      </label>
      <label>Rythme
        <select name="template" defaultValue="intensive">
          <option value="intensive">Intensif · 2 séances de 45 min par jour (A1 en un mois, A2 en deux mois)</option>
          <option value="standard">Standard · 1 séance de 30 min du lundi au vendredi</option>
        </select>
      </label>
      <label>Début<input type="date" name="startDate" required min={inDays(0)} defaultValue={inDays(0)} /></label>
      <label>Date cible (facultative : la durée du rythme par défaut)<input type="date" name="targetDate" min={inDays(1)} /></label>
      {tracks.some((track) => track.prerequisiteLevelCode) && (
        <p className="muted">Un parcours A2 suppose A1 validé dans LinguaCap ou confirmé par le diagnostic de l’élève.</p>
      )}
      {error && <p className="inline-message warning" role="alert">{error}</p>}
      <button className="btn btn-primary" type="submit" disabled={busy}>{busy ? 'Attribution…' : 'Attribuer le parcours'}</button>
    </form>
  );
}

interface SheetAsideContext {
  name: string;
  alert?: TrackingAlert | null;
  reload: () => void;
}

export function LearnerSheetPage({ learnerId, token, renderAside }: {
  learnerId: string; token: string; renderAside?: (context: SheetAsideContext) => ReactNode;
}) {
  const [sheet, setSheet] = useState<Sheet | null>(null);
  const [error, setError] = useState('');
  const [reload, setReload] = useState(0);
  const id = encodeURIComponent(learnerId);
  const refresh = () => setReload((value) => value + 1);

  useEffect(() => {
    let active = true;
    setError('');
    requestApi<Sheet>(`/tracking/learners/${id}`, token).then(
      (data) => { if (active) setSheet(data); },
      (failure: unknown) => { if (active) setError(getError(failure)); },
    );
    return () => { active = false; };
  }, [id, token, reload]);

  const enrollment = sheet?.enrollment ?? null;
  return (
    <div className="staff-page stack staff-learner-sheet">
      <Link className="text-link" to="/espace/eleves">Retour aux élèves</Link>
      <PageHeading title={sheet?.profile.displayName ?? 'Fiche élève'}
        description={enrollment ? `Allemand ${enrollment.levelCode} · version ${enrollment.trackVersionNumber}` : undefined}
        action={<button className="btn btn-outline" type="button" onClick={refresh}><RefreshCw size={17} aria-hidden="true" /> Actualiser</button>} />
      {error && <p className="inline-message warning" role="alert">{error}</p>}
      {!sheet && !error && <p role="status">Chargement de la fiche…</p>}
      {sheet && (
        <div className="staff-sheet-grid">
          <div className="stack">
            {enrollment && <GoalPanel enrollment={enrollment} token={token} viewer="staff" onChanged={refresh} />}
            {(!enrollment || enrollment.status !== 'active') && (
              <section className="panel stack" aria-labelledby="staff-assign-title">
                <h2 id="staff-assign-title">Attribuer un parcours</h2>
                <AssignTrack learnerId={learnerId} token={token} onAssigned={refresh} />
              </section>
            )}
            <section className="panel stack" aria-labelledby="staff-sessions-title">
              <div className="staff-section-heading"><h2 id="staff-sessions-title">Séances</h2>{enrollment && <Badge>{enrollment.sessions.length}</Badge>}</div>
              {enrollment ? (
                <>
                  <p className="muted">Attribué le {dateFormat.format(new Date(enrollment.assignedAt))}
                    {enrollment.supersededSessions > 0 && ` · ${enrollment.supersededSessions} séance(s) replanifiée(s)`}</p>
                  {enrollment.sessions.length === 0 && <p className="muted">Les séances seront publiées à la validation du planning.</p>}
                  <ul className="accounts-history staff-sheet-history">
                    {enrollment.sessions.map((session) => {
                      const done = session.activities.filter((activity) => activity.status === 'completed').length;
                      return (
                        <li key={session.id}>
                          <div className="staff-section-heading"><strong>Séance {session.position} · {session.title}</strong>
                            <Badge tone={sessionStatus[session.status].tone}>{sessionStatus[session.status].label}</Badge></div>
                          <span>Échéance le {formatDue(session.dueAt)} · {done} / {session.activities.length} activités terminées</span>
                        </li>
                      );
                    })}
                  </ul>
                </>
              ) : <p className="muted">Aucun parcours attribué.</p>}
            </section>
          </div>

          <aside className="stack" aria-label="Suivi et encouragements">
            {sheet.tracking?.enrollmentId && (
              <section className="panel stack" aria-labelledby="sheet-tracking">
                <h2 id="sheet-tracking">Activité</h2>
                <dl className="goal-facts staff-activity-facts">
                  <div><dt>Temps de pratique estimé</dt><dd>{sheet.tracking.practiceMinutes ?? 0} min</dd></div>
                  <div><dt>Dernière activité</dt><dd>{sheet.tracking.lastActivityAt ? dateFormat.format(new Date(sheet.tracking.lastActivityAt)) : 'Aucune'}</dd></div>
                  <div><dt>Séances terminées</dt><dd>{sheet.tracking.sessionsCompleted ?? 0} dont {sheet.tracking.sessionsOnTime ?? 0} à temps</dd></div>
                  <div><dt>Retard</dt><dd>{sheet.tracking.lateSessions ? `${sheet.tracking.lateSessions} séance(s)` : 'À jour'}</dd></div>
                  <div><dt>Corrections en attente</dt><dd>{sheet.tracking.pendingGrading ?? 0}</dd></div>
                </dl>
                {(sheet.tracking.alerts ?? []).length > 0 && (
                  <>
                    <h3>Historique des alertes</h3>
                    <ul className="accounts-history staff-sheet-history">
                      {(sheet.tracking.alerts ?? []).map((alert) => (
                        <li key={alert.id}><strong>{alertStatus[alert.status]} · {alert.reason}</strong>
                          <span>Ouverte le {dateFormat.format(new Date(alert.openedAt))}{alert.closedAt ? ` · close le ${dateFormat.format(new Date(alert.closedAt))}` : ''}</span></li>
                      ))}
                    </ul>
                  </>
                )}
              </section>
            )}
            {renderAside?.({ name: sheet.profile.displayName, alert: sheet.tracking?.alert, reload: refresh })}
            <section className="panel stack" aria-labelledby="staff-results-title">
              <h2 id="staff-results-title">Résultats</h2>
              {Object.entries(sheet.tracking?.results ?? {}).map(([kind, result]) => (
                <div key={kind} className="stack">
                  <strong>{kind === 'final' ? 'Examen blanc' : 'Bilan intermédiaire'} · {result.percent} %{result.onTime ? ' · remis à temps' : ''}</strong>
                  <ul className="accounts-history">
                    {Object.entries(result.scores ?? {}).map(([competence, score]) => (
                      <li key={competence}><strong>{competenceNames[competence] ?? competence}</strong><span>{score.percent} %</span></li>
                    ))}
                  </ul>
                </div>
              ))}
              {sheet.results.length === 0 ? <p className="muted">Aucun exercice remis.</p> : (
                <ul className="accounts-history staff-sheet-history">
                  {sheet.results.map((grade) => (
                    <li key={grade.id}><strong>{grade.correct} / {grade.total}</strong><span>Remis le {dateFormat.format(new Date(grade.submittedAt))}</span></li>
                  ))}
                </ul>
              )}
            </section>
            <section className="panel stack" aria-labelledby="staff-encouragements-title">
              <h2 id="staff-encouragements-title">Encouragements envoyés</h2>
              {sheet.messages.length === 0 ? <p className="muted">Aucun encouragement envoyé.</p> : (
                <ul className="accounts-history staff-sheet-history">
                  {sheet.messages.map((message) => <li key={message.id}><strong>{message.text}</strong><span>{dateFormat.format(new Date(message.sentAt))}
                    {message.resumedAt ? ` · reprise le ${dateFormat.format(new Date(message.resumedAt))}` : ''}</span></li>)}
                </ul>
              )}
            </section>
          </aside>
        </div>
      )}
    </div>
  );
}
