/**
 * Enregistrement audio du mode étude (répétition orale validée par le professeur, missions) : micro du navigateur avec
 * niveau sonore et arrêt automatique à `maxSeconds`, réécoute avant l'envoi, dépôt d'un fichier en alternative, puis
 * envoi en trois temps fournis par l'écran appelant : réservation du dépôt, envoi du fichier, finalisation.
 */
import { useEffect, useRef, useState, type DragEvent } from 'react';
import { CheckCircle2, FileAudio, Mic, Send, Square, Trash2, Upload as UploadIcon } from 'lucide-react';
import { ProgressBar } from '../../components/ui';
import { AudioPlayer } from '../../design/kit';
import { supabase, uploadToStorage } from '../../integration/api';
import './study-exercise.css';

const RECORDING_TYPES = ['audio/webm', 'audio/ogg', 'audio/mp4', 'audio/mpeg', 'audio/wav'];
const FILE_TYPES: Record<string, string> = {
  'audio/webm': 'audio/webm', 'audio/ogg': 'audio/ogg', 'audio/mp4': 'audio/mp4', 'audio/x-m4a': 'audio/mp4', 'audio/m4a': 'audio/mp4',
  'audio/mpeg': 'audio/mpeg', 'audio/mp3': 'audio/mpeg', 'audio/wav': 'audio/wav', 'audio/x-wav': 'audio/wav', 'audio/wave': 'audio/wav',
};
const LEVEL_BARS = 16;
export const clock = (seconds: number) => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;

export interface CaptureReservation { id: string; uploadUrl: string | null; maxBytes: number }
interface Clip { blob: Blob; type: string; url: string; name: string | null; seconds: number | null }

function failureText(error: unknown) {
  return error instanceof Error && error.name !== 'TimeoutError' && error.message ? error.message : 'Le service est momentanément indisponible.';
}

/** Durée d'un fichier audio déposé (null si le navigateur ne sait pas la lire). */
function fileDuration(url: string) {
  return new Promise<number | null>((resolve) => {
    const probe = new Audio();
    const done = (value: number | null) => { probe.removeAttribute('src'); resolve(value); };
    probe.preload = 'metadata';
    probe.onloadedmetadata = () => done(Number.isFinite(probe.duration) ? probe.duration : null);
    probe.onerror = () => done(null);
    window.setTimeout(() => done(null), 4000);
    probe.src = url;
  });
}

async function storageToken(token?: string) {
  if (token) return token;
  try {
    const result = await (supabase?.auth as { getSession?: () => Promise<{ data: { session: { access_token: string } | null } }> } | undefined)?.getSession?.();
    return result?.data.session?.access_token ?? '';
  } catch {
    return '';
  }
}

/**
 * Capture audio. `reserve` réserve le dépôt (type et taille du fichier), `finalize` confirme l'envoi ; `saved` montre
 * l'enregistrement déjà remis, qu'un nouvel envoi remplace. `token` sert au dépôt direct dans le stockage (à défaut, la
 * session en cours).
 */
export function AudioCapture({ maxSeconds, disabled = false, saved = null, reserve, finalize, onDone, token, title, hint, compact = false }: {
  maxSeconds: number;
  disabled?: boolean;
  saved?: { url: string | null; mimeType: string } | null;
  reserve: (mimeType: string, size: number) => Promise<CaptureReservation>;
  finalize: (id: string) => Promise<void>;
  onDone?: () => void;
  token?: string;
  title?: string;
  hint?: string;
  compact?: boolean;
}) {
  const [recording, setRecording] = useState(false);
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
  const canRecord = typeof window !== 'undefined' && 'MediaRecorder' in window && !!navigator.mediaDevices?.getUserMedia;
  const busy = progress !== null;

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
        const seconds = Math.min(maxSeconds, (Date.now() - startedAt.current) / 1000);
        setClip({ blob, type: recorded, url: URL.createObjectURL(blob), name: null, seconds });
        setRecording(false);
      };
      media.start();
      startedAt.current = Date.now();
      setElapsed(0);
      // Arrêt automatique à la durée maximale.
      timer.current = window.setInterval(() => {
        const seconds = (Date.now() - startedAt.current) / 1000;
        setElapsed(seconds);
        if (seconds >= maxSeconds && media.state === 'recording') media.stop();
      }, 200);
      active.current = media;
      setRecording(true);
      listen(stream);
    } catch {
      setError('Le micro n’est pas disponible : autorisez-le dans votre navigateur ou déposez un fichier audio.');
    }
  }

  async function choose(file: File | null) {
    setError('');
    if (!file) return;
    const type = FILE_TYPES[file.type];
    if (!type) {
      setError('Formats acceptés : WebM, Ogg, MP4, MP3 ou WAV.');
      return;
    }
    const url = URL.createObjectURL(file);
    const seconds = await fileDuration(url);
    if (seconds !== null && seconds > maxSeconds + 1) {
      URL.revokeObjectURL(url);
      setError(`L’enregistrement dure ${clock(seconds)} : ${clock(maxSeconds)} au plus.`);
      return;
    }
    setClip({ blob: file, type, url, name: file.name, seconds });
  }

  async function send() {
    if (!clip || busy) return;
    setError('');
    setProgress(0);
    try {
      const reservation = await reserve(clip.type, clip.blob.size);
      if (clip.blob.size > reservation.maxBytes) throw new Error(`L’enregistrement dépasse ${Math.round(reservation.maxBytes / 1_000_000)} Mo.`);
      if (reservation.uploadUrl) {
        const file = new File([clip.blob], `oral.${clip.type.split('/')[1]}`, { type: clip.type });
        await uploadToStorage(reservation.uploadUrl, file, clip.type, await storageToken(token), setProgress, new AbortController().signal);
      }
      await finalize(reservation.id);
      setClip(null);
      onDone?.();
    } catch (failure) {
      setError(`${failureText(failure)} Vous pouvez relancer l’envoi.`);
    } finally {
      setProgress(null);
    }
  }

  function drop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    if (!disabled && !recording) void choose(event.dataTransfer.files?.[0] ?? null);
  }

  const left = Math.max(0, maxSeconds - elapsed);
  return (
    <div className={`sx-rec${recording ? ' is-recording' : ''}${dragging ? ' is-dragging' : ''}${compact ? ' is-compact' : ''}`}
      onDragOver={(event) => { if (disabled || recording) return; event.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)} onDrop={drop}>
      {saved && !clip && !recording && (
        <div className="sx-rec-saved">
          <p className="sx-rec-saved-head"><CheckCircle2 size={18} aria-hidden="true" /><strong>Enregistrement envoyé</strong>
            {!disabled && <small>Réécoutez-le ou remplacez-le par un nouvel enregistrement.</small>}</p>
          {saved.url && <AudioPlayer src={saved.url} title="Mon enregistrement" />}
        </div>
      )}

      {!disabled && !clip && (
        <div className="sx-rec-capture">
          <div className="sx-rec-mic">
            <button type="button" className="sx-rec-button" onClick={() => (recording ? active.current?.stop() : void start())} disabled={!canRecord}
              aria-label={recording ? 'Arrêter l’enregistrement' : saved ? 'Réenregistrer' : 'Commencer l’enregistrement'}>
              {recording ? <Square size={22} fill="currentColor" aria-hidden="true" /> : <Mic size={26} aria-hidden="true" />}
            </button>
            <div className="sx-rec-info">
              <strong>{recording ? 'Enregistrement en cours' : !canRecord ? 'Micro indisponible dans ce navigateur' : title ?? (saved ? 'Réenregistrer ma réponse' : 'Enregistrer ma réponse')}</strong>
              {recording
                ? <span className="sx-rec-time"><b>{clock(elapsed)}</b> <small>arrêt automatique dans {clock(left)}</small></span>
                : <small>{canRecord ? hint ?? `Appuyez sur le micro, parlez, puis arrêtez (${clock(maxSeconds)} au plus). Vous réécouterez avant l’envoi.` : 'Déposez un fichier audio enregistré avec votre téléphone.'}</small>}
              <div ref={meter} className="sx-rec-level" aria-hidden="true">
                {Array.from({ length: LEVEL_BARS }, (_, index) => <i key={index} style={{ ['--i' as string]: index }} />)}
              </div>
              {recording && <span className="sx-rec-limit" aria-hidden="true"><i style={{ width: `${Math.min(100, (elapsed / maxSeconds) * 100)}%` }} /></span>}
              {recording && <span className="sr-only" role="status">Enregistrement en cours, {clock(maxSeconds)} au plus.</span>}
            </div>
          </div>
          <div className="sx-rec-alt">
            <span className="sx-rec-or">ou</span>
            <label className={`btn btn-sm ${canRecord ? 'btn-ghost' : 'btn-outline'} sx-rec-file`} aria-disabled={recording}>
              <UploadIcon size={15} aria-hidden="true" /> Déposer un fichier
              <input className="sr-only" type="file" accept="audio/*" disabled={recording} onChange={(event) => void choose(event.currentTarget.files?.[0] ?? null)} />
            </label>
          </div>
        </div>
      )}

      {!disabled && clip && (
        <div className="sx-rec-review">
          <p className="sx-rec-review-head">
            <span className="sx-rec-tile" aria-hidden="true"><FileAudio size={17} /></span>
            <span><strong>{clip.name ?? 'Nouvel enregistrement'}</strong><small>{clip.seconds !== null ? `Durée ${clock(clip.seconds)} · ` : ''}pas encore envoyé</small></span>
          </p>
          <AudioPlayer src={clip.url} title="Écouter avant l’envoi" />
          {busy && (
            <div className="sx-rec-progress"><ProgressBar value={progress ?? 0} label="Envoi de l’enregistrement" /><span>{progress} %</span></div>
          )}
          <div className="sx-rec-actions">
            <button type="button" className="btn btn-ghost" disabled={busy} onClick={() => setClip(null)}>
              <Trash2 size={16} aria-hidden="true" /> Recommencer</button>
            <button type="button" className="btn btn-primary" disabled={busy} onClick={() => void send()}>
              <Send size={16} aria-hidden="true" /> {busy ? `Envoi : ${progress} %` : 'Envoyer cet enregistrement'}</button>
          </div>
        </div>
      )}
      {error && <p className="inline-message warning" role="alert">{error}</p>}
    </div>
  );
}
