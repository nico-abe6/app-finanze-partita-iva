/**
 * coefficientiRedditivita.ts
 * Coefficienti di redditività del regime forfettario per gruppo di attività (codice ATECO),
 * proposti come scelta rapida nella pagina Impostazioni.
 * Fonte: Legge 190/2014, allegato 4, come modificato dalla Legge 145/2018.
 * Verificare sempre il proprio codice ATECO con il commercialista.
 */

export type VoceCoefficiente = { coefficiente: number; descrizione: string };

export const COEFFICIENTI_REDDITIVITA: VoceCoefficiente[] = [
  { coefficiente: 0.78, descrizione: 'Professioni, attività scientifiche e tecniche, sanità, istruzione, servizi finanziari e assicurativi' },
  { coefficiente: 0.67, descrizione: 'Altre attività economiche' },
  { coefficiente: 0.86, descrizione: 'Costruzioni e attività immobiliari' },
  { coefficiente: 0.62, descrizione: 'Intermediari del commercio' },
  { coefficiente: 0.54, descrizione: 'Commercio ambulante di altri prodotti' },
  { coefficiente: 0.4, descrizione: 'Commercio, alloggio e ristorazione, industrie alimentari, ambulanti di alimenti' },
];

/** Aliquote dell'imposta sostitutiva: 5% per i primi 5 anni se si hanno i requisiti, altrimenti 15% */
export const ALIQUOTE_IMPOSTA_SOSTITUTIVA = [
  { aliquota: 0.05, descrizione: '5% – nuova attività (primi 5 anni)' },
  { aliquota: 0.15, descrizione: '15% – aliquota ordinaria' },
];
