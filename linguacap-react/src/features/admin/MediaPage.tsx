import { Headphones, Image as ImageIcon, Plus, Search, Upload } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { Badge, Dialog, EmptyState, PageHeading } from '../../components/ui';
import { useDemo } from '../../demo/context';
import type { MediaAsset } from '../../domain/types';
import MediaPreview from './MediaPreview';

const mediaLabels = { image: 'Image', audio: 'Audio' } as const;
const mimeTypes = {
  image: ['image/jpeg', 'image/png', 'image/webp'],
  audio: ['audio/mpeg', 'audio/ogg', 'audio/wav', 'audio/x-wav', 'audio/webm', 'audio/mp4'],
};
const maxFileBytes = 750_000;
const maxEncodedLength = 2_000_000;

function readDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') resolve(reader.result);
      else reject(new Error('Le fichier n’a pas pu être lu.'));
    };
    reader.onerror = () => reject(new Error('Le fichier n’a pas pu être lu.'));
    reader.readAsDataURL(file);
  });
}

function UploadDialog({ close }: { close: () => void }) {
  const { state, update, notify } = useDemo();
  const [kind, setKind] = useState<MediaAsset['kind']>('image');
  const [title, setTitle] = useState('');
  const [alt, setAlt] = useState('');
  const [transcript, setTranscript] = useState('');
  const [credit, setCredit] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    setError('');
    if (!title.trim() || (kind === 'image' && !alt.trim())) {
      setError('Renseignez le titre et le texte alternatif demandé.');
      return;
    }
    if (!file) {
      setError('Sélectionnez un fichier.');
      return;
    }
    if (!mimeTypes[kind].includes(file.type)) {
      setError(kind === 'image' ? 'Choisissez une image JPEG, PNG ou WebP.' : 'Choisissez un fichier audio pris en charge.');
      return;
    }
    if (file.size > maxFileBytes) {
      setError('Le fichier dépasse la limite de 750 Ko de cette démonstration locale.');
      return;
    }

    setLoading(true);
    try {
      const src = await readDataUrl(file);
      const usedSpace = state.media.filter(item => item.src.startsWith('data:')).reduce((sum, item) => sum + item.src.length, 0);
      if (usedSpace + src.length > maxEncodedLength) {
        setError('La médiathèque locale a atteint sa capacité. Utilisez un fichier plus léger.');
        return;
      }

      const asset: MediaAsset = { id: crypto.randomUUID(), title: title.trim(), kind, src };
      if (credit.trim()) asset.credit = credit.trim();
      if (kind === 'image') asset.alt = alt.trim();
      else if (transcript.trim()) asset.transcript = transcript.trim();
      update(previous => ({ ...previous, media: [asset, ...previous.media] }));
      notify('Média ajouté à la médiathèque locale.');
      close();
    } catch (issue) {
      setError(issue instanceof Error ? issue.message : 'Impossible d’ajouter le fichier.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog title="Ajouter un média" onClose={close}>
      <form className="admin-form stack" onSubmit={submit}>
        <div className="form-grid">
          <label>Type
            <select value={kind} onChange={event => {
              setKind(event.target.value === 'audio' ? 'audio' : 'image');
              setFile(null);
              setError('');
            }}>
              <option value="image">Image</option>
              <option value="audio">Audio</option>
            </select>
          </label>
          <label>Titre<input required value={title} onChange={event => setTitle(event.target.value)} maxLength={100} /></label>
        </div>
        <label className="admin-upload">
          <Upload size={20} />
          <span>Fichier {kind === 'audio' ? 'audio' : 'image'} <small className="muted">· 750 Ko maximum</small></span>
          <input key={kind} type="file" accept={mimeTypes[kind].join(',')} required onChange={event => setFile(event.target.files?.[0] ?? null)} />
        </label>
        {kind === 'image'
          ? <label>Texte alternatif<input value={alt} onChange={event => setAlt(event.target.value)} placeholder="Décrivez ce que montre l’image." required maxLength={220} /></label>
          : <label>Transcription<textarea value={transcript} onChange={event => setTranscript(event.target.value)} rows={3} maxLength={2_000} /></label>}
        <label>Crédit ou source<input value={credit} onChange={event => setCredit(event.target.value)} maxLength={170} /></label>
        {error && <p className="admin-error" role="alert">{error}</p>}
        <div className="admin-form-actions">
          <button type="button" className="btn btn-outline" onClick={close}>Annuler</button>
          <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Lecture du fichier…' : 'Ajouter à la médiathèque'}</button>
        </div>
      </form>
    </Dialog>
  );
}

export default function MediaPage() {
  const { state } = useDemo();
  const [filter, setFilter] = useState<'all' | MediaAsset['kind']>('all');
  const [query, setQuery] = useState('');
  const [uploadOpen, setUploadOpen] = useState(false);
  const assets = state.media.filter(asset => (filter === 'all' || asset.kind === filter)
    && asset.title.toLocaleLowerCase('fr').includes(query.trim().toLocaleLowerCase('fr')));

  return (
    <>
      <PageHeading
        eyebrow="Administration"
        title="Médiathèque"
        description="Importez et prévisualisez les images et les audios réutilisables dans vos cours."
        action={<button className="btn btn-primary" onClick={() => setUploadOpen(true)}><Plus size={18} /> Ajouter un média</button>}
      />
      <div className="admin-toolbar admin-catalogue-toolbar">
        <label className="admin-search">
          <Search size={19} />
          <input value={query} onChange={event => setQuery(event.target.value)} aria-label="Rechercher un média" placeholder="Rechercher dans la médiathèque" />
        </label>
        <select aria-label="Filtrer les médias par type" value={filter} onChange={event => setFilter(event.target.value as typeof filter)}>
          <option value="all">Tous les supports</option>
          <option value="image">Images</option>
          <option value="audio">Audios</option>
        </select>
      </div>
      {assets.length ? (
        <div className="admin-catalogue-grid">
          {assets.map(asset => {
            const linked = state.catalog.filter(entry => entry.mediaIds.includes(asset.id)).length;
            return (
              <article className="panel admin-media-card" key={asset.id}>
                <MediaPreview asset={asset} />
                <div className="admin-media-body">
                  <div className="row">
                    <Badge tone={asset.kind === 'audio' ? 'violet' : 'blue'}>{asset.kind === 'audio' ? <Headphones size={14} /> : <ImageIcon size={14} />} {mediaLabels[asset.kind]}</Badge>
                    <span className="muted">{linked} version{linked === 1 ? '' : 's'} liée{linked === 1 ? '' : 's'}</span>
                  </div>
                  <h2>{asset.title}</h2>
                  {asset.kind === 'image' && asset.alt && <p>{asset.alt}</p>}
                  {asset.kind === 'audio' && asset.transcript && <details><summary>Transcription</summary><p>{asset.transcript}</p></details>}
                  {asset.credit && <span className="admin-cell-note">{asset.credit}</span>}
                </div>
              </article>
            );
          })}
        </div>
      ) : <section className="panel admin-panel"><EmptyState title="Aucun média trouvé" description="Essayez un autre filtre ou importez un support." /></section>}
      {uploadOpen && <UploadDialog close={() => setUploadOpen(false)} />}
    </>
  );
}
