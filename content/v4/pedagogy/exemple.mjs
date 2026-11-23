// Exemple documenté de couche pédagogique V4 (module a1-sante). Ce fichier n'est pas construit : build-v4.mjs ne lit
// que les dossiers a1/ et a2/. Pour l'essayer, copiez-le sous <dossier d'essai>/a1/a1-sante.mjs, puis :
//   node infra/content/build-v4.mjs --level a1 --out target/v4-essai --pedagogy <dossier d'essai>
//   node infra/content/check-content.mjs target/v4-essai/a1
// Une couche complète le kit V4 sans le recopier : tout champ absent garde sa valeur du kit (V2, ateliers V3, V4).
// Les identifiants des activités du kit sont ceux de target/v4-preview/<niveau>/NN-<module>.json.

const REPEAT = 'Écoutez le modèle, puis dites la phrase à voix haute.';
const speak = (id, text, explanation, accept = [text]) => ({ id, type: 'speak', prompt: REPEAT, text, accept, explanation });

export default {
  // Identifiant du module : le fichier s'appelle <module>.mjs.
  module: 'a1-sante',
  // Facultatifs : titre (120 caractères), objectif (500 caractères).
  objective: 'Nommer un symptôme simple, dire depuis quand il dure, demander une pharmacie et confirmer un rendez-vous.',
  // Facultatif, pour un module de grammaire : repères du point travaillé, par exemple grammarFocus: ['weil-dass'].
  // Le module doit alors proposer un exercice « S’entraîner : … » d’au moins 6 questions qui testent ce point.

  // Vocabulaire du module : 10 à 30 entrées (6 au moins pour les modules de sons). id facultatif (tiré du mot).
  // partOfSpeech : noun, verb, adjective, adverb, preposition, conjunction, pronoun, number, expression, other.
  // article : der, die, das ou null (obligatoire pour un nom, sauf note « toujours au pluriel »). plural sans article.
  // audio est calculé : la construction crée le son « a1-sante-lexique » (une ligne par entrée, « der Kopf, die Köpfe »).
  vocabulary: [
    { word: 'Kopf', article: 'der', plural: 'Köpfe', partOfSpeech: 'noun', translation: 'la tête', example: 'Mein Kopf tut weh.', note: null },
    { word: 'Hals', article: 'der', plural: 'Hälse', partOfSpeech: 'noun', translation: 'la gorge, le cou', example: 'Mein Hals tut weh.', note: null },
    { word: 'Bauch', article: 'der', plural: 'Bäuche', partOfSpeech: 'noun', translation: 'le ventre', example: 'Mir tut der Bauch weh.', note: null },
    { word: 'Schmerz', article: 'der', plural: 'Schmerzen', partOfSpeech: 'noun', translation: 'la douleur', example: 'Ich habe Schmerzen.', note: 'surtout employé au pluriel' },
    { word: 'Husten', article: 'der', plural: null, partOfSpeech: 'noun', translation: 'la toux', example: 'Ich habe Husten.', note: null },
    { word: 'Apotheke', article: 'die', plural: 'Apotheken', partOfSpeech: 'noun', translation: 'la pharmacie', example: 'Wo ist die nächste Apotheke?', note: null },
    { word: 'Praxis', article: 'die', plural: 'Praxen', partOfSpeech: 'noun', translation: 'le cabinet médical', example: 'Die Praxis ist in der Marktstraße.', note: null },
    { word: 'Termin', article: 'der', plural: 'Termine', partOfSpeech: 'noun', translation: 'le rendez-vous', example: 'Ich möchte einen Termin, bitte.', note: null },
    { word: 'krank', partOfSpeech: 'adjective', translation: 'malade', example: 'Ich bin heute krank.' },
    { word: 'wehtun', partOfSpeech: 'verb', translation: 'faire mal', example: 'Mein Kopf tut weh.', note: 'séparable : weh|tun ; mir tut … weh' },
    { word: 'helfen', partOfSpeech: 'verb', translation: 'aider', example: 'Können Sie mir bitte helfen?', note: '+ datif' },
    { word: 'seit', partOfSpeech: 'preposition', translation: 'depuis', example: 'Seit gestern habe ich Husten.', note: '+ datif' },
  ],

  // Médias ajoutés ou remplacés (même clé) : illustrations composées (grid, single, scene et gabarits V4 de
  // render-images.mjs : document, cards, form, table, messages, receipt, ticket, clocks, route, plan, words, letters, dates)
  // ou sons de synthèse (script). Un média déclaré ici doit être placé dans une activité.
  media: [
    {
      key: 'a1-sante-apotheke-schild', kind: 'image', title: 'Panneau de la pharmacie',
      alt: 'Panneau « Linden-Apotheke » : Bahnhofstraße 8, ouverte aujourd’hui de 8 h à 18 h.',
      image: { layout: 'document', variant: 'sign', icon: 'pill', title: 'Linden-Apotheke',
        lines: [{ icon: 'map-pin', text: 'Bahnhofstraße 8' }, { icon: 'clock', text: 'Heute geöffnet: [8–18 Uhr]' }] },
    },
  ],

  // Retouches des activités du kit, par identifiant. null retire l'activité.
  activities: {
    'a1-sante-guide': {
      title: 'Comprendre : dire où l’on a mal',
      estimatedMinutes: 15,
      lesson: {
        title: 'Dire où l’on a mal',
        description: 'Lisez le message de Mina, puis écoutez les modèles.\n\nMOTS UTILES\n• Ich habe Kopfschmerzen. — J’ai mal à la tête.\n• Mein Kopf tut weh. — Ma tête me fait mal.\n• Seit gestern. — Depuis hier.\n\nRepérez dans le message ce que Mina ressent et le jour où elle appellera le cabinet.',
      },
      // Liste complète (remplace les supports) ou { add, remove } (remove : clés de médias).
      placements: { add: [{ media: 'a1-sante-apotheke-schild', usage: 'illustration', caption: 'Wo ist die nächste Apotheke?' }] },
    },
    // Une leçon de prise de notes devient un exercice à trous sur le dialogue.
    'a1-sante-pratique': {
      kind: 'exercise',
      title: 'S’entraîner : noter un rendez-vous au téléphone',
      estimatedMinutes: 10,
      competences: ['ecoute', 'lecture'],
      lesson: { title: 'Noter un rendez-vous', description: 'Écoutez l’appel au cabinet sans lire la transcription. Complétez ensuite la fiche avec les mots entendus. La transcription s’affiche après votre réponse.' },
      placements: [{ media: 'a1-sante-dialogue', usage: 'audio', transcriptVisibility: 'after_answer' }],
      questions: [
        { id: 'q1', type: 'fill', prompt: 'Complétez le symptôme.', text: 'Ich habe [[1]] und Husten.', blanks: [{ id: '1', accept: ['Halsschmerzen'] }],
          explanation: 'La patiente dit « Halsschmerzen und Husten » : Hals (la gorge) + Schmerzen (les douleurs). Kopfschmerzen désignerait le mal de tête.' },
        { id: 'q2', type: 'fill', prompt: 'Depuis quand ?', text: 'Seit [[1]] Abend.', blanks: [{ id: '1', accept: ['gestern'] }],
          explanation: '« Seit gestern Abend » : depuis hier soir. Seit indique le début d’une situation qui dure encore.' },
        { id: 'q3', type: 'fill', prompt: 'Quelle heure est retenue ?', text: 'Heute um [[1]] Uhr.', blanks: [{ id: '1', accept: ['elf', '11'], hint: 'en lettres ou en chiffres' }],
          explanation: 'Neuf heures ne convient pas ; la réception propose « heute um elf Uhr » et la patiente confirme.' },
        { id: 'q4', type: 'fill', prompt: 'Où est le cabinet ?', text: 'Die Praxis ist in der [[1]] fünf.', blanks: [{ id: '1', accept: ['Marktstraße'] }],
          explanation: 'Les deux voix répètent « Marktstraße fünf ». Straße s’écrit avec ß après une voyelle longue.' },
      ],
    },
    // Retouches d'un exercice existant : explications et retours par choix (identifiants du kit).
    'a1-sante-controle': {
      feedback: { q1: { b: 'Personne ne parle de cours : « Ich möchte einen Termin » annonce une demande de rendez-vous.' } },
    },
    'a1-sante-approfondir': null,
    // Mission : remplace la mission provisoire tirée de la tâche de l'atelier.
    'a1-sante-mission': {
      title: 'Mission : déplacer un rendez-vous',
      estimatedMinutes: 20,
      competences: ['expression-orale', 'expression-ecrite'],
      lesson: { title: 'Déplacer un rendez-vous', description: 'Vous avez rendez-vous à la Praxis am Markt demain à 11 h, mais vous avez cours. Vous appelez pour déplacer le rendez-vous, puis vous confirmez par écrit.' },
      mission: {
        oral: { prompt: 'Enregistrez votre appel : saluez, dites ce que vous avez et depuis quand, demandez un autre créneau et répétez le nouveau jour et la nouvelle heure.', maxSeconds: 90 },
        written: { prompt: 'Écrivez un court message à la réception : l’ancien créneau, le nouveau créneau et une formule de politesse.', maxChars: 600, minWords: 25 },
        checklist: ['Je dis ce que j’ai et depuis quand.', 'Je donne l’ancien et le nouveau créneau.', 'J’emploie « am » pour le jour et « um » pour l’heure.'],
      },
    },
  },

  // Activités ajoutées (complètes), placées après (after) ou avant (before) une activité ; sinon à la fin.
  add: [
    {
      after: 'a1-sante-guide',
      activity: {
        id: 'a1-sante-repeter', kind: 'exercise', title: 'Répéter à voix haute', estimatedMinutes: 8, competences: ['expression-orale'],
        lesson: { title: 'Répéter à voix haute', description: 'Écoutez chaque modèle, puis répétez-le. La reconnaissance vocale de votre navigateur compare votre phrase au modèle.' },
        // speak : un son « <activité>-<question> » et son support (transcription à la demande) sont créés.
        questions: [
          speak('q1', 'Ich habe Kopfschmerzen.', 'Kopfschmerzen = der Kopf (la tête) + die Schmerzen (les douleurs) : on dit « Ich habe Kopfschmerzen ».'),
          speak('q2', 'Mein Bauch tut weh.', 'Avec « tut weh », la partie du corps est le sujet : mein Bauch tut weh, mot à mot « mon ventre fait mal ».'),
          speak('q3', 'Seit gestern habe ich Husten.', 'Seit gestern en tête de phrase : le verbe habe reste en deuxième position, le sujet ich vient juste après.'),
          speak('q4', 'Wo ist die nächste Apotheke?', 'Wo (où) ouvre la question, le verbe ist suit ; die nächste Apotheke : la pharmacie la plus proche.'),
        ],
      },
    },
    {
      after: 'a1-sante-pratique',
      activity: {
        id: 'a1-sante-dictee', kind: 'exercise', title: 'S’entraîner : écrire ce qu’on entend', estimatedMinutes: 10,
        competences: ['ecoute', 'expression-ecrite'],
        lesson: { title: 'Écrire ce qu’on entend', description: 'Écoutez chaque phrase et écrivez-la. Associez ensuite les parties du corps et remettez la phrase dans l’ordre.' },
        questions: [
          // dictation : un son par question (voix « voice », sprecherin par défaut), transcription après la réponse.
          { id: 'q1', type: 'dictation', prompt: 'Écoutez et écrivez la phrase.', accept: ['Ich habe seit gestern Halsschmerzen.'], voice: 'frau',
            explanation: 'Halsschmerzen s’écrit en un mot, avec une majuscule : c’est un nom. Seit gestern se place après le verbe habe.' },
          { id: 'q2', type: 'dictation', prompt: 'Écoutez et écrivez la phrase.', accept: ['Der Termin ist am Donnerstag.'], voice: 'mann',
            explanation: 'Am Donnerstag : am (an + dem) devant un jour de la semaine. Termin et Donnerstag sont des noms, donc en majuscule.' },
          { id: 'q3', type: 'match', prompt: 'Associez chaque mot à sa traduction.',
            pairs: [{ left: 'der Kopf', right: 'la tête' }, { left: 'der Hals', right: 'la gorge' }, { left: 'der Bauch', right: 'le ventre' }],
            explanation: 'Ces trois noms se combinent avec Schmerzen : Kopfschmerzen, Halsschmerzen, Bauchschmerzen.' },
          // order : chaque solution reprend exactement les mêmes jetons (majuscules comprises) ; sinon, fixer le début.
          { id: 'q4', type: 'order', prompt: 'Remettez les mots dans l’ordre, en commençant par « Seit gestern ».',
            answers: [['Seit gestern', 'habe', 'ich', 'Husten.']],
            explanation: 'Le verbe conjugué habe reste en deuxième position : après Seit gestern viennent habe, puis le sujet ich.' },
        ],
      },
    },
  ],

  // Facultatif : ordre complet des activités du module (après retouches et ajouts).
  order: ['a1-sante-guide', 'a1-sante-repeter', 'a1-sante-pratique', 'a1-sante-dictee', 'a1-sante-controle', 'a1-sante-mission'],
};

// Exemple de _level.mjs (export par défaut d'un fichier a1/_level.mjs ou a2/_level.mjs) : ordre complet des modules
// (prérequis recalculés en chaîne), fourchette de durée des activités, réglages et descriptions du bilan et de l'examen.
export const levelExample = {
  order: ['a1-abc', 'a1-voyelles', 'a1-rythme', 'a1-hallo', 'a1-hallo-atelier', 'a1-zahlen', 'a1-zahlen-atelier', 'a1-montants',
    'a1-kurs', 'a1-kurs-atelier', 'a1-alltag', 'a1-alltag-atelier', 'a1-arbeit', 'a1-sante', 'a1-essen', 'a1-essen-atelier',
    'a1-freizeit', 'a1-freizeit-atelier', 'a1-familie', 'a1-familie-atelier', 'a1-stadt', 'a1-stadt-atelier', 'a1-transports'],
  minutes: { min: 2200, max: 2300 },
  settings: { reviewMinutes: 10 },
  midtermDescription: 'Ce bilan de 30 minutes reprend les premières séquences du parcours, de l’épellation aux horaires de la journée.',
};
