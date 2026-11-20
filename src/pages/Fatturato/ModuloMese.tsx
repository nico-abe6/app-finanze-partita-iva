/**
 * ModuloMese.tsx
 * Form per inserire o modificare il fatturato di un mese (l'importo delle fatture emesse).
 * Imposta, contributi INPS e netto vengono calcolati in automatico e mostrati in anteprima.
 */

import { useState, type FormEvent } from 'react';
import { eliminaFatturatoMensile, salvaFatturatoMensile } from '../../db/fatturatoMensileRepository';
import { calcolaRiepilogoFiscale } from '../../domain/calcoloFiscale';
import { centesimiInTestoModificabile, convertiTestoInCentesimi, formattaCentesimiInEuro } from '../../domain/importi';
import { messaggioDaErrore } from '../../domain/messaggiErrore';
import type { FatturatoMensile, ImpostazioniFiscali } from '../../types/fiscale';
import stili from './PaginaFatturato.module.css';

type ProprietaModuloMese = {
  anno: number;
  mese: number;
  rigaEsistente?: FatturatoMensile;
  impostazioni: ImpostazioniFiscali;
  onFatto: () => void; // dopo salvataggio o eliminazione riusciti
  onAnnulla: () => void;
};

export function ModuloMese({ anno, mese, rigaEsistente, impostazioni, onFatto, onAnnulla }: ProprietaModuloMese) {
  const [testoFatturato, setTestoFatturato] = useState(
    rigaEsistente ? centesimiInTestoModificabile(rigaEsistente.incassatoCentesimi) : ''
  );
  const [note, setNote] = useState(rigaEsistente?.note ?? '');
  const [inCorso, setInCorso] = useState(false);
  const [confermaEliminazione, setConfermaEliminazione] = useState(false);
  const [errore, setErrore] = useState<string | null>(null);
  const [tentatoInvio, setTentatoInvio] = useState(false);

  const fatturatoCentesimi = convertiTestoInCentesimi(testoFatturato);
  const anteprima =
    fatturatoCentesimi !== null
      ? calcolaRiepilogoFiscale({ incassatoCentesimi: fatturatoCentesimi, contributiInpsVersatiCentesimi: 0 }, impostazioni)
      : null;

  async function gestisciInvio(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setTentatoInvio(true);
    if (fatturatoCentesimi === null) return;

    setInCorso(true);
    setErrore(null);
    try {
      await salvaFatturatoMensile({
        anno,
        mese,
        incassatoCentesimi: fatturatoCentesimi,
        contributiInpsVersatiCentesimi: 0,
        note,
      });
      onFatto();
    } catch (eccezione: unknown) {
      setErrore(`Salvataggio non riuscito: ${messaggioDaErrore(eccezione)}`);
      setInCorso(false);
    }
  }

  async function gestisciEliminazione() {
    if (!confermaEliminazione) {
      setConfermaEliminazione(true);
      return;
    }
    setInCorso(true);
    setErrore(null);
    try {
      await eliminaFatturatoMensile(anno, mese);
      onFatto();
    } catch (eccezione: unknown) {
      setErrore(`Eliminazione non riuscita: ${messaggioDaErrore(eccezione)}`);
      setInCorso(false);
    }
  }

  return (
    <form className={stili.modulo} onSubmit={gestisciInvio} noValidate>
      <label className="campo">
        Fatturato nel mese (€)
        <input
          inputMode="decimal"
          autoComplete="off"
          placeholder="0,00"
          value={testoFatturato}
          onChange={(evento) => setTestoFatturato(evento.target.value)}
          aria-invalid={tentatoInvio && fatturatoCentesimi === null}
          autoFocus
        />
        {tentatoInvio && fatturatoCentesimi === null && (
          <span className="campo__errore">Importo non valido (es. 1250,50).</span>
        )}
        <span className="campo__aiuto">
          Il totale delle fatture emesse nel mese. Le tasse si pagano su ciò che incassi: se un cliente paga in un mese
          diverso, inserisci l'importo nel mese del pagamento.
        </span>
      </label>

      <label className="campo">
        Note
        <textarea rows={2} value={note} onChange={(evento) => setNote(evento.target.value)} placeholder="es. numeri delle fatture, clienti" />
      </label>

      {anteprima && anteprima.incassatoCentesimi > 0 && (
        <dl className={stili.anteprima}>
          <div>
            <dt>Imposta</dt>
            <dd>{formattaCentesimiInEuro(anteprima.impostaSostitutivaCentesimi)}</dd>
          </div>
          <div>
            <dt>INPS stimato</dt>
            <dd>{formattaCentesimiInEuro(anteprima.contributiInpsStimatiCentesimi)}</dd>
          </div>
          <div>
            <dt>Netto stimato</dt>
            <dd>{formattaCentesimiInEuro(anteprima.nettoStimatoCentesimi)}</dd>
          </div>
        </dl>
      )}

      {errore && (
        <p className="campo__errore" role="alert">
          {errore}
        </p>
      )}

      <div className={stili.azioniModulo}>
        {rigaEsistente && (
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
