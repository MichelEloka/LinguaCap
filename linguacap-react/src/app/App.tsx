import { lazy, Suspense, useEffect } from 'react';
import type { ReactNode } from 'react';
import { Link, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { FlaskConical } from 'lucide-react';
import { isApiMode } from './config';
import { Header, Footer, WorkspaceNav } from '../components/Shell';
import { DemoProvider } from '../demo/context';
import type { Role } from '../domain/types';
import HomePage from '../features/home/HomePage';

const LearnerSpace = lazy(() => import('../features/learner/LearnerSpace'));
const TeacherSpace = lazy(() => import('../features/teacher/TeacherSpace'));
const AdminSpace = lazy(() => import('../features/admin/AdminSpace'));
const SignInPage = lazy(() => import('../features/access/AccessPages').then((pages) => ({ default: pages.SignInPage })));
const SetPasswordPage = lazy(() => import('../features/access/AccessPages').then((pages) => ({ default: pages.SetPasswordPage })));
const IntegrationPage = lazy(() => import('../features/access/AccessPages').then((pages) => ({ default: pages.IntegrationPage })));
const ConnectedPage = lazy(() => import('../features/access/AccessPages').then((pages) => ({ default: pages.ConnectedPage })));

function NavigationEffects() {
  const { pathname, hash } = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    const legacyPaths: Record<string, string> = { '#accueil': '/', '#eleve': '/eleve', '#professeur': '/professeur' };
    if (pathname === '/' && hash in legacyPaths) {
      navigate(legacyPaths[hash], { replace: true });
      return;
    }
    if (!hash) window.scrollTo(0, 0);
    const title = pathname.startsWith('/eleve') ? 'Espace élève'
      : pathname.startsWith('/professeur') ? 'Espace professeur'
        : pathname.startsWith('/administration') ? 'Administration'
          : pathname === '/integration' ? 'Intégration' : 'Apprendre l’allemand';
    document.title = `${title} · LinguaCap`;
  }, [pathname, hash, navigate]);
  return null;
}

function Workspace({ role, children }: { role: Role; children: ReactNode }) {
  if (isApiMode) return <Navigate to="/espace" replace />;
  return (
    <div className="workspace">
      <WorkspaceNav role={role} />
      <div className="container workspace-content">
        <p className="demo-notice"><FlaskConical size={16} aria-hidden="true" /> Démonstration locale <span>· Comptes fictifs</span></p>
        <Suspense fallback={<p className="panel" role="status">Chargement de l’espace…</p>}>{children}</Suspense>
      </div>
    </div>
  );
}

function NotFound() {
  return <div className="container workspace-body"><section className="panel stack"><h1>Page introuvable</h1><p>Cette adresse ne correspond à aucune page LinguaCap.</p><Link className="btn btn-primary" to="/">Revenir à l’accueil</Link></section></div>;
}

function AppLayout() {
  return (
    <div className="app-shell">
      <NavigationEffects />
      <a className="skip-link" href="#main-content">Aller au contenu</a>
      <Header />
      <main id="main-content" tabIndex={-1}>
        <Suspense fallback={<p className="container workspace-body" role="status">Chargement…</p>}>
          <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/connexion" element={<SignInPage />} />
          <Route path="/activer-compte" element={<SetPasswordPage invitation />} />
          <Route path="/reinitialiser" element={<SetPasswordPage />} />
          <Route path="/integration" element={<IntegrationPage />} />
          <Route path="/espace" element={<ConnectedPage />} />
          <Route path="/eleve/*" element={<Workspace role="learner"><LearnerSpace /></Workspace>} />
          <Route path="/professeur/*" element={<Workspace role="teacher"><TeacherSpace /></Workspace>} />
          <Route path="/administration/*" element={<Workspace role="admin"><AdminSpace /></Workspace>} />
          <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return isApiMode ? <AppLayout /> : <DemoProvider><AppLayout /></DemoProvider>;
}
