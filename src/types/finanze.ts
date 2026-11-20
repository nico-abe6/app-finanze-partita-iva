/**
 * finanze.ts
 * Tipi dei dati legati alla gestione delle finanze personali:
 * conti, risparmi, investimenti, contanti, entrate, uscite, etc...
 * Tutti gli importi sono in centesimi di euro (numeri interi)
 */

export type TipoConto =
    | 'corrente'
    | 'risparmio'
    | 'investimento'
    | 'contanti';

export type TipoMovimento =
    | 'entrata'
    | 'uscita'
    | 'risparmio'
    | 'investimento'
    | 'trasferimento';

export type TipoSpesa =
    | 'devo'
    | 'ho_bisogno'
    | 'voglio';

export type Conto = {
    id?: string;
    nomeConto: string;
    tipoConto: TipoConto;
    saldoInizialeCentesimi: number;
    colore?: string;
};

export type Movimento = {
    id?: string;
    tipo: TipoMovimento;
    contoId: string;
    data: string;
    importoCentesimi: number;
    etichette: string[];
    priorita?: TipoSpesa;
    descrizione?: string;
    contoDestinazioneId?: string;
};

/** Colori disponibili per i conti (corrispondono ai pastelli in variabili.css) */
export const COLORI_CONTO = ['verde', 'azzurro', 'violetto', 'acqua', 'pesca', 'rosa'] as const;
export type ColoreConto = (typeof COLORI_CONTO)[number];

/** Somme di un periodo per la parte finanze personali (importi in centesimi) */
export type RiepilogoFlussi = {
  entrateCentesimi: number;
  usciteCentesimi: number;
  risparmiatoCentesimi: number;
  investitoCentesimi: number;
  /** (risparmiato + investito) / entrate; null se non ci sono entrate */
  tassoRisparmio: number | null;
};

