/**
 * SezioneBackup.tsx
 * Esporta tutti i dati in un file JSON e importa un file di backup.
 * L'import crea o aggiorna i dati (non cancella quelli già presenti).
 */

import { useRef, useState, type ChangeEvent } from 'react';
import { esportaTuttiIDati, importaDati } from '../../db/backupRepository';
import { leggiBackup, type DatiBackup } from '../../domain/backup';
import { dataInFormatoIso } from '../../domain/date';
import { messaggioDaErrore } from '../../domain/messaggiErrore';
import stili from './PaginaImpostazioni.module.css';

type Esito = { tipo: 'ok' | 'errore'; testo: string } | null;

/** Fa scaricare al browser un testo come file */
function scaricaFile(nomeFile: string, contenuto: string) {
  const url = URL.createObjectURL(new Blob([contenuto], { type: 'application/json' }));
  const collegamento = document.createElement('a');
  collegamento.href = url;
  collegamento.download = nomeFile;
  collegamento.click();
  URL.revokeObjectURL(url);
}

export function SezioneBackup() {
  const [inCorso, setInCorso] = useState(false);
  const [esito, setEsito] = useState<Esito>(null);
  const [daImportare, setDaImportare] = useState<DatiBackup | null>(null);
  const campoFile = useRef<HTMLInputElement>(null);

  async function esporta() {
    setInCorso(true);
    setEsito(null);
    try {
      const adesso = new Date();
      const dati = await esportaTuttiIDati(adesso);
      scaricaFile(`finanze-backup-${dataInFormatoIso(adesso)}.json`, JSON.stringify(dati, null, 2));
      setEsito({ tipo: 'ok', testo: 'Backup scaricato.' });
    } catch (eccezione: unknown) {
      setEsito({ tipo: 'errore', testo: `Esportazione non riuscita: ${messaggioDaErrore(eccezione)}` });
    } finally {
      setInCorso(false);
    }
  }

  async function leggiFileScelto(evento: ChangeEvent<HTMLInputElement>) {
    const file = evento.target.files?.[0];
    evento.target.value = ''; // permette di scegliere di nuovo lo stesso file
    setDaImportare(null);
    setEsito(null);
    if (!file) return;
    try {
      const letto = leggiBackup(JSON.parse(await file.text()));
      if (letto.esito === 'errore') setEsito({ tipo: 'errore', testo: letto.messaggio });
      else setDaImportare(letto.dati);
    } catch {
      setEsito({ tipo: 'errore', testo: 'Il file non è un JSON valido.' });
    }
  }

  async function confermaImport() {
    if (!daImportare) return;
    setInCorso(true);
    setEsito(null);
    try {
      await importaDati(daImportare);
      setDaImportare(null);
      setEsito({ tipo: 'ok', testo: 'Dati importati.' });
    } catch (eccezione: unknown) {
      setEsito({ tipo: 'errore', testo: `Importazione non riuscita: ${messaggioDaErrore(eccezione)}` });
    } finally {
      setInCorso(false);
    }
  }

  return (
    <div className={stili.modulo}>
      <p className="testo-secondario">
        Il piano gratuito di Supabase non fa copie di sicurezza: scarica un backup ogni tanto e conservalo.
      </p>

      <div className={stili.azioni}>
        <button type="button" className="bottone" onClick={() => campoFile.current?.click()} disabled={inCorso}>
          Importa backup…
        </button>
        <button type="button" className="bottone bottone--primario" onClick={esporta} disabled={inCorso}>
          Scarica backup
        </button>
      </div>
      <input ref={campoFile} type="file" accept="application/json,.json" hidden onChange={leggiFileScelto} />

      {daImportare && (
        <div className="messaggio messaggio--avviso">
          <p className={stili.riepilogoImport}>
            Il file contiene {daImportare.fatturatoMensile.length} mesi di fatturato, {daImportare.conti.length} conti e{' '}
            {daImportare.movimenti.length} movimenti. I dati con lo stesso identificativo (o lo stesso mese) verranno
            sovrascritti; gli altri restano invariati.
          </p>
          <div className={stili.azioni}>
            <button type="button" className="bottone" onClick={() => setDaImportare(null)} disabled={inCorso}>
              Annulla
            </button>
            <button type="button" className="bottone bottone--primario" onClick={confermaImport} disabled={inCorso}>
              {inCorso ? 'Importazione…' : 'Importa'}
            </button>
          </div>
        </div>
      )}

      {esito && (
        <p className={esito.tipo === 'ok' ? stili.esitoOk : 'campo__errore'} role="status">
          {esito.testo}
        </p>
      )}
    </div>
  );
}
