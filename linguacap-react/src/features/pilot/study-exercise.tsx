/**
 * Exercice du mode étude (séance, bibliothèque, aperçu de l'éditeur) : une saisie par type de question (choix, texte à
 * trous, phrase à remettre en ordre, associations, dictée, répétition orale), sauvegarde de l'état, remise par
 * POST /assessments/exercises puis corrigé question par question. Une tentative déjà remise est relue par
 * GET /assessments/exercises/{attemptId} ; si le corrigé n'est pas disponible, les réponses verrouillées restent visibles.
 */
import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { CheckCircle2, Clock3, Flag } from 'lucide-react';
import { Callout, ProgressRing, SkeletonCard } from '../../design/kit';
import { requestApi } from '../../integration/api';
import {
  asQuestionView, newRoundId, questionTypeLabels, readExerciseState, type ExerciseAnswer, type ExerciseAnswers, type ExerciseResult,
  type ExerciseState, type ExerciseSubmitRequest, type QuestionView,
} from '../../integration/v4';
import { LessonContent } from './LessonContent';
import type { ActivityDetail, Grade } from './LearnerSession';
import { MediaPlacement, MediaSequence, Transcript } from './study-media';
import { cleanAnswer, DictationField, FillField, isAnswered, MatchField, missingTexts, OrderField } from './study-items';
import { QuestionCard, QuestionFrame } from './study-question';
import { ExerciseReview } from './study-review';
import { SpeakField } from './study-speak';
import './learner-session.css';
import './study-exercise.css';

export const activityPlacements = (activity: Pick<ActivityDetail, 'placements'>) => activity.placements.filter((placement) => !placement.questionId);
export const questionPlacements = (activity: Pick<ActivityDetail, 'placements'>, questionId: string) =>
  activity.placements.filter((placement) => placement.questionId === questionId && !placement.optionId);
const optionPlacements = (activity: Pick<ActivityDetail, 'placements'>, questionId: string, optionId: string) =>
  activity.placements.filter((placement) => placement.questionId === questionId && placement.optionId === optionId);

/** Corrigés déjà lus pendant la visite (retour sur une activité sans nouvel appel). */
const reviews = new Map<string, ExerciseResult>();

function errorText(error: unknown) {
  return error instanceof Error && error.name !== 'TimeoutError' ? error.message : 'Le service est momentanément indisponible. Réessayez.';
}

function encouragement(percent: number | null) {
  if (percent === null) return { title: 'Exercice terminé', text: 'Vos réponses sont enregistrées.' };
  if (percent >= 90) return { title: 'Excellent !', text: 'Vous maîtrisez cette activité. Continuez sur cette lancée.' };
  if (percent >= 70) return { title: 'Très bien !', text: 'Encore un petit effort et ce sera parfait. Le corrigé vous montre quoi retenir.' };
  if (percent >= 50) return { title: 'Bon travail', text: 'Lisez le corrigé : chaque explication vous aide à consolider.' };
  return { title: 'Ne lâchez rien', text: 'C’est en pratiquant qu’on progresse : lisez le corrigé, réécoutez, puis passez à la suite.' };
}

/** Score de l'exercice : anneau, encouragement, réponses en attente ou à revoir, et transcription des supports. */
export function ExerciseScore({ grade, transcript }: { grade: Grade | null; transcript: string | null }) {
  const percent = grade && grade.total ? Math.round((grade.correct / grade.total) * 100) : null;
  const tone = percent === null || percent >= 70 ? 'success' : percent >= 50 ? 'brand' : 'accent';
  const cheer = encouragement(percent);
  const pending = grade?.pending ?? 0;
  const flagged = grade?.flagged?.length ?? 0;
  return (
    <section className={`study-result is-${tone}`} aria-label="Résultat de l’exercice">
      <div className="study-result-head">
        {grade ? (
          <ProgressRing value={percent ?? 0} size={88} stroke={8} color={`var(--${tone})`} label={`${grade.correct} bonnes réponses sur ${grade.total}`}>
            <strong className="study-result-score">{grade.correct}<small>/{grade.total}</small></strong>
          </ProgressRing>
        ) : <span className="study-result-icon" aria-hidden="true"><CheckCircle2 size={30} /></span>}
        <div className="study-result-text">
          <h3 tabIndex={-1} data-result-focus>{cheer.title}</h3>
          {grade && <p className="study-result-line" role="status">Résultat enregistré · {grade.correct} / {grade.total}</p>}
          <p className="study-result-note">{cheer.text}</p>
          {(pending > 0 || flagged > 0) && (
            <ul className="sx-result-flags">
              {pending > 0 && <li className="is-pending"><Clock3 size={14} aria-hidden="true" /> {pending} réponse{pending > 1 ? 's' : ''} en attente de validation par votre professeur</li>}
              {flagged > 0 && <li className="is-flag"><Flag size={14} aria-hidden="true" /> {flagged} question{flagged > 1 ? 's' : ''} à revoir</li>}
            </ul>
          )}
        </div>
      </div>
      <Transcript text={transcript} />
    </section>
  );
}

function initialAnswers(questions: QuestionView[], saved: ExerciseAnswers) {
  const answers: ExerciseAnswers = {};
  for (const question of questions) {
    const answer = cleanAnswer(question, saved[question.id]);
    if (answer) answers[question.id] = answer;
  }
  return answers;
}

/**
 * Exercice corrigé. Dans une séance, `sessionId` rattache la correction à l'activité de la séance ; sans séance
 * (bibliothèque, exercice libre), la correction est enregistrée seule et relue dans les résultats. `onSaveState`
 * reçoit l'état à sauvegarder (`{answers, roundId}`) ; `onGraded` la note, cet état et le corrigé.
 */
export function ExerciseActivity({ activity, sessionId, token, grade, onRenew, onSaveState, onGraded, preview = false }: {
  activity: ActivityDetail;
  sessionId?: string;
  token: string;
  grade: Grade | null;
  onRenew: () => void;
  onSaveState: (state: ExerciseState) => void;
  onGraded: (grade: Grade, state: ExerciseState, result: ExerciseResult) => Promise<void>;
  preview?: boolean;
}) {
  const questions = useMemo(() => activity.questions.map(asQuestionView), [activity.questions]);
  const [saved] = useState(() => readExerciseState(activity.state));
  const [roundId] = useState(() => saved.roundId ?? newRoundId());
  const [answers, setAnswers] = useState<ExerciseAnswers>(() => initialAnswers(questions, saved.answers));
  const [result, setResult] = useState<ExerciseResult | null>(() => (activity.attemptId ? reviews.get(activity.attemptId) ?? null : null));
  const [reviewState, setReviewState] = useState<'idle' | 'loading' | 'failed'>('idle');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [missing, setMissing] = useState<string[]>([]);
  const key = useRef<string | null>(null);
  const cards = useRef<Record<string, HTMLFieldSetElement | null>>({});
  const scoreRef = useRef<HTMLDivElement>(null);
  const completed = activity.status === 'completed';
  const total = questions.length;
  const answered = questions.filter((question) => isAnswered(question, answers[question.id])).length;
  const showResult = completed || Boolean(grade) || Boolean(result);
  const shownGrade = result?.grade ?? grade;
  const typed = questions.some((question) => question.type !== 'choice');

  // Tentative déjà remise (reprise de la séance) : relire son corrigé.
  useEffect(() => {
    const attemptId = activity.attemptId;
    if (!completed || !attemptId || preview || result?.grade.id === attemptId) return;
    const known = reviews.get(attemptId);
    if (known) { setResult(known); return; }
    let active = true;
    setReviewState('loading');
    requestApi<ExerciseResult>(`/assessments/exercises/${encodeURIComponent(attemptId)}`, token).then((loaded) => {
      if (!active) return;
      reviews.set(attemptId, loaded);
      setResult(loaded);
      setReviewState('idle');
    }).catch(() => { if (active) setReviewState('failed'); });
    return () => { active = false; };
  }, [completed, activity.attemptId, preview, token, result]);

  function update(questionId: string, answer: ExerciseAnswer) {
    key.current = null;
    const next = { ...answers, [questionId]: answer };
    setAnswers(next);
    const question = questions.find((item) => item.id === questionId);
    if (question && isAnswered(question, answer)) setMissing((list) => list.filter((id) => id !== questionId));
    onSaveState({ answers: next, roundId });
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || !activity.lesson || preview) return;
    const left = questions.filter((question) => !isAnswered(question, answers[question.id])).map((question) => question.id);
    if (left.length) {
      setMissing(left);
      const card = cards.current[left[0]];
      card?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      card?.querySelector<HTMLElement>('input:not(:disabled), textarea:not(:disabled), button:not(:disabled)')?.focus({ preventScroll: true });
      return;
    }
    setBusy(true);
    setError('');
    key.current ??= crypto.randomUUID();
    const body: ExerciseSubmitRequest = {
      lessonId: activity.lesson.id, roundId,
      answers: Object.fromEntries(questions.map((question) => [question.id, answers[question.id]])),
      ...(sessionId ? { sessionId, activityId: activity.id } : {}),
    };
    try {
      const outcome = await requestApi<ExerciseResult>('/assessments/exercises', token, { method: 'POST', body, idempotencyKey: key.current });
      reviews.set(outcome.grade.id, outcome);
      setResult(outcome);
      await onGraded(outcome.grade, { answers, roundId }, outcome);
      key.current = null;
      window.requestAnimationFrame(() => {
        scoreRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        scoreRef.current?.querySelector<HTMLElement>('[data-result-focus]')?.focus({ preventScroll: true });
      });
    } catch (failure) {
      setError(errorText(failure));
    } finally {
      setBusy(false);
    }
  }

  const context = activity.lesson && !preview
    ? { lessonId: activity.lesson.id, roundId, ...(sessionId ? { sessionId, activityId: activity.id } : {}) }
    : null;

  function media(questionId: string) {
    const list = questionPlacements(activity, questionId);
    return list.length ? list.map((placement) => <MediaPlacement key={placement.position} placement={placement} onRenew={onRenew} />) : undefined;
  }

  /** Dans le corrigé : le son se réécoute en entier, l'image reste en vignette pour ne pas noyer la correction. */
  function reviewMedia(questionId: string) {
    const list = questionPlacements(activity, questionId);
    return list.length ? list.map((placement) => (
      <MediaPlacement key={placement.position} placement={placement} onRenew={onRenew} compact={placement.usage === 'illustration'} />
    )) : undefined;
  }

  function renderQuestion(question: QuestionView, index: number) {
    const answer = answers[question.id];
    const frame = {
      index, prompt: question.prompt, answered: isAnswered(question, answer), locked: completed,
      missing: missing.includes(question.id), missingText: missingTexts[question.type],
      cardRef: (node: HTMLFieldSetElement | null) => { cards.current[question.id] = node; },
      tag: questionTypeLabels[question.type], media: media(question.id),
    };
    switch (question.type) {
      case 'choice':
        return (
          <QuestionCard key={question.id} index={index} prompt={question.prompt} name={question.id} options={question.options}
            value={answer && 'choice' in answer ? answer.choice : undefined} onChoose={(optionId) => update(question.id, { choice: optionId })}
            locked={completed} missing={frame.missing} cardRef={frame.cardRef} media={frame.media}
            extras={(optionId) => {
              const list = optionPlacements(activity, question.id, optionId);
              if (!list.length) return undefined;
              const pictures = list.filter((placement) => placement.usage === 'illustration');
              const sounds = list.filter((placement) => placement.usage === 'audio');
              return {
                label: pictures.find((placement) => !placement.decorative && placement.alt)?.alt ?? undefined,
                picture: pictures.length ? pictures.map((placement) => <MediaPlacement key={placement.position} placement={placement} onRenew={onRenew} compact />) : undefined,
                audio: sounds.length ? sounds.map((placement) => <MediaPlacement key={placement.position} placement={placement} onRenew={onRenew} compact />) : undefined,
              };
            }} />
        );
      case 'fill':
        return (
          <QuestionFrame key={question.id} {...frame} className="is-fill">
            <FillField question={question} value={answer && 'blanks' in answer ? answer : undefined} onChange={(next) => update(question.id, next)} locked={completed} />
          </QuestionFrame>
        );
      case 'order':
        return (
          <QuestionFrame key={question.id} {...frame} className="is-order">
            <OrderField question={question} value={answer && 'order' in answer ? answer : undefined} onChange={(next) => update(question.id, next)} locked={completed} />
          </QuestionFrame>
        );
      case 'match':
        return (
          <QuestionFrame key={question.id} {...frame} className="is-match">
            <MatchField question={question} value={answer && 'pairs' in answer ? answer : undefined} onChange={(next) => update(question.id, next)} locked={completed} />
          </QuestionFrame>
        );
      case 'dictation':
        return (
          <QuestionFrame key={question.id} {...frame} className="is-dictation">
            <DictationField question={question} value={answer && 'text' in answer ? answer : undefined} onChange={(next) => update(question.id, next)} locked={completed} />
          </QuestionFrame>
        );
      case 'speak':
        return (
          <QuestionFrame key={question.id} {...frame} className="is-speak">
            <SpeakField question={question} value={answer && 'speechAttemptId' in answer ? answer : undefined} onChange={(next) => update(question.id, next)}
              context={context} token={token} preview={preview} locked={completed} />
          </QuestionFrame>
        );
    }
  }

  const reviewReady = Boolean(result);
  return (
    <form className="study-body sx-exercise" onSubmit={submit} noValidate>
      {activity.lesson?.description && <LessonContent text={activity.lesson.description} />}
      <MediaSequence placements={activityPlacements(activity)} onRenew={onRenew} after={!showResult && activity.transcript ? <Transcript text={activity.transcript} /> : undefined} />
      {reviewReady && result && (
        <>
          <div ref={scoreRef} className="sx-score-anchor"><ExerciseScore grade={shownGrade} transcript={activity.transcript} /></div>
          <ExerciseReview result={result} questions={questions} media={reviewMedia} />
        </>
      )}
      {!reviewReady && reviewState === 'loading' && <SkeletonCard lines={4} label="Chargement du corrigé…" />}
      {!reviewReady && reviewState !== 'loading' && total > 0 && (
        <div className="study-questions">{questions.map(renderQuestion)}</div>
      )}
      {error && <p className="inline-message warning" role="alert">{error}</p>}
      {missing.length > 0 && (
        <p className="inline-message warning" role="alert">
          {missing.length === 1 ? 'Il reste une question sans réponse complète.' : `Il reste ${missing.length} questions sans réponse complète.`}
        </p>
      )}
      {!reviewReady && reviewState !== 'loading' && showResult && (
        <div ref={scoreRef} className="sx-score-anchor"><ExerciseScore grade={shownGrade} transcript={activity.transcript} /></div>
      )}
      {preview && <Callout tone="info">Aperçu : la remise et la correction sont désactivées.</Callout>}
      {!completed && !reviewReady && (
        <div className="study-submit">
          {total > 0 && (
            <div className="study-submit-count">
              <ProgressRing value={(answered / total) * 100} size={42} stroke={5} label={`${answered} réponses sur ${total}`}>
                <small>{answered}/{total}</small>
              </ProgressRing>
              <span>{answered === total ? 'Toutes les réponses sont prêtes.' : answered === 0 ? (typed ? 'Répondez à chaque question.' : 'Choisissez une réponse par question.') : `${answered} réponse${answered > 1 ? 's' : ''} sur ${total}`}</span>
            </div>
          )}
          <button className="btn btn-primary btn-lg" type="submit" disabled={busy || preview || !total}>
            {busy ? 'Correction…' : 'Valider mes réponses'}
          </button>
        </div>
      )}
    </form>
  );
}

