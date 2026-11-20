import { Bell, BookOpen, ClipboardCheck, FolderOpen, LayoutGrid, Mail, TrendingUp, UserRoundCog, Users, type LucideIcon } from 'lucide-react';
import { canEditCatalogue, type Profile } from '../../integration/api';

interface StaffWorkspaceLink {
  path: string;
  label: string;
  icon: LucideIcon;
  /** Libellé court de la barre de navigation mobile. */
  short?: string;
}

export function staffWorkspaceLinks(profile: Profile): StaffWorkspaceLink[] {
  const admin = profile.role === 'admin';
  const educator = admin || profile.role === 'teacher';
  const items: StaffWorkspaceLink[] = [{ path: '/espace', label: 'Vue d’ensemble', short: 'Accueil', icon: LayoutGrid }];

  if (educator) {
    items.push(
      { path: '/espace/eleves', label: admin ? 'Élèves' : 'Mes élèves', icon: Users },
      { path: '/espace/alertes', label: 'Alertes', icon: Bell },
      { path: '/espace/invitations', label: 'Invitations', icon: Mail },
    );
  }
  if (educator || profile.permissions.includes('correction')) {
    items.push({ path: '/espace/corrections', label: 'Corrections', icon: ClipboardCheck });
  }
  if (canEditCatalogue(profile)) {
    items.push(
      { path: '/espace/catalogue', label: 'Catalogue', icon: BookOpen },
      { path: '/espace/mediatheque', label: 'Médiathèque', icon: FolderOpen },
    );
  }
  if (admin) {
    items.push(
      { path: '/espace/utilisateurs', label: 'Utilisateurs', icon: UserRoundCog },
      { path: '/espace/indicateurs', label: 'Indicateurs', icon: TrendingUp },
    );
  }
  return items;
}
