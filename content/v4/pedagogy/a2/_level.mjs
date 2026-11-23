// Niveau A2 de la V4 : ordre des modules et budget de durée des activités (EVO-041).
// Chaque module thématique est suivi de son atelier. Démarches et réparations prolongent le logement ; les connecteurs
// suivent weil et dass vus dans le travail ; les verbes à préposition suivent le datif et les verbes pronominaux des
// relations. Le bilan intermédiaire tombe après le module 10 (a2-arbeit-atelier), qui clôt le thème du travail.
export default {
  order: [
    'a2-reisen', 'a2-reisen-atelier',
    'a2-gesundheit', 'a2-gesundheit-atelier',
    'a2-wohnen', 'a2-wohnen-atelier', 'a2-demarches', 'a2-reparations',
    'a2-arbeit', 'a2-arbeit-atelier',
    'a2-connecteurs',
    'a2-beziehungen', 'a2-beziehungen-atelier', 'a2-verbes-prepositions',
    'a2-kultur', 'a2-kultur-atelier',
    'a2-berlin', 'a2-berlin-atelier',
    'a2-einkaufen', 'a2-einkaufen-atelier',
  ],
  // Rythme intensif A2 : six créneaux de 55 minutes par semaine sur huit semaines, révisions et évaluations comprises.
  minutes: { min: 2050, max: 2200 },
  midtermTitle: 'Bilan intermédiaire A2 : modules 1 à 10',
  midtermDescription: 'Bilan de 40 minutes sur la première moitié du parcours : voyages, santé, logement, démarches et réparations, travail. Lecture (10 min), écoute (10 min), expression écrite (12 min) et expression orale (8 min). Les quatre compétences ont le même poids dans la note.',
};
