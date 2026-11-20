import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { Award, BookOpen, CalendarDays, ClipboardCheck, CloudUpload, Mic, Square } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { Badge, EmptyState, PageHeading } from '../../components/ui';
import { useDemo } from '../../demo/context';
import { learnerId, lessons, relativeDate } from '../../demo/data';
import type { Assessment } from '../../domain/types';
import { formatDate } from './learnerPlanning';

function AssessmentStatus({ assessment }: { assessment: Assessment }) {
  if (assessment.status === 'reviewed') return <Badge tone="green">Corrigée</Badge>;
  if (assessment.status === 'submitted') return <Badge tone="amber">À corriger</Badge>;
  return <Badge tone="blue">À passer</Badge>;
}

export function AssessmentList() {
  const { state } = useDemo();
  const assessments = state.assessments.filter(assessment => assessment.learnerId === learnerId)
    .sort((first, second) => first.dueDate.localeCompare(second.dueDate));

  return (
    <div className="lc-learner-layout">
      <PageHeading title="Mes évaluations" description="Retrouvez votre diagnostic, vos bilans et vos examens blancs." />
      {assessments.length === 0 ? <EmptyState title="Aucune évaluation prévue" description="Les évaluations de votre parcours seront affichées ici." /> : (
        <div className="lc-learner-cards">
          {assessments.map(assessment => (
            <article className="panel lc-assessment-card" key={assessment.id}>
              <div className="lc-section-head"><span className="lc-tile-icon"><ClipboardCheck size={22} /></span><AssessmentStatus assessment={assessment} /></div>
              <h2>{assessment.title}</h2>
              <p className="muted">{assessment.type} · Allemand {assessment.level}</p>
              <div className="lc-assessment-date"><CalendarDays size={17} /><time dateTime={assessment.dueDate}>{formatDate(assessment.dueDate)}</time></div>
              <Link className={assessment.status === 'ready' ? 'btn btn-primary' : 'btn btn-outline'} to={`/eleve/evaluations/${assessment.id}`}>
                {assessment.status === 'ready' ? 'Commencer' : assessment.status === 'submitted' ? 'Voir ma remise' : 'Voir mon résultat'}
              </Link>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

const maxAudioBytes = 750 * 1024;
type OralAnswer = { name: string; src: string };

function OralField({ value, onChange, onBusyChange }: {
  value: OralAnswer | null;
  onChange: (answer: OralAnswer | null) => void;
  onBusyChange: (busy: boolean) => void;
}) {
  const recorder = useRef<MediaRecorder | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const recordingTimer = useRef<number | undefined>(undefined);
  const active = useRef(false);
  const readGeneration = useRef(0);
  const [recording, setRecording] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [reading, setReading] = useState(false);
  const [error, setError] = useState('');
  const canRecord = typeof MediaRecorder !== 'undefined' && !!navigator.mediaDevices?.getUserMedia;
  const busy = recording || requesting || reading;

  useEffect(() => onBusyChange(busy), [busy, onBusyChange]);

  useEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
      window.clearTimeout(recordingTimer.current);
      if (recorder.current && recorder.current.state !== 'inactive') {
        recorder.current.onstop = null;
        recorder.current.stop();
      }
      stream.current?.getTracks().forEach(track => track.stop());
    };
  }, []);

  function readAudio(blob: Blob, name: string) {
    const generation = ++readGeneration.current;
    if (!blob.size || blob.size > maxAudioBytes) {
      setError('Choisissez un audio de moins de 750 Ko pour cette démonstration.');
      setReading(false);
      return;
    }
    const reader = new FileReader();
    setReading(true);
    setError('');
    reader.onload = () => {
      if (!active.current || generation !== readGeneration.current || typeof reader.result !== 'string') return;
      onChange({ name, src: reader.result });
      setReading(false);
    };
    reader.onerror = () => {
      if (!active.current || generation !== readGeneration.current) return;
      setReading(false);
      setError('Le fichier n’a pas pu être lu. Réessayez.');
    };
    reader.readAsDataURL(blob);
  }

  function stopRecording() {
    if (recorder.current?.state === 'recording') recorder.current.stop();
  }

  async function startRecording() {
    if (requesting || recording) return;
    setError('');
    setRequesting(true);
    try {
      const microphone = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (!active.current) {
        microphone.getTracks().forEach(track => track.stop());
        return;
      }
      stream.current = microphone;
      const media = new MediaRecorder(microphone, { audioBitsPerSecond: 32000 });
      recorder.current = media;
      const chunks: Blob[] = [];
      media.ondataavailable = event => {
        if (event.data.size) chunks.push(event.data);
      };
      media.onstop = () => {
        window.clearTimeout(recordingTimer.current);
        microphone.getTracks().forEach(track => track.stop());
        stream.current = null;
        if (!active.current) return;
        setRecording(false);
        const type = media.mimeType || chunks[0]?.type || 'audio/webm';
        readAudio(new Blob(chunks, { type }), 'Mon enregistrement');
      };
      media.onerror = () => {
        microphone.getTracks().forEach(track => track.stop());
        window.clearTimeout(recordingTimer.current);
        if (active.current) {
          setRecording(false);
          setError('L’enregistrement a échoué. Vous pouvez joindre un fichier audio.');
        }
      };
      media.start();
      setRecording(true);
      recordingTimer.current = window.setTimeout(stopRecording, 42000);
    } catch {
      stream.current?.getTracks().forEach(track => track.stop());
      if (active.current) setError('Le microphone est indisponible. Vous pouvez joindre un fichier audio.');
    } finally {
      if (active.current) setRequesting(false);
    }
  }

  return (
    <div className="lc-oral-field" aria-busy={reading || requesting}>
      <div className="lc-form-actions lc-oral-actions">
        {canRecord && (
          <button type="button" className="btn btn-outline" onClick={recording ? stopRecording : startRecording} disabled={requesting || reading}>
            {recording ? <><Square size={16} /> Arrêter</> : <><Mic size={16} /> {requesting ? 'Ouverture du micro…' : 'Enregistrer'}</>}
          </button>
        )}
        <label className="lc-file-label">
          <span><CloudUpload size={18} /> Joindre un audio</span>
          <input type="file" accept="audio/*,.wav,.mp3,.m4a,.ogg,.webm" disabled={busy} onChange={event => {
            const file = event.currentTarget.files?.[0];
            event.currentTarget.value = '';
            if (!file) return;
            if (!file.type.startsWith('audio/') && !/\.(wav|mp3|m4a|ogg|webm)$/i.test(file.name)) {
              setError('Choisissez un fichier audio.');
              return;
            }
            readAudio(file, file.name);
          }} />
        </label>
      </div>
      {recording && <span className="lc-recording" role="status">Enregistrement en cours · 42 secondes maximum</span>}
      {error && <p className="lc-form-error" role="alert">{error}</p>}
      {value && (
        <div className="lc-audio-card">
          <strong>{value.name}</strong>
          <audio controls src={value.src} aria-label="Écouter ma réponse" />
          <button type="button" className="lc-panel-link" onClick={() => onChange(null)} disabled={recording || reading}>Retirer l’audio</button>
        </div>
      )}
      <p className="muted lc-form-caption">750 Ko maximum. Votre réponse de démonstration est enregistrée dans ce navigateur.</p>
    </div>
  );
}

function DiagnosticForm({ assessment }: { assessment: Assessment }) {
  const { update, notify } = useDemo();
  const [answer, setAnswer] = useState('');
  const options = ['Bonne nuit', 'Bonjour', 'À bientôt'];

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!answer) return;
    const correct = answer === 'Bonjour';
    update(current => ({
      ...current,
      assessments: current.assessments.map(item => item.id === assessment.id
        ? { ...item, status: 'reviewed', score: correct ? 100 : 0, feedback: '« Guten Tag » veut dire « bonjour ». Retrouvez les formules de salutations dans votre première séance.' }
        : item),
    }));
    notify('Votre résultat de diagnostic est disponible.');
  }

  return (
    <form className="panel lc-quiz-panel" onSubmit={submit}>
      <fieldset>
        <legend>Que signifie « Guten Tag » ?</legend>
        <div className="lc-quiz-options">
          {options.map(option => <label className="lc-quiz-option" key={option}><input name="diagnostic" type="radio" value={option} checked={answer === option} onChange={() => setAnswer(option)} /><span>{option}</span></label>)}
        </div>
      </fieldset>
      <button type="submit" className="btn btn-primary" disabled={!answer}>Valider le diagnostic</button>
    </form>
  );
}

function ProductionForm({ assessment }: { assessment: Assessment }) {
  const { update, notify } = useDemo();
  const [writing, setWriting] = useState('');
  const [oral, setOral] = useState<OralAnswer | null>(null);
  const [oralBusy, setOralBusy] = useState(false);
  const [error, setError] = useState('');
  const exam = assessment.type === 'Examen blanc';

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    if (oralBusy) return;
    if (!writing.trim() || (exam && !oral)) {
      setError(exam && !oral ? 'Ajoutez votre réponse orale avant de remettre l’examen.' : 'Renseignez votre réponse écrite.');
      return;
    }
    update(current => ({
      ...current,
      assessments: current.assessments.map(item => item.id === assessment.id && item.status === 'ready'
        ? { ...item, status: 'submitted', writing: writing.trim(), audioName: oral?.name, audioSrc: oral?.src }
        : item),
      students: current.students.map(student => student.id === learnerId ? { ...student, status: 'review', lastActivity: relativeDate(0) } : student),
    }));
    notify('Évaluation remise. Elle est disponible pour correction dans l’espace professeur.');
  }

  return (
    <form className="lc-learner-layout" onSubmit={submit}>
      <section className="panel lc-lesson-content">
        <h2>Expression écrite</h2>
        <label className="lc-form-label">
          {assessment.level === 'A1'
            ? 'Présentez-vous en allemand en trois phrases. Indiquez votre prénom, votre ville et ce que vous aimez.'
            : 'Écrivez un court message à un ami. Proposez une sortie, donnez un lieu et un horaire, puis posez une question.'}
          <textarea value={writing} onChange={event => setWriting(event.target.value)} required maxLength={1500} rows={6} placeholder="Votre réponse en allemand…" lang="de" />
        </label>
        <small className="muted">{writing.length} / 1 500 caractères</small>
      </section>
      <section className="panel lc-lesson-content">
        <h2>Expression orale {exam ? '' : '(facultative)'}</h2>
        <p>{assessment.level === 'A1' ? 'Saluez votre interlocuteur, dites votre nom et posez-lui une question simple.' : 'Racontez brièvement votre dernière sortie et dites ce que vous aimeriez faire la prochaine fois.'}</p>
        <OralField value={oral} onChange={setOral} onBusyChange={setOralBusy} />
      </section>
      {error && <p className="lc-form-error" role="alert">{error}</p>}
      <div><button type="submit" className="btn btn-primary" disabled={oralBusy}>Remettre mon évaluation</button></div>
    </form>
  );
}

function AssessmentReport({ assessment }: { assessment: Assessment }) {
  return (
    <div className="lc-learner-layout">
      <section className="panel lc-lesson-content">
        <div className="lc-section-head"><h2>{assessment.status === 'reviewed' ? 'Votre résultat' : 'Remise reçue'}</h2><AssessmentStatus assessment={assessment} /></div>
        {assessment.status === 'reviewed' ? (
          <><p className="lc-assessment-score">{typeof assessment.score === 'number' ? `${assessment.score} %` : 'Évaluation corrigée'}</p>{assessment.feedback && <p>{assessment.feedback}</p>}</>
        ) : <p>Votre production est disponible pour le professeur dans la file de correction.</p>}
        <Link className="lc-panel-link" to="/eleve/resultats">Voir tous mes résultats</Link>
      </section>
      {(assessment.writing || assessment.audioSrc) && (
        <section className="panel lc-lesson-content">
          <h2>Ma production</h2>
          {assessment.writing && <p className="lc-written-answer" lang="de">{assessment.writing}</p>}
          {assessment.audioSrc && <div className="lc-audio-card"><strong>{assessment.audioName ?? 'Mon enregistrement'}</strong><audio controls src={assessment.audioSrc} aria-label="Écouter ma production" /></div>}
        </section>
      )}
    </div>
  );
}

export function AssessmentDetail() {
  const { id } = useParams();
  const { state } = useDemo();
  const assessment = state.assessments.find(item => item.id === id && item.learnerId === learnerId);
  if (!assessment) return <EmptyState title="Évaluation introuvable" action={<Link to="/eleve/evaluations" className="btn btn-outline">Retour aux évaluations</Link>} />;

  return (
    <div className="lc-learner-layout">
      <Link to="/eleve/evaluations" className="lc-back-link">Retour aux évaluations</Link>
      <PageHeading title={assessment.title} description={`Allemand ${assessment.level} · ${formatDate(assessment.dueDate)}`} action={<AssessmentStatus assessment={assessment} />} />
      {assessment.status === 'ready'
        ? assessment.type === 'Diagnostic' ? <DiagnosticForm key={assessment.id} assessment={assessment} /> : <ProductionForm key={assessment.id} assessment={assessment} />
        : <AssessmentReport assessment={assessment} />}
    </div>
  );
}

export function Results() {
  const { state } = useDemo();
  const assessments = state.assessments.filter(assessment => assessment.learnerId === learnerId && assessment.status !== 'ready');
  const sessions = state.sessions.filter(session => session.completed && typeof session.score === 'number');
  return (
    <div className="lc-learner-layout">
      <PageHeading title="Mes résultats" description="Consultez les corrections et les scores enregistrés pour votre parcours." />
      <div className="lc-learner-columns">
        <section className="panel lc-lesson-content">
          <div className="lc-section-head"><h2>Évaluations</h2><span className="lc-tile-icon"><Award size={22} /></span></div>
          {assessments.length === 0 ? <p className="muted">Aucune évaluation remise pour le moment.</p> : assessments.map(assessment => (
            <article className="lc-result-row" key={assessment.id}>
              <div><Link className="lc-panel-link" to={`/eleve/evaluations/${assessment.id}`}>{assessment.title}</Link><p>{assessment.feedback ?? (assessment.status === 'submitted' ? 'Votre retour sera disponible après la correction.' : 'Consultez le détail du résultat.')}</p></div>
              {typeof assessment.score === 'number' ? <strong>{assessment.score} %</strong> : <AssessmentStatus assessment={assessment} />}
            </article>
          ))}
        </section>
        <section className="panel lc-lesson-content">
          <div className="lc-section-head"><h2>Exercices</h2><span className="lc-tile-icon"><BookOpen size={21} /></span></div>
          {sessions.length === 0 ? <p className="muted">Les scores des exercices terminés apparaîtront ici.</p> : sessions.map(session => (
            <article className="lc-result-row" key={session.id}>
              <Link className="lc-panel-link" to={`/eleve/seances/${session.id}`}>{lessons.find(lesson => lesson.id === session.lessonId)?.title ?? 'Séance terminée'}</Link>
              <strong>{session.score} %</strong>
            </article>
          ))}
        </section>
      </div>
    </div>
  );
}
