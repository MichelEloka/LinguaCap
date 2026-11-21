import { useEffect, useMemo, useState, type FormEvent, type MouseEvent } from 'react';
import { Ban, ChevronRight, Clock3, Languages, MailCheck, RefreshCw, Send, TimerOff, UserRound, UsersRound, X } from 'lucide-react';
import { Badge, Dialog, EmptyState } from '../../components/ui';
import { Avatar, Callout, Chip, Drawer, SearchField, Segmented, SkeletonCard, Toolbar, useToast } from '../../design/kit';
import { requestApi, type AccountRole, type Permission, type Profile } from '../../integration/api';
import { LanguagePicker } from '../../components/LanguagePicker';
import { availableLanguages, languageName, languages as allLanguages } from '../../domain/languages';
import { formatDate, formatRelative, getError, RoleBadge, StateBadge } from './admin-common';
import { UserSheet } from './admin-user-sheet';
import './admin.css';

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
  /** Langue apprise par l'élève invité (absente d'une passerelle antérieure aux parcours). */
  languageId?: string | null;
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
  /** Langue apprise par un élève (null pour l'équipe ou un élève autonome qui ne l'a pas choisie). */
  languageId?: string | null;
}

const permissionNames: Record<Permission, string> = { catalogue: 'Catalogue', correction: 'Correction' };
const invitationStatus: Record<InvitationStatus, { label: string; filter: string; tone: 'blue' | 'green' | 'amber' | 'neutral'; icon: typeof Clock3 }> = {
  pending: { label: 'En attente', filter: 'En attente', tone: 'blue', icon: Clock3 },
  accepted: { label: 'Acceptée', filter: 'Acceptées', tone: 'green', icon: MailCheck },
  expired: { label: 'Expirée', filter: 'Expirées', tone: 'amber', icon: TimerOff },
  cancelled: { label: 'Annulée', filter: 'Annulées', tone: 'neutral', icon: Ban },
};

const normalize = (value: string) => value.toLocaleLowerCase('fr').normalize('NFD').replace(/[̀-ͯ]/g, '');

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

const inviteRoles: { value: Exclude<AccountRole, 'admin'>; label: string }[] = [
  { value: 'learner', label: 'Élève' }, { value: 'teacher', label: 'Professeur' }, { value: 'staff', label: 'Équipe' },
];
const inviteRoleHints: Record<Exclude<AccountRole, 'admin'>, string> = {
  learner: 'Suit un parcours, avec un professeur référent ou en autonomie.',
  teacher: 'Suit ses élèves, définit leurs parcours et corrige leurs productions.',
  staff: 'Prépare le catalogue ou corrige ; les permissions se règlent ensuite dans sa fiche.',
};

/** Langues proposées à l'invitation : langues ouvertes, limitées à celles du professeur quand il les a indiquées. */
function invitationLanguages(teacherLanguages?: readonly string[]) {
  const open = availableLanguages.map((language) => language.id);
  const taught = (teacherLanguages ?? []).filter((id) => open.includes(id));
  return taught.length ? taught : open;
}

export function InviteDialog({ profile, token, teacherLanguages, onClose, onDone }: {
  profile: Profile;
  token: string;
  /** Langues enseignées par le professeur qui invite (profil professeur). */
  teacherLanguages?: readonly string[];
  onClose: () => void;
  onDone: (invitation: Invitation) => void;
}) {
  const admin = profile.role === 'admin';
  const { users } = useAdminUsers(token, admin);
  const teachers = (users ?? []).filter((user) => user.role === 'teacher' && user.status === 'active');
  const [role, setRole] = useState<Exclude<AccountRole, 'admin'>>('learner');
  const selectable = invitationLanguages(admin ? undefined : teacherLanguages);
  const [languageId, setLanguageId] = useState<string | null>(selectable[0] ?? null);
  const learnerInvite = !admin || role === 'learner';
  // Les langues ouvertes, celles du professeur, puis quelques langues à venir pour situer l'offre.
  const shownLanguages = allLanguages.filter((language) => selectable.includes(language.id) || language.status === 'available');
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
          // La langue ne concerne que les invitations d'élèves (le serveur refuse les autres).
          ...(learnerInvite && languageId ? { languageId } : {}),
        },
      }));
    } catch (requestError) {
      setError(getError(requestError));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Drawer title={admin ? 'Inviter un utilisateur' : 'Inviter un élève'} onClose={onClose}
      description="La personne reçoit un lien d’activation par e-mail."
      footer={<>
        <button className="btn btn-outline" type="button" onClick={onClose}>Fermer</button>
        <button className="btn btn-primary" type="submit" form="admin-invite-form" disabled={busy}>
          <Send size={17} aria-hidden="true" /> {busy ? 'Envoi en cours…' : 'Envoyer l’invitation'}
        </button>
      </>}>
      <form id="admin-invite-form" className="admin-form" onSubmit={submit}>
        {admin && (
          <div className="admin-form-block">
            <span className="admin-field-label">Rôle</span>
            <Segmented label="Rôle" options={inviteRoles} value={role} onChange={setRole} />
            <p className="admin-hint">{inviteRoleHints[role]}</p>
          </div>
        )}
        <label>Nom complet<input name="displayName" autoComplete="name" required maxLength={140} placeholder="Prénom Nom" /></label>
        <label>Adresse e-mail<input name="email" type="email" autoComplete="email" required maxLength={254} placeholder="prenom.nom@exemple.fr" /></label>
        {admin && role === 'learner' && (
          <label>Professeur référent
            <select name="teacherId" defaultValue="">
              <option value="">Aucun : élève autonome</option>
              {teachers.map((teacher) => <option key={teacher.id} value={teacher.id}>{teacher.displayName}</option>)}
            </select>
          </label>
        )}
        {learnerInvite && (
          <div className="admin-form-block">
            <LanguagePicker label="Langue apprise" languages={shownLanguages} selectable={selectable} value={languageId}
              onChange={setLanguageId} className="staff-invite-languages"
              description={admin ? 'L’élève commencera son parcours dans cette langue.' : 'Parmi les langues que vous enseignez. Les autres langues ouvriront bientôt.'} />
          </div>
        )}
        <Callout tone="info" title="Valable sept jours">Inviter de nouveau la même adresse renvoie l’invitation existante.</Callout>
        {error && <div role="alert"><Callout tone="warning">{error}</Callout></div>}
      </form>
    </Drawer>
  );
}

/** `learnersOnly` : vue d'un professeur, qui n'invite que des élèves (la colonne Rôle n'apporte rien). */
export function InvitationsPanel({ token, refresh, learnersOnly = false }: { token: string; refresh: number; learnersOnly?: boolean }) {
  const toast = useToast();
  const [invitations, setInvitations] = useState<Invitation[] | null>(null);
  const [loadError, setLoadError] = useState('');
  const [actionError, setActionError] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const [reload, setReload] = useState(0);
  const [status, setStatus] = useState<InvitationStatus | null>(null);
  const [query, setQuery] = useState('');
  const [cancelling, setCancelling] = useState<Invitation | null>(null);

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
    try {
      const id = encodeURIComponent(invitation.id);
      const updated = action === 'resend'
        ? await requestApi<Invitation>(`/invitations/${id}/resend`, token, { method: 'POST' })
        : await requestApi<Invitation>(`/invitations/${id}/cancel`, token, { method: 'POST' });
      setInvitations((current) => current?.map((item) => item.id === updated.id ? updated : item) ?? [updated]);
      toast(action === 'resend' ? `Invitation renvoyée à ${updated.email}.` : `Invitation de ${updated.email} annulée.`);
    } catch (error) {
      setActionError(getError(error));
    } finally {
      setBusy(null);
    }
  }

  const counts = useMemo(() => {
    const result: Record<InvitationStatus, number> = { pending: 0, accepted: 0, expired: 0, cancelled: 0 };
    for (const invitation of invitations ?? []) result[invitation.status] += 1;
    return result;
  }, [invitations]);
  const search = normalize(query.trim());
  const visible = (invitations ?? []).filter((invitation) => (!status || invitation.status === status)
    && (!search || normalize(`${invitation.displayName} ${invitation.email}`).includes(search)));

  return (
    <section className="kit-card is-flush admin-panel lc-enter" aria-label="Invitations envoyées">
      <div className="admin-panel-head">
        <Toolbar>
          <SearchField value={query} onChange={setQuery} label="Rechercher une invitation" placeholder="Nom ou adresse e-mail" />
          <button className="icon-button admin-refresh" type="button" onClick={() => setReload((count) => count + 1)} aria-label="Actualiser les invitations" title="Actualiser">
            <RefreshCw size={18} aria-hidden="true" />
          </button>
        </Toolbar>
        <div className="admin-filter-row">
          <div className="admin-chips" role="group" aria-label="Filtrer par état">
            <Chip selected={status === null} onClick={() => setStatus(null)}>Toutes <span className="admin-chip-count">{invitations?.length ?? 0}</span></Chip>
            {(Object.keys(invitationStatus) as InvitationStatus[]).map((key) => (
              <Chip key={key} selected={status === key} onClick={() => setStatus(status === key ? null : key)}>
                {invitationStatus[key].filter} <span className="admin-chip-count">{counts[key]}</span>
              </Chip>
            ))}
          </div>
        </div>
      </div>
      {actionError && <div className="admin-panel-message" role="alert"><Callout tone="warning">{actionError}</Callout></div>}
      {loadError ? <div className="admin-panel-message" role="alert"><Callout tone="warning">{loadError}</Callout></div>
        : invitations === null ? <div className="admin-panel-message"><SkeletonCard lines={4} label="Chargement des invitations…" /></div>
        : invitations.length === 0 ? <EmptyState icon={<Send size={26} />} title="Aucune invitation" description="Les invitations envoyées apparaîtront ici, avec leur état." />
        : visible.length === 0 ? <EmptyState icon={<Send size={26} />} title="Aucune invitation pour ce filtre" description="Modifiez la recherche ou choisissez un autre état."
          action={<button type="button" className="btn btn-soft btn-sm" onClick={() => { setStatus(null); setQuery(''); }}>Tout afficher</button>} />
        : (
          <div className="admin-table-wrap">
            <table className="admin-table admin-invitations-table">
              <thead><tr>
                <th scope="col">Personne</th>{!learnersOnly && <th scope="col">Rôle</th>}<th scope="col">État</th>
                <th scope="col">Dernier envoi</th><th scope="col"><span className="sr-only">Actions</span></th>
              </tr></thead>
              <tbody className="lc-stagger">
                {visible.map((invitation) => {
                  const state = invitationStatus[invitation.status];
                  const StateIcon = state.icon;
                  const open = invitation.status === 'pending' || invitation.status === 'expired';
                  return (
                    <tr key={invitation.id} className={open ? undefined : 'is-closed'}>
                      <th scope="row" className="admin-cell-person">
                        <span className="admin-person">
                          <Avatar name={invitation.displayName} size={36} />
                          <span><strong>{invitation.displayName}</strong><small>{invitation.email}</small>
                            {invitation.role === 'learner' && invitation.languageId && <span className="staff-language"><Languages size={12} aria-hidden="true" />{languageName(invitation.languageId)}</span>}</span>
                        </span>
                      </th>
                      {!learnersOnly && <td className="admin-cell-role">
                        <span className="admin-cell-stack">
                          <RoleBadge role={invitation.role} />
                          {invitation.role === 'learner' && <small>{invitation.teacherName ? `Avec ${invitation.teacherName}` : 'Autonome'}</small>}
                        </span>
                      </td>}
                      <td className="admin-cell-state">
                        <span className="admin-cell-stack">
                          <Badge tone={state.tone}><StateIcon size={13} aria-hidden="true" />{state.label}</Badge>
                          {invitation.status === 'pending' && invitation.sendCount === 0 && <small className="is-warning">Envoi à relancer</small>}
                          {invitation.status === 'pending' && <small>Expire le {formatDate(invitation.expiresAt)}</small>}
                          {invitation.status === 'expired' && <small>Depuis le {formatDate(invitation.expiresAt)}</small>}
                          {invitation.status === 'accepted' && <small>Le {formatDate(invitation.acceptedAt)}</small>}
                        </span>
                      </td>
                      <td className="admin-cell-sent">
                        <span className="admin-cell-stack">
                          <span>{invitation.lastSentAt ? formatRelative(invitation.lastSentAt) : 'Pas encore envoyée'}</span>
                          <small>{invitation.sendCount > 1 ? `${invitation.sendCount} envois` : invitation.invitedByName ? `Par ${invitation.invitedByName}` : ''}</small>
                        </span>
                      </td>
                      <td className="admin-cell-actions">
                        {open && (
                          <span className="admin-actions">
                            <button type="button" className="btn btn-soft btn-sm" disabled={busy !== null} onClick={() => void act(invitation, 'resend')}
                              aria-label={`Renvoyer l’invitation de ${invitation.email}`}><Send size={15} aria-hidden="true" /> Renvoyer</button>
                            <button type="button" className="btn btn-ghost btn-sm admin-cancel" disabled={busy !== null} onClick={() => setCancelling(invitation)}
                              aria-label={`Annuler l’invitation de ${invitation.email}`}><X size={15} aria-hidden="true" /> Annuler</button>
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
      {invitations && invitations.length > 0 && (
        <p className="admin-panel-foot">{visible.length} invitation{visible.length > 1 ? 's' : ''} affichée{visible.length > 1 ? 's' : ''} sur {invitations.length}</p>
      )}
      {cancelling && (
        <Dialog title="Annuler cette invitation ?" onClose={() => setCancelling(null)}>
          <div className="admin-confirm">
            <p>Le lien envoyé à <strong>{cancelling.email}</strong> ne fonctionnera plus. Vous pourrez inviter de nouveau cette adresse plus tard.</p>
            <div className="admin-confirm-actions">
              <button type="button" className="btn btn-outline" onClick={() => setCancelling(null)}>Garder l’invitation</button>
              <button type="button" className="btn btn-danger" onClick={() => { const target = cancelling; setCancelling(null); void act(target, 'cancel'); }}>
                <X size={17} aria-hidden="true" /> Annuler l’invitation
              </button>
            </div>
          </div>
        </Dialog>
      )}
    </section>
  );
}

const roleFilters: { value: AccountRole; label: string }[] = [
  { value: 'learner', label: 'Élèves' }, { value: 'teacher', label: 'Professeurs' },
  { value: 'staff', label: 'Équipe' }, { value: 'admin', label: 'Administration' },
];

function Attachment({ user, learners }: { user: AdminUser; learners: number }) {
  if (user.role !== 'learner') {
    const followed = user.role === 'teacher' ? <small>{learners ? `${learners} élève${learners > 1 ? 's' : ''} suivi${learners > 1 ? 's' : ''}` : 'Aucun élève suivi'}</small> : null;
    if (user.role === 'admin') return <span className="admin-muted">Accès complet</span>;
    return user.permissions.length || followed
      ? <span className="admin-permissions">{followed}{user.permissions.map((item) => <span key={item}>{permissionNames[item]}</span>)}</span>
      : <span className="admin-muted">Aucune permission</span>;
  }
  const language = <span className={`staff-language${user.languageId ? '' : ' is-empty'}`}><Languages size={12} aria-hidden="true" />{user.languageId ? languageName(user.languageId) : 'Langue à choisir'}</span>;
  if (user.teacherName) {
    return (
      <span className="staff-attach-stack">
        <span className="admin-attach"><Avatar name={user.teacherName} size={24} /><span>{user.teacherName}<small>Professeur référent</small></span></span>
        {user.languageId !== undefined && language}
      </span>
    );
  }
  return (
    <span className="staff-attach-stack">
      <span className="admin-attach is-autonomous">
        <span className="admin-attach-icon" aria-hidden="true"><UserRound size={14} /></span>
        <span>Autonome<small>{user.reviewerName ? `Correcteur : ${user.reviewerName}` : 'Sans correcteur désigné'}</small></span>
      </span>
      {user.languageId !== undefined && language}
    </span>
  );
}

export function UsersPanel({ profile, token }: { profile: Profile; token: string }) {
  const [refresh, setRefresh] = useState(0);
  const { users, error } = useAdminUsers(token, true, refresh);
  const [role, setRole] = useState<AccountRole | null>(null);
  const [state, setState] = useState<'all' | 'active' | 'disabled'>('all');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  const search = normalize(query.trim());
  const visible = useMemo(() => (users ?? []).filter((user) => (!role || user.role === role)
    && (state === 'all' || user.status === state)
    && (!search || normalize(`${user.displayName} ${user.email ?? ''}`).includes(search))), [users, role, state, search]);
  const roleCount = (value: AccountRole) => (users ?? []).filter((user) => user.role === value).length;
  const disabledCount = (users ?? []).filter((user) => user.status === 'disabled').length;
  const followers = useMemo(() => {
    const result = new Map<string, number>();
    for (const user of users ?? []) if (user.teacherId && user.status === 'active') result.set(user.teacherId, (result.get(user.teacherId) ?? 0) + 1);
    return result;
  }, [users]);

  function openRow(event: MouseEvent<HTMLTableRowElement>, id: string) {
    if ((event.target as HTMLElement).closest('button, a')) return;
    setSelected(id);
  }

  return (
    <section className="kit-card is-flush admin-panel lc-enter" aria-labelledby="admin-users-title">
      <h2 id="admin-users-title" className="sr-only">Comptes</h2>
      <div className="admin-panel-head">
        <Toolbar>
          <SearchField value={query} onChange={setQuery} label="Rechercher un compte" placeholder="Nom ou adresse e-mail" />
          <button className="icon-button admin-refresh" type="button" onClick={() => setRefresh((count) => count + 1)} aria-label="Actualiser les comptes" title="Actualiser">
            <RefreshCw size={18} aria-hidden="true" />
          </button>
        </Toolbar>
        <div className="admin-filter-row">
          <div className="admin-chips" role="group" aria-label="Filtrer par rôle">
            <Chip selected={role === null} onClick={() => setRole(null)}>Tous <span className="admin-chip-count">{users?.length ?? 0}</span></Chip>
            {roleFilters.map((item) => (
              <Chip key={item.value} selected={role === item.value} onClick={() => setRole(role === item.value ? null : item.value)}>
                {item.label} <span className="admin-chip-count">{roleCount(item.value)}</span>
              </Chip>
            ))}
          </div>
          <div className="admin-chips" role="group" aria-label="Filtrer par état">
            {(['active', 'disabled'] as const).map((value) => (
              <Chip key={value} selected={state === value} onClick={() => setState(state === value ? 'all' : value)}>
                <i className={`admin-dot${value === 'active' ? ' is-active' : ''}`} aria-hidden="true" />
                {value === 'active' ? 'Actifs' : 'Désactivés'} <span className="admin-chip-count">{value === 'active' ? (users?.length ?? 0) - disabledCount : disabledCount}</span>
              </Chip>
            ))}
          </div>
        </div>
      </div>
      {error ? <div className="admin-panel-message" role="alert"><Callout tone="warning">{error}</Callout></div>
        : users === null ? <div className="admin-panel-message"><SkeletonCard lines={5} label="Chargement des comptes…" /></div>
        : visible.length === 0 ? <EmptyState icon={<UsersRound size={26} />} title="Aucun compte pour ce filtre" description="Modifiez la recherche ou les filtres."
          action={<button type="button" className="btn btn-soft btn-sm" onClick={() => { setRole(null); setState('all'); setQuery(''); }}>Tout afficher</button>} />
        : (
          <div className="admin-table-wrap">
            <table className="admin-table admin-users-table">
              <thead><tr>
                <th scope="col">Compte</th><th scope="col">Rôle</th><th scope="col">Rattachement et accès</th>
                <th scope="col">Dernière activité</th><th scope="col">État</th><th scope="col"><span className="sr-only">Fiche</span></th>
              </tr></thead>
              <tbody className="lc-stagger">
                {visible.map((user) => (
                  <tr key={user.id} className={`is-clickable${user.status === 'disabled' ? ' is-disabled' : ''}${selected === user.id ? ' is-selected' : ''}`}
                    onClick={(event) => openRow(event, user.id)}>
                    <th scope="row" className="admin-cell-person">
                      <span className="admin-person">
                        <Avatar name={user.displayName} size={38} />
                        <span><strong>{user.displayName}{user.id === profile.id && <em className="admin-you">vous</em>}</strong>
                          <small>{user.email ?? 'Adresse non liée à une invitation'}</small></span>
                      </span>
                    </th>
                    <td className="admin-cell-role"><RoleBadge role={user.role} /></td>
                    <td className="admin-cell-attach"><Attachment user={user} learners={followers.get(user.id) ?? 0} /></td>
                    <td className="admin-cell-seen">
                      {user.lastSeenAt ? <span className="admin-cell-stack"><span><span className="admin-mobile-label">Dernière activité </span>{formatRelative(user.lastSeenAt)}</span><small>{formatDate(user.lastSeenAt, true)}</small></span>
                        : <span className="admin-muted">{user.activatedAt ? 'Jamais connecté' : 'Pas encore activé'}</span>}
                    </td>
                    <td className="admin-cell-state"><StateBadge active={user.status === 'active'} /></td>
                    <td className="admin-cell-open">
                      <button type="button" className="icon-button admin-open" onClick={() => setSelected(user.id)} aria-label={`Ouvrir la fiche de ${user.displayName}`} title="Ouvrir la fiche">
                        <ChevronRight size={18} aria-hidden="true" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      {users && users.length > 0 && (
        <p className="admin-panel-foot">{visible.length} compte{visible.length > 1 ? 's' : ''} affiché{visible.length > 1 ? 's' : ''} sur {users.length}</p>
      )}
      {selected && users && (
        <UserSheet userId={selected} token={token} users={users} currentUserId={profile.id}
          onClose={() => setSelected(null)} onChanged={() => setRefresh((count) => count + 1)} />
      )}
    </section>
  );
}
