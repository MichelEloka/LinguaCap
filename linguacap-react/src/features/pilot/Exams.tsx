import { useCallback, useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { Link, Route, Routes, useParams } from 'react-router-dom';
import {
  AlertTriangle, ArrowLeft, Check, CheckCircle2, CircleAlert, ClipboardCheck, CloudCheck, Flag, Headphones, Hourglass,
  LoaderCircle, PenLine, Send, Target,
} from 'lucide-react';
import { Badge, Dialog } from '../../components/ui';
import { AudioPlayer, Callout, Card, Facts, ProgressRing, SkeletonCard, Timeline, useToast } from '../../design/kit';
import { requestApi } from '../../integration/api';
import { LessonContent } from './LessonContent';
import type { Enrollment } from './LearnerSession';
import { OralRecorder } from './exams-recorder';
import { GradingWorkspace } from './exams-grading';
import {
  AttemptHistory, ClosedAnswers, CompetenceIcon, ExamMedia, ProductionText, ResultSummary, competenceNames, competenceTone, countWords,
  dateTime, examNames, fromNow, getError, partState, plural, shortDate, statusBadge, timeOnly,
  type ExamKind, type ExamPart, type ExamSummary, type ExamView,
} from './exams-shared';
import './exams.css';

export { examNames };

type SaveState = { status: 'idle' | 'pending' | 'saving' | 'saved' | 'error'; at: Date | null };
const UMLAUTS = ['ä', 'ö', 'ü', 'ß', 'Ä', 'Ö', 'Ü'];
const LETTERS = 'ABCDEFGHIJ';

/** État de l'enregistrement automatique des réponses. */
function SaveIndicator({ state }: { state: SaveState }) {
  const busy = state.status === 'pending' || state.status === 'saving';
  const text = busy ? 'Enregistrement…'
    : state.status === 'saved' && state.at ? `Enregistré à ${timeOnly.format(state.at)}`
    : state.status === 'error' ? 'Échec de l’enregistrement'
    : 'Enregistrement automatique';
  const Icon = busy ? LoaderCircle : state.status === 'error' ? AlertTriangle : CloudCheck;
  return (
    <span className={`ev-save is-${state.status}`}>
      <Icon size={15} aria-hidden="true" /><span>{text}</span>
    </span>
  );
}

/** Question fermée : carte avec la consigne, ses supports et des choix en tuiles. */
function QuestionCard({ part, exam, index, onAnswer }: {
  part: ExamPart; exam: ExamView; index: number; onAnswer: (questionId: string, optionId: string) => void;
}) {
  const question = part.questions[index];
  const chosen = exam.answers[part.id]?.[question.id];
  return (
    <div className={`ev-question${chosen ? ' is-answered' : ''}`}>
      <fieldset>
        <legend><span className="ev-q-head"><span className="ev-q-num">{index + 1}</span><span className="ev-q-prompt">{question.prompt}</span></span></legend>
        <ExamMedia part={part} exam={exam} questionId={question.id} />
        <div className="ev-choices">
          {question.options.map((option, position) => {
            const picture = part.placements.find((placement) => placement.questionId === question.id && placement.optionId === option.id && placement.usage === 'illustration');
            const url = picture ? exam.media[`${picture.assetId}@${picture.assetVersion}`] : undefined;
            return (
              <label key={option.id} className={`ev-choice${url ? ' has-picture' : ''}`}>
                <input type="radio" name={`${part.id}-${question.id}`} checked={chosen === option.id} onChange={() => onAnswer(question.id, option.id)} />
                {url && <img src={url} alt={picture?.decorative ? '' : picture?.alt ?? ''} />}
                <span className="ev-choice-key" aria-hidden="true">{LETTERS[position] ?? position + 1}</span>
                <span className="ev-choice-text">{option.label}</span>
                <span className="ev-choice-check" aria-hidden="true"><Check size={14} strokeWidth={3} /></span>
              </label>
            );
          })}
        </div>
      </fieldset>
    </div>
  );
}

/** Zone d'écriture : grand champ, caractères allemands, compteur de mots et enregistrement automatique visible. */
function WritingPad({ value, onChange, save }: { value: string; onChange: (text: string) => void; save: SaveState }) {
  const id = useId();
  const area = useRef<HTMLTextAreaElement>(null);
  const words = countWords(value);
  function insert(character: string) {
    const field = area.current;
    if (!field) return;
    const start = field.selectionStart ?? value.length;
    const end = field.selectionEnd ?? value.length;
    onChange(`${value.slice(0, start)}${character}${value.slice(end)}`.slice(0, 8000));
    requestAnimationFrame(() => { field.focus(); field.setSelectionRange(start + 1, start + 1); });
  }
  return (
    <div className="ev-writer">
      <div className="ev-writer-head">
        <label htmlFor={id}>Votre texte</label>
        <div className="ev-umlauts" role="group" aria-label="Caractères allemands">
          {UMLAUTS.map((character) => (
            <button key={character} type="button" lang="de" onMouseDown={(event) => event.preventDefault()} onClick={() => insert(character)}
              aria-label={`Insérer ${character}`}>{character}</button>
          ))}
        </div>
      </div>
      <textarea ref={area} id={id} rows={10} maxLength={8000} lang="de" value={value} aria-describedby={`${id}-count`}
        placeholder="Schreiben Sie hier …" onChange={(event) => onChange(event.target.value)} />
      <div className="ev-writer-foot" id={`${id}-count`}>
        <span className="ev-words"><b>{words}</b> {words > 1 ? 'mots' : 'mot'}</span>
        <span className="ev-chars">{value.length} / 8000 caractères</span>
        <SaveIndicator state={save} />
      </div>
    </div>
  );
}

/** En-tête de l'épreuve : titre, état de la tentative, échéance et repères. */
function ExamHero({ kind, exam }: { kind: ExamKind; exam: ExamView | null }) {
  const level = exam?.definition.levelCode;
  const facts = exam ? [
    { label: 'Échéance', value: exam.dueAt
      ? <span className="ev-fact">{shortDate.format(new Date(exam.dueAt))} · {timeOnly.format(new Date(exam.dueAt))}
        {exam.status === 'in_progress' && <small>{fromNow(exam.dueAt)}</small>}</span>
      : 'Aucune' },
    { label: 'Seuil de réussite', value: `${exam.definition.passPercent} %` },
    { label: 'Parties', value: exam.definition.parts.length },
    exam.submittedAt
      ? { label: 'Remise', value: <span className="ev-fact">{shortDate.format(new Date(exam.submittedAt))}<small>{exam.onTime ? 'dans les délais' : 'après l’échéance'}</small></span> }
      : { label: 'Commencée', value: shortDate.format(new Date(exam.startedAt)) },
  ] : [];
  return (
    <header className={`ev-hero${exam ? '' : ' is-plain'}`}>
      <div className="ev-hero-main">
        <span className="ev-hero-icon" aria-hidden="true"><ClipboardCheck size={26} /></span>
        <div className="ev-hero-text">
          <p className="eyebrow">{examNames[kind]}{level ? ` · niveau ${level}` : ''}</p>
          <h1 id="exam-title">{exam?.definition.title ?? examNames[kind]}</h1>
          <p className="ev-hero-desc">{exam?.definition.description || (kind === 'final'
            ? 'Lecture, écoute, écrit et oral, dans les conditions de l’examen.' : 'Un point d’étape sur les modules déjà travaillés.')}</p>
          {exam && (
            <div className="ev-hero-badges">
              {statusBadge({ status: exam.status, decision: exam.result?.decision ?? null })}
              <Badge tone="neutral">Tentative {exam.number}</Badge>
            </div>
          )}
        </div>
      </div>
      {exam && <div className="ev-hero-facts"><Facts items={facts} /></div>}
    </header>
  );
}

/** Avant la première tentative : ce qu'il faut prévoir, puis le bouton pour commencer. */
function StartCard({ kind, busy, onStart }: { kind: ExamKind; busy: boolean; onStart: () => void }) {
  const tips = [
    { icon: <Target size={18} />, title: 'Partie par partie', text: 'Un sommaire indique ce qui est fait et ce qu’il reste à compléter.' },
    { icon: <Headphones size={18} />, title: 'Un casque et un micro', text: 'Pour écouter les documents et enregistrer l’oral. Un fichier audio peut aussi être déposé.' },
    { icon: <CloudCheck size={18} />, title: 'Rien n’est perdu', text: 'Vos réponses sont enregistrées au fur et à mesure : vous pouvez reprendre plus tard.' },
    { icon: <Send size={18} />, title: 'Une seule remise', text: 'Remettez la tentative quand toutes les parties sont prêtes.' },
  ];
  return (
    <Card className="ev-start" title="Avant de commencer" description="Installez-vous au calme : prévoyez du temps pour chaque partie.">
      <ul className="ev-tips lc-stagger">
        {tips.map((tip) => (
          <li key={tip.title}><span className="ev-icon-tile is-brand" aria-hidden="true">{tip.icon}</span><div><strong>{tip.title}</strong><small>{tip.text}</small></div></li>
        ))}
      </ul>
      <div className="ev-start-action">
        <button type="button" className="btn btn-primary btn-lg" disabled={busy} onClick={onStart}>
          {busy ? <LoaderCircle size={18} className="ev-spin" aria-hidden="true" /> : <PenLine size={18} aria-hidden="true" />}
          Commencer le {examNames[kind].toLowerCase()}
        </button>
      </div>
    </Card>
  );
}

/** Tentative remise : étapes jusqu'au résultat et récapitulatif de la copie. */
function SubmittedView({ exam }: { exam: ExamView }) {
  return (
    <div className="ev-submitted">
      <Card className="ev-waiting" title="Copie remise, correction en cours" icon={<Hourglass size={18} />}
        description="Votre résultat sera disponible après la correction de l’écrit et de l’oral.">
        <Timeline items={[
          { id: 'start', title: 'Tentative commencée', meta: dateTime.format(new Date(exam.startedAt)), tone: 'success', icon: <Check size={14} /> },
          { id: 'sent', title: 'Copie remise', meta: exam.submittedAt ? `${dateTime.format(new Date(exam.submittedAt))}${exam.onTime ? ' · dans les délais' : ' · après l’échéance'}` : undefined, tone: 'success', icon: <Check size={14} /> },
          { id: 'grading', title: 'Correction de l’écrit et de l’oral', meta: 'Par votre professeur ou votre correcteur', tone: 'brand', icon: <Hourglass size={14} /> },
          { id: 'result', title: 'Résultat et conseils', meta: 'Ils s’afficheront sur cette page', icon: <Flag size={14} /> },
        ]} />
      </Card>
      <Card className="ev-recap" title="Votre copie" description="Ce que vous avez remis, partie par partie." icon={<ClipboardCheck size={18} />}>
        <div className="ev-recap-list">
          {exam.definition.parts.map((part) => {
            const recording = exam.recordings.find((entry) => entry.partId === part.id);
            return (
              <section key={part.id} className="ev-recap-part" aria-labelledby={`recap-${part.id}`}>
                <header>
                  <span className={`ev-icon-tile is-${competenceTone(part.competence)}`}><CompetenceIcon competence={part.competence} size={16} /></span>
                  <div><h3 id={`recap-${part.id}`}>{part.title}</h3><small>{competenceNames[part.competence] ?? part.competence} · {partState(part, exam).label}</small></div>
                </header>
                {part.mode === 'closed' && <ClosedAnswers part={part} exam={exam} />}
                {part.mode === 'written' && <div className="ev-paper is-compact"><ProductionText text={exam.texts[part.id] ?? ''} /></div>}
                {part.mode === 'oral' && (recording?.url
                  ? <div className="ev-audio"><AudioPlayer src={recording.url} title={`Mon enregistrement · ${part.title}`} /></div>
                  : <p className="muted">Aucun enregistrement.</p>)}
              </section>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

/** Passage du bilan ou de l'examen blanc par l'élève : reprise, sauvegarde, oral, remise et résultats. */
function ExamPage({ token }: { token: string }) {
  const { enrollmentId = '', kind = 'midterm' } = useParams();
  const examKind: ExamKind = kind === 'final' ? 'final' : 'midterm';
  const toast = useToast();
  const [history, setHistory] = useState<ExamSummary[] | null>(null);
  const [exam, setExam] = useState<ExamView | null>(null);
  const [error, setError] = useState('');
  const [loadError, setLoadError] = useState('');
  const [busy, setBusy] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [confirming, setConfirming] = useState(false);
  const [save, setSave] = useState<SaveState>({ status: 'idle', at: null });
  const [activePart, setActivePart] = useState('');
  const [sessionOf, setSessionOf] = useState<Record<string, string>>({});
  const submitKey = useRef<string | null>(null);
  const saveTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    let active = true;
    setLoadError('');
    requestApi<ExamSummary[]>(`/assessments/exams?enrollmentId=${encodeURIComponent(enrollmentId)}`, token).then(async (list) => {
      if (!active) return;
      const mine = list.filter((item) => item.kind === examKind);
      if (mine[0]) setExam(await requestApi<ExamView>(`/assessments/exams/${encodeURIComponent(mine[0].id)}`, token));
      setHistory(mine);
    }).catch((failure: unknown) => { if (active) setLoadError(getError(failure)); });
    return () => { active = false; };
  }, [enrollmentId, examKind, token, refresh]);

  // Activités à revoir : retrouver la séance de chaque activité pour l'ouvrir d'un geste.
  const reviewCount = exam?.result?.review?.length ?? 0;
  useEffect(() => {
    if (!reviewCount) return;
    let active = true;
    requestApi<Enrollment | null>('/learning/enrollment', token).then((enrollment) => {
      if (!active || !enrollment || enrollment.id !== enrollmentId) return;
      setSessionOf(Object.fromEntries(enrollment.sessions.flatMap((session) => session.activities.map((activity) => [activity.id, session.id]))));
    }).catch(() => undefined);
    return () => { active = false; };
  }, [reviewCount, enrollmentId, token]);

  // Partie visible à l'écran : mise en avant dans le sommaire.
  const partIds = exam?.status === 'in_progress' ? exam.definition.parts.map((part) => part.id).join('|') : '';
  useEffect(() => {
    if (!partIds || typeof IntersectionObserver === 'undefined') return;
    const ids = partIds.split('|');
    setActivePart((current) => current || ids[0]);
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
      if (visible) setActivePart(visible.target.id.replace('exam-part-', ''));
    }, { rootMargin: '-25% 0px -60% 0px' });
    ids.forEach((id) => { const node = document.getElementById(`exam-part-${id}`); if (node) observer.observe(node); });
    return () => observer.disconnect();
  }, [partIds]);

  const persist = useCallback((next: ExamView) => {
    window.clearTimeout(saveTimer.current);
    setSave((current) => ({ ...current, status: 'pending' }));
    saveTimer.current = window.setTimeout(() => {
      setSave((current) => ({ ...current, status: 'saving' }));
      void requestApi<ExamView>(`/assessments/exams/${encodeURIComponent(next.id)}/answers`, token, {
        method: 'PUT', body: { answers: next.answers, texts: next.texts },
      }).then(() => { setSave({ status: 'saved', at: new Date() }); setError(''); })
        .catch((failure: unknown) => { setSave((current) => ({ ...current, status: 'error' })); setError(getError(failure)); });
    }, 500);
  }, [token]);

  useEffect(() => () => window.clearTimeout(saveTimer.current), []);

  async function start() {
    setBusy(true);
    setError('');
    try {
      const opened = await requestApi<ExamView>('/assessments/exams', token, { method: 'POST', body: { enrollmentId, kind: examKind } });
      setExam(opened);
      submitKey.current = null;
      setSave({ status: 'idle', at: null });
      // La nouvelle tentative rejoint l'historique sans recharger la page.
      setHistory((list) => [{
        id: opened.id, kind: opened.kind, number: opened.number, status: opened.status, title: opened.definition.title, startedAt: opened.startedAt,
        submittedAt: null, dueAt: opened.dueAt, gradedAt: null, onTime: opened.onTime, percent: null, decision: null,
      }, ...(list ?? []).filter((item) => item.id !== opened.id)]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (failure) {
      setError(getError(failure));
    } finally {
      setBusy(false);
    }
  }

  async function submit() {
    if (!exam || busy) return;
    setConfirming(false);
    setBusy(true);
    setError('');
    window.clearTimeout(saveTimer.current);
    submitKey.current ??= crypto.randomUUID();
    try {
      await requestApi(`/assessments/exams/${encodeURIComponent(exam.id)}/answers`, token, { method: 'PUT', body: { answers: exam.answers, texts: exam.texts } });
      setExam(await requestApi<ExamView>(`/assessments/exams/${encodeURIComponent(exam.id)}/submit`, token, {
        method: 'POST', idempotencyKey: submitKey.current,
      }));
      setRefresh((value) => value + 1);
      toast('Tentative remise. Votre résultat arrivera après la correction.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (failure) {
      setError(getError(failure));
    } finally {
      setBusy(false);
    }
  }

  function goTo(partId: string) {
    setActivePart(partId);
    document.getElementById(`exam-part-${partId}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  const update = (next: ExamView) => { setExam(next); persist(next); };
  const latest = history?.[0];
  const canRetry = latest?.status === 'graded' && latest.decision === 'to_consolidate';
  const parts = exam?.definition.parts ?? [];
  const states = exam ? parts.map((part) => partState(part, exam)) : [];
  const done = states.filter((state) => state.done).length;
  const historyCard = history && history.length > 1 ? <AttemptHistory history={history} currentId={exam?.id} /> : null;
  const errorBox = error && <div role="alert"><Callout tone="warning" title="Une action n’a pas abouti">{error}</Callout></div>;

  return (
    <div className="ev-page lc-enter">
      <Link className="text-link ev-back" to="/espace"><ArrowLeft size={16} aria-hidden="true" /> Retour à mon espace</Link>
      <ExamHero kind={examKind} exam={exam} />

      {loadError && (
        <div role="alert" className="ev-load-error">
          <Callout tone="warning" title="L’évaluation n’a pas pu être chargée">{loadError}</Callout>
          <button type="button" className="btn btn-outline" onClick={() => setRefresh((value) => value + 1)}>Réessayer</button>
        </div>
      )}
      {history === null && !loadError && (
        <div className="ev-loading"><SkeletonCard lines={3} label="Chargement de l’évaluation…" /><SkeletonCard lines={5} /></div>
      )}

      {history !== null && !exam && (<>{errorBox}<StartCard kind={examKind} busy={busy} onStart={() => void start()} /></>)}

      {exam?.status === 'graded' && (
        <>
          {errorBox}
          <ResultSummary exam={exam} extra={historyCard}
            reviewHref={(activityId) => (sessionOf[activityId] ? `/espace/seance/${sessionOf[activityId]}` : '/espace/planning')}
            action={canRetry && latest?.id === exam.id ? (
              <button type="button" className="btn btn-primary" disabled={busy} onClick={() => void start()}>
                {busy ? <LoaderCircle size={17} className="ev-spin" aria-hidden="true" /> : <PenLine size={17} aria-hidden="true" />} Commencer une nouvelle tentative
              </button>
            ) : undefined} />
        </>
      )}

      {exam?.status === 'submitted' && (<>{errorBox}<SubmittedView exam={exam} />{historyCard}</>)}

      {exam?.status === 'in_progress' && (
        <div className="ev-sheet">
          <aside className="ev-aside" aria-label="Avancement de l’épreuve">
            <div className="ev-progress">
              <ProgressRing value={parts.length ? (done / parts.length) * 100 : 0} size={58} stroke={6} label={`${done} parties complètes sur ${parts.length}`}>
                <strong className="ev-progress-count">{done}/{parts.length}</strong>
              </ProgressRing>
              <div><strong>{done === parts.length ? 'Tout est prêt' : plural(done, 'partie complète', 'parties complètes')}</strong>
                <small>{done === parts.length ? 'Vous pouvez remettre votre tentative.' : `sur ${parts.length} · ${plural(parts.length - done, 'partie restante', 'parties restantes')}`}</small></div>
            </div>
            <ol className="kit-steps ev-segments" aria-hidden="true">
              {states.map((state, index) => <li key={parts[index].id} className={state.done ? 'is-done' : parts[index].id === activePart ? 'is-current' : ''} />)}
            </ol>
            <nav className="ev-partnav" aria-label="Parties de l’épreuve">
              <ol>
                {parts.map((part, index) => (
                  <li key={part.id}>
                    <button type="button" className={`ev-navitem${states[index].done ? ' is-done' : ''}`} aria-current={part.id === activePart ? 'step' : undefined}
                      onClick={() => goTo(part.id)}>
                      <span className="ev-navdot" aria-hidden="true">{states[index].done ? <Check size={14} strokeWidth={3} /> : index + 1}</span>
                      <span className="ev-navtext"><strong>{part.title}</strong><small>{states[index].label}</small></span>
                    </button>
                  </li>
                ))}
              </ol>
            </nav>
          </aside>

          <div className="ev-main">
            <form className="ev-form" onSubmit={(event: FormEvent<HTMLFormElement>) => { event.preventDefault(); if (!busy) setConfirming(true); }}>
              <div className="ev-parts">
                {parts.map((part, index) => (
                  <section className="ev-part" key={part.id} id={`exam-part-${part.id}`} aria-labelledby={`part-${part.id}`}>
                    <header className="ev-part-head">
                      <span className={`ev-part-icon is-${competenceTone(part.competence)}`}><CompetenceIcon competence={part.competence} size={20} /></span>
                      <div>
                        <p className="ev-part-kicker">Partie {index + 1} sur {parts.length} · {competenceNames[part.competence] ?? part.competence}</p>
                        <h2 id={`part-${part.id}`}>{part.title}</h2>
                      </div>
                      {states[index].done
                        ? <Badge tone="green"><Check size={13} strokeWidth={3} aria-hidden="true" /> Complète</Badge>
                        : <Badge tone="neutral">{states[index].label}</Badge>}
                    </header>
                    {part.instructions && <div className="ev-instructions"><LessonContent text={part.instructions} compact /></div>}
                    <ExamMedia part={part} exam={exam} />
                    {part.mode === 'closed' && (
                      <div className="ev-questions">
                        {part.questions.map((question, position) => (
                          <QuestionCard key={question.id} part={part} exam={exam} index={position}
                            onAnswer={(questionId, optionId) => update({ ...exam, answers: { ...exam.answers, [part.id]: { ...exam.answers[part.id], [questionId]: optionId } } })} />
                        ))}
                      </div>
                    )}
                    {part.mode === 'written' && (
                      <WritingPad value={exam.texts[part.id] ?? ''} save={save}
                        onChange={(text) => update({ ...exam, texts: { ...exam.texts, [part.id]: text } })} />
                    )}
                    {part.mode === 'oral' && <OralRecorder part={part} exam={exam} token={token} onSaved={setExam} />}
                  </section>
                ))}
              </div>

              <div className="ev-actionbar">
                {errorBox}
                <div className="ev-actionbar-row">
                  <div className="ev-actionbar-info">
                    <strong>{done}/{parts.length} parties complètes</strong>
                    <SaveIndicator state={save} />
                  </div>
                  <button type="submit" className="btn btn-primary btn-lg" disabled={busy}>
                    {busy ? <LoaderCircle size={18} className="ev-spin" aria-hidden="true" /> : <Send size={18} aria-hidden="true" />}
                    {busy ? 'Remise…' : 'Remettre ma tentative'}
                  </button>
                </div>
              </div>
            </form>
            {historyCard}
          </div>
        </div>
      )}

      {confirming && exam?.status === 'in_progress' && (
        <Dialog title="Remettre votre tentative ?" onClose={() => setConfirming(false)}>
          <div className="ev-confirm">
            <ul className="ev-confirm-list">
              {parts.map((part, index) => (
                <li key={part.id} className={states[index].done ? 'is-done' : 'is-todo'}>
                  {states[index].done ? <CheckCircle2 size={18} aria-hidden="true" /> : <CircleAlert size={18} aria-hidden="true" />}
                  <span><strong>{part.title}</strong><small>{states[index].label}</small></span>
                </li>
              ))}
            </ul>
            {done < parts.length
              ? <Callout tone="warning" title={plural(parts.length - done, 'partie à compléter', 'parties à compléter')}>
                  L’écrit et l’oral sont nécessaires à la correction ; une question sans réponse ne rapporte pas de point.</Callout>
              : <Callout tone="success" title="Toutes les parties sont complètes">Votre copie est prête à être corrigée.</Callout>}
            <p className="muted">Après la remise, vous ne pourrez plus modifier vos réponses.</p>
            <div className="ev-confirm-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setConfirming(false)}>Continuer à répondre</button>
              <button type="button" className="btn btn-primary" onClick={() => void submit()} disabled={busy}>
                <Send size={17} aria-hidden="true" /> Remettre ma tentative</button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}

export function GradingPanel({ token }: { token: string }) {
  return (
    <Routes>
      <Route path=":attemptId?" element={<GradingWorkspace token={token} />} />
    </Routes>
  );
}

export { ExamPage };
