/**
 * Évaluations (bilan intermédiaire et examen blanc) : types de l'API, libellés et composants communs à l'élève
 * et à la correction (supports de l'épreuve, copie écrite, réponses fermées, résultat détaillé, historique).
 */
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart3, BookOpen, CheckCircle2, ChevronRight, Headphones, History, Hourglass, ImageOff, MessageSquareQuote, Mic,
  PenLine, RotateCcw, Trophy, type LucideIcon,
} from 'lucide-react';
import { Badge, EmptyState, type BadgeTone } from '../../components/ui';
import { AudioPlayer, Card, ProgressRing, Timeline, type TimelineEntry } from '../../design/kit';

export type ExamKind = 'midterm' | 'final';
export type Mode = 'closed' | 'written' | 'oral';
export interface ExamOption { id: string; label: string }
export interface ExamQuestion { id: string; prompt: string; options: ExamOption[] }
export interface ExamPlacement { assetId: string; assetVersion: number; usage: 'illustration' | 'audio'; alt: string | null; caption: string | null; decorative: boolean; questionId: string | null; optionId: string | null }
export interface ExamPart {
  id: string; competence: string; mode: Mode; title: string; instructions: string;
  questions: ExamQuestion[]; criteria: { id: string; label: string; maxPoints: number }[]; placements: ExamPlacement[];
}
export interface Score { points: number; max: number; percent: number }
export interface ExamView {
  id: string; enrollmentId: string; learnerId: string; kind: ExamKind; number: number; status: 'in_progress' | 'submitted' | 'graded';
  definition: { title: string; description: string; passPercent: number; levelCode: string; parts: ExamPart[] };
  answers: Record<string, Record<string, string>>; texts: Record<string, string>;
  recordings: { partId: string; productionId: string; mimeType: string; url: string | null }[];
  media: Record<string, string>; closedScores: Record<string, Score> | null; dueAt: string | null; startedAt: string;
  submittedAt: string | null; onTime: boolean; canGrade: boolean;
  result: null | {
    scores: Record<string, Score>; percent: number; decision: 'validated' | 'to_consolidate' | 'completed';
    review: { activityId: string; title: string; moduleTitle: string }[] | null; feedback: string | null;
    comments: Record<string, string>; gradedAt: string | null;
  };
}
export interface ExamSummary {
  id: string; kind: ExamKind; number: number; status: ExamView['status']; title: string; startedAt: string;
  submittedAt: string | null; dueAt: string | null; gradedAt: string | null; onTime: boolean; percent: number | null;
  decision: 'validated' | 'to_consolidate' | 'completed' | null;
}
export interface Reservation { id: string; uploadUrl: string | null; maxBytes: number }
export interface QueueItem {
  id: string; learnerId: string; learnerName: string; kind: ExamKind; number: number; levelCode: string | null; title: string;
  submittedAt: string; dueAt: string | null; onTime: boolean;
}

export const examNames: Record<ExamKind, string> = { midterm: 'Bilan intermédiaire', final: 'Examen blanc' };
export const competenceNames: Record<string, string> = {
  lecture: 'Lecture', ecoute: 'Écoute', 'expression-ecrite': 'Expression écrite', 'expression-orale': 'Expression orale',
};
const competenceIcons: Record<string, LucideIcon> = { lecture: BookOpen, ecoute: Headphones, 'expression-ecrite': PenLine, 'expression-orale': Mic };
const competenceTones: Record<string, string> = { lecture: 'brand', ecoute: 'violet', 'expression-ecrite': 'accent', 'expression-orale': 'success' };
export const decisions = {
  validated: { label: 'Validé dans LinguaCap', tone: 'green' as BadgeTone, color: 'var(--success)', icon: Trophy, kind: 'success' },
  to_consolidate: { label: 'À consolider', tone: 'amber' as BadgeTone, color: 'var(--warning)', icon: RotateCcw, kind: 'warning' },
  completed: { label: 'Bilan corrigé', tone: 'blue' as BadgeTone, color: 'var(--brand)', icon: CheckCircle2, kind: 'brand' },
};
export const dateTime = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });
export const shortDate = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' });
export const timeOnly = new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' });
const relative = new Intl.RelativeTimeFormat('fr-FR', { numeric: 'auto' });

export function getError(error: unknown) {
  return error instanceof Error && error.name !== 'TimeoutError' ? error.message : 'Le service est momentanément indisponible. Réessayez.';
}

/** « hier », « dans 3 jours », « il y a 2 heures » : délai lisible avant une échéance ou depuis une remise. */
export function fromNow(iso: string) {
  const minutes = Math.round((new Date(iso).getTime() - Date.now()) / 60000);
  if (Math.abs(minutes) < 60) return relative.format(minutes, 'minute');
  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 24) return relative.format(hours, 'hour');
  return relative.format(Math.round(hours / 24), 'day');
}

export const countWords = (text: string) => (text.trim() ? text.trim().split(/\s+/).length : 0);
export const plural = (count: number, one: string, many: string) => `${count} ${count > 1 ? many : one}`;

export function CompetenceIcon({ competence, size = 18 }: { competence: string; size?: number }) {
  const Icon = competenceIcons[competence] ?? BookOpen;
  return <Icon size={size} aria-hidden="true" />;
}

export const competenceTone = (competence: string) => competenceTones[competence] ?? 'brand';

/** Avancement d'une partie pendant la tentative (réponses, nombre de mots, enregistrement déposé). */
export function partState(part: ExamPart, exam: ExamView) {
  if (part.mode === 'closed') {
    const answered = part.questions.filter((question) => exam.answers[part.id]?.[question.id]).length;
    const total = part.questions.length;
    return { done: answered === total, started: answered > 0, label: total ? `${answered}/${total} ${total > 1 ? 'réponses' : 'réponse'}` : 'Aucune question' };
  }
  if (part.mode === 'written') {
    const words = countWords(exam.texts[part.id] ?? '');
    return { done: words > 0, started: words > 0, label: words ? plural(words, 'mot', 'mots') : 'À rédiger' };
  }
  const saved = exam.recordings.some((recording) => recording.partId === part.id);
  return { done: saved, started: saved, label: saved ? 'Enregistrement envoyé' : 'À enregistrer' };
}

export function statusBadge(exam: { status: ExamView['status']; decision?: ExamSummary['decision'] }) {
  if (exam.status === 'in_progress') return <Badge tone="blue">En cours</Badge>;
  if (exam.status === 'submitted') return <Badge tone="amber">En attente de correction</Badge>;
  const decision = exam.decision ? decisions[exam.decision] : decisions.completed;
  return <Badge tone={decision.tone}>{decision.label}</Badge>;
}

/** Images et sons d'une partie, d'une question ou d'un choix de réponse. */
export function ExamMedia({ part, exam, questionId = null }: { part: ExamPart; exam: ExamView; questionId?: string | null }) {
  const placements = part.placements.filter((placement) => (placement.questionId ?? null) === questionId && !placement.optionId);
  if (!placements.length) return null;
  return (
    <div className="ev-media">
      {placements.map((placement, index) => {
        const url = exam.media[`${placement.assetId}@${placement.assetVersion}`];
        if (!url) return <p key={index} className="ev-media-missing"><ImageOff size={16} aria-hidden="true" /> Support disponible pendant la tentative.</p>;
        return placement.usage === 'audio'
          ? <div key={index} className="ev-media-audio ev-audio"><AudioPlayer src={url} title={placement.caption ?? 'Document sonore'} /></div>
          : (
            <figure key={index} className="ev-figure">
              <img src={url} alt={placement.decorative ? '' : placement.alt ?? ''} />
              {placement.caption && <figcaption lang="de">{placement.caption}</figcaption>}
            </figure>
          );
      })}
    </div>
  );
}

/** Production écrite de l'élève, présentée comme une copie (une ligne de texte par paragraphe). */
export function ProductionText({ text, empty = 'Aucun texte remis.' }: { text: string; empty?: string }) {
  const lines = text.replace(/\r/g, '').split('\n');
  if (!text.trim()) return <p className="ev-paper-empty">{empty}</p>;
  return <div className="ev-paper-text" lang="de">{lines.map((line, index) => (line.trim() ? <p key={index}>{line}</p> : <span key={index} className="ev-paper-gap" />))}</div>;
}

/** Réponses choisies aux questions fermées (lecture seule). */
export function ClosedAnswers({ part, exam }: { part: ExamPart; exam: ExamView }) {
  return (
    <ol className="ev-answers">
      {part.questions.map((question, index) => {
        const chosen = question.options.find((option) => option.id === exam.answers[part.id]?.[question.id]);
        return (
          <li key={question.id}>
            <span className="ev-q-num" aria-hidden="true">{index + 1}</span>
            <div><p>{question.prompt}</p>{chosen ? <strong>{chosen.label}</strong> : <em>Sans réponse</em>}</div>
          </li>
        );
      })}
    </ol>
  );
}

/** Scores par compétence en barres horizontales, avec le seuil de réussite. */
function ScoreBars({ scores, passPercent }: { scores: Record<string, Score>; passPercent: number }) {
  const entries = Object.entries(scores);
  if (!entries.length) return <p className="muted">Aucun score détaillé.</p>;
  return (
    <div className="ev-scores-wrap">
      <ul className="ev-scores lc-stagger">
        {entries.map(([competence, score]) => (
          <li key={competence} className={score.percent >= passPercent ? 'is-pass' : 'is-low'}>
            <span className={`ev-icon-tile is-${competenceTone(competence)}`}><CompetenceIcon competence={competence} size={17} /></span>
            <div className="ev-score-main">
              <div className="ev-score-head">
                <strong>{competenceNames[competence] ?? competence}</strong>
                <span>{score.points} / {score.max} pts · <b>{score.percent} %</b></span>
              </div>
              <div className="ev-score-track" aria-hidden="true">
                <span style={{ ['--v' as string]: `${Math.max(2, Math.min(100, score.percent))}%` }} />
                <i style={{ ['--t' as string]: `${passPercent}%` }} />
              </div>
            </div>
          </li>
        ))}
      </ul>
      <p className="ev-scores-legend"><i aria-hidden="true" /> Seuil de réussite : {passPercent} %</p>
    </div>
  );
}

function Paragraphs({ text }: { text: string }) {
  return <>{text.split(/\n+/).filter((line) => line.trim()).map((line, index) => <p key={index}>{line}</p>)}</>;
}

/**
 * Résultat d'une tentative corrigée : décision mise en avant, score global, scores par compétence, retours du correcteur
 * et activités à revoir. `extra` s'ajoute à la grille (historique des tentatives, par exemple).
 */
export function ResultSummary({ exam, action, reviewHref, extra }: {
  exam: ExamView; action?: ReactNode; reviewHref?: (activityId: string) => string; extra?: ReactNode;
}) {
  if (!exam.result) return null;
  const result = exam.result;
  const decision = decisions[result.decision];
  const DecisionIcon = decision.icon;
  const pass = exam.definition.passPercent;
  const sentence = result.decision === 'validated'
    ? `Vous avez obtenu ${result.percent} %, au-dessus du seuil de ${pass} %. Bravo, cette étape est validée.`
    : result.decision === 'to_consolidate'
      ? `Vous avez obtenu ${result.percent} % pour un seuil de ${pass} %. Reprenez les activités conseillées, puis tentez à nouveau.`
      : `Votre bilan est corrigé : ${result.percent} %. Il sert à ajuster la suite de votre parcours.`;
  const comments = Object.entries(result.comments).filter(([, comment]) => comment?.trim());
  const review = result.review ?? [];
  return (
    <div className="ev-result">
      <section className={`ev-decision is-${decision.kind}`} aria-labelledby="exam-result">
        <ProgressRing value={result.percent} size={132} stroke={12} color={decision.color} label={`Score global : ${result.percent} %`}>
          <span className="ev-ring-label"><strong>{result.percent}<small>%</small></strong><span>score global</span></span>
        </ProgressRing>
        <div className="ev-decision-text">
          <p className="ev-decision-kicker"><DecisionIcon size={16} aria-hidden="true" /> Décision</p>
          <h2 id="exam-result">{decision.label}</h2>
          <p>{sentence}</p>
          <p className="ev-decision-meta">
            {exam.submittedAt && <span>Remise le {dateTime.format(new Date(exam.submittedAt))}{exam.onTime ? ' · dans les délais' : ' · après l’échéance'}</span>}
            {result.gradedAt && <span>Corrigée le {dateTime.format(new Date(result.gradedAt))}</span>}
          </p>
          {action && <div className="ev-decision-action">{action}</div>}
        </div>
      </section>

      <div className="ev-result-grid">
        <Card title="Scores par compétence" icon={<BarChart3 size={18} />}>
          <ScoreBars scores={result.scores} passPercent={pass} />
        </Card>
        <Card title="Retour du correcteur" icon={<MessageSquareQuote size={18} />}>
          {!result.feedback?.trim() && !comments.length
            ? <EmptyState icon={<MessageSquareQuote size={24} />} title="Pas de commentaire" description="Le correcteur n’a pas laissé de remarque écrite." />
            : (
              <div className="ev-feedback">
                {result.feedback?.trim() && <blockquote className="ev-quote"><Paragraphs text={result.feedback} /></blockquote>}
                {comments.length > 0 && (
                  <ul className="ev-comments">
                    {comments.map(([partId, comment]) => {
                      const part = exam.definition.parts.find((item) => item.id === partId);
                      return (
                        <li key={partId}>
                          <span className={`ev-icon-tile is-${competenceTone(part?.competence ?? '')}`}><CompetenceIcon competence={part?.competence ?? ''} size={16} /></span>
                          <div><strong>{part?.title ?? partId}</strong><Paragraphs text={comment} /></div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            )}
        </Card>
        {review.length > 0 && (
          <Card title="Activités à revoir" description="Reprenez-les avant une nouvelle tentative." icon={<RotateCcw size={18} />} flush>
            <ul className="kit-list ev-review lc-stagger">
              {review.map((item) => {
                const content = (
                  <>
                    <span className="ev-icon-tile is-accent"><RotateCcw size={16} aria-hidden="true" /></span>
                    <span className="kit-list-main"><strong>{item.title}</strong><small>{item.moduleTitle}</small></span>
                    {reviewHref && <span className="kit-list-end"><ChevronRight size={18} aria-hidden="true" /></span>}
                  </>
                );
                return <li key={item.activityId}>{reviewHref ? <Link className="kit-list-item" to={reviewHref(item.activityId)}>{content}</Link> : <div className="kit-list-item">{content}</div>}</li>;
              })}
            </ul>
          </Card>
        )}
        {extra}
      </div>
    </div>
  );
}

/** Historique des tentatives d'une même évaluation, de la plus récente à la plus ancienne. */
export function AttemptHistory({ history, currentId }: { history: ExamSummary[]; currentId?: string }) {
  const items: TimelineEntry[] = history.map((item) => {
    const decision = item.decision ? decisions[item.decision] : null;
    const tone: TimelineEntry['tone'] = item.status === 'graded' ? (item.decision === 'to_consolidate' ? 'warning' : 'success') : 'brand';
    const Icon = item.status === 'in_progress' ? PenLine : item.status === 'submitted' ? Hourglass : decision?.icon ?? CheckCircle2;
    const when = item.gradedAt ? `Corrigée le ${shortDate.format(new Date(item.gradedAt))}`
      : item.submittedAt ? `Remise le ${shortDate.format(new Date(item.submittedAt))}`
      : `Commencée le ${shortDate.format(new Date(item.startedAt))}`;
    return {
      id: item.id, tone, icon: <Icon size={14} />,
      title: <span className="ev-attempt-title">Tentative {item.number}{item.id === currentId && <span className="ev-attempt-current">affichée</span>}</span>,
      meta: (
        <span className="ev-attempt-meta">
          <span>{when}</span>
          {item.percent !== null && <span className="ev-attempt-score">{item.percent} %</span>}
          {statusBadge(item)}
        </span>
      ),
    };
  });
  return (
    <Card title="Historique des tentatives" description={plural(history.length, 'tentative', 'tentatives')} icon={<History size={18} />} className="ev-history">
      <Timeline items={items} />
    </Card>
  );
}
