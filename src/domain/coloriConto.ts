/**
 * coloriConto.ts
 * Colore da usare per un conto: quello scelto, oppure uno assegnato in base al tipo.
 */

import { COLORI_CONTO, type ColoreConto, type Conto } from '../types/finanze';

const COLORE_PER_TIPO: Record<Conto['tipoConto'], ColoreConto> = {
  corrente: 'azzurro',
  risparmio: 'verde',
  investimento: 'violetto',
  contanti: 'pesca',
};

export function coloreDelConto(conto: Conto): ColoreConto {
  return (COLORI_CONTO as readonly string[]).includes(conto.colore ?? '')
    ? (conto.colore as ColoreConto)
    : COLORE_PER_TIPO[conto.tipoConto];
}
