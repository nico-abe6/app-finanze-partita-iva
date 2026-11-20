/**
 * contiRepository.ts
 * Lettura e scrittura della tabella "conti" su Supabase (mapping snake_case <-> camelCase).
 */

import type { Conto, TipoConto } from '../types/finanze';
import { supabase } from './clienteSupabase';
import { leggiIdUtenteCollegato } from './utente';

const NOME_TABELLA = 'conti';

type RigaContoDb = {
  id: string;
  nome_conto: string;
  tipo_conto: TipoConto;
  saldo_iniziale_centesimi: number | string;
  colore: string | null;
};

function daRigaDb(riga: RigaContoDb): Conto {
  return {
    id: riga.id,
    nomeConto: riga.nome_conto,
    tipoConto: riga.tipo_conto,
    saldoInizialeCentesimi: Number(riga.saldo_iniziale_centesimi),
    colore: riga.colore ?? undefined,
  };
}

/** Tutti i conti in ordine alfabetico */
export async function leggiConti(): Promise<Conto[]> {
  const { data, error } = await supabase
    .from(NOME_TABELLA)
    .select('id, nome_conto, tipo_conto, saldo_iniziale_centesimi, colore')
    .order('nome_conto', { ascending: true });
  if (error) throw error;
  return (data as RigaContoDb[]).map(daRigaDb);
}

/** Salva più conti: crea quelli senza id, aggiorna gli altri */
export async function salvaConti(conti: Conto[]): Promise<void> {
  if (conti.length === 0) return;
  const idUtente = await leggiIdUtenteCollegato();
  const righe = conti.map((conto) => ({
    ...(conto.id ? { id: conto.id } : {}),
    user_id: idUtente,
    nome_conto: conto.nomeConto.trim(),
    tipo_conto: conto.tipoConto,
    saldo_iniziale_centesimi: conto.saldoInizialeCentesimi,
    colore: conto.colore ?? null,
  }));
  const { error } = await supabase.from(NOME_TABELLA).upsert(righe, { onConflict: 'id', defaultToNull: false });
  if (error) throw error;
}

/** Salva un conto (nuovo o esistente) */
export async function salvaConto(conto: Conto): Promise<void> {
  await salvaConti([conto]);
}

/** Elimina un conto; fallisce se ha ancora dei movimenti (vincolo del database) */
export async function eliminaConto(id: string): Promise<void> {
  const { error } = await supabase.from(NOME_TABELLA).delete().eq('id', id);
  if (error) {
    if (error.code === '23503') {
      throw new Error('Il conto ha ancora dei movimenti: eliminali o spostali prima di cancellare il conto.');
    }
    throw error;
  }
}
