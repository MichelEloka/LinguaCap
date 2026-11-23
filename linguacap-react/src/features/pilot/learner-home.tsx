/** Accueil « Aujourd’hui » de l'élève : prochaine séance, objectif, semaine, séances à faire, résultats et dernier message. */
import { useState } from 'react';
import {
  ArrowRight, BookOpen, CalendarClock, CalendarDays, CalendarRange, ChartNoAxesCombined, Check, ClipboardCheck, Clock, Handshake, LibraryBig,
  ListChecks, MessageCircle, PencilLine, Play, Target,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '../../components/ui';
import { Callout, Card, ProgressRing, Sparkline } from '../../design/kit';
import { languageName } from '../../domain/languages';
import { formatMinutes, type PathView } from '../../integration/v2';
import { LevelMark, levelName, longDate, ofLanguage, shortDate } from '../onboarding/onboarding-kit';
import { goalStatus, paceLabel, showDate, type PlannedEnrollment } from './GoalPanel';
import { sessionStatus, type Grade, type SessionSummary } from './LearnerSession';
import {
  addDays, CalendarLegend, capitalize, daysFromToday, formatClock, formatMonthDay, localDate, relativeDay, relativeMoment, sameDay,
  startOfWeek, WeekGrid, WeekPager,
} from './learner-calendar';
import {
  activityIcons, byDate, doneActivities, EmptyArt, EmptyScene, gradeTitle, JourneyRail, NightDecor, pathProgress, plural, scoreColor, scoreOf, SessionRow,
  stationState, statusTone, TeacherAvatar, type JourneyStation, type LearnerMessage,
} from './learner-common';

function NextSession({ enrollment, next, path }: { enrollment: PlannedEnrollment | null; next?: SessionSummary; path: PathView | null }) {
  const sessions = enrollment?.sessions ?? [];
  const completed = Boolean(sessions.length && !next);
  const action = next?.status === 'planned' ? 'Commencer la séance' : 'Reprendre la séance';
  const done = next ? doneActivities(next) : 0;
  const total = next?.activities.length ?? 0;
  const ring = next ? (total ? (done / total) * 100 : 0) : completed ? 100 : 0;
  return (
    <section className="ld-hero ld-area-hero" aria-labelledby="ld-next-title">
      <NightDecor />
      <div className="ld-hero-copy">
        <p className="ld-hero-caption"><span className="ld-hero-live" aria-hidden="true" />Ma prochaine séance</p>
        <h2 id="ld-next-title">{next?.title ?? (completed ? 'Toutes vos séances sont terminées' : 'Votre parcours se prépare')}</h2>
        <div className="ld-hero-tags">
          <span className="ld-hero-tag"><BookOpen size={14} aria-hidden="true" /> {enrollment ? `${path ? languageName(path.languageId) : 'Allemand'} · ${enrollment.levelCode}` : 'Mon parcours'}</span>
          {path && path.steps.length > 1 && <span className="ld-hero-tag">Objectif {path.targetLevel}</span>}
          {next && <span className="ld-hero-tag">Séance {next.position} sur {sessions.length}</span>}
          {next?.status === 'late' && <span className="ld-hero-tag is-late">En retard</span>}
        </div>
        {next ? (
          <>
            <ul className="ld-hero-meta">
              <li><Clock size={16} aria-hidden="true" /> {next.estimatedMinutes} min</li>
              <li><CalendarClock size={16} aria-hidden="true" /> Échéance : {relativeDay(new Date(next.dueAt))}, {formatClock(next.dueAt)}</li>
            </ul>
            {next.activities.length > 0 && (
              <ol className="ld-hero-steps" aria-label="Activités de la séance">
                {next.activities.map((activity, index) => (
                  <li key={activity.id} className={activity.status === 'completed' ? 'is-done' : activity.status === 'started' ? 'is-started' : undefined}>
                    <span className="ld-hero-step-mark" aria-hidden="true">
                      {activity.status === 'completed' ? <Check size={13} strokeWidth={3} /> : activityIcons[activity.kind] ?? <BookOpen size={15} />}
                    </span>
                    <span className="ld-hero-step-text"><small aria-hidden="true">{String(index + 1).padStart(2, '0')}</small>{activity.title}</span>
                    {activity.status === 'completed' && <span className="sr-only"> (terminée)</span>}
                    {activity.status === 'started' && <span className="sr-only"> (en cours)</span>}
                  </li>
                ))}
              </ol>
            )}
          </>
        ) : (
          <p className="ld-hero-text">{completed ? 'Consultez vos résultats pour retrouver le travail effectué.' : 'Vos séances apparaîtront dès que votre planning sera validé.'}</p>
        )}
        <div className="ld-hero-actions">
          {next
            ? <Link className="btn btn-lg ld-hero-action" to={`/espace/seance/${next.id}`}><Play size={18} fill="currentColor" aria-hidden="true" /> {action}</Link>
            : <Link className="btn btn-lg ld-hero-action" to={completed ? '/espace/resultats' : enrollment || path ? '/espace/planning' : '/espace/accueil'}>
                {completed ? 'Voir mes résultats' : enrollment || path ? 'Voir mon planning' : 'Construire mon parcours'} <ArrowRight size={18} aria-hidden="true" /></Link>}
        </div>
      </div>
      <div className="ld-hero-visual">
        <ProgressRing value={ring} size={136} stroke={8} color="var(--accent)"
          label={next ? `${done} activité${done > 1 ? 's' : ''} terminée${done > 1 ? 's' : ''} sur ${total}` : completed ? 'Parcours terminé' : 'Aucune séance'}>
          <span className="ld-ring-text">
            {next ? <><strong>{done}/{total}</strong><small>activités</small></>
              : completed ? <><strong>100 %</strong><small>terminé</small></> : <><CalendarClock size={34} aria-hidden="true" /><small>bientôt</small></>}
          </span>
        </ProgressRing>
      </div>
    </section>
  );
}

/** Stations du chemin « accueil » : départ, niveaux du parcours, objectif (ou, sans parcours, départ et niveau visé). */
function homeJourney(enrollment: PlannedEnrollment, path: PathView | null) {
  if (path && path.steps.length) {
    const progress = pathProgress(path);
    const stations: JourneyStation[] = [
      { key: 'start', code: path.startLevel, title: 'Départ', state: 'done' },
      ...progress.steps.map((step, index): JourneyStation => {
        const last = index === progress.steps.length - 1;
        const state = stationState(step.status);
        return { key: step.id, code: step.levelCode, state, goal: last,
          title: last ? 'Objectif' : state === 'done' ? 'Validé' : state === 'current' ? 'En cours' : 'À venir',
          caption: last ? shortDate(path.targetDate) : undefined };
      }),
    ];
    return { stations, position: progress.position, percent: progress.percent };
  }
  const { goal, sessions } = enrollment;
  const complete = sessions.filter((session) => session.status === 'completed').length;
  const share = sessions.length ? complete / sessions.length : 0;
  return {
    stations: [
      { key: 'start', title: 'Départ', state: 'done' },
      { key: 'goal', code: goal.targetLevel, title: 'Objectif', caption: showDate(goal.targetDate), state: share >= 1 ? 'done' : 'current', goal: true },
    ] satisfies JourneyStation[],
    position: share,
    percent: Math.round(share * 100),
  };
}

function GoalCard({ enrollment, path }: { enrollment: PlannedEnrollment | null; path: PathView | null }) {
  if (!enrollment) {
    return (
      <Card className="ld-area-goal" title="Mon objectif" icon={<Target size={19} />}>
        <EmptyScene art="calendar" compact title="Aucun parcours pour le moment" description="Votre parcours s’affichera ici dès qu’il vous sera attribué." />
      </Card>
    );
  }
  const { goal, sessions } = enrollment;
  const complete = sessions.filter((session) => session.status === 'completed').length;
  const status = goalStatus[goal.status];
  const target = path?.targetDate ?? goal.targetDate;
  const remaining = target ? daysFromToday(localDate(target)) : null;
  const journey = homeJourney(enrollment, path);
  const milestone = byDate(sessions.filter((session) => session.status !== 'completed' && session.activities.some((activity) => activity.kind === 'assessment')),
    (session) => session.dueAt)[0];
  const language = path ? languageName(path.languageId) : 'Allemand';
  const level = path?.targetLevel ?? goal.targetLevel;
  return (
    <Card className="ld-area-goal ld-goal" title="Mon objectif" description={`${language} ${level} · ${path ? path.difficulty.label : paceLabel(goal.template)}`}
      icon={<Target size={19} />} action={<Badge tone={status.tone}>{status.label}</Badge>}>
      <JourneyRail stations={journey.stations} position={journey.position} marker={`${journey.percent} %`}
        label={`Chemin vers ${levelName(level)} : ${journey.percent} % du parcours réalisé`} />
      <ul className="ld-goal-stats">
        <li><strong>{complete}<small>/{sessions.length}</small></strong><span>séances faites</span></li>
        <li className={remaining !== null && remaining < 0 ? 'is-late' : undefined}>
          <strong>{remaining === null ? '—' : remaining < 0 ? 'Passée' : remaining === 0 ? 'Jour J' : remaining}</strong>
          <span>{remaining !== null && remaining > 0 ? `jour${remaining > 1 ? 's' : ''} restant${remaining > 1 ? 's' : ''}` : 'date cible'}</span>
        </li>
        <li><strong>{target ? formatMonthDay(localDate(target)).replace('.', '') : '—'}</strong><span>date cible</span></li>
      </ul>
      {milestone && (
        <Link className="ld-goal-next" to={`/espace/seance/${milestone.id}`}>
          <span className="ld-goal-next-icon" aria-hidden="true"><ClipboardCheck size={17} /></span>
          <span className="ld-goal-next-text"><small>Prochain bilan</small><strong>{milestone.title}</strong></span>
          <time dateTime={milestone.dueAt}>{capitalize(relativeDay(new Date(milestone.dueAt)))}</time>
        </Link>
      )}
      <Link className="text-link ld-card-link" to="/espace/planning">Voir mon objectif <ArrowRight size={15} aria-hidden="true" /></Link>
    </Card>
  );
}

const weekNames: Record<number, string> = { [-1]: 'Semaine dernière', 0: 'Cette semaine', 1: 'Semaine prochaine' };

function WeekCard({ sessions }: { sessions: SessionSummary[] }) {
  const [offset, setOffset] = useState(0);
  const start = addDays(startOfWeek(new Date()), offset * 7);
  const end = addDays(start, 6);
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = addDays(start, index);
    return {
      date,
      events: byDate(sessions.filter((session) => sameDay(new Date(session.dueAt), date)), (session) => session.dueAt).map((session) => ({
        key: session.id, title: session.title, meta: `${session.estimatedMinutes} min`, tone: statusTone[session.status],
        label: sessionStatus[session.status].label,
      })),
    };
  });
  const count = days.reduce((sum, day) => sum + day.events.length, 0);
  const done = days.reduce((sum, day) => sum + day.events.filter((event) => event.tone === 'done').length, 0);
  return (
    <Card className="ld-area-week ld-week" title="Ma semaine" icon={<CalendarDays size={19} />}
      description={count ? `${plural(count, 'séance')} · ${done} terminée${done > 1 ? 's' : ''}` : offset ? 'Aucune séance cette semaine-là' : 'Aucune séance cette semaine'}
      action={count ? <span className="ld-week-meter" role="img" aria-label={`${done} séances terminées sur ${count}`}>
        {Array.from({ length: count }, (_, index) => <i key={index} className={index < done ? 'is-done' : undefined} />)}</span> : undefined}>
      <div className="ld-week-bar">
        <WeekPager label={weekNames[offset] ?? `Semaine du ${formatMonthDay(start)}`} position={`${formatMonthDay(start)} – ${formatMonthDay(end)}`}
          onPrevious={() => setOffset((value) => value - 1)} onNext={() => setOffset((value) => value + 1)}
          onToday={offset ? () => setOffset(0) : undefined} />
        <CalendarLegend items={[{ tone: 'done', label: 'Terminée' }, { tone: 'current', label: 'En cours' }, { tone: 'todo', label: 'À venir' }, { tone: 'late', label: 'En retard' }]} />
      </div>
      <WeekGrid days={days} variant="strip" label={`Séances du ${formatMonthDay(start)} au ${formatMonthDay(end)}`} />
    </Card>
  );
}

function TodoCard({ sessions }: { sessions: SessionSummary[] }) {
  const gap = (session: SessionSummary) => daysFromToday(new Date(session.dueAt));
  const overdue = sessions.filter((session) => session.status === 'late' || (session.status !== 'completed' && gap(session) < 0));
  const today = sessions.filter((session) => !overdue.includes(session) && gap(session) === 0);
  const future = byDate(sessions.filter((session) => session.status !== 'completed' && gap(session) > 0), (session) => session.dueAt);
  const upcoming = future.slice(0, Math.max(2, 4 - overdue.length - today.length));
  const groups = [
    { id: 'late', label: 'À rattraper', items: overdue },
    { id: 'today', label: 'Aujourd’hui', items: today },
    { id: 'next', label: 'Prochainement', items: upcoming },
  ].filter((group) => group.items.length);
  const pending = [...overdue, ...today].filter((session) => session.status !== 'completed').length;
  const later = future.length - upcoming.length;
  return (
    <Card flush className="ld-area-todo ld-todo" title="À faire" icon={<ListChecks size={19} />}
      description={pending ? `${plural(pending, 'séance')} à terminer dès que possible` : 'Vous êtes à jour'}>
      {groups.length === 0 ? (
        <EmptyScene art="calendar" title="Rien à faire pour le moment" description="Vos prochaines séances apparaîtront ici."
          action={<Link className="btn btn-soft btn-sm" to="/espace/planning">Voir mon planning</Link>} />
      ) : (
        <div className="ld-todo-body">
          {groups.map((group) => (
            <div key={group.id} className={`ld-group is-${group.id}`}>
              <p className="ld-group-label">{group.label}<span>{group.items.length}</span></p>
              <ul className="kit-list ld-list lc-stagger">{group.items.map((session) => <li key={session.id}><SessionRow session={session} /></li>)}</ul>
            </div>
          ))}
        </div>
      )}
      {groups.length > 0 && (
        <Link className="ld-todo-more" to="/espace/planning">
          <CalendarRange size={16} aria-hidden="true" />
          <span>{later > 0 ? `${plural(later, 'autre séance', 'autres séances')} planifiée${later > 1 ? 's' : ''}` : 'Tout mon planning'}</span>
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      )}
    </Card>
  );
}

function ResultsPreview({ results, sessions }: { results: Grade[]; sessions: SessionSummary[] }) {
  const ordered = byDate(results, (grade) => grade.submittedAt);
  const scores = ordered.map(scoreOf);
  const average = scores.length ? Math.round(scores.reduce((sum, value) => sum + value, 0) / scores.length) : 0;
  const recent = [...ordered].reverse().slice(0, 3);
  const trend = scores.slice(-10);
  return (
    <Card className="ld-area-results ld-results-preview" title="Derniers résultats" icon={<ChartNoAxesCombined size={19} />}>
      {results.length === 0 ? (
        <EmptyScene art="chart" compact title="Aucun résultat pour le moment" description="Terminez un exercice pour voir votre score ici." />
      ) : (
        <>
          <div className="ld-score-head">
            <div className="ld-score-main"><strong>{average}<span> %</span></strong><small>score moyen · {plural(results.length, 'exercice')}</small></div>
            {trend.length > 1 && <Sparkline values={trend} width={200} height={52} label={`Évolution des scores : ${trend.map((value) => `${value} %`).join(', ')}`} />}
          </div>
          <ul className="ld-score-list">
            {recent.map((grade) => {
              const score = scoreOf(grade);
              return (
                <li key={grade.id}>
                  <span className="ld-score-name"><strong>{gradeTitle(grade, sessions).title}</strong><small>{capitalize(relativeDay(new Date(grade.submittedAt)))}</small></span>
                  <span className="ld-meter" aria-hidden="true"><span style={{ width: `${score}%`, background: scoreColor(score) }} /></span>
                  <b>{grade.correct}/{grade.total}</b>
                </li>
              );
            })}
          </ul>
        </>
      )}
      <Link className="text-link ld-card-link" to="/espace/resultats">Tous les résultats <ArrowRight size={15} aria-hidden="true" /></Link>
    </Card>
  );
}

function MessagePreview({ messages }: { messages: LearnerMessage[] }) {
  const last = byDate(messages, (message) => message.sentAt).at(-1);
  return (
    <Card className="ld-area-message" title="Dernier message" icon={<MessageCircle size={19} />}
      action={messages.length ? <Badge tone="blue">{messages.length}</Badge> : undefined}>
      {last ? (
        <div className="ld-message-preview">
          <TeacherAvatar size={36} />
          <div className="ld-bubble">
            <span className="ld-bubble-author">Votre professeur</span>
            <p>{last.text}</p>
            <time dateTime={last.sentAt}>{relativeMoment(last.sentAt)}</time>
          </div>
        </div>
      ) : <EmptyScene art="messages" compact title="Aucun message pour le moment" description="Les encouragements de votre professeur arriveront ici." />}
      {last && <Link className="text-link ld-card-link" to="/espace/messages">Toute la discussion <ArrowRight size={15} aria-hidden="true" /></Link>}
    </Card>
  );
}

function LibraryCard({ path }: { path: PathView | null }) {
  const shortcuts = [
    { icon: <BookOpen size={15} aria-hidden="true" />, label: 'Revoir une leçon', tone: 'lesson' },
    { icon: <PencilLine size={15} aria-hidden="true" />, label: 'Refaire un exercice', tone: 'exercise' },
    { icon: <ClipboardCheck size={15} aria-hidden="true" />, label: 'S’entraîner au bilan', tone: 'practice' },
  ];
  return (
    <section className="ld-area-library ld-library" aria-labelledby="ld-library-title">
      <span className="ld-library-art" aria-hidden="true"><EmptyArt kind="books" /></span>
      <div className="ld-library-main">
        <div className="ld-library-head">
          <span className="ld-library-icon" aria-hidden="true"><LibraryBig size={22} /></span>
          <div>
            <h2 id="ld-library-title">Bibliothèque</h2>
            <p>Tous les cours {path ? `${ofLanguage(languageName(path.languageId))} ` : ''}à tout moment, en plus de vos séances.</p>
          </div>
        </div>
        <Link className="btn btn-soft btn-sm ld-library-link" to="/espace/bibliotheque">Ouvrir la bibliothèque <ArrowRight size={15} aria-hidden="true" /></Link>
      </div>
      <ul className="ld-library-shortcuts">{shortcuts.map((item) => <li key={item.label} className={`is-${item.tone}`}><span>{item.icon}</span>{item.label}</li>)}</ul>
    </section>
  );
}

/** Bandeau d'une proposition de contrat qui attend la réponse de l'élève. */
function ContractBanner({ path }: { path: PathView }) {
  const pending = path.contract.pending;
  if (!pending?.canAccept) return null;
  return (
    <section className="ld-contract-banner lc-enter" aria-labelledby="ld-contract-title">
      <span className="ld-contract-icon" aria-hidden="true"><Handshake size={22} /></span>
      <div className="ld-contract-text">
        <p className="ld-contract-kicker">Proposition n° {pending.number} · votre réponse est attendue</p>
        <h2 id="ld-contract-title">{pending.proposedBy === 'teacher' ? 'Votre professeur vous propose un nouveau contrat' : 'Un nouveau contrat vous est proposé'}</h2>
        <ul className="ld-contract-terms">
          <li><LevelMark code={pending.terms.targetLevel} size="sm" /> {levelName(pending.terms.targetLevel)}</li>
          <li><CalendarRange size={15} aria-hidden="true" /> {longDate(pending.terms.targetDate)}</li>
          <li><Clock size={15} aria-hidden="true" /> au moins {formatMinutes(pending.terms.weeklyMinutes)} par semaine</li>
        </ul>
      </div>
      <Link className="btn btn-primary ld-contract-action" to="/espace/contrat">Voir la proposition <ArrowRight size={16} aria-hidden="true" /></Link>
    </section>
  );
}

export function HomeView({ enrollment, results, messages, path = null }: {
  enrollment: PlannedEnrollment | null; results: Grade[]; messages: LearnerMessage[]; path?: PathView | null;
}) {
  const sessions = enrollment?.sessions ?? [];
  const next = sessions.find((session) => session.status !== 'completed');
  const goal = enrollment?.goal;
  const diagnosticPending = Boolean(goal?.diagnosticLessonId && !goal.diagnosticAttemptId);
  return (
    <div className="ld-home">
      {path && <ContractBanner path={path} />}
      {diagnosticPending && (
        <div className="ld-notice lc-enter">
          <Callout tone="tip" title="Diagnostic initial à passer">
            <p>Quelques questions suffisent pour adapter votre parcours à ce que vous savez déjà.</p>
            <Link className="btn btn-primary btn-sm" to="/espace/diagnostic">Passer le diagnostic</Link>
          </Callout>
        </div>
      )}
      <div className="ld-home-grid lc-stagger">
        <NextSession enrollment={enrollment} next={next} path={path} />
        <GoalCard enrollment={enrollment} path={path} />
        <TodoCard sessions={sessions} />
        <WeekCard sessions={sessions} />
        <ResultsPreview results={results} sessions={sessions} />
        <MessagePreview messages={messages} />
        <LibraryCard path={path} />
      </div>
    </div>
  );
}
