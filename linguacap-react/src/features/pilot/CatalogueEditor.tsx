import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { Link, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import {
  Archive, ArrowDown, ArrowLeft, ArrowUp, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, CircleAlert, CopyPlus, Eye,
  GraduationCap, Info, Layers, Library, Pencil, PenLine, Plus, RefreshCw, Save, Send, Settings2, Stethoscope,
} from 'lucide-react';
import { Badge, EmptyState, StatCard } from '../../components/ui';
import { Callout, Drawer, Segmented, Skeleton, SkeletonCard, TabPanel, Tabs, Timeline, useToast } from '../../design/kit';
import { requestApi } from '../../integration/api';
import {
  countWords, questionTypeOf, type DictationSpec, type FillSpec, type MatchSpec, type OrderSpec, type QuestionItem, type QuestionView,
  type SpeakSpec,
} from '../../integration/v4';
import { ExerciseActivity, LessonActivity, type ActivityDetail, type Placement } from './LearnerSession';
import { MissionActivity } from './study-mission';
import type { Asset, MediaFile } from './MediaLibrary';
import {
  ActivityEditor, AssessmentsEditor, DiagnosticEditor, EditorContext, IssueFlag, KindTile, ModuleEditor, SettingsEditor, formatMinutes,
  issueCount, kinds, move, newActivity, replaceAt, uniqueId, withBlankDefaults,
  type Assessment, type Checks, type Content, type DraftActivity, type DraftQuestion, type Kind, type Status, type VersionDoc,
} from './editor-forms';
import { ConfirmDialog, IconAction } from './editor-parts';
import './editor.css';

interface VersionSummary { id: string; number: number; status: Status; publishedAt: string | null; retiredAt: string | null; updatedAt: string | null }
interface CatalogueLevel {
  id: string; code: string; title: string; description: string | null; position: number | null; status: 'draft' | 'published';
  prerequisiteLevelId: string | null; prerequisiteLevelCode: string | null; versions: VersionSummary[];
}

const statusLabel: Record<Status, { label: string; tone: 'amber' | 'green' | 'neutral' }> = {
  draft: { label: 'Brouillon', tone: 'amber' }, published: { label: 'Publiée', tone: 'green' }, retired: { label: 'Retirée', tone: 'neutral' },
};
const dateFormat = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
const timeFormat = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

function getError(error: unknown) {
  return error instanceof Error ? error.message : 'Cette action est temporairement indisponible.';
}

function useCompact() {
  const query = '(max-width: 980px)';
  const [compact, setCompact] = useState(() => typeof window !== 'undefined' && window.matchMedia(query).matches);
  useEffect(() => {
    const list = window.matchMedia(query);
    const update = () => setCompact(list.matches);
    list.addEventListener('change', update);
    return () => list.removeEventListener('change', update);
  }, []);
  return compact;
}

/** Ordre stable « mélangé » pour l'aperçu (jamais celui de la solution quand c'est possible). */
function shuffled<T extends QuestionItem>(items: T[], seed: string, solution: string[]): T[] {
  const hash = (value: string) => [...value].reduce((total, char) => (Math.imul(total, 31) + char.charCodeAt(0)) >>> 0, 7);
  const ordered = [...items].sort((a, b) => hash(`${seed}|${a.id}`) - hash(`${seed}|${b.id}`));
  if (ordered.length > 1 && ordered.map((item) => item.text).join('\u0000') === solution.join('\u0000')) ordered.push(ordered.shift() as T);
  return ordered;
}

/**
 * Vue élève d'une question du brouillon, comme la sert le catalogue : sans corrigé, jetons et éléments à associer
 * dans un ordre mélangé, nombre de mots d'une dictée seulement s'il est affiché.
 */
function previewQuestion(question: DraftQuestion, activityId: string): QuestionView {
  const type = questionTypeOf(question);
  const base = { id: question.id, prompt: question.prompt };
  switch (type) {
    case 'fill': {
      const spec = (question.spec ?? { text: '', blanks: [] }) as FillSpec;
      return { ...base, type, text: spec.text, blanks: spec.blanks.map(withBlankDefaults).map((blank) => ({ id: blank.id, size: blank.size, hint: blank.hint })) };
    }
    case 'order': {
      const answer = ((question.spec ?? { answers: [[]] }) as OrderSpec).answers[0] ?? [];
      const tokens = answer.map((text, index) => ({ id: `k${index}`, text }));
      return { ...base, type, tokens: shuffled(tokens, `${activityId}|${question.id}`, answer) };
    }
    case 'match': {
      const pairs = ((question.spec ?? { pairs: [] }) as MatchSpec).pairs;
      const right = pairs.map((pair, index) => ({ id: `r${index}`, text: pair.right }));
      return { ...base, type, left: pairs.map((pair, index) => ({ id: `l${index}`, text: pair.left })), right: shuffled(right, `${activityId}|${question.id}`, pairs.map((pair) => pair.right)) };
    }
    case 'dictation': {
      const spec = (question.spec ?? { accept: [''], showWordCount: false }) as DictationSpec;
      return { ...base, type, wordCount: spec.showWordCount ? countWords(spec.accept[0] ?? '') : null };
    }
    case 'speak': {
      const spec = (question.spec ?? { text: '', accept: [], threshold: 80 }) as SpeakSpec;
      return { ...base, type, text: spec.text, threshold: spec.threshold };
    }
    default:
      return { ...base, type: 'choice', options: question.options.map((option) => ({ id: option.id, text: option.label })) };
  }
}

/** Aperçu dans le lecteur élève, avec les fichiers de la version choisie (brouillons compris). */
function ActivityPreview({ activities, initial, token, onClose }: { activities: DraftActivity[]; initial: DraftActivity; token: string; onClose: () => void }) {
  const [current, setCurrent] = useState(initial);
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [resolved, setResolved] = useState<{ activity: DraftActivity; placements: Placement[] } | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    Promise.all(current.placements.map(async (placement, index): Promise<Placement> => {
      const file = await requestApi<MediaFile>(`/media/${encodeURIComponent(placement.assetId)}/versions/${placement.assetVersion}`, token)
        .catch(() => null);
      return { ...placement, position: index + 1, url: file?.url ?? null };
    })).then((placements) => { if (active) setResolved({ activity: current, placements }); });
    return () => { active = false; };
  }, [current, token, attempt]);

  const position = activities.findIndex((activity) => activity.id === current.id);
  const graded = current.kind === 'exercise' || current.kind === 'assessment';
  const audio = current.placements.some((placement) => placement.usage === 'audio' && placement.transcriptVisibility === 'on_demand');
  const placements = resolved?.activity === current ? resolved.placements : null;
  const detail: ActivityDetail | null = placements && {
    id: current.id, kind: current.kind, title: current.title, estimatedMinutes: current.estimatedMinutes, status: 'todo', state: {},
    attemptId: null, lesson: current.lesson ? { id: 'apercu', title: current.lesson.title, description: current.lesson.description } : null,
    transcript: audio ? current.lesson?.transcript ?? null : null,
    questions: current.questions.map((question) => previewQuestion(question, current.id)),
    placements, mission: current.mission ?? null, contentVersionId: null, contentActivityId: current.id,
  };
  const renew = () => setAttempt((value) => value + 1);
  const go = (offset: number) => { const next = activities[position + offset]; if (next) setCurrent(next); };
  return (
    <Drawer wide title={`Aperçu élève · ${current.title || current.id}`} onClose={onClose}
      description={`${kinds[current.kind].label} · ${current.estimatedMinutes} min · tel que l’élève le verra`}
      footer={activities.length > 1 && position >= 0 ? (
        <div className="ed-preview-nav">
          <button type="button" className="btn btn-ghost" disabled={position <= 0} onClick={() => go(-1)}><ChevronLeft size={17} aria-hidden="true" /> Précédente</button>
          <span>{position + 1} / {activities.length}</span>
          <button type="button" className="btn btn-secondary" disabled={position >= activities.length - 1} onClick={() => go(1)}>Suivante <ChevronRight size={17} aria-hidden="true" /></button>
        </div>
      ) : undefined}>
      <div className="ed-preview-toolbar">
        <Segmented label="Format d’affichage" value={device} onChange={setDevice}
          options={[{ value: 'desktop', label: 'Ordinateur' }, { value: 'mobile', label: 'Téléphone' }]} />
        <span className="ed-preview-note"><Info size={15} aria-hidden="true" /> Remise et correction désactivées</span>
      </div>
      <div className={`ed-device is-${device}`}>
        <div className="ed-device-screen pilot-session">
          <header className="ed-device-head">
            <KindTile kind={current.kind} />
            <div><small>{kinds[current.kind].label} · {current.estimatedMinutes} min</small><h3>{current.lesson?.title || current.title || current.id}</h3></div>
          </header>
          {!detail ? <SkeletonCard lines={4} label="Préparation de l’aperçu…" />
            : current.kind === 'mission'
              ? <MissionActivity key={current.id} activity={detail} token={token} preview onSubmitted={() => undefined} onRenew={renew} />
            : graded
              ? <ExerciseActivity key={current.id} activity={detail} sessionId="apercu" token={token} grade={null} onRenew={renew} preview
                  onSaveState={() => undefined} onGraded={async () => undefined} />
              : <LessonActivity key={current.id} activity={detail} onRenew={renew} busy={false} onComplete={() => undefined} preview />}
        </div>
      </div>
    </Drawer>
  );
}

type Tab = 'settings' | 'modules' | 'diagnostic' | 'assessments';
const plurals: Record<Kind, string> = { lesson: 'leçons', exercise: 'exercices', review: 'révisions', assessment: 'évaluations', mission: 'missions' };

/** Contrôle de publication : état de la version et points à compléter, chacun ouvrant l'endroit à corriger. */
function PublicationCard({ version, checks, dirty, describe, onIssue, children }: {
  version: VersionDoc; checks: Checks | null; dirty: boolean; describe: (path: string) => { label: string; icon: ReactNode }; onIssue: (path: string) => void;
  children?: ReactNode;
}) {
  const [expanded, setExpanded] = useState(false);
  const titleId = useId();
  let tone: 'success' | 'warning' | 'neutral' = 'neutral';
  let icon: ReactNode = <Archive size={22} aria-hidden="true" />;
  let title = '';
  let text: ReactNode = '';
  const issues = version.status === 'draft' ? checks?.issues ?? [] : [];
  if (version.status === 'published') {
    tone = 'success';
    icon = <CheckCircle2 size={22} aria-hidden="true" />;
    title = 'Version publiée';
    text = version.publishedAt ? `Proposée aux nouvelles attributions depuis le ${dateFormat.format(new Date(version.publishedAt))}.` : 'Proposée aux nouvelles attributions.';
  } else if (version.status === 'retired') {
    title = 'Version retirée';
    text = 'Elle n’est plus proposée ; les élèves inscrits la conservent.';
  } else if (!checks) {
    title = 'Contrôle en cours…';
  } else if (checks.publishable) {
    tone = 'success';
    icon = <CheckCircle2 size={22} aria-hidden="true" />;
    title = 'Prête à publier';
    text = dirty ? 'Enregistrez vos modifications pour actualiser les contrôles de publication.' : 'Tous les contrôles sont validés.';
  } else {
    tone = 'warning';
    icon = <CircleAlert size={22} aria-hidden="true" />;
    title = `${checks.issues.length} point${checks.issues.length > 1 ? 's' : ''} à compléter`;
    text = dirty ? 'Contrôles du dernier enregistrement. Ouvrez un point pour le corriger.' : 'Ouvrez un point pour le corriger dans l’éditeur.';
  }
  const limit = 3;
  const shown = expanded ? issues : issues.slice(0, limit);
  return (
    <section className={`ed-publication is-${tone}`} aria-labelledby={titleId}>
      <header>
        <span className="ed-publication-icon">{icon}</span>
        <div><p className="ed-overline">Contrôle de publication</p><h3 id={titleId}>{title}</h3></div>
      </header>
      {text && <p className="ed-publication-text">{text}</p>}
      {children}
      {issues.length > 0 && (
        <ol className="ed-issues lc-stagger" aria-label="Points à compléter avant publication">
          {shown.map((issue, index) => {
            const area = describe(issue.path);
            return (
              <li key={`${issue.path}-${index}`}>
                <button type="button" className="ed-issue" onClick={() => onIssue(issue.path)}>
                  <span className="ed-issue-area">{area.icon}{area.label}</span>
                  <span className="ed-issue-text">{issue.message}</span>
                  <ChevronRight size={16} aria-hidden="true" className="ed-row-chevron" />
                </button>
              </li>
            );
          })}
        </ol>
      )}
      {issues.length > limit && (
        <button type="button" className="text-link ed-issues-more" onClick={() => setExpanded(!expanded)} aria-expanded={expanded}>
          {expanded ? 'Réduire la liste' : issues.length - limit > 1 ? `Afficher les ${issues.length - limit} autres points` : 'Afficher le dernier point'}
          <ChevronDown size={15} aria-hidden="true" className={expanded ? 'is-up' : undefined} />
        </button>
      )}
    </section>
  );
}

/** Plan du parcours : modules repliables et leurs activités, avec type, durée et points à compléter. */
function Plan({ content, selection, onSelect, issues, readOnly, locked, onAddModule, open, onToggle }: {
  content: Content; selection: { module: number; activity: number | null }; onSelect: (module: number, activity: number | null) => void;
  issues: Checks['issues']; readOnly: boolean; locked: boolean; onAddModule: () => void; open: boolean; onToggle: () => void;
}) {
  const [expanded, setExpanded] = useState<Set<number>>(() => new Set([selection.module]));
  const body = useRef<HTMLDivElement>(null);
  useEffect(() => { setExpanded(new Set([selection.module])); }, [selection.module]);
  // Garde l'élément ouvert visible dans le plan (sans faire défiler la page).
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const list = body.current;
      const node = list?.querySelector<HTMLElement>('[aria-current="true"]');
      if (!list || !node) return;
      const top = node.offsetTop - list.offsetTop;
      if (top < list.scrollTop || top + node.offsetHeight > list.scrollTop + list.clientHeight) {
        list.scrollTo({ top: Math.max(0, top - list.clientHeight / 3), behavior: 'smooth' });
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [selection.module, selection.activity, expanded]);
  const activities = content.modules.reduce((sum, module) => sum + module.activities.length, 0);
  const minutes = content.modules.reduce((sum, module) => sum + module.activities.reduce((total, activity) => total + (activity.estimatedMinutes || 0), 0), 0);
  const toggle = (index: number) => setExpanded((current) => {
    const next = new Set(current);
    if (next.has(index)) next.delete(index); else next.add(index);
    return next;
  });
  return (
    <nav className={`ed-plan${open ? '' : ' is-closed'}`} aria-label="Plan du parcours">
      <div className="ed-plan-head">
        <span className="ed-plan-head-icon" aria-hidden="true"><Layers size={17} /></span>
        <div><h3>Plan du parcours</h3><small>{content.modules.length} modules · {activities} activités · {formatMinutes(minutes)}</small></div>
        <button type="button" className="icon-button ed-plan-toggle" aria-expanded={open} onClick={onToggle}
          aria-label={open ? 'Replier le plan du parcours' : 'Déplier le plan du parcours'}><ChevronDown size={18} aria-hidden="true" /></button>
      </div>
      <div className="ed-plan-body" ref={body}>
        {content.modules.length === 0 && <p className="ed-plan-empty">Aucun module pour l’instant.</p>}
        <ol className="ed-plan-tree">
          {content.modules.map((module, index) => {
            const isOpen = expanded.has(index);
            const total = module.activities.reduce((sum, activity) => sum + (activity.estimatedMinutes || 0), 0);
            const current = selection.module === index && selection.activity === null;
            return (
              <li key={index} className={`ed-plan-module${isOpen ? ' is-open' : ''}`}>
                <div className="ed-plan-row">
                  <button type="button" className="ed-plan-caret" aria-expanded={isOpen} onClick={() => toggle(index)}
                    aria-label={`${isOpen ? 'Replier' : 'Déplier'} le module ${index + 1}`}><ChevronRight size={16} aria-hidden="true" /></button>
                  <button type="button" className="ed-plan-node" aria-current={current ? 'true' : undefined} onClick={() => onSelect(index, null)}>
                    <span className="ed-plan-num" aria-hidden="true">{index + 1}</span>
                    <span className="ed-plan-text"><strong>{module.title || module.id}</strong>
                      <small>{module.activities.length} activité{module.activities.length > 1 ? 's' : ''} · {formatMinutes(total)}</small></span>
                    <IssueFlag count={issueCount(issues, `modules[${index}]`)} />
                  </button>
                </div>
                {isOpen && (
                  <ol className="ed-plan-activities">
                    {module.activities.map((activity, position) => (
                      <li key={position}>
                        <button type="button" className="ed-plan-node is-activity" onClick={() => onSelect(index, position)}
                          aria-current={selection.module === index && selection.activity === position ? 'true' : undefined}>
                          <KindTile kind={activity.kind} size="sm" />
                          <span className="ed-plan-text"><strong>{activity.title || activity.id}</strong></span>
                          <IssueFlag count={issueCount(issues, `modules[${index}].activities[${position}]`)} />
                          <small className="ed-plan-min">{activity.estimatedMinutes} min</small>
                        </button>
                      </li>
                    ))}
                    {module.activities.length === 0 && <li className="ed-plan-empty">Aucune activité</li>}
                  </ol>
                )}
              </li>
            );
          })}
        </ol>
        {!readOnly && <button type="button" className="ed-plan-add" onClick={onAddModule} disabled={locked}><Plus size={16} aria-hidden="true" /> Ajouter un module</button>}
      </div>
    </nav>
  );
}

function EditorSkeleton() {
  return (
    <div className="ed-editor" role="status" aria-label="Chargement de la version…">
      <div className="ed-top"><SkeletonCard lines={4} label="Chargement de la version…" /><SkeletonCard lines={3} label="Chargement des contrôles…" /></div>
      <Skeleton height={44} radius={12} />
      <div className="ed-modules"><SkeletonCard lines={8} /><SkeletonCard lines={6} /></div>
    </div>
  );
}

/** Éditeur d'une version : un brouillon s'enregistre d'un bloc et se reprend ; une version publiée se consulte. */
function VersionEditor({ token }: { token: string }) {
  const { versionId = '' } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const compact = useCompact();
  const [version, setVersion] = useState<VersionDoc | null>(null);
  const [content, setContent] = useState<Content | null>(null);
  const [checks, setChecks] = useState<Checks | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');
  const [dirty, setDirty] = useState(false);
  const [preview, setPreview] = useState<DraftActivity | null>(null);
  const [previewId, setPreviewId] = useState('');
  const [tab, setTab] = useState<Tab>('modules');
  const [selection, setSelection] = useState<{ module: number; activity: number | null }>({ module: 0, activity: 0 });
  const [assessmentKind, setAssessmentKind] = useState<Assessment['kind']>('midterm');
  const [planOpen, setPlanOpen] = useState(() => typeof window === 'undefined' || !window.matchMedia('(max-width: 980px)').matches);
  const [focusPath, setFocusPath] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<'publish' | 'retire' | null>(null);
  const stage = useRef<HTMLDivElement>(null);
  const saveRef = useRef<() => void>(() => undefined);
  const id = encodeURIComponent(versionId);

  useEffect(() => {
    let active = true;
    setError('');
    Promise.all([
      requestApi<VersionDoc>(`/catalogue/versions/${id}`, token),
      requestApi<Checks>(`/catalogue/versions/${id}/checks`, token),
      requestApi<Asset[]>('/media', token).catch(() => [] as Asset[]),
    ]).then(([document, verified, media]) => {
      if (!active) return;
      setVersion(document);
      setContent({ settings: document.settings, diagnostic: document.diagnostic, modules: document.modules, assessments: document.assessments });
      setChecks(verified);
      setAssets(media);
      setDirty(false);
      setSelection({ module: 0, activity: document.modules[0]?.activities.length ? 0 : null });
      setPreviewId(document.modules[0]?.activities[0]?.id ?? '');
    }).catch((failure: unknown) => { if (active) setError(getError(failure)); });
    return () => { active = false; };
  }, [id, token]);

  // Ctrl + S enregistre ; quitter la page avec des modifications non enregistrées demande confirmation.
  useEffect(() => {
    const keydown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') { event.preventDefault(); saveRef.current(); }
    };
    window.addEventListener('keydown', keydown);
    return () => window.removeEventListener('keydown', keydown);
  }, []);
  useEffect(() => {
    if (!dirty) return;
    const leave = (event: BeforeUnloadEvent) => { event.preventDefault(); };
    window.addEventListener('beforeunload', leave);
    return () => window.removeEventListener('beforeunload', leave);
  }, [dirty]);

  // Point à compléter ouvert : ouvre la section, fait défiler jusqu'au champ et le met en évidence.
  useEffect(() => {
    if (!focusPath) return;
    const frame = requestAnimationFrame(() => {
      let path = focusPath;
      let target: HTMLElement | null = null;
      while (path && !target) {
        target = document.querySelector<HTMLElement>(`.ed-editor [data-path="${CSS.escape(path)}"]`);
        if (target) break;
        const shorter = path.replace(/(\.[^.[\]]+|\[\d+\])$/, '');
        if (shorter === path) break;
        path = shorter;
      }
      setFocusPath(null);
      if (!target) return;
      for (let details = target.closest('details'); details; details = details.parentElement?.closest('details') ?? null) details.open = true;
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      target.querySelector<HTMLElement>('input:not([type="hidden"]):not(:disabled), textarea:not(:disabled), select:not(:disabled)')?.focus({ preventScroll: true });
      const flashed = target;
      flashed.classList.remove('is-flash');
      void flashed.offsetWidth;
      flashed.classList.add('is-flash');
      window.setTimeout(() => flashed.classList.remove('is-flash'), 1800);
    });
    return () => cancelAnimationFrame(frame);
  }, [focusPath, tab, selection]);

  if (error && !version) {
    return (
      <div className="ed-load-error">
        <Callout tone="warning" title="Cette version ne peut pas être ouverte"><p role="alert">{error}</p></Callout>
        <Link className="btn btn-secondary" to="/espace/catalogue"><ArrowLeft size={16} aria-hidden="true" /> Retour au catalogue</Link>
      </div>
    );
  }
  if (!version || !content) return <EditorSkeleton />;

  const readOnly = version.status !== 'draft';
  const locked = readOnly || busy !== '';
  const issues = readOnly ? [] : checks?.issues ?? [];
  const activities = content.modules.flatMap((module) => module.activities);
  const minutes = activities.reduce((sum, activity) => sum + (activity.estimatedMinutes || 0), 0);
  const supports = activities.reduce((sum, activity) => sum + activity.placements.length, 0);
  const composition = (Object.keys(kinds) as Kind[]).map((kind) => ({ kind, count: activities.filter((activity) => activity.kind === kind).length }))
    .filter((item) => item.count > 0);
  const change = (value: Partial<Content>) => { setContent({ ...content, ...value }); setDirty(true); };
  const moduleIndex = Math.min(selection.module, content.modules.length - 1);
  const currentModule = content.modules[moduleIndex];
  const activityIndex = currentModule && selection.activity !== null && selection.activity < currentModule.activities.length ? selection.activity : null;
  const currentActivity = activityIndex !== null ? currentModule?.activities[activityIndex] : undefined;

  function select(module: number, activity: number | null) {
    setSelection({ module, activity });
    const target = activity !== null ? content?.modules[module]?.activities[activity] : undefined;
    if (target) setPreviewId(target.id);
    if (compact) {
      setPlanOpen(false);
      requestAnimationFrame(() => stage.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
    }
  }

  function describe(path: string): { label: string; icon: ReactNode } {
    if (path.startsWith('settings')) return { label: 'Réglages', icon: <Settings2 size={13} aria-hidden="true" /> };
    if (path.startsWith('diagnostic')) return { label: 'Diagnostic', icon: <Stethoscope size={13} aria-hidden="true" /> };
    const assessment = /^assessments\[(\d+)\]/.exec(path);
    if (assessment) {
      const kind = content?.assessments[Number(assessment[1])]?.kind;
      return { label: kind === 'final' ? 'Examen blanc' : 'Bilan intermédiaire', icon: <GraduationCap size={13} aria-hidden="true" /> };
    }
    const module = /^modules\[(\d+)\](?:\.activities\[(\d+)\])?/.exec(path);
    if (module) return { label: `Module ${Number(module[1]) + 1}${module[2] !== undefined ? ` · activité ${Number(module[2]) + 1}` : ''}`, icon: <Layers size={13} aria-hidden="true" /> };
    return { label: 'Modules', icon: <Layers size={13} aria-hidden="true" /> };
  }

  function goTo(path: string) {
    if (path.startsWith('settings')) setTab('settings');
    else if (path.startsWith('diagnostic')) setTab('diagnostic');
    else if (path.startsWith('assessments')) {
      const kind = content?.assessments[Number(/^assessments\[(\d+)\]/.exec(path)?.[1] ?? 0)]?.kind;
      if (kind) setAssessmentKind(kind);
      setTab('assessments');
    } else {
      const match = /^modules\[(\d+)\](?:\.activities\[(\d+)\])?/.exec(path);
      setTab('modules');
      if (match) select(Number(match[1]), match[2] !== undefined ? Number(match[2]) : null);
    }
    setFocusPath(path);
  }

  async function run(label: string, action: () => Promise<void>) {
    setBusy(label);
    try {
      await action();
    } catch (failure) {
      toast(getError(failure), 'warning');
    } finally {
      setBusy('');
    }
  }

  const save = () => run('save', async () => {
    const saved = await requestApi<{ version: VersionDoc; checks: Checks }>(`/catalogue/versions/${id}`, token, {
      method: 'PUT', body: content,
    });
    setVersion(saved.version);
    setContent({ settings: saved.version.settings, diagnostic: saved.version.diagnostic, modules: saved.version.modules, assessments: saved.version.assessments });
    setChecks(saved.checks);
    setDirty(false);
    toast(saved.checks.publishable ? 'Brouillon enregistré : il est prêt à être publié.' : 'Brouillon enregistré. Vous pourrez le reprendre plus tard.');
  });
  saveRef.current = () => { if (!readOnly && dirty && !busy) void save(); };

  const publish = () => run('publish', async () => {
    if (dirty) {
      const saved = await requestApi<{ version: VersionDoc; checks: Checks }>(`/catalogue/versions/${id}`, token, { method: 'PUT', body: content });
      setChecks(saved.checks);
      setDirty(false);
      if (!saved.checks.publishable) throw new Error('Le brouillon est enregistré, mais des points restent à compléter avant la publication.');
    }
    const published = await requestApi<{ version: VersionSummary; media: { assetId: string; version: number }[] }>(`/catalogue/versions/${id}/publish`, token, { method: 'POST' });
    setVersion({ ...version, status: published.version.status, publishedAt: published.version.publishedAt });
    toast(`Version ${version.number} publiée${published.media.length ? ` avec ${published.media.length} fichier${published.media.length > 1 ? 's' : ''}` : ''} : elle est proposée aux nouvelles attributions.`);
  });

  const retire = () => run('retire', async () => {
    const retired = await requestApi<VersionSummary>(`/catalogue/versions/${id}/retire`, token, { method: 'POST' });
    setVersion({ ...version, status: retired.status });
    toast('Version retirée des nouvelles attributions. Les élèves inscrits gardent leur version.');
  });

  const copy = () => run('copy', async () => {
    const draft = await requestApi<VersionDoc>(`/catalogue/levels/${encodeURIComponent(version.levelId)}/versions`, token, {
      method: 'POST', body: { fromVersionId: version.id },
    });
    navigate(`/espace/catalogue/versions/${draft.id}`);
  });

  const setAssessment = (kind: Assessment['kind'], value: Assessment | undefined) => change({
    assessments: [...content.assessments.filter((item) => item.kind !== kind), ...(value ? [value] : [])]
      .sort((a, b) => (a.kind === 'midterm' ? 0 : 1) - (b.kind === 'midterm' ? 0 : 1)),
  });

  function addModule() {
    if (!content) return;
    change({
      modules: [...content.modules, {
        id: uniqueId(`module-${content.modules.length + 1}`, content.modules.map((module) => module.id)), title: '', objective: '',
        prerequisites: [], activities: [],
      }],
    });
    setTab('modules');
    select(content.modules.length, null);
  }

  function addActivity(index: number, kind: Kind) {
    const module = content?.modules[index];
    if (!content || !module) return;
    const created = newActivity(kind, module.id, content.modules.flatMap((item) => item.activities.map((activity) => activity.id)));
    change({ modules: replaceAt(content.modules, index, { ...module, activities: [...module.activities, created] }) });
    select(index, module.activities.length);
  }

  const saveState = busy === 'save' ? { tone: 'busy', title: 'Enregistrement…', short: 'En cours…', note: 'Gardez la page ouverte.' }
    : busy === 'publish' ? { tone: 'busy', title: 'Publication…', short: 'En cours…', note: 'Gardez la page ouverte.' }
    : version.status === 'published' ? { tone: 'published', title: 'Version publiée', short: 'Publiée', note: 'Lecture seule' }
    : version.status === 'retired' ? { tone: 'retired', title: 'Version retirée', short: 'Retirée', note: 'Lecture seule' }
    : dirty ? { tone: 'dirty', title: 'Modifications non enregistrées', short: 'Non enregistré', note: 'Ctrl + S pour enregistrer' }
    : { tone: 'saved', title: 'Brouillon enregistré', short: 'Enregistré', note: version.updatedAt ? `le ${timeFormat.format(new Date(version.updatedAt))}` : 'Aucune modification' };

  const tabs = [
    { id: 'settings', label: 'Réglages', icon: <Settings2 size={16} aria-hidden="true" /> },
    { id: 'modules', label: 'Modules', icon: <Layers size={16} aria-hidden="true" />, count: content.modules.length },
    { id: 'diagnostic', label: 'Diagnostic', icon: <Stethoscope size={16} aria-hidden="true" />, count: content.diagnostic?.questions.length },
    { id: 'assessments', label: 'Évaluations', icon: <GraduationCap size={16} aria-hidden="true" />, count: content.assessments.length },
  ];

  return (
    <EditorContext.Provider value={{ readOnly, locked, assets, token, issues, onPreview: setPreview }}>
      <div className={`ed-editor lc-enter${readOnly ? ' is-readonly' : ''}`}>
        <div className="ed-top">
          <div className="ed-top-main">
            <section className="kit-card ed-hero" aria-labelledby="version-title">
              <Link className="ed-back" to="/espace/catalogue"><ArrowLeft size={16} aria-hidden="true" /> Catalogue</Link>
              <div className="ed-hero-title">
                <span className="ed-code-tile is-lg" aria-hidden="true">{version.levelCode}</span>
                <div>
                  <h2 id="version-title">{version.levelCode} · version {version.number}</h2>
                  <p>{version.levelTitle}{version.updatedAt ? ` · modifiée le ${dateFormat.format(new Date(version.updatedAt))}` : ''}</p>
                </div>
                <Badge tone={statusLabel[version.status].tone}>{statusLabel[version.status].label}</Badge>
              </div>
              <div className="ed-hero-foot">
                <dl className="ed-stats">
                  <div><dt>Modules</dt><dd>{content.modules.length}</dd></div>
                  <div><dt>Activités</dt><dd>{activities.length}</dd></div>
                  <div><dt>Durée</dt><dd>{formatMinutes(minutes)}</dd></div>
                  <div><dt>Médias</dt><dd>{supports}</dd></div>
                </dl>
                {composition.length > 0 && (
                  <div className="ed-composition">
                    <div className="ed-composition-bar" role="img"
                      aria-label={`Répartition des activités : ${composition.map((item) => `${item.count} ${plurals[item.kind]}`).join(', ')}`}>
                      {composition.map((item) => <span key={item.kind} className={`is-${item.kind}`} style={{ flexGrow: item.count }} />)}
                    </div>
                    <ul className="ed-composition-legend" aria-hidden="true">
                      {composition.map((item) => <li key={item.kind} className={`is-${item.kind}`}><i />{kinds[item.kind].label}<b>{item.count}</b></li>)}
                    </ul>
                  </div>
                )}
              </div>
            </section>
            {activities.length > 0 && (
              <section className="kit-card ed-preview-card" aria-label="Aperçu élève">
                <span className="ed-preview-icon" aria-hidden="true"><Eye size={20} /></span>
                <label className="field">Activité à prévisualiser<select value={previewId} onChange={(event) => setPreviewId(event.target.value)}>
                  {content.modules.map((module, index) => module.activities.length > 0 && (
                    <optgroup key={index} label={`Module ${index + 1} · ${module.title || module.id}`}>
                      {module.activities.map((activity) => <option key={activity.id} value={activity.id}>{activity.title || activity.id}</option>)}
                    </optgroup>
                  ))}
                </select></label>
                <button type="button" className="btn btn-soft"
                  onClick={() => setPreview(activities.find((activity) => activity.id === previewId) ?? activities[0])}>
                  <Eye size={17} aria-hidden="true" /> Ouvrir l’aperçu élève</button>
              </section>
            )}
          </div>
          <PublicationCard version={version} checks={checks} dirty={dirty} describe={describe} onIssue={goTo}>
            {readOnly && <Callout tone="info">Cette version est figée : contenus, corrigés et versions des fichiers ne changent plus. Créez un brouillon à partir d’elle pour la faire évoluer.</Callout>}
          </PublicationCard>
        </div>

        <Tabs label="Parties de la version" idPrefix="version" value={tab} onChange={(value) => setTab(value as Tab)} tabs={tabs} />
        <TabPanel id={tab} idPrefix="version">
          {tab === 'settings' && <SettingsEditor settings={content.settings} onChange={(settings) => change({ settings })} />}
          {tab === 'modules' && (
            <div className="ed-modules">
              <Plan content={content} selection={{ module: moduleIndex, activity: activityIndex }} onSelect={select} issues={issues} readOnly={readOnly}
                locked={locked} onAddModule={addModule} open={planOpen} onToggle={() => setPlanOpen(!planOpen)} />
              <div className="ed-stage" ref={stage}>
                {!currentModule ? (
                  <div className="ed-empty-card">
                    <EmptyState icon={<Layers size={26} />} title="Aucun module" description="Ajoutez un premier module pour structurer le parcours."
                      action={readOnly ? undefined : <button type="button" className="btn btn-primary" onClick={addModule} disabled={locked}><Plus size={16} aria-hidden="true" /> Ajouter un module</button>} />
                  </div>
                ) : currentActivity && activityIndex !== null ? (
                  <ActivityEditor key={`${moduleIndex}-${activityIndex}`} activity={currentActivity} path={`modules[${moduleIndex}].activities[${activityIndex}]`}
                    moduleLabel={`Module ${moduleIndex + 1} · ${currentModule.title || currentModule.id}`} index={activityIndex} count={currentModule.activities.length}
                    onChange={(value) => change({ modules: replaceAt(content.modules, moduleIndex, { ...currentModule, activities: replaceAt(currentModule.activities, activityIndex, value) }) })}
                    onMove={(offset) => {
                      change({ modules: replaceAt(content.modules, moduleIndex, { ...currentModule, activities: move(currentModule.activities, activityIndex, offset) }) });
                      setSelection({ module: moduleIndex, activity: Math.max(0, Math.min(currentModule.activities.length - 1, activityIndex + offset)) });
                    }}
                    onRemove={() => {
                      change({ modules: replaceAt(content.modules, moduleIndex, { ...currentModule, activities: currentModule.activities.filter((_, position) => position !== activityIndex) }) });
                      setSelection({ module: moduleIndex, activity: null });
                    }} />
                ) : (
                  <ModuleEditor key={moduleIndex} module={currentModule} modules={content.modules} index={moduleIndex} path={`modules[${moduleIndex}]`}
                    onChange={(value) => change({ modules: replaceAt(content.modules, moduleIndex, value) })}
                    onMove={(offset) => {
                      change({ modules: move(content.modules, moduleIndex, offset) });
                      setSelection({ module: Math.max(0, Math.min(content.modules.length - 1, moduleIndex + offset)), activity: null });
                    }}
                    onRemove={() => {
                      change({ modules: content.modules.filter((_, position) => position !== moduleIndex) });
                      setSelection({ module: Math.max(0, moduleIndex - 1), activity: null });
                    }}
                    onOpenActivity={(position) => select(moduleIndex, position)} onAddActivity={(kind) => addActivity(moduleIndex, kind)} />
                )}
              </div>
            </div>
          )}
          {tab === 'diagnostic' && <DiagnosticEditor diagnostic={content.diagnostic} modules={content.modules} levelCode={version.levelCode}
            onChange={(diagnostic) => change({ diagnostic })} />}
          {tab === 'assessments' && <AssessmentsEditor assessments={content.assessments} kind={assessmentKind} onKind={setAssessmentKind} onChange={setAssessment} />}
        </TabPanel>

        <div className={`ed-actionbar is-${saveState.tone}`} role="region" aria-label="Enregistrement et publication">
          <div className="ed-savestate" role="status">
            <span className="ed-savestate-dot" aria-hidden="true" />
            <span><strong><span className="ed-hide-sm">{saveState.title}</span><span className="ed-show-sm">{saveState.short}</span></strong><small>{saveState.note}</small></span>
          </div>
          <div className="ed-actionbar-buttons">
            {version.status === 'draft' && (
              <>
                <button type="button" className="btn btn-secondary" onClick={() => void save()} disabled={busy !== '' || !dirty}>
                  <Save size={17} aria-hidden="true" /> {busy === 'save' ? 'Enregistrement…' : 'Enregistrer'}
                </button>
                <button type="button" className="btn btn-primary" onClick={() => setConfirm('publish')} disabled={busy !== ''}>
                  <Send size={17} aria-hidden="true" /> {busy === 'publish' ? 'Publication…' : 'Publier'}
                </button>
              </>
            )}
            {version.status === 'published' && (
              <button type="button" className="btn btn-ghost" onClick={() => setConfirm('retire')} disabled={busy !== ''}>
                <Archive size={17} aria-hidden="true" /> <span className="ed-hide-sm">Retirer des attributions</span><span className="ed-show-sm">Retirer</span>
              </button>
            )}
            {readOnly && (
              <button type="button" className="btn btn-primary" onClick={() => void copy()} disabled={busy !== ''} aria-label="Nouveau brouillon à partir de cette version">
                <CopyPlus size={17} aria-hidden="true" /> Nouveau brouillon
              </button>
            )}
          </div>
        </div>

        {confirm === 'publish' && (
          <ConfirmDialog title={`Publier la version ${version.number} ?`} confirm="Publier" onConfirm={() => void publish()} onClose={() => setConfirm(null)}>
            <p>Elle sera proposée aux nouvelles attributions du niveau {version.levelCode}. Ses contenus, corrigés et fichiers seront ensuite figés.</p>
            {dirty && <p>Vos modifications seront d’abord enregistrées.</p>}
            {checks && !checks.publishable && !dirty && <Callout tone="warning">{checks.issues.length} point{checks.issues.length > 1 ? 's restent' : ' reste'} à compléter : la publication sera refusée.</Callout>}
          </ConfirmDialog>
        )}
        {confirm === 'retire' && (
          <ConfirmDialog title="Retirer cette version ?" confirm="Retirer" tone="danger" onConfirm={() => void retire()} onClose={() => setConfirm(null)}>
            <p>Elle ne sera plus proposée aux nouvelles attributions. Les élèves inscrits gardent leur version.</p>
          </ConfirmDialog>
        )}
        {preview && <ActivityPreview activities={activities} initial={preview} token={token} onClose={() => setPreview(null)} />}
      </div>
    </EditorContext.Provider>
  );
}

function LevelDrawer({ level, levels, token, onClose, onDone }: {
  level: CatalogueLevel; levels: CatalogueLevel[]; token: string; onClose: () => void; onDone: (levels: CatalogueLevel[]) => void;
}) {
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const formId = useId();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const read = (key: string) => String(form.get(key) ?? '').trim();
    setBusy(true);
    setError('');
    try {
      onDone(await requestApi<CatalogueLevel[]>(`/catalogue/levels/${encodeURIComponent(level.id)}`, token, {
        method: 'PUT',
        body: { title: read('title'), description: read('description'), position: read('position') ? Number(read('position')) : null,
          prerequisiteLevelId: read('prerequisite') || null },
      }));
    } catch (failure) {
      setError(getError(failure));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Drawer title={`Modifier le niveau ${level.code}`} description="Titre, présentation, ordre dans le catalogue et niveau prérequis." onClose={onClose}
      footer={<div className="ed-drawer-actions">
        <button type="button" className="btn btn-ghost" onClick={onClose}>Annuler</button>
        <button type="submit" form={formId} className="btn btn-primary" disabled={busy}>{busy ? 'Enregistrement…' : 'Enregistrer'}</button>
      </div>}>
      <form id={formId} className="ed-fields" onSubmit={submit}>
        <div className="ed-drawer-hero"><span className="ed-code-tile is-lg" aria-hidden="true">{level.code}</span><p>Les versions déjà publiées ne changent pas ; ces informations s’affichent dans le catalogue.</p></div>
        <label>Titre<input name="title" required maxLength={120} defaultValue={level.title} /></label>
        <label>Description<textarea name="description" rows={4} maxLength={2000} defaultValue={level.description ?? ''} /></label>
        <div className="ed-grid-2">
          <label>Position<input name="position" type="number" min={1} max={50} defaultValue={level.position ?? ''} /></label>
          <label>Niveau prérequis<select name="prerequisite" defaultValue={level.prerequisiteLevelId ?? ''}>
            <option value="">Aucun</option>
            {levels.filter((item) => item.id !== level.id).map((item) => <option key={item.id} value={item.id}>{item.code} · {item.title}</option>)}
          </select></label>
        </div>
        {error && <Callout tone="warning"><p role="alert">{error}</p></Callout>}
      </form>
    </Drawer>
  );
}

function CreateLevelDrawer({ token, onClose, onCreate }: { token: string; onClose: () => void; onCreate: (code: string) => void }) {
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [code, setCode] = useState('');
  const formId = useId();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const read = (key: string) => String(form.get(key) ?? '').trim();
    setBusy(true);
    setError('');
    try {
      const level = await requestApi<{ code: string }>('/levels', token, {
        method: 'POST', body: { code: read('code').toUpperCase(), title: read('title'), description: read('description') },
      });
      onCreate(level.code);
    } catch (failure) {
      setError(getError(failure));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Drawer title="Créer un niveau" description="Un niveau du CECRL, puis son parcours en versions successives." onClose={onClose}
      footer={<div className="ed-drawer-actions">
        <button type="button" className="btn btn-ghost" onClick={onClose}>Annuler</button>
        <button type="submit" form={formId} className="btn btn-primary" disabled={busy}>{busy ? 'Création…' : 'Créer le niveau'}</button>
      </div>}>
      <form id={formId} className="ed-fields" onSubmit={submit}>
        <div className="ed-drawer-hero"><span className="ed-code-tile is-lg" aria-hidden="true">{code.toUpperCase() || '··'}</span><p>Choisissez le code CECRL (A1 à C2) et un titre clair pour les élèves.</p></div>
        <label>Code CECRL<input name="code" required pattern="[ABCabc][12]" placeholder="B2" maxLength={2} value={code} onChange={(event) => setCode(event.target.value)} /></label>
        <label>Titre<input name="title" required maxLength={120} placeholder="Allemand B2" /></label>
        <label>Description<textarea name="description" rows={4} maxLength={2000} /></label>
        {error && <Callout tone="warning"><p role="alert">{error}</p></Callout>}
      </form>
    </Drawer>
  );
}

const versionIcon = { draft: PenLine, published: CheckCircle2, retired: Archive };

function versionMeta(item: VersionSummary) {
  if (item.status === 'published') return item.publishedAt ? `Publiée le ${dateFormat.format(new Date(item.publishedAt))}` : 'Publiée';
  if (item.status === 'retired') return item.retiredAt ? `Retirée le ${dateFormat.format(new Date(item.retiredAt))}` : 'Retirée';
  return item.updatedAt ? `Brouillon modifié le ${dateFormat.format(new Date(item.updatedAt))}` : 'Brouillon';
}

/** Carte d'un niveau : identité, prérequis, version proposée et chronologie des versions. */
function LevelCard({ level, index, count, busy, onMove, onEdit, onDraft }: {
  level: CatalogueLevel; index: number; count: number; busy: boolean; onMove: (offset: number) => void; onEdit: () => void;
  onDraft: (fromVersionId: string | null) => void;
}) {
  const drafted = level.versions.find((item) => item.status === 'draft');
  const published = level.versions.find((item) => item.status === 'published');
  const titleId = `level-${level.id}`;
  return (
    <article className="kit-card ed-level" aria-labelledby={titleId}>
      <header className="ed-level-head">
        <span className="ed-code-tile" aria-hidden="true">{level.code}</span>
        <div className="ed-level-title">
          <h3 id={titleId}>{level.title}</h3>
          <p>{level.description || 'Sans description'}</p>
        </div>
        <div className="ed-tools">
          <IconAction icon={ArrowUp} label={`Monter ${level.code}`} disabled={busy || index === 0} onClick={() => onMove(-1)} />
          <IconAction icon={ArrowDown} label={`Descendre ${level.code}`} disabled={busy || index === count - 1} onClick={() => onMove(1)} />
          <IconAction icon={Pencil} label={`Modifier le niveau ${level.code}`} onClick={onEdit} />
        </div>
      </header>
      <dl className="ed-level-facts">
        <div><dt>Prérequis</dt><dd>{level.prerequisiteLevelCode ?? 'Aucun'}</dd></div>
        <div><dt>Proposée</dt><dd>{published ? `Version ${published.number}` : 'Aucune'}</dd></div>
        <div><dt>Position</dt><dd>{level.position ?? '—'}</dd></div>
      </dl>
      <section className="ed-level-versions" aria-label={`Versions de ${level.code}`}>
        {level.versions.length === 0 ? <p className="ed-muted">Aucune version : créez le parcours de ce niveau.</p> : (
          <Timeline items={level.versions.map((item) => {
            const Icon = versionIcon[item.status];
            return {
              id: item.id,
              tone: item.status === 'published' ? 'success' : item.status === 'draft' ? 'warning' : undefined,
              icon: <Icon size={14} />,
              title: (
                <span className="ed-version-line">
                  <Link className="ed-version-link" to={`/espace/catalogue/versions/${item.id}`} aria-label={`Ouvrir ${level.code} version ${item.number}`}>
                    Version {item.number}<ChevronRight size={15} aria-hidden="true" /></Link>
                  <Badge tone={statusLabel[item.status].tone}>{statusLabel[item.status].label}</Badge>
                </span>
              ),
              meta: versionMeta(item),
            };
          })} />
        )}
      </section>
      <footer className="ed-level-foot">
        {drafted
          ? <Link className="btn btn-primary btn-block" to={`/espace/catalogue/versions/${drafted.id}`}><PenLine size={16} aria-hidden="true" /> Reprendre le brouillon</Link>
          : <button type="button" className="btn btn-secondary btn-block" disabled={busy} onClick={() => onDraft(published?.id ?? null)}>
              <Plus size={16} aria-hidden="true" /> {published ? 'Nouvelle version' : 'Créer le parcours'}</button>}
      </footer>
    </article>
  );
}

/** Niveaux, ordre, prérequis et versions de parcours (DEV-047, DEV-057, DEV-058). */
function LevelsView({ token }: { token: string }) {
  const navigate = useNavigate();
  const toast = useToast();
  const [levels, setLevels] = useState<CatalogueLevel[] | null>(null);
  const [error, setError] = useState('');
  const [refresh, setRefresh] = useState(0);
  const [levelAction, setLevelAction] = useState<'create' | CatalogueLevel | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    requestApi<CatalogueLevel[]>('/catalogue/levels', token).then(
      (data) => { if (active) { setLevels(data); setError(''); } },
      (failure: unknown) => { if (active) setError(getError(failure)); },
    );
    return () => { active = false; };
  }, [token, refresh]);

  async function draft(level: CatalogueLevel, fromVersionId: string | null) {
    setBusy(true);
    try {
      const created = await requestApi<VersionDoc>(`/catalogue/levels/${encodeURIComponent(level.id)}/versions`, token, {
        method: 'POST', body: { fromVersionId },
      });
      navigate(`/espace/catalogue/versions/${created.id}`);
    } catch (failure) {
      toast(getError(failure), 'warning');
      setBusy(false);
    }
  }

  /** Échange la position de deux niveaux voisins ; les niveaux sans position prennent leur rang actuel. */
  async function reorder(index: number, offset: number) {
    if (!levels) return;
    const ordered = move(levels, index, offset);
    setBusy(true);
    try {
      let latest = levels;
      for (const [position, level] of ordered.entries()) {
        if (level.position === position + 1) continue;
        latest = await requestApi<CatalogueLevel[]>(`/catalogue/levels/${encodeURIComponent(level.id)}`, token, {
          method: 'PUT',
          body: { title: level.title, description: level.description ?? '', position: position + 1, prerequisiteLevelId: level.prerequisiteLevelId },
        });
      }
      setLevels(latest);
    } catch (failure) {
      toast(getError(failure), 'warning');
    } finally {
      setBusy(false);
    }
  }

  const all = levels ?? [];
  const publishedCount = all.filter((level) => level.versions.some((item) => item.status === 'published')).length;
  const draftCount = all.filter((level) => level.versions.some((item) => item.status === 'draft')).length;

  return (
    <div className="ed-catalogue lc-enter">
      <div className="ed-catalogue-bar">
        <div className="ed-catalogue-stats">
          <StatCard label="Niveaux" value={levels ? all.length : '—'} icon={<Library size={20} />} />
          <StatCard label="Parcours publiés" value={levels ? publishedCount : '—'} icon={<CheckCircle2 size={20} />} />
          <StatCard label="Brouillons en cours" value={levels ? draftCount : '—'} icon={<PenLine size={20} />} />
        </div>
        <button type="button" className="btn btn-primary" onClick={() => setLevelAction('create')}><Plus size={17} aria-hidden="true" /> Nouveau niveau</button>
      </div>
      {error && !levels ? (
        <div className="ed-load-error">
          <Callout tone="warning" title="Le catalogue est indisponible"><p role="alert">{error}</p></Callout>
          <button type="button" className="btn btn-secondary" onClick={() => setRefresh((value) => value + 1)}><RefreshCw size={16} aria-hidden="true" /> Réessayer</button>
        </div>
      ) : levels === null ? (
        <div className="ed-level-grid">{Array.from({ length: 3 }, (_, index) => <SkeletonCard key={index} lines={5} label="Chargement du catalogue…" />)}</div>
      ) : levels.length === 0 ? (
        <div className="ed-empty-card">
          <EmptyState icon={<Library size={26} />} title="Aucun niveau dans le catalogue" description="Créez un niveau, puis préparez son parcours."
            action={<button type="button" className="btn btn-primary" onClick={() => setLevelAction('create')}><Plus size={16} aria-hidden="true" /> Créer un premier niveau</button>} />
        </div>
      ) : (
        <ol className="ed-level-grid lc-stagger">
          {levels.map((level, index) => (
            <li key={level.id}>
              <LevelCard level={level} index={index} count={levels.length} busy={busy} onMove={(offset) => void reorder(index, offset)}
                onEdit={() => setLevelAction(level)} onDraft={(from) => void draft(level, from)} />
            </li>
          ))}
        </ol>
      )}
      {levelAction && levelAction !== 'create' && levels && <LevelDrawer level={levelAction} levels={levels} token={token} onClose={() => setLevelAction(null)} onDone={(updated) => {
        setLevelAction((current) => current === levelAction ? null : current);
        setLevels(updated);
        toast(`Niveau ${levelAction.code} enregistré.`);
      }} />}
      {levelAction === 'create' && <CreateLevelDrawer token={token} onClose={() => setLevelAction(null)} onCreate={(code) => {
        setLevelAction((current) => current === 'create' ? null : current);
        toast(`Le niveau ${code} est créé : préparez maintenant son parcours.`);
        setRefresh((value) => value + 1);
      }} />}
    </div>
  );
}

export function CataloguePanel({ token }: { token: string }) {
  return (
    <Routes>
      <Route index element={<LevelsView token={token} />} />
      <Route path="versions/:versionId" element={<VersionEditor token={token} />} />
    </Routes>
  );
}
