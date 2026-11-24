// Médias libres du niveau B2 (lot M2, plan B §3.2, §3.6 et §3.7), fusionnés dans les modules par build-b.mjs :
// 1. une photo Commons pour chacune des 12 mises en route (`-einstieg`) ;
// 2. les six écoutes authentiques des thèmes impairs (`b2-<t>-hoeren2`, activité complète insérée après
//    `b2-<t>-wortschatz`, 15 min), avec une photo documentaire chacune.
//
// Photos : vignettes Commons (960 à 1920 px) téléchargées par infra/content/fetch-libre.mjs dans resource-langue/libre/
// commons/ (hors dépôt) ; chaque fichier a son entrée dans content/b/libre/registre.json. Aucune personne identifiable,
// aucune marque lisible (recadrages [x, y, largeur, hauteur] en fractions de l'image). Texte alternatif en français,
// légende courte en allemand.
//
// Écoutes : extraits d'articles de la Wikipédia allemande lus pour la « Gesprochene Wikipedia » (Wikimedia Commons,
// licence lue fichier par fichier : CC BY-SA 3.0). La transcription est le texte exact de la révision lue (lien dans le
// registre). Chaque écoute existe en deux états, choisis automatiquement :
// - ENREGISTREMENT AUTHENTIQUE dès que le fichier figure au registre ET que son extrait est mesuré dans CLIPS
//   ([début, fin] en secondes, 300 s au plus, mesuré par reconnaissance vocale sur l'enregistrement) ;
// - sinon LECTURE DE SYNTHÈSE du même extrait (même texte, mêmes questions), pour que le module reste complet.
// Le 24/11/2026, Commons refusait le téléchargement des originaux à notre client (HTTP 429, politique des agents
// automatiques) : les six enregistrements restent à télécharger (voir le rapport du lot M2) ; CLIPS est donc vide.
import { readFileSync } from 'node:fs';
import { C2, aide, choice, fill } from '../../lib.mjs';

const registered = new Set(JSON.parse(readFileSync(new URL('../../libre/registre.json', import.meta.url), 'utf8')).files.map((file) => file.path));

/** Extraits mesurés sur les enregistrements : [début, fin] en secondes (null tant que l'enregistrement manque). */
const CLIPS = {
  langwasser: null,
  kindheit1: null,
  kindheit2: null,
  taubenberg: null,
  trinkwasser: null,
  wetter: null,
  romantik: null,
};

// ── Photos ───────────────────────────────────────────────────────────────────────────────────────────────────────
const photoMedia = ({ key, file, title, alt, crop, credit, license, page }) => ({
  key, kind: 'image', title, alt,
  photo: { file: `libre/commons/${file}`, ...(crop ? { crop } : {}) },
  credit: `${credit}, Wikimedia Commons`, license, sourceUrl: `https://commons.wikimedia.org/wiki/File:${page}`,
});
/** Photo d'une mise en route : média du module et support dans l'activité. */
const photo = (module, activity, { caption, ...media }) => ({
  module, media: photoMedia(media), placement: { activity, usage: 'illustration', caption },
});

const einstieg = [
  photo('b2-lebenswege', 'b2-lebenswege-einstieg', {
    key: 'b2-lebenswege-einstieg-foto', file: 'lebenswege-koffer.jpg', title: 'Deux valises anciennes sur un quai',
    alt: 'Deux vieilles valises en cuir brun posées sur le quai en bois d’une petite gare, à côté d’un balai de brindilles.',
    caption: 'Koffer gepackt: Wohin führt der Weg?',
    credit: 'Markus G. Klötzer', license: 'CC BY-SA 3.0', page: 'Bahnhof_Dürrenwaid_-_Koffer_(MGK06412).jpg' }),
  photo('b2-arbeitswelt', 'b2-arbeitswelt-einstieg', {
    key: 'b2-arbeitswelt-einstieg-foto', file: 'arbeitswelt-homeoffice.jpg', title: 'Un bureau à domicile',
    alt: 'Un petit bureau blanc devant une fenêtre : une lampe articulée, une plante grasse en pot et le bord d’un ordinateur portable fermé.',
    caption: 'Der Arbeitsplatz zu Hause', crop: [0.4, 0, 0.6, 1],
    credit: 'Tatiana Lapina (veila)', license: 'CC0', page: 'Laptop_and_lamp_on_table_(Unsplash).jpg' }),
  photo('b2-bildung', 'b2-bildung-einstieg', {
    key: 'b2-bildung-einstieg-foto', file: 'bildung-hoersaal.jpg', title: 'Un amphithéâtre vide',
    alt: 'Un amphithéâtre universitaire vide : des rangées de bancs en bois clair montent vers le fond, un pupitre et une table de démonstration au premier plan.',
    caption: 'Ein Hörsaal vor der Vorlesung',
    credit: 'Uni EF', license: 'CC BY-SA 3.0', page: 'Hörsaal_der_Universität_Erfurt.jpg' }),
  photo('b2-gesundheit', 'b2-gesundheit-einstieg', {
    key: 'b2-gesundheit-einstieg-foto', file: 'gesundheit-haengematte.jpg', title: 'Un hamac au bord d’un lac',
    alt: 'Un hamac rouge tendu entre deux pins au bord d’un lac, au milieu des rochers et de la bruyère, sous un ciel clair.',
    caption: 'Abschalten und erholen',
    credit: 'Jarle Hammen Knudsen (dubidubno)', license: 'CC BY 4.0', page: 'Hammock_in_the_wild.jpg' }),
  photo('b2-wohnen', 'b2-wohnen-einstieg', {
    key: 'b2-wohnen-einstieg-foto', file: 'wohnen-baustelle.jpg', title: 'Un chantier entre des immeubles anciens',
    alt: 'Une grue jaune sur un chantier, entre des immeubles anciens à balcons ; au premier plan, des palettes de matériaux et des barrières de chantier.',
    caption: 'Neue Wohnungen mitten in der Stadt',
    credit: 'VSchagow', license: 'CC BY-SA 4.0', page: '2021082501_Baustelle_mit_Kran_Rohbau_Henricistrasse_Ecke_Teichstrasse_2020.jpg' }),
  photo('b2-medien', 'b2-medien-einstieg', {
    key: 'b2-medien-einstieg-foto', file: 'medien-rechenzentrum.jpg', title: 'Les serveurs d’un centre de données',
    alt: 'De longues rangées de serveurs informatiques dans un centre de données, éclairées par des diodes bleues.',
    caption: 'Hier liegen unsere Daten.',
    credit: 'BalticServers.com', license: 'CC BY-SA 3.0', page: 'BalticServers_data_center.jpg' }),
  photo('b2-umwelt', 'b2-umwelt-einstieg', {
    key: 'b2-umwelt-einstieg-foto', file: 'umwelt-windpark.jpg', title: 'Des éoliennes dans un champ de colza',
    alt: 'Plusieurs éoliennes blanches se dressent derrière un champ de colza en fleur, sous un ciel bleu sans nuage.',
    caption: 'Windräder vor dem Dorf',
    credit: 'Kora27', license: 'CC BY-SA 4.0', page: 'Windpark_Bernsdorf-Gersdorf_in_Sachsen_2H1A4559WI.jpg' }),
  photo('b2-wirtschaft', 'b2-wirtschaft-einstieg', {
    key: 'b2-wirtschaft-einstieg-foto', file: 'wirtschaft-secondhand.jpg', title: 'Une friperie',
    alt: 'Dans une friperie, deux longues tringles de vêtements colorés sur cintres, et des sacs à main d’occasion sur l’étagère au-dessus.',
    caption: 'Secondhand statt neu kaufen?', crop: [0.04, 0, 0.96, 1],
    credit: 'MAKY.OREL', license: 'CC BY-SA 4.0', page: 'Clothing_racks_in_second_hand_shop,_Prague.jpg' }),
  photo('b2-wissenschaft', 'b2-wissenschaft-einstieg', {
    key: 'b2-wissenschaft-einstieg-foto', file: 'wissenschaft-mikroskop.jpg', title: 'Un microscope de laboratoire',
    alt: 'Gros plan sur un microscope optique de laboratoire, avec ses deux oculaires et ses objectifs, sur une paillasse.',
    caption: 'Forschung im Labor', crop: [0, 0.04, 0.74, 0.92],
    credit: 'Ajay Kumar Chaurasiya', license: 'CC BY-SA 4.0', page: 'Compound_Microscope_Image.jpg' }),
  photo('b2-gesellschaft', 'b2-gesellschaft-einstieg', {
    key: 'b2-gesellschaft-einstieg-foto', file: 'gesellschaft-wahlurne.jpg', title: 'Une urne électorale',
    alt: 'Le couvercle gris d’une urne électorale, avec sa fente, dans un bureau de vote ; sur la table derrière, des enveloppes et des papiers.',
    caption: 'Wahltag: Jede Stimme zählt.', crop: [0, 0.02, 1, 0.44],
    credit: 'DALIBRI', license: 'CC BY-SA 4.0', page: 'Bundestagswahl_2017_-_Neumarkt_2.jpg' }),
  photo('b2-kultur', 'b2-kultur-einstieg', {
    key: 'b2-kultur-einstieg-foto', file: 'kultur-kinosaal.jpg', title: 'La salle d’un ancien cinéma',
    alt: 'La salle d’un ancien cinéma : des fauteuils au premier plan, une fosse d’orchestre arrondie et une scène aux rideaux tirés, avec une échelle.',
    caption: 'Ein alter Kinosaal mit Bühne',
    credit: 'Tasch Michael', license: 'CC BY-SA 4.0', page: 'Kinosaal_mit_Orchestergraben.JPG' }),
  photo('b2-zusammenleben', 'b2-zusammenleben-einstieg', {
    key: 'b2-zusammenleben-einstieg-foto', file: 'zusammenleben-gartenzaun.jpg', title: 'Une clôture de jardin',
    alt: 'Une haute clôture de jardin blanche, en pointe, sur une butte d’herbe verte ; derrière, on ne voit que le toit d’une maison.',
    caption: 'Gute Zäune, gute Nachbarn?',
    credit: 'Clemens Stockner', license: 'CC BY-SA 3.0', page: 'Suchart_Wannaset_Unser_Gartenzaun_01.jpg' }),
];

// ── Écoutes authentiques ─────────────────────────────────────────────────────────────────────────────────────────
const RF = ['richtig', 'falsch', 'nicht gesagt'];
const RF_PROMPT = aide('Richtig, falsch oder nicht gesagt?', 'Vrai, faux ou non dit ?');
/** « Richtig / falsch / nicht gesagt » d'une écoute : answer = 0, 1 ou 2. */
const rf = (id, statement, answer, explanation) => choice(id, `„${statement}“ ${RF_PROMPT}`, RF.map((label, index) => [label, index === answer]), explanation);

/** Abréviations après lesquelles une phrase ne s'arrête pas (« z. B. », « e. V. », « bzw. »). */
const ABBREVIATION = /(?:\b[a-zA-Z]|\bbzw|\bca|\bNr)\.$/;
/** Phrases d'un paragraphe : coupure après « . ! ? » suivis d'une espace et d'une majuscule, jamais dans « 40.000 » ni après une abréviation. */
function sentencesOf(block) {
  const pieces = block.split(/(?<=[.!?][“"]?)\s+(?=[A-ZÄÖÜ„])/);
  const sentences = [];
  for (const piece of pieces) {
    if (sentences.length && ABBREVIATION.test(sentences[sentences.length - 1])) sentences[sentences.length - 1] += ` ${piece}`;
    else sentences.push(piece);
  }
  return sentences.map((sentence) => `${sentence} `);
}

/** Lignes d'une lecture de synthèse : intertitres seuls, paragraphes coupés en phrases groupées (320 caractères au plus). */
function synthLines(text, voice, say) {
  const lines = [];
  for (const block of text.split('\n')) {
    if (!block.trim()) continue;
    const sentences = sentencesOf(block);
    let current = '';
    for (const sentence of sentences) {
      if (current && (current + sentence).length > 320) { lines.push(current.trim()); current = ''; }
      current += sentence;
    }
    if (current.trim()) lines.push(current.trim());
    lines.push(null); // fin de bloc : courte pause
  }
  const script = [];
  for (const line of lines) {
    if (line === null) { if (script.length && !('pause' in script[script.length - 1])) script.push({ pause: 0.6 }); continue; }
    const spoken = say.reduce((value, [from, to]) => value.split(from).join(to), line);
    script.push({ voice, text: line, ...(spoken !== line ? { say: spoken } : {}) });
  }
  while (script.length && 'pause' in script[script.length - 1]) script.pop();
  return script;
}

/**
 * Son d'une écoute : l'enregistrement de la Wikipédia parlée s'il est au registre et mesuré (CLIPS), sinon la lecture
 * de synthèse du même texte (même clé).
 */
function reading({ key, clip, file, title, text, speaker, article, oldid, commons, voice, say = [] }) {
  const path = `libre/commons/${file}`;
  if (clip && registered.has(path)) {
    return { native: true, media: { key, kind: 'audio', title, native: { file: path, clip }, transcript: text,
      credit: `Lecture : ${speaker} ; texte : article « ${article} » de la Wikipédia en allemand, Wikimedia Commons`,
      license: 'CC BY-SA 3.0', sourceUrl: `https://commons.wikimedia.org/wiki/File:${commons}` } };
  }
  return { native: false, media: { key, kind: 'audio', title, script: synthLines(text, voice, say),
    credit: `Texte : article « ${article} » de la Wikipédia en allemand (révision ${oldid}), lu par une voix de synthèse`,
    license: 'CC BY-SA 3.0', sourceUrl: `https://de.wikipedia.org/w/index.php?oldid=${oldid}` } };
}

/** Présentation du document selon l'état (enregistrement ou synthèse). */
const source = (native, article, year, voiceDe, voiceFr) => (native
  ? aide(`Sie hören einen Ausschnitt aus dem Wikipedia-Artikel „${article}“ (Fassung von ${year}), vorgelesen von einem Mitglied der „Gesprochenen Wikipedia“.`,
    `Vous entendez un extrait de l’article Wikipédia « ${article} » (version de ${year}), lu par un bénévole de la « Wikipédia parlée ».`)
  : aide(`Sie hören einen Ausschnitt aus dem Wikipedia-Artikel „${article}“ (Fassung von ${year}), vorgelesen von ${voiceDe}.`,
    `Vous entendez un extrait de l’article Wikipédia « ${article} » (version de ${year}), lu par ${voiceFr}.`));

/** Écoute authentique complète : activité insérée après -wortschatz, sons et photo documentaire. */
function hoeren2({ module, title, intro, glossary, strategy, readings, photo: picture, questions }) {
  const activity = `${module}-hoeren2`;
  const native = readings.every((item) => item.native);
  const description = [
    C2.hoeren, '',
    'ORIGINALTEXT', '[fr?] Document authentique',
    intro(native), '',
    'WICHTIGE WÖRTER', '[fr?] Mots utiles',
    ...glossary.map(([de, fr]) => `• ${aide(de, fr)}`), '',
    'STRATEGIE', '[fr?] Stratégie',
    ...strategy.map(([de, fr]) => aide(de, fr)),
    aide('Die Transkription sehen Sie nach Ihren Antworten.', 'Vous verrez la transcription après vos réponses.'),
  ].join('\n');
  return [
    { module, after: `${module}-wortschatz`, activity: {
      id: activity, kind: 'exercise', title, estimatedMinutes: 15, competences: ['ecoute'],
      lesson: { description },
      placements: [
        ...readings.map((item) => ({ media: item.media.key, usage: 'audio', transcriptVisibility: 'after_answer', ...(item.caption ? { caption: item.caption } : {}) })),
        { media: picture.key, usage: 'illustration', caption: picture.caption },
      ],
      questions,
    } },
    { module, media: [...readings.map((item) => item.media), photoMedia(picture)] },
  ];
}

// 1 · Lebenswege : Langwasser (Nuremberg), quartier des nouveaux départs après 1945.
const langwasser = reading({ key: 'b2-lebenswege-hoeren2-audio', clip: CLIPS.langwasser, file: 'gw-langwasser.ogg',
  title: 'Wikipédia parlée — Langwasser (extrait)', article: 'Langwasser', oldid: 82163005, commons: 'De-Langwasser-article.ogg',
  speaker: 'Gesprochene Wikipedia (2010)', voice: 'sprecher',
  say: [['1949', 'neunzehnhundertneunundvierzig'], ['1954', 'neunzehnhundertvierundfünfzig'], ['1960', 'neunzehnhundertsechzig'], ['1950', 'neunzehnhundertfünfzig'],
    ['1956', 'neunzehnhundertsechsundfünfzig'], ['1957', 'neunzehnhundertsiebenundfünfzig'], ['1990er', 'neunzehnhundertneunziger'], ['1955', 'neunzehnhundertfünfundfünfzig'],
    ['40.000', 'vierzigtausend'], ['40-jährigen', 'vierzigjährigen'], ['WBG', 'W B G']],
  text: `Die Nachkriegszeit
Die eigentliche Stadtteilgeschichte von Langwasser beginnt nach dem Zweiten Weltkrieg 1949. Für zehn Jahre waren Teile des Geländes eine Mischung von Flüchtlingslagern, ersten Wohnsiedlungen und Bauresten der Reichsparteitage. Am bekanntesten war das Valka-Lager, eine Art Übergangslager für Ausländer, die auf Auswanderung oder einen Neuanfang in Deutschland warteten. Von 1954 bis 1960 war das Valka-Lager das Bundessammellager für Ausländer und damit der Vorläufer für die zentrale Anlaufstelle für Asylsuchende (später in Zirndorf) und das spätere Bundesamt für die Anerkennung ausländischer Flüchtlinge (heute: Bundesamt für Migration und Flüchtlinge) in Nürnberg. Die ersten Wohnsiedlungen entstanden um 1950. Viele deutsche Vertriebene, vor allem aus Schlesien und aus dem Sudetenland, fanden in Langwasser eine neue Heimat.
Die Neuzeit
Die Neuzeit Langwassers beginnt mit dem Entschluss der Stadt Nürnberg zu einer koordinierten Bebauung auf dem Gelände unter dem Motto „Wohnen im Grünen“. Ein Architekturwettbewerb wird 1956 abgeschlossen, 1957 beginnt dann der Aufbau des neuen Stadtteils, der erst Ende der 1990er Jahre in den Grundzügen abgeschlossen wurde.
Architektur
Die ersten festen Steinhäuser wurden im Westen Langwassers in den ersten Jahren nach dem Zweiten Weltkrieg unter Verwendung von Mitteln aus dem Marshallplan errichtet. Die Stadt Nürnberg und ihre Wohnungsbaugesellschaft WBG schrieben dann 1955 einen Architekturwettbewerb für eine auf 40.000 Einwohner konzipierte Neustadt aus. Aus dem Wettbewerb gingen Franz Reichel als Architekt zusammen mit dem Landschaftsplaner Hermann Thiele als Sieger hervor.
Die Grundstrukturen seines Entwurfs sind bis heute erhalten und waren Vorbild für viele städtebauliche Entwicklungen in der Folgezeit. So gehörten zu den Grundideen die Erschließung von Wohngebieten nur noch durch Stichstraßen, durchziehende Grüngürtel und die Versorgung der Bevölkerung durch Einkaufszentren. Wohn- und Gewerbegebiete blieben zwar räumlich getrennt, jedoch war die Grundidee „Wohnen und Arbeiten“ im Stadtteil. Die Gebäudearchitektur dagegen war stets dem Wandel der Zeiten unterzogen, so dass sich in der etwa 40-jährigen Hauptbebauungsphase recht gut die neuzeitliche Entwicklung deutschen Städtebaus nachverfolgen lässt.` });

// 3 · Bildung : enfance, école et parcours au Moyen Âge (deux extraits de l'article « Kindheit »).
const KINDHEIT = { file: 'gw-kindheit.ogg', article: 'Kindheit', oldid: 114757883, commons: 'De-Kindheit-article.ogg', speaker: 'Footox', voice: 'sprecherin' };
const kindheit1 = { ...reading({ ...KINDHEIT, key: 'b2-bildung-hoeren2-teil1', clip: CLIPS.kindheit1,
  title: 'Wikipédia parlée — Kindheit, partie 1 : les étapes de l’enfance',
  say: [['puertia', 'pueritia']],
  text: `Die Kindheit teilte sich im Mittelalter generell in drei Phasen: infantia, puertia und adolescentia. Jede dauerte ungefähr sieben Jahre. Die ersten sieben Jahre verbrachte der Nachwuchs zuhause. Sie sind am ehesten mit heutigen Vorstellungen von Kindheit zu vergleichen. Die Kleinen wurden zuhause von ihren Eltern erzogen und noch weitgehend aus den häuslichen Pflichten herausgehalten.
Mit sieben Jahren stand die endgültige Entscheidung an, ob der Sohn einen kirchlichen oder weltlichen Weg einschlagen sollte. In jedem Fall stand mit sieben der Beginn der Schulzeit oder Ausbildung an. Auch in den Waisenhäusern ließ man Kindern bis zum siebten Lebensjahr Fürsorge zuteilwerden. Mit sieben waren sie dann aber auf sich alleine gestellt. In vielen Bauern- oder Handwerkerfamilien war es allerdings auch schon mit vier bis fünf Jahren für Kinder an der Tagesordnung, ihre Mutter bei den täglichen Pflichten zu entlasten. Ab dem siebten Lebensjahr übernahm dann der Vater die Ausbildung seiner Söhne. Töchter wurden in der Regel auf das Führen des Haushalts hin ausgebildet. Allerdings gab es gerade in jungen Jahren sehr viele Tätigkeiten, die Jungen wie Mädchen gleichermaßen zu verrichten hatten. Später mussten schließlich auch die Frauen auf dem Feld mitarbeiten.` }), caption: 'Teil 1: Kindheit in drei Phasen' };
const kindheit2 = { ...reading({ ...KINDHEIT, key: 'b2-bildung-hoeren2-teil2', clip: CLIPS.kindheit2,
  title: 'Wikipédia parlée — Kindheit, partie 2 : écoles et couvents',
  say: [['13. Jahrhundert', 'dreizehnten Jahrhundert'], ['16. Lebensjahr', 'sechzehnten Lebensjahr']],
  text: `Schulen waren im frühen Mittelalter private Einrichtungen, für die Schulgeld bezahlt werden musste. Dorfpfarrer gaben gewöhnlich aber ein bis zwei begabten Kindern kostenlosen Unterricht. Zum Ausgleich waren die Kinder zu Ministrantendiensten in der Kirche oder zur Haushaltshilfe bei ihrem Lehrer verpflichtet. Unterrichtssprache war zunächst Latein. Erst ab dem 13. Jahrhundert kam Unterricht in Volkssprache auf. Mit dem dritten und vierten Laterankonzil erleichterte sich zudem der Zugang zu kirchlichen Schulen. Kindern ärmerer Familien wurde das Schulgeld erlassen. Unterrichtsinhalt war Lesen, Schreiben und ein wenig Mathematik. Begabte Schüler oder solche von reichen Familien konnten nach der Elementarschule höhere Lateinschulen besuchen. Ziel war hier vor allem das flüssige Erlernen der Gelehrtensprache Latein. Erst ab dem 16. Lebensjahr war der Besuch einer Hochschule üblich. Dies war aber nur sehr wenigen vorbehalten.
Neben der weltlichen war auch eine kirchliche Laufbahn für Kinder möglich. Vor allem reiche und adlige Familien gaben häufig eines oder mehrere ihrer Kinder in ein Kloster. Dafür wurden vor allem Jungen ausgewählt, die zu schwach für eine Ritterausbildung erschienen. Oft waren es auch jüngere Geschwister, die keine Aussicht mehr auf einen Teil des Erbes hatten. Auch Mädchen wurden ins Kloster gegeben, wenn sie nicht für eine Heirat vorgesehen waren. Für solche Novizinnen mussten die Eltern eine Mitgift zahlen. Sie fiel aber kleiner aus als bei einer Eheschließung. Auch die Ausbildung zum Priester blieb meist den Sprösslingen des Adels oder der städtischen Bevölkerung vorbehalten. Schon mit sieben Jahren konnten Kinder die ersten, niederen Weihen empfangen.` }), caption: 'Teil 2: Schule und Kloster' };

// 5 · Wohnen : une cité de la crise de 1929 (Stadtrandsiedlung Am Taubenberg, Radeberg).
const taubenberg = reading({ key: 'b2-wohnen-hoeren2-audio', clip: CLIPS.taubenberg, file: 'gw-stadtrandsiedlung-taubenberg.ogg',
  title: 'Wikipédia parlée — Stadtrandsiedlung Am Taubenberg (extrait)', article: 'Stadtrandsiedlung Am Taubenberg', oldid: 124460261,
  commons: 'De-Stadtrandsiedlung_am_Taubenberg-article.ogg', speaker: 'Anhezu', voice: 'sprecher',
  say: [['1929', 'neunzehnhundertneunundzwanzig'], ['1931', 'neunzehnhunderteinunddreißig'], ['1932', 'neunzehnhundertzweiunddreißig'],
    ['1933/34', 'neunzehnhundertdreiunddreißig und vierunddreißig'], ['1936/37', 'neunzehnhundertsechsunddreißig und siebenunddreißig'],
    ['1937/38', 'neunzehnhundertsiebenunddreißig und achtunddreißig'], ['1940', 'neunzehnhundertvierzig'], [' 24 ', ' vierundzwanzig '], ['NSDAP', 'N S D A P'], ['2000er', 'Zweitausender']],
  text: `Vorgeschichte
Durch die 1929 einsetzende Weltwirtschaftskrise kam es zu Schließungen zahlreicher Unternehmen, welche zu einer hohen Arbeitslosigkeit führten. In vielen deutschen Städten wurden daraufhin sogenannte Stadtrandsiedlungen errichtet. Diese Wohngebiete schufen zum einen Arbeit und Unterkünfte für die von der Krise betroffene Bevölkerung, zum anderen waren sie so angelegt, dass sie sich durch eigene Gärten und Kleintierhaltung selbst mit Nahrungsmitteln versorgen konnten. Da die Krise auch in Radeberg zu einer hohen Arbeitslosenquote führte, welche die Wohn- und Versorgungslage im Stadtgebiet drastisch verschlechterte, gab es 1931 die ersten konkreten Pläne zum Bau einer solchen Siedlung. Nachdem die Bedenken der Stadt bezüglich der Finanzierung und die Widersprüche der Bewohner angrenzender Gebiete geklärt waren, wurde 1932 der Bau der Siedlung am Taubenberg beschlossen.
Baugeschichte
Um die Wohnflächen in der Siedlung (Siedlerstellen) mussten sich alle Interessenten bewerben und nachweisen, dass sie dem Bau oder dem Leben in der künftigen Ortslage nützlich sein würden. Wie bei Stadtrandsiedlungen üblich, wurden die Arbeiten an den Gebäuden und Grundstücken ausschließlich von einheimischen Handwerkern, die später auch Bewohner der Siedlung wurden, ausgeführt. Um die Qualität der Arbeit entsprechend hoch zu halten und zu verhindern, dass die Handwerker nur auf ihrer eigenen Parzelle ordentlich arbeiteten, wurden die Grundstücke erst nach ihrer Fertigstellung per Losverfahren verteilt.
Die Siedlung wurde in fünf Bauabschnitten errichtet. Als sechster Bauabschnitt gilt der Wiederauf- und Ausbau nach dem Zweiten Weltkrieg bis in die 2000er Jahre. Im ersten Bauabschnitt wurden Ende 1932 zehn Doppelhäuser errichtet. Die lokale Radeberger Zeitung bezeichnete die neuen Häuser angesichts ihrer kargen Ausstattung und geringen Größe abschätzig als Hundehütten. Im zweiten Bauabschnitt wurden 1933/34 sieben weitere Doppelhäuser erbaut. Mit der Machtergreifung der NSDAP änderte sich die Auffassung des typischen Siedlers. Der weitere Ausbau sollte vor allem der Verhinderung der Landflucht dienen und billigsten Wohnraum schaffen. Im dritten Bauabschnitt wurden 1936/37 zwölf Siedlerstellen geschaffen, im vierten Bauabschnitt folgten 1937/38 24 weitere. Der fünfte Bauabschnitt, welcher ab 1940 in Planung war, wurde aufgrund des Zweiten Weltkriegs nicht realisiert. In den Monaten vor und nach dem Ende des Kriegs wurden auf der vorgesehenen Fläche mit einfachsten Mitteln und Baustoffen provisorische Behelfsheime und ein Gemeinschaftshaus erbaut.` });

// 7 · Umwelt : l'eau potable, consommation et qualité.
const trinkwasser = reading({ key: 'b2-umwelt-hoeren2-audio', clip: CLIPS.trinkwasser, file: 'gw-trinkwasser.ogg',
  title: 'Wikipédia parlée — Trinkwasser (extrait)', article: 'Trinkwasser', oldid: 152370829, commons: 'De-Trinkwasser-article.ogg',
  speaker: 'Gesprochene Wikipedia (2016)', voice: 'sprecherin',
  say: [['60 kg', 'sechzig Kilogramm'], ['10 kg', 'zehn Kilogramm'], ['140 bis 160', 'hundertvierzig bis hundertsechzig'], ['e. V. (BDEW)', 'eingetragener Verein, B D E W,'],
    ['1990', 'neunzehnhundertneunzig'], ['Jahr 2011', 'Jahr zweitausendelf'], ['Stand 2011', 'Stand zweitausendelf'], ['122', 'hundertzweiundzwanzig'], ['260', 'zweihundertsechzig'],
    ['500', 'fünfhundert'], ['WHO', 'W H O']],
  text: `Wasserbedarf
Der Wasserbedarf des Menschen variiert je nach körperlicher Verfassung, Körpermasse, Aktivität und Klima. Der Mensch nimmt Wasser in Form von Getränken und Speisen zu sich und gibt es mit Urin, Kot, Schweiß und Atemluft ab. Wasser entsteht im Körper auch beim oxidativen Abbau von organischen Nahrungsstoffen.
Die WHO gibt bei „hohem Bedarf“ eine Trinkwasserbedarfsschätzung von etwa zwei Litern je Tag für einen 60 kg schweren Erwachsenen und von einem Liter für ein Kind mit 10 kg Körpergewicht an. Allerdings weisen neuere Studien darauf hin, dass der Flüssigkeitsbedarf auch durch ausreichenden Verzehr von Getränken wie etwa Saft, Milch oder auch Kaffee gedeckt werden kann und individuell stark variiert.
Leitungswasser wird auch für andere Zwecke, wie Wäschewaschen, Toilettenspülung, Körper-, Geschirr- und Wohnungsreinigung verwendet. In den letzten Jahrzehnten wurde mit einem Verbrauch an Trinkwasser von 140 bis 160 Liter pro Tag und Einwohner gerechnet. Der Pro-Kopf-Verbrauch von Trinkwasser ist in Deutschland laut einer Statistik des Bundesverbands der Energie- und Wasserwirtschaft e. V. (BDEW) durch einen bewussten Umgang mit Wasser seit 1990 beinahe kontinuierlich gesunken. Im Jahr 2011 verbrauchten die Bundesbürger durchschnittlich 122 Liter Wasser je Tag und Einwohner (Stand 2011).
In anderen Ländern ist der Verbrauch teilweise weitaus höher, der Verbrauch in Italien wird mit 260 Litern pro Tag und Einwohner angegeben und die Wüstenstadt Dubai zählt sogar mit 500 Litern je Tag und Kopf zu den Spitzenreitern und strebt bei der dortigen Herstellung des Trinkwassers durch Meerwasserentsalzung eine notwendige Verbrauchssenkung an.
Qualität des Trinkwassers
In Deutschland, Österreich, der Schweiz, Frankreich und den Niederlanden ist Trinkwasser das am intensivsten kontrollierte Lebensmittel und damit zum Verzehr uneingeschränkt geeignet.
Probleme bei der Qualität des Trinkwassers aus Grundwasser können in der Regel durch die ordnungsgemäße Ausweisung von Schutzgebieten vermieden werden. Teilweise ist die Unterschutzstellung in Gebieten mit intensiver konventioneller landwirtschaftlicher Nutzung jedoch nicht ausreichend. Insbesondere durch zu starke Gülledüngung oder durch alte Kläranlagen und den dadurch verursachten Nitrateintrag in das Grundwasser kann das daraus gewonnene Trinkwasser für Säuglinge und Kleinkinder gefährlich sein. In diesen Fällen muss der Wasserversorger die Nitratkonzentration durch Aufbereitung, tiefere Brunnen und Kooperationen mit der Landwirtschaft senken.` });

// 9 · Wissenschaft : la fiabilité des prévisions météo.
const wetter = reading({ key: 'b2-wissenschaft-hoeren2-audio', clip: CLIPS.wetter, file: 'gw-wettervorhersage.ogg',
  title: 'Wikipédia parlée — Wettervorhersage (extrait)', article: 'Wettervorhersage', oldid: 38550168, commons: 'De-Wettervorhersage-article.ogg',
  speaker: 'philip.haeusser', voice: 'sprecher',
  say: [['24-Stunden-Vorhersage', 'Vierundzwanzig-Stunden-Vorhersage'], ['3 Tage', 'drei Tage'], ['75%', 'fünfundsiebzig Prozent'], ['4 bis 7 Tage', 'vier bis sieben Tage'],
    ['z.B.', 'zum Beispiel'], ['z. B.', 'zum Beispiel'], ['60-75 %', 'sechzig bis fünfundsiebzig Prozent'], ['1-3 Stunden', 'ein bis drei Stunden'], ['80 bis 90', 'achtzig bis neunzig'],
    ['50 bis 70', 'fünfzig bis siebzig'], ['wird’s', 'wird es'], ['bzw.', 'beziehungsweise'], ['• ', '']],
  text: `Verlässlichkeit
Heute ist eine Prognose für die kommende Woche ungefähr so zuverlässig, wie sie es vor dreißig Jahren für den nächsten Tag war. Die 24-Stunden-Vorhersage erreicht eine Eintreffgenauigkeit von gut neunzig Prozent. Die Treffsicherheit für die kommenden 3 Tage beträgt etwas mehr als 75%.
Teilweise ist die Wettervorhersage nicht so verlässlich, wie die Allgemeinheit und verschiedene Fachgebiete es sich wünschen. Dies hängt vor allem mit drei Ursachen zusammen:
• der unvollständigen Kenntnis des tatsächlichen Geschehens in der Erdatmosphäre (unvollständige Daten bzw. aus einem zu weitmaschigen Netz)
• dem chaotischen (nicht vorhersehbaren) Anteil im Wettergeschehen
• der (noch immer) unzureichenden Genauigkeit der rechnerischen Modelle: aus Gründen der Rechenzeit und der großen anfallenden Datenmengen können die beteiligten Luft- und Wassermassen noch nicht mit zufriedenstellender Genauigkeit berücksichtigt werden. Es spielen zu viele einzelne Faktoren eine Rolle, deren Zusammenspiel man bis dato und auch in näherer Zukunft nicht vollständig analysieren kann.
Daher machen lokale Einflüsse wie Gebirge und ihre unregelmäßig geformten Hänge, Effekte unterschiedlicher Einstrahlung durch „falsch“ berechnete Bewölkung, der Bewuchs (Wald zu Acker!) oder das Gestein so viel aus, dass die Treffsicherheit für die nächsten 4 bis 7 Tage erheblich sinkt. Keine der heute verwendeten Methoden reicht über zwanzig Tage in die Zukunft hinaus, so dass längere Vorhersagen, z. B. saisonale Wetterprognosen, nur noch unseriös sind und von den meisten Wetterberichterstattungen im Fernsehen und Radio auch gemieden werden.
Die Theorie der Meteorologie ist zwar durch die Gasgesetze, die Thermodynamik und die Strömungslehre weitgehend geklärt, kann aber durch kleinräumige Effekte von bis zu Kilometer-Dimensionen nicht alle Luftbewegungen mit ausreichender Genauigkeit berechnen. So kann beispielsweise an einem sonnigen Tag die Temperatur über dunklen und hellen Flächen um mehrere Grad differieren, ähnliches tritt zwischen Sonnenseite und Schattenseite eines Gebirgskammes auf oder zwischen Gewässern und festem Boden.
Prognosen durch Laien
Bis zu gewissem Maß kann auch ein erfahrener Laie eine Prognose für seine Umgebung erstellen, die jener eines ganzen Bundeslandes an lokaler Verlässlichkeit gleichkommt. Wer das erlernen will, findet im Buchhandel kurzgefasste Anleitungen zur Deutung von Temperatur und Luftdruck und zur Beobachtung von Wind und Wolken – die viel über die horizontalen und vertikalen Luftbewegungen erkennen lassen. Neben Thermometer und Barometer braucht man dazu nur eine „gesunde Beobachtungsgabe“ – denn Wind und Art der Wolken sagen fast alles über die horizontalen und vertikalen Luftbewegungen. Doch auch „einfache Wetterstationen“ für den Schreibtisch plus Außenfühler können programmierte Prognosen mit 60-75 % Zutreffenswahrscheinlichkeit abgeben.
Für die nächsten 1-3 Stunden kann man – z. B. bei der Frage nach örtlichem Regen, klarem Sternhimmel oder Eintreten von Frost – auf 80 bis 90 Prozent kommen. Selbst die einfachste aller Prognosen – heute wird’s so wie gestern – trifft in Mitteleuropa zu 50 bis 70 Prozent zu. Deshalb kann eine nähere Nachfrage bei einem Wetterdienst, etwa von einem Landwirt oder einer Versicherung bei Gewitterlagen, immer eine höhere Trefferquote bringen als das „einheitliche Fernsehwetter für ein ganzes Bundesland“.` });

// 11 · Kultur : le romantisme, origine du mot et idées-forces.
const romantik = reading({ key: 'b2-kultur-hoeren2-audio', clip: CLIPS.romantik, file: 'gw-romantik.ogg',
  title: 'Wikipédia parlée — Romantik (extrait)', article: 'Romantik', oldid: 24274899, commons: 'De-Romantik-article.ogg',
  speaker: 'Gesprochene Wikipedia (2006)', voice: 'sprecherin',
  say: [['1790–1840', 'siebzehnhundertneunzig bis achtzehnhundertvierzig'], ['1795–1848', 'siebzehnhundertfünfundneunzig bis achtzehnhundertachtundvierzig'],
    ['1800–1940', 'achtzehnhundert bis neunzehnhundertvierzig'], ['z. B.', 'zum Beispiel']],
  text: `Romantik bezeichnet eine kulturgeschichtliche Epoche, die sich insbesondere auf den Gebieten der bildenden Kunst (1790–1840), der Literatur (1795–1848) sowie der Musik (1800–1940) äußert.
Im heutigen, allgemeinen Sprachgebrauch bezeichnet der Begriff Romantik mit dem Adjektiv romantisch die Eigenschaft einer Sache, das Herz mit Liebe und Sehnsucht zu erfüllen, z. B. in „romantische Liebe“, „romantische Musik“ oder „ein romantischer Brief“. Oft wird der Begriff synonym zu Kitsch gebraucht. Das hat jedoch mit der kulturgeschichtlichen Epoche nichts gemein.
Etymologie
Der Begriff kommt ursprünglich von „in lingua romana“, in romanischer Sprache, also in den entsprechenden Ländern in der Volkssprache verfassten Schriften. Sie bildeten den Gegensatz zu den zuvor üblichen, „in lingua latina“ (Latein) geschriebenen Schriften. Aus „lingua romana“ entstand der Ausdruck „Roman“, der aus dem Französischen auch zu uns kam und zu romantisch wurde.
Romantik bedeutet somit Abwendung von der Antike und von klassischen Vorbildern. Das heißt, romantische Autoren erschließen sich Themen aus ihrer eigenen Kultur und Geschichte und wenden sich ab von klassischen Formen, was die Vorliebe für fragmentarische Schreibweise erklärt. Die Hinwendung zur eigenen Kultur bedeutet zugleich eine stärkere Hinwendung zur Sagen- und Mythenwelt des Mittelalters.
Die Vertreter der an der Antike orientierten Klassik fühlten sich vor allem durch die Zeitschriften der Romantiker massiv angegriffen und bezeichneten deren Literatur als fantastisch oder sogar als krankhaft.
Die Grundsteine des Romantismus sind Gefühl, Individualität (individuelles Erlebnis) und Seele (vor allem psychisch gequälte Seele). Romantismus entstand als Reaktion auf das Monopol der vernunftgerichteten Philosophie der Aufklärung, der Strenge des durch die Antike inspirierten Klassizismus. Seine Anstöße suchte er in der Vergangenheit (vor allem im Mittelalter) und exotischen Ländern. Im Vordergrund stehen irrationale Gefühle, die Sehnsucht zu Versuchen und Erfahren, das Mysterium und das Geheimnis.` });

const listening = [
  ...hoeren2({ module: 'b2-lebenswege', title: 'Verstehen: ein Stadtteil für Neuanfänge (Originaltext)', readings: [langwasser],
    intro: (native) => [source(native, 'Langwasser', 2010, 'einer synthetischen Stimme', 'une voix de synthèse'),
      aide('Langwasser ist ein Stadtteil von Nürnberg. Nach 1945 kamen dort Flüchtlinge, Vertriebene und Menschen aus vielen Ländern an.', 'Langwasser est un quartier de Nuremberg. Après 1945, des réfugiés, des expulsés et des personnes venues de nombreux pays y sont arrivés.')].join('\n'),
    glossary: [['die Vertriebenen (Plural)', 'les Allemands expulsés de l’Est après 1945'], ['das Übergangslager', 'le camp de transit'],
      ['der Neuanfang', 'le nouveau départ'], ['der Architekturwettbewerb', 'le concours d’architecture'], ['die Stichstraße', 'l’impasse de desserte']],
    strategy: [['Beim ersten Hören: Welche Zeitabschnitte unterscheidet der Text?', 'Première écoute : quelles périodes le texte distingue-t-il ?'],
      ['Beim zweiten Hören achten Sie auf Jahreszahlen und Zahlen.', 'À la deuxième écoute, soyez attentif aux dates et aux nombres.']],
    photo: { key: 'b2-lebenswege-hoeren2-foto', file: 'lebenswege-langwasser.jpg', title: 'Le quartier de Langwasser à Nuremberg',
      alt: 'Vue plongeante sur Langwasser : des immeubles de quatre à dix étages entourés d’arbres, une rue bordée de voitures, la forêt à l’horizon.',
      caption: 'Nürnberg-Langwasser heute', credit: 'AndiGWehre (Wikipédia en allemand)', license: 'Domaine public', page: 'Nurnberg_Langwasser_(bild1).jpg' },
    questions: [
      fill('q1', C2.notizen,
        'Nach 1949: Flüchtlingslager, erste [[1]] und Baureste · Valka-Lager: Ausländer warteten auf [[2]] oder einen Neuanfang · erste Wohnsiedlungen: um [[3]] · Vertriebene vor allem aus Schlesien und dem [[4]] · Motto der neuen Bebauung: „Wohnen im [[5]]“ · Neustadt geplant für [[6]] Einwohner',
        [['Wohnsiedlungen', 'Siedlungen'], ['Auswanderung', 'die Auswanderung'], ['1950', 'neunzehnhundertfünfzig'], ['Sudetenland'], ['Grünen'], ['40.000', '40000', '40 000', 'vierzigtausend']],
        aide('Die Zahlen und Namen werden genau so genannt: „ersten Wohnsiedlungen“, „auf Auswanderung oder einen Neuanfang“, „um 1950“, „aus Schlesien und aus dem Sudetenland“, „Wohnen im Grünen“, „auf 40.000 Einwohner konzipierte Neustadt“.',
          'Les informations sont dites telles quelles dans le texte ; « Wohnen im Grünen » signifie « habiter dans la verdure ».')),
      choice('q2', aide('Welche Aufgabe hatte das Valka-Lager?', 'Quelle était la fonction du camp de Valka ?'),
        [['Es war die erste Wohnsiedlung der Vertriebenen.'], ['Es lagerte Baumaterial aus der Zeit vor dem Krieg.'],
          ['Es nahm Ausländer auf, die auf ihre Zukunft warteten.', true], ['Es war der Sitz der neuen städtischen Wohnungsbaugesellschaft.']],
        aide('Das Valka-Lager war „eine Art Übergangslager für Ausländer, die auf Auswanderung oder einen Neuanfang in Deutschland warteten“. Die Vertriebenen fanden dagegen in den neuen Wohnsiedlungen eine Heimat.',
          'Le camp de Valka était un camp de transit pour des étrangers en attente d’émigration ou d’un nouveau départ en Allemagne ; les expulsés, eux, se sont installés dans les nouvelles cités.')),
      choice('q3', aide('Was wurde später aus der Aufgabe des Valka-Lagers?', 'Que sont devenues plus tard les missions du camp de Valka ?'),
        [['Sie ging später an die Stadtverwaltung von Nürnberg über.'], ['Aus ihr entstand eine Bundesbehörde für Flüchtlinge.', true],
          ['Sie endete 1957 mit dem Bau des Stadtteils.'], ['Sie wurde nach Schlesien verlegt.']],
        aide('Das Lager war „der Vorläufer“ der zentralen Anlaufstelle für Asylsuchende und des späteren Bundesamts für die Anerkennung ausländischer Flüchtlinge, heute Bundesamt für Migration und Flüchtlinge. 1957 begann dagegen der Aufbau des Stadtteils.',
          'Le camp est l’ancêtre de l’office fédéral chargé des réfugiés (aujourd’hui l’Office fédéral des migrations et des réfugiés).')),
      choice('q4', aide('Wie lange dauerte der Aufbau des neuen Stadtteils im Wesentlichen?', 'Combien de temps a duré pour l’essentiel la construction du nouveau quartier ?'),
        [['etwa zehn Jahre, von 1949 bis 1959'], ['sechs Jahre, von 1954 bis 1960'], ['nur ein Jahr nach dem Wettbewerb'], ['etwa vierzig Jahre, bis Ende der 1990er', true]],
        aide('„1957 beginnt dann der Aufbau des neuen Stadtteils, der erst Ende der 1990er Jahre in den Grundzügen abgeschlossen wurde“; der Text spricht von einer „etwa 40-jährigen Hauptbebauungsphase“. 1954 bis 1960 sind die Jahre des Bundessammellagers.',
          'La construction commence en 1957 et s’achève pour l’essentiel à la fin des années 1990 : une quarantaine d’années.')),
      choice('q5', aide('Welche Idee gehörte zum Entwurf für Langwasser?', 'Quelle idée faisait partie du projet pour Langwasser ?'),
        [['Grüngürtel und Wohngebiete an Stichstraßen', true], ['Hochhäuser direkt an großen Durchgangsstraßen'], ['Wohnungen und Fabriken im selben Gebäude'], ['ein einheitlicher Baustil für alle Häuser']],
        aide('Zu den Grundideen gehörten „die Erschließung von Wohngebieten nur noch durch Stichstraßen“ und „durchziehende Grüngürtel“. Wohn- und Gewerbegebiete blieben räumlich getrennt, und die Architektur änderte sich mit der Zeit.',
          'Le projet prévoyait des zones d’habitation desservies par des impasses et traversées de ceintures vertes ; logements et activités restaient séparés.')),
      rf('q6', 'Die ersten festen Steinhäuser wurden mit Geld aus dem Marshallplan gebaut.', 0,
        aide('Richtig: Die ersten Steinhäuser wurden „unter Verwendung von Mitteln aus dem Marshallplan errichtet“.', 'Vrai : les premières maisons en pierre ont été financées en partie par le plan Marshall.')),
    ] }),

  ...hoeren2({ module: 'b2-bildung', title: 'Verstehen: Kindheit und Schule im Mittelalter (Originaltext)', readings: [kindheit1, kindheit2],
    intro: (native) => [source(native, 'Kindheit', 2013, 'einer synthetischen Stimme', 'une voix de synthèse'),
      aide('Sie hören zwei Ausschnitte: Teil 1 über die Phasen der Kindheit, Teil 2 über Schulen und Klöster im Mittelalter.', 'Vous entendez deux extraits : la partie 1 sur les étapes de l’enfance, la partie 2 sur les écoles et les couvents au Moyen Âge.')].join('\n'),
    glossary: [['der weltliche Weg', 'la voie laïque (hors de l’Église)'], ['das Schulgeld', 'les frais de scolarité'], ['der Ministrant', 'l’enfant de chœur'],
      ['die Mitgift', 'la dot'], ['die Novizin', 'la novice (jeune religieuse)'], ['das Erbe', 'l’héritage']],
    strategy: [['Teil 1: Achten Sie auf das Alter der Kinder.', 'Partie 1 : soyez attentif à l’âge des enfants.'],
      ['Teil 2: Wer durfte welche Schule besuchen, und wer kam ins Kloster?', 'Partie 2 : qui pouvait fréquenter quelle école, et qui entrait au couvent ?']],
    photo: { key: 'b2-bildung-hoeren2-foto', file: 'bildung-schulszene.jpg', title: 'Une scène d’école sur une tapisserie médiévale',
      alt: 'Tapisserie de la fin du Moyen Âge : un maître assis sur une chaire tient une verge et un livre ; devant lui, des enfants agenouillés lisent dans leurs livres.',
      caption: 'Unterricht im Spätmittelalter (Wandteppich)', credit: 'Reinhard Dietrich', license: 'CC BY-SA 4.0', page: 'Adelphus-Teppiche_1-3_Schulszene.jpg' },
    questions: [
      fill('q1', C2.notizen,
        'Drei Phasen von je etwa [[1]] Jahren · mit sieben: kirchlicher oder [[2]] Weg · Beginn der Schulzeit oder [[3]] · Töchter: Ausbildung für das Führen des [[4]] · frühe Schulen: privat, mit [[5]] · Unterrichtssprache zuerst [[6]]',
        [['sieben', '7'], ['weltlicher', 'weltlichen'], ['Ausbildung'], ['Haushalts', 'Haushaltes'], ['Schulgeld'], ['Latein']],
        aide('Teil 1: „Jede dauerte ungefähr sieben Jahre“, „einen kirchlichen oder weltlichen Weg“, „der Beginn der Schulzeit oder Ausbildung“, „auf das Führen des Haushalts hin ausgebildet“. Teil 2: „private Einrichtungen, für die Schulgeld bezahlt werden musste“, „Unterrichtssprache war zunächst Latein“.',
          'Toutes les réponses sont des mots du texte ; « weltlich » s’oppose à « kirchlich » (religieux).')),
      choice('q2', aide('Teil 1: Was war in Bauern- und Handwerkerfamilien oft schon mit vier bis fünf Jahren normal?', 'Partie 1 : qu’est-ce qui était souvent normal dès quatre ou cinq ans chez les paysans et les artisans ?'),
        [['Die Kinder begannen schon eine Ausbildung beim Vater.'], ['Die Kinder halfen der Mutter bei der Arbeit.', true],
          ['Die Kinder kamen in ein Waisenhaus.'], ['Die Kinder gingen zum ersten Mal zur Schule.']],
        aide('Mit vier bis fünf Jahren mussten Kinder „ihre Mutter bei den täglichen Pflichten entlasten“. Die Ausbildung beim Vater begann erst „ab dem siebten Lebensjahr“.',
          'Dès 4 ou 5 ans, les enfants aidaient leur mère ; la formation par le père ne commençait qu’à 7 ans.')),
      choice('q3', aide('Teil 2: Wie bekamen einige begabte Kinder Unterricht, ohne zu bezahlen?', 'Partie 2 : comment certains enfants doués recevaient-ils un enseignement sans payer ?'),
        [['Ein reicher Nachbar bezahlte ihr Schulgeld.'], ['Sie lernten zu Hause bei ihren Eltern Lesen und Latein.'],
          ['Sie besuchten sofort eine Hochschule.'], ['Der Pfarrer unterrichtete sie, sie halfen ihm dafür.', true]],
        aide('„Dorfpfarrer gaben gewöhnlich aber ein bis zwei begabten Kindern kostenlosen Unterricht. Zum Ausgleich waren die Kinder zu Ministrantendiensten … oder zur Haushaltshilfe bei ihrem Lehrer verpflichtet.“ Die Hochschule kam erst ab sechzehn, und nur für sehr wenige.',
          'Le curé du village enseignait gratuitement à un ou deux enfants doués, qui en échange servaient la messe ou l’aidaient dans sa maison.')),
      choice('q4', aide('Teil 2: Welche Söhne kamen in reichen und adligen Familien oft ins Kloster?', 'Partie 2 : quels fils entraient souvent au couvent dans les familles riches et nobles ?'),
        [['die zu schwach für eine Ritterausbildung schienen', true], ['die ältesten Söhne, die später das Erbe bekommen sollten'], ['die in der Lateinschule die Besten waren'], ['die sich schon früh verlobt hatten']],
        aide('Ins Kloster kamen „vor allem Jungen …, die zu schwach für eine Ritterausbildung erschienen“, und jüngere Geschwister ohne Aussicht auf das Erbe; die Erben blieben also gerade nicht im Kloster.',
          'Au couvent entraient surtout les garçons jugés trop faibles pour devenir chevaliers, et les cadets sans part d’héritage.')),
      choice('q5', aide('Teil 2: Was sagt der Text über die Mitgift einer Novizin?', 'Partie 2 : que dit le texte de la dot d’une novice ?'),
        [['Sie war höher als bei einer Hochzeit.'], ['Sie war niedriger als bei einer Hochzeit.', true], ['Das Kloster bezahlte sie den Eltern.'], ['Für Novizinnen gab es keine Mitgift.']],
        aide('„Für solche Novizinnen mussten die Eltern eine Mitgift zahlen. Sie fiel aber kleiner aus als bei einer Eheschließung.“',
          'Les parents payaient une dot pour la novice, mais plus petite que pour un mariage.')),
      rf('q6', 'Mädchen durften im Mittelalter keine Schule besuchen.', 2,
        aide('Nicht gesagt: Der Text spricht über die Ausbildung der Töchter im Haushalt und über Mädchen im Kloster, aber er sagt nicht, dass Mädchen keine Schule besuchen durften.',
          'Non dit : le texte parle de la formation des filles au foyer et au couvent, sans dire qu’elles n’avaient pas le droit d’aller à l’école.')),
    ] }),

  ...hoeren2({ module: 'b2-wohnen', title: 'Verstehen: eine Siedlung aus der Krise (Originaltext)', readings: [taubenberg],
    intro: (native) => [source(native, 'Stadtrandsiedlung Am Taubenberg', 2013, 'einer synthetischen Stimme', 'une voix de synthèse'),
      aide('Die Siedlung liegt in Radeberg, einer Kleinstadt bei Dresden. Sie entstand in den 1930er Jahren für Familien, die von der Wirtschaftskrise betroffen waren.', 'La cité se trouve à Radeberg, petite ville près de Dresde ; elle a été construite dans les années 1930 pour des familles touchées par la crise économique.')].join('\n'),
    glossary: [['die Weltwirtschaftskrise', 'la crise économique mondiale (1929)'], ['die Selbstversorgung', 'l’autosuffisance alimentaire'],
      ['das Losverfahren', 'le tirage au sort'], ['der Bauabschnitt', 'la tranche de travaux'], ['die Landflucht', 'l’exode rural'], ['das Behelfsheim', 'l’abri provisoire']],
    strategy: [['Beim ersten Hören: Warum entstand die Siedlung, und wie wurde sie gebaut?', 'Première écoute : pourquoi la cité a-t-elle été créée, et comment a-t-elle été construite ?'],
      ['Beim zweiten Hören achten Sie auf Jahreszahlen und Zahlen.', 'À la deuxième écoute, soyez attentif aux dates et aux nombres.']],
    photo: { key: 'b2-wohnen-hoeren2-foto', file: 'wohnen-stadtrandsiedlung.jpg', title: 'Maisons d’une cité de la périphérie de Radeberg',
      alt: 'Petites maisons individuelles aux toits rouges, entourées de jardins et d’arbres, le long d’une route de campagne, à la sortie d’une ville.',
      caption: 'Häuser einer Stadtrandsiedlung in Radeberg', credit: 'Maddl79', license: 'CC BY-SA 3.0', page: 'Radeberg_Stadtrandsiedlung.jpg' },
    questions: [
      fill('q1', C2.notizen,
        'Auslöser: Weltwirtschaftskrise ab [[1]] · Ziel: Arbeit, Unterkünfte und Selbstversorgung durch eigene [[2]] und Kleintiere · Baubeschluss: [[3]] · erster Bauabschnitt: zehn [[4]] · Spottname in der Zeitung: [[5]]',
        [['1929', 'neunzehnhundertneunundzwanzig'], ['Gärten'], ['1932', 'neunzehnhundertzweiunddreißig'], ['Doppelhäuser'], ['Hundehütten']],
        aide('„Durch die 1929 einsetzende Weltwirtschaftskrise …“, „durch eigene Gärten und Kleintierhaltung“, „wurde 1932 der Bau der Siedlung … beschlossen“, „zehn Doppelhäuser“, „abschätzig als Hundehütten“ bezeichnet.',
          'Réponses tirées du texte ; « Hundehütten » (niches à chien) est le surnom moqueur donné par le journal local.')),
      choice('q2', aide('Warum wurden die Grundstücke erst nach der Fertigstellung verlost?', 'Pourquoi les terrains n’ont-ils été tirés au sort qu’une fois terminés ?'),
        [['Weil sich zu viele Familien beworben hatten.'], ['Weil die Finanzierung noch nicht geklärt war.'],
          ['Damit die Handwerker überall gleich gut arbeiteten.', true], ['Damit die künftigen Nachbarn die Bewohner auswählen konnten.']],
        aide('Man wollte „verhindern, dass die Handwerker nur auf ihrer eigenen Parzelle ordentlich arbeiteten“: Wer nicht weiß, welches Haus er bekommt, arbeitet überall sorgfältig.',
          'Les artisans ne savaient pas quelle parcelle ils obtiendraient : ils avaient donc intérêt à bien travailler partout.')),
      choice('q3', aide('Was mussten die Interessenten nachweisen?', 'Que devaient prouver les candidats ?'),
        [['dass sie schon in Radeberg eine Wohnung hatten'], ['dass sie die Häuser selbst bezahlen konnten'],
          ['dass sie seit mehreren Jahren arbeitslos waren'], ['dass sie für den Bau oder die Siedlung nützlich waren', true]],
        aide('Sie mussten „nachweisen, dass sie dem Bau oder dem Leben in der künftigen Ortslage nützlich sein würden“. Von Geld oder einer früheren Wohnung ist nicht die Rede.',
          'Ils devaient montrer qu’ils seraient utiles à la construction ou à la vie de la future cité.')),
      choice('q4', aide('Wie änderte sich der Zweck der Siedlung ab 1933?', 'Comment l’objectif de la cité a-t-il changé à partir de 1933 ?'),
        [['Sie sollte die Landflucht bremsen und billig Wohnraum schaffen.', true], ['Sie wurde zu einer reinen Siedlung für einheimische Handwerker.'],
          ['Sie sollte nun vor allem Arbeitslosen aus anderen Städten helfen.'], ['Sie wurde ausschließlich für Familien mit Kindern reserviert.']],
        aide('Nach 1933 „sollte [der Ausbau] vor allem der Verhinderung der Landflucht dienen und billigsten Wohnraum schaffen“.',
          'Après 1933, la cité devait surtout freiner l’exode rural et offrir des logements très bon marché.')),
      rf('q5', 'Der fünfte Bauabschnitt wurde wegen des Krieges nie verwirklicht.', 0,
        aide('Richtig: Der fünfte Bauabschnitt „wurde aufgrund des Zweiten Weltkriegs nicht realisiert“; auf der Fläche entstanden nur Behelfsheime.',
          'Vrai : la cinquième tranche n’a pas été réalisée à cause de la guerre ; on y a seulement construit des abris provisoires.')),
      rf('q6', 'Die Bewohner der Nachbargebiete unterstützten den Bau von Anfang an.', 1,
        aide('Falsch: Vor dem Baubeschluss mussten erst „die Widersprüche der Bewohner angrenzender Gebiete geklärt“ werden.',
          'Faux : il a d’abord fallu régler les objections des habitants des quartiers voisins.')),
    ] }),

  ...hoeren2({ module: 'b2-umwelt', title: 'Verstehen: Trinkwasser, Verbrauch und Qualität (Originaltext)', readings: [trinkwasser],
    intro: (native) => [source(native, 'Trinkwasser', 2016, 'einer synthetischen Stimme', 'une voix de synthèse'),
      aide('Die Zahlen stammen aus der Zeit der Aufnahme; heute können sie anders sein.', 'Les chiffres datent de l’enregistrement ; ils peuvent avoir changé depuis.')].join('\n'),
    glossary: [['der Verbrauch', 'la consommation'], ['die Meerwasserentsalzung', 'le dessalement de l’eau de mer'], ['das Grundwasser', 'la nappe phréatique'],
      ['die Gülle', 'le lisier (engrais agricole)'], ['die Kläranlage', 'la station d’épuration'], ['der Säugling', 'le nourrisson']],
    strategy: [['Beim ersten Hören: Der Text hat zwei Teile. Worum geht es in jedem Teil?', 'Première écoute : le texte a deux parties. De quoi parle chacune ?'],
      ['Beim zweiten Hören achten Sie auf die Zahlen: Wer verbraucht wie viel?', 'À la deuxième écoute, soyez attentif aux chiffres : qui consomme combien ?']],
    photo: { key: 'b2-umwelt-hoeren2-foto', file: 'umwelt-wasserhahn.jpg', title: 'Un robinet ouvert',
      alt: 'Gros plan sur un robinet chromé d’où coule un mince filet d’eau claire, devant un mur blanc.',
      caption: 'Leitungswasser: das am besten kontrollierte Lebensmittel', credit: 'Vien Hoang', license: 'CC0', page: 'Tap-gb0fe5d2cc_1920.jpg' },
    questions: [
      fill('q1', C2.notizen,
        'WHO bei hohem Bedarf: etwa [[1]] Liter pro Tag (Erwachsene, 60 kg) · Deutschland 2011: [[2]] Liter pro Kopf und Tag · Italien: [[3]] Liter · Dubai: [[4]] Liter · Gefahr für Säuglinge: zu viel [[5]] im Grundwasser',
        [['zwei', '2'], ['122', 'hundertzweiundzwanzig'], ['260', 'zweihundertsechzig'], ['500', 'fünfhundert'], ['Nitrat']],
        aide('„etwa zwei Litern je Tag“, „durchschnittlich 122 Liter“, Italien „mit 260 Litern“, Dubai „sogar mit 500 Litern“; gefährlich ist der „Nitrateintrag in das Grundwasser“.',
          'Chiffres donnés dans le texte ; le danger pour les nourrissons vient des nitrates.')),
      choice('q2', aide('Warum ist der Wasserverbrauch in Deutschland seit 1990 gesunken?', 'Pourquoi la consommation d’eau a-t-elle baissé en Allemagne depuis 1990 ?'),
        [['Weil Wasser in Deutschland knapp geworden ist.'], ['Weil die Menschen bewusster mit Wasser umgehen.', true],
          ['Weil die Preise für Wasser stark gestiegen sind.'], ['Weil die WHO weniger Wasser empfiehlt.']],
        aide('Der Verbrauch ist „durch einen bewussten Umgang mit Wasser seit 1990 beinahe kontinuierlich gesunken“. Von Preisen oder Wassermangel in Deutschland spricht der Text nicht.',
          'La baisse s’explique par un usage plus conscient de l’eau.')),
      choice('q3', aide('Was zeigen neuere Studien über den Flüssigkeitsbedarf?', 'Que montrent des études plus récentes sur les besoins en liquide ?'),
        [['Man sollte mindestens drei Liter Wasser trinken.'], ['Kaffee erhöht den Bedarf an Wasser deutlich.'],
          ['Auch Saft, Milch oder Kaffee können ihn decken.', true], ['Er ist bei allen Menschen fast gleich.']],
        aide('Der Bedarf kann „auch durch ausreichenden Verzehr von Getränken wie etwa Saft, Milch oder auch Kaffee gedeckt werden“ und „variiert individuell stark“.',
          'Les besoins peuvent aussi être couverts par d’autres boissons, et ils varient beaucoup d’une personne à l’autre.')),
      choice('q4', aide('Woher kommen die Probleme für das Grundwasser vor allem?', 'D’où viennent surtout les problèmes pour la nappe phréatique ?'),
        [['aus der Landwirtschaft und alten Kläranlagen', true], ['aus alten, rostigen Wasserleitungen in den Wohnhäusern'], ['aus Fabriken für Mineralwasser'], ['aus dem Salz des Meerwassers']],
        aide('Genannt werden „zu starke Gülledüngung“ in Gebieten mit intensiver Landwirtschaft und „alte Kläranlagen“, die Nitrat ins Grundwasser bringen.',
          'Le texte cite l’épandage excessif de lisier dans les zones agricoles et les vieilles stations d’épuration.')),
      rf('q5', 'In Deutschland wird kein Lebensmittel so streng kontrolliert wie das Trinkwasser.', 0,
        aide('Richtig: Trinkwasser ist dort „das am intensivsten kontrollierte Lebensmittel“.', 'Vrai : l’eau potable y est l’aliment le plus contrôlé.')),
      rf('q6', 'Dubai will seinen Wasserverbrauch in Zukunft noch steigern.', 1,
        aide('Falsch: Dubai „strebt … eine notwendige Verbrauchssenkung an“, will den Verbrauch also senken.', 'Faux : Dubaï cherche à réduire sa consommation.')),
    ] }),

  ...hoeren2({ module: 'b2-wissenschaft', title: 'Verstehen: Wie verlässlich ist die Wettervorhersage? (Originaltext)', readings: [wetter],
    intro: (native) => [source(native, 'Wettervorhersage', 2007, 'einer synthetischen Stimme', 'une voix de synthèse'),
      aide('Die Angaben beschreiben den Stand von 2007; seitdem sind die Vorhersagen noch genauer geworden.', 'Les données décrivent la situation en 2007 ; depuis, les prévisions sont devenues encore plus précises.')].join('\n'),
    glossary: [['die Treffsicherheit', 'la fiabilité, le taux de réussite'], ['das Wettergeschehen', 'les phénomènes météorologiques'], ['unseriös', 'peu sérieux'],
      ['der Laie', 'le profane, le non-spécialiste'], ['die Beobachtungsgabe', 'le sens de l’observation']],
    strategy: [['Beim ersten Hören: Welche Gründe für Fehler nennt der Text?', 'Première écoute : quelles causes d’erreur le texte cite-t-il ?'],
      ['Beim zweiten Hören achten Sie auf die Prozentzahlen und die Zeiträume.', 'À la deuxième écoute, soyez attentif aux pourcentages et aux durées.']],
    photo: { key: 'b2-wissenschaft-hoeren2-foto', file: 'wissenschaft-wetterhaeuschen.jpg', title: 'Une station météo ancienne',
      alt: 'Une ancienne station météo publique en bois et en verre : trois cadrans (baromètre, hygromètre) en haut, des thermomètres en dessous.',
      caption: 'Thermometer und Barometer in einer alten Wetterstation', crop: [0.1, 0.04, 0.8, 0.9],
      credit: 'Radler59', license: 'CC BY-SA 4.0', page: 'Grein_Wetterstation-04.jpg' },
    questions: [
      fill('q1', C2.notizen,
        'Wochenprognose heute so gut wie vor [[1]] Jahren für einen Tag · 24 Stunden: gut [[2]] Prozent · drei Tage: etwas mehr als [[3]] Prozent · keine Methode reicht über [[4]] Tage · „heute wie gestern“: [[5]] bis 70 Prozent',
        [['dreißig', '30', 'dreissig'], ['neunzig', '90'], ['75', 'fünfundsiebzig'], ['zwanzig', '20'], ['50', 'fünfzig']],
        aide('„so zuverlässig, wie sie es vor dreißig Jahren für den nächsten Tag war“, „gut neunzig Prozent“, „etwas mehr als 75 %“, „über zwanzig Tage“, „zu 50 bis 70 Prozent“.',
          'Les chiffres sont donnés dans cet ordre dans le texte.')),
      choice('q2', aide('Welcher Grund für ungenaue Vorhersagen wird NICHT genannt?', 'Quelle cause de prévisions imprécises n’est PAS citée ?'),
        [['unvollständige Daten über die Atmosphäre'], ['der chaotische Anteil des Wetters'], ['zu wenige Fachleute in den Wetterdiensten', true], ['zu ungenaue Rechenmodelle']],
        aide('Der Text nennt drei Ursachen: unvollständige Kenntnis der Erdatmosphäre, den chaotischen Anteil im Wettergeschehen und zu ungenaue rechnerische Modelle. Von Personalmangel ist nicht die Rede.',
          'Les trois causes citées sont les données incomplètes, la part chaotique du temps et les modèles de calcul imprécis.')),
      choice('q3', aide('Was sagt der Text über saisonale Wetterprognosen?', 'Que dit le texte des prévisions saisonnières ?'),
        [['Sie sind so zuverlässig wie Tagesprognosen.'], ['Sie sind unseriös und werden meist nicht gesendet.', true],
          ['Sie werden nur für Landwirte erstellt.'], ['Sie werden im Radio inzwischen immer häufiger gesendet.']],
        aide('Weil keine Methode über zwanzig Tage hinausreicht, sind saisonale Prognosen „nur noch unseriös“ und werden „von den meisten Wetterberichterstattungen im Fernsehen und Radio auch gemieden“.',
          'Au-delà de vingt jours, les prévisions ne sont plus sérieuses ; la télévision et la radio les évitent.')),
      choice('q4', aide('Warum verändern lokale Einflüsse die Vorhersage so stark?', 'Pourquoi les influences locales modifient-elles autant la prévision ?'),
        [['Weil Gebirge die Messgeräte der Wetterdienste stören.'], ['Weil kleinräumige Effekte kaum genau zu berechnen sind.', true],
          ['Weil die Theorie der Meteorologie noch weitgehend unklar ist.'], ['Weil man Wälder und Äcker nicht von oben beobachten kann.']],
        aide('Die Theorie ist „weitgehend geklärt“, aber „kleinräumige Effekte“ wie Temperaturunterschiede über hellen und dunklen Flächen lassen sich nicht genau genug berechnen.',
          'La théorie est connue, mais les effets très locaux (surfaces claires ou sombres, versants) sont difficiles à calculer.')),
      choice('q5', aide('Was sagt der Text über Prognosen von Laien?', 'Que dit le texte des prévisions faites par des profanes ?'),
        [['Sie brauchen dafür teure Messgeräte und Computer.'], ['Sie sind besser als jede Vorhersage eines Wetterdienstes.'],
          ['Sie sind grundsätzlich weniger zuverlässig als ein Zufall.'], ['Erfahrene Laien schaffen lokal recht gute Prognosen.', true]],
        aide('Ein „erfahrener Laie“ kann für seine Umgebung eine Prognose erstellen, die einer Prognose für ein ganzes Bundesland „an lokaler Verlässlichkeit gleichkommt“; dafür reichen Thermometer, Barometer und Beobachtung. Eine Nachfrage beim Wetterdienst bringt aber eine höhere Trefferquote.',
          'Un profane expérimenté peut prévoir le temps local aussi bien qu’un bulletin régional, avec un thermomètre, un baromètre et de l’observation.')),
      rf('q6', 'Für einen Landwirt kann sich eine Nachfrage bei einem Wetterdienst lohnen.', 0,
        aide('Richtig: Eine Nachfrage „etwa von einem Landwirt“ bringt „immer eine höhere Trefferquote … als das einheitliche Fernsehwetter“.',
          'Vrai : un agriculteur obtient de meilleures prévisions en interrogeant directement un service météo.')),
    ] }),

  ...hoeren2({ module: 'b2-kultur', title: 'Verstehen: Was ist „Romantik“? (Originaltext)', readings: [romantik],
    intro: (native) => [source(native, 'Romantik', 2006, 'einer synthetischen Stimme', 'une voix de synthèse'),
      aide('Es geht um die Epoche der Romantik in Kunst, Literatur und Musik und um die Herkunft des Wortes.', 'Il s’agit du romantisme dans l’art, la littérature et la musique, et de l’origine du mot.')].join('\n'),
    glossary: [['die Epoche', 'l’époque, la période'], ['die Volkssprache', 'la langue vulgaire (parlée par le peuple)'], ['die Abwendung von', 'le fait de se détourner de'],
      ['die Sehnsucht', 'la nostalgie, le désir ardent'], ['die Aufklärung', 'les Lumières']],
    strategy: [['Beim ersten Hören: Welche zwei Bedeutungen hat das Wort „romantisch“?', 'Première écoute : quels sont les deux sens du mot « romantique » ?'],
      ['Beim zweiten Hören achten Sie auf Gegensätze: Volkssprache und Latein, Gefühl und Vernunft.', 'À la deuxième écoute, repérez les oppositions : langue du peuple et latin, sentiment et raison.']],
    photo: { key: 'b2-kultur-hoeren2-foto', file: 'kultur-wanderer.jpg', title: 'Le Voyageur contemplant une mer de nuages',
      alt: 'Tableau romantique : un homme vu de dos, debout sur un rocher, contemple une mer de brouillard d’où émergent des sommets.',
      caption: 'Ein berühmtes Bild der Romantik: Der Wanderer über dem Nebelmeer (um 1818)', credit: 'Caspar David Friedrich (tableau, domaine public)', license: 'Domaine public',
      page: 'Caspar_David_Friedrich_-_Wanderer_above_the_sea_of_fog.jpg' },
    questions: [
      fill('q1', C2.notizen,
        'bildende Kunst: 1790 bis [[1]] · Herkunft: „in lingua [[2]]“, also Volkssprache · Gegensatz: Schriften auf [[3]] · Grundsteine: Gefühl, [[4]] und Seele · Reaktion auf die Philosophie der [[5]]',
        [['1840', 'achtzehnhundertvierzig'], ['romana'], ['Latein', 'Lateinisch'], ['Individualität'], ['Aufklärung']],
        aide('„bildende Kunst (1790–1840)“, „in lingua romana“, Gegensatz „in lingua latina“, also auf Latein; „Gefühl, Individualität und Seele“; „Reaktion auf … die Philosophie der Aufklärung“.',
          'Réponses tirées du texte ; « Aufklärung » désigne les Lumières.')),
      choice('q2', aide('Was sagt der Text über das Wort „romantisch“ im Alltag?', 'Que dit le texte du mot « romantique » dans la langue courante ?'),
        [['Es bezeichnet vor allem Musik des 19. Jahrhunderts.'], ['Es wird nur in der Literaturwissenschaft benutzt.'],
          ['Es hat mit der Epoche der Romantik nichts zu tun.', true], ['Es ist ein anderes Wort für „mittelalterlich“.']],
        aide('Im Alltag bedeutet „romantisch“, das Herz mit Liebe und Sehnsucht zu erfüllen, oft sogar im Sinn von Kitsch; „das hat jedoch mit der kulturgeschichtlichen Epoche nichts gemein“.',
          'Dans la langue courante, « romantique » évoque l’amour, parfois le kitsch, et n’a rien à voir avec l’époque historique.')),
      choice('q3', aide('Warum schrieben romantische Autoren gern fragmentarisch?', 'Pourquoi les auteurs romantiques aimaient-ils écrire par fragments ?'),
        [['Weil sie sich von klassischen Formen abwandten.', true], ['Weil sie wenig Zeit zum Schreiben hatten.'], ['Weil sie die Antike nachahmen wollten.'], ['Weil ihre Zeitschriften kurze Texte verlangten.']],
        aide('Die Romantiker „wenden sich ab von klassischen Formen, was die Vorliebe für fragmentarische Schreibweise erklärt“. Die Antike nachzuahmen, ist gerade das Ziel der Klassik.',
          'Ils se détournent des formes classiques, d’où le goût du fragment ; imiter l’Antiquité est au contraire le programme du classicisme.')),
      choice('q4', aide('Wie reagierten die Vertreter der Klassik auf die Romantiker?', 'Comment les représentants du classicisme ont-ils réagi aux romantiques ?'),
        [['Sie übernahmen begeistert viele der neuen romantischen Ideen.'], ['Sie gründeten gemeinsam mit ihnen Zeitschriften.'],
          ['Sie lobten vor allem ihre Liebe zum Mittelalter.'], ['Sie nannten deren Literatur fantastisch, ja krankhaft.', true]],
        aide('Die Klassiker „fühlten sich … massiv angegriffen und bezeichneten deren Literatur als fantastisch oder sogar als krankhaft“. Die Zeitschriften gehörten den Romantikern.',
          'Les classiques se sont sentis attaqués et ont qualifié la littérature romantique de fantasque, voire de maladive.')),
      choice('q5', aide('Wo suchte die Romantik ihre Anregungen?', 'Où le romantisme cherchait-il son inspiration ?'),
        [['in der vernunftgerichteten Aufklärung'], ['im Mittelalter und in exotischen Ländern', true], ['in den strengen Formen der Antike'], ['in den Naturwissenschaften der Zeit']],
        aide('„Seine Anstöße suchte er in der Vergangenheit (vor allem im Mittelalter) und exotischen Ländern.“ Aufklärung und Antike sind gerade das, wovon sich die Romantik abwendet.',
          'Le romantisme s’inspire du Moyen Âge et des pays lointains, en réaction aux Lumières et à l’Antiquité.')),
      rf('q6', 'In der Musik endete die Romantik früher als in der Literatur.', 1,
        aide('Falsch: In der Literatur dauert die Romantik von 1795 bis 1848, in der Musik von 1800 bis 1940, also viel länger.',
          'Faux : en musique, le romantisme dure de 1800 à 1940, bien plus longtemps qu’en littérature (1795–1848).')),
    ] }),
];

export default [...einstieg, ...listening];
