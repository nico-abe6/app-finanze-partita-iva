/**
 * impostazioniFiscaliRepository.ts
 * Lettura della tabella "impostazioni_fiscali" (una riga per utente).
 * Se l'utente non ha ancora salvato impostazioni, restituisce i valori predefiniti.
 * Il salvataggio arriverà con la pagina Impostazioni (Fase 8).
 */

import { IMPOSTAZIONI_FISCALI_PREDEFINITE } from '../config/impostazioniPredefinite';
import type { ImpostazioniFiscali, ModalitaCalcoloImposta } from '../types/fiscale';
import { supabase } from './clienteSupabase';

type RigaImpostazioniDb = {
  aliquota_imposta_sostitutiva: number | string;
  coefficiente_redditivita: number | string;
  modalita_calcolo: ModalitaCalcoloImposta;
  aliquota_contributi_inps: number | string;
};

export async function leggiImpostazioniFiscali(): Promise<ImpostazioniFiscali> {
  const { data, error } = await supabase
    .from('impostazioni_fiscali')
    .select('aliquota_imposta_sostitutiva, coefficiente_redditivita, modalita_calcolo, aliquota_contributi_inps')
    .maybeSingle();
  if (error) throw error;
  if (!data) return IMPOSTAZIONI_FISCALI_PREDEFINITE;

  const riga = data as RigaImpostazioniDb;
  return {
    aliquotaImpostaSostitutiva: Number(riga.aliquota_imposta_sostitutiva),
    coefficienteRedditivita: Number(riga.coefficiente_redditivita),
    modalitaCalcolo: riga.modalita_calcolo,
    aliquotaContributiInps: Number(riga.aliquota_contributi_inps),
  };
}
