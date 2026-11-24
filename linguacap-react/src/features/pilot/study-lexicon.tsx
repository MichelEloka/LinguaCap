/**
 * Lexique du module (V4) : bouton « Lexique du module » qui ouvre un panneau latéral (feuille en bas sur mobile) avec
 * les mots du module — article coloré der/die/das, pluriel, traduction, exemple et remarque —, une recherche, un
 * filtre par nature de mot, un mode « je me teste » qui masque les traductions, et l'écoute de chaque mot : toutes les
 * entrées partagent souvent un même fichier, chacune en lit son segment (début et fin en secondes).
 * Ciné-club (EVO-055) : pour l'élève, « Noter ce mot » ajoute l'entrée à son carnet (POST /learning/words, source
 * `activity` = `<trackVersionId>/<moduleId>`) ; les mots déjà notés sont marqués.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BookA, BookmarkCheck, BookmarkPlus, Eye, EyeOff, Info, Pause, SearchX, Volume2 } from 'lucide-react';
import { EmptyState } from '../../components/ui';
import { Chip, Drawer, SearchField, useToast } from '../../design/kit';
import { requestApi } from '../../integration/api';
import { moduleWordSource, type LearnerWord } from '../../integration/cine';
import { partOfSpeechLabels, type Lexicon, type LexiconEntry, type PartOfSpeech } from '../../integration/v4';
import './study-lexicon.css';

/** Regroupement des natures de mot pour le filtre : les petites catégories rejoignent « Autres ». */
const filterGroups: { id: string; label: string; parts: PartOfSpeech[] }[] = [
  { id: 'noun', label: 'Noms', parts: ['noun'] },
  { id: 'verb', label: 'Verbes', parts: ['verb'] },
  { id: 'adjective', label: 'Adjectifs et adverbes', parts: ['adjective', 'adverb'] },
  { id: 'expression', label: 'Expressions', parts: ['expression'] },
  { id: 'other', label: 'Autres', parts: ['preposition', 'conjunction', 'pronoun', 'number', 'other'] },
];

const fold = (value: string) => value.toLocaleLowerCase('de').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ß/g, 'ss');

/** Forme affichée d'un mot : « der Kopf », « (die) Leute » pour un nom toujours au pluriel. */
export function lexiconHeadword(entry: Pick<LexiconEntry, 'word' | 'article'>) {
  return entry.article ? `${entry.article} ${entry.word}` : entry.word;
}

function ArticleTag({ entry }: { entry: LexiconEntry }) {
  if (entry.article) return <span className={`lx-article is-${entry.article}`} lang="de">{entry.article}</span>;
  if (entry.partOfSpeech === 'noun') return <span className="lx-article is-plural" title="Toujours au pluriel">pl.</span>;
  return null;
}

/**
 * Lecteur partagé : un seul élément audio pour tout le lexique. `play` lit le segment d'une entrée et s'arrête à sa fin
 * (contrôle à chaque image) ; un second appel sur la même entrée l'interrompt.
 */
function useSegmentPlayer(onError: () => void) {
  const audio = useRef<HTMLAudioElement | null>(null);
  const source = useRef('');
  const frame = useRef(0);
  const ticket = useRef(0);
  const [playing, setPlaying] = useState<string | null>(null);

  const stop = useCallback(() => {
    ticket.current += 1;
    cancelAnimationFrame(frame.current);
    audio.current?.pause();
    setPlaying(null);
  }, []);

  useEffect(() => () => { cancelAnimationFrame(frame.current); audio.current?.pause(); }, []);

  const play = useCallback((entry: LexiconEntry) => {
    const segment = entry.audio;
    if (!segment?.url) return;
    if (playing === entry.id) { stop(); return; }
    cancelAnimationFrame(frame.current);
    const current = ++ticket.current;
    const element = audio.current ?? new Audio();
    audio.current = element;
    element.pause();
    if (source.current !== segment.url) { source.current = segment.url; element.preload = 'auto'; element.src = segment.url; }
    const watch = () => {
      if (ticket.current !== current) return;
      if (element.paused || element.ended || element.currentTime >= segment.end) {
        if (!element.paused) element.pause();
        setPlaying((value) => (value === entry.id ? null : value));
        return;
      }
      frame.current = requestAnimationFrame(watch);
    };
    const start = () => {
      if (ticket.current !== current) return;
      element.currentTime = segment.start;
      element.play().then(() => {
        if (ticket.current !== current) return;
        setPlaying(entry.id);
        frame.current = requestAnimationFrame(watch);
      }).catch((failure: unknown) => {
        if (ticket.current !== current || (failure instanceof DOMException && failure.name === 'AbortError')) return;
        setPlaying(null);
        onError();
      });
    };
    element.onerror = () => { source.current = ''; setPlaying(null); onError(); };
    if (element.readyState >= 1) start();
    else element.addEventListener('loadedmetadata', start, { once: true });
  }, [playing, stop, onError]);

  return { playing, play, stop };
}

/** Carnet de l'élève : jeton et source des mots notés depuis ce lexique (le module). */
export interface LexiconNotebook { token: string; sourceId: string }

const sameWord = (a: string, b: string) => a.trim().toLocaleLowerCase('de-DE') === b.trim().toLocaleLowerCase('de-DE');
/** Note enregistrée avec un mot du lexique : traduction et pluriel (200 caractères au plus). */
const lexiconNote = (entry: LexiconEntry) => `${entry.translation}${entry.plural ? ` (pl. ${entry.plural})` : ''}`.slice(0, 200);

function EntryRow({ entry, playing, hidden, revealed, onPlay, onReveal, noted, onNote }: {
  entry: LexiconEntry; playing: boolean; hidden: boolean; revealed: boolean; onPlay: () => void; onReveal: () => void;
  noted?: boolean; onNote?: () => void;
}) {
  const masked = hidden && !revealed;
  const headword = lexiconHeadword(entry);
  return (
    <li className={`lx-entry${entry.article ? ` is-${entry.article}` : ''}${playing ? ' is-playing' : ''}`}>
      {entry.audio?.url ? (
        <button type="button" className="lx-listen" onClick={onPlay} aria-pressed={playing}
          aria-label={playing ? `Arrêter : ${headword}` : `Écouter : ${headword}`}>
          {playing ? <Pause size={17} fill="currentColor" aria-hidden="true" /> : <Volume2 size={18} aria-hidden="true" />}
        </button>
      ) : <span className="lx-listen is-silent" aria-hidden="true"><Volume2 size={18} /></span>}
      <div className="lx-main">
        <p className="lx-word">
          <ArticleTag entry={entry} />
          <strong lang="de">{entry.word}</strong>
          {entry.plural && <span className="lx-plural" lang="de"><span className="sr-only">pluriel : </span><span aria-hidden="true">pl. </span>{entry.plural}</span>}
        </p>
        {masked ? (
          <button type="button" className="lx-reveal" onClick={onReveal}>
            <Eye size={14} aria-hidden="true" /> Voir la traduction
          </button>
        ) : <p className="lx-translation">{entry.translation}</p>}
        {entry.example && <p className="lx-example" lang="de">{entry.example}</p>}
        {entry.note && <p className="lx-note"><Info size={13} aria-hidden="true" />{entry.note}</p>}
      </div>
      <div className="lx-side">
        <span className="lx-pos">{partOfSpeechLabels[entry.partOfSpeech] ?? entry.partOfSpeech}</span>
        {onNote && (
          <button type="button" className={`lx-save${noted ? ' is-noted' : ''}`} onClick={onNote} disabled={noted} aria-pressed={noted}
            aria-label={noted ? `« ${headword} » est dans votre carnet` : `Noter ce mot : ${headword}`} title={noted ? 'Déjà dans votre carnet' : 'Noter ce mot'}>
            {noted ? <BookmarkCheck size={16} aria-hidden="true" /> : <BookmarkPlus size={16} aria-hidden="true" />}
            <span className="lx-save-label">{noted ? 'Noté' : 'Noter'}</span>
          </button>
        )}
      </div>
    </li>
  );
}

/**
 * Mots du lexique déjà notés dans le carnet de l'élève (même mot, même module) et ajout d'un mot : le carnet est lu à
 * l'ouverture du panneau ; sans carnet (service antérieur), le bouton reste proposé et l'erreur du service est affichée.
 */
function useLexiconNotebook(notebook: LexiconNotebook | undefined, entries: LexiconEntry[]) {
  const toast = useToast();
  const [words, setWords] = useState<LearnerWord[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const token = notebook?.token;
  const sourceId = notebook?.sourceId;
  useEffect(() => {
    if (!token) return;
    let active = true;
    requestApi<LearnerWord[]>('/learning/words', token).then((list) => { if (active) setWords(list); }, () => undefined);
    return () => { active = false; };
  }, [token]);
  const noted = useMemo(() => new Set(entries.filter((entry) => words.some((word) => word.sourceId === sourceId
    && sameWord(word.word, lexiconHeadword(entry)))).map((entry) => entry.id)), [entries, words, sourceId]);
  async function note(entry: LexiconEntry) {
    if (!token || !sourceId || busy) return;
    const headword = lexiconHeadword(entry);
    setBusy(entry.id);
    try {
      const created = await requestApi<LearnerWord>('/learning/words', token, {
        method: 'POST', body: { word: headword, note: lexiconNote(entry), sourceKind: 'activity', sourceId },
      });
      setWords((list) => [created, ...list]);
      toast(`« ${headword} » est noté dans votre carnet de mots.`);
    } catch (failure) {
      toast(failure instanceof Error && failure.name !== 'TimeoutError' ? failure.message : 'Le carnet est momentanément indisponible. Réessayez.', 'warning');
    } finally {
      setBusy(null);
    }
  }
  return notebook ? { noted, note } : null;
}

/** Contenu du panneau : recherche, filtres, mode « je me teste » et liste des mots. */
function LexiconPanel({ lexicon, onRenew, notebook }: { lexicon: Lexicon; onRenew?: () => void; notebook?: LexiconNotebook }) {
  const toast = useToast();
  const saving = useLexiconNotebook(notebook, lexicon.entries);
  const [search, setSearch] = useState('');
  const [group, setGroup] = useState('all');
  const [quiz, setQuiz] = useState(false);
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const failed = useCallback(() => {
    toast('Le son n’a pas pu être lu : son adresse a peut-être expiré. Rouvrez le lexique pour la renouveler.', 'warning');
    onRenew?.();
  }, [toast, onRenew]);
  const player = useSegmentPlayer(failed);

  const groups = filterGroups
    .map((item) => ({ ...item, count: lexicon.entries.filter((entry) => item.parts.includes(entry.partOfSpeech)).length }))
    .filter((item) => item.count > 0);
  const query = fold(search.trim());
  const shown = useMemo(() => lexicon.entries.filter((entry) => {
    const inGroup = group === 'all' || filterGroups.find((item) => item.id === group)?.parts.includes(entry.partOfSpeech);
    if (!inGroup) return false;
    if (!query) return true;
    return [entry.word, entry.plural, entry.translation, entry.example, entry.note, entry.article ? `${entry.article} ${entry.word}` : null]
      .some((value) => value && fold(value).includes(query));
  }), [lexicon.entries, group, query]);
  const withSound = lexicon.entries.filter((entry) => entry.audio?.url).length;

  return (
    <div className="lx-panel">
      <div className="lx-tools">
        <SearchField value={search} onChange={setSearch} label="Chercher un mot du lexique" placeholder="Chercher un mot ou une traduction" />
        <div className="lx-filters" role="group" aria-label="Filtrer par nature de mot">
          <Chip selected={group === 'all'} onClick={() => setGroup('all')}>Tous <span className="lx-chip-count">{lexicon.entries.length}</span></Chip>
          {groups.length > 1 && groups.map((item) => (
            <Chip key={item.id} selected={group === item.id} onClick={() => setGroup(group === item.id ? 'all' : item.id)}>
              {item.label} <span className="lx-chip-count">{item.count}</span>
            </Chip>
          ))}
        </div>
        <div className="lx-modes">
          <button type="button" className={`lx-quiz${quiz ? ' is-on' : ''}`} aria-pressed={quiz}
            onClick={() => { setQuiz(!quiz); setRevealed(new Set()); }}>
            {quiz ? <EyeOff size={15} aria-hidden="true" /> : <Eye size={15} aria-hidden="true" />}
            {quiz ? 'Traductions masquées' : 'Me tester : masquer les traductions'}
          </button>
          {withSound > 0 && <span className="lx-hint"><Volume2 size={14} aria-hidden="true" /> Touchez un mot pour l’écouter</span>}
        </div>
      </div>
      {shown.length === 0 ? (
        <EmptyState icon={<SearchX size={26} />} title="Aucun mot ne correspond" description="Essayez un autre mot, en allemand ou en français." />
      ) : (
        <ul className="lx-list lc-stagger" aria-label={`Mots du module ${lexicon.moduleTitle}`}>
          {shown.map((entry) => (
            <EntryRow key={entry.id} entry={entry} playing={player.playing === entry.id} hidden={quiz} revealed={revealed.has(entry.id)}
              onPlay={() => player.play(entry)} onReveal={() => setRevealed((current) => new Set(current).add(entry.id))}
              noted={saving?.noted.has(entry.id)} onNote={saving ? () => void saving.note(entry) : undefined} />
          ))}
        </ul>
      )}
    </div>
  );
}

/** Bouton « Lexique du module » (rien si le module n'a pas de lexique) ; le lexique s'ouvre dans un panneau latéral. */
export function LexiconButton({ lexicon, onOpen, onRenew, className = '', notebookToken }: {
  lexicon: Lexicon | null | undefined;
  /** Élève : jeton pour « Noter ce mot » (carnet de mots, source = le module du lexique). */
  notebookToken?: string;
  /** Appelé à l'ouverture (par exemple pour renouveler les adresses des sons). */
  onOpen?: () => void;
  /** Appelé quand un son ne peut pas être lu (adresse expirée). */
  onRenew?: () => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  if (!lexicon || lexicon.entries.length === 0) return null;
  const count = lexicon.entries.length;
  return (
    <>
      <button type="button" className={`btn btn-soft lx-button ${className}`.trim()} onClick={() => { onOpen?.(); setOpen(true); }}>
        <BookA size={17} aria-hidden="true" /> Lexique du module
        <span className="lx-button-count" aria-hidden="true">{count}</span><span className="sr-only"> ({count} mots)</span>
      </button>
      {open && (
        <Drawer title="Lexique du module" description={`${lexicon.moduleTitle} · ${count} mot${count > 1 ? 's' : ''} à connaître`}
          onClose={() => setOpen(false)}>
          <LexiconPanel lexicon={lexicon} onRenew={onRenew}
            notebook={notebookToken ? { token: notebookToken, sourceId: moduleWordSource(lexicon.trackVersionId, lexicon.moduleId) } : undefined} />
        </Drawer>
      )}
    </>
  );
}

/**
 * Lexique d'un module de la bibliothèque, chargé à la demande (GET /learning/library/{versionId}/modules/{moduleId}/lexicon).
 * Rien n'est affiché tant qu'il n'est pas chargé, ni si le module n'en a pas ; les adresses des sons (cinq minutes) sont
 * renouvelées à chaque ouverture après quatre minutes.
 */
export function LexiconLoader({ token, versionId, moduleId, className, notebook = false }: {
  token: string; versionId: string; moduleId: string; className?: string;
  /** Élève : propose « Noter ce mot » (carnet de mots). */
  notebook?: boolean;
}) {
  const [lexicon, setLexicon] = useState<Lexicon | null>(null);
  const [reload, setReload] = useState(0);
  const loadedAt = useRef(0);
  useEffect(() => {
    let active = true;
    requestApi<Lexicon>(`/learning/library/${encodeURIComponent(versionId)}/modules/${encodeURIComponent(moduleId)}/lexicon`, token).then(
      (data) => { if (active) { setLexicon(data); loadedAt.current = Date.now(); } },
      () => { /* module sans lexique ou service antérieur : pas de bouton */ },
    );
    return () => { active = false; };
  }, [token, versionId, moduleId, reload]);
  const renew = useCallback(() => setReload((value) => value + 1), []);
  return <LexiconButton lexicon={lexicon} className={className} onRenew={renew} notebookToken={notebook ? token : undefined}
    onOpen={() => { if (Date.now() - loadedAt.current > 4 * 60_000) renew(); }} />;
}
