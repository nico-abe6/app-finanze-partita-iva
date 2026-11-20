/**
 * PaginaImpostazioni.tsx
 * Pagina "Impostazioni": per ora contiene solo il pulsante per uscire.
 * Le impostazioni fiscali arriveranno nella Fase 8.
 */

import { supabase } from '../../db/clienteSupabase';

export function PaginaImpostazioni() {
  return (
    <section>
      <h1>Impostazioni</h1>
      <button type="button" onClick={() => supabase.auth.signOut()}>
        Esci
      </button>
    </section>
  );
}
