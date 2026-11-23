import { useEffect, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { RotateCcw } from 'lucide-react';
import { PageHeading } from '../../components/ui';
import { Callout, Card, Skeleton } from '../../design/kit';
import { requestApi } from '../../integration/api';
import type { PathView } from '../../integration/v2';
import { GoalPanel, type PlannedEnrollment } from './GoalPanel';
import type { Grade } from './LearnerSession';
import { capitalize, daysFromToday } from './learner-calendar';
import { EmptyScene, plural, type LearnerMessage } from './learner-common';
import { firstName } from '../onboarding/onboarding-kit';
import { HomeView } from './learner-home';
import { LearnerPath } from './learner-path';
import { MessagesView, ResultsView, SessionsByWeek } from './learner-views';
import './learner-dashboard.css';

interface LearnerData { enrollment: PlannedEnrollment | null; results: Grade[]; messages: LearnerMessage[]; path: PathView | null }
type View = 'home' | 'planning' | 'results' | 'messages';

const formatDay = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
const sectionTitle = { planning: 'Mon planning', results: 'Mes résultats', messages: 'Mes messages' };
const sectionText = {
  planning: 'Vos niveaux, vos jours d’étude et toutes vos séances, semaine après semaine.',
  results: 'Vos scores aux exercices et leur évolution.',
  messages: 'Les encouragements et conseils de votre professeur.',
};

/** Squelettes qui reprennent la disposition de chaque écran pendant le chargement. */
function LoadingView({ view }: { view: View }) {
  const rows = (count: number) => Array.from({ length: count }, (_, index) => (
    <span key={index} className="ld-skel-row"><Skeleton width={44} height={46} radius={12} /><span><Skeleton width={`${78 - index * 9}%`} height={13} /><Skeleton width="46%" height={11} /></span></span>
  ));
  const card = (lines: number, extra?: ReactNode, className = '') => (
    <div className={`kit-skeleton-card ${className}`.trim()} aria-hidden="true">
      <span className="ld-skel-head"><Skeleton width={36} height={36} radius={10} /><Skeleton width="40%" height={16} /></span>
      {extra}
      {Array.from({ length: lines }, (_, index) => <Skeleton key={index} width={`${92 - index * 14}%`} />)}
    </div>
  );
  return (
    <div className={`ld-loading is-${view}`} role="status" aria-label={view === 'home' ? 'Chargement de votre accueil…' : 'Chargement…'}>
      {view === 'home' && <>
        <div className="ld-skel-hero ld-area-hero" aria-hidden="true"><span /><span /><span /></div>
        {card(0, <span className="ld-skel-rail"><Skeleton width="100%" height={6} radius={6} /><span><Skeleton width={30} height={30} radius={15} /><Skeleton width={34} height={34} radius={10} /><Skeleton width={30} height={30} radius={15} /></span></span>, 'ld-area-goal')}
        {card(0, <div className="ld-skel-list">{rows(4)}</div>, 'ld-area-todo')}
        {card(0, <span className="ld-skel-week">{Array.from({ length: 7 }, (_, index) => <Skeleton key={index} width="100%" height={92} radius={12} />)}</span>, 'ld-area-week')}
      </>}
      {view === 'planning' && <>
        {card(1, <span className="ld-skel-rail is-wide"><Skeleton width="100%" height={6} radius={6} /><span><Skeleton width={40} height={40} radius={20} /><Skeleton width={44} height={44} radius={12} /><Skeleton width={40} height={40} radius={20} /></span></span>, 'is-span')}
        {card(2)}
        {card(0, <div className="ld-skel-list">{rows(3)}</div>)}
      </>}
      {view === 'results' && <>{card(0, <span className="ld-skel-ring"><Skeleton width={120} height={120} radius={60} /><span><Skeleton width="80%" /><Skeleton width="60%" /></span></span>)}{card(0, <span className="ld-skel-bars">{[46, 70, 58, 88, 64, 76].map((height, index) => <Skeleton key={index} width="100%" height={height * 1.6} radius={8} />)}</span>)}</>}
      {view === 'messages' && <>{card(0, <div className="ld-skel-thread"><Skeleton width="68%" height={58} radius={16} /><Skeleton width="52%" height={46} radius={16} /><Skeleton width="60%" height={58} radius={16} /></div>, 'is-wide')}{card(3)}</>}
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
      // Parcours multi-niveaux : absent d'un service antérieur à l'incrément, l'espace garde alors l'ancien planning.
      requestApi<PathView | null>('/learning/path', token).catch(() => null),
    ]).then(([enrollment, results, messages, path]) => {
      if (active) setData({ enrollment, results, messages, path });
    }).catch((error: unknown) => {
      if (active) setFailure(error instanceof Error && error.name !== 'TimeoutError' ? error.message : 'Le service est momentanément indisponible. Réessayez.');
    });
    return () => { active = false; };
  }, [token, retry]);

  const refresh = () => { setFailure(''); setRetry((value) => value + 1); };
  const pageTitle = view === 'home' ? `Bonjour ${firstName(name)}` : sectionTitle[view];
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

  const { enrollment, messages, path } = data;
  const results = data.results.filter((item) => item.kind !== 'diagnostic');
  const sessions = enrollment?.sessions ?? [];

  return (
    <div className="ld-page lc-enter" key={view}>
      <PageHeading title={pageTitle} description={description} />
      {errorBanner}
      {view === 'home' && <HomeView enrollment={enrollment} results={results} messages={messages} path={path} />}
      {view === 'planning' && path && <LearnerPath token={token} path={path} onChanged={refresh} />}
      {view === 'planning' && !path && (
        <div className="ld-planning">
          {enrollment
            ? <GoalPanel enrollment={enrollment} token={token} viewer="learner" onChanged={refresh} />
            : <Card><EmptyScene art="calendar" title="Aucun parcours pour le moment" description="Votre planning apparaîtra ici dès que votre parcours sera construit."
                action={<Link className="btn btn-primary" to="/espace/accueil">Construire mon parcours</Link>} /></Card>}
          <SessionsByWeek sessions={sessions} />
        </div>
      )}
      {view === 'results' && <ResultsView results={results} sessions={sessions} token={token} />}
      {view === 'messages' && <MessagesView messages={messages} next={sessions.find((session) => session.status !== 'completed')} autonomous={path ? !path.accompanied : false} />}
    </div>
  );
}
