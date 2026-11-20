/**
 * ContenitoreWidget.tsx
 * Card bianca che contiene un widget della pagina Riepilogo.
 * In modalità "personalizza" mostra i bottoni per spostare o togliere il widget.
 */

import type { ReactNode } from 'react';
import type { LarghezzaWidget } from '../../types/dashboard';
import { IconaChiudi, IconaGiu, IconaSu } from '../Icone/Icone';
import stili from './ContenitoreWidget.module.css';

type ProprietaContenitoreWidget = {
  titolo: string;
  sottotitolo?: string;
  larghezza: LarghezzaWidget;
  inModifica: boolean;
  primo: boolean;
  ultimo: boolean;
  onSposta: (direzione: -1 | 1) => void;
  onRimuovi: () => void;
  children: ReactNode;
};

export function ContenitoreWidget({
  titolo,
  sottotitolo,
  larghezza,
  inModifica,
  primo,
  ultimo,
  onSposta,
  onRimuovi,
  children,
}: ProprietaContenitoreWidget) {
  const classi = [stili.widget, larghezza === 'intera' ? stili.intera : '', inModifica ? stili.inModifica : '']
    .filter(Boolean)
    .join(' ');

  return (
    <section className={classi} aria-label={titolo}>
      <header className={stili.intestazione}>
        <div>
          <h2 className={stili.titolo}>{titolo}</h2>
          {sottotitolo && <p className={stili.sottotitolo}>{sottotitolo}</p>}
        </div>

        {inModifica && (
          <div className={stili.comandi}>
            <button type="button" className="bottone bottone--icona" onClick={() => onSposta(-1)} disabled={primo} aria-label={`Sposta prima: ${titolo}`}>
              <IconaSu />
            </button>
            <button type="button" className="bottone bottone--icona" onClick={() => onSposta(1)} disabled={ultimo} aria-label={`Sposta dopo: ${titolo}`}>
              <IconaGiu />
            </button>
            <button type="button" className="bottone bottone--icona bottone--pericolo" onClick={onRimuovi} aria-label={`Rimuovi: ${titolo}`}>
              <IconaChiudi />
            </button>
          </div>
        )}
      </header>

      <div className={stili.corpo}>{children}</div>
    </section>
  );
}
