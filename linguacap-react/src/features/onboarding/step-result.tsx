/** Niveau de départ, résultats par compétence et accès à l’objectif. */
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Headphones, LibraryBig, Sparkles, Sprout } from 'lucide-react';
import { Badge } from '../../components/ui';
import { Callout, ProgressRing } from '../../design/kit';
import {
  competenceLabels, onboardingBlockedMessages, placementTierStatusLabels, type CompetenceScore, type OnboardingState, type PlacementTier,
  type PlacementView,
} from '../../integration/v2';
import { LevelMark, levelName, momentText, ofLanguage } from './onboarding-kit';

const tierTones = { passed: 'green', failed: 'amber', current: 'blue', locked: 'neutral' } as const;

function CompetenceBar({ name, score, threshold }: { name: string; score: CompetenceScore; threshold: number }) {
  const Icon = name === 'ecoute' ? Headphones : BookOpen;
  return (
    <li className="rs-skill">
      <span className="rs-skill-name"><Icon size={15} aria-hidden="true" />{competenceLabels[name] ?? name}</span>
      <span className="rs-skill-bar" role="img" aria-label={`${competenceLabels[name] ?? name} : ${score.correct} sur ${score.total}, ${score.percent} %`}>
        <span className={score.percent >= threshold ? 'is-ok' : 'is-low'} style={{ width: `${score.percent}%` }} />
        <i style={{ left: `${threshold}%` }} />
      </span>
      <b aria-hidden="true">{score.correct}/{score.total}</b>
    </li>
  );
}

function TierCard({ tier, index }: { tier: PlacementTier; index: number }) {
  const reached = tier.percent !== null;
  return (
    <article className={`rs-tier is-${tier.status}`} style={{ ['--delay' as string]: `${Math.min(index, 4) * 50}ms` }} aria-labelledby={`rs-tier-${tier.code}`}>
      <header>
        <LevelMark code={tier.code} size="sm" state={tier.status === 'passed' ? 'done' : tier.status === 'locked' ? 'locked' : undefined} />
        <div><h3 id={`rs-tier-${tier.code}`}>Palier {tier.code}</h3><small>{tier.title.startsWith(`${tier.code} · `) ? tier.title.slice(tier.code.length + 3) : tier.title}</small></div>
        <Badge tone={tierTones[tier.status]}>{reached || tier.status !== 'locked' ? placementTierStatusLabels[tier.status] : 'Non passé'}</Badge>
      </header>
      {reached ? (
        <div className="rs-tier-body">
          <ProgressRing value={tier.percent ?? 0} size={74} stroke={7} color={tier.status === 'passed' ? 'var(--success)' : 'var(--warning)'}
            label={`${tier.correct ?? 0} bonnes réponses sur ${tier.total ?? 0}`}>
            <span className="rs-tier-score"><strong>{tier.percent}</strong><small>%</small></span>
          </ProgressRing>
          <ul className="rs-skills">
            {Object.entries(tier.competences ?? {}).map(([name, score]) => score && <CompetenceBar key={name} name={name} score={score} threshold={tier.passPercent} />)}
          </ul>
        </div>
      ) : (
        <p className="rs-tier-empty">Le test s’est arrêté avant ce palier.</p>
      )}
      {reached && <p className="rs-tier-foot">Seuil de réussite : {tier.passPercent} % · {tier.correct}/{tier.total} bonnes réponses</p>}
    </article>
  );
}

export function StepResult({ attempt, state, languageName, onContinue }: {
  attempt: PlacementView; state: OnboardingState; languageName: string; onContinue: () => void;
}) {
  const result = attempt.result;
  const placed = result?.placedLevel ?? 'A0';
  const beginner = placed === 'A0';
  const blocked = state.blockedReason === 'no_target_available';
  const reached = attempt.tiers.filter((tier) => tier.percent !== null || tier.status !== 'locked');
  return (
    <section className="rs" aria-labelledby="rs-title">
      <div className={`rs-hero lvl-${placed}`}>
        <div className="rs-badge" aria-hidden="true">
          <span className="rs-coin">{beginner ? <Sprout size={38} strokeWidth={1.6} /> : <strong>{placed}</strong>}</span>
        </div>
        <div className="rs-hero-copy">
          <p className="rs-kicker"><Sparkles size={15} aria-hidden="true" /> {result?.declaredBeginner ? 'Votre point de départ' : `Votre niveau ${ofLanguage(languageName)}`}</p>
          <h2 id="rs-title" tabIndex={-1}>{result?.label ?? levelName(placed)}</h2>
          <p className="rs-summary">{result?.summary || (beginner
            ? 'Vous partez du tout début : le parcours vous fera découvrir la langue pas à pas, sans prérequis.'
            : 'Votre parcours commencera juste au-dessus de ce niveau, pour ne pas refaire ce que vous savez déjà.')}</p>
          <div className="rs-tags">
            {result?.declaredBeginner && <span className="rs-tag">Débutant déclaré</span>}
            {result?.beyondTest && <span className="rs-tag">Au-delà des paliers du test</span>}
            {attempt.completedAt && !result?.declaredBeginner && <span className="rs-tag">Test terminé le {momentText(attempt.completedAt)}</span>}
          </div>
        </div>
      </div>

      {!result?.declaredBeginner && reached.length > 0 && (
        <div className="rs-detail">
          <h3 className="rs-detail-title">Le détail, palier par palier</h3>
          <div className="rs-tiers">
            {attempt.tiers.map((tier, index) => <TierCard key={tier.code} tier={tier} index={index} />)}
          </div>
        </div>
      )}

      {blocked && (
        <Callout tone="info" title="Aucun parcours au-dessus de votre niveau pour l’instant">
          <p>{onboardingBlockedMessages.no_target_available}</p>
          <Link className="btn btn-outline btn-sm" to="/espace/bibliotheque"><LibraryBig size={15} aria-hidden="true" /> Ouvrir la bibliothèque</Link>
        </Callout>
      )}

      <footer className="ob-actions">
        <p className="ob-actions-note">{result?.declaredBeginner
          ? 'Vous avez déjà étudié un peu ? Vous pourrez passer le test plus tard, depuis l’étape « Test ».'
          : 'Le test mesure la lecture et l’écoute ; l’écrit et l’oral se travaillent dans le parcours.'}</p>
        {!blocked && <button type="button" className="btn btn-primary btn-lg" onClick={onContinue}>Choisir mon objectif <ArrowRight size={18} aria-hidden="true" /></button>}
      </footer>
    </section>
  );
}
