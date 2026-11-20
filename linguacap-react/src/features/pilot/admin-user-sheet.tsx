/** Fiche d'un compte dans le panneau latéral : identité, rôle et permissions, rattachements, historique, accès. */
import { useEffect, useState, type FormEvent } from 'react';
import { BookOpen, CircleCheck, GraduationCap, History, KeyRound, PenLine, Power, ShieldCheck, UserRoundCheck } from 'lucide-react';
import { Dialog } from '../../components/ui';
import { Avatar, Callout, Drawer, Facts, Segmented, SkeletonCard, Timeline, useToast } from '../../design/kit';
import { requestApi, roleNames, type AccountRole, type Permission } from '../../integration/api';
import type { AdminUser } from './AccountsPilot';
import { formatDate, formatRelative, getError, RoleBadge, SheetSection, StateBadge, SwitchRow } from './admin-common';

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

const permissionDetails: Record<Permission, { title: string; description: string; icon: typeof BookOpen }> = {
  catalogue: { title: 'Catalogue', description: 'Niveaux, contenus et médiathèque', icon: BookOpen },
  correction: { title: 'Correction', description: 'Productions des élèves autonomes désignés', icon: PenLine },
};
const staffRoles: { value: Exclude<AccountRole, 'learner'>; label: string }[] = [
  { value: 'teacher', label: 'Professeur' }, { value: 'staff', label: 'Équipe' }, { value: 'admin', label: 'Administration' },
];

/** Liste déroulante et bouton d'enregistrement, actif seulement si le choix diffère de la valeur enregistrée. */
function AssignmentField({ label, value, options, emptyLabel, actionLabel, busy, onSave }: {
  label: string; value: string; options: Pick<AdminUser, 'id' | 'displayName'>[]; emptyLabel: string; actionLabel: string; busy: boolean; onSave: (value: string) => void;
}) {
  const [choice, setChoice] = useState(value);
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSave(choice);
  }
  return (
    <form className="admin-assign" onSubmit={submit}>
      <label>{label}
        <select value={choice} onChange={(event) => setChoice(event.target.value)}>
          <option value="">{emptyLabel}</option>
          {options.map((option) => <option key={option.id} value={option.id}>{option.displayName}</option>)}
        </select>
      </label>
      <button type="submit" className="btn btn-soft" disabled={busy || choice === value}>{actionLabel}</button>
    </form>
  );
}

function AssignmentTimeline({ title, entries, empty }: { title: string; entries: Assignment[]; empty: string }) {
  return (
    <div className="admin-history">
      <h4>{title}</h4>
      {entries.length === 0 ? <p className="admin-history-empty">{empty}</p> : (
        <Timeline items={entries.map((entry) => ({
          id: `${entry.personId}-${entry.startedAt}`,
          title: entry.personName,
          tone: entry.endedAt ? undefined : 'brand',
          icon: entry.endedAt ? <History size={14} /> : <CircleCheck size={14} />,
          meta: <>{entry.endedAt ? `Du ${formatDate(entry.startedAt)} au ${formatDate(entry.endedAt)}` : `Depuis le ${formatDate(entry.startedAt)} · en cours`}
            {entry.assignedByName && ` · par ${entry.assignedByName}`}</>,
        }))} />
      )}
    </div>
  );
}

export function UserSheet({ userId, token, users, currentUserId, onClose, onChanged }: {
  userId: string;
  token: string;
  users: AdminUser[];
  currentUserId: string;
  onClose: () => void;
  onChanged: () => void;
}) {
  const toast = useToast();
  const [detail, setDetail] = useState<AdminUserDetail | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [roleChoice, setRoleChoice] = useState<AccountRole | null>(null);
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
    try {
      setDetail(await requests[path](body));
      setRoleChoice(null);
      toast(message);
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
  const active = user?.status === 'active';
  // La personne actuellement rattachée reste proposée même si elle n'est plus disponible.
  const withCurrent = (list: AdminUser[], id: string | null | undefined, name: string | null | undefined) =>
    id && !list.some((item) => item.id === id) ? [...list, { id, displayName: `${name ?? 'Personne actuelle'} · plus disponible` }] : list;

  function togglePermission(permission: Permission, enabled: boolean) {
    if (!user) return;
    const next = (['catalogue', 'correction'] as Permission[]).filter((item) => item === permission ? enabled : user.permissions.includes(item));
    void change('permissions', { permissions: next },
      `Permission ${permissionDetails[permission].title} ${enabled ? 'accordée' : 'retirée'}.`);
  }

  return (
    <>
      <Drawer title={user ? `Fiche de ${user.displayName}` : 'Fiche du compte'} onClose={onClose}>
        {error && <div role="alert"><Callout tone="warning">{error}</Callout></div>}
        {!detail ? (!error && <SkeletonCard lines={5} label="Chargement de la fiche…" />) : user && (
          <div className="admin-sheet">
            <div className="admin-identity">
              <Avatar name={user.displayName} size={56} />
              <div>
                <strong>{user.displayName}</strong>
                <small>{user.email ?? 'Adresse non liée à une invitation'}</small>
                <span className="admin-identity-badges"><RoleBadge role={user.role} /><StateBadge active={active} /></span>
              </div>
            </div>
            <Facts items={[
              { label: 'Invité le', value: formatDate(user.invitedAt) },
              { label: 'Activé le', value: formatDate(user.activatedAt) },
              { label: 'Dernière activité', value: user.lastSeenAt ? <span title={formatDate(user.lastSeenAt, true)}>{formatRelative(user.lastSeenAt)}</span> : 'Jamais' },
            ]} />

            {user.role === 'learner' ? (
              <>
                <SheetSection icon={<GraduationCap size={18} />} title="Suivi pédagogique"
                  description={user.teacherId ? 'Le professeur suit le parcours et corrige les productions.' : 'Élève autonome : ses productions vont au correcteur désigné.'}>
                  <AssignmentField key={`teacher-${user.teacherId ?? ''}`} label="Professeur référent" value={user.teacherId ?? ''} options={withCurrent(teachers, user.teacherId, user.teacherName)}
                    emptyLabel="Aucun : élève autonome" actionLabel="Réaffecter" busy={busy}
                    onSave={(teacherId) => void change('teacher', { teacherId: teacherId || null }, teacherId ? 'Professeur référent mis à jour.' : 'L’élève est maintenant autonome.')} />
                  {!user.teacherId && (
                    <AssignmentField key={`reviewer-${user.reviewerId ?? ''}`} label="Correcteur désigné" value={user.reviewerId ?? ''} options={withCurrent(reviewers, user.reviewerId, user.reviewerName)}
                      emptyLabel="Aucun correcteur" actionLabel="Désigner" busy={busy}
                      onSave={(reviewerId) => void change('reviewer', { reviewerId: reviewerId || null }, reviewerId ? 'Correcteur désigné.' : 'Désignation retirée.')} />
                  )}
                </SheetSection>
                <SheetSection icon={<History size={18} />} title="Historique des rattachements">
                  <AssignmentTimeline title="Professeurs" entries={detail.teacherHistory} empty="Aucun professeur à ce jour." />
                  <AssignmentTimeline title="Correcteurs" entries={detail.reviewerHistory} empty="Aucun correcteur désigné." />
                </SheetSection>
              </>
            ) : (
              <SheetSection icon={<ShieldCheck size={18} />} title="Rôle et permissions"
                description="Le rôle ouvre un espace ; les permissions ajoutent le catalogue ou la correction.">
                {self ? <Callout tone="info">Vous ne pouvez pas changer votre propre rôle.</Callout> : (
                  <div className="admin-role-picker">
                    <span className="admin-field-label">Rôle</span>
                    <Segmented label="Rôle du compte" options={staffRoles} value={(roleChoice ?? user.role) as Exclude<AccountRole, 'learner'>}
                      onChange={(value) => setRoleChoice(value === user.role ? null : value)} />
                    {roleChoice && roleChoice !== user.role && (
                      <div className="admin-role-confirm">
                        <p>Passer de <strong>{roleNames[user.role]}</strong> à <strong>{roleNames[roleChoice]}</strong> ?</p>
                        <button type="button" className="btn btn-ghost btn-sm" onClick={() => setRoleChoice(null)}>Annuler</button>
                        <button type="button" className="btn btn-primary btn-sm" disabled={busy}
                          onClick={() => void change('role', { role: roleChoice }, `Rôle changé : ${roleNames[roleChoice]}.`)}>
                          Changer le rôle
                        </button>
                      </div>
                    )}
                  </div>
                )}
                <div className="admin-switches" role="group" aria-label="Permissions">
                  {(['catalogue', 'correction'] as Permission[]).map((permission) => {
                    const Icon = permissionDetails[permission].icon;
                    return <SwitchRow key={permission} icon={<Icon size={18} />} title={permissionDetails[permission].title}
                      description={permissionDetails[permission].description} checked={user.permissions.includes(permission)} disabled={busy}
                      onChange={(enabled) => togglePermission(permission, enabled)} />;
                  })}
                </div>
              </SheetSection>
            )}

            <SheetSection icon={active ? <KeyRound size={18} /> : <UserRoundCheck size={18} />} title="Accès au compte" tone={active ? 'danger' : undefined}
              description={active ? 'Le compte peut se connecter et utiliser LinguaCap.' : 'Toutes les actions de ce compte sont refusées.'}>
              {self ? <p className="admin-hint">Vous ne pouvez pas désactiver votre propre compte.</p> : active ? (
                <button type="button" className="btn btn-outline admin-danger-button" disabled={busy} onClick={() => setConfirming(true)}>
                  <Power size={17} aria-hidden="true" /> Désactiver le compte
                </button>
              ) : (
                <button type="button" className="btn btn-primary" disabled={busy}
                  onClick={() => void change('status', { status: 'active' }, 'Compte réactivé.')}>
                  <UserRoundCheck size={17} aria-hidden="true" /> Réactiver le compte
                </button>
              )}
            </SheetSection>
          </div>
        )}
      </Drawer>
      {confirming && user && (
        <Dialog title="Désactiver ce compte ?" onClose={() => setConfirming(false)}>
          <div className="admin-confirm">
            <p><strong>{user.displayName}</strong> ne pourra plus se connecter et toutes ses actions seront refusées. Vous pourrez réactiver le compte à tout moment.</p>
            <div className="admin-confirm-actions">
              <button type="button" className="btn btn-outline" onClick={() => setConfirming(false)}>Annuler</button>
              <button type="button" className="btn btn-danger" disabled={busy} onClick={() => {
                setConfirming(false);
                void change('status', { status: 'disabled' }, `Compte de ${user.displayName} désactivé.`);
              }}><Power size={17} aria-hidden="true" /> Désactiver</button>
            </div>
          </div>
        </Dialog>
      )}
    </>
  );
}
