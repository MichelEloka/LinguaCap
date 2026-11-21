/** Accueil « Aujourd’hui » de l'élève : prochaine séance, objectif, semaine, séances à faire, résultats et dernier message. */
import { useState } from 'react';
import {
  ArrowRight, BookOpen, CalendarCheck2, CalendarClock, CalendarDays, ChartNoAxesCombined, Check, ClipboardCheck, Clock, Flag, Handshake, LibraryBig,
  ListChecks, MessageCircle, PencilLine, Play, Target,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge, EmptyState } from '../../components/ui';
import { Callout, Card, ProgressRing, Sparkline } from '../../design/kit';
import { languageName } from '../../domain/languages';
import { formatMinutes, type PathView } from '../../integration/v2';
import { LevelMark, levelName, longDate, ofLanguage } from '../onboarding/onboarding-kit';
import { goalStatus, paceLabel, showDate, type PlannedEnrollment } from './GoalPanel';
import { sessionStatus, type Grade, type SessionSummary } from './LearnerSession';
import {
  addDays, CalendarLegend, capitalize, daysFromToday, formatClock, formatMonthDay, localDate, relativeDay, relativeMoment, sameDay,
  startOfWeek, WeekGrid, WeekPager,
} from './learner-calendar';
import {
  activityIcons, byDate, doneActivities, gradeTitle, plural, scoreColor, scoreOf, SessionRow, statusTone, TeacherAvatar,
  type LearnerMessage,
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
      <div className="ld-hero-copy">
        <div className="ld-hero-tags">
          <span className="ld-hero-tag"><BookOpen size={14} aria-hidden="true" /> {enrollment ? `${path ? languageName(path.languageId) : 'Allemand'} · ${enrollment.levelCode}` : 'Mon parcours'}</span>
          {path && path.steps.length > 1 && <span className="ld-hero-tag">Objectif {path.targetLevel}</span>}
          {next && <span className="ld-hero-tag">Séance {next.position} sur {sessions.length}</span>}
          {next?.status === 'late' && <span className="ld-hero-tag is-late">En retard</span>}
        </div>
        <p className="ld-hero-caption">Ma prochaine séance</p>
        <h2 id="ld-next-title">{next?.title ?? (completed ? 'Toutes vos séances sont terminées' : 'Votre parcours se prépare')}</h2>
        {next ? (
          <>
            <ul className="ld-hero-meta">
              <li><Clock size={16} aria-hidden="true" /> {next.estimatedMinutes} min</li>
              <li><CalendarClock size={16} aria-hidden="true" /> Échéance : {relativeDay(new Date(next.dueAt))}, {formatClock(next.dueAt)}</li>
            </ul>
            {next.activities.length > 0 && (
              <ol className="ld-hero-steps" aria-label="Activités de la séance">
                {next.activities.map((activity) => (
                  <li key={activity.id} className={activity.status === 'completed' ? 'is-done' : activity.status === 'started' ? 'is-started' : undefined}>
                    {activity.status === 'completed' ? <Check size={14} aria-hidden="true" /> : activityIcons[activity.kind] ?? <BookOpen size={15} aria-hidden="true" />}
                    <span>{activity.title}</span>
                    {activity.status === 'completed' && <span className="sr-only"> (terminée)</span>}
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
        <ProgressRing value={ring} size={152} stroke={12} color="var(--accent)"
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

function GoalCard({ enrollment, path }: { enrollment: PlannedEnrollment | null; path: PathView | null }) {
  if (!enrollment) {
    return (
      <Card className="ld-area-goal" title="Mon objectif" icon={<Target size={19} />}>
        <EmptyState icon={<Target size={26} />} title="Aucun parcours pour le moment" description="Votre parcours s’affichera ici dès qu’il vous sera attribué." />
      </Card>
    );
  }
  const { goal, sessions } = enrollment;
  const complete = sessions.filter((session) => session.status === 'completed').length;
  const percent = sessions.length ? Math.round((complete / sessions.length) * 100) : 0;
  const status = goalStatus[goal.status];
  const target = path?.targetDate ?? goal.targetDate;
  const remaining = target ? daysFromToday(localDate(target)) : null;
  return (
    <Card className="ld-area-goal ld-goal" title="Mon objectif" description={path ? `${languageName(path.languageId)} ${path.targetLevel}` : `Allemand ${goal.targetLevel}`}
      icon={<Target size={19} />} action={<Badge tone={status.tone}>{status.label}</Badge>}>
      {path && path.steps.length > 1 && (
        <ol className="ld-goal-levels" aria-label="Niveaux du parcours">
          {path.steps.map((step) => (
            <li key={step.id} className={`lvl-${step.levelCode} is-${step.status}`}>
              <LevelMark code={step.levelCode} size="sm" state={step.status === 'active' ? 'current' : step.status === 'completed' ? 'done' : 'planned'} />
              <span>{step.status === 'active' ? 'En cours' : step.status === 'completed' ? 'Terminé' : 'À venir'}</span>
            </li>
          ))}
        </ol>
      )}
      <div className="ld-goal-body">
        <ProgressRing value={percent} size={96} stroke={9} label={`Parcours réalisé à ${percent} %`}>
          <span className="ld-ring-text"><strong>{percent} %</strong><small>du parcours</small></span>
        </ProgressRing>
        <dl className="ld-goal-facts">
          <div><dt>Séances terminées</dt><dd>{complete} / {sessions.length}</dd></div>
          <div><dt>Date cible</dt><dd>{path ? longDate(path.targetDate) : showDate(goal.targetDate)}</dd></div>
          <div><dt>Rythme</dt><dd>{path ? path.difficulty.label : paceLabel(goal.template)}</dd></div>
        </dl>
      </div>
      {remaining !== null && remaining >= 0 && (
        <p className="ld-goal-countdown"><Flag size={15} aria-hidden="true" />
          {remaining === 0 ? 'Date cible aujourd’hui' : <>Encore <strong>{plural(remaining, 'jour')}</strong> avant la date cible</>}</p>
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
    <Card className="ld-area-week" title="Ma semaine" icon={<CalendarDays size={19} />}
      description={count ? `${plural(count, 'séance')} · ${done} terminée${done > 1 ? 's' : ''}` : offset ? 'Aucune séance cette semaine-là' : 'Aucune séance cette semaine'}>
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
  const upcoming = byDate(sessions.filter((session) => session.status !== 'completed' && gap(session) > 0), (session) => session.dueAt)
    .slice(0, Math.max(2, 6 - overdue.length - today.length));
  const groups = [
    { id: 'late', label: 'À rattraper', items: overdue },
    { id: 'today', label: 'Aujourd’hui', items: today },
    { id: 'next', label: 'Prochainement', items: upcoming },
  ].filter((group) => group.items.length);
  const pending = [...overdue, ...today].filter((session) => session.status !== 'completed').length;
  return (
    <Card flush className="ld-area-todo ld-todo" title="À faire" icon={<ListChecks size={19} />}
      description={pending ? `${plural(pending, 'séance')} à terminer dès que possible` : 'Vous êtes à jour'}>
      {groups.length === 0 ? (
        <EmptyState icon={<CalendarCheck2 size={26} />} title="Rien à faire pour le moment" description="Vos prochaines séances apparaîtront ici."
          action={<Link className="btn btn-soft btn-sm" to="/espace/planning">Voir mon planning</Link>} />
      ) : groups.map((group) => (
        <div key={group.id} className={`ld-group is-${group.id}`}>
          <p className="ld-group-label">{group.label}<span>{group.items.length}</span></p>
          <ul className="kit-list ld-list">{group.items.map((session) => <li key={session.id}><SessionRow session={session} /></li>)}</ul>
        </div>
      ))}
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
    <Card className="ld-area-results" title="Derniers résultats" icon={<ChartNoAxesCombined size={19} />}>
      {results.length === 0 ? (
        <EmptyState icon={<ChartNoAxesCombined size={26} />} title="Aucun résultat pour le moment" description="Terminez un exercice pour voir votre score ici." />
      ) : (
        <>
          <div className="ld-score-head">
            <div className="ld-score-main"><strong>{average} %</strong><small>score moyen · {plural(results.length, 'exercice')}</small></div>
            {trend.length > 1 && <Sparkline values={trend} width={240} height={56} label={`Évolution des scores : ${trend.map((value) => `${value} %`).join(', ')}`} />}
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
      ) : <EmptyState icon={<MessageCircle size={26} />} title="Aucun message pour le moment" description="Les encouragements de votre professeur arriveront ici." />}
      {last && <Link className="text-link ld-card-link" to="/espace/messages">Toute la discussion <ArrowRight size={15} aria-hidden="true" /></Link>}
    </Card>
  );
}

function LibraryCard({ path }: { path: PathView | null }) {
  const shortcuts = [
    { icon: <BookOpen size={15} aria-hidden="true" />, label: 'Revoir une leçon' },
    { icon: <PencilLine size={15} aria-hidden="true" />, label: 'Refaire un exercice' },
    { icon: <ClipboardCheck size={15} aria-hidden="true" />, label: 'S’entraîner au bilan' },
  ];
  return (
    <section className="ld-area-library ld-library" aria-labelledby="ld-library-title">
      <div className="ld-library-head">
        <span className="ld-library-icon" aria-hidden="true"><LibraryBig size={22} /></span>
        <div>
          <h2 id="ld-library-title">Bibliothèque</h2>
          <p>Tous les cours {path ? `${ofLanguage(languageName(path.languageId))} ` : ''}à tout moment, en plus de vos séances.</p>
        </div>
      </div>
      <ul className="ld-library-shortcuts">{shortcuts.map((item) => <li key={item.label}>{item.icon}{item.label}</li>)}</ul>
      <Link className="btn btn-soft btn-sm ld-library-link" to="/espace/bibliotheque">Ouvrir la bibliothèque <ArrowRight size={15} aria-hidden="true" /></Link>
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
        <h2 id="ld-contract-title">{pending.proposedBy === 'teacher' ? 'Votre professeur vous propose un nouveau contrat' : 'Un nouveau contrat vous est proposé'}</h2>
        <p>{levelName(pending.terms.targetLevel)} le {longDate(pending.terms.targetDate)} · au moins {formatMinutes(pending.terms.weeklyMinutes)} par semaine</p>
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
        <TodoCard sessions={sessions} />
        <WeekCard sessions={sessions} />
        <GoalCard enrollment={enrollment} path={path} />
        <ResultsPreview results={results} sessions={sessions} />
        <MessagePreview messages={messages} />
        <LibraryCard path={path} />
      </div>
    </div>
  );
}
