/**
 * movimentiRepository.ts
 * Lettura e scrittura della tabella "movimenti" su Supabase (mapping snake_case <-> camelCase).
 */

import type { Movimento, TipoMovimento, TipoSpesa } from '../types/finanze';
import { supabase } from './clienteSupabase';
import { leggiIdUtenteCollegato } from './utente';

const NOME_TABELLA = 'movimenti';
const DIMENSIONE_PAGINA = 1000; // Supabase restituisce al massimo 1000 righe per richiesta

type RigaMovimentoDb = {
  id: string;
  tipo: TipoMovimento;
  conto_id: string;
  conto_destinazione_id: string | null;
  data: string;
  importo_centesimi: number | string;
  etichette: string[] | null;
  priorita: TipoSpesa | null;
  descrizione: string | null;
};

function daRigaDb(riga: RigaMovimentoDb): Movimento {
  return {
    id: riga.id,
    tipo: riga.tipo,
    contoId: riga.conto_id,
    contoDestinazioneId: riga.conto_destinazione_id ?? undefined,
    data: riga.data,
    importoCentesimi: Number(riga.importo_centesimi),
    etichette: riga.etichette ?? [],
    priorita: riga.priorita ?? undefined,
    descrizione: riga.descrizione ?? undefined,
  };
}

/** Tutti i movimenti, dal più recente (lette a pagine da 1000) */
export async function leggiMovimenti(): Promise<Movimento[]> {
  const risultato: Movimento[] = [];
  for (let inizio = 0; ; inizio += DIMENSIONE_PAGINA) {
    const { data, error } = await supabase
      .from(NOME_TABELLA)
      .select('id, tipo, conto_id, conto_destinazione_id, data, importo_centesimi, etichette, priorita, descrizione')
      .order('data', { ascending: false })
      .order('id', { ascending: true })
      .range(inizio, inizio + DIMENSIONE_PAGINA - 1);
    if (error) throw error;
    risultato.push(...(data as RigaMovimentoDb[]).map(daRigaDb));
    if (data.length < DIMENSIONE_PAGINA) return risultato;
  }
}

/** Salva più movimenti: crea quelli senza id, aggiorna gli altri */
export async function salvaMovimenti(movimenti: Movimento[]): Promise<void> {
  if (movimenti.length === 0) return;
  const idUtente = await leggiIdUtenteCollegato();
  const righe = movimenti.map((movimento) => ({
    ...(movimento.id ? { id: movimento.id } : {}),
    user_id: idUtente,
    tipo: movimento.tipo,
    conto_id: movimento.contoId,
    conto_destinazione_id: movimento.tipo === 'entrata' || movimento.tipo === 'uscita' ? null : movimento.contoDestinazioneId ?? null,
    data: movimento.data,
    importo_centesimi: movimento.importoCentesimi,
    etichette: movimento.etichette,
    priorita: movimento.tipo === 'uscita' ? movimento.priorita ?? null : null,
    descrizione: movimento.descrizione?.trim() ? movimento.descrizione.trim() : null,
  }));
  const { error } = await supabase.from(NOME_TABELLA).upsert(righe, { onConflict: 'id', defaultToNull: false });
  if (error) throw error;
}

/** Salva un movimento (nuovo o esistente) */
export async function salvaMovimento(movimento: Movimento): Promise<void> {
  await salvaMovimenti([movimento]);
}

export async function eliminaMovimento(id: string): Promise<void> {
  const { error } = await supabase.from(NOME_TABELLA).delete().eq('id', id);
  if (error) throw error;
}
