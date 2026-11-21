import { useEffect, useState } from 'react';
import { createClient, type Session } from '@supabase/supabase-js';
import { apiBase, isApiMode, supabaseKey, supabaseUrl } from '../app/config';
import type { CurrentProfileV2, LevelCode, TeacherProfile } from './v2';

/**
 * Simulateur (`npm run dev:mock`) : en développement seulement, l'API et Supabase Auth sont remplacés par un simulateur
 * en mémoire (mock-api.ts, chargé à la demande). Jamais actif dans un build : import.meta.env.DEV y vaut false.
 */
export const isMockMode = import.meta.env.DEV && isApiMode && import.meta.env.VITE_LINGUACAP_MOCK === '1';

type AuthClient = ReturnType<typeof createClient>;

function createAuthClient(): AuthClient | null {
  if (isMockMode) return createMockAuth();
  if (!isApiMode || !supabaseUrl || !supabaseKey) return null;
  try {
    return createClient(supabaseUrl, supabaseKey);
  } catch {
    return null;
  }
}

/** Rôles du simulateur, choisis par ?as=… ou d'après l'adresse saisie à la connexion. */
export const mockRoles = ['eleve-autonome', 'eleve-suivi', 'professeur', 'professeur-nouveau', 'admin', 'equipe'] as const;
const mockRoleKey = 'linguacap-mock-role';
const mockSignedOutKey = 'linguacap-mock-sortie';

function mockRoleFromEmail(email: string): (typeof mockRoles)[number] {
  const value = email.toLowerCase();
  if (value.includes('nouveau')) return 'professeur-nouveau';
  if (value.includes('prof')) return 'professeur';
  if (value.includes('admin')) return 'admin';
  if (value.includes('equipe') || value.includes('équipe')) return 'equipe';
  if (value.includes('suivi')) return 'eleve-suivi';
  return 'eleve-autonome';
}

/** Session Supabase simulée : jeton « mock-<rôle> », lu par le simulateur pour retrouver le compte. */
function createMockAuth(): AuthClient {
  const listeners = new Set<(event: string, session: Session | null) => void>();
  const asked = new URLSearchParams(window.location.search).get('as');
  if (asked && (mockRoles as readonly string[]).includes(asked)) {
    window.sessionStorage.setItem(mockRoleKey, asked);
    window.sessionStorage.removeItem(mockSignedOutKey);
  }
  const sessionOf = (role: string | null): Session | null => (role ? {
    access_token: `mock-${role}`, refresh_token: 'simulateur', expires_in: 3600, expires_at: Math.floor(Date.now() / 1000) + 3600,
    token_type: 'bearer', user: { id: role, aud: 'authenticated', role: 'authenticated', email: `${role}@simulateur.linguacap`,
      app_metadata: {}, user_metadata: {}, created_at: new Date().toISOString() },
  } as Session : null);
  const signedOut = window.sessionStorage.getItem(mockSignedOutKey) === '1';
  let session = sessionOf(signedOut ? null : window.sessionStorage.getItem(mockRoleKey) ?? 'eleve-autonome');
  const emit = (event: string) => listeners.forEach((listener) => listener(event, session));
  const auth = {
    onAuthStateChange(listener: (event: string, current: Session | null) => void) {
      listeners.add(listener);
      setTimeout(() => listener('INITIAL_SESSION', session), 0);
      return { data: { subscription: { unsubscribe: () => listeners.delete(listener) } } };
    },
    async signInWithPassword({ email }: { email: string; password: string }) {
      const role = mockRoleFromEmail(email);
      window.sessionStorage.setItem(mockRoleKey, role);
      window.sessionStorage.removeItem(mockSignedOutKey);
      session = sessionOf(role);
      emit('SIGNED_IN');
      return { data: { session, user: session?.user ?? null }, error: null };
    },
    async signOut() {
      window.sessionStorage.removeItem(mockRoleKey);
      window.sessionStorage.setItem(mockSignedOutKey, '1');
      session = null;
      emit('SIGNED_OUT');
      return { error: null };
    },
    async resetPasswordForEmail() { return { data: {}, error: null }; },
    async updateUser() { return { data: { user: session?.user ?? null }, error: null }; },
  };
  return { auth } as unknown as AuthClient;
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
  /** Incrément « Parcours » : langue étudiée (élève), professeur référent et profil du professeur. */
  languageId?: string | null;
  teacherId?: string | null;
  teacherProfile?: TeacherProfile | null;
}

/** Profil v2 (GET /me, PUT /me/language, PUT /me/teacher-profile) : les champs de l'incrément valent null s'ils manquent. */
export type ProfileV2 = Profile & Pick<CurrentProfileV2, 'languageId' | 'teacherId' | 'teacherProfile'>;

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
  if (isMockMode) {
    const { mockRequest } = await import('./mock-api');
    return mockRequest<T>(path, token, options);
  }
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

const levelSet = new Set<string>(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']);
const nullableString = (value: unknown) => (typeof value === 'string' ? value : null);
const strings = (value: unknown) => (Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []);

function parseTeacherProfile(value: unknown): TeacherProfile | null {
  if (typeof value !== 'object' || value === null) return null;
  const data = value as Record<string, unknown>;
  const delay = data.gradingDelayHours;
  return {
    languages: strings(data.languages),
    levels: strings(data.levels).filter((code): code is LevelCode => levelSet.has(code)),
    maxLearners: typeof data.maxLearners === 'number' ? data.maxLearners : null,
    gradingDelayHours: delay === 24 || delay === 48 || delay === 72 || delay === 168 ? delay : null,
    acceptingNewStudents: typeof data.acceptingNewStudents === 'boolean' ? data.acceptingNewStudents : null,
    courseCreationMode: data.courseCreationMode === 'self' || data.courseCreationMode === 'linguacap' ? data.courseCreationMode : null,
    bio: typeof data.bio === 'string' ? data.bio : '',
    onboardedAt: nullableString(data.onboardedAt),
  };
}

/** Lit un profil renvoyé par Identités (GET /me, PUT /me/language, PUT /me/teacher-profile). */
export function parseProfile(result: unknown): ProfileV2 {
  if (typeof result === 'object' && result !== null && 'id' in result &&
      typeof result.id === 'string' && 'displayName' in result && typeof result.displayName === 'string' &&
      'role' in result && typeof result.role === 'string' && roles.has(result.role)) {
    const data = result as Record<string, unknown>;
    // Une passerelle antérieure à l'incrément 2 ne renvoie pas les permissions ; antérieure aux parcours, ni la langue ni le profil.
    return {
      id: result.id, displayName: result.displayName, role: result.role as AccountRole,
      permissions: strings(data.permissions).filter((item): item is Permission => permissions.has(item)),
      languageId: nullableString(data.languageId), teacherId: nullableString(data.teacherId),
      teacherProfile: parseTeacherProfile(data.teacherProfile),
    };
  }
  throw new Error('Le profil renvoyé par Identités ne correspond pas au contrat attendu.');
}

export async function fetchProfile(token: string): Promise<ProfileV2> {
  return parseProfile(await requestApi('/me', token));
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
