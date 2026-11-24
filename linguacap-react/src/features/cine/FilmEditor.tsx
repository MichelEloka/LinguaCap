/**
 * Catalogue · films du Ciné-club (administration ou permission Catalogue) : liste des films (brouillons compris) et éditeur
 * d'un film au format 1 — identité, crédit et liens ; séquences avec leurs bornes, contexte, mots-clés et questions
 * (formulaires existants, types choix, trous, ordre, paires) ; lecteur YouTube pour fixer les bornes (« Prendre le temps
 * actuel » par l'API postMessage du cadre, sans script externe) ; aperçu élève ; enregistrement, publication et retrait.
 * Routes : GET /catalogue/films, GET|PUT /catalogue/films/{filmId}, POST …/publish et …/retire.
 */
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Link, NavLink, useNavigate, useParams } from 'react-router-dom';
import {
  Archive, ArrowDown, ArrowLeft, ArrowUp, CheckCircle2, ChevronDown, ChevronRight, CircleAlert, Clapperboard, Clock, Eye, Film as FilmIcon, KeyRound,
  Layers, ListChecks, Play, Plus, RefreshCw, Save, Send, Timer, Trash2,
} from 'lucide-react';
import { Badge, EmptyState, StatCard } from '../../components/ui';
import { Callout, Drawer, Segmented, SkeletonCard, TabPanel, Tabs, useToast } from '../../design/kit';
import { requestApi } from '../../integration/api';
import {
  cineLimits, cineQuestionTypes, filmCompletenessIssues, filmStructureIssues, formatDuration, formatTimecode, parseTimecode, videoIdFrom,
  youtubeVideoUrl, youtubeWatchUrl, type FilmDocument, type FilmEditorDocument, type FilmFields, type FilmIssue, type FilmKeyword,
  type FilmSequenceFields, type FilmStatus, type FilmSummary,
} from '../../integration/cine';
import type { LevelCode } from '../../integration/v2';
import type { DraftQuestionV4, GermanArticle } from '../../integration/v4';
import { ExerciseActivity, type ActivityDetail } from '../pilot/LearnerSession';
import { LessonContent } from '../pilot/LessonContent';
import { EditorContext, QuestionsEditor, type DraftQuestion } from '../pilot/editor-forms';
import { ConfirmDialog, IconAction, TextWithPreview } from '../pilot/editor-parts';
import { previewQuestion } from '../pilot/editor-preview';
import { FilmPoster, KeywordCard, TimeRange } from './cine-common';
import { errorText } from './word-notebook';
import { YoutubePlayer, type YoutubeControls } from './youtube-player';
import '../pilot/editor.css';
import '../pilot/learner-session.css';
import './cine.css';

interface LevelOption { id: string; code: string; title: string }
type Busy = '' | 'save' | 'publish' | 'retire';
const statusLabels: Record<FilmStatus, { label: string; tone: 'green' | 'amber' }> = { published: { label: 'Publié', tone: 'green' }, draft: { label: 'Brouillon', tone: 'amber' } };
const dateFormat = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
const articles: { value: GermanArticle | ''; label: string }[] = [{ value: '', label: '—' }, { value: 'der', label: 'der' }, { value: 'die', label: 'die' }, { value: 'das', label: 'das' }];

/** Navigation du catalogue : parcours des niveaux et films du Ciné-club. */
export function CatalogueSections() {
  return (
    <nav className="fe-sections" aria-label="Sections du catalogue">
      <NavLink to="/espace/catalogue" end><Layers size={16} aria-hidden="true" /> Parcours des niveaux</NavLink>
      <NavLink to="/espace/catalogue/films"><Clapperboard size={16} aria-hidden="true" /> Films du Ciné-club</NavLink>
    </nav>
  );
}

// ---------------------------------------------------------------------------------------------------------------------
// Liste des films
// ---------------------------------------------------------------------------------------------------------------------

export function FilmsView({ token }: { token: string }) {
  const navigate = useNavigate();
  const [films, setFilms] = useState<FilmSummary[] | null>(null);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let active = true;
    setError('');
    requestApi<FilmSummary[]>('/catalogue/films', token).then(
      (list) => { if (active) setFilms(list); },
      (failure: unknown) => { if (active) setError(errorText(failure)); },
    );
    return () => { active = false; };
  }, [token, retry]);
  const all = films ?? [];
  return (
    <div className="ed-catalogue lc-enter">
      <CatalogueSections />
      <div className="ed-catalogue-bar">
        <div className="ed-catalogue-stats">
          <StatCard label="Films" value={films ? all.length : '—'} icon={<FilmIcon size={20} />} />
          <StatCard label="Publiés" value={films ? all.filter((film) => film.status === 'published').length : '—'} icon={<CheckCircle2 size={20} />} />
          <StatCard label="Séquences" value={films ? all.reduce((sum, film) => sum + film.sequenceCount, 0) : '—'} icon={<ListChecks size={20} />} />
        </div>
        <button type="button" className="btn btn-primary" onClick={() => navigate('/espace/catalogue/films/nouveau')}><Plus size={17} aria-hidden="true" /> Nouveau film</button>
      </div>
      <Callout tone="tip" title="Lecteur YouTube officiel seulement">
        <p>Les films restent sur YouTube et se lisent dans son lecteur, après l’accord de l’élève. Questions, contextes et mots-clés sont des contenus originaux ; le crédit et le lien vers le cours gratuit de l’éditeur sont toujours affichés.</p>
      </Callout>
      {error && !films ? (
        <div className="ed-load-error">
          <Callout tone="warning" title="Les films sont indisponibles"><p role="alert">{error}</p></Callout>
          <button type="button" className="btn btn-secondary" onClick={() => setRetry((value) => value + 1)}><RefreshCw size={16} aria-hidden="true" /> Réessayer</button>
        </div>
      ) : films === null ? (
        <div className="ed-level-grid">{[0, 1, 2].map((index) => <SkeletonCard key={index} lines={4} label="Chargement des films…" />)}</div>
      ) : films.length === 0 ? (
        <div className="ed-empty-card">
          <EmptyState icon={<Clapperboard size={26} />} title="Aucun film au catalogue" description="Importez un film avec l’outil des contenus, ou créez-en un ici."
            action={<button type="button" className="btn btn-primary" onClick={() => navigate('/espace/catalogue/films/nouveau')}><Plus size={16} aria-hidden="true" /> Nouveau film</button>} />
        </div>
      ) : (
        <ol className="ed-level-grid fe-film-grid lc-stagger">
          {films.map((film) => (
            <li key={film.id}>
              <Link className="kit-card is-interactive fe-film-card" to={`/espace/catalogue/films/${encodeURIComponent(film.id)}`} aria-label={`Ouvrir ${film.title} (${film.levelCode})`}>
                <FilmPoster film={film} size="md" />
                <span className="fe-film-card-text">
                  <span className="fe-film-card-tags"><Badge tone="blue">{film.levelCode}</Badge><Badge tone={statusLabels[film.status].tone}>{statusLabels[film.status].label}</Badge></span>
                  <strong>{film.title}</strong>
                  <small><Clock size={13} aria-hidden="true" /> {formatDuration(film.durationSeconds)} · {film.sequenceCount} séquence{film.sequenceCount > 1 ? 's' : ''}</small>
                  <small>{film.publishedAt ? `Publié le ${dateFormat.format(new Date(film.publishedAt))}` : `Modifié le ${dateFormat.format(new Date(film.updatedAt))}`}</small>
                </span>
                <ChevronRight size={18} aria-hidden="true" className="fe-film-card-chevron" />
              </Link>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------------------------------------------------
// Document : lecture, valeurs par défaut, corps envoyé
// ---------------------------------------------------------------------------------------------------------------------

const pad2 = (value: number) => String(value).padStart(2, '0');
function newFilm(levelId: string): FilmDocument {
  return {
    format: 1,
    film: { id: '', languageId: 'de', levelId, title: '', description: '', provider: 'youtube', videoId: '', channel: 'Deutsch lernen mit der DW', videoUrl: '',
      courseUrl: '', credit: '', licenseNote: 'Vidéo lue dans le lecteur officiel de YouTube, jamais copiée. Questions, résumés et explications : contenus LinguaCap originaux.',
      durationSeconds: 0, position: 1 },
    sequences: [],
  };
}
function fromEditor(document: FilmEditorDocument): FilmDocument {
  const { film, sequences } = document;
  return {
    format: 1,
    film: { id: film.id, languageId: film.languageId, levelId: film.levelId, title: film.title, description: film.description, provider: 'youtube', videoId: film.videoId,
      channel: film.channel, videoUrl: film.videoUrl, courseUrl: film.courseUrl, credit: film.credit, licenseNote: film.licenseNote,
      durationSeconds: film.durationSeconds, position: film.position },
    sequences: [...sequences].sort((a, b) => a.position - b.position).map((sequence) => ({ id: sequence.id, position: sequence.position, title: sequence.title,
      start: sequence.start, end: sequence.end, approx: sequence.approx, context: sequence.context, keywords: sequence.keywords, questions: sequence.questions })),
  };
}
const cleanQuestion = (question: DraftQuestionV4): DraftQuestionV4 => ({
  id: question.id, type: question.type ?? 'choice', prompt: question.prompt, moduleRef: null, explanation: question.explanation ?? null,
  options: (question.options ?? []).map((option) => ({ id: option.id, label: option.label, correct: option.correct, feedback: option.feedback ?? null })),
  spec: question.spec ?? null,
});
/** Corps de PUT : champs du format 1 seulement (tout champ inconnu est refusé), positions dans l'ordre affiché. */
function payload(document: FilmDocument): FilmDocument {
  const { film } = document;
  return {
    format: 1,
    film: { ...film, title: film.title.trim(), channel: film.channel.trim(), credit: film.credit.trim(), courseUrl: film.courseUrl.trim(),
      videoUrl: film.videoId ? youtubeVideoUrl(film.videoId) : film.videoUrl },
    sequences: document.sequences.map((sequence, index) => ({
      id: sequence.id, position: index + 1, title: sequence.title.trim(), start: sequence.start, end: sequence.end, approx: sequence.approx, context: sequence.context,
      keywords: sequence.keywords.map((keyword) => ({ word: keyword.word.trim(), article: keyword.article ?? null, plural: keyword.plural?.trim() || null,
        translation: keyword.translation.trim(), note: keyword.note?.trim() || null })),
      questions: sequence.questions.map(cleanQuestion),
    })),
  };
}
function nextSequenceId(filmId: string, sequences: FilmSequenceFields[]) {
  for (let index = sequences.length + 1; ; index++) {
    const candidate = `${filmId || 'film'}-${pad2(index)}`;
    if (!sequences.some((sequence) => sequence.id === candidate)) return candidate;
  }
}
const areaOf = (path: string, sequences: FilmSequenceFields[]): string => {
  const match = /^sequences\[(\d+)\]/.exec(path);
  if (!match) return path.startsWith('film') ? 'Film' : 'Séquences';
  const sequence = sequences[Number(match[1])];
  return `Séquence ${Number(match[1]) + 1}${sequence?.title ? ` · ${sequence.title}` : ''}`;
};

// ---------------------------------------------------------------------------------------------------------------------
// Champs
// ---------------------------------------------------------------------------------------------------------------------

/** Temps « 7:30 » : saisie, « Prendre le temps actuel » du lecteur et « Aller » à ce temps. */
function TimeField({ label, value, path, onChange, onTake, onGo }: {
  label: string; value: number; path: string; onChange: (seconds: number) => void; onTake: () => void; onGo: () => void;
}) {
  const [text, setText] = useState(formatTimecode(value));
  useEffect(() => { setText(formatTimecode(value)); }, [value]);
  const invalid = parseTimecode(text) === null;
  return (
    <div className="fe-time" data-path={path}>
      <label>{label}
        <input type="text" inputMode="numeric" value={text} aria-invalid={invalid} placeholder="7:30" autoComplete="off"
          onChange={(event) => { setText(event.target.value); const parsed = parseTimecode(event.target.value); if (parsed !== null) onChange(parsed); }}
          onBlur={() => { if (parseTimecode(text) === null) setText(formatTimecode(value)); }} />
      </label>
      <div className="fe-time-actions">
        <button type="button" className="btn btn-soft btn-sm" onClick={onTake} aria-label={`Prendre le temps actuel du lecteur pour : ${label.toLowerCase()}`}>
          <Timer size={15} aria-hidden="true" /> Prendre le temps actuel
        </button>
        <IconAction icon={Play} label={`Aller à ${label.toLowerCase()} dans le lecteur`} onClick={onGo} />
      </div>
    </div>
  );
}

function KeywordsEditor({ keywords, path, onChange }: { keywords: FilmKeyword[]; path: string; onChange: (keywords: FilmKeyword[]) => void }) {
  const update = (index: number, patch: Partial<FilmKeyword>) => onChange(keywords.map((keyword, position) => (position === index ? { ...keyword, ...patch } : keyword)));
  const count = keywords.length;
  const ok = count >= cineLimits.keywordsMin && count <= cineLimits.keywordsMax;
  return (
    <div className="fe-keywords" data-path={`${path}.keywords`}>
      <div className="fe-block-head">
        <h4><KeyRound size={16} aria-hidden="true" /> Mots-clés</h4>
        <span className={`fe-count${ok ? ' is-ok' : ''}`}>{count} / {cineLimits.keywordsMin} à {cineLimits.keywordsMax}</span>
      </div>
      {count === 0 && <p className="ed-empty-inline"><KeyRound size={18} aria-hidden="true" /> Aucun mot-clé : ajoutez les mots à repérer pendant la séquence.</p>}
      <ol className="fe-keyword-list">
        {keywords.map((keyword, index) => (
          <li key={index} className="fe-keyword" data-path={`${path}.keywords[${index}]`}>
            <span className="fe-keyword-num" aria-hidden="true">{index + 1}</span>
            <label className="fe-kw-article"><span className="sr-only">Article du mot-clé {index + 1}</span>
              <select value={keyword.article ?? ''} onChange={(event) => update(index, { article: (event.target.value || null) as GermanArticle | null })}>
                {articles.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
              </select></label>
            <label className="fe-kw-word"><span className="sr-only">Mot-clé {index + 1}</span>
              <input lang="de" value={keyword.word} maxLength={cineLimits.keywordChars} placeholder="Bahnhof" onChange={(event) => update(index, { word: event.target.value })} /></label>
            <label className="fe-kw-plural"><span className="sr-only">Pluriel du mot-clé {index + 1}</span>
              <input lang="de" value={keyword.plural ?? ''} maxLength={cineLimits.keywordChars} placeholder="Pluriel" onChange={(event) => update(index, { plural: event.target.value || null })} /></label>
            <label className="fe-kw-translation"><span className="sr-only">Traduction du mot-clé {index + 1}</span>
              <input value={keyword.translation} maxLength={cineLimits.translationChars} placeholder="la gare" onChange={(event) => update(index, { translation: event.target.value })} /></label>
            <label className="fe-kw-note"><span className="sr-only">Remarque du mot-clé {index + 1}</span>
              <input value={keyword.note ?? ''} maxLength={cineLimits.keywordNoteChars} placeholder="Remarque (facultatif)" onChange={(event) => update(index, { note: event.target.value || null })} /></label>
            <span className="fe-kw-remove"><IconAction icon={Trash2} tone="danger" label={`Supprimer le mot-clé ${index + 1}`} onClick={() => onChange(keywords.filter((_, position) => position !== index))} /></span>
          </li>
        ))}
      </ol>
      <button type="button" className="btn btn-ghost btn-sm" disabled={count >= cineLimits.keywordsMax}
        onClick={() => onChange([...keywords, { word: '', article: null, plural: null, translation: '', note: null }])}>
        <Plus size={15} aria-hidden="true" /> Ajouter un mot-clé
      </button>
    </div>
  );
}

/** Aperçu élève d'une séquence : avant (contexte, mots-clés) et après (questions, remise désactivée). */
function SequencePreview({ document, index, token, onClose }: { document: FilmDocument; index: number; token: string; onClose: () => void }) {
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');
  const sequence = document.sequences[index];
  const detail: ActivityDetail = {
    id: sequence.id, kind: 'exercise', title: sequence.title, estimatedMinutes: 10, status: 'todo', state: {}, attemptId: null,
    lesson: { id: 'apercu', title: sequence.title, description: '' }, transcript: null, placements: [],
    questions: sequence.questions.map((question) => previewQuestion(question as unknown as DraftQuestion, sequence.id)),
  };
  return (
    <Drawer wide title={`Aperçu élève · séquence ${index + 1}`} onClose={onClose}
      description={<>{document.film.title || 'Film'} · <TimeRange start={sequence.start} end={sequence.end} /> · tel que l’élève le verra</>}>
      <div className="ed-preview-toolbar">
        <Segmented label="Format d’affichage" value={device} onChange={setDevice} options={[{ value: 'desktop', label: 'Ordinateur' }, { value: 'mobile', label: 'Téléphone' }]} />
      </div>
      <div className={`ed-device is-${device}`}>
        <div className="ed-device-screen pilot-session fe-preview">
          <h3>{sequence.title || 'Séquence sans titre'}</h3>
          <section><p className="fe-preview-label">Avant de regarder</p>{sequence.context.trim() ? <LessonContent text={sequence.context} /> : <p className="ed-muted">Contexte à rédiger.</p>}</section>
          {sequence.keywords.length > 0 && <ul className="cine-keywords">{sequence.keywords.map((keyword, position) => <KeywordCard key={position} keyword={keyword} />)}</ul>}
          <section><p className="fe-preview-label">Après : {sequence.questions.length} questions</p>
            <ExerciseActivity key={sequence.id} activity={detail} token={token} grade={null} onRenew={() => undefined} preview onSaveState={() => undefined} onGraded={async () => undefined} />
          </section>
        </div>
      </div>
    </Drawer>
  );
}

// ---------------------------------------------------------------------------------------------------------------------
// Éditeur d'un film
// ---------------------------------------------------------------------------------------------------------------------

export function FilmEditorPage({ token }: { token: string }) {
  const { filmId = '' } = useParams();
  return <FilmEditor key={filmId} token={token} filmId={filmId} />;
}

function FilmEditor({ token, filmId }: { token: string; filmId: string }) {
  const navigate = useNavigate();
  const toast = useToast();
  const isNew = filmId === 'nouveau';
  const [document, setDocument] = useState<FilmDocument | null>(null);
  const [meta, setMeta] = useState<{ status: FilmStatus; levelCode: LevelCode | null; updatedAt: string | null; publishedAt: string | null } | null>(null);
  const [levels, setLevels] = useState<LevelOption[]>([]);
  const [loadError, setLoadError] = useState('');
  const [tab, setTab] = useState<'film' | 'sequences'>(isNew ? 'film' : 'sequences');
  const [selected, setSelected] = useState(0);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState<Busy>('');
  const [confirm, setConfirm] = useState<'publish' | 'retire' | 'remove' | null>(null);
  const [preview, setPreview] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [focusPath, setFocusPath] = useState<string | null>(null);
  const [videoText, setVideoText] = useState('');
  const player = useRef<YoutubeControls | null>(null);

  useEffect(() => {
    let active = true;
    setLoadError('');
    Promise.all([
      requestApi<LevelOption[]>('/catalogue/levels', token).catch(() => [] as LevelOption[]),
      isNew ? Promise.resolve(null) : requestApi<FilmEditorDocument>(`/catalogue/films/${encodeURIComponent(filmId)}`, token),
    ]).then(([catalogueLevels, loaded]) => {
      if (!active) return;
      setLevels(catalogueLevels);
      if (loaded) {
        setDocument(fromEditor(loaded));
        setMeta({ status: loaded.film.status, levelCode: loaded.film.levelCode, updatedAt: loaded.film.updatedAt, publishedAt: loaded.film.publishedAt });
        setVideoText(loaded.film.videoId);
      } else {
        setDocument(newFilm(catalogueLevels[0]?.id ?? 'a1'));
        setMeta(null);
      }
    }).catch((failure: unknown) => { if (active) setLoadError(errorText(failure)); });
    return () => { active = false; };
  }, [token, filmId, isNew]);

  // Quitter la page avec des modifications non enregistrées demande confirmation.
  useEffect(() => {
    if (!dirty) return;
    const leave = (event: BeforeUnloadEvent) => { event.preventDefault(); };
    window.addEventListener('beforeunload', leave);
    return () => window.removeEventListener('beforeunload', leave);
  }, [dirty]);

  // Point à corriger ouvert : fait défiler jusqu'au champ (ou à son bloc) et le met en évidence.
  useEffect(() => {
    if (!focusPath) return;
    const frame = requestAnimationFrame(() => {
      let path = focusPath;
      let target: HTMLElement | null = null;
      while (path && !target) {
        target = window.document.querySelector<HTMLElement>(`.fe-editor [data-path="${CSS.escape(path)}"]`);
        const shorter = path.replace(/(\.[^.[\]]+|\[\d+\])$/, '');
        if (target || shorter === path) break;
        path = shorter;
      }
      setFocusPath(null);
      if (!target) return;
      for (let details = target.closest('details'); details; details = details.parentElement?.closest('details') ?? null) details.open = true;
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      target.querySelector<HTMLElement>('input:not([type="hidden"]):not(:disabled), textarea:not(:disabled), select:not(:disabled)')?.focus({ preventScroll: true });
      target.classList.remove('is-flash');
      void target.offsetWidth;
      target.classList.add('is-flash');
      const flashed = target;
      window.setTimeout(() => flashed.classList.remove('is-flash'), 1800);
    });
    return () => cancelAnimationFrame(frame);
  }, [focusPath, tab, selected]);

  const body = useMemo(() => (document ? payload(document) : null), [document]);
  const structure = useMemo(() => (body ? filmStructureIssues(body) : []), [body]);
  const completeness = useMemo(() => (body ? filmCompletenessIssues(body) : []), [body]);
  const issues = useMemo(() => [...structure, ...completeness], [structure, completeness]);

  const change = useCallback((next: (current: FilmDocument) => FilmDocument) => {
    setDocument((current) => (current ? next(current) : current));
    setDirty(true);
  }, []);

  if (loadError) {
    return (
      <div className="ed-load-error">
        <Callout tone="warning" title="Ce film ne peut pas être ouvert"><p role="alert">{loadError}</p></Callout>
        <Link className="btn btn-secondary" to="/espace/catalogue/films"><ArrowLeft size={16} aria-hidden="true" /> Retour aux films</Link>
      </div>
    );
  }
  if (!document) return <div className="ed-editor"><SkeletonCard lines={4} label="Chargement du film…" /><SkeletonCard lines={8} /></div>;

  const { film, sequences } = document;
  const status = meta?.status ?? 'draft';
  const levelCode = (levels.find((level) => level.id === film.levelId)?.code ?? meta?.levelCode ?? film.levelId.toUpperCase()) as LevelCode;
  const current = sequences[Math.min(selected, Math.max(0, sequences.length - 1))];
  const currentIndex = current ? sequences.indexOf(current) : -1;
  const at = `sequences[${currentIndex}]`;
  const videoReady = /^[A-Za-z0-9_-]{11}$/.test(film.videoId);

  const setFilm = (patch: Partial<FilmFields>) => change((doc) => {
    const next = { ...doc.film, ...patch };
    // Film nouveau : les identifiants de séquence suivent celui du film.
    const sequencesNext = patch.id !== undefined && isNew
      ? doc.sequences.map((sequence) => ({ ...sequence, id: sequence.id.startsWith(`${doc.film.id || 'film'}-`) ? `${patch.id || 'film'}-${sequence.id.slice((doc.film.id || 'film').length + 1)}` : sequence.id }))
      : doc.sequences;
    return { ...doc, film: next, sequences: sequencesNext };
  });
  const setSequence = (index: number, patch: Partial<FilmSequenceFields>) =>
    change((doc) => ({ ...doc, sequences: doc.sequences.map((sequence, position) => (position === index ? { ...sequence, ...patch } : sequence)) }));
  const addSequence = () => {
    const last = sequences[sequences.length - 1];
    const start = last ? last.end : 0;
    const end = Math.min(film.durationSeconds || start + 480, start + 480);
    change((doc) => ({ ...doc, sequences: [...doc.sequences, { id: nextSequenceId(doc.film.id, doc.sequences), position: doc.sequences.length + 1, title: '',
      start, end: end > start ? end : start + 480, approx: true, context: '', keywords: [], questions: [] }] }));
    setSelected(sequences.length);
    setTab('sequences');
  };
  const moveSequence = (index: number, offset: number) => {
    const target = index + offset;
    if (target < 0 || target >= sequences.length) return;
    change((doc) => {
      const next = [...doc.sequences];
      [next[index], next[target]] = [next[target], next[index]];
      return { ...doc, sequences: next };
    });
    setSelected(target);
  };

  const take = (field: 'start' | 'end') => {
    const time = player.current?.currentTime();
    if (time === null || time === undefined) { toast('Lancez la vidéo dans le lecteur, puis reprenez le temps.', 'warning'); return; }
    setSequence(currentIndex, { [field]: Math.max(0, Math.round(time)) });
    toast(`${field === 'start' ? 'Début' : 'Fin'} fixé à ${formatTimecode(Math.round(time))}.`);
  };
  const go = (seconds: number) => {
    if (!player.current) { toast('Chargez d’abord la vidéo dans le lecteur.', 'warning'); return; }
    player.current.seek(seconds, true);
  };

  async function save(): Promise<boolean> {
    if (!body || busy) return false;
    if (structure.length) {
      toast(`${structure.length} point${structure.length > 1 ? 's' : ''} à corriger avant d’enregistrer.`, 'warning');
      setExpanded(true);
      openIssue(structure[0]);
      return false;
    }
    if (status === 'published' && completeness.length) {
      toast('Un film publié doit rester complet : complétez les points signalés, ou retirez-le d’abord.', 'warning');
      openIssue(completeness[0]);
      return false;
    }
    setBusy('save');
    try {
      const saved = await requestApi<FilmEditorDocument>(`/catalogue/films/${encodeURIComponent(body.film.id)}`, token, { method: 'PUT', body });
      setDocument(fromEditor(saved));
      setMeta({ status: saved.film.status, levelCode: saved.film.levelCode, updatedAt: saved.film.updatedAt, publishedAt: saved.film.publishedAt });
      setDirty(false);
      toast(isNew ? 'Film créé en brouillon.' : 'Film enregistré.');
      if (isNew) navigate(`/espace/catalogue/films/${encodeURIComponent(saved.film.id)}`, { replace: true });
      return true;
    } catch (failure) {
      toast(errorText(failure), 'warning');
      return false;
    } finally {
      setBusy('');
    }
  }

  async function setStatus(action: 'publish' | 'retire') {
    if (action === 'publish' && dirty && !(await save())) return;
    if (action === 'publish' && completeness.length) { toast(`Publication impossible : ${completeness[0].message}`, 'warning'); openIssue(completeness[0]); return; }
    setBusy(action);
    try {
      const summary = action === 'publish'
        ? await requestApi<FilmSummary>(`/catalogue/films/${encodeURIComponent(film.id)}/publish`, token, { method: 'POST', body: {} })
        : await requestApi<FilmSummary>(`/catalogue/films/${encodeURIComponent(film.id)}/retire`, token, { method: 'POST', body: {} });
      setMeta({ levelCode: summary.levelCode, updatedAt: summary.updatedAt, publishedAt: summary.publishedAt, status: summary.status });
      toast(action === 'publish' ? 'Film publié : les élèves le trouvent dans leur Ciné-club.' : 'Film retiré : il n’est plus proposé aux élèves.');
    } catch (failure) {
      toast(errorText(failure), 'warning');
    } finally {
      setBusy('');
    }
  }

  function openIssue(issue: FilmIssue) {
    const match = /^sequences\[(\d+)\]/.exec(issue.path);
    if (issue.path.startsWith('film')) setTab('film');
    else { setTab('sequences'); if (match) setSelected(Number(match[1])); }
    setFocusPath(issue.path);
  }

  const shown = expanded ? issues : issues.slice(0, 3);
  const saveState = busy === 'save' ? { tone: 'busy', title: 'Enregistrement…', note: 'Gardez la page ouverte.' }
    : dirty ? { tone: 'dirty', title: 'Modifications non enregistrées', note: structure.length ? `${structure.length} point${structure.length > 1 ? 's' : ''} à corriger avant d’enregistrer` : 'Enregistrez pour les conserver.' }
    : { tone: 'saved', title: isNew ? 'Nouveau film' : 'Tout est enregistré', note: meta?.updatedAt ? `Dernier enregistrement le ${dateFormat.format(new Date(meta.updatedAt))}` : 'Rien n’est encore enregistré.' };
  const environment = { readOnly: false, locked: busy !== '', assets: [], token, issues, onPreview: () => undefined };
  let publication: { tone: 'success' | 'warning' | 'neutral'; icon: ReactNode; title: string; text: string };
  if (status === 'published') publication = { tone: 'success', icon: <CheckCircle2 size={22} aria-hidden="true" />, title: 'Film publié',
    text: meta?.publishedAt ? `Proposé aux élèves du niveau ${levelCode} depuis le ${dateFormat.format(new Date(meta.publishedAt))}.` : `Proposé aux élèves du niveau ${levelCode}.` };
  else if (issues.length) publication = { tone: 'warning', icon: <CircleAlert size={22} aria-hidden="true" />,
    title: `${issues.length} point${issues.length > 1 ? 's' : ''} à compléter`, text: structure.length ? 'Certains points empêchent d’enregistrer ; les autres, seulement de publier.' : 'Le brouillon s’enregistre tel quel ; ces points empêchent seulement de publier.' };
  else publication = { tone: 'success', icon: <CheckCircle2 size={22} aria-hidden="true" />, title: 'Prêt à publier', text: dirty ? 'Enregistrez, puis publiez.' : 'Tous les contrôles sont validés.' };

  return (
    <EditorContext.Provider value={environment}>
      <div className="ed-editor fe-editor lc-enter">
        <header className="fe-head">
          <Link className="text-link fe-back" to="/espace/catalogue/films"><ArrowLeft size={16} aria-hidden="true" /> Films du Ciné-club</Link>
          <div className="fe-head-row">
            <FilmPoster film={{ title: film.title || 'Nouveau film', levelCode }} size="sm" />
            <div className="fe-head-text">
              <span className="fe-head-tags"><Badge tone="blue">{levelCode}</Badge><Badge tone={statusLabels[status].tone}>{statusLabels[status].label}</Badge>
                {dirty && <Badge tone="amber">Non enregistré</Badge>}</span>
              <h2>{film.title || 'Nouveau film'}</h2>
              <p>{sequences.length} séquence{sequences.length > 1 ? 's' : ''}{film.durationSeconds ? ` · vidéo de ${formatDuration(film.durationSeconds)}` : ''}</p>
            </div>
            {current && <button type="button" className="btn btn-secondary" onClick={() => setPreview(true)}><Eye size={17} aria-hidden="true" /> <span className="ed-hide-sm">Aperçu élève</span><span className="ed-show-sm">Aperçu</span></button>}
          </div>
        </header>

        <section className={`ed-publication fe-publication is-${publication.tone}`} aria-label="Contrôle du film">
          <header><span className="ed-publication-icon">{publication.icon}</span><div><p className="ed-overline">Contrôle du film</p><h3>{publication.title}</h3></div></header>
          <p className="ed-publication-text">{publication.text}</p>
          {issues.length > 0 && (
            <ol className="ed-issues lc-stagger" aria-label="Points à compléter">
              {shown.map((issue, index) => (
                <li key={`${issue.path}-${index}`}>
                  <button type="button" className="ed-issue" onClick={() => openIssue(issue)}>
                    <span className="ed-issue-area">{structure.includes(issue) ? <CircleAlert size={13} aria-hidden="true" /> : <ListChecks size={13} aria-hidden="true" />}{areaOf(issue.path, sequences)}</span>
                    <span className="ed-issue-text">{issue.message}</span>
                    <ChevronRight size={16} aria-hidden="true" className="ed-row-chevron" />
                  </button>
                </li>
              ))}
            </ol>
          )}
          {issues.length > 3 && (
            <button type="button" className="text-link ed-issues-more" onClick={() => setExpanded(!expanded)} aria-expanded={expanded}>
              {expanded ? 'Réduire la liste' : `Afficher les ${issues.length - 3} autres points`}<ChevronDown size={15} aria-hidden="true" className={expanded ? 'is-up' : undefined} />
            </button>
          )}
        </section>

        <Tabs label="Parties du film" idPrefix="film-editor" value={tab} onChange={(id) => setTab(id as 'film' | 'sequences')} tabs={[
          { id: 'film', label: 'Film et crédit', icon: <FilmIcon size={17} aria-hidden="true" /> },
          { id: 'sequences', label: 'Séquences', icon: <ListChecks size={17} aria-hidden="true" />, count: sequences.length },
        ]} />
        <TabPanel id={tab} idPrefix="film-editor">
          {tab === 'film' && (
            <div className="kit-card fe-card">
              <fieldset className="ed-fields" disabled={busy !== ''}>
                <div className="ed-grid-2">
                  <label data-path="film.id">Identifiant
                    <input value={film.id} readOnly={!isNew} maxLength={cineLimits.filmIdChars} placeholder="nicos-weg-a1"
                      onChange={(event) => setFilm({ id: event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })} />
                    <small className="ed-help">{isNew ? 'Minuscules, chiffres et tirets ; il ne change plus après la création.' : 'Fixé à la création (adresse et leçons des séquences).'}</small>
                  </label>
                  <label data-path="film.levelId">Niveau
                    <select value={film.levelId} onChange={(event) => setFilm({ levelId: event.target.value })}>
                      {levels.length === 0 && <option value={film.levelId}>{film.levelId.toUpperCase()}</option>}
                      {levels.map((level) => <option key={level.id} value={level.id}>{level.code} · {level.title}</option>)}
                    </select>
                  </label>
                </div>
                <div className="ed-grid-2">
                  <label data-path="film.title">Titre<input value={film.title} maxLength={cineLimits.filmTitleChars} placeholder="Nicos Weg A1" onChange={(event) => setFilm({ title: event.target.value })} /></label>
                  <label data-path="film.position">Position parmi les films du niveau<input type="number" min={1} max={cineLimits.positionMax} value={film.position}
                    onChange={(event) => setFilm({ position: Number(event.target.value) || 1 })} /></label>
                </div>
                <label data-path="film.description">Présentation (texte original)
                  <textarea rows={3} maxLength={cineLimits.descriptionChars} value={film.description} onChange={(event) => setFilm({ description: event.target.value })} /></label>
                <div className="ed-grid-2">
                  <label data-path="film.videoId">Vidéo YouTube (identifiant ou lien)
                    <input value={videoText} placeholder="4-eDoThe6qo" spellCheck={false}
                      onChange={(event) => { setVideoText(event.target.value); const id = videoIdFrom(event.target.value); setFilm({ videoId: id ?? event.target.value.trim(), videoUrl: id ? youtubeVideoUrl(id) : '' }); }} />
                    <small className="ed-help">{videoReady ? <>Lien enregistré : <a href={youtubeVideoUrl(film.videoId)} target="_blank" rel="noopener noreferrer">{youtubeVideoUrl(film.videoId)}</a></> : 'Collez le lien de la vidéo ou ses 11 caractères.'}</small>
                  </label>
                  <DurationField value={film.durationSeconds} onChange={(seconds) => setFilm({ durationSeconds: seconds })} />
                </div>
                <div className="ed-grid-2">
                  <label data-path="film.channel">Chaîne de diffusion<input value={film.channel} maxLength={cineLimits.channelChars} onChange={(event) => setFilm({ channel: event.target.value })} /></label>
                  <label data-path="film.courseUrl">Cours gratuit de l’éditeur (lien)<input type="url" value={film.courseUrl} maxLength={cineLimits.urlChars} placeholder="https://learngerman.dw.com/…"
                    onChange={(event) => setFilm({ courseUrl: event.target.value })} /></label>
                </div>
                <label data-path="film.credit">Crédit affiché aux élèves
                  <input value={film.credit} maxLength={cineLimits.creditChars} placeholder="Film : Nicos Weg, Deutsche Welle (Deutsch lernen mit der DW), lecteur YouTube"
                    onChange={(event) => setFilm({ credit: event.target.value })} /></label>
                <label data-path="film.licenseNote">Note de droits
                  <textarea rows={2} maxLength={cineLimits.licenseChars} value={film.licenseNote} onChange={(event) => setFilm({ licenseNote: event.target.value })} /></label>
              </fieldset>
            </div>
          )}

          {tab === 'sequences' && (
            <div className="fe-seq-layout">
              <aside className="fe-side">
                <div className="fe-player">
                  {videoReady ? (
                    <YoutubePlayer videoId={film.videoId} title={film.title || 'Film'} start={0} end={Math.max(film.durationSeconds, 1)} controlsRef={player}
                      watchUrl={youtubeWatchUrl(youtubeVideoUrl(film.videoId), current?.start)} showProgress={false} showReplay={false}
                      actions={current ? <>
                        <button type="button" className="btn btn-soft btn-sm" onClick={() => go(current.start)}><Play size={14} aria-hidden="true" /> Début de la séquence</button>
                        <button type="button" className="btn btn-ghost btn-sm" onClick={() => go(Math.max(current.start, current.end - 10))}>10 s avant la fin</button>
                      </> : undefined} />
                  ) : <div className="ed-empty-inline"><FilmIcon size={18} aria-hidden="true" /> Saisissez la vidéo YouTube dans « Film et crédit » pour afficher le lecteur.</div>}
                </div>
                <nav className="kit-card is-flush fe-seq-nav" aria-label="Séquences du film">
                  {sequences.length === 0 ? <p className="fe-seq-empty">Aucune séquence pour l’instant.</p> : (
                    <ol className="kit-list">
                      {sequences.map((sequence, index) => {
                        const count = issues.filter((issue) => issue.path.startsWith(`sequences[${index}]`)).length;
                        return (
                          <li key={sequence.id}>
                            <button type="button" className="kit-list-item fe-seq-item" aria-current={index === currentIndex ? 'true' : undefined} onClick={() => setSelected(index)}>
                              <span className="cine-seq-badge" aria-hidden="true">{index + 1}</span>
                              <span className="kit-list-main"><strong>{sequence.title || 'Séquence sans titre'}</strong>
                                <small><TimeRange start={sequence.start} end={sequence.end} />{sequence.approx ? ' · à vérifier' : ''} · {sequence.questions.length} question{sequence.questions.length > 1 ? 's' : ''}</small></span>
                              {count > 0 && <span className="ed-issue-flag"><CircleAlert size={13} aria-hidden="true" />{count}<span className="sr-only"> points à compléter</span></span>}
                            </button>
                          </li>
                        );
                      })}
                    </ol>
                  )}
                  <button type="button" className="ed-plan-add fe-seq-add" onClick={addSequence} disabled={busy !== '' || sequences.length >= cineLimits.sequencesMax}>
                    <Plus size={16} aria-hidden="true" /> Ajouter une séquence
                  </button>
                </nav>
              </aside>

              <div className="fe-seq-main">
                {!current ? (
                  <div className="ed-empty-card"><EmptyState icon={<ListChecks size={26} />} title="Aucune séquence" description="Découpez le film en séquences de 3 à 15 minutes, qui suivent ses épisodes."
                    action={<button type="button" className="btn btn-primary" onClick={addSequence}><Plus size={16} aria-hidden="true" /> Ajouter une séquence</button>} /></div>
                ) : (
                  <article className="kit-card fe-card fe-sequence" key={current.id} aria-label={`Séquence ${currentIndex + 1}`}>
                    <header className="fe-sequence-head">
                      <span className="cine-seq-num is-small" aria-hidden="true"><small>Séq.</small>{currentIndex + 1}</span>
                      <div className="fe-sequence-titles"><p className="ed-overline">Séquence {currentIndex + 1} sur {sequences.length} · <code>{current.id}</code></p>
                        <h3>{current.title || 'Séquence sans titre'}</h3></div>
                      <div className="ed-tools">
                        <IconAction icon={ArrowUp} label={`Monter la séquence ${currentIndex + 1}`} disabled={currentIndex === 0 || busy !== ''} onClick={() => moveSequence(currentIndex, -1)} />
                        <IconAction icon={ArrowDown} label={`Descendre la séquence ${currentIndex + 1}`} disabled={currentIndex === sequences.length - 1 || busy !== ''} onClick={() => moveSequence(currentIndex, 1)} />
                        <IconAction icon={Trash2} tone="danger" label={`Supprimer la séquence ${currentIndex + 1}`} disabled={busy !== ''} onClick={() => setConfirm('remove')} />
                      </div>
                    </header>
                    <fieldset className="ed-fields" disabled={busy !== ''}>
                      <label data-path={`${at}.title`}>Titre (allemand · glose française en A1 et A2)
                        <input value={current.title} maxLength={cineLimits.sequenceTitleChars} placeholder="Wo ist …? · Où est… ?" onChange={(event) => setSequence(currentIndex, { title: event.target.value })} /></label>
                      <div className="fe-bounds">
                        <TimeField label="Début" value={current.start} path={`${at}.start`} onChange={(start) => setSequence(currentIndex, { start })} onTake={() => take('start')} onGo={() => go(current.start)} />
                        <TimeField label="Fin" value={current.end} path={`${at}.end`} onChange={(end) => setSequence(currentIndex, { end })} onTake={() => take('end')} onGo={() => go(current.end)} />
                        <p className={`fe-length${current.end - current.start >= cineLimits.sequenceMinSeconds && current.end - current.start <= cineLimits.sequenceMaxSeconds ? ' is-ok' : ''}`}>
                          <Clock size={15} aria-hidden="true" /> Durée {current.end > current.start ? formatDuration(current.end - current.start) : '—'} <small>(3 à 15 min)</small></p>
                        <label className="fe-approx"><input type="checkbox" checked={current.approx} onChange={(event) => setSequence(currentIndex, { approx: event.target.checked })} />
                          Bornes approchées, à vérifier en regardant</label>
                      </div>
                      <TextWithPreview label="Avant de regarder : situation, questions d’anticipation, consignes" value={current.context} path={`${at}.context`} rows={6}
                        readOnly={false} maxLength={cineLimits.contextChars} placeholder={'Nico sucht seinen Weg in der Stadt. [fr] Nico cherche son chemin en ville.\n• Wie fragt man höflich nach dem Weg? [fr] Comment demande-t-on poliment son chemin ?'}
                        onChange={(context) => setSequence(currentIndex, { context })} />
                      <KeywordsEditor keywords={current.keywords} path={at} onChange={(keywords) => setSequence(currentIndex, { keywords })} />
                      <div className="fe-questions">
                        <div className="fe-block-head">
                          <h4><ListChecks size={16} aria-hidden="true" /> Questions « après »</h4>
                          <span className={`fe-count${current.questions.length >= cineLimits.questionsMin && current.questions.length <= cineLimits.questionsMax ? ' is-ok' : ''}`}>
                            {current.questions.length} / {cineLimits.questionsMin} à {cineLimits.questionsMax}</span>
                        </div>
                        <QuestionsEditor questions={current.questions as unknown as DraftQuestion[]} path={at} typed types={cineQuestionTypes}
                          onChange={(questions) => setSequence(currentIndex, { questions: questions as unknown as DraftQuestionV4[] })} />
                      </div>
                    </fieldset>
                  </article>
                )}
              </div>
            </div>
          )}
        </TabPanel>

        <div className={`ed-actionbar is-${saveState.tone}`} role="region" aria-label="Enregistrement et publication">
          <div className="ed-savestate" role="status">
            <span className="ed-savestate-dot" aria-hidden="true" />
            <span><strong>{saveState.title}</strong><small>{saveState.note}</small></span>
          </div>
          <div className="ed-actionbar-buttons">
            <button type="button" className="btn btn-secondary" onClick={() => void save()} disabled={busy !== '' || (!dirty && !isNew)}>
              <Save size={17} aria-hidden="true" /> {busy === 'save' ? 'Enregistrement…' : 'Enregistrer'}
            </button>
            {status === 'draft' && !isNew && (
              <button type="button" className="btn btn-primary" onClick={() => setConfirm('publish')} disabled={busy !== ''}>
                <Send size={17} aria-hidden="true" /> {busy === 'publish' ? 'Publication…' : 'Publier'}
              </button>
            )}
            {status === 'published' && (
              <button type="button" className="btn btn-ghost" onClick={() => setConfirm('retire')} disabled={busy !== ''}>
                <Archive size={17} aria-hidden="true" /> {busy === 'retire' ? 'Retrait…' : 'Retirer'}
              </button>
            )}
          </div>
        </div>

        {confirm === 'publish' && (
          <ConfirmDialog title={`Publier « ${film.title} » ?`} confirm="Publier" onConfirm={() => void setStatus('publish')} onClose={() => setConfirm(null)}>
            <p>Le film sera proposé aux élèves du niveau {levelCode}, dans le Ciné-club de leur bibliothèque.</p>
            {dirty && <p>Vos modifications seront d’abord enregistrées.</p>}
            {completeness.length > 0 && <Callout tone="warning">{completeness.length} point{completeness.length > 1 ? 's restent' : ' reste'} à compléter : la publication sera refusée.</Callout>}
          </ConfirmDialog>
        )}
        {confirm === 'retire' && (
          <ConfirmDialog title="Retirer ce film ?" confirm="Retirer" tone="danger" onConfirm={() => void setStatus('retire')} onClose={() => setConfirm(null)}>
            <p>Il repasse en brouillon et n’est plus proposé aux élèves. Les résultats déjà remis restent consultables.</p>
          </ConfirmDialog>
        )}
        {confirm === 'remove' && current && (
          <ConfirmDialog title={`Supprimer la séquence ${currentIndex + 1} ?`} confirm="Supprimer" tone="danger" onClose={() => setConfirm(null)}
            onConfirm={() => { change((doc) => ({ ...doc, sequences: doc.sequences.filter((_, position) => position !== currentIndex) })); setSelected(Math.max(0, currentIndex - 1)); }}>
            <p>« {current.title || current.id} », ses mots-clés et ses questions seront supprimés à l’enregistrement, avec sa leçon. Les corrigés déjà remis restent figés.</p>
          </ConfirmDialog>
        )}
        {preview && current && <SequencePreview document={document} index={currentIndex} token={token} onClose={() => setPreview(false)} />}
      </div>
    </EditorContext.Provider>
  );
}

/** Durée de la vidéo (« 1:43:00 »). */
function DurationField({ value, onChange }: { value: number; onChange: (seconds: number) => void }) {
  const [text, setText] = useState(value ? formatTimecode(value) : '');
  return (
    <label data-path="film.durationSeconds">Durée de la vidéo
      <input type="text" inputMode="numeric" value={text} placeholder="1:43:00" aria-invalid={Boolean(text) && parseTimecode(text) === null}
        onChange={(event) => { setText(event.target.value); const parsed = parseTimecode(event.target.value); if (parsed !== null) onChange(parsed); }} />
      <small className="ed-help">Heures, minutes et secondes : les séquences doivent tenir dans la vidéo.</small>
    </label>
  );
}
