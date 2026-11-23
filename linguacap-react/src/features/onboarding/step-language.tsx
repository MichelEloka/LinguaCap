/** Étape 1 : choix de la langue (élève autonome) ou langue choisie par le professeur (élève suivi, étape verrouillée). */
import { useState } from 'react';
import { ArrowRight, Globe2, LoaderCircle } from 'lucide-react';
import { LanguagePicker } from '../../components/LanguagePicker';
import { Callout } from '../../design/kit';
import { requestApi } from '../../integration/api';
import { onboardingBlockedMessages, type Language, type OnboardingState } from '../../integration/v2';
import { JourneyActions, JourneyQuestion, JourneyStage } from '../journey';
import { errorText, firstName, theLanguage } from './onboarding-kit';
import { useScene } from './onboarding-scene';

export function StepLanguage({ token, state, name, languages, placementStarted, onDone }: {
  token: string; state: OnboardingState; name: string; languages: Language[]; placementStarted: boolean; onDone: () => Promise<void>;
}) {
  const { direction } = useScene();
  const available = languages.filter((language) => language.status === 'available');
  const [choice, setChoice] = useState<string | null>(state.languageId ?? (available.length === 1 ? available[0].id : null));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const locked = state.languageLocked || placementStarted;
  const chosen = languages.find((language) => language.id === choice);
  const teacher = state.teacher?.displayName;

  async function next() {
    if (!choice || busy) return;
    setBusy(true);
    setError('');
    try {
      if (!locked && choice !== state.languageId) {
        await requestApi('/me/language', token, { method: 'PUT', body: { languageId: choice } });
      }
      await onDone();
    } catch (failure) {
      setError(errorText(failure));
      setBusy(false);
    }
  }

  const note = state.languageLocked ? 'Choisie par votre professeur' : 'Langue de votre test de niveau';
  // Langue figée : seule la langue retenue reste affichée, en grand, avec son cadenas.
  const shown = locked && chosen ? [chosen] : languages;
  const description = state.languageLocked
    ? `${teacher ? `${teacher}, votre professeur,` : 'Votre professeur'} a choisi ${chosen ? theLanguage(chosen.name) : 'votre langue'} pour vous. Vous travaillerez ensemble tout au long du parcours : un test court, votre objectif, vos jours d’étude, et c’est parti.`
    : locked ? 'Votre test de niveau a commencé dans cette langue : poursuivons ensemble.'
    : 'En quelques minutes, nous construisons votre parcours : un test court pour situer votre niveau, votre objectif, vos jours d’étude. Une langue est ouverte pour le moment, les autres arrivent bientôt.';

  return (
    <JourneyStage>
      <JourneyQuestion stepKey="language" direction={direction} eyebrow={`Bienvenue ${firstName(name)}`} icon={<Globe2 />}
        title={locked ? 'Votre langue d’apprentissage' : 'Quelle langue voulez-vous apprendre ?'} description={description}>
        {state.blockedReason === 'language_unavailable' && (
          <Callout tone="warning" title="Langue pas encore ouverte">{onboardingBlockedMessages.language_unavailable}</Callout>
        )}
        <div className={`lo-langs${locked ? ' is-locked' : ''}`}>
          <LanguagePicker label="Langue d’apprentissage" hideLabel languages={shown} value={choice} locked={locked} lockedNote={note}
            onChange={setChoice} />
        </div>
        {error && <div role="alert"><Callout tone="warning" title="Choix non enregistré">{error}</Callout></div>}
      </JourneyQuestion>
      <JourneyActions primaryType="button" onPrimary={() => void next()} busy={busy}
        disabled={!choice || chosen?.status !== 'available'}>
        {busy && <LoaderCircle size={18} className="ob-spin" aria-hidden="true" />}
        {locked ? 'Continuer' : 'Choisir cette langue'} <ArrowRight size={18} aria-hidden="true" />
      </JourneyActions>
    </JourneyStage>
  );
}
