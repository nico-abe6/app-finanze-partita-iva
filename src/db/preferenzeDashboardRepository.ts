/**
 * preferenzeDashboardRepository.ts
 * Lettura e scrittura dei widget scelti nella pagina Riepilogo
 * (tabella "preferenze_dashboard", creata da database/migrations/002_preferenze_dashboard.sql).
 * Così la stessa disposizione compare su telefono e PC.
 */

import { normalizzaWidget } from '../domain/dashboard';
import type { WidgetDashboard } from '../types/dashboard';
import { supabase } from './clienteSupabase';
import { leggiIdUtenteCollegato } from './utente';

const NOME_TABELLA = 'preferenze_dashboard';

/** Widget salvati, oppure null se l'utente non ha mai personalizzato la pagina */
export async function leggiWidgetDashboard(): Promise<WidgetDashboard[] | null> {
  const { data, error } = await supabase.from(NOME_TABELLA).select('widget').maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return normalizzaWidget((data as { widget: unknown }).widget);
}

/** Salva l'elenco completo dei widget, nell'ordine di visualizzazione */
export async function salvaWidgetDashboard(widget: WidgetDashboard[]): Promise<void> {
  const idUtente = await leggiIdUtenteCollegato();
  const { error } = await supabase
    .from(NOME_TABELLA)
    .upsert(
      { user_id: idUtente, widget, aggiornato_il: new Date().toISOString() },
      { onConflict: 'user_id' }
    );
  if (error) throw error;
}
