/**
 * SceltaSegmentata.tsx
 * Gruppo di pulsanti in cui se ne sceglie uno (come dei radio button, ma più comodi al tocco).
 * Ogni opzione può avere un colore pastello quando è selezionata.
 */

import stili from './SceltaSegmentata.module.css';

export type OpzioneSegmentata<Valore extends string> = {
  valore: Valore;
  etichetta: string;
  colore?: 'verde' | 'azzurro' | 'violetto' | 'acqua' | 'pesca' | 'rosa';
};

type ProprietaSceltaSegmentata<Valore extends string> = {
  nome: string; // descrizione del gruppo per i lettori di schermo
  opzioni: OpzioneSegmentata<Valore>[];
  valore: Valore | null;
  onCambia: (valore: Valore) => void;
};

export function SceltaSegmentata<Valore extends string>({
  nome,
  opzioni,
  valore,
  onCambia,
}: ProprietaSceltaSegmentata<Valore>) {
  return (
    <div className={stili.gruppo} role="radiogroup" aria-label={nome}>
      {opzioni.map((opzione) => {
        const scelta = opzione.valore === valore;
        return (
          <button
            key={opzione.valore}
            type="button"
            role="radio"
            aria-checked={scelta}
            data-colore={opzione.colore ?? 'violetto'}
            className={`${stili.opzione} ${scelta ? stili.scelta : ''}`}
            onClick={() => onCambia(opzione.valore)}
          >
            {opzione.etichetta}
          </button>
        );
      })}
    </div>
  );
}
