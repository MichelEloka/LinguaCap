import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, Route, Routes } from 'react-router-dom';
import { CalendarCheck2, CalendarDays, ChartNoAxesCombined, Clock, MessageSquare, PlayCircle } from 'lucide-react';
import { Badge, EmptyState } from '../../components/ui';
import { requestApi } from '../../integration/api';
import { formatDue, SessionPage, sessionStatus, type Enrollment, type Grade, type SessionSummary } from './LearnerSession';
import './pilot.css';

interface Level { id: string; code: string; title: string; status: string }
interface Goal {
  level: string;
  pace: 'standard' | 'intensive';
  startDate: string;
  targetDate: string;
  studyDays: number[];
  sessionsPerDay: number;
  minutesPerSession: number;
}
interface Message { id: string; text: string; sentAt: string }

const weekdays = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
const dateDisplay = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' });

function errorText(error: unknown) {
  return error instanceof Error && error.name !== 'TimeoutError'
    ? error.message : 'Le service est momentanément indisponible. Réessayez.';
}

function GoalEditor({ goal, levels, token, saved }: {
  goal: Goal | null; levels: Level[]; token: string; saved: (goal: Goal) => void;
}) {
  const [schedule, setSchedule] = useState<Goal>(goal ?? {
    level: levels[0]?.code ?? '', pace: 'standard', startDate: '', targetDate: '',
    studyDays: [1, 2, 3, 4, 5], sessionsPerDay: 1, minutesPerSession: 25,
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const update = <Key extends keyof Goal>(key: Key, value: Goal[Key]) =>
    setSchedule((current) => ({ ...current, [key]: value }));

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setNotice('');
    setBusy(true);
    // Send the editable fields only. The server owns audit timestamps.
    const { level, pace, startDate, targetDate, studyDays, sessionsPerDay, minutesPerSession } = schedule;
    try {
      const result = await requestApi<Goal>('/learning/goal', token, {
        method: 'PUT', body: { level, pace, startDate, targetDate, studyDays, sessionsPerDay, minutesPerSession },
      });
      setSchedule(result);
      saved(result);
      setNotice('Votre objectif a été enregistré.');
    } catch (failure) {
      setError(errorText(failure));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="panel stack" aria-labelledby="pilot-goal">
      <div className="panel-heading"><h2 id="pilot-goal">Mon objectif</h2><CalendarDays aria-hidden="true" /></div>
      <form className="stack" onSubmit={submit}>
        <div className="pilot-form-grid">
          <label className="field">Niveau visé<select required value={schedule.level} onChange={(event) => update('level', event.target.value)}>
            {levels.map((level) => <option key={level.id} value={level.code}>{level.code} · {level.title}</option>)}
          </select></label>
          <label className="field">Rythme<select value={schedule.pace} onChange={(event) => update('pace', event.target.value === 'intensive' ? 'intensive' : 'standard')}>
            <option value="standard">Standard</option><option value="intensive">Intensif</option>
          </select></label>
          <label className="field">Début<input required type="date" value={schedule.startDate} onChange={(event) => update('startDate', event.target.value)} /></label>
          <label className="field">Date cible<input required type="date" min={schedule.startDate || undefined} value={schedule.targetDate} onChange={(event) => update('targetDate', event.target.value)} /></label>
          <label className="field">Séances par jour<input required type="number" min={1} max={6} value={schedule.sessionsPerDay} onChange={(event) => update('sessionsPerDay', Number(event.target.value))} /></label>
          <label className="field">Minutes par séance<input required type="number" min={10} max={180} value={schedule.minutesPerSession} onChange={(event) => update('minutesPerSession', Number(event.target.value))} /></label>
        </div>
        <fieldset className="pilot-options">
          <legend>Jours d’étude</legend>
          {weekdays.map((name, index) => {
            const day = index + 1;
            return <label key={name}><input type="checkbox" checked={schedule.studyDays.includes(day)}
              onChange={(event) => update('studyDays', event.target.checked
                ? [...schedule.studyDays, day].sort((left, right) => left - right)
                : schedule.studyDays.filter((value) => value !== day))} /> {name}</label>;
          })}
        </fieldset>
        {error && <p className="inline-message warning" role="alert">{error}</p>}
        {notice && <p className="inline-message" role="status">{notice}</p>}
        <button className="btn btn-primary" type="submit" disabled={busy || !schedule.studyDays.length || !levels.length}>
          {busy ? 'Enregistrement…' : 'Enregistrer mon objectif'}
        </button>
      </form>
    </section>
  );
}

function isToday(value: string) {
  const day = new Date(value);
  const today = new Date();
  return day.getFullYear() === today.getFullYear() && day.getMonth() === today.getMonth() && day.getDate() === today.getDate();
}

function SessionLink({ session }: { session: SessionSummary }) {
  const label = session.status === 'completed' ? 'Revoir la séance'
    : session.status === 'planned' ? 'Commencer la séance' : 'Reprendre la séance';
  return (
    <Link className={session.status === 'completed' ? 'btn btn-outline' : 'btn btn-primary'} to={`/espace/seance/${session.id}`}>
      <PlayCircle size={17} aria-hidden="true" /> {label}
    </Link>
  );
}

/** Accueil élève : prochaine séance, séances du jour et parcours attribué (DEV-030). */
function NextSessions({ enrollment }: { enrollment: Enrollment | null }) {
  if (!enrollment) {
    return (
      <section className="panel stack" aria-labelledby="pilot-next">
        <div className="panel-heading"><h2 id="pilot-next">Ma prochaine séance</h2><CalendarCheck2 aria-hidden="true" /></div>
        <EmptyState title="Votre parcours sera bientôt prêt"
          description="Votre professeur ou l’administration vous attribuera un parcours et planifiera votre première séance." />
      </section>
    );
  }
  const next = enrollment.sessions.find((session) => session.status !== 'completed') ?? null;
  const today = enrollment.sessions.filter((session) => isToday(session.dueAt));
  return (
    <section className="panel stack" aria-labelledby="pilot-next">
      <div className="panel-heading">
        <h2 id="pilot-next">Ma prochaine séance</h2>
        <Badge tone="blue">Allemand {enrollment.levelCode}</Badge>
      </div>
      {next ? (
        <article className="pilot-next stack">
          <h3>{next.title}</h3>
          <p className="muted"><Clock size={15} aria-hidden="true" /> À terminer avant le {formatDue(next.dueAt)} · environ {next.estimatedMinutes} min</p>
          <ul className="pilot-list">
            {next.activities.map((activity) => (
              <li key={activity.id}><span>{activity.title}</span>
                <span className="muted">{activity.status === 'completed' ? 'Terminée' : `${activity.estimatedMinutes} min`}</span></li>
            ))}
          </ul>
          <div><Badge tone={sessionStatus[next.status].tone}>{sessionStatus[next.status].label}</Badge></div>
          <SessionLink session={next} />
        </article>
      ) : <EmptyState title="Toutes vos séances sont terminées" description="Les prochaines séances apparaîtront ici dès qu’elles seront planifiées." />}
      <h3>Aujourd’hui</h3>
      {today.length === 0 ? <p className="muted">Aucune séance n’arrive à échéance aujourd’hui.</p> : (
        <ul className="pilot-list">
          {today.map((session) => (
            <li key={session.id}><span>{session.title}</span><Badge tone={sessionStatus[session.status].tone}>{sessionStatus[session.status].label}</Badge></li>
          ))}
        </ul>
      )}
      <h3>Mon parcours</h3>
      <ul className="pilot-list">
        {enrollment.sessions.map((session) => (
          <li key={session.id}>
            <span>Séance {session.position} · {session.title}</span>
            <Link className="text-link" to={`/espace/seance/${session.id}`}>{sessionStatus[session.status].label}</Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

interface LearnerData { enrollment: Enrollment | null; goal: Goal | null; levels: Level[]; results: Grade[]; messages: Message[] }

function LearnerHome({ token }: { token: string }) {
  const [data, setData] = useState<LearnerData | null>(null);
  const [failure, setFailure] = useState('');
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let active = true;
    Promise.all([
      requestApi<Enrollment | null>('/learning/enrollment', token),
      requestApi<Goal | null>('/learning/goal', token), requestApi<Level[]>('/levels', token),
      requestApi<Grade[]>('/assessments/results', token), requestApi<Message[]>('/tracking/messages', token),
    ]).then(([enrollment, goal, levels, results, messages]) => {
      if (active) setData({ enrollment, goal, levels, results, messages });
    }).catch((error: unknown) => { if (active) setFailure(errorText(error)); });
    return () => { active = false; };
  }, [token, retry]);

  if (!data) return <section className="panel stack">{failure
    ? <><p className="inline-message warning" role="alert">{failure}</p><button className="btn btn-outline" type="button" onClick={() => { setFailure(''); setRetry((value) => value + 1); }}>Réessayer</button></>
    : <p role="status">Chargement de votre parcours…</p>}</section>;

  return (
    <div className="pilot-grid">
      <NextSessions enrollment={data.enrollment} />
      <div className="stack">
        <GoalEditor goal={data.goal} levels={data.levels} token={token}
          saved={(goal) => setData((current) => current && ({ ...current, goal }))} />
        <section className="panel stack" aria-labelledby="pilot-results">
          <div className="panel-heading"><h2 id="pilot-results">Mes résultats</h2><ChartNoAxesCombined aria-hidden="true" /></div>
          {data.results.length === 0 ? <EmptyState title="Aucun résultat enregistré" description="Terminez un exercice pour retrouver votre score ici." />
            : <ul className="pilot-list">{data.results.map((item) => <li key={item.id}><time dateTime={item.submittedAt}>{dateDisplay.format(new Date(item.submittedAt))}</time><strong>{item.correct} / {item.total}</strong></li>)}</ul>}
        </section>
        <section className="panel stack" aria-labelledby="pilot-messages">
          <div className="panel-heading"><h2 id="pilot-messages">Mes messages</h2><MessageSquare aria-hidden="true" /></div>
          {data.messages.length === 0 ? <EmptyState title="Aucun message pour le moment" />
            : <ul className="pilot-list">{data.messages.map((message) => <li key={message.id}><p>{message.text}</p><time dateTime={message.sentAt}>{dateDisplay.format(new Date(message.sentAt))}</time></li>)}</ul>}
        </section>
      </div>
    </div>
  );
}

export function LearnerPilot({ token }: { token: string }) {
  return (
    <Routes>
      <Route index element={<LearnerHome token={token} />} />
      <Route path="seance/:sessionId" element={<SessionPage token={token} />} />
    </Routes>
  );
}
