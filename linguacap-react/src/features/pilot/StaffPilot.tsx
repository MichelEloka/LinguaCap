import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Navigate, Route, Routes, useLocation, useParams } from 'react-router-dom';
import { Mail, MailCheck, UserCheck, UserPlus } from 'lucide-react';
import { PageHeading } from '../../components/ui';
import { useToast } from '../../design/kit';
import type { Profile } from '../../integration/api';
import { InvitationsPanel, InviteDialog, UsersPanel } from './AccountsPilot';
import { CataloguePanel } from './CatalogueEditor';
import { GradingPanel } from './Exams';
import { KpiPanel } from './KpiPanel';
import { MediaLibraryPanel } from './MediaLibrary';
import { LearnerSheetPage } from './LearnerSheet';
import { staffWorkspaceLinks } from './staff-navigation';
import { StaffHome } from './staff-dashboard';
import { LearnersPage } from './staff-learners';
import { AlertsPage } from './staff-alerts';
import { ContractsPage, usePendingContracts } from './staff-contracts';
import { useWorkspaceBadge } from '../workspace/badges';
import { TeacherOnboarding, useTeacherProfile } from './teacher-onboarding';
import './staff-workspace.css';

export type { TrackingAlert, TrackingSummary } from './staff-kit';
export { goalStatusNames } from './staff-kit';

function LearnerDetail({ admin, token }: { admin: boolean; token: string }) {
  const { learnerId = '' } = useParams();
  return <LearnerSheetPage key={learnerId} learnerId={learnerId} token={token} canMessage={!admin} />;
}

function StaffSection({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return <div className="staff-page"><PageHeading title={title} description={description} />{children}</div>;
}

const inviteSteps = [
  { icon: Mail, title: 'Invitez par e-mail', text: 'Une invitation par adresse, valable sept jours.' },
  { icon: MailCheck, title: 'Relancez si besoin', text: 'Renvoyez-la tant qu’elle n’est pas acceptée.' },
  { icon: UserCheck, title: 'Suivez l’élève', text: 'Son compte créé, il rejoint votre liste d’élèves.' },
];

function StaffInvitations({ profile, token, teacherLanguages }: { profile: Profile; token: string; teacherLanguages?: readonly string[] }) {
  const toast = useToast();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const admin = profile.role === 'admin';
  return (
    <div className="staff-page">
      <PageHeading title="Invitations" description="Envoyez, relancez ou annulez les invitations à rejoindre LinguaCap." action={
        <button type="button" className="btn btn-primary" onClick={() => setInviteOpen(true)}>
          <UserPlus size={17} aria-hidden="true" /> {admin ? 'Inviter un utilisateur' : 'Inviter un élève'}
        </button>
      } />
      <ol className="staff-steps lc-stagger" aria-label="Fonctionnement des invitations">
        {inviteSteps.map(({ icon: Icon, title, text }, index) => (
          <li key={title} className="staff-step">
            <span className="staff-step-icon" aria-hidden="true"><Icon size={18} /></span>
            <span><strong><span className="staff-step-number">{index + 1}.</span> {title}</strong><small>{text}</small></span>
          </li>
        ))}
      </ol>
      <InvitationsPanel token={token} refresh={refresh} learnersOnly={!admin} />
      {inviteOpen && <InviteDialog profile={profile} token={token} teacherLanguages={teacherLanguages} onClose={() => setInviteOpen(false)} onDone={(invitation) => {
        setInviteOpen(false);
        setRefresh((count) => count + 1);
        toast(`Invitation envoyée à ${invitation.email}.`);
      }} />}
    </div>
  );
}

/** Compteur des contrats à valider sur le lien « Contrats », relu à chaque changement d'écran. */
function ContractsBadge({ token, pathname }: { token: string; pathname: string }) {
  const pending = usePendingContracts(token);
  const { reload } = pending;
  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    reload();
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps
  useWorkspaceBadge('/espace/contrats', pending.data?.length);
  return null;
}

export function StaffPilot({ profile, token }: { profile: Profile; token: string }) {
  const { pathname } = useLocation();
  const admin = profile.role === 'admin';
  const educator = admin || profile.role === 'teacher';
  const links = staffWorkspaceLinks(profile);
  const allowed = (path: string) => links.some(link => link.path === `/espace/${path}`);
  const teacher = useTeacherProfile(profile, token);

  return (
    <div className="staff-workspace">
      {teacher.needsOnboarding && (
        <TeacherOnboarding name={profile.displayName} token={token} initial={teacher.teacherProfile} onDone={teacher.update} />
      )}
      {educator && <ContractsBadge token={token} pathname={pathname} />}
      <Routes>
        <Route index element={<StaffHome profile={profile} educator={educator} token={token} />} />
        {educator && <>
          <Route path="eleves" element={<LearnersPage admin={admin} token={token} />} />
          <Route path="eleves/:learnerId" element={<LearnerDetail admin={admin} token={token} />} />
          <Route path="alertes" element={<AlertsPage admin={admin} token={token} />} />
          <Route path="contrats" element={<ContractsPage admin={admin} token={token} />} />
          <Route path="invitations" element={<StaffInvitations profile={profile} token={token} teacherLanguages={teacher.teacherProfile?.languages} />} />
        </>}
        {admin && <Route path="utilisateurs" element={<StaffSection title="Utilisateurs" description="Retrouvez chaque compte, son rôle, son rattachement et son accès."><UsersPanel profile={profile} token={token} /></StaffSection>} />}
        {admin && <Route path="indicateurs" element={<StaffSection title="Indicateurs" description="Usages du pilote par période, niveau, cadence et type de parcours."><KpiPanel token={token} /></StaffSection>} />}
        {allowed('catalogue') && <Route path="catalogue/*" element={<StaffSection title="Catalogue" description="Niveaux d’allemand, ordre, prérequis et versions des parcours."><CataloguePanel token={token} /></StaffSection>} />}
        {allowed('mediatheque') && <Route path="mediatheque" element={<StaffSection title="Médiathèque" description="Images et sons à associer aux activités ; les parcours conservent les versions publiées."><MediaLibraryPanel token={token} /></StaffSection>} />}
        {allowed('corrections') && <Route path="corrections/*" element={<StaffSection title="Corrections" description="Écrits et oraux remis, les plus anciens d’abord."><GradingPanel token={token} /></StaffSection>} />}
        <Route path="*" element={<Navigate to="/espace" replace />} />
      </Routes>
    </div>
  );
}
