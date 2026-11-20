import { useEffect, useId, useRef } from 'react';
import type { ReactNode } from 'react';
import { Inbox, X } from 'lucide-react';
import { Drawer } from '../design/kit';

export function PageHeading({ title, description, eyebrow, action }: {
  title: ReactNode;
  description?: ReactNode;
  eyebrow?: string;
  action?: ReactNode;
}) {
  return (
    <div className="page-heading lc-enter">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        {description && <p className="page-description">{description}</p>}
      </div>
      {action && <div className="page-action">{action}</div>}
    </div>
  );
}

export function StatCard({ label, value, note, icon }: {
  label: string;
  value: ReactNode;
  note?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <article className="stat-card">
      {icon && <span className="stat-icon" aria-hidden="true">{icon}</span>}
      <div><span className="stat-label">{label}</span><strong>{value}</strong>{note && <small>{note}</small>}</div>
    </article>
  );
}

export type BadgeTone = 'blue' | 'green' | 'amber' | 'neutral' | 'violet' | 'red';

export function Badge({ tone = 'neutral', children }: { tone?: BadgeTone; children: ReactNode }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

export function EmptyState({ title, description, action, icon }: { title: string; description?: string; action?: ReactNode; icon?: ReactNode }) {
  return (
    <div className="empty-state">
      <span className="empty-icon" aria-hidden="true">{icon ?? <Inbox size={26} />}</span>
      <strong>{title}</strong>{description && <p>{description}</p>}{action}
    </div>
  );
}

export function ProgressBar({ value, label = 'Progression' }: { value: number; label?: string }) {
  const progress = Math.min(100, Math.max(0, Number.isFinite(value) ? value : 0));
  return <div className="progress-track" role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}><span style={{ width: `${progress}%` }} /></div>;
}

interface OverlayProps { title: string; children: ReactNode; onClose: () => void }

/** Fenêtre centrée, réservée aux confirmations et choix courts. Les fiches et formulaires utilisent Inspector. */
export function Dialog({ title, children, onClose }: OverlayProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || dialog.open) return;
    dialog.showModal();
    return () => { if (dialog.open) dialog.close(); };
  }, []);

  return (
    <dialog className="lc-dialog" aria-labelledby={titleId} ref={dialogRef}
      onCancel={(event) => { event.preventDefault(); onClose(); }}
      onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div className="dialog-body">
        <div className="panel-heading"><h2 id={titleId}>{title}</h2><button className="icon-button" type="button" onClick={onClose} aria-label="Fermer"><X size={20} /></button></div>
        {children}
      </div>
    </dialog>
  );
}

/** Panneau latéral pour une fiche, un formulaire ou un aperçu (bas de l'écran sur mobile). */
export function Inspector({ title, children, onClose, wide }: OverlayProps & { wide?: boolean }) {
  return <Drawer title={title} onClose={onClose} wide={wide}>{children}</Drawer>;
}
