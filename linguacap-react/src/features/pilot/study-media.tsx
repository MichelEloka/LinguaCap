/**
 * Supports du mode étude : illustration encadrée (agrandissable), lecteur audio d'apprentissage et état
 * « ressource indisponible ». Les adresses des supports sont temporaires : onRenew redemande la séance.
 */
import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { ChevronDown, FileText, ImageOff, Maximize2, RefreshCw, VolumeX, X } from 'lucide-react';
import { AudioPlayer } from '../../design/kit';
import { LessonContent } from './LessonContent';
import type { Placement } from './LearnerSession';
import './learner-session.css';

/** Image agrandie au-dessus de la page (Échap, clic à côté ou bouton pour fermer). */
function Lightbox({ src, alt, caption, onClose }: { src: string; alt: string; caption: string | null; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    if (dialog && !dialog.open) dialog.showModal();
    return () => dialog?.close();
  }, []);
  return (
    <dialog ref={ref} className="study-lightbox" aria-label={caption || alt || 'Image agrandie'}
      onCancel={(event) => { event.preventDefault(); onClose(); }}
      onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <figure>
        <img src={src} alt={alt} />
        {caption && <figcaption>{caption}</figcaption>}
      </figure>
      <button type="button" className="study-lightbox-close" onClick={onClose} aria-label="Fermer l’image agrandie">
        <X size={20} aria-hidden="true" />
      </button>
    </dialog>
  );
}

function Unavailable({ usage, onRenew, inline = false }: { usage: Placement['usage']; onRenew?: () => void; inline?: boolean }) {
  const Icon = usage === 'audio' ? VolumeX : ImageOff;
  return (
    <div className={`study-missing${inline ? ' is-inline' : ''}`}>
      <span className="study-missing-icon" aria-hidden="true"><Icon size={18} /></span>
      <p role="alert">Cette ressource est indisponible pour le moment.</p>
      {onRenew && <button className="btn btn-outline btn-sm" type="button" onClick={onRenew}><RefreshCw size={15} aria-hidden="true" /> Réessayer</button>}
    </div>
  );
}

/**
 * Support d'une activité, d'une question ou d'un choix de réponse. En mode compact (choix de réponse), l'image
 * s'affiche seule, sans cadre ni bouton d'agrandissement : un clic sur le choix sélectionne la réponse.
 */
export function MediaPlacement({ placement, onRenew, compact = false }: { placement: Placement; onRenew: () => void; compact?: boolean }) {
  const [failed, setFailed] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  useEffect(() => { setFailed(false); }, [placement.url]);

  if (!placement.url || failed) return <Unavailable usage={placement.usage} onRenew={compact && placement.usage === 'illustration' ? undefined : onRenew} inline={compact} />;
  const alt = placement.decorative ? '' : placement.alt ?? '';
  if (placement.usage === 'audio') {
    return <AudioPlayer src={placement.url} title={placement.caption ?? (compact ? 'Écouter ce choix' : 'Écouter l’enregistrement')} compact={compact}
      onError={() => setFailed(true)} />;
  }
  if (compact) {
    return <img className="pilot-option-image" src={placement.url} alt={alt} title={placement.caption ?? undefined} onError={() => setFailed(true)} />;
  }
  const zoomable = !placement.decorative;
  return (
    <figure className="study-figure">
      <div className="study-figure-frame">
        <img className="pilot-lesson-image" src={placement.url} alt={alt} onError={() => setFailed(true)}
          onClick={zoomable ? () => setZoomed(true) : undefined} />
        {zoomable && (
          <button type="button" className="study-zoom" onClick={() => setZoomed(true)} aria-label={`Agrandir l’image${alt ? ` : ${alt}` : ''}`}>
            <Maximize2 size={16} aria-hidden="true" />
          </button>
        )}
      </div>
      {placement.caption && <figcaption>{placement.caption}</figcaption>}
      {zoomed && <Lightbox src={placement.url} alt={alt} caption={placement.caption} onClose={() => setZoomed(false)} />}
    </figure>
  );
}

/** Transcription repliée ; les répliques « Nom : texte » deviennent des bulles de dialogue. */
export function Transcript({ text }: { text: string | null }) {
  if (!text) return null;
  return (
    <details className="study-transcript">
      <summary>
        <span className="study-transcript-icon" aria-hidden="true"><FileText size={16} /></span>
        <span>Lire la transcription</span>
        <ChevronDown className="study-transcript-chevron" size={18} aria-hidden="true" />
      </summary>
      <div className="study-transcript-body"><LessonContent text={text} compact /></div>
    </details>
  );
}

/**
 * Supports d'une activité dans leur ordre : les illustrations consécutives forment une galerie,
 * chaque son garde sa place (une image suivie de son enregistrement restent ensemble).
 */
export function MediaSequence({ placements, onRenew, after }: { placements: Placement[]; onRenew: () => void; after?: ReactNode }) {
  if (!placements.length && !after) return null;
  const groups: Placement[][] = [];
  for (const placement of placements) {
    const last = groups.at(-1);
    if (placement.usage === 'illustration' && last?.[0].usage === 'illustration') last.push(placement);
    else groups.push([placement]);
  }
  return (
    <div className="study-media">
      {groups.map((group) => group[0].usage === 'illustration'
        ? (
          <div key={group[0].position} className={`study-gallery${group.length > 1 ? ' is-multi' : ''}`}>
            {group.map((placement) => <MediaPlacement key={placement.position} placement={placement} onRenew={onRenew} />)}
          </div>
        )
        : <MediaPlacement key={group[0].position} placement={group[0]} onRenew={onRenew} />)}
      {after}
    </div>
  );
}
