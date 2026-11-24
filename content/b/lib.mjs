// Aides de rédaction des niveaux B (format 5). Contrat entre les lots : voir content/b/README.md
// et le plan « Cours B1 et B2 complets » (§2.1, §2.2, §3.1). Construit par infra/content/build-b.mjs.

// Consigne bilingue : allemand puis traduction affichée à côté (B1) ou aide repliée (B2).
export const bi = (de, fr) => `${de} [fr] ${fr}`;
export const aide = (de, fr) => `${de} [fr?] ${fr}`;

// Consignes standard (B1). À reprendre telles quelles chaque fois que possible.
export const C = {
  lesen: bi('Lesen Sie den Text. Beantworten Sie dann die Fragen.', 'Lisez le texte, puis répondez aux questions.'),
  hoeren: bi('Hören Sie zuerst einmal ganz. Lesen Sie dann die Fragen und hören Sie noch einmal.', 'Écoutez d’abord en entier. Lisez ensuite les questions, puis réécoutez.'),
  notizen: bi('Hören Sie und machen Sie Notizen: Ergänzen Sie die Lücken.', 'Écoutez et prenez des notes : complétez les trous.'),
  richtigFalsch: bi('Richtig, falsch oder steht nicht im Text?', 'Vrai, faux ou non mentionné dans le texte ?'),
  waehlen: bi('Wählen Sie die richtige Antwort.', 'Choisissez la bonne réponse.'),
  ergaenzen: bi('Ergänzen Sie.', 'Complétez.'),
  ordnen: bi('Bilden Sie einen Satz.', 'Remettez les mots dans l’ordre.'),
  zuordnen: bi('Ordnen Sie zu.', 'Associez.'),
  diktat: bi('Hören Sie und schreiben Sie den Satz.', 'Écoutez et écrivez la phrase.'),
  sprechen: bi('Hören Sie und sprechen Sie nach.', 'Écoutez, puis répétez à voix haute.'),
  reagieren: bi('Was passt? Wählen Sie die passende Reaktion.', 'Quelle réplique convient ?'),
};

// Constructeurs de questions. Les identifiants des options (a, b, c, d) suivent l'ordre donné :
// l'auteur varie lui-même la place de la bonne réponse.
export const choice = (id, prompt, options, explanation) => ({ id, type: 'choice', prompt, explanation,
  options: options.map(([label, correct = false], index) => ({ id: 'abcd'[index], label, correct })) });
export const fill = (id, prompt, text, blanks, explanation) => ({ id, type: 'fill', prompt, text, explanation,
  blanks: blanks.map((accept, index) => ({ id: String(index + 1), accept: [].concat(accept) })) });
export const order = (id, prompt, answers, explanation) => ({ id, type: 'order', prompt, answers, explanation });
export const match = (id, prompt, pairs, explanation) => ({ id, type: 'match', prompt, explanation, pairs: pairs.map(([left, right]) => ({ left, right })) });
export const dictation = (id, sentence, explanation, voice = 'sprecherin') => ({ id, type: 'dictation', prompt: C.diktat, accept: [].concat(sentence), voice, explanation });
export const speak = (id, text, explanation, accept = [text]) => ({ id, type: 'speak', prompt: C.sprechen, text, accept, explanation });

// Grilles standard des missions (20 points). À reprendre telles quelles ou à adapter dans chaque mission
// (même identifiants, libellé précisé pour la tâche) : la construction les recopie, elles ne sont jamais modifiées ici.
const frozen = (criteria) => Object.freeze(criteria.map((criterion) => Object.freeze({ ...criterion })));
export const GRIDS = Object.freeze({
  b1: Object.freeze({
    schreiben: frozen([
      { id: 'aufgabe', label: 'Tâche : tous les points sont traités, destinataire et registre (du / Sie) respectés', maxPoints: 5 },
      { id: 'kohaerenz', label: 'Cohérence : texte organisé (début, développement, fin), connecteurs variés', maxPoints: 5 },
      { id: 'wortschatz', label: 'Vocabulaire : précis et assez varié pour le thème, formules adaptées', maxPoints: 5 },
      { id: 'strukturen', label: 'Structures : subordonnées et verbe à la bonne place ; les erreurs ne gênent pas la compréhension', maxPoints: 5 },
    ]),
    sprechen: frozen([
      { id: 'aufgabe', label: 'Tâche : tous les points sont traités dans le temps imparti', maxPoints: 4 },
      { id: 'kohaerenz', label: 'Cohérence et aisance : discours suivi, idées reliées, peu d’hésitations', maxPoints: 4 },
      { id: 'wortschatz', label: 'Vocabulaire : précis, formules d’usage adaptées', maxPoints: 4 },
      { id: 'strukturen', label: 'Structures : phrases variées, verbe à la bonne place', maxPoints: 4 },
      { id: 'aussprache', label: 'Prononciation et intonation : compréhensible, accent de phrase juste', maxPoints: 4 },
    ]),
  }),
  // Premier jet B2 (phase 2) : même structure, libellés en allemand avec aide française repliée.
  b2: Object.freeze({
    schreiben: frozen([
      { id: 'aufgabe', label: aide('Aufgabenerfüllung: alle Punkte, Textsorte und Register angemessen', 'Tâche, genre et registre'), maxPoints: 5 },
      { id: 'kohaerenz', label: aide('Kohärenz: klarer Aufbau mit Absätzen, vielfältige Konnektoren', 'Cohérence : plan clair, paragraphes, connecteurs variés'), maxPoints: 5 },
      { id: 'wortschatz', label: aide('Wortschatz: präzise und differenziert, feste Wendungen', 'Vocabulaire : précis et nuancé, expressions figées'), maxPoints: 5 },
      { id: 'strukturen', label: aide('Strukturen: komplexe Sätze, gute grammatische Kontrolle, seltene Fehler', 'Structures : phrases complexes, bon contrôle, erreurs rares'), maxPoints: 5 },
    ]),
    sprechen: frozen([
      { id: 'aufgabe', label: aide('Aufgabenerfüllung: alle Punkte in der vorgegebenen Zeit, Standpunkt begründet', 'Tâche : tous les points dans le temps imparti, avis justifié'), maxPoints: 4 },
      { id: 'kohaerenz', label: aide('Kohärenz und Flüssigkeit: zusammenhängend, spontan, kaum Pausen', 'Cohérence et aisance : discours suivi, spontané, peu de pauses'), maxPoints: 4 },
      { id: 'wortschatz', label: aide('Wortschatz: präzise und variiert, passende Redemittel', 'Vocabulaire : précis et varié, formules adaptées'), maxPoints: 4 },
      { id: 'strukturen', label: aide('Strukturen: komplexe Sätze, Fehler ohne Missverständnisse', 'Structures : phrases complexes, erreurs sans malentendu'), maxPoints: 4 },
      { id: 'aussprache', label: aide('Aussprache und Intonation: klar, natürliche Satzmelodie', 'Prononciation et intonation : claires, mélodie naturelle'), maxPoints: 4 },
    ]),
  }),
});
