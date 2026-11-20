/**
 * Calendrier par semaine de l'espace élève : frise des séances (accueil) et vue agenda d'une proposition de planning.
 * Sur un conteneur étroit, la frise devient une rangée de pastilles et l'agenda une liste de jours.
 */
import type { ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './learner-calendar.css';

export type EventTone = 'done' | 'current' | 'todo' | 'late' | 'plan';

export interface CalendarEvent {
  key: string;
  title: string;
  meta?: string;
  tone: EventTone;
  /** Texte lu par les lecteurs d'écran (statut, durée). */
  label?: string;
  onClick?: () => void;
}

export interface CalendarDay { date: Date; events: CalendarEvent[]; off?: boolean }

const pad = (value: number) => String(value).padStart(2, '0');
const weekdayShort = new Intl.DateTimeFormat('fr-FR', { weekday: 'short' });
const dayLong = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
const dayShort = new Intl.DateTimeFormat('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
const monthDay = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' });
const clock = new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' });

/** Date locale à partir d'un « AAAA-MM-JJ » (sans décalage de fuseau). */
export function localDate(value: string) {
  const [year, month, day] = value.slice(0, 10).split('-').map(Number);
  return new Date(year, month - 1, day);
}

export const dayKey = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
export const sameDay = (left: Date, right: Date) => dayKey(left) === dayKey(right);

export function addDays(date: Date, days: number) {
  const next = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  next.setDate(next.getDate() + days);
  return next;
}

export function startOfWeek(date: Date) {
  return addDays(date, -((date.getDay() + 6) % 7));
}

/** Écart en jours calendaires entre une date et aujourd'hui (négatif dans le passé). */
export function daysFromToday(date: Date) {
  const today = new Date();
  const from = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  const to = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.round((to - from) / 86_400_000);
}

export const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

/** « aujourd’hui », « demain », « hier » ou « lun. 23 nov. ». */
export function relativeDay(date: Date) {
  const gap = daysFromToday(date);
  if (gap === 0) return 'aujourd’hui';
  if (gap === 1) return 'demain';
  if (gap === -1) return 'hier';
  return dayShort.format(date);
}

/** « Aujourd’hui, 18:00 » pour une échéance ou un envoi. */
export function relativeMoment(value: string) {
  const date = new Date(value);
  return `${capitalize(relativeDay(date))}, ${clock.format(date)}`;
}

export const formatClock = (value: string) => clock.format(new Date(value));
export const formatDayLong = (date: Date) => capitalize(dayLong.format(date));
export const formatMonthDay = (date: Date) => monthDay.format(date);

/** Libellé d'un jour pour les séparateurs : « Aujourd’hui », « Hier » ou « Mardi 17 novembre ». */
export function dayHeading(date: Date) {
  const gap = daysFromToday(date);
  if (gap === 0) return 'Aujourd’hui';
  if (gap === -1) return 'Hier';
  if (gap === 1) return 'Demain';
  return formatDayLong(date);
}

export function WeekPager({ label, position, onPrevious, onNext, onToday, previousLabel = 'Semaine précédente', nextLabel = 'Semaine suivante' }: {
  label: ReactNode; position?: ReactNode; onPrevious?: () => void; onNext?: () => void; onToday?: () => void;
  previousLabel?: string; nextLabel?: string;
}) {
  return (
    <div className="lx-pager">
      <button type="button" className="icon-button lx-pager-button" onClick={onPrevious} disabled={!onPrevious} aria-label={previousLabel}>
        <ChevronLeft size={18} aria-hidden="true" />
      </button>
      <span className="lx-pager-label" aria-live="polite">{label}{position && <small>{position}</small>}</span>
      <button type="button" className="icon-button lx-pager-button" onClick={onNext} disabled={!onNext} aria-label={nextLabel}>
        <ChevronRight size={18} aria-hidden="true" />
      </button>
      {onToday && <button type="button" className="btn btn-ghost btn-sm lx-pager-today" onClick={onToday}>Aujourd’hui</button>}
    </div>
  );
}

/**
 * Sept jours côte à côte. `strip` : frise compacte (pastilles sur petit écran) ; `agenda` : jours en lignes sur petit écran.
 */
export function WeekGrid({ days, variant = 'strip', label }: { days: CalendarDay[]; variant?: 'strip' | 'agenda'; label: string }) {
  const today = new Date();
  return (
    <div className="lx-week-wrap">
      <ol className={`lx-week is-${variant}`} aria-label={label}>
        {days.map((day) => {
          const isToday = sameDay(day.date, today);
          return (
            <li key={dayKey(day.date)} className={`lx-day${isToday ? ' is-today' : ''}${day.off ? ' is-off' : ''}${day.events.length ? '' : ' is-empty'}`}
              aria-current={isToday ? 'date' : undefined}>
              <span className="lx-day-head">
                <span className="lx-day-name">{weekdayShort.format(day.date).replace('.', '')}</span>
                <span className="lx-day-num">{day.date.getDate()}</span>
                <span className="sr-only">{formatDayLong(day.date)}{isToday ? ', aujourd’hui' : ''}{day.events.length ? '' : ', aucune séance'}</span>
              </span>
              {day.events.length > 0 && (
                <ul className="lx-events">
                  {day.events.map((event) => {
                    const content = <>
                      <span className="lx-event-dot" aria-hidden="true" />
                      <span className="lx-event-text"><strong>{event.title}</strong>{event.meta && <small>{event.meta}</small>}
                        {event.label && <span className="sr-only">, {event.label}</span>}</span>
                    </>;
                    return (
                      <li key={event.key}>
                        {event.onClick
                          ? <button type="button" className={`lx-event is-${event.tone}`} onClick={event.onClick} title={event.title}>{content}</button>
                          : <span className={`lx-event is-${event.tone}`} title={event.title}>{content}</span>}
                      </li>
                    );
                  })}
                </ul>
              )}
              {day.off && !day.events.length && <span className="lx-day-off" aria-hidden="true">Repos</span>}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export function CalendarLegend({ items }: { items: { tone: EventTone; label: string }[] }) {
  return (
    <ul className="lx-legend" aria-label="Légende">
      {items.map((item) => <li key={item.tone}><span className={`lx-legend-dot is-${item.tone}`} aria-hidden="true" />{item.label}</li>)}
    </ul>
  );
}
