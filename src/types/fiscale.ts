/**
 * fiscale.ts
 * Tipi dei dati legati alla partita IVA in regime forfettario.
 * Tutti gli importi sono in centesimi di euro (numeri interi).
 */

/** Come calcolare la base imponibile */
export type ModalitaCalcoloImposta =
  | 'netto_inps'   // incassato × coefficiente − contributi INPS versati
  | 'prudente';    // incassato × coefficiente, senza dedurre l'INPS

/** Una riga per ogni mese di attività */
export type FatturatoMensile = {
  id?: number;                       // lo assegna il database
  anno: number;                      // es. 2026
  mese: number;                      // da 1 a 12
  incassatoCentesimi: number;        // incassato nel mese (principio di cassa)
  contributiInpsVersatiCentesimi: number;
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