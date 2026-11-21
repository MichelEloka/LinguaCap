/**
 * Étape 2 : test de niveau. Introduction (paliers, durée, débutant déclaré), puis une question à la fois par palier
 * (« Palier A1 · 3/12 »), son pour l'écoute, choix « Je ne sais pas », sauvegarde automatique et reprise, remise du
 * palier et transition vers le palier suivant.
 */
import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react';
import {
  AlertTriangle, ArrowLeft, ArrowRight, BookOpen, Check, CircleHelp, CloudCheck, Flag, Headphones, LoaderCircle, Lock, PartyPopper,
  RotateCcw, Sprout, Timer,
} from 'lucide-react';
import { AudioPlayer, Callout, ProgressRing } from '../../design/kit';
import { requestApi } from '../../integration/api';
import {
  levelLabel, onboardingBlockedMessages, PLACEMENT_DONT_KNOW, placementTierStatusLabels, type LevelCode, type OnboardingState,
  type PlacementQuestion, type PlacementTier, type PlacementView,
} from '../../integration/v2';
import { LessonContent } from '../pilot/LessonContent';
import { errorText, LevelMark, momentText, ofLanguage, theLanguage } from './onboarding-kit';

type SaveStatus = 'idle' | 'pending' | 'saving' | 'saved' | 'error';

/** « Palier A2 · Survie » (le titre du palier peut déjà contenir le code). */
function tierName(code: string, title?: string | null) {
  if (!title) return `Palier ${code}`;
  return title.startsWith(code) ? `Palier ${title}` : `Palier ${code} · ${title}`;
}
const LETTERS = 'ABCDEFGH';
const introTiers: LevelCode[] = ['A1', 'A2', 'B1'];

export function StepPlacement({ token, state, attempt, languageName, onAttempt, onStarted, onCompleted }: {
  token: string; state: OnboardingState; attempt: PlacementView | null; languageName: string;
  onAttempt: (view: PlacementView) => void; onStarted: (view: PlacementView) => Promise<void>; onCompleted: (view: PlacementView) => Promise<void>;
}) {
  if (attempt?.status === 'in_progress') {
    return <PlacementQuiz key={`${attempt.id}-${attempt.currentTier ?? ''}`} token={token} attempt={attempt} onAttempt={onAttempt} onCompleted={onCompleted} />;
  }
  return <PlacementIntro token={token} state={state} attempt={attempt} languageName={languageName} onStarted={onStarted} onCompleted={onCompleted} />;
}

// ---------------------------------------------------------------------------------------------------------------------
// Introduction
// ---------------------------------------------------------------------------------------------------------------------

function PlacementIntro({ token, state, attempt, languageName, onStarted, onCompleted }: {
  token: string; state: OnboardingState; attempt: PlacementView | null; languageName: string;
  onStarted: (view: PlacementView) => Promise<void>; onCompleted: (view: PlacementView) => Promise<void>;
}) {
  const [busy, setBusy] = useState<'test' | 'beginner' | null>(null);
  const [error, setError] = useState('');
  const unavailable = state.blockedReason === 'placement_unavailable';
  const completed = attempt?.status === 'completed';
  const retakeOpen = completed && attempt?.retakeAvailableAt ? new Date(attempt.retakeAvailableAt).getTime() <= Date.now() : false;

  async function start(declaredBeginner: boolean) {
    setBusy(declaredBeginner ? 'beginner' : 'test');
    setError('');
    try {
      const view = await requestApi<PlacementView>('/assessments/placements', token, {
        method: 'POST',
        body: { languageId: state.languageId ?? undefined, ...(declaredBeginner ? { declaredBeginner: true } : {}), ...(completed ? { restart: true } : {}) },
      });
      if (view.status === 'completed') await onCompleted(view);
      else await onStarted(view);
    } catch (failure) {
      setError(errorText(failure));
      setBusy(null);
    }
  }

  const tips = [
    { icon: <Timer size={18} />, title: '10 à 25 minutes', text: '12 questions par palier, trois paliers au plus.' },
    { icon: <Headphones size={18} />, title: 'Lecture et écoute', text: 'Prévoyez des écouteurs : chaque son se réécoute à volonté.' },
    { icon: <CircleHelp size={18} />, title: '« Je ne sais pas »', text: 'Mieux vaut l’avouer que deviner : le résultat sera plus juste.' },
    { icon: <CloudCheck size={18} />, title: 'Rien n’est perdu', text: 'Vos réponses sont enregistrées : reprenez quand vous voulez.' },
  ];

  return (
    <section className="ob-test-intro" aria-labelledby="ob-test-title">
      <div className="pt-hero">
        <div className="pt-hero-copy">
          <p className="pt-hero-eyebrow">Test de niveau · {languageName}</p>
          <h2 id="ob-test-title">{completed ? 'Votre test est terminé' : `Situons votre niveau ${ofLanguage(languageName)}`}</h2>
          <p className="pt-hero-text">{completed
            ? `Terminé le ${momentText(attempt?.completedAt)}. ${attempt?.result ? `Niveau estimé : ${attempt.result.label}.` : ''}`
            : 'Le test avance par paliers, du plus simple au plus exigeant, et s’arrête dès qu’un palier devient trop difficile. Il n’y a rien à préparer.'}</p>
          <div className="pt-hero-actions">
            {completed ? (
              <>
                {retakeOpen && <button type="button" className="btn btn-lg pt-hero-primary" disabled={busy !== null} onClick={() => void start(false)}>
                  {busy === 'test' ? <LoaderCircle size={18} className="ob-spin" aria-hidden="true" /> : <RotateCcw size={18} aria-hidden="true" />} Repasser le test</button>}
                {!retakeOpen && attempt?.retakeAvailableAt && <p className="pt-hero-note">Un nouvel essai sera possible à partir du {momentText(attempt.retakeAvailableAt)}.</p>}
              </>
            ) : (
              <>
                {!unavailable && (
                  <button type="button" className="btn btn-lg pt-hero-primary" disabled={busy !== null} onClick={() => void start(false)}>
                    {busy === 'test' ? <LoaderCircle size={18} className="ob-spin" aria-hidden="true" /> : <Flag size={18} aria-hidden="true" />} Commencer le test
                  </button>
                )}
                <button type="button" className="btn btn-lg pt-hero-secondary" disabled={busy !== null} onClick={() => void start(true)}>
                  {busy === 'beginner' ? <LoaderCircle size={18} className="ob-spin" aria-hidden="true" /> : <Sprout size={18} aria-hidden="true" />}
                  Je n’ai jamais étudié {theLanguage(languageName)}
                </button>
              </>
            )}
          </div>
        </div>
        <ol className="pt-stairs" aria-label="Paliers du test">
          {introTiers.map((code, index) => (
            <li key={code} style={{ ['--step' as string]: index }}>
              <LevelMark code={code} size="lg" />
              <span><strong>Palier {code}</strong><small>{levelLabel(code).split(' · ')[1]}</small></span>
            </li>
          ))}
        </ol>
      </div>
      {unavailable && <Callout tone="info" title="Test bientôt disponible">{onboardingBlockedMessages.placement_unavailable} Vous pouvez déjà commencer au début du parcours.</Callout>}
      {error && <div role="alert"><Callout tone="warning" title="Le test n’a pas pu démarrer">{error}</Callout></div>}
      {!completed && (
        <ul className="pt-tips lc-stagger">
          {tips.map((tip) => (
            <li key={tip.title}><span className="pt-tip-icon" aria-hidden="true">{tip.icon}</span><div><strong>{tip.title}</strong><small>{tip.text}</small></div></li>
          ))}
        </ul>
      )}
    </section>
  );
}

// ---------------------------------------------------------------------------------------------------------------------
// Questions d'un palier
// ---------------------------------------------------------------------------------------------------------------------

function SaveState({ status }: { status: SaveStatus }) {
  const busy = status === 'pending' || status === 'saving';
  const Icon = busy ? LoaderCircle : status === 'error' ? AlertTriangle : CloudCheck;
  const text = busy ? 'Enregistrement…' : status === 'error' ? 'Non enregistré' : status === 'saved' ? 'Réponses enregistrées' : 'Enregistrement automatique';
  return <span className={`pt-save is-${status}`} role="status"><Icon size={14} className={busy ? 'ob-spin' : undefined} aria-hidden="true" />{text}</span>;
}

function TierLadder({ tiers, current }: { tiers: PlacementTier[]; current: LevelCode | null }) {
  return (
    <ol className="pt-ladder" aria-label="Paliers du test">
      {tiers.map((tier) => {
        const state = tier.code === current ? 'current' : tier.status;
        return (
          <li key={tier.code} className={`is-${state}`}>
            <LevelMark code={tier.code} size="sm" state={state === 'passed' ? 'done' : state === 'locked' ? 'locked' : state === 'current' ? 'current' : undefined} />
            <span><strong>{tierName(tier.code, tier.title)}</strong>
              <small>{state === 'passed' && tier.percent !== null ? `Réussi · ${tier.percent} %` : placementTierStatusLabels[tier.status === 'current' || state === 'current' ? 'current' : tier.status]}</small></span>
            {state === 'passed' ? <Check size={16} strokeWidth={3} aria-hidden="true" /> : state === 'locked' ? <Lock size={14} aria-hidden="true" /> : null}
          </li>
        );
      })}
    </ol>
  );
}

/**
 * Énoncé d'une question : consigne en français, document allemand à lire (horaires, courriel, annonce…) présenté comme
 * un document, puis la question. Les paragraphes sont séparés par une ligne vide dans la banque de questions.
 */
function PromptBlock({ prompt, listening }: { prompt: string; listening: boolean }) {
  const parts = prompt.split(/\n{2,}/).map((part) => part.trim()).filter(Boolean);
  const instruction = parts.length > 1 ? parts[0] : null;
  const document = parts.length > 2 ? parts.slice(1, -1).join('\n\n') : parts.length === 2 && !listening ? parts[1] : null;
  const question = parts.length > 2 ? parts[parts.length - 1] : parts.length === 2 ? (listening ? parts[1] : null) : parts[0];
  return (
    <>
      {instruction && <p className={question ? 'pt-instruction' : 'pt-question'}>{instruction}</p>}
      {document && <div className="pt-document" lang="de"><LessonContent text={document} compact /></div>}
      {question && <p className="pt-question">{question}</p>}
    </>
  );
}

function QuestionMedia({ question, onRenew }: { question: PlacementQuestion; onRenew: () => void }) {
  if (!question.placements.length) return null;
  return (
    <div className="pt-media">
      {[...question.placements].sort((a, b) => a.position - b.position).map((placement) => {
        if (!placement.url) {
          return (
            <p key={placement.position} className="pt-media-missing" role="alert">
              <AlertTriangle size={16} aria-hidden="true" /> {placement.usage === 'audio' ? 'Le son' : 'L’image'} n’a pas pu être chargé.
              <button type="button" className="btn btn-outline btn-sm" onClick={onRenew}><RotateCcw size={14} aria-hidden="true" /> Réessayer</button>
            </p>
          );
        }
        return placement.usage === 'audio'
          ? <AudioPlayer key={placement.position} src={placement.url} title={placement.caption ?? placement.alt ?? 'Écoutez l’enregistrement'} onError={onRenew} />
          : (
            <figure key={placement.position} className="pt-figure">
              <img src={placement.url} alt={placement.alt ?? ''} />
              {placement.caption && <figcaption>{placement.caption}</figcaption>}
            </figure>
          );
      })}
    </div>
  );
}

function PlacementQuiz({ token, attempt, onAttempt, onCompleted }: {
  token: string; attempt: PlacementView; onAttempt: (view: PlacementView) => void; onCompleted: (view: PlacementView) => Promise<void>;
}) {
  const tier = attempt.currentTier ?? attempt.tiers.find((item) => item.status === 'current')?.code ?? 'A1';
  const questions = attempt.questions;
  const [answers, setAnswers] = useState<Record<string, string>>(() => ({ ...attempt.savedAnswers }));
  const [index, setIndex] = useState(() => Math.max(0, questions.findIndex((question) => !attempt.savedAnswers[question.id])));
  const [direction, setDirection] = useState<'next' | 'prev'>('next');
  const [save, setSave] = useState<SaveStatus>('idle');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [passed, setPassed] = useState<{ tier: PlacementTier; next: PlacementView } | null>(null);
  const timer = useRef<number | undefined>(undefined);
  const advanceTimer = useRef<number | undefined>(undefined);
  const pointer = useRef(false);
  const submitKey = useRef<string | null>(null);
  const card = useRef<HTMLElement>(null);
  const moved = useRef(false);

  const total = questions.length;
  const question = questions[Math.min(index, total - 1)];
  const answered = questions.filter((item) => answers[item.id]).length;
  const firstMissing = questions.findIndex((item) => !answers[item.id]);
  const last = index === total - 1;
  const tierInfo = attempt.tiers.find((item) => item.code === tier);

  useEffect(() => () => { window.clearTimeout(timer.current); window.clearTimeout(advanceTimer.current); }, []);

  // Après un changement de question : le focus va sur l'énoncé (lecteurs d'écran, clavier).
  useEffect(() => {
    if (!moved.current) return;
    moved.current = false;
    card.current?.querySelector<HTMLElement>('[data-pt-focus]')?.focus({ preventScroll: true });
    if (card.current && card.current.getBoundingClientRect().top < 64) card.current.scrollIntoView({ block: 'start', behavior: 'smooth' });
  }, [index]);

  const persist = useCallback((next: Record<string, string>) => {
    window.clearTimeout(timer.current);
    setSave('pending');
    timer.current = window.setTimeout(() => {
      setSave('saving');
      requestApi<PlacementView>(`/assessments/placements/${encodeURIComponent(attempt.id)}/answers`, token, {
        method: 'PUT', body: { tier, answers: next },
      }).then(() => setSave('saved')).catch(() => setSave('error'));
    }, 600);
  }, [attempt.id, tier, token]);

  function goTo(target: number) {
    if (target < 0 || target >= total || target === index) return;
    window.clearTimeout(advanceTimer.current);
    setDirection(target < index ? 'prev' : 'next');
    moved.current = true;
    setIndex(target);
  }

  function choose(optionId: string) {
    const viaPointer = pointer.current;
    pointer.current = false;
    submitKey.current = null;
    const next = { ...answers, [question.id]: optionId };
    setAnswers(next);
    setError('');
    persist(next);
    // Au toucher ou à la souris, la question suivante arrive d'elle-même ; au clavier, l'élève avance avec « Suivant ».
    if (viaPointer && !last) {
      window.clearTimeout(advanceTimer.current);
      advanceTimer.current = window.setTimeout(() => goTo(index + 1), 420);
    }
  }

  async function renew() {
    try { onAttempt(await requestApi<PlacementView>(`/assessments/placements/${encodeURIComponent(attempt.id)}`, token)); } catch { /* le message reste affiché */ }
  }

  async function submit() {
    if (busy) return;
    if (firstMissing >= 0) { goTo(firstMissing); return; }
    setBusy(true);
    setError('');
    window.clearTimeout(timer.current);
    submitKey.current ??= crypto.randomUUID();
    try {
      const view = await requestApi<PlacementView>(`/assessments/placements/${encodeURIComponent(attempt.id)}/submit`, token, {
        method: 'POST', body: { tier, answers }, idempotencyKey: submitKey.current,
      });
      submitKey.current = null;
      if (view.status === 'completed') { await onCompleted(view); return; }
      const result = view.tiers.find((item) => item.code === tier);
      if (result && view.currentTier && view.currentTier !== tier) setPassed({ tier: result, next: view });
      else onAttempt(view);
      setBusy(false);
    } catch (failure) {
      setError(errorText(failure));
      setBusy(false);
    }
  }

  function keyboard(event: KeyboardEvent<HTMLElement>) {
    if (event.key === 'Enter' && answers[question.id] && !(event.target instanceof HTMLButtonElement)) {
      event.preventDefault();
      if (last) void submit(); else goTo(index + 1);
    }
  }

  if (passed) {
    const nextTier = passed.next.tiers.find((item) => item.code === passed.next.currentTier);
    return (
      <section className="pt-passed" aria-labelledby="pt-passed-title">
        <div className="pt-passed-medal" aria-hidden="true">
          {Array.from({ length: 6 }, (_, spark) => <span key={spark} className={`pt-spark is-${spark + 1}`} />)}
          <ProgressRing value={passed.tier.percent ?? 100} size={128} stroke={10} color="var(--success)" label={`${passed.tier.percent ?? 0} % de bonnes réponses`}>
            <span className="pt-passed-score"><strong>{passed.tier.percent ?? 0}<small> %</small></strong></span>
          </ProgressRing>
        </div>
        <p className="pt-passed-kicker"><PartyPopper size={16} aria-hidden="true" /> Palier {passed.tier.code} validé</p>
        <h2 id="pt-passed-title" tabIndex={-1}>Bravo, vous passez au palier {passed.next.currentTier}</h2>
        <p className="pt-passed-text">
          {passed.tier.correct !== null && passed.tier.total !== null ? `${passed.tier.correct} bonnes réponses sur ${passed.tier.total}. ` : ''}
          Le {tierName(passed.next.currentTier ?? 'A2', nextTier?.title).replace('Palier', 'palier')} est un peu plus exigeant : prenez votre temps, et n’hésitez pas à répondre « Je ne sais pas ».
        </p>
        <TierLadder tiers={passed.next.tiers} current={passed.next.currentTier} />
        <button type="button" className="btn btn-primary btn-lg" autoFocus onClick={() => { onAttempt(passed.next); }}>
          Commencer le palier {passed.next.currentTier} <ArrowRight size={18} aria-hidden="true" />
        </button>
      </section>
    );
  }

  if (!question) return <Callout tone="warning" title="Aucune question">Ce palier ne contient pas de question. Réessayez plus tard.</Callout>;
  const chosen = answers[question.id];
  const listening = question.competence === 'ecoute';

  return (
    <div className="pt">
      <div className="pt-main">
        <div className="pt-top">
          <div className="pt-top-row">
            <p className="pt-tier"><LevelMark code={tier} size="sm" state="current" /> <span>{tierName(tier, tierInfo?.title)}</span></p>
            <p className="pt-count" aria-live="polite"><strong>{index + 1}</strong>/{total}</p>
          </div>
          <ol className="pt-dots" aria-label="Questions du palier">
            {questions.map((item, position) => (
              <li key={item.id}>
                <button type="button" onClick={() => goTo(position)} aria-current={position === index ? 'step' : undefined}
                  className={answers[item.id] ? (answers[item.id] === PLACEMENT_DONT_KNOW ? 'is-unsure' : 'is-done') : undefined}
                  aria-label={`Question ${position + 1}${answers[item.id] ? ', répondue' : ''}`} />
              </li>
            ))}
          </ol>
        </div>

        <article ref={card} key={question.id} className={`pt-card is-${direction}`} aria-labelledby={`pt-q-${question.id}`} onKeyDown={keyboard}>
          <p className={`pt-skill is-${question.competence}`}>
            {listening ? <Headphones size={15} aria-hidden="true" /> : <BookOpen size={15} aria-hidden="true" />}
            {listening ? 'Écoute' : 'Lecture'}
          </p>
          <QuestionMedia question={question} onRenew={() => void renew()} />
          <div className="pt-prompt" id={`pt-q-${question.id}`} tabIndex={-1} data-pt-focus>
            <span className="sr-only">Question {index + 1} sur {total} : </span>
            <PromptBlock prompt={question.prompt} listening={listening} />
          </div>
          <div className="pt-options" role="radiogroup" aria-labelledby={`pt-q-${question.id}`}>
            {question.options.map((option, position) => (
              <label key={option.id} className={`pt-option${chosen === option.id ? ' is-checked' : ''}`} onPointerDown={() => { pointer.current = true; }}>
                <input type="radio" name={`pt-${question.id}`} value={option.id} checked={chosen === option.id}
                  onKeyDown={() => { pointer.current = false; }} onChange={() => choose(option.id)} />
                <span className="pt-option-key" aria-hidden="true">{LETTERS[position] ?? position + 1}</span>
                <span className="pt-option-text" lang="de">{option.text}</span>
                <span className="pt-option-tick" aria-hidden="true"><Check size={14} strokeWidth={3} /></span>
              </label>
            ))}
            <label className={`pt-option is-unsure${chosen === PLACEMENT_DONT_KNOW ? ' is-checked' : ''}`} onPointerDown={() => { pointer.current = true; }}>
              <input type="radio" name={`pt-${question.id}`} value={PLACEMENT_DONT_KNOW} checked={chosen === PLACEMENT_DONT_KNOW}
                onKeyDown={() => { pointer.current = false; }} onChange={() => choose(PLACEMENT_DONT_KNOW)} />
              <span className="pt-option-key" aria-hidden="true"><CircleHelp size={16} /></span>
              <span className="pt-option-text">Je ne sais pas</span>
              <span className="pt-option-tick" aria-hidden="true"><Check size={14} strokeWidth={3} /></span>
            </label>
          </div>
        </article>

        {error && <div role="alert"><Callout tone="warning" title="Remise impossible pour le moment">{error}</Callout></div>}

        <nav className="pt-nav" aria-label="Navigation dans le palier">
          <button type="button" className="btn btn-ghost" onClick={() => goTo(index - 1)} disabled={index === 0}>
            <ArrowLeft size={18} aria-hidden="true" /> Précédent
          </button>
          <SaveState status={save} />
          {last || answered === total ? (
            <button type="button" className="btn btn-primary" onClick={() => void submit()} disabled={busy}>
              {busy ? <LoaderCircle size={18} className="ob-spin" aria-hidden="true" /> : <Check size={18} aria-hidden="true" />}
              {firstMissing >= 0 ? `${total - answered} sans réponse` : busy ? 'Correction…' : `Valider le palier ${tier}`}
            </button>
          ) : (
            <button type="button" className={`btn ${chosen ? 'btn-primary' : 'btn-outline'}`} onClick={() => goTo(index + 1)}>
              Suivant <ArrowRight size={18} aria-hidden="true" />
            </button>
          )}
        </nav>
      </div>

      <aside className="pt-side" aria-label="Avancement du test">
        <div className="pt-side-card">
          <ProgressRing value={total ? (answered / total) * 100 : 0} size={64} stroke={7} label={`${answered} réponses sur ${total}`}>
            <span className="pt-side-ring">{answered}/{total}</span>
          </ProgressRing>
          <div><strong>{answered === total ? 'Palier complet' : `${total - answered} question${total - answered > 1 ? 's' : ''} restante${total - answered > 1 ? 's' : ''}`}</strong>
            <small>{answered === total ? 'Validez pour connaître la suite.' : 'Répondez dans l’ordre que vous voulez.'}</small></div>
        </div>
        <TierLadder tiers={attempt.tiers} current={tier} />
        <p className="pt-side-tip"><CircleHelp size={15} aria-hidden="true" /> « Je ne sais pas » compte comme une erreur, mais rend le résultat plus juste qu’une réponse au hasard.</p>
      </aside>
    </div>
  );
}
