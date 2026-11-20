/**
 * utenti.test.ts
 * Test della conversione tra nome utente ed email di accesso.
 */

import { describe, it, expect } from 'vitest';
import { emailInNomeUtente, nomeUtenteInEmail } from '../utenti';

describe('nomeUtenteInEmail', () => {
  it('aggiunge il dominio, toglie spazi e usa le minuscole', () => {
    expect(nomeUtenteInEmail(' Nicola ')).toBe('nicola@account.invalid');
    expect(nomeUtenteInEmail('nicola.abeni_1')).toBe('nicola.abeni_1@account.invalid');
  });
  it('lascia invariata un\'email completa', () => {
    expect(nomeUtenteInEmail('Nome@Esempio.it')).toBe('nome@esempio.it');
  });
  it('rifiuta nomi vuoti o con caratteri non ammessi', () => {
    expect(nomeUtenteInEmail('')).toBeNull();
    expect(nomeUtenteInEmail('nome utente')).toBeNull();
    expect(nomeUtenteInEmail('nicolà')).toBeNull();
  });
});

describe('emailInNomeUtente', () => {
  it('toglie il dominio interno, lascia le altre email', () => {
    expect(emailInNomeUtente('nicola@account.invalid')).toBe('nicola');
    expect(emailInNomeUtente('nome@esempio.it')).toBe('nome@esempio.it');
  });
});
