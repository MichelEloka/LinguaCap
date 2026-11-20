import { BookOpen, Eye, FilePenLine, Layers, Plus } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Badge, Dialog, EmptyState, PageHeading } from '../../components/ui';
import { useDemo } from '../../demo/context';
import type { CatalogEntry, MediaAsset } from '../../domain/types';
import MediaPreview from './MediaPreview';

const levelOrder = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;
const statusLabels: Record<CatalogEntry['status'], string> = {
  draft: 'Brouillon',
  published: 'Publié',
  archived: 'Archivé',
};
const statusTones = { draft: 'amber', published: 'green', archived: 'neutral' } as const;

function CatalogueEditor({
  entry,
  availableLevels,
  close,
}: {
  entry: CatalogEntry | null;
  availableLevels: readonly string[];
  close: () => void;
}) {
  const { state, update, notify } = useDemo();
  const [level, setLevel] = useState(entry?.level ?? availableLevels[0] ?? 'B1');
  const [title, setTitle] = useState(entry?.title ?? '');
  const [description, setDescription] = useState(entry?.description ?? '');
  const [mediaIds, setMediaIds] = useState(entry?.mediaIds ?? []);
  const [error, setError] = useState('');

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const publish = (event.nativeEvent as SubmitEvent).submitter?.getAttribute('value') === 'publish';
    if (!title.trim() || !description.trim()) {
      setError('Renseignez le titre et la description du niveau.');
      return;
    }
    if (publish && !mediaIds.length) {
      setError('Associez au moins une ressource pédagogique avant de publier.');
      return;
    }

    const version: CatalogEntry = {
      id: entry?.id ?? crypto.randomUUID(),
      level,
      title: title.trim(),
      description: description.trim(),
      status: publish ? 'published' : 'draft',
      version: entry?.version ?? 1,
      mediaIds,
    };
    update(previous => ({
      ...previous,
      catalog: [
        version,
        ...previous.catalog.filter(item => item.id !== version.id).map(item => (
          publish && item.level === level && item.status === 'published' ? { ...item, status: 'archived' as const } : item
        )),
      ],
    }));
    notify(publish ? `${level} · version ${version.version} publiée dans la démo.` : 'Brouillon enregistré.');
    close();
  }

  function toggleMedia(id: string) {
    setMediaIds(previous => previous.includes(id) ? previous.filter(item => item !== id) : [...previous, id]);
  }

  return (
    <Dialog title={entry ? `Modifier ${entry.level} · version ${entry.version}` : 'Créer un niveau'} onClose={close}>
      <form className="admin-form stack" onSubmit={save}>
        <div className="form-grid">
          {entry
            ? <label>Niveau<input value={level} readOnly /></label>
            : <label>Niveau<select value={level} onChange={event => setLevel(event.target.value)}>{availableLevels.map(item => <option key={item}>{item}</option>)}</select></label>}
          <label>Titre du parcours<input value={title} onChange={event => setTitle(event.target.value)} maxLength={100} placeholder="Allemand intermédiaire" required /></label>
        </div>
        <label>Description<textarea value={description} onChange={event => setDescription(event.target.value)} rows={3} maxLength={480} placeholder="Décrivez ce que l’élève va savoir faire." required /></label>
        <fieldset className="admin-media-options">
          <legend>Supports associés</legend>
          {state.media.length ? state.media.map(media => (
            <label key={media.id}>
              <input type="checkbox" checked={mediaIds.includes(media.id)} onChange={() => toggleMedia(media.id)} />
              <span>{media.title}</span>
              <span className="muted">{media.kind === 'image' ? 'Image' : 'Audio'}</span>
            </label>
          )) : <p className="muted">Ajoutez un support dans la médiathèque pour l’associer au niveau.</p>}
        </fieldset>
        {error && <p role="alert" className="admin-error">{error}</p>}
        <div className="admin-form-actions">
          <button className="btn btn-outline" type="submit" value="draft">Enregistrer le brouillon</button>
          <button className="btn btn-primary" type="submit" value="publish">Publier le niveau</button>
        </div>
      </form>
    </Dialog>
  );
}

function CataloguePreview({ entry, media, close }: { entry: CatalogEntry; media: MediaAsset[]; close: () => void }) {
  return (
    <Dialog title={`Aperçu du niveau ${entry.level}`} onClose={close}>
      <div className="admin-preview stack">
        <div className="row">
          <Badge tone={statusTones[entry.status]}>{statusLabels[entry.status]}</Badge>
          <span className="muted">Allemand · Version {entry.version}</span>
        </div>
        <div><h3>{entry.title}</h3><p>{entry.description}</p></div>
        {media.map(item => (
          <div key={item.id} className="admin-preview-support">
            <strong>{item.title}</strong>
            <MediaPreview asset={item} />
            {item.transcript && <p className="muted">{item.transcript}</p>}
          </div>
        ))}
        {!media.length && <p className="muted">Aucun support associé à cette version.</p>}
      </div>
    </Dialog>
  );
}

export default function CataloguePage() {
  const { state, update, notify } = useDemo();
  const [filter, setFilter] = useState<'all' | CatalogEntry['status']>('all');
  const [modal, setModal] = useState<{ kind: 'create' } | { kind: 'edit' | 'preview'; id: string } | null>(null);

  const activeEntry = modal && 'id' in modal ? state.catalog.find(entry => entry.id === modal.id) : undefined;
  const availableLevels = levelOrder.filter(level => !state.catalog.some(entry => entry.level === level));
  const entries = state.catalog
    .filter(entry => filter === 'all' || entry.status === filter)
    .sort((first, second) => first.level.localeCompare(second.level) || second.version - first.version);

  function editRevision(entry: CatalogEntry) {
    const draft = state.catalog.find(item => item.level === entry.level && item.status === 'draft');
    if (draft) {
      setModal({ kind: 'edit', id: draft.id });
      return;
    }
    const nextVersion = Math.max(...state.catalog.filter(item => item.level === entry.level).map(item => item.version)) + 1;
    const revision: CatalogEntry = { ...entry, id: crypto.randomUUID(), status: 'draft', version: nextVersion, mediaIds: [...entry.mediaIds] };
    update(previous => ({ ...previous, catalog: [revision, ...previous.catalog] }));
    setModal({ kind: 'edit', id: revision.id });
    notify(`Brouillon de la version ${nextVersion} créé.`);
  }

  return (
    <>
      <PageHeading
        eyebrow="Administration"
        title="Catalogue des parcours"
        description="Créez les niveaux, associez leurs supports et publiez les versions dans le catalogue."
        action={<button className="btn btn-primary" disabled={!availableLevels.length} onClick={() => setModal({ kind: 'create' })}><Plus size={18} /> Créer un niveau</button>}
      />

      <div className="admin-toolbar admin-catalogue-toolbar">
        <select aria-label="Filtrer par statut" value={filter} onChange={event => setFilter(event.target.value as typeof filter)}>
          <option value="all">Tous les statuts</option>
          <option value="draft">Brouillons</option>
          <option value="published">Publiés</option>
          <option value="archived">Archivés</option>
        </select>
        <Link to="/administration/mediatheque" className="btn btn-outline">Ouvrir la médiathèque</Link>
      </div>

      {entries.length ? (
        <div className="admin-catalogue-grid">
          {entries.map(entry => (
            <article className="panel admin-catalogue-card" key={entry.id}>
              <div className="admin-catalogue-top">
                <span className="admin-catalogue-level">{entry.level}</span>
                <Badge tone={statusTones[entry.status]}>{statusLabels[entry.status]}</Badge>
              </div>
              <div><p className="admin-catalogue-meta">Allemand · Version {entry.version}</p><h2>{entry.title}</h2><p>{entry.description}</p></div>
              <p className="admin-catalogue-supports"><BookOpen size={17} /> {entry.mediaIds.length} support{entry.mediaIds.length === 1 ? '' : 's'}</p>
              <div className="admin-card-actions">
                <button className="btn btn-outline" onClick={() => setModal({ kind: 'preview', id: entry.id })}><Eye size={17} /> Aperçu</button>
                {entry.status === 'draft' && <button className="btn btn-soft" onClick={() => setModal({ kind: 'edit', id: entry.id })}><FilePenLine size={17} /> Modifier</button>}
                {entry.status === 'published' && <button className="btn btn-soft" onClick={() => editRevision(entry)}><Layers size={17} /> Nouvelle version</button>}
              </div>
            </article>
          ))}
        </div>
      ) : <section className="panel admin-panel"><EmptyState title="Aucune version à afficher" description="Choisissez un autre statut ou créez un niveau." /></section>}

      {modal?.kind === 'create' && <CatalogueEditor entry={null} availableLevels={availableLevels} close={() => setModal(null)} />}
      {modal?.kind === 'edit' && activeEntry && <CatalogueEditor entry={activeEntry} availableLevels={availableLevels} close={() => setModal(null)} />}
      {modal?.kind === 'preview' && activeEntry && (
        <CataloguePreview entry={activeEntry} media={state.media.filter(item => activeEntry.mediaIds.includes(item.id))} close={() => setModal(null)} />
      )}
    </>
  );
}
