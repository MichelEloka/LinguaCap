# LinguaCap · Cours d’allemand V4

La V4 est le parcours officiel A1 et A2 de LinguaCap. En A1, l’élève commence par l’alphabet, les sons et l’épellation. En A2, il reprend ses acquis pour raconter, expliquer une décision et gérer des échanges courants. Chaque niveau comprend un diagnostic, un bilan intermédiaire et un examen blanc portant sur l’écoute, la lecture, l’écrit et l’oral.

## Ce que la V4 apporte

- **Exercices variés et corrigés** : textes à compléter, phrases à remettre en ordre, associations, dictées et répétitions orales, en plus des questions à choix. Après la remise, chaque question affiche la réponse attendue et une explication en français : pourquoi la réponse est juste, pourquoi l’erreur la plus fréquente ne l’est pas. Les anciennes activités « corrigé » ont disparu.
- **Répéter à voix haute** : chaque module propose un exercice de 4 à 6 phrases à répéter, validées par la reconnaissance vocale du navigateur ou, à défaut, par le professeur à partir d’un enregistrement.
- **Dictées** : deux à quatre par module, à partir des nombres en A1 et dans tout le niveau A2.
- **Missions** : la production de fin d’atelier se fait dans l’application (enregistrement de deux minutes au plus, texte, liste de vérification) et part chez le professeur, qui la valide ou demande de la reprendre.
- **Lexique par module** : de 10 à 30 mots avec article, pluriel, traduction, exemple et prononciation (6 mots au moins pour les modules de sons).
- **Voix A1 ralenties** dans tout le niveau : synthèse plus lente et enregistrements natifs ralentis sans changer la hauteur de la voix.
- **Illustrations** pour les modules ajoutés : affiches, formulaires, horaires, messages, plans et cartes de vocabulaire.

## Blocs ajoutés

| Niveau | Bloc | Ce que l’élève apprend à faire |
| --- | --- | --- |
| A1 | Lire et vérifier un montant | Lire les centaines et les milliers simples, distinguer 115 et 150 et confirmer un prix avant de payer. |
| A1 | Parler de son travail et de ses études | Présenter son métier ou ses études, indiquer où l’on travaille et donner ses horaires. |
| A1 | Santé au quotidien | Dire qu’il se sent mal, nommer une douleur, prévenir d’une absence et demander où trouver de l’aide. |
| A1 | Premiers trajets en transports | Lire une destination et une heure, demander un billet et vérifier qu’il prend la bonne ligne. |
| A2 | Démarches du quotidien | Comprendre un formulaire, réunir les pièces demandées, lire une confirmation et déplacer un rendez-vous. |
| A2 | Pannes et réparations dans le logement | Décrire une panne, préciser depuis quand elle dure et convenir d’un créneau d’intervention. |
| A2 | Cause, conséquence et opposition | Comparer les emplois de *weil*, *denn*, *deshalb* et *trotzdem*, puis organiser un message avec les verbes à la bonne place. |
| A2 | Verbes et prépositions | Employer *warten auf*, *sprechen mit* et *sich interessieren für* avec le cas attendu, dans des échanges sur les transports, le voisinage et les loisirs. |

En A1, les montants suivent les nombres et les coordonnées ; le travail et les études viennent après la journée, dont ils réemploient les heures et l’inversion du verbe. En A2, les démarches et les réparations prolongent le logement, les connecteurs suivent *weil* et *dass* vus avec le travail, et les verbes avec préposition prolongent le datif et les verbes pronominaux des relations. Le bilan intermédiaire tombe à la fin d’un thème : après la journée en A1 (module 12), après le travail en A2 (module 10).

## Volume

| Niveau | Modules | Activités | Durée des activités | Questions | Missions | Mots du lexique | Révisions et évaluations |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| A1 | 23 | 190 | 37 h 57 | 644 | 23 | 428 | 5 h 20 |
| A2 | 20 | 168 | 34 h 46 | 646 | 20 | 434 | 5 h 15 |

Médias : 313 sons et 201 images en A1, 268 sons et 184 images en A2 (dont un son par phrase à répéter et par dictée, et un lexique sonore par module). Questions A1 : 349 à choix, 67 à compléter, 31 à remettre en ordre, 23 associations, 36 dictées et 138 phrases à répéter. Questions A2 : 351 à choix, 120 à compléter, 17 à remettre en ordre, 10 associations, 40 dictées et 108 phrases à répéter.

Les durées estiment le temps de travail actif. Les révisions et évaluations comptent les créneaux prévus par la plateforme, hors diagnostic. La formule intensive A1 (environ 630 minutes par semaine pendant un mois) couvre ainsi les activités et les révisions du niveau ; en A2, six créneaux de 55 minutes par semaine sur huit semaines suffisent. La progression de l’élève guide l’ajustement de ces rythmes.

## Utiliser le kit

Décompressez l’archive et ouvrez `A1.html` ou `A2.html` dans un navigateur. Les leçons, les MP3, les transcriptions, les lexiques, les missions et les réponses commentées sont accessibles hors ligne. Pour les écoutes, repérez d’abord la situation, puis réécoutez avec un objectif précis avant d’ouvrir la transcription.

Le kit contient aussi les fichiers JSON et l’importeur LinguaCap. Avec Node.js 22 ou supérieur, ouvrez un terminal à la racine du dossier décompressé.

```powershell
node infra/content/check-content.mjs
node infra/content/import-content.mjs --dry-run
```

Une fois connecté à un compte autorisé à éditer le catalogue, importez chaque niveau en brouillon. La commande demande le mot de passe de l’éditeur sans l’afficher. Le catalogue doit être à jour (questions typées, missions et lexique) avant l’import.

```powershell
node infra/content/import-content.mjs --level a1 --api "https://<site>/api/v1" --supabase "https://<projet>.supabase.co" --publishable-key "<cle-publique>" --email "<editeur>"
```

Utilisez `--level a2` pour le second niveau. Relisez les brouillons dans le catalogue avant de les publier.

La V4 est produite à partir des sources du dépôt (`content/base/de`, `content/v3/source`, `content/v4/source` et les couches pédagogiques de [`v4/pedagogy`](pedagogy/README.md)) ; la chaîne complète est décrite dans `content/README.md`.

## Sources et crédits

- Les objectifs de communication et le choix du vocabulaire suivent les repères du CECRL et les listes A1 et A2 du Goethe-Institut. [CECRL](https://www.coe.int/fr/web/common-european-framework-reference-languages/table-1-cefr-3.3-common-reference-levels-global-scale) · [Goethe A1](https://www.goethe.de/de/spr/prf/ueb/pa1.html) · [Goethe A2](https://www.goethe.de/de/spr/prf/ueb/pa2.html)
- *Deutsch im Blick* et *Der und mehr* ont guidé le choix des situations et leur progression. *Grimm Grammar* a servi à vérifier l’ordre des mots et le cas des compléments des verbes avec préposition. Les dialogues, documents, exercices, explications et lexiques V4 ont été rédigés pour LinguaCap. [Deutsch im Blick](https://www.coerll.utexas.edu/dib/) · [Der und mehr](https://www.kennesaw.de/learn/introductory-courses) · [Grimm Grammar, ordre des mots](https://coerll.utexas.edu/gg/pr/con_06.html) · [Grimm Grammar, verbes et prépositions](https://coerll.utexas.edu/gg/pr/vphr_01.html)
- Les audios combinent des extraits natifs de *Deutsch im Blick* (CC BY 4.0) et les voix allemandes Thorsten et Kerstin. Tout le niveau A1 est lu lentement, les modèles à répéter, les dictées et les lexiques A1 au débit le plus posé ; les échanges A2 ont des répliques plus longues et un débit plus soutenu. Les lexiques sont lus par Thorsten, plus intelligible que Kerstin sur des mots isolés. Les sources et licences des médias sont détaillées dans `content/de/media/credits.json`. [Fiche Thorsten](https://huggingface.co/rhasspy/piper-voices/blob/cf910fb59f1d79ab3b625a63993a108751c6c25d/de/de_DE/thorsten/medium/MODEL_CARD) · [Fiche Kerstin](https://huggingface.co/rhasspy/piper-voices/blob/cf910fb59f1d79ab3b625a63993a108751c6c25d/de/de_DE/kerstin/medium/MODEL_CARD)
- Les illustrations composées utilisent les pictogrammes Lucide (licence ISC).
