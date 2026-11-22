import { allMedia, transcriptOf } from './content-lib.mjs';

function escape(value = '') {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[char]);
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

  function questions(list, placements = [], showTranscript = true) {
    if (!list?.length) return '';
    const prompts = list.map((question) => `<li><p class="text">${escape(question.prompt)}</p>
      ${placements.filter((item) => item.questionId === question.id && !item.optionId).map((item) => support(item, showTranscript)).join('')}
      <ol type="a">${question.options.map((option) => `<li>${escape(option.label)}
        ${placements.filter((item) => item.questionId === question.id && item.optionId === option.id)
          .map((item) => support(item, showTranscript)).join('')}</li>`).join('')}</ol></li>`);
    const answers = list.map((question) => `<li>${escape(question.options.find(({ correct }) => correct)?.label)}</li>`);
    return `<ol class="questions">${prompts.join('')}</ol><details><summary>Voir les réponses</summary><ol>${answers.join('')}</ol></details>`;
  }

  const modules = level.modules.map((module, index) => `<section id="${escape(module.id)}">
    <h2>${index + 1}. ${escape(module.title)}</h2><p>${escape(module.objective)}</p>
    ${module.activities.map((activity) => `<details class="activity">
      <summary>${escape(activity.title)} <span>${activity.estimatedMinutes} min</span></summary>
      <p class="text">${escape(activity.lesson.description)}</p>
      ${mainSupports(activity.placements, true)}
      ${questions(activity.questions, activity.placements)}
      </details>`).join('')}
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
