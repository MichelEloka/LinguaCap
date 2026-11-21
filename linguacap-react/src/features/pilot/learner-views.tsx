/** Écrans « Mes résultats », « Mes messages » et liste des séances du planning de l'élève. */
import { useMemo, useState } from 'react';
import { ArrowRight, Award, CalendarCheck2, ChartNoAxesCombined, ChevronDown, ChevronUp, Gauge, ListChecks, Lock, MessageCircle, Sparkles, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge, EmptyState } from '../../components/ui';
import { Bars, Card, Facts, ProgressRing } from '../../design/kit';
import type { PathSession } from '../../integration/v2';
import type { Grade, SessionSummary } from './LearnerSession';
import { addDays, dayHeading, dayKey, formatClock, formatDayLong, formatMonthDay, relativeMoment, startOfWeek } from './learner-calendar';
import { byDate, gradeTitle, passed, plural, scoreColor, scoreOf, SessionRow, TeacherAvatar, type LearnerMessage } from './learner-common';

const shortDate = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' });

/** Séances du parcours regroupées par semaine (page « Mon planning »). */
export function SessionsByWeek({ sessions }: { sessions: SessionSummary[] }) {
  const weeks = new Map<string, { start: Date; items: SessionSummary[] }>();
  for (const session of byDate(sessions, (item) => item.dueAt)) {
    const start = startOfWeek(new Date(session.dueAt));
    const key = dayKey(start);
    if (!weeks.has(key)) weeks.set(key, { start, items: [] });
    weeks.get(key)?.items.push(session);
  }
  const done = sessions.filter((session) => session.status === 'completed').length;
  return (
    <Card flush className="ld-sessions" title="Mes séances" icon={<CalendarCheck2 size={19} />}
      description={sessions.length ? `${done} terminée${done > 1 ? 's' : ''} sur ${sessions.length}` : undefined}>
      {sessions.length === 0 ? (
        <EmptyState icon={<CalendarCheck2 size={26} />} title="Aucune séance planifiée" description="Vos séances seront publiées à la validation du planning." />
      ) : (
        <div className="ld-weeks">
          {[...weeks.values()].map((week) => {
            const finished = week.items.filter((session) => session.status === 'completed').length;
            return (
              <section key={dayKey(week.start)} className="ld-week-group" aria-label={`Semaine du ${formatDayLong(week.start)}`}>
                <header>
                  <strong>Semaine du {formatMonthDay(week.start)}</strong>
                  <span className="ld-week-count">{finished}/{week.items.length}</span>
                  <span className="ld-meter" aria-hidden="true"><span style={{ width: `${(finished / week.items.length) * 100}%` }} /></span>
                </header>
                <ul className="kit-list ld-list">{week.items.map((session) => <li key={session.id}><SessionRow session={session} /></li>)}</ul>
              </section>
            );
          })}
        </div>
      )}
    </Card>
  );
}

/** Séance d'un parcours sous la forme d'une ligne de séance ordinaire (séances ouvertes uniquement). */
export function pathSessionSummary(session: PathSession): SessionSummary | null {
  if (!session.id || session.locked || session.status === 'locked') return null;
  return {
    id: session.id, position: session.position, title: session.title, dueAt: session.dueAt, status: session.status,
    completedAt: session.completedAt, estimatedMinutes: session.estimatedMinutes,
    activities: session.activities.map(({ id, kind, title, estimatedMinutes, status }) => ({ id, kind, title, estimatedMinutes, status })),
  };
}

/** Séance d'un niveau futur : grisée, sans lien, elle s'ouvrira avec son niveau. */
export function LockedSessionRow({ session }: { session: PathSession }) {
  return (
    <div className="kit-list-item ld-session-row is-locked" aria-label={`${session.title}, niveau ${session.levelCode}, verrouillée jusqu’à l’ouverture du niveau`}>
      <span className="ld-status-icon is-locked" aria-hidden="true"><Lock size={16} /></span>
      <span className="kit-list-main" aria-hidden="true">
        <strong>{session.title}</strong>
        <small>{relativeMoment(session.dueAt)} · {session.estimatedMinutes} min · {plural(session.activities.length, 'activité')}</small>
      </span>
      <span className="kit-list-end" aria-hidden="true"><Badge tone="neutral">{session.levelCode}</Badge></span>
    </div>
  );
}

/**
 * Séances d'un parcours multi-niveaux par semaine : les séances ouvertes mènent à la séance, celles des niveaux futurs
 * sont grisées et verrouillées.
 */
export function PathSessionsByWeek({ sessions, emptyText = 'Vos séances seront publiées à la validation du planning.', pageSize = 4 }: {
  sessions: PathSession[]; emptyText?: string; pageSize?: number;
}) {
  const weeks = useMemo(() => {
    const map = new Map<string, { start: Date; items: PathSession[] }>();
    for (const session of byDate(sessions, (item) => item.dueAt)) {
      const start = startOfWeek(new Date(session.dueAt));
      const key = dayKey(start);
      if (!map.has(key)) map.set(key, { start, items: [] });
      map.get(key)?.items.push(session);
    }
    return [...map.values()];
  }, [sessions]);
  // La liste s'ouvre sur la semaine en cours ; les semaines passées et suivantes s'affichent à la demande.
  const current = Math.max(0, weeks.findIndex((week) => addDays(week.start, 7) > new Date()));
  const [from, setFrom] = useState<number | null>(null);
  const [count, setCount] = useState(pageSize);
  const start = from ?? current;
  const visible = weeks.slice(start, start + count);
  const after = weeks.length - start - visible.length;
  if (!sessions.length) {
    return <EmptyState icon={<CalendarCheck2 size={26} />} title="Aucune séance à afficher" description={emptyText} />;
  }
  return (
    <div className="ld-path-weeks">
      {start > 0 && (
        <button type="button" className="btn btn-ghost btn-sm ld-more" onClick={() => { setCount(count + start); setFrom(0); }}>
          <ChevronUp size={16} aria-hidden="true" /> Voir les semaines précédentes ({start})
        </button>
      )}
      <div className="ld-weeks">
        {visible.map((week) => {
          const open = week.items.filter((session) => !session.locked);
          const finished = open.filter((session) => session.status === 'completed').length;
          const locked = open.length === 0;
          return (
            <section key={dayKey(week.start)} className={`ld-week-group${locked ? ' is-locked' : ''}`} aria-label={`Semaine du ${formatDayLong(week.start)}`}>
              <header>
                <strong>Semaine du {formatMonthDay(week.start)}</strong>
                <span className="ld-week-count">{locked ? <><Lock size={13} aria-hidden="true" /> {week.items[0].levelCode}</> : `${finished}/${open.length}`}</span>
                <span className="ld-meter" aria-hidden="true"><span style={{ width: `${open.length ? (finished / open.length) * 100 : 0}%` }} /></span>
              </header>
              <ul className="kit-list ld-list">
                {week.items.map((session, index) => {
                  const summary = pathSessionSummary(session);
                  return <li key={session.id ?? `${session.date}-${session.slot}-${index}`}>{summary ? <SessionRow session={summary} /> : <LockedSessionRow session={session} />}</li>;
                })}
              </ul>
            </section>
          );
        })}
      </div>
      {after > 0 && (
        <button type="button" className="btn btn-soft ld-more" onClick={() => setCount(count + pageSize)}>
          <ChevronDown size={16} aria-hidden="true" /> Afficher {Math.min(pageSize, after)} semaine{Math.min(pageSize, after) > 1 ? 's' : ''} de plus
          <span className="ld-more-count">{plural(after, 'semaine restante', 'semaines restantes')}</span>
        </button>
      )}
    </div>
  );
}

export function ResultsView({ results, sessions }: { results: Grade[]; sessions: SessionSummary[] }) {
  if (results.length === 0) {
    return (
      <Card className="ld-empty-card">
        <EmptyState icon={<ChartNoAxesCombined size={26} />} title="Aucun résultat enregistré" description="Terminez un exercice pour retrouver votre score ici."
          action={<Link className="btn btn-primary" to="/espace">Aller à mes séances</Link>} />
      </Card>
    );
  }
  const ordered = byDate(results, (grade) => grade.submittedAt);
  const scores = ordered.map(scoreOf);
  const average = Math.round(scores.reduce((sum, value) => sum + value, 0) / scores.length);
  const success = scores.filter(passed).length;
  const recent = ordered.slice(-12);
  const seen = new Map<string, number>();
  const bars = recent.map((grade) => {
    const base = shortDate.format(new Date(grade.submittedAt));
    const count = (seen.get(base) ?? 0) + 1;
    seen.set(base, count);
    const score = scoreOf(grade);
    return { label: count > 1 ? `${base} (${count})` : base, value: score, display: `${score} %`, muted: !passed(score) };
  });
  const last = scores.at(-1) ?? 0;
  const previous = scores.at(-2);
  return (
    <div className="ld-results lc-stagger">
      <Card className="ld-results-summary" title="Synthèse" icon={<Gauge size={19} />}>
        <div className="ld-summary-body">
          <ProgressRing value={average} size={132} stroke={12} color={scoreColor(average)} label={`Score moyen : ${average} %`}>
            <span className="ld-ring-text"><strong>{average} %</strong><small>moyenne</small></span>
          </ProgressRing>
          <p className="ld-summary-note">
            {passed(average) ? <><Sparkles size={16} aria-hidden="true" /> Très bon niveau : continuez sur cette lancée.</>
              : <><TrendingUp size={16} aria-hidden="true" /> Revoyez les leçons des exercices à reprendre pour progresser.</>}
          </p>
        </div>
        <Facts items={[
          { label: 'Exercices', value: results.length },
          { label: 'Réussis (70 % et plus)', value: `${success} / ${results.length}` },
          { label: 'Meilleur score', value: `${Math.max(...scores)} %` },
          { label: 'Dernier score', value: <>{last} %{previous !== undefined && last !== previous && <small className={last > previous ? 'ld-up' : 'ld-down'}> {last > previous ? '+' : '−'}{Math.abs(last - previous)}</small>}</> },
        ]} />
      </Card>
      <Card className="ld-results-trend" title="Évolution" description="Score de chaque exercice, du plus ancien au plus récent" icon={<TrendingUp size={19} />}>
        <Bars data={bars} height={200} max={100} label="Scores des derniers exercices" />
        <p className="ld-chart-note"><span className="ld-swatch is-pass" aria-hidden="true" /> Réussi <span className="ld-swatch is-retry" aria-hidden="true" /> À reprendre (moins de 70 %)</p>
      </Card>
      <Card flush className="ld-results-list" title="Tous mes résultats" description={plural(results.length, 'exercice corrigé', 'exercices corrigés')} icon={<ListChecks size={19} />}>
        <ul className="kit-list ld-list">
          {[...ordered].reverse().map((grade) => {
            const score = scoreOf(grade);
            const name = gradeTitle(grade, sessions);
            return (
              <li key={grade.id}>
                <div className="kit-list-item ld-result-row">
                  <ProgressRing value={score} size={46} stroke={5} color={scoreColor(score)} label={`Score : ${score} %`}>
                    <span className="ld-ring-mini">{score}</span>
                  </ProgressRing>
                  <span className="kit-list-main">
                    <strong>{name.title}</strong>
                    <small>{name.context ? `${name.context} · ` : ''}<time dateTime={grade.submittedAt}>{formatDayLong(new Date(grade.submittedAt))} à {formatClock(grade.submittedAt)}</time></small>
                  </span>
                  <span className="kit-list-end">
                    <span className="ld-meter ld-result-meter" aria-hidden="true"><span style={{ width: `${score}%`, background: scoreColor(score) }} /></span>
                    <Badge tone={passed(score) ? 'green' : 'amber'}>{grade.correct} / {grade.total}</Badge>
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      </Card>
    </div>
  );
}

function EmptyThread() {
  return (
    <div className="ld-empty-thread">
      <div className="ld-empty-art" aria-hidden="true">
        <span className="ld-art-bubble is-a"><i /><i /></span>
        <span className="ld-art-bubble is-b"><i /></span>
        <span className="ld-art-avatar"><TeacherAvatar size={44} /></span>
      </div>
      <EmptyState icon={<MessageCircle size={26} />} title="Aucun message pour le moment"
        description="Votre professeur vous écrira ici pour vous encourager et vous conseiller." />
    </div>
  );
}

export function MessagesView({ messages, next }: { messages: LearnerMessage[]; next?: SessionSummary }) {
  const ordered = byDate(messages, (message) => message.sentAt);
  const days = new Map<string, { date: Date; items: LearnerMessage[] }>();
  for (const message of ordered) {
    const date = new Date(message.sentAt);
    const key = dayKey(date);
    if (!days.has(key)) days.set(key, { date, items: [] });
    days.get(key)?.items.push(message);
  }
  const last = ordered.at(-1);
  return (
    <div className="ld-messages lc-stagger">
      <section className="kit-card is-flush ld-thread" aria-labelledby="ld-thread-title">
        <header className="kit-card-head ld-thread-head">
          <TeacherAvatar size={44} />
          <div><h2 id="ld-thread-title">Votre professeur</h2><p>Encouragements et conseils pour votre parcours</p></div>
          {messages.length > 0 && <div className="kit-card-action"><Badge tone="blue">{plural(messages.length, 'message')}</Badge></div>}
        </header>
        {messages.length === 0 ? <EmptyThread /> : (
          <div className="ld-thread-body">
            {[...days.values()].map((day) => (
              <section key={dayKey(day.date)} className="ld-thread-day" aria-label={dayHeading(day.date)}>
                <p className="ld-day-separator"><span>{dayHeading(day.date)}</span></p>
                {day.items.map((message, index) => (
                  <article key={message.id} className={`ld-msg${index === 0 ? ' is-first' : ''}`}>
                    {index === 0 ? <TeacherAvatar size={32} /> : <span className="ld-msg-gap" aria-hidden="true" />}
                    <div className="ld-msg-bubble">
                      <p>{message.text}</p>
                      <time dateTime={message.sentAt}>{formatClock(message.sentAt)}</time>
                    </div>
                  </article>
                ))}
              </section>
            ))}
          </div>
        )}
        <footer className="ld-thread-foot"><MessageCircle size={15} aria-hidden="true" /> Les nouveaux messages de votre professeur s’affichent ici.</footer>
      </section>
      <aside className="ld-messages-side" aria-label="En bref">
        <Card title="En bref" icon={<Award size={19} />}>
          <Facts items={[
            { label: 'Messages reçus', value: messages.length },
            { label: 'Dernier message', value: last ? relativeMoment(last.sentAt) : 'Aucun' },
          ]} />
        </Card>
        {next && (
          <Card interactive className="ld-continue" title="Continuer mon parcours" icon={<CalendarCheck2 size={19} />}>
            <p className="ld-continue-title">{next.title}</p>
            <p className="muted">{relativeMoment(next.dueAt)} · {next.estimatedMinutes} min</p>
            <Link className="btn btn-soft btn-block" to={`/espace/seance/${next.id}`}>Ouvrir la séance <ArrowRight size={16} aria-hidden="true" /></Link>
          </Card>
        )}
      </aside>
    </div>
  );
}
