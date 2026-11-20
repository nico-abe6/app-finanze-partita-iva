/**
 * PaginaImpostazioni.tsx
 * Impostazioni del regime forfettario, backup dei dati e account (uscita).
 */

import { useEffect, useState } from 'react';
import { supabase } from '../../db/clienteSupabase';
import { useDatiFiscali } from '../../hooks/useDatiFiscali';
import { ModuloImpostazioniFiscali } from './ModuloImpostazioniFiscali';
import stili from './PaginaImpostazioni.module.css';
import { SezioneBackup } from './SezioneBackup';

export function PaginaImpostazioni() {
  const { stato, ricarica } = useDatiFiscali();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setEmail(data.session?.user.email ?? null));
  }, []);

  return (
    <>
      <header className="intestazione-pagina">
        <h1>Impostazioni</h1>
      </header>

      <div className={stili.sezioni}>
        <section className={stili.sezione}>
          <h2 className={stili.titoloSezione}>Regime forfettario</h2>
          {stato.fase === 'caricamento' && <p className="testo-secondario">Caricamento…</p>}
          {stato.fase === 'errore' && <p className="campo__errore">Impossibile caricare: {stato.messaggio}</p>}
          {stato.fase === 'pronto' && (
            <ModuloImpostazioniFiscali impostazioniIniziali={stato.impostazioni} onSalvate={ricarica} />
          )}
        </section>

        <section className={stili.sezione}>
          <h2 className={stili.titoloSezione}>Backup dei dati</h2>
          <SezioneBackup />
        </section>

        <section className={stili.sezione}>
          <h2 className={stili.titoloSezione}>Account</h2>
          <p className="testo-secondario">{email ? `Collegato come ${email}` : 'Collegato'}</p>
          <button type="button" className="bottone" onClick={() => supabase.auth.signOut()}>
            Esci
          </button>
        </section>
      </div>
    </>
  );
}
