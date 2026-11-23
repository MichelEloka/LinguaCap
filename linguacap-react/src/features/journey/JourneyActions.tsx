import { useEffect, useRef, type PointerEvent, type ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import { isTypingTarget, prefersReducedMotion } from './motion';
import './journey-scene.css';

export interface JourneyActionsProps {
  /** Affiche « Retour » à gauche. */
  onBack?: () => void;
  backLabel?: string;
  backDisabled?: boolean;
  /** `submit` (défaut) dans un `JourneyStage` formulaire ; `button` avec `onPrimary` sinon. */
  primaryType?: 'submit' | 'button';
  onPrimary?: () => void;
  disabled?: boolean;
  /** Enregistrement en cours : bouton désactivé et `aria-busy`. */
  busy?: boolean;
  /** Entrée (hors champ de saisie et hors bouton) déclenche le bouton principal. */
  enterKey?: boolean;
  /** Aide discrète affichée avec une souris ; `false` pour la masquer. */
  hint?: ReactNode | false;
  /** Contenu du bouton principal : son texte est son nom accessible (« Continuer », « Commencer »…). */
  children: ReactNode;
}

const clamp = (value: number, limit: number) => Math.max(-limit, Math.min(limit, value));

/**
 * Barre d'actions de la scène : « Retour » et bouton principal « magnétique » (il se déplace légèrement vers le pointeur).
 * Collée en bas de la scène, et en bas de l'écran sur mobile (zone sûre comprise).
 */
export function JourneyActions({
  onBack, backLabel = 'Retour', backDisabled = false, primaryType = 'submit', onPrimary, disabled = false, busy = false,
  enterKey = true, hint, children,
}: JourneyActionsProps) {
  const primary = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!enterKey) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Enter' || event.defaultPrevented || event.isComposing || event.shiftKey || event.altKey || event.ctrlKey || event.metaKey) return;
      const target = event.target;
      if (isTypingTarget(target)) return;
      if (target instanceof HTMLElement && target.closest('button, a, summary, select, [role="button"], [role="link"]')) return;
      const button = primary.current;
      if (!button || button.disabled) return;
      const scope = button.closest('dialog, .jy');
      if (scope && target instanceof Node && target !== document.body && !scope.contains(target)) return;
      event.preventDefault();
      button.click();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [enterKey]);

  function magnet(event: PointerEvent<HTMLDivElement>) {
    const button = primary.current;
    if (!button || event.pointerType !== 'mouse' || button.disabled || prefersReducedMotion()) return;
    const rect = button.getBoundingClientRect();
    const dx = event.clientX - (rect.left + rect.width / 2);
    const dy = event.clientY - (rect.top + rect.height / 2);
    if (Math.abs(dx) > rect.width / 2 + 80 || Math.abs(dy) > rect.height / 2 + 60) {
      release();
      return;
    }
    button.style.setProperty('--mx', `${clamp(dx * .16, 9).toFixed(1)}px`);
    button.style.setProperty('--my', `${clamp(dy * .24, 6).toFixed(1)}px`);
  }
  function release() {
    primary.current?.style.removeProperty('--mx');
    primary.current?.style.removeProperty('--my');
  }

  const shownHint = hint === undefined ? <><kbd>Entrée</kbd> pour continuer</> : hint;
  return (
    <div className="ja" onPointerMove={magnet} onPointerLeave={release}>
      <div className="ja-inner">
        {onBack ? (
          <button type="button" className="btn btn-ghost ja-back" onClick={onBack} disabled={backDisabled || busy}>
            <ArrowLeft size={17} aria-hidden="true" /> {backLabel}
          </button>
        ) : <span className="ja-spacer" />}
        {shownHint && enterKey && !disabled && !busy && <span className="ja-hint">{shownHint}</span>}
        <button ref={primary} type={primaryType} className="btn btn-primary btn-lg ja-primary" disabled={disabled || busy}
          aria-busy={busy || undefined} onClick={primaryType === 'button' ? onPrimary : undefined}>
          {children}
        </button>
      </div>
    </div>
  );
}
