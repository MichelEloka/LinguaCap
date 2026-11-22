# LinguaCap · Cours d’allemand V3

Ce dossier accompagne les parcours A1 et A2 destinés aux francophones. Chaque séquence associe un objectif concret, un modèle en allemand, de l’entraînement, un contrôle avec correction commentée et une production à réutiliser dans la vie courante. Chaque niveau comprend un diagnostic, un bilan intermédiaire et un examen blanc couvrant les quatre compétences.

## Progression

| Niveau | Départ | Progression attendue |
| --- | --- | --- |
| A1 | Écouter l’alphabet, épeler, reconnaître les voyelles puis prononcer les consonnes fréquentes et les groupes de mots | Se présenter, donner ses coordonnées, comprendre une consigne, raconter une journée, commander, fixer une heure, parler de ses proches et demander un chemin |
| A2 | Réactiver les acquis A1 dans un trajet et raconter un événement passé | Gérer un changement, expliquer un besoin, organiser une activité, écrire à un interlocuteur, comparer des options et justifier une décision |

En A1, l’accent porte sur l’intelligibilité. L’élève écoute, repère, imite puis réemploie des mots familiers dans un échange court. En A2, les messages s’allongent, les interlocuteurs reviennent sur une information et l’élève doit retenir plusieurs éléments, notamment une heure, un motif et une décision. Les objectifs sont calés sur les descripteurs du CECRL. [Conseil de l’Europe](https://www.coe.int/fr/web/common-european-framework-reference-languages/cefr-companion-volume-and-its-language-versions)

### Séances et rythme

| Niveau | Activités | Révisions et évaluations du parcours | Exemple de cadence |
| --- | ---: | ---: | --- |
| A1 | 33 h 16 | 4 h 40 | 2 séances de 50 min par jour, 6 jours par semaine, sur 4 semaines |
| A2 | 29 h 24 | 4 h 35 | 5 séances de 55 min par semaine, sur 8 semaines |

- Fractionner un chapitre en séances de 30 à 55 minutes. Garder une pause entre l’apprentissage d’un modèle et son réemploi. Les minutes des fiches incluent l’écoute, les prises de notes, la répétition et la production.
- Pour l’écoute guidée, repérer l’intention au premier passage et les détails au deuxième. Ouvrir la transcription pour comparer. Pendant un contrôle, faire les deux premières écoutes et répondre avant de consulter la transcription ou la correction.
- Après chaque mission, réactiver au lendemain en 10 minutes, avec 3 minutes de rappel sans cours, 4 minutes de réemploi dans une autre situation et 3 minutes de vérification. Tester la même compétence à J+3 et J+7. Les nouveaux contextes des ateliers servent aussi à ces reprises.
- En formule intensive A1 sur quatre semaines, prévoir deux créneaux les jours chargés et garder un temps de révision hebdomadaire. Commencer par les trois modules de sons, avancer sur les séquences 1 à 4, puis sur les séquences 5 à 8, et réserver une séance à l’examen blanc et une à sa reprise.
- En formule A2 sur huit semaines, travailler un thème et son atelier par semaine. Par exemple, utiliser une séance pour le dialogue et les mots, deux pour les structures et les entraînements, une pour la mission et une pour la révision. Placer le bilan après quatre thèmes et l’examen après le dernier.
- Pour l’oral, enregistrer une version courte puis une seconde version après écoute. Le professeur vérifie la compréhension, la tâche accomplie et l’intelligibilité. Pour l’écrit, corriger un point de langue et une information manquante, puis refaire la mission avec une variante.

Les durées sont des estimations de travail actif. Les révisions et évaluations du tableau correspondent aux créneaux proposés par la plateforme, hors diagnostic. Les révisions espacées à J+3 et J+7, échanges avec un professeur et corrections personnalisées complètent les activités. L’examen blanc et les productions permettent d’ajuster le calendrier au niveau atteint.

### Audios

Les fichiers MP3 permettent de réécouter les modèles de sons et les dialogues. Le débit est très posé à l’entrée A1, plus régulier à la fin du A1 et proche d’un échange clair en fin A2. Les pauses séparent des unités de sens. Les dialogues utilisent deux voix allemandes de synthèse, Thorsten et Kerstin. Une sélection d’enregistrements natifs de *Deutsch im Blick* est conservée. Parmi ceux-ci, le tempo est adapté quand le niveau l’exige, avec préservation de la hauteur.

### Sources

- *Deutsch im Blick*, 2e édition, COERLL, Université du Texas à Austin, CC BY 4.0. La progression de l’alphabet et des contrastes de sons a guidé les premières activités. Les extraits natifs, parfois recadrés ou ralentis, et les illustrations reprises portent une attribution. [Deutsch im Blick](https://www.coerll.utexas.edu/dib/)
- *Der und mehr*, Kennesaw State University, Affordable Learning Georgia, séries 1001 à 2002, CC BY 4.0. Les thèmes du quotidien et la progression des situations ont nourri les nouvelles scènes et consignes. [Der und mehr](https://www.kennesaw.de/learn/introductory-courses)
- Piper Thorsten s’appuie sur des données de Thorsten Müller et une base rdh sous CC0. Piper Kerstin utilise des données de l’Open Home Foundation sous CC0 et a été préentraînée sur la voix de Cori Samuel (Hi-Fi TTS, locutrice 92, CC BY 4.0). [Fiche Thorsten](https://huggingface.co/rhasspy/piper-voices/blob/cf910fb59f1d79ab3b625a63993a108751c6c25d/de/de_DE/thorsten/medium/MODEL_CARD) · [Fiche Kerstin](https://huggingface.co/rhasspy/piper-voices/blob/cf910fb59f1d79ab3b625a63993a108751c6c25d/de/de_DE/kerstin/medium/MODEL_CARD) · [Licence CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)
- Les textes, dialogues et activités ajoutés en V3 ont été rédigés pour LinguaCap. Les crédits détaillés des médias repris se trouvent dans `content/de/media/credits.json`.

## Utiliser le kit

Décompresser l’archive dans un dossier dédié. Ouvrir `A1.html` ou `A2.html` dans un navigateur pour lire les cours et écouter les MP3 hors ligne. Les transcriptions et solutions se déplient à la demande. Conserver le dossier `content` à côté des pages pour que leurs médias restent accessibles.

Le kit contient aussi les fichiers JSON par niveau, les médias, les scripts d’import et les crédits. Avec Node.js 22 ou supérieur, ouvrir un terminal dans le dossier décompressé et exécuter les vérifications suivantes.

```powershell
node infra/content/check-content.mjs
node infra/content/import-content.mjs --dry-run
```

L’import réel utilise l’API LinguaCap et un compte disposant des droits d’édition du catalogue. La commande suivante crée ou met à jour le **brouillon** A1 de l’environnement indiqué. Elle demande le mot de passe de l’éditeur sans l’afficher au terminal.

```powershell
node infra/content/import-content.mjs --level a1 --api "https://<site>/api/v1" --supabase "https://<projet>.supabase.co" --publishable-key "<cle-publique>" --email "<editeur>"
```

Utiliser `--level a2` pour le deuxième parcours. Relire le brouillon dans le catalogue, puis le publier depuis l’interface quand le contenu est prêt. Les identifiants existants des chapitres et activités V2 ont été conservés dans le kit. Les ateliers et les trois modules de sons ont leurs propres identifiants.
