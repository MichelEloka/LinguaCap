import { Mail, Plus, Search } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { Badge, Dialog, EmptyState, PageHeading } from '../../components/ui';
import { useDemo } from '../../demo/context';
import { teacherName } from '../../demo/data';
import type { Invitation, Role } from '../../domain/types';

const roleLabels: Record<Role, string> = {
  learner: 'Élève',
  teacher: 'Professeur',
  admin: 'Administrateur',
};

function InvitationForm({ close }: { close: () => void }) {
  const { state, update, notify } = useDemo();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'learner' | 'teacher'>('learner');
  const [error, setError] = useState('');

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const address = email.trim().toLowerCase();
    if (!name.trim() || !address) {
      setError('Indiquez un nom et une adresse e-mail.');
      return;
    }
    if (state.students.some(student => student.email.toLowerCase() === address)
      || state.invitations.some(invitation => invitation.email.toLowerCase() === address && invitation.status === 'pending')) {
      setError('Cette adresse a déjà un compte ou une invitation en attente.');
      return;
    }

    const invitation: Invitation = {
      id: crypto.randomUUID(),
      name: name.trim(),
      email: address,
      role,
      teacher: null,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    update(previous => ({ ...previous, invitations: [invitation, ...previous.invitations] }));
    notify('Invitation enregistrée localement. Aucun e-mail n’a été envoyé.');
    close();
  }

  return (
    <Dialog title="Inviter un utilisateur" onClose={close}>
      <form className="admin-form stack" onSubmit={submit}>
        <p className="muted">L’invitation reste dans cette démonstration locale.</p>
        <div className="form-grid">
          <label>Nom complet<input value={name} onChange={event => setName(event.target.value)} autoComplete="name" maxLength={100} required /></label>
          <label>Rôle
            <select value={role} onChange={event => setRole(event.target.value === 'teacher' ? 'teacher' : 'learner')}>
              <option value="learner">Élève autonome</option>
              <option value="teacher">Professeur</option>
            </select>
          </label>
        </div>
        <label>Adresse e-mail<input type="email" value={email} onChange={event => setEmail(event.target.value)} autoComplete="email" required /></label>
        {error && <p className="admin-error" role="alert">{error}</p>}
        <div className="admin-form-actions">
          <button className="btn btn-outline" type="button" onClick={close}>Annuler</button>
          <button className="btn btn-primary" type="submit"><Mail size={17} /> Préparer l’invitation</button>
        </div>
      </form>
    </Dialog>
  );
}

export default function UsersPage() {
  const { state, update, notify } = useDemo();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | Role>('all');
  const [inviteOpen, setInviteOpen] = useState(false);
  const search = query.trim().toLocaleLowerCase('fr');
  const teacherNames = Array.from(new Set([teacherName, ...state.students.map(student => student.teacher).filter((name): name is string => Boolean(name))]));
  const users = [
    ...state.students.map(student => ({
      id: student.id, name: student.name, email: student.email, role: 'learner' as const, teacher: student.teacher, level: student.level,
    })),
    ...teacherNames.map(name => ({ id: `teacher-${name}`, name, email: '', role: 'teacher' as const, teacher: null, level: null })),
    { id: 'admin', name: 'Administration LinguaCap', email: '', role: 'admin' as const, teacher: null, level: null },
  ].filter(user => (filter === 'all' || user.role === filter) && `${user.name} ${user.email}`.toLocaleLowerCase('fr').includes(search));
  const invitations = state.invitations.filter(invitation => (
    (filter === 'all' || invitation.role === filter)
    && `${invitation.name} ${invitation.email}`.toLocaleLowerCase('fr').includes(search)
  ));

  function assignTeacher(id: string, teacher: string) {
    update(previous => ({
      ...previous,
      students: previous.students.map(student => student.id === id ? { ...student, teacher: teacher || null } : student),
    }));
    notify(teacher ? 'Le professeur référent a été mis à jour.' : 'L’élève est passé en parcours autonome.');
  }

  function cancelInvitation(id: string) {
    update(previous => ({
      ...previous,
      invitations: previous.invitations.map(invitation => invitation.id === id ? { ...invitation, status: 'cancelled' } : invitation),
    }));
    notify('Invitation annulée.');
  }

  return (
    <>
      <PageHeading
        eyebrow="Administration"
        title="Utilisateurs"
        description="Gérez les accès au pilote et rattachez les élèves à un professeur."
        action={<button className="btn btn-primary" onClick={() => setInviteOpen(true)}><Plus size={18} /> Inviter</button>}
      />

      <section className="panel admin-panel" aria-labelledby="admin-users">
        <div className="admin-section-head">
          <h2 id="admin-users">Comptes</h2>
          <Badge tone="neutral">{users.length} affiché{users.length === 1 ? '' : 's'}</Badge>
        </div>
        <div className="admin-toolbar">
          <label className="admin-search">
            <Search size={19} />
            <input aria-label="Rechercher un utilisateur" value={query} onChange={event => setQuery(event.target.value)} placeholder="Rechercher un utilisateur" />
          </label>
          <select aria-label="Filtrer par rôle" value={filter} onChange={event => setFilter(event.target.value as 'all' | Role)}>
            <option value="all">Tous les rôles</option>
            <option value="learner">Élèves</option>
            <option value="teacher">Professeurs</option>
            <option value="admin">Administrateurs</option>
          </select>
        </div>

        {users.length ? (
          <div className="table-wrap admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th scope="col">Nom</th><th scope="col">Rôle</th><th scope="col">Niveau</th><th scope="col">Référent</th></tr></thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td><strong>{user.name}</strong>{user.email && <span className="admin-cell-note">{user.email}</span>}</td>
                    <td><Badge tone={user.role === 'teacher' ? 'violet' : 'blue'}>{roleLabels[user.role]}</Badge></td>
                    <td>{user.level ?? '—'}</td>
                    <td>
                      {user.role === 'learner' ? (
                        <select aria-label={`Professeur référent de ${user.name}`} value={user.teacher ?? ''} onChange={event => assignTeacher(user.id, event.target.value)}>
                          <option value="">Autonome</option>
                          {teacherNames.map(name => <option key={name} value={name}>{name}</option>)}
                        </select>
                      ) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <EmptyState title="Aucun utilisateur trouvé" description="Modifiez votre recherche ou le filtre de rôle." />}
      </section>

      <section className="panel admin-panel admin-section-gap" aria-labelledby="admin-invitations">
        <div className="admin-section-head">
          <div><h2 id="admin-invitations">Invitations</h2><p>Préparées par l’administration ou par un professeur dans la démo.</p></div>
        </div>
        {invitations.length ? (
          <div className="admin-invites">
            {invitations.map(invitation => (
              <article className="admin-invite-row" key={invitation.id}>
                <span className="admin-card-icon"><Mail size={19} /></span>
                <div><strong>{invitation.name}</strong><span className="admin-cell-note">{invitation.email} · {roleLabels[invitation.role]}</span></div>
                <Badge tone={invitation.status === 'pending' ? 'amber' : 'neutral'}>{invitation.status === 'pending' ? 'En attente' : 'Annulée'}</Badge>
                {invitation.status === 'pending' && <button className="btn btn-outline" onClick={() => cancelInvitation(invitation.id)}>Annuler</button>}
              </article>
            ))}
          </div>
        ) : <EmptyState title="Aucune invitation à afficher" description="Les invitations préparées dans la démo apparaîtront ici." />}
      </section>
      {inviteOpen && <InvitationForm close={() => setInviteOpen(false)} />}
    </>
  );
}
