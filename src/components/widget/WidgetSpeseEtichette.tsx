/**
 * WidgetSpeseEtichette.tsx
 * Widget: le etichette su cui hai speso di più nell'anno scelto.
 */

import { COLORE_SPESE_ETICHETTA } from '../../config/coloriGrafici';
import { calcolaSpesePerEtichetta, filtraMovimentiPerPeriodo } from '../../domain/movimenti';
import { BarreOrizzontali } from './BarreOrizzontali';
import { MessaggioNessunDato } from './MessaggioNessunDato';
import stili from './Widget.module.css';
import type { ProprietaWidget } from './tipiWidget';

const VOCI_MASSIME = 8;

export function WidgetSpeseEtichette({ movimenti, anno }: ProprietaWidget) {
  const uscite = filtraMovimentiPerPeriodo(movimenti, anno).filter((movimento) => movimento.tipo === 'uscita');
  if (uscite.length === 0) return <MessaggioNessunDato periodo={`nel ${anno}`} destinazione="conti" />;

  const voci = calcolaSpesePerEtichetta(uscite, VOCI_MASSIME).map((voce) => ({
    chiave: voce.etichetta,
    etichetta: voce.etichetta,
    valoreCentesimi: voce.importoCentesimi,
    colore: COLORE_SPESE_ETICHETTA,
  }));

  return (
    <>
      <BarreOrizzontali voci={voci} mostraPercentuale={false} />
      <p className={stili.notaTabella}>Una spesa con più etichette conta per intero in ciascuna.</p>
    </>
  );
}
