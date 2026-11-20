import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { Link, Navigate, Route, Routes, useParams } from 'react-router-dom';
import { Bell, CalendarDays, ClipboardCheck, ClipboardList, Mail, MessageCircle, RefreshCw, Search, Send, Target, Users } from 'lucide-react';
import { Badge, EmptyState, PageHeading, StatCard } from '../../components/ui';
import { requestApi, type Profile } from '../../integration/api';
import { InvitationsPanel, InviteDialog, UsersPanel } from './AccountsPilot';
import { CataloguePanel } from './CatalogueEditor';
import { GradingPanel } from './Exams';
import { KpiPanel } from './KpiPanel';
import { MediaLibraryPanel } from './MediaLibrary';
import { LearnerSheetPage } from './LearnerSheet';
import { staffWorkspaceLinks } from './staff-navigation';
import '../teacher/teacher.css';
import './accounts.css';
import './staff-workspace.css';

export interface TrackingAlert {
  id: string; status: 'open' | 'suspended' | 'closed'; reason: string; lateSessions: number; nextMilestone: string | null;
  nextMilestoneDueAt: string | null; midtermOverdue: boolean; openedAt: string; closedAt: string | null; encouragedAt: string | null;
}
export interface TrackingSummary {
  enrollmentId?: string; levelCode?: string | null; goalStatus?: string; targetDate?: string | null; initialTargetDate?: string | null;
  lastActivityAt?: string | null; practiceMinutes?: number; sessionsCompleted?: number; sessionsOnTime?: number;
  pendingGrading?: number; lateSessions?: number; nextDueAt?: string | null; alert?: TrackingAlert | null;
  results?: Record<string, { percent: number; decision: string; onTime: boolean; scores: Record<string, { percent: number }> }>;
}
interface LearnerOverview {
  learnerId: string;
  profile: Pick<Profile, 'id' | 'displayName'> & { teacherId: string | null };
  progress: { completedCount: number; goal: { level: string } | null };
  results: { correct: number; total: number }[];
  tracking?: TrackingSummary;
}

export const goalStatusNames: Record<string, string> = {
  preparing: 'En préparation', active: 'En cours', paused: 'En pause', awaiting_assessment: 'En attente d’évaluation',
  awaiting_grading: 'En attente de correction', validated: 'Validé', to_consolidate: 'À consolider',
};
const shortDate = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' });
const fullDate = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' });

function getError(error: unknown) {
  return error instanceof Error ? error.message : 'Cette action est temporairement indisponible.';
}

function learnerUrl(id: string) {
  return `/espace/eleves/${encodeURIComponent(id)}`;
}

function initials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map(part => part.charAt(0)).join('').toUpperCase();
}

function activeAlert(learner: LearnerOverview) {
  return learner.tracking?.alert?.status === 'open' ? learner.tracking.alert : null;
}

function useOverview(token: string) {
  const [learners, setLearners] = useState<LearnerOverview[] | null>(null);
  const [freshness, setFreshness] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    let active = true;
    setError('');
    requestApi<{ learners: LearnerOverview[]; freshness?: { syncedAt: string | null } }>('/tracking/overview', token).then(
      (data) => { if (active) { setLearners(data.learners); setFreshness(data.freshness?.syncedAt ?? null); } },
      (requestError: unknown) => { if (active) setError(getError(requestError)); },
    );
    return () => { active = false; };
  }, [token, refresh]);

  return { learners, freshness, error, reload: () => setRefresh((count) => count + 1) };
}

function OverviewState({ loading, error, what }: { loading: boolean; error: string; what: string }) {
  if (error) return <p className="inline-message warning" role="alert">{error}</p>;
  return loading ? <p className="muted" role="status">Chargement {what}…</p> : null;
}

function MessageComposer({ learnerId, name, alert, token, onClose, onDone, focus = false }: {
  learnerId: string; name: string; alert?: TrackingAlert | null; token: string;
  onClose?: () => void; onDone: (message: string) => void; focus?: boolean;
}) {
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [text, setText] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    if (!text.trim()) {
      setError('Écrivez un message avant de l’envoyer.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await requestApi<unknown>('/tracking/messages', token, {
        method: 'POST',
        body: { learnerId, text: text.trim(), ...(alert ? { alertId: alert.id } : {}) },
      });
      setText('');
      onDone(`Message envoyé à ${name}.`);
    } catch (requestError) {
      setError(getError(requestError));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="panel staff-composer stack" aria-label={`Encourager ${name}`}>
      <div className="staff-section-heading"><h2>Encouragement</h2><MessageCircle size={19} aria-hidden="true" /></div>
      <form className="teacher-form stack" onSubmit={submit}>
        <label>Destinataire<input value={name} readOnly /></label>
        <label>Message<textarea name="text" rows={4} required maxLength={500} value={text}
          onChange={(event) => setText(event.target.value)} autoFocus={focus} /></label>
        {error && <p className="inline-message warning" role="alert">{error}</p>}
        <div className="staff-form-actions">
          {onClose && <button type="button" className="btn btn-outline" onClick={onClose}>Fermer</button>}
          <button type="submit" className="btn btn-primary" disabled={busy}><Send size={16} aria-hidden="true" /> {busy ? 'Envoi…' : 'Envoyer'}</button>
        </div>
      </form>
    </section>
  );
}

function LearnerTable({ learners, onMessage }: { learners: LearnerOverview[]; onMessage?: (learner: LearnerOverview) => void }) {
  return (
    <div className="table-wrap staff-table-wrap">
      <table className="staff-table">
        <thead><tr>
          <th scope="col">Élève</th><th scope="col">Niveau</th><th scope="col">État</th>
          <th scope="col" className="staff-secondary-cell">Échéance</th><th scope="col" className="staff-secondary-cell">Retard</th>
          <th scope="col" className="staff-grading-cell">Corrections</th><th scope="col">Actions</th>
        </tr></thead>
        <tbody>
          {learners.map((learner) => {
            const tracking = learner.tracking ?? {};
            const level = tracking.levelCode ?? learner.progress.goal?.level ?? '—';
            const name = learner.profile.displayName;
            return (
              <tr key={learner.learnerId}>
                <th scope="row"><Link className="staff-person" to={learnerUrl(learner.learnerId)}>
                  <span className="staff-avatar" aria-hidden="true">{initials(name)}</span>
                  <span>{name}<span className="staff-mobile-level">{level}</span></span>
                </Link></th>
                <td className="staff-level-cell">{level}</td>
                <td><div className="staff-cell-stack">
                  <span>{tracking.goalStatus ? goalStatusNames[tracking.goalStatus] ?? tracking.goalStatus : 'Sans parcours'}</span>
                  {activeAlert(learner) && <Badge tone="amber">Alerte ouverte</Badge>}
                </div></td>
                <td className="staff-secondary-cell">{tracking.nextDueAt ? shortDate.format(new Date(tracking.nextDueAt))
                  : tracking.targetDate ? `Cible · ${shortDate.format(new Date(tracking.targetDate))}` : '—'}</td>
                <td className="staff-secondary-cell">{tracking.lateSessions ?? '—'}</td>
                <td className="staff-grading-cell">{tracking.pendingGrading ? <Badge tone="blue">{tracking.pendingGrading}</Badge> : '—'}</td>
                <td><div className="staff-row-actions">
                  <Link to={learnerUrl(learner.learnerId)} className="staff-icon-action" aria-label={`Voir le suivi de ${name}`} title="Voir le suivi">
                    <ClipboardList size={18} aria-hidden="true" />
                  </Link>
                  {onMessage && <button type="button" className="staff-icon-action" onClick={() => onMessage(learner)}
                    aria-label={`Encourager ${name}`} title="Encourager"><MessageCircle size={18} aria-hidden="true" /></button>}
                </div></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function LearnersPage({ admin, token, onNotice }: { admin: boolean; token: string; onNotice: (message: string) => void }) {
  const { learners, freshness, error, reload } = useOverview(token);
  const [messageTo, setMessageTo] = useState<LearnerOverview | null>(null);
  const [query, setQuery] = useState('');
  const [level, setLevel] = useState('');
  const [state, setState] = useState('');
  const [due, setDue] = useState('');
  const now = Date.now();
  const week = now + 7 * 86_400_000;
  const search = query.trim().toLocaleLowerCase('fr');
  const visible = (learners ?? []).filter((learner) => {
    const tracking = learner.tracking ?? {};
    if (search && !learner.profile.displayName.toLocaleLowerCase('fr').includes(search)) return false;
    if (level && (tracking.levelCode ?? learner.progress.goal?.level) !== level) return false;
    if (state === 'alert' ? tracking.alert?.status !== 'open' : state && tracking.goalStatus !== state) return false;
    if (due === 'late' && !tracking.lateSessions) return false;
    if (due === 'week') {
      const next = tracking.nextDueAt ? new Date(tracking.nextDueAt).getTime() : NaN;
      if (!(next >= now && next <= week)) return false;
    }
    return true;
  }).sort((a, b) => Number(Boolean(activeAlert(b))) - Number(Boolean(activeAlert(a)))
    || (b.tracking?.pendingGrading ?? 0) - (a.tracking?.pendingGrading ?? 0));
  const levels = [...new Set((learners ?? []).flatMap((learner) => {
    const code = learner.tracking?.levelCode ?? learner.progress.goal?.level;
    return code ? [code] : [];
  }))];

  return (
    <div className="staff-page stack">
      <PageHeading title={admin ? 'Élèves' : 'Mes élèves'} description={learners ? `${learners.length} élève${learners.length === 1 ? '' : 's'}` : undefined}
        action={<button className="btn btn-outline" type="button" onClick={reload}><RefreshCw size={17} aria-hidden="true" /> Actualiser</button>} />
      {messageTo && <MessageComposer key={messageTo.learnerId} learnerId={messageTo.learnerId} name={messageTo.profile.displayName}
        alert={activeAlert(messageTo)} token={token} focus onClose={() => setMessageTo(null)} onDone={(message) => {
          setMessageTo(null); reload(); onNotice(message);
        }} />}
      <section className="panel staff-roster" aria-label="Liste des élèves">
        {learners && learners.length > 0 && <div className="staff-filters" role="group" aria-label="Filtrer les élèves">
          <label className="staff-search"><span className="staff-sr-only">Rechercher un élève</span><Search size={18} aria-hidden="true" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Rechercher un élève" /></label>
          <select aria-label="Niveau" value={level} onChange={(event) => setLevel(event.target.value)}>
            <option value="">Tous les niveaux</option>{levels.map((item) => <option key={item}>{item}</option>)}
          </select>
          <select aria-label="État" value={state} onChange={(event) => setState(event.target.value)}>
            <option value="">Tous les états</option><option value="alert">Avec une alerte</option>
            {Object.entries(goalStatusNames).map(([id, label]) => <option key={id} value={id}>{label}</option>)}
          </select>
          <select aria-label="Échéance" value={due} onChange={(event) => setDue(event.target.value)}>
            <option value="">Toutes les échéances</option><option value="late">En retard</option><option value="week">Dans les sept jours</option>
          </select>
        </div>}
        <OverviewState loading={learners === null} error={error} what="des élèves" />
        {learners && !error && (learners.length === 0 ? <EmptyState title="Aucun élève actif" action={<Link to="/espace/invitations" className="btn btn-primary">Invitations</Link>} />
          : visible.length ? <LearnerTable learners={visible} onMessage={admin ? undefined : setMessageTo} />
          : <EmptyState title="Aucun élève ne correspond à ces filtres" />)}
        {freshness && <p className="staff-freshness muted">Actualisé le {fullDate.format(new Date(freshness))}</p>}
      </section>
    </div>
  );
}

function AlertsPage({ admin, token, onNotice }: { admin: boolean; token: string; onNotice: (message: string) => void }) {
  const { learners, error, reload } = useOverview(token);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const alerts = (learners ?? []).filter(learner => activeAlert(learner));
  const selected = alerts.find(learner => learner.learnerId === selectedId) ?? alerts[0];
  const alert = selected ? activeAlert(selected) : null;

  return (
    <div className="staff-page stack">
      <PageHeading title="Alertes" description={learners ? `${alerts.length} alerte${alerts.length === 1 ? ' ouverte' : 's ouvertes'}` : undefined}
        action={<button type="button" onClick={reload} className="btn btn-outline"><RefreshCw size={17} aria-hidden="true" /> Actualiser</button>} />
      <div className="staff-split">
        <section className="panel staff-alert-list" aria-label="Alertes ouvertes">
          <OverviewState loading={!learners} error={error} what="des alertes" />
          {learners && !error && (alerts.length ? alerts.map((learner) => (
            <button type="button" key={learner.learnerId} className="staff-alert-item" aria-pressed={selected?.learnerId === learner.learnerId}
              onClick={() => setSelectedId(learner.learnerId)}>
              <span className="staff-alert-icon"><Bell size={18} aria-hidden="true" /></span>
              <span><strong>{learner.profile.displayName}</strong><small>{activeAlert(learner)?.reason}</small></span>
            </button>
          )) : <EmptyState title="Aucune alerte ouverte" />)}
        </section>
        {selected && alert && !error && <div className="stack staff-side">
          <section className="panel stack">
            <div className="staff-section-heading"><h2>{selected.profile.displayName}</h2><Badge tone="amber">À suivre</Badge></div>
            <p>{alert.reason}</p>
            {alert.nextMilestone && <p className="muted">Prochain jalon · {alert.nextMilestone}{alert.nextMilestoneDueAt ? ` · ${shortDate.format(new Date(alert.nextMilestoneDueAt))}` : ''}</p>}
            {alert.encouragedAt && <p className="muted">Dernier encouragement · {shortDate.format(new Date(alert.encouragedAt))}</p>}
            <Link className="btn btn-outline" to={learnerUrl(selected.learnerId)}>Revoir le planning</Link>
          </section>
          {!admin && <MessageComposer key={selected.learnerId} learnerId={selected.learnerId} name={selected.profile.displayName}
            alert={alert} token={token} onDone={(message) => { reload(); onNotice(message); }} />}
        </div>}
      </div>
    </div>
  );
}

function LearnerDetail({ admin, token, onNotice }: { admin: boolean; token: string; onNotice: (message: string) => void }) {
  const { learnerId = '' } = useParams();
  return <LearnerSheetPage key={learnerId} learnerId={learnerId} token={token}
    renderAside={admin ? undefined : ({ name, alert, reload }) => (
      <MessageComposer learnerId={learnerId} name={name} alert={alert?.status === 'open' ? alert : null} token={token}
        onDone={(message) => { reload(); onNotice(message); }} />
    )} />;
}

function EducatorDashboard({ admin, token }: { admin: boolean; token: string }) {
  const { learners, error } = useOverview(token);
  const alerts = (learners ?? []).filter((learner) => activeAlert(learner));
  const corrections = (learners ?? []).reduce((sum, learner) => sum + (learner.tracking?.pendingGrading ?? 0), 0);

  return (
    <>
      <OverviewState loading={!learners} error={error} what="du suivi" />
      {learners && !error && <>
        <div className="staff-stats">
          <StatCard label={admin ? 'Élèves inscrits' : 'Mes élèves'} value={learners.length} icon={<Users size={20} />} />
          <StatCard label="Parcours définis" value={learners.filter((learner) => learner.progress.goal !== null).length} icon={<Target size={20} />} />
          <StatCard label="Séances terminées" value={learners.reduce((sum, learner) => sum + learner.progress.completedCount, 0)} icon={<CalendarDays size={20} />} />
          <StatCard label="Corrections en attente" value={corrections} icon={<ClipboardCheck size={20} />} />
        </div>
        <div className="staff-split">
          <section className="panel stack">
            <div className="staff-section-heading"><h2>Alertes ouvertes</h2><Badge tone={alerts.length ? 'amber' : 'neutral'}>{alerts.length}</Badge></div>
            {alerts.length ? <ul className="staff-overview-alerts">
              {alerts.slice(0, 4).map((learner) => <li key={learner.learnerId}>
                <Link className="staff-person" to={learnerUrl(learner.learnerId)}>
                  <span className="staff-avatar" aria-hidden="true">{initials(learner.profile.displayName)}</span>
                  <span>{learner.profile.displayName}<small>{activeAlert(learner)?.reason}</small></span>
                </Link>
              </li>)}
            </ul> : <EmptyState title="Aucun élève à relancer" />}
            <Link className="btn btn-outline" to="/espace/alertes">Voir les alertes</Link>
          </section>
          <section className="panel stack staff-quick-actions" aria-label="Actions de suivi">
            <h2>Continuer le suivi</h2>
            <Link className="staff-action-row" to="/espace/eleves"><Users size={19} aria-hidden="true" /><span>{admin ? 'Élèves' : 'Mes élèves'}</span></Link>
            <Link className="staff-action-row" to="/espace/corrections"><ClipboardCheck size={19} aria-hidden="true" /><span>Corrections</span><Badge>{corrections}</Badge></Link>
            <Link className="staff-action-row" to="/espace/invitations"><Mail size={19} aria-hidden="true" /><span>Invitations</span></Link>
          </section>
        </div>
      </>}
    </>
  );
}

function StaffHome({ profile, educator, token }: { profile: Profile; educator: boolean; token: string }) {
  const links = staffWorkspaceLinks(profile).slice(1);
  return (
    <div className="staff-page stack">
      <PageHeading title="Vue d’ensemble" description={profile.displayName} action={educator && (
        <Link className="btn btn-primary" to="/espace/invitations"><Mail size={17} aria-hidden="true" /> Invitations</Link>
      )} />
      {educator ? <EducatorDashboard admin={profile.role === 'admin'} token={token} /> : (
        <section className="panel staff-quick-actions stack" aria-label="Accès au travail">
          {links.length ? links.map(({ path, label, icon: Icon }) => (
            <Link className="staff-action-row" to={path} key={path}><Icon size={19} aria-hidden="true" />{label}</Link>
          )) : <EmptyState title="Aucune permission active" description="L’administration peut vous attribuer la permission Catalogue ou Correction." />}
        </section>
      )}
    </div>
  );
}

function StaffSection({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return <div className="staff-page stack"><PageHeading title={title} description={description} />{children}</div>;
}

function StaffInvitations({ profile, token, onNotice }: { profile: Profile; token: string; onNotice: (notice: string) => void }) {
  const [inviteOpen, setInviteOpen] = useState(false);
  const [refresh, setRefresh] = useState(0);
  return (
    <div className="staff-page stack">
      <PageHeading title="Invitations" description="Une invitation par adresse, valable sept jours, renvoyable tant qu’elle n’est pas acceptée." action={
        <button type="button" className="btn btn-primary" onClick={() => setInviteOpen(true)}>
          <Mail size={17} aria-hidden="true" /> {profile.role === 'admin' ? 'Inviter un utilisateur' : 'Inviter un élève'}
        </button>
      } />
      <InvitationsPanel token={token} refresh={refresh} />
      {inviteOpen && <InviteDialog profile={profile} token={token} onClose={() => setInviteOpen(false)} onDone={(invitation) => {
        setInviteOpen(false);
        setRefresh((count) => count + 1);
        onNotice(`Invitation envoyée à ${invitation.email}.`);
      }} />}
    </div>
  );
}

export function StaffPilot({ profile, token }: { profile: Profile; token: string }) {
  const admin = profile.role === 'admin';
  const educator = admin || profile.role === 'teacher';
  const [notice, setNotice] = useState('');
  const links = staffWorkspaceLinks(profile);
  const allowed = (path: string) => links.some(link => link.path === `/espace/${path}`);

  return (
    <div className="staff-workspace">
      {notice && <div className="inline-message staff-notice" role="status"><span>{notice}</span>
        <button className="text-link" type="button" onClick={() => setNotice('')}>Fermer</button>
      </div>}
      <Routes>
        <Route index element={<StaffHome profile={profile} educator={educator} token={token} />} />
        {educator && <>
          <Route path="eleves" element={<LearnersPage admin={admin} token={token} onNotice={setNotice} />} />
          <Route path="eleves/:learnerId" element={<LearnerDetail admin={admin} token={token} onNotice={setNotice} />} />
          <Route path="alertes" element={<AlertsPage admin={admin} token={token} onNotice={setNotice} />} />
          <Route path="invitations" element={<StaffInvitations profile={profile} token={token} onNotice={setNotice} />} />
        </>}
        {admin && <Route path="utilisateurs" element={<StaffSection title="Utilisateurs"><UsersPanel profile={profile} token={token} /></StaffSection>} />}
        {admin && <Route path="indicateurs" element={<StaffSection title="Indicateurs" description="Usages du pilote par période, niveau, cadence et type de parcours."><KpiPanel token={token} /></StaffSection>} />}
        {allowed('catalogue') && <Route path="catalogue/*" element={<StaffSection title="Catalogue" description="Niveaux d’allemand, ordre, prérequis et versions des parcours."><CataloguePanel token={token} /></StaffSection>} />}
        {allowed('mediatheque') && <Route path="mediatheque" element={<StaffSection title="Médiathèque" description="Images et sons à associer aux activités ; les parcours conservent les versions publiées."><MediaLibraryPanel token={token} /></StaffSection>} />}
        {allowed('corrections') && <Route path="corrections/*" element={<StaffSection title="Corrections" description="Écrits et oraux remis, les plus anciens d’abord."><GradingPanel token={token} /></StaffSection>} />}
        <Route path="*" element={<Navigate to="/espace" replace />} />
      </Routes>
    </div>
  );
}
