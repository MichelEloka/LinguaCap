import { useEffect, useId, useRef, useState, type DragEvent, type FormEvent } from 'react';
import {
  AudioLines, CheckCircle2, CloudUpload, FileClock, History, Image as ImageIcon, Inbox, Pencil, RefreshCw, Upload as UploadIcon,
} from 'lucide-react';
import { Badge, EmptyState, ProgressBar } from '../../components/ui';
import {
  AudioPlayer, Callout, Drawer, Facts, ListItem, ProgressRing, Skeleton, TabPanel, Tabs, Timeline, Toolbar, SearchField, useToast,
} from '../../design/kit';
import { requestApi, uploadToStorage } from '../../integration/api';
import { LessonContent } from './LessonContent';
import { AssetTile, KindChips, assetVersionTone, filterAssets, formatClock, formatSize, useAudioDuration } from './editor-media';
import './editor.css';

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
const FORMAT_NAMES: Record<string, string> = { 'image/jpeg': 'JPEG', 'image/png': 'PNG', 'image/webp': 'WebP', 'audio/mpeg': 'MP3', 'audio/wav': 'WAV' };
const uploadStatus: Record<Upload['status'], { label: string; tone: 'green' | 'amber' | 'neutral' | 'blue' }> = {
  pending: { label: 'En attente', tone: 'blue' },
  available: { label: 'Disponible', tone: 'green' },
  rejected: { label: 'Refusé', tone: 'amber' },
  abandoned: { label: 'Abandonné', tone: 'neutral' },
};
export const versionStatus: Record<AssetVersion['status'], string> = { draft: 'brouillon', published: 'publiée', archived: 'archivée' };
const dateFormat = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
const dateTime = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

function getError(error: unknown) {
  return error instanceof Error ? error.message : 'Cette action est temporairement indisponible.';
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
      <div className="ed-preview-error">
        <Callout tone="warning">{error}</Callout>
        <button type="button" className="btn btn-secondary btn-sm" onClick={retry}><RefreshCw size={15} aria-hidden="true" /> Réessayer</button>
      </div>
    );
  }
  if (!file) {
    return <div className="ed-preview-stage is-loading" role="status" aria-label="Chargement de l’aperçu…"><Skeleton height="100%" radius={12} /></div>;
  }
  return file.mimeType.startsWith('image/')
    ? <figure className="ed-preview-stage"><img className="ed-preview-image" src={file.url} alt={file.alt ?? ''} onError={renewAfterLoadError} /></figure>
    : (
      <div className="ed-preview-audio">
        <AudioPlayer src={file.url} title="Aperçu audio" onError={renewAfterLoadError} />
        {file.transcript && (
          <details className="ed-transcript">
            <summary>Transcription</summary>
            <LessonContent text={file.transcript} compact />
          </details>
        )}
      </div>
    );
}

const fileTitle = (name: string) => {
  const base = name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').trim();
  return base ? base.charAt(0).toUpperCase() + base.slice(1) : '';
};

/** Fichier choisi : vignette locale (image) ou durée (son), nom, format et poids. */
function ChosenFile({ file, kind, mimeType }: { file: File; kind: Asset['kind']; mimeType: string }) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);
  const duration = useAudioDuration(kind === 'audio' && mimeType ? url : null);
  return (
    <span className="ed-drop-file">
      <span className={`ed-drop-thumb is-${kind}`}>
        {kind === 'image' && url && mimeType ? <img src={url} alt="" /> : kind === 'audio' ? <AudioLines size={26} aria-hidden="true" /> : <ImageIcon size={26} aria-hidden="true" />}
      </span>
      <span className="ed-drop-file-text">
        <strong>{file.name}</strong>
        <small>{[FORMAT_NAMES[mimeType] ?? 'Format non pris en charge', formatSize(file.size), duration !== null ? formatClock(duration) : ''].filter(Boolean).join(' · ')}</small>
        <small className="ed-drop-hint">Cliquez ou glissez un autre fichier pour le remplacer.</small>
      </span>
    </span>
  );
}

const phases = [
  { id: 'reserving', label: 'Réservation' },
  { id: 'sending', label: 'Envoi' },
  { id: 'checking', label: 'Contrôle' },
] as const;

/**
 * Dépôt d'un fichier : réservation auprès de Médias, envoi direct vers le stockage avec progression, puis contrôle
 * du fichier reçu. Un envoi interrompu peut être relancé tant que le dépôt n'a pas expiré.
 */
function UploadDrawer({ token, replace, onClose, onDone }: {
  token: string;
  replace?: Asset;
  onClose: () => void;
  onDone: (upload: Upload) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState(replace?.title ?? '');
  const [phase, setPhase] = useState<'form' | 'reserving' | 'sending' | 'checking' | 'failed'>('form');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [retryable, setRetryable] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const reservation = useRef<Upload | null>(null);
  const controller = useRef<AbortController | null>(null);
  const active = useRef(false);
  const formId = useId();
  const mimeType = file ? MIME_ALIASES[file.type] ?? '' : '';
  const kind = mimeType.startsWith('image/') ? 'image' : mimeType.startsWith('audio/') ? 'audio' : replace?.kind ?? 'image';

  useEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
      controller.current?.abort();
    };
  }, []);

  function choose(selected: File | null) {
    setFile(selected);
    setError(selected && !MIME_ALIASES[selected.type] ? 'Formats acceptés : images JPEG, PNG ou WebP, sons MP3 ou WAV.' : '');
    if (selected && !title.trim()) setTitle(fileTitle(selected.name));
  }

  function drop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setDragging(false);
    if (phase !== 'form') return;
    const files = event.dataTransfer.files;
    if (!files.length) return;
    if (fileInput.current) fileInput.current.files = files;
    choose(files[0]);
  }

  async function send(upload: Upload, selected: File, type: string) {
    setPhase('sending');
    setProgress(0);
    setError('');
    controller.current = new AbortController();
    try {
      if (upload.uploadUrl) await uploadToStorage(upload.uploadUrl, selected, type, token, setProgress, controller.current.signal);
      if (!active.current) return;
      setProgress(100);
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
  useEffect(() => { if (busy) progressRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }, [busy]);
  const step = phase === 'reserving' ? 0 : phase === 'sending' ? 1 : phase === 'checking' ? 2 : -1;
  const footer = (
    <div className="ed-drawer-actions">
      {busy && <span className="ed-foot-note">Gardez ce panneau ouvert pendant le dépôt.</span>}
      {phase === 'sending' && <button type="button" className="btn btn-secondary" onClick={() => controller.current?.abort()}>Annuler l’envoi</button>}
      {phase === 'failed' && <button type="button" className="btn btn-secondary" onClick={restart}>Choisir un autre fichier</button>}
      {phase === 'failed' && retryable && reservation.current && file && (
        <button type="button" className="btn btn-primary" onClick={() => void send(reservation.current!, file, mimeType)}><RefreshCw size={16} aria-hidden="true" /> Relancer l’envoi</button>
      )}
      {phase === 'form' && <button type="button" className="btn btn-ghost" onClick={onClose}>Annuler</button>}
      {phase === 'form' && <button type="submit" form={formId} className="btn btn-primary" disabled={!file}><UploadIcon size={17} aria-hidden="true" /> Déposer</button>}
    </div>
  );

  return (
    <Drawer title={replace ? `Nouvelle version · ${replace.title}` : 'Déposer un média'} onClose={onClose} footer={footer}
      description={replace ? 'Les parcours publiés conservent leur fichier actuel ; les brouillons peuvent utiliser la nouvelle version.' : 'Une image ou un son, avec ses crédits, pour l’utiliser dans les parcours.'}>
      <form id={formId} className="ed-upload-form" onSubmit={submit}>
        <fieldset className="ed-fields" disabled={phase !== 'form'}>
          <label className={`ed-drop${dragging ? ' is-dragging' : ''}${file ? ' has-file' : ''}`}
            onDragOver={(event) => { event.preventDefault(); if (phase === 'form') setDragging(true); }}
            onDragLeave={() => setDragging(false)} onDrop={drop}>
            <span className="ed-drop-label">Fichier</span>
            <input ref={fileInput} className="sr-only" name="file" type="file" required accept="image/jpeg,image/png,image/webp,audio/mpeg,audio/wav,.mp3,.wav"
              aria-describedby="media-upload-formats" onChange={(event) => choose(event.currentTarget.files?.[0] ?? null)} />
            {file ? <ChosenFile file={file} kind={kind} mimeType={mimeType} /> : (
              <span className="ed-drop-zone">
                <span className="ed-drop-icon"><CloudUpload size={28} aria-hidden="true" /></span>
                <strong>Glissez une image ou un son ici</strong>
                <small>ou cliquez pour parcourir vos dossiers</small>
              </span>
            )}
          </label>
          <small id="media-upload-formats" className="ed-help">JPEG, PNG ou WebP jusqu’à 5 Mo. MP3 ou WAV jusqu’à 15 Mo.</small>
          <label>Titre<input name="title" required={!replace} maxLength={120} value={title} onChange={(event) => setTitle(event.target.value)} /></label>
          {kind === 'image'
            ? <label>Texte alternatif<textarea name="alt" required rows={2} maxLength={300} defaultValue={replace?.alt ?? ''}
                aria-describedby="upload-alt-help" /><small id="upload-alt-help" className="ed-help">Décrit l’image pour les lecteurs d’écran.</small></label>
            : <label>Transcription<textarea name="transcript" required rows={4} maxLength={12000} defaultValue={replace?.transcript ?? ''} lang="de" /></label>}
          <div className="ed-grid-2">
            <label>Source<input name="source" required maxLength={200} defaultValue={replace?.source ?? ''} placeholder="Auteur, banque d’images…" /></label>
            <label>Licence<input name="license" required maxLength={120} defaultValue={replace?.license ?? ''} placeholder="CC BY 4.0, interne…" /></label>
          </div>
        </fieldset>
        {step >= 0 && (
          <div className="ed-upload-progress" aria-live="polite" ref={progressRef}>
            <ProgressRing value={phase === 'reserving' ? 4 : progress} size={68} stroke={7}
              label={phase === 'checking' ? 'Contrôle du fichier' : `Envoi : ${progress} %`}>
              {phase === 'checking' ? <CheckCircle2 size={24} aria-hidden="true" className="ed-pulse" /> : <strong>{progress}%</strong>}
            </ProgressRing>
            <div className="ed-upload-progress-main">
              <strong>{phase === 'reserving' ? 'Préparation du dépôt…' : phase === 'checking' ? 'Contrôle du fichier…' : `Envoi : ${progress} %`}</strong>
              <ol className="ed-upload-steps">
                {phases.map((item, index) => (
                  <li key={item.id} className={index < step ? 'is-done' : index === step ? 'is-current' : ''}>{item.label}</li>
                ))}
              </ol>
              <ProgressBar value={phase === 'reserving' ? 4 : progress} label="Progression de l’envoi" />
            </div>
          </div>
        )}
        {error && <Callout tone="warning" title={phase === 'failed' ? 'Le dépôt n’a pas abouti' : undefined}><p role="alert">{error}</p></Callout>}
      </form>
    </Drawer>
  );
}

/** Fiche d'un média : aperçu, crédits, versions ; modification des informations dans le même panneau. */
function AssetDrawer({ asset, token, onClose, onUpdated, onReplace }: {
  asset: Asset; token: string; onClose: () => void; onUpdated: (asset: Asset) => void; onReplace: () => void;
}) {
  const [version, setVersion] = useState(latestVersion(asset));
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const formId = useId();
  const shown = asset.versions.find((item) => item.version === version);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const read = (key: string) => String(form.get(key) ?? '').trim();
    setBusy(true);
    setError('');
    try {
      const updated = await requestApi<Asset>(`/media/${encodeURIComponent(asset.id)}`, token, {
        method: 'PUT',
        body: { title: read('title'), source: read('source'), license: read('license'), alt: read('alt') || null, transcript: read('transcript') || null },
      });
      onUpdated(updated);
      setEditing(false);
    } catch (failure) {
      setError(getError(failure));
    } finally {
      setBusy(false);
    }
  }

  if (editing) {
    return (
      <Drawer title={`Informations · ${asset.title}`} onClose={onClose}
        description="Les parcours déjà publiés conservent leurs textes. Ces informations serviront aux brouillons et aux prochaines versions."
        footer={<div className="ed-drawer-actions">
          <button type="button" className="btn btn-ghost" onClick={() => setEditing(false)}>Annuler</button>
          <button type="submit" form={formId} className="btn btn-primary" disabled={busy}>{busy ? 'Enregistrement…' : 'Enregistrer'}</button>
        </div>}>
        <form id={formId} className="ed-fields" onSubmit={submit}>
          <label>Titre<input name="title" required maxLength={120} defaultValue={asset.title} /></label>
          {asset.kind === 'image'
            ? <label>Texte alternatif<textarea name="alt" rows={3} maxLength={300} defaultValue={asset.alt ?? ''} /></label>
            : <label>Transcription<textarea name="transcript" rows={6} maxLength={12000} defaultValue={asset.transcript ?? ''} lang="de" /></label>}
          <div className="ed-grid-2">
            <label>Source<input name="source" maxLength={200} defaultValue={asset.source ?? ''} /></label>
            <label>Licence<input name="license" maxLength={120} defaultValue={asset.license ?? ''} /></label>
          </div>
          {error && <Callout tone="warning"><p role="alert">{error}</p></Callout>}
        </form>
      </Drawer>
    );
  }

  return (
    <Drawer wide={asset.kind === 'image'} title={asset.title} onClose={onClose}
      description={<span className="ed-sheet-sub">{asset.kind === 'image' ? <ImageIcon size={14} aria-hidden="true" /> : <AudioLines size={14} aria-hidden="true" />}
        {asset.kind === 'image' ? 'Image' : 'Son'} · <code>{asset.id}</code></span>}
      footer={<div className="ed-drawer-actions">
        <button type="button" className="btn btn-secondary" onClick={() => setEditing(true)}
          aria-label={`Modifier les informations de ${asset.title}`}><Pencil size={16} aria-hidden="true" /> Modifier les informations</button>
        <button type="button" className="btn btn-primary" onClick={onReplace}
          aria-label={`Nouvelle version de ${asset.title}`}><UploadIcon size={16} aria-hidden="true" /> Nouvelle version</button>
      </div>}>
      <MediaPreview assetId={asset.id} version={version} token={token} />
      <Facts items={[
        { label: 'Version affichée', value: <span className="ed-fact-badge">v{version}{shown && <Badge tone={assetVersionTone[shown.status]}>{versionStatus[shown.status]}</Badge>}</span> },
        { label: 'Format', value: FORMAT_NAMES[shown?.mimeType ?? asset.mimeType] ?? (shown?.mimeType ?? asset.mimeType) },
        { label: 'Poids', value: formatSize(shown?.sizeBytes ?? null) || '—' },
        { label: 'Mis à jour', value: asset.updatedAt ? dateFormat.format(new Date(asset.updatedAt)) : '—' },
      ]} />
      <section className="ed-sheet-section" aria-labelledby={`${formId}-credits`}>
        <h3 id={`${formId}-credits`}>Crédits</h3>
        {asset.source || asset.license
          ? <Facts items={[{ label: 'Source', value: asset.source ?? '—' }, { label: 'Licence', value: asset.license ?? '—' }]} />
          : <Callout tone="warning" title="Source et licence à renseigner">Complétez-les avant d’utiliser ce média dans un parcours publié.</Callout>}
        {asset.credit && asset.credit !== [asset.source, asset.license].filter(Boolean).join(' · ') && <p className="ed-credit-line">{asset.credit}</p>}
      </section>
      {asset.kind === 'image' && (
        <section className="ed-sheet-section" aria-labelledby={`${formId}-alt`}>
          <h3 id={`${formId}-alt`}>Texte alternatif</h3>
          {asset.alt ? <blockquote className="ed-quote">{asset.alt}</blockquote> : <Callout tone="warning">Aucun texte alternatif : ajoutez-en un pour les lecteurs d’écran.</Callout>}
        </section>
      )}
      <section className="ed-sheet-section" aria-labelledby={`${formId}-versions`}>
        <h3 id={`${formId}-versions`}><History size={17} aria-hidden="true" /> Versions</h3>
        {asset.versions.length === 0 ? <p className="ed-muted">Aucune version enregistrée.</p> : (
          <Timeline items={asset.versions.map((item) => ({
            id: String(item.version),
            tone: item.status === 'published' ? 'success' : item.status === 'draft' ? 'warning' : undefined,
            icon: item.status === 'published' ? <CheckCircle2 size={15} /> : item.status === 'draft' ? <FileClock size={15} /> : <History size={15} />,
            title: (
              <span className="ed-version-line">
                {item.version === version
                  ? <span className="ed-version-name">Version {item.version}</span>
                  : <button type="button" className="ed-version-link" onClick={() => setVersion(item.version)}>Version {item.version}</button>}
                <Badge tone={assetVersionTone[item.status]}>{versionStatus[item.status]}</Badge>
                {item.version === version && <span className="ed-shown">Affichée</span>}
              </span>
            ),
            meta: [item.createdAt ? `Déposée le ${dateFormat.format(new Date(item.createdAt))}` : '', FORMAT_NAMES[item.mimeType] ?? '', formatSize(item.sizeBytes)].filter(Boolean).join(' · '),
          }))} />
        )}
      </section>
    </Drawer>
  );
}

type LibraryAction =
  | { type: 'upload'; replace?: Asset }
  | { type: 'asset'; asset: Asset };

/** Médiathèque des images et des sons : vignettes, filtres, fiche, dépôt, nouvelle version et informations. */
export function MediaLibraryPanel({ token }: { token: string }) {
  const toast = useToast();
  const [assets, setAssets] = useState<Asset[] | null>(null);
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [error, setError] = useState('');
  const [refresh, setRefresh] = useState(0);
  const [kind, setKind] = useState<'all' | Asset['kind']>('all');
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState('library');
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

  const reload = () => setRefresh((value) => value + 1);
  const visible = filterAssets(assets ?? [], kind, query);
  const missingCredits = (assets ?? []).filter((asset) => !asset.source && !asset.credit).length;

  return (
    <div className="ed-library lc-enter">
      <div className="ed-library-head">
        <Tabs label="Sections de la médiathèque" idPrefix="media" value={tab} onChange={setTab} tabs={[
          { id: 'library', label: 'Bibliothèque', icon: <ImageIcon size={16} aria-hidden="true" />, count: assets?.length },
          { id: 'uploads', label: 'Mes dépôts', icon: <Inbox size={16} aria-hidden="true" />, count: uploads.length },
        ]} />
        <div className="ed-library-actions">
          <button type="button" className="icon-button ed-icon-outline" onClick={reload} aria-label="Actualiser" title="Actualiser"><RefreshCw size={18} aria-hidden="true" /></button>
          <button type="button" className="btn btn-primary" onClick={() => setAction({ type: 'upload' })}><UploadIcon size={17} aria-hidden="true" /> Déposer un média</button>
        </div>
      </div>

      {tab === 'library' ? (
        <TabPanel id="library" idPrefix="media">
          <div className="ed-library-body">
            <Toolbar label="Filtrer les médias">
              <SearchField label="Rechercher un média" placeholder="Titre, identifiant, source" value={query} onChange={setQuery} />
              {assets && <KindChips assets={assets} value={kind} onChange={setKind} />}
            </Toolbar>
            {missingCredits > 0 && <Callout tone="warning">{missingCredits > 1 ? `${missingCredits} médias sans source ni licence : complétez leurs crédits depuis leur fiche.` : 'Un média sans source ni licence : complétez ses crédits depuis sa fiche.'}</Callout>}
            {error ? (
              <div className="ed-load-error"><Callout tone="warning" title="La médiathèque est indisponible"><p role="alert">{error}</p></Callout>
                <button type="button" className="btn btn-secondary" onClick={reload}><RefreshCw size={16} aria-hidden="true" /> Réessayer</button></div>
            ) : assets === null ? (
              <div className="ed-media-grid" role="status" aria-label="Chargement de la médiathèque…">
                {Array.from({ length: 10 }, (_, index) => (
                  <div key={index} className="ed-tile is-skeleton" aria-hidden="true">
                    <Skeleton height="auto" radius={0} /><span className="ed-tile-body"><Skeleton width="80%" /><Skeleton width="50%" height={11} /></span>
                  </div>
                ))}
              </div>
            ) : visible.length === 0 ? (
              <div className="ed-empty-card">
                <EmptyState icon={<ImageIcon size={26} />} title={assets.length ? 'Aucun média trouvé' : 'Aucun média pour l’instant'}
                  description={assets.length ? 'Modifiez la recherche ou le type de fichier.' : 'Déposez une image ou un son pour l’utiliser dans un parcours.'}
                  action={assets.length
                    ? <button type="button" className="btn btn-secondary" onClick={() => { setQuery(''); setKind('all'); }}>Effacer les filtres</button>
                    : <button type="button" className="btn btn-primary" onClick={() => setAction({ type: 'upload' })}><UploadIcon size={16} aria-hidden="true" /> Déposer un premier fichier</button>} />
              </div>
            ) : (
              <ul className="ed-media-grid lc-stagger">
                {visible.map((asset) => (
                  <li key={asset.id}>
                    <AssetTile asset={asset} token={token} label={`Ouvrir la fiche de ${asset.title}`} onOpen={() => setAction({ type: 'asset', asset })} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </TabPanel>
      ) : (
        <TabPanel id="uploads" idPrefix="media">
          <section className="kit-card is-flush ed-uploads" aria-label="Mes dépôts récents">
            {uploads.length === 0
              ? <EmptyState icon={<Inbox size={26} />} title="Aucun dépôt récent" description="Vos derniers dépôts apparaîtront ici avec leur état." />
              : (
                <ul className="kit-list lc-stagger">
                  {uploads.map((upload) => (
                    <ListItem as="li" key={upload.id}
                      leading={<span className={`ed-upload-icon is-${upload.status}`}>{upload.kind === 'audio' ? <AudioLines size={18} aria-hidden="true" /> : <ImageIcon size={18} aria-hidden="true" />}</span>}
                      title={upload.title}
                      subtitle={[upload.version ? `Version ${upload.version}` : upload.replaces ? 'Nouvelle version' : 'Nouveau média',
                        `déposé le ${dateTime.format(new Date(upload.createdAt))}`, formatSize(upload.size), upload.reason ?? ''].filter(Boolean).join(' · ')}
                      trailing={<Badge tone={uploadStatus[upload.status].tone}>{uploadStatus[upload.status].label}</Badge>} />
                  ))}
                </ul>
              )}
          </section>
        </TabPanel>
      )}

      {action?.type === 'upload' && <UploadDrawer token={token} replace={action.replace} onClose={() => { setAction(null); reload(); }}
        onDone={(upload) => {
          setAction(null);
          if (upload.status === 'available' || upload.version) toast(`« ${upload.title} » est disponible en version ${upload.version}.`);
          else toast(`« ${upload.title} » n’a pas été accepté${upload.reason ? ` : ${upload.reason}` : '.'}`, 'warning');
          reload();
        }} />}
      {action?.type === 'asset' && <AssetDrawer key={action.asset.id} asset={action.asset} token={token} onClose={() => setAction(null)}
        onReplace={() => setAction({ type: 'upload', replace: action.asset })}
        onUpdated={(asset) => {
          setAssets((current) => current?.map((item) => item.id === asset.id ? asset : item) ?? null);
          setAction({ type: 'asset', asset });
          toast(`Informations de « ${asset.title} » enregistrées.`);
        }} />}
    </div>
  );
}
