/**
 * fiscale.ts
 * Tipi dei dati legati alla partita IVA in regime forfettario.
 * Tutti gli importi sono in centesimi di euro (numeri interi).
 */

/** Come calcolare la base imponibile */
export type ModalitaCalcoloImposta =
  | 'netto_inps'   // (fatturato × coefficiente) − stima dei contributi INPS
  | 'prudente';    // fatturato × coefficiente, senza togliere l'INPS

/** Una riga per ogni mese di attività */
export type FatturatoMensile = {
  id?: string;                       // uuid assegnato dal database
  anno: number;                      // es. 2026
  mese: number;                      // da 1 a 12
  incassatoCentesimi: number;        // fatturato del mese (importo delle fatture emesse)
  contributiInpsVersatiCentesimi: number; // non più usato nei calcoli (sempre 0): l'INPS è stimato in automatico
  note?: string;                     // il ? vuol dire che è facoltativo
};

/** Impostazioni fiscali modificabili dall'utente */
export type ImpostazioniFiscali = {
  aliquotaImpostaSostitutiva: number;  // 0.05 oppure 0.15
  coefficienteRedditivita: number;     // es. 0.78
  modalitaCalcolo: ModalitaCalcoloImposta;
  aliquotaContributiInps: number;      // es. 0.2607, serve per stimare l'INPS
};

/** Totali di partenza per un periodo (un mese, un anno, tutto) */
export type TotaliPeriodo = {
  incassatoCentesimi: number;
  contributiInpsVersatiCentesimi: number;
};

/** Risultato del calcolo fiscale di un periodo */
export type RiepilogoFiscale = {
  incassatoCentesimi: number;
  redditoLordoCentesimi: number;
  baseImponibileCentesimi: number;
  impostaSostitutivaCentesimi: number;
  contributiInpsStimatiCentesimi: number;
  nettoStimatoCentesimi: number;
};
/** Riepilogo fiscale di un singolo mese di un anno */
export type RiepilogoMese = {
  mese: number;          // da 1 a 12
  haDati: boolean;       // false se il mese non è stato inserito
  riepilogo: RiepilogoFiscale;
};

/** Riepilogo fiscale di un anno intero (il valore che fa fede) */
export type RiepilogoAnno = {
  anno: number;
  riepilogo: RiepilogoFiscale;
};
