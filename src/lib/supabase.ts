import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Cliente de Supabase. Se activa solo si están definidas las variables de
// entorno VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY (en el build). Si no,
// la app funciona en modo demo (datos locales), sin tocar nada.
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseEnabled = Boolean(url && anonKey);

export const supabase: SupabaseClient | null = isSupabaseEnabled
  ? createClient(url!, anonKey!)
  : null;
