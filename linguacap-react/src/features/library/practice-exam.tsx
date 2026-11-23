/**
 * Entraînement libre au bilan intermédiaire (/espace/bibliotheque/entrainement/:attemptId) : parties fermées notées,
 * écrit et oral en auto-entraînement, sauvegarde automatique, remise et score par partie et par compétence, sans corrigé.
 * Aucun lien avec le contrat ni avec la correction par un professeur.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  AlertTriangle, ArrowLeft, BookOpen, Check, CheckCircle2, ClipboardCheck, CloudCheck, Dumbbell, EyeOff, Headphones, Hourglass,
  LoaderCircle, Mic, PenLine, RotateCcw, Send, Target,
} from 'lucide-react';
import { Badge, Dialog } from '../../components/ui';
import { AudioPlayer, Callout, Facts, ProgressRing, SkeletonCard, useToast } from '../../design/kit';
import { requestApi } from '../../integration/api';
import { competenceLabels, examKindLabels, type PracticePart, type PracticeView } from '../../integration/v2';
import { LessonContent } from '../pilot/LessonContent';
import { QuestionCard } from '../pilot/study-question';
import { errorText, momentText } from '../onboarding/onboarding-kit';
import './library.css';

type SaveStatus = 'idle' | 'pending' | 'saving' | 'saved' | 'error';
const partIcons: Record<string, typeof BookOpen> = { lecture: BookOpen, ecoute: Headphones, 'expression-ecrite': PenLine, 'expression-orale': Mic };

function SaveState({ status }: { status: SaveStatus }) {
  const busy = status === 'pending' || status === 'saving';
  const Icon = busy ? LoaderCircle : status === 'error' ? AlertTriangle : CloudCheck;
  const text = busy ? 'Enregistrement…' : status === 'error' ? 'Échec de l’enregistrement' : status === 'saved' ? 'Réponses enregistrées' : 'Enregistrement automatique';
  return <span className={`px-save is-${status}`}><Icon size={15} className={busy ? 'ld-spin' : undefined} aria-hidden="true" />{text}</span>;
}

function PartMedia({ part, exam }: { part: PracticePart; exam: PracticeView }) {
  if (!part.placements.length) return null;
  return (
    <div className="px-media">
      {[...part.placements].sort((a, b) => a.position - b.position).map((placement) => {
        const url = exam.media[`${placement.assetId}@${placement.assetVersion}`];
        if (!url) return <p key={placement.position} className="px-media-missing"><AlertTriangle size={15} aria-hidden="true" /> Support indisponible pour le moment.</p>;
        return placement.usage === 'audio'
          ? <AudioPlayer key={placement.position} src={url} title={placement.caption ?? 'Document sonore'} />
          : <figure key={placement.position} className="px-figure"><img src={url} alt={placement.alt ?? ''} />{placement.caption && <figcaption>{placement.caption}</figcaption>}</figure>;
      })}
    </div>
  );
}

const closedParts = (exam: PracticeView) => exam.definition.parts.filter((part) => part.mode === 'closed' && !part.selfPractice);

export function PracticeExamPage({ token }: { token: string }) {
  const { attemptId = '' } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [exam, setExam] = useState<PracticeView | null>(null);
  const [loadError, setLoadError] = useState('');
  const [error, setError] = useState('');
  const [save, setSave] = useState<SaveStatus>('idle');
  const [busy, setBusy] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [missing, setMissing] = useState<string[]>([]);
  const [reload, setReload] = useState(0);
  const timer = useRef<number | undefined>(undefined);
  const submitKey = useRef<string | null>(null);
  const id = encodeURIComponent(attemptId);

  useEffect(() => {
    let active = true;
    setLoadError('');
    requestApi<PracticeView>(`/assessments/practice/${id}`, token)
      .then((view) => { if (active) setExam(view); })
      .catch((failure: unknown) => { if (active) setLoadError(errorText(failure)); });
    return () => { active = false; };
  }, [id, token, reload]);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const persist = useCallback((answers: PracticeView['answers']) => {
    window.clearTimeout(timer.current);
    setSave('pending');
    timer.current = window.setTimeout(() => {
      setSave('saving');
      requestApi<PracticeView>(`/assessments/practice/${id}/answers`, token, { method: 'PUT', body: { answers } })
        .then(() => { setSave('saved'); setError(''); })
        .catch((failure: unknown) => { setSave('error'); setError(errorText(failure)); });
    }, 500);
  }, [id, token]);

  const questions = useMemo(() => (exam ? closedParts(exam).flatMap((part) => part.questions.map((question) => ({ part, question }))) : []), [exam]);
  const answered = exam ? questions.filter(({ part, question }) => exam.answers[part.id]?.[question.id]).length : 0;

  function answer(part: PracticePart, questionId: string, optionId: string) {
    if (!exam) return;
    submitKey.current = null;
    const answers = { ...exam.answers, [part.id]: { ...exam.answers[part.id], [questionId]: optionId } };
    setExam({ ...exam, answers });
    setMissing((list) => list.filter((item) => item !== `${part.id}/${questionId}`));
    persist(answers);
  }

  async function submit() {
    if (!exam || busy) return;
    setConfirming(false);
    setBusy(true);
    setError('');
    window.clearTimeout(timer.current);
    submitKey.current ??= crypto.randomUUID();
    try {
      await requestApi(`/assessments/practice/${id}/answers`, token, { method: 'PUT', body: { answers: exam.answers } });
      setExam(await requestApi<PracticeView>(`/assessments/practice/${id}/submit`, token, { method: 'POST', body: {}, idempotencyKey: submitKey.current }));
      submitKey.current = null;
      toast('Entraînement remis : voici votre score.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (failure) {
      setError(errorText(failure));
    } finally {
      setBusy(false);
    }
  }

  async function again() {
    if (!exam) return;
    setBusy(true);
    setError('');
    try {
      const view = await requestApi<PracticeView>('/assessments/practice', token, { method: 'POST', body: { trackVersionId: exam.trackVersionId, kind: 'midterm' } });
      navigate(`/espace/bibliotheque/entrainement/${encodeURIComponent(view.id)}`);
      setExam(view);
    } catch (failure) {
      setError(errorText(failure));
    } finally {
      setBusy(false);
    }
  }

  function askSubmit() {
    if (!exam) return;
    const left = questions.filter(({ part, question }) => !exam.answers[part.id]?.[question.id]).map(({ part, question }) => `${part.id}/${question.id}`);
    setMissing(left);
    setConfirming(true);
  }

  const back = <Link className="text-link px-back" to={`/espace/bibliotheque${exam ? `?niveau=${exam.levelCode}` : ''}`}><ArrowLeft size={16} aria-hidden="true" /> Bibliothèque</Link>;

  if (!exam) {
    return (
      <div className="px-page lc-enter">
        {back}
        {loadError ? (
          <div role="alert" className="px-load-error">
            <Callout tone="warning" title="L’entraînement n’a pas pu être chargé">{loadError}</Callout>
            <button type="button" className="btn btn-outline" onClick={() => setReload((value) => value + 1)}><RotateCcw size={16} aria-hidden="true" /> Réessayer</button>
          </div>
        ) : <><SkeletonCard lines={3} label="Chargement de l’entraînement…" /><SkeletonCard lines={6} /></>}
      </div>
    );
  }

  const parts = exam.definition.parts;
  const result = exam.result;
  const nextOpen = !exam.nextAttemptAt || new Date(exam.nextAttemptAt).getTime() <= Date.now();
  const errorBox = error && <div role="alert"><Callout tone="warning" title="Une action n’a pas abouti">{error}</Callout></div>;

  return (
    <div className="px-page lc-enter">
      {back}
      <header className="px-hero">
        <span className="px-hero-icon" aria-hidden="true"><Dumbbell size={26} /></span>
        <div className="px-hero-text">
          <p className="eyebrow">Entraînement · {examKindLabels[exam.kind]} · niveau {exam.levelCode}</p>
          <h1 id="practice-title">{exam.definition.title}</h1>
          {exam.definition.description && <p className="px-hero-desc">{exam.definition.description}</p>}
          <div className="px-hero-badges">
            <Badge tone={exam.status === 'submitted' ? 'green' : 'blue'}>{exam.status === 'submitted' ? 'Remis' : 'En cours'}</Badge>
            <Badge tone="violet"><EyeOff size={12} aria-hidden="true" /> Sans corrigé détaillé</Badge>
            <Badge tone="neutral">Ne compte pas pour votre parcours</Badge>
          </div>
        </div>
        <div className="px-hero-facts">
          <Facts items={[
            { label: 'Parties', value: parts.length },
            { label: 'Questions notées', value: questions.length },
            { label: 'Seuil de réussite', value: `${exam.definition.passPercent} %` },
            exam.submittedAt ? { label: 'Remis', value: momentText(exam.submittedAt) } : { label: 'Commencé', value: momentText(exam.startedAt) },
          ]} />
        </div>
      </header>

      {result ? (
        <div className="px-result">
          {errorBox}
          <section className={`px-score ${result.passed ? 'is-passed' : 'is-low'}`} aria-labelledby="px-score-title">
            <ProgressRing value={result.percent} size={148} stroke={12} color={result.passed ? 'var(--success)' : 'var(--warning)'} label={`Score : ${result.percent} %`}>
              <span className="px-score-ring"><strong>{result.percent}<small>%</small></strong><small>score</small></span>
            </ProgressRing>
            <div className="px-score-text">
              <h2 id="px-score-title">{result.passed ? 'Seuil atteint, bravo !' : 'Encore un peu d’entraînement'}</h2>
              <p>{result.passed
                ? `Vous dépassez le seuil de ${exam.definition.passPercent} % sur les parties notées. Le bilan de votre parcours devrait bien se passer.`
                : `Le seuil est de ${exam.definition.passPercent} %. Revoyez les modules concernés dans la bibliothèque, puis réessayez.`}</p>
              <div className="px-score-actions">
                {nextOpen
                  ? <button type="button" className="btn btn-primary" disabled={busy} onClick={() => void again()}>
                      {busy ? <LoaderCircle size={17} className="ld-spin" aria-hidden="true" /> : <RotateCcw size={17} aria-hidden="true" />} Nouvel entraînement</button>
                  : <p className="px-next"><Hourglass size={15} aria-hidden="true" /> Nouvel essai possible le {momentText(exam.nextAttemptAt)}.</p>}
                <Link className="btn btn-outline" to={`/espace/bibliotheque?niveau=${exam.levelCode}`}>Revoir les cours</Link>
              </div>
            </div>
          </section>
          <div className="px-result-grid">
            <section className="kit-card" aria-labelledby="px-parts-title">
              <h2 id="px-parts-title" className="px-card-title">Par partie</h2>
              <ul className="px-bars">
                {parts.map((part) => {
                  const score = result.parts[part.id];
                  const Icon = partIcons[part.competence] ?? BookOpen;
                  const percent = score && score.total ? Math.round((score.correct / score.total) * 100) : 0;
                  return (
                    <li key={part.id}>
                      <span className="px-bar-name"><Icon size={15} aria-hidden="true" /> {part.title}</span>
                      {score ? <>
                        <span className="px-bar" aria-hidden="true"><span className={percent >= exam.definition.passPercent ? 'is-ok' : 'is-low'} style={{ width: `${Math.max(3, percent)}%` }} /></span>
                        <b>{score.correct}/{score.total}</b>
                      </> : <small className="px-bar-self">Auto-entraînement</small>}
                    </li>
                  );
                })}
              </ul>
            </section>
            <section className="kit-card" aria-labelledby="px-skills-title">
              <h2 id="px-skills-title" className="px-card-title">Par compétence</h2>
              <ul className="px-bars">
                {Object.entries(result.competences).map(([name, score]) => (
                  <li key={name}>
                    <span className="px-bar-name">{competenceLabels[name] ?? name}</span>
                    <span className="px-bar" aria-hidden="true"><span className={score.percent >= exam.definition.passPercent ? 'is-ok' : 'is-low'} style={{ width: `${Math.max(3, score.percent)}%` }} /></span>
                    <b>{score.percent} %</b>
                  </li>
                ))}
              </ul>
            </section>
          </div>
          <Callout tone="info" title="Pourquoi les réponses ne sont-elles pas affichées ?">
            Le même bilan vous attend dans votre parcours : sans corrigé, l’entraînement reste un vrai test de ce que vous savez. Vos scores par partie indiquent quoi revoir.
          </Callout>
        </div>
      ) : (
        <div className="px-sheet">
          <nav className="px-parts" aria-label="Parties de l’entraînement">
            <ol>
              {parts.map((part, index) => {
                const Icon = partIcons[part.competence] ?? BookOpen;
                const graded = part.mode === 'closed' && !part.selfPractice;
                const done = part.questions.filter((question) => exam.answers[part.id]?.[question.id]).length;
                const complete = graded && done === part.questions.length;
                return (
                  <li key={part.id}>
                    <button type="button" className={`px-part-pill${complete ? ' is-complete' : ''}${graded ? '' : ' is-self'}`}
                      onClick={() => document.getElementById(`px-section-${part.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>
                      <span className={`px-pill-icon is-${part.competence}`} aria-hidden="true">{complete ? <Check size={13} strokeWidth={3} /> : <Icon size={14} />}</span>
                      <span className="px-pill-text"><small>Partie {index + 1}</small>{competenceLabels[part.competence] ?? part.competence}</span>
                      <span className="px-pill-count">{graded ? `${done}/${part.questions.length}` : 'Libre'}</span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </nav>
          {parts.map((part, index) => {
            const Icon = partIcons[part.competence] ?? BookOpen;
            const done = part.questions.filter((question) => exam.answers[part.id]?.[question.id]).length;
            const graded = part.mode === 'closed' && !part.selfPractice;
            return (
              <section key={part.id} id={`px-section-${part.id}`} className="px-part" aria-labelledby={`px-part-${part.id}`}>
                <header className="px-part-head">
                  <span className={`px-part-icon is-${part.competence}`} aria-hidden="true"><Icon size={20} /></span>
                  <div><p className="px-part-kicker">Partie {index + 1} sur {parts.length} · {competenceLabels[part.competence] ?? part.competence}</p><h2 id={`px-part-${part.id}`}>{part.title}</h2></div>
                  {graded
                    ? <Badge tone={done === part.questions.length ? 'green' : 'neutral'}>{done === part.questions.length ? <><Check size={13} strokeWidth={3} aria-hidden="true" /> Complète</> : `${done}/${part.questions.length}`}</Badge>
                    : <Badge tone="violet">Auto-entraînement</Badge>}
                </header>
                {part.instructions && <div className="px-instructions"><LessonContent text={part.instructions} compact /></div>}
                <PartMedia part={part} exam={exam} />
                {graded ? (
                  <div className="px-questions">
                    {part.questions.map((question, position) => (
                      <QuestionCard key={question.id} index={position} prompt={question.prompt} name={`${part.id}-${question.id}`}
                        options={question.options.map((option) => ({ id: option.id, text: option.label }))}
                        value={exam.answers[part.id]?.[question.id]} missing={missing.includes(`${part.id}/${question.id}`)}
                        onChoose={(optionId) => answer(part, question.id, optionId)} />
                    ))}
                  </div>
                ) : (
                  <Callout tone="tip" title={part.mode === 'oral' ? 'À vous de parler' : part.mode === 'written' ? 'À vous d’écrire' : 'À travailler seul'}>
                    Cette partie n’est pas corrigée pendant l’entraînement. {part.mode === 'oral'
                      ? 'Entraînez-vous à voix haute, en vous chronométrant, puis réécoutez les modèles des leçons.'
                      : 'Rédigez votre texte sur papier ou dans un brouillon, puis relisez-le avec les leçons du module.'}
                    {part.criteria.length > 0 && <> Critères : {part.criteria.map((criterion) => criterion.label).join(', ')}.</>}
                  </Callout>
                )}
              </section>
            );
          })}
          <div className="px-actionbar">
            {errorBox}
            <div className="px-actionbar-row">
              <div className="px-actionbar-info">
                <ProgressRing value={questions.length ? (answered / questions.length) * 100 : 0} size={44} stroke={5} label={`${answered} réponses sur ${questions.length}`}>
                  <small className="lib-ring-mini">{answered}</small>
                </ProgressRing>
                <span><strong>{answered}/{questions.length} réponses</strong><SaveState status={save} /></span>
              </div>
              <button type="button" className="btn btn-primary btn-lg" disabled={busy} onClick={askSubmit}>
                {busy ? <LoaderCircle size={18} className="ld-spin" aria-hidden="true" /> : <Send size={18} aria-hidden="true" />} {busy ? 'Remise…' : 'Remettre mon entraînement'}
              </button>
            </div>
          </div>
        </div>
      )}

      {confirming && exam.status === 'in_progress' && (
        <Dialog title="Remettre votre entraînement ?" onClose={() => setConfirming(false)}>
          <div className="px-confirm">
            {missing.length
              ? <Callout tone="warning" title={`${missing.length} question${missing.length > 1 ? 's' : ''} sans réponse`}>Une question sans réponse compte comme une erreur.</Callout>
              : <Callout tone="success" title="Toutes les questions ont une réponse">Votre score s’affichera tout de suite.</Callout>}
            <p className="muted"><Target size={14} aria-hidden="true" /> Après la remise, un nouvel essai sera possible au bout de 12 heures.</p>
            <div className="px-confirm-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setConfirming(false)}><ClipboardCheck size={16} aria-hidden="true" /> Continuer</button>
              <button type="button" className="btn btn-primary" onClick={() => void submit()} disabled={busy}><Send size={16} aria-hidden="true" /> Remettre</button>
            </div>
          </div>
        </Dialog>
      )}
      {exam.status === 'submitted' && !result && <Callout tone="success" title="Entraînement remis"><CheckCircle2 size={14} aria-hidden="true" /> Le score sera bientôt disponible.</Callout>}
    </div>
  );
}
