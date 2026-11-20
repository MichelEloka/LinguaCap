import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { apiBase, isApiMode, supabaseKey, supabaseUrl } from '../app/config';

function createAuthClient() {
  if (!isApiMode || !supabaseUrl || !supabaseKey) return null;
  try {
    return createClient(supabaseUrl, supabaseKey);
  } catch {
    return null;
  }
}

export const supabase = createAuthClient();

/** Rôles des comptes réels. staff : membre de l'équipe (« Équipe »), sans élèves. */
export type AccountRole = 'learner' | 'teacher' | 'admin' | 'staff';
export type Permission = 'catalogue' | 'correction';

export interface Profile {
  id: string;
  displayName: string;
  role: AccountRole;
  permissions: Permission[];
}

export const roleNames: Record<AccountRole, string> = {
  learner: 'Élève', teacher: 'Professeur', admin: 'Administration', staff: 'Équipe',
};

const roles = new Set<string>(['learner', 'teacher', 'admin', 'staff']);
const permissions = new Set<string>(['catalogue', 'correction']);

/** Émis quand l'API refuse une session expirée : l'espace connecté renvoie alors vers la connexion. */
export const sessionExpiredEvent = 'linguacap:session-expired';

export function canEditCatalogue(profile: Profile) {
  return profile.role === 'admin' || profile.permissions.includes('catalogue');
}

export async function requestApi<T = unknown>(
  path: string,
  token?: string,
  options?: { method: 'POST' | 'PUT'; body?: unknown; idempotencyKey?: string },
): Promise<T> {
  const response = await fetch(`${apiBase}${path}`, {
    method: options?.method ?? 'GET',
    headers: {
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options ? { 'Content-Type': 'application/json' } : {}),
      ...(options?.idempotencyKey ? { 'Idempotency-Key': options.idempotencyKey } : {}),
    },
    body: options ? JSON.stringify(options.body ?? {}) : undefined,
    credentials: 'same-origin',
    cache: 'no-store',
    signal: AbortSignal.timeout(8000),
  });
  const isJson = response.headers.get('content-type')?.includes('application/json');
  if (response.status === 401 && token) window.dispatchEvent(new Event(sessionExpiredEvent));
  if (!response.ok) {
    const details: unknown = isJson ? await response.json().catch(() => null) : null;
    const message = typeof details === 'object' && details !== null &&
      'message' in details && typeof details.message === 'string' ? details.message : '';
    throw new Error(message || `La passerelle API a répondu avec le statut HTTP ${response.status}.`);
  }
  if (!isJson) {
    throw new Error('La route est accessible, mais elle ne renvoie pas le contrat JSON attendu.');
  }
  return response.json();
}

/**
 * Envoie un fichier directement dans Supabase Storage, au chemin réservé par Médias, avec la progression.
 * La politique de stockage n'accepte que l'auteur du dépôt, avant son expiration.
 */
export function uploadToStorage(url: string, file: File, contentType: string, token: string,
  onProgress: (percent: number) => void, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open('POST', url);
    request.setRequestHeader('Authorization', `Bearer ${token}`);
    if (supabaseKey) request.setRequestHeader('apikey', supabaseKey);
    request.setRequestHeader('Content-Type', contentType);
    request.setRequestHeader('x-upsert', 'false');
    request.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(Math.round((event.loaded / event.total) * 100));
    };
    request.onload = () => {
      // Un fichier déjà reçu lors d'un essai précédent est signalé en doublon : la finalisation le contrôlera.
      if (request.status >= 200 && request.status < 300 || /Duplicate|already exists/i.test(request.responseText)) {
        onProgress(100);
        resolve();
      } else {
        reject(new Error('Le stockage a refusé le fichier. Réessayez ou recommencez le dépôt.'));
      }
    };
    request.onerror = () => reject(new Error('L’envoi a été interrompu : vérifiez la connexion puis réessayez.'));
    request.onabort = () => reject(new DOMException('Envoi annulé.', 'AbortError'));
    signal.addEventListener('abort', () => request.abort(), { once: true });
    request.send(file);
  });
}

export async function checkHealth(): Promise<'ok' | 'degraded'> {
  const result = await requestApi('/health');
  if (typeof result === 'object' && result !== null && 'status' in result &&
      (result.status === 'ok' || result.status === 'degraded')) {
    return result.status;
  }
  throw new Error('La réponse de santé ne correspond pas au contrat attendu.');
}

export async function fetchProfile(token: string): Promise<Profile> {
  const result = await requestApi('/me', token);
  if (typeof result === 'object' && result !== null && 'id' in result &&
      typeof result.id === 'string' && 'displayName' in result && typeof result.displayName === 'string' &&
      'role' in result && typeof result.role === 'string' && roles.has(result.role)) {
    // Une passerelle antérieure à l'incrément 2 ne renvoie pas encore les permissions.
    const granted = 'permissions' in result && Array.isArray(result.permissions) ? result.permissions : [];
    return {
      id: result.id, displayName: result.displayName, role: result.role as AccountRole,
      permissions: granted.filter((item): item is Permission => typeof item === 'string' && permissions.has(item)),
    };
  }
  throw new Error('Le profil renvoyé par Identités ne correspond pas au contrat attendu.');
}

/** Session Supabase en cours : chargement, puis connecté ou non. Sans Supabase (démonstration), jamais connecté. */
export function useSignedIn() {
  const [state, setState] = useState({ loading: Boolean(supabase), signedIn: false });
  useEffect(() => {
    if (!supabase) return;
    const { data } = supabase.auth.onAuthStateChange((_event, session) => setState({ loading: false, signedIn: Boolean(session) }));
    return () => data.subscription.unsubscribe();
  }, []);
  return state;
}
