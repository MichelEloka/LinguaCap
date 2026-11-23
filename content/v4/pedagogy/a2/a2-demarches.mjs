// Couche pédagogique V4 · a2-demarches (lot A7, contenu A2).
// Formulaire, date limite et rendez-vous : la prise de notes devient un exercice à trous, la lecture des avis en ligne
// un exercice d’association, et la mission est remise dans l’application.

const dialogue = { media: 'a2-demarches-dialogue', usage: 'audio', transcriptVisibility: 'after_answer', decorative: false };

export default {
  module: 'a2-demarches',
  grammarFocus: ['bis-am-um-dates', 'verbes-separables-demarches'],

  vocabulary: [
    { id: 'antrag', word: 'Antrag', article: 'der', plural: 'Anträge', partOfSpeech: 'noun', translation: 'la demande (dossier)',
      example: 'Der Antrag für den Bibliotheksausweis ist gespeichert.', note: null },
    { id: 'formular', word: 'Formular', article: 'das', plural: 'Formulare', partOfSpeech: 'noun', translation: 'le formulaire',
      example: 'Ihr Formular ist schon da.', note: null },
    { id: 'ausfuellen', word: 'ausfüllen', article: null, plural: null, partOfSpeech: 'verb', translation: 'remplir (un formulaire)',
      example: 'Muss ich das Formular noch einmal ausfüllen?', note: 'séparable : aus|füllen · Perfekt : hat ausgefüllt' },
    { id: 'pflichtfeld', word: 'Pflichtfeld', article: 'das', plural: 'Pflichtfelder', partOfSpeech: 'noun', translation: 'le champ obligatoire',
      example: 'Die E-Mail-Adresse ist ein Pflichtfeld.', note: null },
    { id: 'freiwillig', word: 'freiwillig', article: null, plural: null, partOfSpeech: 'adjective', translation: 'facultatif, volontaire',
      example: 'Die Telefonnummer ist freiwillig.', note: null },
    { id: 'hausnummer', word: 'Hausnummer', article: 'die', plural: 'Hausnummern', partOfSpeech: 'noun', translation: 'le numéro (de la rue)',
      example: 'Die Hausnummer im Formular ist falsch.', note: 'Straße und Hausnummer : Bergweg 8' },
    { id: 'postleitzahl', word: 'Postleitzahl', article: 'die', plural: 'Postleitzahlen', partOfSpeech: 'noun', translation: 'le code postal',
      example: 'Die Postleitzahl von Kassel-Mitte ist 34117.', note: 'abrégé : PLZ' },
    { id: 'ausweis', word: 'Ausweis', article: 'der', plural: 'Ausweise', partOfSpeech: 'noun', translation: 'la pièce d’identité, la carte',
      example: 'Bringen Sie bitte Ihren Ausweis mit.', note: 'der Bibliotheksausweis : la carte de bibliothèque' },
    { id: 'adressnachweis', word: 'Adressnachweis', article: 'der', plural: 'Adressnachweise', partOfSpeech: 'noun', translation: 'le justificatif d’adresse',
      example: 'Laden Sie den Adressnachweis als PDF hoch.', note: null },
    { id: 'unterlagen', word: 'Unterlagen', article: 'die', plural: null, partOfSpeech: 'noun', translation: 'les documents, le dossier',
      example: 'Ihre Unterlagen müssen bis Freitag vorliegen.', note: 'toujours au pluriel' },
    { id: 'hochladen', word: 'hochladen', article: null, plural: null, partOfSpeech: 'verb', translation: 'déposer en ligne, télécharger vers',
      example: 'Ich kann die Datei nicht hochladen.', note: 'séparable : hoch|laden · Perfekt : hat hochgeladen' },
    { id: 'datei', word: 'Datei', article: 'die', plural: 'Dateien', partOfSpeech: 'noun', translation: 'le fichier',
      example: 'Die Datei ist zu groß.', note: null },
    { id: 'termin', word: 'Termin', article: 'der', plural: 'Termine', partOfSpeech: 'noun', translation: 'le rendez-vous',
      example: 'Mein Termin ist am Montag um zehn Uhr.', note: null },
    { id: 'verschieben', word: 'verschieben', article: null, plural: null, partOfSpeech: 'verb', translation: 'déplacer, reporter',
      example: 'Könnten Sie den Termin auf Freitag verschieben?', note: 'einen Termin auf + accusatif verschieben' },
    { id: 'bestaetigung', word: 'Bestätigung', article: 'die', plural: 'Bestätigungen', partOfSpeech: 'noun', translation: 'la confirmation',
      example: 'Bekomme ich eine neue Bestätigung per E-Mail?', note: null },
    { id: 'bestaetigen', word: 'bestätigen', article: null, plural: null, partOfSpeech: 'verb', translation: 'confirmer',
      example: 'Bitte bestätigen Sie den Termin bis Sonntag.', note: 'Perfekt sans ge- : hat bestätigt' },
    { id: 'aendern', word: 'ändern', article: null, plural: null, partOfSpeech: 'verb', translation: 'modifier, corriger',
      example: 'Können Sie die Hausnummer bitte ändern?', note: null },
    { id: 'unterschrift', word: 'Unterschrift', article: 'die', plural: 'Unterschriften', partOfSpeech: 'noun', translation: 'la signature',
      example: 'Unten auf dem Formular fehlt noch Ihre Unterschrift.', note: null },
  ],

  activities: {
    'a2-demarches-guide': {
      title: 'Découvrir : un formulaire et les pièces demandées',
      estimatedMinutes: 15,
      lesson: {
        title: 'Découvrir : un formulaire et les pièces demandées',
        description: `Lisez cette fiche de la médiathèque fictive Stadtbibliothek West.
« Bibliotheksausweis – Antrag. Pflichtfelder: Familienname, Vorname, Straße und Hausnummer, PLZ und Ort, E-Mail-Adresse. Die Telefonnummer ist freiwillig. Bringen Sie zur Anmeldung Ihren Ausweis und einen Adressnachweis mit. »
Repérez ce qu’il faut saisir (les Pflichtfelder, champs obligatoires) et ce qu’il faut présenter au rendez-vous : une pièce d’identité (der Ausweis) et un justificatif d’adresse (der Adressnachweis). Le seul champ facultatif (freiwillig) est le numéro de téléphone.

REMPLIR LE FORMULAIRE
Voici la fiche d’une personne fictive, Lina Berger, qui ne donne pas son téléphone :
Familienname: Berger · Vorname: Lina · Straße und Hausnummer: Bergweg 8 · PLZ und Ort: 34117 Kassel · E-Mail-Adresse: lina.berger@example.com
En allemand, le numéro suit le nom de la rue, et le code postal (die PLZ, Postleitzahl) précède la ville. Lisez les champs à voix haute en séparant bien la rue du numéro et le code postal de la ville.

DATE LIMITE OU RENDEZ-VOUS ?
« Ihre Unterlagen müssen bis Freitag, 12 Uhr, vorliegen. Ihr Termin ist am Montag um 10 Uhr. Bitte bestätigen Sie den Termin über den Link in dieser E-Mail. »
Bis annonce une date limite : les documents doivent être arrivés avant vendredi midi. Am … um … donne le rendez-vous : lundi à 10 h. On le redit ainsi : Ich muss den Adressnachweis bis Freitag um zwölf Uhr schicken. Mein Termin ist am Montag um zehn Uhr.

DEMANDER UNE CORRECTION
Lina a saisi un mauvais numéro de rue. Pour le signaler, on cite le champ, l’erreur, puis la bonne valeur : Im Formular steht Bergweg 6. Richtig ist Bergweg 8. Können Sie das bitte ändern?

ÉCOUTEZ LES MODÈLES
Écoutez les quatre phrases modèles et répétez-les à voix haute. L’exercice « Répéter à voix haute » de ce module vérifie ensuite votre prononciation.`,
      },
    },

    'a2-demarches-pratique': {
      kind: 'exercise',
      title: 'S’entraîner : noter un rendez-vous déplacé',
      estimatedMinutes: 12,
      competences: ['ecoute', 'expression-ecrite'],
      lesson: {
        title: 'S’entraîner : noter un rendez-vous déplacé',
        description: `Une femme appelle la médiathèque : elle a déjà un rendez-vous pour sa carte de bibliothèque, mais elle ne peut pas venir.

1. Écoutez l’appel une première fois sans lire les phrases : veut-elle un premier rendez-vous ou déplacer celui qu’elle a déjà ?
2. Réécoutez pour compléter ses notes : l’ancien et le nouveau créneau, le document à déposer, son format et la date limite. Vous pouvez écrire les nombres en chiffres.
3. Les deux dernières questions sont des dictées : deux phrases utiles pour une démarche.
Après validation, la transcription de l’appel et l’explication de chaque réponse s’affichent.`,
      },
      placements: { remove: ['a2-demarches-dialogue'], add: [dialogue] },
      questions: [
        { id: 'q1', type: 'fill', prompt: 'L’ancien rendez-vous : complétez la note.',
          text: 'Alter Termin: am [[1]] um [[2]] Uhr.',
          blanks: [{ id: '1', accept: ['Donnerstag'], size: 11, hint: null }, { id: '2', accept: ['16', 'sechzehn'], size: 9, hint: null }],
          explanation: 'La femme dit « Ich habe einen Termin … am Donnerstag um sechzehn Uhr. Kann ich ihn verschieben? » : c’est l’ancien créneau, qu’elle veut déplacer.' },
        { id: 'q2', type: 'fill', prompt: 'Le nouveau rendez-vous : complétez la note.',
          text: 'Neuer Termin: am Freitag um [[1]].[[2]] Uhr.',
          blanks: [{ id: '1', accept: ['17', 'siebzehn'], size: 9, hint: null }, { id: '2', accept: ['30', 'dreißig'], size: 8, hint: null }],
          explanation: 'Elle demande « nach siebzehn Uhr » et l’employé propose « um siebzehn Uhr dreißig » : 17 h 30. Elle accepte avec « Ja, danke ».' },
        { id: 'q3', type: 'fill', prompt: 'Le document à déposer : complétez la consigne de l’employé.',
          text: 'Laden Sie bis Mittwoch um zwölf Uhr einen [[1]] als [[2]] hoch.',
          blanks: [{ id: '1', accept: ['Adressnachweis'], size: 15, hint: null }, { id: '2', accept: ['PDF'], size: 5, hint: null }],
          explanation: 'Der Adressnachweis est le justificatif d’adresse, à déposer en PDF. Hochladen est séparable : laden en 1re position (impératif), hoch à la fin.' },
        { id: 'q4', type: 'fill', prompt: 'Faut-il remplir à nouveau le formulaire ? Complétez l’échange.',
          text: 'Muss ich das Formular noch einmal [[1]]? – Nein, Ihr Formular ist schon [[2]].',
          blanks: [{ id: '1', accept: ['ausfüllen'], size: 10, hint: null }, { id: '2', accept: ['da'], size: 5, hint: null }],
          explanation: 'Après le verbe de modalité muss, l’infinitif ausfüllen va à la fin. « Ihr Formular ist schon da » : le formulaire est déjà arrivé, rien à refaire.' },
        { id: 'q5', type: 'fill', prompt: 'Que faut-il apporter vendredi ?',
          text: 'Soll ich am Freitag auch meinen [[1]] mitbringen? – Ja, bitte.',
          blanks: [{ id: '1', accept: ['Ausweis'], size: 9, hint: null }],
          explanation: 'Elle demande si elle doit apporter « meinen Ausweis », sa pièce d’identité, et l’employé confirme : « Ja, bitte ». Mein- prend -en à l’accusatif masculin.' },
        { id: 'q6', type: 'fill', prompt: 'Que contiendra le nouvel e-mail ?',
          text: 'In der E-Mail finden Sie den neuen Termin und den [[1]] zum Hochladen.',
          blanks: [{ id: '1', accept: ['Link'], size: 6, hint: null }],
          explanation: 'Dernière réplique : l’e-mail donne le nouveau rendez-vous et « den Link zum Hochladen », le lien pour déposer le justificatif.' },
        { id: 'q7', type: 'dictation', prompt: 'Écoutez et écrivez la phrase : on prévient qu’on ne peut pas venir.',
          accept: ['Ich kann am Donnerstag leider nicht kommen.'], voice: 'sprecherin',
          explanation: 'Après le verbe de modalité kann, l’infinitif kommen se place à la fin. Les jours de la semaine sont des noms : Donnerstag prend une majuscule.' },
        { id: 'q8', type: 'dictation', prompt: 'Écoutez et écrivez la consigne du service.',
          accept: ['Bitte bringen Sie Ihren Ausweis mit.'], voice: 'mann',
          explanation: 'À l’impératif de politesse, le verbe bringen ouvre la phrase, suivi de Sie ; la particule mit de mitbringen va à la fin. Ihren prend une majuscule : il renvoie à Sie.' },
      ],
    },

    'a2-demarches-approfondir': {
      kind: 'exercise',
      title: 'S’entraîner : lire le statut d’un dossier en ligne',
      estimatedMinutes: 12,
      competences: ['lecture', 'expression-ecrite'],
      lesson: {
        title: 'S’entraîner : lire le statut d’un dossier en ligne',
        description: `Votre messagerie affiche trois avis pour le dossier fictif W-314.
« 08.40: Antrag gespeichert. Bitte laden Sie den Adressnachweis noch hoch. »
« 09.10: Unterlagen erhalten. Ihr Termin am Freitag um 16.45 Uhr ist bestätigt. »
« 11.20: Ihre Bitte um einen anderen Termin ist eingegangen. Bis zur neuen Bestätigung bleibt der Termin am Freitag bestehen. »

Quatre participes reviennent souvent dans ces avis : gespeichert (enregistré), erhalten (reçu), eingegangen (parvenu) et bestätigt (confirmé). Une demande « eingegangen » est arrivée au service, mais elle n’est pas encore acceptée.

Plus tard, le formulaire refuse un fichier : « Datei zu groß. Erlaubt: PDF oder JPG, maximal 2 MB. » Vos fichiers : Adressnachweis.pdf (3 MB), Adressnachweis.jpg (1 MB) et Ausweis.pdf (1 MB).

Enfin, un quatrième avis arrive : « Neuer Termin: Montag, 10.15 Uhr. Bitte bestätigen Sie bis Sonntag, 18 Uhr. »

Lisez les avis, puis répondez. Distinguez toujours l’heure du rendez-vous de l’heure limite pour répondre.`,
      },
      questions: [
        { id: 'q1', type: 'match', prompt: 'Associez chaque mot de l’avis à ce qu’il signifie pour votre dossier.',
          pairs: [
            { left: 'gespeichert', right: 'Votre brouillon est conservé.' },
            { left: 'erhalten', right: 'Le service a reçu un document.' },
            { left: 'eingegangen', right: 'Votre demande est arrivée, sans réponse pour l’instant.' },
            { left: 'bestätigt', right: 'Le rendez-vous est fixé.' },
          ],
          explanation: 'Gespeichert vient de speichern (enregistrer), erhalten signifie recevoir, eingegangen (de eingehen) parvenir, et bestätigt confirmer. Seul bestätigt prouve qu’un rendez-vous est fixé.' },
        { id: 'q2', type: 'choice', prompt: 'Il est 11 h 30. Quel rendez-vous gardez-vous dans votre agenda ?',
          options: [
            { id: 'a', label: 'Aucun : le rendez-vous de vendredi est annulé.', correct: false },
            { id: 'b', label: 'Vendredi à 16 h 45', correct: true },
            { id: 'c', label: 'Lundi à 10 h 15', correct: false },
          ],
          explanation: 'L’avis de 11 h 20 précise « Bis zur neuen Bestätigung bleibt der Termin am Freitag bestehen » : vendredi 16 h 45 reste valable. Le créneau de lundi n’arrive que dans le quatrième avis.' },
        { id: 'q3', type: 'choice', prompt: 'Quel fichier déposez-vous comme justificatif d’adresse ?',
          options: [
            { id: 'a', label: 'Adressnachweis.pdf (3 MB)', correct: false },
            { id: 'b', label: 'Ausweis.pdf (1 MB)', correct: false },
            { id: 'c', label: 'Adressnachweis.jpg (1 MB)', correct: true },
          ],
          explanation: 'Le site accepte « PDF oder JPG, maximal 2 MB » : le PDF de 3 MB est trop lourd (zu groß). Ausweis.pdf a la bonne taille, mais c’est la pièce d’identité, pas le justificatif d’adresse.' },
        { id: 'q4', type: 'fill', prompt: 'Le dépôt échoue encore. Complétez votre message au service.',
          text: 'Ich kann den Adressnachweis nicht [[1]]. Kann ich ihn per E-Mail [[2]]?',
          blanks: [{ id: '1', accept: ['hochladen'], size: 10, hint: 'hoch|laden' }, { id: '2', accept: ['schicken', 'senden'], size: 9, hint: 'envoyer' }],
          explanation: 'Après kann, les infinitifs vont à la fin : hochladen reste soudé à l’infinitif. Pour envoyer un e-mail ou un document, on dit schicken (ou senden).' },
        { id: 'q5', type: 'choice', prompt: 'Quatrième avis : que devez-vous faire avant dimanche à 18 h ?',
          options: [
            { id: 'a', label: 'Confirmer le nouveau rendez-vous.', correct: true },
            { id: 'b', label: 'Vous présenter au service.', correct: false },
            { id: 'c', label: 'Déposer à nouveau le formulaire.', correct: false },
          ],
          explanation: '« Bitte bestätigen Sie bis Sonntag, 18 Uhr » : bis fixe l’heure limite pour confirmer. Le rendez-vous lui-même a lieu lundi à 10 h 15.' },
        { id: 'q6', type: 'fill', prompt: 'Répondez au quatrième avis : complétez votre confirmation.',
          text: 'Dossier W-314: Ich [[1]] den neuen Termin am [[2]] um 10.15 Uhr.',
          blanks: [{ id: '1', accept: ['bestätige'], size: 10, hint: 'bestätigen' }, { id: '2', accept: ['Montag'], size: 8, hint: null }],
          explanation: 'Bestätigen se conjugue ich bestätige. Le nouveau rendez-vous est lundi (am Montag) ; dimanche 18 h n’est que la limite pour répondre.' },
      ],
    },

    'a2-demarches-controle': {
      title: 'Vérifier : un rendez-vous déplacé',
      estimatedMinutes: 10,
      lesson: {
        title: 'Vérifier : un rendez-vous déplacé',
        description: 'Écoutez une première fois l’appel à la médiathèque pour la situation générale. Lisez les questions, puis réécoutez pour les détails. Les deux dernières questions portent sur un avis en ligne et sur une formule utile : répondez sans réécouter. Après validation, la transcription et l’explication de chaque réponse s’affichent.',
      },
      explanations: {
        q1: '« Ich habe einen Termin … am Donnerstag um sechzehn Uhr. Kann ich ihn verschieben? » : elle a déjà un rendez-vous pour sa carte et veut le déplacer. Elle ne parle ni de livre ni de prix.',
        q2: 'L’employé propose « am Freitag … um siebzehn Uhr dreißig » et elle accepte (« Ja, danke »). Jeudi 16 h est l’ancien rendez-vous ; mercredi midi, la date limite du justificatif.',
        q3: '« Laden Sie … einen Adressnachweis als PDF hoch » : un justificatif d’adresse en PDF. Le formulaire est déjà arrivé (« Ihr Formular ist schon da »).',
        q4: '« bis Mittwoch um zwölf Uhr » : bis fixe la date limite, mercredi à midi. Vendredi 17 h 30 est le nouveau rendez-vous, à ne pas confondre avec l’échéance.',
        q5: 'Dernière réplique : « In der E-Mail finden Sie den neuen Termin und den Link zum Hochladen ». Le lien sert à déposer le document ; aucune facture n’est annoncée.',
        q6: 'Eingegangen (de eingehen) signifie que la demande est parvenue au service. Elle n’est pas encore traitée : seul un avis « bestätigt » prouve que le rendez-vous a changé.',
        q7: 'Einen Termin auf Montag verschieben : reporter un rendez-vous à lundi (auf + accusatif pour la nouvelle date). Hochladen (déposer un fichier) et ausfüllen (remplir) ne s’emploient pas avec Termin.',
      },
    },

    'a2-demarches-mission': {
      kind: 'mission',
      title: 'Mission : déplacer un rendez-vous et compléter son dossier',
      estimatedMinutes: 20,
      competences: ['expression-orale', 'expression-ecrite'],
      lesson: {
        title: 'Mission : déplacer un rendez-vous et compléter son dossier',
        description: `Situation : vous demandez une carte de médiathèque. Votre dossier porte la référence B-506. Le justificatif d’adresse doit être déposé avant mardi à midi. Votre rendez-vous est jeudi à 14 h, mais vous ne pouvez pas venir. Au téléphone, on vous propose vendredi à 15 h 15. Ensuite, le portail affiche « Änderung angefragt » et refuse votre fichier.

Modèles : Ich habe einen Termin am Donnerstag um vierzehn Uhr. Kann ich ihn verschieben? Habe ich das richtig verstanden: Mein Termin ist jetzt am Freitag um fünfzehn Uhr fünfzehn? Muss ich den Adressnachweis immer noch bis Dienstag hochladen? Ich kann die Datei nicht hochladen. Kann ich den Adressnachweis als PDF per E-Mail schicken?

Préparez quelques mots-clés, puis réalisez les deux parties. Gardez bien distinctes la date limite (bis Dienstag, 12 Uhr) et le rendez-vous (am Freitag um 15.15 Uhr).`,
      },
      mission: {
        oral: {
          prompt: 'Enregistrez votre appel (une minute environ) : donnez la référence du dossier, demandez à déplacer le rendez-vous de jeudi, reformulez le nouveau créneau pour le confirmer et demandez si la date limite change.',
          maxSeconds: 90,
        },
        written: {
          prompt: 'Écrivez au service un e-mail de 45 à 65 mots : rappelez la référence et la date limite, demandez la confirmation du nouveau rendez-vous et proposez d’envoyer le justificatif d’adresse en pièce jointe.',
          maxChars: 1000,
          minWords: 45,
        },
        checklist: [
          'J’ai donné la référence B-506 à l’oral et dans l’e-mail.',
          'J’ai reformulé le nouveau rendez-vous : vendredi à 15 h 15.',
          'J’ai distingué la date limite (bis Dienstag) et le rendez-vous (am Freitag um …).',
          'Mon e-mail demande une confirmation et propose d’envoyer le justificatif en pièce jointe.',
          'J’ai vérifié les verbes séparables : la particule à la fin (Ich lade … hoch), soudée après un modal (hochladen).',
        ],
      },
    },
  },

  add: [
    {
      after: 'a2-demarches-controle',
      activity: {
        id: 'a2-demarches-repeter',
        kind: 'exercise',
        title: 'Répéter à voix haute : au téléphone avec un service',
        estimatedMinutes: 8,
        competences: ['expression-orale'],
        lesson: {
          title: 'Répéter à voix haute : au téléphone avec un service',
          description: 'Écoutez chaque modèle, puis dites la phrase à voix haute, comme au téléphone. Articulez les jours et les heures : ce sont les informations que votre interlocuteur doit noter. Si la reconnaissance vocale ne comprend pas votre phrase, réécoutez le modèle et réessayez.',
          transcript: null,
        },
        placements: [],
        questions: [
          { id: 'q1', type: 'speak', prompt: 'Écoutez, puis demandez à déplacer votre rendez-vous.',
            text: 'Kann ich meinen Termin verschieben?', accept: ['Kann ich meinen Termin verschieben?'], threshold: 75,
            explanation: 'Question fermée : le modal kann ouvre la phrase et l’infinitif verschieben la termine. Accentuez la deuxième syllabe : ver-SCHIE-ben.' },
          { id: 'q2', type: 'speak', prompt: 'Écoutez, puis proposez un autre moment.',
            text: 'Könnte ich am Freitag nach siebzehn Uhr kommen?', accept: ['Könnte ich am Freitag nach siebzehn Uhr kommen?', 'Könnte ich am Freitag nach 17 Uhr kommen?'], threshold: 75,
            explanation: 'Könnte rend la demande plus polie que kann. Nach siebzehn Uhr veut dire « après 17 h » ; dans siebzehn, le s initial se prononce [z].' },
          { id: 'q3', type: 'speak', prompt: 'Écoutez, puis demandez s’il faut remplir le formulaire à nouveau.',
            text: 'Muss ich das Formular noch einmal ausfüllen?', accept: ['Muss ich das Formular noch einmal ausfüllen?'], threshold: 75,
            explanation: 'Formular s’accentue sur la dernière syllabe : for-mu-LAR. Dans ausfüllen, la particule aus porte l’accent.' },
          { id: 'q4', type: 'speak', prompt: 'Écoutez, puis signalez un problème de dépôt.',
            text: 'Ich kann den Adressnachweis nicht hochladen.', accept: ['Ich kann den Adressnachweis nicht hochladen.'], threshold: 75,
            explanation: 'Adressnachweis se décompose en Adress-nach-weis, accent sur la première partie. Après kann, hochladen reste soudé à la fin de la phrase.' },
          { id: 'q5', type: 'speak', prompt: 'Écoutez, puis vérifiez que vous avez bien compris.',
            text: 'Habe ich das richtig verstanden?', accept: ['Habe ich das richtig verstanden?'], threshold: 75,
            explanation: 'Formule utile pour reformuler une information avant de la noter. Le -ig final de richtig se prononce comme ich.' },
        ],
      },
    },
  ],
};
