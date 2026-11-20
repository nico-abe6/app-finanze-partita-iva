/**
 * movimenti.test.ts
 * Test di saldi, flussi, spese per priorità e per etichetta.
 */

import { describe, it, expect } from 'vitest';
import {
  calcolaFlussiMensili,
  calcolaRiepilogoFlussi,
  calcolaSaldiConti,
  calcolaSpesePerEtichetta,
  calcolaSpesePerPriorita,
  elencaAnniConMovimenti,
  elencaEtichette,
  filtraMovimentiPerPeriodo,
  normalizzaEtichetta,
  ordinaMovimentiPerDataDecrescente,
} from '../movimenti';
import type { Conto, Movimento } from '../../types/finanze';

const conti: Conto[] = [
  { id: 'corrente', nomeConto: 'Banca', tipoConto: 'corrente', saldoInizialeCentesimi: 100000 },
  { id: 'risparmi', nomeConto: 'Risparmi', tipoConto: 'risparmio', saldoInizialeCentesimi: 0 },
];

const movimenti: Movimento[] = [
  { id: '1', tipo: 'entrata', contoId: 'corrente', data: '2026-01-05', importoCentesimi: 300000, etichette: ['stipendio'] },
  { id: '2', tipo: 'uscita', contoId: 'corrente', data: '2026-01-10', importoCentesimi: 80000, etichette: ['casa'], priorita: 'devo' },
  { id: '3', tipo: 'uscita', contoId: 'corrente', data: '2026-01-15', importoCentesimi: 20000, etichette: ['spesa', 'casa'], priorita: 'ho_bisogno' },
  { id: '4', tipo: 'uscita', contoId: 'corrente', data: '2026-02-01', importoCentesimi: 5000, etichette: [], priorita: 'voglio' },
  { id: '5', tipo: 'risparmio', contoId: 'corrente', contoDestinazioneId: 'risparmi', data: '2026-02-02', importoCentesimi: 50000, etichette: [] },
  { id: '6', tipo: 'investimento', contoId: 'corrente', data: '2026-02-03', importoCentesimi: 25000, etichette: ['etf'] },
  { id: '7', tipo: 'trasferimento', contoId: 'risparmi', contoDestinazioneId: 'corrente', data: '2026-02-04', importoCentesimi: 10000, etichette: [] },
  { id: '8', tipo: 'uscita', contoId: 'corrente', data: '2025-12-20', importoCentesimi: 3000, etichette: ['regali'] },
];

describe('calcolaSaldiConti', () => {
  it('applica entrate, uscite, risparmi, investimenti e trasferimenti', () => {
    const saldi = calcolaSaldiConti(conti, movimenti);
    // corrente: 1000 + 3000 - 800 - 200 - 50 - 500 - 250 + 100 - 30 = 2270 €
    expect(saldi.get('corrente')).toBe(227000);
    // risparmi: 0 + 500 - 100 = 400 €
    expect(saldi.get('risparmi')).toBe(40000);
  });
});

describe('periodi', () => {
  it('filtra per anno e per mese', () => {
    expect(filtraMovimentiPerPeriodo(movimenti, 2026)).toHaveLength(7);
    expect(filtraMovimentiPerPeriodo(movimenti, 2026, 2).map((m) => m.id)).toEqual(['4', '5', '6', '7']);
    expect(elencaAnniConMovimenti(movimenti)).toEqual([2025, 2026]);
  });
});

describe('calcolaRiepilogoFlussi', () => {
  it('somma per tipo, ignora i trasferimenti e calcola il tasso di risparmio', () => {
    const flussi = calcolaRiepilogoFlussi(filtraMovimentiPerPeriodo(movimenti, 2026));
    expect(flussi).toEqual({
      entrateCentesimi: 300000,
      usciteCentesimi: 105000,
      risparmiatoCentesimi: 50000,
      investitoCentesimi: 25000,
      tassoRisparmio: 0.25,
    });
  });
  it('senza entrate il tasso è null', () => {
    expect(calcolaRiepilogoFlussi([]).tassoRisparmio).toBeNull();
  });
  it('divide per mese', () => {
    const mesi = calcolaFlussiMensili(movimenti, 2026);
    expect(mesi).toHaveLength(12);
    expect(mesi[0].flussi.usciteCentesimi).toBe(100000);
    expect(mesi[1].flussi.usciteCentesimi).toBe(5000);
  });
});

describe('spese per priorità ed etichetta', () => {
  it('somma solo le uscite per priorità', () => {
    expect(calcolaSpesePerPriorita(movimenti)).toEqual({ devo: 80000, ho_bisogno: 20000, voglio: 5000, non_indicata: 3000 });
  });
  it('ordina per importo, conta più etichette e raggruppa il resto', () => {
    const tutte = calcolaSpesePerEtichetta(movimenti, 10);
    expect(tutte).toEqual([
      { etichetta: 'casa', importoCentesimi: 100000 },
      { etichetta: 'spesa', importoCentesimi: 20000 },
      { etichetta: 'senza etichetta', importoCentesimi: 5000 },
      { etichetta: 'regali', importoCentesimi: 3000 },
    ]);
    expect(calcolaSpesePerEtichetta(movimenti, 2)).toEqual([
      { etichetta: 'casa', importoCentesimi: 100000 },
      { etichetta: 'altre', importoCentesimi: 28000 },
    ]);
  });
});

describe('etichette e ordinamento', () => {
  it('normalizza ed elenca', () => {
    expect(normalizzaEtichetta('  Spesa   Casa ')).toBe('spesa casa');
    expect(elencaEtichette(movimenti)).toEqual(['casa', 'etf', 'regali', 'spesa', 'stipendio']);
  });
  it('ordina dal più recente', () => {
    expect(ordinaMovimentiPerDataDecrescente(movimenti)[0].id).toBe('7');
  });
});
