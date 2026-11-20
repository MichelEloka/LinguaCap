import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { RefreshCw, Send, UserCog, XCircle } from 'lucide-react';
import { Badge, EmptyState, Inspector } from '../../components/ui';
import { requestApi, roleNames, type AccountRole, type Permission, type Profile } from '../../integration/api';
import './accounts.css';

type InvitationStatus = 'pending' | 'accepted' | 'expired' | 'cancelled';

export interface Invitation {
  id: string;
  email: string;
  displayName: string;
  role: AccountRole;
  teacherId: string | null;
  teacherName: string | null;
  invitedByName: string | null;
  status: InvitationStatus;
  sendCount: number;
  createdAt: string;
  lastSentAt: string | null;
  expiresAt: string;
  acceptedAt: string | null;
}

export interface AdminUser {
  id: string;
  displayName: string;
  email: string | null;
  role: AccountRole;
  status: 'active' | 'disabled';
  permissions: Permission[];
  teacherId: string | null;
  teacherName: string | null;
  reviewerId: string | null;
  reviewerName: string | null;
  invitedAt: string | null;
  activatedAt: string | null;
  lastSeenAt: string | null;
  createdAt: string;
}

interface Assignment {
  personId: string;
  personName: string;
  assignedByName: string | null;
  startedAt: string;
  endedAt: string | null;
}

interface AdminUserDetail {
  user: AdminUser;
  teacherHistory: Assignment[];
  reviewerHistory: Assignment[];
}

const dateFormat = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' });
const dateTimeFormat = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' });
const permissionNames: Record<Permission, string> = { catalogue: 'Catalogue', correction: 'Correction' };
const invitationStatus: Record<InvitationStatus, { label: string; tone: 'blue' | 'green' | 'amber' | 'neutral' }> = {
  pending: { label: 'En attente', tone: 'blue' },
  accepted: { label: 'Acceptée', tone: 'green' },
  expired: { label: 'Expirée', tone: 'amber' },
  cancelled: { label: 'Annulée', tone: 'neutral' },
};

function formatDate(value: string | null, withTime = false) {
  return value ? (withTime ? dateTimeFormat : dateFormat).format(new Date(value)) : '—';
}

function getError(error: unknown) {
  return error instanceof Error ? error.message : 'Cette action est temporairement indisponible.';
}

function useAdminUsers(token: string, enabled: boolean, refresh = 0) {
  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    if (!enabled) return;
    let active = true;
    setError('');
    requestApi<AdminUser[]>('/admin/users', token).then(
      (data) => { if (active) setUsers(data); },
      (requestError: unknown) => { if (active) setError(getError(requestError)); },
    );
    return () => { active = false; };
  }, [token, enabled, refresh]);
  return { users, error };
}

export function InviteDialog({ profile, token, onClose, onDone }: {
  profile: Profile;
  token: string;
  onClose: () => void;
  onDone: (invitation: Invitation) => void;
}) {
  const admin = profile.role === 'admin';
  const { users } = useAdminUsers(token, admin);
  const teachers = (users ?? []).filter((user) => user.role === 'teacher' && user.status === 'active');
  const [role, setRole] = useState<AccountRole>('learner');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const form = new FormData(event.currentTarget);
    const teacherId = String(form.get('teacherId') ?? '');
    setBusy(true);
    setError('');
    try {
      onDone(await requestApi<Invitation>('/invitations', token, {
        method: 'POST',
        body: {
          email: String(form.get('email') ?? '').trim().toLowerCase(),
          displayName: String(form.get('displayName') ?? '').trim(),
          role: admin ? role : 'learner',
          teacherId: admin && role === 'learner' && teacherId ? teacherId : null,
        },
      }));
    } catch (requestError) {
      setError(getError(requestError));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Inspector title={admin ? 'Inviter un utilisateur' : 'Inviter un élève'} onClose={onClose}>
      <form className="teacher-form stack" onSubmit={submit}>
        <label>Nom complet<input name="displayName" autoComplete="name" required maxLength={140} /></label>
        <label>Adresse e-mail<input name="email" type="email" autoComplete="email" required maxLength={254} /></label>
        {admin && (
          <label>Rôle
            <select name="role" value={role} onChange={(event) => setRole(event.target.value as AccountRole)}>
              <option value="learner">Élève</option>
              <option value="teacher">Professeur</option>
              <option value="staff">Équipe (catalogue, correction)</option>
            </select>
          </label>
        )}
        {admin && role === 'learner' && (
          <label>Professeur référent
            <select name="teacherId" defaultValue="">
              <option value="">Aucun : élève autonome</option>
              {teachers.map((teacher) => <option key={teacher.id} value={teacher.id}>{teacher.displayName}</option>)}
            </select>
          </label>
        )}
        <p className="muted">Le lien d’activation reste valable sept jours. Inviter de nouveau la même adresse renvoie l’invitation existante.</p>
        {error && <p className="inline-message warning" role="alert">{error}</p>}
        <div className="teacher-form-actions">
          <button className="btn btn-outline" type="button" onClick={onClose}>Fermer</button>
          <button className="btn btn-primary" type="submit" disabled={busy}>{busy ? 'Envoi en cours…' : 'Envoyer l’invitation'}</button>
        </div>
      </form>
    </Inspector>
  );
}

export function InvitationsPanel({ token, refresh }: { token: string; refresh: number }) {
  const [invitations, setInvitations] = useState<Invitation[] | null>(null);
  const [loadError, setLoadError] = useState('');
  const [actionError, setActionError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let active = true;
    setLoadError('');
    requestApi<Invitation[]>('/invitations', token).then(
      (data) => { if (active) setInvitations(data); },
      (error: unknown) => { if (active) setLoadError(getError(error)); },
    );
    return () => { active = false; };
  }, [token, refresh, reload]);

  async function act(invitation: Invitation, action: 'resend' | 'cancel') {
    setBusy(invitation.id);
    setActionError('');
    setNotice('');
    try {
      const id = encodeURIComponent(invitation.id);
      const updated = action === 'resend'
        ? await requestApi<Invitation>(`/invitations/${id}/resend`, token, { method: 'POST' })
        : await requestApi<Invitation>(`/invitations/${id}/cancel`, token, { method: 'POST' });
      setInvitations((current) => current?.map((item) => item.id === updated.id ? updated : item) ?? [updated]);
      setNotice(action === 'resend' ? `Invitation renvoyée à ${updated.email}.` : `Invitation de ${updated.email} annulée.`);
    } catch (error) {
      setActionError(getError(error));
    } finally {
      setBusy(null);
    }
  }

  return (
    <section className="panel" aria-label="Invitations envoyées">
      <div className="staff-panel-actions">
        <button className="btn btn-outline" type="button" onClick={() => setReload((count) => count + 1)}>
          <RefreshCw size={17} aria-hidden="true" /> Actualiser
        </button>
      </div>
      {notice && <p className="inline-message" role="status">{notice}</p>}
      {actionError && <p className="inline-message warning" role="alert">{actionError}</p>}
      {loadError ? <p className="inline-message warning" role="alert">{loadError}</p>
        : invitations === null ? <p role="status">Chargement des invitations…</p>
        : invitations.length === 0 ? <EmptyState title="Aucune invitation" description="Les invitations envoyées apparaîtront ici." />
        : (
          <div className="teacher-table-wrap">
            <table className="teacher-table accounts-table">
              <thead><tr>
                <th scope="col">Personne</th><th scope="col">Rôle</th><th scope="col">Référent</th>
                <th scope="col">Statut</th><th scope="col">Dernier envoi</th><th scope="col">Actions</th>
              </tr></thead>
              <tbody>
                {invitations.map((invitation) => {
                  const status = invitationStatus[invitation.status];
                  const open = invitation.status === 'pending' || invitation.status === 'expired';
                  return (
                    <tr key={invitation.id}>
                      <th scope="row"><span className="accounts-person"><strong>{invitation.displayName}</strong><small>{invitation.email}</small></span></th>
                      <td>{roleNames[invitation.role]}</td>
                      <td>{invitation.role === 'learner' ? invitation.teacherName ?? 'Autonome' : '—'}</td>
                      <td>
                        <Badge tone={status.tone}>{status.label}</Badge>
                        {invitation.status === 'pending' && invitation.sendCount === 0 && <small className="accounts-hint">Envoi à relancer</small>}
                        {invitation.status === 'pending' && <small className="accounts-hint">Expire le {formatDate(invitation.expiresAt)}</small>}
                        {invitation.status === 'accepted' && <small className="accounts-hint">Le {formatDate(invitation.acceptedAt)}</small>}
                      </td>
                      <td>{formatDate(invitation.lastSentAt, true)}{invitation.sendCount > 1 && <small className="accounts-hint">{invitation.sendCount} envois</small>}</td>
                      <td>
                        {open && (
                          <span className="accounts-actions">
                            <button type="button" className="btn btn-outline" disabled={busy !== null} onClick={() => void act(invitation, 'resend')}
                              aria-label={`Renvoyer l’invitation de ${invitation.email}`}><Send size={16} aria-hidden="true" /> Renvoyer</button>
                            <button type="button" className="btn btn-outline" disabled={busy !== null} onClick={() => void act(invitation, 'cancel')}
                              aria-label={`Annuler l’invitation de ${invitation.email}`}><XCircle size={16} aria-hidden="true" /> Annuler</button>
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
    </section>
  );
}

const roleFilters: { value: AccountRole | 'all'; label: string }[] = [
  { value: 'all', label: 'Tous' }, { value: 'learner', label: 'Élèves' }, { value: 'teacher', label: 'Professeurs' },
  { value: 'staff', label: 'Équipe' }, { value: 'admin', label: 'Administration' },
];

export function UsersPanel({ profile, token }: { profile: Profile; token: string }) {
  const [refresh, setRefresh] = useState(0);
  const { users, error } = useAdminUsers(token, true, refresh);
  const [filter, setFilter] = useState<AccountRole | 'all'>('all');
  const [selected, setSelected] = useState<string | null>(null);
  const visible = useMemo(() => (users ?? []).filter((user) => filter === 'all' || user.role === filter), [users, filter]);

  return (
    <section className="panel" aria-labelledby="pilot-users-title">
      <div className="teacher-panel-heading">
        <div><h2 id="pilot-users-title">Comptes</h2><p className="muted">Rôles, état, rattachements et dernière activité</p></div>
        <button className="btn btn-outline" type="button" onClick={() => setRefresh((count) => count + 1)}>
          <RefreshCw size={17} aria-hidden="true" /> Actualiser
        </button>
      </div>
      <div className="teacher-filters" role="group" aria-label="Filtrer par rôle">
        {roleFilters.map((item) => (
          <button key={item.value} type="button" aria-pressed={filter === item.value} onClick={() => setFilter(item.value)}>{item.label}</button>
        ))}
      </div>
      {error ? <p className="inline-message warning" role="alert">{error}</p>
        : users === null ? <p role="status">Chargement des comptes…</p>
        : visible.length === 0 ? <EmptyState title="Aucun compte pour ce filtre" />
        : (
          <div className="teacher-table-wrap">
            <table className="teacher-table accounts-table">
              <thead><tr>
                <th scope="col">Compte</th><th scope="col">Rôle</th><th scope="col">État</th><th scope="col">Rattachement</th>
                <th scope="col">Invitation · activation</th><th scope="col">Dernière activité</th><th scope="col">Fiche</th>
              </tr></thead>
              <tbody>
                {visible.map((user) => (
                  <tr key={user.id}>
                    <th scope="row"><span className="accounts-person"><strong>{user.displayName}</strong><small>{user.email ?? 'Adresse non liée à une invitation'}</small></span></th>
                    <td>{roleNames[user.role]}{user.permissions.length > 0 && <small className="accounts-hint">{user.permissions.map((item) => permissionNames[item]).join(' · ')}</small>}</td>
                    <td><Badge tone={user.status === 'active' ? 'green' : 'neutral'}>{user.status === 'active' ? 'Actif' : 'Désactivé'}</Badge></td>
                    <td>{user.role !== 'learner' ? '—' : user.teacherName
                      ? <>Professeur : {user.teacherName}</>
                      : <>Autonome{user.reviewerName && <small className="accounts-hint">Correcteur : {user.reviewerName}</small>}</>}</td>
                    <td>{formatDate(user.invitedAt)} · {formatDate(user.activatedAt)}</td>
                    <td>{formatDate(user.lastSeenAt, true)}</td>
                    <td><button type="button" className="btn btn-outline" onClick={() => setSelected(user.id)} aria-label={`Ouvrir la fiche de ${user.displayName}`}>
                      <UserCog size={16} aria-hidden="true" /> Fiche</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      {selected && users && (
        <UserDetailDialog userId={selected} token={token} users={users} currentUserId={profile.id}
          onClose={() => setSelected(null)} onChanged={() => setRefresh((count) => count + 1)} />
      )}
    </section>
  );
}

function History({ title, entries, empty }: { title: string; entries: Assignment[]; empty: string }) {
  return (
    <div className="stack">
      <h3>{title}</h3>
      {entries.length === 0 ? <p className="muted">{empty}</p> : (
        <ul className="accounts-history">
          {entries.map((entry) => (
            <li key={`${entry.personId}-${entry.startedAt}`}>
              <strong>{entry.personName}</strong>
              <span>du {formatDate(entry.startedAt)} {entry.endedAt ? `au ${formatDate(entry.endedAt)}` : '· en cours'}
                {entry.assignedByName && ` · par ${entry.assignedByName}`}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function UserDetailDialog({ userId, token, users, currentUserId, onClose, onChanged }: {
  userId: string;
  token: string;
  users: AdminUser[];
  currentUserId: string;
  onClose: () => void;
  onChanged: () => void;
}) {
  const [detail, setDetail] = useState<AdminUserDetail | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const id = encodeURIComponent(userId);

  useEffect(() => {
    let active = true;
    requestApi<AdminUserDetail>(`/admin/users/${id}`, token).then(
      (data) => { if (active) setDetail(data); },
      (requestError: unknown) => { if (active) setError(getError(requestError)); },
    );
    return () => { active = false; };
  }, [token, id]);

  // Chaque modification garde son adresse en toutes lettres : le test de contrat vérifie chaque appel.
  const requests = {
    status: (body: unknown) => requestApi<AdminUserDetail>(`/admin/users/${id}/status`, token, { method: 'PUT', body }),
    role: (body: unknown) => requestApi<AdminUserDetail>(`/admin/users/${id}/role`, token, { method: 'PUT', body }),
    permissions: (body: unknown) => requestApi<AdminUserDetail>(`/admin/users/${id}/permissions`, token, { method: 'PUT', body }),
    teacher: (body: unknown) => requestApi<AdminUserDetail>(`/admin/users/${id}/teacher`, token, { method: 'PUT', body }),
    reviewer: (body: unknown) => requestApi<AdminUserDetail>(`/admin/users/${id}/reviewer`, token, { method: 'PUT', body }),
  };

  async function change(path: keyof typeof requests, body: unknown, message: string) {
    setBusy(true);
    setError('');
    setNotice('');
    try {
      setDetail(await requests[path](body));
      setNotice(message);
      onChanged();
    } catch (requestError) {
      setError(getError(requestError));
    } finally {
      setBusy(false);
    }
  }

  const user = detail?.user;
  const teachers = users.filter((item) => item.role === 'teacher' && item.status === 'active');
  const reviewers = users.filter((item) => item.role !== 'learner' && item.status === 'active' && item.permissions.includes('correction'));
  const self = user?.id === currentUserId;

  return (
    <Inspector title={user ? `Fiche de ${user.displayName}` : 'Fiche du compte'} onClose={onClose}>
      {!detail ? (error ? <p className="inline-message warning" role="alert">{error}</p> : <p role="status">Chargement de la fiche…</p>) : user && (
        <div className="stack accounts-detail">
          <dl className="accounts-summary">
            <div><dt>Rôle</dt><dd>{roleNames[user.role]}</dd></div>
            <div><dt>État</dt><dd>{user.status === 'active' ? 'Actif' : 'Désactivé'}</dd></div>
            <div><dt>Adresse</dt><dd>{user.email ?? '—'}</dd></div>
            <div><dt>Activé le</dt><dd>{formatDate(user.activatedAt)}</dd></div>
            <div><dt>Dernière activité</dt><dd>{formatDate(user.lastSeenAt, true)}</dd></div>
          </dl>
          {notice && <p className="inline-message" role="status">{notice}</p>}
          {error && <p className="inline-message warning" role="alert">{error}</p>}

          <div className="accounts-row">
            <span>{user.status === 'active' ? 'Le compte peut se connecter et utiliser LinguaCap.' : 'Toutes les actions de ce compte sont refusées.'}</span>
            <button type="button" className="btn btn-outline" disabled={busy || self}
              onClick={() => void change('status', { status: user.status === 'active' ? 'disabled' : 'active' },
                user.status === 'active' ? 'Compte désactivé.' : 'Compte réactivé.')}>
              {user.status === 'active' ? 'Désactiver le compte' : 'Réactiver le compte'}
            </button>
          </div>

          {user.role === 'learner' ? (
            <>
              <form className="accounts-row" onSubmit={(event) => {
                event.preventDefault();
                const teacherId = String(new FormData(event.currentTarget).get('teacherId') ?? '');
                void change('teacher', { teacherId: teacherId || null }, teacherId ? 'Professeur référent mis à jour.' : 'L’élève est maintenant autonome.');
              }}>
                <label>Professeur référent
                  <select name="teacherId" defaultValue={user.teacherId ?? ''} key={user.teacherId ?? 'autonome'}>
                    <option value="">Aucun : élève autonome</option>
                    {teachers.map((teacher) => <option key={teacher.id} value={teacher.id}>{teacher.displayName}</option>)}
                  </select>
                </label>
                <button type="submit" className="btn btn-outline" disabled={busy}>Réaffecter</button>
              </form>
              {!user.teacherId && (
                <form className="accounts-row" onSubmit={(event) => {
                  event.preventDefault();
                  const reviewerId = String(new FormData(event.currentTarget).get('reviewerId') ?? '');
                  void change('reviewer', { reviewerId: reviewerId || null }, reviewerId ? 'Correcteur désigné.' : 'Désignation retirée.');
                }}>
                  <label>Correcteur désigné
                    <select name="reviewerId" defaultValue={user.reviewerId ?? ''} key={user.reviewerId ?? 'aucun'}>
                      <option value="">Aucun correcteur</option>
                      {reviewers.map((reviewer) => <option key={reviewer.id} value={reviewer.id}>{reviewer.displayName}</option>)}
                    </select>
                  </label>
                  <button type="submit" className="btn btn-outline" disabled={busy}>Désigner</button>
                </form>
              )}
              <History title="Professeurs référents" entries={detail.teacherHistory} empty="Aucun professeur référent à ce jour." />
              <History title="Correcteurs désignés" entries={detail.reviewerHistory} empty="Aucun correcteur désigné." />
            </>
          ) : (
            <>
              <form className="accounts-row" onSubmit={(event) => {
                event.preventDefault();
                const role = String(new FormData(event.currentTarget).get('role'));
                void change('role', { role }, 'Rôle mis à jour.');
              }}>
                <label>Rôle
                  <select name="role" defaultValue={user.role} key={user.role} disabled={self}>
                    <option value="teacher">Professeur</option>
                    <option value="staff">Équipe</option>
                    <option value="admin">Administration</option>
                  </select>
                </label>
                <button type="submit" className="btn btn-outline" disabled={busy || self}>Changer le rôle</button>
              </form>
              <form className="accounts-row" onSubmit={(event) => {
                event.preventDefault();
                const form = new FormData(event.currentTarget);
                void change('permissions', { permissions: (['catalogue', 'correction'] as Permission[]).filter((item) => form.get(item) === 'on') },
                  'Permissions mises à jour.');
              }}>
                <fieldset className="accounts-permissions" key={user.permissions.join(',')}>
                  <legend>Permissions</legend>
                  <label><input type="checkbox" name="catalogue" defaultChecked={user.permissions.includes('catalogue')} /> Catalogue : niveaux, contenus et médiathèque</label>
                  <label><input type="checkbox" name="correction" defaultChecked={user.permissions.includes('correction')} /> Correction : productions des élèves autonomes désignés</label>
                </fieldset>
                <button type="submit" className="btn btn-outline" disabled={busy}>Enregistrer</button>
              </form>
            </>
          )}
        </div>
      )}
    </Inspector>
  );
}
