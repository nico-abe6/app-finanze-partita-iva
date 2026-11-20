/**
 * accesso.ts
 * Configurazione del login con nome utente.
 * Supabase richiede un'email: l'utente viene creato nel pannello come
 * "<nomeutente>@<DOMINIO_UTENTI>" e nell'app scrive solo il nome utente.
 * Il dominio ".invalid" è riservato e non riceve email (RFC 2606).
 */

export const DOMINIO_UTENTI = 'account.invalid';
