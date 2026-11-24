/**
 * Corrections V4 (professeur, correcteur, administration) : onglets « Copies | Missions | Répétitions orales » de la
 * page Corrections, puis file et détail côte à côte. Une mission se lit (consigne, enregistrement, texte, liste cochée)
 * puis reçoit une décision — validée ou à reprendre — avec un retour ; une répétition orale envoyée en enregistrement
 * (navigateur sans reconnaissance vocale) s'écoute puis se valide ou se refuse.
 * Niveaux B : la mission se note sur sa grille (un champ par critère, total en direct) ; la décision est présélectionnée
 * d'après le score (60 %) et reste au correcteur ; le commentaire part d'un modèle (« Points forts / À retravailler /
 * Relance »), avec la légende des codes de correction. « Envoyer » attend que chaque critère soit noté.
 */
import { useCallback, useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, Check, CheckCircle2, ClipboardCheck, Target, LoaderCircle, Mic, Minus, Plus, RotateCcw, Scale, Send, ThumbsDown, ThumbsUp,
  WandSparkles,
} from 'lucide-react';
import { Badge, EmptyState } from '../../components/ui';
import {
  AudioPlayer, Avatar, Callout, Card, Facts, ProgressRing, SearchField, SkeletonCard, SplitView, Tabs, useToast, type TabItem,
} from '../../design/kit';
import { requestApi } from '../../integration/api';
import { levelRank } from '../../integration/v2';
import {
  missionCommentTemplate, missionCriteriaOf, missionLimits, missionMaxScore, missionPassPercent, missionScore, speechReviewStatusLabels,
  suggestedMissionDecision, type MissionCriterion, type MissionDecision, type MissionReviewRequest, type MissionView, type ReviewQueueItem,
  type ReviewQueueKind, type SpeechAttemptView,
} from '../../integration/v4';
import { glossUnits, hasGloss } from './bilingual';
import { LessonContent } from './LessonContent';
import { CorrectionCodes, criterionParts, MissionBadge, MissionFeedback, MissionWork, passScore } from './study-mission';
import './reviews.css';

export type CorrectionSection = 'copies' | 'missions' | 'oral';

const dayTime = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
const relative = new Intl.RelativeTimeFormat('fr-FR', { numeric: 'auto' });

function errorText(error: unknown) {
  return error instanceof Error && error.name !== 'TimeoutError' && error.message ? error.message : 'Le service est momentanément indisponible. Réessayez.';
}
const plural = (count: number, one: string, many = `${one}s`) => `${count} ${count > 1 ? many : one}`;

function fromNow(iso: string) {
  const minutes = Math.round((new Date(iso).getTime() - Date.now()) / 60000);
  if (Math.abs(minutes) < 60) return relative.format(minutes, 'minute');
  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 24) return relative.format(hours, 'hour');
  return relative.format(Math.round(hours / 24), 'day');
}

/** Section des corrections d'après l'adresse (/espace/corrections, …/missions, …/oral). */
export function correctionSection(pathname: string): CorrectionSection {
  if (/\/corrections\/missions(\/|$)/.test(pathname)) return 'missions';
  if (/\/corrections\/oral(\/|$)/.test(pathname)) return 'oral';
  return 'copies';
}

const sectionPaths: Record<CorrectionSection, string> = {
  copies: '/espace/corrections', missions: '/espace/corrections/missions', oral: '/espace/corrections/oral',
};

/** Nombre d'éléments en attente par onglet ; relu à chaque changement d'écran (`key`). */
export function useCorrectionCounts(token: string, key: string) {
  const [counts, setCounts] = useState<Partial<Record<CorrectionSection, number>>>({});
  const [reload, setReload] = useState(0);
  useEffect(() => {
    let active = true;
    requestApi<unknown[]>('/assessments/grading', token).then(
      (copies) => { if (active) setCounts((current) => ({ ...current, copies: copies.length })); }, () => undefined);
    requestApi<ReviewQueueItem[]>('/assessments/reviews', token).then((items) => {
      if (active) setCounts((current) => ({
        ...current, missions: items.filter((item) => item.kind === 'mission').length, oral: items.filter((item) => item.kind === 'speech').length,
      }));
    }, () => undefined);
    return () => { active = false; };
  }, [token, key, reload]);
  return { counts, refresh: useCallback(() => setReload((value) => value + 1), []) };
}

/** Onglets de la page Corrections. */
export function CorrectionsTabs({ section, counts }: { section: CorrectionSection; counts: Partial<Record<CorrectionSection, number>> }) {
  const navigate = useNavigate();
  const tabs: TabItem[] = [
    { id: 'copies', label: 'Copies', icon: <ClipboardCheck size={16} aria-hidden="true" />, count: counts.copies },
    { id: 'missions', label: 'Missions', icon: <Target size={16} aria-hidden="true" />, count: counts.missions },
    { id: 'oral', label: 'Répétitions orales', icon: <Mic size={16} aria-hidden="true" />, count: counts.oral },
  ];
  return (
    <div className="rv-tabs">
      <Tabs tabs={tabs} value={section} label="Types de corrections" idPrefix="corrections"
        onChange={(id) => navigate(sectionPaths[id as CorrectionSection])} />
    </div>
  );
}

const kindTexts: Record<ReviewQueueKind, {
  title: string; empty: string; emptyText: string; choose: string; chooseText: string; back: string; path: string; action: string; next: string;
}> = {
  mission: {
    title: 'Missions à corriger', empty: 'Aucune mission à corriger',
    emptyText: 'Les missions envoyées par vos élèves arriveront ici, les plus anciennes d’abord.',
    choose: 'Choisissez une mission', chooseText: 'La mission s’affiche ici : consigne, enregistrement, texte et liste cochée, puis votre décision.',
    back: 'Retour aux missions', path: '/espace/corrections/missions', action: 'Corriger', next: 'Mission suivante',
  },
  speech: {
    title: 'Répétitions à valider', empty: 'Aucune répétition à valider',
    emptyText: 'Quand le navigateur d’un élève ne reconnaît pas la voix, sa répétition enregistrée arrive ici.',
    choose: 'Choisissez une répétition', chooseText: 'Écoutez l’enregistrement, puis validez-le ou demandez à l’élève de le reprendre.',
    back: 'Retour aux répétitions', path: '/espace/corrections/oral', action: 'Valider', next: 'Répétition suivante',
  },
};

/** En-tête commun d'un élément ouvert : élève, titre, statut et repères. */
function DetailHead({ name, level, title, badge, facts }: {
  name: string; level?: string | null; title: string; badge: ReactNode; facts: { label: string; value: ReactNode }[];
}) {
  return (
    <Card className="ev-copy-head rv-head">
      <div className="ev-copy-id">
        <Avatar name={name} size={46} />
        <div>
          <p className="ev-copy-learner">{name}{level ? ` · ${level}` : ''}</p>
          <h2 id="review-title">{title}</h2>
        </div>
        <span className="ev-copy-status">{badge}</span>
      </div>
      <Facts items={facts} />
    </Card>
  );
}

const suggestions = [
  'Bravo : la tâche est réalisée et le message est clair.',
  'Attention à la place du verbe conjugué.',
  'Relisez les majuscules des noms.',
  'Parlez un peu plus lentement, en articulant.',
];

/** Intertitres du modèle de commentaire (« Points forts : »…) : une ligne réduite à l'un d'eux n'a pas été remplie. */
const templateHeads = missionCommentTemplate.split('\n').map((line) => line.trim()).filter(Boolean);
/** Commentaire envoyé : les intertitres du modèle restés vides sont retirés. */
const cleanComment = (text: string) => text.split('\n').filter((line) => !templateHeads.includes(line.trim())).join('\n').trim();

/** Libellé d'un critère vu par le correcteur : nom, précision et traduction toujours visible (écrans en français). */
function CriterionText({ label }: { label: string }) {
  const parts = criterionParts(label);
  const french = hasGloss(label) ? glossUnits(label)[0]?.fr : null;
  return (
    <span className="rv-crit-text">
      <strong lang={french ? 'de' : undefined}>{parts.name}</strong>
      {parts.detail && <small lang={french ? 'de' : undefined}>{parts.detail}</small>}
      {french && <small className="rv-crit-fr" lang="fr">{french}</small>}
    </span>
  );
}

/** Note d'un critère : moins et plus autour du nombre, curseur pour aller vite (présentation des copies d'examen). */
function CriterionScore({ id, criterion, value, onChange, disabled }: {
  id: string; criterion: MissionCriterion; value: number | null; onChange: (value: number | null) => void; disabled: boolean;
}) {
  const max = criterion.maxPoints;
  const name = criterionParts(criterion.label).name;
  const set = (next: number) => onChange(Math.max(0, Math.min(max, Math.round(next))));
  return (
    <div className={`ev-criterion rv-criterion${value !== null ? ' is-set' : ''}`}>
      <div className="ev-criterion-head">
        <label htmlFor={id}><CriterionText label={criterion.label} /></label>
        <span className="ev-criterion-max">sur {max}</span>
      </div>
      <div className="ev-criterion-controls">
        <div className="ev-stepper">
          <button type="button" onClick={() => set(value === null ? 0 : value - 1)} disabled={disabled || value === 0} aria-label={`Retirer un point · ${name}`}>
            <Minus size={16} aria-hidden="true" /></button>
          <input id={id} type="number" min={0} max={max} step={1} inputMode="numeric" placeholder="–" value={value ?? ''} disabled={disabled}
            onChange={(event) => (event.target.value === '' ? onChange(null) : set(Number(event.target.value)))} />
          <button type="button" onClick={() => set(value === null ? 1 : value + 1)} disabled={disabled || (value !== null && value >= max)} aria-label={`Ajouter un point · ${name}`}>
            <Plus size={16} aria-hidden="true" /></button>
        </div>
        <input type="range" className="ev-slider" min={0} max={max} step={1} value={value ?? 0} disabled={disabled} aria-label={`Curseur · ${name}`}
          style={{ ['--p' as string]: `${value === null ? 0 : (value / max) * 100}%` }} onChange={(event) => set(Number(event.target.value))} />
      </div>
    </div>
  );
}

/** Mission ouverte : travail de l'élève, puis grille (niveaux B), décision et retour. */
function MissionReview({ token, id, item, next, onReviewed }: {
  token: string; id: string; item: ReviewQueueItem | undefined; next: ReviewQueueItem | undefined; onReviewed: () => void;
}) {
  const navigate = useNavigate();
  const toast = useToast();
  const [mission, setMission] = useState<MissionView | null>(null);
  const [error, setError] = useState('');
  const [decision, setDecision] = useState<MissionDecision | null>(null);
  // La décision suit le score tant que le correcteur ne l'a pas choisie lui-même.
  const [decisionChosen, setDecisionChosen] = useState(false);
  const [points, setPoints] = useState<Record<string, number | null>>({});
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState(false);
  const [missing, setMissing] = useState(false);
  const name = useRef(item?.learnerName);
  if (item) name.current = item.learnerName;
  const context = useRef(item?.context);
  if (item) context.current = item.context;

  useEffect(() => {
    let active = true;
    requestApi<MissionView>(`/assessments/missions/${encodeURIComponent(id)}`, token).then(
      (view) => {
        if (!active) return;
        setMission(view);
        // Mission sur grille : le modèle de commentaire préremplit le champ.
        if (missionCriteriaOf(view.definition).length && view.status === 'submitted') setComment((current) => current || missionCommentTemplate);
      },
      (failure: unknown) => { if (active) setError(errorText(failure)); },
    );
    return () => { active = false; };
  }, [id, token]);

  const criteria = mission ? missionCriteriaOf(mission.definition) : [];
  const graded = criteria.length > 0;
  const maxScore = missionMaxScore(criteria);
  const score = graded ? missionScore(criteria, points) : null;
  const filled = criteria.filter((criterion) => typeof points[criterion.id] === 'number').length;
  const earned = criteria.reduce((sum, criterion) => sum + (points[criterion.id] ?? 0), 0);
  const written = cleanComment(comment);
  const suggested = suggestedMissionDecision(score, maxScore);

  function score_(criterionId: string, value: number | null) {
    const next = { ...points, [criterionId]: value };
    setPoints(next);
    if (!decisionChosen) setDecision(suggestedMissionDecision(missionScore(criteria, next), maxScore));
  }
  function choose(value: MissionDecision) {
    setDecision(value);
    setDecisionChosen(true);
    setMissing(false);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!mission || busy || (graded && score === null)) return;
    if (!decision || (decision === 'to_redo' && !written)) { setMissing(true); return; }
    setBusy(true);
    setError('');
    const body: MissionReviewRequest = graded
      ? { decision, comment: written, points: Object.fromEntries(criteria.map((criterion) => [criterion.id, points[criterion.id] as number])) }
      : { decision, comment: comment.trim() };
    try {
      const reviewed = await requestApi<MissionView>(`/assessments/missions/${encodeURIComponent(mission.id)}/review`, token, { method: 'POST', body });
      setMission(reviewed);
      toast(decision === 'validated' ? `Mission validée${name.current ? ` pour ${name.current}` : ''}.` : `Retour envoyé${name.current ? ` à ${name.current}` : ''} : la mission est à reprendre.`);
      onReviewed();
    } catch (failure) {
      setError(errorText(failure));
    } finally {
      setBusy(false);
    }
  }
  const back = <Link className="text-link ev-copy-back" to={kindTexts.mission.path}><ArrowLeft size={16} aria-hidden="true" /> {kindTexts.mission.back}</Link>;
  if (!mission) {
    return (
      <div className="ev-copy rv-detail">
        {back}
        {error ? <Callout tone="warning" title="Mission indisponible">{error}</Callout> : <><SkeletonCard lines={2} label="Chargement de la mission…" /><SkeletonCard lines={6} /></>}
      </div>
    );
  }

  const learner = name.current ?? 'Élève';
  const open = mission.status === 'submitted' && mission.canReview;
  return (
    <div className="ev-copy rv-detail lc-enter">
      {back}
      <DetailHead name={learner} level={mission.levelCode} title={`${mission.title}${mission.number > 1 ? ` · tentative ${mission.number}` : ''}`}
        badge={<MissionBadge mission={mission} viewer="staff" />}
        facts={[
          { label: 'Envoyée', value: mission.submittedAt ? dayTime.format(new Date(mission.submittedAt)) : '—' },
          { label: 'Contexte', value: (mission.sessionId ?? context.current === 'session') ? 'Séance' : 'Bibliothèque' },
          { label: 'Destinataire', value: mission.reviewerKind === 'reviewer' ? 'Correcteur désigné' : mission.reviewerKind === 'teacher' ? 'Professeur référent' : 'Aucun' },
          { label: 'Parties', value: [mission.definition.oral && 'oral', mission.definition.written && 'écrit'].filter(Boolean).join(' et ') || '—' },
        ]} />
      <div className="rv-columns">
        <div className="rv-work">
          {mission.definition.description && (
            <details className="ev-instructions-toggle">
              <summary>Situation et consigne données à l’élève</summary>
              <LessonContent text={mission.definition.description} compact />
            </details>
          )}
          <MissionWork mission={mission} viewer="staff" />
        </div>
        <aside className="rv-decision" aria-label="Décision">
          {open ? (
            <form className="rv-form" onSubmit={(event) => void submit(event)} noValidate>
              {graded && (
                <fieldset className="ev-rubric rv-rubric" disabled={busy}>
                  <legend><Scale size={17} aria-hidden="true" /> Grille de correction</legend>
                  {criteria.map((criterion) => (
                    <CriterionScore key={criterion.id} id={`rv-${mission.id}-${criterion.id}`} criterion={criterion} value={points[criterion.id] ?? null}
                      disabled={busy} onChange={(value) => score_(criterion.id, value)} />
                  ))}
                  <div className={`rv-total${score !== null ? (score >= passScore(maxScore) ? ' is-pass' : ' is-low') : ''}`} role="status">
                    <ProgressRing value={maxScore ? (earned / maxScore) * 100 : 0} size={46} stroke={5}
                      color={score === null ? 'var(--brand)' : score >= passScore(maxScore) ? 'var(--success)' : 'var(--warning)'}
                      label={`Total : ${earned} sur ${maxScore}`}>
                      <small>{maxScore ? Math.round((earned / maxScore) * 100) : 0}%</small>
                    </ProgressRing>
                    <span className="rv-total-text">
                      <strong>Total : {earned} / {maxScore}</strong>
                      <small>{score === null
                        ? `${filled}/${criteria.length} critères notés`
                        : `Validée à partir de ${passScore(maxScore)}/${maxScore} (${missionPassPercent} %)`}</small>
                    </span>
                  </div>
                </fieldset>
              )}
              <fieldset className={`rv-choices${missing && !decision ? ' is-missing' : ''}`} disabled={busy}>
                <legend>Votre décision</legend>
                <label className={`rv-choice is-validated${decision === 'validated' ? ' is-checked' : ''}`}>
                  <input type="radio" name="decision" value="validated" checked={decision === 'validated'} onChange={() => choose('validated')} />
                  <span className="rv-choice-icon" aria-hidden="true"><CheckCircle2 size={20} /></span>
                  <span><strong>Valider la mission</strong><small>La tâche est réalisée : l’élève passe à la suite.</small></span>
                </label>
                <label className={`rv-choice is-redo${decision === 'to_redo' ? ' is-checked' : ''}`}>
                  <input type="radio" name="decision" value="to_redo" checked={decision === 'to_redo'} onChange={() => choose('to_redo')} />
                  <span className="rv-choice-icon" aria-hidden="true"><RotateCcw size={20} /></span>
                  <span><strong>À reprendre</strong><small>L’élève refait la mission avec votre retour.</small></span>
                </label>
                {graded && !decisionChosen && suggested && (
                  <p className="rv-suggested"><WandSparkles size={14} aria-hidden="true" />
                    Présélection d’après le score ({score}/{maxScore}) : la décision vous revient.</p>
                )}
              </fieldset>
              <label className="rv-comment">
                <span>Retour à l’élève{decision === 'to_redo' ? ' (obligatoire)' : ''}</span>
                {graded && (
                  <small className="rv-comment-hint">
                    {levelRank(mission.levelCode) >= levelRank('B2')
                      ? 'En allemand de préférence (B2). Citez les codes ci-dessous ; deux points à retravailler au plus.'
                      : 'En français ou en allemand (B1). Citez les codes ci-dessous ; deux points à retravailler au plus.'}
                  </small>
                )}
                <textarea rows={graded ? 7 : 6} maxLength={missionLimits.commentChars} value={comment} disabled={busy}
                  aria-invalid={missing && decision === 'to_redo' && !written ? true : undefined}
                  placeholder="Ce qui est réussi, ce qu’il faut améliorer, un conseil pour la suite…" onChange={(event) => setComment(event.target.value)} />
                <small className="rv-comment-count">{comment.length} / {missionLimits.commentChars}</small>
              </label>
              {graded ? (
                <>
                  {!comment.includes(templateHeads[0]) && (
                    <button type="button" className="rv-suggestion rv-template" disabled={busy}
                      onClick={() => setComment((current) => (current.trim() ? `${missionCommentTemplate}\n${current.trim()}` : missionCommentTemplate).slice(0, missionLimits.commentChars))}>
                      + Modèle « Points forts / À retravailler / Relance »
                    </button>
                  )}
                  <CorrectionCodes />
                </>
              ) : (
                <div className="rv-suggestions" role="group" aria-label="Formules rapides">
                  {suggestions.map((text) => (
                    <button key={text} type="button" className="rv-suggestion" disabled={busy}
                      onClick={() => setComment((current) => (current.trim() ? `${current.trimEnd()} ${text}` : text).slice(0, missionLimits.commentChars))}>
                      + {text}
                    </button>
                  ))}
                </div>
              )}
              {missing && (!decision || (decision === 'to_redo' && !written)) && (
                <p className="inline-message warning" role="alert">
                  {!decision ? 'Choisissez une décision.' : 'Expliquez à l’élève ce qu’il doit reprendre.'}
                </p>
              )}
              {error && <p className="inline-message warning" role="alert">{error}</p>}
              <button type="submit" className="btn btn-primary btn-block" disabled={busy || (graded && score === null)}
                aria-describedby={graded && score === null ? `rv-left-${mission.id}` : undefined}>
                {busy ? <LoaderCircle size={17} className="rv-spin" aria-hidden="true" /> : <Send size={17} aria-hidden="true" />}
                {busy ? 'Envoi…' : decision === 'to_redo' ? 'Demander une reprise' : decision === 'validated' ? 'Valider la mission' : 'Envoyer le retour'}
              </button>
              {graded && score === null && (
                <p className="rv-left" id={`rv-left-${mission.id}`}>
                  Notez chaque critère pour envoyer ({criteria.length - filled > 1 ? `${criteria.length - filled} critères restants` : '1 critère restant'}).
                </p>
              )}
            </form>
          ) : (
            <div className="rv-done">
              {mission.status === 'reviewed' ? (
                <>
                  <p className="rv-done-title"><Check size={18} aria-hidden="true" /> Retour envoyé</p>
                  <MissionFeedback mission={mission} viewer="staff" />
                </>
              ) : mission.status === 'submitted' ? (
                <Callout tone="info">Vous pouvez consulter cette mission ; sa correction revient à {mission.reviewerKind === 'reviewer' ? 'son correcteur désigné' : 'son professeur référent'}.</Callout>
              ) : mission.status === 'sent' ? (
                <Callout tone="info">Mission envoyée sans destinataire : l’élève apprend en autonomie et s’est vérifié lui-même.</Callout>
              ) : <Callout tone="info">L’élève n’a pas encore envoyé cette mission.</Callout>}
              {next && next.id !== mission.id && (
                <button type="button" className="btn btn-primary btn-block" onClick={() => navigate(`${kindTexts.mission.path}/${encodeURIComponent(next.id)}`)}>
                  {kindTexts.mission.next} : {next.learnerName} <ArrowRight size={16} aria-hidden="true" />
                </button>
              )}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

/** Répétition orale ouverte : phrase, enregistrement, puis validation ou refus. */
function SpeechReview({ token, id, item, next, onReviewed }: {
  token: string; id: string; item: ReviewQueueItem | undefined; next: ReviewQueueItem | undefined; onReviewed: () => void;
}) {
  const navigate = useNavigate();
  const toast = useToast();
  const [attempt, setAttempt] = useState<SpeechAttemptView | null>(null);
  const [error, setError] = useState('');
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState<'' | 'validated' | 'rejected'>('');
  const name = useRef(item?.learnerName);
  if (item) name.current = item.learnerName;
  const title = useRef(item?.title);
  if (item) title.current = item.title;
  const level = useRef(item?.levelCode);
  if (item) level.current = item.levelCode;
  const context = useRef(item?.context);
  if (item) context.current = item.context;

  useEffect(() => {
    let active = true;
    requestApi<SpeechAttemptView>(`/assessments/speech/${encodeURIComponent(id)}`, token).then(
      (view) => { if (active) setAttempt(view); },
      (failure: unknown) => { if (active) setError(errorText(failure)); },
    );
    return () => { active = false; };
  }, [id, token]);

  async function decide(decision: 'validated' | 'rejected') {
    if (!attempt || busy) return;
    setBusy(decision);
    setError('');
    try {
      const reviewed = await requestApi<SpeechAttemptView>(`/assessments/speech/${encodeURIComponent(attempt.id)}/review`, token, {
        method: 'POST', body: comment.trim() ? { decision, comment: comment.trim() } : { decision },
      });
      setAttempt(reviewed);
      toast(decision === 'validated' ? `Répétition validée${name.current ? ` pour ${name.current}` : ''}.` : `Répétition refusée : ${name.current ?? 'l’élève'} la verra « à reprendre ».`);
      onReviewed();
      // File traitée à la suite : on passe directement à la répétition suivante.
      if (next && next.id !== attempt.id) navigate(`${kindTexts.speech.path}/${encodeURIComponent(next.id)}`);
    } catch (failure) {
      setError(errorText(failure));
    } finally {
      setBusy('');
    }
  }

  const back = <Link className="text-link ev-copy-back" to={kindTexts.speech.path}><ArrowLeft size={16} aria-hidden="true" /> {kindTexts.speech.back}</Link>;
  if (!attempt) {
    return (
      <div className="ev-copy rv-detail">
        {back}
        {error ? <Callout tone="warning" title="Répétition indisponible">{error}</Callout> : <><SkeletonCard lines={2} label="Chargement de la répétition…" /><SkeletonCard lines={4} /></>}
      </div>
    );
  }

  const learner = name.current ?? 'Élève';
  const pending = attempt.reviewStatus === 'pending';
  const tone = attempt.reviewStatus === 'validated' || attempt.reviewStatus === 'auto' ? 'green' : attempt.reviewStatus === 'rejected' ? 'red' : 'amber';
  // Phrase à répéter servie avec l'essai ; à défaut (service antérieur), le titre de la file la cite.
  const sentence = attempt.text ?? null;
  return (
    <div className="ev-copy rv-detail lc-enter">
      {back}
      <DetailHead name={learner} level={level.current} title={title.current ?? 'Répétition orale'}
        badge={<Badge tone={tone}>{speechReviewStatusLabels[attempt.reviewStatus]}</Badge>}
        facts={[
          { label: 'Envoyée', value: dayTime.format(new Date(attempt.createdAt)) },
          { label: 'Contexte', value: context.current === 'library' ? 'Bibliothèque' : context.current === 'session' ? 'Séance' : '—' },
          { label: 'Essai', value: `n° ${attempt.attempt}${attempt.failures ? ` · ${plural(attempt.failures, 'échec')} avant` : ''}` },
          { label: 'Seuil de réussite', value: `${attempt.threshold} %` },
        ]} />
      <Card className="rv-speech">
        {sentence ? (
          <div className="rv-target">
            <p className="rv-target-label">Phrase à répéter</p>
            <p className="rv-target-text" lang="de">{sentence}</p>
          </div>
        ) : (
          <Callout tone="info">Écoutez la répétition au regard de la phrase modèle de l’exercice « {title.current ?? 'répétition orale'} ».</Callout>
        )}
        <div className="rv-listen">
          <p className="rv-target-label">Enregistrement de l’élève</p>
          {attempt.recording?.url
            ? <div className="ms-audio"><AudioPlayer src={attempt.recording.url} title={`Répétition de ${learner}`} /></div>
            : <Callout tone="warning">L’enregistrement n’est pas disponible pour le moment.</Callout>}
        </div>
        {pending && attempt.recording ? (
          <div className="rv-speech-decision">
            <label className="rv-comment">
              <span>Conseil pour l’élève (facultatif)</span>
              <textarea rows={3} maxLength={1000} value={comment} disabled={busy !== ''} placeholder="Par exemple : attention au son « ch » de « ich »."
                onChange={(event) => setComment(event.target.value)} />
            </label>
            {error && <p className="inline-message warning" role="alert">{error}</p>}
            <div className="rv-speech-actions">
              <button type="button" className="btn btn-outline rv-reject" onClick={() => void decide('rejected')} disabled={busy !== ''}>
                {busy === 'rejected' ? <LoaderCircle size={17} className="rv-spin" aria-hidden="true" /> : <ThumbsDown size={17} aria-hidden="true" />} À reprendre
              </button>
              <button type="button" className="btn btn-primary rv-accept" onClick={() => void decide('validated')} disabled={busy !== ''}>
                {busy === 'validated' ? <LoaderCircle size={17} className="rv-spin" aria-hidden="true" /> : <ThumbsUp size={17} aria-hidden="true" />} Valider la répétition
              </button>
            </div>
          </div>
        ) : (
          <div className="rv-done">
            {(attempt.reviewStatus === 'validated' || attempt.reviewStatus === 'rejected') && (
              <p className="rv-done-title"><Check size={18} aria-hidden="true" /> Décision enregistrée : {attempt.reviewStatus === 'validated' ? 'répétition validée' : 'à reprendre'}</p>
            )}
            {attempt.comment && <div className="ev-given"><strong>Conseil laissé</strong><p>{attempt.comment}</p></div>}
            {(attempt.reviewStatus === 'auto' || attempt.reviewStatus === 'uploading' || (pending && !attempt.recording)) && (
              <Callout tone="info">{attempt.reviewStatus === 'auto' ? 'Cette répétition a été validée par la reconnaissance vocale : elle n’attend pas de décision.'
                : 'L’enregistrement de l’élève n’est pas encore arrivé.'}</Callout>
            )}
            {next && next.id !== attempt.id && (
              <button type="button" className="btn btn-primary" onClick={() => navigate(`${kindTexts.speech.path}/${encodeURIComponent(next.id)}`)}>
                {kindTexts.speech.next} : {next.learnerName} <ArrowRight size={16} aria-hidden="true" />
              </button>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}

/** File des missions ou des répétitions et élément ouvert côte à côte (l'élément remplace la file sur mobile). */
export function ReviewsWorkspace({ token, kind, onChanged }: { token: string; kind: ReviewQueueKind; onChanged?: () => void }) {
  const { reviewId } = useParams();
  const texts = kindTexts[kind];
  const [queue, setQueue] = useState<ReviewQueueItem[] | null>(null);
  const [error, setError] = useState('');
  const [reload, setReload] = useState(0);
  const [search, setSearch] = useState('');

  useEffect(() => {
    let active = true;
    requestApi<ReviewQueueItem[]>('/assessments/reviews', token).then(
      (items) => { if (active) { setQueue(items.filter((item) => item.kind === kind)); setError(''); } },
      (failure: unknown) => { if (active) setError(errorText(failure)); },
    );
    return () => { active = false; };
  }, [token, kind, reload]);

  const refresh = () => { setReload((value) => value + 1); onChanged?.(); };
  const shown = (queue ?? []).filter((item) => `${item.learnerName} ${item.title}`.toLowerCase().includes(search.trim().toLowerCase()));
  const current = queue?.find((item) => item.id === reviewId);
  const next = queue?.find((item) => item.id !== reviewId);
  const Icon = kind === 'mission' ? Target : Mic;

  const list = (
    <Card flush className="ev-queue rv-queue" title={texts.title} icon={kind === 'mission' ? <Target size={18} /> : <Mic size={18} />}
      description={queue ? (queue.length ? `${plural(queue.length, kind === 'mission' ? 'mission' : 'répétition')} en attente` : 'File à jour') : undefined}>
      {queue && queue.length > 3 && (
        <div className="ev-queue-tools">
          <SearchField value={search} onChange={setSearch} label="Rechercher un élève" placeholder="Rechercher un élève" />
        </div>
      )}
      {error ? (
        <div className="ev-queue-state"><Callout tone="warning" title="File indisponible">{error}</Callout>
          <button type="button" className="btn btn-outline btn-sm" onClick={() => setReload((value) => value + 1)}>Réessayer</button></div>
      ) : queue === null ? (
        <div className="ev-queue-state"><SkeletonCard lines={3} label="Chargement de la file…" /></div>
      ) : queue.length === 0 ? (
        <EmptyState icon={<Check size={26} />} title={texts.empty} description={texts.emptyText} />
      ) : shown.length === 0 ? (
        <EmptyState title="Aucun élément ne correspond" description="Modifiez la recherche." />
      ) : (
        <ul className="kit-list ev-queue-list lc-stagger">
          {shown.map((item) => (
            <li key={item.id}>
              <Link className="kit-list-item" to={`${texts.path}/${encodeURIComponent(item.id)}`} aria-current={item.id === reviewId ? 'true' : undefined}
                aria-label={`${texts.action} : ${item.title}, ${item.learnerName}`}>
                <Avatar name={item.learnerName} size={40} />
                <span className="kit-list-main">
                  <strong>{item.learnerName}</strong>
                  <small className="rv-queue-title">{item.levelCode ? `${item.levelCode} · ` : ''}{item.title}</small>
                  <small className="ev-queue-when">Envoyée {fromNow(item.submittedAt)}</small>
                </span>
                <span className="kit-list-end">
                  <Badge tone={item.context === 'session' ? 'blue' : 'violet'}>{item.context === 'session' ? 'Séance' : 'Bibliothèque'}</Badge>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );

  const detail = reviewId
    ? kind === 'mission'
      ? <MissionReview key={reviewId} token={token} id={reviewId} item={current} next={next} onReviewed={refresh} />
      : <SpeechReview key={reviewId} token={token} id={reviewId} item={current} next={next} onReviewed={refresh} />
    : (
      <div className="ev-split-empty">
        <EmptyState icon={<Icon size={26} />} title={texts.choose} description={texts.chooseText} />
      </div>
    );

  return <div className="ev-grading rv-grading"><SplitView list={list} detail={detail} hasDetail={Boolean(reviewId)} /></div>;
}

