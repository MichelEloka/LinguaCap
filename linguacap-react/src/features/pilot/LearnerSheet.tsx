import { useEffect, useState, type ReactNode } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Activity, AlarmClock, AlertTriangle, ArrowLeft, ArrowRight, BarChart3, Bell, CalendarClock, CalendarDays, Check, CheckCircle2, ChevronRight,
  ClipboardCheck, Clock, Eye, FileSignature, Flag, ListChecks, MessageCircle, MessagesSquare, Mic, PauseCircle, Play, RefreshCw, Route,
  Send, ShieldCheck, Target, Timer, Trophy,
} from 'lucide-react';
import { Badge, EmptyState, ProgressBar, StatCard, type BadgeTone } from '../../components/ui';
import {
  Avatar, Bars, Card, ProgressRing, Segmented, Skeleton, SkeletonCard, TabPanel, Tabs, Timeline, type TimelineEntry,
} from '../../design/kit';
import { requestApi } from '../../integration/api';
import type { MissionSummary } from '../../integration/v4';
import { formatDue, sessionStatus, type Grade, type SessionSummary } from './LearnerSession';
import { GoalPanel, type PlannedEnrollment } from './GoalPanel';
import { StaffPathTab } from './staff-path';
import type { TrackingAlert, TrackingSummary } from './StaffPilot';
import {
  DateTile, StaffComposer, StaffError, dateTime, dayOffset, errorText, formatMinutes, goalStatusOf, mediumDate, plural, relativeDay, shortDate,
} from './staff-kit';
import { learnersAwaitingDecision, usePendingContracts } from './staff-contracts';
import { flaggedOf, gradeTitle, pendingOf, useLessonTitles } from './learner-common';
import { MissionBadge, MissionDetailDrawer, useMissions } from './study-mission';
import { ExerciseReviewDrawer } from './study-review';
import './reviews.css';

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
const tabIds = ['seances', 'parcours', 'resultats', 'messages'] as const;
type SheetTab = typeof tabIds[number];
/** Anciennes adresses : l'onglet « Objectif et planning » est devenu « Parcours ». */
const tabAliases: Record<string, SheetTab> = { objectif: 'parcours' };

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

function SessionsTab({ sheet, onPath }: { sheet: Sheet; onPath: () => void }) {
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
          <EmptyState icon={<Route size={26} />} title="Pas encore de séances" description="Les séances apparaîtront dès que l’élève aura construit et validé son parcours."
            action={<button type="button" className="btn btn-outline" onClick={onPath}>Voir le parcours</button>} />
        ) : sessions.length === 0 ? (
          <EmptyState icon={<CalendarClock size={26} />} title="Séances bientôt publiées" description="Les séances seront publiées à la validation du planning."
            action={<button type="button" className="btn btn-outline" onClick={onPath}>Voir le planning</button>} />
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

/** Points d'attention de la fiche : missions à corriger, répétitions à valider et questions « à revoir ». */
function AttentionCard({ sheet, missions, titles, onReview }: {
  sheet: Sheet; missions: MissionSummary[]; titles: Map<string, string>; onReview: (attemptId: string) => void;
}) {
  const sessions = sheet.enrollment?.sessions ?? [];
  const grades = [...sheet.results].filter((grade) => grade.kind !== 'diagnostic')
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
  const awaiting = grades.filter((grade) => pendingOf(grade) > 0);
  const flagged = grades.filter((grade) => flaggedOf(grade).length > 0);
  const toCorrect = missions.filter((mission) => mission.status === 'submitted');
  if (!awaiting.length && !flagged.length && !toCorrect.length) return null;
  return (
    <Card title="Points d’attention" description="Ce qui attend votre regard ou une reprise de l’élève." icon={<Flag size={18} />} flush className="rv-attention">
      <ul className="staff-rows rv-attention-list">
        {toCorrect.map((mission) => (
          <li key={`m-${mission.id}`} className="rv-attention-row">
            <span className="rv-attention-icon is-mission" aria-hidden="true"><Target size={17} /></span>
            <span className="staff-row-main"><strong>Mission « {mission.title} »</strong>
              <small>À corriger{mission.submittedAt ? ` · envoyée ${relativeDay(mission.submittedAt)}` : ''}</small></span>
            <Link className="btn btn-soft btn-sm" to={`/espace/corrections/missions/${encodeURIComponent(mission.id)}`}
              aria-label={`Corriger la mission ${mission.title}`}>Corriger <ArrowRight size={15} aria-hidden="true" /></Link>
          </li>
        ))}
        {awaiting.map((grade) => (
          <li key={`p-${grade.id}`} className="rv-attention-row">
            <span className="rv-attention-icon is-pending" aria-hidden="true"><Mic size={17} /></span>
            <span className="staff-row-main"><strong>{gradeTitle(grade, sessions, titles).title}</strong>
              <small>{plural(pendingOf(grade), 'répétition enregistrée', 'répétitions enregistrées')} à valider</small></span>
            <Link className="btn btn-soft btn-sm" to="/espace/corrections/oral" aria-label={`Écouter les répétitions de ${gradeTitle(grade, sessions, titles).title}`}>
              Écouter <ArrowRight size={15} aria-hidden="true" /></Link>
          </li>
        ))}
        {flagged.map((grade) => (
          <li key={`f-${grade.id}`} className="rv-attention-row">
            <span className="rv-attention-icon is-flagged" aria-hidden="true"><Flag size={17} /></span>
            <span className="staff-row-main"><strong>{gradeTitle(grade, sessions, titles).title}</strong>
              <small>{plural(flaggedOf(grade).length, 'répétition signalée', 'répétitions signalées')} « à revoir » · {relativeDay(grade.submittedAt)}</small></span>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => onReview(grade.id)}
              aria-label={`Voir le corrigé : ${gradeTitle(grade, sessions, titles).title}`}><Eye size={15} aria-hidden="true" /> Corrigé</button>
          </li>
        ))}
      </ul>
    </Card>
  );
}

const missionDate = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' });

/** Missions de l'élève, des plus récentes aux plus anciennes ; chacune s'ouvre dans un panneau latéral. */
function MissionsCard({ missions, error, onOpen }: { missions: MissionSummary[] | null; error: string; onOpen: (id: string) => void }) {
  const sent = missions?.filter((mission) => mission.status !== 'draft').length ?? 0;
  return (
    <Card title="Missions" icon={<Target size={18} />} flush className="rv-missions"
      description={missions?.length ? plural(sent, 'mission envoyée', 'missions envoyées') : undefined}>
      {missions === null ? <div className="rv-pad"><SkeletonCard lines={2} label="Chargement des missions…" /></div>
        : missions.length === 0 ? (
          <EmptyState icon={<Target size={24} />} title="Aucune mission pour le moment"
            description={error ? 'Les missions ne sont pas disponibles pour le moment.' : 'Les missions réalisées par l’élève apparaîtront ici, avec votre retour.'} />
        ) : (
          <ul className="kit-list rv-mission-list lc-stagger">
            {missions.map((mission) => (
              <li key={mission.id}>
                <button type="button" className="kit-list-item" onClick={() => onOpen(mission.id)} aria-label={`Ouvrir la mission ${mission.title}`}>
                  <span className="rv-attention-icon is-mission" aria-hidden="true"><Target size={17} /></span>
                  <span className="kit-list-main"><strong>{mission.title}</strong>
                    <small>{mission.levelCode} · {mission.submittedAt ? `envoyée le ${missionDate.format(new Date(mission.submittedAt))}` : 'brouillon en cours'}
                      {mission.sessionId ? ' · séance' : ' · bibliothèque'}</small></span>
                  <span className="kit-list-end"><MissionBadge mission={mission} viewer="staff" /><ChevronRight size={17} aria-hidden="true" /></span>
                </button>
              </li>
            ))}
          </ul>
        )}
    </Card>
  );
}

function ResultsTab({ sheet, learnerId, token }: { sheet: Sheet; learnerId: string; token: string }) {
  const { missions, error: missionsError } = useMissions(token, learnerId);
  const titles = useLessonTitles(token, learnerId);
  const [reviewing, setReviewing] = useState<string | null>(null);
  const [missionOpen, setMissionOpen] = useState<string | null>(null);
  const sessions = sheet.enrollment?.sessions ?? [];
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
  const drawers = (
    <>
      {reviewing && <ExerciseReviewDrawer attemptId={reviewing} token={token} onClose={() => setReviewing(null)} />}
      {missionOpen && <MissionDetailDrawer missionId={missionOpen} token={token} viewer="staff" onClose={() => setMissionOpen(null)} />}
    </>
  );

  if (!exams.length && !grades.length && !missions?.length) {
    return (
      <Card>
        {missions === null ? <SkeletonCard lines={3} label="Chargement des résultats…" />
          : <EmptyState icon={<BarChart3 size={26} />} title="Aucun exercice remis" description="Les scores et les missions apparaîtront ici dès le premier exercice terminé." />}
      </Card>
    );
  }
  return (
    <div className="staff-page-body">
      <div className="staff-kpis is-three lc-stagger">
        <StatCard label="Réussite moyenne" value={average === null ? '—' : `${average} %`} note={`${totalCorrect} bonnes réponses sur ${totalAsked}`} icon={<Target size={20} />} />
        <StatCard label="Exercices remis" value={grades.length} note={grades.length ? `Dernier ${relativeDay(grades[grades.length - 1].submittedAt)}` : undefined} icon={<ListChecks size={20} />} />
        <StatCard label="Meilleur score" value={best === null ? '—' : `${best} %`} icon={<Trophy size={20} />} />
      </div>

      <AttentionCard sheet={sheet} missions={missions ?? []} titles={titles} onReview={setReviewing} />

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
              {[...grades].reverse().slice(0, 8).map((grade) => {
                const flagged = flaggedOf(grade).length;
                const waiting = pendingOf(grade);
                const reviewable = grade.kind !== 'diagnostic';
                const title = reviewable ? gradeTitle(grade, sessions, titles).title : 'Diagnostic';
                return (
                  <li key={grade.id} className="staff-grade">
                    <span className={`staff-score is-${scoreTone(percent(grade))}`}>{percent(grade)}%</span>
                    <span className="staff-row-main">
                      <strong>{title}</strong>
                      <small>{grade.correct} / {grade.total} bonnes réponses · remis {relativeDay(grade.submittedAt)}</small>
                      {(flagged > 0 || waiting > 0) && (
                        <span className="staff-tags">
                          {flagged > 0 && <Badge tone="violet">À revoir · {flagged}</Badge>}
                          {waiting > 0 && <Badge tone="amber">En attente de validation · {waiting}</Badge>}
                        </span>
                      )}
                    </span>
                    {grade.kind === 'diagnostic' && <Badge tone="violet">Diagnostic</Badge>}
                    {reviewable && (
                      <button type="button" className="icon-button rv-review-button" onClick={() => setReviewing(grade.id)}
                        aria-label={`Voir le corrigé : ${title}`} title="Voir le corrigé"><Eye size={17} aria-hidden="true" /></button>
                    )}
                  </li>
                );
              })}
            </ul>
          </Card>
        </div>
      )}

      <MissionsCard missions={missions} error={missionsError} onOpen={setMissionOpen} />
      {drawers}
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
  const [params, setParams] = useSearchParams();
  const [sheet, setSheet] = useState<Sheet | null>(null);
  const [error, setError] = useState('');
  const [reload, setReload] = useState(0);
  const [focusComposer, setFocusComposer] = useState(false);
  const id = encodeURIComponent(learnerId);
  const refresh = () => setReload((value) => value + 1);
  const requested = params.get('onglet') ?? '';
  const tab: SheetTab = tabIds.find((item) => item === requested) ?? tabAliases[requested] ?? 'seances';
  const pending = usePendingContracts(token);
  const contractToDecide = learnersAwaitingDecision(pending.data).has(learnerId);

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
                  {contractToDecide && <button type="button" className="badge badge-amber staff-badge-button" onClick={() => openTab('parcours')}>
                    <FileSignature size={12} aria-hidden="true" /> Contrat à valider</button>}
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
            { id: 'parcours', label: 'Parcours', icon: <Route size={17} aria-hidden="true" /> },
            { id: 'resultats', label: 'Résultats', icon: <BarChart3 size={17} aria-hidden="true" />, count: sheet.results.length },
            { id: 'messages', label: 'Messages', icon: <MessagesSquare size={17} aria-hidden="true" />, count: sheet.messages.length },
          ]} />
          <TabPanel id={tab} idPrefix="fiche">
            {tab === 'seances' && <SessionsTab sheet={sheet} onPath={() => openTab('parcours')} />}
            {tab === 'parcours' && (
              <StaffPathTab learnerId={learnerId} learnerName={sheet.profile.displayName} token={token}
                onChanged={() => { refresh(); pending.reload(); }}
                legacy={enrollment ? <GoalPanel enrollment={enrollment} token={token} viewer="staff" onChanged={refresh} /> : undefined} />
            )}
            {tab === 'resultats' && <ResultsTab sheet={sheet} learnerId={learnerId} token={token} />}
            {tab === 'messages' && <MessagesTab sheet={sheet} learnerId={learnerId} token={token} canMessage={canMessage} autoFocus={focusComposer} onSent={refresh} />}
          </TabPanel>
        </>
      )}

    </div>
  );
}
