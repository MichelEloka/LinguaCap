/** Éléments communs aux écrans d'administration : formats de date, badges de rôle et d'état, interrupteur. */
import type { ChangeEvent, ReactNode } from 'react';
import { roleNames, type AccountRole } from '../../integration/api';

const dateFormat = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' });
const dateTimeFormat = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' });
const relativeFormat = new Intl.RelativeTimeFormat('fr-FR', { numeric: 'auto' });

export function formatDate(value: string | null, withTime = false) {
  return value ? (withTime ? dateTimeFormat : dateFormat).format(new Date(value)) : '—';
}

/** « il y a 2 heures », « hier », « il y a 5 jours » ; au-delà d'un mois, la date. */
export function formatRelative(value: string, now = Date.now()) {
  const seconds = Math.round((new Date(value).getTime() - now) / 1000);
  const abs = Math.abs(seconds);
  if (abs < 60) return 'à l’instant';
  if (abs < 3600) return relativeFormat.format(Math.round(seconds / 60), 'minute');
  if (abs < 86_400) return relativeFormat.format(Math.round(seconds / 3600), 'hour');
  if (abs < 30 * 86_400) return relativeFormat.format(Math.round(seconds / 86_400), 'day');
  return `le ${dateFormat.format(new Date(value))}`;
}

export function getError(error: unknown, fallback = 'Cette action est temporairement indisponible.') {
  return error instanceof Error ? error.message : fallback;
}

export function RoleBadge({ role }: { role: AccountRole }) {
  return <span className={`badge admin-role is-${role}`}>{roleNames[role]}</span>;
}

export function StateBadge({ active }: { active: boolean }) {
  return <span className={`badge admin-state${active ? ' is-active' : ''}`}><i aria-hidden="true" />{active ? 'Actif' : 'Désactivé'}</span>;
}

/** Ligne de réglage avec interrupteur (case à cocher au rôle « switch »). */
export function SwitchRow({ icon, title, description, checked, disabled, onChange }: {
  icon: ReactNode; title: string; description: string; checked: boolean; disabled?: boolean; onChange: (checked: boolean) => void;
}) {
  return (
    <label className={`admin-switch-row${checked ? ' is-on' : ''}`}>
      <span className="admin-switch-icon" aria-hidden="true">{icon}</span>
      <span className="admin-switch-text"><strong>{title}</strong><small>{description}</small></span>
      <input type="checkbox" role="switch" className="admin-switch" checked={checked} disabled={disabled}
        onChange={(event: ChangeEvent<HTMLInputElement>) => onChange(event.target.checked)} />
    </label>
  );
}

/** Titre de section dans un panneau latéral. */
export function SheetSection({ icon, title, description, children, tone }: {
  icon: ReactNode; title: string; description?: ReactNode; children: ReactNode; tone?: 'danger';
}) {
  return (
    <section className={`admin-sheet-section${tone ? ` is-${tone}` : ''}`}>
      <header>
        <span className="admin-sheet-icon" aria-hidden="true">{icon}</span>
        <div><h3>{title}</h3>{description && <p>{description}</p>}</div>
      </header>
      {children}
    </section>
  );
}
