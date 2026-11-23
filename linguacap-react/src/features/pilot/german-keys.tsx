/**
 * Barre de caractères allemands (ä ö ü ß Ä Ö Ü) des exercices à saisir : chaque touche insère la lettre au curseur du
 * dernier champ utilisé dans la carte (ou du premier champ si aucun n'a encore servi), puis lui rend le focus. Les
 * touches ne prennent pas le focus au toucher : le clavier du téléphone reste ouvert pendant la saisie.
 */
import { useRef } from 'react';
import type { FocusEvent, ReactNode } from 'react';

const LETTERS = ['ä', 'ö', 'ü', 'ß', 'Ä', 'Ö', 'Ü'];
type Field = HTMLInputElement | HTMLTextAreaElement;

const isField = (node: EventTarget | null): node is Field =>
  (node instanceof HTMLInputElement && (node.type === 'text' || node.type === 'search')) || node instanceof HTMLTextAreaElement;

/** Insère un texte au curseur d'un champ contrôlé par React (la saisie déclenche onChange comme une frappe). */
export function insertAtCursor(field: Field, text: string) {
  const start = field.selectionStart ?? field.value.length;
  const end = field.selectionEnd ?? field.value.length;
  const next = field.value.slice(0, start) + text + field.value.slice(end);
  if (field.maxLength > 0 && next.length > field.maxLength) return;
  const prototype = field instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(prototype, 'value')?.set?.call(field, next);
  field.dispatchEvent(new Event('input', { bubbles: true }));
  const caret = start + text.length;
  field.focus({ preventScroll: true });
  field.setSelectionRange(caret, caret);
  requestAnimationFrame(() => field.setSelectionRange(caret, caret));
}

/** Zone de saisie avec sa barre : `children` contient les champs ; la barre suit le dernier champ qui a eu le focus. */
export function GermanKeyboardScope({ children, disabled = false, className = '' }: { children: ReactNode; disabled?: boolean; className?: string }) {
  const scope = useRef<HTMLDivElement>(null);
  const last = useRef<Field | null>(null);
  function remember(event: FocusEvent<HTMLDivElement>) {
    if (isField(event.target)) last.current = event.target;
  }
  function target(): Field | null {
    const remembered = last.current;
    if (remembered && remembered.isConnected && !remembered.disabled) return remembered;
    return scope.current?.querySelector<Field>('input[type="text"]:not(:disabled), textarea:not(:disabled)') ?? null;
  }
  return (
    <div ref={scope} className={`sx-keys-scope ${className}`.trim()} onFocus={remember}>
      {children}
      {!disabled && <GermanKeys target={target} />}
    </div>
  );
}

export function GermanKeys({ target }: { target: () => Field | null }) {
  return (
    <div className="sx-keys" role="group" aria-label="Lettres allemandes">
      {LETTERS.map((letter) => (
        <button key={letter} type="button" className="sx-key" lang="de" aria-label={`Insérer ${letter}`} title={`Insérer ${letter}`}
          // Garder le focus (et le clavier du téléphone) dans le champ : la touche n'est jamais focalisée à la souris ni au toucher.
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => { const field = target(); if (field) insertAtCursor(field, letter); }}>
          {letter}
        </button>
      ))}
    </div>
  );
}
