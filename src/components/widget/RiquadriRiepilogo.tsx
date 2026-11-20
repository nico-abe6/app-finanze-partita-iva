/**
 * RiquadriRiepilogo.tsx
 * Quattro riquadri numerici (netto, fatturato, imposta, INPS) con la barra
 * che mostra come si divide il fatturato. Usato da "Riepilogo dell'anno" e "Totale dall'inizio".
 */

import { COLORI_SERIE } from '../../config/coloriGrafici';
import { formattaCentesimiInEuro } from '../../domain/importi';
import type { RiepilogoFiscale } from '../../types/fiscale';
import { LegendaGrafico } from '../grafici/LegendaGrafico';
import stili from './Widget.module.css';

type ProprietaRiquadri = {
  riepilogo: RiepilogoFiscale;
  /** true per la disposizione a 4 colonne su schermo grande (widget a riga intera) */
  largo: boolean;
};

function percentuale(parte: number, totale: number): number {
  return totale > 0 ? (parte / totale) * 100 : 0;
}

export function RiquadriRiepilogo({ riepilogo, largo }: ProprietaRiquadri) {
  const totale = riepilogo.incassatoCentesimi;
  // Il netto può essere negativo se le tasse superano il fatturato: la barra mostra solo valori positivi
  const parti = [
    { etichetta: 'Netto stimato', valore: Math.max(0, riepilogo.nettoStimatoCentesimi), colore: COLORI_SERIE.netto },
    { etichetta: 'INPS stimato', valore: riepilogo.contributiInpsStimatiCentesimi, colore: COLORI_SERIE.inps },
    { etichetta: 'Imposta', valore: riepilogo.impostaSostitutivaCentesimi, colore: COLORI_SERIE.imposta },
  ].filter((parte) => parte.valore > 0);

  return (
    <>
      <div className={`${stili.riquadri} ${largo ? stili.riquadri4 : ''}`}>
        <div className={`${stili.riquadro} ${stili.riquadroPrincipale}`}>
          <p className={stili.riquadroEtichetta}>Netto stimato</p>
          <p className={stili.riquadroValore}>{formattaCentesimiInEuro(riepilogo.nettoStimatoCentesimi)}</p>
        </div>
        <div className={stili.secondari}>
        <div className={stili.riquadro}>
          <p className={stili.riquadroEtichetta}>Fatturato</p>
          <p className={stili.riquadroValore}>{formattaCentesimiInEuro(riepilogo.incassatoCentesimi)}</p>
        </div>
        <div className={stili.riquadro}>
          <p className={stili.riquadroEtichetta}>Imposta sostitutiva</p>
          <p className={stili.riquadroValore}>{formattaCentesimiInEuro(riepilogo.impostaSostitutivaCentesimi)}</p>
        </div>
        <div className={stili.riquadro}>
          <p className={stili.riquadroEtichetta}>INPS stimato</p>
          <p className={stili.riquadroValore}>{formattaCentesimiInEuro(riepilogo.contributiInpsStimatiCentesimi)}</p>
        </div>
        </div>
      </div>

      {totale > 0 && (
        <>
          <div
            className={stili.barraComposizione}
            role="img"
            aria-label={parti
              .map((parte) => `${parte.etichetta} ${Math.round(percentuale(parte.valore, totale))}%`)
              .join(', ')}
          >
            {parti.map((parte) => (
              <span
                key={parte.etichetta}
                title={`${parte.etichetta}: ${formattaCentesimiInEuro(parte.valore)}`}
                style={{ flexGrow: parte.valore, backgroundColor: parte.colore }}
              />
            ))}
          </div>
          <LegendaGrafico
            voci={parti.map((parte) => ({
              etichetta: `${parte.etichetta} ${Math.round(percentuale(parte.valore, totale))}%`,
              colore: parte.colore,
              forma: 'rettangolo',
            }))}
          />
        </>
      )}
    </>
  );
}
