/**
 * useSessione.ts
 * Hook React che tiene aggiornato lo stato del login Supabase.
 * Restituisce la sessione (null se non hai fatto login)
 * e "caricamento" (true finché non si sa ancora se sei collegato).
 */

import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../db/clienteSupabase';

export function useSessione() {
  const [sessione, setSessione] = useState<Session | null>(null);
  const [caricamento, setCaricamento] = useState(true);

  useEffect(() => {
    // 1. Legge la sessione già salvata su questo dispositivo (se avevi fatto login)
    supabase.auth.getSession().then(({ data }) => {
      setSessione(data.session);
      setCaricamento(false);
    });

    // 2. Resta in ascolto di login, logout e rinnovo automatico della sessione
    const { data } = supabase.auth.onAuthStateChange((_evento, nuovaSessione) => {
      setSessione(nuovaSessione);
      setCaricamento(false);
    });

    // 3. Quando il componente sparisce, smette di ascoltare
    return () => data.subscription.unsubscribe();
  }, []);

  return { sessione, caricamento };
}
