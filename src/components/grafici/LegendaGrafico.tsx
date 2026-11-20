/**
 * LegendaGrafico.tsx
 * Legenda sopra i grafici: un simbolo colorato (rettangolo per le barre,
 * linea per le linee) accanto al nome della serie. Il testo resta nel colore del testo.
 */

import stili from './Grafici.module.css';

export type VoceLegenda = {
  etichetta: string;
  colore: string;
  forma: 'rettangolo' | 'linea';
};

export function LegendaGrafico({ voci }: { voci: VoceLegenda[] }) {
  return (
    <ul className={stili.legenda}>
      {voci.map((voce) => (
        <li key={voce.etichetta} className={stili.voceLegenda}>
          <span
            className={voce.forma === 'linea' ? stili.simboloLinea : stili.simboloRettangolo}
            style={{ backgroundColor: voce.colore }}
            aria-hidden="true"
          />
          {voce.etichetta}
        </li>
      ))}
    </ul>
  );
}
