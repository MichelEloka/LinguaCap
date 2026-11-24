/**
 * Séquence du Ciné-club (/espace/cine/:filmId/:sequenceId) en trois temps :
 * 1. Avant : la situation sans tout dévoiler, les questions d'anticipation (non notées) et les mots-clés à repérer ;
 * 2. Regarder : le lecteur YouTube borné à la séquence (après accord), le carnet à côté (dessous sur mobile) ;
 * 3. Après : les questions avec le composant d'exercice (remise, corrigé par question, explication), à refaire à volonté.
 * Facultatif : hors parcours, hors contrat et hors durées conseillées.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, BookOpenText, Captions, Clapperboard, Clock, Compass, Eye, KeyRound, ListChecks, PencilLine, RotateCcw, Sparkles,
} from 'lucide-react';
import { Badge } from '../../components/ui';
import { Callout, Card, SkeletonCard, useToast } from '../../design/kit';
import { requestApi } from '../../integration/api';
import {
  cineLibraryHref, formatDuration, recommenderLabels, sequenceHref, youtubeWatchUrl, type CineFilm, type CineOverview, type CineSequence, type Film, type FilmSequence,
} from '../../integration/cine';
import { asQuestionView, type QuestionView } from '../../integration/v4';
import { ExerciseActivity, type ActivityDetail, type Grade } from '../pilot/LearnerSession';
import { LessonContent } from '../pilot/LessonContent';
import { CineStepper, FilmCredit, KeywordCard, keywordHeadword, keywordNote, TimeRange } from './cine-common';
import { errorText, SequenceNotebook, sameEntry, useLearnerWords } from './word-notebook';
import { YoutubePlayer } from './youtube-player';
import '../pilot/learner-session.css';
import '../pilot/study-lexicon.css';
import '../library/library.css';
import './cine.css';

type Step = 'avant' | 'regarder' | 'apres';
const steps: Step[] = ['avant', 'regarder', 'apres'];

export function SequencePage({ token }: { token: string }) {
  const { filmId = '', sequenceId = '' } = useParams();
  return <SequenceReader key={`${filmId}/${sequenceId}`} token={token} filmId={filmId} sequenceId={sequenceId} />;
}

function SequenceReader({ token, filmId, sequenceId }: { token: string; filmId: string; sequenceId: string }) {
  const navigate = useNavigate();
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const [film, setFilm] = useState<Film | null>(null);
  const [cine, setCine] = useState<CineFilm | null>(null);
  const [questions, setQuestions] = useState<QuestionView[] | null>(null);
  const [failure, setFailure] = useState('');
  const [questionsFailure, setQuestionsFailure] = useState('');
  const [retry, setRetry] = useState(0);
  const [cineReload, setCineReload] = useState(0);
  const [grade, setGrade] = useState<Grade | null>(null);
  const [round, setRound] = useState(0);
  const [fresh, setFresh] = useState(false);
  const [watched, setWatched] = useState(false);
  const notebook = useLearnerWords(token);

  const requested = params.get('etape');
  const step: Step = steps.find((item) => item === requested) ?? 'avant';
  const go = useCallback((next: Step) => {
    setParams(next === 'avant' ? {} : { etape: next }, { replace: true });
    window.requestAnimationFrame(() => document.getElementById('cine-steps-anchor')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  }, [setParams]);

  useEffect(() => {
    let active = true;
    setFailure('');
    requestApi<Film>(`/films/${encodeURIComponent(filmId)}`, token)
      .then((loaded) => { if (active) setFilm(loaded); })
      .catch((error: unknown) => { if (active) setFailure(errorText(error)); });
    return () => { active = false; };
  }, [token, filmId, retry]);

  // État de l'élève (dernier résultat, recommandation) : facultatif, la séquence reste ouverte sans lui.
  useEffect(() => {
    if (!film) return;
    let active = true;
    requestApi<CineOverview>(`/learning/cine?level=${encodeURIComponent(film.levelCode)}`, token)
      .then((view) => { if (active) setCine(view.films.find((item) => item.id === film.id) ?? null); })
      .catch(() => undefined);
    return () => { active = false; };
  }, [token, film, cineReload]);

  const sequence: FilmSequence | undefined = film?.sequences.find((item) => item.id === sequenceId);
  const state: CineSequence | undefined = cine?.sequences.find((item) => item.id === sequenceId);

  // Questions « après » : jointes au film, sinon lues dans la leçon de la séquence (sans corrigé).
  useEffect(() => {
    if (!sequence) return;
    if (sequence.questions?.length) { setQuestions(sequence.questions.map(asQuestionView)); return; }
    let active = true;
    setQuestionsFailure('');
    requestApi<{ questions: QuestionView[] }>(`/lessons/${encodeURIComponent(sequence.lessonId)}`, token)
      .then((lesson) => { if (active) setQuestions(lesson.questions.map(asQuestionView)); })
      .catch((error: unknown) => { if (active) setQuestionsFailure(errorText(error)); });
    return () => { active = false; };
  }, [token, sequence, retry]);

  const ordered = useMemo(() => [...(film?.sequences ?? [])].sort((a, b) => a.position - b.position), [film]);
  const index = ordered.findIndex((item) => item.id === sequenceId);
  const previous = index > 0 ? ordered[index - 1] : undefined;
  const next = index >= 0 ? ordered[index + 1] : undefined;
  const back = cineLibraryHref(film?.levelCode);

  if (!film || !sequence) {
    return (
      <div className="study cine-seq">
        <Link className="study-back" to="/espace/bibliotheque?vue=cine"><ArrowLeft size={16} aria-hidden="true" /> Ciné-club</Link>
        {failure || (film && !sequence) ? (
          <section className="study-error" aria-labelledby="cine-error-title">
            <h1 id="cine-error-title">Séquence indisponible</h1>
            <p className="inline-message warning" role="alert">{failure || 'Cette séquence n’existe plus dans le film.'}</p>
            <div className="study-error-actions">
              <button className="btn btn-primary" type="button" onClick={() => setRetry((value) => value + 1)}>Réessayer</button>
              <Link className="btn btn-outline" to="/espace/bibliotheque?vue=cine">Retour au Ciné-club</Link>
            </div>
          </section>
        ) : <><SkeletonCard lines={3} label="Chargement de la séquence…" /><SkeletonCard lines={6} /></>}
      </div>
    );
  }

  const last = state?.lastResult ?? null;
  const reviewing = !fresh && !grade && Boolean(last?.attemptId);
  const done = Boolean(grade || last);
  const duration = sequence.end - sequence.start;
  const noted = (notebook.words ?? []).filter((item) => item.sourceKind === 'film' && item.sourceId === sequence.id);
  const recommendation = state?.recommendation ?? null;

  const detail: ActivityDetail = {
    id: sequence.id, kind: 'exercise', title: sequence.title, estimatedMinutes: 10,
    status: grade || reviewing ? 'completed' : 'todo', state: {}, attemptId: reviewing ? last?.attemptId ?? null : null,
    lesson: { id: sequence.lessonId, title: sequence.title, description: '' }, transcript: null, questions: questions ?? [], placements: [],
  };

  async function noteKeyword(word: string, text: string) {
    if (noted.some((item) => sameEntry(item, word, sequence?.id ?? null))) return;
    try {
      await notebook.add({ word, note: text, sourceKind: 'film', sourceId: sequence?.id ?? null });
      toast(`« ${word} » est noté dans votre carnet.`);
    } catch (error) {
      toast(errorText(error), 'warning');
    }
  }

  function again() {
    setGrade(null);
    setFresh(true);
    setRound((value) => value + 1);
    document.getElementById('cine-steps-anchor')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <div className="study cine-seq lc-enter">
      <header className="cine-seq-head">
        <Link className="study-back" to={back}><ArrowLeft size={16} aria-hidden="true" /> Ciné-club</Link>
        <div className="cine-seq-hero">
          <span className="cine-seq-num" aria-hidden="true"><small>Séq.</small>{sequence.position}</span>
          <div className="cine-seq-titles">
            <div className="study-head-tags">
              <Badge tone="blue">{film.levelCode}</Badge>
              <Badge tone="violet"><Clapperboard size={12} aria-hidden="true" /> Ciné-club</Badge>
              <Badge tone="neutral">Facultatif</Badge>
              {last && !grade && <Badge tone={last.total && last.correct / last.total >= .7 ? 'green' : 'amber'}>Dernier score {last.correct}/{last.total}</Badge>}
              {grade && <Badge tone={grade.total && grade.correct / grade.total >= .7 ? 'green' : 'amber'}>Score {grade.correct}/{grade.total}</Badge>}
            </div>
            <h1 id="cine-seq-title">{sequence.title}</h1>
            <p className="cine-seq-meta">
              <span><Clapperboard size={15} aria-hidden="true" /> {film.title} · séquence {sequence.position} sur {ordered.length}</span>
              <span><Clock size={15} aria-hidden="true" /> {formatDuration(duration)} · <TimeRange start={sequence.start} end={sequence.end} /></span>
            </p>
          </div>
        </div>
        {recommendation && (
          <div className="cine-reco-note">
            <Sparkles size={16} aria-hidden="true" />
            <p><strong>Proposée par {recommenderLabels[recommendation.recommendedByRole] ?? 'votre professeur'}</strong>{recommendation.note ? <> : « {recommendation.note} »</> : '.'}</p>
          </div>
        )}
      </header>

      <span id="cine-steps-anchor" className="cine-anchor" aria-hidden="true" />
      <CineStepper value={step} onChange={(id) => go(id as Step)} steps={[
        { id: 'avant', label: 'Avant', caption: 'Situation et mots-clés', icon: <Compass size={17} />, done: step !== 'avant' || watched || done },
        { id: 'regarder', label: 'Regarder', caption: `${formatDuration(duration)} · carnet`, icon: <Eye size={17} />, done: watched || done },
        { id: 'apres', label: 'Après', caption: questions ? `${questions.length} questions` : 'Questions', icon: <ListChecks size={17} />, done },
      ]} />

      <div className="cine-panel" role="tabpanel" id={`cine-panel-${step}`} aria-labelledby={`cine-step-${step}`} key={step}>
        {step === 'avant' && (
          <div className="cine-before lc-stagger">
            <Card className="cine-context" title="Avant de regarder" description="La situation, et ce qu’il faut repérer" icon={<Compass size={18} />}>
              <LessonContent text={sequence.context} />
            </Card>
            <Card className="cine-keywords-card" title="Mots-clés" icon={<KeyRound size={18} />}
              description={`${sequence.keywords.length} mots à repérer · touchez le signet pour les noter`}>
              <ul className="cine-keywords lc-stagger">
                {sequence.keywords.map((keyword) => {
                  const headword = keywordHeadword(keyword);
                  return <KeywordCard key={headword} keyword={keyword} noted={noted.some((item) => sameEntry(item, headword, sequence.id))}
                    onNote={() => void noteKeyword(headword, keywordNote(keyword))} />;
                })}
              </ul>
            </Card>
            <div className="cine-next">
              <p><BookOpenText size={16} aria-hidden="true" /> Gardez ces questions en tête : vous y répondrez après la séquence.</p>
              <button type="button" className="btn btn-primary btn-lg" onClick={() => go('regarder')}>Regarder la séquence <ArrowRight size={18} aria-hidden="true" /></button>
            </div>
          </div>
        )}

        {step === 'regarder' && (
          <div className="cine-watch">
            <div className="cine-watch-main">
              <YoutubePlayer videoId={film.videoId} title={`${film.title}, séquence ${sequence.position} : ${sequence.title}`}
                start={sequence.start} end={sequence.end} watchUrl={youtubeWatchUrl(film.videoUrl, sequence.start)}
                onEnded={() => { setWatched(true); toast('Fin de la séquence : place aux questions quand vous êtes prêt.'); }} />
              <p className="cine-tip"><Captions size={16} aria-hidden="true" />
                <span>Sous-titres allemands proposés : touchez <strong>CC</strong> dans le lecteur pour les afficher ou les masquer. Revoyez la séquence autant de fois que nécessaire.</span></p>
              <FilmCredit film={film} start={sequence.start} compact />
            </div>
            <SequenceNotebook sequenceId={sequence.id} notebook={notebook} />
            <div className="cine-next is-wide">
              <button type="button" className="btn btn-ghost" onClick={() => go('avant')}><ArrowLeft size={17} aria-hidden="true" /> Revoir le contexte</button>
              <button type="button" className="btn btn-primary btn-lg" onClick={() => { setWatched(true); go('apres'); }}>Répondre aux questions <ArrowRight size={18} aria-hidden="true" /></button>
            </div>
          </div>
        )}

        {step === 'apres' && (
          <article className="study-activity cine-after" aria-labelledby="cine-after-title">
            <header className="study-activity-head">
              <span className="study-kind is-exercise" aria-hidden="true"><PencilLine size={22} /></span>
              <div className="study-activity-titles">
                <p>{questions ? `${questions.length} questions · corrigé immédiat` : 'Questions'}</p>
                <h2 id="cine-after-title">Avez-vous bien compris ?</h2>
              </div>
            </header>
            {reviewing && (
              <Callout tone="info" title={`Votre dernier essai : ${last?.correct}/${last?.total}`}>
                <p>Voici son corrigé. Refaites les questions quand vous voulez : seul le dernier résultat compte.</p>
              </Callout>
            )}
            {questionsFailure ? (
              <div role="alert"><Callout tone="warning" title="Questions indisponibles"><p>{questionsFailure}</p>
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setRetry((value) => value + 1)}><RotateCcw size={15} aria-hidden="true" /> Réessayer</button></Callout></div>
            ) : questions === null ? <SkeletonCard lines={5} label="Chargement des questions…" /> : (
              <ExerciseActivity key={`${round}-${reviewing ? 'revue' : 'manche'}`} activity={detail} token={token} grade={grade} onRenew={() => undefined}
                onSaveState={() => undefined}
                onGraded={async (result) => {
                  setGrade(result);
                  setWatched(true);
                  setCineReload((value) => value + 1);
                  toast(`Questions corrigées : ${result.correct} sur ${result.total}. Le corrigé est affiché.`);
                }} />
            )}
            {(grade || reviewing) && (
              <div className="lib-again">
                <p>Envie de progresser encore ? Revoyez la séquence, puis refaites les questions : seul le dernier résultat compte.</p>
                <button type="button" className="btn btn-outline" onClick={again}><RotateCcw size={16} aria-hidden="true" /> Refaire les questions</button>
              </div>
            )}
          </article>
        )}
      </div>

      <nav className="study-pager cine-pager" aria-label="Changer de séquence">
        {previous
          ? <Link className="btn btn-ghost" to={sequenceHref(film.id, previous.id)}><ArrowLeft size={18} aria-hidden="true" /> <span className="cine-pager-long">Séquence précédente</span><span className="cine-pager-short">Précédente</span></Link>
          : <span />}
        <span className="study-pager-count" aria-hidden="true">{index + 1} / {ordered.length}</span>
        {next
          ? <button type="button" className={`btn ${done ? 'btn-primary' : 'btn-outline'}`} onClick={() => navigate(sequenceHref(film.id, next.id))}><span className="cine-pager-long">Séquence suivante</span><span className="cine-pager-short">Suivante</span> <ArrowRight size={18} aria-hidden="true" /></button>
          : <Link className="btn btn-outline" to={back}>Retour au film</Link>}
      </nav>
    </div>
  );
}
