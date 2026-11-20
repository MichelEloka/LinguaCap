import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { ExamPage } from './Exams';
import { ClipboardList } from 'lucide-react';
import { requestApi } from '../../integration/api';
import { SessionPage, type Enrollment, type Grade } from './LearnerSession';
import { LearnerDashboard } from './LearnerDashboard';
import './pilot.css';

function errorText(error: unknown) {
  return error instanceof Error && error.name !== 'TimeoutError'
    ? error.message : 'Le service est momentanément indisponible. Réessayez.';
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

export function LearnerPilot({ token, name }: { token: string; name: string }) {
  return (
    <Routes>
      <Route index element={<LearnerDashboard token={token} name={name} view="home" />} />
      <Route path="planning" element={<LearnerDashboard token={token} name={name} view="planning" />} />
      <Route path="resultats" element={<LearnerDashboard token={token} name={name} view="results" />} />
      <Route path="messages" element={<LearnerDashboard token={token} name={name} view="messages" />} />
      <Route path="seance/:sessionId" element={<SessionPage token={token} />} />
      <Route path="diagnostic" element={<DiagnosticPage token={token} />} />
      <Route path="evaluation/:enrollmentId/:kind" element={<ExamPage token={token} />} />
      <Route path="*" element={<Navigate to="/espace" replace />} />
    </Routes>
  );
}
