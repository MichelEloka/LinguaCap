import { createClient } from '@supabase/supabase-js';
import { apiBase, isApiMode, supabaseKey, supabaseUrl } from '../app/config';
import type { Role } from '../domain/types';

function createAuthClient() {
  if (!isApiMode || !supabaseUrl || !supabaseKey) return null;
  try {
    return createClient(supabaseUrl, supabaseKey);
  } catch {
    return null;
  }
}

export const supabase = createAuthClient();

export interface Profile {
  id: string;
  displayName: string;
  role: Role;
}

const roles = new Set(['learner', 'teacher', 'admin']);

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
    return result as Profile;
  }
  throw new Error('Le profil renvoyé par Identités ne correspond pas au contrat attendu.');
}
