/**
 * calcoloFiscale.ts
 * Funzioni pure per il calcolo del regime forfettario.
 * "Pure" significa: ricevono dati, restituiscono un risultato,
 * non leggono né scrivono database o interfaccia.
 * Tutti gli importi sono in centesimi di euro (numeri interi).
 */

import type {
  FatturatoMensile,
  ImpostazioniFiscali,
  RiepilogoFiscale,
  TotaliPeriodo,
} from '../types/fiscale';

/**
 * Calcola reddito, base imponibile, imposta, INPS stimato e netto
 * per un periodo (un mese, un anno o tutto lo storico).
 * Il valore che fa fede ai fini fiscali è quello calcolato sull'anno intero.
 */
export function calcolaRiepilogoFiscale(
  totali: TotaliPeriodo,
  impostazioni: ImpostazioniFiscali
): RiepilogoFiscale {
  // Parte del fatturato considerata reddito (es. 78%)
  const redditoLordoCentesimi = Math.round(
    totali.incassatoCentesimi * impostazioni.coefficienteRedditivita
  );

  // Stima dei contributi INPS da accantonare, calcolata sul reddito lordo
  const contributiInpsStimatiCentesimi = Math.round(
    redditoLordoCentesimi * impostazioni.aliquotaContributiInps
  );

  // In modalità "netto_inps" si toglie dal reddito la stima dei contributi INPS
  // (calcolata in automatico); in "prudente" non si toglie nulla
  const deduzioneCentesimi =
    impostazioni.modalitaCalcolo === 'netto_inps' ? contributiInpsStimatiCentesimi : 0;

  // La base imponibile non può essere negativa
  const baseImponibileCentesimi = Math.max(0, redditoLordoCentesimi - deduzioneCentesimi);

  const impostaSostitutivaCentesimi = Math.round(
    baseImponibileCentesimi * impostazioni.aliquotaImpostaSostitutiva
  );

  const nettoStimatoCentesimi =
    totali.incassatoCentesimi - impostaSostitutivaCentesimi - contributiInpsStimatiCentesimi;

  return {
    incassatoCentesimi: totali.incassatoCentesimi,
    redditoLordoCentesimi,
    baseImponibileCentesimi,
    impostaSostitutivaCentesimi,
    contributiInpsStimatiCentesimi,
    nettoStimatoCentesimi,
  };
}

/**
 * Somma incassato e contributi versati di una lista di mesi.
 * Con una lista vuota restituisce tutto a zero.
 */
export function sommaFatturatoMensile(righe: FatturatoMensile[]): TotaliPeriodo {
  const totali: TotaliPeriodo = {
    incassatoCentesimi: 0,
    contributiInpsVersatiCentesimi: 0,
  };

  for (const riga of righe) {
    totali.incassatoCentesimi += riga.incassatoCentesimi;
    totali.contributiInpsVersatiCentesimi += riga.contributiInpsVersatiCentesimi;
  }

  return totali;
}