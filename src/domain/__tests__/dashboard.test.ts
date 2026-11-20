/**
 * dashboard.test.ts
 * Test della gestione dell'elenco dei widget.
 */

import { describe, it, expect } from 'vitest';
import {
  aggiungiWidget,
  creaWidgetPredefiniti,
  normalizzaWidget,
  rimuoviWidget,
  spostaWidget,
} from '../dashboard';
import type { WidgetDashboard } from '../../types/dashboard';

function generatoreId() {
  let contatore = 0;
  return () => `w${++contatore}`;
}

const lista: WidgetDashboard[] = [
  { id: 'a', tipo: 'riepilogo_anno' },
  { id: 'b', tipo: 'grafico_mensile' },
  { id: 'c', tipo: 'tabella_annuale' },
];

describe('normalizzaWidget', () => {
  it('tiene solo voci valide e scarta tipi sconosciuti e id doppi', () => {
    const letto = [
      { id: 'a', tipo: 'riepilogo_anno' },
      { id: 'b', tipo: 'tipo_inesistente' },
      { id: 'a', tipo: 'grafico_mensile' },
      { tipo: 'tabella_mensile' },
      null,
      'testo',
      { id: 'c', tipo: 'tabella_annuale' },
    ];
    expect(normalizzaWidget(letto)).toEqual([
      { id: 'a', tipo: 'riepilogo_anno' },
      { id: 'c', tipo: 'tabella_annuale' },
    ]);
  });

  it('restituisce una lista vuota se il valore non è una lista', () => {
    expect(normalizzaWidget(null)).toEqual([]);
    expect(normalizzaWidget({ id: 'a' })).toEqual([]);
  });
});

describe('modifica dell\'elenco', () => {
  it('crea i widget predefiniti con id generati', () => {
    expect(creaWidgetPredefiniti(generatoreId()).map((widget) => widget.id)).toEqual(['w1', 'w2', 'w3', 'w4']);
  });

  it('aggiunge in fondo', () => {
    const risultato = aggiungiWidget(lista, 'totale_da_inizio', generatoreId());
    expect(risultato.at(-1)).toEqual({ id: 'w1', tipo: 'totale_da_inizio' });
    expect(lista).toHaveLength(3); // la lista originale non cambia
  });

  it('rimuove per id', () => {
    expect(rimuoviWidget(lista, 'b').map((widget) => widget.id)).toEqual(['a', 'c']);
  });

  it('sposta su e giù, senza uscire dai bordi', () => {
    expect(spostaWidget(lista, 'b', -1).map((widget) => widget.id)).toEqual(['b', 'a', 'c']);
    expect(spostaWidget(lista, 'b', 1).map((widget) => widget.id)).toEqual(['a', 'c', 'b']);
    expect(spostaWidget(lista, 'a', -1)).toBe(lista);
    expect(spostaWidget(lista, 'c', 1)).toBe(lista);
    expect(spostaWidget(lista, 'z', 1)).toBe(lista);
  });
});
