/**
 * fatturatoMensileRepository.ts
 * Lettura e scrittura della tabella "fatturato_mensile" su Supabase.
 * Converte i nomi delle colonne (snake_case nel database) nei campi
 * dei tipi TypeScript (camelCase) e viceversa.
 */

import type { FatturatoMensile } from '../types/fiscale';
import { supabase } from './clienteSupabase';
import { leggiIdUtenteCollegato } from './utente';

const NOME_TABELLA = 'fatturato_mensile';
const COLONNE = 'id, anno, mese, incassato_centesimi, contributi_inps_versati_centesimi, note';

/** Forma di una riga così come arriva dal database */
type RigaFatturatoDb = {
  id: string;
  anno: number;
  mese: number;
  incassato_centesimi: number | string;
  contributi_inps_versati_centesimi: number | string;
  note: string | null;
};

function daRigaDb(riga: RigaFatturatoDb): FatturatoMensile {
  return {
    id: riga.id,
    anno: Number(riga.anno),
    mese: Number(riga.mese),
    incassatoCentesimi: Number(riga.incassato_centesimi),
    contributiInpsVersatiCentesimi: Number(riga.contributi_inps_versati_centesimi),
    note: riga.note ?? undefined,
  };
}

/** Tutti i mesi inseriti, ordinati per anno e mese */
export async function leggiFatturatoMensile(): Promise<FatturatoMensile[]> {
  const { data, error } = await supabase
    .from(NOME_TABELLA)
    .select(COLONNE)
    .order('anno', { ascending: true })
    .order('mese', { ascending: true });
  if (error) throw error;
  return (data as RigaFatturatoDb[]).map(daRigaDb);
}

/** Inserisce i mesi o, se esistono già (stesso anno e mese), li aggiorna */
export async function salvaFatturatiMensili(righe: FatturatoMensile[]): Promise<void> {
  if (righe.length === 0) return;
  const idUtente = await leggiIdUtenteCollegato();
  const { error } = await supabase.from(NOME_TABELLA).upsert(
    righe.map((riga) => ({
      user_id: idUtente,
      anno: riga.anno,
      mese: riga.mese,
      incassato_centesimi: riga.incassatoCentesimi,
      contributi_inps_versati_centesimi: riga.contributiInpsVersatiCentesimi,
      note: riga.note?.trim() ? riga.note.trim() : null,
    })),
    { onConflict: 'user_id,anno,mese' }
  );
  if (error) throw error;
}

/** Inserisce il mese o, se esiste già (stesso anno e mese), lo aggiorna */
export async function salvaFatturatoMensile(riga: FatturatoMensile): Promise<void> {
  await salvaFatturatiMensili([riga]);
}

/** Cancella il mese indicato */
export async function eliminaFatturatoMensile(anno: number, mese: number): Promise<void> {
  const { error } = await supabase.from(NOME_TABELLA).delete().eq('anno', anno).eq('mese', mese);
  if (error) throw error;
}
