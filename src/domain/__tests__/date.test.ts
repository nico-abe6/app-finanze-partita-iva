/**
 * date.test.ts
 * Test delle conversioni di data.
 */

import { describe, it, expect } from 'vitest';
import { dataInFormatoIso, formattaDataLeggibile } from '../date';

describe('date', () => {
  it('formatta in AAAA-MM-GG con l\'ora locale', () => {
    expect(dataInFormatoIso(new Date(2026, 0, 5, 23, 59))).toBe('2026-01-05');
  });
  it('rende leggibile una data', () => {
    expect(formattaDataLeggibile('2026-11-20')).toBe('ven 20 novembre');
  });
});
