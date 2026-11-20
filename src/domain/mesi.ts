/**
 * mesi.ts
 * Nomi dei mesi nella lingua configurata (LOCALE_IMPORTI), con iniziale maiuscola.
 */

import { LOCALE_IMPORTI } from '../config/formatoImporti';

const formattatoreMeseLungo = new Intl.DateTimeFormat(LOCALE_IMPORTI, { month: 'long' });
const formattatoreMeseBreve = new Intl.DateTimeFormat(LOCALE_IMPORTI, { month: 'short' });

function conIniziale(testo: string): string {
  return testo.charAt(0).toUpperCase() + testo.slice(1);
}

/** Nome completo del mese (1 = gennaio), es. "Novembre" */
export function nomeMese(mese: number): string {
  // giorno 15 e ore 12 evitano problemi di fuso orario
  return conIniziale(formattatoreMeseLungo.format(new Date(2000, mese - 1, 15, 12)));
}

/** Nome breve del mese, es. "Nov" */
export function nomeMeseBreve(mese: number): string {
  return conIniziale(formattatoreMeseBreve.format(new Date(2000, mese - 1, 15, 12)).replace('.', ''));
}
