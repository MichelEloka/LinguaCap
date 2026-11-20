import { useEffect, useState, type FormEvent } from 'react';
import { Badge, Dialog, EmptyState } from '../../components/ui';
import { requestApi } from '../../integration/api';
import { formatDue, sessionStatus, type Enrollment, type Grade } from './LearnerSession';

interface Track {
  versionId: string;
  levelCode: string;
  levelTitle: string;
  number: number;
  moduleCount: number;
  activityCount: number;
  totalMinutes: number;
}

interface Sheet {
  profile: { id: string; displayName: string };
  enrollment: Enrollment | null;
  goal: { level: string; targetDate: string } | null;
  results: Grade[];
  completedCount: number;
  messages: { id: string; text: string; sentAt: string }[];
}

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
      await requestApi<Enrollment>('/learning/enrollments', token, {
        method: 'POST',
        body: { learnerId, trackVersionId: String(form.get('trackVersionId')), firstSessionDue: String(form.get('firstSessionDue')) },
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
      <label>Échéance de la première séance (20 h)
        <input type="date" name="firstSessionDue" required min={inDays(0)} defaultValue={inDays(2)} />
      </label>
      {error && <p className="inline-message warning" role="alert">{error}</p>}
      <button className="btn btn-primary" type="submit" disabled={busy}>{busy ? 'Attribution…' : 'Attribuer le parcours'}</button>
    </form>
  );
}

/** Fiche élève du professeur référent ou de l'administration (DEV-033). */
export function LearnerSheetDialog({ learnerId, name, token, onClose }: {
  learnerId: string; name: string; token: string; onClose: () => void;
}) {
  const [sheet, setSheet] = useState<Sheet | null>(null);
  const [error, setError] = useState('');
  const [reload, setReload] = useState(0);
  const id = encodeURIComponent(learnerId);

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
    <Dialog title={`Suivi de ${name}`} onClose={onClose}>
      {!sheet ? (error ? <p className="inline-message warning" role="alert">{error}</p> : <p role="status">Chargement de la fiche…</p>) : (
        <div className="stack accounts-detail">
          <h3>Parcours</h3>
          {enrollment ? (
            <>
              <p>Allemand {enrollment.levelCode} · version {enrollment.trackVersionNumber} · attribué le {dateFormat.format(new Date(enrollment.assignedAt))}</p>
              <ul className="accounts-history">
                {enrollment.sessions.map((session) => {
                  const done = session.activities.filter((activity) => activity.status === 'completed').length;
                  return (
                    <li key={session.id}>
                      <strong>Séance {session.position} · {session.title} <Badge tone={sessionStatus[session.status].tone}>{sessionStatus[session.status].label}</Badge></strong>
                      <span>Échéance le {formatDue(session.dueAt)} · {done} / {session.activities.length} activités terminées</span>
                    </li>
                  );
                })}
              </ul>
            </>
          ) : <p className="muted">Aucun parcours attribué pour le moment.</p>}
          {(!enrollment || enrollment.status !== 'active') && (
            <AssignTrack learnerId={learnerId} token={token} onAssigned={() => setReload((value) => value + 1)} />
          )}
          <h3>Résultats</h3>
          {sheet.results.length === 0 ? <p className="muted">Aucun exercice remis.</p> : (
            <ul className="accounts-history">
              {sheet.results.map((grade) => (
                <li key={grade.id}><strong>{grade.correct} / {grade.total}</strong><span>Remis le {dateFormat.format(new Date(grade.submittedAt))}</span></li>
              ))}
            </ul>
          )}
          <h3>Encouragements</h3>
          {sheet.messages.length === 0 ? <p className="muted">Aucun encouragement envoyé.</p> : (
            <ul className="accounts-history">
              {sheet.messages.map((message) => <li key={message.id}><strong>{message.text}</strong><span>{dateFormat.format(new Date(message.sentAt))}</span></li>)}
            </ul>
          )}
        </div>
      )}
    </Dialog>
  );
}
