/**
 * numeri.ts
 * Lettura e scrittura di numeri decimali e percentuali nei campi dei form,
 * con la virgola o il punto come separatore decimale.
 */

import { LOCALE_IMPORTI } from '../config/formatoImporti';

/**
 * Trasforma un testo come "26,07" o "26.07" in numero (26.07).
 * Restituisce null se il testo non è un numero valido o ha più decimali di quelli ammessi.
 */
export function convertiTestoInNumero(testo: string, decimaliMassimi: number): number | null {
  const pulito = testo.replace(/\s/g, '').replace(',', '.');
  const formato = new RegExp(`^\\d+(\\.\\d{1,${decimaliMassimi}})?$`);
  if (!formato.test(pulito)) return null;
  return Number(pulito);
}

/** Da frazione (0.2607) a testo percentuale per un campo ("26,07") */
export function frazioneInTestoPercentuale(frazione: number): string {
  return new Intl.NumberFormat(LOCALE_IMPORTI, { maximumFractionDigits: 2, useGrouping: false }).format(
    Math.round(frazione * 10000) / 100
  );
}

/** Da testo percentuale ("26,07") a frazione (0.2607); null se non valido o fuori da 0-100 */
export function testoPercentualeInFrazione(testo: string): number | null {
  const percentuale = convertiTestoInNumero(testo.replace('%', ''), 2);
  if (percentuale === null || percentuale > 100) return null;
  return Math.round(percentuale * 100) / 10000;
}

/** Percentuale leggibile, es. 0.2607 -> "26,07%" */
export function formattaPercentuale(frazione: number): string {
  return new Intl.NumberFormat(LOCALE_IMPORTI, { style: 'percent', maximumFractionDigits: 2 }).format(frazione);
}
