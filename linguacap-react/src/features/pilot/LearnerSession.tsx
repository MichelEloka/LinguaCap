import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, BookOpen, CalendarClock, Check, CheckCircle2, ClipboardCheck, Flag, PencilLine, RotateCcw, Trophy,
} from 'lucide-react';
import { Badge, ProgressBar } from '../../components/ui';
import { Callout, Facts, ListItem, ProgressRing, SkeletonCard } from '../../design/kit';
import { requestApi } from '../../integration/api';
import { LessonContent } from './LessonContent';
import { MediaPlacement, MediaSequence, Transcript } from './study-media';
import { QuestionCard } from './study-question';
import './learner-session.css';

export { MediaPlacement } from './study-media';

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
const dayFormat = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
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

const activityPlacements = (activity: ActivityDetail) => activity.placements.filter((placement) => !placement.questionId);
const questionPlacements = (activity: ActivityDetail, questionId: string) =>
  activity.placements.filter((placement) => placement.questionId === questionId && !placement.optionId);
const optionPlacements = (activity: ActivityDetail, questionId: string, optionId: string) =>
  activity.placements.filter((placement) => placement.questionId === questionId && placement.optionId === optionId);

const activityKind = {
  lesson: { label: 'Leçon', icon: BookOpen },
  exercise: { label: 'Exercice', icon: PencilLine },
  review: { label: 'Révision', icon: RotateCcw },
  assessment: { label: 'Évaluation', icon: ClipboardCheck },
};

export function LessonActivity({ activity, onRenew, onComplete, busy, preview = false }: {
  activity: ActivityDetail; onRenew: () => void; onComplete: () => void; busy: boolean; preview?: boolean;
}) {
  const review = activity.kind === 'review';
  return (
    <div className="study-body">
      <MediaSequence placements={activityPlacements(activity)} onRenew={onRenew}
        after={activity.transcript ? <Transcript text={activity.transcript} /> : undefined} />
      {activity.lesson?.description && <LessonContent text={activity.lesson.description} />}
      <div className={`study-finish${activity.status === 'completed' ? ' is-done' : ''}`}>
        {activity.status === 'completed' ? (
          <p className="study-finish-done" role="status">
            <span className="study-finish-icon" aria-hidden="true"><Check size={18} strokeWidth={3} /></span>
            <span>{review ? 'Révision terminée' : 'Leçon terminée'}</span>
          </p>
        ) : (
          <>
            <p className="study-finish-hint">{review ? 'Vous avez tout revu ? Validez pour avancer.' : 'Vous avez tout lu et écouté ? Validez pour passer à la suite.'}</p>
            <button className="btn btn-primary btn-lg" type="button" onClick={onComplete} disabled={busy || preview}>
              <Check size={18} strokeWidth={2.6} aria-hidden="true" />{review ? 'J’ai terminé la révision' : 'J’ai terminé la leçon'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function encouragement(percent: number | null) {
  if (percent === null) return { title: 'Exercice terminé', text: 'Vos réponses sont enregistrées.' };
  if (percent >= 90) return { title: 'Excellent !', text: 'Vous maîtrisez cette activité. Continuez sur cette lancée.' };
  if (percent >= 70) return { title: 'Très bien !', text: 'Encore un petit effort et ce sera parfait.' };
  if (percent >= 50) return { title: 'Bon travail', text: 'Relisez la consigne et les mots utiles pour consolider.' };
  return { title: 'Ne lâchez rien', text: 'C’est en pratiquant qu’on progresse : réécoutez, relisez, puis passez à la suite.' };
}

function ExerciseResult({ grade, transcript }: { grade: Grade | null; transcript: string | null }) {
  const percent = grade && grade.total ? Math.round((grade.correct / grade.total) * 100) : null;
  const tone = percent === null || percent >= 70 ? 'success' : percent >= 50 ? 'brand' : 'accent';
  const cheer = encouragement(percent);
  return (
    <section className={`study-result is-${tone}`} aria-label="Résultat de l’exercice">
      <div className="study-result-head">
        {grade ? (
          <ProgressRing value={percent ?? 0} size={88} stroke={8} color={`var(--${tone})`} label={`${grade.correct} bonnes réponses sur ${grade.total}`}>
            <strong className="study-result-score">{grade.correct}<small>/{grade.total}</small></strong>
          </ProgressRing>
        ) : <span className="study-result-icon" aria-hidden="true"><CheckCircle2 size={30} /></span>}
        <div className="study-result-text">
          <h3>{cheer.title}</h3>
          {grade && <p className="study-result-line" role="status">Résultat enregistré · {grade.correct} / {grade.total}</p>}
          <p className="study-result-note">{cheer.text}</p>
        </div>
      </div>
      <Transcript text={transcript} />
    </section>
  );
}

/**
 * Exercice corrigé. Dans une séance, `sessionId` rattache la correction à l'activité de la séance ; sans séance
 * (bibliothèque, exercice libre), la correction est enregistrée seule et relue dans les résultats.
 */
export function ExerciseActivity({ activity, sessionId, token, grade, onRenew, onSaveState, onGraded, preview = false }: {
  activity: ActivityDetail;
  sessionId?: string;
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
  const [missing, setMissing] = useState<string[]>([]);
  const key = useRef<string | null>(null);
  const cards = useRef<Record<string, HTMLFieldSetElement | null>>({});
  const completed = activity.status === 'completed';
  const total = activity.questions.length;
  const answered = activity.questions.filter((question) => answers[question.id]).length;
  const showResult = completed || Boolean(grade);

  function choose(questionId: string, optionId: string) {
    key.current = null;
    const next = { ...answers, [questionId]: optionId };
    setAnswers(next);
    setMissing((list) => list.filter((id) => id !== questionId));
    onSaveState(next);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || !activity.lesson || preview) return;
    const left = activity.questions.filter((question) => !answers[question.id]).map((question) => question.id);
    if (left.length) {
      setMissing(left);
      const card = cards.current[left[0]];
      card?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      card?.querySelector('input')?.focus({ preventScroll: true });
      return;
    }
    setBusy(true);
    setError('');
    key.current ??= crypto.randomUUID();
    try {
      const result = await requestApi<Grade>('/assessments/quiz', token, {
        method: 'POST',
        body: sessionId ? { lessonId: activity.lesson.id, answers, sessionId, activityId: activity.id } : { lessonId: activity.lesson.id, answers },
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
    <form className="study-body" onSubmit={submit} noValidate>
      {activity.lesson?.description && <LessonContent text={activity.lesson.description} />}
      <MediaSequence placements={activityPlacements(activity)} onRenew={onRenew} after={!showResult && activity.transcript ? <Transcript text={activity.transcript} /> : undefined} />
      {total > 0 && (
        <div className="study-questions">
          {activity.questions.map((question, index) => {
            const media = questionPlacements(activity, question.id);
            return (
              <QuestionCard key={question.id} index={index} prompt={question.prompt} name={question.id} options={question.options}
                value={answers[question.id]} onChoose={(optionId) => choose(question.id, optionId)} locked={completed}
                missing={missing.includes(question.id)} cardRef={(node) => { cards.current[question.id] = node; }}
                media={media.length > 0 ? media.map((placement) => <MediaPlacement key={placement.position} placement={placement} onRenew={onRenew} />) : undefined}
                extras={(optionId) => {
                  const list = optionPlacements(activity, question.id, optionId);
                  if (!list.length) return undefined;
                  const pictures = list.filter((placement) => placement.usage === 'illustration');
                  const sounds = list.filter((placement) => placement.usage === 'audio');
                  return {
                    label: pictures.find((placement) => !placement.decorative && placement.alt)?.alt ?? undefined,
                    picture: pictures.length ? pictures.map((placement) => <MediaPlacement key={placement.position} placement={placement} onRenew={onRenew} compact />) : undefined,
                    audio: sounds.length ? sounds.map((placement) => <MediaPlacement key={placement.position} placement={placement} onRenew={onRenew} compact />) : undefined,
                  };
                }} />
            );
          })}
        </div>
      )}
      {error && <p className="inline-message warning" role="alert">{error}</p>}
      {missing.length > 0 && (
        <p className="inline-message warning" role="alert">
          {missing.length === 1 ? 'Il reste une question sans réponse.' : `Il reste ${missing.length} questions sans réponse.`}
        </p>
      )}
      {showResult && <ExerciseResult grade={grade} transcript={activity.transcript} />}
      {preview && <Callout tone="info">Aperçu : la remise et la correction sont désactivées.</Callout>}
      {!completed && (
        <div className="study-submit">
          {total > 0 && (
            <div className="study-submit-count">
              <ProgressRing value={(answered / total) * 100} size={42} stroke={5} label={`${answered} réponses sur ${total}`}>
                <small>{answered}/{total}</small>
              </ProgressRing>
              <span>{answered === total ? 'Toutes les réponses sont prêtes.' : answered === 0 ? 'Choisissez une réponse par question.' : `${answered} réponse${answered > 1 ? 's' : ''} sur ${total}`}</span>
            </div>
          )}
          <button className="btn btn-primary btn-lg" type="submit" disabled={busy || preview || !total}>
            {busy ? 'Correction…' : 'Valider mes réponses'}
          </button>
        </div>
      )}
    </form>
  );
}

function AssessmentLink({ activity, enrollmentId }: { activity: ActivityDetail; enrollmentId: string }) {
  if (activity.id !== 'bilan-intermediaire' && activity.id !== 'examen-blanc') return null;
  const to = `/espace/evaluation/${enrollmentId}/${activity.id === 'examen-blanc' ? 'final' : 'midterm'}`;
  return activity.status === 'completed'
    ? <Link className="text-link" to={to}>Voir ma tentative et mon résultat <ArrowRight size={16} aria-hidden="true" /></Link>
    : <Link className="btn btn-primary btn-lg" to={to}>{activity.id === 'examen-blanc' ? 'Passer l’examen blanc' : 'Passer le bilan intermédiaire'}</Link>;
}

type StepState = 'done' | 'started' | 'todo';
const stepState = (activity: ActivityDetail): StepState => activity.status === 'completed' ? 'done' : activity.status === 'started' ? 'started' : 'todo';
const stepLabel: Record<StepState, string> = { done: 'terminée', started: 'en cours', todo: 'à faire' };

/** Sommaire de la séance : rail vertical sur grand écran, bandeau défilant sous l'en-tête sur mobile. */
function StudyRail({ activities, view, finished, onGo }: {
  activities: ActivityDetail[]; view: string | null; finished: boolean; onGo: (id: string) => void;
}) {
  const list = useRef<HTMLOListElement>(null);
  useEffect(() => {
    const strip = list.current;
    const item = strip?.querySelector<HTMLElement>('[aria-current="step"]');
    if (strip && item && strip.scrollWidth > strip.clientWidth + 4) {
      strip.scrollTo({ left: item.offsetLeft - (strip.clientWidth - item.offsetWidth) / 2, behavior: 'smooth' });
    }
  }, [view]);
  const done = activities.filter((activity) => activity.status === 'completed').length;
  return (
    <nav className="study-rail" aria-label="Activités de la séance">
      <div className="study-rail-head"><h2>Au programme</h2><span>{done}/{activities.length}</span></div>
      <ol ref={list}>
        {activities.map((activity, index) => {
          const state = stepState(activity);
          const { icon: Icon, label } = activityKind[activity.kind];
          return (
            <li key={activity.id}>
              <button type="button" className={`study-step is-${state}`} aria-current={activity.id === view ? 'step' : undefined} onClick={() => onGo(activity.id)}>
                <span className="study-step-mark" aria-hidden="true">{state === 'done' ? <Check size={15} strokeWidth={3} /> : index + 1}</span>
                <span className="study-step-text">
                  <strong>{activity.title}</strong>
                  <small><Icon size={13} aria-hidden="true" /> {label} · {activity.estimatedMinutes} min</small>
                </span>
                <span className="sr-only">, {stepLabel[state]}</span>
              </button>
            </li>
          );
        })}
        {finished && (
          <li>
            <button type="button" className="study-step is-summary" aria-current={view === 'summary' ? 'step' : undefined} onClick={() => onGo('summary')}>
              <span className="study-step-mark" aria-hidden="true"><Flag size={14} strokeWidth={2.5} /></span>
              <span className="study-step-text"><strong>Bilan de la séance</strong><small>Résumé et suite</small></span>
            </button>
          </li>
        )}
      </ol>
    </nav>
  );
}

function SessionComplete({ detail, grades, token }: { detail: SessionDetail; grades: Grade[]; token: string }) {
  const [next, setNext] = useState<SessionSummary | null>(null);
  useEffect(() => {
    let active = true;
    requestApi<Enrollment | null>('/learning/enrollment', token).then((enrollment) => {
      if (!active || !enrollment) return;
      const upcoming = [...enrollment.sessions].sort((a, b) => a.position - b.position)
        .find((session) => session.id !== detail.session.id && session.status !== 'completed');
      setNext(upcoming ?? null);
    }).catch(() => undefined);
    return () => { active = false; };
  }, [token, detail.session.id]);

  const results = detail.activities.flatMap((activity) => {
    const grade = activity.attemptId ? grades.find((item) => item.id === activity.attemptId) : undefined;
    return grade ? [{ activity, grade }] : [];
  });
  const correct = results.reduce((sum, item) => sum + item.grade.correct, 0);
  const asked = results.reduce((sum, item) => sum + item.grade.total, 0);
  const total = detail.activities.length;
  const facts = [
    { label: 'Activités', value: `${total} / ${total}` },
    { label: 'Temps prévu', value: `${detail.session.estimatedMinutes} min` },
    ...(asked ? [{ label: 'Bonnes réponses', value: `${correct} / ${asked} · ${Math.round((correct / asked) * 100)} %` }] : []),
    ...(detail.session.completedAt ? [{ label: 'Terminée le', value: dayFormat.format(new Date(detail.session.completedAt)) }] : []),
  ];
  return (
    <section className="study-done" aria-labelledby="study-done-title">
      <div className="study-done-hero">
        <div className="study-done-medal" aria-hidden="true">
          <span className="study-done-spark is-1" /><span className="study-done-spark is-2" /><span className="study-done-spark is-3" />
          <span className="study-done-spark is-4" /><span className="study-done-spark is-5" /><span className="study-done-spark is-6" />
          <ProgressRing value={100} size={116} stroke={9} color="var(--success)" label="Séance complète">
            <span className="study-done-trophy"><Trophy size={40} /></span>
          </ProgressRing>
        </div>
        <div role="status"><h2 id="study-done-title" tabIndex={-1} data-study-focus>Séance terminée. Bravo !</h2></div>
        <p>Vous avez terminé {total > 1 ? `les ${total} activités` : 'l’activité'} de « {detail.session.title} ». Chaque séance vous rapproche de votre objectif {detail.levelCode}.</p>
      </div>
      <Facts items={facts} />
      {results.length > 0 && (
        <div className="study-done-results">
          <h3>Vos exercices</h3>
          <ul className="kit-list">
            {results.map(({ activity, grade }) => (
              <ListItem key={activity.id} as="li" title={activity.title} subtitle={activityKind[activity.kind].label}
                leading={<ProgressRing value={grade.total ? (grade.correct / grade.total) * 100 : 0} size={40} stroke={5}
                  color={grade.total && grade.correct / grade.total >= .7 ? 'var(--success)' : 'var(--brand)'} label={`${grade.correct} sur ${grade.total}`}>
                  <small className="study-mini-score">{grade.total ? Math.round((grade.correct / grade.total) * 100) : 0}</small>
                </ProgressRing>}
                trailing={<Badge tone={grade.total && grade.correct / grade.total >= .7 ? 'green' : 'blue'}>{grade.correct} / {grade.total}</Badge>} />
            ))}
          </ul>
        </div>
      )}
      <div className="study-done-actions">
        {next && (
          <Link className="btn btn-primary btn-lg" to={`/espace/seance/${encodeURIComponent(next.id)}`}>
            Séance suivante : {next.title} <ArrowRight size={18} aria-hidden="true" />
          </Link>
        )}
        <Link className={`btn btn-lg ${next ? 'btn-outline' : 'btn-primary'}`} to="/espace">Retour à l’accueil</Link>
      </div>
    </section>
  );
}

function SessionReader({ sessionId, token }: { sessionId: string; token: string }) {
  const [detail, setDetail] = useState<SessionDetail | null>(null);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loadError, setLoadError] = useState('');
  const [actionError, setActionError] = useState('');
  const [busy, setBusy] = useState(false);
  const [reload, setReload] = useState(0);
  const [view, setView] = useState<string | null>(null);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');
  const [flash, setFlash] = useState<string | null>(null);
  const saveTimer = useRef<number | undefined>(undefined);
  const stage = useRef<HTMLDivElement>(null);
  const moved = useRef(false);
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

  // À l'ouverture : la première activité à faire, ou le bilan si tout est terminé.
  useEffect(() => {
    if (!detail || view) return;
    const first = detail.activities.find((activity) => activity.status !== 'completed');
    if (first && detail.session.status !== 'completed') setView(first.id);
    else if (detail.activities.length) setView('summary');
  }, [detail, view]);

  // Après un changement d'activité : retour en haut du contenu et focus sur son titre.
  useEffect(() => {
    if (!moved.current) return;
    moved.current = false;
    const element = stage.current;
    if (!element) return;
    if (element.getBoundingClientRect().top < 120) element.scrollIntoView({ block: 'start' });
    element.querySelector<HTMLElement>('[data-study-focus]')?.focus({ preventScroll: true });
  }, [view]);

  useEffect(() => {
    if (!flash) return;
    const timer = window.setTimeout(() => setFlash(null), 6000);
    return () => window.clearTimeout(timer);
  }, [flash]);

  // Les adresses des supports durent cinq minutes : redemander la séance les renouvelle.
  const renew = useCallback(() => setReload((value) => value + 1), []);

  function go(target: string, towards?: 'next' | 'prev') {
    if (!detail || target === view) return;
    const order = [...detail.activities.map((activity) => activity.id), 'summary'];
    setDirection(towards ?? (order.indexOf(target) < order.indexOf(view ?? '') ? 'prev' : 'next'));
    setFlash(null);
    setActionError('');
    moved.current = true;
    setView(target);
  }

  async function completeLesson(activity: ActivityDetail) {
    if (!detail) return;
    setBusy(true);
    setActionError('');
    try {
      const session = await save(activity.id, { completed: true });
      if (session.status === 'completed') { go('summary', 'next'); return; }
      // Passage automatique à la prochaine activité non terminée.
      const statuses = detail.activities.map((item) => ({
        id: item.id, status: item.id === activity.id ? 'completed' : session.activities.find((entry) => entry.id === item.id)?.status ?? item.status,
      }));
      const index = statuses.findIndex((item) => item.id === activity.id);
      const next = [...statuses.slice(index + 1), ...statuses.slice(0, index)].find((item) => item.status !== 'completed');
      if (next) {
        go(next.id, 'next');
        setFlash(activity.kind === 'review' ? 'Révision terminée.' : 'Leçon terminée.');
      }
    } catch (failure) {
      setActionError(errorText(failure));
    } finally {
      setBusy(false);
    }
  }

  function saveAnswers(activity: ActivityDetail, answers: Record<string, string>) {
    // Les réponses restent affichées si l'élève change d'activité puis revient.
    setDetail((current) => current && ({
      ...current,
      activities: current.activities.map((item) => item.id === activity.id ? { ...item, state: { ...item.state, answers } } : item),
    }));
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
      <div className="study study-loading">
        {loadError ? (
          <section className="study-error" aria-labelledby="study-error-title">
            <h1 id="study-error-title">Séance indisponible</h1>
            <p className="inline-message warning" role="alert">{loadError}</p>
            <div className="study-error-actions">
              <button className="btn btn-primary" type="button" onClick={() => setReload((value) => value + 1)}>Réessayer</button>
              <Link className="btn btn-outline" to="/espace">Retour à mon espace</Link>
            </div>
          </section>
        ) : (
          <>
            <SkeletonCard lines={2} label="Chargement de la séance…" />
            <div className="study-layout"><SkeletonCard lines={4} /><SkeletonCard lines={8} /></div>
          </>
        )}
      </div>
    );
  }

  const { session, activities } = detail;
  const status = sessionStatus[session.status];
  const completedCount = activities.filter((activity) => activity.status === 'completed').length;
  const total = activities.length;
  const finished = session.status === 'completed' || (total > 0 && completedCount === total);
  const index = activities.findIndex((activity) => activity.id === view);
  const current = index >= 0 ? activities[index] : null;
  const previous = index > 0 ? activities[index - 1] : null;
  const following = index >= 0 && index < total - 1 ? activities[index + 1] : null;
  const pending = current ? activities.find((activity) => activity.status !== 'completed' && activity.id !== current.id) : undefined;

  return (
    <div className="study lc-enter">
      <header className="study-head">
        <Link className="study-back" to="/espace"><ArrowLeft size={16} aria-hidden="true" /> Retour à mon espace</Link>
        <div className="study-head-row">
          <div className="study-head-text">
            <div className="study-head-tags">
              <Badge tone="blue">Allemand {detail.levelCode}</Badge>
              <Badge tone={status.tone}>{status.label}</Badge>
            </div>
            <h1 id="pilot-session-title">Séance {session.position} · {session.title}</h1>
            <p className="study-head-due"><CalendarClock size={15} aria-hidden="true" /> Avant le {formatDue(session.dueAt)} · environ {session.estimatedMinutes} min</p>
          </div>
          {total > 0 && (
            <div className="study-head-progress">
              <p><strong>{completedCount}</strong> / {total} activités</p>
              <ProgressBar value={(completedCount / total) * 100} label="Progression de la séance" />
            </div>
          )}
        </div>
      </header>

      {total === 0 ? (
        <section className="study-error"><p>Cette séance ne contient pas encore d’activité.</p></section>
      ) : (
        <div className="study-layout">
          <StudyRail activities={activities} view={view} finished={finished} onGo={(target) => go(target)} />
          <div className="study-stage" ref={stage}>
            {actionError && <p className="inline-message warning" role="alert">{actionError}</p>}
            {view === 'summary' ? (
              <div className={`study-pane is-${direction}`} key="summary">
                <SessionComplete detail={detail} grades={grades} token={token} />
              </div>
            ) : current && (
              <div className={`study-pane is-${direction}`} key={current.id}>
                {flash && (
                  <div className="study-flash" role="status">
                    <span className="study-flash-icon" aria-hidden="true"><Check size={16} strokeWidth={3} /></span>
                    <p><strong>{flash}</strong> Place à l’activité suivante.</p>
                  </div>
                )}
                <ActivityView activity={current} index={index} total={total} detail={detail} grades={grades} token={token} busy={busy}
                  onRenew={renew} onComplete={() => void completeLesson(current)}
                  onSaveState={(answers) => saveAnswers(current, answers)} onGraded={(result, answers) => graded(current, result, answers)} />
                <nav className="study-pager" aria-label="Changer d’activité">
                  <button className="btn btn-ghost" type="button" disabled={!previous} onClick={() => previous && go(previous.id, 'prev')}>
                    <ArrowLeft size={18} aria-hidden="true" /> Précédent
                  </button>
                  <span className="study-pager-count" aria-hidden="true">{index + 1} / {total}</span>
                  {following ? (
                    <button className={`btn ${current.status === 'completed' ? 'btn-primary' : 'btn-outline'}`} type="button" onClick={() => go(following.id, 'next')}>
                      Suivant <ArrowRight size={18} aria-hidden="true" />
                    </button>
                  ) : finished ? (
                    <button className="btn btn-primary" type="button" onClick={() => go('summary', 'next')}>
                      Voir le bilan <Flag size={17} aria-hidden="true" />
                    </button>
                  ) : pending ? (
                    <button className="btn btn-outline" type="button" onClick={() => go(pending.id)}>
                      Activité restante <ArrowRight size={18} aria-hidden="true" />
                    </button>
                  ) : <span />}
                </nav>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ActivityView({ activity, index, total, detail, grades, token, busy, onRenew, onComplete, onSaveState, onGraded }: {
  activity: ActivityDetail; index: number; total: number; detail: SessionDetail; grades: Grade[]; token: string; busy: boolean;
  onRenew: () => void; onComplete: () => void; onSaveState: (answers: Record<string, string>) => void;
  onGraded: (grade: Grade, answers: Record<string, string>) => Promise<void>;
}) {
  const grade = activity.attemptId ? grades.find((item) => item.id === activity.attemptId) ?? null : null;
  const { icon: Icon, label } = activityKind[activity.kind];
  return (
    <article className="study-activity" aria-labelledby={`activity-${activity.id}`}>
      <header className="study-activity-head">
        <span className={`study-kind is-${activity.kind}`} aria-hidden="true"><Icon size={22} /></span>
        <div className="study-activity-titles">
          <p>{label} · {activity.estimatedMinutes} min<span className="study-activity-rank"> · Activité {index + 1} sur {total}</span></p>
          <h2 id={`activity-${activity.id}`} tabIndex={-1} data-study-focus>{activity.title}</h2>
        </div>
        {activity.status === 'completed' && <span className="study-activity-done"><Badge tone="green"><Check size={13} strokeWidth={3} aria-hidden="true" /> Terminée</Badge></span>}
      </header>
      {activity.kind === 'lesson' || activity.kind === 'review'
        ? <LessonActivity activity={activity} onRenew={onRenew} busy={busy} onComplete={onComplete} />
        : activity.kind === 'assessment' && activity.questions.length === 0
          ? (
            <div className="study-body">
              {activity.lesson?.description && <LessonContent text={activity.lesson.description} />}
              <div className="study-finish"><AssessmentLink activity={activity} enrollmentId={detail.enrollmentId} /></div>
            </div>
          )
          : <ExerciseActivity activity={activity} sessionId={detail.session.id} token={token} grade={grade} onRenew={onRenew}
              onSaveState={onSaveState} onGraded={onGraded} />}
    </article>
  );
}

/** Séance en mode étude : une activité à la fois, sommaire, passage automatique et bilan final. */
export function SessionPage({ token }: { token: string }) {
  const { sessionId = '' } = useParams();
  return <SessionReader key={sessionId} sessionId={sessionId} token={token} />;
}
