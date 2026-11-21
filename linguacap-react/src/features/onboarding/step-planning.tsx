/** Étape 6 : planning multi-niveaux proposé, ajustements en un geste, retour aux jours et validation. */
import { useState } from 'react';
import { CalendarCheck2, Handshake } from 'lucide-react';
import { Callout, useToast } from '../../design/kit';
import { requestApi } from '../../integration/api';
import type { PathProposal, PathView, Suggestion } from '../../integration/v2';
import { PathProposalView } from './path-proposal';
import { errorText, longDate, shortDate } from './onboarding-kit';

export function StepPlanning({ token, path, proposal, onProposal, onEditDays, onValidated }: {
  token: string; path: PathView; proposal: PathProposal; onProposal: (proposal: PathProposal) => void; onEditDays: () => void;
  onValidated: (path: PathView) => Promise<void>;
}) {
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function apply(suggestion: Suggestion) {
    setBusy(true);
    setError('');
    try {
      const body = { days: suggestion.availability, ...(suggestion.targetDate !== proposal.targetDate ? { targetDate: suggestion.targetDate } : {}) };
      onProposal(await requestApi<PathProposal>(`/learning/paths/${encodeURIComponent(path.id)}/availability`, token, { method: 'PUT', body }));
      toast(`Ajustement appliqué : ${suggestion.label.toLowerCase()}.`);
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

  return (
    <section className="ob-card ob-planning" aria-labelledby="ob-planning-title">
      <header className="ob-card-head">
        <span className="ob-card-icon" aria-hidden="true"><CalendarCheck2 size={22} /></span>
        <div>
          <h2 id="ob-planning-title">Votre planning</h2>
          <p>{proposal.sessions.length} séances du {shortDate(proposal.startDate)} au {longDate(proposal.targetDate)}, niveau après niveau. Touchez une séance pour voir son contenu.</p>
        </div>
      </header>
      <PathProposalView proposal={proposal} busy={busy} onApply={(suggestion) => void apply(suggestion)} onEditDays={onEditDays}
        onValidate={() => void validate()} validateLabel="Valider mon planning" editDaysLabel="Modifier mes jours"
        actionsNote={<p className="ob-contract-note"><Handshake size={16} aria-hidden="true" />
          {path.accompanied
            ? 'En validant, votre objectif, votre date et votre temps par semaine partent en contrat à votre professeur. Vous pourrez commencer sans attendre sa réponse.'
            : 'En validant, vous vous engagez sur ces conditions. Vous pourrez les ajuster plus tard par un avenant.'}</p>} />
      {error && <div role="alert"><Callout tone="warning" title="Validation impossible">{error}</Callout></div>}
    </section>
  );
}
