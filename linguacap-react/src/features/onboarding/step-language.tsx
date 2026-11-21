/** Étape 1 : choix de la langue (élève autonome) ou langue choisie par le professeur (élève suivi, étape verrouillée). */
import { useState } from 'react';
import { ArrowRight, Globe2, LoaderCircle } from 'lucide-react';
import { LanguagePicker } from '../../components/LanguagePicker';
import { Callout } from '../../design/kit';
import { requestApi } from '../../integration/api';
import { onboardingBlockedMessages, type Language, type OnboardingState } from '../../integration/v2';
import { errorText, ofLanguage, theLanguage } from './onboarding-kit';

export function StepLanguage({ token, state, languages, placementStarted, onDone }: {
  token: string; state: OnboardingState; languages: Language[]; placementStarted: boolean; onDone: () => Promise<void>;
}) {
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
  return (
    <section className="ob-card ob-language" aria-labelledby="ob-language-title">
      <header className="ob-card-head">
        <span className="ob-card-icon" aria-hidden="true"><Globe2 size={22} /></span>
        <div>
          <h2 id="ob-language-title">{locked ? 'Votre langue d’apprentissage' : 'Quelle langue voulez-vous apprendre ?'}</h2>
          <p>{state.languageLocked
            ? `${teacher ? `${teacher}, votre professeur,` : 'Votre professeur'} a choisi ${chosen ? theLanguage(chosen.name) : 'votre langue'} pour vous. Vous travaillerez ensemble tout au long du parcours.`
            : locked ? 'Votre test de niveau a commencé dans cette langue.'
            : 'Une langue est ouverte pour le moment ; les autres arrivent bientôt.'}</p>
        </div>
      </header>
      {state.blockedReason === 'language_unavailable' && <Callout tone="warning" title="Langue pas encore ouverte">{onboardingBlockedMessages.language_unavailable}</Callout>}
      <LanguagePicker label="Langue d’apprentissage" hideLabel languages={languages} value={choice} locked={locked} lockedNote={note}
        onChange={setChoice} />
      {error && <div role="alert"><Callout tone="warning" title="Choix non enregistré">{error}</Callout></div>}
      <footer className="ob-actions">
        <p className="ob-actions-note">{chosen ? <>Prochaine étape : un test court pour situer votre niveau {ofLanguage(chosen.name)}.</> : 'Choisissez une langue disponible pour continuer.'}</p>
        <button type="button" className="btn btn-primary btn-lg" disabled={!choice || busy || chosen?.status !== 'available'} onClick={() => void next()}>
          {busy ? <LoaderCircle size={18} className="ob-spin" aria-hidden="true" /> : null}
          {locked ? 'Continuer' : 'Choisir cette langue'} <ArrowRight size={18} aria-hidden="true" />
        </button>
      </footer>
    </section>
  );
}
