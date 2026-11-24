/**
 * Ciné-club de la bibliothèque (onglet « Ciné-club » d'un niveau) : séquences proposées par le professeur en tête, carte du
 * film (affiche dessinée, durée, crédit DW et lien vers le cours gratuit), séquences avec leur état (à voir, faite et son
 * score) et accès au carnet de mots. Facultatif : rien ici ne compte dans le parcours ni le contrat.
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, ChevronRight, Clapperboard, Clock, Eye, ListChecks, NotebookPen, Play, RotateCcw, Sparkles, X } from 'lucide-react';
import { Badge } from '../../components/ui';
import { Callout, Card, ListItem, ProgressRing, Skeleton, useToast } from '../../design/kit';
import { requestApi } from '../../integration/api';
import {
  formatDuration, sequenceHref, recommenderLabels, type CineFilm, type CineOverview, type CineSequence, type FilmRecommendation,
} from '../../integration/cine';
import type { LevelCode } from '../../integration/v2';
import { EmptyScene } from '../pilot/learner-common';
import { FilmCredit, FilmPoster, TimeRange } from './cine-common';
import { errorText } from './word-notebook';
import './cine.css';

/** Vue Ciné-club d'un niveau (GET /learning/cine?level=), relue à la demande. */
export function useCine(token: string, level: LevelCode | null) {
  const [view, setView] = useState<CineOverview | null>(null);
  const [failure, setFailure] = useState('');
  const [reload, setReload] = useState(0);
  useEffect(() => {
    if (!level) return;
    let active = true;
    setFailure('');
    setView(null);
    requestApi<CineOverview>(`/learning/cine?level=${encodeURIComponent(level)}`, token)
      .then((data) => { if (active) setView(data); })
      .catch((error: unknown) => { if (active) setFailure(errorText(error)); });
    return () => { active = false; };
  }, [token, level, reload]);
  return { view, failure, retry: () => setReload((value) => value + 1) };
}

const percentOf = (result: { correct: number; total: number }) => (result.total ? Math.round((result.correct / result.total) * 100) : 0);

function SequenceRow({ film, sequence }: { film: CineFilm; sequence: CineSequence }) {
  const result = sequence.lastResult;
  const score = result ? percentOf(result) : null;
  return (
    <ListItem as="li" href={sequenceHref(film.id, sequence.id)}
      leading={<span className={`cine-seq-badge${result ? ' is-done' : ''}`} aria-hidden="true">{result ? <Check size={16} strokeWidth={3} /> : sequence.position}</span>}
      title={sequence.title}
      subtitle={<span className="cine-row-meta">
        <span><TimeRange start={sequence.start} end={sequence.end} /> · {formatDuration(sequence.end - sequence.start)}</span>
        {sequence.words.length > 0 && <span className="cine-row-words"><NotebookPen size={12} aria-hidden="true" /> {sequence.words.length} mot{sequence.words.length > 1 ? 's' : ''}</span>}
        {sequence.recommendation && <span className="cine-reco-mark"><Sparkles size={12} aria-hidden="true" /> Proposée</span>}
      </span>}
      trailing={<>
        {result && score !== null
          ? <Badge tone={score >= 70 ? 'green' : 'amber'}>{result.correct}/{result.total}</Badge>
          : <span className="lib-todo">À voir</span>}
        <ChevronRight size={18} aria-hidden="true" />
      </>} />
  );
}

/** Séquences proposées par le professeur : note, accès direct et « Masquer ». */
function Recommendations({ items, films, token, onChanged }: { items: FilmRecommendation[]; films: CineFilm[]; token: string; onChanged: () => void }) {
  const toast = useToast();
  const [busy, setBusy] = useState('');
  async function dismiss(item: FilmRecommendation) {
    setBusy(item.id);
    try {
      await requestApi(`/learning/film-recommendations/${encodeURIComponent(item.id)}/dismiss`, token, { method: 'POST', body: {} });
      toast('Proposition masquée. Elle reste accessible dans le Ciné-club.');
      onChanged();
    } catch (error) {
      toast(errorText(error), 'warning');
      setBusy('');
    }
  }
  return (
    <section className="cine-recos" aria-labelledby="cine-recos-title">
      <h2 id="cine-recos-title" className="cine-section-title"><Sparkles size={17} aria-hidden="true" /> Proposées par votre professeur</h2>
      <ul className="cine-reco-list lc-stagger">
        {items.map((item) => {
          const film = films.find((entry) => entry.sequences.some((sequence) => sequence.id === item.sequenceId));
          const sequence = film?.sequences.find((entry) => entry.id === item.sequenceId);
          const filmId = film?.id ?? item.filmId;
          return (
            <li key={item.id} className="cine-reco">
              <span className="cine-reco-icon" aria-hidden="true"><Sparkles size={18} /></span>
              <div className="cine-reco-main">
                <p className="cine-reco-kicker">Par {recommenderLabels[item.recommendedByRole] ?? 'votre professeur'} · {film?.title ?? 'Ciné-club'}</p>
                <h3>{sequence?.title ?? 'Séquence proposée'}</h3>
                {item.note && <p className="cine-reco-text">« {item.note} »</p>}
                {sequence?.lastResult && <p className="cine-reco-done"><Check size={14} aria-hidden="true" /> Déjà faite : {sequence.lastResult.correct}/{sequence.lastResult.total}</p>}
              </div>
              <div className="cine-reco-actions">
                {filmId && <Link className="btn btn-primary btn-sm" to={sequenceHref(filmId, item.sequenceId)}><Play size={15} fill="currentColor" aria-hidden="true" /> Regarder</Link>}
                <button type="button" className="btn btn-ghost btn-sm" disabled={busy === item.id} onClick={() => void dismiss(item)}
                  aria-label={`Masquer la proposition : ${sequence?.title ?? 'séquence'}`}><X size={15} aria-hidden="true" /> Masquer</button>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function FilmCard({ film }: { film: CineFilm }) {
  const ordered = [...film.sequences].sort((a, b) => a.position - b.position);
  const done = ordered.filter((sequence) => sequence.lastResult).length;
  const next = ordered.find((sequence) => !sequence.lastResult) ?? ordered[0];
  const minutes = ordered.reduce((sum, sequence) => sum + (sequence.end - sequence.start), 0);
  return (
    <article className="cine-film" aria-labelledby={`cine-film-${film.id}`}>
      <div className="cine-film-hero">
        <FilmPoster film={film} size="lg" />
        <div className="cine-film-text">
          <div className="cine-film-titles">
            <p className="cine-film-kicker"><Clapperboard size={14} aria-hidden="true" /> Pour aller plus loin · facultatif</p>
            <h2 id={`cine-film-${film.id}`}>{film.title}</h2>
          </div>
          <p className="cine-film-description">{film.description}</p>
          <ul className="cine-film-facts">
            <li><Clock size={14} aria-hidden="true" /> Film de {formatDuration(film.durationSeconds)}</li>
            <li><ListChecks size={14} aria-hidden="true" /> {ordered.length} séquence{ordered.length > 1 ? 's' : ''} · {formatDuration(minutes)}</li>
            <li><Check size={14} aria-hidden="true" /> {done}/{ordered.length} faite{done > 1 ? 's' : ''}</li>
          </ul>
          {next && (
            <Link className="btn btn-primary cine-film-cta" to={sequenceHref(film.id, next.id)}>
              {done === 0 ? <Play size={16} fill="currentColor" aria-hidden="true" /> : done === ordered.length ? <RotateCcw size={16} aria-hidden="true" /> : <Play size={16} fill="currentColor" aria-hidden="true" />}
              {done === 0 ? 'Commencer la séquence 1' : done === ordered.length ? 'Revoir une séquence' : `Continuer : séquence ${next.position}`}
            </Link>
          )}
        </div>
        {ordered.length > 0 && (
          <span className="cine-film-ring">
            <ProgressRing value={(done / ordered.length) * 100} size={64} stroke={7} color="var(--accent)" label={`${done} séquences faites sur ${ordered.length}`}>
              <small className="cine-ring-text">{done}/{ordered.length}</small>
            </ProgressRing>
          </span>
        )}
      </div>
      <FilmCredit film={film} />
      <ul className="kit-list cine-seq-list lc-stagger" aria-label={`Séquences de ${film.title}`}>
        {ordered.map((sequence) => <SequenceRow key={sequence.id} film={film} sequence={sequence} />)}
      </ul>
    </article>
  );
}

/** Mode d'emploi : avant, regarder, après. */
function HowItWorks({ words }: { words: number }) {
  const steps = [
    { icon: <Eye size={16} aria-hidden="true" />, title: 'Avant', text: 'La situation et les mots-clés à repérer.' },
    { icon: <Play size={16} aria-hidden="true" />, title: 'Regarder', text: 'Le lecteur YouTube officiel, sous-titres allemands proposés.' },
    { icon: <ListChecks size={16} aria-hidden="true" />, title: 'Après', text: 'Des questions corrigées, avec explications.' },
  ];
  return (
    <Card className="cine-how" title="Comment ça marche ?" icon={<Clapperboard size={18} />}>
      <ol className="cine-how-steps">
        {steps.map((step, index) => (
          <li key={step.title}><span className="cine-how-icon">{step.icon}</span><span><strong>{index + 1}. {step.title}</strong><small>{step.text}</small></span></li>
        ))}
      </ol>
      <Link className="cine-words-link" to="/espace/mots">
        <span className="cine-words-icon" aria-hidden="true"><NotebookPen size={18} /></span>
        <span><strong>Mon carnet de mots</strong><small>{words ? `${words} mot${words > 1 ? 's' : ''} noté${words > 1 ? 's' : ''} dans les films de ce niveau` : 'Notez les mots entendus pendant les séquences'}</small></span>
        <ChevronRight size={17} aria-hidden="true" />
      </Link>
    </Card>
  );
}

/** Contenu de l'onglet « Ciné-club » d'un niveau de la bibliothèque. */
export function CineSection({ token, level, cine }: { token: string; level: LevelCode; cine: ReturnType<typeof useCine> }) {
  const { view, failure, retry } = cine;
  if (failure) {
    return (
      <div role="alert"><Callout tone="warning" title="Ciné-club indisponible">
        <p>{failure}</p>
        <button type="button" className="btn btn-outline btn-sm" onClick={retry}><RotateCcw size={15} aria-hidden="true" /> Réessayer</button>
      </Callout></div>
    );
  }
  if (!view) {
    return (
      <div className="cine-loading" role="status" aria-label="Chargement du Ciné-club…">
        <span className="cine-skel-film" aria-hidden="true"><Skeleton width={150} height={200} radius={18} /><span><Skeleton width="40%" height={22} /><Skeleton width="85%" /><Skeleton width="70%" /><Skeleton width={180} height={42} radius={12} /></span></span>
        <span className="kit-skeleton-card" aria-hidden="true">{[0, 1, 2].map((index) => <Skeleton key={index} width={`${90 - index * 12}%`} height={18} />)}</span>
      </div>
    );
  }
  const films = view.films;
  const recommendations = view.recommendations.filter((item) => !item.dismissedAt
    && films.some((film) => film.sequences.some((sequence) => sequence.id === item.sequenceId)));
  const words = films.reduce((sum, film) => sum + film.sequences.reduce((total, sequence) => total + sequence.words.length, 0), 0);
  return (
    <div className="cine-section">
      {recommendations.length > 0 && <Recommendations items={recommendations} films={films} token={token} onChanged={retry} />}
      {films.length === 0 ? (
        <Card><EmptyScene art="books" title={`Pas encore de film pour le niveau ${level}`}
          description="Les films du Ciné-club apparaîtront ici dès leur publication. En attendant, explorez les cours du niveau." /></Card>
      ) : (
        <div className="cine-layout">
          <div className="cine-films lc-stagger">{films.map((film) => <FilmCard key={film.id} film={film} />)}</div>
          <HowItWorks words={words} />
        </div>
      )}
    </div>
  );
}
