/**
 * Vignettes des médias (catalogue et médiathèque) : adresse de lecture chargée à l'approche de l'écran, image recadrée
 * ou onde stylisée avec la durée pour les sons, tuile cliquable et sélecteur de médias en panneau latéral.
 */
import { useEffect, useMemo, useRef, useState, type Ref } from 'react';
import { AudioLines, Image as ImageIcon, ImageOff, Search } from 'lucide-react';
import { Chip, Drawer, SearchField, Toolbar } from '../../design/kit';
import { EmptyState } from '../../components/ui';
import { requestApi } from '../../integration/api';
import type { Asset, AssetVersion, MediaFile } from './MediaLibrary';

const fileCache = new Map<string, { at: number; promise: Promise<MediaFile> }>();
const CACHE_MS = 4 * 60 * 1000;

/** Adresse de lecture d'une version, partagée entre les vignettes (les adresses sont temporaires). */
export function loadMediaFile(assetId: string, version: number, token: string, fresh = false) {
  const key = `${assetId}/${version}`;
  const cached = fileCache.get(key);
  if (!fresh && cached && Date.now() - cached.at < CACHE_MS) return cached.promise;
  const promise = requestApi<MediaFile>(`/media/${encodeURIComponent(assetId)}/versions/${version}`, token);
  fileCache.set(key, { at: Date.now(), promise });
  promise.catch(() => fileCache.delete(key));
  return promise;
}

function useInView<T extends Element>() {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node || seen) return;
    if (typeof IntersectionObserver === 'undefined') { setSeen(true); return; }
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) { setSeen(true); observer.disconnect(); }
    }, { rootMargin: '240px' });
    observer.observe(node);
    return () => observer.disconnect();
  }, [seen]);
  return [ref, seen] as const;
}

function useMediaFile(assetId: string, version: number, token: string, enabled: boolean) {
  const key = `${assetId}/${version}`;
  const [result, setResult] = useState<{ key: string; file?: MediaFile; failed?: boolean } | null>(null);
  useEffect(() => {
    if (!enabled) return;
    let active = true;
    loadMediaFile(assetId, version, token).then(
      (file) => { if (active) setResult({ key, file }); },
      () => { if (active) setResult({ key, failed: true }); },
    );
    return () => { active = false; };
  }, [assetId, version, token, enabled, key]);
  const current = result?.key === key ? result : null;
  return { file: current?.file ?? null, failed: Boolean(current?.failed) };
}

/** Durée d'un son, lue dans ses métadonnées. */
export function useAudioDuration(url: string | null) {
  const [duration, setDuration] = useState<{ url: string; value: number } | null>(null);
  useEffect(() => {
    if (!url) return;
    const audio = new Audio();
    audio.preload = 'metadata';
    const done = () => { if (Number.isFinite(audio.duration)) setDuration({ url, value: audio.duration }); };
    audio.addEventListener('loadedmetadata', done);
    audio.src = url;
    return () => { audio.removeEventListener('loadedmetadata', done); audio.removeAttribute('src'); };
  }, [url]);
  return duration?.url === url ? duration.value : null;
}

export function formatClock(seconds: number) {
  const total = Math.max(0, Math.round(seconds));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
}

export function formatSize(bytes: number | null) {
  if (!bytes) return '';
  return bytes >= 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(1).replace('.', ',')} Mo` : `${Math.max(1, Math.round(bytes / 1024))} Ko`;
}

const WAVE = [38, 62, 46, 80, 54, 92, 66, 44, 74, 58, 86, 48, 70, 40, 64, 52, 82, 46, 60, 36];

/** Onde décorative propre à chaque son (même dessin d'un affichage à l'autre). */
function Wave({ seed }: { seed: string }) {
  const offset = useMemo(() => [...seed].reduce((sum, char) => sum + char.charCodeAt(0), 0) % WAVE.length, [seed]);
  return (
    <span className="ed-wave" aria-hidden="true">
      {WAVE.map((_, index) => <i key={index} style={{ height: `${WAVE[(index + offset) % WAVE.length]}%` }} />)}
    </span>
  );
}

function ThumbVisual({ kind, seed, url, failed, duration, innerRef, size = 'md' }: {
  kind: Asset['kind']; seed: string; url: string | null; failed: boolean; duration: number | null; innerRef?: Ref<HTMLSpanElement>;
  size?: 'sm' | 'md';
}) {
  const [loaded, setLoaded] = useState(false);
  const [broken, setBroken] = useState(false);
  useEffect(() => { setLoaded(false); setBroken(false); }, [url]);
  return (
    <span ref={innerRef} className={`ed-thumb is-${kind} is-${size}`} aria-hidden="true">
      {kind === 'image' ? (
        url && !broken
          ? <img src={url} alt="" loading="lazy" className={loaded ? 'is-loaded' : undefined} onLoad={() => setLoaded(true)} onError={() => setBroken(true)} />
          : failed || broken ? <ImageOff size={size === 'sm' ? 18 : 26} /> : <span className="ed-thumb-shimmer" />
      ) : (
        <>
          <Wave seed={seed} />
          <span className="ed-thumb-sound"><AudioLines size={size === 'sm' ? 16 : 22} /></span>
          {duration !== null && size !== 'sm' && <span className="ed-thumb-time">{formatClock(duration)}</span>}
        </>
      )}
      {kind === 'image' && url && !loaded && !broken && <span className="ed-thumb-shimmer" />}
    </span>
  );
}

/** Vignette autonome (charge l'adresse de la version quand elle approche de l'écran). */
export function MediaThumb({ assetId, kind, version, token, size = 'md' }: {
  assetId: string; kind: Asset['kind']; version: number; token: string; size?: 'sm' | 'md';
}) {
  const [ref, seen] = useInView<HTMLSpanElement>();
  const { file, failed } = useMediaFile(assetId, version, token, seen);
  const duration = useAudioDuration(kind === 'audio' && file ? file.url : null);
  return <ThumbVisual innerRef={ref} kind={kind} seed={assetId} url={file?.url ?? null} failed={failed} duration={duration} size={size} />;
}

export const assetVersionTone: Record<AssetVersion['status'], 'green' | 'amber' | 'neutral'> = { draft: 'amber', published: 'green', archived: 'neutral' };

/** Tuile d'un média : aperçu, type, durée des sons, version et crédits. */
export function AssetTile({ asset, token, onOpen, label, compact = false }: {
  asset: Asset; token: string; onOpen: () => void; label: string; compact?: boolean;
}) {
  const latest = asset.versions[0];
  const [ref, seen] = useInView<HTMLSpanElement>();
  const { file, failed } = useMediaFile(asset.id, latest?.version ?? 1, token, seen);
  const duration = useAudioDuration(asset.kind === 'audio' && file ? file.url : null);
  const Icon = asset.kind === 'image' ? ImageIcon : AudioLines;
  const details = [asset.kind === 'image' ? 'Image' : 'Son', duration !== null ? formatClock(duration) : '', formatSize(latest?.sizeBytes ?? null)].filter(Boolean);
  return (
    <button type="button" className={`ed-tile${compact ? ' is-compact' : ''}`} onClick={onOpen} aria-label={label}>
      <span className="ed-tile-media">
        <ThumbVisual innerRef={ref} kind={asset.kind} seed={asset.id} url={file?.url ?? null} failed={failed} duration={duration} />
        <span className="ed-tile-kind"><Icon size={13} aria-hidden="true" />{asset.kind === 'image' ? 'Image' : 'Son'}</span>
        {latest && <span className={`ed-tile-version is-${latest.status}`}>v{latest.version}{latest.status !== 'published' ? ` · ${latest.status === 'draft' ? 'brouillon' : 'archivée'}` : ''}</span>}
      </span>
      <span className="ed-tile-body">
        <strong>{asset.title}</strong>
        <small>{details.join(' · ')}</small>
        {!compact && (asset.credit || asset.source
          ? <small className="ed-tile-credit">{asset.credit ?? [asset.source, asset.license].filter(Boolean).join(' · ')}</small>
          : <small className="ed-tile-missing">Source et licence à renseigner</small>)}
      </span>
    </button>
  );
}

const normalize = (value: string) => value.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim();

/** Filtre commun à la médiathèque et au sélecteur : type de fichier et recherche sans accents. */
export function filterAssets(assets: Asset[], kind: 'all' | Asset['kind'], query: string) {
  const search = normalize(query);
  return assets.filter((asset) => (kind === 'all' || asset.kind === kind)
    && (!search || normalize(`${asset.title} ${asset.id} ${asset.source ?? ''} ${asset.credit ?? ''}`).includes(search)));
}

export function KindChips({ assets, value, onChange }: { assets: Asset[]; value: 'all' | Asset['kind']; onChange: (value: 'all' | Asset['kind']) => void }) {
  const count = (kind: Asset['kind']) => assets.filter((asset) => asset.kind === kind).length;
  return (
    <div className="ed-chip-row" role="group" aria-label="Type de fichier">
      <Chip selected={value === 'all'} onClick={() => onChange('all')}>Tous <span className="ed-chip-count">{assets.length}</span></Chip>
      <Chip selected={value === 'image'} onClick={() => onChange('image')}><ImageIcon size={14} aria-hidden="true" /> Images <span className="ed-chip-count">{count('image')}</span></Chip>
      <Chip selected={value === 'audio'} onClick={() => onChange('audio')}><AudioLines size={14} aria-hidden="true" /> Sons <span className="ed-chip-count">{count('audio')}</span></Chip>
    </div>
  );
}

/** Choix d'un média de la médiathèque pour une activité ou une partie d'évaluation. */
export function MediaPicker({ assets, token, onPick, onClose }: { assets: Asset[]; token: string; onPick: (asset: Asset) => void; onClose: () => void }) {
  const [kind, setKind] = useState<'all' | Asset['kind']>('all');
  const [query, setQuery] = useState('');
  const visible = filterAssets(assets, kind, query);
  return (
    <Drawer wide title="Ajouter une image ou un son" description="Choisissez un média de la médiathèque : sa dernière version est utilisée." onClose={onClose}>
      <Toolbar label="Filtrer les médias">
        <SearchField label="Rechercher un média" placeholder="Titre, identifiant, source" value={query} onChange={setQuery} />
        <KindChips assets={assets} value={kind} onChange={setKind} />
      </Toolbar>
      {visible.length === 0
        ? <EmptyState icon={<Search size={26} />} title={assets.length ? 'Aucun média trouvé' : 'La médiathèque est vide'}
            description={assets.length ? 'Modifiez la recherche ou le type de fichier.' : 'Déposez d’abord une image ou un son depuis la médiathèque.'} />
        : (
          <ul className="ed-media-grid is-compact lc-stagger">
            {visible.map((asset) => (
              <li key={asset.id}><AssetTile compact asset={asset} token={token} label={`Ajouter ${asset.title}`} onOpen={() => onPick(asset)} /></li>
            ))}
          </ul>
        )}
    </Drawer>
  );
}
