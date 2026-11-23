# Cadre animé des accueils « Le souffle »

Composants partagés des accueils professeur et élève : une expérience plein écran, sans la barre latérale de l’application.
Bureau : **toile du voyage** bleu nuit à gauche (≈ 42 %), **scène** claire des questions à droite. Mobile (≤ 860 px) : la toile
devient un bandeau d’environ 130 px en haut, la scène passe dessous et les actions se collent en bas de l’écran.

Tout s’importe depuis `features/journey` :

```tsx
import {
  JourneyShell, JourneyStage, JourneyQuestion, ChoiceGrid, JourneyActions, JourneyCelebration, type JourneyStep,
} from '../journey';
```

## Exemple

```tsx
const steps: JourneyStep[] = [
  { id: 'language', label: 'Langue', icon: <Languages size={16} /> },
  { id: 'level', label: 'Niveau', icon: <GraduationCap size={16} /> },
  { id: 'done', label: 'Départ', icon: <Flag size={16} /> },
];

<JourneyShell variant="learner" label="Accueil de l’élève" kicker="Votre accueil" steps={steps} current={step}
  celebrate={finished} navLabel="Étapes de l’accueil" onSelectStep={goTo}
  actions={<button type="button" className="btn btn-ghost btn-sm">Se déconnecter</button>}>
  {finished ? (
    <JourneyCelebration title="Bravo Camille, votre parcours est prêt" description="Votre contrat est en vigueur."
      items={[{ icon: <CalendarDays />, label: 'Rythme', value: '3 séances par semaine' }]}>
      <Link className="btn btn-primary btn-lg" to="/espace">Aller à mon accueil</Link>
    </JourneyCelebration>
  ) : (
    <JourneyStage onSubmit={next}>
      <JourneyQuestion stepKey={step} direction={direction} eyebrow="Question 1 sur 2" title="Quel est votre niveau ?"
        description="Une estimation suffit.">
        <ChoiceGrid legend="Niveau" hideLegend value={level} onChange={setLevel} columns={2}
          options={[{ value: 'a1', title: 'Je débute', description: 'Aucune base', icon: <Sprout /> }, …]} />
      </JourneyQuestion>
      <JourneyActions onBack={step === 'language' ? undefined : back} disabled={!level}>
        Continuer <ArrowRight size={18} aria-hidden="true" />
      </JourneyActions>
    </JourneyStage>
  )}
</JourneyShell>
```

## API

| Composant | Rôle | Props principales |
| --- | --- | --- |
| `JourneyShell` | Cadre plein écran (`<dialog>` modal par défaut) : toile (aurore, grille de points, mots allemands en parallaxe, chemin) + scène. | `variant` (`teacher`/`learner`), `label` (nom accessible), `kicker`, `steps`, `current` (id), `completed?`, `celebrate?`, `navLabel?` (défaut « Étapes de l’accueil »), `onSelectStep?`, `actions?` (en-tête), `canvas?` (contenu de la toile à côté du chemin, bureau seulement), `words?`, `modal?` (défaut `true` ; `false` = calque fixe), `leaving?` (fondu de sortie ~340 ms), `children` (scène). |
| `JourneyStage` | Colonne de la scène : question centrée puis actions collées en bas. Formulaire si `onSubmit`. | `onSubmit?`, `className?`, `children`. |
| `JourneyPath` | Chemin seul (déjà inclus dans le cadre) : tracé SVG, stations, L voyageur. Vertical si la boîte est plus haute que large. | `steps`, `current`, `completed?`, `celebrate?`, `label?`, `onSelect?`, `orientation?` (`auto`/`vertical`/`horizontal`), `intro?`. |
| `JourneyQuestion` | Surtitre, `h1` focalisé à l’arrivée, description, contenu ; transition entre questions (la sortante, clonée et inerte, monte et s’efface ; l’entrante arrive du bas). **Le garder monté et changer `stepKey`** : remonté à chaque étape, il garde l’entrée animée mais pas le fondu croisé. | `stepKey`, `direction?` (`forward`/`back`), `eyebrow?`, `icon?`, `title`, `description?`, `titleId?`, `autoFocus?`, `children`. |
| `ChoiceGrid` | Groupe de grandes cartes (radios ou cases natives), cascade, raccourcis 1-9. | `legend`, `hideLegend?`, `options` (`{ value, title, description?, icon?, tag?, tagTone?, disabled? }`), `value`, `onChange`, `multiple?`, `columns?` (1-4), `layout?` (`row`/`tile`), `shortcuts?`. |
| `ChoiceCard` | Une carte seule, pour composer à la main. | `type`, `name?`, `value?`, `checked`, `onChange(checked)`, `title`, `description?`, `icon?`, `tag?`, `tagTone?`, `disabled?`, `shortcut?`, `layout?`. |
| `JourneyActions` | « Retour » + bouton principal magnétique ; Entrée déclenche le bouton principal. | `onBack?`, `backLabel?`, `backDisabled?`, `primaryType?` (`submit`/`button`), `onPrimary?`, `disabled?`, `busy?`, `enterKey?`, `hint?`, `children` (texte du bouton = nom accessible). |
| `JourneyCelebration` | Fin : emblème du L, rayons, `h1` focalisé, récapitulatif, actions, suite automatique facultative. | `eyebrow?`, `title`, `description?`, `items?` (`{ icon?, label, value }`), `autoContinue?` (`{ after, label, onContinue }`), `titleId?`, `children`. |
| `JourneyMark` | Le « L » du logo dans sa tuile de verre (décor). | `size?`, `glow?`. |

`JourneyStep` : `{ id, label, icon?, status?, reachable? }` ; `status` ∈ `done | current | todo | blocked | skipped` (sinon déduit
de `current` et `completed`). Avec `onSelectStep`, une station `reachable` (hors étape en cours) devient un bouton nommé
« Revenir à l’étape {label}, terminée ».

## Comportements à connaître

- **Voyageur** : quand `current` change, le L glisse le long du tracé (`getPointAtLength`, `requestAnimationFrame`, 820 à
  1 500 ms selon la distance, aller ou retour), son pied s’étire (`--s` de 0 à 1 puis 0), traînées et particules, puis rebond
  et éclat de la station. Si l'on avance pendant un trajet, le L repart de là où il est.
- **Ouverture** (une fois par montage du cadre) : sur bureau, le L apparaît en grand au centre de la toile avec deux anneaux,
  rétrécit et file vers le départ du chemin pendant que le tracé se dessine et que les stations apparaissent, puis descend sur
  la première station (≈ 3 s au total ; l'aperçu de la toile `canvas` entre à 1,5 s). Sur mobile, le tracé se dessine et le L
  arrive par la gauche. Avancer pendant l'ouverture l'interrompt proprement. Le centre de la toile est repéré par l'attribut
  `data-journey-canvas` que pose `JourneyShell` (sans lui, `JourneyPath` seul fait l'ouverture simple).
- **Typographie** : dans les titres (`JourneyQuestion`, `JourneyCelebration`), un mot composé (« enseignez-vous ») ou suivi de
  « ? ! : ; » ne se coupe pas en fin de ligne ; le texte et le nom accessible sont inchangés.
- **Accessibilité** : la navigation des étapes est une vraie liste (`aria-current="step"`), l’étape est annoncée par une région
  `aria-live` polie, le décor est `aria-hidden`, un seul `h1` (celui de la question ou de la fin). Le cadre s’ouvre en modale dans
  un effet de mise en page pour que le titre reçoive bien le focus.
- **Clavier** : chiffres 1-9 pour choisir (codes `Digit`/`Numpad`, donc aussi en AZERTY), Entrée pour continuer (sauf dans un
  champ de saisie, sur un bouton ou un lien).
- **Réduire les animations** : pas de trajet ni de traînées, états finaux immédiats ; `JourneyCelebration` raccourcit de moitié
  sa suite automatique.
- **Raccourcis de recette** : le tracé parcouru porte aussi `welcome-journey-trail is-drawn` et le départ `welcome-journey-origin`
  (sans animation quand elles sont réduites), pour les tests e2e écrits avec l’ancien bandeau `WelcomeJourney`.
- Feuilles : `journey-shell.css`, `journey-path.css`, `journey-scene.css` ; uniquement des jetons de `design/tokens.css`.
