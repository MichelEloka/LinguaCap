/**
 * Question à choix du mode étude (exercices de séance et diagnostic) : carte numérotée, choix en tuiles.
 * Chaque choix reste un bouton radio natif dont le nom accessible est le texte du choix ; l'image d'un choix
 * illustré fait partie de la tuile (un clic dessus sélectionne la réponse), son enregistrement reste à côté.
 */
import { useRef } from 'react';
import type { ReactNode, Ref } from 'react';
import { AlertCircle, Check } from 'lucide-react';
import './learner-session.css';

export interface ChoiceExtra { label?: string; picture?: ReactNode; audio?: ReactNode }

export function QuestionCard({ index, prompt, name, options, value, onChoose, locked = false, missing = false, media, extras, cardRef }: {
  index: number;
  prompt: string;
  name: string;
  options: { id: string; text: string }[];
  value?: string;
  /** viaPointer : la réponse a été choisie au toucher ou à la souris (et non avec les flèches du clavier). */
  onChoose: (optionId: string, viaPointer: boolean) => void;
  locked?: boolean;
  missing?: boolean;
  media?: ReactNode;
  extras?: (optionId: string) => ChoiceExtra | undefined;
  cardRef?: Ref<HTMLFieldSetElement>;
}) {
  const pointer = useRef(false);
  const visual = options.some((option) => extras?.(option.id)?.picture);
  const short = !visual && options.every((option) => (option.text ?? '').trim().length <= 30);
  return (
    <fieldset ref={cardRef} className={`study-question${missing ? ' is-missing' : ''}${value ? ' is-answered' : ''}${locked ? ' is-locked' : ''}`}>
      <legend className="study-question-head">
        <span className="study-question-num" aria-hidden="true">{value && !locked ? <Check size={15} strokeWidth={3} /> : index + 1}</span>
        <span className="sr-only">Question {index + 1} : </span>
        <span className="study-question-prompt">{prompt}</span>
      </legend>
      {media && <div className="study-question-media">{media}</div>}
      <div className={`study-choices${visual ? ' is-visual' : short ? ' is-short' : ''}`}>
        {options.map((option, position) => {
          const extra = extras?.(option.id);
          const label = option.text?.trim() || extra?.label || `Option ${position + 1}`;
          const checked = value === option.id;
          return (
            <div key={option.id} className={`study-choice${checked ? ' is-checked' : ''}`}>
              <label className="study-choice-hit" onPointerDown={() => { pointer.current = true; }}>
                <input className="study-choice-input" type="radio" name={name} value={option.id} required checked={checked} disabled={locked}
                  aria-label={label} onKeyDown={() => { pointer.current = false; }}
                  onChange={() => { onChoose(option.id, pointer.current); pointer.current = false; }} />
                {extra?.picture && <span className="study-choice-picture">{extra.picture}</span>}
                <span className="study-choice-row">
                  <span className="study-choice-key" aria-hidden="true">{String.fromCharCode(65 + position)}</span>
                  <span className="study-choice-text">{label}</span>
                  {checked && locked && <span className="study-choice-tag" aria-hidden="true">Votre réponse</span>}
                  <span className="study-choice-tick" aria-hidden="true"><Check size={14} strokeWidth={3} /></span>
                </span>
              </label>
              {extra?.audio && <div className="study-choice-audio">{extra.audio}</div>}
            </div>
          );
        })}
      </div>
      {missing && <p className="study-question-missing"><AlertCircle size={15} aria-hidden="true" /> Choisissez une réponse.</p>}
    </fieldset>
  );
}
