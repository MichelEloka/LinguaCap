/**
 * Accueil de l'élève en sept étapes (/espace/accueil/<étape>) : langue, test de niveau, niveau annoncé, objectif et durée,
 * jours d'étude, planning multi-niveaux, départ. L'état vient de GET /learning/onboarding ; chaque étape garde son adresse
 * pour reprendre là où l'élève s'est arrêté et revenir sur une étape terminée.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { RotateCcw } from 'lucide-react';
import { Callout, SkeletonCard } from '../../design/kit';
import { requestApi } from '../../integration/api';
import { languages as staticLanguages, languageName } from '../../domain/languages';
import {
  onboardingStepLabels, type Language, type OnboardingState, type OnboardingStepId, type PathProposal, type PathView, type PlacementView,
} from '../../integration/v2';
import { errorText, firstName, ofLanguage } from './onboarding-kit';
import { OnboardingStepper, type StepperItem } from './onboarding-stepper';
import { WelcomeJourney } from './WelcomeJourney';
import { StepLanguage } from './step-language';
import { StepPlacement } from './step-placement';
import { StepResult } from './step-result';
import { StepObjective } from './step-objective';
import { StepDays } from './step-days';
import { StepPlanning } from './step-planning';
import { StepStart } from './step-start';
import './onboarding.css';

const order: OnboardingStepId[] = ['language', 'placement', 'result', 'objective', 'days', 'planning', 'start'];
const journeySteps = order.map((id) => onboardingStepLabels[id]);
export const onboardingSlugs: Record<OnboardingStepId, string> = {
  language: 'langue', placement: 'test', result: 'niveau', objective: 'objectif', days: 'jours', planning: 'planning', start: 'depart',
};
const stepOfSlug = Object.fromEntries(Object.entries(onboardingSlugs).map(([id, slug]) => [slug, id])) as Record<string, OnboardingStepId>;

/** Langues de secours quand GET /languages ne répond pas : liste statique, allemand A1 et A2 publiés. */
function fallbackLanguages(): Language[] {
  return staticLanguages.map((language) => ({
    id: language.id, name: language.name, nativeName: language.nativeName, status: language.status, position: language.position,
    placementAvailable: language.status === 'available',
    levels: language.levels.map((code) => ({ code: code as Language['levels'][number]['code'], title: `${language.name} ${code}`, published: true,
      trackVersionId: null, plannedMinutes: null, moduleCount: 0 })),
  }));
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
  const previous = useRef<OnboardingStepId | null>(null);

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
    const current = state.steps.find((step) => step.status === 'current')?.id;
    if (current && reachable(current)) return current;
    return [...order].reverse().find((id) => reachable(id)) ?? 'language';
  }, [state, started, reachable]);

  const requested = stepOfSlug[splat.split('/')[0]];
  const step = requested && reachable(requested) ? requested : defaultStep;
  const direction = previous.current && order.indexOf(step) < order.indexOf(previous.current) ? 'prev' : 'next';
  useEffect(() => { previous.current = step; }, [step]);

  const go = useCallback((id: OnboardingStepId) => {
    navigate(`/espace/accueil/${onboardingSlugs[id]}`);
    window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }, [navigate]);

  /** Relit l'état d'accueil (et donc la tentative et le parcours) puis passe à l'étape demandée. */
  const advance = useCallback(async (next: OnboardingStepId) => {
    await reload();
    go(next);
  }, [reload, go]);

  if (!loaded || !languages) {
    return (
      <div className="ob">
        <header className="ob-head"><p className="eyebrow">Bienvenue</p><h1>Construisons votre parcours</h1></header>
        <SkeletonCard lines={4} label="Préparation de votre accueil…" />
      </div>
    );
  }

  if (requested === undefined && splat) return <Navigate to={`/espace/accueil/${onboardingSlugs[defaultStep]}`} replace />;
  if (!splat) return <Navigate to={`/espace/accueil/${onboardingSlugs[defaultStep]}`} replace />;
  if (requested !== step) return <Navigate to={`/espace/accueil/${onboardingSlugs[step]}`} replace />;

  const items: StepperItem[] = order.map((id) => {
    const status = state.steps.find((item) => item.id === id)?.status ?? 'todo';
    const visual = id === 'start' && (state.completed || started) ? 'done'
      : order.indexOf(id) < order.indexOf(step) && status !== 'skipped' && status !== 'blocked' ? 'done' : status;
    return { id, status: visual, reachable: reachable(id) && !(started && ['objective', 'days', 'planning'].includes(id)) };
  });
  const language = languages.find((item) => item.id === (state.languageId ?? 'de'));
  const languageLabel = language?.name ?? languageName(state.languageId ?? 'de');
  const focus = step === 'placement' && attempt?.status === 'in_progress';

  return (
    <div className={`ob${focus ? ' is-focus' : ''}`}>
      <header className="ob-head lc-enter">
        <div className="ob-head-text">
          <p className="eyebrow">{started ? 'Votre parcours est prêt' : `Bienvenue, ${firstName(name)}`}</p>
          <h1>{started ? 'C’est parti !' : `Construisons votre parcours${state.languageId ? ` ${ofLanguage(languageLabel)}` : ''}`}</h1>
          {!focus && !started && <p className="ob-head-desc">Choisissez votre objectif et vos jours d’étude. Vous pouvez reprendre la préparation là où vous l’avez laissée.</p>}
        </div>
        <div className="ob-journey">
          <WelcomeJourney steps={journeySteps} current={order.indexOf(step)} variant="learner" />
        </div>
        <OnboardingStepper items={items} current={step} onSelect={go} />
      </header>

      {failure && (
        <div role="alert">
          <Callout tone="warning" title="Chargement incomplet">
            <p>{failure}</p>
            <button type="button" className="btn btn-outline btn-sm" onClick={() => setRetry((value) => value + 1)}><RotateCcw size={15} aria-hidden="true" /> Réessayer</button>
          </Callout>
        </div>
      )}

      <div className="ob-stage">
        <div key={step} className={`ob-pane is-${direction}`}>
          {step === 'language' && (
            <StepLanguage token={token} state={state} languages={languages} placementStarted={Boolean(state.placement)}
              onDone={() => advance('placement')} />
          )}
          {step === 'placement' && (
            <StepPlacement token={token} state={state} attempt={attempt} languageName={languageLabel}
              onAttempt={setAttempt} onStarted={async (view) => { setAttempt(view); await reload(); }}
              onCompleted={async (view) => { setAttempt(view); await advance('result'); }} />
          )}
          {step === 'result' && attempt && (
            <StepResult attempt={attempt} state={state} languageName={languageLabel} onContinue={() => go('objective')} />
          )}
          {step === 'objective' && attempt && (
            <StepObjective token={token} attempt={attempt} language={language ?? null} path={draft}
              onSaved={async (view) => { setPath(view); setProposal(null); await advance('days'); }} />
          )}
          {step === 'days' && draft && (
            <StepDays token={token} path={draft} onProposal={(next) => { setProposal(next); go('planning'); }} onBack={() => go('objective')} />
          )}
          {step === 'planning' && draft && proposal && (
            <StepPlanning token={token} path={draft} proposal={proposal} onProposal={setProposal} onEditDays={() => go('days')}
              onValidated={async (view) => { setPath(view); await advance('start'); }} />
          )}
          {step === 'planning' && draft && !proposal && <SkeletonCard lines={5} label="Chargement de votre planning…" />}
          {step === 'start' && <StartLoader token={token} path={path} state={state} name={name} onPath={setPath} />}
        </div>
      </div>
    </div>
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
  if (failure) return <Callout tone="warning" title="Parcours indisponible">{failure}</Callout>;
  if (!path || needed) return <SkeletonCard lines={4} label="Chargement de votre parcours…" />;
  return <StepStart path={path} state={state} name={name} />;
}
