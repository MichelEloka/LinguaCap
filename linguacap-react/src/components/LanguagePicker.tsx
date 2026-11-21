import { useId, type ReactNode } from 'react';
import { Check, Clock3, Lock } from 'lucide-react';
import { languages as staticLanguages, languageStatusLabels, type LanguageStatus } from '../domain/languages';
import './language-picker.css';

/** Langue affichable : la liste statique (`domain/languages.ts`) ou la réponse de GET /languages conviennent. */
export interface PickerLanguage {
  id: string;
  name: string;
  nativeName: string;
  status: LanguageStatus;
  position?: number;
}

interface BaseProps {
  /** Intitulé du groupe (légende du fieldset). */
  label: string;
  /** Légende visuellement masquée quand l'écran porte déjà le titre (elle reste lue par les lecteurs d'écran). */
  hideLabel?: boolean;
  description?: ReactNode;
  /** Langues proposées (défaut : liste statique). Rangées par `position` quand elle est fournie. */
  languages?: readonly PickerLanguage[];
  /**
   * Restreint les langues sélectionnables (par exemple les langues du professeur pour une invitation).
   * Les autres langues disponibles sont affichées grisées.
   */
  selectable?: readonly string[];
  /** Choix figé (élève suivi) : la sélection est affichée, rien n'est modifiable. */
  locked?: boolean;
  /** Mention affichée quand le choix est figé. */
  lockedNote?: string;
  disabled?: boolean;
  className?: string;
}

interface SingleProps extends BaseProps {
  multiple?: false;
  value: string | null;
  onChange: (languageId: string) => void;
}

interface MultipleProps extends BaseProps {
  multiple: true;
  value: readonly string[];
  onChange: (languageIds: string[]) => void;
}

export type LanguagePickerProps = SingleProps | MultipleProps;

function monogram(id: string) {
  return id.slice(0, 2).toUpperCase();
}

/**
 * Grille de langues. Choix unique (boutons radio : flèches pour se déplacer, la sélection suit le focus) ou
 * choix multiple (cases à cocher : Tab puis Espace). Les langues « Bientôt » sont grisées et ne peuvent pas être choisies.
 */
export function LanguagePicker(props: LanguagePickerProps) {
  const { label, hideLabel = false, description, languages = staticLanguages, selectable, locked = false,
    lockedNote = 'Choisie par votre professeur', disabled = false, className = '' } = props;
  const groupName = useId();
  const descriptionId = useId();
  const noteId = useId();
  const selected = new Set(props.multiple ? props.value : props.value ? [props.value] : []);
  const ordered = [...languages].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));

  function toggle(languageId: string, checked: boolean) {
    if (props.multiple) {
      const next = ordered.map((language) => language.id)
        .filter((id) => (id === languageId ? checked : selected.has(id)));
      props.onChange(next);
    } else if (checked) {
      props.onChange(languageId);
    }
  }

  const describedBy = [description ? descriptionId : '', locked ? noteId : ''].filter(Boolean).join(' ') || undefined;

  return (
    <fieldset className={`lgp${locked ? ' is-locked' : ''}${className ? ` ${className}` : ''}`} aria-describedby={describedBy}
      disabled={disabled}>
      <legend className={hideLabel ? 'lgp-legend lgp-hidden' : 'lgp-legend'}>{label}</legend>
      {description && <p className="lgp-description" id={descriptionId}>{description}</p>}
      {locked && (
        <p className="lgp-note" id={noteId}><Lock size={15} aria-hidden="true" /> {lockedNote}</p>
      )}
      <div className="lgp-grid lc-stagger">
        {ordered.map((language) => {
          const soon = language.status !== 'available';
          const allowed = !selectable || selectable.includes(language.id);
          const isSelected = selected.has(language.id);
          const unavailable = soon || !allowed || locked;
          const statusText = soon ? languageStatusLabels.coming_soon : !allowed ? 'Non proposée' : languageStatusLabels.available;
          return (
            <label key={language.id} className={`lgp-option${soon ? ' is-soon' : ''}${isSelected ? ' is-selected' : ''}`}>
              <input className="lgp-input" type={props.multiple ? 'checkbox' : 'radio'} name={groupName} value={language.id}
                checked={isSelected} disabled={unavailable}
                onChange={(event) => toggle(language.id, event.target.checked)} />
              <span className="lgp-card">
                <span className="lgp-mono" aria-hidden="true">{monogram(language.id)}</span>
                <span className="lgp-text">
                  <span className="lgp-name">{language.name}</span>
                  <span className="lgp-native" lang={language.id} dir="auto">{language.nativeName}</span>
                </span>
                {isSelected ? (
                  <span className="lgp-check" aria-hidden="true">{locked ? <Lock size={14} /> : <Check size={15} strokeWidth={3} />}</span>
                ) : (
                  <span className={`lgp-status${soon || !allowed ? ' is-soon' : ''}`}>
                    {soon && <Clock3 size={12} aria-hidden="true" />}
                    {statusText}
                  </span>
                )}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
