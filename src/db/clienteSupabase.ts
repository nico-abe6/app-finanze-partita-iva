/**
 * clienteSupabase.ts
 * Crea e esporta l'unico client Supabase usato da tutta l'app.
 * URL e chiave pubblica (publishable) vengono letti da .env.local,
 * così non sono scritti nel codice.
 * Non usare mai qui la secret key: questo file finisce nel browser.
 */

import { createClient } from '@supabase/supabase-js';

const urlSupabase = import.meta.env.VITE_SUPABASE_URL;
const chiavePubblicaSupabase = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!urlSupabase || !chiavePubblicaSupabase) {
  throw new Error(
    'Configurazione Supabase mancante: aggiungi VITE_SUPABASE_URL e ' +
      'VITE_SUPABASE_PUBLISHABLE_KEY nel file .env.local e riavvia "npm run dev".'
  );
}

export const supabase = createClient(urlSupabase, chiavePubblicaSupabase);