import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Verifica che le variabili d'ambiente siano disponibili lato client
if (!supabaseUrl || !supabaseAnonKey) {
  // Solo in ambiente di sviluppo per debug
  if (process.env.NODE_ENV !== 'production') {
    console.warn(
      'Supabase URL e chiave anonima devono essere disponibili come variabili d\'ambiente. ' +
      'Controlla il file .env.local'
    );
  }
}

// Client con chiave anonima per operazioni dal lato client
export const supabase = createClient<Database>(
  supabaseUrl || '',  // Fallback a stringa vuota invece di causare un errore
  supabaseAnonKey || ''
);

// Client con service role key per operazioni dal lato server (API routes)
// Questa variabile è disponibile solo lato server
export const createAdminClient = () => {
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseServiceKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for admin operations');
  }
  return createClient<Database>(supabaseUrl || '', supabaseServiceKey);
};