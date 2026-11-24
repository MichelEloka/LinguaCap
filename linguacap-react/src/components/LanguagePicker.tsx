import { useId, type ReactNode } from 'react';
import { Check, Clock3, Globe2, Lock } from 'lucide-react';
import { languages as staticLanguages, languageStatusLabels, type LanguageStatus } from '../domain/languages';
import './language-picker.css';

/**
 * Langue affichable : la réponse de GET /languages (niveaux du catalogue) ou la liste statique (`domain/languages.ts`, sans
 * niveau en mode API : la carte dit alors seulement « Disponible »).
 */
export interface PickerLanguage {
  id: string;
  name: string;
  nativeName: string;
  status: LanguageStatus;
  position?: number;
  /** Niveaux de la langue (codes de la démonstration, ou niveaux de GET /languages : seuls les publiés sont annoncés). */
  levels?: readonly (string | { code: string; published?: boolean; position?: number | null })[];
}

interface BaseProps {
  /** Intitulé du groupe (légende du fieldset). */
  label: string;
  /** Légende visuellement masquée quand l'écran porte déjà le titre (elle reste lue par les lecteurs d'écran). */
  hideLabel?: boolean;
  description?: ReactNode;
  /**
   * Langues proposées, de préférence celles du catalogue (`useLanguages`) pour annoncer leurs niveaux publiés
   * (défaut : liste statique, sans niveau en mode API). Rangées par `position` quand elle est fournie.
   */
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
  /** Fond clair (défaut, scène et formulaires) ou sombre (toile bleu nuit). */
  appearance?: 'light' | 'dark';
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

const countries: Readonly<Record<string, string>> = {
  de: 'de', en: 'gb', es: 'es', it: 'it', pt: 'pt', nl: 'nl', fr: 'fr',
  ar: 'sa', zh: 'cn', ja: 'jp', ru: 'ru', ko: 'kr', tr: 'tr', pl: 'pl',
};
const flags = import.meta.glob<string>('./flags/*.png', { eager: true, import: 'default', query: '?url' });

export function LanguageFlag({ languageId }: { languageId: string }) {
  const source = flags[`./flags/${countries[languageId]}.png`];
  return <span className="lgp-flag" aria-hidden="true">
    {source ? <img src={source} alt="" width={32} height={32} /> : <Globe2 size={22} />}
  </span>;
}

/**
 * Nom court affiché sur la carte (jamais coupé au milieu d'un mot) et seconde ligne : « Chinois » + « 中文 »,
 * « Français » + « Langue étrangère ». Le nom complet reste celui annoncé aux lecteurs d'écran.
 */
function displayNames(language: PickerLanguage) {
  const parenthesis = /^(.+?)\s*\((.+)\)\s*$/.exec(language.name);
  const foreign = /^(.+?)\s+(langue étrangère)$/i.exec(language.name);
  const short = parenthesis?.[1] ?? foreign?.[1] ?? language.name;
  const detail = parenthesis?.[2] ?? foreign?.[2];
  const native = language.nativeName.trim();
  const second = native && native.toLocaleLowerCase('fr') !== short.toLocaleLowerCase('fr') ? native
    : detail ? detail.charAt(0).toLocaleUpperCase('fr') + detail.slice(1) : native;
  return { short, second, secondIsNative: second === native };
}

/** Niveaux ouverts d'une langue, dans l'ordre du catalogue (`position`) quand il est connu. */
function openLevels(language: PickerLanguage) {
  return (language.levels ?? [])
    .map((level, index) => (typeof level === 'string' ? { code: level, published: true, order: index }
      : { code: level.code, published: level.published !== false, order: level.position ?? Infinity }))
    .filter((level) => level.published)
    .sort((a, b) => a.order - b.order)
    .map((level) => level.code);
}

/**
 * Choix de langue. Les langues ouvertes sont mises en avant (grande carte : drapeau, nom, nom natif, niveaux) ; les langues
 * « Bientôt » suivent, estompées, dans une grille compacte. Choix unique (boutons radio : flèches pour se déplacer) ou
 * multiple (cases à cocher : Tab puis Espace). Le nom accessible de chaque choix commence par le nom de la langue.
 */
export function LanguagePicker(props: LanguagePickerProps) {
  const { label, hideLabel = false, description, languages = staticLanguages, selectable, locked = false,
    lockedNote = 'Choisie par votre professeur', disabled = false, appearance = 'light', className = '' } = props;
  const groupName = useId();
  const descriptionId = useId();
  const noteId = useId();
  const selected = new Set(props.multiple ? props.value : props.value ? [props.value] : []);
  const ordered = [...languages].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
  const featured = ordered.filter((language) => language.status === 'available');
  const upcoming = ordered.filter((language) => language.status !== 'available');

  function toggle(languageId: string, checked: boolean) {
    if (props.multiple) {
      const next = ordered.map((language) => language.id)
        .filter((id) => (id === languageId ? checked : selected.has(id)));
      props.onChange(next);
    } else if (checked) {
      props.onChange(languageId);
    }
  }

  function option(language: PickerLanguage, hero: boolean) {
    const soon = language.status !== 'available';
    const allowed = !selectable || selectable.includes(language.id);
    const isSelected = selected.has(language.id);
    const unavailable = soon || !allowed || locked;
    const statusText = soon ? languageStatusLabels.coming_soon : !allowed ? 'Non proposée' : languageStatusLabels.available;
    const { short, second, secondIsNative } = displayNames(language);
    const levels = hero ? openLevels(language) : [];
    const spoken = `${language.name}${language.nativeName && language.nativeName !== language.name ? ` (${language.nativeName})` : ''}, ${statusText.toLowerCase()}`;
    return (
      <label key={language.id}
        className={`lgp-option${hero ? ' is-featured' : ''}${soon ? ' is-soon' : ''}${!allowed ? ' is-blocked' : ''}${isSelected ? ' is-selected' : ''}`}>
        <input className="lgp-input" type={props.multiple ? 'checkbox' : 'radio'} name={groupName} value={language.id}
          checked={isSelected} disabled={unavailable} aria-label={spoken}
          onChange={(event) => toggle(language.id, event.target.checked)} />
        <span className="lgp-card">
          <LanguageFlag languageId={language.id} />
          <span className="lgp-text">
            <span className="lgp-name">{short}</span>
            {second && <span className="lgp-native" lang={secondIsNative ? language.id : undefined} dir="auto">{second}</span>}
            {hero && allowed && (
              <span className="lgp-meta">
                {levels.length ? <>Parcours {levels.map((level) => <b key={level}>{level}</b>)}</> : statusText}
              </span>
            )}
          </span>
          {hero && <span className="lgp-watermark" aria-hidden="true" lang={language.id}>{language.nativeName}</span>}
          {isSelected ? (
            <span className="lgp-check" aria-hidden="true">{locked ? <Lock size={14} /> : <Check size={15} strokeWidth={3} />}</span>
          ) : hero ? (
            <span className={`lgp-status${!allowed ? ' is-soon' : ''}`} aria-hidden="true">{statusText}</span>
          ) : null}
        </span>
      </label>
    );
  }

  const describedBy = [description ? descriptionId : '', locked ? noteId : ''].filter(Boolean).join(' ') || undefined;

  return (
    <fieldset className={`lgp is-${appearance}${locked ? ' is-locked' : ''}${className ? ` ${className}` : ''}`}
      aria-describedby={describedBy} disabled={disabled}>
      <legend className={hideLabel ? 'lgp-legend lgp-hidden' : 'lgp-legend'}>{label}</legend>
      {description && <p className="lgp-description" id={descriptionId}>{description}</p>}
      {locked && (
        <p className="lgp-note" id={noteId}><Lock size={15} aria-hidden="true" /> {lockedNote}</p>
      )}
      {featured.length > 0 && <div className="lgp-featured lc-stagger">{featured.map((language) => option(language, true))}</div>}
      {upcoming.length > 0 && (
        <div className="lgp-upcoming">
          <p className="lgp-group"><Clock3 size={14} aria-hidden="true" /> Bientôt sur LinguaCap <span>{upcoming.length}</span></p>
          <div className="lgp-grid lc-stagger">{upcoming.map((language) => option(language, false))}</div>
        </div>
      )}
    </fieldset>
  );
}
