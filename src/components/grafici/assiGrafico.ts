/**
 * assiGrafico.ts
 * Impostazioni comuni di griglia e assi per tutti i grafici Recharts:
 * linee sottili e chiare, testo degli assi in grigio, titolo con unità di misura.
 */

import { COLORI_STRUTTURA_GRAFICO } from '../../config/coloriGrafici';
import { formattaEuroPerAsse } from '../../domain/importi';

const STILE_TESTO_ASSE = { fill: COLORI_STRUTTURA_GRAFICO.testoAsse, fontSize: 12 };

export const MARGINI_GRAFICO = { top: 8, right: 8, bottom: 32, left: 8 };

export const PROPRIETA_GRIGLIA = {
  vertical: false,
  stroke: COLORI_STRUTTURA_GRAFICO.griglia,
} as const;

/** Asse orizzontale con titolo (es. "Mese") */
export function proprietaAsseX(titolo: string) {
  return {
    tickLine: false,
    axisLine: { stroke: COLORI_STRUTTURA_GRAFICO.asse },
    tick: STILE_TESTO_ASSE,
    tickMargin: 6,
    label: { value: titolo, position: 'insideBottom' as const, offset: -22, ...STILE_TESTO_ASSE },
  };
}

/** Asse verticale degli importi in euro, con titolo e unità */
export const PROPRIETA_ASSE_Y_EURO = {
  tickFormatter: (valore: number) => formattaEuroPerAsse(valore),
  tickLine: false,
  axisLine: false,
  tick: STILE_TESTO_ASSE,
  width: 64,
  label: {
    value: 'Importo (€)',
    angle: -90,
    position: 'insideLeft' as const,
    style: { textAnchor: 'middle' as const },
    ...STILE_TESTO_ASSE,
  },
};

/** Proprietà comuni delle barre: sottili, separate da 2px del colore di sfondo */
export const PROPRIETA_BARRA = {
  maxBarSize: 24,
  stroke: COLORI_STRUTTURA_GRAFICO.superficie,
  strokeWidth: 2,
};

/** Angoli arrotondati solo in cima alla barra */
export const RAGGIO_CIMA_BARRA: [number, number, number, number] = [4, 4, 0, 0];

/** Proprietà comuni delle linee: 2px, punto evidenziato solo al passaggio */
export const PROPRIETA_LINEA = {
  type: 'monotone' as const,
  strokeWidth: 2,
  dot: false,
  activeDot: { r: 5, stroke: COLORI_STRUTTURA_GRAFICO.superficie, strokeWidth: 2 },
};
