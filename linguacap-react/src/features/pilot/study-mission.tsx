/**
 * Missions (V4) : tâche de communication réelle, faite et remise dans l'application. L'élève lit la situation, enregistre
 * sa réponse orale (2 minutes au plus), rédige son texte (1 500 caractères au plus, avec les lettres allemandes), coche
 * sa liste d'auto-vérification, puis envoie la mission à son professeur (ou à son correcteur). Il voit ensuite le statut
 * (envoyée, validée, à reprendre), le retour du professeur, et peut reprendre la mission. Les mêmes blocs de lecture
 * servent à la fiche élève et aux résultats (`MissionWork`, `MissionDetailDrawer`).
 */
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle, ArrowRight, Check, CheckCircle2, Circle, CloudCheck, Target, GraduationCap, Hourglass, ListChecks, LoaderCircle, Mic,
  PenLine, RotateCcw, Send, Sparkles,
} from 'lucide-react';
import { Badge, type BadgeTone } from '../../components/ui';
import { AudioPlayer, Callout, Drawer, Facts, ProgressRing, SkeletonCard, Timeline, useToast, type TimelineEntry } from '../../design/kit';
import { requestApi } from '../../integration/api';
import {
  countWords, missionLimits, type MissionDefinition, type MissionStartRequest, type MissionStatus, type MissionSummary,
  type MissionUpdateRequest, type MissionView, type UploadReservation,
} from '../../integration/v4';
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
  return (
    <ul className="ms-chips" aria-label="Ce que demande la mission">
      {definition.oral && <li><Mic size={14} aria-hidden="true" /> Oral · {duration(definition.oral.maxSeconds)} au plus</li>}
      {definition.written && <li><PenLine size={14} aria-hidden="true" /> Écrit{definition.written.minWords ? ` · ${definition.written.minWords} mots au moins` : ''}</li>}
      <li><ListChecks size={14} aria-hidden="true" /> {plural(definition.checklist.length, 'point', 'points')} à vérifier</li>
    </ul>
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
          {definition.oral.prompt && <p className="ms-work-prompt">{definition.oral.prompt}</p>}
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
          {definition.written.prompt && <p className="ms-work-prompt">{definition.written.prompt}</p>}
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
                <span>{item}</span><span className="sr-only">{done ? ' : coché' : ' : non coché'}</span>
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

/** Retour du professeur ou du correcteur. */
export function MissionFeedback({ mission, viewer = 'learner' }: { mission: MissionView; viewer?: 'learner' | 'staff' }) {
  if (!mission.review) return null;
  const redo = mission.review.decision === 'to_redo';
  const who = viewer === 'staff' ? 'Retour envoyé à l’élève' : mission.reviewerKind === 'reviewer' ? 'Retour de votre correcteur' : 'Retour de votre professeur';
  return (
    <figure className={`ms-feedback${redo ? ' is-redo' : ' is-validated'}`}>
      <TeacherMark />
      <div className="ms-feedback-bubble">
        <figcaption><strong>{who}</strong><time dateTime={mission.review.reviewedAt}>{dayTime.format(new Date(mission.review.reviewedAt))}</time></figcaption>
        {mission.review.comment ? <blockquote>{mission.review.comment}</blockquote> : <p className="ms-work-empty">Sans commentaire.</p>}
      </div>
    </figure>
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
  const redo = mission.status === 'reviewed' && mission.review?.decision === 'to_redo';
  const validated = mission.status === 'reviewed' && !redo;
  const content = validated
    ? { tone: 'is-validated', icon: <Sparkles size={24} />, title: 'Mission validée, bravo !', text: `${recipient === 'votre correcteur' ? 'Votre correcteur' : 'Votre professeur'} a validé votre travail. Relisez son retour pour garder ce qui a marché.` }
    : redo
      ? { tone: 'is-redo', icon: <RotateCcw size={24} />, title: 'Mission à reprendre', text: 'Lisez le retour, puis reprenez la mission : votre texte précédent est repris dans le nouveau brouillon.' }
      : mission.status === 'sent'
        ? { tone: 'is-sent', icon: <CheckCircle2 size={24} />, title: 'Mission enregistrée', text: 'Vous apprenez en autonomie : aucun professeur ne corrige cette mission. Relisez-vous avec la liste de vérification, et refaites-la quand vous voulez.' }
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
          <div className="ms-recall-body">{intro}</div>
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
            {definition.checklist.map((item, index) => (
              <label key={index} className={`ms-check${checked.includes(index) ? ' is-checked' : ''}`}>
                <input type="checkbox" checked={checked.includes(index)} onChange={() => toggle(index)} />
                <span className="ms-check-box" aria-hidden="true"><Check size={14} strokeWidth={3} /></span>
                <span className="ms-check-text">{item}</span>
              </label>
            ))}
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
                <div className="ms-recall-body"><LessonContent text={mission.definition.description} compact /></div>
              </details>
            )}
            <MissionWork mission={mission} viewer={viewer} />
          </div>
        )}
    </Drawer>
  );
}
