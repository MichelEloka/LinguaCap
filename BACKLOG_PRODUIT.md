# LinguaCap — Backlog produit (après le MVP)

Ce backlog prolonge le [backlog du MVP](PLAN_FONCTIONNALITES.md). Il rassemble les idées notées les 20 et 21 novembre 2026, précisées avec le responsable produit, et les classe **par priorité** (au regard de l’incrément en cours) et **par complexité**.

## Légende

**Priorité**

| Code | Sens |
|---|---|
| **P0** | En cours de développement (incrément « Parcours »). |
| **P1** | Prolonge directement l’incrément en cours ; à faire juste après. |
| **P2** | Nécessaire avant l’ouverture publique : monétisation, accompagnement, motivation. |
| **P3** | Croissance : écoles, compétitions, temps réel. |

**Complexité**

| Code | Périmètre type |
|---|---|
| **S** | Un écran ou une règle, sans nouvelle table. |
| **M** | Un service et ses écrans, une ou deux tables. |
| **L** | Plusieurs services, ou production de contenus importante. |
| **XL** | Nouveau domaine (paiement, écoles, temps réel) ou très gros volume de contenus. |

## Vue d’ensemble

| ID | Fonctionnalité | Priorité | Complexité | Dépend de |
|---|---|---|---|---|
| EVO-001 | Langues : choix par le professeur et l’élève autonome, allemand seul ouvert | P0 | M | — |
| EVO-002 | Test de niveau à l’ouverture du compte, niveau annoncé | P0 | L | EVO-001 |
| EVO-003 | Objectif, durée et difficulté choisis par l’élève | P0 | M | EVO-002 |
| EVO-004 | Parcours multi-niveaux construit et réparti sur les jours | P0 | L | EVO-003 |
| EVO-005 | Contrat d’engagement élève–professeur négocié | P0 | L | EVO-004 |
| EVO-006 | Ajout de cours et adaptation du planning par le professeur | P0 | M | EVO-004 |
| EVO-007 | Bibliothèque libre : tous les cours et exercices à tout moment | P0 | M | EVO-001 |
| EVO-008 | Accueil en étapes (élève) et en questions (professeur) | P0 | M | EVO-001 à EVO-004 |
| EVO-009 | Barre latérale pliable à volonté, contenu sur toute la largeur | P0 | S | — (livré) |
| EVO-010 | En-tête revu | P0 | S | — (livré avec la refonte) |
| EVO-011 | Centre de notifications (contrats, questions, messages) | P1 | M | EVO-005 |
| EVO-012 | Messagerie dans les deux sens (l’élève répond au professeur) | P1 | M | — |
| EVO-013 | Questions sur un élément du cours, réponses du professeur | P1 | M | EVO-011, EVO-012 |
| EVO-014 | Le professeur modifie et complète une séance à venir avec ses ressources | P1 | L | EVO-006 |
| EVO-015 | Profil modifiable par chaque utilisateur | P1 | S | EVO-001 |
| EVO-016 | Inscription publique (élève autonome, professeur) revue | P1 | M | EVO-001, EVO-008 |
| EVO-017 | Examens de passage de niveau longs, exigeants, en plusieurs variantes | P1 | XL | — |
| EVO-018 | Séries d’examens blancs d’entraînement en libre accès | P2 | L | EVO-007, EVO-017 |
| EVO-019 | Équivalences avec les certificats connus | P2 | S | EVO-001 |
| EVO-020 | Préparation aux certificats (épreuves au format réel) | P2 | XL | EVO-017, EVO-018 |
| EVO-021 | Objectif « obtenir un certificat » | P2 | M | EVO-003, EVO-020 |
| EVO-022 | Suiveur d’un élève (parent, tuteur) | P2 | M | EVO-015 |
| EVO-023 | Annuaire des professeurs et demande de suivi | P2 | L | EVO-005, EVO-015 |
| EVO-024 | Abonnements et paiement | P2 | XL | EVO-016, EVO-023 |
| EVO-025 | Classes d’un professeur | P2 | M | — |
| EVO-026 | Mini-jeux d’apprentissage | P2 | L | EVO-007 |
| EVO-027 | Classement périodique entre classes | P3 | M | EVO-025, EVO-026 |
| EVO-028 | Défis entre élèves (différés et en direct) | P3 | XL | EVO-026 |
| EVO-029 | Écoles : directeur, professeurs, marque de l’école | P3 | XL | EVO-024, EVO-025 |
| EVO-030 | Compétitions entre élèves d’une école | P3 | M | EVO-027, EVO-029 |
| EVO-031 | Ouvrir une deuxième langue (catalogue multi-langues complet) | P2 | M | EVO-001 |
| EVO-032 | Calibrer le test de niveau et les seuils de difficulté | P2 | S | EVO-002, EVO-003 |

## P0 · En cours : incrément « Parcours »

- **EVO-001 Langues.** Liste des langues courantes (allemand, anglais, espagnol, italien, portugais, néerlandais, français langue étrangère, arabe, chinois, japonais, russe, coréen, turc, polonais). Toutes sont affichées, seul l’allemand est ouvert, les autres sont grisées « Bientôt ».
  - Le professeur choisit les langues qu’il enseigne.
  - L’élève autonome choisit sa langue.
  - L’élève invité reçoit la langue de l’invitation.
- **EVO-002 Test de niveau.** Passé à l’ouverture du compte de tout élève. Test progressif par paliers A1, A2, B1 : 12 questions tirées par palier dans une banque de 18 (lecture et écoute), et arrêt au premier palier échoué.
  - Le niveau est annoncé dès la fin.
  - Possibilité de se déclarer débutant.
  - Nouvel essai après 24 h.
- **EVO-003 Objectif.** L’élève choisit le niveau à atteindre et la durée. La difficulté est calculée d’après la charge par semaine : léger, modéré, soutenu, intensif, très intensif, ou irréaliste (refusé).
- **EVO-004 Parcours multi-niveaux.** Tous les cours du niveau initial au niveau visé, répartis sur les jours choisis, avec ou sans jours de repos. L’élève valide ou modifie ses jours avant de valider son planning.
  - Le niveau suivant s’ouvre à la remise de l’examen du niveau en cours.
- **EVO-005 Contrat.** L’élève suivi démarre tout de suite, mais son contrat reste « en attente » jusqu’à la décision du professeur. S’il le refuse, le professeur propose un autre contrat, que l’élève accepte ou refuse.
  - Une fois accepté par les deux, le contrat engage : niveau visé, date et engagement par semaine sont verrouillés, et toute modification passe par un avenant.
  - Pour l’élève autonome, le contrat est accepté d’office.
- **EVO-006 Ajout de cours.** Le professeur ajoute un module ou une activité du catalogue au parcours, puis adapte les jours.
- **EVO-007 Bibliothèque libre.** Tous les cours et exercices de la langue, à tout moment, avec exercices corrigés et entraînement au bilan intermédiaire. Les examens de passage de niveau restent réservés au parcours.
- **EVO-008 Accueil.** Pour l’élève, des étapes : langue, test, niveau, objectif, jours, planning, départ. Pour le professeur, des questions : langues, niveaux, nombre d’élèves, délai de correction, présentation.
- **EVO-009 et EVO-010** : livrés.

## P1 · Juste après l’incrément en cours

- **EVO-011 Centre de notifications.** Une cloche dans la barre du haut avec un compteur. Elle signale :
  - les contrats à décider ;
  - les questions d’élèves ;
  - les messages ;
  - les copies à corriger ;
  - les changements de planning faits par le professeur.

  On peut marquer une notification comme lue. Courriel facultatif plus tard.
- **EVO-012 Messagerie dans les deux sens.** L’élève peut répondre aux messages de son professeur. Fil par élève, accusé de lecture, notification. Aujourd’hui, seul le professeur écrit.
- **EVO-013 Questions sur le cours.** Depuis une activité (leçon, exercice, partie de document), l’élève pose une question rattachée à l’élément précis.
  - Le professeur est notifié dans son tableau de bord, répond, et la réponse s’affiche sous l’élément.
  - Pour l’élève autonome : question à son correcteur désigné, ou à l’équipe pédagogique.
- **EVO-014 Séance enrichie par le professeur.** En cliquant sur une séance à venir d’un élève, le professeur peut réordonner, retirer ou ajouter des activités. Il peut aussi y joindre ses propres ressources : document, image, son, lien, consigne écrite.
  - Les ressources du professeur passent par la médiathèque, avec des droits limités à ses élèves.
- **EVO-015 Profil modifiable.** Nom affiché, photo, présentation, langues enseignées (professeur), adresse e-mail et mot de passe (via Supabase), préférences de notification.
- **EVO-016 Inscription revue.** Inscription publique de l’élève autonome et du professeur, sans invitation : choix du rôle, de la langue, conditions d’utilisation, vérification de l’e-mail, puis accueil en étapes. L’invitation par un professeur reste possible.
- **EVO-017 Examens de passage de niveau.** Au moins 3 variantes par niveau.
  - En cas d’échec, l’élève repasse une variante qu’il n’a pas encore eue.
  - Épreuves longues et exigeantes, au format des certificats (lecture, écoute, écrit, oral), avec durée réelle, barème et seuil par épreuve, pour s’assurer que l’élève a vraiment le niveau.
  - Gros travail de rédaction et d’enregistrement des contenus.

## P2 · Avant l’ouverture publique

- **EVO-018 Examens blancs d’entraînement.** Séries dédiées, distinctes des examens de passage, en libre accès dans la bibliothèque, avec corrigé détaillé.
- **EVO-019 Équivalences avec les certificats.** À chaque niveau, afficher l’équivalence CECRL et les certificats correspondants : Goethe-Zertifikat, telc, TestDaF et ÖSD pour l’allemand, puis DELF/DALF, DELE, CILS, TOEFL, IELTS et Cambridge selon la langue.
- **EVO-020 Préparation aux certificats.** Examens blancs au format exact de chaque certificat : épreuves, durées, barèmes, consignes.
- **EVO-021 Objectif « certificat ».** À l’inscription, l’élève peut viser par exemple « Goethe-Zertifikat B1 » plutôt qu’un niveau. Le parcours ajoute alors la préparation spécifique.
- **EVO-022 Suiveur d’un élève.** Une personne (parent, tuteur, manager) rattachée à un élève, qui voit seulement sa progression, ses statistiques et ses encouragements. Elle n’enseigne pas et ne modifie rien.
  - Elle est invitée par l’élève, ou par le professeur ou l’école avec l’accord de l’élève.
  - Un élève d’école peut aussi avoir des suiveurs.
  - Nom à choisir : « Proche », « Supporter », « Parrain ou marraine »…
- **EVO-023 Annuaire des professeurs.** L’élève consulte les professeurs disponibles : langues, niveaux, présentation, délai de correction, éventuellement avis.
  - Il demande un suivi ; le professeur accepte ou refuse, et l’acceptation ouvre le contrat.
  - Le professeur n’apparaît que s’il se déclare **disponible pour de nouveaux élèves**, avec un nombre maximal d’élèves.
- **EVO-024 Abonnements et paiement.** Les tarifs restent à définir.
  - L’élève autonome paie le plein tarif.
  - L’élève invité par un professeur paie un abonnement réduit.
  - Le professeur paie un abonnement.
  - Le professeur ou l’école choisit si ses élèves paient par la plateforme (abonnement réduit pour eux) ou non (son propre abonnement est alors plus élevé et couvre ses élèves).
  - L’école a une licence : gratuit pour ses professeurs et ses élèves.
  - Prestataire à choisir (Stripe Billing, par exemple) : période d’essai, factures, TVA, portail de gestion, et accès suspendu en cas d’impayé.
- **EVO-025 Classes d’un professeur.** Le professeur crée ses classes (par exemple « A1 du soir ») et y range ses élèves. Vue de classe : progression, alertes, messages groupés.
- **EVO-026 Mini-jeux.** Jeux courts sur le contenu des cours : genre des noms (der, die, das), associer mot et image, écoute rapide, conjugaison, phrase à remettre en ordre. Points de motivation et série de jours.
- **EVO-031 Deuxième langue.** Rendre le catalogue pleinement multi-langues : codes de niveau uniques par langue, et ouverture d’une langue en un seul réglage. Prérequis technique pour sortir une langue de l’état « Bientôt ».
- **EVO-032 Calibrage.** Ajuster le seuil de réussite des paliers et le barème de difficulté à partir des données du pilote.

## P3 · Croissance

- **EVO-027 Classement périodique entre classes.** Classement chaque semaine ou chaque mois, à partir des points gagnés (séances, exercices, jeux), pour motiver les classes à progresser.
- **EVO-028 Défis entre élèves.** Un élève défie un autre élève sur un jeu, à tout moment :
  - en direct si l’autre est en ligne, avec des questions synchronisées en temps réel ;
  - sinon en différé, avec les mêmes questions à jouer sous 24 h et la comparaison des scores.
- **EVO-029 Écoles.** Nouveau type de compte. L’école a un directeur et des professeurs. Elle ajoute son nom et son logo, visibles par ses élèves.
  - Le directeur gère les professeurs, les classes, les élèves et les statistiques.
  - Il a une licence (EVO-024).
- **EVO-030 Compétitions dans une école.** Compétitions entre élèves et entre classes d’une même école.

## Ordre proposé

1. **Incrément « Parcours »** (P0, en cours) : EVO-001 à EVO-010.
2. **Incrément « Échanges »** : EVO-011, 012, 013, 015, puis 014.
3. **Incrément « Examens »** : EVO-017, 019, puis 018.
4. **Incrément « Ouverture »** : EVO-016, 031, 024, 023, 022.
5. **Incrément « Motivation »** : EVO-025, 026, 027.
6. **Incrément « Écoles et défis »** : EVO-029, 030, 028, puis 020 et 021.

## Questions encore ouvertes

- Les tarifs de chaque abonnement, et si les élèves d’un professeur abonné sont gratuits.
- Le nom du « suiveur ». Peut-il lui-même envoyer des encouragements ?
- L’annuaire des professeurs affiche-t-il des avis d’élèves et un tarif propre au professeur ?
- La liste des mini-jeux à faire en premier, et la période du classement (semaine ou mois).
- Le directeur d’école est-il aussi administrateur de son école seulement, distinct de l’administration LinguaCap ?
