/**
 * Mise en forme du texte d'une leçon ou d'une consigne (format des contenus : texte brut, intertitres en majuscules,
 * puces « • », paires « allemand — français », répliques « Nom : texte », étapes numérotées, ligne de crédit).
 * Le texte devient des composants : vocabulaire coloré par genre, dialogue, document en allemand, étapes, encadrés.
 * Niveaux B (format 5) : une ligne qui porte un marqueur ` [fr] ` ou ` [fr?] ` est une consigne (jamais un document) ;
 * sa traduction s'affiche dessous (B1) ou dans une aide repliée (B2), voir `bilingual.tsx`.
 */
import type { ReactNode } from 'react';
import { BookOpenText, Info, Lightbulb, Quote } from 'lucide-react';
import { Avatar } from '../../design/kit';
import { FrenchHelp, FrenchHelpSwitch, GlossNote, hasFoldedHelp, parseGloss, type GlossMode } from './bilingual';
import './lesson-content.css';

type Pair = { term: string; meaning: string };
/** Traduction rattachée à un bloc (ligne-glose ou partie française d'une ligne). */
type Note = { fr: string; mode: GlossMode };
/** Ligne d'un bloc et sa traduction éventuelle. */
type Line = { text: string; gloss?: Note };
type Block =
  | { kind: 'heading'; title: string; subtitle?: string; number?: string; gloss?: Note }
  | { kind: 'paragraph'; text: string }
  | { kind: 'instruction'; lines: string[]; gloss?: Note }
  | { kind: 'document'; title?: string; lines: string[] }
  | { kind: 'vocab'; pairs: Pair[]; glossary: boolean }
  | { kind: 'bullets'; items: Line[] }
  | { kind: 'steps'; items: Line[] }
  | { kind: 'dialogue'; lines: { speaker: string; text: string }[] }
  | { kind: 'fields'; lines: { speaker: string; text: string }[] }
  | { kind: 'callout'; tone: 'tip' | 'info'; title?: string; titleGloss?: Note; text: Line[] }
  | { kind: 'credit'; text: string };

const GERMAN = new Set(('ich du er sie es wir ihr und der die das den dem des ist sind bin bist nicht mit ein eine einen einem zu im auf für '
  + 'von aber auch hier heute mein meine dein deine ja nein sehr gern gerne viel viele hat habe haben wie was wo wann gibt kann muss '
  + 'möchte schon noch dann am um liebe lieber grüße oder wenn weil dass sich man mir mich dir dich uns euch kein keine jetzt immer '
  + 'zum zur bei nach aus durch über unter wird werden war waren hatte gehen geht kommt komme wohne wohnt').split(' '));
const FRENCH = new Set(('le la les des du de et est un une vous nous je il elle pour avec dans sur que qui pas ce cette en au aux '
  + 'à son sa ses leur leurs mais ou où si plus très aussi comme on se ne y être avoir fait faire écoutez lisez répondez choisissez').split(' '));
const CUES = /^(Remarquez|Remarque|Attention|Astuce|Conseil|Exemple|Exemples|Note|Rappel|Bon à savoir|Le saviez-vous|À retenir|Important|Réponses?|Situation|Préparation|Piège|Vérifiez|Consignes?|Objectif|Questions?|Rôles?|Variante|Bilan|Modèle|Contexte|Tâche|Étape \d+|Indice|Solution|Corrigé|Traduction|Durée|Lieu|Personnages|Récapitulatif|Relisez-vous|Nuancez|Formes|Rappelez-vous|Pour aller plus loin|Phrase modèle|Beispiel|Tipp|Regel|Strategie|Aufgabe)\s*:\s*/i;
/** Intertitres d'encadré, français puis allemands (niveaux B : « MERKE », « STRATEGIE »…). */
const CALLOUT_HEADINGS = /^(BON À SAVOIR|LE SAVIEZ-VOUS|À RETENIR|ATTENTION|ASTUCE|CONSEIL|À REMARQUER|REMARQUE|(?:MERKE|ZUM MERKEN|REGEL|TIPP|ACHTUNG|STRATEGIE)(?![A-ZÄÖÜß]))/;
const CREDIT = /^(Texte adapté|Situation adaptée|Enregistrements? et images|Enregistrements?|Images?|Source)\s.*(CC BY|Deutsch im Blick|Der und mehr)/i;
const FRENCH_START = /^(Vérifiez|Écoutez|Lisez|Choisissez|Complétez|Répondez|Notez|Comparez|Relisez|Observez|Repérez|Dites|Écrivez|Préparez|Présentez|Utilisez|Remarquez|Pour|Avec|Quand|Si|Le|La|Les|Un|Une|En|Au|Aux|À|Dans|On|Il|Elle|Vous|Nous|Ici|Puis|Ensuite|Enfin|Attention|Exemple)\b/u;

function words(text: string) {
  return text.toLowerCase().replace(/[^a-zäöüßàâçéèêëîïôûùœ'’ -]/g, ' ').split(/[\s'’]+/).filter(Boolean);
}

export function isGerman(text: string) {
  const list = words(text);
  const de = list.filter((word) => GERMAN.has(word)).length;
  const fr = list.filter((word) => FRENCH.has(word)).length;
  return de >= 2 && fr <= 1 && de >= fr * 2 && !FRENCH_START.test(text.trim());
}

const short = (line: string) => line.split(/\s+/).length <= 4;

function headingOf(line: string): Block | null {
  const match = line.match(/^(\d+[.)]\s+)?([^a-zäöüßàâçéèêëîïôûù]*?[A-ZÄÖÜÀÂÇÉÈÊÎÔÛ][^a-zäöüßàâçéèêëîïôûù]*?)(?:\s*(?:\(([^)]*)\)|[—–]\s*(.+)))?$/);
  if (!match) return null;
  const title = match[2].trim();
  const letters = title.replace(/[^A-Za-zÄÖÜäöüÀÂÇÉÈÊÎÔÛ]/g, '');
  if (letters.length < 4 || title !== title.toUpperCase()) return null;
  return { kind: 'heading', title, subtitle: (match[3] ?? match[4])?.trim(), number: match[1]?.trim().replace(/[.)]$/, '') };
}

function pairOf(item: string): Pair | null {
  const parts = item.split(/\s+[—–]\s+/);
  if (parts.length !== 2 || parts[0].length > 60) return null;
  return { term: parts[0].trim(), meaning: parts[1].trim() };
}

function dialogueOf(line: string) {
  if (CUES.test(line)) return null;
  const match = line.match(/^([A-ZÄÖÜÉ][\p{L}’'-]*(?:\s[A-ZÄÖÜÉ][\p{L}’'-]*){0,2})\s?:\s+(.+)$/u);
  if (!match || match[1].length > 26 || match[1] === match[1].toUpperCase()) return null;
  return { speaker: match[1], text: match[2] };
}

/** Ligne du texte après le rattachement des traductions ; `instruction` : consigne bilingue (jamais un document). */
interface SourceLine { text: string; gloss?: Note; instruction: boolean }

/** Ligne qui ouvre un bloc à elle seule : intertitre, puce, étape, amorce ou crédit. */
const structural = (line: string) => Boolean(headingOf(line)) || /^[•·▪-]\s/.test(line) || /^\d+[.)]\s/.test(line) || CUES.test(line) || CREDIT.test(line);

/**
 * Rattache les traductions (format 5) : `allemand [fr] français` sur une ligne, ou une ligne seule `[fr] français` qui
 * traduit le bloc précédent (intertitre, puce ou étape ; sinon toutes les lignes du paragraphe depuis la dernière ligne
 * vide ou la dernière traduction). Les lignes traduites sont des consignes.
 */
function sourceLines(text: string): SourceLine[] {
  const lines: SourceLine[] = [];
  for (const raw of text.replace(/\r/g, '').split('\n')) {
    const line = raw.trim();
    const gloss = line ? parseGloss(line) : null;
    if (!gloss) { lines.push({ text: line, instruction: false }); continue; }
    const note = gloss.fr ? { fr: gloss.fr, mode: gloss.mode } : undefined;
    if (gloss.de) { lines.push({ text: gloss.de, gloss: note, instruction: true }); continue; }
    let index = lines.length - 1;
    while (index >= 0 && !lines[index].text) index--;
    if (index < 0 || lines[index].gloss || !note) {
      // Traduction sans bloc à traduire : elle reste un paragraphe en français.
      if (note) lines.push({ text: note.fr, instruction: false });
      continue;
    }
    Object.assign(lines[index], { gloss: note, instruction: true });
    if (structural(lines[index].text)) continue;
    for (let previous = index - 1; previous >= 0; previous--) {
      const line = lines[previous];
      if (!line.text || line.gloss || structural(line.text)) break;
      line.instruction = true;
    }
  }
  return lines;
}

export function parseLesson(text: string): Block[] {
  const blocks: Block[] = [];
  const lines = sourceLines(text);
  let paragraph: SourceLine[] = [];
  let calloutTitle: string | null = null;
  let calloutGloss: Note | undefined;
  let glossary = false;
  const flush = () => {
    if (!paragraph.length) return;
    const texts = paragraph.map((line) => line.text);
    if (calloutTitle !== null) {
      blocks.push({ kind: 'callout', tone: 'tip', title: calloutTitle || undefined, titleGloss: calloutGloss,
        text: paragraph.map((line) => ({ text: line.text, gloss: line.gloss })) });
    } else {
      const german = texts.filter((line) => isGerman(line)).length;
      const document = paragraph.every((line) => !line.instruction) && isGerman(texts.join('\n')) && german / texts.length >= .6
        && texts.every((line) => isGerman(line) || short(line));
      if (document) addDocument(texts);
      else {
        // Lignes françaises en paragraphes ; deux lignes allemandes consécutives ou plus forment un document ; une consigne
        // bilingue (avec les lignes qu'elle traduit) forme un bloc à part.
        let run: string[] = [];
        let group: SourceLine[] = [];
        const close = () => {
          if (run.length >= 2) addDocument(run);
          else for (const line of run) blocks.push({ kind: 'paragraph', text: line });
          run = [];
        };
        const closeGroup = () => {
          if (group.length) blocks.push({ kind: 'instruction', lines: group.map((line) => line.text), gloss: group.at(-1)?.gloss });
          group = [];
        };
        for (const line of paragraph) {
          if (line.instruction) {
            close();
            group.push(line);
            if (line.gloss) closeGroup();
          } else {
            closeGroup();
            if (isGerman(line.text)) run.push(line.text);
            else { close(); blocks.push({ kind: 'paragraph', text: line.text }); }
          }
        }
        closeGroup();
        close();
      }
    }
    paragraph = [];
  };
  const addDocument = (part: string[]) => {
    const previous = blocks.at(-1);
    if (previous?.kind === 'document') previous.lines.push('', ...part);
    else if (previous?.kind === 'heading' && !previous.number && !previous.gloss && isGerman(`${previous.title} ${previous.subtitle ?? ''}`.toLowerCase())) {
      blocks.pop();
      blocks.push({ kind: 'document', title: [previous.title, previous.subtitle].filter(Boolean).join(' — '), lines: [...part] });
    } else blocks.push({ kind: 'document', lines: [...part] });
  };
  const push = (block: Block) => {
    const previous = blocks.at(-1);
    if (block.kind === 'vocab' && previous?.kind === 'vocab' && previous.glossary === block.glossary) previous.pairs.push(...block.pairs);
    else if (block.kind === 'bullets' && previous?.kind === 'bullets') previous.items.push(...block.items);
    else if (block.kind === 'steps' && previous?.kind === 'steps') previous.items.push(...block.items);
    else if (block.kind === 'dialogue' && previous?.kind === 'dialogue') previous.lines.push(...block.lines);
    else blocks.push(block);
  };

  for (const entry of lines) {
    const line = entry.text;
    if (!line) {
      flush();
      if (calloutTitle !== null && blocks.at(-1)?.kind === 'callout') { calloutTitle = null; calloutGloss = undefined; }
      continue;
    }
    if (!entry.instruction && CREDIT.test(line)) { flush(); calloutTitle = null; calloutGloss = undefined; push({ kind: 'credit', text: line }); continue; }
    const heading = headingOf(line);
    if (heading && heading.kind === 'heading') {
      flush();
      calloutTitle = CALLOUT_HEADINGS.test(heading.title) ? [heading.title, heading.subtitle].filter(Boolean).join(' — ') : null;
      calloutGloss = calloutTitle !== null ? entry.gloss : undefined;
      glossary = /^MOTS UTILES|^VOCABULAIRE UTILE|^EXPRESSIONS UTILES/.test(heading.title);
      if (calloutTitle === null) push({ ...heading, gloss: entry.gloss });
      continue;
    }
    if (/^[•·▪-]\s/.test(line)) {
      flush();
      const items = line.split(/\s+[•·▪]\s+/).map((item) => item.replace(/^[•·▪-]\s*/, '').trim()).filter(Boolean);
      const last = items.length - 1;
      const pairs = items.map(pairOf);
      if (!entry.instruction && pairs.every(Boolean)) push({ kind: 'vocab', pairs: pairs as Pair[], glossary });
      else if (calloutTitle !== null) {
        paragraph.push(...items.map((item, index) => ({ text: `• ${item}`, gloss: index === last ? entry.gloss : undefined, instruction: entry.instruction })));
      } else push({ kind: 'bullets', items: items.map((item, index) => ({ text: item, gloss: index === last ? entry.gloss : undefined })) });
      continue;
    }
    const step = line.match(/^(\d+)[.)]\s+(.+)$/);
    if (step) { flush(); push({ kind: 'steps', items: [{ text: step[2], gloss: entry.gloss }] }); continue; }
    const cue = line.match(CUES);
    if (cue) {
      flush();
      push({ kind: 'callout', tone: /exemple|beispiel/i.test(cue[1]) ? 'info' : 'tip', title: cue[1], text: [{ text: line.slice(cue[0].length), gloss: entry.gloss }] });
      continue;
    }
    const reply = entry.instruction ? null : dialogueOf(line);
    if (reply && calloutTitle === null) { flush(); push({ kind: 'dialogue', lines: [reply] }); continue; }
    glossary = false;
    paragraph.push(entry);
  }
  flush();
  // Une suite de « clé : valeur » brèves (fiche, emploi du temps) n'est pas un dialogue ; une réplique isolée sans
  // interlocuteur nommé (« Übrigens : … ») reste un paragraphe.
  return blocks.map((block): Block => {
    if (block.kind !== 'dialogue') return block;
    const distinct = new Set(block.lines.map((line) => line.speaker)).size === block.lines.length && block.lines.length >= 3;
    if (distinct || block.lines.every((line) => line.text.split(/\s+/).length <= 5 && !/[.!?…]$/.test(line.text))) return { kind: 'fields', lines: block.lines };
    if (block.lines.length === 1 && !/^(Frau|Herr)\s/.test(block.lines[0].speaker)) {
      return { kind: 'paragraph', text: `${block.lines[0].speaker} : ${block.lines[0].text}` };
    }
    return block;
  });
}

const ARTICLE = /^(der|die|das)\s+(.+)$/i;

function Term({ term }: { term: string }) {
  const match = term.match(ARTICLE);
  if (!match) return <strong className="lc-term" lang="de">{term}</strong>;
  const article = match[1].toLowerCase();
  return <strong className="lc-term" lang="de"><span className={`lc-article is-${article}`}>{match[1]}</span>{match[2]}</strong>;
}

function Meaning({ text }: { text: string }) {
  const note = text.match(/^(.*?)\s*\((.+)\)\s*$/);
  return note
    ? <span className="lc-meaning">{note[1]}<small>{note[2]}</small></span>
    : <span className="lc-meaning">{text}</span>;
}

function DialogueView({ lines }: { lines: { speaker: string; text: string }[] }) {
  const speakers = [...new Set(lines.map((line) => line.speaker))];
  return (
    <div className="lc-chat" lang="de">
      {lines.map((line, index) => {
        const side = speakers.indexOf(line.speaker) % 2 === 0 ? 'is-left' : 'is-right';
        const first = index === 0 || lines[index - 1].speaker !== line.speaker;
        return (
          <div key={index} className={`lc-chat-line ${side}${first ? ' is-first' : ''}`}>
            {first ? <Avatar name={line.speaker} size={30} /> : <span className="lc-chat-gap" aria-hidden="true" />}
            <div className="lc-bubble">{first && <span className="lc-speaker">{line.speaker}</span>}<p>{line.text}</p></div>
          </div>
        );
      })}
    </div>
  );
}

/** Ligne d'une puce, d'une étape ou d'un encadré : texte seul (A1, A2), ou allemand et sa traduction (niveaux B). */
function LineText({ line }: { line: Line }) {
  if (!line.gloss) return <>{line.text}</>;
  return <><span className="bi-de" lang="de">{line.text}</span><GlossNote fr={line.gloss.fr} mode={line.gloss.mode} /></>;
}

/** Traduction d'un intertitre : à côté (B1) ou repliée (B2). */
function TitleGloss({ gloss, className }: { gloss?: Note; className: string }) {
  if (!gloss) return null;
  return gloss.mode === 'fold'
    ? <span className={`${className} is-fold`}><FrenchHelp compact>{gloss.fr}</FrenchHelp></span>
    : <span className={className} lang="fr">{gloss.fr}</span>;
}

/**
 * Texte de leçon mis en forme. `helpSwitch` : réglage « Toujours afficher l'aide en français » en tête quand le texte
 * porte une aide repliée (B2) ; proposé par défaut hors mode compact.
 */
export function LessonContent({ text, compact = false, helpSwitch = !compact }: { text: string; compact?: boolean; helpSwitch?: boolean }) {
  const blocks = parseLesson(text);
  let stepCount = 0;
  const content: ReactNode[] = blocks.map((block, index) => {
    switch (block.kind) {
      case 'heading':
        return (
          <h3 key={index} className={`lc-heading${block.gloss ? ' has-gloss' : ''}`}>
            {block.number && <span className="lc-heading-number">{block.number}</span>}
            <span className="lc-heading-title" lang={block.gloss ? 'de' : undefined}>{block.title}</span>
            {block.subtitle && <small lang={isGerman(block.subtitle) || /^(der|die|das)\b/i.test(block.subtitle) ? 'de' : undefined}>{block.subtitle}</small>}
            <TitleGloss gloss={block.gloss} className="lc-heading-fr" />
          </h3>
        );
      case 'paragraph':
        return <p key={index} className="lc-paragraph">{block.text}</p>;
      case 'instruction':
        return (
          <div key={index} className="lc-instruction">
            {block.lines.map((line, row) => <p key={row} lang="de">{line}</p>)}
            {block.gloss && <GlossNote fr={block.gloss.fr} mode={block.gloss.mode} />}
          </div>
        );
      case 'document':
        return (
          <figure key={index} className="lc-doc" lang="de">
            <figcaption><BookOpenText size={16} aria-hidden="true" />{block.title ?? 'Texte'}</figcaption>
            <div>{block.lines.map((line, row) => line ? <p key={row}>{line}</p> : <span key={row} className="lc-doc-gap" />)}</div>
          </figure>
        );
      case 'vocab':
        return (
          <ul key={index} className={`lc-vocab${block.glossary ? ' is-glossary' : ''}`} aria-label={block.glossary ? 'Mots utiles' : 'Vocabulaire'}>
            {block.pairs.map((pair, item) => <li key={item}><Term term={pair.term} /><Meaning text={pair.meaning} /></li>)}
          </ul>
        );
      case 'bullets':
        return <ul key={index} className="lc-bullets">{block.items.map((item, row) => <li key={row}><LineText line={item} /></li>)}</ul>;
      case 'steps': {
        const start = stepCount + 1;
        stepCount += block.items.length;
        return <ol key={index} className="lc-steps" start={start}>{block.items.map((item, row) => <li key={row}><span>{start + row}</span><p><LineText line={item} /></p></li>)}</ol>;
      }
      case 'dialogue':
        return <DialogueView key={index} lines={block.lines} />;
      case 'fields':
        return (
          <dl key={index} className="lc-fields">
            {block.lines.map((line, row) => <div key={row}><dt>{line.speaker}</dt><dd>{line.text}</dd></div>)}
          </dl>
        );
      case 'callout':
        return (
          <aside key={index} className={`lc-callout is-${block.tone}`}>
            {block.tone === 'tip' ? <Lightbulb size={18} aria-hidden="true" /> : <Info size={18} aria-hidden="true" />}
            <div>{block.title && <strong><span lang={block.titleGloss ? 'de' : undefined}>{block.title}</span><TitleGloss gloss={block.titleGloss} className="lc-callout-fr" /></strong>}
              {block.text.map((line, row) => (line.gloss
                ? <div key={row} className="lc-callout-line"><p lang="de">{line.text}</p><GlossNote fr={line.gloss.fr} mode={line.gloss.mode} /></div>
                : <p key={row}>{line.text}</p>))}</div>
          </aside>
        );
      case 'credit':
        return <p key={index} className="lc-credit"><Quote size={13} aria-hidden="true" />{block.text}</p>;
      default:
        return null;
    }
  });
  return (
    <div className={`lc-lesson${compact ? ' is-compact' : ''}`}>
      {helpSwitch && hasFoldedHelp(text) && <FrenchHelpSwitch />}
      {content}
    </div>
  );
}
