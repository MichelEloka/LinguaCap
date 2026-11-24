/**
 * Étape 4 : objectif et durée. Niveau visé (les cibles non autorisées sont grisées), durée prédéfinie ou dates, et jauge
 * de difficulté en six bandes calculée par POST /learning/paths/estimate : minutes par semaine et par jour. Un rythme
 * « Irréaliste » bloque la suite. Enregistre par POST /learning/paths, ou PUT …/objective si un brouillon existe.
 */
import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { ArrowRight, CalendarRange, ChevronDown, Clock, Flag, Gauge, LoaderCircle, Target, TriangleAlert } from 'lucide-react';
import { Callout, Segmented } from '../../design/kit';
import { requestApi } from '../../integration/api';
import { notBefore } from '../../integration/pilot-day';
import {
  difficultyLabels, formatMinutes, levelCodes, levelRank, type Estimate, type Language, type LevelCode, type PathView, type PlacementView,
  type StartLevel,
} from '../../integration/v2';
import { ChoiceGrid, JourneyActions, JourneyQuestion, JourneyStage, type ChoiceOption } from '../journey';
import {
  addMonthsIso, daysBetween, difficultyOf, DifficultyBadge, DifficultyGauge, durationText, errorText, isoDay, LevelMark, levelName,
  longDate, shortDate,
} from './onboarding-kit';
import { useScene } from './onboarding-scene';

const presets = [1, 2, 3, 4, 6, 9, 12];

export function StepObjective({ token, attempt, language, path, onBack, onSaved }: {
  token: string; attempt: PlacementView; language: Language | null; path: PathView | null; onBack: () => void;
  onSaved: (path: PathView) => Promise<void>;
}) {
  const { direction } = useScene();
  const placed = attempt.result?.placedLevel ?? 'A0';
  const levels = language?.levels ?? [];
  const startOptions = (['A0', ...levelCodes] as StartLevel[]).filter((code) => levelRank(code) <= levelRank(placed));
  const [startLevel, setStartLevel] = useState<StartLevel>(path?.startLevel ?? placed);
  const firstTarget = (from: StartLevel) => (levels.find((level) => level.published && levelRank(level.code) > levelRank(from))?.code
    ?? levelCodes.find((code) => levelRank(code) > levelRank(from)) ?? 'A1') as LevelCode;
  const [targetLevel, setTargetLevel] = useState<LevelCode>(path?.targetLevel ?? firstTarget(path?.startLevel ?? placed));
  // Un brouillon repris des jours plus tard ne peut pas commencer dans le passé : son début est ramené à aujourd'hui.
  const [startDate, setStartDate] = useState(() => notBefore(path?.startDate ?? isoDay(), isoDay()));
  const [targetDate, setTargetDate] = useState(() => path?.targetDate ?? addMonthsIso(isoDay(), 3));
  const [estimate, setEstimate] = useState<Estimate | null>(null);
  const [estimating, setEstimating] = useState(false);
  const [estimateError, setEstimateError] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const sequence = useRef(0);

  useEffect(() => {
    const ticket = ++sequence.current;
    setEstimating(true);
    const timer = window.setTimeout(() => {
      requestApi<Estimate>('/learning/paths/estimate', token, {
        method: 'POST', body: { startLevel, targetLevel, startDate: notBefore(startDate, isoDay()), targetDate, ...(path ? { pathId: path.id } : {}) },
      }).then((next) => {
        if (ticket !== sequence.current) return;
        setEstimate(next);
        setEstimateError('');
        // Cible devenue impossible (point de départ changé) : la première cible autorisée la remplace.
        if (next.allowedTargets.length && !next.allowedTargets.includes(targetLevel)) setTargetLevel(next.allowedTargets[0]);
      }).catch((failure: unknown) => { if (ticket === sequence.current) setEstimateError(errorText(failure)); })
        .finally(() => { if (ticket === sequence.current) setEstimating(false); });
    }, 220);
    return () => window.clearTimeout(timer);
  }, [token, startLevel, targetLevel, startDate, targetDate, path]);

  const months = presets.find((count) => addMonthsIso(startDate, count) === targetDate) ?? null;
  const [customDates, setCustomDates] = useState(months === null);
  const required = estimate?.requiredMinutes ?? 0;
  const presetTone = (count: number) => {
    if (!estimate) return null;
    const weeks = daysBetween(startDate, addMonthsIso(startDate, count)) / 7;
    return difficultyOf(Math.ceil(required / weeks), weeks);
  };
  const difficulty = estimate?.difficulty.code ?? null;
  const unrealistic = difficulty === 'unrealistic';
  const fastest = estimate?.bands.find((band) => band.code === 'very_intensive')?.earliestTargetDate ?? null;
  const tooLate = Boolean(estimate && targetDate > estimate.maxTargetDate);
  const tooSoon = Boolean(estimate && targetDate < estimate.minTargetDate);
  const ready = Boolean(estimate) && !estimating && !unrealistic && !tooLate && !tooSoon && !estimateError;
  const targets = useMemo(() => levelCodes.filter((code) => levelRank(code) > levelRank(startLevel))
    .map((code) => ({ code, level: levels.find((item) => item.code === code) })), [levels, startLevel]);

  const targetOptions: ChoiceOption<LevelCode>[] = targets.map(({ code, level }) => {
    const published = level?.published ?? false;
    const allowed = estimate ? estimate.allowedTargets.includes(code) : published;
    const span = estimate?.levels.filter((item) => levelRank(item.levelCode) <= levelRank(code)).reduce((sum, item) => sum + item.plannedMinutes, 0);
    return {
      value: code, icon: <LevelMark code={code} size="md" />, title: levelName(code), disabled: !allowed,
      tag: !published ? 'Bientôt' : undefined, tagTone: 'neutral',
      description: !published ? 'Parcours en préparation' : !allowed ? 'Indisponible depuis ce départ'
        : targetLevel === code && span ? `${formatMinutes(span)} de programme` : levelCount(startLevel, code),
    };
  });

  async function save() {
    if (!ready || busy) return;
    setBusy(true);
    setError('');
    // Page restée ouverte après minuit : le début d'hier devient aujourd'hui, la durée choisie est conservée.
    const start = notBefore(startDate, isoDay());
    const body = { targetLevel, startDate: start, targetDate: months !== null ? addMonthsIso(start, months) : targetDate, startLevel };
    try {
      const view = path
        ? await requestApi<PathView>(`/learning/paths/${encodeURIComponent(path.id)}/objective`, token, { method: 'PUT', body })
        : await requestApi<PathView>('/learning/paths', token, { method: 'POST', body: { placementAttemptId: attempt.id, ...body } });
      await onSaved(view);
    } catch (failure) {
      setError(errorText(failure));
      setBusy(false);
    }
  }

  return (
    <JourneyStage className="lo-objective">
      <JourneyQuestion stepKey="objective" direction={direction} icon={<Target />} eyebrow="Objectif et durée"
        title="Quel niveau visez-vous, et pour quand ?"
        description="Choisissez le niveau à atteindre et le temps que vous vous donnez : votre rythme se calcule en direct.">
        {startOptions.length > 1 && (
          <div className="lo-field">
            <span className="lo-label">Point de départ</span>
            <Segmented label="Point de départ" value={startLevel} onChange={(value) => setStartLevel(value)}
              options={startOptions.map((code) => ({ value: code, label: code === 'A0' ? 'Débutant' : code }))} />
            <small className="lo-help">Votre test indique {levelName(placed)}. Vous pouvez repartir plus bas pour consolider les bases.</small>
          </div>
        )}

        <div className="lo-field">
          <ChoiceGrid legend="Niveau visé" options={targetOptions} value={targetLevel} onChange={setTargetLevel} columns={3} layout="tile" />
        </div>

        <fieldset className="lo-field">
          <legend className="lo-label">En combien de temps ?</legend>
          <div className="lo-durations">
            {presets.map((count) => {
              const tone = presetTone(count);
              const date = addMonthsIso(startDate, count);
              const outside = estimate ? date > estimate.maxTargetDate || date < estimate.minTargetDate : false;
              return (
                <button key={count} type="button" className={`lo-duration${tone ? ` dg-${tone}` : ''}`} aria-pressed={months === count} disabled={outside}
                  onClick={() => setTargetDate(date)} aria-label={`${count} mois, jusqu’au ${longDate(date)}${tone ? ` : rythme ${difficultyLabels[tone].toLowerCase()}` : ''}`}>
                  <strong>{count}</strong><small>mois</small>
                  <span className="lo-duration-tone" aria-hidden="true" />
                </button>
              );
            })}
          </div>
          <button type="button" className="lo-disclosure" aria-expanded={customDates} onClick={() => setCustomDates((open) => !open)}>
            <CalendarRange size={15} aria-hidden="true" /> {months === null ? 'Dates précises' : 'Choisir des dates précises'}
            <ChevronDown size={15} aria-hidden="true" />
          </button>
          {customDates && (
            <div className="lo-dates">
              <label>Je commence le<input type="date" value={startDate} min={isoDay()} onChange={(event) => event.target.value && setStartDate(event.target.value)} /></label>
              <label>J’atteins mon objectif le<input type="date" value={targetDate} min={estimate?.minTargetDate} max={estimate?.maxTargetDate}
                onChange={(event) => event.target.value && setTargetDate(event.target.value)} /></label>
            </div>
          )}
          {(tooLate || tooSoon) && estimate && (
            <p className="lo-warning"><TriangleAlert size={15} aria-hidden="true" /> Choisissez une date entre le {longDate(estimate.minTargetDate)} et le {longDate(estimate.maxTargetDate)}.</p>
          )}
        </fieldset>

        <section className={`lo-pace${estimating ? ' is-busy' : ''}${difficulty ? ` dg-${difficulty}` : ''}`} aria-labelledby="lo-pace-title" aria-busy={estimating}>
          <header className="lo-pace-head">
            <span className="lo-pace-icon" aria-hidden="true"><Gauge size={19} /></span>
            <h2 id="lo-pace-title">Votre rythme</h2>
            {difficulty && <DifficultyBadge code={difficulty} label={estimate?.difficulty.label} />}
          </header>
          {estimate ? (
            <>
              <div className="lo-pace-figures" aria-live="polite">
                <p className="lo-pace-main">
                  <strong key={estimate.requiredWeeklyMinutes}>{formatMinutes(estimate.requiredWeeklyMinutes)}</strong><span>par semaine</span>
                </p>
                <ul className="lo-pace-daily">
                  <li><b>{formatMinutes(estimate.requiredDailyMinutes.fiveDays)}</b><small>par jour, 5 jours sur 7</small></li>
                  <li><b>{formatMinutes(estimate.requiredDailyMinutes.sevenDays)}</b><small>par jour, 7 jours sur 7</small></li>
                </ul>
              </div>
              <DifficultyGauge bands={estimate.bands} current={estimate.difficulty.code} busy={estimating}
                onPick={(band) => band.earliestTargetDate && setTargetDate(band.earliestTargetDate)} />
              <ul className="lo-pace-facts">
                <li><CalendarRange size={16} aria-hidden="true" /><span>Du {shortDate(estimate.startDate)} au {longDate(estimate.targetDate)}</span><b>{durationText(estimate.startDate, estimate.targetDate)}</b></li>
                <li><Clock size={16} aria-hidden="true" /><span>Programme à suivre</span><b>{formatMinutes(estimate.requiredMinutes)}</b></li>
                {estimate.levels.map((level, index) => (
                  <li key={level.levelCode} className={`lvl-${level.levelCode}`} style={{ '--i': index } as CSSProperties}>
                    <LevelMark code={level.levelCode} size="sm" /><span>{levelName(level.levelCode)}</span><b>{formatMinutes(level.plannedMinutes)}</b>
                  </li>
                ))}
              </ul>
              {unrealistic && (
                <div role="alert">
                  <Callout tone="warning" title="Rythme irréaliste">
                    Plus de 14 heures par semaine : ce délai ne laisse pas le temps d’apprendre.
                    {fastest ? ` Visez au plus tôt le ${longDate(fastest)} (rythme très intensif), ou choisissez une durée plus longue.` : ' Choisissez une durée plus longue.'}
                  </Callout>
                </div>
              )}
            </>
          ) : estimateError ? (
            <div role="alert"><Callout tone="warning" title="Estimation indisponible">{estimateError}</Callout></div>
          ) : (
            <p className="lo-pending"><LoaderCircle size={18} className="ob-spin" aria-hidden="true" /> Calcul de votre rythme…</p>
          )}
        </section>
        {error && <div role="alert"><Callout tone="warning" title="Objectif non enregistré">{error}</Callout></div>}
      </JourneyQuestion>
      <JourneyActions onBack={onBack} primaryType="button" onPrimary={() => void save()} disabled={!ready} busy={busy}
        hint={unrealistic ? false : undefined}>
        {busy ? <LoaderCircle size={18} className="ob-spin" aria-hidden="true" /> : <Flag size={18} aria-hidden="true" />}
        {unrealistic ? 'Choisissez une date plus lointaine' : 'Valider mon objectif'}
        {!unrealistic && <ArrowRight size={18} aria-hidden="true" />}
      </JourneyActions>
    </JourneyStage>
  );
}

function levelCount(start: StartLevel, target: LevelCode) {
  const count = levelRank(target) - levelRank(start);
  return count > 1 ? `${count} niveaux à parcourir` : 'Le niveau suivant';
}
