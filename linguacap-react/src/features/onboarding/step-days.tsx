/** Étape 5 : jours d'étude et jours de repos, avec la faisabilité en direct ; PUT …/availability calcule le planning. */
import { useEffect, useState } from 'react';
import { ArrowRight, CalendarDays, LoaderCircle } from 'lucide-react';
import { Callout, SkeletonCard } from '../../design/kit';
import { requestApi } from '../../integration/api';
import { formatMinutes, type Day, type Estimate, type PathProposal, type PathView } from '../../integration/v2';
import { JourneyActions, JourneyQuestion, JourneyStage } from '../journey';
import { DayPlanner, errorText } from './onboarding-kit';
import { useScene } from './onboarding-scene';

export function StepDays({ token, path, onDays, onProposal, onBack }: {
  token: string; path: PathView; onDays?: (days: Day[]) => void; onProposal: (proposal: PathProposal) => void; onBack: () => void;
}) {
  const { direction } = useScene();
  const [initial, setInitial] = useState<Day[] | null>(path.availability.length ? path.availability : null);
  const [days, setDaysState] = useState<Day[]>(path.availability);
  const setDays = (next: Day[]) => { setDaysState(next); onDays?.(next); };
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  // Sans jours enregistrés : la semaine conseillée par l'estimation (du lundi au vendredi, durée arrondie).
  useEffect(() => {
    if (initial) return;
    let active = true;
    requestApi<Estimate>('/learning/paths/estimate', token, {
      method: 'POST',
      body: { pathId: path.id, startLevel: path.startLevel, targetLevel: path.targetLevel, startDate: path.startDate, targetDate: path.targetDate },
    }).then((estimate) => { if (active) { setInitial(estimate.suggestedAvailability); setDays(estimate.suggestedAvailability); } })
      .catch(() => { if (active) { const fallback = [1, 2, 3, 4, 5].map((weekday) => ({ weekday, sessions: 1, minutes: 45 })); setInitial(fallback); setDays(fallback); } });
    return () => { active = false; };
  }, [initial, path, token]);

  async function submit() {
    if (busy || !days.length) return;
    setBusy(true);
    setError('');
    try {
      onProposal(await requestApi<PathProposal>(`/learning/paths/${encodeURIComponent(path.id)}/availability`, token, { method: 'PUT', body: { days } }));
    } catch (failure) {
      setError(errorText(failure));
      setBusy(false);
    }
  }

  const required = path.difficulty.requiredWeeklyMinutes;
  return (
    <JourneyStage className="lo-days">
      <JourneyQuestion stepKey="days" direction={direction} icon={<CalendarDays />} eyebrow="Mes jours"
        title="Quels jours voulez-vous étudier ?"
        description={<>Votre objectif demande environ <strong>{formatMinutes(required)} par semaine</strong>. Activez vos jours d’étude, réglez la durée
          de vos séances, gardez des jours de repos : le planning s’adaptera.</>}>
        {initial ? <DayPlanner initial={initial} required={required} onChange={setDays} /> : <SkeletonCard lines={4} label="Préparation de votre semaine…" />}
        {error && <div role="alert"><Callout tone="warning" title="Planning non calculé">{error}</Callout></div>}
      </JourneyQuestion>
      <JourneyActions onBack={onBack} backLabel="Modifier mon objectif" primaryType="button" onPrimary={() => void submit()}
        disabled={!days.length} busy={busy}>
        {busy && <LoaderCircle size={18} className="ob-spin" aria-hidden="true" />}
        {busy ? 'Calcul du planning…' : 'Voir mon planning'} {!busy && <ArrowRight size={18} aria-hidden="true" />}
      </JourneyActions>
    </JourneyStage>
  );
}
