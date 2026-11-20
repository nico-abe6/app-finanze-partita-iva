/**
 * catalogoWidget.ts
 * Elenco dei widget che si possono aggiungere alla pagina Riepilogo:
 * titolo, descrizione mostrata nel catalogo, larghezza su schermo grande
 * e se dipende dall'anno scelto in cima alla pagina.
 * Per aggiungere un nuovo widget: aggiungi il tipo in types/dashboard.ts,
 * una voce qui e il componente in components/widget/registroWidget.ts.
 */

import type { LarghezzaWidget, TipoWidget } from '../types/dashboard';

export type VoceCatalogoWidget = {
  titolo: string;
  descrizione: string;
  larghezza: LarghezzaWidget;
  usaAnnoScelto: boolean;
};

export const CATALOGO_WIDGET: Record<TipoWidget, VoceCatalogoWidget> = {
  riepilogo_anno: {
    titolo: "Riepilogo dell'anno",
    descrizione: 'Incassato, imposta, INPS e netto stimato dell\'anno scelto.',
    larghezza: 'intera',
    usaAnnoScelto: true,
  },
  grafico_mensile: {
    titolo: 'Composizione mese per mese',
    descrizione: 'Colonne mensili dell\'incassato divise in netto, INPS e imposta.',
    larghezza: 'intera',
    usaAnnoScelto: true,
  },
  andamento_cumulato: {
    titolo: 'Andamento progressivo',
    descrizione: 'Incassato e netto accumulati da gennaio.',
    larghezza: 'mezza',
    usaAnnoScelto: true,
  },
  tabella_mensile: {
    titolo: 'Tabella mese per mese',
    descrizione: 'Tutti i valori dei 12 mesi con il totale dell\'anno.',
    larghezza: 'intera',
    usaAnnoScelto: true,
  },
  totale_da_inizio: {
    titolo: "Totale dall'inizio",
    descrizione: 'Somma di tutti gli anni inseriti.',
    larghezza: 'mezza',
    usaAnnoScelto: false,
  },
  grafico_annuale: {
    titolo: 'Confronto tra anni',
    descrizione: 'Incassato e netto stimato anno per anno.',
    larghezza: 'mezza',
    usaAnnoScelto: false,
  },
  tabella_annuale: {
    titolo: 'Tabella per anno',
    descrizione: 'Una riga per anno con il totale dall\'inizio.',
    larghezza: 'intera',
    usaAnnoScelto: false,
  },
};
