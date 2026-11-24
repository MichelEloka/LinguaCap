import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Ellipsis, LogOut, PanelLeftClose, PanelLeftOpen, X } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Avatar } from '../../design/kit';
import { useWorkspaceBadges } from './badges';
import './workspace.css';

export interface WorkspaceLink {
  path: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
  /** Libellé court pour la barre de navigation mobile. */
  short?: string;
}

const COLLAPSED_KEY = 'linguacap.sidebar.collapsed';

/**
 * Cadre de l'application connectée : barre latérale repliable (bureau), barre supérieure avec le menu du compte,
 * barre de navigation en bas de l'écran (mobile) et panneau « Plus » pour les sections suivantes.
 * Le logo ramène à la page principale de l'espace ; la page vitrine n'est accessible qu'après déconnexion.
 */
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
  const badges = useWorkspaceBadges();
  const badge = (path: string) => {
    const count = badges.get(path);
    return count ? <b className="ws-badge">{count}<span className="sr-only"> en attente</span></b> : null;
  };
  const [moreAt, setMoreAt] = useState<string | null>(null);
  // Barre latérale pliable à volonté ; sans choix enregistré, elle démarre repliée sur tablette.
  const [collapsed, setCollapsed] = useState(() => {
    const stored = localStorage.getItem(COLLAPSED_KEY);
    return stored === null ? window.matchMedia('(max-width: 1100px)').matches : stored === '1';
  });
  const [menuOpen, setMenuOpen] = useState(false);
  const moreButton = useRef<HTMLButtonElement>(null);
  const navigation = useRef<HTMLElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const moreOpen = moreAt === pathname;
  const home = links[0]?.path ?? '/espace';
  const active = links.find(({ path, end }) => pathname === path || (!end && pathname.startsWith(path + '/')));
  const mobileCount = links.length > 5 ? 4 : links.length;
  // Écrans hors de la navigation (séance, évaluation, diagnostic) : le fil d'Ariane les nomme quand même.
  const screen = active?.label ?? (/\/seance\//.test(pathname) ? 'Séance' : /\/evaluation\//.test(pathname) ? 'Évaluation'
    : /\/diagnostic/.test(pathname) ? 'Diagnostic' : /\/cine\//.test(pathname) ? 'Ciné-club' : undefined);

  useEffect(() => { localStorage.setItem(COLLAPSED_KEY, collapsed ? '1' : '0'); }, [collapsed]);
  useEffect(() => { setMenuOpen(false); }, [pathname]);

  // Ctrl + B (ou Cmd + B) plie ou déplie la barre, sauf pendant une saisie.
  useEffect(() => {
    const toggle = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== 'b' || event.altKey || event.shiftKey) return;
      const target = event.target as HTMLElement | null;
      if (target?.closest('input, textarea, select, [contenteditable="true"]')) return;
      event.preventDefault();
      setCollapsed((value) => !value);
    };
    window.addEventListener('keydown', toggle);
    return () => window.removeEventListener('keydown', toggle);
  }, []);

  useEffect(() => {
    if (!moreOpen) return;
    navigation.current?.querySelector<HTMLAnchorElement>('[aria-current="page"], nav a')?.focus();
    const dismiss = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setMoreAt(null); moreButton.current?.focus(); }
    };
    window.addEventListener('keydown', dismiss);
    return () => window.removeEventListener('keydown', dismiss);
  }, [moreOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const close = (event: MouseEvent | KeyboardEvent) => {
      if (event instanceof KeyboardEvent ? event.key === 'Escape' : !menu.current?.contains(event.target as Node)) setMenuOpen(false);
    };
    window.addEventListener('mousedown', close);
    window.addEventListener('keydown', close);
    return () => { window.removeEventListener('mousedown', close); window.removeEventListener('keydown', close); };
  }, [menuOpen]);

  const account = demo ? (
    <div className="ws-role-switch" aria-label="Changer d’espace de démonstration">
      <Link to="/eleve">Élève</Link><Link to="/professeur">Professeur</Link><Link to="/administration">Admin</Link>
    </div>
  ) : name && (
    <div className="ws-account">
      <Avatar name={name} size={36} />
      <div className="ws-account-text"><strong>{name}</strong><small>{title}</small></div>
      {onSignOut && <button className="ws-icon-button" type="button" onClick={onSignOut} disabled={signingOut} title="Se déconnecter" aria-label="Se déconnecter">
        <LogOut size={18} aria-hidden="true" /></button>}
    </div>
  );

  return (
    <div className={`ws${collapsed ? ' is-collapsed' : ''}`}>
      {moreOpen && <button className="ws-scrim" type="button" onClick={() => { setMoreAt(null); moreButton.current?.focus(); }} aria-label="Fermer le panneau de navigation" />}
      <aside ref={navigation} className={`ws-sidebar${moreOpen ? ' is-open' : ''}`} id="workspace-navigation">
        <div className="ws-brand-row">
          <Link to={home} className="ws-brand" aria-label="LinguaCap, page principale" onClick={() => setMoreAt(null)}>
            <img src="/linguacap-logo.png" alt="" className="ws-logo" />
            <img src="/favicon.svg" alt="" className="ws-logo-mark" />
          </Link>
          <button className="ws-icon-button ws-close" type="button" onClick={() => setMoreAt(null)} aria-label="Fermer le menu"><X size={20} aria-hidden="true" /></button>
        </div>
        <p className="ws-context">{title}</p>
        <nav className="ws-nav" aria-label="Sections de l’application">
          {links.map(({ path, label, icon: Icon, end }) => (
            <NavLink to={path} end={end} key={path} onClick={() => setMoreAt(null)} title={collapsed ? label : undefined}>
              <Icon size={20} strokeWidth={1.8} aria-hidden="true" />
              <span>{label}</span>
              {badge(path)}
            </NavLink>
          ))}
        </nav>
        <div className="ws-sidebar-foot">
          {account}
        </div>
      </aside>

      <div className="ws-main">
        <header className="ws-top">
          <button className="ws-icon-button ws-toggle" type="button" onClick={() => setCollapsed(!collapsed)} aria-pressed={!collapsed}
            aria-controls="workspace-navigation" aria-keyshortcuts="Control+B"
            aria-label={collapsed ? 'Déplier la barre latérale' : 'Replier la barre latérale'}>
            {collapsed ? <PanelLeftOpen size={20} aria-hidden="true" /> : <PanelLeftClose size={20} aria-hidden="true" />}
            <span className="ws-tip" aria-hidden="true">{collapsed ? 'Déplier' : 'Replier'} la barre latérale<kbd>Ctrl</kbd><kbd>B</kbd></span>
          </button>
          <Link to={home} className="ws-top-brand" aria-label="LinguaCap, page principale"><img src="/favicon.svg" alt="" /></Link>
          <div className="ws-crumb"><span>{title}</span>{screen && <strong>{screen}</strong>}</div>
          {demo ? <span className="ws-demo-chip"><i /> Démonstration</span> : name && (
            <div className="ws-menu" ref={menu}>
              <button type="button" className="ws-menu-button" aria-haspopup="menu" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}
                aria-label={`Compte de ${name}`}>
                <Avatar name={name} size={34} />
              </button>
              {menuOpen && (
                <div className="ws-menu-panel" role="menu">
                  <div className="ws-menu-head"><Avatar name={name} size={40} /><div><strong>{name}</strong><small>{title}</small></div></div>
                  {onSignOut && <button type="button" role="menuitem" onClick={onSignOut} disabled={signingOut}><LogOut size={17} aria-hidden="true" /> Se déconnecter</button>}
                </div>
              )}
            </div>
          )}
        </header>
        <div className="ws-content" key={active?.path ?? pathname.split('/').slice(0, 3).join('/')}>{children}</div>
        <nav className="ws-tabbar" aria-label="Raccourcis mobiles">
          {links.slice(0, mobileCount).map(({ path, label, short, icon: Icon, end }) => (
            <NavLink to={path} end={end} key={path}><Icon size={21} strokeWidth={1.8} aria-hidden="true" /><span>{short ?? label}</span>{badge(path)}</NavLink>
          ))}
          {links.length > mobileCount && (
            <button ref={moreButton} type="button" onClick={() => setMoreAt(moreOpen ? null : pathname)} aria-expanded={moreOpen} aria-controls="workspace-navigation">
              <Ellipsis size={22} aria-hidden="true" /><span>Plus</span>
            </button>
          )}
        </nav>
      </div>
    </div>
  );
}
