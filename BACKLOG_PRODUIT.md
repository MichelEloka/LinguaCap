# LinguaCap — Backlog produit (après le MVP)

Ce backlog prolonge le [backlog du MVP](PLAN_FONCTIONNALITES.md). Il rassemble les idées et observations notées depuis le 20 novembre 2026, précisées avec le responsable produit. Elles sont classées **par priorité** puis **par complexité**.

Règle de priorité fixée par le responsable produit : **l’interface passe avant tout, puis les correctifs, puis les fonctionnalités.**

## Légende

**Priorité**

| Code | Sens |
|---|---|
| **P0** | Interface : prioritaire sur tout le reste. |
| **P1** | Correctifs : défauts constatés sur l’application en ligne. |
| **P2** | Fonctionnalités prioritaires : pédagogie, échanges, administration. |
| **P3** | Avant l’ouverture publique : examens, monétisation, contenus, ouverture. |
| **P4** | Croissance : classements, écoles, défis. |

**Complexité**

| Code | Périmètre type |
|---|---|
| **S** | Un écran ou une règle, sans nouvelle table. |
| **M** | Un service et ses écrans, une ou deux tables. |
| **L** | Plusieurs services, ou production de contenus importante. |
| **XL** | Nouveau domaine (paiement, reconnaissance vocale, écoles, temps réel) ou très gros volume de contenus. |

## Vue d’ensemble (éléments à traiter)

| ID | Élément | Priorité | Complexité | Dépend de |
|---|---|---|---|---|
| EVO-033 | Accueil du professeur repensé : questions qui s’adaptent | P0 · livré | M | — |
| EVO-034 | Animation signature : le « L » du logo parcourt le chemin des questions | P0 · livré | M | EVO-033, EVO-035 |
| EVO-035 | Accueil et espace élève : interface du même niveau d’exigence | P0 · livré | M | — |
| EVO-036 | Drapeaux dans le choix des langues | P0 · livré | S | — |
| EVO-037 | Réponses d’accueil des professeurs visibles par l’administration et dans les statistiques | P0 · livré | S | EVO-033 |
| EVO-038 | Débutant déclaré : parcours adapté d’office, sans diagnostic | P1 · prêt, à déployer | S | — |
| EVO-039 | Parcours d’un élève invisible côté professeur | P1 · prêt, à déployer | M | — |
| EVO-040 | Voix de synthèse A1 ralenties | P1 · prêt, à déployer | M | — |
| EVO-041 | Organisation des cours rendue cohérente | P1 · prêt, à déployer | L | — |
| EVO-042 | Fiabiliser la mise en pause dans le suivi | P1 · prêt, à déployer | S | — |
| EVO-043 | Validation de la prononciation et de la répétition à voix haute | P2 · prêt, à déployer | XL | — |
| EVO-044 | Corrigé détaillé après un exercice (juste, faux, pourquoi) | P2 · prêt, à déployer | L | — |
| EVO-045 | Espace exercices par niveau et par type | P2 | M | — |
| EVO-046 | Alphabet et phonétique pour les débutants totaux | P2 | M | EVO-043 |
| EVO-047 | Cartes de révision des mots déjà appris | P2 | L | — |
| EVO-011 | Centre de notifications | P2 | M | — |
| EVO-012 | Messagerie dans les deux sens | P2 | M | — |
| EVO-013 | Questions sur un élément du cours | P2 | M | EVO-011, EVO-012 |
| EVO-014 | Le professeur modifie, complète ou propose une séance à tout moment | P2 | L | — |
| EVO-015 | Profil modifiable | P2 | S | — |
| EVO-048 | Signalement d’un contenu (bogue, erreur, contenu inapproprié) | P2 | M | — |
| EVO-049 | Suppression d’un compte | P2 | M | — |
| EVO-050 | Comptes gratuits avec avis obligatoire, avis facultatif pour les autres | P2 | M | — |
| EVO-016 | Inscription publique validée par l’administration | P2 | M | EVO-036, EVO-033 |
| EVO-017 | Examens de passage de niveau exigeants, en plusieurs variantes | P2 | XL | — |
| EVO-051 | Cours B1 et B2 complets, niveaux dynamiques | P3 · prêt, à déployer | XL | EVO-041 |
| EVO-052 | Le professeur construit ses cours | P3 | XL | EVO-033, EVO-014 |
| EVO-053 | Ressources classées par niveau | P3 | S | — |
| EVO-054 | Clés API : automatisation de l’administration et services tiers | P3 | L | — |
| EVO-018 | Séries d’examens blancs d’entraînement | P3 | L | EVO-017 |
| EVO-019 | Équivalences avec les certificats connus | P3 | S | — |
| EVO-020 | Préparation aux certificats au format réel | P3 | XL | EVO-017, EVO-018 |
| EVO-021 | Objectif « obtenir un certificat » | P3 | M | EVO-020 |
| EVO-022 | Suiveur d’un élève (parent, tuteur) | P3 | M | EVO-015 |
| EVO-023 | Annuaire des professeurs et demande de suivi | P3 | L | EVO-033, EVO-015 |
| EVO-024 | Abonnements et paiement | P3 | XL | EVO-016, EVO-023 |
| EVO-025 | Classes d’un professeur | P3 | M | — |
| EVO-026 | Mini-jeux d’apprentissage | P3 | L | EVO-047 |
| EVO-031 | Ouvrir une deuxième langue | P3 | M | — |
| EVO-032 | Calibrer le test de niveau et les seuils de difficulté | P3 | S | — |
| EVO-027 | Classement périodique entre classes | P4 | M | EVO-025, EVO-026 |
| EVO-028 | Défis entre élèves, en direct et en différé | P4 | XL | EVO-026 |
| EVO-029 | Écoles : directeur, professeurs, marque de l’école | P4 | XL | EVO-024, EVO-025 |
| EVO-030 | Compétitions entre élèves d’une école | P4 | M | EVO-027, EVO-029 |

## P0 · Interface (prioritaire sur tout) — livré le 23 novembre 2026

- **EVO-033 Accueil du professeur repensé.** Les questions suivantes dépendent des réponses précédentes. L’ordre :
  1. Langues enseignées.
  2. **« Êtes-vous à l’écoute de nouveaux élèves sur LinguaCap, ou avez-vous déjà les vôtres ? »** Cette question vient avant la carte de présentation et la demande de se présenter.
     - S’il a déjà ses élèves, on ne lui parle pas de l’annuaire et on va droit aux invitations.
     - S’il est disponible, on prépare sa fiche d’annuaire (EVO-023).
  3. **« Voulez-vous construire vos cours vous-même, ou laisser LinguaCap les construire ? »** Dans les deux cas, il pourra toujours les modifier (EVO-052).
  4. Niveaux, délai de correction, puis présentation et carte.

  Le style des questions est à rehausser : typographie, rythme, transitions, illustrations.
- **EVO-034 Animation signature.** Le « L » du logo parcourt le chemin des questions, pour le professeur comme pour l’élève.
  - Il s’étire comme un souffle de vent qui progresse à chaque réponse.
  - Le premier lancement doit éblouir l’utilisateur.
  - Le réglage « réduire les animations » est respecté.
- **EVO-035 Accueil et espace élève.** Même niveau d’exigence que l’accueil du professeur pour les étapes, le test de niveau, l’annonce du niveau, l’objectif, les jours, l’écran « Aujourd’hui » et la bibliothèque.
- **EVO-036 Drapeaux dans le choix des langues** à la place des lettres (DE, EN…). Choisir un drapeau représentatif pour les langues parlées dans plusieurs pays (arabe, chinois, portugais, espagnol), avec le nom de la langue toujours visible.
- **EVO-037 Réponses d’accueil des professeurs.** L’administration consulte les réponses de chaque professeur dans sa fiche : langues, niveaux, disponibilité pour de nouveaux élèves, choix de construction des cours, nombre d’élèves envisagé, délai de correction. Ces réponses alimentent les indicateurs (répartitions, tendances).

### État du P0 sur `develop`

| ID | Réalisation |
|---|---|
| EVO-033 | Le professeur choisit ses langues, sa disponibilité et son mode de construction des cours avant les niveaux, le nombre d’élèves envisagé et le délai de correction. La présentation et la carte concernent les professeurs disponibles. Les autres arrivent aux invitations. Les anciens profils complètent leurs réponses manquantes en conservant leurs réglages. |
| EVO-034 | Le « L » animé suit la progression des deux accueils. La progression reste lisible avec l’option de réduction des animations du système. |
| EVO-035 | L’accueil élève, le test, l’annonce du niveau, l’objectif, les jours d’étude, Aujourd’hui et la bibliothèque partagent la même hiérarchie visuelle et s’adaptent au mobile. |
| EVO-036 | Les noms restent visibles à côté de drapeaux graphiques intégrés à l’application. Les repères retenus sont l’Arabie saoudite pour l’arabe, la Chine pour le mandarin, le Portugal pour le portugais et l’Espagne pour l’espagnol. |
| EVO-037 | Les six familles de réponses sont visibles dans la fiche de chaque professeur. Les indicateurs présentent les répartitions actuelles et la tendance des réponses sur la période choisie. Une réponse manquante est comptée séparément. Plusieurs enregistrements du même professeur le même jour comptent pour une seule réponse. |

La création de la fiche prépare l’annuaire prévu en EVO-023. La construction et la modification des cours par le professeur restent dans le périmètre d’EVO-052.

## P1 · Correctifs

- **EVO-038 Débutant déclaré.** Un élève qui se déclare totalement débutant a un parcours déjà adapté : aucun diagnostic ni question supplémentaire. Le bandeau « Diagnostic initial à passer » ne doit plus apparaître pour lui.
- **EVO-039 Parcours invisible côté professeur.** Constat : une élève suivie s’est déclarée débutante sans passer le test. Son parcours a été généré, mais son professeur la voit « sans parcours ».
  - Le professeur doit voir l’avancement de l’accueil de l’élève (langue, test ou débutant déclaré, objectif, jours, planning).
  - Il doit aussi voir le parcours dès sa création, même en préparation.
  - La fiche doit se mettre à jour sans attendre la synchronisation périodique du suivi.
- **EVO-040 Voix A1 ralenties.** Régénérer les sons de synthèse A1 avec une lecture plus lente, puis les contrôler par transcription et les republier.
- **EVO-041 Organisation des cours.** Revoir l’enchaînement des modules et des activités A1 et A2 pour qu’il soit cohérent :
  - progression des notions ;
  - leçon, puis exercice, puis révision ;
  - titres et consignes homogènes ;
  - durées réalistes.
- **EVO-042 Mise en pause dans le suivi.** Lors d’une recette, un élève mis en pause est resté « actif » dans le suivi. L’aléa ne s’est pas reproduit au passage suivant. Trouver la cause (ordre des événements) et la corriger.

## P2 · Fonctionnalités prioritaires

**Pédagogie**

- **EVO-043 Validation de la prononciation.** Pendant les cours, l’élève doit répéter et prononcer à voix haute, et le système valide : on ne se contente plus de sa déclaration.
  - Micro, reconnaissance vocale et score de prononciation.
  - **Bloquant avec essais** : l’activité ne se valide qu’avec une répétition reconnue. Après 3 essais ratés, l’élève peut continuer, mais son professeur est prévenu et l’exercice revient plus tard.
- **EVO-044 Corrigé détaillé.** Après un exercice, l’application montre pour chaque question ce qui est juste et ce qui est faux, la bonne réponse et **pourquoi**.
  - Les explications des quelque 565 questions sont générées, relues par l’équipe avant publication, puis modifiables dans l’éditeur du catalogue.
  - Pour la bibliothèque, la règle « aucun corrigé révélé » de l’entraînement est revue.
- **EVO-045 Espace exercices.** Un espace dédié, indépendant des cours, organisé par niveau et par type : vocabulaire, grammaire, compréhension écrite, compréhension orale, prononciation. Il prolonge la bibliothèque.
- **EVO-046 Alphabet et phonétique.** Pour un débutant total, le parcours commence par l’alphabet, les sons propres à la langue et la lecture à voix haute, avec répétition validée (EVO-043).
- **EVO-047 Cartes de révision.** Jeux de cartes sur les mots déjà appris (genre, sens, prononciation), insérés au fil du parcours. La répétition espacée sert à faire retenir.

**Échanges**

- **EVO-011 Centre de notifications.** Une cloche dans la barre du haut avec un compteur. Elle signale les contrats à décider, les questions d’élèves, les messages, les copies à corriger, les changements de planning et les signalements.
- **EVO-012 Messagerie dans les deux sens.** L’élève répond aux messages de son professeur : fil par élève, accusé de lecture, notification.
- **EVO-013 Questions sur le cours.** L’élève pose une question rattachée à un élément précis d’une activité. Le professeur est notifié dans son tableau de bord et répond. La réponse s’affiche sous l’élément.
- **EVO-014 Séance enrichie, modifiée ou proposée par le professeur.** Le professeur clique sur une séance à venir d’un élève et peut :
  - **modifier son planning** : date, ordre, retrait ou ajout d’activités ;
  - la compléter avec ses propres ressources : document, image, son, lien, consigne.

  Il peut aussi **proposer un cours à son élève à tout moment**, en dehors du planning.

  *Déjà livré* : jours de l’élève modifiables par le professeur, ajout de modules ou d’activités au parcours.
- **EVO-015 Profil modifiable** par chaque utilisateur : nom, photo, présentation, langues enseignées, disponibilité pour de nouveaux élèves, adresse e-mail, mot de passe, notifications.

**Administration et confiance**

- **EVO-048 Signalement d’un contenu.** Depuis chaque activité ou écran, l’utilisateur signale un problème : bogue, erreur dans le contenu, son ou image défectueux, contenu inapproprié. Les signalements forment une file pour l’administration (état, réponse, élément concerné).
- **EVO-049 Suppression d’un compte.** Par l’administration, ou à la demande de l’utilisateur. Les données personnelles sont effacées et les statistiques anonymisées sont conservées.
- **EVO-050 Comptes gratuits et avis sur l’expérience.**
  - L’administration accorde des comptes gratuits. Le bénéficiaire est **prévenu dès l’ouverture** qu’un avis sur son expérience sera exigé.
  - Après la période d’essai (14 jours par exemple), l’avis est demandé, avec rappels.
  - Sans avis sous 7 jours, le compte est suspendu jusqu’à ce que l’avis soit donné.
  - Pour les autres utilisateurs, l’avis est facultatif.
  - L’administration dispose d’un tableau des avis.
- **EVO-016 Inscription publique.** L’élève autonome et le professeur s’inscrivent sans invitation : rôle, langue (avec drapeaux), conditions d’utilisation, vérification de l’e-mail. **L’administration valide les comptes** avant leur ouverture. L’invitation par un professeur reste possible.

**Examens**

- **EVO-017 Examens de passage de niveau.**
  - Au moins 3 variantes par niveau ; après un échec, l’élève passe une variante qu’il n’a pas encore eue.
  - Épreuves longues et exigeantes, au format des certificats (lecture, écoute, écrit, oral), avec durée réelle, barème et seuil par épreuve.
  - **À rassembler d’abord** : les fichiers sources (manuels, enregistrements, sujets) qui serviront aux exercices et aux examens.

## P3 · Avant l’ouverture publique

- **EVO-051 Cours B1 et B2.** Parcours B1 puis B2 complets, au même niveau de qualité que l’A1 et l’A2 : modules, activités,
  médias, diagnostic, bilan et examen. Demande du responsable produit : « les cours doivent être adaptés au niveau, même la
  manière de faire cours » ; « on n’est plus sur du A1 et A2 seulement ». **En cours : phase 1 (B1)**, phase 2 (B2) ensuite,
  sur le même socle ; aucun déploiement à ce stade. Choix retenus (24 novembre 2026) :
  - **Niveaux dynamiques partout** : l’échelle CECRL ne sert qu’à valider, classer et nommer un niveau ; ce qui est ouvert se lit
    dans le catalogue (`GET /languages`, nouvelle route publique `GET /public/languages` pour la vitrine, `GET /tracks`). Un
    niveau publié apparaît sans modifier le code ; un niveau non publié n’est jamais proposé (« Bientôt » là où il donne une
    perspective). Le niveau B2 est créé au catalogue en brouillon.
  - **Gabarit B** : 12 thèmes × 2 modules (thème, puis atelier), environ 24 modules et 50 h par niveau ; textes et écoutes
    plus longs avec stratégie, grammaire inductive, *Redemittel*, médiation et entraînement au format d’examen dans chaque
    atelier ; dictées et répétitions réduites.
  - **Consignes progressives** par balisage dans le texte : B1 en allemand simple avec la traduction française à côté (`[fr]`),
    B2 en allemand avec l’aide française repliée (`[fr?]`) ; aucune migration, contrôlé par le contrôle des contenus.
  - **Missions sur grille** : 4 critères à l’écrit, 5 à l’oral, 20 points ; la décision reste au professeur, préremplie à 60 %
    (12/20) ; l’élève voit la grille avant la remise, puis les points, le score et le commentaire. Élève autonome sans
    correcteur : grille en auto-évaluation non enregistrée et recommandation d’un correcteur. Bornes élargies : oral jusqu’à
    5 min, écrit jusqu’à 3 000 caractères.
  - **Médias** : voix libres (Piper, MLS après audition, 4 au plus) ; contenus téléchargés sous licence libre seulement,
    CC BY-SA acceptée pour les médias, chacun crédité dans un registre ; textes originaux ou Wikinews de préférence.
  - **Recette** : le niveau de démonstration passe en C1 ; contrôles des niveaux dynamiques, de l’import B1, des consignes
    bilingues, des missions sur grille, du parcours A2 → B1 et du test de niveau. Test de niveau : palier B2 en phase 2.
  - Le brouillon B1 de Codex (`content/b1-v1/`) sert de matière première, puis est supprimé en fin de phase 1.
- **EVO-052 Le professeur construit ses cours.** Choix proposé à l’accueil (EVO-033). Le professeur peut, au choix :
  - composer le parcours d’un élève à partir du catalogue : modules, activités, ordre, rythme ;
  - créer ses propres leçons et exercices (texte, images, sons) dans un éditeur, réservés à ses élèves.

  S’il laisse LinguaCap construire, il garde la main pour tout modifier.
- **EVO-053 Ressources classées par niveau** dans la médiathèque, la bibliothèque et les ressources du professeur, avec filtres.
- **EVO-054 Clés API.**
  - **Automatiser l’administration** : l’administration crée des clés pour piloter LinguaCap par scripts (import de contenus, comptes, invitations, exports) sans mot de passe. Clés à droits limités, révocables et journalisées.
  - **Services tiers** : les clés des services externes (synthèse vocale, IA, paiement, e-mails) sont saisies dans l’administration et stockées chiffrées, plutôt que dans l’infrastructure.
- **EVO-018 Examens blancs d’entraînement.** Séries dédiées, distinctes des examens de passage, en libre accès avec corrigé.
- **EVO-019 Équivalences avec les certificats.** Pour chaque niveau : Goethe-Zertifikat, telc, TestDaF et ÖSD pour l’allemand, puis DELF/DALF, DELE, CILS, TOEFL, IELTS et Cambridge selon la langue.
- **EVO-020 Préparation aux certificats.** Examens blancs au format exact de chaque certificat.
- **EVO-021 Objectif « certificat ».** L’élève peut viser par exemple « Goethe-Zertifikat B1 » plutôt qu’un niveau.
- **EVO-022 Suiveur d’un élève.** Un parent ou un tuteur voit la progression, les statistiques et les encouragements de l’élève, sans enseigner. Un élève d’école peut aussi en avoir.
- **EVO-023 Annuaire des professeurs.** Seuls les professeurs qui se déclarent disponibles pour de nouveaux élèves y apparaissent (EVO-033). L’élève demande un suivi ; le professeur l’accepte ou la refuse ; l’acceptation ouvre le contrat.
- **EVO-024 Abonnements et paiement.** Les tarifs restent à définir.
  - Élève autonome : plein tarif.
  - Élève invité par un professeur : tarif réduit.
  - Professeur : abonnement payant.
  - Le professeur ou l’école choisit si ses élèves paient par la plateforme, ou s’il paie lui-même un abonnement plus élevé.
  - École : licence, gratuite pour ses professeurs et ses élèves.
- **EVO-025 Classes d’un professeur** : groupes de ses élèves, vue de classe.
- **EVO-026 Mini-jeux d’apprentissage** sur le contenu des cours.
- **EVO-031 Deuxième langue** : catalogue pleinement multi-langues, ouverture d’une langue en un seul réglage.
- **EVO-032 Calibrage** du test de niveau et des seuils de difficulté avec les données du pilote.

## P4 · Croissance

- **EVO-027 Classement périodique entre classes**, à partir des points gagnés.
- **EVO-028 Défis entre élèves**, en direct si l’autre est en ligne, sinon en différé sous 24 h.
- **EVO-029 Écoles.** Un directeur et des professeurs. Le nom et le logo de l’école sont visibles par ses élèves. Licence.
- **EVO-030 Compétitions** entre élèves et classes d’une même école.

## Ordre proposé

1. **« Accueil sublimé »** (P0) : EVO-033, 034, 035, 036, 037.
2. **« Correctifs »** (P1) : EVO-038, 039, 040, 042, puis 041.
3. **« Pédagogie »** : EVO-044, 045, 046, 043, 047.
4. **« Échanges »** : EVO-011, 012, 013, 015, 014.
5. **« Administration et confiance »** : EVO-048, 049, 050, 016.
6. **« Examens »** : EVO-017, 019, 018.
7. **« Ouverture »** : EVO-031, 051, 052, 053, 054, 024, 023, 022.
8. **« Motivation »** : EVO-025, 026, 027.
9. **« Écoles et défis »** : EVO-029, 030, 028, 020, 021.

## Prêt, en attente de déploiement

**Contenus V4 et pédagogie** (EVO-040, 041, 043, 044), sur `develop` depuis le 23 novembre 2026 :
- V4 officielle A1 et A2 : 43 modules, 358 activités, 590 questions typées, 43 missions, 862 mots de lexique,
  134 illustrations, voix A1 ralenties, ordre des modules revu.
- Exercices variés (compléter, remettre en ordre, associer, dictée, répétition orale validée avec trois essais puis « à revoir »),
  corrigé par question après la remise (le modèle oral se réécoute dans le corrigé), missions remises dans l'application avec
  retour du professeur, lexique par module.

**Correctifs P1** (EVO-038, 039, 042), sur `develop` le 24 novembre 2026 :
- Débutant (départ A0, déclaré ou choisi par le professeur) : ni diagnostic ni bandeau ; les routes du diagnostic répondent 409.
  Un professeur qui veut faire passer le diagnostic à un faux débutant choisit le départ A1 ou déclare les modules acquis.
- Le professeur voit en direct l'accueil de l'élève (langue, test ou débutant déclaré, objectif, jours, planning) et son
  parcours dès le brouillon, sans attendre la synchronisation du Suivi ; la vue reste servie si Apprentissage est indisponible.
- Événements : lecture des tables de sortie sans perte (curseur par transaction), état de l'objectif porté par la validation
  du planning, reprise prévue annoncée et visible dans le Suivi, projections du Suivi indépendantes de l'ordre d'arrivée.

**Manquements similaires corrigés** (revue du 24 novembre 2026) :
- Transcriptions des exercices (réponses des dictées) servies à tout élève par la route publique des leçons ; corrigé détaillé du
  diagnostic obtenu en le remettant comme exercice ; corrigé des versions au brouillon.
- Remise d'évaluation perdue si Apprentissage était indisponible à cet instant : accusé de réception et renvoi automatique.
- Compteur « Copies à corriger » (missions et répétitions comprises, tous niveaux), élève en pause compté « à relancer »,
  fiche élève mêlant chiffres en direct et chiffres périodiques (fraîcheur désormais affichée).
- Fuseau horaire : un élève hors d'Europe ne pouvait pas valider son objectif le soir (jour de Paris côté serveur).
- Bibliothèque : état réel des missions ; « Débutant » au lieu de « A0 » dans les contrats.

**À surveiller au déploiement** : ordre migrations, services (Suivi juste après la migration du curseur), passerelle, front,
puis import de la V4 par l'administration ; mesurer la durée de l'import et de la publication d'une version V4 (délais de 7 s
entre services et de 10 s au Worker) et celle de la vue d'ensemble de l'administration avec une cinquantaine d'élèves.

**Cours B1 et B2 complets** (EVO-051), sur `develop` le 24 novembre 2026 (commits 9b5551c, 1d9d048, 81ba40e, fb0f20f) :
- **Niveaux dynamiques** : vitrine, accueil, test de niveau, objectif, bibliothèque, questionnaire du professeur, indicateurs
  et contrats lisent les niveaux publiés du catalogue ; un niveau publié apparaît partout sans modifier le code.
- **Manière de faire cours adaptée aux niveaux B** : 12 thèmes de deux modules (thème : textes et écoutes longs avec
  stratégie, grammaire découverte puis consolidée, collocations et formules d'usage ; atelier : médiation, entraînement au
  format d'examen, un écrit et un oral notés sur grille). Consignes en allemand simple avec la traduction française (B1),
  en allemand avec l'aide française repliée (B2).
- **Rôle du professeur** : missions notées critère par critère sur 20 points, décision préremplie à 60 % ; auto-évaluation
  pour l'élève autonome sans correcteur ; moyenne par critère dans la fiche élève.
- **B1** : 24 modules, 216 activités, 2 966 min, 940 questions, 24 missions, 494 mots, 283 sons, 52 images.
- **B2** : 24 modules, 204 activités, 3 050 min, 906 questions, 24 missions, 495 mots, 185 sons, 60 images ; palier B2 du
  test de niveau.
- Durées conseillées : 7 mois au rythme standard, 2 en intensif, pour chacun des deux niveaux.
- **À faire par le responsable produit** : relecture par un germanophone d'au moins 20 % des modules et de toutes les
  évaluations avant publication ; décision sur les six écoutes authentiques de la Wikipédia parlée (Commons refuse le
  téléchargement automatique : téléchargement manuel des six fichiers, ou identification conforme à la politique de
  Wikimedia), lues en synthèse en attendant.
- **Au déploiement** : catalogue et front avant l'import B1/B2 (critères de mission, balisage bilingue) ; import des
  niveaux B1 et B2 par l'administration (`publier-production.ps1`), palier B2 du test avec la publication du B2.

## Questions encore ouvertes

- Les tarifs de chaque abonnement, et si les élèves d’un professeur abonné sont gratuits.
- La durée exacte de la période d’essai des comptes gratuits (14 jours ?) et le contenu du questionnaire d’avis.
- Le nom du « suiveur », et s’il peut envoyer des encouragements.
- La suppression d’un compte à la demande de l’utilisateur : immédiate, ou après un délai de rétractation ?
- L’annuaire des professeurs : avis d’élèves et tarif propre au professeur ?
- Les premiers mini-jeux à faire, et la période du classement (semaine ou mois).
- Le rôle exact du directeur d’école.

## Livré

**Incrément « Parcours »**, en production le 21 novembre 2026 :

| ID | Élément | Complexité |
|---|---|---|
| EVO-001 | Langues : choix par le professeur et l’élève autonome, allemand seul ouvert | M |
| EVO-002 | Test de niveau à l’ouverture du compte, niveau annoncé | L |
| EVO-003 | Objectif, durée et difficulté choisis par l’élève | M |
| EVO-004 | Parcours multi-niveaux construit et réparti sur les jours | L |
| EVO-005 | Contrat d’engagement élève–professeur négocié | L |
| EVO-006 | Ajout de cours et adaptation du planning par le professeur | M |
| EVO-007 | Bibliothèque libre : tous les cours et exercices à tout moment | M |
| EVO-008 | Accueil en étapes (élève) et en questions (professeur) | M |
| EVO-009 | Barre latérale pliable à volonté, contenu sur toute la largeur | S |
| EVO-010 | En-tête revu | S |

Correctif livré ensuite : publication des médias d’un parcours en deux requêtes, pour rester dans le délai des appels internes.

**Incrément « Accueil sublimé »**, en production le 23 novembre 2026 : EVO-033 à EVO-037.
- Accueils plein écran « Le souffle » pour le professeur et l'élève : toile nuit, chemin des étapes où le « L » du logo voyage en s'étirant comme le vent, ouverture et fin animées.
- Questions du professeur qui s'adaptent, avec sa carte de présentation construite en direct.
- Révélation du niveau et carnet de route de l'élève.
- Drapeaux dans le choix des langues.
- Réponses d'accueil des professeurs dans la fiche administrateur et les indicateurs.
- Espace élève retravaillé, avec le chemin du niveau de départ au niveau visé.
