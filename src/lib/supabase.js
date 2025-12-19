import { createClient } from '@supabase/supabase-js';

// Wir holen die Variablen
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// --- DEBUGGING (Das siehst du in der Browser-Konsole mit F12) ---
console.log("--- SUPABASE CHECK ---");
console.log("URL:", supabaseUrl ? "✅ Vorhanden" : "❌ FEHLT (undefined)");
console.log("KEY:", supabaseKey ? "✅ Vorhanden" : "❌ FEHLT (undefined)");

// Falls sie fehlen, geben wir einen Hinweis aus, statt hart abzustürzen
if (!supabaseUrl || !supabaseKey) {
  console.error("ACHTUNG: Umgebungsvariablen fehlen auf Vercel!");
  console.error("Prüfe Settings -> Environment Variables");
}

// Wir erstellen den Client trotzdem (verhindert den 'Uncaught Error' Absturz beim Laden)
// Wenn die Daten fehlen, funktioniert die Datenbank halt nicht, aber die Seite lädt.
export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co", 
  supabaseKey || "placeholder-key"
);