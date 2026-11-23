/** Cadre animé des accueils « Le souffle » : voir README.md dans ce dossier. */
export { JourneyShell, JourneyStage, defaultJourneyWords, type JourneyShellProps } from './JourneyShell';
export { JourneyPath, type JourneyPathProps, type JourneyStep, type JourneyStepStatus } from './JourneyPath';
export { JourneyQuestion, type JourneyDirection, type JourneyQuestionProps } from './JourneyQuestion';
export {
  ChoiceCard, ChoiceGrid,
  type ChoiceCardProps, type ChoiceGridMultipleProps, type ChoiceGridProps, type ChoiceGridSingleProps, type ChoiceLayout, type ChoiceOption,
  type ChoiceTagTone,
} from './ChoiceGrid';
export { JourneyActions, type JourneyActionsProps } from './JourneyActions';
export { JourneyCelebration, type JourneyCelebrationItem, type JourneyCelebrationProps } from './JourneyCelebration';
export { JourneyMark } from './JourneyMark';
export { prefersReducedMotion, useReducedMotion } from './motion';
