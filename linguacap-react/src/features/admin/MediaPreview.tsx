import { Headphones } from 'lucide-react';
import type { MediaAsset } from '../../domain/types';

export default function MediaPreview({ asset }: { asset: MediaAsset }) {
  return asset.kind === 'image' ? (
    <div className="admin-media-image">
      <img alt={asset.alt ?? asset.title} src={asset.src} loading="lazy" />
    </div>
  ) : (
    <div className="admin-media-audio">
      <span className="admin-card-icon"><Headphones size={23} /></span>
      <audio controls preload="none" src={asset.src} aria-label={asset.title} />
    </div>
  );
}
