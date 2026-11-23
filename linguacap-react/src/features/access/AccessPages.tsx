import { lazy, Suspense, useEffect, useId, useState } from 'react';
import { createPortal } from 'react-dom';
import type { FormEvent, ReactNode } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Activity, ArrowLeft, ArrowRight, BookOpen, CalendarCheck2, CalendarDays, ChartNoAxesCombined, Eye, EyeOff, Handshake, Headphones, KeyRound, LayoutGrid, LibraryBig, LockKeyhole, MailCheck, MessageSquare, ShieldCheck, Sparkles, Users } from 'lucide-react';
import type { Session } from '@supabase/supabase-js';
import { Badge, PageHeading } from '../../components/ui';
import { apiBase, authLinkParams, isApiMode } from '../../app/config';
import { checkHealth, fetchProfile, roleNames, sessionExpiredEvent, supabase } from '../../integration/api';
import type { Profile } from '../../integration/api';
import { staffWorkspaceLinks } from '../pilot/staff-navigation';
import { WorkspaceFrame } from '../workspace/WorkspaceFrame';
import './access.css';

// Les quatre premiers liens forment la barre du bas sur mobile (les suivants passent dans « Plus ») : « Mes messages »
// y reste, comme avant l'arrivée de la bibliothèque et du contrat.
const learnerLinks = [
  { path: '/espace', label: 'Aujourd’hui', icon: LayoutGrid, end: true },
  { path: '/espace/planning', label: 'Mon planning', icon: CalendarDays },
  { path: '/espace/bibliotheque', label: 'Bibliothèque', icon: LibraryBig },
  { path: '/espace/messages', label: 'Mes messages', icon: MessageSquare },
  { path: '/espace/contrat', label: 'Mon contrat', icon: Handshake },
  { path: '/espace/resultats', label: 'Mes résultats', icon: ChartNoAxesCombined },
];

/** Erreur renvoyée par Supabase dans un lien d'invitation ou de récupération (lien expiré, déjà utilisé…). */
function linkError(): string {
  const code = authLinkParams.get('error_code') ?? authLinkParams.get('error');
  if (!code) return '';
  return code === 'otp_expired' ? 'Ce lien a expiré ou a déjà été utilisé.' : 'Ce lien n’est pas valide.';
}

const LearnerPilot = lazy(() => import('../pilot/LearnerPilot').then((module) => ({ default: module.LearnerPilot })));
const StaffPilot = lazy(() => import('../pilot/StaffPilot').then((module) => ({ default: module.StaffPilot })));

/** Écran d'accès en deux panneaux : présentation de l'application et formulaire (empilés sur mobile). */
function AccessLayout({ children }: { children: ReactNode }) {
  return (
    <div className="acc">
      <aside className="acc-brand">
        <Link to="/" className="acc-logo" aria-label="LinguaCap, page d’accueil"><img src="/favicon.svg" alt="" /><span>Lingua<b>Cap</b></span></Link>
        <div className="acc-pitch">
          <p className="acc-kicker">Allemand · niveaux A1 et A2</p>
          <h2>Votre parcours d’allemand, séance après séance.</h2>
          <ul>
            <li><CalendarCheck2 size={18} aria-hidden="true" />Un planning adapté à votre rythme</li>
            <li><Headphones size={18} aria-hidden="true" />Des leçons avec des voix natives et des exercices corrigés</li>
            <li><MessageSquare size={18} aria-hidden="true" />Le suivi et les encouragements de votre professeur</li>
          </ul>
        </div>
        <div className="acc-preview" aria-hidden="true">
          <div className="acc-card acc-card-session">
            <span className="acc-ring"><svg viewBox="0 0 36 36"><circle cx="18" cy="18" r="15" /><circle cx="18" cy="18" r="15" /></svg></span>
            <div><small>Ma prochaine séance</small><strong>Au café</strong><em>45 min · aujourd’hui</em></div>
          </div>
          <div className="acc-card acc-card-word"><span className="acc-article">der</span><strong>Kaffee</strong><em>le café</em></div>
          <div className="acc-card acc-card-score"><Sparkles size={16} /><strong>6 / 6</strong><em>Exercice réussi</em></div>
        </div>
      </aside>
      <div className="acc-panel">{children}</div>
    </div>
  );
}

/** En-tête du formulaire d'accès : pictogramme, titre (h1) et phrase d'accompagnement. */
function AccessHead({ icon, title, children }: { icon: ReactNode; title: string; children?: ReactNode }) {
  return (
    <header className="acc-head">
      <span className="acc-head-icon">{icon}</span>
      <h1>{title}</h1>
      {children && <p>{children}</p>}
    </header>
  );
}

/** Champ de mot de passe avec bouton d'affichage (placé hors du libellé pour garder un nom accessible exact). */
function PasswordField({ label, value, onChange, autoComplete, minLength }: {
  label: string; value: string; onChange: (value: string) => void; autoComplete: string; minLength?: number;
}) {
  const id = useId();
  const [visible, setVisible] = useState(false);
  return (
    <div className="field acc-password">
      <label htmlFor={id}>{label}</label>
      <div className="acc-password-box">
        <input id={id} required type={visible ? 'text' : 'password'} minLength={minLength} autoComplete={autoComplete} value={value} onChange={(event) => onChange(event.target.value)} />
        <button type="button" className="acc-reveal" onClick={() => setVisible(!visible)} aria-pressed={visible}
          aria-label={visible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}>
          {visible ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
        </button>
      </div>
    </div>
  );
}

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
  const [searchParams] = useSearchParams();
  const { session } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [recovering, setRecovering] = useState(searchParams.get('recuperation') === '1');
  const expired = searchParams.get('session') === 'expiree';
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
    <AccessLayout>
      <section className="acc-form">
        {!isApiMode ? (
          <>
            <AccessHead icon={<LayoutGrid size={22} />} title="Se connecter à LinguaCap">Explorez les trois espaces avec des comptes fictifs. Vos actions restent dans ce navigateur.</AccessHead>
            <nav className="acc-demo" aria-label="Espaces de démonstration">
              <Link to="/eleve"><span className="acc-demo-icon is-learner"><BookOpen size={19} /></span><span><strong>Espace élève</strong><small>Planning, séances et résultats</small></span><ArrowRight size={17} /></Link>
              <Link to="/professeur"><span className="acc-demo-icon is-teacher"><Users size={19} /></span><span><strong>Espace professeur</strong><small>Suivi des élèves et corrections</small></span><ArrowRight size={17} /></Link>
              <Link to="/administration"><span className="acc-demo-icon is-admin"><ShieldCheck size={19} /></span><span><strong>Administration</strong><small>Comptes, catalogue et indicateurs</small></span><ArrowRight size={17} /></Link>
            </nav>
            <Link className="text-link acc-foot" to="/integration">Vérifier l’intégration API</Link>
          </>
        ) : !supabase ? (
          <>
            <AccessHead icon={<LockKeyhole size={22} />} title="Se connecter à LinguaCap" />
            <p className="inline-message warning" role="status">La configuration Auth de cet environnement est incomplète. Vérifiez-la depuis la page d’intégration.</p>
          </>
        ) : recovering ? (
          <>
            <AccessHead icon={<KeyRound size={22} />} title="Réinitialiser le mot de passe">Indiquez votre adresse : nous vous enverrons un lien pour choisir un nouveau mot de passe.</AccessHead>
            <RecoveryRequest email={email} setEmail={setEmail} back={() => setRecovering(false)} />
          </>
        ) : (
          <>
            <AccessHead icon={<LockKeyhole size={22} />} title="Se connecter à LinguaCap">Connectez-vous avec l’adresse associée à votre invitation.</AccessHead>
            <form className="acc-fields" onSubmit={submit}>
              {expired && <p className="inline-message warning" role="status">Votre session a expiré. Reconnectez-vous pour continuer.</p>}
              <label className="field">Adresse e-mail<input required type="email" autoComplete="email" placeholder="prenom.nom@exemple.fr" value={email} onChange={(event) => setEmail(event.target.value)} /></label>
              <PasswordField label="Mot de passe" autoComplete="current-password" value={password} onChange={setPassword} />
              <button className="text-link acc-forgot" type="button" onClick={() => { setError(''); setRecovering(true); }}>Mot de passe oublié</button>
              {error && <p className="inline-message warning" role="alert">{error}</p>}
              <button className="btn btn-primary btn-lg btn-block" type="submit" disabled={busy}>{busy ? 'Connexion en cours…' : 'Se connecter'}</button>
            </form>
          </>
        )}
      </section>
    </AccessLayout>
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
    <form className="acc-fields" onSubmit={submit}>
      <label className="field">Adresse e-mail<input type="email" required autoComplete="email" placeholder="prenom.nom@exemple.fr" value={email} onChange={(event) => setEmail(event.target.value)} /></label>
      {notice && <p className="acc-notice" role="status"><MailCheck size={18} aria-hidden="true" />{notice}</p>}
      <button className="btn btn-primary btn-lg btn-block" type="submit" disabled={busy}>{busy ? 'Envoi en cours…' : 'Demander un lien'}</button>
      <button className="text-link acc-back" type="button" onClick={back}><ArrowLeft size={16} aria-hidden="true" />Revenir à la connexion</button>
    </form>
  );
}

/** Indications en direct sur le nouveau mot de passe (longueur, correspondance). */
function PasswordHints({ password, confirmation }: { password: string; confirmation: string }) {
  const rules = [
    { ok: password.length >= 8, text: 'Au moins 8 caractères' },
    { ok: password.length > 0 && password === confirmation, text: 'Les deux saisies correspondent' },
  ];
  return (
    <ul className="acc-hints" aria-label="Règles du mot de passe">
      {rules.map(({ ok, text }) => <li key={text} className={ok ? 'is-ok' : undefined}><span aria-hidden="true" />{text}<span className="sr-only">{ok ? ' : respecté' : ' : à compléter'}</span></li>)}
    </ul>
  );
}

export function SetPasswordPage({ invitation = false }: { invitation?: boolean }) {
  const { session, loading } = useSession();
  const navigate = useNavigate();
  const [invalidLink] = useState(linkError);
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
    <AccessLayout>
      <section className="acc-form">
        <AccessHead icon={<KeyRound size={22} />} title={invitation ? 'Activer mon compte' : 'Choisir un nouveau mot de passe'}>
          {invitation ? 'Bienvenue ! Choisissez le mot de passe qui protégera votre espace.' : 'Choisissez un mot de passe d’au moins 8 caractères.'}
        </AccessHead>
        {invalidLink && !session ? (
          <div className="acc-fields">
            <p className="inline-message warning" role="alert">{invalidLink}</p>
            {invitation
              ? <p className="muted">Demandez à la personne qui vous a invité de renvoyer l’invitation. Si vous aviez déjà choisi un mot de passe, connectez-vous directement.</p>
              : <Link className="btn btn-primary btn-lg btn-block" to="/connexion?recuperation=1">Demander un nouveau lien</Link>}
          </div>
        ) : loading ? (
          <div className="acc-fields" role="status" aria-label="Vérification du lien…">
            <span className="kit-skeleton" style={{ height: 44 }} /><span className="kit-skeleton" style={{ height: 44 }} /><span className="kit-skeleton" style={{ height: 48 }} />
          </div>
        ) : session ? (
          <form className="acc-fields" onSubmit={submit}>
            <PasswordField label="Nouveau mot de passe" minLength={8} autoComplete="new-password" value={password} onChange={setPassword} />
            <PasswordField label="Confirmer le mot de passe" minLength={8} autoComplete="new-password" value={confirmation} onChange={setConfirmation} />
            <PasswordHints password={password} confirmation={confirmation} />
            {error && <p className="inline-message warning" role="alert">{error}</p>}
            <button className="btn btn-primary btn-lg btn-block" type="submit" disabled={busy}>{busy ? 'Enregistrement…' : 'Enregistrer'}</button>
          </form>
        ) : (
          <div className="acc-fields">
            <p className="muted">Ouvrez un lien d’invitation ou de récupération valide pour continuer.</p>
            {!invitation && <Link className="btn btn-secondary btn-block" to="/connexion?recuperation=1">Demander un nouveau lien</Link>}
          </div>
        )}
        <Link className="text-link acc-back acc-foot" to="/connexion"><ArrowLeft size={16} aria-hidden="true" />Revenir à la connexion</Link>
      </section>
    </AccessLayout>
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
  const navigate = useNavigate();
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

  // Une session refusée par l'API (expirée ou révoquée) ferme l'espace et renvoie vers la connexion.
  useEffect(() => {
    function expire() {
      void supabase?.auth.signOut({ scope: 'local' }).finally(() => navigate('/connexion?session=expiree', { replace: true }));
    }
    window.addEventListener(sessionExpiredEvent, expire);
    return () => window.removeEventListener(sessionExpiredEvent, expire);
  }, [navigate]);

  async function signOut() {
    if (!supabase || signOutBusy) return;
    setSignOutBusy(true);
    setSignOutError('');
    try {
      const { error } = await supabase.auth.signOut({ scope: 'local' });
      if (error) setSignOutError('La déconnexion a échoué. Réessayez.');
      else navigate('/', { replace: true });
    } catch {
      setSignOutError('La déconnexion a échoué. Réessayez.');
    } finally {
      setSignOutBusy(false);
    }
  }

  if (profile && token) {
    const links = profile.role === 'learner'
      ? learnerLinks
      : staffWorkspaceLinks(profile).map((link) => ({ ...link, end: link.path === '/espace' }));
    return (
      <WorkspaceFrame links={links} title={roleNames[profile.role]} name={profile.displayName}
        onSignOut={signOut} signingOut={signOutBusy}>
        {signOutError && <p className="inline-message warning" role="alert">{signOutError}</p>}
        {/* Un professeur pas encore accueilli ne voit pas l'espace avant l'accueil : la toile nuit le recouvre pendant le chargement. */}
        <Suspense fallback={profile.role === 'teacher' && profile.teacherProfile && !profile.teacherProfile.onboardedAt
          ? createPortal(<div className="acc-journey-boot" role="status" aria-label="Préparation de votre accueil…" />, document.body)
          : <p className="panel" role="status">Chargement de votre espace…</p>}>
          {profile.role === 'learner'
            ? <LearnerPilot key={profile.id} token={token} name={profile.displayName} />
            : <StaffPilot key={profile.id} profile={profile} token={token} />}
        </Suspense>
      </WorkspaceFrame>
    );
  }

  return (
    <div className="container workspace-body">
      <PageHeading title="Mon espace"
        action={session && <button className="btn btn-outline" type="button" onClick={signOut} disabled={signOutBusy}>Se déconnecter</button>} />
      {signOutError && <p className="inline-message warning" role="alert">{signOutError}</p>}
      <section className="panel connected-panel stack">
        {loading ? <p role="status">Vérification de la session…</p> : !session ? (
          <><h2>Ouvrir une session</h2><p className="muted">Connectez-vous pour retrouver votre espace LinguaCap.</p><Link className="btn btn-primary" to="/connexion">Se connecter</Link></>
        ) : (
          <>
            {failure ? (
              <><p className="inline-message warning" role="alert">{failure}</p><button className="btn btn-outline" type="button" onClick={() => setRetry((value) => value + 1)}>Réessayer</button></>
            ) : <p role="status">Lecture du profil…</p>}
          </>
        )}
      </section>
    </div>
  );
}
