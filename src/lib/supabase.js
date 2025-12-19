import { createClient } from '@supabase/supabase-js';

// Vite lädt die Variablen automatisch aus der .env Datei
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase URL oder Key fehlt! Überprüfe deine .env Datei.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);