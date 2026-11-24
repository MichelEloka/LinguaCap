// Module B1 n° 5 · thème « Wohnen » (lot R1). Vivre ensemble dans un immeuble : règlement intérieur et avis au panneau
// d'affichage, accord entre voisins pour le local à vélos, message de la régie ; relatives au nominatif, à l'accusatif,
// au datif et avec préposition (der Raum, in dem …), rappel stellen / stehen, legen / liegen, hängen.
// Reprise réécrite du brouillon B1 V1 : affichage dans le couloir, message de Luc Martin à sa voisine, leçon sur les
// relatives, dialogue de Paula et M. Yilmaz sur le local à vélos (content/b1-v1/source/partie1.mjs › b1-wohnen).
import { C, bi, choice, fill, order, match, dictation, speak } from '../../lib.mjs';

/** « Richtig / falsch / steht nicht im Text » : r, f ou n pour la bonne réponse. */
const rf = (id, statement, answer, explanation) => choice(id, `${statement} ${C.richtigFalsch}`,
  [['richtig', answer === 'r'], ['falsch', answer === 'f'], ['steht nicht im Text', answer === 'n']], explanation);

export default {
  id: 'b1-wohnen',
  title: 'Wohnen : vivre ensemble dans un immeuble',
  objective: 'Comprendre un règlement intérieur et un avis aux habitants, décrire un problème de logement et préciser de qui ou de quoi l’on parle avec des relatives (der Raum, in dem …).',
  grammarFocus: ['relativsaetze', 'wechselpraepositionen'],
  sources: [
    'Textes, dialogues et exercices originaux LinguaCap.',
    'Situations reprises et réécrites du brouillon B1 V1 (LinguaCap) : avis dans le couloir, message à une voisine, accord pour le local à vélos.',
  ],

  vocabulary: [
    { word: 'Hausordnung', article: 'die', plural: 'Hausordnungen', partOfSpeech: 'noun', translation: 'le règlement intérieur (de l’immeuble)',
      example: 'In der Hausordnung steht, wann die Ruhezeiten sind.', note: null },
    { word: 'Nebenkosten', article: 'die', plural: null, partOfSpeech: 'noun', translation: 'les charges (eau, chauffage, ordures…)',
      example: 'Die Nebenkosten sind in der Miete nicht enthalten.', note: 'toujours au pluriel' },
    { word: 'Mietvertrag', article: 'der', plural: 'Mietverträge', partOfSpeech: 'noun', translation: 'le bail, le contrat de location',
      example: 'Im Mietvertrag steht, dass Haustiere erlaubt sind.', note: null },
    { word: 'Hausverwaltung', article: 'die', plural: 'Hausverwaltungen', partOfSpeech: 'noun', translation: 'la régie, le gestionnaire de l’immeuble',
      example: 'Bei Problemen schreiben Sie bitte der Hausverwaltung.', note: null },
    { word: 'Hausmeister', article: 'der', plural: 'Hausmeister', partOfSpeech: 'noun', translation: 'le gardien, le concierge',
      example: 'Der Hausmeister repariert die Klingel am Donnerstag.', note: 'féminin : die Hausmeisterin' },
    { word: 'Mieter', article: 'der', plural: 'Mieter', partOfSpeech: 'noun', translation: 'le locataire',
      example: 'Jeder Mieter bekommt einen Schlüssel für den Keller.', note: 'féminin : die Mieterin · der Vermieter : le bailleur' },
    { word: 'Bewohner', article: 'der', plural: 'Bewohner', partOfSpeech: 'noun', translation: 'l’habitant',
      example: 'Liebe Bewohnerinnen und Bewohner, bitte lesen Sie diesen Aushang.', note: 'féminin : die Bewohnerin' },
    { word: 'Ruhezeit', article: 'die', plural: 'Ruhezeiten', partOfSpeech: 'noun', translation: 'les heures de calme (silence obligatoire)',
      example: 'Während der Ruhezeit muss es im Haus leise sein.', note: null },
    { word: 'Lärm', article: 'der', plural: null, partOfSpeech: 'noun', translation: 'le bruit',
      example: 'Nach 22 Uhr stört der Lärm die Nachbarn.', note: 'pas de pluriel' },
    { word: 'Mülltrennung', article: 'die', plural: null, partOfSpeech: 'noun', translation: 'le tri des déchets',
      example: 'Die Mülltrennung ist in der Hausordnung genau beschrieben.', note: 'den Müll trennen : trier les déchets' },
    { word: 'Mülltonne', article: 'die', plural: 'Mülltonnen', partOfSpeech: 'noun', translation: 'la poubelle (conteneur)',
      example: 'Die Mülltonnen stehen im Hof.', note: 'blaue Tonne : papier · gelbe Tonne : emballages' },
    { word: 'Fahrradkeller', article: 'der', plural: 'Fahrradkeller', partOfSpeech: 'noun', translation: 'le local à vélos (au sous-sol)',
      example: 'Die Fahrräder gehören in den Fahrradkeller.', note: null },
    { word: 'Treppenhaus', article: 'das', plural: 'Treppenhäuser', partOfSpeech: 'noun', translation: 'la cage d’escalier',
      example: 'Im Treppenhaus dürfen keine Schuhe stehen.', note: null },
    { word: 'Flur', article: 'der', plural: 'Flure', partOfSpeech: 'noun', translation: 'le couloir, l’entrée',
      example: 'Im Flur steht seit Montag ein großes Regal.', note: null },
    { word: 'Hof', article: 'der', plural: 'Höfe', partOfSpeech: 'noun', translation: 'la cour',
      example: 'Die Kinder spielen im Hof.', note: null },
    { word: 'Aushang', article: 'der', plural: 'Aushänge', partOfSpeech: 'noun', translation: 'l’avis affiché',
      example: 'Der Aushang hängt neben den Briefkästen.', note: 'aushängen : afficher' },
    { word: 'sich beschweren', partOfSpeech: 'verb', translation: 'se plaindre',
      example: 'Ein Nachbar hat sich bei der Hausverwaltung über den Lärm beschwert.', note: 'sich bei + datif über + accusatif beschweren' },
    { word: 'stören', partOfSpeech: 'verb', translation: 'déranger, gêner',
      example: 'Die laute Musik stört die Nachbarn.', note: '+ accusatif : Das stört mich.' },
    { word: 'Rücksicht nehmen', partOfSpeech: 'expression', translation: 'avoir des égards, faire attention aux autres',
      example: 'Bitte nehmen Sie Rücksicht auf die Nachbarn.', note: 'auf + accusatif' },
    { word: 'abstellen', partOfSpeech: 'verb', translation: 'déposer, garer (vélo, poussette)',
      example: 'Im Treppenhaus darf man keine Kinderwagen abstellen.', note: 'séparable : ab|stellen' },
    { word: 'freihalten', partOfSpeech: 'verb', translation: 'laisser libre, dégager',
      example: 'Bitte halten Sie den Eingang frei.', note: 'séparable : frei|halten' },
    { word: 'klemmen', partOfSpeech: 'verb', translation: 'coincer, ne pas fermer bien',
      example: 'Die Tür zum Fahrradkeller klemmt seit gestern.', note: null },
    { word: 'sich einigen', partOfSpeech: 'verb', translation: 'se mettre d’accord',
      example: 'Wir haben uns auf Samstag geeinigt.', note: 'sich auf + accusatif einigen' },
    { word: 'sich kümmern', partOfSpeech: 'verb', translation: 's’occuper de',
      example: 'Der Hausmeister kümmert sich um den Garten.', note: 'sich um + accusatif kümmern' },
  ],

  media: [
    { key: 'b1-wohnen-lesen-hausordnung', kind: 'image', title: 'Règlement intérieur : les règles principales',
      alt: 'Affiche « Hausordnung Lindenstraße 12 » : calme de 13 à 15 h et de 22 à 7 h, le dimanche toute la journée ; escalier et couloirs libres ; vélos au local à vélos ; papier dans la poubelle bleue, emballages dans la jaune ; buanderie sur inscription.',
      image: { layout: 'document', variant: 'sign', icon: 'home', title: 'Hausordnung Lindenstraße 12', subtitle: 'Das Wichtigste in Kürze',
        lines: [
          { icon: 'moon', text: 'Ruhezeit: [13–15 Uhr] und [22–7 Uhr], sonntags ganztägig' },
          { icon: 'door-open', text: 'Treppenhaus und Flure: [frei halten]' },
          { icon: 'bike', text: 'Fahrräder nur in den [Fahrradkeller]' },
          { icon: 'recycle', text: 'Papier: [blaue Tonne] · Verpackungen: [gelbe Tonne]' },
          { icon: 'washing-machine', text: 'Waschküche: in die [Liste] eintragen' },
        ] } },
    { key: 'b1-wohnen-hoeren-audio', kind: 'audio', title: 'Le local à vélos : Paula, M. Yilmaz et Mme Krüger trouvent un accord',
      script: [
        { voice: 'frau', name: 'Paula', text: 'Guten Abend, Herr Yilmaz! Haben Sie kurz Zeit? Es geht um den Fahrradkeller.' },
        { pause: 0.5 },
        { voice: 'mann2', name: 'Herr Yilmaz', text: 'Guten Abend, Frau Becker. Ja, natürlich. Was ist denn los?' },
        { pause: 0.5 },
        { voice: 'frau', name: 'Paula', text: 'Die Tür zum Fahrradkeller, die gestern noch ganz normal war, geht heute nicht mehr richtig zu. Ich glaube, das Schloss ist kaputt.' },
        { pause: 0.5 },
        { voice: 'mann2', name: 'Herr Yilmaz', text: 'Das ist mir heute Morgen auch aufgefallen. Aber ich glaube nicht, dass es am Schloss liegt. Vielleicht liegt es an der Kiste, die direkt hinter der Tür steht.' },
        { pause: 0.5 },
        { voice: 'frau', name: 'Paula', text: 'Oh, die blaue Kiste? Die gehört mir. Ich wollte sie eigentlich schon am Freitag in mein Kellerabteil bringen. Steht sie wirklich so ungünstig?' },
        { pause: 0.5 },
        { voice: 'mann2', name: 'Herr Yilmaz', text: 'Ja, leider. Wenn ich mein Fahrrad heraushole, muss ich die Kiste zur Seite schieben. Und dann bleibt die Tür daran hängen.' },
        { pause: 0.5 },
        { voice: 'frau', name: 'Paula', text: 'Das tut mir leid, das wusste ich nicht. Heute kann ich sie nicht allein tragen, sie ist voller Bücher. Könnten Sie mir morgen gegen sechs kurz helfen?' },
        { pause: 0.5 },
        { voice: 'mann2', name: 'Herr Yilmaz', text: 'Um sechs bin ich leider noch bei der Arbeit. Aber halb sieben passt. Ich klingle dann bei Ihnen.' },
        { pause: 0.4 },
        { voice: 'frau', name: 'Paula', text: 'Super, also morgen um halb sieben. Vielen Dank!' },
        { pause: 0.8 },
        { voice: 'frau3', name: 'Frau Krüger', text: 'Entschuldigung, dass ich störe. Reden Sie gerade über den Fahrradkeller? Mein Sohn hat sich heute auch über die Tür beschwert.' },
        { pause: 0.5 },
        { voice: 'mann2', name: 'Herr Yilmaz', text: 'Ja, genau, Frau Krüger. Frau Becker und ich bringen morgen Abend eine Kiste weg, die hinter der Tür steht. Danach geht die Tür hoffentlich wieder zu.' },
        { pause: 0.5 },
        { voice: 'frau3', name: 'Frau Krüger', text: 'Gut. Und wenn wir schon dabei sind: Im Keller stehen drei alte Fahrräder, die seit über einem Jahr niemand benutzt. Wem gehören die eigentlich?' },
        { pause: 0.5 },
        { voice: 'frau', name: 'Paula', text: 'Das weiß ich nicht. In der Hausordnung steht, dass der Hausmeister alte Fahrräder wegbringen darf, aber erst nach einer Ankündigung.' },
        { pause: 0.5 },
        { voice: 'frau3', name: 'Frau Krüger', text: 'Dann schreibe ich Herrn Arslan eine Nachricht. Er kann ja einen Zettel an die Fahrräder hängen.' },
        { pause: 0.5 },
        { voice: 'mann2', name: 'Herr Yilmaz', text: 'Gute Idee. Und falls die Tür morgen immer noch klemmt, schreibe ich der Hausverwaltung.' },
        { pause: 0.5 },
        { voice: 'frau', name: 'Paula', text: 'Abgemacht. Ich schreibe gleich in unseren Haus-Chat, dass heute Abend alle vorsichtig mit der Tür sein sollen.' },
        { pause: 0.4 },
        { voice: 'frau3', name: 'Frau Krüger', text: 'Prima. Dann noch einen schönen Abend!' },
      ] },
    { key: 'b1-wohnen-regel-relativpronomen', kind: 'image', title: 'Les pronoms relatifs selon le cas',
      alt: 'Quatre fiches : nominatif (der Nachbar, der oben wohnt), accusatif (der Schlüssel, den ich suche), datif (die Leute, denen ich helfe) et avec préposition (der Raum, in dem die Räder stehen).',
      image: { layout: 'cards', cards: [
        { title: 'Nominativ', icon: 'user', lines: ['der Nachbar, [der] oben wohnt', 'die Tür, [die] klemmt', 'das Regal, [das] im Flur steht', 'die Räder, [die] im Keller stehen'] },
        { title: 'Akkusativ', icon: 'key', lines: ['der Schlüssel, [den] ich suche', 'die Liste, [die] ich lese', 'das Paket, [das] ich hole', 'die Räder, [die] niemand benutzt'] },
        { title: 'Dativ', icon: 'hand-helping', lines: ['der Nachbar, [dem] ich helfe', 'die Nachbarin, [der] ich helfe', 'das Kind, [dem] ich helfe', 'die Leute, [denen] ich helfe'] },
        { title: 'Mit Präposition', icon: 'door-open', lines: ['der Raum, [in dem] die Räder stehen', 'die Nachbarin, [mit der] ich spreche', 'der Keller, [zu dem] ich einen Schlüssel habe', 'die Leute, [von denen] ich erzähle'] },
      ] } },
    { key: 'b1-wohnen-hoeren2-audio', kind: 'audio', title: 'Message de la régie au sujet du local à vélos',
      script: [
        { voice: 'sprecher', name: 'Herr Wolff', text: 'Guten Tag, Frau Becker, hier spricht Thomas Wolff von Ihrer Hausverwaltung. Sie hatten uns gestern wegen der Tür zum Fahrradkeller geschrieben. Vielen Dank für Ihre Nachricht.' },
        { pause: 0.4 },
        { voice: 'sprecher', name: 'Herr Wolff', text: 'Ich habe heute mit Herrn Arslan gesprochen, also mit dem Hausmeister, der sich um Ihr Haus kümmert. Er hat sich die Tür angesehen: Das Schloss ist tatsächlich alt, und die Tür hängt etwas schief.' },
        { pause: 0.4 },
        { voice: 'sprecher', name: 'Herr Wolff', text: 'Wir haben deshalb eine Firma beauftragt, die am Dienstag zwischen neun und zwölf Uhr ein neues Schloss einbaut. In dieser Zeit ist der Fahrradkeller geschlossen. Wenn Sie Ihr Fahrrad am Dienstagvormittag brauchen, holen Sie es bitte vorher heraus.' },
        { pause: 0.4 },
        { voice: 'sprecher', name: 'Herr Wolff', text: 'Die neuen Schlüssel bekommen alle Mieter ab Mittwoch bei Herrn Arslan. Bitte bringen Sie dafür Ihren alten Schlüssel mit.' },
        { pause: 0.4 },
        { voice: 'sprecher', name: 'Herr Wolff', text: 'Noch etwas zu den alten Fahrrädern: Herr Arslan hängt diese Woche einen Zettel an alle Fahrräder, die niemand mehr benutzt. Wer sein Fahrrad behalten möchte, nimmt den Zettel einfach bis Ende des Monats ab.' },
        { pause: 0.4 },
        { voice: 'sprecher', name: 'Herr Wolff', text: 'Wenn Sie noch Fragen haben, erreichen Sie mich montags bis freitags von acht bis sechzehn Uhr. Auf Wiederhören!' },
      ] },
    { key: 'b1-wohnen-kontrolle-audio', kind: 'audio', title: 'Réponse vocale de Lena Hoffmann à Luc Martin',
      script: [
        { voice: 'frau2', name: 'Lena Hoffmann', text: 'Hallo Herr Martin, hier ist Lena Hoffmann aus dem zweiten Stock. Ich habe Ihre Nachricht zum Regal gelesen.' },
        { pause: 0.4 },
        { voice: 'frau2', name: 'Lena Hoffmann', text: 'Das Regal, das unten im Treppenhaus steht, gehört nicht mir, sondern dem Mann, der letzten Monat in den dritten Stock eingezogen ist. Er heißt Herr Kaya, glaube ich.' },
        { pause: 0.4 },
        { voice: 'frau2', name: 'Lena Hoffmann', text: 'Ich habe ihn heute Morgen im Hof getroffen. Er hat gesagt, dass seine anderen Möbel erst am Freitag kommen. Das Regal bringt er dann am Samstag in seine Wohnung. Bis dahin müssen wir also noch ein bisschen Geduld haben. Schönen Tag noch!' },
      ] },
  ],

  activities: [
    // 1 · Mise en route
    { id: 'b1-wohnen-einstieg', kind: 'lesson', title: 'Mise en route : vivre ensemble dans un immeuble', estimatedMinutes: 10,
      competences: ['lecture', 'expression-orale'],
      lesson: { description: `ZUSAMMEN WOHNEN
[fr] Vivre ensemble
${bi('In einem Mietshaus wohnen viele Menschen zusammen: Familien, Studierende, ältere Leute. Für ein gutes Zusammenleben gibt es Regeln.', 'Dans un immeuble locatif vivent beaucoup de gens : des familles, des étudiants, des personnes âgées. Pour bien vivre ensemble, il y a des règles.')}

FRAGEN ZUM EINSTIEG
[fr] Questions pour commencer
• ${bi('Wie wohnen Sie: in einem Haus, in einer Wohnung, in einer WG?', 'Comment habitez-vous : dans une maison, un appartement, une colocation ?')}
• ${bi('Kennen Sie Ihre Nachbarn? Was gefällt Ihnen, was stört Sie?', 'Connaissez-vous vos voisins ? Qu’est-ce qui vous plaît, qu’est-ce qui vous dérange ?')}
• ${bi('Welche Regeln gibt es in Ihrem Haus, zum Beispiel für Lärm oder Müll?', 'Quelles règles y a-t-il dans votre immeuble, par exemple pour le bruit ou les déchets ?')}
${bi('Antworten Sie in Gedanken auf Deutsch, in zwei oder drei einfachen Sätzen.', 'Répondez mentalement en allemand, en deux ou trois phrases simples.')}

ZIELE
[fr] Objectifs
• ${bi('Ich kann eine Hausordnung und einen Aushang verstehen.', 'Je peux comprendre un règlement intérieur et un avis affiché.')}
• ${bi('Ich kann ein Problem in meiner Wohnung oder im Haus genau beschreiben.', 'Je peux décrire précisément un problème dans mon logement ou dans l’immeuble.')}
• ${bi('Ich kann mit Relativsätzen sagen, wen oder was ich meine.', 'Je peux préciser de qui ou de quoi je parle avec des relatives.')}
• ${bi('Ich kann höflich um etwas bitten und eine Lösung vorschlagen.', 'Je peux demander quelque chose poliment et proposer une solution.')}

WICHTIGE WÖRTER
[fr] Mots-clés
• die Hausordnung — le règlement intérieur
• die Hausverwaltung — la régie
• der Hausmeister — le gardien
• die Nebenkosten — les charges
• die Ruhezeit — les heures de calme
• das Treppenhaus — la cage d’escalier
• der Fahrradkeller — le local à vélos
• sich beschweren über — se plaindre de` } },

    // 2 · Lecture longue avec stratégie : règlement et avis
    { id: 'b1-wohnen-lesen', kind: 'exercise', title: 'Comprendre : le règlement intérieur et un avis aux habitants', estimatedMinutes: 20,
      competences: ['lecture'],
      lesson: { description: `${C.lesen}

STRATEGIE
[fr] Stratégie
${bi('Eine Hausordnung ist nach Themen geordnet. Lesen Sie zuerst nur den Anfang von jedem Paragrafen: Worum geht es?', 'Un règlement intérieur est organisé par thèmes. Lisez d’abord seulement le début de chaque paragraphe : de quoi s’agit-il ?')}
${bi('Suchen Sie dann bei jeder Aussage das Schlüsselwort im Text: Ruhezeit, Fahrrad, Müll, Waschküche …', 'Cherchez ensuite, pour chaque affirmation, le mot-clé dans le texte : heures de calme, vélo, déchets, buanderie…')}
${bi('Achten Sie auf kleine Wörter wie „nicht“, „kein“, „nur“ und „immer“.', 'Faites attention aux petits mots comme « nicht », « kein », « nur » et « immer ».')}

HAUSORDNUNG DER WOHNANLAGE LINDENSTRASSE 12
Liebe Bewohnerinnen und Bewohner,
ein gutes Zusammenleben ist nur möglich, wenn alle Rücksicht aufeinander nehmen. Bitte beachten Sie deshalb die folgenden Regeln.

§ 1 Von 13 bis 15 Uhr und von 22 bis 7 Uhr gilt die Ruhezeit. In dieser Zeit sind laute Musik, Bohren und Staubsaugen nicht erlaubt. Am Sonntag und an Feiertagen gilt die Ruhezeit den ganzen Tag. Wer eine Feier plant, informiert die Nachbarn bitte einige Tage vorher mit einem Aushang.

§ 2 Das Treppenhaus und die Flure sind Fluchtwege. Deshalb dürfen dort keine Schuhe, Kinderwagen oder Möbel stehen. Für Kinderwagen gibt es neben dem Eingang einen kleinen Raum, der nur für diesen Zweck da ist. Die Haustür bleibt immer geschlossen.

§ 3 Fahrräder gehören in den Fahrradkeller, zu dem jeder Mieter einen Schlüssel bekommt. Bitte stellen Sie Ihr Fahrrad nicht in den Hof und nicht vor die Haustür. Fahrräder, die seit Monaten niemand benutzt, bringt der Hausmeister nach einer Ankündigung weg.

§ 4 Bitte trennen Sie den Müll: Papier kommt in die blaue Tonne, Verpackungen kommen in die gelbe Tonne, Glas bringen Sie zu den Containern an der Ecke. Für Sperrmüll, also alte Möbel oder große Geräte, gibt es zweimal im Jahr einen Termin, den die Hausverwaltung im Treppenhaus aushängt.

§ 5 Die Waschküche im Keller können alle Mieter benutzen. Tragen Sie sich bitte in die Liste ein, die an der Tür hängt. Machen Sie den Raum nach dem Waschen bitte sauber und lassen Sie das Fenster nicht offen.

Bei Problemen wenden Sie sich bitte an den Hausmeister, Herrn Arslan, oder schreiben Sie eine Nachricht an die Hausverwaltung.

AUSHANG IM TREPPENHAUS
Liebe Bewohnerinnen und Bewohner,
am Donnerstag, dem 14. März, kommt zwischen 8 und 11 Uhr eine Firma ins Haus. Sie prüft die Klingeln und die Sprechanlagen, die seit einigen Wochen Probleme machen. Dafür muss sie kurz in jede Wohnung. Wer am Donnerstag nicht zu Hause ist, trägt sich bitte bis Dienstag in die Liste im Erdgeschoss ein; dann vereinbart die Firma einen neuen Termin. Bitte halten Sie außerdem den Eingang frei: Die Fahrräder, die neben der Haustür stehen, müssen bis Mittwochabend in den Fahrradkeller. Der Kellerschlüssel, den die Firma braucht, liegt bei Herrn Arslan im ersten Stock.
Ihre Hausverwaltung` },
      placements: [{ media: 'b1-wohnen-lesen-hausordnung', caption: 'Hausordnung: das Wichtigste' }],
      questions: [
        choice('q1', bi('Wozu ist die Hausordnung da?', 'À quoi sert le règlement intérieur ?'),
          [['Sie informiert über die neuen Mietpreise.'], ['Sie soll das Zusammenleben im Haus regeln.', true], ['Sie lädt die Bewohner zu einem Hausfest ein.']],
          'Dès l’introduction : « ein gutes Zusammenleben ist nur möglich, wenn alle Rücksicht aufeinander nehmen ». Les paragraphes fixent ensuite des règles (calme, escalier, vélos, déchets, buanderie). Le texte ne parle ni de loyer ni de fête de l’immeuble.'),
        choice('q2', bi('Warum hängt der Aushang im Treppenhaus?', 'Pourquoi cet avis est-il affiché dans la cage d’escalier ?'),
          [['Der Fahrradkeller wird renoviert.'], ['Die Hausverwaltung sucht einen neuen Hausmeister.'], ['Eine Firma kommt und prüft die Klingeln und Sprechanlagen.', true]],
          'L’avis annonce la venue d’une entreprise jeudi : « Sie prüft die Klingeln und die Sprechanlagen ». Le local à vélos n’est cité que parce que les vélos doivent dégager l’entrée ; il n’est pas question de travaux.'),
        rf('q3', 'Am Sonntagnachmittag darf man in der Wohnung staubsaugen.', 'f',
          'Faux : « Am Sonntag und an Feiertagen gilt die Ruhezeit den ganzen Tag », et l’aspirateur (Staubsaugen) fait partie des activités interdites pendant la Ruhezeit.'),
        rf('q4', 'Jeder Mieter bekommt einen Schlüssel für den Fahrradkeller.', 'r',
          'Vrai : § 3, « … in den Fahrradkeller, zu dem jeder Mieter einen Schlüssel bekommt ». La relative avec préposition (zu dem) précise de quel local il s’agit.'),
        rf('q5', 'Für die Waschküche muss man extra bezahlen.', 'n',
          'Le § 5 dit seulement que tous les locataires peuvent utiliser la buanderie après s’être inscrits sur la liste. Rien sur un prix : non mentionné. « Falsch » supposerait que le texte dise qu’elle est gratuite.'),
        rf('q6', 'Wer am Donnerstag nicht zu Hause ist, muss sich bis Dienstag in eine Liste eintragen.', 'r',
          'Vrai : « Wer am Donnerstag nicht zu Hause ist, trägt sich bitte bis Dienstag in die Liste im Erdgeschoss ein ». L’entreprise fixe alors un autre rendez-vous.'),
        match('q7', bi('Welche Überschrift passt zu welchem Paragrafen? Ordnen Sie zu.', 'Quel titre convient à quel paragraphe ? Associez.'),
          [['§ 1', 'Ruhe im Haus'], ['§ 2', 'Treppenhaus und Flure'], ['§ 3', 'Fahrräder'], ['§ 4', 'Müll richtig trennen']],
          '§ 1 : les heures de calme (Ruhezeit). § 2 : l’escalier et les couloirs, qui doivent rester libres. § 3 : où ranger les vélos. § 4 : le tri des déchets (blaue Tonne, gelbe Tonne, Glas).'),
        fill('q8', bi('Worauf beziehen sich die Relativpronomen? Ergänzen Sie das Nomen aus dem Text.', 'À quoi renvoient les pronoms relatifs ? Complétez avec le nom du texte.'),
          'In § 3 bezieht sich „zu dem“ auf den [[1]]. Im Aushang bezieht sich „den die Firma braucht“ auf den [[2]].',
          [['Fahrradkeller'], ['Kellerschlüssel']],
          'Le pronom relatif reprend le nom placé juste avant la virgule : « der Fahrradkeller, zu dem jeder Mieter einen Schlüssel bekommt » et « der Kellerschlüssel, den die Firma braucht ». C’est le point de grammaire du module.'),
      ] },

    // 3 · Écoute longue : prise de notes puis questions
    { id: 'b1-wohnen-hoeren', kind: 'exercise', title: 'Comprendre : un accord pour le local à vélos', estimatedMinutes: 18,
      competences: ['ecoute'],
      lesson: { description: `${C.hoeren}

${bi('Situation: Paula Becker trifft ihren Nachbarn Herrn Yilmaz im Treppenhaus. Später kommt Frau Krüger dazu.', 'Situation : Paula Becker croise son voisin, M. Yilmaz, dans la cage d’escalier. Mme Krüger les rejoint ensuite.')}

STRATEGIE
[fr] Stratégie
${bi('Beim ersten Hören: Was ist das Problem? Ist die Stimmung freundlich oder unfreundlich?', 'Première écoute : quel est le problème ? L’ambiance est-elle aimable ou tendue ?')}
${bi('Beim zweiten Hören achten Sie auf Stichwörter: Wer macht was, wann und wo?', 'À la deuxième écoute, repérez les mots-clés : qui fait quoi, quand et où ?')}
${bi('Die Transkription sehen Sie nach Ihren Antworten.', 'Vous verrez la transcription après vos réponses.')}` },
      placements: [{ media: 'b1-wohnen-hoeren-audio', transcriptVisibility: 'after_answer' }],
      questions: [
        fill('q1', C.notizen,
          'Problem: Die Tür zum [[1]] geht nicht mehr richtig zu. Grund: eine Kiste, die hinter der [[2]] steht. Die Kiste gehört [[3]]. Termin zum Tragen: morgen um [[4]]. Im Keller stehen außerdem [[5]] alte Fahrräder.',
          [['Fahrradkeller', 'Fahrradraum'], ['Tür'], ['Paula', 'Frau Becker', 'Paula Becker'],
            ['halb sieben', 'halb 7', '18.30 Uhr', '18:30 Uhr', '18.30', '18:30', '6.30', '6:30'], ['drei', '3']],
          'Paula parle de « die Tür zum Fahrradkeller » ; M. Yilmaz soupçonne « die Kiste, die direkt hinter der Tür steht », et Paula répond « Die gehört mir ». Le rendez-vous : « halb sieben » (18 h 30). Mme Krüger signale « drei alte Fahrräder ».'),
        choice('q2', bi('Warum kann Paula die Kiste heute nicht wegbringen?', 'Pourquoi Paula ne peut-elle pas emporter la caisse aujourd’hui ?'),
          [['Sie hat keinen Schlüssel für den Keller.'], ['Die Kiste ist zu schwer, denn sie ist voller Bücher.', true], ['Sie muss heute Abend noch arbeiten.']],
          '« Heute kann ich sie nicht allein tragen, sie ist voller Bücher. » C’est M. Yilmaz, et non Paula, qui travaille encore à 18 h le lendemain ; la clé du local n’est pas un problème.'),
        choice('q3', bi('Warum schlägt Herr Yilmaz halb sieben vor?', 'Pourquoi M. Yilmaz propose-t-il 18 h 30 ?'),
          [['Um sechs ist er noch bei der Arbeit.', true], ['Um sechs kommt der Hausmeister.'], ['Um sechs holt er seinen Sohn ab.']],
          '« Um sechs bin ich leider noch bei der Arbeit. Aber halb sieben passt. » Le fils dont on parle est celui de Mme Krüger, qui s’est plaint de la porte.'),
        choice('q4', bi('Was will Frau Krüger wegen der alten Fahrräder tun?', 'Que veut faire Mme Krüger au sujet des vieux vélos ?'),
          [['Sie bringt die Fahrräder selbst in den Hof.'], ['Sie ruft die Hausverwaltung an.'], ['Sie schreibt dem Hausmeister eine Nachricht.', true]],
          '« Dann schreibe ich Herrn Arslan eine Nachricht » : M. Arslan est le gardien (Hausmeister), qui pourra accrocher une étiquette aux vélos. C’est M. Yilmaz qui écrira à la régie, et seulement si la porte coince encore.'),
        choice('q5', bi('Was passiert, wenn die Tür morgen immer noch klemmt?', 'Que se passera-t-il si la porte coince encore demain ?'),
          [['Herr Yilmaz schreibt der Hausverwaltung.', true], ['Paula ruft eine Firma an.'], ['Frau Krüger repariert das Schloss.']],
          '« Und falls die Tür morgen immer noch klemmt, schreibe ich der Hausverwaltung » : c’est M. Yilmaz qui parle. Falls introduit une condition, comme wenn.'),
      ] },

    // 4 · Grammaire inductive
    { id: 'b1-wohnen-entdecken', kind: 'exercise', title: 'Découvrir : préciser de qui ou de quoi l’on parle', estimatedMinutes: 10,
      competences: ['lecture'],
      lesson: { description: `${bi('Lesen Sie die Sätze aus der Hausordnung, dem Aushang und dem Gespräch. Achten Sie auf die Wörter nach dem Komma.', 'Lisez ces phrases du règlement, de l’avis et de la conversation. Observez les mots qui suivent la virgule.')}

(1) Die Tür zum Fahrradkeller, die gestern noch ganz normal war, geht heute nicht mehr zu.
(2) Vielleicht liegt es an der Kiste, die direkt hinter der Tür steht.
(3) Im Keller stehen drei alte Fahrräder, die seit über einem Jahr niemand benutzt.
(4) Der Kellerschlüssel, den die Firma braucht, liegt bei Herrn Arslan.
(5) Fahrräder gehören in den Fahrradkeller, zu dem jeder Mieter einen Schlüssel bekommt.
(6) Tragen Sie sich bitte in die Liste ein, die an der Tür hängt.
(7) Für Kinderwagen gibt es neben dem Eingang einen kleinen Raum, der nur für diesen Zweck da ist.

${bi('Beantworten Sie dann die Fragen. So finden Sie die Regel selbst.', 'Répondez ensuite aux questions : vous trouverez ainsi la règle vous-même.')}` },
      questions: [
        choice('q1', bi('Wo steht das konjugierte Verb im Relativsatz?', 'Où se place le verbe conjugué dans la relative ?'),
          [['direkt nach dem Relativpronomen'], ['an zweiter Stelle, wie im Hauptsatz'], ['am Ende des Relativsatzes', true]],
          'war, steht, benutzt, braucht, bekommt, hängt, ist : dans toutes les relatives, le verbe conjugué ferme la proposition. La relative est une subordonnée, comme une proposition avec weil ou dass.'),
        choice('q2', bi('Satz (4): Warum steht hier „den“ und nicht „der“?', 'Phrase (4) : pourquoi trouve-t-on « den » et non « der » ?'),
          [['Im Relativsatz ist der Schlüssel das Objekt: Die Firma braucht ihn.', true], ['Im Relativsatz ist der Schlüssel das Subjekt, wie im ganzen Satz auch.'], ['Nach einem Komma steht im Deutschen immer der Akkusativ.']],
          'Le pronom prend le genre du nom repris (der Schlüssel : masculin) mais le cas de sa fonction dans la relative. Le sujet de « braucht » est « die Firma » ; le pronom est complément d’objet : accusatif, den. Il n’y a aucune règle « après une virgule ».'),
        match('q3', bi('Welche Funktion hat das Relativpronomen? Ordnen Sie zu.', 'Quelle est la fonction du pronom relatif ? Associez.'),
          [['die (Satz 2)', 'Nominativ: Subjekt im Relativsatz'], ['den (Satz 4)', 'Akkusativ: Objekt im Relativsatz'], ['zu dem (Satz 5)', 'Präposition und Dativ']],
          'Phrase 2 : « die » est le sujet de « steht » (la caisse se trouve derrière la porte). Phrase 4 : « den » est l’objet de « braucht ». Phrase 5 : « einen Schlüssel zu etwas bekommen » ; la préposition zu (+ datif) se place devant le pronom : zu dem.'),
        choice('q4', bi('Satz (3): Wer ist das Subjekt im Relativsatz „die seit über einem Jahr niemand benutzt“?', 'Phrase (3) : quel est le sujet de la relative « die seit über einem Jahr niemand benutzt » ?'),
          [['die Fahrräder'], ['niemand', true], ['der Keller']],
          'Le sujet est « niemand » (personne ne les utilise) ; « die » reprend les vélos comme objet, à l’accusatif pluriel. Au pluriel, le nominatif et l’accusatif ont la même forme (die) : c’est le sens et le verbe qui montrent la fonction.'),
      ] },

    // 5 · Règle
    { id: 'b1-wohnen-regel', kind: 'lesson', title: 'Retenir : les relatives et les verbes de position', estimatedMinutes: 8,
      competences: ['lecture'],
      lesson: { description: `À RETENIR
• La relative précise un nom : Die Kiste, die hinter der Tür steht, gehört mir.
• Le pronom relatif prend le genre et le nombre du nom qu’il reprend, et le cas de sa fonction dans la relative.
• Le verbe conjugué va à la fin de la relative. Virgule avant la relative, et après elle si la phrase continue.

LES PRONOMS RELATIFS
• Nominatif : der, die, das ; pluriel die. Der Nachbar, der oben wohnt.
• Accusatif : den, die, das ; pluriel die. Seul le masculin change : der Schlüssel, den ich suche.
• Datif : dem, der, dem ; pluriel denen. Die Nachbarin, der ich helfe. Die Nachbarn, denen ich helfe.
• Avec une préposition, celle-ci ouvre la relative et impose son cas : der Raum, in dem die Fahrräder stehen ; die Nachbarin, mit der ich gesprochen habe.

RAPPEL : STELLEN OU STEHEN ?
• Déplacement (Wohin ?) + accusatif : stellen, legen, hängen. Ich stelle das Fahrrad in den Keller.
• Position (Wo ?) + datif : stehen, liegen, hängen. Das Fahrrad steht im Keller.
• Dans une relative aussi : der Keller, in den ich das Fahrrad stelle ; der Keller, in dem das Fahrrad steht.

ATTENTION
• « que » ne se traduit pas toujours par den : Die Frau, die ich kenne (accusatif féminin : die).
• Au datif pluriel, on dit denen, et non den : die Nachbarn, denen das Regal gehört.
• Les verbes construits avec le datif gardent le datif dans la relative : der Nachbar, dem ich helfe (helfen + datif).
• Pas de pronom relatif sous-entendu comme en anglais : der Schlüssel, den ich suche (jamais « der Schlüssel ich suche »).` },
      placements: [{ media: 'b1-wohnen-regel-relativpronomen', caption: 'Relativpronomen: Nominativ, Akkusativ, Dativ, mit Präposition' }] },

    // 6 · S'entraîner : grammaire
    { id: 'b1-wohnen-grammatik', kind: 'exercise', title: 'S’entraîner : les relatives, stellen ou stehen', estimatedMinutes: 14,
      competences: ['lecture', 'expression-ecrite'],
      lesson: { description: `${bi('Üben Sie die Relativpronomen und die Verben stellen, stehen, legen, liegen und hängen.', 'Entraînez-vous aux pronoms relatifs et aux verbes stellen, stehen, legen, liegen et hängen.')}
${bi('Fragen Sie sich immer: Welches Genus hat das Nomen? Welche Funktion hat das Pronomen im Relativsatz?', 'Demandez-vous toujours : quel est le genre du nom ? Quelle est la fonction du pronom dans la relative ?')}` },
      questions: [
        fill('q1', bi('Ergänzen Sie das Relativpronomen im Nominativ oder Akkusativ.', 'Complétez avec le pronom relatif au nominatif ou à l’accusatif.'),
          'Das ist der Nachbar, [[1]] im Erdgeschoss wohnt. Und das ist die Nachbarin, [[2]] ich gestern im Hof getroffen habe. Das Regal, [[3]] im Flur steht, gehört Herrn Martin.',
          [['der'], ['die'], ['das']],
          '1 : sujet de « wohnt », masculin : der. 2 : objet de « getroffen habe », féminin : die (même forme qu’au nominatif). 3 : sujet de « steht », neutre : das.'),
        fill('q2', bi('Ergänzen Sie das Relativpronomen im Dativ.', 'Complétez avec le pronom relatif au datif.'),
          'Die Nachbarin, [[1]] ich beim Tragen geholfen habe, hat mir einen Kuchen gebracht. Die Kinder, [[2]] der Ball gehört, spielen im Hof.',
          [['der'], ['denen']],
          'helfen et gehören se construisent avec le datif. Féminin singulier au datif : der. Pluriel au datif : denen. Piège : l’article du datif pluriel est den (den Kindern), mais le pronom relatif est denen : die Kinder, denen der Ball gehört.'),
        fill('q3', bi('Ergänzen Sie das Relativpronomen nach der Präposition.', 'Complétez avec le pronom relatif après la préposition.'),
          'Das ist der Raum, in [[1]] die Fahrräder stehen. Das ist die Nachbarin, mit [[2]] ich die Kiste getragen habe.',
          [['dem'], ['der']],
          'La préposition décide du cas. in + datif pour une position (Wo ? stehen) : in dem (der Raum, masculin). mit est toujours suivi du datif : mit der (die Nachbarin, féminin).'),
        choice('q4', bi('Welcher Relativsatz ist richtig? „Ich suche den Schlüssel, …“', 'Quelle relative est correcte ? « Je cherche la clé que… »'),
          [['… der ich gestern verloren habe.'], ['… den ich gestern verloren habe.', true], ['… den ich habe gestern verloren.']],
          'Le pronom est l’objet de « verloren habe » : accusatif masculin, den. Le verbe conjugué « habe » va à la fin. La première proposition emploie le nominatif, la troisième garde l’ordre d’une principale.'),
        order('q5', bi('Bilden Sie einen Satz. Beginnen Sie mit „Die Kiste“.', 'Remettez les mots dans l’ordre en commençant par « Die Kiste ».'),
          [['Die Kiste,', 'die', 'hinter der Tür', 'steht,', 'gehört', 'Paula.']],
          'La relative s’insère juste après le nom qu’elle précise, entre deux virgules : « die hinter der Tür steht ». Puis la principale continue avec son verbe : gehört Paula.'),
        order('q6', bi('Verbinden Sie: „Das ist der Hausmeister. Ich habe mit ihm gesprochen.“ Bilden Sie einen Satz.', 'Reliez : « C’est le gardien. J’ai parlé avec lui. » Remettez les mots dans l’ordre.'),
          [['Das ist', 'der Hausmeister,', 'mit', 'dem', 'ich', 'gesprochen', 'habe.']],
          '« mit ihm » devient « mit dem » : la préposition passe en tête de la relative, suivie du pronom au datif masculin. Le verbe conjugué habe ferme la relative, après le participe.'),
        choice('q7', bi('Welcher Satz ist richtig?', 'Quelle phrase est correcte ?'),
          [['Ich stelle das Fahrrad im Keller.'], ['Ich stehe das Fahrrad in den Keller.'], ['Ich stelle das Fahrrad in den Keller.', true]],
          'On déplace le vélo (Wohin ?) : verbe stellen et accusatif, in den Keller. « im Keller » (datif) répond à Wo ? et va avec stehen ; « stehen » n’a pas de complément d’objet.'),
        fill('q8', bi('Ergänzen Sie das passende Verb.', 'Complétez avec le verbe qui convient.'),
          'Der Kellerschlüssel [[1]] (liegen / legen) bei Herrn Arslan. Die Liste [[2]] (hängen) an der Tür. Bitte [[3]] (stellen / stehen) Sie keine Schuhe ins Treppenhaus.',
          [['liegt'], ['hängt'], ['stellen']],
          'Position (Wo ?) : liegen, er liegt ; hängen, sie hängt (bei Herrn Arslan, an der Tür : datif). Déplacement (Wohin ?) : stellen avec « ins Treppenhaus » (in das : accusatif). Forme de politesse : stellen Sie.'),
        choice('q9', bi('Welches Wort passt? „Das ist der Keller, in … ich mein Fahrrad gestellt habe.“', 'Quel mot convient ? « C’est la cave dans laquelle j’ai mis mon vélo. »'),
          [['dem'], ['den', true], ['der']],
          'stellen exprime un déplacement : in + accusatif, et der Keller est masculin, d’où in den. Avec un verbe de position, on aurait « der Keller, in dem mein Fahrrad steht ».'),
      ] },

    // 7 · Lexique : collocations, familles, Redemittel
    { id: 'b1-wohnen-wortschatz', kind: 'exercise', title: 'S’entraîner : les mots de l’immeuble et les formules polies', estimatedMinutes: 12,
      competences: ['lecture', 'expression-ecrite'],
      lesson: { description: `${bi('Lernen Sie Wörter zusammen: Nomen mit Verb, Wortfamilien und feste Formulierungen.', 'Apprenez les mots ensemble : nom et verbe, familles de mots et formules toutes faites.')}

REDEMITTEL
[fr] Formules utiles
• signaler un problème : Ich möchte Sie auf ein Problem aufmerksam machen. / Seit Montag funktioniert … nicht mehr.
• préciser : die Tür, die zum Hof führt / das Regal, das im Flur steht
• demander poliment : Könnten Sie bitte …? / Wäre es möglich, …? / Ich wäre Ihnen dankbar, wenn …
• proposer une solution : Wie wäre es, wenn wir …? / Ich schlage vor, dass …
• se mettre d’accord : Einverstanden. / Abgemacht! / Dann machen wir es so.
Les formules avec könnten, wäre et würde se retiennent ici comme des blocs : leur règle (Konjunktiv II) vient au module Arbeit.` },
      questions: [
        match('q1', bi('Welches Verb passt zu welchem Nomen? Ordnen Sie zu.', 'Quel verbe va avec quel nom ? Associez.'),
          [['den Müll', 'trennen'], ['Rücksicht', 'nehmen'], ['sich bei der Hausverwaltung', 'beschweren'], ['sich in die Liste', 'eintragen'], ['einen Mietvertrag', 'unterschreiben']],
          'Collocations à apprendre en bloc : den Müll trennen (trier les déchets), Rücksicht nehmen (auf + accusatif), sich bei jemandem beschweren, sich in eine Liste eintragen (s’inscrire sur une liste), einen Mietvertrag unterschreiben (signer un bail).'),
        fill('q2', bi('Bilden Sie das Nomen aus dem Verb.', 'Formez le nom à partir du verbe.'),
          'mieten → der [[1]] · wohnen → die [[2]] · ordnen → die [[3]] · sich beschweren → die [[4]]',
          [['Mieter'], ['Wohnung'], ['Ordnung'], ['Beschwerde']],
          'Suffixe -er pour la personne qui agit : der Mieter (le locataire). Suffixe -ung pour l’action ou son résultat, toujours féminin : die Wohnung, die Ordnung (d’où die Hausordnung). sich beschweren donne die Beschwerde (la plainte).'),
        choice('q3', bi('Sie möchten höflich ein Problem melden. Welche Formulierung passt?', 'Vous voulez signaler poliment un problème. Quelle formule convient ?'),
          [['Die Haustür ist seit Montag kaputt. Reparieren Sie das sofort, das ist Ihre Aufgabe!'], ['Ich finde, in diesem Haus gehen die Türen leider sehr oft kaputt, das ist nicht normal.'], ['Ich möchte Sie auf ein Problem aufmerksam machen: Die Haustür schließt nicht richtig.', true]],
          '« Ich möchte Sie auf ein Problem aufmerksam machen » (je voudrais attirer votre attention sur un problème) introduit poliment un fait précis. La première phrase est précise, mais l’ordre « Reparieren Sie das sofort … » est agressif ; la deuxième donne un avis général, pas un problème.'),
        choice('q4', bi('Sie schlagen Ihrem Nachbarn eine Lösung vor. Was passt?', 'Vous proposez une solution à votre voisin. Quelle formule convient ?'),
          [['Wäre es möglich, das Regal in den Keller zu stellen?', true], ['Sie müssen das Regal sofort wegräumen, sonst schreibe ich der Hausverwaltung.'], ['Das Regal steht seit Montag im Flur vor meiner Wohnungstür.']],
          '« Wäre es möglich, … zu … ? » propose une solution en laissant le choix à l’autre. « Sie müssen … sofort …, sonst … » donne un ordre et menace ; la troisième phrase décrit le problème, sans proposer de solution.'),
        choice('q5', bi('Welche Präposition passt? „Herr Yilmaz hat sich … den Lärm beschwert.“', 'Quelle préposition convient ? « M. Yilmaz s’est plaint du bruit. »'),
          [['auf'], ['an'], ['über', true]],
          'sich beschweren über + accusatif : la chose dont on se plaint. La personne à qui l’on se plaint est introduite par bei + datif : sich bei der Hausverwaltung über den Lärm beschweren.'),
        choice('q6', bi('Was sind „Nebenkosten“?', 'Que sont les « Nebenkosten » ?'),
          [['die Miete für eine Wohnung ohne Möbel und ohne Küche'], ['Kosten für Wasser, Heizung und Müll, zusätzlich zur Miete', true], ['das Geld, das man beim Einzug als Sicherheit beim Vermieter hinterlegt']],
          'Les Nebenkosten sont les charges : eau, chauffage, ordures, gardien… payées en plus du loyer de base (die Kaltmiete). Loyer + charges = die Warmmiete. L’argent versé en garantie à l’entrée s’appelle die Kaution.'),
        choice('q7', bi('Frau Ott besitzt die Wohnung und bekommt jeden Monat die Miete. Sie ist …', 'Mme Ott possède l’appartement et reçoit le loyer chaque mois. Elle est …'),
          [['die Mieterin.'], ['die Vermieterin.', true], ['die Bewohnerin.']],
          'die Vermieterin (vermieten : donner en location) est la propriétaire qui loue. die Mieterin (mieten : prendre en location) paie le loyer. Attention : le français « louer » a les deux sens, l’allemand les distingue.'),
      ] },

    // 8 · Répéter à voix haute : Redemittel
    { id: 'b1-wohnen-redemittel', kind: 'exercise', title: 'Répéter à voix haute : signaler un problème poliment', estimatedMinutes: 9,
      competences: ['expression-orale'],
      lesson: { description: `${C.sprechen}
${bi('Sprechen Sie freundlich und ruhig: Bei einer Bitte geht die Stimme am Ende leicht nach oben.', 'Parlez de façon aimable et calme : dans une demande, la voix monte légèrement à la fin.')}
${bi('Achten Sie auf das Komma im Relativsatz: Machen Sie dort eine kleine Pause.', 'Faites attention à la virgule de la relative : marquez-y une petite pause.')}` },
      questions: [
        speak('q1', 'Ich möchte Sie auf ein Problem aufmerksam machen.',
          'Pour ouvrir poliment une réclamation. Accent sur « AUF-merksam » ; le ch final de « machen » est guttural, comme dans « Bach ».'),
        speak('q2', 'Die Tür, die zum Hof führt, schließt nicht richtig.',
          'Une relative pour préciser de quelle porte on parle. Petites pauses aux virgules ; le ü de « Tür » et « führt » se prononce lèvres arrondies, comme dans « sûr ».'),
        speak('q3', 'Könnten Sie bitte am Samstag kurz nachsehen?',
          'Demande polie avec könnten. Le ö de « Könnten » est bref ; accent sur « NACH-sehen » (verbe séparable : accent sur la particule).'),
        speak('q4', 'Wäre es möglich, das Regal in den Keller zu stellen?',
          'Proposer une solution sans imposer. Le ä de « Wäre » est long et ouvert, comme le « è » de « mère » ; accent sur « MÖG-lich ».'),
        speak('q5', 'Wie wäre es, wenn wir die Kiste zusammen tragen?',
          'Autre façon de proposer : « Wie wäre es, wenn … ? » (et si … ?). Après wenn, le verbe « tragen » va à la fin ; accent sur « zu-SAM-men ».'),
        speak('q6', 'Einverstanden, dann machen wir es so.',
          'Pour conclure un accord. « Einverstanden » : accent sur « EIN », le v se prononce [f].'),
      ] },

    // 9 · Second document : message vocal de la régie (écoute) et dictées
    { id: 'b1-wohnen-hoeren2', kind: 'exercise', title: 'Comprendre : le message de la régie', estimatedMinutes: 15,
      competences: ['ecoute', 'expression-ecrite'],
      lesson: { description: `${C.hoeren}

${bi('Situation: Paula Becker hat der Hausverwaltung wegen der Tür zum Fahrradkeller geschrieben. Herr Wolff von der Hausverwaltung hinterlässt ihr eine Nachricht auf dem Anrufbeantworter.', 'Situation : Paula Becker a écrit à la régie au sujet de la porte du local à vélos. M. Wolff, de la régie, lui laisse un message sur son répondeur.')}

STRATEGIE
[fr] Stratégie
${bi('Eine Nachricht von einer Firma hat oft eine feste Reihenfolge: Wer spricht? Warum? Was passiert wann? Was sollen Sie tun?', 'Le message d’une entreprise suit souvent un ordre fixe : qui parle ? pourquoi ? que se passe-t-il, et quand ? que devez-vous faire ?')}
${bi('Achten Sie besonders auf die Wochentage und die Uhrzeiten.', 'Soyez particulièrement attentif aux jours de la semaine et aux heures.')}
${bi('Die zwei letzten Fragen sind Diktate. Schreiben Sie genau, mit Großbuchstaben und Kommas.', 'Les deux dernières questions sont des dictées. Écrivez exactement, avec les majuscules et les virgules.')}` },
      placements: [{ media: 'b1-wohnen-hoeren2-audio', transcriptVisibility: 'after_answer' }],
      questions: [
        choice('q1', bi('Warum ruft Herr Wolff an?', 'Pourquoi M. Wolff appelle-t-il ?'),
          [['Er möchte Frau Becker mitteilen, dass die Miete steigt.'], ['Er antwortet auf eine Nachricht von Frau Becker.', true], ['Er sucht einen neuen Hausmeister für das Haus.']],
          '« Sie hatten uns gestern wegen der Tür zum Fahrradkeller geschrieben. Vielen Dank für Ihre Nachricht. » Il répond donc à son message. Le gardien, M. Arslan, est toujours là : il s’occupe de l’immeuble.'),
        choice('q2', bi('Was passiert am Dienstag?', 'Que se passe-t-il mardi ?'),
          [['Eine Firma baut ein neues Schloss ein.', true], ['Der Hausmeister verteilt die neuen Schlüssel.'], ['Die alten Fahrräder werden abgeholt.']],
          'Mardi, de 9 h à 12 h, une entreprise installe une nouvelle serrure (« ein neues Schloss einbaut ») ; le local est fermé pendant ce temps. Les nouvelles clés, elles, sont distribuées à partir de mercredi.'),
        choice('q3', bi('Was müssen die Mieter mitbringen, wenn sie den neuen Schlüssel holen?', 'Que doivent apporter les locataires quand ils viennent chercher la nouvelle clé ?'),
          [['ihren Mietvertrag'], ['einen Zettel von ihrem Fahrrad'], ['ihren alten Schlüssel', true]],
          '« Bitte bringen Sie dafür Ihren alten Schlüssel mit. » Les étiquettes (Zettel) concernent seulement les vieux vélos abandonnés.'),
        choice('q4', bi('Was soll man tun, wenn man sein altes Fahrrad behalten möchte?', 'Que faut-il faire si l’on veut garder son vieux vélo ?'),
          [['den Zettel bis Ende des Monats abnehmen', true], ['Herrn Wolff anrufen'], ['das Fahrrad in den Hof stellen']],
          '« Wer sein Fahrrad behalten möchte, nimmt den Zettel einfach bis Ende des Monats ab. » Pas besoin d’appeler ; et mettre le vélo dans la cour est justement interdit par la Hausordnung.'),
        dictation('q5', 'Der Hausmeister, der sich um Ihr Haus kümmert, heißt Herr Arslan.',
          'Relative au nominatif (der, sujet de « kümmert »), verbe à la fin, virgules avant et après la relative. sich kümmern um + accusatif : um Ihr Haus. Majuscules : Hausmeister, Ihr (vouvoiement), Haus.', 'sprecherin'),
        dictation('q6', 'Bitte holen Sie Ihr Fahrrad vorher aus dem Keller.',
          'Demande polie à l’impératif de politesse : le verbe holen vient en tête, puis Sie. aus + datif : aus dem Keller. Ihr prend la majuscule de politesse.', 'mann3'),
      ] },

    // 10 · Vérifier
    { id: 'b1-wohnen-kontrolle', kind: 'exercise', title: 'Vérifier : un problème entre voisins', estimatedMinutes: 12,
      competences: ['lecture', 'ecoute'],
      lesson: { description: `${bi('Hier prüfen Sie, was Sie in diesem Modul gelernt haben: Lesen, Hören, Grammatik und Wortschatz.', 'Vérifiez ici ce que vous avez appris dans ce module : lecture, écoute, grammaire et vocabulaire.')}
${bi('Lesen Sie zuerst die Nachricht von Luc Martin. Hören Sie dann die Antwort von Lena Hoffmann.', 'Lisez d’abord le message de Luc Martin. Écoutez ensuite la réponse de Lena Hoffmann.')}

NACHRICHT AN DIE NACHBARIN
Hallo Frau Hoffmann,
ich bin der neue Mieter aus dem ersten Stock. Ich möchte Sie etwas fragen: Seit Montag steht unten im Treppenhaus, direkt neben den Briefkästen, ein großes Regal, das den Weg ziemlich eng macht. Gestern hat der Postbote ein Paket danebengestellt, und ich bin kaum noch vorbeigekommen. Ich weiß nicht, wem das Regal gehört. Falls es Ihres ist: Könnten wir am Samstag zusammen einen anderen Platz dafür suchen? Der Raum neben dem Hof ist meistens leer.
Viele Grüße
Luc Martin` },
      placements: [{ media: 'b1-wohnen-kontrolle-audio', transcriptVisibility: 'after_answer' }],
      questions: [
        choice('q1', bi('Was möchte Luc Martin von Frau Hoffmann?', 'Que veut Luc Martin de Mme Hoffmann ?'),
          [['Er beschwert sich bei ihr über laute Musik aus ihrer Wohnung.'], ['Er bittet sie, am Samstag ein Paket für ihn anzunehmen, weil er nicht da ist.'], ['Er möchte wissen, ob das Regal ihr gehört, und eine Lösung finden.', true]],
          'Luc ne sait pas à qui appartient l’étagère (« Ich weiß nicht, wem das Regal gehört ») et propose de chercher ensemble un autre endroit. Le colis n’est qu’un exemple de la gêne causée.'),
        choice('q2', bi('Wem gehört das Regal?', 'À qui appartient l’étagère ?'),
          [['einem neuen Nachbarn aus dem dritten Stock', true], ['Frau Hoffmann aus dem zweiten Stock'], ['dem Hausmeister, Herrn Arslan, im ersten Stock']],
          'Lena Hoffmann répond : « Das Regal … gehört nicht mir, sondern dem Mann, der letzten Monat in den dritten Stock eingezogen ist ». nicht …, sondern … corrige une hypothèse.'),
        choice('q3', bi('Wann bringt der Besitzer das Regal weg?', 'Quand le propriétaire enlèvera-t-il l’étagère ?'),
          [['am Freitag'], ['am Samstag', true], ['heute Morgen']],
          'Ses autres meubles arrivent vendredi, et « Das Regal bringt er dann am Samstag in seine Wohnung ». Ce matin, c’est le moment où Lena l’a croisé dans la cour.'),
        fill('q4', bi('Ergänzen Sie die Relativpronomen.', 'Complétez avec les pronoms relatifs.'),
          'Das Regal, [[1]] im Treppenhaus steht, gehört dem Mann, [[2]] in den dritten Stock eingezogen ist. Lena hat ihn im Hof getroffen, in [[3]] die Mülltonnen stehen.',
          [['das'], ['der'], ['dem']],
          '1 : sujet, neutre (das Regal) : das. 2 : sujet, masculin (der Mann) : der, même si « dem Mann » est au datif dans la principale ; le cas vient de la fonction dans la relative. 3 : in + datif (position), der Hof : in dem.'),
        order('q5', bi('Bilden Sie einen Satz. Beginnen Sie mit „Das ist“.', 'Remettez les mots dans l’ordre en commençant par « Das ist ».'),
          [['Das ist', 'der Nachbar,', 'dem', 'das große Regal', 'im Treppenhaus', 'gehört.'],
            ['Das ist', 'der Nachbar,', 'dem', 'im Treppenhaus', 'das große Regal', 'gehört.']],
          'gehören + datif : le pronom relatif est dem (der Nachbar, masculin). Le verbe gehört ferme la relative. « im Treppenhaus » peut se placer avant ou après le sujet « das große Regal ».'),
        choice('q6', bi('Welche Form passt? „Der Postbote hat das Paket neben das Regal …“', 'Quelle forme convient ? « Le facteur a posé le colis à côté de l’étagère. »'),
          [['gestanden.'], ['gestellt.', true], ['gelegen.']],
          '« neben das Regal » (accusatif) indique un déplacement : il faut un verbe d’action, stellen, participe gestellt. gestanden (stehen) et gelegen (liegen) décrivent une position et demanderaient le datif, « neben dem Regal ».'),
        choice('q7', bi('Das Regal gehört nicht Ihnen. Was antworten Sie Luc?', 'L’étagère ne vous appartient pas. Que répondez-vous à Luc ?'),
          [['Ja, das Regal gehört mir. Ich stelle es am Samstag gern in den Raum neben dem Hof.'], ['Das Regal steht seit Montag im Treppenhaus, direkt neben den Briefkästen.'], ['Das Regal gehört leider nicht mir, aber ich frage gern die anderen Nachbarn.', true]],
          'On répond à sa question (non, il n’est pas à moi) et on propose son aide. La première réponse dit le contraire de la situation ; la deuxième répète le problème sans répondre.'),
      ] },
  ],
};
