/**
 * CampoEtichette.tsx
 * Campo per aggiungere etichette a un movimento: si scrive e si preme Invio
 * (o la virgola); le etichette già usate compaiono come suggerimenti.
 */

import { useId, useState, type KeyboardEvent } from 'react';
import { normalizzaEtichetta } from '../../domain/movimenti';
import { IconaChiudi } from '../Icone/Icone';
import stili from './CampoEtichette.module.css';

type ProprietaCampoEtichette = {
  etichette: string[];
  suggerimenti: string[];
  onCambia: (etichette: string[]) => void;
};

export function CampoEtichette({ etichette, suggerimenti, onCambia }: ProprietaCampoEtichette) {
  const [testo, setTesto] = useState('');
  const idSuggerimenti = useId();

  function aggiungi(valore: string) {
    const etichetta = normalizzaEtichetta(valore);
    if (etichetta && !etichette.includes(etichetta)) onCambia([...etichette, etichetta]);
    setTesto('');
  }

  function gestisciTasto(evento: KeyboardEvent<HTMLInputElement>) {
    if (evento.key === 'Enter' || evento.key === ',') {
      evento.preventDefault();
      aggiungi(testo);
    } else if (evento.key === 'Backspace' && testo === '' && etichette.length > 0) {
      onCambia(etichette.slice(0, -1));
    }
  }

  return (
    <div className={stili.campo}>
      {etichette.map((etichetta) => (
        <span key={etichetta} className={stili.etichetta}>
          {etichetta}
          <button
            type="button"
            className={stili.togli}
            onClick={() => onCambia(etichette.filter((voce) => voce !== etichetta))}
            aria-label={`Togli etichetta ${etichetta}`}
          >
            <IconaChiudi />
          </button>
        </span>
      ))}
      <input
        className={stili.input}
        value={testo}
        onChange={(evento) => setTesto(evento.target.value)}
        onKeyDown={gestisciTasto}
        onBlur={() => testo.trim() && aggiungi(testo)}
        list={idSuggerimenti}
        placeholder={etichette.length === 0 ? 'es. casa, spesa, auto' : ''}
        aria-label="Nuova etichetta"
        enterKeyHint="done"
      />
      <datalist id={idSuggerimenti}>
        {suggerimenti
          .filter((voce) => !etichette.includes(voce))
          .map((voce) => (
            <option key={voce} value={voce} />
          ))}
      </datalist>
    </div>
  );
}
