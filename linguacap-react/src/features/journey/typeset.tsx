import type { ReactNode } from 'react';

/**
 * Typographie des titres : un mot composé (« enseignez-vous ») ou un mot suivi de sa ponctuation haute (« prêt ? »)
 * ne se coupe jamais en fin de ligne. Le texte (donc le nom accessible) reste identique.
 */
export function typeset(text: ReactNode): ReactNode {
  if (typeof text !== 'string') return text;
  const parts = text.split(/(\S+-\S+(?: [?!:;»])?|\S+ [?!:;»])/);
  return parts.length === 1 ? text : parts.map((part, index) => (index % 2 ? <span key={index} className="jq-keep">{part}</span> : part));
}
