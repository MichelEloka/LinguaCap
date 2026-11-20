/** Petits composants de l'éditeur de parcours : sections repliables, puces à cocher, actions d'icône, texte avec aperçu. */
import { useId, useState, type ReactNode } from 'react';
import { ArrowDown, ArrowUp, ChevronDown, Trash2, type LucideIcon } from 'lucide-react';
import { Dialog } from '../../components/ui';
import { Segmented } from '../../design/kit';
import { LessonContent } from './LessonContent';

/** Bloc repliable dont l'état initial ne change plus ensuite (la saisie ne le referme pas). */
export function Disclosure({ defaultOpen, className, path, children }: { defaultOpen: boolean; className: string; path?: string; children: ReactNode }) {
  const [open] = useState(defaultOpen);
  return <details className={className} open={open} data-path={path}>{children}</details>;
}

/** Carte repliable (le contenu reste dans la page : recherche et contrôles de publication le retrouvent). */
export function Collapsible({ title, icon, meta, defaultOpen = false, path, children, tone }: {
  title: string; icon?: ReactNode; meta?: ReactNode; defaultOpen?: boolean; path?: string; children: ReactNode; tone?: 'warning';
}) {
  return (
    <Disclosure className={`ed-collapsible${tone ? ` is-${tone}` : ''}`} defaultOpen={defaultOpen} path={path}>
      <summary>
        {icon && <span className="ed-collapsible-icon" aria-hidden="true">{icon}</span>}
        <h3>{title}</h3>
        {meta && <span className="ed-collapsible-meta">{meta}</span>}
        <ChevronDown className="ed-collapsible-chevron" size={18} aria-hidden="true" />
      </summary>
      <div className="ed-collapsible-body">{children}</div>
    </Disclosure>
  );
}

export function IconAction({ label, icon: Icon, onClick, disabled, tone, pressed }: {
  label: string; icon: LucideIcon; onClick: () => void; disabled?: boolean; tone?: 'danger'; pressed?: boolean;
}) {
  return (
    <button type="button" className={`icon-button ed-icon-action${tone ? ` is-${tone}` : ''}`} onClick={onClick} disabled={disabled}
      aria-label={label} title={label} aria-pressed={pressed}>
      <Icon size={16} aria-hidden="true" />
    </button>
  );
}

/** Monter, descendre et supprimer un élément d'une liste ordonnée. */
export function MoveTools({ index, count, label, onMove, onRemove, disabled }: {
  index: number; count: number; label: string; onMove: (offset: number) => void; onRemove: () => void; disabled?: boolean;
}) {
  return (
    <span className="ed-tools">
      <IconAction icon={ArrowUp} label={`Monter ${label}`} onClick={() => onMove(-1)} disabled={disabled || index === 0} />
      <IconAction icon={ArrowDown} label={`Descendre ${label}`} onClick={() => onMove(1)} disabled={disabled || index === count - 1} />
      <IconAction icon={Trash2} tone="danger" label={`Supprimer ${label}`} onClick={onRemove} disabled={disabled} />
    </span>
  );
}

/** Cases à cocher présentées en puces (compétences, prérequis). */
export function ToggleChips<T extends string>({ legend, options, value, onChange, disabled, path, legendHidden = false }: {
  legend: string; options: { id: T; label: string; icon?: ReactNode }[]; value: T[]; onChange: (value: T[]) => void; disabled?: boolean; path?: string;
  legendHidden?: boolean;
}) {
  return (
    <fieldset className="ed-toggle-chips" disabled={disabled} data-path={path}>
      <legend className={legendHidden ? 'sr-only' : undefined}>{legend}</legend>
      <div>
        {options.map((option) => (
          <label key={option.id} className="ed-toggle-chip">
            <input type="checkbox" checked={value.includes(option.id)}
              onChange={(event) => onChange(event.target.checked ? [...value, option.id] : value.filter((entry) => entry !== option.id))} />
            {option.icon}{option.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

/** Texte pédagogique : saisie brute ou aperçu mis en forme comme chez l'élève. */
export function TextWithPreview({ label, value, onChange, rows = 6, readOnly, disabled, maxLength, lang, path, placeholder }: {
  label: string; value: string; onChange: (value: string) => void; rows?: number; readOnly: boolean; disabled?: boolean;
  maxLength?: number; lang?: string; path?: string; placeholder?: string;
}) {
  const [mode, setMode] = useState<'edit' | 'preview'>(readOnly ? 'preview' : 'edit');
  const id = useId();
  const shown = readOnly ? 'preview' : mode;
  return (
    <div className="ed-text" data-path={path}>
      <div className="ed-text-head">
        <span id={`${id}-label`} className="ed-text-label">{label}</span>
        {!readOnly && <Segmented label={`Affichage : ${label}`} value={mode} onChange={setMode}
          options={[{ value: 'edit', label: 'Écrire' }, { value: 'preview', label: 'Aperçu' }]} />}
      </div>
      {shown === 'edit'
        ? <textarea aria-labelledby={`${id}-label`} rows={rows} value={value} maxLength={maxLength} lang={lang} disabled={disabled}
            placeholder={placeholder} onChange={(event) => onChange(event.target.value)} />
        : <div className="ed-text-preview">{value.trim() ? <LessonContent text={value} compact /> : <p className="ed-muted">Aucun texte pour l’instant.</p>}</div>}
    </div>
  );
}

/** Confirmation courte avant une action importante. */
export function ConfirmDialog({ title, children, confirm, tone = 'primary', onConfirm, onClose }: {
  title: string; children: ReactNode; confirm: string; tone?: 'primary' | 'danger'; onConfirm: () => void; onClose: () => void;
}) {
  return (
    <Dialog title={title} onClose={onClose}>
      <div className="ed-confirm">
        <div className="ed-confirm-text">{children}</div>
        <div className="ed-confirm-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose}>Annuler</button>
          <button type="button" className={`btn ${tone === 'danger' ? 'btn-danger' : 'btn-primary'}`} onClick={() => { onConfirm(); onClose(); }}>{confirm}</button>
        </div>
      </div>
    </Dialog>
  );
}
