// Module B1 n° 12 · atelier « Lernen » (lot R2), dernier module avant le bilan intermédiaire (modules 1 à 12).
// Se renseigner et motiver son choix : modèles annotés (demande d'information formelle, comparaison orale de deux
// offres), réagir au téléphone avec une école de langues, médiation du français vers l'allemand (brochure d'un stage),
// erreurs typiques, entraînement au format Schreiben (préparer une contribution d'opinion à un forum), deux missions.
// Reprise réécrite du brouillon B1 V1 (content/b1-v1/source/partie2-suite.mjs › b1-lernen) : tâches « Justifier son
// choix et poser les questions utiles » et « Comparer deux formations avec une personne qui vous conseille ».
import { C, bi, choice, fill, order, match, speak, GRIDS } from '../../lib.mjs';

/** Indices affichés sous les trous d'un fill (forme de base à transformer). */
const hints = (question, ...values) => ({ ...question,
  blanks: question.blanks.map((blank, index) => (values[index] ? { ...blank, hint: values[index] } : blank)) });

export default {
  id: 'b1-lernen-atelier',
  title: 'Lernen, atelier : se renseigner et motiver son choix',
  objective: 'Écrire une demande d’information formelle à une école de langues, comparer deux offres et justifier son choix à l’oral, transmettre en allemand une brochure lue en français et préparer une contribution d’opinion à un forum.',
  grammarFocus: [],
  sources: [
    'Textes, dialogues et exercices originaux LinguaCap.',
    'Situations reprises et réécrites du brouillon B1 V1 (LinguaCap) : justifier le choix d’une formation, comparer deux offres avec un conseiller.',
  ],

  vocabulary: [
    { word: 'Ich interessiere mich für …', partOfSpeech: 'expression', translation: 'Je m’intéresse à …',
      example: 'Ich interessiere mich für Ihren Intensivkurs im Juli.', note: '+ accusatif' },
    { word: 'Ich würde gern wissen, ob …', partOfSpeech: 'expression', translation: 'J’aimerais savoir si …',
      example: 'Ich würde gern wissen, ob die Prüfung im Preis enthalten ist.', note: 'verbe à la fin après ob' },
    { word: 'Könnten Sie mir bitte mitteilen, …?', partOfSpeech: 'expression', translation: 'Pourriez-vous m’indiquer … ?',
      example: 'Könnten Sie mir bitte mitteilen, wie viele Personen in einer Gruppe sind?', note: 'séparable : mit|teilen' },
    { word: 'im Preis enthalten sein', partOfSpeech: 'expression', translation: 'être compris dans le prix',
      example: 'Das Lehrbuch ist im Preis enthalten.', note: null },
    { word: 'Für mich ist wichtig, dass …', partOfSpeech: 'expression', translation: 'Pour moi, il est important que …',
      example: 'Für mich ist wichtig, dass der Kurs abends stattfindet.', note: 'verbe à la fin après dass' },
    { word: 'im Vergleich zu', partOfSpeech: 'expression', translation: 'par rapport à, comparé à',
      example: 'Im Vergleich zu Kurs A ist Kurs B billiger.', note: '+ datif' },
    { word: 'Ein Vorteil ist, dass …', partOfSpeech: 'expression', translation: 'Un avantage, c’est que …',
      example: 'Ein Vorteil ist, dass man zu Hause lernen kann.', note: 'contraire : Ein Nachteil ist, dass …' },
    { word: 'sich entscheiden für', partOfSpeech: 'verb', translation: 'se décider pour, choisir',
      example: 'Am Ende habe ich mich für den Abendkurs entschieden.', note: '+ accusatif · entschied, hat entschieden' },
    { word: 'Meiner Meinung nach …', partOfSpeech: 'expression', translation: 'À mon avis …',
      example: 'Meiner Meinung nach ist eine Lerngruppe sehr hilfreich.', note: 'le verbe suit directement : Meiner Meinung nach ist …' },
    { word: 'Ich bin der Meinung, dass …', partOfSpeech: 'expression', translation: 'Je suis d’avis que …',
      example: 'Ich bin der Meinung, dass Apps einen Kurs nicht ersetzen.', note: null },
    { word: 'einerseits …, andererseits …', partOfSpeech: 'expression', translation: 'd’un côté …, de l’autre …',
      example: 'Einerseits sind Apps billig, andererseits fehlt der Kontakt zu anderen.', note: 'verbe juste après chaque connecteur' },
    { word: 'Alles in allem …', partOfSpeech: 'expression', translation: 'Tout compte fait …, en résumé …',
      example: 'Alles in allem finde ich den Präsenzkurs besser.', note: null },
    { word: 'Vielen Dank im Voraus.', partOfSpeech: 'expression', translation: 'Merci d’avance.',
      example: 'Vielen Dank im Voraus für Ihre Antwort.', note: null },
    { word: 'Ich freue mich auf Ihre Antwort.', partOfSpeech: 'expression', translation: 'Dans l’attente de votre réponse.',
      example: 'Ich freue mich auf Ihre Antwort und grüße Sie herzlich.', note: 'sich freuen auf + accusatif' },
    { word: 'Anzahlung', article: 'die', plural: 'Anzahlungen', partOfSpeech: 'noun', translation: 'l’acompte',
      example: 'Bei der Anmeldung zahlt man eine Anzahlung von 100 Euro.', note: null },
  ],

  media: [
    { key: 'b1-lernen-atelier-modell-audio', kind: 'audio', title: 'Modèle : comparer deux offres et choisir',
      script: [
        { voice: 'mann2', name: 'Daniel', text: 'Ich habe zwei Kursangebote verglichen. Kurs A ist ein Abendkurs im Bildungszentrum, zweimal pro Woche. Kurs B ist ein Onlinekurs am Samstagvormittag.' },
        { voice: 'mann2', name: 'Daniel', text: 'Ein Vorteil von Kurs A ist, dass ich die anderen jede Woche sehe und viel spreche. Ein Nachteil ist der lange Weg: Mit dem Bus brauche ich fast eine Stunde.' },
        { voice: 'mann2', name: 'Daniel', text: 'Im Vergleich zu Kurs A ist Kurs B dreißig Euro billiger, aber man bekommt kein Zertifikat. Für mich ist wichtiger, dass ich am Ende ein Zertifikat habe, denn ich brauche es für meine Arbeit.' },
        { voice: 'mann2', name: 'Daniel', text: 'Deshalb habe ich mich für Kurs A entschieden. Eine Frage habe ich aber noch: Kann man eine Stunde nachholen, wenn man krank ist?' },
      ] },
    { key: 'b1-lernen-atelier-interaktion-satz1', kind: 'audio', title: 'Au téléphone avec l’école : réplique 1',
      script: [{ voice: 'frau3', name: 'Frau Wendt', text: 'Sprachschule am Markt, Sie sprechen mit Frau Wendt. Was kann ich für Sie tun?' }] },
    { key: 'b1-lernen-atelier-interaktion-satz2', kind: 'audio', title: 'Au téléphone avec l’école : réplique 2',
      script: [{ voice: 'frau3', name: 'Frau Wendt', text: 'Der Intensivkurs im Juli ist leider schon voll. Möchten Sie auf die Warteliste?' }] },
    { key: 'b1-lernen-atelier-interaktion-satz3', kind: 'audio', title: 'Au téléphone avec l’école : réplique 3',
      script: [{ voice: 'frau3', name: 'Frau Wendt', text: 'Wir haben auch einen Onlinekurs am Abend. Wäre das eine Alternative für Sie?' }] },
    { key: 'b1-lernen-atelier-interaktion-satz4', kind: 'audio', title: 'Au téléphone avec l’école : réplique 4',
      script: [{ voice: 'frau3', name: 'Frau Wendt', text: 'Gut, dann schicke ich Ihnen alle Informationen per E-Mail.' }] },
    { key: 'b1-lernen-atelier-pruefung-forum', kind: 'image', title: 'Forum : « Lernen mit Apps »',
      alt: 'Message de forum de Timo : il apprend l’espagnol seulement avec une application et pense que bientôt personne n’aura plus besoin de cours de langue.',
      image: { layout: 'forum', title: 'Lernen mit Apps – brauchen wir bald keine Sprachkurse mehr?', posts: [
        { author: 'Timo_B', date: '12. Mai', text: 'Ich lerne seit einem Jahr Spanisch nur mit einer App, jeden Tag zehn Minuten im Bus. Das ist billig und praktisch, und ich kenne schon viele Wörter. Ich glaube, in ein paar Jahren braucht niemand mehr einen Sprachkurs. Was meint ihr?' },
      ] } },
    { key: 'b1-lernen-atelier-sprechen-angebote', kind: 'image', title: 'Deux offres de cours à comparer',
      alt: 'Tableau de deux offres : A, cours sur place le mardi et le jeudi soir, 290 €, certificat compris ; B, cours en ligne le samedi matin, 210 €, attestation de participation.',
      image: { layout: 'table', icon: 'graduation-cap', title: 'Deutsch B1 · zwei Angebote', subtitle: 'Sprachschule am Markt',
        columns: ['', 'Angebot A', 'Angebot B'],
        rows: [['Kursart', 'Präsenzkurs', 'Onlinekurs mit Live-Stunden'], ['Zeit', 'Di + Do, 18:00–20:15', 'Sa, 9:00–12:00'],
          ['Dauer', '10 Wochen', '8 Wochen'], ['Preis', '290 €', '210 €'], ['Gruppe', 'bis 12 Personen', 'bis 8 Personen'],
          ['Abschluss', 'Zertifikat (Prüfung inklusive)', 'Teilnahmebestätigung']] } },
  ],

  activities: [
    // 1 · Modèle annoté
    { id: 'b1-lernen-atelier-modell', kind: 'lesson', title: 'Modèle : une demande d’information et une comparaison orale', estimatedMinutes: 12,
      competences: ['lecture', 'ecoute'],
      lesson: { description: `MODELL: EINE ANFRAGE AN EINE SPRACHSCHULE
[fr] Modèle : une demande d’information à une école de langues
${bi('Lesen Sie die E-Mail von Amina Ndiaye. Sie stellt ihre Fragen höflich und indirekt.', 'Lisez le courriel d’Amina Ndiaye. Elle pose ses questions de façon polie et indirecte.')}

Betreff: Anfrage zum Intensivkurs Deutsch B1 im Juli
Sehr geehrte Damen und Herren,
auf Ihrer Internetseite habe ich gelesen, dass Sie im Juli einen Intensivkurs Deutsch B1 anbieten. Ich interessiere mich sehr für diesen Kurs, weil ich im Herbst eine Ausbildung als Pflegefachfrau beginnen möchte und dafür ein B1-Zertifikat brauche.
Dazu hätte ich einige Fragen. Könnten Sie mir bitte mitteilen, wie viele Personen in einer Gruppe sind? Außerdem würde ich gern wissen, ob die Prüfung am Ende im Kurspreis enthalten ist. Da ich vormittags arbeite, möchte ich auch fragen, ob es eine Nachmittagsgruppe gibt. Gibt es eine Ermäßigung für Personen ohne festes Einkommen?
Über eine baldige Antwort würde ich mich sehr freuen. Vielen Dank im Voraus.
Mit freundlichen Grüßen
Amina Ndiaye

AUFBAU
[fr] Structure
1. ${bi('Betreff: Kurs und Anliegen nennen.', 'Objet : nommer le cours et l’objet de la demande.')}
2. ${bi('Einleitung: Woher kennen Sie das Angebot? Warum interessiert es Sie?', 'Introduction : où avez-vous vu l’offre ? Pourquoi vous intéresse-t-elle ?')}
3. ${bi('Hauptteil: zwei bis vier Fragen, höflich und indirekt gestellt.', 'Développement : deux à quatre questions, posées de façon polie et indirecte.')}
4. ${bi('Schluss: Bitte um Antwort, Dank und Grußformel ohne Komma.', 'Conclusion : demande de réponse, remerciement et formule finale, sans virgule après celle-ci.')}

EINLEITEN
[fr] Introduire
• Auf Ihrer Internetseite habe ich gelesen, dass … — J’ai lu sur votre site que …
• Ich interessiere mich sehr für … — Je m’intéresse beaucoup à …
BEGRÜNDEN
[fr] Justifier
• …, weil ich ein B1-Zertifikat brauche. — … parce que j’ai besoin d’un certificat B1.
• Da ich vormittags arbeite, … — Comme je travaille le matin, …
FRAGEN
[fr] Demander
• Könnten Sie mir bitte mitteilen, wie viele …? — Pourriez-vous m’indiquer combien … ?
• Ich würde gern wissen, ob … — J’aimerais savoir si …
SCHLUSS
[fr] Conclure
• Über eine baldige Antwort würde ich mich sehr freuen. — Une réponse rapide me ferait très plaisir.
• Vielen Dank im Voraus. — Merci d’avance.

MODELL: ZWEI ANGEBOTE VERGLEICHEN
[fr] Modèle : comparer deux offres
${bi('Hören Sie, wie Daniel zwei Kurse vergleicht. Er stellt beide Kurse vor, nennt Vor- und Nachteile, entscheidet sich und stellt am Ende eine Frage.', 'Écoutez comment Daniel compare deux cours. Il présente les deux cours, cite avantages et inconvénients, fait son choix et pose une question pour finir.')}
• Ein Vorteil von Kurs A ist, dass … · Ein Nachteil ist … — Un avantage du cours A, c’est que … · Un inconvénient, c’est …
• Im Vergleich zu Kurs A ist Kurs B billiger. — Par rapport au cours A, le cours B est moins cher.
• Für mich ist wichtiger, dass … — Pour moi, ce qui compte le plus, c’est que …
• Deshalb habe ich mich für … entschieden. — C’est pourquoi j’ai choisi …` },
      placements: [{ media: 'b1-lernen-atelier-modell-audio', caption: 'Daniel vergleicht zwei Kurse' }] },

    // 2 · Réagir en situation
    { id: 'b1-lernen-atelier-interaktion', kind: 'exercise', title: 'Réagir : se renseigner au téléphone', estimatedMinutes: 10,
      competences: ['ecoute', 'expression-orale'],
      lesson: { description: `${C.reagieren}

SITUATION
[fr] La situation
${bi('Sie möchten im Juli einen Intensivkurs machen und rufen bei der Sprachschule am Markt an. Frau Wendt ist am Telefon. Hören Sie jeden Satz und wählen Sie die beste Reaktion.', 'Vous voulez suivre un cours intensif en juillet et vous appelez l’école de langues. Mme Wendt répond. Écoutez chaque réplique et choisissez la meilleure réaction.')}
${bi('Sprechen Sie danach die Sätze laut nach.', 'Répétez ensuite les phrases à voix haute.')}` },
      placements: [
        { media: 'b1-lernen-atelier-interaktion-satz1', questionId: 'q1', transcriptVisibility: 'after_answer' },
        { media: 'b1-lernen-atelier-interaktion-satz2', questionId: 'q2', transcriptVisibility: 'after_answer' },
        { media: 'b1-lernen-atelier-interaktion-satz3', questionId: 'q3', transcriptVisibility: 'after_answer' },
        { media: 'b1-lernen-atelier-interaktion-satz4', questionId: 'q4', transcriptVisibility: 'after_answer' },
      ],
      questions: [
        choice('q1', bi('Satz 1: Was antworten Sie?', 'Réplique 1 : que répondez-vous ?'),
          [['Guten Tag, ich möchte sofort einen Platz, und zwar im besten Kurs, den Sie haben.'],
            ['Guten Tag, ich interessiere mich für Ihren B1-Kurs im Juli und hätte ein paar Fragen.', true],
            ['Ja, das können Sie gern für mich machen.']],
          'On salue, on annonce le sujet de l’appel (ich interessiere mich für …) et on prépare ses questions (ich hätte ein paar Fragen). La première réponse est exigeante ; la troisième ne répond pas à « Was kann ich für Sie tun? ».'),
        choice('q2', bi('Satz 2: Was antworten Sie?', 'Réplique 2 : que répondez-vous ?'),
          [['Ja, gern. Wie groß sind meine Chancen, noch einen Platz zu bekommen?', true], ['Nein danke, voll bin ich heute zum Glück noch nicht.'],
            ['Ja, dann warte ich hier am Telefon, bis ein Platz frei wird.']],
          'Accepter la liste d’attente et demander ses chances est une réaction utile. « Voll » se rapporte au cours (complet), pas à vous ; et on n’attend évidemment pas au téléphone qu’une place se libère.'),
        choice('q3', bi('Satz 3: Was antworten Sie?', 'Réplique 3 : que répondez-vous ?'),
          [['Nein, Alternativen interessieren mich überhaupt nicht. Auf Wiederhören.'], ['Ja, am Abend bin ich immer sehr müde.'],
            ['Vielleicht. Könnten Sie mir sagen, wie oft man sich online trifft?', true]],
          'Avant de décider, on se renseigne poliment (question indirecte, verbe « trifft » à la fin). Raccrocher sèchement est impoli ; dire « oui » tout en étant toujours fatigué le soir est incohérent.'),
        choice('q4', bi('Satz 4: Was antworten Sie?', 'Réplique 4 : que répondez-vous ?'),
          [['Ich schicke Ihnen auch gern alle Informationen per E-Mail.'], ['Das wäre sehr nett. Soll ich Ihnen meine Adresse buchstabieren?', true],
            ['Nein, E-Mails lese ich nie, schicken Sie mir lieber gar nichts.']],
          '« Das wäre sehr nett » (ce serait très gentil) accepte poliment au Konjunktiv II ; proposer d’épeler son adresse évite les erreurs. La première réplique inverse les rôles ; la troisième rend l’échange inutile.'),
        speak('q5', 'Wie groß sind meine Chancen, noch einen Platz zu bekommen?',
          'Question sur ses chances : « noch einen Platz zu bekommen » est un infinitif avec zu qui complète « Chancen ». Question ouverte (wie) : l’intonation redescend à la fin.'),
        speak('q6', 'Könnten Sie mir sagen, wie oft man sich online trifft?',
          'Question indirecte : le verbe « trifft » (de treffen, se retrouver) ferme la phrase ; le pronom « sich » suit le sujet « man ».'),
        speak('q7', 'Das wäre sehr nett. Soll ich Ihnen meine Adresse buchstabieren?',
          'Accepter poliment avec « Das wäre … » ; « buchstabieren » : épeler, accent sur -BIE-. Pour épeler, entraînez-vous aussi à l’alphabet : A wie Anton…'),
      ] },

    // 3 · Médiation (du français vers l'allemand)
    { id: 'b1-lernen-atelier-mediation', kind: 'exercise', title: 'Médiation : expliquer une brochure française à une amie', estimatedMinutes: 15,
      competences: ['lecture', 'expression-ecrite'],
      lesson: { description: `SITUATION
[fr] La situation
${bi('Ihre Freundin Jana aus Leipzig möchte im Juli eine Woche in Frankreich einen Fotokurs machen. Sie spricht nur ein bisschen Französisch, hat keine eigene Kamera und kann höchstens 400 Euro ausgeben. Sie haben eine Broschüre auf Französisch gefunden. Erklären Sie Jana auf Deutsch, was darin steht.', 'Votre amie Jana, de Leipzig, veut suivre un stage photo d’une semaine en France en juillet. Elle parle un peu français, n’a pas d’appareil photo et peut dépenser 400 euros au maximum. Vous avez trouvé une brochure en français : expliquez-lui en allemand ce qu’elle contient.')}

DIE BROSCHÜRE
[fr] La brochure (en français)
Atelier d’été : photographie urbaine à Lyon
Du lundi 7 au vendredi 11 juillet, de 9 h à 16 h, avec une heure de pause pour le déjeuner.
Groupes de dix participants au maximum, niveau débutant ou intermédiaire.
Le cours est donné en français ; la formatrice parle aussi anglais.
Prix : 380 €, déjeuners non compris. Réduction de 10 % pour les étudiants.
Apportez votre appareil photo. Un prêt est possible sur demande, mais le nombre d’appareils est limité.
Inscription avant le 15 mai, en ligne ou par téléphone. Un acompte de 100 € est demandé à l’inscription. En cas d’annulation après le 15 juin, l’acompte n’est pas remboursé.

TIPP
[fr] Conseil
${bi('Übersetzen Sie nicht Wort für Wort. Sagen Sie Jana nur, was für sie wichtig ist, mit einfachen deutschen Sätzen.', 'Ne traduisez pas mot à mot. Dites à Jana seulement ce qui compte pour elle, avec des phrases allemandes simples.')}` },
      questions: [
        fill('q1', bi('Ergänzen Sie die Notizen für Jana auf Deutsch.', 'Complétez les notes pour Jana, en allemand.'),
          'Fotokurs in Lyon: vom [[1]] bis 11. Juli, von 9 bis [[2]] Uhr · höchstens [[3]] Personen pro Gruppe · Preis: 380 Euro, Mittagessen [[4]] inklusive · Anmeldung bis zum [[5]] Mai',
          [['7.', '7', 'siebten'], ['16', 'sechzehn'], ['10', 'zehn'], ['nicht'], ['15.', '15', 'fünfzehnten']],
          'On reporte les informations de la brochure dans des notes allemandes : du 7 au 11 juillet, de 9 h à 16 h, dix personnes au maximum, 380 euros sans les déjeuners (déjeuners non compris = Mittagessen nicht inklusive), inscription avant le 15 mai.'),
        choice('q2', bi('Jana hat keine eigene Kamera. Was sagen Sie ihr?', 'Jana n’a pas d’appareil photo. Que lui dites-vous ?'),
          [['Kameras sind im Preis inklusive, das ist kein Problem.'], ['Du kannst eine Kamera leihen, aber es gibt nur wenige. Frag am besten früh.', true],
            ['Ohne eigene Kamera kannst du leider nicht teilnehmen.']],
          '« Un prêt est possible sur demande, mais le nombre d’appareils est limité » : on peut emprunter un appareil (leihen), mais il y en a peu. Le conseil de demander tôt est une bonne médiation : il aide Jana à agir.'),
        choice('q3', bi('Jana spricht nur wenig Französisch. Was sagen Sie ihr?', 'Jana parle peu français. Que lui dites-vous ?'),
          [['Der Kurs ist auf Französisch, aber die Kursleiterin spricht auch Englisch.', true], ['Der Kurs ist auf Englisch, Französisch brauchst du gar nicht.'],
            ['Die Kursleiterin spricht auch Deutsch, das ist praktisch für dich.']],
          '« Le cours est donné en français ; la formatrice parle aussi anglais. » Le cours n’est pas en anglais, et l’allemand n’est pas mentionné : ne promettez jamais plus que ce que dit le document.'),
        order('q4', bi('Erklären Sie Jana die Regel für die Anzahlung. Bilden Sie den Satz.', 'Expliquez à Jana la règle de l’acompte. Remettez les mots dans l’ordre.'),
          [['Wenn', 'du', 'nach dem 15. Juni', 'absagst,', 'bekommst', 'du', 'die Anzahlung', 'nicht', 'zurück.']],
          'Une phrase simple avec wenn pour « En cas d’annulation après le 15 juin » : verbe « absagst » à la fin de la subordonnée, puis « bekommst du … zurück ». Die Anzahlung : l’acompte.'),
        choice('q5', bi('Passt der Kurs zu Janas Budget von 400 Euro?', 'Le stage entre-t-il dans le budget de 400 euros de Jana ?'),
          [['Nein, der Kurs kostet mehr als 400 Euro.'], ['Ja, und das Mittagessen ist sogar schon im Preis enthalten.'],
            ['Ja, aber das Mittagessen muss sie selbst bezahlen.', true]],
          '380 euros, c’est moins que 400, mais « déjeuners non compris » : les repas de midi sont en plus. Pour Jana, l’information importante est justement ce coût supplémentaire.'),
      ] },

    // 4 · Erreurs typiques
    { id: 'b1-lernen-atelier-korrektur', kind: 'exercise', title: 'Corriger : les erreurs fréquentes dans une demande', estimatedMinutes: 12,
      competences: ['lecture', 'expression-ecrite'],
      lesson: { description: `${bi('Diese Sätze kommen aus Anfragen von Kursteilnehmenden. Finden Sie die richtige Form.', 'Ces phrases viennent de demandes d’apprenants. Trouvez la forme correcte.')}

KORREKTURZEICHEN
[fr] Les codes de correction
Rappel : St (place des mots), G (grammaire), W (vocabulaire), R (orthographe), A (registre : du ou Sie). Dans une demande d’information, les erreurs les plus fréquentes touchent la question indirecte (St) et le but (G).` },
      questions: [
        choice('q1', bi('St: Welcher Satz ist richtig?', 'St : quelle phrase est correcte ?'),
          [['Ich würde gern wissen, ob findet der Kurs am Abend statt.'], ['Ich würde gern wissen, ob der Kurs am Abend stattfindet.', true],
            ['Ich würde gern wissen, wenn der Kurs am Abend stattfindet.']],
          'Question indirecte fermée : ob, puis le verbe à la fin, avec la particule ressoudée (stattfindet). La première phrase garde l’ordre de la question directe ; wenn (condition) ne convient pas après « wissen ».'),
        choice('q2', bi('G: Welcher Satz ist richtig?', 'G : quelle phrase est correcte ?'),
          [['Der Onlinekurs ist billiger als der Abendkurs.', true], ['Der Onlinekurs ist billiger wie der Abendkurs.'], ['Der Onlinekurs ist mehr billig als der Abendkurs.']],
          'Après un comparatif, on emploie als : billiger als. Wie sert à l’égalité (so billig wie). « Mehr billig » imite « plus cher » : en allemand, le comparatif se forme avec -er.'),
        fill('q3', bi('W: Ergänzen Sie die Präpositionen.', 'W : complétez avec les prépositions.'),
          'Ich interessiere mich [[1]] Ihren Kurs. · Wie viele Personen nehmen [[2]] dem Kurs teil?',
          [['für'], ['an']],
          'Sich interessieren für + accusatif ; teilnehmen an + datif (an dem Kurs, souvent contracté en am Kurs). Ces prépositions ne se devinent pas à partir du français : apprenez-les avec le verbe.'),
        choice('q4', bi('G: Welcher Satz ist richtig?', 'G : quelle phrase est correcte ?'),
          [['Ich lerne Deutsch für in Deutschland zu arbeiten.'], ['Ich lerne Deutsch, um in Deutschland arbeiten.'], ['Ich lerne Deutsch, um in Deutschland zu arbeiten.', true]],
          'Le but avec le même sujet : um … zu + infinitif à la fin, précédé d’une virgule. Für ne s’emploie pas devant un verbe ; sans zu, la construction avec um est incomplète.'),
        hints(fill('q5', bi('G: Ergänzen Sie den Infinitiv mit „zu“.', 'G : complétez avec l’infinitif précédé de « zu ».'),
          'Ich habe vor, mich nächste Woche für den Kurs [[1]].',
          [['anzumelden']],
          'Vorhaben (avoir l’intention de) est suivi de zu + infinitif. Anmelden a une particule séparable : zu se place au milieu, en un seul mot.'),
        'anmelden'),
        order('q6', bi('St: Bilden Sie den Satz.', 'St : remettez les mots dans l’ordre.'),
          [['Da', 'ich', 'vormittags', 'arbeite,', 'suche', 'ich', 'eine Nachmittagsgruppe.']],
          'Da (comme, puisque) introduit une subordonnée : verbe « arbeite » à la fin. La principale suit avec son verbe en tête : suche ich … Même règle qu’après wenn ou weil en début de phrase.'),
      ] },

    // 5 · Entraînement au format : Schreiben (préparer un avis argumenté)
    { id: 'b1-lernen-atelier-pruefung', kind: 'exercise', title: 'Format d’examen : préparer un avis pour un forum', estimatedMinutes: 18,
      competences: ['lecture', 'expression-ecrite'],
      lesson: { description: `PRÜFUNGSTRAINING SCHREIBEN
[fr] Entraînement à l’examen : expression écrite
${bi('In der Prüfung schreiben Sie oft Ihre Meinung zu einem Thema in einem Forum. Hier trainieren Sie die Vorbereitung: Aufbau, Konnektoren und Redemittel.', 'À l’examen, on donne souvent son avis sur un thème dans un forum. Vous vous entraînez ici à le préparer : structure, connecteurs et formules.')}
ZEIT
[fr] Temps
${bi('Für einen ganzen Beitrag planen Sie etwa 25 Minuten: 5 Minuten planen, 15 Minuten schreiben, 5 Minuten prüfen.', 'Pour une contribution complète, prévoyez environ 25 minutes : 5 pour planifier, 15 pour écrire, 5 pour vérifier.')}

STRATEGIE
[fr] Stratégie
1. ${bi('Lesen Sie die Frage im Forum genau: Wozu genau sollen Sie Ihre Meinung sagen?', 'Lisez précisément la question du forum : sur quoi exactement devez-vous donner votre avis ?')}
2. ${bi('Planen Sie: Meinung, zwei Argumente mit Beispiel, ein Gegenargument, Schluss.', 'Planifiez : avis, deux arguments avec un exemple, un contre-argument, conclusion.')}
3. ${bi('Verbinden Sie Ihre Sätze mit Konnektoren: erstens, außerdem, aber, trotzdem, deshalb.', 'Reliez vos phrases avec des connecteurs : erstens, außerdem, aber, trotzdem, deshalb.')}

DER BEITRAG VON TIMO
[fr] La contribution de Timo
Ich lerne seit einem Jahr Spanisch nur mit einer App, jeden Tag zehn Minuten im Bus. Das ist billig und praktisch, und ich kenne schon viele Wörter. Ich glaube, in ein paar Jahren braucht niemand mehr einen Sprachkurs. Was meint ihr?` },
      placements: [{ media: 'b1-lernen-atelier-pruefung-forum', caption: 'Lernen mit Apps' }],
      questions: [
        order('q1', bi('Bringen Sie die Sätze der Antwort in die richtige Reihenfolge.', 'Remettez les phrases de la réponse dans le bon ordre.'),
          [['Ich habe den Beitrag von Timo mit Interesse gelesen.', 'Meiner Meinung nach können Apps den Unterricht nicht ersetzen.',
            'Erstens fehlt bei einer App das freie Sprechen.', 'Zweitens korrigiert eine App nicht alle Fehler.',
            'Trotzdem finde ich Apps gut, um Vokabeln zu wiederholen.', 'Alles in allem empfehle ich eine Mischung aus Kurs und App.']],
          'Une contribution claire suit le plan : référence au message, avis, deux arguments annoncés par erstens et zweitens, une concession (trotzdem), puis une conclusion (alles in allem). Les connecteurs montrent l’ordre logique.'),
        choice('q2', bi('Welches Wort passt? „Apps sind praktisch, … sie ersetzen keine Lehrerin.“', 'Quel mot convient ?'),
          [['deshalb'], ['aber', true], ['weil']],
          'Après la virgule, la suite garde l’ordre sujet + verbe (sie ersetzen) : il faut un connecteur qui ne change pas l’ordre des mots, comme aber. Deshalb demanderait le verbe tout de suite (deshalb ersetzen sie), weil le verbe à la fin ; le sens d’opposition appelle aussi aber.'),
        fill('q3', bi('Ergänzen Sie die Redemittel.', 'Complétez les formules.'),
          '[[1]] Meinung nach ist eine Lerngruppe wichtig. · Ich bin [[2]] Meinung, dass Apps helfen können. · Einerseits sind Apps billig, [[3]] fehlt der Kontakt zu anderen.',
          [['Meiner'], ['der'], ['andererseits']],
          'Meiner Meinung nach (à mon avis) : datif, et le verbe suit directement. Ich bin der Meinung, dass … (je suis d’avis que). Einerseits … andererseits … (d’un côté … de l’autre), avec le verbe juste après chaque connecteur.'),
        match('q4', bi('Welche Formulierung passt zu welcher Funktion? Ordnen Sie zu.', 'Quelle formule correspond à quelle fonction ? Associez.'),
          [['eine Meinung sagen', 'Ich finde, dass …'], ['ein Argument einleiten', 'Ein wichtiger Grund ist …'],
            ['ein Gegenargument nennen', 'Andererseits muss man sagen, dass …'], ['zum Schluss kommen', 'Alles in allem …']],
          'Classez vos formules par fonction, comme dans le modèle : donner son avis, introduire un argument, nuancer, conclure. À l’examen, varier ces formules compte pour la cohérence et le vocabulaire.'),
        choice('q5', bi('Welcher Schluss passt am besten zu der Antwort?', 'Quelle conclusion convient le mieux à la réponse ?'),
          [['Ich habe jetzt leider keine Zeit mehr zum Schreiben, tschüss!'], ['Ich hoffe, dass das Wetter morgen besser wird als heute.'],
            ['Deshalb finde ich: Apps sind eine gute Hilfe, aber kein Ersatz für einen Kurs.', true]],
          'La conclusion reprend l’avis et le nuance : une aide, pas un remplacement. Les deux autres phrases sortent du sujet : à l’examen, chaque phrase doit servir la tâche.'),
        hints(fill('q6', bi('Ergänzen Sie die Konnektoren.', 'Complétez avec les connecteurs.'),
          'Apps sind praktisch. [[1]] lerne ich jeden Morgen im Bus zehn Minuten. [[2]] brauche ich einen Kurs, denn eine App korrigiert meine Aussprache nicht.',
          [['Deshalb', 'Darum', 'Daher', 'Deswegen'], ['Trotzdem', 'Dennoch']],
          'Deshalb (c’est pourquoi) introduit une conséquence ; trotzdem (malgré tout) une opposition. Comme tous les adverbes en tête de phrase, ils sont suivis directement du verbe : deshalb lerne ich, trotzdem brauche ich.'),
        'conséquence', 'opposition'),
      ] },

    // 6 · Mission écrite
    { id: 'b1-lernen-atelier-schreiben', kind: 'mission', title: 'Mission : écrire une demande à une école de langues', estimatedMinutes: 25,
      competences: ['expression-ecrite'],
      lesson: { description: `SITUATION
[fr] La situation
${bi('Sie möchten Ihr Deutsch verbessern und haben diese Anzeige gefunden. Bevor Sie sich anmelden, schreiben Sie der Sprachschule eine E-Mail mit Ihren Fragen.', 'Vous voulez améliorer votre allemand et avez trouvé cette annonce. Avant de vous inscrire, vous écrivez un courriel à l’école avec vos questions.')}

DIE ANZEIGE
Sprachschule am Markt: Sommer-Intensivkurse Deutsch (B1 und B2). Vier Wochen, Montag bis Freitag, Vormittags- und Nachmittagsgruppen. Prüfung am Ende möglich. Ihre Ansprechpartnerin ist Frau Wendt.

SO GEHEN SIE VOR
[fr] Démarche
1. ${bi('Planen (5 Minuten): Überlegen Sie sich Stichwörter: Warum schreiben Sie? Was ist Ihr Ziel? Welche drei Fragen haben Sie?', 'Planifier (5 minutes) : trouvez des mots-clés. Pourquoi écrivez-vous ? Quel est votre objectif ? Quelles sont vos trois questions ?')}
2. ${bi('Schreiben (15 Minuten): Folgen Sie dem Aufbau aus dem Modell von Amina.', 'Écrire (15 minutes) : suivez la structure du modèle d’Amina.')}
3. ${bi('Prüfen (5 Minuten): Lesen Sie Ihren Text mit der Checkliste noch einmal.', 'Vérifier (5 minutes) : relisez votre texte avec la liste de vérification.')}` },
      mission: {
        oral: null,
        written: { prompt: bi('Schreiben Sie eine E-Mail an Frau Wendt (120 bis 150 Wörter). Sagen Sie, warum Sie schreiben und was Ihr Ziel ist (um … zu, damit oder weil). Stellen Sie mindestens drei höfliche Fragen, zum Beispiel zur Gruppengröße, zu den Zeiten, zur Prüfung oder zum Preis. Bitten Sie am Ende um eine Antwort.',
          'Écrivez un courriel à Mme Wendt (120 à 150 mots). Dites pourquoi vous écrivez et quel est votre objectif (um … zu, damit ou weil). Posez au moins trois questions polies, par exemple sur la taille des groupes, les horaires, l’examen ou le prix. Demandez une réponse pour finir.'),
          maxChars: 1500, minWords: 120 },
        checklist: [
          bi('Betreff, Anrede und Grußformel ohne Komma', 'Objet, formule d’appel, formule finale sans virgule'),
          bi('Mein Ziel mit „um … zu“, „damit“ oder „weil“', 'Mon objectif avec « um … zu », « damit » ou « weil »'),
          bi('Mindestens drei Fragen, davon zwei indirekt (ob, wie viele …)', 'Au moins trois questions, dont deux indirectes'),
          bi('Bitte um Antwort und Dank', 'Demande de réponse et remerciement'),
          bi('Verb am Ende nach „ob“, „dass“, „weil“', 'Verbe à la fin après « ob », « dass », « weil »'),
        ],
        criteria: [
          { ...GRIDS.b1.schreiben[0], label: 'Tâche : raison et objectif exposés, au moins trois questions précises, demande de réponse ; registre formel (Sie)' },
          ...GRIDS.b1.schreiben.slice(1),
        ],
      } },

    // 7 · Mission orale
    { id: 'b1-lernen-atelier-sprechen', kind: 'mission', title: 'Mission : comparer deux cours et choisir', estimatedMinutes: 20,
      competences: ['expression-orale'],
      lesson: { description: `SITUATION
[fr] La situation
${bi('Sie möchten Ihr Deutsch verbessern, zum Beispiel für die Arbeit oder für eine Prüfung. Die Sprachschule bietet zwei Kurse an. Vergleichen Sie die Angebote und entscheiden Sie sich.', 'Vous voulez améliorer votre allemand, par exemple pour le travail ou pour un examen. L’école propose deux cours. Comparez-les et faites votre choix.')}

DIE ANGEBOTE
Angebot A ist ein Präsenzkurs am Dienstag und Donnerstag von 18:00 bis 20:15 Uhr, zehn Wochen lang, für 290 Euro. In einer Gruppe sind bis zu zwölf Personen. Am Ende gibt es ein Zertifikat, die Prüfung ist inklusive.
Angebot B ist ein Onlinekurs mit Live-Stunden am Samstag von 9:00 bis 12:00 Uhr, acht Wochen lang, für 210 Euro. In einer Gruppe sind bis zu acht Personen. Am Ende gibt es eine Teilnahmebestätigung.

IHRE PRÄSENTATION
[fr] Votre présentation
• ${bi('Stellen Sie beide Angebote kurz vor.', 'Présentez brièvement les deux offres.')}
• ${bi('Nennen Sie mindestens zwei Vorteile und Nachteile.', 'Citez au moins deux avantages et inconvénients.')}
• ${bi('Entscheiden Sie sich und begründen Sie Ihre Wahl mit Ihrem Ziel (um … zu, damit, weil).', 'Faites votre choix et justifiez-le par votre objectif (um … zu, damit, weil).')}
• ${bi('Stellen Sie am Ende eine Frage, die noch offen ist.', 'Posez pour finir une question qui reste ouverte.')}

VORBEREITUNG
[fr] Préparation
${bi('Hören Sie noch einmal das Modell von Daniel. Überlegen Sie sich Stichwörter, aber sprechen Sie frei.', 'Réécoutez le modèle de Daniel. Préparez des mots-clés, mais parlez librement.')}` },
      placements: [{ media: 'b1-lernen-atelier-sprechen-angebote', caption: 'Zwei Angebote' }],
      mission: {
        oral: { prompt: bi('Vergleichen Sie die zwei Angebote und entscheiden Sie sich (etwa zweieinhalb Minuten). Nennen Sie Vor- und Nachteile, begründen Sie Ihre Wahl mit Ihrem Ziel und stellen Sie am Ende eine offene Frage.',
          'Comparez les deux offres et faites votre choix (environ deux minutes et demie). Citez avantages et inconvénients, justifiez votre choix par votre objectif et posez pour finir une question ouverte.'),
          maxSeconds: 150 },
        written: null,
        checklist: [
          bi('Ich stelle beide Angebote kurz vor.', 'Je présente brièvement les deux offres.'),
          bi('Ich vergleiche: „im Vergleich zu“, „billiger als“, „Ein Vorteil ist …“', 'Je compare : « im Vergleich zu », « billiger als », « Ein Vorteil ist … »'),
          bi('Ich begründe meine Wahl mit meinem Ziel.', 'Je justifie mon choix par mon objectif.'),
          bi('Ich stelle am Ende eine offene Frage.', 'Je pose pour finir une question ouverte.'),
        ],
        criteria: [
          { ...GRIDS.b1.sprechen[0], label: 'Tâche : deux offres présentées, avantages et inconvénients, choix justifié par un objectif, une question finale, dans le temps imparti' },
          ...GRIDS.b1.sprechen.slice(1),
        ],
      } },

    // 8 · Faire le point (avant le bilan intermédiaire)
    { id: 'b1-lernen-atelier-bilan', kind: 'lesson', title: 'Faire le point : formation, puis bilan intermédiaire', estimatedMinutes: 6,
      competences: ['lecture'],
      lesson: { description: `${bi('Lesen Sie die Ziele der Module Lernen. Was können Sie schon gut? Was möchten Sie noch üben?', 'Relisez les objectifs des modules Lernen. Que savez-vous déjà bien faire ? Que voulez-vous encore travailler ?')}

ICH KANN …
[fr] Je peux…
• ${bi('Ich kann Kursangebote vergleichen und mich begründet entscheiden.', 'Je peux comparer des offres de cours et faire un choix motivé.')}
• ${bi('Ich kann eine formelle Anfrage mit höflichen Fragen schreiben.', 'Je peux écrire une demande formelle avec des questions polies.')}
• ${bi('Ich kann sagen, wozu ich etwas mache: „um … zu“, „damit“.', 'Je peux dire dans quel but je fais quelque chose : « um … zu », « damit ».')}
• ${bi('Ich kann einer Freundin auf Deutsch erklären, was in einem französischen Text steht.', 'Je peux expliquer en allemand à une amie ce que dit un texte français.')}
• ${bi('Ich kann einen Forumsbeitrag mit Meinung und Argumenten planen.', 'Je peux planifier une contribution de forum avec un avis et des arguments.')}

NÄCHSTER SCHRITT: DER ZWISCHENTEST
[fr] Prochaine étape : le bilan intermédiaire
${bi('Nach diesem Modul kommt der Zwischentest zu den Modulen 1 bis 12: Lesen, Hören, Schreiben und Sprechen.', 'Après ce module vient le bilan intermédiaire sur les modules 1 à 12 : lecture, écoute, écrit et oral.')}
Avant de le commencer, revoyez les points de grammaire de chaque thème, dans les leçons « À retenir » : le récit au passé (Neuanfang), les verbes à préposition (Beziehungen), les relatives (Wohnen), le Konjunktiv II de politesse et les questions indirectes (Arbeit), wenn, falls et sollte (Gesundheit), um … zu et damit (Lernen). Relisez aussi les modèles des ateliers : courriel formel, message amical, avis.` } },
  ],
};
