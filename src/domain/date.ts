/**
 * date.ts
 * Date nel formato del database ("AAAA-MM-GG") e date leggibili nella lingua dell'app.
 */

import { LOCALE_IMPORTI } from '../config/formatoImporti';

const formattatoreData = new Intl.DateTimeFormat(LOCALE_IMPORTI, { weekday: 'short', day: 'numeric', month: 'long' });

/** Data locale (non UTC) in formato "AAAA-MM-GG" */
export function dataInFormatoIso(data: Date): string {
  const anno = data.getFullYear();
  const mese = String(data.getMonth() + 1).padStart(2, '0');
  const giorno = String(data.getDate()).padStart(2, '0');
  return `${anno}-${mese}-${giorno}`;
}

/** "2026-11-20" -> "ven 20 novembre" */
export function formattaDataLeggibile(dataIso: string): string {
  const [anno, mese, giorno] = dataIso.split('-').map(Number);
  return formattatoreData.format(new Date(anno, mese - 1, giorno, 12));
}
