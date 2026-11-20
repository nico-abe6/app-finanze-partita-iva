/**
 * importi.ts
 * Conversione tra importi in centesimi (come li salva l'app)
 * e testo leggibile (come li scrive e li vede l'utente).
 */

import { LOCALE_IMPORTI, VALUTA } from '../config/formatoImporti';

// Creato una sola volta e riutilizzato: è più veloce che crearlo a ogni chiamata
const formattatoreValuta = new Intl.NumberFormat(LOCALE_IMPORTI, {
  style: 'currency',
  currency: VALUTA,
  useGrouping: 'always', // in italiano senza questa opzione 1250 non avrebbe il punto delle migliaia
});

/**
 * Trasforma centesimi in testo, es. 125050 -> "1.250,50 €".
 */
export function formattaCentesimiInEuro(centesimi: number): string {
  return formattatoreValuta.format(centesimi / 100);
}

// Per i campi dei form: due decimali, separatore della lingua, senza migliaia né simbolo
const formattatoreCampo = new Intl.NumberFormat(LOCALE_IMPORTI, {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  useGrouping: false,
});

/**
 * Testo da mettere in un campo da modificare, es. 125050 -> "1250,50".
 * Il risultato è sempre rileggibile da convertiTestoInCentesimi.
 */
export function centesimiInTestoModificabile(centesimi: number): string {
  return formattatoreCampo.format(centesimi / 100);
}

// Per gli assi dei grafici: numeri interi, in forma compatta da 10 000 in su (12K, 2,5 Mln)
const formattatoreAssePieno = new Intl.NumberFormat(LOCALE_IMPORTI, {
  maximumFractionDigits: 0,
  useGrouping: 'always',
});
const formattatoreAsseCompatto = new Intl.NumberFormat(LOCALE_IMPORTI, {
  notation: 'compact',
  maximumFractionDigits: 1,
});
const SOGLIA_FORMA_COMPATTA = 10000;

/**
 * Etichetta per l'asse di un grafico, in euro senza simbolo (l'unità è nel titolo dell'asse).
 * Es. 2500 -> "2.500", 12000 -> "12K".
 */
export function formattaEuroPerAsse(euro: number): string {
  return Math.abs(euro) >= SOGLIA_FORMA_COMPATTA
    ? formattatoreAsseCompatto.format(euro)
    : formattatoreAssePieno.format(euro);
}

// Parte intera valida: solo cifre (1250) oppure gruppi da tre separati da punto (1.250.000)
const FORMATO_PARTE_INTERA = /^(\d+|\d{1,3}(\.\d{3})+)$/;
// Parte decimale valida: una o due cifre
const FORMATO_PARTE_DECIMALE = /^\d{1,2}$/;

/**
 * Trasforma il testo scritto dall'utente in centesimi.
 * Accetta: "1250,50", "1.250,50", "1250.50", "1.250", "€ 12,5".
 * Restituisce null se il testo non è un importo valido (vuoto, negativo, più di 2 decimali...).
 */
export function convertiTestoInCentesimi(testo: string): number | null {
  // Toglie simbolo dell'euro e spazi
  const testoPulito = testo.replace(/€/g, '').replace(/\s/g, '');

  let parteIntera: string;
  let parteDecimale = '';

  if (testoPulito.includes(',')) {
    // Con la virgola: la virgola separa i decimali, i punti sono migliaia
    const parti = testoPulito.split(',');
    if (parti.length !== 2) return null;
    [parteIntera, parteDecimale] = parti;
    if (!FORMATO_PARTE_DECIMALE.test(parteDecimale)) return null;
  } else if (/^\d+\.\d{1,2}$/.test(testoPulito)) {
    // Senza virgola, un solo punto seguito da 1-2 cifre: il punto è il separatore decimale
    [parteIntera, parteDecimale] = testoPulito.split('.');
  } else {
    // Altrimenti è un numero intero, eventualmente con punti delle migliaia
    parteIntera = testoPulito;
  }

  if (!FORMATO_PARTE_INTERA.test(parteIntera)) return null;

  const euro = Number(parteIntera.replace(/\./g, ''));
  const centesimi = Number(parteDecimale.padEnd(2, '0'));
  return euro * 100 + centesimi;
}