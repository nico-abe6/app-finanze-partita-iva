/**
 * movimenti.ts
 * Funzioni pure per conti e movimenti: saldi, filtri per periodo, somme di entrate,
 * uscite, risparmi e investimenti, spese per priorità e per etichetta.
 *
 * Effetto di ogni tipo di movimento sui saldi:
 * - entrata: + sul conto
 * - uscita: − sul conto
 * - trasferimento, risparmio, investimento: − sul conto di origine,
 *   + sul conto di destinazione (se indicato)
 */

import type { Conto, Movimento, RiepilogoFlussi, TipoSpesa } from '../types/finanze';

const MESI_DELL_ANNO = 12;

/** Anno e mese di un movimento, letti dalla data "AAAA-MM-GG" */
export function annoMeseDiMovimento(movimento: Movimento): { anno: number; mese: number } {
  return { anno: Number(movimento.data.slice(0, 4)), mese: Number(movimento.data.slice(5, 7)) };
}

/** Movimenti di un anno, o di un solo mese se indicato */
export function filtraMovimentiPerPeriodo(movimenti: Movimento[], anno: number, mese?: number): Movimento[] {
  return movimenti.filter((movimento) => {
    const periodo = annoMeseDiMovimento(movimento);
    return periodo.anno === anno && (mese === undefined || periodo.mese === mese);
  });
}

/** Anni in cui ci sono movimenti, in ordine crescente */
export function elencaAnniConMovimenti(movimenti: Movimento[]): number[] {
  return [...new Set(movimenti.map((movimento) => annoMeseDiMovimento(movimento).anno))].sort((a, b) => a - b);
}

/** Variazioni di saldo prodotte da un movimento sui conti coinvolti */
export function variazioniSaldo(movimento: Movimento): { contoId: string; variazioneCentesimi: number }[] {
  if (movimento.tipo === 'entrata') {
    return [{ contoId: movimento.contoId, variazioneCentesimi: movimento.importoCentesimi }];
  }
  const variazioni = [{ contoId: movimento.contoId, variazioneCentesimi: -movimento.importoCentesimi }];
  if (movimento.tipo !== 'uscita' && movimento.contoDestinazioneId) {
    variazioni.push({ contoId: movimento.contoDestinazioneId, variazioneCentesimi: movimento.importoCentesimi });
  }
  return variazioni;
}

/** Saldo attuale di ogni conto: saldo iniziale + effetto di tutti i movimenti */
export function calcolaSaldiConti(conti: Conto[], movimenti: Movimento[]): Map<string, number> {
  const saldi = new Map<string, number>();
  for (const conto of conti) {
    if (conto.id) saldi.set(conto.id, conto.saldoInizialeCentesimi);
  }
  for (const movimento of movimenti) {
    for (const { contoId, variazioneCentesimi } of variazioniSaldo(movimento)) {
      if (saldi.has(contoId)) saldi.set(contoId, (saldi.get(contoId) ?? 0) + variazioneCentesimi);
    }
  }
  return saldi;
}

/** Somme di entrate, uscite, risparmi e investimenti (i trasferimenti non contano) */
export function calcolaRiepilogoFlussi(movimenti: Movimento[]): RiepilogoFlussi {
  const riepilogo = { entrateCentesimi: 0, usciteCentesimi: 0, risparmiatoCentesimi: 0, investitoCentesimi: 0 };
  for (const movimento of movimenti) {
    if (movimento.tipo === 'entrata') riepilogo.entrateCentesimi += movimento.importoCentesimi;
    if (movimento.tipo === 'uscita') riepilogo.usciteCentesimi += movimento.importoCentesimi;
    if (movimento.tipo === 'risparmio') riepilogo.risparmiatoCentesimi += movimento.importoCentesimi;
    if (movimento.tipo === 'investimento') riepilogo.investitoCentesimi += movimento.importoCentesimi;
  }
  const accantonato = riepilogo.risparmiatoCentesimi + riepilogo.investitoCentesimi;
  return {
    ...riepilogo,
    tassoRisparmio: riepilogo.entrateCentesimi > 0 ? accantonato / riepilogo.entrateCentesimi : null,
  };
}

/** Riepilogo dei flussi per ciascuno dei 12 mesi di un anno */
export function calcolaFlussiMensili(
  movimenti: Movimento[],
  anno: number
): { mese: number; flussi: RiepilogoFlussi }[] {
  const risultato = [];
  for (let mese = 1; mese <= MESI_DELL_ANNO; mese++) {
    risultato.push({ mese, flussi: calcolaRiepilogoFlussi(filtraMovimentiPerPeriodo(movimenti, anno, mese)) });
  }
  return risultato;
}

export type ChiavePriorita = TipoSpesa | 'non_indicata';

/** Totale delle uscite per priorità (Devo, Ho bisogno, Voglio, non indicata) */
export function calcolaSpesePerPriorita(movimenti: Movimento[]): Record<ChiavePriorita, number> {
  const totali: Record<ChiavePriorita, number> = { devo: 0, ho_bisogno: 0, voglio: 0, non_indicata: 0 };
  for (const movimento of movimenti) {
    if (movimento.tipo !== 'uscita') continue;
    totali[movimento.priorita ?? 'non_indicata'] += movimento.importoCentesimi;
  }
  return totali;
}

export const ETICHETTA_SENZA = 'senza etichetta';
export const ETICHETTA_ALTRE = 'altre';

/**
 * Totale delle uscite per etichetta, dalla più alta alla più bassa.
 * Una spesa con più etichette conta per intero in ciascuna.
 * Oltre "massimo" voci, le restanti sono sommate in "altre".
 */
export function calcolaSpesePerEtichetta(
  movimenti: Movimento[],
  massimo: number
): { etichetta: string; importoCentesimi: number }[] {
  const totali = new Map<string, number>();
  for (const movimento of movimenti) {
    if (movimento.tipo !== 'uscita') continue;
    const etichette = movimento.etichette.length > 0 ? movimento.etichette : [ETICHETTA_SENZA];
    for (const etichetta of etichette) {
      totali.set(etichetta, (totali.get(etichetta) ?? 0) + movimento.importoCentesimi);
    }
  }
  const ordinate = [...totali.entries()]
    .map(([etichetta, importoCentesimi]) => ({ etichetta, importoCentesimi }))
    .sort((a, b) => b.importoCentesimi - a.importoCentesimi || a.etichetta.localeCompare(b.etichetta));

  if (ordinate.length <= massimo) return ordinate;
  const resto = ordinate.slice(massimo - 1).reduce((somma, voce) => somma + voce.importoCentesimi, 0);
  return [...ordinate.slice(0, massimo - 1), { etichetta: ETICHETTA_ALTRE, importoCentesimi: resto }];
}

/** Forma standard di un'etichetta: minuscola, senza spazi in eccesso */
export function normalizzaEtichetta(testo: string): string {
  return testo.trim().replace(/\s+/g, ' ').toLowerCase();
}

/** Tutte le etichette usate, in ordine alfabetico (per i suggerimenti) */
export function elencaEtichette(movimenti: Movimento[]): string[] {
  return [...new Set(movimenti.flatMap((movimento) => movimento.etichette))].sort((a, b) => a.localeCompare(b));
}

/** Movimenti dal più recente al più vecchio */
export function ordinaMovimentiPerDataDecrescente(movimenti: Movimento[]): Movimento[] {
  return [...movimenti].sort((a, b) => b.data.localeCompare(a.data));
}
