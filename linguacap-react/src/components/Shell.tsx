import { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Activity, BookOpen, CalendarDays, ChartNoAxesCombined, ClipboardList, Files, LayoutDashboard, Menu, MessageSquare, Users, X } from 'lucide-react';
import { isApiMode } from '../app/config';
import type { Role } from '../domain/types';

const primaryLinks = [
  { path: '/', title: 'Accueil', end: true },
  { path: '/eleve', title: 'Élève' },
  { path: '/professeur', title: 'Professeur' },
  { path: '/administration', title: 'Administration' },
];

export const workspaceLinks = {
  learner: [
    { path: '/eleve', title: 'Tableau de bord', icon: LayoutDashboard, end: true },
    { path: '/eleve/planning', title: 'Planning', icon: CalendarDays },
    { path: '/eleve/evaluations', title: 'Évaluations', icon: ClipboardList },
    { path: '/eleve/resultats', title: 'Résultats', icon: ChartNoAxesCombined },
    { path: '/eleve/messages', title: 'Messages', icon: MessageSquare },
  ],
  teacher: [
    { path: '/professeur', title: 'Tableau de bord', icon: LayoutDashboard, end: true },
    { path: '/professeur/eleves', title: 'Mes élèves', icon: Users },
    { path: '/professeur/alertes', title: 'Alertes', icon: Activity },
    { path: '/professeur/corrections', title: 'Corrections', icon: ClipboardList },
  ],
  admin: [
    { path: '/administration', title: 'Tableau de bord', icon: LayoutDashboard, end: true },
    { path: '/administration/utilisateurs', title: 'Utilisateurs', icon: Users },
    { path: '/administration/catalogue', title: 'Catalogue', icon: BookOpen },
    { path: '/administration/mediatheque', title: 'Médiathèque', icon: Files },
  ],
} satisfies Record<Role, { path: string; title: string; icon: typeof Users; end?: boolean }[]>;

export const workspaceNames = { learner: 'Espace élève', teacher: 'Espace professeur', admin: 'Administration' };

export function Logo({ footer = false }: { footer?: boolean }) {
  return <Link className={`brand${footer ? ' brand-footer' : ''}`} to="/" aria-label="LinguaCap, accueil"><img src="/linguacap-logo.png" alt="LinguaCap" /></Link>;
}

export function Header() {
  const [expanded, setExpanded] = useState(false);
  const pathname = useLocation().pathname;
  const links = isApiMode
    ? [primaryLinks[0], { path: '/espace', title: 'Mon espace' }, { path: '/integration', title: 'Intégration' }]
    : primaryLinks;

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Logo />
        <nav className={`primary-nav${expanded ? ' is-open' : ''}`} id="main-navigation" aria-label="Navigation principale">
          {links.map((link) => <NavLink key={link.path} to={link.path} end={'end' in link && link.end} onClick={() => setExpanded(false)}>{link.title}</NavLink>)}
          {expanded && <Link className="mobile-access" to="/connexion" onClick={() => setExpanded(false)}>{isApiMode ? 'Connexion' : 'Accès à la démo'}</Link>}
        </nav>
        <Link className="btn btn-primary header-cta" to={isApiMode && pathname === '/connexion' ? '/espace' : '/connexion'}>{isApiMode ? 'Connexion' : 'Mon espace'}</Link>
        <button className="icon-button menu-toggle" type="button" aria-label={expanded ? 'Fermer le menu' : 'Ouvrir le menu'} aria-controls="main-navigation" aria-expanded={expanded} onClick={() => setExpanded(!expanded)}>
          {expanded ? <X size={23} /> : <Menu size={23} />}
        </button>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <Logo footer />
        <span>Allemand · A1 et A2</span>
        <Link to="/integration"><Activity size={16} /> État de l’intégration</Link>
        {!isApiMode && <span className="footer-mode">Données de démonstration</span>}
      </div>
    </footer>
  );
}
