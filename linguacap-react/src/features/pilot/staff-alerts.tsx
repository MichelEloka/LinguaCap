/** Alertes de suivi en boîte de réception : liste des alertes ouvertes et détail avec encouragement intégré. */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, BellOff, CalendarCog, ClipboardList, MessageCircle, RefreshCw } from 'lucide-react';
import { Badge, EmptyState, PageHeading } from '../../components/ui';
import { Avatar, Callout, Card, Facts, ListItem, SkeletonCard, SplitView } from '../../design/kit';
import {
  StaffComposer, StaffError, goalStatusOf, learnerUrl, levelOf, mediumDate, openAlert, plural, relativeDay, shortDate,
  useOverview, type LearnerOverview, type TrackingAlert,
} from './staff-kit';

function AlertDetail({ learner, alert, admin, token, onBack, onSent }: {
  learner: LearnerOverview; alert: TrackingAlert; admin: boolean; token: string; onBack: () => void; onSent: () => void;
}) {
  const name = learner.profile.displayName;
  const level = levelOf(learner);
  const status = goalStatusOf(learner.tracking?.goalStatus);
  return (
    <div className="staff-inbox-detail lc-enter" key={learner.learnerId}>
      <button type="button" className="btn btn-ghost btn-sm staff-back" onClick={onBack}>
        <ArrowLeft size={16} aria-hidden="true" /> Toutes les alertes
      </button>
      <Card className="staff-alert-card">
        <header className="staff-alert-head">
          <Avatar name={name} size={52} />
          <div>
            <h2>{name}</h2>
            <span className="staff-tags">
              {level && <Badge tone="blue">Allemand {level}</Badge>}
              <Badge tone={status.tone}>{status.label}</Badge>
            </span>
          </div>
          <Badge tone="amber">Ouverte {relativeDay(alert.openedAt)}</Badge>
        </header>
        <Callout tone="warning" title="Motif de l’alerte">{alert.reason}</Callout>
        <Facts items={[
          { label: 'Séances en retard', value: alert.lateSessions ? plural(alert.lateSessions, 'séance', 'séances') : 'Aucune' },
          { label: 'Prochain jalon', value: alert.nextMilestone ?? '—' },
          { label: 'Échéance du jalon', value: alert.nextMilestoneDueAt ? shortDate.format(new Date(alert.nextMilestoneDueAt)) : '—' },
          { label: 'Dernier encouragement', value: alert.encouragedAt ? relativeDay(alert.encouragedAt) : 'Aucun' },
        ]} />
        {alert.midtermOverdue && <Callout tone="info">Le bilan intermédiaire n’a pas été remis à temps.</Callout>}
        <div className="staff-detail-actions">
          <Link className="btn btn-outline" to={learnerUrl(learner.learnerId)}><ClipboardList size={17} aria-hidden="true" /> Voir le suivi</Link>
          <Link className="btn btn-ghost" to={learnerUrl(learner.learnerId, 'objectif')}><CalendarCog size={17} aria-hidden="true" /> Revoir le planning</Link>
        </div>
        <p className="staff-muted staff-small">Alerte ouverte le {mediumDate.format(new Date(alert.openedAt))}.</p>
      </Card>
      {!admin && (
        <Card title="Encourager" description="Le message est rattaché à cette alerte." icon={<MessageCircle size={18} />}>
          <StaffComposer key={learner.learnerId} learnerId={learner.learnerId} name={name} alert={alert} token={token} onSent={onSent} />
        </Card>
      )}
    </div>
  );
}

export function AlertsPage({ admin, token }: { admin: boolean; token: string }) {
  const { learners, error, reload } = useOverview(token);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const alerts = (learners ?? []).filter((learner) => openAlert(learner))
    .sort((a, b) => new Date(openAlert(b)?.openedAt ?? 0).getTime() - new Date(openAlert(a)?.openedAt ?? 0).getTime());
  const selected = alerts.find((learner) => learner.learnerId === selectedId) ?? alerts[0];
  const alert = selected ? openAlert(selected) : null;

  return (
    <div className="staff-page">
      <PageHeading title="Alertes" description={learners ? (alerts.length ? plural(alerts.length, 'alerte ouverte', 'alertes ouvertes') : 'Aucune alerte ouverte') : undefined}
        action={<button type="button" onClick={reload} className="btn btn-outline"><RefreshCw size={17} aria-hidden="true" /> Actualiser</button>} />
      {error ? <StaffError message={error} onRetry={reload} />
        : !learners ? <SkeletonCard lines={4} label="Chargement des alertes…" />
        : !alerts.length || !selected || !alert ? (
          <Card>
            <EmptyState icon={<BellOff size={26} />} title="Aucune alerte ouverte"
              description="Vos élèves suivent leur rythme. Une alerte apparaît ici en cas de retard."
              action={<Link className="btn btn-outline" to="/espace/eleves">{admin ? 'Voir les élèves' : 'Voir mes élèves'}</Link>} />
          </Card>
        ) : (
          <SplitView hasDetail={selectedId !== null}
            list={(
              <Card flush aria-label="Alertes ouvertes" className="staff-inbox">
                <ul className="kit-list">
                  {alerts.map((learner) => {
                    const item = openAlert(learner);
                    return (
                      <ListItem key={learner.learnerId} as="li" current={learner.learnerId === selected.learnerId}
                        onClick={() => setSelectedId(learner.learnerId)}
                        leading={<Avatar name={learner.profile.displayName} size={40} />}
                        title={learner.profile.displayName} subtitle={item?.reason}
                        trailing={item && <span className="staff-inbox-when">{relativeDay(item.openedAt)}</span>} />
                    );
                  })}
                </ul>
              </Card>
            )}
            detail={<AlertDetail key={selected.learnerId} learner={selected} alert={alert} admin={admin} token={token}
              onBack={() => setSelectedId(null)} onSent={reload} />} />
        )}
    </div>
  );
}
