/** Étape 6 : planning multi-niveaux proposé, ajustements en un geste, retour aux jours et validation. */
import { useState } from 'react';
import { CalendarRange, CircleCheck, Handshake, LoaderCircle, TriangleAlert } from 'lucide-react';
import { Callout, useToast } from '../../design/kit';
import { requestApi } from '../../integration/api';
import { blockingReasonMessages, type PathProposal, type PathView, type Suggestion } from '../../integration/v2';
import { JourneyActions, JourneyQuestion, JourneyStage } from '../journey';
import { PathProposalView } from './path-proposal';
import { errorText, longDate, shortDate } from './onboarding-kit';
import { useScene } from './onboarding-scene';

export function StepPlanning({ token, path, proposal, onProposal, onEditDays, onValidated }: {
  token: string; path: PathView; proposal: PathProposal; onProposal: (proposal: PathProposal) => void; onEditDays: () => void;
  onValidated: (path: PathView) => Promise<void>;
}) {
  const { direction } = useScene();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  async function apply(suggestion: Suggestion) {
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const body = { days: suggestion.availability, ...(suggestion.targetDate !== proposal.targetDate ? { targetDate: suggestion.targetDate } : {}) };
      onProposal(await requestApi<PathProposal>(`/learning/paths/${encodeURIComponent(path.id)}/availability`, token, { method: 'PUT', body }));
      // L'accueil est au premier plan : la confirmation s'affiche dans la scène plutôt qu'en notification.
      setNotice(`Ajustement appliqué : ${suggestion.label.toLowerCase()}.`);
    } catch (failure) {
      setError(errorText(failure));
    } finally {
      setBusy(false);
    }
  }

  async function validate() {
    setBusy(true);
    setError('');
    try {
      const view = await requestApi<PathView>(`/learning/paths/${encodeURIComponent(path.id)}/proposal/validate`, token, {
        method: 'POST', body: { number: proposal.number },
      });
      toast(path.accompanied ? 'Planning validé. Votre contrat est envoyé à votre professeur.' : 'Planning validé. Votre parcours commence !');
      await onValidated(view);
    } catch (failure) {
      setError(errorText(failure));
      setBusy(false);
    }
  }

  const validatable = proposal.status === 'proposed' && proposal.validatable && !proposal.blockingReason;
  return (
    <JourneyStage className="lo-planning">
      <JourneyQuestion stepKey="planning" direction={direction} icon={<CalendarRange />} eyebrow="Mon planning" title="Voici votre planning"
        description={`${proposal.sessions.length} séances du ${shortDate(proposal.startDate)} au ${longDate(proposal.targetDate)}, niveau après niveau. Touchez une séance pour voir son contenu.`}>
        {notice && <p className="lo-notice" role="status"><CircleCheck size={16} aria-hidden="true" /> {notice}</p>}
        <PathProposalView proposal={proposal} busy={busy} onApply={(suggestion) => void apply(suggestion)} />
        <div className="lo-commit">
          <Handshake size={20} aria-hidden="true" />
          <p>{path.accompanied
            ? 'En validant, votre objectif, votre date et votre temps par semaine partent en contrat à votre professeur. Vous pourrez commencer sans attendre sa réponse.'
            : 'En validant, vous vous engagez sur ces conditions. Vous pourrez les ajuster plus tard par un avenant.'}</p>
        </div>
        {proposal.blockingReason && proposal.blockingReason !== 'overflow' && (
          <p className="lo-warning"><TriangleAlert size={16} aria-hidden="true" /> {blockingReasonMessages[proposal.blockingReason]}</p>
        )}
        {error && <div role="alert"><Callout tone="warning" title="Validation impossible">{error}</Callout></div>}
      </JourneyQuestion>
      <JourneyActions onBack={onEditDays} backLabel="Modifier mes jours" primaryType="button" onPrimary={() => void validate()}
        disabled={!validatable} busy={busy}>
        {busy ? <LoaderCircle size={18} className="ob-spin" aria-hidden="true" /> : <CircleCheck size={18} aria-hidden="true" />} Valider mon planning
      </JourneyActions>
    </JourneyStage>
  );
}
