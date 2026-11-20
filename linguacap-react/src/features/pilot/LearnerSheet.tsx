import { useEffect, useId, useState, type FormEvent, type ReactNode } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Activity, AlarmClock, AlertTriangle, ArrowLeft, BarChart3, Bell, CalendarClock, CalendarDays, Check, CheckCircle2, ClipboardCheck,
  Clock, ListChecks, MessageCircle, MessagesSquare, PauseCircle, Play, RefreshCw, Route, Send, ShieldCheck, Target, Timer, Trophy,
} from 'lucide-react';
import { Badge, EmptyState, ProgressBar, StatCard, type BadgeTone } from '../../components/ui';
import {
  Avatar, Bars, Card, Drawer, ProgressRing, Segmented, Skeleton, SkeletonCard, TabPanel, Tabs, Timeline, useToast, type TimelineEntry,
} from '../../design/kit';
import { requestApi } from '../../integration/api';
import { formatDue, sessionStatus, type Grade, type SessionSummary } from './LearnerSession';
import { GoalPanel, type PlannedEnrollment } from './GoalPanel';
import type { TrackingAlert, TrackingSummary } from './StaffPilot';
import {
  DateTile, StaffComposer, StaffError, dateTime, dayOffset, errorText, formatMinutes, goalStatusOf, mediumDate, plural, relativeDay, shortDate,
} from './staff-kit';

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
const alertStatus: Record<TrackingAlert['status'], { label: string; tone: TimelineEntry['tone']; icon: ReactNode }> = {
  open: { label: 'Ouverte', tone: 'warning', icon: <Bell size={14} /> },
  suspended: { label: 'Suspendue (pause)', tone: 'brand', icon: <PauseCircle size={14} /> },
  closed: { label: 'Close', tone: 'success', icon: <CheckCircle2 size={14} /> },
};
const decisions: Record<string, { label: string; tone: BadgeTone }> = {
  validated: { label: 'Validé', tone: 'green' }, to_consolidate: { label: 'À consolider', tone: 'amber' }, completed: { label: 'Bilan corrigé', tone: 'blue' },
};
const sessionIcons: Record<SessionSummary['status'], ReactNode> = {
  completed: <Check size={15} strokeWidth={3} />, late: <AlertTriangle size={14} />, in_progress: <Play size={13} fill="currentColor" />, planned: null,
};
type SessionFilter = 'toutes' | 'a-faire' | 'retard' | 'terminees';
const sessionFilters: { value: SessionFilter; label: string }[] = [
  { value: 'toutes', label: 'Toutes' }, { value: 'a-faire', label: 'À faire' }, { value: 'retard', label: 'En retard' }, { value: 'terminees', label: 'Terminées' },
];
const tabIds = ['seances', 'objectif', 'resultats', 'messages'] as const;
type SheetTab = typeof tabIds[number];

function inDays(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Attribution d'un parcours publié et de l'échéance de la première séance (DEV-029). */
function AssignTrack({ learnerId, token, formId, onAssigned, onBusy }: {
  learnerId: string; token: string; formId: string; onAssigned: () => void; onBusy: (busy: boolean) => void;
}) {
  const [tracks, setTracks] = useState<Track[] | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    requestApi<Track[]>('/tracks', token).then(
      (data) => { if (active) setTracks(data); },
      (failure: unknown) => { if (active) setError(errorText(failure)); },
    );
    return () => { active = false; };
  }, [token]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const form = new FormData(event.currentTarget);
    setBusy(true);
    onBusy(true);
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
      setError(errorText(failure));
    } finally {
      setBusy(false);
      onBusy(false);
    }
  }

  if (tracks === null) return error ? <StaffError message={error} /> : <SkeletonCard lines={4} label="Chargement des parcours…" />;
  if (tracks.length === 0) {
    return <EmptyState icon={<Route size={26} />} title="Aucun parcours publié" description="Publiez une version de parcours dans le catalogue pour l’attribuer." />;
  }
  return (
    <form id={formId} className="staff-form" onSubmit={submit}>
      <label>Parcours
        <select name="trackVersionId" required defaultValue={tracks[0].versionId}>
          {tracks.map((track) => (
            <option key={track.versionId} value={track.versionId}>
              {track.levelTitle} · version {track.number} · {track.activityCount} activités, {track.totalMinutes} min
            </option>
          ))}
        </select>
      </label>
      <div className="staff-form-row">
        <label>Niveau de départ
          <select name="startLevel" defaultValue="A0">
            <option value="A0">Débutant</option><option value="A1">A1</option><option value="A2">A2</option><option value="B1">B1</option>
          </select>
        </label>
        <label>Début<input type="date" name="startDate" required min={inDays(0)} defaultValue={inDays(0)} /></label>
      </div>
      <fieldset className="staff-rhythm">
        <legend>Rythme</legend>
        <label className="staff-rhythm-option">
          <input type="radio" name="template" value="intensive" defaultChecked />
          <span><strong>Intensif</strong><small>2 séances de 45 min par jour · A1 en un mois, A2 en deux mois</small></span>
        </label>
        <label className="staff-rhythm-option">
          <input type="radio" name="template" value="standard" />
          <span><strong>Standard</strong><small>1 séance de 30 min du lundi au vendredi</small></span>
        </label>
      </fieldset>
      <label>Date cible (facultative : la durée du rythme par défaut)<input type="date" name="targetDate" min={inDays(1)} /></label>
      {tracks.some((track) => track.prerequisiteLevelCode) && (
        <p className="staff-hint">Un parcours A2 suppose A1 validé dans LinguaCap ou confirmé par le diagnostic de l’élève.</p>
      )}
      {error && <p className="inline-message warning" role="alert">{error}</p>}
    </form>
  );
}

function Figure({ icon, label, value, tone }: { icon: ReactNode; label: string; value: ReactNode; tone?: 'warning' | 'success' }) {
  return (
    <div className={`staff-figure${tone ? ` is-${tone}` : ''}`}>
      <span className="staff-figure-icon" aria-hidden="true">{icon}</span>
      <span><strong>{value}</strong><small>{label}</small></span>
    </div>
  );
}

function SessionRow({ session }: { session: SessionSummary }) {
  const done = session.activities.filter((activity) => activity.status === 'completed').length;
  const total = session.activities.length;
  const status = sessionStatus[session.status];
  return (
    <li className={`staff-session is-${session.status}`}>
      <span className="staff-session-marker" aria-hidden="true">{sessionIcons[session.status] ?? session.position}</span>
      <div className="staff-session-body">
        <div className="staff-session-head">
          <strong>Séance {session.position} · {session.title}</strong>
          <Badge tone={status.tone}>{status.label}</Badge>
        </div>
        <div className="staff-session-meta">
          <span><CalendarDays size={14} aria-hidden="true" /> Échéance le {formatDue(session.dueAt)}</span>
          <span><ListChecks size={14} aria-hidden="true" /> {done} / {total} activités terminées</span>
        </div>
        {total > 0 && <ProgressBar value={(done / total) * 100} label={`Activités terminées, séance ${session.position}`} />}
      </div>
    </li>
  );
}

function SessionsTab({ sheet, onAssign, onPlanning }: { sheet: Sheet; onAssign: () => void; onPlanning: () => void }) {
  const [filter, setFilter] = useState<SessionFilter>('toutes');
  const enrollment = sheet.enrollment;
  const sessions = enrollment?.sessions ?? [];
  const visible = sessions.filter((session) => filter === 'toutes' ? true
    : filter === 'terminees' ? session.status === 'completed'
    : filter === 'retard' ? session.status === 'late'
    : session.status !== 'completed');
  const next = sessions.filter((session) => session.status !== 'completed')
    .sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime())[0];
  const alerts = sheet.tracking?.alerts ?? [];
  const late = sessions.filter((session) => session.status === 'late').length;

  return (
    <div className="staff-sheet-grid">
      <Card title="Séances" className="staff-sessions-card"
        description={enrollment ? `Attribué le ${mediumDate.format(new Date(enrollment.assignedAt))}${enrollment.supersededSessions > 0
          ? ` · ${plural(enrollment.supersededSessions, 'séance replanifiée', 'séances replanifiées')}` : ''}` : undefined}
        action={sessions.length > 0 && <Segmented label="Filtrer les séances" value={filter} onChange={setFilter} options={sessionFilters} />}>
        {!enrollment ? (
          <EmptyState icon={<Route size={26} />} title="Aucun parcours attribué" description="Attribuez un parcours publié pour planifier les séances."
            action={<button type="button" className="btn btn-primary" onClick={onAssign}>Attribuer un parcours</button>} />
        ) : sessions.length === 0 ? (
          <EmptyState icon={<CalendarClock size={26} />} title="Séances bientôt publiées" description="Les séances seront publiées à la validation du planning."
            action={<button type="button" className="btn btn-outline" onClick={onPlanning}>Voir le planning</button>} />
        ) : visible.length === 0 ? (
          <EmptyState icon={<CheckCircle2 size={26} />} title="Aucune séance dans ce filtre" />
        ) : (
          <ol className="staff-sessions lc-stagger">
            {visible.map((session) => <SessionRow key={session.id} session={session} />)}
          </ol>
        )}
      </Card>

      <div className="staff-col staff-sheet-side">
        <Card title="Prochaine séance" icon={<CalendarClock size={18} />}>
          {next ? (
            <div className="staff-next">
              <DateTile value={next.dueAt} tone={next.status === 'late' ? 'late' : dayOffset(next.dueAt) <= 0 ? 'today' : undefined} />
              <span className="staff-row-main">
                <strong>{next.title}</strong>
                <small>{next.status === 'late' ? 'En retard' : `À rendre ${relativeDay(next.dueAt)}`} · {plural(next.activities.length, 'activité', 'activités')}</small>
              </span>
            </div>
          ) : <p className="staff-muted">{enrollment ? 'Toutes les séances publiées sont terminées.' : 'Aucune séance planifiée.'}</p>}
          {late > 0 && <p className="staff-late-note"><AlarmClock size={16} aria-hidden="true" /> {plural(late, 'séance', 'séances')} à rattraper</p>}
        </Card>

        <Card title="Alertes de suivi" icon={<Bell size={18} />}>
          {alerts.length ? (
            <Timeline items={alerts.map((alert) => ({
              id: alert.id, tone: alertStatus[alert.status].tone, icon: alertStatus[alert.status].icon,
              title: `${alertStatus[alert.status].label} · ${alert.reason}`,
              meta: `Ouverte le ${mediumDate.format(new Date(alert.openedAt))}${alert.closedAt ? ` · close le ${mediumDate.format(new Date(alert.closedAt))}` : ''}`,
            }))} />
          ) : (
            <div className="staff-quiet"><ShieldCheck size={20} aria-hidden="true" /><span>Aucune alerte : l’élève suit son rythme.</span></div>
          )}
        </Card>
      </div>
    </div>
  );
}

function scoreTone(percent: number) {
  return percent >= 80 ? 'success' : percent >= 50 ? 'brand' : 'warning';
}

function ResultsTab({ sheet }: { sheet: Sheet }) {
  const exams = Object.entries(sheet.tracking?.results ?? {});
  const grades = [...sheet.results].sort((a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime());
  const percent = (grade: Grade) => grade.total ? Math.round((grade.correct / grade.total) * 100) : 0;
  const totalCorrect = grades.reduce((sum, grade) => sum + grade.correct, 0);
  const totalAsked = grades.reduce((sum, grade) => sum + grade.total, 0);
  const average = totalAsked ? Math.round((totalCorrect / totalAsked) * 100) : null;
  const best = grades.length ? Math.max(...grades.map(percent)) : null;
  const seen = new Map<string, number>();
  const bars = grades.slice(-12).map((grade) => {
    const day = shortDate.format(new Date(grade.submittedAt));
    const count = (seen.get(day) ?? 0) + 1;
    seen.set(day, count);
    return { label: count > 1 ? `${day} (${count})` : day, value: percent(grade), display: `${percent(grade)} %` };
  });

  if (!exams.length && !grades.length) {
    return <Card><EmptyState icon={<BarChart3 size={26} />} title="Aucun exercice remis" description="Les scores apparaîtront ici dès le premier exercice terminé." /></Card>;
  }
  return (
    <div className="staff-page-body">
      <div className="staff-kpis is-three lc-stagger">
        <StatCard label="Réussite moyenne" value={average === null ? '—' : `${average} %`} note={`${totalCorrect} bonnes réponses sur ${totalAsked}`} icon={<Target size={20} />} />
        <StatCard label="Exercices remis" value={grades.length} note={grades.length ? `Dernier ${relativeDay(grades[grades.length - 1].submittedAt)}` : undefined} icon={<ListChecks size={20} />} />
        <StatCard label="Meilleur score" value={best === null ? '—' : `${best} %`} icon={<Trophy size={20} />} />
      </div>

      {exams.length > 0 && (
        <div className="staff-exams">
          {exams.map(([kind, result]) => {
            const decision = decisions[result.decision] ?? { label: result.decision, tone: 'neutral' as const };
            return (
              <Card key={kind} title={kind === 'final' ? 'Examen blanc' : 'Bilan intermédiaire'} icon={<ClipboardCheck size={18} />}
                action={<span className="staff-tags">
                  <Badge tone={result.onTime ? 'green' : 'amber'}>{result.onTime ? 'Remis à temps' : 'Remis après l’échéance'}</Badge>
                  <Badge tone={decision.tone}>{decision.label}</Badge>
                </span>}>
                <div className="staff-exam">
                  <ProgressRing value={result.percent} size={104} stroke={10} color={result.percent >= 60 ? 'var(--success)' : 'var(--warning)'}
                    label={`Score global : ${result.percent} %`}>
                    <span className="staff-ring-text"><strong>{result.percent}%</strong><small>global</small></span>
                  </ProgressRing>
                  <ul className="staff-meters">
                    {Object.entries(result.scores ?? {}).map(([competence, score]) => (
                      <li key={competence} className="staff-meter">
                        <span>{competenceNames[competence] ?? competence}</span>
                        <ProgressBar value={score.percent} label={`${competenceNames[competence] ?? competence} : ${score.percent} %`} />
                        <b>{score.percent} %</b>
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {grades.length > 0 && (
        <div className="staff-sheet-grid">
          <Card title="Scores des exercices" description="Du plus ancien au plus récent" icon={<BarChart3 size={18} />}>
            <Bars data={bars} max={100} height={180} label="Score des exercices remis" />
          </Card>
          <Card title="Derniers exercices" icon={<ListChecks size={18} />} flush>
            <ul className="staff-rows">
              {[...grades].reverse().slice(0, 8).map((grade) => (
                <li key={grade.id} className="staff-grade">
                  <span className={`staff-score is-${scoreTone(percent(grade))}`}>{percent(grade)}%</span>
                  <span className="staff-row-main">
                    <strong>{grade.correct} / {grade.total} bonnes réponses</strong>
                    <small>Remis {relativeDay(grade.submittedAt)}</small>
                  </span>
                  {grade.kind === 'diagnostic' && <Badge tone="violet">Diagnostic</Badge>}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      )}
    </div>
  );
}

function MessagesTab({ sheet, learnerId, token, canMessage, autoFocus, onSent }: {
  sheet: Sheet; learnerId: string; token: string; canMessage: boolean; autoFocus: boolean; onSent: () => void;
}) {
  const messages = [...sheet.messages].sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());
  const alert = sheet.tracking?.alert?.status === 'open' ? sheet.tracking.alert : null;
  return (
    <div className={canMessage ? 'staff-sheet-grid is-messages' : 'staff-page-body'}>
      {canMessage && (
        <Card title="Nouveau message" description="Un mot bienveillant aide à garder le rythme." icon={<Send size={18} />} className="staff-compose-card">
          <StaffComposer learnerId={learnerId} name={sheet.profile.displayName} alert={alert} token={token} autoFocus={autoFocus} onSent={onSent} />
        </Card>
      )}
      <Card title="Encouragements envoyés" description={messages.length ? plural(messages.length, 'message', 'messages') : undefined} icon={<MessagesSquare size={18} />}>
        {messages.length === 0 ? (
          <EmptyState icon={<MessageCircle size={26} />} title="Aucun encouragement envoyé" description="Les messages envoyés à l’élève apparaîtront ici." />
        ) : (
          <ol className="staff-thread lc-stagger">
            {messages.map((message) => (
              <li key={message.id} className="staff-bubble">
                <p>{message.text}</p>
                <span className="staff-bubble-meta">
                  <time dateTime={message.sentAt}>{dateTime.format(new Date(message.sentAt))}</time>
                  {message.alertId && <Badge tone="amber">Alerte</Badge>}
                  {message.resumedAt && <Badge tone="green">Reprise le {mediumDate.format(new Date(message.resumedAt))}</Badge>}
                </span>
              </li>
            ))}
          </ol>
        )}
      </Card>
    </div>
  );
}

function SheetSkeleton() {
  return (
    <div className="staff-page-body" aria-busy="true">
      <div className="staff-profile">
        <div className="staff-profile-top">
          <Skeleton width={64} height={64} radius={32} />
          <div className="staff-profile-id"><h1>Fiche élève</h1><Skeleton width="40%" /></div>
        </div>
      </div>
      <SkeletonCard lines={5} label="Chargement de la fiche…" />
    </div>
  );
}

export function LearnerSheetPage({ learnerId, token, canMessage = false }: { learnerId: string; token: string; canMessage?: boolean }) {
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const [sheet, setSheet] = useState<Sheet | null>(null);
  const [error, setError] = useState('');
  const [reload, setReload] = useState(0);
  const [focusComposer, setFocusComposer] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const formId = useId();
  const id = encodeURIComponent(learnerId);
  const refresh = () => setReload((value) => value + 1);
  const requested = params.get('onglet');
  const tab: SheetTab = tabIds.find((item) => item === requested) ?? 'seances';

  function openTab(next: string) {
    setFocusComposer(false);
    setParams(next === 'seances' ? {} : { onglet: next }, { replace: true });
  }

  useEffect(() => {
    let active = true;
    setError('');
    requestApi<Sheet>(`/tracking/learners/${id}`, token).then(
      (data) => { if (active) setSheet(data); },
      (failure: unknown) => { if (active) setError(errorText(failure)); },
    );
    return () => { active = false; };
  }, [id, token, reload]);

  const enrollment = sheet?.enrollment ?? null;
  const tracking = sheet?.tracking;
  const sessions = enrollment?.sessions ?? [];
  const done = sessions.filter((session) => session.status === 'completed').length;
  const completion = sessions.length ? Math.round((done / sessions.length) * 100) : 0;
  const status = goalStatusOf(enrollment?.goal.status ?? tracking?.goalStatus);
  const openAlert = tracking?.alert?.status === 'open' ? tracking.alert : null;
  const late = tracking?.lateSessions ?? sessions.filter((session) => session.status === 'late').length;
  const completed = tracking?.sessionsCompleted ?? done;

  return (
    <div className="staff-page staff-sheet">
      <Link className="text-link staff-back-link" to="/espace/eleves"><ArrowLeft size={16} aria-hidden="true" /> Retour aux élèves</Link>
      {error && <StaffError message={error} onRetry={refresh} />}
      {!sheet && !error && <SheetSkeleton />}
      {sheet && (
        <>
          <section className="staff-profile lc-enter" aria-label="Profil de l’élève">
            <div className="staff-profile-top">
              <Avatar name={sheet.profile.displayName} size={64} />
              <div className="staff-profile-id">
                <h1>{sheet.profile.displayName}</h1>
                <span className="staff-tags">
                  {enrollment ? <Badge tone="blue">Allemand {enrollment.levelCode} · version {enrollment.trackVersionNumber}</Badge>
                    : sheet.goal && <Badge tone="blue">Objectif {sheet.goal.level}</Badge>}
                  <Badge tone={status.tone}>{status.label}</Badge>
                  {openAlert && <Badge tone="red"><Bell size={12} aria-hidden="true" /> Alerte ouverte</Badge>}
                </span>
              </div>
              <div className="staff-profile-actions">
                {canMessage && (
                  <button type="button" className="btn btn-primary" onClick={() => { openTab('messages'); setFocusComposer(true); }}>
                    <MessageCircle size={17} aria-hidden="true" /> Encourager
                  </button>
                )}
                <button type="button" className="btn btn-outline" onClick={refresh} aria-label="Actualiser la fiche" title="Actualiser">
                  <RefreshCw size={17} aria-hidden="true" /><span className="staff-hide-mobile">Actualiser</span>
                </button>
              </div>
            </div>
            <div className="staff-figures">
              <div className="staff-figure is-ring">
                <ProgressRing value={completion} size={52} stroke={6} label={`${completion} % des séances terminées`}>
                  <strong className="staff-ring-small">{completion}%</strong>
                </ProgressRing>
                <span><strong>{done} / {sessions.length}</strong><small>séances terminées</small></span>
              </div>
              <Figure icon={<Timer size={18} />} label="Séances à temps" value={tracking?.sessionsOnTime !== undefined ? `${tracking.sessionsOnTime} / ${completed}` : '—'} />
              <Figure icon={<AlarmClock size={18} />} label="Retard" tone={late ? 'warning' : 'success'}
                value={late ? plural(late, 'séance', 'séances') : 'À jour'} />
              <Figure icon={<Clock size={18} />} label="Pratique estimée" value={formatMinutes(tracking?.practiceMinutes ?? 0)} />
              <Figure icon={<Activity size={18} />} label="Dernière activité" value={tracking?.lastActivityAt ? relativeDay(tracking.lastActivityAt) : 'Aucune'} />
              <Figure icon={<ClipboardCheck size={18} />} label="Copies à corriger" value={tracking?.pendingGrading ?? 0} />
            </div>
          </section>

          <Tabs label="Sections de la fiche" idPrefix="fiche" value={tab} onChange={openTab} tabs={[
            { id: 'seances', label: 'Séances', icon: <CalendarDays size={17} aria-hidden="true" />, count: sessions.length },
            { id: 'objectif', label: 'Objectif et planning', icon: <Target size={17} aria-hidden="true" /> },
            { id: 'resultats', label: 'Résultats', icon: <BarChart3 size={17} aria-hidden="true" />, count: sheet.results.length },
            { id: 'messages', label: 'Messages', icon: <MessagesSquare size={17} aria-hidden="true" />, count: sheet.messages.length },
          ]} />
          <TabPanel id={tab} idPrefix="fiche">
            {tab === 'seances' && <SessionsTab sheet={sheet} onAssign={() => setAssignOpen(true)} onPlanning={() => openTab('objectif')} />}
            {tab === 'objectif' && (
              <div className="staff-page-body">
                {(!enrollment || enrollment.status !== 'active') && (
                  <Card title="Attribuer un parcours" icon={<Route size={18} />} className="staff-assign-card"
                    description={enrollment ? 'Le parcours précédent est terminé : attribuez le suivant.' : 'Choisissez un parcours publié, le rythme et la date de début.'}
                    action={<button type="button" className="btn btn-primary btn-sm" onClick={() => setAssignOpen(true)}>Attribuer</button>} />
                )}
                {enrollment && <GoalPanel enrollment={enrollment} token={token} viewer="staff" onChanged={refresh} />}
              </div>
            )}
            {tab === 'resultats' && <ResultsTab sheet={sheet} />}
            {tab === 'messages' && <MessagesTab sheet={sheet} learnerId={learnerId} token={token} canMessage={canMessage} autoFocus={focusComposer} onSent={refresh} />}
          </TabPanel>
        </>
      )}

      {assignOpen && (
        <Drawer title="Attribuer un parcours" description={sheet?.profile.displayName} onClose={() => setAssignOpen(false)}
          footer={<>
            <button type="button" className="btn btn-outline" onClick={() => setAssignOpen(false)}>Annuler</button>
            <button type="submit" form={formId} className="btn btn-primary" disabled={assigning}>{assigning ? 'Attribution…' : 'Attribuer le parcours'}</button>
          </>}>
          <AssignTrack learnerId={learnerId} token={token} formId={formId} onBusy={setAssigning} onAssigned={() => {
            setAssignOpen(false);
            toast('Parcours attribué : le planning est proposé dans l’onglet Objectif et planning.');
            refresh();
          }} />
        </Drawer>
      )}
    </div>
  );
}
