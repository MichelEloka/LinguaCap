/** Éléments partagés du Ciné-club : affiche du film (dessinée, sans image de YouTube), crédit, mots-clés, repères de temps. */
import type { ReactNode } from 'react';
import { BookmarkCheck, BookmarkPlus, Clapperboard, ExternalLink, Info } from 'lucide-react';
import { formatTimecode, youtubeWatchUrl, type Film, type FilmKeyword } from '../../integration/cine';
import '../onboarding/onboarding.css';
import './cine.css';

/** Affiche du film : décor local (bande de pellicule, niveau, titre), aucune vignette chargée depuis YouTube. */
export function FilmPoster({ film, size = 'md' }: { film: Pick<Film, 'title' | 'levelCode'>; size?: 'sm' | 'md' | 'lg' }) {
  const [name, ...rest] = film.title.replace(new RegExp(`\\s*${film.levelCode}$`), '').split(' ');
  return (
    <span className={`cine-poster lvl-${film.levelCode} is-${size}`} aria-hidden="true">
      <span className="cine-poster-strip is-top" />
      <span className="cine-poster-strip is-bottom" />
      <span className="cine-poster-glow" />
      <span className="cine-poster-body">
        <Clapperboard size={size === 'sm' ? 16 : 22} className="cine-poster-icon" />
        <span className="cine-poster-title"><b>{name}</b>{rest.length > 0 && <b>{rest.join(' ')}</b>}</span>
        <span className="cine-poster-level">{film.levelCode}</span>
      </span>
    </span>
  );
}

/** Crédit visible du film et liens vers la vidéo et le cours gratuit de l'éditeur (ouverts seulement au clic). */
export function FilmCredit({ film, start, compact = false }: { film: Pick<Film, 'credit' | 'videoUrl' | 'courseUrl' | 'licenseNote'>; start?: number; compact?: boolean }) {
  return (
    <div className={`cine-credit${compact ? ' is-compact' : ''}`}>
      <p className="cine-credit-line"><Info size={14} aria-hidden="true" /><span>{film.credit}</span></p>
      <p className="cine-credit-links">
        <a href={youtubeWatchUrl(film.videoUrl, start)} target="_blank" rel="noopener noreferrer">Voir sur YouTube <ExternalLink size={12} aria-hidden="true" /></a>
        <a href={film.courseUrl} target="_blank" rel="noopener noreferrer">Cours gratuit de la DW <ExternalLink size={12} aria-hidden="true" /></a>
      </p>
      {!compact && film.licenseNote && <p className="cine-credit-note">{film.licenseNote}</p>}
    </div>
  );
}

/** Bornes d'une séquence : « 0:00 → 7:00 ». */
export function TimeRange({ start, end }: { start: number; end: number }) {
  return <span className="cine-range"><time>{formatTimecode(start)}</time><span aria-hidden="true">→</span><span className="sr-only">à</span><time>{formatTimecode(end)}</time></span>;
}

/** Forme notée d'un mot-clé : « der Bahnhof ». */
export const keywordHeadword = (keyword: FilmKeyword) => (keyword.article ? `${keyword.article} ${keyword.word}` : keyword.word);
/** Note enregistrée avec un mot-clé : traduction et pluriel. */
export const keywordNote = (keyword: FilmKeyword) => `${keyword.translation}${keyword.plural ? ` (pl. ${keyword.plural})` : ''}`.slice(0, 200);

/** Carte d'un mot-clé (avant de regarder) avec, pour l'élève, le bouton « Noter ». */
export function KeywordCard({ keyword, noted, onNote }: { keyword: FilmKeyword; noted?: boolean; onNote?: () => void }) {
  const headword = keywordHeadword(keyword);
  return (
    <li className="cine-keyword" data-article={keyword.article ?? undefined}>
      <div className="cine-keyword-main">
        <p className="cine-keyword-word">
          {keyword.article && <span className={`lx-article is-${keyword.article}`} lang="de">{keyword.article}</span>}
          <strong lang="de">{keyword.word}</strong>
          {keyword.plural && <span className="cine-keyword-plural" lang="de"><span className="sr-only">pluriel : </span><span aria-hidden="true">pl. </span>{keyword.plural}</span>}
        </p>
        <p className="cine-keyword-translation">{keyword.translation}</p>
        {keyword.note && <p className="cine-keyword-note" lang="de">{keyword.note}</p>}
      </div>
      {onNote && (
        <button type="button" className={`cine-keyword-save${noted ? ' is-noted' : ''}`} onClick={onNote} disabled={noted} aria-pressed={noted}
          aria-label={noted ? `« ${headword} » est dans votre carnet` : `Noter « ${headword} » dans mon carnet`}
          title={noted ? 'Déjà dans votre carnet' : 'Noter dans mon carnet'}>
          {noted ? <BookmarkCheck size={17} aria-hidden="true" /> : <BookmarkPlus size={17} aria-hidden="true" />}
        </button>
      )}
    </li>
  );
}

/** Étapes d'une séquence (avant, regarder, après) : onglets numérotés, l'étape faite est cochée. */
export interface CineStep { id: string; label: string; caption: string; icon: ReactNode; done?: boolean }
export function CineStepper({ steps, value, onChange }: { steps: CineStep[]; value: string; onChange: (id: string) => void }) {
  return (
    <div className="cine-steps" role="tablist" aria-label="Étapes de la séquence">
      {steps.map((step, index) => (
        <button key={step.id} type="button" role="tab" id={`cine-step-${step.id}`} aria-controls={`cine-panel-${step.id}`} aria-selected={step.id === value}
          tabIndex={step.id === value ? 0 : -1} className={`cine-step${step.done ? ' is-done' : ''}`} onClick={() => onChange(step.id)}
          onKeyDown={(event) => {
            const delta = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
            if (!delta) return;
            event.preventDefault();
            const next = steps[(index + delta + steps.length) % steps.length];
            onChange(next.id);
            document.getElementById(`cine-step-${next.id}`)?.focus();
          }}>
          <span className="cine-step-num" aria-hidden="true">{index + 1}</span>
          <span className="cine-step-text"><strong>{step.label}</strong><small>{step.caption}</small></span>
          <span className="cine-step-icon" aria-hidden="true">{step.icon}</span>
        </button>
      ))}
    </div>
  );
}
