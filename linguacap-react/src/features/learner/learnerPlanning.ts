import type { Goal, Session } from '../../domain/types';

export const weekdays = [
  { short: 'Lun', full: 'Lundi' },
  { short: 'Mar', full: 'Mardi' },
  { short: 'Mer', full: 'Mercredi' },
  { short: 'Jeu', full: 'Jeudi' },
  { short: 'Ven', full: 'Vendredi' },
  { short: 'Sam', full: 'Samedi' },
  { short: 'Dim', full: 'Dimanche' },
];

export function formatDate(value: string, options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long' }) {
  const date = new Date(value.length === 10 ? `${value}T12:00:00` : value);
  return Number.isNaN(date.getTime()) ? 'Date à définir' : new Intl.DateTimeFormat('fr-FR', options).format(date);
}

export function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  return hours ? `${hours} h${remaining ? ` ${String(remaining).padStart(2, '0')}` : ''}` : `${remaining} min`;
}

export function completionRate(sessions: Session[]) {
  return sessions.length ? Math.round(sessions.filter(session => session.completed).length / sessions.length * 100) : 0;
}

export function planWeek(sessions: Session[], goal: Goal, dates: string[], today: number) {
  const fixed = (session: Session) => session.completed || (session.day >= 0 && session.day < today);
  const remaining = sessions.filter(session => !fixed(session));
  const slots: number[] = [];
  for (const day of [...goal.days].sort((a, b) => a - b)) {
    if (day < today || !dates[day] || dates[day] > goal.targetDate) continue;
    const occupied = sessions.filter(session => session.day === day && fixed(session)).length;
    for (let index = occupied; index < goal.sessionsPerDay; index++) slots.push(day);
  }

  const revised = new Map(remaining.map((session, index) => [
    session.id,
    { ...session, day: slots[index] ?? -1, minutes: goal.minutesPerSession },
  ]));
  return {
    sessions: sessions.map(session => revised.get(session.id) ?? session),
    unplanned: Math.max(0, remaining.length - slots.length),
  };
}
