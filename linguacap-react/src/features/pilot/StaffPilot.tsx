import { useEffect, useState, type FormEvent } from 'react';
import { NavLink, Navigate, Route, Routes } from 'react-router-dom';
import { AlertTriangle, CalendarDays, ClipboardCheck, ClipboardList, Mail, MessageCircle, RefreshCw, Target, Users } from 'lucide-react';
import { Badge, Dialog, EmptyState, PageHeading, StatCard } from '../../components/ui';
import { canEditCatalogue, requestApi, type Profile } from '../../integration/api';
import { InvitationsPanel, InviteDialog, UsersPanel } from './AccountsPilot';
import { CataloguePanel } from './CatalogueEditor';
import { GradingPanel } from './Exams';
import { MediaLibraryPanel } from './MediaLibrary';
import { LearnerSheetDialog } from './LearnerSheet';
import '../teacher/teacher.css';
import './accounts.css';

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

function getError(error: unknown) {
  return error instanceof Error ? error.message : 'Cette action est temporairement indisponible.';
}

function readFormText(data: FormData, key: string) {
  return String(data.get(key) ?? '').trim();
}

function MessageDialog({ learner, alert, token, onClose, onDone }: {
  learner: LearnerOverview;
  alert?: TrackingAlert | null;
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
        body: { learnerId: learner.learnerId, text, ...(alert ? { alertId: alert.id } : {}) },
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
        {alert && <p className="inline-message warning">Alerte · {alert.reason}</p>}
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

function LearnerTable({ learners, onMessage, onOpen }: {
  learners: LearnerOverview[];
  onMessage?: (learner: LearnerOverview, alert?: TrackingAlert | null) => void;
  onOpen: (learner: LearnerOverview) => void;
}) {
  return (
    <div className="table-wrap teacher-table-wrap">
      <table className="teacher-table">
        <thead>
          <tr>
            <th scope="col">Élève</th>
            <th scope="col">Niveau</th>
            <th scope="col">État</th>
            <th scope="col">Prochaine échéance</th>
            <th scope="col">Retard</th>
            <th scope="col">Corrections</th>
            <th scope="col">Actions</th>
          </tr>
        </thead>
        <tbody>
          {learners.map((learner) => {
            const tracking = learner.tracking ?? {};
            return (
              <tr key={learner.learnerId} className={tracking.alert?.status === 'open' ? 'tracking-alert-row' : undefined}>
                <th scope="row">{learner.profile.displayName}
                  {tracking.alert?.status === 'open' && <><br /><Badge tone="amber"><AlertTriangle size={13} aria-hidden="true" /> Alerte</Badge></>}</th>
                <td>{tracking.levelCode ?? learner.progress.goal?.level ?? 'À définir'}</td>
                <td>{tracking.goalStatus ? goalStatusNames[tracking.goalStatus] ?? tracking.goalStatus : 'Sans parcours'}</td>
                <td>{tracking.nextDueAt ? shortDate.format(new Date(tracking.nextDueAt)) : tracking.targetDate ? `Cible : ${shortDate.format(new Date(tracking.targetDate))}` : '—'}</td>
                <td>{tracking.lateSessions ? `${tracking.lateSessions} séance${tracking.lateSessions > 1 ? 's' : ''}` : 'À jour'}</td>
                <td>{tracking.pendingGrading ? <Badge tone="blue">{tracking.pendingGrading} à corriger</Badge> : '—'}</td>
                <td>
                  <span className="accounts-actions">
                    <button type="button" className="btn btn-outline" onClick={() => onOpen(learner)}
                      aria-label={`Voir le suivi de ${learner.profile.displayName}`}>
                      <ClipboardList size={17} aria-hidden="true" /> Suivi
                    </button>
                    {onMessage && (
                      <button type="button" className="btn btn-outline" onClick={() => onMessage(learner, tracking.alert?.status === 'open' ? tracking.alert : null)}
                        aria-label={`Encourager ${learner.profile.displayName}`}>
                        <MessageCircle size={17} aria-hidden="true" /> Encourager
                      </button>
                    )}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function LearnersPanel({ admin, token, onNotice }: { admin: boolean; token: string; onNotice: (message: string) => void }) {
  const [learners, setLearners] = useState<LearnerOverview[] | null>(null);
  const [freshness, setFreshness] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [refresh, setRefresh] = useState(0);
  const [messageTo, setMessageTo] = useState<{ learner: LearnerOverview; alert: TrackingAlert | null } | null>(null);
  const [sheetFor, setSheetFor] = useState<LearnerOverview | null>(null);
  const [level, setLevel] = useState('');
  const [state, setState] = useState('');
  const [due, setDue] = useState('');

  useEffect(() => {
    let active = true;
    setError('');
    requestApi<{ learners: LearnerOverview[]; freshness?: { syncedAt: string | null } }>('/tracking/overview', token).then(
      (data) => { if (active) { setLearners(data.learners); setFreshness(data.freshness?.syncedAt ?? null); } },
      (requestError: unknown) => { if (active) setError(getError(requestError)); },
    );
    return () => { active = false; };
  }, [token, refresh]);

  // Filtres par niveau, état et échéance ; les alertes ouvertes et les corrections remontent en tête.
  const week = Date.now() + 7 * 86_400_000;
  const visible = (learners ?? []).filter((learner) => {
    const tracking = learner.tracking ?? {};
    if (level && (tracking.levelCode ?? learner.progress.goal?.level) !== level) return false;
    if (state === 'alert' ? tracking.alert?.status !== 'open' : state && tracking.goalStatus !== state) return false;
    if (due === 'late' && !tracking.lateSessions) return false;
    if (due === 'week' && !(tracking.nextDueAt && new Date(tracking.nextDueAt).getTime() <= week)) return false;
    return true;
  }).sort((a, b) => Number(b.tracking?.alert?.status === 'open') - Number(a.tracking?.alert?.status === 'open')
    || (b.tracking?.pendingGrading ?? 0) - (a.tracking?.pendingGrading ?? 0));
  const levels = [...new Set((learners ?? []).map((learner) => learner.tracking?.levelCode ?? learner.progress.goal?.level).filter(Boolean))] as string[];
  const alerts = (learners ?? []).filter((learner) => learner.tracking?.alert?.status === 'open');

  return (
    <>
      {learners && !error && (
        <div className="teacher-stats">
          <StatCard label={admin ? 'Élèves inscrits' : 'Mes élèves'} value={learners.length} icon={<Users size={19} />} />
          <StatCard label="Parcours définis" value={learners.filter((learner) => learner.progress.goal !== null).length} icon={<Target size={19} />} />
          <StatCard label="Séances terminées" value={learners.reduce((sum, learner) => sum + learner.progress.completedCount, 0)} icon={<CalendarDays size={19} />} />
          <StatCard label="Corrections en attente" value={learners.reduce((sum, learner) => sum + (learner.tracking?.pendingGrading ?? 0), 0)} icon={<ClipboardCheck size={19} />} />
          <StatCard label="Alertes ouvertes" value={alerts.length} icon={<AlertTriangle size={19} />} />
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
        {alerts.length > 0 && (
          <section className="stack tracking-alerts" aria-labelledby="tracking-alerts-title">
            <h3 id="tracking-alerts-title"><AlertTriangle size={17} aria-hidden="true" /> Alertes ouvertes</h3>
            <ul className="pilot-list">
              {alerts.map((learner) => (
                <li key={learner.learnerId}>
                  <p><strong>{learner.profile.displayName}</strong> · {learner.tracking?.alert?.reason}
                    {learner.tracking?.alert?.encouragedAt && <span className="muted"> · encouragé le {shortDate.format(new Date(learner.tracking.alert.encouragedAt))}</span>}</p>
                  <span className="accounts-actions">
                    {!admin && <button type="button" className="btn btn-outline" onClick={() => setMessageTo({ learner, alert: learner.tracking?.alert ?? null })}
                      aria-label={`Envoyer un encouragement à ${learner.profile.displayName}`}>Envoyer un encouragement</button>}
                    <button type="button" className="btn btn-outline" onClick={() => setSheetFor(learner)}
                      aria-label={`Revoir le planning de ${learner.profile.displayName}`}>Revoir le planning</button>
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}
        {learners && learners.length > 0 && (
          <div className="media-filters" role="group" aria-label="Filtrer les élèves">
            <label>Niveau<select value={level} onChange={(event) => setLevel(event.target.value)}>
              <option value="">Tous</option>{levels.map((item) => <option key={item} value={item}>{item}</option>)}
            </select></label>
            <label>État<select value={state} onChange={(event) => setState(event.target.value)}>
              <option value="">Tous</option><option value="alert">Avec une alerte</option>
              {Object.entries(goalStatusNames).map(([id, label]) => <option key={id} value={id}>{label}</option>)}
            </select></label>
            <label>Échéance<select value={due} onChange={(event) => setDue(event.target.value)}>
              <option value="">Toutes</option><option value="late">En retard</option><option value="week">Dans les sept jours</option>
            </select></label>
          </div>
        )}
        {error ? <p className="inline-message warning" role="alert">{error}</p>
          : learners === null ? <p role="status">Chargement du suivi…</p>
          : learners.length === 0 ? <EmptyState title="Aucun élève actif" description="Les élèves apparaîtront ici après avoir activé leur compte." />
          : visible.length > 0 ? <LearnerTable learners={visible} onMessage={admin ? undefined : (learner, alert) => setMessageTo({ learner, alert: alert ?? null })} onOpen={setSheetFor} />
          : <EmptyState title="Aucun élève ne correspond à ces filtres" />}
        {freshness && <p className="muted">Suivi actualisé le {new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(freshness))}</p>}
      </section>
      {sheetFor && <LearnerSheetDialog learnerId={sheetFor.learnerId} name={sheetFor.profile.displayName} token={token}
        onClose={() => { setSheetFor(null); setRefresh((count) => count + 1); }} />}
      {messageTo && <MessageDialog learner={messageTo.learner} alert={messageTo.alert} token={token} onClose={() => setMessageTo(null)} onDone={(message) => {
        setMessageTo(null);
        setRefresh((count) => count + 1);
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
    ...(educator || profile.permissions.includes('correction') ? [{ path: 'corrections', label: 'Corrections' }] : []),
    ...(canEditCatalogue(profile) ? [{ path: 'catalogue', label: 'Catalogue' }, { path: 'mediatheque', label: 'Médiathèque' }] : []),
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
        {allowed('catalogue') && <Route path="catalogue/*" element={<CataloguePanel token={token} />} />}
        {allowed('mediatheque') && <Route path="mediatheque" element={<MediaLibraryPanel token={token} />} />}
        {allowed('corrections') && <Route path="corrections/*" element={<GradingPanel token={token} />} />}
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
