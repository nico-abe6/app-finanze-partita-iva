/**
 * backup.ts
 * Formato del file di backup (JSON) e controllo dei dati letti da un file:
 * fatturato mensile, impostazioni fiscali, conti, movimenti e widget del Riepilogo.
 * Importi in centesimi; gli id restano quelli del database, così un nuovo
 * import dello stesso file aggiorna i dati invece di duplicarli.
 */

import { normalizzaWidget } from './dashboard';
import type { WidgetDashboard } from '../types/dashboard';
import { COLORI_CONTO, type Conto, type Movimento, type TipoConto, type TipoMovimento, type TipoSpesa } from '../types/finanze';
import type { FatturatoMensile, ImpostazioniFiscali, ModalitaCalcoloImposta } from '../types/fiscale';

export const VERSIONE_BACKUP = 1;

export type DatiBackup = {
  versione: typeof VERSIONE_BACKUP;
  esportatoIl: string; // data e ora ISO
  fatturatoMensile: FatturatoMensile[];
  impostazioniFiscali: ImpostazioniFiscali | null;
  conti: Conto[];
  movimenti: Movimento[];
  widgetDashboard: WidgetDashboard[] | null;
};

export type EsitoLetturaBackup = { esito: 'ok'; dati: DatiBackup } | { esito: 'errore'; messaggio: string };

const TIPI_CONTO: TipoConto[] = ['corrente', 'risparmio', 'investimento', 'contanti'];
const TIPI_MOVIMENTO: TipoMovimento[] = ['entrata', 'uscita', 'risparmio', 'investimento', 'trasferimento'];
const PRIORITA: TipoSpesa[] = ['devo', 'ho_bisogno', 'voglio'];
const MODALITA: ModalitaCalcoloImposta[] = ['netto_inps', 'prudente'];
const FORMATO_DATA = /^\d{4}-\d{2}-\d{2}$/;

type Oggetto = Record<string, unknown>;

function eOggetto(valore: unknown): valore is Oggetto {
  return typeof valore === 'object' && valore !== null && !Array.isArray(valore);
}

function eInteroNonNegativo(valore: unknown): valore is number {
  return typeof valore === 'number' && Number.isInteger(valore) && valore >= 0;
}

function eFrazione(valore: unknown): valore is number {
  return typeof valore === 'number' && valore >= 0 && valore <= 1;
}

function testoFacoltativo(valore: unknown): string | undefined {
  return typeof valore === 'string' && valore !== '' ? valore : undefined;
}

function leggiFatturato(voce: unknown): FatturatoMensile | null {
  if (!eOggetto(voce)) return null;
  const { anno, mese, incassatoCentesimi, contributiInpsVersatiCentesimi } = voce;
  if (!Number.isInteger(anno) || !Number.isInteger(mese) || (mese as number) < 1 || (mese as number) > 12) return null;
  if (!eInteroNonNegativo(incassatoCentesimi) || !eInteroNonNegativo(contributiInpsVersatiCentesimi)) return null;
  return {
    id: testoFacoltativo(voce.id),
    anno: anno as number,
    mese: mese as number,
    incassatoCentesimi,
    contributiInpsVersatiCentesimi,
    note: testoFacoltativo(voce.note),
  };
}

function leggiImpostazioni(voce: unknown): ImpostazioniFiscali | null {
  if (!eOggetto(voce)) return null;
  const { aliquotaImpostaSostitutiva, coefficienteRedditivita, modalitaCalcolo, aliquotaContributiInps } = voce;
  if (!eFrazione(aliquotaImpostaSostitutiva) || !eFrazione(coefficienteRedditivita) || !eFrazione(aliquotaContributiInps)) return null;
  if (!MODALITA.includes(modalitaCalcolo as ModalitaCalcoloImposta)) return null;
  return {
    aliquotaImpostaSostitutiva,
    coefficienteRedditivita,
    modalitaCalcolo: modalitaCalcolo as ModalitaCalcoloImposta,
    aliquotaContributiInps,
  };
}

function leggiConto(voce: unknown): Conto | null {
  if (!eOggetto(voce)) return null;
  const { id, nomeConto, tipoConto, saldoInizialeCentesimi, colore } = voce;
  if (typeof id !== 'string' || id === '' || typeof nomeConto !== 'string' || nomeConto.trim() === '') return null;
  if (!TIPI_CONTO.includes(tipoConto as TipoConto)) return null;
  if (typeof saldoInizialeCentesimi !== 'number' || !Number.isInteger(saldoInizialeCentesimi)) return null;
  return {
    id,
    nomeConto,
    tipoConto: tipoConto as TipoConto,
    saldoInizialeCentesimi,
    colore: (COLORI_CONTO as readonly unknown[]).includes(colore) ? (colore as string) : undefined,
  };
}

function leggiMovimento(voce: unknown, idConti: Set<string>): Movimento | null {
  if (!eOggetto(voce)) return null;
  const { id, tipo, contoId, contoDestinazioneId, data, importoCentesimi, etichette, priorita } = voce;
  if (typeof id !== 'string' || id === '') return null;
  if (!TIPI_MOVIMENTO.includes(tipo as TipoMovimento)) return null;
  if (typeof contoId !== 'string' || !idConti.has(contoId)) return null;
  if (contoDestinazioneId !== undefined && contoDestinazioneId !== null && (typeof contoDestinazioneId !== 'string' || !idConti.has(contoDestinazioneId))) return null;
  if (tipo === 'trasferimento' && typeof contoDestinazioneId !== 'string') return null;
  if (typeof data !== 'string' || !FORMATO_DATA.test(data)) return null;
  if (!eInteroNonNegativo(importoCentesimi) || importoCentesimi === 0) return null;
  if (!Array.isArray(etichette) || !etichette.every((etichetta) => typeof etichetta === 'string')) return null;
  if (priorita !== undefined && priorita !== null && !PRIORITA.includes(priorita as TipoSpesa)) return null;
  return {
    id,
    tipo: tipo as TipoMovimento,
    contoId,
    contoDestinazioneId: typeof contoDestinazioneId === 'string' && tipo !== 'entrata' && tipo !== 'uscita' ? contoDestinazioneId : undefined,
    data,
    importoCentesimi,
    etichette: etichette as string[],
    priorita: tipo === 'uscita' && typeof priorita === 'string' ? (priorita as TipoSpesa) : undefined,
    descrizione: testoFacoltativo(voce.descrizione),
  };
}

/** Raccoglie i dati attuali in un oggetto pronto da salvare come file */
export function creaBackup(
  dati: Omit<DatiBackup, 'versione' | 'esportatoIl'>,
  esportatoIl: Date
): DatiBackup {
  return { versione: VERSIONE_BACKUP, esportatoIl: esportatoIl.toISOString(), ...dati };
}

/**
 * Controlla il contenuto di un file di backup.
 * Rifiuta l'intero file se una qualsiasi voce non è valida, così non si importa a metà.
 */
export function leggiBackup(valore: unknown): EsitoLetturaBackup {
  if (!eOggetto(valore) || valore.versione !== VERSIONE_BACKUP) {
    return { esito: 'errore', messaggio: 'Il file non è un backup di questa app (versione non riconosciuta).' };
  }
  const elenchi = ['fatturatoMensile', 'conti', 'movimenti'] as const;
  for (const nome of elenchi) {
    if (!Array.isArray(valore[nome])) return { esito: 'errore', messaggio: `Nel file manca l'elenco "${nome}".` };
  }

  const fatturatoMensile = (valore.fatturatoMensile as unknown[]).map(leggiFatturato);
  if (fatturatoMensile.includes(null)) return { esito: 'errore', messaggio: 'Una riga del fatturato non è valida.' };

  const conti = (valore.conti as unknown[]).map(leggiConto);
  if (conti.includes(null)) return { esito: 'errore', messaggio: 'Un conto non è valido.' };
  const idConti = new Set((conti as Conto[]).map((conto) => conto.id as string));

  const movimenti = (valore.movimenti as unknown[]).map((voce) => leggiMovimento(voce, idConti));
  if (movimenti.includes(null)) {
    return { esito: 'errore', messaggio: 'Un movimento non è valido o si riferisce a un conto assente.' };
  }

  let impostazioniFiscali: ImpostazioniFiscali | null = null;
  if (valore.impostazioniFiscali !== null && valore.impostazioniFiscali !== undefined) {
    impostazioniFiscali = leggiImpostazioni(valore.impostazioniFiscali);
    if (!impostazioniFiscali) return { esito: 'errore', messaggio: 'Le impostazioni fiscali non sono valide.' };
  }

  return {
    esito: 'ok',
    dati: {
      versione: VERSIONE_BACKUP,
      esportatoIl: typeof valore.esportatoIl === 'string' ? valore.esportatoIl : '',
      fatturatoMensile: fatturatoMensile as FatturatoMensile[],
      impostazioniFiscali,
      conti: conti as Conto[],
      movimenti: movimenti as Movimento[],
      widgetDashboard: Array.isArray(valore.widgetDashboard) ? normalizzaWidget(valore.widgetDashboard) : null,
    },
  };
}
