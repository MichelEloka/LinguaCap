/**
 * Briques communes de l'espace professeur : types du suivi, formats de date, chargement de la vue d'ensemble,
 * compositeur d'encouragement et panneau latéral d'envoi.
 */
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { AlertTriangle, RefreshCw, Send } from 'lucide-react';
import { Avatar, Chip, Drawer, useToast } from '../../design/kit';
import { requestApi, type Profile } from '../../integration/api';
import type { BadgeTone } from '../../components/ui';

export interface TrackingAlert {
  id: string; status: 'open' | 'suspended' | 'closed'; reason: string; lateSessions: number; nextMilestone: string | null;
  nextMilestoneDueAt: string | null; midtermOverdue: boolean; openedAt: string; closedAt: string | null; encouragedAt: string | null;
}
export interface TrackingSummary {
  enrollmentId?: string; levelCode?: string | null; goalStatus?: string; targetDate?: string | null; initialTargetDate?: string | null;
  lastActivityAt?: string | null; practiceMinutes?: number; sessionsCompleted?: number; sessionsOnTime?: number;
  pendingGrading?: number; lateSessions?: number; nextDueAt?: string | null; alert?: TrackingAlert | null;
  results?: Record<string, { percent: number; decision: string; onTime: boolean; scores: Record<string, { percent: number }> }>;
}
export interface LearnerOverview {
  learnerId: string;
  profile: Pick<Profile, 'id' | 'displayName'> & { teacherId: string | null };
  progress: { completedCount: number; goal: { level: string } | null };
  results: { correct: number; total: number }[];
  tracking?: TrackingSummary;
}

export const goalStatusNames: Record<string, string> = {
  preparing: 'En préparation', active: 'En cours', paused: 'En pause', awaiting_assessment: 'En attente d’évaluation',
  awaiting_grading: 'En attente de correction', validated: 'Validé', to_consolidate: 'À consolider',
};
const goalStatusTones: Record<string, BadgeTone> = {
  preparing: 'violet', active: 'blue', paused: 'neutral', awaiting_assessment: 'amber', awaiting_grading: 'amber',
  validated: 'green', to_consolidate: 'amber',
};

export function goalStatusOf(code?: string | null): { label: string; tone: BadgeTone } {
  if (!code) return { label: 'Sans parcours', tone: 'neutral' };
  return { label: goalStatusNames[code] ?? code, tone: goalStatusTones[code] ?? 'neutral' };
}

export const shortDate = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' });
export const mediumDate = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' });
export const dateTime = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
const dayNumber = new Intl.DateTimeFormat('fr-FR', { day: 'numeric' });
const monthShort = new Intl.DateTimeFormat('fr-FR', { month: 'short' });
const relative = new Intl.RelativeTimeFormat('fr', { numeric: 'auto' });
const DAY = 86_400_000;

function startOfDay(value: Date) {
  const copy = new Date(value);
  copy.setHours(0, 0, 0, 0);
  return copy.getTime();
}

/** Nombre de jours calendaires entre aujourd'hui et la date (négatif dans le passé). */
export function dayOffset(value: string) {
  return Math.round((startOfDay(new Date(value)) - startOfDay(new Date())) / DAY);
}

/** « aujourd’hui », « hier », « dans 3 jours » ; au-delà d'une semaine, la date courte. */
export function relativeDay(value: string) {
  const offset = dayOffset(value);
  return Math.abs(offset) > 6 ? `le ${shortDate.format(new Date(value))}` : relative.format(offset, 'day');
}

export function DateTile({ value, tone }: { value: string; tone?: 'late' | 'today' }) {
  const date = new Date(value);
  return (
    <span className={`staff-date-tile${tone ? ` is-${tone}` : ''}`} aria-hidden="true">
      <b>{dayNumber.format(date)}</b><small>{monthShort.format(date).replace('.', '')}</small>
    </span>
  );
}

export function formatMinutes(minutes: number) {
  if (minutes < 60) return `${minutes} min`;
  const rest = minutes % 60;
  return `${Math.floor(minutes / 60)} h${rest ? ` ${String(rest).padStart(2, '0')}` : ''}`;
}

export function plural(count: number, one: string, many: string) {
  return `${count} ${count === 1 ? one : many}`;
}

export function errorText(error: unknown) {
  return error instanceof Error ? error.message : 'Cette action est temporairement indisponible.';
}

export function learnerUrl(id: string, tab?: string) {
  return `/espace/eleves/${encodeURIComponent(id)}${tab ? `?onglet=${tab}` : ''}`;
}

export function openAlert(learner: LearnerOverview) {
  return learner.tracking?.alert?.status === 'open' ? learner.tracking.alert : null;
}

export function levelOf(learner: LearnerOverview) {
  return learner.tracking?.levelCode ?? learner.progress.goal?.level ?? null;
}

/** Taux de bonnes réponses aux exercices remis, ou null sans résultat. */
export function successRate(learner: LearnerOverview) {
  const total = learner.results.reduce((sum, result) => sum + result.total, 0);
  return total ? Math.round((learner.results.reduce((sum, result) => sum + result.correct, 0) / total) * 100) : null;
}

/** Élève à relancer : alerte ouverte ou séance en retard. */
export function needsFollowUp(learner: LearnerOverview) {
  return Boolean(openAlert(learner)) || (learner.tracking?.lateSessions ?? 0) > 0;
}

export function dueWithinWeek(learner: LearnerOverview, now = Date.now()) {
  const next = learner.tracking?.nextDueAt ? new Date(learner.tracking.nextDueAt).getTime() : NaN;
  return next >= now && next <= now + 7 * DAY;
}

export function useOverview(token: string) {
  const [learners, setLearners] = useState<LearnerOverview[] | null>(null);
  const [freshness, setFreshness] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    let active = true;
    setError('');
    requestApi<{ learners: LearnerOverview[]; freshness?: { syncedAt: string | null } }>('/tracking/overview', token).then(
      (data) => { if (active) { setLearners(data.learners); setFreshness(data.freshness?.syncedAt ?? null); } },
      (requestError: unknown) => { if (active) setError(errorText(requestError)); },
    );
    return () => { active = false; };
  }, [token, refresh]);

  return { learners, freshness, error, reload: () => setRefresh((count) => count + 1) };
}

export function StaffError({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="staff-error" role="alert">
      <span className="staff-error-icon" aria-hidden="true"><AlertTriangle size={18} /></span>
      <p>{message}</p>
      {onRetry && <button type="button" className="btn btn-sm btn-outline" onClick={onRetry}><RefreshCw size={15} aria-hidden="true" /> Réessayer</button>}
    </div>
  );
}

const MAX_MESSAGE = 500;

/** Compositeur d'encouragement : messages suggérés, compteur de caractères et notification à l'envoi. */
export function StaffComposer({ learnerId, name, alert, token, onSent, autoFocus = false }: {
  learnerId: string; name: string; alert?: TrackingAlert | null; token: string; onSent?: () => void; autoFocus?: boolean;
}) {
  const toast = useToast();
  const field = useRef<HTMLTextAreaElement>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [text, setText] = useState('');
  const first = name.trim().split(/\s+/)[0] || name;
  const suggestions = [
    { label: 'Féliciter', text: `Bravo ${first} pour ton travail ! Continue sur cette lancée.` },
    { label: 'Relancer', text: `Bonjour ${first}, une séance t’attend. Prends un moment aujourd’hui pour la rattraper : tu vas y arriver !` },
    { label: 'Proposer de l’aide', text: `Bonjour ${first}, si quelque chose te bloque, dis-le-moi : nous trouverons une solution ensemble.` },
  ];

  useEffect(() => {
    if (!autoFocus) return;
    const frame = requestAnimationFrame(() => field.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, [autoFocus]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    if (!text.trim()) {
      setError('Écrivez un message avant de l’envoyer.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await requestApi<unknown>('/tracking/messages', token, {
        method: 'POST',
        body: { learnerId, text: text.trim(), ...(alert ? { alertId: alert.id } : {}) },
      });
      setText('');
      toast(`Message envoyé à ${name}.`);
      onSent?.();
    } catch (requestError) {
      setError(errorText(requestError));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="staff-composer" onSubmit={submit} aria-label={`Encourager ${name}`}>
      <div className="staff-composer-to">
        <Avatar name={name} size={30} />
        <span>À <strong>{name}</strong></span>
        {alert && <span className="staff-composer-link">Rattaché à l’alerte en cours</span>}
      </div>
      <div className="staff-composer-suggestions" role="group" aria-label="Messages suggérés">
        {suggestions.map((suggestion) => (
          <Chip key={suggestion.label} selected={text === suggestion.text} onClick={() => { setText(suggestion.text); field.current?.focus(); }}>
            {suggestion.label}
          </Chip>
        ))}
      </div>
      <label className="staff-composer-field">
        <span className="sr-only">Message</span>
        <textarea ref={field} name="text" rows={4} required maxLength={MAX_MESSAGE} value={text} placeholder={`Écrire à ${first}…`}
          onChange={(event) => setText(event.target.value)} />
      </label>
      {error && <p className="inline-message warning" role="alert">{error}</p>}
      <div className="staff-composer-foot">
        <small>{text.length} / {MAX_MESSAGE}</small>
        <button type="submit" className="btn btn-primary" disabled={busy}>
          <Send size={16} aria-hidden="true" /> {busy ? 'Envoi…' : 'Envoyer'}
        </button>
      </div>
    </form>
  );
}

/** Panneau latéral d'encouragement ouvert depuis une liste. */
export function EncourageDrawer({ learner, token, onClose, onSent }: {
  learner: LearnerOverview; token: string; onClose: () => void; onSent: () => void;
}) {
  const alert = openAlert(learner);
  return (
    <Drawer title={`Encourager ${learner.profile.displayName}`} onClose={onClose}
      description={alert?.reason ?? 'Un mot bienveillant aide à garder le rythme.'}>
      <StaffComposer learnerId={learner.learnerId} name={learner.profile.displayName} alert={alert} token={token} autoFocus onSent={onSent} />
    </Drawer>
  );
}
