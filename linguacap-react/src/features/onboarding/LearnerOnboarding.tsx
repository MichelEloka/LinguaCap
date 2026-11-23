/**
 * Accueil de l'élève en sept étapes (/espace/accueil/<étape>) : langue, test de niveau, niveau annoncé, objectif et durée,
 * jours d'étude, planning multi-niveaux, départ. Plein écran au-dessus de l'espace (cadre « Le souffle » de
 * features/journey) : la toile du voyage et son chemin à gauche, la scène de chaque étape à droite.
 * L'état vient de GET /learning/onboarding ; chaque étape garde son adresse pour reprendre là où l'élève s'est arrêté
 * et revenir sur une étape terminée.
 */
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import {
  CalendarDays, CalendarRange, ClipboardList, Gauge, Languages, LibraryBig, LogOut, MessageCircle, Rocket, RotateCcw, Target,
} from 'lucide-react';
import { Callout } from '../../design/kit';
import { requestApi, supabase } from '../../integration/api';
import { languages as staticLanguages, languageName } from '../../domain/languages';
import {
  onboardingStepLabels, type Day, type Language, type OnboardingState, type OnboardingStepId, type PathProposal, type PathView, type PlacementView,
} from '../../integration/v2';
import { JourneyMark, JourneyShell, JourneyStage, prefersReducedMotion, type JourneyDirection, type JourneyStep } from '../journey';
import { errorText } from './onboarding-kit';
import { JourneyCarnet, LeaveLink, SceneContext, SceneTransition, type CarnetData } from './onboarding-scene';
import { StepLanguage } from './step-language';
import { StepPlacement } from './step-placement';
import { StepResult } from './step-result';
import { StepObjective } from './step-objective';
import { StepDays } from './step-days';
import { StepPlanning } from './step-planning';
import { StepStart } from './step-start';
import './learner-onboarding.css';

const order: OnboardingStepId[] = ['language', 'placement', 'result', 'objective', 'days', 'planning', 'start'];
const stepIcons: Record<OnboardingStepId, ReactNode> = {
  language: <Languages size={16} />, placement: <ClipboardList size={16} />, result: <Gauge size={16} />, objective: <Target size={16} />,
  days: <CalendarDays size={16} />, planning: <CalendarRange size={16} />, start: <Rocket size={16} />,
};
export const onboardingSlugs: Record<OnboardingStepId, string> = {
  language: 'langue', placement: 'test', result: 'niveau', objective: 'objectif', days: 'jours', planning: 'planning', start: 'depart',
};
const stepOfSlug = Object.fromEntries(Object.entries(onboardingSlugs).map(([id, slug]) => [slug, id])) as Record<string, OnboardingStepId>;
/** Étapes figées une fois le parcours démarré : on ne revient plus sur l'objectif, les jours ou le planning. */
const frozenOnceStarted: OnboardingStepId[] = ['objective', 'days', 'planning'];

/** Langues de secours quand GET /languages ne répond pas : liste statique, allemand A1 et A2 publiés. */
function fallbackLanguages(): Language[] {
  return staticLanguages.map((language) => ({
    id: language.id, name: language.name, nativeName: language.nativeName, status: language.status, position: language.position,
    placementAvailable: language.status === 'available',
    levels: language.levels.map((code) => ({ code: code as Language['levels'][number]['code'], title: `${language.name} ${code}`, published: true,
      trackVersionId: null, plannedMinutes: null, moduleCount: 0 })),
  }));
}

/** Scène d'attente (chargement initial, planning en préparation) : le L respire au centre de la scène. */
function SceneLoading({ label }: { label: string }) {
  return (
    <JourneyStage>
      <div className="lo-loading" role="status">
        <JourneyMark size={64} />
        <span>{label}</span>
      </div>
    </JourneyStage>
  );
}

export function LearnerOnboarding({ token, name, state, reload }: {
  token: string; name: string; state: OnboardingState; reload: () => Promise<OnboardingState | null>;
}) {
  const { '*': splat = '' } = useParams();
  const navigate = useNavigate();
  const [languages, setLanguages] = useState<Language[] | null>(null);
  const [attempt, setAttempt] = useState<PlacementView | null>(null);
  const [path, setPath] = useState<PathView | null>(null);
  const [proposal, setProposal] = useState<PathProposal | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [failure, setFailure] = useState('');
  const [retry, setRetry] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const [canvasSlot, setCanvasSlot] = useState<HTMLDivElement | null>(null);
  const [canvasClaims, setCanvasClaims] = useState(0);
  const claimCanvas = useCallback((delta: number) => setCanvasClaims((value) => Math.max(0, value + delta)), []);
  /** Semaine en cours de réglage à l'étape « Mes jours » : le carnet de route la suit en direct. */
  const [draftDays, setDraftDays] = useState<Day[] | null>(null);

  const attemptId = state.placement?.attemptId ?? null;
  const pathId = state.path?.id ?? null;

  useEffect(() => {
    let active = true;
    requestApi<Language[]>('/languages', token)
      .then((list) => { if (active) setLanguages(list.length ? list : fallbackLanguages()); })
      .catch(() => { if (active) setLanguages(fallbackLanguages()); });
    return () => { active = false; };
  }, [token]);

  // Tentative du test et parcours en brouillon : rechargés quand l'état d'accueil en désigne de nouveaux.
  useEffect(() => {
    let active = true;
    setFailure('');
    (async () => {
      const view = attemptId ? await requestApi<PlacementView>(`/assessments/placements/${encodeURIComponent(attemptId)}`, token) : null;
      const current = pathId ? await requestApi<PathView | null>('/learning/path', token) : null;
      const plan = current && current.status === 'draft' && current.proposal
        ? await requestApi<PathProposal>(`/learning/paths/${encodeURIComponent(current.id)}/proposal`, token) : null;
      if (!active) return;
      setAttempt(view);
      setPath(current);
      setProposal(plan);
      setLoaded(true);
    })().catch((error: unknown) => { if (active) { setFailure(errorText(error)); setLoaded(true); } });
    return () => { active = false; };
  }, [attemptId, pathId, token, retry]);

  const ready = loaded && languages !== null;
  const placementDone = (attempt?.status ?? state.placement?.status) === 'completed';
  const draft = path?.status === 'draft' ? path : null;
  const started = path ? path.status !== 'draft' : Boolean(state.path && state.path.status !== 'draft');

  const reachable = useCallback((id: OnboardingStepId) => {
    switch (id) {
      case 'language': return true;
      case 'placement': return Boolean(state.languageId);
      case 'result': return placementDone;
      case 'objective': return placementDone && !started && state.blockedReason !== 'no_target_available';
      case 'days': return Boolean(draft);
      case 'planning': return Boolean(draft && (proposal || draft.proposal));
      case 'start': return started || state.completed;
    }
  }, [state, placementDone, started, draft, proposal]);

  const defaultStep = useMemo<OnboardingStepId>(() => {
    if (state.completed || started) return 'start';
    const current = state.steps.find((item) => item.status === 'current')?.id;
    if (current && reachable(current)) return current;
    return [...order].reverse().find((id) => reachable(id)) ?? 'language';
  }, [state, started, reachable]);

  const requested = stepOfSlug[splat.split('/')[0]];
  // Pendant le chargement, le chemin montre déjà l'étape demandée (ou celle que l'état d'accueil désigne).
  const guessed = requested ?? (state.completed ? 'start' : state.steps.find((item) => item.status === 'current')?.id ?? 'language');
  const step: OnboardingStepId = ready ? (requested && reachable(requested) ? requested : defaultStep) : guessed;
  const redirect = ready && (!splat || requested !== step);

  // Sens du déplacement, retenu au changement d'étape (et non recalculé à chaque rendu).
  const [motion, setMotion] = useState<{ step: OnboardingStepId; direction: JourneyDirection }>({ step, direction: 'forward' });
  if (motion.step !== step) {
    setMotion({ step, direction: order.indexOf(step) < order.indexOf(motion.step) ? 'back' : 'forward' });
    setDraftDays(null);
  }
  const direction = motion.step === step ? motion.direction : 'forward';

  const go = useCallback((id: OnboardingStepId) => navigate(`/espace/accueil/${onboardingSlugs[id]}`), [navigate]);

  /** Relit l'état d'accueil (et donc la tentative et le parcours) puis passe à l'étape demandée. */
  const advance = useCallback(async (next: OnboardingStepId) => {
    await reload();
    go(next);
  }, [reload, go]);

  const leave = useCallback((to: string) => {
    if (prefersReducedMotion()) { navigate(to); return; }
    setLeaving(true);
    window.setTimeout(() => navigate(to), 340);
  }, [navigate]);

  function signOut() {
    void (supabase?.auth.signOut({ scope: 'local' }) ?? Promise.resolve()).finally(() => navigate('/', { replace: true }));
  }

  const celebrate = ready && step === 'start' && (started || state.completed);
  const steps: JourneyStep[] = order.map((id) => {
    const server = state.steps.find((item) => item.id === id)?.status ?? 'todo';
    const status = id === step ? 'current'
      : id === 'start' && (state.completed || started) ? 'done'
      : order.indexOf(id) < order.indexOf(step) && server !== 'skipped' && server !== 'blocked' ? 'done'
      : server === 'current' ? 'todo' : server;
    return {
      id, label: onboardingStepLabels[id], icon: stepIcons[id], status,
      reachable: ready && reachable(id) && !(started && frozenOnceStarted.includes(id)),
    };
  });

  const language = languages?.find((item) => item.id === (state.languageId ?? 'de')) ?? null;
  const languageLabel = language?.name ?? languageName(state.languageId ?? 'de');
  const carnet: CarnetData = {
    language: state.languageId ? { id: state.languageId, name: languageLabel } : null,
    // Le niveau s'inscrit au carnet une fois révélé (étape « Votre niveau »), pas pendant le test.
    level: placementDone && step !== 'placement' ? attempt?.result?.placedLevel ?? state.placement?.placedLevel ?? null : null,
    levelLabel: placementDone && step !== 'placement' ? attempt?.result?.label ?? null : null,
    target: path ? { level: path.targetLevel, date: path.targetDate } : null,
    weeklyMinutes: path ? path.difficulty.requiredWeeklyMinutes : null,
    days: (step === 'days' ? draftDays : null) ?? proposal?.availability ?? path?.availability ?? [],
  };

  const scene = !ready ? <SceneLoading label="Préparation de votre accueil…" />
    : step === 'language' ? (
      <StepLanguage token={token} state={state} name={name} languages={languages ?? []} placementStarted={Boolean(state.placement)}
        onDone={() => advance('placement')} />
    )
    : step === 'placement' ? (
      <StepPlacement token={token} state={state} attempt={attempt} languageName={languageLabel} onBack={() => go('language')}
        onShowResult={() => go('result')} onAttempt={setAttempt} onStarted={async (view) => { setAttempt(view); await reload(); }}
        onCompleted={async (view) => { setAttempt(view); await advance('result'); }} />
    )
    : step === 'result' && attempt ? (
      <StepResult attempt={attempt} state={state} languageName={languageLabel} onBack={() => go('placement')} onContinue={() => go('objective')} />
    )
    : step === 'objective' && attempt ? (
      <StepObjective token={token} attempt={attempt} language={language} path={draft} onBack={() => go('result')}
        onSaved={async (view) => { setPath(view); setProposal(null); await advance('days'); }} />
    )
    : step === 'days' && draft ? (
      <StepDays token={token} path={draft} onDays={setDraftDays} onProposal={(next) => { setProposal(next); go('planning'); }}
        onBack={() => go('objective')} />
    )
    : step === 'planning' && draft && proposal ? (
      <StepPlanning token={token} path={draft} proposal={proposal} onProposal={setProposal} onEditDays={() => go('days')}
        onValidated={async (view) => { setPath(view); await advance('start'); }} />
    )
    : step === 'start' ? <StartLoader token={token} path={path} state={state} name={name} onPath={setPath} />
    : <SceneLoading label={step === 'planning' ? 'Chargement de votre planning…' : 'Chargement…'} />;

  return (
    <SceneContext.Provider value={{ direction, leave, canvasSlot, claimCanvas }}>
      {/* `welcome-journey` (avec `is-learner` posé par le cadre) : ancre des tests e2e écrits pour l'ancien bandeau. */}
      <JourneyShell variant="learner" label="Accueil de l’élève" kicker="Votre accueil" className="lo-shell welcome-journey"
        steps={steps} current={step} celebrate={celebrate} onSelectStep={(id) => go(id as OnboardingStepId)} leaving={leaving}
        actions={(
          <div className="lo-head">
            {!celebrate && (
              <LeaveLink to="/espace/bibliotheque" className="btn btn-ghost btn-sm lo-head-link" title="Explorer la bibliothèque en attendant">
                <LibraryBig size={17} aria-hidden="true" /><span className="lo-head-label">Explorer la bibliothèque en attendant</span>
              </LeaveLink>
            )}
            <LeaveLink to="/espace/messages" className="icon-button lo-head-icon" aria-label="Mes messages" title="Mes messages">
              <MessageCircle size={18} aria-hidden="true" />
            </LeaveLink>
            <button type="button" className="icon-button lo-head-icon" onClick={signOut} aria-label="Se déconnecter" title="Se déconnecter">
              <LogOut size={18} aria-hidden="true" />
            </button>
          </div>
        )}
        canvas={(
          <div className={`lo-canvas${step === 'result' ? ' is-reveal' : ''}`} ref={setCanvasSlot}>
            {ready && canvasClaims === 0 && <JourneyCarnet data={carnet} />}
          </div>
        )}>
        {redirect && <Navigate to={`/espace/accueil/${onboardingSlugs[step]}`} replace />}
        {failure && (
          <div className="lo-failure" role="alert">
            <Callout tone="warning" title="Chargement incomplet">
              <p>{failure}</p>
              <button type="button" className="btn btn-outline btn-sm" onClick={() => setRetry((value) => value + 1)}>
                <RotateCcw size={15} aria-hidden="true" /> Réessayer
              </button>
            </Callout>
          </div>
        )}
        <SceneTransition sceneKey={ready ? step : 'loading'} direction={direction}>{scene}</SceneTransition>
      </JourneyShell>
    </SceneContext.Provider>
  );
}

/** Dernière étape : le parcours actif (avec ses séances) est relu s'il n'est pas encore connu. */
function StartLoader({ token, path, state, name, onPath }: {
  token: string; path: PathView | null; state: OnboardingState; name: string; onPath: (path: PathView) => void;
}) {
  const [failure, setFailure] = useState('');
  const needed = !path || path.status === 'draft';
  useEffect(() => {
    if (!needed) return;
    let active = true;
    requestApi<PathView | null>('/learning/path', token)
      .then((view) => { if (active && view) onPath(view); })
      .catch((error: unknown) => { if (active) setFailure(errorText(error)); });
    return () => { active = false; };
  }, [needed, token, onPath]);
  if (failure) {
    return (
      <JourneyStage>
        <div className="lo-failure is-inline" role="alert"><Callout tone="warning" title="Parcours indisponible">{failure}</Callout></div>
      </JourneyStage>
    );
  }
  if (!path || needed) return <SceneLoading label="Chargement de votre parcours…" />;
  return <StepStart path={path} state={state} name={name} />;
}
