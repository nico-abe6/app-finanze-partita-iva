/**
 * utenti.ts
 * Conversione tra nome utente (quello che si scrive nel login) e l'email
 * con cui l'utente è registrato su Supabase ("nome@account.invalid").
 */

import { DOMINIO_UTENTI } from '../config/accesso';

// lettere, numeri, punto, trattino e trattino basso
const FORMATO_NOME_UTENTE = /^[a-z0-9._-]+$/;

/**
 * Dal testo scritto nel campo login all'email per Supabase.
 * Un testo che contiene già "@" viene usato così com'è (accesso con email completa).
 * Restituisce null se il nome utente contiene caratteri non ammessi.
 */
export function nomeUtenteInEmail(testo: string): string | null {
  const pulito = testo.trim().toLowerCase();
  if (pulito.includes('@')) return pulito;
  if (!FORMATO_NOME_UTENTE.test(pulito)) return null;
  return `${pulito}@${DOMINIO_UTENTI}`;
}

/** Dall'email dell'utente al nome da mostrare: "nicola@account.invalid" -> "nicola" */
export function emailInNomeUtente(email: string): string {
  const suffisso = `@${DOMINIO_UTENTI}`;
  return email.toLowerCase().endsWith(suffisso) ? email.slice(0, -suffisso.length) : email;
}
