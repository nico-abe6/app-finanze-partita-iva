/**
 * catalogoWidget.ts
 * Elenco dei widget che si possono aggiungere alla pagina Riepilogo:
 * titolo, descrizione mostrata nel catalogo, larghezza su schermo grande
 * e se dipende dall'anno scelto in cima alla pagina.
 * Per aggiungere un nuovo widget: aggiungi il tipo in types/dashboard.ts,
 * una voce qui e il componente in components/widget/registroWidget.ts.
 */

import type { GruppoWidget, LarghezzaWidget, TipoWidget } from '../types/dashboard';

export type VoceCatalogoWidget = {
  titolo: string;
  descrizione: string;
  larghezza: LarghezzaWidget;
  usaAnnoScelto: boolean;
  gruppo: GruppoWidget;
};

/** Titoli delle sezioni del catalogo */
export const TITOLI_GRUPPI_WIDGET: Record<GruppoWidget, string> = {
  partita_iva: 'Partita IVA',
  finanze: 'Conti e spese',
};

export const CATALOGO_WIDGET: Record<TipoWidget, VoceCatalogoWidget> = {
  riepilogo_anno: {
    titolo: "Riepilogo dell'anno",
    descrizione: 'Incassato, imposta, INPS e netto stimato dell\'anno scelto.',
    larghezza: 'intera',
    usaAnnoScelto: true,
    gruppo: 'partita_iva',
  },
  grafico_mensile: {
    titolo: 'Composizione mese per mese',
    descrizione: 'Colonne mensili dell\'incassato divise in netto, INPS e imposta.',
    larghezza: 'intera',
    usaAnnoScelto: true,
    gruppo: 'partita_iva',
  },
  andamento_cumulato: {
    titolo: 'Andamento progressivo',
    descrizione: 'Incassato e netto accumulati da gennaio.',
    larghezza: 'mezza',
    usaAnnoScelto: true,
    gruppo: 'partita_iva',
  },
  tabella_mensile: {
    titolo: 'Tabella mese per mese',
    descrizione: 'Tutti i valori dei 12 mesi con il totale dell\'anno.',
    larghezza: 'intera',
    usaAnnoScelto: true,
    gruppo: 'partita_iva',
  },
  totale_da_inizio: {
    titolo: "Totale dall'inizio",
    descrizione: 'Somma di tutti gli anni inseriti.',
    larghezza: 'mezza',
    usaAnnoScelto: false,
    gruppo: 'partita_iva',
  },
  grafico_annuale: {
    titolo: 'Confronto tra anni',
    descrizione: 'Incassato e netto stimato anno per anno.',
    larghezza: 'mezza',
    usaAnnoScelto: false,
    gruppo: 'partita_iva',
  },
  tabella_annuale: {
    titolo: 'Tabella per anno',
    descrizione: 'Una riga per anno con il totale dall\'inizio.',
    larghezza: 'intera',
    usaAnnoScelto: false,
    gruppo: 'partita_iva',
  },
  saldi_conti: {
    titolo: 'Saldi dei conti',
    descrizione: 'Saldo attuale di ogni conto e patrimonio totale.',
    larghezza: 'mezza',
    usaAnnoScelto: false,
    gruppo: 'finanze',
  },
  flussi_anno: {
    titolo: "Entrate e uscite dell'anno",
    descrizione: 'Entrate, uscite, risparmi, investimenti e tasso di risparmio.',
    larghezza: 'intera',
    usaAnnoScelto: true,
    gruppo: 'finanze',
  },
  flussi_mensili: {
    titolo: 'Entrate e uscite mese per mese',
    descrizione: 'Colonne mensili di entrate e uscite.',
    larghezza: 'intera',
    usaAnnoScelto: true,
    gruppo: 'finanze',
  },
  spese_priorita: {
    titolo: 'Spese per priorità',
    descrizione: 'Quanto hai speso per Devo, Ho bisogno e Voglio.',
    larghezza: 'mezza',
    usaAnnoScelto: true,
    gruppo: 'finanze',
  },
  spese_etichette: {
    titolo: 'Spese per etichetta',
    descrizione: 'Le etichette su cui hai speso di più.',
    larghezza: 'mezza',
    usaAnnoScelto: true,
    gruppo: 'finanze',
  },
};
