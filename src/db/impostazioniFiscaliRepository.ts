/**
 * impostazioniFiscaliRepository.ts
 * Lettura e scrittura della tabella "impostazioni_fiscali" (una riga per utente).
 * Se l'utente non ha ancora salvato impostazioni, l'app usa i valori predefiniti.
 */

import { IMPOSTAZIONI_FISCALI_PREDEFINITE } from '../config/impostazioniPredefinite';
import type { ImpostazioniFiscali, ModalitaCalcoloImposta } from '../types/fiscale';
import { supabase } from './clienteSupabase';
import { leggiIdUtenteCollegato } from './utente';

const NOME_TABELLA = 'impostazioni_fiscali';

type RigaImpostazioniDb = {
  aliquota_imposta_sostitutiva: number | string;
  coefficiente_redditivita: number | string;
  modalita_calcolo: ModalitaCalcoloImposta;
  aliquota_contributi_inps: number | string;
};

/** Impostazioni salvate dall'utente, oppure null se non ne ha mai salvate */
export async function leggiImpostazioniFiscaliSalvate(): Promise<ImpostazioniFiscali | null> {
  const { data, error } = await supabase
    .from(NOME_TABELLA)
    .select('aliquota_imposta_sostitutiva, coefficiente_redditivita, modalita_calcolo, aliquota_contributi_inps')
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;

  const riga = data as RigaImpostazioniDb;
  return {
    aliquotaImpostaSostitutiva: Number(riga.aliquota_imposta_sostitutiva),
    coefficienteRedditivita: Number(riga.coefficiente_redditivita),
    modalitaCalcolo: riga.modalita_calcolo,
    aliquotaContributiInps: Number(riga.aliquota_contributi_inps),
  };
}

/** Impostazioni da usare nei calcoli: quelle salvate o, se mancano, le predefinite */
export async function leggiImpostazioniFiscali(): Promise<ImpostazioniFiscali> {
  return (await leggiImpostazioniFiscaliSalvate()) ?? IMPOSTAZIONI_FISCALI_PREDEFINITE;
}

export async function salvaImpostazioniFiscali(impostazioni: ImpostazioniFiscali): Promise<void> {
  const idUtente = await leggiIdUtenteCollegato();
  const { error } = await supabase.from(NOME_TABELLA).upsert(
    {
      user_id: idUtente,
      aliquota_imposta_sostitutiva: impostazioni.aliquotaImpostaSostitutiva,
      coefficiente_redditivita: impostazioni.coefficienteRedditivita,
      modalita_calcolo: impostazioni.modalitaCalcolo,
      aliquota_contributi_inps: impostazioni.aliquotaContributiInps,
    },
    { onConflict: 'user_id' }
  );
  if (error) throw error;
}
