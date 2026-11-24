/**
 * Fiche élève du professeur, onglet « Ciné-club et mots » : séquences faites et scores (corrigé consultable), propositions
 * envoyées et leur suite, mots notés par l'élève ; action « Proposer une séquence » (choix du film et de la séquence,
 * mot facultatif). Lectures : GET /learning/cine, /learning/words et /learning/film-recommendations avec `learnerId`.
 */
import { useEffect, useId, useMemo, useState, type FormEvent } from 'react';
import { Check, Clapperboard, Eye, NotebookPen, RotateCcw, Send, Sparkles, Trophy } from 'lucide-react';
import { Badge, EmptyState, StatCard } from '../../components/ui';
import { Callout, Card, Drawer, SkeletonCard, useToast } from '../../design/kit';
import { requestApi } from '../../integration/api';
import {
  cineLimits, formatDuration, wordSourceLabels, type CineFilm, type CineOverview, type CineSequence, type FilmRecommendation, type LearnerWord,
} from '../../integration/cine';
import { asQuestionView, type QuestionView } from '../../integration/v4';
import { ExerciseReviewDrawer } from '../pilot/study-review';
import { FilmPoster, TimeRange } from './cine-common';
import { articleOf, errorText } from './word-notebook';
import './cine.css';

const dateFormat = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' });
const percentOf = (result: { correct: number; total: number }) => (result.total ? Math.round((result.correct / result.total) * 100) : 0);

interface StaffCineData { overview: CineOverview; words: LearnerWord[]; recommendations: FilmRecommendation[] }
interface Located { film: CineFilm; sequence: CineSequence }

function locate(films: CineFilm[], sequenceId: string): Located | undefined {
  for (const film of films) {
    const sequence = film.sequences.find((item) => item.id === sequenceId);
    if (sequence) return { film, sequence };
  }
  return undefined;
}

/** Proposer une séquence : film (par niveau), séquence (avec ce que l'élève en a fait), mot facultatif. */
function ProposeDrawer({ learnerId, learnerName, films, recommendations, preferredLevel, token, onClose, onDone }: {
  learnerId: string; learnerName: string; films: CineFilm[]; recommendations: FilmRecommendation[]; preferredLevel?: string | null; token: string;
  onClose: () => void; onDone: () => void;
}) {
  const toast = useToast();
  const formId = useId();
  const [filmId, setFilmId] = useState(() => (films.find((film) => film.levelCode === preferredLevel) ?? films[0])?.id ?? '');
  const film = films.find((item) => item.id === filmId);
  const pending = new Set(recommendations.filter((item) => !item.dismissedAt).map((item) => item.sequenceId));
  const ordered = [...(film?.sequences ?? [])].sort((a, b) => a.position - b.position);
  const [sequenceId, setSequenceId] = useState(() => ordered.find((item) => !pending.has(item.id) && !item.lastResult)?.id ?? '');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  function chooseFilm(id: string) {
    setFilmId(id);
    const next = [...(films.find((item) => item.id === id)?.sequences ?? [])].sort((a, b) => a.position - b.position);
    setSequenceId(next.find((item) => !pending.has(item.id) && !item.lastResult)?.id ?? '');
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!sequenceId) { setError('Choisissez une séquence à proposer.'); return; }
    setBusy(true);
    setError('');
    try {
      await requestApi<FilmRecommendation>('/learning/film-recommendations', token, { method: 'POST', body: { learnerId, sequenceId, note: note.trim() } });
      toast(`Séquence proposée à ${learnerName}.`);
      onDone();
    } catch (failure) {
      setError(errorText(failure));
      setBusy(false);
    }
  }

  return (
    <Drawer title="Proposer une séquence" description={`À ${learnerName} : une proposition facultative, sans planification.`} onClose={onClose}
      footer={<div className="ed-drawer-actions sc-drawer-actions">
        <button type="button" className="btn btn-ghost" onClick={onClose}>Annuler</button>
        <button type="submit" form={formId} className="btn btn-primary" disabled={busy || !sequenceId}><Send size={16} aria-hidden="true" /> {busy ? 'Envoi…' : 'Proposer'}</button>
      </div>}>
      <form id={formId} className="sc-propose" onSubmit={submit}>
        <label>Film
          <select value={filmId} onChange={(event) => chooseFilm(event.target.value)}>
            {films.map((item) => <option key={item.id} value={item.id}>{item.levelCode} · {item.title}</option>)}
          </select>
        </label>
        <fieldset className="sc-sequences">
          <legend>Séquence</legend>
          {ordered.map((sequence) => {
            const proposed = pending.has(sequence.id);
            return (
              <label key={sequence.id} className={`sc-sequence${sequence.id === sequenceId ? ' is-checked' : ''}${proposed ? ' is-disabled' : ''}`}>
                <input type="radio" name="sequence" value={sequence.id} checked={sequence.id === sequenceId} disabled={proposed}
                  onChange={() => setSequenceId(sequence.id)} />
                <span className="sc-sequence-num" aria-hidden="true">{sequence.position}</span>
                <span className="sc-sequence-text">
                  <strong>{sequence.title}</strong>
                  <small><TimeRange start={sequence.start} end={sequence.end} /> · {formatDuration(sequence.end - sequence.start)}</small>
                </span>
                {proposed ? <Badge tone="amber">Déjà proposée</Badge>
                  : sequence.lastResult ? <Badge tone={percentOf(sequence.lastResult) >= 70 ? 'green' : 'amber'}>Faite {sequence.lastResult.correct}/{sequence.lastResult.total}</Badge>
                  : <Badge tone="neutral">Pas encore vue</Badge>}
              </label>
            );
          })}
        </fieldset>
        <label>Mot pour l’élève <span className="cw-optional">facultatif</span>
          <textarea rows={3} maxLength={cineLimits.recommendationNoteChars} value={note} onChange={(event) => setNote(event.target.value)}
            placeholder="Pour réviser les indications de chemin avant notre prochaine séance." />
          <small className="sc-counter">{note.length} / {cineLimits.recommendationNoteChars}</small>
        </label>
        <p className="sc-propose-note"><Sparkles size={14} aria-hidden="true" /> L’élève la voit en tête de son Ciné-club. Rien n’est ajouté à son planning ni à son contrat.</p>
        {error && <Callout tone="warning"><p role="alert">{error}</p></Callout>}
      </form>
    </Drawer>
  );
}

export function StaffCineTab({ learnerId, learnerName, token, preferredLevel }: {
  learnerId: string; learnerName: string; token: string; preferredLevel?: string | null;
}) {
  const [data, setData] = useState<StaffCineData | null>(null);
  const [failure, setFailure] = useState('');
  const [reload, setReload] = useState(0);
  const [proposing, setProposing] = useState(false);
  const [review, setReview] = useState<{ attemptId: string; title: string; questions: QuestionView[] | null } | null>(null);
  const id = encodeURIComponent(learnerId);

  useEffect(() => {
    let active = true;
    setFailure('');
    Promise.all([
      requestApi<CineOverview>(`/learning/cine?learnerId=${id}`, token),
      requestApi<LearnerWord[]>(`/learning/words?learnerId=${id}`, token),
      requestApi<FilmRecommendation[]>(`/learning/film-recommendations?learnerId=${id}`, token),
    ]).then(([overview, words, recommendations]) => {
      if (active) setData({ overview, words, recommendations });
    }).catch((error: unknown) => { if (active) setFailure(errorText(error)); });
    return () => { active = false; };
  }, [id, token, reload]);

  const films = useMemo(() => data?.overview.films ?? [], [data]);
  const done = useMemo(() => films.flatMap((film) => film.sequences.filter((sequence) => sequence.lastResult).map((sequence) => ({ film, sequence })))
    .sort((a, b) => (b.sequence.lastResult?.submittedAt ?? '').localeCompare(a.sequence.lastResult?.submittedAt ?? '')), [films]);
  const total = films.reduce((sum, film) => sum + film.sequences.length, 0);

  async function openReview(item: Located) {
    const result = item.sequence.lastResult;
    if (!result) return;
    const title = `${item.film.title} · ${item.sequence.title}`;
    const lesson = await requestApi<{ questions: QuestionView[] }>(`/lessons/${encodeURIComponent(item.sequence.lessonId)}`, token).catch(() => null);
    setReview({ attemptId: result.attemptId, title, questions: lesson ? lesson.questions.map(asQuestionView) : null });
  }

  if (failure) {
    return (
      <div role="alert"><Callout tone="warning" title="Ciné-club indisponible">
        <p>{failure}</p>
        <button type="button" className="btn btn-outline btn-sm" onClick={() => setReload((value) => value + 1)}><RotateCcw size={15} aria-hidden="true" /> Réessayer</button>
      </Callout></div>
    );
  }
  if (!data) return <div className="staff-page-body"><SkeletonCard lines={5} label="Chargement du Ciné-club de l’élève…" /></div>;

  const average = done.length ? Math.round(done.reduce((sum, item) => sum + percentOf(item.sequence.lastResult ?? { correct: 0, total: 0 }), 0) / done.length) : null;
  const active = data.recommendations.filter((item) => !item.dismissedAt);
  const words = data.words;

  return (
    <div className="sc-tab">
      <div className="sc-head">
        <div>
          <h2>Ciné-club et mots</h2>
          <p>Pour aller plus loin avec un film : facultatif, hors parcours et hors contrat.</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => setProposing(true)} disabled={!films.length}>
          <Sparkles size={17} aria-hidden="true" /> Proposer une séquence
        </button>
      </div>

      <div className="sc-stats lc-stagger">
        <StatCard label="Séquences faites" value={`${done.length} / ${total}`} icon={<Clapperboard size={20} />} />
        <StatCard label="Score moyen" value={average === null ? '—' : `${average} %`} icon={<Trophy size={20} />} />
        <StatCard label="Mots notés" value={data.overview.wordCount ?? words.length} icon={<NotebookPen size={20} />} />
        <StatCard label="Propositions en cours" value={active.length} icon={<Sparkles size={20} />} />
      </div>

      <div className="staff-sheet-grid">
        <Card title="Séquences faites" description="Dernier résultat de chaque séquence" icon={<Clapperboard size={18} />} flush>
          {done.length === 0 ? (
            <EmptyState icon={<Clapperboard size={26} />} title="Aucune séquence faite" description="Les séquences du Ciné-club que l’élève termine apparaîtront ici avec leur score." />
          ) : (
            <ul className="sc-rows lc-stagger">
              {done.map((item) => {
                const result = item.sequence.lastResult as NonNullable<CineSequence['lastResult']>;
                const score = percentOf(result);
                return (
                  <li key={item.sequence.id} className="sc-row">
                    <span className={`staff-score is-${score >= 70 ? 'success' : score >= 50 ? 'brand' : 'warning'}`}>{score}%</span>
                    <span className="sc-row-main">
                      <strong>{item.sequence.title}</strong>
                      <small>{item.film.title} · séquence {item.sequence.position} · {result.correct}/{result.total} · {dateFormat.format(new Date(result.submittedAt))}
                        {item.sequence.words.length > 0 && ` · ${item.sequence.words.length} mot${item.sequence.words.length > 1 ? 's' : ''} noté${item.sequence.words.length > 1 ? 's' : ''}`}</small>
                    </span>
                    <button type="button" className="icon-button" onClick={() => void openReview(item)}
                      aria-label={`Voir le corrigé : ${item.sequence.title}`} title="Voir le corrigé"><Eye size={17} aria-hidden="true" /></button>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <Card title="Propositions" description={data.recommendations.length ? `${data.recommendations.length} envoyée${data.recommendations.length > 1 ? 's' : ''}` : undefined}
          icon={<Sparkles size={18} />} flush>
          {data.recommendations.length === 0 ? (
            <EmptyState icon={<Sparkles size={26} />} title="Aucune proposition" description="Proposez une séquence adaptée : l’élève la verra en tête de son Ciné-club."
              action={films.length ? <button type="button" className="btn btn-soft btn-sm" onClick={() => setProposing(true)}>Proposer une séquence</button> : undefined} />
          ) : (
            <ul className="sc-rows lc-stagger">
              {data.recommendations.map((item) => {
                const found = locate(films, item.sequenceId);
                const result = found?.sequence.lastResult;
                const doneAfter = result && result.submittedAt >= item.createdAt;
                return (
                  <li key={item.id} className="sc-row">
                    {found ? <FilmPoster film={found.film} size="sm" /> : <span className="sc-row-icon" aria-hidden="true"><Clapperboard size={16} /></span>}
                    <span className="sc-row-main">
                      <strong>{found?.sequence.title ?? 'Séquence retirée du catalogue'}</strong>
                      <small>{found ? `${found.film.title} · ` : ''}proposée le {dateFormat.format(new Date(item.createdAt))}{item.note ? ` · « ${item.note} »` : ''}</small>
                    </span>
                    {doneAfter ? <Badge tone="green"><Check size={12} aria-hidden="true" /> Faite {result.correct}/{result.total}</Badge>
                      : item.dismissedAt ? <Badge tone="neutral">Écartée</Badge>
                      : <Badge tone="amber">En cours</Badge>}
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>

      <Card title="Mots notés" description={words.length ? `${words.length} mot${words.length > 1 ? 's' : ''}, du plus récent au plus ancien` : undefined} icon={<NotebookPen size={18} />}>
        {words.length === 0 ? (
          <EmptyState icon={<NotebookPen size={26} />} title="Aucun mot noté" description="Les mots que l’élève note pendant les films ou depuis les lexiques apparaîtront ici." />
        ) : (
          <ul className="sc-words lc-stagger">
            {words.slice(0, 40).map((word) => {
              const found = word.sourceKind === 'film' && word.sourceId ? locate(films, word.sourceId) : undefined;
              return (
                <li key={word.id} className="cw-chip" data-article={articleOf(word.word) ?? undefined}>
                  <span className="cw-chip-text">
                    <strong lang="de">{word.word}</strong>
                    <small>{word.note || 'Sans traduction'} · {found ? `${found.film.levelCode}, séq. ${found.sequence.position}` : wordSourceLabels[word.sourceKind]}</small>
                  </span>
                </li>
              );
            })}
          </ul>
        )}
        {words.length > 40 && <p className="sc-more">et {words.length - 40} autres mots.</p>}
      </Card>

      {proposing && (
        <ProposeDrawer learnerId={learnerId} learnerName={learnerName} films={films} recommendations={data.recommendations} preferredLevel={preferredLevel}
          token={token} onClose={() => setProposing(false)} onDone={() => { setProposing(false); setReload((value) => value + 1); }} />
      )}
      {review && <ExerciseReviewDrawer attemptId={review.attemptId} token={token} questions={review.questions} title={`Corrigé · ${review.title}`} onClose={() => setReview(null)} />}
    </div>
  );
}
