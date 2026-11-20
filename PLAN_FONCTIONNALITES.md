# LinguaCap — Backlog de développement du MVP

Travailler sur `develop` dans l’ordre des incréments. Le [cahier des charges](CAHIER_DES_CHARGES.md) définit les règles métier, l’[architecture](ARCHITECTURE.md) les échanges entre les services et le [plan de déploiement](PLAN_DEPLOIEMENT.md) les contrôles CI et la mise en ligne. Le premier parcours part d’une invitation et va jusqu’au résultat d’une séance A1 avec un visuel et un audio.

## Incrément 1 · Initialiser l’application et les services

- [x] DEV-001 Reprendre l’interface React et Vite dans `linguacap-react/`, ajouter TypeScript, migrer les points d’entrée JSX et créer les routes de connexion, élève, professeur et administration.
- [x] DEV-002 Ajouter les commandes de démarrage, de vérification TypeScript, de test et de build. Versionner le verrou npm, le Maven Wrapper et les versions Java 21 et Node retenues.
- [x] DEV-003 Initialiser le projet Maven avec les six services Java 21 et Quarkus pour Identités, Catalogue, Médias, Apprentissage, Évaluations et Suivi. Préparer une image JVM indépendante par service et un contrôle de santé.
- [x] DEV-004 Créer la passerelle API Quarkus et ses routes. Préparer les appels HTTP interservices et le Worker Cloudflare en TypeScript pour le site et le proxy `/api/*`. Configurer le proxy de développement.
- [x] DEV-005 Définir les contrats HTTP et les schémas JSON des routes, des erreurs et des événements pour Java et TypeScript. Vérifier les entrées au point de réception et propager un identifiant de requête entre services.
- [x] DEV-006 Ajouter les règles Git pour ignorer les variables privées, les dépendances installées et les dossiers de build. Publier un modèle de configuration contenant des valeurs fictives.
- [x] DEV-007 Initialiser Supabase CLI et les migrations du PostgreSQL commun. Démarrer la base, Auth, Storage et la boîte e-mail locale. Ajouter des données fictives reproductibles pour les tests.
- [x] DEV-008 Créer un schéma privé et un rôle SQL d’exécution par service. Configurer JDBC avec des pools bornés et préparer le pooler Supabase en mode session sur TLS pour les services hébergés.
- [x] DEV-009 Tester le démarrage d’une première image Quarkus et l’appel d’un service depuis la passerelle locale. Vérifier qu’un rôle SQL ne peut pas consulter ni modifier les tables d’un autre service. Valider ensuite les identités IAM et la connexion JDBC à la première recette Cloud Run.
- [x] DEV-010 Connecter l’interface à l’API LinguaCap et configurer le client public Supabase pour Auth et les transferts Storage autorisés. Remonter les erreurs de configuration dans le bon environnement.
- [x] DEV-011 Ajouter la CI GitHub Actions dès l’incrément 1 dans `.github/workflows/ci.yml`. Sur les push et pull requests vers `develop` et `production`, vérifier les types, les tests et le build npm, exécuter `./mvnw --batch-mode verify` et tester le démarrage d’une première image. Utiliser des données de test et rendre les résultats CI requis pour fusionner vers `production`.

## Incrément 2 · Ouvrir les comptes et protéger les données

### Connexion et permissions

- [x] DEV-012 Créer les tables des profils, des rôles et des permissions Catalogue et Correction. Prévoir l’initialisation du premier administrateur par une opération serveur.
- [x] DEV-013 Créer le rattachement professeur–élève avec un seul référent actif. Enregistrer séparément le correcteur désigné pour un élève autonome.
- [x] DEV-014 Vérifier la session Supabase Auth à la passerelle. Faire contrôler aux services l’action et la ressource demandées, avec les droits d’Identités pour les rattachements et les correcteurs désignés.
- [x] DEV-015 Écrire les politiques Supabase nécessaires pour les accès Auth et Storage. Tester les appels API d’un professeur référent, d’un professeur tiers et d’un éditeur de catalogue sans droit de suivi.
- [x] DEV-016 Développer la connexion, la déconnexion et la redirection vers l’espace du rôle connecté. Gérer l’expiration de la session et les accès aux routes privées.
- [x] DEV-017 Développer la demande de récupération et la page de choix d’un nouveau mot de passe. Gérer le retour depuis un lien invalide ou expiré.

### Invitations et gestion des utilisateurs

- [x] DEV-018 Créer la table des invitations avec adresse, rôle, référent prévu, date d’envoi, expiration et état. Ajouter les contraintes pour éviter les doublons.
- [x] DEV-019 Implémenter l’envoi d’invitation dans le service Quarkus Identités. Configurer l’accès privilégié à Supabase Auth dans ce service. Autoriser l’admin à inviter des professeurs ou des élèves et le professeur à inviter ses élèves.
- [x] DEV-020 Développer les formulaires d’invitation et leur liste. Ajouter l’annulation, la réémission et la gestion d’une adresse qui correspond à un compte existant.
- [x] DEV-021 Créer la page d’activation. Lier le compte Auth à l’invitation et créer le rattachement après acceptation, à partir du rôle enregistré côté serveur.
- [x] DEV-022 Développer la liste et la fiche admin des utilisateurs avec rôle, état, invitation, activation, référent et dernière activité. Ajouter la gestion des rôles et permissions autorisés et la désactivation du compte.
- [x] DEV-023 Ajouter la réaffectation de professeur et la désignation d’un correcteur. Conserver l’historique de l’élève et appliquer les nouveaux droits dès le changement.
- [x] DEV-024 Tester les invitations depuis l’admin et un compte professeur, le cas autonome et la réémission sans doublon. Vérifier que les accès retirés échouent aussi directement côté serveur. Préparer la trace métier de l’invitation et de l’activation pour Suivi.

## Incrément 3 · Livrer une première séance A1 de bout en bout

- [x] DEV-025 Créer dans Catalogue les langues, niveaux, versions, modules ordonnés, compétences, activités et durées estimées. Exposer la lecture d’une version attribuable par API interne.
- [x] DEV-026 Créer dans Médias les ressources et leurs versions. Préparer les espaces privés de stockage pour les supports de cours et les productions orales. Ajouter la lecture autorisée d’un support de cours.
- [x] DEV-027 Charger un module A1 de démonstration avec une leçon, une image, un court audio et un exercice fermé. Référencer les versions des médias comme dans le futur catalogue administrable.
- [x] DEV-028 Créer dans Apprentissage les parcours attribués et les séances, rattachés à une version précise du catalogue. Créer dans Évaluations les réponses et le résultat du quiz. Vérifier l’attribution et l’accès avant de livrer l’activité.
- [x] DEV-029 Ajouter l’attribution manuelle d’un parcours de démonstration par le professeur ou l’admin. Enregistrer une première séance avec une échéance.
- [x] DEV-030 Créer l’accueil élève avec la prochaine séance et les séances du jour. Afficher le visuel et son alternative textuelle. Ajouter les commandes de lecture et le lien vers la transcription audio lorsqu’elle peut être fournie.
- [x] DEV-031 Enregistrer la progression pour reprendre une activité après fermeture ou rafraîchissement. Horodater la fin et éviter le double comptage si la requête est rejouée.
- [x] DEV-032 Corriger le quiz dans Évaluations, enregistrer son résultat et l’afficher à l’élève. Récupérer le corrigé auprès de Catalogue par une route interne réservée au service.
- [x] DEV-033 Afficher dans Suivi une première fiche professeur en récupérant la séance et le résultat auprès d’Apprentissage et d’Évaluations. Tester le parcours depuis l’invitation jusqu’à cette fiche.

## Incrément 4 · Générer et ajuster le planning personnalisé

### Objectif, diagnostic et cadence

- [x] DEV-034 Étendre le parcours avec niveau de départ, niveau cible, compétences attendues, critères, dates et état de préparation. Conserver la date cible initiale pour les KPI.
- [x] DEV-035 Ajouter le formulaire d’objectif côté professeur et l’attribution d’un objectif autonome côté admin. Afficher les critères de réussite à l’élève.
- [x] DEV-036 Implémenter le diagnostic initial dans Évaluations et transmettre son résultat à Apprentissage. Permettre au professeur de confirmer le point de départ et d’influer sur les modules restant à travailler.
- [x] DEV-037 Vérifier le prérequis A1 avant de confirmer un parcours A2. Accepter un A1 validé ou des acquis confirmés par le diagnostic.
- [x] DEV-038 Ajouter les modèles Standard et Intensif. Proposer A1 en un mois et A2 en deux mois à partir d’un A1 acquis.
- [x] DEV-039 Créer le formulaire de disponibilités par jour, avec le nombre de séances et la durée prévue. Permettre une cadence différente selon les jours.

### Génération, validation et replanification

- [x] DEV-040 Implémenter le calcul de capacité entre les dates du parcours. Compter les activités obligatoires, les révisions et les créneaux d’évaluation.
- [x] DEV-041 Distribuer les activités dans les créneaux en respectant l’ordre des prérequis. Donner à chaque séance sa propre échéance et son propre état.
- [x] DEV-042 Afficher la charge hebdomadaire, le calendrier proposé et les activités qui débordent. Proposer un ajustement de cadence ou d’échéance si le programme dépasse la capacité.
- [x] DEV-043 Enregistrer la proposition et permettre sa validation par le professeur référent ou par l’élève autonome. Afficher les séances du calendrier validé et les rattrapages dans l’espace élève.
- [x] DEV-044 Recalculer les séances restantes dans Apprentissage quand les disponibilités changent. Appliquer en transaction une révision fondée sur la version courante du planning. Conserver les séances terminées et l’historique des échéances révisées.
- [x] DEV-045 Gérer la mise en pause et la reprise d’un objectif. Republier pour l’élève les activités restantes selon le nouveau calendrier validé.
- [x] DEV-046 Tester la charge de deux séances de 45 minutes par jour sur sept jours, les créneaux insuffisants, plusieurs séances le même jour et la replanification avant et après un retard.

## Incrément 5 · Administrer la médiathèque et publier le catalogue

La préparation des contenus A1 et A2 peut commencer en parallèle dès que la structure du module A1 de démonstration est disponible.

- [x] DEV-047 Créer les écrans Catalogue pour ajouter et ordonner les niveaux d’une langue et renseigner leurs prérequis.
- [x] DEV-048 Construire l’éditeur de modules. Permettre de modifier les objectifs, l’ordre, les durées, les leçons, les exercices et les révisions.
- [x] DEV-049 Créer la médiathèque des images et des sons. Lister, filtrer, prévisualiser et réutiliser les ressources autorisées depuis l’éditeur. Associer un fichier à un bloc de cours, à une question ou à un choix de réponse.
- [x] DEV-050 Créer l’autorisation de dépôt de Médias. Attribuer une clé d’objet et une session de dépôt liées à l’auteur et à l’usage prévu. Envoyer le fichier du navigateur directement vers Supabase Storage et afficher la progression et les erreurs.
- [x] DEV-051 Implémenter la finalisation du dépôt. Contrôler le contenu, le type, la taille et les métadonnées selon les règles du média. Écarter les fichiers invalides et traiter les dépôts abandonnés avec les règles de conservation retenues.
- [x] DEV-052 Ajouter le texte alternatif, la légende, la transcription, la source et la licence selon le type et l’usage du média. Vérifier le rendu au clavier et sur mobile. Rendre la transcription visible selon les règles de l’activité ou de l’évaluation.
- [x] DEV-053 Autoriser la lecture des brouillons aux éditeurs habilités et la lecture des médias publiés aux comptes qui disposent du bon parcours. Renouveler les accès temporaires lors d’une reprise de séance.
- [x] DEV-054 Ajouter l’édition des questions, corrigés, diagnostics, bilans, examens blancs et grilles par compétence.
- [x] DEV-055 Développer l’enregistrement et la reprise d’un brouillon ainsi que l’aperçu dans le lecteur élève.
- [x] DEV-056 Valider côté serveur les champs nécessaires à la publication. Afficher les activités, supports, durées, prérequis ou critères à compléter.
- [x] DEV-057 Implémenter la publication et le retrait. Afficher seulement les versions publiées et disponibles pour les nouvelles attributions.
- [x] DEV-058 Permettre de repartir d’une version publiée pour créer un nouveau brouillon. Figer le contenu, les corrigés, le barème et les versions précises des images et des sons. Remplacer un média sans modifier le fichier que les parcours existants référencent.
- [x] DEV-059 Tester la création et la publication d’un niveau B1 de démonstration depuis l’admin, son attribution sans redéploiement et l’accès d’un ancien élève à sa version après mise à jour.
- [x] DEV-060 Tester en recette un dépôt valide, un fichier refusé et un dépôt interrompu. Vérifier le refus d’accès à un brouillon et la lecture du bon fichier lorsqu’un média est remplacé dans une version suivante.

## Incrément 6 · Faire passer et corriger les évaluations

- [x] DEV-061 Créer le modèle des tentatives d’évaluation, de leurs réponses et de leurs résultats par compétence. Associer chaque tentative à sa grille et à sa version de parcours.
- [x] DEV-062 Ajouter le bilan intermédiaire au calendrier et permettre sa remise. Afficher les résultats et les activités à revoir à l’élève et au professeur autorisé.
- [x] DEV-063 Construire le déroulé de l’examen blanc pour la lecture, l’écoute, l’écrit et l’oral. Enregistrer la progression dans la tentative.
- [x] DEV-064 Ajouter l’écrit et l’oral privé. Enregistrer l’audio dans le navigateur quand il le permet et proposer le dépôt d’un fichier en alternative. Faire déposer l’audio par le parcours direct de Médias et conserver les réponses restantes en cas de reprise.
- [x] DEV-065 Lier la production orale à l’élève et à la tentative. Autoriser la lecture au propriétaire et aux correcteurs habilités après contrôle par Évaluations et Identités. Garder l’oral hors de la médiathèque pédagogique.
- [x] DEV-066 Traiter la remise finale côté serveur une fois les fichiers requis validés. Enregistrer l’horodatage de remise et empêcher une deuxième tentative si l’élève rejoue la même requête.
- [x] DEV-067 Réutiliser l’autocorrection des questions fermées dans les évaluations. Garder les productions écrites et orales ouvertes à la correction humaine.
- [x] DEV-068 Créer la file des corrections du professeur et du correcteur désigné. Lier les productions à la grille de leur examen.
- [x] DEV-069 Développer le formulaire de correction par compétence avec note et commentaire. Enregistrer la date de correction séparément de la date de remise.
- [x] DEV-070 Calculer la décision lorsque toutes les corrections obligatoires sont terminées. Afficher les états en attente de correction, validé dans LinguaCap et à consolider avec les retours par compétence.
- [x] DEV-071 Ajouter la nouvelle tentative et l’historique des tentatives précédentes.
- [x] DEV-072 Tester l’examen accompagné et l’examen autonome, le refus de lecture d’un audio par un tiers, la remise à temps corrigée après l’échéance et la nouvelle tentative après un résultat à consolider.

## Incrément 7 · Donner au professeur les moyens d’intervenir

- [x] DEV-073 Publier les événements métier utiles au suivi depuis les services qui les possèdent. Couvrir les invitations et activations, les objectifs et révisions, les séances terminées, les remises et corrections et les relances.
- [x] DEV-074 Enregistrer les événements dans une table d’envoi du service producteur, dans la même transaction que l’action métier. Prévoir l’export interservice, le point de reprise et les tentatives après échec.
- [x] DEV-075 Projeter les événements dans Suivi et dédupliquer leur traitement par identifiant. Tester la reprise, le traitement après arrivée tardive et la reconstruction de la projection.
- [x] DEV-076 Calculer le temps de pratique estimé à partir de l’activité, séparément de la dernière connexion. Arrêter le comptage pendant l’inactivité.
- [x] DEV-077 Développer la liste des élèves du professeur, les filtres par niveau, état et échéance, et la mise en avant des alertes et corrections ouvertes.
- [x] DEV-078 Compléter la fiche élève avec objectif, planning, retard, résultats par compétence, corrections et historique des encouragements.
- [x] DEV-079 Créer les alertes par objectif et implémenter la règle de risque selon la cadence et le prochain jalon. Détecter aussi le bilan obligatoire arrivé à échéance.
- [x] DEV-080 Développer le traitement périodique dans le service Suivi et l’exposer à l’identité dédiée de Cloud Scheduler. Mettre à jour l’alerte existante, la suspendre pendant une pause et la clôturer lorsque le risque disparaît.
- [x] DEV-081 Ajouter les actions « envoyer un encouragement » et « revoir le planning » depuis la fiche ou l’alerte. Utiliser le flux de replanification déjà construit.
- [x] DEV-082 Afficher l’encouragement à l’élève et enregistrer sa première activité de reprise pour le suivi. Afficher les rattrapages directement à l’élève autonome.
- [x] DEV-083 Tester le cycle retard, alerte, relance, reprise et clôture. Tester une deuxième exécution du contrôle et un parcours mis en pause.

## Incrément 8 · Mettre en place les KPI administrateur

- [x] DEV-084 Exposer dans Suivi les indicateurs et la fiche admin fondés sur les projections locales. Protéger les requêtes de statistiques par rôle et afficher la fraîcheur des résultats.
- [x] DEV-085 Calculer l’activation à sept jours à partir des invitations dont la fenêtre est écoulée et des premières séances terminées. Compter une réémission avec son invitation d’origine.
- [x] DEV-086 Calculer les élèves actifs par semaine à partir d’activités pédagogiques enregistrées.
- [x] DEV-087 Calculer les séances terminées à temps. Appliquer l’échéance révisée si le déplacement est décidé avant le délai et conserver les retards déjà constatés.
- [x] DEV-088 Calculer les objectifs validés à l’échéance à partir de la date cible initiale et de la date de remise de la tentative réussie. Afficher séparément les tentatives en attente de correction.
- [x] DEV-089 Calculer l’évolution entre des bilans comparables pour chaque compétence.
- [x] DEV-090 Calculer la reprise après encouragement à partir des relances dont la fenêtre de sept jours est écoulée.
- [x] DEV-091 Créer le tableau de bord avec filtres par période, niveau de départ, niveau cible, cadence et type de parcours. Afficher les effectifs et traiter les résultats sur des groupes vides.
- [x] DEV-092 Tester les six indicateurs avec des données fictives et des résultats calculés à l’avance. Inclure les réémissions d’invitation, les retards replanifiés et les remises à temps corrigées tardivement.

## Incrément 9 · Intégrer les parcours complets A1 et A2

La rédaction et la validation pédagogique fournissent les leçons, audios, exercices et grilles. Les tâches ci-dessous couvrent leur intégration dans LinguaCap.

- [ ] DEV-093 Intégrer dans le catalogue les modules, médias, diagnostics, bilans et examens blancs A1 et A2. Renseigner les compétences, les prérequis et les durées.
- [ ] DEV-094 Vérifier les images, l’audio, les textes alternatifs et les transcriptions selon l’usage. Contrôler les corrigés et la couverture des quatre compétences. Corriger les écarts de lecture, d’ordre ou de configuration.
- [ ] DEV-095 Publier les versions initiales A1 et A2 en recette. Vérifier que les deux niveaux apparaissent dans l’attribution et que l’entrée en A2 applique le prérequis A1.
- [ ] DEV-096 Exécuter la recette d’un A1 intensif accompagné, avec plusieurs séances par jour et une replanification, puis d’un A2 autonome, de l’attribution jusqu’à la correction.
- [ ] DEV-097 Corriger les blocages trouvés sur les parcours complets et rejouer les scénarios concernés.

## Incrément 10 · Déployer et vérifier le MVP en ligne

- [ ] DEV-098 Préparer le workflow de livraison indépendant de la CI. Configurer l’identité OIDC GitHub pour Google Cloud, Artifact Registry et l’autorisation de déploiement Cloudflare limitée au site. Préparer le build Vite et le proxy Worker par environnement.
- [ ] DEV-099 Appliquer les migrations Supabase par service. Configurer les rôles SQL, les connexions JDBC TLS et les espaces privés Storage. Configurer les secrets d’exécution dans Secret Manager.
- [ ] DEV-100 Déployer et tester séparément les services Quarkus privés et la passerelle sur Cloud Run. Configurer les autorisations d’invocation IAM, tester les digests qualifiés et activer Cloud Scheduler avec son identité dédiée.
- [ ] DEV-101 Vérifier la compatibilité entre versions de la passerelle, des services et des contrats d’événements avant l’ouverture. Tester l’effet d’une indisponibilité temporaire sur un appel et sur le rattrapage d’une projection.
- [ ] DEV-102 Configurer et contrôler les journaux corrélés, le suivi des erreurs et les limites de requêtes, connexions, stockage et trafic du pilote.
- [ ] DEV-103 Configurer le SMTP Resend sur le domaine d’envoi vérifié `notifications.emichfer.org`. Préparer les redirections Auth vers `linguacap.emichfer.org`.
- [ ] DEV-104 Publier la branche `production` depuis la version validée de `develop`. Livrer le site et le proxy sur Cloudflare, pointer `/api/*` vers la passerelle Cloud Run et rattacher le Worker à `linguacap.emichfer.org`. Vérifier les routes directes du site.
- [ ] DEV-105 Tester en ligne le HTTPS, la connexion, l’invitation vers une adresse externe et la récupération de compte. Vérifier la réception et l’ouverture des liens.
- [ ] DEV-106 Vérifier en ligne l’isolation de deux comptes professeurs, l’accès aux remises de l’élève autonome par son correcteur désigné et le refus d’invocation d’un service Cloud Run privé sans identité autorisée. Vérifier le dépôt et la lecture d’une image et d’un audio.
- [ ] DEV-107 Charger et publier les versions validées d’A1 et d’A2 et leurs médias en production. Vérifier leur disponibilité, les alertes et les KPI avec des comptes de recette. Rejouer la publication B1 de démonstration dans l’environnement de recette.
- [ ] DEV-108 Documenter le retour à une révision compatible de chaque service Cloud Run et du Worker Cloudflare. Faire un export PostgreSQL et une copie des fichiers Storage. Vérifier une restauration en recette avant l’ouverture du pilote.
- [ ] DEV-109 Corriger les derniers blocages de la recette en ligne, rejouer les tests concernés et identifier la version à ouvrir au pilote.
