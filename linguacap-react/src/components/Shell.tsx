import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Activity, BookOpen, CalendarDays, ChartNoAxesCombined, ClipboardList, Files, LayoutDashboard, Menu, MessageSquare, Users, X } from 'lucide-react';
import { isApiMode } from '../app/config';
import type { Role } from '../domain/types';
import { levelSeries, usePublicOffer } from '../integration/languages';

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
  // En mode réel, la vitrine ne s'adresse qu'aux visiteurs : liens vers ses sections, puis connexion.
  const sections = [{ href: '/#parcours', title: 'Le parcours' }, { href: '/#methode', title: 'La méthode' }, { href: '/#espaces', title: 'Pour qui' }];

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Logo />
        <nav className={`primary-nav${expanded ? ' is-open' : ''}`} id="main-navigation" aria-label="Navigation principale">
          {isApiMode
            ? sections.map((link) => <a key={link.href} href={link.href} onClick={() => setExpanded(false)}>{link.title}</a>)
            : primaryLinks.map((link) => <NavLink key={link.path} to={link.path} end={'end' in link && link.end} onClick={() => setExpanded(false)}>{link.title}</NavLink>)}
          {expanded && <Link className="mobile-access" to="/connexion" onClick={() => setExpanded(false)}>{isApiMode ? 'Se connecter' : 'Accès à la démo'}</Link>}
        </nav>
        <Link className="btn btn-primary header-cta" to="/connexion">{isApiMode ? 'Se connecter' : 'Mon espace'}</Link>
        <button className="icon-button menu-toggle" type="button" aria-label={expanded ? 'Fermer le menu' : 'Ouvrir le menu'} aria-controls="main-navigation" aria-expanded={expanded} onClick={() => setExpanded(!expanded)}>
          {expanded ? <X size={23} /> : <Menu size={23} />}
        </button>
      </div>
    </header>
  );
}

export function Footer() {
  // Niveaux publiés lus dans le catalogue (« Allemand · A1, A2 et B1 ») ; sans la liste, la langue seule.
  const offer = usePublicOffer();
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <Logo footer />
        <span>{offer.languages}{offer.codes.length ? ` · ${levelSeries(offer.codes)}` : ''} · Apprendre à son rythme</span>
        <Link to="/integration"><Activity size={15} /> État du service</Link>
        {!isApiMode && <span className="footer-mode">Données de démonstration</span>}
      </div>
    </footer>
  );
}
