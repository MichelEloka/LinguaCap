export const isApiMode = import.meta.env.VITE_LINGUACAP_MODE === 'api' || import.meta.env.MODE === 'integration';
export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim() ?? '';
export const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim() ?? '';
export const apiBase = '/api/v1';

// Paramètres d'un lien Supabase (invitation, récupération) lus au chargement, avant que le client Auth ne nettoie l'adresse.
const initialUrl = typeof window === 'undefined' ? null : new URL(window.location.href);
export const authLinkParams = new URLSearchParams([
  ...(initialUrl ? new URLSearchParams(initialUrl.search) : []),
  ...(initialUrl ? new URLSearchParams(initialUrl.hash.replace(/^#/, '')) : []),
]);
