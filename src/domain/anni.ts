/**
 * anni.ts
 * Calcolo degli anni da proporre nei selettori.
 */

/**
 * Anni selezionabili in ordine crescente: tutti quelli con dati più l'intervallo
 * [annoCorrente - anniPrima, annoCorrente + anniDopo].
 */
export function anniSelezionabili(
  anniConDati: number[],
  annoCorrente: number,
  anniPrima = 0,
  anniDopo = 0
): number[] {
  const anni = new Set(anniConDati);
  for (let anno = annoCorrente - anniPrima; anno <= annoCorrente + anniDopo; anno++) anni.add(anno);
  return [...anni].sort((a, b) => a - b);
}

/** Anno da mostrare all'apertura: quello corrente se ha dati, altrimenti l'ultimo con dati */
export function annoIniziale(anniConDati: number[], annoCorrente: number): number {
  if (anniConDati.length === 0 || anniConDati.includes(annoCorrente)) return annoCorrente;
  const anniPassati = anniConDati.filter((anno) => anno < annoCorrente);
  return anniPassati.length > 0 ? Math.max(...anniPassati) : annoCorrente;
}
