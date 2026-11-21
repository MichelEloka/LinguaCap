import { useId, useState } from 'react';
import { BookOpen, TrendingUp, UsersRound } from 'lucide-react';
import { EmptyState } from '../../components/ui';
import { Bars, Card, Segmented } from '../../design/kit';
import { languageName } from '../../domain/languages';
import type { TeacherOnboardingStats as Stats } from '../../integration/v2';
import './teacher-onboarding-stats.css';

const format = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' });
const availabilityLabels: Readonly<Record<string, string>> = { yes: 'Disponibles', no: 'Ont déjà leurs élèves', unknown: 'Non renseigné' };
const originLabels: Readonly<Record<string, string>> = { self: 'Par le professeur', linguacap: 'Avec LinguaCap', unknown: 'Non renseignée' };

function Breakdown({ title, values, label }: {
  title: string;
  values: Record<string, number>;
  label: (key: string) => string;
}) {
  const rows = Object.entries(values)
    .filter(([, count]) => count > 0)
    .sort(([left, a], [right, b]) => b - a || left.localeCompare(right, 'fr', { numeric: true }));

  return (
    <section className="teacher-stat-group">
      <h3>{title}</h3>
      {!rows.length ? <p className="muted">Aucune réponse</p> : (
        <dl>{rows.map(([key, count]) => <div key={key}><dt>{label(key)}</dt><dd>{count}</dd></div>)}</dl>
      )}
    </section>
  );
}

type TrendKey = 'responses' | 'accepting' | 'notAccepting' | 'self' | 'linguacap';
const trendOptions: { label: string; value: TrendKey }[] = [
  { value: 'responses', label: 'Réponses' },
  { value: 'accepting', label: 'Disponibles' },
  { value: 'notAccepting', label: 'Ont déjà leurs élèves' },
  { value: 'self', label: 'Créent leurs cours' },
  { value: 'linguacap', label: 'Avec LinguaCap' },
];

export function TeacherOnboardingStats({ stats }: { stats: Stats }) {
  const id = useId();
  const [series, setSeries] = useState<TrendKey>('responses');
  const days = stats.trend.map((item) => ({ label: format.format(new Date(`${item.date}T12:00:00`)), value: item[series] }));
  return (
    <section className="teacher-stats-panel lc-enter" aria-labelledby={id}>
      <header className="teacher-stats-title">
        <div><h2 id={id}>Accueil des professeurs</h2><p className="muted">Les répartitions couvrent les professeurs actifs. La tendance suit la période choisie.</p></div>
        <span className="badge badge-blue"><UsersRound size={15} aria-hidden="true" /> {stats.teachers} professeur{stats.teachers === 1 ? '' : 's'}</span>
      </header>
      {!stats.teachers && !days.length ? <EmptyState title="Aucune réponse d’accueil" /> : <>
        <div className="teacher-stats-distributions">
          <Breakdown title="Langues enseignées" values={stats.byLanguage} label={(key) => key === 'unknown' ? 'Non renseignées' : languageName(key)} />
          <Breakdown title="Niveaux enseignés" values={stats.byLevel} label={(key) => key === 'unknown' ? 'Non renseignés' : key} />
          <Breakdown title="Disponibilité" values={stats.byAvailability} label={(key) => availabilityLabels[key] ?? key} />
          <Breakdown title="Construction des cours" values={stats.byCourseMode} label={(key) => originLabels[key] ?? key} />
          <Breakdown title="Nombre d’élèves envisagé" values={stats.byMaxLearners} label={(key) => key === 'unknown' ? 'Non renseigné' : key} />
          <Breakdown title="Délai de correction" values={stats.byGradingDelayHours} label={(key) => key === 'unknown' ? 'Non renseigné' : `${key} h`} />
        </div>
        <Card title="Tendance des réponses" icon={<TrendingUp size={18} />} className="teacher-stats-trend">
          {!days.length ? <EmptyState icon={<BookOpen size={20} />} title="Aucune réponse sur cette période" />
            : <>
              <Segmented label="Série du graphique" options={trendOptions} value={series} onChange={setSeries} />
              <Bars label={trendOptions.find(({ value }) => value === series)?.label ?? 'Réponses'} data={days} height={176} />
            </>}
        </Card>
      </>}
    </section>
  );
}
