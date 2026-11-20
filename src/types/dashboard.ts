/**
 * dashboard.ts
 * Tipi della pagina Riepilogo personalizzabile a widget.
 */

/** Tipi di widget disponibili (il catalogo con titoli e descrizioni è in config/catalogoWidget.ts) */
export const TIPI_WIDGET = [
  'riepilogo_anno',
  'grafico_mensile',
  'andamento_cumulato',
  'tabella_mensile',
  'totale_da_inizio',
  'grafico_annuale',
  'tabella_annuale',
] as const;

export type TipoWidget = (typeof TIPI_WIDGET)[number];

/** Un widget posizionato nella pagina; l'ordine della lista è l'ordine di visualizzazione */
export type WidgetDashboard = {
  id: string;
  tipo: TipoWidget;
};

/** Su schermo grande un widget occupa mezza riga o la riga intera */
export type LarghezzaWidget = 'mezza' | 'intera';
