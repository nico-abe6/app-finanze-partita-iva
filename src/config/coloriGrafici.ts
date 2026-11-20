/**
 * coloriGrafici.ts
 * Colori delle serie nei grafici. Sono versioni piene dei pastelli del tema,
 * scelte e verificate per essere distinguibili anche da chi ha difficoltà a vedere i colori
 * (controllo di contrasto e daltonismo superato per le coppie che compaiono vicine).
 * Regola: azzurro e violetto non vanno mai uno accanto all'altro nello stesso grafico.
 */

export const COLORI_SERIE = {
  netto: '#2f8a63',     // verde
  inps: '#3b82c4',      // azzurro
  imposta: '#d0704a',   // corallo (accento caldo)
  incassato: '#7b5fd1', // violetto
} as const;

/** Colori di griglia, assi e superficie dei grafici */
export const COLORI_STRUTTURA_GRAFICO = {
  griglia: '#ece9f5',
  asse: '#d9d5e8',
  testoAsse: '#6c6f85',
  superficie: '#ffffff',
  evidenziaColonna: 'rgb(123 95 209 / 0.06)',
} as const;

/** Finanze personali: entrate e uscite (coppia verificata per il daltonismo) */
export const COLORI_FLUSSI = {
  entrate: '#3b82c4',  // azzurro
  uscite: '#d0704a',   // corallo
} as const;

/** Spese per priorità: verificati come gruppo; "ho bisogno" ha contrasto basso, per questo i valori sono sempre scritti */
export const COLORI_PRIORITA = {
  devo: '#c2413a',
  ho_bisogno: '#c98a1b',
  voglio: '#5b45a8',
  non_indicata: '#a5a3b5',
} as const;

/** Spese per etichetta: una sola serie, un solo colore */
export const COLORE_SPESE_ETICHETTA = '#7b5fd1';
