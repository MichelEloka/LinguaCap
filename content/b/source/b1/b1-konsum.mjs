// Module B1 n° 15 · thème « Konsum » (lot R3). Acheter, réclamer, obtenir une solution : conditions de retour et de
// garantie, défaut décrit au magasin, réponse du service client (qui fait quoi : le passif) et avis de clients ;
// passif présent et prétérit, passif avec verbe de modalité, etwas machen lassen.
// Reprise réécrite du brouillon B1 V1 : procédure de retour, réclamation, passif, échange, réparation ou remboursement,
// dialogue de la bouilloire et son quiz (content/b1-v1/source/partie2-suite.mjs › b1-konsum).
import { C, bi, choice, fill, order, match, dictation, speak } from '../../lib.mjs';

/** « Richtig / falsch / steht nicht im Text » : r, f ou n pour la bonne réponse. */
const rf = (id, statement, answer, explanation) => choice(id, `${statement} ${C.richtigFalsch}`,
  [['richtig', answer === 'r'], ['falsch', answer === 'f'], ['steht nicht im Text', answer === 'n']], explanation);

export default {
  id: 'b1-konsum',
  title: 'Konsum : acheter, réclamer, obtenir une solution',
  objective: 'Comprendre des conditions de retour et de garantie, décrire un défaut, comprendre qui fait quoi dans une réponse du service client (passif présent, prétérit, avec verbe de modalité) et dire ce que l’on fait faire (lassen).',
  grammarFocus: ['passiv', 'lassen'],
  sources: [
    'Textes, dialogues, avis et exercices originaux LinguaCap.',
    'Situations reprises et réécrites du brouillon B1 V1 (LinguaCap) : procédure de retour, dialogue de la bouilloire au magasin.',
  ],

  vocabulary: [
    { word: 'Reklamation', article: 'die', plural: 'Reklamationen', partOfSpeech: 'noun', translation: 'la réclamation',
      example: 'Ich habe dem Shop eine Reklamation geschickt.', note: null },
    { word: 'reklamieren', partOfSpeech: 'verb', translation: 'faire une réclamation (pour un produit)',
      example: 'Ich möchte diesen Toaster reklamieren.', note: null },
    { word: 'Garantie', article: 'die', plural: 'Garantien', partOfSpeech: 'noun', translation: 'la garantie',
      example: 'Auf das Gerät gibt es zwei Jahre Garantie.', note: 'promesse volontaire du fabricant ou du magasin ≠ die Gewährleistung (légale, 2 ans)' },
    { word: 'Gewährleistung', article: 'die', plural: null, partOfSpeech: 'noun', translation: 'la garantie légale (due par le vendeur)',
      example: 'Die gesetzliche Gewährleistung gilt zwei Jahre ab der Lieferung.', note: 'obligatoire, 2 ans ; ≠ die Garantie, promesse volontaire du fabricant' },
    { word: 'Umtausch', article: 'der', plural: null, partOfSpeech: 'noun', translation: 'l’échange (d’un article)',
      example: 'Ein Umtausch ist nur mit Kassenbon möglich.', note: null },
    { word: 'umtauschen', partOfSpeech: 'verb', translation: 'échanger (un article)',
      example: 'Ich möchte die Jacke umtauschen.', note: 'séparable : um|tauschen' },
    { word: 'Rückerstattung', article: 'die', plural: 'Rückerstattungen', partOfSpeech: 'noun', translation: 'le remboursement',
      example: 'Die Rückerstattung dauert etwa eine Woche.', note: null },
    { word: 'erstatten', partOfSpeech: 'verb', translation: 'rembourser',
      example: 'Wir erstatten Ihnen den Kaufpreis.', note: 'aussi : zurückerstatten' },
    { word: 'Kaufpreis', article: 'der', plural: 'Kaufpreise', partOfSpeech: 'noun', translation: 'le prix d’achat',
      example: 'Der Kaufpreis war 149 Euro.', note: null },
    { word: 'Lieferung', article: 'die', plural: 'Lieferungen', partOfSpeech: 'noun', translation: 'la livraison',
      example: 'Die Lieferung kam vier Tage zu spät.', note: null },
    { word: 'liefern', partOfSpeech: 'verb', translation: 'livrer',
      example: 'Das Paket wird morgen geliefert.', note: null },
    { word: 'Bestellnummer', article: 'die', plural: 'Bestellnummern', partOfSpeech: 'noun', translation: 'le numéro de commande',
      example: 'Bitte nennen Sie Ihre Bestellnummer.', note: null },
    { word: 'defekt', partOfSpeech: 'adjective', translation: 'défectueux, en panne',
      example: 'Der Akku ist leider defekt.', note: null },
    { word: 'kaputtgehen', partOfSpeech: 'verb', translation: 'tomber en panne, se casser',
      example: 'Mein Staubsauger ist nach drei Wochen kaputtgegangen.', note: 'séparable : kaputt|gehen · Perfekt avec sein' },
    { word: 'Mangel', article: 'der', plural: 'Mängel', partOfSpeech: 'noun', translation: 'le défaut (d’un produit)',
      example: 'Bitte beschreiben Sie den Mangel genau.', note: null },
    { word: 'Kassenbon', article: 'der', plural: 'Kassenbons', partOfSpeech: 'noun', translation: 'le ticket de caisse',
      example: 'Haben Sie den Kassenbon dabei?', note: null },
    { word: 'Rechnung', article: 'die', plural: 'Rechnungen', partOfSpeech: 'noun', translation: 'la facture',
      example: 'Legen Sie bitte eine Kopie der Rechnung bei.', note: null },
    { word: 'Kunde', article: 'der', plural: 'Kunden', partOfSpeech: 'noun', translation: 'le client',
      example: 'Der Verkäufer hilft dem Kunden.', note: 'n-Deklination : den, dem, des Kunden · féminin : die Kundin' },
    { word: 'Kundenservice', article: 'der', plural: 'Kundenservices', partOfSpeech: 'noun', translation: 'le service client',
      example: 'Der Kundenservice hat mir schnell geantwortet.', note: null },
    { word: 'Werkstatt', article: 'die', plural: 'Werkstätten', partOfSpeech: 'noun', translation: 'l’atelier (de réparation)',
      example: 'Das Gerät wird in der Werkstatt geprüft.', note: null },
    { word: 'prüfen', partOfSpeech: 'verb', translation: 'contrôler, vérifier',
      example: 'Der Techniker prüft den Akku.', note: null },
    { word: 'reparieren lassen', partOfSpeech: 'expression', translation: 'faire réparer',
      example: 'Ich lasse mein Fahrrad reparieren.', note: 'Perfekt : Ich habe es reparieren lassen.' },
    { word: 'zurückschicken', partOfSpeech: 'verb', translation: 'renvoyer',
      example: 'Bitte schicken Sie das Gerät zurück.', note: 'séparable : zurück|schicken' },
    { word: 'Rücksendeetikett', article: 'das', plural: 'Rücksendeetiketten', partOfSpeech: 'noun', translation: 'l’étiquette de retour',
      example: 'Das Rücksendeetikett finden Sie im Anhang.', note: null },
    { word: 'Versandkosten', article: null, plural: null, partOfSpeech: 'noun', translation: 'les frais d’envoi',
      example: 'Die Versandkosten werden vom Shop übernommen.', note: 'toujours au pluriel : die Versandkosten' },
    { word: 'übernehmen', partOfSpeech: 'verb', translation: 'prendre en charge (des frais)',
      example: 'Wir übernehmen die Kosten für die Reparatur.', note: 'inséparable : übernimmt, übernahm, hat übernommen' },
    { word: 'Gutschein', article: 'der', plural: 'Gutscheine', partOfSpeech: 'noun', translation: 'le bon d’achat',
      example: 'Ich habe einen Gutschein über zehn Euro bekommen.', note: null },
    { word: 'zufrieden sein mit', partOfSpeech: 'expression', translation: 'être satisfait de',
      example: 'Ich bin mit dem Service sehr zufrieden.', note: '+ datif' },
  ],

  media: [
    { key: 'b1-konsum-lesen-bedingungen', kind: 'image', title: 'Conditions de retour du magasin en ligne',
      alt: 'Conditions du magasin en ligne : retour sous 14 jours, garantie légale de 2 ans, garantie du fabricant selon l’appareil, contrôle en atelier (3 à 5 jours ouvrés), réparation, appareil neuf ou remboursement, retour gratuit avec l’étiquette, facture à joindre.',
      image: { layout: 'document', icon: 'package-check', title: 'Rückgabe, Umtausch und Garantie', subtitle: 'Hausgeräte Sommer · Onlineshop',
        rows: [['Rückgabe', 'innerhalb von 14 Tagen nach der Lieferung'], ['Gewährleistung', 'gesetzlich 2 Jahre ab Lieferung'],
          ['Herstellergarantie', 'je nach Gerät (siehe Garantiekarte)'],
          ['Defekte Geräte', 'werden zuerst in unserer Werkstatt geprüft (3–5 Werktage)'], ['Lösungen', 'Reparatur, neues Gerät oder Geld zurück'],
          ['Rücksendung', 'kostenlos mit unserem Etikett']],
        lines: [{ icon: 'receipt', text: 'Bitte legen Sie immer eine Kopie der Rechnung bei.' }] } },

    { key: 'b1-konsum-hoeren-dialog', kind: 'audio', title: 'Au magasin : une bouilloire qui ne chauffe plus',
      script: [
        { voice: 'frau3', name: 'Verkäuferin', text: 'Guten Tag, was kann ich für Sie tun?' },
        { pause: 0.4 },
        { voice: 'mann', name: 'Herr Aydin', text: 'Guten Tag. Ich habe letzten Dienstag diesen Wasserkocher bei Ihnen gekauft. Am ersten Abend hat er noch funktioniert, aber seit gestern bleibt das Wasser kalt. Die Lampe leuchtet, aber er heizt einfach nicht mehr.' },
        { pause: 0.5 },
        { voice: 'frau3', name: 'Verkäuferin', text: 'Oh, das tut mir leid. Haben Sie den Kassenbon dabei?' },
        { pause: 0.4 },
        { voice: 'mann', name: 'Herr Aydin', text: 'Ja, als Foto auf meinem Handy. Reicht das?' },
        { pause: 0.4 },
        { voice: 'frau3', name: 'Verkäuferin', text: 'Ja, das reicht. Normalerweise wird ein defektes Gerät zuerst geprüft. Das dauert etwa zwei Werktage. Danach wird entschieden, ob es repariert oder umgetauscht wird.' },
        { pause: 0.5 },
        { voice: 'mann', name: 'Herr Aydin', text: 'Zwei Tage? Das ist schwierig. Am Freitag bekomme ich Besuch, und ich brauche den Wasserkocher unbedingt. Meinen alten habe ich schon zweimal reparieren lassen. Deshalb habe ich ja einen neuen gekauft.' },
        { pause: 0.5 },
        { voice: 'frau3', name: 'Verkäuferin', text: 'Ich verstehe. Einen Moment, ich frage kurz meinen Kollegen. Herr Schulz, haben wir dieses Modell noch in Silber?' },
        { pause: 0.6 },
        { voice: 'mann3', name: 'Herr Schulz', text: 'In Silber leider nicht mehr. Aber in Weiß haben wir noch zwei Stück im Lager.' },
        { pause: 0.5 },
        { voice: 'frau3', name: 'Verkäuferin', text: 'Gut. Dann mache ich Ihnen einen Vorschlag: Sie lassen den Wasserkocher heute hier. Er wird morgen geprüft, und wenn der Fehler bestätigt wird, bekommen Sie am Donnerstag das weiße Modell. Ich lege es Ihnen zurück.' },
        { pause: 0.5 },
        { voice: 'mann', name: 'Herr Aydin', text: 'Die Farbe ist mir egal. Und was passiert, wenn kein Fehler gefunden wird?' },
        { pause: 0.4 },
        { voice: 'frau3', name: 'Verkäuferin', text: 'Dann rufen wir Sie an, und Sie können Ihr Gerät wieder abholen. Aber ehrlich gesagt: So ein Fehler wird fast immer bestätigt.' },
        { pause: 0.5 },
        { voice: 'mann', name: 'Herr Aydin', text: 'Gut, einverstanden. Könnten Sie mir bitte Bescheid geben, sobald ich das neue Gerät abholen kann?' },
        { pause: 0.4 },
        { voice: 'frau3', name: 'Verkäuferin', text: 'Natürlich. Sie bekommen automatisch eine E-Mail. Den Karton brauchen wir übrigens nicht, nur das Gerät.' },
        { pause: 0.4 },
        { voice: 'mann', name: 'Herr Aydin', text: 'Prima. Vielen Dank für Ihre Hilfe!' },
        { pause: 0.3 },
        { voice: 'frau3', name: 'Verkäuferin', text: 'Gern geschehen. Auf Wiedersehen!' },
      ] },

    { key: 'b1-konsum-lesen2-forum', kind: 'image', title: 'Avis de clients',
      alt: 'Quatre avis de clients : Petra, très satisfaite (aspirateur échangé en une semaine) ; Malte, mécontent (machine à café réparée deux fois sans succès) ; Svenja, livraison en retard, bon d’achat de 10 euros ; Oleg conseille de faire réparer les petits appareils dans un atelier de quartier.',
      image: { layout: 'forum', title: 'Kundenbewertungen: Service und Reparaturen',
        posts: [
          { author: 'Petra K.', date: '12. März', text: 'Mein Akku-Staubsauger war nach drei Wochen kaputt. Er wurde bei mir abgeholt, in der Werkstatt geprüft und schon nach einer Woche gegen ein neues Gerät getauscht. Schneller Service, sehr freundlich. Gerne wieder!' },
          { author: 'Malte_84', date: '15. März', text: 'Leider gar nicht zufrieden. Meine Kaffeemaschine wurde zweimal repariert, aber der Fehler ist immer noch da. Jetzt warte ich seit drei Wochen auf eine Antwort vom Kundenservice. Ich möchte endlich mein Geld zurück!' },
          { author: 'Svenja R.', date: '20. März', text: 'Die Lieferung kam vier Tage zu spät, und der Karton war beschädigt. Das Gerät selbst war zum Glück in Ordnung. Nach meiner Beschwerde wurde mir ein Gutschein über 10 Euro geschickt. Okay, aber nicht super.' },
          { author: 'Oleg T.', date: '22. März', text: 'Mein Tipp: Kleine Geräte lasse ich lieber im Reparaturtreff im Stadtteilzentrum reparieren. Das ist günstiger, und man lernt selbst etwas dabei. Meinen Toaster haben sie dort in zwanzig Minuten repariert.' },
        ] } },

    { key: 'b1-konsum-kontrolle-anruf', kind: 'audio', title: 'Message du service client',
      script: [
        { voice: 'frau2', name: 'Frau Engel', text: 'Guten Tag, Frau Lindner, hier spricht Frau Engel vom Kundenservice von Hausgeräte Sommer. Ihr Staubsauger wurde inzwischen in unserer Werkstatt geprüft. Der Akku war defekt.' },
        { pause: 0.4 },
        { voice: 'frau2', name: 'Frau Engel', text: 'Ein neues Gerät wurde heute an Sie verschickt und wird übermorgen geliefert. Den alten Akku müssen Sie nicht zurückschicken.' },
        { pause: 0.4 },
        { voice: 'frau2', name: 'Frau Engel', text: 'Bei Fragen erreichen Sie uns montags bis freitags von acht bis achtzehn Uhr. Auf Wiederhören!' },
      ] },
  ],

  activities: [
    // 1 · Mise en route
    { id: 'b1-konsum-einstieg', kind: 'lesson', title: 'Mise en route : quand un achat pose problème', estimatedMinutes: 10,
      competences: ['lecture', 'expression-orale'],
      lesson: { description: `KONSUM
[fr] La consommation
${bi('Ein neues Gerät ist kaputt, ein Paket kommt zu spät, die Größe passt nicht: Wie bekommt man eine gute Lösung?', 'Un appareil neuf en panne, un colis en retard, une taille qui ne va pas : comment obtenir une bonne solution ?')}

FRAGEN ZUM EINSTIEG
[fr] Questions pour commencer
• ${bi('Kaufen Sie lieber online oder im Geschäft? Warum?', 'Achetez-vous plutôt en ligne ou en magasin ? Pourquoi ?')}
• ${bi('Haben Sie schon einmal etwas reklamiert? Was ist passiert?', 'Avez-vous déjà fait une réclamation ? Que s’est-il passé ?')}
• ${bi('Lassen Sie kaputte Sachen reparieren, oder kaufen Sie lieber neu?', 'Faites-vous réparer les objets cassés, ou préférez-vous racheter ?')}
${bi('Antworten Sie laut auf Deutsch, in zwei oder drei Sätzen.', 'Répondez à voix haute en allemand, en deux ou trois phrases.')}

ICH KANN …
[fr] Je peux…
• ${bi('Rückgabe- und Garantiebedingungen verstehen', 'comprendre des conditions de retour et de garantie')}
• ${bi('einen Defekt genau beschreiben', 'décrire précisément un défaut')}
• ${bi('verstehen, wer in einer Antwort vom Kundenservice was macht (Passiv)', 'comprendre qui fait quoi dans une réponse du service client (passif)')}
• ${bi('sagen, was ich machen lasse (lassen)', 'dire ce que je fais faire (lassen)')}

WICHTIGE WÖRTER
[fr] Mots-clés
• die Reklamation — la réclamation
• die Garantie — la garantie
• der Umtausch — l’échange
• die Rückerstattung — le remboursement
• die Lieferung — la livraison
• defekt — défectueux, en panne
• der Kassenbon — le ticket de caisse
• der Kunde, die Kundin — le client, la cliente` } },

    // 2 · Lecture longue : réponse du service client et conditions
    { id: 'b1-konsum-lesen', kind: 'exercise', title: 'Comprendre : la réponse du service client', estimatedMinutes: 20,
      competences: ['lecture'],
      lesson: { description: `${C.lesen}
${bi('Situation: Frau Lindner hat einen Staubsauger reklamiert. Hier ist die Antwort vom Kundenservice. Lesen Sie auch die Bedingungen des Shops unter der E-Mail.', 'Situation : Mme Lindner a fait une réclamation pour un aspirateur. Voici la réponse du service client. Lisez aussi les conditions du magasin sous le courriel.')}

STRATEGIE
[fr] Stratégie
${bi('In einer Antwort vom Kundenservice steht oft das Passiv: wird geprüft, wird geschickt. Fragen Sie sich immer: Wer macht das – der Shop oder die Kundin?', 'Une réponse de service client emploie souvent le passif : wird geprüft, wird geschickt. Demandez-vous toujours : qui le fait, le magasin ou la cliente ?')}
${bi('Lesen Sie zuerst den ersten Satz jedes Absatzes. Suchen Sie dann für jede Aufgabe die passende Stelle.', 'Lisez d’abord la première phrase de chaque paragraphe. Cherchez ensuite le passage utile pour chaque question.')}

IHRE REKLAMATION ZUR BESTELLUNG 48213

Sehr geehrte Frau Lindner,

(A) vielen Dank für Ihre Nachricht vom 3. März. Sie schreiben, dass Ihr Akku-Staubsauger, den Sie am 10. Februar in unserem Onlineshop bestellt haben, nicht mehr richtig funktioniert: Das Gerät geht schon nach zwei Minuten aus, obwohl der Akku voll geladen ist. Ein anderes Ladekabel haben Sie auch schon ausprobiert, leider ohne Erfolg. Laut Ihren Angaben haben Sie das Gerät immer so benutzt, wie es in der Bedienungsanleitung steht. Es tut uns sehr leid, dass Sie Ärger mit dem Gerät haben.

(B) Wie bei jeder Reklamation wird Ihr Staubsauger zuerst in unserer Werkstatt geprüft. Dabei werden vor allem der Akku und der Motor getestet. So wird festgestellt, ob wirklich ein Fehler am Gerät vorliegt. Die Prüfung dauert in der Regel drei bis fünf Werktage. Sobald das Ergebnis vorliegt, werden Sie per E-Mail informiert.

(C) Wenn ein Fehler gefunden wird, haben Sie drei Möglichkeiten. Das Gerät kann kostenlos repariert werden. Sie können aber auch ein neues Gerät bekommen; es wird Ihnen dann direkt nach Hause geschickt. Oder Sie bekommen den Kaufpreis von 149 Euro zurück. Bitte teilen Sie uns schon jetzt mit, welche Lösung Sie bevorzugen: Dann geht es nach der Prüfung schneller. Falls kein Fehler festgestellt wird, schicken wir Ihnen Ihren Staubsauger zurück.

(D) Bitte senden Sie uns das Gerät mit dem Rücksendeetikett aus dem Anhang. Das Paket kann in jeder Postfiliale abgegeben werden, und die Versandkosten werden von uns übernommen. Schicken Sie bitte auch das Ladegerät mit, denn es wird ebenfalls geprüft. Legen Sie außerdem eine Kopie der Rechnung bei. Die Originalverpackung brauchen Sie nicht; ein stabiler Karton genügt. Nach dem Eingang des Pakets bekommen Sie eine kurze Bestätigung per E-Mail.

Mit freundlichen Grüßen
Ihr Kundenservice von Hausgeräte Sommer

RÜCKGABE, UMTAUSCH UND GARANTIE
Hausgeräte Sommer, Onlineshop
• Rückgabe: innerhalb von 14 Tagen nach der Lieferung
• Gewährleistung: gesetzlich 2 Jahre ab Lieferung
• Herstellergarantie: je nach Gerät (siehe Garantiekarte)
• Defekte Geräte werden zuerst in unserer Werkstatt geprüft (3–5 Werktage).
• Lösungen: Reparatur, neues Gerät oder Geld zurück
• Rücksendung: kostenlos mit unserem Etikett
• Bitte legen Sie immer eine Kopie der Rechnung bei.` },
      placements: [{ media: 'b1-konsum-lesen-bedingungen', caption: 'Bedingungen des Onlineshops' }],
      questions: [
        choice('q1', bi('Was ist das Ziel dieser E-Mail?', 'Quel est le but de ce courriel ?'),
          [['Der Kundenservice lehnt die Reklamation ab.'], ['Der Kundenservice erklärt, wie es mit der Reklamation weitergeht.', true],
            ['Der Kundenservice bietet einen Rabatt für den nächsten Einkauf an.']],
          'Le courriel résume le problème (A), puis explique la suite : contrôle (B), solutions possibles (C), envoi de l’appareil (D). La réclamation n’est pas refusée, et il n’est question d’aucune remise.'),
        choice('q2', bi('Lesen Sie die Bedingungen des Shops. Worum geht es dort?', 'Lisez les conditions du magasin. De quoi parlent-elles ?'),
          [['um neue Angebote und Preise'], ['um die Öffnungszeiten des Kundenservice'], ['um die Regeln für Rückgabe, Umtausch und Garantie', true]],
          'Le titre le dit (« Rückgabe, Umtausch und Garantie ») et chaque ligne donne une règle : délai de retour, garantie légale (Gewährleistung) et garantie du fabricant, contrôle des appareils, solutions, retour gratuit. Ni prix ni horaires.'),
        rf('q3', 'Frau Lindner hat den Staubsauger in einem Geschäft gekauft.', 'f',
          'Faux : paragraphe A, « den Sie am 10. Februar in unserem Onlineshop bestellt haben ». Elle l’a commandé en ligne, d’où le renvoi par colis.'),
        rf('q4', 'Der Staubsauger wird zuerst in einer Werkstatt geprüft.', 'r',
          'Paragraphe B : « wird Ihr Staubsauger zuerst in unserer Werkstatt geprüft ». Passif présent : c’est l’atelier du magasin qui contrôle, pas la cliente.'),
        rf('q5', 'Eine Reparatur dauert höchstens eine Woche.', 'n',
          'Le texte donne la durée du contrôle (« drei bis fünf Werktage »), pas celle de la réparation : non mentionné. Attention à ne pas confondre die Prüfung (le contrôle) et die Reparatur.'),
        rf('q6', 'Frau Lindner muss die Versandkosten selbst bezahlen.', 'f',
          'Faux : « die Versandkosten werden von uns übernommen ». Au passif, « von uns » désigne celui qui agit : le magasin prend les frais en charge.'),
        match('q7', bi('Welche Überschrift passt zu welchem Absatz? Ordnen Sie zu.', 'Quel intertitre convient à quel paragraphe ? Associez.'),
          [['Absatz A', 'Was Frau Lindner geschrieben hat'], ['Absatz B', 'Wie das Gerät geprüft wird'],
            ['Absatz C', 'Drei mögliche Lösungen'], ['Absatz D', 'Was Frau Lindner jetzt tun muss']],
          'A reprend le message de la cliente (« Sie schreiben, dass … »). B décrit le contrôle en atelier. C énumère les trois possibilités (réparation, appareil neuf, remboursement). D dit ce qu’elle doit faire : renvoyer l’appareil avec l’étiquette et la facture.'),
        fill('q8', bi('Absatz C: „Es wird Ihnen dann direkt nach Hause geschickt.“ Was ist „es“? Ergänzen Sie.', 'Paragraphe C : à quoi renvoie « es » ? Complétez.'),
          '„Es“ ist das neue [[1]].',
          [['Gerät', 'Ersatzgerät']],
          '« es » reprend le nom neutre qui précède : « ein neues Gerät ». C’est le sujet de la phrase passive : l’appareil neuf est envoyé à la cliente (Ihnen, au datif).'),
      ] },

    // 3 · Écoute longue : au magasin
    { id: 'b1-konsum-hoeren', kind: 'exercise', title: 'Comprendre : une bouilloire qui ne chauffe plus', estimatedMinutes: 18,
      competences: ['ecoute'],
      lesson: { description: `${C.hoeren}

${bi('Situation: Herr Aydin bringt einen neuen Wasserkocher zurück ins Geschäft.', 'Situation : M. Aydin rapporte une bouilloire neuve au magasin.')}

STRATEGIE
[fr] Stratégie
${bi('Beim ersten Hören: Was ist das Problem? Was möchte der Kunde? Was bietet die Verkäuferin an?', 'Première écoute : quel est le problème ? que veut le client ? que propose la vendeuse ?')}
${bi('Beim zweiten Hören notieren Sie Details: Zeit, Farbe, Tag.', 'Deuxième écoute : notez les détails, durée, couleur, jour.')}
${bi('Die Transkription sehen Sie nach Ihren Antworten.', 'Vous verrez la transcription après vos réponses.')}` },
      placements: [{ media: 'b1-konsum-hoeren-dialog', transcriptVisibility: 'after_answer' }],
      questions: [
        fill('q1', C.notizen,
          'Problem: Die Lampe leuchtet, aber das Gerät [[1]] nicht. · Kassenbon: als Foto auf dem [[2]] · Prüfung: etwa [[3]] Werktage · Ersatz: dasselbe Modell in [[4]] · Abholung: am [[5]]',
          [['heizt', 'kocht', 'funktioniert'], ['Handy', 'Smartphone', 'Telefon'], ['zwei', '2'], ['Weiß', 'weiß'], ['Donnerstag']],
          'M. Aydin : « Die Lampe leuchtet, aber er heizt einfach nicht mehr » ; le ticket est « als Foto auf meinem Handy ». La vendeuse : le contrôle dure « etwa zwei Werktage ». Le collègue n’a plus d’argent (Silber), mais du blanc (Weiß) ; l’appareil sera prêt jeudi (Donnerstag).'),
        choice('q2', bi('Was schlägt die Verkäuferin vor?', 'Que propose la vendeuse ?'),
          [['Herr Aydin bekommt sofort sein Geld zurück.'], ['Der Wasserkocher wird geprüft, und am Donnerstag bekommt Herr Aydin ein weißes Modell.', true],
            ['Der Wasserkocher wird repariert und am Freitag nach Hause geschickt.']],
          '« Er wird morgen geprüft, und wenn der Fehler bestätigt wird, bekommen Sie am Donnerstag das weiße Modell. » Il n’y a ni remboursement immédiat ni envoi à domicile ; vendredi, c’est le jour de la visite.'),
        choice('q3', bi('Warum ist eine schnelle Lösung für Herrn Aydin wichtig?', 'Pourquoi une solution rapide est-elle importante pour M. Aydin ?'),
          [['Am Freitag bekommt er Besuch.', true], ['Er fährt am Freitag in den Urlaub.'], ['Sein Kassenbon gilt nur bis Freitag.']],
          '« Am Freitag bekomme ich Besuch, und ich brauche den Wasserkocher unbedingt. » Attention : bekommen veut dire « recevoir », jamais « devenir ».'),
        choice('q4', bi('Was passiert, wenn kein Fehler gefunden wird?', 'Que se passe-t-il si aucun défaut n’est trouvé ?'),
          [['Er muss die Prüfung in der Werkstatt selbst bezahlen.'], ['Er bekommt trotzdem am Donnerstag ein neues Gerät.'], ['Das Geschäft ruft ihn an, und er holt sein Gerät wieder ab.', true]],
          '« Dann rufen wir Sie an, und Sie können Ihr Gerät wieder abholen. » Il ne paie rien, et il ne reçoit un nouvel appareil que si le défaut est confirmé.'),
        choice('q5', bi('Welche Aussage stimmt?', 'Quelle affirmation est juste ?'),
          [['Das Modell gibt es noch in Silber.'], ['Das Geschäft braucht den Karton nicht.', true], ['Herr Aydin hat seinen alten Wasserkocher selbst repariert.']],
          '« Den Karton brauchen wir übrigens nicht, nur das Gerät. » Le modèle n’existe plus en argent. Et « Meinen alten habe ich … reparieren lassen » : il l’a fait réparer par quelqu’un d’autre, pas lui-même.'),
      ] },

    // 4 · Grammaire inductive
    { id: 'b1-konsum-entdecken', kind: 'exercise', title: 'Découvrir : le passif et lassen', estimatedMinutes: 10,
      competences: ['lecture'],
      lesson: { description: `${bi('Lesen Sie die Sätze aus der E-Mail, aus dem Gespräch und aus den Bewertungen. Beantworten Sie dann die Fragen.', 'Lisez les phrases tirées du courriel, du dialogue et des avis, puis répondez aux questions.')}
${bi('Achten Sie auf die Verben werden, wurde und lassen.', 'Observez les verbes werden, wurde et lassen.')}

SÄTZE AUS DEN TEXTEN
[fr] Phrases tirées des textes
1. Ihr Staubsauger wird zuerst in unserer Werkstatt geprüft.
2. Die Versandkosten werden von uns übernommen.
3. Das Gerät kann kostenlos repariert werden.
4. Danach wird entschieden, ob es repariert oder umgetauscht wird.
5. Mein Staubsauger wurde bei mir abgeholt.
6. Meine Kaffeemaschine wurde zweimal repariert.
7. Meinen alten Wasserkocher habe ich zweimal reparieren lassen.
8. Kleine Geräte lasse ich lieber im Reparaturtreff reparieren.` },
      questions: [
        choice('q1', bi('Sätze 1 bis 4: Wie wird das Passiv gebildet?', 'Phrases 1 à 4 : comment le passif est-il formé ?'),
          [['mit haben + Partizip II'], ['mit werden + Partizip II', true], ['mit sein + Infinitiv']],
          'Le passif se forme avec werden conjugué (wird, werden) et le participe II à la fin : « wird … geprüft », « werden … übernommen ». Haben + participe forme le parfait actif.'),
        choice('q2', bi('Satz 2: Wer übernimmt die Versandkosten, und wie wird das gesagt?', 'Phrase 2 : qui prend en charge les frais d’envoi, et comment est-ce dit ?'),
          [['der Shop, mit „von uns“ (von + Dativ)', true], ['die Kundin, mit „die Versandkosten“'], ['niemand: Im Passiv sagt man nie, wer handelt.']],
          'Au passif, l’agent (celui qui agit) est souvent omis ; quand on le dit, c’est avec von + datif : « von uns », « vom Kundenservice ». « Die Versandkosten » est le sujet grammatical, ce qui est pris en charge.'),
        match('q3', bi('Welche Form ist das? Ordnen Sie zu.', 'De quelle forme s’agit-il ? Associez.'),
          [['Das Gerät wird geprüft.', 'passif au présent'], ['Das Paket wurde abgeholt.', 'passif au prétérit'],
            ['Das Gerät kann repariert werden.', 'passif avec verbe de modalité'], ['Ich lasse das Gerät reparieren.', 'faire faire par quelqu’un (lassen)']],
          'wird + participe : présent ; wurde + participe : prétérit (phrases 5 et 6) ; verbe de modalité + participe + werden : phrase 3. Avec lassen + infinitif (phrases 7 et 8), le sujet ne fait pas l’action lui-même : il la fait faire.'),
        choice('q4', bi('Satz 3: Wo steht „werden“, wenn es ein Modalverb gibt?', 'Phrase 3 : où se place « werden » quand il y a un verbe de modalité ?'),
          [['direkt nach dem Modalverb'], ['an zweiter Position'], ['ganz am Ende, nach dem Partizip', true]],
          'Le verbe de modalité conjugué est en 2e position (kann), puis le participe et l’infinitif werden ferment la phrase : « kann … repariert werden ». C’est comme « kann … reparieren », avec werden en plus.'),
      ] },

    // 5 · Règle
    { id: 'b1-konsum-regel', kind: 'lesson', title: 'À retenir : le passif et etwas machen lassen', estimatedMinutes: 8,
      competences: ['lecture'],
      lesson: { description: `À RETENIR — le passif (das Passiv)
On emploie le passif quand l’action compte plus que la personne qui agit : procédures, règlements, réponses d’un service client.
• Présent : werden conjugué + participe II à la fin. Das Gerät wird geprüft. Die Geräte werden geprüft.
• Prétérit : wurde + participe II. Das Paket wurde gestern geliefert.
• Avec un verbe de modalité : modal + participe II + werden à la fin. Das Gerät muss repariert werden. Die Ware kann umgetauscht werden.
• Celui qui agit, s’il est nommé : von + datif. Die Kosten werden von uns übernommen.

LES FORMES DE WERDEN
• Présent : ich werde, du wirst, er/sie/es wird, wir werden, ihr werdet, sie/Sie werden
• Prétérit : ich wurde, du wurdest, er/sie/es wurde, wir wurden, ihr wurdet, sie/Sie wurden

ETWAS MACHEN LASSEN
lassen + infinitif = faire faire quelque chose par quelqu’un.
• Ich lasse mein Fahrrad reparieren. (Un mécanicien le répare.)
• Ich repariere mein Fahrrad. (Je le répare moi-même.)
• Au parfait, lassen reste à l’infinitif : Ich habe mein Fahrrad reparieren lassen.

ATTENTION
• werden et sein : Das Paket wird geliefert (on est en train de le livrer, c’est l’action) ; Das Paket ist geliefert (il est livré, c’est le résultat).
• « on » se traduit par man ou par le passif : Man prüft das Gerät = Das Gerät wird geprüft. Les deux sont justes.
• « faire réparer » se dit reparieren lassen, jamais *reparieren machen*.
• werden a trois emplois : devenir (Er wird Arzt), futur (Ich werde kommen), passif (Es wird geprüft). C’est le participe II qui signale le passif.` } },

    // 6 · Grammaire : s'entraîner
    { id: 'b1-konsum-grammatik', kind: 'exercise', title: 'S’entraîner : le passif et lassen', estimatedMinutes: 14,
      competences: ['lecture', 'expression-ecrite'],
      lesson: { description: `${bi('Üben Sie das Passiv im Präsens, im Präteritum und mit Modalverb, und den Gebrauch von lassen.', 'Entraînez-vous au passif au présent, au prétérit et avec verbe de modalité, ainsi qu’à l’emploi de lassen.')}
${bi('Achten Sie auf die Form von werden und auf das Partizip am Satzende.', 'Faites attention à la forme de werden et au participe en fin de phrase.')}` },
      questions: [
        fill('q1', bi('Ergänzen Sie die Formen von „werden“.', 'Complétez avec les formes de « werden ».'),
          'Ihre Bestellung [[1]] heute verschickt. Die Pakete [[2]] morgen geliefert. [[3]] die Versandkosten vom Shop übernommen?',
          [['wird'], ['werden'], ['Werden']],
          'Le verbe s’accorde avec le sujet : die Bestellung (singulier) → wird ; die Pakete, die Versandkosten (pluriel) → werden. Dans la question fermée, werden passe en tête, avec une majuscule.'),
        order('q2', bi('Bilden Sie einen Satz im Passiv.', 'Formez une phrase au passif.'),
          [['Die Rechnung', 'wird', 'Ihnen', 'heute', 'per E-Mail', 'geschickt.'], ['Die Rechnung', 'wird', 'Ihnen', 'per E-Mail', 'heute', 'geschickt.']],
          '« Die Rechnung wird Ihnen heute per E-Mail geschickt. » wird en 2e position, le participe geschickt à la fin ; le pronom Ihnen se place tôt dans la phrase. Le temps (heute) vient d’ordinaire avant la manière (per E-Mail), mais l’inverse est possible.'),
        choice('q3', bi('„Gestern … mein Paket geliefert.“ Welche Form passt?', 'Quelle forme convient ?'),
          [['wird'], ['wurde', true], ['hat']],
          'Gestern situe l’action dans le passé : passif au prétérit, wurde geliefert. Wird serait le présent ; « hat geliefert » serait actif et voudrait dire que le colis a livré quelque chose.'),
        fill('q4', bi('Aktiv → Passiv: „Der Kundenservice beantwortet die E-Mail.“ Ergänzen Sie.', 'Actif → passif. Complétez.'),
          'Die E-Mail [[1]] vom Kundenservice [[2]].',
          [['wird'], ['beantwortet']],
          'Le complément de l’actif (die E-Mail) devient sujet ; le sujet de l’actif devient l’agent avec von + datif (vom Kundenservice). Le participe de beantworten est beantwortet, sans ge- (verbe inséparable).'),
        fill('q5', bi('Passiv im Präteritum: Ergänzen Sie mit dem Verb „finden“.', 'Passif au prétérit : complétez avec le verbe « finden ».'),
          'Der Fehler [[1]] schnell [[2]].',
          [['wurde'], ['gefunden']],
          'Prétérit du passif : wurde + participe II. Le participe de finden est irrégulier : gefunden.'),
        choice('q6', bi('Sie reparieren Ihr Handy nicht selbst, ein Techniker macht das. Welcher Satz passt?', 'Vous ne réparez pas votre téléphone vous-même : un technicien le fait. Quelle phrase convient ?'),
          [['Ich repariere mein Handy.'], ['Ich mache mein Handy reparieren.'], ['Ich lasse mein Handy reparieren.', true]],
          'Faire faire = lassen + infinitif : « Ich lasse mein Handy reparieren ». « Ich repariere » dit qu’on le fait soi-même ; « machen reparieren » calque le français « faire réparer » et n’existe pas.'),
        fill('q7', bi('Ergänzen Sie das fehlende Verb.', 'Complétez avec le verbe manquant.'),
          'Letzte Woche habe ich meine Jacke reinigen [[1]].',
          [['lassen']],
          'Au parfait, lassen employé avec un autre infinitif reste lui-même à l’infinitif : « habe … reinigen lassen ». C’est la forme correcte à l’écrit.'),
        match('q8', bi('Was bedeutet dasselbe? Ordnen Sie zu.', 'Qu’est-ce qui veut dire la même chose ? Associez.'),
          [['Man prüft das Gerät.', 'Das Gerät wird geprüft.'], ['Man prüfte das Gerät.', 'Das Gerät wurde geprüft.'],
            ['Man muss das Gerät prüfen.', 'Das Gerät muss geprüft werden.'], ['Ich lasse das Gerät prüfen.', 'Jemand prüft das Gerät für mich.']],
          'man + verbe actif équivaut au passif au même temps : prüft → wird geprüft, prüfte → wurde geprüft, muss prüfen → muss geprüft werden. Avec lassen, quelqu’un d’autre agit pour moi.'),
        order('q9', bi('Bilden Sie einen Satz.', 'Remettez les mots dans l’ordre.'),
          [['Reduzierte Ware', 'kann', 'leider', 'nicht', 'umgetauscht', 'werden.']],
          '« Reduzierte Ware kann leider nicht umgetauscht werden. » Le verbe de modalité kann est en 2e position ; nicht se place devant le groupe verbal final « umgetauscht werden ».'),
      ] },

    // 7 · Lexique
    { id: 'b1-konsum-wortschatz', kind: 'exercise', title: 'Vocabulaire : réclamer et obtenir une solution', estimatedMinutes: 12,
      competences: ['lecture', 'expression-ecrite'],
      lesson: { description: `${bi('Lernen Sie die Wörter in festen Verbindungen und mit ihrer Wortfamilie.', 'Apprenez les mots dans leurs groupes figés et avec leur famille.')}
${bi('Hören Sie den Wortschatz des Moduls in der Wortliste.', 'Écoutez le vocabulaire du module dans le lexique.')}` },
      questions: [
        match('q1', bi('Welches Verb passt zu welchem Nomen? Ordnen Sie zu.', 'Quel verbe va avec quel nom ? Associez.'),
          [['eine Bestellung', 'aufgeben'], ['den Kaufpreis', 'erstatten'], ['einen Mangel', 'feststellen'], ['eine Frist', 'setzen']],
          'Groupes figés : eine Bestellung aufgeben (passer une commande), den Kaufpreis erstatten (rembourser le prix), einen Mangel feststellen (constater un défaut), eine Frist setzen (fixer un délai). On les retrouve dans toute réclamation.'),
        fill('q2', bi('Ergänzen Sie das Nomen aus derselben Wortfamilie.', 'Complétez avec le nom de la même famille.'),
          'reklamieren → die [[1]] · umtauschen → der [[2]] · liefern → die [[3]] · erstatten → die [[4]]',
          [['Reklamation'], ['Umtausch'], ['Lieferung'], ['Erstattung', 'Rückerstattung']],
          'Trois suffixes fréquents : -ation (die Reklamation), le radical seul (der Umtausch, masculin) et -ung (die Lieferung, die Erstattung), toujours féminin. Rückerstattung est aussi juste.'),
        choice('q3', bi('Sie möchten höflich um eine schnelle Antwort bitten. Was schreiben Sie?', 'Vous voulez demander poliment une réponse rapide. Qu’écrivez-vous ?'),
          [['Antworten Sie sofort!'], ['Ich danke Ihnen für Ihre Antwort von gestern.'], ['Ich wäre Ihnen dankbar, wenn Sie mir bald antworten könnten.', true]],
          'Le Konjunktiv II (« Ich wäre Ihnen dankbar, wenn Sie … könnten ») rend la demande polie et ferme à la fois. L’impératif est trop brutal ; la deuxième phrase remercie pour une réponse déjà reçue.'),
        choice('q4', bi('Sie beschreiben einen Defekt. Welche Formulierung ist am genauesten?', 'Vous décrivez un défaut. Quelle formulation est la plus précise ?'),
          [['Die Lampe leuchtet, aber das Wasser wird nicht heiß.', true], ['Das Gerät ist irgendwie komisch und macht Probleme.'], ['Das Gerät gefällt mir nicht mehr, die Farbe ist hässlich.']],
          'Une bonne description dit ce qui marche et ce qui ne marche pas : le service peut alors agir. « Irgendwie komisch » est trop vague, et « gefällt mir nicht » n’est pas un défaut.'),
        choice('q5', bi('Welcher Satz passt in eine Reklamation, um eine Lösung zu verlangen?', 'Quelle phrase convient dans une réclamation pour demander une solution ?'),
          [['Vielleicht können Sie ja irgendwann etwas machen.'], ['Ich möchte das Gerät umtauschen oder den Kaufpreis zurückbekommen.', true],
            ['Ich kaufe nie wieder bei Ihnen ein.']],
          'On demande une solution claire, avec une alternative. La première phrase est trop floue (irgendwann : un jour), la troisième exprime une colère mais ne demande rien.'),
        fill('q6', bi('Ergänzen Sie die Präposition.', 'Complétez avec la préposition.'),
          'Die Garantie gilt zwei Jahre [[1]] Kaufdatum. Ein Umtausch ist nur [[2]] Kassenbon möglich. Ich beschwere mich [[3]] die lange Lieferzeit.',
          [['ab'], ['mit'], ['über']],
          'ab + date de départ (à partir de) ; mit Kassenbon (avec le ticket) ; sich beschweren über + accusatif (se plaindre de).'),
        match('q7', bi('Was bedeutet das? Ordnen Sie die Erklärungen zu.', 'Que signifient ces mots ? Associez les définitions.'),
          [['der Kassenbon', 'der Beleg, den man an der Kasse bekommt'], ['die Rückerstattung', 'Man bekommt sein Geld zurück.'],
            ['der Umtausch', 'Man bekommt ein anderes Produkt statt des alten.'], ['defekt', 'kaputt, es funktioniert nicht']],
          'Expliquer un mot avec des mots simples aide à la médiation. Umtausch et Rückerstattung sont différents : dans un cas on reçoit un autre produit, dans l’autre son argent.'),
      ] },

    // 8 · Répéter à voix haute
    { id: 'b1-konsum-redemittel', kind: 'exercise', title: 'Répéter à voix haute : réclamer poliment', estimatedMinutes: 9,
      competences: ['expression-orale'],
      lesson: { description: `${C.sprechen}
${bi('Hören Sie zuerst das Modell. Sprechen Sie dann den ganzen Satz freundlich, aber bestimmt.', 'Écoutez d’abord le modèle. Dites ensuite toute la phrase d’un ton aimable mais ferme.')}
${bi('Diese Sätze helfen Ihnen im Geschäft, am Telefon und in den Missionen dieses Themas.', 'Ces phrases vous serviront en magasin, au téléphone et dans les missions de ce thème.')}` },
      questions: [
        speak('q1', 'Leider funktioniert der Wasserkocher seit gestern nicht mehr.',
          'Wasserkocher : accent sur « WAS » ; après « o », le « ch » de « Kocher » se prononce au fond de la gorge, comme dans « Bach ». « seit gestern » + présent : la panne dure encore.'),
        speak('q2', 'Ich möchte das Gerät umtauschen oder mein Geld zurückbekommen.',
          'Umtauschen et zurückbekommen : accent sur la particule (UM-tauschen, zu-RÜCK-bekommen). « Gerät » : accent sur la 2e syllabe, « ä » long.'),
        speak('q3', 'Könnten Sie mir sagen, wie lange die Reparatur dauert?',
          'Question indirecte polie : « dauert » à la fin. « Reparatur » : accent sur la dernière syllabe (-TUR), « r » final peu marqué.'),
        speak('q4', 'Wird das Gerät kostenlos repariert?',
          'Question fermée au passif : la voix monte à la fin. « repariert » : accent sur « RIERT », « ie » long.'),
        speak('q5', 'Ich habe meine Schuhe beim Schuster reparieren lassen.',
          'lassen reste à l’infinitif au parfait. « Schuhe », « Schuster » : « sch » comme « ch » de « chat », et « u » long [uː] dans les deux mots.'),
        speak('q6', 'Ich wäre Ihnen dankbar, wenn Sie mir bald antworten könnten.',
          'Formule écrite et orale très utile. Petite pause à la virgule ; « könnten » à la fin, avec un « ö » bref. Accent de phrase sur « DANKbar » et « BALD ».'),
      ] },

    // 9 · Second document : avis de clients, avec dictées
    { id: 'b1-konsum-lesen2', kind: 'exercise', title: 'Comprendre : des avis de clients', estimatedMinutes: 15,
      competences: ['lecture', 'ecoute'],
      lesson: { description: `${bi('Lesen Sie die Bewertungen auf der Seite des Onlineshops. Beantworten Sie dann die Fragen.', 'Lisez les avis sur la page du magasin en ligne, puis répondez aux questions.')}

STRATEGIE
[fr] Stratégie
${bi('Suchen Sie zuerst: Wer ist zufrieden, wer nicht? Achten Sie auf Wörter wie leider, zufrieden, schnell, Tipp.', 'Cherchez d’abord : qui est satisfait, qui ne l’est pas ? Repérez des mots comme leider, zufrieden, schnell, Tipp.')}
${bi('Die letzten zwei Aufgaben sind Diktate: Schreiben Sie genau, was Sie hören.', 'Les deux dernières questions sont des dictées : écrivez exactement ce que vous entendez.')}

KUNDENBEWERTUNGEN: SERVICE UND REPARATUREN
Petra K. (12. März): Mein Akku-Staubsauger war nach drei Wochen kaputt. Er wurde bei mir abgeholt, in der Werkstatt geprüft und schon nach einer Woche gegen ein neues Gerät getauscht. Schneller Service, sehr freundlich. Gerne wieder!
Malte_84 (15. März): Leider gar nicht zufrieden. Meine Kaffeemaschine wurde zweimal repariert, aber der Fehler ist immer noch da. Jetzt warte ich seit drei Wochen auf eine Antwort vom Kundenservice. Ich möchte endlich mein Geld zurück!
Svenja R. (20. März): Die Lieferung kam vier Tage zu spät, und der Karton war beschädigt. Das Gerät selbst war zum Glück in Ordnung. Nach meiner Beschwerde wurde mir ein Gutschein über 10 Euro geschickt. Okay, aber nicht super.
Oleg T. (22. März): Mein Tipp: Kleine Geräte lasse ich lieber im Reparaturtreff im Stadtteilzentrum reparieren. Das ist günstiger, und man lernt selbst etwas dabei. Meinen Toaster haben sie dort in zwanzig Minuten repariert.` },
      placements: [{ media: 'b1-konsum-lesen2-forum', caption: 'Kundenbewertungen' }],
      questions: [
        choice('q1', bi('Wer ist mit dem Service sehr zufrieden?', 'Qui est très satisfait du service ?'),
          [['Malte_84'], ['Petra K.', true], ['Svenja R.']],
          'Petra écrit « Schneller Service, sehr freundlich. Gerne wieder! ». Malte est mécontent (« gar nicht zufrieden ») et Svenja seulement moyennement (« Okay, aber nicht super »).'),
        choice('q2', bi('Was ist Maltes Problem?', 'Quel est le problème de Malte ?'),
          [['Seine Kaffeemaschine wurde nie geliefert.'], ['Er hat einen Gutschein bekommen, aber er wollte Geld.'],
            ['Seine Kaffeemaschine funktioniert trotz zwei Reparaturen nicht richtig.', true]],
          '« Meine Kaffeemaschine wurde zweimal repariert, aber der Fehler ist immer noch da. » C’est Svenja qui a reçu un bon d’achat, pas Malte.'),
        choice('q3', bi('Was hat Svenja nach ihrer Beschwerde bekommen?', 'Qu’a reçu Svenja après sa réclamation ?'),
          [['einen Gutschein', true], ['ein neues Gerät'], ['ihr Geld zurück']],
          '« Nach meiner Beschwerde wurde mir ein Gutschein über 10 Euro geschickt » : passif au prétérit avec un datif (mir). Son appareil fonctionnait, elle n’en avait pas besoin d’un autre.'),
        choice('q4', bi('Was empfiehlt Oleg?', 'Que conseille Oleg ?'),
          [['kaputte Geräte sofort wegzuwerfen und neu zu kaufen'], ['kleine Geräte im Reparaturtreff reparieren zu lassen', true], ['kleine Geräte nur noch im Onlineshop zu kaufen']],
          '« Kleine Geräte lasse ich lieber im Reparaturtreff … reparieren » : il les fait réparer dans un atelier de quartier, moins cher, où l’on apprend en même temps.'),
        dictation('q5', 'Das defekte Gerät wird abgeholt und in der Werkstatt geprüft.',
          'Passif présent avec deux participes : abgeholt et geprüft, à la fin de chaque partie. « defekte » prend -e après l’article das. Gerät et Werkstatt : noms, donc majuscule.', 'sprecher'),
        dictation('q6', 'Ich lasse meine Schuhe lieber reparieren, statt neue zu kaufen.',
          'lassen + infinitif (reparieren) ; virgule devant « statt … zu kaufen ». « Schuhe » : h muet entre u et e. « neue » sans nom répété : des neuves.', 'frau'),
      ] },

    // 10 · Vérifier
    { id: 'b1-konsum-kontrolle', kind: 'exercise', title: 'Vérifier : acheter, réclamer, obtenir une solution', estimatedMinutes: 14,
      competences: ['lecture', 'ecoute'],
      lesson: { description: `${bi('Hier wiederholen Sie das ganze Modul: Grammatik, Wörter und Hören.', 'Ici, vous révisez tout le module : grammaire, vocabulaire et écoute.')}
${bi('Für die Fragen 1 und 2 hören Sie eine Nachricht vom Kundenservice an Frau Lindner.', 'Pour les questions 1 et 2, écoutez un message du service client à Mme Lindner.')}` },
      placements: [{ media: 'b1-konsum-kontrolle-anruf', transcriptVisibility: 'after_answer' }],
      questions: [
        choice('q1', bi('Hören Sie die Nachricht: Was war das Problem?', 'Écoutez le message : quel était le problème ?'),
          [['Das Ladekabel fehlte.'], ['Der Akku war defekt.', true], ['Das Gerät war gar nicht kaputt.']],
          '« Ihr Staubsauger wurde inzwischen in unserer Werkstatt geprüft. Der Akku war defekt. » Le contrôle a donc confirmé un défaut.'),
        choice('q2', bi('Wann kommt das neue Gerät?', 'Quand le nouvel appareil arrive-t-il ?'),
          [['heute'], ['morgen'], ['übermorgen', true]],
          '« Ein neues Gerät wurde heute an Sie verschickt und wird übermorgen geliefert. » Aujourd’hui, c’est l’envoi (wurde verschickt) ; la livraison a lieu après-demain (übermorgen).'),
        order('q3', bi('Bilden Sie eine höfliche Frage.', 'Formez une question polie.'),
          [['Können', 'Sie', 'mir', 'sagen,', 'wann', 'das Gerät', 'geliefert', 'wird?']],
          '« Können Sie mir sagen, wann das Gerät geliefert wird? » Question indirecte : après wann, le verbe conjugué (wird) va à la toute fin, après le participe.'),
        fill('q4', bi('Ergänzen Sie wurde oder wird.', 'Complétez avec wurde ou wird.'),
          'Das Paket [[1]] gestern verschickt und [[2]] morgen geliefert.',
          [['wurde'], ['wird']],
          'Gestern → prétérit (wurde verschickt) ; morgen → présent à valeur de futur (wird geliefert). Le passif garde la même structure aux deux temps.'),
        choice('q5', bi('„Ich habe mir beim Friseur die Haare … .“ Welche Form ist richtig?', 'Quelle forme est correcte ?'),
          [['schneiden lassen', true], ['lassen schneiden'], ['geschnitten lassen']],
          'Faire couper ses cheveux : schneiden lassen. Au parfait, l’ordre est infinitif + lassen à la fin, et lassen ne devient pas « gelassen ».'),
        match('q6', bi('Ordnen Sie die Wörter zu.', 'Associez les mots.'),
          [['die Reklamation', 'la réclamation'], ['der Umtausch', 'l’échange'], ['die Rückerstattung', 'le remboursement'], ['der Kassenbon', 'le ticket de caisse']],
          'Quatre mots clés du thème. Attention : der Umtausch (on repart avec un autre produit) n’est pas die Rückerstattung (on récupère son argent).'),
        choice('q7', bi('Der Verkäufer sagt: „Das Gerät muss zuerst geprüft werden.“ Welche Reaktion ist höflich und passend?', 'Le vendeur dit que l’appareil doit d’abord être contrôlé. Quelle réaction est polie et adaptée ?'),
          [['Prüfen Sie es doch selbst!'], ['Das ist mir egal, ich will sofort ein neues!'], ['Wie lange dauert das ungefähr?', true]],
          'On accepte la procédure et on demande une information utile pour s’organiser. Les deux autres réactions sont impolies et ne font pas avancer la réclamation.'),
      ] },
  ],
};
