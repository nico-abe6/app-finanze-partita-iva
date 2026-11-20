/**
 * ModuloMese.tsx
 * Form per inserire o modificare l'incassato e i contributi INPS versati di un mese.
 * Mostra in anteprima la stima di imposta, INPS e netto del mese.
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
  onFatto: () => void;    // dopo salvataggio o eliminazione riusciti
  onAnnulla: () => void;
};

const MESSAGGIO_IMPORTO_NON_VALIDO = 'Importo non valido (es. 1250,50).';

export function ModuloMese({ anno, mese, rigaEsistente, impostazioni, onFatto, onAnnulla }: ProprietaModuloMese) {
  const [testoIncassato, setTestoIncassato] = useState(
    rigaEsistente ? centesimiInTestoModificabile(rigaEsistente.incassatoCentesimi) : ''
  );
  const [testoContributi, setTestoContributi] = useState(
    rigaEsistente && rigaEsistente.contributiInpsVersatiCentesimi > 0
      ? centesimiInTestoModificabile(rigaEsistente.contributiInpsVersatiCentesimi)
      : ''
  );
  const [note, setNote] = useState(rigaEsistente?.note ?? '');
  const [inCorso, setInCorso] = useState(false);
  const [confermaEliminazione, setConfermaEliminazione] = useState(false);
  const [errore, setErrore] = useState<string | null>(null);
  const [tentatoInvio, setTentatoInvio] = useState(false);

  const incassatoCentesimi = convertiTestoInCentesimi(testoIncassato);
  // campo contributi vuoto = 0
  const contributiCentesimi = testoContributi.trim() === '' ? 0 : convertiTestoInCentesimi(testoContributi);
  const valoriValidi = incassatoCentesimi !== null && contributiCentesimi !== null;

  const anteprima = valoriValidi
    ? calcolaRiepilogoFiscale(
        { incassatoCentesimi, contributiInpsVersatiCentesimi: contributiCentesimi },
        impostazioni
      )
    : null;

  async function gestisciInvio(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setTentatoInvio(true);
    if (incassatoCentesimi === null || contributiCentesimi === null) return;

    setInCorso(true);
    setErrore(null);
    try {
      await salvaFatturatoMensile({
        anno,
        mese,
        incassatoCentesimi,
        contributiInpsVersatiCentesimi: contributiCentesimi,
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
        Incassato nel mese (€)
        <input
          inputMode="decimal"
          autoComplete="off"
          placeholder="0,00"
          value={testoIncassato}
          onChange={(evento) => setTestoIncassato(evento.target.value)}
          aria-invalid={tentatoInvio && incassatoCentesimi === null}
          autoFocus
        />
        {tentatoInvio && incassatoCentesimi === null && (
          <span className="campo__errore">{MESSAGGIO_IMPORTO_NON_VALIDO}</span>
        )}
        <span className="campo__aiuto">Conta ciò che hai incassato nel mese, non ciò che hai fatturato.</span>
      </label>

      <label className="campo">
        Contributi INPS versati nel mese (€)
        <input
          inputMode="decimal"
          autoComplete="off"
          placeholder="0,00"
          value={testoContributi}
          onChange={(evento) => setTestoContributi(evento.target.value)}
          aria-invalid={contributiCentesimi === null}
        />
        {contributiCentesimi === null && <span className="campo__errore">{MESSAGGIO_IMPORTO_NON_VALIDO}</span>}
      </label>

      <label className="campo">
        Note
        <textarea rows={2} value={note} onChange={(evento) => setNote(evento.target.value)} />
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
