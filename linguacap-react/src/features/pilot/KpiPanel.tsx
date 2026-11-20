import { useEffect, useState, type FormEvent } from 'react';
import { RefreshCw } from 'lucide-react';
import { EmptyState, StatCard } from '../../components/ui';
import { requestApi } from '../../integration/api';

interface Rate { numerator: number; denominator: number; rate: number | null }
interface Dashboard {
  activation: Rate;
  activeLearners: { weekStart: string; learners: number }[];
  activeLearnersTotal: number;
  sessionsOnTime: Rate;
  goalsValidated: Rate;
  goalsAwaitingGrading: number;
  progression: { competence: string; learners: number; midterm: number; fin: number; delta: number }[];
  resumption: Rate;
  goals: number;
  filters: { from: string; to: string };
  freshness: { syncedAt: string | null; lastStatus: string | null };
}

const competenceNames: Record<string, string> = {
  lecture: 'Lecture', ecoute: 'Écoute', 'expression-ecrite': 'Expression écrite', 'expression-orale': 'Expression orale',
};
const dayFormat = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' });
const stamp = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' });

function getError(error: unknown) {
  return error instanceof Error ? error.message : 'Les indicateurs sont temporairement indisponibles.';
}

function percent(rate: Rate) {
  return rate.rate === null ? '—' : `${rate.rate.toLocaleString('fr-FR')} %`;
}

function share(rate: Rate, unit: string) {
  return rate.denominator === 0 ? `Aucun ${unit} dans ce groupe` : `${rate.numerator} sur ${rate.denominator} ${unit}`;
}

/**
 * Tableau de bord administrateur (DEV-084 à DEV-091) : six indicateurs filtrés par période, niveau de départ, niveau
 * cible, cadence et type de parcours, avec leurs effectifs et la date d'actualisation du suivi.
 */
export function KpiPanel({ token }: { token: string }) {
  const [query, setQuery] = useState('');
  const [data, setData] = useState<Dashboard | null>(null);
  const [error, setError] = useState('');
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    let active = true;
    setError('');
    requestApi<Dashboard>(`/tracking/kpis?${query}`, token).then(
      (result) => { if (active) setData(result); },
      (failure: unknown) => { if (active) setError(getError(failure)); },
    );
    return () => { active = false; };
  }, [query, token, refresh]);

  function apply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const params = new URLSearchParams();
    for (const key of ['from', 'to', 'startLevel', 'level', 'template', 'kind']) {
      const value = String(form.get(key) ?? '');
      if (value) params.set(key, value);
    }
    setQuery(params.toString());
  }

  return (
    <section className="panel stack" aria-labelledby="kpi-title">
      <div className="teacher-panel-heading">
        <div><h2 id="kpi-title">Indicateurs</h2><p className="muted">Usages du pilote par période, niveau, cadence et type de parcours</p></div>
        <button type="button" className="btn btn-outline" onClick={() => setRefresh((value) => value + 1)}><RefreshCw size={17} aria-hidden="true" /> Actualiser</button>
      </div>
      <form className="media-filters" onSubmit={apply} aria-label="Filtrer les indicateurs">
        <label>Du<input type="date" name="from" defaultValue={data?.filters.from} /></label>
        <label>Au<input type="date" name="to" defaultValue={data?.filters.to} /></label>
        <label>Niveau de départ<select name="startLevel" defaultValue="">
          <option value="">Tous</option><option value="A0">Débutant</option><option value="A1">A1</option><option value="A2">A2</option><option value="B1">B1</option>
        </select></label>
        <label>Niveau cible<select name="level" defaultValue="">
          <option value="">Tous</option><option value="A1">A1</option><option value="A2">A2</option><option value="B1">B1</option><option value="B2">B2</option>
        </select></label>
        <label>Cadence<select name="template" defaultValue="">
          <option value="">Toutes</option><option value="intensive">Intensif</option><option value="standard">Standard</option><option value="custom">Personnalisée</option>
        </select></label>
        <label>Parcours<select name="kind" defaultValue="">
          <option value="">Tous</option><option value="accompanied">Accompagnés</option><option value="autonomous">Autonomes</option>
        </select></label>
        <button type="submit" className="btn btn-primary btn-small">Appliquer</button>
      </form>
      {error ? <p className="inline-message warning" role="alert">{error}</p> : !data ? <p role="status">Calcul des indicateurs…</p> : (
        <>
          <p className="muted">Du {new Date(data.filters.from).toLocaleDateString('fr-FR')} au {new Date(data.filters.to).toLocaleDateString('fr-FR')} · {data.goals} parcours retenus
            {data.freshness.syncedAt ? ` · suivi actualisé le ${stamp.format(new Date(data.freshness.syncedAt))}` : ' · suivi pas encore actualisé'}</p>
          <div className="teacher-stats">
            <StatCard label="Objectifs validés à l’échéance" value={percent(data.goalsValidated)}
              note={`${share(data.goalsValidated, 'parcours')}${data.goalsAwaitingGrading ? ` · ${data.goalsAwaitingGrading} en attente de correction` : ''}`} />
            <StatCard label="Activation à sept jours" value={percent(data.activation)} note={share(data.activation, 'invitations')} />
            <StatCard label="Séances terminées à temps" value={percent(data.sessionsOnTime)} note={share(data.sessionsOnTime, 'séances échues')} />
            <StatCard label="Reprise après encouragement" value={percent(data.resumption)} note={share(data.resumption, 'relances')} />
          </div>
          <div className="pilot-grid">
            <section className="stack" aria-labelledby="kpi-weeks">
              <h3 id="kpi-weeks">Élèves actifs par semaine · {data.activeLearnersTotal} sur la période</h3>
              <table className="teacher-table">
                <thead><tr><th scope="col">Semaine du</th><th scope="col">Élèves actifs</th></tr></thead>
                <tbody>{data.activeLearners.map((week) => (
                  <tr key={week.weekStart}><th scope="row">{dayFormat.format(new Date(week.weekStart))}</th><td>{week.learners}</td></tr>
                ))}</tbody>
              </table>
            </section>
            <section className="stack" aria-labelledby="kpi-progression">
              <h3 id="kpi-progression">Progression entre le bilan et l’examen blanc</h3>
              {data.progression.length === 0 ? <EmptyState title="Aucun élève n’a encore passé les deux évaluations" /> : (
                <table className="teacher-table">
                  <thead><tr><th scope="col">Compétence</th><th scope="col">Bilan</th><th scope="col">Examen blanc</th><th scope="col">Écart</th><th scope="col">Élèves</th></tr></thead>
                  <tbody>{data.progression.map((row) => (
                    <tr key={row.competence}><th scope="row">{competenceNames[row.competence] ?? row.competence}</th>
                      <td>{row.midterm} %</td><td>{row.fin} %</td><td>{row.delta > 0 ? '+' : ''}{row.delta} pts</td><td>{row.learners}</td></tr>
                  ))}</tbody>
                </table>
              )}
            </section>
          </div>
          <p className="muted">L’indicateur principal du pilote est le taux d’objectifs validés à l’échéance. Il se lit avec la charge prévue, l’assiduité, le point de départ et le nombre de parcours observés.</p>
        </>
      )}
    </section>
  );
}
