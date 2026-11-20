/**
 * BarreOrizzontali.tsx
 * Elenco di barre orizzontali con nome, importo e percentuale sempre scritti
 * (i valori non dipendono dal colore né dal passaggio del mouse).
 */

import { formattaCentesimiInEuro } from '../../domain/importi';
import { formattaPercentuale } from '../../domain/numeri';
import stili from './Widget.module.css';

export type VoceBarra = {
  chiave: string;
  etichetta: string;
  valoreCentesimi: number;
  colore: string;
};

type ProprietaBarre = {
  voci: VoceBarra[];
  /** false quando le voci si sovrappongono e la percentuale sul totale non avrebbe senso */
  mostraPercentuale?: boolean;
};

export function BarreOrizzontali({ voci, mostraPercentuale = true }: ProprietaBarre) {
  const totale = voci.reduce((somma, voce) => somma + voce.valoreCentesimi, 0);
  const massimo = Math.max(...voci.map((voce) => voce.valoreCentesimi), 1);

  return (
    <ul className={stili.barre}>
      {voci.map((voce) => (
        <li key={voce.chiave} className={stili.barraVoce}>
          <div className={stili.barraTesti}>
            <span className={stili.barraEtichetta}>{voce.etichetta}</span>
            <span className={stili.barraValore}>
              {formattaCentesimiInEuro(voce.valoreCentesimi)}
              {mostraPercentuale && totale > 0 && <span className={stili.barraPercentuale}> · {formattaPercentuale(voce.valoreCentesimi / totale)}</span>}
            </span>
          </div>
          <div className={stili.barraTraccia} aria-hidden="true">
            <div
              className={stili.barraRiempimento}
              style={{ width: `${(voce.valoreCentesimi / massimo) * 100}%`, backgroundColor: voce.colore }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
