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





