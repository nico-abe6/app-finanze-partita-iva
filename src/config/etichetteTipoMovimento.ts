import type { TipoMovimento } from "../types/finanze";

export const ETICHETTE_MOVIMENTO: Record<TipoMovimento, string> = {
    entrata: 'Entrata',
    uscita: 'Uscita',
    risparmio: 'Risparmio',
    investimento: 'Investimento',
    trasferimento: 'Trasferimento',
};