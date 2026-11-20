import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, BookOpen, CheckCircle2, Clock, PencilLine, Volume2 } from 'lucide-react';
import { Badge } from '../../components/ui';
import { requestApi } from '../../integration/api';
import './pilot.css';

export type SessionStatus = 'planned' | 'in_progress' | 'completed' | 'late';
type ActivityStatus = 'todo' | 'started' | 'completed';

export interface ActivitySummary { id: string; kind: string; title: string; estimatedMinutes: number; status: ActivityStatus }
export interface SessionSummary {
  id: string;
  position: number;
  title: string;
  dueAt: string;
  status: SessionStatus;
  completedAt: string | null;
  estimatedMinutes: number;
  activities: ActivitySummary[];
}
export interface Enrollment {
  id: string;
  levelCode: string;
  trackVersionNumber: number;
  assignedAt: string;
  status: 'active' | 'completed' | 'withdrawn';
  sessions: SessionSummary[];
}
export interface Grade {
  kind?: 'quiz' | 'diagnostic';
  id: string; lessonId: string; correct: number; total: number; submittedAt: string;
  sessionId?: string | null; activityId?: string | null;
}

interface Placement { position: number; assetId: string; assetVersion: number; usage: 'illustration' | 'audio'; alt: string | null; caption: string | null }
interface Question { id: string; prompt: string; options: { id: string; text: string }[] }
interface ActivityDetail {
  id: string;
  kind: 'lesson' | 'exercise' | 'review' | 'assessment';
  title: string;
  estimatedMinutes: number;
  status: ActivityStatus;
  state: { answers?: Record<string, string> };
  attemptId: string | null;
  lesson: { id: string; title: string; description: string } | null;
  transcript: string | null;
  questions: Question[];
  placements: Placement[];
}
interface SessionDetail { session: SessionSummary; levelCode: string; activities: ActivityDetail[] }
interface MediaFile { url: string; mimeType: string }

const dueFormat = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });
export const sessionStatus: Record<SessionStatus, { label: string; tone: 'blue' | 'green' | 'amber' | 'neutral' }> = {
  planned: { label: 'À venir', tone: 'neutral' },
  in_progress: { label: 'En cours', tone: 'blue' },
  completed: { label: 'Terminée', tone: 'green' },
  late: { label: 'En retard', tone: 'amber' },
};

export function formatDue(value: string) {
  return dueFormat.format(new Date(value));
}

function errorText(error: unknown) {
  return error instanceof Error && error.name !== 'TimeoutError'
    ? error.message : 'Le service est momentanément indisponible. Réessayez.';
}

/** Support de cours : image avec son alternative textuelle ou audio avec ses commandes, et réessai si indisponible. */
function MediaPlacement({ placement, token }: { placement: Placement; token: string }) {
  const [file, setFile] = useState<MediaFile | null>(null);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    setError('');
    requestApi<MediaFile>(`/media/${encodeURIComponent(placement.assetId)}/versions/${placement.assetVersion}`, token).then(
      (data) => { if (active) setFile(data); },
      (failure: unknown) => { if (active) setError(errorText(failure)); },
    );
    return () => { active = false; };
  }, [placement.assetId, placement.assetVersion, token, attempt]);

  const retry = () => { setFile(null); setAttempt((value) => value + 1); };
  if (error) {
    return (
      <div className="stack">
        <p className="inline-message warning" role="alert">Cette ressource est indisponible pour le moment.</p>
        <button className="btn btn-outline" type="button" onClick={retry}>Réessayer</button>
      </div>
    );
  }
  if (!file) return <p role="status">Chargement du support…</p>;
  if (placement.usage === 'illustration') {
    return (
      <figure className="pilot-figure">
        <img className="pilot-lesson-image" src={file.url} alt={placement.alt ?? ''}
          onError={() => setError('Le lien de l’image a expiré.')} />
        {placement.caption && <figcaption lang="de">{placement.caption}</figcaption>}
      </figure>
    );
  }
  return (
    <div className="stack">
      <strong><Volume2 size={17} aria-hidden="true" /> {placement.caption ?? 'Écouter l’enregistrement'}</strong>
      <audio controls preload="metadata" src={file.url} aria-label={placement.caption ?? 'Enregistrement audio'}
        onError={() => setError('Le lien audio a expiré.')} />
    </div>
  );
}

function Transcript({ text }: { text: string | null }) {
  if (!text) return null;
  return <details><summary>Lire la transcription</summary><p className="pilot-transcript" lang="de">{text}</p></details>;
}

function LessonActivity({ activity, token, onComplete, busy }: {
  activity: ActivityDetail; token: string; onComplete: () => void; busy: boolean;
}) {
  return (
    <div className="stack">
      {activity.lesson && <p>{activity.lesson.description}</p>}
      {activity.placements.map((placement) => <MediaPlacement key={placement.position} placement={placement} token={token} />)}
      <Transcript text={activity.transcript} />
      {activity.status === 'completed'
        ? <p className="inline-message" role="status"><CheckCircle2 size={16} aria-hidden="true" /> {activity.kind === 'review' ? 'Révision terminée' : 'Leçon terminée'}</p>
        : <button className="btn btn-primary" type="button" onClick={onComplete} disabled={busy}>
            {activity.kind === 'review' ? 'J’ai terminé la révision' : 'J’ai terminé la leçon'}
          </button>}
    </div>
  );
}

function ExerciseActivity({ activity, sessionId, token, grade, onSaveState, onGraded }: {
  activity: ActivityDetail;
  sessionId: string;
  token: string;
  grade: Grade | null;
  onSaveState: (answers: Record<string, string>) => void;
  onGraded: (grade: Grade, answers: Record<string, string>) => Promise<void>;
}) {
  const [answers, setAnswers] = useState<Record<string, string>>(activity.state.answers ?? {});
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const key = useRef<string | null>(null);
  const completed = activity.status === 'completed';

  function choose(questionId: string, optionId: string) {
    key.current = null;
    const next = { ...answers, [questionId]: optionId };
    setAnswers(next);
    onSaveState(next);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || !activity.lesson) return;
    setBusy(true);
    setError('');
    key.current ??= crypto.randomUUID();
    try {
      const result = await requestApi<Grade>('/assessments/quiz', token, {
        method: 'POST',
        body: { lessonId: activity.lesson.id, answers, sessionId, activityId: activity.id },
        idempotencyKey: key.current,
      });
      await onGraded(result, answers);
      key.current = null;
    } catch (failure) {
      setError(errorText(failure));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="stack" onSubmit={submit}>
      {activity.placements.map((placement) => <MediaPlacement key={placement.position} placement={placement} token={token} />)}
      <Transcript text={activity.transcript} />
      {activity.questions.map((question) => (
        <fieldset className="pilot-options" key={question.id} disabled={completed}>
          <legend>{question.prompt}</legend>
          {question.options.map((option) => (
            <label key={option.id}>
              <input type="radio" required name={question.id} value={option.id} checked={answers[question.id] === option.id}
                onChange={() => choose(question.id, option.id)} /> {option.text}
            </label>
          ))}
        </fieldset>
      ))}
      {error && <p className="inline-message warning" role="alert">{error}</p>}
      {grade && <p className="inline-message" role="status">Résultat enregistré · {grade.correct} / {grade.total}</p>}
      {!completed && (
        <button className="btn btn-primary" type="submit" disabled={busy || !activity.questions.length}>
          {busy ? 'Correction…' : 'Valider mes réponses'}
        </button>
      )}
    </form>
  );
}

export function SessionPage({ token }: { token: string }) {
  const { sessionId = '' } = useParams();
  const [detail, setDetail] = useState<SessionDetail | null>(null);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loadError, setLoadError] = useState('');
  const [actionError, setActionError] = useState('');
  const [busy, setBusy] = useState(false);
  const [reload, setReload] = useState(0);
  const saveTimer = useRef<number | undefined>(undefined);
  const id = encodeURIComponent(sessionId);

  useEffect(() => {
    let active = true;
    setLoadError('');
    Promise.all([
      requestApi<SessionDetail>(`/learning/sessions/${id}`, token),
      requestApi<Grade[]>('/assessments/results', token),
    ]).then(([session, results]) => {
      if (!active) return;
      setDetail(session);
      setGrades(results);
    }).catch((failure: unknown) => { if (active) setLoadError(errorText(failure)); });
    return () => { active = false; };
  }, [id, token, reload]);

  // Ouvrir une activité la marque commencée : la séance passe « en cours » et sa reprise est possible.
  const save = useCallback(async (activityId: string, body: { state?: object; completed?: boolean; attemptId?: string }) => {
    const activity = encodeURIComponent(activityId);
    const session = await requestApi<SessionSummary>(`/learning/sessions/${id}/activities/${activity}/progress`, token, { method: 'PUT', body });
    setDetail((current) => current && ({
      ...current,
      session,
      activities: current.activities.map((item) => {
        const updated = session.activities.find((entry) => entry.id === item.id);
        return updated ? { ...item, status: updated.status } : item;
      }),
    }));
    return session;
  }, [id, token]);

  useEffect(() => {
    const first = detail?.activities.find((activity) => activity.status === 'todo');
    if (first && detail?.activities[0]?.id === first.id) void save(first.id, { state: {} }).catch(() => undefined);
  }, [detail, save]);

  async function completeLesson(activity: ActivityDetail) {
    setBusy(true);
    setActionError('');
    try {
      await save(activity.id, { completed: true });
    } catch (failure) {
      setActionError(errorText(failure));
    } finally {
      setBusy(false);
    }
  }

  function saveAnswers(activity: ActivityDetail, answers: Record<string, string>) {
    window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => {
      void save(activity.id, { state: { answers } }).catch(() => undefined);
    }, 400);
  }

  async function graded(activity: ActivityDetail, grade: Grade, answers: Record<string, string>) {
    window.clearTimeout(saveTimer.current);
    setGrades((current) => [grade, ...current.filter((item) => item.id !== grade.id)]);
    await save(activity.id, { state: { answers }, completed: true, attemptId: grade.id });
    setReload((value) => value + 1);
  }

  if (!detail) {
    return (
      <section className="panel stack">
        {loadError ? (
          <>
            <p className="inline-message warning" role="alert">{loadError}</p>
            <button className="btn btn-outline" type="button" onClick={() => setReload((value) => value + 1)}>Réessayer</button>
            <Link className="text-link" to="/espace">Retour à mon espace</Link>
          </>
        ) : <p role="status">Chargement de la séance…</p>}
      </section>
    );
  }

  const status = sessionStatus[detail.session.status];
  return (
    <div className="stack pilot-session">
      <Link className="text-link" to="/espace"><ArrowLeft size={16} aria-hidden="true" /> Retour à mon espace</Link>
      <section className="panel stack" aria-labelledby="pilot-session-title">
        <div className="panel-heading">
          <h2 id="pilot-session-title">Séance {detail.session.position} · {detail.session.title}</h2>
          <Badge tone={status.tone}>{status.label}</Badge>
        </div>
        <p className="muted"><Clock size={15} aria-hidden="true" /> À terminer avant le {formatDue(detail.session.dueAt)} · environ {detail.session.estimatedMinutes} min</p>
        {detail.session.status === 'completed' && <p className="inline-message" role="status">Séance terminée. Bravo !</p>}
        {actionError && <p className="inline-message warning" role="alert">{actionError}</p>}
      </section>
      {detail.activities.map((activity) => {
        const grade = activity.attemptId ? grades.find((item) => item.id === activity.attemptId) ?? null : null;
        return (
          <section className="panel stack" key={activity.id} aria-labelledby={`activity-${activity.id}`}>
            <div className="panel-heading">
              <h2 id={`activity-${activity.id}`}>
                {activity.kind === 'lesson' ? <BookOpen size={20} aria-hidden="true" /> : <PencilLine size={20} aria-hidden="true" />} {activity.title}
              </h2>
              <Badge tone="blue">{detail.levelCode}</Badge>
            </div>
            {activity.kind === 'lesson' || activity.kind === 'review'
              ? <LessonActivity activity={activity} token={token} busy={busy} onComplete={() => void completeLesson(activity)} />
              : activity.kind === 'assessment' && activity.questions.length === 0
                ? <p className="muted">{activity.lesson?.description}</p>
              : <ExerciseActivity activity={activity} sessionId={detail.session.id} token={token} grade={grade}
                  onSaveState={(answers) => saveAnswers(activity, answers)} onGraded={(result, answers) => graded(activity, result, answers)} />}
          </section>
        );
      })}
    </div>
  );
}
