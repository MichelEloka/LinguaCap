/**
 * Fil des sept étapes de l'accueil : pastilles reliées sur grand écran (les étapes terminées restent cliquables),
 * « Étape 3 sur 7 » et barre segmentée sur petit écran.
 */
import { Check, Lock, Minus } from 'lucide-react';
import { onboardingStepLabels, type OnboardingStep, type OnboardingStepId } from '../../integration/v2';

export type StepVisual = OnboardingStep['status'];

export interface StepperItem { id: OnboardingStepId; status: StepVisual; reachable: boolean }

export function OnboardingStepper({ items, current, onSelect }: {
  items: StepperItem[]; current: OnboardingStepId; onSelect: (id: OnboardingStepId) => void;
}) {
  const index = Math.max(0, items.findIndex((item) => item.id === current));
  const done = items.filter((item) => item.status === 'done' || item.status === 'skipped').length;
  const progress = items.length > 1 ? (index / (items.length - 1)) * 100 : 0;
  return (
    <nav className="obs" aria-label="Étapes de l’accueil">
      <div className="obs-compact" aria-hidden="true">
        <span className="obs-compact-count">Étape {index + 1} sur {items.length}</span>
        <strong>{onboardingStepLabels[current]}</strong>
        <span className="obs-compact-bar">
          {items.map((item, position) => (
            <i key={item.id} className={position < index || item.status === 'done' ? 'is-done' : position === index ? 'is-current' : undefined} />
          ))}
        </span>
      </div>
      <ol className="obs-track" style={{ ['--obs-progress' as string]: progress }}>
        {items.map((item, position) => {
          const isCurrent = item.id === current;
          const finished = item.status === 'done' || item.status === 'skipped';
          const state = isCurrent ? 'current' : finished ? 'done' : item.status === 'blocked' ? 'blocked' : 'todo';
          const mark = state === 'done' ? (item.status === 'skipped' ? <Minus size={15} strokeWidth={3} /> : <Check size={15} strokeWidth={3} />)
            : state === 'blocked' ? <Lock size={14} /> : position + 1;
          const label = `${onboardingStepLabels[item.id]}${finished ? ', terminée' : state === 'blocked' ? ', bloquée' : ''}`;
          return (
            <li key={item.id} className={`obs-step is-${state}`}>
              {item.reachable && !isCurrent ? (
                <button type="button" onClick={() => onSelect(item.id)} aria-label={`Revenir à l’étape ${label}`}>
                  <span className="obs-dot" aria-hidden="true">{mark}</span>
                  <span className="obs-label" aria-hidden="true">{onboardingStepLabels[item.id]}</span>
                </button>
              ) : (
                <span aria-current={isCurrent ? 'step' : undefined}>
                  <span className="obs-dot" aria-hidden="true">{mark}</span>
                  <span className="obs-label">{onboardingStepLabels[item.id]}</span>
                  {!isCurrent && <span className="sr-only">{finished ? ', terminée' : ', à venir'}</span>}
                </span>
              )}
            </li>
          );
        })}
      </ol>
      <span className="sr-only">{done} étape{done > 1 ? 's' : ''} terminée{done > 1 ? 's' : ''} sur {items.length}</span>
    </nav>
  );
}
