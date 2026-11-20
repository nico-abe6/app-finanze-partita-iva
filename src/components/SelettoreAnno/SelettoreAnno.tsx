/**
 * SelettoreAnno.tsx
 * Scelta dell'anno da visualizzare: frecce per l'anno precedente/successivo
 * e menu a tendina con gli anni disponibili.
 */

import stili from './SelettoreAnno.module.css';

type ProprietaSelettoreAnno = {
  anno: number;
  anniDisponibili: number[];   // in ordine crescente
  onCambia: (anno: number) => void;
};

export function SelettoreAnno({ anno, anniDisponibili, onCambia }: ProprietaSelettoreAnno) {
  const posizione = anniDisponibili.indexOf(anno);
  const annoPrecedente = posizione > 0 ? anniDisponibili[posizione - 1] : undefined;
  const annoSuccessivo =
    posizione >= 0 && posizione < anniDisponibili.length - 1 ? anniDisponibili[posizione + 1] : undefined;

  return (
    <div className={stili.selettore}>
      <button
        type="button"
        className={stili.freccia}
        onClick={() => annoPrecedente !== undefined && onCambia(annoPrecedente)}
        disabled={annoPrecedente === undefined}
        aria-label="Anno precedente"
      >
        ‹
      </button>
      <select
        className={stili.menu}
        value={anno}
        onChange={(evento) => onCambia(Number(evento.target.value))}
        aria-label="Anno"
      >
        {anniDisponibili.map((voce) => (
          <option key={voce} value={voce}>
            {voce}
          </option>
        ))}
      </select>
      <button
        type="button"
        className={stili.freccia}
        onClick={() => annoSuccessivo !== undefined && onCambia(annoSuccessivo)}
        disabled={annoSuccessivo === undefined}
        aria-label="Anno successivo"
      >
        ›
      </button>
    </div>
  );
}
