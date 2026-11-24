// Niveau B1 (format 5, lot M1) : ordre des 24 modules, budget de durée des activités, bloc catalogue, réglages et titres
// du bilan intermédiaire et de l'examen blanc. Plan « Cours B1 et B2 complets » §3.2 et annexe modules.
// Chaque thème donne un module « thème » suivi de son atelier ; le second document du thème alterne écoute et lecture.
// Le bilan intermédiaire tombe après le module 12 (b1-lernen-atelier), qui clôt le 6e thème ; l'examen blanc suit le
// module 24 (b1-kultur-atelier).
export default {
  order: [
    'b1-neuanfang', 'b1-neuanfang-atelier',
    'b1-beziehungen', 'b1-beziehungen-atelier',
    'b1-wohnen', 'b1-wohnen-atelier',
    'b1-arbeit', 'b1-arbeit-atelier',
    'b1-gesundheit', 'b1-gesundheit-atelier',
    'b1-lernen', 'b1-lernen-atelier',
    'b1-unterwegs', 'b1-unterwegs-atelier',
    'b1-konsum', 'b1-konsum-atelier',
    'b1-medien', 'b1-medien-atelier',
    'b1-umwelt', 'b1-umwelt-atelier',
    'b1-gesellschaft', 'b1-gesellschaft-atelier',
    'b1-kultur', 'b1-kultur-atelier',
  ],
  // Activités seules (révisions et évaluations en plus) : 12 thèmes × (thème de 125 à 140 min + atelier de 110 à 125 min),
  // soit environ 50 heures. Durée prévue au catalogue ≈ activités + 24 × 15 min de révision + 60 + 120 ≈ 3 540 min,
  // d'où 6 mois en rythme standard et 2 mois en rythme intensif (plan §2.7).
  minutes: { min: 2950, max: 3100 },
  // Profils audio : b1-debut pour les modules 1 à 8 (débit naturel, à peine posé), b1-suite ensuite.
  audio: { debutModules: 8 },
  catalogue: {
    title: 'Allemand B1',
    description: 'Raconter, expliquer, défendre un avis et agir dans la vie courante et au travail.',
    position: 3,
    prerequisiteLevelId: 'a2',
  },
  settings: {
    expectedCompetences: ['lecture', 'ecoute', 'expression-ecrite', 'expression-orale'],
    successCriteria: 'Obtenir au moins 60 % à l’examen blanc B1, sans compétence sous 30 % : comprendre les points essentiels '
      + 'd’articles, de messages et d’annonces sur des sujets familiers, suivre une conversation ou une émission en langue '
      + 'standard, écrire un courriel personnel ou formel et un avis argumenté, présenter un sujet, réagir et organiser une '
      + 'activité à l’oral avec un partenaire.',
    passPercent: 60,
    reviewMinutes: 15,
    midtermMinutes: 60,
    finalMinutes: 120,
  },
  midtermTitle: 'Bilan intermédiaire B1 : modules 1 à 12',
  midtermDescription: 'Bilan de 60 minutes sur la première moitié du parcours : nouveau départ, relations, logement, travail, '
    + 'santé et formation. Lecture (15 min), écoute (15 min), expression écrite (20 min) et expression orale (10 min, '
    + 'préparation comprise). Les consignes sont en allemand, avec leur traduction en français. Les quatre compétences ont le '
    + 'même poids dans la note : le bilan ne valide rien, il vous montre ce qui est acquis et ce qu’il faut revoir avant la '
    + 'seconde moitié du parcours.',
  finalTitle: 'Examen blanc B1',
  finalDescription: 'Examen blanc de 120 minutes sur l’ensemble du niveau B1, dans l’esprit d’un examen B1 officiel : '
    + 'lecture (35 min, trois textes), écoute (25 min, trois documents), expression écrite (40 min, un courriel et une '
    + 'contribution à un forum) et expression orale (20 min, préparation comprise : organiser une activité, présenter un '
    + 'sujet, réagir à une question). Les consignes sont en allemand, avec leur traduction en français. Les quatre '
    + 'compétences ont le même poids. Pour réussir, il faut au moins 60 % au total, sans compétence sous 30 %.',
};
