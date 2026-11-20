# LinguaCap — Cahier des charges fonctionnel

LinguaCap aide un élève à atteindre un objectif de langue à une date donnée. L’élève indique le temps qu’il peut consacrer à l’apprentissage. La plateforme propose un calendrier de cours, d’exercices et d’évaluations. Le professeur suit la progression de ses élèves et intervient quand un retard ou une difficulté menace l’objectif.

La première version propose deux parcours complets d’allemand, **A1 et A2**, avec des objectifs intensifs d’un mois pour A1 et de deux mois pour A2. Elle comprend un catalogue administrable qui permet de composer des leçons et des évaluations avec du texte, des images et des enregistrements audio, puis de publier d’autres niveaux, comme B1, B2 ou C1, depuis l’interface.

Le [document d’architecture](ARCHITECTURE.md) décrit les services et leurs responsabilités. Le [backlog](PLAN_FONCTIONNALITES.md) ordonne leur réalisation jusqu’au pilote. Le [plan de déploiement](PLAN_DEPLOIEMENT.md) détaille la CI et la mise en ligne.

## 1. Périmètre du MVP

| Fonction | Livrable au lancement |
| --- | --- |
| Comptes | Invitations, activation, récupération d’accès et gestion des rôles. Un élève peut être accompagné ou autonome. |
| Objectifs | Niveau de départ, niveau cible, date de début, date cible, critères de réussite et cadence. |
| Calendrier | Proposition de planning à partir des disponibilités, jusqu’à sept jours par semaine et plusieurs séances par jour. Ajustement des séances restantes en cours de parcours. |
| Contenu | Parcours complets A1 et A2 en allemand, avec leçons illustrées, activités d’écoute, exercices, révisions et examens blancs. |
| Médias pédagogiques | Médiathèque d’images et d’audios, aperçu, réutilisation et insertion dans les leçons, exercices et évaluations. |
| Évaluation | Diagnostic initial, bilan intermédiaire et examen blanc final. Autocorrection des réponses fermées et correction humaine des productions écrites et orales de l’examen. |
| Suivi professeur | Liste d’élèves, fiche de suivi, alertes de retard, corrections à traiter et messages d’encouragement. |
| Administration | Gestion des comptes et rattachements, consultation de l’usage et des indicateurs globaux, édition et publication de niveaux depuis le catalogue. |

### Hypothèses de départ

- Le parcours « A2 en deux mois » suppose un niveau A1 déjà acquis. L’élève peut enchaîner après avoir validé A1 dans LinguaCap ou confirmer ses acquis par un diagnostic.
- Un élève accompagné a un professeur référent à la fois. Chaque professeur peut suivre autant d’élèves que nécessaire, avec une liste filtrable.
- Le rythme intensif est un réglage de départ que l’élève peut personnaliser. Les durées d’un et de deux mois sont des dates cibles. LinguaCap estime la charge et vérifie les acquis à l’évaluation.
- Un parcours est dit complet quand il couvre les compétences retenues pour le niveau dans le catalogue et débouche sur un examen blanc. La validation délivrée dans LinguaCap est un résultat interne.

## 2. Comptes, invitations et accès

| Rôle ou permission | Actions autorisées |
| --- | --- |
| Administrateur | Inviter des professeurs ou des élèves, gérer les rôles et l’état des comptes, rattacher ou réaffecter un élève, attribuer un parcours autonome, désigner un correcteur, consulter les fiches utilisateurs et les KPI globaux, administrer le catalogue. |
| Professeur | Inviter des élèves dans sa propre liste, valider et ajuster leurs parcours, consulter leur activité et leurs résultats, corriger leurs productions et envoyer des encouragements. |
| Élève | Activer son compte, renseigner ou modifier ses disponibilités, suivre son calendrier, effectuer les activités, rendre ses évaluations et consulter ses résultats et messages. |
| Permission « Catalogue » | Créer, modifier, prévisualiser et publier des contenus et niveaux. Déposer et réutiliser des ressources dans la médiathèque pédagogique. Cette permission peut être donnée à un développeur ou à un responsable pédagogique. Les accès aux fiches élèves relèvent des rôles de suivi. |
| Correcteur désigné | Consulter et corriger les productions qui lui sont attribuées, y compris celles d’un élève autonome. |

L’inscription se fait sur invitation. L’administrateur est à l’origine des comptes professeurs et contrôle l’attribution des droits. Un professeur invite par e-mail un élève que la plateforme rattache à sa liste lors de l’activation. L’administrateur peut aussi inviter un élève sans professeur et lui attribuer un parcours.

Une invitation peut être en attente, acceptée, expirée ou annulée. La réémission met à jour l’invitation existante. Si l’adresse correspond à un élève déjà inscrit, l’administrateur peut gérer le rattachement à partir du compte existant. L’historique pédagogique appartient à l’élève et le suit en cas de changement de professeur.

Les contrôles d’accès s’appliquent à la consultation des fiches, des corrections, des messages et des fichiers remis. Un professeur accède à ses élèves et un correcteur aux productions qui lui sont attribuées. L’administrateur peut désactiver un compte et consulter son historique.

## 3. De l’objectif au calendrier

### Création de l’objectif

L’objectif associe un élève, une langue, un niveau de départ, un niveau cible, une date de début et une date cible. Il référence les compétences attendues, les critères de réussite et la version publiée du programme. Le professeur fixe l’objectif avec l’élève. Pour un élève autonome, l’administrateur attribue le parcours et l’élève renseigne ses disponibilités.

L’élève choisit ses jours de travail et le nombre de séances qu’il souhaite faire chacun de ces jours. Il indique une durée disponible par séance. Il peut par exemple préférer deux séances le lundi, une le mardi, un jour de repos le mercredi et trois le samedi. Les modèles Standard et Intensif proposent des rythmes modifiables.

### Proposition et validation du planning

1. Le diagnostic situe l’élève. Le professeur confirme le point de départ pour un élève accompagné. Le résultat sert à déterminer quels modules et prérequis il lui reste à couvrir.
2. LinguaCap calcule le temps disponible entre les deux dates et le compare à la durée estimée des activités obligatoires, révisions et évaluations comprises.
3. La plateforme propose les séances dans l’ordre des prérequis et réserve des dates pour le bilan et l’examen blanc. Elle affiche la charge hebdomadaire et indique les activités qui débordent de la date cible si tout ne tient pas.
4. En cas d’écart, elle propose d’augmenter la durée ou le nombre de séances, d’ajouter des jours disponibles ou de choisir une échéance plus tardive.
5. Le professeur valide le calendrier de l’élève accompagné. L’élève autonome confirme son calendrier dans le parcours attribué par l’administrateur.

Par exemple, deux séances de 45 minutes chaque jour donnent **10 h 30 par semaine**. Pour un objectif « A1 en un mois », le planning se calcule sur les jours réellement disponibles entre les dates choisies. La charge dépend du diagnostic et de la version du parcours.

### Suivi et replanification

L’accueil élève affiche la prochaine séance, les autres séances du jour, le calendrier, les travaux à rattraper et le prochain bilan. Une séance peut regrouper une leçon, un exercice et une courte révision. Chaque séance a sa propre échéance et son état, même lorsque la journée en compte plusieurs.

L’élève peut commencer, reprendre et terminer une activité. Le calendrier distingue les séances à venir, en cours, terminées et en retard. Après une demande de changement de rythme, LinguaCap propose de replacer les activités restantes en respectant les prérequis. Les résultats et les dates de fin déjà enregistrés sont conservés. L’historique des échéances permet de distinguer le plan initial des révisions et de conserver les retards déjà constatés.

Un objectif peut être en préparation, en cours, en attente d’évaluation, en attente de correction, validé ou à consolider. Une mise en pause suspend les alertes et permet de préparer une reprise à une nouvelle date.

## 4. Contenu et évaluation

### Organisation pédagogique

Le catalogue suit la structure **langue → niveau → version de parcours → modules → activités et évaluations**. Chaque module décrit ce que l’élève doit savoir faire, les prérequis, les activités et leur durée estimée.

Les parcours A1 et A2 couvrent la lecture, l’écoute, l’expression écrite et l’expression orale. Les activités peuvent associer un texte, une image ou un audio à des consignes, un exercice fermé, une réponse écrite ou une production orale. En A1, l’élève peut écouter une annonce, associer un mot à une illustration ou écrire un bref message. En A2, il peut s’appuyer sur une image pour décrire une situation ou écouter un échange pour en identifier la demande.

### Utiliser les images et l’audio

Les images et les sons peuvent figurer dans une leçon, dans la consigne d’un exercice ou comme support d’évaluation. Le lecteur s’adapte à la largeur de l’écran. L’élève garde la main sur la lecture, la pause et la réécoute des sons, selon les règles de l’activité. Une ressource indisponible affiche un message et une action de réessai. Une séance dont un support obligatoire manque reste incomplète.

Chaque image informative dispose d’un texte alternatif adapté à son usage. Une image décorative est identifiée comme telle. Les transcriptions des audios peuvent être affichées pour les leçons, puis rendues accessibles au moment prévu pour les exercices et évaluations. Lors d’une épreuve d’écoute, leur disponibilité tient compte de la compétence évaluée et des modalités prévues par l’éditeur.

### Évaluer chaque objectif

| Étape | Rôle dans le parcours | Résultat visible |
| --- | --- | --- |
| Diagnostic initial | Évaluer le point de départ, identifier les prérequis et choisir les modules à travailler. | Compétences acquises et compétences à travailler. |
| Bilan intermédiaire | Vérifier les acquis sur les modules abordés et revoir le calendrier si nécessaire. | Résultats par compétence, révisions proposées et avancement par rapport au plan. |
| Examen blanc | Évaluer les quatre compétences selon les critères publiés avec le parcours. | Résultats, retour du correcteur et décision de validation. |

Les exercices à réponse fermée donnent un résultat immédiat. Les productions écrites et orales de l’examen sont évaluées avec la grille de la version du parcours. L’élève remet un texte ou un enregistrement audio. Le professeur référent, ou le correcteur désigné pour un élève autonome, enregistre son appréciation et les points à travailler.

Pour une production orale, l’élève peut enregistrer sa réponse ou joindre un fichier dans un format accepté, l’écouter avant la remise et relancer un envoi interrompu. LinguaCap confirme la remise lorsque les réponses et les fichiers nécessaires sont enregistrés. Les productions écrites et orales relèvent de l’espace d’évaluation privé. Seuls l’élève et les personnes habilitées à corriger sa tentative y accèdent.

Le niveau est validé dans LinguaCap lorsque les résultats satisfont les critères de réussite configurés et que toutes les corrections requises sont terminées. L’application distingue les états **en attente de correction**, **validé** et **à consolider**. Après un échec, l’élève voit les compétences à retravailler et peut effectuer une nouvelle tentative. Les tentatives et leurs résultats restent consultables.

La date de remise et la date de correction sont enregistrées séparément. Si une tentative réussie a été rendue dans les délais et corrigée après l’échéance, elle compte comme une réussite à l’échéance. Le résultat reste provisoire pendant la correction.

## 5. Suivi professeur et alertes

La liste des élèves fait remonter les alertes ouvertes et les corrections en attente. Le professeur peut la filtrer par niveau, état du parcours et échéance. La fiche d’un élève présente son objectif et son calendrier, les séances terminées ou en retard, les résultats par compétence, les productions à corriger et les encouragements envoyés.

La dernière connexion aide à repérer une absence. Le temps de pratique est une estimation fondée sur les périodes d’activité dans les leçons et exercices. La réalisation des séances et les résultats restent affichés séparément.

Une alerte s’ouvre quand le retard cumulé menace le prochain jalon ou quand un bilan obligatoire arrive à échéance et reste incomplet. Une alerte ouverte par objectif résume les activités concernées, la date à risque et la dernière activité de l’élève. Elle se met à jour si le retard évolue et se clôt quand le jalon n’est plus menacé. Les seuils de retard sont à calibrer lors du pilote selon la cadence choisie.

Depuis l’alerte, le professeur peut consulter le détail, envoyer un encouragement privé et proposer un calendrier ajusté. L’élève retrouve le message dans son espace, à côté de la prochaine action prévue. Pour un parcours autonome, l’élève voit lui-même les activités à rattraper et peut revoir ses disponibilités.

## 6. Administration du catalogue

L’espace **Administration → Catalogue** permet à une personne habilitée de créer un niveau par langue, de le positionner dans l’ordre des niveaux et de préciser ses prérequis. Elle peut préparer les modules, associer leurs supports, rédiger les exercices et leurs corrigés, puis configurer le diagnostic, le bilan, l’examen blanc et les critères de réussite.

La médiathèque permet de déposer une image ou un audio, de lui donner un titre, d’indiquer sa provenance et ses droits d’utilisation, puis de le prévisualiser et de le réutiliser dans plusieurs contenus. L’éditeur renseigne les textes alternatifs, les légendes et les transcriptions au moment d’associer la ressource à une activité, selon le contexte. Si un fichier ne respecte pas les formats ou les limites de dépôt, l’interface indique la cause du refus et permet un nouvel essai.

La publication suit trois étapes.

1. **Brouillon.** L’éditeur peut enregistrer un parcours incomplet et reprendre son travail.
2. **Prévisualisation.** L’éditeur vérifie l’expérience élève, l’affichage des images, la lecture des sons et leurs textes associés. Il vérifie aussi l’ordre des modules, les durées, les prérequis et les évaluations.
3. **Publication.** Le niveau apparaît dans les parcours attribuables une fois les éléments obligatoires renseignés et les médias nécessaires disponibles. Une nouvelle version peut être publiée après révision du contenu ou remplacement d’un média. L’éditeur peut retirer une version du catalogue pour les nouvelles inscriptions.

Une inscription référence la version utilisée au démarrage. Lorsqu’une version est remplacée ou retirée du catalogue, les élèves déjà inscrits gardent l’accès aux contenus, images et sons de leurs séances et évaluations, ainsi qu’à leurs résultats. Les nouvelles attributions utilisent la version publiée disponible.

Un administrateur doit pouvoir préparer puis publier **B1**, le rendre attribuable à un élève et répéter la même opération pour B2 ou C1 depuis l’interface. Le modèle de catalogue permet aussi d’associer des niveaux à d’autres langues au fil de l’évolution du produit.

## 7. Tableau de bord administrateur

La liste des utilisateurs affiche le rôle, l’état du compte, la date d’invitation ou d’activation, le professeur référent le cas échéant et la dernière activité. La fiche individuelle permet de consulter les parcours, l’état du suivi et les résultats utiles à l’administration.

Le tableau de bord global présente les usages par période, niveau de départ, niveau cible et cadence. Les parcours accompagnés et autonomes peuvent être consultés séparément.

| Indicateur | Règle de calcul |
| --- | --- |
| Activation à sept jours | Part des élèves invités ayant terminé une première séance dans les sept jours après l’envoi de l’invitation. Le dénominateur inclut les invitations arrivées au terme des sept jours. |
| Élèves actifs par semaine | Nombre d’élèves distincts ayant effectué une activité pédagogique dans la semaine. |
| Séances terminées à temps | Séances terminées au plus tard à leur échéance, divisées par les séances échues de la période. Un déplacement décidé avant l’échéance met à jour la date de référence. Un retard déjà constaté reste comptabilisé. |
| Objectifs validés à l’échéance | Part des parcours démarrés dont la date cible initiale tombe dans la période et qui ont donné lieu à une tentative réussie remise au plus tard à cette date. Les tentatives en attente de correction sont indiquées séparément. |
| Progression entre les bilans | Écart par compétence pour les élèves ayant passé les deux évaluations comparées, sur une échelle commune au parcours. |
| Reprise après encouragement | Part des élèves relancés pour un retard qui effectuent une activité dans les sept jours suivants, sur les relances dont la fenêtre de suivi est écoulée. |

L’indicateur principal du pilote est le **taux d’objectifs validés à l’échéance**. Il s’interprète avec la charge prévue, l’assiduité, le point de départ et le nombre de parcours observés.

## 8. Critères de recette du MVP

1. **Inviter et rattacher.** L’administrateur invite un professeur et un élève autonome. Le professeur invite un élève dans sa liste. Chaque invitation mène au bon compte et la réémission ne crée pas de doublon. Un second professeur est bloqué s’il tente d’accéder à l’élève qui ne lui est pas rattaché.
2. **Planifier un A1 intensif.** Un élève vise A1 en un mois, choisit sept jours de pratique et deux séances quotidiennes. LinguaCap répartit les activités, affiche la charge et laisse le professeur valider. Avec une disponibilité insuffisante, l’élève voit l’écart et les ajustements possibles.
3. **Replanifier un parcours.** Après une séance terminée et une séance en retard, le rythme change. Les activités restantes sont réordonnées selon les prérequis, les résultats sont conservés et les anciennes échéances restent consultables.
4. **Évaluer un A2.** Un élève dont le diagnostic confirme un A1 acquis vise A2 en deux mois. Il réalise le bilan et l’examen blanc. Les réponses fermées sont corrigées automatiquement et l’oral et l’écrit sont évalués avec la grille. Une tentative rendue à temps peut être corrigée après la date cible. Un élève autonome peut suivre la même évaluation avec un correcteur désigné.
5. **Réagir à un retard.** Plusieurs séances manquées entraînent une alerte de risque unique. Le professeur trouve les activités concernées, envoie un encouragement, puis voit la reprise lorsque l’élève travaille de nouveau.
6. **Publier un niveau.** L’administrateur crée et prévisualise un B1 en brouillon, ajoute son contenu et ses évaluations, puis le publie depuis le catalogue. Un professeur peut l’attribuer sans déploiement. Une nouvelle version laisse les inscriptions en cours sur leur version initiale.
7. **Vérifier les indicateurs.** Avec un petit jeu de parcours aux résultats connus, l’administrateur retrouve les bons nombres d’élèves actifs, de séances à temps et d’objectifs validés dans le filtre de niveau et de cadence attendu.
8. **Construire une activité multimédia.** L’éditeur dépose une illustration et un audio, renseigne les textes associés et réutilise un support dans deux activités. Il prévisualise puis publie le cours. L’élève voit l’illustration et peut mettre le son en pause et le réécouter sur ordinateur et mobile. Un fichier refusé ou indisponible donne un motif et une action de réessai.
9. **Protéger une remise et préserver les versions.** Un élève réessaie le dépôt de son oral après une interruption et obtient une seule remise confirmée. Son correcteur peut écouter le fichier. Une personne sans habilitation reçoit un refus. Lorsque l’éditeur remplace l’image ou l’audio dans une nouvelle version du cours, l’élève déjà inscrit retrouve les supports de sa version initiale.

## 9. Après le lancement

La priorité éditoriale est de compléter l’offre d’allemand avec B1, puis de poursuivre selon la demande avec B2 et C1. Le catalogue servira ensuite à proposer d’autres langues.

Les professeurs pourront créer des groupes de classe, par niveau ou par rythme, et proposer des défis facultatifs. Un premier défi peut récompenser une classe qui atteint son objectif de séances de la semaine. Une compétition individuelle pourra s’appuyer sur la part de l’objectif personnel accomplie pour que la comparaison tienne compte des différences de cadence. La participation aux défis et la visibilité d’un éventuel classement se règlent au niveau du groupe.

## Références pédagogiques

- [Conseil de l’Europe — Échelle des niveaux du CECR](https://www.coe.int/fr/web/common-european-framework-reference-languages/table-1-cefr-3.3-common-reference-levels-global-scale)
- [Goethe-Institut — Goethe-Zertifikat A1, format des épreuves et repères d’apprentissage](https://www.goethe.de/ins/fr/fr/sta/par/prf/gzsd1/inf.html)
- [Goethe-Institut — Goethe-Zertifikat A2, format des épreuves et repères d’apprentissage](https://www.goethe.de/ins/fr/fr/sta/par/prf/gzsd2/inf.html)
