/** Éléments partagés par les écrans de l'espace élève : ligne de séance, avatar du professeur, scores. */
import type { ReactNode } from 'react';
import { AlertTriangle, BookOpen, Check, ChevronRight, ClipboardCheck, GraduationCap, PencilLine, Play, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '../../components/ui';
import type { EventTone } from './learner-calendar';
import { relativeMoment } from './learner-calendar';
import { sessionStatus, type Grade, type SessionStatus, type SessionSummary } from './LearnerSession';

export const statusTone: Record<SessionStatus, EventTone> = { completed: 'done', in_progress: 'current', planned: 'todo', late: 'late' };

const statusIcons: Record<SessionStatus, ReactNode> = {
  completed: <Check size={18} aria-hidden="true" />,
  in_progress: <Play size={16} fill="currentColor" aria-hidden="true" />,
  planned: <BookOpen size={18} aria-hidden="true" />,
  late: <AlertTriangle size={18} aria-hidden="true" />,
};

export const activityIcons: Record<string, ReactNode> = {
  lesson: <BookOpen size={15} aria-hidden="true" />,
  exercise: <PencilLine size={15} aria-hidden="true" />,
  review: <RotateCcw size={15} aria-hidden="true" />,
  assessment: <ClipboardCheck size={15} aria-hidden="true" />,
};

export function doneActivities(session: SessionSummary) {
  return session.activities.filter((activity) => activity.status === 'completed').length;
}

export function plural(count: number, one: string, many = `${one}s`) {
  return `${count} ${count > 1 ? many : one}`;
}

/** Ligne de séance cliquable (même rendu que ListItem, navigation interne). */
export function SessionRow({ session }: { session: SessionSummary }) {
  const done = doneActivities(session);
  const status = sessionStatus[session.status];
  return (
    <Link className="kit-list-item ld-session-row" to={`/espace/seance/${session.id}`}>
      <span className={`ld-status-icon is-${session.status}`}>{statusIcons[session.status]}</span>
      <span className="kit-list-main">
        <strong>{session.title}</strong>
        <small>{relativeMoment(session.dueAt)} · {session.estimatedMinutes} min · {done}/{session.activities.length} activités</small>
      </span>
      <span className="kit-list-end"><Badge tone={status.tone}>{status.label}</Badge><ChevronRight size={18} aria-hidden="true" /></span>
    </Link>
  );
}

/** Avatar du professeur référent (son nom n'est pas transmis à l'élève). */
export function TeacherAvatar({ size = 36 }: { size?: number }) {
  return (
    <span className="ld-teacher-avatar" aria-hidden="true" style={{ width: size, height: size }}>
      <GraduationCap size={Math.round(size * .5)} />
    </span>
  );
}

export interface LearnerMessage { id: string; text: string; sentAt: string }

/** Nom lisible d'un résultat : l'activité et la séance quand elles sont connues. */
export function gradeTitle(grade: Grade, sessions: SessionSummary[]) {
  const session = grade.sessionId ? sessions.find((item) => item.id === grade.sessionId) : undefined;
  const activity = session && grade.activityId ? session.activities.find((item) => item.id === grade.activityId) : undefined;
  const kind = grade.kind === 'quiz' ? 'Exercice' : 'Évaluation';
  return { title: activity?.title ?? session?.title ?? kind, context: session ? (activity ? session.title : kind) : undefined };
}

export const scoreOf = (grade: Grade) => (grade.total ? Math.round((grade.correct / grade.total) * 100) : 0);
export const passed = (score: number) => score >= 70;
export const scoreColor = (score: number) => (passed(score) ? 'var(--success)' : 'var(--warning)');

export function byDate<T>(items: T[], date: (item: T) => string) {
  return [...items].sort((left, right) => new Date(date(left)).getTime() - new Date(date(right)).getTime());
}
