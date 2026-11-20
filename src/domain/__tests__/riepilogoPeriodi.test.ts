/**
 * riepilogoPeriodi.test.ts
 * Test dei riepiloghi per mese, per anno e dall'inizio.
 * Valori attesi calcolati con le regole di calcoloFiscale.ts (coefficiente 0.78, aliquota 5%, INPS 26.07%).
 */

import { describe, it, expect } from 'vitest';
import {
  calcolaCumulatoMesi,
  calcolaRiepilogoAnni,
  calcolaRiepilogoAnno,
  calcolaRiepilogoMesi,
  calcolaRiepilogoTotale,
  elencaAnniConDati,
} from '../riepilogoPeriodi';
import type { FatturatoMensile, ImpostazioniFiscali } from '../../types/fiscale';

const impostazioni: ImpostazioniFiscali = {
  aliquotaImpostaSostitutiva: 0.05,
  coefficienteRedditivita: 0.78,
  modalitaCalcolo: 'netto_inps',
  aliquotaContributiInps: 0.2607,
};

const righe: FatturatoMensile[] = [
  { anno: 2025, mese: 12, incassatoCentesimi: 10000, contributiInpsVersatiCentesimi: 20000 },
  { anno: 2026, mese: 1, incassatoCentesimi: 100000, contributiInpsVersatiCentesimi: 0 },
  { anno: 2026, mese: 3, incassatoCentesimi: 100000, contributiInpsVersatiCentesimi: 20000 },
];

describe('elencaAnniConDati', () => {
  it('restituisce gli anni in ordine crescente senza doppioni', () => {
    expect(elencaAnniConDati(righe)).toEqual([2025, 2026]);
    expect(elencaAnniConDati([])).toEqual([]);
  });
});

describe('calcolaRiepilogoMesi', () => {
  it('restituisce sempre 12 mesi, con haDati solo per quelli inseriti', () => {
    const mesi = calcolaRiepilogoMesi(righe, impostazioni, 2026);
    expect(mesi).toHaveLength(12);
    expect(mesi.filter((voce) => voce.haDati).map((voce) => voce.mese)).toEqual([1, 3]);
    expect(mesi[1].riepilogo.incassatoCentesimi).toBe(0);
    // marzo: 1 000 € incassati, 200 € versati -> base 580 €, imposta 29 €
    expect(mesi[2].riepilogo.impostaSostitutivaCentesimi).toBe(2900);
  });
});

describe('calcolaRiepilogoAnno', () => {
  it('calcola sul totale dell\'anno (2 000 € incassati, 200 € versati)', () => {
    const anno = calcolaRiepilogoAnno(righe, impostazioni, 2026);
    expect(anno.incassatoCentesimi).toBe(200000);
    expect(anno.redditoLordoCentesimi).toBe(156000);
    expect(anno.baseImponibileCentesimi).toBe(136000);
    expect(anno.impostaSostitutivaCentesimi).toBe(6800);
    expect(anno.contributiInpsStimatiCentesimi).toBe(40669);
    expect(anno.nettoStimatoCentesimi).toBe(152531);
  });

  it('anno senza dati: tutto a zero', () => {
    expect(calcolaRiepilogoAnno(righe, impostazioni, 2030).nettoStimatoCentesimi).toBe(0);
  });
});

describe('calcolaRiepilogoTotale', () => {
  it('somma i riepiloghi annuali (la base di un anno non compensa un altro anno)', () => {
    const anni = calcolaRiepilogoAnni(righe, impostazioni);
    expect(anni.map((voce) => voce.anno)).toEqual([2025, 2026]);
    // 2025: base 0 (contributi > reddito), imposta 0
    expect(anni[0].riepilogo.impostaSostitutivaCentesimi).toBe(0);

    const totale = calcolaRiepilogoTotale(righe, impostazioni);
    expect(totale.incassatoCentesimi).toBe(210000);
    expect(totale.impostaSostitutivaCentesimi).toBe(6800);
    expect(totale.nettoStimatoCentesimi).toBe(152531 + 7967);
  });
});

describe('calcolaCumulatoMesi', () => {
  it('accumula incassato e netto da gennaio', () => {
    const cumulato = calcolaCumulatoMesi(calcolaRiepilogoMesi(righe, impostazioni, 2026));
    expect(cumulato[0].incassatoCumulatoCentesimi).toBe(100000);
    expect(cumulato[1].incassatoCumulatoCentesimi).toBe(100000);
    expect(cumulato[11].incassatoCumulatoCentesimi).toBe(200000);
  });
});
