import type { TipoConto } from "../types/finanze";

export const ETICHETTE_CONTO: Record<TipoConto, string> = {
    corrente: 'Conto corrente',
    risparmio: 'Conto risparmi',
    investimento: 'Conto investimenti',
    contanti: 'Contanti',
};