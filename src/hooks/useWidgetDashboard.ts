/**
 * useWidgetDashboard.ts
 * Hook che carica, modifica e salva su Supabase l'elenco dei widget della pagina Riepilogo.
 * Se la tabella non è raggiungibile mostra i widget predefiniti e un avviso.
 */

import { useEffect, useState } from 'react';
import { leggiWidgetDashboard, salvaWidgetDashboard } from '../db/preferenzeDashboardRepository';
import { creaWidgetPredefiniti } from '../domain/dashboard';
import { messaggioDaErrore } from '../domain/messaggiErrore';
import type { WidgetDashboard } from '../types/dashboard';

/** Genera un id univoco per un nuovo widget */
export function generaIdWidget(): string {
  return crypto.randomUUID();
}

export function useWidgetDashboard() {
  const [widget, setWidget] = useState<WidgetDashboard[] | null>(null); // null = in caricamento
  const [avviso, setAvviso] = useState<string | null>(null);

  useEffect(() => {
    let annullato = false;
    leggiWidgetDashboard()
      .then((salvati) => {
        if (!annullato) setWidget(salvati ?? creaWidgetPredefiniti(generaIdWidget));
      })
      .catch((errore: unknown) => {
        if (annullato) return;
        setWidget(creaWidgetPredefiniti(generaIdWidget));
        setAvviso(
          `Disposizione dei widget non disponibile (${messaggioDaErrore(errore)}). ` +
            'Controlla di aver eseguito database/migrations/002_preferenze_dashboard.sql su Supabase.'
        );
      });
    return () => {
      annullato = true;
    };
  }, []);

  /** Applica una modifica all'elenco, la mostra subito e la salva su Supabase */
  function modificaWidget(trasforma: (lista: WidgetDashboard[]) => WidgetDashboard[]) {
    if (!widget) return;
    const nuovaLista = trasforma(widget);
    if (nuovaLista === widget) return;
    setWidget(nuovaLista);
    salvaWidgetDashboard(nuovaLista)
      .then(() => setAvviso(null))
      .catch((errore: unknown) => setAvviso(`Modifica non salvata: ${messaggioDaErrore(errore)}`));
  }

  return { widget, avviso, modificaWidget };
}
