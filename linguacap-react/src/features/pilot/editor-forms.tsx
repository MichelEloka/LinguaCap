/**
 * Formulaires de l'éditeur de parcours : réglages, modules, activités, questions et corrigés, supports, diagnostic et
 * évaluations. Le document reste celui du service Catalogue ; seules la présentation et la saisie sont ici.
 */
import { createContext, useContext, useState, type ReactNode } from 'react';
import {
  BookOpen, BookOpenText, Check, ChevronDown, ChevronRight, CircleAlert, ClipboardCheck, Clock, Ear, Eye, EyeOff, Flag, GraduationCap, ImagePlus,
  Images, Layers, ListChecks, MessageSquareText, Mic, PencilLine, Plus, RotateCcw, Scale, Settings2, Stethoscope, Target, Trash2,
  type LucideIcon,
} from 'lucide-react';
import { Badge, EmptyState } from '../../components/ui';
import { Bars, Callout, Card, ProgressRing, Segmented } from '../../design/kit';
import { latestVersion, MediaPreview, versionStatus, type Asset } from './MediaLibrary';
import { MediaPicker, MediaThumb } from './editor-media';
import { Collapsible, ConfirmDialog, Disclosure, IconAction, MoveTools, TextWithPreview, ToggleChips } from './editor-parts';

export type Competence = 'lecture' | 'ecoute' | 'expression-ecrite' | 'expression-orale';
export type Kind = 'lesson' | 'exercise' | 'review' | 'assessment';
export type Status = 'draft' | 'published' | 'retired';
export interface DraftOption { id: string; label: string; correct: boolean }
export interface DraftQuestion { id: string; prompt: string; moduleRef: string | null; options: DraftOption[] }
export interface DraftPlacement {
  assetId: string; assetVersion: number; usage: 'illustration' | 'audio'; alt: string | null; caption: string | null;
  transcriptVisibility: 'on_demand' | 'after_answer' | 'hidden'; decorative: boolean; questionId: string | null; optionId: string | null;
}
export interface DraftLesson { title: string; description: string; transcript: string | null }
export interface DraftActivity {
  id: string; kind: Kind; title: string; estimatedMinutes: number; competences: Competence[];
  lesson: DraftLesson | null; questions: DraftQuestion[]; placements: DraftPlacement[];
}
export interface DraftModule { id: string; title: string; objective: string; prerequisites: string[]; activities: DraftActivity[] }
export interface Settings {
  expectedCompetences: Competence[]; successCriteria: string; passPercent: number; reviewMinutes: number;
  midtermMinutes: number; finalMinutes: number;
}
export interface DraftDiagnostic { title: string; description: string; questions: DraftQuestion[] }
export interface Criterion { id: string; label: string; maxPoints: number }
export interface Part {
  id: string; competence: Competence; mode: 'closed' | 'written' | 'oral'; title: string; instructions: string;
  questions: DraftQuestion[]; criteria: Criterion[]; placements: DraftPlacement[];
}
export interface Assessment { kind: 'midterm' | 'final'; title: string; description: string; parts: Part[] }
export interface Content { settings: Settings; diagnostic: DraftDiagnostic | null; modules: DraftModule[]; assessments: Assessment[] }
export interface VersionDoc extends Content {
  id: string; levelId: string; levelCode: string; levelTitle: string; number: number; status: Status;
  publishedAt: string | null; updatedAt: string | null;
}
export interface Checks { publishable: boolean; issues: { path: string; message: string }[] }

export const competences: { id: Competence; label: string; icon: LucideIcon }[] = [
  { id: 'lecture', label: 'Lecture', icon: BookOpenText }, { id: 'ecoute', label: 'Écoute', icon: Ear },
  { id: 'expression-ecrite', label: 'Expression écrite', icon: PencilLine }, { id: 'expression-orale', label: 'Expression orale', icon: Mic },
];
const competenceOptions = competences.map((item) => ({ id: item.id, label: item.label, icon: <item.icon size={15} aria-hidden="true" /> }));
export const kinds: Record<Kind, { label: string; icon: LucideIcon }> = {
  lesson: { label: 'Leçon', icon: BookOpen }, exercise: { label: 'Exercice', icon: PencilLine },
  review: { label: 'Révision', icon: RotateCcw }, assessment: { label: 'Évaluation', icon: ClipboardCheck },
};

export function KindTile({ kind, size = 'md' }: { kind: Kind; size?: 'sm' | 'md' | 'lg' }) {
  const Icon = kinds[kind].icon;
  return <span className={`ed-kind-tile is-${kind} is-${size}`} aria-hidden="true"><Icon size={size === 'lg' ? 22 : size === 'sm' ? 14 : 17} /></span>;
}

export function formatMinutes(total: number) {
  if (total < 60) return `${total} min`;
  const hours = Math.floor(total / 60);
  const rest = total % 60;
  return rest ? `${hours} h ${String(rest).padStart(2, '0')}` : `${hours} h`;
}

/** Environnement partagé par les formulaires : lecture seule, verrouillage pendant un envoi, médiathèque, aperçu. */
export interface EditorEnv {
  readOnly: boolean; locked: boolean; assets: Asset[]; token: string; issues: Checks['issues'];
  onPreview: (activity: DraftActivity) => void;
}
export const EditorContext = createContext<EditorEnv>({ readOnly: true, locked: true, assets: [], token: '', issues: [], onPreview: () => undefined });
const useEditor = () => useContext(EditorContext);

/** Nombre de points à compléter sous un chemin du document (« modules[1] », « modules[1].activities[0] »…). */
export function issueCount(issues: Checks['issues'], path: string) {
  return issues.filter((issue) => issue.path === path || issue.path.startsWith(`${path}.`) || issue.path.startsWith(`${path}[`)).length;
}

export function IssueFlag({ count }: { count: number }) {
  if (!count) return null;
  return <span className="ed-issue-flag" title={`${count} point${count > 1 ? 's' : ''} à compléter`}><CircleAlert size={13} aria-hidden="true" />{count}<span className="sr-only"> point{count > 1 ? 's' : ''} à compléter</span></span>;
}

/**
 * Identifiant unique proposé à la création : il reste stable ensuite pour que la progression des élèves suive.
 * Le planning réserve les révisions de module (revision-…), le diagnostic, le bilan et l'examen blanc.
 */
export function uniqueId(base: string, taken: string[]) {
  const safe = base.startsWith('revision-') || ['diagnostic', 'bilan-intermediaire', 'examen-blanc'].includes(base) ? `a-${base}` : base;
  let candidate = safe;
  for (let index = 2; taken.includes(candidate); index++) candidate = `${safe}-${index}`;
  return candidate;
}

export function move<T>(items: T[], index: number, offset: number) {
  const target = index + offset;
  if (target < 0 || target >= items.length) return items;
  const next = [...items];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

export function replaceAt<T>(items: T[], index: number, value: T) {
  return items.map((item, position) => position === index ? value : item);
}

function newQuestion(questions: DraftQuestion[]): DraftQuestion {
  return {
    id: uniqueId(`q${questions.length + 1}`, questions.map((question) => question.id)), prompt: '', moduleRef: null,
    options: [{ id: 'a', label: '', correct: true }, { id: 'b', label: '', correct: false }],
  };
}

export function newActivity(kind: Kind, moduleId: string, taken: string[]): DraftActivity {
  return {
    id: uniqueId(`${moduleId}-activite-${taken.length + 1}`.slice(0, 36), taken), kind, title: '', estimatedMinutes: 10, competences: [],
    lesson: { title: '', description: '', transcript: null }, questions: [], placements: [],
  };
}

function AddCard({ icon: Icon = Plus, children, onClick, disabled }: { icon?: LucideIcon; children: ReactNode; onClick: () => void; disabled?: boolean }) {
  return <button type="button" className="ed-add-card" onClick={onClick} disabled={disabled}><span><Icon size={17} aria-hidden="true" /></span>{children}</button>;
}

/** Questions fermées avec leur corrigé : une seule bonne réponse, deux à huit choix. */
export function QuestionsEditor({ questions, onChange, moduleRefs, path }: {
  questions: DraftQuestion[]; onChange: (questions: DraftQuestion[]) => void; moduleRefs?: { id: string; label: string }[]; path: string;
}) {
  const { readOnly, locked, issues } = useEditor();
  return (
    <div className="ed-questions" data-path={`${path}.questions`}>
      {questions.length === 0 && <p className="ed-empty-inline"><ListChecks size={18} aria-hidden="true" /> Aucune question pour l’instant.</p>}
      {questions.map((question, index) => {
        const update = (value: Partial<DraftQuestion>) => onChange(replaceAt(questions, index, { ...question, ...value }));
        const at = `${path}.questions[${index}]`;
        const flagged = issueCount(issues, at);
        const correct = question.options.find((option) => option.correct);
        const reference = moduleRefs?.find((ref) => ref.id === question.moduleRef);
        return (
          <Disclosure className={`ed-question${flagged ? ' is-warning' : ''}`} key={index} path={at} defaultOpen={!question.prompt || flagged > 0}>
            <summary className="ed-question-head">
              <span className="ed-question-num" aria-hidden="true">{index + 1}</span>
              <span className="ed-question-summary">
                <strong>{question.prompt || `Question ${index + 1}`}</strong>
                <small>{[reference?.label, correct ? `Réponse ${correct.id.toUpperCase()} : ${correct.label || '—'}` : 'Bonne réponse à choisir',
                  `${question.options.length} choix`].filter(Boolean).join(' · ')}</small>
              </span>
              <IssueFlag count={flagged} />
              {!readOnly && <span className="ed-question-tools" onClick={(event) => event.preventDefault()}>
                <MoveTools index={index} count={questions.length} label={`la question ${index + 1}`} disabled={locked}
                  onMove={(offset) => onChange(move(questions, index, offset))} onRemove={() => onChange(questions.filter((_, position) => position !== index))} />
              </span>}
              <ChevronDown className="ed-question-chevron" size={17} aria-hidden="true" />
            </summary>
            <div className="ed-question-body">
            <fieldset className="ed-fields" disabled={locked}>
              <label data-path={`${at}.prompt`}>Énoncé<textarea rows={2} maxLength={500} value={question.prompt} onChange={(event) => update({ prompt: event.target.value })} /></label>
              {moduleRefs && (
                <label data-path={`${at}.moduleRef`}>Module évalué<select value={question.moduleRef ?? ''} onChange={(event) => update({ moduleRef: event.target.value || null })}>
                  <option value="">À choisir</option>
                  {moduleRefs.map((ref) => <option key={ref.id} value={ref.id}>{ref.label}</option>)}
                </select></label>
              )}
              <div className="ed-options" role="group" aria-label={`Choix de la question ${index + 1}`} data-path={`${at}.options`}>
                {question.options.map((option, optionIndex) => (
                  <div className={`ed-option${option.correct ? ' is-correct' : ''}`} key={optionIndex}>
                    <label className="ed-correct" title="Bonne réponse">
                      <input type="radio" name={`correct-${path}-${question.id}-${index}`} checked={option.correct}
                        onChange={() => update({ options: question.options.map((item, position) => ({ ...item, correct: position === optionIndex })) })} />
                      <Check size={14} aria-hidden="true" />
                      <span className="sr-only">Bonne réponse : choix {option.id}</span>
                    </label>
                    <span className="ed-option-letter" aria-hidden="true">{option.id}</span>
                    <label className="ed-option-field"><span className="sr-only">Libellé du choix {option.id}</span>
                      <input maxLength={300} value={option.label} placeholder={`Choix ${option.id}`}
                        onChange={(event) => update({ options: replaceAt(question.options, optionIndex, { ...option, label: event.target.value }) })} />
                    </label>
                    {!readOnly && <IconAction icon={Trash2} tone="danger" disabled={locked || question.options.length <= 2} label={`Supprimer le choix ${option.id}`}
                      onClick={() => update({ options: question.options.filter((_, position) => position !== optionIndex) })} />}
                  </div>
                ))}
                {!readOnly && (
                  <button type="button" className="btn btn-ghost btn-sm ed-add-option" disabled={question.options.length >= 8}
                    onClick={() => update({ options: [...question.options, { id: uniqueId(String.fromCharCode(97 + question.options.length), question.options.map((item) => item.id)), label: '', correct: false }] })}>
                    <Plus size={15} aria-hidden="true" /> Ajouter un choix
                  </button>
                )}
              </div>
            </fieldset>
            </div>
          </Disclosure>
        );
      })}
      {!readOnly && <AddCard onClick={() => onChange([...questions, newQuestion(questions)])} disabled={locked}>Ajouter une question</AddCard>}
    </div>
  );
}

const transcriptLabels: Record<DraftPlacement['transcriptVisibility'], string> = { on_demand: 'À la demande', after_answer: 'Après la réponse', hidden: 'Masquée' };

/** Supports d'une activité ou d'une partie : média versionné de la médiathèque, cible, textes et transcription. */
export function PlacementsEditor({ placements, questions, onChange, path }: {
  placements: DraftPlacement[]; questions: DraftQuestion[]; onChange: (placements: DraftPlacement[]) => void; path: string;
}) {
  const { assets, token, readOnly, locked } = useEditor();
  const [picking, setPicking] = useState(false);
  const [previewing, setPreviewing] = useState<number | null>(null);

  function add(asset: Asset) {
    onChange([...placements, {
      assetId: asset.id, assetVersion: latestVersion(asset), usage: asset.kind === 'image' ? 'illustration' : 'audio',
      alt: asset.kind === 'image' ? asset.alt : null, caption: null, transcriptVisibility: asset.kind === 'audio' ? 'on_demand' : 'hidden',
      decorative: false, questionId: null, optionId: null,
    }]);
    setPicking(false);
  }

  return (
    <div className="ed-placements" data-path={`${path}.placements`}>
      {placements.length === 0 && <p className="ed-empty-inline"><Images size={18} aria-hidden="true" /> Aucune image ni aucun son.</p>}
      {placements.map((placement, index) => {
        const asset = assets.find((item) => item.id === placement.assetId);
        const update = (value: Partial<DraftPlacement>) => onChange(replaceAt(placements, index, { ...placement, ...value }));
        const target = placement.optionId ? `${placement.questionId}/${placement.optionId}` : placement.questionId ?? '';
        const newest = asset ? latestVersion(asset) : placement.assetVersion;
        const questionIndex = questions.findIndex((question) => question.id === placement.questionId);
        const targetLabel = !placement.questionId ? 'Illustre l’activité'
          : `Question ${questionIndex + 1}${placement.optionId ? ` · choix ${placement.optionId}` : ''}`;
        const at = `${path}.placements[${index}]`;
        const kind = asset?.kind ?? (placement.usage === 'audio' ? 'audio' : 'image');
        return (
          <article className="ed-placement" key={index} data-path={at}>
            <div className="ed-placement-head">
              <MediaThumb assetId={placement.assetId} kind={kind} version={placement.assetVersion} token={token} size="sm" />
              <div className="ed-placement-title">
                <strong>{asset?.title ?? placement.assetId}</strong>
                <small>{placement.usage === 'audio' ? 'Son' : 'Image'} · v{placement.assetVersion} · {targetLabel}</small>
              </div>
              <span className="ed-tools">
                <IconAction icon={previewing === index ? EyeOff : Eye} label={previewing === index ? 'Masquer l’aperçu' : 'Aperçu du fichier'}
                  pressed={previewing === index} onClick={() => setPreviewing(previewing === index ? null : index)} />
                {!readOnly && <MoveTools index={index} count={placements.length} label={`le support ${index + 1}`} disabled={locked}
                  onMove={(offset) => onChange(move(placements, index, offset))} onRemove={() => onChange(placements.filter((_, position) => position !== index))} />}
              </span>
            </div>
            {previewing === index && <div className="ed-placement-preview"><MediaPreview assetId={placement.assetId} version={placement.assetVersion} token={token} /></div>}
            {!readOnly && newest > placement.assetVersion && (
              <Callout tone="info">Une version plus récente existe (v{newest}).{' '}
                <button type="button" className="text-link" disabled={locked} onClick={() => update({ assetVersion: newest })}>Utiliser la v{newest}</button></Callout>
            )}
            <fieldset className="ed-fields ed-grid-2" disabled={locked}>
              <label>Version du fichier<select value={placement.assetVersion} onChange={(event) => update({ assetVersion: Number(event.target.value) })}>
                {(asset?.versions ?? [{ version: placement.assetVersion, status: 'published' as const }]).map((item) => (
                  <option key={item.version} value={item.version}>v{item.version} · {versionStatus[item.status]}</option>
                ))}
              </select></label>
              <label>Illustre<select value={target} onChange={(event) => {
                const [questionId, optionId] = event.target.value.split('/');
                update({ questionId: questionId || null, optionId: optionId || null });
              }}>
                <option value="">L’activité</option>
                {questions.map((question, position) => [
                  <option key={question.id} value={question.id}>Question {position + 1}</option>,
                  ...question.options.map((option) => (
                    <option key={`${question.id}/${option.id}`} value={`${question.id}/${option.id}`}>Question {position + 1} · choix {option.id}</option>
                  )),
                ])}
              </select></label>
              {placement.usage === 'illustration' && (
                <label className="ed-check ed-span-2"><input type="checkbox" checked={placement.decorative}
                  onChange={(event) => update({ decorative: event.target.checked })} /> Image décorative (sans texte alternatif)</label>
              )}
              {placement.usage === 'illustration' && !placement.decorative && (
                <label className="ed-span-2" data-path={`${at}.alt`}>Texte alternatif<textarea rows={2} maxLength={300} value={placement.alt ?? ''}
                  onChange={(event) => update({ alt: event.target.value })} /></label>
              )}
              <label className={placement.usage === 'audio' ? undefined : 'ed-span-2'}>Légende<input maxLength={300} value={placement.caption ?? ''} onChange={(event) => update({ caption: event.target.value || null })} /></label>
              {placement.usage === 'audio' && (
                <label>Transcription<select value={placement.transcriptVisibility}
                  onChange={(event) => update({ transcriptVisibility: event.target.value as DraftPlacement['transcriptVisibility'] })}>
                  {Object.entries(transcriptLabels).map(([id, label]) => <option key={id} value={id}>{label}</option>)}
                </select></label>
              )}
            </fieldset>
          </article>
        );
      })}
      {!readOnly && <AddCard icon={ImagePlus} onClick={() => setPicking(true)} disabled={locked}>Ajouter une image ou un son</AddCard>}
      {picking && <MediaPicker assets={assets} token={token} onPick={add} onClose={() => setPicking(false)} />}
    </div>
  );
}

/** Activité : informations, contenu ou consigne, questions et supports, en sections repliables. */
export function ActivityEditor({ activity, path, moduleLabel, index, count, onChange, onMove, onRemove }: {
  activity: DraftActivity; path: string; moduleLabel: string; index: number; count: number;
  onChange: (activity: DraftActivity) => void; onMove: (offset: number) => void; onRemove: () => void;
}) {
  const { readOnly, locked, issues, onPreview } = useEditor();
  const [confirming, setConfirming] = useState(false);
  const update = (value: Partial<DraftActivity>) => onChange({ ...activity, ...value });
  const graded = activity.kind === 'exercise' || activity.kind === 'assessment';
  const lesson = activity.lesson ?? { title: activity.title, description: '', transcript: null };
  const count_ = (suffix: string) => issueCount(issues, `${path}.${suffix}`);
  return (
    <div className="ed-entity" data-path={path}>
      <header className="ed-entity-head">
        <KindTile kind={activity.kind} size="lg" />
        <div className="ed-entity-title">
          <p className="ed-overline">{moduleLabel} · activité {index + 1} sur {count}</p>
          <h3>{activity.title || 'Activité sans titre'}</h3>
          <div className="ed-meta-row">
            <Badge tone="blue">{kinds[activity.kind].label}</Badge>
            <span><Clock size={14} aria-hidden="true" /> {activity.estimatedMinutes} min</span>
            {activity.competences.map((id) => <span key={id} className="ed-meta-chip">{competences.find((item) => item.id === id)?.label}</span>)}
          </div>
        </div>
        <div className="ed-entity-tools">
          <button type="button" className="btn btn-soft btn-sm" onClick={() => onPreview(activity)}><Eye size={15} aria-hidden="true" /> Aperçu élève</button>
          {!readOnly && <MoveTools index={index} count={count} label={`l’activité ${activity.title || activity.id}`} disabled={locked}
            onMove={onMove} onRemove={() => setConfirming(true)} />}
        </div>
      </header>

      <Collapsible title="Informations" icon={<Settings2 size={17} />} defaultOpen>
        <fieldset className="ed-fields ed-grid-2" disabled={locked}>
          <label data-path={`${path}.title`}>Titre<input maxLength={120} value={activity.title} onChange={(event) => update({ title: event.target.value })} /></label>
          <label>Type<select value={activity.kind} onChange={(event) => {
            const kind = event.target.value as Kind;
            update({ kind, lesson: kind === 'lesson' || kind === 'review' ? lesson : activity.lesson });
          }}>
            {Object.entries(kinds).map(([id, item]) => <option key={id} value={id}>{item.label}</option>)}
          </select></label>
          <label>Durée estimée (minutes)<input type="number" min={1} max={240} value={activity.estimatedMinutes}
            onChange={(event) => update({ estimatedMinutes: Number(event.target.value) })} /></label>
          <label>Identifiant<input value={activity.id} maxLength={40} pattern="[a-z0-9]+(-[a-z0-9]+)*"
            onChange={(event) => update({ id: event.target.value })} aria-describedby={`id-help-${activity.id}`} />
            <small id={`id-help-${activity.id}`} className="ed-help">Gardez-le d’une version à l’autre pour que la progression suive.</small></label>
        </fieldset>
        <ToggleChips legend="Compétences travaillées" options={competenceOptions} value={activity.competences} disabled={locked}
          onChange={(value) => update({ competences: value })} />
      </Collapsible>

      {(activity.kind === 'lesson' || activity.kind === 'review' || graded) && (
        <Collapsible title={graded ? 'Consigne' : 'Contenu de la leçon'} icon={<BookOpenText size={17} />} defaultOpen path={`${path}.lesson`}
          tone={count_('lesson') ? 'warning' : undefined} meta={<IssueFlag count={count_('lesson')} />}>
          <fieldset className="ed-fields" disabled={locked}>
            <label>Titre affiché<input maxLength={120} value={lesson.title} onChange={(event) => update({ lesson: { ...lesson, title: event.target.value } })} /></label>
          </fieldset>
          <TextWithPreview label={graded ? 'Consigne' : 'Texte'} rows={graded ? 3 : 8} readOnly={readOnly} disabled={locked} value={lesson.description}
            onChange={(value) => update({ lesson: { ...lesson, description: value } })} />
          <fieldset className="ed-fields" disabled={locked}>
            <label>Transcription des sons<textarea rows={3} lang="de" value={lesson.transcript ?? ''}
              onChange={(event) => update({ lesson: { ...lesson, transcript: event.target.value || null } })} /></label>
          </fieldset>
        </Collapsible>
      )}

      {graded && (
        <Collapsible title="Questions et corrigé" icon={<ListChecks size={17} />} defaultOpen path={`${path}.questions`}
          tone={count_('questions') ? 'warning' : undefined}
          meta={<><span className="ed-count">{activity.questions.length}</span><IssueFlag count={count_('questions')} /></>}>
          <QuestionsEditor questions={activity.questions} path={path} onChange={(questions) => update({ questions })} />
        </Collapsible>
      )}

      <Collapsible title="Images et sons" icon={<Images size={17} />} defaultOpen={activity.placements.length > 0 || !readOnly} path={`${path}.placements`}
        tone={count_('placements') ? 'warning' : undefined}
        meta={<><span className="ed-count">{activity.placements.length}</span><IssueFlag count={count_('placements')} /></>}>
        <PlacementsEditor placements={activity.placements} questions={graded ? activity.questions : []} path={path}
          onChange={(placements) => update({ placements })} />
      </Collapsible>

      {confirming && (
        <ConfirmDialog title="Supprimer l’activité ?" confirm="Supprimer" tone="danger" onConfirm={onRemove} onClose={() => setConfirming(false)}>
          <p>« {activity.title || activity.id} » sera retirée du module. La suppression devient définitive à l’enregistrement du brouillon.</p>
        </ConfirmDialog>
      )}
    </div>
  );
}

/** Module : présentation, objectif, prérequis et liste des activités (à ouvrir dans le plan). */
export function ModuleEditor({ module, modules, index, path, onChange, onMove, onRemove, onOpenActivity, onAddActivity }: {
  module: DraftModule; modules: DraftModule[]; index: number; path: string; onChange: (module: DraftModule) => void;
  onMove: (offset: number) => void; onRemove: () => void; onOpenActivity: (index: number) => void; onAddActivity: (kind: Kind) => void;
}) {
  const { readOnly, locked, issues } = useEditor();
  const [confirming, setConfirming] = useState(false);
  const update = (value: Partial<DraftModule>) => onChange({ ...module, ...value });
  const minutes = module.activities.reduce((sum, activity) => sum + (activity.estimatedMinutes || 0), 0);
  const others = modules.filter((item) => item.id !== module.id);
  return (
    <div className="ed-entity" data-path={path}>
      <header className="ed-entity-head">
        <span className="ed-module-tile" aria-hidden="true">{index + 1}</span>
        <div className="ed-entity-title">
          <p className="ed-overline">Module {index + 1} sur {modules.length}</p>
          <h3>{module.title || 'Module sans titre'}</h3>
          <div className="ed-meta-row">
            <span><Layers size={14} aria-hidden="true" /> {module.activities.length} activité{module.activities.length > 1 ? 's' : ''}</span>
            <span><Clock size={14} aria-hidden="true" /> {formatMinutes(minutes)}</span>
            {module.prerequisites.length > 0 && <span className="ed-meta-chip">Après {module.prerequisites.length} module{module.prerequisites.length > 1 ? 's' : ''}</span>}
          </div>
        </div>
        {!readOnly && <div className="ed-entity-tools">
          <MoveTools index={index} count={modules.length} label={`le module ${module.title || module.id}`} disabled={locked}
            onMove={onMove} onRemove={() => setConfirming(true)} />
        </div>}
      </header>

      <Collapsible title="Présentation du module" icon={<Target size={17} />} defaultOpen
        tone={issueCount(issues, `${path}.title`) + issueCount(issues, `${path}.objective`) ? 'warning' : undefined}>
        <fieldset className="ed-fields" disabled={locked}>
          <div className="ed-grid-2">
            <label data-path={`${path}.title`}>Titre<input maxLength={120} value={module.title} onChange={(event) => update({ title: event.target.value })} /></label>
            <label>Identifiant<input maxLength={64} value={module.id} pattern="[a-z0-9]+(-[a-z0-9]+)*" onChange={(event) => update({ id: event.target.value })} /></label>
          </div>
          <label data-path={`${path}.objective`}>Objectif<textarea rows={3} maxLength={500} value={module.objective} onChange={(event) => update({ objective: event.target.value })}
            placeholder="Ce que l’élève saura faire à la fin du module" /></label>
        </fieldset>
        {others.length > 0 && (
          <ToggleChips legend="Prérequis" path={`${path}.prerequisites`} disabled={locked}
            options={others.map((item) => ({ id: item.id, label: item.title || item.id }))} value={module.prerequisites}
            onChange={(value) => update({ prerequisites: value })} />
        )}
      </Collapsible>

      <Card flush title="Activités" description={`${module.activities.length} activité${module.activities.length > 1 ? 's' : ''} · ${formatMinutes(minutes)}`}
        icon={<ListChecks size={18} />} className="ed-activity-card">
        {module.activities.length === 0
          ? <EmptyState icon={<Layers size={26} />} title="Aucune activité" description="Ajoutez une leçon, un exercice ou une révision." />
          : (
            <ol className="ed-activity-list" data-path={`${path}.activities`}>
              {module.activities.map((activity, position) => (
                <li key={position}>
                  <button type="button" className="ed-activity-row" onClick={() => onOpenActivity(position)}>
                    <KindTile kind={activity.kind} />
                    <span className="ed-activity-main"><strong>{activity.title || activity.id}</strong>
                      <small>{kinds[activity.kind].label} · {activity.estimatedMinutes} min{activity.placements.length ? ` · ${activity.placements.length} support${activity.placements.length > 1 ? 's' : ''}` : ''}</small></span>
                    <IssueFlag count={issueCount(issues, `${path}.activities[${position}]`)} />
                    <ChevronRight size={18} aria-hidden="true" className="ed-row-chevron" />
                  </button>
                </li>
              ))}
            </ol>
          )}
        {!readOnly && (
          <div className="ed-add-kinds" role="group" aria-label="Ajouter une activité">
            <span>Ajouter</span>
            {(Object.keys(kinds) as Kind[]).map((kind) => (
              <button key={kind} type="button" className="ed-add-kind" disabled={locked} onClick={() => onAddActivity(kind)}
                aria-label={`Ajouter une activité : ${kinds[kind].label}`}>
                <KindTile kind={kind} size="sm" />{kinds[kind].label}
              </button>
            ))}
          </div>
        )}
      </Card>

      {confirming && (
        <ConfirmDialog title="Supprimer le module ?" confirm="Supprimer" tone="danger" onConfirm={onRemove} onClose={() => setConfirming(false)}>
          <p>« {module.title || module.id} » et ses {module.activities.length} activités seront retirés du parcours. La suppression devient définitive à l’enregistrement du brouillon.</p>
        </ConfirmDialog>
      )}
    </div>
  );
}

/** Réglages du niveau : compétences évaluées, critères, seuil de réussite et durées des révisions et évaluations. */
export function SettingsEditor({ settings, onChange }: { settings: Settings; onChange: (settings: Settings) => void }) {
  const { readOnly, locked, issues } = useEditor();
  const durations = [['reviewMinutes', 'Révision par module', 0, 120, RotateCcw], ['midtermMinutes', 'Bilan intermédiaire', 0, 240, Flag],
    ['finalMinutes', 'Examen blanc', 0, 300, GraduationCap]] as const;
  return (
    <div className="ed-settings">
      <Card title="Compétences évaluées" description="Les quatre compétences du CECRL suivies pour ce niveau." icon={<Target size={18} />}
        className={issueCount(issues, 'settings.expectedCompetences') ? 'is-warning' : undefined}>
        <ToggleChips legend="Compétences évaluées" legendHidden options={competenceOptions} value={settings.expectedCompetences} disabled={locked}
          path="settings.expectedCompetences" onChange={(value) => onChange({ ...settings, expectedCompetences: value })} />
      </Card>
      <Card title="Seuil de réussite" description="Pourcentage minimal à l’examen blanc." icon={<Scale size={18} />}>
        <div className="ed-threshold">
          <ProgressRing value={settings.passPercent} size={84} stroke={8} label={`Seuil de réussite : ${settings.passPercent} %`}>
            <strong>{settings.passPercent}%</strong>
          </ProgressRing>
          <fieldset className="ed-fields" disabled={locked}>
            <label>Seuil de réussite (%)<input type="number" min={1} max={100} value={settings.passPercent}
              onChange={(event) => onChange({ ...settings, passPercent: Number(event.target.value) })} /></label>
          </fieldset>
        </div>
      </Card>
      <Card title="Critères de réussite" description="Ce que l’élève doit démontrer pour valider le niveau." icon={<MessageSquareText size={18} />}
        className={`ed-span-all${issueCount(issues, 'settings.successCriteria') ? ' is-warning' : ''}`}>
        <div data-path="settings.successCriteria">
          <TextWithPreview label="Critères de réussite" rows={4} maxLength={2000} readOnly={readOnly} disabled={locked} value={settings.successCriteria}
            onChange={(value) => onChange({ ...settings, successCriteria: value })} />
        </div>
      </Card>
      <Card title="Durées" description="Temps réservé dans le planning de l’élève." icon={<Clock size={18} />} className="ed-span-all">
        <fieldset className="ed-fields ed-durations" disabled={locked}>
          {durations.map(([key, label, min, max, Icon]) => (
            <label key={key} className="ed-duration">
              <span className="ed-duration-label"><Icon size={16} aria-hidden="true" />{label} (min)</span>
              <input type="number" min={min} max={max} value={settings[key]}
                onChange={(event) => onChange({ ...settings, [key]: Number(event.target.value) })} />
            </label>
          ))}
        </fieldset>
      </Card>
    </div>
  );
}

/** Diagnostic initial : présentation et questions rattachées aux modules (ou au prérequis du niveau). */
export function DiagnosticEditor({ diagnostic, modules, levelCode, onChange }: {
  diagnostic: DraftDiagnostic | null; modules: DraftModule[]; levelCode: string; onChange: (diagnostic: DraftDiagnostic | null) => void;
}) {
  const { readOnly, locked } = useEditor();
  const [confirming, setConfirming] = useState(false);
  if (!diagnostic) {
    return (
      <div className="ed-empty-card">
        <EmptyState icon={<Stethoscope size={26} />} title="Pas de diagnostic initial"
          description="Un test court situe le point de départ de l’élève et peut marquer des modules comme acquis."
          action={readOnly ? undefined : <button type="button" className="btn btn-primary" disabled={locked}
            onClick={() => onChange({ title: `Diagnostic ${levelCode}`, description: '', questions: [] })}><Plus size={16} aria-hidden="true" /> Ajouter un diagnostic</button>} />
      </div>
    );
  }
  const moduleRefs = [...modules.map((module, index) => ({ id: module.id, label: `Module ${index + 1} · ${module.title || module.id}` })), { id: 'prerequis', label: 'Prérequis du niveau' }];
  const spread = [...modules.map((module, index) => ({ label: `M${index + 1}`, value: diagnostic.questions.filter((question) => question.moduleRef === module.id).length })),
    { label: 'Prér.', value: diagnostic.questions.filter((question) => question.moduleRef === 'prerequis').length }];
  return (
    <div className="ed-diagnostic">
      <div className="ed-diagnostic-main">
        <Card title={diagnostic.title || 'Diagnostic'} description={`${diagnostic.questions.length} question${diagnostic.questions.length > 1 ? 's' : ''}`}
          icon={<Stethoscope size={18} />} action={readOnly ? undefined
            : <button type="button" className="btn btn-ghost btn-sm" disabled={locked} onClick={() => setConfirming(true)}><Trash2 size={15} aria-hidden="true" /> Retirer</button>}>
          <fieldset className="ed-fields" disabled={locked}>
            <label>Titre<input maxLength={120} value={diagnostic.title} onChange={(event) => onChange({ ...diagnostic, title: event.target.value })} /></label>
          </fieldset>
          <TextWithPreview label="Présentation" rows={4} readOnly={readOnly} disabled={locked} value={diagnostic.description}
            onChange={(value) => onChange({ ...diagnostic, description: value })} />
        </Card>
        <Card title="Questions" icon={<ListChecks size={18} />} description="Chaque question est rattachée au module qu’elle permet de valider.">
          <QuestionsEditor questions={diagnostic.questions} moduleRefs={moduleRefs} path="diagnostic" onChange={(questions) => onChange({ ...diagnostic, questions })} />
        </Card>
      </div>
      <aside className="ed-diagnostic-side">
        <Card title="Répartition" description="Questions par module" icon={<Layers size={18} />}>
          <Bars data={spread} height={150} label="Questions du diagnostic par module" />
        </Card>
      </aside>
      {confirming && (
        <ConfirmDialog title="Retirer le diagnostic ?" confirm="Retirer" tone="danger" onConfirm={() => onChange(null)} onClose={() => setConfirming(false)}>
          <p>Le test et ses {diagnostic.questions.length} questions seront retirés de cette version.</p>
        </ConfirmDialog>
      )}
    </div>
  );
}

const modeLabels: Record<Part['mode'], string> = { closed: 'Questions fermées', written: 'Production écrite', oral: 'Production orale' };

function PartEditor({ part, path, onChange }: { part: Part; path: string; onChange: (part: Part) => void }) {
  const { readOnly, locked } = useEditor();
  const update = (value: Partial<Part>) => onChange({ ...part, ...value });
  const production = part.mode !== 'closed';
  const points = part.criteria.reduce((sum, criterion) => sum + (criterion.maxPoints || 0), 0);
  return (
    <div className="ed-part">
      <fieldset className="ed-fields ed-grid-2" disabled={locked}>
        <label data-path={`${path}.title`}>Titre<input maxLength={120} value={part.title} onChange={(event) => update({ title: event.target.value })} /></label>
        <label data-path={`${path}.competence`}>Compétence<select value={part.competence} onChange={(event) => {
          const competence = event.target.value as Competence;
          update({ competence, mode: competence === 'expression-ecrite' ? 'written' : competence === 'expression-orale' ? 'oral' : 'closed' });
        }}>
          {competences.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
        </select></label>
      </fieldset>
      <div data-path={`${path}.instructions`}>
        <TextWithPreview label="Consigne" rows={4} maxLength={4000} readOnly={readOnly} disabled={locked} value={part.instructions}
          onChange={(value) => update({ instructions: value })} />
      </div>
      {production ? (
        <section className="ed-subsection" data-path={`${path}.criteria`}>
          <header><h4>Grille de correction</h4><span className="ed-count">{points} pt{points > 1 ? 's' : ''}</span></header>
          <fieldset className="ed-fields" disabled={locked}>
            {part.criteria.map((criterion, index) => (
              <div className="ed-criterion" key={index}>
                <label className="ed-criterion-label">Critère<input maxLength={200} value={criterion.label}
                  onChange={(event) => update({ criteria: replaceAt(part.criteria, index, { ...criterion, label: event.target.value }) })} /></label>
                <label className="ed-criterion-points">Points<input type="number" min={1} max={100} value={criterion.maxPoints}
                  onChange={(event) => update({ criteria: replaceAt(part.criteria, index, { ...criterion, maxPoints: Number(event.target.value) }) })} /></label>
                {!readOnly && <IconAction icon={Trash2} tone="danger" label={`Supprimer le critère ${index + 1}`}
                  onClick={() => update({ criteria: part.criteria.filter((_, position) => position !== index) })} />}
              </div>
            ))}
          </fieldset>
          {!readOnly && <AddCard disabled={locked || part.criteria.length >= 10} onClick={() => update({
            criteria: [...part.criteria, { id: uniqueId(`critere-${part.criteria.length + 1}`, part.criteria.map((item) => item.id)), label: '', maxPoints: 5 }],
          })}>Ajouter un critère</AddCard>}
        </section>
      ) : (
        <section className="ed-subsection">
          <header><h4>Questions et corrigé</h4><span className="ed-count">{part.questions.length}</span></header>
          <QuestionsEditor questions={part.questions} path={path} onChange={(questions) => update({ questions })} />
        </section>
      )}
      <section className="ed-subsection">
        <header><h4>Images et sons</h4><span className="ed-count">{part.placements.length}</span></header>
        <PlacementsEditor placements={part.placements} questions={production ? [] : part.questions} path={path}
          onChange={(placements) => update({ placements })} />
      </section>
    </div>
  );
}

/** Bilan intermédiaire ou examen blanc : présentation et parties par compétence. */
export function AssessmentEditor({ kind, assessment, path, onChange }: {
  kind: Assessment['kind']; assessment: Assessment | undefined; path: string; onChange: (value: Assessment | undefined) => void;
}) {
  const { readOnly, locked, issues } = useEditor();
  const [confirming, setConfirming] = useState(false);
  const name = kind === 'midterm' ? 'Bilan intermédiaire' : 'Examen blanc';
  if (!assessment) {
    return (
      <div className="ed-empty-card">
        <EmptyState icon={kind === 'midterm' ? <Flag size={26} /> : <GraduationCap size={26} />} title={`Pas de ${name.toLowerCase()}`}
          description={kind === 'midterm' ? 'Un bilan à mi-parcours montre à l’élève ce qui est acquis.' : 'L’examen blanc valide le niveau selon le seuil de réussite.'}
          action={readOnly ? undefined : <button type="button" className="btn btn-primary" disabled={locked}
            onClick={() => onChange({ kind, title: name, description: '', parts: [] })}><Plus size={16} aria-hidden="true" /> Ajouter le {name.toLowerCase()}</button>} />
      </div>
    );
  }
  const update = (value: Partial<Assessment>) => onChange({ ...assessment, ...value });
  const questions = assessment.parts.reduce((sum, part) => sum + (part.mode === 'closed' ? part.questions.length : 0), 0);
  return (
    <div className="ed-assessment" data-path={path}>
      <Card title={assessment.title || name} description={`${assessment.parts.length} partie${assessment.parts.length > 1 ? 's' : ''} · ${questions} question${questions > 1 ? 's' : ''} fermée${questions > 1 ? 's' : ''}`}
        icon={kind === 'midterm' ? <Flag size={18} /> : <GraduationCap size={18} />}
        action={readOnly ? undefined : <button type="button" className="btn btn-ghost btn-sm" disabled={locked} onClick={() => setConfirming(true)}><Trash2 size={15} aria-hidden="true" /> Retirer</button>}>
        <fieldset className="ed-fields" disabled={locked}>
          <label data-path={`${path}.title`}>Titre<input maxLength={120} value={assessment.title} onChange={(event) => update({ title: event.target.value })} /></label>
        </fieldset>
        <TextWithPreview label="Présentation" rows={3} maxLength={2000} readOnly={readOnly} disabled={locked} value={assessment.description}
          onChange={(value) => update({ description: value })} />
      </Card>
      <div className="ed-parts" data-path={`${path}.parts`}>
        {assessment.parts.map((part, index) => {
          const competence = competences.find((item) => item.id === part.competence);
          const Icon = competence?.icon ?? BookOpenText;
          const at = `${path}.parts[${index}]`;
          const count = issueCount(issues, at);
          return (
            <div className="ed-part-wrap" key={index}>
              <Collapsible title={`Partie ${index + 1} · ${part.title || competence?.label}`} icon={<Icon size={17} />} defaultOpen={!part.title || count > 0}
                path={at} tone={count ? 'warning' : undefined}
                meta={<><Badge tone={part.mode === 'closed' ? 'blue' : 'violet'}>{modeLabels[part.mode]}</Badge><IssueFlag count={count} /></>}>
                {!readOnly && <div className="ed-part-tools"><MoveTools index={index} count={assessment.parts.length} label={`la partie ${index + 1}`} disabled={locked}
                  onMove={(offset) => update({ parts: move(assessment.parts, index, offset) })}
                  onRemove={() => update({ parts: assessment.parts.filter((_, position) => position !== index) })} /></div>}
                <PartEditor part={part} path={at} onChange={(value) => update({ parts: replaceAt(assessment.parts, index, value) })} />
              </Collapsible>
            </div>
          );
        })}
        {!readOnly && <AddCard disabled={locked || assessment.parts.length >= 12} onClick={() => update({
          parts: [...assessment.parts, {
            id: uniqueId(`partie-${assessment.parts.length + 1}`, assessment.parts.map((item) => item.id)), competence: 'lecture', mode: 'closed',
            title: '', instructions: '', questions: [], criteria: [], placements: [],
          }],
        })}>Ajouter une partie</AddCard>}
      </div>
      {confirming && (
        <ConfirmDialog title={`Retirer le ${name.toLowerCase()} ?`} confirm="Retirer" tone="danger" onConfirm={() => onChange(undefined)} onClose={() => setConfirming(false)}>
          <p>Ses {assessment.parts.length} parties seront retirées de cette version.</p>
        </ConfirmDialog>
      )}
    </div>
  );
}

/** Choix entre les deux évaluations du niveau. */
export function AssessmentsEditor({ assessments, kind, onKind, onChange }: {
  assessments: Assessment[]; kind: Assessment['kind']; onKind: (kind: Assessment['kind']) => void;
  onChange: (kind: Assessment['kind'], value: Assessment | undefined) => void;
}) {
  const { issues } = useEditor();
  const index = assessments.findIndex((item) => item.kind === kind);
  const flags = (value: Assessment['kind']) => {
    const position = assessments.findIndex((item) => item.kind === value);
    return position < 0 ? 0 : issueCount(issues, `assessments[${position}]`);
  };
  return (
    <div className="ed-assessments">
      <div className="ed-assessments-head">
        <Segmented label="Évaluation affichée" value={kind} onChange={onKind} options={[
          { value: 'midterm', label: `Bilan intermédiaire${flags('midterm') ? ` (${flags('midterm')})` : ''}` },
          { value: 'final', label: `Examen blanc${flags('final') ? ` (${flags('final')})` : ''}` },
        ]} />
      </div>
      <AssessmentEditor key={kind} kind={kind} assessment={assessments[index]} path={`assessments[${index < 0 ? assessments.length : index}]`}
        onChange={(value) => onChange(kind, value)} />
    </div>
  );
}
