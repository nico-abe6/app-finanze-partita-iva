/**
 * ModuloMovimento.tsx
 * Form per creare o modificare un movimento: tipo, importo, data, conto,
 * conto di destinazione (trasferimenti, risparmi, investimenti), priorità
 * (solo per le uscite: Devo / Ho bisogno / Voglio), etichette e descrizione.
 */

import { useState, type FormEvent } from 'react';
import { CampoEtichette } from '../../components/CampoEtichette/CampoEtichette';
import { SceltaSegmentata, type OpzioneSegmentata } from '../../components/SceltaSegmentata/SceltaSegmentata';
import { ETICHETTE_PRIORITA } from '../../config/etichettePriorita';
import { ETICHETTE_MOVIMENTO } from '../../config/etichetteTipoMovimento';
import { eliminaMovimento, salvaMovimento } from '../../db/movimentiRepository';
import { dataInFormatoIso } from '../../domain/date';
import { centesimiInTestoModificabile, convertiTestoInCentesimi } from '../../domain/importi';
import { messaggioDaErrore } from '../../domain/messaggiErrore';
import type { Conto, Movimento, TipoMovimento, TipoSpesa } from '../../types/finanze';
import stili from './PaginaConti.module.css';

type ProprietaModuloMovimento = {
  conti: Conto[];
  suggerimentiEtichette: string[];
  movimentoEsistente?: Movimento;
  contoPredefinitoId?: string;
  onFatto: () => void;
  onAnnulla: () => void;
};

const OPZIONI_TIPO: OpzioneSegmentata<TipoMovimento>[] = [
  { valore: 'uscita', etichetta: ETICHETTE_MOVIMENTO.uscita, colore: 'pesca' },
  { valore: 'entrata', etichetta: ETICHETTE_MOVIMENTO.entrata, colore: 'azzurro' },
  { valore: 'risparmio', etichetta: ETICHETTE_MOVIMENTO.risparmio, colore: 'verde' },
  { valore: 'investimento', etichetta: ETICHETTE_MOVIMENTO.investimento, colore: 'violetto' },
  { valore: 'trasferimento', etichetta: ETICHETTE_MOVIMENTO.trasferimento, colore: 'acqua' },
];

const OPZIONI_PRIORITA: OpzioneSegmentata<TipoSpesa | 'nessuna'>[] = [
  { valore: 'devo', etichetta: ETICHETTE_PRIORITA.devo, colore: 'rosa' },
  { valore: 'ho_bisogno', etichetta: ETICHETTE_PRIORITA.ho_bisogno, colore: 'pesca' },
  { valore: 'voglio', etichetta: ETICHETTE_PRIORITA.voglio, colore: 'violetto' },
  { valore: 'nessuna', etichetta: 'Non indicata' },
];

const TESTO_DESTINAZIONE: Partial<Record<TipoMovimento, string>> = {
  trasferimento: 'Verso il conto',
  risparmio: 'Verso il conto (facoltativo)',
  investimento: 'Verso il conto (facoltativo)',
};

export function ModuloMovimento({
  conti,
  suggerimentiEtichette,
  movimentoEsistente,
  contoPredefinitoId,
  onFatto,
  onAnnulla,
}: ProprietaModuloMovimento) {
  const [tipo, setTipo] = useState<TipoMovimento>(movimentoEsistente?.tipo ?? 'uscita');
  const [testoImporto, setTestoImporto] = useState(
    movimentoEsistente ? centesimiInTestoModificabile(movimentoEsistente.importoCentesimi) : ''
  );
  const [data, setData] = useState(() => movimentoEsistente?.data ?? dataInFormatoIso(new Date()));
  const [contoId, setContoId] = useState(movimentoEsistente?.contoId ?? contoPredefinitoId ?? conti[0]?.id ?? '');
  const [contoDestinazioneId, setContoDestinazioneId] = useState(movimentoEsistente?.contoDestinazioneId ?? '');
  const [priorita, setPriorita] = useState<TipoSpesa | 'nessuna'>(movimentoEsistente?.priorita ?? 'nessuna');
  const [etichette, setEtichette] = useState<string[]>(movimentoEsistente?.etichette ?? []);
  const [descrizione, setDescrizione] = useState(movimentoEsistente?.descrizione ?? '');
  const [inCorso, setInCorso] = useState(false);
  const [confermaEliminazione, setConfermaEliminazione] = useState(false);
  const [errore, setErrore] = useState<string | null>(null);
  const [tentatoInvio, setTentatoInvio] = useState(false);

  const importoCentesimi = convertiTestoInCentesimi(testoImporto);
  const importoValido = importoCentesimi !== null && importoCentesimi > 0;
  const usaDestinazione = tipo === 'trasferimento' || tipo === 'risparmio' || tipo === 'investimento';
  const destinazioneMancante = tipo === 'trasferimento' && contoDestinazioneId === '';
  const destinazioneUguale = usaDestinazione && contoDestinazioneId !== '' && contoDestinazioneId === contoId;
  const dataValida = /^\d{4}-\d{2}-\d{2}$/.test(data);
  const valido = importoValido && contoId !== '' && dataValida && !destinazioneMancante && !destinazioneUguale;

  async function gestisciInvio(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setTentatoInvio(true);
    if (!valido || importoCentesimi === null) return;
    setInCorso(true);
    setErrore(null);
    try {
      await salvaMovimento({
        id: movimentoEsistente?.id,
        tipo,
        importoCentesimi,
        data,
        contoId,
        contoDestinazioneId: usaDestinazione && contoDestinazioneId ? contoDestinazioneId : undefined,
        priorita: tipo === 'uscita' && priorita !== 'nessuna' ? priorita : undefined,
        etichette,
        descrizione,
      });
      onFatto();
    } catch (eccezione: unknown) {
      setErrore(`Salvataggio non riuscito: ${messaggioDaErrore(eccezione)}`);
      setInCorso(false);
    }
  }

  async function gestisciEliminazione() {
    if (!movimentoEsistente?.id) return;
    if (!confermaEliminazione) {
      setConfermaEliminazione(true);
      return;
    }
    setInCorso(true);
    try {
      await eliminaMovimento(movimentoEsistente.id);
      onFatto();
    } catch (eccezione: unknown) {
      setErrore(`Eliminazione non riuscita: ${messaggioDaErrore(eccezione)}`);
      setInCorso(false);
    }
  }

  return (
    <form className={stili.modulo} onSubmit={gestisciInvio} noValidate>
      <SceltaSegmentata nome="Tipo di movimento" opzioni={OPZIONI_TIPO} valore={tipo} onCambia={setTipo} />

      <div className={stili.rigaDoppia}>
        <label className="campo">
          Importo (€)
          <input
            inputMode="decimal"
            autoComplete="off"
            placeholder="0,00"
            value={testoImporto}
            onChange={(evento) => setTestoImporto(evento.target.value)}
            aria-invalid={tentatoInvio && !importoValido}
            autoFocus={!movimentoEsistente}
          />
          {tentatoInvio && !importoValido && <span className="campo__errore">Inserisci un importo maggiore di zero.</span>}
        </label>
        <label className="campo">
          Data
          <input type="date" value={data} onChange={(evento) => setData(evento.target.value)} required />
          {tentatoInvio && !dataValida && <span className="campo__errore">Scegli una data.</span>}
        </label>
      </div>

      <div className={stili.rigaDoppia}>
        <label className="campo">
          {usaDestinazione ? 'Dal conto' : 'Conto'}
          <select value={contoId} onChange={(evento) => setContoId(evento.target.value)}>
            {conti.map((conto) => (
              <option key={conto.id} value={conto.id}>
                {conto.nomeConto}
              </option>
            ))}
          </select>
        </label>
        {usaDestinazione && (
          <label className="campo">
            {TESTO_DESTINAZIONE[tipo]}
            <select value={contoDestinazioneId} onChange={(evento) => setContoDestinazioneId(evento.target.value)}>
              <option value="">{tipo === 'trasferimento' ? 'Scegli…' : 'Nessuno'}</option>
              {conti
                .filter((conto) => conto.id !== contoId)
                .map((conto) => (
                  <option key={conto.id} value={conto.id}>
                    {conto.nomeConto}
                  </option>
                ))}
            </select>
            {tentatoInvio && destinazioneMancante && <span className="campo__errore">Scegli il conto di destinazione.</span>}
          </label>
        )}
      </div>

      {tipo === 'uscita' && (
        <div className="campo">
          Priorità
          <SceltaSegmentata nome="Priorità della spesa" opzioni={OPZIONI_PRIORITA} valore={priorita} onCambia={setPriorita} />
        </div>
      )}

      <div className="campo">
        Etichette
        <CampoEtichette etichette={etichette} suggerimenti={suggerimentiEtichette} onCambia={setEtichette} />
      </div>

      <label className="campo">
        Descrizione
        <input value={descrizione} onChange={(evento) => setDescrizione(evento.target.value)} placeholder="facoltativa" />
      </label>

      {errore && (
        <p className="campo__errore" role="alert">
          {errore}
        </p>
      )}

      <div className={stili.azioniModulo}>
        {movimentoEsistente && (
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
