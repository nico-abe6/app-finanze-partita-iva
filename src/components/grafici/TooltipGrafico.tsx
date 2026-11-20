/**
 * TooltipGrafico.tsx
 * Riquadro che compare passando sopra un grafico: mostra il periodo
 * e, per ogni serie, il valore (in evidenza) e il nome (secondario).
 * Recharts gli passa automaticamente active, payload e label.
 * Se i dati del grafico hanno un campo "nomeCompleto", viene usato come titolo.
 */

import { formattaCentesimiInEuro } from '../../domain/importi';
import stili from './Grafici.module.css';

type VoceTooltip = {
  name?: string | number;
  value?: number | string | ReadonlyArray<number | string>;
  color?: string;
  dataKey?: unknown;
  payload?: { nomeCompleto?: string };
};

type ProprietaTooltipGrafico = {
  active?: boolean;
  payload?: ReadonlyArray<VoceTooltip>;
  label?: string | number;
  /** Testo di riga aggiuntiva opzionale, calcolato dai valori (es. il totale) */
  rigaTotale?: (voci: ReadonlyArray<VoceTooltip>) => { etichetta: string; valoreEuro: number } | null;
};

function euroInTesto(valore: VoceTooltip['value']): string {
  const numero = typeof valore === 'number' ? valore : Number(valore);
  return Number.isFinite(numero) ? formattaCentesimiInEuro(Math.round(numero * 100)) : '—';
}

export function TooltipGrafico({ active, payload, label, rigaTotale }: ProprietaTooltipGrafico) {
  if (!active || !payload || payload.length === 0) return null;
  const totale = rigaTotale ? rigaTotale(payload) : null;

  return (
    <div className={stili.tooltip}>
      <p className={stili.tooltipTitolo}>{payload[0]?.payload?.nomeCompleto ?? label}</p>
      {totale && (
        <p className={stili.tooltipRiga}>
          <strong>{formattaCentesimiInEuro(Math.round(totale.valoreEuro * 100))}</strong>
          <span className={stili.tooltipNome}>{totale.etichetta}</span>
        </p>
      )}
      {[...payload].reverse().map((voce) => (
        <p key={String(voce.dataKey ?? voce.name)} className={stili.tooltipRiga}>
          <span className={stili.tooltipChiave} style={{ backgroundColor: voce.color }} aria-hidden="true" />
          <strong>{euroInTesto(voce.value)}</strong>
          <span className={stili.tooltipNome}>{voce.name}</span>
        </p>
      ))}
    </div>
  );
}
