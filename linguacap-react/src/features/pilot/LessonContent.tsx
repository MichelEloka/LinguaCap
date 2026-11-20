/**
 * Mise en forme du texte d'une leçon ou d'une consigne (format des contenus : texte brut, intertitres en majuscules,
 * puces « • », paires « allemand — français », répliques « Nom : texte », étapes numérotées, ligne de crédit).
 * Le texte devient des composants : vocabulaire coloré par genre, dialogue, document en allemand, étapes, encadrés.
 */
import type { ReactNode } from 'react';
import { BookOpenText, Info, Lightbulb, Quote } from 'lucide-react';
import { Avatar } from '../../design/kit';
import './lesson-content.css';

type Pair = { term: string; meaning: string };
type Block =
  | { kind: 'heading'; title: string; subtitle?: string; number?: string }
  | { kind: 'paragraph'; text: string }
  | { kind: 'document'; title?: string; lines: string[] }
  | { kind: 'vocab'; pairs: Pair[]; glossary: boolean }
  | { kind: 'bullets'; items: string[] }
  | { kind: 'steps'; items: string[] }
  | { kind: 'dialogue'; lines: { speaker: string; text: string }[] }
  | { kind: 'fields'; lines: { speaker: string; text: string }[] }
  | { kind: 'callout'; tone: 'tip' | 'info'; title?: string; text: string[] }
  | { kind: 'credit'; text: string };

const GERMAN = new Set(('ich du er sie es wir ihr und der die das den dem des ist sind bin bist nicht mit ein eine einen einem zu im auf für '
  + 'von aber auch hier heute mein meine dein deine ja nein sehr gern gerne viel viele hat habe haben wie was wo wann gibt kann muss '
  + 'möchte schon noch dann am um liebe lieber grüße oder wenn weil dass sich man mir mich dir dich uns euch kein keine jetzt immer '
  + 'zum zur bei nach aus durch über unter wird werden war waren hatte gehen geht kommt komme wohne wohnt').split(' '));
const FRENCH = new Set(('le la les des du de et est un une vous nous je il elle pour avec dans sur que qui pas ce cette en au aux '
  + 'à son sa ses leur leurs mais ou où si plus très aussi comme on se ne y être avoir fait faire écoutez lisez répondez choisissez').split(' '));
const CUES = /^(Remarquez|Remarque|Attention|Astuce|Conseil|Exemple|Exemples|Note|Rappel|Bon à savoir|Le saviez-vous|À retenir|Important|Réponses?|Situation|Préparation|Piège|Vérifiez|Consignes?|Objectif|Questions?|Rôles?|Variante|Bilan|Modèle|Contexte|Tâche|Étape \d+|Indice|Solution|Corrigé|Traduction|Durée|Lieu|Personnages|Récapitulatif|Relisez-vous|Nuancez|Formes|Rappelez-vous|Pour aller plus loin|Phrase modèle)\s*:\s*/i;
const CALLOUT_HEADINGS = /^(BON À SAVOIR|LE SAVIEZ-VOUS|À RETENIR|ATTENTION|ASTUCE|CONSEIL|À REMARQUER|REMARQUE)/;
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

export function parseLesson(text: string): Block[] {
  const blocks: Block[] = [];
  const lines = text.replace(/\r/g, '').split('\n');
  let paragraph: string[] = [];
  let calloutTitle: string | null = null;
  let glossary = false;
  const flush = () => {
    if (!paragraph.length) return;
    const joined = paragraph.join('\n');
    if (calloutTitle !== null) {
      blocks.push({ kind: 'callout', tone: 'tip', title: calloutTitle || undefined, text: paragraph });
    } else {
      const german = paragraph.filter((line) => isGerman(line)).length;
      const document = isGerman(joined) && german / paragraph.length >= .6 && paragraph.every((line) => isGerman(line) || short(line));
      if (document) addDocument(paragraph);
      else {
        // Lignes françaises en paragraphes ; deux lignes allemandes consécutives ou plus forment un document.
        let run: string[] = [];
        const close = () => {
          if (run.length >= 2) addDocument(run);
          else for (const line of run) blocks.push({ kind: 'paragraph', text: line });
          run = [];
        };
        for (const line of paragraph) {
          if (isGerman(line)) run.push(line);
          else { close(); blocks.push({ kind: 'paragraph', text: line }); }
        }
        close();
      }
    }
    paragraph = [];
  };
  const addDocument = (part: string[]) => {
    const previous = blocks.at(-1);
    if (previous?.kind === 'document') previous.lines.push('', ...part);
    else if (previous?.kind === 'heading' && !previous.number && isGerman(`${previous.title} ${previous.subtitle ?? ''}`.toLowerCase())) {
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

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      flush();
      if (calloutTitle !== null && blocks.at(-1)?.kind === 'callout') calloutTitle = null;
      continue;
    }
    if (CREDIT.test(line)) { flush(); calloutTitle = null; push({ kind: 'credit', text: line }); continue; }
    const heading = headingOf(line);
    if (heading && heading.kind === 'heading') {
      flush();
      calloutTitle = CALLOUT_HEADINGS.test(heading.title) ? [heading.title, heading.subtitle].filter(Boolean).join(' — ') : null;
      glossary = /^MOTS UTILES|^VOCABULAIRE UTILE|^EXPRESSIONS UTILES/.test(heading.title);
      if (calloutTitle === null) push(heading);
      continue;
    }
    if (/^[•·▪-]\s/.test(line)) {
      flush();
      const items = line.split(/\s+[•·▪]\s+/).map((item) => item.replace(/^[•·▪-]\s*/, '').trim()).filter(Boolean);
      const pairs = items.map(pairOf);
      if (pairs.every(Boolean)) push({ kind: 'vocab', pairs: pairs as Pair[], glossary });
      else if (calloutTitle !== null) { paragraph.push(...items.map((item) => `• ${item}`)); }
      else push({ kind: 'bullets', items });
      continue;
    }
    const step = line.match(/^(\d+)[.)]\s+(.+)$/);
    if (step) { flush(); push({ kind: 'steps', items: [step[2]] }); continue; }
    const cue = line.match(CUES);
    if (cue) { flush(); push({ kind: 'callout', tone: /exemple/i.test(cue[1]) ? 'info' : 'tip', title: cue[1], text: [line.slice(cue[0].length)] }); continue; }
    const reply = dialogueOf(line);
    if (reply && calloutTitle === null) { flush(); push({ kind: 'dialogue', lines: [reply] }); continue; }
    glossary = false;
    paragraph.push(line);
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

export function LessonContent({ text, compact = false }: { text: string; compact?: boolean }) {
  const blocks = parseLesson(text);
  let stepCount = 0;
  const content: ReactNode[] = blocks.map((block, index) => {
    switch (block.kind) {
      case 'heading':
        return (
          <h3 key={index} className="lc-heading">
            {block.number && <span className="lc-heading-number">{block.number}</span>}
            <span className="lc-heading-title">{block.title}</span>
            {block.subtitle && <small lang={isGerman(block.subtitle) || /^(der|die|das)\b/i.test(block.subtitle) ? 'de' : undefined}>{block.subtitle}</small>}
          </h3>
        );
      case 'paragraph':
        return <p key={index} className="lc-paragraph">{block.text}</p>;
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
        return <ul key={index} className="lc-bullets">{block.items.map((item, row) => <li key={row}>{item}</li>)}</ul>;
      case 'steps': {
        const start = stepCount + 1;
        stepCount += block.items.length;
        return <ol key={index} className="lc-steps" start={start}>{block.items.map((item, row) => <li key={row}><span>{start + row}</span><p>{item}</p></li>)}</ol>;
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
            <div>{block.title && <strong>{block.title}</strong>}
              {block.text.map((line, row) => <p key={row}>{line}</p>)}</div>
          </aside>
        );
      case 'credit':
        return <p key={index} className="lc-credit"><Quote size={13} aria-hidden="true" />{block.text}</p>;
      default:
        return null;
    }
  });
  return <div className={`lc-lesson${compact ? ' is-compact' : ''}`}>{content}</div>;
}
