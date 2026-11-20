# Charte d’interface LinguaCap

LinguaCap est une **application** (pas un site) : écrans denses mais aérés, composants d’application, retours immédiats.
Tout écran doit sembler appartenir au même produit.

## Fondations (ne pas redéfinir)

- **Jetons** : [tokens.css](tokens.css). Couleurs de la marque (bleu nuit `--night`, bleu vif `--brand`), encre (`--ink`, `--muted`,
  `--subtle`), surfaces (`--surface`, `--surface-2`, `--canvas`), états (`--success`, `--warning`, `--danger`, `--accent`, `--violet`
  et leurs fonds `-50`), genres allemands (`--der`, `--die`, `--das`), rayons `--r-*`, ombres `--shadow-*`, mouvement `--ease`, `--t-*`.
  **Aucune couleur codée en dur** dans les feuilles des écrans : uniquement des jetons.
- **Classes de base** ([styles.css](../styles.css)) : `.btn` + `.btn-primary | .btn-secondary/.btn-outline | .btn-soft | .btn-ghost | .btn-danger`,
  tailles `.btn-sm`, `.btn-lg`, `.btn-block` ; `.icon-button` ; `.text-link` ; `.badge` + `.badge-blue|green|amber|violet|red|neutral` ;
  `.panel` ; champs natifs déjà stylés (input, select, textarea, label) ; `.inline-message(.warning|.success)` ; `.sr-only`.
- **Composants** :
  - [ui.tsx](../components/ui.tsx) : `PageHeading`, `StatCard`, `Badge`, `EmptyState` (avec icône), `ProgressBar`,
    `Dialog` (confirmations courtes uniquement), `Inspector` (= panneau latéral `Drawer`).
  - [kit.tsx](kit.tsx) : `Card`, `Tabs`/`TabPanel`, `Segmented`, `Drawer`, `useToast`, `Avatar`, `ProgressRing`, `Callout`,
    `Skeleton`/`SkeletonCard`, `Toolbar`, `SearchField`, `Chip`, `SplitView`, `ListItem`, `Steps`, `Timeline`, `Bars`, `Sparkline`,
    `Facts`, `AudioPlayer`.
  - [LessonContent](../features/pilot/LessonContent.tsx) : tout texte de leçon, consigne ou document pédagogique passe par
    `<LessonContent text=… />` (jamais de bloc de texte brut `white-space: pre-line`).

## Règles d’expérience

1. **Pas de texte brut en bloc**. Une liste devient des lignes `ListItem` (icône ou avatar, titre, sous-titre, badge à droite) ;
   des chiffres deviennent `StatCard`, `ProgressRing`, `Bars` ou `Sparkline` ; des faits deviennent `Facts`.
2. **Moins de fenêtres surgissantes** : fiches, formulaires et aperçus dans un `Drawer` (panneau latéral, feuille en bas sur mobile) ;
   navigation dans une même page par `Tabs` ou `Segmented` ; liste + détail côte à côte par `SplitView` ; `Dialog` seulement pour
   confirmer une action.
3. **Retours** : confirmations par `useToast()` (pas de paragraphe « … envoyé » qui reste affiché) ; chargement par `SkeletonCard`
   (pas de « Chargement… » seul) ; listes vides par `EmptyState` avec icône et action.
4. **Occupation de l’espace** : grilles à 2 ou 3 colonnes sur bureau (`grid-template-columns` avec `minmax`), une colonne sur mobile ;
   largeur de contenu jusqu’à ~1240 px ; espacement 1 rem à 1,25 rem entre cartes ; pas de colonnes étroites perdues au milieu.
5. **Animations** : `.lc-enter` sur la racine d’un écran, `.lc-stagger` sur les grilles et listes, élévation au survol des éléments
   cliquables (`.kit-card.is-interactive`), transitions de 140 à 360 ms avec `--ease`. Le réglage « réduire les animations » est géré
   globalement.
6. **Mobile d’abord** : vérifier 390 px de large ; aucune barre de défilement horizontale de page ; zones tactiles ≥ 40 px ; la barre
   de navigation du bas couvre 64 px (prévoir un `padding-bottom`).
7. **Accessibilité** : un seul `h1` par écran (via `PageHeading` ou le titre principal) ; boutons d’icône avec `aria-label` ;
   formulaires avec `label` ; contrastes des jetons ; ne pas retirer les rôles, libellés et textes utilisés par les recettes.

## Vérifier visuellement

```bash
node scripts/ui-preview/index.mjs <écran…> --out <dossier>   # captures bureau et mobile, appels non simulés signalés
```

Les écrans et les réponses simulées viennent de `scripts/ui-preview/fixtures/*.mjs` : ajouter un module par domaine (écrans + routes).
