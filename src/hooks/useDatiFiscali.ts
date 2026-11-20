/**
 * useDatiFiscali.ts
 * Hook che carica da Supabase il fatturato mensile e le impostazioni fiscali.
 * "ricarica()" rilegge i dati (es. dopo un salvataggio); durante la ricarica
 * i dati precedenti restano visibili, così la pagina non "salta".
 */

import { useCallback, useEffect, useState } from 'react';
import { leggiFatturatoMensile } from '../db/fatturatoMensileRepository';
import { leggiImpostazioniFiscali } from '../db/impostazioniFiscaliRepository';
import { messaggioDaErrore } from '../domain/messaggiErrore';
import type { FatturatoMensile, ImpostazioniFiscali } from '../types/fiscale';

export type StatoDatiFiscali =
  | { fase: 'caricamento' }
  | { fase: 'errore'; messaggio: string }
  | { fase: 'pronto'; righe: FatturatoMensile[]; impostazioni: ImpostazioniFiscali };

export function useDatiFiscali() {
  const [stato, setStato] = useState<StatoDatiFiscali>({ fase: 'caricamento' });
  const [versione, setVersione] = useState(0);

  useEffect(() => {
    let annullato = false; // evita di aggiornare una pagina che nel frattempo è stata chiusa

    Promise.all([leggiFatturatoMensile(), leggiImpostazioniFiscali()])
      .then(([righe, impostazioni]) => {
        if (!annullato) setStato({ fase: 'pronto', righe, impostazioni });
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
