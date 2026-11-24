/**
 * Lecteur YouTube du Ciné-club : lecteur officiel `www.youtube-nocookie.com` (seule origine autorisée par la CSP
 * `frame-src`), chargé uniquement après un clic explicite. Avant ce clic, rien ne part vers YouTube : ni cadre, ni
 * vignette, ni préconnexion. L'accord peut être mémorisé sur l'appareil (`lc-youtube-consent`) puis retiré.
 *
 * Le lecteur se pilote par l'API `postMessage` de son cadre (`enablejsapi=1`), sans script externe : écoute du temps
 * courant (`infoDelivery`), retour au début, lecture et pause. La séquence s'arrête d'elle-même à sa fin.
 */
import { useCallback, useEffect, useRef, useState, type MutableRefObject, type ReactNode } from 'react';
import { Clapperboard, ExternalLink, Play, RotateCcw, ShieldCheck } from 'lucide-react';
import {
  formatTimecode, readYoutubeConsent, writeYoutubeConsent, youtubeConsentKey, youtubeEmbedUrl, youtubeOrigin,
} from '../../integration/cine';

const consentEvent = 'linguacap:youtube-consent';

/** Accord YouTube : `granted` pour cette page, `remembered` s'il est mémorisé sur l'appareil. */
export function useYoutubeConsent() {
  const [remembered, setRemembered] = useState(readYoutubeConsent);
  const [granted, setGranted] = useState(remembered);
  useEffect(() => {
    // Accord donné ou retiré dans un autre lecteur de la page, ou dans un autre onglet.
    const sync = () => {
      const stored = readYoutubeConsent();
      setRemembered(stored);
      if (!stored) setGranted(false); else setGranted(true);
    };
    const storage = (event: StorageEvent) => { if (event.key === youtubeConsentKey) sync(); };
    window.addEventListener(consentEvent, sync);
    window.addEventListener('storage', storage);
    return () => { window.removeEventListener(consentEvent, sync); window.removeEventListener('storage', storage); };
  }, []);
  const grant = useCallback((remember: boolean) => {
    if (remember) { writeYoutubeConsent(true); setRemembered(true); window.dispatchEvent(new Event(consentEvent)); }
    setGranted(true);
  }, []);
  const revoke = useCallback(() => {
    writeYoutubeConsent(false);
    setRemembered(false);
    setGranted(false);
    window.dispatchEvent(new Event(consentEvent));
  }, []);
  return { granted, remembered, grant, revoke };
}

/** Commandes du lecteur chargé (sans effet tant qu'il n'a pas répondu). */
export interface YoutubeControls {
  ready: boolean;
  /** Dernier temps reçu du lecteur (secondes dans la vidéo), null avant la première lecture. */
  currentTime: () => number | null;
  seek: (seconds: number, play?: boolean) => void;
  play: () => void;
  pause: () => void;
}

interface PlayerMessage { event?: string; info?: unknown }
const PLAYING = 1;

/** Écran d'accord : explique ce que YouTube reçoit, propose de mémoriser le choix ou d'ouvrir la vidéo sur YouTube. */
function ConsentGate({ title, watchUrl, onGrant }: { title: string; watchUrl: string; onGrant: (remember: boolean) => void }) {
  const [remember, setRemember] = useState(false);
  return (
    <div className="yt-gate" role="group" aria-label={`Vidéo YouTube : ${title}`}>
      <span className="yt-gate-strip is-top" aria-hidden="true" />
      <span className="yt-gate-strip is-bottom" aria-hidden="true" />
      <div className="yt-gate-body">
        <span className="yt-gate-icon" aria-hidden="true"><Clapperboard size={26} /></span>
        <h3 className="yt-gate-title">La vidéo est hébergée par YouTube</h3>
        <p className="yt-gate-text">
          Elle se regarde dans le lecteur officiel de YouTube. En la chargeant, YouTube (Google) reçoit des données de connexion,
          comme votre adresse IP. Rien ne lui est envoyé avant votre clic.
        </p>
        <button type="button" className="btn btn-primary yt-gate-button" onClick={() => onGrant(remember)}>
          <Play size={17} fill="currentColor" aria-hidden="true" /> Charger la vidéo YouTube
        </button>
        <label className="yt-gate-remember">
          <input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} />
          Se souvenir de mon choix sur cet appareil
        </label>
        <a className="yt-gate-link" href={watchUrl} target="_blank" rel="noopener noreferrer">
          Ou regarder directement sur YouTube <ExternalLink size={13} aria-hidden="true" />
        </a>
      </div>
    </div>
  );
}

/**
 * Lecteur d'une séquence : écran d'accord, puis cadre YouTube borné à [start, end] avec sous-titres allemands proposés.
 * `controlsRef` donne les commandes au parent (éditeur : « Prendre le temps actuel ») ; `onTime` suit le temps courant.
 */
export function YoutubePlayer({ videoId, title, start, end, watchUrl, controlsRef, onTime, onEnded, actions, showProgress = true, showReplay = true }: {
  videoId: string; title: string; start: number; end: number; watchUrl: string;
  controlsRef?: MutableRefObject<YoutubeControls | null>;
  onTime?: (seconds: number) => void;
  onEnded?: () => void;
  /** Actions supplémentaires de la barre du lecteur. */
  actions?: ReactNode;
  showProgress?: boolean;
  /** « Revoir la séquence » (masqué dans l'éditeur, qui a ses propres commandes). */
  showReplay?: boolean;
}) {
  const { granted, remembered, grant, revoke } = useYoutubeConsent();
  const frame = useRef<HTMLIFrameElement>(null);
  const widgetId = useRef(Math.floor(Math.random() * 1_000_000) + 1);
  const [mount, setMount] = useState(0);
  const [autoplay, setAutoplay] = useState(false);
  const [ready, setReady] = useState(false);
  const [time, setTime] = useState<number | null>(null);
  const [ended, setEnded] = useState(false);
  const timeRef = useRef<number | null>(null);
  const stateRef = useRef<number | null>(null);
  const endedRef = useRef(false);
  const callbacks = useRef({ onTime, onEnded });
  callbacks.current = { onTime, onEnded };

  const command = useCallback((func: string, args: unknown[] = []) => {
    frame.current?.contentWindow?.postMessage(JSON.stringify({ event: 'command', func, args, id: widgetId.current, channel: 'widget' }), youtubeOrigin);
  }, []);

  // Nouvelle séquence ou nouveau chargement : état remis à zéro.
  useEffect(() => {
    setReady(false); setTime(null); setEnded(false);
    timeRef.current = null; stateRef.current = null; endedRef.current = false;
  }, [videoId, start, end, mount, granted]);

  // Messages du lecteur : prêt, temps courant, état de lecture. Arrêt à la fin de la séquence.
  useEffect(() => {
    if (!granted) return;
    function receive(event: MessageEvent) {
      if (event.origin !== youtubeOrigin || event.source !== frame.current?.contentWindow) return;
      let data: PlayerMessage;
      try { data = typeof event.data === 'string' ? JSON.parse(event.data) as PlayerMessage : event.data as PlayerMessage; } catch { return; }
      if (!data || typeof data !== 'object') return;
      if (data.event === 'onReady' || data.event === 'initialDelivery') setReady(true);
      const info = data.info && typeof data.info === 'object' ? data.info as { currentTime?: unknown; playerState?: unknown } : null;
      if (data.event === 'onStateChange' && typeof data.info === 'number') stateRef.current = data.info;
      if (info && typeof info.playerState === 'number') stateRef.current = info.playerState;
      if (info && typeof info.currentTime === 'number') {
        setReady(true);
        timeRef.current = info.currentTime;
        setTime(info.currentTime);
        callbacks.current.onTime?.(info.currentTime);
        if (info.currentTime >= end - .3 && stateRef.current === PLAYING && !endedRef.current) {
          endedRef.current = true;
          setEnded(true);
          command('pauseVideo');
          callbacks.current.onEnded?.();
        }
      }
    }
    window.addEventListener('message', receive);
    return () => window.removeEventListener('message', receive);
  }, [granted, end, command]);

  // Le lecteur ne parle qu'après un message « listening » : on l'envoie jusqu'à sa première réponse.
  const listen = useCallback(() => {
    let tries = 0;
    const timer = window.setInterval(() => {
      tries += 1;
      if (timeRef.current !== null || tries > 40) { window.clearInterval(timer); return; }
      frame.current?.contentWindow?.postMessage(JSON.stringify({ event: 'listening', id: widgetId.current, channel: 'widget' }), youtubeOrigin);
    }, 250);
  }, []);

  const replay = useCallback(() => {
    endedRef.current = false;
    setEnded(false);
    if (ready) {
      command('seekTo', [start, true]);
      command('playVideo');
    } else {
      setAutoplay(true);
      setMount((value) => value + 1);
    }
  }, [ready, start, command]);

  useEffect(() => {
    if (!controlsRef) return;
    controlsRef.current = {
      ready,
      currentTime: () => timeRef.current,
      seek: (seconds, play = false) => {
        endedRef.current = false;
        setEnded(false);
        command('seekTo', [seconds, true]);
        if (play) command('playVideo');
      },
      play: () => command('playVideo'),
      pause: () => command('pauseVideo'),
    };
  }, [controlsRef, ready, command]);
  useEffect(() => () => { if (controlsRef) controlsRef.current = null; }, [controlsRef]);

  if (!granted) {
    return <div className="yt-player"><ConsentGate title={title} watchUrl={watchUrl} onGrant={grant} /></div>;
  }

  const length = Math.max(1, end - start);
  const elapsed = time === null ? null : Math.min(length, Math.max(0, time - start));
  const src = youtubeEmbedUrl(videoId, { start, end, autoplay, origin: window.location.origin });
  return (
    <div className="yt-player is-loaded">
      <div className="yt-frame">
        <iframe key={`${videoId}-${start}-${end}-${mount}`} ref={frame} src={src} title={`Lecteur YouTube : ${title}`} onLoad={listen}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen />
      </div>
      <div className="yt-bar">
        {showProgress && (
          <div className="yt-progress" role="img" aria-label={elapsed === null ? `Séquence de ${formatTimecode(length)}` : `${formatTimecode(elapsed)} sur ${formatTimecode(length)}`}>
            <span className="yt-progress-time" aria-hidden="true">{elapsed === null ? '0:00' : formatTimecode(elapsed)}</span>
            <i aria-hidden="true"><b style={{ width: `${elapsed === null ? 0 : (elapsed / length) * 100}%` }} /></i>
            <span className="yt-progress-time" aria-hidden="true">{formatTimecode(length)}</span>
          </div>
        )}
        <div className="yt-bar-actions">
          {showReplay && (
            <button type="button" className={`btn btn-sm ${ended ? 'btn-primary' : 'btn-soft'}`} onClick={replay}>
              <RotateCcw size={15} aria-hidden="true" /> Revoir la séquence
            </button>
          )}
          {actions}
        </div>
      </div>
      <p className="yt-privacy">
        <ShieldCheck size={14} aria-hidden="true" />
        <span>Lecteur YouTube chargé à votre demande{remembered ? ' (choix mémorisé sur cet appareil)' : ''}.</span>
        {remembered
          ? <button type="button" className="text-link" onClick={revoke}>Retirer mon accord</button>
          : <button type="button" className="text-link" onClick={revoke}>Fermer le lecteur</button>}
      </p>
    </div>
  );
}
