/**
 * Bibliothèque de l'élève (/espace/bibliotheque) : tous les niveaux de sa langue (les niveaux non publiés sont grisés),
 * modules et activités avec le dernier score, recherche, et entraînement au bilan intermédiaire. L'examen blanc, qui
 * valide un niveau, n'est jamais proposé ici : il se passe dans le parcours.
 */
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, BookOpen, ChevronRight, ClipboardCheck, Clock, Dumbbell, Headphones, LibraryBig, LoaderCircle, Lock, Mic,
  PencilLine, RotateCcw, SearchX, ShieldCheck, Trophy,
} from 'lucide-react';
import { Badge, EmptyState, PageHeading } from '../../components/ui';
import { Callout, Card, ListItem, ProgressRing, SearchField, SkeletonCard, SplitView, useToast } from '../../design/kit';
import { requestApi } from '../../integration/api';
import {
  competenceLabels, examKindLabels, formatMinutes, levelCodes, type Language, type LevelCode, type Library, type LibraryActivityItem,
  type LibraryLevel, type LibraryModule, type PracticeSummary, type PracticeView,
} from '../../integration/v2';
import { errorText, LevelMark, levelName, momentText } from '../onboarding/onboarding-kit';
import './library.css';

const kindIcons = { lesson: BookOpen, exercise: PencilLine };
const kindLabels = { lesson: 'Leçon', exercise: 'Exercice' };
const competenceIcons: Record<string, typeof BookOpen> = { lecture: BookOpen, ecoute: Headphones, 'expression-ecrite': PencilLine, 'expression-orale': Mic };

export const scorePercent = (result: { correct: number; total: number }) => (result.total ? Math.round((result.correct / result.total) * 100) : 0);

interface LevelTab { code: LevelCode; title: string; level: LibraryLevel | null; published: boolean }

export function activityHref(level: Pick<LibraryLevel, 'trackVersionId'>, activity: Pick<LibraryActivityItem, 'id'>) {
  return `/espace/bibliotheque/${encodeURIComponent(level.trackVersionId)}/${encodeURIComponent(activity.id)}`;
}

function ActivityRow({ level, activity, module }: { level: LibraryLevel; activity: LibraryActivityItem; module?: string }) {
  const Icon = kindIcons[activity.kind] ?? BookOpen;
  const score = activity.lastResult ? scorePercent(activity.lastResult) : null;
  return (
    <ListItem as="li" href={activityHref(level, activity)}
      leading={<span className={`lib-kind is-${activity.kind}`} aria-hidden="true"><Icon size={17} /></span>}
      title={activity.title}
      subtitle={<>{module ? `${module} · ` : ''}{kindLabels[activity.kind] ?? 'Activité'} · {activity.estimatedMinutes} min
        {activity.competences.length > 0 && <span className="lib-skills"> · {activity.competences.map((name) => competenceLabels[name] ?? name).join(', ')}</span>}</>}
      trailing={<>
        {score !== null && activity.lastResult
          ? <Badge tone={score >= 70 ? 'green' : 'amber'}>{activity.lastResult.correct}/{activity.lastResult.total}</Badge>
          : activity.kind === 'exercise' ? <span className="lib-todo">À faire</span> : null}
        <ChevronRight size={18} aria-hidden="true" />
      </>} />
  );
}

function moduleProgress(module: LibraryModule) {
  const exercises = module.activities.filter((activity) => activity.kind === 'exercise');
  const done = exercises.filter((activity) => activity.lastResult).length;
  return { done, total: exercises.length, minutes: module.activities.reduce((sum, activity) => sum + activity.estimatedMinutes, 0) };
}

/** Entraînement au bilan intermédiaire : démarrage ou reprise, dernier score et délai avant un nouvel essai. */
function PracticeCard({ level, history, token }: { level: LibraryLevel; history: PracticeSummary[]; token: string }) {
  const navigate = useNavigate();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const midterm = level.practice.find((entry) => entry.kind === 'midterm');
  const mine = history.filter((entry) => entry.trackVersionId === level.trackVersionId && entry.kind === 'midterm');
  const open = mine.find((entry) => entry.status === 'in_progress');
  const last = mine.find((entry) => entry.status === 'submitted');

  async function start() {
    setBusy(true);
    setError('');
    try {
      const view = await requestApi<PracticeView>('/assessments/practice', token, { method: 'POST', body: { trackVersionId: level.trackVersionId, kind: 'midterm' } });
      toast(view.status === 'in_progress' && open ? 'Reprise de votre entraînement.' : 'Entraînement prêt. Bon courage !');
      navigate(`/espace/bibliotheque/entrainement/${encodeURIComponent(view.id)}`);
    } catch (failure) {
      setError(errorText(failure));
      setBusy(false);
    }
  }

  return (
    <Card className="lib-practice" title="S’entraîner au bilan" icon={<Dumbbell size={19} />}
      description={`${examKindLabels.midterm} ${level.levelCode}, corrigé automatiquement`}>
      {midterm?.available ? (
        <>
          <p className="lib-practice-text">Les parties lecture et écoute sont notées ; l’écrit et l’oral se travaillent seuls. Les réponses justes ne sont pas dévoilées, pour que l’entraînement reste utile.</p>
          {last && (
            <div className="lib-practice-last">
              <ProgressRing value={last.percent ?? 0} size={52} stroke={6} color={(last.percent ?? 0) >= 60 ? 'var(--success)' : 'var(--warning)'} label={`Dernier score : ${last.percent ?? 0} %`}>
                <small className="lib-ring-mini">{last.percent ?? 0}</small>
              </ProgressRing>
              <span><strong>Dernier essai</strong><small>{last.submittedAt ? momentText(last.submittedAt) : '—'}</small></span>
              <Link className="text-link" to={`/espace/bibliotheque/entrainement/${encodeURIComponent(last.id)}`}>Revoir</Link>
            </div>
          )}
          {error && <p className="inline-message warning" role="alert">{error}</p>}
          <button type="button" className="btn btn-primary btn-block" disabled={busy} onClick={() => open ? navigate(`/espace/bibliotheque/entrainement/${encodeURIComponent(open.id)}`) : void start()}>
            {busy ? <LoaderCircle size={17} className="ob-spin" aria-hidden="true" /> : open ? <RotateCcw size={17} aria-hidden="true" /> : <ClipboardCheck size={17} aria-hidden="true" />}
            {open ? 'Reprendre mon entraînement' : last ? 'Nouvel entraînement' : 'Commencer l’entraînement'}
          </button>
        </>
      ) : <p className="lib-practice-text">Aucun bilan d’entraînement n’est proposé pour ce niveau pour le moment.</p>}
      <p className="lib-practice-note"><ShieldCheck size={15} aria-hidden="true" /> L’examen blanc, qui valide le niveau, se passe uniquement dans votre parcours.</p>
    </Card>
  );
}

function ModuleDetail({ level, module, onBack }: { level: LibraryLevel; module: LibraryModule; onBack: () => void }) {
  const progress = moduleProgress(module);
  const competences = [...new Set(module.activities.flatMap((activity) => activity.competences))];
  return (
    <section className="kit-card is-flush lib-module" aria-labelledby={`lib-module-${module.id}`}>
      <header className="lib-module-head">
        <button type="button" className="btn btn-ghost btn-sm lib-module-back" onClick={onBack}><ArrowLeft size={16} aria-hidden="true" /> Modules</button>
        <div className="lib-module-title">
          <span className="lib-module-num" aria-hidden="true">{module.position}</span>
          <div><p className="lib-module-kicker">Module {module.position} · {level.levelCode}</p><h2 id={`lib-module-${module.id}`}>{module.title}</h2></div>
        </div>
        {module.objective && <p className="lib-module-objective">{module.objective}</p>}
        <div className="lib-module-meta">
          <span><Clock size={15} aria-hidden="true" /> {formatMinutes(progress.minutes)}</span>
          <span><Trophy size={15} aria-hidden="true" /> {progress.done}/{progress.total} exercices faits</span>
          {competences.map((name) => { const Icon = competenceIcons[name] ?? BookOpen; return <span key={name} className="lib-chip"><Icon size={13} aria-hidden="true" />{competenceLabels[name] ?? name}</span>; })}
        </div>
      </header>
      <ul className="kit-list lib-activities lc-stagger">
        {module.activities.map((activity) => <ActivityRow key={activity.id} level={level} activity={activity} />)}
      </ul>
    </section>
  );
}

export function LibraryPage({ token }: { token: string }) {
  const [params, setParams] = useSearchParams();
  const [library, setLibrary] = useState<Library | null>(null);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [history, setHistory] = useState<PracticeSummary[]>([]);
  const [failure, setFailure] = useState('');
  const [retry, setRetry] = useState(0);
  const [query, setQuery] = useState('');

  useEffect(() => {
    let active = true;
    setFailure('');
    Promise.all([
      requestApi<Library>('/learning/library', token),
      requestApi<Language[]>('/languages', token).catch(() => [] as Language[]),
      requestApi<PracticeSummary[]>('/assessments/practice', token).catch(() => [] as PracticeSummary[]),
    ]).then(([lib, langs, practice]) => {
      if (!active) return;
      setLibrary(lib);
      setLanguages(langs);
      setHistory(practice);
    }).catch((error: unknown) => { if (active) setFailure(errorText(error)); });
    return () => { active = false; };
  }, [token, retry]);

  const tabs = useMemo<LevelTab[]>(() => {
    if (!library) return [];
    const language = languages.find((item) => item.id === library.languageId);
    const codes = new Set<LevelCode>([...library.levels.map((level) => level.levelCode), ...(language?.levels.map((level) => level.code) ?? [])]);
    return levelCodes.filter((code) => codes.has(code)).map((code) => {
      const level = library.levels.find((item) => item.levelCode === code) ?? null;
      const known = language?.levels.find((item) => item.code === code);
      return { code, title: level?.levelTitle ?? known?.title ?? levelName(code), level, published: Boolean(level) };
    });
  }, [library, languages]);

  const requested = params.get('niveau');
  const selected = tabs.find((tab) => tab.code === requested && tab.level)
    ?? tabs.find((tab) => tab.level?.current) ?? tabs.find((tab) => tab.level?.inPath) ?? tabs.find((tab) => tab.level);
  const level = selected?.level ?? null;
  const moduleParam = params.get('module');
  const module = level ? level.modules.find((item) => item.id === moduleParam) ?? level.modules[0] : undefined;

  const select = (patch: Record<string, string | null>) => {
    const next = new URLSearchParams(params);
    for (const [key, value] of Object.entries(patch)) { if (value === null) next.delete(key); else next.set(key, value); }
    setParams(next, { replace: true });
  };

  const results = useMemo(() => {
    const text = query.trim().toLowerCase();
    if (!text || !level) return null;
    return level.modules.flatMap((item) => item.activities.filter((activity) => activity.title.toLowerCase().includes(text)
      || item.title.toLowerCase().includes(text)).map((activity) => ({ module: item, activity })));
  }, [query, level]);

  const heading = <PageHeading eyebrow="Accès libre" title="Bibliothèque"
    description="Tous les cours de votre langue, à tout moment : revoyez une leçon, refaites un exercice, entraînez-vous au bilan." />;

  if (!library) {
    return (
      <div className="lib-page lc-enter">
        {heading}
        {failure ? (
          <div role="alert"><Callout tone="warning" title="Bibliothèque indisponible">
            <p>{failure}</p>
            <button type="button" className="btn btn-outline btn-sm" onClick={() => setRetry((value) => value + 1)}><RotateCcw size={15} aria-hidden="true" /> Réessayer</button>
          </Callout></div>
        ) : <div className="lib-loading"><SkeletonCard lines={2} label="Chargement de la bibliothèque…" /><SkeletonCard lines={6} /><SkeletonCard lines={4} /></div>}
      </div>
    );
  }

  const activities = level ? level.modules.flatMap((item) => item.activities) : [];
  const exercises = activities.filter((activity) => activity.kind === 'exercise');
  const scored = exercises.filter((activity) => activity.lastResult);
  const average = scored.length ? Math.round(scored.reduce((sum, activity) => sum + scorePercent(activity.lastResult ?? { correct: 0, total: 0 }), 0) / scored.length) : null;

  return (
    <div className="lib-page lc-enter">
      {heading}
      <nav className="lib-levels lc-stagger" aria-label="Niveaux">
        {tabs.map((tab) => (
          tab.level ? (
            <button key={tab.code} type="button" className={`lib-level lvl-${tab.code}`} aria-pressed={tab.code === selected?.code}
              onClick={() => { select({ niveau: tab.code, module: null }); setQuery(''); }}>
              <LevelMark code={tab.code} size="md" />
              <span><strong>{levelName(tab.code)}</strong><small>{tab.level.current ? 'Votre niveau en cours' : tab.level.inPath ? 'Dans votre parcours' : `${tab.level.modules.length} modules`}</small></span>
            </button>
          ) : (
            <span key={tab.code} className="lib-level is-soon" aria-disabled="true">
              <LevelMark code={tab.code} size="md" state="locked" />
              <span><strong>{tab.code}</strong><small><Lock size={11} aria-hidden="true" /> Bientôt</small><span className="sr-only">{levelName(tab.code)}, bientôt disponible</span></span>
            </span>
          )
        ))}
      </nav>

      {!level ? (
        <Card><EmptyState icon={<LibraryBig size={26} />} title="Aucun cours publié pour le moment" description="Les cours apparaîtront ici dès leur publication." /></Card>
      ) : (
        <>
          <div className="lib-summary">
            <div className={`lib-banner lvl-${level.levelCode}`}>
              <LevelMark code={level.levelCode} size="lg" />
              <div className="lib-banner-text">
                <p className="lib-banner-kicker">{level.current ? 'Niveau en cours' : level.inPath ? 'Prévu dans votre parcours' : 'Hors de votre parcours'} · version {level.number}</p>
                <h2>{level.levelTitle}</h2>
                <ul className="lib-banner-facts">
                  <li><strong>{level.modules.length}</strong> modules</li>
                  <li><strong>{activities.length}</strong> activités</li>
                  <li><strong>{scored.length}/{exercises.length}</strong> exercices faits</li>
                  {average !== null && <li><strong>{average} %</strong> de réussite</li>}
                </ul>
                {exercises.length > 0 && (
                  <div className="lib-banner-progress" role="img" aria-label={`${scored.length} exercices faits sur ${exercises.length}`}>
                    <span>{scored.length ? `${Math.round((scored.length / exercises.length) * 100)} % des exercices déjà faits` : 'Aucun exercice fait pour l’instant : lancez-vous !'}</span>
                    <i><b style={{ width: `${Math.max(2, (scored.length / exercises.length) * 100)}%` }} /></i>
                  </div>
                )}
              </div>
            </div>
            <PracticeCard level={level} history={history} token={token} />
          </div>

          <div className="lib-toolbar">
            <SearchField label={`Rechercher une activité du niveau ${level.levelCode}`} placeholder="Rechercher une leçon, un exercice…" value={query} onChange={setQuery} />
          </div>

          {results ? (
            <Card flush title={`${results.length} résultat${results.length > 1 ? 's' : ''}`} description={`Pour « ${query.trim()} » dans le niveau ${level.levelCode}`}>
              {results.length
                ? <ul className="kit-list lib-activities">{results.map(({ module: item, activity }) => <ActivityRow key={activity.id} level={level} activity={activity} module={item.title} />)}</ul>
                : <EmptyState icon={<SearchX size={26} />} title="Aucune activité trouvée" description="Essayez un autre mot, en français ou en allemand." />}
            </Card>
          ) : module ? (
            <SplitView hasDetail={Boolean(moduleParam)}
              list={(
                <nav className="kit-card is-flush lib-modules" aria-label={`Modules du niveau ${level.levelCode}`}>
                  <ul className="kit-list">
                    {level.modules.map((item) => {
                      const progress = moduleProgress(item);
                      return (
                        <ListItem as="li" key={item.id} current={item.id === module.id} onClick={() => select({ module: item.id })}
                          leading={<span className="lib-module-badge" aria-hidden="true">{item.position}</span>}
                          title={item.title}
                          subtitle={`${item.activities.length} activités · ${formatMinutes(progress.minutes)}`}
                          trailing={progress.total ? (
                            <ProgressRing value={(progress.done / progress.total) * 100} size={34} stroke={4} color="var(--success)"
                              label={`${progress.done} exercices faits sur ${progress.total}`}><small className="lib-ring-mini">{progress.done}</small></ProgressRing>
                          ) : <ArrowRight size={16} aria-hidden="true" />} />
                      );
                    })}
                  </ul>
                </nav>
              )}
              detail={<ModuleDetail level={level} module={module} onBack={() => select({ module: null })} />} />
          ) : (
            <Card><EmptyState icon={<BookOpen size={26} />} title="Ce niveau n’a pas encore de module" /></Card>
          )}
        </>
      )}
    </div>
  );
}
