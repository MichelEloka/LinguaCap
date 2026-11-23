/**
 * Étape 2 : test de niveau. Introduction (paliers, durée, débutant déclaré), puis une question à la fois par palier
 * (« Palier A1 · Question 3/12 »), document à lire ou enregistrement à écouter, choix en cartes et « Je ne sais pas »,
 * sauvegarde automatique et reprise, remise du palier et passage au palier suivant célébré.
 */
import { useCallback, useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import {
  AlertTriangle, ArrowRight, BookOpen, Check, CircleHelp, ClipboardList, CloudCheck, Flag, Headphones, LoaderCircle, Lock, PartyPopper,
  RotateCcw, Sprout, Timer,
} from 'lucide-react';
import { AudioPlayer, Callout, ProgressRing } from '../../design/kit';
import { requestApi } from '../../integration/api';
import {
  levelLabel, onboardingBlockedMessages, PLACEMENT_DONT_KNOW, placementTierStatusLabels, type LevelCode, type OnboardingState,
  type PlacementQuestion, type PlacementTier, type PlacementView,
} from '../../integration/v2';
import { ChoiceGrid, JourneyActions, JourneyQuestion, JourneyStage, prefersReducedMotion, type ChoiceOption } from '../journey';
import { LessonContent } from '../pilot/LessonContent';
import { errorText, LevelMark, momentText, ofLanguage, theLanguage } from './onboarding-kit';
import { CanvasPortal, useScene } from './onboarding-scene';

type SaveStatus = 'idle' | 'pending' | 'saving' | 'saved' | 'error';

/** « Palier A2 · Survie » (le titre du palier peut déjà contenir le code). */
function tierName(code: string, title?: string | null) {
  if (!title) return `Palier ${code}`;
  return title.startsWith(code) ? `Palier ${title}` : `Palier ${code} · ${title}`;
}
/** « Survie » pour le palier A2 intitulé « A2 · Survie ». */
function tierTitle(code: string, title?: string | null) {
  const text = title?.startsWith(`${code} · `) ? title.slice(code.length + 3) : title ?? '';
  return text || (levelLabel(code).split(' · ')[1] ?? '');
}
const LETTERS = 'ABCDEFGH';
const introTiers: LevelCode[] = ['A1', 'A2', 'B1'];

export function StepPlacement({ token, state, attempt, languageName, onBack, onShowResult, onAttempt, onStarted, onCompleted }: {
  token: string; state: OnboardingState; attempt: PlacementView | null; languageName: string; onBack: () => void; onShowResult: () => void;
  onAttempt: (view: PlacementView) => void; onStarted: (view: PlacementView) => Promise<void>; onCompleted: (view: PlacementView) => Promise<void>;
}) {
  if (attempt?.status === 'in_progress') {
    return <PlacementQuiz key={`${attempt.id}-${attempt.currentTier ?? ''}`} token={token} attempt={attempt} onAttempt={onAttempt} onCompleted={onCompleted} />;
  }
  return (
    <PlacementIntro token={token} state={state} attempt={attempt} languageName={languageName} onBack={onBack} onShowResult={onShowResult}
      onStarted={onStarted} onCompleted={onCompleted} />
  );
}

// ---------------------------------------------------------------------------------------------------------------------
// Introduction
// ---------------------------------------------------------------------------------------------------------------------

function PlacementIntro({ token, state, attempt, languageName, onBack, onShowResult, onStarted, onCompleted }: {
  token: string; state: OnboardingState; attempt: PlacementView | null; languageName: string; onBack: () => void; onShowResult: () => void;
  onStarted: (view: PlacementView) => Promise<void>; onCompleted: (view: PlacementView) => Promise<void>;
}) {
  const { direction } = useScene();
  const [busy, setBusy] = useState<'test' | 'beginner' | null>(null);
  const [error, setError] = useState('');
  const unavailable = state.blockedReason === 'placement_unavailable';
  const completed = attempt?.status === 'completed';
  const retakeOpen = completed && attempt?.retakeAvailableAt ? new Date(attempt.retakeAvailableAt).getTime() <= Date.now() : false;

  async function start(declaredBeginner: boolean) {
    if (busy) return;
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
    { icon: <Timer size={18} />, title: '10 à 25 minutes', text: 'Trois paliers au plus, une question à la fois.' },
    { icon: <Headphones size={18} />, title: 'Lecture et écoute', text: 'Prévoyez des écouteurs : chaque son se réécoute.' },
    { icon: <CircleHelp size={18} />, title: 'Le droit de ne pas savoir', text: 'Mieux vaut l’avouer que deviner : le résultat sera plus juste.' },
    { icon: <CloudCheck size={18} />, title: 'Rien n’est perdu', text: 'Chaque réponse est enregistrée : reprenez quand vous voulez.' },
  ];

  const description = completed
    ? `Terminé le ${momentText(attempt?.completedAt)}.${attempt?.result ? ` Niveau estimé : ${attempt.result.label}.` : ''}`
    : 'Le test avance par paliers, du plus simple au plus exigeant, et s’arrête dès qu’un palier devient trop difficile. Il n’y a rien à préparer.';
  const primary = completed ? 'result' : unavailable ? 'beginner' : 'test';

  return (
    <JourneyStage>
      <JourneyQuestion stepKey={completed ? 'placement-done' : 'placement-intro'} direction={direction} icon={<ClipboardList />}
        eyebrow={`Test de niveau · ${languageName}`}
        title={completed ? 'Votre test est terminé' : `Situons votre niveau ${ofLanguage(languageName)}`} description={description}>
        {!completed && (
          <div className="lo-test-intro">
            <ol className="lo-stairs" aria-label="Paliers du test">
              {introTiers.map((code, index) => (
                <li key={code} className={`lvl-${code}`} style={{ '--step': index } as CSSProperties}>
                  <LevelMark code={code} size="lg" />
                  <span className="lo-stair-text"><strong>Palier {code}</strong><small>{levelLabel(code).split(' · ')[1]}</small></span>
                </li>
              ))}
            </ol>
            <ul className="lo-tips lc-stagger">
              {tips.map((tip) => (
                <li key={tip.title}>
                  <span className="lo-tip-icon" aria-hidden="true">{tip.icon}</span>
                  <span><strong>{tip.title}</strong><small>{tip.text}</small></span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {completed && !retakeOpen && attempt?.retakeAvailableAt && (
          <p className="lo-note"><Timer size={16} aria-hidden="true" /> Un nouvel essai sera possible à partir du {momentText(attempt.retakeAvailableAt)}.</p>
        )}
        {unavailable && !completed && (
          <Callout tone="info" title="Test bientôt disponible">{onboardingBlockedMessages.placement_unavailable} Vous pouvez déjà commencer au début du parcours.</Callout>
        )}
        {error && <div role="alert"><Callout tone="warning" title="Le test n’a pas pu démarrer">{error}</Callout></div>}
        {!completed && !unavailable && (
          <button type="button" className="lo-alt" disabled={busy !== null} onClick={() => void start(true)}>
            <span className="lo-alt-icon" aria-hidden="true">
              {busy === 'beginner' ? <LoaderCircle size={20} className="ob-spin" /> : <Sprout size={20} />}
            </span>
            <span className="lo-alt-text">
              <strong>Je n’ai jamais étudié {theLanguage(languageName)}</strong>
              <small>Pas de test : votre parcours commence au tout début, pas à pas.</small>
            </span>
            <ArrowRight className="lo-alt-arrow" size={18} aria-hidden="true" />
          </button>
        )}
        {completed && retakeOpen && (
          <button type="button" className="lo-alt" disabled={busy !== null} onClick={() => void start(false)}>
            <span className="lo-alt-icon" aria-hidden="true">
              {busy === 'test' ? <LoaderCircle size={20} className="ob-spin" /> : <RotateCcw size={20} />}
            </span>
            <span className="lo-alt-text"><strong>Repasser le test</strong><small>Un nouvel essai remplace le résultat précédent.</small></span>
            <ArrowRight className="lo-alt-arrow" size={18} aria-hidden="true" />
          </button>
        )}
      </JourneyQuestion>
      <JourneyActions onBack={onBack} primaryType="button" busy={primary === 'test' ? busy === 'test' : primary === 'beginner' ? busy === 'beginner' : false}
        disabled={busy !== null}
        onPrimary={() => { if (primary === 'result') onShowResult(); else void start(primary === 'beginner'); }}>
        {primary === 'result' ? <>Voir mon niveau <ArrowRight size={18} aria-hidden="true" /></>
          : primary === 'beginner' ? <><Sprout size={18} aria-hidden="true" /> Commencer au début du parcours</>
          : <>{busy === 'test' ? <LoaderCircle size={18} className="ob-spin" aria-hidden="true" /> : <Flag size={18} aria-hidden="true" />} Commencer le test</>}
      </JourneyActions>
    </JourneyStage>
  );
}

// ---------------------------------------------------------------------------------------------------------------------
// Questions d'un palier
// ---------------------------------------------------------------------------------------------------------------------

function SaveState({ status }: { status: SaveStatus }) {
  const busy = status === 'pending' || status === 'saving';
  const Icon = busy ? LoaderCircle : status === 'error' ? AlertTriangle : CloudCheck;
  const text = busy ? 'Enregistrement…' : status === 'error' ? 'Non enregistré' : status === 'saved' ? 'Réponses enregistrées' : 'Enregistrement automatique';
  return <span className={`lo-save is-${status}`} role="status"><Icon size={14} className={busy ? 'ob-spin' : undefined} aria-hidden="true" />{text}</span>;
}

/** Échelle des paliers : réussis, en cours, à venir. */
function TierLadder({ tiers, current, label = 'Paliers du test' }: { tiers: PlacementTier[]; current: LevelCode | null; label?: string }) {
  return (
    <ol className="lo-ladder" aria-label={label}>
      {tiers.map((tier) => {
        const state = tier.code === current ? 'current' : tier.status;
        return (
          <li key={tier.code} className={`lvl-${tier.code} is-${state}`}>
            <LevelMark code={tier.code} size="sm" state={state === 'passed' ? 'done' : state === 'locked' ? 'locked' : state === 'current' ? 'current' : undefined} />
            <span><strong>Palier {tier.code}<em> · {tierTitle(tier.code, tier.title)}</em></strong>
              <small>{state === 'passed' && tier.percent !== null ? `Réussi · ${tier.percent} %` : placementTierStatusLabels[tier.status === 'current' || state === 'current' ? 'current' : tier.status]}</small></span>
            {state === 'passed' ? <Check size={16} strokeWidth={3} aria-hidden="true" /> : state === 'locked' ? <Lock size={14} aria-hidden="true" /> : null}
          </li>
        );
      })}
    </ol>
  );
}

/**
 * Énoncé d'une question : consigne en français, document allemand à lire (horaires, courriel, annonce…), puis la question.
 * Les paragraphes sont séparés par une ligne vide dans la banque de questions.
 */
function splitPrompt(prompt: string, listening: boolean) {
  const parts = prompt.split(/\n{2,}/).map((part) => part.trim()).filter(Boolean);
  const instruction = parts.length > 1 ? parts[0] : null;
  const document = parts.length > 2 ? parts.slice(1, -1).join('\n\n') : parts.length === 2 && !listening ? parts[1] : null;
  const question = parts.length > 2 ? parts[parts.length - 1] : parts.length === 2 ? (listening ? parts[1] : null) : parts[0] ?? '';
  return question ? { title: question, description: instruction, document } : { title: instruction ?? prompt, description: null, document };
}

function QuestionMedia({ question, onRenew }: { question: PlacementQuestion; onRenew: () => void }) {
  if (!question.placements.length) return null;
  return (
    <div className="lo-media">
      {[...question.placements].sort((a, b) => a.position - b.position).map((placement) => {
        if (!placement.url) {
          return (
            <p key={placement.position} className="lo-media-missing" role="alert">
              <AlertTriangle size={16} aria-hidden="true" /> {placement.usage === 'audio' ? 'Le son' : 'L’image'} n’a pas pu être chargé.
              <button type="button" className="btn btn-outline btn-sm" onClick={onRenew}><RotateCcw size={14} aria-hidden="true" /> Réessayer</button>
            </p>
          );
        }
        return placement.usage === 'audio' ? (
          <div key={placement.position} className="lo-listen">
            <span className="lo-listen-wave" aria-hidden="true">
              {Array.from({ length: 18 }, (_, bar) => <i key={bar} style={{ '--b': bar } as CSSProperties} />)}
            </span>
            <span className="lo-listen-label" aria-hidden="true"><Headphones size={15} /> Écoutez, autant de fois que nécessaire</span>
            <AudioPlayer src={placement.url} title={placement.caption ?? placement.alt ?? 'Écoutez l’enregistrement'} onError={onRenew} />
          </div>
        ) : (
          <figure key={placement.position} className="lo-figure">
            <img src={placement.url} alt={placement.alt ?? ''} />
            {placement.caption && <figcaption>{placement.caption}</figcaption>}
          </figure>
        );
      })}
    </div>
  );
}

/** Document à lire, présenté comme un vrai document (affiche, courriel, annonce…). */
function ReadingDocument({ text }: { text: string }) {
  return (
    <div className="lo-doc" lang="de"><LessonContent text={text} compact /></div>
  );
}

function PlacementQuiz({ token, attempt, onAttempt, onCompleted }: {
  token: string; attempt: PlacementView; onAttempt: (view: PlacementView) => void; onCompleted: (view: PlacementView) => Promise<void>;
}) {
  const { direction: sceneDirection } = useScene();
  const tier = attempt.currentTier ?? attempt.tiers.find((item) => item.status === 'current')?.code ?? 'A1';
  const questions = attempt.questions;
  const titleId = useId();
  const [answers, setAnswers] = useState<Record<string, string>>(() => ({ ...attempt.savedAnswers }));
  const [index, setIndex] = useState(() => Math.max(0, questions.findIndex((question) => !attempt.savedAnswers[question.id])));
  const [direction, setDirection] = useState<'next' | 'prev'>('next');
  const [phase, setPhase] = useState<'in' | 'out'>('in');
  const [save, setSave] = useState<SaveStatus>('idle');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [passed, setPassed] = useState<{ tier: PlacementTier; next: PlacementView } | null>(null);
  const timer = useRef<number | undefined>(undefined);
  const advanceTimer = useRef<number | undefined>(undefined);
  const swapTimer = useRef<number | undefined>(undefined);
  const pending = useRef<number | null>(null);
  const pointer = useRef(false);
  const submitKey = useRef<string | null>(null);
  const container = useRef<HTMLDivElement>(null);
  const moved = useRef(false);

  const total = questions.length;
  const question = questions[Math.min(index, total - 1)];
  const answered = questions.filter((item) => answers[item.id]).length;
  const firstMissing = questions.findIndex((item) => !answers[item.id]);
  const last = index === total - 1;
  const tierInfo = attempt.tiers.find((item) => item.code === tier);

  useEffect(() => () => {
    window.clearTimeout(timer.current);
    window.clearTimeout(advanceTimer.current);
    window.clearTimeout(swapTimer.current);
  }, []);

  // Après un changement de question : focus sur l'énoncé (lecteurs d'écran, clavier) et retour en haut de la scène.
  useEffect(() => {
    if (!moved.current) return;
    moved.current = false;
    document.getElementById(titleId)?.focus({ preventScroll: true });
    const scroller = container.current?.closest('.jy-scene-scroll');
    if (scroller && scroller.scrollTop > 0) scroller.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
  }, [index, titleId]);

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

  /** La question sortante monte et s'efface, puis l'entrante arrive du bas (l'inverse en revenant en arrière). */
  function goTo(target: number) {
    if (target < 0 || target >= total || target === index) return;
    window.clearTimeout(advanceTimer.current);
    setDirection(target < index ? 'prev' : 'next');
    if (prefersReducedMotion()) {
      moved.current = true;
      setIndex(target);
      return;
    }
    pending.current = target;
    setPhase('out');
    window.clearTimeout(swapTimer.current);
    swapTimer.current = window.setTimeout(() => {
      const next = pending.current;
      pending.current = null;
      if (next === null) return;
      moved.current = true;
      setIndex(next);
      setPhase('in');
    }, 190);
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

  if (passed) return <TierPassed passed={passed} onNext={() => onAttempt(passed.next)} />;

  if (!question) {
    return (
      <JourneyStage>
        <JourneyQuestion stepKey="quiz-empty" direction={sceneDirection} eyebrow={tierName(tier, tierInfo?.title)} title="Aucune question pour ce palier"
          description="Ce palier ne contient pas de question. Réessayez plus tard." />
      </JourneyStage>
    );
  }

  const chosen = answers[question.id] ?? null;
  const listening = question.competence === 'ecoute';
  const prompt = splitPrompt(question.prompt, listening);
  const short = question.options.every((option) => option.text.length <= 26);
  const options: ChoiceOption<string>[] = [
    ...question.options.map((option, position) => ({
      value: option.id, title: <span lang="de">{option.text}</span>, icon: <span className="lo-letter">{LETTERS[position] ?? position + 1}</span>,
    })),
    { value: PLACEMENT_DONT_KNOW, title: 'Je ne sais pas', icon: <CircleHelp /> },
  ];
  const swap = (content: ReactNode) => <span key={question.id} className="lo-swap">{content}</span>;
  const complete = last || answered === total;

  return (
    <JourneyStage className="lo-quiz">
      <div className="lo-quiz-head" ref={container}>
        <div className="lo-quiz-row">
          <p className={`lo-quiz-tier lvl-${tier}`}><LevelMark code={tier} size="sm" state="current" /><span>{tierName(tier, tierInfo?.title)}</span></p>
          <p className="pt-count" aria-live="polite">Question <strong>{index + 1}</strong>/{total}</p>
        </div>
        <ol className="lo-quiz-bar" aria-label="Questions du palier" style={{ '--n': total } as CSSProperties}>
          {questions.map((item, position) => (
            <li key={item.id}>
              <button type="button" onClick={() => goTo(position)} aria-current={position === index ? 'step' : undefined}
                className={answers[item.id] ? (answers[item.id] === PLACEMENT_DONT_KNOW ? 'is-unsure' : 'is-done') : undefined}
                aria-label={`Question ${position + 1}${answers[item.id] ? ', répondue' : ''}`} />
            </li>
          ))}
        </ol>
        <SaveState status={save} />
      </div>

      <JourneyQuestion stepKey={`quiz-${tier}`} direction={sceneDirection} titleId={titleId}
        className={`lo-quiz-q is-${phase} is-${direction}`}
        eyebrow={swap(<span className={`lo-skill is-${question.competence}`}>
          {listening ? <Headphones size={14} aria-hidden="true" /> : <BookOpen size={14} aria-hidden="true" />}{listening ? 'Écoute' : 'Lecture'}
        </span>)}
        title={swap(<><span className="sr-only">Question {index + 1} sur {total} : </span>{prompt.title}</>)}
        description={prompt.description ? swap(prompt.description) : undefined}>
        <div key={question.id} className="lo-swap lo-quiz-body">
          <QuestionMedia question={question} onRenew={() => void renew()} />
          {prompt.document && <ReadingDocument text={prompt.document} />}
          <div className="lo-choices" onPointerDown={() => { pointer.current = true; }} onKeyDown={() => { pointer.current = false; }}>
            <ChoiceGrid legend="Votre réponse" hideLegend options={options} value={chosen} onChange={choose} columns={short ? 2 : 1} />
          </div>
        </div>
        {error && <div role="alert"><Callout tone="warning" title="Remise impossible pour le moment">{error}</Callout></div>}
      </JourneyQuestion>

      <JourneyActions onBack={() => goTo(index - 1)} backLabel="Précédent" backDisabled={index === 0} primaryType="button" busy={busy}
        hint={complete ? undefined : <><kbd>1</kbd>–<kbd>{options.length}</kbd> pour répondre</>}
        onPrimary={() => { if (complete) void submit(); else goTo(index + 1); }}>
        {complete
          ? <>{busy ? <LoaderCircle size={18} className="ob-spin" aria-hidden="true" /> : <Check size={18} aria-hidden="true" />}
            {firstMissing >= 0 ? `${total - answered} sans réponse` : busy ? 'Correction…' : `Valider le palier ${tier}`}</>
          : <>Suivant <ArrowRight size={18} aria-hidden="true" /></>}
      </JourneyActions>

      <CanvasPortal>
        <aside className="lo-testcard" aria-label="Avancement du test">
          <div className="lo-testcard-ring">
            <ProgressRing value={total ? (answered / total) * 100 : 0} size={76} stroke={7} color="var(--brand-100)" label={`${answered} réponses sur ${total}`}>
              <span className="lo-testcard-score">{answered}<small>/{total}</small></span>
            </ProgressRing>
            <span><strong>{answered === total ? 'Palier complet' : `${total - answered} question${total - answered > 1 ? 's' : ''} restante${total - answered > 1 ? 's' : ''}`}</strong>
              <small>{answered === total ? 'Validez pour connaître la suite.' : 'Dans l’ordre que vous voulez.'}</small></span>
          </div>
          <TierLadder tiers={attempt.tiers} current={tier} label="Paliers du test, avancement" />
          <p className="lo-testcard-tip"><CircleHelp size={15} aria-hidden="true" /> Une réponse au hasard fausse le résultat : préférez « Je ne sais pas ».</p>
        </aside>
      </CanvasPortal>
    </JourneyStage>
  );
}

/** Palier réussi : médaille du score, échelle des paliers et passage au palier suivant. */
function TierPassed({ passed, onNext }: { passed: { tier: PlacementTier; next: PlacementView }; onNext: () => void }) {
  const { direction } = useScene();
  const nextCode = passed.next.currentTier ?? 'A2';
  const nextTier = passed.next.tiers.find((item) => item.code === nextCode);
  const score = passed.tier.percent ?? 0;
  return (
    <JourneyStage className="lo-passed">
      <JourneyQuestion stepKey={`passed-${passed.tier.code}`} direction={direction} icon={<PartyPopper />} eyebrow={`Palier ${passed.tier.code} validé`}
        title={`Bravo, vous passez au palier ${nextCode}`}
        description={<>{passed.tier.correct !== null && passed.tier.total !== null ? `${passed.tier.correct} bonnes réponses sur ${passed.tier.total}. ` : ''}
          Le {tierName(nextCode, nextTier?.title).replace('Palier', 'palier')} est un peu plus exigeant : prenez votre temps, et n’hésitez pas à dire que vous ne savez pas.</>}>
        <div className="lo-tierup">
          <div className={`lo-medal lvl-${passed.tier.code}`} aria-hidden="true">
            <span className="lo-medal-rays">{Array.from({ length: 12 }, (_, ray) => <i key={ray} style={{ '--r': ray } as CSSProperties} />)}</span>
            <ProgressRing value={score} size={132} stroke={10} color="var(--success)">
              <span className="lo-medal-score"><strong>{score}<small> %</small></strong><em>Palier {passed.tier.code}</em></span>
            </ProgressRing>
          </div>
          <TierLadder tiers={passed.next.tiers} current={passed.next.currentTier} />
        </div>
      </JourneyQuestion>
      <JourneyActions primaryType="button" onPrimary={onNext}>
        Commencer le palier {nextCode} <ArrowRight size={18} aria-hidden="true" />
      </JourneyActions>
    </JourneyStage>
  );
}
