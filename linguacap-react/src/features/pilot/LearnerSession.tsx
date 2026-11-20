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

/** Support d'une activité, d'une question ou d'un choix de réponse, avec son adresse de lecture temporaire. */
export interface Placement {
  position: number;
  assetId: string;
  assetVersion: number;
  usage: 'illustration' | 'audio';
  alt: string | null;
  caption: string | null;
  decorative?: boolean;
  questionId?: string | null;
  optionId?: string | null;
  url?: string | null;
}
export interface Question { id: string; prompt: string; options: { id: string; text: string }[] }
export interface ActivityDetail {
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
interface SessionDetail { session: SessionSummary; enrollmentId: string; levelCode: string; activities: ActivityDetail[] }

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

/**
 * Support de cours : image avec son alternative textuelle (vide si décorative) ou audio avec ses commandes.
 * L'adresse est temporaire : si elle a expiré ou manque, onRenew redemande la séance, qui renouvelle les adresses.
 */
export function MediaPlacement({ placement, onRenew, compact = false }: { placement: Placement; onRenew: () => void; compact?: boolean }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => { setFailed(false); }, [placement.url]);

  if (!placement.url || failed) {
    return (
      <div className="stack">
        <p className="inline-message warning" role="alert">Cette ressource est indisponible pour le moment.</p>
        <button className="btn btn-outline" type="button" onClick={onRenew}>Réessayer</button>
      </div>
    );
  }
  if (placement.usage === 'illustration') {
    return (
      <figure className={compact ? 'pilot-figure pilot-figure-compact' : 'pilot-figure'}>
        <img className={compact ? 'pilot-option-image' : 'pilot-lesson-image'} src={placement.url}
          alt={placement.decorative ? '' : placement.alt ?? ''} onError={() => setFailed(true)} />
        {placement.caption && <figcaption lang="de">{placement.caption}</figcaption>}
      </figure>
    );
  }
  return (
    <div className="stack">
      {!compact && <strong><Volume2 size={17} aria-hidden="true" /> {placement.caption ?? 'Écouter l’enregistrement'}</strong>}
      <audio controls preload="metadata" src={placement.url} aria-label={placement.caption ?? 'Enregistrement audio'}
        onError={() => setFailed(true)} />
    </div>
  );
}

const activityPlacements = (activity: ActivityDetail) => activity.placements.filter((placement) => !placement.questionId);
const questionPlacements = (activity: ActivityDetail, questionId: string) =>
  activity.placements.filter((placement) => placement.questionId === questionId && !placement.optionId);
const optionPlacements = (activity: ActivityDetail, questionId: string, optionId: string) =>
  activity.placements.filter((placement) => placement.questionId === questionId && placement.optionId === optionId);

function Transcript({ text }: { text: string | null }) {
  if (!text) return null;
  return <details><summary>Lire la transcription</summary><p className="pilot-transcript" lang="de">{text}</p></details>;
}

export function LessonActivity({ activity, onRenew, onComplete, busy, preview = false }: {
  activity: ActivityDetail; onRenew: () => void; onComplete: () => void; busy: boolean; preview?: boolean;
}) {
  return (
    <div className="stack">
      {activity.lesson && <p className="pilot-lesson-text">{activity.lesson.description}</p>}
      {activityPlacements(activity).map((placement) => <MediaPlacement key={placement.position} placement={placement} onRenew={onRenew} />)}
      <Transcript text={activity.transcript} />
      {activity.status === 'completed'
        ? <p className="inline-message" role="status"><CheckCircle2 size={16} aria-hidden="true" /> {activity.kind === 'review' ? 'Révision terminée' : 'Leçon terminée'}</p>
        : <button className="btn btn-primary" type="button" onClick={onComplete} disabled={busy || preview}>
            {activity.kind === 'review' ? 'J’ai terminé la révision' : 'J’ai terminé la leçon'}
          </button>}
    </div>
  );
}

export function ExerciseActivity({ activity, sessionId, token, grade, onRenew, onSaveState, onGraded, preview = false }: {
  activity: ActivityDetail;
  sessionId: string;
  token: string;
  grade: Grade | null;
  onRenew: () => void;
  onSaveState: (answers: Record<string, string>) => void;
  onGraded: (grade: Grade, answers: Record<string, string>) => Promise<void>;
  preview?: boolean;
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
    if (busy || !activity.lesson || preview) return;
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
      {/* Consigne et texte support (lecture) de l'exercice. */}
      {activity.lesson?.description && <p className="pilot-lesson-text">{activity.lesson.description}</p>}
      {activityPlacements(activity).map((placement) => <MediaPlacement key={placement.position} placement={placement} onRenew={onRenew} />)}
      <Transcript text={activity.transcript} />
      {activity.questions.map((question) => (
        <fieldset className="pilot-options" key={question.id} disabled={completed}>
          <legend>{question.prompt}</legend>
          {questionPlacements(activity, question.id).map((placement) => (
            <div className="pilot-question-media" key={placement.position}><MediaPlacement placement={placement} onRenew={onRenew} /></div>
          ))}
          {question.options.map((option) => {
            const media = optionPlacements(activity, question.id, option.id);
            return (
              <label key={option.id} className={media.length ? 'pilot-option-with-media' : undefined}>
                <input type="radio" required name={question.id} value={option.id} checked={answers[question.id] === option.id}
                  onChange={() => choose(question.id, option.id)} /> {option.text}
                {media.map((placement) => <MediaPlacement key={placement.position} placement={placement} onRenew={onRenew} compact />)}
              </label>
            );
          })}
        </fieldset>
      ))}
      {error && <p className="inline-message warning" role="alert">{error}</p>}
      {grade && <p className="inline-message" role="status">Résultat enregistré · {grade.correct} / {grade.total}</p>}
      {preview && <p className="muted">Aperçu : la remise et la correction sont désactivées.</p>}
      {!completed && (
        <button className="btn btn-primary" type="submit" disabled={busy || preview || !activity.questions.length}>
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

  // Les adresses des supports durent cinq minutes : redemander la séance les renouvelle.
  const renew = useCallback(() => setReload((value) => value + 1), []);

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
              ? <LessonActivity activity={activity} onRenew={renew} busy={busy} onComplete={() => void completeLesson(activity)} />
              : activity.kind === 'assessment' && activity.questions.length === 0
                ? (
                  <div className="stack">
                    <p className="muted">{activity.lesson?.description}</p>
                    {(activity.id === 'bilan-intermediaire' || activity.id === 'examen-blanc') && (
                      activity.status === 'completed'
                        ? <Link className="text-link" to={`/espace/evaluation/${detail.enrollmentId}/${activity.id === 'examen-blanc' ? 'final' : 'midterm'}`}>Voir ma tentative et mon résultat</Link>
                        : <Link className="btn btn-primary" to={`/espace/evaluation/${detail.enrollmentId}/${activity.id === 'examen-blanc' ? 'final' : 'midterm'}`}>
                            {activity.id === 'examen-blanc' ? 'Passer l’examen blanc' : 'Passer le bilan intermédiaire'}</Link>
                    )}
                  </div>
                )
              : <ExerciseActivity activity={activity} sessionId={detail.session.id} token={token} grade={grade} onRenew={renew}
                  onSaveState={(answers) => saveAnswers(activity, answers)} onGraded={(result, answers) => graded(activity, result, answers)} />}
          </section>
        );
      })}
    </div>
  );
}
