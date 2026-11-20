import { useEffect, useId, useRef } from 'react';
import type { ReactNode } from 'react';
import { X } from 'lucide-react';

export function PageHeading({ title, description, eyebrow, action }: {
  title: ReactNode;
  description?: ReactNode;
  eyebrow?: string;
  action?: ReactNode;
}) {
  return (
    <div className="page-heading">
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
      {icon && <span className="icon-tile" aria-hidden="true">{icon}</span>}
      <div><span className="stat-label">{label}</span><strong>{value}</strong>{note && <small>{note}</small>}</div>
    </article>
  );
}

export function Badge({ tone = 'neutral', children }: { tone?: 'blue' | 'green' | 'amber' | 'neutral' | 'violet'; children: ReactNode }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

export function EmptyState({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return <div className="empty-state"><strong>{title}</strong>{description && <p>{description}</p>}{action}</div>;
}

export function ProgressBar({ value, label = 'Progression' }: { value: number; label?: string }) {
  const progress = Math.min(100, Math.max(0, Number.isFinite(value) ? value : 0));
  return <div className="progress-track" role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}><span style={{ width: `${progress}%` }} /></div>;
}

interface OverlayProps { title: string; children: ReactNode; onClose: () => void }

function Overlay({ title, children, onClose, inspector = false }: OverlayProps & { inspector?: boolean }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || dialog.open) return;
    dialog.showModal();
    return () => { if (dialog.open) dialog.close(); };
  }, []);

  return (
    <dialog
      className={inspector ? 'lc-dialog lc-inspector' : 'lc-dialog'}
      aria-labelledby={titleId}
      ref={dialogRef}
      onCancel={(event) => { event.preventDefault(); onClose(); }}
      onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}
    >
      <div className="dialog-body">
        <div className="panel-heading"><h2 id={titleId}>{title}</h2><button className="icon-button" type="button" onClick={onClose} aria-label="Fermer"><X size={20} /></button></div>
        {children}
      </div>
    </dialog>
  );
}

export function Dialog(props: OverlayProps) {
  return <Overlay {...props} />;
}

export function Inspector(props: OverlayProps) {
  return <Overlay {...props} inspector />;
}
