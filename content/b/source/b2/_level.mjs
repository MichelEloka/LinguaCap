// Niveau B2 (format 5, lot M2) : ordre des 24 modules, budget de durée des activités, bloc catalogue, réglages et titres
// de la Zwischenbilanz (bilan intermédiaire) et de la Probeprüfung (examen blanc). Plan « Cours B1 et B2 complets » §1.4,
// §2.5, §3.2 et annexe modules (B2). Chaque thème donne un module « thème » suivi de son atelier.
//
// Second document du module thème (gabarit B2) :
// - thèmes impairs (1, 3, 5, 7, 9, 11) : `b2-<t>-hoeren2`, écoute AUTHENTIQUE (Gesprochene Wikipedia ou Commons), écrite
//   par le lot M2 dans _media.mjs (activité complète, son, transcription et questions, insérée après `b2-<t>-wortschatz`,
//   15 min) : les lots de rédaction ne l'écrivent pas et comptent ces 15 min dans la durée de leur module thème (125 à
//   140 min au total). Tant que _media.mjs ne la fournit pas, l'aperçu signale l'activité manquante : c'est attendu ;
//   - thèmes pairs (2, 4, … 12) : `b2-<t>-lesen2`, écrit par le lot de rédaction (texte adapté de Wikinews CC BY 2.5, ou
//   original).
// La Zwischenbilanz tombe après le module 12 (b2-medien-atelier), qui clôt le 6e thème ; la Probeprüfung suit le module
// 24 (b2-zusammenleben-atelier).
export default {
  order: [
    'b2-lebenswege', 'b2-lebenswege-atelier',
    'b2-arbeitswelt', 'b2-arbeitswelt-atelier',
    'b2-bildung', 'b2-bildung-atelier',
    'b2-gesundheit', 'b2-gesundheit-atelier',
    'b2-wohnen', 'b2-wohnen-atelier',
    'b2-medien', 'b2-medien-atelier',
    'b2-umwelt', 'b2-umwelt-atelier',
    'b2-wirtschaft', 'b2-wirtschaft-atelier',
    'b2-wissenschaft', 'b2-wissenschaft-atelier',
    'b2-gesellschaft', 'b2-gesellschaft-atelier',
    'b2-kultur', 'b2-kultur-atelier',
    'b2-zusammenleben', 'b2-zusammenleben-atelier',
  ],
  // Activités seules (révisions et évaluations en plus) : 12 thèmes × (thème de 125 à 140 min + atelier de 110 à 125 min),
  // soit environ 50 heures, comme le B1. Durée prévue au catalogue ≈ activités + 24 × 15 min de révision + 75 + 150 min.
  minutes: { min: 2950, max: 3100 },
  // Profils audio : b2-debut pour les modules 1 à 8 (débit naturel), b2-suite ensuite (débit naturel, un peu plus vif).
  audio: { debutModules: 8 },
  catalogue: {
    title: 'Allemand B2',
    description: 'Argumenter, nuancer et comprendre des textes complexes.',
    position: 4,
    prerequisiteLevelId: 'b1',
  },
  settings: {
    expectedCompetences: ['lecture', 'ecoute', 'expression-ecrite', 'expression-orale'],
    successCriteria: 'Obtenir au moins 60 % à la Probeprüfung (examen blanc B2), sans compétence sous 30 % : comprendre '
      + 'l’essentiel et les points de vue d’articles, de commentaires et de textes d’information sur des sujets concrets ou '
      + 'abstraits, suivre un exposé, une interview ou un débat en langue standard, rédiger une contribution argumentée et un '
      + 'message formel clairs et nuancés, présenter un exposé structuré et défendre un point de vue dans une discussion.',
    passPercent: 60,
    reviewMinutes: 15,
    midtermMinutes: 75,
    finalMinutes: 150,
  },
  midtermTitle: 'Zwischenbilanz B2: Module 1 bis 12',
  midtermDescription: [
    'Die Zwischenbilanz prüft die erste Hälfte des Kurses: Lebenswege, Arbeitswelt, Bildung, Gesundheit, Wohnen und Medien. [fr?] '
      + 'Ce bilan porte sur la première moitié du parcours : parcours de vie, monde du travail, formation, santé, logement et médias.',
    'Dauer: 75 Minuten. Leseverstehen (20 Min.), Hörverstehen (15 Min.), schriftlicher Ausdruck (25 Min.) und mündlicher Ausdruck '
      + '(15 Min. mit Vorbereitung). [fr?] Durée : 75 minutes. Lecture (20 min), écoute (15 min), expression écrite (25 min) et '
      + 'expression orale (15 min, préparation comprise).',
    'Alle vier Fertigkeiten zählen gleich viel. Die Zwischenbilanz entscheidet nicht über das Bestehen: Sie zeigt, was Sie schon '
      + 'sicher können und was Sie vor der zweiten Hälfte wiederholen sollten. [fr?] Les quatre compétences ont le même poids. Le '
      + 'bilan ne valide rien : il montre ce qui est acquis et ce qu’il faut revoir avant la seconde moitié du parcours.',
  ].join('\n'),
  finalTitle: 'Probeprüfung B2',
  finalDescription: [
    'Die Probeprüfung umfasst den ganzen Kurs B2 und folgt dem Aufbau einer B2-Prüfung, ohne eine offizielle Prüfung zu kopieren. '
      + '[fr?] Cet examen blanc porte sur tout le niveau B2 et suit la structure d’un examen B2, sans copier d’épreuve officielle.',
    'Dauer: 150 Minuten. Leseverstehen (40 Min., zwei Teile), Hörverstehen (30 Min., drei Texte), schriftlicher Ausdruck (55 Min., '
      + 'ein Forumsbeitrag und eine formelle E-Mail) und mündlicher Ausdruck (25 Min. mit Vorbereitung: Vortrag, Diskussion, '
      + 'Rückfrage). [fr?] Durée : 150 minutes. Lecture (40 min, deux parties), écoute (30 min, trois documents), expression '
      + 'écrite (55 min, une contribution à un forum et un courriel formel) et expression orale (25 min, préparation comprise : '
      + 'exposé, discussion, question).',
    'Alle vier Fertigkeiten zählen gleich viel. Bestanden haben Sie mit mindestens 60 % der Punkte, wenn keine Fertigkeit unter '
      + '30 % liegt. [fr?] Les quatre compétences ont le même poids. Pour réussir, il faut au moins 60 % des points, sans '
      + 'compétence sous 30 %.',
  ].join('\n'),
};
