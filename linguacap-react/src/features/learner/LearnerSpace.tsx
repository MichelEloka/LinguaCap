import { useState } from 'react';
import type { FormEvent } from 'react';
import { BookOpen, CalendarDays, Check, Clock3, Flag, Headphones, MessageCircle, Play, Target } from 'lucide-react';
import { Link, Route, Routes, useParams } from 'react-router-dom';
import { Badge, Dialog, EmptyState, PageHeading, ProgressBar, StatCard } from '../../components/ui';
import { useDemo } from '../../demo/context';
import { learnerId, lessons, relativeDate, todayIndex, weekDates } from '../../demo/data';
import type { Assessment, Goal, Session } from '../../domain/types';
import { AssessmentDetail, AssessmentList, Results } from './AssessmentPages';
import { completionRate, formatDate, formatDuration, planWeek, weekdays } from './learnerPlanning';
import './learner.css';

function LessonRow({ session }: { session: Session }) {
  const lesson = lessons.find(item => item.id === session.lessonId);
  if (!lesson) return null;
  return (
    <article className="lc-lesson-row">
      <span className="lc-tile-icon">{lesson.skill === 'Écoute' ? <Headphones size={20} /> : <BookOpen size={20} />}</span>
      <div className="lc-lesson-copy">
        <strong>{lesson.title}</strong>
        <small>{lesson.skill} · {formatDuration(session.minutes)}</small>
      </div>
      <Link className="btn btn-soft lc-lesson-action" to={`/eleve/seances/${session.id}`}>
        {session.completed ? <><Check size={16} /> Revoir</> : <><Play size={15} /> Commencer</>}
      </Link>
    </article>
  );
}

function WeekPanel({ full = false }: { full?: boolean }) {
  const { state } = useDemo();
  const [day, setDay] = useState(todayIndex);
  const daySessions = state.sessions.filter(session => session.day === day);
  const weekLabel = weekDates.length
    ? `${formatDate(weekDates[0], { day: 'numeric', month: 'short' })} – ${formatDate(weekDates[weekDates.length - 1], { day: 'numeric', month: 'short' })}`
    : '';

  return (
    <section className="panel lc-week-panel" aria-labelledby="learner-week">
      <div className="lc-section-head">
        <div><h2 id="learner-week">Cette semaine</h2><p className="muted">Séances prévues et rattrapages</p></div>
        <span className="lc-date-label"><CalendarDays size={17} /> {weekLabel}</span>
      </div>
      <div className="lc-week-days" role="group" aria-label="Jour du planning">
        {weekdays.map((weekday, index) => {
          const scheduled = state.sessions.filter(session => session.day === index);
          const done = scheduled.length > 0 && scheduled.every(session => session.completed);
          const tooLate = index < todayIndex && scheduled.some(session => !session.completed);
          const date = weekDates[index];
          return (
            <button
              key={weekday.short}
              type="button"
              aria-label={`${weekday.full}${date ? ` ${formatDate(date)}` : ''}${done ? ', séances terminées' : tooLate ? ', à rattraper' : ''}`}
              aria-pressed={day === index}
              className={`lc-week-day${day === index ? ' lc-week-day-active' : ''}`}
              onClick={() => setDay(index)}
            >
              <span>{weekday.short}</span>
              <strong>{date ? formatDate(date, { day: 'numeric' }) : index + 1}</strong>
              {done && <Check size={13} className="lc-day-mark" aria-hidden="true" />}
              {tooLate && <span className="lc-day-late lc-day-mark" aria-hidden="true" />}
            </button>
          );
        })}
      </div>
      <div className="lc-section-head lc-sessions-head">
        <h3>{day === todayIndex ? 'Aujourd’hui' : weekdays[day]?.full ?? 'Séances'}</h3>
        <span className="muted">{daySessions.length} séance{daySessions.length > 1 ? 's' : ''}</span>
      </div>
      {daySessions.length ? daySessions.map(session => <LessonRow key={session.id} session={session} />) : (
        <p className="lc-quiet">Aucune séance prévue ce jour.</p>
      )}
      {!full && <Link className="lc-panel-link" to="/eleve/planning">Voir tout le planning</Link>}
    </section>
  );
}

function messagePreview(message: string) {
  return message.length > 190 ? `${message.slice(0, 187)}…` : message;
}

function AssessmentSummary({ assessment }: { assessment: Assessment }) {
  return (
    <section className="panel lc-next-card">
      <span className="lc-tile-icon"><Flag size={20} /></span>
      <h2>Prochaine évaluation</h2>
      <p>{assessment.title}</p>
      <div className="lc-next-card-foot">
        <time dateTime={assessment.dueDate}>{formatDate(assessment.dueDate)}</time>
        <Link className="lc-panel-link" to={`/eleve/evaluations/${assessment.id}`}>Voir l’évaluation</Link>
      </div>
    </section>
  );
}

function Overview() {
  const { state } = useDemo();
  const student = state.students.find(item => item.id === learnerId);
  const firstName = student?.name.split(' ')[0] ?? 'Camille';
  const completed = state.sessions.filter(session => session.completed);
  const rate = completionRate(state.sessions);
  const practice = completed.reduce((total, session) => total + session.minutes, 0);
  const toCatchUp = state.sessions.filter(session => !session.completed && session.day >= 0 && session.day < todayIndex).length;
  const nextAssessment = state.assessments.filter(item => item.learnerId === learnerId && item.status === 'ready')
    .sort((first, second) => first.dueDate.localeCompare(second.dueDate))[0];
  const latestMessage = state.messages.filter(message => message.learnerId === learnerId)
    .sort((first, second) => second.createdAt.localeCompare(first.createdAt))[0];

  return (
    <div className="lc-learner-layout">
      <PageHeading title={`Bonjour ${firstName}`} description="Retrouvez vos séances, vos bilans et les retours de votre professeur." action={<Badge tone={state.goal.pace === 'Intensif' ? 'violet' : 'blue'}>{state.goal.pace}</Badge>} />
      <section className="lc-goal-card" aria-label="Objectif d’apprentissage">
        <div className="lc-goal-main">
          <span className="lc-goal-label"><Target size={19} /> Mon objectif</span>
          <h2>Allemand <span>{state.goal.level}</span></h2>
          <p>{state.goal.title}</p>
          <div className="lc-goal-progress"><strong>{rate} %</strong><span>des séances de la semaine terminées</span></div>
          <ProgressBar value={rate} label="Séances de la semaine terminées" />
        </div>
        <div className="lc-goal-aside">
          <span className="lc-goal-icon"><CalendarDays size={24} /></span>
          <span className="lc-goal-label">Échéance de l’objectif</span>
          <strong>{formatDate(state.goal.targetDate, { day: 'numeric', month: 'short' })}</strong>
          <Link to="/eleve/planning">Ajuster mon planning</Link>
        </div>
      </section>
      <div className="lc-learner-stats">
        <StatCard label="Séances terminées" value={`${completed.length} / ${state.sessions.length}`} icon={<Check size={20} />} />
        <StatCard label="Temps de pratique estimé" value={formatDuration(practice)} note="Séances terminées de la semaine" icon={<Clock3 size={20} />} />
        <StatCard label="Séances à rattraper" value={String(toCatchUp)} icon={<CalendarDays size={20} />} />
      </div>
      <div className="lc-learner-columns">
        <WeekPanel />
        <aside className="lc-learner-side">
          {nextAssessment && <AssessmentSummary assessment={nextAssessment} />}
          <section className="panel lc-coach-card">
            <div className="lc-section-head">
              <div><h2>{student?.teacher ?? 'Parcours autonome'}</h2><p className="muted">{student?.teacher ? 'Suivi pédagogique' : 'Vos retours pédagogiques'}</p></div>
              <span className="lc-tile-icon"><MessageCircle size={20} /></span>
            </div>
            {latestMessage ? <p className="lc-coach-quote">« {messagePreview(latestMessage.body)} »</p> : <p className="muted">Aucun message pour le moment.</p>}
            <Link className="lc-panel-link" to="/eleve/messages">Voir les messages</Link>
          </section>
        </aside>
      </div>
    </div>
  );
}

function ScheduleForm({ goal, onClose }: { goal: Goal; onClose: () => void }) {
  const { state, update, notify } = useDemo();
  const [draft, setDraft] = useState<Goal>(goal);
  const [error, setError] = useState('');
  const dateMin = weekDates[todayIndex];
  const preview = planWeek(state.sessions, draft, weekDates, todayIndex);
  const duration = draft.days.length * draft.sessionsPerDay * draft.minutesPerSession;

  function toggleDay(day: number) {
    setDraft(current => ({
      ...current,
      days: current.days.includes(day) ? current.days.filter(value => value !== day) : [...current.days, day],
    }));
    setError('');
  }

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft.title.trim()) {
      setError('Renseignez un objectif.');
      return;
    }
    if (!draft.days.length || (dateMin && draft.targetDate < dateMin)) {
      setError(!draft.days.length ? 'Choisissez au moins un jour disponible.' : 'Sélectionnez une échéance à venir.');
      return;
    }
    update(current => ({
      ...current,
      goal: { ...draft, title: draft.title.trim() },
      sessions: planWeek(current.sessions, draft, weekDates, todayIndex).sessions,
      students: current.students.map(student => student.id === learnerId ? { ...student, targetDate: draft.targetDate } : student),
    }));
    notify('Votre planning a été mis à jour.');
    onClose();
  }

  return (
    <Dialog title="Ajuster mes disponibilités" onClose={onClose}>
      <form className="lc-schedule-form" onSubmit={save}>
        <label className="lc-form-label">Mon objectif
          <input value={draft.title} required maxLength={150} onChange={event => setDraft(current => ({ ...current, title: event.target.value }))} />
        </label>
        <div className="lc-form-grid">
          <label className="lc-form-label">Date cible
            <input type="date" min={dateMin} value={draft.targetDate} required onChange={event => setDraft(current => ({ ...current, targetDate: event.target.value }))} />
          </label>
          <label className="lc-form-label">Rythme
            <select value={draft.pace} onChange={event => {
              const pace = event.target.value === 'Intensif' ? 'Intensif' : 'Standard';
              setDraft(current => ({ ...current, pace, sessionsPerDay: pace === 'Intensif' ? 2 : 1 }));
            }}>
              <option value="Standard">Standard</option>
              <option value="Intensif">Intensif</option>
            </select>
          </label>
        </div>
        <fieldset className="lc-available-days">
          <legend>Jours disponibles</legend>
          <div className="lc-day-options">
            {weekdays.map((weekday, index) => (
              <label key={weekday.full}><input type="checkbox" checked={draft.days.includes(index)} onChange={() => toggleDay(index)} aria-label={weekday.full} />{weekday.short}</label>
            ))}
          </div>
        </fieldset>
        <div className="lc-form-grid">
          <label className="lc-form-label">Séances par jour
            <select value={draft.sessionsPerDay} onChange={event => setDraft(current => ({ ...current, sessionsPerDay: Number(event.target.value) }))}>
              {[...new Set([1, 2, 3, 4, draft.sessionsPerDay])].sort((a, b) => a - b).map(count => <option key={count} value={count}>{count}</option>)}
            </select>
          </label>
          <label className="lc-form-label">Minutes par séance
            <select value={draft.minutesPerSession} onChange={event => setDraft(current => ({ ...current, minutesPerSession: Number(event.target.value) }))}>
              {[...new Set([15, 20, 25, 30, 45, 60, draft.minutesPerSession])].sort((a, b) => a - b).map(minutes => <option key={minutes} value={minutes}>{minutes} min</option>)}
            </select>
          </label>
        </div>
        <p className="lc-form-caption" aria-live="polite"><strong>{formatDuration(duration)}</strong> disponibles par semaine. {preview.unplanned > 0 ? `${preview.unplanned} séance${preview.unplanned > 1 ? 's restent' : ' reste'} à placer cette semaine.` : 'Toutes les séances à venir tiennent dans la semaine.'}</p>
        {error && <p className="lc-form-error" role="alert">{error}</p>}
        <div className="lc-form-actions"><button className="btn btn-outline" type="button" onClick={onClose}>Annuler</button><button className="btn btn-primary" type="submit">Enregistrer le planning</button></div>
      </form>
    </Dialog>
  );
}

function Planning() {
  const { state } = useDemo();
  const [editing, setEditing] = useState(false);
  const late = state.sessions.filter(session => !session.completed && session.day >= 0 && session.day < todayIndex);
  const unplanned = state.sessions.filter(session => !session.completed && session.day < 0);
  return (
    <div className="lc-learner-layout">
      <PageHeading title="Mon planning" description={`Allemand ${state.goal.level} · ${state.goal.pace} · objectif le ${formatDate(state.goal.targetDate)}`} action={<button type="button" className="btn btn-primary" onClick={() => setEditing(true)}>Modifier mes disponibilités</button>} />
      <div className="lc-learner-columns">
        <WeekPanel full />
        <aside className="lc-learner-side">
          <section className="panel lc-planning-info">
            <span className="lc-tile-icon"><Clock3 size={20} /></span>
            <h2>Mes disponibilités</h2>
            <p>{state.goal.days.length} jours · {state.goal.sessionsPerDay} séance{state.goal.sessionsPerDay > 1 ? 's' : ''} par jour · {formatDuration(state.goal.minutesPerSession)} par séance</p>
            <strong>{formatDuration(state.goal.days.length * state.goal.sessionsPerDay * state.goal.minutesPerSession)} par semaine</strong>
          </section>
          {late.length > 0 && <section className="panel lc-planning-info"><h2>À rattraper</h2>{late.map(session => <LessonRow key={session.id} session={session} />)}</section>}
          {unplanned.length > 0 && <section className="panel lc-planning-info"><h2>À planifier</h2><p>{unplanned.length} séance{unplanned.length > 1 ? 's attendent' : ' attend'} un créneau. Ajustez vos disponibilités ou votre échéance.</p></section>}
        </aside>
      </div>
      {editing && <ScheduleForm goal={state.goal} onClose={() => setEditing(false)} />}
    </div>
  );
}

function LessonReader({ session }: { session: Session }) {
  const { state, update, notify } = useDemo();
  const [choice, setChoice] = useState<number | null>(null);
  const [validated, setValidated] = useState(false);
  const lesson = lessons.find(item => item.id === session.lessonId);
  if (!lesson) return <EmptyState title="Séance indisponible" action={<Link className="btn btn-outline" to="/eleve/planning">Retour au planning</Link>} />;
  const media = lesson.mediaIds.flatMap(id => {
    const asset = state.media.find(item => item.id === id);
    return asset ? [asset] : [];
  });
  const { question } = lesson;
  const correct = choice === question.correct;

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (choice === null || validated) return;
    const score = correct ? 100 : 0;
    update(current => {
      const sessions = current.sessions.map(item => item.id === session.id ? { ...item, completed: true, score } : item);
      return {
        ...current,
        sessions,
        students: current.students.map(student => student.id === learnerId ? { ...student, progress: completionRate(sessions), lastActivity: relativeDate(0) } : student),
      };
    });
    setValidated(true);
    notify('Séance terminée. Le résultat est disponible dans votre suivi.');
  }

  return (
    <div className="lc-learner-layout">
      <Link to="/eleve/planning" className="lc-back-link">Retour au planning</Link>
      <PageHeading title={lesson.title} description={lesson.summary} action={<Badge tone={session.completed ? 'green' : 'blue'}>{session.completed ? 'Terminée' : `${lesson.skill} · ${formatDuration(session.minutes)}`}</Badge>} />
      <div className="lc-learner-columns lc-lesson-layout">
        <section className="panel lc-lesson-content">
          <h2>La leçon</h2>
          {media.map(asset => asset.kind === 'image' ? (
            <figure className="lc-lesson-figure" key={asset.id}>
              <img src={asset.src} alt={asset.alt ?? asset.title} />
              {(asset.credit || asset.title) && <figcaption>{asset.title}{asset.credit ? ` · ${asset.credit}` : ''}</figcaption>}
            </figure>
          ) : (
            <div className="lc-audio-card" key={asset.id}>
              <div className="lc-audio-heading"><Headphones size={20} /><strong>{asset.title}</strong></div>
              <audio controls preload="metadata" src={asset.src} aria-label={asset.title}>
                <a href={asset.src}>Ouvrir l’enregistrement</a>
              </audio>
              {asset.transcript && <details><summary>Voir la transcription</summary><p lang="de">{asset.transcript}</p></details>}
            </div>
          ))}
          <ul className="lc-phrases">
            {lesson.phrases.map(phrase => <li key={phrase.german}><strong lang="de">{phrase.german}</strong><span>{phrase.french}</span></li>)}
          </ul>
        </section>
        <section className="panel lc-quiz-panel">
          <h2>Exercice</h2>
          <form onSubmit={submit}>
            <fieldset>
              <legend>{question.prompt}</legend>
              <div className="lc-quiz-options">
                {question.choices.map((option, index) => (
                  <label className={`lc-quiz-option${validated && index === question.correct ? ' lc-choice-correct' : ''}`} key={option}>
                    <input type="radio" name="lesson-answer" value={index} checked={choice === index} onChange={() => setChoice(index)} disabled={validated} />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            {validated && <p className={`lc-answer-note ${correct ? 'lc-answer-correct' : ''}`} role="status"><strong>{correct ? 'Bonne réponse.' : 'À revoir.'}</strong> {question.feedback}</p>}
            {validated ? (
              <Link className="btn btn-primary" to="/eleve/planning">Revenir au planning</Link>
            ) : (
              <button className="btn btn-primary" type="submit" disabled={choice === null}>Valider ma réponse</button>
            )}
          </form>
        </section>
      </div>
    </div>
  );
}

function SessionRoute() {
  const { id } = useParams();
  const { state } = useDemo();
  const session = state.sessions.find(item => item.id === id);
  return session ? <LessonReader key={session.id} session={session} /> : <EmptyState title="Séance introuvable" action={<Link className="btn btn-outline" to="/eleve/planning">Retour au planning</Link>} />;
}

function Messages() {
  const { state } = useDemo();
  const messages = state.messages.filter(message => message.learnerId === learnerId)
    .sort((first, second) => second.createdAt.localeCompare(first.createdAt));
  return (
    <div className="lc-learner-layout">
      <PageHeading title="Mes messages" description="Les encouragements envoyés dans votre espace de suivi." />
      {messages.length === 0 ? <EmptyState title="Aucun message" description="Les messages de votre professeur apparaîtront ici." /> : (
        <div className="lc-learner-cards">
          {messages.map(message => (
            <article className="panel lc-message" key={message.id}>
              <span className="lc-tile-icon"><MessageCircle size={20} /></span>
              <div><h2>{message.author}</h2><time dateTime={message.createdAt}>{formatDate(message.createdAt, { day: 'numeric', month: 'long', year: 'numeric' })}</time><p>{message.body}</p></div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export default function LearnerSpace() {
  return (
    <Routes>
      <Route index element={<Overview />} />
      <Route path="planning" element={<Planning />} />
      <Route path="seances/:id" element={<SessionRoute />} />
      <Route path="evaluations" element={<AssessmentList />} />
      <Route path="evaluations/:id" element={<AssessmentDetail />} />
      <Route path="resultats" element={<Results />} />
      <Route path="messages" element={<Messages />} />
      <Route path="*" element={<EmptyState title="Page introuvable" action={<Link to="/eleve" className="btn btn-outline">Revenir à mon espace</Link>} />} />
    </Routes>
  );
}
