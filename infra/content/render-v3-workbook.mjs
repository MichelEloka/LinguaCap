import { allMedia, questionType, transcriptOf } from './content-lib.mjs';

function escape(value = '') {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[char]);
}

/** Ordre d'affichage des jetons d'une question « order » : alphabétique, décalé d'un cran s'il donne la solution. */
function shuffledTokens(answers) {
  const tokens = [...answers[0]].sort((left, right) => left.localeCompare(right, 'de'));
  const solved = answers.some((answer) => answer.join('\u0000') === tokens.join('\u0000'));
  return solved && tokens.length > 1 ? [...tokens.slice(1), tokens[0]] : tokens;
}

/** Durée d'enregistrement lisible : « 2 min », « 1 min 30 s », « 45 s ». */
function duration(seconds) {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  if (!minutes) return `${rest} s`;
  return rest ? `${minutes} min ${rest} s` : `${minutes} min`;
}

/** Réponse attendue d'une question, telle qu'affichée dans « Voir les réponses ». */
function expected(question) {
  switch (questionType(question)) {
    case 'fill': return (question.blanks ?? []).map((blank) => (blank.accept ?? []).join(' / ')).join(' · ');
    case 'order': return (question.answers ?? []).map((answer) => answer.join(' ')).join(' / ');
    case 'match': return (question.pairs ?? []).map((pair) => `${pair.left} → ${pair.right}`).join(' · ');
    case 'dictation': return question.accept?.[0] ?? '';
    case 'speak': return question.text ?? '';
    default: return question.options?.find(({ correct }) => correct)?.label ?? '';
  }
}

export function renderWorkbook(level, edition = 'V3') {
  const media = new Map(allMedia(level).map((item) => [item.key, item]));
  const code = level.levelId.toUpperCase();
  const minutes = level.modules.reduce((total, module) =>
    total + module.activities.reduce((sum, activity) => sum + activity.estimatedMinutes, 0), 0);

  function support(placement, showTranscript = true) {
    const item = media.get(placement.media);
    const base = 'content/de/media';
    const caption = escape(placement.caption || item.title);
    if (item.kind === 'audio') {
      const transcript = showTranscript && placement.transcriptVisibility !== 'hidden'
        ? `<details><summary>${placement.transcriptVisibility === 'after_answer' ? 'Transcription après l’exercice' : 'Transcription'}</summary><p class="text" lang="de">${escape(transcriptOf(item))}</p></details>`
        : '';
      return `<figure><figcaption>${caption}</figcaption>
        <audio controls preload="none" aria-label="${escape(item.title)}" src="${base}/audio/${escape(item.key)}.mp3"></audio>
        ${transcript}</figure>`;
    }
    return `<figure><img loading="lazy" src="${base}/images/${escape(item.key)}.${item.photo ? 'jpg' : 'png'}"
      alt="${placement.decorative ? '' : escape(placement.alt || item.alt)}" /><figcaption>${caption}</figcaption></figure>`;
  }

  function mainSupports(placements, showTranscript) {
    return (placements ?? []).filter((item) => !item.questionId).map((item) => support(item, showTranscript)).join('');
  }

  /** Corps d'une question selon son type : choix, texte à trous, jetons à ordonner, paires, dictée ou répétition. */
  function body(question) {
    switch (questionType(question)) {
      case 'fill':
        return `<p class="text" lang="de">${escape(question.text).replace(/\[\[[^\]]*\]\]/g, '<span class="blank">______</span>')}</p>`;
      case 'order':
        return `<p class="tokens" lang="de">${shuffledTokens(question.answers ?? [[]]).map((token) => `<span>${escape(token)}</span>`).join(' ')}</p>`;
      case 'match': {
        const rights = (question.pairs ?? []).map((pair) => pair.right).sort((left, right) => left.localeCompare(right, 'fr'));
        return `<div class="match"><ol>${(question.pairs ?? []).map((pair) => `<li lang="de">${escape(pair.left)}</li>`).join('')}</ol>
          <ol type="A">${rights.map((right) => `<li>${escape(right)}</li>`).join('')}</ol></div>`;
      }
      case 'dictation':
        return '<p class="hint">Écrivez la phrase entendue.</p>';
      case 'speak':
        return `<p class="text" lang="de"><strong>${escape(question.text)}</strong></p>`;
      default:
        return '';
    }
  }

  function questions(list, placements = [], showTranscript = true) {
    if (!list?.length) return '';
    const prompts = list.map((question) => {
      const choices = questionType(question) === 'choice' ? `<ol type="a">${(question.options ?? []).map((option) => `<li>${escape(option.label)}
        ${placements.filter((item) => item.questionId === question.id && item.optionId === option.id)
          .map((item) => support(item, showTranscript)).join('')}</li>`).join('')}</ol>` : '';
      return `<li><p class="text">${escape(question.prompt)}</p>
      ${placements.filter((item) => item.questionId === question.id && !item.optionId).map((item) => support(item, showTranscript)).join('')}
      ${body(question)}${choices}</li>`;
    });
    const answers = list.map((question) => `<li>${escape(expected(question))}${question.explanation
      ? `<br><span class="why">${escape(question.explanation)}</span>` : ''}</li>`);
    return `<ol class="questions">${prompts.join('')}</ol><details><summary>Voir les réponses</summary><ol>${answers.join('')}</ol></details>`;
  }

  function mission(activity) {
    const { oral, written, checklist } = activity.mission ?? {};
    if (!activity.mission) return '';
    return `<div class="mission">
      ${oral ? `<h4>À l’oral · ${duration(oral.maxSeconds ?? 120)} au plus</h4><p class="text">${escape(oral.prompt)}</p>` : ''}
      ${written ? `<h4>À l’écrit · ${written.minWords ? `${written.minWords} mots au moins, ` : ''}${written.maxChars ?? 1500} caractères au plus</h4>
        <p class="text">${escape(written.prompt)}</p>` : ''}
      ${checklist?.length ? `<h4>Avant d’envoyer</h4><ul class="check">${checklist.map((item) => `<li>${escape(item)}</li>`).join('')}</ul>` : ''}
    </div>`;
  }

  function lexicon(module) {
    if (!module.vocabulary?.length) return '';
    const sound = media.get(`${module.id}-lexique`);
    const rows = module.vocabulary.map((entry) => `<tr><td lang="de"><strong>${escape([entry.article, entry.word].filter(Boolean).join(' '))}</strong>${entry.plural
      ? `<br><span class="muted">pl. ${escape(entry.plural)}</span>` : ''}</td><td>${escape(entry.translation)}${entry.note
      ? `<br><span class="muted">${escape(entry.note)}</span>` : ''}</td><td lang="de">${escape(entry.example ?? '')}</td></tr>`).join('');
    return `<details class="activity"><summary>Lexique du module <span>${module.vocabulary.length} mots</span></summary>
      ${sound ? support({ media: sound.key, transcriptVisibility: 'hidden', caption: 'Écouter le lexique' }) : ''}
      <table class="lexicon"><thead><tr><th>Mot</th><th>Traduction</th><th>Exemple</th></tr></thead><tbody>${rows}</tbody></table></details>`;
  }

  const modules = level.modules.map((module, index) => `<section id="${escape(module.id)}">
    <h2>${index + 1}. ${escape(module.title)}</h2><p>${escape(module.objective)}</p>
    ${module.activities.map((activity) => `<details class="activity">
      <summary>${escape(activity.title)} <span>${activity.estimatedMinutes} min</span></summary>
      <p class="text">${escape(activity.lesson.description)}</p>
      ${mainSupports(activity.placements, true)}
      ${activity.kind === 'mission' ? mission(activity) : questions(activity.questions, activity.placements)}
      </details>`).join('')}
    ${lexicon(module)}
    </section>`);
  const assessments = level.assessments.map(({ title, description, parts }) => `<section>
    <h2>${escape(title)}</h2><p>${escape(description)}</p>
    ${parts.map((part) => `<details class="activity"><summary>${escape(part.title)}</summary>
      <p class="text">${escape(part.instructions)}</p>
      ${mainSupports(part.placements, false)}
      ${questions(part.questions, part.placements, false)}
      ${part.criteria?.length ? `<h3>Grille</h3><ul>${part.criteria.map(({ label, maxPoints }) =>
        `<li>${escape(label)} · ${maxPoints} pt</li>`).join('')}</ul>` : ''}
      </details>`).join('')}
    </section>`);
  return `<!doctype html>
<html lang="fr">
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>LinguaCap · Allemand ${code} · ${escape(edition)}</title>
<style>
  :root{font-family:system-ui,sans-serif;color:#182536;background:#f2f6f4;line-height:1.6}
  body{width:min(calc(100% - 2rem),52rem);margin:2rem auto 4rem}
  header,section,nav{background:#fff;border:1px solid #d8e3de;border-radius:1rem;padding:1.25rem;margin-block:1rem}
  h1,h2,h3{line-height:1.25;margin:0 0 .6rem}a{color:#175b4c}a:focus-visible,summary:focus-visible{outline:3px solid #287862;outline-offset:3px}
  nav ol{columns:2;column-width:18rem;margin-bottom:0;padding-left:1.5rem}
  li{margin-block:.25rem;break-inside:avoid}.text{white-space:pre-wrap}
  .activity{border-top:1px solid #d8e3de;padding:.75rem 0}.activity[open]{padding-bottom:1.25rem}
  summary{cursor:pointer;font-weight:600}.activity span{font-weight:400;white-space:nowrap;color:#455d54;margin-left:.5rem}
  figure{margin:1rem 0}figcaption{color:#455d54}audio,img{display:block;max-width:100%}img{max-height:20rem;object-fit:contain}
  .blank{display:inline-block;min-width:4em;border-bottom:2px solid #455d54}.tokens span{display:inline-block;border:1px solid #b9cbc3;
    border-radius:.5rem;padding:.1rem .5rem;margin:.15rem}.match{display:flex;gap:2rem;flex-wrap:wrap}.hint,.muted,.why{color:#455d54}
  .mission h4{margin:.75rem 0 .25rem}.check{list-style:"☐ "}.lexicon{width:100%;border-collapse:collapse}
  .lexicon th,.lexicon td{text-align:left;vertical-align:top;padding:.35rem;border-bottom:1px solid #d8e3de}
  @media print{body{width:100%;margin:0}header,section,nav{border:0;padding:.5rem}}
</style>
<header><h1>Allemand ${code} · LinguaCap ${escape(edition)}</h1>
  <p>${level.modules.length} modules · ${Math.floor(minutes / 60)} h ${String(minutes % 60).padStart(2, '0')} d’activités</p>
  <p>Ouvrez une activité pour lire la consigne et écouter les enregistrements. Répondez avant de consulter la transcription ou la correction.</p>
</header>
<nav aria-label="Sommaire"><h2>Sommaire</h2>
  <p><a href="#diagnostic">Point de départ</a> · <a href="#evaluations">Bilan et examen blanc</a></p>
  <ol>${level.modules.map(({ id, title }) => `<li><a href="#${escape(id)}">${escape(title)}</a></li>`).join('')}</ol></nav>
<main>
  <section id="diagnostic"><h2>${escape(level.diagnostic.title)}</h2>
    <p>${escape(level.diagnostic.description)}</p>
    <details><summary>Ouvrir le diagnostic</summary>${questions(level.diagnostic.questions)}</details>
  </section>
  ${modules.join('\n')}
  <div id="evaluations">${assessments.join('\n')}</div>
</main>
<footer><a href="README.md">Guide du parcours et crédits</a></footer>
</html>
`;
}
