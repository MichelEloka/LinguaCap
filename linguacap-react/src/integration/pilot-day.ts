/**
 * Jour du pilote. Le serveur date les séances et contrôle les débuts de parcours dans le fuseau de Paris
 * (`CourseRules.PILOT_ZONE`) : le « jour courant » de l'interface doit être le même, quel que soit le fuseau du navigateur
 * (un élève à Montréal à 20 h est déjà le lendemain pour le serveur).
 */
export const PILOT_ZONE = 'Europe/Paris';

const pilotFormat = new Intl.DateTimeFormat('sv-SE', { timeZone: PILOT_ZONE, year: 'numeric', month: '2-digit', day: '2-digit' });

/** Jour du pilote au format « AAAA-MM-JJ », décalé de `offsetDays` jours. */
export function pilotToday(offsetDays = 0, now = new Date()): string {
  const [year, month, day] = pilotFormat.format(now).split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day + offsetDays)).toISOString().slice(0, 10);
}

/** Le plus tardif de deux jours « AAAA-MM-JJ » (un début déjà passé est ramené à aujourd'hui). */
export function notBefore(day: string, floor: string): string {
  return day < floor ? floor : day;
}
