// Niveau A1 de la V4 : ordre des modules et budget de durée des activités (EVO-041).
// a1-arbeit passe après a1-alltag-atelier : il réemploie les heures, les jours et l’inversion du verbe vus dans a1-alltag.
// Le bilan intermédiaire tombe ainsi après le module 12 (a1-alltag-atelier), qui clôt le thème de la journée.
export default {
  order: [
    'a1-abc', 'a1-voyelles', 'a1-rythme',
    'a1-hallo', 'a1-hallo-atelier',
    'a1-zahlen', 'a1-zahlen-atelier', 'a1-montants',
    'a1-kurs', 'a1-kurs-atelier',
    'a1-alltag', 'a1-alltag-atelier',
    'a1-arbeit', 'a1-sante',
    'a1-essen', 'a1-essen-atelier',
    'a1-freizeit', 'a1-freizeit-atelier',
    'a1-familie', 'a1-familie-atelier',
    'a1-stadt', 'a1-stadt-atelier', 'a1-transports',
  ],
  // Rythme intensif : environ 2 700 min de capacité sur un mois, dont 320 min de révisions et d’évaluations.
  minutes: { min: 2200, max: 2300 },
};
