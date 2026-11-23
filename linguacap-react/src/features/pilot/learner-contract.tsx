/**
 * « Mon contrat » (/espace/contrat) : contrat en vigueur, proposition en attente (accepter, refuser, contre-proposer),
 * avenant avec estimation en direct, engagement expliqué et historique des propositions.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, CalendarClock, Check, CircleCheck, Clock, CircleX, FilePen, Handshake, History, LoaderCircle, Lock, MessageSquareQuote, Minus, Plus,
  RotateCcw, Shuffle, Undo2,
} from 'lucide-react';
import { Badge, Dialog, PageHeading } from '../../components/ui';
import { Avatar, Callout, Card, Drawer, Skeleton, SkeletonCard, Timeline, useToast, type TimelineEntry } from '../../design/kit';
import { requestApi } from '../../integration/api';
import {
  contractProposerLabels, contractStatusTones, formatMinutes, gradingDelayLabels, levelCodes, levelRank,
  type Contract, type ContractTerms, type Estimate, type GradingDelayHours, type LevelCode, type PathView, type TeacherCard,
} from '../../integration/v2';
import {
  addMonthsIso, learnerContractLabels, DifficultyBadge, DifficultyGauge, errorText, LevelMark, levelName, longDate, momentText, WeekSummary,
} from '../onboarding/onboarding-kit';
import { daysFromToday, localDate } from './learner-calendar';
import { EmptyScene } from './learner-common';
import './learner-path.css';

const statusIcons = { accepted: <Check size={14} />, rejected: <CircleX size={14} />, pending_teacher: <CalendarClock size={14} />,
  pending_learner: <CalendarClock size={14} />, superseded: <Undo2 size={14} />, withdrawn: <Undo2 size={14} /> };
const timelineTones = { accepted: 'success', rejected: 'danger', pending_teacher: 'warning', pending_learner: 'brand', superseded: undefined, withdrawn: undefined } as const;

function sameDays(left: ContractTerms, right: ContractTerms) {
  return JSON.stringify(left.availability) === JSON.stringify(right.availability);
}

/** Conditions d'un contrat ; avec `compare`, les conditions qui changent sont mises en avant. */
function TermsGrid({ terms, compare }: { terms: ContractTerms; compare?: ContractTerms | null }) {
  const changed = (key: 'targetLevel' | 'targetDate' | 'weeklyMinutes' | 'startLevel') => Boolean(compare && compare[key] !== terms[key]);
  const rows = [
    { key: 'targetLevel' as const, label: 'Niveau visé', value: <span className="lct-level"><LevelMark code={terms.startLevel} size="sm" /> → <LevelMark code={terms.targetLevel} size="sm" /> {levelName(terms.targetLevel)}</span>,
      before: compare ? levelName(compare.targetLevel) : null },
    { key: 'targetDate' as const, label: 'Date cible', value: longDate(terms.targetDate), before: compare ? longDate(compare.targetDate) : null },
    { key: 'weeklyMinutes' as const, label: 'Temps minimal', value: `${formatMinutes(terms.weeklyMinutes)} par semaine`, before: compare ? formatMinutes(compare.weeklyMinutes) : null },
  ];
  return (
    <div className="lct-terms">
      <dl className="lct-terms-list">
        {rows.map((row) => (
          <div key={row.key} className={changed(row.key) ? 'is-changed' : undefined}>
            <dt>{row.label}{changed(row.key) && <Badge tone="blue">Modifié</Badge>}</dt>
            <dd>{changed(row.key) && row.before && <small className="lct-before"><s>{row.before}</s> <span aria-hidden="true">→</span><span className="sr-only">devient</span></small>}{row.value}</dd>
          </div>
        ))}
        <div><dt>Rythme</dt><dd><DifficultyBadge code={terms.difficulty.code} label={terms.difficulty.label} /> <small>{formatMinutes(terms.difficulty.requiredWeeklyMinutes)} nécessaires par semaine</small></dd></div>
      </dl>
      {terms.availability.length > 0 && (
        <div className={`lct-days${compare && !sameDays(terms, compare) ? ' is-changed' : ''}`}>
          <span>Jours d’étude{compare && !sameDays(terms, compare) && <Badge tone="blue">Modifiés</Badge>}</span>
          <WeekSummary days={terms.availability} />
        </div>
      )}
    </div>
  );
}

/** Temps écoulé du contrat : du début à la date cible, avec le repère d'aujourd'hui. */
function ContractClock({ from, to }: { from: string; to: string }) {
  const total = Math.max(1, Math.round((localDate(to).getTime() - localDate(from).getTime()) / 86_400_000));
  const elapsed = Math.max(0, Math.min(total, -daysFromToday(localDate(from))));
  const left = Math.max(0, daysFromToday(localDate(to)));
  const share = (elapsed / total) * 100;
  return (
    <div className="lct-clock">
      <div className="lct-clock-head">
        <span><strong>Jour {elapsed}</strong> sur {total}</span>
        <span>{left ? `${left} jour${left > 1 ? 's' : ''} avant la date cible` : 'Date cible atteinte'}</span>
      </div>
      <span className="lct-clock-track" role="img" aria-label={`${Math.round(share)} % de la durée du contrat écoulée`}>
        <span style={{ width: `${share}%` }} /><i style={{ left: `${share}%` }} />
      </span>
      <div className="lct-clock-foot"><small>{longDate(from)}</small><small>{longDate(to)}</small></div>
    </div>
  );
}

function Stepper({ value, min, onChange, label }: { value: number; min: number; onChange: (value: number) => void; label: string }) {
  const clamp = (next: number) => Math.max(min, Math.min(5040, next));
  return (
    <div className="lct-stepper" role="group" aria-label={label}>
      <button type="button" onClick={() => onChange(clamp(value - 15))} disabled={value <= min} aria-label="Moins 15 minutes"><Minus size={16} aria-hidden="true" /></button>
      <span><strong>{formatMinutes(value)}</strong><small>par semaine</small></span>
      <button type="button" onClick={() => onChange(clamp(value + 15))} aria-label="Plus 15 minutes"><Plus size={16} aria-hidden="true" /></button>
    </div>
  );
}

/** Avenant ou contre-proposition : niveau visé, date, engagement et note, avec estimation en direct. */
function ContractForm({ token, path, base, title, description, accompanied, onClose, onSent }: {
  token: string; path: PathView; base: ContractTerms; title: string; description: string; accompanied: boolean;
  onClose: () => void; onSent: (contract: Contract) => void;
}) {
  const [targetLevel, setTargetLevel] = useState<LevelCode>(base.targetLevel);
  const [targetDate, setTargetDate] = useState(base.targetDate);
  const [weeklyMinutes, setWeeklyMinutes] = useState(base.weeklyMinutes);
  const [note, setNote] = useState('');
  const [estimate, setEstimate] = useState<Estimate | null>(null);
  const [estimating, setEstimating] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const ticket = useRef(0);

  useEffect(() => {
    const current = ++ticket.current;
    setEstimating(true);
    const timer = window.setTimeout(() => {
      requestApi<Estimate>('/learning/paths/estimate', token, { method: 'POST', body: { pathId: path.id, targetLevel, targetDate } })
        .then((next) => { if (current === ticket.current) { setEstimate(next); setError(''); } })
        .catch((failure: unknown) => { if (current === ticket.current) setError(errorText(failure)); })
        .finally(() => { if (current === ticket.current) setEstimating(false); });
    }, 220);
    return () => window.clearTimeout(timer);
  }, [token, path.id, targetLevel, targetDate]);

  const needed = estimate?.requiredWeeklyMinutes ?? 0;
  const unrealistic = estimate?.difficulty.code === 'unrealistic';
  const below = Boolean(estimate) && weeklyMinutes < needed;
  const unchanged = targetLevel === base.targetLevel && targetDate === base.targetDate && weeklyMinutes === base.weeklyMinutes;
  const targets = levelCodes.filter((code) => levelRank(code) > levelRank(path.startLevel));

  async function send() {
    setBusy(true);
    setError('');
    try {
      onSent(await requestApi<Contract>(`/learning/paths/${encodeURIComponent(path.id)}/contracts`, token, {
        method: 'POST', body: { targetLevel, targetDate, weeklyMinutes, ...(note.trim() ? { note: note.trim() } : {}) },
      }));
    } catch (failure) {
      setError(errorText(failure));
      setBusy(false);
    }
  }

  return (
    <Drawer wide title={title} description={description} onClose={onClose}
      footer={<>
        <button type="button" className="btn btn-ghost" onClick={onClose}>Annuler</button>
        <button type="button" className="btn btn-primary" disabled={busy || estimating || !estimate || unrealistic || below || unchanged} onClick={() => void send()}>
          {busy ? <LoaderCircle size={17} className="ld-spin" aria-hidden="true" /> : <FilePen size={17} aria-hidden="true" />}
          {accompanied ? 'Envoyer à mon professeur' : 'Appliquer ces conditions'}
        </button>
      </>}>
      <fieldset className="lct-field">
        <legend>Niveau visé</legend>
        <div className="lct-targets">
          {targets.map((code) => {
            const allowed = estimate ? estimate.allowedTargets.includes(code) : code === targetLevel;
            return (
              <button key={code} type="button" className={`lct-target lvl-${code}`} aria-pressed={targetLevel === code} disabled={!allowed} onClick={() => setTargetLevel(code)}>
                <LevelMark code={code} size="sm" state={allowed ? undefined : 'locked'} /> {code}
              </button>
            );
          })}
        </div>
      </fieldset>
      <fieldset className="lct-field">
        <legend>Date cible</legend>
        <div className="lct-dates">
          {[-1, 1, 2, 3].map((months) => {
            const date = addMonthsIso(base.targetDate, months);
            return (
              <button key={months} type="button" className="kit-chip" aria-pressed={targetDate === date} onClick={() => setTargetDate(date)}
                disabled={estimate ? date < estimate.minTargetDate || date > estimate.maxTargetDate : false}>
                {months > 0 ? `+${months} mois` : `${months} mois`}
              </button>
            );
          })}
          <label className="lct-date-input"><span className="sr-only">Date cible</span>
            <input type="date" value={targetDate} min={estimate?.minTargetDate} max={estimate?.maxTargetDate} onChange={(event) => event.target.value && setTargetDate(event.target.value)} /></label>
        </div>
      </fieldset>
      <section className="lct-estimate" aria-live="polite" aria-busy={estimating}>
        {estimate ? (
          <>
            <div className="lct-estimate-head">
              <div><span>Nécessaire</span><strong>{formatMinutes(estimate.requiredWeeklyMinutes)}</strong><small>par semaine, soit {formatMinutes(estimate.requiredDailyMinutes.fiveDays)} par jour sur 5 jours</small></div>
              <DifficultyBadge code={estimate.difficulty.code} label={estimate.difficulty.label} />
            </div>
            <DifficultyGauge bands={estimate.bands} current={estimate.difficulty.code} busy={estimating}
              onPick={(band) => band.earliestTargetDate && setTargetDate(band.earliestTargetDate)} />
          </>
        ) : <SkeletonCard lines={2} label="Estimation en cours…" />}
      </section>
      <fieldset className="lct-field">
        <legend>Mon engagement</legend>
        <p className="lct-help">Le temps minimal que vous garantissez chaque semaine : vos jours d’étude devront au moins l’atteindre.</p>
        <Stepper value={weeklyMinutes} min={15} onChange={setWeeklyMinutes} label="Temps minimal par semaine" />
        {below && <p className="lct-warning">L’objectif demande au moins {formatMinutes(needed)} par semaine.
          <button type="button" className="text-link" onClick={() => setWeeklyMinutes(Math.ceil(needed / 15) * 15)}>Ajuster à {formatMinutes(Math.ceil(needed / 15) * 15)}</button></p>}
      </fieldset>
      <label className="lct-note-field">Un mot pour expliquer (facultatif)
        <textarea rows={3} maxLength={1000} value={note} onChange={(event) => setNote(event.target.value)}
          placeholder={accompanied ? 'Par exemple : je pars deux semaines en juillet.' : 'Pour vous en souvenir plus tard.'} /></label>
      {unrealistic && <Callout tone="warning" title="Rythme irréaliste">Plus de 14 heures par semaine : choisissez une date plus lointaine.</Callout>}
      {error && <div role="alert"><Callout tone="warning" title="Proposition impossible">{error}</Callout></div>}
    </Drawer>
  );
}

export function LearnerContractPage({ token }: { token: string }) {
  const toast = useToast();
  const [path, setPath] = useState<PathView | null | undefined>(undefined);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [teacher, setTeacher] = useState<TeacherCard | null>(null);
  const [failure, setFailure] = useState('');
  const [retry, setRetry] = useState(0);
  const [form, setForm] = useState<null | 'amendment' | 'counter'>(null);
  const [rejecting, setRejecting] = useState(false);
  const [rejectNote, setRejectNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setFailure('');
    (async () => {
      const view = await requestApi<PathView | null>('/learning/path', token);
      const list = view ? await requestApi<Contract[]>(`/learning/paths/${encodeURIComponent(view.id)}/contracts`, token) : [];
      const card = view?.accompanied ? await requestApi<TeacherCard | null>('/me/teacher', token).catch(() => null) : null;
      if (!active) return;
      setPath(view);
      setContracts(list);
      setTeacher(card);
    })().catch((error: unknown) => { if (active) setFailure(errorText(error)); });
    return () => { active = false; };
  }, [token, retry]);

  const refresh = () => setRetry((value) => value + 1);
  const history = useMemo<TimelineEntry[]>(() => contracts.map((contract) => {
    // Une contre-proposition reprend sa note comme motif du refus du contrat précédent : elle n'est affichée qu'une fois.
    const reason = contract.decisionNote && !contracts.some((other) => other.number !== contract.number && other.note === contract.decisionNote)
      ? contract.decisionNote : null;
    return {
    id: String(contract.number),
    title: <>Contrat n° {contract.number} · {learnerContractLabels[contract.status]}</>,
    meta: <>
      <span className="lct-hist-meta">Proposé par {contract.proposedBy === 'teacher' ? 'votre professeur' : contract.proposedBy === 'learner' ? 'vous' : contractProposerLabels[contract.proposedBy]} le {momentText(contract.createdAt)}
        {contract.decidedAt && <> · décidé le {momentText(contract.decidedAt)}</>}</span>
      <span className="lct-hist-terms">
        <span><LevelMark code={contract.terms.targetLevel} size="sm" /> {levelName(contract.terms.targetLevel)}</span>
        <span><CalendarClock size={13} aria-hidden="true" /> {longDate(contract.terms.targetDate)}</span>
        <span><Clock size={13} aria-hidden="true" /> {formatMinutes(contract.terms.weeklyMinutes)} / sem.</span>
      </span>
      {contract.note && <span className="lct-quote">« {contract.note} »</span>}
      {reason && <span className="lct-quote is-answer">Réponse : « {reason} »</span>}</>,
    tone: timelineTones[contract.status], icon: statusIcons[contract.status],
  }; }), [contracts]);

  const heading = <PageHeading title="Mon contrat" description="Votre engagement : un niveau à atteindre, une date et un temps minimal par semaine." />;
  if (path === undefined) {
    return (
      <div className="ld-page lc-enter">
        {heading}
        {failure ? (
          <div role="alert"><Callout tone="warning" title="Contrat indisponible"><p>{failure}</p>
            <button type="button" className="btn btn-outline btn-sm" onClick={refresh}><RotateCcw size={15} aria-hidden="true" /> Réessayer</button></Callout></div>
        ) : (
          <div className="lct lct-loading" role="status" aria-label="Chargement de votre contrat…">
            <div className="lct-main" aria-hidden="true">
              <div className="kit-skeleton-card lct-skel"><span className="lct-skel-head"><Skeleton width={52} height={52} radius={26} /><span><Skeleton width="38%" height={11} /><Skeleton width="62%" height={20} /></span></span>
                <span className="lct-skel-grid">{[0, 1, 2, 3].map((index) => <Skeleton key={index} width="100%" height={64} radius={12} />)}</span></div>
              <div className="kit-skeleton-card"><Skeleton width="45%" height={18} /><Skeleton width="92%" /><Skeleton width="78%" /><Skeleton width="64%" /></div>
            </div>
            <div className="lct-side" aria-hidden="true"><div className="kit-skeleton-card"><Skeleton width="55%" height={16} />{[0, 1, 2].map((index) => <span key={index} className="lct-skel-rule"><Skeleton width={32} height={32} radius={10} /><Skeleton width="80%" /></span>)}</div></div>
          </div>
        )}
      </div>
    );
  }
  if (path === null) {
    return (
      <div className="ld-page lc-enter">
        {heading}
        <Card><EmptyScene art="contract" title="Pas encore de contrat" description="Votre contrat naît à la validation de votre premier planning."
          action={<Link className="btn btn-primary" to="/espace/accueil">Construire mon parcours</Link>} /></Card>
      </div>
    );
  }

  const { current, pending, engaged } = path.contract;
  const mine = pending && (pending.proposedBy === 'learner');
  const base = pending?.terms ?? current?.terms ?? null;
  // Conditions de référence d'une proposition : le contrat en vigueur, sinon la proposition précédente (déjà appliquée).
  const reference = current?.terms ?? (pending ? contracts.find((contract) => contract.number < pending.number)?.terms ?? null : null);

  async function decide(kind: 'accept' | 'reject') {
    if (!pending) return;
    setBusy(true);
    setError('');
    try {
      if (kind === 'accept') {
        await requestApi<PathView>(`/learning/paths/${encodeURIComponent(pending.pathId)}/contracts/${pending.number}/accept`, token, { method: 'POST', body: {} });
        toast('Contrat accepté : vos nouvelles conditions s’appliquent.');
      } else {
        await requestApi<PathView>(`/learning/paths/${encodeURIComponent(pending.pathId)}/contracts/${pending.number}/reject`, token, {
          method: 'POST', body: rejectNote.trim() ? { note: rejectNote.trim() } : {},
        });
        toast('Proposition refusée : votre contrat actuel reste en vigueur.');
        setRejecting(false);
      }
      refresh();
    } catch (failure) {
      setError(errorText(failure));
    } finally {
      setBusy(false);
    }
  }

  const sent = (contract: Contract) => {
    setForm(null);
    toast(contract.status === 'accepted' ? 'Avenant appliqué : vos nouvelles conditions sont en vigueur.' : 'Proposition envoyée à votre professeur.');
    refresh();
  };

  return (
    <div className="ld-page lc-enter">
      <PageHeading title="Mon contrat" description="Votre engagement : un niveau à atteindre, une date et un temps minimal par semaine."
        action={path.permissions.canProposeContract && !pending?.canAccept ? (
          <button type="button" className="btn btn-primary" onClick={() => setForm('amendment')}><FilePen size={17} aria-hidden="true" /> {mine ? 'Modifier ma proposition' : 'Proposer un avenant'}</button>
        ) : undefined} />
      {error && <div role="alert"><Callout tone="warning" title="Une action n’a pas abouti">{error}</Callout></div>}

      <div className="lct">
        <div className="lct-main">
          {pending?.canAccept && (
            <section className="lct-offer" aria-labelledby="lct-offer-title">
              <header>
                <span className="lct-offer-icon" aria-hidden="true"><MessageSquareQuote size={22} /></span>
                <div>
                  <p className="lct-offer-kicker">Proposition n° {pending.number} · {momentText(pending.createdAt)}</p>
                  <h2 id="lct-offer-title">{pending.proposedBy === 'teacher' ? 'Votre professeur vous propose un nouveau contrat' : 'Un nouveau contrat vous est proposé'}</h2>
                </div>
              </header>
              {pending.note && (
                <blockquote className="lct-bubble">
                  {teacher && <Avatar name={teacher.displayName} size={32} />}
                  <p>{pending.note}<small>{teacher?.displayName ?? contractProposerLabels[pending.proposedBy]}</small></p>
                </blockquote>
              )}
              <TermsGrid terms={pending.terms} compare={reference} />
              <div className="lct-offer-actions">
                <button type="button" className="btn btn-ghost" disabled={busy} onClick={() => setForm('counter')}><Shuffle size={16} aria-hidden="true" /> Contre-proposer</button>
                <button type="button" className="btn btn-outline" disabled={busy || !pending.canReject} onClick={() => setRejecting(true)}><CircleX size={16} aria-hidden="true" /> Refuser</button>
                <button type="button" className="btn btn-primary" disabled={busy} onClick={() => void decide('accept')}>
                  {busy ? <LoaderCircle size={17} className="ld-spin" aria-hidden="true" /> : <CircleCheck size={17} aria-hidden="true" />} Accepter
                </button>
              </div>
            </section>
          )}

          {pending && !pending.canAccept && (
            <Card className="lct-waiting" title={`Proposition n° ${pending.number} envoyée`} icon={<CalendarClock size={19} />}
              description={`Le ${momentText(pending.createdAt)} · ${learnerContractLabels[pending.status]}`}
              action={<Badge tone={contractStatusTones[pending.status]}>{learnerContractLabels[pending.status]}</Badge>}>
              <p className="lct-text">{current
                ? 'Votre contrat actuel reste en vigueur tant que votre professeur n’a pas répondu.'
                : 'Ces conditions s’appliquent déjà : vous pouvez suivre vos séances sans attendre la réponse de votre professeur.'}</p>
              <TermsGrid terms={pending.terms} compare={current?.terms ?? null} />
            </Card>
          )}

          {current ? (
            <section className="lct-current" aria-labelledby="lct-current-title">
              <header>
                <div className="lct-seal" aria-hidden="true"><Handshake size={26} /></div>
                <div>
                  <p className="lct-offer-kicker">Contrat n° {current.number}{current.decidedAt ? ` · en vigueur depuis le ${momentText(current.decidedAt)}` : ''}</p>
                  <h2 id="lct-current-title">{levelName(current.terms.targetLevel)} le {longDate(current.terms.targetDate)}</h2>
                </div>
                <Badge tone="green">{learnerContractLabels.accepted}</Badge>
              </header>
              <ContractClock from={current.terms.startDate} to={current.terms.targetDate} />
              <TermsGrid terms={current.terms} />
            </section>
          ) : !pending && (
            <Card><EmptyScene art="contract" title="Aucun contrat en vigueur" description="Votre contrat apparaîtra à la validation de votre planning." /></Card>
          )}

          <Card title="Historique" icon={<History size={19} />} description={`${contracts.length} proposition${contracts.length > 1 ? 's' : ''}, de la plus récente à la plus ancienne`}>
            {history.length ? <Timeline items={history} /> : <EmptyScene art="contract" compact title="Aucune proposition pour le moment" />}
          </Card>
        </div>

        <aside className="lct-side" aria-label="Comprendre mon contrat">
          <Card className="lct-explain" title="Comprendre mon contrat" icon={<Lock size={19} />}>
            <ul className="lct-rules">
              <li><span className="lct-rule-icon is-locked" aria-hidden="true"><Lock size={15} /></span>
                <div><strong>Ce qui est fixé</strong><small>Le niveau visé, la date cible et le temps minimal par semaine{engaged ? '' : ', dès que le contrat est accepté'}.</small></div></li>
              <li><span className="lct-rule-icon is-free" aria-hidden="true"><Shuffle size={15} /></span>
                <div><strong>Ce qui reste libre</strong><small>Vos jours d’étude : réorganisez-les quand vous voulez, tant que la semaine garde le temps minimal.</small></div></li>
              <li><span className="lct-rule-icon is-change" aria-hidden="true"><FilePen size={15} /></span>
                <div><strong>Pour changer d’objectif</strong><small>{path.accompanied
                  ? 'Proposez un avenant : il s’applique dès que votre professeur l’accepte. Votre professeur peut aussi vous en proposer un.'
                  : 'Proposez un avenant : en autonomie, il s’applique immédiatement.'}</small></div></li>
            </ul>
            <Link className="text-link" to="/espace/planning">Voir mon planning <ArrowRight size={15} aria-hidden="true" /></Link>
          </Card>
          {teacher && (
            <Card className="lct-teacher" title="Votre professeur" icon={<Handshake size={19} />}>
              <div className="lct-teacher-row">
                <Avatar name={teacher.displayName} size={44} />
                <div><strong>{teacher.displayName}</strong>
                  {teacher.gradingDelayHours && <small>Corrige {(gradingDelayLabels[teacher.gradingDelayHours as GradingDelayHours] ?? '').toLowerCase()}</small>}</div>
              </div>
              {teacher.bio && <p className="lct-text">{teacher.bio}</p>}
            </Card>
          )}
        </aside>
      </div>

      {form && base && (
        <ContractForm token={token} path={path} base={base} accompanied={path.accompanied} onClose={() => setForm(null)} onSent={sent}
          title={form === 'counter' ? 'Contre-proposer' : mine ? 'Modifier ma proposition' : 'Proposer un avenant'}
          description={form === 'counter'
            ? 'Indiquez les conditions qui vous conviennent : votre professeur recevra votre contre-proposition.'
            : path.accompanied ? 'Votre professeur validera ces nouvelles conditions.' : 'En autonomie, l’avenant s’applique immédiatement.'} />
      )}
      {rejecting && pending && (
        <Dialog title="Refuser cette proposition ?" onClose={() => setRejecting(false)}>
          <div className="lct-dialog">
            <p className="lct-text">Votre contrat actuel reste en vigueur. Vous pouvez expliquer votre choix à votre professeur.</p>
            <label>Votre message (facultatif)<textarea rows={3} maxLength={1000} value={rejectNote} onChange={(event) => setRejectNote(event.target.value)} /></label>
            <div className="lct-dialog-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setRejecting(false)}>Annuler</button>
              <button type="button" className="btn btn-danger" disabled={busy} onClick={() => void decide('reject')}><CircleX size={16} aria-hidden="true" /> Refuser la proposition</button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}
