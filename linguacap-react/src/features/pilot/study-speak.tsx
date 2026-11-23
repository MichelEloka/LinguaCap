/**
 * Répétition orale (`speak`) : phrase modèle et son enregistrement, bouton « Parler » avec la reconnaissance vocale du
 * navigateur (de-DE), transcription affichée, envoi du texte reconnu au serveur qui calcule le score et décide. Après
 * trois échecs, l'élève peut continuer (la phrase est alors « à revoir »). Sans reconnaissance vocale (Firefox…) ou si le
 * micro est refusé : enregistrement envoyé au professeur, qui valide.
 */
import { useEffect, useRef, useState } from 'react';
import { ArrowRight, CheckCircle2, Clock3, Flag, Info, Mic, RotateCcw, Square, Volume2 } from 'lucide-react';
import { requestApi } from '../../integration/api';
import {
  speechFallbackLabel, speechLimits, speechRecognitionNotice, type SpeakAnswer, type SpeakQuestionView, type SpeechAttemptRequest,
  type SpeechAttemptView, type SpeechRecordingReservation, type SpeechRecordingRequest,
} from '../../integration/v4';
import { AudioCapture } from './study-recorder';
import './study-exercise.css';

// ---------------------------------------------------------------------------------------------------------------------
// Reconnaissance vocale du navigateur (Web Speech API), types minimaux
// ---------------------------------------------------------------------------------------------------------------------

interface RecognitionAlternative { transcript: string }
interface RecognitionResult { readonly length: number; readonly isFinal: boolean; [index: number]: RecognitionAlternative }
interface RecognitionEvent { readonly resultIndex: number; readonly results: { readonly length: number; [index: number]: RecognitionResult } }
interface Recognition {
  lang: string; interimResults: boolean; maxAlternatives: number; continuous: boolean;
  onresult: ((event: RecognitionEvent) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start(): void; stop(): void; abort(): void;
}
type RecognitionConstructor = new () => Recognition;

/** Constructeur de la reconnaissance vocale du navigateur (Chrome, Edge, Safari), ou null (Firefox…). */
export function speechRecognition(): RecognitionConstructor | null {
  if (typeof window === 'undefined') return null;
  const scope = window as unknown as { SpeechRecognition?: RecognitionConstructor; webkitSpeechRecognition?: RecognitionConstructor };
  return scope.SpeechRecognition ?? scope.webkitSpeechRecognition ?? null;
}

const recognitionErrors: Record<string, { text: string; fallback: boolean }> = {
  'no-speech': { text: 'Nous n’avons rien entendu. Approchez-vous du micro et parlez distinctement.', fallback: false },
  aborted: { text: 'L’écoute a été interrompue. Réessayez.', fallback: false },
  'audio-capture': { text: 'Aucun micro n’a été trouvé. Branchez-en un ou enregistrez-vous avec votre téléphone.', fallback: true },
  'not-allowed': { text: 'Le micro est refusé : autorisez-le dans votre navigateur, ou enregistrez-vous pour votre professeur.', fallback: true },
  'service-not-allowed': { text: 'La reconnaissance vocale est désactivée dans ce navigateur. Enregistrez-vous pour votre professeur.', fallback: true },
  network: { text: 'Le service de reconnaissance vocale ne répond pas. Réessayez ou enregistrez-vous pour votre professeur.', fallback: true },
  'language-not-supported': { text: 'Ce navigateur ne reconnaît pas l’allemand. Enregistrez-vous pour votre professeur.', fallback: true },
};

const fold = (value: string) => value.toLocaleLowerCase('de').normalize('NFC').replace(/[.,;:!?¿¡"“”„«»()[\]…–—/]/g, ' ').replace(/\s+/g, ' ').trim();

/** Mots de la phrase modèle retrouvés dans le texte reconnu (simple repère visuel : le serveur décide). */
function heardWords(target: string, transcript: string) {
  const heard = fold(transcript).split(' ');
  const pool = new Map<string, number>();
  for (const word of heard) pool.set(word, (pool.get(word) ?? 0) + 1);
  return target.split(/(\s+)/).map((part) => {
    const key = fold(part);
    if (!key) return { part, heard: null as boolean | null };
    const left = pool.get(key) ?? 0;
    if (left > 0) pool.set(key, left - 1);
    return { part, heard: left > 0 };
  });
}

function failureText(error: unknown) {
  return error instanceof Error && error.name !== 'TimeoutError' && error.message ? error.message : 'Le service est momentanément indisponible. Réessayez.';
}

export interface SpeakContext { lessonId: string; roundId: string; sessionId?: string; activityId?: string }

export function SpeakField({ question, value, onChange, context, token, preview = false, locked = false }: {
  question: SpeakQuestionView;
  value: SpeakAnswer | undefined;
  onChange: (answer: SpeakAnswer) => void;
  context: SpeakContext | null;
  token: string;
  preview?: boolean;
  locked?: boolean;
}) {
  const supported = useRef(speechRecognition() !== null).current;
  const [mode, setMode] = useState<'speak' | 'record'>(supported ? 'speak' : 'record');
  const [attempt, setAttempt] = useState<SpeechAttemptView | null>(null);
  const [restoring, setRestoring] = useState(Boolean(value?.speechAttemptId));
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState('');
  const [heard, setHeard] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [suggestRecording, setSuggestRecording] = useState(false);
  const recognition = useRef<Recognition | null>(null);
  const recordingId = useRef<string | null>(null);
  const disabled = preview || locked || !context;
  const where = context?.sessionId ? { sessionId: context.sessionId, activityId: context.activityId } : {};

  // Réponse déjà donnée (reprise de la séance) : relire l'essai pour en afficher l'état.
  useEffect(() => {
    const id = value?.speechAttemptId;
    if (!id || attempt?.id === id) { setRestoring(false); return; }
    let active = true;
    requestApi<SpeechAttemptView>(`/assessments/speech/${encodeURIComponent(id)}`, token)
      .then((view) => { if (!active) return; setAttempt(view); if (view.mode === 'recording') setMode('record'); })
      .catch(() => undefined)
      .finally(() => { if (active) setRestoring(false); });
    return () => { active = false; };
  // L'essai n'est relu qu'à l'ouverture : les essais suivants arrivent par les réponses du serveur.
  }, []);

  useEffect(() => () => recognition.current?.abort(), []);

  async function send(transcripts: string[]) {
    if (!context) return;
    setBusy(true);
    setError('');
    try {
      const body: SpeechAttemptRequest = { lessonId: context.lessonId, questionId: question.id, roundId: context.roundId, ...where, transcripts };
      const view = await requestApi<SpeechAttemptView>('/assessments/speech', token, { method: 'POST', body });
      setAttempt(view);
      // Réussite : la réponse est prête. Échec après avoir choisi de continuer : la réponse suit le dernier essai.
      if (view.passed || skipped) onChange({ speechAttemptId: view.id });
    } catch (failure) {
      setError(failureText(failure));
    } finally {
      setBusy(false);
    }
  }

  function listen() {
    const Constructor = speechRecognition();
    if (!Constructor || disabled) return;
    if (listening) { recognition.current?.stop(); return; }
    setError('');
    setInterim('');
    setHeard(null);
    const engine = new Constructor();
    engine.lang = 'de-DE';
    engine.interimResults = true;
    engine.maxAlternatives = speechLimits.transcripts;
    engine.continuous = false;
    let finals: string[] = [];
    let failed = false;
    engine.onresult = (event) => {
      const done: RecognitionResult[] = [];
      let live = '';
      for (let index = 0; index < event.results.length; index++) {
        const result = event.results[index];
        if (result.isFinal) done.push(result); else live += result[0]?.transcript ?? '';
      }
      if (done.length === 1) {
        finals = Array.from({ length: done[0].length }, (_, index) => done[0][index].transcript);
      } else if (done.length > 1) {
        finals = [done.map((result) => result[0]?.transcript ?? '').join(' ')];
      }
      setInterim([...done.map((result) => result[0]?.transcript ?? ''), live].join(' ').trim());
    };
    engine.onerror = (event) => {
      failed = true;
      const known = recognitionErrors[event.error] ?? { text: 'La reconnaissance vocale a rencontré un problème. Réessayez.', fallback: true };
      setError(known.text);
      if (known.fallback) setSuggestRecording(true);
    };
    engine.onend = () => {
      recognition.current = null;
      setListening(false);
      const transcripts = [...new Set(finals.map((text) => text.trim().slice(0, speechLimits.transcriptChars)).filter(Boolean))]
        .slice(0, speechLimits.transcripts);
      if (transcripts.length) {
        setHeard(transcripts[0]);
        void send(transcripts);
      } else if (!failed) {
        setError(recognitionErrors['no-speech'].text);
      }
      setInterim('');
    };
    recognition.current = engine;
    try {
      engine.start();
      setListening(true);
    } catch {
      recognition.current = null;
      setError('La reconnaissance vocale n’a pas pu démarrer. Réessayez ou enregistrez-vous pour votre professeur.');
      setSuggestRecording(true);
    }
  }

  const passed = Boolean(attempt?.passed);
  const pendingRecording = attempt?.mode === 'recording' && value?.speechAttemptId === attempt.id;
  const skipped = Boolean(value?.speechAttemptId && attempt && !attempt.passed && attempt.mode === 'recognition' && attempt.id === value.speechAttemptId);
  const exhausted = (attempt?.attempt ?? 0) >= speechLimits.attemptsPerRound && !passed;
  const transcript = interim || heard || attempt?.transcript || '';
  const words = attempt && !passed && attempt.mode === 'recognition' && attempt.transcript ? heardWords(question.text, attempt.transcript) : null;
  const left = attempt && !attempt.canSkip ? Math.max(0, speechLimits.failuresBeforeSkip - attempt.failures) : 0;

  return (
    <div className={`sx-speak${passed ? ' is-passed' : ''}${listening ? ' is-listening' : ''}`}>
      <p className="sx-speak-target" lang="de">
        <Volume2 size={18} aria-hidden="true" />
        <span>
          {words
            ? words.map((word, index) => <span key={index} className={word.heard === null ? undefined : word.heard ? 'is-heard' : 'is-missed'}>{word.part}</span>)
            : question.text}
        </span>
      </p>

      {restoring ? <p className="sx-speak-status is-muted" role="status">Chargement de votre essai…</p> : mode === 'speak' ? (
        <>
          <div className="sx-speak-stage">
            <button type="button" className="sx-mic" onClick={listen} disabled={disabled || busy || passed || exhausted}
              aria-label={listening ? 'Arrêter l’écoute' : passed ? 'Phrase réussie' : 'Parler'} aria-pressed={listening}>
              <span className="sx-mic-wave" aria-hidden="true" />
              {listening ? <Square size={22} fill="currentColor" aria-hidden="true" /> : passed ? <CheckCircle2 size={28} aria-hidden="true" /> : <Mic size={28} aria-hidden="true" />}
            </button>
            <div className="sx-speak-info">
              <strong>{listening ? 'Je vous écoute…' : busy ? 'Vérification…' : passed ? 'Bien prononcé !' : attempt ? 'Réessayez' : 'Parler'}</strong>
              <small>
                {listening ? 'Dites la phrase, puis touchez le bouton pour arrêter.'
                  : passed ? `Score ${attempt?.score ?? 0} / 100 (seuil ${attempt?.threshold ?? question.threshold}).`
                  : preview ? 'Aperçu : la répétition est désactivée.'
                  : 'Écoutez le modèle, touchez le micro puis répétez la phrase.'}
              </small>
              {transcript && (
                <p className="sx-speak-heard" aria-live="polite"><span>Reconnu :</span> <q lang="de">{transcript}</q></p>
              )}
            </div>
          </div>
          {attempt && !passed && attempt.mode === 'recognition' && (
            <div className={`sx-speak-result${attempt.canSkip ? ' is-flag' : ''}`} role="status">
              <span className="sx-speak-score" aria-hidden="true">
                <i style={{ width: `${attempt.score ?? 0}%` }} /><b style={{ left: `${attempt.threshold}%` }} />
              </span>
              <p>
                <strong>Pas encore : {attempt.score ?? 0} / 100</strong> (il faut {attempt.threshold}).{' '}
                {skipped ? 'Vous avez choisi de continuer : la phrase est notée « à revoir ».'
                  : attempt.canSkip ? 'Vous pouvez réessayer, ou continuer : la phrase sera notée « à revoir ».'
                  : `Réécoutez le modèle et réessayez${left ? ` (encore ${left} essai${left > 1 ? 's' : ''} avant de pouvoir continuer)` : ''}.`}
              </p>
            </div>
          )}
          {attempt?.canSkip && !passed && !disabled && (
            <div className="sx-speak-actions">
              {!skipped && (
                <button type="button" className="btn btn-outline btn-sm" onClick={() => onChange({ speechAttemptId: attempt.id })}>
                  <Flag size={15} aria-hidden="true" /> Continuer, à revoir <ArrowRight size={15} aria-hidden="true" />
                </button>
              )}
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setMode('record')}>
                <Mic size={15} aria-hidden="true" /> {speechFallbackLabel}
              </button>
            </div>
          )}
          {error && <p className="inline-message warning" role="alert">{error}</p>}
          {suggestRecording && !disabled && !(attempt?.canSkip && !passed) && (
            <button type="button" className="btn btn-outline btn-sm sx-speak-switch" onClick={() => setMode('record')}>
              <Mic size={15} aria-hidden="true" /> {speechFallbackLabel}
            </button>
          )}
          <details className="sx-speak-notice">
            <summary><Info size={14} aria-hidden="true" /> La reconnaissance vocale de votre navigateur est utilisée.</summary>
            <p>{speechRecognitionNotice}</p>
          </details>
        </>
      ) : (
        <div className="sx-speak-record">
          {pendingRecording ? (
            <p className="sx-speak-status is-pending" role="status">
              <Clock3 size={17} aria-hidden="true" />
              <span><strong>Enregistrement envoyé.</strong> Votre professeur validera votre prononciation ; vous pouvez passer à la suite.</span>
            </p>
          ) : (
            <p className="sx-speak-status">
              <Info size={17} aria-hidden="true" />
              <span>{supported
                ? 'Enregistrez-vous en répétant la phrase : votre professeur écoutera et validera votre prononciation.'
                : 'Votre navigateur ne propose pas la reconnaissance vocale (elle existe dans Chrome et Edge). Enregistrez-vous : votre professeur validera votre prononciation.'}</span>
            </p>
          )}
          <AudioCapture maxSeconds={30} disabled={disabled} token={token} title={speechFallbackLabel} compact
            saved={pendingRecording && attempt?.recording ? { url: attempt.recording.url, mimeType: attempt.recording.mimeType } : null}
            hint="Écoutez le modèle, touchez le micro, répétez la phrase puis arrêtez (30 s au plus)."
            reserve={async (mimeType, size) => {
              if (!context) throw new Error('Enregistrement indisponible dans l’aperçu.');
              const body: SpeechRecordingRequest = { lessonId: context.lessonId, questionId: question.id, roundId: context.roundId, ...where, mimeType, size };
              const reservation = await requestApi<SpeechRecordingReservation>('/assessments/speech/recordings', token, { method: 'POST', body });
              recordingId.current = reservation.attempt.id;
              return reservation.upload;
            }}
            finalize={async (productionId) => {
              const speechId = recordingId.current;
              if (!speechId) throw new Error('Réservation introuvable : recommencez l’envoi.');
              const view = await requestApi<SpeechAttemptView>(
                `/assessments/speech/${encodeURIComponent(speechId)}/recordings/${encodeURIComponent(productionId)}/finalize`, token, { method: 'POST' });
              setAttempt(view);
              onChange({ speechAttemptId: view.id });
            }} />
          {supported && !disabled && (
            <button type="button" className="btn btn-ghost btn-sm sx-speak-switch" onClick={() => { setMode('speak'); setError(''); }}>
              <RotateCcw size={15} aria-hidden="true" /> Revenir à la reconnaissance vocale
            </button>
          )}
        </div>
      )}
    </div>
  );
}
