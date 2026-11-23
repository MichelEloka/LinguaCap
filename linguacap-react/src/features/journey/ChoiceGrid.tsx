import { useEffect, useId, useRef, type CSSProperties, type ReactNode } from 'react';
import { Check } from 'lucide-react';
import { isTypingTarget } from './motion';
import './journey-scene.css';

export type ChoiceTagTone = 'success' | 'brand' | 'neutral';
export type ChoiceLayout = 'row' | 'tile';

/** Une option de `ChoiceGrid`. */
export interface ChoiceOption<Value extends string> {
  value: Value;
  /** Début du nom accessible : la recette s'appuie sur ce texte. */
  title: ReactNode;
  description?: ReactNode;
  /** Icône décorative dans sa tuile. */
  icon?: ReactNode;
  /** Pastille (« Conseillé », « Bientôt »…). */
  tag?: ReactNode;
  tagTone?: ChoiceTagTone;
  disabled?: boolean;
}

export interface ChoiceCardProps {
  type: 'radio' | 'checkbox';
  name?: string;
  value?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  tag?: ReactNode;
  tagTone?: ChoiceTagTone;
  disabled?: boolean;
  /** Chiffre du raccourci clavier, affiché discrètement avec une souris. */
  shortcut?: number;
  /** `row` : icône, texte et coche en ligne ; `tile` : carte verticale (grilles de 3 ou 4). */
  layout?: ChoiceLayout;
}

/**
 * Grande carte de choix : un vrai bouton radio ou une vraie case à cocher (invisible, mais couvrant toute la carte),
 * donc nom accessible = texte de la carte, flèches et Espace natifs. Survol qui soulève, sélection lumineuse, coche qui « pop ».
 */
export function ChoiceCard({
  type, name, value, checked, onChange, title, description, icon, tag, tagTone = 'success', disabled = false, shortcut, layout = 'row',
}: ChoiceCardProps) {
  return (
    <label className={`jc is-${layout}${checked ? ' is-checked' : ''}${disabled ? ' is-disabled' : ''}`}>
      <input className="jc-input" type={type} name={name} value={value} checked={checked} disabled={disabled}
        onChange={(event) => onChange(event.target.checked)} />
      {icon && <span className="jc-icon" aria-hidden="true">{icon}</span>}
      <span className="jc-text">
        <span className="jc-title">{title}</span>
        {description && <span className="jc-description">{description}</span>}
      </span>
      {tag && <span className={`jc-tag is-${tagTone}`}>{tag}</span>}
      {shortcut !== undefined && <kbd className="jc-key" aria-hidden="true">{shortcut}</kbd>}
      <span className={`jc-check is-${type}`} aria-hidden="true"><Check size={14} strokeWidth={3.2} /></span>
    </label>
  );
}

interface ChoiceGridBase<Value extends string> {
  /** Légende du groupe (lue par les lecteurs d'écran). */
  legend: string;
  /** Masque visuellement la légende quand le titre de la question la porte déjà. */
  hideLegend?: boolean;
  options: readonly ChoiceOption<Value>[];
  /** Colonnes sur bureau (une colonne sur mobile pour `row`, deux pour `tile`). */
  columns?: 1 | 2 | 3 | 4;
  layout?: ChoiceLayout;
  /** Touches 1 à 9 pour choisir (désactivées pendant une saisie). Un seul groupe à raccourcis par écran. */
  shortcuts?: boolean;
  className?: string;
}

export interface ChoiceGridSingleProps<Value extends string> extends ChoiceGridBase<Value> {
  multiple?: false;
  value: Value | null;
  onChange: (value: Value) => void;
}

export interface ChoiceGridMultipleProps<Value extends string> extends ChoiceGridBase<Value> {
  multiple: true;
  value: readonly Value[];
  onChange: (values: Value[]) => void;
}

export type ChoiceGridProps<Value extends string> = ChoiceGridSingleProps<Value> | ChoiceGridMultipleProps<Value>;

/** Groupe de `ChoiceCard` (radios ou cases à cocher) avec arrivée en cascade et raccourcis clavier. */
export function ChoiceGrid<Value extends string>(props: ChoiceGridProps<Value>) {
  const { legend, hideLegend = false, options, columns = 2, layout = 'row', shortcuts = true, className = '' } = props;
  const name = useId();
  const fieldset = useRef<HTMLFieldSetElement>(null);
  const selected: readonly Value[] = props.multiple ? props.value : props.value === null ? [] : [props.value];

  function change(value: Value, checked: boolean) {
    if (props.multiple) {
      props.onChange(options.map((option) => option.value).filter((item) => (item === value ? checked : props.value.includes(item))));
    } else if (checked) {
      props.onChange(value);
    }
  }

  useEffect(() => {
    if (!shortcuts) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || isTypingTarget(event.target)) return;
      const digit = /^(?:Digit|Numpad)([1-9])$/.exec(event.code)?.[1] ?? (/^[1-9]$/.test(event.key) ? event.key : '');
      if (!digit) return;
      const input = fieldset.current?.querySelectorAll<HTMLInputElement>('.jc-input')[Number(digit) - 1];
      if (!input || input.disabled) return;
      event.preventDefault();
      input.focus({ preventScroll: true });
      input.click();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [shortcuts]);

  return (
    <fieldset ref={fieldset} className={`jcg${className ? ` ${className}` : ''}`}>
      <legend className={hideLegend ? 'sr-only' : 'jcg-legend'}>{legend}</legend>
      <div className={`jcg-grid is-${layout} is-cols-${columns} lc-stagger`} style={{ '--jc-columns': columns } as CSSProperties}>
        {options.map((option, index) => (
          <ChoiceCard key={option.value} type={props.multiple ? 'checkbox' : 'radio'} name={name} value={option.value}
            checked={selected.includes(option.value)} onChange={(checked) => change(option.value, checked)}
            title={option.title} description={option.description} icon={option.icon} tag={option.tag} tagTone={option.tagTone}
            disabled={option.disabled} layout={layout} shortcut={shortcuts && index < 9 ? index + 1 : undefined} />
        ))}
      </div>
    </fieldset>
  );
}
