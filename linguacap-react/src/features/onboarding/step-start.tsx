/**
 * Étape 7 : c'est parti. Le chemin s'illumine, récapitulatif du parcours, contrat (envoyé au professeur ou en vigueur)
 * et première séance ; chaque lien quitte l'accueil en fondu vers l'espace.
 */
import { ArrowRight, CalendarClock, Clock, Flag, Handshake, LayoutGrid, LibraryBig, Play, Sprout } from 'lucide-react';
import { formatMinutes, weeklyCapacity, type OnboardingState, type PathView } from '../../integration/v2';
import { JourneyCelebration, JourneyStage } from '../journey';
import { relativeMoment } from '../pilot/learner-calendar';
import { DifficultyBadge, firstName, levelName, longDate, shortDate } from './onboarding-kit';
import { LeaveLink } from './onboarding-scene';

export function StepStart({ path, state, name }: { path: PathView; state: OnboardingState; name: string }) {
  const first = path.sessions.find((session) => session.id && !session.locked && session.status !== 'completed');
  const teacher = state.teacher?.displayName;
  const pending = path.contract.pending;
  return (
    <JourneyStage className="lo-start">
      <JourneyCelebration eyebrow="C’est parti" title={`Bravo ${firstName(name)}, votre parcours est prêt`}
        description={`De ${levelName(path.startLevel)} à ${levelName(path.targetLevel)}, jusqu’au ${longDate(path.targetDate)}. Une séance après l’autre, à votre rythme.`}
        items={[
          { icon: <Sprout />, label: 'Départ', value: `${path.startLevel === 'A0' ? 'Débutant' : path.startLevel} · ${shortDate(path.startDate)}` },
          { icon: <Flag />, label: 'Objectif', value: `${path.targetLevel} · ${shortDate(path.targetDate)}` },
          { icon: <Clock />, label: 'Temps prévu', value: `${formatMinutes(weeklyCapacity(path.availability))} / semaine` },
          { icon: <CalendarClock />, label: 'Rythme', value: <DifficultyBadge code={path.difficulty.code} label={path.difficulty.label} /> },
        ]}>
        <div className="lo-start-grid">
          <div className="lo-contract" role="note">
            <span className="lo-contract-icon" aria-hidden="true"><Handshake size={20} /></span>
            {path.accompanied ? (
              <p><strong>Contrat envoyé à votre professeur</strong>
                <span>Vous pouvez commencer sans attendre : {teacher ?? 'votre professeur'} va relire vos conditions, et tout votre parcours est déjà ouvert.
                  {pending && <> Sa réponse arrivera dans <LeaveLink className="text-link" to="/espace/contrat">Mon contrat</LeaveLink>.</>}</span></p>
            ) : (
              <p><strong>Votre contrat est en vigueur</strong>
                <span>Votre objectif, votre date et votre temps par semaine s’appliquent dès maintenant. Vous pourrez les ajuster par un avenant
                  dans <LeaveLink className="text-link" to="/espace/contrat">Mon contrat</LeaveLink>.</span></p>
            )}
          </div>

          <article className="lo-first" aria-labelledby="lo-first-title">
            <p className="lo-first-kicker">Votre première séance</p>
            <h2 id="lo-first-title">{first?.title ?? 'Vos séances arrivent'}</h2>
            <p className="lo-first-meta">
              {first ? <><CalendarClock size={15} aria-hidden="true" /> {relativeMoment(first.dueAt)} · {formatMinutes(first.estimatedMinutes)} · {first.activities.length} activité{first.activities.length > 1 ? 's' : ''}</>
                : 'Elles apparaîtront sur votre accueil dans un instant.'}
            </p>
            <div className="lo-first-actions">
              {first?.id && (
                <LeaveLink className="btn btn-lg lo-first-primary" to={`/espace/seance/${encodeURIComponent(first.id)}`}>
                  <Play size={18} fill="currentColor" aria-hidden="true" /> Commencer ma première séance
                </LeaveLink>
              )}
              <LeaveLink className="btn btn-lg lo-first-secondary" to="/espace">
                <LayoutGrid size={18} aria-hidden="true" /> Aller à mon accueil <ArrowRight size={18} aria-hidden="true" />
              </LeaveLink>
            </div>
          </article>
        </div>
        <LeaveLink className="lo-library-link" to="/espace/bibliotheque">
          <LibraryBig size={16} aria-hidden="true" /> Tous les cours restent ouverts dans la bibliothèque <ArrowRight size={15} aria-hidden="true" />
        </LeaveLink>
      </JourneyCelebration>
    </JourneyStage>
  );
}
