/**
 * Corrigé d'un exercice après la remise : pour chaque question, juste, faux, en attente ou à revoir, la réponse donnée,
 * la réponse attendue, l'explication et les remarques (graphie à retenir, majuscule du nom…). `ExerciseReview` s'affiche
 * dans l'exercice ; `ExerciseReviewDrawer` relit une tentative depuis les résultats (élève, professeur).
 * Niveaux B : énoncé et explication bilingues (` [fr] ` affiché, ` [fr?] ` replié), voir bilingual.tsx.
 */
import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { Check, Clock3, Flag, Lightbulb, MessageSquareText, RotateCcw, Sparkles, X } from 'lucide-react';
import { Badge } from '../../components/ui';
import { Callout, Drawer, ProgressRing, SkeletonCard } from '../../design/kit';
import { requestApi } from '../../integration/api';
import {
  answerNoticeHints, answerNoticeLabels, asQuestionView, dictationWordStatusLabels, fillSegments, questionReviewStatusLabels,
  questionReviewStatusTones, questionTypeLabels, speechReviewStatusLabels, type AnswerNotice, type ChoiceReview, type DictationReview,
  type ExerciseResult, type FillReview, type MatchReview, type OrderReview, type QuestionReview, type QuestionReviewStatus, type QuestionView,
  type SpeakReview,
} from '../../integration/v4';
import { BilingualText } from './bilingual';
import './study-exercise.css';

const statusIcons: Record<QuestionReviewStatus, typeof Check> = { correct: Check, incorrect: X, pending: Clock3, flagged: Flag };

/** Énoncé joint par Évaluations au corrigé (absent des anciennes remises). */
const reviewPrompt = (review: QuestionReview) => (review as { prompt?: string | null }).prompt ?? null;
const dateFormat = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });

function errorText(error: unknown) {
  return error instanceof Error && error.name !== 'TimeoutError' && error.message ? error.message : 'Le service est momentanément indisponible. Réessayez.';
}

/** Ligne « Votre réponse » / « Réponse attendue ». */
function AnswerLine({ label, tone, children }: { label: string; tone: 'given' | 'wrong' | 'right'; children: ReactNode }) {
  return (
    <div className={`sx-answer is-${tone}`}>
      <dt>{label}</dt>
      <dd lang="de">{children}</dd>
    </div>
  );
}

function Notices({ notices, extra }: { notices: AnswerNotice[]; extra?: Partial<Record<AnswerNotice, string>> }) {
  const unique = [...new Set(notices)];
  if (!unique.length) return null;
  return (
    <ul className="sx-notices">
      {unique.map((notice) => (
        <li key={notice}>
          <span className="sx-notice-tag"><Sparkles size={13} aria-hidden="true" /> {answerNoticeLabels[notice]}{extra?.[notice] ? <> : <b lang="de">{extra[notice]}</b></> : null}</span>
          <small>{answerNoticeHints[notice]}</small>
        </li>
      ))}
    </ul>
  );
}

function ChoiceBody({ review, view }: { review: ChoiceReview; view?: QuestionView }) {
  const options = view?.type === 'choice' ? view.options : [];
  const given = review.given ? options.find((option) => option.id === review.given?.choice)?.text ?? review.given.label ?? null : null;
  const right = review.status === 'correct';
  return (
    <dl className="sx-answers">
      {given !== null && <AnswerLine label="Votre réponse" tone={right ? 'right' : 'wrong'}>{given}</AnswerLine>}
      {!right && <AnswerLine label="Bonne réponse" tone="right">{review.expected.label}</AnswerLine>}
      {right && given === null && <AnswerLine label="Bonne réponse" tone="right">{review.expected.label}</AnswerLine>}
    </dl>
  );
}

function FillBody({ review, view }: { review: FillReview; view?: QuestionView }) {
  const given = review.given?.blanks ?? {};
  const expected = review.expected.blanks;
  const detail = review.detail?.blanks ?? {};
  const correctOf = (id: string) => detail[id]?.correct ?? review.status === 'correct';
  const transliterated: Partial<Record<AnswerNotice, string>> = {};
  for (const [id, entry] of Object.entries(detail)) {
    for (const notice of entry.notices) if (expected[id]?.[0]) transliterated[notice] = expected[id][0];
  }
  const notices = [...review.notices, ...Object.values(detail).flatMap((entry) => entry.notices)];
  const sentence = view?.type === 'fill' ? view.text : review.expected.text ?? null;
  if (sentence) {
    return (
      <>
        <p className="sx-fill is-review" lang="de">
          {fillSegments(sentence).map((segment, index) => {
            if (segment.kind === 'text') return <span key={index}>{segment.text}</span>;
            const ok = correctOf(segment.id);
            const text = given[segment.id] ?? '';
            const answer = expected[segment.id]?.[0] ?? '';
            const noted = (detail[segment.id]?.notices.length ?? 0) > 0;
            return (
              <span key={index} className={`sx-blank-review is-${ok ? (noted ? 'noted' : 'right') : 'wrong'}`}>
                {ok ? <b>{noted ? answer : text}</b> : <>{text && <del>{text}</del>}<ins>{answer}</ins></>}
                <span className="sr-only">{ok ? ' (juste)' : ` (votre réponse : ${text || 'vide'}, réponse attendue : ${answer})`}</span>
              </span>
            );
          })}
        </p>
        <Notices notices={notices} extra={transliterated} />
      </>
    );
  }
  return (
    <>
      <dl className="sx-answers">
        {Object.keys(expected).map((id, index) => (
          <AnswerLine key={id} label={`Trou ${index + 1}`} tone={correctOf(id) ? 'right' : 'wrong'}>
            {correctOf(id) ? given[id] : <>{given[id] ? <del>{given[id]}</del> : null} {expected[id]?.[0]}</>}
          </AnswerLine>
        ))}
      </dl>
      <Notices notices={notices} extra={transliterated} />
    </>
  );
}

function OrderBody({ review, view }: { review: OrderReview; view?: QuestionView }) {
  const tokens = view?.type === 'order' ? new Map(view.tokens.map((token) => [token.id, token.text])) : null;
  const sentence = tokens && review.given ? review.given.order.map((id) => tokens.get(id) ?? '').join(' ') : review.given?.sentence ?? null;
  const right = review.status === 'correct';
  const others = review.expected.alternatives.filter((text) => text !== review.expected.sentence);
  return (
    <dl className="sx-answers">
      {sentence !== null && <AnswerLine label="Votre phrase" tone={right ? 'right' : 'wrong'}>{sentence}</AnswerLine>}
      {(!right || sentence === null) && <AnswerLine label="Phrase attendue" tone="right">{review.expected.sentence}</AnswerLine>}
      {others.length > 0 && <AnswerLine label={others.length > 1 ? 'Autres ordres acceptés' : 'Autre ordre accepté'} tone="given">{others.join(' · ')}</AnswerLine>}
    </dl>
  );
}

function MatchBody({ review, view }: { review: MatchReview; view?: QuestionView }) {
  const expected = review.expected.pairs;
  const given = review.given?.pairs ?? {};
  const detail = review.detail?.pairs ?? {};
  const okOf = (left: string) => detail[left] ?? given[left] === expected[left];
  const labels = review.expected.labels ?? {};
  const left = view?.type === 'match' ? view.left : Object.keys(expected).filter((id) => labels[id]).map((id) => ({ id, text: labels[id] }));
  if (!left.length) {
    const good = Object.keys(expected).filter(okOf).length;
    return <p className="sx-review-line">{good} association{good > 1 ? 's' : ''} juste{good > 1 ? 's' : ''} sur {Object.keys(expected).length}.</p>;
  }
  const right = new Map(view?.type === 'match' ? view.right.map((item) => [item.id, item.text]) : Object.entries(labels));
  return (
    <ul className="sx-pairs-review">
      {left.map((item) => {
        const ok = okOf(item.id);
        return (
          <li key={item.id} className={ok ? 'is-right' : 'is-wrong'}>
            <span className="sx-pairs-left">{item.text}</span>
            <span className="sx-pairs-arrow" aria-hidden="true">→</span>
            <span className="sx-pairs-right">
              {ok ? <b>{right.get(expected[item.id] ?? '')}</b> : <>{given[item.id] && <del>{right.get(given[item.id])}</del>}<ins>{right.get(expected[item.id] ?? '')}</ins></>}
            </span>
            <span className="sr-only">{ok ? ' (juste)' : ' (à corriger)'}</span>
          </li>
        );
      })}
    </ul>
  );
}

function DictationBody({ review }: { review: DictationReview }) {
  const words = review.detail?.words ?? [];
  const right = review.status === 'correct';
  return (
    <>
      {words.length > 0 && (
        <p className="sx-diff" lang="de" aria-label="Votre dictée, mot à mot">
          {words.map((word, index) => (
            <span key={index} className={`sx-word is-${word.status}`} title={dictationWordStatusLabels[word.status]}>
              {word.status === 'ok' && word.given}
              {(word.status === 'near' || word.status === 'translit') && <><del>{word.given}</del><ins>{word.expected}</ins></>}
              {word.status === 'wrong' && <><del>{word.given}</del><ins>{word.expected}</ins></>}
              {word.status === 'missing' && <ins className="is-missing">{word.expected}</ins>}
              {word.status === 'extra' && <del>{word.given}</del>}
              {word.status !== 'ok' && <span className="sr-only"> ({dictationWordStatusLabels[word.status]})</span>}
            </span>
          ))}
        </p>
      )}
      <dl className="sx-answers">
        {!words.length && review.given && <AnswerLine label="Votre texte" tone={right ? 'right' : 'wrong'}>{review.given.text}</AnswerLine>}
        <AnswerLine label="Phrase attendue" tone="right">{review.expected.text}</AnswerLine>
      </dl>
    </>
  );
}

function SpeakBody({ review }: { review: SpeakReview }) {
  const detail = review.detail;
  const transcript = detail?.transcript ?? review.given?.transcript ?? null;
  const comment = (detail as { comment?: string | null } | null)?.comment ?? null;
  return (
    <>
      <dl className="sx-answers">
        <AnswerLine label="Phrase à dire" tone="given">{review.expected.text}</AnswerLine>
        {transcript && <AnswerLine label="Texte reconnu" tone={review.status === 'correct' ? 'right' : 'wrong'}>{transcript}</AnswerLine>}
      </dl>
      {comment && <p className="sx-feedback"><MessageSquareText size={16} aria-hidden="true" /><span><strong>Votre professeur :</strong> {comment}</span></p>}
      {detail && (
        <p className="sx-review-line">
          {detail.mode === 'recording'
            ? `Enregistrement pour le professeur · ${speechReviewStatusLabels[detail.reviewStatus]}`
            : `Score ${detail.score ?? 0} / 100 · ${detail.attempts} essai${detail.attempts > 1 ? 's' : ''}`}
        </p>
      )}
      {review.status === 'pending' && <p className="sx-review-line is-pending">Votre professeur écoutera votre enregistrement et validera la phrase.</p>}
      {review.status === 'flagged' && <p className="sx-review-line is-flag">À revoir : réécoutez le modèle et entraînez-vous encore à la dire.</p>}
    </>
  );
}

function ReviewBody({ review, view }: { review: QuestionReview; view?: QuestionView }) {
  switch (review.type) {
    case 'choice': return <ChoiceBody review={review} view={view} />;
    case 'fill': return <FillBody review={review} view={view} />;
    case 'order': return <OrderBody review={review} view={view} />;
    case 'match': return <MatchBody review={review} view={view} />;
    case 'dictation': return <DictationBody review={review} />;
    case 'speak': return <SpeakBody review={review} />;
  }
}

/** Carte corrigée d'une question. */
export function ReviewCard({ review, view, index, media }: { review: QuestionReview; view?: QuestionView; index: number; media?: ReactNode }) {
  const Icon = statusIcons[review.status];
  // Texte à trous : remarques affichées par trou (FillBody). Dictée : celles du serveur et celles des mots.
  const notices: AnswerNotice[] = review.type === 'fill' ? []
    : review.type === 'dictation' ? [...review.notices,
      ...(review.detail?.words.some((word) => word.status === 'translit') ? ['transliteration' as const] : []),
      ...(review.detail?.words.some((word) => word.status === 'near') ? ['typo' as const] : [])]
    : review.notices;
  return (
    <article className={`sx-review is-${review.status}`} style={{ ['--i' as string]: index }} aria-labelledby={`sx-review-${review.id}`}>
      <header className="sx-review-head">
        <span className="sx-review-mark" aria-hidden="true"><Icon size={16} strokeWidth={3} /></span>
        <div className="sx-review-titles">
          <p className="sx-review-kicker">Question {index + 1}{review.type !== 'choice' ? ` · ${questionTypeLabels[review.type]}` : ''}</p>
          <h4 id={`sx-review-${review.id}`}><BilingualText text={view?.prompt ?? reviewPrompt(review) ?? questionTypeLabels[review.type]} /></h4>
        </div>
        <Badge tone={questionReviewStatusTones[review.status]}>{questionReviewStatusLabels[review.status]}</Badge>
      </header>
      <div className="sx-review-body">
        {media && <div className="sx-review-media">{media}</div>}
        <ReviewBody review={review} view={view} />
        <Notices notices={notices} />
        {review.feedback && (
          <p className="sx-feedback"><MessageSquareText size={16} aria-hidden="true" /><span>{review.feedback}</span></p>
        )}
        {review.explanation && (
          <div className="sx-why">
            <span className="sx-why-icon" aria-hidden="true"><Lightbulb size={16} /></span>
            <div><strong>Pourquoi ?</strong><p><BilingualText text={review.explanation} /></p></div>
          </div>
        )}
      </div>
    </article>
  );
}

/** Synthèse et corrigé de chaque question, dans l'ordre de l'exercice. */
/** `media` : supports d'une question (son du modèle, dictée, image) à réécouter ou revoir dans le corrigé. */
export function ExerciseReview({ result, questions, heading = 'Corrigé', media }: {
  result: ExerciseResult; questions?: QuestionView[] | null; heading?: string; media?: (questionId: string) => ReactNode;
}) {
  const views = useMemo(() => new Map((questions ?? []).map((question) => [question.id, asQuestionView(question)])), [questions]);
  const counts = result.questions.reduce<Record<QuestionReviewStatus, number>>((sum, review) => ({ ...sum, [review.status]: sum[review.status] + 1 }),
    { correct: 0, incorrect: 0, pending: 0, flagged: 0 });
  const order = questions?.length ? new Map(questions.map((question, index) => [question.id, index])) : null;
  const reviews = order ? [...result.questions].sort((a, b) => (order.get(a.id) ?? 99) - (order.get(b.id) ?? 99)) : result.questions;
  return (
    <section className="sx-reviews" aria-labelledby="sx-reviews-title">
      <header className="sx-reviews-head">
        <h3 id="sx-reviews-title">{heading}</h3>
        <ul className="sx-reviews-counts">
          {counts.correct > 0 && <li className="is-correct"><Check size={13} strokeWidth={3} aria-hidden="true" /> {counts.correct} juste{counts.correct > 1 ? 's' : ''}</li>}
          {counts.incorrect > 0 && <li className="is-incorrect"><X size={13} strokeWidth={3} aria-hidden="true" /> {counts.incorrect} à corriger</li>}
          {counts.pending > 0 && <li className="is-pending"><Clock3 size={13} aria-hidden="true" /> {counts.pending} en attente</li>}
          {counts.flagged > 0 && <li className="is-flagged"><Flag size={13} aria-hidden="true" /> {counts.flagged} à revoir</li>}
        </ul>
      </header>
      <div className="sx-review-list">
        {reviews.map((review, index) => <ReviewCard key={review.id} review={review} view={views.get(review.id)} index={order?.get(review.id) ?? index} media={media?.(review.id)} />)}
      </div>
    </section>
  );
}

/**
 * Corrigé d'une tentative dans un panneau latéral (résultats de l'élève, fiche du professeur). Sans `questions`, les
 * énoncés d'une tentative de séance sont relus dans la séance quand c'est possible ; à défaut, le corrigé reste lisible
 * (réponses attendues, explications, juste ou faux).
 */
export function ExerciseReviewDrawer({ attemptId, token, onClose, questions = null, title }: {
  attemptId: string; token: string; onClose: () => void; questions?: QuestionView[] | null; title?: string;
}) {
  const [result, setResult] = useState<ExerciseResult | null>(null);
  const [views, setViews] = useState<QuestionView[] | null>(questions);
  const [failure, setFailure] = useState('');
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let active = true;
    setFailure('');
    requestApi<ExerciseResult>(`/assessments/exercises/${encodeURIComponent(attemptId)}`, token).then(async (loaded) => {
      if (!active) return;
      setResult(loaded);
      const { sessionId, activityId } = loaded.grade;
      if (questions || !sessionId || !activityId) return;
      const session = await requestApi<{ activities: { id: string; questions: QuestionView[] }[] }>(`/learning/sessions/${encodeURIComponent(sessionId)}`, token)
        .catch(() => null);
      const found = session?.activities.find((activity) => activity.id === activityId);
      if (active && found) setViews(found.questions.map(asQuestionView));
    }).catch((error: unknown) => { if (active) setFailure(errorText(error)); });
    return () => { active = false; };
  }, [attemptId, token, retry, questions]);

  const grade = result?.grade;
  const percent = grade && grade.total ? Math.round((grade.correct / grade.total) * 100) : 0;
  return (
    <Drawer wide title={title ?? 'Corrigé de l’exercice'} onClose={onClose}
      description={grade ? `Remis le ${dateFormat.format(new Date(grade.submittedAt))}` : undefined}>
      {failure ? (
        <div role="alert"><Callout tone="warning" title="Corrigé indisponible">
          <p>{failure}</p>
          <button type="button" className="btn btn-outline btn-sm" onClick={() => setRetry((value) => value + 1)}><RotateCcw size={15} aria-hidden="true" /> Réessayer</button>
        </Callout></div>
      ) : !result || !grade ? <SkeletonCard lines={5} label="Chargement du corrigé…" /> : (
        <>
          <div className={`sx-drawer-score is-${percent >= 70 ? 'success' : percent >= 50 ? 'brand' : 'accent'}`}>
            <ProgressRing value={percent} size={72} stroke={7} color={`var(--${percent >= 70 ? 'success' : percent >= 50 ? 'brand' : 'accent'})`}
              label={`${grade.correct} bonnes réponses sur ${grade.total}`}>
              <strong className="study-result-score">{grade.correct}<small>/{grade.total}</small></strong>
            </ProgressRing>
            <div>
              <p><strong>{grade.correct} / {grade.total}</strong> bonnes réponses</p>
              {grade.pending > 0 && <p className="is-pending">{grade.pending} réponse{grade.pending > 1 ? 's' : ''} en attente de validation</p>}
              {grade.flagged.length > 0 && <p className="is-flag">{grade.flagged.length} question{grade.flagged.length > 1 ? 's' : ''} à revoir</p>}
            </div>
          </div>
          <ExerciseReview result={result} questions={views} heading="Question par question" />
        </>
      )}
    </Drawer>
  );
}
