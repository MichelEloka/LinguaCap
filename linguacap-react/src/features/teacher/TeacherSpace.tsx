import { useState, type FormEvent, type ReactNode } from 'react';
import {
  Bell,
  CalendarDays,
  Check,
  ClipboardCheck,
  Clock3,
  GraduationCap,
  Mail,
  MessageCircle,
  Search,
  Target,
  Users,
} from 'lucide-react';
import { Link, Route, Routes, useParams, useSearchParams } from 'react-router-dom';
import {
  Badge,
  Dialog,
  EmptyState,
  PageHeading,
  ProgressBar,
  StatCard,
} from '../../components/ui';
import { useDemo } from '../../demo/context';
import { learnerId, teacherName } from '../../demo/data';
import type { Assessment, Level, Pace, Student, StudentStatus } from '../../domain/types';
import './teacher.css';

const base = '/professeur';
const statusLabels: Record<StudentStatus, string> = {
  'on-track': 'En bonne voie',
  'at-risk': 'À relancer',
  review: 'À corriger',
};
const statusTones: Record<StudentStatus, 'green' | 'amber' | 'violet'> = {
  'on-track': 'green',
  'at-risk': 'amber',
  review: 'violet',
};

function dateLabel(value: string) {
  const date = new Date(value.length === 10 ? `${value}T12:00:00` : value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' }).format(date);
}

function normalize(value: string) {
  return value.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim();
}

function teacherStudents(students: Student[]) {
  return students.filter((student) => student.teacher === teacherName);
}

function StudentAvatar({ name }: { name: string }) {
  const initials = name.split(' ').filter(Boolean).slice(0, 2).map((word) => word[0]).join('');
  return <span className="teacher-avatar" aria-hidden="true">{initials}</span>;
}

function InviteButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button className="btn btn-primary" onClick={() => setOpen(true)} type="button">
        <Mail size={17} aria-hidden="true" /> Inviter un élève
      </button>
      {open && <InviteDialog onClose={() => setOpen(false)} />}
    </>
  );
}

function InviteDialog({ onClose }: { onClose: () => void }) {
  const { state, update, notify } = useDemo();
  const [error, setError] = useState('');

  function invite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get('name') ?? '').trim();
    const email = String(form.get('email') ?? '').toLowerCase().trim();
    if (!name || !email) return;

    const alreadyEnrolled = state.students.some((student) => student.email.toLowerCase() === email);
    const pending = state.invitations.some(
      (invitation) => invitation.email.toLowerCase() === email && invitation.status === 'pending',
    );
    if (alreadyEnrolled || pending) {
      setError(alreadyEnrolled ? 'Cette adresse correspond déjà à un élève.' : 'Une invitation est déjà en attente pour cette adresse.');
      return;
    }

    update((current) => ({
      ...current,
      invitations: [
        ...current.invitations,
        {
          id: crypto.randomUUID(),
          name,
          email,
          role: 'learner',
          teacher: teacherName,
          status: 'pending',
          createdAt: new Date().toISOString(),
        },
      ],
    }));
    notify('Invitation ajoutée aux invitations de démonstration.');
    onClose();
  }

  return (
    <Dialog title="Inviter un élève" onClose={onClose}>
      <form className="teacher-form stack" onSubmit={invite} onChange={() => setError('')}>
        <p className="muted">L’invitation sera enregistrée dans cet espace de démonstration.</p>
        <label>Nom complet<input autoFocus name="name" autoComplete="name" required maxLength={90} placeholder="Alice Martin" /></label>
        <label>Adresse e-mail<input name="email" type="email" autoComplete="email" required maxLength={120} placeholder="alice@example.com" /></label>
        {error && <p className="teacher-form-error" role="alert">{error}</p>}
        <div className="teacher-form-actions">
          <button type="button" className="btn btn-outline" onClick={onClose}>Annuler</button>
          <button type="submit" className="btn btn-primary">Préparer l’invitation</button>
        </div>
      </form>
    </Dialog>
  );
}

function Roster({ students }: { students: Student[] }) {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<StudentStatus | 'all'>('all');
  const results = students.filter((student) => {
    const matchesStatus = status === 'all' || student.status === status;
    return matchesStatus && normalize(`${student.name} ${student.level} ${student.email}`).includes(normalize(search));
  });

  return (
    <section className="panel teacher-roster" aria-labelledby="roster-title">
      <div className="teacher-panel-heading">
        <div><h2 id="roster-title">Mes élèves</h2><p className="muted">{students.length} parcours accompagnés</p></div>
        <Badge tone="blue">Allemand A1 · A2</Badge>
      </div>
      <div className="teacher-tools">
        <label className="teacher-search">
          <Search size={18} aria-hidden="true" />
          <input aria-label="Rechercher un élève" type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Rechercher un élève" />
        </label>
        <div className="teacher-filters" aria-label="Filtrer les élèves">
          {(['all', 'on-track', 'at-risk', 'review'] as const).map((item) => (
            <button key={item} type="button" onClick={() => setStatus(item)} aria-pressed={status === item}>
              {item === 'all' ? 'Tous' : statusLabels[item]}
            </button>
          ))}
        </div>
      </div>
      {results.length > 0 ? (
        <div className="table-wrap teacher-table-wrap">
          <table className="teacher-table">
            <thead><tr><th scope="col">Élève</th><th scope="col">Niveau</th><th scope="col">Progression</th><th scope="col">Statut</th><th scope="col"><span className="teacher-sr-only">Consulter</span></th></tr></thead>
            <tbody>
              {results.map((student) => (
                <tr key={student.id}>
                  <th scope="row">
                    <div className="teacher-person">
                      <StudentAvatar name={student.name} />
                      <div><strong>{student.name}</strong><small>{dateLabel(student.lastActivity)}</small></div>
                    </div>
                  </th>
                  <td><Badge tone="neutral">{student.level}</Badge></td>
                  <td><div className="teacher-progress"><ProgressBar value={student.progress} label={`Progression de ${student.name}`} /><strong>{student.progress} %</strong></div></td>
                  <td><Badge tone={statusTones[student.status]}>{statusLabels[student.status]}</Badge></td>
                  <td><Link className="teacher-text-link" to={`${base}/eleves/${student.id}`} aria-label={`Voir la fiche de ${student.name}`}>Voir</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : <EmptyState title="Aucun élève trouvé" description="Essayez un autre nom, un autre niveau ou un autre filtre." />}
      <p className="teacher-table-summary muted" aria-live="polite">{results.length} sur {students.length} élèves affichés</p>
    </section>
  );
}

function PendingInvitations() {
  const { state, update, notify } = useDemo();
  const invitations = state.invitations.filter((invitation) => invitation.teacher === teacherName && invitation.status === 'pending');
  if (!invitations.length) return null;

  return (
    <section className="panel">
      <div className="teacher-panel-heading">
        <div><h2>Invitations en attente</h2><p className="muted">Suivez les demandes préparées depuis votre espace.</p></div>
        <Badge tone="amber">{invitations.length} en attente</Badge>
      </div>
      <div className="teacher-list">
        {invitations.map((invitation) => (
          <div className="teacher-list-row" key={invitation.id}>
            <div className="teacher-person"><StudentAvatar name={invitation.name} /><div><strong>{invitation.name}</strong><small>{invitation.email}</small></div></div>
            <button className="btn btn-outline teacher-small-button" type="button" onClick={() => {
              update((current) => ({
                ...current,
                invitations: current.invitations.map((item) => item.id === invitation.id ? { ...item, status: 'cancelled' } : item),
              }));
              notify('Invitation annulée.');
            }}>Annuler</button>
          </div>
        ))}
      </div>
    </section>
  );
}

function EncourageButton({ student, compact = false }: { student: Student; compact?: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" className={compact ? 'teacher-text-link' : 'btn btn-primary'} onClick={() => setOpen(true)}>
        <MessageCircle size={16} aria-hidden="true" /> Encourager
      </button>
      {open && <EncouragementDialog student={student} onClose={() => setOpen(false)} />}
    </>
  );
}

function EncouragementDialog({ student, onClose }: { student: Student; onClose: () => void }) {
  const { update, notify } = useDemo();
  const [error, setError] = useState('');

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const body = String(new FormData(event.currentTarget).get('message') ?? '').trim();
    if (!body) {
      setError('Saisissez un message avant de l’envoyer.');
      return;
    }
    update((current) => ({
      ...current,
      messages: [
        ...current.messages,
        { id: crypto.randomUUID(), learnerId: student.id, author: teacherName, body, createdAt: new Date().toISOString() },
      ],
    }));
    notify('Encouragement ajouté au suivi de l’élève.');
    onClose();
  }

  return (
    <Dialog title={`Encourager ${student.name.split(' ')[0]}`} onClose={onClose}>
      <form className="teacher-form stack" onSubmit={submit}>
        <p className="muted">Proposez une prochaine étape concrète. Votre message sera visible dans l’espace élève correspondant.</p>
        <label>Message<textarea name="message" rows={5} required maxLength={500} placeholder="Reprenons avec une séance cette semaine. Vous pouvez commencer par…" /></label>
        {error && <p className="teacher-form-error" role="alert">{error}</p>}
        <div className="teacher-form-actions"><button type="button" className="btn btn-outline" onClick={onClose}>Annuler</button><button type="submit" className="btn btn-primary">Envoyer</button></div>
      </form>
    </Dialog>
  );
}

function AlertsPanel({ students }: { students: Student[] }) {
  const { state } = useDemo();
  const latest = (id: string) => {
    const messages = state.messages.filter((message) => message.learnerId === id);
    return messages[messages.length - 1];
  };
  return (
    <section className="panel teacher-alert-panel">
      <div className="teacher-panel-heading teacher-alert-heading">
        <span className="teacher-action-icon teacher-action-amber"><Bell size={20} aria-hidden="true" /></span>
        <div><h2>Alertes de retard</h2><p className="muted">Élèves dont le prochain jalon est à risque.</p></div>
      </div>
      {students.length > 0 ? (
        <div className="teacher-list">
          {students.map((student) => {
            const latestMessage = latest(student.id);
            return (
              <div key={student.id} className="teacher-alert-row">
                <div className="teacher-person">
                  <StudentAvatar name={student.name} />
                  <div>
                    <Link to={`${base}/eleves/${student.id}`}><strong>{student.name}</strong></Link>
                    <small>{latestMessage ? `Dernier encouragement · ${dateLabel(latestMessage.createdAt)}` : `Échéance · ${dateLabel(student.targetDate)}`}</small>
                  </div>
                </div>
                <EncourageButton student={student} compact />
              </div>
            );
          })}
        </div>
      ) : <EmptyState title="Aucun retard signalé" description="Les alertes de vos élèves apparaîtront ici." />}
    </section>
  );
}

function DashboardPage() {
  const { state } = useDemo();
  const students = teacherStudents(state.students);
  const atRisk = students.filter((student) => student.status === 'at-risk');
  const pending = state.assessments.filter((assessment) => assessment.status === 'submitted' && students.some((student) => student.id === assessment.learnerId));

  return (
    <div className="teacher-space">
      <PageHeading title={`Bonjour ${teacherName.split(' ')[0]}`} description="Suivez les parcours de vos élèves et retrouvez les actions prioritaires." eyebrow="Espace professeur" action={<InviteButton />} />
      <div className="teacher-stats">
        <StatCard label="Élèves accompagnés" value={students.length} note="Allemand · A1 et A2" icon={<Users size={20} aria-hidden="true" />} />
        <StatCard label="En bonne voie" value={students.filter((student) => student.status === 'on-track').length} note="Progression dans les délais" icon={<Target size={20} aria-hidden="true" />} />
        <StatCard label="Élèves à relancer" value={atRisk.length} note="Retard à examiner" icon={<Bell size={20} aria-hidden="true" />} />
        <StatCard label="Copies à corriger" value={pending.length} note="Évaluations remises" icon={<ClipboardCheck size={20} aria-hidden="true" />} />
      </div>
      <div className="teacher-overview-grid">
        <Roster students={students} />
        <aside className="teacher-aside stack" aria-label="Actions prioritaires">
          <AlertsPanel students={atRisk.slice(0, 3)} />
          <section className="teacher-dark-card">
            <span className="teacher-action-icon"><ClipboardCheck size={22} aria-hidden="true" /></span>
            <h2>Corrections</h2>
            <p>{pending.length === 0 ? 'Vous êtes à jour.' : `${pending.length} production${pending.length > 1 ? 's attendent' : ' attend'} votre retour.`}</p>
            <Link className="btn btn-outline" to={`${base}/corrections`}>Ouvrir les corrections</Link>
          </section>
        </aside>
      </div>
      <PendingInvitations />
    </div>
  );
}

function LearnersPage() {
  const { state } = useDemo();
  return (
    <div className="teacher-space">
      <PageHeading title="Mes élèves" description="Consultez les objectifs, les résultats et les invitations de vos élèves." action={<InviteButton />} />
      <Roster students={teacherStudents(state.students)} />
      <PendingInvitations />
    </div>
  );
}

function GoalDialog({ student, onClose }: { student: Student; onClose: () => void }) {
  const { update, state, notify } = useDemo();
  const isDemoLearner = student.id === learnerId;

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const level: Level = form.get('level') === 'A2' ? 'A2' : 'A1';
    const targetDate = String(form.get('targetDate') ?? '');
    const pace: Pace = form.get('pace') === 'Intensif' ? 'Intensif' : 'Standard';
    if (!targetDate) return;
    update((current) => ({
      ...current,
      students: current.students.map((item) => item.id === student.id ? { ...item, level, targetDate } : item),
      goal: isDemoLearner
        ? { ...current.goal, level, targetDate, pace, title: String(form.get('title') ?? '').trim() || current.goal.title }
        : current.goal,
    }));
    notify('Objectif mis à jour.');
    onClose();
  }

  return (
    <Dialog title="Ajuster l’objectif" onClose={onClose}>
      <form className="teacher-form stack" onSubmit={save}>
        <p className="muted">Définissez le cap de {student.name.split(' ')[0]} pour la suite du parcours.</p>
        {isDemoLearner && <label>Objectif<input name="title" defaultValue={state.goal.title} required maxLength={130} /></label>}
        <div className="teacher-form-grid">
          <label>Niveau<select name="level" defaultValue={student.level}><option value="A1">A1</option><option value="A2">A2</option></select></label>
          <label>Date cible<input name="targetDate" type="date" defaultValue={student.targetDate} required /></label>
        </div>
        {isDemoLearner && <label>Rythme<select name="pace" defaultValue={state.goal.pace}><option>Standard</option><option>Intensif</option></select></label>}
        <div className="teacher-form-actions"><button type="button" className="btn btn-outline" onClick={onClose}>Annuler</button><button type="submit" className="btn btn-primary">Enregistrer</button></div>
      </form>
    </Dialog>
  );
}

function StudentPage() {
  const { id } = useParams();
  const { state } = useDemo();
  const [editing, setEditing] = useState(false);
  const student = teacherStudents(state.students).find((item) => item.id === id);

  if (!student) {
    return <EmptyState title="Élève introuvable" description="Retournez à la liste de vos élèves pour accéder à une fiche." action={<Link className="btn btn-primary" to={`${base}/eleves`}>Mes élèves</Link>} />;
  }

  const results = state.assessments.filter((assessment) => assessment.learnerId === student.id);
  const messages = state.messages.filter((message) => message.learnerId === student.id).slice().reverse();
  const liveSessions = student.id === learnerId ? state.sessions.filter((session) => session.completed).length : null;
  return (
    <div className="teacher-space">
      <Link className="teacher-text-link" to={`${base}/eleves`}>Mes élèves</Link>
      <PageHeading title={student.name} description={`Allemand · Niveau ${student.level}`} eyebrow="Fiche de suivi" action={<EncourageButton student={student} />} />
      <div className="teacher-detail-grid">
        <section className="teacher-dark-card teacher-goal-detail">
          <div className="teacher-panel-heading">
            <div className="teacher-person"><StudentAvatar name={student.name} /><div><span>Objectif en cours</span><h2>Allemand {student.level}</h2></div></div>
            <Badge tone={statusTones[student.status]}>{statusLabels[student.status]}</Badge>
          </div>
          {student.id === learnerId && <p>{state.goal.title}</p>}
          <div className="teacher-goal-info">
            <span><CalendarDays size={17} aria-hidden="true" /> Échéance {dateLabel(student.targetDate)}</span>
            <span><Clock3 size={17} aria-hidden="true" /> Activité {dateLabel(student.lastActivity)}</span>
          </div>
          <div className="teacher-goal-progress"><ProgressBar value={student.progress} label="Progression du parcours" /><strong>{student.progress} %</strong></div>
          <button className="btn btn-outline" type="button" onClick={() => setEditing(true)}>Ajuster l’objectif</button>
        </section>
        <section className="panel">
          <div className="teacher-panel-heading"><div><h2>Évaluations</h2>{liveSessions !== null && <p className="muted">{liveSessions} séance{liveSessions === 1 ? '' : 's'} terminée{liveSessions === 1 ? '' : 's'}</p>}</div></div>
          {results.length > 0 ? <div className="teacher-list">
            {results.map((result) => (
              <div className="teacher-list-row" key={result.id}>
                <div><strong>{result.title}</strong><div className="teacher-row-meta">{dateLabel(result.dueDate)} · {result.type}</div></div>
                {result.status === 'submitted' ? <Link className="teacher-text-link" to={`${base}/corrections?copie=${result.id}`}>Corriger</Link> : result.status === 'reviewed' ? <Badge tone="green">{result.score ?? '—'} / 100</Badge> : <Badge tone="neutral">À venir</Badge>}
              </div>
            ))}
          </div> : <EmptyState title="Aucune évaluation" description="Les prochaines évaluations apparaîtront dans cette fiche." />}
        </section>
      </div>
      <section className="panel">
        <div className="teacher-panel-heading"><div><h2>Encouragements</h2><p className="muted">Messages partagés avec l’élève.</p></div><EncourageButton student={student} compact /></div>
        {messages.length ? <div className="teacher-list">{messages.map((message) => <article className="teacher-list-row teacher-message-row" key={message.id}><div><strong>{message.author}</strong><p>{message.body}</p></div><time dateTime={message.createdAt} className="muted">{dateLabel(message.createdAt)}</time></article>)}</div> : <EmptyState title="Aucun message" description="Vous pouvez proposer à l’élève une prochaine étape." />}
      </section>
      {editing && <GoalDialog student={student} onClose={() => setEditing(false)} />}
    </div>
  );
}

function GradeDialog({ assessment, student, onClose }: { assessment: Assessment; student: Student; onClose: () => void }) {
  const { update, notify } = useDemo();
  const [error, setError] = useState('');

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const scoreInput = String(form.get('score') ?? '').trim();
    const score = Number(scoreInput);
    const feedback = String(form.get('feedback') ?? '').trim();
    if (!scoreInput || !Number.isInteger(score) || score < 0 || score > 100 || !feedback) {
      setError('Renseignez une note entière entre 0 et 100 et un commentaire.');
      return;
    }
    update((current) => {
      const assessments = current.assessments.map((item) => item.id === assessment.id
        ? { ...item, status: 'reviewed' as const, score, feedback }
        : item);
      const hasPending = assessments.some((item) => item.learnerId === student.id && item.status === 'submitted');
      return {
        ...current,
        assessments,
        students: hasPending ? current.students : current.students.map((item) => item.id === student.id && item.status === 'review' ? { ...item, status: 'on-track' } : item),
      };
    });
    notify('Correction publiée dans les résultats de l’élève.');
    onClose();
  }

  return (
    <Dialog title={`Corriger ${assessment.title}`} onClose={onClose}>
      <form className="teacher-form stack" onSubmit={submit}>
        <p className="muted">{student.name} · Allemand {assessment.level}</p>
        {assessment.writing && <section className="teacher-submission"><h3>Réponse écrite</h3><p lang="de">{assessment.writing}</p></section>}
        {assessment.audioSrc && <section className="teacher-submission"><h3>Remise orale</h3><audio controls preload="none" src={assessment.audioSrc} aria-label="Enregistrement de l’élève" /></section>}
        <label>Note sur 100<input name="score" type="number" required min={0} max={100} step={1} /></label>
        <label>Retour à l’élève<textarea name="feedback" rows={4} maxLength={1000} required placeholder="Ce qui est acquis et le point à travailler…" /></label>
        {error && <p className="teacher-form-error" role="alert">{error}</p>}
        <div className="teacher-form-actions"><button type="button" className="btn btn-outline" onClick={onClose}>Annuler</button><button type="submit" className="btn btn-primary">Publier la correction</button></div>
      </form>
    </Dialog>
  );
}

function CorrectionsPage() {
  const { state } = useDemo();
  const students = teacherStudents(state.students);
  const [searchParams, setSearchParams] = useSearchParams();
  const selected = searchParams.get('copie');
  const [history, setHistory] = useState(false);
  const items = state.assessments.flatMap((assessment) => {
    const student = students.find((item) => item.id === assessment.learnerId);
    return student && assessment.status === (history ? 'reviewed' : 'submitted') ? [{ assessment, student }] : [];
  });
  const selectedItem = items.find((item) => item.assessment.id === selected && item.assessment.status === 'submitted');

  function select(id: string | null) {
    const next = new URLSearchParams(searchParams);
    if (id) next.set('copie', id);
    else next.delete('copie');
    setSearchParams(next, { replace: true });
  }

  return (
    <div className="teacher-space">
      <PageHeading title="Corrections" description="Écoutez les remises, relisez les productions et publiez un retour à vos élèves." eyebrow="Espace professeur" />
      <section className="panel">
        <div className="teacher-panel-heading">
          <div><h2>{history ? 'Corrections publiées' : 'À corriger'}</h2><p className="muted">{items.length} évaluation{items.length === 1 ? '' : 's'}</p></div>
          <div className="teacher-filters">
            <button type="button" aria-pressed={!history} onClick={() => { setHistory(false); select(null); }}>En attente</button>
            <button type="button" aria-pressed={history} onClick={() => { setHistory(true); select(null); }}>Publiées</button>
          </div>
        </div>
        {items.length > 0 ? <div className="teacher-list">
          {items.map(({ assessment, student }) => (
            <article key={assessment.id} className="teacher-list-row">
              <div className="teacher-person"><StudentAvatar name={student.name} /><div><strong>{assessment.title}</strong><small>{student.name} · {assessment.level}</small>{history && assessment.feedback && <p className="teacher-history-note">{assessment.feedback}</p>}</div></div>
              {history ? <Badge tone="green"><Check size={15} aria-hidden="true" /> {assessment.score ?? '—'} / 100</Badge> : <button className="btn btn-primary teacher-small-button" type="button" onClick={() => select(assessment.id)}>Corriger</button>}
            </article>
          ))}
        </div> : <EmptyState title={history ? 'Aucune correction publiée' : 'Aucune copie à corriger'} description={history ? 'Les résultats apparaîtront ici après publication.' : 'Les prochaines remises seront listées ici.'} />}
      </section>
      {selectedItem && <GradeDialog key={selectedItem.assessment.id} {...selectedItem} onClose={() => select(null)} />}
    </div>
  );
}

function AlertsPage() {
  const { state } = useDemo();
  return (
    <div className="teacher-space">
      <PageHeading title="Alertes" description="Intervenez quand une échéance approche et que des activités restent à terminer." eyebrow="Espace professeur" />
      <AlertsPanel students={teacherStudents(state.students).filter((student) => student.status === 'at-risk')} />
    </div>
  );
}

function TeacherMissingPage() {
  return <EmptyState title="Page introuvable" description="Retournez au tableau de bord professeur." action={<Link className="btn btn-primary" to={base}><GraduationCap size={17} aria-hidden="true" /> Tableau de bord</Link>} />;
}

export default function TeacherSpace(): ReactNode {
  return (
    <Routes>
      <Route index element={<DashboardPage />} />
      <Route path="eleves" element={<LearnersPage />} />
      <Route path="eleves/:id" element={<StudentPage />} />
      <Route path="corrections" element={<CorrectionsPage />} />
      <Route path="alertes" element={<AlertsPage />} />
      <Route path="*" element={<TeacherMissingPage />} />
    </Routes>
  );
}
