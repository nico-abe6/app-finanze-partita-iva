/**
 * tipiWidget.ts
 * Dati che ogni widget riceve dalla pagina Riepilogo.
 */

import type { Conto, Movimento } from '../../types/finanze';
import type { FatturatoMensile, ImpostazioniFiscali } from '../../types/fiscale';

export type ProprietaWidget = {
  righe: FatturatoMensile[];          // fatturato mensile della partita IVA
  impostazioni: ImpostazioniFiscali;
  conti: Conto[];
  movimenti: Movimento[];
  anno: number; // anno scelto in cima alla pagina (i widget "storici" lo ignorano)
};
