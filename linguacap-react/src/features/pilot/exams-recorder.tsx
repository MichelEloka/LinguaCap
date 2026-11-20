/**
 * Enregistrement oral d'une évaluation : micro du navigateur (bouton animé, durée, niveau sonore), réécoute avant
 * l'envoi, dépôt d'un fichier audio en alternative (bouton ou glisser-déposer) et envoi avec progression.
 */
import { useEffect, useRef, useState, type DragEvent } from 'react';
import { CheckCircle2, FileAudio, Mic, Send, Square, Trash2, Upload as UploadIcon } from 'lucide-react';
import { ProgressBar } from '../../components/ui';
import { AudioPlayer, useToast } from '../../design/kit';
import { requestApi, uploadToStorage } from '../../integration/api';
import { getError, type ExamPart, type ExamView, type Reservation } from './exams-shared';

const RECORDING_TYPES = ['audio/webm', 'audio/ogg', 'audio/mp4', 'audio/mpeg', 'audio/wav'];
const FILE_TYPES: Record<string, string> = {
  'audio/webm': 'audio/webm', 'audio/ogg': 'audio/ogg', 'audio/mp4': 'audio/mp4', 'audio/x-m4a': 'audio/mp4', 'audio/m4a': 'audio/mp4',
  'audio/mpeg': 'audio/mpeg', 'audio/mp3': 'audio/mpeg', 'audio/wav': 'audio/wav', 'audio/x-wav': 'audio/wav', 'audio/wave': 'audio/wav',
};
const clock = (seconds: number) => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;
const LEVEL_BARS = 18;

interface Clip { blob: Blob; type: string; url: string; name: string | null; seconds: number | null }

export function OralRecorder({ part, exam, token, onSaved }: { part: ExamPart; exam: ExamView; token: string; onSaved: (exam: ExamView) => void }) {
  const toast = useToast();
  const [recorder, setRecorder] = useState<MediaRecorder | null>(null);
  const [clip, setClip] = useState<Clip | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState('');
  const chunks = useRef<Blob[]>([]);
  const startedAt = useRef(0);
  const timer = useRef<number | undefined>(undefined);
  const meter = useRef<HTMLDivElement>(null);
  const audio = useRef<{ context: AudioContext; frame: number } | null>(null);
  const active = useRef<MediaRecorder | null>(null);
  const saved = exam.recordings.find((recording) => recording.partId === part.id);
  const canRecord = typeof window !== 'undefined' && 'MediaRecorder' in window && !!navigator.mediaDevices?.getUserMedia;
  const editable = exam.status === 'in_progress';

  useEffect(() => () => { if (clip) URL.revokeObjectURL(clip.url); }, [clip]);
  // À la fermeture de l'écran : arrêter le micro, la mesure du niveau et le chronomètre.
  useEffect(() => () => {
    window.clearInterval(timer.current);
    stopMeter();
    if (active.current?.state === 'recording') active.current.stop();
  }, []);

  function stopMeter() {
    if (!audio.current) return;
    cancelAnimationFrame(audio.current.frame);
    void audio.current.context.close();
    audio.current = null;
  }

  /** Niveau du micro en direct : les barres suivent la voix (variable CSS, sans rendu React à chaque image). */
  function listen(stream: MediaStream) {
    const Context = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Context || !meter.current) return;
    const context = new Context();
    const analyser = context.createAnalyser();
    analyser.fftSize = 256;
    context.createMediaStreamSource(stream).connect(analyser);
    const data = new Uint8Array(analyser.fftSize);
    const tick = () => {
      analyser.getByteTimeDomainData(data);
      let sum = 0;
      for (const value of data) sum += ((value - 128) / 128) ** 2;
      meter.current?.style.setProperty('--level', Math.min(1, Math.sqrt(sum / data.length) * 4).toFixed(3));
      if (audio.current) audio.current.frame = requestAnimationFrame(tick);
    };
    audio.current = { context, frame: requestAnimationFrame(tick) };
  }

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
        window.clearInterval(timer.current);
        stopMeter();
        active.current = null;
        const recorded = (media.mimeType || type).split(';')[0];
        const blob = new Blob(chunks.current, { type: recorded });
        setClip({ blob, type: recorded, url: URL.createObjectURL(blob), name: null, seconds: (Date.now() - startedAt.current) / 1000 });
        setRecorder(null);
      };
      media.start();
      startedAt.current = Date.now();
      setElapsed(0);
      timer.current = window.setInterval(() => setElapsed((Date.now() - startedAt.current) / 1000), 250);
      active.current = media;
      setRecorder(media);
      listen(stream);
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
    setClip({ blob: file, type, url: URL.createObjectURL(file), name: file.name, seconds: null });
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
      toast(`Enregistrement envoyé pour « ${part.title} ».`);
    } catch (failure) {
      setError(`${getError(failure)} Vous pouvez relancer l’envoi.`);
    } finally {
      setProgress(null);
    }
  }

  function drop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    if (editable && !recorder) choose(event.dataTransfer.files?.[0] ?? null);
  }

  const recording = recorder !== null;
  return (
    <div className={`ev-recorder${recording ? ' is-recording' : ''}${dragging ? ' is-dragging' : ''}`}
      onDragOver={(event) => { if (!editable || recording) return; event.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)} onDrop={drop}>
      {saved && !clip && !recording && (
        <div className="ev-rec-saved">
          <p className="ev-rec-saved-head"><CheckCircle2 size={18} aria-hidden="true" /><strong>Enregistrement envoyé</strong>
            {editable && <small>Réécoutez-le ou remplacez-le avant de remettre.</small>}</p>
          {saved.url && <div className="ev-audio"><AudioPlayer src={saved.url} title={`Mon enregistrement · ${part.title}`} /></div>}
        </div>
      )}

      {editable && !clip && (
        <div className="ev-rec-capture">
          <div className="ev-rec-mic">
            <button type="button" className="ev-rec-button" onClick={() => (recorder ? recorder.stop() : void start())} disabled={!canRecord}
              aria-label={recording ? 'Arrêter l’enregistrement' : saved ? 'Réenregistrer' : 'Commencer l’enregistrement'}>
              {recording ? <Square size={26} fill="currentColor" aria-hidden="true" /> : <Mic size={30} aria-hidden="true" />}
            </button>
            <div className="ev-rec-info">
              <strong>{recording ? 'Enregistrement en cours' : !canRecord ? 'Micro indisponible dans ce navigateur' : saved ? 'Réenregistrer ma réponse' : 'Enregistrer ma réponse'}</strong>
              {recording
                ? <span className="ev-rec-time">{clock(elapsed)}</span>
                : <small>{canRecord ? 'Appuyez sur le micro, parlez, puis arrêtez. Vous réécouterez avant l’envoi.' : 'Déposez un fichier audio enregistré avec votre téléphone.'}</small>}
              <div ref={meter} className="ev-rec-level" aria-hidden="true">
                {Array.from({ length: LEVEL_BARS }, (_, index) => <i key={index} style={{ ['--i' as string]: index }} />)}
              </div>
              {recording && <span className="sr-only" role="status">Enregistrement en cours…</span>}
            </div>
          </div>
          <div className="ev-rec-alt">
            <span className="ev-rec-or">ou</span>
            <label className={`btn ${canRecord ? 'btn-outline' : 'btn-primary'} ev-rec-file`} aria-disabled={recording}>
              <UploadIcon size={16} aria-hidden="true" /> Déposer un fichier
              <input className="sr-only" type="file" accept="audio/*" disabled={recording} onChange={(event) => choose(event.currentTarget.files?.[0] ?? null)} />
            </label>
            <small>WebM, Ogg, MP4, MP3 ou WAV · 25 Mo au plus</small>
          </div>
        </div>
      )}

      {editable && clip && (
        <div className="ev-rec-review">
          <p className="ev-rec-review-head">
            <span className="ev-icon-tile is-success"><FileAudio size={17} aria-hidden="true" /></span>
            <span><strong>{clip.name ?? 'Nouvel enregistrement'}</strong><small>{clip.seconds !== null ? `Durée ${clock(clip.seconds)} · ` : ''}pas encore envoyé</small></span>
          </p>
          <div className="ev-audio"><AudioPlayer src={clip.url} title="Écouter avant l’envoi" /></div>
          {progress !== null && (
            <div className="ev-rec-progress"><ProgressBar value={progress} label="Envoi de l’enregistrement" /><span>{progress} %</span></div>
          )}
          <div className="ev-rec-actions">
            <button type="button" className="btn btn-ghost" disabled={progress !== null} onClick={() => setClip(null)}>
              <Trash2 size={16} aria-hidden="true" /> Recommencer</button>
            <button type="button" className="btn btn-primary" disabled={progress !== null} onClick={() => void send()}>
              <Send size={16} aria-hidden="true" /> {progress === null ? 'Envoyer cet enregistrement' : `Envoi : ${progress} %`}</button>
          </div>
        </div>
      )}
      {error && <p className="inline-message warning" role="alert">{error}</p>}
    </div>
  );
}
