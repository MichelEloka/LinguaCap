/**
 * Étape 4 : objectif et durée. Niveau visé (les cibles non autorisées sont grisées), durée prédéfinie ou date, et jauge
 * de difficulté en six bandes calculée par POST /learning/paths/estimate : minutes par semaine et par jour. Un rythme
 * « Irréaliste » bloque la suite. Enregistre par POST /learning/paths, ou PUT …/objective si un brouillon existe.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, CalendarRange, Clock, Flag, Gauge, Hourglass, LoaderCircle, Target, TriangleAlert } from 'lucide-react';
import { Callout, Segmented } from '../../design/kit';
import { requestApi } from '../../integration/api';
import {
  difficultyLabels, formatMinutes, levelCodes, levelRank, type Estimate, type Language, type LevelCode, type PathView, type PlacementView,
  type StartLevel,
} from '../../integration/v2';
import {
  addMonthsIso, daysBetween, difficultyOf, DifficultyBadge, DifficultyGauge, durationText, errorText, isoDay, LevelMark, levelName,
  longDate, shortDate,
} from './onboarding-kit';

const presets = [1, 2, 3, 4, 6, 9, 12];

export function StepObjective({ token, attempt, language, path, onSaved }: {
  token: string; attempt: PlacementView; language: Language | null; path: PathView | null; onSaved: (path: PathView) => Promise<void>;
}) {
  const placed = attempt.result?.placedLevel ?? 'A0';
  const levels = language?.levels ?? [];
  const startOptions = (['A0', ...levelCodes] as StartLevel[]).filter((code) => levelRank(code) <= levelRank(placed));
  const [startLevel, setStartLevel] = useState<StartLevel>(path?.startLevel ?? placed);
  const firstTarget = (from: StartLevel) => (levels.find((level) => level.published && levelRank(level.code) > levelRank(from))?.code
    ?? levelCodes.find((code) => levelRank(code) > levelRank(from)) ?? 'A1') as LevelCode;
  const [targetLevel, setTargetLevel] = useState<LevelCode>(path?.targetLevel ?? firstTarget(path?.startLevel ?? placed));
  const [startDate, setStartDate] = useState(path?.startDate ?? isoDay());
  const [targetDate, setTargetDate] = useState(path?.targetDate ?? addMonthsIso(path?.startDate ?? isoDay(), 3));
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
        method: 'POST', body: { startLevel, targetLevel, startDate, targetDate, ...(path ? { pathId: path.id } : {}) },
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

  async function save() {
    if (!ready || busy) return;
    setBusy(true);
    setError('');
    const body = { targetLevel, startDate, targetDate, startLevel };
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
    <section className="obj" aria-labelledby="obj-title">
      <div className="obj-form">
        <header className="ob-card-head">
          <span className="ob-card-icon" aria-hidden="true"><Target size={22} /></span>
          <div><h2 id="obj-title">Votre objectif</h2><p>Choisissez le niveau à atteindre et le temps que vous vous donnez. Le rythme se calcule en direct.</p></div>
        </header>

        {startOptions.length > 1 && (
          <div className="obj-field">
            <span className="obj-label">Point de départ</span>
            <Segmented label="Point de départ" value={startLevel} onChange={(value) => setStartLevel(value)}
              options={startOptions.map((code) => ({ value: code, label: code === 'A0' ? 'Débutant' : code }))} />
            <small className="obj-help">Votre test indique {levelName(placed)}. Vous pouvez repartir plus bas pour consolider les bases.</small>
          </div>
        )}

        <fieldset className="obj-field">
          <legend className="obj-label">Niveau visé</legend>
          <div className="obj-targets">
            {targets.map(({ code, level }) => {
              const published = level?.published ?? false;
              const allowed = estimate ? estimate.allowedTargets.includes(code) : published;
              const span = estimate?.levels.filter((item) => levelRank(item.levelCode) <= levelRank(code)).reduce((sum, item) => sum + item.plannedMinutes, 0);
              return (
                <label key={code} className={`obj-target lvl-${code}${targetLevel === code ? ' is-selected' : ''}${allowed ? '' : ' is-disabled'}`}>
                  <input type="radio" name="obj-target" value={code} checked={targetLevel === code} disabled={!allowed} onChange={() => setTargetLevel(code)} />
                  <LevelMark code={code} size="md" />
                  <span className="obj-target-text">
                    <strong>{levelName(code)}</strong>
                    <small>{!published ? 'Bientôt disponible' : !allowed ? 'Indisponible depuis ce départ'
                      : targetLevel === code && span ? `${formatMinutes(span)} de programme` : levelCount(startLevel, code)}</small>
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <fieldset className="obj-field">
          <legend className="obj-label">En combien de temps ?</legend>
          <div className="obj-presets">
            {presets.map((count) => {
              const tone = presetTone(count);
              const date = addMonthsIso(startDate, count);
              const outside = estimate ? date > estimate.maxTargetDate || date < estimate.minTargetDate : false;
              return (
                <button key={count} type="button" className="obj-preset" aria-pressed={months === count} disabled={outside}
                  onClick={() => setTargetDate(date)} aria-label={`${count} mois, jusqu’au ${longDate(date)}${tone ? ` : rythme ${difficultyLabels[tone].toLowerCase()}` : ''}`}>
                  <strong>{count}</strong><small>mois</small>
                  {tone && <span className={`dg-dot dg-${tone}`} aria-hidden="true" />}
                </button>
              );
            })}
          </div>
          <div className="obj-dates">
            <label>Je commence le<input type="date" value={startDate} min={isoDay()} onChange={(event) => event.target.value && setStartDate(event.target.value)} /></label>
            <label>J’atteins mon objectif le<input type="date" value={targetDate} min={estimate?.minTargetDate} max={estimate?.maxTargetDate}
              onChange={(event) => event.target.value && setTargetDate(event.target.value)} /></label>
          </div>
          {(tooLate || tooSoon) && estimate && (
            <p className="obj-warning"><TriangleAlert size={15} aria-hidden="true" /> Choisissez une date entre le {longDate(estimate.minTargetDate)} et le {longDate(estimate.maxTargetDate)}.</p>
          )}
        </fieldset>
      </div>

      <aside className={`obj-summary${estimating ? ' is-busy' : ''}${difficulty ? ` dg-${difficulty}` : ''}`} aria-labelledby="obj-summary-title" aria-busy={estimating}>
        <header>
          <span className="obj-summary-icon" aria-hidden="true"><Gauge size={20} /></span>
          <h3 id="obj-summary-title">Votre rythme</h3>
          {difficulty && <DifficultyBadge code={difficulty} label={estimate?.difficulty.label} />}
        </header>
        {estimate ? (
          <>
            <div className="obj-load" aria-live="polite">
              <strong>{formatMinutes(estimate.requiredWeeklyMinutes)}</strong>
              <span>par semaine</span>
            </div>
            <ul className="obj-daily">
              <li><b>{formatMinutes(estimate.requiredDailyMinutes.fiveDays)}</b><small>par jour, 5 jours sur 7</small></li>
              <li><b>{formatMinutes(estimate.requiredDailyMinutes.sevenDays)}</b><small>par jour, 7 jours sur 7</small></li>
            </ul>
            <DifficultyGauge bands={estimate.bands} current={estimate.difficulty.code} busy={estimating}
              onPick={(band) => band.earliestTargetDate && setTargetDate(band.earliestTargetDate)} />
            <ul className="obj-facts">
              <li><CalendarRange size={16} aria-hidden="true" /><span>Du {shortDate(estimate.startDate)} au {longDate(estimate.targetDate)}</span><b>{durationText(estimate.startDate, estimate.targetDate)}</b></li>
              <li><Clock size={16} aria-hidden="true" /><span>Programme à suivre</span><b>{formatMinutes(estimate.requiredMinutes)}</b></li>
              {estimate.levels.map((level) => (
                <li key={level.levelCode} className={`obj-fact-level lvl-${level.levelCode}`}><LevelMark code={level.levelCode} size="sm" />
                  <span>{levelName(level.levelCode)}</span><b>{formatMinutes(level.plannedMinutes)}</b></li>
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
          <p className="obj-pending"><LoaderCircle size={18} className="ob-spin" aria-hidden="true" /> Calcul de votre rythme…</p>
        )}
        {error && <div role="alert"><Callout tone="warning" title="Objectif non enregistré">{error}</Callout></div>}
        <button type="button" className="btn btn-primary btn-lg btn-block" disabled={!ready || busy} onClick={() => void save()}>
          {busy ? <LoaderCircle size={18} className="ob-spin" aria-hidden="true" /> : <Flag size={18} aria-hidden="true" />}
          {unrealistic ? 'Choisissez une date plus lointaine' : 'Valider mon objectif'}
          {!unrealistic && <ArrowRight size={18} aria-hidden="true" />}
        </button>
        <p className="obj-note"><Hourglass size={14} aria-hidden="true" /> Vous choisirez vos jours d’étude à l’étape suivante.</p>
      </aside>
    </section>
  );
}

function levelCount(start: StartLevel, target: LevelCode) {
  const count = levelRank(target) - levelRank(start);
  return count > 1 ? `${count} niveaux à parcourir` : 'Le niveau suivant';
}
