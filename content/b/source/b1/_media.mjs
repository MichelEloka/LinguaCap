// Photos libres du niveau B1 (lot M1, plan B §3.2, §3.6 et §3.7) : une photo pour chacune des 12 mises en route
// (`-einstieg`) et 6 photos documentaires, fusionnées dans les modules par build-b.mjs.
// Toutes viennent de Wikimedia Commons (vignette de 960 à 1920 px, téléchargée par infra/content/fetch-libre.mjs dans
// resource-langue/libre/commons/, hors dépôt) ; chaque fichier a son entrée dans content/b/libre/registre.json (auteur,
// licence, adresse, empreintes). Aucune personne identifiable, aucune marque ni logo lisible. Recadrage [x, y, largeur,
// hauteur] en fractions de l'image ; le rendu (render-images.mjs) réduit à 960 × 640 au plus.
// Le texte alternatif décrit l'image en français ; la légende, courte, est en allemand.

/** Photo Commons : média image du module et son support dans une activité. */
const photo = (module, activity, { key, file, title, alt, caption, crop, credit, license, page }) => ({
  module,
  media: {
    key, kind: 'image', title, alt,
    photo: { file: `libre/commons/${file}`, ...(crop ? { crop } : {}) },
    credit: `${credit}, Wikimedia Commons`, license, sourceUrl: `https://commons.wikimedia.org/wiki/File:${page}`,
  },
  placement: { activity, usage: 'illustration', caption },
});

export default [
  // ── Mises en route : une photo par thème ─────────────────────────────────────────────────────────────────────────
  photo('b1-neuanfang', 'b1-neuanfang-einstieg', {
    key: 'b1-neuanfang-einstieg-foto', file: 'neuanfang-umzugskarton.jpg', title: 'Un carton de déménagement',
    alt: 'Un carton de déménagement ouvert, vide, prêt à être rempli, sur un fond clair.',
    caption: 'Ein Umzugskarton: Alles beginnt neu.', crop: [0, 0.17, 1, 0.75],
    credit: 'HornM201', license: 'CC BY-SA 3.0', page: 'Umzugskarton.jpg' }),
  photo('b1-beziehungen', 'b1-beziehungen-einstieg', {
    key: 'b1-beziehungen-einstieg-foto', file: 'beziehungen-kaffee.jpg', title: 'Deux cafés partagés',
    alt: 'Vue de dessus : deux personnes, dont on ne voit que les bras, tiennent chacune une tasse de café noir sur une table ronde en marbre.',
    caption: 'Zeit für einen Kaffee zu zweit',
    credit: 'Joshua Ness (theexplorerdad)', license: 'CC0', page: 'Coffee_Talks_(Unsplash).jpg' }),
  photo('b1-wohnen', 'b1-wohnen-einstieg', {
    key: 'b1-wohnen-einstieg-foto', file: 'wohnen-wohnhaus.jpg', title: 'Un immeuble et sa cour',
    alt: 'La cour intérieure d’un grand immeuble ancien de plusieurs étages, façades en brique jaune et crépi clair, porche au fond.',
    caption: 'Ein Wohnhaus mit Hinterhof in Berlin',
    credit: 'Kvikk', license: 'CC BY-SA 3.0', page: 'Berlin_Prenzlauer_Berg_Greifswalder_Straße_208-Wohnhaus_(09090102).JPG' }),
  photo('b1-arbeit', 'b1-arbeit-einstieg', {
    key: 'b1-arbeit-einstieg-foto', file: 'arbeit-besprechungsraum.jpg', title: 'Une salle de réunion',
    alt: 'Une salle de réunion claire et vide : une longue table, des chaises grises, un tableau blanc au mur et une fenêtre à gauche.',
    caption: 'Hier findet gleich das Vorstellungsgespräch statt.',
    credit: 'Pexels (via Pixabay)', license: 'CC0', page: 'Chairs-2181923.jpg' }),
  photo('b1-gesundheit', 'b1-gesundheit-einstieg', {
    key: 'b1-gesundheit-einstieg-foto', file: 'gesundheit-stethoskop.jpg', title: 'Un stéthoscope',
    alt: 'Un stéthoscope noir posé sur un bureau clair, dans une lumière chaude.',
    caption: 'Beim Arzt: das Stethoskop',
    credit: 'Michael Movchin', license: 'CC BY-SA 3.0', page: 'Stethoskop.jpg' }),
  photo('b1-lernen', 'b1-lernen-einstieg', {
    key: 'b1-lernen-einstieg-foto', file: 'lernen-lesesaal.jpg', title: 'Une salle de lecture',
    alt: 'La salle de lecture d’une bibliothèque municipale : rayonnages de livres sur deux niveaux, tables de travail au fond, sans lecteurs.',
    caption: 'Der Lesesaal einer Stadtbibliothek', crop: [0, 0.06, 1, 0.889],
    credit: 'Bücherknecht', license: 'CC BY-SA 3.0', page: 'Lesesaal_der_Wissenschaftlichen_Stadtbibliothek_Mainz.jpg' }),
  photo('b1-unterwegs', 'b1-unterwegs-einstieg', {
    key: 'b1-unterwegs-einstieg-foto', file: 'unterwegs-zugzielanzeiger.jpg', title: 'Un afficheur de quai',
    alt: 'Un afficheur bleu au-dessus d’un quai de gare : prochain train à 20 h 13 pour Karlsruhe, puis deux autres départs.',
    caption: 'Der Zugzielanzeiger am Gleis', crop: [0, 0.08, 1, 0.885],
    credit: 'Mkkagain', license: 'CC BY-SA 4.0', page: 'Zugzielanzeiger_Kassel-Wilhelmshöhe,_Gleis_1_-_ICE_273_nach_Karlsruhe_Hbf.jpg' }),
  photo('b1-konsum', 'b1-konsum-einstieg', {
    key: 'b1-konsum-einstieg-foto', file: 'konsum-wasserkocher.jpg', title: 'Une bouilloire électrique',
    alt: 'Une bouilloire électrique noire et brillante, avec une fenêtre pour voir le niveau d’eau, sur un fond sombre éclairé par derrière.',
    caption: 'Neu gekauft und schon kaputt?',
    credit: 'Lesekreis', license: 'CC0', page: 'Electric_water_boiler_2014.JPG' }),
  photo('b1-medien', 'b1-medien-einstieg', {
    key: 'b1-medien-einstieg-foto', file: 'medien-mikrofon.jpg', title: 'Un micro de studio',
    alt: 'Gros plan sur un micro de studio de radio, suspendu dans son support élastique, sur fond clair.',
    caption: 'Im Studio vom Lokalradio', crop: [0, 0.2, 1, 0.75],
    credit: 'Kreuzschnabel', license: 'CC BY-SA 3.0', page: 'XLR-microphone.jpg' }),
  photo('b1-umwelt', 'b1-umwelt-einstieg', {
    key: 'b1-umwelt-einstieg-foto', file: 'umwelt-fahrradstaender.jpg', title: 'Des centaines de vélos garés',
    alt: 'Des centaines de vélos garés serrés sur des arceaux, à perte de vue.',
    caption: 'Mit dem Rad statt mit dem Auto',
    credit: 'Aaaatu', license: 'CC BY-SA 4.0', page: 'Bicycle_racks.jpg' }),
  photo('b1-gesellschaft', 'b1-gesellschaft-einstieg', {
    key: 'b1-gesellschaft-einstieg-foto', file: 'gesellschaft-gemeinschaftsgarten.jpg', title: 'Un jardin partagé',
    alt: 'Un jardin partagé en ville : des bacs en bois remplis de légumes et de fleurs, avec la ville et le ciel bleu à l’arrière-plan.',
    caption: 'Ein Gemeinschaftsgarten: Hier gärtnern Nachbarn zusammen.',
    credit: 'Ciara Ní Riain', license: 'CC BY-SA 4.0', page: 'Urban_community_gardens_Aarhus_City_Park_Pier_2_Aarhus_Denmark_3.jpg' }),
  photo('b1-kultur', 'b1-kultur-einstieg', {
    key: 'b1-kultur-einstieg-foto', file: 'kultur-theater.jpg', title: 'La salle d’un théâtre',
    alt: 'La salle d’un théâtre municipal ancien : rideau rouge, balcons dorés et éclairés, fauteuils rouges vides.',
    caption: 'Der Zuschauerraum eines Stadttheaters',
    credit: 'Andreas Praefcke', license: 'CC BY 3.0', page: 'Fürth_Stadttheater_Zuschauerraum.jpg' }),

  // ── Photos documentaires : elles situent un document ou une situation ───────────────────────────────────────────
  photo('b1-wohnen', 'b1-wohnen-hoeren', {
    key: 'b1-wohnen-hoeren-foto', file: 'wohnen-fahrradkeller.jpg', title: 'Un local à vélos',
    alt: 'Un long couloir voûté et blanc où des vélos sont garés de chaque côté, devant une porte en bois au fond.',
    caption: 'Ein Fahrradraum im Keller', crop: [0, 0.1, 1, 0.889],
    credit: 'Willi Heidelbach', license: 'CC BY-SA 3.0', page: 'Fahrradkeller,_Nikolaikloster_-_panoramio.jpg' }),
  photo('b1-gesundheit', 'b1-gesundheit-lesen', {
    key: 'b1-gesundheit-lesen-foto', file: 'gesundheit-tee.jpg', title: 'Une tasse de thé',
    alt: 'Une tasse de thé chaud en verre, sur sa soucoupe, posée sur une table en bois sombre.',
    caption: 'Ein heißer Tee hilft im Winter.', crop: [0, 0.055, 1, 0.889],
    credit: 'Manan Mathur', license: 'CC BY-SA 4.0', page: 'Honey_Tea.JPG' }),
  photo('b1-unterwegs', 'b1-unterwegs-hoeren2', {
    key: 'b1-unterwegs-hoeren2-foto', file: 'unterwegs-bahnhofsuhr.jpg', title: 'Une horloge de gare',
    alt: 'Une horloge de gare ronde et ancienne, à chiffres romains, fixée à un mur blanc sous une voûte.',
    caption: 'Die Bahnhofsuhr',
    credit: 'Geogast', license: 'CC BY-SA 3.0', page: 'Bahnhofsuhr,_Bergbahnhof_Wendelsteinbahn.jpg' }),
  photo('b1-unterwegs-atelier', 'b1-unterwegs-atelier-pruefung', {
    key: 'b1-unterwegs-atelier-pruefung-foto', file: 'unterwegs-anzeige.jpg', title: 'Un afficheur dans une grande gare',
    alt: 'Sous la verrière d’une grande gare, un afficheur bleu indique deux trains au départ du quai ; panneaux de sécurité en dessous.',
    caption: 'Am Bahnsteig: Anzeige und Durchsagen', crop: [0, 0.06, 1, 0.889],
    credit: 'Cuddly Cuddler', license: 'CC0', page: 'Platform_display_in_Munich_Central_Station.jpg' }),
  photo('b1-umwelt-atelier', 'b1-umwelt-atelier-schreiben', {
    key: 'b1-umwelt-atelier-schreiben-foto', file: 'umwelt-mobiler-garten.jpg', title: 'Un jardin mobile sur une place',
    alt: 'Sur une place de quartier pavée, un grand bac en bois planté de verdure, abrité par une toile, avec des arbres autour.',
    caption: 'Ein Projekt im Viertel: ein mobiler Garten',
    credit: 'Singlespeedfahrer', license: 'CC0', page: 'Mobiler_Garten_Admiralstraße_Berlin-Kreuzberg.jpg' }),
  photo('b1-kultur', 'b1-kultur-lesen2', {
    key: 'b1-kultur-lesen2-foto', file: 'kultur-maibaum.jpg', title: 'Un arbre de mai',
    alt: 'Un très haut arbre de mai, mât peint surmonté d’une couronne et d’un petit sapin, au milieu d’une place de village, sous un ciel bleu.',
    caption: 'Ein Maibaum auf dem Dorfplatz', crop: [0, 0.08, 1, 0.75],
    credit: 'Liuthalas', license: 'CC BY-SA 4.0', page: 'Maibaum_Semriach_2020_01.jpg' }),
];
