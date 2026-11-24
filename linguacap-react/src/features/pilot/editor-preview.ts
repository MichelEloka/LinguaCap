/**
 * Vue élève d'une question de brouillon (aperçu de l'éditeur des versions et des films) : comme la sert le catalogue,
 * sans corrigé, jetons et éléments à associer dans un ordre mélangé stable, nombre de mots d'une dictée s'il est affiché.
 */
import {
  countWords, questionTypeOf, type DictationSpec, type FillSpec, type MatchSpec, type OrderSpec, type QuestionItem, type QuestionView,
  type SpeakSpec,
} from '../../integration/v4';
import { withBlankDefaults, type DraftQuestion } from './editor-forms';

/** Ordre stable « mélangé » pour l'aperçu (jamais celui de la solution quand c'est possible). */
function shuffled<T extends QuestionItem>(items: T[], seed: string, solution: string[]): T[] {
  const hash = (value: string) => [...value].reduce((total, char) => (Math.imul(total, 31) + char.charCodeAt(0)) >>> 0, 7);
  const ordered = [...items].sort((a, b) => hash(`${seed}|${a.id}`) - hash(`${seed}|${b.id}`));
  if (ordered.length > 1 && ordered.map((item) => item.text).join('\u0000') === solution.join('\u0000')) ordered.push(ordered.shift() as T);
  return ordered;
}

/**
 * Vue élève d'une question du brouillon, comme la sert le catalogue : sans corrigé, jetons et éléments à associer
 * dans un ordre mélangé, nombre de mots d'une dictée seulement s'il est affiché.
 */
export function previewQuestion(question: DraftQuestion, activityId: string): QuestionView {
  const type = questionTypeOf(question);
  const base = { id: question.id, prompt: question.prompt };
  switch (type) {
    case 'fill': {
      const spec = (question.spec ?? { text: '', blanks: [] }) as FillSpec;
      return { ...base, type, text: spec.text, blanks: spec.blanks.map(withBlankDefaults).map((blank) => ({ id: blank.id, size: blank.size, hint: blank.hint })) };
    }
    case 'order': {
      const answer = ((question.spec ?? { answers: [[]] }) as OrderSpec).answers[0] ?? [];
      const tokens = answer.map((text, index) => ({ id: `k${index}`, text }));
      return { ...base, type, tokens: shuffled(tokens, `${activityId}|${question.id}`, answer) };
    }
    case 'match': {
      const pairs = ((question.spec ?? { pairs: [] }) as MatchSpec).pairs;
      const right = pairs.map((pair, index) => ({ id: `r${index}`, text: pair.right }));
      return { ...base, type, left: pairs.map((pair, index) => ({ id: `l${index}`, text: pair.left })), right: shuffled(right, `${activityId}|${question.id}`, pairs.map((pair) => pair.right)) };
    }
    case 'dictation': {
      const spec = (question.spec ?? { accept: [''], showWordCount: false }) as DictationSpec;
      return { ...base, type, wordCount: spec.showWordCount ? countWords(spec.accept[0] ?? '') : null };
    }
    case 'speak': {
      const spec = (question.spec ?? { text: '', accept: [], threshold: 80 }) as SpeakSpec;
      return { ...base, type, text: spec.text, threshold: spec.threshold };
    }
    default:
      return { ...base, type: 'choice', options: question.options.map((option) => ({ id: option.id, text: option.label })) };
  }
}
