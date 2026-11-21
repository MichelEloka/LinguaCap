/** Vue d'ensemble de l'espace professeur : poste de pilotage (professeur, administration) ou accès de l'équipe. */
import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Bell, BellRing, BookOpen, CalendarClock, CalendarDays, ChevronRight, ClipboardCheck, FileSignature, FolderOpen, KeyRound,
  MessageCircle, PartyPopper, TrendingUp, UserPlus, UserRoundCog, Users, type LucideIcon,
} from 'lucide-react';
import { Badge, EmptyState, PageHeading, StatCard } from '../../components/ui';
import { Avatar, Callout, Card, ProgressRing, SkeletonCard, Timeline, type TimelineEntry } from '../../design/kit';
import type { Profile } from '../../integration/api';
import { staffWorkspaceLinks } from './staff-navigation';
import {
  DateTile, EncourageDrawer, StaffError, dayOffset, dueWithinWeek, formatMinutes, goalStatusOf, learnerUrl, levelOf,
  needsFollowUp, openAlert, plural, relativeDay, useOverview, type LearnerOverview,
} from './staff-kit';
import { LevelRoute, formatShortDay, usePendingContracts } from './staff-contracts';
import { difficultyTones, formatMinutes as minutesLabel, type PendingContract } from '../../integration/v2';

const todayLabel = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });

function KpiLink({ to, tone, children }: { to: string; tone: 'brand' | 'warning' | 'violet' | 'success'; children: ReactNode }) {
  return <Link to={to} className={`staff-kpi is-${tone}`}>{children}</Link>;
}

function FollowUpRow({ learner, onMessage }: { learner: LearnerOverview; onMessage?: (learner: LearnerOverview) => void }) {
  const name = learner.profile.displayName;
  const alert = openAlert(learner);
  const late = learner.tracking?.lateSessions ?? 0;
  const level = levelOf(learner);
  return (
    <li className="staff-row">
      <Avatar name={name} size={40} />
      <div className="staff-row-main">
        <Link className="staff-row-title" to={learnerUrl(learner.learnerId)}>{name}</Link>
        <small>{alert?.reason ?? `${plural(late, 'séance', 'séances')} en retard`}</small>
        <span className="staff-tags">
          {level && <Badge tone="blue">{level}</Badge>}
          {alert && <Badge tone="red"><Bell size={12} aria-hidden="true" /> Alerte</Badge>}
          {late > 0 && <Badge tone="amber">{plural(late, 'séance en retard', 'séances en retard')}</Badge>}
        </span>
      </div>
      <div className="staff-row-actions">
        {onMessage && (
          <button type="button" className="btn btn-soft btn-sm" onClick={() => onMessage(learner)} aria-label={`Encourager ${name}`}>
            <MessageCircle size={16} aria-hidden="true" /> Encourager
          </button>
        )}
        <Link className="icon-button" to={learnerUrl(learner.learnerId)} aria-label={`Voir le suivi de ${name}`} title="Voir le suivi">
          <ChevronRight size={20} aria-hidden="true" />
        </Link>
      </div>
    </li>
  );
}

function recentActivity(learners: LearnerOverview[]): TimelineEntry[] {
  const events: (TimelineEntry & { at: number })[] = [];
  for (const learner of learners) {
    const name = learner.profile.displayName;
    const tracking = learner.tracking;
    if (tracking?.lastActivityAt) {
      events.push({
        id: `activity-${learner.learnerId}`, at: new Date(tracking.lastActivityAt).getTime(), tone: 'brand',
        icon: <BookOpen size={14} />, title: `${name} a travaillé`,
        meta: `${relativeDay(tracking.lastActivityAt)}${tracking.practiceMinutes ? ` · ${formatMinutes(tracking.practiceMinutes)} de pratique au total` : ''}`,
      });
    }
    const alert = openAlert(learner);
    if (alert) {
      events.push({ id: `alert-${alert.id}`, at: new Date(alert.openedAt).getTime(), tone: 'warning', icon: <Bell size={14} />,
        title: `Alerte ouverte pour ${name}`, meta: `${relativeDay(alert.openedAt)} · ${alert.reason}` });
    }
    if (tracking?.alert?.encouragedAt) {
      events.push({ id: `encouraged-${tracking.alert.id}`, at: new Date(tracking.alert.encouragedAt).getTime(), tone: 'success',
        icon: <MessageCircle size={14} />, title: `Encouragement envoyé à ${name}`, meta: relativeDay(tracking.alert.encouragedAt) });
    }
  }
  return events.sort((a, b) => b.at - a.at).slice(0, 5);
}

/** Contrats envoyés par les élèves et qui attendent la décision du professeur. */
function ContractsCard({ contracts }: { contracts: PendingContract[] }) {
  return (
    <Card title="Contrats à valider" description="Vos élèves ont déjà commencé avec ces conditions" icon={<FileSignature size={18} />} flush
      className="staff-contracts-card" action={<Link className="btn btn-ghost btn-sm" to="/espace/contrats">Tout voir <ArrowRight size={16} aria-hidden="true" /></Link>}>
      <ul className="staff-rows lc-stagger">
        {contracts.slice(0, 3).map((item) => (
          <li key={`${item.pathId}-${item.contract.number}`}>
            <Link className="staff-agenda-item" to={`/espace/contrats?contrat=${encodeURIComponent(item.pathId)}`}
              aria-label={`Examiner le contrat de ${item.learnerName}`}>
              <Avatar name={item.learnerName} size={40} />
              <span className="staff-row-main">
                <strong>{item.learnerName}</strong>
                <small>Objectif le {formatShortDay(item.contract.terms.targetDate)} · {minutesLabel(item.contract.terms.weeklyMinutes)} par semaine</small>
              </span>
              <span className="staff-agenda-end">
                <LevelRoute from={item.contract.terms.startLevel} to={item.contract.terms.targetLevel} />
                <span className={`badge badge-${difficultyTones[item.contract.terms.difficulty.code]}`}>{item.contract.terms.difficulty.label}</span>
                <ChevronRight size={18} aria-hidden="true" />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </Card>
  );
}

interface Shortcut { to: string; label: string; hint: string; icon: LucideIcon; count?: number }

function Shortcuts({ items }: { items: Shortcut[] }) {
  return (
    <div className="staff-shortcuts">
      {items.map(({ to, label, hint, icon: Icon, count }) => (
        <Link key={to} to={to} className="staff-shortcut">
          <span className="staff-shortcut-icon" aria-hidden="true"><Icon size={18} /></span>
          <span className="staff-shortcut-text"><strong>{label}</strong><small>{hint}</small></span>
          {count ? <span className="staff-count">{count}</span> : null}
        </Link>
      ))}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="staff-page-body" aria-busy="true">
      <div className="staff-kpis">{[0, 1, 2, 3].map((item) => <SkeletonCard key={item} lines={1} label={item ? undefined : 'Chargement du suivi…'} />)}</div>
      <div className="staff-dash"><SkeletonCard lines={5} /><SkeletonCard lines={4} /></div>
    </div>
  );
}

function EducatorDashboard({ admin, token }: { admin: boolean; token: string }) {
  const { learners, error, reload } = useOverview(token);
  const pendingContracts = usePendingContracts(token);
  const [messageTo, setMessageTo] = useState<LearnerOverview | null>(null);

  if (error) return <StaffError message={error} onRetry={reload} />;
  if (!learners) return <DashboardSkeleton />;
  if (learners.length === 0) {
    return (
      <Card>
        <EmptyState icon={<UserPlus size={26} />} title={admin ? 'Aucun élève inscrit' : 'Aucun élève pour le moment'}
          description="Invitez vos premiers élèves : ils apparaîtront ici dès leur compte créé."
          action={<Link className="btn btn-primary" to="/espace/invitations"><UserPlus size={17} aria-hidden="true" /> Inviter un élève</Link>} />
      </Card>
    );
  }

  const followUp = learners.filter(needsFollowUp).sort((a, b) =>
    Number(Boolean(openAlert(b))) - Number(Boolean(openAlert(a))) || (b.tracking?.lateSessions ?? 0) - (a.tracking?.lateSessions ?? 0));
  const alerts = learners.filter((learner) => openAlert(learner)).length;
  const corrections = learners.reduce((sum, learner) => sum + (learner.tracking?.pendingGrading ?? 0), 0);
  const thisWeek = learners.filter((learner) => dueWithinWeek(learner));
  const active = learners.filter((learner) => learner.tracking?.goalStatus === 'active').length;
  const paused = learners.filter((learner) => !needsFollowUp(learner) && learner.tracking?.goalStatus === 'paused').length;
  const withoutTrack = learners.filter((learner) => !needsFollowUp(learner) && !learner.tracking?.goalStatus).length;
  const upToDate = learners.length - followUp.length - paused - withoutTrack;
  const health = Math.round((upToDate / learners.length) * 100);
  const upcoming = learners.filter((learner) => learner.tracking?.nextDueAt)
    .sort((a, b) => new Date(a.tracking?.nextDueAt ?? 0).getTime() - new Date(b.tracking?.nextDueAt ?? 0).getTime()).slice(0, 5);
  const activity = recentActivity(learners);
  const toDecide = (pendingContracts.data ?? []).filter((item) => item.contract.status === 'pending_teacher')
    .sort((a, b) => a.contract.createdAt.localeCompare(b.contract.createdAt));
  const shortcuts: Shortcut[] = [
    { to: '/espace/contrats', label: 'Valider les contrats', hint: toDecide.length ? plural(toDecide.length, 'contrat en attente', 'contrats en attente') : 'Rien en attente', icon: FileSignature, count: toDecide.length },
    { to: '/espace/invitations', label: admin ? 'Inviter un utilisateur' : 'Inviter un élève', hint: 'Lien valable sept jours', icon: UserPlus },
    { to: '/espace/corrections', label: 'Corriger les copies', hint: corrections ? plural(corrections, 'copie en attente', 'copies en attente') : 'Rien en attente', icon: ClipboardCheck, count: corrections },
    { to: '/espace/alertes', label: 'Traiter les alertes', hint: alerts ? plural(alerts, 'alerte ouverte', 'alertes ouvertes') : 'Aucune alerte', icon: Bell, count: alerts },
    ...(admin ? [
      { to: '/espace/utilisateurs', label: 'Gérer les utilisateurs', hint: 'Rôles, référents, accès', icon: UserRoundCog },
      { to: '/espace/indicateurs', label: 'Consulter les indicateurs', hint: 'Usages du pilote', icon: TrendingUp },
    ] : []),
    { to: '/espace/eleves', label: admin ? 'Voir les élèves' : 'Voir mes élèves', hint: plural(learners.length, 'élève', 'élèves'), icon: Users },
  ];

  return (
    <div className="staff-page-body">
      <div className="staff-kpis lc-stagger">
        <KpiLink to="/espace/eleves" tone="brand">
          <StatCard label={admin ? 'Élèves inscrits' : 'Mes élèves'} value={learners.length} note={`${active} en cours`} icon={<Users size={20} />} />
        </KpiLink>
        <KpiLink to="/espace/alertes" tone="warning">
          <StatCard label="À relancer" value={followUp.length} note={alerts ? plural(alerts, 'alerte ouverte', 'alertes ouvertes') : 'Aucune alerte'} icon={<BellRing size={20} />} />
        </KpiLink>
        <KpiLink to="/espace/corrections" tone="violet">
          <StatCard label="Copies à corriger" value={corrections} note={corrections ? 'En attente de correction' : 'Rien en attente'} icon={<ClipboardCheck size={20} />} />
        </KpiLink>
        <KpiLink to="/espace/eleves?filtre=semaine" tone="success">
          <StatCard label="Cette semaine" value={thisWeek.length} note="Échéances sous 7 jours" icon={<CalendarDays size={20} />} />
        </KpiLink>
      </div>

      <div className="staff-dash">
        <div className="staff-col">
          {toDecide.length > 0 && <ContractsCard contracts={toDecide} />}
          <Card title="À relancer" description="Alertes ouvertes et séances en retard" icon={<BellRing size={18} />} flush
            action={followUp.length > 0 && <Link className="btn btn-ghost btn-sm" to="/espace/alertes">Tout voir <ArrowRight size={16} aria-hidden="true" /></Link>}>
            {followUp.length ? (
              <ul className="staff-rows lc-stagger">
                {followUp.slice(0, 5).map((learner) => <FollowUpRow key={learner.learnerId} learner={learner} onMessage={admin ? undefined : setMessageTo} />)}
              </ul>
            ) : <EmptyState icon={<PartyPopper size={26} />} title="Tout le monde est à jour" description="Aucune alerte ni séance en retard." />}
          </Card>

          <Card title="Prochaines échéances" description="Séance suivante de chaque élève" icon={<CalendarClock size={18} />} flush>
            {upcoming.length ? (
              <ul className="staff-rows lc-stagger">
                {upcoming.map((learner) => {
                  const due = learner.tracking?.nextDueAt ?? '';
                  const offset = dayOffset(due);
                  const status = goalStatusOf(learner.tracking?.goalStatus);
                  return (
                    <li key={learner.learnerId}>
                      <Link className="staff-agenda-item" to={learnerUrl(learner.learnerId)}>
                        <DateTile value={due} tone={offset <= 0 ? 'today' : undefined} />
                        <span className="staff-row-main">
                          <strong>{learner.profile.displayName}</strong>
                          <small>Prochaine séance {relativeDay(due)}</small>
                        </span>
                        <span className="staff-agenda-end">
                          {levelOf(learner) && <Badge tone="blue">{levelOf(learner)}</Badge>}
                          <Badge tone={status.tone}>{status.label}</Badge>
                          <ChevronRight size={18} aria-hidden="true" />
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ) : <EmptyState icon={<CalendarClock size={26} />} title="Aucune échéance planifiée" description="Les séances apparaissent une fois le planning validé." />}
          </Card>
        </div>

        <div className="staff-col">
          <Card title="Élèves à jour" description="Sans retard ni alerte" icon={<TrendingUp size={18} />}>
            <div className="staff-health">
              <ProgressRing value={health} size={116} stroke={11} color="var(--success)" label={`${health} % des élèves sont à jour`}>
                <span className="staff-ring-text"><strong>{health}%</strong><small>à jour</small></span>
              </ProgressRing>
              <ul className="staff-legend">
                <li><i className="is-success" aria-hidden="true" />À jour<b>{upToDate}</b></li>
                <li><i className="is-warning" aria-hidden="true" />À relancer<b>{followUp.length}</b></li>
                <li><i className="is-neutral" aria-hidden="true" />En pause<b>{paused}</b></li>
                {withoutTrack > 0 && <li><i className="is-subtle" aria-hidden="true" />Sans parcours<b>{withoutTrack}</b></li>}
              </ul>
            </div>
          </Card>

          <Card title="Activité récente" icon={<CalendarDays size={18} />}>
            {activity.length ? <Timeline items={activity} /> : <p className="staff-muted">Aucune activité enregistrée pour le moment.</p>}
          </Card>
        </div>
      </div>

      <Card title="Raccourcis" icon={<ArrowRight size={18} />}>
        <Shortcuts items={shortcuts} />
      </Card>

      {messageTo && <EncourageDrawer key={messageTo.learnerId} learner={messageTo} token={token} onClose={() => setMessageTo(null)}
        onSent={() => { setMessageTo(null); reload(); }} />}
    </div>
  );
}

const accessDescriptions: Record<string, string> = {
  '/espace/corrections': 'Écrits et oraux remis par les élèves, les plus anciens d’abord.',
  '/espace/catalogue': 'Niveaux d’allemand, ordre, prérequis et versions des parcours.',
  '/espace/mediatheque': 'Images et sons à associer aux activités des parcours.',
  '/espace/utilisateurs': 'Comptes, rôles et professeurs référents.',
  '/espace/indicateurs': 'Usages du pilote par période, niveau et rythme.',
};
const permissionNames: Record<string, { label: string; icon: LucideIcon }> = {
  catalogue: { label: 'Catalogue', icon: BookOpen }, correction: { label: 'Correction', icon: ClipboardCheck },
};

/** Accueil de l'équipe pédagogique sans élèves : une carte par outil autorisé. */
function TeamHome({ profile }: { profile: Profile }) {
  const links = staffWorkspaceLinks(profile).slice(1);
  if (!links.length) {
    return (
      <Card>
        <EmptyState icon={<KeyRound size={26} />} title="Aucune permission active"
          description="L’administration peut vous attribuer la permission Catalogue ou Correction." />
      </Card>
    );
  }
  return (
    <div className="staff-page-body">
      <div className="staff-access-grid lc-stagger">
        {links.map(({ path, label, icon: Icon }) => (
          <Link key={path} to={path} className="staff-access-card">
            <span className="staff-access-icon" aria-hidden="true"><Icon size={22} /></span>
            <strong>{label}</strong>
            <p>{accessDescriptions[path] ?? 'Ouvrir cet outil.'}</p>
            <span className="staff-access-go">Ouvrir <ArrowRight size={16} aria-hidden="true" /></span>
          </Link>
        ))}
      </div>
      {profile.permissions.length > 0 && (
        <Card title="Vos permissions" description="Attribuées par l’administration" icon={<KeyRound size={18} />}>
          <div className="staff-permissions">
            {profile.permissions.map((permission) => {
              const entry = permissionNames[permission] ?? { label: permission, icon: FolderOpen };
              const Icon = entry.icon;
              return <span key={permission} className="staff-permission"><Icon size={16} aria-hidden="true" /> {entry.label}</span>;
            })}
          </div>
          <Callout tone="tip">Besoin d’un autre accès ? Demandez-le à l’administration de LinguaCap.</Callout>
        </Card>
      )}
    </div>
  );
}

export function StaffHome({ profile, educator, token }: { profile: Profile; educator: boolean; token: string }) {
  const admin = profile.role === 'admin';
  const first = profile.displayName.trim().split(/\s+/)[0] || profile.displayName;
  const today = todayLabel.format(new Date());
  return (
    <div className="staff-page">
      <PageHeading eyebrow={today.charAt(0).toUpperCase() + today.slice(1)} title="Vue d’ensemble"
        description={educator ? `Bonjour ${first}, voici où en sont ${admin ? 'les' : 'vos'} élèves aujourd’hui.` : `Bonjour ${first}, retrouvez ici vos outils de travail.`}
        action={educator && (
          <Link className="btn btn-primary" to="/espace/invitations"><UserPlus size={17} aria-hidden="true" /> {admin ? 'Inviter un utilisateur' : 'Inviter un élève'}</Link>
        )} />
      {educator ? <EducatorDashboard admin={admin} token={token} /> : <TeamHome profile={profile} />}
    </div>
  );
}
