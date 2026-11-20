/**
 * WidgetTabellaMensile.tsx
 * Widget: tabella mese per mese dell'anno scelto, con il totale annuale.
 */

import { nomeMese } from '../../domain/mesi';
import { calcolaRiepilogoAnno, calcolaRiepilogoMesi, filtraPerAnno } from '../../domain/riepilogoPeriodi';
import { MessaggioNessunDato } from './MessaggioNessunDato';
import { TabellaRiepilogo } from './TabellaRiepilogo';
import type { ProprietaWidget } from './tipiWidget';

export function WidgetTabellaMensile({ righe, impostazioni, anno }: ProprietaWidget) {
  if (filtraPerAnno(righe, anno).length === 0) return <MessaggioNessunDato periodo={`nel ${anno}`} />;

  const mesi = calcolaRiepilogoMesi(righe, impostazioni, anno);
  return (
    <TabellaRiepilogo
      intestazionePeriodo="Mese"
      righe={mesi.map((voce) => ({
        chiave: String(voce.mese),
        etichetta: nomeMese(voce.mese),
        riepilogo: voce.riepilogo,
        vuota: !voce.haDati,
      }))}
      totale={{ etichetta: `Totale ${anno}`, riepilogo: calcolaRiepilogoAnno(righe, impostazioni, anno) }}
      nota="Il totale è calcolato sull'anno intero: può differire di poco dalla somma dei mesi."
    />
  );
}
