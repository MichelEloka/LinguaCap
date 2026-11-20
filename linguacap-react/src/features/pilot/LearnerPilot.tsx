import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { BookOpen, CalendarDays, ChartNoAxesCombined, MessageSquare, Volume2 } from 'lucide-react';
import { Badge, EmptyState } from '../../components/ui';
import { requestApi } from '../../integration/api';
import './pilot.css';

interface Level { id: string; code: string; title: string; status: string }
interface Goal {
  level: string;
  pace: 'standard' | 'intensive';
  startDate: string;
  targetDate: string;
  studyDays: number[];
  sessionsPerDay: number;
  minutesPerSession: number;
}
interface Grade { id: string; lessonId: string; correct: number; total: number; submittedAt: string }
interface Message { id: string; text: string; sentAt: string }
interface Lesson {
  id: string;
  title: string;
  level: string;
  description: string;
  transcript: string;
  mediaIds: string[];
  questions: { id: string; prompt: string; options: { id: string; text: string }[] }[];
}
interface CourseMedia { id: string; kind: 'image' | 'audio'; title: string; url: string }

const weekdays = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
const dateDisplay = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' });

function errorText(error: unknown) {
  return error instanceof Error && error.name !== 'TimeoutError'
    ? error.message : 'Le service est momentanément indisponible. Réessayez.';
}

function GoalEditor({ goal, levels, token, saved }: {
  goal: Goal | null; levels: Level[]; token: string; saved: (goal: Goal) => void;
}) {
  const [schedule, setSchedule] = useState<Goal>(goal ?? {
    level: levels[0]?.code ?? '', pace: 'standard', startDate: '', targetDate: '',
    studyDays: [1, 2, 3, 4, 5], sessionsPerDay: 1, minutesPerSession: 25,
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const update = <Key extends keyof Goal>(key: Key, value: Goal[Key]) =>
    setSchedule((current) => ({ ...current, [key]: value }));

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setNotice('');
    setBusy(true);
    // Send the editable fields only. The server owns audit timestamps.
    const { level, pace, startDate, targetDate, studyDays, sessionsPerDay, minutesPerSession } = schedule;
    try {
      const result = await requestApi<Goal>('/learning/goal', token, {
        method: 'PUT', body: { level, pace, startDate, targetDate, studyDays, sessionsPerDay, minutesPerSession },
      });
      setSchedule(result);
      saved(result);
      setNotice('Votre objectif a été enregistré.');
    } catch (failure) {
      setError(errorText(failure));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="panel stack" aria-labelledby="pilot-goal">
      <div className="panel-heading"><h2 id="pilot-goal">Mon objectif</h2><CalendarDays aria-hidden="true" /></div>
      <form className="stack" onSubmit={submit}>
        <div className="pilot-form-grid">
          <label className="field">Niveau visé<select required value={schedule.level} onChange={(event) => update('level', event.target.value)}>
            {levels.map((level) => <option key={level.id} value={level.code}>{level.code} · {level.title}</option>)}
          </select></label>
          <label className="field">Rythme<select value={schedule.pace} onChange={(event) => update('pace', event.target.value === 'intensive' ? 'intensive' : 'standard')}>
            <option value="standard">Standard</option><option value="intensive">Intensif</option>
          </select></label>
          <label className="field">Début<input required type="date" value={schedule.startDate} onChange={(event) => update('startDate', event.target.value)} /></label>
          <label className="field">Date cible<input required type="date" min={schedule.startDate || undefined} value={schedule.targetDate} onChange={(event) => update('targetDate', event.target.value)} /></label>
          <label className="field">Séances par jour<input required type="number" min={1} max={6} value={schedule.sessionsPerDay} onChange={(event) => update('sessionsPerDay', Number(event.target.value))} /></label>
          <label className="field">Minutes par séance<input required type="number" min={10} max={180} value={schedule.minutesPerSession} onChange={(event) => update('minutesPerSession', Number(event.target.value))} /></label>
        </div>
        <fieldset className="pilot-options">
          <legend>Jours d’étude</legend>
          {weekdays.map((name, index) => {
            const day = index + 1;
            return <label key={name}><input type="checkbox" checked={schedule.studyDays.includes(day)}
              onChange={(event) => update('studyDays', event.target.checked
                ? [...schedule.studyDays, day].sort((left, right) => left - right)
                : schedule.studyDays.filter((value) => value !== day))} /> {name}</label>;
          })}
        </fieldset>
        {error && <p className="inline-message warning" role="alert">{error}</p>}
        {notice && <p className="inline-message" role="status">{notice}</p>}
        <button className="btn btn-primary" type="submit" disabled={busy || !schedule.studyDays.length || !levels.length}>
          {busy ? 'Enregistrement…' : 'Enregistrer mon objectif'}
        </button>
      </form>
    </section>
  );
}

function Course({ token, onGrade }: { token: string; onGrade: (grade: Grade) => void }) {
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [media, setMedia] = useState<CourseMedia[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [grade, setGrade] = useState<Grade | null>(null);
  const [loadError, setLoadError] = useState('');
  const [mediaError, setMediaError] = useState('');
  const [answerError, setAnswerError] = useState('');
  const [busy, setBusy] = useState(false);
  const [retry, setRetry] = useState(0);
  const key = useRef<string | null>(null);

  useEffect(() => {
    let active = true;
    const fetchLesson = async () => {
      try {
        const content = await requestApi<Lesson>('/lessons/commander-au-cafe', token);
        if (!active) return;
        setLesson(content);
        try {
          const files = await Promise.all(content.mediaIds.map((id) => requestApi<CourseMedia>(`/media/${encodeURIComponent(id)}`, token)));
          if (active) setMedia(files);
        } catch (failure) {
          if (active) setMediaError(errorText(failure));
        }
      } catch (failure) {
        if (active) setLoadError(errorText(failure));
      }
    };
    void fetchLesson();
    return () => { active = false; };
  }, [token, retry]);

  function reload() {
    setLoadError('');
    setMediaError('');
    setRetry((value) => value + 1);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!lesson || busy) return;
    setBusy(true);
    setAnswerError('');
    key.current ??= crypto.randomUUID();
    try {
      const result = await requestApi<Grade>('/assessments/quiz', token, {
        method: 'POST', body: { lessonId: lesson.id, answers }, idempotencyKey: key.current,
      });
      key.current = null;
      setGrade(result);
      onGrade(result);
    } catch (failure) {
      setAnswerError(errorText(failure));
    } finally {
      setBusy(false);
    }
  }

  if (!lesson) {
    return <section className="panel stack"><h2>Leçon d’allemand</h2>{loadError
      ? <><p className="inline-message warning" role="alert">{loadError}</p><button className="btn btn-outline" type="button" onClick={reload}>Réessayer</button></>
      : <p role="status">Chargement de la leçon…</p>}</section>;
  }
  return (
    <section className="panel stack" aria-labelledby="pilot-lesson">
      <div className="panel-heading"><h2 id="pilot-lesson"><BookOpen size={20} aria-hidden="true" /> {lesson.title}</h2><Badge tone="blue">{lesson.level}</Badge></div>
      <p>{lesson.description}</p>
      {media.map((file) => file.kind === 'image'
        ? <img className="pilot-lesson-image" key={file.id} src={file.url} alt={file.title} onError={() => setMediaError('Le lien de l’image a expiré ou le fichier est indisponible.')} />
        : <div className="stack" key={file.id}><strong><Volume2 size={17} aria-hidden="true" /> {file.title}</strong>
          <audio controls preload="metadata" src={file.url} aria-label={file.title} onError={() => setMediaError('Le lien audio a expiré ou le fichier est indisponible.')} /></div>)}
      {mediaError && <div className="stack"><p className="inline-message warning" role="alert">{mediaError}</p><button className="btn btn-outline" type="button" onClick={reload}>Recharger les médias</button></div>}
      <details><summary>Lire la transcription</summary><p className="pilot-transcript" lang="de">{lesson.transcript}</p></details>
      <form className="stack" onSubmit={submit}>
        <h3>Exercice</h3>
        {lesson.questions.map((question) => <fieldset className="pilot-options" key={question.id}>
          <legend>{question.prompt}</legend>
          {question.options.map((option) => <label key={option.id}><input type="radio" required name={question.id} value={option.id}
            checked={answers[question.id] === option.id} onChange={() => { key.current = null; setAnswers({ ...answers, [question.id]: option.id }); }} /> {option.text}</label>)}
        </fieldset>)}
        {answerError && <p className="inline-message warning" role="alert">{answerError}</p>}
        {grade && <p className="inline-message" role="status">Résultat enregistré · {grade.correct} / {grade.total}</p>}
        <button className="btn btn-primary" type="submit" disabled={busy || !lesson.questions.length}>{busy ? 'Correction…' : 'Valider mes réponses'}</button>
      </form>
    </section>
  );
}

interface LearnerData { goal: Goal | null; levels: Level[]; results: Grade[]; messages: Message[] }

export function LearnerPilot({ token }: { token: string }) {
  const [data, setData] = useState<LearnerData | null>(null);
  const [failure, setFailure] = useState('');
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let active = true;
    Promise.all([
      requestApi<Goal | null>('/learning/goal', token), requestApi<Level[]>('/levels', token),
      requestApi<Grade[]>('/assessments/results', token), requestApi<Message[]>('/tracking/messages', token),
    ]).then(([goal, levels, results, messages]) => {
      if (active) setData({ goal, levels, results, messages });
    }).catch((error: unknown) => { if (active) setFailure(errorText(error)); });
    return () => { active = false; };
  }, [token, retry]);

  if (!data) return <section className="panel stack">{failure
    ? <><p className="inline-message warning" role="alert">{failure}</p><button className="btn btn-outline" type="button" onClick={() => { setFailure(''); setRetry((value) => value + 1); }}>Réessayer</button></>
    : <p role="status">Chargement de votre parcours…</p>}</section>;

  return (
    <div className="pilot-grid">
      <Course token={token} onGrade={(grade) => setData((current) => current && ({
        ...current, results: [grade, ...current.results.filter((item) => item.id !== grade.id)],
      }))} />
      <div className="stack">
        <GoalEditor goal={data.goal} levels={data.levels} token={token}
          saved={(goal) => setData((current) => current && ({ ...current, goal }))} />
        <section className="panel stack" aria-labelledby="pilot-results">
          <div className="panel-heading"><h2 id="pilot-results">Mes résultats</h2><ChartNoAxesCombined aria-hidden="true" /></div>
          {data.results.length === 0 ? <EmptyState title="Aucun résultat enregistré" description="Validez l’exercice pour retrouver votre score ici." />
            : <ul className="pilot-list">{data.results.map((item) => <li key={item.id}><time dateTime={item.submittedAt}>{dateDisplay.format(new Date(item.submittedAt))}</time><strong>{item.correct} / {item.total}</strong></li>)}</ul>}
        </section>
        <section className="panel stack" aria-labelledby="pilot-messages">
          <div className="panel-heading"><h2 id="pilot-messages">Mes messages</h2><MessageSquare aria-hidden="true" /></div>
          {data.messages.length === 0 ? <EmptyState title="Aucun message pour le moment" />
            : <ul className="pilot-list">{data.messages.map((message) => <li key={message.id}><p>{message.text}</p><time dateTime={message.sentAt}>{dateDisplay.format(new Date(message.sentAt))}</time></li>)}</ul>}
        </section>
      </div>
    </div>
  );
}
