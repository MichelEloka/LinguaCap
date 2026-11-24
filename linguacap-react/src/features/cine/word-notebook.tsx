/**
 * Carnet de mots de l'élève (GET/POST /learning/words, PATCH et DELETE /learning/words/{id}) : chargement partagé, ajout,
 * modification et suppression avec retour immédiat, formulaire « Noter un mot » (avec les lettres allemandes) et carnet
 * d'une séquence affiché à côté du lecteur.
 */
import { useCallback, useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookmarkPlus, NotebookPen, Trash2 } from 'lucide-react';
import { useToast } from '../../design/kit';
import { requestApi } from '../../integration/api';
import { cineLimits, type LearnerWord, type LearnerWordPatch, type NewLearnerWord } from '../../integration/cine';
import { GermanKeyboardScope } from '../pilot/german-keys';
import '../pilot/study-exercise.css';
import './cine.css';

export function errorText(error: unknown) {
  return error instanceof Error && error.name !== 'TimeoutError' ? error.message : 'Le service est momentanément indisponible. Réessayez.';
}

const fold = (value: string) => value.trim().toLocaleLowerCase('de-DE');
/** Même mot pour la même source (règle d'unicité du carnet). */
export const sameEntry = (word: Pick<LearnerWord, 'word' | 'sourceId'>, value: string, sourceId: string | null) =>
  fold(word.word) === fold(value) && (word.sourceId ?? null) === sourceId;

/** Article en tête d'un mot (« der Kopf ») : sert à colorer le mot comme dans le lexique. */
export function articleOf(word: string): 'der' | 'die' | 'das' | null {
  const match = /^(der|die|das)\s/i.exec(word.trim());
  return match ? match[1].toLowerCase() as 'der' | 'die' | 'das' : null;
}

/**
 * Carnet de l'élève connecté. `words` vaut null pendant le premier chargement ; `failed` si le carnet n'a pas pu être lu.
 * Les écritures renvoient le mot enregistré, ou lèvent l'erreur du service (message lisible).
 */
export function useLearnerWords(token: string) {
  const [words, setWords] = useState<LearnerWord[] | null>(null);
  const [failed, setFailed] = useState('');
  const [reload, setReload] = useState(0);
  useEffect(() => {
    let active = true;
    setFailed('');
    requestApi<LearnerWord[]>('/learning/words', token).then(
      (list) => { if (active) setWords(list); },
      (error: unknown) => { if (active) { setFailed(errorText(error)); setWords((current) => current ?? []); } },
    );
    return () => { active = false; };
  }, [token, reload]);

  const add = useCallback(async (payload: NewLearnerWord) => {
    const created = await requestApi<LearnerWord>('/learning/words', token, { method: 'POST', body: payload });
    setWords((current) => [created, ...(current ?? []).filter((item) => item.id !== created.id)]);
    return created;
  }, [token]);
  const update = useCallback(async (id: string, patch: LearnerWordPatch) => {
    const saved = await requestApi<LearnerWord>(`/learning/words/${encodeURIComponent(id)}`, token, { method: 'PATCH', body: patch });
    setWords((current) => (current ?? []).map((item) => (item.id === id ? saved : item)));
    return saved;
  }, [token]);
  const remove = useCallback(async (id: string) => {
    await requestApi(`/learning/words/${encodeURIComponent(id)}`, token, { method: 'DELETE' });
    setWords((current) => (current ?? []).filter((item) => item.id !== id));
  }, [token]);
  return { words, failed, add, update, remove, retry: () => setReload((value) => value + 1) };
}

/**
 * Formulaire « Noter un mot » : mot ou expression (allemand), traduction ou remarque. `onSubmit` enregistre ; le formulaire
 * se vide et rend le focus au mot pour enchaîner pendant le visionnage.
 */
export function WordForm({ onSubmit, initial, submitLabel = 'Noter', compact = false, autoFocus = false }: {
  onSubmit: (word: string, note: string) => Promise<boolean>;
  initial?: { word: string; note: string };
  submitLabel?: string;
  compact?: boolean;
  autoFocus?: boolean;
}) {
  const [word, setWord] = useState(initial?.word ?? '');
  const [note, setNote] = useState(initial?.note ?? '');
  const [busy, setBusy] = useState(false);
  const wordField = useRef<HTMLInputElement>(null);
  const ids = useId();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || !word.trim()) { wordField.current?.focus(); return; }
    setBusy(true);
    const done = await onSubmit(word.trim(), note.trim());
    setBusy(false);
    if (done && !initial) { setWord(''); setNote(''); wordField.current?.focus(); }
  }

  return (
    <form className={`cw-form${compact ? ' is-compact' : ''}`} onSubmit={submit} noValidate>
      <GermanKeyboardScope className="cw-form-fields">
        <label htmlFor={`${ids}-word`}>Mot ou expression</label>
        <input id={`${ids}-word`} ref={wordField} type="text" lang="de" value={word} maxLength={cineLimits.wordChars} required autoFocus={autoFocus}
          autoComplete="off" spellCheck={false} placeholder="der Bahnhof" onChange={(event) => setWord(event.target.value)} />
        <label htmlFor={`${ids}-note`}>Traduction ou remarque <span className="cw-optional">facultatif</span></label>
        <input id={`${ids}-note`} type="text" value={note} maxLength={cineLimits.noteChars} autoComplete="off"
          placeholder="la gare" onChange={(event) => setNote(event.target.value)} />
      </GermanKeyboardScope>
      <button type="submit" className="btn btn-primary cw-form-submit" disabled={busy}>
        <BookmarkPlus size={16} aria-hidden="true" /> {busy ? 'Enregistrement…' : submitLabel}
      </button>
    </form>
  );
}

/** Une ligne de mot : article coloré, mot, note et action. */
export function WordChip({ word, onRemove }: { word: LearnerWord; onRemove?: () => void }) {
  const article = articleOf(word.word);
  return (
    <li className="cw-chip" data-article={article ?? undefined}>
      <span className="cw-chip-text">
        <strong lang="de">{word.word}</strong>
        {word.note && <small>{word.note}</small>}
      </span>
      {onRemove && (
        <button type="button" className="icon-button cw-chip-remove" onClick={onRemove} aria-label={`Retirer « ${word.word} » du carnet`}>
          <Trash2 size={15} aria-hidden="true" />
        </button>
      )}
    </li>
  );
}

/**
 * Carnet d'une séquence, à côté du lecteur (sous le lecteur sur mobile) : noter un mot pendant le visionnage, retrouver
 * les mots déjà notés pour cette séquence, ouvrir le carnet complet.
 */
export function SequenceNotebook({ sequenceId, notebook }: { sequenceId: string; notebook: ReturnType<typeof useLearnerWords> }) {
  const toast = useToast();
  const { words, add, remove } = notebook;
  const mine = (words ?? []).filter((item) => item.sourceKind === 'film' && item.sourceId === sequenceId);

  async function note(word: string, text: string) {
    if (mine.some((item) => sameEntry(item, word, sequenceId))) {
      toast(`« ${word} » est déjà dans votre carnet pour cette séquence.`, 'warning');
      return false;
    }
    try {
      await add({ word, note: text, sourceKind: 'film', sourceId: sequenceId });
      toast(`« ${word} » est noté dans votre carnet.`);
      return true;
    } catch (error) {
      toast(errorText(error), 'warning');
      return false;
    }
  }

  async function drop(item: LearnerWord) {
    try {
      await remove(item.id);
      toast(`« ${item.word} » est retiré du carnet.`);
    } catch (error) {
      toast(errorText(error), 'warning');
    }
  }

  return (
    <aside className="cw-notebook" aria-labelledby="cw-notebook-title">
      <header className="cw-notebook-head">
        <span className="cw-notebook-icon" aria-hidden="true"><NotebookPen size={18} /></span>
        <div>
          <h2 id="cw-notebook-title">Mon carnet</h2>
          <p>Notez les mots entendus, sans quitter la vidéo.</p>
        </div>
      </header>
      <WordForm compact onSubmit={note} />
      <div className="cw-notebook-list">
        <p className="cw-notebook-count" aria-live="polite">
          {words === null ? 'Chargement du carnet…' : mine.length ? `${mine.length} mot${mine.length > 1 ? 's' : ''} noté${mine.length > 1 ? 's' : ''} pour cette séquence` : 'Aucun mot noté pour cette séquence.'}
        </p>
        {mine.length > 0 && (
          <ul className="cw-chips lc-stagger" aria-label="Mots notés pour cette séquence">
            {mine.map((item) => <WordChip key={item.id} word={item} onRemove={() => void drop(item)} />)}
          </ul>
        )}
      </div>
      <Link className="cw-notebook-link" to="/espace/mots">Ouvrir mon carnet de mots <ArrowRight size={15} aria-hidden="true" /></Link>
    </aside>
  );
}
