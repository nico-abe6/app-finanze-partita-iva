/**
 * messaggiErrore.ts
 * Trasforma un errore qualsiasi (di rete, di Supabase, di JavaScript) in un testo da mostrare.
 */

export function messaggioDaErrore(errore: unknown): string {
  if (errore instanceof Error && errore.message) return errore.message;
  if (typeof errore === 'object' && errore !== null && 'message' in errore) {
    const messaggio = (errore as { message: unknown }).message;
    if (typeof messaggio === 'string' && messaggio) return messaggio;
  }
  return 'Errore sconosciuto.';
}
