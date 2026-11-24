// Aides de rédaction du Ciné-club (EVO-055). Contrat : plan « Ciné-club », §1 et §3, et précisions du lot C1 (document de
// film = corps de PUT /catalogue/films/{id}). Les sources content/cine/<langue>/<filmId>.mjs sont construites par
// infra/content/build-cine.mjs vers content/<langue>/cine/<filmId>.json ; guide : content/README.md, section « Ciné-club ».
//
// Règles de droits (non négociables) : lecteur YouTube officiel seulement ; aucun sous-titre, manuscrit, exercice ni image
// de l'éditeur du film recopié ; titres, contextes, mots-clés, questions et explications sont originaux ; une réplique
// citée compte 12 mots au plus, rarement (le contrôle refuse une citation plus longue).

// Consigne bilingue et constructeurs de questions des niveaux B (mêmes formes : choice, fill, order, match).
export { aide, bi, choice, fill, match, order } from '../b/lib.mjs';

/** Mot-clé nominal : article, mot, pluriel (null si inusité), traduction, remarque facultative (120 caractères au plus). */
export const nom = (article, word, plural, translation, note = null) => ({ word, article, plural, translation, note });
/** Mot-clé non nominal (verbe, adjectif, expression) : mot, traduction, remarque facultative. */
export const mot = (word, translation, note = null) => ({ word, article: null, plural: null, translation, note });

/**
 * Contexte « avant de regarder » au format des cours : intertitres en capitales suivis de leur traduction, lignes
 * « allemand [fr] français » (B1 et niveaux A : traduction affichée) ou « allemand [fr?] français » (B2 : aide repliée).
 * situation : lignes [allemand, français] qui posent la scène sans tout dévoiler ; questions : 2 ou 3 questions
 * d'anticipation [allemand, français] (non notées) ; focus : consignes de visionnage [allemand, français] ; episodes :
 * [première, dernière] folge du film couverte par la séquence (repère pour l'élève et pour l'administration).
 */
export function contexte({ situation, questions, focus = [], episodes = null, marker = '[fr]' }) {
  const line = ([de, fr]) => `${de} ${marker} ${fr}`;
  const bullet = ([de, fr]) => `• ${de} ${marker} ${fr}`;
  const blocks = [
    ['WORUM GEHT ES?', 'De quoi s’agit-il ?', situation.map(line)],
    ['VOR DEM SEHEN', 'Avant de regarder', questions.map(bullet)],
  ];
  if (focus.length) blocks.push(['BEIM SEHEN', 'Pendant le visionnage', focus.map(line)]);
  const text = blocks.map(([de, fr, lines]) => [de, `${marker} ${fr}`, ...lines].join('\n')).join('\n\n');
  if (!episodes) return text;
  const [first, last] = episodes;
  const folgen = first === last ? [`Im Film: Folge ${first}.`, `Dans le film : épisode ${first}.`]
    : last === first + 1 ? [`Im Film: Folgen ${first} und ${last}.`, `Dans le film : épisodes ${first} et ${last}.`]
      : [`Im Film: Folgen ${first} bis ${last}.`, `Dans le film : épisodes ${first} à ${last}.`];
  return `${text}\n\n${line(folgen)}`;
}

/** Chaîne officielle « Deutsch lernen mit der DW » : crédit visible et note de licence communs aux films Nicos Weg. */
export const DW = Object.freeze({
  channel: 'Deutsch lernen mit der DW',
  credit: 'Film : Nicos Weg, Deutsche Welle (Deutsch lernen mit der DW), lecteur YouTube',
  licenseNote: 'Vidéo diffusée par la Deutsche Welle sur sa chaîne YouTube officielle et lue dans le lecteur YouTube '
    + '(youtube-nocookie.com), sans téléchargement ni copie. Le cours complet et gratuit Nicos Weg (exercices, manuscrits, '
    + 'grammaire) est sur le site de la DW. Les titres, contextes, mots-clés, questions et explications de LinguaCap sont '
    + 'originaux ; ils ne reprennent ni sous-titres, ni manuscrits, ni exercices de la DW.',
});
