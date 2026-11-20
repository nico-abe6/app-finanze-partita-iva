/**
 * numeri.test.ts
 * Test di lettura di numeri e percentuali dai campi dei form.
 */

import { describe, it, expect } from 'vitest';
import {
  convertiTestoInNumero,
  formattaPercentuale,
  frazioneInTestoPercentuale,
  testoPercentualeInFrazione,
} from '../numeri';

describe('convertiTestoInNumero', () => {
  it('accetta virgola o punto', () => {
    expect(convertiTestoInNumero('26,07', 2)).toBe(26.07);
    expect(convertiTestoInNumero('26.07', 2)).toBe(26.07);
    expect(convertiTestoInNumero('5', 2)).toBe(5);
  });
  it('rifiuta testi non validi o con troppi decimali', () => {
    expect(convertiTestoInNumero('', 2)).toBeNull();
    expect(convertiTestoInNumero('abc', 2)).toBeNull();
    expect(convertiTestoInNumero('-3', 2)).toBeNull();
    expect(convertiTestoInNumero('1,234', 2)).toBeNull();
  });
});

describe('percentuali', () => {
  it('converte tra frazione e testo, andata e ritorno', () => {
    expect(frazioneInTestoPercentuale(0.2607)).toBe('26,07');
    expect(frazioneInTestoPercentuale(0.05)).toBe('5');
    expect(frazioneInTestoPercentuale(0.78)).toBe('78');
    expect(testoPercentualeInFrazione('26,07')).toBe(0.2607);
    expect(testoPercentualeInFrazione('78%')).toBe(0.78);
    expect(testoPercentualeInFrazione('101')).toBeNull();
  });
  it('formatta per la lettura', () => {
    expect(formattaPercentuale(0.2607)).toBe('26,07%');
  });
});
