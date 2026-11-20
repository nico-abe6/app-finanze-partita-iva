/**
 * WidgetFlussiAnno.tsx
 * Widget: entrate, uscite, risparmi, investimenti e tasso di risparmio dell'anno scelto.
 */

import { formattaCentesimiInEuro } from '../../domain/importi';
import { calcolaRiepilogoFlussi, filtraMovimentiPerPeriodo } from '../../domain/movimenti';
import { formattaPercentuale } from '../../domain/numeri';
import { MessaggioNessunDato } from './MessaggioNessunDato';
import stili from './Widget.module.css';
import type { ProprietaWidget } from './tipiWidget';

export function WidgetFlussiAnno({ movimenti, anno }: ProprietaWidget) {
  const movimentiAnno = filtraMovimentiPerPeriodo(movimenti, anno);
  if (movimentiAnno.length === 0) return <MessaggioNessunDato periodo={`nel ${anno}`} destinazione="conti" />;

  const flussi = calcolaRiepilogoFlussi(movimentiAnno);
  const voci = [
    { etichetta: 'Entrate', valore: formattaCentesimiInEuro(flussi.entrateCentesimi) },
    { etichetta: 'Uscite', valore: formattaCentesimiInEuro(flussi.usciteCentesimi) },
    { etichetta: 'Risparmiato', valore: formattaCentesimiInEuro(flussi.risparmiatoCentesimi) },
    { etichetta: 'Investito', valore: formattaCentesimiInEuro(flussi.investitoCentesimi) },
  ];

  return (
    <div className={`${stili.riquadri} ${stili.riquadri4} ${stili.riquadri5}`}>
      <div className={`${stili.riquadro} ${stili.riquadroPrincipale}`}>
        <p className={stili.riquadroEtichetta}>Tasso di risparmio</p>
        <p className={stili.riquadroValore}>
          {flussi.tassoRisparmio === null ? '—' : formattaPercentuale(flussi.tassoRisparmio)}
        </p>
      </div>
      <div className={stili.secondari}>
        {voci.map((voce) => (
          <div key={voce.etichetta} className={stili.riquadro}>
            <p className={stili.riquadroEtichetta}>{voce.etichetta}</p>
            <p className={stili.riquadroValore}>{voce.valore}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
