import { lazy, Suspense, useCallback, useEffect, useState, type ReactNode } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { SkeletonCard } from '../../design/kit';
import { requestApi } from '../../integration/api';
import type { OnboardingState, PathView } from '../../integration/v2';
import { useWorkspaceBadge } from '../workspace/badges';
import { ExamPage } from './Exams';
import { SessionPage } from './LearnerSession';
import { LearnerDashboard } from './LearnerDashboard';
import { DiagnosticPage } from './study-diagnostic';

const LearnerOnboarding = lazy(() => import('../onboarding/LearnerOnboarding').then((module) => ({ default: module.LearnerOnboarding })));
const LearnerContractPage = lazy(() => import('./learner-contract').then((module) => ({ default: module.LearnerContractPage })));
const LibraryPage = lazy(() => import('../library/LibraryPage').then((module) => ({ default: module.LibraryPage })));
const LibraryActivityPage = lazy(() => import('../library/library-activity').then((module) => ({ default: module.LibraryActivityPage })));
const PracticeExamPage = lazy(() => import('../library/practice-exam').then((module) => ({ default: module.PracticeExamPage })));

/** `unavailable` : la route d'accueil ne répond pas (service antérieur à l'incrément) ; l'espace reste alors ouvert. */
type Onboarding = OnboardingState | 'unavailable' | null;

function Waiting({ label }: { label: string }) {
  return <div className="ld-page"><SkeletonCard lines={4} label={label} /></div>;
}

/**
 * L'accueil s'ouvre en plein écran au-dessus de l'espace : pendant son chargement, un voile bleu nuit (styles en ligne,
 * la feuille de l'accueil n'est pas encore chargée) masque déjà la barre latérale pour éviter tout clignotement.
 */
function OnboardingCover() {
  return (
    <div role="status" aria-label="Préparation de votre accueil…"
      style={{ position: 'fixed', inset: 0, zIndex: 70, display: 'grid', placeItems: 'center', background: 'var(--night)' }}>
      <img src="/favicon.svg" alt="" width={56} height={56} style={{ borderRadius: 16, animation: 'lc-fade-in 600ms ease both' }} />
    </div>
  );
}

/** Pastille sur « Mon contrat » quand le professeur attend la réponse de l'élève ; relue à chaque changement d'écran. */
function ContractBadge({ token }: { token: string }) {
  const { pathname } = useLocation();
  const [count, setCount] = useState<number>();
  useEffect(() => {
    let active = true;
    requestApi<PathView | null>('/learning/path', token).then(
      (path) => { if (active) setCount(path?.contract.pending?.status === 'pending_learner' ? 1 : 0); },
      () => { /* service antérieur ou erreur passagère : la pastille reste inchangée */ },
    );
    return () => { active = false; };
  }, [token, pathname]);
  useWorkspaceBadge('/espace/contrat', count);
  return null;
}

export function LearnerPilot({ token, name }: { token: string; name: string }) {
  const [onboarding, setOnboarding] = useState<Onboarding>(null);

  const reload = useCallback(async () => {
    try {
      const state = await requestApi<OnboardingState>('/learning/onboarding', token);
      setOnboarding(state);
      return state;
    } catch {
      setOnboarding((current) => (current && current !== 'unavailable' ? current : 'unavailable'));
      return null;
    }
  }, [token]);

  useEffect(() => { void reload(); }, [reload]);

  // Tant que l'accueil n'est pas terminé, l'accueil du jour, le planning et le contrat mènent à l'accueil en étapes ;
  // la bibliothèque, les résultats et les messages restent ouverts.
  const guarded = (element: ReactNode) => {
    if (onboarding === null) return <Waiting label="Chargement de votre espace…" />;
    if (onboarding !== 'unavailable' && !onboarding.completed) return <Navigate to="/espace/accueil" replace />;
    return element;
  };
  const lazyPage = (element: ReactNode) => <Suspense fallback={<Waiting label="Chargement…" />}>{element}</Suspense>;

  return (
    <>
    {onboarding !== null && onboarding !== 'unavailable' && onboarding.completed && <ContractBadge token={token} />}
    <Routes>
      <Route index element={guarded(<LearnerDashboard token={token} name={name} view="home" />)} />
      <Route path="planning" element={guarded(<LearnerDashboard token={token} name={name} view="planning" />)} />
      <Route path="contrat" element={guarded(lazyPage(<LearnerContractPage token={token} />))} />
      <Route path="accueil/*" element={onboarding === null ? <OnboardingCover />
        : onboarding === 'unavailable' ? <Navigate to="/espace" replace />
        : <Suspense fallback={<OnboardingCover />}><LearnerOnboarding token={token} name={name} state={onboarding} reload={reload} /></Suspense>} />
      <Route path="bibliotheque" element={lazyPage(<LibraryPage token={token} />)} />
      <Route path="bibliotheque/entrainement/:attemptId" element={lazyPage(<PracticeExamPage token={token} />)} />
      <Route path="bibliotheque/:versionId/:activityId" element={lazyPage(<LibraryActivityPage token={token} />)} />
      <Route path="resultats" element={<LearnerDashboard token={token} name={name} view="results" />} />
      <Route path="messages" element={<LearnerDashboard token={token} name={name} view="messages" />} />
      <Route path="seance/:sessionId" element={<SessionPage token={token} />} />
      <Route path="diagnostic" element={<DiagnosticPage token={token} />} />
      <Route path="evaluation/:enrollmentId/:kind" element={<ExamPage token={token} />} />
      <Route path="*" element={<Navigate to="/espace" replace />} />
    </Routes>
    </>
  );
}
