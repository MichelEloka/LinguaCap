/**
 * Diagnostic initial en mode étude : présentation, une question à la fois avec sa progression, puis résultat.
 * Les réponses sont corrigées par module puis transmises au parcours (DEV-036). Un débutant n'en a pas (EVO-038) :
 * l'accès direct à la page le lui dit, sans rien proposer.
 */
import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Compass, Send, Sprout } from 'lucide-react';
import { EmptyState } from '../../components/ui';
import { Facts, ProgressRing, SkeletonCard, Steps } from '../../design/kit';
import { requestApi } from '../../integration/api';
import { LessonContent } from './LessonContent';
import { diagnosticOffered, type PlannedEnrollment } from './GoalPanel';
import type { Grade } from './LearnerSession';
import { QuestionCard } from './study-question';
import './learner-session.css';

function errorText(error: unknown) {
  return error instanceof Error && error.name !== 'TimeoutError'
    ? error.message : 'Le service est momentanément indisponible. Réessayez.';
}

interface DiagnosticContent { lessonId: string; title: string; description: string; questions: { id: string; prompt: string; options: { id: string; text: string }[] }[] }
/** Parcours renvoyé après l'enregistrement du diagnostic : seuls les champs utiles au résultat sont lus. */
interface DiagnosticOutcome { goal?: { diagnosticModules?: string[] | null; accompanied?: boolean } | null }

function DiagnosticResult({ grade, outcome, onDone }: { grade: Grade; outcome: DiagnosticOutcome | null; onDone: () => void }) {
  const percent = grade.total ? Math.round((grade.correct / grade.total) * 100) : 0;
  const modules = outcome?.goal?.diagnosticModules?.length ?? 0;
  const accompanied = outcome?.goal?.accompanied;
  return (
    <section className="study-diag-card study-diag-done lc-enter" aria-labelledby="study-diag-done-title">
      <ProgressRing value={percent} size={124} stroke={10} label={`${grade.correct} bonnes réponses sur ${grade.total}`}>
        <strong className="study-result-score">{grade.correct}<small>/{grade.total}</small></strong>
      </ProgressRing>
      <div role="status"><h2 id="study-diag-done-title">Test terminé, merci !</h2></div>
      <p className="study-diag-lead">
        Vous avez trouvé {grade.correct} bonne{grade.correct > 1 ? 's' : ''} réponse{grade.correct > 1 ? 's' : ''} sur {grade.total}.
        Ce n’est pas une note : ce résultat sert à situer votre point de départ.
      </p>
      <Facts items={[
        { label: 'Notions déjà maîtrisées', value: modules ? `${modules} module${modules > 1 ? 's' : ''} repéré${modules > 1 ? 's' : ''}` : 'Départ au début du parcours' },
        { label: 'Et maintenant ?', value: accompanied === true ? 'Votre professeur confirme votre point de départ.'
          : accompanied === false ? 'Votre parcours est déjà adapté.' : 'Votre parcours tient compte de vos réponses.' },
      ]} />
      <button className="btn btn-primary btn-lg" type="button" onClick={onDone}>Voir mon parcours <ArrowRight size={18} aria-hidden="true" /></button>
    </section>
  );
}

export function DiagnosticPage({ token }: { token: string }) {
  const navigate = useNavigate();
  const [enrollmentId, setEnrollmentId] = useState<string | null>(null);
  const [content, setContent] = useState<DiagnosticContent | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState<'intro' | 'quiz' | 'done'>('intro');
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');
  const [result, setResult] = useState<{ grade: Grade; outcome: DiagnosticOutcome | null } | null>(null);
  /** Pas de diagnostic : débutant (départ A0) ou parcours sans diagnostic initial. */
  const [skipped, setSkipped] = useState<'beginner' | 'adapted' | null>(null);
  const key = useRef<string | null>(null);
  const advance = useRef<number | undefined>(undefined);

  useEffect(() => {
    let active = true;
    requestApi<PlannedEnrollment | null>('/learning/enrollment', token).then(async (enrollment) => {
      if (!enrollment) throw new Error('Aucun parcours ne vous est encore attribué.');
      if (!diagnosticOffered(enrollment.goal)) {
        if (active) setSkipped(enrollment.goal.startLevel === 'A0' ? 'beginner' : 'adapted');
        return;
      }
      const diagnostic = await requestApi<DiagnosticContent>(`/learning/enrollments/${encodeURIComponent(enrollment.id)}/diagnostic`, token);
      if (!active) return;
      setEnrollmentId(enrollment.id);
      setContent(diagnostic);
    }).catch((failure: unknown) => { if (active) setError(errorText(failure)); });
    return () => { active = false; };
  }, [token]);

  useEffect(() => () => window.clearTimeout(advance.current), []);

  const questions = content?.questions ?? [];
  const question = questions[index];
  const answered = questions.filter((item) => answers[item.id]).length;

  function move(target: number) {
    window.clearTimeout(advance.current);
    setDirection(target < index ? 'prev' : 'next');
    setIndex(target);
  }

  function choose(questionId: string, optionId: string, viaPointer: boolean) {
    key.current = null;
    setAnswers((current) => ({ ...current, [questionId]: optionId }));
    // Au toucher, la question suivante arrive seule ; au clavier, l'élève avance avec « Suivant ».
    window.clearTimeout(advance.current);
    if (viaPointer && index < questions.length - 1) {
      const from = index;
      advance.current = window.setTimeout(() => { setDirection('next'); setIndex((value) => value === from ? from + 1 : value); }, 450);
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!content || !enrollmentId || busy) return;
    const left = questions.findIndex((item) => !answers[item.id]);
    if (left >= 0) { move(left); return; }
    setBusy(true);
    setError('');
    key.current ??= crypto.randomUUID();
    try {
      const grade = await requestApi<Grade>('/assessments/diagnostics', token, {
        method: 'POST', body: { lessonId: content.lessonId, answers }, idempotencyKey: key.current,
      });
      const outcome = await requestApi<DiagnosticOutcome>(`/learning/enrollments/${encodeURIComponent(enrollmentId)}/diagnostic`, token, {
        method: 'POST', body: { attemptId: grade.id },
      });
      setResult({ grade, outcome });
      setStep('done');
    } catch (failure) {
      setError(errorText(failure));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="study-diag lc-enter">
      <Link className="study-back" to="/espace"><ArrowLeft size={16} aria-hidden="true" /> Retour à mon espace</Link>
      <header className="study-diag-head">
        <span className="study-kind is-diagnostic" aria-hidden="true"><Compass size={24} /></span>
        <div>
          <p className="eyebrow">Diagnostic</p>
          <h1 id="pilot-diagnostic">{content?.title ?? 'Diagnostic'}</h1>
        </div>
      </header>

      {skipped ? (
        <section className="study-diag-card" aria-label="Diagnostic initial">
          <EmptyState icon={<Sprout size={26} />}
            title={skipped === 'beginner' ? 'Pas de diagnostic pour vous' : 'Pas de diagnostic à passer'}
            description={skipped === 'beginner'
              ? 'Vous débutez : votre parcours commence par les toutes premières bases. Il est déjà adapté, sans question supplémentaire.'
              : 'Votre parcours est déjà adapté à votre point de départ.'}
            action={<Link className="btn btn-primary" to="/espace">Retour à mon espace</Link>} />
        </section>
      ) : !content ? (
        error
          ? <section className="study-diag-card"><EmptyState title="Diagnostic indisponible" description={error} icon={<Compass size={26} />}
              action={<Link className="btn btn-outline" to="/espace">Retour à mon espace</Link>} /><p className="sr-only" role="alert">{error}</p></section>
          : <SkeletonCard lines={5} label="Chargement du diagnostic…" />
      ) : step === 'done' && result ? (
        <DiagnosticResult grade={result.grade} outcome={result.outcome} onDone={() => navigate('/espace', { replace: true })} />
      ) : step === 'intro' ? (
        <section className="study-diag-card study-diag-intro" aria-label="Présentation du test">
          <LessonContent text={content.description} />
          <Facts items={[
            { label: 'Questions', value: questions.length },
            { label: 'Format', value: 'Une réponse par question' },
            { label: 'À quoi ça sert', value: 'Adapter votre parcours' },
          ]} />
          <button className="btn btn-primary btn-lg" type="button" onClick={() => { setStep('quiz'); move(0); }} disabled={!questions.length}>
            Commencer le test <ArrowRight size={18} aria-hidden="true" />
          </button>
        </section>
      ) : question && (
        <form className="study-diag-card study-diag-quiz" onSubmit={submit} noValidate>
          <div className="study-diag-progress">
            <p><strong>Question {index + 1}</strong> sur {questions.length}</p>
            <span>{answered} réponse{answered > 1 ? 's' : ''}</span>
          </div>
          <Steps total={questions.length} current={index} done={index} label="Avancement du test" />
          <div className={`study-pane is-${direction}`} key={question.id}>
            <QuestionCard index={index} prompt={question.prompt} name={question.id} options={question.options} value={answers[question.id]}
              onChoose={(optionId, viaPointer) => choose(question.id, optionId, viaPointer)} />
          </div>
          {error && <p className="inline-message warning" role="alert">{error}</p>}
          <div className="study-pager">
            <button className="btn btn-ghost" type="button" disabled={index === 0} onClick={() => move(index - 1)}>
              <ArrowLeft size={18} aria-hidden="true" /> Précédent
            </button>
            <span className="study-pager-count" aria-hidden="true">{index + 1} / {questions.length}</span>
            {index < questions.length - 1 ? (
              <button className="btn btn-primary" type="button" disabled={!answers[question.id]} onClick={() => move(index + 1)}>
                Suivant <ArrowRight size={18} aria-hidden="true" />
              </button>
            ) : (
              <button className="btn btn-primary" type="submit" disabled={busy || answered < questions.length}>
                {busy ? 'Envoi…' : <>Envoyer mes réponses <Send size={17} aria-hidden="true" /></>}
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
