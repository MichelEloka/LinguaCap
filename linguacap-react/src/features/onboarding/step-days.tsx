/** Étape 5 : jours d'étude et jours de repos, avec la faisabilité en direct ; PUT …/availability calcule le planning. */
import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, CalendarDays, LoaderCircle } from 'lucide-react';
import { Callout, SkeletonCard } from '../../design/kit';
import { requestApi } from '../../integration/api';
import { formatMinutes, type Day, type Estimate, type PathProposal, type PathView } from '../../integration/v2';
import { DayPlanner, errorText } from './onboarding-kit';

export function StepDays({ token, path, onProposal, onBack }: {
  token: string; path: PathView; onProposal: (proposal: PathProposal) => void; onBack: () => void;
}) {
  const [initial, setInitial] = useState<Day[] | null>(path.availability.length ? path.availability : null);
  const [days, setDays] = useState<Day[]>(path.availability);
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
    <section className="ob-card ob-days" aria-labelledby="ob-days-title">
      <header className="ob-card-head">
        <span className="ob-card-icon" aria-hidden="true"><CalendarDays size={22} /></span>
        <div>
          <h2 id="ob-days-title">Vos jours d’étude</h2>
          <p>Votre objectif demande environ <strong>{formatMinutes(required)} par semaine</strong>. Choisissez vos jours d’étude et vos jours de repos : le planning s’adaptera.</p>
        </div>
      </header>
      {initial ? <DayPlanner initial={initial} required={required} onChange={setDays} /> : <SkeletonCard lines={4} label="Préparation de votre semaine…" />}
      {error && <div role="alert"><Callout tone="warning" title="Planning non calculé">{error}</Callout></div>}
      <footer className="ob-actions">
        <button type="button" className="btn btn-ghost" onClick={onBack}><ArrowLeft size={18} aria-hidden="true" /> Modifier mon objectif</button>
        <button type="button" className="btn btn-primary btn-lg" disabled={busy || !days.length} onClick={() => void submit()}>
          {busy ? <LoaderCircle size={18} className="ob-spin" aria-hidden="true" /> : null}
          {busy ? 'Calcul du planning…' : 'Voir mon planning'} {!busy && <ArrowRight size={18} aria-hidden="true" />}
        </button>
      </footer>
    </section>
  );
}
