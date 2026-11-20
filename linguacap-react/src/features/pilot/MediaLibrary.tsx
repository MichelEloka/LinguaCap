import { useEffect, useRef, useState, type FormEvent } from 'react';
import { FileAudio, Image as ImageIcon, Pencil, RefreshCw, Upload as UploadIcon } from 'lucide-react';
import { Badge, EmptyState, Inspector } from '../../components/ui';
import { requestApi, uploadToStorage } from '../../integration/api';
import './catalogue.css';

export interface AssetVersion { version: number; mimeType: string; sizeBytes: number | null; status: 'draft' | 'published' | 'archived'; createdAt: string | null }
export interface Asset {
  id: string;
  kind: 'image' | 'audio';
  title: string;
  mimeType: string;
  alt: string | null;
  transcript: string | null;
  credit: string | null;
  source: string | null;
  license: string | null;
  status: 'draft' | 'published';
  updatedAt: string | null;
  versions: AssetVersion[];
}
interface Upload {
  id: string;
  assetId: string;
  replaces: boolean;
  kind: 'image' | 'audio';
  title: string;
  mimeType: string;
  size: number;
  status: 'pending' | 'available' | 'rejected' | 'abandoned';
  reason: string | null;
  version: number | null;
  createdAt: string;
  expiresAt: string;
  uploadUrl: string | null;
  maxBytes: number;
}
export interface MediaFile { url: string; mimeType: string; version: number; status: string; alt: string | null; transcript: string | null }

const MAX_BYTES = { image: 5 * 1024 * 1024, audio: 15 * 1024 * 1024 };
// Les navigateurs annoncent parfois les sons sous un autre nom : Médias attend ces cinq types.
const MIME_ALIASES: Record<string, string> = {
  'image/jpeg': 'image/jpeg', 'image/jpg': 'image/jpeg', 'image/png': 'image/png', 'image/webp': 'image/webp',
  'audio/mpeg': 'audio/mpeg', 'audio/mp3': 'audio/mpeg', 'audio/wav': 'audio/wav', 'audio/x-wav': 'audio/wav',
  'audio/wave': 'audio/wav', 'audio/vnd.wave': 'audio/wav',
};
const uploadStatus: Record<Upload['status'], { label: string; tone: 'green' | 'amber' | 'neutral' | 'blue' }> = {
  pending: { label: 'En attente', tone: 'blue' },
  available: { label: 'Disponible', tone: 'green' },
  rejected: { label: 'Refusé', tone: 'amber' },
  abandoned: { label: 'Abandonné', tone: 'neutral' },
};
export const versionStatus: Record<AssetVersion['status'], string> = { draft: 'brouillon', published: 'publiée', archived: 'archivée' };

function getError(error: unknown) {
  return error instanceof Error ? error.message : 'Cette action est temporairement indisponible.';
}

function formatSize(bytes: number | null) {
  if (!bytes) return '';
  return bytes >= 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(1)} Mo` : `${Math.max(1, Math.round(bytes / 1024))} Ko`;
}

export function latestVersion(asset: Asset) {
  return asset.versions[0]?.version ?? 1;
}

/** Aperçu d'une version précise (brouillon compris) pour les éditeurs du catalogue. */
export function MediaPreview({ assetId, version, token }: { assetId: string; version: number; token: string }) {
  const [file, setFile] = useState<MediaFile | null>(null);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const renewedKey = useRef('');

  useEffect(() => {
    let active = true;
    setError('');
    setFile(null);
    requestApi<MediaFile>(`/media/${encodeURIComponent(assetId)}/versions/${version}`, token).then(
      (data) => { if (active) setFile(data); },
      (failure: unknown) => { if (active) setError(getError(failure)); },
    );
    return () => { active = false; };
  }, [assetId, version, token, attempt]);

  function retry() {
    renewedKey.current = '';
    setAttempt((value) => value + 1);
  }

  function renewAfterLoadError() {
    const key = `${assetId}/${version}`;
    if (renewedKey.current === key) {
      setError('Ce fichier est momentanément inaccessible.');
      return;
    }
    renewedKey.current = key;
    setAttempt((value) => value + 1);
  }

  if (error) {
    return (
      <div className="stack">
        <p className="inline-message warning" role="alert">{error}</p>
        <button type="button" className="btn btn-outline" onClick={retry}>Réessayer</button>
      </div>
    );
  }
  if (!file) return <p className="media-preview-loading" role="status">Chargement de l’aperçu…</p>;
  return file.mimeType.startsWith('image/')
    ? <div className="media-preview-frame"><img className="media-preview-image" src={file.url} alt={file.alt ?? ''} onError={renewAfterLoadError} /></div>
    : (
      <div className="media-preview-frame stack">
        <audio controls preload="metadata" src={file.url} onError={renewAfterLoadError} aria-label="Aperçu audio" />
        {file.transcript && <details><summary>Transcription</summary><p className="pilot-transcript" lang="de">{file.transcript}</p></details>}
      </div>
    );
}

/**
 * Dépôt d'un fichier : réservation auprès de Médias, envoi direct vers le stockage avec progression, puis contrôle
 * du fichier reçu. Un envoi interrompu peut être relancé tant que le dépôt n'a pas expiré.
 */
function UploadInspector({ token, replace, onClose, onDone }: {
  token: string;
  replace?: Asset;
  onClose: () => void;
  onDone: (upload: Upload) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [phase, setPhase] = useState<'form' | 'reserving' | 'sending' | 'checking' | 'failed'>('form');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [retryable, setRetryable] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const reservation = useRef<Upload | null>(null);
  const controller = useRef<AbortController | null>(null);
  const active = useRef(false);
  const mimeType = file ? MIME_ALIASES[file.type] ?? '' : '';
  const kind = mimeType.startsWith('image/') ? 'image' : mimeType.startsWith('audio/') ? 'audio' : replace?.kind ?? 'image';

  useEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
      controller.current?.abort();
    };
  }, []);

  async function send(upload: Upload, selected: File, type: string) {
    setPhase('sending');
    setProgress(0);
    setError('');
    controller.current = new AbortController();
    try {
      if (upload.uploadUrl) await uploadToStorage(upload.uploadUrl, selected, type, token, setProgress, controller.current.signal);
      if (!active.current) return;
      setPhase('checking');
      const result = await requestApi<Upload>(`/media/uploads/${encodeURIComponent(upload.id)}/finalize`, token, { method: 'POST' });
      if (active.current) onDone(result);
    } catch (failure) {
      if (!active.current) return;
      const aborted = failure instanceof DOMException && failure.name === 'AbortError';
      setError(aborted ? 'Envoi annulé. Relancez-le dans les 30 minutes, sinon le dépôt sera abandonné.' : getError(failure));
      // Un fichier refusé clôt le dépôt ; un envoi interrompu reste relançable tant que le dépôt attend.
      const uploads = await requestApi<Upload[]>('/media/uploads', token).catch(() => []);
      if (!active.current) return;
      setRetryable(uploads.find((item) => item.id === upload.id)?.status === 'pending');
      setPhase('failed');
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file || phase !== 'form') return;
    const form = new FormData(event.currentTarget);
    const read = (key: string) => String(form.get(key) ?? '').trim();
    if (!mimeType) {
      setError('Formats acceptés : images JPEG, PNG ou WebP, sons MP3 ou WAV.');
      return;
    }
    if (replace && kind !== replace.kind) {
      setError(replace.kind === 'image' ? 'Remplacez cette image par une autre image.' : 'Remplacez ce son par un autre son.');
      return;
    }
    if (file.size > MAX_BYTES[kind]) {
      setError(kind === 'image' ? 'Une image pèse 5 Mo au plus.' : 'Un son pèse 15 Mo au plus.');
      return;
    }
    setError('');
    setPhase('reserving');
    try {
      const upload = await requestApi<Upload>('/media/uploads', token, {
        method: 'POST',
        body: {
          assetId: replace?.id ?? null, title: read('title'), mimeType, size: file.size, source: read('source'),
          license: read('license'), alt: kind === 'image' ? read('alt') : null, transcript: kind === 'audio' ? read('transcript') : null,
        },
      });
      if (!active.current) return;
      reservation.current = upload;
      await send(upload, file, mimeType);
    } catch (failure) {
      if (!active.current) return;
      setError(getError(failure));
      setPhase('form');
    }
  }

  function restart() {
    reservation.current = null;
    if (fileInput.current) fileInput.current.value = '';
    setFile(null);
    setPhase('form');
    setError('');
    setProgress(0);
  }

  const busy = phase === 'reserving' || phase === 'sending' || phase === 'checking';
  return (
    <Inspector title={replace ? `Nouvelle version · ${replace.title}` : 'Déposer un média'} onClose={onClose}>
      <form className="teacher-form stack" onSubmit={submit}>
        {replace && <p className="inline-message">Les parcours publiés conservent leur fichier actuel. Les brouillons peuvent utiliser la nouvelle version.</p>}
        <fieldset className="media-upload-fields stack" disabled={phase !== 'form'}>
          <label>Fichier
            <input ref={fileInput} name="file" type="file" required accept="image/jpeg,image/png,image/webp,audio/mpeg,audio/wav,.mp3,.wav"
              aria-describedby="media-upload-formats"
              onChange={(event) => { setFile(event.currentTarget.files?.[0] ?? null); setError(''); }} />
            <small id="media-upload-formats" className="muted">JPEG, PNG ou WebP jusqu’à 5 Mo. MP3 ou WAV jusqu’à 15 Mo.</small>
          </label>
          <label>Titre<input name="title" required={!replace} maxLength={120} defaultValue={replace?.title ?? ''} /></label>
          {kind === 'image'
            ? <label>Texte alternatif<textarea name="alt" required rows={2} maxLength={300} defaultValue={replace?.alt ?? ''}
                aria-describedby="upload-alt-help" /><small id="upload-alt-help" className="muted">Décrit l’image pour les lecteurs d’écran.</small></label>
            : <label>Transcription<textarea name="transcript" required rows={4} maxLength={4000} defaultValue={replace?.transcript ?? ''} lang="de" /></label>}
          <div className="pilot-form-grid">
            <label>Source<input name="source" required maxLength={200} defaultValue={replace?.source ?? ''} placeholder="Auteur, banque d’images…" /></label>
            <label>Licence<input name="license" required maxLength={120} defaultValue={replace?.license ?? ''} placeholder="CC BY 4.0, interne…" /></label>
          </div>
        </fieldset>
        {phase === 'reserving' && <p className="inline-message" role="status">Préparation du dépôt…</p>}
        {(phase === 'sending' || phase === 'checking') && (
          <div className="stack" aria-live="polite">
            <label className="media-progress">
              {phase === 'checking' ? 'Contrôle du fichier…' : `Envoi : ${progress} %`}
              <progress max={100} value={progress} />
            </label>
          </div>
        )}
        {error && <p className="inline-message warning" role="alert">{error}</p>}
        <div className="teacher-form-actions">
          {phase === 'sending' && <button type="button" className="btn btn-outline" onClick={() => controller.current?.abort()}>Annuler l’envoi</button>}
          {phase === 'failed' && retryable && reservation.current && file && (
            <button type="button" className="btn btn-primary" onClick={() => void send(reservation.current!, file, mimeType)}>Relancer l’envoi</button>
          )}
          {phase === 'failed' && <button type="button" className="btn btn-outline" onClick={restart}>Choisir un autre fichier</button>}
          {phase === 'form' && <button type="button" className="btn btn-outline" onClick={onClose}>Fermer</button>}
          {phase === 'form' && <button type="submit" className="btn btn-primary" disabled={!file}><UploadIcon size={17} aria-hidden="true" /> Déposer</button>}
          {busy && <span className="muted">Gardez ce panneau ouvert pendant le dépôt.</span>}
        </div>
      </form>
    </Inspector>
  );
}

function MetadataInspector({ asset, token, onClose, onDone }: { asset: Asset; token: string; onClose: () => void; onDone: (asset: Asset) => void }) {
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const read = (key: string) => String(form.get(key) ?? '').trim();
    setBusy(true);
    setError('');
    try {
      onDone(await requestApi<Asset>(`/media/${encodeURIComponent(asset.id)}`, token, {
        method: 'PUT',
        body: { title: read('title'), source: read('source'), license: read('license'), alt: read('alt') || null, transcript: read('transcript') || null },
      }));
    } catch (failure) {
      setError(getError(failure));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Inspector title={`Informations · ${asset.title}`} onClose={onClose}>
      <form className="teacher-form stack" onSubmit={submit}>
        <p className="muted">Les parcours déjà publiés conservent leurs textes. Ces informations seront utilisées dans les brouillons et les prochaines versions.</p>
        <label>Titre<input name="title" required maxLength={120} defaultValue={asset.title} /></label>
        {asset.kind === 'image'
          ? <label>Texte alternatif<textarea name="alt" rows={2} maxLength={300} defaultValue={asset.alt ?? ''} /></label>
          : <label>Transcription<textarea name="transcript" rows={4} maxLength={4000} defaultValue={asset.transcript ?? ''} lang="de" /></label>}
        <div className="pilot-form-grid">
          <label>Source<input name="source" maxLength={200} defaultValue={asset.source ?? ''} /></label>
          <label>Licence<input name="license" maxLength={120} defaultValue={asset.license ?? ''} /></label>
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

type LibraryAction =
  | { type: 'upload'; replace?: Asset }
  | { type: 'metadata'; asset: Asset }
  | { type: 'preview'; asset: Asset; version: number };

/** Médiathèque des images et des sons : liste, filtres, aperçu, dépôt, nouvelle version et informations. */
export function MediaLibraryPanel({ token }: { token: string }) {
  const [assets, setAssets] = useState<Asset[] | null>(null);
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [refresh, setRefresh] = useState(0);
  const [kind, setKind] = useState<'all' | 'image' | 'audio'>('all');
  const [query, setQuery] = useState('');
  const [action, setAction] = useState<LibraryAction | null>(null);

  useEffect(() => {
    let active = true;
    setError('');
    Promise.all([requestApi<Asset[]>('/media', token), requestApi<Upload[]>('/media/uploads', token)]).then(
      ([media, recent]) => { if (active) { setAssets(media); setUploads(recent); } },
      (failure: unknown) => { if (active) setError(getError(failure)); },
    );
    return () => { active = false; };
  }, [token, refresh]);

  const normalize = (value: string) => value.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim();
  const search = normalize(query);
  const visible = (assets ?? []).filter((asset) => (kind === 'all' || asset.kind === kind)
    && (!search || normalize(`${asset.title} ${asset.id} ${asset.source ?? ''} ${asset.credit ?? ''}`).includes(search)));

  return (
    <section className="panel stack catalogue-workspace" aria-label="Médias disponibles">
      <div className="staff-panel-actions">
        <span className="accounts-actions">
          <button type="button" className="btn btn-outline" onClick={() => setRefresh((value) => value + 1)}><RefreshCw size={17} aria-hidden="true" /> Actualiser</button>
          <button type="button" className="btn btn-primary" onClick={() => setAction({ type: 'upload' })}><UploadIcon size={17} aria-hidden="true" /> Déposer un média</button>
        </span>
      </div>
      <div className="media-filters">
        <label>Type<select value={kind} onChange={(event) => setKind(event.target.value as typeof kind)}>
          <option value="all">Tous</option><option value="image">Images</option><option value="audio">Sons</option>
        </select></label>
        <label>Rechercher<input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Titre, identifiant, source" /></label>
      </div>
      {notice && <p className="inline-message" role="status">{notice}</p>}
      {error ? <p className="inline-message warning" role="alert">{error}</p>
        : assets === null ? <p role="status">Chargement de la médiathèque…</p>
        : visible.length === 0 ? <EmptyState
            title={assets.length ? 'Aucun média trouvé' : 'Aucun média'}
            description={assets.length ? 'Modifiez la recherche ou le type de fichier.' : 'Déposez une image ou un son pour l’utiliser dans un parcours.'} />
        : (
          <ul className="media-list">
            {visible.map((asset) => {
              const latest = asset.versions[0];
              return (
                <li key={asset.id}>
                  <div className="media-card-heading">
                    <span className="media-kind" aria-hidden="true">{asset.kind === 'image' ? <ImageIcon size={20} /> : <FileAudio size={20} />}</span>
                    {latest && <Badge tone={latest.status === 'published' ? 'green' : latest.status === 'draft' ? 'amber' : 'neutral'}>v{latest.version} · {versionStatus[latest.status]}</Badge>}
                  </div>
                  <div className="media-main">
                    <h3>{asset.title}</h3>
                    <span className="muted">{asset.kind === 'image' ? 'Image' : 'Son'}{latest?.sizeBytes ? ` · ${formatSize(latest.sizeBytes)}` : ''}</span>
                    {asset.credit ? <span className="muted">{asset.credit}</span> : <span className="media-missing-credit">Source et licence à renseigner</span>}
                  </div>
                  <button type="button" className="btn btn-outline btn-small"
                    onClick={() => setAction({ type: 'preview', asset, version: latestVersion(asset) })}
                    aria-label={`Aperçu de ${asset.title}`}>Consulter le média</button>
                </li>
              );
            })}
          </ul>
        )}
      {uploads.length > 0 && (
        <section className="stack media-recent" aria-labelledby="media-uploads-title">
          <h3 id="media-uploads-title">Mes dépôts récents</h3>
          <ul className="pilot-list">
            {uploads.map((upload) => (
              <li key={upload.id}>
                <p><strong>{upload.title}</strong>{upload.version ? ` · v${upload.version}` : ''}{upload.reason ? ` · ${upload.reason}` : ''}</p>
                <Badge tone={uploadStatus[upload.status].tone}>{uploadStatus[upload.status].label}</Badge>
              </li>
            ))}
          </ul>
        </section>
      )}
      {action?.type === 'upload' && <UploadInspector token={token} replace={action.replace} onClose={() => { setAction(null); setRefresh((value) => value + 1); }}
        onDone={(upload) => {
          setAction(null);
          setNotice(`« ${upload.title} » est disponible en version ${upload.version}.`);
          setRefresh((value) => value + 1);
        }} />}
      {action?.type === 'metadata' && <MetadataInspector asset={action.asset} token={token} onClose={() => setAction(null)} onDone={(asset) => {
        setAction((current) => current === action ? null : current);
        setAssets((current) => current?.map((item) => item.id === asset.id ? asset : item) ?? null);
        setNotice(`Informations de « ${asset.title} » enregistrées.`);
      }} />}
      {action?.type === 'preview' && (
        <Inspector title={action.asset.title} onClose={() => setAction(null)}>
          <div className="stack">
            <div className="media-inspector-meta">
              <Badge tone="blue">{action.asset.kind === 'image' ? 'Image' : 'Son'}</Badge>
              <span className="muted">{action.asset.id}</span>
            </div>
            <label className="media-version-select">Version du fichier<select value={action.version} disabled={action.asset.versions.length <= 1}
              onChange={(event) => setAction({ ...action, version: Number(event.target.value) })}>
              {action.asset.versions.length === 0 && <option value={action.version}>v{action.version}</option>}
              {action.asset.versions.map((item) => <option key={item.version} value={item.version}>v{item.version} · {versionStatus[item.status]}</option>)}
            </select></label>
            <MediaPreview assetId={action.asset.id} version={action.version} token={token} />
            {(action.asset.source || action.asset.license) && (
              <dl className="media-credits">
                {action.asset.source && <div><dt>Source</dt><dd>{action.asset.source}</dd></div>}
                {action.asset.license && <div><dt>Licence</dt><dd>{action.asset.license}</dd></div>}
              </dl>
            )}
            <div className="accounts-actions">
              <button type="button" className="btn btn-outline" onClick={() => setAction({ type: 'metadata', asset: action.asset })}
                aria-label={`Modifier les informations de ${action.asset.title}`}><Pencil size={16} aria-hidden="true" /> Modifier les informations</button>
              <button type="button" className="btn btn-primary" onClick={() => setAction({ type: 'upload', replace: action.asset })}
                aria-label={`Nouvelle version de ${action.asset.title}`}>Nouvelle version</button>
            </div>
          </div>
        </Inspector>
      )}
    </section>
  );
}
