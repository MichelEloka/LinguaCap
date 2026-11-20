import { BookOpen, CircleAlert, ClipboardCheck, LibraryBig, Mail, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge, PageHeading, ProgressBar, StatCard } from '../../components/ui';
import { useDemo } from '../../demo/context';

export default function AdminDashboard() {
  const { state } = useDemo();
  const pendingInvitations = state.invitations.filter(({ status }) => status === 'pending').length;
  const pendingCorrections = state.assessments.filter(({ status }) => status === 'submitted').length;
  const published = state.catalog.filter(({ status }) => status === 'published').length;
  const atRisk = state.students.filter(({ status }) => status === 'at-risk').length;
  const autonomous = state.students.filter(({ teacher }) => !teacher).length;

  return (
    <>
      <PageHeading
        eyebrow="Administration"
        title="Pilotage de LinguaCap"
        description="Retrouvez l’état des parcours, du catalogue et des accès."
      />

      <div className="admin-metrics">
        <StatCard icon={<Users size={21} />} label="Élèves suivis" value={state.students.length} note={`${autonomous} en autonomie`} />
        <StatCard icon={<Mail size={21} />} label="Invitations en attente" value={pendingInvitations} note="Comptes à rejoindre" />
        <StatCard icon={<ClipboardCheck size={21} />} label="Corrections à traiter" value={pendingCorrections} note="Remises en attente" />
        <StatCard icon={<BookOpen size={21} />} label="Niveaux publiés" value={published} note="Catalogue d’allemand" />
      </div>

      <div className="admin-dashboard-grid">
        <section className="panel admin-panel" aria-labelledby="admin-progression">
          <div className="admin-section-head">
            <div>
              <h2 id="admin-progression">Avancement par niveau</h2>
              <p>Moyenne des séances terminées dans les parcours de démonstration.</p>
            </div>
            <Badge tone="blue">Allemand</Badge>
          </div>
          <div className="admin-level-chart">
            {(['A1', 'A2'] as const).map(level => {
              const learners = state.students.filter(student => student.level === level);
              const mean = learners.length
                ? Math.round(learners.reduce((sum, student) => sum + student.progress, 0) / learners.length)
                : 0;
              return (
                <div className="admin-level-row" key={level}>
                  <span className="admin-level-chip">{level}</span>
                  <div className="admin-level-meter">
                    <div className="admin-level-label">
                      <span>{learners.length} élève{learners.length === 1 ? '' : 's'}</span>
                      <strong>{learners.length ? `${mean} %` : '—'}</strong>
                    </div>
                    <ProgressBar value={mean} label={`Avancement moyen du niveau ${level}`} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="panel admin-panel admin-watch" aria-labelledby="admin-attention">
          <span className="admin-card-icon admin-card-icon-amber"><CircleAlert size={23} /></span>
          <div>
            <h2 id="admin-attention">Parcours à surveiller</h2>
            <p>
              {atRisk
                ? `${atRisk} élève${atRisk === 1 ? ' a' : 's ont'} un objectif à risque dans les données locales.`
                : 'Aucun objectif à risque dans les données locales.'}
            </p>
          </div>
          <Link className="btn btn-soft" to="/professeur/alertes">Consulter les alertes</Link>
        </section>
      </div>

      <section className="admin-entry-grid" aria-label="Outils d’administration">
        <Link to="/administration/utilisateurs" className="panel admin-entry">
          <span className="admin-card-icon"><Users size={21} /></span>
          <div><strong>Utilisateurs</strong><span>Invitations et rattachements</span></div>
        </Link>
        <Link to="/administration/catalogue" className="panel admin-entry">
          <span className="admin-card-icon"><BookOpen size={21} /></span>
          <div><strong>Catalogue</strong><span>Niveaux et versions des parcours</span></div>
        </Link>
        <Link to="/administration/mediatheque" className="panel admin-entry">
          <span className="admin-card-icon"><LibraryBig size={21} /></span>
          <div><strong>Médiathèque</strong><span>Images et extraits audio</span></div>
        </Link>
      </section>
    </>
  );
}
