import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, BookOpen, CalendarClock, Check, ClipboardCheck, Flag, PencilLine, RotateCcw, Target, Trophy,
} from 'lucide-react';
import { Badge, ProgressBar } from '../../components/ui';
import { Facts, ListItem, ProgressRing, SkeletonCard } from '../../design/kit';
import { requestApi } from '../../integration/api';
import type {
  ActivityKind, ExerciseAnswer, ExerciseState, Lexicon, MissionDefinition, MissionView, QuestionItem, QuestionView, ReviewItem,
} from '../../integration/v4';
import { LessonContent } from './LessonContent';
import { MediaSequence, Transcript } from './study-media';
import { activityPlacements, ExerciseActivity } from './study-exercise';
import { LexiconButton } from './study-lexicon';
import { MissionActivity } from './study-mission';
import './learner-session.css';

export { MediaPlacement } from './study-media';
export { ExerciseActivity } from './study-exercise';
export { MissionActivity } from './study-mission';

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
  /** V4 : réponses en attente du professeur, questions « à revoir », exercice typé. */
  pending?: number; flagged?: string[]; typed?: boolean;
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
/** Question vue par l'élève : forme typée de la V4, ou ancien choix sans `type` (aperçu de l'éditeur, anciens services). */
export type Question = QuestionView | { id: string; prompt: string; options: QuestionItem[]; type?: undefined | null };
export interface ActivityDetail {
  id: string;
  kind: ActivityKind;
  title: string;
  estimatedMinutes: number;
  status: ActivityStatus;
  /** Exercice : `{answers, roundId}` (ancienne forme `{answers: {q1: 'b'}}` relue comme un choix). */
  state: { answers?: Record<string, string | ExerciseAnswer>; roundId?: string };
  attemptId: string | null;
  lesson: { id: string; title: string; description: string } | null;
  transcript: string | null;
  questions: Question[];
  placements: Placement[];
  /** V4 : définition de la mission, activité d'origine au catalogue, exercices à reprendre (révision du module). */
  mission?: MissionDefinition | null;
  contentVersionId?: string | null;
  contentActivityId?: string | null;
  reviewItems?: ReviewItem[] | null;
}
interface SessionDetail { session: SessionSummary; enrollmentId: string; levelCode: string; activities: ActivityDetail[]; lexicon?: Lexicon | null }

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

const activityKinds: Record<ActivityKind, { label: string; icon: typeof BookOpen }> = {
  lesson: { label: 'Leçon', icon: BookOpen },
  exercise: { label: 'Exercice', icon: PencilLine },
  review: { label: 'Révision', icon: RotateCcw },
  assessment: { label: 'Évaluation', icon: ClipboardCheck },
  mission: { label: 'Mission', icon: Target },
};
/** Libellé et icône d'un type d'activité (un type inconnu d'un service plus récent s'affiche comme une leçon). */
const activityKind = (kind: string) => activityKinds[kind as ActivityKind] ?? activityKinds.lesson;

/** Révision du module : exercices dont des questions sont « à revoir », à reprendre dans la bibliothèque. */
function ReviewItems({ items }: { items: ReviewItem[] }) {
  return (
    <section className="study-retake" aria-labelledby="study-retake-title">
      <header>
        <span className="study-retake-icon" aria-hidden="true"><Flag size={17} /></span>
        <div>
          <h3 id="study-retake-title">À reprendre</h3>
          <p>Ces exercices ont des questions à revoir : refaites-les dans la bibliothèque pour consolider.</p>
        </div>
      </header>
      <ul className="kit-list">
        {items.map((item) => (
          <ListItem key={`${item.trackVersionId}/${item.activityId}`} as="li"
            href={`/espace/bibliotheque/${encodeURIComponent(item.trackVersionId)}/${encodeURIComponent(item.activityId)}`}
            leading={<span className="study-retake-kind" aria-hidden="true"><PencilLine size={16} /></span>}
            title={item.title}
            subtitle={`${item.flagged.length} question${item.flagged.length > 1 ? 's' : ''} à revoir · dernier score ${item.lastResult.correct} / ${item.lastResult.total}`}
            trailing={<><Badge tone="violet">À revoir</Badge><ArrowRight size={16} aria-hidden="true" /></>} />
        ))}
      </ul>
    </section>
  );
}

export function LessonActivity({ activity, onRenew, onComplete, busy, preview = false }: {
  activity: ActivityDetail; onRenew: () => void; onComplete: () => void; busy: boolean; preview?: boolean;
}) {
  const review = activity.kind === 'review';
  return (
    <div className="study-body">
      <MediaSequence placements={activityPlacements(activity)} onRenew={onRenew}
        after={activity.transcript ? <Transcript text={activity.transcript} /> : undefined} />
      {activity.lesson?.description && <LessonContent text={activity.lesson.description} />}
      {review && activity.reviewItems && activity.reviewItems.length > 0 && <ReviewItems items={activity.reviewItems} />}
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
          const { icon: Icon, label } = activityKind(activity.kind);
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
              <ListItem key={activity.id} as="li" title={activity.title} subtitle={activityKind(activity.kind).label}
                leading={<ProgressRing value={grade.total ? (grade.correct / grade.total) * 100 : 0} size={40} stroke={5}
                  color={grade.total && grade.correct / grade.total >= .7 ? 'var(--success)' : 'var(--brand)'} label={`${grade.correct} sur ${grade.total}`}>
                  <small className="study-mini-score">{grade.total ? Math.round((grade.correct / grade.total) * 100) : 0}</small>
                </ProgressRing>}
                trailing={<>
                  {(grade.flagged?.length ?? 0) > 0 && <Badge tone="violet">À revoir</Badge>}
                  {(grade.pending ?? 0) > 0 && <Badge tone="amber">En attente</Badge>}
                  <Badge tone={grade.total && grade.correct / grade.total >= .7 ? 'green' : 'blue'}>{grade.correct} / {grade.total}</Badge>
                </>} />
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
  /** Sauvegardes d'état en attente, une par activité (une saisie dans une activité n'annule pas celle d'une autre). */
  const pendingSaves = useRef(new Map<string, { timer: number; run: () => void }>());
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
    const session = await requestApi<SessionSummary>(`/learning/sessions/${id}/activities/${activity}/progress`, token, { method: 'PUT', body, keepalive: true });
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

  // En quittant la séance (autre écran, onglet masqué ou fermé) : envoyer tout de suite les réponses en attente.
  useEffect(() => {
    const saves = pendingSaves.current;
    const flush = () => {
      for (const { timer, run } of [...saves.values()]) { window.clearTimeout(timer); run(); }
    };
    const hidden = () => { if (document.visibilityState === 'hidden') flush(); };
    window.addEventListener('pagehide', flush);
    document.addEventListener('visibilitychange', hidden);
    return () => {
      window.removeEventListener('pagehide', flush);
      document.removeEventListener('visibilitychange', hidden);
      flush();
    };
  }, []);

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

  function saveAnswers(activity: ActivityDetail, state: ExerciseState) {
    // Les réponses (et la manche) restent affichées si l'élève change d'activité puis revient.
    setDetail((current) => current && ({
      ...current,
      activities: current.activities.map((item) => item.id === activity.id ? { ...item, state } : item),
    }));
    const saves = pendingSaves.current;
    window.clearTimeout(saves.get(activity.id)?.timer);
    const run = () => {
      saves.delete(activity.id);
      void save(activity.id, { state }).catch(() => undefined);
    };
    saves.set(activity.id, { timer: window.setTimeout(run, 400), run });
  }

  async function graded(activity: ActivityDetail, grade: Grade, state: ExerciseState) {
    window.clearTimeout(pendingSaves.current.get(activity.id)?.timer);
    pendingSaves.current.delete(activity.id);
    setGrades((current) => [grade, ...current.filter((item) => item.id !== grade.id)]);
    await save(activity.id, { state, completed: true, attemptId: grade.id });
    setReload((value) => value + 1);
  }

  // Mission remise : l'activité se termine avec l'identifiant de la remise (contrôlé par Apprentissage).
  async function missionSubmitted(activity: ActivityDetail, mission: MissionView) {
    setActionError('');
    try {
      await save(activity.id, { completed: true, attemptId: mission.id });
      setReload((value) => value + 1);
    } catch (failure) {
      setActionError(errorText(failure));
    }
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
          {(total > 0 || detail.lexicon) && (
            <div className="study-head-side">
              {detail.lexicon && detail.lexicon.entries.length > 0 && <LexiconButton lexicon={detail.lexicon} onRenew={renew} />}
              {total > 0 && (
                <div className="study-head-progress">
                  <p><strong>{completedCount}</strong> / {total} activités</p>
                  <ProgressBar value={(completedCount / total) * 100} label="Progression de la séance" />
                </div>
              )}
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
                  onSaveState={(state) => saveAnswers(current, state)} onGraded={(result, state) => graded(current, result, state)}
                  onMissionSubmitted={(mission) => void missionSubmitted(current, mission)} />
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

function ActivityView({ activity, index, total, detail, grades, token, busy, onRenew, onComplete, onSaveState, onGraded, onMissionSubmitted }: {
  activity: ActivityDetail; index: number; total: number; detail: SessionDetail; grades: Grade[]; token: string; busy: boolean;
  onRenew: () => void; onComplete: () => void; onSaveState: (state: ExerciseState) => void;
  onGraded: (grade: Grade, state: ExerciseState) => Promise<void>;
  onMissionSubmitted: (mission: MissionView) => void;
}) {
  const grade = activity.attemptId ? grades.find((item) => item.id === activity.attemptId) ?? null : null;
  const { icon: Icon, label } = activityKind(activity.kind);
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
      {activity.kind === 'mission'
        ? <MissionActivity activity={activity} token={token} sessionId={detail.session.id} onSubmitted={onMissionSubmitted} onRenew={onRenew} />
        : activity.kind === 'lesson' || activity.kind === 'review' || !(activity.kind in activityKinds)
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
