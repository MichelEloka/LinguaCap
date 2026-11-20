import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { Link, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import { ArrowDown, ArrowLeft, ArrowUp, Eye, Plus, Save, Send, Trash2 } from 'lucide-react';
import { Badge, EmptyState, Inspector } from '../../components/ui';
import { requestApi } from '../../integration/api';
import { ExerciseActivity, LessonActivity, type ActivityDetail, type Placement } from './LearnerSession';
import { latestVersion, MediaPreview, versionStatus, type Asset, type MediaFile } from './MediaLibrary';
import './catalogue.css';

type Competence = 'lecture' | 'ecoute' | 'expression-ecrite' | 'expression-orale';
type Kind = 'lesson' | 'exercise' | 'review' | 'assessment';
type Status = 'draft' | 'published' | 'retired';
interface DraftOption { id: string; label: string; correct: boolean }
interface DraftQuestion { id: string; prompt: string; moduleRef: string | null; options: DraftOption[] }
interface DraftPlacement {
  assetId: string; assetVersion: number; usage: 'illustration' | 'audio'; alt: string | null; caption: string | null;
  transcriptVisibility: 'on_demand' | 'after_answer' | 'hidden'; decorative: boolean; questionId: string | null; optionId: string | null;
}
interface DraftLesson { title: string; description: string; transcript: string | null }
interface DraftActivity {
  id: string; kind: Kind; title: string; estimatedMinutes: number; competences: Competence[];
  lesson: DraftLesson | null; questions: DraftQuestion[]; placements: DraftPlacement[];
}
interface DraftModule { id: string; title: string; objective: string; prerequisites: string[]; activities: DraftActivity[] }
interface Settings {
  expectedCompetences: Competence[]; successCriteria: string; passPercent: number; reviewMinutes: number;
  midtermMinutes: number; finalMinutes: number;
}
interface DraftDiagnostic { title: string; description: string; questions: DraftQuestion[] }
interface Criterion { id: string; label: string; maxPoints: number }
interface Part {
  id: string; competence: Competence; mode: 'closed' | 'written' | 'oral'; title: string; instructions: string;
  questions: DraftQuestion[]; criteria: Criterion[]; placements: DraftPlacement[];
}
interface Assessment { kind: 'midterm' | 'final'; title: string; description: string; parts: Part[] }
interface Content { settings: Settings; diagnostic: DraftDiagnostic | null; modules: DraftModule[]; assessments: Assessment[] }
interface VersionDoc extends Content {
  id: string; levelId: string; levelCode: string; levelTitle: string; number: number; status: Status;
  publishedAt: string | null; updatedAt: string | null;
}
interface Checks { publishable: boolean; issues: { path: string; message: string }[] }
interface VersionSummary { id: string; number: number; status: Status; publishedAt: string | null; retiredAt: string | null; updatedAt: string | null }
interface CatalogueLevel {
  id: string; code: string; title: string; description: string | null; position: number | null; status: 'draft' | 'published';
  prerequisiteLevelId: string | null; prerequisiteLevelCode: string | null; versions: VersionSummary[];
}

const competences: { id: Competence; label: string }[] = [
  { id: 'lecture', label: 'Lecture' }, { id: 'ecoute', label: 'Écoute' },
  { id: 'expression-ecrite', label: 'Expression écrite' }, { id: 'expression-orale', label: 'Expression orale' },
];
const kinds: Record<Kind, string> = { lesson: 'Leçon', exercise: 'Exercice', review: 'Révision', assessment: 'Évaluation' };
const statusLabel: Record<Status, { label: string; tone: 'amber' | 'green' | 'neutral' }> = {
  draft: { label: 'Brouillon', tone: 'amber' }, published: { label: 'Publiée', tone: 'green' }, retired: { label: 'Retirée', tone: 'neutral' },
};
const dateFormat = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });

function getError(error: unknown) {
  return error instanceof Error ? error.message : 'Cette action est temporairement indisponible.';
}

/**
 * Identifiant unique proposé à la création : il reste stable ensuite pour que la progression des élèves suive.
 * Le planning réserve les révisions de module (revision-…), le diagnostic, le bilan et l'examen blanc.
 */
function uniqueId(base: string, taken: string[]) {
  const safe = base.startsWith('revision-') || ['diagnostic', 'bilan-intermediaire', 'examen-blanc'].includes(base) ? `a-${base}` : base;
  let candidate = safe;
  for (let index = 2; taken.includes(candidate); index++) candidate = `${safe}-${index}`;
  return candidate;
}

function move<T>(items: T[], index: number, offset: number) {
  const target = index + offset;
  if (target < 0 || target >= items.length) return items;
  const next = [...items];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

function replaceAt<T>(items: T[], index: number, value: T) {
  return items.map((item, position) => position === index ? value : item);
}

function newQuestion(questions: DraftQuestion[]): DraftQuestion {
  return {
    id: uniqueId(`q${questions.length + 1}`, questions.map((question) => question.id)), prompt: '', moduleRef: null,
    options: [{ id: 'a', label: '', correct: true }, { id: 'b', label: '', correct: false }],
  };
}

function EditorItem({ title, initiallyOpen = false, children }: { title: ReactNode; initiallyOpen?: boolean; children: ReactNode }) {
  const [open, setOpen] = useState(initiallyOpen);
  return (
    <details className="editor-item" open={open} onToggle={(event) => setOpen(event.currentTarget.open)}>
      <summary>{title}</summary>
      {children}
    </details>
  );
}

function MoveButtons({ index, count, label, onMove, onRemove }: {
  index: number; count: number; label: string; onMove: (offset: number) => void; onRemove: () => void;
}) {
  return (
    <span className="editor-tools">
      <button type="button" className="icon-btn" onClick={() => onMove(-1)} disabled={index === 0} aria-label={`Monter ${label}`}><ArrowUp size={16} /></button>
      <button type="button" className="icon-btn" onClick={() => onMove(1)} disabled={index === count - 1} aria-label={`Descendre ${label}`}><ArrowDown size={16} /></button>
      <button type="button" className="icon-btn" onClick={onRemove} aria-label={`Supprimer ${label}`}><Trash2 size={16} /></button>
    </span>
  );
}

function CompetenceChoice({ value, onChange, legend }: { value: Competence[]; onChange: (value: Competence[]) => void; legend: string }) {
  return (
    <fieldset className="editor-checks">
      <legend>{legend}</legend>
      {competences.map((item) => (
        <label key={item.id}>
          <input type="checkbox" checked={value.includes(item.id)}
            onChange={(event) => onChange(event.target.checked ? [...value, item.id] : value.filter((entry) => entry !== item.id))} /> {item.label}
        </label>
      ))}
    </fieldset>
  );
}

/** Questions fermées avec leur corrigé : une seule bonne réponse, deux à huit choix. */
function QuestionsEditor({ questions, onChange, moduleRefs }: {
  questions: DraftQuestion[]; onChange: (questions: DraftQuestion[]) => void; moduleRefs?: { id: string; label: string }[];
}) {
  return (
    <div className="stack">
      {questions.map((question, index) => {
        const update = (value: Partial<DraftQuestion>) => onChange(replaceAt(questions, index, { ...question, ...value }));
        return (
          <fieldset className="editor-question" key={index}>
            <legend>Question {index + 1} <code>{question.id}</code></legend>
            <MoveButtons index={index} count={questions.length} label={`la question ${index + 1}`}
              onMove={(offset) => onChange(move(questions, index, offset))} onRemove={() => onChange(questions.filter((_, position) => position !== index))} />
            <label>Énoncé<textarea rows={2} maxLength={500} value={question.prompt} onChange={(event) => update({ prompt: event.target.value })} /></label>
            {moduleRefs && (
              <label>Module évalué<select value={question.moduleRef ?? ''} onChange={(event) => update({ moduleRef: event.target.value || null })}>
                <option value="">À choisir</option>
                {moduleRefs.map((ref) => <option key={ref.id} value={ref.id}>{ref.label}</option>)}
              </select></label>
            )}
            <div className="stack" role="group" aria-label={`Choix de la question ${index + 1}`}>
              {question.options.map((option, optionIndex) => (
                <div className="editor-option" key={optionIndex}>
                  <label className="editor-correct">
                    <input type="radio" name={`correct-${question.id}-${index}`} checked={option.correct}
                      onChange={() => update({ options: question.options.map((item, position) => ({ ...item, correct: position === optionIndex })) })} />
                    <span className="visually-hidden">Bonne réponse : choix {option.id}</span>
                  </label>
                  <label className="editor-grow"><span className="visually-hidden">Libellé du choix {option.id}</span>
                    <input maxLength={300} value={option.label} placeholder={`Choix ${option.id}`}
                      onChange={(event) => update({ options: replaceAt(question.options, optionIndex, { ...option, label: event.target.value }) })} />
                  </label>
                  <button type="button" className="icon-btn" disabled={question.options.length <= 2} aria-label={`Supprimer le choix ${option.id}`}
                    onClick={() => update({ options: question.options.filter((_, position) => position !== optionIndex) })}><Trash2 size={16} /></button>
                </div>
              ))}
              <button type="button" className="btn btn-outline btn-small" disabled={question.options.length >= 8}
                onClick={() => update({ options: [...question.options, { id: uniqueId(String.fromCharCode(97 + question.options.length), question.options.map((item) => item.id)), label: '', correct: false }] })}>
                <Plus size={15} aria-hidden="true" /> Ajouter un choix
              </button>
            </div>
          </fieldset>
        );
      })}
      <button type="button" className="btn btn-outline btn-small" onClick={() => onChange([...questions, newQuestion(questions)])}>
        <Plus size={15} aria-hidden="true" /> Ajouter une question
      </button>
    </div>
  );
}

/** Supports d'une activité ou d'une partie : média versionné de la médiathèque, cible, textes et transcription. */
function PlacementsEditor({ placements, questions, assets, token, onChange }: {
  placements: DraftPlacement[]; questions: DraftQuestion[]; assets: Asset[]; token: string; onChange: (placements: DraftPlacement[]) => void;
}) {
  const [adding, setAdding] = useState('');
  const [previewing, setPreviewing] = useState<number | null>(null);

  function add() {
    const asset = assets.find((item) => item.id === adding);
    if (!asset) return;
    onChange([...placements, {
      assetId: asset.id, assetVersion: latestVersion(asset), usage: asset.kind === 'image' ? 'illustration' : 'audio',
      alt: asset.kind === 'image' ? asset.alt : null, caption: null, transcriptVisibility: asset.kind === 'audio' ? 'on_demand' : 'hidden',
      decorative: false, questionId: null, optionId: null,
    }]);
    setAdding('');
  }

  return (
    <div className="stack">
      {placements.map((placement, index) => {
        const asset = assets.find((item) => item.id === placement.assetId);
        const update = (value: Partial<DraftPlacement>) => onChange(replaceAt(placements, index, { ...placement, ...value }));
        const target = placement.optionId ? `${placement.questionId}/${placement.optionId}` : placement.questionId ?? '';
        const newest = asset ? latestVersion(asset) : placement.assetVersion;
        return (
          <fieldset className="editor-placement" key={index}>
            <legend>{placement.usage === 'audio' ? 'Son' : 'Image'} · {asset?.title ?? placement.assetId}</legend>
            <MoveButtons index={index} count={placements.length} label={`le support ${index + 1}`}
              onMove={(offset) => onChange(move(placements, index, offset))} onRemove={() => onChange(placements.filter((_, position) => position !== index))} />
            <div className="pilot-form-grid">
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
                {questions.map((question, questionIndex) => [
                  <option key={question.id} value={question.id}>Question {questionIndex + 1}</option>,
                  ...question.options.map((option) => (
                    <option key={`${question.id}/${option.id}`} value={`${question.id}/${option.id}`}>Question {questionIndex + 1} · choix {option.id}</option>
                  )),
                ])}
              </select></label>
            </div>
            {newest > placement.assetVersion && (
              <p className="inline-message">Une version plus récente existe (v{newest}).{' '}
                <button type="button" className="text-link" onClick={() => update({ assetVersion: newest })}>Utiliser la v{newest}</button></p>
            )}
            {placement.usage === 'illustration' && (
              <>
                <label className="editor-inline"><input type="checkbox" checked={placement.decorative}
                  onChange={(event) => update({ decorative: event.target.checked })} /> Image décorative (sans texte alternatif)</label>
                {!placement.decorative && <label>Texte alternatif<textarea rows={2} maxLength={300} value={placement.alt ?? ''}
                  onChange={(event) => update({ alt: event.target.value })} /></label>}
              </>
            )}
            <div className="pilot-form-grid">
              <label>Légende<input maxLength={300} value={placement.caption ?? ''} onChange={(event) => update({ caption: event.target.value || null })} /></label>
              {placement.usage === 'audio' && (
                <label>Transcription<select value={placement.transcriptVisibility}
                  onChange={(event) => update({ transcriptVisibility: event.target.value as DraftPlacement['transcriptVisibility'] })}>
                  <option value="on_demand">À la demande</option>
                  <option value="after_answer">Après la réponse</option>
                  <option value="hidden">Masquée</option>
                </select></label>
              )}
            </div>
            <button type="button" className="btn btn-outline btn-small" onClick={() => setPreviewing(previewing === index ? null : index)}>
              <Eye size={15} aria-hidden="true" /> {previewing === index ? 'Masquer l’aperçu' : 'Aperçu du fichier'}
            </button>
            {previewing === index && <MediaPreview assetId={placement.assetId} version={placement.assetVersion} token={token} />}
          </fieldset>
        );
      })}
      <div className="editor-add-media">
        <label>Ajouter un support<select value={adding} onChange={(event) => setAdding(event.target.value)}>
          <option value="">Choisir dans la médiathèque</option>
          {assets.map((asset) => <option key={asset.id} value={asset.id}>{asset.kind === 'image' ? 'Image' : 'Son'} · {asset.title}</option>)}
        </select></label>
        <button type="button" className="btn btn-outline btn-small" disabled={!adding} onClick={add}><Plus size={15} aria-hidden="true" /> Ajouter</button>
      </div>
    </div>
  );
}

function ActivityEditor({ activity, onChange, assets, token, onPreview }: {
  activity: DraftActivity; onChange: (activity: DraftActivity) => void; assets: Asset[]; token: string; onPreview: () => void;
}) {
  const update = (value: Partial<DraftActivity>) => onChange({ ...activity, ...value });
  const graded = activity.kind === 'exercise' || activity.kind === 'assessment';
  const lesson = activity.lesson ?? { title: activity.title, description: '', transcript: null };
  return (
    <div className="stack">
      <div className="pilot-form-grid">
        <label>Titre<input maxLength={120} value={activity.title} onChange={(event) => update({ title: event.target.value })} /></label>
        <label>Type<select value={activity.kind} onChange={(event) => {
          const kind = event.target.value as Kind;
          update({ kind, lesson: kind === 'lesson' || kind === 'review' ? lesson : activity.lesson });
        }}>
          {Object.entries(kinds).map(([id, label]) => <option key={id} value={id}>{label}</option>)}
        </select></label>
        <label>Durée estimée (minutes)<input type="number" min={1} max={240} value={activity.estimatedMinutes}
          onChange={(event) => update({ estimatedMinutes: Number(event.target.value) })} /></label>
        <label>Identifiant<input value={activity.id} maxLength={40} pattern="[a-z0-9]+(-[a-z0-9]+)*"
          onChange={(event) => update({ id: event.target.value })} aria-describedby={`id-help-${activity.id}`} />
          <small id={`id-help-${activity.id}`} className="muted">Gardez-le d’une version à l’autre pour que la progression suive.</small></label>
      </div>
      <CompetenceChoice legend="Compétences travaillées" value={activity.competences} onChange={(value) => update({ competences: value })} />
      {(activity.kind === 'lesson' || activity.kind === 'review' || graded) && (
        <fieldset className="stack editor-subsection">
          <legend>{graded ? 'Consigne' : 'Contenu de la leçon'}</legend>
          <label>Titre affiché<input maxLength={120} value={lesson.title} onChange={(event) => update({ lesson: { ...lesson, title: event.target.value } })} /></label>
          <label>{graded ? 'Consigne' : 'Texte'}<textarea rows={graded ? 2 : 6} value={lesson.description}
            onChange={(event) => update({ lesson: { ...lesson, description: event.target.value } })} /></label>
          <label>Transcription des sons<textarea rows={3} lang="de" value={lesson.transcript ?? ''}
            onChange={(event) => update({ lesson: { ...lesson, transcript: event.target.value || null } })} /></label>
        </fieldset>
      )}
      {graded && (
        <fieldset className="stack editor-subsection"><legend>Questions et corrigé</legend>
          <QuestionsEditor questions={activity.questions} onChange={(questions) => update({ questions })} />
        </fieldset>
      )}
      <fieldset className="stack editor-subsection"><legend>Images et sons</legend>
        <PlacementsEditor placements={activity.placements} questions={graded ? activity.questions : []} assets={assets} token={token}
          onChange={(placements) => update({ placements })} />
      </fieldset>
      <button type="button" className="btn btn-outline btn-small" onClick={onPreview}><Eye size={15} aria-hidden="true" /> Aperçu élève</button>
    </div>
  );
}

function ModuleEditor({ module, modules, onChange, assets, token, onPreview }: {
  module: DraftModule; modules: DraftModule[]; onChange: (module: DraftModule) => void; assets: Asset[]; token: string;
  onPreview: (activity: DraftActivity) => void;
}) {
  const update = (value: Partial<DraftModule>) => onChange({ ...module, ...value });
  const allActivityIds = modules.flatMap((item) => item.activities.map((activity) => activity.id));
  const minutes = module.activities.reduce((sum, activity) => sum + (activity.estimatedMinutes || 0), 0);
  return (
    <div className="stack">
      <div className="pilot-form-grid">
        <label>Titre<input maxLength={120} value={module.title} onChange={(event) => update({ title: event.target.value })} /></label>
        <label>Identifiant<input maxLength={64} value={module.id} pattern="[a-z0-9]+(-[a-z0-9]+)*" onChange={(event) => update({ id: event.target.value })} /></label>
      </div>
      <label>Objectif<textarea rows={2} maxLength={500} value={module.objective} onChange={(event) => update({ objective: event.target.value })}
        placeholder="Ce que l’élève saura faire à la fin du module" /></label>
      {modules.length > 1 && (
        <fieldset className="editor-checks"><legend>Prérequis</legend>
          {modules.filter((item) => item.id !== module.id).map((item) => (
            <label key={item.id}><input type="checkbox" checked={module.prerequisites.includes(item.id)} onChange={(event) => update({
              prerequisites: event.target.checked ? [...module.prerequisites, item.id] : module.prerequisites.filter((entry) => entry !== item.id),
            })} /> {item.title || item.id}</label>
          ))}
        </fieldset>
      )}
      <h4>Activités · {minutes} min</h4>
      {module.activities.map((activity, index) => (
        <EditorItem key={index} initiallyOpen={!activity.title}
          title={<>{kinds[activity.kind]} · {activity.title || activity.id} <span className="muted">{activity.estimatedMinutes} min</span></>}>
          <MoveButtons index={index} count={module.activities.length} label={`l’activité ${activity.title || activity.id}`}
            onMove={(offset) => update({ activities: move(module.activities, index, offset) })}
            onRemove={() => update({ activities: module.activities.filter((_, position) => position !== index) })} />
          <ActivityEditor activity={activity} assets={assets} token={token} onPreview={() => onPreview(activity)}
            onChange={(value) => update({ activities: replaceAt(module.activities, index, value) })} />
        </EditorItem>
      ))}
      <button type="button" className="btn btn-outline btn-small" onClick={() => update({
        activities: [...module.activities, {
          id: uniqueId(`${module.id}-activite-${module.activities.length + 1}`.slice(0, 36), allActivityIds), kind: 'lesson', title: '',
          estimatedMinutes: 10, competences: [], lesson: { title: '', description: '', transcript: null }, questions: [], placements: [],
        }],
      })}><Plus size={15} aria-hidden="true" /> Ajouter une activité</button>
    </div>
  );
}

function PartEditor({ part, onChange, assets, token }: { part: Part; onChange: (part: Part) => void; assets: Asset[]; token: string }) {
  const update = (value: Partial<Part>) => onChange({ ...part, ...value });
  const production = part.mode !== 'closed';
  return (
    <div className="stack">
      <div className="pilot-form-grid">
        <label>Titre<input maxLength={120} value={part.title} onChange={(event) => update({ title: event.target.value })} /></label>
        <label>Compétence<select value={part.competence} onChange={(event) => {
          const competence = event.target.value as Competence;
          update({ competence, mode: competence === 'expression-ecrite' ? 'written' : competence === 'expression-orale' ? 'oral' : 'closed' });
        }}>
          {competences.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
        </select></label>
      </div>
      <label>Consigne<textarea rows={3} maxLength={4000} value={part.instructions} onChange={(event) => update({ instructions: event.target.value })} /></label>
      {production ? (
        <fieldset className="stack editor-subsection"><legend>Grille de correction ({part.mode === 'written' ? 'production écrite' : 'production orale'})</legend>
          {part.criteria.map((criterion, index) => (
            <div className="editor-option" key={index}>
              <label className="editor-grow">Critère<input maxLength={200} value={criterion.label}
                onChange={(event) => update({ criteria: replaceAt(part.criteria, index, { ...criterion, label: event.target.value }) })} /></label>
              <label className="editor-points">Points<input type="number" min={1} max={100} value={criterion.maxPoints}
                onChange={(event) => update({ criteria: replaceAt(part.criteria, index, { ...criterion, maxPoints: Number(event.target.value) }) })} /></label>
              <button type="button" className="icon-btn" aria-label={`Supprimer le critère ${index + 1}`}
                onClick={() => update({ criteria: part.criteria.filter((_, position) => position !== index) })}><Trash2 size={16} /></button>
            </div>
          ))}
          <button type="button" className="btn btn-outline btn-small" disabled={part.criteria.length >= 10} onClick={() => update({
            criteria: [...part.criteria, { id: uniqueId(`critere-${part.criteria.length + 1}`, part.criteria.map((item) => item.id)), label: '', maxPoints: 5 }],
          })}><Plus size={15} aria-hidden="true" /> Ajouter un critère</button>
        </fieldset>
      ) : (
        <fieldset className="stack editor-subsection"><legend>Questions et corrigé</legend>
          <QuestionsEditor questions={part.questions} onChange={(questions) => update({ questions })} />
        </fieldset>
      )}
      <fieldset className="stack editor-subsection"><legend>Images et sons</legend>
        <PlacementsEditor placements={part.placements} questions={production ? [] : part.questions} assets={assets} token={token}
          onChange={(placements) => update({ placements })} />
      </fieldset>
    </div>
  );
}

function AssessmentEditor({ kind, assessment, onChange, assets, token }: {
  kind: Assessment['kind']; assessment: Assessment | undefined; onChange: (value: Assessment | undefined) => void; assets: Asset[]; token: string;
}) {
  const name = kind === 'midterm' ? 'Bilan intermédiaire' : 'Examen blanc';
  if (!assessment) {
    return (
      <button type="button" className="btn btn-outline btn-small" onClick={() => onChange({ kind, title: name, description: '', parts: [] })}>
        <Plus size={15} aria-hidden="true" /> Ajouter le {name.toLowerCase()}
      </button>
    );
  }
  const update = (value: Partial<Assessment>) => onChange({ ...assessment, ...value });
  return (
    <div className="stack">
      <div className="pilot-form-grid">
        <label>Titre<input maxLength={120} value={assessment.title} onChange={(event) => update({ title: event.target.value })} /></label>
        <span className="editor-end"><button type="button" className="btn btn-outline btn-small" onClick={() => onChange(undefined)}>
          <Trash2 size={15} aria-hidden="true" /> Retirer le {name.toLowerCase()}</button></span>
      </div>
      <label>Présentation<textarea rows={2} maxLength={2000} value={assessment.description} onChange={(event) => update({ description: event.target.value })} /></label>
      {assessment.parts.map((part, index) => (
        <EditorItem key={index} initiallyOpen={!part.title}
          title={<>Partie {index + 1} · {part.title || competences.find((item) => item.id === part.competence)?.label}</>}>
          <MoveButtons index={index} count={assessment.parts.length} label={`la partie ${index + 1}`}
            onMove={(offset) => update({ parts: move(assessment.parts, index, offset) })}
            onRemove={() => update({ parts: assessment.parts.filter((_, position) => position !== index) })} />
          <PartEditor part={part} assets={assets} token={token} onChange={(value) => update({ parts: replaceAt(assessment.parts, index, value) })} />
        </EditorItem>
      ))}
      <button type="button" className="btn btn-outline btn-small" disabled={assessment.parts.length >= 12} onClick={() => update({
        parts: [...assessment.parts, {
          id: uniqueId(`partie-${assessment.parts.length + 1}`, assessment.parts.map((item) => item.id)), competence: 'lecture', mode: 'closed',
          title: '', instructions: '', questions: [], criteria: [], placements: [],
        }],
      })}><Plus size={15} aria-hidden="true" /> Ajouter une partie</button>
    </div>
  );
}

/** Aperçu dans le lecteur élève, avec les fichiers de la version choisie (brouillons compris). */
function ActivityInspector({ activity, token, onClose }: { activity: DraftActivity; token: string; onClose: () => void }) {
  const [placements, setPlacements] = useState<Placement[] | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    Promise.all(activity.placements.map(async (placement, index): Promise<Placement> => {
      const file = await requestApi<MediaFile>(`/media/${encodeURIComponent(placement.assetId)}/versions/${placement.assetVersion}`, token)
        .catch(() => null);
      return { ...placement, position: index + 1, url: file?.url ?? null };
    })).then((resolved) => { if (active) setPlacements(resolved); });
    return () => { active = false; };
  }, [activity, token, attempt]);

  const graded = activity.kind === 'exercise' || activity.kind === 'assessment';
  const audio = activity.placements.some((placement) => placement.usage === 'audio' && placement.transcriptVisibility === 'on_demand');
  const detail: ActivityDetail | null = placements && {
    id: activity.id, kind: activity.kind, title: activity.title, estimatedMinutes: activity.estimatedMinutes, status: 'todo', state: {},
    attemptId: null, lesson: activity.lesson ? { id: 'apercu', title: activity.lesson.title, description: activity.lesson.description } : null,
    transcript: audio ? activity.lesson?.transcript ?? null : null,
    questions: activity.questions.map((question) => ({ id: question.id, prompt: question.prompt, options: question.options.map((option) => ({ id: option.id, text: option.label })) })),
    placements,
  };
  const renew = () => setAttempt((value) => value + 1);
  return (
    <Inspector title={`Aperçu élève · ${activity.title || activity.id}`} onClose={onClose}>
      <div className="stack pilot-session">
        <p className="muted">{kinds[activity.kind]} · {activity.estimatedMinutes} min</p>
        {!detail ? <p role="status">Préparation de l’aperçu…</p>
          : graded
            ? <ExerciseActivity activity={detail} sessionId="apercu" token={token} grade={null} onRenew={renew} preview
                onSaveState={() => undefined} onGraded={async () => undefined} />
            : <LessonActivity activity={detail} onRenew={renew} busy={false} onComplete={() => undefined} preview />}
      </div>
    </Inspector>
  );
}

const editorSections = [
  { id: 'catalogue-settings', title: 'Réglages' },
  { id: 'catalogue-modules', title: 'Modules' },
  { id: 'catalogue-diagnostic', title: 'Diagnostic initial' },
  { id: 'catalogue-midterm', title: 'Bilan intermédiaire' },
  { id: 'catalogue-final', title: 'Examen blanc' },
];

function Section({ id, title, children, open = false }: { id: string; title: string; children: ReactNode; open?: boolean }) {
  return <details id={id} className="panel editor-section" open={open}><summary><h3>{title}</h3></summary><div className="stack">{children}</div></details>;
}

/** Éditeur d'une version : un brouillon s'enregistre d'un bloc et se reprend ; une version publiée se consulte. */
function VersionEditor({ token }: { token: string }) {
  const { versionId = '' } = useParams();
  const navigate = useNavigate();
  const [version, setVersion] = useState<VersionDoc | null>(null);
  const [content, setContent] = useState<Content | null>(null);
  const [checks, setChecks] = useState<Checks | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState('');
  const [dirty, setDirty] = useState(false);
  const [preview, setPreview] = useState<DraftActivity | null>(null);
  const [previewId, setPreviewId] = useState('');
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
    }).catch((failure: unknown) => { if (active) setError(getError(failure)); });
    return () => { active = false; };
  }, [id, token]);

  if (error && !version) return <section className="panel stack"><p className="inline-message warning" role="alert">{error}</p><Link className="text-link" to="/espace/catalogue">Retour au catalogue</Link></section>;
  if (!version || !content) return <p role="status">Chargement de la version…</p>;

  const readOnly = version.status !== 'draft';
  const activities = content.modules.flatMap((module) => module.activities);
  const change =(value: Partial<Content>) => { setContent({ ...content, ...value }); setDirty(true); setNotice(''); };
  const moduleRefs = [...content.modules.map((module) => ({ id: module.id, label: module.title || module.id })), { id: 'prerequis', label: 'Prérequis du niveau' }];

  async function run(label: string, action: () => Promise<void>) {
    setBusy(label);
    setError('');
    setNotice('');
    try {
      await action();
    } catch (failure) {
      setError(getError(failure));
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
    setNotice(saved.checks.publishable ? 'Brouillon enregistré : il est prêt à être publié.' : 'Brouillon enregistré. Vous pourrez le reprendre plus tard.');
  });

  const publish = () => run('publish', async () => {
    if (dirty) {
      const saved = await requestApi<{ version: VersionDoc; checks: Checks }>(`/catalogue/versions/${id}`, token, { method: 'PUT', body: content });
      setChecks(saved.checks);
      setDirty(false);
      if (!saved.checks.publishable) throw new Error('Le brouillon est enregistré, mais des points restent à compléter avant la publication.');
    }
    const published = await requestApi<{ version: VersionSummary; media: { assetId: string; version: number }[] }>(`/catalogue/versions/${id}/publish`, token, { method: 'POST' });
    setVersion({ ...version, status: published.version.status, publishedAt: published.version.publishedAt });
    setNotice(`Version ${version.number} publiée${published.media.length ? ` avec ${published.media.length} fichier${published.media.length > 1 ? 's' : ''}` : ''} : elle est proposée aux nouvelles attributions.`);
  });

  const retire = () => run('retire', async () => {
    const retired = await requestApi<VersionSummary>(`/catalogue/versions/${id}/retire`, token, { method: 'POST' });
    setVersion({ ...version, status: retired.status });
    setNotice('Version retirée des nouvelles attributions. Les élèves inscrits gardent leur version.');
  });

  const copy = () => run('copy', async () => {
    const draft = await requestApi<VersionDoc>(`/catalogue/levels/${encodeURIComponent(version.levelId)}/versions`, token, {
      method: 'POST', body: { fromVersionId: version.id },
    });
    navigate(`/espace/catalogue/versions/${draft.id}`);
  });

  const midterm = content.assessments.find((item) => item.kind === 'midterm');
  const final = content.assessments.find((item) => item.kind === 'final');
  const setAssessment = (kind: Assessment['kind'], value: Assessment | undefined) => change({
    assessments: [...content.assessments.filter((item) => item.kind !== kind), ...(value ? [value] : [])]
      .sort((a, b) => (a.kind === 'midterm' ? 0 : 1) - (b.kind === 'midterm' ? 0 : 1)),
  });

  return (
    <div className="stack catalogue-editor">
      <Link className="text-link" to="/espace/catalogue"><ArrowLeft size={16} aria-hidden="true" /> Retour au catalogue</Link>
      <section className="panel stack catalogue-workspace editor-version-header" aria-labelledby="version-title">
        <div className="catalogue-heading">
          <div>
            <h2 id="version-title">{version.levelCode} · version {version.number}</h2>
            <p className="muted">{version.levelTitle}{version.updatedAt ? ` · modifiée le ${dateFormat.format(new Date(version.updatedAt))}` : ''}</p>
          </div>
          <Badge tone={statusLabel[version.status].tone}>{statusLabel[version.status].label}</Badge>
        </div>
        {readOnly && <p className="inline-message">Cette version est figée : contenus, corrigés et versions des fichiers ne changent plus. Créez un brouillon à partir d’elle pour la faire évoluer.</p>}
        {activities.length > 0 && (
          <div className="editor-add-media">
            <label>Activité à prévisualiser<select value={previewId} onChange={(event) => setPreviewId(event.target.value)}>
              {activities.map((activity) => <option key={activity.id} value={activity.id}>{activity.title || activity.id}</option>)}
            </select></label>
            <button type="button" className="btn btn-outline btn-small"
              onClick={() => setPreview(activities.find((activity) => activity.id === previewId) ?? activities[0])}>
              <Eye size={15} aria-hidden="true" /> Ouvrir l’aperçu élève</button>
          </div>
        )}
        {checks && !readOnly && (
          checks.publishable
            ? <p className="inline-message" role="status">{dirty ? 'Enregistrez vos modifications pour actualiser les contrôles de publication.' : 'La version peut être publiée.'}</p>
            : (
              <details className="editor-readiness">
                <summary>À compléter avant publication ({checks.issues.length})</summary>
                {dirty && <p className="muted">Contrôles du dernier enregistrement.</p>}
                <ul className="checks-list">{checks.issues.map((issue, index) => <li key={index}>{issue.message}</li>)}</ul>
              </details>
            )
        )}
      </section>

      <div className="editor-layout">
        <nav className="panel editor-navigation" aria-label="Sections de la version">
          <h3>Dans cette version</h3>
          {editorSections.map(({ id, title }) => (
            <a href={`#${id}`} key={id} onClick={() => {
              const section = document.getElementById(id);
              if (section instanceof HTMLDetailsElement) section.open = true;
            }}>{title}</a>
          ))}
        </nav>
        <fieldset className="editor-body" disabled={readOnly || busy !== ''}>
        <Section id="catalogue-settings" title="Réglages et critères de réussite" open>
          <CompetenceChoice legend="Compétences évaluées" value={content.settings.expectedCompetences}
            onChange={(value) => change({ settings: { ...content.settings, expectedCompetences: value } })} />
          <label>Critères de réussite<textarea rows={3} maxLength={2000} value={content.settings.successCriteria}
            onChange={(event) => change({ settings: { ...content.settings, successCriteria: event.target.value } })} /></label>
          <div className="pilot-form-grid">
            {([['passPercent', 'Seuil de réussite (%)', 1, 100], ['reviewMinutes', 'Révision par module (min)', 0, 120],
              ['midtermMinutes', 'Bilan intermédiaire (min)', 0, 240], ['finalMinutes', 'Examen blanc (min)', 0, 300]] as const).map(([key, label, min, max]) => (
              <label key={key}>{label}<input type="number" min={min} max={max} value={content.settings[key]}
                onChange={(event) => change({ settings: { ...content.settings, [key]: Number(event.target.value) } })} /></label>
            ))}
          </div>
        </Section>

        <Section id="catalogue-modules" title={`Modules (${content.modules.length})`} open>
          {content.modules.length === 0 && <EmptyState title="Aucun module" description="Ajoutez un premier module pour structurer le parcours." />}
          {content.modules.map((module, index) => (
            <EditorItem key={index} initiallyOpen={!module.title}
              title={<>Module {index + 1} · {module.title || module.id} <span className="muted">{module.activities.length} activité{module.activities.length > 1 ? 's' : ''}</span></>}>
              <MoveButtons index={index} count={content.modules.length} label={`le module ${module.title || module.id}`}
                onMove={(offset) => change({ modules: move(content.modules, index, offset) })}
                onRemove={() => change({ modules: content.modules.filter((_, position) => position !== index) })} />
              <ModuleEditor module={module} modules={content.modules} assets={assets} token={token} onPreview={setPreview}
                onChange={(value) => change({ modules: replaceAt(content.modules, index, value) })} />
            </EditorItem>
          ))}
          <button type="button" className="btn btn-outline" onClick={() => change({
            modules: [...content.modules, {
              id: uniqueId(`module-${content.modules.length + 1}`, content.modules.map((module) => module.id)), title: '', objective: '',
              prerequisites: [], activities: [],
            }],
          })}><Plus size={16} aria-hidden="true" /> Ajouter un module</button>
        </Section>

        <Section id="catalogue-diagnostic" title="Diagnostic initial">
          {content.diagnostic ? (
            <>
              <div className="pilot-form-grid">
                <label>Titre<input maxLength={120} value={content.diagnostic.title}
                  onChange={(event) => change({ diagnostic: { ...content.diagnostic!, title: event.target.value } })} /></label>
                <span className="editor-end"><button type="button" className="btn btn-outline btn-small" onClick={() => change({ diagnostic: null })}>
                  <Trash2 size={15} aria-hidden="true" /> Retirer le diagnostic</button></span>
              </div>
              <label>Présentation<textarea rows={2} value={content.diagnostic.description}
                onChange={(event) => change({ diagnostic: { ...content.diagnostic!, description: event.target.value } })} /></label>
              <QuestionsEditor questions={content.diagnostic.questions} moduleRefs={moduleRefs}
                onChange={(questions) => change({ diagnostic: { ...content.diagnostic!, questions } })} />
            </>
          ) : (
            <button type="button" className="btn btn-outline btn-small" onClick={() => change({
              diagnostic: { title: `Diagnostic ${version.levelCode}`, description: '', questions: [] },
            })}><Plus size={15} aria-hidden="true" /> Ajouter un diagnostic</button>
          )}
        </Section>

        <Section id="catalogue-midterm" title="Bilan intermédiaire">
          <AssessmentEditor kind="midterm" assessment={midterm} assets={assets} token={token} onChange={(value) => setAssessment('midterm', value)} />
        </Section>
        <Section id="catalogue-final" title="Examen blanc">
          <AssessmentEditor kind="final" assessment={final} assets={assets} token={token} onChange={(value) => setAssessment('final', value)} />
        </Section>
        </fieldset>
      </div>

      {notice && <p className="inline-message" role="status">{notice}</p>}
      {error && <p className="inline-message warning" role="alert">{error}</p>}
      <div className="editor-actions">
        {!readOnly && (
          <>
            <button type="button" className="btn btn-outline" onClick={() => void save()} disabled={busy !== ''}>
              <Save size={17} aria-hidden="true" /> {busy === 'save' ? 'Enregistrement…' : dirty ? 'Enregistrer le brouillon' : 'Enregistré'}
            </button>
            <button type="button" className="btn btn-primary" onClick={() => void publish()} disabled={busy !== ''}>
              <Send size={17} aria-hidden="true" /> {busy === 'publish' ? 'Publication…' : 'Publier cette version'}
            </button>
          </>
        )}
        {version.status === 'published' && (
          <button type="button" className="btn btn-outline" onClick={() => void retire()} disabled={busy !== ''}>Retirer des attributions</button>
        )}
        {readOnly && (
          <button type="button" className="btn btn-primary" onClick={() => void copy()} disabled={busy !== ''}>
            <Plus size={17} aria-hidden="true" /> Nouveau brouillon à partir de cette version
          </button>
        )}
      </div>
      {preview && <ActivityInspector activity={preview} token={token} onClose={() => setPreview(null)} />}
    </div>
  );
}

function LevelInspector({ level, levels, token, onClose, onDone }: {
  level: CatalogueLevel; levels: CatalogueLevel[]; token: string; onClose: () => void; onDone: (levels: CatalogueLevel[]) => void;
}) {
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

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
    <Inspector title={`Modifier le niveau ${level.code}`} onClose={onClose}>
      <form className="teacher-form stack" onSubmit={submit}>
        <label>Titre<input name="title" required maxLength={120} defaultValue={level.title} /></label>
        <label>Description<textarea name="description" rows={3} maxLength={2000} defaultValue={level.description ?? ''} /></label>
        <div className="pilot-form-grid">
          <label>Position<input name="position" type="number" min={1} max={50} defaultValue={level.position ?? ''} /></label>
          <label>Niveau prérequis<select name="prerequisite" defaultValue={level.prerequisiteLevelId ?? ''}>
            <option value="">Aucun</option>
            {levels.filter((item) => item.id !== level.id).map((item) => <option key={item.id} value={item.id}>{item.code} · {item.title}</option>)}
          </select></label>
        </div>
        {error && <p className="inline-message warning" role="alert">{error}</p>}
        <div className="teacher-form-actions">
          <button type="button" className="btn btn-outline" onClick={onClose}>Fermer</button>
          <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? 'Enregistrement…' : 'Enregistrer'}</button>
        </div>
      </form>
    </Inspector>
  );
}

function CreateLevelInspector({ token, onClose, onCreate }: { token: string; onClose: () => void; onCreate: (code: string) => void }) {
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

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
    <Inspector title="Créer un niveau" onClose={onClose}>
      <form className="teacher-form stack" onSubmit={submit}>
        <label>Code CECRL<input name="code" required pattern="[ABCabc][12]" placeholder="B2" maxLength={2} /></label>
        <label>Titre<input name="title" required maxLength={120} placeholder="Allemand B2" /></label>
        <label>Description<textarea name="description" rows={3} maxLength={2000} /></label>
        {error && <p className="inline-message warning" role="alert">{error}</p>}
        <div className="teacher-form-actions">
          <button type="button" className="btn btn-outline" onClick={onClose}>Fermer</button>
          <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? 'Création…' : 'Créer le niveau'}</button>
        </div>
      </form>
    </Inspector>
  );
}

/** Niveaux, ordre, prérequis et versions de parcours (DEV-047, DEV-057, DEV-058). */
function LevelsView({ token }: { token: string }) {
  const navigate = useNavigate();
  const [levels, setLevels] = useState<CatalogueLevel[] | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
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
    setError('');
    try {
      const created = await requestApi<VersionDoc>(`/catalogue/levels/${encodeURIComponent(level.id)}/versions`, token, {
        method: 'POST', body: { fromVersionId },
      });
      navigate(`/espace/catalogue/versions/${created.id}`);
    } catch (failure) {
      setError(getError(failure));
      setBusy(false);
    }
  }

  /** Échange la position de deux niveaux voisins ; les niveaux sans position prennent leur rang actuel. */
  async function reorder(index: number, offset: number) {
    if (!levels) return;
    const ordered = move(levels, index, offset);
    setBusy(true);
    setError('');
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
      setError(getError(failure));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="panel stack catalogue-workspace" aria-label="Niveaux du catalogue">
      <div className="staff-panel-actions">
        <button type="button" className="btn btn-primary" onClick={() => setLevelAction('create')}><Plus size={17} aria-hidden="true" /> Nouveau niveau</button>
      </div>
      {notice && <p className="inline-message" role="status">{notice}</p>}
      {error && <p className="inline-message warning" role="alert">{error}</p>}
      {levels === null ? (!error && <p role="status">Chargement du catalogue…</p>) : levels.length === 0 ? <EmptyState title="Aucun niveau dans le catalogue" /> : (
        <ol className="catalogue-levels">
          {levels.map((level, index) => {
            const drafted = level.versions.find((item) => item.status === 'draft');
            const published = level.versions.find((item) => item.status === 'published');
            return (
              <li key={level.id} className="catalogue-level">
                <div className="catalogue-level-head">
                  <div className="catalogue-level-title">
                    <span className="catalogue-level-mark" aria-hidden="true">{level.code}</span>
                    <div>
                      <h3>{level.title}</h3>
                      <p className="muted"><span className="visually-hidden">Niveau {level.code} · </span>{level.prerequisiteLevelCode ? `Prérequis ${level.prerequisiteLevelCode}` : 'Sans prérequis'}
                        {' · '}{published ? `version ${published.number} proposée aux attributions` : 'aucune version publiée'}</p>
                    </div>
                  </div>
                  <span className="accounts-actions">
                    <button type="button" className="icon-btn" disabled={busy || index === 0} onClick={() => void reorder(index, -1)} aria-label={`Monter ${level.code}`}><ArrowUp size={16} /></button>
                    <button type="button" className="icon-btn" disabled={busy || index === levels.length - 1} onClick={() => void reorder(index, 1)} aria-label={`Descendre ${level.code}`}><ArrowDown size={16} /></button>
                    <button type="button" className="btn btn-outline" onClick={() => setLevelAction(level)} aria-label={`Modifier le niveau ${level.code}`}>Modifier</button>
                    {drafted
                      ? <Link className="btn btn-primary" to={`/espace/catalogue/versions/${drafted.id}`}>Reprendre le brouillon</Link>
                      : <button type="button" className="btn btn-primary" disabled={busy} onClick={() => void draft(level, published?.id ?? null)}>
                          {published ? 'Nouvelle version' : 'Créer le parcours'}</button>}
                  </span>
                </div>
                {level.versions.length > 0 && (
                  <ul className="catalogue-versions">
                    {level.versions.map((item) => (
                      <li key={item.id}>
                        <Link to={`/espace/catalogue/versions/${item.id}`} aria-label={`Ouvrir ${level.code} version ${item.number}`}>Version {item.number}</Link>
                        <Badge tone={statusLabel[item.status].tone}>{statusLabel[item.status].label}</Badge>
                        <span className="muted">{item.publishedAt ? `publiée le ${dateFormat.format(new Date(item.publishedAt))}` : item.updatedAt ? `modifiée le ${dateFormat.format(new Date(item.updatedAt))}` : ''}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ol>
      )}
      {levelAction && levelAction !== 'create' && levels && <LevelInspector level={levelAction} levels={levels} token={token} onClose={() => setLevelAction(null)} onDone={(updated) => {
        setLevelAction((current) => current === levelAction ? null : current);
        setLevels(updated);
        setNotice(`Niveau ${levelAction.code} enregistré.`);
      }} />}
      {levelAction === 'create' && <CreateLevelInspector token={token} onClose={() => setLevelAction(null)} onCreate={(code) => {
        setLevelAction((current) => current === 'create' ? null : current);
        setNotice(`Le niveau ${code} est créé : préparez maintenant son parcours.`);
        setRefresh((value) => value + 1);
      }} />}
    </section>
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
