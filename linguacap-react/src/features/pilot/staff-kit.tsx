/**
 * Briques communes de l'espace professeur : types du suivi, état en direct de chaque élève (accueil et parcours),
 * formats de date, chargement de la vue d'ensemble, compositeur d'encouragement et panneau latéral d'envoi.
 */
import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { AlertTriangle, CircleCheck, Loader2, RefreshCw, Send } from 'lucide-react';
import { Avatar, Callout, Chip, Drawer, useToast } from '../../design/kit';
import { requestApi, type Profile } from '../../integration/api';
import { levelCodes, type LearnerLearningState, type LevelCode, type StartLevel } from '../../integration/v2';
import type { ReviewQueueItem } from '../../integration/v4';
import type { BadgeTone } from '../../components/ui';

export interface TrackingAlert {
  id: string; status: 'open' | 'suspended' | 'closed'; reason: string; lateSessions: number; nextMilestone: string | null;
  nextMilestoneDueAt: string | null; midtermOverdue: boolean; openedAt: string; closedAt: string | null; encouragedAt: string | null;
}
export type ExamResults = Record<string, { percent: number; decision: string; onTime: boolean; scores: Record<string, { percent: number }> }>;
/**
 * Synthèse périodique du Suivi. `pendingGrading` : copies en attente sur tous les niveaux de l'élève ; en pause,
 * `lateSessions` ne compte que les séances échues avant la pause et `nextDueAt` vaut la reprise prévue.
 */
export interface TrackingSummary {
  enrollmentId?: string; levelCode?: string | null; goalStatus?: string; targetDate?: string | null; initialTargetDate?: string | null;
  resumeDate?: string | null; lastActivityAt?: string | null; practiceMinutes?: number; sessionsCompleted?: number; sessionsOnTime?: number;
  pendingGrading?: number; lateSessions?: number; nextDueAt?: string | null; alert?: TrackingAlert | null;
  /** Résultats d'examen de l'objectif le plus récent ; la fiche reçoit aussi ceux de chaque niveau. */
  results?: ExamResults; resultsByLevel?: Record<string, ExamResults>;
}
/** Fin du dernier traitement périodique réussi du Suivi, et état du dernier lancement. */
export interface TrackingFreshness { syncedAt: string | null; lastStatus?: string | null }
export interface LearnerOverview {
  learnerId: string;
  profile: Pick<Profile, 'id' | 'displayName'> & { teacherId: string | null };
  /** null quand Apprentissage n'a pas répondu (la vue reste servie avec la synthèse du Suivi). */
  progress: { completedCount: number; goal: { level: string } | null } | null;
  results: { correct: number; total: number }[];
  tracking?: TrackingSummary;
  /** Accueil et parcours lus en direct (EVO-039) ; null si Apprentissage est indisponible, absent avant le déploiement. */
  learning?: LearnerLearningState | null;
}

export const goalStatusNames: Record<string, string> = {
  preparing: 'En préparation', active: 'En cours', paused: 'En pause', awaiting_assessment: 'En attente d’évaluation',
  awaiting_grading: 'En attente de correction', validated: 'Validé', to_consolidate: 'À consolider',
};
const goalStatusTones: Record<string, BadgeTone> = {
  preparing: 'violet', active: 'blue', paused: 'neutral', awaiting_assessment: 'amber', awaiting_grading: 'amber',
  validated: 'green', to_consolidate: 'amber',
};
/** Noms des filtres d'état de la liste : états de l'objectif, accueil en cours et élèves sans parcours. */
export const learnerStatusNames: Record<string, string> = { ...goalStatusNames, onboarding: 'Accueil en cours', none: 'Sans parcours' };

export function goalStatusOf(code?: string | null): { label: string; tone: BadgeTone } {
  if (!code) return { label: 'Sans parcours', tone: 'neutral' };
  return { label: goalStatusNames[code] ?? code, tone: goalStatusTones[code] ?? 'neutral' };
}

/** État affiché d'un élève ; `code` sert aux filtres et aux compteurs (état de l'objectif, `onboarding` ou `none`). */
export interface LearnerStatus { code: string; label: string; tone: BadgeTone }

/** Étape de l'accueil où se trouve un élève qui n'a pas encore de parcours. */
export function onboardingStatusOf(learning: LearnerLearningState): LearnerStatus {
  const { steps, placement } = learning.onboarding;
  const current = steps.find((step) => step.status === 'current' || step.status === 'blocked');
  const blocked = current?.status === 'blocked';
  const label = !current ? 'Accueil en cours'
    : current.id === 'language' ? blocked ? 'Langue pas encore ouverte' : 'Langue à choisir'
    : current.id === 'placement' ? blocked ? 'Test indisponible' : placement?.status === 'in_progress' ? 'Test en cours' : 'Test à passer'
    : current.id === 'result' || current.id === 'objective' ? blocked ? 'Aucun niveau à viser' : 'Objectif à choisir'
    : 'Accueil en cours';
  return { code: 'onboarding', label, tone: blocked ? 'amber' : 'neutral' };
}

/**
 * État d'un élève pour le professeur : parcours lu en direct (brouillon compris), sinon étape de l'accueil, sinon
 * état de l'objectif connu (inscription ou synthèse du Suivi, avant le déploiement ou si Apprentissage ne répond pas).
 */
export function learnerStatusOf(learning: LearnerLearningState | null | undefined, fallback?: string | null): LearnerStatus {
  const path = learning?.path;
  if (path?.status === 'draft') return { code: 'preparing', label: 'Parcours en préparation', tone: 'violet' };
  if (path) {
    const code = path.goalStatus ?? fallback ?? (path.status === 'completed' ? 'validated' : 'active');
    return { code, ...goalStatusOf(code) };
  }
  if (learning) return onboardingStatusOf(learning);
  return { code: fallback ?? 'none', ...goalStatusOf(fallback) };
}

/** Niveau qui suit un point de départ : premier niveau d'un parcours au brouillon (A0 → A1). */
export function firstLevelAfter(start: StartLevel): LevelCode | null {
  return levelCodes[levelCodes.indexOf(start as LevelCode) + 1] ?? null;
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

/** Niveau en cours : lu en direct (premier niveau d'un brouillon), sinon synthèse du Suivi ou ancien objectif. */
export function levelOf(learner: LearnerOverview) {
  const path = learner.learning?.path;
  const live = path ? path.activeLevel ?? (path.status === 'draft' ? firstLevelAfter(path.startLevel) : null) : null;
  return live ?? learner.tracking?.levelCode ?? learner.progress?.goal?.level ?? null;
}

/** État affiché d'un élève de la vue d'ensemble. */
export function overviewStatusOf(learner: LearnerOverview) {
  return learnerStatusOf(learner.learning, learner.tracking?.goalStatus);
}

/** Apprentissage n'a répondu pour aucun élève : les écrans le signalent (les données en direct manquent). */
export function learningUnavailable(learners: LearnerOverview[]) {
  return learners.length > 0 && learners.every((learner) => learner.learning === null);
}

/** Taux de bonnes réponses aux exercices remis, ou null sans résultat. */
export function successRate(learner: LearnerOverview) {
  const total = learner.results.reduce((sum, result) => sum + result.total, 0);
  return total ? Math.round((learner.results.reduce((sum, result) => sum + result.correct, 0) / total) * 100) : null;
}

/** Élève en pause (état lu en direct, sinon synthèse du Suivi) : ni relance ni échéance tant qu'il n'a pas repris. */
export function isPaused(learner: LearnerOverview) {
  return overviewStatusOf(learner).code === 'paused';
}

/** Élève à relancer : alerte ouverte ou séance en retard, hors pause. */
export function needsFollowUp(learner: LearnerOverview) {
  return !isPaused(learner) && (Boolean(openAlert(learner)) || (learner.tracking?.lateSessions ?? 0) > 0);
}

/** Prochaine séance dans les sept jours (un élève en pause n'en a pas : sa date est celle de la reprise). */
export function dueWithinWeek(learner: LearnerOverview, now = Date.now()) {
  if (isPaused(learner)) return false;
  const next = learner.tracking?.nextDueAt ? new Date(learner.tracking.nextDueAt).getTime() : NaN;
  return next >= now && next <= now + 7 * DAY;
}

export function useOverview(token: string) {
  const [learners, setLearners] = useState<LearnerOverview[] | null>(null);
  const [freshness, setFreshness] = useState<TrackingFreshness | null>(null);
  const [error, setError] = useState('');
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    let active = true;
    setError('');
    requestApi<{ learners: LearnerOverview[]; freshness?: TrackingFreshness }>('/tracking/overview', token).then(
      (data) => { if (active) { setLearners(data.learners); setFreshness(data.freshness ?? null); } },
      (requestError: unknown) => { if (active) setError(errorText(requestError)); },
    );
    return () => { active = false; };
  }, [token, refresh]);

  return { learners, freshness, error, reload: () => setRefresh((count) => count + 1) };
}

/** Remises d'un élève qui attendent une correction : copies d'examen, missions et répétitions orales. */
export interface LearnerCorrections { copies: number; missions: number; oral: number; total: number }

/**
 * Files de correction lues en direct (GET /assessments/grading et /assessments/reviews, comme la page Corrections),
 * regroupées par élève. La synthèse périodique du Suivi ne compte que les copies d'examen : elle ne sert plus que de
 * repli si une file ne répond pas (`byLearner` reste alors null).
 */
export function useCorrections(token: string) {
  const [byLearner, setByLearner] = useState<Map<string, LearnerCorrections> | null>(null);
  const [total, setTotal] = useState<LearnerCorrections | null>(null);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    let active = true;
    Promise.all([
      requestApi<{ learnerId: string }[]>('/assessments/grading', token),
      requestApi<ReviewQueueItem[]>('/assessments/reviews', token),
    ]).then(([copies, reviews]) => {
      if (!active) return;
      const map = new Map<string, LearnerCorrections>();
      const sum: LearnerCorrections = { copies: 0, missions: 0, oral: 0, total: 0 };
      const add = (learnerId: string, kind: 'copies' | 'missions' | 'oral') => {
        const entry = map.get(learnerId) ?? { copies: 0, missions: 0, oral: 0, total: 0 };
        entry[kind] += 1;
        entry.total += 1;
        sum[kind] += 1;
        sum.total += 1;
        map.set(learnerId, entry);
      };
      copies.forEach((item) => add(item.learnerId, 'copies'));
      reviews.forEach((item) => add(item.learnerId, item.kind === 'mission' ? 'missions' : 'oral'));
      setByLearner(map);
      setTotal(sum);
    }, () => { if (active) { setByLearner(null); setTotal(null); } });
    return () => { active = false; };
  }, [token, refresh]);

  return { byLearner, total, reload: useCallback(() => setRefresh((count) => count + 1), []) };
}

/** Remises à corriger d'un élève : files en direct, sinon les copies d'examen de la synthèse du Suivi. */
export function pendingCorrections(learner: { learnerId: string; tracking?: TrackingSummary }, byLearner: Map<string, LearnerCorrections> | null) {
  return byLearner ? byLearner.get(learner.learnerId)?.total ?? 0 : learner.tracking?.pendingGrading ?? 0;
}

/** Détail lisible des remises à corriger : « 1 copie · 2 missions · 1 répétition ». */
export function correctionsText(corrections: LearnerCorrections | null | undefined) {
  if (!corrections?.total) return 'Rien en attente';
  return [
    corrections.copies ? plural(corrections.copies, 'copie', 'copies') : '',
    corrections.missions ? plural(corrections.missions, 'mission', 'missions') : '',
    corrections.oral ? plural(corrections.oral, 'répétition', 'répétitions') : '',
  ].filter(Boolean).join(' · ');
}

const freshnessStamp = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' });

/** « il y a 2 heures », « hier » ; au-delà d'un mois, la date. */
function sinceText(value: string, now = Date.now()) {
  const seconds = Math.round((new Date(value).getTime() - now) / 1000);
  const abs = Math.abs(seconds);
  if (abs < 60) return 'à l’instant';
  if (abs < 3600) return relative.format(Math.round(seconds / 60), 'minute');
  if (abs < 86_400) return relative.format(Math.round(seconds / 3600), 'hour');
  if (abs < 30 * 86_400) return relative.format(Math.round(seconds / 86_400), 'day');
  return `le ${shortDate.format(new Date(value))}`;
}

/**
 * Fraîcheur des chiffres périodiques (retards, alertes, temps de pratique, dernière activité), sur le modèle de
 * l'indicateur des statistiques : le reste de l'écran est lu en direct.
 */
export function StaffFreshness({ freshness }: { freshness: TrackingFreshness | null | undefined }) {
  const syncedAt = freshness?.syncedAt ?? null;
  const failed = freshness?.lastStatus === 'failed';
  const running = freshness?.lastStatus === 'running';
  const stale = !syncedAt || Date.now() - new Date(syncedAt).getTime() > 36 * 3_600_000;
  const tone = failed || !syncedAt ? ' is-warning' : stale ? ' is-stale' : '';
  return (
    <span className={`staff-freshness${tone}`} title={syncedAt ? `Suivi actualisé le ${freshnessStamp.format(new Date(syncedAt))}` : undefined}>
      {running ? <Loader2 size={14} aria-hidden="true" /> : failed || !syncedAt ? <AlertTriangle size={14} aria-hidden="true" /> : <CircleCheck size={14} aria-hidden="true" />}
      {syncedAt ? `Suivi actualisé ${sinceText(syncedAt)}` : 'Suivi pas encore actualisé'}
      {failed && ' · dernière actualisation en échec'}
      {running && ' · actualisation en cours'}
    </span>
  );
}

/** Apprentissage n'a pas répondu : la vue reste servie avec la dernière synthèse du Suivi. */
export function LearningUnavailableNotice({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="staff-live-notice" role="status">
      <Callout tone="warning" title="Parcours momentanément indisponibles">
        <p>Les états affichés viennent de la dernière synchronisation du suivi : un parcours tout juste créé peut manquer.</p>
        {onRetry && <button type="button" className="btn btn-sm btn-outline" onClick={onRetry}><RefreshCw size={15} aria-hidden="true" /> Actualiser</button>}
      </Callout>
    </div>
  );
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
