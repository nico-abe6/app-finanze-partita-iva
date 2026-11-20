/**
 * tipiWidget.ts
 * Dati che ogni widget riceve dalla pagina Riepilogo.
 */

import type { FatturatoMensile, ImpostazioniFiscali } from '../../types/fiscale';

export type ProprietaWidget = {
  righe: FatturatoMensile[];
  impostazioni: ImpostazioniFiscali;
  anno: number; // anno scelto in cima alla pagina (i widget "storici" lo ignorano)
};
