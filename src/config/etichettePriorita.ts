import type { TipoSpesa } from "../types/finanze";

export const ETICHETTE_PRIORITA: Record<TipoSpesa, string> = {
    devo: 'Devo',
    ho_bisogno: 'Ho Bisogno',
    voglio: 'Voglio',
};