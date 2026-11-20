/**
 * anni.test.ts
 * Test degli anni proposti nei selettori.
 */

import { describe, it, expect } from 'vitest';
import { annoIniziale, anniSelezionabili } from '../anni';

describe('anniSelezionabili', () => {
  it('unisce anni con dati e intervallo intorno all\'anno corrente', () => {
    expect(anniSelezionabili([2021, 2026], 2026, 2, 1)).toEqual([2021, 2024, 2025, 2026, 2027]);
    expect(anniSelezionabili([], 2026)).toEqual([2026]);
  });
});

describe('annoIniziale', () => {
  it('preferisce l\'anno corrente se ha dati o se non ci sono dati', () => {
    expect(annoIniziale([2025, 2026], 2026)).toBe(2026);
    expect(annoIniziale([], 2026)).toBe(2026);
  });
  it('altrimenti l\'ultimo anno passato con dati', () => {
    expect(annoIniziale([2023, 2025], 2026)).toBe(2025);
  });
});
