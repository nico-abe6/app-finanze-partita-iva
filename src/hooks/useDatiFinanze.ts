/**
 * useDatiFinanze.ts
 * Hook che carica da Supabase conti e movimenti.
 * "ricarica()" rilegge i dati; durante la ricarica restano visibili quelli precedenti.
 */

import { useCallback, useEffect, useState } from 'react';
import { leggiConti } from '../db/contiRepository';
import { leggiMovimenti } from '../db/movimentiRepository';
import { messaggioDaErrore } from '../domain/messaggiErrore';
import type { Conto, Movimento } from '../types/finanze';

export type StatoDatiFinanze =
  | { fase: 'caricamento' }
  | { fase: 'errore'; messaggio: string }
  | { fase: 'pronto'; conti: Conto[]; movimenti: Movimento[] };

export function useDatiFinanze() {
  const [stato, setStato] = useState<StatoDatiFinanze>({ fase: 'caricamento' });
  const [versione, setVersione] = useState(0);

  useEffect(() => {
    let annullato = false;
    Promise.all([leggiConti(), leggiMovimenti()])
      .then(([conti, movimenti]) => {
        if (!annullato) setStato({ fase: 'pronto', conti, movimenti });
      })
      .catch((errore: unknown) => {
        if (!annullato) setStato({ fase: 'errore', messaggio: messaggioDaErrore(errore) });
      });
    return () => {
      annullato = true;
    };
  }, [versione]);

  const ricarica = useCallback(() => setVersione((valore) => valore + 1), []);

  return { stato, ricarica };
}
