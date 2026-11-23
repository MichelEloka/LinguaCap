// Couche pédagogique V4 · A1 · Nombres, couleurs et coordonnées.
const REPEAT = 'Écoutez le modèle, puis dites la phrase à voix haute.';
const speak = (id, text, explanation, accept = [text]) => ({ id, type: 'speak', prompt: REPEAT, text, accept, explanation });

export default {
  module: 'a1-zahlen',
  // Scripts alignés sur le dialogue affiché (adresse, salle) ; domaine d’exemple beispiel.de à la place d’un fournisseur réel.
  media: [
    {
      key: "a1-zahlen-hoeren-audio-v3", kind: "audio", title: "Quatre petites scènes avec des nombres", credit: "LinguaCap, synthèse Piper avec Thorsten Müller (CC0) et Kerstin, préentraînée sur la voix de Cori Samuel (Hi-Fi TTS, CC BY 4.0)", license: "Jeux de données des voix : CC0 et CC BY 4.0",
      script: [
        { voice: "sprecher", text: "Szene eins." },
        { pause: 0.8 },
        { voice: "frau", name: "Lena", text: "Hallo Ben, hier ist Lena. Ich habe eine neue Handynummer." },
        { pause: 0.5 },
        { voice: "mann", name: "Ben", text: "Ah, super! Moment, ich schreibe. Wie ist die Nummer?" },
        { pause: 0.5 },
        { voice: "frau", name: "Lena", text: "Null, eins, fünf, eins, achtundsechzig, dreiundvierzig, siebenundzwanzig." },
        { pause: 0.5 },
        { voice: "mann", name: "Ben", text: "Danke, Lena. Bis bald!" },
        { pause: 1.5 },
        { voice: "sprecher", text: "Szene zwei." },
        { pause: 0.8 },
        { voice: "frau", name: "Emma", text: "Alles Gute zum Geburtstag, Opa! Wie alt bist du jetzt?" },
        { pause: 0.5 },
        { voice: "mann", name: "Opa", text: "Danke, Emma! Ich bin heute einundsiebzig Jahre alt." },
        { pause: 0.5 },
        { voice: "frau", name: "Emma", text: "Wow! Und du bist so fit!" },
        { pause: 1.5 },
        { voice: "sprecher", text: "Szene drei." },
        { pause: 0.8 },
        { voice: "frau", name: "Bibliothek", text: "So, Herr Kaya. Und wie ist Ihre E-Mail-Adresse?" },
        { pause: 0.5 },
        { voice: "mann", name: "Herr Kaya", text: "S Punkt Kaya at beispiel Punkt de." },
        { pause: 0.5 },
        { voice: "frau", name: "Bibliothek", text: "Schreibt man Kaya mit J?" },
        { pause: 0.5 },
        { voice: "mann", name: "Herr Kaya", text: "Nein, mit Y. K, A, Y, A." },
        { pause: 0.5 },
        { voice: "frau", name: "Bibliothek", text: "Vielen Dank, Herr Kaya, das ist alles." },
        { pause: 1.5 },
        { voice: "sprecher", text: "Szene vier." },
        { pause: 0.8 },
        { voice: "frau", name: "Verkäuferin", text: "Guten Tag! Was kann ich für Sie tun?" },
        { pause: 0.5 },
        { voice: "mann", name: "Herr Yilmaz", text: "Guten Tag! Ich brauche ein Handy für meine Tochter. Sie ist zwölf." },
        { pause: 0.5 },
        { voice: "frau", name: "Verkäuferin", text: "Hier, das Handy ist gut. Es kostet neunundfünfzig Euro." },
        { pause: 0.5 },
        { voice: "mann", name: "Herr Yilmaz", text: "Gut. Haben Sie das Handy auch in Lila?" },
        { pause: 0.5 },
        { voice: "frau", name: "Verkäuferin", text: "Ja, in Lila und in Grün." },
        { pause: 0.5 },
        { voice: "mann", name: "Herr Yilmaz", text: "Lila, bitte! Lila ist ihre Lieblingsfarbe." },
      ],
    },
    {
      key: "a1-zahlen-sprechen-audio-v3", kind: "audio", title: "Julien donne ses coordonnées", credit: "LinguaCap, synthèse Piper avec Thorsten Müller (CC0) et Kerstin, préentraînée sur la voix de Cori Samuel (Hi-Fi TTS, CC BY 4.0)", license: "Jeux de données des voix : CC0 et CC BY 4.0",
      script: [
        { voice: "mann", name: "Julien", text: "Guten Tag! Mein Name ist Julien Morel. Morel: M, O, R, E, L. Ich bin vierunddreißig Jahre alt. Ich komme aus Belgien und wohne jetzt in Köln." },
        { pause: 0.6 },
        { voice: "mann", name: "Julien", text: "Meine Adresse ist Bonner Straße einundachtzig, fünf, null, sechs, sieben, sieben Köln. Meine Handynummer ist null, eins, sieben, null, zweiundfünfzig, sechsunddreißig, achtzehn." },
        { pause: 0.6 },
        { voice: "mann", name: "Julien", text: "Meine E-Mail-Adresse ist Julien Punkt Morel at beispiel Punkt de. Meine Lieblingsfarbe ist Grün." },
      ],
    },
    {
      key: "a1-zahlen-dialog-audio-v3", kind: "audio", title: "Dialogue : l’inscription au cours", credit: "LinguaCap, synthèse Piper avec Thorsten Müller (CC0) et Kerstin, préentraînée sur la voix de Cori Samuel (Hi-Fi TTS, CC BY 4.0)", license: "Jeux de données des voix : CC0 et CC BY 4.0",
      script: [
        { voice: "mann", name: "Herr Krüger", text: "Guten Tag! Bitte schön?" },
        { pause: 0.6 },
        { voice: "frau", name: "Awa", text: "Guten Tag! Ich lerne Deutsch. Ist hier die Kursanmeldung?" },
        { pause: 0.6 },
        { voice: "mann", name: "Herr Krüger", text: "Ja, hier sind Sie richtig. Wie ist Ihr Name, bitte?" },
        { pause: 0.6 },
        { voice: "frau", name: "Awa", text: "Diallo, Awa Diallo. D, I, A, L, L, O." },
        { pause: 0.6 },
        { voice: "mann", name: "Herr Krüger", text: "Danke. Und wie alt sind Sie, Frau Diallo?" },
        { pause: 0.6 },
        { voice: "frau", name: "Awa", text: "Ich bin achtundzwanzig Jahre alt." },
        { pause: 0.6 },
        { voice: "mann", name: "Herr Krüger", text: "Was ist Ihre Adresse?" },
        { pause: 0.6 },
        { voice: "frau", name: "Awa", text: "Lindenstraße vierzehn, in Würzburg." },
        { pause: 0.6 },
        { voice: "mann", name: "Herr Krüger", text: "Und die Postleitzahl?" },
        { pause: 0.6 },
        { voice: "frau", name: "Awa", text: "Neun, sieben, null, sieben, vier." },
        { pause: 0.6 },
        { voice: "mann", name: "Herr Krüger", text: "Haben Sie auch eine Handynummer?" },
        { pause: 0.6 },
        { voice: "frau", name: "Awa", text: "Ja. Null, eins, fünf, zwei, dreiundvierzig, achtundsechzig, einundneunzig." },
        { pause: 0.6 },
        { voice: "mann", name: "Herr Krüger", text: "Und Ihre E-Mail-Adresse?" },
        { pause: 0.6 },
        { voice: "frau", name: "Awa", text: "Awa Punkt Diallo at beispiel Punkt de." },
        { pause: 0.6 },
        { voice: "mann", name: "Herr Krüger", text: "Danke. Arbeiten Sie hier in Würzburg?" },
        { pause: 0.6 },
        { voice: "frau", name: "Awa", text: "Ja, ich arbeite als Köchin. Und ich brauche Deutsch für die Arbeit." },
        { pause: 0.6 },
        { voice: "mann", name: "Herr Krüger", text: "Sehr gut. Ihr Kurs ist in Raum dreiundzwanzig. Er kostet fünfundneunzig Euro." },
        { pause: 0.6 },
        { voice: "frau", name: "Awa", text: "Raum dreiundzwanzig. Vielen Dank!" },
        { pause: 0.6 },
        { voice: "mann", name: "Herr Krüger", text: "Bitte sehr. Auf Wiedersehen, Frau Diallo!" },
      ],
    },
  ],
  grammarFocus: ['present-verbes-reguliers-haben'],
  vocabulary: [
    { id: 'zahl', word: 'Zahl', article: 'die', plural: 'Zahlen', partOfSpeech: 'noun', translation: 'le nombre', example: 'Schreiben Sie die Zahl in Buchstaben.', note: null },
    { id: 'alt', word: 'alt', article: null, plural: null, partOfSpeech: 'adjective', translation: 'âgé ; vieux', example: 'Wie alt sind Sie?', note: 'l’âge se dit avec sein : Ich bin 25 Jahre alt.' },
    { id: 'jahr', word: 'Jahr', article: 'das', plural: 'Jahre', partOfSpeech: 'noun', translation: 'l’an, l’année', example: 'Ich bin achtundzwanzig Jahre alt.', note: null },
    { id: 'handy', word: 'Handy', article: 'das', plural: 'Handys', partOfSpeech: 'noun', translation: 'le téléphone portable', example: 'Mein Handy ist schwarz.', note: 'faux ami : un ordinateur portable se dit der Laptop' },
    { id: 'handynummer', word: 'Handynummer', article: 'die', plural: 'Handynummern', partOfSpeech: 'noun', translation: 'le numéro de portable', example: 'Wie ist Ihre Handynummer?', note: null },
    { id: 'adresse', word: 'Adresse', article: 'die', plural: 'Adressen', partOfSpeech: 'noun', translation: 'l’adresse', example: 'Was ist Ihre Adresse?', note: null },
    { id: 'strasse', word: 'Straße', article: 'die', plural: 'Straßen', partOfSpeech: 'noun', translation: 'la rue', example: 'In welcher Straße wohnen Sie?', note: 'on écrit la rue, puis le numéro : Lindenstraße 14' },
    { id: 'postleitzahl', word: 'Postleitzahl', article: 'die', plural: 'Postleitzahlen', partOfSpeech: 'noun', translation: 'le code postal', example: 'Die Postleitzahl ist 97074.', note: 'abréviation : PLZ' },
    { id: 'e-mail-adresse', word: 'E-Mail-Adresse', article: 'die', plural: 'E-Mail-Adressen', partOfSpeech: 'noun', translation: 'l’adresse e-mail', example: 'Wie ist Ihre E-Mail-Adresse?', note: '@ se dit « at », le point se dit « Punkt »' },
    { id: 'preis', word: 'Preis', article: 'der', plural: 'Preise', partOfSpeech: 'noun', translation: 'le prix', example: 'Der Preis ist fünfundneunzig Euro.', note: null },
    { id: 'kosten', word: 'kosten', article: null, plural: null, partOfSpeech: 'verb', translation: 'coûter', example: 'Wie viel kosten die T-Shirts?', note: 'Was kostet das? : combien ça coûte ?' },
    { id: 'euro', word: 'Euro', article: 'der', plural: 'Euros', partOfSpeech: 'noun', translation: 'l’euro', example: 'Das Handy kostet neunundfünfzig Euro.', note: 'après un nombre, sans -s : zwanzig Euro' },
    { id: 'bezahlen', word: 'bezahlen', article: null, plural: null, partOfSpeech: 'verb', translation: 'payer', example: 'Wie bezahlen Sie?', note: 'bar bezahlen : payer en espèces ; mit Karte bezahlen : payer par carte' },
    { id: 'karte', word: 'Karte', article: 'die', plural: 'Karten', partOfSpeech: 'noun', translation: 'la carte (bancaire)', example: 'Kann ich mit Karte bezahlen?', note: null },
    { id: 'teuer', word: 'teuer', article: null, plural: null, partOfSpeech: 'adjective', translation: 'cher', example: 'Die Schweiz ist teuer!', note: null },
    { id: 'farbe', word: 'Farbe', article: 'die', plural: 'Farben', partOfSpeech: 'noun', translation: 'la couleur', example: 'Welche Farbe hat dein Handy?', note: null },
    { id: 'rot', word: 'rot', article: null, plural: null, partOfSpeech: 'adjective', translation: 'rouge', example: 'Die T-Shirts sind rot.', note: null },
    { id: 'blau', word: 'blau', article: null, plural: null, partOfSpeech: 'adjective', translation: 'bleu', example: 'Das Meer ist blau.', note: null },
    { id: 'gruen', word: 'grün', article: null, plural: null, partOfSpeech: 'adjective', translation: 'vert', example: 'Das Blatt ist grün.', note: null },
    { id: 'schwarz', word: 'schwarz', article: null, plural: null, partOfSpeech: 'adjective', translation: 'noir', example: 'Der Kaffee ist schwarz.', note: null },
    { id: 'weiss', word: 'weiß', article: null, plural: null, partOfSpeech: 'adjective', translation: 'blanc', example: 'Der Schnee ist weiß.', note: null },
    { id: 'haben', word: 'haben', article: null, plural: null, partOfSpeech: 'verb', translation: 'avoir', example: 'Haben Sie eine Handynummer?', note: 'ich habe, du hast, er hat, wir haben, ihr habt' },
    { id: 'arbeiten', word: 'arbeiten', article: null, plural: null, partOfSpeech: 'verb', translation: 'travailler', example: 'Arbeiten Sie hier in Würzburg?', note: 'du arbeitest, er arbeitet' },
    { id: 'lernen', word: 'lernen', article: null, plural: null, partOfSpeech: 'verb', translation: 'apprendre', example: 'Wir lernen Deutsch.', note: null },
  ],
  activities: {
    'a1-zahlen-wortschatz': {
      title: 'Découvrir : les nombres de 0 à 100',
      estimatedMinutes: 12,
      lesson: {
        title: 'Découvrir : les nombres de 0 à 100',
        description: `Les nombres servent partout : pour dire son âge, donner son numéro de téléphone ou son adresse, comprendre un prix.

DE 0 À 12 : À APPRENDRE PAR CŒUR
• 0 null — 1 eins — 2 zwei — 3 drei — 4 vier
• 5 fünf — 6 sechs — 7 sieben — 8 acht
• 9 neun — 10 zehn — 11 elf — 12 zwölf

DE 13 À 19 : UNITÉ + ZEHN
• 13 dreizehn — 14 vierzehn — 15 fünfzehn — 16 sechzehn
• 17 siebzehn — 18 achtzehn — 19 neunzehn
Attention : on écrit sechzehn (sans le s de sechs) et siebzehn (sans le en de sieben).

LES DIZAINES
• 20 zwanzig — 30 dreißig — 40 vierzig — 50 fünfzig
• 60 sechzig — 70 siebzig — 80 achtzig — 90 neunzig — 100 hundert
Attention : 30 se termine en -ßig (dreißig) et non en -zig ; sechzig et siebzig perdent aussi des lettres.

DE 21 À 99 : L’UNITÉ D’ABORD
On dit d’abord l’unité, puis « und », puis la dizaine, en un seul mot :
• 21 einundzwanzig (mot à mot : « un-et-vingt »)
• 34 vierunddreißig
• 57 siebenundfünfzig
• 99 neunundneunzig
Astuce : quand vous entendez « dreiundvierzig », pensez d’abord au 3 à droite, puis au 4 à sa gauche : 43.
Attention : on dit eins, mais einundzwanzig (sans s).

L’ÂGE
• Wie alt bist du? / Wie alt sind Sie? — Quel âge as-tu ? / Quel âge avez-vous ?
• Ich bin 25 (fünfundzwanzig) Jahre alt. — J’ai 25 ans.
En allemand, on « est » 25 ans : on emploie sein, jamais haben.

LE NUMÉRO DE TÉLÉPHONE
• Wie ist deine Handynummer? — Quel est ton numéro de portable ?
• Wie ist Ihre Telefonnummer? — Quel est votre numéro de téléphone ?
• On dicte le numéro chiffre par chiffre (0176 : null – eins – sieben – sechs) ou par groupes de deux (34 : vierunddreißig).
• Au téléphone, on dit souvent « zwo » au lieu de « zwei », pour ne pas confondre avec « drei ».

LES NOMBRES AU QUOTIDIEN
• das Alter — l’âge
• die Handynummer — le numéro de portable
• die Hausnummer — le numéro dans la rue
• die Postleitzahl (PLZ) — le code postal
• der Preis — le prix : Das kostet 20 Euro.
• die Buslinie — la ligne de bus : der Bus Nummer 14

Écoutez l’enregistrement : chaque nombre est lu lentement. Répétez à voix haute pendant la pause, puis réécoutez en cachant le texte et dites chaque nombre avant la voix.`,
      },
    },
    'a1-zahlen-dialog': {
      title: 'Comprendre : l’inscription au cours d’allemand',
      lesson: { title: 'Comprendre : l’inscription au cours d’allemand', description: "Awa Diallo vient du Mali et habite à Würzburg. Elle s’inscrit à un cours d’allemand à la Volkshochschule (l’université populaire, qui propose des cours pour adultes dans chaque ville). Écoutez le dialogue une première fois sans lire, puis une deuxième fois en suivant le texte.\n\nDIALOGUE\nHerr Krüger : Guten Tag! Bitte schön?\nAwa : Guten Tag! Ich lerne Deutsch. Ist hier die Kursanmeldung?\nHerr Krüger : Ja, hier sind Sie richtig. Wie ist Ihr Name, bitte?\nAwa : Diallo, Awa Diallo. D – I – A – L – L – O.\nHerr Krüger : Danke. Und wie alt sind Sie, Frau Diallo?\nAwa : Ich bin achtundzwanzig Jahre alt.\nHerr Krüger : Was ist Ihre Adresse?\nAwa : Lindenstraße vierzehn, in Würzburg.\nHerr Krüger : Und die Postleitzahl?\nAwa : Neun, sieben, null, sieben, vier. (97074)\nHerr Krüger : Haben Sie auch eine Handynummer?\nAwa : Ja. Null, eins, fünf, zwei, dreiundvierzig, achtundsechzig, einundneunzig. (0152 43 68 91)\nHerr Krüger : Und Ihre E-Mail-Adresse?\nAwa : Awa Punkt Diallo at beispiel Punkt de. (awa.diallo@beispiel.de)\nHerr Krüger : Danke. Arbeiten Sie hier in Würzburg?\nAwa : Ja, ich arbeite als Köchin. Und ich brauche Deutsch für die Arbeit.\nHerr Krüger : Sehr gut. Ihr Kurs ist in Raum dreiundzwanzig. Er kostet fünfundneunzig Euro.\nAwa : Raum dreiundzwanzig. Vielen Dank!\nHerr Krüger : Bitte sehr. Auf Wiedersehen, Frau Diallo!\n\nDONNER SES COORDONNÉES\n• Wie ist Ihr Name? — Mein Name ist … / Ich heiße …\n• Wie alt sind Sie? — Ich bin … Jahre alt.\n• Was ist Ihre Adresse? — Lindenstraße 14, 97074 Würzburg.\nEn Allemagne, on écrit la rue, puis le numéro, puis le code postal (cinq chiffres) et la ville.\n• Wie ist Ihre Handynummer? — 0152 43 68 91.\n• Wie ist Ihre E-Mail-Adresse? — @ se dit « at » (prononcé comme « ète ») et le point se dit « Punkt ».\n\nGRAMMAIRE : LE PRÉSENT DES VERBES RÉGULIERS\nOn enlève -en à l’infinitif pour trouver le radical (wohn-en → wohn-), puis on ajoute la terminaison de la personne.\nwohnen (habiter)\n• ich wohne — j’habite\n• du wohnst — tu habites\n• er/sie/es wohnt — il/elle habite\n• wir wohnen — nous habitons\n• ihr wohnt — vous habitez (plusieurs personnes que l’on tutoie)\n• sie wohnen — ils/elles habitent\n• Sie wohnen — vous habitez (politesse, une ou plusieurs personnes)\nDe la même façon : lernen (apprendre), kommen (venir), machen (faire), brauchen (avoir besoin de), kaufen (acheter), spielen (jouer).\n\nDEUX PETITES DIFFICULTÉS\n• Radical terminé par -t ou -d : on ajoute un -e- pour pouvoir prononcer. arbeiten → du arbeitest, er arbeitet, ihr arbeitet ; finden → du findest, er findet.\n• Radical terminé par -s, -ß ou -z : avec du, on ajoute seulement -t. heißen → du heißt ; tanzen → du tanzt.\n\nSIE, SIE OU SIE ?\n• sie wohnt (verbe en -t) — elle habite\n• sie wohnen (verbe en -en, minuscule) — ils/elles habitent\n• Sie wohnen (verbe en -en, majuscule) — vous habitez\n\nLE VERBE HABEN (AVOIR)\n• ich habe — wir haben\n• du hast — ihr habt\n• er/sie/es hat — sie/Sie haben\nAttention : du hast et er hat perdent le b.\nExemples : Haben Sie eine Handynummer? — Ich habe eine Frage. — Hast du eine E-Mail-Adresse?" },
    },
    // La leçon sur les couleurs rejoint la leçon « Écouter et répéter », qui travaille déjà les couleurs avec des voix natives.
    'a1-zahlen-farben': null,
    'a1-zahlen-nachsprechen': {
      title: 'Découvrir et répéter : les couleurs et les nombres (voix natives)',
      estimatedMinutes: 15,
      competences: ['ecoute', 'expression-orale'],
      lesson: {
        title: 'Découvrir et répéter : les couleurs et les nombres (voix natives)',
        description: `LES COULEURS
• rot — rouge • blau — bleu • grün — vert • gelb — jaune
• orange — orange • braun — marron • schwarz — noir • weiß — blanc
• grau — gris • rosa — rose • lila — violet • beige — beige • bunt — multicolore
• hell — clair : hellblau (bleu clair) ; dunkel — foncé : dunkelblau (bleu foncé)

DEMANDER ET DIRE LA COULEUR
• Welche Farbe hat dein Handy? — De quelle couleur est ton portable ? (mot à mot : « Quelle couleur a ton portable ? »)
• Mein Handy ist schwarz. — Mon portable est noir.
• Was ist deine Lieblingsfarbe? — Meine Lieblingsfarbe ist Grün. — Ma couleur préférée est le vert.
Après « ist », la couleur s’écrit avec une minuscule et ne change jamais : Das Auto ist rot. Die Bücher sind rot. Quand la couleur est un nom, elle prend une majuscule : Meine Lieblingsfarbe ist Blau. On dit mein Handy, mais meine Tasche, meine Lieblingsfarbe : Tasche et Farbe sont des mots féminins.

1. ÉCOUTER LES COULEURS (premier enregistrement)
Une voix lit six couleurs dans une phrase (Die Kirsche ist rot …), puis Sara et Felix parlent de la couleur de leur portable. Répétez chaque phrase pendant la pause.

2. LES NOMBRES DE 13 À 99 (voix native)
dreizehn … neunzehn — zwanzig, einundzwanzig — dreißig, vierzig, fünfzig, sechzig, siebzig, achtzig, neunzig, hundert, zweihundert (200) — zweiunddreißig, vierundvierzig, fünfundfünfzig, sechsundsechzig, siebenundsiebzig, achtundachtzig, neunundneunzig.
• L’accent tombe sur la première partie du nombre : DREIzehn, ZWANzig, VIERundvierzig.
• Ne confondez pas -zehn (13 à 19) et -zig (20, 30, 40…) : vierzehn (14) — vierzig (40). Le g final de -zig se prononce souvent comme le ch de « ich ».
• Dans les nombres composés, on entend l’unité d’abord, puis und, puis la dizaine : vierundvierzig (44), achtundachtzig (88).

3. LES COULEURS (voix native)
• au se dit [aou] : blau, braun, grau. ei se dit [aï] et ß est un s dur : weiß se prononce à peu près « vaïss ».
• schwarz se prononce à peu près « chvarts » : sch comme le « ch » français, w comme [v], z comme [ts].
• ü se dit comme le « u » de « tu » : grün. Le g de gelb et de grün est toujours dur, comme dans « gare ».

À VOUS
1. Écoutez et répétez chaque mot pendant la pause, d’abord en lisant la transcription, puis sans la regarder.
2. Réécoutez les nombres sans la transcription et dites chaque nombre en même temps que la voix.
3. Répondez à voix haute : Welche Farbe hat dein Handy? — Was ist deine Lieblingsfarbe? — Dites la couleur de trois objets autour de vous : Mein … ist …

Enregistrements natifs : Deutsch im Blick (COERLL, Université du Texas à Austin), CC BY 4.0.`,
      },
      placements: [
        { media: 'a1-zahlen-farben-bild', usage: 'illustration', transcriptVisibility: 'hidden', decorative: false },
        { media: 'a1-zahlen-farben-audio-v3', usage: 'audio', transcriptVisibility: 'on_demand', decorative: false },
        { media: 'a1-zahlen-zahlen-native', usage: 'audio', transcriptVisibility: 'on_demand', decorative: false },
        { media: 'a1-zahlen-farben-native', usage: 'audio', transcriptVisibility: 'on_demand', decorative: false },
      ],
    },
    'a1-zahlen-aussprache': { estimatedMinutes: 10 },
    'a1-zahlen-lesen': {
      lesson: { description: "Paulo s’inscrit dans une salle de sport à Leipzig. Il remplit le formulaire, puis il écrit un e-mail à la salle de sport. Lisez les deux documents, puis répondez aux questions.\n\nANMELDUNG — FITNESSSTUDIO SPORTPUNKT LEIPZIG\nFamilienname: Costa\nVorname: Paulo\nAlter: 19\nStraße, Hausnummer: Gohliser Straße 45\nPLZ, Ort: 04155 Leipzig\nHandynummer: 0176 34 52 80\nE-Mail: paulo.costa@beispiel.de\nBeruf: Student\nSport: Fußball, Schwimmen\nUnterschrift: Paulo Costa\n\nE-MAIL\nBetreff: Meine Anmeldung\nHallo,\nich heiße Paulo Costa und trainiere jetzt im Sportpunkt. Leider ist mein Formular nicht ganz richtig. Meine Handynummer ist 0176 34 25 80. Und ich wohne in der Gohliser Straße 54, nicht 45.\nIch habe auch eine Frage: Die T-Shirts im Studio sind rot. Haben Sie die T-Shirts auch in Blau? Blau ist meine Lieblingsfarbe!\nViele Grüße\nPaulo Costa" },
      explanations: {
        q1: 'Le formulaire indique « Alter: 19 », soit neunzehn (neun + zehn). Neunzig vaut 90 et neun 9 : -zehn marque les nombres de 13 à 19, -zig les dizaines.',
        q2: 'Paulo écrit « Leider ist mein Formular nicht ganz richtig » : le numéro de portable et le numéro de rue sont faux. Puis « Ich habe auch eine Frage » sur les T-shirts. Il ne veut pas annuler.',
        q3: 'Dans l’e-mail, Paulo corrige : « Meine Handynummer ist 0176 34 25 80 ». Le formulaire (34 52 80) inversait deux chiffres : c’est l’e-mail qui donne le bon numéro.',
        q4: 'Paulo écrit « Gohliser Straße 54, nicht 45 » : 54 se dit vierundfünfzig, l’unité (vier) avant la dizaine (fünfzig). Fünfundvierzig (45) est le numéro erroné du formulaire.',
        q5: '« Die T-Shirts im Studio sind rot » : les T-shirts sont rouges. Paulo demande s’ils existent en bleu, sa couleur préférée ; ils ne sont donc pas bleus.',
      },
    },
    'a1-zahlen-hoeren': {
      // Questions du kit à l’identique (identifiants, choix), domaine d’exemple beispiel.de dans q3.
      questions: [
        { id: 'q1', type: 'choice', prompt: "Scène 1 : quel est le nouveau numéro de portable de Lena ?", options: [{ id: 'a', label: "0151 86 34 72", correct: false }, { id: 'b', label: "0151 68 34 27", correct: false }, { id: 'c', label: "0151 68 43 27", correct: true }, { id: 'd', label: "0151 86 43 72", correct: false }] },
        { id: 'q2', type: 'choice', prompt: "Scène 2 : quel âge a le grand-père d’Emma ?", options: [{ id: 'a', label: "17 ans.", correct: false }, { id: 'b', label: "71 ans.", correct: true }, { id: 'c', label: "61 ans.", correct: false }, { id: 'd', label: "77 ans.", correct: false }] },
        { id: 'q3', type: 'choice', prompt: "Scène 3 : quelle est l’adresse e-mail de Monsieur Kaya ?", options: [{ id: 'a', label: "s.kaja@beispiel.de", correct: false }, { id: 'b', label: "s-kaya@beispiel.de", correct: false }, { id: 'c', label: "s.kaya@beispiel.com", correct: false }, { id: 'd', label: "s.kaya@beispiel.de", correct: true }] },
        { id: 'q4', type: 'choice', prompt: "Scène 4 : qu’achète Monsieur Yilmaz pour sa fille ?", options: [{ id: 'a', label: "Un téléphone portable.", correct: true }, { id: 'b', label: "Un ordinateur portable.", correct: false }, { id: 'c', label: "Une montre.", correct: false }] },
        { id: 'q5', type: 'choice', prompt: "Scène 4 : combien coûte l’achat et quelle couleur Monsieur Yilmaz choisit-il ?", options: [{ id: 'a', label: "95 euros, en violet.", correct: false }, { id: 'b', label: "59 euros, en vert.", correct: false }, { id: 'c', label: "59 euros, en violet.", correct: true }, { id: 'd', label: "95 euros, en vert.", correct: false }] },
      ],
      lesson: {
        description: 'Écoutez les quatre petites scènes (vous pouvez réécouter autant de fois que nécessaire), puis répondez aux questions. Attention aux nombres : on entend l’unité avant la dizaine. Les deux dernières questions sont des dictées : écoutez la phrase et écrivez-la, les nombres en chiffres ou en lettres. Les transcriptions s’affichent après votre réponse.',
      },
      explanations: {
        q1: 'Lena dicte « null, eins, fünf, eins, achtundsechzig, dreiundvierzig, siebenundzwanzig » : 68, 43, 27. Dans chaque paire, l’unité vient d’abord : achtundsechzig = 68, pas 86.',
        q2: 'Opa dit « Ich bin heute einundsiebzig Jahre alt » : ein-und-siebzig = 71. Siebzehn (17) finit par -zehn, et 61 se dirait einundsechzig.',
        q3: 'M. Kaya dit « S Punkt Kaya at beispiel Punkt de » et précise « Nein, mit Y » : s.kaya@beispiel.de. Punkt est le point et at l’arobase ; l’adresse finit par de, pas par com.',
        q4: '« Ich brauche ein Handy für meine Tochter » : das Handy est le téléphone portable, un faux ami pour un francophone. Un ordinateur portable se dit der Laptop.',
        q5: 'La vendeuse annonce « neunundfünfzig Euro » (59) et le client choisit « Lila, bitte! » : lila veut dire violet. 95 inverserait les chiffres ; le vert est l’autre couleur proposée.',
      },
      addQuestions: [
        {
          id: 'q6', type: 'dictation', prompt: 'Dictée : écoutez la phrase et écrivez-la.',
          accept: ['Ich bin achtundzwanzig Jahre alt und wohne in Würzburg.', 'Ich bin 28 Jahre alt und wohne in Würzburg.'],
          voice: 'frau',
          explanation: 'Achtundzwanzig = 28 : l’unité (acht) puis la dizaine (zwanzig), en un seul mot. L’âge se dit avec sein (ich bin), et wohnen in donne le lieu où l’on habite.',
        },
        {
          id: 'q7', type: 'dictation', prompt: 'Dictée : écoutez la phrase et écrivez-la.',
          accept: ['Das Handy kostet neunundfünfzig Euro, nicht fünfundneunzig.', 'Das Handy kostet 59 Euro, nicht 95.'],
          voice: 'mann',
          explanation: 'Neunundfünfzig = 59 et fünfundneunzig = 95 : les mêmes chiffres, mais l’unité se dit toujours en premier. Das Handy est neutre et prend une majuscule, comme tous les noms.',
        },
      ],
    },
    'a1-zahlen-geld-lesen': {
      estimatedMinutes: 10,
      explanations: {
        q1: 'Chloé écrit « In Österreich bezahle ich mit Euro, wie in Deutschland ». Le dollar est la monnaie du Canada et le franc celle de la Suisse.',
        q2: 'Le serveur dit « Nur Bargeld, bitte! » : seulement de l’argent liquide. Sa carte n’est pas en panne : le café n’accepte simplement pas les cartes.',
        q3: '« Ein Stück Sachertorte sieben Euro » : sieben = 7. Vier Euro est le prix du café, et siebzehn (17) se terminerait par -zehn.',
        q4: 'Jana dit « In Deutschland bezahlen auch viele Leute gern bar » : viele Leute = beaucoup de gens, bar = en espèces. Elle ne dit pas que tout le monde paie par carte.',
        q5: '« Ein Kaffee kostet hier sechs Franken. In Montréal kostet ein Kaffee nur drei Dollar! » Le chocolat, lui, coûte seulement deux francs la tablette : ce n’est pas lui qui est cher.',
        q6: '« Ich kaufe zehn Tafeln für meine Familie » : zehn = 10, pour sa famille. Zwei est le prix d’une tablette en francs, et douze se dirait zwölf.',
      },
    },
    'a1-zahlen-geld-hoeren': {
      estimatedMinutes: 10,
      explanations: {
        q1: 'Herr Krause répond « Fast immer bar. Ich habe gern Bargeld in der Tasche » : bar veut dire en espèces. C’est Lea qui paie avec son portable.',
        q2: '« Sieben Euro! Das ist teuer! » : sieben = 7. Siebzehn (17) aurait la fin -zehn.',
        q3: 'Lea dit « Mit dem Handy! Das ist super schnell » : schnell veut dire rapide. Elle ne parle ni de prix ni de gratuité.',
        q4: '« Dreizehn Euro » : drei + zehn = 13. Dreißig (30) se termine par -ßig et vierzehn (14) commence par vier.',
        q5: '« Im Restaurant bezahle ich mit Karte. Aber auf dem Markt bezahle ich bar » : par carte au restaurant, en espèces (bar) au marché.',
        q6: '« Ungefähr fünfundzwanzig Franken » : fünf-und-zwanzig = 25, en francs puisqu’on est en Suisse. 52 inverserait l’unité et la dizaine.',
      },
    },
    'a1-zahlen-fotos': {
      explanations: {
        q1: 'Le feu montre un bonhomme vert en haut et un bonhomme rouge en bas : rot und grün. Ce feu pour piétons n’a pas de lumière jaune (gelb).',
        q2: 'La pièce porte « 10 FR » et la croix suisse : zehn Franken. En Suisse, on ne paie pas en euros.',
        q3: 'Sur la carte, Berlin affiche 18 degrés : acht + zehn = achtzehn. Achtzig (80) est une dizaine et achtundzwanzig vaut 28.',
        q4: 'München affiche 22 degrés : zwei-und-zwanzig, l’unité avant la dizaine. Zwölf vaut 12 et zweiunddreißig 32.',
        q5: 'Siebzehn = 17 : sieben perd -en devant -zehn. Sur la carte, ce nombre s’affiche à Rostock, au bord de la mer Baltique ; Hamburg, Köln et Stuttgart ont d’autres températures.',
      },
    },
    'a1-zahlen-grammatik': {
      title: 'S’entraîner : verbes réguliers, haben et nombres',
      estimatedMinutes: 12,
      lesson: {
        title: 'S’entraîner : verbes réguliers, haben et nombres',
        description: 'Choisissez ou écrivez la forme qui complète chaque phrase. Rappel : ich -e, du -st, er/sie/es -t, wir -en, ihr -t, sie/Sie -en. Avec un radical en -t (arbeiten), on ajoute -e- : du arbeitest, er arbeitet. Le verbe haben : ich habe, du hast, er hat, wir haben, ihr habt, sie/Sie haben. Dans les phrases à remettre en ordre, touchez les étiquettes dans l’ordre de la phrase.',
      },
      explanations: {
        q1: 'Ihr (vous, à plusieurs personnes que l’on tutoie) se conjugue avec -t : ihr wohnt. Wohnen va avec wir, sie ou Sie, et wohnst avec du.',
        q2: 'L’âge se dit avec sein : Ich bin 43 Jahre alt. « Ich habe … Jahre » est un calque du français « j’ai … ans ».',
        q3: 'Mein Freund Paul, c’est er : la terminaison est -t. Le radical arbeit- se termine déjà par -t, on ajoute donc -e- : er arbeitet.',
        q4: 'Avec du, haben devient hast : le b disparaît. Hat va avec er ou sie, habt avec ihr ; dans une question oui/non, le verbe vient en premier.',
        q5: 'On écrit l’unité, puis und, puis la dizaine, en un seul mot : acht-und-sechzig. Sechsundachtzig vaut 86, et sechzig s’écrit sans le s de sechs.',
        q6: 'Der Schnee (la neige) est blanc : weiß. La phrase reprend le modèle « Der Schnee ist weiß » de la leçon sur les couleurs ; schwarz veut dire noir.',
      },
      addQuestions: [
        {
          id: 'q7', type: 'fill', prompt: 'Complétez avec le verbe entre parenthèses à la bonne forme.',
          text: 'Wir [[1]] Deutsch, und ihr [[2]] Englisch. Paul [[3]] in Köln.',
          blanks: [
            { id: '1', accept: ['lernen'], size: 8, hint: 'lernen' },
            { id: '2', accept: ['lernt'], size: 8, hint: 'lernen' },
            { id: '3', accept: ['arbeitet'], size: 10, hint: 'arbeiten' },
          ],
          explanation: 'Wir prend -en (wir lernen) et ihr prend -t (ihr lernt). Arbeiten a un radical en -t : on ajoute -e- devant la terminaison, Paul arbeitet.',
        },
        {
          id: 'q8', type: 'fill', prompt: 'Complétez avec le verbe haben.',
          text: '[[1]] du eine Handynummer? – Ja, und ich [[2]] auch eine E-Mail-Adresse.',
          blanks: [{ id: '1', accept: ['Hast'], size: 6, hint: 'haben' }, { id: '2', accept: ['habe'], size: 6, hint: 'haben' }],
          explanation: 'Haben perd le b avec du et er : du hast, er hat. Avec ich, la forme est régulière : ich habe. Dans la question, le verbe vient en premier.',
        },
        {
          id: 'q9', type: 'order', prompt: 'Remettez les mots dans l’ordre pour dire votre âge (34 ans).',
          answers: [['Ich', 'bin', 'vierunddreißig', 'Jahre', 'alt.']],
          explanation: 'On dit son âge avec sein, et alt termine la phrase : Ich bin vierunddreißig Jahre alt. Le calque du français « j’ai 34 ans » (Ich habe …) est une faute fréquente.',
        },
        {
          id: 'q10', type: 'match', prompt: 'Associez chaque nombre à son écriture en lettres.',
          pairs: [
            { left: '14', right: 'vierzehn' },
            { left: '40', right: 'vierzig' },
            { left: '16', right: 'sechzehn' },
            { left: '60', right: 'sechzig' },
            { left: '43', right: 'dreiundvierzig' },
            { left: '34', right: 'vierunddreißig' },
          ],
          explanation: '-zehn donne 13 à 19, -zig les dizaines (30 fait exception : dreißig). Dans 43, on dit l’unité d’abord : drei-und-vierzig. Sechzehn et sechzig perdent le s de sechs.',
        },
      ],
    },
    'a1-zahlen-sprechen': {
      kind: 'mission',
      title: 'Mission : donner ses coordonnées à l’inscription',
      estimatedMinutes: 20,
      competences: ['expression-orale', 'expression-ecrite'],
      lesson: {
        title: 'Mission : donner ses coordonnées à l’inscription',
        description: `Vous vous inscrivez à un cours d’allemand. À l’accueil, vous donnez vos coordonnées à l’oral, puis vous remplissez la fiche. Écoutez d’abord Julien.

MODÈLE
Guten Tag! Mein Name ist Julien Morel. Morel: M – O – R – E – L. Ich bin vierunddreißig Jahre alt. Ich komme aus Belgien und wohne jetzt in Köln. Meine Adresse ist Bonner Straße 81, 50677 Köln. Meine Handynummer ist 0170 52 36 18. Meine E-Mail-Adresse ist julien.morel@beispiel.de. Meine Lieblingsfarbe ist Grün.

LA FICHE
ANMELDUNG — DEUTSCHKURS A1
Familienname · Vorname · Alter · Straße, Hausnummer · PLZ, Ort · Handynummer · E-Mail · Sprachen

Vous pouvez donner des coordonnées inventées.`,
      },
      mission: {
        oral: {
          prompt: 'Enregistrez-vous à l’accueil : dites votre nom et épelez-le, votre âge, votre adresse avec le code postal, votre numéro de portable, votre adresse e-mail et votre couleur préférée. Dictez le numéro chiffre par chiffre ou par paires.',
          maxSeconds: 90,
        },
        written: {
          prompt: 'Écrivez votre fiche d’inscription en reprenant les rubriques ci-dessus (une ligne par rubrique). Puis présentez une amie ou un collègue en quatre phrases avec er ou sie, comme : « Das ist Marie. Sie wohnt in Lyon. Sie ist dreißig Jahre alt. Sie lernt Deutsch. »',
          maxChars: 800,
          minWords: 30,
        },
        checklist: [
          'J’ai dit mon âge avec « Ich bin … Jahre alt », et non avec haben.',
          'J’ai dicté mon numéro avec l’unité avant la dizaine dans les paires (81 = einundachtzig).',
          'J’ai épelé mon nom et lu mon e-mail avec « at » et « Punkt ».',
          'Ma fiche contient toutes les rubriques : la rue, puis le numéro, puis le code postal et la ville.',
          'Dans les quatre phrases sur une autre personne, les verbes se terminent par -t : sie wohnt, er arbeitet, sie hat.',
        ],
      },
    },
  },
  add: [
    {
      after: 'a1-zahlen-grammatik',
      activity: {
        id: 'a1-zahlen-repeter',
        kind: 'exercise',
        title: 'Répéter à voix haute : âge, numéro, adresse et prix',
        estimatedMinutes: 8,
        competences: ['expression-orale'],
        lesson: {
          title: 'Répéter à voix haute : âge, numéro, adresse et prix',
          description: 'Écoutez chaque modèle autant de fois que nécessaire, puis dites la phrase sans vous presser. Dans les nombres, accentuez la première partie et dites bien l’unité avant la dizaine.',
          transcript: null,
        },
        placements: [],
        questions: [
          speak('q1', 'Ich bin fünfundzwanzig Jahre alt.', 'Fünf-und-zwanzig se dit d’un seul souffle, avec l’accent sur fünf. Le ü de fünf se prononce lèvres arrondies, comme le « u » de « tu ».', ['Ich bin fünfundzwanzig Jahre alt.', 'Ich bin 25 Jahre alt.']),
          speak('q2', 'Wie ist Ihre Telefonnummer?', 'Ihre (votre) commence par un i long. Dans Telefonnummer, l’accent tombe sur -fon- et le double m se prononce comme un seul.'),
          speak('q3', 'Ich wohne in der Lindenstraße vierzehn.', 'Straße se prononce « chtrâsse » : st en début de mot se dit « cht » et ß est un s dur. Vierzehn : accent sur vier.', ['Ich wohne in der Lindenstraße vierzehn.', 'Ich wohne in der Lindenstraße 14.']),
          speak('q4', 'Ich habe eine neue Handynummer.', 'Neue contient eu, qui se dit « oï ». Le h de habe et de Handy se prononce : soufflez légèrement.'),
          speak('q5', 'Welche Farbe hat dein Handy?', 'Welche commence par un son [v] et se termine par le ch doux de « ich ». La voix descend à la fin de la question en W.'),
          speak('q6', 'Das kostet neunundfünfzig Euro.', 'Neun-und-fünfzig = 59 : l’unité d’abord. Euro se prononce « oïro », comme eu dans neu.', ['Das kostet neunundfünfzig Euro.', 'Das kostet 59 Euro.', 'Das kostet 59 €.']),
        ],
      },
    },
  ],
  order: [
    'a1-zahlen-wortschatz', 'a1-zahlen-dialog', 'a1-zahlen-nachsprechen', 'a1-zahlen-aussprache', 'a1-zahlen-lesen',
    'a1-zahlen-hoeren', 'a1-zahlen-geld-lesen', 'a1-zahlen-geld-hoeren', 'a1-zahlen-fotos', 'a1-zahlen-grammatik',
    'a1-zahlen-repeter', 'a1-zahlen-sprechen',
  ],
};
