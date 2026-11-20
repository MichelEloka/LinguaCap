import { lazy, Suspense, useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, BookOpen, KeyRound, LockKeyhole, ShieldCheck, Users } from 'lucide-react';
import type { Session } from '@supabase/supabase-js';
import { Badge, PageHeading } from '../../components/ui';
import { apiBase, isApiMode } from '../../app/config';
import { checkHealth, fetchProfile, supabase } from '../../integration/api';
import type { Profile } from '../../integration/api';

const roleNames = { learner: 'Élève', teacher: 'Professeur', admin: 'Administration' };
const LearnerPilot = lazy(() => import('../pilot/LearnerPilot').then((module) => ({ default: module.LearnerPilot })));
const StaffPilot = lazy(() => import('../pilot/StaffPilot').then((module) => ({ default: module.StaffPilot })));

function errorMessage(error: unknown): string {
  if (error instanceof Error && error.name === 'TimeoutError') return 'Le service a mis trop de temps à répondre.';
  return error instanceof Error ? error.message : 'Le service est momentanément inaccessible.';
}

function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(Boolean(supabase));
  useEffect(() => {
    if (!supabase) return;
    const { data } = supabase.auth.onAuthStateChange((_event, activeSession) => {
      setSession(activeSession);
      setLoading(false);
    });
    return () => data.subscription.unsubscribe();
  }, []);
  return { session, loading };
}

export function SignInPage() {
  const navigate = useNavigate();
  const { session } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [recovering, setRecovering] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (session) navigate('/espace', { replace: true });
  }, [session, navigate]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase || busy) return;
    setBusy(true);
    setError('');
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (authError) setError('Connexion impossible. Vérifiez votre adresse, votre mot de passe et l’activation de votre compte.');
      else navigate('/espace');
    } catch {
      setError('Le service de connexion est momentanément inaccessible.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="access-page">
      <section className="access-card panel">
        <span className="icon-tile"><LockKeyhole size={23} /></span>
        <h1>{recovering ? 'Réinitialiser le mot de passe' : 'Se connecter à LinguaCap'}</h1>
        {!isApiMode ? (
          <div className="stack">
            <p className="muted">Explorez les trois espaces avec des comptes fictifs. Vos actions restent dans ce navigateur.</p>
            <Link className="btn btn-primary" to="/eleve"><BookOpen size={17} /> Espace élève</Link>
            <Link className="btn btn-outline" to="/professeur"><Users size={17} /> Espace professeur</Link>
            <Link className="btn btn-outline" to="/administration"><ShieldCheck size={17} /> Administration</Link>
            <Link className="text-link" to="/integration">Vérifier l’intégration API</Link>
          </div>
        ) : !supabase ? (
          <p className="inline-message warning" role="status">La configuration Auth de cet environnement est incomplète. Vérifiez-la depuis la page d’intégration.</p>
        ) : recovering ? (
          <RecoveryRequest email={email} setEmail={setEmail} back={() => setRecovering(false)} />
        ) : (
          <form className="stack" onSubmit={submit}>
            <p className="muted">Connectez-vous avec l’adresse associée à votre invitation.</p>
            <label className="field">Adresse e-mail<input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} /></label>
            <label className="field">Mot de passe<input required type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} /></label>
            {error && <p className="inline-message warning" role="alert">{error}</p>}
            <button className="btn btn-primary" type="submit" disabled={busy}>{busy ? 'Connexion en cours…' : 'Se connecter'}</button>
            <button className="text-link" type="button" onClick={() => { setError(''); setRecovering(true); }}>Mot de passe oublié</button>
          </form>
        )}
        {isApiMode && <Link className="text-link" to="/integration">État de l’intégration</Link>}
      </section>
    </div>
  );
}

function RecoveryRequest({ email, setEmail, back }: { email: string; setEmail: (value: string) => void; back: () => void }) {
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase || busy) return;
    setBusy(true);
    setNotice('');
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: new URL('/reinitialiser', window.location.origin).href,
      });
      setNotice(error ? 'Impossible de traiter la demande pour le moment.' : 'Si cette adresse correspond à un compte, un e-mail de récupération vous sera envoyé.');
    } catch {
      setNotice('Le service ne répond pas. Réessayez plus tard.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="stack" onSubmit={submit}>
      <label className="field">Adresse e-mail<input type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} /></label>
      {notice && <p className="inline-message" role="status">{notice}</p>}
      <button className="btn btn-primary" type="submit" disabled={busy}>{busy ? 'Envoi en cours…' : 'Demander un lien'}</button>
      <button className="text-link" type="button" onClick={back}>Revenir à la connexion</button>
    </form>
  );
}

export function SetPasswordPage({ invitation = false }: { invitation?: boolean }) {
  const { session, loading } = useSession();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase || !session || busy) return;
    if (password !== confirmation) {
      setError('Les deux mots de passe doivent correspondre.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const { error: changeError } = await supabase.auth.updateUser({ password });
      if (changeError) setError('Impossible d’enregistrer ce mot de passe. Vérifiez les règles du compte et réessayez.');
      else navigate('/espace', { replace: true });
    } catch {
      setError('Le service de compte est momentanément inaccessible.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="access-page">
      <section className="access-card panel">
        <span className="icon-tile"><KeyRound size={23} /></span>
        <h1>{invitation ? 'Activer mon compte' : 'Choisir un nouveau mot de passe'}</h1>
        {loading ? <p role="status">Vérification du lien…</p> : session ? (
          <form className="stack" onSubmit={submit}>
            <label className="field">Nouveau mot de passe<input type="password" required minLength={8} autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} /></label>
            <label className="field">Confirmer le mot de passe<input type="password" required minLength={8} autoComplete="new-password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} /></label>
            {error && <p className="inline-message warning" role="alert">{error}</p>}
            <button className="btn btn-primary" type="submit" disabled={busy}>{busy ? 'Enregistrement…' : 'Enregistrer'}</button>
          </form>
        ) : <p className="muted">Ouvrez un lien d’invitation ou de récupération valide pour continuer.</p>}
        <Link className="text-link" to="/connexion">Revenir à la connexion</Link>
      </section>
    </div>
  );
}

export function IntegrationPage() {
  const [probe, setProbe] = useState<{ kind: 'idle' | 'busy' | 'ok' | 'degraded' | 'error'; message: string }>({ kind: 'idle', message: 'Lancez une requête de contrôle pour vérifier le relais vers la passerelle.' });
  const { session } = useSession();

  async function verify() {
    setProbe({ kind: 'busy', message: 'Vérification de la passerelle…' });
    try {
      const status = await checkHealth();
      setProbe({ kind: status, message: status === 'ok' ? 'La passerelle API répond au contrat de santé.' : 'La passerelle répond et signale un service dégradé.' });
    } catch (error) {
      setProbe({ kind: 'error', message: errorMessage(error) });
    }
  }

  return (
    <div className="container workspace-body">
      <PageHeading title="Vérifier l’intégration" description="Contrôlez le frontend, la passerelle API et la configuration Auth de cet environnement." />
      <div className="space-grid integration-grid">
        <section className="panel stack">
          <span className="icon-tile"><Activity size={22} /></span>
          <h2>Passerelle API</h2>
          <span className="endpoint">GET {apiBase}/health</span>
          <p className="muted" role="status">{probe.message}</p>
          {probe.kind === 'ok' && <Badge tone="green">Disponible</Badge>}
          {(probe.kind === 'degraded' || probe.kind === 'error') && <Badge tone="amber">{probe.kind === 'error' ? 'Contrôle en échec' : 'Service dégradé'}</Badge>}
          <button className="btn btn-primary" type="button" onClick={verify} disabled={probe.kind === 'busy'}>{probe.kind === 'busy' ? 'Vérification…' : 'Tester la connexion'}</button>
        </section>
        <section className="panel stack">
          <span className="icon-tile"><ShieldCheck size={22} /></span>
          <h2>Authentification</h2>
          <Badge tone={isApiMode ? 'blue' : 'neutral'}>{isApiMode ? 'Mode API' : 'Mode démonstration'}</Badge>
          <p className="muted">{!isApiMode ? 'Les espaces fictifs sont isolés de l’authentification réelle.' : !supabase ? 'Vérifiez les variables publiques Supabase de ce build.' : session ? 'Une session Supabase est active.' : 'Le client Supabase est configuré. Connectez-vous pour tester la lecture du profil.'}</p>
          <Link className="btn btn-outline" to={session ? '/espace' : '/connexion'}>{session ? 'Vérifier mon profil' : 'Ouvrir la connexion'}</Link>
        </section>
      </div>
    </div>
  );
}

export function ConnectedPage() {
  const { session, loading } = useSession();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [failure, setFailure] = useState('');
  const [retry, setRetry] = useState(0);
  const [signOutBusy, setSignOutBusy] = useState(false);
  const [signOutError, setSignOutError] = useState('');
  const token = session?.access_token;

  useEffect(() => {
    let active = true;
    setProfile(null);
    setFailure('');
    if (token) fetchProfile(token)
      .then((value) => { if (active) setProfile(value); })
      .catch((error: unknown) => { if (active) setFailure(errorMessage(error)); });
    return () => { active = false; };
  }, [token, retry]);

  async function signOut() {
    if (!supabase || signOutBusy) return;
    setSignOutBusy(true);
    setSignOutError('');
    try {
      const { error } = await supabase.auth.signOut({ scope: 'local' });
      if (error) setSignOutError('La déconnexion a échoué. Réessayez.');
    } catch {
      setSignOutError('La déconnexion a échoué. Réessayez.');
    } finally {
      setSignOutBusy(false);
    }
  }

  return (
    <div className="container workspace-body">
      <PageHeading title={profile ? `Bonjour ${profile.displayName}` : 'Mon espace'}
        description={profile ? roleNames[profile.role] : undefined}
        action={session && <button className="btn btn-outline" type="button" onClick={signOut} disabled={signOutBusy}>Se déconnecter</button>} />
      {signOutError && <p className="inline-message warning" role="alert">{signOutError}</p>}
      {profile && token ? (
        <Suspense fallback={<p role="status">Chargement de votre espace…</p>}>
          {profile.role === 'learner' ? <LearnerPilot key={profile.id} token={token} /> : <StaffPilot key={profile.id} profile={profile} token={token} />}
        </Suspense>
      ) : <section className="panel connected-panel stack">
        {loading ? <p role="status">Vérification de la session…</p> : !session ? (
          <><h2>Ouvrir une session</h2><p className="muted">Connectez-vous pour retrouver votre espace LinguaCap.</p><Link className="btn btn-primary" to="/connexion">Se connecter</Link></>
        ) : (
          <>
            {failure ? (
              <><p className="inline-message warning" role="alert">{failure}</p><button className="btn btn-outline" type="button" onClick={() => setRetry((value) => value + 1)}>Réessayer</button></>
            ) : <p role="status">Lecture du profil…</p>}
          </>
        )}
      </section>}
    </div>
  );
}
