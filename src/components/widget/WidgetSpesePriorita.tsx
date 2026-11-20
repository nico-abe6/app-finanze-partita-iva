/**
 * WidgetSpesePriorita.tsx
 * Widget: uscite dell'anno scelto divise per Devo, Ho bisogno, Voglio (e non indicata).
 */

import { COLORI_PRIORITA } from '../../config/coloriGrafici';
import { ETICHETTE_PRIORITA } from '../../config/etichettePriorita';
import { calcolaSpesePerPriorita, filtraMovimentiPerPeriodo } from '../../domain/movimenti';
import { BarreOrizzontali, type VoceBarra } from './BarreOrizzontali';
import { MessaggioNessunDato } from './MessaggioNessunDato';
import type { ProprietaWidget } from './tipiWidget';

export function WidgetSpesePriorita({ movimenti, anno }: ProprietaWidget) {
  const uscite = filtraMovimentiPerPeriodo(movimenti, anno).filter((movimento) => movimento.tipo === 'uscita');
  if (uscite.length === 0) return <MessaggioNessunDato periodo={`nel ${anno}`} destinazione="conti" />;

  const totali = calcolaSpesePerPriorita(uscite);
  const voci: VoceBarra[] = [
    { chiave: 'devo', etichetta: ETICHETTE_PRIORITA.devo, valoreCentesimi: totali.devo, colore: COLORI_PRIORITA.devo },
    { chiave: 'ho_bisogno', etichetta: ETICHETTE_PRIORITA.ho_bisogno, valoreCentesimi: totali.ho_bisogno, colore: COLORI_PRIORITA.ho_bisogno },
    { chiave: 'voglio', etichetta: ETICHETTE_PRIORITA.voglio, valoreCentesimi: totali.voglio, colore: COLORI_PRIORITA.voglio },
  ];
  if (totali.non_indicata > 0) {
    voci.push({ chiave: 'non_indicata', etichetta: 'Non indicata', valoreCentesimi: totali.non_indicata, colore: COLORI_PRIORITA.non_indicata });
  }

  return <BarreOrizzontali voci={voci} />;
}
