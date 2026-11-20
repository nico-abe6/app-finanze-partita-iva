/**
 * WidgetAndamentoCumulato.tsx
 * Widget: linee dell'incassato e del netto accumulati da gennaio
 * fino all'ultimo mese inserito dell'anno scelto.
 */

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { COLORI_SERIE, COLORI_STRUTTURA_GRAFICO } from '../../config/coloriGrafici';
import { nomeMese, nomeMeseBreve } from '../../domain/mesi';
import { calcolaCumulatoMesi, calcolaRiepilogoMesi, filtraPerAnno } from '../../domain/riepilogoPeriodi';
import { MARGINI_GRAFICO, PROPRIETA_ASSE_Y_EURO, PROPRIETA_GRIGLIA, PROPRIETA_LINEA, proprietaAsseX } from '../grafici/assiGrafico';
import grafici from '../grafici/Grafici.module.css';
import { LegendaGrafico } from '../grafici/LegendaGrafico';
import { TooltipGrafico } from '../grafici/TooltipGrafico';
import { MessaggioNessunDato } from './MessaggioNessunDato';
import type { ProprietaWidget } from './tipiWidget';

export function WidgetAndamentoCumulato({ righe, impostazioni, anno }: ProprietaWidget) {
  const righeAnno = filtraPerAnno(righe, anno);
  if (righeAnno.length === 0) return <MessaggioNessunDato periodo={`nel ${anno}`} />;

  const ultimoMese = Math.max(...righeAnno.map((riga) => riga.mese));
  const dati = calcolaCumulatoMesi(calcolaRiepilogoMesi(righe, impostazioni, anno))
    .filter((voce) => voce.mese <= ultimoMese)
    .map((voce) => ({
      etichetta: nomeMeseBreve(voce.mese),
      nomeCompleto: `Gennaio – ${nomeMese(voce.mese)} ${anno}`,
      incassato: voce.incassatoCumulatoCentesimi / 100,
      netto: voce.nettoCumulatoCentesimi / 100,
    }));

  return (
    <>
      <LegendaGrafico
        voci={[
          { etichetta: 'Incassato cumulato', colore: COLORI_SERIE.incassato, forma: 'linea' },
          { etichetta: 'Netto cumulato', colore: COLORI_SERIE.netto, forma: 'linea' },
        ]}
      />
      <div className={grafici.areaGrafico}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={dati} margin={MARGINI_GRAFICO}>
            <CartesianGrid {...PROPRIETA_GRIGLIA} />
            <XAxis dataKey="etichetta" {...proprietaAsseX('Mese')} />
            <YAxis {...PROPRIETA_ASSE_Y_EURO} />
            <Tooltip
              cursor={{ stroke: COLORI_STRUTTURA_GRAFICO.asse, strokeWidth: 1 }}
              content={<TooltipGrafico />}
            />
            <Line dataKey="incassato" name="Incassato cumulato" stroke={COLORI_SERIE.incassato} {...PROPRIETA_LINEA} />
            <Line dataKey="netto" name="Netto cumulato" stroke={COLORI_SERIE.netto} {...PROPRIETA_LINEA} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </>
  );
}
