/**
 * impostazioniPredefinite.ts
 * Valori fiscali di partenza, usati al primo avvio dell'app
 * o quando l'utente sceglie "ripristina predefiniti".
 * Si possono modificare dalla pagina Impostazioni.
 */

import type { ImpostazioniFiscali } from '../types/fiscale';

export const IMPOSTAZIONI_FISCALI_PREDEFINITE: ImpostazioniFiscali = {
  aliquotaImpostaSostitutiva: 0.05,   // 5% (aliquota startup, primi 5 anni)
  coefficienteRedditivita: 0.78,      // dipende dal tuo codice ATECO
  modalitaCalcolo: 'prudente',        // oppure 'netto_inps'
  aliquotaContributiInps: 0.2607,     // stima, da verificare per la tua posizione
};