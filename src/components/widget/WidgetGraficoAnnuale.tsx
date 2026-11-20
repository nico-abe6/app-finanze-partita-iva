/**
 * WidgetGraficoAnnuale.tsx
 * Widget: confronto tra anni, con colonne affiancate di fatturato e netto stimato.
 */

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { COLORI_SERIE, COLORI_STRUTTURA_GRAFICO } from '../../config/coloriGrafici';
import { calcolaRiepilogoAnni } from '../../domain/riepilogoPeriodi';
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

export function WidgetGraficoAnnuale({ righe, impostazioni }: ProprietaWidget) {
  if (righe.length === 0) return <MessaggioNessunDato periodo="finora" />;

  const dati = calcolaRiepilogoAnni(righe, impostazioni).map((voce) => ({
    etichetta: String(voce.anno),
    incassato: voce.riepilogo.incassatoCentesimi / 100,
    netto: voce.riepilogo.nettoStimatoCentesimi / 100,
  }));

  return (
    <>
      <LegendaGrafico
        voci={[
          { etichetta: 'Fatturato', colore: COLORI_SERIE.incassato, forma: 'rettangolo' },
          { etichetta: 'Netto stimato', colore: COLORI_SERIE.netto, forma: 'rettangolo' },
        ]}
      />
      <div className={grafici.areaGrafico}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={dati} margin={MARGINI_GRAFICO} barGap={2} barCategoryGap="30%">
            <CartesianGrid {...PROPRIETA_GRIGLIA} />
            <XAxis dataKey="etichetta" {...proprietaAsseX('Anno')} />
            <YAxis {...PROPRIETA_ASSE_Y_EURO} />
            <Tooltip cursor={{ fill: COLORI_STRUTTURA_GRAFICO.evidenziaColonna, stroke: 'none' }} content={<TooltipGrafico />} />
            <Bar dataKey="incassato" name="Fatturato" fill={COLORI_SERIE.incassato} radius={RAGGIO_CIMA_BARRA} {...PROPRIETA_BARRA} />
            <Bar dataKey="netto" name="Netto stimato" fill={COLORI_SERIE.netto} radius={RAGGIO_CIMA_BARRA} {...PROPRIETA_BARRA} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </>
  );
}
