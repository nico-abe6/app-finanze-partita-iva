/**
 * WidgetTabellaAnnuale.tsx
 * Widget: una riga per ogni anno inserito, con il totale dall'inizio.
 */

import { calcolaRiepilogoAnni, calcolaRiepilogoTotale } from '../../domain/riepilogoPeriodi';
import { MessaggioNessunDato } from './MessaggioNessunDato';
import { TabellaRiepilogo } from './TabellaRiepilogo';
import type { ProprietaWidget } from './tipiWidget';

export function WidgetTabellaAnnuale({ righe, impostazioni }: ProprietaWidget) {
  if (righe.length === 0) return <MessaggioNessunDato periodo="finora" />;

  return (
    <TabellaRiepilogo
      intestazionePeriodo="Anno"
      righe={calcolaRiepilogoAnni(righe, impostazioni).map((voce) => ({
        chiave: String(voce.anno),
        etichetta: String(voce.anno),
        riepilogo: voce.riepilogo,
      }))}
      totale={{ etichetta: 'Dall\'inizio', riepilogo: calcolaRiepilogoTotale(righe, impostazioni) }}
    />
  );
}
