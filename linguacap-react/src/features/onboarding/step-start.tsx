/** Étape 7 : c'est parti. Récapitulatif du parcours, contrat (envoyé au professeur ou accepté) et première séance. */
import { Link } from 'react-router-dom';
import { ArrowRight, CalendarClock, Clock, LayoutGrid, LibraryBig, Play, Rocket } from 'lucide-react';
import { Callout } from '../../design/kit';
import { formatMinutes, weeklyCapacity, type OnboardingState, type PathView } from '../../integration/v2';
import { relativeMoment } from '../pilot/learner-calendar';
import { DifficultyBadge, firstName, LevelMark, levelName, longDate, shortDate } from './onboarding-kit';

export function StepStart({ path, state, name }: { path: PathView; state: OnboardingState; name: string }) {
  const first = path.sessions.find((session) => session.id && !session.locked && session.status !== 'completed');
  const teacher = state.teacher?.displayName;
  const pending = path.contract.pending;
  return (
    <section className="st" aria-labelledby="st-title">
      <div className="st-hero">
        <div className="st-rocket" aria-hidden="true">
          {Array.from({ length: 6 }, (_, index) => <span key={index} className={`st-spark is-${index + 1}`} />)}
          <span className="st-rocket-icon"><Rocket size={44} /></span>
        </div>
        <div className="st-hero-copy">
          <h2 id="st-title" tabIndex={-1}>Bravo {firstName(name)}, votre parcours est prêt</h2>
          <p>De {levelName(path.startLevel)} à {levelName(path.targetLevel)}, jusqu’au {longDate(path.targetDate)}. Une séance après l’autre, à votre rythme.</p>
        </div>
      </div>

      {path.accompanied ? (
        <Callout tone="success" title="Contrat envoyé à votre professeur, vous pouvez commencer">
          <p>{teacher ? `${teacher} va relire vos conditions.` : 'Votre professeur va relire vos conditions.'} En attendant sa réponse, tout votre parcours est ouvert.
            {pending && <> Vous suivrez sa réponse dans <Link className="text-link" to="/espace/contrat">Mon contrat</Link>.</>}</p>
        </Callout>
      ) : (
        <Callout tone="success" title="Votre contrat est en vigueur">
          <p>Votre objectif, votre date et votre temps par semaine s’appliquent dès maintenant. Vous pourrez les ajuster par un avenant dans <Link className="text-link" to="/espace/contrat">Mon contrat</Link>.</p>
        </Callout>
      )}

      <div className="st-grid">
        <article className="st-recap" aria-labelledby="st-recap-title">
          <h3 id="st-recap-title">Votre parcours en bref</h3>
          <ol className="st-levels">
            <li className="is-start"><LevelMark code={path.startLevel} size="md" /><span><strong>Départ</strong><small>{levelName(path.startLevel)} · {shortDate(path.startDate)}</small></span></li>
            {path.steps.map((step) => (
              <li key={step.id} className={`lvl-${step.levelCode} is-${step.status}`}>
                <LevelMark code={step.levelCode} size="md" state={step.status === 'active' ? 'current' : step.status === 'completed' ? 'done' : 'planned'} />
                <span><strong>{levelName(step.levelCode)}</strong>
                  <small>{step.firstDate ? `${shortDate(step.firstDate)} → ${shortDate(step.lastDate)}` : 'Dates à venir'} · {step.sessionsTotal} séances</small></span>
              </li>
            ))}
          </ol>
          <ul className="st-facts">
            <li><CalendarClock size={16} aria-hidden="true" /><span>Date cible</span><b>{longDate(path.targetDate)}</b></li>
            <li><Clock size={16} aria-hidden="true" /><span>Temps prévu</span><b>{formatMinutes(weeklyCapacity(path.availability))} / semaine</b></li>
            <li><span className="st-facts-dot" aria-hidden="true" /><span>Rythme</span><b><DifficultyBadge code={path.difficulty.code} label={path.difficulty.label} /></b></li>
          </ul>
        </article>

        <article className="st-next" aria-labelledby="st-next-title">
          <p className="st-next-kicker">Votre première séance</p>
          <h3 id="st-next-title">{first?.title ?? 'Vos séances arrivent'}</h3>
          {first ? (
            <p className="st-next-meta"><CalendarClock size={15} aria-hidden="true" /> {relativeMoment(first.dueAt)} · {formatMinutes(first.estimatedMinutes)} · {first.activities.length} activité{first.activities.length > 1 ? 's' : ''}</p>
          ) : <p className="st-next-meta">Elles apparaîtront sur votre accueil dans un instant.</p>}
          <div className="st-next-actions">
            {first?.id
              ? <Link className="btn btn-lg st-next-primary" to={`/espace/seance/${encodeURIComponent(first.id)}`}><Play size={18} fill="currentColor" aria-hidden="true" /> Commencer ma première séance</Link>
              : null}
            <Link className="btn btn-lg st-next-secondary" to="/espace"><LayoutGrid size={18} aria-hidden="true" /> Aller à mon accueil <ArrowRight size={18} aria-hidden="true" /></Link>
          </div>
          <Link className="st-library" to="/espace/bibliotheque"><LibraryBig size={16} aria-hidden="true" /> Tous les cours restent ouverts dans la bibliothèque <ArrowRight size={15} aria-hidden="true" /></Link>
        </article>
      </div>
    </section>
  );
}
