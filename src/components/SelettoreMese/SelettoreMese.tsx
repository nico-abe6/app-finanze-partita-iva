/**
 * SelettoreMese.tsx
 * Scelta del mese da visualizzare con frecce per mese precedente e successivo.
 */

import { nomeMese } from '../../domain/mesi';
import stili from '../SelettoreAnno/SelettoreAnno.module.css';

type ProprietaSelettoreMese = {
  anno: number;
  mese: number; // 1-12
  onCambia: (anno: number, mese: number) => void;
};

export function SelettoreMese({ anno, mese, onCambia }: ProprietaSelettoreMese) {
  function sposta(direzione: -1 | 1) {
    const indice = anno * 12 + (mese - 1) + direzione;
    onCambia(Math.floor(indice / 12), (indice % 12) + 1);
  }

  return (
    <div className={stili.selettore}>
      <button type="button" className={stili.freccia} onClick={() => sposta(-1)} aria-label="Mese precedente">
        ‹
      </button>
      <span className={stili.etichettaCentrale} aria-live="polite">
        {nomeMese(mese)} {anno}
      </span>
      <button type="button" className={stili.freccia} onClick={() => sposta(1)} aria-label="Mese successivo">
        ›
      </button>
    </div>
  );
}
