/**
 * Mon carnet de mots (/espace/mots) : tous les mots notés par l'élève (séquences du Ciné-club, lexiques des modules,
 * saisie libre), regroupés par source, avec recherche, tri, filtre, ajout, modification et suppression.
 * Les titres des sources se lisent dans les films (GET /films) et la bibliothèque (GET /learning/library).
 */
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Clapperboard, NotebookPen, PencilLine, Plus, RotateCcw, Trash2, type LucideIcon } from 'lucide-react';
import { PageHeading, StatCard } from '../../components/ui';
import { Callout, Card, Chip, Drawer, SearchField, Segmented, Skeleton, useToast } from '../../design/kit';
import { requestApi } from '../../integration/api';
import {
  cineLibraryHref, sequenceHref, wordSourceLabels, type Film, type LearnerWord, type WordSourceKind,
} from '../../integration/cine';
import type { Library } from '../../integration/v2';
import { EmptyScene } from '../pilot/learner-common';
import { ConfirmDialog } from '../pilot/editor-parts';
import { articleOf, errorText, sameEntry, useLearnerWords, WordForm } from './word-notebook';
import '../pilot/learner-dashboard.css';
import '../pilot/study-lexicon.css';
import './cine.css';

type Sort = 'recent' | 'alpha';
type Filter = 'all' | WordSourceKind;
interface SourceInfo { title: string; href?: string }
interface Group { key: string; kind: WordSourceKind; title: string; href?: string; words: LearnerWord[] }

const kindIcons: Record<WordSourceKind, LucideIcon> = { film: Clapperboard, activity: BookOpen, manual: PencilLine };
const dayFormat = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' });
const fold = (value: string) => value.toLocaleLowerCase('de-DE').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ß/g, 'ss');
/** Clé de tri alphabétique : sans l'article (« der Bahnhof » se range à B). */
const sortKey = (word: string) => fold(word.replace(/^(der|die|das)\s+/i, ''));

/** Titres des sources : séquences des films et modules de la bibliothèque (lecture facultative). */
function useSourceTitles(token: string) {
  const [titles, setTitles] = useState<Map<string, SourceInfo>>(() => new Map());
  useEffect(() => {
    let active = true;
    Promise.all([
      requestApi<Film[]>('/films', token).catch(() => [] as Film[]),
      requestApi<Library>('/learning/library', token).catch(() => null),
    ]).then(([films, library]) => {
      if (!active) return;
      const map = new Map<string, SourceInfo>();
      for (const film of films) for (const sequence of film.sequences) {
        map.set(`film:${sequence.id}`, { title: `${film.title} · ${sequence.title}`, href: sequenceHref(film.id, sequence.id) });
      }
      for (const level of library?.levels ?? []) for (const module of level.modules) {
        map.set(`activity:${level.trackVersionId}/${module.id}`, {
          title: `${level.levelCode} · ${module.title}`,
          href: `/espace/bibliotheque?niveau=${encodeURIComponent(level.levelCode)}&module=${encodeURIComponent(module.id)}`,
        });
      }
      setTitles(map);
    });
    return () => { active = false; };
  }, [token]);
  return titles;
}

function groupTitle(kind: WordSourceKind, sourceId: string | null, titles: Map<string, SourceInfo>): SourceInfo {
  if (kind === 'manual' || !sourceId) return { title: 'Mots ajoutés à la main' };
  return titles.get(`${kind}:${sourceId}`) ?? { title: kind === 'film' ? 'Séquence du Ciné-club' : 'Lexique d’un module' };
}

function WordRow({ word, onEdit, onDelete }: { word: LearnerWord; onEdit: () => void; onDelete: () => void }) {
  const article = articleOf(word.word);
  const rest = article ? word.word.trim().slice(article.length).trim() : word.word;
  return (
    <li className="cw-row" data-article={article ?? undefined}>
      <div className="cw-row-main">
        <p className="cw-row-word">
          {article && <span className={`lx-article is-${article}`} lang="de">{article}</span>}
          <strong lang="de">{rest}</strong>
        </p>
        {word.note ? <p className="cw-row-note">{word.note}</p> : <p className="cw-row-note is-empty">Sans traduction</p>}
      </div>
      <time className="cw-row-date" dateTime={word.createdAt}>{dayFormat.format(new Date(word.createdAt))}</time>
      <div className="cw-row-actions">
        <button type="button" className="icon-button" onClick={onEdit} aria-label={`Modifier « ${word.word} »`} title="Modifier"><PencilLine size={16} aria-hidden="true" /></button>
        <button type="button" className="icon-button cw-danger" onClick={onDelete} aria-label={`Supprimer « ${word.word} »`} title="Supprimer"><Trash2 size={16} aria-hidden="true" /></button>
      </div>
    </li>
  );
}

export function WordsPage({ token }: { token: string }) {
  const toast = useToast();
  const notebook = useLearnerWords(token);
  const { words, failed } = notebook;
  const titles = useSourceTitles(token);
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<Sort>('recent');
  const [filter, setFilter] = useState<Filter>('all');
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<LearnerWord | null>(null);
  const [deleting, setDeleting] = useState<LearnerWord | null>(null);

  const counts = useMemo(() => {
    const list = words ?? [];
    return { all: list.length, film: list.filter((word) => word.sourceKind === 'film').length,
      activity: list.filter((word) => word.sourceKind === 'activity').length, manual: list.filter((word) => word.sourceKind === 'manual').length };
  }, [words]);

  const groups = useMemo<Group[]>(() => {
    const text = fold(query.trim());
    const shown = (words ?? []).filter((word) => (filter === 'all' || word.sourceKind === filter)
      && (!text || fold(word.word).includes(text) || fold(word.note).includes(text)));
    const sorted = [...shown].sort(sort === 'alpha' ? (a, b) => sortKey(a.word).localeCompare(sortKey(b.word), 'de')
      : (a, b) => b.createdAt.localeCompare(a.createdAt));
    const map = new Map<string, Group>();
    for (const word of sorted) {
      const key = `${word.sourceKind}:${word.sourceId ?? ''}`;
      let group = map.get(key);
      if (!group) {
        const info = groupTitle(word.sourceKind, word.sourceId, titles);
        group = { key, kind: word.sourceKind, title: info.title, href: info.href, words: [] };
        map.set(key, group);
      }
      group.words.push(word);
    }
    const order: WordSourceKind[] = ['film', 'activity', 'manual'];
    return [...map.values()].sort((a, b) => order.indexOf(a.kind) - order.indexOf(b.kind)
      || (sort === 'alpha' ? a.title.localeCompare(b.title, 'fr') : b.words[0].createdAt.localeCompare(a.words[0].createdAt)));
  }, [words, query, sort, filter, titles]);
  const shownCount = groups.reduce((sum, group) => sum + group.words.length, 0);

  async function addManual(word: string, note: string) {
    if ((words ?? []).some((item) => sameEntry(item, word, null))) {
      toast(`« ${word} » est déjà dans votre carnet.`, 'warning');
      return false;
    }
    try {
      await notebook.add({ word, note, sourceKind: 'manual', sourceId: null });
      toast(`« ${word} » est ajouté à votre carnet.`);
      setAdding(false);
      return true;
    } catch (error) {
      toast(errorText(error), 'warning');
      return false;
    }
  }

  async function save(word: string, note: string) {
    if (!editing) return false;
    try {
      await notebook.update(editing.id, { word, note });
      toast('Mot modifié.');
      setEditing(null);
      return true;
    } catch (error) {
      toast(errorText(error), 'warning');
      return false;
    }
  }

  async function confirmDelete(word: LearnerWord) {
    try {
      await notebook.remove(word.id);
      toast(`« ${word.word} » est supprimé du carnet.`);
    } catch (error) {
      toast(errorText(error), 'warning');
    }
  }

  const filters: { id: Filter; label: string; count: number }[] = [
    { id: 'all', label: 'Tous', count: counts.all },
    { id: 'film', label: wordSourceLabels.film, count: counts.film },
    { id: 'activity', label: wordSourceLabels.activity, count: counts.activity },
    { id: 'manual', label: wordSourceLabels.manual, count: counts.manual },
  ];

  return (
    <div className="cw-page lc-enter">
      <PageHeading eyebrow="Vocabulaire" title="Mon carnet de mots"
        description="Les mots notés pendant les films du Ciné-club, depuis les lexiques des modules ou à la main."
        action={<button type="button" className="btn btn-primary" onClick={() => setAdding(true)}><Plus size={17} aria-hidden="true" /> Ajouter un mot</button>} />

      {failed && (
        <div role="alert"><Callout tone="warning" title="Carnet indisponible">
          <p>{failed}</p>
          <button type="button" className="btn btn-outline btn-sm" onClick={notebook.retry}><RotateCcw size={15} aria-hidden="true" /> Réessayer</button>
        </Callout></div>
      )}

      <div className="cw-stats lc-stagger">
        <StatCard label="Mots notés" value={words ? counts.all : '—'} icon={<NotebookPen size={20} />} />
        <StatCard label="Dans les films" value={words ? counts.film : '—'} icon={<Clapperboard size={20} />} />
        <StatCard label="Dans les cours" value={words ? counts.activity : '—'} icon={<BookOpen size={20} />} />
      </div>

      {words === null ? (
        <div className="kit-skeleton-card" role="status" aria-label="Chargement du carnet…">
          {[0, 1, 2, 3, 4].map((index) => <Skeleton key={index} width={`${86 - index * 9}%`} height={18} />)}
        </div>
      ) : words.length === 0 ? (
        <Card><EmptyScene art="books" title="Votre carnet est vide"
          description="Notez les mots entendus pendant les séquences du Ciné-club, touchez « Noter » dans le lexique d’un module, ou ajoutez-les vous-même."
          action={<span className="cw-empty-actions">
            <button type="button" className="btn btn-primary btn-sm" onClick={() => setAdding(true)}><Plus size={15} aria-hidden="true" /> Ajouter un mot</button>
            <Link className="btn btn-soft btn-sm" to={cineLibraryHref()}><Clapperboard size={15} aria-hidden="true" /> Découvrir le Ciné-club</Link>
          </span>} /></Card>
      ) : (
        <>
          <div className="cw-toolbar">
            <SearchField label="Chercher dans mon carnet" placeholder="Chercher un mot ou une traduction" value={query} onChange={setQuery} />
            <Segmented label="Trier les mots" value={sort} onChange={setSort}
              options={[{ value: 'recent', label: 'Plus récents' }, { value: 'alpha', label: 'De A à Z' }]} />
            <div className="cw-filters" role="group" aria-label="Filtrer par source">
              {filters.map((item) => (
                <Chip key={item.id} selected={filter === item.id} onClick={() => setFilter(item.id)}>
                  {item.label} <span className="lx-chip-count">{item.count}</span>
                </Chip>
              ))}
            </div>
          </div>
          {shownCount === 0 ? (
            <Card><EmptyScene art="search" title="Aucun mot ne correspond" description="Essayez un autre mot, en allemand ou en français."
              action={<button type="button" className="btn btn-soft btn-sm" onClick={() => { setQuery(''); setFilter('all'); }}>Tout afficher</button>} /></Card>
          ) : (
            <div className="cw-groups lc-stagger">
              {groups.map((group) => {
                const Icon = kindIcons[group.kind];
                return (
                  <section key={group.key} className={`kit-card is-flush cw-group is-${group.kind}`} aria-label={`${group.title} : ${group.words.length} mot${group.words.length > 1 ? 's' : ''}`}>
                    <header className="cw-group-head">
                      <span className="cw-group-icon" aria-hidden="true"><Icon size={17} /></span>
                      <div className="cw-group-title">
                        <small>{wordSourceLabels[group.kind]}</small>
                        <h2>{group.href ? <Link to={group.href}>{group.title}</Link> : group.title}</h2>
                      </div>
                      <span className="cw-group-count">{group.words.length}</span>
                    </header>
                    <ul className="cw-rows">
                      {group.words.map((word) => <WordRow key={word.id} word={word} onEdit={() => setEditing(word)} onDelete={() => setDeleting(word)} />)}
                    </ul>
                  </section>
                );
              })}
            </div>
          )}
        </>
      )}

      {adding && (
        <Drawer title="Ajouter un mot" description="Un mot ou une expression, et sa traduction si vous le souhaitez." onClose={() => setAdding(false)}>
          <WordForm onSubmit={addManual} submitLabel="Ajouter au carnet" autoFocus />
        </Drawer>
      )}
      {editing && (
        <Drawer title="Modifier le mot" description={groupTitle(editing.sourceKind, editing.sourceId, titles).title} onClose={() => setEditing(null)}>
          <WordForm key={editing.id} initial={{ word: editing.word, note: editing.note }} onSubmit={save} submitLabel="Enregistrer" />
        </Drawer>
      )}
      {deleting && (
        <ConfirmDialog title="Supprimer ce mot ?" confirm="Supprimer" tone="danger" onConfirm={() => void confirmDelete(deleting)} onClose={() => setDeleting(null)}>
          <p>« <span lang="de">{deleting.word}</span> » sera retiré de votre carnet.</p>
        </ConfirmDialog>
      )}
    </div>
  );
}
