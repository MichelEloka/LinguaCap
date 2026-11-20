import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, ClipboardCheck, Mic, Square, Upload as UploadIcon } from 'lucide-react';
import { Badge, EmptyState } from '../../components/ui';
import { requestApi, uploadToStorage } from '../../integration/api';
import './catalogue.css';
import './pilot.css';

type ExamKind = 'midterm' | 'final';
type Mode = 'closed' | 'written' | 'oral';
interface ExamOption { id: string; label: string }
interface ExamQuestion { id: string; prompt: string; options: ExamOption[] }
interface ExamPlacement { assetId: string; assetVersion: number; usage: 'illustration' | 'audio'; alt: string | null; caption: string | null; decorative: boolean; questionId: string | null; optionId: string | null }
interface ExamPart {
  id: string; competence: string; mode: Mode; title: string; instructions: string;
  questions: ExamQuestion[]; criteria: { id: string; label: string; maxPoints: number }[]; placements: ExamPlacement[];
}
interface Score { points: number; max: number; percent: number }
interface ExamView {
  id: string; enrollmentId: string; learnerId: string; kind: ExamKind; number: number; status: 'in_progress' | 'submitted' | 'graded';
  definition: { title: string; description: string; passPercent: number; levelCode: string; parts: ExamPart[] };
  answers: Record<string, Record<string, string>>; texts: Record<string, string>;
  recordings: { partId: string; productionId: string; mimeType: string; url: string | null }[];
  media: Record<string, string>; closedScores: Record<string, Score> | null; dueAt: string | null; startedAt: string;
  submittedAt: string | null; onTime: boolean; canGrade: boolean;
  result: null | {
    scores: Record<string, Score>; percent: number; decision: 'validated' | 'to_consolidate' | 'completed';
    review: { activityId: string; title: string; moduleTitle: string }[] | null; feedback: string | null;
    comments: Record<string, string>; gradedAt: string | null;
  };
}
interface ExamSummary {
  id: string; kind: ExamKind; number: number; status: ExamView['status']; title: string; startedAt: string;
  submittedAt: string | null; dueAt: string | null; gradedAt: string | null; onTime: boolean; percent: number | null;
  decision: 'validated' | 'to_consolidate' | 'completed' | null;
}
interface Reservation { id: string; uploadUrl: string | null; maxBytes: number }
interface QueueItem {
  id: string; learnerId: string; learnerName: string; kind: ExamKind; number: number; levelCode: string | null; title: string;
  submittedAt: string; dueAt: string | null; onTime: boolean;
}

export const examNames: Record<ExamKind, string> = { midterm: 'Bilan intermédiaire', final: 'Examen blanc' };
const competenceNames: Record<string, string> = {
  lecture: 'Lecture', ecoute: 'Écoute', 'expression-ecrite': 'Expression écrite', 'expression-orale': 'Expression orale',
};
const decisions = {
  validated: { label: 'Validé dans LinguaCap', tone: 'green' as const },
  to_consolidate: { label: 'À consolider', tone: 'amber' as const },
  completed: { label: 'Bilan corrigé', tone: 'blue' as const },
};
const dateTime = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });
const RECORDING_TYPES = ['audio/webm', 'audio/ogg', 'audio/mp4', 'audio/mpeg', 'audio/wav'];
const FILE_TYPES: Record<string, string> = {
  'audio/webm': 'audio/webm', 'audio/ogg': 'audio/ogg', 'audio/mp4': 'audio/mp4', 'audio/x-m4a': 'audio/mp4', 'audio/m4a': 'audio/mp4',
  'audio/mpeg': 'audio/mpeg', 'audio/mp3': 'audio/mpeg', 'audio/wav': 'audio/wav', 'audio/x-wav': 'audio/wav', 'audio/wave': 'audio/wav',
};

function getError(error: unknown) {
  return error instanceof Error && error.name !== 'TimeoutError' ? error.message : 'Le service est momentanément indisponible. Réessayez.';
}

function statusBadge(exam: { status: ExamView['status']; decision?: ExamSummary['decision'] }) {
  if (exam.status === 'in_progress') return <Badge tone="blue">En cours</Badge>;
  if (exam.status === 'submitted') return <Badge tone="amber">En attente de correction</Badge>;
  const decision = exam.decision ? decisions[exam.decision] : decisions.completed;
  return <Badge tone={decision.tone}>{decision.label}</Badge>;
}

function Placements({ part, exam, questionId = null }: { part: ExamPart; exam: ExamView; questionId?: string | null }) {
  return (
    <>
      {part.placements.filter((placement) => (placement.questionId ?? null) === questionId && !placement.optionId).map((placement, index) => {
        const url = exam.media[`${placement.assetId}@${placement.assetVersion}`];
        if (!url) return <p key={index} className="muted">Support disponible pendant la tentative.</p>;
        return placement.usage === 'audio'
          ? <audio key={index} controls preload="metadata" src={url} aria-label={placement.caption ?? 'Document sonore'} />
          : <figure key={index} className="pilot-figure"><img className="pilot-lesson-image" src={url} alt={placement.decorative ? '' : placement.alt ?? ''} />
              {placement.caption && <figcaption lang="de">{placement.caption}</figcaption>}</figure>;
      })}
    </>
  );
}

/** Enregistrement oral : micro du navigateur quand il le permet, sinon dépôt d'un fichier ; écoute avant envoi. */
function OralPart({ part, exam, token, onSaved }: { part: ExamPart; exam: ExamView; token: string; onSaved: (exam: ExamView) => void }) {
  const [recorder, setRecorder] = useState<MediaRecorder | null>(null);
  const [clip, setClip] = useState<{ blob: Blob; type: string; url: string } | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState('');
  const chunks = useRef<Blob[]>([]);
  const saved = exam.recordings.find((recording) => recording.partId === part.id);
  const canRecord = typeof window !== 'undefined' && 'MediaRecorder' in window && !!navigator.mediaDevices?.getUserMedia;

  useEffect(() => () => { if (clip) URL.revokeObjectURL(clip.url); }, [clip]);

  async function start() {
    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const type = RECORDING_TYPES.find((candidate) => MediaRecorder.isTypeSupported(candidate)) ?? '';
      const media = new MediaRecorder(stream, type ? { mimeType: type } : undefined);
      chunks.current = [];
      media.ondataavailable = (event) => { if (event.data.size) chunks.current.push(event.data); };
      media.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        const recorded = (media.mimeType || type).split(';')[0];
        const blob = new Blob(chunks.current, { type: recorded });
        setClip({ blob, type: recorded, url: URL.createObjectURL(blob) });
        setRecorder(null);
      };
      media.start();
      setRecorder(media);
    } catch {
      setError('Le micro n’est pas disponible : autorisez-le ou déposez un fichier audio.');
    }
  }

  function choose(file: File | null) {
    setError('');
    if (!file) return;
    const type = FILE_TYPES[file.type];
    if (!type) {
      setError('Formats acceptés : WebM, Ogg, MP4, MP3 ou WAV.');
      return;
    }
    setClip({ blob: file, type, url: URL.createObjectURL(file) });
  }

  async function send() {
    if (!clip) return;
    setError('');
    setProgress(0);
    try {
      const reservation = await requestApi<Reservation>(`/assessments/exams/${encodeURIComponent(exam.id)}/recordings`, token, {
        method: 'POST', body: { partId: part.id, mimeType: clip.type, size: clip.blob.size },
      });
      if (clip.blob.size > reservation.maxBytes) throw new Error('L’enregistrement dépasse 25 Mo.');
      if (reservation.uploadUrl) {
        const file = new File([clip.blob], `oral.${clip.type.split('/')[1]}`, { type: clip.type });
        await uploadToStorage(reservation.uploadUrl, file, clip.type, token, setProgress, new AbortController().signal);
      }
      const updated = await requestApi<ExamView>(
        `/assessments/exams/${encodeURIComponent(exam.id)}/recordings/${encodeURIComponent(reservation.id)}/finalize`, token, { method: 'POST' });
      setClip(null);
      onSaved(updated);
    } catch (failure) {
      setError(`${getError(failure)} Vous pouvez relancer l’envoi.`);
    } finally {
      setProgress(null);
    }
  }

  return (
    <div className="stack">
      {saved?.url && !clip && (
        <div className="stack">
          <p className="inline-message" role="status"><CheckCircle2 size={16} aria-hidden="true" /> Enregistrement envoyé</p>
          <audio controls preload="metadata" src={saved.url} aria-label={`Mon enregistrement · ${part.title}`} />
        </div>
      )}
      {exam.status === 'in_progress' && (
        <>
          <div className="accounts-actions">
            {canRecord && (recorder
              ? <button type="button" className="btn btn-primary" onClick={() => recorder.stop()}><Square size={16} aria-hidden="true" /> Arrêter</button>
              : <button type="button" className="btn btn-outline" onClick={() => void start()}><Mic size={16} aria-hidden="true" /> {saved ? 'Réenregistrer' : 'Enregistrer'}</button>)}
            <label className="btn btn-outline">
              <UploadIcon size={16} aria-hidden="true" /> Déposer un fichier
              <input className="visually-hidden" type="file" accept="audio/*" onChange={(event) => choose(event.currentTarget.files?.[0] ?? null)} />
            </label>
          </div>
          {recorder && <p role="status" className="inline-message">Enregistrement en cours…</p>}
          {clip && (
            <div className="stack">
              <audio controls src={clip.url} aria-label="Écouter avant l’envoi" />
              <button type="button" className="btn btn-primary" disabled={progress !== null} onClick={() => void send()}>
                {progress === null ? 'Envoyer cet enregistrement' : `Envoi : ${progress} %`}</button>
            </div>
          )}
        </>
      )}
      {error && <p className="inline-message warning" role="alert">{error}</p>}
    </div>
  );
}

function ResultPanel({ exam }: { exam: ExamView }) {
  if (!exam.result) return null;
  const decision = decisions[exam.result.decision];
  return (
    <section className="panel stack" aria-labelledby="exam-result">
      <div className="panel-heading"><h2 id="exam-result">Résultat · {exam.result.percent} %</h2><Badge tone={decision.tone}>{decision.label}</Badge></div>
      <ul className="pilot-list">
        {Object.entries(exam.result.scores).map(([competence, score]) => (
          <li key={competence}><span>{competenceNames[competence] ?? competence}</span><strong>{score.points} / {score.max} · {score.percent} %</strong></li>
        ))}
      </ul>
      {exam.result.feedback && <blockquote className="exam-feedback">{exam.result.feedback}</blockquote>}
      {Object.entries(exam.result.comments).filter(([, comment]) => comment).map(([partId, comment]) => (
        <p key={partId}><strong>{exam.definition.parts.find((part) => part.id === partId)?.title ?? partId} :</strong> {comment}</p>
      ))}
      {exam.result.review && exam.result.review.length > 0 && (
        <div className="stack">
          <h3>Activités à revoir</h3>
          <ul>{exam.result.review.map((item) => <li key={item.activityId}>{item.moduleTitle} · {item.title}</li>)}</ul>
        </div>
      )}
      {exam.submittedAt && <p className="muted">Remis le {dateTime.format(new Date(exam.submittedAt))}{exam.onTime ? ' · dans les délais' : ' · après l’échéance'}
        {exam.result.gradedAt ? ` · corrigé le ${dateTime.format(new Date(exam.result.gradedAt))}` : ''}</p>}
    </section>
  );
}

/** Passage du bilan ou de l'examen blanc par l'élève : reprise, sauvegarde, oral, remise et résultats. */
function ExamPage({ token }: { token: string }) {
  const { enrollmentId = '', kind = 'midterm' } = useParams();
  const examKind: ExamKind = kind === 'final' ? 'final' : 'midterm';
  const [history, setHistory] = useState<ExamSummary[] | null>(null);
  const [exam, setExam] = useState<ExamView | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const submitKey = useRef<string | null>(null);
  const saveTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    let active = true;
    requestApi<ExamSummary[]>(`/assessments/exams?enrollmentId=${encodeURIComponent(enrollmentId)}`, token).then(async (list) => {
      if (!active) return;
      const mine = list.filter((item) => item.kind === examKind);
      setHistory(mine);
      if (mine[0]) setExam(await requestApi<ExamView>(`/assessments/exams/${encodeURIComponent(mine[0].id)}`, token));
    }).catch((failure: unknown) => { if (active) setError(getError(failure)); });
    return () => { active = false; };
  }, [enrollmentId, examKind, token, refresh]);

  const persist = useCallback((next: ExamView) => {
    window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => {
      void requestApi<ExamView>(`/assessments/exams/${encodeURIComponent(next.id)}/answers`, token, {
        method: 'PUT', body: { answers: next.answers, texts: next.texts },
      }).catch((failure: unknown) => setError(getError(failure)));
    }, 500);
  }, [token]);

  async function start() {
    setBusy(true);
    setError('');
    try {
      const opened = await requestApi<ExamView>('/assessments/exams', token, { method: 'POST', body: { enrollmentId, kind: examKind } });
      setExam(opened);
      submitKey.current = null;
    } catch (failure) {
      setError(getError(failure));
    } finally {
      setBusy(false);
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!exam || busy) return;
    setBusy(true);
    setError('');
    window.clearTimeout(saveTimer.current);
    submitKey.current ??= crypto.randomUUID();
    try {
      await requestApi(`/assessments/exams/${encodeURIComponent(exam.id)}/answers`, token, { method: 'PUT', body: { answers: exam.answers, texts: exam.texts } });
      setExam(await requestApi<ExamView>(`/assessments/exams/${encodeURIComponent(exam.id)}/submit`, token, {
        method: 'POST', idempotencyKey: submitKey.current,
      }));
      setRefresh((value) => value + 1);
    } catch (failure) {
      setError(getError(failure));
    } finally {
      setBusy(false);
    }
  }

  const update = (next: ExamView) => { setExam(next); persist(next); };
  const latest = history?.[0];
  const canRetry = latest?.status === 'graded' && latest.decision === 'to_consolidate';

  return (
    <div className="stack pilot-session">
      <Link className="text-link" to="/espace"><ArrowLeft size={16} aria-hidden="true" /> Retour à mon espace</Link>
      <section className="panel stack" aria-labelledby="exam-title">
        <div className="panel-heading">
          <h2 id="exam-title"><ClipboardCheck size={20} aria-hidden="true" /> {exam?.definition.title ?? examNames[examKind]}</h2>
          {exam && statusBadge({ status: exam.status, decision: exam.result?.decision ?? null })}
        </div>
        {exam?.definition.description && <p>{exam.definition.description}</p>}
        {exam?.dueAt && <p className="muted">À remettre avant le {dateTime.format(new Date(exam.dueAt))}</p>}
        {history === null && !error && <p role="status">Chargement de l’évaluation…</p>}
        {history !== null && (!exam || canRetry) && (
          <button type="button" className="btn btn-primary" disabled={busy} onClick={() => void start()}>
            {canRetry ? 'Commencer une nouvelle tentative' : `Commencer le ${examNames[examKind].toLowerCase()}`}</button>
        )}
        {exam?.status === 'submitted' && <p className="inline-message" role="status">Tentative remise{exam.onTime ? ' dans les délais' : ''}. Votre résultat sera disponible après la correction de l’écrit et de l’oral.</p>}
        {error && <p className="inline-message warning" role="alert">{error}</p>}
      </section>

      {exam && exam.status === 'graded' && <ResultPanel exam={exam} />}

      {exam && exam.status === 'in_progress' && (
        <form className="stack" onSubmit={submit}>
          {exam.definition.parts.map((part) => (
            <section className="panel stack" key={part.id} aria-labelledby={`part-${part.id}`}>
              <div className="panel-heading"><h2 id={`part-${part.id}`}>{part.title}</h2><Badge tone="blue">{competenceNames[part.competence] ?? part.competence}</Badge></div>
              {part.instructions && <p className="pilot-lesson-text">{part.instructions}</p>}
              <Placements part={part} exam={exam} />
              {part.mode === 'closed' && part.questions.map((question) => (
                <fieldset className="pilot-options" key={question.id}>
                  <legend>{question.prompt}</legend>
                  <Placements part={part} exam={exam} questionId={question.id} />
                  {question.options.map((option) => (
                    <label key={option.id}>
                      <input type="radio" name={`${part.id}-${question.id}`} checked={exam.answers[part.id]?.[question.id] === option.id}
                        onChange={() => update({ ...exam, answers: { ...exam.answers, [part.id]: { ...exam.answers[part.id], [question.id]: option.id } } })} /> {option.label}
                    </label>
                  ))}
                </fieldset>
              ))}
              {part.mode === 'written' && (
                <label>Votre texte<textarea rows={8} maxLength={8000} lang="de" value={exam.texts[part.id] ?? ''}
                  onChange={(event) => update({ ...exam, texts: { ...exam.texts, [part.id]: event.target.value } })} /></label>
              )}
              {part.mode === 'oral' && <OralPart part={part} exam={exam} token={token} onSaved={setExam} />}
            </section>
          ))}
          <div className="editor-actions">
            <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? 'Remise…' : 'Remettre ma tentative'}</button>
            <span className="muted">Vos réponses sont enregistrées au fur et à mesure.</span>
          </div>
        </form>
      )}

      {history && history.some((item) => item.id !== exam?.id) && (
        <section className="panel stack" aria-labelledby="exam-history">
          <h2 id="exam-history">Tentatives précédentes</h2>
          <ul className="pilot-list">
            {history.filter((item) => item.id !== exam?.id).map((item) => (
              <li key={item.id}><span>Tentative {item.number}{item.submittedAt ? ` · remise le ${dateTime.format(new Date(item.submittedAt))}` : ''}</span>
                <span>{item.percent !== null ? `${item.percent} % ` : ''}{statusBadge(item)}</span></li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

/** Correction d'une remise : questions fermées corrigées, écrit et oral notés critère par critère (DEV-069). */
function GradingPage({ token }: { token: string }) {
  const { attemptId = '' } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState<ExamView | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    requestApi<ExamView>(`/assessments/exams/${encodeURIComponent(attemptId)}`, token).then(
      (data) => { if (active) setExam(data); },
      (failure: unknown) => { if (active) setError(getError(failure)); },
    );
    return () => { active = false; };
  }, [attemptId, token]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!exam) return;
    const form = new FormData(event.currentTarget);
    const parts: Record<string, { points: Record<string, number>; comment: string }> = {};
    for (const part of exam.definition.parts.filter((item) => item.mode !== 'closed')) {
      parts[part.id] = {
        points: Object.fromEntries(part.criteria.map((criterion) => [criterion.id, Number(form.get(`${part.id}:${criterion.id}`))])),
        comment: String(form.get(`${part.id}:comment`) ?? ''),
      };
    }
    setBusy(true);
    setError('');
    try {
      setExam(await requestApi<ExamView>(`/assessments/exams/${encodeURIComponent(exam.id)}/grading`, token, {
        method: 'POST', body: { parts, feedback: String(form.get('feedback') ?? '') },
      }));
    } catch (failure) {
      setError(getError(failure));
    } finally {
      setBusy(false);
    }
  }

  if (!exam) return <section className="panel stack">{error ? <p className="inline-message warning" role="alert">{error}</p> : <p role="status">Chargement de la remise…</p>}</section>;
  return (
    <div className="stack pilot-session">
      <button type="button" className="text-link" onClick={() => navigate('/espace/corrections')}><ArrowLeft size={16} aria-hidden="true" /> Retour aux corrections</button>
      <section className="panel stack" aria-labelledby="grading-title">
        <div className="panel-heading"><h2 id="grading-title">{exam.definition.title} · tentative {exam.number}</h2>{statusBadge({ status: exam.status, decision: exam.result?.decision ?? null })}</div>
        {exam.submittedAt && <p className="muted">Remise le {dateTime.format(new Date(exam.submittedAt))}{exam.onTime ? ' · dans les délais' : ' · après l’échéance'}</p>}
      </section>
      {exam.status === 'graded' && <ResultPanel exam={exam} />}
      <form className="stack" onSubmit={submit}>
        <fieldset className="editor-body" disabled={!exam.canGrade || busy}>
          {exam.definition.parts.map((part) => (
            <section className="panel stack" key={part.id} aria-labelledby={`grade-${part.id}`}>
              <div className="panel-heading"><h2 id={`grade-${part.id}`}>{part.title}</h2><Badge tone="blue">{competenceNames[part.competence] ?? part.competence}</Badge></div>
              {part.instructions && <p className="muted pilot-lesson-text">{part.instructions}</p>}
              {part.mode === 'closed' && exam.closedScores?.[part.id] && (
                <p>Questions fermées corrigées automatiquement : <strong>{exam.closedScores[part.id].points} / {exam.closedScores[part.id].max}</strong></p>
              )}
              {part.mode === 'written' && <blockquote className="exam-production" lang="de">{exam.texts[part.id] || 'Aucun texte remis.'}</blockquote>}
              {part.mode === 'oral' && (() => {
                const recording = exam.recordings.find((item) => item.partId === part.id);
                return recording?.url
                  ? <audio controls preload="metadata" src={recording.url} aria-label={`Production orale · ${part.title}`} />
                  : <p className="inline-message warning">L’enregistrement n’est pas disponible pour le moment.</p>;
              })()}
              {part.mode !== 'closed' && exam.status === 'submitted' && (
                <div className="stack">
                  {part.criteria.map((criterion) => (
                    <label key={criterion.id} className="exam-criterion">{criterion.label} (sur {criterion.maxPoints})
                      <input name={`${part.id}:${criterion.id}`} type="number" min={0} max={criterion.maxPoints} required inputMode="numeric" />
                    </label>
                  ))}
                  <label>Commentaire<textarea name={`${part.id}:comment`} rows={3} maxLength={2000} /></label>
                </div>
              )}
            </section>
          ))}
          {exam.status === 'submitted' && (
            <section className="panel stack">
              <label>Appréciation générale et points à travailler<textarea name="feedback" rows={4} maxLength={4000} /></label>
              {error && <p className="inline-message warning" role="alert">{error}</p>}
              <button type="submit" className="btn btn-primary">{busy ? 'Enregistrement…' : 'Enregistrer la correction'}</button>
            </section>
          )}
        </fieldset>
      </form>
    </div>
  );
}

function GradingQueue({ token }: { token: string }) {
  const [queue, setQueue] = useState<QueueItem[] | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    requestApi<QueueItem[]>('/assessments/grading', token).then(
      (data) => { if (active) setQueue(data); },
      (failure: unknown) => { if (active) setError(getError(failure)); },
    );
    return () => { active = false; };
  }, [token]);

  return (
    <section className="panel stack" aria-label="Copies à corriger">
      {error ? <p className="inline-message warning" role="alert">{error}</p>
        : queue === null ? <p role="status">Chargement des corrections…</p>
        : queue.length === 0 ? <EmptyState title="Aucune correction en attente" />
        : (
          <ul className="media-list">
            {queue.map((item) => (
              <li key={item.id}>
                <div className="media-main">
                  <strong>{item.learnerName}</strong>
                  <span className="muted">{item.levelCode ? `${item.levelCode} · ` : ''}{item.title} · tentative {item.number}</span>
                  <span className="muted">Remise le {dateTime.format(new Date(item.submittedAt))}</span>
                </div>
                {item.onTime ? <Badge tone="green">Dans les délais</Badge> : <Badge tone="amber">Après l’échéance</Badge>}
                <Link className="btn btn-primary" to={`/espace/corrections/${item.id}`} aria-label={`Corriger ${item.title} de ${item.learnerName}`}>Corriger</Link>
              </li>
            ))}
          </ul>
        )}
    </section>
  );
}

export function GradingPanel({ token }: { token: string }) {
  return (
    <Routes>
      <Route index element={<GradingQueue token={token} />} />
      <Route path=":attemptId" element={<GradingPage token={token} />} />
    </Routes>
  );
}

export { ExamPage };
