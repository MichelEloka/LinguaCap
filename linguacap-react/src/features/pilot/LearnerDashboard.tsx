import { useEffect, useState } from 'react';
import { ArrowRight, BookOpen, CalendarCheck2, CalendarDays, ChartNoAxesCombined, Check, Clock, MessageSquare, Play, Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge, EmptyState, PageHeading, ProgressBar, StatCard } from '../../components/ui';
import { requestApi } from '../../integration/api';
import { GoalPanel, goalStatus, type PlannedEnrollment } from './GoalPanel';
import { formatDue, sessionStatus, type Grade, type SessionSummary } from './LearnerSession';
import './learner-dashboard.css';

interface Message { id: string; text: string; sentAt: string }
interface LearnerData { enrollment: PlannedEnrollment | null; results: Grade[]; messages: Message[] }
type View = 'home' | 'planning' | 'results' | 'messages';

const formatDate = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' });
const formatDay = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
const sectionTitle = { planning: 'Mon planning', results: 'Mes résultats', messages: 'Mes messages' };

function CourseHero({ enrollment, next }: { enrollment: PlannedEnrollment | null; next?: SessionSummary }) {
  const completed = Boolean(enrollment?.sessions.length && !next);
  const action = next?.status === 'planned' ? 'Commencer la séance' : 'Reprendre la séance';
  return (
    <section className="lc-study-hero" aria-labelledby="lc-next-session">
      <div className="lc-study-copy">
        <p className="lc-study-label"><BookOpen size={16} aria-hidden="true" /> {enrollment ? `Allemand · ${enrollment.levelCode}` : 'Mon parcours'}</p>
        <p className="lc-study-caption">Ma prochaine séance</p>
        <h2 id="lc-next-session">{next?.title ?? (completed ? 'Toutes vos séances sont terminées' : 'Votre parcours se prépare')}</h2>
        {next ? (
          <>
            <p className="lc-study-meta"><Clock size={16} aria-hidden="true" /> {next.estimatedMinutes} min <span aria-hidden="true">·</span> Avant le {formatDue(next.dueAt)}</p>
            <Link className="btn lc-study-action" to={`/espace/seance/${next.id}`}><Play size={16} fill="currentColor" aria-hidden="true" /> {action}</Link>
          </>
        ) : (
          <p>{completed ? 'Consultez vos résultats pour retrouver le travail effectué.' : 'Vos séances apparaîtront dès que votre planning sera validé.'}</p>
        )}
      </div>
      <div className="lc-study-art" aria-hidden="true">
        <div className="lc-study-orbit lc-study-orbit-wide" />
        <div className="lc-study-orbit lc-study-orbit-narrow" />
        <div className="lc-study-emblem"><BookOpen size={56} strokeWidth={1.3} /></div>
      </div>
    </section>
  );
}

function SessionList({ sessions, heading, empty, compact }: {
  sessions: SessionSummary[]; heading: string; empty: string; compact?: boolean;
}) {
  return (
    <section className="panel lc-activity-list">
      <div className="lc-panel-heading"><span className="icon-tile"><CalendarCheck2 size={19} aria-hidden="true" /></span>
        <h2>{heading}</h2>{compact && <Link className="text-link" to="/espace/planning">Voir le planning <ArrowRight size={15} /></Link>}
      </div>
      {sessions.length === 0 ? <EmptyState title={empty} /> : (
        <ul className="lc-work-list">
          {sessions.map((session) => (
            <li key={session.id}>
              <Link to={`/espace/seance/${session.id}`} className="lc-work-row">
                <span className="lc-work-row-icon">{session.status === 'completed' ? <Check size={18} /> : <BookOpen size={18} />}</span>
                <div><strong>{session.title}</strong><small>{formatDue(session.dueAt)} · {session.estimatedMinutes} min</small></div>
                <Badge tone={sessionStatus[session.status].tone}>{sessionStatus[session.status].label}</Badge>
                <ArrowRight className="lc-row-arrow" size={17} aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function ResultsPanel({ results }: { results: Grade[] }) {
  return (
    <section className="panel lc-activity-list">
      {results.length === 0 ? <EmptyState title="Aucun résultat enregistré" description="Terminez un exercice pour retrouver votre score ici." /> : (
        <ul className="lc-work-list">
          {results.map((item) => {
            const percent = item.total ? Math.round(item.correct / item.total * 100) : 0;
            return <li className="lc-work-row lc-result-row" key={item.id}>
              <span className="lc-work-row-icon"><ChartNoAxesCombined size={18} aria-hidden="true" /></span>
              <div><strong>{item.kind === 'quiz' ? 'Exercice' : 'Évaluation'}</strong><small><time dateTime={item.submittedAt}>{formatDate.format(new Date(item.submittedAt))}</time></small></div>
              <ProgressBar value={percent} label="Score de l’exercice" />
              <Badge tone={percent >= 70 ? 'green' : 'neutral'}>{item.correct} / {item.total}</Badge>
            </li>;
          })}
        </ul>
      )}
    </section>
  );
}

function MessagesPanel({ messages }: { messages: Message[] }) {
  return (
    <section className="panel lc-activity-list">
      {messages.length === 0 ? <EmptyState title="Aucun message pour le moment" /> : (
        <ul className="lc-work-list">
          {messages.map((message) => (
            <li className="lc-work-row lc-message-row" key={message.id}>
              <span className="lc-work-row-icon"><MessageSquare size={18} aria-hidden="true" /></span>
              <div><p>{message.text}</p><small><time dateTime={message.sentAt}>{formatDate.format(new Date(message.sentAt))}</time></small></div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function LearnerDashboard({ token, name, view }: { token: string; name: string; view: View }) {
  const [data, setData] = useState<LearnerData | null>(null);
  const [failure, setFailure] = useState('');
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let active = true;
    Promise.all([
      requestApi<PlannedEnrollment | null>('/learning/enrollment', token),
      requestApi<Grade[]>('/assessments/results', token),
      requestApi<Message[]>('/tracking/messages', token),
    ]).then(([enrollment, results, messages]) => {
      if (active) setData({ enrollment, results, messages });
    }).catch((error: unknown) => {
      if (active) setFailure(error instanceof Error && error.name !== 'TimeoutError' ? error.message : 'Le service est momentanément indisponible. Réessayez.');
    });
    return () => { active = false; };
  }, [token, retry]);

  const refresh = () => { setFailure(''); setRetry((value) => value + 1); };
  const pageTitle = view === 'home' ? `Bonjour ${name}` : sectionTitle[view];
  if (!data) {
    return <div className="lc-enter">
      <PageHeading title={pageTitle} />
      <section className="panel stack">{failure
        ? <><p className="inline-message warning" role="alert">{failure}</p><button className="btn btn-outline" type="button" onClick={refresh}>Réessayer</button></>
        : <p role="status">Chargement de votre parcours…</p>}</section>
    </div>;
  }

  const { enrollment, messages } = data;
  const results = data.results.filter((item) => item.kind !== 'diagnostic');
  const sessions = enrollment?.sessions ?? [];
  const next = sessions.find((session) => session.status !== 'completed');
  const complete = sessions.filter((session) => session.status === 'completed').length;
  const urgent = sessions.filter((session) => session.status === 'late' || new Date(session.dueAt).toDateString() === new Date().toDateString());

  return (
    <div className="lc-learner-page lc-enter" key={view}>
      <PageHeading title={pageTitle} description={view === 'home' ? <time className="lc-date">{formatDay.format(new Date())}</time> : undefined} />
      {failure && <p role="alert" className="inline-message warning">{failure} <button className="text-link" type="button" onClick={refresh}>Réessayer</button></p>}
      {view === 'planning' && (
        <div className="lc-planning-layout">
          {enrollment && <GoalPanel enrollment={enrollment} token={token} viewer="learner" onChanged={refresh} />}
          <SessionList sessions={sessions} heading="Mes séances" empty="Aucune séance planifiée" />
        </div>
      )}
      {view === 'results' && <ResultsPanel results={results} />}
      {view === 'messages' && <MessagesPanel messages={messages} />}
      {view === 'home' && <>
        <div className="lc-study-grid">
          <CourseHero enrollment={enrollment} next={next} />
          <section className="panel lc-study-progress">
            <div className="lc-panel-heading"><span className="icon-tile"><Target size={19} aria-hidden="true" /></span><h2>Ma progression</h2></div>
            <div className="lc-progress-count"><strong>{complete}</strong> / {sessions.length}</div>
            <p className="muted">Séances terminées</p>
            <ProgressBar value={sessions.length ? Math.round(complete / sessions.length * 100) : 0} />
            {enrollment && <Badge tone={goalStatus[enrollment.goal.status].tone}>{goalStatus[enrollment.goal.status].label}</Badge>}
            <Link className="text-link" to="/espace/planning">Voir mon objectif <ArrowRight size={15} /></Link>
          </section>
        </div>
        <div className="lc-study-grid">
          <SessionList sessions={urgent.slice(0, 4)} heading="À faire aujourd’hui" empty="Aucune séance à terminer aujourd’hui" compact />
          <div className="lc-summary-links">
            <Link to="/espace/resultats"><StatCard label="Résultats" value={results.length} icon={<ChartNoAxesCombined size={19} />} /></Link>
            <Link to="/espace/messages"><StatCard label="Messages" value={messages.length} icon={<MessageSquare size={19} />} /></Link>
            <Link to="/espace/planning"><StatCard label="Séances planifiées" value={sessions.length - complete} icon={<CalendarDays size={19} />} /></Link>
          </div>
        </div>
      </>}
    </div>
  );
}
