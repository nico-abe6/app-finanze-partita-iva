/**
 * importi.test.ts
 * Test della conversione tra testo in euro e centesimi.
 */

import { describe, it, expect } from 'vitest';
import { convertiTestoInCentesimi, formattaCentesimiInEuro } from '../importi';

// Intl mette uno spazio "non separabile" (\u00a0) tra numero e simbolo €
const SPAZIO = '\u00a0';

describe('formattaCentesimiInEuro', () => {
  it('usa punto per le migliaia e virgola per i decimali', () => {
    expect(formattaCentesimiInEuro(125050)).toBe(`1.250,50${SPAZIO}€`);
  });
  it('mostra sempre due decimali', () => {
    expect(formattaCentesimiInEuro(0)).toBe(`0,00${SPAZIO}€`);
    expect(formattaCentesimiInEuro(5)).toBe(`0,05${SPAZIO}€`);
  });
  it('gestisce milioni e numeri negativi', () => {
    expect(formattaCentesimiInEuro(123456789)).toBe(`1.234.567,89${SPAZIO}€`);
    expect(formattaCentesimiInEuro(-1999)).toBe(`-19,99${SPAZIO}€`);
  });
});

describe('convertiTestoInCentesimi', () => {
  it.each([
    ['1250,50', 125050],
    ['1.250,50', 125050],
    ['1250.50', 125050],
    ['1.250', 125000],
    ['1.250.000', 125000000],
    ['12,5', 1250],
    ['12.5', 1250],
    ['0,01', 1],
    ['100', 10000],
    ['€ 1.250,50', 125050],
    [' 1 250,50 ', 125050],
  ])('"%s" diventa %i centesimi', (testo, attesi) => {
    expect(convertiTestoInCentesimi(testo)).toBe(attesi);
  });

  it.each(['', 'abc', '-10', '1,234', '1,2,3', '1.25.0', ',50', '10,', '1.2345'])(
    '"%s" non è valido',
    (testo) => {
      expect(convertiTestoInCentesimi(testo)).toBeNull();
    }
  );
});