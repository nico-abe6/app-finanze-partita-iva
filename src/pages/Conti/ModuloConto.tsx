/**
 * ModuloConto.tsx
 * Form per creare o modificare un conto: nome, tipo, saldo iniziale e colore.
 */

import { useState, type FormEvent } from 'react';
import { SceltaSegmentata } from '../../components/SceltaSegmentata/SceltaSegmentata';
import { ETICHETTE_CONTO } from '../../config/etichetteTipoConto';
import { eliminaConto, salvaConto } from '../../db/contiRepository';
import { coloreDelConto } from '../../domain/coloriConto';
import { centesimiInTestoModificabile, convertiTestoInCentesimiConSegno } from '../../domain/importi';
import { messaggioDaErrore } from '../../domain/messaggiErrore';
import { COLORI_CONTO, type ColoreConto, type Conto, type TipoConto } from '../../types/finanze';
import stili from './PaginaConti.module.css';

type ProprietaModuloConto = {
  contoEsistente?: Conto;
  onFatto: () => void;
  onAnnulla: () => void;
};

const TIPI_CONTO = Object.keys(ETICHETTE_CONTO) as TipoConto[];

export function ModuloConto({ contoEsistente, onFatto, onAnnulla }: ProprietaModuloConto) {
  const [nome, setNome] = useState(contoEsistente?.nomeConto ?? '');
  const [tipo, setTipo] = useState<TipoConto>(contoEsistente?.tipoConto ?? 'corrente');
  const [testoSaldo, setTestoSaldo] = useState(
    contoEsistente ? centesimiInTestoModificabile(contoEsistente.saldoInizialeCentesimi) : ''
  );
  const [colore, setColore] = useState<ColoreConto>(
    contoEsistente ? coloreDelConto(contoEsistente) : 'azzurro'
  );
  const [inCorso, setInCorso] = useState(false);
  const [confermaEliminazione, setConfermaEliminazione] = useState(false);
  const [errore, setErrore] = useState<string | null>(null);
  const [tentatoInvio, setTentatoInvio] = useState(false);

  const saldoCentesimi = testoSaldo.trim() === '' ? 0 : convertiTestoInCentesimiConSegno(testoSaldo);
  const nomeValido = nome.trim() !== '';

  async function gestisciInvio(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setTentatoInvio(true);
    if (!nomeValido || saldoCentesimi === null) return;
    setInCorso(true);
    setErrore(null);
    try {
      await salvaConto({ id: contoEsistente?.id, nomeConto: nome, tipoConto: tipo, saldoInizialeCentesimi: saldoCentesimi, colore });
      onFatto();
    } catch (eccezione: unknown) {
      setErrore(`Salvataggio non riuscito: ${messaggioDaErrore(eccezione)}`);
      setInCorso(false);
    }
  }

  async function gestisciEliminazione() {
    if (!contoEsistente?.id) return;
    if (!confermaEliminazione) {
      setConfermaEliminazione(true);
      return;
    }
    setInCorso(true);
    setErrore(null);
    try {
      await eliminaConto(contoEsistente.id);
      onFatto();
    } catch (eccezione: unknown) {
      setErrore(messaggioDaErrore(eccezione));
      setInCorso(false);
      setConfermaEliminazione(false);
    }
  }

  return (
    <form className={stili.modulo} onSubmit={gestisciInvio} noValidate>
      <label className="campo">
        Nome del conto
        <input value={nome} onChange={(evento) => setNome(evento.target.value)} placeholder="es. Banca, Contanti" autoFocus />
        {tentatoInvio && !nomeValido && <span className="campo__errore">Scrivi un nome.</span>}
      </label>

      <div className="campo">
        Tipo
        <SceltaSegmentata
          nome="Tipo di conto"
          opzioni={TIPI_CONTO.map((voce) => ({ valore: voce, etichetta: ETICHETTE_CONTO[voce] }))}
          valore={tipo}
          onCambia={setTipo}
        />
      </div>

      <label className="campo">
        Saldo iniziale (€)
        <input
          inputMode="decimal"
          autoComplete="off"
          placeholder="0,00"
          value={testoSaldo}
          onChange={(evento) => setTestoSaldo(evento.target.value)}
          aria-invalid={saldoCentesimi === null}
        />
        {saldoCentesimi === null && <span className="campo__errore">Importo non valido (es. 1250,50 o -80).</span>}
        <span className="campo__aiuto">Il saldo del conto prima dei movimenti che inserirai. Può essere negativo.</span>
      </label>

      <div className="campo">
        Colore
        <div className={stili.colori} role="radiogroup" aria-label="Colore del conto">
          {COLORI_CONTO.map((voce) => (
            <button
              key={voce}
              type="button"
              role="radio"
              aria-checked={colore === voce}
              aria-label={voce}
              className={`${stili.campione} ${colore === voce ? stili.campioneScelto : ''}`}
              style={{ backgroundColor: `var(--pastello-${voce})`, borderColor: `var(--scuro-${voce})` }}
              onClick={() => setColore(voce)}
            />
          ))}
        </div>
      </div>

      {errore && (
        <p className="campo__errore" role="alert">
          {errore}
        </p>
      )}

      <div className={stili.azioniModulo}>
        {contoEsistente && (
          <button type="button" className="bottone bottone--pericolo" onClick={gestisciEliminazione} disabled={inCorso}>
            {confermaEliminazione ? 'Conferma eliminazione' : 'Elimina'}
          </button>
        )}
        <span className={stili.spaziatore} />
        <button type="button" className="bottone" onClick={onAnnulla} disabled={inCorso}>
          Annulla
        </button>
        <button type="submit" className="bottone bottone--primario" disabled={inCorso}>
          {inCorso ? 'Salvataggio…' : 'Salva'}
        </button>
      </div>
    </form>
  );
}
