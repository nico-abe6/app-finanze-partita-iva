/**
 * dashboard.ts
 * Funzioni pure per gestire l'elenco dei widget della pagina Riepilogo:
 * lettura sicura dei dati salvati, aggiunta, rimozione e spostamento.
 */

import { TIPI_WIDGET, type TipoWidget, type WidgetDashboard } from '../types/dashboard';

/** Widget mostrati la prima volta, prima che l'utente personalizzi la pagina */
export const WIDGET_PREDEFINITI: TipoWidget[] = [
  'riepilogo_anno',
  'grafico_mensile',
  'tabella_mensile',
  'tabella_annuale',
];

function eTipoWidget(valore: unknown): valore is TipoWidget {
  return typeof valore === 'string' && (TIPI_WIDGET as readonly string[]).includes(valore);
}

/**
 * Trasforma il valore letto dal database in una lista valida di widget.
 * Scarta voci malformate o di tipi non più esistenti; restituisce [] se non è una lista.
 */
export function normalizzaWidget(valore: unknown): WidgetDashboard[] {
  if (!Array.isArray(valore)) return [];
  const risultato: WidgetDashboard[] = [];
  const idVisti = new Set<string>();

  for (const voce of valore) {
    if (typeof voce !== 'object' || voce === null) continue;
    const { id, tipo } = voce as { id?: unknown; tipo?: unknown };
    if (typeof id !== 'string' || id === '' || idVisti.has(id) || !eTipoWidget(tipo)) continue;
    idVisti.add(id);
    risultato.push({ id, tipo });
  }
  return risultato;
}

/** Crea la lista predefinita usando la funzione indicata per generare gli id */
export function creaWidgetPredefiniti(generaId: () => string): WidgetDashboard[] {
  return WIDGET_PREDEFINITI.map((tipo) => ({ id: generaId(), tipo }));
}

/** Aggiunge un widget in fondo alla lista */
export function aggiungiWidget(
  lista: WidgetDashboard[],
  tipo: TipoWidget,
  generaId: () => string
): WidgetDashboard[] {
  return [...lista, { id: generaId(), tipo }];
}

/** Toglie il widget con l'id indicato */
export function rimuoviWidget(lista: WidgetDashboard[], id: string): WidgetDashboard[] {
  return lista.filter((widget) => widget.id !== id);
}

/** Sposta un widget di una posizione in su (-1) o in giù (+1); ai bordi non fa nulla */
export function spostaWidget(
  lista: WidgetDashboard[],
  id: string,
  direzione: -1 | 1
): WidgetDashboard[] {
  const posizione = lista.findIndex((widget) => widget.id === id);
  const nuovaPosizione = posizione + direzione;
  if (posizione === -1 || nuovaPosizione < 0 || nuovaPosizione >= lista.length) return lista;

  const copia = [...lista];
  [copia[posizione], copia[nuovaPosizione]] = [copia[nuovaPosizione], copia[posizione]];
  return copia;
}
