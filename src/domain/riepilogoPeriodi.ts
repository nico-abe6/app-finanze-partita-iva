/**
 * riepilogoPeriodi.ts
 * Funzioni pure che raggruppano il fatturato per mese, per anno e per tutto lo storico
 * e ne calcolano il riepilogo fiscale con calcolaRiepilogoFiscale.
 * Regola: le imposte si calcolano anno per anno; il totale dall'inizio
 * è la somma dei riepiloghi annuali (non un calcolo unico su tutto l'incassato).
 */

import type {
  FatturatoMensile,
  ImpostazioniFiscali,
  RiepilogoAnno,
  RiepilogoFiscale,
  RiepilogoMese,
} from '../types/fiscale';
import { calcolaRiepilogoFiscale, sommaFatturatoMensile } from './calcoloFiscale';

const MESI_DELL_ANNO = 12;

/** Anni presenti nei dati, in ordine crescente e senza doppioni */
export function elencaAnniConDati(righe: FatturatoMensile[]): number[] {
  return [...new Set(righe.map((riga) => riga.anno))].sort((a, b) => a - b);
}

/** Righe di un solo anno */
export function filtraPerAnno(righe: FatturatoMensile[], anno: number): FatturatoMensile[] {
  return righe.filter((riga) => riga.anno === anno);
}

/** Riepilogo di un anno intero: è il valore fiscale che fa fede */
export function calcolaRiepilogoAnno(
  righe: FatturatoMensile[],
  impostazioni: ImpostazioniFiscali,
  anno: number
): RiepilogoFiscale {
  return calcolaRiepilogoFiscale(sommaFatturatoMensile(filtraPerAnno(righe, anno)), impostazioni);
}

/** I 12 mesi di un anno; i mesi non inseriti hanno haDati = false e importi a zero */
export function calcolaRiepilogoMesi(
  righe: FatturatoMensile[],
  impostazioni: ImpostazioniFiscali,
  anno: number
): RiepilogoMese[] {
  const righeAnno = filtraPerAnno(righe, anno);
  const risultato: RiepilogoMese[] = [];

  for (let mese = 1; mese <= MESI_DELL_ANNO; mese++) {
    const righeMese = righeAnno.filter((riga) => riga.mese === mese);
    risultato.push({
      mese,
      haDati: righeMese.length > 0,
      riepilogo: calcolaRiepilogoFiscale(sommaFatturatoMensile(righeMese), impostazioni),
    });
  }
  return risultato;
}

/** Riepilogo di ogni anno presente nei dati, in ordine crescente */
export function calcolaRiepilogoAnni(
  righe: FatturatoMensile[],
  impostazioni: ImpostazioniFiscali
): RiepilogoAnno[] {
  return elencaAnniConDati(righe).map((anno) => ({
    anno,
    riepilogo: calcolaRiepilogoAnno(righe, impostazioni, anno),
  }));
}

/** Somma campo per campo più riepiloghi (lista vuota: tutto a zero) */
export function sommaRiepiloghi(riepiloghi: RiepilogoFiscale[]): RiepilogoFiscale {
  const totale: RiepilogoFiscale = {
    incassatoCentesimi: 0,
    redditoLordoCentesimi: 0,
    baseImponibileCentesimi: 0,
    impostaSostitutivaCentesimi: 0,
    contributiInpsStimatiCentesimi: 0,
    nettoStimatoCentesimi: 0,
  };
  for (const riepilogo of riepiloghi) {
    totale.incassatoCentesimi += riepilogo.incassatoCentesimi;
    totale.redditoLordoCentesimi += riepilogo.redditoLordoCentesimi;
    totale.baseImponibileCentesimi += riepilogo.baseImponibileCentesimi;
    totale.impostaSostitutivaCentesimi += riepilogo.impostaSostitutivaCentesimi;
    totale.contributiInpsStimatiCentesimi += riepilogo.contributiInpsStimatiCentesimi;
    totale.nettoStimatoCentesimi += riepilogo.nettoStimatoCentesimi;
  }
  return totale;
}

/** Totale dall'inizio: somma dei riepiloghi annuali */
export function calcolaRiepilogoTotale(
  righe: FatturatoMensile[],
  impostazioni: ImpostazioniFiscali
): RiepilogoFiscale {
  return sommaRiepiloghi(calcolaRiepilogoAnni(righe, impostazioni).map((voce) => voce.riepilogo));
}

/** Valori progressivi mese per mese (incassato e netto accumulati da gennaio) */
export function calcolaCumulatoMesi(
  mesi: RiepilogoMese[]
): { mese: number; incassatoCumulatoCentesimi: number; nettoCumulatoCentesimi: number }[] {
  let incassato = 0;
  let netto = 0;
  return mesi.map((voce) => {
    incassato += voce.riepilogo.incassatoCentesimi;
    netto += voce.riepilogo.nettoStimatoCentesimi;
    return { mese: voce.mese, incassatoCumulatoCentesimi: incassato, nettoCumulatoCentesimi: netto };
  });
}
