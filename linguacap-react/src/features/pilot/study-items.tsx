/**
 * Saisie des questions typées du mode étude : texte à trous (`fill`), phrase à remettre en ordre (`order`), associations
 * (`match`) et dictée (`dictation`). Le choix unique reste `QuestionCard` (study-question) et la répétition orale
 * `SpeakField` (study-speak). Toutes les saisies se font au toucher, à la souris et au clavier.
 */
import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { KeyboardEvent, PointerEvent as ReactPointerEvent, ReactNode, RefObject } from 'react';
import { Check, Eraser, Hand } from 'lucide-react';
import {
  countWords, exerciseLimits, fillSegments, type DictationAnswer, type DictationQuestionView, type ExerciseAnswer, type FillAnswer,
  type FillQuestionView, type MatchAnswer, type MatchQuestionView, type OrderAnswer, type OrderQuestionView, type QuestionView,
} from '../../integration/v4';
import { GermanKeyboardScope } from './german-keys';
import './study-exercise.css';

// ---------------------------------------------------------------------------------------------------------------------
// Réponses : complétude et nettoyage d'un état sauvegardé
// ---------------------------------------------------------------------------------------------------------------------

/** La question a-t-elle une réponse complète (tous les trous, tous les mots, toutes les paires…) ? */
export function isAnswered(question: QuestionView, answer: ExerciseAnswer | undefined): boolean {
  if (!answer) return false;
  switch (question.type) {
    case 'choice': return 'choice' in answer && Boolean(answer.choice);
    case 'fill': return 'blanks' in answer && question.blanks.every((blank) => (answer.blanks[blank.id] ?? '').trim().length > 0);
    case 'order': return 'order' in answer && answer.order.length === question.tokens.length;
    case 'match': return 'pairs' in answer && question.left.every((item) => Boolean(answer.pairs[item.id]));
    case 'dictation': return 'text' in answer && answer.text.trim().length > 0;
    case 'speak': return 'speechAttemptId' in answer && Boolean(answer.speechAttemptId);
  }
}

/** Ne garde d'une réponse sauvegardée que ce qui correspond encore à la question (ids connus, bon type). */
export function cleanAnswer(question: QuestionView, answer: ExerciseAnswer | undefined): ExerciseAnswer | undefined {
  if (!answer) return undefined;
  switch (question.type) {
    case 'choice':
      return 'choice' in answer && question.options.some((option) => option.id === answer.choice) ? answer : undefined;
    case 'fill': {
      if (!('blanks' in answer) || !answer.blanks || typeof answer.blanks !== 'object') return undefined;
      const blanks = Object.fromEntries(question.blanks.filter((blank) => typeof answer.blanks[blank.id] === 'string')
        .map((blank) => [blank.id, answer.blanks[blank.id].slice(0, exerciseLimits.blankChars)]));
      return { blanks };
    }
    case 'order': {
      if (!('order' in answer) || !Array.isArray(answer.order)) return undefined;
      const known = new Set(question.tokens.map((token) => token.id));
      return { order: [...new Set(answer.order)].filter((id) => known.has(id)) };
    }
    case 'match': {
      if (!('pairs' in answer) || !answer.pairs || typeof answer.pairs !== 'object') return undefined;
      const rights = new Set(question.right.map((item) => item.id));
      const used = new Set<string>();
      const pairs: Record<string, string> = {};
      for (const item of question.left) {
        const right = answer.pairs[item.id];
        if (rights.has(right) && !used.has(right)) { pairs[item.id] = right; used.add(right); }
      }
      return { pairs };
    }
    case 'dictation': return 'text' in answer && typeof answer.text === 'string' ? { text: answer.text.slice(0, exerciseLimits.textChars) } : undefined;
    case 'speak': return 'speechAttemptId' in answer && typeof answer.speechAttemptId === 'string' ? answer : undefined;
  }
}

/** Rappel affiché sous une question restée sans réponse complète à la remise. */
export const missingTexts: Record<QuestionView['type'], string> = {
  choice: 'Choisissez une réponse.',
  fill: 'Complétez chaque trou.',
  order: 'Placez tous les mots dans la phrase.',
  match: 'Associez chaque élément de gauche.',
  dictation: 'Écrivez ce que vous entendez.',
  speak: 'Répétez la phrase à voix haute (ou enregistrez-vous).',
};

/** Entrée dans un champ : passer au champ suivant de l'exercice plutôt que remettre le formulaire. */
export function focusNextField(from: HTMLElement) {
  const scope = from.closest('form') ?? document;
  const fields = [...scope.querySelectorAll<HTMLElement>('input[type="text"]:not(:disabled), textarea:not(:disabled)')];
  const next = fields[fields.indexOf(from) + 1];
  if (next) next.focus();
  else from.blur();
}

const reduceMotion = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

// ---------------------------------------------------------------------------------------------------------------------
// Texte à trous
// ---------------------------------------------------------------------------------------------------------------------

export function FillField({ question, value, onChange, locked = false }: {
  question: FillQuestionView; value: FillAnswer | undefined; onChange: (answer: FillAnswer) => void; locked?: boolean;
}) {
  const segments = useMemo(() => fillSegments(question.text), [question.text]);
  const specs = useMemo(() => new Map(question.blanks.map((blank) => [blank.id, blank])), [question.blanks]);
  const order = segments.flatMap((segment) => (segment.kind === 'blank' ? [segment.id] : []));
  const values = value?.blanks ?? {};
  return (
    <GermanKeyboardScope disabled={locked} className="sx-fill-scope">
      <p className="sx-fill" lang="de">
        {segments.map((segment, index) => {
          if (segment.kind === 'text') {
            return segment.text.split('\n').map((line, row) => (
              <span key={`${index}-${row}`}>{row > 0 && <br />}{line}</span>
            ));
          }
          const spec = specs.get(segment.id);
          const number = order.indexOf(segment.id) + 1;
          const text = values[segment.id] ?? '';
          const width = Math.max(Math.min(Math.max(spec?.size ?? 6, 3), 18), text.length);
          return (
            <span key={index} className={`sx-blank${text.trim() ? ' is-filled' : ''}`}>
              <input type="text" className="sx-blank-input" value={text} disabled={locked} maxLength={exerciseLimits.blankChars}
                aria-label={`Trou ${number}${order.length > 1 ? ` sur ${order.length}` : ''}${spec?.hint ? `, indice : ${spec.hint}` : ''}`}
                style={{ width: `calc(${width}ch + 1.4rem)` }}
                autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false} enterKeyHint={number < order.length ? 'next' : 'done'}
                onChange={(event) => onChange({ blanks: { ...values, [segment.id]: event.target.value } })}
                onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); focusNextField(event.currentTarget); } }} />
              {spec?.hint && <span className="sx-blank-hint" aria-hidden="true">{spec.hint}</span>}
            </span>
          );
        })}
      </p>
    </GermanKeyboardScope>
  );
}

// ---------------------------------------------------------------------------------------------------------------------
// Animation des déplacements (FLIP) : chaque élément [data-flip] glisse de son ancienne place à la nouvelle
// ---------------------------------------------------------------------------------------------------------------------

type Point = { x: number; y: number };

/**
 * `snapshot()` relève la place visible des éléments juste avant un changement ; après le rendu, chacun glisse de cette
 * place à la nouvelle (même s'il était encore en mouvement). `place(id, point)` impose le point de départ d'un élément
 * (le mot lâché part de l'endroit où on l'a déposé).
 */
function useFlip(root: RefObject<HTMLElement | null>) {
  const pending = useRef<Map<string, Point> | null>(null);
  const running = useRef(new WeakMap<Element, Animation>());
  const read = () => {
    const positions = new Map<string, Point>();
    const element = root.current;
    if (!element) return positions;
    const base = element.getBoundingClientRect();
    for (const node of element.querySelectorAll<HTMLElement>('[data-flip]')) {
      const rect = node.getBoundingClientRect();
      if (rect.width) positions.set(node.dataset.flip ?? '', { x: rect.left - base.left, y: rect.top - base.top });
    }
    return positions;
  };
  useLayoutEffect(() => {
    const before = pending.current;
    const element = root.current;
    if (!before || !element) return;
    pending.current = null;
    if (reduceMotion()) return;
    const nodes = [...element.querySelectorAll<HTMLElement>('[data-flip]')];
    for (const node of nodes) running.current.get(node)?.cancel();
    const after = read();
    for (const node of nodes) {
      const id = node.dataset.flip ?? '';
      const from = before.get(id);
      const to = after.get(id);
      if (!from || !to) continue;
      const dx = from.x - to.x;
      const dy = from.y - to.y;
      if (Math.abs(dx) < 1 && Math.abs(dy) < 1) continue;
      const animation = node.animate?.([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'translate(0, 0)' }],
        { duration: 300, easing: 'cubic-bezier(.22, 1, .36, 1)' });
      if (animation) running.current.set(node, animation);
    }
  });
  return {
    snapshot: () => { pending.current ??= read(); },
    place: (id: string, point: Point) => { pending.current?.set(id, point); },
  };
}

// ---------------------------------------------------------------------------------------------------------------------
// Phrase à remettre en ordre
// ---------------------------------------------------------------------------------------------------------------------

interface Press {
  id: string; from: 'line' | 'pool'; x: number; y: number; offsetX: number; offsetY: number;
  width: number; height: number; pointerX: number; pointerY: number; active: boolean;
}
interface DragState { id: string; from: 'line' | 'pool'; index: number | null; width: number; height: number }

/**
 * Les mots se touchent dans l'ordre : chacun rejoint la phrase, un mot de la phrase y retourne s'il est touché. On peut
 * aussi les faire glisser (souris ou doigt) pour les insérer ou les déplacer, et au clavier : Entrée place ou retire un
 * mot, les flèches le déplacent dans la phrase.
 */
export function OrderField({ question, value, onChange, locked = false }: {
  question: OrderQuestionView; value: OrderAnswer | undefined; onChange: (answer: OrderAnswer) => void; locked?: boolean;
}) {
  const tokens = question.tokens;
  const texts = useMemo(() => new Map(tokens.map((token) => [token.id, token.text])), [tokens]);
  const placed = (value?.order ?? []).filter((id) => texts.has(id));
  const placedSet = new Set(placed);
  const pool = tokens.filter((token) => !placedSet.has(token.id));
  const root = useRef<HTMLDivElement>(null);
  const line = useRef<HTMLDivElement>(null);
  const ghost = useRef<HTMLSpanElement>(null);
  const press = useRef<Press | null>(null);
  const quietUntil = useRef(0);
  const focusAfter = useRef<string | null>(null);
  const [drag, setDrag] = useState<DragState | null>(null);
  const dragIndex = useRef<number | null>(null);
  const [announce, setAnnounce] = useState('');
  const hintId = useId();
  const latest = useRef({ placed, onChange, texts });
  latest.current = { placed, onChange, texts };
  const flip = useFlip(root);
  const quote = (id: string) => `« ${latest.current.texts.get(id) ?? ''} »`;

  function commit(next: string[], message: string, focus: string | null = null) {
    flip.snapshot();
    focusAfter.current = focus;
    setAnnounce(message);
    latest.current.onChange({ order: next });
  }

  // Après un placement au clavier, le focus suit le mot (ou passe au mot suivant de la réserve).
  useLayoutEffect(() => {
    const id = focusAfter.current;
    if (!id) return;
    focusAfter.current = null;
    root.current?.querySelector<HTMLElement>(`[data-token="${CSS.escape(id)}"]`)?.focus({ preventScroll: true });
  });

  function indexAt(x: number, y: number, dragged: string): number | null {
    const zone = line.current;
    if (!zone) return null;
    const box = zone.getBoundingClientRect();
    if (x < box.left - 24 || x > box.right + 24 || y < box.top - 36 || y > box.bottom + 36) return null;
    const nodes = [...zone.querySelectorAll<HTMLElement>('[data-flip]')].filter((node) => node.dataset.flip !== dragged && node.offsetWidth);
    for (let index = 0; index < nodes.length; index++) {
      const rect = nodes[index].getBoundingClientRect();
      if (y < rect.top) return index;
      if (y <= rect.bottom && x < rect.left + rect.width / 2) return index;
    }
    return nodes.length;
  }

  function placeGhost() {
    const current = press.current;
    if (current && ghost.current) {
      ghost.current.style.transform = `translate3d(${current.pointerX - current.offsetX}px, ${current.pointerY - current.offsetY}px, 0)`;
    }
  }
  useLayoutEffect(placeGhost, [drag]);

  // Glisser-déposer : écouteurs globaux, actifs seulement pendant un appui sur un mot.
  useEffect(() => {
    function finish(drop: boolean) {
      const current = press.current;
      press.current = null;
      if (!current?.active) return;
      document.documentElement.classList.remove('sx-dragging');
      quietUntil.current = performance.now() + 450;
      const index = drop ? indexAt(current.pointerX, current.pointerY, current.id) : null;
      const base = root.current?.getBoundingClientRect();
      flip.snapshot();
      if (base && drop) flip.place(current.id, { x: current.pointerX - current.offsetX - base.left, y: current.pointerY - current.offsetY - base.top });
      setDrag(null);
      if (!drop) return;
      const rest = latest.current.placed.filter((id) => id !== current.id);
      if (index === null) {
        if (current.from === 'line') commit(rest, `${quote(current.id)} retiré de la phrase.`);
        return;
      }
      rest.splice(index, 0, current.id);
      commit(rest, `${quote(current.id)} placé en position ${index + 1} sur ${rest.length}.`);
    }
    function move(event: PointerEvent) {
      const current = press.current;
      if (!current) return;
      current.pointerX = event.clientX;
      current.pointerY = event.clientY;
      if (!current.active) {
        if (Math.hypot(event.clientX - current.x, event.clientY - current.y) < 6) return;
        current.active = true;
        document.documentElement.classList.add('sx-dragging');
        flip.snapshot();
        dragIndex.current = indexAt(event.clientX, event.clientY, current.id);
        setDrag({ id: current.id, from: current.from, index: dragIndex.current, width: current.width, height: current.height });
      } else {
        const index = indexAt(event.clientX, event.clientY, current.id);
        if (index !== dragIndex.current) {
          dragIndex.current = index;
          flip.snapshot();
          setDrag((state) => (state ? { ...state, index } : state));
        }
      }
      if (event.cancelable) event.preventDefault();
      placeGhost();
    }
    const up = () => finish(true);
    const cancel = () => finish(false);
    const escape = (event: globalThis.KeyboardEvent) => { if (event.key === 'Escape' && press.current?.active) finish(false); };
    window.addEventListener('pointermove', move, { passive: false });
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', cancel);
    window.addEventListener('keydown', escape);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', cancel);
      window.removeEventListener('keydown', escape);
      document.documentElement.classList.remove('sx-dragging');
    };
  }, []);

  function pointerDown(event: ReactPointerEvent<HTMLButtonElement>, id: string, from: 'line' | 'pool') {
    if (locked || (event.pointerType === 'mouse' && event.button !== 0)) return;
    const rect = event.currentTarget.getBoundingClientRect();
    // Suivre le pointeur même hors de la fenêtre (souris) ; au doigt, la capture est implicite.
    try { event.currentTarget.setPointerCapture(event.pointerId); } catch { /* pointeur déjà relâché */ }
    press.current = {
      id, from, x: event.clientX, y: event.clientY, offsetX: event.clientX - rect.left, offsetY: event.clientY - rect.top,
      width: rect.width, height: rect.height, pointerX: event.clientX, pointerY: event.clientY, active: false,
    };
  }

  function add(id: string, keyboard: boolean) {
    const rest = pool.filter((token) => token.id !== id);
    const position = pool.findIndex((token) => token.id === id);
    const nextFocus = keyboard ? (rest[Math.min(position, rest.length - 1)]?.id ?? id) : null;
    commit([...placed, id], `${quote(id)} ajouté en position ${placed.length + 1}.`, nextFocus);
  }
  function remove(id: string, keyboard: boolean) {
    const position = placed.indexOf(id);
    const next = placed.filter((item) => item !== id);
    const nextFocus = keyboard ? (next[Math.min(position, next.length - 1)] ?? id) : null;
    commit(next, `${quote(id)} retiré de la phrase.`, nextFocus);
  }
  function tap(id: string, from: 'line' | 'pool', keyboard: boolean) {
    if (locked || performance.now() < quietUntil.current) return;
    if (from === 'pool') add(id, keyboard); else remove(id, keyboard);
  }
  function lineKey(event: KeyboardEvent<HTMLButtonElement>, id: string) {
    const position = placed.indexOf(id);
    const target = event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? position - 1
      : event.key === 'ArrowRight' || event.key === 'ArrowDown' ? position + 1
        : event.key === 'Home' ? 0 : event.key === 'End' ? placed.length - 1 : null;
    if (event.key === 'Delete' || event.key === 'Backspace') {
      event.preventDefault();
      remove(id, true);
      return;
    }
    if (target === null) return;
    event.preventDefault();
    if (target < 0 || target >= placed.length || target === position) return;
    const next = placed.filter((item) => item !== id);
    next.splice(target, 0, id);
    commit(next, `${quote(id)} déplacé en position ${target + 1} sur ${next.length}.`, id);
  }

  // Le mot déplacé reste dans la page (masqué) : le navigateur continue de suivre le doigt ou la souris.
  const caretAt = drag && drag.index !== null ? drag.index : null;
  const lineItems: ReactNode[] = [];
  let visible = 0;
  for (const id of placed) {
    const hidden = drag?.from === 'line' && drag.id === id;
    if (!hidden && caretAt === visible) lineItems.push(<span key="caret" className="sx-caret" aria-hidden="true" style={{ width: drag?.width, height: drag?.height }} />);
    lineItems.push(
      <button key={id} type="button" className={`sx-token is-placed${hidden ? ' is-hidden' : ''}`} data-flip={id} data-token={id} disabled={locked} lang="de"
        aria-label={`${texts.get(id)}, mot ${placed.indexOf(id) + 1} sur ${placed.length} de votre phrase`} aria-describedby={hintId}
        onPointerDown={(event) => pointerDown(event, id, 'line')} onClick={(event) => tap(id, 'line', event.detail === 0)}
        onKeyDown={(event) => lineKey(event, id)}>
        {texts.get(id)}
      </button>,
    );
    if (!hidden) visible++;
  }
  if (caretAt !== null && caretAt >= visible) lineItems.push(<span key="caret" className="sx-caret" aria-hidden="true" style={{ width: drag?.width, height: drag?.height }} />);

  return (
    <div ref={root} className={`sx-order${drag ? ' is-dragging' : ''}${locked ? ' is-locked' : ''}`}>
      <div ref={line} className={`sx-order-line${placed.length ? '' : ' is-empty'}${drag && drag.index !== null ? ' is-target' : ''}`}
        role="group" aria-label="Votre phrase">
        {lineItems}
        {!placed.length && !drag && (
          <span className="sx-order-placeholder"><Hand size={16} aria-hidden="true" /> Touchez les mots dans l’ordre, ou faites-les glisser ici.</span>
        )}
      </div>
      <div className="sx-order-pool" role="group" aria-label="Mots à placer">
        {pool.map((token) => (
          <button key={token.id} type="button" className={`sx-token${drag?.id === token.id ? ' is-source' : ''}`} data-flip={token.id} data-token={token.id}
            disabled={locked} lang="de" aria-label={`Ajouter « ${token.text} » à la phrase`}
            onPointerDown={(event) => pointerDown(event, token.id, 'pool')} onClick={(event) => tap(token.id, 'pool', event.detail === 0)}>
            {token.text}
          </button>
        ))}
        {!pool.length && <span className="sx-order-done"><Check size={15} strokeWidth={3} aria-hidden="true" /> Tous les mots sont placés.</span>}
      </div>
      <div className="sx-order-foot">
        <small id={hintId}>{placed.length} / {tokens.length} mots placés<span className="sx-order-keys"> · Clavier : Entrée place ou retire un mot, les flèches le déplacent.</span></small>
        {placed.length > 0 && !locked && (
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => commit([], 'Phrase effacée : tous les mots sont revenus.')}>
            <Eraser size={15} aria-hidden="true" /> Tout retirer
          </button>
        )}
      </div>
      <p className="sr-only" aria-live="polite">{announce}</p>
      {drag && createPortal(
        <span ref={ghost} className="sx-token sx-ghost" aria-hidden="true" lang="de" style={{ width: drag.width, height: drag.height }}>{texts.get(drag.id)}</span>,
        document.body,
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------------------------------------------------
// Associations
// ---------------------------------------------------------------------------------------------------------------------

/**
 * Deux colonnes : on touche un élément d'un côté puis son partenaire de l'autre ; chaque paire prend une couleur et un
 * numéro. Toucher un élément déjà associé défait la paire et le sélectionne pour en former une autre. Échap annule.
 */
export function MatchField({ question, value, onChange, locked = false }: {
  question: MatchQuestionView; value: MatchAnswer | undefined; onChange: (answer: MatchAnswer) => void; locked?: boolean;
}) {
  const pairs = value?.pairs ?? {};
  const [selected, setSelected] = useState<{ side: 'left' | 'right'; id: string } | null>(null);
  const [announce, setAnnounce] = useState('');
  const helpId = useId();
  const leftIndex = new Map(question.left.map((item, index) => [item.id, index]));
  const text = (side: 'left' | 'right', id: string) => (side === 'left' ? question.left : question.right).find((item) => item.id === id)?.text ?? '';
  const ownerOf = (rightId: string) => question.left.find((item) => pairs[item.id] === rightId)?.id;

  function write(next: Record<string, string>) {
    onChange({ pairs: next });
  }
  function link(left: string, right: string) {
    const next: Record<string, string> = {};
    for (const item of question.left) {
      if (item.id !== left && pairs[item.id] && pairs[item.id] !== right) next[item.id] = pairs[item.id];
    }
    next[left] = right;
    write(next);
    setSelected(null);
    const done = Object.keys(next).length;
    setAnnounce(`« ${text('left', left)} » associé à « ${text('right', right)} ». ${done} association${done > 1 ? 's' : ''} sur ${question.left.length}.`);
  }
  function unlink(left: string) {
    const next = { ...pairs };
    delete next[left];
    write(next);
  }
  function pick(side: 'left' | 'right', id: string) {
    if (locked) return;
    if (selected && selected.side !== side) {
      if (side === 'left') link(id, selected.id); else link(selected.id, id);
      return;
    }
    if (selected?.id === id) {
      setSelected(null);
      setAnnounce('Sélection annulée.');
      return;
    }
    const owner = side === 'left' ? (pairs[id] ? id : undefined) : ownerOf(id);
    if (owner) unlink(owner);
    setSelected({ side, id });
    setAnnounce(`${owner ? 'Association défaite. ' : ''}« ${text(side, id)} » sélectionné : choisissez son partenaire dans l’autre colonne.`);
  }

  const column = (side: 'left' | 'right') => (side === 'left' ? question.left : question.right).map((item) => {
    const partner = side === 'left' ? pairs[item.id] : ownerOf(item.id);
    const pairIndex = side === 'left' ? leftIndex.get(item.id) ?? 0 : partner ? leftIndex.get(partner) : undefined;
    const isSelected = selected?.side === side && selected.id === item.id;
    const state = partner ? `associé à « ${text(side === 'left' ? 'right' : 'left', partner)} »` : 'à associer';
    return (
      <li key={item.id}>
        <button type="button" className={`sx-match-item is-${side}${partner ? ' is-paired' : ''}${isSelected ? ' is-selected' : ''}`}
          style={pairIndex !== undefined ? { ['--pair' as string]: `var(--pair-${pairIndex % 8})` } : undefined}
          aria-pressed={isSelected} aria-label={`${item.text}, ${state}`} aria-describedby={helpId} disabled={locked}
          onClick={() => pick(side, item.id)}>
          <span className={`sx-match-badge${side === 'right' && !partner ? ' is-free' : ''}`} aria-hidden="true">
            {pairIndex !== undefined ? pairIndex + 1 : ''}
          </span>
          <span className="sx-match-text">{item.text}</span>
        </button>
      </li>
    );
  });

  const done = question.left.filter((item) => pairs[item.id]).length;
  return (
    <div className={`sx-match${selected ? ` has-selection picks-${selected.side === 'left' ? 'right' : 'left'}` : ''}`}
      onKeyDown={(event) => { if (event.key === 'Escape' && selected) { event.stopPropagation(); setSelected(null); setAnnounce('Sélection annulée.'); } }}>
      <div className="sx-match-cols">
        <ul className="sx-match-col is-left" aria-label="Éléments à associer">{column('left')}</ul>
        <ul className="sx-match-col is-right" aria-label="Partenaires possibles">{column('right')}</ul>
      </div>
      <p className="sx-match-help" id={helpId}>
        <span>{done} / {question.left.length} associations</span>
        <span className="sx-match-tip">{selected ? 'Choisissez maintenant son partenaire dans l’autre colonne.' : 'Touchez un élément, puis son partenaire. Touchez une paire pour la défaire.'}</span>
      </p>
      <p className="sr-only" aria-live="polite">{announce}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------------------------------------------------
// Dictée
// ---------------------------------------------------------------------------------------------------------------------

/** Zone d'écriture d'une dictée (le lecteur audio est le support de la question, affiché au-dessus). */
export function DictationField({ question, value, onChange, locked = false }: {
  question: DictationQuestionView; value: DictationAnswer | undefined; onChange: (answer: DictationAnswer) => void; locked?: boolean;
}) {
  const text = value?.text ?? '';
  const words = countWords(text);
  const id = useId();
  return (
    <GermanKeyboardScope disabled={locked} className="sx-dictation">
      <label className="sx-dictation-label" htmlFor={id}>Ce que vous entendez</label>
      <textarea id={id} className="sx-dictation-input" value={text} rows={2} maxLength={exerciseLimits.textChars} disabled={locked} lang="de"
        placeholder="Écrivez la phrase entendue…" spellCheck={false} autoComplete="off" autoCorrect="off" autoCapitalize="sentences" enterKeyHint="done"
        onChange={(event) => onChange({ text: event.target.value.replace(/\s*\n\s*/g, ' ') })}
        onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); focusNextField(event.currentTarget); } }} />
      <p className="sx-dictation-meta">
        {question.wordCount ? <span>La phrase compte {question.wordCount} mots.</span> : <span>Réécoutez autant de fois que nécessaire.</span>}
        <span className={question.wordCount && words === question.wordCount ? 'is-match' : undefined}>{words} mot{words > 1 ? 's' : ''} écrit{words > 1 ? 's' : ''}</span>
      </p>
    </GermanKeyboardScope>
  );
}
