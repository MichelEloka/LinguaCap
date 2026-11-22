# LinguaCap · Cours d’allemand V4

La V4 reprend l’ensemble du parcours A1 et A2. En A1, l’élève commence par l’alphabet, les sons et l’épellation. En A2, il reprend ses acquis pour raconter, expliquer une décision et gérer des échanges courants. Chaque niveau comprend un diagnostic, un bilan et un examen blanc portant sur l’écoute, la lecture, l’écrit et l’oral.

## Nouvelles leçons

| Niveau | Bloc | Ce que l’élève apprend à faire |
| --- | --- | --- |
| A1 | Santé au quotidien | Dire qu’il se sent mal, nommer une douleur, prévenir d’une absence et demander où trouver de l’aide. |
| A1 | Premiers trajets en transports | Lire une destination et une heure, demander un billet et vérifier qu’il prend la bonne ligne. |
| A2 | Démarches du quotidien | Comprendre un formulaire, réunir les pièces demandées, lire une confirmation et déplacer un rendez-vous. |
| A2 | Cause, conséquence et opposition | Comparer les emplois de *weil*, *denn*, *deshalb* et *trotzdem*, puis organiser un message avec les verbes à la bonne place. |

Chaque bloc comprend trois leçons, un contrôle de compréhension, un corrigé commenté et une mission orale et écrite. Les dialogues sont accompagnés de courts modèles audio. La santé et les transports en A1 préparent les cours A2 sur la consultation, la réservation et les correspondances. En A2, la leçon de connecteurs suit l’introduction de *weil* et *dass* dans le chapitre consacré au travail.

| Niveau | Modules | Activités | Révisions et évaluations |
| --- | ---: | ---: | ---: |
| A1 | 21 | 36 h 36 | 5 h |
| A2 | 18 | 32 h 44 | 4 h 55 |

Les durées estiment le temps de travail actif. Les révisions et évaluations comptent les créneaux prévus par la plateforme, hors diagnostic. En formule intensive, deux créneaux de 55 minutes sur six jours par semaine offrent 44 heures sur quatre semaines pour le A1. Cinq créneaux d’une heure par semaine offrent 40 heures sur huit semaines pour le A2. La progression de l’élève guide l’ajustement de ces rythmes.

## Utiliser le kit

Décompressez l’archive et ouvrez `A1.html` ou `A2.html` dans un navigateur. Les leçons, les MP3, les transcriptions et les corrections sont accessibles hors ligne. Pour les écoutes, repérez d’abord la situation, puis réécoutez avec un objectif précis avant d’ouvrir la transcription.

Le kit contient aussi les fichiers JSON et l’importeur LinguaCap. Avec Node.js 22 ou supérieur, ouvrez un terminal à la racine du dossier décompressé.

```powershell
node infra/content/check-content.mjs
node infra/content/import-content.mjs --dry-run
```

Une fois connecté à un compte autorisé à éditer le catalogue, importez chaque niveau en brouillon. La commande demande le mot de passe de l’éditeur sans l’afficher.

```powershell
node infra/content/import-content.mjs --level a1 --api "https://<site>/api/v1" --supabase "https://<projet>.supabase.co" --publishable-key "<cle-publique>" --email "<editeur>"
```

Utilisez `--level a2` pour le second niveau. Relisez les brouillons dans le catalogue avant de les publier.

## Sources et crédits

- Les objectifs de communication et le choix du vocabulaire suivent les repères du CECRL et les listes A1 et A2 du Goethe-Institut. [CECRL](https://www.coe.int/fr/web/common-european-framework-reference-languages/table-1-cefr-3.3-common-reference-levels-global-scale) · [Goethe A1](https://www.goethe.de/de/spr/prf/ueb/pa1.html) · [Goethe A2](https://www.goethe.de/de/spr/prf/ueb/pa2.html)
- *Deutsch im Blick* et *Der und mehr* ont guidé le choix des situations et leur progression. *Grimm Grammar* a servi à vérifier l’ordre des mots allemand. Les dialogues, documents et exercices V4 ont été rédigés pour LinguaCap. [Deutsch im Blick](https://www.coerll.utexas.edu/dib/) · [Der und mehr](https://www.kennesaw.de/learn/introductory-courses) · [Grimm Grammar](https://coerll.utexas.edu/gg/pr/con_06.html)
- Les audios combinent des extraits natifs de *Deutsch im Blick* (CC BY 4.0) et les voix allemandes Thorsten et Kerstin. Le débit des nouveaux dialogues A1 laisse du temps aux mots clés. Les échanges A2 ont des répliques plus longues et un débit plus soutenu. Les sources et licences des médias sont détaillées dans `content/de/media/credits.json`. [Fiche Thorsten](https://huggingface.co/rhasspy/piper-voices/blob/cf910fb59f1d79ab3b625a63993a108751c6c25d/de/de_DE/thorsten/medium/MODEL_CARD) · [Fiche Kerstin](https://huggingface.co/rhasspy/piper-voices/blob/cf910fb59f1d79ab3b625a63993a108751c6c25d/de/de_DE/kerstin/medium/MODEL_CARD)
