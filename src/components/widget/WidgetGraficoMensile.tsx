/**
 * WidgetGraficoMensile.tsx
 * Widget: colonne impilate mese per mese. Ogni colonna è il fatturato del mese,
 * diviso in netto stimato (in basso), INPS stimato e imposta (in cima).
 */

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { COLORI_SERIE, COLORI_STRUTTURA_GRAFICO } from '../../config/coloriGrafici';
import { nomeMese, nomeMeseBreve } from '../../domain/mesi';
import { calcolaRiepilogoMesi, filtraPerAnno } from '../../domain/riepilogoPeriodi';
import {
  MARGINI_GRAFICO,
  PROPRIETA_ASSE_Y_EURO,
  PROPRIETA_BARRA,
  PROPRIETA_GRIGLIA,
  RAGGIO_CIMA_BARRA,
  proprietaAsseX,
} from '../grafici/assiGrafico';
import grafici from '../grafici/Grafici.module.css';
import { LegendaGrafico } from '../grafici/LegendaGrafico';
import { TooltipGrafico } from '../grafici/TooltipGrafico';
import { MessaggioNessunDato } from './MessaggioNessunDato';
import type { ProprietaWidget } from './tipiWidget';

export function WidgetGraficoMensile({ righe, impostazioni, anno }: ProprietaWidget) {
  if (filtraPerAnno(righe, anno).length === 0) return <MessaggioNessunDato periodo={`nel ${anno}`} />;

  // Recharts lavora in euro (numeri decimali); i calcoli restano in centesimi
  const dati = calcolaRiepilogoMesi(righe, impostazioni, anno).map((voce) => ({
    etichetta: nomeMeseBreve(voce.mese),
    nomeCompleto: `${nomeMese(voce.mese)} ${anno}`,
    netto: Math.max(0, voce.riepilogo.nettoStimatoCentesimi) / 100,
    inps: voce.riepilogo.contributiInpsStimatiCentesimi / 100,
    imposta: voce.riepilogo.impostaSostitutivaCentesimi / 100,
    incassato: voce.riepilogo.incassatoCentesimi / 100,
  }));

  return (
    <>
      <LegendaGrafico
        voci={[
          { etichetta: 'Netto stimato', colore: COLORI_SERIE.netto, forma: 'rettangolo' },
          { etichetta: 'INPS stimato', colore: COLORI_SERIE.inps, forma: 'rettangolo' },
          { etichetta: 'Imposta', colore: COLORI_SERIE.imposta, forma: 'rettangolo' },
        ]}
      />
      <div className={grafici.areaGrafico}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={dati} margin={MARGINI_GRAFICO} barCategoryGap="25%">
            <CartesianGrid {...PROPRIETA_GRIGLIA} />
            <XAxis dataKey="etichetta" {...proprietaAsseX('Mese')} />
            <YAxis {...PROPRIETA_ASSE_Y_EURO} />
            <Tooltip
              cursor={{ fill: COLORI_STRUTTURA_GRAFICO.evidenziaColonna, stroke: 'none' }}
              content={
                <TooltipGrafico
                  rigaTotale={(voci) => {
                    const incassato = (voci[0] as { payload?: { incassato?: number } } | undefined)?.payload?.incassato;
                    return incassato === undefined ? null : { etichetta: 'Fatturato', valoreEuro: incassato };
                  }}
                />
              }
            />
            <Bar dataKey="netto" name="Netto stimato" stackId="incassato" fill={COLORI_SERIE.netto} {...PROPRIETA_BARRA} />
            <Bar dataKey="inps" name="INPS stimato" stackId="incassato" fill={COLORI_SERIE.inps} {...PROPRIETA_BARRA} />
            <Bar
              dataKey="imposta"
              name="Imposta"
              stackId="incassato"
              fill={COLORI_SERIE.imposta}
              radius={RAGGIO_CIMA_BARRA}
              {...PROPRIETA_BARRA}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </>
  );
}
