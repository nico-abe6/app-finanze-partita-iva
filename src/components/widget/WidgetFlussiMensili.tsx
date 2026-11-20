/**
 * WidgetFlussiMensili.tsx
 * Widget: colonne affiancate di entrate e uscite per ogni mese dell'anno scelto.
 */

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { COLORI_FLUSSI, COLORI_STRUTTURA_GRAFICO } from '../../config/coloriGrafici';
import { nomeMese, nomeMeseBreve } from '../../domain/mesi';
import { calcolaFlussiMensili, filtraMovimentiPerPeriodo } from '../../domain/movimenti';
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

export function WidgetFlussiMensili({ movimenti, anno }: ProprietaWidget) {
  if (filtraMovimentiPerPeriodo(movimenti, anno).length === 0) {
    return <MessaggioNessunDato periodo={`nel ${anno}`} destinazione="conti" />;
  }

  const dati = calcolaFlussiMensili(movimenti, anno).map((voce) => ({
    etichetta: nomeMeseBreve(voce.mese),
    nomeCompleto: `${nomeMese(voce.mese)} ${anno}`,
    entrate: voce.flussi.entrateCentesimi / 100,
    uscite: voce.flussi.usciteCentesimi / 100,
  }));

  return (
    <>
      <LegendaGrafico
        voci={[
          { etichetta: 'Entrate', colore: COLORI_FLUSSI.entrate, forma: 'rettangolo' },
          { etichetta: 'Uscite', colore: COLORI_FLUSSI.uscite, forma: 'rettangolo' },
        ]}
      />
      <div className={grafici.areaGrafico}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={dati} margin={MARGINI_GRAFICO} barGap={2} barCategoryGap="25%">
            <CartesianGrid {...PROPRIETA_GRIGLIA} />
            <XAxis dataKey="etichetta" {...proprietaAsseX('Mese')} />
            <YAxis {...PROPRIETA_ASSE_Y_EURO} />
            <Tooltip cursor={{ fill: COLORI_STRUTTURA_GRAFICO.evidenziaColonna, stroke: 'none' }} content={<TooltipGrafico />} />
            <Bar dataKey="entrate" name="Entrate" fill={COLORI_FLUSSI.entrate} radius={RAGGIO_CIMA_BARRA} {...PROPRIETA_BARRA} />
            <Bar dataKey="uscite" name="Uscite" fill={COLORI_FLUSSI.uscite} radius={RAGGIO_CIMA_BARRA} {...PROPRIETA_BARRA} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </>
  );
}
