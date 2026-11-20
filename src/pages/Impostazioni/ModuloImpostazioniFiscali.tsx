/**
 * ModuloImpostazioniFiscali.tsx
 * Form delle impostazioni del regime forfettario: aliquota, coefficiente di redditività,
 * modalità di calcolo (prudente o netto INPS) e aliquota INPS per la stima dei contributi.
 * Mostra un esempio di calcolo su 1.000 € incassati.
 */

import { useState, type FormEvent } from 'react';
import { SceltaSegmentata } from '../../components/SceltaSegmentata/SceltaSegmentata';
import { ALIQUOTE_IMPOSTA_SOSTITUTIVA, COEFFICIENTI_REDDITIVITA } from '../../config/coefficientiRedditivita';
import { IMPOSTAZIONI_FISCALI_PREDEFINITE } from '../../config/impostazioniPredefinite';
import { salvaImpostazioniFiscali } from '../../db/impostazioniFiscaliRepository';
import { calcolaRiepilogoFiscale } from '../../domain/calcoloFiscale';
import { formattaCentesimiInEuro } from '../../domain/importi';
import { messaggioDaErrore } from '../../domain/messaggiErrore';
import { formattaPercentuale, frazioneInTestoPercentuale, testoPercentualeInFrazione } from '../../domain/numeri';
import type { ImpostazioniFiscali, ModalitaCalcoloImposta } from '../../types/fiscale';
import stili from './PaginaImpostazioni.module.css';

const INCASSO_DI_ESEMPIO_CENTESIMI = 100000;

type ProprietaModulo = {
  impostazioniIniziali: ImpostazioniFiscali;
  onSalvate: () => void;
};

export function ModuloImpostazioniFiscali({ impostazioniIniziali, onSalvate }: ProprietaModulo) {
  const [aliquota, setAliquota] = useState(String(impostazioniIniziali.aliquotaImpostaSostitutiva));
  const [testoCoefficiente, setTestoCoefficiente] = useState(frazioneInTestoPercentuale(impostazioniIniziali.coefficienteRedditivita));
  const [modalita, setModalita] = useState<ModalitaCalcoloImposta>(impostazioniIniziali.modalitaCalcolo);
  const [testoInps, setTestoInps] = useState(frazioneInTestoPercentuale(impostazioniIniziali.aliquotaContributiInps));
  const [inCorso, setInCorso] = useState(false);
  const [esito, setEsito] = useState<{ tipo: 'ok' | 'errore'; testo: string } | null>(null);

  const coefficiente = testoPercentualeInFrazione(testoCoefficiente);
  const aliquotaInps = testoPercentualeInFrazione(testoInps);
  const valide: ImpostazioniFiscali | null =
    coefficiente !== null && aliquotaInps !== null
      ? {
          aliquotaImpostaSostitutiva: Number(aliquota),
          coefficienteRedditivita: coefficiente,
          modalitaCalcolo: modalita,
          aliquotaContributiInps: aliquotaInps,
        }
      : null;

  // Nell'esempio si suppone di aver versato contributi pari alla stima INPS:
  // così la modalità "al netto dei contributi" mostra davvero la deduzione.
  const contributiDiEsempioCentesimi = valide
    ? Math.round(
        Math.round(INCASSO_DI_ESEMPIO_CENTESIMI * valide.coefficienteRedditivita) * valide.aliquotaContributiInps
      )
    : 0;
  const esempio = valide
    ? calcolaRiepilogoFiscale(
        { incassatoCentesimi: INCASSO_DI_ESEMPIO_CENTESIMI, contributiInpsVersatiCentesimi: contributiDiEsempioCentesimi },
        valide
      )
    : null;
  // Imposta con l'altra modalità, per confronto
  const esempioAltraModalita = valide
    ? calcolaRiepilogoFiscale(
        { incassatoCentesimi: INCASSO_DI_ESEMPIO_CENTESIMI, contributiInpsVersatiCentesimi: contributiDiEsempioCentesimi },
        { ...valide, modalitaCalcolo: valide.modalitaCalcolo === 'prudente' ? 'netto_inps' : 'prudente' }
      )
    : null;

  function ripristina() {
    const predefinite = IMPOSTAZIONI_FISCALI_PREDEFINITE;
    setAliquota(String(predefinite.aliquotaImpostaSostitutiva));
    setTestoCoefficiente(frazioneInTestoPercentuale(predefinite.coefficienteRedditivita));
    setModalita(predefinite.modalitaCalcolo);
    setTestoInps(frazioneInTestoPercentuale(predefinite.aliquotaContributiInps));
    setEsito(null);
  }

  async function gestisciInvio(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (!valide) return;
    setInCorso(true);
    setEsito(null);
    try {
      await salvaImpostazioniFiscali(valide);
      setEsito({ tipo: 'ok', testo: 'Impostazioni salvate.' });
      onSalvate();
    } catch (eccezione: unknown) {
      setEsito({ tipo: 'errore', testo: `Salvataggio non riuscito: ${messaggioDaErrore(eccezione)}` });
    } finally {
      setInCorso(false);
    }
  }

  return (
    <form className={stili.modulo} onSubmit={gestisciInvio} noValidate>
      <div className="campo">
        Aliquota dell'imposta sostitutiva
        <SceltaSegmentata
          nome="Aliquota dell'imposta sostitutiva"
          opzioni={ALIQUOTE_IMPOSTA_SOSTITUTIVA.map((voce) => ({
            valore: String(voce.aliquota),
            etichetta: voce.descrizione,
            colore: 'verde' as const,
          }))}
          valore={aliquota}
          onCambia={setAliquota}
        />
      </div>

      <label className="campo">
        Coefficiente di redditività (%)
        <input
          inputMode="decimal"
          value={testoCoefficiente}
          onChange={(evento) => setTestoCoefficiente(evento.target.value)}
          aria-invalid={coefficiente === null}
          list="coefficienti-comuni"
        />
        <datalist id="coefficienti-comuni">
          {COEFFICIENTI_REDDITIVITA.map((voce) => (
            <option key={voce.coefficiente} value={frazioneInTestoPercentuale(voce.coefficiente)}>
              {voce.descrizione}
            </option>
          ))}
        </datalist>
        {coefficiente === null && <span className="campo__errore">Inserisci una percentuale tra 0 e 100.</span>}
        <span className="campo__aiuto">
          Dipende dal codice ATECO.{' '}
          {COEFFICIENTI_REDDITIVITA.find((voce) => voce.coefficiente === coefficiente)?.descrizione ?? ''}
        </span>
      </label>

      <fieldset className={stili.gruppoModalita}>
        <legend>Come calcolare l'imposta</legend>
        <label className={stili.opzioneModalita}>
          <input type="radio" name="modalita" checked={modalita === 'prudente'} onChange={() => setModalita('prudente')} />
          <span>
            <strong>Prudente</strong>
            <span className={stili.descrizioneModalita}>
              Imposta sul {coefficiente !== null ? formattaPercentuale(coefficiente) : 'coefficiente'} dell'incassato, senza
              togliere i contributi INPS: accantoni un po' di più per stare larghi.
            </span>
          </span>
        </label>
        <label className={stili.opzioneModalita}>
          <input type="radio" name="modalita" checked={modalita === 'netto_inps'} onChange={() => setModalita('netto_inps')} />
          <span>
            <strong>Al netto dei contributi INPS</strong>
            <span className={stili.descrizioneModalita}>
              Dal reddito si tolgono i contributi INPS versati, come previsto dalla norma.
            </span>
          </span>
        </label>
      </fieldset>

      <label className="campo">
        Aliquota contributi INPS (%)
        <input inputMode="decimal" value={testoInps} onChange={(evento) => setTestoInps(evento.target.value)} aria-invalid={aliquotaInps === null} />
        {aliquotaInps === null && <span className="campo__errore">Inserisci una percentuale tra 0 e 100.</span>}
        <span className="campo__aiuto">
          Serve solo a stimare i contributi da mettere da parte (es. Gestione Separata). Verifica il valore con il tuo commercialista.
        </span>
      </label>

      {esempio && (
        <div className={stili.esempio}>
          <p className={stili.esempioTitolo}>
            Esempio con {formattaCentesimiInEuro(INCASSO_DI_ESEMPIO_CENTESIMI)} incassati e{' '}
            {formattaCentesimiInEuro(contributiDiEsempioCentesimi)} di contributi INPS versati
          </p>
          <dl className={stili.esempioValori}>
            <div>
              <dt>Imposta</dt>
              <dd>{formattaCentesimiInEuro(esempio.impostaSostitutivaCentesimi)}</dd>
            </div>
            <div>
              <dt>INPS stimato</dt>
              <dd>{formattaCentesimiInEuro(esempio.contributiInpsStimatiCentesimi)}</dd>
            </div>
            <div>
              <dt>Netto stimato</dt>
              <dd>{formattaCentesimiInEuro(esempio.nettoStimatoCentesimi)}</dd>
            </div>
          </dl>
          {esempioAltraModalita && (
            <p className={stili.esempioConfronto}>
              Base imponibile {formattaCentesimiInEuro(esempio.baseImponibileCentesimi)}. Con l'altra modalità l'imposta
              sarebbe {formattaCentesimiInEuro(esempioAltraModalita.impostaSostitutivaCentesimi)}.
            </p>
          )}
        </div>
      )}

      {esito && (
        <p className={esito.tipo === 'ok' ? stili.esitoOk : 'campo__errore'} role="status">
          {esito.testo}
        </p>
      )}

      <div className={stili.azioni}>
        <button type="button" className="bottone" onClick={ripristina} disabled={inCorso}>
          Ripristina predefiniti
        </button>
        <button type="submit" className="bottone bottone--primario" disabled={inCorso || !valide}>
          {inCorso ? 'Salvataggio…' : 'Salva'}
        </button>
      </div>
    </form>
  );
}
