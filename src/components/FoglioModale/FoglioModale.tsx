/**
 * FoglioModale.tsx
 * Finestra in primo piano basata sull'elemento HTML <dialog>.
 * Su telefono sale dal basso come un "foglio", su schermo grande compare al centro.
 * Si chiude con il tasto Esc, con la X o toccando fuori.
 */

import { useEffect, useRef, type ReactNode } from 'react';
import { IconaChiudi } from '../Icone/Icone';
import stili from './FoglioModale.module.css';

type ProprietaFoglioModale = {
  aperto: boolean;
  titolo: string;
  onChiudi: () => void;
  children: ReactNode;
};

export function FoglioModale({ aperto, titolo, onChiudi, children }: ProprietaFoglioModale) {
  const riferimentoDialog = useRef<HTMLDialogElement>(null);

  // Sincronizza lo stato "aperto" con il dialog del browser
  useEffect(() => {
    const dialog = riferimentoDialog.current;
    if (!dialog) return;
    if (aperto && !dialog.open) dialog.showModal();
    if (!aperto && dialog.open) dialog.close();
  }, [aperto]);

  return (
    <dialog
      ref={riferimentoDialog}
      className={stili.dialog}
      onClose={onChiudi}
      onClick={(evento) => {
        // un clic sullo sfondo (fuori dal contenuto) chiude la finestra
        if (evento.target === evento.currentTarget) onChiudi();
      }}
      aria-labelledby="titolo-foglio-modale"
    >
      <div className={stili.contenuto}>
        <header className={stili.intestazione}>
          <h2 id="titolo-foglio-modale" className={stili.titolo}>
            {titolo}
          </h2>
          <button type="button" className="bottone bottone--icona" onClick={onChiudi} aria-label="Chiudi">
            <IconaChiudi />
          </button>
        </header>
        {aperto && children}
      </div>
    </dialog>
  );
}
