import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { BookOpen, ChevronRight, Ellipsis, GraduationCap, LogOut, Menu, X } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import './workspace.css';

export interface WorkspaceLink {
  path: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
}

export function WorkspaceFrame({ links, title, name, children, onSignOut, signingOut, demo }: {
  links: WorkspaceLink[];
  title: string;
  name?: string;
  children: ReactNode;
  onSignOut?: () => void;
  signingOut?: boolean;
  demo?: boolean;
}) {
  const { pathname } = useLocation();
  const [menuAt, setMenuAt] = useState<string | null>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const navigation = useRef<HTMLElement>(null);
  const expanded = menuAt === pathname;
  const active = links.find(({ path, end }) => pathname === path || (!end && pathname.startsWith(path + '/')));
  const initials = name?.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
  const overflow = links.length > 4;

  useEffect(() => {
    if (!expanded) return;
    const activeLink = navigation.current?.querySelector<HTMLAnchorElement>('[aria-current="page"]')
      ?? navigation.current?.querySelector<HTMLAnchorElement>('nav a');
    activeLink?.focus();
    const dismiss = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuAt(null);
        menuButton.current?.focus();
      }
    };
    window.addEventListener('keydown', dismiss);
    return () => window.removeEventListener('keydown', dismiss);
  }, [expanded]);

  return (
    <div className="lc-workspace">
      {expanded && <button className="lc-nav-scrim" type="button" onClick={() => { setMenuAt(null); menuButton.current?.focus(); }} aria-label="Fermer le panneau de navigation" />}
      <aside ref={navigation} className={`lc-sidebar${expanded ? ' is-open' : ''}`} id="workspace-navigation">
        <Link to="/" className="lc-app-brand" aria-label="LinguaCap, accueil" onClick={() => setMenuAt(null)}>
          <span className="lc-app-mark"><BookOpen size={21} aria-hidden="true" /></span>
          <span>Lingua<span>Cap</span></span>
        </Link>
        <div className="lc-sidebar-context"><GraduationCap size={16} aria-hidden="true" /> {title}</div>
        <nav className="lc-sidebar-nav" aria-label="Sections de l’application">
          {links.map(({ path, label, icon: Icon, end }) => (
            <NavLink to={path} end={end} key={path} onClick={() => setMenuAt(null)}>
              <Icon size={19} strokeWidth={1.75} aria-hidden="true" />
              <span>{label}</span>
              <ChevronRight className="lc-nav-arrow" size={14} aria-hidden="true" />
            </NavLink>
          ))}
        </nav>
        <div className="lc-sidebar-footer">
          {demo ? <>
            <span className="lc-sidebar-label">Changer d’espace</span>
            <div className="lc-role-switch" onClick={() => setMenuAt(null)}>
              <Link to="/eleve">Élève</Link><Link to="/professeur">Professeur</Link><Link to="/administration">Admin</Link>
            </div>
          </> : name && <div className="lc-account">
            <span className="lc-avatar" aria-hidden="true">{initials || 'LC'}</span>
            <div><strong>{name}</strong><small>{title}</small></div>
            {onSignOut && <button className="lc-sign-out" type="button" onClick={onSignOut} disabled={signingOut} title="Se déconnecter" aria-label="Se déconnecter"><LogOut size={18} aria-hidden="true" /></button>}
          </div>}
        </div>
      </aside>
      <div className="lc-workspace-main">
        <header className="lc-workspace-top">
          <button ref={menuButton} className="lc-workspace-menu" type="button" aria-controls="workspace-navigation"
            aria-label={expanded ? 'Fermer le menu' : 'Ouvrir le menu'} aria-expanded={expanded}
            onClick={() => setMenuAt(expanded ? null : pathname)}>
            {expanded ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
          </button>
          <div className="lc-breadcrumb"><span>{title}</span>{active && <><ChevronRight size={14} aria-hidden="true" /><strong>{active.label}</strong></>}</div>
          {demo ? <span className="lc-demo-chip"><i /> Démonstration</span> : name && <span className="lc-top-avatar" title={name} aria-hidden="true">{initials || 'LC'}</span>}
        </header>
        <div className="lc-workspace-content">{children}</div>
        <nav className="lc-mobile-nav" aria-label="Raccourcis mobiles">
          {links.slice(0, overflow ? 3 : 4).map(({ path, label, icon: Icon, end }) => (
            <NavLink to={path} end={end} key={path}><Icon size={19} strokeWidth={1.8} aria-hidden="true" /><span>{label}</span></NavLink>
          ))}
          {overflow && <button type="button" onClick={() => setMenuAt(expanded ? null : pathname)} aria-expanded={expanded} aria-controls="workspace-navigation">
            <Ellipsis size={21} aria-hidden="true" /><span>Plus</span>
          </button>}
        </nav>
      </div>
    </div>
  );
}
