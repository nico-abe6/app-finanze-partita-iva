/**
 * backup.test.ts
 * Test di creazione e lettura del file di backup.
 */

import { describe, it, expect } from 'vitest';
import { creaBackup, leggiBackup } from '../backup';

const datiValidi = creaBackup(
  {
    fatturatoMensile: [{ id: 'f1', anno: 2026, mese: 1, incassatoCentesimi: 100000, contributiInpsVersatiCentesimi: 0 }],
    impostazioniFiscali: {
      aliquotaImpostaSostitutiva: 0.05,
      coefficienteRedditivita: 0.78,
      modalitaCalcolo: 'prudente',
      aliquotaContributiInps: 0.2607,
    },
    conti: [
      { id: 'c1', nomeConto: 'Banca', tipoConto: 'corrente', saldoInizialeCentesimi: -5000, colore: 'verde' },
      { id: 'c2', nomeConto: 'Risparmi', tipoConto: 'risparmio', saldoInizialeCentesimi: 0 },
    ],
    movimenti: [
      { id: 'm1', tipo: 'uscita', contoId: 'c1', data: '2026-01-10', importoCentesimi: 1500, etichette: ['spesa'], priorita: 'devo' },
      { id: 'm2', tipo: 'trasferimento', contoId: 'c1', contoDestinazioneId: 'c2', data: '2026-01-11', importoCentesimi: 1000, etichette: [] },
    ],
    widgetDashboard: [{ id: 'w1', tipo: 'riepilogo_anno' }],
  },
  new Date('2026-11-20T10:00:00Z')
);

describe('leggiBackup', () => {
  it('rilegge un backup appena creato (anche dopo JSON)', () => {
    const riletto = leggiBackup(JSON.parse(JSON.stringify(datiValidi)));
    expect(riletto).toEqual({ esito: 'ok', dati: datiValidi });
  });

  it('rifiuta file non riconosciuti', () => {
    expect(leggiBackup({ ciao: 1 }).esito).toBe('errore');
    expect(leggiBackup(null).esito).toBe('errore');
    expect(leggiBackup({ ...datiValidi, versione: 99 }).esito).toBe('errore');
  });

  it('rifiuta voci non valide', () => {
    const meseSbagliato = { ...datiValidi, fatturatoMensile: [{ anno: 2026, mese: 13, incassatoCentesimi: 1, contributiInpsVersatiCentesimi: 0 }] };
    expect(leggiBackup(meseSbagliato).esito).toBe('errore');

    const contoAssente = {
      ...datiValidi,
      movimenti: [{ id: 'm9', tipo: 'uscita', contoId: 'zzz', data: '2026-01-01', importoCentesimi: 1, etichette: [] }],
    };
    expect(leggiBackup(contoAssente).esito).toBe('errore');

    const trasferimentoSenzaDestinazione = {
      ...datiValidi,
      movimenti: [{ id: 'm9', tipo: 'trasferimento', contoId: 'c1', data: '2026-01-01', importoCentesimi: 1, etichette: [] }],
    };
    expect(leggiBackup(trasferimentoSenzaDestinazione).esito).toBe('errore');
  });

  it('accetta impostazioni e widget assenti', () => {
    const riletto = leggiBackup({ ...datiValidi, impostazioniFiscali: null, widgetDashboard: undefined });
    expect(riletto.esito).toBe('ok');
    if (riletto.esito === 'ok') {
      expect(riletto.dati.impostazioniFiscali).toBeNull();
      expect(riletto.dati.widgetDashboard).toBeNull();
    }
  });
});
