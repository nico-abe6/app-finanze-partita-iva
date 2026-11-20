/**
 * utente.ts
 * Restituisce l'id dell'utente collegato, necessario per i salvataggi "upsert"
 * (inserisci o aggiorna) sulle tabelle che hanno user_id nella chiave.
 */

import { supabase } from './clienteSupabase';

export async function leggiIdUtenteCollegato(): Promise<string> {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  const idUtente = data.session?.user.id;
  if (!idUtente) throw new Error('Nessun utente collegato: rifai il login.');
  return idUtente;
}
