/**
 * Missions (V4) : tâche de communication réelle, faite et remise dans l'application. L'élève lit la situation, enregistre
 * sa réponse orale (5 minutes au plus), rédige son texte (3 000 caractères au plus, avec les lettres allemandes), coche
 * sa liste d'auto-vérification, puis envoie la mission à son professeur (ou à son correcteur). Il voit ensuite le statut
 * (envoyée, validée, à reprendre), le retour du professeur, et peut reprendre la mission. Les mêmes blocs de lecture
 * servent à la fiche élève et aux résultats (`MissionWork`, `MissionDetailDrawer`).
 *
 * Niveaux B : la mission a une grille de critères (20 points). L'élève la voit avant la remise (« Comment votre production
 * sera évaluée ») ; après le retour, il voit ses points par critère, son score, la décision et le commentaire, avec la
 * légende des codes de correction. Sans correcteur (mission `sent`), la grille lui sert d'auto-évaluation, non
 * enregistrée. Consignes, liste de vérification et critères sont bilingues (bilingual.tsx).
 */
import { useCallback, useEffect, useId, useMemo, useRef, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle, ArrowRight, Check, CheckCircle2, Circle, CloudCheck, Target, GraduationCap, Hourglass, ListChecks, LoaderCircle, Mic,
  PenLine, RotateCcw, Scale, Send, Sparkles,
} from 'lucide-react';
import { Badge, type BadgeTone } from '../../components/ui';
import { AudioPlayer, Callout, Drawer, Facts, ProgressRing, Segmented, SkeletonCard, Timeline, useToast, type TimelineEntry } from '../../design/kit';
import { requestApi } from '../../integration/api';
import {
  correctionCodes, countWords, missionCriteriaOf, missionLimits, missionMaxScore, missionPassPercent, missionScore, type MissionCriterion,
  type MissionDefinition, type MissionStartRequest, type MissionStatus, type MissionSummary, type MissionUpdateRequest, type MissionView,
  type UploadReservation,
} from '../../integration/v4';
import { BilingualText, FrenchHelpSwitch, GlossNote, glossUnits, hasFoldedHelp, hasGloss, type GlossMode } from './bilingual';
import { LessonContent } from './LessonContent';
import type { Placement } from './LearnerSession';
import { MediaSequence } from './study-media';
import { AudioCapture } from './study-recorder';
import { GermanKeys } from './german-keys';
import './study-mission.css';

/**
 * Remises de missions (GET /assessments/missions, récentes d'abord) : celles de l'élève connecté, ou d'un élève suivi
 * (`learnerId`). `null` pendant le chargement ; liste vide si le service ne les connaît pas encore.
 */
export function useMissions(token: string | null | undefined, learnerId?: string) {
  const [missions, setMissions] = useState<MissionSummary[] | null>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    if (!token) return;
    let active = true;
    const request = learnerId
      ? requestApi<MissionSummary[]>(`/assessments/missions?learnerId=${encodeURIComponent(learnerId)}`, token)
      : requestApi<MissionSummary[]>('/assessments/missions', token);
    request.then(
      (list) => { if (active) { setMissions(Array.isArray(list) ? list : []); setError(''); } },
      (failure: unknown) => { if (active) { setMissions([]); setError(errorText(failure)); } },
    );
    return () => { active = false; };
  }, [token, learnerId]);
  return { missions, error };
}

/** Libellé et icône du type d'activité `mission` (sommaire de séance, bibliothèque, planning). */
export const missionKind = { label: 'Mission', icon: Target };

/** Activité telle que la reçoit l'écran : détail de séance (`contentVersionId`…) ou activité de bibliothèque (`trackVersionId`). */
export interface MissionActivityInput {
  id: string;
  title: string;
  status?: 'todo' | 'started' | 'completed';
  lesson: { id?: string; title?: string; description: string } | null;
  mission?: MissionDefinition | null;
  placements?: Placement[];
  contentVersionId?: string | null;
  contentActivityId?: string | null;
  trackVersionId?: string | null;
}

const dayTime = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });
const thousands = new Intl.NumberFormat('fr-FR');

function errorText(error: unknown) {
  return error instanceof Error && error.name !== 'TimeoutError' && error.message ? error.message : 'Le service est momentanément indisponible. Réessayez.';
}
const plural = (count: number, one: string, many = `${one}s`) => `${count} ${count > 1 ? many : one}`;
const clock = (seconds: number) => (seconds % 60 ? `${Math.floor(seconds / 60)} min ${seconds % 60} s` : `${seconds / 60} min`);
const duration = (seconds: number) => (seconds < 60 ? `${seconds} s` : clock(seconds));

/** Statut lisible d'une remise, côté élève ou côté équipe. */
export function missionState(mission: { status: MissionStatus; decision?: string | null; review?: MissionView['review'] }, viewer: 'learner' | 'staff' = 'learner'):
  { label: string; tone: BadgeTone } {
  const decision = mission.review?.decision ?? mission.decision ?? null;
  if (mission.status === 'reviewed') return decision === 'to_redo' ? { label: 'À reprendre', tone: 'amber' } : { label: 'Validée', tone: 'green' };
  if (mission.status === 'submitted') return viewer === 'staff' ? { label: 'À corriger', tone: 'amber' } : { label: 'Envoyée', tone: 'blue' };
  if (mission.status === 'sent') return viewer === 'staff' ? { label: 'Envoyée sans correcteur', tone: 'neutral' } : { label: 'Envoyée', tone: 'blue' };
  return viewer === 'staff' ? { label: 'Brouillon de l’élève', tone: 'neutral' } : { label: 'Brouillon', tone: 'neutral' };
}

export function MissionBadge({ mission, viewer = 'learner' }: { mission: Parameters<typeof missionState>[0]; viewer?: 'learner' | 'staff' }) {
  const state = missionState(mission, viewer);
  return <Badge tone={state.tone}>{state.label}</Badge>;
}

/** Repères de la mission : parties demandées et liste de vérification. */
function MissionChips({ definition }: { definition: MissionDefinition }) {
  const criteria = missionCriteriaOf(definition);
  return (
    <ul className="ms-chips" aria-label="Ce que demande la mission">
      {definition.oral && <li><Mic size={14} aria-hidden="true" /> Oral · {duration(definition.oral.maxSeconds)} au plus</li>}
      {definition.written && <li><PenLine size={14} aria-hidden="true" /> Écrit{definition.written.minWords ? ` · ${definition.written.minWords} mots au moins` : ''}</li>}
      <li><ListChecks size={14} aria-hidden="true" /> {plural(definition.checklist.length, 'point', 'points')} à vérifier</li>
      {criteria.length > 0 && <li><Scale size={14} aria-hidden="true" /> Grille sur {missionMaxScore(criteria)} points</li>}
    </ul>
  );
}

// ---------------------------------------------------------------------------------------------------------------------
// Grille de critères (niveaux B) : avant la remise, après le retour, en auto-évaluation
// ---------------------------------------------------------------------------------------------------------------------

/** Libellé d'un critère : nom (« Tâche »), précision (« tous les points sont traités… ») et traduction éventuelle. */
export function criterionParts(label: string): { name: string; detail: string; fr: string | null; mode: GlossMode } {
  const unit = hasGloss(label) ? glossUnits(label)[0] : null;
  const main = unit ? unit.de.join(' ') : label;
  const match = main.match(/^(.{2,60}?)\s?:\s+(.+)$/s);
  const detail = match ? match[2].trim() : '';
  return {
    name: (match ? match[1] : main).trim(), detail: detail.charAt(0).toLocaleUpperCase('fr') + detail.slice(1),
    fr: unit?.fr ?? null, mode: unit?.mode ?? 'beside',
  };
}

/** Nom, précision et traduction d'un critère. */
export function CriterionLabel({ label }: { label: string }) {
  const parts = criterionParts(label);
  const lang = parts.fr ? 'de' : undefined;
  return (
    <span className="ms-crit-label">
      <strong lang={lang}>{parts.name}</strong>
      {parts.detail && <span className="ms-crit-detail" lang={lang}>{parts.detail}</span>}
      {parts.fr && <GlossNote fr={parts.fr} mode={parts.mode} />}
    </span>
  );
}

const points = (count: number) => `${count} pt${count > 1 ? 's' : ''}`;
/** Score minimal pour la présélection « validée » (12 sur 20). */
export const passScore = (maxScore: number) => Math.ceil((maxScore * missionPassPercent) / 100);

/** Grille vue par l'élève avant la remise : « Comment votre production sera évaluée ». */
export function MissionGrid({ criteria, autonomous = false }: { criteria: readonly MissionCriterion[]; autonomous?: boolean }) {
  const max = missionMaxScore(criteria);
  const titleId = useId();
  return (
    <section className="ms-grid" aria-labelledby={titleId}>
      <header className="ms-grid-head">
        <span className="ms-grid-icon" aria-hidden="true"><Scale size={18} /></span>
        <div>
          <h3 id={titleId}>Comment votre production sera évaluée</h3>
          <p>{plural(criteria.length, 'critère')} · {max} points</p>
        </div>
      </header>
      <ol className="ms-rubric is-plan">
        {criteria.map((criterion) => (
          <li key={criterion.id} className="ms-crit">
            <CriterionLabel label={criterion.label} />
            <span className="ms-crit-max">{points(criterion.maxPoints)}</span>
          </li>
        ))}
      </ol>
      <p className="ms-grid-note">
        {autonomous
          ? 'Si aucun correcteur ne suit vos missions, vous vous évaluerez vous-même avec cette grille après l’envoi.'
          : `Votre professeur note chaque critère et vous écrit un retour. Repère : ${passScore(max)}/${max} (${missionPassPercent} %) pour valider la mission ; la décision lui revient.`}
      </p>
    </section>
  );
}

/** Points par critère et score après le retour du correcteur. */
export function MissionResult({ criteria, points: given, score, maxScore, decision }: {
  criteria: readonly MissionCriterion[]; points: Record<string, number>; score: number; maxScore: number; decision?: string | null;
}) {
  const percent = maxScore ? Math.round((score / maxScore) * 100) : 0;
  const tone = percent >= missionPassPercent ? 'success' : 'warning';
  return (
    <section className={`ms-result is-${tone}`} aria-label="Points par critère">
      <div className="ms-result-total">
        <ProgressRing value={percent} size={78} stroke={7} color={`var(--${tone})`} label={`Score : ${score} sur ${maxScore}`}>
          <strong className="ms-result-score">{score}<small>/{maxScore}</small></strong>
        </ProgressRing>
        <div className="ms-result-text">
          <p className="ms-result-kicker">Score sur la grille</p>
          <p className="ms-result-line"><b>{score} / {maxScore}</b> points · {percent} %</p>
          {decision && <Badge tone={decision === 'to_redo' ? 'amber' : 'green'}>{decision === 'to_redo' ? 'À reprendre' : 'Validée'}</Badge>}
        </div>
      </div>
      <ol className="ms-rubric is-result">
        {criteria.map((criterion) => {
          const value = given[criterion.id] ?? 0;
          const ratio = criterion.maxPoints ? value / criterion.maxPoints : 0;
          return (
            <li key={criterion.id} className={`ms-crit${ratio < missionPassPercent / 100 ? ' is-low' : ''}`}>
              <CriterionLabel label={criterion.label} />
              <span className="ms-crit-score">
                <span className="ms-crit-bar" aria-hidden="true"><i style={{ ['--v' as string]: `${Math.max(4, ratio * 100)}%` }} /></span>
                <span className="ms-crit-value"><b>{value}</b>/{criterion.maxPoints}<span className="sr-only"> points</span></span>
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

/**
 * Auto-évaluation sur la grille, pour l'élève sans correcteur (mission `sent`) : rien n'est enregistré, le total se
 * calcule en direct. Elle s'accompagne de la recommandation d'un correcteur pour les niveaux B.
 */
export function SelfAssessment({ criteria, missionId }: { criteria: readonly MissionCriterion[]; missionId: string }) {
  const [given, setGiven] = useState<Record<string, number>>({});
  const max = missionMaxScore(criteria);
  const score = missionScore(criteria, given);
  const filled = criteria.filter((criterion) => given[criterion.id] !== undefined).length;
  const total = criteria.reduce((sum, criterion) => sum + (given[criterion.id] ?? 0), 0);
  const weakest = score === null ? null : [...criteria].sort((a, b) => (given[a.id] ?? 0) / a.maxPoints - (given[b.id] ?? 0) / b.maxPoints)[0];
  return (
    <section className="ms-self" aria-labelledby={`ms-self-${missionId}`}>
      <header className="ms-grid-head">
        <span className="ms-grid-icon is-self" aria-hidden="true"><Scale size={18} /></span>
        <div>
          <h4 id={`ms-self-${missionId}`}>Évaluez-vous avec la grille</h4>
          <p>Pour vous seul : cette auto-évaluation n’est pas enregistrée.</p>
        </div>
      </header>
      <ol className="ms-rubric is-self">
        {criteria.map((criterion) => (
          <li key={criterion.id} className="ms-crit">
            <CriterionLabel label={criterion.label} />
            <fieldset className="ms-self-scale">
              <legend className="sr-only">{criterionParts(criterion.label).name} : vos points sur {criterion.maxPoints}</legend>
              {Array.from({ length: criterion.maxPoints + 1 }, (_, value) => (
                <label key={value} className={`ms-self-pill${given[criterion.id] === value ? ' is-checked' : ''}`}>
                  <input type="radio" name={`ms-self-${missionId}-${criterion.id}`} value={value} checked={given[criterion.id] === value}
                    onChange={() => setGiven((current) => ({ ...current, [criterion.id]: value }))} />
                  <span>{value}</span>
                </label>
              ))}
            </fieldset>
          </li>
        ))}
      </ol>
      <div className={`ms-self-total${score !== null ? (score >= passScore(max) ? ' is-pass' : ' is-low') : ''}`} role="status">
        <span className="ms-self-sum"><b>{filled ? total : '–'}</b>/{max}</span>
        <span>
          {score === null
            ? `${filled}/${criteria.length} critères évalués : notez chaque critère pour obtenir votre total.`
            : score >= passScore(max)
              ? `Selon votre grille, la tâche est réussie (${passScore(max)}/${max} au moins).${weakest ? ` Point à soigner : ${criterionParts(weakest.label).name.toLowerCase()}.` : ''}`
              : `Selon votre grille, la mission est à reprendre${weakest ? ` : travaillez d’abord ${criterionParts(weakest.label).name.toLowerCase()}` : ''}, puis refaites-la.`}
        </span>
      </div>
      <Callout tone="tip" title="Un correcteur pour les niveaux B">
        Aux niveaux B, un professeur ou un correcteur vous fait progresser plus vite : il note chaque critère et vous dit quoi
        retravailler. Demandez à être suivi pour vos prochaines missions.
      </Callout>
    </section>
  );
}

/** Légende des codes de correction de l'écrit, la même pour le correcteur et pour l'élève. */
export function CorrectionCodes({ title = 'Codes de correction' }: { title?: string }) {
  return (
    <div className="ms-codes">
      <p className="ms-codes-title">{title}</p>
      <ul className="ms-codes-list">
        {correctionCodes.map((entry) => <li key={entry.code}><b>{entry.code}</b><span>{entry.label}</span></li>)}
      </ul>
    </div>
  );
}

/** Score d'une remise notée sur grille (« 14/20 »), coloré selon le seuil de 60 %. */
export function MissionScoreTag({ mission }: { mission: Pick<MissionSummary, 'score' | 'maxScore'> }) {
  if (mission.score === null || !mission.maxScore) return null;
  const pass = mission.score >= passScore(mission.maxScore);
  return (
    <span className={`ms-score-tag${pass ? ' is-pass' : ' is-low'}`} title="Score sur la grille">
      {mission.score}<small>/{mission.maxScore}</small><span className="sr-only"> points sur la grille</span>
    </span>
  );
}

/** Remises notées sur grille relues une fois (leurs points ne changent plus après le retour). */
const scoredViews = new Map<string, MissionView>();

/**
 * Points par critère des missions notées sur grille : GET /assessments/missions/{id} pour chaque remise de la liste
 * qui a un score. `null` pendant la lecture.
 */
export function useScoredMissions(token: string | null | undefined, missions: MissionSummary[] | null) {
  const key = (missions ?? []).filter((mission) => mission.score !== null && mission.maxScore).map((mission) => mission.id).join(',');
  const [views, setViews] = useState<MissionView[] | null>(null);
  useEffect(() => {
    if (!token || !key) { setViews([]); return; }
    let active = true;
    Promise.all(key.split(',').map((id) => {
      const known = scoredViews.get(id);
      if (known) return Promise.resolve(known);
      return requestApi<MissionView>(`/assessments/missions/${encodeURIComponent(id)}`, token)
        .then((view) => { scoredViews.set(id, view); return view; }, () => null);
    })).then((list) => { if (active) setViews(list.filter((view): view is MissionView => Boolean(view?.review?.points))); });
    return () => { active = false; };
  }, [token, key]);
  return views;
}

interface CriterionAverage { id: string; name: string; earned: number; max: number; percent: number; count: number }
interface LevelAverages { level: string; missions: number; score: number; maxScore: number; latest: number; criteria: CriterionAverage[] }

/** Moyenne par critère et par niveau (en pourcentage des points possibles : l'écrit compte sur 5, l'oral sur 4). */
function averagesByLevel(views: MissionView[]): LevelAverages[] {
  const levels = new Map<string, LevelAverages & { byId: Map<string, CriterionAverage> }>();
  for (const view of views) {
    const review = view.review;
    if (!review?.points) continue;
    const entry = levels.get(view.levelCode) ?? { level: view.levelCode, missions: 0, score: 0, maxScore: 0, latest: 0, criteria: [], byId: new Map() };
    entry.missions += 1;
    entry.score += review.score ?? 0;
    entry.maxScore += review.maxScore ?? 0;
    entry.latest = Math.max(entry.latest, new Date(review.reviewedAt).getTime());
    for (const criterion of missionCriteriaOf(view.definition)) {
      const value = review.points[criterion.id];
      if (typeof value !== 'number') continue;
      const average = entry.byId.get(criterion.id) ?? { id: criterion.id, name: criterionParts(criterion.label).name, earned: 0, max: 0, percent: 0, count: 0 };
      average.earned += value;
      average.max += criterion.maxPoints;
      average.count += 1;
      entry.byId.set(criterion.id, average);
    }
    levels.set(view.levelCode, entry);
  }
  return [...levels.values()].map(({ byId, ...level }) => ({
    ...level,
    criteria: [...byId.values()].map((average) => ({ ...average, percent: average.max ? Math.round((average.earned / average.max) * 100) : 0 })),
  })).sort((a, b) => b.latest - a.latest);
}

const decimal = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 });

/**
 * Moyenne par critère des missions notées sur grille, niveau par niveau : repère une faiblesse durable (la cohérence,
 * par exemple). Rien ne s'affiche tant qu'aucune mission n'est notée sur grille.
 */
export function MissionCriteriaAverages({ views, viewer = 'staff' }: { views: MissionView[] | null; viewer?: 'learner' | 'staff' }) {
  const levels = useMemo(() => averagesByLevel(views ?? []), [views]);
  const [chosen, setChosen] = useState<string | null>(null);
  const current = levels.find((level) => level.level === chosen) ?? levels[0];
  if (!current) return null;
  const ordered = current.criteria;
  const weakest = ordered.reduce<CriterionAverage | null>((low, item) => (!low || item.percent < low.percent ? item : low), null);
  const strongest = ordered.reduce<CriterionAverage | null>((high, item) => (!high || item.percent > high.percent ? item : high), null);
  const average = current.maxScore ? (current.score / current.maxScore) * 20 : 0;
  return (
    <section className="ms-avg" aria-label={viewer === 'learner' ? 'Mes critères sur la grille' : 'Moyenne par critère'}>
      <header className="ms-avg-head">
        <span className="ms-grid-icon" aria-hidden="true"><Scale size={18} /></span>
        <div>
          <h3>{viewer === 'learner' ? 'Mes critères sur la grille' : 'Moyenne par critère'}</h3>
          <p>{plural(current.missions, 'mission notée', 'missions notées')} · score moyen {decimal.format(average)}/20</p>
        </div>
        {levels.length > 1 && (
          <Segmented label="Niveau" value={current.level} onChange={setChosen}
            options={levels.map((level) => ({ value: level.level, label: level.level }))} />
        )}
      </header>
      <ul className="ms-avg-list">
        {ordered.map((item) => {
          const low = item.percent < missionPassPercent;
          const isWeakest = weakest?.id === item.id && low && ordered.length > 1;
          const isStrongest = strongest?.id === item.id && item.percent >= 75 && ordered.length > 1;
          return (
            <li key={item.id} className={`ms-avg-row${low ? ' is-low' : ''}`}>
              <span className="ms-avg-name">
                <strong>{item.name}</strong>
                {isWeakest && <Badge tone="amber">{viewer === 'learner' ? 'À travailler' : 'Point faible'}</Badge>}
                {isStrongest && <Badge tone="green">Point fort</Badge>}
              </span>
              <span className="ms-avg-meter" aria-hidden="true"><i style={{ ['--v' as string]: `${Math.max(3, item.percent)}%` }} /><b style={{ ['--t' as string]: `${missionPassPercent}%` }} /></span>
              <span className="ms-avg-value"><b>{item.percent} %</b>{item.count !== current.missions && <small>{plural(item.count, 'mission')}</small>}</span>
            </li>
          );
        })}
      </ul>
      <p className="ms-avg-note">Points obtenus sur les points possibles, toutes missions de {current.level} notées sur grille ; repère à {missionPassPercent} %.</p>
    </section>
  );
}

/** Ce que l'élève a remis : enregistrement, texte et liste cochée (lecture seule). */
export function MissionWork({ mission, viewer = 'learner' }: { mission: MissionView; viewer?: 'learner' | 'staff' }) {
  const { definition } = mission;
  const words = countWords(mission.text);
  const mine = viewer === 'learner';
  return (
    <div className="ms-work">
      {definition.oral && (
        <section className="ms-work-part" aria-label="Production orale">
          <header><span className="ms-part-icon is-oral" aria-hidden="true"><Mic size={16} /></span><h4>{mine ? 'Mon enregistrement' : 'Production orale'}</h4></header>
          {definition.oral.prompt && <p className="ms-work-prompt"><BilingualText text={definition.oral.prompt} /></p>}
          {mission.recording?.url
            ? <div className="ms-audio"><AudioPlayer src={mission.recording.url} title={mine ? 'Mon enregistrement' : 'Enregistrement de l’élève'} /></div>
            : <p className="ms-work-empty">{mission.recording ? 'Enregistrement reçu : son adresse d’écoute a expiré, rouvrez la page.' : 'Aucun enregistrement.'}</p>}
        </section>
      )}
      {definition.written && (
        <section className="ms-work-part" aria-label="Production écrite">
          <header>
            <span className="ms-part-icon is-written" aria-hidden="true"><PenLine size={16} /></span><h4>{mine ? 'Mon texte' : 'Production écrite'}</h4>
            <span className="ms-work-count">{plural(words, 'mot')} · {thousands.format(mission.text.length)} caractères</span>
          </header>
          {definition.written.prompt && <p className="ms-work-prompt"><BilingualText text={definition.written.prompt} /></p>}
          <div className="ms-paper" lang="de">
            {mission.text.trim()
              ? mission.text.replace(/\r/g, '').split('\n').map((line, index) => (line.trim() ? <p key={index}>{line}</p> : <span key={index} className="ms-paper-gap" />))
              : <p className="ms-work-empty">Aucun texte.</p>}
          </div>
          {definition.written.minWords > 0 && words < definition.written.minWords && (
            <p className="ms-work-warn"><AlertTriangle size={14} aria-hidden="true" /> Moins de {definition.written.minWords} mots demandés.</p>
          )}
        </section>
      )}
      <section className="ms-work-part" aria-label="Liste de vérification">
        <header><span className="ms-part-icon is-check" aria-hidden="true"><ListChecks size={16} /></span><h4>{mine ? 'Ma vérification' : 'Auto-vérification de l’élève'}</h4>
          <span className="ms-work-count">{mission.checklist.length}/{definition.checklist.length}</span></header>
        <ul className="ms-checked">
          {definition.checklist.map((item, index) => {
            const done = mission.checklist.includes(index);
            return (
              <li key={index} className={done ? 'is-done' : undefined}>
                {done ? <CheckCircle2 size={17} aria-hidden="true" /> : <Circle size={17} aria-hidden="true" />}
                <span><BilingualText text={item} /></span><span className="sr-only">{done ? ' : coché' : ' : non coché'}</span>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}

/** Pastille du professeur (son nom n'est pas transmis à l'élève). */
function TeacherMark() {
  return <span className="ms-teacher" aria-hidden="true"><GraduationCap size={20} /></span>;
}

/** Intertitres du modèle de commentaire (« Points forts », « À retravailler », « Relance »), mis en valeur dans le retour. */
const COMMENT_HEADS = /^(Points forts|À retravailler|Relance|Stärken|Zu überarbeiten|Weiterdenken)(\s*\([^)]*\))?\s*:\s*/;

function CommentText({ text }: { text: string }) {
  if (!text.split('\n').some((line) => COMMENT_HEADS.test(line))) return <>{text}</>;
  return (
    <>
      {text.split('\n').map((line, index) => {
        const head = line.match(COMMENT_HEADS);
        return (
          <span key={index} className={`ms-comment-line${head ? ' has-head' : ''}`}>
            {head ? <><strong>{head[1]}</strong>{line.slice(head[0].length)}</> : line}
          </span>
        );
      })}
    </>
  );
}

/** Retour du professeur ou du correcteur. */
export function MissionFeedback({ mission, viewer = 'learner', decision = false }: {
  mission: MissionView; viewer?: 'learner' | 'staff';
  /** Rappeler la décision à côté du score (panneau de détail, où le statut n'est pas déjà affiché en grand). */
  decision?: boolean;
}) {
  const review = mission.review;
  if (!review) return null;
  const redo = review.decision === 'to_redo';
  const who = viewer === 'staff' ? 'Retour envoyé à l’élève' : mission.reviewerKind === 'reviewer' ? 'Retour de votre correcteur' : 'Retour de votre professeur';
  const criteria = missionCriteriaOf(mission.definition);
  const scored = criteria.length > 0 && review.points && review.score !== null && review.maxScore;
  const bubble = (
    <figure className={`ms-feedback${redo ? ' is-redo' : ' is-validated'}`}>
      <TeacherMark />
      <div className="ms-feedback-bubble">
        <figcaption><strong>{who}</strong><time dateTime={review.reviewedAt}>{dayTime.format(new Date(review.reviewedAt))}</time></figcaption>
        {review.comment ? <blockquote><CommentText text={review.comment} /></blockquote> : <p className="ms-work-empty">Sans commentaire.</p>}
      </div>
    </figure>
  );
  if (!criteria.length) return bubble;
  return (
    <div className="ms-review">
      {scored && <MissionResult criteria={criteria} points={review.points ?? {}} score={review.score ?? 0} maxScore={review.maxScore ?? 0}
        decision={decision ? review.decision : null} />}
      {bubble}
      <CorrectionCodes title={viewer === 'staff' ? 'Codes de correction' : 'Codes utilisés dans le retour'} />
    </div>
  );
}

type SaveStatus = 'idle' | 'pending' | 'saving' | 'saved' | 'error';

function SaveIndicator({ status, at }: { status: SaveStatus; at: Date | null }) {
  const busy = status === 'pending' || status === 'saving';
  const Icon = busy ? LoaderCircle : status === 'error' ? AlertTriangle : CloudCheck;
  const text = busy ? 'Enregistrement…' : status === 'error' ? 'Brouillon non enregistré' : status === 'saved' && at
    ? `Brouillon enregistré à ${at.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}` : 'Brouillon enregistré automatiquement';
  return <span className={`ms-save is-${status}`} role="status"><Icon size={14} aria-hidden="true" />{text}</span>;
}

/** Bandeau de statut d'une mission remise : envoyée, validée ou à reprendre, avec les étapes et la reprise. */
function MissionStatusPanel({ mission, busy, onRestart, preview }: { mission: MissionView; busy: boolean; onRestart: () => void; preview: boolean }) {
  const recipient = mission.reviewerKind === 'reviewer' ? 'votre correcteur' : 'votre professeur';
  const criteria = missionCriteriaOf(mission.definition);
  const redo = mission.status === 'reviewed' && mission.review?.decision === 'to_redo';
  const validated = mission.status === 'reviewed' && !redo;
  const content = validated
    ? { tone: 'is-validated', icon: <Sparkles size={24} />, title: 'Mission validée, bravo !', text: `${recipient === 'votre correcteur' ? 'Votre correcteur' : 'Votre professeur'} a validé votre travail. Relisez son retour pour garder ce qui a marché.` }
    : redo
      ? { tone: 'is-redo', icon: <RotateCcw size={24} />, title: 'Mission à reprendre', text: 'Lisez le retour, puis reprenez la mission : votre texte précédent est repris dans le nouveau brouillon.' }
      : mission.status === 'sent'
        ? { tone: 'is-sent', icon: <CheckCircle2 size={24} />, title: 'Mission enregistrée', text: criteria.length
          ? 'Vous apprenez en autonomie : aucun professeur ne corrige cette mission. Évaluez-vous avec la grille ci-dessous, puis refaites-la quand vous voulez.'
          : 'Vous apprenez en autonomie : aucun professeur ne corrige cette mission. Relisez-vous avec la liste de vérification, et refaites-la quand vous voulez.' }
        : { tone: 'is-submitted', icon: <Send size={22} />, title: `Mission envoyée à ${recipient}`, text: `${recipient === 'votre correcteur' ? 'Votre correcteur' : 'Votre professeur'} vous répondra ici. En attendant, continuez votre séance.` };
  const steps: TimelineEntry[] = [
    { id: 'draft', title: 'Mission préparée', meta: dayTime.format(new Date(mission.createdAt)), tone: 'success', icon: <Check size={14} /> },
    { id: 'sent', title: mission.status === 'sent' ? 'Mission enregistrée' : `Envoyée à ${recipient}`, meta: mission.submittedAt ? dayTime.format(new Date(mission.submittedAt)) : undefined, tone: 'success', icon: <Check size={14} /> },
  ];
  if (mission.status !== 'sent') {
    steps.push(mission.review
      ? { id: 'review', title: redo ? 'Retour : à reprendre' : 'Retour : mission validée', meta: dayTime.format(new Date(mission.review.reviewedAt)), tone: redo ? 'warning' : 'success', icon: redo ? <RotateCcw size={14} /> : <Check size={14} /> }
      : { id: 'review', title: `Retour de ${recipient}`, meta: 'Il s’affichera ici', tone: 'brand', icon: <Hourglass size={14} /> });
  }
  return (
    <section className={`ms-status ${content.tone}`} aria-labelledby={`ms-status-${mission.id}`}>
      <div className="ms-status-head">
        <span className="ms-status-icon" aria-hidden="true">{content.icon}</span>
        <div>
          <div className="ms-status-tags"><MissionBadge mission={mission} />{mission.number > 1 && <Badge tone="neutral">Tentative {mission.number}</Badge>}</div>
          <h3 id={`ms-status-${mission.id}`} tabIndex={-1} data-mission-focus>{content.title}</h3>
          <p>{content.text}</p>
        </div>
      </div>
      <MissionFeedback mission={mission} />
      {mission.status === 'sent' && criteria.length > 0 && <SelfAssessment criteria={criteria} missionId={mission.id} />}
      <Timeline items={steps} />
      {(redo || mission.status === 'sent') && !preview && (
        <div className="ms-status-actions">
          <button type="button" className={`btn ${redo ? 'btn-primary' : 'btn-outline'}`} onClick={onRestart} disabled={busy}>
            {busy ? <LoaderCircle size={17} className="ms-spin" aria-hidden="true" /> : <RotateCcw size={17} aria-hidden="true" />}
            {redo ? 'Reprendre la mission' : 'Refaire la mission'}
          </button>
        </div>
      )}
    </section>
  );
}

/** Brouillon local de l'aperçu de l'éditeur (aucun appel au service). */
function previewMission(activity: MissionActivityInput, definition: MissionDefinition): MissionView {
  const now = new Date().toISOString();
  return {
    id: 'apercu', learnerId: 'apercu', trackVersionId: activity.trackVersionId ?? activity.contentVersionId ?? 'apercu', levelCode: 'A1',
    moduleId: '', activityId: activity.contentActivityId ?? activity.id, sessionId: null, sessionActivityId: null, number: 1, title: activity.title,
    definition: { ...definition, description: activity.lesson?.description ?? '' }, status: 'draft', text: '', checklist: [], recording: null,
    reviewerKind: null, submittedAt: null, review: null, canReview: false, createdAt: now, updatedAt: now,
  };
}

/**
 * Activité « mission » d'une séance, de la bibliothèque ou de l'aperçu de l'éditeur. Ouvre (ou reprend) la remise de ce
 * contexte, enregistre le brouillon au fil de la saisie, puis l'envoie ; `onSubmitted` permet à la séance de terminer
 * l'activité avec l'identifiant de la remise.
 */
export function MissionActivity({ activity, token, sessionId, preview = false, onSubmitted, onRenew }: {
  activity: MissionActivityInput;
  token: string;
  sessionId?: string;
  preview?: boolean;
  onSubmitted: (mission: MissionView) => void | Promise<void>;
  /** Renouvelle les adresses des supports (cinq minutes). */
  onRenew?: () => void;
}) {
  const toast = useToast();
  const definition = activity.mission ?? null;
  const versionId = activity.contentVersionId ?? activity.trackVersionId ?? null;
  const contentActivityId = activity.contentActivityId ?? activity.id;
  const [mission, setMission] = useState<MissionView | null>(() => (preview && definition ? previewMission(activity, definition) : null));
  const [text, setText] = useState(mission?.text ?? '');
  const [checked, setChecked] = useState<number[]>(mission?.checklist ?? []);
  const [loadError, setLoadError] = useState('');
  const [actionError, setActionError] = useState('');
  const [busy, setBusy] = useState<'' | 'submit' | 'restart'>('');
  const [attempt, setAttempt] = useState(0);
  const [save, setSave] = useState<{ status: SaveStatus; at: Date | null }>({ status: 'idle', at: null });
  const [showMissing, setShowMissing] = useState(false);
  const [hasTeacher, setHasTeacher] = useState<boolean | null>(null);
  const pending = useRef<MissionUpdateRequest | null>(null);
  const timer = useRef<number | undefined>(undefined);
  const submitKey = useRef<string | null>(null);
  const area = useRef<HTMLTextAreaElement>(null);
  const synced = useRef(false);
  const root = useRef<HTMLDivElement>(null);
  const current = useRef<MissionView | null>(mission);
  current.current = mission;
  const missionId = mission?.id ?? '';
  const hasDefinition = Boolean(definition);

  const adopt = useCallback((view: MissionView) => {
    setMission(view);
    setText(view.text);
    setChecked(view.checklist);
    pending.current = null;
    submitKey.current = null;
  }, []);

  // Ouverture : brouillon en cours, nouveau brouillon ou dernière remise de ce contexte (séance ou bibliothèque).
  useEffect(() => {
    if (preview || !hasDefinition) return;
    if (!versionId) { setLoadError('Cette mission n’est pas encore rattachée à une version du parcours.'); return; }
    let active = true;
    setLoadError('');
    const body: MissionStartRequest = sessionId
      ? { trackVersionId: versionId, activityId: contentActivityId, sessionId, sessionActivityId: activity.id }
      : { trackVersionId: versionId, activityId: contentActivityId };
    requestApi<MissionView>('/assessments/missions', token, { method: 'POST', body }).then(
      (view) => {
        if (!active) return;
        // Même brouillon, saisie en cours d'enregistrement : la saisie locale est gardée.
        const shown = current.current;
        if (shown && shown.id === view.id && view.status === 'draft' && pending.current) {
          setMission({ ...view, text: shown.text, checklist: shown.checklist });
        } else adopt(view);
      },
      (failure: unknown) => { if (active) setLoadError(errorText(failure)); },
    );
    return () => { active = false; };
  }, [preview, hasDefinition, versionId, contentActivityId, sessionId, activity.id, token, attempt, adopt]);

  // Libellé du bouton d'envoi : « Envoyer à mon professeur » si l'élève est suivi.
  useEffect(() => {
    if (preview) return;
    let active = true;
    requestApi<{ teacherId?: string | null }>('/me', token).then(
      (profile) => { if (active) setHasTeacher(Boolean(profile.teacherId)); },
      () => { if (active) setHasTeacher(false); },
    );
    return () => { active = false; };
  }, [preview, token]);

  // Mission déjà remise mais activité de séance non terminée (coupure pendant l'envoi) : la séance est remise à jour.
  useEffect(() => {
    if (preview || synced.current || !mission || mission.status === 'draft' || activity.status === 'completed' || !sessionId) return;
    synced.current = true;
    void Promise.resolve(onSubmitted(mission)).catch(() => undefined);
  }, [preview, mission, activity.status, sessionId, onSubmitted]);

  const flush = useCallback(async () => {
    window.clearTimeout(timer.current);
    const body = pending.current;
    if (!body || !missionId || preview) return;
    pending.current = null;
    setSave((current) => ({ ...current, status: 'saving' }));
    try {
      const updated = await requestApi<MissionView>(`/assessments/missions/${encodeURIComponent(missionId)}`, token, { method: 'PUT', body });
      setMission((current) => (current && current.id === updated.id ? { ...updated, text: current.text, checklist: current.checklist } : current));
      setSave({ status: 'saved', at: new Date() });
    } catch (failure) {
      // Ce qui a été saisi pendant l'envoi reste prioritaire sur le brouillon refusé.
      const later = pending.current as MissionUpdateRequest | null;
      pending.current = { ...body, ...later };
      setSave((current) => ({ ...current, status: 'error' }));
      setActionError(errorText(failure));
    }
  }, [missionId, preview, token]);

  // À la fermeture de l'activité : le brouillon en attente part tout de suite.
  useEffect(() => () => { if (pending.current) void flush(); }, [flush]);

  function queue(update: MissionUpdateRequest) {
    if (preview) return;
    pending.current = { ...pending.current, ...update };
    submitKey.current = null;
    setSave((current) => ({ ...current, status: 'pending' }));
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => { void flush(); }, 700);
  }

  function changeText(value: string) {
    setText(value);
    setActionError('');
    queue({ text: value });
  }

  function toggle(index: number) {
    const next = checked.includes(index) ? checked.filter((item) => item !== index) : [...checked, index].sort((a, b) => a - b);
    setChecked(next);
    queue({ checklist: next });
  }

  if (!definition) {
    return <div className="study-body"><Callout tone="warning" title="Mission indisponible">La consigne de cette mission n’est pas encore disponible.</Callout></div>;
  }

  const written = definition.written;
  const oral = definition.oral;
  const criteria = missionCriteriaOf(definition);
  // Aide repliée (B2) hors de la situation : le réglage « Toujours afficher » est proposé une fois, sous la situation.
  const helpSwitch = !hasFoldedHelp(activity.lesson?.description)
    && [oral?.prompt, written?.prompt, ...definition.checklist, ...criteria.map((criterion) => criterion.label)].some((text) => hasFoldedHelp(text));
  const maxChars = Math.min(written?.maxChars ?? missionLimits.textChars, missionLimits.textChars);
  const words = countWords(text);
  const recorded = Boolean(mission?.recording);
  const oralDone = !oral || recorded;
  const writtenDone = !written || (text.trim().length > 0 && words >= written.minWords && text.length <= maxChars);
  const checkDone = checked.length === definition.checklist.length;
  const parts = [oral ? oralDone : null, written ? writtenDone : null, checkDone].filter((value): value is boolean => value !== null);
  const doneCount = parts.filter(Boolean).length;
  const missing = [
    !oralDone && { id: 'oral', text: 'Enregistrez et envoyez votre réponse orale.' },
    written && !text.trim() && { id: 'written', text: 'Écrivez votre texte.' },
    written && text.trim() && words < written.minWords && { id: 'written', text: `Écrivez au moins ${written.minWords} mots (${plural(words, 'mot')} pour l’instant).` },
    !checkDone && { id: 'check', text: `Cochez ${definition.checklist.length - checked.length > 1 ? `les ${definition.checklist.length - checked.length} points restants` : 'le dernier point'} de la liste de vérification.` },
  ].filter((item): item is { id: string; text: string } => Boolean(item));
  const draft = mission?.status === 'draft';
  const sendLabel = hasTeacher ? 'Envoyer à mon professeur' : 'Envoyer';

  async function submit() {
    if (!mission || busy || preview) return;
    if (missing.length) {
      setShowMissing(true);
      const target = root.current?.querySelector<HTMLElement>(`[data-mission-part="${missing[0].id}"]`);
      target?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    setBusy('submit');
    setActionError('');
    window.clearTimeout(timer.current);
    pending.current = null;
    submitKey.current ??= crypto.randomUUID();
    try {
      const id = encodeURIComponent(mission.id);
      await requestApi<MissionView>(`/assessments/missions/${id}`, token, { method: 'PUT', body: written ? { text, checklist: checked } : { checklist: checked } });
      const sent = await requestApi<MissionView>(`/assessments/missions/${id}/submit`, token, { method: 'POST', idempotencyKey: submitKey.current });
      adopt(sent);
      synced.current = true;
      setShowMissing(false);
      toast(sent.status === 'sent' ? 'Mission enregistrée.' : `Mission envoyée à ${sent.reviewerKind === 'reviewer' ? 'votre correcteur' : 'votre professeur'}.`);
      requestAnimationFrame(() => root.current?.querySelector<HTMLElement>('[data-mission-focus]')?.focus({ preventScroll: false }));
      await onSubmitted(sent);
    } catch (failure) {
      setActionError(errorText(failure));
    } finally {
      setBusy('');
    }
  }

  async function restart() {
    if (!mission || busy || preview || !versionId) return;
    setBusy('restart');
    setActionError('');
    try {
      const body: MissionStartRequest = sessionId
        ? { trackVersionId: versionId, activityId: contentActivityId, sessionId, sessionActivityId: activity.id, restart: true }
        : { trackVersionId: versionId, activityId: contentActivityId, restart: true };
      adopt(await requestApi<MissionView>('/assessments/missions', token, { method: 'POST', body }));
      synced.current = false;
      setShowMissing(false);
      toast('Nouveau brouillon ouvert : votre texte précédent est repris.');
      root.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (failure) {
      setActionError(errorText(failure));
    } finally {
      setBusy('');
    }
  }

  const placements = (activity.placements ?? []).filter((placement) => !placement.questionId);
  const intro = (
    <>
      {activity.lesson?.description && <LessonContent text={activity.lesson.description} />}
      {helpSwitch && <FrenchHelpSwitch />}
      {placements.length > 0 && <MediaSequence placements={placements} onRenew={onRenew ?? (() => undefined)} />}
    </>
  );

  if (!mission) {
    return (
      <div className="study-body ms-mission" ref={root}>
        {intro}
        {loadError ? (
          <div role="alert" className="ms-load-error">
            <Callout tone="warning" title="La mission n’a pas pu être ouverte">{loadError}</Callout>
            <button type="button" className="btn btn-outline btn-sm" onClick={() => setAttempt((value) => value + 1)}><RotateCcw size={15} aria-hidden="true" /> Réessayer</button>
          </div>
        ) : <SkeletonCard lines={4} label="Ouverture de la mission…" />}
      </div>
    );
  }

  if (!draft) {
    return (
      <div className="study-body ms-mission" ref={root}>
        <MissionStatusPanel mission={mission} busy={busy === 'restart'} onRestart={() => void restart()} preview={preview} />
        {actionError && <p className="inline-message warning" role="alert">{actionError}</p>}
        <details className="ms-recall">
          <summary><span>Revoir la situation et la consigne</span></summary>
          <div className="ms-recall-body">
            {intro}
            {criteria.length > 0 && mission.status !== 'sent' && !mission.review && <MissionGrid criteria={criteria} />}
          </div>
        </details>
        <section className="ms-sent-work" aria-label="Ce que vous avez envoyé">
          <h3>Ce que vous avez envoyé</h3>
          <MissionWork mission={mission} />
        </section>
      </div>
    );
  }

  const writtenStep = oral ? 2 : 1;
  const checkStep = 1 + (oral ? 1 : 0) + (written ? 1 : 0);
  const missingIds = showMissing ? new Set(missing.map((item) => item.id)) : new Set<string>();
  const ratio = text.length / maxChars;

  return (
    <div className="study-body ms-mission" ref={root}>
      {intro}
      <section className="ms-brief" aria-label="Votre mission">
        <span className="ms-brief-icon" aria-hidden="true"><Target size={22} /></span>
        <div>
          <p className="ms-brief-kicker">Votre mission{mission.number > 1 ? ` · tentative ${mission.number}` : ''}</p>
          <p className="ms-brief-text">{oral && written ? 'Parlez, écrivez, vérifiez, puis envoyez.' : oral ? 'Parlez, vérifiez, puis envoyez.' : 'Écrivez, vérifiez, puis envoyez.'}</p>
          <MissionChips definition={definition} />
        </div>
      </section>
      {criteria.length > 0 && <MissionGrid criteria={criteria} autonomous={!preview && hasTeacher === false} />}

      <ol className="ms-steps">
        {oral && (
          <li className={`ms-step${oralDone ? ' is-done' : ''}${missingIds.has('oral') ? ' is-missing' : ''}`} data-mission-part="oral">
            <header className="ms-step-head">
              <span className="ms-step-num" aria-hidden="true">{oralDone ? <Check size={15} strokeWidth={3} /> : 1}</span>
              <div><p className="ms-step-kicker">Étape 1 · Parler</p><h3>Votre réponse orale</h3></div>
              <span className="ms-step-state">{recorded ? <Badge tone="green">Enregistrement envoyé</Badge> : <Badge tone="neutral">{duration(oral.maxSeconds)} au plus</Badge>}</span>
            </header>
            {oral.prompt && <div className="ms-step-prompt"><LessonContent text={oral.prompt} compact /></div>}
            {preview
              ? <Callout tone="info">Aperçu : l’élève enregistre ici sa réponse ({duration(oral.maxSeconds)} au plus, arrêt automatique).</Callout>
              : (
                <AudioCapture maxSeconds={oral.maxSeconds} token={token}
                  saved={mission.recording ? { url: mission.recording.url, mimeType: mission.recording.mimeType } : null}
                  title={recorded ? 'Réenregistrer ma réponse' : 'Enregistrer ma réponse'}
                  reserve={(mimeType, size) => requestApi<UploadReservation>(`/assessments/missions/${encodeURIComponent(mission.id)}/recordings`, token, {
                    method: 'POST', body: { mimeType, size },
                  })}
                  finalize={async (productionId) => {
                    const updated = await requestApi<MissionView>(
                      `/assessments/missions/${encodeURIComponent(mission.id)}/recordings/${encodeURIComponent(productionId)}/finalize`, token, { method: 'POST', body: {} });
                    setMission((current) => (current ? { ...updated, text: current.text, checklist: current.checklist } : updated));
                    submitKey.current = null;
                  }}
                  onDone={() => toast('Enregistrement envoyé. Vous pouvez le réécouter ou le remplacer.')} />
              )}
          </li>
        )}

        {written && (
          <li className={`ms-step${writtenDone ? ' is-done' : ''}${missingIds.has('written') ? ' is-missing' : ''}`} data-mission-part="written">
            <header className="ms-step-head">
              <span className="ms-step-num" aria-hidden="true">{writtenDone ? <Check size={15} strokeWidth={3} /> : writtenStep}</span>
              <div><p className="ms-step-kicker">Étape {writtenStep} · Écrire</p><h3>Votre texte</h3></div>
              <span className="ms-step-state"><Badge tone={writtenDone ? 'green' : 'neutral'}>{written.minWords ? `${words}/${written.minWords} mots` : plural(words, 'mot')}</Badge></span>
            </header>
            {written.prompt && <div className="ms-step-prompt"><LessonContent text={written.prompt} compact /></div>}
            <div className={`ms-writer${ratio > .9 ? ' is-near' : ''}`}>
              <div className="ms-writer-head">
                <label htmlFor={`ms-text-${activity.id}`}>Votre texte en allemand</label>
                {!preview && <GermanKeys target={() => area.current} />}
              </div>
              <textarea ref={area} id={`ms-text-${activity.id}`} rows={8} lang="de" maxLength={maxChars} value={text} disabled={preview} spellCheck={false}
                aria-describedby={`ms-count-${activity.id}`} placeholder="Schreiben Sie hier …" onChange={(event) => changeText(event.target.value)} />
              <span className="ms-meter" aria-hidden="true"><span style={{ width: `${Math.min(100, ratio * 100)}%` }} /></span>
              <div className="ms-writer-foot" id={`ms-count-${activity.id}`}>
                <span className={`ms-words${written.minWords && words < written.minWords ? ' is-short' : ''}`}>
                  <b>{words}</b> {words > 1 ? 'mots' : 'mot'}{written.minWords ? <small> · {written.minWords} au moins</small> : null}
                </span>
                <span className="ms-chars"><b>{thousands.format(text.length)}</b> / {thousands.format(maxChars)} caractères</span>
                {!preview && <SaveIndicator status={save.status} at={save.at} />}
              </div>
            </div>
          </li>
        )}

        <li className={`ms-step${checkDone ? ' is-done' : ''}${missingIds.has('check') ? ' is-missing' : ''}`} data-mission-part="check">
          <header className="ms-step-head">
            <span className="ms-step-num" aria-hidden="true">{checkDone ? <Check size={15} strokeWidth={3} /> : checkStep}</span>
            <div><p className="ms-step-kicker">Étape {checkStep} · Vérifier</p><h3>Avant d’envoyer, je vérifie</h3></div>
            <span className="ms-step-state"><Badge tone={checkDone ? 'green' : 'neutral'}>{checked.length}/{definition.checklist.length}</Badge></span>
          </header>
          <fieldset className="ms-checklist" disabled={preview}>
            <legend className="sr-only">Liste d’auto-vérification</legend>
            {definition.checklist.map((item, index) => {
              const box = (
                <>
                  <input type="checkbox" checked={checked.includes(index)} onChange={() => toggle(index)} />
                  <span className="ms-check-box" aria-hidden="true"><Check size={14} strokeWidth={3} /></span>
                </>
              );
              // Aide repliée (B2) : son bouton reste hors de l'étiquette de la case.
              const folded = hasFoldedHelp(item) ? glossUnits(item)[0] : null;
              if (folded?.fr) {
                return (
                  <div key={index} className={`ms-check has-help${checked.includes(index) ? ' is-checked' : ''}`}>
                    <label className="ms-check-hit">{box}<span className="ms-check-text" lang="de">{folded.de.join(' ')}</span></label>
                    <span className="ms-check-help"><GlossNote fr={folded.fr} mode="fold" /></span>
                  </div>
                );
              }
              return (
                <label key={index} className={`ms-check${checked.includes(index) ? ' is-checked' : ''}`}>
                  {box}
                  <span className="ms-check-text"><BilingualText text={item} /></span>
                </label>
              );
            })}
          </fieldset>
        </li>
      </ol>

      {showMissing && missing.length > 0 && (
        <div role="alert">
          <Callout tone="warning" title={missing.length > 1 ? 'Il reste quelques étapes' : 'Il reste une étape'}>
            <ul className="ms-missing">{missing.map((item, index) => <li key={index}>{item.text}</li>)}</ul>
          </Callout>
        </div>
      )}
      {actionError && <p className="inline-message warning" role="alert">{actionError}</p>}
      {preview && <Callout tone="info">Aperçu : l’enregistrement, le brouillon et l’envoi sont désactivés.</Callout>}

      <div className="ms-submit">
        <div className="ms-submit-count">
          <ProgressRing value={parts.length ? (doneCount / parts.length) * 100 : 0} size={44} stroke={5} color={doneCount === parts.length ? 'var(--success)' : 'var(--brand)'}
            label={`${doneCount} étapes prêtes sur ${parts.length}`}>
            <small>{doneCount}/{parts.length}</small>
          </ProgressRing>
          <span>{doneCount === parts.length ? 'Tout est prêt : vous pouvez envoyer.' : `${plural(parts.length - doneCount, 'étape', 'étapes')} avant l’envoi`}</span>
        </div>
        <button type="button" className="btn btn-primary btn-lg" onClick={() => void submit()} disabled={busy !== '' || preview}>
          {busy === 'submit' ? <LoaderCircle size={18} className="ms-spin" aria-hidden="true" /> : <Send size={18} aria-hidden="true" />}
          {busy === 'submit' ? 'Envoi…' : sendLabel}
        </button>
      </div>
    </div>
  );
}

/**
 * Détail d'une remise en panneau latéral (résultats de l'élève, fiche élève) : statut, retour, travail remis et lien vers
 * la mission (séance, bibliothèque ou correction).
 */
export function MissionDetailDrawer({ token, missionId, viewer, onClose }: {
  token: string; missionId: string; viewer: 'learner' | 'staff'; onClose: () => void;
}) {
  const [mission, setMission] = useState<MissionView | null>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    requestApi<MissionView>(`/assessments/missions/${encodeURIComponent(missionId)}`, token).then(
      (view) => { if (active) setMission(view); },
      (failure: unknown) => { if (active) setError(errorText(failure)); },
    );
    return () => { active = false; };
  }, [missionId, token]);

  let action: ReactNode = null;
  if (mission && viewer === 'staff' && mission.status === 'submitted' && mission.canReview) {
    action = <Link className="btn btn-primary" to={`/espace/corrections/missions/${encodeURIComponent(mission.id)}`}>Corriger la mission <ArrowRight size={16} aria-hidden="true" /></Link>;
  } else if (mission && viewer === 'learner') {
    const to = mission.sessionId ? `/espace/seance/${encodeURIComponent(mission.sessionId)}`
      : `/espace/bibliotheque/${encodeURIComponent(mission.trackVersionId)}/${encodeURIComponent(mission.activityId)}`;
    const redo = mission.status === 'reviewed' && mission.review?.decision === 'to_redo';
    action = <Link className={`btn ${redo || mission.status === 'draft' ? 'btn-primary' : 'btn-outline'}`} to={to}>
      {redo ? 'Reprendre la mission' : mission.status === 'draft' ? 'Continuer la mission' : 'Ouvrir la mission'} <ArrowRight size={16} aria-hidden="true" /></Link>;
  }

  return (
    <Drawer wide title={mission?.title ?? 'Mission'} onClose={onClose}
      description={mission ? `${mission.levelCode} · tentative ${mission.number}` : undefined}
      footer={action ? <div className="ms-drawer-foot">{action}</div> : undefined}>
      {error ? <Callout tone="warning" title="Mission indisponible">{error}</Callout>
        : !mission ? <SkeletonCard lines={5} label="Chargement de la mission…" />
        : (
          <div className="ms-detail">
            <div className="ms-detail-head">
              <MissionBadge mission={mission} viewer={viewer} />
              {mission.reviewerKind && <Badge tone="neutral">{mission.reviewerKind === 'reviewer' ? 'Correcteur' : 'Professeur référent'}</Badge>}
            </div>
            <Facts items={[
              { label: 'Envoyée', value: mission.submittedAt ? dayTime.format(new Date(mission.submittedAt)) : 'Pas encore' },
              { label: 'Contexte', value: mission.sessionId ? 'Séance' : 'Bibliothèque' },
              ...(mission.review ? [{ label: 'Retour', value: dayTime.format(new Date(mission.review.reviewedAt)) }] : []),
            ]} />
            <MissionFeedback mission={mission} viewer={viewer} />
            {mission.definition.description && (
              <details className="ms-recall">
                <summary><span>Situation et consigne</span></summary>
                <div className="ms-recall-body">
                  <LessonContent text={mission.definition.description} compact />
                  {missionCriteriaOf(mission.definition).length > 0 && !mission.review && <MissionGrid criteria={missionCriteriaOf(mission.definition)} />}
                </div>
              </details>
            )}
            <MissionWork mission={mission} viewer={viewer} />
          </div>
        )}
    </Drawer>
  );
}
