/**
 * Consignes bilingues des niveaux B (format 5 des contenus) : le texte porte lui-même sa traduction française.
 *
 * - ` [fr] ` : traduction affichée sous l'allemand (B1) ;
 * - ` [fr?] ` : aide repliée sous un bouton « Aide en français » (B2), que l'élève peut toujours afficher (préférence
 *   gardée dans ce navigateur, `localStorage` « lc-french-help »).
 *
 * Même ligne : `Lesen Sie den Text. [fr] Lisez le texte.` (allemand avant le marqueur, français après). Ligne seule :
 * `[fr] Lisez le texte.` traduit le bloc qui la précède (intertitre, paragraphe, puce ou étape). Un texte sans marqueur
 * (A1, A2) s'affiche tel quel, sans élément ajouté. `LessonContent` applique les mêmes règles aux textes de leçon.
 */
import { useEffect, useId, useState, useSyncExternalStore, type ReactNode } from 'react';
import { ChevronDown, Languages } from 'lucide-react';
import './bilingual.css';

export type GlossMode = 'beside' | 'fold';
/** Ligne bilingue : partie allemande (vide pour une ligne seule `[fr] …`), partie française et mode d'affichage. */
export interface Gloss { de: string; fr: string; mode: GlossMode }

/** Marqueur entouré d'espaces (ou en début et fin de ligne) : `[fr]` ou `[fr?]`, en minuscules. */
const MARKER = /(^|\s)\[(fr\??)\](?=\s|$)/;
const MARKER_ANY = /(^|\s)\[fr\??\](?=\s|$)/m;
const FOLD_ANY = /(^|\s)\[fr\?\](?=\s|$)/m;

/** Découpe une ligne au premier marqueur ; null si elle n'en porte pas. */
export function parseGloss(line: string): Gloss | null {
  const match = MARKER.exec(line);
  if (!match) return null;
  const at = match.index + match[1].length;
  return {
    de: line.slice(0, at).trim(),
    fr: line.slice(at + match[2].length + 2).trim(),
    mode: match[2] === 'fr?' ? 'fold' : 'beside',
  };
}

/** Le texte porte-t-il au moins un marqueur (`[fr]` ou `[fr?]`) ? */
export const hasGloss = (text: string | null | undefined) => Boolean(text && MARKER_ANY.test(text));
/** Le texte porte-t-il une aide repliée (`[fr?]`) ? */
export const hasFoldedHelp = (text: string | null | undefined) => Boolean(text && FOLD_ANY.test(text));

/** Unité de texte : lignes allemandes et leur traduction éventuelle. */
export interface GlossUnit { de: string[]; fr: string | null; mode: GlossMode }

/**
 * Lignes d'un texte regroupées avec leur traduction. Une ligne seule `[fr] …` traduit les lignes qui la précèdent
 * depuis la dernière ligne vide ou la dernière traduction (un paragraphe entier, ou une seule ligne).
 */
export function glossUnits(text: string): GlossUnit[] {
  const units: GlossUnit[] = [];
  let pending: string[] = [];
  const flush = () => {
    if (pending.length) units.push({ de: pending, fr: null, mode: 'beside' });
    pending = [];
  };
  for (const raw of text.replace(/\r/g, '').split('\n')) {
    const line = raw.trim();
    if (!line) { flush(); continue; }
    const gloss = parseGloss(line);
    if (!gloss) { pending.push(line); continue; }
    if (gloss.de) {
      flush();
      units.push({ de: [gloss.de], fr: gloss.fr || null, mode: gloss.mode });
    } else if (pending.length) {
      units.push({ de: pending, fr: gloss.fr || null, mode: gloss.mode });
      pending = [];
    } else {
      // Traduction après une ligne vide : elle revient au bloc précédent s'il n'est pas déjà traduit.
      const previous = units.at(-1);
      if (previous && previous.fr === null) Object.assign(previous, { fr: gloss.fr || null, mode: gloss.mode });
      else if (gloss.fr) units.push({ de: [], fr: gloss.fr, mode: gloss.mode });
    }
  }
  flush();
  return units;
}

/** Texte sans marqueur ni traduction : la partie allemande seule (libellés accessibles, résumés d'une ligne). */
export function germanOf(text: string): string {
  return hasGloss(text) ? glossUnits(text).flatMap((unit) => unit.de).join(' ') : text;
}

// ---------------------------------------------------------------------------------------------------------------------
// Préférence « Toujours afficher l'aide en français » (B2), sans serveur
// ---------------------------------------------------------------------------------------------------------------------

const PREFERENCE = 'lc-french-help';
const listeners = new Set<() => void>();

function readPreference() {
  try { return window.localStorage.getItem(PREFERENCE) === 'always'; } catch { return false; }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const fromOtherTab = (event: StorageEvent) => { if (event.key === PREFERENCE) listener(); };
  window.addEventListener('storage', fromOtherTab);
  return () => { listeners.delete(listener); window.removeEventListener('storage', fromOtherTab); };
}

/** Enregistre la préférence de l'élève et l'applique à toutes les aides affichées. */
export function setFrenchHelpAlways(always: boolean) {
  try {
    if (always) window.localStorage.setItem(PREFERENCE, 'always');
    else window.localStorage.removeItem(PREFERENCE);
  } catch { /* stockage indisponible : la préférence vaut pour cette page seulement */ }
  for (const listener of listeners) listener();
}

/** L'élève a-t-il choisi de toujours afficher l'aide en français ? */
export function useFrenchHelpAlways() {
  return useSyncExternalStore(subscribe, readPreference, () => false);
}

// ---------------------------------------------------------------------------------------------------------------------
// Composants
// ---------------------------------------------------------------------------------------------------------------------

/**
 * Aide repliable « Aide en français » (B2) : bouton avec `aria-expanded`, texte français dessous. Ouverte d'emblée si
 * l'élève a choisi de toujours l'afficher. Faite d'éléments en ligne : elle se place dans un énoncé, une légende ou un
 * paragraphe.
 */
export function FrenchHelp({ children, label = 'Aide en français', compact = false }: {
  children: ReactNode; label?: string;
  /** Bouton réduit à son icône, à côté d'un intertitre ; la traduction s'ouvre sur la même ligne. */
  compact?: boolean;
}) {
  const always = useFrenchHelpAlways();
  const [open, setOpen] = useState(always);
  const id = useId();
  useEffect(() => { setOpen(always); }, [always]);
  return (
    <span className={`bi-help${open ? ' is-open' : ''}${compact ? ' is-compact' : ''}`}>
      <button type="button" className="bi-help-toggle" aria-expanded={open} aria-controls={id} onClick={() => setOpen((value) => !value)}
        aria-label={compact ? label : undefined} title={compact ? label : undefined}>
        <Languages size={14} aria-hidden="true" />
        {!compact && <span>{label}</span>}
        {!compact && <ChevronDown size={14} className="bi-help-chevron" aria-hidden="true" />}
      </button>
      <span id={id} className="bi-help-body" lang="fr" hidden={!open}>{children}</span>
    </span>
  );
}

/** Traduction d'une unité : sous l'allemand (B1) ou repliée (B2). */
export function GlossNote({ fr, mode }: { fr: string; mode: GlossMode }) {
  if (mode === 'fold') return <FrenchHelp>{fr}</FrenchHelp>;
  return <span className="bi-fr" lang="fr">{fr}</span>;
}

/**
 * Texte court bilingue : énoncé, point de liste, critère, explication. Sans marqueur, le texte est rendu tel quel ;
 * avec marqueurs, l'allemand (`lang="de"`) puis sa traduction. N'utilise que des éléments en ligne (affichés en bloc).
 */
export function BilingualText({ text, className }: { text: string | null | undefined; className?: string }) {
  if (!text) return null;
  if (!hasGloss(text)) return className ? <span className={className}>{text}</span> : <>{text}</>;
  const units = glossUnits(text);
  return (
    <span className={`bi${className ? ` ${className}` : ''}`}>
      {units.map((unit, index) => (
        <span key={index} className="bi-unit">
          {unit.de.length > 0 && (
            <span className="bi-de" lang="de">
              {unit.de.map((line, row) => <span key={row} className="bi-line">{line}</span>)}
            </span>
          )}
          {unit.fr && <GlossNote fr={unit.fr} mode={unit.mode} />}
        </span>
      ))}
    </span>
  );
}

/**
 * Réglage « Toujours afficher l'aide en français », proposé une fois par écran quand une aide repliée (`[fr?]`) s'y
 * trouve (leçon, exercice, mission).
 */
export function FrenchHelpSwitch() {
  const always = useFrenchHelpAlways();
  const id = useId();
  return (
    <div className="bi-switch-row">
      <span className="bi-switch-icon" aria-hidden="true"><Languages size={16} /></span>
      <label className="bi-switch" htmlFor={id}>
        <span className="bi-switch-text">
          <strong>Toujours afficher l’aide en français</strong>
          <small>Sinon, touchez « Aide en français » sous une consigne pour la lire.</small>
        </span>
        <input id={id} type="checkbox" role="switch" checked={always} onChange={(event) => setFrenchHelpAlways(event.target.checked)} />
        <span className="bi-switch-track" aria-hidden="true" />
      </label>
    </div>
  );
}
