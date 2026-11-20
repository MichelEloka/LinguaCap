/**
 * Correction des évaluations (DEV-069) : file des copies à gauche, copie et grille à droite. Les questions fermées sont
 * corrigées automatiquement ; l'écrit et l'oral sont notés critère par critère, avec le total mis à jour en direct.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, ClipboardCheck, Inbox, ListChecks, Minus, PenLine, Plus, Sparkles } from 'lucide-react';
import { Badge, EmptyState } from '../../components/ui';
import {
  AudioPlayer, Avatar, Callout, Card, Facts, ProgressRing, SearchField, Segmented, SkeletonCard, SplitView, TabPanel, Tabs, useToast,
} from '../../design/kit';
import { requestApi } from '../../integration/api';
import { LessonContent } from './LessonContent';
import {
  ClosedAnswers, CompetenceIcon, ProductionText, ResultSummary, competenceNames, competenceTone, countWords, examNames,
  fromNow, getError, plural, shortDate, statusBadge, timeOnly, type ExamPart, type ExamView, type QueueItem,
} from './exams-shared';

type Points = Record<string, Record<string, number | null>>;
const tabNames: Record<string, string> = { lecture: 'Lecture', ecoute: 'Écoute', 'expression-ecrite': 'Écrit', 'expression-orale': 'Oral' };

/** Libellé court d'onglet (compétence), numéroté si deux parties travaillent la même compétence. */
function tabLabel(part: ExamPart, parts: ExamPart[]) {
  const same = parts.filter((item) => item.competence === part.competence);
  const name = tabNames[part.competence] ?? part.title;
  return same.length > 1 ? `${name} ${same.indexOf(part) + 1}` : name;
}

/** Note d'un critère : boutons moins et plus autour du nombre, curseur pour aller vite. */
function CriterionControl({ id, name, label, max, value, missing, onChange }: {
  id: string; name: string; label: string; max: number; value: number | null; missing: boolean; onChange: (value: number | null) => void;
}) {
  const set = (next: number) => onChange(Math.max(0, Math.min(max, Math.round(next))));
  // Depuis un critère vide : « moins » donne 0, « plus » donne 1.
  return (
    <div className={`ev-criterion${missing && value === null ? ' is-missing' : ''}${value !== null ? ' is-set' : ''}`}>
      <div className="ev-criterion-head">
        <label htmlFor={id}>{label}</label>
        <span className="ev-criterion-max">sur {max}</span>
      </div>
      <div className="ev-criterion-controls">
        <div className="ev-stepper">
          <button type="button" onClick={() => set(value === null ? 0 : value - 1)} disabled={value === 0} aria-label={`Retirer un point · ${label}`}>
            <Minus size={16} aria-hidden="true" /></button>
          <input id={id} name={name} type="number" min={0} max={max} step={1} inputMode="numeric" placeholder="–" value={value ?? ''}
            onChange={(event) => (event.target.value === '' ? onChange(null) : set(Number(event.target.value)))} />
          <button type="button" onClick={() => set(value === null ? 1 : value + 1)} disabled={value !== null && value >= max} aria-label={`Ajouter un point · ${label}`}>
            <Plus size={16} aria-hidden="true" /></button>
        </div>
        <input type="range" className="ev-slider" min={0} max={max} step={1} value={value ?? 0} aria-label={`Curseur · ${label}`}
          style={{ ['--p' as string]: `${value === null ? 0 : (value / max) * 100}%` }} onChange={(event) => set(Number(event.target.value))} />
      </div>
    </div>
  );
}

function PartHeading({ part, index, total, level = 3 }: { part: ExamPart; index: number; total: number; level?: 2 | 3 }) {
  const Heading = level === 2 ? 'h2' : 'h3';
  return (
    <header className="ev-part-head">
      <span className={`ev-part-icon is-${competenceTone(part.competence)}`}><CompetenceIcon competence={part.competence} size={20} /></span>
      <div>
        <p className="ev-part-kicker">Partie {index + 1} sur {total} · {competenceNames[part.competence] ?? part.competence}</p>
        <Heading id={`grade-${part.id}`}>{part.title}</Heading>
      </div>
    </header>
  );
}

/** Copie d'une remise : productions de l'élève, grille par critère et appréciation générale. */
function GradingCopy({ token, attemptId, item, next, onGraded }: {
  token: string; attemptId: string; item: QueueItem | undefined; next: QueueItem | undefined; onGraded: () => void;
}) {
  const navigate = useNavigate();
  const toast = useToast();
  const [exam, setExam] = useState<ExamView | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [points, setPoints] = useState<Points>({});
  const [comments, setComments] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState('');
  const [tab, setTab] = useState('');
  const [missing, setMissing] = useState(false);
  // Le nom reste affiché après la correction, quand la copie a quitté la file.
  const name = useRef(item?.learnerName);
  if (item) name.current = item.learnerName;

  useEffect(() => {
    let active = true;
    requestApi<ExamView>(`/assessments/exams/${encodeURIComponent(attemptId)}`, token).then(
      (data) => {
        if (!active) return;
        setExam(data);
        const first = data.definition.parts.find((part) => part.mode !== 'closed') ?? data.definition.parts[0];
        setTab(data.status === 'graded' ? 'resultat' : first?.id ?? 'synthese');
      },
      (failure: unknown) => { if (active) setError(getError(failure)); },
    );
    return () => { active = false; };
  }, [attemptId, token]);

  const gradable = useMemo(() => exam?.definition.parts.filter((part) => part.mode !== 'closed') ?? [], [exam]);
  const valueOf = (part: ExamPart, criterionId: string) => points[part.id]?.[criterionId] ?? null;
  const partFilled = (part: ExamPart) => part.criteria.every((criterion) => valueOf(part, criterion.id) !== null);
  const totals = useMemo(() => {
    let earned = 0;
    let max = 0;
    let filled = 0;
    let count = 0;
    for (const part of exam?.definition.parts ?? []) {
      if (part.mode === 'closed') {
        const score = exam?.closedScores?.[part.id];
        if (score) { earned += score.points; max += score.max; }
        continue;
      }
      for (const criterion of part.criteria) {
        const value = points[part.id]?.[criterion.id] ?? null;
        count += 1;
        max += criterion.maxPoints;
        if (value !== null) { filled += 1; earned += value; }
      }
    }
    return { earned, max, filled, count, percent: max ? Math.round((earned / max) * 100) : 0 };
  }, [exam, points]);

  async function submit() {
    if (!exam || busy) return;
    const incomplete = gradable.filter((part) => !partFilled(part));
    if (incomplete.length) {
      setMissing(true);
      setTab(incomplete[0].id);
      toast(`Notez chaque critère avant d’enregistrer (${plural(totals.count - totals.filled, 'critère restant', 'critères restants')}).`, 'warning');
      return;
    }
    const parts: Record<string, { points: Record<string, number>; comment: string }> = {};
    for (const part of gradable) {
      parts[part.id] = {
        points: Object.fromEntries(part.criteria.map((criterion) => [criterion.id, Number(valueOf(part, criterion.id))])),
        comment: comments[part.id] ?? '',
      };
    }
    setBusy(true);
    setError('');
    try {
      const graded = await requestApi<ExamView>(`/assessments/exams/${encodeURIComponent(exam.id)}/grading`, token, {
        method: 'POST', body: { parts, feedback },
      });
      setExam(graded);
      setTab('resultat');
      toast(`Correction enregistrée${name.current ? ` pour ${name.current}` : ''}.`);
      onGraded();
    } catch (failure) {
      setError(getError(failure));
    } finally {
      setBusy(false);
    }
  }

  const back = <Link className="text-link ev-copy-back" to="/espace/corrections"><ArrowLeft size={16} aria-hidden="true" /> Retour aux corrections</Link>;
  if (!exam) {
    return (
      <div className="ev-copy">
        {back}
        {error ? <Callout tone="warning" title="Copie indisponible">{error}</Callout> : <><SkeletonCard lines={2} label="Chargement de la copie…" /><SkeletonCard lines={5} /></>}
      </div>
    );
  }

  const parts = exam.definition.parts;
  const grading = exam.status === 'submitted';
  const learnerName = name.current ?? 'Élève';
  const tabs = [
    ...(exam.status === 'graded' ? [{ id: 'resultat', label: 'Résultat', icon: <Sparkles size={16} aria-hidden="true" /> }] : []),
    ...parts.map((part) => ({
      id: part.id, label: tabLabel(part, parts),
      icon: grading && part.mode !== 'closed' && partFilled(part)
        ? <Check size={16} className="ev-tab-done" aria-hidden="true" /> : <CompetenceIcon competence={part.competence} size={16} />,
    })),
    ...(grading ? [{ id: 'synthese', label: 'Synthèse', icon: <ListChecks size={16} aria-hidden="true" /> }] : []),
  ];

  return (
    <div className="ev-copy lc-enter">
      {back}
      <Card className="ev-copy-head">
        <div className="ev-copy-id">
          <Avatar name={learnerName} size={46} />
          <div>
            <p className="ev-copy-learner">{learnerName}{exam.definition.levelCode ? ` · ${exam.definition.levelCode}` : ''}</p>
            <h2 id="grading-title">{exam.definition.title} · tentative {exam.number}</h2>
          </div>
          <span className="ev-copy-status">{statusBadge({ status: exam.status, decision: exam.result?.decision ?? null })}</span>
        </div>
        <Facts items={[
          { label: 'Remise', value: exam.submittedAt ? `${shortDate.format(new Date(exam.submittedAt))} · ${timeOnly.format(new Date(exam.submittedAt))}` : '—' },
          { label: 'Délai', value: exam.onTime ? <span className="ev-ok">À temps</span> : <span className="ev-late">En retard</span> },
          { label: 'Échéance', value: exam.dueAt ? shortDate.format(new Date(exam.dueAt)) : 'Aucune' },
          { label: 'Évaluation', value: examNames[exam.kind] },
        ]} />
        {!exam.canGrade && grading && <Callout tone="info">Vous pouvez consulter cette copie ; sa correction revient à son correcteur désigné.</Callout>}
      </Card>

      <div className="ev-copy-body">
        <Tabs tabs={tabs} value={tab} onChange={setTab} label="Parties de la copie" idPrefix="grade" />
        {tab === 'resultat' && (
          <TabPanel id="resultat" idPrefix="grade">
            <ResultSummary exam={exam} action={next && next.id !== exam.id ? (
              <button type="button" className="btn btn-primary" onClick={() => navigate(`/espace/corrections/${next.id}`)}>
                Copie suivante : {next.learnerName} <ArrowRight size={16} aria-hidden="true" /></button>
            ) : undefined} />
          </TabPanel>
        )}
        {parts.map((part, index) => tab === part.id && (
          <TabPanel key={part.id} id={part.id} idPrefix="grade">
            <section className="ev-grade-part" aria-labelledby={`grade-${part.id}`}>
              <PartHeading part={part} index={index} total={parts.length} />
              {part.instructions && (
                <details className="ev-instructions-toggle">
                  <summary>Consigne donnée à l’élève</summary>
                  <LessonContent text={part.instructions} compact />
                </details>
              )}
              <div className="ev-grade-columns">
                <div className="ev-grade-copy">
                  {part.mode === 'closed' && (
                    <div className="ev-auto">
                      {exam.closedScores?.[part.id] ? (
                        <div className="ev-auto-score">
                          <ProgressRing value={exam.closedScores[part.id].percent} size={60} stroke={6}
                            label={`${exam.closedScores[part.id].points} sur ${exam.closedScores[part.id].max}`} />
                          <div><strong>{exam.closedScores[part.id].points} / {exam.closedScores[part.id].max} points</strong>
                            <small>Questions fermées corrigées automatiquement</small></div>
                        </div>
                      ) : <Callout tone="info">Les questions fermées sont corrigées automatiquement à la remise.</Callout>}
                      <ClosedAnswers part={part} exam={exam} />
                    </div>
                  )}
                  {part.mode === 'written' && (
                    <article className="ev-paper">
                      <header><PenLine size={15} aria-hidden="true" /> Copie de l’élève<span>{plural(countWords(exam.texts[part.id] ?? ''), 'mot', 'mots')}</span></header>
                      <ProductionText text={exam.texts[part.id] ?? ''} />
                    </article>
                  )}
                  {part.mode === 'oral' && (() => {
                    const recording = exam.recordings.find((entry) => entry.partId === part.id);
                    return recording?.url
                      ? <div className="ev-audio"><AudioPlayer src={recording.url} title={`Production orale · ${part.title}`} /></div>
                      : <Callout tone="warning">L’enregistrement n’est pas disponible pour le moment.</Callout>;
                  })()}
                </div>

                {part.mode !== 'closed' && grading && (
                  <fieldset className="ev-rubric" disabled={!exam.canGrade || busy}>
                    <legend>Grille de correction</legend>
                    {part.criteria.map((criterion) => (
                      <CriterionControl key={criterion.id} id={`grade-${part.id}-${criterion.id}`} name={`${part.id}:${criterion.id}`}
                        label={criterion.label} max={criterion.maxPoints} value={valueOf(part, criterion.id)} missing={missing}
                        onChange={(value) => setPoints((current) => ({ ...current, [part.id]: { ...current[part.id], [criterion.id]: value } }))} />
                    ))}
                    <div className="ev-rubric-total">
                      <span>Sous-total</span>
                      <strong>{part.criteria.reduce((sum, criterion) => sum + (valueOf(part, criterion.id) ?? 0), 0)} / {part.criteria.reduce((sum, criterion) => sum + criterion.maxPoints, 0)}</strong>
                    </div>
                    <label className="ev-rubric-comment">Commentaire
                      <textarea name={`${part.id}:comment`} rows={3} maxLength={2000} value={comments[part.id] ?? ''}
                        placeholder="Ce qui est réussi, ce qu’il faut retravailler…"
                        onChange={(event) => setComments((current) => ({ ...current, [part.id]: event.target.value }))} />
                    </label>
                  </fieldset>
                )}
                {part.mode !== 'closed' && exam.status === 'graded' && exam.result?.comments[part.id] && (
                  <div className="ev-given">
                    <strong>Commentaire laissé</strong>
                    <p>{exam.result.comments[part.id]}</p>
                  </div>
                )}
              </div>
            </section>
          </TabPanel>
        ))}
        {tab === 'synthese' && grading && (
          <TabPanel id="synthese" idPrefix="grade">
            <section className="ev-grade-part" aria-labelledby="grade-synthese">
              <header className="ev-part-head">
                <span className="ev-part-icon is-brand"><ListChecks size={20} aria-hidden="true" /></span>
                <div><p className="ev-part-kicker">Avant d’enregistrer</p><h3 id="grade-synthese">Synthèse de la correction</h3></div>
              </header>
              <ul className="kit-list ev-summary">
                {parts.map((part) => {
                  const score = part.mode === 'closed' ? exam.closedScores?.[part.id] : null;
                  const earned = part.criteria.reduce((sum, criterion) => sum + (valueOf(part, criterion.id) ?? 0), 0);
                  const max = part.criteria.reduce((sum, criterion) => sum + criterion.maxPoints, 0);
                  const done = part.mode === 'closed' || partFilled(part);
                  return (
                    <li key={part.id}>
                      <button type="button" className="kit-list-item" onClick={() => setTab(part.id)}>
                        <span className={`ev-icon-tile is-${competenceTone(part.competence)}`}><CompetenceIcon competence={part.competence} size={16} /></span>
                        <span className="kit-list-main"><strong>{part.title}</strong>
                          <small>{part.mode === 'closed' ? 'Corrigé automatiquement' : done ? 'Grille complète' : 'Grille à compléter'}</small></span>
                        <span className="kit-list-end">
                          <b className="ev-summary-points">{score ? `${score.points} / ${score.max}` : `${earned} / ${max}`}</b>
                          {done ? <Badge tone="green">Prêt</Badge> : <Badge tone="amber">À noter</Badge>}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
              <label className="ev-rubric-comment">Appréciation générale et points à travailler
                <textarea name="feedback" rows={5} maxLength={4000} value={feedback} disabled={!exam.canGrade || busy}
                  placeholder="Un message bienveillant : progrès, priorités, conseils pour la suite."
                  onChange={(event) => setFeedback(event.target.value)} />
              </label>
            </section>
          </TabPanel>
        )}
      </div>

      {grading && exam.canGrade && (
        <div className="ev-grade-bar" role="group" aria-label="Total et enregistrement">
          <ProgressRing value={totals.percent} size={50} stroke={5} label={`Total provisoire : ${totals.percent} %`}>
            <strong className="ev-bar-ring">{totals.percent}%</strong>
          </ProgressRing>
          <div className="ev-grade-bar-text">
            <strong>{totals.earned} / {totals.max} points</strong>
            <small>{totals.filled}/{totals.count} critères notés<span className="ev-provisional"> · total provisoire</span></small>
          </div>
          {error && <span className="ev-grade-error" role="alert">{error}</span>}
          <button type="button" className="btn btn-primary" onClick={() => void submit()} disabled={busy}>
            <ClipboardCheck size={17} aria-hidden="true" /> {busy ? 'Enregistrement…' : 'Enregistrer la correction'}</button>
        </div>
      )}
    </div>
  );
}

/** File des corrections et copie ouverte côte à côte (la copie remplace la file sur mobile). */
export function GradingWorkspace({ token }: { token: string }) {
  const { attemptId } = useParams();
  const [queue, setQueue] = useState<QueueItem[] | null>(null);
  const [error, setError] = useState('');
  const [reload, setReload] = useState(0);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'late'>('all');

  useEffect(() => {
    let active = true;
    requestApi<QueueItem[]>('/assessments/grading', token).then(
      (data) => { if (active) { setQueue(data); setError(''); } },
      (failure: unknown) => { if (active) setError(getError(failure)); },
    );
    return () => { active = false; };
  }, [token, reload]);

  const late = queue?.filter((item) => !item.onTime).length ?? 0;
  const shown = (queue ?? []).filter((item) => (filter === 'all' || !item.onTime)
    && `${item.learnerName} ${item.title}`.toLowerCase().includes(search.trim().toLowerCase()));
  const current = queue?.find((item) => item.id === attemptId);
  const next = queue?.find((item) => item.id !== attemptId);

  const list = (
    <Card flush className="ev-queue" title="Copies à corriger" icon={<Inbox size={18} />}
      description={queue ? `${plural(queue.length, 'copie', 'copies')}${late ? ` · ${late} en retard` : ''}` : undefined}>
      {queue && queue.length > 2 && (
        <div className="ev-queue-tools">
          <SearchField value={search} onChange={setSearch} label="Rechercher un élève" placeholder="Rechercher un élève" />
          <Segmented label="Filtrer les copies" value={filter} onChange={setFilter}
            options={[{ value: 'all', label: 'Toutes' }, { value: 'late', label: 'En retard' }]} />
        </div>
      )}
      {error ? (
        <div className="ev-queue-state"><Callout tone="warning" title="File indisponible">{error}</Callout>
          <button type="button" className="btn btn-outline btn-sm" onClick={() => setReload((value) => value + 1)}>Réessayer</button></div>
      ) : queue === null ? (
        <div className="ev-queue-state"><SkeletonCard lines={3} label="Chargement des corrections…" /></div>
      ) : queue.length === 0 ? (
        <EmptyState icon={<Check size={26} />} title="Aucune correction en attente" description="Les nouvelles remises apparaîtront ici, les plus anciennes d’abord." />
      ) : shown.length === 0 ? (
        <EmptyState title="Aucune copie ne correspond" description="Modifiez la recherche ou le filtre." />
      ) : (
        <ul className="kit-list ev-queue-list lc-stagger">
          {shown.map((item) => (
            <li key={item.id}>
              <Link className="kit-list-item" to={`/espace/corrections/${item.id}`} aria-current={item.id === attemptId ? 'true' : undefined}
                aria-label={`Corriger ${item.title} de ${item.learnerName}`}>
                <Avatar name={item.learnerName} size={40} />
                <span className="kit-list-main">
                  <strong>{item.learnerName}</strong>
                  <small>{item.levelCode ? `${item.levelCode} · ` : ''}{examNames[item.kind]} · tentative {item.number}</small>
                  <small className="ev-queue-when">Remise {fromNow(item.submittedAt)}</small>
                </span>
                <span className="kit-list-end">{item.onTime ? <Badge tone="green">Dans les délais</Badge> : <Badge tone="amber">En retard</Badge>}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );

  const detail = attemptId
    ? <GradingCopy key={attemptId} token={token} attemptId={attemptId} item={current} next={next} onGraded={() => setReload((value) => value + 1)} />
    : (
      <div className="ev-split-empty">
        <EmptyState icon={<ClipboardCheck size={26} />} title="Choisissez une copie"
          description="La copie s’affiche ici avec la production de l’élève et la grille de correction." />
      </div>
    );

  return <div className="ev-grading"><SplitView list={list} detail={detail} hasDetail={Boolean(attemptId)} /></div>;
}
