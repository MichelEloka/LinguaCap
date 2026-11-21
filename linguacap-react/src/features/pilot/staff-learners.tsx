/** Liste des élèves : recherche, filtres en puces, tableau (cartes sur mobile) et encouragement en panneau latéral. */
import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Bell, ClipboardList, FileSignature, MessageCircle, RefreshCw, SearchX, UserPlus } from 'lucide-react';
import { Badge, EmptyState, PageHeading, ProgressBar } from '../../components/ui';
import { Avatar, Card, Chip, SearchField, Segmented, SkeletonCard, Toolbar } from '../../design/kit';
import {
  EncourageDrawer, StaffError, dateTime, dayOffset, dueWithinWeek, goalStatusNames, goalStatusOf, learnerUrl, levelOf, openAlert,
  plural, relativeDay, shortDate, successRate, useOverview, type LearnerOverview,
} from './staff-kit';
import { learnersAwaitingDecision, usePendingContracts } from './staff-contracts';

interface Filter { id: string; label: string; test: (learner: LearnerOverview) => boolean }

const baseFilters: Filter[] = [
  { id: 'tous', label: 'Tous', test: () => true },
  { id: 'alerte', label: 'Alerte ouverte', test: (learner) => Boolean(openAlert(learner)) },
  { id: 'retard', label: 'En retard', test: (learner) => (learner.tracking?.lateSessions ?? 0) > 0 },
  { id: 'semaine', label: 'Échéance sous 7 jours', test: (learner) => dueWithinWeek(learner) },
  { id: 'copies', label: 'Copies à corriger', test: (learner) => (learner.tracking?.pendingGrading ?? 0) > 0 },
];

function LearnerRow({ learner, contract, onMessage }: { learner: LearnerOverview; contract: boolean; onMessage?: (learner: LearnerOverview) => void }) {
  const tracking = learner.tracking ?? {};
  const name = learner.profile.displayName;
  const level = levelOf(learner);
  const status = goalStatusOf(tracking.goalStatus);
  const alert = openAlert(learner);
  const late = tracking.lateSessions ?? 0;
  const pending = tracking.pendingGrading ?? 0;
  const rate = successRate(learner);
  const done = tracking.sessionsCompleted ?? learner.progress.completedCount;
  const due = tracking.nextDueAt ?? null;
  return (
    <tr className={alert ? 'has-alert' : undefined}>
      <th scope="row" className="staff-cell-person">
        <span className="staff-person">
          <Avatar name={name} size={38} />
          <span className="staff-person-text">
            <Link className="staff-person-link" to={learnerUrl(learner.learnerId)}>{name}</Link>
            <small>{tracking.lastActivityAt ? `Actif ${relativeDay(tracking.lastActivityAt)}` : 'Pas encore d’activité'}</small>
          </span>
        </span>
      </th>
      <td className="staff-cell-level">{level ? <Badge tone="blue">{level}</Badge> : <span className="staff-muted">—</span>}</td>
      <td className="staff-cell-state">
        <span className="staff-tags">
          <span className="staff-mobile-only">{level && <Badge tone="blue">{level}</Badge>}</span>
          <Badge tone={status.tone}>{status.label}</Badge>
          {alert && <Badge tone="red"><Bell size={12} aria-hidden="true" /> Alerte</Badge>}
          {contract && <Badge tone="amber"><FileSignature size={12} aria-hidden="true" /> Contrat à valider</Badge>}
          {pending > 0 && <Badge tone="violet">{plural(pending, 'copie', 'copies')}</Badge>}
        </span>
      </td>
      <td className="staff-cell-progress">
        <span className="staff-progress">
          <span className="staff-progress-top">
            <span>Réussite</span>
            <b>{rate === null ? '—' : `${rate} %`}</b>
          </span>
          <ProgressBar value={rate ?? 0} label={`Réussite aux exercices de ${name}`} />
          <small>{rate === null ? 'Aucun exercice remis · ' : ''}{plural(done, 'séance terminée', 'séances terminées')}</small>
        </span>
      </td>
      <td className="staff-cell-due">
        {due ? (
          <span className={`staff-due${late ? ' is-late' : dayOffset(due) <= 0 ? ' is-today' : ''}`}>
            <strong>{shortDate.format(new Date(due))}</strong>
            <small>{late ? plural(late, 'séance en retard', 'séances en retard') : relativeDay(due)}</small>
          </span>
        ) : tracking.targetDate ? (
          <span className="staff-due"><strong>{shortDate.format(new Date(tracking.targetDate))}</strong><small>Date cible</small></span>
        ) : <span className="staff-muted">—</span>}
      </td>
      <td className="staff-cell-actions">
        <span className="staff-row-actions">
          {onMessage && (
            <button type="button" className="icon-button staff-icon-action" onClick={() => onMessage(learner)}
              aria-label={`Encourager ${name}`} title="Encourager"><MessageCircle size={18} aria-hidden="true" /></button>
          )}
          <Link to={learnerUrl(learner.learnerId)} className="icon-button staff-icon-action is-primary" aria-label={`Voir le suivi de ${name}`} title="Voir le suivi">
            <ClipboardList size={18} aria-hidden="true" />
          </Link>
        </span>
      </td>
    </tr>
  );
}

export function LearnersPage({ admin, token }: { admin: boolean; token: string }) {
  const { learners, freshness, error, reload } = useOverview(token);
  const contracts = usePendingContracts(token);
  const awaiting = learnersAwaitingDecision(contracts.data);
  const [params, setParams] = useSearchParams();
  const [messageTo, setMessageTo] = useState<LearnerOverview | null>(null);
  const [query, setQuery] = useState('');
  const [level, setLevel] = useState('tous');
  const all = learners ?? [];
  const statuses = [...new Set(all.map((learner) => learner.tracking?.goalStatus).filter((code): code is string => Boolean(code)))]
    .filter((code) => code in goalStatusNames);
  const filters: Filter[] = [
    ...baseFilters.slice(0, 2),
    { id: 'contrat', label: 'Contrat à valider', test: (learner: LearnerOverview) => awaiting.has(learner.learnerId) },
    ...baseFilters.slice(2),
    ...statuses.map((code) => ({ id: `etat-${code}`, label: goalStatusNames[code], test: (learner: LearnerOverview) => learner.tracking?.goalStatus === code })),
  ].filter((filter) => filter.id === 'tous' || all.some(filter.test));
  const filter = filters.find((item) => item.id === params.get('filtre')) ?? filters[0];
  const levels = [...new Set(all.flatMap((learner) => levelOf(learner) ?? []))].sort();
  const search = query.trim().toLocaleLowerCase('fr');
  const visible = all.filter((learner) => filter.test(learner)
    && (level === 'tous' || levelOf(learner) === level)
    && (!search || learner.profile.displayName.toLocaleLowerCase('fr').includes(search)))
    .sort((a, b) => Number(Boolean(openAlert(b))) - Number(Boolean(openAlert(a)))
      || Number(awaiting.has(b.learnerId)) - Number(awaiting.has(a.learnerId))
      || (b.tracking?.pendingGrading ?? 0) - (a.tracking?.pendingGrading ?? 0)
      || a.profile.displayName.localeCompare(b.profile.displayName, 'fr'));
  const description = learners
    ? `${plural(learners.length, 'élève', 'élèves')}${freshness ? ` · suivi actualisé le ${dateTime.format(new Date(freshness))}` : ''}`
    : undefined;

  function choose(id: string) {
    setParams(id === 'tous' ? {} : { filtre: id }, { replace: true });
  }

  return (
    <div className="staff-page">
      <PageHeading title={admin ? 'Élèves' : 'Mes élèves'} description={description} action={<>
        <button className="btn btn-outline" type="button" onClick={reload}><RefreshCw size={17} aria-hidden="true" /> Actualiser</button>
        <Link className="btn btn-primary" to="/espace/invitations"><UserPlus size={17} aria-hidden="true" /> Inviter</Link>
      </>} />

      {error ? <StaffError message={error} onRetry={reload} />
        : !learners ? <SkeletonCard lines={6} label="Chargement des élèves…" />
        : learners.length === 0 ? (
          <Card>
            <EmptyState icon={<UserPlus size={26} />} title="Aucun élève actif" description="Les élèves invités apparaissent ici dès qu’ils ont créé leur compte."
              action={<Link to="/espace/invitations" className="btn btn-primary">Invitations</Link>} />
          </Card>
        ) : (
          <div className="staff-page-body">
            <div className="staff-filters">
              <Toolbar>
                <SearchField value={query} onChange={setQuery} label="Rechercher un élève" placeholder="Rechercher un élève" />
                {levels.length > 1 && (
                  <Segmented label="Niveau" value={level} onChange={setLevel}
                    options={[{ value: 'tous', label: 'Tous niveaux' }, ...levels.map((code) => ({ value: code, label: code }))]} />
                )}
              </Toolbar>
              <div className="staff-chips" role="group" aria-label="Filtrer les élèves">
                {filters.map((item) => (
                  <Chip key={item.id} selected={item.id === filter.id} onClick={() => choose(item.id)}>
                    {item.label}<span className="staff-chip-count">{all.filter(item.test).length}</span>
                  </Chip>
                ))}
              </div>
            </div>

            <Card flush aria-label="Liste des élèves" className="staff-roster">
              {visible.length ? (
                <div className="staff-table-wrap">
                  <table className="staff-table">
                    <thead>
                      <tr>
                        <th scope="col">Élève</th><th scope="col" className="staff-cell-level">Niveau</th><th scope="col">État</th>
                        <th scope="col">Progression</th><th scope="col">Prochaine échéance</th>
                        <th scope="col" className="staff-cell-actions"><span className="sr-only">Actions</span></th>
                      </tr>
                    </thead>
                    <tbody className="lc-stagger">
                      {visible.map((learner) => <LearnerRow key={learner.learnerId} learner={learner} contract={awaiting.has(learner.learnerId)} onMessage={admin ? undefined : setMessageTo} />)}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyState icon={<SearchX size={26} />} title="Aucun élève ne correspond à ces filtres"
                  action={<button type="button" className="btn btn-outline" onClick={() => { setQuery(''); setLevel('tous'); choose('tous'); }}>Effacer les filtres</button>} />
              )}
            </Card>
          </div>
        )}

      {messageTo && <EncourageDrawer key={messageTo.learnerId} learner={messageTo} token={token} onClose={() => setMessageTo(null)}
        onSent={() => { setMessageTo(null); reload(); }} />}
    </div>
  );
}
