export const isApiMode = import.meta.env.VITE_LINGUACAP_MODE === 'api' || import.meta.env.MODE === 'integration';
export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim() ?? '';
export const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim() ?? '';
export const apiBase = '/api/v1';
