/**
 * Formulaires de l'éditeur de parcours : réglages, modules, activités, questions et corrigés, supports, diagnostic et
 * évaluations. Le document reste celui du service Catalogue ; seules la présentation et la saisie sont ici.
 * V4 : questions typées (choix, compléter, remettre en ordre, associer, dictée, répétition orale) avec explication et
 * retour par choix, activité « mission » et vocabulaire du module.
 */
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import {
  ArrowDownUp, BookA, BookOpen, BookOpenText, Check, ChevronDown, ChevronRight, CircleAlert, ClipboardCheck, Clock, Ear, Eye, EyeOff, Flag,
  GraduationCap, Headphones, ImagePlus, Images, Layers, Lightbulb, Link2, ListChecks, MessageSquareText, Mic, PencilLine, Plus, RotateCcw, Scale,
  Settings2, SquareDashedBottom, Stethoscope, Target, TextCursorInput, Trash2, Volume2, type LucideIcon,
} from 'lucide-react';
import { Badge, EmptyState } from '../../components/ui';
import { Bars, Callout, Card, ProgressRing, SearchField, Segmented } from '../../design/kit';
import {
  countWords, defaultSpeakThreshold, fillSegments, missionLimits, partOfSpeechLabels, partsOfSpeech, questionTypeLabels, questionTypeOf, questionTypes,
  type ActivityKind, type DictationSpec, type DraftVocabularyEntry, type FillBlankSpec, type FillSpec, type GermanArticle, type MatchSpec,
  type MissionDefinition, type OrderSpec, type PartOfSpeech, type QuestionSpec, type QuestionType, type SpeakSpec,
} from '../../integration/v4';
import { latestVersion, MediaPreview, versionStatus, type Asset } from './MediaLibrary';
import { MediaPicker, MediaThumb } from './editor-media';
import { Collapsible, ConfirmDialog, Disclosure, IconAction, MoveTools, TextWithPreview, ToggleChips } from './editor-parts';

export type Competence = 'lecture' | 'ecoute' | 'expression-ecrite' | 'expression-orale';
export type Kind = ActivityKind;
export type Status = 'draft' | 'published' | 'retired';
/** Choix de réponse ; V4 : retour propre au choix (500 caractères au plus). */
export interface DraftOption { id: string; label: string; correct: boolean; feedback?: string | null }
/**
 * Question du document. V4 : `type` (null ou absent = choix), `explanation` et `spec` (champs du type) ; `options` est
 * vide hors choix. Le diagnostic et les parties d'évaluation restent des choix.
 */
export interface DraftQuestion {
  id: string; prompt: string; moduleRef: string | null; options: DraftOption[];
  type?: QuestionType | null; explanation?: string | null; spec?: QuestionSpec | null;
}
export interface DraftPlacement {
  assetId: string; assetVersion: number; usage: 'illustration' | 'audio'; alt: string | null; caption: string | null;
  transcriptVisibility: 'on_demand' | 'after_answer' | 'hidden'; decorative: boolean; questionId: string | null; optionId: string | null;
}
export interface DraftLesson { title: string; description: string; transcript: string | null }
export interface DraftActivity {
  id: string; kind: Kind; title: string; estimatedMinutes: number; competences: Competence[];
  lesson: DraftLesson | null; questions: DraftQuestion[]; placements: DraftPlacement[];
  /** V4 : définition de la mission (null hors mission). */
  mission?: MissionDefinition | null;
}
export interface DraftModule {
  id: string; title: string; objective: string; prerequisites: string[]; activities: DraftActivity[];
  /** V4 : vocabulaire du module (le son est résolu par l'import des contenus). */
  vocabulary?: DraftVocabularyEntry[];
}
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
  mission: { label: 'Mission', icon: Target },
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

function newQuestion(questions: DraftQuestion[], typed: boolean): DraftQuestion {
  return {
    id: uniqueId(`q${questions.length + 1}`, questions.map((question) => question.id)), prompt: '', moduleRef: null,
    options: typed ? [{ id: 'a', label: '', correct: true, feedback: null }, { id: 'b', label: '', correct: false, feedback: null }]
      : [{ id: 'a', label: '', correct: true }, { id: 'b', label: '', correct: false }],
    ...(typed ? { type: 'choice' as const, explanation: '', spec: null } : {}),
  };
}

/** Mission par défaut : une partie orale, une partie écrite et deux points de vérification à rédiger. */
export function defaultMission(): MissionDefinition {
  return { oral: { prompt: '', maxSeconds: 120 }, written: { prompt: '', maxChars: 1500, minWords: 25 }, checklist: ['', ''] };
}

export function newActivity(kind: Kind, moduleId: string, taken: string[]): DraftActivity {
  return {
    id: uniqueId(`${moduleId}-activite-${taken.length + 1}`.slice(0, 36), taken), kind, title: '', estimatedMinutes: kind === 'mission' ? 20 : 10,
    competences: kind === 'mission' ? ['expression-orale', 'expression-ecrite'] : [],
    lesson: { title: '', description: '', transcript: null }, questions: [], placements: [], mission: kind === 'mission' ? defaultMission() : null,
  };
}

function AddCard({ icon: Icon = Plus, children, onClick, disabled }: { icon?: LucideIcon; children: ReactNode; onClick: () => void; disabled?: boolean }) {
  return <button type="button" className="ed-add-card" onClick={onClick} disabled={disabled}><span><Icon size={17} aria-hidden="true" /></span>{children}</button>;
}

// ---------------------------------------------------------------------------------------------------------------------
// Questions typées (V4) : un formulaire par type, explication et retour par choix
// ---------------------------------------------------------------------------------------------------------------------

const questionTypeIcons: Record<QuestionType, LucideIcon> = {
  choice: ListChecks, fill: TextCursorInput, order: ArrowDownUp, match: Link2, dictation: Headphones, speak: Mic,
};
const questionTypeHints: Record<QuestionType, string> = {
  choice: 'Une seule bonne réponse parmi deux à huit choix.',
  fill: 'Un texte avec un ou plusieurs trous [[1]] à compléter.',
  order: 'Des mots à remettre dans l’ordre ; toutes les variantes justes sont acceptées.',
  match: 'Des paires à associer (deux à six).',
  dictation: 'L’élève écoute le son de la question et écrit ce qu’il entend.',
  speak: 'L’élève écoute le modèle puis répète ; la reconnaissance vocale vérifie.',
};

/** Champs propres à un type, à la création ou au changement de type. */
function defaultSpec(type: QuestionType): QuestionSpec | null {
  switch (type) {
    case 'fill': return { text: '', blanks: [] };
    case 'order': return { answers: [[]] };
    case 'match': return { pairs: [{ left: '', right: '' }, { left: '', right: '' }] };
    case 'dictation': return { accept: [''], showWordCount: true };
    case 'speak': return { text: '', accept: [''], threshold: 80 };
    default: return null;
  }
}
const specOf = <T extends QuestionSpec>(question: DraftQuestion, type: QuestionType) => (question.spec ?? defaultSpec(type)) as T;

/** Jetons d'une solution saisie « Ich / bleibe / zu Hause, / weil … ». */
const splitTokens = (value: string) => value.split('/').map((token) => token.trim()).filter(Boolean);
const tokenKey = (tokens: string[]) => [...tokens].sort().join('\u0000');

/** Trous du texte dans l'ordre : chaque marqueur [[id]] garde son corrigé, un nouveau marqueur reçoit un corrigé vide. */
function syncBlanks(text: string, blanks: FillBlankSpec[]): FillBlankSpec[] {
  const ids = [...new Set(fillSegments(text).flatMap((segment) => (segment.kind === 'blank' ? [segment.id] : [])))];
  return ids.map((id) => {
    const found = blanks.find((blank) => blank.id === id);
    return found ? withBlankDefaults(found) : { id, accept: [''], size: 8, hint: null };
  });
}

/** Un document importé peut omettre la largeur et l'indice d'un trou : largeur déduite de la réponse la plus longue. */
export function withBlankDefaults(blank: FillBlankSpec): FillBlankSpec {
  const longest = Math.max(4, ...(blank.accept ?? []).map((answer) => answer.length));
  return { ...blank, size: blank.size ?? Math.min(40, longest + 2), hint: blank.hint ?? null };
}

/** Résumé d'une question dans sa ligne repliée. */
function questionSummary(question: DraftQuestion): string {
  const type = questionTypeOf(question);
  if (type === 'choice') {
    const correct = question.options.find((option) => option.correct);
    return [correct ? `Réponse ${correct.id.toUpperCase()} : ${correct.label || '—'}` : 'Bonne réponse à choisir', `${question.options.length} choix`].join(' · ');
  }
  if (type === 'fill') {
    const spec = specOf<FillSpec>(question, type);
    return `${spec.blanks.length} trou${spec.blanks.length > 1 ? 's' : ''}${spec.blanks.length ? ` · ${spec.blanks.map((blank) => blank.accept[0] || '…').join(', ')}` : ''}`;
  }
  if (type === 'order') {
    const spec = specOf<OrderSpec>(question, type);
    const first = spec.answers[0] ?? [];
    return `${first.length} jeton${first.length > 1 ? 's' : ''}${spec.answers.length > 1 ? ` · ${spec.answers.length - 1} variante${spec.answers.length > 2 ? 's' : ''}` : ''}`;
  }
  if (type === 'match') return `${specOf<MatchSpec>(question, type).pairs.length} paires`;
  if (type === 'dictation') return `« ${specOf<DictationSpec>(question, type).accept[0] || '…'} »`;
  const speak = specOf<SpeakSpec>(question, type);
  return `« ${speak.text || '…'} » · seuil ${speak.threshold} %`;
}

/** Réponses acceptées : la première est la réponse attendue, les suivantes des variantes. */
function AnswerList({ label, values, onChange, path, first = 'Réponse attendue', other = 'Variante acceptée', addLabel = 'Ajouter une variante', max = 12, help }: {
  label: string; values: string[]; onChange: (values: string[]) => void; path?: string; first?: string; other?: string; addLabel?: string; max?: number; help?: string;
}) {
  const { readOnly } = useEditor();
  const list = values.length ? values : [''];
  return (
    <div className="ed-answers" role="group" aria-label={label} data-path={path}>
      <span className="ed-answers-label">{label}</span>
      {list.map((value, index) => (
        <div className={`ed-answer${index === 0 ? ' is-main' : ''}`} key={index}>
          <label className="ed-answer-field"><span className="sr-only">{index === 0 ? first : `${other} ${index}`}</span>
            <input lang="de" maxLength={300} value={value} placeholder={index === 0 ? first : `${other} ${index}`}
              onChange={(event) => onChange(replaceAt(list, index, event.target.value))} />
          </label>
          {!readOnly && list.length > 1 && <IconAction icon={Trash2} tone="danger" label={`Retirer ${index === 0 ? first.toLowerCase() : `la variante ${index}`}`}
            onClick={() => onChange(list.filter((_, position) => position !== index))} />}
        </div>
      ))}
      {help && <small className="ed-help">{help}</small>}
      {!readOnly && list.length < max && (
        <button type="button" className="btn btn-ghost btn-sm ed-add-option" onClick={() => onChange([...list, ''])}><Plus size={15} aria-hidden="true" /> {addLabel}</button>
      )}
    </div>
  );
}

/** Saisie d'une solution `order` : jetons séparés par « / », gardés tels quels pendant la frappe. */
function TokenLine({ tokens, label, onChange }: { tokens: string[]; label: string; onChange: (tokens: string[]) => void }) {
  const [raw, setRaw] = useState(tokens.join(' / '));
  useEffect(() => {
    setRaw((current) => (splitTokens(current).join('\u0000') === tokens.join('\u0000') ? current : tokens.join(' / ')));
  }, [tokens]);
  return (
    <label className="ed-token-line"><span className="sr-only">{label}</span>
      <input lang="de" maxLength={600} value={raw} placeholder="Ich / bleibe / zu Hause, / weil / ich / krank / bin."
        onChange={(event) => { setRaw(event.target.value); onChange(splitTokens(event.target.value)); }} />
    </label>
  );
}

function FillForm({ question, at, update }: { question: DraftQuestion; at: string; update: (value: Partial<DraftQuestion>) => void }) {
  const { readOnly } = useEditor();
  const spec = specOf<FillSpec>(question, 'fill');
  const area = useRef<HTMLTextAreaElement>(null);
  const set = (value: Partial<FillSpec>) => {
    const next = { ...spec, ...value };
    update({ spec: { ...next, blanks: syncBlanks(next.text, next.blanks) } });
  };
  function insertBlank() {
    const used = new Set(spec.blanks.map((blank) => blank.id));
    let number = 1;
    while (used.has(String(number))) number += 1;
    const field = area.current;
    const start = field?.selectionStart ?? spec.text.length;
    const end = field?.selectionEnd ?? spec.text.length;
    const marker = `[[${number}]]`;
    set({ text: `${spec.text.slice(0, start)}${marker}${spec.text.slice(end)}` });
    requestAnimationFrame(() => { field?.focus(); field?.setSelectionRange(start + marker.length, start + marker.length); });
  }
  const segments = fillSegments(spec.text);
  return (
    <div className="ed-typed" data-path={`${at}.spec`}>
      <div className="ed-fill-head">
        <label htmlFor={`${at}-fill`} className="ed-answers-label">Texte à trous</label>
        {!readOnly && <button type="button" className="btn btn-soft btn-sm" onClick={insertBlank}><SquareDashedBottom size={15} aria-hidden="true" /> Insérer un trou</button>}
      </div>
      <textarea id={`${at}-fill`} ref={area} rows={3} lang="de" maxLength={1000} value={spec.text} placeholder="Ich bleibe zu Hause, [[1]] ich krank bin."
        onChange={(event) => set({ text: event.target.value })} />
      {spec.text.trim() && (
        <p className="ed-fill-preview" lang="de" aria-label="Aperçu du texte à trous">
          {segments.map((segment, index) => segment.kind === 'text'
            ? <span key={index}>{segment.text}</span>
            : <mark key={index} className="ed-blank">{spec.blanks.find((blank) => blank.id === segment.id)?.accept[0] || `trou ${segment.id}`}</mark>)}
        </p>
      )}
      {spec.blanks.length === 0
        ? <p className="ed-empty-inline"><SquareDashedBottom size={18} aria-hidden="true" /> Placez au moins un trou avec [[1]] (bouton « Insérer un trou »).</p>
        : spec.blanks.map((blank, index) => (
          <div className="ed-blank-card" key={blank.id}>
            <span className="ed-blank-tag" aria-hidden="true">[[{blank.id}]]</span>
            <div className="ed-blank-fields">
              <AnswerList label={`Réponses acceptées du trou ${blank.id}`} values={blank.accept} path={`${at}.spec.blanks[${index}]`}
                help="Listez toutes les formes justes (« zum » et « zu dem »…)."
                onChange={(accept) => set({ blanks: replaceAt(spec.blanks, index, { ...blank, accept }) })} />
              <div className="ed-grid-2">
                <label>Largeur (caractères)<input type="number" min={1} max={40} value={blank.size ?? 8}
                  onChange={(event) => set({ blanks: replaceAt(spec.blanks, index, { ...blank, size: Number(event.target.value) || 1 }) })} /></label>
                <label>Indice (facultatif)<input maxLength={80} value={blank.hint ?? ''} placeholder="weil / denn"
                  onChange={(event) => set({ blanks: replaceAt(spec.blanks, index, { ...blank, hint: event.target.value || null }) })} /></label>
              </div>
            </div>
          </div>
        ))}
    </div>
  );
}

function OrderForm({ question, at, update }: { question: DraftQuestion; at: string; update: (value: Partial<DraftQuestion>) => void }) {
  const { readOnly } = useEditor();
  const spec = specOf<OrderSpec>(question, 'order');
  const answers = spec.answers.length ? spec.answers : [[]];
  const set = (next: string[][]) => update({ spec: { answers: next } });
  const main = answers[0];
  const mismatch = answers.slice(1).some((answer) => answer.length && tokenKey(answer) !== tokenKey(main));
  return (
    <div className="ed-typed" data-path={`${at}.spec`}>
      <span className="ed-answers-label">Solution, jeton par jeton</span>
      <small className="ed-help">Séparez les jetons par « / ». Les variantes reprennent les mêmes jetons dans un autre ordre juste.</small>
      {answers.map((tokens, index) => (
        <div className={`ed-answer${index === 0 ? ' is-main' : ''}`} key={index}>
          <span className="ed-answer-tag">{index === 0 ? 'Solution' : `Variante ${index}`}</span>
          <TokenLine tokens={tokens} label={index === 0 ? 'Solution principale' : `Variante ${index}`} onChange={(next) => set(replaceAt(answers, index, next))} />
          {!readOnly && index > 0 && <IconAction icon={Trash2} tone="danger" label={`Retirer la variante ${index}`} onClick={() => set(answers.filter((_, position) => position !== index))} />}
          {!readOnly && index === 0 && answers.length > 1 && <span className="ed-answer-spacer" aria-hidden="true" />}
        </div>
      ))}
      {main.length > 0 && (
        <div className="ed-token-preview" aria-label="Jetons proposés à l’élève (dans le désordre)">
          {main.map((token, index) => <span key={index} className="ed-token" lang="de">{token}</span>)}
          <small className="ed-help">{main.length} jeton{main.length > 1 ? 's' : ''}{main.length > 16 ? ' : 16 au plus' : ''}</small>
        </div>
      )}
      {mismatch && <Callout tone="warning">Une variante n’utilise pas exactement les mêmes jetons que la solution.</Callout>}
      {!readOnly && answers.length < 6 && (
        <button type="button" className="btn btn-ghost btn-sm ed-add-option" disabled={!main.length} onClick={() => set([...answers, [...main]])}>
          <Plus size={15} aria-hidden="true" /> Ajouter un autre ordre juste</button>
      )}
    </div>
  );
}

function MatchForm({ question, at, update }: { question: DraftQuestion; at: string; update: (value: Partial<DraftQuestion>) => void }) {
  const { readOnly } = useEditor();
  const spec = specOf<MatchSpec>(question, 'match');
  const set = (pairs: MatchSpec['pairs']) => update({ spec: { pairs } });
  const duplicates = new Set(spec.pairs.map((pair) => pair.left.trim()).filter((value, index, list) => value && list.indexOf(value) !== index));
  return (
    <div className="ed-typed" data-path={`${at}.spec`}>
      <span className="ed-answers-label">Paires à associer</span>
      <div className="ed-pairs" role="group" aria-label="Paires">
        {spec.pairs.map((pair, index) => (
          <div className={`ed-pair${duplicates.has(pair.left.trim()) ? ' is-warning' : ''}`} key={index}>
            <span className="ed-pair-num" aria-hidden="true">{index + 1}</span>
            <label><span className="sr-only">Élément de gauche {index + 1}</span>
              <input lang="de" maxLength={120} value={pair.left} placeholder="warten" onChange={(event) => set(replaceAt(spec.pairs, index, { ...pair, left: event.target.value }))} /></label>
            <Link2 size={15} className="ed-pair-link" aria-hidden="true" />
            <label><span className="sr-only">Élément de droite {index + 1}</span>
              <input maxLength={120} value={pair.right} placeholder="auf + accusatif" onChange={(event) => set(replaceAt(spec.pairs, index, { ...pair, right: event.target.value }))} /></label>
            {!readOnly && <IconAction icon={Trash2} tone="danger" label={`Retirer la paire ${index + 1}`} disabled={spec.pairs.length <= 2}
              onClick={() => set(spec.pairs.filter((_, position) => position !== index))} />}
          </div>
        ))}
      </div>
      {duplicates.size > 0 && <Callout tone="warning">Deux paires ont le même élément de gauche.</Callout>}
      {!readOnly && spec.pairs.length < 6 && (
        <button type="button" className="btn btn-ghost btn-sm ed-add-option" onClick={() => set([...spec.pairs, { left: '', right: '' }])}><Plus size={15} aria-hidden="true" /> Ajouter une paire</button>
      )}
    </div>
  );
}

/** Son de question attendu pour une dictée ou une répétition (support « Illustre : question n »). */
function QuestionSoundStatus({ question, index, placements, type }: { question: DraftQuestion; index: number; placements?: DraftPlacement[]; type: 'dictation' | 'speak' }) {
  if (!placements) return null;
  const sound = placements.find((placement) => placement.questionId === question.id && !placement.optionId && placement.usage === 'audio');
  const visibility = type === 'dictation' ? 'Après la réponse' : 'À la demande';
  const ok = sound && (type === 'speak' || sound.transcriptVisibility !== 'on_demand');
  return (
    <p className={`ed-sound-status${ok ? ' is-ok' : ''}`}>
      {ok ? <Check size={15} aria-hidden="true" /> : <Volume2 size={15} aria-hidden="true" />}
      {ok ? `Son de la question ${index + 1} associé (transcription : ${visibility.toLowerCase()}).`
        : sound ? 'La transcription du son de la dictée ne doit pas être « À la demande » : choisissez « Après la réponse ».'
        : `Associez le son ${type === 'dictation' ? 'de la dictée' : 'du modèle'} dans « Images et sons » (Illustre : question ${index + 1}, transcription « ${visibility} »).`}
    </p>
  );
}

function DictationForm({ question, at, index, placements, update }: {
  question: DraftQuestion; at: string; index: number; placements?: DraftPlacement[]; update: (value: Partial<DraftQuestion>) => void;
}) {
  const spec = specOf<DictationSpec>(question, 'dictation');
  return (
    <div className="ed-typed" data-path={`${at}.spec`}>
      <AnswerList label="Phrase dictée et variantes acceptées" values={spec.accept} first="Phrase dictée (graphie de référence)" path={`${at}.spec.accept`}
        help="La phrase n’apparaît pas dans l’énoncé ; ajoutez les variantes justes (chiffres et lettres, par exemple)."
        onChange={(accept) => update({ spec: { ...spec, accept } })} />
      <label className="ed-check"><input type="checkbox" checked={spec.showWordCount} onChange={(event) => update({ spec: { ...spec, showWordCount: event.target.checked } })} />
        Indiquer le nombre de mots à l’élève{spec.showWordCount && spec.accept[0] ? ` (${countWords(spec.accept[0])})` : ''}</label>
      <QuestionSoundStatus question={question} index={index} placements={placements} type="dictation" />
    </div>
  );
}

function SpeakForm({ question, at, index, placements, update }: {
  question: DraftQuestion; at: string; index: number; placements?: DraftPlacement[]; update: (value: Partial<DraftQuestion>) => void;
}) {
  const spec = specOf<SpeakSpec>(question, 'speak');
  const suggested = defaultSpeakThreshold(spec.text);
  return (
    <div className="ed-typed" data-path={`${at}.spec`}>
      <label>Phrase modèle (affichée et lue)<input lang="de" maxLength={200} value={spec.text} placeholder="Ich habe Kopfschmerzen."
        onChange={(event) => {
          const text = event.target.value;
          // La première réponse acceptée suit la phrase modèle tant qu'elle n'a pas été modifiée à part.
          const accept = !spec.accept.length || spec.accept[0] === spec.text ? [text, ...spec.accept.slice(1)] : spec.accept;
          update({ spec: { ...spec, text, accept } });
        }} /></label>
      <AnswerList label="Réponses reconnues comme justes" values={spec.accept} first="Phrase attendue" path={`${at}.spec.accept`}
        help="Avec un nombre, ajoutez aussi la variante en chiffres (« um 10 Uhr »)." onChange={(accept) => update({ spec: { ...spec, accept } })} />
      <div className="ed-threshold-line">
        <label htmlFor={`${at}-threshold`}>Seuil de réussite</label>
        <input id={`${at}-threshold`} type="range" min={50} max={100} step={5} value={spec.threshold} className="ed-range"
          style={{ ['--p' as string]: `${((spec.threshold - 50) / 50) * 100}%` }}
          onChange={(event) => update({ spec: { ...spec, threshold: Number(event.target.value) } })} />
        <strong>{spec.threshold} %</strong>
        {spec.threshold !== suggested && spec.text.trim() && (
          <button type="button" className="text-link" onClick={() => update({ spec: { ...spec, threshold: suggested } })}>Conseillé : {suggested} %</button>
        )}
      </div>
      <QuestionSoundStatus question={question} index={index} placements={placements} type="speak" />
    </div>
  );
}

/** Questions et corrigé. `typed` (exercices V4) : choix du type, formulaire par type, explication et retour par choix. */
export function QuestionsEditor({ questions, onChange, moduleRefs, path, typed = false, placements }: {
  questions: DraftQuestion[]; onChange: (questions: DraftQuestion[]) => void; moduleRefs?: { id: string; label: string }[]; path: string;
  typed?: boolean; placements?: DraftPlacement[];
}) {
  const { readOnly, locked, issues } = useEditor();
  // Contenu propre à chaque type, gardé si l'on revient au type précédent.
  const stash = useRef<Record<string, Pick<DraftQuestion, 'options' | 'spec'>>>({});
  return (
    <div className="ed-questions" data-path={`${path}.questions`}>
      {questions.length === 0 && <p className="ed-empty-inline"><ListChecks size={18} aria-hidden="true" /> Aucune question pour l’instant.</p>}
      {questions.map((question, index) => {
        const update = (value: Partial<DraftQuestion>) => onChange(replaceAt(questions, index, { ...question, ...value }));
        const at = `${path}.questions[${index}]`;
        const flagged = issueCount(issues, at);
        const type = questionTypeOf(question);
        const TypeIcon = questionTypeIcons[type];
        const reference = moduleRefs?.find((ref) => ref.id === question.moduleRef);
        function changeType(next: QuestionType) {
          if (next === type) return;
          stash.current[`${question.id}:${type}`] = { options: question.options, spec: question.spec ?? null };
          const kept = stash.current[`${question.id}:${next}`];
          update({
            type: next,
            options: next === 'choice' ? (kept?.options.length ? kept.options : newQuestion([], true).options) : [],
            spec: next === 'choice' ? null : kept?.spec ?? defaultSpec(next),
          });
        }
        return (
          <Disclosure className={`ed-question${flagged ? ' is-warning' : ''}`} key={index} path={at} defaultOpen={!question.prompt || flagged > 0}>
            <summary className="ed-question-head">
              <span className="ed-question-num" aria-hidden="true">{index + 1}</span>
              <span className="ed-question-summary">
                <strong>{question.prompt || `Question ${index + 1}`}</strong>
                <small>{[typed ? questionTypeLabels[type] : null, reference?.label, questionSummary(question)].filter(Boolean).join(' · ')}</small>
              </span>
              {typed && <span className={`ed-type-chip is-${type}`} aria-hidden="true"><TypeIcon size={14} /></span>}
              <IssueFlag count={flagged} />
              {!readOnly && <span className="ed-question-tools" onClick={(event) => event.preventDefault()}>
                <MoveTools index={index} count={questions.length} label={`la question ${index + 1}`} disabled={locked}
                  onMove={(offset) => onChange(move(questions, index, offset))} onRemove={() => onChange(questions.filter((_, position) => position !== index))} />
              </span>}
              <ChevronDown className="ed-question-chevron" size={17} aria-hidden="true" />
            </summary>
            <div className="ed-question-body">
            <fieldset className="ed-fields" disabled={locked}>
              {typed && (
                <fieldset className="ed-type-picker" data-path={`${at}.type`}>
                  <legend>Type de question</legend>
                  <div>
                    {questionTypes.map((item) => {
                      const Icon = questionTypeIcons[item];
                      return (
                        <label key={item} className={`ed-type-option is-${item}${item === type ? ' is-checked' : ''}`} title={questionTypeHints[item]}>
                          <input type="radio" name={`type-${path}-${question.id}-${index}`} checked={item === type} disabled={readOnly && item !== type}
                            onChange={() => changeType(item)} />
                          <Icon size={16} aria-hidden="true" />{questionTypeLabels[item]}
                        </label>
                      );
                    })}
                  </div>
                  <small className="ed-help">{questionTypeHints[type]}</small>
                </fieldset>
              )}
              <label data-path={`${at}.prompt`}>{typed ? 'Consigne de la question' : 'Énoncé'}<textarea rows={2} maxLength={500} value={question.prompt}
                placeholder={type === 'choice' ? undefined : type === 'fill' ? 'Complétez avec le connecteur qui convient.' : type === 'order' ? 'Remettez les mots dans l’ordre.'
                  : type === 'match' ? 'Associez chaque verbe à sa construction.' : type === 'dictation' ? 'Écoutez et écrivez la phrase.' : 'Écoutez, puis répétez à voix haute.'}
                onChange={(event) => update({ prompt: event.target.value })} /></label>
              {moduleRefs && (
                <label data-path={`${at}.moduleRef`}>Module évalué<select value={question.moduleRef ?? ''} onChange={(event) => update({ moduleRef: event.target.value || null })}>
                  <option value="">À choisir</option>
                  {moduleRefs.map((ref) => <option key={ref.id} value={ref.id}>{ref.label}</option>)}
                </select></label>
              )}
              {type === 'choice' && (
                <div className="ed-options" role="group" aria-label={`Choix de la question ${index + 1}`} data-path={`${at}.options`}>
                  {question.options.map((option, optionIndex) => (
                    <div className={`ed-option-wrap${option.correct ? ' is-correct' : ''}`} key={optionIndex}>
                      <div className={`ed-option${option.correct ? ' is-correct' : ''}`}>
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
                      {typed && (readOnly ? option.feedback : true) && (
                        <label className="ed-option-feedback"><span className="sr-only">Retour du choix {option.id}</span>
                          <MessageSquareText size={14} aria-hidden="true" />
                          <input maxLength={500} value={option.feedback ?? ''}
                            placeholder={option.correct ? 'Retour si ce choix est donné (facultatif)' : 'Pourquoi ce choix est faux (facultatif)'}
                            onChange={(event) => update({ options: replaceAt(question.options, optionIndex, { ...option, feedback: event.target.value || null }) })} />
                        </label>
                      )}
                    </div>
                  ))}
                  {!readOnly && (
                    <button type="button" className="btn btn-ghost btn-sm ed-add-option" disabled={question.options.length >= 8}
                      onClick={() => update({ options: [...question.options, { id: uniqueId(String.fromCharCode(97 + question.options.length), question.options.map((item) => item.id)), label: '', correct: false, ...(typed ? { feedback: null } : {}) }] })}>
                      <Plus size={15} aria-hidden="true" /> Ajouter un choix
                    </button>
                  )}
                </div>
              )}
              {type === 'fill' && <FillForm question={question} at={at} update={update} />}
              {type === 'order' && <OrderForm question={question} at={at} update={update} />}
              {type === 'match' && <MatchForm question={question} at={at} update={update} />}
              {type === 'dictation' && <DictationForm question={question} at={at} index={index} placements={placements} update={update} />}
              {type === 'speak' && <SpeakForm question={question} at={at} index={index} placements={placements} update={update} />}
              {typed && (
                <label className="ed-explanation" data-path={`${at}.explanation`}>
                  <span className="ed-explanation-label"><Lightbulb size={15} aria-hidden="true" /> Explication affichée après la remise</span>
                  <textarea rows={3} maxLength={1500} value={question.explanation ?? ''}
                    placeholder="Pourquoi cette réponse est juste, et pourquoi le piège principal est faux (règle, passage entendu)."
                    onChange={(event) => update({ explanation: event.target.value || null })} />
                  <small className={`ed-help ed-counter${(question.explanation ?? '').length > 400 ? ' is-long' : ''}`}>
                    {(question.explanation ?? '').length} / 400 caractères conseillés</small>
                </label>
              )}
            </fieldset>
            </div>
          </Disclosure>
        );
      })}
      {!readOnly && <AddCard onClick={() => onChange([...questions, newQuestion(questions, typed)])} disabled={locked}>Ajouter une question</AddCard>}
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
  const [toMission, setToMission] = useState(false);
  const update = (value: Partial<DraftActivity>) => onChange({ ...activity, ...value });
  const graded = activity.kind === 'exercise' || activity.kind === 'assessment';
  const isMission = activity.kind === 'mission';
  /** Changement de type : la mission n'a ni questions ni corrigé ; les autres types n'ont pas de mission. */
  function changeKind(kind: Kind) {
    if (kind === 'mission' && activity.questions.length > 0) { setToMission(true); return; }
    update({
      kind, lesson: kind === 'lesson' || kind === 'review' || kind === 'mission' ? lesson : activity.lesson,
      mission: kind === 'mission' ? activity.mission ?? defaultMission() : null,
      ...(kind === 'mission' ? { questions: [] } : {}),
    });
  }
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
          <label>Type<select value={activity.kind} onChange={(event) => changeKind(event.target.value as Kind)}>
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

      {(activity.kind === 'lesson' || activity.kind === 'review' || graded || isMission) && (
        <Collapsible title={isMission ? 'Situation et consigne' : graded ? 'Consigne' : 'Contenu de la leçon'} icon={<BookOpenText size={17} />} defaultOpen path={`${path}.lesson`}
          tone={count_('lesson') ? 'warning' : undefined} meta={<IssueFlag count={count_('lesson')} />}>
          <fieldset className="ed-fields" disabled={locked}>
            <label>Titre affiché<input maxLength={120} value={lesson.title} onChange={(event) => update({ lesson: { ...lesson, title: event.target.value } })} /></label>
          </fieldset>
          <TextWithPreview label={isMission ? 'Situation et consigne' : graded ? 'Consigne' : 'Texte'} rows={graded ? 3 : isMission ? 5 : 8} readOnly={readOnly}
            disabled={locked} value={lesson.description} onChange={(value) => update({ lesson: { ...lesson, description: value } })}
            placeholder={isMission ? 'Situation : vous avez rendez-vous chez le médecin demain, mais vous ne pouvez pas venir…' : undefined} />
          <fieldset className="ed-fields" disabled={locked}>
            <label>Transcription des sons<textarea rows={3} lang="de" value={lesson.transcript ?? ''}
              onChange={(event) => update({ lesson: { ...lesson, transcript: event.target.value || null } })} /></label>
          </fieldset>
        </Collapsible>
      )}

      {isMission && (
        <Collapsible title="Mission" icon={<Target size={17} />} defaultOpen path={`${path}.mission`}
          tone={count_('mission') ? 'warning' : undefined} meta={<IssueFlag count={count_('mission')} />}>
          <MissionEditor mission={activity.mission ?? defaultMission()} path={path} onChange={(mission) => update({ mission })} />
        </Collapsible>
      )}

      {graded && (
        <Collapsible title="Questions et corrigé" icon={<ListChecks size={17} />} defaultOpen path={`${path}.questions`}
          tone={count_('questions') ? 'warning' : undefined}
          meta={<><span className="ed-count">{activity.questions.length}</span><IssueFlag count={count_('questions')} /></>}>
          <QuestionsEditor questions={activity.questions} path={path} typed={activity.kind === 'exercise'} placements={activity.placements}
            onChange={(questions) => update({ questions })} />
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
      {toMission && (
        <ConfirmDialog title="Transformer en mission ?" confirm="Transformer" tone="danger" onClose={() => setToMission(false)}
          onConfirm={() => update({ kind: 'mission', lesson, mission: activity.mission ?? defaultMission(), questions: [] })}>
          <p>Une mission se remet au professeur : ses {activity.questions.length} question{activity.questions.length > 1 ? 's' : ''} et leur corrigé seront retirés.</p>
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

      <Collapsible title="Vocabulaire du module" icon={<BookA size={17} />} defaultOpen={(module.vocabulary?.length ?? 0) > 0 && (module.vocabulary?.length ?? 0) <= 12}
        path={`${path}.vocabulary`} tone={issueCount(issues, `${path}.vocabulary`) ? 'warning' : undefined}
        meta={<><span className="ed-count">{module.vocabulary?.length ?? 0}</span><IssueFlag count={issueCount(issues, `${path}.vocabulary`)} /></>}>
        <VocabularyEditor entries={module.vocabulary ?? []} path={path} onChange={(vocabulary) => update({ vocabulary })} />
      </Collapsible>

      <Card flush title="Activités" description={`${module.activities.length} activité${module.activities.length > 1 ? 's' : ''} · ${formatMinutes(minutes)}`}
        icon={<ListChecks size={18} />} className="ed-activity-card">
        {module.activities.length === 0
          ? <EmptyState icon={<Layers size={26} />} title="Aucune activité" description="Ajoutez une leçon, un exercice, une révision ou une mission." />
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


// ---------------------------------------------------------------------------------------------------------------------
// Mission (V4) et vocabulaire du module
// ---------------------------------------------------------------------------------------------------------------------

const secondsLabel = (seconds: number) => (seconds % 60 ? `${Math.floor(seconds / 60)} min ${seconds % 60} s` : `${seconds / 60} min`);

/** Définition d'une mission : partie orale, partie écrite (au moins l'une des deux) et liste de vérification. */
function MissionEditor({ mission, path, onChange }: { mission: MissionDefinition; path: string; onChange: (mission: MissionDefinition) => void }) {
  const { readOnly, locked } = useEditor();
  const update = (value: Partial<MissionDefinition>) => onChange({ ...mission, ...value });
  const parts = (mission.oral ? 1 : 0) + (mission.written ? 1 : 0);
  const checklistOk = mission.checklist.length >= missionLimits.checklistMin && mission.checklist.length <= missionLimits.checklistMax;
  return (
    <div className="ed-mission" data-path={`${path}.mission`}>
      {parts === 0 && <Callout tone="warning">Une mission demande au moins une partie : orale, écrite ou les deux.</Callout>}
      <fieldset className="ed-fields ed-mission-parts" disabled={locked}>
        <legend className="sr-only">Parties de la mission</legend>
        <section className={`ed-mission-part${mission.oral ? ' is-on' : ''}`} data-path={`${path}.mission.oral`}>
          <label className="ed-switch">
            <input type="checkbox" checked={Boolean(mission.oral)} onChange={(event) => update({ oral: event.target.checked ? { prompt: '', maxSeconds: 120 } : null })} />
            <span className="ed-switch-track" aria-hidden="true" />
            <span className="ed-mission-part-title"><Mic size={16} aria-hidden="true" /> Partie orale</span>
          </label>
          {mission.oral && (
            <div className="ed-mission-part-body">
              <label>Consigne de l’oral<textarea rows={3} maxLength={1000} value={mission.oral.prompt}
                placeholder="Appelez le cabinet médical : présentez-vous, expliquez pourquoi vous ne pouvez pas venir et proposez un autre jour."
                onChange={(event) => update({ oral: { ...mission.oral!, prompt: event.target.value } })} /></label>
              <div className="ed-threshold-line">
                <label htmlFor={`${path}-seconds`}>Durée maximale</label>
                <input id={`${path}-seconds`} type="range" className="ed-range" min={missionLimits.minSeconds} max={missionLimits.maxSeconds} step={10}
                  value={mission.oral.maxSeconds} style={{ ['--p' as string]: `${((mission.oral.maxSeconds - 30) / 90) * 100}%` }}
                  onChange={(event) => update({ oral: { ...mission.oral!, maxSeconds: Number(event.target.value) } })} />
                <strong>{secondsLabel(mission.oral.maxSeconds)}</strong>
              </div>
            </div>
          )}
        </section>
        <section className={`ed-mission-part${mission.written ? ' is-on' : ''}`} data-path={`${path}.mission.written`}>
          <label className="ed-switch">
            <input type="checkbox" checked={Boolean(mission.written)}
              onChange={(event) => update({ written: event.target.checked ? { prompt: '', maxChars: 1500, minWords: 25 } : null })} />
            <span className="ed-switch-track" aria-hidden="true" />
            <span className="ed-mission-part-title"><PencilLine size={16} aria-hidden="true" /> Partie écrite</span>
          </label>
          {mission.written && (
            <div className="ed-mission-part-body">
              <label>Consigne de l’écrit<textarea rows={3} maxLength={1000} value={mission.written.prompt}
                placeholder="Écrivez un court message au cabinet pour confirmer le nouveau rendez-vous."
                onChange={(event) => update({ written: { ...mission.written!, prompt: event.target.value } })} /></label>
              <div className="ed-grid-2">
                <label>Caractères au plus<input type="number" min={missionLimits.writtenMinChars} max={missionLimits.writtenMaxChars} step={50} value={mission.written.maxChars}
                  onChange={(event) => update({ written: { ...mission.written!, maxChars: Number(event.target.value) } })} /></label>
                <label>Mots au moins<input type="number" min={0} max={missionLimits.minWordsMax} value={mission.written.minWords}
                  onChange={(event) => update({ written: { ...mission.written!, minWords: Number(event.target.value) } })} /></label>
              </div>
            </div>
          )}
        </section>
      </fieldset>
      <section className="ed-subsection" data-path={`${path}.mission.checklist`}>
        <header><h4>Liste d’auto-vérification</h4><span className="ed-count">{mission.checklist.length}</span>
          {!checklistOk && <span className="ed-issue-flag"><CircleAlert size={13} aria-hidden="true" />2 à 6 points</span>}</header>
        <small className="ed-help">L’élève coche chaque point avant d’envoyer : formulez des vérifications concrètes (« J’ai proposé une autre date. »).</small>
        <fieldset className="ed-fields ed-checklist-items" disabled={locked}>
          <legend className="sr-only">Points de vérification</legend>
          {mission.checklist.map((item, index) => (
            <div className="ed-checklist-item" key={index}>
              <span className="ed-checklist-box" aria-hidden="true"><Check size={13} /></span>
              <label className="ed-answer-field"><span className="sr-only">Point {index + 1}</span>
                <input maxLength={missionLimits.checklistItemChars} value={item} placeholder={`Point ${index + 1}`}
                  onChange={(event) => update({ checklist: replaceAt(mission.checklist, index, event.target.value) })} /></label>
              {!readOnly && <MoveTools index={index} count={mission.checklist.length} label={`le point ${index + 1}`} disabled={locked}
                onMove={(offset) => update({ checklist: move(mission.checklist, index, offset) })}
                onRemove={() => update({ checklist: mission.checklist.filter((_, position) => position !== index) })} />}
            </div>
          ))}
        </fieldset>
        {!readOnly && <AddCard disabled={locked || mission.checklist.length >= missionLimits.checklistMax}
          onClick={() => update({ checklist: [...mission.checklist, ''] })}>Ajouter un point</AddCard>}
      </section>
    </div>
  );
}

const articleOptions: { value: GermanArticle | ''; label: string }[] = [
  { value: 'der', label: 'der' }, { value: 'die', label: 'die' }, { value: 'das', label: 'das' }, { value: '', label: '—' },
];
const slug = (value: string) => value.toLocaleLowerCase('de').replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
  .normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'mot';
/** Abréviation de la nature d'un mot sans article, dans la ligne repliée. */
const posShort: Record<PartOfSpeech, string> = {
  noun: 'pl.', verb: 'v.', adjective: 'adj.', adverb: 'adv.', preposition: 'prép.', conjunction: 'conj.', pronoun: 'pron.', number: 'nb', expression: 'expr.', other: '—',
};
const seconds = (value: number) => value.toLocaleString('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 2 });

/** Vocabulaire du module : une entrée par mot (le son est calculé par la construction, en lecture seule). */
function VocabularyEditor({ entries, path, onChange }: { entries: DraftVocabularyEntry[]; path: string; onChange: (entries: DraftVocabularyEntry[]) => void }) {
  const { readOnly, locked, issues } = useEditor();
  const [search, setSearch] = useState('');
  const query = search.trim().toLocaleLowerCase('de');
  const shown = entries.map((entry, index) => ({ entry, index }))
    .filter(({ entry }) => !query || `${entry.article ?? ''} ${entry.word} ${entry.translation}`.toLocaleLowerCase('de').includes(query));
  function add() {
    const taken = entries.map((entry) => entry.id);
    onChange([...entries, { id: uniqueId(`mot-${entries.length + 1}`, taken), word: '', article: null, plural: null, partOfSpeech: 'noun', translation: '',
      example: null, note: null, audio: null }]);
  }
  return (
    <div className="ed-vocabulary" data-path={`${path}.vocabulary`}>
      {entries.length > 8 && <SearchField value={search} onChange={setSearch} label="Chercher dans le vocabulaire" placeholder="Chercher un mot" />}
      {entries.length === 0 && <p className="ed-empty-inline"><BookA size={18} aria-hidden="true" /> Aucun mot pour l’instant : 10 à 30 mots par module thématique.</p>}
      <ol className="ed-vocab-list">
        {shown.map(({ entry, index }) => {
          const at = `${path}.vocabulary[${index}]`;
          const update = (value: Partial<DraftVocabularyEntry>) => onChange(replaceAt(entries, index, { ...entry, ...value }));
          const flagged = issueCount(issues, at);
          const missingArticle = entry.partOfSpeech === 'noun' && !entry.article && !/pluriel/i.test(entry.note ?? '');
          return (
            <li key={index}>
              <Disclosure className={`ed-vocab${flagged || missingArticle ? ' is-warning' : ''}${entry.article ? ` is-${entry.article}` : ''}`} path={at}
                defaultOpen={!entry.word || flagged > 0}>
                <summary className="ed-vocab-head">
                  {entry.article ? <span className={`ed-article is-${entry.article}`} lang="de">{entry.article}</span>
                    : <span className="ed-article is-pos" aria-hidden="true">{posShort[entry.partOfSpeech]}</span>}
                  <span className="ed-vocab-summary">
                    <strong lang="de">{entry.word || `Mot ${index + 1}`}{entry.plural ? <small lang="de"> · {entry.plural}</small> : null}</strong>
                    <small>{[partOfSpeechLabels[entry.partOfSpeech], entry.translation].filter(Boolean).join(' · ')}</small>
                  </span>
                  {entry.audio ? <span className="ed-vocab-sound" title={`Son : ${seconds(entry.audio.start)} s – ${seconds(entry.audio.end)} s`}><Volume2 size={14} aria-hidden="true" /><span className="sr-only">Son disponible</span></span> : null}
                  <IssueFlag count={flagged} />
                  {!readOnly && <span className="ed-question-tools" onClick={(event) => event.preventDefault()}>
                    <MoveTools index={index} count={entries.length} label={`le mot ${entry.word || index + 1}`} disabled={locked}
                      onMove={(offset) => onChange(move(entries, index, offset))} onRemove={() => onChange(entries.filter((_, position) => position !== index))} />
                  </span>}
                  <ChevronDown className="ed-question-chevron" size={17} aria-hidden="true" />
                </summary>
                <fieldset className="ed-fields ed-vocab-body" disabled={locked}>
                  <div className="ed-vocab-grid">
                    <label className="ed-vocab-article">Article<select value={entry.article ?? ''} onChange={(event) => update({ article: (event.target.value || null) as GermanArticle | null })}>
                      {articleOptions.map((option) => <option key={option.label} value={option.value}>{option.label}</option>)}
                    </select></label>
                    <label data-path={`${at}.word`}>Mot<input lang="de" maxLength={80} value={entry.word} placeholder="Kopf"
                      onChange={(event) => update({ word: event.target.value })}
                      // Identifiant d'une nouvelle entrée : dérivé du mot une fois saisi, puis stable.
                      onBlur={() => {
                        if (/^mot-\d+$/.test(entry.id) && entry.word.trim()) {
                          update({ id: uniqueId(slug(entry.word), entries.filter((_, position) => position !== index).map((item) => item.id)) });
                        }
                      }} /></label>
                    <label>Pluriel<input lang="de" maxLength={80} value={entry.plural ?? ''} placeholder="Köpfe" onChange={(event) => update({ plural: event.target.value || null })} /></label>
                    <label>Nature<select value={entry.partOfSpeech} onChange={(event) => update({ partOfSpeech: event.target.value as PartOfSpeech })}>
                      {partsOfSpeech.map((part) => <option key={part} value={part}>{partOfSpeechLabels[part]}</option>)}
                    </select></label>
                  </div>
                  {missingArticle && <p className="ed-sound-status"><CircleAlert size={15} aria-hidden="true" /> Un nom prend un article (sauf « toujours au pluriel » dans la remarque).</p>}
                  <div className="ed-grid-2">
                    <label data-path={`${at}.translation`}>Traduction<input maxLength={120} value={entry.translation} placeholder="la tête" onChange={(event) => update({ translation: event.target.value })} /></label>
                    <label>Remarque (facultatif)<input maxLength={120} value={entry.note ?? ''} placeholder="séparable : an|fangen · + accusatif"
                      onChange={(event) => update({ note: event.target.value || null })} /></label>
                  </div>
                  <label>Exemple<input lang="de" maxLength={200} value={entry.example ?? ''} placeholder="Mein Kopf tut weh." onChange={(event) => update({ example: event.target.value || null })} /></label>
                  <p className="ed-vocab-audio">
                    <Volume2 size={15} aria-hidden="true" />
                    {entry.audio ? <>Son : {seconds(entry.audio.start)} s – {seconds(entry.audio.end)} s du fichier {entry.audio.assetId} (v{entry.audio.assetVersion})</>
                      : 'Son généré à la construction des contenus (lecture seule ici).'}
                  </p>
                </fieldset>
              </Disclosure>
            </li>
          );
        })}
      </ol>
      {!readOnly && <AddCard icon={BookA} onClick={add} disabled={locked}>Ajouter un mot</AddCard>}
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
