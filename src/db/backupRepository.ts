/**
 * backupRepository.ts
 * Esporta tutti i dati dell'utente in un oggetto di backup e importa un backup
 * verificato su Supabase (crea o aggiorna; non cancella i dati già presenti).
 */

import { creaBackup, type DatiBackup } from '../domain/backup';
import { leggiConti, salvaConti } from './contiRepository';
import { leggiFatturatoMensile, salvaFatturatiMensili } from './fatturatoMensileRepository';
import { leggiImpostazioniFiscaliSalvate, salvaImpostazioniFiscali } from './impostazioniFiscaliRepository';
import { leggiMovimenti, salvaMovimenti } from './movimentiRepository';
import { leggiWidgetDashboard, salvaWidgetDashboard } from './preferenzeDashboardRepository';

export async function esportaTuttiIDati(adesso: Date): Promise<DatiBackup> {
  const [fatturatoMensile, impostazioniFiscali, conti, movimenti, widgetDashboard] = await Promise.all([
    leggiFatturatoMensile(),
    leggiImpostazioniFiscaliSalvate(),
    leggiConti(),
    leggiMovimenti(),
    leggiWidgetDashboard().catch(() => null), // la tabella dei widget potrebbe non esistere ancora
  ]);
  return creaBackup({ fatturatoMensile, impostazioniFiscali, conti, movimenti, widgetDashboard }, adesso);
}

/** I conti vanno salvati prima dei movimenti che li usano */
export async function importaDati(dati: DatiBackup): Promise<void> {
  await salvaConti(dati.conti);
  await salvaMovimenti(dati.movimenti);
  await salvaFatturatiMensili(dati.fatturatoMensile);
  if (dati.impostazioniFiscali) await salvaImpostazioniFiscali(dati.impostazioniFiscali);
  if (dati.widgetDashboard) await salvaWidgetDashboard(dati.widgetDashboard);
}
