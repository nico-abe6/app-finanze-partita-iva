/**
 * calcoloFiscale.test.ts
 * Test delle funzioni di calcolo del regime forfettario.
 * Importi in centesimi. I valori attesi sono calcolati a mano dalle regole della Fase 4.
 */

import { describe, it, expect } from 'vitest';
import { calcolaRiepilogoFiscale, sommaFatturatoMensile } from '../calcoloFiscale';
import type { ImpostazioniFiscali, FatturatoMensile } from '../../types/fiscale';

const impostazioniPrudenti: ImpostazioniFiscali = {
  aliquotaImpostaSostitutiva: 0.05,
  coefficienteRedditivita: 0.78,
  modalitaCalcolo: 'prudente',
  aliquotaContributiInps: 0.2607,
};

const impostazioniNettoInps: ImpostazioniFiscali = {
  ...impostazioniPrudenti,
  modalitaCalcolo: 'netto_inps',
};

describe('calcolaRiepilogoFiscale', () => {
  it('modalità prudente: 1 000 € incassati', () => {
    const risultato = calcolaRiepilogoFiscale(
      { incassatoCentesimi: 100000, contributiInpsVersatiCentesimi: 0 },
      impostazioniPrudenti
    );
    expect(risultato).toEqual({
      incassatoCentesimi: 100000,
      redditoLordoCentesimi: 78000,
      baseImponibileCentesimi: 78000,
      impostaSostitutivaCentesimi: 3900,
      contributiInpsStimatiCentesimi: 20335,
      nettoStimatoCentesimi: 75765,
    });
  });

  it('modalità prudente: ignora i contributi versati', () => {
    const risultato = calcolaRiepilogoFiscale(
      { incassatoCentesimi: 100000, contributiInpsVersatiCentesimi: 20000 },
      impostazioniPrudenti
    );
    expect(risultato.baseImponibileCentesimi).toBe(78000);
    expect(risultato.impostaSostitutivaCentesimi).toBe(3900);
  });

  it('modalità netto INPS: toglie in automatico la stima dei contributi', () => {
    const risultato = calcolaRiepilogoFiscale(
      { incassatoCentesimi: 100000, contributiInpsVersatiCentesimi: 0 },
      impostazioniNettoInps
    );
    // reddito 780 € - INPS stimato 203,35 € = base 576,65 €; imposta 5% = 28,83 €
    expect(risultato.baseImponibileCentesimi).toBe(57665);
    expect(risultato.impostaSostitutivaCentesimi).toBe(2883);
    expect(risultato.nettoStimatoCentesimi).toBe(76782);
  });

  it('modalità netto INPS: ignora eventuali contributi versati salvati in passato', () => {
    const risultato = calcolaRiepilogoFiscale(
      { incassatoCentesimi: 100000, contributiInpsVersatiCentesimi: 99999 },
      impostazioniNettoInps
    );
    expect(risultato.baseImponibileCentesimi).toBe(57665);
  });

  it('la base imponibile non scende mai sotto zero', () => {
    // caso limite: aliquota INPS al 100%, la deduzione è pari a tutto il reddito
    const risultato = calcolaRiepilogoFiscale(
      { incassatoCentesimi: 10000, contributiInpsVersatiCentesimi: 0 },
      { ...impostazioniNettoInps, aliquotaContributiInps: 1 }
    );
    expect(risultato.baseImponibileCentesimi).toBe(0);
    expect(risultato.impostaSostitutivaCentesimi).toBe(0);
    expect(risultato.nettoStimatoCentesimi).toBe(2200);
  });

  it('nessun incasso: tutto a zero', () => {
    const risultato = calcolaRiepilogoFiscale(
      { incassatoCentesimi: 0, contributiInpsVersatiCentesimi: 0 },
      impostazioniPrudenti
    );
    expect(risultato.nettoStimatoCentesimi).toBe(0);
    expect(risultato.impostaSostitutivaCentesimi).toBe(0);
  });

  it('arrotonda al centesimo', () => {
    const risultato = calcolaRiepilogoFiscale(
      { incassatoCentesimi: 333, contributiInpsVersatiCentesimi: 0 },
      impostazioniPrudenti
    );
    expect(risultato.redditoLordoCentesimi).toBe(260);
    expect(risultato.impostaSostitutivaCentesimi).toBe(13);
    expect(risultato.contributiInpsStimatiCentesimi).toBe(68);
    expect(risultato.nettoStimatoCentesimi).toBe(252);
  });

  it('aliquota al 15%', () => {
    const risultato = calcolaRiepilogoFiscale(
      { incassatoCentesimi: 100000, contributiInpsVersatiCentesimi: 0 },
      { ...impostazioniPrudenti, aliquotaImpostaSostitutiva: 0.15 }
    );
    expect(risultato.impostaSostitutivaCentesimi).toBe(11700);
    expect(risultato.nettoStimatoCentesimi).toBe(67965);
  });
});

describe('sommaFatturatoMensile', () => {
  it('somma incassato e contributi di più mesi', () => {
    const righe: FatturatoMensile[] = [
      { anno: 2026, mese: 1, incassatoCentesimi: 100000, contributiInpsVersatiCentesimi: 0 },
      { anno: 2026, mese: 2, incassatoCentesimi: 250050, contributiInpsVersatiCentesimi: 15000 },
    ];
    expect(sommaFatturatoMensile(righe)).toEqual({
      incassatoCentesimi: 350050,
      contributiInpsVersatiCentesimi: 15000,
    });
  });

  it('lista vuota: zero', () => {
    expect(sommaFatturatoMensile([])).toEqual({
      incassatoCentesimi: 0,
      contributiInpsVersatiCentesimi: 0,
    });
  });
});