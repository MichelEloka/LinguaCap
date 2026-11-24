/**
 * Étape 3 : révélation du niveau. Le L arrive sur la station « Votre niveau », puis la médaille du niveau apparaît avec
 * éclat ; viennent ensuite le détail par palier et par compétence, et l'accès à l'objectif. Le parcours suivant est lu dans
 * le catalogue (GET /languages) : premier niveau publié au-dessus du niveau atteint, ou niveau en préparation (« bientôt »).
 */
import type { CSSProperties } from 'react';
import { ArrowRight, BookOpen, Headphones, Info, LibraryBig, Sparkles, Sprout } from 'lucide-react';
import { Badge } from '../../components/ui';
import { Callout, ProgressRing } from '../../design/kit';
import { nextCatalogueLevel, nextPublishedLevel } from '../../integration/languages';
import {
  competenceLabels, onboardingBlockedMessages, placementTierStatusLabels, type CompetenceScore, type Language, type OnboardingState,
  type PlacementTier, type PlacementView,
} from '../../integration/v2';
import { JourneyActions, JourneyQuestion, JourneyStage } from '../journey';
import { LevelMark, levelName, momentText, ofLanguage } from './onboarding-kit';
import { useScene } from './onboarding-scene';

const tierTones = { passed: 'green', failed: 'amber', current: 'blue', locked: 'neutral' } as const;

function CompetenceBar({ name, score, threshold }: { name: string; score: CompetenceScore; threshold: number }) {
  const Icon = name === 'ecoute' ? Headphones : BookOpen;
  return (
    <li className="lo-skillbar">
      <span className="lo-skillbar-name"><Icon size={15} aria-hidden="true" />{competenceLabels[name] ?? name}</span>
      <span className="lo-skillbar-track" role="img" aria-label={`${competenceLabels[name] ?? name} : ${score.correct} sur ${score.total}, ${score.percent} %`}>
        <span className={score.percent >= threshold ? 'is-ok' : 'is-low'} style={{ '--w': `${score.percent}%` } as CSSProperties} />
        <i style={{ left: `${threshold}%` }} />
      </span>
      <b aria-hidden="true">{score.correct}/{score.total}</b>
    </li>
  );
}

function TierCard({ tier, index }: { tier: PlacementTier; index: number }) {
  const reached = tier.percent !== null;
  return (
    <article className={`lo-tier lvl-${tier.code} is-${tier.status}`} style={{ '--i': index } as CSSProperties} aria-labelledby={`lo-tier-${tier.code}`}>
      <header>
        <LevelMark code={tier.code} size="sm" state={tier.status === 'passed' ? 'done' : tier.status === 'locked' ? 'locked' : undefined} />
        <div><h3 id={`lo-tier-${tier.code}`}>Palier {tier.code}</h3><small>{tier.title.startsWith(`${tier.code} · `) ? tier.title.slice(tier.code.length + 3) : tier.title}</small></div>
        <Badge tone={tierTones[tier.status]}>{reached || tier.status !== 'locked' ? placementTierStatusLabels[tier.status] : 'Non passé'}</Badge>
      </header>
      {reached ? (
        <div className="lo-tier-body">
          <ProgressRing value={tier.percent ?? 0} size={64} stroke={6} color={tier.status === 'passed' ? 'var(--success)' : 'var(--warning)'}
            label={`${tier.correct ?? 0} bonnes réponses sur ${tier.total ?? 0}`}>
            <span className="lo-tier-score"><strong>{tier.percent}</strong><small>%</small></span>
          </ProgressRing>
          <ul className="lo-skillbars">
            {Object.entries(tier.competences ?? {}).map(([name, score]) => score && <CompetenceBar key={name} name={name} score={score} threshold={tier.passPercent} />)}
          </ul>
        </div>
      ) : (
        <p className="lo-tier-empty">Le test s’est arrêté avant ce palier.</p>
      )}
      {reached && <p className="lo-tier-foot">Seuil de réussite : {tier.passPercent} % · {tier.correct}/{tier.total} bonnes réponses</p>}
    </article>
  );
}

export function StepResult({ attempt, state, language, languageName, onBack, onContinue }: {
  attempt: PlacementView; state: OnboardingState; language: Language | null; languageName: string; onBack: () => void; onContinue: () => void;
}) {
  const { direction, leave } = useScene();
  const result = attempt.result;
  const placed = result?.placedLevel ?? 'A0';
  const beginner = placed === 'A0';
  const blocked = state.blockedReason === 'no_target_available';
  // Parcours suivant (repli du résumé du serveur) : publié, sinon le niveau du catalogue en préparation, jamais présenté
  // comme ouvert.
  const next = nextPublishedLevel(language, placed);
  const upcoming = next ? null : nextCatalogueLevel(language, placed);
  const reached = attempt.tiers.filter((tier) => tier.percent !== null || tier.status !== 'locked');
  return (
    <JourneyStage className="lo-result">
      <JourneyQuestion stepKey="result" direction={direction} icon={<Sparkles />}
        eyebrow={result?.declaredBeginner ? 'Votre point de départ' : `Votre niveau ${ofLanguage(languageName)}`}
        title={beginner ? 'Tout commence ici' : 'Voici votre niveau'}>
        <section className={`lo-reveal lvl-${placed}`} aria-labelledby="lo-reveal-title">
          <div className="lo-reveal-sky" aria-hidden="true"><span /><span /></div>
          <div className="lo-reveal-medal" aria-hidden="true">
            <span className="lo-reveal-glow" />
            <span className="lo-reveal-ring" />
            <span className="lo-reveal-ring is-2" />
            <span className="lo-reveal-rays">{Array.from({ length: 14 }, (_, ray) => <i key={ray} style={{ '--r': ray } as CSSProperties} />)}</span>
            <span className="lo-reveal-coin">{beginner ? <Sprout size={44} strokeWidth={1.7} /> : <strong>{placed}</strong>}</span>
          </div>
          <div className="lo-reveal-copy">
            <h2 id="lo-reveal-title">{result?.label ?? levelName(placed)}</h2>
            <p>{result?.summary || (beginner
              ? 'Vous partez du tout début : le parcours vous fera découvrir la langue pas à pas, sans prérequis.'
              : next ? `Votre parcours commencera au niveau ${next.code}, juste au-dessus du vôtre, pour ne pas refaire ce que vous savez déjà.`
              : 'Votre parcours commencera juste au-dessus de ce niveau, pour ne pas refaire ce que vous savez déjà.')}</p>
            <div className="lo-reveal-tags">
              {result?.declaredBeginner && <span>Débutant déclaré</span>}
              {result?.beyondTest && <span>Au-delà des paliers du test</span>}
              {attempt.completedAt && !result?.declaredBeginner && <span>Test terminé le {momentText(attempt.completedAt)}</span>}
            </div>
          </div>
        </section>

        {!result?.declaredBeginner && reached.length > 0 && (
          <section className="lo-tiers" aria-labelledby="lo-tiers-title">
            <h3 id="lo-tiers-title" className="lo-section-title">Le détail, palier par palier</h3>
            <div className="lo-tiers-grid">
              {attempt.tiers.map((tier, index) => <TierCard key={tier.code} tier={tier} index={index} />)}
            </div>
          </section>
        )}

        {blocked && (
          <Callout tone="info" title={upcoming ? `Le parcours ${upcoming.code} arrive bientôt` : 'Aucun parcours au-dessus de votre niveau pour l’instant'}>
            <p>{upcoming
              ? `Votre niveau dépasse les parcours publiés pour le moment : le parcours ${upcoming.code} est en préparation et apparaîtra dans votre bibliothèque dès sa publication. D’ici là, la bibliothèque reste à votre disposition.`
              : onboardingBlockedMessages.no_target_available}</p>
          </Callout>
        )}
        <p className="lo-note"><Info size={15} aria-hidden="true" /> {result?.declaredBeginner
          ? 'Vous avez déjà étudié un peu ? Vous pourrez passer le test plus tard, depuis l’étape « Test ».'
          : 'Le test mesure la lecture et l’écoute ; l’écrit et l’oral se travaillent dans le parcours.'}</p>
      </JourneyQuestion>
      <JourneyActions onBack={onBack} primaryType="button" onPrimary={blocked ? () => leave('/espace/bibliotheque') : onContinue}>
        {blocked ? <><LibraryBig size={18} aria-hidden="true" /> Ouvrir la bibliothèque</> : <>Choisir mon objectif <ArrowRight size={18} aria-hidden="true" /></>}
      </JourneyActions>
    </JourneyStage>
  );
}
