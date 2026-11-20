import { useEffect, useState, type FormEvent } from 'react';
import { NavLink, Navigate, Route, Routes } from 'react-router-dom';
import { CalendarDays, ClipboardCheck, Mail, MessageCircle, Plus, RefreshCw, Target, Users } from 'lucide-react';
import { Badge, Dialog, EmptyState, PageHeading, StatCard } from '../../components/ui';
import { canEditCatalogue, requestApi, type Profile } from '../../integration/api';
import { InvitationsPanel, InviteDialog, UsersPanel } from './AccountsPilot';
import '../teacher/teacher.css';
import './accounts.css';

interface LearnerOverview {
  learnerId: string;
  profile: Pick<Profile, 'id' | 'displayName'> & { teacherId: string | null };
  progress: { completedCount: number; goal: { level: string } | null };
  results: { correct: number; total: number }[];
}

interface CatalogueLevel {
  id: string;
  code: string;
  title: string;
  status: 'draft' | 'published';
  version: number;
}

function getError(error: unknown) {
  return error instanceof Error ? error.message : 'Cette action est temporairement indisponible.';
}

function readFormText(data: FormData, key: string) {
  return String(data.get(key) ?? '').trim();
}

function MessageDialog({ learner, token, onClose, onDone }: {
  learner: LearnerOverview;
  token: string;
  onClose: () => void;
  onDone: (message: string) => void;
}) {
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const text = readFormText(new FormData(event.currentTarget), 'text');
    if (!text) {
      setError('Écrivez un message avant de l’envoyer.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await requestApi<unknown>('/tracking/messages', token, {
        method: 'POST',
        body: { learnerId: learner.learnerId, text },
      });
      onDone(`Message envoyé à ${learner.profile.displayName}.`);
    } catch (requestError) {
      setError(getError(requestError));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog title="Encourager un élève" onClose={onClose}>
      <form className="teacher-form stack" onSubmit={submit}>
        <p>Destinataire · {learner.profile.displayName}</p>
        <label>Message<textarea name="text" rows={5} required maxLength={500} /></label>
        {error && <p className="inline-message warning" role="alert">{error}</p>}
        <div className="teacher-form-actions">
          <button type="button" className="btn btn-outline" onClick={onClose}>Fermer</button>
          <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? 'Envoi en cours…' : 'Envoyer'}</button>
        </div>
      </form>
    </Dialog>
  );
}

function LearnerTable({ learners, onMessage }: {
  learners: LearnerOverview[];
  onMessage?: (learner: LearnerOverview) => void;
}) {
  return (
    <div className="table-wrap teacher-table-wrap">
      <table className="teacher-table">
        <thead>
          <tr>
            <th scope="col">Élève</th>
            <th scope="col">Niveau visé</th>
            <th scope="col">Séances terminées</th>
            <th scope="col">Réponses correctes</th>
            {onMessage && <th scope="col">Action</th>}
          </tr>
        </thead>
        <tbody>
          {learners.map((learner) => {
            const total = learner.results.reduce((sum, result) => sum + result.total, 0);
            const correct = learner.results.reduce((sum, result) => sum + result.correct, 0);
            return (
              <tr key={learner.learnerId}>
                <th scope="row">{learner.profile.displayName}</th>
                <td>{learner.progress.goal?.level ?? 'À définir'}</td>
                <td>{learner.progress.completedCount}</td>
                <td>{total ? `${correct} / ${total}` : 'Aucun résultat'}</td>
                {onMessage && (
                  <td>
                    <button type="button" className="btn btn-outline" onClick={() => onMessage(learner)}
                      aria-label={`Encourager ${learner.profile.displayName}`}>
                      <MessageCircle size={17} aria-hidden="true" /> Encourager
                    </button>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function CreateLevelDialog({ token, onClose, onCreate }: {
  token: string;
  onClose: () => void;
  onCreate: (level: CatalogueLevel) => void;
}) {
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const form = new FormData(event.currentTarget);
    setBusy(true);
    setError('');
    try {
      const level = await requestApi<CatalogueLevel>('/levels', token, {
        method: 'POST',
        body: {
          code: readFormText(form, 'code').toUpperCase(),
          title: readFormText(form, 'title'),
          description: readFormText(form, 'description'),
        },
      });
      onCreate(level);
    } catch (requestError) {
      setError(getError(requestError));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog title="Créer un niveau" onClose={onClose}>
      <form className="teacher-form stack" onSubmit={submit}>
        <label>Code CECRL<input name="code" required pattern="[ABCabc][12]" placeholder="B2" maxLength={2} /></label>
        <label>Titre<input name="title" required maxLength={120} placeholder="Allemand B2" /></label>
        <label>Description<textarea name="description" rows={4} maxLength={2000} /></label>
        {error && <p className="inline-message warning" role="alert">{error}</p>}
        <div className="teacher-form-actions">
          <button type="button" className="btn btn-outline" onClick={onClose}>Fermer</button>
          <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? 'Création en cours…' : 'Créer le brouillon'}</button>
        </div>
      </form>
    </Dialog>
  );
}

function CataloguePanel({ token }: { token: string }) {
  const [levels, setLevels] = useState<CatalogueLevel[] | null>(null);
  const [loadError, setLoadError] = useState('');
  const [actionError, setActionError] = useState('');
  const [notice, setNotice] = useState('');
  const [refresh, setRefresh] = useState(0);
  const [createOpen, setCreateOpen] = useState(false);
  const [publishing, setPublishing] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoadError('');
    requestApi<CatalogueLevel[]>('/levels', token).then(
      (data) => { if (active) setLevels(data); },
      (error: unknown) => { if (active) setLoadError(getError(error)); },
    );
    return () => { active = false; };
  }, [token, refresh]);

  async function publish(level: CatalogueLevel) {
    setPublishing(level.id);
    setActionError('');
    setNotice('');
    try {
      const updated = await requestApi<CatalogueLevel>(`/levels/${encodeURIComponent(level.id)}/publish`, token, {
        method: 'POST',
      });
      setLevels((current) => current?.map((item) => item.id === updated.id ? updated : item) ?? [updated]);
      setNotice(`Le niveau ${updated.code} est publié.`);
    } catch (requestError) {
      setActionError(getError(requestError));
    } finally {
      setPublishing(null);
    }
  }

  return (
    <section className="panel" aria-labelledby="pilot-levels-title">
      <div className="teacher-panel-heading">
        <div><h2 id="pilot-levels-title">Catalogue</h2><p className="muted">Niveaux d’allemand et état de publication</p></div>
        <button type="button" className="btn btn-outline" onClick={() => setCreateOpen(true)} disabled={!levels}>
          <Plus size={17} aria-hidden="true" /> Nouveau niveau
        </button>
      </div>
      {loadError ? (
        <div className="stack">
          <p className="inline-message warning" role="alert">{loadError}</p>
          <button className="btn btn-outline" type="button" onClick={() => setRefresh((count) => count + 1)}>Réessayer</button>
        </div>
      ) : levels === null ? (
        <p role="status">Chargement du catalogue…</p>
      ) : levels.length === 0 ? (
        <EmptyState title="Aucun niveau dans le catalogue" />
      ) : (
        <div className="teacher-table-wrap">
          <table className="teacher-table">
            <thead><tr><th scope="col">Code</th><th scope="col">Niveau</th><th scope="col">Statut</th><th scope="col">Action</th></tr></thead>
            <tbody>
              {levels.map((level) => (
                <tr key={level.id}>
                  <th scope="row">{level.code}</th>
                  <td>{level.title}</td>
                  <td><Badge tone={level.status === 'published' ? 'green' : 'amber'}>
                    {level.status === 'published' ? 'Publié' : 'Brouillon'}
                  </Badge></td>
                  <td>{level.status === 'draft' && (
                    <button type="button" className="btn btn-outline" disabled={publishing !== null}
                      onClick={() => void publish(level)} aria-label={`Publier ${level.code}`}>
                      {publishing === level.id ? 'Publication en cours…' : 'Publier'}
                    </button>
                  )}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {notice && <p className="inline-message" role="status">{notice}</p>}
      {actionError && <p className="inline-message warning" role="alert">{actionError}</p>}
      {createOpen && <CreateLevelDialog token={token} onClose={() => setCreateOpen(false)} onCreate={(level) => {
        setLevels((current) => [...(current ?? []), level].sort((a, b) => a.code.localeCompare(b.code)));
        setCreateOpen(false);
        setActionError('');
        setNotice(`Le niveau ${level.code} a été créé en brouillon.`);
      }} />}
    </section>
  );
}

function LearnersPanel({ admin, token, onNotice }: { admin: boolean; token: string; onNotice: (message: string) => void }) {
  const [learners, setLearners] = useState<LearnerOverview[] | null>(null);
  const [error, setError] = useState('');
  const [refresh, setRefresh] = useState(0);
  const [messageTo, setMessageTo] = useState<LearnerOverview | null>(null);

  useEffect(() => {
    let active = true;
    setError('');
    requestApi<{ learners: LearnerOverview[] }>('/tracking/overview', token).then(
      (data) => { if (active) setLearners(data.learners); },
      (requestError: unknown) => { if (active) setError(getError(requestError)); },
    );
    return () => { active = false; };
  }, [token, refresh]);

  return (
    <>
      {learners && !error && (
        <div className="teacher-stats">
          <StatCard label={admin ? 'Élèves inscrits' : 'Mes élèves'} value={learners.length} icon={<Users size={19} />} />
          <StatCard label="Parcours définis" value={learners.filter((learner) => learner.progress.goal !== null).length} icon={<Target size={19} />} />
          <StatCard label="Séances terminées" value={learners.reduce((sum, learner) => sum + learner.progress.completedCount, 0)} icon={<CalendarDays size={19} />} />
          <StatCard label="Évaluations remises" value={learners.reduce((sum, learner) => sum + learner.results.length, 0)} icon={<ClipboardCheck size={19} />} />
        </div>
      )}
      <section className="panel teacher-roster" aria-labelledby="pilot-learners-title">
        <div className="teacher-panel-heading">
          <div><h2 id="pilot-learners-title">{admin ? 'Suivi des élèves' : 'Mes élèves'}</h2>
            <p className="muted">Objectifs, séances terminées et résultats</p></div>
          <button className="btn btn-outline" type="button" onClick={() => setRefresh((count) => count + 1)}>
            <RefreshCw size={17} aria-hidden="true" /> Actualiser
          </button>
        </div>
        {error ? <p className="inline-message warning" role="alert">{error}</p>
          : learners === null ? <p role="status">Chargement du suivi…</p>
          : learners.length > 0 ? <LearnerTable learners={learners} onMessage={admin ? undefined : setMessageTo} />
          : <EmptyState title="Aucun élève actif" description="Les élèves apparaîtront ici après avoir activé leur compte." />}
      </section>
      {messageTo && <MessageDialog learner={messageTo} token={token} onClose={() => setMessageTo(null)} onDone={(message) => {
        setMessageTo(null);
        onNotice(message);
      }} />}
    </>
  );
}

export function StaffPilot({ profile, token }: { profile: Profile; token: string }) {
  const admin = profile.role === 'admin';
  const educator = admin || profile.role === 'teacher';
  const [notice, setNotice] = useState('');
  const [inviteOpen, setInviteOpen] = useState(false);
  const [invitationsRefresh, setInvitationsRefresh] = useState(0);

  // Les onglets suivent le rôle et les permissions : l'équipe sans permission ne voit aucun élève.
  const tabs = [
    ...(educator ? [{ path: 'eleves', label: admin ? 'Élèves' : 'Mes élèves' }] : []),
    ...(educator ? [{ path: 'invitations', label: 'Invitations' }] : []),
    ...(admin ? [{ path: 'utilisateurs', label: 'Utilisateurs' }] : []),
    ...(canEditCatalogue(profile) ? [{ path: 'catalogue', label: 'Catalogue' }] : []),
  ];
  const allowed = (path: string) => tabs.some((tab) => tab.path === path);

  return (
    <div className="teacher-space">
      <PageHeading
        title={admin ? 'Administration' : educator ? 'Espace professeur' : 'Espace équipe'}
        description={profile.displayName}
        action={educator && (
          <button type="button" className="btn btn-primary" onClick={() => setInviteOpen(true)}>
            <Mail size={17} aria-hidden="true" /> {admin ? 'Inviter un utilisateur' : 'Inviter un élève'}
          </button>
        )}
      />
      {notice && <p className="inline-message" role="status">{notice}</p>}
      {tabs.length > 0 && (
        <nav className="pilot-tabs" aria-label="Sections de l’espace">
          {tabs.map((tab) => <NavLink key={tab.path} to={`/espace/${tab.path}`}>{tab.label}</NavLink>)}
        </nav>
      )}
      <Routes>
        <Route index element={tabs.length > 0 ? <Navigate to={tabs[0].path} replace /> : (
          <EmptyState title="Aucune permission active"
            description="L’administration peut vous attribuer la permission Catalogue ou Correction." />
        )} />
        {allowed('eleves') && <Route path="eleves" element={<LearnersPanel admin={admin} token={token} onNotice={setNotice} />} />}
        {allowed('invitations') && <Route path="invitations" element={<InvitationsPanel token={token} refresh={invitationsRefresh} />} />}
        {allowed('utilisateurs') && <Route path="utilisateurs" element={<UsersPanel profile={profile} token={token} />} />}
        {allowed('catalogue') && <Route path="catalogue" element={<CataloguePanel token={token} />} />}
        <Route path="*" element={<Navigate to="/espace" replace />} />
      </Routes>
      {inviteOpen && <InviteDialog profile={profile} token={token} onClose={() => setInviteOpen(false)} onDone={(invitation) => {
        setInviteOpen(false);
        setInvitationsRefresh((count) => count + 1);
        setNotice(`Invitation envoyée à ${invitation.email}. Le lien reste valable sept jours.`);
      }} />}
    </div>
  );
}
