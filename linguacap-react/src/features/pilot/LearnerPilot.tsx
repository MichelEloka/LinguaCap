import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, Route, Routes, useNavigate } from 'react-router-dom';
import { CalendarCheck2, ChartNoAxesCombined, ClipboardList, Clock, MessageSquare, PlayCircle } from 'lucide-react';
import { Badge, EmptyState } from '../../components/ui';
import { requestApi } from '../../integration/api';
import { formatDue, SessionPage, sessionStatus, type Enrollment, type Grade, type SessionSummary } from './LearnerSession';
import { GoalPanel, type PlannedEnrollment } from './GoalPanel';
import './pilot.css';

interface Message { id: string; text: string; sentAt: string }

const dateDisplay = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' });

function errorText(error: unknown) {
  return error instanceof Error && error.name !== 'TimeoutError'
    ? error.message : 'Le service est momentanément indisponible. Réessayez.';
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
  const late = enrollment.sessions.filter((session) => session.status === 'late');
  return (
    <section className="panel stack" aria-labelledby="pilot-next">
      <div className="panel-heading">
        <h2 id="pilot-next">Ma prochaine séance</h2>
        <Badge tone="blue">Allemand {enrollment.levelCode}</Badge>
      </div>
      {enrollment.sessions.length === 0 ? (
        <p className="muted">Vos séances apparaîtront ici dès que votre planning sera validé.</p>
      ) : next ? (
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
      {late.length > 0 && (
        <>
          <h3>À rattraper</h3>
          <ul className="pilot-list">
            {late.map((session) => (
              <li key={session.id}><span>{session.title} · échéance dépassée le {formatDue(session.dueAt)}</span>
                <Link className="text-link" to={`/espace/seance/${session.id}`}>Rattraper</Link></li>
            ))}
          </ul>
        </>
      )}
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

interface LearnerData { enrollment: PlannedEnrollment | null; results: Grade[]; messages: Message[] }

function LearnerHome({ token }: { token: string }) {
  const [data, setData] = useState<LearnerData | null>(null);
  const [failure, setFailure] = useState('');
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let active = true;
    Promise.all([
      requestApi<PlannedEnrollment | null>('/learning/enrollment', token),
      requestApi<Grade[]>('/assessments/results', token), requestApi<Message[]>('/tracking/messages', token),
    ]).then(([enrollment, results, messages]) => {
      if (active) setData({ enrollment, results, messages });
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
        {data.enrollment && <GoalPanel enrollment={data.enrollment} token={token} viewer="learner" onChanged={() => setRetry((value) => value + 1)} />}
        <section className="panel stack" aria-labelledby="pilot-results">
          <div className="panel-heading"><h2 id="pilot-results">Mes résultats</h2><ChartNoAxesCombined aria-hidden="true" /></div>
          {data.results.length === 0 ? <EmptyState title="Aucun résultat enregistré" description="Terminez un exercice pour retrouver votre score ici." />
            : <ul className="pilot-list">{data.results.filter((item) => item.kind !== 'diagnostic').map((item) => <li key={item.id}><time dateTime={item.submittedAt}>{dateDisplay.format(new Date(item.submittedAt))}</time><strong>{item.correct} / {item.total}</strong></li>)}</ul>}
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

interface DiagnosticContent { lessonId: string; title: string; description: string; questions: { id: string; prompt: string; options: { id: string; text: string }[] }[] }

/** Diagnostic initial : les réponses sont corrigées par module puis transmises au parcours (DEV-036). */
function DiagnosticPage({ token }: { token: string }) {
  const navigate = useNavigate();
  const [enrollmentId, setEnrollmentId] = useState<string | null>(null);
  const [content, setContent] = useState<DiagnosticContent | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const key = useRef<string | null>(null);

  useEffect(() => {
    let active = true;
    requestApi<Enrollment | null>('/learning/enrollment', token).then(async (enrollment) => {
      if (!enrollment) throw new Error('Aucun parcours ne vous est encore attribué.');
      const diagnostic = await requestApi<DiagnosticContent>(`/learning/enrollments/${encodeURIComponent(enrollment.id)}/diagnostic`, token);
      if (!active) return;
      setEnrollmentId(enrollment.id);
      setContent(diagnostic);
    }).catch((failure: unknown) => { if (active) setError(errorText(failure)); });
    return () => { active = false; };
  }, [token]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!content || !enrollmentId || busy) return;
    setBusy(true);
    setError('');
    key.current ??= crypto.randomUUID();
    try {
      const grade = await requestApi<Grade>('/assessments/diagnostics', token, {
        method: 'POST', body: { lessonId: content.lessonId, answers }, idempotencyKey: key.current,
      });
      await requestApi(`/learning/enrollments/${encodeURIComponent(enrollmentId)}/diagnostic`, token, {
        method: 'POST', body: { attemptId: grade.id },
      });
      navigate('/espace', { replace: true });
    } catch (failure) {
      setError(errorText(failure));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="panel stack" aria-labelledby="pilot-diagnostic">
      <Link className="text-link" to="/espace">Retour à mon espace</Link>
      <div className="panel-heading"><h2 id="pilot-diagnostic"><ClipboardList size={20} aria-hidden="true" /> {content?.title ?? 'Diagnostic'}</h2></div>
      {!content ? (error ? <p className="inline-message warning" role="alert">{error}</p> : <p role="status">Chargement du diagnostic…</p>) : (
        <form className="stack" onSubmit={submit}>
          <p>{content.description}</p>
          {content.questions.map((question) => (
            <fieldset className="pilot-options" key={question.id}>
              <legend>{question.prompt}</legend>
              {question.options.map((option) => (
                <label key={option.id}><input type="radio" name={question.id} required value={option.id}
                  checked={answers[question.id] === option.id}
                  onChange={() => { key.current = null; setAnswers((current) => ({ ...current, [question.id]: option.id })); }} /> {option.text}</label>
              ))}
            </fieldset>
          ))}
          {error && <p className="inline-message warning" role="alert">{error}</p>}
          <button className="btn btn-primary" type="submit" disabled={busy}>{busy ? 'Envoi…' : 'Envoyer mes réponses'}</button>
        </form>
      )}
    </section>
  );
}

export function LearnerPilot({ token }: { token: string }) {
  return (
    <Routes>
      <Route index element={<LearnerHome token={token} />} />
      <Route path="seance/:sessionId" element={<SessionPage token={token} />} />
      <Route path="diagnostic" element={<DiagnosticPage token={token} />} />
    </Routes>
  );
}
