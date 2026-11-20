import { useEffect, useState } from 'react';
import { CalendarDays, RotateCcw } from 'lucide-react';
import { EmptyState, PageHeading } from '../../components/ui';
import { Callout, Card, Skeleton, SkeletonCard } from '../../design/kit';
import { requestApi } from '../../integration/api';
import { GoalPanel, type PlannedEnrollment } from './GoalPanel';
import type { Grade } from './LearnerSession';
import { capitalize, daysFromToday } from './learner-calendar';
import { plural, type LearnerMessage } from './learner-common';
import { HomeView } from './learner-home';
import { MessagesView, ResultsView, SessionsByWeek } from './learner-views';
import './learner-dashboard.css';

interface LearnerData { enrollment: PlannedEnrollment | null; results: Grade[]; messages: LearnerMessage[] }
type View = 'home' | 'planning' | 'results' | 'messages';

const formatDay = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
const sectionTitle = { planning: 'Mon planning', results: 'Mes résultats', messages: 'Mes messages' };
const sectionText = {
  planning: 'Votre objectif, vos disponibilités et le calendrier de vos séances.',
  results: 'Vos scores aux exercices et leur évolution.',
  messages: 'Les encouragements et conseils de votre professeur.',
};

function LoadingView({ view }: { view: View }) {
  const placeholder = (lines: number) => (
    <div className="kit-skeleton-card" aria-hidden="true">
      <Skeleton width="45%" height={18} />
      {Array.from({ length: lines }, (_, index) => <Skeleton key={index} width={`${92 - index * 14}%`} />)}
    </div>
  );
  return (
    <div className={`ld-loading is-${view}`}>
      {view === 'home' && <div className="ld-skeleton-hero" aria-hidden="true" />}
      <SkeletonCard lines={3} label="Chargement de votre parcours…" />
      {placeholder(4)}
      {view !== 'messages' && placeholder(2)}
    </div>
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
      requestApi<LearnerMessage[]>('/tracking/messages', token),
    ]).then(([enrollment, results, messages]) => {
      if (active) setData({ enrollment, results, messages });
    }).catch((error: unknown) => {
      if (active) setFailure(error instanceof Error && error.name !== 'TimeoutError' ? error.message : 'Le service est momentanément indisponible. Réessayez.');
    });
    return () => { active = false; };
  }, [token, retry]);

  const refresh = () => { setFailure(''); setRetry((value) => value + 1); };
  const pageTitle = view === 'home' ? `Bonjour ${name}` : sectionTitle[view];
  const today = new Date();
  const dueToday = (data?.enrollment?.sessions ?? []).filter((session) => session.status !== 'completed' && daysFromToday(new Date(session.dueAt)) === 0).length;
  const description = view === 'home'
    ? <><time className="ld-date" dateTime={today.toISOString().slice(0, 10)}>{capitalize(formatDay.format(today))}</time>
      {data && <span className="ld-date-note"> · {dueToday ? `${plural(dueToday, 'séance')} prévue${dueToday > 1 ? 's' : ''} aujourd’hui` : 'Aucune séance prévue aujourd’hui'}</span>}</>
    : sectionText[view];

  const errorBanner = failure && (
    <div role="alert" className="ld-alert">
      <Callout tone="warning" title="Chargement impossible">
        <p>{failure}</p>
        <button className="btn btn-outline btn-sm" type="button" onClick={refresh}><RotateCcw size={15} aria-hidden="true" /> Réessayer</button>
      </Callout>
    </div>
  );

  if (!data) {
    return (
      <div className="ld-page lc-enter">
        <PageHeading title={pageTitle} description={description} />
        {failure ? errorBanner : <LoadingView view={view} />}
      </div>
    );
  }

  const { enrollment, messages } = data;
  const results = data.results.filter((item) => item.kind !== 'diagnostic');
  const sessions = enrollment?.sessions ?? [];

  return (
    <div className="ld-page lc-enter" key={view}>
      <PageHeading title={pageTitle} description={description} />
      {errorBanner}
      {view === 'home' && <HomeView enrollment={enrollment} results={results} messages={messages} />}
      {view === 'planning' && (
        <div className="ld-planning">
          {enrollment
            ? <GoalPanel enrollment={enrollment} token={token} viewer="learner" onChanged={refresh} />
            : <Card><EmptyState icon={<CalendarDays size={26} />} title="Aucun parcours attribué" description="Votre planning apparaîtra ici dès qu’un parcours vous sera attribué." /></Card>}
          <SessionsByWeek sessions={sessions} />
        </div>
      )}
      {view === 'results' && <ResultsView results={results} sessions={sessions} />}
      {view === 'messages' && <MessagesView messages={messages} next={sessions.find((session) => session.status !== 'completed')} />}
    </div>
  );
}
