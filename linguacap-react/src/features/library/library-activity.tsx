/**
 * Lecteur d'une activité de la bibliothèque (/espace/bibliotheque/:versionId/:activityId) : mêmes composants que la
 * séance (LessonActivity, ExerciseActivity sans séance), sommaire du module et passage à l'activité suivante.
 */
import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, BookOpen, Check, LibraryBig, PencilLine, RotateCcw } from 'lucide-react';
import { Badge } from '../../components/ui';
import { Callout, SkeletonCard, useToast } from '../../design/kit';
import { requestApi } from '../../integration/api';
import { competenceLabels, type Library, type LibraryActivity, type LibraryLevel, type LibraryModule } from '../../integration/v2';
import { ExerciseActivity, LessonActivity, type ActivityDetail, type Grade } from '../pilot/LearnerSession';
import { errorText } from '../onboarding/onboarding-kit';
import { activityHref, scorePercent } from './LibraryPage';
import '../pilot/learner-session.css';
import './library.css';

const kindNames = { lesson: 'Leçon', exercise: 'Exercice', review: 'Révision', assessment: 'Évaluation' };

export function LibraryActivityPage({ token }: { token: string }) {
  const { versionId = '', activityId = '' } = useParams();
  return <LibraryReader key={`${versionId}/${activityId}`} token={token} versionId={versionId} activityId={activityId} />;
}

function LibraryReader({ token, versionId, activityId }: { token: string; versionId: string; activityId: string }) {
  const navigate = useNavigate();
  const toast = useToast();
  const [activity, setActivity] = useState<LibraryActivity | null>(null);
  const [library, setLibrary] = useState<Library | null>(null);
  const [failure, setFailure] = useState('');
  const [reload, setReload] = useState(0);
  const [grade, setGrade] = useState<Grade | null>(null);
  const [round, setRound] = useState(0);
  const [lessonDone, setLessonDone] = useState(false);

  useEffect(() => {
    let active = true;
    setFailure('');
    requestApi<LibraryActivity>(`/learning/library/${encodeURIComponent(versionId)}/activities/${encodeURIComponent(activityId)}`, token)
      .then((view) => { if (active) setActivity(view); })
      .catch((error: unknown) => { if (active) setFailure(errorText(error)); });
    return () => { active = false; };
  }, [token, versionId, activityId, reload]);

  useEffect(() => {
    let active = true;
    requestApi<Library>('/learning/library', token).then((view) => { if (active) setLibrary(view); }).catch(() => undefined);
    return () => { active = false; };
  }, [token]);

  // Les adresses des supports sont temporaires : relire l'activité les renouvelle.
  const renew = useCallback(() => setReload((value) => value + 1), []);

  const level: LibraryLevel | undefined = library?.levels.find((item) => item.trackVersionId === versionId);
  const module: LibraryModule | undefined = level?.modules.find((item) => item.activities.some((entry) => entry.id === activityId));
  const index = module ? module.activities.findIndex((entry) => entry.id === activityId) : -1;
  const previous = module && index > 0 ? module.activities[index - 1] : undefined;
  const next = module && index >= 0 ? module.activities[index + 1] : undefined;
  const item = module?.activities[index];
  const back = `/espace/bibliotheque?niveau=${activity?.levelCode ?? level?.levelCode ?? ''}${activity?.moduleId ? `&module=${encodeURIComponent(activity.moduleId)}` : ''}`;

  if (!activity) {
    return (
      <div className="study lib-reader">
        <Link className="study-back" to="/espace/bibliotheque"><ArrowLeft size={16} aria-hidden="true" /> Bibliothèque</Link>
        {failure ? (
          <section className="study-error" aria-labelledby="lib-error-title">
            <h1 id="lib-error-title">Activité indisponible</h1>
            <p className="inline-message warning" role="alert">{failure}</p>
            <div className="study-error-actions">
              <button className="btn btn-primary" type="button" onClick={renew}>Réessayer</button>
              <Link className="btn btn-outline" to="/espace/bibliotheque">Retour à la bibliothèque</Link>
            </div>
          </section>
        ) : <><SkeletonCard lines={2} label="Chargement de l’activité…" /><div className="study-layout"><SkeletonCard lines={4} /><SkeletonCard lines={8} /></div></>}
      </div>
    );
  }

  const exercise = activity.kind !== 'lesson' && activity.kind !== 'review' && activity.questions.length > 0;
  const detail: ActivityDetail = {
    id: activity.id, kind: activity.kind, title: activity.title, estimatedMinutes: activity.estimatedMinutes,
    status: (exercise && grade) || (!exercise && lessonDone) ? 'completed' : 'todo', state: {}, attemptId: null,
    lesson: activity.lesson, transcript: activity.transcript, questions: activity.questions, placements: activity.placements,
  };
  const Icon = exercise ? PencilLine : BookOpen;
  const last = item?.lastResult ?? null;

  function goNext() {
    setLessonDone(true);
    if (next && level) {
      toast('Leçon terminée. Place à la suite !');
      navigate(activityHref(level, next));
    } else {
      toast('Leçon terminée.');
    }
  }

  return (
    <div className="study lib-reader lc-enter">
      <header className="study-head">
        <Link className="study-back" to={back}><ArrowLeft size={16} aria-hidden="true" /> Bibliothèque</Link>
        <div className="study-head-row">
          <div className="study-head-text">
            <div className="study-head-tags">
              <Badge tone="blue">{activity.levelCode}</Badge>
              <Badge tone="violet"><LibraryBig size={12} aria-hidden="true" /> Accès libre</Badge>
              {last && <Badge tone={scorePercent(last) >= 70 ? 'green' : 'amber'}>Dernier score {last.correct}/{last.total}</Badge>}
            </div>
            <h1 id="library-activity-title">{activity.title}</h1>
            <p className="study-head-due"><BookOpen size={15} aria-hidden="true" /> {activity.moduleTitle} · {kindNames[activity.kind]} · environ {activity.estimatedMinutes} min</p>
          </div>
        </div>
      </header>

      <div className="study-layout">
        {module ? (
          <nav className="study-rail" aria-label="Activités du module">
            <div className="study-rail-head"><h2>Module {module.position}</h2><span>{index + 1}/{module.activities.length}</span></div>
            <ol>
              {module.activities.map((entry, position) => {
                const done = Boolean(entry.lastResult) || (entry.id === activity.id && detail.status === 'completed');
                return (
                  <li key={entry.id}>
                    <Link className={`study-step is-${done ? 'done' : 'todo'}`} to={level ? activityHref(level, entry) : '#'}
                      aria-current={entry.id === activity.id ? 'step' : undefined}>
                      <span className="study-step-mark" aria-hidden="true">{done ? <Check size={15} strokeWidth={3} /> : position + 1}</span>
                      <span className="study-step-text"><strong>{entry.title}</strong>
                        <small>{entry.kind === 'exercise' ? <PencilLine size={13} aria-hidden="true" /> : <BookOpen size={13} aria-hidden="true" />} {kindNames[entry.kind]} · {entry.estimatedMinutes} min</small></span>
                    </Link>
                  </li>
                );
              })}
            </ol>
          </nav>
        ) : <div className="lib-rail-placeholder" aria-hidden="true" />}

        <div className="study-stage">
          <article className="study-activity" aria-labelledby="library-activity-title">
            <header className="study-activity-head">
              <span className={`study-kind is-${exercise ? 'exercise' : activity.kind}`} aria-hidden="true"><Icon size={22} /></span>
              <div className="study-activity-titles">
                <p>{kindNames[activity.kind]} · {activity.estimatedMinutes} min{module ? <span className="study-activity-rank"> · Activité {index + 1} sur {module.activities.length}</span> : null}</p>
                {activity.competences.length > 0 && <p className="lib-reader-skills">Compétences : {activity.competences.map((name) => competenceLabels[name] ?? name).join(' · ')}</p>}
              </div>
              {detail.status === 'completed' && <span className="study-activity-done"><Badge tone="green"><Check size={13} strokeWidth={3} aria-hidden="true" /> Terminée</Badge></span>}
            </header>
            {exercise ? (
              <ExerciseActivity key={round} activity={detail} token={token} grade={grade} onRenew={renew} onSaveState={() => undefined}
                onGraded={async (result) => { setGrade(result); toast(`Exercice corrigé : ${result.correct} sur ${result.total}.`); }} />
            ) : (
              <LessonActivity activity={detail} busy={false} onRenew={renew} onComplete={goNext} />
            )}
            {exercise && grade && (
              <div className="lib-again">
                <p>Envie de progresser encore ? Refaites l’exercice : seul le dernier score compte dans la bibliothèque.</p>
                <button type="button" className="btn btn-outline" onClick={() => { setGrade(null); setRound((value) => value + 1); }}>
                  <RotateCcw size={16} aria-hidden="true" /> Refaire l’exercice
                </button>
              </div>
            )}
          </article>
          {!module && library && <Callout tone="info">Cette activité ne figure plus dans la bibliothèque de votre langue.</Callout>}
          <nav className="study-pager" aria-label="Changer d’activité">
            {previous && level
              ? <Link className="btn btn-ghost" to={activityHref(level, previous)}><ArrowLeft size={18} aria-hidden="true" /> Précédent</Link>
              : <span />}
            {module && <span className="study-pager-count" aria-hidden="true">{index + 1} / {module.activities.length}</span>}
            {next && level
              ? <Link className={`btn ${detail.status === 'completed' ? 'btn-primary' : 'btn-outline'}`} to={activityHref(level, next)}>Suivant <ArrowRight size={18} aria-hidden="true" /></Link>
              : <Link className="btn btn-outline" to={back}>Retour au module</Link>}
          </nav>
        </div>
      </div>
    </div>
  );
}
