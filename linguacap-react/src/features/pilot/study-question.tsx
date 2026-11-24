/**
 * Questions du mode étude (exercices de séance, bibliothèque et diagnostic) : carte numérotée commune à tous les types
 * (`QuestionFrame`) et question à choix (`QuestionCard`), choix en tuiles.
 * Chaque choix reste un bouton radio natif dont le nom accessible est le texte du choix ; l'image d'un choix
 * illustré fait partie de la tuile (un clic dessus sélectionne la réponse), son enregistrement reste à côté.
 * Niveaux B : la consigne porte sa traduction (` [fr] `, affichée dessous) ou une aide repliée (` [fr?] `), voir bilingual.tsx.
 */
import { useRef } from 'react';
import type { ReactNode, Ref } from 'react';
import { AlertCircle, Check } from 'lucide-react';
import { BilingualText } from './bilingual';
import './learner-session.css';

export interface ChoiceExtra { label?: string; picture?: ReactNode; audio?: ReactNode }

/**
 * Carte d'une question : numéro (coché une fois la réponse prête), consigne, type facultatif (« Dictée »…), supports,
 * saisie propre au type et rappel si la question est restée sans réponse à la remise.
 */
export function QuestionFrame({ index, prompt, tag, answered = false, locked = false, missing = false, missingText = 'Choisissez une réponse.',
  media, children, cardRef, className = '' }: {
  index: number;
  prompt: string;
  tag?: ReactNode;
  answered?: boolean;
  locked?: boolean;
  missing?: boolean;
  missingText?: string;
  media?: ReactNode;
  children: ReactNode;
  cardRef?: Ref<HTMLFieldSetElement>;
  className?: string;
}) {
  return (
    <fieldset ref={cardRef} className={`study-question${missing ? ' is-missing' : ''}${answered ? ' is-answered' : ''}${locked ? ' is-locked' : ''} ${className}`.trim()}>
      <legend className="study-question-head">
        <span className="study-question-num" aria-hidden="true">{answered && !locked ? <Check size={15} strokeWidth={3} /> : index + 1}</span>
        <span className="sr-only">Question {index + 1} : </span>
        <span className="study-question-prompt"><BilingualText text={prompt} /></span>
        {tag && <span className="study-question-tag">{tag}</span>}
      </legend>
      {media && <div className="study-question-media">{media}</div>}
      {children}
      {missing && <p className="study-question-missing"><AlertCircle size={15} aria-hidden="true" /> {missingText}</p>}
    </fieldset>
  );
}

export function QuestionCard({ index, prompt, name, options, value, onChoose, locked = false, missing = false, media, extras, cardRef, tag }: {
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
  tag?: ReactNode;
}) {
  const pointer = useRef(false);
  const visual = options.some((option) => extras?.(option.id)?.picture);
  const short = !visual && options.every((option) => (option.text ?? '').trim().length <= 30);
  return (
    <QuestionFrame index={index} prompt={prompt} tag={tag} answered={Boolean(value)} locked={locked} missing={missing} media={media} cardRef={cardRef}>
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
    </QuestionFrame>
  );
}
