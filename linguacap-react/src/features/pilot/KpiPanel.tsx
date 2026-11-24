import { useEffect, useState, type ReactNode } from 'react';
import { AlertTriangle, CalendarCheck2, CircleCheck, Hourglass, Loader2, MessageCircleHeart, RefreshCw, RotateCcw, SlidersHorizontal, TrendingDown, TrendingUp, UserCheck, UsersRound } from 'lucide-react';
import { EmptyState, ProgressBar } from '../../components/ui';
import { Bars, Callout, Card, Drawer, ProgressRing, Segmented, SkeletonCard } from '../../design/kit';
import { requestApi } from '../../integration/api';
import { useLanguages } from '../../integration/languages';
import { levelCodes, type LevelCode, type TeacherOnboardingStats as TeacherStats } from '../../integration/v2';
import { formatRelative, getError } from './admin-common';
import { TeacherOnboardingStats } from './TeacherOnboardingStats';
import './admin.css';

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
  teacherOnboarding?: TeacherStats;
}

type Filters = Record<'from' | 'to' | 'startLevel' | 'level' | 'template' | 'kind', string>;

const emptyFilters: Filters = { from: '', to: '', startLevel: '', level: '', template: '', kind: '' };
const filterKeys = Object.keys(emptyFilters) as (keyof Filters)[];
const competenceNames: Record<string, string> = {
  lecture: 'Lecture', ecoute: 'Écoute', 'expression-ecrite': 'Expression écrite', 'expression-orale': 'Expression orale',
};
const dayFormat = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' });
const compactDay = new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: '2-digit' });
const periodFormat = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
const stamp = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' });

/** Vrai tant que la requête média correspond (largeur d'écran). */
function useMedia(query: string) {
  const [matches, setMatches] = useState(() => typeof window !== 'undefined' && window.matchMedia(query).matches);
  useEffect(() => {
    const list = window.matchMedia(query);
    const update = () => setMatches(list.matches);
    update();
    list.addEventListener('change', update);
    return () => list.removeEventListener('change', update);
  }, [query]);
  return matches;
}

/** Une date « AAAA-MM-JJ » est lue comme un jour local (et non minuit UTC). */
function localDate(value: string) {
  return new Date(/^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00` : value);
}

function percent(rate: Rate) {
  return rate.rate === null ? '—' : `${rate.rate.toLocaleString('fr-FR', { maximumFractionDigits: 1 })} %`;
}

function share(rate: Rate, unit: string, none: string) {
  return rate.denominator === 0 ? none : `${rate.numerator} sur ${rate.denominator} ${unit}`;
}

function RateCard({ icon, title, rate, unit, none }: { icon: ReactNode; title: string; rate: Rate; unit: string; none: string }) {
  const empty = rate.denominator === 0 || rate.rate === null;
  return (
    <article className={`admin-rate${empty ? ' is-empty' : ''}`}>
      <span className="admin-rate-icon" aria-hidden="true">{icon}</span>
      <div className="admin-rate-main">
        <h3>{title}</h3>
        <p>{share(rate, unit, none)}</p>
        {!empty && <ProgressBar value={rate.rate ?? 0} label={title} />}
      </div>
      <strong className="admin-rate-value">{percent(rate)}</strong>
    </article>
  );
}

function Freshness({ freshness }: { freshness: Dashboard['freshness'] }) {
  const failed = freshness.lastStatus === 'failed';
  const running = freshness.lastStatus === 'running';
  const stale = !freshness.syncedAt || Date.now() - new Date(freshness.syncedAt).getTime() > 36 * 3_600_000;
  const tone = failed || !freshness.syncedAt ? 'is-warning' : stale ? 'is-stale' : '';
  return (
    <span className={`admin-freshness ${tone}`} title={freshness.syncedAt ? `Suivi actualisé le ${stamp.format(new Date(freshness.syncedAt))}` : undefined}>
      {running ? <Loader2 size={15} aria-hidden="true" /> : failed || !freshness.syncedAt ? <AlertTriangle size={15} aria-hidden="true" /> : <CircleCheck size={15} aria-hidden="true" />}
      {freshness.syncedAt ? `Suivi actualisé ${formatRelative(freshness.syncedAt)}` : 'Suivi pas encore actualisé'}
      {failed && ' · dernière actualisation en échec'}
      {running && ' · actualisation en cours'}
    </span>
  );
}

/**
 * Niveaux des filtres : tous ceux du catalogue (publiés, en préparation ou retirés, car des parcours peuvent déjà y
 * exister), toutes langues confondues, dans l'ordre de l'échelle ; l'échelle entière si le catalogue ne répond pas.
 */
function useKpiLevels(token: string): readonly LevelCode[] {
  const { languages, failed } = useLanguages(token);
  if (!languages?.length) return failed ? levelCodes : [];
  const codes = new Set(languages.flatMap((language) => language.levels.map((level) => level.code)));
  return levelCodes.filter((code) => codes.has(code));
}

/** Champs de filtre, dans la barre (bureau) ou dans le panneau latéral (mobile) ; chaque choix s'applique aussitôt. */
function FilterFields({ filters, period, levels, onChange }: {
  filters: Filters; period?: { from: string; to: string }; levels: readonly LevelCode[];
  onChange: (key: keyof Filters) => (value: string) => void;
}) {
  // Un filtre déjà choisi reste affiché même si son niveau a quitté la liste.
  const withChosen = (value: string) => (value && !(levels as readonly string[]).includes(value) ? [...levels, value] : levels);
  return (
    <>
      <div className="admin-kpi-period">
        <label>Du<input type="date" name="from" value={filters.from || period?.from || ''} max={filters.to || period?.to || undefined}
          onChange={(event) => onChange('from')(event.target.value)} /></label>
        <label>Au<input type="date" name="to" value={filters.to || period?.to || ''} min={filters.from || period?.from || undefined}
          onChange={(event) => onChange('to')(event.target.value)} /></label>
      </div>
      <label>Niveau de départ<select name="startLevel" value={filters.startLevel} onChange={(event) => onChange('startLevel')(event.target.value)}>
        <option value="">Tous</option><option value="A0">Débutant</option>
        {withChosen(filters.startLevel).filter((code) => code !== 'A0').map((code) => <option key={code} value={code}>{code}</option>)}
      </select></label>
      <label>Niveau cible<select name="level" value={filters.level} onChange={(event) => onChange('level')(event.target.value)}>
        <option value="">Tous</option>
        {withChosen(filters.level).map((code) => <option key={code} value={code}>{code}</option>)}
      </select></label>
      <label>Cadence<select name="template" value={filters.template} onChange={(event) => onChange('template')(event.target.value)}>
        <option value="">Toutes</option><option value="intensive">Intensif</option><option value="standard">Standard</option><option value="custom">Personnalisée</option>
      </select></label>
      <div className="admin-kpi-kind">
        <span className="admin-field-label" aria-hidden="true">Parcours</span>
        <Segmented label="Type de parcours" value={filters.kind} onChange={onChange('kind')} options={[
          { value: '', label: 'Tous' }, { value: 'accompanied', label: 'Accompagnés' }, { value: 'autonomous', label: 'Autonomes' },
        ]} />
      </div>
    </>
  );
}

/**
 * Tableau de bord administrateur (DEV-084 à DEV-091) : six indicateurs filtrés par période, niveau de départ, niveau
 * cible, cadence et type de parcours, avec leurs effectifs et la date d'actualisation du suivi.
 */
export function KpiPanel({ token }: { token: string }) {
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [data, setData] = useState<Dashboard | null>(null);
  const [error, setError] = useState('');
  const [refresh, setRefresh] = useState(0);
  const [loading, setLoading] = useState(true);
  const params = new URLSearchParams();
  for (const key of filterKeys) if (filters[key]) params.set(key, filters[key]);
  const query = params.toString();

  useEffect(() => {
    let active = true;
    setError('');
    setLoading(true);
    requestApi<Dashboard>(`/tracking/kpis?${query}`, token).then(
      (result) => { if (active) setData(result); },
      (failure: unknown) => { if (active) setError(getError(failure, 'Les indicateurs sont temporairement indisponibles.')); },
    ).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [query, token, refresh]);

  const [filtersOpen, setFiltersOpen] = useState(false);
  const levels = useKpiLevels(token);
  const set = (key: keyof Filters) => (value: string) => setFilters((current) => ({ ...current, [key]: value }));
  const filtered = filterKeys.some((key) => filters[key]);
  const activeCount = filterKeys.filter((key) => filters[key]).length;
  const weeks = data?.activeLearners ?? [];
  const narrow = useMedia('(max-width: 760px)');
  const weekLabel = weeks.length > 10 || (narrow && weeks.length > 5) ? compactDay : dayFormat;
  const goals = data?.goalsValidated;

  return (
    <div className={`admin-kpi lc-enter${loading && data ? ' is-loading' : ''}`}>
      <form className="admin-kpi-bar" aria-label="Filtrer les indicateurs" onSubmit={(event) => event.preventDefault()}>
        <FilterFields filters={filters} period={data?.filters} levels={levels} onChange={set} />
        {filtered && <button type="button" className="btn btn-ghost btn-sm admin-kpi-reset" onClick={() => setFilters(emptyFilters)}>
          <RotateCcw size={15} aria-hidden="true" /> Réinitialiser</button>}
      </form>
      <div className="admin-kpi-mobile-bar">
        <button type="button" className="btn btn-outline" onClick={() => setFiltersOpen(true)}>
          <SlidersHorizontal size={17} aria-hidden="true" /> Filtres{activeCount > 0 && <span className="admin-chip-count is-strong">{activeCount}</span>}
        </button>
        {filtered && <button type="button" className="btn btn-ghost btn-sm" onClick={() => setFilters(emptyFilters)}><RotateCcw size={15} aria-hidden="true" /> Réinitialiser</button>}
      </div>
      {filtersOpen && (
        <Drawer title="Filtrer les indicateurs" description="Les indicateurs se mettent à jour à chaque choix." onClose={() => setFiltersOpen(false)}
          footer={<>
            {filtered && <button type="button" className="btn btn-ghost" onClick={() => setFilters(emptyFilters)}>Réinitialiser</button>}
            <button type="button" className="btn btn-primary" onClick={() => setFiltersOpen(false)}>Voir les indicateurs</button>
          </>}>
          <form className="admin-kpi-sheet" aria-label="Filtrer les indicateurs" onSubmit={(event) => { event.preventDefault(); setFiltersOpen(false); }}>
            <FilterFields filters={filters} period={data?.filters} levels={levels} onChange={set} />
          </form>
        </Drawer>
      )}

      {error ? <div role="alert"><Callout tone="warning" title="Indicateurs indisponibles">{error}</Callout></div> : !data || !goals ? (
        <div className="admin-kpi-skeleton"><SkeletonCard lines={4} label="Calcul des indicateurs…" /><SkeletonCard lines={4} /><SkeletonCard lines={3} /></div>
      ) : (
        <>
          <div className="admin-kpi-meta">
            <p>Du <strong>{periodFormat.format(localDate(data.filters.from))}</strong> au <strong>{periodFormat.format(localDate(data.filters.to))}</strong>
              <span aria-hidden="true"> · </span>{data.goals} parcours retenu{data.goals > 1 ? 's' : ''}</p>
            <span className="admin-kpi-meta-end">
              <Freshness freshness={data.freshness} />
              <button type="button" className="icon-button" onClick={() => setRefresh((value) => value + 1)} aria-label="Actualiser les indicateurs" title="Actualiser">
                <RefreshCw size={17} aria-hidden="true" />
              </button>
            </span>
          </div>

          <div className="admin-kpi-top lc-stagger">
            <section className={`admin-kpi-hero${goals.denominator === 0 ? ' is-empty' : ''}`} aria-labelledby="kpi-goals">
              <div className="admin-kpi-hero-head">
                <span className="admin-kpi-eyebrow">Indicateur principal</span>
                <h2 id="kpi-goals">Objectifs validés à l’échéance</h2>
              </div>
              <div className="admin-kpi-hero-body">
                <ProgressRing value={goals.rate ?? 0} size={150} stroke={13}
                  label={goals.rate === null ? 'Aucun parcours arrivé à échéance' : `${percent(goals)} des objectifs validés à l’échéance`}>
                  <span className="admin-kpi-ring"><strong>{percent(goals)}</strong><small>{goals.rate === null ? 'sans données' : 'validés'}</small></span>
                </ProgressRing>
                <dl className="admin-kpi-figures">
                  <div><dt>Objectifs validés</dt><dd>{goals.numerator}</dd></div>
                  <div><dt>Parcours arrivés à échéance</dt><dd>{goals.denominator}</dd></div>
                  <div className={data.goalsAwaitingGrading ? 'is-waiting' : undefined}>
                    <dt><Hourglass size={14} aria-hidden="true" /> En attente de correction</dt><dd>{data.goalsAwaitingGrading}</dd>
                  </div>
                </dl>
              </div>
              <p className="admin-kpi-note">{goals.denominator === 0 ? 'Aucun parcours de ce groupe n’est encore arrivé à échéance. '
                : ''}Se lit avec la charge prévue, l’assiduité, le point de départ et le nombre de parcours observés.</p>
            </section>
            <div className="admin-kpi-rates">
              <RateCard icon={<UserCheck size={19} />} title="Activation à sept jours" rate={data.activation} unit="invitations" none="Aucune invitation dans ce groupe" />
              <RateCard icon={<CalendarCheck2 size={19} />} title="Séances terminées à temps" rate={data.sessionsOnTime} unit="séances échues" none="Aucune séance échue dans ce groupe" />
              <RateCard icon={<MessageCircleHeart size={19} />} title="Reprise après encouragement" rate={data.resumption} unit="relances" none="Aucune relance dans ce groupe" />
            </div>
          </div>

          <div className="admin-kpi-bottom lc-stagger">
            <Card title="Élèves actifs par semaine" icon={<UsersRound size={18} />} className="admin-kpi-weeks"
              action={<span className="badge badge-blue">{data.activeLearnersTotal} élève{data.activeLearnersTotal > 1 ? 's' : ''} sur la période</span>}>
              {weeks.length === 0 || weeks.every((item) => item.learners === 0)
                ? <EmptyState icon={<UsersRound size={26} />} title="Aucun élève actif sur la période" description="Élargissez la période ou retirez un filtre." />
                : <Bars label="Élèves actifs par semaine" height={190} data={weeks.map((item) => ({
                  label: weekLabel.format(localDate(item.weekStart)), value: item.learners, muted: item.learners === 0,
                }))} />}
            </Card>
            <Card title="Progression entre le bilan et l’examen blanc" icon={<TrendingUp size={18} />} className="admin-kpi-progress">
              {data.progression.length === 0
                ? <EmptyState icon={<TrendingUp size={26} />} title="Aucun élève n’a encore passé les deux évaluations" />
                : (
                  <>
                    <p className="admin-kpi-legend"><span><i className="is-midterm" aria-hidden="true" />Bilan intermédiaire</span><span><i className="is-final" aria-hidden="true" />Examen blanc</span></p>
                    <ul className="admin-kpi-competences">
                      {data.progression.map((row) => (
                        <li key={row.competence}>
                          <div className="admin-kpi-competence-head">
                            <strong>{competenceNames[row.competence] ?? row.competence}</strong>
                            <small>{row.learners} élève{row.learners > 1 ? 's' : ''}</small>
                            <span className={`admin-delta${row.delta > 0 ? ' is-up' : row.delta < 0 ? ' is-down' : ''}`}>
                              {row.delta > 0 ? <TrendingUp size={14} aria-hidden="true" /> : row.delta < 0 ? <TrendingDown size={14} aria-hidden="true" /> : null}
                              {row.delta > 0 ? '+' : row.delta < 0 ? '−' : ''}{Math.abs(row.delta)} pts
                            </span>
                          </div>
                          <div className="admin-kpi-pair">
                            <span className="admin-kpi-track"><span className="is-midterm" style={{ width: `${Math.min(100, Math.max(0, row.midterm))}%` }} /></span>
                            <b><span className="sr-only">Bilan : </span>{row.midterm} %</b>
                            <span className="admin-kpi-track"><span className="is-final" style={{ width: `${Math.min(100, Math.max(0, row.fin))}%` }} /></span>
                            <b><span className="sr-only">Examen blanc : </span>{row.fin} %</b>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
            </Card>
          </div>
          {data.teacherOnboarding && <TeacherOnboardingStats stats={data.teacherOnboarding} />}
        </>
      )}
    </div>
  );
}
