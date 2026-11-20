/**
 * PaginaLogin.tsx
 * Schermata di accesso con nome utente e password.
 * L'utente è creato dal pannello Supabase come "<nome>@account.invalid"
 * (vedi config/accesso.ts); le registrazioni sono disattivate.
 */

import { useState, type FormEvent } from 'react';
import { supabase } from '../../db/clienteSupabase';
import { nomeUtenteInEmail } from '../../domain/utenti';
import stili from './PaginaLogin.module.css';

export function PaginaLogin() {
  const [nomeUtente, setNomeUtente] = useState('');
  const [password, setPassword] = useState('');
  const [errore, setErrore] = useState<string | null>(null);
  const [inAttesa, setInAttesa] = useState(false);

  async function gestisciInvio(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault(); // impedisce al browser di ricaricare la pagina
    setErrore(null);

    const email = nomeUtenteInEmail(nomeUtente);
    if (!email) {
      setErrore('Il nome utente può contenere solo lettere, numeri, punto, trattino e trattino basso.');
      return;
    }

    setInAttesa(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setInAttesa(false);
    if (error) {
      setErrore('Accesso non riuscito: controlla nome utente e password.');
    }
    // Se l'accesso riesce non serve fare altro: useSessione se ne accorge e mostra l'app
  }

  return (
    <main className={stili.contenitore}>
      <form className={stili.modulo} onSubmit={gestisciInvio}>
        <div className={stili.decorazione} aria-hidden="true" />
        <h1 className={stili.titolo}>Finanze</h1>
        <p className={stili.sottotitolo}>Partita IVA e conti personali</p>

        <label className={stili.etichetta}>
          Nome utente
          <input
            className={stili.campo}
            type="text"
            autoComplete="username"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            required
            value={nomeUtente}
            onChange={(evento) => setNomeUtente(evento.target.value)}
          />
        </label>

        <label className={stili.etichetta}>
          Password
          <input
            className={stili.campo}
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(evento) => setPassword(evento.target.value)}
          />
        </label>

        {errore && (
          <p className={stili.errore} role="alert">
            {errore}
          </p>
        )}

        <button className={stili.bottone} type="submit" disabled={inAttesa}>
          {inAttesa ? 'Accesso in corso…' : 'Accedi'}
        </button>
      </form>
    </main>
  );
}
